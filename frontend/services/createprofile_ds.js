import { API_BASE_URL } from "../config/config_ip";
print("CREATE",API_BASE_URL)

class DatabaseService {
async createUserProfile(data) {
  try {

    const response = await fetch(
      `${API_BASE_URL}/api/v1/users/create`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify(data),
      }
    );

    // ⭐ safer parsing
    let result;

    try {
      result = await response.json();
    } catch {
      throw new Error("Invalid server response");
    }

    if (!response.ok) {
      throw new Error(result?.detail || "Profile creation failed");
    }

    return result;

  } catch (error) {

    console.log("CREATE PROFILE ERROR:", error);

    return {
      success: false,
      message: error.message || "Network error",
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
