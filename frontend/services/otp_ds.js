import { API_BASE_URL } from "../config/config_ip";
import { Platform } from 'react-native';
import * as Device from 'expo-device';

 class DatabaseService {

    async testConnection() {
    try {
      const healthUrl = `${API_BASE_URL}/health`;
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
      console.log('🔗 Using API URL:', `${API_BASE_URL}/api/users/check`);
      
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
      
      const response = await fetch(`${API_BASE_URL}/api/v1/users/check`, {
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
async verifyOtp(phone_number, otp_code) {
  try {
    const deviceName = `${Device.brand || "Unknown"} ${Device.modelName || "Device"}`;
    const deviceType = Device.deviceType === Device.DeviceType.TABLET ? "tablet" : "mobile";

    console.log("📱 Backend OTP verify:", phone_number, deviceName, deviceType);

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000);

    const res = await fetch(`${API_BASE_URL}/api/verify-otp`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify({
        phone_number,
        otp_code,
        device_name: deviceName,
        device_type: deviceType,
      }),
      signal: controller.signal
    });

    clearTimeout(timeoutId);

    if (!res.ok) {
      const errorText = await res.text();
      throw new Error(`Verify failed: ${errorText}`);
    }

    const result = await res.json();
    console.log("✅ Backend verify success:", result);
    
    return {
      ...result,
      success: true
    };
  } catch (e) {
    console.error("❌ verifyOtp error:", e);
    return {
      success: false,
      message: e.message || "Verification failed"
    };
  }
}

 }
export default new DatabaseService();