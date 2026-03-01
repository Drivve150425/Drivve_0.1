import React, { useState, useEffect, useCallback, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  StatusBar,
  Image,
  TextInput,
  Alert,
  ActivityIndicator,
  Modal,
  Dimensions,
  Platform,
  Animated,
  Easing,
  RefreshControl,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons, MaterialIcons, FontAwesome5 } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import { Colors } from "../constants/Colors";
import DatabaseService from "../services/DatabaseService";
import DateTimePicker from "@react-native-community/datetimepicker";
import * as Haptics from "expo-haptics";
import { useAuth } from "../context/AuthContext";

const { width, height } = Dimensions.get("window");
const isSmallScreen = width < 375;
const isTablet = width > 768;

export default function DocumentUploadScreen({ navigation, route }) {
  const { user, logout } = useAuth();
  const phoneNumber = user?.phone_number;
  
  // States
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [documents, setDocuments] = useState([]);
  const [documentTypes, setDocumentTypes] = useState([]);
  
  // Animation values
  const [fadeAnim] = useState(new Animated.Value(1));
  const [slideAnim] = useState(new Animated.Value(0));

  // Upload form states
  const [selectedType, setSelectedType] = useState(null);
  const [documentNumber, setDocumentNumber] = useState("");
  const [documentName, setDocumentName] = useState("");
  const [vehicleNumber, setVehicleNumber] = useState("");
  const [issueDate, setIssueDate] = useState(null);
  const [expiryDate, setExpiryDate] = useState(null);
  const [showIssueDatePicker, setShowIssueDatePicker] = useState(false);
  const [showExpiryDatePicker, setShowExpiryDatePicker] = useState(false);

  // Image states
  const [frontImage, setFrontImage] = useState(null);
  const [backImage, setBackImage] = useState(null);
  const [selfieImage, setSelfieImage] = useState(null);

  // Modal states
  const [showTypeModal, setShowTypeModal] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showDuplicateErrorModal, setShowDuplicateErrorModal] = useState(false);
  const [uploadedDocId, setUploadedDocId] = useState(null);
  const [selectedDocument, setSelectedDocument] = useState(null);
  const [duplicateError, setDuplicateError] = useState("");

  // Reupload states for rejected documents
  const [reuploadingDocId, setReuploadingDocId] = useState(null);
  const [isReuploadMode, setIsReuploadMode] = useState(false);

  // Validation states
  const [validationErrors, setValidationErrors] = useState([]);
  const [showValidationModal, setShowValidationModal] = useState(false);

  // Track document status
  const [uploadStatus, setUploadStatus] = useState({
    allUploaded: false,
    approvedCount: 0,
    pendingCount: 0,
    rejectedCount: 0,
    missingTypes: [],
    hasPendingOrRejected: false,
  });

  const scrollViewRef = useRef();

  // Calculate document status
  useEffect(() => {
    if (documentTypes.length > 0) {
      const approvedDocs = documents.filter(doc => doc.status === "approved");
      const approvedTypes = approvedDocs.map(doc => doc.document_type);
      
      // Find missing document types (types that exist but user doesn't have approved version)
      const missingTypes = documentTypes
        .filter(type => !approvedTypes.includes(type.type))
        .map(type => type.name);
      
      const allUploaded = missingTypes.length === 0 && documents.length > 0;
      
      // Check if user has any pending or rejected documents for any type
      const hasPendingOrRejected = documents.some(doc => 
        (doc.status === "pending" || doc.status === "rejected")
      );
      
      setUploadStatus({
        allUploaded,
        approvedCount: approvedDocs.length,
        pendingCount: documents.filter(doc => doc.status === "pending").length,
        rejectedCount: documents.filter(doc => doc.status === "rejected").length,
        missingTypes,
        hasPendingOrRejected,
      });
    }
  }, [documents, documentTypes]);

  // Check if user already has any document (approved, pending, or rejected) of selected type
  const hasAnyDocumentType = (type) => {
    return documents.some(doc => doc.document_type === type);
  };

  // Check if user has pending document of selected type
  const hasPendingDocumentType = (type) => {
    return documents.some(doc => doc.document_type === type && doc.status === "pending");
  };

  // Check if user has rejected document of selected type
  const hasRejectedDocumentType = (type) => {
    return documents.some(doc => doc.document_type === type && doc.status === "rejected");
  };

  // Initialize
  useEffect(() => {
    if (!user) {
      Alert.alert(
        "Session Expired",
        "Please login again.",
        [
          {
            text: "OK",
            onPress: async () => {
              await logout();
              navigation.reset({
                index: 0,
                routes: [{ name: "Login" }],
              });
            },
          },
        ]
      );
      return;
    }

    loadData();
    startAnimations();
  }, [user]);

  const startAnimations = () => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 600,
        easing: Easing.out(Easing.back(1.5)),
        useNativeDriver: true,
      }),
    ]).start();
  };

  const loadData = async () => {
    try {
      setLoading(true);
      
      // Load document types
      const typesRes = await DatabaseService.getDocumentTypes();
      if (typesRes.success) {
        // Filter out passport and PAN if they exist
        const filteredTypes = (typesRes.document_types || []).filter(
          type => !['passport', 'pan'].includes(type.type)
        );
        setDocumentTypes(filteredTypes);
      }

      // Load user's existing documents
      const docsRes = await DatabaseService.getUserDocuments(phoneNumber);
      if (docsRes.success) {
        // Filter out passport and PAN documents if they exist
        const filteredDocs = (docsRes.documents || []).filter(
          doc => !['passport', 'pan'].includes(doc.document_type)
        );
        setDocuments(filteredDocs);
      }
    } catch (error) {
      console.error("Load data error:", error);
      showErrorPopup("Failed to load data. Please check your connection.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    loadData();
  }, []);

  const requestCameraPermission = async () => {
    if (Platform.OS !== "web") {
      const { status } = await ImagePicker.requestCameraPermissionsAsync();
      if (status !== "granted") {
        showErrorPopup("Camera permission is required to take photos of your documents.");
        return false;
      }
    }
    return true;
  };

  const requestGalleryPermission = async () => {
    if (Platform.OS !== "web") {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== "granted") {
        showErrorPopup("Gallery permission is required to select photos.");
        return false;
      }
    }
    return true;
  };

  const captureImage = async (type) => {
    const hasPermission = await requestCameraPermission();
    if (!hasPermission) return;

    try {
      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.9,
      });

      if (!result.canceled && result.assets && result.assets[0]) {
        const imageUri = result.assets[0].uri;
        
        // Haptic feedback
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

        switch (type) {
          case "front":
            setFrontImage(imageUri);
            break;
          case "back":
            setBackImage(imageUri);
            break;
          case "selfie":
            setSelfieImage(imageUri);
            break;
        }
      }
    } catch (error) {
      console.error("Camera error:", error);
      showErrorPopup("Failed to capture image. Please try again.");
    }
  };

  const pickImageFromGallery = async (type) => {
    const hasPermission = await requestGalleryPermission();
    if (!hasPermission) return;

    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.9,
      });

      if (!result.canceled && result.assets && result.assets[0]) {
        const imageUri = result.assets[0].uri;
        
        // Haptic feedback
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

        switch (type) {
          case "front":
            setFrontImage(imageUri);
            break;
          case "back":
            setBackImage(imageUri);
            break;
          case "selfie":
            setSelfieImage(imageUri);
            break;
        }
      }
    } catch (error) {
      console.error("Gallery error:", error);
      showErrorPopup("Failed to pick image. Please try again.");
    }
  };

  const handleSelectDocumentType = (type) => {
    // Check if user already has any document of this type
    // But ALLOW if it's in reupload mode (user is replacing a rejected document)
    if (hasAnyDocumentType(type) && !isReuploadMode) {
      const docTypeName = documentTypes.find(d => d.type === type)?.name || type;
      const hasPending = hasPendingDocumentType(type);
      const hasRejected = hasRejectedDocumentType(type);
      
      let errorMessage = "";
      if (hasPending) {
        errorMessage = `You have a pending ${docTypeName} document. Please wait for approval or delete it to upload a new one.`;
      } else if (hasRejected) {
        errorMessage = `Your ${docTypeName} document was rejected. Please reupload it from your documents list.`;
      } else {
        errorMessage = `You already have an approved ${docTypeName} document.`;
      }
      
      setDuplicateError(errorMessage);
      setShowDuplicateErrorModal(true);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      return;
    }

    // If in reupload mode, only allow selecting the same document type
    if (isReuploadMode && selectedType && type !== selectedType) {
      const currentTypeName = documentTypes.find(d => d.type === selectedType)?.name || selectedType;
      const newTypeName = documentTypes.find(d => d.type === type)?.name || type;
      
      setDuplicateError(`You are reuploading a ${currentTypeName}. Cannot switch to ${newTypeName} during reupload. Cancel reupload first.`);
      setShowDuplicateErrorModal(true);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      return;
    }

    setSelectedType(type);
    setShowTypeModal(false);
    Haptics.selectionAsync();

    // Only clear data if not in reupload mode
    if (!isReuploadMode) {
      setDocumentNumber("");
      setDocumentName("");
      setVehicleNumber("");
      setIssueDate(null);
      setExpiryDate(null);
      setFrontImage(null);
      setBackImage(null);
      setSelfieImage(null);
    }
  };

  const handleReuploadDocument = (doc) => {
    // Enable reupload mode first
    setIsReuploadMode(true);
    setReuploadingDocId(doc.id);
    
    // Set all the document data
    setSelectedType(doc.document_type);
    setDocumentNumber(doc.document_number);
    setDocumentName(doc.document_name);
    setVehicleNumber(doc.document_data?.vehicle_number || doc.vehicle_number || "");
    
    // Reset images - they need to be reuploaded
    setFrontImage(null);
    setBackImage(null);
    setSelfieImage(null);
    
    // Don't set issue date for Aadhar
    if (doc.document_type !== "aadhar" && doc.issue_date) {
      setIssueDate(new Date(doc.issue_date));
    } else {
      setIssueDate(null);
    }
    
    if (doc.expiry_date) {
      setExpiryDate(new Date(doc.expiry_date));
    } else {
      setExpiryDate(null);
    }
    
    setShowViewModal(false);
    Haptics.selectionAsync();
    
    // Scroll to upload form
    setTimeout(() => {
      scrollViewRef?.current?.scrollTo({ y: 0, animated: true });
    }, 100);
  };

  const validateForm = () => {
    const errors = [];

    if (!selectedType) {
      errors.push("Please select a document type.");
    }

    if (!documentNumber.trim()) {
      errors.push("Please enter document number.");
    }

    if (!documentName.trim()) {
      errors.push("Please enter name as on document.");
    }

    const docType = documentTypes.find((d) => d.type === selectedType);

    if (docType && docType.type === "rc" && !vehicleNumber.trim()) {
      errors.push("Please enter vehicle number for RC.");
    }

    if (docType && (docType.type === "dl" || docType.type === "rc") && !expiryDate) {
      errors.push(`Please select expiry date for ${docType.name}.`);
    }

    if (!frontImage) {
      errors.push("Please upload front side image.");
    }

    if (docType && docType.has_back_side && !backImage) {
      errors.push("Please upload back side image.");
    }

    if (!selfieImage) {
      errors.push("Please upload selfie with document.");
    }

    // Validate document number format based on type
    if (selectedType && documentNumber.trim()) {
      switch (selectedType) {
        case "aadhar":
          // Aadhar: 12 digits
          if (!/^\d{12}$/.test(documentNumber.trim())) {
            errors.push("Aadhar number must be exactly 12 digits.");
          }
          break;
        case "dl":
          // DL: alphanumeric, usually 15-16 characters
          if (!/^[A-Z0-9]{15,16}$/i.test(documentNumber.trim())) {
            errors.push("DL number should be 15-16 alphanumeric characters.");
          }
          break;
        case "rc":
          // RC: alphanumeric, specific format
          if (!/^[A-Z]{2}[0-9]{1,2}[A-Z]{1,2}[0-9]{4}$/i.test(documentNumber.trim())) {
            errors.push("RC number format: XX99XX9999 (e.g., MH01AB1234)");
          }
          break;
      }
    }

    // Validate vehicle number for RC
    if (selectedType === "rc" && vehicleNumber.trim()) {
      const vehicleRegex = /^[A-Z]{2}[0-9]{1,2}[A-Z]{1,2}[0-9]{4}$/i;
      if (!vehicleRegex.test(vehicleNumber.trim())) {
        errors.push("Vehicle number format: XX99XX9999 (e.g., MH01AB1234)");
      }
    }

    // Validate name
    if (documentName.trim() && documentName.trim().length < 3) {
      errors.push("Name should be at least 3 characters long.");
    }

    // Validate expiry date (should be in future)
    if (expiryDate) {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      if (expiryDate < today) {
        errors.push("Expiry date should be in the future.");
      }
    }

    // Validate issue date (should not be in future) - but not for Aadhar
    if (issueDate && selectedType !== "aadhar") {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      if (issueDate > today) {
        errors.push("Issue date cannot be in the future.");
      }
    }

    // Validate issue date is before expiry date
    if (issueDate && expiryDate && issueDate >= expiryDate) {
      errors.push("Issue date must be before expiry date.");
    }

    if (errors.length > 0) {
      setValidationErrors(errors);
      setShowValidationModal(true);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      return false;
    }

    return true;
  };

 const createFormData = () => {
  const formData = new FormData();

  formData.append("phone_number", phoneNumber);
  formData.append("document_type", selectedType);
  formData.append("document_number", documentNumber.trim());
  formData.append("document_name", documentName.trim());

  if (selectedType !== "aadhar" && issueDate) {
    formData.append("issue_date", issueDate.toISOString().split("T")[0]);
  }

  if (expiryDate) {
    formData.append("expiry_date", expiryDate.toISOString().split("T")[0]);
  }

  if (selectedType === "rc" && vehicleNumber) {
    formData.append("vehicle_number", vehicleNumber.trim());
  }

  // Append images
  const frontImageName = frontImage.split("/").pop();
  formData.append("front_image", {
    uri: frontImage,
    name: frontImageName,
    type: "image/jpeg",
  });

  if (backImage) {
    const backImageName = backImage.split("/").pop();
    formData.append("back_image", {
      uri: backImage,
      name: backImageName,
      type: "image/jpeg",
    });
  }

  const selfieImageName = selfieImage.split("/").pop();
  formData.append("selfie_image", {
    uri: selfieImage,
    name: selfieImageName,
    type: "image/jpeg",
  });

  // ✅ CRITICAL: Add reupload flags if in reupload mode
  if (isReuploadMode && reuploadingDocId) {
    formData.append("is_reupload", "true");
    formData.append("reupload_document_id", reuploadingDocId.toString());
    
    console.log("🔄 Reupload mode enabled, document ID:", reuploadingDocId);
  }

  return formData;
};
const handleSubmit = async () => {
  if (!validateForm()) return;

  setLoading(true);
  Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);

  try {
    const formData = createFormData();
    const result = await DatabaseService.uploadDocument(formData);
    
    if (result.success) {
      setUploadedDocId(result.document_id);
      setShowSuccessModal(true);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

      // Refresh documents list - this will remove the rejected document if reupload was successful
      await loadData();

      // Reset form
      resetForm();
    } else {
      // Check for duplicate document error
      if (result.message && (result.message.includes("already have") || result.message.includes("already exists"))) {
        setDuplicateError(result.message);
        setShowDuplicateErrorModal(true);
        
        // If in reupload mode and got duplicate error, show specific message
        if (isReuploadMode) {
          setDuplicateError(`Cannot reupload: ${result.message}. Please cancel reupload and try again.`);
        }
      } else {
        showErrorPopup(result.message || "Failed to upload document. Please try again.");
      }
    }
  } catch (error) {
    console.error("Submit error:", error);
    
    // Improved error handling for reupload scenarios
    let errorMessage = error.message || "Failed to upload document. Please try again.";
    
    if (error.message.includes("already have") || error.message.includes("already exists")) {
      if (isReuploadMode) {
        errorMessage = `Cannot reupload document: ${error.message}. The rejected document might have been modified.`;
      } else {
        setDuplicateError(error.message);
        setShowDuplicateErrorModal(true);
        return;
      }
    }
    
    showErrorPopup(errorMessage);
  } finally {
    setLoading(false);
  }
};

  const handleDeleteDocument = async (docId) => {
    try {
      setLoading(true);
      const result = await DatabaseService.deleteDocument(docId);
      if (result.success) {
        showSuccessPopup("Document deleted successfully!");
        await loadData();
        setShowDeleteModal(false);
        resetForm(); // Reset form if we're in reupload mode
      } else {
        showErrorPopup(result.message || "Failed to delete document.");
      }
    } catch (error) {
      console.error("Delete error:", error);
      showErrorPopup("Failed to delete document. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setIsReuploadMode(false);
    setReuploadingDocId(null);
    setSelectedType(null);
    setDocumentNumber("");
    setDocumentName("");
    setVehicleNumber("");
    setIssueDate(null);
    setExpiryDate(null);
    setFrontImage(null);
    setBackImage(null);
    setSelfieImage(null);
    setValidationErrors([]);
  };

  const showSuccessPopup = (message) => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    Alert.alert(
      "Success!",
      message,
      [{ text: "OK", onPress: () => {} }],
      { cancelable: true }
    );
  };

  const showErrorPopup = (message) => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    Alert.alert(
      "Error",
      message,
      [{ text: "OK", onPress: () => {} }],
      { cancelable: true }
    );
  };

  // ========== RENDER FUNCTIONS ==========

  const renderHeader = () => (
    <View style={styles.header}>
      <TouchableOpacity
        style={styles.modernBackButton}
        onPress={() => {
          navigation.goBack();
          Haptics.selectionAsync();
        }}
        activeOpacity={0.8}
      >
        <MaterialIcons
          name="arrow-back-ios"
          size={28}
          color={Colors.orange1}
        />
      </TouchableOpacity>

      <Text style={styles.headerTitleModern}>
        Document Verification
      </Text>

      <TouchableOpacity
        style={styles.modernRefreshButton}
        onPress={loadData}
        disabled={loading || refreshing}
        activeOpacity={0.8}
      >
        <Ionicons
          name="refresh"
          size={26}
          color={Colors.primary}
        />
      </TouchableOpacity>
    </View>
  );

  const renderUploadView = () => (
    <ScrollView
      ref={scrollViewRef}
      showsVerticalScrollIndicator={false}
      contentContainerStyle={styles.scrollContent}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={onRefresh}
          colors={[Colors.primary]}
          tintColor={Colors.primary}
        />
      }
    >
      {/* Header Section */}
      <Animated.View 
        style={[
          styles.headerSection,
          {
            opacity: fadeAnim,
            transform: [{ translateY: slideAnim }],
          }
        ]}
      >
        <View style={styles.headerIcon}>
          <Ionicons name="shield-checkmark" size={isSmallScreen ? 28 : 32} color={Colors.primary} />
        </View>
        <View style={styles.headerText}>
          <Text style={styles.headerTitle}>Document Verification</Text>
          <Text style={styles.headerSubtitle}>
            {documents.length > 0 
              ? `${uploadStatus.approvedCount}/${documentTypes.length} documents verified`
              : "Upload your documents for verification"}
          </Text>
        </View>
      </Animated.View>

      {/* Reupload Mode Banner */}
      {isReuploadMode && (
        <Animated.View 
          style={[
            styles.reuploadBanner,
            {
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }],
            }
          ]}
        >
          <Ionicons name="information-circle" size={18} color="#3B82F6" />
          <View style={styles.reuploadBannerContent}>
            <Text style={styles.reuploadTitle}>Reupload Mode</Text>
            <Text style={styles.reuploadText}>
              You are reuploading a rejected document. Please correct the issues and upload again.
            </Text>
          </View>
          <TouchableOpacity
            onPress={resetForm}
            activeOpacity={0.7}
          >
            <Ionicons name="close" size={20} color="#6B7280" />
          </TouchableOpacity>
        </Animated.View>
      )}

      {/* Existing Documents Section */}
      {documents.length > 0 && (
        <Animated.View 
          style={[
            styles.section,
            {
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }],
            }
          ]}
        >
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Your Uploaded Documents</Text>
          </View>
          
          {documents.map(renderDocumentCard)}
        </Animated.View>
      )}

      {/* Upload New Document Section - ONLY SHOW if not all documents are verified OR if user has deleted something */}
      {(uploadStatus.hasPendingOrRejected || !uploadStatus.allUploaded || isReuploadMode) && (
        <Animated.View 
          style={[
            styles.section,
            {
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }],
            }
          ]}
        >
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>
              {isReuploadMode ? "Reupload Document" : uploadStatus.allUploaded ? "Upload Additional Document" : "Upload New Document"}
            </Text>
            {isReuploadMode && (
              <TouchableOpacity
                style={styles.cancelReuploadButton}
                onPress={resetForm}
                activeOpacity={0.8}
              >
                <Ionicons name="close-circle" size={16} color="#DC2626" />
                <Text style={styles.cancelReuploadText}>Cancel Reupload</Text>
              </TouchableOpacity>
            )}
          </View>

          {/* Document Type Selection */}
          {renderDocumentTypeSelector()}

          {/* Only show form if document type is selected */}
          {(selectedType || isReuploadMode) && (
            <>
              {/* Document Number */}
              {renderInputField(
                "Document Number",
                documentNumber,
                setDocumentNumber,
                "Enter your document number",
                "default"
              )}

              {/* Document Name */}
              {renderInputField(
                "Name as on Document",
                documentName,
                setDocumentName,
                "Enter your full name exactly as on document",
                "default"
              )}

              {/* Vehicle Number (for RC only) */}
              {selectedType === "rc" && 
                renderInputField(
                  "Vehicle Number",
                  vehicleNumber,
                  setVehicleNumber,
                  "Enter vehicle registration number",
                  "default"
                )
              }

              {/* Date Pickers in Row - Don't show issue date for Aadhar */}
              <View style={[styles.dateRow, isSmallScreen && { flexDirection: 'column' }]}>
                {selectedType !== "aadhar" && renderDatePicker(
                  issueDate,
                  setIssueDate,
                  showIssueDatePicker,
                  setShowIssueDatePicker,
                  "Issue Date",
                  false
                )}
                
                {(selectedType === "dl" || selectedType === "rc") &&
                  renderDatePicker(
                    expiryDate,
                    setExpiryDate,
                    showExpiryDatePicker,
                    setShowExpiryDatePicker,
                    "Expiry Date",
                    true
                  )}
              </View>

              {/* Image Upload Sections */}
              {/* Front Image */}
              {renderImagePicker("front", frontImage, "Front Side Image", true)}
              
              {/* Back Image (if required) */}
              {documentTypes.find((d) => d.type === selectedType)?.has_back_side &&
                renderImagePicker("back", backImage, "Back Side Image", true)}
              
              {/* Selfie Image */}
              {renderImagePicker("selfie", selfieImage, "Selfie with Document", true)}

              {/* Submit Button */}
              <TouchableOpacity
                style={[
                  styles.submitButton,
                  (!selectedType || loading) && styles.submitButtonDisabled,
                ]}
                onPress={handleSubmit}
                disabled={!selectedType || loading}
                activeOpacity={0.8}
              >
                {loading ? (
                  <ActivityIndicator size="small" color={Colors.white} />
                ) : (
                  <>
                    <Ionicons name={isReuploadMode ? "refresh-circle" : "cloud-upload-outline"} size={22} color={Colors.white} />
                    <Text style={styles.submitText}>
                      {isReuploadMode ? "Reupload Document" : "Upload Document"}
                    </Text>
                  </>
                )}
              </TouchableOpacity>
            </>
          )}
        </Animated.View>
      )}

      {/* All Documents Verified Message */}
      {uploadStatus.allUploaded && !isReuploadMode && !uploadStatus.hasPendingOrRejected && (
        <Animated.View 
          style={[
            styles.successMessage,
            {
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }],
            }
          ]}
        >
          <View style={styles.successIcon}>
            <Ionicons name="checkmark-circle" size={isSmallScreen ? 36 : 40} color="#10B981" />
          </View>
          <Text style={styles.successTitle}>All Documents Verified</Text>
          <Text style={styles.successText}>
            All your documents have been approved. You can view them below.
          </Text>
        </Animated.View>
      )}
    </ScrollView>
  );

  const renderDocumentCard = (doc) => {
    const getStatusColor = (status) => {
      switch (status) {
        case "approved":
          return "#10B981";
        case "rejected":
          return "#EF4444";
        case "pending":
          return "#F59E0B";
        default:
          return "#6B7280";
      }
    };

    const getStatusIcon = (status) => {
      switch (status) {
        case "approved":
          return "checkmark-circle";
        case "rejected":
          return "close-circle";
        case "pending":
          return "time";
        default:
          return "document";
      }
    };

    const getTypeIcon = (type) => {
      switch (type) {
        case "aadhar":
          return "id-card";
        case "dl":
          return "car";
        case "rc":
          return "file-contract";
        default:
          return "document";
      }
    };

    const docTypeName = documentTypes.find(d => d.type === doc.document_type)?.name ||
                        doc.document_type.toUpperCase();

    return (
      <TouchableOpacity
        key={doc.id} 
        style={[styles.documentCard, isSmallScreen && styles.documentCardSmall]}
        onPress={() => {
          setSelectedDocument(doc);
          setShowViewModal(true);
          Haptics.selectionAsync();
        }}
        activeOpacity={0.7}
      >
        <View style={styles.documentCardHeader}>
          <View style={styles.docTypeContainer}>
            <View style={[styles.docTypeIcon, { backgroundColor: Colors.primary + "20" }]}>
              <FontAwesome5 name={getTypeIcon(doc.document_type)} size={isSmallScreen ? 14 : 16} color={Colors.primary} />
            </View>
            <View style={styles.docTypeInfo}>
              <View style={styles.docTypeRow}>
                <Text style={styles.docTypeName}>{docTypeName}</Text>
                <View
                  style={[
                    styles.statusBadge,
                    { backgroundColor: getStatusColor(doc.status) + "20" },
                  ]}
                >
                  <Ionicons
                    name={getStatusIcon(doc.status)}
                    size={isSmallScreen ? 12 : 14}
                    color={getStatusColor(doc.status)}
                  />
                  <Text
                    style={[
                      styles.statusText,
                      { color: getStatusColor(doc.status) },
                    ]}
                  >
                    {doc.status.charAt(0).toUpperCase() + doc.status.slice(1)}
                  </Text>
                </View>
              </View>
              <Text style={styles.docNumberSmall}>{doc.document_number}</Text>
            </View>
          </View>
        </View>

        <Text style={[styles.docName, isSmallScreen && styles.docNameSmall]}>{doc.document_name}</Text>

        {doc.status === "rejected" && doc.rejection_reason && (
          <View style={styles.rejectionBox}>
            <Ionicons name="alert-circle" size={isSmallScreen ? 12 : 14} color="#EF4444" />
            <Text style={[styles.rejectionText, isSmallScreen && styles.rejectionTextSmall]}>
              {doc.rejection_reason}
            </Text>
          </View>
        )}

        <View style={[styles.docMetaContainer, isSmallScreen && styles.docMetaContainerSmall]}>
          {doc.issue_date && doc.document_type !== "aadhar" && (
            <View style={styles.metaItem}>
              <Ionicons name="calendar-outline" size={isSmallScreen ? 12 : 14} color="#6B7280" />
              <Text style={[styles.metaText, isSmallScreen && styles.metaTextSmall]}>Issued: {doc.issue_date}</Text>
            </View>
          )}

          {doc.expiry_date && (
            <View style={styles.metaItem}>
              <Ionicons name="calendar" size={isSmallScreen ? 12 : 14} color={doc.is_expired ? "#EF4444" : "#6B7280"} />
              <Text style={[styles.metaText, isSmallScreen && styles.metaTextSmall, doc.is_expired && { color: "#EF4444", fontWeight: "600" }]}>
                Expires: {doc.expiry_date}
              </Text>
            </View>
          )}
        </View>

        <View style={[styles.documentActions, isSmallScreen && styles.documentActionsSmall]}>
          <TouchableOpacity
            style={styles.viewButton}
            onPress={() => {
              setSelectedDocument(doc);
              setShowViewModal(true);
              Haptics.selectionAsync();
            }}
          >
            <Ionicons name="eye" size={isSmallScreen ? 14 : 16} color={Colors.primary} />
            <Text style={[styles.viewButtonText, isSmallScreen && styles.viewButtonTextSmall]}>View Details</Text>
          </TouchableOpacity>
          
          {doc.status === "rejected" && (
            <TouchableOpacity
              style={[styles.reuploadActionButton, isSmallScreen && styles.reuploadActionButtonSmall]}
              onPress={() => handleReuploadDocument(doc)}
            >
              <Ionicons name="refresh" size={isSmallScreen ? 14 : 16} color="#3B82F6" />
              <Text style={[styles.reuploadButtonText, isSmallScreen && styles.reuploadButtonTextSmall]}>Reupload</Text>
            </TouchableOpacity>
          )}
          
          <TouchableOpacity
            style={styles.deleteButton}
            onPress={() => {
              setSelectedDocument(doc);
              setShowDeleteModal(true);
              Haptics.selectionAsync();
            }}
          >
            <Ionicons name="trash-outline" size={isSmallScreen ? 14 : 16} color="#EF4444" />
            <Text style={[styles.deleteButtonText, isSmallScreen && styles.deleteButtonTextSmall]}>Delete</Text>
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
    );
  };

  const renderDocumentTypeSelector = () => (
    <View style={styles.inputContainer}>
      <Text style={[styles.inputLabel, isSmallScreen && styles.inputLabelSmall]}>
        Document Type <Text style={styles.requiredStar}>*</Text>
      </Text>
      <TouchableOpacity
        style={[styles.dropdown, isSmallScreen && styles.dropdownSmall]}
        onPress={() => {
          setShowTypeModal(true);
          Haptics.selectionAsync();
        }}
        activeOpacity={0.7}
      >
        {selectedType ? (
          <View style={styles.selectedType}>
            <View style={[styles.selectedTypeIcon, isSmallScreen && styles.selectedTypeIconSmall]}>
              <FontAwesome5 
                name={selectedType === "aadhar" ? "id-card" : 
                      selectedType === "dl" ? "car" : 
                      selectedType === "rc" ? "file-contract" : "id-card"} 
                size={isSmallScreen ? 14 : 16} 
                color={Colors.primary} 
              />
            </View>
            <View style={styles.selectedTypeInfo}>
              <Text style={[styles.selectedTypeText, isSmallScreen && styles.selectedTypeTextSmall]}>
                {documentTypes.find((d) => d.type === selectedType)?.name || selectedType}
              </Text>
              {hasAnyDocumentType(selectedType) && !isReuploadMode && (
                <Text style={styles.alreadyExistsWarning}>
                  <Ionicons name="warning" size={isSmallScreen ? 10 : 12} color="#F59E0B" /> Document exists
                </Text>
              )}
              {isReuploadMode && (
                <Text style={styles.reuploadModeText}>
                  <Ionicons name="refresh" size={isSmallScreen ? 10 : 12} color="#3B82F6" /> Reupload mode
                </Text>
              )}
            </View>
          </View>
        ) : (
          <View style={styles.placeholderContainer}>
            <Ionicons name="document-text" size={isSmallScreen ? 16 : 18} color="#9CA3AF" />
            <Text style={[styles.placeholderText, isSmallScreen && styles.placeholderTextSmall]}>Select document type</Text>
          </View>
        )}
        <Ionicons name="chevron-down" size={isSmallScreen ? 18 : 20} color="#6B7280" />
      </TouchableOpacity>
    </View>
  );

  const renderImagePicker = (type, imageUri, label, isRequired = true) => {
    const hasImage = !!imageUri;

    return (
      <View style={styles.imagePickerContainer}>
        <View style={styles.imagePickerHeader}>
          <Text style={[styles.imagePickerLabel, isSmallScreen && styles.imagePickerLabelSmall]}>
            {label} {isRequired && <Text style={styles.requiredStar}>*</Text>}
          </Text>
        </View>

        {!hasImage ? (
         <View style={styles.singleRowContainer}>
  <TouchableOpacity
    style={styles.singleRowButton}
    onPress={() => captureImage(type)}
    activeOpacity={0.8}
  >
    <Ionicons name="camera-outline" size={18} color="#1F2937" />
    <Text style={styles.singleRowText}>Take photo</Text>
  </TouchableOpacity>

  <TouchableOpacity
    style={styles.singleRowButton}
    onPress={() => pickImageFromGallery(type)}
    activeOpacity={0.8}
  >
    <Ionicons name="image-outline" size={18} color="#1F2937" />
    <Text style={styles.singleRowText}>Gallery</Text>
  </TouchableOpacity>
</View>

        ) : (
          <View style={styles.imagePreviewSection}>
            <View style={styles.imagePreviewContainer}>
              <Image source={{ uri: imageUri }} style={styles.imagePreview} />
              <View style={styles.imageOverlay}>
                <TouchableOpacity
                  style={styles.previewActionButton}
                  onPress={() => captureImage(type)}
                >
                  <Ionicons name="camera" size={isSmallScreen ? 16 : 18} color={Colors.white} />
                  <Text style={[styles.previewActionText, isSmallScreen && styles.previewActionTextSmall]}>Retake</Text>
                </TouchableOpacity>
                
                <TouchableOpacity
                  style={styles.previewActionButton}
                  onPress={() => pickImageFromGallery(type)}
                >
                  <Ionicons name="swap-horizontal" size={isSmallScreen ? 16 : 18} color={Colors.white} />
                  <Text style={[styles.previewActionText, isSmallScreen && styles.previewActionTextSmall]}>Change</Text>
                </TouchableOpacity>
                
                <TouchableOpacity
                  style={[styles.previewActionButton, { backgroundColor: "#EF4444" }]}
                  onPress={() => {
                    Haptics.selectionAsync();
                    if (type === "front") setFrontImage(null);
                    if (type === "back") setBackImage(null);
                    if (type === "selfie") setSelfieImage(null);
                  }}
                >
                  <Ionicons name="trash" size={isSmallScreen ? 16 : 18} color={Colors.white} />
                  <Text style={[styles.previewActionText, isSmallScreen && styles.previewActionTextSmall]}>Remove</Text>
                </TouchableOpacity>
              </View>
            </View>
            <View style={styles.imageStatusBadge}>
              <Ionicons name="checkmark-circle" size={isSmallScreen ? 12 : 14} color="#10B981" />
              <Text style={[styles.imageStatusText, isSmallScreen && styles.imageStatusTextSmall]}>Uploaded Successfully</Text>
            </View>
          </View>
        )}
      </View>
    );
  };

  const renderDatePicker = (date, setDate, showPicker, setShowPicker, label, isRequired = false) => {
    return (
      <View style={[styles.datePickerContainer, isSmallScreen && { flex: 1, marginRight: 0, marginBottom: 12 }]}>
        <Text style={[styles.inputLabel, isSmallScreen && styles.inputLabelSmall]}>
          {label} {isRequired && <Text style={styles.requiredStar}>*</Text>}
        </Text>
        <TouchableOpacity
          style={[styles.dateInput, isSmallScreen && styles.dateInputSmall]}
          onPress={() => {
            setShowPicker(true);
            Haptics.selectionAsync();
          }}
          activeOpacity={0.7}
        >
          <View style={styles.dateIcon}>
            <Ionicons name="calendar" size={isSmallScreen ? 18 : 20} color={Colors.primary} />
          </View>
          <Text style={[date ? styles.dateText : styles.placeholderText, isSmallScreen && (date ? styles.dateTextSmall : styles.placeholderTextSmall)]}>
            {date ? date.toLocaleDateString("en-US", {
              day: "numeric",
              month: "short",
              year: "numeric"
            }) : "Select Date"}
          </Text>
          <Ionicons name="chevron-down" size={isSmallScreen ? 16 : 18} color="#9CA3AF" />
        </TouchableOpacity>

        {showPicker && (
          <DateTimePicker
            value={date || new Date()}
            mode="date"
            display={Platform.OS === "ios" ? "spinner" : "default"}
            onChange={(event, selectedDate) => {
              setShowPicker(false);
              if (selectedDate) {
                setDate(selectedDate);
                Haptics.selectionAsync();
              }
            }}
            themeVariant="light"
            style={Platform.OS === "ios" ? { height: 200 } : null}
          />
        )}
      </View>
    );
  };

  const renderInputField = (label, value, onChange, placeholder, keyboardType = "default") => {
    return (
      <View style={styles.inputContainer}>
        <Text style={[styles.inputLabel, isSmallScreen && styles.inputLabelSmall]}>
          {label} <Text style={styles.requiredStar}>*</Text>
        </Text>
        <TextInput
          style={[styles.input, isSmallScreen && styles.inputSmall]}
          value={value}
          onChangeText={onChange}
          placeholder={placeholder}
          placeholderTextColor="#9CA3AF"
          keyboardType={keyboardType}
          autoCapitalize={label.includes("Vehicle") ? "characters" : "words"}
        />
      </View>
    );
  };

  // ========== MODALS ==========

  const renderTypeModal = () => (
    <Modal
      visible={showTypeModal}
      animationType="slide"
      transparent={true}
      onRequestClose={() => setShowTypeModal(false)}
    >
      <View style={styles.modalOverlayCenter}>
        <View style={[styles.typeModal, isSmallScreen && styles.typeModalSmall]}>
          <View style={styles.typeModalHeader}>
            <Text style={[styles.typeModalTitle, isSmallScreen && styles.typeModalTitleSmall]}>
              {isReuploadMode ? "Reupload Document Type" : "Select Document Type"}
            </Text>
            <TouchableOpacity 
              onPress={() => {
                setShowTypeModal(false);
                Haptics.selectionAsync();
              }}
              activeOpacity={0.7}
            >
              <Ionicons name="close" size={isSmallScreen ? 24 : 28} color="#6B7280" />
            </TouchableOpacity>
          </View>
          
          <ScrollView style={styles.typeModalContent}>
            {documentTypes.map((type) => {
              const hasAny = hasAnyDocumentType(type.type) && !isReuploadMode;
              const hasPending = hasPendingDocumentType(type.type);
              const hasRejected = hasRejectedDocumentType(type.type);
              
              return (
                <TouchableOpacity
                  key={type.type}
                  style={[styles.typeOption, isSmallScreen && styles.typeOptionSmall, hasAny && styles.disabledTypeOption]}
                  onPress={() => handleSelectDocumentType(type.type)}
                  activeOpacity={hasAny ? 1 : 0.7}
                  disabled={hasAny}
                >
                  <View style={[styles.typeIconContainer, { backgroundColor: Colors.primary + "15" }, isSmallScreen && styles.typeIconContainerSmall]}>
                    <FontAwesome5 
                      name={type.type === "aadhar" ? "id-card" : 
                            type.type === "dl" ? "car" : 
                            type.type === "rc" ? "file-contract" : "id-card"}
                      size={isSmallScreen ? 18 : 22} 
                      color={hasAny ? "#9CA3AF" : Colors.primary} 
                    />
                  </View>
                  <View style={styles.typeInfo}>
                    <View style={[styles.typeNameRow, isSmallScreen && styles.typeNameRowSmall]}>
                      <Text style={[styles.typeName, isSmallScreen && styles.typeNameSmall, hasAny && styles.disabledTypeName]}>
                        {type.name}
                      </Text>
                      {hasPending && (
                        <View style={[styles.statusBadgeSmall, isSmallScreen && styles.statusBadgeSmallSmall]}>
                          <Ionicons name="time" size={isSmallScreen ? 10 : 12} color="#F59E0B" />
                          <Text style={[styles.statusBadgeText, isSmallScreen && styles.statusBadgeTextSmall]}>Pending</Text>
                        </View>
                      )}
                      {hasRejected && (
                        <View style={[styles.statusBadgeSmall, { backgroundColor: "#FEF2F2" }, isSmallScreen && styles.statusBadgeSmallSmall]}>
                          <Ionicons name="close-circle" size={isSmallScreen ? 10 : 12} color="#EF4444" />
                          <Text style={[styles.statusBadgeText, isSmallScreen && styles.statusBadgeTextSmall, { color: "#EF4444" }]}>Rejected</Text>
                        </View>
                      )}
                      {!hasPending && !hasRejected && hasAny && (
                        <View style={[styles.statusBadgeSmall, { backgroundColor: "#F0FDF4" }, isSmallScreen && styles.statusBadgeSmallSmall]}>
                          <Ionicons name="checkmark-circle" size={isSmallScreen ? 10 : 12} color="#10B981" />
                          <Text style={[styles.statusBadgeText, isSmallScreen && styles.statusBadgeTextSmall, { color: "#10B981" }]}>Approved</Text>
                        </View>
                      )}
                    </View>
                    {hasAny && (
                      <Text style={[styles.alreadyHaveText, isSmallScreen && styles.alreadyHaveTextSmall]}>
                        {hasPending ? "Document pending review" : 
                         hasRejected ? "Document was rejected - can reupload" : 
                         "Document already approved"}
                      </Text>
                    )}
                  </View>
                  {/* {hasAny ? (
                    <Ionicons 
                      name={hasPending ? "time" : hasRejected ? "refresh" : "checkmark"} 
                      size={isSmallScreen ? 18 : 20} 
                      color={hasPending ? "#F59E0B" : hasRejected ? "#3B82F6" : "#10B981"} 
                    />
                  ) : (
                    <Ionicons name="chevron-forward" size={isSmallScreen ? 18 : 20} color="#D1D5DB" />
                  )} */}
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </View>
      </View>
    </Modal>
  );

  const renderDuplicateErrorModal = () => (
    <Modal
      visible={showDuplicateErrorModal}
      animationType="fade"
      transparent={true}
      onRequestClose={() => setShowDuplicateErrorModal(false)}
    >
      <View style={styles.modalOverlayCenter}>
        <View style={[styles.duplicateErrorModal, isSmallScreen && styles.duplicateErrorModalSmall]}>
          <View style={styles.duplicateErrorIcon}>
            <Ionicons name="alert-circle" size={isSmallScreen ? 40 : 50} color="#F59E0B" />
          </View>
          
          <Text style={[styles.duplicateErrorTitle, isSmallScreen && styles.duplicateErrorTitleSmall]}>Document Already Exists</Text>
          <Text style={[styles.duplicateErrorMessage, isSmallScreen && styles.duplicateErrorMessageSmall]}>
            {duplicateError}
          </Text>
          
          <View style={[styles.duplicateErrorButtons, isSmallScreen && styles.duplicateErrorButtonsSmall]}>
            <TouchableOpacity
              style={[styles.duplicateErrorButton, styles.viewDocumentsButton]}
              onPress={() => {
                setShowDuplicateErrorModal(false);
                Haptics.selectionAsync();
              }}
              activeOpacity={0.8}
            >
              <Ionicons name="eye" size={isSmallScreen ? 16 : 18} color={Colors.white} />
              <Text style={[styles.viewDocumentsButtonText, isSmallScreen && styles.viewDocumentsButtonTextSmall]}>View Documents</Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={[styles.duplicateErrorButton, styles.chooseOtherButton]}
              onPress={() => {
                setShowDuplicateErrorModal(false);
                setSelectedType(null);
                Haptics.selectionAsync();
              }}
              activeOpacity={0.8}
            >
              <Ionicons name="swap-horizontal" size={isSmallScreen ? 16 : 18} color={Colors.primary} />
              <Text style={[styles.chooseOtherButtonText, isSmallScreen && styles.chooseOtherButtonTextSmall]}>Choose Other</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );

  const renderValidationModal = () => (
    <Modal
      visible={showValidationModal}
      animationType="fade"
      transparent={true}
      onRequestClose={() => setShowValidationModal(false)}
    >
      <View style={styles.modalOverlayCenter}>
        <View style={[styles.validationModal, isSmallScreen && styles.validationModalSmall]}>
          <View style={styles.validationHeader}>
            <View style={styles.validationIcon}>
              <Ionicons name="warning" size={isSmallScreen ? 32 : 40} color="#F59E0B" />
            </View>
            <Text style={[styles.validationTitle, isSmallScreen && styles.validationTitleSmall]}>Validation Required</Text>
            <Text style={[styles.validationSubtitle, isSmallScreen && styles.validationSubtitleSmall]}>Please fix the following issues:</Text>
          </View>
          
          <ScrollView style={[styles.validationContent, isSmallScreen && styles.validationContentSmall]}>
            {validationErrors.map((error, index) => (
              <View key={index} style={[styles.errorItem, isSmallScreen && styles.errorItemSmall]}>
                <View style={styles.errorIcon}>
                  <Ionicons name="close-circle" size={isSmallScreen ? 14 : 16} color="#EF4444" />
                </View>
                <Text style={[styles.errorText, isSmallScreen && styles.errorTextSmall]}>{error}</Text>
              </View>
            ))}
          </ScrollView>
          
          <TouchableOpacity
            style={[styles.validationButton, isSmallScreen && styles.validationButtonSmall]}
            onPress={() => {
              setShowValidationModal(false);
              Haptics.selectionAsync();
            }}
            activeOpacity={0.8}
          >
            <Text style={[styles.validationButtonText, isSmallScreen && styles.validationButtonTextSmall]}>Got It</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );

  const renderSuccessModal = () => (
    <Modal
      visible={showSuccessModal}
      animationType="fade"
      transparent={true}
      onRequestClose={() => setShowSuccessModal(false)}
    >
      <View style={styles.modalOverlayCenter}>
        <View style={[styles.successModal, isSmallScreen && styles.successModalSmall]}>
          <View style={styles.successIconContainer}>
            <View style={[styles.successIconCircle, isSmallScreen && styles.successIconCircleSmall]}>
              <Ionicons name="checkmark" size={isSmallScreen ? 40 : 50} color={Colors.white} />
            </View>
          </View>
          
          <Text style={[styles.successTitle, isSmallScreen && styles.successTitleSmall]}>
            {isReuploadMode ? "Document Reuploaded" : "Document Uploaded"}
          </Text>
          <Text style={[styles.successMessageText, isSmallScreen && styles.successMessageTextSmall]}>
            {isReuploadMode 
              ? "Your document has been reuploaded and is pending verification. The rejected document has been removed."
              : "Your document has been uploaded and is pending verification."
            }
          </Text>
          
          <View style={styles.successButtons}>
            <TouchableOpacity
              style={[styles.successButton, styles.primaryButton]}
              onPress={() => {
                setShowSuccessModal(false);
                resetForm();
                Haptics.selectionAsync();
              }}
              activeOpacity={0.8}
            >
              <Text style={[styles.primaryButtonText, isSmallScreen && styles.primaryButtonTextSmall]}>OK</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );

  const formatDateTime = (dateString) => {
    if (!dateString) return "N/A";
    
    const date = new Date(dateString);
    return date.toLocaleString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
  };

  const getDocumentTypeName = (type) => {
    const types = {
      "aadhar": "Aadhar Card",
      "dl": "Driving License",
      "rc": "Registration Certificate"
    };
    return types[type] || type;
  };

  const renderViewModal = () => {
    if (!selectedDocument) return null;
    
    const doc = selectedDocument;
    const isExpired = doc.is_expired;
    const isRejected = doc.status === "rejected";
    
    return (
      <Modal
        visible={showViewModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowViewModal(false)}
      >
        <View style={styles.modalOverlayCenter}>
          <View style={[styles.viewModal, isSmallScreen && styles.viewModalSmall]}>
            <View style={styles.viewModalHeader}>
              <Text style={[styles.viewModalTitle, isSmallScreen && styles.viewModalTitleSmall]}>Document Details</Text>
              <TouchableOpacity 
                onPress={() => setShowViewModal(false)}
                activeOpacity={0.7}
              >
                <Ionicons name="close" size={isSmallScreen ? 24 : 28} color="#6B7280" />
              </TouchableOpacity>
            </View>
            
            <ScrollView
              style={{ flex: 1 }}
              contentContainerStyle={styles.viewModalScrollContent}
              showsVerticalScrollIndicator={false}
            >
              {/* Status Banner */}
              <View style={[styles.statusBanner, { 
                backgroundColor: doc.status === 'approved' ? '#F0FDF4' : 
                                doc.status === 'rejected' ? '#FEF2F2' : '#FFFBEB',
                borderColor: doc.status === 'approved' ? '#A7F3D0' : 
                            doc.status === 'rejected' ? '#FECACA' : '#FDE68A'
              }]}>
                <View style={styles.statusBannerContent}>
                  <View style={[styles.statusBannerIconContainer, isSmallScreen && styles.statusBannerIconContainerSmall]}>
                    <Ionicons 
                      name={doc.status === 'approved' ? 'checkmark-circle' : 
                            doc.status === 'rejected' ? 'close-circle' : 'time'} 
                      size={isSmallScreen ? 20 : 24} 
                      color={doc.status === 'approved' ? '#10B981' : 
                            doc.status === 'rejected' ? '#EF4444' : '#F59E0B'} 
                    />
                  </View>
                  <View style={[styles.statusBannerTextContainer, { marginLeft: 16 }]}>
                    <Text style={[styles.statusBannerTitle, {
                      color: doc.status === 'approved' ? '#065F46' : 
                            doc.status === 'rejected' ? '#991B1B' : '#92400E'
                    }, isSmallScreen && styles.statusBannerTitleSmall]}>
                      {doc.status === 'pending' ? 'Awaiting Review' : 
                      doc.status === 'approved' ? 'Approved & Verified' : 'Rejected'}
                    </Text>
                    {doc.status === 'approved' && doc.verified_by && (
                      <Text style={[styles.statusBannerSubtitle, isSmallScreen && styles.statusBannerSubtitleSmall]}>
                        Verified by {doc.verified_by}
                      </Text>
                    )}
                  </View>
                </View>
              </View>

              {/* Document Information Section */}
              <View style={styles.sectionContainer}>
                <View style={styles.sectionHeader}>
                  <View style={[styles.sectionIconContainer, isSmallScreen && styles.sectionIconContainerSmall]}>
                    <Ionicons name="document-text-outline" size={isSmallScreen ? 18 : 20} color="#6B7280" />
                  </View>
                  <Text style={[styles.sectionTitle, isSmallScreen && styles.sectionTitleSmall]}>Document Information</Text>
                </View>
                <View style={styles.sectionDivider} />
                
                <View style={styles.detailsList}>
                  <View style={[styles.detailItem, isSmallScreen && styles.detailItemSmall]}>
                    <View style={[styles.detailIconContainer, isSmallScreen && styles.detailIconContainerSmall]}>
                      <Ionicons name="document-outline" size={isSmallScreen ? 16 : 18} color="#6B7280" />
                    </View>
                    <View style={[styles.detailContent, { marginLeft: 12 }]}>
                      <Text style={[styles.detailLabel, isSmallScreen && styles.detailLabelSmall]}>Document Type</Text>
                      <Text style={[styles.detailValue, isSmallScreen && styles.detailValueSmall]}>{getDocumentTypeName(doc.document_type)}</Text>
                    </View>
                  </View>
                  
                  <View style={[styles.detailItem, isSmallScreen && styles.detailItemSmall]}>
                    <View style={[styles.detailIconContainer, isSmallScreen && styles.detailIconContainerSmall]}>
                      <Ionicons name="barcode-outline" size={isSmallScreen ? 16 : 18} color="#6B7280" />
                    </View>
                    <View style={[styles.detailContent, { marginLeft: 12 }]}>
                      <Text style={[styles.detailLabel, isSmallScreen && styles.detailLabelSmall]}>Document Number</Text>
                      <Text style={[styles.detailValue, isSmallScreen && styles.detailValueSmall]}>{doc.document_number}</Text>
                    </View>
                  </View>
                  
                  <View style={[styles.detailItem, isSmallScreen && styles.detailItemSmall]}>
                    <View style={[styles.detailIconContainer, isSmallScreen && styles.detailIconContainerSmall]}>
                      <Ionicons name="person-outline" size={isSmallScreen ? 16 : 18} color="#6B7280" />
                    </View>
                    <View style={[styles.detailContent, { marginLeft: 12 }]}>
                      <Text style={[styles.detailLabel, isSmallScreen && styles.detailLabelSmall]}>Document Holder Name</Text>
                      <Text style={[styles.detailValue, isSmallScreen && styles.detailValueSmall]}>{doc.document_name || "Not specified"}</Text>
                    </View>
                  </View>
                  
                  {doc.vehicle_number && (
                    <View style={[styles.detailItem, isSmallScreen && styles.detailItemSmall]}>
                      <View style={[styles.detailIconContainer, isSmallScreen && styles.detailIconContainerSmall]}>
                        <Ionicons name="car-outline" size={isSmallScreen ? 16 : 18} color="#6B7280" />
                      </View>
                      <View style={[styles.detailContent, { marginLeft: 12 }]}>
                        <Text style={[styles.detailLabel, isSmallScreen && styles.detailLabelSmall]}>Vehicle Registration Number</Text>
                        <Text style={[styles.detailValue, isSmallScreen && styles.detailValueSmall]}>{doc.vehicle_number}</Text>
                      </View>
                    </View>
                  )}
                  
                  {doc.issue_date && doc.document_type !== "aadhar" && (
                    <View style={[styles.detailItem, isSmallScreen && styles.detailItemSmall]}>
                      <View style={[styles.detailIconContainer, isSmallScreen && styles.detailIconContainerSmall]}>
                        <Ionicons name="calendar-outline" size={isSmallScreen ? 16 : 18} color="#6B7280" />
                      </View>
                      <View style={[styles.detailContent, { marginLeft: 12 }]}>
                        <Text style={[styles.detailLabel, isSmallScreen && styles.detailLabelSmall]}>Issue Date</Text>
                        <Text style={[styles.detailValue, isSmallScreen && styles.detailValueSmall]}>{doc.issue_date}</Text>
                      </View>
                    </View>
                  )}
                  
                  {doc.expiry_date && (
                    <View style={[styles.detailItem, isSmallScreen && styles.detailItemSmall, isExpired && styles.expiredDetailItem]}>
                      <View style={[styles.detailIconContainer, isSmallScreen && styles.detailIconContainerSmall]}>
                        <Ionicons name="timer-outline" size={isSmallScreen ? 16 : 18} color={isExpired ? "#EF4444" : "#6B7280"} />
                      </View>
                      <View style={[styles.detailContent, { marginLeft: 12 }]}>
                        <Text style={[styles.detailLabel, isSmallScreen && styles.detailLabelSmall, isExpired && { color: "#EF4444" }]}>
                          Expiry Date
                        </Text>
                        <Text style={[styles.detailValue, isSmallScreen && styles.detailValueSmall, isExpired && { color: "#EF4444", fontWeight: '600' }]}>
                          {doc.expiry_date}
                          {isExpired && " (Document Expired)"}
                        </Text>
                      </View>
                    </View>
                  )}
                </View>
              </View>

              {/* Submission Details */}
              <View style={styles.sectionContainer}>
                <View style={styles.sectionHeader}>
                  <View style={[styles.sectionIconContainer, isSmallScreen && styles.sectionIconContainerSmall]}>
                    <Ionicons name="time-outline" size={isSmallScreen ? 18 : 20} color="#6B7280" />
                  </View>
                  <Text style={[styles.sectionTitle, isSmallScreen && styles.sectionTitleSmall]}>Submission Details</Text>
                </View>
                <View style={styles.sectionDivider} />
                
                <View style={styles.detailsList}>
                  <View style={[styles.detailItem, isSmallScreen && styles.detailItemSmall]}>
                    <View style={[styles.detailIconContainer, isSmallScreen && styles.detailIconContainerSmall]}>
                      <Ionicons name="time-outline" size={isSmallScreen ? 16 : 18} color="#6B7280" />
                    </View>
                    <View style={[styles.detailContent, { marginLeft: 12 }]}>
                      <Text style={[styles.detailLabel, isSmallScreen && styles.detailLabelSmall]}>Submitted On</Text>
                      <Text style={[styles.detailValue, isSmallScreen && styles.detailValueSmall]}>
                        {formatDateTime(doc.submitted_at)}
                      </Text>
                    </View>
                  </View>
                  
                  {doc.status === 'approved' && doc.verified_at && (
                    <View style={[styles.detailItem, isSmallScreen && styles.detailItemSmall]}>
                      <View style={[styles.detailIconContainer, isSmallScreen && styles.detailIconContainerSmall]}>
                        <Ionicons name="calendar-check" size={isSmallScreen ? 16 : 18} color="#10B981" />
                      </View>
                      <View style={[styles.detailContent, { marginLeft: 12 }]}>
                        <Text style={[styles.detailLabel, isSmallScreen && styles.detailLabelSmall]}>Verified On</Text>
                        <Text style={[styles.detailValue, isSmallScreen && styles.detailValueSmall]}>
                          {formatDateTime(doc.verified_at)}
                        </Text>
                      </View>
                    </View>
                  )}
                </View>
              </View>

              {/* Rejection Reason if rejected */}
              {doc.status === "rejected" && doc.rejection_reason && (
                <View style={styles.rejectionSection}>
                  <View style={styles.sectionHeader}>
                    <View style={[styles.sectionIconContainer, isSmallScreen && styles.sectionIconContainerSmall]}>
                      <Ionicons name="alert-circle-outline" size={isSmallScreen ? 18 : 20} color="#DC2626" />
                    </View>
                    <Text style={[styles.sectionTitle, isSmallScreen && styles.sectionTitleSmall, { color: "#DC2626" }]}>Rejection Details</Text>
                  </View>
                  <View style={styles.sectionDivider} />
                  <View style={[styles.rejectionContent, { marginLeft: 4 }]}>
                    <Text style={[styles.rejectionLabel, isSmallScreen && styles.rejectionLabelSmall]}>Reason for Rejection</Text>
                    <Text style={[styles.rejectionText, isSmallScreen && styles.rejectionTextSmall]}>{doc.rejection_reason}</Text>
                  </View>
                </View>
              )}
            </ScrollView>
            
            {/* Action Buttons */}
            <View style={styles.viewModalFooter}>
              {isRejected && (
                <TouchableOpacity
                  style={[styles.actionButton, styles.reuploadActionButtonModal]}
                  onPress={() => handleReuploadDocument(doc)}
                  activeOpacity={0.8}
                >
                  <Ionicons name="refresh" size={18} color={Colors.white} />
                  <Text style={styles.reuploadActionButtonText}>Reupload Document</Text>
                </TouchableOpacity>
              )}
              
              
            </View>
          </View>
        </View>
      </Modal>
    );
  };

  const renderDeleteModal = () => (
    <Modal
      visible={showDeleteModal}
      animationType="fade"
      transparent={true}
      onRequestClose={() => setShowDeleteModal(false)}
    >
      <View style={styles.modalOverlayCenter}>
        <View style={[styles.deleteModal, isSmallScreen && styles.deleteModalSmall]}>
          <View style={styles.deleteIcon}>
            <Ionicons name="trash" size={isSmallScreen ? 40 : 50} color="#EF4444" />
          </View>
          
          <Text style={[styles.deleteTitle, isSmallScreen && styles.deleteTitleSmall]}>Delete Document</Text>
          <Text style={[styles.deleteMessage, isSmallScreen && styles.deleteMessageSmall]}>
            Are you sure you want to delete this document? This action cannot be undone.
          </Text>
          
          <View style={[styles.deleteButtons, isSmallScreen && styles.deleteButtonsSmall]}>
            <TouchableOpacity
              style={[styles.deleteButtonModal, styles.cancelButton]}
              onPress={() => {
                setShowDeleteModal(false);
                Haptics.selectionAsync();
              }}
              activeOpacity={0.8}
            >
              <Text style={[styles.cancelButtonText, isSmallScreen && styles.cancelButtonTextSmall]}>Cancel</Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={[styles.deleteButtonModal, styles.confirmDeleteButton]}
              onPress={() => {
                if (selectedDocument) {
                  handleDeleteDocument(selectedDocument.id);
                }
              }}
              activeOpacity={0.8}
            >
              <Ionicons name="trash" size={isSmallScreen ? 16 : 18} color={Colors.white} />
              <Text style={[styles.confirmDeleteText, isSmallScreen && styles.confirmDeleteTextSmall]}>Delete</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar backgroundColor={Colors.white} barStyle="dark-content" />

      {/* Header */}
      {renderHeader()}

      {loading && !refreshing ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size={isSmallScreen ? "small" : "large"} color={Colors.primary} />
          <Text style={[styles.loadingText, isSmallScreen && styles.loadingTextSmall]}>Loading documents...</Text>
        </View>
      ) : (
        renderUploadView()
      )}

      {/* All Modals */}
      {renderTypeModal()}
      {renderDuplicateErrorModal()}
      {renderValidationModal()}
      {renderSuccessModal()}
      {renderViewModal()}
      {renderDeleteModal()}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#Fff",
  },
  // Header
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 1,
    backgroundColor: Colors.white,
    borderBottomWidth: 0.5,
    borderBottomColor: "#F3F4F6",
  },
  modernBackButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: "center",
    alignItems: "center",
  },
  modernRefreshButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: "center",
    alignItems: "center",
  },
  headerTitleModern: {
    flex: 1,
    textAlign: "center",
    fontSize: 28,
    fontWeight: "700",
    color: Colors.primary,
  },
  headerSmall: {
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  backButton: {
    padding: 8,
    borderRadius: 12,
    backgroundColor: "#F3F4F6",
  },
  backButtonSmall: {
    padding: 6,
    borderRadius: 10,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: Colors.primary,
  },
  headerTitleSmall: {
    fontSize: 18,
  },
  refreshButton: {
    padding: 8,
    borderRadius: 12,
    backgroundColor: "#F3F4F6",
  },
  refreshButtonSmall: {
    padding: 6,
    borderRadius: 10,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingBottom: 40,
    paddingTop: 16,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    marginTop: 16,
    fontSize: 15,
    color: "#6B7280",
  },
  loadingTextSmall: {
    fontSize: 14,
  },
  
  // Header Section
  headerSection: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.white,
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  headerIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: Colors.primary + "15",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 16,
  },
  headerText: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: Colors.primary,
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 14,
    color: "#6B7280",
  },
  
  // Reupload Banner
  reuploadBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#EFF6FF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#93C5FD',
    gap: 12,
  },
  reuploadBannerContent: {
    flex: 1,
  },
  reuploadTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1E40AF',
    marginBottom: 4,
  },
  reuploadText: {
    fontSize: 13,
    color: '#3B82F6',
  },
  
  // Section
  section: {
    backgroundColor: Colors.white,
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#1F2937",
  },
  docCount: {
    fontSize: 14,
    color: "#6B7280",
    fontWeight: "500",
  },
  
  // Success Message
  successMessage: {
    backgroundColor: "#F0FDF4",
    borderRadius: 16,
    padding: 24,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: "#A7F3D0",
    alignItems: "center",
  },
  successIcon: {
    marginBottom: 16,
  },
  successTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#065F46",
    marginBottom: 8,
    textAlign: "center",
  },
  successText: {
    fontSize: 14,
    color: "#047857",
    textAlign: "center",
    lineHeight: 20,
  },
  
  // Document Card
  documentCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  documentCardSmall: {
    padding: 12,
    marginBottom: 10,
  },
  documentCardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  docTypeContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  docTypeInfo: {
    flex: 1,
  },
  docTypeRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  docTypeName: {
    fontSize: 16,
    fontWeight: "600",
    color: "#111",
    flex: 1,
  },
  docTypeIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  statusBadge: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginLeft: 8,
  },
  statusText: {
    fontSize: 12,
    fontWeight: "600",
    marginLeft: 4,
  },
  docNumberSmall: {
    marginTop: 4,
    fontSize: 13,
    color: "#666",
  },
  docName: {
    fontSize: 15,
    fontWeight: "600",
    color: "#374151",
    marginBottom: 12,
  },
  docNameSmall: {
    fontSize: 14,
  },
  docMetaContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginBottom: 12,
  },
  docMetaContainerSmall: {
    marginBottom: 10,
  },
  metaItem: {
    flexDirection: "row",
    alignItems: "center",
    marginRight: 16,
    marginBottom: 8,
  },
  metaText: {
    fontSize: 12,
    color: "#6B7280",
    marginLeft: 6,
  },
  metaTextSmall: {
    fontSize: 11,
  },
  rejectionBox: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FEF2F2",
    padding: 10,
    borderRadius: 8,
    marginBottom: 12,
  },
  rejectionText: {
    fontSize: 12,
    color: "#DC2626",
    marginLeft: 8,
    flex: 1,
  },
  rejectionTextSmall: {
    fontSize: 11,
  },
  documentActions: {
    flexDirection: "row",
    justifyContent: "flex-end",
    gap: 12,
  },
  documentActionsSmall: {
    gap: 8,
  },
  viewButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: Colors.primary + "15",
    borderRadius: 8,
  },
  viewButtonText: {
    fontSize: 12,
    fontWeight: "600",
    color: Colors.primary,
    marginLeft: 4,
  },
  viewButtonTextSmall: {
    fontSize: 11,
  },
  reuploadActionButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: "#EFF6FF",
    borderRadius: 8,
  },
  reuploadActionButtonSmall: {
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  reuploadButtonText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#3B82F6",
    marginLeft: 4,
  },
  reuploadButtonTextSmall: {
    fontSize: 11,
  },
  deleteButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: "#FEF2F2",
    borderRadius: 8,
  },
  deleteButtonText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#DC2626",
    marginLeft: 4,
  },
  deleteButtonTextSmall: {
    fontSize: 11,
  },
  
  // Form Styles
  inputContainer: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: "#374151",
    marginBottom: 8,
  },
  inputLabelSmall: {
    fontSize: 13,
  },
  requiredStar: {
    color: "#DC2626",
  },
  input: {
    borderWidth: 1.5,
    borderColor: "#D1D5DB",
    borderRadius: 12,
    padding: 14,
    fontSize: 16,
    color: "#1F2937",
    backgroundColor: Colors.white,
  },
  inputSmall: {
    padding: 12,
    fontSize: 15,
  },
  dropdown: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderWidth: 1.5,
    borderColor: "#D1D5DB",
    borderRadius: 12,
    padding: 14,
    backgroundColor: Colors.white,
  },
  dropdownSmall: {
    padding: 12,
  },
  selectedType: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  selectedTypeIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: Colors.primary + "15",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  selectedTypeIconSmall: {
    width: 32,
    height: 32,
    borderRadius: 16,
  },
  selectedTypeInfo: {
    flex: 1,
  },
  selectedTypeText: {
    fontSize: 16,
    color: "#1F2937",
    fontWeight: "500",
  },
  selectedTypeTextSmall: {
    fontSize: 15,
  },
  alreadyExistsWarning: {
    fontSize: 11,
    color: "#F59E0B",
    marginTop: 2,
  },
  reuploadModeText: {
    fontSize: 11,
    color: "#3B82F6",
    marginTop: 2,
  },
  placeholderContainer: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  placeholderText: {
    fontSize: 16,
    color: "#9CA3AF",
    marginLeft: 10,
  },
  placeholderTextSmall: {
    fontSize: 15,
  },
  dateRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 20,
  },
  datePickerContainer: {
    flex: 1,
    marginRight: 12,
  },
  dateInput: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1.5,
    borderColor: "#D1D5DB",
    borderRadius: 12,
    padding: 14,
    backgroundColor: Colors.white,
  },
  dateInputSmall: {
    padding: 12,
  },
  dateIcon: {
    marginRight: 10,
  },
  dateText: {
    fontSize: 16,
    color: "#1F2937",
    flex: 1,
  },
  dateTextSmall: {
    fontSize: 15,
  },
  
  // Image Picker
  imagePickerContainer: {
    marginBottom: 24,
  },
  imagePickerHeader: {
    marginBottom: 12,
  },
  imagePickerLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: "#374151",
  },
  imagePickerLabelSmall: {
    fontSize: 13,
  },
  imagePickerButtons: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 12,
  },
  imagePickerButtonsSmall: {
    gap: 8,
  },
  imageButton: {
    flex: 1,
    backgroundColor: Colors.primary,
    borderRadius: 12,
    padding: 16,
    alignItems: "center",
  },
  imageButtonSmall: {
    padding: 12,
  },
  imageButtonIcon: {
    marginBottom: 8,
  },
  imageButtonIconSmall: {
    marginBottom: 6,
  },
  imageButtonText: {
    fontSize: 14,
    fontWeight: "600",
    color: Colors.white,
  },
  imageButtonTextSmall: {
    fontSize: 13,
  },
  imagePreviewSection: {
    marginTop: 4,
  },
  imagePreviewContainer: {
    borderRadius: 12,
    overflow: "hidden",
    position: "relative",
  },
  imagePreview: {
    width: "100%",
    height: 200,
    borderRadius: 12,
  },
  imageOverlay: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: "rgba(0, 0, 0, 0.6)",
    flexDirection: "row",
    justifyContent: "space-around",
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  previewActionButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    gap: 6,
  },
  previewActionText: {
    fontSize: 12,
    fontWeight: "600",
    color: Colors.white,
  },
  previewActionTextSmall: {
    fontSize: 11,
  },
  imageStatusBadge: {
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "flex-start",
    backgroundColor: "#10B98115",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    marginTop: 8,
  },
  imageStatusText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#10B981",
    marginLeft: 6,
  },
  imageStatusTextSmall: {
    fontSize: 11,
  },
  
  // Submit Button
  submitButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: Colors.primary,
    borderRadius: 14,
    padding: 18,
    marginTop: 8,
  },
  submitButtonDisabled: {
    backgroundColor: "#9CA3AF",
  },
  submitText: {
    fontSize: 16,
    fontWeight: "700",
    color: Colors.white,
    marginLeft: 10,
  },
  
  // Cancel Reupload Button
  cancelReuploadButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FEF2F2",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#FECACA",
    gap: 6,
  },
  cancelReuploadText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#DC2626",
  },
  
  // ================== MODAL STYLES - ALL CENTERED ==================
  modalOverlayCenter: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 20,
  },
  
  // Type Modal
  typeModal: {
    backgroundColor: Colors.white,
    borderRadius: 20,
    width: "100%",
    maxHeight: "80%",
    maxWidth: 500,
  },
  typeModalSmall: {
    borderRadius: 16,
  },
  typeModalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 24,
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
  },
  typeModalTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#1F2937",
  },
  typeModalTitleSmall: {
    fontSize: 18,
  },
  typeModalContent: {
    padding: 20,
  },
  typeOption: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#F3F4F6",
  },
  typeOptionSmall: {
    paddingVertical: 14,
  },
  disabledTypeOption: {
    opacity: 0.7,
  },
  typeIconContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 16,
  },
  typeIconContainerSmall: {
    width: 44,
    height: 44,
    borderRadius: 22,
    marginRight: 12,
  },
  typeInfo: {
    flex: 1,
  },
  typeNameRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 4,
  },
  typeNameRowSmall: {
    marginBottom: 3,
  },
  typeName: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1F2937",
  },
  typeNameSmall: {
    fontSize: 15,
  },
  disabledTypeName: {
    color: "#9CA3AF",
  },
  statusBadgeSmall: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FEF3C7",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 4,
  },
  statusBadgeSmallSmall: {
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: 10,
  },
  statusBadgeText: {
    fontSize: 10,
    fontWeight: "600",
    color: "#92400E",
  },
  statusBadgeTextSmall: {
    fontSize: 9,
  },
  alreadyHaveText: {
    fontSize: 12,
    color: "#6B7280",
    fontStyle: "italic",
    marginTop: 4,
  },
  alreadyHaveTextSmall: {
    fontSize: 11,
  },
  
  // Duplicate Error Modal
  duplicateErrorModal: {
    backgroundColor: Colors.white,
    borderRadius: 24,
    padding: 30,
    width: "100%",
    maxWidth: 400,
    alignItems: "center",
  },
  duplicateErrorModalSmall: {
    padding: 24,
    borderRadius: 20,
  },
  duplicateErrorIcon: {
    marginBottom: 20,
  },
  duplicateErrorTitle: {
    fontSize: 22,
    fontWeight: "700",
    color: "#1F2937",
    marginBottom: 12,
    textAlign: "center",
  },
  duplicateErrorTitleSmall: {
    fontSize: 20,
  },
  duplicateErrorMessage: {
    fontSize: 15,
    color: "#DC2626",
    textAlign: "center",
    lineHeight: 22,
    marginBottom: 28,
    fontWeight: "500",
  },
  duplicateErrorMessageSmall: {
    fontSize: 14,
    lineHeight: 20,
  },
  duplicateErrorButtons: {
    flexDirection: "row",
    width: "100%",
    gap: 12,
  },
  duplicateErrorButtonsSmall: {
    gap: 8,
  },
  duplicateErrorButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 12,
    padding: 16,
    gap: 8,
  },
  viewDocumentsButton: {
    backgroundColor: Colors.primary,
  },
  viewDocumentsButtonText: {
    fontSize: 15,
    fontWeight: "600",
    color: Colors.white,
  },
  viewDocumentsButtonTextSmall: {
    fontSize: 14,
  },
  chooseOtherButton: {
    backgroundColor: Colors.white,
    borderWidth: 1.5,
    borderColor: Colors.primary,
  },
  chooseOtherButtonText: {
    fontSize: 15,
    fontWeight: "600",
    color: Colors.primary,
  },
  chooseOtherButtonTextSmall: {
    fontSize: 14,
  },
  
  // Validation Modal
  validationModal: {
    backgroundColor: Colors.white,
    borderRadius: 20,
    padding: 30,
    width: "100%",
    maxWidth: 400,
  },
  validationModalSmall: {
    padding: 24,
  },
  validationHeader: {
    alignItems: "center",
    marginBottom: 24,
  },
  validationIcon: {
    marginBottom: 16,
  },
  validationTitle: {
    fontSize: 22,
    fontWeight: "700",
    color: "#1F2937",
    marginBottom: 8,
    textAlign: "center",
  },
  validationTitleSmall: {
    fontSize: 20,
  },
  validationSubtitle: {
    fontSize: 14,
    color: "#6B7280",
    textAlign: "center",
  },
  validationSubtitleSmall: {
    fontSize: 13,
  },
  validationContent: {
    maxHeight: 200,
    marginBottom: 24,
  },
  validationContentSmall: {
    maxHeight: 180,
  },
  errorItem: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: 12,
    backgroundColor: "#FEF2F2",
    padding: 14,
    borderRadius: 10,
  },
  errorItemSmall: {
    padding: 12,
    marginBottom: 10,
  },
  errorIcon: {
    marginTop: 1,
  },
  errorText: {
    fontSize: 14,
    color: "#DC2626",
    marginLeft: 10,
    flex: 1,
    lineHeight: 20,
  },
  errorTextSmall: {
    fontSize: 13,
    lineHeight: 18,
  },
  validationButton: {
    backgroundColor: Colors.primary,
    borderRadius: 12,
    padding: 16,
    alignItems: "center",
  },
  validationButtonSmall: {
    padding: 14,
  },
  validationButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: Colors.white,
  },
  validationButtonTextSmall: {
    fontSize: 15,
  },
  
  // Success Modal
  successModal: {
    backgroundColor: Colors.white,
    borderRadius: 24,
    padding: 30,
    width: "100%",
    maxWidth: 400,
    alignItems: "center",
  },
  successModalSmall: {
    padding: 24,
    borderRadius: 20,
  },
  successIconContainer: {
    marginBottom: 24,
  },
  successIconCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "#10B981",
    justifyContent: "center",
    alignItems: "center",
  },
  successIconCircleSmall: {
    width: 70,
    height: 70,
    borderRadius: 35,
  },
  successTitle: {
    fontSize: 24,
    fontWeight: "700",
    color: "#1F2937",
    marginBottom: 12,
    textAlign: "center",
  },
  successTitleSmall: {
    fontSize: 22,
  },
  successMessageText: {
    fontSize: 15,
    color: "#6B7280",
    textAlign: "center",
    lineHeight: 22,
    marginBottom: 20,
  },
  successMessageTextSmall: {
    fontSize: 14,
    lineHeight: 20,
  },
  successButtons: {
    width: "100%",
  },
  successButton: {
    borderRadius: 12,
    padding: 16,
    alignItems: "center",
  },
  primaryButton: {
    backgroundColor: Colors.primary,
  },
  primaryButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: Colors.white,
  },
  primaryButtonTextSmall: {
    fontSize: 15,
  },
  
  // View Modal
  viewModal: {
    backgroundColor: Colors.white,
    borderRadius: 20,
    width: "100%",
    maxWidth: 500,
    height: "85%",
    overflow: "hidden",
  },
  viewModalSmall: {
    borderRadius: 16,
    maxHeight: "90%",
  },
  viewModalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 24,
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
  },
  viewModalTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#1F2937",
  },
  viewModalTitleSmall: {
    fontSize: 18,
  },
  viewModalScrollContent: {

    paddingBottom: 0,
    paddingTop: 16,
      paddingHorizontal: 8, // Added horizontal padding for better spacing

  },
  // Status Banner
  statusBanner: {
    padding: 20,
    borderRadius: 12,
    marginBottom: 20,
    borderWidth: 1,
  },
  statusBannerContent: {
    flexDirection: "row",
    alignItems: "center",
  },
  statusBannerIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: Colors.white,
    justifyContent: "center",
    alignItems: "center",
  },
  statusBannerIconContainerSmall: {
    width: 40,
    height: 40,
    borderRadius: 20,
  },
  statusBannerTextContainer: {
    flex: 1,
  },
  statusBannerTitle: {
    fontSize: 18,
    fontWeight: "700",
    marginBottom: 4,
  },
  statusBannerTitleSmall: {
    fontSize: 16,
  },
  statusBannerSubtitle: {
    fontSize: 14,
    color: "#6B7280",
    fontWeight: "500",
  },
  statusBannerSubtitleSmall: {
    fontSize: 13,
  },
  // Section Container
  sectionContainer: {
    backgroundColor: Colors.white,
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  sectionDivider: {
    height: 1,
    backgroundColor: "#E5E7EB",
    marginBottom: 20,
  },
  sectionIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#F3F4F6",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  sectionIconContainerSmall: {
    width: 36,
    height: 36,
    borderRadius: 18,
    marginRight: 10,
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: "600",
    color: "#6B7280",
  },
  sectionTitleSmall: {
    fontSize: 16,
  },
  detailsList: {
    marginLeft: 4,
  },
  detailItem: {
    flexDirection: "row",
    marginBottom: 20,
  },
  detailItemSmall: {
    marginBottom: 16,
  },
  expiredDetailItem: {
    backgroundColor: "#FEF2F2",
    padding: 12,
    borderRadius: 8,
    marginLeft: -12,
    marginRight: -12,
  },
  detailIconContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#F9FAFB",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  detailIconContainerSmall: {
    width: 32,
    height: 32,
    borderRadius: 16,
  },
  detailContent: {
    flex: 1,
  },
  detailLabel: {
    fontSize: 13,
    color: "#6B7280",
    fontWeight: "500",
    marginBottom: 4,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  detailLabelSmall: {
    fontSize: 12,
  },
  detailValue: {
    fontSize: 16,
    color: "#1F2937",
    fontWeight: "600",
  },
  detailValueSmall: {
    fontSize: 15,
  },
  // Rejection Section
  rejectionSection: {
    backgroundColor: "#FEF2F2",
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "#FECACA",
  },
  rejectionContent: {
    marginLeft: 4,
  },
  rejectionLabel: {
    fontSize: 13,
    color: "#DC2626",
    fontWeight: "600",
    marginBottom: 8,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  rejectionLabelSmall: {
    fontSize: 12,
  },
  rejectionText: {
    fontSize: 15,
    color: "#1F2937",
    lineHeight: 22,
    fontWeight: "500",
  },
  rejectionTextSmall: {
    fontSize: 14,
    lineHeight: 20,
  },
  // Action Buttons in View Modal
  actionButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
  },
  reuploadActionButtonModal: {
    backgroundColor: "#3B82F6",
  },
  reuploadActionButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: Colors.white,
    marginLeft: 8,
  },
  closeViewButton: {
    backgroundColor: "#F3F4F6",
  },
  closeViewButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#374151",
  },
  viewModalFooter: {
    padding: 24,
    borderTopWidth: 1,
    borderTopColor: "#E5E7EB",
  },
  
  // Delete Modal
  deleteModal: {
    backgroundColor: Colors.white,
    borderRadius: 20,
    padding: 30,
    width: "100%",
    maxWidth: 400,
    alignItems: "center",
  },
  deleteModalSmall: {
    padding: 24,
  },
  deleteIcon: {
    marginBottom: 20,
  },
  deleteTitle: {
    fontSize: 22,
    fontWeight: "700",
    color: "#1F2937",
    marginBottom: 12,
    textAlign: "center",
  },
  deleteTitleSmall: {
    fontSize: 20,
  },
  deleteMessage: {
    fontSize: 15,
    color: "#6B7280",
    textAlign: "center",
    lineHeight: 22,
    marginBottom: 28,
  },
  deleteMessageSmall: {
    fontSize: 14,
    lineHeight: 20,
  },
  deleteButtons: {
    flexDirection: "row",
    width: "100%",
    gap: 12,
  },
  deleteButtonsSmall: {
    gap: 8,
  },
  deleteButtonModal: {
    flex: 1,
    borderRadius: 12,
    padding: 16,
    alignItems: "center",
  },
  cancelButton: {
    backgroundColor: "#F3F4F6",
  },
  cancelButtonText: {
    fontSize: 15,
    fontWeight: "600",
    color: "#374151",
  },
  cancelButtonTextSmall: {
    fontSize: 14,
  },
  confirmDeleteButton: {
    backgroundColor: "#DC2626",
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  confirmDeleteText: {
    fontSize: 15,
    fontWeight: "600",
    color: Colors.white,
  },
  confirmDeleteTextSmall: {
    fontSize: 14,
  },
  singleRowContainer: {
  flexDirection: "row",
  gap: 12,
  marginTop: 12,
},

singleRowButton: {
  flex: 1,
  flexDirection: "row",
  alignItems: "center",
  justifyContent: "center",
  paddingVertical: 12,
  borderRadius: 8,
  borderWidth: 1,
  borderColor: "#D1D5DB",
  backgroundColor: "#FFFFFF",
},

singleRowText: {
  marginLeft: 8,
  fontSize: 13,
  fontWeight: "500",
  color: "#1F2937",
},

});