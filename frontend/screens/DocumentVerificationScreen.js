// import React, { useState, useEffect, useCallback, useRef } from "react";
// import {
//   View,
//   Text,
//   StyleSheet,
//   TouchableOpacity,
//   ScrollView,
//   StatusBar,
//   Image,
//   TextInput,
//   Alert,
//   ActivityIndicator,
//   Modal,
//   Dimensions,
//   Platform,
//   Animated,
//   Easing,
//   RefreshControl,
// } from "react-native";
// import { SafeAreaView } from "react-native-safe-area-context";
// import { Ionicons, MaterialIcons, FontAwesome5 } from "@expo/vector-icons";
// import * as ImagePicker from "expo-image-picker";
// import { Colors } from "../constants/Colors";
// import DatabaseService from "../services/DatabaseService";
// import DateTimePicker from "@react-native-community/datetimepicker";
// import * as Haptics from "expo-haptics";

// const { width, height } = Dimensions.get("window");
// const isSmallScreen = width < 375;
// const isTablet = width > 768;

// export default function DocumentUploadScreen({ navigation, route }) {
//   const phoneNumber =
//     route?.params?.phoneNumber ||
//     navigation?.getState()?.routes
//       ?.find((r) => r.params?.phoneNumber)
//       ?.params?.phoneNumber ||
//     null;
  
//   // States
//   const [loading, setLoading] = useState(false);
//   const [refreshing, setRefreshing] = useState(false);
//   const [documents, setDocuments] = useState([]);
//   const [documentTypes, setDocumentTypes] = useState([]);
  
//   // Animation values
//   const [fadeAnim] = useState(new Animated.Value(1));
//   const [slideAnim] = useState(new Animated.Value(0));

//   // Upload form states
//   const [selectedType, setSelectedType] = useState(null);
//   const [documentNumber, setDocumentNumber] = useState("");
//   const [documentName, setDocumentName] = useState("");
//   const [vehicleNumber, setVehicleNumber] = useState("");
//   const [issueDate, setIssueDate] = useState(null);
//   const [expiryDate, setExpiryDate] = useState(null);
//   const [showIssueDatePicker, setShowIssueDatePicker] = useState(false);
//   const [showExpiryDatePicker, setShowExpiryDatePicker] = useState(false);

//   // Image states
//   const [frontImage, setFrontImage] = useState(null);
//   const [backImage, setBackImage] = useState(null);
//   const [selfieImage, setSelfieImage] = useState(null);

//   // Modal states
//   const [showTypeModal, setShowTypeModal] = useState(false);
//   const [showSuccessModal, setShowSuccessModal] = useState(false);
//   const [showViewModal, setShowViewModal] = useState(false);
//   const [showDeleteModal, setShowDeleteModal] = useState(false);
//   const [showDuplicateErrorModal, setShowDuplicateErrorModal] = useState(false);
//   const [uploadedDocId, setUploadedDocId] = useState(null);
//   const [selectedDocument, setSelectedDocument] = useState(null);
//   const [duplicateError, setDuplicateError] = useState("");

//   // Reupload states for rejected documents
//   const [reuploadingDocId, setReuploadingDocId] = useState(null);
//   const [isReuploadMode, setIsReuploadMode] = useState(false);

//   // Validation states
//   const [validationErrors, setValidationErrors] = useState([]);
//   const [showValidationModal, setShowValidationModal] = useState(false);

//   // Track document status
//   const [uploadStatus, setUploadStatus] = useState({
//     allUploaded: false,
//     approvedCount: 0,
//     pendingCount: 0,
//     rejectedCount: 0,
//     missingTypes: [],
//     hasPendingOrRejected: false,
//   });

//   const scrollViewRef = useRef();

//   // Calculate document status
//   useEffect(() => {
//     if (documentTypes.length > 0) {
//       const approvedDocs = documents.filter(doc => doc.status === "approved");
//       const approvedTypes = approvedDocs.map(doc => doc.document_type);
      
//       // Find missing document types (types that exist but user doesn't have approved version)
//       const missingTypes = documentTypes
//         .filter(type => !approvedTypes.includes(type.type))
//         .map(type => type.name);
      
//       const allUploaded = missingTypes.length === 0 && documents.length > 0;
      
//       // Check if user has any pending or rejected documents for any type
//       const hasPendingOrRejected = documents.some(doc => 
//         (doc.status === "pending" || doc.status === "rejected")
//       );
      
//       setUploadStatus({
//         allUploaded,
//         approvedCount: approvedDocs.length,
//         pendingCount: documents.filter(doc => doc.status === "pending").length,
//         rejectedCount: documents.filter(doc => doc.status === "rejected").length,
//         missingTypes,
//         hasPendingOrRejected,
//       });
//     }
//   }, [documents, documentTypes]);

//   // Check if user already has any document (approved, pending, or rejected) of selected type
//   const hasAnyDocumentType = (type) => {
//     return documents.some(doc => doc.document_type === type);
//   };

//   // Check if user has pending document of selected type
//   const hasPendingDocumentType = (type) => {
//     return documents.some(doc => doc.document_type === type && doc.status === "pending");
//   };

//   // Check if user has rejected document of selected type
//   const hasRejectedDocumentType = (type) => {
//     return documents.some(doc => doc.document_type === type && doc.status === "rejected");
//   };

//   // Initialize
//   useEffect(() => {
//     if (!phoneNumber) {
//       showErrorPopup("Phone number not found. Please login again.");
//       navigation.goBack();
//       return;
//     }

//     loadData();
//     startAnimations();
//   }, [phoneNumber]);

//   const startAnimations = () => {
//     Animated.parallel([
//       Animated.timing(fadeAnim, {
//         toValue: 1,
//         duration: 800,
//         useNativeDriver: true,
//       }),
//       Animated.timing(slideAnim, {
//         toValue: 0,
//         duration: 600,
//         easing: Easing.out(Easing.back(1.5)),
//         useNativeDriver: true,
//       }),
//     ]).start();
//   };

//   const loadData = async () => {
//     try {
//       setLoading(true);
      
//       // Load document types
//       const typesRes = await DatabaseService.getDocumentTypes();
//       if (typesRes.success) {
//         // Filter out passport and PAN if they exist
//         const filteredTypes = (typesRes.document_types || []).filter(
//           type => !['passport', 'pan'].includes(type.type)
//         );
//         setDocumentTypes(filteredTypes);
//       }

//       // Load user's existing documents
//       const docsRes = await DatabaseService.getUserDocuments(phoneNumber);
//       if (docsRes.success) {
//         // Filter out passport and PAN documents if they exist
//         const filteredDocs = (docsRes.documents || []).filter(
//           doc => !['passport', 'pan'].includes(doc.document_type)
//         );
//         setDocuments(filteredDocs);
//       }
//     } catch (error) {
//       console.error("Load data error:", error);
//       showErrorPopup("Failed to load data. Please check your connection.");
//     } finally {
//       setLoading(false);
//       setRefreshing(false);
//     }
//   };

//   const onRefresh = useCallback(() => {
//     setRefreshing(true);
//     loadData();
//   }, []);

//   const requestCameraPermission = async () => {
//     if (Platform.OS !== "web") {
//       const { status } = await ImagePicker.requestCameraPermissionsAsync();
//       if (status !== "granted") {
//         showErrorPopup("Camera permission is required to take photos of your documents.");
//         return false;
//       }
//     }
//     return true;
//   };

//   const requestGalleryPermission = async () => {
//     if (Platform.OS !== "web") {
//       const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
//       if (status !== "granted") {
//         showErrorPopup("Gallery permission is required to select photos.");
//         return false;
//       }
//     }
//     return true;
//   };

//   const captureImage = async (type) => {
//     const hasPermission = await requestCameraPermission();
//     if (!hasPermission) return;

//     try {
//       const result = await ImagePicker.launchCameraAsync({
//         mediaTypes: ImagePicker.MediaTypeOptions.Images,
//         allowsEditing: true,
//         aspect: [4, 3],
//         quality: 0.9,
//       });

//       if (!result.canceled && result.assets && result.assets[0]) {
//         const imageUri = result.assets[0].uri;
        
//         // Haptic feedback
//         Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

//         switch (type) {
//           case "front":
//             setFrontImage(imageUri);
//             break;
//           case "back":
//             setBackImage(imageUri);
//             break;
//           case "selfie":
//             setSelfieImage(imageUri);
//             break;
//         }
//       }
//     } catch (error) {
//       console.error("Camera error:", error);
//       showErrorPopup("Failed to capture image. Please try again.");
//     }
//   };

//   const pickImageFromGallery = async (type) => {
//     const hasPermission = await requestGalleryPermission();
//     if (!hasPermission) return;

//     try {
//       const result = await ImagePicker.launchImageLibraryAsync({
//         mediaTypes: ImagePicker.MediaTypeOptions.Images,
//         allowsEditing: true,
//         aspect: [4, 3],
//         quality: 0.9,
//       });

//       if (!result.canceled && result.assets && result.assets[0]) {
//         const imageUri = result.assets[0].uri;
        
//         // Haptic feedback
//         Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

//         switch (type) {
//           case "front":
//             setFrontImage(imageUri);
//             break;
//           case "back":
//             setBackImage(imageUri);
//             break;
//           case "selfie":
//             setSelfieImage(imageUri);
//             break;
//         }
//       }
//     } catch (error) {
//       console.error("Gallery error:", error);
//       showErrorPopup("Failed to pick image. Please try again.");
//     }
//   };

//   const handleSelectDocumentType = (type) => {
//     // Check if user already has any document of this type
//     // But ALLOW if it's in reupload mode (user is replacing a rejected document)
//     if (hasAnyDocumentType(type) && !isReuploadMode) {
//       const docTypeName = documentTypes.find(d => d.type === type)?.name || type;
//       const hasPending = hasPendingDocumentType(type);
//       const hasRejected = hasRejectedDocumentType(type);
      
//       let errorMessage = "";
//       if (hasPending) {
//         errorMessage = `You have a pending ${docTypeName} document. Please wait for approval or delete it to upload a new one.`;
//       } else if (hasRejected) {
//         errorMessage = `Your ${docTypeName} document was rejected. Please reupload it from your documents list.`;
//       } else {
//         errorMessage = `You already have an approved ${docTypeName} document.`;
//       }
      
//       setDuplicateError(errorMessage);
//       setShowDuplicateErrorModal(true);
//       Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
//       return;
//     }

//     // If in reupload mode, only allow selecting the same document type
//     if (isReuploadMode && selectedType && type !== selectedType) {
//       const currentTypeName = documentTypes.find(d => d.type === selectedType)?.name || selectedType;
//       const newTypeName = documentTypes.find(d => d.type === type)?.name || type;
      
//       setDuplicateError(`You are reuploading a ${currentTypeName}. Cannot switch to ${newTypeName} during reupload. Cancel reupload first.`);
//       setShowDuplicateErrorModal(true);
//       Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
//       return;
//     }

//     setSelectedType(type);
//     setShowTypeModal(false);
//     Haptics.selectionAsync();

//     // Only clear data if not in reupload mode
//     if (!isReuploadMode) {
//       setDocumentNumber("");
//       setDocumentName("");
//       setVehicleNumber("");
//       setIssueDate(null);
//       setExpiryDate(null);
//       setFrontImage(null);
//       setBackImage(null);
//       setSelfieImage(null);
//     }
//   };

//   const handleReuploadDocument = (doc) => {
//     // Enable reupload mode first
//     setIsReuploadMode(true);
//     setReuploadingDocId(doc.id);
    
//     // Set all the document data
//     setSelectedType(doc.document_type);
//     setDocumentNumber(doc.document_number);
//     setDocumentName(doc.document_name);
//     setVehicleNumber(doc.document_data?.vehicle_number || doc.vehicle_number || "");
    
//     // Reset images - they need to be reuploaded
//     setFrontImage(null);
//     setBackImage(null);
//     setSelfieImage(null);
    
//     // Don't set issue date for Aadhar
//     if (doc.document_type !== "aadhar" && doc.issue_date) {
//       setIssueDate(new Date(doc.issue_date));
//     } else {
//       setIssueDate(null);
//     }
    
//     if (doc.expiry_date) {
//       setExpiryDate(new Date(doc.expiry_date));
//     } else {
//       setExpiryDate(null);
//     }
    
//     setShowViewModal(false);
//     Haptics.selectionAsync();
    
//     // Scroll to upload form
//     setTimeout(() => {
//       scrollViewRef?.current?.scrollTo({ y: 0, animated: true });
//     }, 100);
//   };

//   const validateForm = () => {
//     const errors = [];

//     if (!selectedType) {
//       errors.push("Please select a document type.");
//     }

//     if (!documentNumber.trim()) {
//       errors.push("Please enter document number.");
//     }

//     if (!documentName.trim()) {
//       errors.push("Please enter name as on document.");
//     }

//     const docType = documentTypes.find((d) => d.type === selectedType);

//     if (docType && docType.type === "rc" && !vehicleNumber.trim()) {
//       errors.push("Please enter vehicle number for RC.");
//     }

//     if (docType && (docType.type === "dl" || docType.type === "rc") && !expiryDate) {
//       errors.push(`Please select expiry date for ${docType.name}.`);
//     }

//     if (!frontImage) {
//       errors.push("Please upload front side image.");
//     }

//     if (docType && docType.has_back_side && !backImage) {
//       errors.push("Please upload back side image.");
//     }

//     if (!selfieImage) {
//       errors.push("Please upload selfie with document.");
//     }

//     // Validate document number format based on type
//     if (selectedType && documentNumber.trim()) {
//       switch (selectedType) {
//         case "aadhar":
//           // Aadhar: 12 digits
//           if (!/^\d{12}$/.test(documentNumber.trim())) {
//             errors.push("Aadhar number must be exactly 12 digits.");
//           }
//           break;
//         case "dl":
//           // DL: alphanumeric, usually 15-16 characters
//           if (!/^[A-Z0-9]{15,16}$/i.test(documentNumber.trim())) {
//             errors.push("DL number should be 15-16 alphanumeric characters.");
//           }
//           break;
//         case "rc":
//           // RC: alphanumeric, specific format
//           if (!/^[A-Z]{2}[0-9]{1,2}[A-Z]{1,2}[0-9]{4}$/i.test(documentNumber.trim())) {
//             errors.push("RC number format: XX99XX9999 (e.g., MH01AB1234)");
//           }
//           break;
//       }
//     }

//     // Validate vehicle number for RC
//     if (selectedType === "rc" && vehicleNumber.trim()) {
//       const vehicleRegex = /^[A-Z]{2}[0-9]{1,2}[A-Z]{1,2}[0-9]{4}$/i;
//       if (!vehicleRegex.test(vehicleNumber.trim())) {
//         errors.push("Vehicle number format: XX99XX9999 (e.g., MH01AB1234)");
//       }
//     }

//     // Validate name
//     if (documentName.trim() && documentName.trim().length < 3) {
//       errors.push("Name should be at least 3 characters long.");
//     }

//     // Validate expiry date (should be in future)
//     if (expiryDate) {
//       const today = new Date();
//       today.setHours(0, 0, 0, 0);
//       if (expiryDate < today) {
//         errors.push("Expiry date should be in the future.");
//       }
//     }

//     // Validate issue date (should not be in future) - but not for Aadhar
//     if (issueDate && selectedType !== "aadhar") {
//       const today = new Date();
//       today.setHours(0, 0, 0, 0);
//       if (issueDate > today) {
//         errors.push("Issue date cannot be in the future.");
//       }
//     }

//     // Validate issue date is before expiry date
//     if (issueDate && expiryDate && issueDate >= expiryDate) {
//       errors.push("Issue date must be before expiry date.");
//     }

//     if (errors.length > 0) {
//       setValidationErrors(errors);
//       setShowValidationModal(true);
//       Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
//       return false;
//     }

//     return true;
//   };

//  const createFormData = () => {
//   const formData = new FormData();

//   formData.append("phone_number", phoneNumber);
//   formData.append("document_type", selectedType);
//   formData.append("document_number", documentNumber.trim());
//   formData.append("document_name", documentName.trim());

//   if (selectedType !== "aadhar" && issueDate) {
//     formData.append("issue_date", issueDate.toISOString().split("T")[0]);
//   }

//   if (expiryDate) {
//     formData.append("expiry_date", expiryDate.toISOString().split("T")[0]);
//   }

//   if (selectedType === "rc" && vehicleNumber) {
//     formData.append("vehicle_number", vehicleNumber.trim());
//   }

//   // Append images
//   const frontImageName = frontImage.split("/").pop();
//   formData.append("front_image", {
//     uri: frontImage,
//     name: frontImageName,
//     type: "image/jpeg",
//   });

//   if (backImage) {
//     const backImageName = backImage.split("/").pop();
//     formData.append("back_image", {
//       uri: backImage,
//       name: backImageName,
//       type: "image/jpeg",
//     });
//   }

//   const selfieImageName = selfieImage.split("/").pop();
//   formData.append("selfie_image", {
//     uri: selfieImage,
//     name: selfieImageName,
//     type: "image/jpeg",
//   });

//   // ✅ CRITICAL: Add reupload flags if in reupload mode
//   if (isReuploadMode && reuploadingDocId) {
//     formData.append("is_reupload", "true");
//     formData.append("reupload_document_id", reuploadingDocId.toString());
    
//     console.log("🔄 Reupload mode enabled, document ID:", reuploadingDocId);
//   }

//   return formData;
// };
// const handleSubmit = async () => {
//   if (!validateForm()) return;

//   setLoading(true);
//   Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);

//   try {
//     const formData = createFormData();
//     const result = await DatabaseService.uploadDocument(formData);
    
//     if (result.success) {
//       setUploadedDocId(result.document_id);
//       setShowSuccessModal(true);
//       Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

//       // Refresh documents list - this will remove the rejected document if reupload was successful
//       await loadData();

//       // Reset form
//       resetForm();
//     } else {
//       // Check for duplicate document error
//       if (result.message && (result.message.includes("already have") || result.message.includes("already exists"))) {
//         setDuplicateError(result.message);
//         setShowDuplicateErrorModal(true);
        
//         // If in reupload mode and got duplicate error, show specific message
//         if (isReuploadMode) {
//           setDuplicateError(`Cannot reupload: ${result.message}. Please cancel reupload and try again.`);
//         }
//       } else {
//         showErrorPopup(result.message || "Failed to upload document. Please try again.");
//       }
//     }
//   } catch (error) {
//     console.error("Submit error:", error);
    
//     // Improved error handling for reupload scenarios
//     let errorMessage = error.message || "Failed to upload document. Please try again.";
    
//     if (error.message.includes("already have") || error.message.includes("already exists")) {
//       if (isReuploadMode) {
//         errorMessage = `Cannot reupload document: ${error.message}. The rejected document might have been modified.`;
//       } else {
//         setDuplicateError(error.message);
//         setShowDuplicateErrorModal(true);
//         return;
//       }
//     }
    
//     showErrorPopup(errorMessage);
//   } finally {
//     setLoading(false);
//   }
// };

//   const handleDeleteDocument = async (docId) => {
//     try {
//       setLoading(true);
//       const result = await DatabaseService.deleteDocument(docId);
//       if (result.success) {
//         showSuccessPopup("Document deleted successfully!");
//         await loadData();
//         setShowDeleteModal(false);
//         resetForm(); // Reset form if we're in reupload mode
//       } else {
//         showErrorPopup(result.message || "Failed to delete document.");
//       }
//     } catch (error) {
//       console.error("Delete error:", error);
//       showErrorPopup("Failed to delete document. Please try again.");
//     } finally {
//       setLoading(false);
//     }
//   };

//   const resetForm = () => {
//     setIsReuploadMode(false);
//     setReuploadingDocId(null);
//     setSelectedType(null);
//     setDocumentNumber("");
//     setDocumentName("");
//     setVehicleNumber("");
//     setIssueDate(null);
//     setExpiryDate(null);
//     setFrontImage(null);
//     setBackImage(null);
//     setSelfieImage(null);
//     setValidationErrors([]);
//   };

//   const showSuccessPopup = (message) => {
//     Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
//     Alert.alert(
//       "Success!",
//       message,
//       [{ text: "OK", onPress: () => {} }],
//       { cancelable: true }
//     );
//   };

//   const showErrorPopup = (message) => {
//     Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
//     Alert.alert(
//       "Error",
//       message,
//       [{ text: "OK", onPress: () => {} }],
//       { cancelable: true }
//     );
//   };

//   // ========== RENDER FUNCTIONS ==========

//   const renderHeader = () => (
//     <View style={styles.header}>
//       <TouchableOpacity
//         style={styles.modernBackButton}
//         onPress={() => {
//           navigation.goBack();
//           Haptics.selectionAsync();
//         }}
//         activeOpacity={0.8}
//       >
//         <MaterialIcons
//           name="arrow-back-ios"
//           size={28}
//           color={Colors.orange1}
//         />
//       </TouchableOpacity>

//       <Text style={styles.headerTitleModern}>
//         Document Verification
//       </Text>

//       <TouchableOpacity
//         style={styles.modernRefreshButton}
//         onPress={loadData}
//         disabled={loading || refreshing}
//         activeOpacity={0.8}
//       >
//         <Ionicons
//           name="refresh"
//           size={26}
//           color={Colors.primary}
//         />
//       </TouchableOpacity>
//     </View>
//   );

//   const renderUploadView = () => (
//     <ScrollView
//       ref={scrollViewRef}
//       showsVerticalScrollIndicator={false}
//       contentContainerStyle={styles.scrollContent}
//       refreshControl={
//         <RefreshControl
//           refreshing={refreshing}
//           onRefresh={onRefresh}
//           colors={[Colors.primary]}
//           tintColor={Colors.primary}
//         />
//       }
//     >
//       {/* Header Section */}
//       <Animated.View 
//         style={[
//           styles.headerSection,
//           {
//             opacity: fadeAnim,
//             transform: [{ translateY: slideAnim }],
//           }
//         ]}
//       >
//         <View style={styles.headerIcon}>
//           <Ionicons name="shield-checkmark" size={isSmallScreen ? 28 : 32} color={Colors.primary} />
//         </View>
//         <View style={styles.headerText}>
//           <Text style={styles.headerTitle}>Document Verification</Text>
//           <Text style={styles.headerSubtitle}>
//             {documents.length > 0 
//               ? `${uploadStatus.approvedCount}/${documentTypes.length} documents verified`
//               : "Upload your documents for verification"}
//           </Text>
//         </View>
//       </Animated.View>

//       {/* Reupload Mode Banner */}
//       {isReuploadMode && (
//         <Animated.View 
//           style={[
//             styles.reuploadBanner,
//             {
//               opacity: fadeAnim,
//               transform: [{ translateY: slideAnim }],
//             }
//           ]}
//         >
//           <Ionicons name="information-circle" size={18} color="#3B82F6" />
//           <View style={styles.reuploadBannerContent}>
//             <Text style={styles.reuploadTitle}>Reupload Mode</Text>
//             <Text style={styles.reuploadText}>
//               You are reuploading a rejected document. Please correct the issues and upload again.
//             </Text>
//           </View>
//           <TouchableOpacity
//             onPress={resetForm}
//             activeOpacity={0.7}
//           >
//             <Ionicons name="close" size={20} color="#6B7280" />
//           </TouchableOpacity>
//         </Animated.View>
//       )}

//       {/* Existing Documents Section */}
//       {documents.length > 0 && (
//         <Animated.View 
//           style={[
//             styles.section,
//             {
//               opacity: fadeAnim,
//               transform: [{ translateY: slideAnim }],
//             }
//           ]}
//         >
//           <View style={styles.sectionHeader}>
//             <Text style={styles.sectionTitle}>Your Uploaded Documents</Text>
//           </View>
          
//           {documents.map(renderDocumentCard)}
//         </Animated.View>
//       )}

//       {/* Upload New Document Section - ONLY SHOW if not all documents are verified OR if user has deleted something */}
//       {(uploadStatus.hasPendingOrRejected || !uploadStatus.allUploaded || isReuploadMode) && (
//         <Animated.View 
//           style={[
//             styles.section,
//             {
//               opacity: fadeAnim,
//               transform: [{ translateY: slideAnim }],
//             }
//           ]}
//         >
//           <View style={styles.sectionHeader}>
//             <Text style={styles.sectionTitle}>
//               {isReuploadMode ? "Reupload Document" : uploadStatus.allUploaded ? "Upload Additional Document" : "Upload New Document"}
//             </Text>
//             {isReuploadMode && (
//               <TouchableOpacity
//                 style={styles.cancelReuploadButton}
//                 onPress={resetForm}
//                 activeOpacity={0.8}
//               >
//                 <Ionicons name="close-circle" size={16} color="#DC2626" />
//                 <Text style={styles.cancelReuploadText}>Cancel Reupload</Text>
//               </TouchableOpacity>
//             )}
//           </View>

//           {/* Document Type Selection */}
//           {renderDocumentTypeSelector()}

//           {/* Only show form if document type is selected */}
//           {(selectedType || isReuploadMode) && (
//             <>
//               {/* Document Number */}
//               {renderInputField(
//                 "Document Number",
//                 documentNumber,
//                 setDocumentNumber,
//                 "Enter your document number",
//                 "default"
//               )}

//               {/* Document Name */}
//               {renderInputField(
//                 "Name as on Document",
//                 documentName,
//                 setDocumentName,
//                 "Enter your full name exactly as on document",
//                 "default"
//               )}

//               {/* Vehicle Number (for RC only) */}
//               {selectedType === "rc" && 
//                 renderInputField(
//                   "Vehicle Number",
//                   vehicleNumber,
//                   setVehicleNumber,
//                   "Enter vehicle registration number",
//                   "default"
//                 )
//               }

//               {/* Date Pickers in Row - Don't show issue date for Aadhar */}
//               <View style={[styles.dateRow, isSmallScreen && { flexDirection: 'column' }]}>
//                 {selectedType !== "aadhar" && renderDatePicker(
//                   issueDate,
//                   setIssueDate,
//                   showIssueDatePicker,
//                   setShowIssueDatePicker,
//                   "Issue Date",
//                   false
//                 )}
                
//                 {(selectedType === "dl" || selectedType === "rc") &&
//                   renderDatePicker(
//                     expiryDate,
//                     setExpiryDate,
//                     showExpiryDatePicker,
//                     setShowExpiryDatePicker,
//                     "Expiry Date",
//                     true
//                   )}
//               </View>

//               {/* Image Upload Sections */}
//               {/* Front Image */}
//               {renderImagePicker("front", frontImage, "Front Side Image", true)}
              
//               {/* Back Image (if required) */}
//               {documentTypes.find((d) => d.type === selectedType)?.has_back_side &&
//                 renderImagePicker("back", backImage, "Back Side Image", true)}
              
//               {/* Selfie Image */}
//               {renderImagePicker("selfie", selfieImage, "Selfie with Document", true)}

//               {/* Submit Button */}
//               <TouchableOpacity
//                 style={[
//                   styles.submitButton,
//                   (!selectedType || loading) && styles.submitButtonDisabled,
//                 ]}
//                 onPress={handleSubmit}
//                 disabled={!selectedType || loading}
//                 activeOpacity={0.8}
//               >
//                 {loading ? (
//                   <ActivityIndicator size="small" color={Colors.white} />
//                 ) : (
//                   <>
//                     <Ionicons name={isReuploadMode ? "refresh-circle" : "cloud-upload-outline"} size={22} color={Colors.white} />
//                     <Text style={styles.submitText}>
//                       {isReuploadMode ? "Reupload Document" : "Upload Document"}
//                     </Text>
//                   </>
//                 )}
//               </TouchableOpacity>
//             </>
//           )}
//         </Animated.View>
//       )}

//       {/* All Documents Verified Message */}
//       {uploadStatus.allUploaded && !isReuploadMode && !uploadStatus.hasPendingOrRejected && (
//         <Animated.View 
//           style={[
//             styles.successMessage,
//             {
//               opacity: fadeAnim,
//               transform: [{ translateY: slideAnim }],
//             }
//           ]}
//         >
//           <View style={styles.successIcon}>
//             <Ionicons name="checkmark-circle" size={isSmallScreen ? 36 : 40} color="#10B981" />
//           </View>
//           <Text style={styles.successTitle}>All Documents Verified</Text>
//           <Text style={styles.successText}>
//             All your documents have been approved. You can view them below.
//           </Text>
//         </Animated.View>
//       )}
//     </ScrollView>
//   );

//   const renderDocumentCard = (doc) => {
//     const getStatusColor = (status) => {
//       switch (status) {
//         case "approved":
//           return "#10B981";
//         case "rejected":
//           return "#EF4444";
//         case "pending":
//           return "#F59E0B";
//         default:
//           return "#6B7280";
//       }
//     };

//     const getStatusIcon = (status) => {
//       switch (status) {
//         case "approved":
//           return "checkmark-circle";
//         case "rejected":
//           return "close-circle";
//         case "pending":
//           return "time";
//         default:
//           return "document";
//       }
//     };

//     const getTypeIcon = (type) => {
//       switch (type) {
//         case "aadhar":
//           return "id-card";
//         case "dl":
//           return "car";
//         case "rc":
//           return "file-contract";
//         default:
//           return "document";
//       }
//     };

//     const docTypeName = documentTypes.find(d => d.type === doc.document_type)?.name ||
//                         doc.document_type.toUpperCase();

//     return (
//       <TouchableOpacity
//         key={doc.id} 
//         style={[styles.documentCard, isSmallScreen && styles.documentCardSmall]}
//         onPress={() => {
//           setSelectedDocument(doc);
//           setShowViewModal(true);
//           Haptics.selectionAsync();
//         }}
//         activeOpacity={0.7}
//       >
//         <View style={styles.documentCardHeader}>
//           <View style={styles.docTypeContainer}>
//             <View style={[styles.docTypeIcon, { backgroundColor: Colors.primary + "20" }]}>
//               <FontAwesome5 name={getTypeIcon(doc.document_type)} size={isSmallScreen ? 14 : 16} color={Colors.primary} />
//             </View>
//             <View style={styles.docTypeInfo}>
//               <View style={styles.docTypeRow}>
//                 <Text style={styles.docTypeName}>{docTypeName}</Text>
//                 <View
//                   style={[
//                     styles.statusBadge,
//                     { backgroundColor: getStatusColor(doc.status) + "20" },
//                   ]}
//                 >
//                   <Ionicons
//                     name={getStatusIcon(doc.status)}
//                     size={isSmallScreen ? 12 : 14}
//                     color={getStatusColor(doc.status)}
//                   />
//                   <Text
//                     style={[
//                       styles.statusText,
//                       { color: getStatusColor(doc.status) },
//                     ]}
//                   >
//                     {doc.status.charAt(0).toUpperCase() + doc.status.slice(1)}
//                   </Text>
//                 </View>
//               </View>
//               <Text style={styles.docNumberSmall}>{doc.document_number}</Text>
//             </View>
//           </View>
//         </View>

//         <Text style={[styles.docName, isSmallScreen && styles.docNameSmall]}>{doc.document_name}</Text>

//         {doc.status === "rejected" && doc.rejection_reason && (
//           <View style={styles.rejectionBox}>
//             <Ionicons name="alert-circle" size={isSmallScreen ? 12 : 14} color="#EF4444" />
//             <Text style={[styles.rejectionText, isSmallScreen && styles.rejectionTextSmall]}>
//               {doc.rejection_reason}
//             </Text>
//           </View>
//         )}

//         <View style={[styles.docMetaContainer, isSmallScreen && styles.docMetaContainerSmall]}>
//           {doc.issue_date && doc.document_type !== "aadhar" && (
//             <View style={styles.metaItem}>
//               <Ionicons name="calendar-outline" size={isSmallScreen ? 12 : 14} color="#6B7280" />
//               <Text style={[styles.metaText, isSmallScreen && styles.metaTextSmall]}>Issued: {doc.issue_date}</Text>
//             </View>
//           )}

//           {doc.expiry_date && (
//             <View style={styles.metaItem}>
//               <Ionicons name="calendar" size={isSmallScreen ? 12 : 14} color={doc.is_expired ? "#EF4444" : "#6B7280"} />
//               <Text style={[styles.metaText, isSmallScreen && styles.metaTextSmall, doc.is_expired && { color: "#EF4444", fontWeight: "600" }]}>
//                 Expires: {doc.expiry_date}
//               </Text>
//             </View>
//           )}
//         </View>

//         <View style={[styles.documentActions, isSmallScreen && styles.documentActionsSmall]}>
//           <TouchableOpacity
//             style={styles.viewButton}
//             onPress={() => {
//               setSelectedDocument(doc);
//               setShowViewModal(true);
//               Haptics.selectionAsync();
//             }}
//           >
//             <Ionicons name="eye" size={isSmallScreen ? 14 : 16} color={Colors.primary} />
//             <Text style={[styles.viewButtonText, isSmallScreen && styles.viewButtonTextSmall]}>View Details</Text>
//           </TouchableOpacity>
          
//           {doc.status === "rejected" && (
//             <TouchableOpacity
//               style={[styles.reuploadActionButton, isSmallScreen && styles.reuploadActionButtonSmall]}
//               onPress={() => handleReuploadDocument(doc)}
//             >
//               <Ionicons name="refresh" size={isSmallScreen ? 14 : 16} color="#3B82F6" />
//               <Text style={[styles.reuploadButtonText, isSmallScreen && styles.reuploadButtonTextSmall]}>Reupload</Text>
//             </TouchableOpacity>
//           )}
          
//           <TouchableOpacity
//             style={styles.deleteButton}
//             onPress={() => {
//               setSelectedDocument(doc);
//               setShowDeleteModal(true);
//               Haptics.selectionAsync();
//             }}
//           >
//             <Ionicons name="trash-outline" size={isSmallScreen ? 14 : 16} color="#EF4444" />
//             <Text style={[styles.deleteButtonText, isSmallScreen && styles.deleteButtonTextSmall]}>Delete</Text>
//           </TouchableOpacity>
//         </View>
//       </TouchableOpacity>
//     );
//   };

//   const renderDocumentTypeSelector = () => (
//     <View style={styles.inputContainer}>
//       <Text style={[styles.inputLabel, isSmallScreen && styles.inputLabelSmall]}>
//         Document Type <Text style={styles.requiredStar}>*</Text>
//       </Text>
//       <TouchableOpacity
//         style={[styles.dropdown, isSmallScreen && styles.dropdownSmall]}
//         onPress={() => {
//           setShowTypeModal(true);
//           Haptics.selectionAsync();
//         }}
//         activeOpacity={0.7}
//       >
//         {selectedType ? (
//           <View style={styles.selectedType}>
//             <View style={[styles.selectedTypeIcon, isSmallScreen && styles.selectedTypeIconSmall]}>
//               <FontAwesome5 
//                 name={selectedType === "aadhar" ? "id-card" : 
//                       selectedType === "dl" ? "car" : 
//                       selectedType === "rc" ? "file-contract" : "id-card"} 
//                 size={isSmallScreen ? 14 : 16} 
//                 color={Colors.primary} 
//               />
//             </View>
//             <View style={styles.selectedTypeInfo}>
//               <Text style={[styles.selectedTypeText, isSmallScreen && styles.selectedTypeTextSmall]}>
//                 {documentTypes.find((d) => d.type === selectedType)?.name || selectedType}
//               </Text>
//               {hasAnyDocumentType(selectedType) && !isReuploadMode && (
//                 <Text style={styles.alreadyExistsWarning}>
//                   <Ionicons name="warning" size={isSmallScreen ? 10 : 12} color="#F59E0B" /> Document exists
//                 </Text>
//               )}
//               {isReuploadMode && (
//                 <Text style={styles.reuploadModeText}>
//                   <Ionicons name="refresh" size={isSmallScreen ? 10 : 12} color="#3B82F6" /> Reupload mode
//                 </Text>
//               )}
//             </View>
//           </View>
//         ) : (
//           <View style={styles.placeholderContainer}>
//             <Ionicons name="document-text" size={isSmallScreen ? 16 : 18} color="#9CA3AF" />
//             <Text style={[styles.placeholderText, isSmallScreen && styles.placeholderTextSmall]}>Select document type</Text>
//           </View>
//         )}
//         <Ionicons name="chevron-down" size={isSmallScreen ? 18 : 20} color="#6B7280" />
//       </TouchableOpacity>
//     </View>
//   );

//   const renderImagePicker = (type, imageUri, label, isRequired = true) => {
//     const hasImage = !!imageUri;

//     return (
//       <View style={styles.imagePickerContainer}>
//         <View style={styles.imagePickerHeader}>
//           <Text style={[styles.imagePickerLabel, isSmallScreen && styles.imagePickerLabelSmall]}>
//             {label} {isRequired && <Text style={styles.requiredStar}>*</Text>}
//           </Text>
//         </View>

//         {!hasImage ? (
//          <View style={styles.singleRowContainer}>
//   <TouchableOpacity
//     style={styles.singleRowButton}
//     onPress={() => captureImage(type)}
//     activeOpacity={0.8}
//   >
//     <Ionicons name="camera-outline" size={18} color="#1F2937" />
//     <Text style={styles.singleRowText}>Take photo</Text>
//   </TouchableOpacity>

//   <TouchableOpacity
//     style={styles.singleRowButton}
//     onPress={() => pickImageFromGallery(type)}
//     activeOpacity={0.8}
//   >
//     <Ionicons name="image-outline" size={18} color="#1F2937" />
//     <Text style={styles.singleRowText}>Gallery</Text>
//   </TouchableOpacity>
// </View>

//         ) : (
//           <View style={styles.imagePreviewSection}>
//             <View style={styles.imagePreviewContainer}>
//               <Image source={{ uri: imageUri }} style={styles.imagePreview} />
//               <View style={styles.imageOverlay}>
//                 <TouchableOpacity
//                   style={styles.previewActionButton}
//                   onPress={() => captureImage(type)}
//                 >
//                   <Ionicons name="camera" size={isSmallScreen ? 16 : 18} color={Colors.white} />
//                   <Text style={[styles.previewActionText, isSmallScreen && styles.previewActionTextSmall]}>Retake</Text>
//                 </TouchableOpacity>
                
//                 <TouchableOpacity
//                   style={styles.previewActionButton}
//                   onPress={() => pickImageFromGallery(type)}
//                 >
//                   <Ionicons name="swap-horizontal" size={isSmallScreen ? 16 : 18} color={Colors.white} />
//                   <Text style={[styles.previewActionText, isSmallScreen && styles.previewActionTextSmall]}>Change</Text>
//                 </TouchableOpacity>
                
//                 <TouchableOpacity
//                   style={[styles.previewActionButton, { backgroundColor: "#EF4444" }]}
//                   onPress={() => {
//                     Haptics.selectionAsync();
//                     if (type === "front") setFrontImage(null);
//                     if (type === "back") setBackImage(null);
//                     if (type === "selfie") setSelfieImage(null);
//                   }}
//                 >
//                   <Ionicons name="trash" size={isSmallScreen ? 16 : 18} color={Colors.white} />
//                   <Text style={[styles.previewActionText, isSmallScreen && styles.previewActionTextSmall]}>Remove</Text>
//                 </TouchableOpacity>
//               </View>
//             </View>
//             <View style={styles.imageStatusBadge}>
//               <Ionicons name="checkmark-circle" size={isSmallScreen ? 12 : 14} color="#10B981" />
//               <Text style={[styles.imageStatusText, isSmallScreen && styles.imageStatusTextSmall]}>Uploaded Successfully</Text>
//             </View>
//           </View>
//         )}
//       </View>
//     );
//   };

//   const renderDatePicker = (date, setDate, showPicker, setShowPicker, label, isRequired = false) => {
//     return (
//       <View style={[styles.datePickerContainer, isSmallScreen && { flex: 1, marginRight: 0, marginBottom: 12 }]}>
//         <Text style={[styles.inputLabel, isSmallScreen && styles.inputLabelSmall]}>
//           {label} {isRequired && <Text style={styles.requiredStar}>*</Text>}
//         </Text>
//         <TouchableOpacity
//           style={[styles.dateInput, isSmallScreen && styles.dateInputSmall]}
//           onPress={() => {
//             setShowPicker(true);
//             Haptics.selectionAsync();
//           }}
//           activeOpacity={0.7}
//         >
//           <View style={styles.dateIcon}>
//             <Ionicons name="calendar" size={isSmallScreen ? 18 : 20} color={Colors.primary} />
//           </View>
//           <Text style={[date ? styles.dateText : styles.placeholderText, isSmallScreen && (date ? styles.dateTextSmall : styles.placeholderTextSmall)]}>
//             {date ? date.toLocaleDateString("en-US", {
//               day: "numeric",
//               month: "short",
//               year: "numeric"
//             }) : "Select Date"}
//           </Text>
//           <Ionicons name="chevron-down" size={isSmallScreen ? 16 : 18} color="#9CA3AF" />
//         </TouchableOpacity>

//         {showPicker && (
//           <DateTimePicker
//             value={date || new Date()}
//             mode="date"
//             display={Platform.OS === "ios" ? "spinner" : "default"}
//             onChange={(event, selectedDate) => {
//               setShowPicker(false);
//               if (selectedDate) {
//                 setDate(selectedDate);
//                 Haptics.selectionAsync();
//               }
//             }}
//             themeVariant="light"
//             style={Platform.OS === "ios" ? { height: 200 } : null}
//           />
//         )}
//       </View>
//     );
//   };

//   const renderInputField = (label, value, onChange, placeholder, keyboardType = "default") => {
//     return (
//       <View style={styles.inputContainer}>
//         <Text style={[styles.inputLabel, isSmallScreen && styles.inputLabelSmall]}>
//           {label} <Text style={styles.requiredStar}>*</Text>
//         </Text>
//         <TextInput
//           style={[styles.input, isSmallScreen && styles.inputSmall]}
//           value={value}
//           onChangeText={onChange}
//           placeholder={placeholder}
//           placeholderTextColor="#9CA3AF"
//           keyboardType={keyboardType}
//           autoCapitalize={label.includes("Vehicle") ? "characters" : "words"}
//         />
//       </View>
//     );
//   };

//   // ========== MODALS ==========

//   const renderTypeModal = () => (
//     <Modal
//       visible={showTypeModal}
//       animationType="slide"
//       transparent={true}
//       onRequestClose={() => setShowTypeModal(false)}
//     >
//       <View style={styles.modalOverlayCenter}>
//         <View style={[styles.typeModal, isSmallScreen && styles.typeModalSmall]}>
//           <View style={styles.typeModalHeader}>
//             <Text style={[styles.typeModalTitle, isSmallScreen && styles.typeModalTitleSmall]}>
//               {isReuploadMode ? "Reupload Document Type" : "Select Document Type"}
//             </Text>
//             <TouchableOpacity 
//               onPress={() => {
//                 setShowTypeModal(false);
//                 Haptics.selectionAsync();
//               }}
//               activeOpacity={0.7}
//             >
//               <Ionicons name="close" size={isSmallScreen ? 24 : 28} color="#6B7280" />
//             </TouchableOpacity>
//           </View>
          
//           <ScrollView style={styles.typeModalContent}>
//             {documentTypes.map((type) => {
//               const hasAny = hasAnyDocumentType(type.type) && !isReuploadMode;
//               const hasPending = hasPendingDocumentType(type.type);
//               const hasRejected = hasRejectedDocumentType(type.type);
              
//               return (
//                 <TouchableOpacity
//                   key={type.type}
//                   style={[styles.typeOption, isSmallScreen && styles.typeOptionSmall, hasAny && styles.disabledTypeOption]}
//                   onPress={() => handleSelectDocumentType(type.type)}
//                   activeOpacity={hasAny ? 1 : 0.7}
//                   disabled={hasAny}
//                 >
//                   <View style={[styles.typeIconContainer, { backgroundColor: Colors.primary + "15" }, isSmallScreen && styles.typeIconContainerSmall]}>
//                     <FontAwesome5 
//                       name={type.type === "aadhar" ? "id-card" : 
//                             type.type === "dl" ? "car" : 
//                             type.type === "rc" ? "file-contract" : "id-card"}
//                       size={isSmallScreen ? 18 : 22} 
//                       color={hasAny ? "#9CA3AF" : Colors.primary} 
//                     />
//                   </View>
//                   <View style={styles.typeInfo}>
//                     <View style={[styles.typeNameRow, isSmallScreen && styles.typeNameRowSmall]}>
//                       <Text style={[styles.typeName, isSmallScreen && styles.typeNameSmall, hasAny && styles.disabledTypeName]}>
//                         {type.name}
//                       </Text>
//                       {hasPending && (
//                         <View style={[styles.statusBadgeSmall, isSmallScreen && styles.statusBadgeSmallSmall]}>
//                           <Ionicons name="time" size={isSmallScreen ? 10 : 12} color="#F59E0B" />
//                           <Text style={[styles.statusBadgeText, isSmallScreen && styles.statusBadgeTextSmall]}>Pending</Text>
//                         </View>
//                       )}
//                       {hasRejected && (
//                         <View style={[styles.statusBadgeSmall, { backgroundColor: "#FEF2F2" }, isSmallScreen && styles.statusBadgeSmallSmall]}>
//                           <Ionicons name="close-circle" size={isSmallScreen ? 10 : 12} color="#EF4444" />
//                           <Text style={[styles.statusBadgeText, isSmallScreen && styles.statusBadgeTextSmall, { color: "#EF4444" }]}>Rejected</Text>
//                         </View>
//                       )}
//                       {!hasPending && !hasRejected && hasAny && (
//                         <View style={[styles.statusBadgeSmall, { backgroundColor: "#F0FDF4" }, isSmallScreen && styles.statusBadgeSmallSmall]}>
//                           <Ionicons name="checkmark-circle" size={isSmallScreen ? 10 : 12} color="#10B981" />
//                           <Text style={[styles.statusBadgeText, isSmallScreen && styles.statusBadgeTextSmall, { color: "#10B981" }]}>Approved</Text>
//                         </View>
//                       )}
//                     </View>
//                     {hasAny && (
//                       <Text style={[styles.alreadyHaveText, isSmallScreen && styles.alreadyHaveTextSmall]}>
//                         {hasPending ? "Document pending review" : 
//                          hasRejected ? "Document was rejected - can reupload" : 
//                          "Document already approved"}
//                       </Text>
//                     )}
//                   </View>
//                   {/* {hasAny ? (
//                     <Ionicons 
//                       name={hasPending ? "time" : hasRejected ? "refresh" : "checkmark"} 
//                       size={isSmallScreen ? 18 : 20} 
//                       color={hasPending ? "#F59E0B" : hasRejected ? "#3B82F6" : "#10B981"} 
//                     />
//                   ) : (
//                     <Ionicons name="chevron-forward" size={isSmallScreen ? 18 : 20} color="#D1D5DB" />
//                   )} */}
//                 </TouchableOpacity>
//               );
//             })}
//           </ScrollView>
//         </View>
//       </View>
//     </Modal>
//   );

//   const renderDuplicateErrorModal = () => (
//     <Modal
//       visible={showDuplicateErrorModal}
//       animationType="fade"
//       transparent={true}
//       onRequestClose={() => setShowDuplicateErrorModal(false)}
//     >
//       <View style={styles.modalOverlayCenter}>
//         <View style={[styles.duplicateErrorModal, isSmallScreen && styles.duplicateErrorModalSmall]}>
//           <View style={styles.duplicateErrorIcon}>
//             <Ionicons name="alert-circle" size={isSmallScreen ? 40 : 50} color="#F59E0B" />
//           </View>
          
//           <Text style={[styles.duplicateErrorTitle, isSmallScreen && styles.duplicateErrorTitleSmall]}>Document Already Exists</Text>
//           <Text style={[styles.duplicateErrorMessage, isSmallScreen && styles.duplicateErrorMessageSmall]}>
//             {duplicateError}
//           </Text>
          
//           <View style={[styles.duplicateErrorButtons, isSmallScreen && styles.duplicateErrorButtonsSmall]}>
//             <TouchableOpacity
//               style={[styles.duplicateErrorButton, styles.viewDocumentsButton]}
//               onPress={() => {
//                 setShowDuplicateErrorModal(false);
//                 Haptics.selectionAsync();
//               }}
//               activeOpacity={0.8}
//             >
//               <Ionicons name="eye" size={isSmallScreen ? 16 : 18} color={Colors.white} />
//               <Text style={[styles.viewDocumentsButtonText, isSmallScreen && styles.viewDocumentsButtonTextSmall]}>View Documents</Text>
//             </TouchableOpacity>
            
//             <TouchableOpacity
//               style={[styles.duplicateErrorButton, styles.chooseOtherButton]}
//               onPress={() => {
//                 setShowDuplicateErrorModal(false);
//                 setSelectedType(null);
//                 Haptics.selectionAsync();
//               }}
//               activeOpacity={0.8}
//             >
//               <Ionicons name="swap-horizontal" size={isSmallScreen ? 16 : 18} color={Colors.primary} />
//               <Text style={[styles.chooseOtherButtonText, isSmallScreen && styles.chooseOtherButtonTextSmall]}>Choose Other</Text>
//             </TouchableOpacity>
//           </View>
//         </View>
//       </View>
//     </Modal>
//   );

//   const renderValidationModal = () => (
//     <Modal
//       visible={showValidationModal}
//       animationType="fade"
//       transparent={true}
//       onRequestClose={() => setShowValidationModal(false)}
//     >
//       <View style={styles.modalOverlayCenter}>
//         <View style={[styles.validationModal, isSmallScreen && styles.validationModalSmall]}>
//           <View style={styles.validationHeader}>
//             <View style={styles.validationIcon}>
//               <Ionicons name="warning" size={isSmallScreen ? 32 : 40} color="#F59E0B" />
//             </View>
//             <Text style={[styles.validationTitle, isSmallScreen && styles.validationTitleSmall]}>Validation Required</Text>
//             <Text style={[styles.validationSubtitle, isSmallScreen && styles.validationSubtitleSmall]}>Please fix the following issues:</Text>
//           </View>
          
//           <ScrollView style={[styles.validationContent, isSmallScreen && styles.validationContentSmall]}>
//             {validationErrors.map((error, index) => (
//               <View key={index} style={[styles.errorItem, isSmallScreen && styles.errorItemSmall]}>
//                 <View style={styles.errorIcon}>
//                   <Ionicons name="close-circle" size={isSmallScreen ? 14 : 16} color="#EF4444" />
//                 </View>
//                 <Text style={[styles.errorText, isSmallScreen && styles.errorTextSmall]}>{error}</Text>
//               </View>
//             ))}
//           </ScrollView>
          
//           <TouchableOpacity
//             style={[styles.validationButton, isSmallScreen && styles.validationButtonSmall]}
//             onPress={() => {
//               setShowValidationModal(false);
//               Haptics.selectionAsync();
//             }}
//             activeOpacity={0.8}
//           >
//             <Text style={[styles.validationButtonText, isSmallScreen && styles.validationButtonTextSmall]}>Got It</Text>
//           </TouchableOpacity>
//         </View>
//       </View>
//     </Modal>
//   );

//   const renderSuccessModal = () => (
//     <Modal
//       visible={showSuccessModal}
//       animationType="fade"
//       transparent={true}
//       onRequestClose={() => setShowSuccessModal(false)}
//     >
//       <View style={styles.modalOverlayCenter}>
//         <View style={[styles.successModal, isSmallScreen && styles.successModalSmall]}>
//           <View style={styles.successIconContainer}>
//             <View style={[styles.successIconCircle, isSmallScreen && styles.successIconCircleSmall]}>
//               <Ionicons name="checkmark" size={isSmallScreen ? 40 : 50} color={Colors.white} />
//             </View>
//           </View>
          
//           <Text style={[styles.successTitle, isSmallScreen && styles.successTitleSmall]}>
//             {isReuploadMode ? "Document Reuploaded" : "Document Uploaded"}
//           </Text>
//           <Text style={[styles.successMessageText, isSmallScreen && styles.successMessageTextSmall]}>
//             {isReuploadMode 
//               ? "Your document has been reuploaded and is pending verification. The rejected document has been removed."
//               : "Your document has been uploaded and is pending verification."
//             }
//           </Text>
          
//           <View style={styles.successButtons}>
//             <TouchableOpacity
//               style={[styles.successButton, styles.primaryButton]}
//               onPress={() => {
//                 setShowSuccessModal(false);
//                 resetForm();
//                 Haptics.selectionAsync();
//               }}
//               activeOpacity={0.8}
//             >
//               <Text style={[styles.primaryButtonText, isSmallScreen && styles.primaryButtonTextSmall]}>OK</Text>
//             </TouchableOpacity>
//           </View>
//         </View>
//       </View>
//     </Modal>
//   );

//   const formatDateTime = (dateString) => {
//     if (!dateString) return "N/A";
    
//     const date = new Date(dateString);
//     return date.toLocaleString('en-IN', {
//       day: '2-digit',
//       month: 'short',
//       year: 'numeric',
//       hour: '2-digit',
//       minute: '2-digit',
//       hour12: true
//     });
//   };

//   const getDocumentTypeName = (type) => {
//     const types = {
//       "aadhar": "Aadhar Card",
//       "dl": "Driving License",
//       "rc": "Registration Certificate"
//     };
//     return types[type] || type;
//   };

//   const renderViewModal = () => {
//     if (!selectedDocument) return null;
    
//     const doc = selectedDocument;
//     const isExpired = doc.is_expired;
//     const isRejected = doc.status === "rejected";
    
//     return (
//       <Modal
//         visible={showViewModal}
//         animationType="slide"
//         transparent={true}
//         onRequestClose={() => setShowViewModal(false)}
//       >
//         <View style={styles.modalOverlayCenter}>
//           <View style={[styles.viewModal, isSmallScreen && styles.viewModalSmall]}>
//             <View style={styles.viewModalHeader}>
//               <Text style={[styles.viewModalTitle, isSmallScreen && styles.viewModalTitleSmall]}>Document Details</Text>
//               <TouchableOpacity 
//                 onPress={() => setShowViewModal(false)}
//                 activeOpacity={0.7}
//               >
//                 <Ionicons name="close" size={isSmallScreen ? 24 : 28} color="#6B7280" />
//               </TouchableOpacity>
//             </View>
            
//             <ScrollView
//               style={{ flex: 1 }}
//               contentContainerStyle={styles.viewModalScrollContent}
//               showsVerticalScrollIndicator={false}
//             >
//               {/* Status Banner */}
//               <View style={[styles.statusBanner, { 
//                 backgroundColor: doc.status === 'approved' ? '#F0FDF4' : 
//                                 doc.status === 'rejected' ? '#FEF2F2' : '#FFFBEB',
//                 borderColor: doc.status === 'approved' ? '#A7F3D0' : 
//                             doc.status === 'rejected' ? '#FECACA' : '#FDE68A'
//               }]}>
//                 <View style={styles.statusBannerContent}>
//                   <View style={[styles.statusBannerIconContainer, isSmallScreen && styles.statusBannerIconContainerSmall]}>
//                     <Ionicons 
//                       name={doc.status === 'approved' ? 'checkmark-circle' : 
//                             doc.status === 'rejected' ? 'close-circle' : 'time'} 
//                       size={isSmallScreen ? 20 : 24} 
//                       color={doc.status === 'approved' ? '#10B981' : 
//                             doc.status === 'rejected' ? '#EF4444' : '#F59E0B'} 
//                     />
//                   </View>
//                   <View style={[styles.statusBannerTextContainer, { marginLeft: 16 }]}>
//                     <Text style={[styles.statusBannerTitle, {
//                       color: doc.status === 'approved' ? '#065F46' : 
//                             doc.status === 'rejected' ? '#991B1B' : '#92400E'
//                     }, isSmallScreen && styles.statusBannerTitleSmall]}>
//                       {doc.status === 'pending' ? 'Awaiting Review' : 
//                       doc.status === 'approved' ? 'Approved & Verified' : 'Rejected'}
//                     </Text>
//                     {doc.status === 'approved' && doc.verified_by && (
//                       <Text style={[styles.statusBannerSubtitle, isSmallScreen && styles.statusBannerSubtitleSmall]}>
//                         Verified by {doc.verified_by}
//                       </Text>
//                     )}
//                   </View>
//                 </View>
//               </View>

//               {/* Document Information Section */}
//               <View style={styles.sectionContainer}>
//                 <View style={styles.sectionHeader}>
//                   <View style={[styles.sectionIconContainer, isSmallScreen && styles.sectionIconContainerSmall]}>
//                     <Ionicons name="document-text-outline" size={isSmallScreen ? 18 : 20} color="#6B7280" />
//                   </View>
//                   <Text style={[styles.sectionTitle, isSmallScreen && styles.sectionTitleSmall]}>Document Information</Text>
//                 </View>
//                 <View style={styles.sectionDivider} />
                
//                 <View style={styles.detailsList}>
//                   <View style={[styles.detailItem, isSmallScreen && styles.detailItemSmall]}>
//                     <View style={[styles.detailIconContainer, isSmallScreen && styles.detailIconContainerSmall]}>
//                       <Ionicons name="document-outline" size={isSmallScreen ? 16 : 18} color="#6B7280" />
//                     </View>
//                     <View style={[styles.detailContent, { marginLeft: 12 }]}>
//                       <Text style={[styles.detailLabel, isSmallScreen && styles.detailLabelSmall]}>Document Type</Text>
//                       <Text style={[styles.detailValue, isSmallScreen && styles.detailValueSmall]}>{getDocumentTypeName(doc.document_type)}</Text>
//                     </View>
//                   </View>
                  
//                   <View style={[styles.detailItem, isSmallScreen && styles.detailItemSmall]}>
//                     <View style={[styles.detailIconContainer, isSmallScreen && styles.detailIconContainerSmall]}>
//                       <Ionicons name="barcode-outline" size={isSmallScreen ? 16 : 18} color="#6B7280" />
//                     </View>
//                     <View style={[styles.detailContent, { marginLeft: 12 }]}>
//                       <Text style={[styles.detailLabel, isSmallScreen && styles.detailLabelSmall]}>Document Number</Text>
//                       <Text style={[styles.detailValue, isSmallScreen && styles.detailValueSmall]}>{doc.document_number}</Text>
//                     </View>
//                   </View>
                  
//                   <View style={[styles.detailItem, isSmallScreen && styles.detailItemSmall]}>
//                     <View style={[styles.detailIconContainer, isSmallScreen && styles.detailIconContainerSmall]}>
//                       <Ionicons name="person-outline" size={isSmallScreen ? 16 : 18} color="#6B7280" />
//                     </View>
//                     <View style={[styles.detailContent, { marginLeft: 12 }]}>
//                       <Text style={[styles.detailLabel, isSmallScreen && styles.detailLabelSmall]}>Document Holder Name</Text>
//                       <Text style={[styles.detailValue, isSmallScreen && styles.detailValueSmall]}>{doc.document_name || "Not specified"}</Text>
//                     </View>
//                   </View>
                  
//                   {doc.vehicle_number && (
//                     <View style={[styles.detailItem, isSmallScreen && styles.detailItemSmall]}>
//                       <View style={[styles.detailIconContainer, isSmallScreen && styles.detailIconContainerSmall]}>
//                         <Ionicons name="car-outline" size={isSmallScreen ? 16 : 18} color="#6B7280" />
//                       </View>
//                       <View style={[styles.detailContent, { marginLeft: 12 }]}>
//                         <Text style={[styles.detailLabel, isSmallScreen && styles.detailLabelSmall]}>Vehicle Registration Number</Text>
//                         <Text style={[styles.detailValue, isSmallScreen && styles.detailValueSmall]}>{doc.vehicle_number}</Text>
//                       </View>
//                     </View>
//                   )}
                  
//                   {doc.issue_date && doc.document_type !== "aadhar" && (
//                     <View style={[styles.detailItem, isSmallScreen && styles.detailItemSmall]}>
//                       <View style={[styles.detailIconContainer, isSmallScreen && styles.detailIconContainerSmall]}>
//                         <Ionicons name="calendar-outline" size={isSmallScreen ? 16 : 18} color="#6B7280" />
//                       </View>
//                       <View style={[styles.detailContent, { marginLeft: 12 }]}>
//                         <Text style={[styles.detailLabel, isSmallScreen && styles.detailLabelSmall]}>Issue Date</Text>
//                         <Text style={[styles.detailValue, isSmallScreen && styles.detailValueSmall]}>{doc.issue_date}</Text>
//                       </View>
//                     </View>
//                   )}
                  
//                   {doc.expiry_date && (
//                     <View style={[styles.detailItem, isSmallScreen && styles.detailItemSmall, isExpired && styles.expiredDetailItem]}>
//                       <View style={[styles.detailIconContainer, isSmallScreen && styles.detailIconContainerSmall]}>
//                         <Ionicons name="timer-outline" size={isSmallScreen ? 16 : 18} color={isExpired ? "#EF4444" : "#6B7280"} />
//                       </View>
//                       <View style={[styles.detailContent, { marginLeft: 12 }]}>
//                         <Text style={[styles.detailLabel, isSmallScreen && styles.detailLabelSmall, isExpired && { color: "#EF4444" }]}>
//                           Expiry Date
//                         </Text>
//                         <Text style={[styles.detailValue, isSmallScreen && styles.detailValueSmall, isExpired && { color: "#EF4444", fontWeight: '600' }]}>
//                           {doc.expiry_date}
//                           {isExpired && " (Document Expired)"}
//                         </Text>
//                       </View>
//                     </View>
//                   )}
//                 </View>
//               </View>

//               {/* Submission Details */}
//               <View style={styles.sectionContainer}>
//                 <View style={styles.sectionHeader}>
//                   <View style={[styles.sectionIconContainer, isSmallScreen && styles.sectionIconContainerSmall]}>
//                     <Ionicons name="time-outline" size={isSmallScreen ? 18 : 20} color="#6B7280" />
//                   </View>
//                   <Text style={[styles.sectionTitle, isSmallScreen && styles.sectionTitleSmall]}>Submission Details</Text>
//                 </View>
//                 <View style={styles.sectionDivider} />
                
//                 <View style={styles.detailsList}>
//                   <View style={[styles.detailItem, isSmallScreen && styles.detailItemSmall]}>
//                     <View style={[styles.detailIconContainer, isSmallScreen && styles.detailIconContainerSmall]}>
//                       <Ionicons name="time-outline" size={isSmallScreen ? 16 : 18} color="#6B7280" />
//                     </View>
//                     <View style={[styles.detailContent, { marginLeft: 12 }]}>
//                       <Text style={[styles.detailLabel, isSmallScreen && styles.detailLabelSmall]}>Submitted On</Text>
//                       <Text style={[styles.detailValue, isSmallScreen && styles.detailValueSmall]}>
//                         {formatDateTime(doc.submitted_at)}
//                       </Text>
//                     </View>
//                   </View>
                  
//                   {doc.status === 'approved' && doc.verified_at && (
//                     <View style={[styles.detailItem, isSmallScreen && styles.detailItemSmall]}>
//                       <View style={[styles.detailIconContainer, isSmallScreen && styles.detailIconContainerSmall]}>
//                         <Ionicons name="calendar-check" size={isSmallScreen ? 16 : 18} color="#10B981" />
//                       </View>
//                       <View style={[styles.detailContent, { marginLeft: 12 }]}>
//                         <Text style={[styles.detailLabel, isSmallScreen && styles.detailLabelSmall]}>Verified On</Text>
//                         <Text style={[styles.detailValue, isSmallScreen && styles.detailValueSmall]}>
//                           {formatDateTime(doc.verified_at)}
//                         </Text>
//                       </View>
//                     </View>
//                   )}
//                 </View>
//               </View>

//               {/* Rejection Reason if rejected */}
//               {doc.status === "rejected" && doc.rejection_reason && (
//                 <View style={styles.rejectionSection}>
//                   <View style={styles.sectionHeader}>
//                     <View style={[styles.sectionIconContainer, isSmallScreen && styles.sectionIconContainerSmall]}>
//                       <Ionicons name="alert-circle-outline" size={isSmallScreen ? 18 : 20} color="#DC2626" />
//                     </View>
//                     <Text style={[styles.sectionTitle, isSmallScreen && styles.sectionTitleSmall, { color: "#DC2626" }]}>Rejection Details</Text>
//                   </View>
//                   <View style={styles.sectionDivider} />
//                   <View style={[styles.rejectionContent, { marginLeft: 4 }]}>
//                     <Text style={[styles.rejectionLabel, isSmallScreen && styles.rejectionLabelSmall]}>Reason for Rejection</Text>
//                     <Text style={[styles.rejectionText, isSmallScreen && styles.rejectionTextSmall]}>{doc.rejection_reason}</Text>
//                   </View>
//                 </View>
//               )}
//             </ScrollView>
            
//             {/* Action Buttons */}
//             <View style={styles.viewModalFooter}>
//               {isRejected && (
//                 <TouchableOpacity
//                   style={[styles.actionButton, styles.reuploadActionButtonModal]}
//                   onPress={() => handleReuploadDocument(doc)}
//                   activeOpacity={0.8}
//                 >
//                   <Ionicons name="refresh" size={18} color={Colors.white} />
//                   <Text style={styles.reuploadActionButtonText}>Reupload Document</Text>
//                 </TouchableOpacity>
//               )}
              
              
//             </View>
//           </View>
//         </View>
//       </Modal>
//     );
//   };

//   const renderDeleteModal = () => (
//     <Modal
//       visible={showDeleteModal}
//       animationType="fade"
//       transparent={true}
//       onRequestClose={() => setShowDeleteModal(false)}
//     >
//       <View style={styles.modalOverlayCenter}>
//         <View style={[styles.deleteModal, isSmallScreen && styles.deleteModalSmall]}>
//           <View style={styles.deleteIcon}>
//             <Ionicons name="trash" size={isSmallScreen ? 40 : 50} color="#EF4444" />
//           </View>
          
//           <Text style={[styles.deleteTitle, isSmallScreen && styles.deleteTitleSmall]}>Delete Document</Text>
//           <Text style={[styles.deleteMessage, isSmallScreen && styles.deleteMessageSmall]}>
//             Are you sure you want to delete this document? This action cannot be undone.
//           </Text>
          
//           <View style={[styles.deleteButtons, isSmallScreen && styles.deleteButtonsSmall]}>
//             <TouchableOpacity
//               style={[styles.deleteButtonModal, styles.cancelButton]}
//               onPress={() => {
//                 setShowDeleteModal(false);
//                 Haptics.selectionAsync();
//               }}
//               activeOpacity={0.8}
//             >
//               <Text style={[styles.cancelButtonText, isSmallScreen && styles.cancelButtonTextSmall]}>Cancel</Text>
//             </TouchableOpacity>
            
//             <TouchableOpacity
//               style={[styles.deleteButtonModal, styles.confirmDeleteButton]}
//               onPress={() => {
//                 if (selectedDocument) {
//                   handleDeleteDocument(selectedDocument.id);
//                 }
//               }}
//               activeOpacity={0.8}
//             >
//               <Ionicons name="trash" size={isSmallScreen ? 16 : 18} color={Colors.white} />
//               <Text style={[styles.confirmDeleteText, isSmallScreen && styles.confirmDeleteTextSmall]}>Delete</Text>
//             </TouchableOpacity>
//           </View>
//         </View>
//       </View>
//     </Modal>
//   );

//   return (
//     <SafeAreaView style={styles.container}>
//       <StatusBar backgroundColor={Colors.white} barStyle="dark-content" />

//       {/* Header */}
//       {renderHeader()}

//       {loading && !refreshing ? (
//         <View style={styles.loadingContainer}>
//           <ActivityIndicator size={isSmallScreen ? "small" : "large"} color={Colors.primary} />
//           <Text style={[styles.loadingText, isSmallScreen && styles.loadingTextSmall]}>Loading documents...</Text>
//         </View>
//       ) : (
//         renderUploadView()
//       )}

//       {/* All Modals */}
//       {renderTypeModal()}
//       {renderDuplicateErrorModal()}
//       {renderValidationModal()}
//       {renderSuccessModal()}
//       {renderViewModal()}
//       {renderDeleteModal()}
//     </SafeAreaView>
//   );
// }

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     backgroundColor: "#Fff",
//   },
//   // Header
//   header: {
//     flexDirection: "row",
//     alignItems: "center",
//     paddingHorizontal: 16,
//     paddingVertical: 1,
//     backgroundColor: Colors.white,
//     borderBottomWidth: 0.5,
//     borderBottomColor: "#F3F4F6",
//   },
//   modernBackButton: {
//     width: 44,
//     height: 44,
//     borderRadius: 22,
//     justifyContent: "center",
//     alignItems: "center",
//   },
//   modernRefreshButton: {
//     width: 44,
//     height: 44,
//     borderRadius: 22,
//     justifyContent: "center",
//     alignItems: "center",
//   },
//   headerTitleModern: {
//     flex: 1,
//     textAlign: "center",
//     fontSize: 28,
//     fontWeight: "700",
//     color: Colors.primary,
//   },
//   headerSmall: {
//     paddingHorizontal: 12,
//     paddingVertical: 10,
//   },
//   backButton: {
//     padding: 8,
//     borderRadius: 12,
//     backgroundColor: "#F3F4F6",
//   },
//   backButtonSmall: {
//     padding: 6,
//     borderRadius: 10,
//   },
//   headerTitle: {
//     fontSize: 20,
//     fontWeight: "700",
//     color: Colors.primary,
//   },
//   headerTitleSmall: {
//     fontSize: 18,
//   },
//   refreshButton: {
//     padding: 8,
//     borderRadius: 12,
//     backgroundColor: "#F3F4F6",
//   },
//   refreshButtonSmall: {
//     padding: 6,
//     borderRadius: 10,
//   },
//   scrollContent: {
//     paddingHorizontal: 16,
//     paddingBottom: 40,
//     paddingTop: 16,
//   },
//   loadingContainer: {
//     flex: 1,
//     justifyContent: "center",
//     alignItems: "center",
//   },
//   loadingText: {
//     marginTop: 16,
//     fontSize: 15,
//     color: "#6B7280",
//   },
//   loadingTextSmall: {
//     fontSize: 14,
//   },
  
//   // Header Section
//   headerSection: {
//     flexDirection: "row",
//     alignItems: "center",
//     backgroundColor: Colors.white,
//     borderRadius: 16,
//     padding: 20,
//     marginBottom: 20,
//     borderWidth: 1,
//     borderColor: "#E5E7EB",
//   },
//   headerIcon: {
//     width: 56,
//     height: 56,
//     borderRadius: 28,
//     backgroundColor: Colors.primary + "15",
//     justifyContent: "center",
//     alignItems: "center",
//     marginRight: 16,
//   },
//   headerText: {
//     flex: 1,
//   },
//   headerTitle: {
//     fontSize: 18,
//     fontWeight: "700",
//     color: Colors.primary,
//     marginBottom: 4,
//   },
//   headerSubtitle: {
//     fontSize: 14,
//     color: "#6B7280",
//   },
  
//   // Reupload Banner
//   reuploadBanner: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     backgroundColor: '#EFF6FF',
//     borderRadius: 12,
//     padding: 16,
//     marginBottom: 20,
//     borderWidth: 1,
//     borderColor: '#93C5FD',
//     gap: 12,
//   },
//   reuploadBannerContent: {
//     flex: 1,
//   },
//   reuploadTitle: {
//     fontSize: 14,
//     fontWeight: '600',
//     color: '#1E40AF',
//     marginBottom: 4,
//   },
//   reuploadText: {
//     fontSize: 13,
//     color: '#3B82F6',
//   },
  
//   // Section
//   section: {
//     backgroundColor: Colors.white,
//     borderRadius: 16,
//     padding: 20,
//     marginBottom: 20,
//     borderWidth: 1,
//     borderColor: "#E5E7EB",
//   },
//   sectionHeader: {
//     flexDirection: "row",
//     justifyContent: "space-between",
//     alignItems: "center",
//     marginBottom: 20,
//   },
//   sectionTitle: {
//     fontSize: 18,
//     fontWeight: "700",
//     color: "#1F2937",
//   },
//   docCount: {
//     fontSize: 14,
//     color: "#6B7280",
//     fontWeight: "500",
//   },
  
//   // Success Message
//   successMessage: {
//     backgroundColor: "#F0FDF4",
//     borderRadius: 16,
//     padding: 24,
//     marginBottom: 20,
//     borderWidth: 1,
//     borderColor: "#A7F3D0",
//     alignItems: "center",
//   },
//   successIcon: {
//     marginBottom: 16,
//   },
//   successTitle: {
//     fontSize: 18,
//     fontWeight: "700",
//     color: "#065F46",
//     marginBottom: 8,
//     textAlign: "center",
//   },
//   successText: {
//     fontSize: 14,
//     color: "#047857",
//     textAlign: "center",
//     lineHeight: 20,
//   },
  
//   // Document Card
//   documentCard: {
//     backgroundColor: "#FFFFFF",
//     borderRadius: 12,
//     padding: 16,
//     marginBottom: 12,
//     borderWidth: 1,
//     borderColor: "#E5E7EB",
//   },
//   documentCardSmall: {
//     padding: 12,
//     marginBottom: 10,
//   },
//   documentCardHeader: {
//     flexDirection: "row",
//     justifyContent: "space-between",
//     alignItems: "center",
//     marginBottom: 12,
//   },
//   docTypeContainer: {
//     flexDirection: "row",
//     alignItems: "center",
//   },
//   docTypeInfo: {
//     flex: 1,
//   },
//   docTypeRow: {
//     flexDirection: "row",
//     alignItems: "center",
//     justifyContent: "space-between",
//   },
//   docTypeName: {
//     fontSize: 16,
//     fontWeight: "600",
//     color: "#111",
//     flex: 1,
//   },
//   docTypeIcon: {
//     width: 40,
//     height: 40,
//     borderRadius: 20,
//     justifyContent: "center",
//     alignItems: "center",
//     marginRight: 12,
//   },
//   statusBadge: {
//     flexDirection: "row",
//     alignItems: "center",
//     paddingHorizontal: 8,
//     paddingVertical: 4,
//     borderRadius: 12,
//     marginLeft: 8,
//   },
//   statusText: {
//     fontSize: 12,
//     fontWeight: "600",
//     marginLeft: 4,
//   },
//   docNumberSmall: {
//     marginTop: 4,
//     fontSize: 13,
//     color: "#666",
//   },
//   docName: {
//     fontSize: 15,
//     fontWeight: "600",
//     color: "#374151",
//     marginBottom: 12,
//   },
//   docNameSmall: {
//     fontSize: 14,
//   },
//   docMetaContainer: {
//     flexDirection: "row",
//     flexWrap: "wrap",
//     marginBottom: 12,
//   },
//   docMetaContainerSmall: {
//     marginBottom: 10,
//   },
//   metaItem: {
//     flexDirection: "row",
//     alignItems: "center",
//     marginRight: 16,
//     marginBottom: 8,
//   },
//   metaText: {
//     fontSize: 12,
//     color: "#6B7280",
//     marginLeft: 6,
//   },
//   metaTextSmall: {
//     fontSize: 11,
//   },
//   rejectionBox: {
//     flexDirection: "row",
//     alignItems: "center",
//     backgroundColor: "#FEF2F2",
//     padding: 10,
//     borderRadius: 8,
//     marginBottom: 12,
//   },
//   rejectionText: {
//     fontSize: 12,
//     color: "#DC2626",
//     marginLeft: 8,
//     flex: 1,
//   },
//   rejectionTextSmall: {
//     fontSize: 11,
//   },
//   documentActions: {
//     flexDirection: "row",
//     justifyContent: "flex-end",
//     gap: 12,
//   },
//   documentActionsSmall: {
//     gap: 8,
//   },
//   viewButton: {
//     flexDirection: "row",
//     alignItems: "center",
//     paddingHorizontal: 12,
//     paddingVertical: 6,
//     backgroundColor: Colors.primary + "15",
//     borderRadius: 8,
//   },
//   viewButtonText: {
//     fontSize: 12,
//     fontWeight: "600",
//     color: Colors.primary,
//     marginLeft: 4,
//   },
//   viewButtonTextSmall: {
//     fontSize: 11,
//   },
//   reuploadActionButton: {
//     flexDirection: "row",
//     alignItems: "center",
//     paddingHorizontal: 12,
//     paddingVertical: 6,
//     backgroundColor: "#EFF6FF",
//     borderRadius: 8,
//   },
//   reuploadActionButtonSmall: {
//     paddingHorizontal: 10,
//     paddingVertical: 5,
//   },
//   reuploadButtonText: {
//     fontSize: 12,
//     fontWeight: "600",
//     color: "#3B82F6",
//     marginLeft: 4,
//   },
//   reuploadButtonTextSmall: {
//     fontSize: 11,
//   },
//   deleteButton: {
//     flexDirection: "row",
//     alignItems: "center",
//     paddingHorizontal: 12,
//     paddingVertical: 6,
//     backgroundColor: "#FEF2F2",
//     borderRadius: 8,
//   },
//   deleteButtonText: {
//     fontSize: 12,
//     fontWeight: "600",
//     color: "#DC2626",
//     marginLeft: 4,
//   },
//   deleteButtonTextSmall: {
//     fontSize: 11,
//   },
  
//   // Form Styles
//   inputContainer: {
//     marginBottom: 20,
//   },
//   inputLabel: {
//     fontSize: 14,
//     fontWeight: "600",
//     color: "#374151",
//     marginBottom: 8,
//   },
//   inputLabelSmall: {
//     fontSize: 13,
//   },
//   requiredStar: {
//     color: "#DC2626",
//   },
//   input: {
//     borderWidth: 1.5,
//     borderColor: "#D1D5DB",
//     borderRadius: 12,
//     padding: 14,
//     fontSize: 16,
//     color: "#1F2937",
//     backgroundColor: Colors.white,
//   },
//   inputSmall: {
//     padding: 12,
//     fontSize: 15,
//   },
//   dropdown: {
//     flexDirection: "row",
//     alignItems: "center",
//     justifyContent: "space-between",
//     borderWidth: 1.5,
//     borderColor: "#D1D5DB",
//     borderRadius: 12,
//     padding: 14,
//     backgroundColor: Colors.white,
//   },
//   dropdownSmall: {
//     padding: 12,
//   },
//   selectedType: {
//     flexDirection: "row",
//     alignItems: "center",
//     flex: 1,
//   },
//   selectedTypeIcon: {
//     width: 36,
//     height: 36,
//     borderRadius: 18,
//     backgroundColor: Colors.primary + "15",
//     justifyContent: "center",
//     alignItems: "center",
//     marginRight: 12,
//   },
//   selectedTypeIconSmall: {
//     width: 32,
//     height: 32,
//     borderRadius: 16,
//   },
//   selectedTypeInfo: {
//     flex: 1,
//   },
//   selectedTypeText: {
//     fontSize: 16,
//     color: "#1F2937",
//     fontWeight: "500",
//   },
//   selectedTypeTextSmall: {
//     fontSize: 15,
//   },
//   alreadyExistsWarning: {
//     fontSize: 11,
//     color: "#F59E0B",
//     marginTop: 2,
//   },
//   reuploadModeText: {
//     fontSize: 11,
//     color: "#3B82F6",
//     marginTop: 2,
//   },
//   placeholderContainer: {
//     flexDirection: "row",
//     alignItems: "center",
//     flex: 1,
//   },
//   placeholderText: {
//     fontSize: 16,
//     color: "#9CA3AF",
//     marginLeft: 10,
//   },
//   placeholderTextSmall: {
//     fontSize: 15,
//   },
//   dateRow: {
//     flexDirection: "row",
//     justifyContent: "space-between",
//     marginBottom: 20,
//   },
//   datePickerContainer: {
//     flex: 1,
//     marginRight: 12,
//   },
//   dateInput: {
//     flexDirection: "row",
//     alignItems: "center",
//     borderWidth: 1.5,
//     borderColor: "#D1D5DB",
//     borderRadius: 12,
//     padding: 14,
//     backgroundColor: Colors.white,
//   },
//   dateInputSmall: {
//     padding: 12,
//   },
//   dateIcon: {
//     marginRight: 10,
//   },
//   dateText: {
//     fontSize: 16,
//     color: "#1F2937",
//     flex: 1,
//   },
//   dateTextSmall: {
//     fontSize: 15,
//   },
  
//   // Image Picker
//   imagePickerContainer: {
//     marginBottom: 24,
//   },
//   imagePickerHeader: {
//     marginBottom: 12,
//   },
//   imagePickerLabel: {
//     fontSize: 14,
//     fontWeight: "600",
//     color: "#374151",
//   },
//   imagePickerLabelSmall: {
//     fontSize: 13,
//   },
//   imagePickerButtons: {
//     flexDirection: "row",
//     justifyContent: "space-between",
//     gap: 12,
//   },
//   imagePickerButtonsSmall: {
//     gap: 8,
//   },
//   imageButton: {
//     flex: 1,
//     backgroundColor: Colors.primary,
//     borderRadius: 12,
//     padding: 16,
//     alignItems: "center",
//   },
//   imageButtonSmall: {
//     padding: 12,
//   },
//   imageButtonIcon: {
//     marginBottom: 8,
//   },
//   imageButtonIconSmall: {
//     marginBottom: 6,
//   },
//   imageButtonText: {
//     fontSize: 14,
//     fontWeight: "600",
//     color: Colors.white,
//   },
//   imageButtonTextSmall: {
//     fontSize: 13,
//   },
//   imagePreviewSection: {
//     marginTop: 4,
//   },
//   imagePreviewContainer: {
//     borderRadius: 12,
//     overflow: "hidden",
//     position: "relative",
//   },
//   imagePreview: {
//     width: "100%",
//     height: 200,
//     borderRadius: 12,
//   },
//   imageOverlay: {
//     position: "absolute",
//     bottom: 0,
//     left: 0,
//     right: 0,
//     backgroundColor: "rgba(0, 0, 0, 0.6)",
//     flexDirection: "row",
//     justifyContent: "space-around",
//     paddingVertical: 12,
//     paddingHorizontal: 16,
//   },
//   previewActionButton: {
//     flexDirection: "row",
//     alignItems: "center",
//     backgroundColor: "rgba(255, 255, 255, 0.2)",
//     paddingHorizontal: 12,
//     paddingVertical: 6,
//     borderRadius: 20,
//     gap: 6,
//   },
//   previewActionText: {
//     fontSize: 12,
//     fontWeight: "600",
//     color: Colors.white,
//   },
//   previewActionTextSmall: {
//     fontSize: 11,
//   },
//   imageStatusBadge: {
//     flexDirection: "row",
//     alignItems: "center",
//     alignSelf: "flex-start",
//     backgroundColor: "#10B98115",
//     paddingHorizontal: 12,
//     paddingVertical: 6,
//     borderRadius: 12,
//     marginTop: 8,
//   },
//   imageStatusText: {
//     fontSize: 12,
//     fontWeight: "600",
//     color: "#10B981",
//     marginLeft: 6,
//   },
//   imageStatusTextSmall: {
//     fontSize: 11,
//   },
  
//   // Submit Button
//   submitButton: {
//     flexDirection: "row",
//     alignItems: "center",
//     justifyContent: "center",
//     backgroundColor: Colors.primary,
//     borderRadius: 14,
//     padding: 18,
//     marginTop: 8,
//   },
//   submitButtonDisabled: {
//     backgroundColor: "#9CA3AF",
//   },
//   submitText: {
//     fontSize: 16,
//     fontWeight: "700",
//     color: Colors.white,
//     marginLeft: 10,
//   },
  
//   // Cancel Reupload Button
//   cancelReuploadButton: {
//     flexDirection: "row",
//     alignItems: "center",
//     backgroundColor: "#FEF2F2",
//     paddingHorizontal: 12,
//     paddingVertical: 8,
//     borderRadius: 12,
//     borderWidth: 1,
//     borderColor: "#FECACA",
//     gap: 6,
//   },
//   cancelReuploadText: {
//     fontSize: 12,
//     fontWeight: "600",
//     color: "#DC2626",
//   },
  
//   // ================== MODAL STYLES - ALL CENTERED ==================
//   modalOverlayCenter: {
//     flex: 1,
//     backgroundColor: "rgba(0,0,0,0.5)",
//     justifyContent: "center",
//     alignItems: "center",
//     paddingHorizontal: 20,
//   },
  
//   // Type Modal
//   typeModal: {
//     backgroundColor: Colors.white,
//     borderRadius: 20,
//     width: "100%",
//     maxHeight: "80%",
//     maxWidth: 500,
//   },
//   typeModalSmall: {
//     borderRadius: 16,
//   },
//   typeModalHeader: {
//     flexDirection: "row",
//     justifyContent: "space-between",
//     alignItems: "center",
//     padding: 24,
//     borderBottomWidth: 1,
//     borderBottomColor: "#E5E7EB",
//   },
//   typeModalTitle: {
//     fontSize: 20,
//     fontWeight: "700",
//     color: "#1F2937",
//   },
//   typeModalTitleSmall: {
//     fontSize: 18,
//   },
//   typeModalContent: {
//     padding: 20,
//   },
//   typeOption: {
//     flexDirection: "row",
//     alignItems: "center",
//     paddingVertical: 16,
//     borderBottomWidth: 1,
//     borderBottomColor: "#F3F4F6",
//   },
//   typeOptionSmall: {
//     paddingVertical: 14,
//   },
//   disabledTypeOption: {
//     opacity: 0.7,
//   },
//   typeIconContainer: {
//     width: 50,
//     height: 50,
//     borderRadius: 25,
//     justifyContent: "center",
//     alignItems: "center",
//     marginRight: 16,
//   },
//   typeIconContainerSmall: {
//     width: 44,
//     height: 44,
//     borderRadius: 22,
//     marginRight: 12,
//   },
//   typeInfo: {
//     flex: 1,
//   },
//   typeNameRow: {
//     flexDirection: "row",
//     alignItems: "center",
//     justifyContent: "space-between",
//     marginBottom: 4,
//   },
//   typeNameRowSmall: {
//     marginBottom: 3,
//   },
//   typeName: {
//     fontSize: 16,
//     fontWeight: "600",
//     color: "#1F2937",
//   },
//   typeNameSmall: {
//     fontSize: 15,
//   },
//   disabledTypeName: {
//     color: "#9CA3AF",
//   },
//   statusBadgeSmall: {
//     flexDirection: "row",
//     alignItems: "center",
//     backgroundColor: "#FEF3C7",
//     paddingHorizontal: 8,
//     paddingVertical: 4,
//     borderRadius: 12,
//     gap: 4,
//   },
//   statusBadgeSmallSmall: {
//     paddingHorizontal: 6,
//     paddingVertical: 3,
//     borderRadius: 10,
//   },
//   statusBadgeText: {
//     fontSize: 10,
//     fontWeight: "600",
//     color: "#92400E",
//   },
//   statusBadgeTextSmall: {
//     fontSize: 9,
//   },
//   alreadyHaveText: {
//     fontSize: 12,
//     color: "#6B7280",
//     fontStyle: "italic",
//     marginTop: 4,
//   },
//   alreadyHaveTextSmall: {
//     fontSize: 11,
//   },
  
//   // Duplicate Error Modal
//   duplicateErrorModal: {
//     backgroundColor: Colors.white,
//     borderRadius: 24,
//     padding: 30,
//     width: "100%",
//     maxWidth: 400,
//     alignItems: "center",
//   },
//   duplicateErrorModalSmall: {
//     padding: 24,
//     borderRadius: 20,
//   },
//   duplicateErrorIcon: {
//     marginBottom: 20,
//   },
//   duplicateErrorTitle: {
//     fontSize: 22,
//     fontWeight: "700",
//     color: "#1F2937",
//     marginBottom: 12,
//     textAlign: "center",
//   },
//   duplicateErrorTitleSmall: {
//     fontSize: 20,
//   },
//   duplicateErrorMessage: {
//     fontSize: 15,
//     color: "#DC2626",
//     textAlign: "center",
//     lineHeight: 22,
//     marginBottom: 28,
//     fontWeight: "500",
//   },
//   duplicateErrorMessageSmall: {
//     fontSize: 14,
//     lineHeight: 20,
//   },
//   duplicateErrorButtons: {
//     flexDirection: "row",
//     width: "100%",
//     gap: 12,
//   },
//   duplicateErrorButtonsSmall: {
//     gap: 8,
//   },
//   duplicateErrorButton: {
//     flex: 1,
//     flexDirection: "row",
//     alignItems: "center",
//     justifyContent: "center",
//     borderRadius: 12,
//     padding: 16,
//     gap: 8,
//   },
//   viewDocumentsButton: {
//     backgroundColor: Colors.primary,
//   },
//   viewDocumentsButtonText: {
//     fontSize: 15,
//     fontWeight: "600",
//     color: Colors.white,
//   },
//   viewDocumentsButtonTextSmall: {
//     fontSize: 14,
//   },
//   chooseOtherButton: {
//     backgroundColor: Colors.white,
//     borderWidth: 1.5,
//     borderColor: Colors.primary,
//   },
//   chooseOtherButtonText: {
//     fontSize: 15,
//     fontWeight: "600",
//     color: Colors.primary,
//   },
//   chooseOtherButtonTextSmall: {
//     fontSize: 14,
//   },
  
//   // Validation Modal
//   validationModal: {
//     backgroundColor: Colors.white,
//     borderRadius: 20,
//     padding: 30,
//     width: "100%",
//     maxWidth: 400,
//   },
//   validationModalSmall: {
//     padding: 24,
//   },
//   validationHeader: {
//     alignItems: "center",
//     marginBottom: 24,
//   },
//   validationIcon: {
//     marginBottom: 16,
//   },
//   validationTitle: {
//     fontSize: 22,
//     fontWeight: "700",
//     color: "#1F2937",
//     marginBottom: 8,
//     textAlign: "center",
//   },
//   validationTitleSmall: {
//     fontSize: 20,
//   },
//   validationSubtitle: {
//     fontSize: 14,
//     color: "#6B7280",
//     textAlign: "center",
//   },
//   validationSubtitleSmall: {
//     fontSize: 13,
//   },
//   validationContent: {
//     maxHeight: 200,
//     marginBottom: 24,
//   },
//   validationContentSmall: {
//     maxHeight: 180,
//   },
//   errorItem: {
//     flexDirection: "row",
//     alignItems: "flex-start",
//     marginBottom: 12,
//     backgroundColor: "#FEF2F2",
//     padding: 14,
//     borderRadius: 10,
//   },
//   errorItemSmall: {
//     padding: 12,
//     marginBottom: 10,
//   },
//   errorIcon: {
//     marginTop: 1,
//   },
//   errorText: {
//     fontSize: 14,
//     color: "#DC2626",
//     marginLeft: 10,
//     flex: 1,
//     lineHeight: 20,
//   },
//   errorTextSmall: {
//     fontSize: 13,
//     lineHeight: 18,
//   },
//   validationButton: {
//     backgroundColor: Colors.primary,
//     borderRadius: 12,
//     padding: 16,
//     alignItems: "center",
//   },
//   validationButtonSmall: {
//     padding: 14,
//   },
//   validationButtonText: {
//     fontSize: 16,
//     fontWeight: "600",
//     color: Colors.white,
//   },
//   validationButtonTextSmall: {
//     fontSize: 15,
//   },
  
//   // Success Modal
//   successModal: {
//     backgroundColor: Colors.white,
//     borderRadius: 24,
//     padding: 30,
//     width: "100%",
//     maxWidth: 400,
//     alignItems: "center",
//   },
//   successModalSmall: {
//     padding: 24,
//     borderRadius: 20,
//   },
//   successIconContainer: {
//     marginBottom: 24,
//   },
//   successIconCircle: {
//     width: 80,
//     height: 80,
//     borderRadius: 40,
//     backgroundColor: "#10B981",
//     justifyContent: "center",
//     alignItems: "center",
//   },
//   successIconCircleSmall: {
//     width: 70,
//     height: 70,
//     borderRadius: 35,
//   },
//   successTitle: {
//     fontSize: 24,
//     fontWeight: "700",
//     color: "#1F2937",
//     marginBottom: 12,
//     textAlign: "center",
//   },
//   successTitleSmall: {
//     fontSize: 22,
//   },
//   successMessageText: {
//     fontSize: 15,
//     color: "#6B7280",
//     textAlign: "center",
//     lineHeight: 22,
//     marginBottom: 20,
//   },
//   successMessageTextSmall: {
//     fontSize: 14,
//     lineHeight: 20,
//   },
//   successButtons: {
//     width: "100%",
//   },
//   successButton: {
//     borderRadius: 12,
//     padding: 16,
//     alignItems: "center",
//   },
//   primaryButton: {
//     backgroundColor: Colors.primary,
//   },
//   primaryButtonText: {
//     fontSize: 16,
//     fontWeight: "600",
//     color: Colors.white,
//   },
//   primaryButtonTextSmall: {
//     fontSize: 15,
//   },
  
//   // View Modal
//   viewModal: {
//     backgroundColor: Colors.white,
//     borderRadius: 20,
//     width: "100%",
//     maxWidth: 500,
//     height: "85%",
//     overflow: "hidden",
//   },
//   viewModalSmall: {
//     borderRadius: 16,
//     maxHeight: "90%",
//   },
//   viewModalHeader: {
//     flexDirection: "row",
//     justifyContent: "space-between",
//     alignItems: "center",
//     padding: 24,
//     borderBottomWidth: 1,
//     borderBottomColor: "#E5E7EB",
//   },
//   viewModalTitle: {
//     fontSize: 20,
//     fontWeight: "700",
//     color: "#1F2937",
//   },
//   viewModalTitleSmall: {
//     fontSize: 18,
//   },
//   viewModalScrollContent: {

//     paddingBottom: 0,
//     paddingTop: 16,
//       paddingHorizontal: 8, // Added horizontal padding for better spacing

//   },
//   // Status Banner
//   statusBanner: {
//     padding: 20,
//     borderRadius: 12,
//     marginBottom: 20,
//     borderWidth: 1,
//   },
//   statusBannerContent: {
//     flexDirection: "row",
//     alignItems: "center",
//   },
//   statusBannerIconContainer: {
//     width: 48,
//     height: 48,
//     borderRadius: 24,
//     backgroundColor: Colors.white,
//     justifyContent: "center",
//     alignItems: "center",
//   },
//   statusBannerIconContainerSmall: {
//     width: 40,
//     height: 40,
//     borderRadius: 20,
//   },
//   statusBannerTextContainer: {
//     flex: 1,
//   },
//   statusBannerTitle: {
//     fontSize: 18,
//     fontWeight: "700",
//     marginBottom: 4,
//   },
//   statusBannerTitleSmall: {
//     fontSize: 16,
//   },
//   statusBannerSubtitle: {
//     fontSize: 14,
//     color: "#6B7280",
//     fontWeight: "500",
//   },
//   statusBannerSubtitleSmall: {
//     fontSize: 13,
//   },
//   // Section Container
//   sectionContainer: {
//     backgroundColor: Colors.white,
//     borderRadius: 16,
//     padding: 20,
//     marginBottom: 16,
//     borderWidth: 1,
//     borderColor: "#E5E7EB",
//     shadowColor: "#000",
//     shadowOffset: { width: 0, height: 1 },
//     shadowOpacity: 0.05,
//     shadowRadius: 4,
//     elevation: 2,
//   },
//   sectionHeader: {
//     flexDirection: "row",
//     alignItems: "center",
//     marginBottom: 12,
//   },
//   sectionDivider: {
//     height: 1,
//     backgroundColor: "#E5E7EB",
//     marginBottom: 20,
//   },
//   sectionIconContainer: {
//     width: 40,
//     height: 40,
//     borderRadius: 20,
//     backgroundColor: "#F3F4F6",
//     justifyContent: "center",
//     alignItems: "center",
//     marginRight: 12,
//   },
//   sectionIconContainerSmall: {
//     width: 36,
//     height: 36,
//     borderRadius: 18,
//     marginRight: 10,
//   },
//   sectionTitle: {
//     fontSize: 17,
//     fontWeight: "600",
//     color: "#6B7280",
//   },
//   sectionTitleSmall: {
//     fontSize: 16,
//   },
//   detailsList: {
//     marginLeft: 4,
//   },
//   detailItem: {
//     flexDirection: "row",
//     marginBottom: 20,
//   },
//   detailItemSmall: {
//     marginBottom: 16,
//   },
//   expiredDetailItem: {
//     backgroundColor: "#FEF2F2",
//     padding: 12,
//     borderRadius: 8,
//     marginLeft: -12,
//     marginRight: -12,
//   },
//   detailIconContainer: {
//     width: 36,
//     height: 36,
//     borderRadius: 18,
//     backgroundColor: "#F9FAFB",
//     justifyContent: "center",
//     alignItems: "center",
//     borderWidth: 1,
//     borderColor: "#E5E7EB",
//   },
//   detailIconContainerSmall: {
//     width: 32,
//     height: 32,
//     borderRadius: 16,
//   },
//   detailContent: {
//     flex: 1,
//   },
//   detailLabel: {
//     fontSize: 13,
//     color: "#6B7280",
//     fontWeight: "500",
//     marginBottom: 4,
//     textTransform: "uppercase",
//     letterSpacing: 0.5,
//   },
//   detailLabelSmall: {
//     fontSize: 12,
//   },
//   detailValue: {
//     fontSize: 16,
//     color: "#1F2937",
//     fontWeight: "600",
//   },
//   detailValueSmall: {
//     fontSize: 15,
//   },
//   // Rejection Section
//   rejectionSection: {
//     backgroundColor: "#FEF2F2",
//     borderRadius: 16,
//     padding: 20,
//     marginBottom: 16,
//     borderWidth: 1,
//     borderColor: "#FECACA",
//   },
//   rejectionContent: {
//     marginLeft: 4,
//   },
//   rejectionLabel: {
//     fontSize: 13,
//     color: "#DC2626",
//     fontWeight: "600",
//     marginBottom: 8,
//     textTransform: "uppercase",
//     letterSpacing: 0.5,
//   },
//   rejectionLabelSmall: {
//     fontSize: 12,
//   },
//   rejectionText: {
//     fontSize: 15,
//     color: "#1F2937",
//     lineHeight: 22,
//     fontWeight: "500",
//   },
//   rejectionTextSmall: {
//     fontSize: 14,
//     lineHeight: 20,
//   },
//   // Action Buttons in View Modal
//   actionButton: {
//     flexDirection: "row",
//     alignItems: "center",
//     justifyContent: "center",
//     padding: 16,
//     borderRadius: 12,
//     marginBottom: 12,
//   },
//   reuploadActionButtonModal: {
//     backgroundColor: "#3B82F6",
//   },
//   reuploadActionButtonText: {
//     fontSize: 16,
//     fontWeight: "600",
//     color: Colors.white,
//     marginLeft: 8,
//   },
//   closeViewButton: {
//     backgroundColor: "#F3F4F6",
//   },
//   closeViewButtonText: {
//     fontSize: 16,
//     fontWeight: "600",
//     color: "#374151",
//   },
//   viewModalFooter: {
//     padding: 24,
//     borderTopWidth: 1,
//     borderTopColor: "#E5E7EB",
//   },
  
//   // Delete Modal
//   deleteModal: {
//     backgroundColor: Colors.white,
//     borderRadius: 20,
//     padding: 30,
//     width: "100%",
//     maxWidth: 400,
//     alignItems: "center",
//   },
//   deleteModalSmall: {
//     padding: 24,
//   },
//   deleteIcon: {
//     marginBottom: 20,
//   },
//   deleteTitle: {
//     fontSize: 22,
//     fontWeight: "700",
//     color: "#1F2937",
//     marginBottom: 12,
//     textAlign: "center",
//   },
//   deleteTitleSmall: {
//     fontSize: 20,
//   },
//   deleteMessage: {
//     fontSize: 15,
//     color: "#6B7280",
//     textAlign: "center",
//     lineHeight: 22,
//     marginBottom: 28,
//   },
//   deleteMessageSmall: {
//     fontSize: 14,
//     lineHeight: 20,
//   },
//   deleteButtons: {
//     flexDirection: "row",
//     width: "100%",
//     gap: 12,
//   },
//   deleteButtonsSmall: {
//     gap: 8,
//   },
//   deleteButtonModal: {
//     flex: 1,
//     borderRadius: 12,
//     padding: 16,
//     alignItems: "center",
//   },
//   cancelButton: {
//     backgroundColor: "#F3F4F6",
//   },
//   cancelButtonText: {
//     fontSize: 15,
//     fontWeight: "600",
//     color: "#374151",
//   },
//   cancelButtonTextSmall: {
//     fontSize: 14,
//   },
//   confirmDeleteButton: {
//     backgroundColor: "#DC2626",
//     flexDirection: "row",
//     alignItems: "center",
//     gap: 8,
//   },
//   confirmDeleteText: {
//     fontSize: 15,
//     fontWeight: "600",
//     color: Colors.white,
//   },
//   confirmDeleteTextSmall: {
//     fontSize: 14,
//   },
//   singleRowContainer: {
//   flexDirection: "row",
//   gap: 12,
//   marginTop: 12,
// },

// singleRowButton: {
//   flex: 1,
//   flexDirection: "row",
//   alignItems: "center",
//   justifyContent: "center",
//   paddingVertical: 12,
//   borderRadius: 8,
//   borderWidth: 1,
//   borderColor: "#D1D5DB",
//   backgroundColor: "#FFFFFF",
// },

// singleRowText: {
//   marginLeft: 8,
//   fontSize: 13,
//   fontWeight: "500",
//   color: "#1F2937",
// },

// });
// -------------------------
// import React, { useState, useEffect, useCallback, useRef } from "react";
// import {
//   View,
//   Text,
//   StyleSheet,
//   TouchableOpacity,
//   ScrollView,
//   StatusBar,
//   Image,
//   TextInput,
//   Alert,
//   ActivityIndicator,
//   Modal,
//   Dimensions,
//   Platform,
//   Animated,
//   Easing,
//   RefreshControl,
// } from "react-native";
// import { SafeAreaView } from "react-native-safe-area-context";
// import { Ionicons, MaterialIcons, FontAwesome5 } from "@expo/vector-icons";
// import * as ImagePicker from "expo-image-picker";
// import { Colors } from "../constants/Colors";
// import DatabaseService from "../services/DatabaseService";
// import DateTimePicker from "@react-native-community/datetimepicker";
// import * as Haptics from "expo-haptics";

// const { width, height } = Dimensions.get("window");
// const isSmallScreen = width < 375;
// const isTablet = width > 768;

// export default function DocumentUploadScreen({ navigation, route }) {
//   const phoneNumber =
//     route?.params?.phoneNumber ||
//     navigation?.getState()?.routes
//       ?.find((r) => r.params?.phoneNumber)
//       ?.params?.phoneNumber ||
//     null;
  
//   // States
//   const [loading, setLoading] = useState(false);
//   const [refreshing, setRefreshing] = useState(false);
//   const [documents, setDocuments] = useState([]);
//   const [documentTypes, setDocumentTypes] = useState([]);
  
//   // Animation values
//   const [fadeAnim] = useState(new Animated.Value(1));
//   const [slideAnim] = useState(new Animated.Value(0));

//   // Upload wizard states
//   const [showUploadWizard, setShowUploadWizard] = useState(false);
//   const [currentStep, setCurrentStep] = useState(0);
//   const [selectedType, setSelectedType] = useState(null);
//   const [documentNumber, setDocumentNumber] = useState("");
//   const [documentName, setDocumentName] = useState("");
//   const [vehicleNumber, setVehicleNumber] = useState("");
//   const [issueDate, setIssueDate] = useState(null);
//   const [expiryDate, setExpiryDate] = useState(null);
//   const [showIssueDatePicker, setShowIssueDatePicker] = useState(false);
//   const [showExpiryDatePicker, setShowExpiryDatePicker] = useState(false);
//   const [frontImage, setFrontImage] = useState(null);
//   const [backImage, setBackImage] = useState(null);
//   const [selfieImage, setSelfieImage] = useState(null);

//   // Modal states
//   const [showSuccessModal, setShowSuccessModal] = useState(false);
//   const [showViewModal, setShowViewModal] = useState(false);
//   const [showDeleteModal, setShowDeleteModal] = useState(false);
//   const [uploadedDocId, setUploadedDocId] = useState(null);
//   const [selectedDocument, setSelectedDocument] = useState(null);
//   const [validationErrors, setValidationErrors] = useState([]);

//   // Reupload states for rejected documents
//   const [reuploadingDocId, setReuploadingDocId] = useState(null);
//   const [isReuploadMode, setIsReuploadMode] = useState(false);

//   // Track document status
//   const [uploadStatus, setUploadStatus] = useState({
//     allUploaded: false,
//     approvedCount: 0,
//     pendingCount: 0,
//     rejectedCount: 0,
//     missingTypes: [],
//     hasPendingOrRejected: false,
//   });

//   const scrollViewRef = useRef();
//   const slideAnimValue = useRef(new Animated.Value(0)).current;

//   // Calculate document status
//   useEffect(() => {
//     if (documentTypes.length > 0) {
//       const approvedDocs = documents.filter(doc => doc.status === "approved");
//       const approvedTypes = approvedDocs.map(doc => doc.document_type);
      
//       const missingTypes = documentTypes
//         .filter(type => !approvedTypes.includes(type.type))
//         .map(type => type.name);
      
//       const allUploaded = missingTypes.length === 0 && documents.length > 0;
      
//       const hasPendingOrRejected = documents.some(doc => 
//         (doc.status === "pending" || doc.status === "rejected")
//       );
      
//       setUploadStatus({
//         allUploaded,
//         approvedCount: approvedDocs.length,
//         pendingCount: documents.filter(doc => doc.status === "pending").length,
//         rejectedCount: documents.filter(doc => doc.status === "rejected").length,
//         missingTypes,
//         hasPendingOrRejected,
//       });
//     }
//   }, [documents, documentTypes]);

//   // Initialize
//   useEffect(() => {
//     if (!phoneNumber) {
//       showErrorPopup("Phone number not found. Please login again.");
//       navigation.goBack();
//       return;
//     }

//     loadData();
//     startAnimations();
//   }, [phoneNumber]);

//   const startAnimations = () => {
//     Animated.parallel([
//       Animated.timing(fadeAnim, {
//         toValue: 1,
//         duration: 800,
//         useNativeDriver: true,
//       }),
//       Animated.timing(slideAnim, {
//         toValue: 0,
//         duration: 600,
//         easing: Easing.out(Easing.back(1.5)),
//         useNativeDriver: true,
//       }),
//     ]).start();
//   };

//   const loadData = async () => {
//     try {
//       setLoading(true);
      
//       // Load document types
//       const typesRes = await DatabaseService.getDocumentTypes();
//       if (typesRes.success) {
//         const filteredTypes = (typesRes.document_types || []).filter(
//           type => !['passport', 'pan'].includes(type.type)
//         );
//         setDocumentTypes(filteredTypes);
//       }

//       // Load user's existing documents
//       const docsRes = await DatabaseService.getUserDocuments(phoneNumber);
//       if (docsRes.success) {
//         const filteredDocs = (docsRes.documents || []).filter(
//           doc => !['passport', 'pan'].includes(doc.document_type)
//         );
//         setDocuments(filteredDocs);
//       }
//     } catch (error) {
//       console.error("Load data error:", error);
//       showErrorPopup("Failed to load data. Please check your connection.");
//     } finally {
//       setLoading(false);
//       setRefreshing(false);
//     }
//   };

//   const onRefresh = useCallback(() => {
//     setRefreshing(true);
//     loadData();
//   }, []);

//   // Check if user already has a document of this type
//   const hasDocumentType = (type) => {
//     return documents.some(doc => doc.document_type === type);
//   };

//   // Get document status for a specific type
//   const getDocumentStatus = (type) => {
//     const doc = documents.find(d => d.document_type === type);
//     return doc ? doc.status : null;
//   };

//   // ========== IMAGE HANDLING ==========

//   const requestCameraPermission = async () => {
//     if (Platform.OS !== "web") {
//       const { status } = await ImagePicker.requestCameraPermissionsAsync();
//       if (status !== "granted") {
//         showErrorPopup("Camera permission is required to take photos of your documents.");
//         return false;
//       }
//     }
//     return true;
//   };

//   const requestGalleryPermission = async () => {
//     if (Platform.OS !== "web") {
//       const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
//       if (status !== "granted") {
//         showErrorPopup("Gallery permission is required to select photos.");
//         return false;
//       }
//     }
//     return true;
//   };

//   const captureImage = async (type) => {
//     const hasPermission = await requestCameraPermission();
//     if (!hasPermission) return;

//     try {
//       const result = await ImagePicker.launchCameraAsync({
//         mediaTypes: ImagePicker.MediaTypeOptions.Images,
//         allowsEditing: true,
//         aspect: [4, 3],
//         quality: 0.9,
//       });

//       if (!result.canceled && result.assets && result.assets[0]) {
//         const imageUri = result.assets[0].uri;
//         Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

//         switch (type) {
//           case "front":
//             setFrontImage(imageUri);
//             break;
//           case "back":
//             setBackImage(imageUri);
//             break;
//           case "selfie":
//             setSelfieImage(imageUri);
//             break;
//         }
//       }
//     } catch (error) {
//       console.error("Camera error:", error);
//       showErrorPopup("Failed to capture image. Please try again.");
//     }
//   };

//   const pickImageFromGallery = async (type) => {
//     const hasPermission = await requestGalleryPermission();
//     if (!hasPermission) return;

//     try {
//       const result = await ImagePicker.launchImageLibraryAsync({
//         mediaTypes: ImagePicker.MediaTypeOptions.Images,
//         allowsEditing: true,
//         aspect: [4, 3],
//         quality: 0.9,
//       });

//       if (!result.canceled && result.assets && result.assets[0]) {
//         const imageUri = result.assets[0].uri;
//         Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

//         switch (type) {
//           case "front":
//             setFrontImage(imageUri);
//             break;
//           case "back":
//             setBackImage(imageUri);
//             break;
//           case "selfie":
//             setSelfieImage(imageUri);
//             break;
//         }
//       }
//     } catch (error) {
//       console.error("Gallery error:", error);
//       showErrorPopup("Failed to pick image. Please try again.");
//     }
//   };

//   const handleSelectDocumentType = (type) => {
//     // Check if document type already exists
//     if (hasDocumentType(type) && !isReuploadMode) {
//       const status = getDocumentStatus(type);
//       const docTypeName = documentTypes.find(d => d.type === type)?.name || type;
      
//       let message = "";
//       if (status === "approved") {
//         message = `You already have an approved ${docTypeName} document. You cannot upload another one.`;
//       } else if (status === "pending") {
//         message = `You have a pending ${docTypeName} document. Please wait for approval or delete it to upload a new one.`;
//       } else if (status === "rejected") {
//         message = `Your ${docTypeName} document was rejected. Please reupload it from your documents list.`;
//       }
      
//       Alert.alert(
//         "Document Already Exists",
//         message,
//         [{ text: "OK" }]
//       );
//       Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
//       return;
//     }

//     setSelectedType(type);
//     Haptics.selectionAsync();
//     setTimeout(() => {
//       slideToNext();
//     }, 300);
//   };

//   const handleReuploadDocument = (doc) => {
//     setIsReuploadMode(true);
//     setReuploadingDocId(doc.id);
//     setSelectedType(doc.document_type);
//     setDocumentNumber(doc.document_number);
//     setDocumentName(doc.document_name);
//     setVehicleNumber(doc.document_data?.vehicle_number || doc.vehicle_number || "");
//     setFrontImage(null);
//     setBackImage(null);
//     setSelfieImage(null);
    
//     if (doc.document_type !== "aadhar" && doc.issue_date) {
//       setIssueDate(new Date(doc.issue_date));
//     } else {
//       setIssueDate(null);
//     }
    
//     if (doc.expiry_date) {
//       setExpiryDate(new Date(doc.expiry_date));
//     } else {
//       setExpiryDate(null);
//     }
    
//     setShowViewModal(false);
//     setShowUploadWizard(true);
//     setCurrentStep(1); // Start from step 1 (document number) for reupload
//     Haptics.selectionAsync();
//   };

//   const slideToNext = () => {
//     Animated.timing(slideAnimValue, {
//       toValue: -(currentStep + 1) * width,
//       duration: 300,
//       useNativeDriver: true,
//       easing: Easing.out(Easing.cubic),
//     }).start(() => {
//       setCurrentStep(prev => prev + 1);
//     });
//   };

//   const slideToPrev = () => {
//     Animated.timing(slideAnimValue, {
//       toValue: -(currentStep - 1) * width,
//       duration: 300,
//       useNativeDriver: true,
//       easing: Easing.out(Easing.cubic),
//     }).start(() => {
//       setCurrentStep(prev => prev - 1);
//     });
//   };

//   const validateStep = () => {
//     const errors = [];

//     switch (currentStep) {
//       case 0: // Document Type
//         if (!selectedType) {
//           errors.push("Please select a document type.");
//         }
//         break;
//       case 1: // Document Number
//         if (!documentNumber.trim()) {
//           errors.push("Please enter document number.");
//         } else {
//           switch (selectedType) {
//             case "aadhar":
//               if (!/^\d{12}$/.test(documentNumber.trim())) {
//                 errors.push("Aadhar number must be exactly 12 digits.");
//               }
//               break;
//             case "dl":
//               if (!/^[A-Z0-9]{15,16}$/i.test(documentNumber.trim())) {
//                 errors.push("DL number should be 15-16 alphanumeric characters.");
//               }
//               break;
//             case "rc":
//               if (!/^[A-Z]{2}[0-9]{1,2}[A-Z]{1,2}[0-9]{4}$/i.test(documentNumber.trim())) {
//                 errors.push("RC number format: XX99XX9999 (e.g., MH01AB1234)");
//               }
//               break;
//           }
//         }
//         break;
//       case 2: // Document Name
//         if (!documentName.trim()) {
//           errors.push("Please enter name as on document.");
//         } else if (documentName.trim().length < 3) {
//           errors.push("Name should be at least 3 characters long.");
//         }
//         break;
//       case 3: // Vehicle Number (if RC) or Skip
//         if (selectedType === "rc" && !vehicleNumber.trim()) {
//           errors.push("Please enter vehicle number for RC.");
//         } else if (selectedType === "rc" && vehicleNumber.trim()) {
//           const vehicleRegex = /^[A-Z]{2}[0-9]{1,2}[A-Z]{1,2}[0-9]{4}$/i;
//           if (!vehicleRegex.test(vehicleNumber.trim())) {
//             errors.push("Vehicle number format: XX99XX9999 (e.g., MH01AB1234)");
//           }
//         }
//         break;
//       case 4: // Dates
//         if (selectedType !== "aadhar" && !issueDate) {
//           errors.push("Please select issue date.");
//         }
//         if ((selectedType === "dl" || selectedType === "rc") && !expiryDate) {
//           errors.push("Please select expiry date.");
//         }
//         if (issueDate && selectedType !== "aadhar") {
//           const today = new Date();
//           today.setHours(0, 0, 0, 0);
//           if (issueDate > today) {
//             errors.push("Issue date cannot be in the future.");
//           }
//         }
//         if (expiryDate) {
//           const today = new Date();
//           today.setHours(0, 0, 0, 0);
//           if (expiryDate < today) {
//             errors.push("Expiry date should be in the future.");
//           }
//         }
//         if (issueDate && expiryDate && issueDate >= expiryDate) {
//           errors.push("Issue date must be before expiry date.");
//         }
//         break;
//       case 5: // Front Image
//         if (!frontImage) {
//           errors.push("Please upload front side image.");
//         }
//         break;
//       case 6: // Back Image (if required)
//         const docType = documentTypes.find((d) => d.type === selectedType);
//         if (docType && docType.has_back_side && !backImage) {
//           errors.push("Please upload back side image.");
//         }
//         break;
//       case 7: // Selfie Image
//         if (!selfieImage) {
//           errors.push("Please upload selfie with document.");
//         }
//         break;
//     }

//     if (errors.length > 0) {
//       setValidationErrors(errors);
//       Alert.alert(
//         "Validation Error",
//         errors.join("\n"),
//         [{ text: "OK", onPress: () => {} }],
//         { cancelable: true }
//       );
//       Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
//       return false;
//     }

//     return true;
//   };

//   const handleNext = () => {
//     if (validateStep()) {
//       if (currentStep === 7) {
//         submitDocument();
//       } else {
//         slideToNext();
//         Haptics.selectionAsync();
//       }
//     }
//   };

//   const createFormData = () => {
//     const formData = new FormData();

//     formData.append("phone_number", phoneNumber);
//     formData.append("document_type", selectedType);
//     formData.append("document_number", documentNumber.trim());
//     formData.append("document_name", documentName.trim());

//     if (selectedType !== "aadhar" && issueDate) {
//       formData.append("issue_date", issueDate.toISOString().split("T")[0]);
//     }

//     if (expiryDate) {
//       formData.append("expiry_date", expiryDate.toISOString().split("T")[0]);
//     }

//     if (selectedType === "rc" && vehicleNumber) {
//       formData.append("vehicle_number", vehicleNumber.trim());
//     }

//     const frontImageName = frontImage.split("/").pop();
//     formData.append("front_image", {
//       uri: frontImage,
//       name: frontImageName,
//       type: "image/jpeg",
//     });

//     if (backImage) {
//       const backImageName = backImage.split("/").pop();
//       formData.append("back_image", {
//         uri: backImage,
//         name: backImageName,
//         type: "image/jpeg",
//       });
//     }

//     const selfieImageName = selfieImage.split("/").pop();
//     formData.append("selfie_image", {
//       uri: selfieImage,
//       name: selfieImageName,
//       type: "image/jpeg",
//     });

//     if (isReuploadMode && reuploadingDocId) {
//       formData.append("is_reupload", "true");
//       formData.append("reupload_document_id", reuploadingDocId.toString());
//     }

//     return formData;
//   };

//   const submitDocument = async () => {
//     setLoading(true);
//     Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);

//     try {
//       const formData = createFormData();
//       const result = await DatabaseService.uploadDocument(formData);
      
//       if (result.success) {
//         setUploadedDocId(result.document_id);
//         setShowSuccessModal(true);
//         Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

//         // Refresh documents list
//         await loadData();
//         resetWizard();
//         setShowUploadWizard(false);
//       } else {
//         if (result.message && (result.message.includes("already have") || result.message.includes("already exists"))) {
//           Alert.alert(
//             "Document Already Exists",
//             result.message,
//             [{ text: "OK" }]
//           );
//         } else {
//           showErrorPopup(result.message || "Failed to upload document. Please try again.");
//         }
//       }
//     } catch (error) {
//       console.error("Submit error:", error);
//       showErrorPopup("Failed to upload document. Please try again.");
//     } finally {
//       setLoading(false);
//     }
//   };

//   const handleDeleteDocument = async () => {
//     if (!selectedDocument) return;

//     try {
//       setLoading(true);
//       const result = await DatabaseService.deleteDocument(selectedDocument.id);
//       if (result.success) {
//         showSuccessPopup("Document deleted successfully!");
//         await loadData();
//         setShowDeleteModal(false);
//         setSelectedDocument(null);
//         resetWizard();
//       } else {
//         showErrorPopup(result.message || "Failed to delete document.");
//       }
//     } catch (error) {
//       console.error("Delete error:", error);
//       showErrorPopup("Failed to delete document. Please try again.");
//     } finally {
//       setLoading(false);
//     }
//   };

//   const resetWizard = () => {
//     setIsReuploadMode(false);
//     setReuploadingDocId(null);
//     setSelectedType(null);
//     setDocumentNumber("");
//     setDocumentName("");
//     setVehicleNumber("");
//     setIssueDate(null);
//     setExpiryDate(null);
//     setFrontImage(null);
//     setBackImage(null);
//     setSelfieImage(null);
//     setCurrentStep(0);
//     setValidationErrors([]);
//     slideAnimValue.setValue(0);
//   };

//   const showSuccessPopup = (message) => {
//     Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
//     Alert.alert(
//       "Success!",
//       message,
//       [{ text: "OK", onPress: () => {} }],
//       { cancelable: true }
//     );
//   };

//   const showErrorPopup = (message) => {
//     Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
//     Alert.alert(
//       "Error",
//       message,
//       [{ text: "OK", onPress: () => {} }],
//       { cancelable: true }
//     );
//   };

//   // ========== RENDER FUNCTIONS ==========

//   const renderHeader = () => (
//     <View style={styles.header}>
//       <TouchableOpacity
//         style={styles.modernBackButton}
//         onPress={() => {
//           navigation.goBack();
//           Haptics.selectionAsync();
//         }}
//         activeOpacity={0.8}
//       >
//         <MaterialIcons
//           name="arrow-back-ios"
//           size={28}
//           color={Colors.orange1}
//         />
//       </TouchableOpacity>

//       <Text style={styles.headerTitleModern}>
//         Document Verification
//       </Text>

//       <TouchableOpacity
//         style={styles.modernRefreshButton}
//         onPress={loadData}
//         disabled={loading || refreshing}
//         activeOpacity={0.8}
//       >
//         <Ionicons
//           name="refresh"
//           size={26}
//           color={Colors.primary}
//         />
//       </TouchableOpacity>
//     </View>
//   );

//   // ========== UPLOAD WIZARD MODAL ==========

//   const renderUploadWizard = () => {
//     const stepTitles = [
//       "Select Document Type",
//       "Enter Document Number",
//       "Enter Name as on Document",
//       selectedType === "rc" ? "Enter Vehicle Number" : "Additional Details",
//       "Select Dates",
//       "Upload Front Side Image",
//       documentTypes.find(d => d.type === selectedType)?.has_back_side ? "Upload Back Side Image" : "Additional Photos",
//       "Upload Selfie with Document",
//       "Review & Submit"
//     ];

//     return (
//       <Modal
//         visible={showUploadWizard}
//         animationType="slide"
//         transparent={false}
//         onRequestClose={() => {
//           Alert.alert(
//             "Cancel Upload?",
//             "Are you sure you want to cancel? All entered data will be lost.",
//             [
//               { text: "Continue", style: "cancel" },
//               { 
//                 text: "Cancel", 
//                 style: "destructive",
//                 onPress: () => {
//                   resetWizard();
//                   setShowUploadWizard(false);
//                 }
//               }
//             ]
//           );
//         }}
//       >
//         <SafeAreaView style={styles.wizardContainer}>
//           {/* Header */}
//           <View style={styles.wizardHeader}>
//             <TouchableOpacity
//               style={styles.wizardBackButton}
//               onPress={() => {
//                 if (currentStep === 0) {
//                   Alert.alert(
//                     "Cancel Upload?",
//                     "Are you sure you want to cancel? All entered data will be lost.",
//                     [
//                       { text: "Continue", style: "cancel" },
//                       { 
//                         text: "Cancel", 
//                         style: "destructive",
//                         onPress: () => {
//                           resetWizard();
//                           setShowUploadWizard(false);
//                         }
//                       }
//                     ]
//                   );
//                 } else {
//                   slideToPrev();
//                 }
//               }}
//               activeOpacity={0.8}
//             >
//               <Ionicons
//                 name={currentStep === 0 ? "close" : "arrow-back"}
//                 size={24}
//                 color="#6B7280"
//               />
//             </TouchableOpacity>
            
//             <View style={styles.wizardTitleContainer}>
//               <Text style={styles.wizardTitle}>
//                 {isReuploadMode ? "Reupload Document" : "Upload New Document"}
//               </Text>
//               <Text style={styles.wizardStepTitle}>
//                 Step {currentStep + 1} of 8: {stepTitles[currentStep]}
//               </Text>
//             </View>
            
//             <View style={styles.wizardStepDots}>
//               {[0, 1, 2, 3, 4, 5, 6, 7].map((step) => (
//                 <View
//                   key={step}
//                   style={[
//                     styles.wizardStepDot,
//                     currentStep >= step && styles.wizardStepDotActive,
//                     currentStep === step && styles.wizardStepDotCurrent,
//                   ]}
//                 />
//               ))}
//             </View>
//           </View>

//           {/* Content */}
//           <Animated.View 
//             style={[
//               styles.wizardContent,
//               {
//                 transform: [{ translateX: slideAnimValue }],
//               },
//             ]}
//           >
//             {/* Step 0: Document Type */}
//             <View style={styles.wizardStep}>
//               <View style={styles.stepHeader}>
//                 <Ionicons name="document-text" size={60} color={Colors.primary} />
//                 <Text style={styles.stepTitle}>Select Document Type</Text>
//                 <Text style={styles.stepSubtitle}>
//                   Choose the type of document you want to upload
//                 </Text>
//               </View>

//               <ScrollView 
//                 style={styles.typeOptionsContainer}
//                 showsVerticalScrollIndicator={false}
//               >
//                 {documentTypes.map((type) => {
//                   const hasDoc = hasDocumentType(type.type);
//                   const docStatus = getDocumentStatus(type.type);
                  
//                   return (
//                     <TouchableOpacity
//                       key={type.type}
//                       style={[
//                         styles.typeOptionCard,
//                         selectedType === type.type && styles.typeOptionCardSelected,
//                         hasDoc && !isReuploadMode && styles.typeOptionCardDisabled,
//                       ]}
//                       onPress={() => handleSelectDocumentType(type.type)}
//                       disabled={hasDoc && !isReuploadMode}
//                       activeOpacity={0.8}
//                     >
//                       <View style={[
//                         styles.typeOptionIcon,
//                         { backgroundColor: selectedType === type.type ? Colors.primary + "20" : "#F3F4F6" }
//                       ]}>
//                         <FontAwesome5
//                           name={
//                             type.type === "aadhar" ? "id-card" :
//                             type.type === "dl" ? "car" :
//                             type.type === "rc" ? "file-contract" : "id-card"
//                           }
//                           size={24}
//                           color={selectedType === type.type ? Colors.primary : 
//                                  hasDoc ? "#9CA3AF" : "#6B7280"}
//                         />
//                       </View>
//                       <View style={styles.typeOptionInfo}>
//                         <View style={styles.typeOptionHeader}>
//                           <Text style={[
//                             styles.typeOptionName,
//                             selectedType === type.type && styles.typeOptionNameSelected,
//                             hasDoc && !isReuploadMode && styles.typeOptionNameDisabled
//                           ]}>
//                             {type.name}
//                           </Text>
//                           {hasDoc && !isReuploadMode && (
//                             <View style={[
//                               styles.statusBadgeSmall,
//                               docStatus === "approved" && { backgroundColor: "#D1FAE5" },
//                               docStatus === "pending" && { backgroundColor: "#FEF3C7" },
//                               docStatus === "rejected" && { backgroundColor: "#FEE2E2" },
//                             ]}>
//                               <Ionicons
//                                 name={
//                                   docStatus === "approved" ? "checkmark-circle" :
//                                   docStatus === "pending" ? "time" :
//                                   docStatus === "rejected" ? "close-circle" : "document"
//                                 }
//                                 size={12}
//                                 color={
//                                   docStatus === "approved" ? "#065F46" :
//                                   docStatus === "pending" ? "#92400E" :
//                                   docStatus === "rejected" ? "#DC2626" : "#6B7280"
//                                 }
//                               />
//                               <Text style={[
//                                 styles.statusBadgeText,
//                                 docStatus === "approved" && { color: "#065F46" },
//                                 docStatus === "pending" && { color: "#92400E" },
//                                 docStatus === "rejected" && { color: "#DC2626" },
//                               ]}>
//                                 {docStatus?.charAt(0).toUpperCase() + docStatus?.slice(1)}
//                               </Text>
//                             </View>
//                           )}
//                         </View>
//                         <Text style={[
//                           styles.typeOptionDescription,
//                           hasDoc && !isReuploadMode && styles.typeOptionDescriptionDisabled
//                         ]}>
//                           {hasDoc && !isReuploadMode 
//                             ? `${docStatus === "approved" ? "Already verified" : 
//                                 docStatus === "pending" ? "Pending verification" : 
//                                 "Rejected - reupload from list"}`
//                             : type.type === "aadhar" ? "Government issued identity card" :
//                                type.type === "dl" ? "Driver's license" :
//                                type.type === "rc" ? "Vehicle registration certificate" : "Document"}
//                         </Text>
//                       </View>
//                       {selectedType === type.type && (
//                         <Ionicons name="checkmark-circle" size={24} color={Colors.primary} />
//                       )}
//                       {hasDoc && !isReuploadMode && (
//                         <Ionicons name="lock-closed" size={20} color="#9CA3AF" />
//                       )}
//                     </TouchableOpacity>
//                   );
//                 })}
//               </ScrollView>
//             </View>

//             {/* Step 1: Document Number */}
//             <View style={styles.wizardStep}>
//               <View style={styles.stepHeader}>
//                 <Ionicons name="key" size={60} color={Colors.primary} />
//                 <Text style={styles.stepTitle}>Enter Document Number</Text>
//                 <Text style={styles.stepSubtitle}>
//                   Enter the number from your {selectedType && documentTypes.find(d => d.type === selectedType)?.name?.toLowerCase()}
//                 </Text>
//               </View>

//               <View style={styles.inputWrapper}>
//                 <Text style={styles.inputLabel}>Document Number</Text>
//                 <TextInput
//                   style={styles.wizardInput}
//                   value={documentNumber}
//                   onChangeText={setDocumentNumber}
//                   placeholder={`Enter ${selectedType && documentTypes.find(d => d.type === selectedType)?.name} number`}
//                   placeholderTextColor="#9CA3AF"
//                   autoCapitalize="characters"
//                   autoFocus
//                 />
//                 {selectedType === "aadhar" && (
//                   <Text style={styles.inputHint}>12-digit number (e.g., 123456789012)</Text>
//                 )}
//                 {selectedType === "dl" && (
//                   <Text style={styles.inputHint}>15-16 alphanumeric characters</Text>
//                 )}
//                 {selectedType === "rc" && (
//                   <Text style={styles.inputHint}>Format: XX99XX9999 (e.g., MH01AB1234)</Text>
//                 )}
//               </View>
//             </View>

//             {/* Step 2: Document Name */}
//             <View style={styles.wizardStep}>
//               <View style={styles.stepHeader}>
//                 <Ionicons name="person" size={60} color={Colors.primary} />
//                 <Text style={styles.stepTitle}>Name as on Document</Text>
//                 <Text style={styles.stepSubtitle}>
//                   Enter your full name exactly as it appears on the document
//                 </Text>
//               </View>

//               <View style={styles.inputWrapper}>
//                 <Text style={styles.inputLabel}>Full Name</Text>
//                 <TextInput
//                   style={styles.wizardInput}
//                   value={documentName}
//                   onChangeText={setDocumentName}
//                   placeholder="Enter your full name"
//                   placeholderTextColor="#9CA3AF"
//                   autoCapitalize="words"
//                   autoFocus
//                 />
//                 <Text style={styles.inputHint}>Minimum 3 characters required</Text>
//               </View>
//             </View>

//             {/* Step 3: Vehicle Number (if RC) or Skip */}
//             <View style={styles.wizardStep}>
//               <View style={styles.stepHeader}>
//                 <Ionicons name={selectedType === "rc" ? "car" : "information-circle"} size={60} color={Colors.primary} />
//                 <Text style={styles.stepTitle}>
//                   {selectedType === "rc" ? "Vehicle Number" : "Additional Details"}
//                 </Text>
//                 <Text style={styles.stepSubtitle}>
//                   {selectedType === "rc" 
//                     ? "Enter your vehicle registration number"
//                     : "Proceed to the next step"}
//                 </Text>
//               </View>

//               {selectedType === "rc" ? (
//                 <View style={styles.inputWrapper}>
//                   <Text style={styles.inputLabel}>Vehicle Registration Number</Text>
//                   <TextInput
//                     style={styles.wizardInput}
//                     value={vehicleNumber}
//                     onChangeText={setVehicleNumber}
//                     placeholder="Enter vehicle number (e.g., MH01AB1234)"
//                     placeholderTextColor="#9CA3AF"
//                     autoCapitalize="characters"
//                     autoFocus
//                   />
//                   <Text style={styles.inputHint}>Format: XX99XX9999 (e.g., MH01AB1234)</Text>
//                 </View>
//               ) : (
//                 <View style={styles.skipStepContainer}>
//                   <Ionicons name="checkmark-circle" size={80} color="#10B981" />
//                   <Text style={styles.skipStepText}>
//                     No additional information required for this document type.
//                   </Text>
//                 </View>
//               )}
//             </View>

//             {/* Step 4: Dates */}
//             <View style={styles.wizardStep}>
//               <View style={styles.stepHeader}>
//                 <Ionicons name="calendar" size={60} color={Colors.primary} />
//                 <Text style={styles.stepTitle}>Document Dates</Text>
//                 <Text style={styles.stepSubtitle}>
//                   Select issue and expiry dates for your document
//                 </Text>
//               </View>

//               <View style={styles.dateInputsContainer}>
//                 {selectedType !== "aadhar" && (
//                   <View style={styles.dateInputWrapper}>
//                     <Text style={styles.inputLabel}>Issue Date</Text>
//                     <TouchableOpacity
//                       style={styles.dateInput}
//                       onPress={() => setShowIssueDatePicker(true)}
//                       activeOpacity={0.7}
//                     >
//                       <Ionicons name="calendar-outline" size={20} color={Colors.primary} />
//                       <Text style={issueDate ? styles.dateText : styles.placeholderText}>
//                         {issueDate ? issueDate.toLocaleDateString("en-US", {
//                           day: "numeric",
//                           month: "short",
//                           year: "numeric"
//                         }) : "Select Issue Date"}
//                       </Text>
//                     </TouchableOpacity>
//                   </View>
//                 )}

//                 {(selectedType === "dl" || selectedType === "rc") && (
//                   <View style={styles.dateInputWrapper}>
//                     <Text style={styles.inputLabel}>Expiry Date</Text>
//                     <TouchableOpacity
//                       style={styles.dateInput}
//                       onPress={() => setShowExpiryDatePicker(true)}
//                       activeOpacity={0.7}
//                     >
//                       <Ionicons name="calendar" size={20} color={Colors.primary} />
//                       <Text style={expiryDate ? styles.dateText : styles.placeholderText}>
//                         {expiryDate ? expiryDate.toLocaleDateString("en-US", {
//                           day: "numeric",
//                           month: "short",
//                           year: "numeric"
//                         }) : "Select Expiry Date"}
//                       </Text>
//                     </TouchableOpacity>
//                   </View>
//                 )}
//               </View>

//               {showIssueDatePicker && (
//                 <DateTimePicker
//                   value={issueDate || new Date()}
//                   mode="date"
//                   display={Platform.OS === "ios" ? "spinner" : "default"}
//                   onChange={(event, selectedDate) => {
//                     setShowIssueDatePicker(false);
//                     if (selectedDate) {
//                       setIssueDate(selectedDate);
//                       Haptics.selectionAsync();
//                     }
//                   }}
//                   themeVariant="light"
//                   maximumDate={new Date()}
//                 />
//               )}

//               {showExpiryDatePicker && (
//                 <DateTimePicker
//                   value={expiryDate || new Date()}
//                   mode="date"
//                   display={Platform.OS === "ios" ? "spinner" : "default"}
//                   onChange={(event, selectedDate) => {
//                     setShowExpiryDatePicker(false);
//                     if (selectedDate) {
//                       setExpiryDate(selectedDate);
//                       Haptics.selectionAsync();
//                     }
//                   }}
//                   themeVariant="light"
//                   minimumDate={new Date()}
//                 />
//               )}
//             </View>

//             {/* Step 5: Front Image */}
//             <View style={styles.wizardStep}>
//               <View style={styles.stepHeader}>
//                 <Ionicons name="camera" size={60} color={Colors.primary} />
//                 <Text style={styles.stepTitle}>Front Side Image</Text>
//                 <Text style={styles.stepSubtitle}>
//                   Upload a clear photo of the front side of your document
//                 </Text>
//               </View>

//               {renderImagePickerStep("front", frontImage, setFrontImage, "Front Side Image")}
//             </View>

//             {/* Step 6: Back Image (if required) */}
//             <View style={styles.wizardStep}>
//               <View style={styles.stepHeader}>
//                 <Ionicons name="images" size={60} color={Colors.primary} />
//                 <Text style={styles.stepTitle}>
//                   {documentTypes.find(d => d.type === selectedType)?.has_back_side ? "Back Side Image" : "Additional Photos"}
//                 </Text>
//                 <Text style={styles.stepSubtitle}>
//                   {documentTypes.find(d => d.type === selectedType)?.has_back_side
//                     ? "Upload a clear photo of the back side of your document"
//                     : "No back side required for this document"}
//                 </Text>
//               </View>

//               {documentTypes.find(d => d.type === selectedType)?.has_back_side ? (
//                 renderImagePickerStep("back", backImage, setBackImage, "Back Side Image")
//               ) : (
//                 <View style={styles.skipStepContainer}>
//                   <Ionicons name="checkmark-circle" size={80} color="#10B981" />
//                   <Text style={styles.skipStepText}>
//                     No back side image required for this document type.
//                   </Text>
//                 </View>
//               )}
//             </View>

//             {/* Step 7: Selfie Image */}
//             <View style={styles.wizardStep}>
//               <View style={styles.stepHeader}>
//                 <Ionicons name="person-circle" size={60} color={Colors.primary} />
//                 <Text style={styles.stepTitle}>Selfie with Document</Text>
//                 <Text style={styles.stepSubtitle}>
//                   Take a selfie while holding your document for verification
//                 </Text>
//               </View>

//               {renderImagePickerStep("selfie", selfieImage, setSelfieImage, "Selfie with Document")}
//             </View>
//           </Animated.View>

//           {/* Footer with Next/Submit Button */}
//           <View style={styles.wizardFooter}>
//             <TouchableOpacity
//               style={[
//                 styles.wizardButton,
//                 styles.wizardNextButton,
//                 loading && styles.wizardButtonDisabled,
//               ]}
//               onPress={handleNext}
//               disabled={loading}
//               activeOpacity={0.8}
//             >
//               {loading ? (
//                 <ActivityIndicator size="small" color={Colors.white} />
//               ) : (
//                 <>
//                   <Text style={styles.wizardButtonText}>
//                     {currentStep === 7 ? "Submit Document" : "Continue"}
//                   </Text>
//                   <Ionicons 
//                     name={currentStep === 7 ? "cloud-upload" : "arrow-forward"} 
//                     size={20} 
//                     color={Colors.white} 
//                   />
//                 </>
//               )}
//             </TouchableOpacity>
//           </View>
//         </SafeAreaView>
//       </Modal>
//     );
//   };

//   const renderImagePickerStep = (type, imageUri, setImage, label) => {
//     const hasImage = !!imageUri;

//     return (
//       <View style={styles.imageStepContainer}>
//         {!hasImage ? (
//           <View style={styles.imagePickerButtons}>
//             <TouchableOpacity
//               style={styles.imagePickerButton}
//               onPress={() => captureImage(type)}
//               activeOpacity={0.8}
//             >
//               <View style={styles.imagePickerIcon}>
//                 <Ionicons name="camera" size={30} color={Colors.primary} />
//               </View>
//               <Text style={styles.imagePickerButtonText}>Take Photo</Text>
//               <Text style={styles.imagePickerButtonSubtext}>
//                 Use your camera to capture
//               </Text>
//             </TouchableOpacity>

//             <TouchableOpacity
//               style={styles.imagePickerButton}
//               onPress={() => pickImageFromGallery(type)}
//               activeOpacity={0.8}
//             >
//               <View style={styles.imagePickerIcon}>
//                 <Ionicons name="image" size={30} color={Colors.primary} />
//               </View>
//               <Text style={styles.imagePickerButtonText}>Choose from Gallery</Text>
//               <Text style={styles.imagePickerButtonSubtext}>
//                 Select from your photos
//               </Text>
//             </TouchableOpacity>
//           </View>
//         ) : (
//           <View style={styles.imagePreviewContainer}>
//             <Image source={{ uri: imageUri }} style={styles.imagePreviewLarge} />
//             <View style={styles.imagePreviewActions}>
//               <TouchableOpacity
//                 style={styles.imageActionButton}
//                 onPress={() => captureImage(type)}
//               >
//                 <Ionicons name="camera" size={20} color={Colors.white} />
//                 <Text style={styles.imageActionText}>Retake</Text>
//               </TouchableOpacity>
              
//               <TouchableOpacity
//                 style={styles.imageActionButton}
//                 onPress={() => pickImageFromGallery(type)}
//               >
//                 <Ionicons name="swap-horizontal" size={20} color={Colors.white} />
//                 <Text style={styles.imageActionText}>Change</Text>
//               </TouchableOpacity>
              
//               <TouchableOpacity
//                 style={[styles.imageActionButton, { backgroundColor: "#EF4444" }]}
//                 onPress={() => {
//                   Haptics.selectionAsync();
//                   setImage(null);
//                 }}
//               >
//                 <Ionicons name="trash" size={20} color={Colors.white} />
//                 <Text style={styles.imageActionText}>Remove</Text>
//               </TouchableOpacity>
//             </View>
//             <View style={styles.imageStatusBadge}>
//               <Ionicons name="checkmark-circle" size={16} color="#10B981" />
//               <Text style={styles.imageStatusText}>Image Selected</Text>
//             </View>
//           </View>
//         )}
//       </View>
//     );
//   };

//   const renderUploadView = () => (
//     <ScrollView
//       ref={scrollViewRef}
//       showsVerticalScrollIndicator={false}
//       contentContainerStyle={styles.scrollContent}
//       refreshControl={
//         <RefreshControl
//           refreshing={refreshing}
//           onRefresh={onRefresh}
//           colors={[Colors.primary]}
//           tintColor={Colors.primary}
//         />
//       }
//     >
//       {/* Header Section */}
//       <Animated.View 
//         style={[
//           styles.headerSection,
//           {
//             opacity: fadeAnim,
//             transform: [{ translateY: slideAnim }],
//           }
//         ]}
//       >
//         <View style={styles.headerIcon}>
//           <Ionicons name="shield-checkmark" size={isSmallScreen ? 28 : 32} color={Colors.primary} />
//         </View>
//         <View style={styles.headerText}>
//           <Text style={styles.headerTitle}>Document Verification</Text>
//           <Text style={styles.headerSubtitle}>
//             {documents.length > 0 
//               ? `${uploadStatus.approvedCount}/${documentTypes.length} documents verified`
//               : "Upload your documents for verification"}
//           </Text>
//         </View>
//       </Animated.View>

//       {/* Upload Button in Center */}
//       {(uploadStatus.hasPendingOrRejected || !uploadStatus.allUploaded) && (
//         <Animated.View 
//           style={[
//             styles.uploadSection,
//             {
//               opacity: fadeAnim,
//               transform: [{ translateY: slideAnim }],
//             }
//           ]}
//         >
//           <View style={styles.uploadContainer}>
//             <View style={styles.uploadIconContainer}>
//               <Ionicons name="cloud-upload" size={60} color={Colors.primary} />
//             </View>
//             <Text style={styles.uploadTitle}>
//               {uploadStatus.allUploaded ? "Upload Additional Document" : "Upload Your Documents"}
//             </Text>
//             <Text style={styles.uploadSubtitle}>
//               {uploadStatus.allUploaded 
//                 ? "Upload additional documents for verification"
//                 : "Start by uploading your first document for verification"}
//             </Text>
            
//             <TouchableOpacity
//               style={styles.uploadButton}
//               onPress={() => {
//                 resetWizard();
//                 setShowUploadWizard(true);
//                 Haptics.selectionAsync();
//               }}
//               activeOpacity={0.8}
//             >
//               <Ionicons name="add-circle" size={24} color={Colors.white} />
//               <Text style={styles.uploadButtonText}>
//                 {isReuploadMode ? "Reupload Document" : "Upload New Document"}
//               </Text>
//             </TouchableOpacity>
//           </View>
//         </Animated.View>
//       )}

//       {/* Existing Documents Section */}
//       {documents.length > 0 && (
//         <Animated.View 
//           style={[
//             styles.section,
//             {
//               opacity: fadeAnim,
//               transform: [{ translateY: slideAnim }],
//             }
//           ]}
//         >
//           <View style={styles.sectionHeader}>
//             <Text style={styles.sectionTitle}>Your Uploaded Documents</Text>
//             <Text style={styles.docCount}>{documents.length} documents</Text>
//           </View>
          
//           {documents.map(renderDocumentCard)}
//         </Animated.View>
//       )}

//       {/* All Documents Verified Message */}
//       {uploadStatus.allUploaded && !isReuploadMode && !uploadStatus.hasPendingOrRejected && (
//         <Animated.View 
//           style={[
//             styles.successMessage,
//             {
//               opacity: fadeAnim,
//               transform: [{ translateY: slideAnim }],
//             }
//           ]}
//         >
//           <View style={styles.successIcon}>
//             <Ionicons name="checkmark-circle" size={isSmallScreen ? 36 : 40} color="#10B981" />
//           </View>
//           <Text style={styles.successTitle}>All Documents Verified</Text>
//           <Text style={styles.successText}>
//             All your documents have been approved. You can view them below.
//           </Text>
//         </Animated.View>
//       )}
//     </ScrollView>
//   );

//   const renderDocumentCard = (doc) => {
//     const getStatusColor = (status) => {
//       switch (status) {
//         case "approved":
//           return "#10B981";
//         case "rejected":
//           return "#EF4444";
//         case "pending":
//           return "#F59E0B";
//         default:
//           return "#6B7280";
//       }
//     };

//     const getStatusIcon = (status) => {
//       switch (status) {
//         case "approved":
//           return "checkmark-circle";
//         case "rejected":
//           return "close-circle";
//         case "pending":
//           return "time";
//         default:
//           return "document";
//       }
//     };

//     const getTypeIcon = (type) => {
//       switch (type) {
//         case "aadhar":
//           return "id-card";
//         case "dl":
//           return "car";
//         case "rc":
//           return "file-contract";
//         default:
//           return "document";
//       }
//     };

//     const docTypeName = documentTypes.find(d => d.type === doc.document_type)?.name ||
//                         doc.document_type.toUpperCase();

//     return (
//       <TouchableOpacity
//         key={doc.id} 
//         style={[styles.documentCard, isSmallScreen && styles.documentCardSmall]}
//         onPress={() => {
//           setSelectedDocument(doc);
//           setShowViewModal(true);
//           Haptics.selectionAsync();
//         }}
//         activeOpacity={0.7}
//       >
//         <View style={styles.documentCardHeader}>
//           <View style={styles.docTypeContainer}>
//             <View style={[styles.docTypeIcon, { backgroundColor: Colors.primary + "20" }]}>
//               <FontAwesome5 name={getTypeIcon(doc.document_type)} size={isSmallScreen ? 14 : 16} color={Colors.primary} />
//             </View>
//             <View style={styles.docTypeInfo}>
//               <View style={styles.docTypeRow}>
//                 <Text style={styles.docTypeName}>{docTypeName}</Text>
//                 <View
//                   style={[
//                     styles.statusBadge,
//                     { backgroundColor: getStatusColor(doc.status) + "20" },
//                   ]}
//                 >
//                   <Ionicons
//                     name={getStatusIcon(doc.status)}
//                     size={isSmallScreen ? 12 : 14}
//                     color={getStatusColor(doc.status)}
//                   />
//                   <Text
//                     style={[
//                       styles.statusText,
//                       { color: getStatusColor(doc.status) },
//                     ]}
//                   >
//                     {doc.status.charAt(0).toUpperCase() + doc.status.slice(1)}
//                   </Text>
//                 </View>
//               </View>
//               <Text style={styles.docNumberSmall}>{doc.document_number}</Text>
//             </View>
//           </View>
//         </View>

//         <Text style={[styles.docName, isSmallScreen && styles.docNameSmall]}>{doc.document_name}</Text>

//         {doc.status === "rejected" && doc.rejection_reason && (
//           <View style={styles.rejectionBox}>
//             <Ionicons name="alert-circle" size={isSmallScreen ? 12 : 14} color="#EF4444" />
//             <Text style={[styles.rejectionText, isSmallScreen && styles.rejectionTextSmall]}>
//               {doc.rejection_reason}
//             </Text>
//           </View>
//         )}

//         <View style={[styles.docMetaContainer, isSmallScreen && styles.docMetaContainerSmall]}>
//           {doc.issue_date && doc.document_type !== "aadhar" && (
//             <View style={styles.metaItem}>
//               <Ionicons name="calendar-outline" size={isSmallScreen ? 12 : 14} color="#6B7280" />
//               <Text style={[styles.metaText, isSmallScreen && styles.metaTextSmall]}>Issued: {doc.issue_date}</Text>
//             </View>
//           )}

//           {doc.expiry_date && (
//             <View style={styles.metaItem}>
//               <Ionicons name="calendar" size={isSmallScreen ? 12 : 14} color={doc.is_expired ? "#EF4444" : "#6B7280"} />
//               <Text style={[styles.metaText, isSmallScreen && styles.metaTextSmall, doc.is_expired && { color: "#EF4444", fontWeight: "600" }]}>
//                 Expires: {doc.expiry_date}
//               </Text>
//             </View>
//           )}
//         </View>

//         <View style={[styles.documentActions, isSmallScreen && styles.documentActionsSmall]}>
//           <TouchableOpacity
//             style={styles.viewButton}
//             onPress={() => {
//               setSelectedDocument(doc);
//               setShowViewModal(true);
//               Haptics.selectionAsync();
//             }}
//           >
//             <Ionicons name="eye" size={isSmallScreen ? 14 : 16} color={Colors.primary} />
//             <Text style={[styles.viewButtonText, isSmallScreen && styles.viewButtonTextSmall]}>View Details</Text>
//           </TouchableOpacity>
          
//           {doc.status === "rejected" && (
//             <TouchableOpacity
//               style={[styles.reuploadActionButton, isSmallScreen && styles.reuploadActionButtonSmall]}
//               onPress={() => handleReuploadDocument(doc)}
//             >
//               <Ionicons name="refresh" size={isSmallScreen ? 14 : 16} color="#3B82F6" />
//               <Text style={[styles.reuploadButtonText, isSmallScreen && styles.reuploadButtonTextSmall]}>Reupload</Text>
//             </TouchableOpacity>
//           )}
          
//           <TouchableOpacity
//             style={styles.deleteButton}
//             onPress={() => {
//               setSelectedDocument(doc);
//               setShowDeleteModal(true);
//               Haptics.selectionAsync();
//             }}
//           >
//             <Ionicons name="trash-outline" size={isSmallScreen ? 14 : 16} color="#EF4444" />
//             <Text style={[styles.deleteButtonText, isSmallScreen && styles.deleteButtonTextSmall]}>Delete</Text>
//           </TouchableOpacity>
//         </View>
//       </TouchableOpacity>
//     );
//   };

//   // ========== VIEW DETAILS MODAL ==========

//   const renderViewModal = () => {
//     if (!selectedDocument) return null;

//     const getStatusColor = (status) => {
//       switch (status) {
//         case "approved": return "#10B981";
//         case "rejected": return "#EF4444";
//         case "pending": return "#F59E0B";
//         default: return "#6B7280";
//       }
//     };

//     const getStatusIcon = (status) => {
//       switch (status) {
//         case "approved": return "checkmark-circle";
//         case "rejected": return "close-circle";
//         case "pending": return "time";
//         default: return "document";
//       }
//     };

//     const getStatusBackgroundColor = (status) => {
//       switch (status) {
//         case "approved": return "#D1FAE5";
//         case "rejected": return "#FEE2E2";
//         case "pending": return "#FEF3C7";
//         default: return "#F3F4F6";
//       }
//     };

//     const getStatusBorderColor = (status) => {
//       switch (status) {
//         case "approved": return "#A7F3D0";
//         case "rejected": return "#FECACA";
//         case "pending": return "#FDE68A";
//         default: return "#E5E7EB";
//       }
//     };

//     const docTypeName = documentTypes.find(d => d.type === selectedDocument.document_type)?.name ||
//                        selectedDocument.document_type.toUpperCase();

//     return (
//       <Modal
//         visible={showViewModal}
//         animationType="slide"
//         transparent={true}
//         onRequestClose={() => setShowViewModal(false)}
//       >
//         <View style={styles.modalOverlay}>
//           <View style={[styles.viewModal, isSmallScreen && styles.viewModalSmall]}>
//             <View style={styles.viewModalHeader}>
//               <Text style={[styles.viewModalTitle, isSmallScreen && styles.viewModalTitleSmall]}>
//                 Document Details
//               </Text>
//               <TouchableOpacity onPress={() => setShowViewModal(false)}>
//                 <Ionicons name="close" size={24} color="#6B7280" />
//               </TouchableOpacity>
//             </View>

//             <ScrollView
//               showsVerticalScrollIndicator={false}
//               contentContainerStyle={styles.viewModalScrollContent}
//             >
//               {/* Status Banner */}
//               <View
//                 style={[
//                   styles.statusBanner,
//                   {
//                     backgroundColor: getStatusBackgroundColor(selectedDocument.status),
//                     borderColor: getStatusBorderColor(selectedDocument.status),
//                     margin: 16,
//                   }
//                 ]}
//               >
//                 <View style={styles.statusBannerContent}>
//                   <View style={[styles.statusBannerIconContainer, isSmallScreen && styles.statusBannerIconContainerSmall]}>
//                     <Ionicons
//                       name={getStatusIcon(selectedDocument.status)}
//                       size={isSmallScreen ? 20 : 24}
//                       color={getStatusColor(selectedDocument.status)}
//                     />
//                   </View>
//                   <View style={styles.statusBannerTextContainer}>
//                     <Text
//                       style={[
//                         styles.statusBannerTitle,
//                         isSmallScreen && styles.statusBannerTitleSmall,
//                         { color: getStatusColor(selectedDocument.status) }
//                       ]}
//                     >
//                       {selectedDocument.status.charAt(0).toUpperCase() + selectedDocument.status.slice(1)}
//                     </Text>
//                     <Text style={[styles.statusBannerSubtitle, isSmallScreen && styles.statusBannerSubtitleSmall]}>
//                       {selectedDocument.status === "approved"
//                         ? "This document has been verified and approved."
//                         : selectedDocument.status === "pending"
//                         ? "This document is under review. Please wait for verification."
//                         : "This document needs to be reuploaded with corrections."}
//                     </Text>
//                   </View>
//                 </View>
//               </View>

//               {/* Document Details Section */}
//               <View style={[styles.sectionContainer, { marginHorizontal: 16 }]}>
//                 <View style={styles.sectionHeader}>
//                   <View style={[styles.sectionIconContainer, isSmallScreen && styles.sectionIconContainerSmall]}>
//                     <FontAwesome5
//                       name={
//                         selectedDocument.document_type === "aadhar" ? "id-card" :
//                         selectedDocument.document_type === "dl" ? "car" :
//                         selectedDocument.document_type === "rc" ? "file-contract" : "id-card"
//                       }
//                       size={isSmallScreen ? 16 : 18}
//                       color={Colors.primary}
//                     />
//                   </View>
//                   <Text style={[styles.sectionTitle, isSmallScreen && styles.sectionTitleSmall]}>
//                     Document Information
//                   </Text>
//                 </View>

//                 <View style={styles.sectionDivider} />

//                 <View style={styles.detailsList}>
//                   {/* Document Type */}
//                   <View style={[styles.detailItem, isSmallScreen && styles.detailItemSmall]}>
//                     <View style={[styles.detailIconContainer, isSmallScreen && styles.detailIconContainerSmall]}>
//                       <Ionicons name="document-text" size={16} color="#6B7280" />
//                     </View>
//                     <View style={styles.detailContent}>
//                       <Text style={[styles.detailLabel, isSmallScreen && styles.detailLabelSmall]}>
//                         Document Type
//                       </Text>
//                       <Text style={[styles.detailValue, isSmallScreen && styles.detailValueSmall]}>
//                         {docTypeName}
//                       </Text>
//                     </View>
//                   </View>

//                   {/* Document Number */}
//                   <View style={[styles.detailItem, isSmallScreen && styles.detailItemSmall]}>
//                     <View style={[styles.detailIconContainer, isSmallScreen && styles.detailIconContainerSmall]}>
//                       <Ionicons name="key" size={16} color="#6B7280" />
//                     </View>
//                     <View style={styles.detailContent}>
//                       <Text style={[styles.detailLabel, isSmallScreen && styles.detailLabelSmall]}>
//                         Document Number
//                       </Text>
//                       <Text style={[styles.detailValue, isSmallScreen && styles.detailValueSmall]}>
//                         {selectedDocument.document_number}
//                       </Text>
//                     </View>
//                   </View>

//                   {/* Name */}
//                   <View style={[styles.detailItem, isSmallScreen && styles.detailItemSmall]}>
//                     <View style={[styles.detailIconContainer, isSmallScreen && styles.detailIconContainerSmall]}>
//                       <Ionicons name="person" size={16} color="#6B7280" />
//                     </View>
//                     <View style={styles.detailContent}>
//                       <Text style={[styles.detailLabel, isSmallScreen && styles.detailLabelSmall]}>
//                         Name as on Document
//                       </Text>
//                       <Text style={[styles.detailValue, isSmallScreen && styles.detailValueSmall]}>
//                         {selectedDocument.document_name}
//                       </Text>
//                     </View>
//                   </View>

//                   {/* Issue Date (if not Aadhar) */}
//                   {selectedDocument.document_type !== "aadhar" && selectedDocument.issue_date && (
//                     <View style={[styles.detailItem, isSmallScreen && styles.detailItemSmall]}>
//                       <View style={[styles.detailIconContainer, isSmallScreen && styles.detailIconContainerSmall]}>
//                         <Ionicons name="calendar-outline" size={16} color="#6B7280" />
//                       </View>
//                       <View style={styles.detailContent}>
//                         <Text style={[styles.detailLabel, isSmallScreen && styles.detailLabelSmall]}>
//                           Issue Date
//                         </Text>
//                         <Text style={[styles.detailValue, isSmallScreen && styles.detailValueSmall]}>
//                           {selectedDocument.issue_date}
//                         </Text>
//                       </View>
//                     </View>
//                   )}

//                   {/* Expiry Date (if applicable) */}
//                   {selectedDocument.expiry_date && (
//                     <View
//                       style={[
//                         styles.detailItem,
//                         isSmallScreen && styles.detailItemSmall,
//                         selectedDocument.is_expired && styles.expiredDetailItem
//                       ]}
//                     >
//                       <View style={[styles.detailIconContainer, isSmallScreen && styles.detailIconContainerSmall]}>
//                         <Ionicons
//                           name="calendar"
//                           size={16}
//                           color={selectedDocument.is_expired ? "#DC2626" : "#6B7280"}
//                         />
//                       </View>
//                       <View style={styles.detailContent}>
//                         <Text style={[styles.detailLabel, isSmallScreen && styles.detailLabelSmall]}>
//                           Expiry Date
//                         </Text>
//                         <Text
//                           style={[
//                             styles.detailValue,
//                             isSmallScreen && styles.detailValueSmall,
//                             selectedDocument.is_expired && { color: "#DC2626" }
//                           ]}
//                         >
//                           {selectedDocument.expiry_date}
//                           {selectedDocument.is_expired && " (Expired)"}
//                         </Text>
//                       </View>
//                     </View>
//                   )}

//                   {/* Vehicle Number (for RC) */}
//                   {selectedDocument.document_type === "rc" && selectedDocument.vehicle_number && (
//                     <View style={[styles.detailItem, isSmallScreen && styles.detailItemSmall]}>
//                       <View style={[styles.detailIconContainer, isSmallScreen && styles.detailIconContainerSmall]}>
//                         <Ionicons name="car" size={16} color="#6B7280" />
//                       </View>
//                       <View style={styles.detailContent}>
//                         <Text style={[styles.detailLabel, isSmallScreen && styles.detailLabelSmall]}>
//                           Vehicle Number
//                         </Text>
//                         <Text style={[styles.detailValue, isSmallScreen && styles.detailValueSmall]}>
//                           {selectedDocument.vehicle_number}
//                         </Text>
//                       </View>
//                     </View>
//                   )}

//                   {/* Upload Date */}
//                   <View style={[styles.detailItem, isSmallScreen && styles.detailItemSmall]}>
//                     <View style={[styles.detailIconContainer, isSmallScreen && styles.detailIconContainerSmall]}>
//                       <Ionicons name="cloud-upload" size={16} color="#6B7280" />
//                     </View>
//                     <View style={styles.detailContent}>
//                       <Text style={[styles.detailLabel, isSmallScreen && styles.detailLabelSmall]}>
//                         Upload Date
//                       </Text>
//                       <Text style={[styles.detailValue, isSmallScreen && styles.detailValueSmall]}>
//                         {selectedDocument.upload_date || "N/A"}
//                       </Text>
//                     </View>
//                   </View>
//                 </View>
//               </View>

//               {/* Rejection Reason Section (if rejected) */}
//               {selectedDocument.status === "rejected" && selectedDocument.rejection_reason && (
//                 <View style={[styles.rejectionSection, { marginHorizontal: 16 }]}>
//                   <View style={styles.sectionHeader}>
//                     <View style={[styles.sectionIconContainer, isSmallScreen && styles.sectionIconContainerSmall]}>
//                       <Ionicons name="alert-circle" size={isSmallScreen ? 16 : 18} color="#DC2626" />
//                     </View>
//                     <Text style={[styles.sectionTitle, isSmallScreen && styles.sectionTitleSmall]}>
//                       Rejection Reason
//                     </Text>
//                   </View>
//                   <View style={styles.rejectionContent}>
//                     <Text style={[styles.rejectionLabel, isSmallScreen && styles.rejectionLabelSmall]}>
//                       Why was this document rejected?
//                     </Text>
//                     <Text style={[styles.rejectionText, isSmallScreen && styles.rejectionTextSmall]}>
//                       {selectedDocument.rejection_reason}
//                     </Text>
//                   </View>
//                 </View>
//               )}
//             </ScrollView>

//             <View style={styles.viewModalFooter}>
//               {selectedDocument.status === "rejected" && (
//                 <TouchableOpacity
//                   style={[styles.actionButton, styles.reuploadActionButtonModal]}
//                   onPress={() => handleReuploadDocument(selectedDocument)}
//                   activeOpacity={0.8}
//                 >
//                   <Ionicons name="refresh" size={20} color={Colors.white} />
//                   <Text style={styles.reuploadActionButtonText}>Reupload Document</Text>
//                 </TouchableOpacity>
//               )}
              
//               <TouchableOpacity
//                 style={[styles.actionButton, styles.closeViewButton]}
//                 onPress={() => setShowViewModal(false)}
//                 activeOpacity={0.8}
//               >
//                 <Text style={styles.closeViewButtonText}>Close</Text>
//               </TouchableOpacity>
//             </View>
//           </View>
//         </View>
//       </Modal>
//     );
//   };

//   // ========== DELETE MODAL ==========

//   const renderDeleteModal = () => {
//     if (!selectedDocument) return null;

//     return (
//       <Modal
//         visible={showDeleteModal}
//         animationType="fade"
//         transparent={true}
//         onRequestClose={() => setShowDeleteModal(false)}
//       >
//         <View style={styles.modalOverlayCenter}>
//           <View style={[styles.deleteModal, isSmallScreen && styles.deleteModalSmall]}>
//             <View style={styles.deleteIcon}>
//               <Ionicons name="trash" size={60} color="#DC2626" />
//             </View>
            
//             <Text style={[styles.deleteTitle, isSmallScreen && styles.deleteTitleSmall]}>
//               Delete Document
//             </Text>
            
//             <Text style={[styles.deleteMessage, isSmallScreen && styles.deleteMessageSmall]}>
//               Are you sure you want to delete this document? This action cannot be undone.
//             </Text>
            
//             <View style={[styles.deleteButtons, isSmallScreen && styles.deleteButtonsSmall]}>
//               <TouchableOpacity
//                 style={[styles.deleteButtonModal, styles.cancelButton]}
//                 onPress={() => setShowDeleteModal(false)}
//                 activeOpacity={0.8}
//               >
//                 <Text style={[styles.cancelButtonText, isSmallScreen && styles.cancelButtonTextSmall]}>
//                   Cancel
//                 </Text>
//               </TouchableOpacity>
              
//               <TouchableOpacity
//                 style={[styles.deleteButtonModal, styles.confirmDeleteButton]}
//                 onPress={handleDeleteDocument}
//                 disabled={loading}
//                 activeOpacity={0.8}
//               >
//                 {loading ? (
//                   <ActivityIndicator size="small" color={Colors.white} />
//                 ) : (
//                   <>
//                     <Ionicons name="trash" size={18} color={Colors.white} />
//                     <Text style={[styles.confirmDeleteText, isSmallScreen && styles.confirmDeleteTextSmall]}>
//                       Yes, Delete
//                     </Text>
//                   </>
//                 )}
//               </TouchableOpacity>
//             </View>
//           </View>
//         </View>
//       </Modal>
//     );
//   };

//   // ========== SUCCESS MODAL ==========

//   const renderSuccessModal = () => (
//     <Modal
//       visible={showSuccessModal}
//       animationType="fade"
//       transparent={true}
//       onRequestClose={() => setShowSuccessModal(false)}
//     >
//       <View style={styles.modalOverlayCenter}>
//         <View style={[styles.successModal, isSmallScreen && styles.successModalSmall]}>
//           <View style={styles.successIconContainer}>
//             <View style={[styles.successIconCircle, isSmallScreen && styles.successIconCircleSmall]}>
//               <Ionicons name="checkmark" size={40} color={Colors.white} />
//             </View>
//           </View>
          
//           <Text style={[styles.successTitle, isSmallScreen && styles.successTitleSmall]}>
//             Upload Successful!
//           </Text>
          
//           <Text style={[styles.successMessageText, isSmallScreen && styles.successMessageTextSmall]}>
//             {isReuploadMode
//               ? "Your document has been reuploaded successfully and is pending verification."
//               : "Your document has been uploaded successfully and is pending verification."}
//           </Text>
          
//           <View style={styles.successButtons}>
//             <TouchableOpacity
//               style={[styles.successButton, styles.primaryButton]}
//               onPress={() => {
//                 setShowSuccessModal(false);
//                 resetWizard();
//               }}
//               activeOpacity={0.8}
//             >
//               <Text style={[styles.primaryButtonText, isSmallScreen && styles.primaryButtonTextSmall]}>
//                 Continue
//               </Text>
//             </TouchableOpacity>
//           </View>
//         </View>
//       </View>
//     </Modal>
//   );

//   return (
//     <SafeAreaView style={styles.container}>
//       <StatusBar backgroundColor={Colors.white} barStyle="dark-content" />

//       {/* Header */}
//       {renderHeader()}

//       {loading && !refreshing ? (
//         <View style={styles.loadingContainer}>
//           <ActivityIndicator size={isSmallScreen ? "small" : "large"} color={Colors.primary} />
//           <Text style={[styles.loadingText, isSmallScreen && styles.loadingTextSmall]}>Loading documents...</Text>
//         </View>
//       ) : (
//         renderUploadView()
//       )}

//       {/* Upload Wizard Modal */}
//       {renderUploadWizard()}

//       {/* Success Modal */}
//       {renderSuccessModal()}

//       {/* View Document Modal */}
//       {renderViewModal()}

//       {/* Delete Confirmation Modal */}
//       {renderDeleteModal()}
//     </SafeAreaView>
//   );
// }

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     backgroundColor: "#Fff",
//   },
//   // Header
//   header: {
//     flexDirection: "row",
//     alignItems: "center",
//     paddingHorizontal: 16,
//     paddingVertical: 1,
//     backgroundColor: Colors.white,
//     borderBottomWidth: 0.5,
//     borderBottomColor: "#F3F4F6",
//   },
//   modernBackButton: {
//     width: 44,
//     height: 44,
//     borderRadius: 22,
//     justifyContent: "center",
//     alignItems: "center",
//   },
//   modernRefreshButton: {
//     width: 44,
//     height: 44,
//     borderRadius: 22,
//     justifyContent: "center",
//     alignItems: "center",
//   },
//   headerTitleModern: {
//     flex: 1,
//     textAlign: "center",
//     fontSize: 28,
//     fontWeight: "700",
//     color: Colors.primary,
//   },
  
//   // Upload Wizard Styles
//   wizardContainer: {
//     flex: 1,
//     backgroundColor: Colors.white,
//   },
//   wizardHeader: {
//     paddingTop: Platform.OS === 'ios' ? 50 : 30,
//     paddingHorizontal: 20,
//     paddingBottom: 20,
//     borderBottomWidth: 1,
//     borderBottomColor: "#E5E7EB",
//     backgroundColor: Colors.white,
//   },
//   wizardBackButton: {
//     width: 40,
//     height: 40,
//     borderRadius: 20,
//     justifyContent: "center",
//     alignItems: "center",
//     marginBottom: 15,
//   },
//   wizardTitleContainer: {
//     marginBottom: 20,
//   },
//   wizardTitle: {
//     fontSize: 24,
//     fontWeight: "700",
//     color: "#1F2937",
//     marginBottom: 4,
//   },
//   wizardStepTitle: {
//     fontSize: 14,
//     color: "#6B7280",
//   },
//   wizardStepDots: {
//     flexDirection: "row",
//     justifyContent: "center",
//     alignItems: "center",
//     gap: 8,
//   },
//   wizardStepDot: {
//     width: 8,
//     height: 8,
//     borderRadius: 4,
//     backgroundColor: "#E5E7EB",
//   },
//   wizardStepDotActive: {
//     backgroundColor: Colors.primary + "80",
//   },
//   wizardStepDotCurrent: {
//     backgroundColor: Colors.primary,
//     width: 12,
//     height: 12,
//     borderRadius: 6,
//   },
//   wizardContent: {
//     flex: 1,
//     flexDirection: "row",
//     width: width * 8, // 8 steps
//   },
//   wizardStep: {
//     width: width,
//     flex: 1,
//     padding: 20,
//   },
//   stepHeader: {
//     alignItems: "center",
//     marginBottom: 30,
//   },
//   stepTitle: {
//     fontSize: 24,
//     fontWeight: "700",
//     color: "#1F2937",
//     marginTop: 20,
//     textAlign: "center",
//   },
//   stepSubtitle: {
//     fontSize: 15,
//     color: "#6B7280",
//     textAlign: "center",
//     marginTop: 8,
//     lineHeight: 22,
//   },
//   typeOptionsContainer: {
//     flex: 1,
//   },
//   typeOptionCard: {
//     flexDirection: "row",
//     alignItems: "center",
//     backgroundColor: "#FFFFFF",
//     borderRadius: 16,
//     padding: 20,
//     marginBottom: 12,
//     borderWidth: 2,
//     borderColor: "#F3F4F6",
//   },
//   typeOptionCardSelected: {
//     borderColor: Colors.primary,
//     backgroundColor: Colors.primary + "08",
//   },
//   typeOptionCardDisabled: {
//     opacity: 0.7,
//     borderColor: "#E5E7EB",
//   },
//   typeOptionIcon: {
//     width: 60,
//     height: 60,
//     borderRadius: 30,
//     justifyContent: "center",
//     alignItems: "center",
//     marginRight: 16,
//   },
//   typeOptionInfo: {
//     flex: 1,
//   },
//   typeOptionHeader: {
//     flexDirection: "row",
//     justifyContent: "space-between",
//     alignItems: "center",
//     marginBottom: 4,
//   },
//   typeOptionName: {
//     fontSize: 18,
//     fontWeight: "600",
//     color: "#1F2937",
//     flex: 1,
//   },
//   typeOptionNameSelected: {
//     color: Colors.primary,
//   },
//   typeOptionNameDisabled: {
//     color: "#9CA3AF",
//   },
//   statusBadgeSmall: {
//     flexDirection: "row",
//     alignItems: "center",
//     paddingHorizontal: 8,
//     paddingVertical: 4,
//     borderRadius: 12,
//     gap: 4,
//   },
//   statusBadgeText: {
//     fontSize: 10,
//     fontWeight: "600",
//   },
//   typeOptionDescription: {
//     fontSize: 13,
//     color: "#6B7280",
//   },
//   typeOptionDescriptionDisabled: {
//     color: "#9CA3AF",
//   },
//   inputWrapper: {
//     marginTop: 20,
//   },
//   inputLabel: {
//     fontSize: 16,
//     fontWeight: "600",
//     color: "#374151",
//     marginBottom: 8,
//   },
//   wizardInput: {
//     borderWidth: 2,
//     borderColor: "#E5E7EB",
//     borderRadius: 12,
//     padding: 16,
//     fontSize: 18,
//     color: "#1F2937",
//     backgroundColor: "#FFFFFF",
//   },
//   inputHint: {
//     fontSize: 13,
//     color: "#6B7280",
//     marginTop: 8,
//     fontStyle: "italic",
//   },
//   skipStepContainer: {
//     flex: 1,
//     justifyContent: "center",
//     alignItems: "center",
//     paddingVertical: 40,
//   },
//   skipStepText: {
//     fontSize: 16,
//     color: "#6B7280",
//     textAlign: "center",
//     marginTop: 20,
//     lineHeight: 24,
//   },
//   dateInputsContainer: {
//     gap: 20,
//     marginTop: 20,
//   },
//   dateInputWrapper: {
//     flex: 1,
//   },
//   dateInput: {
//     flexDirection: "row",
//     alignItems: "center",
//     borderWidth: 2,
//     borderColor: "#E5E7EB",
//     borderRadius: 12,
//     padding: 16,
//     backgroundColor: "#FFFFFF",
//     gap: 12,
//   },
//   dateText: {
//     fontSize: 16,
//     color: "#1F2937",
//     flex: 1,
//   },
//   placeholderText: {
//     fontSize: 16,
//     color: "#9CA3AF",
//     flex: 1,
//   },
//   imageStepContainer: {
//     flex: 1,
//     justifyContent: "center",
//   },
//   imagePickerButtons: {
//     gap: 16,
//   },
//   imagePickerButton: {
//     backgroundColor: "#FFFFFF",
//     borderRadius: 16,
//     padding: 24,
//     borderWidth: 2,
//     borderColor: "#E5E7EB",
//     alignItems: "center",
//   },
//   imagePickerIcon: {
//     width: 70,
//     height: 70,
//     borderRadius: 35,
//     backgroundColor: Colors.primary + "15",
//     justifyContent: "center",
//     alignItems: "center",
//     marginBottom: 16,
//   },
//   imagePickerButtonText: {
//     fontSize: 18,
//     fontWeight: "600",
//     color: "#1F2937",
//     marginBottom: 8,
//   },
//   imagePickerButtonSubtext: {
//     fontSize: 14,
//     color: "#6B7280",
//     textAlign: "center",
//   },
//   imagePreviewContainer: {
//     alignItems: "center",
//   },
//   imagePreviewLarge: {
//     width: width - 80,
//     height: (width - 80) * 0.75,
//     borderRadius: 16,
//     marginBottom: 20,
//   },
//   imagePreviewActions: {
//     flexDirection: "row",
//     gap: 12,
//     marginBottom: 16,
//   },
//   imageActionButton: {
//     flexDirection: "row",
//     alignItems: "center",
//     backgroundColor: Colors.primary,
//     paddingHorizontal: 20,
//     paddingVertical: 12,
//     borderRadius: 25,
//     gap: 8,
//   },
//   imageActionText: {
//     fontSize: 14,
//     fontWeight: "600",
//     color: Colors.white,
//   },
//   imageStatusBadge: {
//     flexDirection: "row",
//     alignItems: "center",
//     backgroundColor: "#10B98115",
//     paddingHorizontal: 16,
//     paddingVertical: 10,
//     borderRadius: 25,
//   },
//   imageStatusText: {
//     fontSize: 14,
//     fontWeight: "600",
//     color: "#10B981",
//     marginLeft: 8,
//   },
//   wizardFooter: {
//     padding: 20,
//     borderTopWidth: 1,
//     borderTopColor: "#E5E7EB",
//     backgroundColor: Colors.white,
//   },
//   wizardButton: {
//     flexDirection: "row",
//     alignItems: "center",
//     justifyContent: "center",
//     borderRadius: 14,
//     padding: 18,
//     gap: 10,
//   },
//   wizardNextButton: {
//     backgroundColor: Colors.primary,
//   },
//   wizardButtonDisabled: {
//     backgroundColor: "#9CA3AF",
//   },
//   wizardButtonText: {
//     fontSize: 18,
//     fontWeight: "700",
//     color: Colors.white,
//   },
  
//   // Scroll Content
//   scrollContent: {
//     paddingHorizontal: 16,
//     paddingBottom: 40,
//     paddingTop: 16,
//   },
//   loadingContainer: {
//     flex: 1,
//     justifyContent: "center",
//     alignItems: "center",
//   },
//   loadingText: {
//     marginTop: 16,
//     fontSize: 15,
//     color: "#6B7280",
//   },
//   loadingTextSmall: {
//     fontSize: 14,
//   },
  
//   // Header Section
//   headerSection: {
//     flexDirection: "row",
//     alignItems: "center",
//     backgroundColor: Colors.white,
//     borderRadius: 16,
//     padding: 20,
//     marginBottom: 20,
//     borderWidth: 1,
//     borderColor: "#E5E7EB",
//   },
//   headerIcon: {
//     width: 56,
//     height: 56,
//     borderRadius: 28,
//     backgroundColor: Colors.primary + "15",
//     justifyContent: "center",
//     alignItems: "center",
//     marginRight: 16,
//   },
//   headerText: {
//     flex: 1,
//   },
//   headerTitle: {
//     fontSize: 18,
//     fontWeight: "700",
//     color: Colors.primary,
//     marginBottom: 4,
//   },
//   headerSubtitle: {
//     fontSize: 14,
//     color: "#6B7280",
//   },
  
//   // Upload Section
//   uploadSection: {
//     marginBottom: 20,
//   },
//   uploadContainer: {
//     backgroundColor: Colors.white,
//     borderRadius: 24,
//     padding: 32,
//     alignItems: "center",
//     borderWidth: 1,
//     borderColor: "#E5E7EB",
//     shadowColor: "#000",
//     shadowOffset: { width: 0, height: 4 },
//     shadowOpacity: 0.1,
//     shadowRadius: 12,
//     elevation: 5,
//   },
//   uploadIconContainer: {
//     width: 100,
//     height: 100,
//     borderRadius: 50,
//     backgroundColor: Colors.primary + "15",
//     justifyContent: "center",
//     alignItems: "center",
//     marginBottom: 20,
//   },
//   uploadTitle: {
//     fontSize: 24,
//     fontWeight: "700",
//     color: "#1F2937",
//     marginBottom: 8,
//     textAlign: "center",
//   },
//   uploadSubtitle: {
//     fontSize: 15,
//     color: "#6B7280",
//     textAlign: "center",
//     marginBottom: 30,
//     lineHeight: 22,
//   },
//   uploadButton: {
//     flexDirection: "row",
//     alignItems: "center",
//     justifyContent: "center",
//     backgroundColor: Colors.primary,
//     borderRadius: 16,
//     paddingHorizontal: 32,
//     paddingVertical: 18,
//     gap: 12,
//     width: "100%",
//   },
//   uploadButtonText: {
//     fontSize: 18,
//     fontWeight: "700",
//     color: Colors.white,
//   },
  
//   // Section
//   section: {
//     backgroundColor: Colors.white,
//     borderRadius: 16,
//     padding: 20,
//     marginBottom: 20,
//     borderWidth: 1,
//     borderColor: "#E5E7EB",
//   },
//   sectionHeader: {
//     flexDirection: "row",
//     justifyContent: "space-between",
//     alignItems: "center",
//     marginBottom: 20,
//   },
//   sectionTitle: {
//     fontSize: 18,
//     fontWeight: "700",
//     color: "#1F2937",
//   },
//   docCount: {
//     fontSize: 14,
//     color: "#6B7280",
//     fontWeight: "500",
//   },
  
//   // Success Message
//   successMessage: {
//     backgroundColor: "#F0FDF4",
//     borderRadius: 16,
//     padding: 24,
//     marginBottom: 20,
//     borderWidth: 1,
//     borderColor: "#A7F3D0",
//     alignItems: "center",
//   },
//   successIcon: {
//     marginBottom: 16,
//   },
//   successTitle: {
//     fontSize: 18,
//     fontWeight: "700",
//     color: "#065F46",
//     marginBottom: 8,
//     textAlign: "center",
//   },
//   successText: {
//     fontSize: 14,
//     color: "#047857",
//     textAlign: "center",
//     lineHeight: 20,
//   },
  
//   // Document Card
//   documentCard: {
//     backgroundColor: "#FFFFFF",
//     borderRadius: 12,
//     padding: 16,
//     marginBottom: 12,
//     borderWidth: 1,
//     borderColor: "#E5E7EB",
//   },
//   documentCardSmall: {
//     padding: 12,
//     marginBottom: 10,
//   },
//   documentCardHeader: {
//     flexDirection: "row",
//     justifyContent: "space-between",
//     alignItems: "center",
//     marginBottom: 12,
//   },
//   docTypeContainer: {
//     flexDirection: "row",
//     alignItems: "center",
//   },
//   docTypeInfo: {
//     flex: 1,
//   },
//   docTypeRow: {
//     flexDirection: "row",
//     alignItems: "center",
//     justifyContent: "space-between",
//   },
//   docTypeName: {
//     fontSize: 16,
//     fontWeight: "600",
//     color: "#111",
//     flex: 1,
//   },
//   docTypeIcon: {
//     width: 40,
//     height: 40,
//     borderRadius: 20,
//     justifyContent: "center",
//     alignItems: "center",
//     marginRight: 12,
//   },
//   statusBadge: {
//     flexDirection: "row",
//     alignItems: "center",
//     paddingHorizontal: 8,
//     paddingVertical: 4,
//     borderRadius: 12,
//     marginLeft: 8,
//   },
//   statusText: {
//     fontSize: 12,
//     fontWeight: "600",
//     marginLeft: 4,
//   },
//   docNumberSmall: {
//     marginTop: 4,
//     fontSize: 13,
//     color: "#666",
//   },
//   docName: {
//     fontSize: 15,
//     fontWeight: "600",
//     color: "#374151",
//     marginBottom: 12,
//   },
//   docNameSmall: {
//     fontSize: 14,
//   },
//   docMetaContainer: {
//     flexDirection: "row",
//     flexWrap: "wrap",
//     marginBottom: 12,
//   },
//   docMetaContainerSmall: {
//     marginBottom: 10,
//   },
//   metaItem: {
//     flexDirection: "row",
//     alignItems: "center",
//     marginRight: 16,
//     marginBottom: 8,
//   },
//   metaText: {
//     fontSize: 12,
//     color: "#6B7280",
//     marginLeft: 6,
//   },
//   metaTextSmall: {
//     fontSize: 11,
//   },
//   rejectionBox: {
//     flexDirection: "row",
//     alignItems: "center",
//     backgroundColor: "#FEF2F2",
//     padding: 10,
//     borderRadius: 8,
//     marginBottom: 12,
//   },
//   rejectionText: {
//     fontSize: 12,
//     color: "#DC2626",
//     marginLeft: 8,
//     flex: 1,
//   },
//   rejectionTextSmall: {
//     fontSize: 11,
//   },
//   documentActions: {
//     flexDirection: "row",
//     justifyContent: "flex-end",
//     gap: 12,
//   },
//   documentActionsSmall: {
//     gap: 8,
//   },
//   viewButton: {
//     flexDirection: "row",
//     alignItems: "center",
//     paddingHorizontal: 12,
//     paddingVertical: 6,
//     backgroundColor: Colors.primary + "15",
//     borderRadius: 8,
//   },
//   viewButtonText: {
//     fontSize: 12,
//     fontWeight: "600",
//     color: Colors.primary,
//     marginLeft: 4,
//   },
//   viewButtonTextSmall: {
//     fontSize: 11,
//   },
//   reuploadActionButton: {
//     flexDirection: "row",
//     alignItems: "center",
//     paddingHorizontal: 12,
//     paddingVertical: 6,
//     backgroundColor: "#EFF6FF",
//     borderRadius: 8,
//   },
//   reuploadActionButtonSmall: {
//     paddingHorizontal: 10,
//     paddingVertical: 5,
//   },
//   reuploadButtonText: {
//     fontSize: 12,
//     fontWeight: "600",
//     color: "#3B82F6",
//     marginLeft: 4,
//   },
//   reuploadButtonTextSmall: {
//     fontSize: 11,
//   },
//   deleteButton: {
//     flexDirection: "row",
//     alignItems: "center",
//     paddingHorizontal: 12,
//     paddingVertical: 6,
//     backgroundColor: "#FEF2F2",
//     borderRadius: 8,
//   },
//   deleteButtonText: {
//     fontSize: 12,
//     fontWeight: "600",
//     color: "#DC2626",
//     marginLeft: 4,
//   },
//   deleteButtonTextSmall: {
//     fontSize: 11,
//   },
  
//   // Modal Overlay
//   modalOverlay: {
//     flex: 1,
//     backgroundColor: 'rgba(0,0,0,0.5)',
//   },
//   modalOverlayCenter: {
//     flex: 1,
//     backgroundColor: "rgba(0,0,0,0.5)",
//     justifyContent: "center",
//     alignItems: "center",
//     paddingHorizontal: 20,
//   },
  
//   // View Modal Styles
//   viewModal: {
//     backgroundColor: Colors.white,
//     borderRadius: 20,
//     width: "100%",
//     maxWidth: 500,
//     height: "85%",
//     overflow: "hidden",
//   },
//   viewModalSmall: {
//     borderRadius: 16,
//     maxHeight: "90%",
//   },
//   viewModalHeader: {
//     flexDirection: "row",
//     justifyContent: "space-between",
//     alignItems: "center",
//     padding: 24,
//     borderBottomWidth: 1,
//     borderBottomColor: "#E5E7EB",
//   },
//   viewModalTitle: {
//     fontSize: 20,
//     fontWeight: "700",
//     color: "#1F2937",
//   },
//   viewModalTitleSmall: {
//     fontSize: 18,
//   },
//   viewModalScrollContent: {
//     paddingBottom: 0,
//     paddingTop: 16,
//     paddingHorizontal: 8,
//   },
  
//   // Status Banner
//   statusBanner: {
//     padding: 20,
//     borderRadius: 12,
//     marginBottom: 20,
//     borderWidth: 1,
//   },
//   statusBannerContent: {
//     flexDirection: "row",
//     alignItems: "center",
//   },
//   statusBannerIconContainer: {
//     width: 48,
//     height: 48,
//     borderRadius: 24,
//     backgroundColor: Colors.white,
//     justifyContent: "center",
//     alignItems: "center",
//   },
//   statusBannerIconContainerSmall: {
//     width: 40,
//     height: 40,
//     borderRadius: 20,
//   },
//   statusBannerTextContainer: {
//     flex: 1,
//   },
//   statusBannerTitle: {
//     fontSize: 18,
//     fontWeight: "700",
//     marginBottom: 4,
//   },
//   statusBannerTitleSmall: {
//     fontSize: 16,
//   },
//   statusBannerSubtitle: {
//     fontSize: 14,
//     color: "#6B7280",
//     fontWeight: "500",
//   },
//   statusBannerSubtitleSmall: {
//     fontSize: 13,
//   },
  
//   // Section Container
//   sectionContainer: {
//     backgroundColor: Colors.white,
//     borderRadius: 16,
//     padding: 20,
//     marginBottom: 16,
//     borderWidth: 1,
//     borderColor: "#E5E7EB",
//     shadowColor: "#000",
//     shadowOffset: { width: 0, height: 1 },
//     shadowOpacity: 0.05,
//     shadowRadius: 4,
//     elevation: 2,
//   },
//   sectionHeader: {
//     flexDirection: "row",
//     alignItems: "center",
//     marginBottom: 12,
//   },
//   sectionDivider: {
//     height: 1,
//     backgroundColor: "#E5E7EB",
//     marginBottom: 20,
//   },
//   sectionIconContainer: {
//     width: 40,
//     height: 40,
//     borderRadius: 20,
//     backgroundColor: "#F3F4F6",
//     justifyContent: "center",
//     alignItems: "center",
//     marginRight: 12,
//   },
//   sectionIconContainerSmall: {
//     width: 36,
//     height: 36,
//     borderRadius: 18,
//     marginRight: 10,
//   },
//   sectionTitle: {
//     fontSize: 17,
//     fontWeight: "600",
//     color: "#6B7280",
//   },
//   sectionTitleSmall: {
//     fontSize: 16,
//   },
//   detailsList: {
//     marginLeft: 4,
//   },
//   detailItem: {
//     flexDirection: "row",
//     marginBottom: 20,
//   },
//   detailItemSmall: {
//     marginBottom: 16,
//   },
//   expiredDetailItem: {
//     backgroundColor: "#FEF2F2",
//     padding: 12,
//     borderRadius: 8,
//     marginLeft: -12,
//     marginRight: -12,
//   },
//   detailIconContainer: {
//     width: 36,
//     height: 36,
//     borderRadius: 18,
//     backgroundColor: "#F9FAFB",
//     justifyContent: "center",
//     alignItems: "center",
//     borderWidth: 1,
//     borderColor: "#E5E7EB",
//   },
//   detailIconContainerSmall: {
//     width: 32,
//     height: 32,
//     borderRadius: 16,
//   },
//   detailContent: {
//     flex: 1,
//   },
//   detailLabel: {
//     fontSize: 13,
//     color: "#6B7280",
//     fontWeight: "500",
//     marginBottom: 4,
//     textTransform: "uppercase",
//     letterSpacing: 0.5,
//   },
//   detailLabelSmall: {
//     fontSize: 12,
//   },
//   detailValue: {
//     fontSize: 16,
//     color: "#1F2937",
//     fontWeight: "600",
//   },
//   detailValueSmall: {
//     fontSize: 15,
//   },
  
//   // Rejection Section
//   rejectionSection: {
//     backgroundColor: "#FEF2F2",
//     borderRadius: 16,
//     padding: 20,
//     marginBottom: 16,
//     borderWidth: 1,
//     borderColor: "#FECACA",
//   },
//   rejectionContent: {
//     marginLeft: 4,
//   },
//   rejectionLabel: {
//     fontSize: 13,
//     color: "#DC2626",
//     fontWeight: "600",
//     marginBottom: 8,
//     textTransform: "uppercase",
//     letterSpacing: 0.5,
//   },
//   rejectionLabelSmall: {
//     fontSize: 12,
//   },
//   rejectionText: {
//     fontSize: 15,
//     color: "#1F2937",
//     lineHeight: 22,
//     fontWeight: "500",
//   },
//   rejectionTextSmall: {
//     fontSize: 14,
//     lineHeight: 20,
//   },
  
//   // Action Buttons in View Modal
//   actionButton: {
//     flexDirection: "row",
//     alignItems: "center",
//     justifyContent: "center",
//     padding: 16,
//     borderRadius: 12,
//     marginBottom: 12,
//   },
//   reuploadActionButtonModal: {
//     backgroundColor: "#3B82F6",
//   },
//   reuploadActionButtonText: {
//     fontSize: 16,
//     fontWeight: "600",
//     color: Colors.white,
//     marginLeft: 8,
//   },
//   closeViewButton: {
//     backgroundColor: "#F3F4F6",
//   },
//   closeViewButtonText: {
//     fontSize: 16,
//     fontWeight: "600",
//     color: "#374151",
//   },
//   viewModalFooter: {
//     padding: 24,
//     borderTopWidth: 1,
//     borderTopColor: "#E5E7EB",
//   },
  
//   // Success Modal (Document Upload)
//   successModal: {
//     backgroundColor: Colors.white,
//     borderRadius: 24,
//     padding: 30,
//     width: "100%",
//     maxWidth: 400,
//     alignItems: "center",
//   },
//   successModalSmall: {
//     padding: 24,
//     borderRadius: 20,
//   },
//   successIconContainer: {
//     marginBottom: 24,
//   },
//   successIconCircle: {
//     width: 80,
//     height: 80,
//     borderRadius: 40,
//     backgroundColor: "#10B981",
//     justifyContent: "center",
//     alignItems: "center",
//   },
//   successIconCircleSmall: {
//     width: 70,
//     height: 70,
//     borderRadius: 35,
//   },
//   successTitle: {
//     fontSize: 24,
//     fontWeight: "700",
//     color: "#1F2937",
//     marginBottom: 12,
//     textAlign: "center",
//   },
//   successTitleSmall: {
//     fontSize: 22,
//   },
//   successMessageText: {
//     fontSize: 15,
//     color: "#6B7280",
//     textAlign: "center",
//     lineHeight: 22,
//     marginBottom: 20,
//   },
//   successMessageTextSmall: {
//     fontSize: 14,
//     lineHeight: 20,
//   },
//   successButtons: {
//     width: "100%",
//   },
//   successButton: {
//     borderRadius: 12,
//     padding: 16,
//     alignItems: "center",
//   },
//   primaryButton: {
//     backgroundColor: Colors.primary,
//   },
//   primaryButtonText: {
//     fontSize: 16,
//     fontWeight: "600",
//     color: Colors.white,
//   },
//   primaryButtonTextSmall: {
//     fontSize: 15,
//   },
  
//   // Delete Modal
//   deleteModal: {
//     backgroundColor: Colors.white,
//     borderRadius: 20,
//     padding: 30,
//     width: "100%",
//     maxWidth: 400,
//     alignItems: "center",
//   },
//   deleteModalSmall: {
//     padding: 24,
//   },
//   deleteIcon: {
//     marginBottom: 20,
//   },
//   deleteTitle: {
//     fontSize: 22,
//     fontWeight: "700",
//     color: "#1F2937",
//     marginBottom: 12,
//     textAlign: "center",
//   },
//   deleteTitleSmall: {
//     fontSize: 20,
//   },
//   deleteMessage: {
//     fontSize: 15,
//     color: "#6B7280",
//     textAlign: "center",
//     lineHeight: 22,
//     marginBottom: 28,
//   },
//   deleteMessageSmall: {
//     fontSize: 14,
//     lineHeight: 20,
//   },
//   deleteButtons: {
//     flexDirection: "row",
//     width: "100%",
//     gap: 12,
//   },
//   deleteButtonsSmall: {
//     gap: 8,
//   },
//   deleteButtonModal: {
//     flex: 1,
//     borderRadius: 12,
//     padding: 16,
//     alignItems: "center",
//   },
//   cancelButton: {
//     backgroundColor: "#F3F4F6",
//   },
//   cancelButtonText: {
//     fontSize: 15,
//     fontWeight: "600",
//     color: "#374151",
//   },
//   cancelButtonTextSmall: {
//     fontSize: 14,
//   },
//   confirmDeleteButton: {
//     backgroundColor: "#DC2626",
//     flexDirection: "row",
//     alignItems: "center",
//     gap: 8,
//   },
//   confirmDeleteText: {
//     fontSize: 15,
//     fontWeight: "600",
//     color: Colors.white,
//   },
//   confirmDeleteTextSmall: {
//     fontSize: 14,
//   },
// });

import React, { useState, useEffect, useCallback, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
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
   TouchableOpacity,
     KeyboardAvoidingView,
} from "react-native";
import { Ionicons, MaterialIcons, FontAwesome5 } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import { Colors,Typography } from "../constants/Colors";
import DatabaseService from "../services/documents_ds";
import DateTimePicker from "@react-native-community/datetimepicker";
import * as Haptics from "expo-haptics";
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from "../context/AuthContext";

const { width, height } = Dimensions.get("window");
const isSmallScreen = width < 375;

// Responsive scaling functions
const scaleWidth = (size) => {
  const scaleFactor = width / 375; // Base width iPhone 6/7/8
  return size * Math.min(scaleFactor, 1.5);
};

const scaleHeight = (size) => {
  const scaleFactor = height / 667; // Base height iPhone 6/7/8
  return size * Math.min(scaleFactor, 1.5);
};

const scaleFont = (size) => {
  const scaleFactor = Math.min(width / 375, height / 667);
  return Math.round(size * Math.min(scaleFactor, 1.3));
};

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

  // Upload wizard states
  const [showUploadWizard, setShowUploadWizard] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [selectedType, setSelectedType] = useState(null);
  const [documentNumber, setDocumentNumber] = useState("");
  const [documentName, setDocumentName] = useState("");
  const [vehicleNumber, setVehicleNumber] = useState("");
  const [issueDate, setIssueDate] = useState(null);
  const [expiryDate, setExpiryDate] = useState(null);
  const [showIssueDatePicker, setShowIssueDatePicker] = useState(false);
  const [showExpiryDatePicker, setShowExpiryDatePicker] = useState(false);
  const [frontImage, setFrontImage] = useState(null);
  const [backImage, setBackImage] = useState(null);
  const [selfieImage, setSelfieImage] = useState(null);

  // Modal states
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showAlertModal, setShowAlertModal] = useState(false);
  const [alertConfig, setAlertConfig] = useState({ title: "", message: "", type: "info" });
  const [uploadedDocId, setUploadedDocId] = useState(null);
  const [selectedDocument, setSelectedDocument] = useState(null);
  const [validationErrors, setValidationErrors] = useState([]);

  // Reupload states for rejected documents
  const [reuploadingDocId, setReuploadingDocId] = useState(null);
  const [isReuploadMode, setIsReuploadMode] = useState(false);

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
  const slideAnimValue = useRef(new Animated.Value(0)).current;
  const modalScaleAnim = useRef(new Animated.Value(0.8)).current;
  const modalFadeAnim = useRef(new Animated.Value(0)).current;

  // Calculate document status
  useEffect(() => {
    if (documentTypes.length > 0) {
      const approvedDocs = documents.filter(doc => doc.status === "approved");
      const approvedTypes = approvedDocs.map(doc => doc.document_type);
      
      const missingTypes = documentTypes
        .filter(type => !approvedTypes.includes(type.type))
        .map(type => type.name);
      
      const allUploaded = missingTypes.length === 0 && documents.length > 0;
      
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
  }, [phoneNumber]);

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
        const filteredTypes = (typesRes.document_types || []).filter(
          type => !['passport', 'pan'].includes(type.type)
        );
        setDocumentTypes(filteredTypes);
      }

      // Load user's existing documents
      const docsRes = await DatabaseService.getUserDocuments(phoneNumber);
      if (docsRes.success) {
        const filteredDocs = (docsRes.documents || []).filter(
          doc => !['passport', 'pan'].includes(doc.document_type)
        );
        setDocuments(filteredDocs);
      }
    } catch (error) {
      console.error("Load data error:", error);
      showAlert("Error", "Failed to load data. Please check your connection.", "error");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    loadData();
  }, []);

  // Check if user already has a document of this type
  const hasDocumentType = (type) => {
    return documents.some(doc => doc.document_type === type);
  };

  // Get document status for a specific type
  const getDocumentStatus = (type) => {
    const doc = documents.find(d => d.document_type === type);
    return doc ? doc.status : null;
  };

  // Show attractive alert modal
  const showAlert = (title, message, type = "info") => {
    setAlertConfig({ title, message, type });
    setShowAlertModal(true);
    Haptics.notificationAsync(
      type === "error" ? Haptics.NotificationFeedbackType.Error :
      type === "success" ? Haptics.NotificationFeedbackType.Success :
      Haptics.NotificationFeedbackType.Warning
    );
  };

  const animateModalIn = () => {
    Animated.parallel([
      Animated.spring(modalScaleAnim, {
        toValue: 1,
        tension: 50,
        friction: 7,
        useNativeDriver: true,
      }),
      Animated.timing(modalFadeAnim, {
        toValue: 1,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const animateModalOut = (callback) => {
    Animated.parallel([
      Animated.spring(modalScaleAnim, {
        toValue: 0.8,
        tension: 50,
        friction: 7,
        useNativeDriver: true,
      }),
      Animated.timing(modalFadeAnim, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start(() => {
      if (callback) callback();
    });
  };

  // ========== IMAGE HANDLING ==========

  const requestCameraPermission = async () => {
    if (Platform.OS !== "web") {
      const { status } = await ImagePicker.requestCameraPermissionsAsync();
      if (status !== "granted") {
        showAlert("Permission Required", "Camera permission is required to take photos of your documents.", "error");
        return false;
      }
    }
    return true;
  };

  const requestGalleryPermission = async () => {
    if (Platform.OS !== "web") {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== "granted") {
        showAlert("Permission Required", "Gallery permission is required to select photos.", "error");
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
      showAlert("Error", "Failed to capture image. Please try again.", "error");
    }
  };

  const pickImageFromGallery = async (type) => {
    // Disable gallery option for selfie
    if (type === "selfie") {
      await captureImage("selfie");
      return;
    }

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
      showAlert("Error", "Failed to pick image. Please try again.", "error");
    }
  };

  const handleSelectDocumentType = (type) => {
    // Check if document type already exists
    if (hasDocumentType(type) && !isReuploadMode) {
      const status = getDocumentStatus(type);
      const docTypeName = documentTypes.find(d => d.type === type)?.name || type;
      
      let message = "";
      if (status === "approved") {
        message = `You already have an approved ${docTypeName} document. You cannot upload another one.`;
      } else if (status === "pending") {
        message = `You have a pending ${docTypeName} document. Please wait for approval or delete it to upload a new one.`;
      } else if (status === "rejected") {
        message = `Your ${docTypeName} document was rejected. Please reupload it from your documents list.`;
      }
      
      showAlert("Document Already Exists", message, "warning");
      return;
    }

  
    Haptics.selectionAsync();
    setSelectedType(type);
setCurrentStep(1);
slideAnimValue.setValue(-1 * width);
  };

  const handleReuploadDocument = (doc) => {
    setIsReuploadMode(true);
    setReuploadingDocId(doc.id);
    setSelectedType(doc.document_type);
    setDocumentNumber(doc.document_number);
    setDocumentName(doc.document_name);
    setVehicleNumber(doc.document_data?.vehicle_number || doc.vehicle_number || "");
    setFrontImage(null);
    setBackImage(null);
    setSelfieImage(null);
    
    // Don't set issue/expiry date for Aadhar
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
    setShowUploadWizard(true);
    setCurrentStep(1); // Start from step 1 (document number) for reupload
    Haptics.selectionAsync();
  };

 const slideToNext = () => {
  const maxStep = 7;

  if (currentStep >= maxStep) return;

  Animated.timing(slideAnimValue, {
    toValue: -(currentStep + 1) * width,
    duration: 300,
    useNativeDriver: true,
    easing: Easing.out(Easing.cubic),
  }).start(() => {
    setCurrentStep(prev => Math.min(prev + 1, maxStep));
  });
};


 const slideToPrev = () => {
  if (currentStep <= 0) return; // 🔥 BLOCK NEGATIVE

  Animated.timing(slideAnimValue, {
    toValue: -(currentStep - 1) * width,
    duration: 300,
    useNativeDriver: true,
    easing: Easing.out(Easing.cubic),
  }).start(() => {
    setCurrentStep(prev => Math.max(prev - 1, 0));
  });
};

 const validateStep = () => {
  const errors = [];

  switch (currentStep) {
    case 0: // Document Type
      if (!selectedType) {
        errors.push("Please select a document type.");
      }
      break;
    case 1: // Selfie Image
      if (!selfieImage) {
        errors.push("Please upload selfie with document.");
      }
      break;
    case 2: // Document Number
      if (!documentNumber.trim()) {
        errors.push("Please enter document number.");
      } else {
        switch (selectedType) {
          case "aadhar":
            if (!/^\d{12}$/.test(documentNumber.trim())) {
              errors.push("Aadhar number must be exactly 12 digits.");
            }
            break;
          case "dl":
            if (!/^[A-Z0-9]{15,16}$/i.test(documentNumber.trim())) {
              errors.push("DL number should be 15-16 alphanumeric characters.");
            }
            break;
          case "rc":
            if (!/^[A-Z]{2}[0-9]{1,2}[A-Z]{1,2}[0-9]{4}$/i.test(documentNumber.trim())) {
              errors.push("RC number format: XX99XX9999 (e.g., MH01AB1234)");
            }
            break;
        }
      }
      break;
    case 3: // Document Name
      if (!documentName.trim()) {
        errors.push("Please enter name as on document.");
      } else if (documentName.trim().length < 3) {
        errors.push("Name should be at least 3 characters long.");
      }
      break;
    case 4: // Vehicle Number (if RC) or Skip
      if (selectedType === "rc" && !vehicleNumber.trim()) {
        errors.push("Please enter vehicle number for RC.");
      } else if (selectedType === "rc" && vehicleNumber.trim()) {
        const vehicleRegex = /^[A-Z]{2}[0-9]{1,2}[A-Z]{1,2}[0-9]{4}$/i;
        if (!vehicleRegex.test(vehicleNumber.trim())) {
          errors.push("Vehicle number format: XX99XX9999 (e.g., MH01AB1234)");
        }
      }
      break;
    case 5: // Dates (Skip for Aadhar)
      if (selectedType !== "aadhar") {
        if (!issueDate) {
          errors.push("Please select issue date.");
        }
        if ((selectedType === "dl" || selectedType === "rc") && !expiryDate) {
          errors.push("Please select expiry date.");
        }
        if (issueDate) {
          const today = new Date();
          today.setHours(0, 0, 0, 0);
          if (issueDate > today) {
            errors.push("Issue date cannot be in the future.");
          }
        }
        if (expiryDate) {
          const today = new Date();
          today.setHours(0, 0, 0, 0);
          if (expiryDate < today) {
            errors.push("Expiry date should be in the future.");
          }
        }
        if (issueDate && expiryDate && issueDate >= expiryDate) {
          errors.push("Issue date must be before expiry date.");
        }
      }
      break;
    case 6: // Front Image
      if (!frontImage) {
        errors.push("Please upload front side image.");
      }
      break;
    case 7: // Back Image (if required)
      const docType = documentTypes.find((d) => d.type === selectedType);
      if (docType && docType.has_back_side && !backImage) {
        errors.push("Please upload back side image.");
      }
      break;
  }

  if (errors.length > 0) {
    setValidationErrors(errors);
    showAlert("Validation Error", errors.join("\n"), "error");
    return false;
  }

  return true;
};

const handleNext = () => {
  if (validateStep()) {
    if (currentStep === 7) { // Last step is now back image upload
      submitDocument();
    } else {
      slideToNext();
      Haptics.selectionAsync();
    }
  }
};
 const handleBack = () => {
  if (currentStep <= 0) {
    setShowUploadWizard(false);
    resetWizard();
    return;
  }

  slideToPrev();
  Haptics.selectionAsync();
};

  const createFormData = () => {
    const formData = new FormData();

    formData.append("phone_number", phoneNumber);
    formData.append("document_type", selectedType);
    formData.append("document_number", documentNumber.trim());
    formData.append("document_name", documentName.trim());

    // Don't add issue/expiry date for Aadhar
    if (selectedType !== "aadhar" && issueDate) {
      formData.append("issue_date", issueDate.toISOString().split("T")[0]);
    }

    if (expiryDate) {
      formData.append("expiry_date", expiryDate.toISOString().split("T")[0]);
    }

    if (selectedType === "rc" && vehicleNumber) {
      formData.append("vehicle_number", vehicleNumber.trim());
    }

    if (frontImage) {
      const frontImageName = frontImage.split("/").pop();
      formData.append("front_image", {
        uri: frontImage,
        name: frontImageName,
        type: "image/jpeg",
      });
    }

    if (backImage) {
      const backImageName = backImage.split("/").pop();
      formData.append("back_image", {
        uri: backImage,
        name: backImageName,
        type: "image/jpeg",
      });
    }

    if (selfieImage) {
      const selfieImageName = selfieImage.split("/").pop();
      formData.append("selfie_image", {
        uri: selfieImage,
        name: selfieImageName,
        type: "image/jpeg",
      });
    }

    if (isReuploadMode && reuploadingDocId) {
      formData.append("is_reupload", "true");
      formData.append("reupload_document_id", reuploadingDocId.toString());
    }

    return formData;
  };

  const submitDocument = async () => {
    setLoading(true);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);

    try {
      const formData = createFormData();
      const result = await DatabaseService.uploadDocument(formData);
      
      if (result.success) {
        setUploadedDocId(result.document_id);
        setShowSuccessModal(true);
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

        // Refresh documents list
        await loadData();
        resetWizard();
        setShowUploadWizard(false);
      } else {
        if (result.message && (result.message.includes("already have") || result.message.includes("already exists"))) {
          showAlert("Document Already Exists", result.message, "warning");
        } else {
          showAlert("Error", result.message || "Failed to upload document. Please try again.", "error");
        }
      }
    } catch (error) {
      console.error("Submit error:", error);
      showAlert("Error", "Failed to upload document. Please try again.", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteDocument = async () => {
    if (!selectedDocument) return;

    try {
      setLoading(true);
      const result = await DatabaseService.deleteDocument(selectedDocument.id);
      if (result.success) {
        showAlert("Success", "Document deleted successfully!", "success");
        await loadData();
        setShowDeleteModal(false);
        setSelectedDocument(null);
        resetWizard();
      } else {
        showAlert("Error", result.message || "Failed to delete document.", "error");
      }
    } catch (error) {
      console.error("Delete error:", error);
      showAlert("Error", "Failed to delete document. Please try again.", "error");
    } finally {
      setLoading(false);
    }
  };

  const resetWizard = () => {
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
    setCurrentStep(0);
    setValidationErrors([]);
    slideAnimValue.setValue(0);
  };

  // Auto-open camera for selfie when step 1 is reached
useEffect(() => {
  if (showUploadWizard && currentStep === 1 && !selfieImage) {
    // Small delay to ensure UI is rendered
    setTimeout(() => {
      captureImage("selfie");
    }, 300);
  }
}, [showUploadWizard, currentStep]);

// Auto-open camera for front image when step 6 is reached
useEffect(() => {
  if (showUploadWizard && currentStep === 6 && !frontImage) {
    // Small delay to ensure UI is rendered
    setTimeout(() => {
      captureImage("front");
    }, 300);
  }
}, [showUploadWizard, currentStep]);
  // ========== RENDER FUNCTIONS ==========
const renderHeader = () => (
 

    
      <View style={styles.header}>
        
        {/* Back Button */}
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

        {/* Title */}
        <Text style={styles.headerTitle}>
          Document Verification
        </Text>

        {/* Refresh Button */}
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
  // ========== ATTRACTIVE ALERT MODAL ==========

  const renderAlertModal = () => {
    const getAlertConfig = () => {
      switch (alertConfig.type) {
        case "success":
          return {
            icon: "checkmark-circle",
            color: "#10B981",
            bgColor: "#D1FAE5",
          };
        case "error":
          return {
            icon: "close-circle",
            color: "#EF4444",
            bgColor: "#FEE2E2",
          };
        case "warning":
          return {
            icon: "warning",
            color: "#F59E0B",
            bgColor: "#FEF3C7",
          };
        default:
          return {
            icon: "information-circle",
            color: Colors.primary,
            bgColor: Colors.primary + "15",
          };
      }
    };

    const alertStyle = getAlertConfig();

    return (
      <Modal
        visible={showAlertModal}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowAlertModal(false)}
        onShow={animateModalIn}
      >
        <View style={styles.modalOverlayCenter}>
          <Animated.View 
            style={[
              styles.alertModal,
              {
                opacity: modalFadeAnim,
                transform: [{ scale: modalScaleAnim }],
              }
            ]}
          >
            <View style={[styles.alertIconContainer, { backgroundColor: alertStyle.bgColor }]}>
              <Ionicons name={alertStyle.icon} size={scaleFont(60)} color={alertStyle.color} />
            </View>
            
            <Text style={styles.alertTitle}>{alertConfig.title}</Text>
            
            <Text style={styles.alertMessage}>{alertConfig.message}</Text>
            
            <TouchableOpacity
              style={[styles.alertButton, { backgroundColor: alertStyle.color }]}
              onPress={() => {
                animateModalOut(() => setShowAlertModal(false));
                Haptics.selectionAsync();
              }}
              activeOpacity={0.8}
            >
              <Text style={styles.alertButtonText}>OK</Text>
            </TouchableOpacity>
          </Animated.View>
        </View>
      </Modal>
    );
  };

  // ========== ATTRACTIVE SUCCESS MODAL ==========

  const renderSuccessModal = () => {
    const [animationProgress] = useState(new Animated.Value(0));

    useEffect(() => {
      if (showSuccessModal) {
        Animated.spring(animationProgress, {
          toValue: 1,
          tension: 100,
          friction: 10,
          useNativeDriver: true,
        }).start();
      }
    }, [showSuccessModal]);

    return (
      <Modal
        visible={showSuccessModal}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowSuccessModal(false)}
      >
        <View style={styles.modalOverlayCenter}>
          <Animated.View 
            style={[
              styles.successModalContainer,
              {
                opacity: animationProgress,
                transform: [
                  { scale: animationProgress },
                  {
                    translateY: animationProgress.interpolate({
                      inputRange: [0, 1],
                      outputRange: [50, 0],
                    }),
                  },
                ],
              },
            ]}
          >
            <View style={styles.successIconCircle}>
              <Ionicons name="checkmark" size={scaleFont(50)} color={Colors.white} />
            </View>
            
            <Text style={styles.successModalTitle}>Success!</Text>
            
            <Text style={styles.successModalMessage}>
              {isReuploadMode
                ? "Your document has been reuploaded successfully! It is now pending verification."
                : "Your document has been uploaded successfully! It is now pending verification."}
            </Text>
            
            <View style={styles.successDetails}>
              {/* <View style={styles.successDetailItem}>
                <Ionicons name="document-text" size={scaleFont(20)} color={Colors.primary} />
                <Text style={styles.successDetailText}>
                  {selectedType && documentTypes.find(d => d.type === selectedType)?.name}
                </Text>
              </View> */}
              
              <View style={styles.successDetailItem}>
                <Ionicons name="time" size={scaleFont(20)} color={Colors.primary} />
                <Text style={styles.successDetailText}>
                  Verification usually takes 24-48 hours
                </Text>
              </View>
            </View>
            
            <TouchableOpacity
              style={styles.successModalButton}
              onPress={() => {
                Haptics.selectionAsync();
                setShowSuccessModal(false);
                resetWizard();
              }}
              activeOpacity={0.8}
            >
              <Ionicons name="checkmark-circle" size={scaleFont(22)} color={Colors.white} />
              <Text style={styles.successModalButtonText}>Great! Continue</Text>
            </TouchableOpacity>
          </Animated.View>
        </View>
      </Modal>
    );
  };

  // ========== VIEW DOCUMENT MODAL ==========

  const renderViewModal = () => {
    if (!selectedDocument) return null;

    const docType = documentTypes.find(d => d.type === selectedDocument.document_type);
    const isRejected = selectedDocument.status === "rejected";

    return (
      <Modal
        visible={showViewModal}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowViewModal(false)}
        onShow={animateModalIn}
      >
        <View style={styles.modalOverlayCenter}>
          <Animated.View 
            style={[
              styles.viewModalContainer,
              {
                opacity: modalFadeAnim,
                transform: [{ scale: modalScaleAnim }],
              }
            ]}
          >
            <View style={styles.viewModalHeader}>
              <Text style={styles.viewModalTitle}>Document Details</Text>
              <TouchableOpacity
                onPress={() => setShowViewModal(false)}
                style={styles.closeButton}
              >
                <Ionicons name="close" size={scaleFont(24)} color="#6B7280" />
              </TouchableOpacity>
            </View>

        <ScrollView
  style={styles.viewModalContent}
  showsVerticalScrollIndicator={false}
>
  {/* ================= DOCUMENT TYPE + STATUS ================= */}
  <View
    style={[
      styles.viewInfoRow,
      isSmallScreen && styles.viewInfoRowSmall,
    ]}
  >
    <View style={styles.viewInfoItem}>
      <Text style={styles.viewInfoLabel}>Document Type</Text>
      <Text style={styles.viewInfoValue}>
        {docType?.name || selectedDocument.document_type}
      </Text>
    </View>

    <View
      style={[
        styles.viewStatusBadge,
        selectedDocument.status === "approved" && styles.viewStatusBadgeApproved,
        selectedDocument.status === "pending" && styles.viewStatusBadgePending,
        selectedDocument.status === "rejected" && styles.viewStatusBadgeRejected,
      ]}
    >
      <Ionicons
        name={
          selectedDocument.status === "approved"
            ? "checkmark-circle"
            : selectedDocument.status === "pending"
            ? "time"
            : "close-circle"
        }
        size={scaleFont(14)}
        color={Colors.white}
      />
      <Text style={styles.viewStatusBadgeText}>
        {selectedDocument.status?.charAt(0).toUpperCase() +
          selectedDocument.status?.slice(1)}
      </Text>
    </View>
  </View>

  {/* ================= DOCUMENT NUMBER ================= */}
  <View style={styles.viewInfoItem}>
    <Text style={styles.viewInfoLabel}>Document Number</Text>
    <Text style={styles.viewInfoValue}>
      {selectedDocument.document_number}
    </Text>
  </View>

  {/* ================= DOCUMENT NAME ================= */}
  <View style={styles.viewInfoItem}>
    <Text style={styles.viewInfoLabel}>Name on Document</Text>
    <Text style={styles.viewInfoValue}>
      {selectedDocument.document_name}
    </Text>
  </View>

  {/* ================= VEHICLE NUMBER (RC) ================= */}
  {selectedDocument.document_type === "rc" &&
    selectedDocument.vehicle_number && (
      <View style={styles.viewInfoItem}>
        <Text style={styles.viewInfoLabel}>Vehicle Number</Text>
        <Text style={styles.viewInfoValue}>
          {selectedDocument.vehicle_number}
        </Text>
      </View>
    )}

  {/* ================= ISSUE / EXPIRY DATES ================= */}
  {selectedDocument.document_type !== "aadhar" && (
    <>
      {selectedDocument.issue_date && (
        <View style={styles.viewInfoItem}>
          <Text style={styles.viewInfoLabel}>Issue Date</Text>
          <Text style={styles.viewInfoValue}>
            {new Date(selectedDocument.issue_date).toLocaleDateString("en-IN")}
          </Text>
        </View>
      )}

      {selectedDocument.expiry_date && (
        <View style={styles.viewInfoItem}>
          <Text style={styles.viewInfoLabel}>Expiry Date</Text>
          <Text style={styles.viewInfoValue}>
            {new Date(selectedDocument.expiry_date).toLocaleDateString("en-IN")}
          </Text>
        </View>
      )}
    </>
  )}

  {/* ================= UPLOADED DATE & TIME ================= */}
  {selectedDocument.submitted_at && (
    <View style={styles.viewInfoItem}>
      <Text style={styles.viewInfoLabel}>Uploaded On</Text>
      <Text style={styles.viewInfoValue}>
        {new Date(selectedDocument.submitted_at).toLocaleString("en-IN", {
          day: "2-digit",
          month: "2-digit",
          year: "numeric",
          hour: "2-digit",
          minute: "2-digit",
          hour12: true,
        })}
      </Text>
    </View>
  )}

  {/* ================= REJECTION REASON ================= */}
  {isRejected && selectedDocument.rejection_reason && (
    <View style={styles.rejectionReasonContainer}>
      <Ionicons
        name="warning"
        size={scaleFont(20)}
        color="#DC2626"
      />
      <View style={styles.rejectionReasonContent}>
        <Text style={styles.rejectionReasonTitle}>
          Rejection Reason
        </Text>
        <Text style={styles.rejectionReasonText}>
          {selectedDocument.rejection_reason}
        </Text>
      </View>
    </View>
  )}

  {/* ================= IMAGES ================= */}
  <Text style={styles.imagesTitle}>Uploaded Images</Text>

  {selectedDocument.front_image_url && (
    <View style={styles.imagePreviewContainer}>
      <Text style={styles.imageLabel}>Front Side</Text>
      <Image
        source={{ uri: selectedDocument.front_image_url }}
        style={[
          styles.documentImage,
          isSmallScreen && styles.documentImageSmall,
        ]}
        resizeMode="contain"
      />
    </View>
  )}

  {selectedDocument.back_image_url && (
    <View style={styles.imagePreviewContainer}>
      <Text style={styles.imageLabel}>Back Side</Text>
      <Image
        source={{ uri: selectedDocument.back_image_url }}
        style={[
          styles.documentImage,
          isSmallScreen && styles.documentImageSmall,
        ]}
        resizeMode="contain"
      />
    </View>
  )}

  {selectedDocument.selfie_image_url && (
    <View style={styles.imagePreviewContainer}>
      <Text style={styles.imageLabel}>Selfie with Document</Text>
      <Image
        source={{ uri: selectedDocument.selfie_image_url }}
        style={[
          styles.documentImage,
          isSmallScreen && styles.documentImageSmall,
        ]}
        resizeMode="contain"
      />
    </View>
  )}
</ScrollView>


            <View style={[styles.viewModalActions, isSmallScreen && styles.viewModalActionsSmall]}>
              {isRejected && (
                <TouchableOpacity
                  style={styles.reuploadActionButton}
                  onPress={() => handleReuploadDocument(selectedDocument)}
                  activeOpacity={0.8}
                >
                  <Ionicons name="refresh" size={scaleFont(20)} color={Colors.white} />
                  <Text style={styles.reuploadActionButtonText}>Reupload Document</Text>
                </TouchableOpacity>
              )}
              
              <TouchableOpacity
                style={styles.deleteActionButton}
                onPress={() => {
                  setShowViewModal(false);
                  setShowDeleteModal(true);
                }}
                activeOpacity={0.8}
              >
                <Ionicons name="trash" size={scaleFont(20)} color="#DC2626" />
                <Text style={styles.deleteActionButtonText}>Delete Document</Text>
              </TouchableOpacity>
            </View>
          </Animated.View>
        </View>
      </Modal>
    );
  };

  // ========== DELETE CONFIRMATION MODAL ==========

  const renderDeleteModal = () => {
    return (
      <Modal
        visible={showDeleteModal}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowDeleteModal(false)}
        onShow={animateModalIn}
      >
        <View style={styles.modalOverlayCenter}>
          <Animated.View 
            style={[
              styles.deleteModal,
              {
                opacity: modalFadeAnim,
                transform: [{ scale: modalScaleAnim }],
              }
            ]}
          >
            <View style={[styles.deleteIconContainer, { backgroundColor: "#FEE2E2" }]}>
              <Ionicons name="warning" size={scaleFont(60)} color="#DC2626" />
            </View>
            
            <Text style={styles.deleteTitle}>Delete Document</Text>
            
            <Text style={styles.deleteMessage}>
              Are you sure you want to delete this document? This action cannot be undone.
            </Text>
            
            <View style={[styles.deleteActions, isSmallScreen && styles.deleteActionsColumn]}>
              <TouchableOpacity
                style={styles.cancelDeleteButton}
                onPress={() => {
                  animateModalOut(() => setShowDeleteModal(false));
                  Haptics.selectionAsync();
                }}
                activeOpacity={0.8}
              >
                <Text style={styles.cancelDeleteButtonText}>Cancel</Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={styles.confirmDeleteButton}
                onPress={handleDeleteDocument}
                activeOpacity={0.8}
                disabled={loading}
              >
                {loading ? (
                  <ActivityIndicator color={Colors.white} size="small" />
                ) : (
                  <>
                    <Ionicons name="trash" size={scaleFont(20)} color={Colors.white} />
                    <Text style={styles.confirmDeleteButtonText}>Delete</Text>
                  </>
                )}
              </TouchableOpacity>
            </View>
          </Animated.View>
        </View>
      </Modal>
    );
  };

  // ========== UPLOAD WIZARD MODAL ==========


  const renderUploadWizard = () => {
   const isAadhar = selectedType === "aadhar";
const stepTitles = isAadhar
  ? [
      "Select Document Type",
      "Take Selfie",
      "Enter Aadhar Number",
      "Name on Aadhar",
       "Upload Front Image",
      "Upload Back Image"
    ]
  : [
      "Select Document Type",
      "Take Selfie",
      "Enter Document Number",
      "Enter Name",
      "Additional Details",
      "Select Dates",
      "Upload Front Image",
      "Upload Back Image",
    ];


  const renderStepContent = () => {
    switch (currentStep) {
      case 0:
        // Document type selection (keep the same)
        return (
          <View style={styles.wizardStep}>
            <View style={styles.stepHeader}>
              <Ionicons name="document-text" size={scaleFont(40)} color={Colors.primary} />
              {/* <Text style={styles.stepTitle}>Select Document Type</Text> */}
              <Text style={styles.stepSubtitle}>
                Choose the type of document you want to upload
              </Text>
            </View>

            <ScrollView 
              style={styles.typeOptionsContainer}
              showsVerticalScrollIndicator={false}
              contentContainerStyle={styles.typeOptionsContent}
            >
              {documentTypes.map((type) => {
                const hasDoc = hasDocumentType(type.type);
                const docStatus = getDocumentStatus(type.type);
                const isSelected = selectedType === type.type;
                
                return (
                  <TouchableOpacity
                    key={type.type}
                    style={[
                      styles.typeOptionCard,
                      isSelected && styles.typeOptionCardSelected,
                      hasDoc && !isReuploadMode && styles.typeOptionCardDisabled,
                    ]}
                    onPress={() => handleSelectDocumentType(type.type)}
                    disabled={hasDoc && !isReuploadMode}
                    activeOpacity={0.8}
                  >
                    <View style={[
                      styles.typeOptionIconContainer,
                      isSelected && { backgroundColor: Colors.primary + "20" },
                      hasDoc && !isReuploadMode && { backgroundColor: "#F3F4F6" }
                    ]}>
                      <FontAwesome5
                        name={
                          type.type === "aadhar" ? "id-card" :
                          type.type === "dl" ? "id-card" :
                          type.type === "rc" ? "file-alt" : "id-card"
                        }
                        size={scaleFont(28)}
                        color={
                          isSelected ? Colors.primary : 
                          hasDoc && !isReuploadMode ? "#9CA3AF" : "#4B5563"
                        }
                      />
                    </View>
                    
                    <View style={styles.typeOptionContent}>
                      <Text style={[
                        styles.typeOptionName,
                        isSelected && styles.typeOptionNameSelected,
                        hasDoc && !isReuploadMode && styles.typeOptionNameDisabled
                      ]}>
                        {type.name}
                      </Text>
                      
                      <Text style={[
                        styles.typeOptionDescription,
                        hasDoc && !isReuploadMode && styles.typeOptionDescriptionDisabled
                      ]}>
                        {type.type === "aadhar" ? "Government ID Card" :
                         type.type === "dl" ? "Driver's License" :
                         type.type === "rc" ? "Vehicle Registration" : "Document"}
                      </Text>
                    </View>
                    
                    <View style={styles.typeOptionRightSection}>
                      {hasDoc && !isReuploadMode ? (
                        <View style={[
                          styles.typeOptionStatus,
                          docStatus === "approved" && styles.typeOptionStatusApproved,
                          docStatus === "pending" && styles.typeOptionStatusPending,
                          docStatus === "rejected" && styles.typeOptionStatusRejected,
                        ]}>
                          <Ionicons
                            name={
                              docStatus === "approved" ? "checkmark" :
                              docStatus === "pending" ? "time" : "close"
                            }
                            size={scaleFont(12)}
                            color={Colors.white}
                          />
                          <Text style={styles.typeOptionStatusText}>
                            {docStatus?.charAt(0).toUpperCase() + docStatus?.slice(1)}
                          </Text>
                        </View>
                      ) : isSelected ? (
                        <View style={styles.typeOptionSelectedIndicator}>
                          <Ionicons name="checkmark-circle" size={scaleFont(24)} color={Colors.primary} />
                        </View>
                      ) : (
                        <View style={styles.typeOptionArrow}>
                          <Ionicons name="chevron-forward" size={scaleFont(20)} color="#9CA3AF" />
                        </View>
                      )}
                    </View>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>

            {validationErrors.length > 0 && currentStep === 0 && (
              <View style={styles.validationErrorContainer}>
                <Ionicons name="alert-circle" size={scaleFont(20)} color="#DC2626" />
                <Text style={styles.validationErrorText}>
                  {validationErrors.join('\n')}
                </Text>
              </View>
            )}

            <TouchableOpacity
              style={[
                styles.nextButton,
                !selectedType && styles.nextButtonDisabled,
              ]}
              onPress={handleNext}
              disabled={!selectedType}
              activeOpacity={0.8}
            >
              <Text style={styles.nextButtonText}>Continue</Text>
              <Ionicons name="arrow-forward" size={scaleFont(20)} color={Colors.white} />
            </TouchableOpacity>
          </View>
        );
      
      case 1: // Selfie Step (previously step 7)
        return (
          <View style={styles.wizardStep}>
            <View style={styles.stepHeader}>
              <Ionicons name="person-circle" size={scaleFont(40)} color={Colors.primary} />
              {/* <Text style={styles.stepTitle}>Take Selfie with Document</Text> */}
              <Text style={styles.stepSubtitle}>
                Take a selfie while holding your document next to your face
              </Text>
            </View>

            <View style={styles.imageUploadContainer}>
              {/* <Text style={styles.imageUploadTips}>
                📸 Requirements:
                {"\n"}• Hold document next to your face
                {"\n"}• Both your face and document should be visible
                {"\n"}• Ensure good lighting
                {"\n"}• Document text should be readable
              </Text> */}

              {selfieImage ? (
                <View style={styles.imagePreviewContainer}>
                  <Image source={{ uri: selfieImage }} style={styles.imagePreview} />
                  <View style={[styles.imagePreviewActions, isSmallScreen && styles.imagePreviewActionsColumn]}>
                    <TouchableOpacity
                      style={styles.imageActionButton}
                      onPress={() => captureImage("selfie")}
                      activeOpacity={0.8}
                    >
                      <Ionicons name="camera" size={scaleFont(20)} color={Colors.primary} />
                      <Text style={styles.imageActionButtonText}>Retake</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={styles.imageActionButtonDanger}
                      onPress={() => setSelfieImage(null)}
                      activeOpacity={0.8}
                    >
                      <Ionicons name="trash" size={scaleFont(20)} color="#DC2626" />
                      <Text style={styles.imageActionButtonTextDanger}>Remove</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              ) : (
                <TouchableOpacity
                  style={styles.imageUploadCard}
                  onPress={() => captureImage("selfie")}
                  activeOpacity={0.8}
                >
                  <View style={styles.imageUploadPlaceholder}>
                    <Ionicons name="person-circle" size={scaleFont(50)} color="#9CA3AF" />
                    <Text style={styles.imageUploadPlaceholderText}>
                      Tap to take selfie
                    </Text>
                    <Text style={styles.imageUploadPlaceholderSubtext}>
                      Camera only - No gallery option
                    </Text>
                  </View>
                  <Text style={styles.cameraOnlyNote}>
                    Selfie must be taken with camera for verification
                  </Text>
                </TouchableOpacity>
              )}
            </View>

            <TouchableOpacity
              style={[
                styles.nextButton,
                !selfieImage && styles.nextButtonDisabled,
              ]}
              onPress={handleNext}
              disabled={!selfieImage}
              activeOpacity={0.8}
            >
              <Text style={styles.nextButtonText}>Continue</Text>
              <Ionicons name="arrow-forward" size={scaleFont(20)} color={Colors.white} />
            </TouchableOpacity>
          </View>
        );

      case 2: // Document Number (previously step 1)
        return (
          <View style={styles.wizardStep}>
            <View style={styles.stepHeader}>
              <Ionicons name="keypad" size={scaleFont(40)} color={Colors.primary} />
              {/* <Text style={styles.stepTitle}>Enter Document Number</Text> */}
              <Text style={styles.stepSubtitle}>
                Enter the number exactly as it appears on your document
              </Text>
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>
                {selectedType === "aadhar" ? "Aadhar Number" :
                 selectedType === "dl" ? "Driver's License Number" :
                 selectedType === "rc" ? "Registration Certificate Number" : "Document Number"}
              </Text>
              <TextInput
                style={styles.textInput}
                placeholder={
                  selectedType === "aadhar" ? "Enter 12-digit Aadhar number" :
                  selectedType === "dl" ? "e.g., MH01201900012345" :
                  selectedType === "rc" ? "e.g., MH01AB1234" : "Enter document number"
                }
                placeholderTextColor="#9CA3AF"
                value={documentNumber}
                onChangeText={setDocumentNumber}
                keyboardType="default"
                autoCapitalize="characters"
                maxLength={selectedType === "aadhar" ? 12 : 20}
              />
              <Text style={styles.inputHelper}>
                {selectedType === "aadhar" ? "12 digits without spaces" :
                 selectedType === "dl" ? "15-16 characters (e.g., MH01201900012345)" :
                 selectedType === "rc" ? "Format: XX99XX9999 (e.g., MH01AB1234)" : "Enter the full document number"}
              </Text>
            </View>

            <TouchableOpacity
              style={[
                styles.nextButton,
                !documentNumber.trim() && styles.nextButtonDisabled,
              ]}
              onPress={handleNext}
              disabled={!documentNumber.trim()}
              activeOpacity={0.8}
            >
              <Text style={styles.nextButtonText}>Continue</Text>
              <Ionicons name="arrow-forward" size={scaleFont(20)} color={Colors.white} />
            </TouchableOpacity>
          </View>
        );

      case 3: // Document Name (previously step 2)
        return (
          <View style={styles.wizardStep}>
            <View style={styles.stepHeader}>
              <Ionicons name="person" size={scaleFont(40)} color={Colors.primary} />
              {/* <Text style={styles.stepTitle}>Enter Name as on Document</Text> */}
              <Text style={styles.stepSubtitle}>
                Enter your full name exactly as it appears on the document
              </Text>
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Full Name</Text>
              <TextInput
                style={styles.textInput}
                placeholder="Enter your full name"
                placeholderTextColor="#9CA3AF"
                value={documentName}
                onChangeText={setDocumentName}
                autoCapitalize="words"
              />
              <Text style={styles.inputHelper}>
                Make sure it matches exactly with the document (case sensitive)
              </Text>
            </View>

            <TouchableOpacity
              style={[
                styles.nextButton,
                !documentName.trim() && styles.nextButtonDisabled,
              ]}
              onPress={handleNext}
              disabled={!documentName.trim()}
              activeOpacity={0.8}
            >
              <Text style={styles.nextButtonText}>Continue</Text>
              <Ionicons name="arrow-forward" size={scaleFont(20)} color={Colors.white} />
            </TouchableOpacity>
          </View>
        );

      case 4: // Vehicle Number or Additional Details (previously step 3)
        return (
          <View style={styles.wizardStep}>
            <View style={styles.stepHeader}>
              <Ionicons
                name={selectedType === "rc" ? "car" : "checkmark-circle"}
                size={scaleFont(40)}
                color={selectedType === "rc" ? Colors.primary : "#10B981"}
              />
              {/* <Text style={styles.stepTitle}>
                {selectedType === "rc" ? "Enter Vehicle Number" : "Additional Details"}
              </Text> */}
              <Text style={styles.stepSubtitle}>
                {selectedType === "rc" 
                  ? "Enter the vehicle registration number"
                  : "All required information has been collected. Continue to upload images."}
              </Text>
            </View>

            {selectedType === "rc" ? (
              <View style={styles.inputContainer}>
                <Text style={styles.inputLabel}>Vehicle Registration Number</Text>
                <TextInput
                  style={styles.textInput}
                  placeholder="e.g., MH01AB1234"
                  placeholderTextColor="#9CA3AF"
                  value={vehicleNumber}
                  onChangeText={setVehicleNumber}
                  autoCapitalize="characters"
                />
                <Text style={styles.inputHelper}>
                  Format: XX99XX9999 (State code, district, series, number)
                </Text>
              </View>
            ) : (
              <View style={styles.infoCard}>
                <Ionicons name="checkmark-circle" size={scaleFont(40)} color="#10B981" />
                <Text style={styles.infoCardTitle}>Ready for Image Upload</Text>
                <Text style={styles.infoCardText}>
                  All required details have been entered. Next, you'll need to upload images of your document.
                </Text>
              </View>
            )}

            <TouchableOpacity
              style={[
                styles.nextButton,
                selectedType === "rc" && !vehicleNumber.trim() && styles.nextButtonDisabled,
              ]}
              onPress={handleNext}
              disabled={selectedType === "rc" && !vehicleNumber.trim()}
              activeOpacity={0.8}
            >
              <Text style={styles.nextButtonText}>Continue</Text>
              <Ionicons name="arrow-forward" size={scaleFont(20)} color={Colors.white} />
            </TouchableOpacity>
          </View>
        );

      case 5: // Dates (previously step 4)
        return (
          <View style={styles.wizardStep}>
            <View style={styles.stepHeader}>
              <Ionicons 
                name={selectedType === "aadhar" ? "information-circle" : "calendar"} 
                size={scaleFont(60)} 
                color={Colors.primary} 
              />
              {/* <Text style={styles.stepTitle}>
                {selectedType === "aadhar" ? "Aadhar Details" : "Select Dates"}
              </Text> */}
              <Text style={styles.stepSubtitle}>
                {selectedType === "aadhar"
                  ? "Aadhar doesn't require issue/expiry dates"
                  : "Select the issue and expiry dates of your document"}
              </Text>
            </View>

            {selectedType === "aadhar" ? (
              <View style={styles.infoCard}>
                <Ionicons name="information-circle" size={scaleFont(40)} color={Colors.primary} />
                <Text style={styles.infoCardTitle}>Dates Not Required</Text>
                <Text style={styles.infoCardText}>
                  Aadhar cards don't have issue or expiry dates. You can proceed to upload images.
                </Text>
                <TouchableOpacity
                  style={styles.skipDatesButton}
                  onPress={handleNext}
                  activeOpacity={0.8}
                >
                  <Text style={styles.skipDatesButtonText}>Continue to Image Upload</Text>
                  <Ionicons name="arrow-forward" size={scaleFont(16)} color={Colors.primary} />
                </TouchableOpacity>
              </View>
            ) : (
              <>
                <View style={styles.dateInputContainer}>
                  <Text style={styles.inputLabel}>Issue Date</Text>
                  <TouchableOpacity
                    style={styles.datePickerButton}
                    onPress={() => setShowIssueDatePicker(true)}
                    activeOpacity={0.8}
                  >
                    <Ionicons name="calendar-outline" size={scaleFont(20)} color="#6B7280" />
                    <Text style={styles.datePickerButtonText}>
                      {issueDate ? issueDate.toLocaleDateString() : "Select issue date"}
                    </Text>
                    <Ionicons name="chevron-down" size={scaleFont(20)} color="#6B7280" />
                  </TouchableOpacity>
                  
                  {showIssueDatePicker && (
                    <DateTimePicker
                      value={issueDate || new Date()}
                      mode="date"
                      display="spinner"
                      onChange={(event, date) => {
                        setShowIssueDatePicker(false);
                        if (date) {
                          setIssueDate(date);
                        }
                      }}
                      maximumDate={new Date()}
                    />
                  )}
                </View>

                {(selectedType === "dl" || selectedType === "rc") && (
                  <View style={styles.dateInputContainer}>
                    <Text style={styles.inputLabel}>Expiry Date</Text>
                    <TouchableOpacity
                      style={styles.datePickerButton}
                      onPress={() => setShowExpiryDatePicker(true)}
                      activeOpacity={0.8}
                    >
                      <Ionicons name="calendar-outline" size={scaleFont(20)} color="#6B7280" />
                      <Text style={styles.datePickerButtonText}>
                        {expiryDate ? expiryDate.toLocaleDateString() : "Select expiry date"}
                      </Text>
                      <Ionicons name="chevron-down" size={scaleFont(20)} color="#6B7280" />
                    </TouchableOpacity>
                    
                    {showExpiryDatePicker && (
                      <DateTimePicker
                        value={expiryDate || new Date()}
                        mode="date"
                        display="spinner"
                        onChange={(event, date) => {
                          setShowExpiryDatePicker(false);
                          if (date) {
                            setExpiryDate(date);
                          }
                        }}
                        minimumDate={new Date()}
                      />
                    )}
                  </View>
                )}
              </>
            )}

            {selectedType !== "aadhar" && (
              <TouchableOpacity
                style={[
                  styles.nextButton,
                  (!issueDate || ((selectedType === "dl" || selectedType === "rc") && !expiryDate)) && styles.nextButtonDisabled,
                ]}
                onPress={handleNext}
                disabled={!issueDate || ((selectedType === "dl" || selectedType === "rc") && !expiryDate)}
                activeOpacity={0.8}
              >
                <Text style={styles.nextButtonText}>Continue</Text>
                <Ionicons name="arrow-forward" size={scaleFont(20)} color={Colors.white} />
              </TouchableOpacity>
            )}
          </View>
        );

      case 6: // Front Image (previously step 5)
        return (
          <View style={styles.wizardStep}>
            <View style={styles.stepHeader}>
              <Ionicons name="camera" size={scaleFont(40)} color={Colors.primary} />
              {/* <Text style={styles.stepTitle}>Upload Front Side Image</Text> */}
              <Text style={styles.stepSubtitle}>
                Take a clear photo of the front side of your document
              </Text>
            </View>

            <View style={styles.imageUploadContainer}>
              {/* <Text style={styles.imageUploadTips}>
                📸 Tips:
                {"\n"}• Ensure good lighting
                {"\n"}• Keep document flat
                {"\n"}• All corners should be visible
                {"\n"}• Text should be readable
              </Text> */}

              {frontImage ? (
                <View style={styles.imagePreviewContainer}>
                  <Image source={{ uri: frontImage }} style={styles.imagePreview} />
                 <View style={styles.imagePreviewActions}>
  <TouchableOpacity
    style={styles.imageActionButton}
    onPress={() => captureImage("front")}
    activeOpacity={0.8}
  >
    <Ionicons name="camera" size={scaleFont(20)} color={Colors.primary} />
    <Text style={styles.imageActionButtonText}>Retake</Text>
  </TouchableOpacity>
  <TouchableOpacity
    style={styles.imageActionButton}
    onPress={() => pickImageFromGallery("front")}
    activeOpacity={0.8}
  >
    <Ionicons name="images" size={scaleFont(20)} color={Colors.primary} />
    <Text style={styles.imageActionButtonText}>Gallery</Text>
  </TouchableOpacity>
  <TouchableOpacity
    style={styles.imageActionButtonDanger}
    onPress={() => setFrontImage(null)}
    activeOpacity={0.8}
  >
    <Ionicons name="trash" size={scaleFont(20)} color="#DC2626" />
    <Text style={styles.imageActionButtonTextDanger}>Remove</Text>
  </TouchableOpacity>
</View>
                </View>
              ) : (
                <TouchableOpacity
                  style={styles.imageUploadCard}
                  onPress={() => captureImage("front")}
                  activeOpacity={0.8}
                >
                  <View style={styles.imageUploadPlaceholder}>
                    <Ionicons name="camera" size={scaleFont(50)} color="#9CA3AF" />
                    <Text style={styles.imageUploadPlaceholderText}>
                      Tap to open camera
                    </Text>
                    <Text style={styles.imageUploadPlaceholderSubtext}>
                      Or choose from gallery
                    </Text>
                  </View>
                  <TouchableOpacity
                    style={styles.galleryButton}
                    onPress={() => pickImageFromGallery("front")}
                    activeOpacity={0.8}
                  >
                    <Ionicons name="images" size={scaleFont(20)} color={Colors.white} />
                    <Text style={styles.galleryButtonText}>Choose from Gallery</Text>
                  </TouchableOpacity>
                </TouchableOpacity>
              )}
            </View>

            <TouchableOpacity
              style={[
                styles.nextButton,
                !frontImage && styles.nextButtonDisabled,
              ]}
              onPress={handleNext}
              disabled={!frontImage}
              activeOpacity={0.8}
            >
              <Text style={styles.nextButtonText}>Continue</Text>
              <Ionicons name="arrow-forward" size={scaleFont(20)} color={Colors.white} />
            </TouchableOpacity>
          </View>
        );

      case 7: // Back Image or Skip (previously step 6)
        return (
          <View style={styles.wizardStep}>
            <View style={styles.stepHeader}>
              <Ionicons name="camera" size={scaleFont(40)} color={Colors.primary} />
              {/* <Text style={styles.stepTitle}>Upload Back Side Image</Text> */}
              <Text style={styles.stepSubtitle}>
                Take a clear photo of the back side of your document
              </Text>
            </View>

            <View style={styles.imageUploadContainer}>
              {/* <Text style={styles.imageUploadTips}>
                📸 Tips:
                {"\n"}• Ensure good lighting
                {"\n"}• Keep document flat
                {"\n"}• All corners should be visible
                {"\n"}• Text should be readable
              </Text> */}

              {backImage ? (
                <View style={styles.imagePreviewContainer}>
                  <Image source={{ uri: backImage }} style={styles.imagePreview} />
                  <View style={[styles.imagePreviewActions, isSmallScreen && styles.imagePreviewActionsColumn]}>
                    <TouchableOpacity
                      style={styles.imageActionButton}
                      onPress={() => captureImage("back")}
                      activeOpacity={0.8}
                    >
                      <Ionicons name="camera" size={scaleFont(20)} color={Colors.primary} />
                      <Text style={styles.imageActionButtonText}>Retake</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={styles.imageActionButton}
                      onPress={() => pickImageFromGallery("back")}
                      activeOpacity={0.8}
                    >
                      <Ionicons name="images" size={scaleFont(20)} color={Colors.primary} />
                      <Text style={styles.imageActionButtonText}>Change</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={styles.imageActionButtonDanger}
                      onPress={() => setBackImage(null)}
                      activeOpacity={0.8}
                    >
                      <Ionicons name="trash" size={scaleFont(20)} color="#DC2626" />
                      <Text style={styles.imageActionButtonTextDanger}>Remove</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              ) : (
                <>
                  <TouchableOpacity
                    style={styles.imageUploadCard}
                    onPress={() => captureImage("back")}
                    activeOpacity={0.8}
                  >
                    <View style={styles.imageUploadPlaceholder}>
                      <Ionicons name="camera" size={scaleFont(50)} color="#9CA3AF" />
                      <Text style={styles.imageUploadPlaceholderText}>
                        Tap to take photo
                      </Text>
                      <Text style={styles.imageUploadPlaceholderSubtext}>
                        Or choose from gallery
                      </Text>
                    </View>
                    <TouchableOpacity
                      style={styles.galleryButton}
                      onPress={() => pickImageFromGallery("back")}
                      activeOpacity={0.8}
                    >
                      <Ionicons name="images" size={scaleFont(20)} color={Colors.white} />
                      <Text style={styles.galleryButtonText}>Choose from Gallery</Text>
                    </TouchableOpacity>
                  </TouchableOpacity>

                  {(() => {
                    const docType = documentTypes.find((d) => d.type === selectedType);
                    if (docType && !docType.has_back_side) {
                      return (
                        <TouchableOpacity
                          style={styles.skipButton}
                          onPress={handleNext}
                          activeOpacity={0.8}
                        >
                          <Text style={styles.skipButtonText}>Skip (Not Required)</Text>
                        </TouchableOpacity>
                      );
                    }
                    return null;
                  })()}
                </>
              )}
            </View>

            <TouchableOpacity
              style={[
                styles.nextButton,
                !backImage && documentTypes.find(d => d.type === selectedType)?.has_back_side && styles.nextButtonDisabled,
              ]}
              onPress={handleNext}
              disabled={!backImage && documentTypes.find(d => d.type === selectedType)?.has_back_side || loading}
              activeOpacity={0.8}
            >
              {loading ? (
                <ActivityIndicator color={Colors.white} size="small" />
              ) : (
                <>
                  <Text style={styles.nextButtonText}>Submit Document</Text>
                  <Ionicons name="checkmark-circle" size={scaleFont(20)} color={Colors.white} />
                </>
              )}
            </TouchableOpacity>
          </View>
        );

      default:
        return null;
    }
  };

    return (
      <Modal
        visible={showUploadWizard}
        animationType="slide"
        transparent={false}
        onRequestClose={() => {
          showAlert(
            "Cancel Upload?",
            "Are you sure you want to cancel? All entered data will be lost.",
            "warning"
          );
        }}
      >
        <SafeAreaView style={styles.wizardContainer}>
          {/* Wizard Header */}
          <View style={styles.wizardHeader}>
            <TouchableOpacity
              style={styles.wizardBackButton}
              onPress={handleBack}
              activeOpacity={0.8}
            >
              <Ionicons
                name="arrow-back"
                size={scaleFont(24)}
                color={Colors.textPrimary}
              />
            </TouchableOpacity>
            
            <View style={styles.wizardTitleContainer}>
              <Text style={styles.wizardTitle}>
                {stepTitles[currentStep]}
              </Text>
              <Text style={styles.wizardStepTitle}>
                Step {currentStep + 1} of {stepTitles.length}
              </Text>
            </View>
            
            <View style={styles.wizardStepDots}>
              {stepTitles.map((_, index) => (
                <View
                  key={index}
                  style={[
                    styles.wizardStepDot,
                    index === currentStep && styles.wizardStepDotCurrent,
                    index < currentStep && styles.wizardStepDotActive,
                  ]}
                />
              ))}
            </View>
          </View>

          {/* Step Content */}
          <View style={styles.wizardContentContainer}>
            {renderStepContent()}
          </View>
        </SafeAreaView>
      </Modal>
    );
  };

  // ========== MAIN CONTENT ==========

  const renderContent = () => {
    if (loading && !refreshing && documents.length === 0) {
      return (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={Colors.primary} />
          <Text style={styles.loadingText}>Loading your documents...</Text>
        </View>
      );
    }

    return (
      <Animated.View style={{ opacity: fadeAnim, transform: [{ translateY: slideAnim }] }}>
        {/* Status Summary */}
        {/* <View style={styles.statusSummaryContainer}>
          <View style={styles.statusCard}>
            <View style={styles.statusHeader}>
              <Ionicons name="shield-checkmark" size={scaleFont(24)} color="#10B981" />
              <Text style={styles.statusTitle}>Verification Status</Text>
            </View>
            
            <View style={[styles.statsGrid, isSmallScreen && styles.statsGridSmall]}>
              <View style={styles.statItem}>
                <View style={[styles.statIcon, { backgroundColor: "#10B98120" }]}>
                  <Ionicons name="checkmark-circle" size={scaleFont(20)} color="#10B981" />
                </View>
                <Text style={styles.statNumber}>{uploadStatus.approvedCount}</Text>
                <Text style={styles.statLabel}>Approved</Text>
              </View>
              
              <View style={styles.statItem}>
                <View style={[styles.statIcon, { backgroundColor: "#F59E0B20" }]}>
                  <Ionicons name="time" size={scaleFont(20)} color="#F59E0B" />
                </View>
                <Text style={styles.statNumber}>{uploadStatus.pendingCount}</Text>
                <Text style={styles.statLabel}>Pending</Text>
              </View>
              
              <View style={styles.statItem}>
                <View style={[styles.statIcon, { backgroundColor: "#EF444420" }]}>
                  <Ionicons name="close-circle" size={scaleFont(20)} color="#EF4444" />
                </View>
                <Text style={styles.statNumber}>{uploadStatus.rejectedCount}</Text>
                <Text style={styles.statLabel}>Rejected</Text>
              </View>
              
              <View style={styles.statItem}>
                <View style={[styles.statIcon, { backgroundColor: Colors.primary + "20" }]}>
                  <Ionicons name="document-text" size={scaleFont(20)} color={Colors.primary} />
                </View>
                <Text style={styles.statNumber}>{documentTypes.length}</Text>
                <Text style={styles.statLabel}>Required</Text>
              </View>
            </View>
            
            {uploadStatus.allUploaded && uploadStatus.approvedCount === documentTypes.length ? (
              <View style={styles.completeBadge}>
                <Ionicons name="checkmark-circle" size={scaleFont(16)} color="#065F46" />
                <Text style={styles.completeBadgeText}>All documents verified! ✅</Text>
              </View>
            ) : uploadStatus.hasPendingOrRejected ? (
              <View style={styles.warningBadge}>
                <Ionicons name="warning" size={scaleFont(16)} color="#92400E" />
                <Text style={styles.warningBadgeText}>Some documents need attention</Text>
              </View>
            ) : (
              <View style={styles.infoBadge}>
                <Ionicons name="information-circle" size={scaleFont(16)} color={Colors.primary} />
                <Text style={styles.infoBadgeText}>
                  Upload {uploadStatus.missingTypes.length} more document(s)
                </Text>
              </View>
            )}
          </View>
        </View> */}

        {/* Action Buttons */}
        <View style={styles.actionButtonsContainer}>
  <View style={styles.benefitsCard}>
    <Text style={styles.benefitsTitle}>Why Verify Documents?</Text>
    <View style={styles.benefitItem}>
      <Ionicons name="checkmark-circle" size={scaleFont(16)} color="#10B981" />
      <Text style={styles.benefitText}>Enhanced account security</Text>
    </View>
    <View style={styles.benefitItem}>
      <Ionicons name="checkmark-circle" size={scaleFont(16)} color="#10B981" />
      <Text style={styles.benefitText}>Faster ride approvals</Text>
    </View>
    <View style={styles.benefitItem}>
      <Ionicons name="checkmark-circle" size={scaleFont(16)} color="#10B981" />
      <Text style={styles.benefitText}>Priority customer support</Text>
    </View>
  </View>
  
  <TouchableOpacity
    style={styles.uploadButton}
    onPress={() => {
      resetWizard();
      setShowUploadWizard(true);
      Haptics.selectionAsync();
    }}
    activeOpacity={0.8}
  >
    <Ionicons name="cloud-upload" size={scaleFont(24)} color={Colors.white} />
    <Text style={styles.uploadButtonText}>Upload New Document</Text>
  </TouchableOpacity>
</View>

        {/* Documents List */}
        <View style={styles.documentsSection}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Your Documents</Text>
            <Text style={styles.sectionSubtitle}>
              {documents.length} document(s) uploaded
            </Text>
          </View>

          {documents.length === 0 ? (
            <View style={styles.emptyState}>
              <Ionicons name="document-text" size={scaleFont(80)} color="#E5E7EB" />
              <Text style={styles.emptyStateTitle}>No Documents Yet</Text>
              <Text style={styles.emptyStateText}>
                Upload your first document to get started with verification
              </Text>
              <TouchableOpacity
                style={styles.emptyStateButton}
                onPress={() => {
                  resetWizard();
                  setShowUploadWizard(true);
                  Haptics.selectionAsync();
                }}
                activeOpacity={0.8}
              >
                <Ionicons name="cloud-upload" size={scaleFont(20)} color={Colors.white} />
                <Text style={styles.emptyStateButtonText}>Upload Your First Document</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <ScrollView 
              style={styles.documentsList}
              showsVerticalScrollIndicator={false}
              contentContainerStyle={styles.documentsListContent}
            >
              {documents.map((doc) => {
                const docType = documentTypes.find(d => d.type === doc.document_type);
                const isRejected = doc.status === "rejected";
                
                return (
                  <TouchableOpacity
                    key={doc.id}
                    style={[
                      styles.documentCard,
                      isRejected && styles.documentCardRejected,
                    ]}
                    onPress={() => {
                      setSelectedDocument(doc);
                      setShowViewModal(true);
                      Haptics.selectionAsync();
                    }}
                    activeOpacity={0.8}
                  >
                    <View style={styles.documentCardHeader}>
                      <View style={styles.documentIconContainer}>
                        <FontAwesome5
                          name={
                            doc.document_type === "aadhar" ? "id-card" :
                            doc.document_type === "dl" ? "id-card" :
                            doc.document_type === "rc" ? "file-alt" : "id-card"
                          }
                          size={scaleFont(20)}
                          color={Colors.primary}
                        />
                      </View>
                      <View style={styles.documentInfo}>
                        <Text style={styles.documentName}>
                          {docType?.name || doc.document_type}
                        </Text>
                        <Text style={styles.documentNumber}>
                          {doc.document_number}
                        </Text>
                      </View>
                      <View style={[
                        styles.statusBadge,
                        doc.status === "approved" && styles.statusBadgeApproved,
                        doc.status === "pending" && styles.statusBadgePending,
                        doc.status === "rejected" && styles.statusBadgeRejected,
                      ]}>
                        <Ionicons
                          name={
                            doc.status === "approved" ? "checkmark-circle" :
                            doc.status === "pending" ? "time" :
                            "close-circle"
                          }
                          size={scaleFont(12)}
                          color={Colors.white}
                        />
                        <Text style={styles.statusBadgeText}>
                          {doc.status?.charAt(0).toUpperCase() + doc.status?.slice(1)}
                        </Text>
                      </View>
                    </View>

                    <View style={[styles.documentCardFooter, isSmallScreen && styles.documentCardFooterColumn]}>
                      <Text style={styles.documentDate}>
Uploaded: {doc.submitted_at
  ? new Date(doc.submitted_at).toLocaleString("en-IN")
  : "N/A"}
                      </Text>
                      
                      {isRejected && (
                        <TouchableOpacity
                          style={styles.reuploadButton}
                          onPress={() => handleReuploadDocument(doc)}
                          activeOpacity={0.8}
                        >
                          <Ionicons name="refresh" size={scaleFont(14)} color={Colors.primary} />
                          <Text style={styles.reuploadButtonText}>Reupload</Text>
                        </TouchableOpacity>
                      )}
                    </View>

                    {isRejected && doc.rejection_reason && (
                      <View style={styles.rejectionReason}>
                        <Ionicons name="warning" size={scaleFont(14)} color="#DC2626" />
                        <Text style={styles.rejectionReasonText}>
                          {doc.rejection_reason}
                        </Text>
                      </View>
                    )}
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
          )}
        </View>
      </Animated.View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar backgroundColor={Colors.background} barStyle="dark-content" />
      <KeyboardAvoidingView
      style={styles.keyboardAvoidingView}
      behavior={Platform.OS === 'ios' ? 'padding' : 'padding'}
    >
      {renderHeader()}
      
      <ScrollView
        ref={scrollViewRef}
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[Colors.primary]}
            tintColor={Colors.primary}
          />
        }
        showsVerticalScrollIndicator={false}
      >
        {renderContent()}
      </ScrollView>

      {/* Modals */}
      {renderAlertModal()}
      {renderSuccessModal()}
      {renderViewModal()}
      {renderDeleteModal()}
      {renderUploadWizard()}
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
 container: {
    flex: 1,
    backgroundColor: Colors.white, // Changed from Colors.background
  },
  
    keyboardAvoidingView: {
       flex: 1,
     },
     header: {
       flexDirection: 'row',
       alignItems: 'center',
       paddingHorizontal: 16,
       paddingVertical: 12,
       borderBottomWidth: 0.5,
       borderBottomColor: '#F3F4F6',
     },
     modernBackButton: {
       width: 44,
       height: 44,
       borderRadius: 22,
       justifyContent: 'center',
       alignItems: 'center',
     },
     headerTitle: {
       ...Typography.h2,
       fontSize: 28,
       fontWeight: '700',
       color: Colors.primary,
       flex: 1,
       textAlign: 'center',
     },
     headerSpacer: {
       width: 44,
     },
  
  
  modernRefreshButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.primary + "10", // Added background
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: scaleHeight(30),
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    minHeight: height * 0.6,
  },
  loadingText: {
    marginTop: scaleHeight(15),
    fontSize: scaleFont(16),
    color: Colors.textSecondary,
  },
  statusSummaryContainer: {
    padding: scaleWidth(20),
  },
  statusCard: {
    backgroundColor: Colors.white,
    borderRadius: scaleWidth(20),
    padding: scaleWidth(20),
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 5,
  },
  statusHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: scaleHeight(20),
  },
  statusTitle: {
    fontSize: scaleFont(18),
    fontWeight: "600",
    color: Colors.textPrimary,
    marginLeft: scaleWidth(10),
  },
  statsGrid: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: scaleHeight(20),
  },
  statsGridSmall: {
    flexWrap: 'wrap',
  },
  statItem: {
    alignItems: "center",
    flex: isSmallScreen ? '48%' : 1,
    marginBottom: isSmallScreen ? scaleHeight(15) : 0,
  },
  statIcon: {
    width: scaleWidth(40),
    height: scaleWidth(40),
    borderRadius: scaleWidth(12),
    justifyContent: "center",
    alignItems: "center",
    marginBottom: scaleHeight(8),
  },
  statNumber: {
    fontSize: scaleFont(24),
    fontWeight: "700",
    color: Colors.textPrimary,
  },
  statLabel: {
    fontSize: scaleFont(12),
    color: Colors.textSecondary,
    marginTop: scaleHeight(4),
  },
  completeBadge: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#D1FAE5",
    paddingHorizontal: scaleWidth(16),
    paddingVertical: scaleHeight(10),
    borderRadius: scaleWidth(12),
    alignSelf: "center",
  },
  completeBadgeText: {
    color: "#065F46",
    fontSize: scaleFont(14),
    fontWeight: "600",
    marginLeft: scaleWidth(8),
  },
  warningBadge: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#FEF3C7",
    paddingHorizontal: scaleWidth(16),
    paddingVertical: scaleHeight(10),
    borderRadius: scaleWidth(12),
    alignSelf: "center",
  },
  warningBadgeText: {
    color: "#92400E",
    fontSize: scaleFont(14),
    fontWeight: "600",
    marginLeft: scaleWidth(8),
  },
  infoBadge: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: Colors.primary + "15",
    paddingHorizontal: scaleWidth(16),
    paddingVertical: scaleHeight(10),
    borderRadius: scaleWidth(12),
    alignSelf: "center",
  },
  infoBadgeText: {
    color: Colors.primary,
    fontSize: scaleFont(14),
    fontWeight: "600",
    marginLeft: scaleWidth(8),
  },
  actionButtonsContainer: {
    paddingHorizontal: scaleWidth(20),
    marginBottom: scaleHeight(20),
  },
  uploadButton: {
    backgroundColor: Colors.primary,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: scaleHeight(16),
    borderRadius: scaleWidth(16),
    shadowColor: Colors.primary,
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  uploadButtonText: {
    color: Colors.white,
    fontSize: scaleFont(16),
    fontWeight: "600",
    marginLeft: scaleWidth(10),
  },
  documentsSection: {
    paddingHorizontal: scaleWidth(20),
  },
  sectionHeader: {
    marginBottom: scaleHeight(16),
  },
  sectionTitle: {
    fontSize: scaleFont(20),
    fontWeight: "700",
    color: Colors.textPrimary,
  },
  sectionSubtitle: {
    fontSize: scaleFont(14),
    color: Colors.textSecondary,
    marginTop: scaleHeight(4),
  },
  emptyState: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: scaleHeight(40),
    backgroundColor: Colors.white,
    borderRadius: scaleWidth(20),
    marginTop: scaleHeight(10),
  },
  emptyStateTitle: {
    fontSize: scaleFont(18),
    fontWeight: "600",
    color: Colors.textPrimary,
    marginTop: scaleHeight(20),
  },
  emptyStateText: {
    fontSize: scaleFont(14),
    color: Colors.textSecondary,
    textAlign: "center",
    marginTop: scaleHeight(8),
    marginHorizontal: scaleWidth(40),
  },
  emptyStateButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.primary,
    paddingHorizontal: scaleWidth(24),
    paddingVertical: scaleHeight(12),
    borderRadius: scaleWidth(12),
    marginTop: scaleHeight(24),
  },
  emptyStateButtonText: {
    color: Colors.white,
    fontSize: scaleFont(14),
    fontWeight: "600",
    marginLeft: scaleWidth(8),
  },
  documentsList: {
    maxHeight: height * 0.5,
  },
  documentsListContent: {
    paddingBottom: scaleHeight(20),
  },
  documentCard: {
    backgroundColor: Colors.white,
    borderRadius: scaleWidth(16),
    padding: scaleWidth(16),
    marginBottom: scaleHeight(12),
    borderWidth: 1,
    borderColor: "#F3F4F6",
  },
  documentCardRejected: {
    borderColor: "#FEE2E2",
    backgroundColor: "#FEF2F2",
  },
  documentCardHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: scaleHeight(12),
  },
  documentIconContainer: {
    width: scaleWidth(40),
    height: scaleWidth(40),
    borderRadius: scaleWidth(12),
    backgroundColor: Colors.primary + "10",
    justifyContent: "center",
    alignItems: "center",
    marginRight: scaleWidth(12),
  },
  documentInfo: {
    flex: 1,
  },
  documentName: {
    fontSize: scaleFont(16),
    fontWeight: "600",
    color: Colors.textPrimary,
  },
  documentNumber: {
    fontSize: scaleFont(14),
    color: Colors.textSecondary,
    marginTop: scaleHeight(2),
  },
  statusBadge: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: scaleWidth(10),
    paddingVertical: scaleHeight(6),
    borderRadius: scaleWidth(20),
    backgroundColor: "#6B7280",
  },
  statusBadgeApproved: {
    backgroundColor: "#10B981",
  },
  statusBadgePending: {
    backgroundColor: "#F59E0B",
  },
  statusBadgeRejected: {
    backgroundColor: "#EF4444",
  },
  statusBadgeText: {
    color: Colors.white,
    fontSize: scaleFont(12),
    fontWeight: "600",
    marginLeft: scaleWidth(4),
  },
  documentCardFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  documentCardFooterColumn: {
    flexDirection: 'column',
    alignItems: 'flex-start',
    gap: scaleHeight(8),
  },
  documentDate: {
    fontSize: scaleFont(12),
    color: Colors.textSecondary,
  },
  reuploadButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.primary + "10",
    paddingHorizontal: scaleWidth(12),
    paddingVertical: scaleHeight(6),
    borderRadius: scaleWidth(8),
  },
  reuploadButtonText: {
    color: Colors.primary,
    fontSize: scaleFont(12),
    fontWeight: "600",
    marginLeft: scaleWidth(4),
  },
  rejectionReason: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginTop: scaleHeight(12),
    padding: scaleWidth(12),
    backgroundColor: "#FEE2E2",
    borderRadius: scaleWidth(8),
  },
  rejectionReasonText: {
    flex: 1,
    fontSize: scaleFont(12),
    color: "#DC2626",
    marginLeft: scaleWidth(8),
  },
  modalOverlayCenter: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
    padding: scaleWidth(20),
  },
  alertModal: {
    backgroundColor: Colors.white,
    borderRadius: scaleWidth(24),
    padding: scaleWidth(24),
    width: "90%",
    maxWidth: 400,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 8,
    },
    shadowOpacity: 0.25,
    shadowRadius: 24,
    elevation: 10,
  },
  alertIconContainer: {
    width: scaleWidth(80),
    height: scaleWidth(80),
    borderRadius: scaleWidth(40),
    justifyContent: "center",
    alignItems: "center",
    marginBottom: scaleHeight(20),
  },
  alertTitle: {
    fontSize: scaleFont(22),
    fontWeight: "700",
    color: Colors.textPrimary,
    marginBottom: scaleHeight(12),
    textAlign: "center",
  },
  alertMessage: {
    fontSize: scaleFont(16),
    color: Colors.textSecondary,
    textAlign: "center",
    marginBottom: scaleHeight(24),
    lineHeight: scaleHeight(22),
  },
  alertButton: {
    paddingHorizontal: scaleWidth(32),
    paddingVertical: scaleHeight(14),
    borderRadius: scaleWidth(16),
    minWidth: scaleWidth(120),
    alignItems: "center",
  },
  alertButtonText: {
    color: Colors.white,
    fontSize: scaleFont(16),
    fontWeight: "600",
  },
  successModalContainer: {
    backgroundColor: Colors.white,
    borderRadius: scaleWidth(28),
    padding: scaleWidth(30),
    width: "90%",
    maxWidth: 400,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 12,
    },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 15,
  },
  successIconCircle: {
    width: scaleWidth(80),
    height: scaleWidth(80),
    borderRadius: scaleWidth(40),
    backgroundColor: "#10B981",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: scaleHeight(20),
  },
  successModalTitle: {
    fontSize: scaleFont(26),
    fontWeight: "700",
    color: Colors.textPrimary,
    marginBottom: scaleHeight(12),
    textAlign: "center",
  },
  successModalMessage: {
    fontSize: scaleFont(16),
    color: Colors.textSecondary,
    textAlign: "center",
    marginBottom: scaleHeight(24),
    lineHeight: scaleHeight(24),
  },
  successDetails: {
    backgroundColor: "#F9FAFB",
    borderRadius: scaleWidth(16),
    padding: scaleWidth(16),
    width: "100%",
    marginBottom: scaleHeight(24),
  },
  successDetailItem: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: scaleHeight(12),
  },
  successDetailText: {
    fontSize: scaleFont(14),
    color: Colors.textSecondary,
    marginLeft: scaleWidth(12),
    flex: 1,
  },
  successModalButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#10B981",
    paddingHorizontal: scaleWidth(32),
    paddingVertical: scaleHeight(16),
    borderRadius: scaleWidth(16),
    width: "100%",
    justifyContent: "center",
  },
  successModalButtonText: {
    color: Colors.white,
    fontSize: scaleFont(16),
    fontWeight: "600",
    marginLeft: scaleWidth(10),
  },
  // View Modal Styles
  viewModalContainer: {
    backgroundColor: Colors.white,
    borderRadius: scaleWidth(24),
    width: "90%",
    maxWidth: 400,
    maxHeight: "80%",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 8,
    },
    shadowOpacity: 0.25,
    shadowRadius: 24,
    elevation: 10,
  },
  viewModalHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: scaleWidth(24),
    paddingVertical: scaleHeight(20),
    borderBottomWidth: 1,
    borderBottomColor: "#F3F4F6",
  },
  viewModalTitle: {
    fontSize: scaleFont(20),
    fontWeight: "700",
    color: Colors.textPrimary,
  },
  closeButton: {
    padding: scaleWidth(8),
  },
  viewModalContent: {
    padding: scaleWidth(24),
  },
  // viewInfoRow: {
  //   flexDirection: "row",
  //   justifyContent: "space-between",
  //   marginBottom: scaleHeight(20),
  // },
  // viewInfoRowSmall: {
  //   flexDirection: 'column',
  //   gap: scaleHeight(16),
  // },
  viewInfoItem: {
    marginBottom: scaleHeight(16),
  },
  viewInfoLabel: {
    fontSize: scaleFont(14),
    color: Colors.textSecondary,
    marginBottom: scaleHeight(4),
  },
  viewInfoValue: {
    fontSize: scaleFont(16),
    fontWeight: "600",
    color: Colors.textPrimary,
  },
  viewStatusBadge: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: scaleWidth(12),
    paddingVertical: scaleHeight(6),
    borderRadius: scaleWidth(20),
    alignSelf: "flex-start",
    backgroundColor: "#6B7280",
  },
  viewStatusBadgeApproved: {
    backgroundColor: "#10B981",
  },
  viewStatusBadgePending: {
    backgroundColor: "#F59E0B",
  },
  viewStatusBadgeRejected: {
    backgroundColor: "#EF4444",
  },
  viewStatusBadgeText: {
    color: Colors.white,
    fontSize: scaleFont(12),
    fontWeight: "600",
    marginLeft: scaleWidth(4),
  },
  rejectionReasonContainer: {
    flexDirection: "row",
    backgroundColor: "#FEF2F2",
    borderRadius: scaleWidth(12),
    padding: scaleWidth(16),
    marginTop: scaleHeight(8),
    marginBottom: scaleHeight(20),
  },
  rejectionReasonContent: {
    flex: 1,
    marginLeft: scaleWidth(12),
  },
  rejectionReasonTitle: {
    fontSize: scaleFont(14),
    fontWeight: "600",
    color: "#DC2626",
    marginBottom: scaleHeight(4),
  },
  rejectionReasonText: {
    fontSize: scaleFont(14),
    color: "#DC2626",
    lineHeight: scaleHeight(20),
  },
  imagesTitle: {
    fontSize: scaleFont(18),
    fontWeight: "600",
    color: Colors.textPrimary,
    marginTop: scaleHeight(8),
    marginBottom: scaleHeight(16),
  },
  imageLabel: {
    fontSize: scaleFont(14),
    color: Colors.textSecondary,
    marginBottom: scaleHeight(8),
  },
  // documentImage: {
  //   width: "100%",
  //   height: scaleHeight(200),
  //   borderRadius: scaleWidth(12),
  //   backgroundColor: "#F9FAFB",
  // },
  // documentImageSmall: {
  //   height: scaleHeight(150),
  // },
  viewModalActions: {
    paddingHorizontal: scaleWidth(24),
    paddingVertical: scaleHeight(20),
    borderTopWidth: 1,
    borderTopColor: "#F3F4F6",
    flexDirection: "row",
    justifyContent: "space-between",
  },
  viewModalActionsSmall: {
    flexDirection: 'column',
    gap: scaleHeight(12),
  },
  reuploadActionButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.primary,
    paddingHorizontal: scaleWidth(20),
    paddingVertical: scaleHeight(12),
    borderRadius: scaleWidth(12),
    flex: 1,
    marginRight: scaleWidth(12),
    justifyContent: "center",
  },
  reuploadActionButtonText: {
    color: Colors.white,
    fontSize: scaleFont(14),
    fontWeight: "600",
    marginLeft: scaleWidth(8),
  },
  deleteActionButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FEE2E2",
    paddingHorizontal: scaleWidth(20),
    paddingVertical: scaleHeight(12),
    borderRadius: scaleWidth(12),
    flex: 1,
    justifyContent: "center",
  },
  deleteActionButtonText: {
    color: "#DC2626",
    fontSize: scaleFont(14),
    fontWeight: "600",
    marginLeft: scaleWidth(8),
  },
  // Delete Modal Styles
  deleteModal: {
    backgroundColor: Colors.white,
    borderRadius: scaleWidth(24),
    padding: scaleWidth(24),
    width: "90%",
    maxWidth: 400,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 8,
    },
    shadowOpacity: 0.25,
    shadowRadius: 24,
    elevation: 10,
  },
  deleteIconContainer: {
    width: scaleWidth(80),
    height: scaleWidth(80),
    borderRadius: scaleWidth(40),
    justifyContent: "center",
    alignItems: "center",
    marginBottom: scaleHeight(20),
  },
  deleteTitle: {
    fontSize: scaleFont(22),
    fontWeight: "700",
    color: Colors.textPrimary,
    marginBottom: scaleHeight(12),
    textAlign: "center",
  },
  deleteMessage: {
    fontSize: scaleFont(16),
    color: Colors.textSecondary,
    textAlign: "center",
    marginBottom: scaleHeight(24),
    lineHeight: scaleHeight(22),
  },
  deleteActions: {
    flexDirection: "row",
    width: "100%",
    justifyContent: "space-between",
  },
  deleteActionsColumn: {
    flexDirection: 'column',
    gap: scaleHeight(12),
  },
  cancelDeleteButton: {
    flex: 1,
    paddingHorizontal: scaleWidth(20),
    paddingVertical: scaleHeight(14),
    borderRadius: scaleWidth(12),
    backgroundColor: "#F3F4F6",
    marginRight: scaleWidth(12),
    alignItems: "center",
  },
  cancelDeleteButtonText: {
    color: Colors.textPrimary,
    fontSize: scaleFont(16),
    fontWeight: "600",
  },
  confirmDeleteButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: scaleWidth(20),
    paddingVertical: scaleHeight(14),
    borderRadius: scaleWidth(12),
    backgroundColor: "#DC2626",
    marginLeft: scaleWidth(12),
  },
  confirmDeleteButtonText: {
    color: Colors.white,
    fontSize: scaleFont(16),
    fontWeight: "600",
    marginLeft: scaleWidth(8),
  },
  // Wizard Styles
  wizardContainer: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  wizardHeader: {
    backgroundColor: Colors.white,
    paddingHorizontal: scaleWidth(20),
    paddingVertical: scaleHeight(16),
    borderBottomWidth: 1,
    borderBottomColor: "#F3F4F6",
  },
  wizardBackButton: {
    padding: scaleWidth(8),
  },
  wizardTitleContainer: {
    alignItems: "center",
    marginVertical: scaleHeight(12),
  },
  wizardTitle: {
    fontSize: scaleFont(20),
    fontWeight: "700",
    color: Colors.textPrimary,
    textAlign: 'center',
  },
  wizardStepTitle: {
    fontSize: scaleFont(14),
    color: Colors.textSecondary,
    marginTop: scaleHeight(4),
  },
  wizardStepDots: {
    flexDirection: "row",
    justifyContent: "center",
    marginTop: scaleHeight(12),
  },
  wizardStepDot: {
    width: scaleWidth(8),
    height: scaleWidth(8),
    borderRadius: scaleWidth(4),
    backgroundColor: "#E5E7EB",
    marginHorizontal: scaleWidth(4),
  },
  wizardStepDotActive: {
    backgroundColor: Colors.primary + "80",
  },
  wizardStepDotCurrent: {
    backgroundColor: Colors.primary,
    width: scaleWidth(24),
  },
  wizardContentContainer: {
    flex: 1,
  },
  wizardStep: {
    flex: 1,
    padding: scaleWidth(24),
    justifyContent: "space-between",
  },
  stepHeader: {
    alignItems: "center",
    marginBottom: scaleHeight(32),
  },
  stepTitle: {
    fontSize: scaleFont(24),
    fontWeight: "700",
    color: Colors.textPrimary,
    marginTop: scaleHeight(20),
    textAlign: "center",
  },
  stepSubtitle: {
    fontSize: scaleFont(16),
    color: Colors.textSecondary,
    textAlign: "center",
    marginTop: scaleHeight(8),
    lineHeight: scaleHeight(22),
  },
  typeOptionsContainer: {
    flex: 1,
  },
  typeOptionsContent: {
    paddingBottom: scaleHeight(20),
  },
  typeOptionCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.white,
    padding: scaleWidth(16),
    borderRadius: scaleWidth(16),
    marginBottom: scaleHeight(12),
    borderWidth: 1.5,
    borderColor: "#E5E7EB",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  typeOptionCardSelected: {
    borderColor: Colors.primary,
    backgroundColor: Colors.primary + "08",
    shadowColor: Colors.primary,
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 4,
  },
  typeOptionCardDisabled: {
    opacity: 0.7,
    backgroundColor: "#F9FAFB",
    borderColor: "#E5E7EB",
  },
  typeOptionIconContainer: {
    width: scaleWidth(56),
    height: scaleWidth(56),
    borderRadius: scaleWidth(12),
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#F3F4F6",
    marginRight: scaleWidth(16),
  },
  typeOptionContent: {
    flex: 1,
  },
  typeOptionName: {
    fontSize: scaleFont(16),
    fontWeight: "600",
    color: Colors.textPrimary,
    marginBottom: scaleHeight(4),
  },
  typeOptionNameSelected: {
    color: Colors.primary,
  },
  typeOptionNameDisabled: {
    color: "#9CA3AF",
  },
  typeOptionDescription: {
    fontSize: scaleFont(14),
    color: Colors.textSecondary,
  },
  typeOptionDescriptionDisabled: {
    color: "#9CA3AF",
  },
  typeOptionRightSection: {
    alignItems: "center",
    justifyContent: "center",
    minWidth: scaleWidth(40),
  },
  typeOptionStatus: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: scaleWidth(10),
    paddingVertical: scaleHeight(4),
    borderRadius: scaleWidth(12),
    backgroundColor: "#6B7280",
  },
  typeOptionStatusApproved: {
    backgroundColor: "#10B981",
  },
  typeOptionStatusPending: {
    backgroundColor: "#F59E0B",
  },
  typeOptionStatusRejected: {
    backgroundColor: "#EF4444",
  },
  typeOptionStatusText: {
    color: Colors.white,
    fontSize: scaleFont(11),
    fontWeight: "600",
    marginLeft: scaleWidth(4),
  },
  typeOptionSelectedIndicator: {
    width: scaleWidth(24),
    height: scaleWidth(24),
    borderRadius: scaleWidth(12),
    backgroundColor: Colors.primary + "20",
    justifyContent: "center",
    alignItems: "center",
  },
  typeOptionArrow: {
    width: scaleWidth(24),
    height: scaleWidth(24),
    justifyContent: "center",
    alignItems: "center",
  },
  inputContainer: {
    marginBottom: scaleHeight(32),
  },
  inputLabel: {
    fontSize: scaleFont(16),
    fontWeight: "600",
    color: Colors.textPrimary,
    marginBottom: scaleHeight(8),
  },
  textInput: {
    backgroundColor: Colors.white,
    borderWidth: 2,
    borderColor: "#E5E7EB",
    borderRadius: scaleWidth(12),
    padding: scaleWidth(16),
    fontSize: scaleFont(16),
    color: Colors.textPrimary,
  },
  inputHelper: {
    fontSize: scaleFont(12),
    color: Colors.textSecondary,
    marginTop: scaleHeight(8),
    fontStyle: "italic",
  },
  dateInputContainer: {
    marginBottom: scaleHeight(20),
  },
  datePickerButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.white,
    borderWidth: 2,
    borderColor: "#E5E7EB",
    borderRadius: scaleWidth(12),
    padding: scaleWidth(16),
  },
  datePickerButtonText: {
    fontSize: scaleFont(16),
    color: Colors.textPrimary,
    marginLeft: scaleWidth(12),
    flex: 1,
  },
  infoCard: {
    backgroundColor: "#F9FAFB",
    borderRadius: scaleWidth(16),
    padding: scaleWidth(24),
    alignItems: "center",
    marginBottom: scaleHeight(32),
  },
  infoCardTitle: {
    fontSize: scaleFont(18),
    fontWeight: "600",
    color: Colors.textPrimary,
    marginTop: scaleHeight(16),
    marginBottom: scaleHeight(8),
  },
  infoCardText: {
    fontSize: scaleFont(14),
    color: Colors.textSecondary,
    textAlign: "center",
    lineHeight: scaleHeight(20),
  },
  skipDatesButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.primary + "10",
    paddingHorizontal: scaleWidth(20),
    paddingVertical: scaleHeight(12),
    borderRadius: scaleWidth(12),
    marginTop: scaleHeight(16),
  },
  skipDatesButtonText: {
    color: Colors.primary,
    fontSize: scaleFont(14),
    fontWeight: "600",
    marginRight: scaleWidth(8),
  },
  imageUploadContainer: {
    flex: 1,
    marginBottom: scaleHeight(32),
  },
  imageUploadTips: {
    fontSize: scaleFont(14),
    color: Colors.textSecondary,
    backgroundColor: "#F9FAFB",
    padding: scaleWidth(16),
    borderRadius: scaleWidth(12),
    marginBottom: scaleHeight(24),
    lineHeight: scaleHeight(20),
  },
  imageUploadCard: {
    backgroundColor: Colors.white,
    borderRadius: scaleWidth(16),
    padding: scaleWidth(24),
    alignItems: "center",
    borderWidth: 2,
    borderColor: "#E5E7EB",
    borderStyle: "dashed",
  },
  imageUploadPlaceholder: {
    alignItems: "center",
    marginBottom: scaleHeight(24),
  },
  imageUploadPlaceholderText: {
    fontSize: scaleFont(18),
    fontWeight: "600",
    color: Colors.textPrimary,
    marginTop: scaleHeight(16),
  },
  imageUploadPlaceholderSubtext: {
    fontSize: scaleFont(14),
    color: Colors.textSecondary,
    marginTop: scaleHeight(4),
  },
  cameraOnlyNote: {
    fontSize: scaleFont(12),
    color: "#DC2626",
    textAlign: "center",
    marginTop: scaleHeight(12),
    fontStyle: "italic",
  },
  galleryButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.primary,
    paddingHorizontal: scaleWidth(20),
    paddingVertical: scaleHeight(12),
    borderRadius: scaleWidth(12),
  },
  galleryButtonText: {
    color: Colors.white,
    fontSize: scaleFont(14),
    fontWeight: "600",
    marginLeft: scaleWidth(8),
  },
  imagePreviewContainer: {
    alignItems: "center",
  },
  imagePreview: {
    width: width * 0.7,
    height: width * 0.7 * 0.75,
    borderRadius: scaleWidth(16),
    marginBottom: scaleHeight(16),
  },
 // Alternative: Keep buttons in single line with smaller widths on small screens
imagePreviewActions: {
  flexDirection: "row",
  justifyContent: "center", // Center buttons horizontally
  alignItems: "center", // Center buttons vertically
  flexWrap: 'nowrap',
  width: '100%', // Take full width
  gap: isSmallScreen ? scaleWidth(4) : scaleWidth(8),
},
imageActionButton: {
  flexDirection: "row",
  alignItems: "center",
  justifyContent: 'center', // Center content inside button
  backgroundColor: Colors.primary + "10",
  paddingHorizontal: isSmallScreen ? scaleWidth(10) : scaleWidth(12),
  paddingVertical: scaleHeight(10),
  borderRadius: scaleWidth(12),
  flex: 1, // Equal width for all buttons
  minWidth: 0, // Allow flex to work properly
},
imageActionButtonText: {
  color: Colors.primary,
  fontSize: isSmallScreen ? scaleFont(12) : scaleFont(14),
  fontWeight: "400",
  marginLeft: scaleWidth(6),
},
imageActionButtonDanger: {
  flexDirection: "row",
  alignItems: "center",
  justifyContent: 'center', // Center content inside button
  backgroundColor: "#FEE2E2",
  paddingHorizontal: isSmallScreen ? scaleWidth(10) : scaleWidth(12),
  paddingVertical: scaleHeight(10),
  borderRadius: scaleWidth(12),
  flex: 1, // Equal width for all buttons
  minWidth: 0, // Allow flex to work properly
},
imageActionButtonTextDanger: {
  color: "#DC2626",
  fontSize: isSmallScreen ? scaleFont(12) : scaleFont(14),
  fontWeight: "600",
  marginLeft: scaleWidth(6),
},

  imagePreviewActionsColumn: {
    flexDirection: 'column',
    gap: scaleHeight(8),
  },
  
 
  skipButton: {
    alignSelf: "center",
    padding: scaleWidth(16),
  },
  skipButtonText: {
    color: Colors.textSecondary,
    fontSize: scaleFont(14),
    fontWeight: "600",
  },
  nextButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: Colors.primary,
    paddingVertical: scaleHeight(18),
    borderRadius: scaleWidth(16),
    marginTop: "auto",
  },
  nextButtonDisabled: {
    backgroundColor: "#E5E7EB",
  },
  nextButtonText: {
    color: Colors.white,
    fontSize: scaleFont(16),
    fontWeight: "600",
    marginRight: scaleWidth(8),
  },
  validationErrorContainer: {
    flexDirection: "row",
    alignItems: "flex-start",
    backgroundColor: "#FEE2E2",
    padding: scaleWidth(16),
    borderRadius: scaleWidth(12),
    marginBottom: scaleHeight(16),
  },
  validationErrorText: {
    flex: 1,
    fontSize: scaleFont(14),
    color: "#DC2626",
    marginLeft: scaleWidth(8),
    lineHeight: scaleHeight(18),
  },
  viewInfoRow: {
  flexDirection: "row",
  justifyContent: "space-between",
  alignItems: "flex-start",
  marginBottom: 16,
  gap: 12,
},

viewInfoRowSmall: {
  flexDirection: "column",
},

documentImage: {
  width: "100%",
  height: 220,
  borderRadius: 12,
  backgroundColor: "#F9FAFB",
},

documentImageSmall: {
  height: 160,
},
// Option 4 styles
  benefitsCard: {
    backgroundColor: '#F0F9FF',
    borderRadius: scaleWidth(12),
    padding: scaleWidth(16),
    marginBottom: scaleHeight(16),
    borderWidth: 1,
    borderColor: '#E0F2FE',
  },
  benefitsTitle: {
    fontSize: scaleFont(15),
    fontWeight: '600',
    color: Colors.primary,
    marginBottom: scaleHeight(12),
  },
  benefitItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: scaleHeight(8),
  },
  benefitText: {
    fontSize: scaleFont(13),
    color: Colors.textPrimary,
    marginLeft: scaleWidth(8),
  },
  
  // Update actionButtonsContainer to add proper spacing
  actionButtonsContainer: {
    paddingHorizontal: scaleWidth(20),
    marginBottom: scaleHeight(20),
    marginTop: scaleHeight(16), // Add top margin if needed
  },
  
});