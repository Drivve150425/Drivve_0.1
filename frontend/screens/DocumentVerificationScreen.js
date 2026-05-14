import React, { useState, useEffect, useCallback, useRef, memo } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  StatusBar,
  Image,
  TextInput,
  Modal,
  Dimensions,
  Platform,
  TouchableOpacity,
  RefreshControl,
  Keyboard,
  ActionSheetIOS,
  KeyboardAvoidingView,
  ActivityIndicator
} from "react-native";
import { Ionicons, MaterialIcons, FontAwesome5 } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import { Colors, Typography } from "../constants/Colors";
import DatabaseService from "../services/documents_ds";
import DateTimePicker from "@react-native-community/datetimepicker";
import * as Haptics from "expo-haptics";
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from "../context/AuthContext";
import LottieView from "lottie-react-native";

const { width, height } = Dimensions.get("window");

// Custom Alert Component - Centered
const CustomAlert = ({ visible, title, message, type, onClose }) => {
  const getIcon = () => {
    switch(type) {
      case 'success': return 'checkmark-circle';
      case 'error': return 'alert-circle';
      case 'warning': return 'warning';
      default: return 'information-circle';
    }
  };
  
  const getColor = () => {
    switch(type) {
      case 'success': return '#10B981';
      case 'error': return '#EF4444';
      case 'warning': return '#F59E0B';
      default: return Colors.primary;
    }
  };
  
  return (
    <Modal visible={visible} transparent animationType="fade">
      <View style={styles.alertOverlay}>
        <TouchableOpacity style={styles.alertBackdrop} activeOpacity={1} onPress={onClose} />
        <View style={styles.alertContainer}>
          <View style={[styles.alertIconContainer, { backgroundColor: getColor() + '15' }]}>
            <Ionicons name={getIcon()} size={50} color={getColor()} />
          </View>
          <Text style={styles.alertTitle}>{title}</Text>
          <Text style={styles.alertMessage}>{message}</Text>
          <TouchableOpacity style={[styles.alertButton, { backgroundColor: getColor() }]} onPress={onClose}>
            <Text style={styles.alertButtonText}>OK</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

// Helper function to get document-specific labels
const getDocumentLabels = (docType) => {
  switch(docType) {
    case 'aadhar':
      return {
        documentNumber: 'Aadhar Number',
        documentNumberPlaceholder: 'Enter 12-digit Aadhar number',
        documentNumberHelper: '12 digits without spaces',
        frontImage: 'Front Side of Aadhar Card',
        backImage: 'Back Side of Aadhar Card',
        selfie: 'Selfie with Aadhar Card',
        name: 'Name as on Aadhar Card',
      };
    case 'dl':
      return {
        documentNumber: 'Driving License Number',
        documentNumberPlaceholder: 'Enter DL number',
        documentNumberHelper: '15-16 alphanumeric characters',
        frontImage: 'Front Side of Driving License',
        backImage:null,
        selfie: 'Selfie with Driving License',
        name: 'Name as on Driving License',
      };
    case 'rc':
      return {
        documentNumber: 'RC Number',
        documentNumberPlaceholder: 'Enter RC number',
        documentNumberHelper: 'Format: MH01AB1234',
        frontImage: 'Front Side of RC',
        backImage: null,
        selfie: 'Selfie with RC',
        name: 'Name as on RC',
        vehicleNumber:null,
        vehicleNumberPlaceholder: 'e.g., MH01AB1234',
        vehicleNumberHelper: 'Example: MH01AB1234 (State, District, Series, Number)',
      };
    default:
      return {
        documentNumber: 'Document Number',
        documentNumberPlaceholder: 'Enter document number',
        documentNumberHelper: '',
        frontImage: 'Front Side of Document',
        backImage: 'Back Side of Document',
        selfie: 'Selfie with Document',
        name: 'Name as on Document',
      };
  }
};

// SEPARATE MEMOIZED UPLOAD FORM COMPONENT
const UploadFormComponent = memo(({ 
  documentTypes, 
  selectedDocType, 
  onSelectDocType,
  onCancelSelection,
  phoneNumber,
  onUploadSuccess,
  existingDocuments,
  showCustomAlert
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
  const [backImageError, setBackImageError] = useState('');
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

  // Get document-specific labels
  const labels = selectedDocType ? getDocumentLabels(selectedDocType.type) : null;

  // Text input handlers
  const handleDocumentNumberChange = (text) => {
    if (selectedDocType?.type === 'aadhar') {
      const cleaned = text.replace(/[^0-9]/g, '');
      if (cleaned.length <= 12) {
        setDocumentNumber(cleaned);
      }
    } else {
      setDocumentNumber(text);
    }
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
      setDocNumberError(`${labels?.documentNumber || 'Document number'} is required`);
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
      setFullNameError(`${labels?.name || 'Full name'} is required`);
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
      // if (!vehicleNumber.trim()) {
      //   setVehicleNumberError('Vehicle number is required');
      //   return false;
      // }
      // if (!/^[A-Z]{2}[0-9]{1,2}[A-Z]{1,2}[0-9]{4}$/i.test(vehicleNumber.trim())) {
      //   setVehicleNumberError('Invalid vehicle number format (e.g., MH01AB1234)');
      //   return false;
      // }
    }
    setVehicleNumberError('');
    return true;
  };

  const pickImage = async (type) => {
    if (type === 'selfieImage') {
      setShowImageOptions(false);
      setCurrentImageField(null);
      
      const { status } = await ImagePicker.requestCameraPermissionsAsync();
      if (status !== 'granted') {
        showCustomAlert('Permission Needed', 'Camera permission is required to take a selfie', 'error');
        return;
      }
      
      const result = await ImagePicker.launchCameraAsync({
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.7,
      });
      
      if (!result.canceled && result.assets && result.assets[0]) {
        const imageUri = result.assets[0].uri;
        setSelfieImage(imageUri);
        setSelfieImageError('');
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      }
      return;
    }
    
    setShowImageOptions(false);
    setCurrentImageField(null);
    
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      showCustomAlert('Permission Needed', 'Gallery permission is required', 'error');
      return;
    }
    
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.7,
    });
    
    if (!result.canceled && result.assets && result.assets[0]) {
      const imageUri = result.assets[0].uri;
      
      if (type === 'frontImage') {
        setFrontImage(imageUri);
        setFrontImageError('');
      } else if (type === 'backImage') {
        setBackImage(imageUri);
        setBackImageError('');
      }
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
  };

  const takePhoto = async (type) => {
    setShowImageOptions(false);
    setCurrentImageField(null);
    
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') {
      showCustomAlert('Permission Needed', 'Camera permission is required', 'error');
      return;
    }
    
    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.7,
    });
    
    if (!result.canceled && result.assets && result.assets[0]) {
      const imageUri = result.assets[0].uri;
      
      if (type === 'frontImage') {
        setFrontImage(imageUri);
        setFrontImageError('');
      } else if (type === 'backImage') {
        setBackImage(imageUri);
        setBackImageError('');
      } else if (type === 'selfieImage') {
        setSelfieImage(imageUri);
        setSelfieImageError('');
      }
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
  };

  const handleImagePress = (fieldName) => {
    Keyboard.dismiss();
    setCurrentImageField(fieldName);
    
    if (Platform.OS === 'ios') {
      let options = ['Cancel', 'Take Photo'];
      if (fieldName !== 'selfieImage') {
        options.push('Choose from Gallery');
      }
      
      ActionSheetIOS.showActionSheetWithOptions(
        {
          options: options,
          cancelButtonIndex: 0,
        },
        (buttonIndex) => {
          if (buttonIndex === 1) {
            takePhoto(fieldName);
          } else if (buttonIndex === 2 && fieldName !== 'selfieImage') {
            pickImage(fieldName);
          }
        }
      );
    } else {
      setShowImageOptions(true);
    }
  };

  const validateForm = () => {
    // Check selfie first
    if (!selfieImage) {
      showCustomAlert('Validation Error', `Please upload ${labels?.selfie || 'your selfie'} first`, 'warning');
      setSelfieImageError(`${labels?.selfie || 'Selfie'} is required`);
      return false;
    }
    
    // Then check document number
    const isDocValid = validateDocumentNumber();
    if (!isDocValid) {
      if (docNumberError) {
        showCustomAlert('Validation Error', docNumberError, 'warning');
      }
      return false;
    }
    
    // Then check full name
    const isNameValid = validateFullName();
    if (!isNameValid) {
      if (fullNameError) {
        showCustomAlert('Validation Error', fullNameError, 'warning');
      }
      return false;
    }
    
    // Then check vehicle number for RC
    const isVehicleValid = validateVehicleNumber();
    if (!isVehicleValid) {
      if (vehicleNumberError) {
        showCustomAlert('Validation Error', vehicleNumberError, 'warning');
      }
      return false;
    }
    
    // Aadhar/DL back side required
    if ((selectedDocType?.type === 'aadhar') && !backImage) {
      const docName = selectedDocType?.type === 'aadhar' ? 'Aadhar' : 'Driving License';
      setBackImageError(`${labels?.backImage} is required`);
      showCustomAlert('Validation Error', `Please upload ${labels?.backImage}`, 'warning');
      return false;
    }
    
    // Then check dates for non-Aadhar
   // Then check dates for non-Aadhar
let isDatesValid = true;
if (selectedDocType?.type !== 'aadhar') {
  if (!issueDate) {
    showCustomAlert('Validation Error', 'Please select issue date', 'warning');
    setIssueDateError('Issue date is required');
    isDatesValid = false;
  } else {
    // Check if issue date is in the future
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    if (issueDate > today) {
      showCustomAlert('Validation Error', 'Issue date cannot be in the future', 'warning');
      setIssueDateError('Issue date cannot be in the future');
      isDatesValid = false;
    } else {
      setIssueDateError('');
    }
  }
  
  if (!expiryDate) {
    showCustomAlert('Validation Error', 'Please select expiry date', 'warning');
    setExpiryDateError('Expiry date is required');
    isDatesValid = false;
  } else if (issueDate && expiryDate <= issueDate) {
    showCustomAlert('Validation Error', 'Expiry date must be after issue date', 'warning');
    setExpiryDateError('Expiry date must be after issue date');
    isDatesValid = false;
  } else {
    setExpiryDateError('');
  }
  
  if (!isDatesValid) return false;
}
    
    // Finally check front image
    if (!frontImage) {
      showCustomAlert('Validation Error', `Please upload ${labels?.frontImage}`, 'warning');
      setFrontImageError(`${labels?.frontImage} is required`);
      return false;
    }
    
    return true;
  };

  const handleSubmit = async () => {
    if (!selectedDocType) {
      showCustomAlert('Error', 'Please select a document type', 'error');
      return;
    }
    
    if (!validateForm()) {
      return;
    }
    
    const submitData = new FormData();
    submitData.append('phone_number', phoneNumber);
    submitData.append('document_type', selectedDocType.type.toUpperCase());
    submitData.append('document_number', documentNumber.trim());
    submitData.append('document_name', fullName.trim());
    
    // if (selectedDocType.type === 'rc' && vehicleNumber) {
    //   submitData.append('vehicle_number', vehicleNumber.trim().toUpperCase());
    // }
    
    if (selectedDocType.type === 'aadhar') {
      submitData.append('issue_date', '');
      submitData.append('expiry_date', '');
    } else {
      if (issueDate) {
        submitData.append('issue_date', issueDate.toISOString().split('T')[0]);
      }
      if (expiryDate) {
        submitData.append('expiry_date', expiryDate.toISOString().split('T')[0]);
      }
    }
    
    if (frontImage) {
      const imageUri = frontImage;
      const filename = imageUri.split('/').pop();
      const match = /\.(\w+)$/.exec(filename);
      const type = match ? `image/${match[1]}` : 'image/jpeg';
      
      submitData.append('front_image', {
        uri: imageUri,
        name: `front_${Date.now()}.jpg`,
        type: type,
      });
    }
    
    if (backImage) {
      const imageUri = backImage;
      const filename = imageUri.split('/').pop();
      const match = /\.(\w+)$/.exec(filename);
      const type = match ? `image/${match[1]}` : 'image/jpeg';
      
      submitData.append('back_image', {
        uri: imageUri,
        name: `back_${Date.now()}.jpg`,
        type: type,
      });
    }
    
    if (selfieImage) {
      const imageUri = selfieImage;
      const filename = imageUri.split('/').pop();
      const match = /\.(\w+)$/.exec(filename);
      const type = match ? `image/${match[1]}` : 'image/jpeg';
      
      submitData.append('selfie_image', {
        uri: imageUri,
        name: `selfie_${Date.now()}.jpg`,
        type: type,
      });
    }
    
    setUploadProgress(true);
    
    try {
      const result = await DatabaseService.uploadDocument(submitData);
      
      if (result.success) {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        showCustomAlert('Success', 'Document uploaded successfully! It will be verified within 24-48 hours.', 'success');
        // Reset local form state
        setDocumentNumber('');
        setFullName('');
        setVehicleNumber('');
        setIssueDate(null);
        setExpiryDate(null);
        setFrontImage(null);
        setBackImage(null);
        setSelfieImage(null);
        setDocNumberError('');
        setFullNameError('');
        setVehicleNumberError('');
        setIssueDateError('');
        setExpiryDateError('');
        setFrontImageError('');
        setSelfieImageError('');
        setBackImageError('');
        if (onUploadSuccess) onUploadSuccess();
      } else {
        if (result.message && (result.message.includes('duplicate key') || result.message.includes('already exists'))) {
          showCustomAlert(
            'Duplicate Document',
            `Document number ${documentNumber} already exists in our system. Please check and try again.`,
            'error'
          );
        } else {
          showCustomAlert('Upload Failed', result.message || 'Failed to upload document. Please try again.', 'error');
        }
      }
    } catch (error) {
      console.error('Submit error:', error);
      showCustomAlert('Error', 'Network error. Please check your connection and try again.', 'error');
    } finally {
      setUploadProgress(false);
    }
  };

  const DocumentTypeCard = ({ type }) => {
    const existingDoc = existingDocuments?.find(d => d.document_type === type.type);
    let isDisabled = false;
    
    if (existingDoc) {
      if (existingDoc.status === 'approved') {
        isDisabled = true;
      } else if (existingDoc.status === 'pending') {
        isDisabled = true;
      } else if (existingDoc.status === 'rejected') {
        isDisabled = false;
      }
    }
    
    const getStatusColor = (status) => {
      switch(status) {
        case 'approved': return '#10B981';
        case 'pending': return '#F59E0B';
        case 'rejected': return '#EF4444';
        default: return '#6B7280';
      }
    };
    
    const getStatusIcon = (status) => {
      switch(status) {
        case 'approved': return 'checkmark-circle';
        case 'pending': return 'time';
        case 'rejected': return 'close-circle';
        default: return 'document-text';
      }
    };
    
    return (
      <TouchableOpacity
        style={[
          styles.typeCard,
          selectedDocType?.type === type.type && styles.typeCardSelected,
          isDisabled && existingDoc?.status === 'approved' && styles.typeCardDisabled,
          existingDoc?.status === 'pending' && styles.typeCardPending,
        ]}
        onPress={() => onSelectDocType(type)}
        disabled={isDisabled && existingDoc?.status !== 'rejected'}
        activeOpacity={0.7}
      >
        <View style={styles.typeIcon}>
          <FontAwesome5 name={type.type === 'aadhar' ? 'id-card' : 'file-alt'} size={28} color={selectedDocType?.type === type.type ? Colors.primary : '#6B7280'} />
        </View>
        <Text style={[styles.typeName, selectedDocType?.type === type.type && styles.typeNameSelected]}>{type.name}</Text>
        {existingDoc && (
          <View style={[styles.typeBadge, { backgroundColor: getStatusColor(existingDoc.status) }]}>
            <Ionicons name={getStatusIcon(existingDoc.status)} size={12} color="white" />
            <Text style={styles.typeBadgeText}>
              {existingDoc.status === 'rejected' ? 'Reupload' : existingDoc.status}
            </Text>
          </View>
        )}
      </TouchableOpacity>
    );
  };

  if (!selectedDocType) {
    return (
      <ScrollView 
        style={styles.formContainer}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.formContentContainer}
      >
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Select Document Type <Text style={styles.required}>*</Text></Text>
          <View style={styles.typeGrid}>
            {documentTypes.map(type => (
              <DocumentTypeCard key={type.type} type={type} />
            ))}
          </View>
        </View>
      </ScrollView>
    );
  }

  return (
    <ScrollView 
      style={styles.formContainer}
      showsVerticalScrollIndicator={false}
      keyboardShouldPersistTaps="handled"
      keyboardDismissMode="interactive"
      contentContainerStyle={styles.formContentContainer}
      nestedScrollEnabled={true}
    >
      {/* Cancel Selection Button */}
      <TouchableOpacity style={styles.cancelSelectionBtn} onPress={onCancelSelection}>
        <Text style={styles.cancelSelectionText}>← Change Document Type</Text>
      </TouchableOpacity>

      {/* Selected Document Type Header */}
      <View style={styles.selectedDocHeader}>
        <FontAwesome5 name={selectedDocType.type === 'aadhar' ? 'id-card' : 'file-alt'} size={24} color={Colors.primary} />
        <Text style={styles.selectedDocHeaderText}>Uploading: {selectedDocType.name}</Text>
      </View>
      
      {/* Selfie Upload - Camera Only */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>{labels?.selfie} <Text style={styles.required}>*</Text></Text>
        <TouchableOpacity 
          style={[styles.imageUploadBox, selfieImageError && styles.imageUploadError]} 
          onPress={() => handleImagePress('selfieImage')}
          activeOpacity={0.7}
        >
          {selfieImage ? (
            <Image source={{ uri: selfieImage }} style={styles.uploadedImage} />
          ) : (
            <View style={styles.imageUploadPlaceholder}>
              <Ionicons name="camera" size={40} color="#9CA3AF" />
              <Text style={styles.imageUploadText}>Tap to take selfie</Text>
              <Text style={styles.imageUploadSubtext}>Required for verification</Text>
            </View>
          )}
        </TouchableOpacity>
        {selfieImageError ? (
          <Text style={styles.errorText}>{selfieImageError}</Text>
        ) : (
          <Text style={styles.inputHelper}>Take a selfie holding your {selectedDocType.name}</Text>
        )}
      </View>
      
      {/* Document Number */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>{labels?.documentNumber} <Text style={styles.required}>*</Text></Text>
        <TextInput
          ref={inputRefs.documentNumber}
          style={[styles.input, docNumberError && styles.inputError]}
          placeholder={labels?.documentNumberPlaceholder}
          placeholderTextColor="#9CA3AF"
          value={documentNumber}
          onChangeText={handleDocumentNumberChange}
          onBlur={validateDocumentNumber}
          keyboardType={selectedDocType.type === 'aadhar' ? 'numeric' : 'default'}
          autoCapitalize="characters"
          returnKeyType="next"
          onSubmitEditing={() => inputRefs.fullName.current?.focus()}
          blurOnSubmit={false}
          maxLength={selectedDocType.type === 'aadhar' ? 12 : undefined}
        />
        {docNumberError ? (
          <Text style={styles.errorText}>{docNumberError}</Text>
        ) : (
          <Text style={styles.inputHelper}>{labels?.documentNumberHelper}</Text>
        )}
      </View>
      
      {/* Full Name */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>{labels?.name} <Text style={styles.required}>*</Text></Text>
        <TextInput
          ref={inputRefs.fullName}
          style={[styles.input, fullNameError && styles.inputError]}
          placeholder={`Enter ${labels?.name?.toLowerCase() || 'full name'}`}
          placeholderTextColor="#9CA3AF"
          value={fullName}
          onChangeText={handleFullNameChange}
          onBlur={validateFullName}
          autoCapitalize="words"
          returnKeyType={selectedDocType.type === 'rc' ? "next" : "done"}
          onSubmitEditing={() => {
            if (selectedDocType.type === 'rc') {
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
      {/* {selectedDocType.type === 'rc' && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{labels?.vehicleNumber} <Text style={styles.required}>*</Text></Text>
          <TextInput
            ref={inputRefs.vehicleNumber}
            style={[styles.input, vehicleNumberError && styles.inputError]}
            placeholder={labels?.vehicleNumberPlaceholder}
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
            <Text style={styles.inputHelper}>{labels?.vehicleNumberHelper}</Text>
          )}
        </View>
      )} */}
      
      {/* Dates (for non-Aadhar) */}
      {selectedDocType.type !== 'aadhar' && (
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
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>{labels?.frontImage} <Text style={styles.required}>*</Text></Text>
        <TouchableOpacity 
          style={[styles.imageUploadBox, frontImageError && styles.imageUploadError]} 
          onPress={() => handleImagePress('frontImage')}
          activeOpacity={0.7}
        >
          {frontImage ? (
            <Image source={{ uri: frontImage }} style={styles.uploadedImage} />
          ) : (
            <View style={styles.imageUploadPlaceholder}>
              <Ionicons name="document-text" size={40} color="#9CA3AF" />
              <Text style={styles.imageUploadText}>Tap to upload {labels?.frontImage?.toLowerCase()}</Text>
              <Text style={styles.imageUploadSubtext}>Clear photo required</Text>
            </View>
          )}
        </TouchableOpacity>
        {frontImageError && <Text style={styles.errorText}>{frontImageError}</Text>}
        <Text style={styles.inputHelper}>Take a clear photo of {labels?.frontImage?.toLowerCase()}</Text>
      </View>
      
      {/* Back Image (for documents with back side) */}
      {/* Back Image (only for Aadhar) */}
{selectedDocType.type === 'aadhar' && (
  <View style={styles.section}>
    <Text style={styles.sectionTitle}>
      {labels?.backImage} <Text style={styles.required}> *</Text>
    </Text>
    <TouchableOpacity 
      style={[styles.imageUploadBox, backImageError && styles.imageUploadError]} 
      onPress={() => handleImagePress('backImage')}
      activeOpacity={0.7}
    >
      {backImage ? (
        <Image source={{ uri: backImage }} style={styles.uploadedImage} />
      ) : (
        <View style={styles.imageUploadPlaceholder}>
          <Ionicons name="document-text" size={40} color="#9CA3AF" />
          <Text style={styles.imageUploadText}>Tap to upload {labels?.backImage?.toLowerCase()}</Text>
          <Text style={styles.imageUploadSubtext}>Required for Aadhar card verification</Text>
        </View>
      )}
    </TouchableOpacity>
    {backImageError && <Text style={styles.errorText}>{backImageError}</Text>}
    <Text style={styles.inputHelper}>{labels?.backImage} is required for verification</Text>
  </View>
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
            <Text style={styles.submitBtnText}>Upload {selectedDocType.name}</Text>
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
        <View style={styles.modalOverlayFullCentered}>
          <TouchableOpacity 
            style={styles.modalBackdropCentered} 
            activeOpacity={1} 
            onPress={() => setShowImageOptions(false)} 
          />
          <View style={styles.bottomSheet}>
            <View style={styles.bottomSheetHandle} />
            <Text style={styles.bottomSheetTitle}>
              {currentImageField === 'selfieImage' ? 'Take Selfie' : 'Add Photo'}
            </Text>
            <TouchableOpacity
              style={styles.bottomSheetOption}
              onPress={() => takePhoto(currentImageField)}
            >
              <View style={styles.bottomSheetOptionIcon}>
                <Ionicons
                  name={currentImageField === 'selfieImage' ? 'camera' : 'camera-outline'}
                  size={24}
                  color={Colors.primary}
                />
              </View>
              <Text style={styles.bottomSheetOptionText}>
                {currentImageField === 'selfieImage' ? 'Take Selfie' : 'Take Photo'}
              </Text>
            </TouchableOpacity>
            {currentImageField !== 'selfieImage' && (
              <TouchableOpacity
                style={styles.bottomSheetOption}
                onPress={() => pickImage(currentImageField)}
              >
                <View style={styles.bottomSheetOptionIcon}>
                  <Ionicons name="images-outline" size={24} color={Colors.primary} />
                </View>
                <Text style={styles.bottomSheetOptionText}>Choose from Gallery</Text>
              </TouchableOpacity>
            )}
            <TouchableOpacity
              style={[styles.bottomSheetOption, styles.bottomSheetCancelOption]}
              onPress={() => setShowImageOptions(false)}
            >
              <Text style={styles.bottomSheetCancelText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Date Picker */}
     {/* Date Picker */}
{showDatePicker && (
  <DateTimePicker
    value={datePickerField === 'issueDate' ? (issueDate || new Date()) : (expiryDate || new Date())}
    mode="date"
    display={Platform.OS === 'ios' ? 'spinner' : 'default'}
    maximumDate={datePickerField === 'issueDate' ? new Date() : undefined}
    minimumDate={datePickerField === 'issueDate' ? new Date(1900, 0, 1) : (issueDate || new Date(1900, 0, 1))}
    onChange={(event, date) => {
      if (date) {
        if (datePickerField === 'issueDate') {
          // Check if selected date is in the future
          const today = new Date();
          today.setHours(0, 0, 0, 0);
          
          if (date > today) {
            showCustomAlert('Invalid Date', 'Issue date cannot be in the future', 'warning');
            setShowDatePicker(false);
            setDatePickerField(null);
            return;
          }
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
});

export default function DocumentUploadScreen({ navigation }) {
  const { user } = useAuth();
  const phoneNumber = user?.phone_number;
  
  // Core states
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [documents, setDocuments] = useState([]);
  const [documentTypes, setDocumentTypes] = useState([]);
  
  // UI states
  const [selectedTab, setSelectedTab] = useState('upload');
  const [selectedDocType, setSelectedDocType] = useState(null);
  const [selectedDocument, setSelectedDocument] = useState(null);
  const [showViewModal, setShowViewModal] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  
  // Alert state
  const [alert, setAlert] = useState({ visible: false, title: '', message: '', type: 'info' });

  useEffect(() => {
    loadData();
  }, []);

  const showCustomAlert = (title, message, type = 'info') => {
    Haptics.notificationAsync(
      type === 'error' ? Haptics.NotificationFeedbackType.Error :
      type === 'success' ? Haptics.NotificationFeedbackType.Success :
      Haptics.NotificationFeedbackType.Warning
    );
    setAlert({ visible: true, title, message, type });
  };

  const loadData = async () => {
    try {
      setLoading(true);
      
      const typesRes = await DatabaseService.getDocumentTypes();
      if (typesRes.success) {
        setDocumentTypes(typesRes.document_types?.filter(t => !['passport', 'pan'].includes(t.type)) || []);
      }
      
      const docsRes = await DatabaseService.getUserDocuments(phoneNumber);
      if (docsRes.success) {
        const filteredDocs = docsRes.documents?.filter(
          d => !['passport', 'pan'].includes(d.document_type)
        ) || [];

        // keep latest document for each type
        const latestDocumentsMap = {};

        filteredDocs.forEach(doc => {
          const existing = latestDocumentsMap[doc.document_type];

          if (
            !existing ||
            new Date(doc.submitted_at) > new Date(existing.submitted_at)
          ) {
            latestDocumentsMap[doc.document_type] = doc;
          }
        });

        setDocuments(Object.values(latestDocumentsMap));
      }
    } catch (error) {
      console.error(error);
      showCustomAlert('Error', 'Failed to load data. Please check your connection.', 'error');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    loadData();
  };

  const handleDocumentTypeSelect = (type) => {
    const existingDoc = documents.find(doc => doc.document_type === type.type);
    
    if (existingDoc) {
      if (existingDoc.status === 'approved') {
        showCustomAlert(
          'Document Already Verified',
          `Your ${documentTypes.find(t => t.type === type.type)?.name} is already verified.`,
          'warning'
        );
        return;
      }
      
      if (existingDoc.status === 'pending') {
        showCustomAlert(
          'Document Under Review',
          `Your ${documentTypes.find(t => t.type === type.type)?.name} is pending verification.`,
          'info'
        );
        return;
      }
    }
    
    setSelectedDocType(type);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  const handleCancelSelection = () => {
    setSelectedDocType(null);
  };

  const handleUploadSuccess = () => {
    setSelectedDocType(null);
    loadData();
  };

 const handleDelete = async () => {
  if (!selectedDocument) return;
  
  setShowDeleteConfirm(false);
  
  try {
    const result = await DatabaseService.deleteDocument(selectedDocument.id);
    if (result.success) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      setShowViewModal(false);
      showCustomAlert('Deleted', 'Document removed successfully', 'success');
      await loadData(); // This should refresh the documents list
    } else {
      showCustomAlert('Error', 'Failed to delete document', 'error');
    }
  } catch (error) {
    showCustomAlert('Error', 'Something went wrong', 'error');
  }
};

  const getStatusColor = (status) => {
    switch(status) {
      case 'approved': return '#10B981';
      case 'pending': return '#F59E0B';
      case 'rejected': return '#EF4444';
      default: return '#6B7280';
    }
  };

  const getStatusIcon = (status) => {
    switch(status) {
      case 'approved': return 'checkmark-circle';
      case 'pending': return 'time';
      case 'rejected': return 'close-circle';
      default: return 'document-text';
    }
  };

  const DocumentCard = ({ doc }) => {
    const type = documentTypes.find(t => t.type === doc.document_type);
    return (
      <TouchableOpacity
        style={[styles.docCard, doc.status === 'rejected' && styles.docCardRejected]}
        onPress={() => {
          setSelectedDocument(doc);
          setShowViewModal(true);
        }}
        activeOpacity={0.7}
      >
        <View style={styles.docCardHeader}>
          <View style={[styles.docStatusBadge, { backgroundColor: getStatusColor(doc.status) }]}>
            <Ionicons name={getStatusIcon(doc.status)} size={12} color="white" />
            <Text style={styles.docStatusText}>{doc.status}</Text>
          </View>
          <TouchableOpacity 
            onPress={() => {
              setSelectedDocument(doc);
              setShowDeleteConfirm(true);
            }}
            style={styles.docDeleteBtn}
          >
            <Ionicons name="trash-outline" size={18} color="#EF4444" />
          </TouchableOpacity>
        </View>
        
        <View style={styles.docCardBody}>
          <View style={styles.docIcon}>
            <FontAwesome5 name={doc.document_type === 'aadhar' ? 'id-card' : 'file-alt'} size={24} color={Colors.primary} />
          </View>
          <View style={styles.docInfo}>
            <Text style={styles.docType}>{type?.name || doc.document_type}</Text>
            <Text style={styles.docNumber}>{doc.document_number}</Text>
            <Text style={styles.docDate}>{new Date(doc.submitted_at).toLocaleDateString()}</Text>
          </View>
        </View>
        
        {doc.status === 'rejected' && doc.rejection_reason && (
          <View style={styles.docRejectionNote}>
            <Ionicons name="alert-circle" size={14} color="#EF4444" />
            <Text style={styles.docRejectionText}>{doc.rejection_reason}</Text>
          </View>
        )}
      </TouchableOpacity>
    );
  };

  const MyDocuments = () => {
    // required document types
    const REQUIRED_DOCUMENTS = ['aadhar', 'dl', 'rc'];

    // check all required documents approved
    const allDocumentsVerified = REQUIRED_DOCUMENTS.every(type =>
      documents.some(
        doc =>
          doc.document_type === type &&
          doc.status?.toLowerCase() === 'approved'
      )
    );

    return (
      <View style={styles.myDocsContainer}>
        <ScrollView 
          style={styles.docListContainer}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
          showsVerticalScrollIndicator={false}
          contentContainerStyle={
            documents.length === 0 ? styles.emptyStateContainer : null
          }
          keyboardShouldPersistTaps="handled"
        >
          {documents.length === 0 ? (
            <View style={styles.emptyState}>
              <Text style={styles.emptyStateTitle}>No Documents Yet</Text>
              <Text style={styles.emptyStateText}>
                Upload your first document to get started
              </Text>
            </View>
          ) : (
            <View>
              {documents.map(doc => (
                <DocumentCard key={doc.id} doc={doc} />
              ))}
            </View>
          )}

          {/* Show only when ALL required docs approved */}
          {allDocumentsVerified && (
            <View style={styles.emptyState}>
              <Ionicons
                name="checkmark-circle"
                size={80}
                color="#10B981"
              />
              <Text style={styles.emptyStateTitle}>
                All Documents Verified!
              </Text>
              <Text style={styles.emptyStateText}>
                Your documents have been verified successfully
              </Text>
            </View>
          )}
        </ScrollView>

        {/* Hide + button when all docs approved */}
        {!allDocumentsVerified && (
          <TouchableOpacity 
            style={styles.fab}
            onPress={() => {
              setSelectedDocType(null);
              setSelectedTab('upload');
            }}
            activeOpacity={0.8}
          >
            <Ionicons name="add" size={32} color="white" />
          </TouchableOpacity>
        )}
      </View>
    );
  };

const ViewDocumentModal = () => {
  // Helper function to get document-specific label for the number field
  const getDocumentNumberLabel = (docType) => {
    switch(docType) {
      case 'aadhar': return 'Aadhar Number';
      case 'dl': return 'Driving License Number';
      case 'rc': return 'RC Number';
      default: return 'Document Number';
    }
  };

  return (
    <Modal visible={showViewModal} transparent animationType="fade" onRequestClose={() => setShowViewModal(false)}>
      <View style={styles.modalOverlayFull}>
        <TouchableOpacity style={styles.modalBackdrop} activeOpacity={1} onPress={() => setShowViewModal(false)} />
        <View style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Document Details</Text>
            <TouchableOpacity onPress={() => setShowViewModal(false)}>
              <Ionicons name="close" size={24} color="#6B7280" />
            </TouchableOpacity>
          </View>
          
          <ScrollView style={styles.modalBody} showsVerticalScrollIndicator={false}>
            {selectedDocument && (
              <>
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Type</Text>
                  <Text style={styles.detailValue}>{documentTypes.find(t => t.type === selectedDocument.document_type)?.name}</Text>
                </View>
                
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Status</Text>
                  <View style={[styles.statusChip, { backgroundColor: getStatusColor(selectedDocument.status) }]}>
                    <Text style={styles.statusChipText}>{selectedDocument.status}</Text>
                  </View>
                </View>
                
                {/* Dynamic Document Number Label */}
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>{getDocumentNumberLabel(selectedDocument.document_type)}</Text>
                  <Text style={styles.detailValue}>{selectedDocument.document_number}</Text>
                </View>
                
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Name on Document</Text>
                  <Text style={styles.detailValue}>{selectedDocument.document_name}</Text>
                </View>
                
                {selectedDocument.vehicle_number && (
                  <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>Vehicle Number</Text>
                    <Text style={styles.detailValue}>{selectedDocument.vehicle_number}</Text>
                  </View>
                )}
                
                {selectedDocument.issue_date && (
                  <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>Issue Date</Text>
                    <Text style={styles.detailValue}>{new Date(selectedDocument.issue_date).toLocaleDateString()}</Text>
                  </View>
                )}
                
                {selectedDocument.expiry_date && (
                  <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>Expiry Date</Text>
                    <Text style={styles.detailValue}>{new Date(selectedDocument.expiry_date).toLocaleDateString()}</Text>
                  </View>
                )}
                
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Submitted</Text>
                  <Text style={styles.detailValue}>{new Date(selectedDocument.submitted_at).toLocaleString()}</Text>
                </View>
                
                {selectedDocument.front_image_url && (
                  <View style={styles.imageSection}>
                    <Text style={styles.imageSectionTitle}>Front Side</Text>
                    <Image source={{ uri: selectedDocument.front_image_url }} style={styles.docImagePreview} resizeMode="contain" />
                  </View>
                )}
                
                {selectedDocument.back_image_url && (
                  <View style={styles.imageSection}>
                    <Text style={styles.imageSectionTitle}>Back Side</Text>
                    <Image source={{ uri: selectedDocument.back_image_url }} style={styles.docImagePreview} resizeMode="contain" />
                  </View>
                )}
                
                {selectedDocument.selfie_image_url && (
                  <View style={styles.imageSection}>
                    <Text style={styles.imageSectionTitle}>Selfie</Text>
                    <Image source={{ uri: selectedDocument.selfie_image_url }} style={styles.docImagePreview} resizeMode="contain" />
                  </View>
                )}
              </>
            )}
          </ScrollView>
          
          <TouchableOpacity 
            style={[styles.modalBtn, styles.deleteBtn]}
            onPress={() => {
              setShowViewModal(false);
              setShowDeleteConfirm(true);
            }}
            activeOpacity={0.7}
          >
            <Ionicons name="trash-outline" size={20} color="#EF4444" />
            <Text style={[styles.modalBtnText, { color: '#EF4444' }]}>Delete Document</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

  const DeleteConfirmModal = () => (
    <Modal visible={showDeleteConfirm} transparent animationType="fade">
      <View style={styles.alertOverlay}>
        <TouchableOpacity style={styles.alertBackdrop} activeOpacity={1} onPress={() => setShowDeleteConfirm(false)} />
        <View style={styles.deleteConfirmModal}>
          <View style={styles.deleteConfirmIcon}>
            <Ionicons name="alert-triangle" size={50} color="#EF4444" />
          </View>
          <Text style={styles.deleteConfirmTitle}>Delete Document?</Text>
          <Text style={styles.deleteConfirmText}>This action cannot be undone. The document will be permanently removed.</Text>
          <View style={styles.deleteConfirmActions}>
            <TouchableOpacity 
              style={styles.deleteCancelBtn} 
              onPress={() => setShowDeleteConfirm(false)} 
              activeOpacity={0.7}
            >
              <Text style={styles.deleteCancelBtnText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={styles.deleteConfirmBtn} 
              onPress={handleDelete} 
              activeOpacity={0.7}
            >
              <Text style={styles.deleteConfirmBtnText}>Delete</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={Colors.white} />
      
      <View style={styles.header}>
        <TouchableOpacity style={styles.modernBackButton} onPress={() => navigation.goBack()}>
          <MaterialIcons name="arrow-back-ios" size={28} color={Colors.orange1} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Documents</Text>
        <View style={styles.headerSpacer} />
      </View>

      {/* Tab Bar */}
    {/* Tab Bar */}
<View style={styles.tabContainer}>
  <TouchableOpacity
    style={[styles.tabButton, selectedTab === 'upload' && styles.tabButtonActive]}
    onPress={() => {
      setSelectedTab('upload');
      setSelectedDocType(null);
    }}
  >
    <Text style={[styles.tabButtonText, selectedTab === 'upload' && styles.tabButtonTextActive]}>Upload New</Text>
  </TouchableOpacity>
  <TouchableOpacity
    style={[styles.tabButton, selectedTab === 'myDocs' && styles.tabButtonActive]}
    onPress={() => setSelectedTab('myDocs')}
  >
    <Text style={[styles.tabButtonText, selectedTab === 'myDocs' && styles.tabButtonTextActive]}>My Documents</Text>
    {documents.length > 0 && (
      <View style={styles.docCount}>
        <Text style={styles.docCountText}>{documents.length}</Text>
      </View>
    )}
  </TouchableOpacity>
</View>
      
      <View style={styles.content}>
        {loading && !refreshing ? (
          <View style={styles.loader}>
            <LottieView
              source={require('../assets/loading.json')}
              autoPlay
              loop
              style={styles.loadingAnimation}
            />
          </View>
        ) : (
          selectedTab === 'upload' ? (
            <UploadFormComponent 
              documentTypes={documentTypes}
              selectedDocType={selectedDocType}
              onSelectDocType={handleDocumentTypeSelect}
              onCancelSelection={handleCancelSelection}
              phoneNumber={phoneNumber}
              onUploadSuccess={handleUploadSuccess}
              existingDocuments={documents}
              showCustomAlert={showCustomAlert}
            />
          ) : (
            <MyDocuments />
          )
        )}
      </View>
      
      <CustomAlert
        visible={alert.visible}
        title={alert.title}
        message={alert.message}
        type={alert.type}
        onClose={() => setAlert(prev => ({ ...prev, visible: false }))}
      />
      
      <ViewDocumentModal />
      <DeleteConfirmModal />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.white,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 16,
    backgroundColor: Colors.white,
  },
  modernBackButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: "center",
    alignItems: "center",
  },
  headerTitle: {
    ...Typography.h2,
    fontSize: 24,
    fontWeight: "700",
    color: Colors.primary,
    flex: 1,
    textAlign: "center",
  },
  headerSpacer: { 
    width: 44 
  },
  tabContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 10,
    marginBottom: 10,
    alignSelf: 'center',
    backgroundColor: Colors.primary,
    borderRadius: 24,
    borderColor: Colors.primary,
    borderWidth: 0.4,
  },
  tabButton: {
    paddingVertical: 12,
    paddingHorizontal: 18,
    marginHorizontal: -1,
    borderRadius: 24,
    backgroundColor: 'transparent',
    flexDirection: 'row',
    alignItems: 'center',
  },
  tabButtonActive: {
    backgroundColor: Colors.white,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.12,
    shadowRadius: 8,
    elevation: 4,
    borderColor: Colors.primary,
    borderWidth: 1.5,
  },
  tabButtonText: {
    fontSize: 18,
    color: Colors.white,
    fontWeight: '600',
  },
  tabButtonTextActive: {
    color: Colors.primary,
  },
  docCount: {
    backgroundColor: Colors.primary,
    borderRadius: 12,
    paddingHorizontal: 6,
    paddingVertical: 2,
    marginLeft: 8,
  },
  docCountText: {
    color: 'white',
    fontSize: 10,
    fontWeight: '600',
  },
  content: {
    flex: 1,
  },
  formContainer: {
    flex: 1,
    padding: 20,
  },
  formContentContainer: {
    paddingBottom: 40,
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
  typeGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  typeCard: {
    flex: 1,
    minWidth: '30%',
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: '#E5E7EB',
  },
  typeCardSelected: {
    borderColor: Colors.primary,
    backgroundColor: Colors.primary + '08',
  },
  typeCardDisabled: {
    opacity: 0.6,
    backgroundColor: '#F3F4F6',
  },
  typeCardPending: {
    opacity: 0.7,
    backgroundColor: '#FEF3C7',
    borderColor: '#F59E0B',
  },
  typeIcon: {
    width: 56,
    height: 56,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  typeName: {
    fontSize: 14,
    fontWeight: '500',
    color: '#374151',
    marginBottom: 4,
    textAlign: 'center',
  },
  typeNameSelected: {
    color: Colors.primary,
  },
  typeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 4,
    marginTop: 4,
  },
  typeBadgeText: {
    color: 'white',
    fontSize: 10,
    fontWeight: '600',
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
  cancelSelectionBtn: {
    alignSelf: 'flex-start',
    padding: 8,
    marginBottom: 16,
  },
  cancelSelectionText: {
    color: Colors.primary,
    fontSize: 14,
    fontWeight: '600',
  },
  selectedDocHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.primary + '10',
    padding: 12,
    borderRadius: 12,
    marginBottom: 20,
    gap: 12,
  },
  selectedDocHeaderText: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.primary,
    flex: 1,
  },
  myDocsContainer: {
    flex: 1,
    position: 'relative',
  },
  docListContainer: {
    flex: 1,
    padding: 20,
  },
  emptyStateContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  docCard: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#F0F0F0',
  },
  docCardRejected: {
    backgroundColor: '#FEF2F2',
    borderColor: '#FEE2E2',
  },
  docCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  docStatusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 4,
  },
  docStatusText: {
    color: 'white',
    fontSize: 11,
    fontWeight: '600',
    textTransform: 'capitalize',
  },
  docDeleteBtn: {
    padding: 4,
  },
  docCardBody: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  docIcon: {
    width: 48,
    height: 48,
    backgroundColor: Colors.primary + '10',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  docInfo: {
    flex: 1,
  },
  docType: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.textPrimary,
    marginBottom: 4,
  },
  docNumber: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 2,
  },
  docDate: {
    fontSize: 12,
    color: '#9CA3AF',
  },
  docRejectionNote: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEE2E2',
    padding: 10,
    borderRadius: 8,
    marginTop: 12,
    gap: 8,
  },
  docRejectionText: {
    flex: 1,
    fontSize: 12,
    color: '#DC2626',
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyStateTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: Colors.textPrimary,
    marginTop: 16,
    marginBottom: 8,
  },
  emptyStateText: {
    fontSize: 18,
    color: '#9CA3AF',
  },
  emptyAnimation: {
    width: 200,
    height: 200,
  },
  loadingAnimation: {
    width: 300,
    height: 300,
  },
  loader: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loaderText: {
    marginTop: 12,
    fontSize: 14,
    color: '#9CA3AF',
  },
  fab: {
    position: 'absolute',
    bottom: 20,
    right: 20,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: Colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
  },
  alertOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  alertBackdrop: {
    position: 'absolute',
    width: '100%',
    height: '100%',
  },
  alertContainer: {
    backgroundColor: 'white',
    borderRadius: 24,
    padding: 24,
    width: '85%',
    alignItems: 'center',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
  },
  alertIconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  alertTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: Colors.textPrimary,
    marginBottom: 8,
    textAlign: 'center',
  },
  alertMessage: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 20,
  },
  alertButton: {
    paddingHorizontal: 32,
    paddingVertical: 12,
    borderRadius: 12,
    minWidth: 120,
    alignItems: 'center',
  },
  alertButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  modalOverlayFull: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalOverlayFullCentered: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalBackdropCentered: {
    position: 'absolute',
    width: '100%',
    height: '100%',
  },
  modalBackdrop: {
    position: 'absolute',
    width: '100%',
    height: '100%',
  },
  modalContent: {
    backgroundColor: 'white',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: '90%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.textPrimary,
  },
  modalBody: {
    padding: 20,
    maxHeight: '70%',
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  detailLabel: {
    fontSize: 14,
    color: '#6B7280',
  },
  detailValue: {
    fontSize: 14,
    fontWeight: '500',
    color: Colors.textPrimary,
  },
  statusChip: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 20,
  },
  statusChipText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'capitalize',
  },
  imageSection: {
    marginTop: 16,
  },
  imageSectionTitle: {
    fontSize: 14,
    fontWeight: '500',
    color: Colors.textPrimary,
    marginBottom: 8,
  },
  docImagePreview: {
    width: '100%',
    height: 200,
    borderRadius: 12,
    backgroundColor: '#F9FAFB',
  },
  modalBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    marginHorizontal: 20,
    marginBottom: 12,
    borderRadius: 12,
    gap: 8,
  },
  reuploadBtn: {
    backgroundColor: Colors.primary,
  },
  deleteBtn: {
    backgroundColor: '#FEF2F2',
    marginBottom: 20,
  },
  modalBtnText: {
    fontSize: 14,
    fontWeight: '600',
    color: 'white',
  },
  confirmModal: {
    backgroundColor: 'white',
    borderRadius: 24,
    padding: 24,
    width: '85%',
    alignSelf: 'center',
    alignItems: 'center',
  },
  confirmIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#FEF2F2',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  confirmTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: Colors.textPrimary,
    marginBottom: 8,
  },
  confirmText: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
    marginBottom: 24,
  },
  confirmActions: {
    flexDirection: 'row',
    gap: 12,
    width: '100%',
  },
  cancelBtn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 12,
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
  },
  cancelBtnText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6B7280',
  },
  confirmDeleteBtn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 12,
    backgroundColor: '#EF4444',
    alignItems: 'center',
  },
  confirmDeleteBtnText: {
    fontSize: 14,
    fontWeight: '600',
    color: 'white',
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
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#F3F4F6",
  },
  bottomSheetOptionIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#F3F4F6",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 16,
  },
  bottomSheetOptionText: {
    fontSize: 16,
    fontWeight: "500",
    color: Colors.dark,
  },
  bottomSheetCancelOption: {
    justifyContent: "center",
    borderBottomWidth: 0,
    marginTop: 8,
  },
  bottomSheetCancelText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#EF4444",
    textAlign: "center",
  },
  deleteConfirmModal: {
    backgroundColor: 'white',
    borderRadius: 24,
    padding: 24,
    width: '85%',
    alignSelf: 'center',
    alignItems: 'center',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
  },
  deleteConfirmIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#FEF2F2',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  deleteConfirmTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: Colors.textPrimary,
    marginBottom: 8,
    textAlign: 'center',
  },
  deleteConfirmText: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 20,
  },
  deleteConfirmActions: {
    flexDirection: 'row',
    gap: 12,
    width: '100%',
  },
  deleteCancelBtn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 12,
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
  },
  deleteCancelBtnText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6B7280',
  },
  deleteConfirmBtn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 12,
    backgroundColor: '#EF4444',
    alignItems: 'center',
  },
  deleteConfirmBtnText: {
    fontSize: 14,
    fontWeight: '600',
    color: 'white',
  },
});