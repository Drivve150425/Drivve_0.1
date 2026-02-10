import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  StatusBar,
  Image,
  Alert,
  ActivityIndicator,
  Modal,
  RefreshControl,
  TextInput,
  Dimensions,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons, MaterialIcons, FontAwesome5 } from "@expo/vector-icons";
import { Colors, Typography } from "../constants/Colors";
import DatabaseService from "../services/DatabaseService";

const { width, height } = Dimensions.get("window");
const isSmallScreen = width < 375;

const BASE_URL = process.env.EXPO_PUBLIC_API_URL;


export default function AdminApprovalScreen({ navigation, route }) {
  const adminUsername = route?.params?.adminUsername || "Admin";
  
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [documents, setDocuments] = useState([]);
  const [selectedDocument, setSelectedDocument] = useState(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [rejectionReason, setRejectionReason] = useState("");
  const [filter, setFilter] = useState("pending");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [selectedImage, setSelectedImage] = useState(null);

  useEffect(() => {
    loadData();
  }, [filter, currentPage]);

  const loadData = async () => {
    try {
      setLoading(true);
      
      const docsRes = await DatabaseService.getPendingDocuments(filter, currentPage);
      if (docsRes.success) {
        setDocuments(docsRes.documents);
        setTotalPages(docsRes.pagination.pages);
      }
    } catch (error) {
      Alert.alert("Error", "Failed to load data. Please check your connection.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    loadData();
  }, [filter]);

  const handleViewDetails = (doc) => {
    setSelectedDocument(doc);
    setShowDetailsModal(true);
  };

  const handleImagePress = (imageUrl, title) => {
    if (imageUrl) {
      setSelectedImage({ uri: imageUrl, title });
    }
  };

  const handleApprove = async (docId) => {
    Alert.alert(
      "Confirm Approval",
      "Are you sure you want to approve this document?",
      [
        { text: "Cancel", style: "cancel" },
        { 
          text: "Approve", 
          onPress: async () => {
            try {
              setLoading(true);
              const result = await DatabaseService.updateDocumentStatus(
                docId, 
                "approved", 
                "", 
                adminUsername
              );
              
              if (result.success) {
                Alert.alert("Success", "Document approved successfully!");
                loadData();
                setShowDetailsModal(false);
              } else {
                Alert.alert("Error", result.message || "Failed to approve document.");
              }
            } catch (error) {
              Alert.alert("Error", "Failed to approve document. Please try again.");
            } finally {
              setLoading(false);
            }
          }
        }
      ]
    );
  };

  const handleReject = async (docId) => {
    if (!rejectionReason.trim()) {
      Alert.alert("Required", "Please provide a rejection reason.");
      return;
    }
    
    try {
      setLoading(true);
      const result = await DatabaseService.updateDocumentStatus(
        docId, 
        "rejected", 
        rejectionReason, 
        adminUsername
      );
      
      if (result.success) {
        Alert.alert("Success", "Document rejected successfully!");
        setShowRejectModal(false);
        setShowDetailsModal(false);
        setRejectionReason("");
        loadData();
      } else {
        Alert.alert("Error", result.message || "Failed to reject document.");
      }
    } catch (error) {
      Alert.alert("Error", "Failed to reject document. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const getImageUrl = (imagePath) => {
    if (!imagePath) return null;
    
    if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
      return imagePath;
    }
    
    if (imagePath.startsWith('/uploads')) {
      return `${BASE_URL}${imagePath}`;
    }
    
    if (imagePath.startsWith('uploads')) {
      return `${BASE_URL}/${imagePath}`;
    }
    
    return `${BASE_URL}/uploads/${imagePath}`;
  };

  const getDocumentTypeName = (type) => {
    const types = {
      "AADHAR": "Aadhar Card",
      "DL": "Driving License",
      "RC": "Registration Certificate"
    };
    return types[type] || type;
  };

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

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    
    const date = new Date(dateString);
    return date.toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  };

  const renderDocumentCard = (doc) => {
    const getStatusColor = (status) => {
      switch (status) {
        case "approved": return "#10B981";
        case "rejected": return "#EF4444";
        case "pending": return "#F59E0B";
        default: return "#6B7280";
      }
    };

    const getStatusIcon = (status) => {
      switch (status) {
        case "approved": return "checkmark-circle";
        case "rejected": return "close-circle";
        case "pending": return "time";
        default: return "document";
      }
    };

    const getDocumentIcon = (type) => {
      switch (type) {
        case "AADHAR": return "id-card";
        case "DL": return "car";
        case "RC": return "file-contract";
        default: return "id-card";
      }
    };

    return (
      <TouchableOpacity
        key={doc.id}
        style={styles.docCard}
        onPress={() => handleViewDetails(doc)}
      >
        <View style={styles.cardContent}>
          <View style={styles.docTypeContainer}>
            <View style={styles.docTypeIcon}>
              <FontAwesome5 
                name={getDocumentIcon(doc.document_type)}
                size={16} 
                color={Colors.white} 
              />
            </View>
            <View style={styles.docTypeInfo}>
              <Text style={styles.docTypeText}>{getDocumentTypeName(doc.document_type)}</Text>
              <Text style={styles.docNumber}>{doc.document_number}</Text>
            </View>
          </View>
          
          <View style={[styles.statusBadge, { backgroundColor: getStatusColor(doc.status) }]}>
            <Ionicons name={getStatusIcon(doc.status)} size={12} color={Colors.white} />
            <Text style={styles.statusText}>{doc.status.charAt(0).toUpperCase() + doc.status.slice(1)}</Text>
          </View>
        </View>
        
        <View style={styles.userInfo}>
          <Text style={styles.userName}>{doc.user_name}</Text>
          <Text style={styles.phoneNumber}>{doc.phone_number}</Text>
        </View>
        
        <View style={styles.docFooter}>
          <View style={styles.submittedInfo}>
            <Ionicons name="time-outline" size={12} color="#9CA3AF" />
            <Text style={styles.submittedDate}>
              {formatDateTime(doc.submitted_at)}
            </Text>
          </View>
          
          {doc.is_expired && (
            <View style={styles.expiredBadge}>
              <Ionicons name="alert-circle" size={10} color={Colors.white} />
              <Text style={styles.expiredText}>Expired</Text>
            </View>
          )}
        </View>
      </TouchableOpacity>
    );
  };

  const renderDetailsModal = () => {
    if (!selectedDocument) return null;
    
    const doc = selectedDocument;
    const isExpired = doc.is_expired;
    
    return (
      <Modal
        visible={showDetailsModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowDetailsModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.detailsModal}>
            {/* Header like Refer & Earn screen */}
            <View style={styles.modalHeader}>
              <TouchableOpacity
                style={styles.modalBackButton}
                onPress={() => setShowDetailsModal(false)}
              >
                <MaterialIcons
                  name="arrow-back-ios"
                  size={28}
                  color={Colors.orange1}
                />
              </TouchableOpacity>

              <Text style={styles.modalHeaderTitle}>Document Verification</Text>
              <TouchableOpacity 
                style={styles.modalRefreshButton}
                onPress={loadData}
                disabled={loading}
              >
                <Ionicons name="refresh" size={24} color={Colors.primary} />
              </TouchableOpacity>
            </View>
            
            <ScrollView 
              style={styles.modalContent}
              showsVerticalScrollIndicator={false}
            >
              {/* Document Status Banner */}
              <View style={[styles.statusBanner, { 
                backgroundColor: doc.status === 'approved' ? '#F0FDF4' : 
                                doc.status === 'rejected' ? '#FEF2F2' : '#FFFBEB',
                borderColor: doc.status === 'approved' ? '#A7F3D0' : 
                            doc.status === 'rejected' ? '#FECACA' : '#FDE68A'
              }]}>
                <View style={styles.statusBannerContent}>
                  <View style={styles.statusBannerIconContainer}>
                    <Ionicons 
                      name={doc.status === 'approved' ? 'checkmark-circle' : 
                            doc.status === 'rejected' ? 'close-circle' : 'time'} 
                      size={24} 
                      color={doc.status === 'approved' ? '#10B981' : 
                            doc.status === 'rejected' ? '#EF4444' : '#F59E0B'} 
                    />
                  </View>
                  <View style={styles.statusBannerTextContainer}>
                    <Text style={[styles.statusBannerTitle, {
                      color: doc.status === 'approved' ? '#065F46' : 
                            doc.status === 'rejected' ? '#991B1B' : '#92400E'
                    }]}>
                      {doc.status === 'pending' ? 'Awaiting Review' : 
                      doc.status === 'approved' ? 'Approved & Verified' : 'Rejected'}
                    </Text>
                    {doc.status === 'approved' && (
                      <Text style={styles.statusBannerSubtitle}>
                        Verified by {doc.verified_by || 'Administrator'}
                      </Text>
                    )}
                  </View>
                  
                </View>
                {doc.status === "rejected" && doc.rejection_reason && (
  <Text style={{ color: "red", marginTop: 6 }}>
    Reason: {doc.rejection_reason}
  </Text>
)}
              </View>

              {/* Document Information Section */}
              <View style={styles.sectionContainer}>
                <View style={styles.sectionHeader}>
                  <View style={styles.sectionIconContainer}>
                    <Ionicons name="document-text-outline" size={20} color="#6B7280" />
                  </View>
                  <Text style={styles.sectionTitle}>Document Information</Text>
        
                </View>
                <View style={styles.sectionDivider} />
     
                <View style={styles.detailsList}>
                  <View style={styles.detailItem}>
                    <View style={styles.detailIconContainer}>
                      <Ionicons name="document-outline" size={18} color="#6B7280" />
                    </View>
                    <View style={styles.detailContent}>
                      <Text style={styles.detailLabel}>Document Type</Text>
                      <Text style={styles.detailValue}>{getDocumentTypeName(doc.document_type)}</Text>
                    </View>
                  </View>
                  
                  <View style={styles.detailItem}>
                    <View style={styles.detailIconContainer}>
                      <Ionicons name="barcode-outline" size={18} color="#6B7280" />
                    </View>
                    <View style={styles.detailContent}>
                      <Text style={styles.detailLabel}>Document Number</Text>
                      <Text style={styles.detailValue}>{doc.document_number}</Text>
                    </View>
                  </View>
                  
                  <View style={styles.detailItem}>
                    <View style={styles.detailIconContainer}>
                      <Ionicons name="person-outline" size={18} color="#6B7280" />
                    </View>
                    <View style={styles.detailContent}>
                      <Text style={styles.detailLabel}>Document Holder Name</Text>
                      <Text style={styles.detailValue}>{doc.document_name || "Not specified"}</Text>
                    </View>
                  </View>
                  
                  {doc.document_data?.vehicle_number && (
                    <View style={styles.detailItem}>
                      <View style={styles.detailIconContainer}>
                        <Ionicons name="car-outline" size={18} color="#6B7280" />
                      </View>
                      <View style={styles.detailContent}>
                        <Text style={styles.detailLabel}>Vehicle Registration Number</Text>
                        <Text style={styles.detailValue}>{doc.document_data.vehicle_number}</Text>
                      </View>
                    </View>
                  )}
                  
                  {doc.issue_date && (
                    <View style={styles.detailItem}>
                      <View style={styles.detailIconContainer}>
                        <Ionicons name="calendar-outline" size={18} color="#6B7280" />
                      </View>
                      <View style={styles.detailContent}>
                        <Text style={styles.detailLabel}>Issue Date</Text>
                        <Text style={styles.detailValue}>{formatDate(doc.issue_date)}</Text>
                      </View>
                    </View>
                  )}
                  
                  {doc.expiry_date && (
                    <View style={[styles.detailItem, isExpired && styles.expiredDetailItem]}>
                      <View style={styles.detailIconContainer}>
                        <Ionicons name="timer-outline" size={18} color={isExpired ? "#EF4444" : "#6B7280"} />
                      </View>
                      <View style={styles.detailContent}>
                        <Text style={[styles.detailLabel, isExpired && { color: "#EF4444" }]}>
                          Expiry Date
                        </Text>
                        <Text style={[styles.detailValue, isExpired && { color: "#EF4444", fontWeight: '600' }]}>
                          {formatDate(doc.expiry_date)}
                          {isExpired && " (Document Expired)"}
                        </Text>
                      </View>
                    </View>
                  )}
                </View>
              </View>

              {/* User Information Section */}
              <View style={styles.sectionContainer}>
                <View style={styles.sectionHeader}>
                  <View style={styles.sectionIconContainer}>
                    <Ionicons name="person-circle-outline" size={20} color="#6B7280" />
                  </View>
                  <Text style={styles.sectionTitle}>User Information</Text>
                </View>
                <View style={styles.sectionDivider} />
                
                <View style={styles.detailsList}>
                  <View style={styles.detailItem}>
                    <View style={styles.detailIconContainer}>
                      <Ionicons name="person-outline" size={18} color="#6B7280" />
                    </View>
                    <View style={styles.detailContent}>
                      <Text style={styles.detailLabel}>Full Name</Text>
                      <Text style={styles.detailValue}>{doc.user_name}</Text>
                    </View>
                  </View>
                  
                  <View style={styles.detailItem}>
                    <View style={styles.detailIconContainer}>
                      <Ionicons name="call-outline" size={18} color="#6B7280" />
                    </View>
                    <View style={styles.detailContent}>
                      <Text style={styles.detailLabel}>Contact Number</Text>
                      <Text style={styles.detailValue}>{doc.phone_number}</Text>
                    </View>
                  </View>
                  
                  <View style={styles.detailItem}>
                    <View style={styles.detailIconContainer}>
                      <Ionicons name="time-outline" size={18} color="#6B7280" />
                    </View>
                    <View style={styles.detailContent}>
                      <Text style={styles.detailLabel}>Submission Date & Time</Text>
                      <Text style={styles.detailValue}>{formatDateTime(doc.submitted_at)}</Text>
                    </View>
                  </View>
                </View>
              </View>

              {/* Document Images Section - Fixed Layout */}
              <View style={styles.sectionContainer}>
                <View style={styles.sectionHeader}>
                  <View style={styles.sectionIconContainer}>
                    <Ionicons name="images-outline" size={20} color="#6B7280" />
                  </View>
                  <Text style={styles.sectionTitle}>Document Images</Text>
                </View>
                <View style={styles.sectionDivider} />
                
                <View style={styles.imagesGrid}>
                  {/* Front Image */}
                  <View style={styles.imageCard}>
                    <View style={styles.imageCardHeader}>
                      <Ionicons name="image-outline" size={18} color="#6B7280" />
                      <Text style={styles.imageCardTitle}>Front Side</Text>
                    </View>
                    <TouchableOpacity 
                      style={styles.imagePreviewContainer}
                      onPress={() => handleImagePress(getImageUrl(doc.front_image_url), "Front Side")}
                      activeOpacity={0.8}
                    >
                      <Image 
                        source={{ uri: getImageUrl(doc.front_image_url) }}
                        style={styles.imagePreview}
                        resizeMode="cover"
                      />
                      <View style={styles.imageOverlay}>
                        <View style={styles.viewFullButton}>
                          <Ionicons name="expand-outline" size={16} color={Colors.white} />
                          <Text style={styles.viewFullText}>View Full Image</Text>
                        </View>
                      </View>
                    </TouchableOpacity>
                  </View>
                  
                  {/* Back Image if exists */}
                  {doc.back_image_url && (
                    <View style={styles.imageCard}>
                      <View style={styles.imageCardHeader}>
                        <Ionicons name="image-outline" size={18} color="#6B7280" />
                        <Text style={styles.imageCardTitle}>Back Side</Text>
                      </View>
                      <TouchableOpacity 
                        style={styles.imagePreviewContainer}
                        onPress={() => handleImagePress(getImageUrl(doc.back_image_url), "Back Side")}
                        activeOpacity={0.8}
                      >
                        <Image 
                          source={{ uri: getImageUrl(doc.back_image_url) }}
                          style={styles.imagePreview}
                          resizeMode="cover"
                        />
                        <View style={styles.imageOverlay}>
                          <View style={styles.viewFullButton}>
                            <Ionicons name="expand-outline" size={16} color={Colors.white} />
                            <Text style={styles.viewFullText}>View Full Image</Text>
                          </View>
                        </View>
                      </TouchableOpacity>
                    </View>
                  )}
                  
                  {/* Selfie Image */}
                  <View style={styles.imageCard}>
                    <View style={styles.imageCardHeader}>
                      <Ionicons name="camera-outline" size={18} color="#6B7280" />
                      <Text style={styles.imageCardTitle}>Selfie with Document</Text>
                    </View>
                    <TouchableOpacity 
                      style={styles.imagePreviewContainer}
                      onPress={() => handleImagePress(getImageUrl(doc.selfie_image_url), "Selfie with Document")}
                      activeOpacity={0.8}
                    >
                      <Image 
                        source={{ uri: getImageUrl(doc.selfie_image_url) }}
                        style={styles.imagePreview}
                        resizeMode="cover"
                      />
                      <View style={styles.imageOverlay}>
                        <View style={styles.viewFullButton}>
                          <Ionicons name="expand-outline" size={16} color={Colors.white} />
                          <Text style={styles.viewFullText}>View Full Image</Text>
                        </View>
                      </View>
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
              
              {/* Rejection Reason if rejected */}
             
              {/* Approval Details if approved */}
              {doc.status === "approved" && doc.verified_at && (
                <View style={styles.approvalSection}>
                  <View style={styles.sectionHeader}>
                    <View style={styles.sectionIconContainer}>
                      <Ionicons name="checkmark-done-circle" size={20} color="#10B981" />
                    </View>
                    <Text style={[styles.sectionTitle, { color: "#10B981" }]}>Approval Details</Text>
                  </View>
                  <View style={styles.sectionDivider} />
                  <View style={styles.detailsList}>
                    <View style={styles.detailItem}>
                      <View style={styles.detailIconContainer}>
                        <Ionicons name="shield-checkmark-outline" size={18} color="#10B981" />
                      </View>
                      <View style={styles.detailContent}>
                        <Text style={styles.detailLabel}>Verified By</Text>
                        <Text style={styles.detailValue}>{doc.verified_by || "System Administrator"}</Text>
                      </View>
                    </View>
                    <View style={styles.detailItem}>
                      <View style={styles.detailIconContainer}>
                        <Ionicons name="calendar-check-outline" size={18} color="#10B981" />
                      </View>
                      <View style={styles.detailContent}>
                        <Text style={styles.detailLabel}>Verification Date & Time</Text>
                        <Text style={styles.detailValue}>{formatDateTime(doc.verified_at)}</Text>
                      </View>
                    </View>
                  </View>
                </View>
              )}
            </ScrollView>
            
            {/* Action Buttons for pending documents */}
            {doc.status === "pending" && (
              <View style={styles.actionButtons}>
                <TouchableOpacity
                  style={[styles.actionButton, styles.rejectButton]}
                  onPress={() => {
                    setShowDetailsModal(false);
                    setShowRejectModal(true);
                  }}
                  disabled={loading}
                >
                  <Ionicons name="close-circle-outline" size={20} color={Colors.white} />
                  <Text style={styles.actionButtonText}>Reject Document</Text>
                </TouchableOpacity>
                
                <TouchableOpacity
                  style={[styles.actionButton, styles.approveButton]}
                  onPress={() => handleApprove(doc.id)}
                  disabled={loading}
                >
                  <Ionicons name="checkmark-circle-outline" size={20} color={Colors.white} />
                  <Text style={styles.actionButtonText}>Approve Document</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        </View>
      </Modal>
    );
  };

  const renderImageModal = () => {
    if (!selectedImage) return null;
    
    return (
      <Modal
        visible={!!selectedImage}
        animationType="fade"
        transparent={true}
        onRequestClose={() => setSelectedImage(null)}
      >
        <View style={styles.imageModalOverlay}>
          <View style={styles.imageModalContainer}>
            <View style={styles.imageModalHeader}>
              <Text style={styles.imageModalTitle}>{selectedImage.title}</Text>
              <TouchableOpacity 
                style={styles.imageCloseButton}
                onPress={() => setSelectedImage(null)}
              >
                <Ionicons name="close" size={24} color={Colors.white} />
              </TouchableOpacity>
            </View>
            <Image 
              source={{ uri: selectedImage.uri }}
              style={styles.fullImage}
              resizeMode="contain"
            />
          </View>
        </View>
      </Modal>
    );
  };

 const renderRejectModal = () => {
  return (
    <Modal
      visible={showRejectModal}
      animationType="fade"
      transparent={true}
      onRequestClose={() => {
        setShowRejectModal(false);
        setRejectionReason("");
      }}
    >
      <View style={styles.rejectModalOverlay}>
        <TouchableOpacity 
          style={styles.rejectModalBackdrop}
          activeOpacity={1}
          onPress={() => {
            setShowRejectModal(false);
            setRejectionReason("");
          }}
        />
        
        <View style={styles.rejectModalContainer}>
          <View style={styles.rejectModalContent}>
            {/* Header */}
            <View style={styles.rejectModalHeader}>
              <View style={[styles.rejectModalIconContainer, { backgroundColor: '#FEF2F2' }]}>
                <Ionicons name="alert-circle-outline" size={isSmallScreen ? 20 : 24} color="#DC2626" />
              </View>
              <Text style={styles.rejectTitle}>
                Reject Document
              </Text>
              <Text style={styles.rejectSubtitle}>
                Please provide a detailed reason for rejecting this document
              </Text>
            </View>
            
            {/* Input Field */}
            <View style={styles.rejectInputContainer}>
              <TextInput
                style={styles.rejectInput}
                value={rejectionReason}
                onChangeText={setRejectionReason}
                placeholder="Enter detailed rejection reason..."
                placeholderTextColor="#9CA3AF"
                multiline={true}
                numberOfLines={isSmallScreen ? 3 : 4}
                textAlignVertical="top"
                autoFocus={true}
              />
              <Text style={styles.rejectInputHelper}>
                Please be specific about the issues found
              </Text>
            </View>
            
            {/* Action Buttons - Responsive Layout */}
            <View style={styles.rejectActionContainer}>
              <TouchableOpacity
                style={[styles.rejectActionButton, styles.cancelRejectButton]}
                onPress={() => {
                  setShowRejectModal(false);
                  setRejectionReason("");
                }}
                activeOpacity={0.7}
              >
                <Text style={styles.cancelRejectButtonText}>
                  Cancel
                </Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={[
                  styles.rejectActionButton, 
                  styles.confirmRejectButton,
                  (!rejectionReason.trim() || loading) && styles.confirmRejectButtonDisabled
                ]}
                onPress={() => selectedDocument && handleReject(selectedDocument.id)}
                disabled={!rejectionReason.trim() || loading}
                activeOpacity={0.7}
              >
                {loading ? (
                  <ActivityIndicator size="small" color={Colors.white} />
                ) : (
                  <>
                    <Ionicons 
                      name="close-circle-outline" 
                      size={isSmallScreen ? 16 : 18} 
                      color={Colors.white} 
                    />
                    <Text style={styles.confirmRejectButtonText}>
                      {isSmallScreen ? 'Reject' : 'Confirm Rejection'}
                    </Text>
                  </>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </View>
    </Modal>
  );
};
  const renderPagination = () => {
    if (totalPages <= 1) return null;
    
    return (
      <View style={styles.paginationContainer}>
        <TouchableOpacity
          style={[styles.paginationButton, currentPage === 1 && styles.paginationButtonDisabled]}
          onPress={() => currentPage > 1 && setCurrentPage(currentPage - 1)}
          disabled={currentPage === 1}
        >
          <Ionicons name="chevron-back" size={18} color={currentPage === 1 ? "#9CA3AF" : Colors.primary} />
          <Text style={[styles.paginationText, currentPage === 1 && { color: "#9CA3AF" }]}>
            Previous
          </Text>
        </TouchableOpacity>
        
        <View style={styles.pageIndicator}>
          <Text style={styles.pageText}>
            Page {currentPage} of {totalPages}
          </Text>
        </View>
        
        <TouchableOpacity
          style={[styles.paginationButton, currentPage === totalPages && styles.paginationButtonDisabled]}
          onPress={() => currentPage < totalPages && setCurrentPage(currentPage + 1)}
          disabled={currentPage === totalPages}
        >
          <Text style={[styles.paginationText, currentPage === totalPages && { color: "#9CA3AF" }]}>
            Next
          </Text>
          <Ionicons name="chevron-forward" size={18} color={currentPage === totalPages ? "#9CA3AF" : Colors.primary} />
        </TouchableOpacity>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar backgroundColor={Colors.white} barStyle="dark-content" />

      {/* Header like Refer & Earn screen */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <MaterialIcons
            name="arrow-back-ios"
            size={28}
            color={Colors.orange1}
          />
        </TouchableOpacity>

        <Text style={styles.headerTitle}>Admin Management</Text>
        <TouchableOpacity 
          style={styles.refreshButton}
          onPress={loadData}
          disabled={loading}
        >
          <Ionicons name="refresh" size={24} color={Colors.primary} />
        </TouchableOpacity>
      </View>

      {/* Filters */}
      <View style={styles.filterContainer}>
        <TouchableOpacity
          style={[styles.filterButton, filter === "pending" && styles.filterButtonActive]}
          onPress={() => {
            setFilter("pending");
            setCurrentPage(1);
          }}
        >
          <Ionicons 
            name="time-outline" 
            size={16} 
            color={filter === "pending" ? Colors.white : Colors.primary} 
            style={styles.filterIcon}
          />
          <Text style={[styles.filterText, filter === "pending" && styles.filterTextActive]}>
            Pending Review
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[styles.filterButton, filter === "rejected" && styles.filterButtonActive]}
          onPress={() => {
            setFilter("rejected");
            setCurrentPage(1);
          }}
        >
          <Ionicons 
            name="close-circle-outline" 
            size={16} 
            color={filter === "rejected" ? Colors.white : Colors.primary} 
            style={styles.filterIcon}
          />
          <Text style={[styles.filterText, filter === "rejected" && styles.filterTextActive]}>
            Rejected
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[styles.filterButton, filter === "all" && styles.filterButtonActive]}
          onPress={() => {
            setFilter("all");
            setCurrentPage(1);
          }}
        >
          <Ionicons 
            name="documents-outline" 
            size={16} 
            color={filter === "all" ? Colors.white : Colors.primary} 
            style={styles.filterIcon}
          />
          <Text style={[styles.filterText, filter === "all" && styles.filterTextActive]}>
            All Documents
          </Text>
        </TouchableOpacity>
      </View>

      {/* Documents List */}
      {loading && !refreshing ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={Colors.primary} />
          <Text style={styles.loadingText}>Loading Documents...</Text>
        </View>
      ) : documents.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Ionicons name="document-text-outline" size={80} color="#E5E7EB" />
          <Text style={styles.emptyTitle}>No Documents Available</Text>
          <Text style={styles.emptySubtitle}>
            {filter === "pending" 
              ? "No pending documents found" 
              : filter === "rejected"
              ? "No rejected documents found"
              : "No documents found "}
          </Text>
        </View>
      ) : (
        <ScrollView
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
          {documents.map(renderDocumentCard)}
          {renderPagination()}
        </ScrollView>
      )}

      {renderDetailsModal()}
      {renderImageModal()}
      {renderRejectModal()}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.white,
  },
  // Header like Refer & Earn screen
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 0.5,
    borderBottomColor: "#F3F4F6",
  },
  backButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: "center",
    alignItems: "center",
  },
  headerTitle: {
    ...Typography.h2,
    fontSize: 28,
    fontWeight: '700',
    color: Colors.primary,
    flex: 1,
    textAlign: 'center',
  },
  refreshButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: "center",
    alignItems: "center",
  },
  // Filters
  filterContainer: {
    flexDirection: "row",
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 12,
    backgroundColor: Colors.white,
    borderBottomWidth: 1,
    borderBottomColor: "#F3F4F6",
  },
  filterButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 10,
    marginHorizontal: 4,
    borderRadius: 12,
    backgroundColor: "#F3F4F6",
  },
  filterButtonActive: {
    backgroundColor: Colors.primary,
  },
  filterIcon: {
    marginRight: 6,
  },
  filterText: {
    fontSize: 13,
    fontWeight: "600",
    color: "#4B5563",
  },
  filterTextActive: {
    color: Colors.white,
  },
  // Document Cards
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 30,
  },
  docCard: {
    backgroundColor: Colors.white,
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
  },
  cardContent: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 16,
  },
  docTypeContainer: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  docTypeIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.primary,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  docTypeInfo: {
    flex: 1,
  },
  docTypeText: {
    fontSize: 16,
    fontWeight: "600",
    color: Colors.dark,
    marginBottom: 4,
  },
  docNumber: {
    fontSize: 14,
    color: "#6B7280",
    fontWeight: "500",
  },
  statusBadge: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    marginLeft: 8,
  },
  statusText: {
    fontSize: 12,
    fontWeight: "600",
    color: Colors.white,
    marginLeft: 4,
  },
  userInfo: {
    marginBottom: 16,
  },
  userName: {
    fontSize: 15,
    fontWeight: "600",
    color: Colors.dark,
    marginBottom: 4,
  },
  phoneNumber: {
    fontSize: 14,
    color: "#6B7280",
    fontWeight: "500",
  },
  docFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: "#F3F4F6",
  },
  submittedInfo: {
    flexDirection: "row",
    alignItems: "center",
  },
  submittedDate: {
    fontSize: 13,
    color: "#9CA3AF",
    fontWeight: "500",
    marginLeft: 6,
  },
  expiredBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#EF4444",
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 16,
  },
  expiredText: {
    fontSize: 11,
    fontWeight: "600",
    color: Colors.white,
    marginLeft: 4,
  },
  // Loading & Empty States
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: Colors.white,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: "#6B7280",
    fontWeight: "500",
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 40,
    backgroundColor: Colors.white,
  },
  emptyTitle: {
    fontSize: 22,
    fontWeight: "700",
    color: Colors.dark,
    marginTop: 2,
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 16,
    color: "#6B7280",
    textAlign: "center",
    lineHeight: 24,
    fontWeight: "500",
  },
  // Pagination
  paginationContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 20,
    borderTopWidth: 1,
    borderTopColor: "#E5E7EB",
    marginTop: 8,
    backgroundColor: Colors.white,
    borderRadius: 16,
    paddingHorizontal: 20,
    marginHorizontal: -4,
  },
  paginationButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: Colors.primary,
    borderRadius: 10,
    backgroundColor: Colors.white,
  },
  paginationButtonDisabled: {
    borderColor: "#E5E7EB",
    backgroundColor: "#F9FAFB",
  },
  paginationText: {
    fontSize: 14,
    fontWeight: "600",
    color: Colors.primary,
    marginHorizontal: 6,
  },
  pageIndicator: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: "#F3F4F6",
    borderRadius: 8,
  },
  pageText: {
    fontSize: 14,
    color: "#4B5563",
    fontWeight: '600',
  },
  // Modal
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "flex-end",
  },
  detailsModal: {
    backgroundColor: Colors.white,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: height * 0.9,
    width: '100%',
  },
  // Modal Header like Refer & Earn screen
  modalHeader: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 0.5,
    borderBottomColor: "#F3F4F6",
  },
  modalBackButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: "center",
    alignItems: "center",
  },
  modalHeaderTitle: {
    ...Typography.h2,
    fontSize: 28,
    fontWeight: '700',
    color: Colors.primary,
    flex: 1,
    textAlign: 'center',
  },
  modalRefreshButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: {
    padding: 24,
    paddingBottom: 120,
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
    marginRight: 16,
  },
  statusBannerTextContainer: {
    flex: 1,
  },
  statusBannerTitle: {
    fontSize: 18,
    fontWeight: "700",
    marginBottom: 4,
  },
  statusBannerSubtitle: {
    fontSize: 14,
    color: "#6B7280",
    fontWeight: "500",
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
  sectionTitle: {
    fontSize: 17,
    fontWeight: "600",
    color: "#6B7280",
  },
  detailsList: {
    marginLeft: 4,
  },
  detailItem: {
    flexDirection: "row",
    marginBottom: 20,
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
    marginRight: 12,
    borderWidth: 1,
    borderColor: "#E5E7EB",
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
  detailValue: {
    fontSize: 16,
    color: Colors.dark,
    fontWeight: "600",
  },
  // Images Grid Layout
  imagesGrid: {
    marginTop: 8,
  },
  imageCard: {
    marginBottom: 20,
  },
  imageCardHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  imageCardTitle: {
    fontSize: 15,
    fontWeight: "600",
    color: Colors.dark,
    marginLeft: 8,
  },
  imagePreviewContainer: {
    backgroundColor: "#F9FAFB",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    overflow: "hidden",
    position: 'relative',
  },
  imagePreview: {
    width: "100%",
    height: 200,
    backgroundColor: "#F3F4F6",
  },
  imageOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    paddingVertical: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  viewFullButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.primary,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  viewFullText: {
    fontSize: 14,
    fontWeight: "600",
    color: Colors.white,
    marginLeft: 6,
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
  rejectionText: {
    fontSize: 15,
    color: Colors.dark,
    lineHeight: 22,
    fontWeight: "500",
  },
  // Approval Section
  approvalSection: {
    backgroundColor: "#F0FDF4",
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "#A7F3D0",
  },
  // Action Buttons
  actionButtons: {
    flexDirection: "row",
    justifyContent: "space-between",
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: "#F3F4F6",
    backgroundColor: Colors.white,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
  },
  actionButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    padding: 16,
    borderRadius: 12,
    marginHorizontal: 8,
  },
  rejectButton: {
    backgroundColor: "#DC2626",
  },
  approveButton: {
    backgroundColor: "#10B981",
  },
  actionButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: Colors.white,
    marginLeft: 8,
  },
  // Image Modal
  imageModalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.9)",
    justifyContent: "center",
    alignItems: "center",
  },
  imageModalContainer: {
    width: width - 40,
    height: height - 100,
    backgroundColor: "#000",
    borderRadius: 0,
    overflow: "hidden",
  },
  imageModalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 20,
    backgroundColor: "rgba(0, 0, 0, 0.8)",
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 1,
  },
  imageModalTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: Colors.white,
    flex: 1,
  },
  imageCloseButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(255, 255, 255, 0.1)",
  },
  fullImage: {
    width: "100%",
    height: "100%",
  },
  // Reject Modal
  rejectModal: {
    backgroundColor: Colors.white,
    borderRadius: 24,
    padding: 24,
    margin: 20,
    maxWidth: 500,
    alignSelf: 'center',
    width: width - 40,
  },


  rejectButtons: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
 
  cancelButton: {
    backgroundColor: "#F3F4F6",
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#4B5563",
    textAlign: "center",
  },
 
// Reject Modal Styles
rejectModalOverlay: {
  flex: 1,
  backgroundColor: 'rgba(0, 0, 0, 0.6)',
  justifyContent: 'center',
  alignItems: 'center',
  paddingHorizontal: isSmallScreen ? 16 : 24,
},
rejectModalBackdrop: {
  position: 'absolute',
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
},
rejectModalContainer: {
  width: '100%',
  maxWidth: 500,
  borderRadius: isSmallScreen ? 16 : 20,
  backgroundColor: Colors.white,
  overflow: 'hidden',
  shadowColor: '#000',
  shadowOffset: {
    width: 0,
    height: 4,
  },
  shadowOpacity: 0.3,
  shadowRadius: 12,
  elevation: 10,
},
rejectModalContent: {
  padding: isSmallScreen ? 20 : 24,
},

// Reject Modal Header
rejectModalHeader: {
  alignItems: 'center',
  marginBottom: isSmallScreen ? 20 : 24,
},
rejectModalIconContainer: {
  width: isSmallScreen ? 48 : 56,
  height: isSmallScreen ? 48 : 56,
  borderRadius: isSmallScreen ? 24 : 28,
  justifyContent: 'center',
  alignItems: 'center',
  marginBottom: isSmallScreen ? 12 : 16,
  borderWidth: 1,
  borderColor: '#FECACA',
},
rejectTitle: {
  fontSize: isSmallScreen ? 20 : 24,
  fontWeight: '700',
  color: Colors.dark,
  marginBottom: isSmallScreen ? 6 : 8,
  textAlign: 'center',
},
rejectSubtitle: {
  fontSize: isSmallScreen ? 14 : 15,
  color: '#6B7280',
  textAlign: 'center',
  lineHeight: isSmallScreen ? 20 : 22,
  fontWeight: '500',
},

// Reject Input
rejectInputContainer: {
  marginBottom: isSmallScreen ? 20 : 24,
},
rejectInput: {
  borderWidth: 1,
  borderColor: '#E5E7EB',
  borderRadius: isSmallScreen ? 10 : 12,
  padding: isSmallScreen ? 14 : 16,
  fontSize: isSmallScreen ? 14 : 15,
  color: Colors.dark,
  backgroundColor: '#F9FAFB',
  minHeight: isSmallScreen ? 100 : 120,
  textAlignVertical: 'top',
  lineHeight: isSmallScreen ? 20 : 22,
},
rejectInputHelper: {
  fontSize: isSmallScreen ? 12 : 13,
  color: '#9CA3AF',
  marginTop: 8,
  fontWeight: '500',
},

// Reject Action Buttons - Responsive
rejectActionContainer: {
  flexDirection: isSmallScreen ? 'column' : 'row',
  justifyContent: 'space-between',
  gap: isSmallScreen ? 12 : 16,
},
rejectActionButton: {
  flex: isSmallScreen ? null : 1,
  padding: isSmallScreen ? 14 : 16,
  borderRadius: isSmallScreen ? 10 : 12,
  flexDirection: 'row',
  alignItems: 'center',
  justifyContent: 'center',
  minHeight: isSmallScreen ? 48 : 52,
},
cancelRejectButton: {
  backgroundColor: '#F3F4F6',
  borderWidth: 1,
  borderColor: '#E5E7EB',
},
cancelRejectButtonText: {
  fontSize: isSmallScreen ? 15 : 16,
  fontWeight: '600',
  color: '#4B5563',
  textAlign: 'center',
},
confirmRejectButton: {
  backgroundColor: '#DC2626',
  borderWidth: 1,
  borderColor: '#B91C1C',
},
confirmRejectButtonDisabled: {
  backgroundColor: '#FCA5A5',
  borderColor: '#FCA5A5',
},
confirmRejectButtonText: {
  fontSize: isSmallScreen ? 15 : 16,
  fontWeight: '600',
  color: Colors.white,
  textAlign: 'center',
  marginLeft: isSmallScreen ? 6 : 8,
},
});