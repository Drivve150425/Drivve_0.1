import { Platform } from 'react-native';
import { API_BASE_URL } from '../config/config_ip';

/**
 * Backend confirmation result that mimics Firebase's confirmation result.
 */
class BackendConfirmationResult {
  constructor(phoneNumber, otpCode) {
    this.phoneNumber = phoneNumber;
    this.otpCode = otpCode;
    this.verificationId = 'backend-fallback';
    this.isBackendFallback = true;
  }


  async confirm(otpCode) {
    if (otpCode !== this.otpCode) {
      const error = new Error('Invalid verification code');
      error.code = 'auth/invalid-verification-code';
      throw error;
    }
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
  static _authInstance = null;

  /**
   * Get Firebase Auth instance (lazy init).
   * Uses @react-native-firebase/auth v21 API.
   */
  static getAuthInstance() {
    if (this._authInstance) return this._authInstance;
    if (Platform.OS === 'web') return null;

    // Expo Go does not support RNFirebase native modules.
    // Always return null on iOS/Android so we never load @react-native-firebase/auth.
    return null;
  }


  /**
   * Send OTP via Firebase Phone Auth (client-side).
   * Uses Firebase's infrastructure to send SMS.
   */
  static async sendOTP(phoneNumber, countryCode = '+91') {
    const fullPhoneNumber = countryCode + phoneNumber.replace(/^\+/, '');

    const authInstance = this.getAuthInstance();
    if (authInstance) {
      try {
        console.log('🔥 Firebase Phone Auth: Sending OTP to', fullPhoneNumber);

        const { signInWithPhoneNumber } = require('@react-native-firebase/auth');
        const confirmation = await signInWithPhoneNumber(authInstance, fullPhoneNumber);

        this.confirmationResult = confirmation;
        console.log('✅ Firebase Phone Auth: OTP sent via Firebase SMS (client-side)');

        return {
          success: true,
          confirmationResult: confirmation,
          phoneNumber: fullPhoneNumber,
          isBackendFlow: false,
        };
      } catch (error) {
        console.error('🚨 Firebase Phone Auth error:', error.code, error.message);
        const msg = this._mapFirebaseError(error);
        return { success: false, message: msg, error: error.code };
      }
    }

    // Web: use Firebase JS SDK
    if (Platform.OS === 'web') {
      return await this._sendOTPWeb(fullPhoneNumber);
    }

    // Fallback: Backend OTP
    return await this._sendOTPBackend(fullPhoneNumber);
  }

  /**
   * Web: Send OTP via Firebase JS SDK.
   */
  static async _sendOTPWeb(phoneNumber) {
    try {
      const { signInWithPhoneNumber, RecaptchaVerifier } = await import('firebase/auth');
      const { auth } = await import('../config/firebase');

      console.log('🌐 Web Firebase Phone Auth:', phoneNumber);

      this.cleanup();
      const container = document.getElementById('recaptcha-container') ||
        Object.assign(document.createElement('div'), { id: 'recaptcha-container', style: 'display:none' });
      if (!document.getElementById('recaptcha-container')) {
        document.body.appendChild(container);
      }

      this.recaptchaVerifier = new RecaptchaVerifier(auth, 'recaptcha-container', {
        size: 'invisible',
      });

      const confirmation = await signInWithPhoneNumber(auth, phoneNumber, this.recaptchaVerifier);
      this.confirmationResult = confirmation;

      return {
        success: true,
        confirmationResult: confirmation,
        phoneNumber,
        isBackendFlow: false,
      };
    } catch (error) {
      console.error('🚨 Web Firebase error:', error);
      return { success: false, message: error.message, error: error.code };
    }
  }

  /**
   * Backend fallback OTP.
   */
  static async _sendOTPBackend(phoneNumber) {
    try {
      console.log('📲 Backend OTP fallback:', phoneNumber);

      const response = await fetch(`${API_BASE_URL}/api/send-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone_number: phoneNumber }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Backend error ${response.status}: ${errorText}`);
      }

      const result = await response.json();
      console.log('✅ Backend OTP sent:', result);

      const mockConfirmation = new BackendConfirmationResult(phoneNumber, null);

      return {
        success: true,
        confirmationResult: mockConfirmation,
        phoneNumber,
        isBackendFlow: true,
        message: 'OTP sent via backend (Firebase unavailable)',
      };
    } catch (error) {
      console.error('🚨 Backend OTP error:', error);
      return { success: false, message: error.message };
    }
  }

  /**
   * Verify OTP.
   */
  static async verifyOTP(confirmationResultOrPhone, otpCode, isBackendFlow = false) {
    try {
      console.log('🔍 Verifying OTP:', otpCode, { isBackendFlow });

      if (isBackendFlow) {
        const phoneNumber = typeof confirmationResultOrPhone === 'string'
          ? confirmationResultOrPhone
          : confirmationResultOrPhone?.phoneNumber;
        return await this._verifyBackendOTP(phoneNumber, otpCode);
      }

      if (confirmationResultOrPhone?.confirm) {
        const result = await confirmationResultOrPhone.confirm(otpCode);
        const token = await result.user.getIdToken();

        return {
          success: true,
          user: result.user,
          token,
          uid: result.user.uid,
          phoneNumber: result.user.phoneNumber,
          isBackendFlow: false,
        };
      }

      if (confirmationResultOrPhone && !isBackendFlow) {
        const phoneNumber = confirmationResultOrPhone;
        return await this._verifyFirebaseDirect(phoneNumber, otpCode);
      }

      throw new Error('No confirmation result');
    } catch (error) {
      console.error('🚨 verifyOTP error:', error);

      return {
        success: false,
        message: error.message || 'Verification failed',
        error: error.code || 'unknown',
      };
    }
  }

  /**
   * Verify OTP via Firebase client-side confirmation.
   */
  static async _verifyFirebaseDirect(phoneNumber, otpCode) {
    const authInstance = this.getAuthInstance();
    if (!authInstance || !this.confirmationResult) {
      return await this._verifyBackendOTP(phoneNumber, otpCode);
    }

    try {
      const result = await this.confirmationResult.confirm(otpCode);
      const token = await result.user.getIdToken();

      return {
        success: true,
        user: result.user,
        token,
        uid: result.user.uid,
        phoneNumber: result.user.phoneNumber,
        isBackendFlow: false,
      };
    } catch (error) {
      return {
        success: false,
        message: this._mapFirebaseError(error),
        error: error.code,
      };
    }
  }

  /**
   * Verify OTP via backend API.
   */
  static async _verifyBackendOTP(phoneNumber, otpCode) {
    try {
      console.log('📲 Backend verifyOTP:', phoneNumber, otpCode);

      const response = await fetch(`${API_BASE_URL}/api/verify-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
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

      return {
        success: true,
        message: 'Phone verified',
        user: { uid: `backend-${Date.now()}`, phoneNumber },
        token: 'backend-token',
        uid: `backend-${Date.now()}`,
        phoneNumber,
        isBackendFlow: true,
      };
    } catch (error) {
      const err = new Error(error.message || 'Invalid OTP');
      err.code = 'auth/invalid-verification-code';
      return { success: false, message: err.message, error: err.code };
    }
  }

  /**
   * Map Firebase error codes to user-friendly messages.
   */
  static _mapFirebaseError(error) {
    const code = error.code || '';
    if (code.includes('captcha')) return 'reCAPTCHA verification failed. Check your network.';
    if (code.includes('invalid-phone-number')) return 'Invalid phone number format.';
    if (code.includes('too-many-requests')) return 'Too many attempts. Try again later.';
    if (code.includes('user-disabled')) return 'This user account has been disabled.';
    if (code.includes('quota-exceeded') || code.includes('TOO_MANY_ATTEMPTS')) {
      return 'SMS quota exceeded. Try again later or use another method.';
    }
    return error.message || 'Failed to send OTP. Please try again.';
  }

  /**
   * Cleanup reCAPTCHA verifier.
   */
  static cleanup() {
    if (this.recaptchaVerifier) {
      try {
        this.recaptchaVerifier.clear();
      } catch (e) {
        console.log('⚠️ Cleanup error:', e.message);
      }
      this.recaptchaVerifier = null;
    }
    this.confirmationResult = null;
  }

  static getCurrentUser() {
    const authInstance = this.getAuthInstance();
    return authInstance?.currentUser ?? null;
  }

  static onAuthStateChanged(callback) {
    const authInstance = this.getAuthInstance();
    if (authInstance) {
      return authInstance.onAuthStateChanged(callback);
    }
    return () => {};
  }

  static async signOut() {
    const authInstance = this.getAuthInstance();
    if (authInstance) {
      try {
        await authInstance.signOut();
        this.cleanup();
        console.log('✅ Signed out via Firebase');
        return { success: true };
      } catch (error) {
        console.error('❌ Sign out error:', error);
        return { success: false, message: error.message };
      }
    }
    return { success: true };
  }
}

export default FirebaseAuthService;
