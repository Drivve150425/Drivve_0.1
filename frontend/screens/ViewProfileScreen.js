// import React, { useState, useCallback } from 'react';
// import {
//   View,
//   Text,
//   StyleSheet,
//   TouchableOpacity,
//   ScrollView,
//   StatusBar,
//   Image,
//   Dimensions,
//   Platform,
//   Modal,
//   TouchableWithoutFeedback,
// } from 'react-native';
// import { SafeAreaView } from 'react-native-safe-area-context';
// import { Ionicons, MaterialIcons, MaterialCommunityIcons } from '@expo/vector-icons';
// import { LinearGradient } from 'expo-linear-gradient';
// import { useFocusEffect } from '@react-navigation/native';
// import LottieView from "lottie-react-native";
// import { SvgCssUri } from 'react-native-svg/css';

// import { Colors } from '../constants/Colors';
// import { API_BASE_URL } from '../config/config_ip';
// import { useAuth } from '../context/AuthContext';
// import CustomAlert from '../components/CustomAlert';

// const { width, height } = Dimensions.get('window');

// // ─── Helpers ──────────────────────────────────────────────────────────────────

// function buildImageUrl(url) {
//   if (!url) return null;
//   if (url.startsWith('http://') || url.startsWith('https://')) return url;
//   return `${API_BASE_URL}${url.startsWith('/') ? '' : '/'}${url}`;
// }

// function getInitials(name) {
//   if (!name) return 'U';
//   const parts = name.trim().split(' ').filter(Boolean);
//   if (parts.length > 1) return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
//   return parts[0].slice(0, 2).toUpperCase();
// }

// function formatJoinDate(dateString) {
//   if (!dateString) return 'Recently joined';
//   try {
//     const date = new Date(dateString);
//     return date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
//   } catch {
//     return 'Recently joined';
//   }
// }

// function formatReviewDate(dateString) {
//   if (!dateString) return '';
//   try {
//     const date = new Date(dateString);
//     return date.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
//   } catch {
//     return '';
//   }
// }

// // In ViewProfileScreen.js, update the fetchPublicProfile function
// async function fetchPublicProfile(phoneNumber, userId) {
//   try {
//     const params = new URLSearchParams();
    
//     // Use the values as-is (don't modify them)
//     if (userId) {
//       params.append('user_id', userId);
//     } else if (phoneNumber) {
//       params.append('phone_number', phoneNumber);
//     } else {
//       return null;
//     }
    
//     const url = `${API_BASE_URL}/api/v1/users/profile-public?${params.toString()}`;
//     console.log('Fetching profile from:', url);
    
//     const res = await fetch(url, { 
//       headers: { 
//         'Accept': 'application/json',
//         'Content-Type': 'application/json'
//       } 
//     });
    
//     if (!res.ok) {
//       console.log('Profile fetch failed with status:', res.status);
//       return null;
//     }
    
//     const data = await res.json();
//     console.log('Profile data received:', JSON.stringify(data, null, 2));
//     return data;
//   } catch (e) {
//     console.log('fetchPublicProfile error:', e);
//     return null;
//   }
// }
// // ─── Fetch user documents for verification status ───────────────────────────

// async function fetchUserDocuments(phoneNumber) {
//   try {
//     const url = `${API_BASE_URL}/api/v1/documents/user/${phoneNumber}`;
//     console.log('Fetching documents from:', url);
//     const res = await fetch(url, { headers: { Accept: 'application/json' } });
//     if (!res.ok) {
//       console.log('Documents fetch failed with status:', res.status);
//       return null;
//     }
//     const data = await res.json();
//     console.log('Documents data received:', JSON.stringify(data, null, 2));
//     return data;
//   } catch (e) {
//     console.log('fetchUserDocuments error:', e);
//     return null;
//   }
// }

// // ─── Fetch user preferences directly (fallback if not in profile) ───────────

// async function fetchUserPreferences(phoneNumber) {
//   try {
//     const url = `${API_BASE_URL}/api/v1/matching-preferences/user?phone_number=${phoneNumber}`;
//     const res = await fetch(url);
//     if (!res.ok) return null;
//     const data = await res.json();
//     console.log('Direct preferences fetched:', data);
//     return data;
//   } catch (e) {
//     console.log('fetchUserPreferences error:', e);
//     return null;
//   }
// }

// // ─── Sub-components ───────────────────────────────────────────────────────────

// function StarRow({ rating, size = 14, color = '#F59E0B' }) {
//   return (
//     <View style={{ flexDirection: 'row', gap: 2 }}>
//       {[1, 2, 3, 4, 5].map((i) => (
//         <Ionicons
//           key={i}
//           name={i <= Math.round(rating) ? 'star' : 'star-outline'}
//           size={size}
//           color={color}
//         />
//       ))}
//     </View>
//   );
// }

// function SectionCard({ children, style }) {
//   return <View style={[styles.sectionCard, style]}>{children}</View>;
// }

// function SectionTitle({ title }) {
//   return <Text style={styles.sectionTitle}>{title}</Text>;
// }

// function BadgeItem({ icon, iconColor, bgColor, title, desc }) {
//   return (
//     <View style={styles.badgeItem}>
//       <View style={[styles.badgeIconCircle, { backgroundColor: bgColor }]}>
//         <Ionicons name={icon} size={20} color={iconColor} />
//       </View>
//       <View style={{ flex: 1 }}>
//         <Text style={styles.badgeTitle}>{title}</Text>
//         <Text style={styles.badgeDesc}>{desc}</Text>
//       </View>
//     </View>
//   );
// }

// function StatItem({ icon, value, label }) {
//   return (
//     <View style={styles.statItem}>
//       <View style={styles.statIconCircle}>
//         <Ionicons name={icon} size={20} color="#1A56DB" />
//       </View>
//       <Text style={styles.statValue}>{value}</Text>
//       <Text style={styles.statLabel}>{label}</Text>
//     </View>
//   );
// }

// // Generic Preference Item - Dynamically shows any preference from API
// function GenericPrefItem({ prefKey, value }) {
//   // Get icon based on preference key
//   const getIconForPreference = (key) => {
//     const icons = {
//       'music': 'musical-notes-outline',
//       'ac': 'snow-outline',
//       'pets': 'paw-outline',
//       'smoking': 'flame-outline',
//       'speak_languages': 'chatbubbles-outline',
//       'chat_level': 'chatbox-outline',
//       'age_category': 'people-outline',
//       'detours': 'map-outline',
//       'helmet_policy_driver': 'hard-hat-outline',
//       'gender_preference': 'male-female-outline',
//       'verified_profiles_only': 'shield-checkmark-outline'
//     };
//     return icons[key] || 'options-outline';
//   };

//   // Format display value
//   const formatDisplayValue = (val) => {
//     if (typeof val === 'boolean') {
//       return val ? 'Yes' : 'No';
//     }
//     if (typeof val === 'string') {
//       return val;
//     }
//     if (Array.isArray(val)) {
//       return val.join(', ');
//     }
//     return val ? 'Enabled' : 'Disabled';
//   };

//   // Format key for display - convert snake_case to Title Case
//   const formatKeyForDisplay = (key) => {
//     return key.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
//   };

//   const isEnabled = typeof value === 'boolean' ? value : true;

//   return (
//     <View style={[styles.genericPrefItem, { backgroundColor: isEnabled ? '#F0FDF4' : '#FEF2F2' }]}>
//       <Ionicons name={getIconForPreference(prefKey)} size={20} color={isEnabled ? '#10B981' : '#EF4444'} />
//       <View style={styles.genericPrefContent}>
//         <Text style={styles.genericPrefLabel}>{formatKeyForDisplay(prefKey)}</Text>
//         <Text style={[styles.genericPrefValue, { color: isEnabled ? '#10B981' : '#EF4444' }]}>
//           {formatDisplayValue(value)}
//         </Text>
//       </View>
//     </View>
//   );
// }

// function ReviewItem({ review, onImagePress }) {
//   const reviewerPhotoUrl = buildImageUrl(review.reviewer_photo);
//   const isSvg = reviewerPhotoUrl ? reviewerPhotoUrl.toLowerCase().includes('.svg') : false;
  
//   return (
//     <View style={styles.reviewItem}>
//       <View style={styles.reviewHeader}>
//         <TouchableOpacity onPress={() => reviewerPhotoUrl && onImagePress && onImagePress(reviewerPhotoUrl, review.reviewer_name)}>
//           <View style={styles.reviewAvatar}>
//             {reviewerPhotoUrl ? (
//               isSvg ? (
//                 <View style={styles.reviewSvgContainer}>
//                   <SvgCssUri
//                     uri={reviewerPhotoUrl}
//                     width={40}
//                     height={40}
//                     onError={(e) => console.log('Reviewer SVG load error:', e)}
//                   />
//                 </View>
//               ) : (
//                 <Image 
//                   source={{ uri: reviewerPhotoUrl }} 
//                   style={styles.reviewAvatarImg}
//                   onError={(e) => console.log('Reviewer image load error:', e.nativeEvent.error)}
//                 />
//               )
//             ) : (
//               <Text style={styles.reviewAvatarText}>{getInitials(review.reviewer_name)}</Text>
//             )}
//           </View>
//         </TouchableOpacity>
//         <View style={{ flex: 1 }}>
//           <Text style={styles.reviewName}>{review.reviewer_name || 'Anonymous'}</Text>
//           <View style={styles.reviewMeta}>
//             {review.route && (
//               <Text style={styles.reviewRoute}>
//                 <Ionicons name="location-outline" size={11} color="#9CA3AF" /> {review.route}
//               </Text>
//             )}
//             {review.date && (
//               <Text style={styles.reviewDate}>
//                 <Ionicons name="calendar-outline" size={11} color="#9CA3AF" /> {formatReviewDate(review.date)}
//               </Text>
//             )}
//           </View>
//         </View>
//         <StarRow rating={review.rating || 5} size={13} />
//       </View>
//       {review.comment && <Text style={styles.reviewComment}>{review.comment}</Text>}
//     </View>
//   );
// }

// // ─── Image Preview Modal Component with SVG support ───────────────────────────

// function ImagePreviewModal({ visible, imageUrl, driverName, onClose }) {
//   const [isSvg, setIsSvg] = useState(false);
  
//   React.useEffect(() => {
//     if (imageUrl) {
//       setIsSvg(imageUrl.toLowerCase().includes('.svg'));
//     }
//   }, [imageUrl]);
  
//   if (!visible) return null;
  
//   return (
//     <Modal
//       visible={visible}
//       transparent={true}
//       animationType="fade"
//       onRequestClose={onClose}
//     >
//       <TouchableOpacity 
//         style={styles.modalBackdrop}
//         activeOpacity={1}
//         onPress={onClose}
//       >
//         <View style={styles.imageModalContainer}>
//           <View style={styles.imageModalContent}>
//             <View style={styles.imageModalHeader}>
//               <Text style={styles.imageModalTitle}>{driverName || 'Profile Photo'}</Text>
//               <TouchableOpacity onPress={onClose}>
//                 <Ionicons name="close" size={24} color={Colors.dark} />
//               </TouchableOpacity>
//             </View>
//             {imageUrl && imageUrl !== 'null' && imageUrl !== 'undefined' ? (
//               isSvg ? (
//                 <View style={styles.modalSvgContainer}>
//                   <SvgCssUri
//                     uri={imageUrl}
//                     width="100%"
//                     height={400}
//                     onError={(e) => console.log('Modal SVG load error:', e)}
//                     onLoad={() => console.log('Modal SVG loaded successfully')}
//                   />
//                 </View>
//               ) : (
//                 <Image
//                   source={{ uri: imageUrl }}
//                   style={styles.fullProfileImage}
//                   resizeMode="contain"
//                   onError={(e) => console.log('Modal Image load error:', e.nativeEvent.error, 'URL:', imageUrl)}
//                   onLoad={() => console.log('Modal Image loaded successfully:', imageUrl)}
//                 />
//               )
//             ) : (
//               <View style={styles.noImageContainer}>
//                 <Text style={styles.noImageText}>No image available</Text>
//               </View>
//             )}
//           </View>
//         </View>
//       </TouchableOpacity>
//     </Modal>
//   );
// }

// // ─── Main Screen ──────────────────────────────────────────────────────────────

// export default function ViewProfileScreen({ navigation, route }) {
//   const { phoneNumber, userId, driverName } = route.params || {};
//   const { user: currentUser } = useAuth();

//   const [profile, setProfile] = useState(null);
//   const [documents, setDocuments] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [verifiedDocuments, setVerifiedDocuments] = useState([]);
//   const [error, setError] = useState(null);
//   const [travelPreferences, setTravelPreferences] = useState({});
  
//   // Image preview modal state
//   const [previewVisible, setPreviewVisible] = useState(false);
//   const [previewImageUrl, setPreviewImageUrl] = useState(null);
//   const [previewTitle, setPreviewTitle] = useState('');

//   // Custom Alert states
//   const [alertVisible, setAlertVisible] = useState(false);
//   const [alertConfig, setAlertConfig] = useState({
//     title: "",
//     message: "",
//     icon: "check-circle",
//     iconColor: "#10B981",
//     buttons: []
//   });

//   const showCustomAlert = (title, message, type = 'success') => {
//     let icon = "check-circle";
//     let iconColor = "#10B981";
    
//     if (type === 'error') {
//       icon = "error";
//       iconColor = "#EF4444";
//     } else if (type === 'warning') {
//       icon = "warning";
//       iconColor = "#F59E0B";
//     } else if (type === 'info') {
//       icon = "info";
//       iconColor = "#1A56DB";
//     }
    
//     setAlertConfig({
//       title,
//       message,
//       icon,
//       iconColor,
//       buttons: [{ text: 'OK', onPress: () => setAlertVisible(false) }]
//     });
//     setAlertVisible(true);
//   };

//   const showConfirmationAlert = (title, message, onConfirm) => {
//     setAlertConfig({
//       title,
//       message,
//       icon: "warning",
//       iconColor: "#F59E0B",
//       buttons: [
//         { text: 'Cancel', onPress: () => setAlertVisible(false), style: 'cancel' },
//         { text: 'Report', onPress: () => {
//           setAlertVisible(false);
//           onConfirm();
//         }, style: 'destructive' }
//       ]
//     });
//     setAlertVisible(true);
//   };

//   // Helper to check which documents are verified
//   const checkVerifiedDocuments = (docs) => {
//     if (!docs || !docs.length) return [];
    
//     const verified = docs.filter(doc => {
//       const docType = doc.document_type?.toLowerCase();
//       const status = doc.status?.toUpperCase();
//       return status === 'APPROVED' && ['aadhar', 'dl', 'rc'].includes(docType);
//     });
    
//     return verified.map(doc => doc.document_type?.toLowerCase());
//   };

//   // Get document display name
//   const getDocumentDisplayName = (docType) => {
//     const names = {
//       'aadhar': 'Aadhar Card',
//       'dl': 'Driving License',
//       'rc': 'Registration Certificate'
//     };
//     return names[docType] || docType;
//   };

//   // Get document icon
//   const getDocumentIcon = (docType) => {
//     const icons = {
//       'aadhar': 'card-outline',
//       'dl': 'car-outline',
//       'rc': 'document-text-outline'
//     };
//     return icons[docType] || 'document-outline';
//   };

//   // Image click handlers
//   const handleProfileImagePress = () => {
//     if (profileImageUrl) {
//       setPreviewImageUrl(profileImageUrl);
//       setPreviewTitle(userFullName);
//       setPreviewVisible(true);
//     }
//   };

//   const handleVehicleImagePress = (imageUrl) => {
//     if (imageUrl) {
//       setPreviewImageUrl(buildImageUrl(imageUrl));
//       setPreviewTitle('Vehicle Photo');
//       setPreviewVisible(true);
//     }
//   };

//   const handleReviewerImagePress = (imageUrl, reviewerName) => {
//     if (imageUrl) {
//       setPreviewImageUrl(imageUrl);
//       setPreviewTitle(reviewerName || 'Reviewer');
//       setPreviewVisible(true);
//     }
//   };

//   const loadProfile = useCallback(async () => {
//     setLoading(true);
//     setError(null);
    
//     try {
//       // Fetch profile data
//       const profileData = await fetchPublicProfile(phoneNumber, userId);
//       console.log('Profile API response:', profileData);
      
//       if (profileData?.success && profileData.user) {
//         setProfile(profileData.user);
        
//         // Handle travel preferences from profile - use directly from API
//         if (profileData.user.travel_preferences) {
//           console.log('Travel preferences from profile:', profileData.user.travel_preferences);
//           setTravelPreferences(profileData.user.travel_preferences);
//         } else {
//           // Fallback: fetch preferences directly if not in profile
//           const targetPhone = phoneNumber || profileData.user?.phone_number;
//           if (targetPhone) {
//             const prefsData = await fetchUserPreferences(targetPhone);
//             if (prefsData) {
//               console.log('Travel preferences from direct API:', prefsData);
//               setTravelPreferences(prefsData);
//             }
//           }
//         }
        
//         // Fetch user documents for verification status
//         const targetPhone = phoneNumber || profileData.user?.phone_number;
//         if (targetPhone) {
//           const docsData = await fetchUserDocuments(targetPhone);
//           console.log('Documents API response:', docsData);
          
//           if (docsData?.success && docsData.documents) {
//             setDocuments(docsData.documents);
//             const verified = checkVerifiedDocuments(docsData.documents);
//             console.log('Verified documents found:', verified);
//             setVerifiedDocuments(verified);
//           } else {
//             console.log('No documents found or API failed');
//             setDocuments([]);
//             setVerifiedDocuments([]);
//           }
//         }
//       } else {
//         console.log('Profile not found or API failed');
//         setError('Profile not found');
//       }
//     } catch (err) {
//       console.error('Load profile error:', err);
//       setError('Failed to load profile');
//     } finally {
//       setLoading(false);
//     }
//   }, [phoneNumber, userId]);

//   useFocusEffect(useCallback(() => { loadProfile(); }, [loadProfile]));

//   const handleBack = () => navigation.goBack();

//   const getOrCreateConversation = async (receiverPhone) => {
//     try {
//       const myPhone = currentUser?.phone_number;
//       if (!myPhone) {
//         showCustomAlert('Login Required', 'Please log in to use chat.', 'warning');
//         return null;
//       }
//       const response = await fetch(`${API_BASE_URL}/api/chat/conversations`, {
//         method: 'POST',
//         headers: {
//           'X-Phone-Number': myPhone,
//           'Content-Type': 'application/json',
//         },
//         body: JSON.stringify({ participant_phone: receiverPhone }),
//       });
//       const data = await response.json();
//       if (data.success) {
//         return data.conversation.id;
//       }
//       console.error('Failed to create conversation:', data);
//       return null;
//     } catch (error) {
//       console.error('getOrCreateConversation error:', error);
//       return null;
//     }
//   };

//   const handleStartChat = async () => {
//     if (profile?.phone_number) {
//       const conversationId = await getOrCreateConversation(profile.phone_number);
//       if (conversationId) {
//         navigation.navigate('ChatScreen', {
//           receiverPhone: profile.phone_number,
//           conversationId,
//           user: {
//             name: profile.full_name || driverName || 'User',
//             tripInfo: 'Active',
//           },
//         });
//       } else {
//         showCustomAlert('Chat', 'Unable to start chat. Please try again.', 'error');
//       }
//     } else {
//       showCustomAlert('Chat', 'Phone number not available', 'warning');
//     }
//   };

//   const handleReport = () => {
//     showConfirmationAlert(
//       'Report User',
//       'Are you sure you want to report this user?',
//       () => {
//         showCustomAlert('Reported', 'Thank you for your report. Our team will review it.', 'success');
//       }
//     );
//   };

//   // Check if user is verified
//   const isVerified = verifiedDocuments.length > 0;

//   const profileImageUrl = buildImageUrl(profile?.profile_picture);
//   const isProfilePhotoSvg = profileImageUrl ? profileImageUrl.toLowerCase().includes('.svg') : false;
//   const userFullName = profile?.full_name || driverName || 'User';
//   const initials = getInitials(userFullName);
//   const joinDateText = formatJoinDate(profile?.created_at);
//   const rating = profile?.avg_rating ?? 0;
//   const totalRatings = profile?.total_ratings ?? 0;
  
//   // About data - fetch from profile
//   const aboutText = profile?.about || profile?.bio || 'I am happy to share the ride. Lets Drivve!';
  
//   const vehicle = profile?.vehicle;
//   const vehicleName = vehicle ? [ vehicle.model].filter(Boolean).join(' ') : null;
//   const reviews = profile?.reviews || [];
//   const stats = profile?.stats || {};
//   const trustScore = rating.toFixed(1);
//   const trustDots = Math.round(rating);

//   if (loading) {
//     return (
//       <SafeAreaView style={styles.container}>
//         <StatusBar barStyle="dark-content" backgroundColor={Colors.white} />
//         <View style={styles.loaderContainer}>
//           <LottieView
//             source={require("../assets/loading.json")}
//             autoPlay
//             loop
//             style={{ width: 300, height: 300 }}
//           />
//         </View>
//       </SafeAreaView>
//     );
//   }

//   if (error || !profile) {
//     return (
//       <SafeAreaView style={styles.container}>
//         <StatusBar barStyle="dark-content" backgroundColor={Colors.white} />
//         <View style={styles.header}>
//           <TouchableOpacity style={styles.backBtn} onPress={handleBack}>
//             <MaterialIcons name="arrow-back-ios" size={22} color="#1A56DB" />
//           </TouchableOpacity>
//           <Text style={styles.headerTitle}>Profile</Text>
//           <View style={styles.backBtn} />
//         </View>
//         <View style={styles.errorWrap}>
//           <Ionicons name="person-outline" size={64} color="#D1D5DB" />
//           <Text style={styles.errorTitle}>Profile not found</Text>
//           <Text style={styles.errorSub}>{error || "We couldn't load this user's profile."}</Text>
//           <TouchableOpacity style={styles.retryBtn} onPress={loadProfile}>
//             <Text style={styles.retryBtnText}>Retry</Text>
//           </TouchableOpacity>
//         </View>
//       </SafeAreaView>
//     );
//   }

//   return (
//     <SafeAreaView style={styles.container} edges={['left', 'right']}>
//       <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />

//       <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>

//         {/* ── 1. PROFILE HEADER CARD ── */}
//         <View style={styles.headerWrapper}>
//           <LinearGradient
//             colors={['#1A56DB', '#0D3A6F']}
//             start={{ x: 0, y: 0 }}
//             end={{ x: 1, y: 1 }}
//             style={StyleSheet.absoluteFillObject}
//           />

//           <Image
//             source={require('../assets/s8.png')}
//             style={styles.headerBgImage}
//             resizeMode="cover"
//           />

//           <TouchableOpacity style={styles.backBtnLight} onPress={handleBack}>
//             <MaterialIcons name="arrow-back-ios" size={22} color="#fff" />
//           </TouchableOpacity>

//           <View style={styles.headerContent}>
//             <TouchableOpacity onPress={handleProfileImagePress}>
//               <View style={styles.profileImageContainer}>
//                 {profileImageUrl ? (
//                   isProfilePhotoSvg ? (
//                     <View style={styles.svgProfileContainer}>
//                       <SvgCssUri
//                         uri={profileImageUrl}
//                         width={100}
//                         height={100}
//                         onError={(e) => console.log('Profile SVG load error:', e)}
//                       />
//                     </View>
//                   ) : (
//                     <Image 
//                       source={{ uri: profileImageUrl }} 
//                       style={styles.profileImage}
//                       onError={(e) => console.log('Profile image load error:', e.nativeEvent.error)}
//                     />
//                   )
//                 ) : (
//                   <View style={styles.initialsCircle}>
//                     <Text style={styles.initialsText}>{initials}</Text>
//                   </View>
//                 )}
//                 {isVerified && (
//                   <View style={styles.verifiedBadge}>
//                     <Ionicons name="checkmark-circle" size={24} color="#22C55E" />
//                   </View>
//                 )}
//               </View>
//             </TouchableOpacity>

//             <Text style={styles.profileName}>{userFullName}</Text>

//             {isVerified && (
//               <View style={styles.verifiedLabelContainer}>
//                 <Ionicons name="shield-checkmark" size={14} color="#22C55E" />
//                 <Text style={styles.verifiedLabelText}>Verified Profile</Text>
//               </View>
//             )}

//             <View style={styles.ratingRow}>
//               <Ionicons name="star" size={16} color="#FFD700" />
//               <Text style={styles.ratingText}>{rating > 0 ? rating.toFixed(1) : 'New'}</Text>
//               <Text style={styles.ratingCount}>· {totalRatings} rides</Text>
//             </View>

//             <Text style={styles.memberSince}>Member since {joinDateText}</Text>
//           </View>
//         </View>

//         {/* ── 2. TRUST SCORE ── */}
//         <SectionCard>
//           <View style={styles.trustRow}>
//             <View style={styles.trustLeft}>
//               <View style={styles.trustIconCircle}>
//                 <MaterialCommunityIcons name="trophy-outline" size={20} color="#F59E0B" />
//               </View>
//               <View>
//                 <Text style={styles.trustLabel}>Trust Score</Text>
//                 <Text style={styles.trustSubLabel}>
//                   {trustDots >= 4 ? 'Excellent' : trustDots >= 3 ? 'Good' : 'Fair'}
//                 </Text>
//               </View>
//             </View>
//             <View style={styles.trustRight}>
//               <View style={styles.trustStars}>
//                 {[1, 2, 3, 4, 5].map((i) => (
//                   <Ionicons key={i} name={i <= trustDots ? 'star' : 'star-outline'} size={18} color="#F59E0B" />
//                 ))}
//               </View>
//               <View style={styles.trustScoreBadge}>
//                 <Text style={styles.trustScoreNum}>{trustScore}</Text>
//                 <Text style={styles.trustScoreOf}>/5</Text>
//               </View>
//             </View>
//           </View>
//         </SectionCard>

//         {/* ── 3. VERIFICATION DETAILS (if verified) ── */}
//         {isVerified && verifiedDocuments.length > 0 && (
//           <SectionCard>
//             <SectionTitle title="Verification Details" />
//             <Text style={styles.verificationInfoText}>
//               This user is verified through:
//             </Text>
//             <View style={styles.verifiedDocsContainer}>
//               {verifiedDocuments.map((docType, index) => (
//                 <View key={index} style={styles.verifiedDocItem}>
//                   <View style={styles.verifiedDocIcon}>
//                     <Ionicons name={getDocumentIcon(docType)} size={20} color="#22C55E" />
//                   </View>
//                   <Text style={styles.verifiedDocText}>
//                     {getDocumentDisplayName(docType)}
//                   </Text>
//                 </View>
//               ))}
//             </View>
//           </SectionCard>
//         )}

//         {/* ── 4. BADGES ── */}
//         <SectionCard>
//           <SectionTitle title="Badges & Achievements" />
//           <View style={styles.badgesRow}>
//             {isVerified && (
//               <BadgeItem icon="shield-checkmark-outline" iconColor="#1A56DB" bgColor="#EFF6FF" title="Identity Verified" desc="Successfully verified identity with government ID." />
//             )}
//             {rating >= 4.5 && totalRatings > 0 && (
//               <BadgeItem icon="star-outline" iconColor="#F59E0B" bgColor="#FFFBEB" title="Top Rated" desc={`Average rating of ${rating.toFixed(1)} stars from ${totalRatings} reviews.`} />
//             )}
//             {stats.posted_rides >= 50 && (
//               <BadgeItem icon="car-outline" iconColor="#10B981" bgColor="#ECFDF5" title="Experienced" desc="Completed 50+ rides on the platform." />
//             )}
//             {!isVerified && rating < 4.5 && (!stats.posted_rides || stats.posted_rides < 50) && (
//               <Text style={styles.noBadgeText}>No badges yet. Keep riding to earn them!</Text>
//             )}
//           </View>
//         </SectionCard>

//         {/* ── 5. STATISTICS ── */}
//         <SectionCard>
//           <SectionTitle title="Statistics" />
//           <View style={styles.statsGrid}>
//             <StatItem icon="time-outline" value={`${stats.on_time_rate ?? 98}%`} label="On-Time Rate" />
//             <StatItem icon="chatbubble-ellipses-outline" value={`${stats.response_rate ?? 95}%`} label="Response Rate" />
//             <StatItem icon="thumbs-up-outline" value={stats.posted_rides ?? 0} label="Completed" />
//             <StatItem icon="close-circle-outline" value={stats.cancelled_rides ?? 0} label="Cancelled" />
//           </View>
//         </SectionCard>

//         {/* ── 6. ABOUT (fetched from profile) ── */}
//         <SectionCard>
//           <SectionTitle title="About" />
//           <Text style={styles.bioText}>{aboutText}</Text>
//         </SectionCard>

//         {/* ── 7. TRAVEL PREFERENCES (Dynamic from API) ── */}
//         <SectionCard>
//           <SectionTitle title="Travel Preferences" />
//           {travelPreferences && Object.keys(travelPreferences).length > 0 ? (
//             <View style={styles.genericPrefsGrid}>
//               {Object.entries(travelPreferences).map(([key, value]) => {
//                 // Skip empty or null values
//                 if (value === null || value === undefined || value === '') return null;
                
//                 return (
//                   <GenericPrefItem
//                     key={key}
//                     prefKey={key}
//                     value={value}
//                   />
//                 );
//               })}
//             </View>
//           ) : (
//             <View style={styles.noPreferencesContainer}>
//               <Ionicons name="options-outline" size={32} color="#9CA3AF" />
//               <Text style={styles.noPreferencesText}>No travel preferences set</Text>
//               <Text style={styles.noPreferencesSubText}>This user hasn't specified any preferences yet</Text>
//             </View>
//           )}
//         </SectionCard>

//         {/* ── 8. VEHICLE ── */}
//         {vehicle && (
//           <SectionCard>
//             <SectionTitle title="Vehicle Details" />
//             <View style={styles.vehicleCard}>
//               <View style={styles.vehicleIconCircle}>
//                 <Ionicons name="car-sport-outline" size={26} color="#1A56DB" />
//               </View>
//               <View style={{ flex: 1, marginLeft: 14 }}>
//                 <Text style={styles.vehicleName}>{vehicleName || 'Vehicle'}</Text>
//                 <Text style={styles.vehicleSubDetail}>
//                   {[vehicle.vehicle_type, vehicle.body_type, vehicle.color].filter(Boolean).join(' · ')}
//                 </Text>
//               </View>
//               {vehicle.registration_number && (
//                 <View style={styles.licensePlate}>
//                   <Text style={styles.licensePlateText}>{vehicle.registration_number}</Text>
//                 </View>
//               )}
//             </View>
//             {vehicle.photo_url && (
//               <TouchableOpacity onPress={() => handleVehicleImagePress(vehicle.photo_url)}>
//                 <Image source={{ uri: buildImageUrl(vehicle.photo_url) }} style={styles.vehiclePhoto} resizeMode="cover" />
//               </TouchableOpacity>
//             )}
//           </SectionCard>
//         )}

//         {/* ── 9. REVIEWS ── */}
//         {reviews.length > 0 && (
//           <SectionCard>
//             <View style={styles.reviewsHeader}>
//               <SectionTitle title={`Reviews (${reviews.length})`} />
//               <View style={styles.reviewsRating}>
//                 <Ionicons name="star" size={16} color="#F59E0B" />
//                 <Text style={styles.reviewsRatingText}>{rating.toFixed(1)}</Text>
//               </View>
//             </View>
//             {reviews.slice(0, 4).map((review, idx) => (
//               <ReviewItem 
//                 key={idx} 
//                 review={review} 
//                 onImagePress={handleReviewerImagePress}
//               />
//             ))}
//           </SectionCard>
//         )}

//         <View style={{ height: 110 }} />
//       </ScrollView>

//       {/* ── 10. FIXED BOTTOM BUTTONS ── */}
//       <View style={styles.fixedActionBar}>
//         <TouchableOpacity style={styles.messageBtn} onPress={handleStartChat} activeOpacity={0.85}>
//           <Ionicons name="chatbubble-outline" size={20} color="#fff" />
//           <Text style={styles.messageBtnText}>Message</Text>
//         </TouchableOpacity>
//         <TouchableOpacity style={styles.reportBtn} onPress={handleReport} activeOpacity={0.85}>
//           <Ionicons name="flag-outline" size={20} color="#6B7280" />
//           <Text style={styles.reportBtnText}>Report</Text>
//         </TouchableOpacity>
//       </View>

//       {/* ── 11. IMAGE PREVIEW MODAL ── */}
//       <ImagePreviewModal
//         visible={previewVisible}
//         imageUrl={previewImageUrl}
//         driverName={previewTitle}
//         onClose={() => setPreviewVisible(false)}
//       />

//       <CustomAlert
//         visible={alertVisible}
//         title={alertConfig.title}
//         message={alertConfig.message}
//         icon={alertConfig.icon}
//         iconColor={alertConfig.iconColor}
//         buttons={alertConfig.buttons}
//         onBackdropPress={() => setAlertVisible(false)}
//       />
//     </SafeAreaView>
//   );
// }

// // ─── Styles ───────────────────────────────────────────────────────────────────

// const styles = StyleSheet.create({
//   container: { flex: 1, backgroundColor: '#F3F4F6' },
//   loaderContainer: { 
//     flex: 1, 
//     justifyContent: 'center', 
//     alignItems: 'center',
//     backgroundColor: '#fff',
//   },
//   header: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 14, backgroundColor: '#fff', borderBottomWidth: 0.5, borderBottomColor: '#E5E7EB' },
//   backBtn: { width: 44, height: 44, justifyContent: 'center' },
//   headerTitle: { flex: 1, textAlign: 'center', fontSize: 18, fontWeight: '700', color: '#111827' },
//   errorWrap: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingHorizontal: 30 },
//   errorTitle: { fontSize: 20, fontWeight: '700', color: '#111827', marginTop: 16 },
//   errorSub: { fontSize: 14, color: '#9CA3AF', marginTop: 8, textAlign: 'center' },
//   retryBtn: { marginTop: 20, backgroundColor: '#1A56DB', paddingHorizontal: 28, paddingVertical: 12, borderRadius: 14 },
//   retryBtnText: { color: '#fff', fontWeight: '700', fontSize: 15 },
//   scrollContent: { paddingBottom: 20 },

//   headerWrapper: {
//     width: '100%',
//     borderBottomLeftRadius: 32,
//     borderBottomRightRadius: 32,
//     overflow: 'hidden',
//     paddingTop: Platform.OS === 'ios' ? 60 : 48,
//     paddingBottom: 28,
//   },
//   headerBgImage: {
//     position: 'absolute',
//     top: 0, left: 0, right: 0, bottom: 0,
//     width: '90%', height: '150%',
//     opacity: 0.35,
//   },
//   backBtnLight: { position: 'absolute', top: Platform.OS === 'ios' ? 56 : 44, left: 16, width: 40, height: 40, justifyContent: 'center', zIndex: 10 },
//   headerContent: { alignItems: 'center', paddingHorizontal: 20 },
//   profileImageContainer: { marginBottom: 12, position: 'relative' },
//   profileImage: { width: 100, height: 100, borderRadius: 50, borderWidth: 3, borderColor: 'rgba(255,255,255,0.5)' },
//   svgProfileContainer: {
//     width: 100,
//     height: 100,
//     borderRadius: 50,
//     overflow: 'hidden',
//     borderWidth: 3,
//     borderColor: 'rgba(255,255,255,0.5)',
//     backgroundColor: 'rgba(255,255,255,0.2)',
//     alignItems: 'center',
//     justifyContent: 'center',
//   },
//   initialsCircle: { width: 100, height: 100, borderRadius: 50, backgroundColor: 'rgba(255,255,255,0.2)', alignItems: 'center', justifyContent: 'center', borderWidth: 3, borderColor: 'rgba(255,255,255,0.4)' },
//   initialsText: { fontSize: 34, fontWeight: '800', color: '#fff' },
//   verifiedBadge: { position: 'absolute', bottom: 2, right: 2, backgroundColor: '#fff', borderRadius: 12, padding: 2 },
//   verifiedLabelContainer: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 6, backgroundColor: 'rgba(34, 197, 94, 0.15)', paddingHorizontal: 12, paddingVertical: 4, borderRadius: 20 },
//   verifiedLabelText: { fontSize: 12, color: '#22C55E', fontWeight: '600' },
//   profileName: { fontSize: 22, fontWeight: '800', color: '#fff', textAlign: 'center' },
//   ratingRow: { flexDirection: 'row', alignItems: 'center', gap: 5, marginTop: 6 },
//   ratingText: { fontSize: 16, fontWeight: '700', color: '#fff' },
//   ratingCount: { fontSize: 13, color: 'rgba(255,255,255,0.75)' },
//   memberSince: { fontSize: 12, color: 'rgba(255,255,255,0.7)', marginTop: 4 },

//   sectionCard: { backgroundColor: '#fff', borderRadius: 20, padding: 18, marginHorizontal: 16, marginTop: 14, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.06, shadowRadius: 8, elevation: 2 },
//   sectionTitle: { fontSize: 16, fontWeight: '800', color: '#111827', marginBottom: 14 },

//   verificationInfoText: { fontSize: 13, color: '#6B7280', marginBottom: 12 },
//   verifiedDocsContainer: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
//   verifiedDocItem: { flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: '#F0FDF4', paddingHorizontal: 14, paddingVertical: 8, borderRadius: 24 },
//   verifiedDocIcon: { width: 28, height: 28, borderRadius: 14, backgroundColor: '#DCFCE7', alignItems: 'center', justifyContent: 'center' },
//   verifiedDocText: { fontSize: 14, fontWeight: '600', color: '#166534' },

//   trustRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
//   trustLeft: { flexDirection: 'row', alignItems: 'center', gap: 12 },
//   trustIconCircle: { width: 40, height: 40, borderRadius: 12, backgroundColor: '#FFFBEB', alignItems: 'center', justifyContent: 'center' },
//   trustLabel: { fontSize: 15, fontWeight: '700', color: '#111827' },
//   trustSubLabel: { fontSize: 12, color: '#F59E0B', fontWeight: '600', marginTop: 2 },
//   trustRight: { alignItems: 'flex-end', gap: 6 },
//   trustStars: { flexDirection: 'row', gap: 3 },
//   trustScoreBadge: { flexDirection: 'row', alignItems: 'baseline', gap: 1 },
//   trustScoreNum: { fontSize: 22, fontWeight: '800', color: '#F59E0B' },
//   trustScoreOf: { fontSize: 13, color: '#9CA3AF', fontWeight: '500' },

//   badgesRow: { gap: 12 },
//   badgeItem: { flexDirection: 'row', alignItems: 'flex-start', gap: 12 },
//   badgeIconCircle: { width: 42, height: 42, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
//   badgeTitle: { fontSize: 14, fontWeight: '700', color: '#111827' },
//   badgeDesc: { fontSize: 12, color: '#6B7280', marginTop: 2, lineHeight: 18 },
//   noBadgeText: { fontSize: 13, color: '#9CA3AF', textAlign: 'center', paddingVertical: 8 },

//   statsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
//   statItem: { flex: 1, minWidth: (width - 32 - 36 - 12) / 2, backgroundColor: '#F9FAFB', borderRadius: 14, padding: 14, alignItems: 'center' },
//   statIconCircle: { width: 40, height: 40, borderRadius: 20, backgroundColor: '#EFF6FF', alignItems: 'center', justifyContent: 'center', marginBottom: 8 },
//   statValue: { fontSize: 20, fontWeight: '800', color: '#111827' },
//   statLabel: { fontSize: 11, color: '#9CA3AF', marginTop: 3, textAlign: 'center' },

//   bioText: { fontSize: 14, color: '#4B5563', lineHeight: 22 },

//   // Generic Preferences Styles
//   genericPrefsGrid: {
//     flexDirection: 'row',
//     flexWrap: 'wrap',
//     gap: 10,
//   },
//   genericPrefItem: {
//     flex: 1,
//     flexDirection: 'row',
//     alignItems: 'center',
//     gap: 10,
//     paddingHorizontal: 14,
//     paddingVertical: 12,
//     borderRadius: 12,
//     minWidth: (width - 32 - 36 - 10) / 2,
//   },
//   genericPrefContent: {
//     flex: 1,
//   },
//   genericPrefLabel: {
//     fontSize: 13,
//     fontWeight: '600',
//     color: '#374151',
//     marginBottom: 2,
//   },
//   genericPrefValue: {
//     fontSize: 12,
//     fontWeight: '500',
//   },
//   noPreferencesContainer: {
//     alignItems: 'center',
//     justifyContent: 'center',
//     paddingVertical: 24,
//     width: '100%',
//   },
//   noPreferencesText: {
//     fontSize: 16,
//     fontWeight: '600',
//     color: '#6B7280',
//     marginTop: 12,
//   },
//   noPreferencesSubText: {
//     fontSize: 13,
//     color: '#9CA3AF',
//     marginTop: 4,
//     textAlign: 'center',
//   },

//   vehicleCard: { flexDirection: 'row', alignItems: 'center' },
//   vehicleIconCircle: { width: 52, height: 52, borderRadius: 14, backgroundColor: '#EFF6FF', alignItems: 'center', justifyContent: 'center' },
//   vehicleName: { fontSize: 16, fontWeight: '700', color: '#111827' },
//   vehicleSubDetail: { fontSize: 13, color: '#6B7280', marginTop: 2 },
//   licensePlate: { backgroundColor: '#F9FAFB', borderRadius: 8, paddingHorizontal: 10, paddingVertical: 6, borderWidth: 1, borderColor: '#E5E7EB' },
//   licensePlateText: { fontSize: 13, fontWeight: '700', color: '#111827', letterSpacing: 1 },
//   vehiclePhoto: { width: '100%', height: 130, borderRadius: 14, marginTop: 14 },

//   reviewsHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 0 },
//   reviewsRating: { flexDirection: 'row', alignItems: 'center', gap: 4 },
//   reviewsRatingText: { fontSize: 16, fontWeight: '700', color: '#F59E0B' },
//   reviewItem: { paddingVertical: 14, borderTopWidth: 1, borderTopColor: '#F3F4F6', marginTop: 6 },
//   reviewHeader: { flexDirection: 'row', alignItems: 'flex-start', gap: 10 },
//   reviewAvatar: { width: 40, height: 40, borderRadius: 20, backgroundColor: '#E5E7EB', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' },
//   reviewAvatarImg: { width: 40, height: 40 },
//   reviewSvgContainer: {
//     width: 40,
//     height: 40,
//     borderRadius: 20,
//     overflow: 'hidden',
//     alignItems: 'center',
//     justifyContent: 'center',
//     backgroundColor: '#E5E7EB',
//   },
//   reviewAvatarText: { fontSize: 14, fontWeight: '700', color: '#374151' },
//   reviewName: { fontSize: 14, fontWeight: '700', color: '#111827' },
//   reviewMeta: { flexDirection: 'row', gap: 10, marginTop: 2, flexWrap: 'wrap' },
//   reviewRoute: { fontSize: 11, color: '#9CA3AF' },
//   reviewDate: { fontSize: 11, color: '#9CA3AF' },
//   reviewComment: { fontSize: 13, color: '#4B5563', lineHeight: 20, marginTop: 8 },

//   fixedActionBar: { position: 'absolute', bottom: 0, left: 0, right: 0, flexDirection: 'row', gap: 12, paddingHorizontal: 16, paddingTop: 12, paddingBottom: Platform.OS === 'ios' ? 30 : 16, backgroundColor: '#fff', borderTopWidth: 1, borderTopColor: '#F3F4F6', shadowColor: '#000', shadowOffset: { width: 0, height: -4 }, shadowOpacity: 0.06, shadowRadius: 12, elevation: 10 },
//   messageBtn: { flex: 2, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, backgroundColor: '#1A56DB', borderRadius: 16, paddingVertical: 15, shadowColor: '#1A56DB', shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.25, shadowRadius: 12, elevation: 4 },
//   messageBtnText: { color: '#fff', fontSize: 16, fontWeight: '700' },
//   reportBtn: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, backgroundColor: '#fff', borderRadius: 16, paddingVertical: 15, borderWidth: 1, borderColor: '#E5E7EB' },
//   reportBtnText: { color: '#6B7280', fontSize: 15, fontWeight: '600' },

//   // Modal styles matching RideDetailScreen
//   modalBackdrop: {
//     flex: 1,
//     backgroundColor: 'rgba(0,0,0,0.9)',
//     justifyContent: 'center',
//     alignItems: 'center',
//   },
//   imageModalContainer: {
//     flex: 1,
//     justifyContent: 'center',
//     alignItems: 'center',
//     width: '100%',
//   },
//   imageModalContent: {
//     width: '90%',
//     backgroundColor: Colors.white,
//     borderRadius: 20,
//     overflow: 'hidden',
//     maxHeight: '80%',
//   },
//   imageModalHeader: {
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//     alignItems: 'center',
//     padding: 16,
//     borderBottomWidth: 1,
//     borderBottomColor: '#EEF2F7',
//   },
//   imageModalTitle: {
//     fontSize: 18,
//     fontWeight: '700',
//     color: Colors.dark,
//   },
//   fullProfileImage: {
//     width: '100%',
//     height: 400,
//     backgroundColor: '#F5F5F5',
//   },
//   modalSvgContainer: {
//     width: '100%',
//     height: 400,
//     backgroundColor: '#F5F5F5',
//     alignItems: 'center',
//     justifyContent: 'center',
//   },
//   noImageContainer: {
//     width: '100%',
//     height: 400,
//     justifyContent: 'center',
//     alignItems: 'center',
//     backgroundColor: '#F5F5F5',
//   },
//   noImageText: {
//     fontSize: 16,
//     color: Colors.gray,
//   },
// });
// import React, { useState, useCallback } from 'react';
// import {
//   View,
//   Text,
//   StyleSheet,
//   TouchableOpacity,
//   ScrollView,
//   StatusBar,
//   Image,
//   Dimensions,
//   Platform,
//   Modal,
//   TouchableWithoutFeedback,
//   FlatList,
// } from 'react-native';
// import { SafeAreaView } from 'react-native-safe-area-context';
// import { Ionicons, MaterialIcons, MaterialCommunityIcons } from '@expo/vector-icons';
// import { LinearGradient } from 'expo-linear-gradient';
// import { useFocusEffect } from '@react-navigation/native';
// import LottieView from "lottie-react-native";
// import { SvgCssUri } from 'react-native-svg/css';

// import { Colors } from '../constants/Colors';
// import { API_BASE_URL } from '../config/config_ip';
// import { useAuth } from '../context/AuthContext';
// import CustomAlert from '../components/CustomAlert';

// const { width, height } = Dimensions.get('window');

// // ─── Helpers ──────────────────────────────────────────────────────────────────

// function buildImageUrl(url) {
//   if (!url) return null;
//   if (url.startsWith('http://') || url.startsWith('https://')) return url;
//   return `${API_BASE_URL}${url.startsWith('/') ? '' : '/'}${url}`;
// }

// function getInitials(name) {
//   if (!name) return 'U';
//   const parts = name.trim().split(' ').filter(Boolean);
//   if (parts.length > 1) return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
//   return parts[0].slice(0, 2).toUpperCase();
// }

// function formatJoinDate(dateString) {
//   if (!dateString) return 'Recently joined';
//   try {
//     const date = new Date(dateString);
//     return date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
//   } catch {
//     return 'Recently joined';
//   }
// }

// function formatReviewDate(dateString) {
//   if (!dateString) return '';
//   try {
//     const date = new Date(dateString);
//     return date.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
//   } catch {
//     return '';
//   }
// }

// async function fetchPublicProfile(phoneNumber, userId) {
//   try {
//     const params = new URLSearchParams();
    
//     if (userId) {
//       params.append('user_id', userId);
//     } else if (phoneNumber) {
//       params.append('phone_number', phoneNumber);
//     } else {
//       return null;
//     }
    
//     const url = `${API_BASE_URL}/api/v1/users/profile-public?${params.toString()}`;
//     console.log('Fetching profile from:', url);
    
//     const res = await fetch(url, { 
//       headers: { 
//         'Accept': 'application/json',
//         'Content-Type': 'application/json'
//       } 
//     });
    
//     if (!res.ok) {
//       console.log('Profile fetch failed with status:', res.status);
//       return null;
//     }
    
//     const data = await res.json();
//     console.log('Profile data received:', JSON.stringify(data, null, 2));
//     return data;
//   } catch (e) {
//     console.log('fetchPublicProfile error:', e);
//     return null;
//   }
// }

// async function fetchUserDocuments(phoneNumber) {
//   try {
//     const url = `${API_BASE_URL}/api/v1/documents/user/${phoneNumber}`;
//     console.log('Fetching documents from:', url);
//     const res = await fetch(url, { headers: { Accept: 'application/json' } });
//     if (!res.ok) {
//       console.log('Documents fetch failed with status:', res.status);
//       return null;
//     }
//     const data = await res.json();
//     console.log('Documents data received:', JSON.stringify(data, null, 2));
//     return data;
//   } catch (e) {
//     console.log('fetchUserDocuments error:', e);
//     return null;
//   }
// }

// async function fetchUserPreferences(phoneNumber) {
//   try {
//     const url = `${API_BASE_URL}/api/v1/matching-preferences/user?phone_number=${phoneNumber}`;
//     const res = await fetch(url);
//     if (!res.ok) return null;
//     const data = await res.json();
//     console.log('Direct preferences fetched:', data);
//     return data;
//   } catch (e) {
//     console.log('fetchUserPreferences error:', e);
//     return null;
//   }
// }

// // ─── Vehicle Image Slider Component ───────────────────────────────────────────

// function VehicleImageSlider({ images, onImagePress }) {
//   const [activeIndex, setActiveIndex] = useState(0);
  
//   if (!images || images.length === 0) return null;
  
//   const renderImageItem = ({ item, index }) => {
//     const imageUrl = buildImageUrl(item);
//     const isSvg = imageUrl ? imageUrl.toLowerCase().includes('.svg') : false;
    
//     return (
//       <TouchableOpacity 
//         key={index}
//         activeOpacity={0.9}
//         onPress={() => onImagePress && onImagePress(imageUrl, `Vehicle Photo ${index + 1}`)}
//         style={styles.sliderImageContainer}
//       >
//         {isSvg ? (
//           <View style={styles.sliderSvgContainer}>
//             <SvgCssUri
//               uri={imageUrl}
//               width={width - 60}
//               height={200}
//               onError={(e) => console.log('Vehicle SVG load error:', e)}
//             />
//           </View>
//         ) : (
//           <Image 
//             source={{ uri: imageUrl }} 
//             style={styles.sliderImage}
//             resizeMode="cover"
//             onError={(e) => console.log('Vehicle image load error:', e.nativeEvent.error)}
//           />
//         )}
//       </TouchableOpacity>
//     );
//   };
  
//   return (
//     <View style={styles.sliderContainer}>
//       <FlatList
//         data={images}
//         horizontal
//         pagingEnabled
//         showsHorizontalScrollIndicator={false}
//         keyExtractor={(item, index) => `vehicle_img_${index}`}
//         renderItem={renderImageItem}
//         onMomentumScrollEnd={(event) => {
//           const index = Math.round(event.nativeEvent.contentOffset.x / (width - 60));
//           setActiveIndex(index);
//         }}
//         getItemLayout={(data, index) => ({
//           length: width - 60,
//           offset: (width - 60) * index,
//           index,
//         })}
//       />
      
//       {/* Pagination Dots */}
//       {images.length > 1 && (
//         <View style={styles.paginationContainer}>
//           {images.map((_, index) => (
//             <View
//               key={index}
//               style={[
//                 styles.paginationDot,
//                 index === activeIndex && styles.paginationDotActive,
//               ]}
//             />
//           ))}
//         </View>
//       )}
      
//       {/* Image Counter Badge */}
//       {images.length > 1 && (
//         <View style={styles.imageCounterBadge}>
//           <Text style={styles.imageCounterText}>
//             {activeIndex + 1} / {images.length}
//           </Text>
//         </View>
//       )}
//     </View>
//   );
// }

// // ─── Sub-components ───────────────────────────────────────────────────────────

// function StarRow({ rating, size = 14, color = '#F59E0B' }) {
//   return (
//     <View style={{ flexDirection: 'row', gap: 2 }}>
//       {[1, 2, 3, 4, 5].map((i) => (
//         <Ionicons
//           key={i}
//           name={i <= Math.round(rating) ? 'star' : 'star-outline'}
//           size={size}
//           color={color}
//         />
//       ))}
//     </View>
//   );
// }

// function SectionCard({ children, style }) {
//   return <View style={[styles.sectionCard, style]}>{children}</View>;
// }

// function SectionTitle({ title }) {
//   return <Text style={styles.sectionTitle}>{title}</Text>;
// }

// function BadgeItem({ icon, iconColor, bgColor, title, desc }) {
//   return (
//     <View style={styles.badgeItem}>
//       <View style={[styles.badgeIconCircle, { backgroundColor: bgColor }]}>
//         <Ionicons name={icon} size={20} color={iconColor} />
//       </View>
//       <View style={{ flex: 1 }}>
//         <Text style={styles.badgeTitle}>{title}</Text>
//         <Text style={styles.badgeDesc}>{desc}</Text>
//       </View>
//     </View>
//   );
// }

// function StatItem({ icon, value, label }) {
//   return (
//     <View style={styles.statItem}>
//       <View style={styles.statIconCircle}>
//         <Ionicons name={icon} size={20} color="#1A56DB" />
//       </View>
//       <Text style={styles.statValue}>{value}</Text>
//       <Text style={styles.statLabel}>{label}</Text>
//     </View>
//   );
// }

// function GenericPrefItem({ prefKey, value }) {
//   const getIconForPreference = (key) => {
//     const icons = {
//       'music': 'musical-notes-outline',
//       'ac': 'snow-outline',
//       'pets': 'paw-outline',
//       'smoking': 'flame-outline',
//       'speak_languages': 'chatbubbles-outline',
//       'chat_level': 'chatbox-outline',
//       'age_category': 'people-outline',
//       'detours': 'map-outline',
//       'helmet_policy_driver': 'hard-hat-outline',
//       'gender_preference': 'male-female-outline',
//       'verified_profiles_only': 'shield-checkmark-outline'
//     };
//     return icons[key] || 'options-outline';
//   };

//   const formatDisplayValue = (val) => {
//     if (typeof val === 'boolean') {
//       return val ? 'Yes' : 'No';
//     }
//     if (typeof val === 'string') {
//       return val;
//     }
//     if (Array.isArray(val)) {
//       return val.join(', ');
//     }
//     return val ? 'Enabled' : 'Disabled';
//   };

//   const formatKeyForDisplay = (key) => {
//     return key.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
//   };

//   const isEnabled = typeof value === 'boolean' ? value : true;

//   return (
//     <View style={[styles.genericPrefItem, { backgroundColor: isEnabled ? '#F0FDF4' : '#FEF2F2' }]}>
//       <Ionicons name={getIconForPreference(prefKey)} size={20} color={isEnabled ? '#10B981' : '#EF4444'} />
//       <View style={styles.genericPrefContent}>
//         <Text style={styles.genericPrefLabel}>{formatKeyForDisplay(prefKey)}</Text>
//         <Text style={[styles.genericPrefValue, { color: isEnabled ? '#10B981' : '#EF4444' }]}>
//           {formatDisplayValue(value)}
//         </Text>
//       </View>
//     </View>
//   );
// }

// function ReviewItem({ review, onImagePress }) {
//   const reviewerPhotoUrl = buildImageUrl(review.reviewer_photo);
//   const isSvg = reviewerPhotoUrl ? reviewerPhotoUrl.toLowerCase().includes('.svg') : false;
  
//   return (
//     <View style={styles.reviewItem}>
//       <View style={styles.reviewHeader}>
//         <TouchableOpacity onPress={() => reviewerPhotoUrl && onImagePress && onImagePress(reviewerPhotoUrl, review.reviewer_name)}>
//           <View style={styles.reviewAvatar}>
//             {reviewerPhotoUrl ? (
//               isSvg ? (
//                 <View style={styles.reviewSvgContainer}>
//                   <SvgCssUri
//                     uri={reviewerPhotoUrl}
//                     width={40}
//                     height={40}
//                     onError={(e) => console.log('Reviewer SVG load error:', e)}
//                   />
//                 </View>
//               ) : (
//                 <Image 
//                   source={{ uri: reviewerPhotoUrl }} 
//                   style={styles.reviewAvatarImg}
//                   onError={(e) => console.log('Reviewer image load error:', e.nativeEvent.error)}
//                 />
//               )
//             ) : (
//               <Text style={styles.reviewAvatarText}>{getInitials(review.reviewer_name)}</Text>
//             )}
//           </View>
//         </TouchableOpacity>
//         <View style={{ flex: 1 }}>
//           <Text style={styles.reviewName}>{review.reviewer_name || 'Anonymous'}</Text>
//           <View style={styles.reviewMeta}>
//             {review.route && (
//               <Text style={styles.reviewRoute}>
//                 <Ionicons name="location-outline" size={11} color="#9CA3AF" /> {review.route}
//               </Text>
//             )}
//             {review.date && (
//               <Text style={styles.reviewDate}>
//                 <Ionicons name="calendar-outline" size={11} color="#9CA3AF" /> {formatReviewDate(review.date)}
//               </Text>
//             )}
//           </View>
//         </View>
//         <StarRow rating={review.rating || 5} size={13} />
//       </View>
//       {review.comment && <Text style={styles.reviewComment}>{review.comment}</Text>}
//     </View>
//   );
// }

// // ─── Image Preview Modal Component ───────────────────────────────────────────

// function ImagePreviewModal({ visible, imageUrl, driverName, onClose }) {
//   const [isSvg, setIsSvg] = useState(false);
  
//   React.useEffect(() => {
//     if (imageUrl) {
//       setIsSvg(imageUrl.toLowerCase().includes('.svg'));
//     }
//   }, [imageUrl]);
  
//   if (!visible) return null;
  
//   return (
//     <Modal
//       visible={visible}
//       transparent={true}
//       animationType="fade"
//       onRequestClose={onClose}
//     >
//       <TouchableOpacity 
//         style={styles.modalBackdrop}
//         activeOpacity={1}
//         onPress={onClose}
//       >
//         <View style={styles.imageModalContainer}>
//           <View style={styles.imageModalContent}>
//             <View style={styles.imageModalHeader}>
//               <Text style={styles.imageModalTitle}>{driverName || 'Profile Photo'}</Text>
//               <TouchableOpacity onPress={onClose}>
//                 <Ionicons name="close" size={24} color={Colors.dark} />
//               </TouchableOpacity>
//             </View>
//             {imageUrl && imageUrl !== 'null' && imageUrl !== 'undefined' ? (
//               isSvg ? (
//                 <View style={styles.modalSvgContainer}>
//                   <SvgCssUri
//                     uri={imageUrl}
//                     width="100%"
//                     height={400}
//                     onError={(e) => console.log('Modal SVG load error:', e)}
//                     onLoad={() => console.log('Modal SVG loaded successfully')}
//                   />
//                 </View>
//               ) : (
//                 <Image
//                   source={{ uri: imageUrl }}
//                   style={styles.fullProfileImage}
//                   resizeMode="contain"
//                   onError={(e) => console.log('Modal Image load error:', e.nativeEvent.error, 'URL:', imageUrl)}
//                   onLoad={() => console.log('Modal Image loaded successfully:', imageUrl)}
//                 />
//               )
//             ) : (
//               <View style={styles.noImageContainer}>
//                 <Text style={styles.noImageText}>No image available</Text>
//               </View>
//             )}
//           </View>
//         </View>
//       </TouchableOpacity>
//     </Modal>
//   );
// }

// // ─── Helper function to extract vehicle images from notes ─────────────────────

// function extractVehicleImages(vehicle) {
//   if (!vehicle) return [];
  
//   console.log('Extracting images from vehicle:', vehicle);
  
//   // Method 1: Check if photos array exists directly
//   if (vehicle.photos && Array.isArray(vehicle.photos) && vehicle.photos.length > 0) {
//     console.log('Found photos array:', vehicle.photos);
//     return vehicle.photos;
//   }
  
//   // Method 2: Check if notes contains JSON with photos array (backend storage format)
//   if (vehicle.notes && typeof vehicle.notes === 'string') {
//     try {
//       // Check if notes starts with JSON format
//       if (vehicle.notes.startsWith('{') || vehicle.notes.startsWith('{"photos":')) {
//         const parsedNotes = JSON.parse(vehicle.notes);
//         console.log('Parsed notes:', parsedNotes);
        
//         if (parsedNotes.photos && Array.isArray(parsedNotes.photos) && parsedNotes.photos.length > 0) {
//           console.log('Found photos in notes JSON:', parsedNotes.photos);
//           return parsedNotes.photos;
//         }
//       }
//     } catch (e) {
//       console.log('Notes is not JSON:', e);
//     }
//   }
  
//   // Method 3: Check if notes is an object (already parsed)
//   if (vehicle.notes && typeof vehicle.notes === 'object' && vehicle.notes.photos) {
//     if (Array.isArray(vehicle.notes.photos) && vehicle.notes.photos.length > 0) {
//       console.log('Found photos in notes object:', vehicle.notes.photos);
//       return vehicle.notes.photos;
//     }
//   }
  
//   // Method 4: Check for single photo_url
//   if (vehicle.photo_url) {
//     console.log('Using single photo_url:', vehicle.photo_url);
//     return [vehicle.photo_url];
//   }
  
//   console.log('No vehicle images found');
//   return [];
// }

// // ─── Main Screen ──────────────────────────────────────────────────────────────

// export default function ViewProfileScreen({ navigation, route }) {
//   const { phoneNumber, userId, driverName } = route.params || {};
//   const { user: currentUser } = useAuth();

//   const [profile, setProfile] = useState(null);
//   const [documents, setDocuments] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [verifiedDocuments, setVerifiedDocuments] = useState([]);
//   const [error, setError] = useState(null);
//   const [travelPreferences, setTravelPreferences] = useState({});
  
//   // Image preview modal state
//   const [previewVisible, setPreviewVisible] = useState(false);
//   const [previewImageUrl, setPreviewImageUrl] = useState(null);
//   const [previewTitle, setPreviewTitle] = useState('');

//   // Custom Alert states
//   const [alertVisible, setAlertVisible] = useState(false);
//   const [alertConfig, setAlertConfig] = useState({
//     title: "",
//     message: "",
//     icon: "check-circle",
//     iconColor: "#10B981",
//     buttons: []
//   });

//   const showCustomAlert = (title, message, type = 'success') => {
//     let icon = "check-circle";
//     let iconColor = "#10B981";
    
//     if (type === 'error') {
//       icon = "error";
//       iconColor = "#EF4444";
//     } else if (type === 'warning') {
//       icon = "warning";
//       iconColor = "#F59E0B";
//     } else if (type === 'info') {
//       icon = "info";
//       iconColor = "#1A56DB";
//     }
    
//     setAlertConfig({
//       title,
//       message,
//       icon,
//       iconColor,
//       buttons: [{ text: 'OK', onPress: () => setAlertVisible(false) }]
//     });
//     setAlertVisible(true);
//   };

//   const showConfirmationAlert = (title, message, onConfirm) => {
//     setAlertConfig({
//       title,
//       message,
//       icon: "warning",
//       iconColor: "#F59E0B",
//       buttons: [
//         { text: 'Cancel', onPress: () => setAlertVisible(false), style: 'cancel' },
//         { text: 'Report', onPress: () => {
//           setAlertVisible(false);
//           onConfirm();
//         }, style: 'destructive' }
//       ]
//     });
//     setAlertVisible(true);
//   };

//   const checkVerifiedDocuments = (docs) => {
//     if (!docs || !docs.length) return [];
    
//     const verified = docs.filter(doc => {
//       const docType = doc.document_type?.toLowerCase();
//       const status = doc.status?.toUpperCase();
//       return status === 'APPROVED' && ['aadhar', 'dl', 'rc'].includes(docType);
//     });
    
//     return verified.map(doc => doc.document_type?.toLowerCase());
//   };

//   const getDocumentDisplayName = (docType) => {
//     const names = {
//       'aadhar': 'Aadhar Card',
//       'dl': 'Driving License',
//       'rc': 'Registration Certificate'
//     };
//     return names[docType] || docType;
//   };

//   const getDocumentIcon = (docType) => {
//     const icons = {
//       'aadhar': 'card-outline',
//       'dl': 'car-outline',
//       'rc': 'document-text-outline'
//     };
//     return icons[docType] || 'document-outline';
//   };

//   const handleProfileImagePress = () => {
//     if (profileImageUrl) {
//       setPreviewImageUrl(profileImageUrl);
//       setPreviewTitle(userFullName);
//       setPreviewVisible(true);
//     }
//   };

//   const handleVehicleImagePress = (imageUrl, title) => {
//     if (imageUrl) {
//       setPreviewImageUrl(imageUrl);
//       setPreviewTitle(title || 'Vehicle Photo');
//       setPreviewVisible(true);
//     }
//   };

//   const handleReviewerImagePress = (imageUrl, reviewerName) => {
//     if (imageUrl) {
//       setPreviewImageUrl(imageUrl);
//       setPreviewTitle(reviewerName || 'Reviewer');
//       setPreviewVisible(true);
//     }
//   };

//   const loadProfile = useCallback(async () => {
//     setLoading(true);
//     setError(null);
    
//     try {
//       const profileData = await fetchPublicProfile(phoneNumber, userId);
//       console.log('Profile API response:', profileData);
      
//       if (profileData?.success && profileData.user) {
//         setProfile(profileData.user);
        
//         // Debug vehicle data
//         if (profileData.user.vehicle) {
//           console.log('====== VEHICLE DATA FROM API ======');
//           console.log('Full vehicle:', JSON.stringify(profileData.user.vehicle, null, 2));
//           console.log('vehicle.photo_url:', profileData.user.vehicle.photo_url);
//           console.log('vehicle.notes:', profileData.user.vehicle.notes);
//           console.log('===================================');
//         }
        
//         if (profileData.user.travel_preferences) {
//           console.log('Travel preferences from profile:', profileData.user.travel_preferences);
//           setTravelPreferences(profileData.user.travel_preferences);
//         } else {
//           const targetPhone = phoneNumber || profileData.user?.phone_number;
//           if (targetPhone) {
//             const prefsData = await fetchUserPreferences(targetPhone);
//             if (prefsData) {
//               console.log('Travel preferences from direct API:', prefsData);
//               setTravelPreferences(prefsData);
//             }
//           }
//         }
        
//         const targetPhone = phoneNumber || profileData.user?.phone_number;
//         if (targetPhone) {
//           const docsData = await fetchUserDocuments(targetPhone);
//           console.log('Documents API response:', docsData);
          
//           if (docsData?.success && docsData.documents) {
//             setDocuments(docsData.documents);
//             const verified = checkVerifiedDocuments(docsData.documents);
//             console.log('Verified documents found:', verified);
//             setVerifiedDocuments(verified);
//           } else {
//             console.log('No documents found or API failed');
//             setDocuments([]);
//             setVerifiedDocuments([]);
//           }
//         }
//       } else {
//         console.log('Profile not found or API failed');
//         setError('Profile not found');
//       }
//     } catch (err) {
//       console.error('Load profile error:', err);
//       setError('Failed to load profile');
//     } finally {
//       setLoading(false);
//     }
//   }, [phoneNumber, userId]);

//   useFocusEffect(useCallback(() => { loadProfile(); }, [loadProfile]));

//   const handleBack = () => navigation.goBack();

//   const getOrCreateConversation = async (receiverPhone) => {
//     try {
//       const myPhone = currentUser?.phone_number;
//       if (!myPhone) {
//         showCustomAlert('Login Required', 'Please log in to use chat.', 'warning');
//         return null;
//       }
//       const response = await fetch(`${API_BASE_URL}/api/chat/conversations`, {
//         method: 'POST',
//         headers: {
//           'X-Phone-Number': myPhone,
//           'Content-Type': 'application/json',
//         },
//         body: JSON.stringify({ participant_phone: receiverPhone }),
//       });
//       const data = await response.json();
//       if (data.success) {
//         return data.conversation.id;
//       }
//       console.error('Failed to create conversation:', data);
//       return null;
//     } catch (error) {
//       console.error('getOrCreateConversation error:', error);
//       return null;
//     }
//   };

//   const handleStartChat = async () => {
//     if (profile?.phone_number) {
//       const conversationId = await getOrCreateConversation(profile.phone_number);
//       if (conversationId) {
//         navigation.navigate('ChatScreen', {
//           receiverPhone: profile.phone_number,
//           conversationId,
//           user: {
//             name: profile.full_name || driverName || 'User',
//             tripInfo: 'Active',
//           },
//         });
//       } else {
//         showCustomAlert('Chat', 'Unable to start chat. Please try again.', 'error');
//       }
//     } else {
//       showCustomAlert('Chat', 'Phone number not available', 'warning');
//     }
//   };

//   const handleReport = () => {
//     showConfirmationAlert(
//       'Report User',
//       'Are you sure you want to report this user?',
//       () => {
//         showCustomAlert('Reported', 'Thank you for your report. Our team will review it.', 'success');
//       }
//     );
//   };

//   const isVerified = verifiedDocuments.length > 0;

//   const profileImageUrl = buildImageUrl(profile?.profile_picture);
//   const isProfilePhotoSvg = profileImageUrl ? profileImageUrl.toLowerCase().includes('.svg') : false;
//   const userFullName = profile?.full_name || driverName || 'User';
//   const initials = getInitials(userFullName);
//   const joinDateText = formatJoinDate(profile?.created_at);
//   const rating = profile?.avg_rating ?? 0;
//   const totalRatings = profile?.total_ratings ?? 0;
  
//   const aboutText = profile?.about || profile?.bio || 'I am happy to share the ride. Lets Drivve!';
  
//   const vehicle = profile?.vehicle;
//   const vehicleName = vehicle ? [vehicle.make, vehicle.model].filter(Boolean).join(' ') : null;
//   const reviews = profile?.reviews || [];
//   const stats = profile?.stats || {};
//   const trustScore = rating.toFixed(1);
//   const trustDots = Math.round(rating);

//   // Extract vehicle images using the helper function
//   const vehicleImages = extractVehicleImages(vehicle);
//   console.log('Final vehicle images to display:', vehicleImages.length, vehicleImages);

//   if (loading) {
//     return (
//       <SafeAreaView style={styles.container}>
//         <StatusBar barStyle="dark-content" backgroundColor={Colors.white} />
//         <View style={styles.loaderContainer}>
//           <LottieView
//             source={require("../assets/loading.json")}
//             autoPlay
//             loop
//             style={{ width: 300, height: 300 }}
//           />
//         </View>
//       </SafeAreaView>
//     );
//   }

//   if (error || !profile) {
//     return (
//       <SafeAreaView style={styles.container}>
//         <StatusBar barStyle="dark-content" backgroundColor={Colors.white} />
//         <View style={styles.header}>
//           <TouchableOpacity style={styles.backBtn} onPress={handleBack}>
//             <MaterialIcons name="arrow-back-ios" size={22} color="#1A56DB" />
//           </TouchableOpacity>
//           <Text style={styles.headerTitle}>Profile</Text>
//           <View style={styles.backBtn} />
//         </View>
//         <View style={styles.errorWrap}>
//           <Ionicons name="person-outline" size={64} color="#D1D5DB" />
//           <Text style={styles.errorTitle}>Profile not found</Text>
//           <Text style={styles.errorSub}>{error || "We couldn't load this user's profile."}</Text>
//           <TouchableOpacity style={styles.retryBtn} onPress={loadProfile}>
//             <Text style={styles.retryBtnText}>Retry</Text>
//           </TouchableOpacity>
//         </View>
//       </SafeAreaView>
//     );
//   }

//   return (
//     <SafeAreaView style={styles.container} edges={['left', 'right']}>
//       <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />

//       <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>

//         {/* ── 1. PROFILE HEADER CARD ── */}
//         <View style={styles.headerWrapper}>
//           <LinearGradient
//             colors={['#1A56DB', '#0D3A6F']}
//             start={{ x: 0, y: 0 }}
//             end={{ x: 1, y: 1 }}
//             style={StyleSheet.absoluteFillObject}
//           />

//           <Image
//             source={require('../assets/s8.png')}
//             style={styles.headerBgImage}
//             resizeMode="cover"
//           />

//           <TouchableOpacity style={styles.backBtnLight} onPress={handleBack}>
//             <MaterialIcons name="arrow-back-ios" size={22} color="#fff" />
//           </TouchableOpacity>

//           <View style={styles.headerContent}>
//             <TouchableOpacity onPress={handleProfileImagePress}>
//               <View style={styles.profileImageContainer}>
//                 {profileImageUrl ? (
//                   isProfilePhotoSvg ? (
//                     <View style={styles.svgProfileContainer}>
//                       <SvgCssUri
//                         uri={profileImageUrl}
//                         width={100}
//                         height={100}
//                         onError={(e) => console.log('Profile SVG load error:', e)}
//                       />
//                     </View>
//                   ) : (
//                     <Image 
//                       source={{ uri: profileImageUrl }} 
//                       style={styles.profileImage}
//                       onError={(e) => console.log('Profile image load error:', e.nativeEvent.error)}
//                     />
//                   )
//                 ) : (
//                   <View style={styles.initialsCircle}>
//                     <Text style={styles.initialsText}>{initials}</Text>
//                   </View>
//                 )}
//                 {isVerified && (
//                   <View style={styles.verifiedBadge}>
//                     <Ionicons name="checkmark-circle" size={24} color="#22C55E" />
//                   </View>
//                 )}
//               </View>
//             </TouchableOpacity>

//             <Text style={styles.profileName}>{userFullName}</Text>

//             {isVerified && (
//               <View style={styles.verifiedLabelContainer}>
//                 <Ionicons name="shield-checkmark" size={14} color="#22C55E" />
//                 <Text style={styles.verifiedLabelText}>Verified Profile</Text>
//               </View>
//             )}

//             <View style={styles.ratingRow}>
//               <Ionicons name="star" size={16} color="#FFD700" />
//               <Text style={styles.ratingText}>{rating > 0 ? rating.toFixed(1) : 'New'}</Text>
//               <Text style={styles.ratingCount}>· {totalRatings} rides</Text>
//             </View>

//             <Text style={styles.memberSince}>Member since {joinDateText}</Text>
//           </View>
//         </View>

//         {/* ── 2. TRUST SCORE ── */}
//         <SectionCard>
//           <View style={styles.trustRow}>
//             <View style={styles.trustLeft}>
//               <View style={styles.trustIconCircle}>
//                 <MaterialCommunityIcons name="trophy-outline" size={20} color="#F59E0B" />
//               </View>
//               <View>
//                 <Text style={styles.trustLabel}>Trust Score</Text>
//                 <Text style={styles.trustSubLabel}>
//                   {trustDots >= 4 ? 'Excellent' : trustDots >= 3 ? 'Good' : 'Fair'}
//                 </Text>
//               </View>
//             </View>
//             <View style={styles.trustRight}>
//               <View style={styles.trustStars}>
//                 {[1, 2, 3, 4, 5].map((i) => (
//                   <Ionicons key={i} name={i <= trustDots ? 'star' : 'star-outline'} size={18} color="#F59E0B" />
//                 ))}
//               </View>
//               <View style={styles.trustScoreBadge}>
//                 <Text style={styles.trustScoreNum}>{trustScore}</Text>
//                 <Text style={styles.trustScoreOf}>/5</Text>
//               </View>
//             </View>
//           </View>
//         </SectionCard>

//         {/* ── 3. VERIFICATION DETAILS ── */}
//         {isVerified && verifiedDocuments.length > 0 && (
//           <SectionCard>
//             <SectionTitle title="Verification Details" />
//             <Text style={styles.verificationInfoText}>
//               This user is verified through:
//             </Text>
//             <View style={styles.verifiedDocsContainer}>
//               {verifiedDocuments.map((docType, index) => (
//                 <View key={index} style={styles.verifiedDocItem}>
//                   <View style={styles.verifiedDocIcon}>
//                     <Ionicons name={getDocumentIcon(docType)} size={20} color="#22C55E" />
//                   </View>
//                   <Text style={styles.verifiedDocText}>
//                     {getDocumentDisplayName(docType)}
//                   </Text>
//                 </View>
//               ))}
//             </View>
//           </SectionCard>
//         )}

//         {/* ── 4. BADGES ── */}
//         <SectionCard>
//           <SectionTitle title="Badges & Achievements" />
//           <View style={styles.badgesRow}>
//             {isVerified && (
//               <BadgeItem icon="shield-checkmark-outline" iconColor="#1A56DB" bgColor="#EFF6FF" title="Identity Verified" desc="Successfully verified identity with government ID." />
//             )}
//             {rating >= 4.5 && totalRatings > 0 && (
//               <BadgeItem icon="star-outline" iconColor="#F59E0B" bgColor="#FFFBEB" title="Top Rated" desc={`Average rating of ${rating.toFixed(1)} stars from ${totalRatings} reviews.`} />
//             )}
//             {stats.posted_rides >= 50 && (
//               <BadgeItem icon="car-outline" iconColor="#10B981" bgColor="#ECFDF5" title="Experienced" desc="Completed 50+ rides on the platform." />
//             )}
//             {!isVerified && rating < 4.5 && (!stats.posted_rides || stats.posted_rides < 50) && (
//               <Text style={styles.noBadgeText}>No badges yet. Keep riding to earn them!</Text>
//             )}
//           </View>
//         </SectionCard>

//         {/* ── 5. STATISTICS ── */}
//         <SectionCard>
//           <SectionTitle title="Statistics" />
//           <View style={styles.statsGrid}>
//             <StatItem icon="time-outline" value={`${stats.on_time_rate ?? 98}%`} label="On-Time Rate" />
//             <StatItem icon="chatbubble-ellipses-outline" value={`${stats.response_rate ?? 95}%`} label="Response Rate" />
//             <StatItem icon="thumbs-up-outline" value={stats.posted_rides ?? 0} label="Completed" />
//             <StatItem icon="close-circle-outline" value={stats.cancelled_rides ?? 0} label="Cancelled" />
//           </View>
//         </SectionCard>

//         {/* ── 6. ABOUT ── */}
//         <SectionCard>
//           <SectionTitle title="About" />
//           <Text style={styles.bioText}>{aboutText}</Text>
//         </SectionCard>

//         {/* ── 7. TRAVEL PREFERENCES ── */}
//         <SectionCard>
//           <SectionTitle title="Travel Preferences" />
//           {travelPreferences && Object.keys(travelPreferences).length > 0 ? (
//             <View style={styles.genericPrefsGrid}>
//               {Object.entries(travelPreferences).map(([key, value]) => {
//                 if (value === null || value === undefined || value === '') return null;
                
//                 return (
//                   <GenericPrefItem
//                     key={key}
//                     prefKey={key}
//                     value={value}
//                   />
//                 );
//               })}
//             </View>
//           ) : (
//             <View style={styles.noPreferencesContainer}>
//               <Ionicons name="options-outline" size={32} color="#9CA3AF" />
//               <Text style={styles.noPreferencesText}>No travel preferences set</Text>
//               <Text style={styles.noPreferencesSubText}>This user hasn't specified any preferences yet</Text>
//             </View>
//           )}
//         </SectionCard>

//         {/* ── 8. VEHICLE WITH IMAGE SLIDER ── */}
//         {vehicle && (
//           <SectionCard>
//             <SectionTitle title="Vehicle Details" />
//             <View style={styles.vehicleCard}>
//               <View style={styles.vehicleIconCircle}>
//                 <Ionicons name="car-sport-outline" size={26} color="#1A56DB" />
//               </View>
//               <View style={{ flex: 1, marginLeft: 14 }}>
//                 <Text style={styles.vehicleName}>{vehicleName || 'Vehicle'}</Text>
//                 <Text style={styles.vehicleSubDetail}>
//                   {[vehicle.vehicle_type, vehicle.body_type, vehicle.color].filter(Boolean).join(' · ')}
//                 </Text>
//               </View>
//               {vehicle.registration_number && (
//                 <View style={styles.licensePlate}>
//                   <Text style={styles.licensePlateText}>{vehicle.registration_number}</Text>
//                 </View>
//               )}
//             </View>
            
//             {/* Vehicle Images Slider */}
//             {vehicleImages.length > 0 ? (
//               <VehicleImageSlider 
//                 images={vehicleImages} 
//                 onImagePress={handleVehicleImagePress}
//               />
//             ) : (
//               <View style={styles.noVehicleImagesContainer}>
//                 <Ionicons name="car-outline" size={40} color="#D1D5DB" />
//                 <Text style={styles.noVehicleImagesText}>No vehicle photos available</Text>
//               </View>
//             )}
//           </SectionCard>
//         )}

//         {/* ── 9. REVIEWS ── */}
//         {reviews.length > 0 && (
//           <SectionCard>
//             <View style={styles.reviewsHeader}>
//               <SectionTitle title={`Reviews (${reviews.length})`} />
//               <View style={styles.reviewsRating}>
//                 <Ionicons name="star" size={16} color="#F59E0B" />
//                 <Text style={styles.reviewsRatingText}>{rating.toFixed(1)}</Text>
//               </View>
//             </View>
//             {reviews.slice(0, 4).map((review, idx) => (
//               <ReviewItem 
//                 key={idx} 
//                 review={review} 
//                 onImagePress={handleReviewerImagePress}
//               />
//             ))}
//           </SectionCard>
//         )}

//         <View style={{ height: 110 }} />
//       </ScrollView>

//       {/* ── 10. FIXED BOTTOM BUTTONS ── */}
//       <View style={styles.fixedActionBar}>
//         <TouchableOpacity style={styles.messageBtn} onPress={handleStartChat} activeOpacity={0.85}>
//           <Ionicons name="chatbubble-outline" size={20} color="#fff" />
//           <Text style={styles.messageBtnText}>Message</Text>
//         </TouchableOpacity>
//         <TouchableOpacity style={styles.reportBtn} onPress={handleReport} activeOpacity={0.85}>
//           <Ionicons name="flag-outline" size={20} color="#6B7280" />
//           <Text style={styles.reportBtnText}>Report</Text>
//         </TouchableOpacity>
//       </View>

//       {/* ── 11. IMAGE PREVIEW MODAL ── */}
//       <ImagePreviewModal
//         visible={previewVisible}
//         imageUrl={previewImageUrl}
//         driverName={previewTitle}
//         onClose={() => setPreviewVisible(false)}
//       />

//       <CustomAlert
//         visible={alertVisible}
//         title={alertConfig.title}
//         message={alertConfig.message}
//         icon={alertConfig.icon}
//         iconColor={alertConfig.iconColor}
//         buttons={alertConfig.buttons}
//         onBackdropPress={() => setAlertVisible(false)}
//       />
//     </SafeAreaView>
//   );
// }

// // ─── Styles ───────────────────────────────────────────────────────────────────

// const styles = StyleSheet.create({
//   container: { flex: 1, backgroundColor: '#F3F4F6' },
//   loaderContainer: { 
//     flex: 1, 
//     justifyContent: 'center', 
//     alignItems: 'center',
//     backgroundColor: '#fff',
//   },
//   header: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 14, backgroundColor: '#fff', borderBottomWidth: 0.5, borderBottomColor: '#E5E7EB' },
//   backBtn: { width: 44, height: 44, justifyContent: 'center' },
//   headerTitle: { flex: 1, textAlign: 'center', fontSize: 18, fontWeight: '700', color: '#111827' },
//   errorWrap: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingHorizontal: 30 },
//   errorTitle: { fontSize: 20, fontWeight: '700', color: '#111827', marginTop: 16 },
//   errorSub: { fontSize: 14, color: '#9CA3AF', marginTop: 8, textAlign: 'center' },
//   retryBtn: { marginTop: 20, backgroundColor: '#1A56DB', paddingHorizontal: 28, paddingVertical: 12, borderRadius: 14 },
//   retryBtnText: { color: '#fff', fontWeight: '700', fontSize: 15 },
//   scrollContent: { paddingBottom: 20 },

//   headerWrapper: {
//     width: '100%',
//     borderBottomLeftRadius: 32,
//     borderBottomRightRadius: 32,
//     overflow: 'hidden',
//     paddingTop: Platform.OS === 'ios' ? 60 : 48,
//     paddingBottom: 28,
//   },
//   headerBgImage: {
//     position: 'absolute',
//     top: 0, left: 0, right: 0, bottom: 0,
//     width: '90%', height: '150%',
//     opacity: 0.35,
//   },
//   backBtnLight: { position: 'absolute', top: Platform.OS === 'ios' ? 56 : 44, left: 16, width: 40, height: 40, justifyContent: 'center', zIndex: 10 },
//   headerContent: { alignItems: 'center', paddingHorizontal: 20 },
//   profileImageContainer: { marginBottom: 12, position: 'relative' },
//   profileImage: { width: 100, height: 100, borderRadius: 50, borderWidth: 3, borderColor: 'rgba(255,255,255,0.5)' },
//   svgProfileContainer: {
//     width: 100,
//     height: 100,
//     borderRadius: 50,
//     overflow: 'hidden',
//     borderWidth: 3,
//     borderColor: 'rgba(255,255,255,0.5)',
//     backgroundColor: 'rgba(255,255,255,0.2)',
//     alignItems: 'center',
//     justifyContent: 'center',
//   },
//   initialsCircle: { width: 100, height: 100, borderRadius: 50, backgroundColor: 'rgba(255,255,255,0.2)', alignItems: 'center', justifyContent: 'center', borderWidth: 3, borderColor: 'rgba(255,255,255,0.4)' },
//   initialsText: { fontSize: 34, fontWeight: '800', color: '#fff' },
//   verifiedBadge: { position: 'absolute', bottom: 2, right: 2, backgroundColor: '#fff', borderRadius: 12, padding: 2 },
//   verifiedLabelContainer: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 6, backgroundColor: 'rgba(34, 197, 94, 0.15)', paddingHorizontal: 12, paddingVertical: 4, borderRadius: 20 },
//   verifiedLabelText: { fontSize: 12, color: '#22C55E', fontWeight: '600' },
//   profileName: { fontSize: 22, fontWeight: '800', color: '#fff', textAlign: 'center' },
//   ratingRow: { flexDirection: 'row', alignItems: 'center', gap: 5, marginTop: 6 },
//   ratingText: { fontSize: 16, fontWeight: '700', color: '#fff' },
//   ratingCount: { fontSize: 13, color: 'rgba(255,255,255,0.75)' },
//   memberSince: { fontSize: 12, color: 'rgba(255,255,255,0.7)', marginTop: 4 },

//   sectionCard: { backgroundColor: '#fff', borderRadius: 20, padding: 18, marginHorizontal: 16, marginTop: 14, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.06, shadowRadius: 8, elevation: 2 },
//   sectionTitle: { fontSize: 16, fontWeight: '800', color: '#111827', marginBottom: 14 },

//   verificationInfoText: { fontSize: 13, color: '#6B7280', marginBottom: 12 },
//   verifiedDocsContainer: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
//   verifiedDocItem: { flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: '#F0FDF4', paddingHorizontal: 14, paddingVertical: 8, borderRadius: 24 },
//   verifiedDocIcon: { width: 28, height: 28, borderRadius: 14, backgroundColor: '#DCFCE7', alignItems: 'center', justifyContent: 'center' },
//   verifiedDocText: { fontSize: 14, fontWeight: '600', color: '#166534' },

//   trustRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
//   trustLeft: { flexDirection: 'row', alignItems: 'center', gap: 12 },
//   trustIconCircle: { width: 40, height: 40, borderRadius: 12, backgroundColor: '#FFFBEB', alignItems: 'center', justifyContent: 'center' },
//   trustLabel: { fontSize: 15, fontWeight: '700', color: '#111827' },
//   trustSubLabel: { fontSize: 12, color: '#F59E0B', fontWeight: '600', marginTop: 2 },
//   trustRight: { alignItems: 'flex-end', gap: 6 },
//   trustStars: { flexDirection: 'row', gap: 3 },
//   trustScoreBadge: { flexDirection: 'row', alignItems: 'baseline', gap: 1 },
//   trustScoreNum: { fontSize: 22, fontWeight: '800', color: '#F59E0B' },
//   trustScoreOf: { fontSize: 13, color: '#9CA3AF', fontWeight: '500' },

//   badgesRow: { gap: 12 },
//   badgeItem: { flexDirection: 'row', alignItems: 'flex-start', gap: 12 },
//   badgeIconCircle: { width: 42, height: 42, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
//   badgeTitle: { fontSize: 14, fontWeight: '700', color: '#111827' },
//   badgeDesc: { fontSize: 12, color: '#6B7280', marginTop: 2, lineHeight: 18 },
//   noBadgeText: { fontSize: 13, color: '#9CA3AF', textAlign: 'center', paddingVertical: 8 },

//   statsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
//   statItem: { flex: 1, minWidth: (width - 32 - 36 - 12) / 2, backgroundColor: '#F9FAFB', borderRadius: 14, padding: 14, alignItems: 'center' },
//   statIconCircle: { width: 40, height: 40, borderRadius: 20, backgroundColor: '#EFF6FF', alignItems: 'center', justifyContent: 'center', marginBottom: 8 },
//   statValue: { fontSize: 20, fontWeight: '800', color: '#111827' },
//   statLabel: { fontSize: 11, color: '#9CA3AF', marginTop: 3, textAlign: 'center' },

//   bioText: { fontSize: 14, color: '#4B5563', lineHeight: 22 },

//   genericPrefsGrid: {
//     flexDirection: 'row',
//     flexWrap: 'wrap',
//     gap: 10,
//   },
//   genericPrefItem: {
//     flex: 1,
//     flexDirection: 'row',
//     alignItems: 'center',
//     gap: 10,
//     paddingHorizontal: 14,
//     paddingVertical: 12,
//     borderRadius: 12,
//     minWidth: (width - 32 - 36 - 10) / 2,
//   },
//   genericPrefContent: {
//     flex: 1,
//   },
//   genericPrefLabel: {
//     fontSize: 13,
//     fontWeight: '600',
//     color: '#374151',
//     marginBottom: 2,
//   },
//   genericPrefValue: {
//     fontSize: 12,
//     fontWeight: '500',
//   },
//   noPreferencesContainer: {
//     alignItems: 'center',
//     justifyContent: 'center',
//     paddingVertical: 24,
//     width: '100%',
//   },
//   noPreferencesText: {
//     fontSize: 16,
//     fontWeight: '600',
//     color: '#6B7280',
//     marginTop: 12,
//   },
//   noPreferencesSubText: {
//     fontSize: 13,
//     color: '#9CA3AF',
//     marginTop: 4,
//     textAlign: 'center',
//   },

//   vehicleCard: { flexDirection: 'row', alignItems: 'center' },
//   vehicleIconCircle: { width: 52, height: 52, borderRadius: 14, backgroundColor: '#EFF6FF', alignItems: 'center', justifyContent: 'center' },
//   vehicleName: { fontSize: 16, fontWeight: '700', color: '#111827' },
//   vehicleSubDetail: { fontSize: 13, color: '#6B7280', marginTop: 2 },
//   licensePlate: { backgroundColor: '#F9FAFB', borderRadius: 8, paddingHorizontal: 10, paddingVertical: 6, borderWidth: 1, borderColor: '#E5E7EB' },
//   licensePlateText: { fontSize: 13, fontWeight: '700', color: '#111827', letterSpacing: 1 },

//   // Slider Styles
//   sliderContainer: {
//     marginTop: 14,
//     position: 'relative',
//     borderRadius: 16,
//     overflow: 'hidden',
//     backgroundColor: '#F9FAFB',
//   },
//   sliderImageContainer: {
//     width: width - 60,
//     height: 200,
//     borderRadius: 12,
//     overflow: 'hidden',
//   },
//   sliderImage: {
//     width: '100%',
//     height: '100%',
//     borderRadius: 12,
//   },
//   sliderSvgContainer: {
//     width: '100%',
//     height: '100%',
//     borderRadius: 12,
//     alignItems: 'center',
//     justifyContent: 'center',
//     backgroundColor: '#F3F4F6',
//   },
//   paginationContainer: {
//     position: 'absolute',
//     bottom: 12,
//     left: 0,
//     right: 0,
//     flexDirection: 'row',
//     justifyContent: 'center',
//     alignItems: 'center',
//     gap: 8,
//   },
//   paginationDot: {
//     width: 6,
//     height: 6,
//     borderRadius: 3,
//     backgroundColor: 'rgba(255, 255, 255, 0.5)',
//   },
//   paginationDotActive: {
//     width: 20,
//     height: 6,
//     borderRadius: 3,
//     backgroundColor: '#fff',
//   },
//   imageCounterBadge: {
//     position: 'absolute',
//     top: 12,
//     right: 12,
//     backgroundColor: 'rgba(0, 0, 0, 0.6)',
//     paddingHorizontal: 8,
//     paddingVertical: 4,
//     borderRadius: 12,
//   },
//   imageCounterText: {
//     color: '#fff',
//     fontSize: 11,
//     fontWeight: '600',
//   },
//   noVehicleImagesContainer: {
//     marginTop: 14,
//     paddingVertical: 30,
//     alignItems: 'center',
//     justifyContent: 'center',
//     backgroundColor: '#F9FAFB',
//     borderRadius: 12,
//   },
//   noVehicleImagesText: {
//     fontSize: 13,
//     color: '#9CA3AF',
//     marginTop: 8,
//   },

//   reviewsHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 0 },
//   reviewsRating: { flexDirection: 'row', alignItems: 'center', gap: 4 },
//   reviewsRatingText: { fontSize: 16, fontWeight: '700', color: '#F59E0B' },
//   reviewItem: { paddingVertical: 14, borderTopWidth: 1, borderTopColor: '#F3F4F6', marginTop: 6 },
//   reviewHeader: { flexDirection: 'row', alignItems: 'flex-start', gap: 10 },
//   reviewAvatar: { width: 40, height: 40, borderRadius: 20, backgroundColor: '#E5E7EB', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' },
//   reviewAvatarImg: { width: 40, height: 40 },
//   reviewSvgContainer: {
//     width: 40,
//     height: 40,
//     borderRadius: 20,
//     overflow: 'hidden',
//     alignItems: 'center',
//     justifyContent: 'center',
//     backgroundColor: '#E5E7EB',
//   },
//   reviewAvatarText: { fontSize: 14, fontWeight: '700', color: '#374151' },
//   reviewName: { fontSize: 14, fontWeight: '700', color: '#111827' },
//   reviewMeta: { flexDirection: 'row', gap: 10, marginTop: 2, flexWrap: 'wrap' },
//   reviewRoute: { fontSize: 11, color: '#9CA3AF' },
//   reviewDate: { fontSize: 11, color: '#9CA3AF' },
//   reviewComment: { fontSize: 13, color: '#4B5563', lineHeight: 20, marginTop: 8 },

//   fixedActionBar: { position: 'absolute', bottom: 0, left: 0, right: 0, flexDirection: 'row', gap: 12, paddingHorizontal: 16, paddingTop: 12, paddingBottom: Platform.OS === 'ios' ? 30 : 16, backgroundColor: '#fff', borderTopWidth: 1, borderTopColor: '#F3F4F6', shadowColor: '#000', shadowOffset: { width: 0, height: -4 }, shadowOpacity: 0.06, shadowRadius: 12, elevation: 10 },
//   messageBtn: { flex: 2, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, backgroundColor: '#1A56DB', borderRadius: 16, paddingVertical: 15, shadowColor: '#1A56DB', shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.25, shadowRadius: 12, elevation: 4 },
//   messageBtnText: { color: '#fff', fontSize: 16, fontWeight: '700' },
//   reportBtn: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, backgroundColor: '#fff', borderRadius: 16, paddingVertical: 15, borderWidth: 1, borderColor: '#E5E7EB' },
//   reportBtnText: { color: '#6B7280', fontSize: 15, fontWeight: '600' },

//   modalBackdrop: {
//     flex: 1,
//     backgroundColor: 'rgba(0,0,0,0.9)',
//     justifyContent: 'center',
//     alignItems: 'center',
//   },
//   imageModalContainer: {
//     flex: 1,
//     justifyContent: 'center',
//     alignItems: 'center',
//     width: '100%',
//   },
//   imageModalContent: {
//     width: '90%',
//     backgroundColor: Colors.white,
//     borderRadius: 20,
//     overflow: 'hidden',
//     maxHeight: '80%',
//   },
//   imageModalHeader: {
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//     alignItems: 'center',
//     padding: 16,
//     borderBottomWidth: 1,
//     borderBottomColor: '#EEF2F7',
//   },
//   imageModalTitle: {
//     fontSize: 18,
//     fontWeight: '700',
//     color: Colors.dark,
//   },
//   fullProfileImage: {
//     width: '100%',
//     height: 400,
//     backgroundColor: '#F5F5F5',
//   },
//   modalSvgContainer: {
//     width: '100%',
//     height: 400,
//     backgroundColor: '#F5F5F5',
//     alignItems: 'center',
//     justifyContent: 'center',
//   },
//   noImageContainer: {
//     width: '100%',
//     height: 400,
//     justifyContent: 'center',
//     alignItems: 'center',
//     backgroundColor: '#F5F5F5',
//   },
//   noImageText: {
//     fontSize: 16,
//     color: Colors.gray,
//   },
// });
import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  StatusBar,
  Image,
  Dimensions,
  Platform,
  Modal,
  FlatList,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons, MaterialIcons, MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useFocusEffect } from '@react-navigation/native';
import LottieView from "lottie-react-native";
import { SvgCssUri } from 'react-native-svg/css';

import { Colors } from '../constants/Colors';
import { API_BASE_URL } from '../config/config_ip';
import { useAuth } from '../context/AuthContext';
import CustomAlert from '../components/CustomAlert';

const { width, height } = Dimensions.get('window');

// ─── Helpers ──────────────────────────────────────────────────────────────────

function buildImageUrl(url) {
  if (!url) return null;
  if (url.startsWith('http://') || url.startsWith('https://')) return url;
  return `${API_BASE_URL}${url.startsWith('/') ? '' : '/'}${url}`;
}

function getInitials(name) {
  if (!name) return 'U';
  const parts = name.trim().split(' ').filter(Boolean);
  if (parts.length > 1) return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
  return parts[0].slice(0, 2).toUpperCase();
}

function formatJoinDate(dateString) {
  if (!dateString) return 'Recently joined';
  try {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
  } catch {
    return 'Recently joined';
  }
}

function formatReviewDate(dateString) {
  if (!dateString) return '';
  try {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
  } catch {
    return '';
  }
}

async function fetchPublicProfile(phoneNumber, userId) {
  try {
    const params = new URLSearchParams();
    
    if (userId) {
      params.append('user_id', userId);
    } else if (phoneNumber) {
      params.append('phone_number', phoneNumber);
    } else {
      return null;
    }
    
    const url = `${API_BASE_URL}/api/v1/users/profile-public?${params.toString()}`;
    console.log('Fetching profile from:', url);
    
    const res = await fetch(url, { 
      headers: { 
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      } 
    });
    
    if (!res.ok) {
      console.log('Profile fetch failed with status:', res.status);
      return null;
    }
    
    const data = await res.json();
    console.log('Profile data received:', JSON.stringify(data, null, 2));
    return data;
  } catch (e) {
    console.log('fetchPublicProfile error:', e);
    return null;
  }
}

async function fetchUserDocuments(phoneNumber) {
  try {
    const url = `${API_BASE_URL}/api/v1/documents/user/${phoneNumber}`;
    console.log('Fetching documents from:', url);
    const res = await fetch(url, { headers: { Accept: 'application/json' } });
    if (!res.ok) {
      console.log('Documents fetch failed with status:', res.status);
      return null;
    }
    const data = await res.json();
    console.log('Documents data received:', JSON.stringify(data, null, 2));
    return data;
  } catch (e) {
    console.log('fetchUserDocuments error:', e);
    return null;
  }
}

async function fetchUserPreferences(phoneNumber) {
  try {
    const url = `${API_BASE_URL}/api/v1/matching-preferences/user?phone_number=${phoneNumber}`;
    const res = await fetch(url);
    if (!res.ok) return null;
    const data = await res.json();
    console.log('Direct preferences fetched:', data);
    return data;
  } catch (e) {
    console.log('fetchUserPreferences error:', e);
    return null;
  }
}

// ─── Vehicle Image Slider Component ───────────────────────────────────────────

function VehicleImageSlider({ images, onImagePress }) {
  const [activeIndex, setActiveIndex] = useState(0);
  
  if (!images || images.length === 0) return null;
  
  const renderImageItem = ({ item, index }) => {
    const imageUrl = buildImageUrl(item);
    const isSvg = imageUrl ? imageUrl.toLowerCase().includes('.svg') : false;
    
    return (
      <TouchableOpacity 
        key={index}
        activeOpacity={0.9}
        onPress={() => onImagePress && onImagePress(imageUrl, `Vehicle Photo ${index + 1}`)}
        style={styles.sliderImageContainer}
      >
        {isSvg ? (
          <View style={styles.sliderSvgContainer}>
            <SvgCssUri
              uri={imageUrl}
              width={width - 60}
              height={200}
              onError={(e) => console.log('Vehicle SVG load error:', e)}
            />
          </View>
        ) : (
          <Image 
            source={{ uri: imageUrl }} 
            style={styles.sliderImage}
            resizeMode="cover"
            onError={(e) => console.log('Vehicle image load error:', e.nativeEvent.error)}
          />
        )}
      </TouchableOpacity>
    );
  };
  
  return (
    <View style={styles.sliderContainer}>
      <FlatList
        data={images}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        keyExtractor={(item, index) => `vehicle_img_${index}`}
        renderItem={renderImageItem}
        onMomentumScrollEnd={(event) => {
          const index = Math.round(event.nativeEvent.contentOffset.x / (width - 60));
          setActiveIndex(index);
        }}
        getItemLayout={(data, index) => ({
          length: width - 60,
          offset: (width - 60) * index,
          index,
        })}
      />
      
      {/* Pagination Dots */}
      {images.length > 1 && (
        <View style={styles.paginationContainer}>
          {images.map((_, index) => (
            <View
              key={index}
              style={[
                styles.paginationDot,
                index === activeIndex && styles.paginationDotActive,
              ]}
            />
          ))}
        </View>
      )}
      
      {/* Image Counter Badge */}
      {images.length > 1 && (
        <View style={styles.imageCounterBadge}>
          <Text style={styles.imageCounterText}>
            {activeIndex + 1} / {images.length}
          </Text>
        </View>
      )}
    </View>
  );
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function StarRow({ rating, size = 14, color = '#F59E0B' }) {
  return (
    <View style={{ flexDirection: 'row', gap: 2 }}>
      {[1, 2, 3, 4, 5].map((i) => (
        <Ionicons
          key={i}
          name={i <= Math.round(rating) ? 'star' : 'star-outline'}
          size={size}
          color={color}
        />
      ))}
    </View>
  );
}

function SectionCard({ children, style }) {
  return <View style={[styles.sectionCard, style]}>{children}</View>;
}

function SectionTitle({ title }) {
  return <Text style={styles.sectionTitle}>{title}</Text>;
}

function BadgeItem({ icon, iconColor, bgColor, title, desc }) {
  return (
    <View style={styles.badgeItem}>
      <View style={[styles.badgeIconCircle, { backgroundColor: bgColor }]}>
        <Ionicons name={icon} size={20} color={iconColor} />
      </View>
      <View style={{ flex: 1 }}>
        <Text style={styles.badgeTitle}>{title}</Text>
        <Text style={styles.badgeDesc}>{desc}</Text>
      </View>
    </View>
  );
}

function StatItem({ icon, value, label }) {
  return (
    <View style={styles.statItem}>
      <View style={styles.statIconCircle}>
        <Ionicons name={icon} size={20} color="#1A56DB" />
      </View>
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

function GenericPrefItem({ prefKey, value }) {
  const getIconForPreference = (key) => {
    const icons = {
      'music': 'musical-notes-outline',
      'ac': 'snow-outline',
      'pets': 'paw-outline',
      'smoking': 'flame-outline',
      'speak_languages': 'chatbubbles-outline',
      'chat_level': 'chatbox-outline',
      'age_category': 'people-outline',
      'detours': 'map-outline',
      'helmet_policy_driver': 'hard-hat-outline',
      'gender_preference': 'male-female-outline',
      'verified_profiles_only': 'shield-checkmark-outline'
    };
    return icons[key] || 'options-outline';
  };

  const formatDisplayValue = (val) => {
    if (typeof val === 'boolean') {
      return val ? 'Yes' : 'No';
    }
    if (typeof val === 'string') {
      return val;
    }
    if (Array.isArray(val)) {
      return val.join(', ');
    }
    return val ? 'Enabled' : 'Disabled';
  };

  const formatKeyForDisplay = (key) => {
    return key.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
  };

  const isEnabled = typeof value === 'boolean' ? value : true;

  return (
    <View style={[styles.genericPrefItem, { backgroundColor: isEnabled ? '#F0FDF4' : '#FEF2F2' }]}>
      <Ionicons name={getIconForPreference(prefKey)} size={20} color={isEnabled ? '#10B981' : '#EF4444'} />
      <View style={styles.genericPrefContent}>
        <Text style={styles.genericPrefLabel}>{formatKeyForDisplay(prefKey)}</Text>
        <Text style={[styles.genericPrefValue, { color: isEnabled ? '#10B981' : '#EF4444' }]}>
          {formatDisplayValue(value)}
        </Text>
      </View>
    </View>
  );
}

function ReviewItem({ review, onImagePress }) {
  const reviewerPhotoUrl = buildImageUrl(review.reviewer_photo);
  const isSvg = reviewerPhotoUrl ? reviewerPhotoUrl.toLowerCase().includes('.svg') : false;
  
  return (
    <View style={styles.reviewItem}>
      <View style={styles.reviewHeader}>
        <TouchableOpacity onPress={() => reviewerPhotoUrl && onImagePress && onImagePress(reviewerPhotoUrl, review.reviewer_name)}>
          <View style={styles.reviewAvatar}>
            {reviewerPhotoUrl ? (
              isSvg ? (
                <View style={styles.reviewSvgContainer}>
                  <SvgCssUri
                    uri={reviewerPhotoUrl}
                    width={40}
                    height={40}
                    onError={(e) => console.log('Reviewer SVG load error:', e)}
                  />
                </View>
              ) : (
                <Image 
                  source={{ uri: reviewerPhotoUrl }} 
                  style={styles.reviewAvatarImg}
                  onError={(e) => console.log('Reviewer image load error:', e.nativeEvent.error)}
                />
              )
            ) : (
              <Text style={styles.reviewAvatarText}>{getInitials(review.reviewer_name)}</Text>
            )}
          </View>
        </TouchableOpacity>
        <View style={{ flex: 1 }}>
          <Text style={styles.reviewName}>{review.reviewer_name || 'Anonymous'}</Text>
          <View style={styles.reviewMeta}>
            {review.route && (
              <Text style={styles.reviewRoute}>
                <Ionicons name="location-outline" size={11} color="#9CA3AF" /> {review.route}
              </Text>
            )}
            {review.date && (
              <Text style={styles.reviewDate}>
                <Ionicons name="calendar-outline" size={11} color="#9CA3AF" /> {formatReviewDate(review.date)}
              </Text>
            )}
          </View>
        </View>
        <StarRow rating={review.rating || 5} size={13} />
      </View>
      {review.comment && <Text style={styles.reviewComment}>{review.comment}</Text>}
    </View>
  );
}

// ─── Image Preview Modal Component ───────────────────────────────────────────

function ImagePreviewModal({ visible, imageUrl, driverName, onClose }) {
  const [isSvg, setIsSvg] = useState(false);
  
  React.useEffect(() => {
    if (imageUrl) {
      setIsSvg(imageUrl.toLowerCase().includes('.svg'));
    }
  }, [imageUrl]);
  
  if (!visible) return null;
  
  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="fade"
      onRequestClose={onClose}
    >
      <TouchableOpacity 
        style={styles.modalBackdrop}
        activeOpacity={1}
        onPress={onClose}
      >
        <View style={styles.imageModalContainer}>
          <View style={styles.imageModalContent}>
            <View style={styles.imageModalHeader}>
              <Text style={styles.imageModalTitle}>{driverName || 'Profile Photo'}</Text>
              <TouchableOpacity onPress={onClose}>
                <Ionicons name="close" size={24} color={Colors.dark} />
              </TouchableOpacity>
            </View>
            {imageUrl && imageUrl !== 'null' && imageUrl !== 'undefined' ? (
              isSvg ? (
                <View style={styles.modalSvgContainer}>
                  <SvgCssUri
                    uri={imageUrl}
                    width="100%"
                    height={400}
                    onError={(e) => console.log('Modal SVG load error:', e)}
                  />
                </View>
              ) : (
                <Image
                  source={{ uri: imageUrl }}
                  style={styles.fullProfileImage}
                  resizeMode="contain"
                  onError={(e) => console.log('Modal Image load error:', e.nativeEvent.error, 'URL:', imageUrl)}
                />
              )
            ) : (
              <View style={styles.noImageContainer}>
                <Text style={styles.noImageText}>No image available</Text>
              </View>
            )}
          </View>
        </View>
      </TouchableOpacity>
    </Modal>
  );
}

// ─── Helper function to extract vehicle images from notes ─────────────────────

function extractVehicleImages(vehicle) {
  if (!vehicle) return [];
  
  console.log('Extracting images from vehicle:', vehicle);
  
  // Method 1: Check if photos array exists directly
  if (vehicle.photos && Array.isArray(vehicle.photos) && vehicle.photos.length > 0) {
    console.log('Found photos array:', vehicle.photos);
    return vehicle.photos;
  }
  
  // Method 2: Check if notes contains JSON with photos array (backend storage format)
  if (vehicle.notes && typeof vehicle.notes === 'string') {
    try {
      // Check if notes starts with JSON format
      if (vehicle.notes.startsWith('{') || vehicle.notes.startsWith('{"photos":')) {
        const parsedNotes = JSON.parse(vehicle.notes);
        console.log('Parsed notes:', parsedNotes);
        
        if (parsedNotes.photos && Array.isArray(parsedNotes.photos) && parsedNotes.photos.length > 0) {
          console.log('Found photos in notes JSON:', parsedNotes.photos);
          return parsedNotes.photos;
        }
      }
    } catch (e) {
      console.log('Notes is not JSON:', e);
    }
  }
  
  // Method 3: Check if notes is an object (already parsed)
  if (vehicle.notes && typeof vehicle.notes === 'object' && vehicle.notes.photos) {
    if (Array.isArray(vehicle.notes.photos) && vehicle.notes.photos.length > 0) {
      console.log('Found photos in notes object:', vehicle.notes.photos);
      return vehicle.notes.photos;
    }
  }
  
  // Method 4: Check for single photo_url
  if (vehicle.photo_url) {
    console.log('Using single photo_url:', vehicle.photo_url);
    return [vehicle.photo_url];
  }
  
  console.log('No vehicle images found');
  return [];
}

// ─── Main Screen ──────────────────────────────────────────────────────────────

export default function ViewProfileScreen({ navigation, route }) {
  const { phoneNumber, userId, driverName } = route.params || {};
  const { user: currentUser } = useAuth();

  const [profile, setProfile] = useState(null);
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [verifiedDocuments, setVerifiedDocuments] = useState([]);
  const [error, setError] = useState(null);
  const [travelPreferences, setTravelPreferences] = useState({});
  
  // Image preview modal state
  const [previewVisible, setPreviewVisible] = useState(false);
  const [previewImageUrl, setPreviewImageUrl] = useState(null);
  const [previewTitle, setPreviewTitle] = useState('');

  // Custom Alert states
  const [alertVisible, setAlertVisible] = useState(false);
  const [alertConfig, setAlertConfig] = useState({
    title: "",
    message: "",
    icon: "check-circle",
    iconColor: "#10B981",
    buttons: []
  });

  const showCustomAlert = (title, message, type = 'success') => {
    let icon = "check-circle";
    let iconColor = "#10B981";
    
    if (type === 'error') {
      icon = "error";
      iconColor = "#EF4444";
    } else if (type === 'warning') {
      icon = "warning";
      iconColor = "#F59E0B";
    } else if (type === 'info') {
      icon = "info";
      iconColor = "#1A56DB";
    }
    
    setAlertConfig({
      title,
      message,
      icon,
      iconColor,
      buttons: [{ text: 'OK', onPress: () => setAlertVisible(false) }]
    });
    setAlertVisible(true);
  };

  const showConfirmationAlert = (title, message, onConfirm) => {
    setAlertConfig({
      title,
      message,
      icon: "warning",
      iconColor: "#F59E0B",
      buttons: [
        { text: 'Cancel', onPress: () => setAlertVisible(false), style: 'cancel' },
        { text: 'Report', onPress: () => {
          setAlertVisible(false);
          onConfirm();
        }, style: 'destructive' }
      ]
    });
    setAlertVisible(true);
  };

  const checkVerifiedDocuments = (docs) => {
    if (!docs || !docs.length) return [];
    
    const verified = docs.filter(doc => {
      const docType = doc.document_type?.toLowerCase();
      const status = doc.status?.toUpperCase();
      return status === 'APPROVED' && ['aadhar', 'dl', 'rc'].includes(docType);
    });
    
    return verified.map(doc => doc.document_type?.toLowerCase());
  };

  const getDocumentDisplayName = (docType) => {
    const names = {
      'aadhar': 'Aadhar Card',
      'dl': 'Driving License',
      'rc': 'Registration Certificate'
    };
    return names[docType] || docType;
  };

  const getDocumentIcon = (docType) => {
    const icons = {
      'aadhar': 'card-outline',
      'dl': 'car-outline',
      'rc': 'document-text-outline'
    };
    return icons[docType] || 'document-outline';
  };

  const handleProfileImagePress = () => {
    if (profileImageUrl) {
      setPreviewImageUrl(profileImageUrl);
      setPreviewTitle(userFullName);
      setPreviewVisible(true);
    }
  };

  const handleVehicleImagePress = (imageUrl, title) => {
    if (imageUrl) {
      setPreviewImageUrl(imageUrl);
      setPreviewTitle(title || 'Vehicle Photo');
      setPreviewVisible(true);
    }
  };

  const handleReviewerImagePress = (imageUrl, reviewerName) => {
    if (imageUrl) {
      setPreviewImageUrl(imageUrl);
      setPreviewTitle(reviewerName || 'Reviewer');
      setPreviewVisible(true);
    }
  };

  const loadProfile = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      const profileData = await fetchPublicProfile(phoneNumber, userId);
      console.log('Profile API response:', profileData);
      
      if (profileData?.success && profileData.user) {
        setProfile(profileData.user);
        
        // Debug vehicle data
        if (profileData.user.vehicle) {
          console.log('====== VEHICLE DATA FROM API ======');
          console.log('Full vehicle:', JSON.stringify(profileData.user.vehicle, null, 2));
          console.log('vehicle.photo_url:', profileData.user.vehicle.photo_url);
          console.log('vehicle.notes:', profileData.user.vehicle.notes);
          console.log('===================================');
        }
        
        if (profileData.user.travel_preferences) {
          console.log('Travel preferences from profile:', profileData.user.travel_preferences);
          setTravelPreferences(profileData.user.travel_preferences);
        } else {
          const targetPhone = phoneNumber || profileData.user?.phone_number;
          if (targetPhone) {
            const prefsData = await fetchUserPreferences(targetPhone);
            if (prefsData) {
              console.log('Travel preferences from direct API:', prefsData);
              setTravelPreferences(prefsData);
            }
          }
        }
        
        const targetPhone = phoneNumber || profileData.user?.phone_number;
        if (targetPhone) {
          const docsData = await fetchUserDocuments(targetPhone);
          console.log('Documents API response:', docsData);
          
          if (docsData?.success && docsData.documents) {
            setDocuments(docsData.documents);
            const verified = checkVerifiedDocuments(docsData.documents);
            console.log('Verified documents found:', verified);
            setVerifiedDocuments(verified);
          } else {
            console.log('No documents found or API failed');
            setDocuments([]);
            setVerifiedDocuments([]);
          }
        }
      } else {
        console.log('Profile not found or API failed');
        setError('Profile not found');
      }
    } catch (err) {
      console.error('Load profile error:', err);
      setError('Failed to load profile');
    } finally {
      setLoading(false);
    }
  }, [phoneNumber, userId]);

  useFocusEffect(useCallback(() => { loadProfile(); }, [loadProfile]));

  const handleBack = () => navigation.goBack();

  const getOrCreateConversation = async (receiverPhone) => {
    try {
      const myPhone = currentUser?.phone_number;
      if (!myPhone) {
        showCustomAlert('Login Required', 'Please log in to use chat.', 'warning');
        return null;
      }
      const response = await fetch(`${API_BASE_URL}/api/chat/conversations`, {
        method: 'POST',
        headers: {
          'X-Phone-Number': myPhone,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ participant_phone: receiverPhone }),
      });
      const data = await response.json();
      if (data.success) {
        return data.conversation.id;
      }
      console.error('Failed to create conversation:', data);
      return null;
    } catch (error) {
      console.error('getOrCreateConversation error:', error);
      return null;
    }
  };

  const handleStartChat = async () => {
    if (profile?.phone_number) {
      const conversationId = await getOrCreateConversation(profile.phone_number);
      if (conversationId) {
        navigation.navigate('ChatScreen', {
          receiverPhone: profile.phone_number,
          conversationId,
          user: {
            name: profile.full_name || driverName || 'User',
            tripInfo: 'Active',
          },
        });
      } else {
        showCustomAlert('Chat', 'Unable to start chat. Please try again.', 'error');
      }
    } else {
      showCustomAlert('Chat', 'Phone number not available', 'warning');
    }
  };

  const handleReport = () => {
    showConfirmationAlert(
      'Report User',
      'Are you sure you want to report this user?',
      () => {
        showCustomAlert('Reported', 'Thank you for your report. Our team will review it.', 'success');
      }
    );
  };

  const isVerified = verifiedDocuments.length > 0;

  const profileImageUrl = buildImageUrl(profile?.profile_picture);
  const isProfilePhotoSvg = profileImageUrl ? profileImageUrl.toLowerCase().includes('.svg') : false;
  const userFullName = profile?.full_name || driverName || 'User';
  const initials = getInitials(userFullName);
  const joinDateText = formatJoinDate(profile?.created_at);
  const rating = profile?.avg_rating ?? 0;
  const totalRatings = profile?.total_ratings ?? 0;
  
  const aboutText = profile?.about || profile?.bio || 'I am happy to share the ride. Lets Drivve!';
  
  const vehicle = profile?.vehicle;
  const vehicleName = vehicle ? [vehicle.make, vehicle.model].filter(Boolean).join(' ') : null;
  const reviews = profile?.reviews || [];
  const stats = profile?.stats || {};
  const trustScore = rating.toFixed(1);
  const trustDots = Math.round(rating);

  // Extract vehicle images using the helper function
  const vehicleImages = extractVehicleImages(vehicle);
  console.log('Final vehicle images to display:', vehicleImages.length, vehicleImages);

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="dark-content" backgroundColor={Colors.white} />
        <View style={styles.loaderContainer}>
          <LottieView
            source={require("../assets/loading.json")}
            autoPlay
            loop
            style={{ width: 300, height: 300 }}
          />
        </View>
      </SafeAreaView>
    );
  }

  if (error || !profile) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="dark-content" backgroundColor={Colors.white} />
        <View style={styles.header}>
          <TouchableOpacity style={styles.backBtn} onPress={handleBack}>
            <MaterialIcons name="arrow-back-ios" size={22} color="#1A56DB" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Profile</Text>
          <View style={styles.backBtn} />
        </View>
        <View style={styles.errorWrap}>
          <Ionicons name="person-outline" size={64} color="#D1D5DB" />
          <Text style={styles.errorTitle}>Profile not found</Text>
          <Text style={styles.errorSub}>{error || "We couldn't load this user's profile."}</Text>
          <TouchableOpacity style={styles.retryBtn} onPress={loadProfile}>
            <Text style={styles.retryBtnText}>Retry</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['left', 'right']}>
      <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>

        {/* ── 1. PROFILE HEADER CARD ── */}
        <View style={styles.headerWrapper}>
          <LinearGradient
            colors={['#1A56DB', '#0D3A6F']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={StyleSheet.absoluteFillObject}
          />

          <Image
            source={require('../assets/s8.png')}
            style={styles.headerBgImage}
            resizeMode="cover"
          />

          <TouchableOpacity style={styles.backBtnLight} onPress={handleBack}>
            <MaterialIcons name="arrow-back-ios" size={22} color="#fff" />
          </TouchableOpacity>

          <View style={styles.headerContent}>
            <TouchableOpacity onPress={handleProfileImagePress}>
              <View style={styles.profileImageContainer}>
                {profileImageUrl ? (
                  isProfilePhotoSvg ? (
                    <View style={styles.svgProfileContainer}>
                      <SvgCssUri
                        uri={profileImageUrl}
                        width={100}
                        height={100}
                        onError={(e) => console.log('Profile SVG load error:', e)}
                      />
                    </View>
                  ) : (
                    <Image 
                      source={{ uri: profileImageUrl }} 
                      style={styles.profileImage}
                      onError={(e) => console.log('Profile image load error:', e.nativeEvent.error)}
                    />
                  )
                ) : (
                  <View style={styles.initialsCircle}>
                    <Text style={styles.initialsText}>{initials}</Text>
                  </View>
                )}
                {isVerified && (
                  <View style={styles.verifiedBadge}>
                    <Ionicons name="checkmark-circle" size={24} color="#22C55E" />
                  </View>
                )}
              </View>
            </TouchableOpacity>

            <Text style={styles.profileName}>{userFullName}</Text>

            {isVerified && (
              <View style={styles.verifiedLabelContainer}>
                <Ionicons name="shield-checkmark" size={14} color="#22C55E" />
                <Text style={styles.verifiedLabelText}>Verified Profile</Text>
              </View>
            )}

            <View style={styles.ratingRow}>
              <Ionicons name="star" size={16} color="#FFD700" />
              <Text style={styles.ratingText}>{rating > 0 ? rating.toFixed(1) : 'New'}</Text>
              <Text style={styles.ratingCount}>· {totalRatings} rides</Text>
            </View>

            <Text style={styles.memberSince}>Member since {joinDateText}</Text>
          </View>
        </View>

        {/* ── 2. TRUST SCORE ── */}
        <SectionCard>
          <View style={styles.trustRow}>
            <View style={styles.trustLeft}>
              <View style={styles.trustIconCircle}>
                <MaterialCommunityIcons name="trophy-outline" size={20} color="#F59E0B" />
              </View>
              <View>
                <Text style={styles.trustLabel}>Trust Score</Text>
                <Text style={styles.trustSubLabel}>
                  {trustDots >= 4 ? 'Excellent' : trustDots >= 3 ? 'Good' : 'Fair'}
                </Text>
              </View>
            </View>
            <View style={styles.trustRight}>
              <View style={styles.trustStars}>
                {[1, 2, 3, 4, 5].map((i) => (
                  <Ionicons key={i} name={i <= trustDots ? 'star' : 'star-outline'} size={18} color="#F59E0B" />
                ))}
              </View>
              <View style={styles.trustScoreBadge}>
                <Text style={styles.trustScoreNum}>{trustScore}</Text>
                <Text style={styles.trustScoreOf}>/5</Text>
              </View>
            </View>
          </View>
        </SectionCard>

        {/* ── 3. VERIFICATION DETAILS ── */}
        {isVerified && verifiedDocuments.length > 0 && (
          <SectionCard>
            <SectionTitle title="Verification Details" />
            <Text style={styles.verificationInfoText}>
              This user is verified through:
            </Text>
            <View style={styles.verifiedDocsContainer}>
              {verifiedDocuments.map((docType, index) => (
                <View key={index} style={styles.verifiedDocItem}>
                  <View style={styles.verifiedDocIcon}>
                    <Ionicons name={getDocumentIcon(docType)} size={20} color="#22C55E" />
                  </View>
                  <Text style={styles.verifiedDocText}>
                    {getDocumentDisplayName(docType)}
                  </Text>
                </View>
              ))}
            </View>
          </SectionCard>
        )}

        {/* ── 4. BADGES ── */}
        <SectionCard>
          <SectionTitle title="Badges & Achievements" />
          <View style={styles.badgesRow}>
            {isVerified && (
              <BadgeItem icon="shield-checkmark-outline" iconColor="#1A56DB" bgColor="#EFF6FF" title="Identity Verified" desc="Successfully verified identity with government ID." />
            )}
            {rating >= 4.5 && totalRatings > 0 && (
              <BadgeItem icon="star-outline" iconColor="#F59E0B" bgColor="#FFFBEB" title="Top Rated" desc={`Average rating of ${rating.toFixed(1)} stars from ${totalRatings} reviews.`} />
            )}
            {stats.posted_rides >= 50 && (
              <BadgeItem icon="car-outline" iconColor="#10B981" bgColor="#ECFDF5" title="Experienced" desc="Completed 50+ rides on the platform." />
            )}
            {!isVerified && rating < 4.5 && (!stats.posted_rides || stats.posted_rides < 50) && (
              <Text style={styles.noBadgeText}>No badges yet. Keep riding to earn them!</Text>
            )}
          </View>
        </SectionCard>

        {/* ── 5. STATISTICS ── */}
        <SectionCard>
          <SectionTitle title="Statistics" />
          <View style={styles.statsGrid}>
            <StatItem icon="time-outline" value={`${stats.on_time_rate ?? 98}%`} label="On-Time Rate" />
            <StatItem icon="chatbubble-ellipses-outline" value={`${stats.response_rate ?? 95}%`} label="Response Rate" />
            <StatItem icon="thumbs-up-outline" value={stats.posted_rides ?? 0} label="Completed" />
            <StatItem icon="close-circle-outline" value={stats.cancelled_rides ?? 0} label="Cancelled" />
          </View>
        </SectionCard>

        {/* ── 6. ABOUT ── */}
        <SectionCard>
          <SectionTitle title="About" />
          <Text style={styles.bioText}>{aboutText}</Text>
        </SectionCard>

        {/* ── 7. TRAVEL PREFERENCES ── */}
        <SectionCard>
          <SectionTitle title="Travel Preferences" />
          {travelPreferences && Object.keys(travelPreferences).length > 0 ? (
            <View style={styles.genericPrefsGrid}>
              {Object.entries(travelPreferences).map(([key, value]) => {
                if (value === null || value === undefined || value === '') return null;
                
                return (
                  <GenericPrefItem
                    key={key}
                    prefKey={key}
                    value={value}
                  />
                );
              })}
            </View>
          ) : (
            <View style={styles.noPreferencesContainer}>
              <Ionicons name="options-outline" size={32} color="#9CA3AF" />
              <Text style={styles.noPreferencesText}>No travel preferences set</Text>
              <Text style={styles.noPreferencesSubText}>This user hasn't specified any preferences yet</Text>
            </View>
          )}
        </SectionCard>

        {/* ── 8. VEHICLE WITH IMAGE SLIDER ── */}
        {vehicle && (
          <SectionCard>
            <SectionTitle title="Vehicle Details" />
            <View style={styles.vehicleCard}>
              <View style={styles.vehicleIconCircle}>
                <Ionicons name="car-sport-outline" size={26} color="#1A56DB" />
              </View>
              <View style={{ flex: 1, marginLeft: 14 }}>
                <Text style={styles.vehicleName}>{vehicleName || 'Vehicle'}</Text>
                <Text style={styles.vehicleSubDetail}>
                  {[vehicle.vehicle_type, vehicle.body_type, vehicle.color].filter(Boolean).join(' · ')}
                </Text>
              </View>
              {vehicle.registration_number && (
                <View style={styles.licensePlate}>
                  <Text style={styles.licensePlateText}>{vehicle.registration_number}</Text>
                </View>
              )}
            </View>
            
            {/* Vehicle Images Slider */}
            {vehicleImages.length > 0 ? (
              <VehicleImageSlider 
                images={vehicleImages} 
                onImagePress={handleVehicleImagePress}
              />
            ) : (
              <View style={styles.noVehicleImagesContainer}>
                <Ionicons name="car-outline" size={40} color="#D1D5DB" />
                <Text style={styles.noVehicleImagesText}>No vehicle photos available</Text>
              </View>
            )}
          </SectionCard>
        )}

        {/* ── 9. REVIEWS ── */}
        {reviews.length > 0 && (
          <SectionCard>
            <View style={styles.reviewsHeader}>
              <SectionTitle title={`Reviews (${reviews.length})`} />
              <View style={styles.reviewsRating}>
                <Ionicons name="star" size={16} color="#F59E0B" />
                <Text style={styles.reviewsRatingText}>{rating.toFixed(1)}</Text>
              </View>
            </View>
            {reviews.slice(0, 4).map((review, idx) => (
              <ReviewItem 
                key={idx} 
                review={review} 
                onImagePress={handleReviewerImagePress}
              />
            ))}
          </SectionCard>
        )}

        <View style={{ height: 110 }} />
      </ScrollView>

      {/* ── 10. FIXED BOTTOM BUTTONS ── */}
      <View style={styles.fixedActionBar}>
        <TouchableOpacity style={styles.messageBtn} onPress={handleStartChat} activeOpacity={0.85}>
          <Ionicons name="chatbubble-outline" size={20} color="#fff" />
          <Text style={styles.messageBtnText}>Message</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.reportBtn} onPress={handleReport} activeOpacity={0.85}>
          <Ionicons name="flag-outline" size={20} color="#6B7280" />
          <Text style={styles.reportBtnText}>Report</Text>
        </TouchableOpacity>
      </View>

      {/* ── 11. IMAGE PREVIEW MODAL ── */}
      <ImagePreviewModal
        visible={previewVisible}
        imageUrl={previewImageUrl}
        driverName={previewTitle}
        onClose={() => setPreviewVisible(false)}
      />

      <CustomAlert
        visible={alertVisible}
        title={alertConfig.title}
        message={alertConfig.message}
        icon={alertConfig.icon}
        iconColor={alertConfig.iconColor}
        buttons={alertConfig.buttons}
        onBackdropPress={() => setAlertVisible(false)}
      />
    </SafeAreaView>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F3F4F6' },
  loaderContainer: { 
    flex: 1, 
    justifyContent: 'center', 
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  header: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 14, backgroundColor: '#fff', borderBottomWidth: 0.5, borderBottomColor: '#E5E7EB' },
  backBtn: { width: 44, height: 44, justifyContent: 'center' },
  headerTitle: { flex: 1, textAlign: 'center', fontSize: 18, fontWeight: '700', color: '#111827' },
  errorWrap: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingHorizontal: 30 },
  errorTitle: { fontSize: 20, fontWeight: '700', color: '#111827', marginTop: 16 },
  errorSub: { fontSize: 14, color: '#9CA3AF', marginTop: 8, textAlign: 'center' },
  retryBtn: { marginTop: 20, backgroundColor: '#1A56DB', paddingHorizontal: 28, paddingVertical: 12, borderRadius: 14 },
  retryBtnText: { color: '#fff', fontWeight: '700', fontSize: 15 },
  scrollContent: { paddingBottom: 20 },

  headerWrapper: {
    width: '100%',
    borderBottomLeftRadius: 32,
    borderBottomRightRadius: 32,
    overflow: 'hidden',
    paddingTop: Platform.OS === 'ios' ? 60 : 48,
    paddingBottom: 28,
  },
  headerBgImage: {
    position: 'absolute',
    top: 0, left: 0, right: 0, bottom: 0,
    width: '90%', height: '150%',
    opacity: 0.35,
  },
  backBtnLight: { position: 'absolute', top: Platform.OS === 'ios' ? 56 : 44, left: 16, width: 40, height: 40, justifyContent: 'center', zIndex: 10 },
  headerContent: { alignItems: 'center', paddingHorizontal: 20 },
  profileImageContainer: { marginBottom: 12, position: 'relative' },
  profileImage: { width: 100, height: 100, borderRadius: 50, borderWidth: 3, borderColor: 'rgba(255,255,255,0.5)' },
  svgProfileContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    overflow: 'hidden',
    borderWidth: 3,
    borderColor: 'rgba(255,255,255,0.5)',
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  initialsCircle: { width: 100, height: 100, borderRadius: 50, backgroundColor: 'rgba(255,255,255,0.2)', alignItems: 'center', justifyContent: 'center', borderWidth: 3, borderColor: 'rgba(255,255,255,0.4)' },
  initialsText: { fontSize: 34, fontWeight: '800', color: '#fff' },
  verifiedBadge: { position: 'absolute', bottom: 2, right: 2, backgroundColor: '#fff', borderRadius: 12, padding: 2 },
  verifiedLabelContainer: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 6, backgroundColor: 'rgba(34, 197, 94, 0.15)', paddingHorizontal: 12, paddingVertical: 4, borderRadius: 20 },
  verifiedLabelText: { fontSize: 12, color: '#22C55E', fontWeight: '600' },
  profileName: { fontSize: 22, fontWeight: '800', color: '#fff', textAlign: 'center' },
  ratingRow: { flexDirection: 'row', alignItems: 'center', gap: 5, marginTop: 6 },
  ratingText: { fontSize: 16, fontWeight: '700', color: '#fff' },
  ratingCount: { fontSize: 13, color: 'rgba(255,255,255,0.75)' },
  memberSince: { fontSize: 12, color: 'rgba(255,255,255,0.7)', marginTop: 4 },

  sectionCard: { backgroundColor: '#fff', borderRadius: 20, padding: 18, marginHorizontal: 16, marginTop: 14, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.06, shadowRadius: 8, elevation: 2 },
  sectionTitle: { fontSize: 16, fontWeight: '800', color: '#111827', marginBottom: 14 },

  verificationInfoText: { fontSize: 13, color: '#6B7280', marginBottom: 12 },
  verifiedDocsContainer: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  verifiedDocItem: { flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: '#F0FDF4', paddingHorizontal: 14, paddingVertical: 8, borderRadius: 24 },
  verifiedDocIcon: { width: 28, height: 28, borderRadius: 14, backgroundColor: '#DCFCE7', alignItems: 'center', justifyContent: 'center' },
  verifiedDocText: { fontSize: 14, fontWeight: '600', color: '#166534' },

  trustRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  trustLeft: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  trustIconCircle: { width: 40, height: 40, borderRadius: 12, backgroundColor: '#FFFBEB', alignItems: 'center', justifyContent: 'center' },
  trustLabel: { fontSize: 15, fontWeight: '700', color: '#111827' },
  trustSubLabel: { fontSize: 12, color: '#F59E0B', fontWeight: '600', marginTop: 2 },
  trustRight: { alignItems: 'flex-end', gap: 6 },
  trustStars: { flexDirection: 'row', gap: 3 },
  trustScoreBadge: { flexDirection: 'row', alignItems: 'baseline', gap: 1 },
  trustScoreNum: { fontSize: 22, fontWeight: '800', color: '#F59E0B' },
  trustScoreOf: { fontSize: 13, color: '#9CA3AF', fontWeight: '500' },

  badgesRow: { gap: 12 },
  badgeItem: { flexDirection: 'row', alignItems: 'flex-start', gap: 12 },
  badgeIconCircle: { width: 42, height: 42, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  badgeTitle: { fontSize: 14, fontWeight: '700', color: '#111827' },
  badgeDesc: { fontSize: 12, color: '#6B7280', marginTop: 2, lineHeight: 18 },
  noBadgeText: { fontSize: 13, color: '#9CA3AF', textAlign: 'center', paddingVertical: 8 },

  statsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  statItem: { flex: 1, minWidth: (width - 32 - 36 - 12) / 2, backgroundColor: '#F9FAFB', borderRadius: 14, padding: 14, alignItems: 'center' },
  statIconCircle: { width: 40, height: 40, borderRadius: 20, backgroundColor: '#EFF6FF', alignItems: 'center', justifyContent: 'center', marginBottom: 8 },
  statValue: { fontSize: 20, fontWeight: '800', color: '#111827' },
  statLabel: { fontSize: 11, color: '#9CA3AF', marginTop: 3, textAlign: 'center' },

  bioText: { fontSize: 14, color: '#4B5563', lineHeight: 22 },

  genericPrefsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  genericPrefItem: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderRadius: 12,
    minWidth: (width - 32 - 36 - 10) / 2,
  },
  genericPrefContent: {
    flex: 1,
  },
  genericPrefLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 2,
  },
  genericPrefValue: {
    fontSize: 12,
    fontWeight: '500',
  },
  noPreferencesContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 24,
    width: '100%',
  },
  noPreferencesText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#6B7280',
    marginTop: 12,
  },
  noPreferencesSubText: {
    fontSize: 13,
    color: '#9CA3AF',
    marginTop: 4,
    textAlign: 'center',
  },

  vehicleCard: { flexDirection: 'row', alignItems: 'center' },
  vehicleIconCircle: { width: 52, height: 52, borderRadius: 14, backgroundColor: '#EFF6FF', alignItems: 'center', justifyContent: 'center' },
  vehicleName: { fontSize: 16, fontWeight: '700', color: '#111827' },
  vehicleSubDetail: { fontSize: 13, color: '#6B7280', marginTop: 2 },
  licensePlate: { backgroundColor: '#F9FAFB', borderRadius: 8, paddingHorizontal: 10, paddingVertical: 6, borderWidth: 1, borderColor: '#E5E7EB' },
  licensePlateText: { fontSize: 13, fontWeight: '700', color: '#111827', letterSpacing: 1 },

  // Slider Styles
  sliderContainer: {
    marginTop: 14,
    position: 'relative',
    borderRadius: 16,
    overflow: 'hidden',
    backgroundColor: '#F9FAFB',
  },
  sliderImageContainer: {
    width: width - 60,
    height: 200,
    borderRadius: 12,
    overflow: 'hidden',
  },
  sliderImage: {
    width: '100%',
    height: '100%',
    borderRadius: 12,
  },
  sliderSvgContainer: {
    width: '100%',
    height: '100%',
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F3F4F6',
  },
  paginationContainer: {
    position: 'absolute',
    bottom: 12,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
  },
  paginationDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: 'rgba(255, 255, 255, 0.5)',
  },
  paginationDotActive: {
    width: 20,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#fff',
  },
  imageCounterBadge: {
    position: 'absolute',
    top: 12,
    right: 12,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  imageCounterText: {
    color: '#fff',
    fontSize: 11,
    fontWeight: '600',
  },
  noVehicleImagesContainer: {
    marginTop: 14,
    paddingVertical: 30,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
  },
  noVehicleImagesText: {
    fontSize: 13,
    color: '#9CA3AF',
    marginTop: 8,
  },

  reviewsHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 0 },
  reviewsRating: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  reviewsRatingText: { fontSize: 16, fontWeight: '700', color: '#F59E0B' },
  reviewItem: { paddingVertical: 14, borderTopWidth: 1, borderTopColor: '#F3F4F6', marginTop: 6 },
  reviewHeader: { flexDirection: 'row', alignItems: 'flex-start', gap: 10 },
  reviewAvatar: { width: 40, height: 40, borderRadius: 20, backgroundColor: '#E5E7EB', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' },
  reviewAvatarImg: { width: 40, height: 40 },
  reviewSvgContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#E5E7EB',
  },
  reviewAvatarText: { fontSize: 14, fontWeight: '700', color: '#374151' },
  reviewName: { fontSize: 14, fontWeight: '700', color: '#111827' },
  reviewMeta: { flexDirection: 'row', gap: 10, marginTop: 2, flexWrap: 'wrap' },
  reviewRoute: { fontSize: 11, color: '#9CA3AF' },
  reviewDate: { fontSize: 11, color: '#9CA3AF' },
  reviewComment: { fontSize: 13, color: '#4B5563', lineHeight: 20, marginTop: 8 },

  fixedActionBar: { position: 'absolute', bottom: 0, left: 0, right: 0, flexDirection: 'row', gap: 12, paddingHorizontal: 16, paddingTop: 12, paddingBottom: Platform.OS === 'ios' ? 30 : 16, backgroundColor: '#fff', borderTopWidth: 1, borderTopColor: '#F3F4F6', shadowColor: '#000', shadowOffset: { width: 0, height: -4 }, shadowOpacity: 0.06, shadowRadius: 12, elevation: 10 },
  messageBtn: { flex: 2, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, backgroundColor: '#1A56DB', borderRadius: 16, paddingVertical: 15, shadowColor: '#1A56DB', shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.25, shadowRadius: 12, elevation: 4 },
  messageBtnText: { color: '#fff', fontSize: 16, fontWeight: '700' },
  reportBtn: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, backgroundColor: '#fff', borderRadius: 16, paddingVertical: 15, borderWidth: 1, borderColor: '#E5E7EB' },
  reportBtnText: { color: '#6B7280', fontSize: 15, fontWeight: '600' },

  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.9)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  imageModalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
  },
  imageModalContent: {
    width: '90%',
    backgroundColor: Colors.white,
    borderRadius: 20,
    overflow: 'hidden',
    maxHeight: '80%',
  },
  imageModalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#EEF2F7',
  },
  imageModalTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.dark,
  },
  fullProfileImage: {
    width: '100%',
    height: 400,
    backgroundColor: '#F5F5F5',
  },
  modalSvgContainer: {
    width: '100%',
    height: 400,
    backgroundColor: '#F5F5F5',
    alignItems: 'center',
    justifyContent: 'center',
  },
  noImageContainer: {
    width: '100%',
    height: 400,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F5F5F5',
  },
  noImageText: {
    fontSize: 16,
    color: Colors.gray,
  },
});