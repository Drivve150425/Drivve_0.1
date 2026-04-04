import { API_BASE_URL } from "../config/config_ip";
import { Platform } from 'react-native';

class DatabaseService {
getNetworkTimeout() {
    return Platform.OS === 'ios' ? 15000 : 10000;
  }
async getDocumentTypes() {
  try {
    console.log('📋 Fetching document types...');
    
    const response = await fetch(`${API_BASE_URL}/api/v1/documents/types`, {
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
    
    const response = await fetch(`${API_BASE_URL}/api/v1/documents/upload`, {
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
      `${API_BASE_URL}/api/v1/documents/user/${encodeURIComponent(phoneNumber)}`,
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
async deleteDocument(documentId, reason = "User requested deletion") {
  try {
    console.log('🗑️ Deleting document:', documentId);
    
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), this.getNetworkTimeout());
    
    // User can delete any of their documents (including approved ones)
    const response = await fetch(`${API_BASE_URL}/api/v1/documents/${documentId}`, {
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
}
}
export default new DatabaseService();
