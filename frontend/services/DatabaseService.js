/**
 * Enhanced Database Service for DRIVVE with iOS Compatibility
 */
import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const API_BASE_URL = __DEV__ 
? 'http://192.168.1.2:8000/api/v1' // Your working backend 
 :  'https://your-api-domain.com/api/v1'; 
const BASE_URL = __DEV__ 
? 'http://192.168.1.2:8000' // Base URL for auth endpoints 
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
 // Add inside DatabaseService class
async getUserProfile(phoneNumber) {
  try {
    if (!phoneNumber) {
      console.warn("❌ getUserProfile called without phone number");
      return null;
    }

    // 🔥 ENSURE + is preserved
    const normalizedPhone = phoneNumber.startsWith("+")
      ? phoneNumber
      : `+${phoneNumber}`;

    const url = `${API_BASE_URL}/users/profile?phone_number=${encodeURIComponent(
      normalizedPhone
    )}`;

    console.log("📡 Calling profile API:", url);

    const response = await fetch(url, {
      method: "GET",
      headers: {
        Accept: "application/json",
      },
    });

    const text = await response.text(); // 👈 CRITICAL

    if (!response.ok) {
      console.error("❌ Profile API error:", response.status, text);
      return null;
    }

    return JSON.parse(text);
  } catch (error) {
    console.error("❌ getUserProfile error:", error);
    return null;
  }
}
async updateUserProfile(data) {
  try {
    console.log("📤 Updating profile payload:", data);

    const response = await fetch(`${API_BASE_URL}/users/profile`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json", // 🔴 REQUIRED
        Accept: "application/json",
      },
      body: JSON.stringify({
        phone_number: data.phone_number, // 🔴 MUST exist
        first_name: data.first_name || null,
        last_name: data.last_name || null,
        email: data.email || null,
        gender: data.gender || null,
        date_of_birth: data.date_of_birth || null, // yyyy-mm-dd
        state: data.state || null,
        city: data.city || null,
        bio: data.bio || null,
      }),
    });

    const text = await response.text();

    if (!response.ok) {
      console.error("❌ Update profile failed:", response.status, text);
      return null;
    }

    return JSON.parse(text);
  } catch (e) {
    console.error("❌ updateUserProfile error", e);
    return null;
  }
}
async trackShare(payload) {
  try {
    const response = await fetch(
      `${API_BASE_URL}/referral/share`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify(payload),
      }
    );

    return await response.json();
  } catch (e) {
    console.error("❌ trackShare error:", e);
    return null;
  }
}
async getShareStats(phoneNumber) {
  try {
    const response = await fetch(
      `${API_BASE_URL}/referral/stats?phone_number=${encodeURIComponent(phoneNumber)}`,
      {
        method: "GET",
        headers: { Accept: "application/json" },
      }
    );

    return await response.json();
  } catch (e) {
    console.error("❌ getShareStats error", e);
    return null;
  }
}
async getAddresses(phone) {
  const res = await fetch(
    `${API_BASE_URL}/addresses?phone_number=${encodeURIComponent(phone)}`
  );
  return await res.json();
}

async saveAddress(payload) {
  const res = await fetch(`${API_BASE_URL}/addresses`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  return await res.json();
}

async updateAddress(id, payload) {
  const res = await fetch(`${API_BASE_URL}/addresses/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  return await res.json();
}

async deleteAddress(id) {
  await fetch(`${API_BASE_URL}/addresses/${id}`, { method: "DELETE" });
}


async getVehicles(phoneNumber) {
  const res = await fetch(
    `${API_BASE_URL}/vehicles?phone_number=${encodeURIComponent(phoneNumber)}`
  );
  const json = await res.json();
  return json.vehicles || [];
}

async addVehicle(formData) {
  const res = await fetch(`${API_BASE_URL}/vehicles`, {
    method: "POST",
    body: formData, // ✅ multipart
  });
  if (!res.ok) throw new Error(await res.text());
  return true;
}

async updateVehicle(id, formData) {
  const res = await fetch(`${API_BASE_URL}/vehicles/${id}`, {
    method: "PUT",
    body: formData, // ✅ multipart
  });
  if (!res.ok) throw new Error(await res.text());
  return true;
}

async deleteVehicle(id) {
  const res = await fetch(`${API_BASE_URL}/vehicles/${id}`, {
    method: "DELETE",
  });
  if (!res.ok) throw new Error(await res.text());
  return true;
}

 async getContacts(phoneNumber) {
    const res = await fetch(
      `${API_BASE_URL}/emergency-contacts?phone_number=${encodeURIComponent(phoneNumber)}`
    );
    return await res.json();
  }

  async addContact(payload) {
    const res = await fetch(`${API_BASE_URL}/emergency-contacts`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json"
      },
      body: JSON.stringify(payload)
    });
    return await res.json();
  }

  async updateContact(id, payload) {
    const res = await fetch(
      `${API_BASE_URL}/emergency-contacts/${id}`,
      {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json"
        },
        body: JSON.stringify(payload)
      }
    );
    return await res.json();
  }

  async deleteContact(id, phoneNumber) {
  const res = await fetch(
    `${API_BASE_URL}/emergency-contacts/${id}?phone_number=${encodeURIComponent(phoneNumber)}`,
    {
      method: "DELETE",
      headers: {
        Accept: "application/json",
      },
    }
  );

  return await res.json();
}

async getPromotions(phoneNumber) {
  const res = await fetch(
    `${API_BASE_URL}/promotions?phone_number=${encodeURIComponent(phoneNumber)}`
  );

  const json = await res.json();
  return json.promotions || [];
}


  async redeemPromotion(promoId) {
  try {
    const res = await fetch(`${API_BASE_URL}/promotions/redeem`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify({ promo_id: promoId }),
    });

    return await res.json();
  } catch (e) {
    console.error("❌ redeemPromotion error", e);
    return { alreadyRedeemed: true };
  }
}
async redeemPromotion(promoId, phoneNumber) {
  try {
    const res = await fetch(`${API_BASE_URL}/promotions/redeem`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify({
        promo_id: promoId,
        phone_number: phoneNumber   // ✅ HERE
      }),
    });

    return await res.json();
  } catch (e) {
    console.error("❌ redeemPromotion error", e);
    return { alreadyRedeemed: true };
  }
}


// DatabaseService.js

async redeemCoins(phoneNumber) {
  const res = await fetch(`${API_BASE_URL}/dcoins/redeem`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ phone_number: phoneNumber }),
  });
  return await res.json();
}

async getRedeemHistory(phoneNumber) {
  const res = await fetch(
    `${API_BASE_URL}/dcoins/history?phone_number=${encodeURIComponent(phoneNumber)}`
  );
  return await res.json();
}
async getRewards(phoneNumber) {
  const res = await fetch(
    `${API_BASE_URL}/rewards?phone_number=${encodeURIComponent(phoneNumber)}`
  );
  return await res.json();
}

async creditReward(phoneNumber, rewardId) {
  const res = await fetch(`${API_BASE_URL}/rewards/credit`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: JSON.stringify({
      phone_number: phoneNumber,
      reward_id: rewardId,
    }),
  });

  return await res.json();
}
async completeRide(rideBookingId) {
  try {
    console.log("🚕 Completing ride:", rideBookingId);

    const res = await fetch(`${API_BASE_URL}/rides/complete`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify({
        ride_booking_id: rideBookingId,
      }),
    });

    const json = await res.json();
    console.log("✅ Ride complete response:", json);

    return json;
  } catch (e) {
    console.error("❌ completeRide error", e);
    return null;
  }
}
// Fetch FAQ categories dynamically
async getFAQCategories() {
  try {
    const res = await fetch(`${API_BASE_URL}/support/faq-categories`);
    if (!res.ok) throw new Error(await res.text());
    return await res.json();
  } catch (e) {
    console.error("❌ getFAQCategories error:", e);
    return [];
  }
}

async getFAQs(category = null) {
  try {
    const url = category
      ? `${API_BASE_URL}/support/faqs?category=${encodeURIComponent(category)}`
      : `${API_BASE_URL}/support/faqs`;

    const res = await fetch(url, {
      method: "GET",
      headers: { Accept: "application/json" }
    });

    if (!res.ok) {
      throw new Error(await res.text());
    }

    return await res.json();
  } catch (e) {
    console.error("❌ getFAQs error:", e);
    return [];
  }
}
async sendSupportEmail(email, message) {
  try {
    const res = await fetch(`${API_BASE_URL}/support/email`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json"
      },
      body: JSON.stringify({
        email,
        message
      })
    });

    return await res.json();
  } catch (e) {
    console.error("❌ sendSupportEmail error:", e);
    return { success: false };
  }
}

// ================= ABOUT US =================
async getAboutUs() {
  try {
    const res = await fetch(`${API_BASE_URL}/about-us`, {
      method: "GET",
      headers: { Accept: "application/json" }
    });

    if (!res.ok) throw new Error(await res.text());
    return await res.json();
  } catch (e) {
    console.error("❌ getAboutUs error:", e);
    return [];
  }
}

// ================= MATCHING PREFERENCES =================

// GET MASTER (UI builder)
async getMatchingPreferenceMaster() {
  const res = await fetch(`${API_BASE_URL}/matching-preferences/master`);
  return await res.json();
}

// GET USER VALUES
async getUserMatchingPreferences(phoneNumber) {
  const res = await fetch(
    `${API_BASE_URL}/matching-preferences/user?phone_number=${encodeURIComponent(phoneNumber)}`
  );
  return await res.json();
}

// SAVE / UPDATE SINGLE PREFERENCE
async saveMatchingPreference(phoneNumber, key, value) {
  await fetch(`${API_BASE_URL}/matching-preferences/user`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json"
    },
    body: JSON.stringify({
      phone_number: phoneNumber,
      preference_key: key,
      value
    })
  });
}
// ================= DOCUMENT VERIFICATION METHODS =================

async getDocumentTypes() {
  try {
    console.log('📋 Fetching document types...');
    
    const response = await fetch(`${API_BASE_URL}/documents/types`, {
      method: 'GET',
      headers: { 
        'Accept': 'application/json',
        'Cache-Control': 'no-cache'
      },
      timeout: this.getNetworkTimeout()
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`HTTP ${response.status}: ${errorText}`);
    }
    
    const result = await response.json();
    console.log('✅ Document types fetched:', result);
    
    return result;
  } catch (error) {
    console.error('❌ Get document types error:', error);
    return { 
      success: false, 
      message: 'Failed to fetch document types. Please check your connection.',
      document_types: [
        {
          "type": "aadhar",
          "name": "Aadhar Card",
          "description": "Government issued identity card",
          "required_fields": ["document_number", "document_name"],
          "has_back_side": true,
          "icon": "id-card"
        },
        {
          "type": "dl",
          "name": "Driving License",
          "description": "Valid driving license",
          "required_fields": ["document_number", "document_name", "expiry_date"],
          "has_back_side": true,
          "icon": "car"
        },
        {
          "type": "rc",
          "name": "Registration Certificate",
          "description": "Vehicle registration certificate",
          "required_fields": ["document_number", "document_name", "vehicle_number", "expiry_date"],
          "has_back_side": false,
          "icon": "file-contract"
        }
      ]
    };
  }
}

async uploadDocument(formData) {
  try {
    console.log('📤 Uploading document...');
    console.log('🔄 FormData entries:');
    
    // Log form data for debugging
    for (let [key, value] of formData.entries()) {
      if (typeof value === 'object' && value.uri) {
        console.log(`  ${key}: [File] ${value.name || 'image'}`);
      } else {
        console.log(`  ${key}: ${value}`);
      }
    }
    
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), this.getNetworkTimeout());
    
    const response = await fetch(`${API_BASE_URL}/documents/upload`, {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        ...(Platform.OS === 'ios' && {
          'User-Agent': 'DRIVVE-iOS/1.0'
        })
      },
      body: formData,
      signal: controller.signal
    });
    
    clearTimeout(timeoutId);
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ Upload document HTTP error:', response.status, errorText);
      
      // Try to parse JSON error if available
      try {
        const errorJson = JSON.parse(errorText);
        throw new Error(errorJson.detail || `Upload failed with status ${response.status}`);
      } catch {
        throw new Error(`Upload failed: ${response.status} ${response.statusText}`);
      }
    }
    
    const result = await response.json();
    console.log('✅ Document upload response:', result);
    
    return result;
  } catch (error) {
    console.error('❌ Document upload error:', error);
    
    let errorMessage = 'Failed to upload document. Please try again.';
    
    if (error.name === 'AbortError') {
      errorMessage = 'Upload timeout. Please check your connection and try again.';
    } else if (error.message.includes('Network request failed')) {
      errorMessage = 'Network connection failed. Please check your internet connection.';
    } else if (error.message) {
      errorMessage = error.message;
    }
    
    return { 
      success: false, 
      message: errorMessage 
    };
  }
}
async getUserDocuments(phoneNumber) {
  try {
    console.log('📋 Fetching user documents for:', phoneNumber);
    
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), this.getNetworkTimeout());
    
    const response = await fetch(
      `${API_BASE_URL}/documents/user/${encodeURIComponent(phoneNumber)}`,
      {
        method: 'GET',
        headers: { 
          'Accept': 'application/json',
          'Cache-Control': 'no-cache'
        },
        signal: controller.signal
      }
    );
    
    clearTimeout(timeoutId);
    
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`HTTP ${response.status}: ${errorText}`);
    }
    
    const result = await response.json();
    console.log('✅ User documents fetched:', result.documents?.length || 0, 'documents');
    
    return result;
  } catch (error) {
    console.error('❌ Get user documents error:', error);
    return { 
      success: false, 
      message: 'Failed to fetch documents. Please check your connection.',
      documents: [],
      total: 0
    };
  }
}

async getPendingDocuments(status = 'pending', page = 1, limit = 20) {
  try {
    console.log('👁️ Fetching pending documents, status:', status, 'page:', page);
    
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), this.getNetworkTimeout());
    
    const url = new URL(`${API_BASE_URL}/documents/pending`);
    url.searchParams.append('status', status);
    url.searchParams.append('page', page.toString());
    url.searchParams.append('limit', limit.toString());
    
    const response = await fetch(url.toString(), {
      method: 'GET',
      headers: { 
        'Accept': 'application/json',
        'Cache-Control': 'no-cache'
      },
      signal: controller.signal
    });
    
    clearTimeout(timeoutId);
    
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`HTTP ${response.status}: ${errorText}`);
    }
    
    const result = await response.json();
    console.log('✅ Pending documents fetched:', result.documents?.length || 0, 'documents');
    
    // Transform image URLs to ensure they're full URLs
    if (result.success && result.documents) {
      result.documents = result.documents.map(doc => ({
        ...doc,
        front_image_url: this.getFullImageUrl(doc.front_image_url),
        back_image_url: doc.back_image_url ? this.getFullImageUrl(doc.back_image_url) : null,
        selfie_image_url: this.getFullImageUrl(doc.selfie_image_url)
      }));
    }
    
    return result;
  } catch (error) {
    console.error('❌ Get pending documents error:', error);
    return { 
      success: false, 
      message: 'Failed to fetch pending documents. Please check your connection.',
      documents: [],
      pagination: { page: 1, limit: 20, total: 0, pages: 0 }
    };
  }
}

async updateDocumentStatus(documentId, status, rejectionReason = '', adminUsername) {
  try {
    console.log('🔄 Updating document status:', documentId, status);
    
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), this.getNetworkTimeout());
    
    const response = await fetch(`${API_BASE_URL}/documents/status`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify({
        document_id: documentId,
        status: status,
        rejection_reason: rejectionReason,
        admin_username: adminUsername
      }),
      signal: controller.signal
    });
    
    clearTimeout(timeoutId);
    
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`HTTP ${response.status}: ${errorText}`);
    }
    
    const result = await response.json();
    console.log('✅ Document status update response:', result);
    
    return result;
  } catch (error) {
    console.error('❌ Update document status error:', error);
    return { 
      success: false, 
      message: 'Failed to update document status. Please check your connection.'
    };
  }
}

async getDocumentStats(timeRange = 'all') {
  try {
    console.log('📊 Fetching document stats, timeRange:', timeRange);
    
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), this.getNetworkTimeout());
    
    const response = await fetch(
      `${API_BASE_URL}/documents/stats?time_range=${timeRange}`,
      {
        method: 'GET',
        headers: { 
          'Accept': 'application/json',
          'Cache-Control': 'no-cache'
        },
        signal: controller.signal
      }
    );
    
    clearTimeout(timeoutId);
    
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`HTTP ${response.status}: ${errorText}`);
    }
    
    const result = await response.json();
    console.log('✅ Document stats fetched:', result);
    
    return result;
  } catch (error) {
    console.error('❌ Get document stats error:', error);
    return { 
      success: false, 
      message: 'Failed to fetch statistics. Please check your connection.',
      stats: { 
        total: 0, 
        pending: 0, 
        under_review: 0,
        approved: 0, 
        rejected: 0, 
        expired: 0,
        approval_rate: 0,
        rejection_rate: 0
      },
      document_type_stats: {},
      daily_stats: []
    };
  }
}

// Helper method to get full image URL
getFullImageUrl(imagePath) {
  if (!imagePath) return null;
  
  // If it's already a full URL, return it
  if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
    return imagePath;
  }
  
  // If it starts with /, prepend base URL
  if (imagePath.startsWith('/')) {
    return `${BASE_URL}${imagePath}`;
  }
  
  // Otherwise, assume it's relative to uploads
  return `${BASE_URL}/uploads/${imagePath}`;
}

// ================= IMAGE UTILITIES =================

async takePhoto(cameraType = 'front', options = {}) {
  try {
    console.log('📷 Taking photo for:', cameraType);
    
    // Dynamically import image picker
    let ImagePicker;
    try {
      ImagePicker = require('expo-image-picker');
    } catch (e) {
      console.error('❌ Expo Image Picker not available:', e);
      return { 
        success: false, 
        cancelled: true,
        error: 'Camera module not available. Please install expo-image-picker.'
      };
    }
    
    // Request camera permissions
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    
    if (status !== 'granted') {
      console.warn('⚠️ Camera permission denied');
      return { 
        success: false, 
        cancelled: true,
        error: 'Camera permission is required to take photos.'
      };
    }
    
    // Launch camera
    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.8,
      exif: false,
      base64: false,
      ...options
    });
    
    if (result.canceled) {
      console.log('📷 Photo capture cancelled');
      return { success: false, cancelled: true };
    }
    
    if (result.assets && result.assets[0]) {
      const asset = result.assets[0];
      console.log('✅ Photo captured:', {
        uri: asset.uri?.substring(0, 50) + '...',
        width: asset.width,
        height: asset.height,
        type: asset.type
      });
      
      return {
        success: true,
        cancelled: false,
        uri: asset.uri,
        width: asset.width,
        height: asset.height,
        type: asset.type || 'image',
        fileName: asset.fileName || `${cameraType}_${Date.now()}.jpg`,
        base64: asset.base64,
        exif: asset.exif
      };
    }
    
    return { success: false, cancelled: true };
    
  } catch (error) {
    console.error('❌ Take photo error:', error);
    return { 
      success: false, 
      cancelled: true,
      error: error.message || 'Failed to capture photo.'
    };
  }
}

async pickImageFromGallery(cameraType = 'front', options = {}) {
  try {
    console.log('🖼️ Picking image from gallery for:', cameraType);
    
    // Dynamically import image picker
    let ImagePicker;
    try {
      ImagePicker = require('expo-image-picker');
    } catch (e) {
      console.error('❌ Expo Image Picker not available:', e);
      return { 
        success: false, 
        cancelled: true,
        error: 'Image picker module not available. Please install expo-image-picker.'
      };
    }
    
    // Request media library permissions
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    
    if (status !== 'granted') {
      console.warn('⚠️ Media library permission denied');
      return { 
        success: false, 
        cancelled: true,
        error: 'Gallery permission is required to select photos.'
      };
    }
    
    // Launch image library
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.8,
      exif: false,
      base64: false,
      ...options
    });
    
    if (result.canceled) {
      console.log('🖼️ Image selection cancelled');
      return { success: false, cancelled: true };
    }
    
    if (result.assets && result.assets[0]) {
      const asset = result.assets[0];
      console.log('✅ Image selected:', {
        uri: asset.uri?.substring(0, 50) + '...',
        width: asset.width,
        height: asset.height,
        type: asset.type
      });
      
      return {
        success: true,
        cancelled: false,
        uri: asset.uri,
        width: asset.width,
        height: asset.height,
        type: asset.type || 'image',
        fileName: asset.fileName || `${cameraType}_${Date.now()}.jpg`,
        base64: asset.base64,
        exif: asset.exif
      };
    }
    
    return { success: false, cancelled: true };
    
  } catch (error) {
    console.error('❌ Pick image from gallery error:', error);
    return { 
      success: false, 
      cancelled: true,
      error: error.message || 'Failed to pick image from gallery.'
    };
  }
}

async captureOrPickImage(cameraType = 'front', source = 'camera', options = {}) {
  try {
    if (source === 'camera') {
      return await this.takePhoto(cameraType, options);
    } else {
      return await this.pickImageFromGallery(cameraType, options);
    }
  } catch (error) {
    console.error('❌ Capture or pick image error:', error);
    return { 
      success: false, 
      cancelled: true,
      error: error.message || 'Failed to get image.'
    };
  }
}

// Helper to create FormData for document upload
createDocumentFormData(data, images) {
  const formData = new FormData();
  
  console.log('📝 Creating form data for document upload:', {
    dataKeys: Object.keys(data),
    imageTypes: Object.keys(images)
  });
  
  // Add text fields
  Object.keys(data).forEach(key => {
    if (data[key] !== null && data[key] !== undefined) {
      formData.append(key, String(data[key]).trim());
    }
  });
  
  // Add front image
  if (images.front && images.front.uri) {
    const fileName = images.front.fileName || `front_${Date.now()}.jpg`;
    const type = images.front.type || 'image/jpeg';
    
    console.log('➕ Adding front image:', {
      fileName,
      type,
      uriLength: images.front.uri.length
    });
    
    formData.append('front_image', {
      uri: images.front.uri,
      name: fileName,
      type: type
    });
  }
  
  // Add back image if provided
  if (images.back && images.back.uri) {
    const fileName = images.back.fileName || `back_${Date.now()}.jpg`;
    const type = images.back.type || 'image/jpeg';
    
    console.log('➕ Adding back image:', {
      fileName,
      type,
      uriLength: images.back.uri.length
    });
    
    formData.append('back_image', {
      uri: images.back.uri,
      name: fileName,
      type: type
    });
  }
  
  // Add selfie image
  if (images.selfie && images.selfie.uri) {
    const fileName = images.selfie.fileName || `selfie_${Date.now()}.jpg`;
    const type = images.selfie.type || 'image/jpeg';
    
    console.log('➕ Adding selfie image:', {
      fileName,
      type,
      uriLength: images.selfie.uri.length
    });
    
    formData.append('selfie_image', {
      uri: images.selfie.uri,
      name: fileName,
      type: type
    });
  }
  
  // Log form data entries for debugging
  console.log('📋 FormData entries count:', Array.from(formData._parts).length);
  
  return formData;
}

// Validate document data before upload
validateDocumentData(data, images) {
  const errors = [];
  
  // Validate required fields
  if (!data.phone_number) errors.push('Phone number is required');
  if (!data.document_type) errors.push('Document type is required');
  if (!data.document_number) errors.push('Document number is required');
  if (!data.document_name) errors.push('Document name is required');
  
  // Validate images
  if (!images.front || !images.front.uri) {
    errors.push('Front image is required');
  }
  
  if (!images.selfie || !images.selfie.uri) {
    errors.push('Selfie image is required');
  }
  
  // Document type specific validations
  if (data.document_type === 'rc' && !data.vehicle_number) {
    errors.push('Vehicle number is required for RC');
  }
  
  if ((data.document_type === 'dl' || data.document_type === 'passport') && !data.expiry_date) {
    errors.push('Expiry date is required for Driving License and Passport');
  }
  
  return {
    isValid: errors.length === 0,
    errors: errors
  };
}

// Format document data for display
formatDocumentData(doc) {
  if (!doc) return null;
  
  return {
    id: doc.id,
    phoneNumber: doc.phone_number,
    documentType: doc.document_type,
    documentNumber: doc.document_number,
    documentName: doc.document_name,
    status: doc.status,
    frontImageUrl: this.getFullImageUrl(doc.front_image_url),
    backImageUrl: doc.back_image_url ? this.getFullImageUrl(doc.back_image_url) : null,
    selfieImageUrl: this.getFullImageUrl(doc.selfie_image_url),
    issueDate: doc.issue_date,
    expiryDate: doc.expiry_date,
    isExpired: doc.is_expired,
    submittedAt: doc.submitted_at,
    verifiedBy: doc.verified_by,
    verifiedAt: doc.verified_at,
    rejectionReason: doc.rejection_reason,
    vehicleNumber: doc.document_data?.vehicle_number,
    // Additional formatted fields
    formattedDate: doc.submitted_at ? new Date(doc.submitted_at).toLocaleDateString() : 'N/A',
    formattedStatus: doc.status ? doc.status.charAt(0).toUpperCase() + doc.status.slice(1) : 'Unknown',
    statusColor: this.getStatusColor(doc.status),
    documentIcon: this.getDocumentIcon(doc.document_type)
  };
}

// Get status color for UI
getStatusColor(status) {
  switch (status?.toLowerCase()) {
    case 'approved': return '#10B981'; // green
    case 'rejected': return '#EF4444'; // red
    case 'pending': return '#F59E0B'; // orange
    case 'under_review': return '#3B82F6'; // blue
    default: return '#6B7280'; // gray
  }
}

// Get document icon
getDocumentIcon(documentType) {
  const icons = {
    'aadhar': 'id-card',
    'dl': 'car',
    'rc': 'file-contract',
    'pan': 'credit-card',
    'passport': 'passport'
  };
  
  return icons[documentType?.toLowerCase()] || 'file-alt';
}
async deleteDocument(documentId, reason = "User requested deletion") {
  try {
    console.log('🗑️ Deleting document:', documentId);
    
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), this.getNetworkTimeout());
    
    // User can delete any of their documents (including approved ones)
    const response = await fetch(`${API_BASE_URL}/documents/${documentId}`, {
      method: 'DELETE',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        reason: reason
      }),
      signal: controller.signal
    });
    
    clearTimeout(timeoutId);
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ Delete document HTTP error:', response.status, errorText);
      
      // Try to parse JSON error if available
      try {
        const errorJson = JSON.parse(errorText);
        throw new Error(errorJson.detail || `Delete failed with status ${response.status}`);
      } catch {
        throw new Error(`Delete failed: ${response.status} ${response.statusText}`);
      }
    }
    
    const result = await response.json();
    console.log('✅ Document delete response:', result);
    
    return result;
  } catch (error) {
    console.error('❌ Delete document error:', error);
    
    let errorMessage = 'Failed to delete document. Please try again.';
    
    if (error.name === 'AbortError') {
      errorMessage = 'Delete timeout. Please check your connection and try again.';
    } else if (error.message.includes('Network request failed')) {
      errorMessage = 'Network connection failed. Please check your internet connection.';
    } else if (error.message) {
      errorMessage = error.message;
    }
    
    return { 
      success: false, 
      message: errorMessage 
    };
  }
} async getSecuritySettings(phoneNumber) {
    const res = await fetch(
      `${API_BASE_URL}/settings/security?phone_number=${encodeURIComponent(phoneNumber)}`
    );
    return await res.json();
  }

  async updateSecuritySettings(phoneNumber, contactVisibility) {
    const res = await fetch(`${API_BASE_URL}/settings/security`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        phone_number: phoneNumber,
        contact_visibility: contactVisibility
      })
    });
    return await res.json();
  }

  /* ================= NOTIFICATIONS ================= */
// ================= NOTIFICATION SETTINGS =================

// GET notification settings
async getNotificationSettings(phone_number) {
  try {
    const res = await fetch(
      `${API_BASE_URL}/settings/notifications?phone_number=${encodeURIComponent(phone_number)}`
    );
    return await res.json();
  } catch (e) {
    console.error("❌ Notification settings error", e);
    return null;
  }
}

// UPDATE notification settings
async updateNotificationSettings(phone_number, settings) {
  try {
    const res = await fetch(`${API_BASE_URL}/settings/notifications`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        phone_number,
        ...settings,
      }),
    });

    return await res.json();
  } catch (e) {
    console.error("❌ Update notifications error", e);
    return null;
  }
}


  /* ================= DEVICES ================= */

// ================= DEVICES =================
async getDevices(phone_number) {
  try {
    const res = await fetch(
      `${API_BASE_URL}/devices?phone_number=${encodeURIComponent(phone_number)}`
    );
    return await res.json();
  } catch (e) {
    console.error("❌ Device load error", e);
    return { devices: [] };
  }
}

async logoutDevice(device_id) {
  try {
    const res = await fetch(`${API_BASE_URL}/devices/${device_id}`, {
      method: "DELETE",
    });
    return await res.json();
  } catch (e) {
    console.error("❌ Logout device error", e);
    return null;
  }
}


  /* ================= BLOCKED USERS ================= */
// ================= BLOCKED USERS =================
async getBlockedUsers(phone_number) {
  try {
    const res = await fetch(
      `${API_BASE_URL}/blocked-users?phone_number=${encodeURIComponent(phone_number)}`
    );
    return await res.json();
  } catch (e) {
    console.error("❌ Blocked users load error", e);
    return { blocked_users: [] };
  }
}

async unblockUser(block_id) {
  try {
    const res = await fetch(
      `${API_BASE_URL}/blocked-users/${block_id}`,
      { method: "DELETE" }
    );
    return await res.json();
  } catch (e) {
    console.error("❌ Unblock user error", e);
    return null;
  }
}


// ================= ACCOUNT DEACTIVATION =================
async deactivateAccount(phone_number, reason = "") {
  try {
    const res = await fetch(`${API_BASE_URL}/account/deactivate`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify({
        phone_number,
        reason,
      }),
    });

    return await res.json();
  } catch (e) {
    console.error("❌ deactivateAccount error", e);
    return { success: false };
  }
}



async verifyOtp(phone_number, otp_code) {
  try {
    const deviceName = `${Device.brand || "Unknown"} ${Device.modelName || "Device"}`;
    const deviceType =
      Device.deviceType && Device.deviceType === 2 ? "tablet" : "mobile";

    console.log("📱 Sending device:", deviceName, deviceType);

    const res = await fetch(`${BASE_URL}/api/verify-otp`, {
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
    });

    return await res.json();
  } catch (e) {
    console.error("❌ verifyOtp error", e);
    return null;
  }
}

// ================= PHONE OTP =================
async sendOtp(phone_number) {
  try {
    console.log("📲 Sending OTP for:", phone_number);

    const res = await fetch(`${BASE_URL}/api/send-otp`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify({
        phone_number,
      }),
    });

    const json = await res.json();
    console.log("✅ sendOtp response:", json);

    return json;
  } catch (e) {
    console.error("❌ sendOtp error:", e);
    return null;
  }
}
// ================= FEEDBACK =================
async submitFeedback(phoneNumber, rating, reason = "") {
  try {
    console.log("⭐ Submitting feedback:", phoneNumber, rating);

    const res = await fetch(`${API_BASE_URL}/feedback`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify({
        phone_number: phoneNumber,
        rating,
        reason,
      }),
    });

    return await res.json();
  } catch (e) {
    console.error("❌ submitFeedback error", e);
    return { success: false };
  }
}
// ================= RIDE FEEDBACK =================
async submitRideFeedback(payload) {
  try {
    const res = await fetch(`${API_BASE_URL}/ride-feedback`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify(payload),
    });

    return await res.json();
  } catch (e) {
    console.error("❌ submitRideFeedback error", e);
    return { success: false };
  }
}
/* ================= USER NOTIFICATIONS ================= */

// GET user notifications
async getNotifications(phone_number, page = 1, limit = 20) {
  try {
    if (!phone_number) {
      console.warn("❌ getNotifications called without phone number");
      return { notifications: [] };
    }

    const controller = new AbortController();
    const timeoutId = setTimeout(
      () => controller.abort(),
      this.getNetworkTimeout()
    );

    const url =
      `${API_BASE_URL}/notifications` +
      `?phone_number=${encodeURIComponent(phone_number)}` +
      `&page=${page}&limit=${limit}`;

    console.log("🔔 Fetching notifications:", url);

    const res = await fetch(url, {
      method: "GET",
      headers: {
        Accept: "application/json",
        ...(Platform.OS === "ios" && {
          "User-Agent": "DRIVVE-iOS/1.0"
        })
      },
      signal: controller.signal
    });

    clearTimeout(timeoutId);

    if (!res.ok) {
      const text = await res.text();
      console.error("❌ Notifications fetch error:", res.status, text);
      throw new Error(text);
    }

    const json = await res.json();
    console.log("✅ Notifications loaded:", json.notifications?.length || 0);

    return json;
  } catch (e) {
    console.error("❌ getNotifications error:", e);
    return { notifications: [] };
  }
}

// MARK notification as read
async markNotificationRead(notification_id) {
  try {
    console.log("👁️ Marking notification read:", notification_id);

    const res = await fetch(`${API_BASE_URL}/notifications/read`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json"
      },
      body: JSON.stringify({ id: notification_id })
    });

    return await res.json();
  } catch (e) {
    console.error("❌ markNotificationRead error:", e);
    return null;
  }
}

// CLEAR all notifications
async clearNotifications(phone_number) {
  try {
    console.log("🧹 Clearing notifications for:", phone_number);

    const res = await fetch(
      `${API_BASE_URL}/notifications/clear?phone_number=${encodeURIComponent(
        phone_number
      )}`,
      { method: "POST" }
    );

    return await res.json();
  } catch (e) {
    console.error("❌ clearNotifications error:", e);
    return null;
  }
}

// GET unread count (badge support)
async getUnreadNotificationCount(phone_number) {
  try {
    const res = await fetch(
      `${API_BASE_URL}/notifications/unread-count?phone_number=${encodeURIComponent(
        phone_number
      )}`
    );

    const json = await res.json();
    return json.count || 0;
  } catch (e) {
    console.error("❌ getUnreadNotificationCount error:", e);
    return 0;
  }
}

// CREATE notification (for ride posted)
async createNotification(phoneNumber, title, message, type = "system", actionType = null, actionValue = null) {
  try {
    console.log("🔔 Creating notification for:", phoneNumber, "title:", title);
    
    const res = await fetch(`${API_BASE_URL}/notifications`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify({
        phone_number: phoneNumber,
        title: title,
        message: message,
        type: type,
        action_type: actionType,
        action_value: actionValue,
      }),
    });

    const json = await res.json();
    console.log("✅ Notification created:", json);
    return json;
  } catch (e) {
    console.error("❌ createNotification error:", e);
    return null;
  }
}
// ================= LIVE LOCATION =================

// Update live location (NO Google Maps URL)
async updateLiveLocation(payload) {
  try {
    const res = await fetch(`${API_BASE_URL}/live-location/update`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    const json = await res.json();
    return json;
  } catch (e) {
    console.error("❌ updateLiveLocation error:", e);
    return null;
  }
}

}

export default new DatabaseService();
 