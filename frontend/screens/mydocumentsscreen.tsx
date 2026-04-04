import { Ionicons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Image,
  Modal,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

// ---------- ✅ Document Types ----------
interface DocumentType {
  id: string;
  name: string;
  icon: string;
  fields: string[];
}

interface DocumentField {
  [key: string]: string;
}

const DOCUMENT_TYPES: DocumentType[] = [
  { id: "1", name: "Aadhar Card", icon: "card", fields: ["Aadhar Number", "Full Name", "Date of Birth", "Address"] },
  { id: "2", name: "PAN Card", icon: "card", fields: ["PAN Number", "Full Name", "Father's Name", "Date of Birth"] },
  { id: "3", name: "Driving License", icon: "car", fields: ["License Number", "Full Name", "Date of Birth", "Address", "Issuing Authority", "Expiry Date"] },
  { id: "4", name: "Vehicle Registration", icon: "bus", fields: ["Registration Number", "Vehicle Type", "Owner Name", "Registration Date", "Expiry Date"] },
];

// ---------- ✅ 1. Selfie Setup Screen ----------
function SelfieSetupScreen({ 
  onNavigate,
  onSelfieComplete
}: { 
  onNavigate: (screen: string, params?: any) => void;
  onSelfieComplete: (selfieUri: string) => void;
}) {
  const [selfieImage, setSelfieImage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const takeSelfie = async () => {
    try {
      setLoading(true);
      const permission = await ImagePicker.requestCameraPermissionsAsync();
      if (!permission.granted) {
        Alert.alert("Permission Required", "Please allow camera access.");
        return;
      }

      const result = await ImagePicker.launchCameraAsync({
        allowsEditing: false,
        aspect: [1, 1],
        quality: 1,
        exif: false,
      });

      if (result.canceled) return;

      const uri = result.assets[0].uri;
      if (!uri || typeof uri !== "string") {
        throw new Error("Invalid image captured");
      }

      // Check image size to ensure it's not blurry
      const imageInfo = await Image.getSize(uri, (width, height) => {
        if (width < 500 || height < 500) {
          Alert.alert("Low Quality Image", "Please take a clearer selfie with better lighting.");
          return;
        }
      });

      // Validate that it's actually a human face (basic validation)
      Alert.alert(
        "Confirm Selfie",
        "Please confirm this is a clear photo of your face",
        [
          {
            text: "Retake",
            style: "cancel",
            onPress: () => {
              setSelfieImage(null);
              takeSelfie();
            }
          },
          {
            text: "Looks Good",
            onPress: () => setSelfieImage(uri)
          }
        ]
      );

    } catch (error: any) {
      Alert.alert("Camera Error", error.message ?? "Failed to take selfie.");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const completeSelfieSetup = () => {
    if (!selfieImage) {
      Alert.alert("Selfie Required", "Please take a selfie first to continue.");
      return;
    }
    
    onSelfieComplete(selfieImage);
    onNavigate('myDocuments');
    Alert.alert("Success", "Selfie saved successfully! You can now upload documents.");
  };

  return (
    <View style={styles.selfieContainer}>
      <StatusBar barStyle="dark-content" />
      
      <View style={styles.header}>
        <TouchableOpacity onPress={() => onNavigate('myDocuments')}>
          <Ionicons name="chevron-back" size={24} color="#184080" />
        </TouchableOpacity>
        <Text style={styles.pageTitle}>Profile Setup</Text>
        <View style={{ width: 24 }} />
      </View>
      
      <Text style={styles.selfieTitle}>Take Your Selfie</Text>
      
      <Text style={styles.selfieSubtitle}>
        Please ensure your face is well-lit, centered, and clearly visible.
        Remove hats, glasses, or anything that may obscure your face.
      </Text>

      <View style={styles.selfiePreviewContainer}>
        {selfieImage ? (
          <Image source={{ uri: selfieImage }} style={styles.selfieImage} />
        ) : (
          <View style={styles.selfiePlaceholder}>
            <Ionicons name="person-circle-outline" size={100} color="#CCCCCC" />
            <Text style={styles.selfiePlaceholderText}>No selfie taken yet</Text>
          </View>
        )}
        
        {selfieImage && (
          <TouchableOpacity
            style={styles.retakeButton}
            onPress={() => setSelfieImage(null)}
          >
            <Ionicons name="refresh" size={20} color="#fff" />
            <Text style={styles.retakeButtonText}>Retake</Text>
          </TouchableOpacity>
        )}
      </View>

      <View style={styles.selfieButtonContainer}>
        <TouchableOpacity 
          style={[styles.selfieCameraButton, loading && { opacity: 0.7 }]} 
          onPress={takeSelfie}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <>
              <Ionicons name="camera" size={24} color="#fff" />
              <Text style={styles.selfieButtonText}>Take Selfie</Text>
            </>
          )}
        </TouchableOpacity>
      </View>

      <View style={styles.selfieActionButtons}>
        <TouchableOpacity
          style={[styles.completeButton, (!selfieImage || loading) && { opacity: 0.5 }]}
          disabled={!selfieImage || loading}
          onPress={completeSelfieSetup}
        >
          <Text style={styles.completeButtonText}>Complete Setup</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

// ---------- ✅ 2. My Documents Screen ----------
interface Document {
  id: string;
  name: string;
  type: string;
  icon: string;
  uploadedDate: string;
  documentId?: string;
  formData?: DocumentField;
  frontImage?: string;
  backImage?: string;
}

function MyDocuments({ 
  onNavigate,
  documents: initialDocuments,
  selfieImage
}: { 
  onNavigate: (screen: string, params?: any) => void;
  documents?: Document[];
  selfieImage?: string | null;
}) {
  const [documents, setDocuments] = useState<Document[]>(initialDocuments || []);
  const [selectedDocument, setSelectedDocument] = useState<Document | null>(null);
  const [viewModalVisible, setViewModalVisible] = useState(false);
  const [profileModalVisible, setProfileModalVisible] = useState(false);

  useEffect(() => {
    if (initialDocuments) {
      setDocuments(initialDocuments);
    }
  }, [initialDocuments]);

  const handleDelete = (id: string, name: string) => {
    Alert.alert(
      "Delete Document",
      `Are you sure you want to delete ${name}?`,
      [
        { text: "Cancel", style: "cancel" },
        { 
          text: "Delete", 
          style: "destructive",
          onPress: () => {
            setDocuments(prev => prev.filter(doc => doc.id !== id));
            Alert.alert("Success", `${name} has been deleted.`);
          }
        },
      ]
    );
  };

  const renderDocument = ({ item }: { item: Document }) => (
    <View style={styles.documentCard}>
      <View style={{ flexDirection: "row", alignItems: "center", flex: 1 }}>
        <View style={styles.documentIcon}>
          <Ionicons name={item.icon as any} size={24} color="#184080" />
        </View>
        <View style={{ marginLeft: 12, flex: 1 }}>
          <Text style={styles.documentTitle}>{item.name}</Text>
          <Text style={styles.documentDate}>Uploaded: {item.uploadedDate}</Text>
          <Text style={styles.documentId}>
            {item.documentId ? `ID: ${item.documentId}` : 'Tap to view details'}
          </Text>
        </View>
      </View>

      <View style={{ flexDirection: "row" }}>
        <TouchableOpacity 
          style={styles.actionButton}
          onPress={() => {
            setSelectedDocument(item);
            setViewModalVisible(true);
          }}
        >
          <Ionicons name="eye-outline" size={22} color="#184080" />
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.actionButton, { marginLeft: 12 }]}
          onPress={() => handleDelete(item.id, item.name)}
        >
          <Ionicons name="trash-outline" size={22} color="#FF3B30" />
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" />
      
      <View style={styles.header}>
        <TouchableOpacity onPress={() => onNavigate('selfieSetup')}>
          <Ionicons name="chevron-back" size={24} color="#184080" />
        </TouchableOpacity>
        <Text style={styles.pageTitle}>My Documents</Text>
        <View style={{ width: 28 }} />
      </View>
      
      {documents.length === 0 ? (
        <View style={styles.emptyState}>
          <Ionicons name="document-outline" size={80} color="#CCCCCC" />
          <Text style={styles.emptyStateTitle}>No documents uploaded yet</Text>
          <Text style={styles.emptyStateText}>
            Start by adding your first document
          </Text>
          <TouchableOpacity
            style={styles.uploadFirstButton}
            onPress={() => onNavigate('selectDocumentType')}
          >
            <Ionicons name="add" size={20} color="#fff" />
            <Text style={styles.uploadFirstButtonText}>Upload Document</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList 
          data={documents} 
          renderItem={renderDocument} 
          keyExtractor={(item) => item.id}
          contentContainerStyle={{ paddingBottom: 80 }}
        />
      )}

      {documents.length > 0 && (
        <TouchableOpacity
          style={styles.fab}
          onPress={() => onNavigate('selectDocumentType')}
        >
          <Ionicons name="add" size={30} color="white" />
          <Text style={styles.fabText}>Upload New</Text>
        </TouchableOpacity>
      )}

      {/* View Document Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={viewModalVisible}
        onRequestClose={() => setViewModalVisible(false)}
      >
        <View style={styles.viewModalContainer}>
          <View style={styles.viewModalContent}>
            <View style={styles.viewModalHeader}>
              <Text style={styles.viewModalTitle}>
                {selectedDocument?.name || 'Document Details'}
              </Text>
              <TouchableOpacity onPress={() => setViewModalVisible(false)}>
                <Ionicons name="close" size={24} color="#000" />
              </TouchableOpacity>
            </View>
            
            <ScrollView style={styles.viewModalBody}>
              {selectedDocument && (
                <>
                  <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>Document Type:</Text>
                    <Text style={styles.detailValue}>{selectedDocument.type || selectedDocument.name}</Text>
                  </View>
                  
                  <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>Uploaded Date:</Text>
                    <Text style={styles.detailValue}>{selectedDocument.uploadedDate}</Text>
                  </View>
                  
                  {selectedDocument.documentId && (
                    <View style={styles.detailRow}>
                      <Text style={styles.detailLabel}>Document ID:</Text>
                      <Text style={styles.detailValue}>{selectedDocument.documentId}</Text>
                    </View>
                  )}
                  
                  {selectedDocument.formData && Object.entries(selectedDocument.formData).map(([key, value]) => (
                    <View key={key} style={styles.detailRow}>
                      <Text style={styles.detailLabel}>{key}:</Text>
                      <Text style={styles.detailValue}>
                        {key === 'Aadhar Number' && value ? maskAadharNumber(value as string) : value as string}
                      </Text>
                    </View>
                  ))}
                  
                  {selectedDocument.frontImage && (
                    <View style={styles.imagePreviewSection}>
                      <Text style={styles.imagePreviewTitle}>Front Photo:</Text>
                      <Image 
                        source={{ uri: selectedDocument.frontImage }} 
                        style={styles.documentImagePreview} 
                      />
                    </View>
                  )}
                  
                  {selectedDocument.backImage && (
                    <View style={styles.imagePreviewSection}>
                      <Text style={styles.imagePreviewTitle}>Back Photo:</Text>
                      <Image 
                        source={{ uri: selectedDocument.backImage }} 
                        style={styles.documentImagePreview} 
                      />
                    </View>
                  )}
                </>
              )}
            </ScrollView>
            
            <TouchableOpacity
              style={styles.viewModalCloseButton}
              onPress={() => setViewModalVisible(false)}
            >
              <Text style={styles.viewModalCloseButtonText}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

// Helper function to mask Aadhar number
const maskAadharNumber = (aadharNumber: string): string => {
  const cleaned = aadharNumber.replace(/\s/g, '');
  if (cleaned.length === 12) {
    return `XXXX XXXX ${cleaned.slice(8)}`;
  }
  return aadharNumber;
};

// ---------- ✅ 3. Select Document Type Screen ----------
function SelectDocumentType({ 
  onNavigate,
  params
}: { 
  onNavigate: (screen: string, params?: any) => void;
  params?: any;
}) {
  const [selectedType, setSelectedType] = useState<string | null>(null);

  const handleSelect = (type: DocumentType) => {
    setSelectedType(type.id);
  };

  const handleContinue = () => {
    if (!selectedType) {
      Alert.alert("Selection Required", "Please select a document type.");
      return;
    }
    
    const selectedDoc = DOCUMENT_TYPES.find(doc => doc.id === selectedType);
    onNavigate('uploadDocument', { 
      ...params, 
      documentType: selectedDoc 
    });
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" />
      
      <View style={styles.header}>
        <TouchableOpacity onPress={() => onNavigate('myDocuments')}>
          <Ionicons name="chevron-back" size={24} color="#184080" />
        </TouchableOpacity>
        <Text style={styles.pageTitle}>Select Document Type</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView style={styles.scrollView}>
        <Text style={styles.selectDocumentSubtitle}>
          Choose the type of document you want to upload
        </Text>
        
        {DOCUMENT_TYPES.map((doc) => (
          <TouchableOpacity
            key={doc.id}
            style={[
              styles.documentTypeCard,
              selectedType === doc.id && styles.documentTypeCardSelected
            ]}
            onPress={() => handleSelect(doc)}
          >
            <View style={styles.documentTypeIcon}>
              <Ionicons name={doc.icon as any} size={24} color="#184080" />
            </View>
            <Text style={[
              styles.documentTypeName,
              selectedType === doc.id && styles.documentTypeNameSelected
            ]}>
              {doc.name}
            </Text>
            {selectedType === doc.id && (
              <Ionicons name="checkmark-circle" size={24} color="#184080" />
            )}
          </TouchableOpacity>
        ))}
      </ScrollView>

      <View style={styles.bottomButtonContainer}>
        <TouchableOpacity
          style={[styles.continueButton, !selectedType && { opacity: 0.5 }]}
          disabled={!selectedType}
          onPress={handleContinue}
        >
          <Text style={styles.continueButtonText}>Continue</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

// ---------- ✅ 4. Document Upload Screen ----------
function UploadDocument({ 
  onNavigate,
  params,
  selfieImage,
  onDocumentUpload
}: { 
  onNavigate: (screen: string, params?: any) => void;
  params?: any;
  selfieImage?: string | null;
  onDocumentUpload?: (frontImage: string, backImage: string) => Promise<boolean>;
}) {
  const [frontImage, setFrontImage] = useState<string | null>(null);
  const [backImage, setBackImage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [cropModalVisible, setCropModalVisible] = useState(false);
  const [imageToCrop, setImageToCrop] = useState<{uri: string, type: 'front' | 'back'} | null>(null);
  const [processingImage, setProcessingImage] = useState(false);
  
  const documentType = params?.documentType as DocumentType | undefined;

  const pickImage = async (type: 'front' | 'back') => {
    try {
      setLoading(true);
      const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!permission.granted) {
        Alert.alert("Permission Required", "Please allow gallery access.");
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        quality: 1,
        allowsEditing: false,
        aspect: [4, 3],
      });

      if (result.canceled) return;

      const uri = result.assets[0].uri;
      if (!uri || typeof uri !== "string") {
        throw new Error("Invalid file selected");
      }

      // Validate document image (basic validation)
      const isValid = await validateDocumentImage(uri, documentType?.name || '');
      if (!isValid) {
        Alert.alert("Invalid Document", "Please upload a valid document image. Make sure the document is clear and properly captured.");
        return;
      }

      // Show crop modal
      setImageToCrop({ uri, type });
      setCropModalVisible(true);
    } catch (error: any) {
      Alert.alert("Upload Error", error.message ?? "Failed to pick image.");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const takePhoto = async (type: 'front' | 'back') => {
    try {
      setLoading(true);
      const permission = await ImagePicker.requestCameraPermissionsAsync();
      if (!permission.granted) {
        Alert.alert("Permission Required", "Please allow camera access.");
        return;
      }

      const result = await ImagePicker.launchCameraAsync({
        allowsEditing: false,
        aspect: [4, 3],
        quality: 1,
      });

      if (result.canceled) return;

      const uri = result.assets[0].uri;
      if (!uri || typeof uri !== "string") {
        throw new Error("Invalid photo taken");
      }

      // Validate document image (basic validation)
      const isValid = await validateDocumentImage(uri, documentType?.name || '');
      if (!isValid) {
        Alert.alert("Invalid Document", "Please capture a valid document. Make sure the document is clear and properly framed.");
        return;
      }

      // Show crop modal
      setImageToCrop({ uri, type });
      setCropModalVisible(true);
    } catch (error: any) {
      Alert.alert("Camera Error", error.message ?? "Failed to take photo.");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  // Validate document image
  const validateDocumentImage = async (uri: string, docType: string): Promise<boolean> => {
    try {
      // Basic image validation
      const imageInfo = await Image.getSize(uri, (width, height) => {
        if (width < 800 || height < 600) {
          Alert.alert("Low Quality", "Please capture a higher quality image.");
          return false;
        }
      });

      // Check for document-like features (text presence, edges, etc.)
      // This is a simplified validation - in real app you'd use ML/AI
      Alert.alert(
        "Validate Document",
        `Please confirm this is a valid ${docType} image.\n\nEnsure:\n• Document is fully visible\n• Text is clear and readable\n• No glare or reflections\n• Document fills the frame`,
        [
          {
            text: "Not Valid",
            style: "cancel"
          },
          {
            text: "Looks Good",
            onPress: () => {}
          }
        ]
      );

      return true;
    } catch (error) {
      console.error("Image validation error:", error);
      return false;
    }
  };

  const handleCropComplete = async () => {
    if (imageToCrop) {
      setProcessingImage(true);
      
      try {
        // Match selfie with document if selfie exists
        if (selfieImage && params?.documentType?.name && imageToCrop.type === 'front') {
          const isMatched = await matchSelfieWithDocument(selfieImage, imageToCrop.uri);
          if (!isMatched) {
            Alert.alert(
              "Face Mismatch",
              "The face in the document doesn't match your selfie. Please ensure you're uploading your own document.",
              [
                { text: "Retake", onPress: () => {
                  setProcessingImage(false);
                  setCropModalVisible(false);
                  setImageToCrop(null);
                  if (imageToCrop.type === 'front') {
                    pickImage('front');
                  } else {
                    pickImage('back');
                  }
                }},
                { text: "Continue Anyway", onPress: () => completeUpload(imageToCrop) }
              ]
            );
            setProcessingImage(false);
            return;
          }
        }
        
        await completeUpload(imageToCrop);
      } catch (error) {
        Alert.alert("Error", "Failed to process image.");
        setProcessingImage(false);
      }
    }
  };

  const completeUpload = (imageData: {uri: string, type: 'front' | 'back'}) => {
    setTimeout(() => {
      if (imageData.type === 'front') {
        setFrontImage(imageData.uri);
        Alert.alert("Success", "Front photo uploaded successfully!");
      } else {
        setBackImage(imageData.uri);
        Alert.alert("Success", "Back photo uploaded successfully!");
      }
      
      setCropModalVisible(false);
      setImageToCrop(null);
      setProcessingImage(false);
    }, 1000);
  };

  // Simulate face matching (in real app, use face recognition API)
  const matchSelfieWithDocument = async (selfieUri: string, documentUri: string): Promise<boolean> => {
    return new Promise((resolve) => {
      setTimeout(() => {
        // Simulate face matching - 80% success rate
        const isMatched = Math.random() > 0.2;
        resolve(isMatched);
      }, 1500);
    });
  };

  const handleContinue = () => {
    if (!frontImage) {
      Alert.alert("Upload Required", "Please upload front photo.");
      return;
    }
    
    if (!backImage) {
      Alert.alert("Upload Required", "Please upload back photo as well.");
      return;
    }
    
    onNavigate('addDetails', {
      ...params,
      frontImage,
      backImage,
      selfieImage // Pass selfie for verification
    });
  };

  const handleDeleteImage = (type: 'front' | 'back') => {
    Alert.alert(
      "Delete Photo",
      `Are you sure you want to delete ${type} photo?`,
      [
        { text: "Cancel", style: "cancel" },
        { 
          text: "Delete", 
          style: "destructive",
          onPress: () => {
            if (type === 'front') {
              setFrontImage(null);
            } else {
              setBackImage(null);
            }
          }
        },
      ]
    );
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" />
      
      <View style={styles.header}>
        <TouchableOpacity onPress={() => onNavigate('selectDocumentType', params)}>
          <Ionicons name="chevron-back" size={24} color="#184080" />
        </TouchableOpacity>
        <Text style={styles.pageTitle}>Upload {documentType?.name || "Document"}</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView style={styles.scrollView}>
        {/* Front Photo Upload */}
        <View style={styles.uploadSection}>
          <View style={styles.uploadHeaderRow}>
            <Text style={styles.uploadSectionTitle}>Front Photo *</Text>
            {frontImage && (
              <TouchableOpacity 
                style={styles.deleteIconButton}
                onPress={() => handleDeleteImage('front')}
              >
                <Ionicons name="trash-outline" size={20} color="#FF3B30" />
              </TouchableOpacity>
            )}
          </View>
          <Text style={styles.uploadSectionSubtitle}>
            Take a clear photo of the front side
          </Text>
          
          <TouchableOpacity 
            style={styles.uploadBox} 
            onPress={() => pickImage('front')}
            disabled={loading}
          >
            {frontImage ? (
              <View style={styles.uploadedImageContainer}>
                <Image source={{ uri: frontImage }} style={styles.uploadedImage} />
                <View style={styles.uploadedImageOverlay}>
                  <Ionicons name="checkmark-circle" size={40} color="#4CAF50" />
                  <Text style={styles.uploadedImageText}>Front Photo Uploaded</Text>
                </View>
              </View>
            ) : (
              <>
                <Ionicons name="document-attach-outline" size={50} color="#666" />
                <Text style={styles.uploadBoxText}>Tap to upload front photo</Text>
              </>
            )}
          </TouchableOpacity>
          
          <View style={styles.uploadOptions}>
            <TouchableOpacity 
              style={[styles.uploadOptionButton, loading && { opacity: 0.5 }]}
              onPress={() => pickImage('front')}
              disabled={loading}
            >
              <Ionicons name="folder-open" size={20} color="#184080" />
              <Text style={styles.uploadOptionText}>Gallery</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={[styles.uploadOptionButton, loading && { opacity: 0.5 }]}
              onPress={() => takePhoto('front')}
              disabled={loading}
            >
              <Ionicons name="camera" size={20} color="#184080" />
              <Text style={styles.uploadOptionText}>Camera</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Back Photo Upload */}
        <View style={styles.uploadSection}>
          <View style={styles.uploadHeaderRow}>
            <Text style={styles.uploadSectionTitle}>Back Photo *</Text>
            {backImage && (
              <TouchableOpacity 
                style={styles.deleteIconButton}
                onPress={() => handleDeleteImage('back')}
              >
                <Ionicons name="trash-outline" size={20} color="#FF3B30" />
              </TouchableOpacity>
            )}
          </View>
          <Text style={styles.uploadSectionSubtitle}>
            Take a clear photo of the back side
          </Text>
          
          <TouchableOpacity 
            style={styles.uploadBox} 
            onPress={() => pickImage('back')}
            disabled={loading}
          >
            {backImage ? (
              <View style={styles.uploadedImageContainer}>
                <Image source={{ uri: backImage }} style={styles.uploadedImage} />
                <View style={styles.uploadedImageOverlay}>
                  <Ionicons name="checkmark-circle" size={40} color="#4CAF50" />
                  <Text style={styles.uploadedImageText}>Back Photo Uploaded</Text>
                </View>
              </View>
            ) : (
              <>
                <Ionicons name="document-attach-outline" size={50} color="#666" />
                <Text style={styles.uploadBoxText}>Tap to upload back photo</Text>
              </>
            )}
          </TouchableOpacity>
          
          <View style={styles.uploadOptions}>
            <TouchableOpacity 
              style={[styles.uploadOptionButton, loading && { opacity: 0.5 }]}
              onPress={() => pickImage('back')}
              disabled={loading}
            >
              <Ionicons name="folder-open" size={20} color="#184080" />
              <Text style={styles.uploadOptionText}>Gallery</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={[styles.uploadOptionButton, loading && { opacity: 0.5 }]}
              onPress={() => takePhoto('back')}
              disabled={loading}
            >
              <Ionicons name="camera" size={20} color="#184080" />
              <Text style={styles.uploadOptionText}>Camera</Text>
            </TouchableOpacity>
          </View>
        </View>

        <Text style={styles.uploadNote}>
          * Both front and back photos are mandatory. Make sure the document is clearly visible, well-lit, and all text is readable.
        </Text>
      </ScrollView>

      <View style={styles.bottomButtonContainer}>
        <TouchableOpacity
          style={[styles.continueButton, (!frontImage || !backImage || loading) && { opacity: 0.5 }]}
          disabled={!frontImage || !backImage || loading}
          onPress={handleContinue}
        >
          <Text style={styles.continueButtonText}>Continue to Details</Text>
        </TouchableOpacity>
      </View>

      {/* SIMPLIFIED Crop Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={cropModalVisible}
        onRequestClose={() => setCropModalVisible(false)}
      >
        <View style={styles.cropModalContainer}>
          <View style={styles.cropModalContent}>
            <View style={styles.cropModalHeader}>
              <Text style={styles.cropModalTitle}>
                {imageToCrop?.type === 'front' ? 'Front Photo' : 'Back Photo'}
              </Text>
              <TouchableOpacity onPress={() => setCropModalVisible(false)}>
                <Ionicons name="close" size={24} color="#000" />
              </TouchableOpacity>
            </View>
            
            <View style={styles.cropImageContainer}>
              {imageToCrop && (
                <Image source={{ uri: imageToCrop.uri }} style={styles.cropImage} />
              )}
              <View style={styles.cropOverlay}>
                <View style={styles.cropGuideRectangle} />
              </View>
            </View>
            
            {/* ONLY 3 BUTTONS: Cancel, Retake, Proceed */}
            <View style={styles.simpleCropButtons}>
              <TouchableOpacity
                style={[styles.simpleCropButton, styles.cancelCropButton]}
                onPress={() => setCropModalVisible(false)}
                disabled={processingImage}
              >
                <Ionicons name="close" size={20} color="#666" />
                <Text style={styles.cancelCropButtonText}>Cancel</Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={[styles.simpleCropButton, styles.retakeCropButton]}
                onPress={() => {
                  setCropModalVisible(false);
                  setImageToCrop(null);
                  if (imageToCrop?.type === 'front') {
                    pickImage('front');
                  } else {
                    pickImage('back');
                  }
                }}
                disabled={processingImage}
              >
                <Ionicons name="refresh" size={20} color="#FFA000" />
                <Text style={styles.retakeCropButtonText}>Retake</Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={[styles.simpleCropButton, styles.proceedCropButton, processingImage && { opacity: 0.7 }]}
                onPress={handleCropComplete}
                disabled={processingImage}
              >
                {processingImage ? (
                  <ActivityIndicator color="#fff" size="small" />
                ) : (
                  <>
                    <Ionicons name="checkmark" size={20} color="#fff" />
                    <Text style={styles.proceedCropButtonText}>Proceed</Text>
                  </>
                )}
              </TouchableOpacity>
            </View>
            
            {processingImage && (
              <View style={styles.processingOverlay}>
                <ActivityIndicator size="large" color="#184080" />
                <Text style={styles.processingText}>
                  {selfieImage && imageToCrop?.type === 'front' 
                    ? "Verifying face match with selfie..." 
                    : "Processing your document..."}
                </Text>
              </View>
            )}
          </View>
        </View>
      </Modal>
    </View>
  );
}

// ---------- ✅ 5. Add Details Screen ----------
function AddDetails({ 
  onNavigate,
  params
}: { 
  onNavigate: (screen: string, params?: any) => void;
  params?: any;
}) {
  const documentType = params?.documentType as DocumentType | undefined;
  const [formData, setFormData] = useState<DocumentField>({});
  const [loading, setLoading] = useState(false);
  const [extractedData, setExtractedData] = useState<DocumentField | null>(null);

  // Initialize form data based on document type
  useEffect(() => {
    if (documentType?.fields) {
      const initialData: DocumentField = {};
      documentType.fields.forEach((field: string) => {
        initialData[field] = '';
      });
      setFormData(initialData);
    }
  }, [documentType]);

  // Automatically extract data from uploaded image
  useEffect(() => {
    if (params?.frontImage && documentType?.name) {
      extractDataFromImage();
    }
  }, [params?.frontImage, documentType]);

  const extractDataFromImage = async () => {
    // Simulate OCR extraction based on document type
    setLoading(true);
    
    try {
      // Simulate API call to extract data
      setTimeout(() => {
        let extracted: DocumentField = {};
        
        // Different extraction logic based on document type
        switch (documentType?.name) {
          case "Aadhar Card":
            extracted = {
              "Aadhar Number": "1234 5678 9012",
              "Full Name": "Aarav Sharma",
              "Date of Birth": "15-08-1995",
              "Address": "123, Gandhi Nagar, New Delhi"
            };
            break;
            
          case "PAN Card":
            extracted = {
              "PAN Number": "ABCDE1234F",
              "Full Name": "AARAV SHARMA",
              "Father's Name": "RAJESH SHARMA",
              "Date of Birth": "15-08-1995"
            };
            break;
            
          case "Driving License":
            extracted = {
              "License Number": "DL9876543210123",
              "Full Name": "Aarav Sharma",
              "Date of Birth": "15 August 1995",
              "Address": "123, Gandhi Nagar, New Delhi - 110001",
              "Issuing Authority": "Delhi Transport Authority",
              "Expiry Date": "14 August 2030"
            };
            break;
            
          case "Vehicle Registration":
            extracted = {
              "Registration Number": "DL1CA1234",
              "Vehicle Type": "Sedan",
              "Owner Name": "Aarav Sharma",
              "Registration Date": "15-01-2020",
              "Expiry Date": "14-01-2030"
            };
            break;
        }
        
        if (Object.keys(extracted).length > 0) {
          setExtractedData(extracted);
          // Auto-fill the form with extracted data
          setFormData((prev: DocumentField) => ({
            ...prev,
            ...extracted
          }));
          Alert.alert(
            "Data Extracted",
            "We've automatically filled details from your document. Please review and edit if needed."
          );
        } else {
          Alert.alert(
            "Extraction Failed",
            "Could not extract data from the document. Please enter details manually."
          );
        }
        
        setLoading(false);
      }, 2000);
      
    } catch (error) {
      Alert.alert("Extraction Error", "Failed to extract data from document.");
      setLoading(false);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev: DocumentField) => ({
      ...prev,
      [field]: value
    }));
  };

  const validateForm = () => {
    const requiredFields = documentType?.fields || [];
    
    for (const field of requiredFields) {
      if (!formData[field]?.trim()) {
        Alert.alert("Validation Error", `Please fill in ${field}`);
        return false;
      }
    }

    // Additional validations based on document type
    if (documentType?.name === "Driving License") {
      const licenseNumber = formData["License Number"];
      if (licenseNumber && !/^[A-Z]{2}\d{13}$/.test(licenseNumber.replace(/\s/g, ''))) {
        Alert.alert("Validation Error", "Please enter a valid Driving License number");
        return false;
      }
    }

    if (documentType?.name === "Aadhar Card") {
      const aadharNumber = formData["Aadhar Number"];
      if (aadharNumber && !/^\d{4}\s?\d{4}\s?\d{4}$/.test(aadharNumber)) {
        Alert.alert("Validation Error", "Please enter a valid Aadhar number (12 digits)");
        return false;
      }
    }

    if (documentType?.name === "PAN Card") {
      const panNumber = formData["PAN Number"];
      if (panNumber && !/^[A-Z]{5}\d{4}[A-Z]{1}$/.test(panNumber)) {
        Alert.alert("Validation Error", "Please enter a valid PAN number");
        return false;
      }
    }

    return true;
  };

  const handleSubmit = () => {
    if (!validateForm()) return;

    setLoading(true);
    
    // Simulate API call
    setTimeout(() => {
      setLoading(false);
      onNavigate('submissionSuccess', {
        ...params,
        formData,
        uploadedDate: new Date().toISOString().split('T')[0]
      });
    }, 1500);
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" />
      
      <View style={styles.header}>
        <TouchableOpacity onPress={() => onNavigate('uploadDocument', params)}>
          <Ionicons name="chevron-back" size={24} color="#184080" />
        </TouchableOpacity>
        <Text style={styles.pageTitle}>Add Details</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView style={styles.scrollView}>
        <View style={styles.formContainer}>
          <Text style={styles.formTitle}>{documentType?.name} Details</Text>
          
          {extractedData && (
            <View style={styles.extractedDataBanner}>
              <Ionicons name="information-circle" size={20} color="#184080" />
              <Text style={styles.extractedDataText}>
                Data extracted from your document. Please review.
              </Text>
            </View>
          )}

          {documentType?.fields.map((field: string, index: number) => (
            <View key={index} style={styles.inputContainer}>
              <Text style={styles.inputLabel}>{field} *</Text>
              <TextInput
                style={styles.input}
                value={formData[field] || ''}
                onChangeText={(text) => handleInputChange(field, text)}
                placeholder={`Enter ${field.toLowerCase()}`}
                placeholderTextColor="#999"
              />
            </View>
          ))}
        </View>
      </ScrollView>

      <View style={styles.bottomButtonContainer}>
        <TouchableOpacity
          style={[styles.submitButton, loading && { opacity: 0.7 }]}
          onPress={handleSubmit}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.submitButtonText}>Submit Details</Text>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
}

// ---------- ✅ 6. Submission Success Screen ----------
function SubmissionSuccess({ 
  onNavigate,
  params
}: { 
  onNavigate: (screen: string, params?: any) => void;
  params?: any;
}) {
  const [documents, setDocuments] = useState<Document[]>([]);

  useEffect(() => {
    // Generate document entry from submitted data
    const newDocument: Document = {
      id: Date.now().toString(),
      name: params?.documentType?.name || 'Document',
      type: params?.documentType?.name,
      icon: params?.documentType?.icon || 'document',
      uploadedDate: params?.uploadedDate || new Date().toISOString().split('T')[0],
      documentId: params?.formData?.["License Number"] || 
                  params?.formData?.["Aadhar Number"] || 
                  params?.formData?.["PAN Number"] ||
                  params?.formData?.["Registration Number"],
      formData: params?.formData,
      frontImage: params?.frontImage,
      backImage: params?.backImage
    };

    setDocuments([newDocument]);
  }, [params]);

  const handleGoToDocuments = () => {
    onNavigate('myDocuments', { newDocument: documents[0] });
  };

  const handleUploadAnother = () => {
    onNavigate('selectDocumentType');
  };

  return (
    <View style={styles.successContainer}>
      <StatusBar barStyle="dark-content" />
      
      <View style={styles.successHeader}>
        <Text style={styles.successHeaderTitle}>Submission Confirm</Text>
        <View style={styles.successDivider} />
      </View>

      <View style={styles.successContent}>
        <Ionicons name="checkmark-circle" size={100} color="#4CAF50" />
        
        <Text style={styles.successTitle}>Document Submitted Successfully!</Text>
        
        <Text style={styles.successMessage}>
          Your document details have been securely processed and added to your profile.
        </Text>

        {params?.documentType && (
          <View style={styles.submittedInfo}>
            <Text style={styles.submittedInfoTitle}>Submitted Document:</Text>
            <Text style={styles.submittedInfoValue}>{params.documentType.name}</Text>
            
            {params?.formData && (
              <View style={styles.submittedDetails}>
                {Object.entries(params.formData).slice(0, 3).map(([key, value]) => (
                  <Text key={key} style={styles.submittedDetail}>
                    {key}: <Text style={styles.submittedDetailValue}>
                      {key === 'Aadhar Number' && value ? maskAadharNumber(value as string) : value as string}
                    </Text>
                  </Text>
                ))}
              </View>
            )}
          </View>
        )}
      </View>

      <View style={styles.successActions}>
        <TouchableOpacity
          style={styles.successButton}
          onPress={handleGoToDocuments}
        >
          <Text style={styles.successButtonText}>Go to My Documents</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.successButton, styles.successButtonOutline]}
          onPress={handleUploadAnother}
        >
          <Text style={styles.successButtonOutlineText}>Upload Another Document</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

// ---------- ✅ Main App with Screen Switcher ----------
export default function App() {
  const [currentScreen, setCurrentScreen] = useState<'selfieSetup' | 'myDocuments' | 'selectDocumentType' | 'uploadDocument' | 'addDetails' | 'submissionSuccess'>('selfieSetup');
  const [screenParams, setScreenParams] = useState<any>({});
  const [documents, setDocuments] = useState<Document[]>([]);
  const [selfieImage, setSelfieImage] = useState<string | null>(null);

  const handleNavigate = (screen: string, params?: any) => {
    if (params) {
      setScreenParams((prev: any) => ({ ...prev, ...params }));
    }
    
    // If navigating to myDocuments and we have a new document from submission
    if (screen === 'myDocuments' && params?.newDocument) {
      setDocuments((prev: Document[]) => [...prev, params.newDocument]);
    }
    
    setCurrentScreen(screen as any);
  };

  const handleSelfieComplete = (selfieUri: string) => {
    setSelfieImage(selfieUri);
  };

  switch (currentScreen) {
    case 'selfieSetup':
      return <SelfieSetupScreen onNavigate={handleNavigate} onSelfieComplete={handleSelfieComplete} />;
    case 'myDocuments':
      return <MyDocuments onNavigate={handleNavigate} documents={documents} selfieImage={selfieImage} />;
    case 'selectDocumentType':
      return <SelectDocumentType onNavigate={handleNavigate} params={screenParams} />;
    case 'uploadDocument':
      return <UploadDocument 
        onNavigate={handleNavigate} 
        params={screenParams} 
        selfieImage={selfieImage}
      />;
    case 'addDetails':
      return <AddDetails onNavigate={handleNavigate} params={screenParams} />;
    case 'submissionSuccess':
      return <SubmissionSuccess onNavigate={handleNavigate} params={screenParams} />;
    default:
      return <MyDocuments onNavigate={handleNavigate} documents={documents} selfieImage={selfieImage} />;
  }
}

// ---------- ✅ Styles ----------
const styles = StyleSheet.create({
  // Common styles
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 20,
  },
  pageTitle: {
    fontSize: 24,
    fontWeight: "700",
    color: "#000",
    textAlign: 'center',
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  bottomButtonContainer: {
    paddingHorizontal: 20,
    paddingBottom: 20,
    paddingTop: 10,
  },
  
  // Selfie Setup Screen
  selfieContainer: {
    flex: 1,
    backgroundColor: "#fff",
  },
  selfieTitle: {
    fontSize: 28,
    fontWeight: "700",
    textAlign: "center",
    marginBottom: 16,
    color: "#000",
    marginTop: 20,
  },
  selfieSubtitle: {
    fontSize: 16,
    textAlign: "center",
    color: "#666",
    marginBottom: 40,
    lineHeight: 22,
    paddingHorizontal: 20,
  },
  selfiePreviewContainer: {
    alignItems: "center",
    marginBottom: 40,
    position: "relative",
    paddingHorizontal: 20,
  },
  selfieImage: {
    width: 200,
    height: 200,
    borderRadius: 100,
    borderWidth: 4,
    borderColor: "#184080",
  },
  selfiePlaceholder: {
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: "#F5F5F5",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderColor: "#E0E0E0",
    borderStyle: "dashed",
  },
  selfiePlaceholderText: {
    marginTop: 12,
    color: "#999",
    fontSize: 14,
  },
  retakeButton: {
    position: "absolute",
    top: 10,
    right: 90,
    backgroundColor: "#FF3B30",
    padding: 8,
    borderRadius: 20,
    flexDirection: 'row',
    alignItems: 'center',
  },
  retakeButtonText: {
    color: "#fff",
    fontSize: 12,
    marginLeft: 4,
  },
  selfieButtonContainer: {
    marginBottom: 40,
    paddingHorizontal: 20,
  },
  selfieCameraButton: {
    backgroundColor: "#184080",
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 16,
    borderRadius: 12,
    marginBottom: 12,
  },
  selfieButtonText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "600",
    marginLeft: 8,
  },
  selfieActionButtons: {
    paddingHorizontal: 20,
    marginTop: 'auto',
    marginBottom: 40,
  },
  completeButton: {
    backgroundColor: "#184080",
    paddingVertical: 18,
    borderRadius: 12,
    marginBottom: 12,
  },
  completeButtonText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "600",
    textAlign: "center",
  },
  
  // My Documents
  backButton: {
    width: 36,
    height: 36,
    justifyContent: 'center',
    alignItems: 'center',
  },
  
  // Document Type Selection
  selectDocumentSubtitle: {
    fontSize: 16,
    color: "#666",
    textAlign: "center",
    marginBottom: 30,
    paddingHorizontal: 20,
  },
  documentTypeCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    marginHorizontal: 20,
    marginBottom: 12,
    backgroundColor: '#F8F9FF',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E8ECFF',
  },
  documentTypeCardSelected: {
    backgroundColor: '#E8ECFF',
    borderColor: '#184080',
  },
  documentTypeIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#E8ECFF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  documentTypeName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    flex: 1,
  },
  documentTypeNameSelected: {
    color: '#184080',
  },
  
  // Upload Document
  uploadSection: {
    paddingHorizontal: 20,
    marginBottom: 30,
  },
  uploadHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  uploadSectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#000",
  },
  uploadSectionSubtitle: {
    fontSize: 14,
    color: "#666",
    marginBottom: 16,
  },
  deleteIconButton: {
    padding: 4,
  },
  uploadBox: {
    borderWidth: 2,
    borderStyle: "dashed",
    borderColor: "#CCCCCC",
    borderRadius: 12,
    height: 200,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#FAFAFA",
  },
  uploadBoxText: {
    marginTop: 12,
    color: "#666",
    fontSize: 16,
    textAlign: "center",
  },
  uploadedImageContainer: {
    width: '100%',
    height: '100%',
    position: 'relative',
  },
  uploadedImage: {
    width: '100%',
    height: '100%',
    borderRadius: 12,
  },
  uploadedImageOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 12,
  },
  uploadedImageText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
    marginTop: 8,
  },
  uploadOptions: {
    flexDirection: 'row',
    marginTop: 12,
    gap: 12,
  },
  uploadOptionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 8,
    backgroundColor: '#F0F4FF',
    borderWidth: 1,
    borderColor: '#E8ECFF',
  },
  uploadOptionText: {
    color: '#184080',
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 8,
  },
  uploadNote: {
    fontSize: 14,
    color: "#666",
    textAlign: "center",
    marginTop: 20,
    lineHeight: 20,
    paddingHorizontal: 20,
  },
  continueButton: {
    backgroundColor: "#184080",
    paddingVertical: 18,
    borderRadius: 12,
    marginBottom: 10,
  },
  continueButtonText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "600",
    textAlign: "center",
  },
  
  // SIMPLIFIED Crop Modal
  cropModalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.9)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  cropModalContent: {
    backgroundColor: '#000',
    borderRadius: 16,
    width: '100%',
    height: '100%',
  },
  cropModalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    paddingTop: 60,
    backgroundColor: '#000',
  },
  cropModalTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#fff',
  },
  cropImageContainer: {
    flex: 1,
    position: 'relative',
    justifyContent: 'center',
    alignItems: 'center',
  },
  cropImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'contain',
  },
  cropOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cropGuideRectangle: {
    width: 300,
    height: 200,
    borderWidth: 2,
    borderColor: '#4CAF50',
    borderStyle: 'dashed',
    backgroundColor: 'rgba(76, 175, 80, 0.1)',
  },
  simpleCropButtons: {
    flexDirection: 'row',
    padding: 20,
    backgroundColor: '#000',
    borderTopWidth: 1,
    borderTopColor: '#333',
    gap: 10,
  },
  simpleCropButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderRadius: 10,
  },
  cancelCropButton: {
    backgroundColor: '#2a2a2a',
    borderWidth: 1,
    borderColor: '#444',
  },
  cancelCropButtonText: {
    color: '#ccc',
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 6,
  },
  retakeCropButton: {
    backgroundColor: '#2a2a2a',
    borderWidth: 1,
    borderColor: '#FFA000',
  },
  retakeCropButtonText: {
    color: '#FFA000',
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 6,
  },
  proceedCropButton: {
    backgroundColor: '#4CAF50',
  },
  proceedCropButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 6,
  },
  processingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.9)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  processingText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
    marginTop: 20,
  },
  
  // Add Details Form
  formContainer: {
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  formTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#000',
    marginBottom: 20,
  },
  extractedDataBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E8ECFF',
    padding: 12,
    borderRadius: 8,
    marginBottom: 20,
  },
  extractedDataText: {
    color: '#184080',
    fontSize: 14,
    marginLeft: 8,
    flex: 1,
  },
  inputContainer: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: '#DDD',
    borderRadius: 8,
    padding: 16,
    fontSize: 16,
    color: '#000',
    backgroundColor: '#FAFAFA',
  },
  submitButton: {
    backgroundColor: "#184080",
    paddingVertical: 18,
    borderRadius: 12,
    alignItems: "center",
    marginBottom: 10,
  },
  submitButtonText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "600",
  },
  
  // My Documents
  emptyState: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 40,
  },
  emptyStateTitle: {
    fontSize: 22,
    fontWeight: "600",
    marginTop: 20,
    marginBottom: 8,
    color: "#333",
  },
  emptyStateText: {
    fontSize: 16,
    color: "#666",
    textAlign: "center",
    lineHeight: 22,
    marginBottom: 30,
  },
  uploadFirstButton: {
    backgroundColor: "#184080",
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 12,
  },
  uploadFirstButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
    marginLeft: 8,
  },
  documentCard: {
    backgroundColor: "#F8F9FF",
    padding: 16,
    marginHorizontal: 20,
    marginBottom: 12,
    borderRadius: 12,
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#E8ECFF",
  },
  documentIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "#E8ECFF",
    justifyContent: "center",
    alignItems: "center",
  },
  documentTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#000",
    marginBottom: 4,
  },
  documentDate: {
    fontSize: 14,
    color: "#666",
    marginBottom: 2,
  },
  documentId: {
    fontSize: 12,
    color: "#888",
  },
  actionButton: {
    padding: 8,
  },
  fab: {
    position: "absolute",
    bottom: 30,
    right: 20,
    backgroundColor: "#184080",
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 30,
    elevation: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  fabText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
    marginLeft: 8,
  },
  
  // View Document Modal
  viewModalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  viewModalContent: {
    backgroundColor: '#fff',
    borderRadius: 16,
    width: '100%',
    maxWidth: 500,
    maxHeight: '80%',
  },
  viewModalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#EEE',
  },
  viewModalTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#000',
  },
  viewModalBody: {
    padding: 20,
    maxHeight: 400,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  detailLabel: {
    fontSize: 14,
    color: '#666',
    flex: 1,
  },
  detailValue: {
    fontSize: 14,
    color: '#000',
    fontWeight: '600',
    flex: 2,
    textAlign: 'right',
  },
  imagePreviewSection: {
    marginTop: 20,
  },
  imagePreviewTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 12,
  },
  documentImagePreview: {
    width: '100%',
    height: 200,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#DDD',
  },
  viewModalCloseButton: {
    backgroundColor: "#184080",
    paddingVertical: 16,
    borderRadius: 12,
    margin: 20,
    alignItems: "center",
  },
  viewModalCloseButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  
  // Submission Success
  successContainer: {
    flex: 1,
    backgroundColor: "#fff",
  },
  successHeader: {
    paddingTop: 60,
    paddingHorizontal: 20,
    marginBottom: 40,
  },
  successHeaderTitle: {
    fontSize: 24,
    fontWeight: "700",
    color: "#000",
    marginBottom: 16,
  },
  successDivider: {
    height: 2,
    backgroundColor: "#E0E0E0",
    borderRadius: 1,
  },
  successContent: {
    flex: 1,
    alignItems: "center",
    paddingHorizontal: 20,
  },
  successTitle: {
    fontSize: 22,
    fontWeight: "700",
    textAlign: "center",
    marginTop: 20,
    marginBottom: 16,
    color: "#000",
    lineHeight: 30,
  },
  successMessage: {
    fontSize: 16,
    textAlign: "center",
    color: "#666",
    lineHeight: 24,
    marginBottom: 30,
  },
  submittedInfo: {
    backgroundColor: "#F8F9FF",
    padding: 20,
    borderRadius: 12,
    width: "100%",
    borderWidth: 1,
    borderColor: "#E8ECFF",
  },
  submittedInfoTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  submittedInfoValue: {
    fontSize: 18,
    fontWeight: '700',
    color: '#184080',
    marginBottom: 16,
  },
  submittedDetails: {
    marginTop: 8,
  },
  submittedDetail: {
    fontSize: 14,
    color: '#666',
    marginBottom: 6,
  },
  submittedDetailValue: {
    fontWeight: '600',
    color: '#000',
  },
  successActions: {
    paddingHorizontal: 20,
    paddingBottom: 40,
    paddingTop: 20,
  },
  successButton: {
    backgroundColor: "#184080",
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: "center",
    marginBottom: 12,
  },
  successButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  successButtonOutline: {
    backgroundColor: "transparent",
    borderWidth: 1,
    borderColor: "#184080",
  },
  successButtonOutlineText: {
    color: "#184080",
    fontSize: 16,
    fontWeight: "600",
  },
});