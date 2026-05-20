import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Image,
  Keyboard,
  Platform,
  Modal,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { Ionicons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import DateTimePicker from "@react-native-community/datetimepicker";
import { Colors } from "../constants/Colors";
import DatabaseService from "../services/documents_ds";
import * as Haptics from "expo-haptics";

const DocumentFormInputs = ({ 
  selectedDocType, 
  phoneNumber, 
  onUploadComplete,
  onCancel 
}) => {
  // Form state
  const [documentNumber, setDocumentNumber] = useState('');
  const [fullName, setFullName] = useState('');
  const [vehicleNumber, setVehicleNumber] = useState('');
  const [issueDate, setIssueDate] = useState(null);
  const [expiryDate, setExpiryDate] = useState(null);
  const [frontImage, setFrontImage] = useState(null);
  const [backImage, setBackImage] = useState(null);
  const [selfieImage, setSelfieImage] = useState(null);
  
  // Error state
  const [docNumberError, setDocNumberError] = useState('');
  const [fullNameError, setFullNameError] = useState('');
  const [vehicleNumberError, setVehicleNumberError] = useState('');
  const [issueDateError, setIssueDateError] = useState('');
  const [expiryDateError, setExpiryDateError] = useState('');
  const [frontImageError, setFrontImageError] = useState('');
  const [selfieImageError, setSelfieImageError] = useState('');
  
  // UI state
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [datePickerField, setDatePickerField] = useState(null);
  const [uploadProgress, setUploadProgress] = useState(false);
  const [showImageOptions, setShowImageOptions] = useState(false);
  const [currentImageField, setCurrentImageField] = useState(null);
  
  const inputRefs = {
    documentNumber: useRef(null),
    fullName: useRef(null),
    vehicleNumber: useRef(null),
  };

  // Text input handlers
  const handleDocumentNumberChange = (text) => {
    setDocumentNumber(text);
    if (docNumberError) setDocNumberError('');
  };

  const handleFullNameChange = (text) => {
    setFullName(text);
    if (fullNameError) setFullNameError('');
  };

  const handleVehicleNumberChange = (text) => {
    setVehicleNumber(text.toUpperCase());
    if (vehicleNumberError) setVehicleNumberError('');
  };

  // Validation functions
  const validateDocumentNumber = () => {
    if (!documentNumber.trim()) {
      setDocNumberError('Document number is required');
      return false;
    }
    if (selectedDocType?.type === 'aadhar' && !/^\d{12}$/.test(documentNumber)) {
      setDocNumberError('Aadhar number must be exactly 12 digits');
      return false;
    }
    if (selectedDocType?.type === 'dl' && !/^[A-Z0-9]{15,16}$/i.test(documentNumber)) {
      setDocNumberError('DL number should be 15-16 alphanumeric characters');
      return false;
    }
    if (selectedDocType?.type === 'rc' && !/^[A-Z]{2}[0-9]{1,2}[A-Z]{1,2}[0-9]{4}$/i.test(documentNumber)) {
      setDocNumberError('Invalid RC number format (e.g., MH01AB1234)');
      return false;
    }
    setDocNumberError('');
    return true;
  };

  const validateFullName = () => {
    if (!fullName.trim()) {
      setFullNameError('Full name is required');
      return false;
    }
    if (fullName.trim().length < 2) {
      setFullNameError('Name must be at least 2 characters');
      return false;
    }
    setFullNameError('');
    return true;
  };

  const validateVehicleNumber = () => {
    if (selectedDocType?.type === 'rc') {
      if (!vehicleNumber.trim()) {
        setVehicleNumberError('Vehicle number is required');
        return false;
      }
      if (!/^[A-Z]{2}[0-9]{1,2}[A-Z]{1,2}[0-9]{4}$/i.test(vehicleNumber.trim())) {
        setVehicleNumberError('Invalid vehicle number format (e.g., MH01AB1234)');
        return false;
      }
    }
    setVehicleNumberError('');
    return true;
  };

  // Image picking functions - FIXED VERSION
  const pickImage = async (type) => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission Needed', 'Gallery permission is required');
      return;
    }
    
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.7,
      base64: false,
    });
    
    console.log('Pick image result:', result);
    
    if (!result.canceled && result.assets && result.assets[0]) {
      let imageUri = result.assets[0].uri;
      
      // Fix for iOS file:// URI
      if (Platform.OS === 'ios' && imageUri.startsWith('ph://')) {
        // Convert iOS photo library URI to file URI
        const asset = result.assets[0];
        imageUri = asset.uri;
      }
      
      console.log('Selected image URI:', imageUri);
      
      if (type === 'frontImage') {
        setFrontImage(imageUri);
        setFrontImageError('');
      } else if (type === 'backImage') {
        setBackImage(imageUri);
      } else if (type === 'selfieImage') {
        setSelfieImage(imageUri);
        setSelfieImageError('');
      }
    }
    setShowImageOptions(false);
    setCurrentImageField(null);
  };

  const takePhoto = async (type) => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission Needed', 'Camera permission is required');
      return;
    }
    
    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.7,
    });
    
    console.log('Take photo result:', result);
    
    if (!result.canceled && result.assets && result.assets[0]) {
      const imageUri = result.assets[0].uri;
      console.log('Photo URI:', imageUri);
      
      if (type === 'frontImage') {
        setFrontImage(imageUri);
        setFrontImageError('');
      } else if (type === 'backImage') {
        setBackImage(imageUri);
      } else if (type === 'selfieImage') {
        setSelfieImage(imageUri);
        setSelfieImageError('');
      }
    }
    setShowImageOptions(false);
    setCurrentImageField(null);
  };

  // Helper function to create image object for FormData
  const createImageObject = (uri) => {
    if (!uri) return null;
    
    // Get filename from URI
    const filename = uri.split('/').pop();
    // Get file extension
    const match = /\.(\w+)$/.exec(filename);
    const type = match ? `image/${match[1]}` : 'image/jpeg';
    
    return {
      uri: uri,
      name: filename,
      type: type,
    };
  };

  // Form submission - FIXED VERSION
  const handleSubmit = async () => {
    // Validate all fields
    const isDocValid = validateDocumentNumber();
    const isNameValid = validateFullName();
    const isVehicleValid = validateVehicleNumber();
    
    let isDatesValid = true;
    if (selectedDocType?.type !== 'aadhar') {
      if (!issueDate) {
        setIssueDateError('Issue date is required');
        isDatesValid = false;
      } else {
        setIssueDateError('');
      }
      
      if (!expiryDate) {
        setExpiryDateError('Expiry date is required');
        isDatesValid = false;
      } else if (issueDate && expiryDate <= issueDate) {
        setExpiryDateError('Expiry date must be after issue date');
        isDatesValid = false;
      } else {
        setExpiryDateError('');
      }
    }
    
    let isImagesValid = true;
    if (!frontImage) {
      setFrontImageError('Front image is required');
      isImagesValid = false;
    } else {
      setFrontImageError('');
    }
    
    if (!selfieImage) {
      setSelfieImageError('Selfie is required');
      isImagesValid = false;
    } else {
      setSelfieImageError('');
    }
    
    if (!isDocValid || !isNameValid || !isVehicleValid || !isDatesValid || !isImagesValid) {
      Alert.alert('Validation Error', 'Please fix the errors before submitting');
      return;
    }
    
    const submitData = new FormData();
    submitData.append('phone_number', phoneNumber);
    submitData.append('document_type', selectedDocType.type);
    submitData.append('document_number', documentNumber.trim());
    submitData.append('document_name', fullName.trim());
    
    if (selectedDocType.type === 'rc' && vehicleNumber) {
      submitData.append('vehicle_number', vehicleNumber.trim().toUpperCase());
    }
    
    if (issueDate) {
      submitData.append('issue_date', issueDate.toISOString().split('T')[0]);
    }
    
    if (expiryDate) {
      submitData.append('expiry_date', expiryDate.toISOString().split('T')[0]);
    }
    
    // Append images with proper FormData structure for React Native
    if (frontImage) {
      const imageObj = createImageObject(frontImage);
      if (imageObj) {
        submitData.append('front_image', imageObj);
        console.log('Front image appended:', imageObj);
      }
    }
    
    if (backImage) {
      const imageObj = createImageObject(backImage);
      if (imageObj) {
        submitData.append('back_image', imageObj);
        console.log('Back image appended:', imageObj);
      }
    }
    
    if (selfieImage) {
      const imageObj = createImageObject(selfieImage);
      if (imageObj) {
        submitData.append('selfie_image', imageObj);
        console.log('Selfie image appended:', imageObj);
      }
    }
    
    // Log all form data for debugging
    console.log('Submitting document with:', {
      phone_number: phoneNumber,
      document_type: selectedDocType.type,
      document_number: documentNumber.trim(),
      document_name: fullName.trim(),
      frontImage: frontImage ? 'Yes' : 'No',
      backImage: backImage ? 'Yes' : 'No',
      selfieImage: selfieImage ? 'Yes' : 'No',
    });
    
    setUploadProgress(true);
    
    try {
      const result = await DatabaseService.uploadDocument(submitData);
      console.log('Upload result:', result);
      
      if (result.success) {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        Alert.alert('Success', 'Document uploaded successfully!');
        if (onUploadComplete) onUploadComplete();
      } else {
        Alert.alert('Upload Failed', result.message || 'Failed to upload document');
      }
    } catch (error) {
      console.error('Submit error:', error);
      Alert.alert('Error', error.message || 'Network error. Please try again.');
    } finally {
      setUploadProgress(false);
    }
  };

  // Image upload button component
  const ImageUploadButton = ({ title, required, error, imageValue, onPress }) => (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>
        {title} {required && <Text style={styles.required}>*</Text>}
      </Text>
      <TouchableOpacity 
        style={[styles.imageUploadBox, error && styles.imageUploadError]} 
        onPress={onPress}
        activeOpacity={0.7}
      >
        {imageValue ? (
          <Image source={{ uri: imageValue }} style={styles.uploadedImage} />
        ) : (
          <View style={styles.imageUploadPlaceholder}>
            <Ionicons name="camera" size={40} color="#9CA3AF" />
            <Text style={styles.imageUploadText}>Tap to upload</Text>
            <Text style={styles.imageUploadSubtext}>
              {required ? 'Required' : 'Optional'}
            </Text>
          </View>
        )}
      </TouchableOpacity>
      {error && <Text style={styles.errorText}>{error}</Text>}
    </View>
  );

  return (
    <ScrollView 
      style={styles.container}
      showsVerticalScrollIndicator={false}
      keyboardShouldPersistTaps="handled"
      keyboardDismissMode="interactive"
      contentContainerStyle={styles.contentContainer}
    >
      {/* Cancel Button */}
      <TouchableOpacity style={styles.cancelButton} onPress={onCancel}>
        <Text style={styles.cancelButtonText}>Cancel</Text>
      </TouchableOpacity>
      
      {/* Selfie Upload */}
      <ImageUploadButton 
        title="Selfie with Document"
        required={true}
        error={selfieImageError}
        imageValue={selfieImage}
        onPress={() => {
          Keyboard.dismiss();
          setCurrentImageField('selfieImage');
          setShowImageOptions(true);
        }}
      />
      
      {/* Document Number */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Document Number <Text style={styles.required}>*</Text></Text>
        <TextInput
          ref={inputRefs.documentNumber}
          style={[styles.input, docNumberError && styles.inputError]}
          placeholder={`Enter ${selectedDocType?.name} number`}
          placeholderTextColor="#9CA3AF"
          value={documentNumber}
          onChangeText={handleDocumentNumberChange}
          onBlur={validateDocumentNumber}
          keyboardType={selectedDocType?.type === 'aadhar' ? 'numeric' : 'default'}
          autoCapitalize="characters"
          returnKeyType="next"
          onSubmitEditing={() => inputRefs.fullName.current?.focus()}
          blurOnSubmit={false}
        />
        {docNumberError ? (
          <Text style={styles.errorText}>{docNumberError}</Text>
        ) : (
          <Text style={styles.inputHelper}>
            {selectedDocType?.type === 'aadhar' ? '12 digits without spaces' :
             selectedDocType?.type === 'dl' ? '15-16 alphanumeric characters' :
             'Format: XX99XX9999 (e.g., MH01AB1234)'}
          </Text>
        )}
      </View>
      
      {/* Full Name */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Full Name as on Document <Text style={styles.required}>*</Text></Text>
        <TextInput
          ref={inputRefs.fullName}
          style={[styles.input, fullNameError && styles.inputError]}
          placeholder="Enter your full name"
          placeholderTextColor="#9CA3AF"
          value={fullName}
          onChangeText={handleFullNameChange}
          onBlur={validateFullName}
          autoCapitalize="words"
          returnKeyType={selectedDocType?.type === 'rc' ? "next" : "done"}
          onSubmitEditing={() => {
            if (selectedDocType?.type === 'rc') {
              inputRefs.vehicleNumber.current?.focus();
            } else {
              Keyboard.dismiss();
            }
          }}
          blurOnSubmit={false}
        />
        {fullNameError && <Text style={styles.errorText}>{fullNameError}</Text>}
      </View>
      
      {/* Vehicle Number (for RC only) */}
      {selectedDocType?.type === 'rc' && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Vehicle Number <Text style={styles.required}>*</Text></Text>
          <TextInput
            ref={inputRefs.vehicleNumber}
            style={[styles.input, vehicleNumberError && styles.inputError]}
            placeholder="e.g., MH01AB1234"
            placeholderTextColor="#9CA3AF"
            value={vehicleNumber}
            onChangeText={handleVehicleNumberChange}
            onBlur={validateVehicleNumber}
            autoCapitalize="characters"
            returnKeyType="done"
            onSubmitEditing={() => Keyboard.dismiss()}
            blurOnSubmit={false}
          />
          {vehicleNumberError ? (
            <Text style={styles.errorText}>{vehicleNumberError}</Text>
          ) : (
            <Text style={styles.inputHelper}>Example: MH01AB1234 (State, District, Series, Number)</Text>
          )}
        </View>
      )}
      
      {/* Dates (for non-Aadhar) */}
      {selectedDocType?.type !== 'aadhar' && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Document Dates <Text style={styles.required}>*</Text></Text>
          <TouchableOpacity 
            style={[styles.dateButton, issueDateError && styles.inputError]} 
            onPress={() => {
              Keyboard.dismiss();
              setDatePickerField('issueDate');
              setShowDatePicker(true);
            }}
            activeOpacity={0.7}
          >
            <Ionicons name="calendar-outline" size={20} color="#6B7280" />
            <Text style={styles.dateButtonText}>
              {issueDate ? issueDate.toLocaleDateString() : 'Select Issue Date'}
            </Text>
            <Ionicons name="chevron-down" size={20} color="#6B7280" />
          </TouchableOpacity>
          {issueDateError && <Text style={styles.errorText}>{issueDateError}</Text>}
          
          <TouchableOpacity 
            style={[styles.dateButton, { marginTop: 12 }, expiryDateError && styles.inputError]} 
            onPress={() => {
              Keyboard.dismiss();
              setDatePickerField('expiryDate');
              setShowDatePicker(true);
            }}
            activeOpacity={0.7}
          >
            <Ionicons name="calendar-outline" size={20} color="#6B7280" />
            <Text style={styles.dateButtonText}>
              {expiryDate ? expiryDate.toLocaleDateString() : 'Select Expiry Date'}
            </Text>
            <Ionicons name="chevron-down" size={20} color="#6B7280" />
          </TouchableOpacity>
          {expiryDateError && <Text style={styles.errorText}>{expiryDateError}</Text>}
        </View>
      )}
      
      {/* Front Image */}
      <ImageUploadButton 
        title="Front Side of Document"
        required={true}
        error={frontImageError}
        imageValue={frontImage}
        onPress={() => {
          Keyboard.dismiss();
          setCurrentImageField('frontImage');
          setShowImageOptions(true);
        }}
      />
      
      {/* Back Image (for documents with back side) */}
      {selectedDocType?.has_back_side && (
        <ImageUploadButton 
          title="Back Side of Document"
          required={false}
          error={null}
          imageValue={backImage}
          onPress={() => {
            Keyboard.dismiss();
            setCurrentImageField('backImage');
            setShowImageOptions(true);
          }}
        />
      )}
      
      {/* Submit Button */}
      <TouchableOpacity
        style={[styles.submitBtn, uploadProgress && styles.submitBtnDisabled]}
        onPress={handleSubmit}
        disabled={uploadProgress}
        activeOpacity={0.7}
      >
        {uploadProgress ? (
          <ActivityIndicator color="white" />
        ) : (
          <>
            <Text style={styles.submitBtnText}>Upload Document</Text>
            <Ionicons name="cloud-upload" size={20} color="white" />
          </>
        )}
      </TouchableOpacity>

      {/* Image Options Modal */}
      <Modal
        transparent
        visible={showImageOptions}
        animationType="slide"
        onRequestClose={() => setShowImageOptions(false)}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setShowImageOptions(false)}
        >
          <View style={styles.bottomSheet}>
            <View style={styles.bottomSheetHandle} />
            <Text style={styles.bottomSheetTitle}>Add Photo</Text>
            
            <TouchableOpacity 
              style={styles.bottomSheetOption} 
              onPress={() => {
                takePhoto(currentImageField);
                setShowImageOptions(false);
              }}
            >
              <Text style={styles.bottomSheetOptionText}>Take Photo</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.bottomSheetOption} 
              onPress={() => {
                pickImage(currentImageField);
                setShowImageOptions(false);
              }}
            >
              <Text style={styles.bottomSheetOptionText}>Choose from Gallery</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={[styles.bottomSheetOption, styles.bottomSheetCancelOption]} 
              onPress={() => setShowImageOptions(false)}
            >
              <Text style={styles.bottomSheetCancelText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>

      {/* Date Picker */}
      {showDatePicker && (
        <DateTimePicker
          value={datePickerField === 'issueDate' ? (issueDate || new Date()) : (expiryDate || new Date())}
          mode="date"
          display={Platform.OS === 'ios' ? 'spinner' : 'default'}
          onChange={(event, date) => {
            if (date) {
              if (datePickerField === 'issueDate') {
                setIssueDate(date);
                setIssueDateError('');
              } else {
                setExpiryDate(date);
                setExpiryDateError('');
              }
            }
            setShowDatePicker(false);
            setDatePickerField(null);
          }}
        />
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  contentContainer: {
    paddingBottom: 40,
  },
  cancelButton: {
    alignSelf: 'flex-end',
    padding: 8,
    marginBottom: 16,
  },
  cancelButtonText: {
    color: '#EF4444',
    fontSize: 16,
    fontWeight: '600',
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.textPrimary,
    marginBottom: 12,
  },
  required: {
    color: '#EF4444',
  },
  input: {
    backgroundColor: 'white',
    borderWidth: 1.5,
    borderColor: '#E5E7EB',
    borderRadius: 12,
    padding: 14,
    fontSize: 16,
    color: Colors.textPrimary,
  },
  inputError: {
    borderColor: '#EF4444',
  },
  errorText: {
    fontSize: 12,
    color: '#EF4444',
    marginTop: 6,
  },
  inputHelper: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 6,
  },
  dateButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    borderWidth: 1.5,
    borderColor: '#E5E7EB',
    borderRadius: 12,
    padding: 14,
    gap: 12,
  },
  dateButtonText: {
    flex: 1,
    fontSize: 16,
    color: Colors.textPrimary,
  },
  imageUploadBox: {
    backgroundColor: 'white',
    borderWidth: 1.5,
    borderColor: '#E5E7EB',
    borderRadius: 12,
    overflow: 'hidden',
    minHeight: 180,
  },
  imageUploadError: {
    borderColor: '#EF4444',
  },
  imageUploadPlaceholder: {
    padding: 30,
    alignItems: 'center',
    gap: 12,
  },
  imageUploadText: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
  },
  imageUploadSubtext: {
    fontSize: 12,
    color: '#9CA3AF',
    textAlign: 'center',
  },
  uploadedImage: {
    width: '100%',
    height: 200,
    resizeMode: 'cover',
  },
  submitBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.primary,
    borderRadius: 12,
    padding: 16,
    marginTop: 12,
    marginBottom: 32,
    gap: 8,
  },
  submitBtnDisabled: {
    opacity: 0.6,
  },
  submitBtnText: {
    fontSize: 16,
    fontWeight: '600',
    color: 'white',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  bottomSheet: {
    backgroundColor: Colors.white,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: 20,
    paddingBottom: 30,
  },
  bottomSheetHandle: {
    width: 40,
    height: 4,
    backgroundColor: "#E5E7EB",
    borderRadius: 2,
    alignSelf: "center",
    marginTop: 12,
    marginBottom: 20,
  },
  bottomSheetTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: Colors.primary,
    textAlign: "center",
    marginBottom: 20,
  },
  bottomSheetOption: {
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#F3F4F6",
  },
  bottomSheetOptionText: {
    fontSize: 16,
    fontWeight: "500",
    color: Colors.dark,
    textAlign: "center",
  },
  bottomSheetCancelOption: {
    borderBottomWidth: 0,
    marginTop: 8,
  },
  bottomSheetCancelText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#EF4444",
    textAlign: "center",
  },
});

export default DocumentFormInputs;