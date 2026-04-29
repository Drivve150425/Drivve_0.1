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
   * Backend-first OTP (primary for APK - no WebView delays)
   */
  static async backendSendOTP(phoneNumber) {
    try {
      console.log('📲 Backend sendOTP:', phoneNumber);
      const LoginService = (await import('./loginscreen_ds')).default;
      const result = await LoginService.sendOtp(phoneNumber);
      
      if (result.success) {
        return {
          success: true,
          message: result.message,
          isBackendFlow: true,
          phoneNumber: result.phone_number,
          data: result.data
        };
      }
      throw new Error(result.message);
    } catch (error) {
      console.error('🚨 Backend sendOTP error:', error);
      return { success: false, message: error.message };
    }
  }

  /**
   * Backend OTP verification
   */
  static async backendVerifyOTP(phoneNumber, otpCode) {
    try {
      console.log('📲 Backend verifyOTP:', phoneNumber, otpCode);
      const OtpService = (await import('./otp_ds')).default;
      const result = await OtpService.verifyOtp(phoneNumber, otpCode);
      
      if (result.success) {
        return {
          success: true,
          message: 'Phone verified',
          user: { uid: `backend-${Date.now()}`, phoneNumber },
          token: 'backend-session-token',
          phoneNumber
        };
      }
      throw new Error(result.message || 'Invalid OTP');
    } catch (error) {
      console.error('🚨 Backend verifyOTP error:', error);
      return { 
        success: false, 
        message: error.message || 'Verification failed' 
      };
    }
  }

  /**
   * Unified sendOTP - Backend first (APK), Firebase web-only
   */
  static async sendOTP(phoneNumber, countryCode = '+91') {
    const fullPhoneNumber = countryCode + phoneNumber;
    
    // APK/Expo: Backend-first (no WebView delays)
    if (Platform.OS !== 'web') {
      return await this.backendSendOTP(fullPhoneNumber);
    }
    
    // Web: Firebase + reCAPTCHA (keep existing)
    console.log('🌐 Web: Firebase phone auth');
    // ... existing web Firebase code ...
    const recaptcha = this.initRecaptcha();
    if (!recaptcha) throw new Error('reCAPTCHA init failed');
    
    this.confirmationResult = await signInWithPhoneNumber(auth, fullPhoneNumber, recaptcha);
    
    return {
      success: true,
      confirmationResult: this.confirmationResult,
      verificationId: this.confirmationResult?.verificationId || null,
      isBackendFlow: false
    };
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

  /**
   * Unified verifyOTP - auto-detects flow type
   */
  static async verifyOTP(confirmationResultOrPhone, otpCode, isBackendFlow = false) {
    try {
      console.log('🔍 Verifying OTP:', otpCode, {isBackendFlow});
      
      if (isBackendFlow) {
        const phoneNumber = typeof confirmationResultOrPhone === 'string' 
          ? confirmationResultOrPhone 
          : confirmationResultOrPhone?.phoneNumber;
        return await this.backendVerifyOTP(phoneNumber, otpCode);
      }

      if (!confirmationResultOrPhone?.confirm) {
        throw new Error('No confirmation result. Use backend flow.');
      }

      const result = await confirmationResultOrPhone.confirm(otpCode);
      const token = await result.user.getIdToken();
      
      return {
        success: true,
        user: result.user,
        token,
        uid: result.user.uid,
        phoneNumber: result.user.phoneNumber,
        isBackendFlow: false
      };
    } catch (error) {
      console.error('❌ verifyOTP error:', error);
      
      const msg = error.code === 'auth/invalid-verification-code' 
        ? 'Invalid OTP. Try again.'
        : error.message || 'Verification failed';
        
      return { success: false, message: msg, error: error.code };
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
