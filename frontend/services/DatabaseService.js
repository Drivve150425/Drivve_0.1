/**
 * Enhanced Database Service for DRIVVE with iOS Compatibility
 */
import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const API_BASE_URL = __DEV__ 
  ? 'http://192.168.1.3:8000/api/v1' // Your working backend
  : 'https://your-api-domain.com/api/v1';

const BASE_URL = __DEV__
  ? 'http://192.168.1.3:8000' // Base URL for auth endpoints
  : 'https://your-api-domain.com';

console.log('🔗 DatabaseService API_BASE_URL:', API_BASE_URL);
console.log('🔗 DatabaseService BASE_URL:', BASE_URL);

class DatabaseService {
  
  // iOS-optimized connection test
  async testConnection() {
    try {
      const healthUrl = `${BASE_URL}/health`;
      console.log('🔍 Testing connection to:', healthUrl);
      
      // iOS-specific timeout and request configuration
      const timeoutMs = Platform.OS === 'ios' ? 15000 : 8000;
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), timeoutMs);
      
      const response = await fetch(healthUrl, {
        method: 'GET',
        headers: { 
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'Cache-Control': 'no-cache'
        },
        signal: controller.signal
      });
      
      clearTimeout(timeoutId);
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      const result = await response.json();
      console.log('✅ Health check result:', result);
      
      return {
        success: true,
        data: result
      };
    } catch (error) {
      console.error('❌ Connection test failed:', error);
      return {
        success: false,
        error: error.message || 'Connection failed'
      };
    }
  }
  
  // Enhanced user check with iOS optimizations
  async checkUserExists(phoneNumber) {
    try {
      console.log('🔍 Checking user exists for:', phoneNumber);
      console.log('🔗 Using API URL:', `${API_BASE_URL}/users/check`);
      
      // Test connection first on iOS
      if (Platform.OS === 'ios') {
        const connectionTest = await this.testConnection();
        if (!connectionTest.success) {
          console.error('❌ Backend not reachable:', connectionTest.error);
          throw new Error(`Backend unreachable: ${connectionTest.error}`);
        }
        console.log('✅ Backend is reachable, checking user...');
      }
      
      // iOS-specific timeout handling
      const timeoutMs = Platform.OS === 'ios' ? 15000 : 10000;
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), timeoutMs);
      
      const response = await fetch(`${API_BASE_URL}/users/check`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'Cache-Control': 'no-cache',
          ...(Platform.OS === 'ios' && {
            'User-Agent': 'DRIVVE-iOS/1.0'
          })
        },
        body: JSON.stringify({ phone_number: phoneNumber }),
        signal: controller.signal
      });
      
      clearTimeout(timeoutId);
      
      console.log('📡 Response status:', response.status);
      console.log('📡 Response headers:', Object.fromEntries(response.headers));
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ HTTP Error:', response.status, errorText);
        throw new Error(`HTTP ${response.status}: ${errorText}`);
      }
      
      const result = await response.json();
      console.log('✅ User check result:', result);
      
      return {
        exists: result.exists || false,
        userData: result.user_data || null
      };
    } catch (error) {
      console.error('❌ Check user error:', error);
      
      // iOS-specific error handling
      let errorMessage = error.message;
      if (Platform.OS === 'ios') {
        if (error.name === 'AbortError') {
          errorMessage = 'Request timeout. Please check your connection.';
        } else if (error.message.includes('Network request failed')) {
          errorMessage = 'Network connection failed. Please try again.';
        }
      }
      
      return { 
        exists: false, 
        userData: null,
        error: errorMessage
      };
    }
  }
  
  // Enhanced profile creation with iOS support
  async createUserProfile(profileData) {
    try {
      console.log('📝 Creating user profile for:', profileData.first_name);
      console.log('🔗 Using API URL:', `${API_BASE_URL}/users/create`);
      
      // iOS-specific timeout and retry logic
      const timeoutMs = Platform.OS === 'ios' ? 20000 : 15000;
      const maxRetries = Platform.OS === 'ios' ? 2 : 1;
      
      for (let attempt = 1; attempt <= maxRetries; attempt++) {
        try {
          const controller = new AbortController();
          const timeoutId = setTimeout(() => controller.abort(), timeoutMs);
          
          const response = await fetch(`${API_BASE_URL}/users/create`, {
            method: 'POST',
            headers: { 
              'Content-Type': 'application/json',
              'Accept': 'application/json',
              'Cache-Control': 'no-cache',
              ...(Platform.OS === 'ios' && {
                'User-Agent': 'DRIVVE-iOS/1.0'
              })
            },
            body: JSON.stringify(profileData),
            signal: controller.signal
          });
          
          clearTimeout(timeoutId);
          
          console.log('📡 Create profile response status:', response.status);
          
          if (!response.ok) {
            const errorText = await response.text();
            console.error('❌ Create profile HTTP Error:', response.status, errorText);
            
            // Retry on 5xx errors for iOS
            if (Platform.OS === 'ios' && response.status >= 500 && attempt < maxRetries) {
              console.log(`🔄 Retrying... (${attempt}/${maxRetries})`);
              await new Promise(resolve => setTimeout(resolve, 1000));
              continue;
            }
            
            throw new Error(`HTTP ${response.status}: ${errorText}`);
          }
          
          const result = await response.json();
          console.log('✅ Profile created successfully:', result);
          
          return {
            success: result.success || false,
            userId: result.user_id,
            userData: result.user_data
          };
        } catch (error) {
          if (attempt === maxRetries) {
            throw error;
          }
          console.log(`⚠️ Attempt ${attempt} failed, retrying...`);
          await new Promise(resolve => setTimeout(resolve, 1000));
        }
      }
    } catch (error) {
      console.error('❌ Create profile error:', error);
      
      // iOS-specific error messages
      let errorMessage = error.message || 'Failed to create profile';
      if (Platform.OS === 'ios') {
        if (error.name === 'AbortError') {
          errorMessage = 'Profile creation timeout. Please try again.';
        } else if (error.message.includes('Network request failed')) {
          errorMessage = 'Network error during profile creation. Please check your connection.';
        }
      }
      
      return {
        success: false,
        message: errorMessage
      };
    }
  }
  
  // Email OTP methods with iOS optimizations - FIXED
  async sendEmailOTP(email) {
    try {
      console.log('📧 Sending email OTP to:', email);
      console.log('🔗 Using API URL:', `${BASE_URL}/auth/send-email-otp`); // Added logging
      
      const timeoutMs = Platform.OS === 'ios' ? 12000 : 8000;
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), timeoutMs);
      
      // FIXED: Changed from `${API_BASE_URL}/../auth/send-email-otp` to `${BASE_URL}/auth/send-email-otp`
      const response = await fetch(`${BASE_URL}/auth/send-email-otp`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          ...(Platform.OS === 'ios' && {
            'User-Agent': 'DRIVVE-iOS/1.0'
          })
        },
        body: JSON.stringify({ email: email }),
        signal: controller.signal
      });
      
      clearTimeout(timeoutId);
      
      console.log('📧 Email OTP Response status:', response.status);
      
      const result = await response.json();
      console.log('📧 Email OTP result:', result);
      
      return {
        success: response.ok,
        message: result.message || (response.ok ? 'OTP sent' : 'Failed to send OTP')
      };
    } catch (error) {
      console.error('❌ Send email OTP error:', error);
      return { 
        success: false, 
        message: Platform.OS === 'ios' 
          ? 'Email OTP service temporarily unavailable' 
          : 'Failed to send email OTP' 
      };
    }
  }
  
  async verifyEmailOTP(email, otp) {
    try {
      console.log('📧 Verifying email OTP for:', email);
      console.log('🔗 Using API URL:', `${BASE_URL}/auth/verify-email-otp`); // Added logging
      
      const timeoutMs = Platform.OS === 'ios' ? 12000 : 8000;
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), timeoutMs);
      
      // FIXED: Changed from `${API_BASE_URL}/../auth/verify-email-otp` to `${BASE_URL}/auth/verify-email-otp`
      const response = await fetch(`${BASE_URL}/auth/verify-email-otp`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          ...(Platform.OS === 'ios' && {
            'User-Agent': 'DRIVVE-iOS/1.0'
          })
        },
        body: JSON.stringify({ email: email, otp: otp }),
        signal: controller.signal
      });
      
      clearTimeout(timeoutId);
      
      console.log('📧 Email Verify Response status:', response.status);
      
      const result = await response.json();
      console.log('📧 Email verification result:', result);
      
      return {
        success: response.ok,
        message: result.message || (response.ok ? 'Email verified' : 'Verification failed')
      };
    } catch (error) {
      console.error('❌ Email verification error:', error);
      return { 
        success: false, 
        message: Platform.OS === 'ios' 
          ? 'Email verification service temporarily unavailable' 
          : 'Email verification failed' 
      };
    }
  }
  
  // iOS-specific utility methods
  getNetworkTimeout() {
    return Platform.OS === 'ios' ? 15000 : 10000;
  }
  
  handleNetworkError(error) {
    if (Platform.OS === 'ios') {
      if (error.name === 'AbortError') {
        return 'Request timeout. Please check your connection and try again.';
      }
      if (error.message.includes('Network request failed')) {
        return 'Network connection failed. Please check your internet connection.';
      }
    }
    return error.message || 'Network error occurred';
  }
}

export default new DatabaseService();
