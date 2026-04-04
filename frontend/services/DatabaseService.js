/**
 * Enhanced Database Service for DRIVVE with iOS Compatibility
 */
import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

import { API_BASE_URL } from "../config/config_ip";
print("CREATE",API_BASE_URL)


console.log('🔗 DatabaseService API_BASE_URL:', API_BASE_URL);

class DatabaseService {
  
  // iOS-optimized connection test
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
  


// DatabaseService.js

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
getNetworkTimeout() {
    return Platform.OS === 'ios' ? 15000 : 10000;
  }
async getPendingDocuments(status = 'pending', page = 1, limit = 20) {
  try {
    console.log('👁️ Fetching pending documents, status:', status, 'page:', page);
    
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), this.getNetworkTimeout());
    
    const url = new URL(`${API_BASE_URL}/api/v1/documents/pending`);
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
    
    const response = await fetch(`${API_BASE_URL}/api/v1/documents/status`, {
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
      `${API_BASE_URL}/api/v1/documents/stats?time_range=${timeRange}`,
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
    return `${API_BASE_URL}${imagePath}`;
  }
  
  // Otherwise, assume it's relative to uploads
  return `${API_BASE_URL}/api/v1/uploads/${imagePath}`;
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
      mediaTypes: ImagePicker.MediaType.Images,
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


// GET unread count (badge support)
async getUnreadNotificationCount(phone_number) {
  try {
    const res = await fetch(
      `${API_BASE_URL}/api/v1/notifications/unread-count?phone_number=${encodeURIComponent(
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

// Update live location (NO Google Maps URL)
async updateLiveLocation(payload) {
  try {
    const res = await fetch(`${API_BASE_URL}/api/v1/live-location/update`, {
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
 