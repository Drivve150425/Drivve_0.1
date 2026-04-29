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
import { Colors, Typography } from "../constants/Colors";
import DatabaseService from "../services/documents_ds";
import DateTimePicker from "@react-native-community/datetimepicker";
import * as Haptics from "expo-haptics";
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from "../context/AuthContext";
import LottieView from "lottie-react-native";

const { width, height } = Dimensions.get("window");
const isSmallScreen = width < 375;

// Responsive scaling functions
const scaleWidth = (size) => {
  const scaleFactor = width / 375;
  return size * Math.min(scaleFactor, 1.5);
};

const scaleHeight = (size) => {
  const scaleFactor = height / 667;
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
  const [initialLoading, setInitialLoading] = useState(true);
  
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
  const [showDatePickerModal, setShowDatePickerModal] = useState(false);
  const [datePickerMode, setDatePickerMode] = useState('issue'); // 'issue' or 'expiry'
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

  // Get max step based on document type
  const getMaxStep = () => {
    if (selectedType === "aadhar") {
      return 5; // Steps: 0-Type, 1-Selfie, 2-Number, 3-Name, 4-Front, 5-Back
    } else {
      return 7; // Steps: 0-Type, 1-Selfie, 2-Number, 3-Name, 4-Vehicle, 5-Dates, 6-Front, 7-Back
    }
  };

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
      setInitialLoading(false);
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
    setCurrentStep(1);
    Haptics.selectionAsync();
  };

  const slideToNext = () => {
    const maxStep = getMaxStep();
    
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
    if (currentStep <= 0) return;

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
    const isAadhar = selectedType === "aadhar";

    switch (currentStep) {
      case 0:
        if (!selectedType) {
          errors.push("Please select a document type.");
        }
        break;
      case 1:
        if (!selfieImage) {
          errors.push("Please upload selfie with document.");
        }
        break;
      case 2:
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
      case 3:
        if (!documentName.trim()) {
          errors.push("Please enter name as on document.");
        } else if (documentName.trim().length < 3) {
          errors.push("Name should be at least 3 characters long.");
        }
        break;
      case 4:
        if (isAadhar) {
          if (!frontImage) {
            errors.push("Please upload front side image.");
          }
        } else {
          if (selectedType === "rc" && !vehicleNumber.trim()) {
            errors.push("Please enter vehicle number for RC.");
          } else if (selectedType === "rc" && vehicleNumber.trim()) {
            const vehicleRegex = /^[A-Z]{2}[0-9]{1,2}[A-Z]{1,2}[0-9]{4}$/i;
            if (!vehicleRegex.test(vehicleNumber.trim())) {
              errors.push("Vehicle number format: XX99XX9999 (e.g., MH01AB1234)");
            }
          }
        }
        break;
      case 5:
        if (isAadhar) {
          const docType = documentTypes.find((d) => d.type === selectedType);
          if (docType && docType.has_back_side && !backImage) {
            errors.push("Please upload back side image.");
          }
        } else {
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
      case 6:
        if (!isAadhar && !frontImage) {
          errors.push("Please upload front side image.");
        }
        break;
      case 7:
        if (!isAadhar) {
          const docType = documentTypes.find((d) => d.type === selectedType);
          if (docType && docType.has_back_side && !backImage) {
            errors.push("Please upload back side image.");
          }
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
      if (currentStep === getMaxStep()) {
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

  // Date Picker Modal Component
  const renderDatePickerModal = () => {
    const currentDate = datePickerMode === 'issue' ? issueDate || new Date() : expiryDate || new Date();
    const maxDate = datePickerMode === 'issue' ? new Date() : undefined;
    const minDate = datePickerMode === 'expiry' ? new Date() : undefined;

    return (
      <Modal
        visible={showDatePickerModal}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowDatePickerModal(false)}
      >
        <View style={styles.datePickerModalOverlay}>
           
            
            <DateTimePicker
              value={currentDate}
              mode="date"
              display={Platform.OS === 'ios' ? 'spinner' : 'default'}
              onChange={(event, date) => {
                if (date) {
                  if (datePickerMode === 'issue') {
                    setIssueDate(date);
                  } else {
                    setExpiryDate(date);
                  }
                }
                setShowDatePickerModal(false);
              }}
              maximumDate={maxDate}
              minimumDate={minDate}
            />
            
          
        </View>
      </Modal>
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
        <MaterialIcons name="arrow-back-ios" size={28} color={Colors.orange1} />
      </TouchableOpacity>

      <Text style={styles.headerTitle}>
        Document Verification
      </Text>

      
    </View>
  );

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
              <View style={[styles.viewInfoRow, isSmallScreen && styles.viewInfoRowSmall]}>
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

              <View style={styles.viewInfoItem}>
                <Text style={styles.viewInfoLabel}>Document Number</Text>
                <Text style={styles.viewInfoValue}>
                  {selectedDocument.document_number}
                </Text>
              </View>

              <View style={styles.viewInfoItem}>
                <Text style={styles.viewInfoLabel}>Name on Document</Text>
                <Text style={styles.viewInfoValue}>
                  {selectedDocument.document_name}
                </Text>
              </View>

              {selectedDocument.document_type === "rc" &&
                selectedDocument.vehicle_number && (
                  <View style={styles.viewInfoItem}>
                    <Text style={styles.viewInfoLabel}>Vehicle Number</Text>
                    <Text style={styles.viewInfoValue}>
                      {selectedDocument.vehicle_number}
                    </Text>
                  </View>
                )}

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

              {isRejected && selectedDocument.rejection_reason && (
                <View style={styles.rejectionReasonContainer}>
                  <Ionicons name="warning" size={scaleFont(20)} color="#DC2626" />
                  <View style={styles.rejectionReasonContent}>
                    <Text style={styles.rejectionReasonTitle}>Rejection Reason</Text>
                    <Text style={styles.rejectionReasonText}>
                      {selectedDocument.rejection_reason}
                    </Text>
                  </View>
                </View>
              )}

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
          "Vehicle Number",
          "Select Dates",
          "Upload Front Image",
          "Upload Back Image"
        ];

    const renderStepContent = () => {
      const isAadharType = selectedType === "aadhar";
      
      switch (currentStep) {
        case 0:
          return (
            <View style={styles.wizardStep}>
              <View style={styles.stepHeader}>
                <Ionicons name="document-text" size={scaleFont(40)} color={Colors.primary} />
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
        
        case 1:
          return (
            <View style={styles.wizardStep}>
              <View style={styles.stepHeader}>
                <Ionicons name="person-circle" size={scaleFont(40)} color={Colors.primary} />
                <Text style={styles.stepSubtitle}>
                  Take a selfie while holding your document next to your face
                </Text>
              </View>

              <View style={styles.imageUploadContainer}>
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

        case 2:
          return (
            <View style={styles.wizardStep}>
              <View style={styles.stepHeader}>
                <Ionicons name="keypad" size={scaleFont(40)} color={Colors.primary} />
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

        case 3:
          return (
            <View style={styles.wizardStep}>
              <View style={styles.stepHeader}>
                <Ionicons name="person" size={scaleFont(40)} color={Colors.primary} />
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
                  Make sure it matches exactly with the document
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

        case 4:
          if (isAadharType) {
            return (
              <View style={styles.wizardStep}>
                <View style={styles.stepHeader}>
                  <Ionicons name="camera" size={scaleFont(40)} color={Colors.primary} />
                  <Text style={styles.stepSubtitle}>
                    Take a clear photo of the front side of your document
                  </Text>
                </View>

                <View style={styles.imageUploadContainer}>
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
                          Tap to take photo
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
          } else {
            return (
              <View style={styles.wizardStep}>
                <View style={styles.stepHeader}>
                  <Ionicons name="car" size={scaleFont(40)} color={Colors.primary} />
                  <Text style={styles.stepSubtitle}>
                    Enter vehicle registration number
                  </Text>
                </View>

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

                <TouchableOpacity
                  style={[
                    styles.nextButton,
                    !vehicleNumber.trim() && styles.nextButtonDisabled,
                  ]}
                  onPress={handleNext}
                  disabled={!vehicleNumber.trim()}
                  activeOpacity={0.8}
                >
                  <Text style={styles.nextButtonText}>Continue</Text>
                  <Ionicons name="arrow-forward" size={scaleFont(20)} color={Colors.white} />
                </TouchableOpacity>
              </View>
            );
          }

        case 5:
          if (isAadharType) {
            const docType = documentTypes.find((d) => d.type === selectedType);
            const requiresBackImage = docType && docType.has_back_side;
            
            return (
              <View style={styles.wizardStep}>
                <View style={styles.stepHeader}>
                  <Ionicons name="camera" size={scaleFont(40)} color={Colors.primary} />
                  <Text style={styles.stepSubtitle}>
                    {requiresBackImage 
                      ? "Take a clear photo of the back side of your document"
                      : "Submit your document"}
                  </Text>
                </View>

                <View style={styles.imageUploadContainer}>
                  {requiresBackImage ? (
                    backImage ? (
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
                            <Text style={styles.imageActionButtonText}>Gallery</Text>
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
                    )
                  ) : null}
                </View>

                <TouchableOpacity
                  style={[
                    styles.nextButton,
                    requiresBackImage && !backImage && styles.nextButtonDisabled,
                  ]}
                  onPress={handleNext}
                  disabled={requiresBackImage && !backImage || loading}
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
          } else {
            return (
              <View style={styles.wizardStep}>
                <View style={styles.stepHeader}>
                  <Ionicons name="calendar" size={scaleFont(40)} color={Colors.primary} />
                  <Text style={styles.stepSubtitle}>
                    Select issue and expiry dates
                  </Text>
                </View>

                <View style={styles.dateInputContainer}>
                  <Text style={styles.inputLabel}>Issue Date</Text>
                  <TouchableOpacity
                    style={styles.datePickerButton}
                    onPress={() => {
                      setDatePickerMode('issue');
                      setShowDatePickerModal(true);
                    }}
                    activeOpacity={0.8}
                  >
                    <Ionicons name="calendar-outline" size={scaleFont(20)} color="#6B7280" />
                    <Text style={styles.datePickerButtonText}>
                      {issueDate ? issueDate.toLocaleDateString() : "Select issue date"}
                    </Text>
                    <Ionicons name="chevron-down" size={scaleFont(20)} color="#6B7280" />
                  </TouchableOpacity>
                </View>

                {(selectedType === "dl" || selectedType === "rc") && (
                  <View style={styles.dateInputContainer}>
                    <Text style={styles.inputLabel}>Expiry Date</Text>
                    <TouchableOpacity
                      style={styles.datePickerButton}
                      onPress={() => {
                        setDatePickerMode('expiry');
                        setShowDatePickerModal(true);
                      }}
                      activeOpacity={0.8}
                    >
                      <Ionicons name="calendar-outline" size={scaleFont(20)} color="#6B7280" />
                      <Text style={styles.datePickerButtonText}>
                        {expiryDate ? expiryDate.toLocaleDateString() : "Select expiry date"}
                      </Text>
                      <Ionicons name="chevron-down" size={scaleFont(20)} color="#6B7280" />
                    </TouchableOpacity>
                  </View>
                )}

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
              </View>
            );
          }

        case 6:
          return (
            <View style={styles.wizardStep}>
              <View style={styles.stepHeader}>
                <Ionicons name="camera" size={scaleFont(40)} color={Colors.primary} />
                <Text style={styles.stepSubtitle}>
                  Take a clear photo of the front side of your document
                </Text>
              </View>

              <View style={styles.imageUploadContainer}>
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
                        Tap to take photo
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

        case 7:
          const docType = documentTypes.find((d) => d.type === selectedType);
          const requiresBackImage = docType && docType.has_back_side;
          
          return (
            <View style={styles.wizardStep}>
              <View style={styles.stepHeader}>
                <Ionicons name="camera" size={scaleFont(40)} color={Colors.primary} />
                <Text style={styles.stepSubtitle}>
                  {requiresBackImage 
                    ? "Take a clear photo of the back side of your document"
                    : "Submit your document"}
                </Text>
              </View>

              <View style={styles.imageUploadContainer}>
                {requiresBackImage ? (
                  backImage ? (
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
                          <Text style={styles.imageActionButtonText}>Gallery</Text>
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
                  )
                ) : null}
              </View>

              <TouchableOpacity
                style={[
                  styles.nextButton,
                  requiresBackImage && !backImage && styles.nextButtonDisabled,
                ]}
                onPress={handleNext}
                disabled={requiresBackImage && !backImage || loading}
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
          <View style={styles.wizardHeader}>
            <TouchableOpacity
              style={styles.wizardBackButton}
              onPress={handleBack}
              activeOpacity={0.8}
            >
              <Ionicons name="arrow-back" size={scaleFont(24)} color={Colors.textPrimary} />
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

          <View style={styles.wizardContentContainer}>
            {renderStepContent()}
          </View>
        </SafeAreaView>
      </Modal>
    );
  };

  // ========== MAIN CONTENT ==========

  const renderContent = () => {
    if (initialLoading) {
      return (
        <View style={styles.loaderContainer}>
          <LottieView
            source={require("../assets/loading.json")}
            autoPlay
            loop
            style={{ width: 300, height: 300 }}
          />
        </View>
      );
    }

    if (loading && !refreshing && documents.length === 0 && !initialLoading) {
      return (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={Colors.primary} />
          <Text style={styles.loadingText}>Loading your documents...</Text>
        </View>
      );
    }

    return (
      <Animated.View style={{ opacity: fadeAnim, transform: [{ translateY: slideAnim }] }}>
        <View style={styles.benefitsCard}>
          <Text style={styles.benefitsTitle}>Why Verify Documents?</Text>
          <View style={styles.benefitItem}>
            <Ionicons name="checkmark-circle" size={scaleFont(16)} color="#10B981"/>
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
                Tap the + button to upload your first document
              </Text>
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

        <TouchableOpacity
          style={styles.fab}
          onPress={() => {
            resetWizard();
            setShowUploadWizard(true);
            Haptics.selectionAsync();
          }}
          activeOpacity={0.8}
        >
          <Ionicons name="add" size={30} color={Colors.white} />
        </TouchableOpacity>

        {renderAlertModal()}
        {renderSuccessModal()}
        {renderViewModal()}
        {renderDeleteModal()}
        {renderUploadWizard()}
        {renderDatePickerModal()}
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.white,
  },
  loaderContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.white,
    minHeight:'800'
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
  modernRefreshButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.primary + "10",
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: scaleHeight(80),
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
  benefitsCard: {
    backgroundColor: '#F0F9FF',
    borderRadius: scaleWidth(12),
    padding: scaleWidth(16),
    marginHorizontal: scaleWidth(20),
    marginBottom: scaleHeight(16),
    marginTop: scaleHeight(16),
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
  fab: {
    position: "absolute",
    bottom: 30,
    right: 20,
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: Colors.primary,
    justifyContent: "center",
    alignItems: "center",
    elevation: 8,
    shadowColor: "#000",
    shadowOpacity: 0.2,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 4 },
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
  datePickerModalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  datePickerModalContent: {
    backgroundColor: Colors.white,
    borderRadius: scaleWidth(20),
    padding: scaleWidth(20),
    width: "90%",
    maxWidth: 400,
  },
  datePickerModalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: scaleHeight(20),
    paddingBottom: scaleHeight(10),
    borderBottomWidth: 1,
    borderBottomColor: "#F3F4F6",
  },
  datePickerModalTitle: {
    fontSize: scaleFont(18),
    fontWeight: "600",
    color: Colors.textPrimary,
  },
  datePickerModalButton: {
    marginTop: scaleHeight(20),
    paddingVertical: scaleHeight(12),
    backgroundColor: "#F3F4F6",
    borderRadius: scaleWidth(12),
    alignItems: "center",
  },
  datePickerModalButtonText: {
    fontSize: scaleFont(16),
    color: Colors.textPrimary,
    fontWeight: "500",
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
  imagePreviewActions: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    flexWrap: 'nowrap',
    width: '100%',
    gap: isSmallScreen ? scaleWidth(4) : scaleWidth(8),
  },
  imageActionButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: 'center',
    backgroundColor: Colors.primary + "10",
    paddingHorizontal: isSmallScreen ? scaleWidth(10) : scaleWidth(12),
    paddingVertical: scaleHeight(10),
    borderRadius: scaleWidth(12),
    flex: 1,
    minWidth: 0,
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
    justifyContent: 'center',
    backgroundColor: "#FEE2E2",
    paddingHorizontal: isSmallScreen ? scaleWidth(10) : scaleWidth(12),
    paddingVertical: scaleHeight(10),
    borderRadius: scaleWidth(12),
    flex: 1,
    minWidth: 0,
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
});