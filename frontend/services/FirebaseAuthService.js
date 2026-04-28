import { 
  signInWithPhoneNumber,
  RecaptchaVerifier,
} from 'firebase/auth';
import { auth } from '../config/firebase';
import { Platform } from 'react-native';
import { API_BASE_URL } from '../config/config_ip';

// Native Firebase Auth for mobile (EAS builds)
let nativeAuth = null;
if (Platform.OS !== 'web') {
  try {
    nativeAuth = require('@react-native-firebase/auth').default;
  } catch (e) {
    console.log('⚠️ @react-native-firebase/auth not available');
  }
}

/**
 * Backend fallback confirmation result that mimics Firebase's confirmation result.
 * Used when native Firebase auth is unavailable (e.g., Expo Go).
 */
class BackendConfirmationResult {
  constructor(phoneNumber, otpCode) {
    this.phoneNumber = phoneNumber;
    this.otpCode = otpCode;
    this.verificationId = 'backend-fallback';
    this.isBackendFallback = true;
  }

  async confirm(otpCode) {
    // The actual verification happens in OTPScreen via backend API call
    // We just validate the OTP matches what was generated
    if (otpCode !== this.otpCode) {
      const error = new Error('Invalid verification code');
      error.code = 'auth/invalid-verification-code';
      throw error;
    }
    // Return a mock user object compatible with the expected result shape
    return {
      user: {
        uid: `backend-${Date.now()}`,
        phoneNumber: this.phoneNumber,
        getIdToken: async () => 'backend-token',
      }
    };
  }
}

class FirebaseAuthService {
  static recaptchaVerifier = null;
  static confirmationResult = null;

  /**
   * Send OTP using Firebase Phone Auth.
   * Mobile (Android/iOS): uses @react-native-firebase/auth (silent verification via EAS fingerprints).
   * Web: uses Firebase JS SDK with invisible reCAPTCHA.
   * Expo Go fallback: uses backend /api/send-otp.
   */
  static async sendOTP(phoneNumber, countryCode = '+91', appVerifier = null) {
    try {
      const fullPhoneNumber = countryCode + phoneNumber;
      console.log('🔥 Sending Firebase OTP to:', fullPhoneNumber);

      if (Platform.OS === 'web') {
        // Web: use invisible reCAPTCHA
        const recaptcha = this.initRecaptcha();
        if (!recaptcha) {
          throw new Error('reCAPTCHA initialization failed');
        }
        this.confirmationResult = await signInWithPhoneNumber(
          auth,
          fullPhoneNumber,
          recaptcha
        );
      } else if (nativeAuth) {
        // Mobile: use React Native Firebase (silent verification on EAS builds)
        this.confirmationResult = await nativeAuth().signInWithPhoneNumber(fullPhoneNumber);
      } else {
        // Expo Go fallback: use backend OTP
        console.log('📲 Native Firebase not available — using backend OTP fallback');
        const backendResult = await this.sendBackendOTP(fullPhoneNumber);
        if (!backendResult.success) {
          throw new Error(backendResult.message || 'Backend OTP failed');
        }
        this.confirmationResult = backendResult.confirmationResult;
      }

      console.log('✅ Firebase OTP sent successfully!');

      return {
        success: true,
        message: 'OTP sent successfully to your phone',
        confirmationResult: this.confirmationResult,
        verificationId: this.confirmationResult.verificationId || null,
      };

    } catch (error) {
      console.error('🚨 SendOTP Error:', error);
      
      let message = 'Failed to send OTP. Please try again.';
      if (error.code === 'auth/invalid-phone-number') {
        message = 'Invalid phone number format.';
      } else if (error.code === 'auth/too-many-requests') {
        message = 'Too many requests. Please try again later.';
      } else if (error.code === 'auth/captcha-check-failed') {
        message = 'Verification check failed. Please retry.';
      } else if (error.message) {
        message = error.message;
      }

      return {
        success: false,
        message,
        error: error.code,
      };
    }
  }

  /**
   * Backend OTP fallback for Expo Go or when native Firebase is unavailable.
   */
  static async sendBackendOTP(phoneNumber) {
    try {
      console.log('📲 Sending backend OTP to:', phoneNumber);

      const response = await fetch(`${API_BASE_URL}/api/send-otp`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify({ phone_number: phoneNumber }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Backend error ${response.status}: ${errorText}`);
      }

      const result = await response.json();
      console.log('✅ Backend OTP sent:', result);

      // Generate a deterministic OTP for Expo Go testing (or use backend-generated one if exposed)
      // The backend stores the OTP; we need the user to enter it manually from SMS/logs
      // For Expo Go, we'll use the backend flow where user enters the OTP and we verify via API
      const confirmationResult = new BackendConfirmationResult(phoneNumber, null);

      return {
        success: true,
        confirmationResult,
        message: 'OTP sent via backend',
      };
    } catch (error) {
      console.error('🚨 Backend OTP Error:', error);
      return {
        success: false,
        message: error.message || 'Failed to send OTP via backend',
      };
    }
  }

  // Web-only reCAPTCHA initialization
  static initRecaptcha() {
    if (Platform.OS !== 'web') return null;
    
    try {
      this.cleanup();

      if (typeof document === 'undefined') {
        console.error('❌ Document not available');
        return null;
      }

      let container = document.getElementById('recaptcha-container');
      if (!container) {
        container = document.createElement('div');
        container.id = 'recaptcha-container';
        container.style.display = 'none';
        document.body.appendChild(container);
      }

      this.recaptchaVerifier = new RecaptchaVerifier(
        auth,
        'recaptcha-container',
        {
          size: 'invisible',
          callback: (response) => {
            console.log('✅ reCAPTCHA verification successful');
          },
          'expired-callback': () => {
            console.log('⚠️ reCAPTCHA expired');
            this.cleanup();
          },
        }
      );

      return this.recaptchaVerifier;
    } catch (error) {
      console.error('❌ reCAPTCHA initialization failed:', error);
      return null;
    }
  }

  // Verify OTP
  static async verifyOTP(confirmationResult, otpCode) {
    try {
      console.log('🔍 Verifying OTP code:', otpCode);
      
      if (!confirmationResult) {
        throw new Error('No confirmation result available. Please request OTP again.');
      }

      // Backend fallback: verify via backend API instead of Firebase
      if (confirmationResult.isBackendFallback) {
        return await this.verifyBackendOTP(confirmationResult.phoneNumber, otpCode);
      }

      const result = await confirmationResult.confirm(otpCode);
      const token = await result.user.getIdToken();
      
      console.log('✅ OTP verification successful!');
      
      return {
        success: true,
        message: 'Phone number verified successfully',
        user: result.user,
        token: token,
        uid: result.user.uid,
        phoneNumber: result.user.phoneNumber,
      };

    } catch (error) {
      console.error('❌ OTP verification error:', error);
      
      let errorMessage = 'Invalid verification code';
      
      switch (error.code) {
        case 'auth/invalid-verification-code':
          errorMessage = 'Invalid verification code. Please check and try again.';
          break;
        case 'auth/code-expired':
          errorMessage = 'Verification code has expired. Please request a new OTP.';
          break;
        case 'auth/session-expired':
          errorMessage = 'Session expired. Please start over.';
          break;
        case 'auth/too-many-requests':
          errorMessage = 'Too many attempts. Please wait and try again.';
          break;
        default:
          errorMessage = error.message || 'Verification failed. Please try again.';
      }
      
      return {
        success: false,
        message: errorMessage,
        error: error.code,
      };
    }
  }

  /**
   * Verify OTP via backend API (for Expo Go fallback).
   */
  static async verifyBackendOTP(phoneNumber, otpCode) {
    try {
      console.log('📲 Verifying backend OTP for:', phoneNumber);

      const response = await fetch(`${API_BASE_URL}/api/verify-otp`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify({
          phone_number: phoneNumber,
          otp_code: otpCode,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.detail || `Backend error ${response.status}`);
      }

      const result = await response.json();
      console.log('✅ Backend OTP verified:', result);

      // Return a compatible result object
      return {
        success: true,
        message: 'Phone number verified successfully',
        user: {
          uid: `backend-${Date.now()}`,
          phoneNumber: phoneNumber,
        },
        token: 'backend-token',
        uid: `backend-${Date.now()}`,
        phoneNumber: phoneNumber,
      };
    } catch (error) {
      console.error('🚨 Backend OTP verification error:', error);
      
      const err = new Error(error.message || 'Invalid verification code');
      err.code = 'auth/invalid-verification-code';
      throw err;
    }
  }

  // Cleanup
  static cleanup() {
    if (Platform.OS === 'web' && this.recaptchaVerifier) {
      try {
        this.recaptchaVerifier.clear();
      } catch (error) {
        console.log('⚠️ Cleanup error:', error);
      }
      this.recaptchaVerifier = null;
    }
    this.confirmationResult = null;
  }

  // Auth state methods
  static getCurrentUser() {
    return auth.currentUser;
  }

  static onAuthStateChanged(callback) {
    return auth.onAuthStateChanged(callback);
  }

  static async signOut() {
    try {
      await auth.signOut();
      this.cleanup();
      console.log('✅ User signed out successfully');
      return { success: true, message: 'Signed out successfully' };
    } catch (error) {
      console.error('❌ Sign out error:', error);
      return { success: false, message: 'Failed to sign out' };
    }
  }
}

export default FirebaseAuthService;
