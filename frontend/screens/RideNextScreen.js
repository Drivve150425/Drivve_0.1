// import React, { useState, useEffect, useCallback, useMemo } from 'react';
// import {
//   View,
//   Text,
//   StyleSheet,
//   TouchableOpacity,
//   FlatList,
//   StatusBar,
//   Platform,
//   Image,
//   ScrollView,
//   Modal,
//   Alert,
// } from 'react-native';
// import { SafeAreaView } from 'react-native-safe-area-context';
// import { Ionicons, MaterialIcons } from '@expo/vector-icons';
// import LottieView from "lottie-react-native";
// import { Colors, Typography } from '../constants/Colors';
// import { useAuth } from '../context/AuthContext';
// import { API_BASE_URL } from '../config/config_ip';
// import DatabaseService from '../services/matchingpreference_ds';
// import CustomAlert from '../components/CustomAlert';
// import { SvgCssUri } from 'react-native-svg/css';

// const IMAGE_BASE_URL = API_BASE_URL;
// import { useFocusEffect } from '@react-navigation/native'; // Add this import

// const QUICK_FILTER_KEYS = [
//   'verified_profiles_only',
//   'same_gender_after_9pm',
//   'smoking_policy',
//   'pets_allowed',
//   'chat_level',
//   'luggage_allowance',
// ];

// const QUICK_FILTER_LABELS = {
//   verified_profiles_only: 'Verified Only',
//   same_gender_after_9pm: 'Same Gender Night',
//   smoking_policy: 'No Smoking',
//   pets_allowed: 'Pets',
//   chat_level: 'Chat Level',
//   luggage_allowance: 'Luggage',
// };

// const ICON_MAP = {
//   smoking_policy: 'smoking',
//   speak_languages: 'language',
//   chat_level: 'chat',
//   age_category: 'person',
//   gender_preference: 'wc',
//   luggage_allowance: 'luggage',
//   pets_allowed: 'pets',
//   detours: 'alt-route',
//   helmet_policy_driver: 'sports-motorsports',
//   helmet_policy_passenger: 'sports-motorsports',
//   avoid_frequent_stops: 'timer-off',
//   same_gender_after_9pm: 'nightlight',
//   verified_profiles_only: 'verified-user',
// };

// const SORT_OPTIONS = [
//   { key: 'time', label: 'Time' },
//   { key: 'price', label: 'Price' },
//   { key: 'rating', label: 'Rating' },
//   { key: 'match', label: 'Match %' },
// ];

// function buildImageUrl(url) {
//   if (!url) return null;
//   if (url.startsWith('http://') || url.startsWith('https://')) return url;
//   return `${IMAGE_BASE_URL}${url.startsWith('/') ? '' : '/'}${url}`;
// }

// function getDriverInitials(name) {
//   if (!name) return 'D';
//   const parts = name.trim().split(' ').filter(Boolean);
//   if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
//   return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
// }

// function normalizeText(value) {
//   if (value === undefined || value === null) return '';
//   return String(value).trim().toLowerCase();
// }

// function prettyPreferenceLabel(key) {
//   return QUICK_FILTER_LABELS[key] || key.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
// }

// function getRidePreferences(item) {
//   // Try to get preferences from different possible locations
//   if (item.preferences) return item.preferences;
//   if (item.ridePreferences) return item.ridePreferences;
//   if (item.matchingPreferences) return item.matchingPreferences;
//   if (item.travel_preferences) return item.travel_preferences;
//   return {};
// }

// // Function to extract preferences - SHOW ONLY VALUES, NOT KEYS
// // Function to extract preferences - SHOW ONLY VALUES, NOT KEYS
// function extractPreferenceBadges(item) {
//   const prefs = getRidePreferences(item);
//   const badges = [];

//   if (!prefs || Object.keys(prefs).length === 0) {
//     return [];
//   }

//   Object.entries(prefs).forEach(([key, value]) => {
//     // Skip if value is null, undefined, or empty
//     if (value === null || value === undefined) return;
    
//     // Handle different value types - SHOW ONLY THE VALUE
//     if (typeof value === 'boolean') {
//       // Only show boolean preferences if they are true
//       if (value === true) {
//         // Special case for verified_profiles_only
//         if (key === 'verified_profiles_only') {
//           badges.push('Verified Only');
//         } else {
//           // For other boolean preferences, show the key as a badge
//           const displayKey = key.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
//           badges.push(displayKey);
//         }
//       }
//     } 
//     else if (Array.isArray(value)) {
//       // Handle arrays (like speak_languages: ["English"])
//       if (value.length > 0) {
//         // For arrays, show just the values (the languages)
//         value.forEach(v => {
//           if (v && v.trim()) {
//             badges.push(v.trim());
//           }
//         });
//       }
//     }
//     else if (typeof value === 'string' && value.trim()) {
//       // Handle string values - SHOW ONLY THE VALUE
//       const lowerValue = value.toLowerCase();
//       // Skip "No Preference" and other false-y values
//       if (!['false', 'no', 'none', 'null', 'undefined', 'no preference'].includes(lowerValue)) {
//         badges.push(value);
//       }
//     }
//     else if (typeof value === 'number') {
//       // Handle numbers - show the value
//       badges.push(String(value));
//     }
//   });

//   // Remove duplicates
//   return [...new Set(badges)];
// }

// // Function to fetch user documents for verification status
// async function fetchUserDocuments(phoneNumber) {
//   try {
//     const url = `${API_BASE_URL}/api/v1/documents/user/${phoneNumber}`;
//     const res = await fetch(url, { headers: { Accept: 'application/json' } });
//     if (!res.ok) return null;
//     const data = await res.json();
//     return data;
//   } catch (e) {
//     console.log('fetchUserDocuments error:', e);
//     return null;
//   }
// }

// // Function to fetch driver profile for rating
// async function fetchDriverProfile(phoneNumber, userId) {
//   try {
//     const params = new URLSearchParams();
//     if (userId) params.append('user_id', userId);
//     else if (phoneNumber) params.append('phone_number', phoneNumber);
//     else return null;
//     const url = `${API_BASE_URL}/api/v1/users/profile-public?${params.toString()}`;
//     const res = await fetch(url, { headers: { Accept: 'application/json' } });
//     if (!res.ok) return null;
//     const data = await res.json();
//     return data;
//   } catch (e) {
//     console.log('fetchDriverProfile error:', e);
//     return null;
//   }
// }

// // Helper to check which documents are verified
// function checkVerifiedDocuments(docs) {
//   if (!docs || !docs.length) return false;
  
//   const verified = docs.filter(doc => {
//     const docType = doc.document_type?.toLowerCase();
//     const status = doc.status?.toUpperCase();
//     return status === 'APPROVED' && ['aadhar', 'dl', 'rc'].includes(docType);
//   });
  
//   return verified.length > 0;
// }

// // Rating Stars Component
// function RatingStars({ rating, size = 12, showLabel = true }) {
//   const fullStars = Math.floor(rating);
//   const hasHalfStar = rating % 1 >= 0.5;
//   const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);
  
//   return (
//     <View style={{ flexDirection: 'row', alignItems: 'center' }}>
//       {[...Array(fullStars)].map((_, i) => (
//         <Ionicons key={`full-${i}`} name="star" size={size} color="#F59E0B" />
//       ))}
//       {hasHalfStar && (
//         <Ionicons name="star-half" size={size} color="#F59E0B" />
//       )}
//       {[...Array(emptyStars)].map((_, i) => (
//         <Ionicons key={`empty-${i}`} name="star-outline" size={size} color="#F59E0B" />
//       ))}
//       {showLabel && rating > 0 && (
//         <Text style={[styles.ratingText, { marginLeft: 4 }]}>({rating.toFixed(1)})</Text>
//       )}
//       {showLabel && rating === 0 && (
//         <Text style={[styles.ratingText, { marginLeft: 4 }]}>New</Text>
//       )}
//     </View>
//   );
// }

// function matchesQuickFilter(item, key) {
//   const prefs = getRidePreferences(item);
//   const value = prefs?.[key];
//   const normalized = normalizeText(value);

//   if (key === 'verified_profiles_only') {
//     return !!item.isVerified;
//   }

//   if (typeof value === 'boolean') return value;
//   if (Array.isArray(value)) return value.length > 0;

//   if (key === 'smoking_policy') {
//     return normalized.includes('no');
//   }

//   if (key === 'same_gender_after_9pm') {
//     return normalized === 'true' || normalized === 'yes' || normalized === 'same gender';
//   }

//   if (key === 'pets_allowed') {
//     return normalized === 'true' || normalized === 'yes' || normalized === 'allowed';
//   }

//   return !!normalized;
// }

// function matchesAdvancedFilter(item, key, expectedValue) {
//   if (expectedValue === undefined || expectedValue === null || expectedValue === '') {
//     return true;
//   }

//   const prefs = getRidePreferences(item);
//   const rideValue = prefs?.[key];

//   if (typeof expectedValue === 'boolean') {
//     if (key === 'verified_profiles_only') {
//       return expectedValue ? !!item.isVerified : true;
//     }
//     return rideValue === expectedValue || normalizeText(rideValue) === String(expectedValue);
//   }

//   if (Array.isArray(rideValue)) {
//     return rideValue.map(v => normalizeText(v)).includes(normalizeText(expectedValue));
//   }

//   return normalizeText(rideValue) === normalizeText(expectedValue);
// }

// // Profile Image Modal Component
// // Profile Image Modal Component
// function ProfileImageModal({ visible, imageUrl, driverName, onClose }) {
//   const [isSvg, setIsSvg] = useState(false);
  
//   useEffect(() => {
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
//               <Text style={styles.imageModalTitle}>{driverName}</Text>
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
//                 <Text style={styles.noImageText}>No profile picture available</Text>
//               </View>
//             )}
//           </View>
//         </View>
//       </TouchableOpacity>
//     </Modal>
//   );
// }

// // Generic Preference Tag Component - shows only the value
// function PreferenceTag({ label }) {
//   if (!label || label.trim() === '') return null;
  
//   let tagColor = '#FFF3E8';
//   let textColor = '#C65D00';
  
//   const lowerLabel = label.toLowerCase();
  
//   // Color coding based on value type
//   if (lowerLabel.includes('chatty') || lowerLabel.includes('talkative')) {
//     tagColor = '#E3F2FD';
//     textColor = '#1565C0';
//   } else if (lowerLabel.includes('quiet')) {
//     tagColor = '#E8F5E9';
//     textColor = '#2E7D32';
//   } else if (lowerLabel.includes('english') || lowerLabel.includes('hindi') || lowerLabel.includes('language')) {
//     tagColor = '#FFF9C4';
//     textColor = '#F57F17';
//   } else if (lowerLabel.includes('music') || lowerLabel.includes('songs')) {
//     tagColor = '#F3E5F5';
//     textColor = '#6A1B9A';
//   } else if (lowerLabel.includes('ac')) {
//     tagColor = '#E3F2FD';
//     textColor = '#1565C0';
//   } else if (lowerLabel.includes('pet')) {
//     tagColor = '#FCE4EC';
//     textColor = '#C2185B';
//   } else if (lowerLabel.includes('smoking')) {
//     tagColor = '#FFEBEE';
//     textColor = '#C62828';
//   } else if (lowerLabel.includes('verified')) {
//     tagColor = '#E8F5E9';
//     textColor = '#2E7D32';
//   } else if (lowerLabel.match(/[0-9]/)) {
//     // Age ranges like 26-35
//     tagColor = '#E8F5E9';
//     textColor = '#2E7D32';
//   }
  
//   return (
//     <View style={[styles.prefBadge, { backgroundColor: tagColor }]}>
//       <Text style={[styles.prefBadgeText, { color: textColor }]}>{label}</Text>
//     </View>
//   );
// }

// export default function RideNextScreen({ navigation, route }) {
//   const { user, loading: authLoading } = useAuth();
//   const { searchData } = route.params || {};
//   const { from, to, fromCoords, toCoords, dateTime, seats } = searchData || {};

//   const [availableRides, setAvailableRides] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [errorMessage, setErrorMessage] = useState('');
//   const [sortBy, setSortBy] = useState('time');
//   const [quickFilters, setQuickFilters] = useState([]);
//   const [headerFiltersVisible, setHeaderFiltersVisible] = useState(false);
//   const [filterModalVisible, setFilterModalVisible] = useState(false);
//   const [preferenceMaster, setPreferenceMaster] = useState([]);
//   const [userPreferences, setUserPreferences] = useState({});
//   const [advancedFilters, setAdvancedFilters] = useState({});
  
//   // Profile image modal state
//   const [selectedProfile, setSelectedProfile] = useState({
//     visible: false,
//     imageUrl: null,
//     driverName: '',
//   });

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
//       iconColor = Colors.primary;
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

//   const phoneNumber = user?.phone_number;

//  const fetchAvailableRides = useCallback(async () => {
//   if (!searchData || !fromCoords || !toCoords || !dateTime) {
//     setAvailableRides([]);
//     setLoading(false);
//     return;
//   }

//   try {
//     setLoading(true);
//     setErrorMessage('');

//     const response = await fetch(`${API_BASE_URL}/search-rides`, {
//       method: 'POST',
//       headers: {
//         'Content-Type': 'application/json',
//       },
//       body: JSON.stringify({
//         from_location: from,
//         to_location: to,
//         from_coords: fromCoords,
//         to_coords: toCoords,
//         departure_time: new Date(dateTime).toISOString(),
//         seats_required: seats || 1,
//       }),
//     });

//     const rawText = await response.text();
//     let parsedData = null;

//     try {
//       parsedData = rawText ? JSON.parse(rawText) : {};
//     } catch (parseError) {
//       parsedData = { detail: rawText || 'Unexpected server response' };
//     }

//     if (!response.ok) {
//       throw new Error(parsedData?.detail || 'Failed to fetch rides');
//     }

//     const rides = Array.isArray(parsedData?.rides) ? parsedData.rides : [];
    
//     console.log(`📱 Found ${rides.length} rides`);
    
//     const ridesWithDetails = await Promise.all(
//       rides.map(async (ride) => {
//         let isVerified = false;
//         let avgRating = ride.rating || 0;
//         let profilePictureUrl = null;
        
//         console.log(`\n--- Processing ride for driver: ${ride.driverName || ride.driver_name} ---`);
        
//         const driverPhone = ride.phoneNumber;
//         const driverUserId = ride.driverUserId;
        
//         if (driverPhone || driverUserId) {
//           // Fetch verification status from documents
//           if (driverPhone) {
//             const docsData = await fetchUserDocuments(driverPhone);
//             if (docsData?.success && docsData.documents) {
//               isVerified = checkVerifiedDocuments(docsData.documents);
//             }
//           }
          
//           // Fetch driver profile to get rating AND profile picture
//           const profileData = await fetchDriverProfile(driverPhone, driverUserId);
//           console.log('Profile data response:', profileData?.success ? 'Success' : 'Failed');
          
//           if (profileData?.success && profileData.user) {
//             avgRating = profileData.user.avg_rating || 0;
            
//             // Try all possible profile picture field names
//             const possiblePictureFields = ['profile_picture', 'profilePicture', 'profilePhoto', 'profile_image', 'avatar'];
//             for (const field of possiblePictureFields) {
//               if (profileData.user[field]) {
//                 profilePictureUrl = profileData.user[field];
//                 console.log(`✅ Found profile picture in field '${field}': ${profilePictureUrl}`);
//                 break;
//               }
//             }
            
//             // Also check if profile picture is in a nested object
//             if (!profilePictureUrl && profileData.user.profile && profileData.user.profile.picture) {
//               profilePictureUrl = profileData.user.profile.picture;
//               console.log(`✅ Found profile picture in profile.picture: ${profilePictureUrl}`);
//             }
//           }
//         }
        
//         // If still no profile picture, check the original ride data
//         if (!profilePictureUrl) {
//           if (ride.profilePicture) profilePictureUrl = ride.profilePicture;
//           else if (ride.profilepicture) profilePictureUrl = ride.profilepicture;
//           else if (ride.profilePhoto) profilePictureUrl = ride.profilePhoto;
//           else if (ride.driverProfilePicture) profilePictureUrl = ride.driverProfilePicture;
          
//           if (profilePictureUrl) {
//             console.log(`✅ Found profile picture in original ride data: ${profilePictureUrl}`);
//           } else {
//             console.log(`⚠️ No profile picture found for driver: ${ride.driverName || ride.driver_name}`);
//           }
//         }
        
//         // Build the full URL
//         let finalProfilePicture = null;
//         if (profilePictureUrl) {
//           finalProfilePicture = buildImageUrl(profilePictureUrl);
//           console.log(`🖼️ Final profile picture URL: ${finalProfilePicture}`);
//         }
        
//         return { 
//           ...ride, 
//           isVerified, 
//           rating: avgRating,
//           profilePicture: finalProfilePicture, // Store the full URL
//           // Also store in other fields for compatibility
//           profilepicture: finalProfilePicture,
//           profilePhoto: finalProfilePicture,
//           pickupLabel: ride.pickupLocationName || ride.fromLocationName || ride.from || 'Pickup point',
//           dropLabel: ride.dropLocationName || ride.toLocationName || ride.to || 'Drop point',
//         };
//       })
//     );
    
//     console.log(`\n✅ Loaded ${ridesWithDetails.length} rides`);
//     if (ridesWithDetails.length > 0) {
//       console.log(`📸 Sample ride profile picture: ${ridesWithDetails[0].profilePicture}`);
//     }
    
//     setAvailableRides(ridesWithDetails);
//   } catch (error) {
//     console.log('❌ search-rides error:', error);
//     setAvailableRides([]);
//     setErrorMessage(error.message || 'Failed to search rides');
//     showCustomAlert('Search Error', error.message || 'Failed to search rides', 'error');
//   } finally {
//     setLoading(false);
//   }
// }, [searchData, from, to, fromCoords, toCoords, dateTime, seats]);
//   const loadPreferenceData = useCallback(async () => {
//     try {
//       const defs = await DatabaseService.getMatchingPreferenceMaster();
//       setPreferenceMaster(defs || []);

//       if (phoneNumber) {
//         const saved = await DatabaseService.getUserMatchingPreferences(phoneNumber);
//         setUserPreferences(saved || {});
//       }
//     } catch (e) {
//       console.log('❌ preference load error:', e);
//     }
//   }, [phoneNumber]);

//   useEffect(() => {
//     if (authLoading) return;
//     fetchAvailableRides();
//     loadPreferenceData();
//   }, [authLoading, fetchAvailableRides, loadPreferenceData]);
//  useFocusEffect(
//     useCallback(() => {
//       if (!authLoading && searchData) {
//         console.log('🔄 Screen focused - reloading rides with fresh data');
//         fetchAvailableRides();
//       }
//     }, [authLoading, searchData, fetchAvailableRides])
//   );
//   const quickFilterOptions = useMemo(() => {
//     const defs = preferenceMaster.filter(pref => QUICK_FILTER_KEYS.includes(pref.key));
//     return defs.slice(0, 3).map(pref => ({
//       key: pref.key,
//       label: QUICK_FILTER_LABELS[pref.key] || pref.label,
//     }));
//   }, [preferenceMaster]);

//   const advancedFilterOptions = useMemo(() => {
//     return preferenceMaster.filter(pref => {
//       if (!pref?.key) return false;
//       if (quickFilterOptions.some(q => q.key === pref.key)) return false;
//       return ['toggle', 'single_select'].includes(pref.input_type);
//     });
//   }, [preferenceMaster, quickFilterOptions]);

//   const processedRides = useMemo(() => {
//     let rides = [...availableRides];

//     if (quickFilters.length > 0) {
//       rides = rides.filter(item =>
//         quickFilters.every(key => matchesQuickFilter(item, key))
//       );
//     }

//     const activeAdvanced = Object.entries(advancedFilters).filter(
//       ([, value]) =>
//         value !== '' &&
//         value !== null &&
//         value !== undefined &&
//         value !== false
//     );

//     if (activeAdvanced.length > 0) {
//       rides = rides.filter(item =>
//         activeAdvanced.every(([key, value]) =>
//           matchesAdvancedFilter(item, key, value)
//         )
//       );
//     }

//     rides.sort((a, b) => {
//       if (sortBy === 'price') return (a.price || 0) - (b.price || 0);
//       if (sortBy === 'rating') return (b.rating || 0) - (a.rating || 0);
//       if (sortBy === 'match') return (b.matchPercentage || 0) - (a.matchPercentage || 0);

//       const aDate = new Date(`${a.date || ''} ${a.time || ''}`);
//       const bDate = new Date(`${b.date || ''} ${b.time || ''}`);
//       if (!isNaN(aDate) && !isNaN(bDate)) return aDate - bDate;
//       return 0;
//     });

//     return rides;
//   }, [availableRides, quickFilters, advancedFilters, sortBy]);

//   const handleCardPress = (ride) => {
//     navigation.navigate('RideDetailScreen', { 
//       ride,
//       searchData: searchData || null,
//     });
//   };

//   const handleProfileImagePress = (imageUrl, driverName) => {
//     setSelectedProfile({
//       visible: true,
//       imageUrl: imageUrl,
//       driverName: driverName,
//     });
//   };

//   const toggleQuickFilter = (key) => {
//     setQuickFilters(prev =>
//       prev.includes(key) ? prev.filter(i => i !== key) : [...prev, key]
//     );
//   };

//   const clearAllFilters = () => {
//     setQuickFilters([]);
//     setAdvancedFilters({});
//     showCustomAlert('Filters Cleared', 'All filters have been reset.', 'info');
//   };

//   const renderAdvancedFilterControl = (pref) => {
//     const currentValue = advancedFilters[pref.key];

//     if (pref.input_type === 'toggle') {
//       const active = !!currentValue;
//       return (
//         <TouchableOpacity
//           activeOpacity={0.85}
//           style={[styles.modalToggleChip, active && styles.modalToggleChipActive]}
//           onPress={() =>
//             setAdvancedFilters(prev => ({ ...prev, [pref.key]: !active }))
//           }
//         >
//           <Text
//             style={[
//               styles.modalToggleChipText,
//               active && styles.modalToggleChipTextActive,
//             ]}
//           >
//             {pref.label}
//           </Text>
//         </TouchableOpacity>
//       );
//     }

//     if (pref.input_type === 'single_select' && Array.isArray(pref.options)) {
//       return (
//         <View style={styles.modalOptionWrap}>
//           {pref.options.map((opt) => {
//             const active = currentValue === opt;
//             return (
//               <TouchableOpacity
//                 key={opt}
//                 activeOpacity={0.85}
//                 style={[
//                   styles.modalOptionChip,
//                   active && styles.modalOptionChipActive,
//                 ]}
//                 onPress={() =>
//                   setAdvancedFilters(prev => ({
//                     ...prev,
//                     [pref.key]: active ? '' : opt,
//                   }))
//                 }
//               >
//                 <Text
//                   style={[
//                     styles.modalOptionChipText,
//                     active && styles.modalOptionChipTextActive,
//                   ]}
//                 >
//                   {opt}
//                 </Text>
//               </TouchableOpacity>
//             );
//           })}
//         </View>
//       );
//     }

//     return null;
//   };

// const renderRideCard = ({ item }) => {
// console.log('=== RENDER RIDE CARD DEBUG ===');
 
//   // Fix: Better profile photo URL handling
//   let profilePhotoUrl = null;
//   let isSvg = false;
//   let profilePictureField = null;
  
//   // Try multiple possible field names for profile picture
//   if (item.profilePicture) {
//     profilePhotoUrl = buildImageUrl(item.profilePicture);
//     profilePictureField = 'profilePicture';
//   } else if (item.profilepicture) {
//     profilePhotoUrl = buildImageUrl(item.profilepicture);
//     profilePictureField = 'profilepicture';
//   } else if (item.profilePhoto) {
//     profilePhotoUrl = buildImageUrl(item.profilePhoto);
//     profilePictureField = 'profilePhoto';
//   } else if (item.driverProfilePicture) {
//     profilePhotoUrl = buildImageUrl(item.driverProfilePicture);
//     profilePictureField = 'driverProfilePicture';
//   } else if (item.driver?.profile_picture) {
//     profilePhotoUrl = buildImageUrl(item.driver.profile_picture);
//     profilePictureField = 'driver.profile_picture';
//   } else if (item.user?.profile_picture) {
//     profilePhotoUrl = buildImageUrl(item.user.profile_picture);
//     profilePictureField = 'user.profile_picture';
//   }
  
//   // Check if the URL is an SVG
//   if (profilePhotoUrl && profilePhotoUrl.toLowerCase().includes('.svg')) {
//     isSvg = true;
//   }
  
//   console.log('Profile photo URL:', profilePhotoUrl, 'from field:', profilePictureField, 'isSVG:', isSvg);
  
//   const driverNameText = item.driverName || item.driver_name || item.driver?.full_name || 'Driver';
//   const avatarText = getDriverInitials(driverNameText);

//   // Build vehicle label
//   let vehicleLabel = 'Vehicle details unavailable';
//   if (item.vehicle) {
//     const vehicleParts = [];
//     if (item.vehicle.model) vehicleParts.push(item.vehicle.model);
//     if (item.vehicle.color && vehicleParts.length > 0) {
//       vehicleLabel = `${vehicleParts.join(' ')} - ${item.vehicle.color}`;
//     } else if (item.vehicle.color) {
//       vehicleLabel = item.vehicle.color;
//     } else if (vehicleParts.length > 0) {
//       vehicleLabel = vehicleParts.join(' ');
//     }
//   } else if (item.vehicleModel) {
//     vehicleLabel = item.vehicleModel;
//     if (item.vehicleColor) {
//       vehicleLabel = `${item.vehicleModel} - ${item.vehicleColor}`;
//     }
//   }

//   const preferenceBadges = extractPreferenceBadges(item);
//   const isDriverVerified = item.isVerified;
//   const driverRating = item.rating || 0;

//   const pickupName = item.pickupLocationName || item.fromLocationName || item.from || 'Pickup point';
//   const dropName = item.dropLocationName || item.toLocationName || item.to || 'Drop point';

//   return (
//     <TouchableOpacity
//       style={styles.rideCard}
//       onPress={() => handleCardPress(item)}
//       activeOpacity={0.9}
//     >
//       <View style={styles.cardTopRow}>
//         <View style={styles.profileRow}>
//           <TouchableOpacity
//             onPress={() => handleProfileImagePress(profilePhotoUrl, driverNameText)}
//             activeOpacity={0.8}
//           >
//             <View style={styles.avatarContainer}>
//               {profilePhotoUrl ? (
//                 isSvg ? (
//                   // Render SVG using SvgUri
//                   <View style={styles.svgContainer}>
//                     <SvgCssUri
//                       uri={profilePhotoUrl}
//                       width="48"
//                       height="48"
//                       onError={(e) => console.log('SVG load error:', e)}
//                     />
//                   </View>
//                 ) : (
//                   <Image
//                     source={{ uri: profilePhotoUrl }}
//                     style={styles.avatarImage}
//                     resizeMode="cover"
//                     onError={(e) => console.log('Image load error:', e.nativeEvent.error, 'URL:', profilePhotoUrl)}
//                     onLoad={() => console.log('Image loaded successfully:', profilePhotoUrl)}
//                   />
//                 )
//               ) : (
//                 <View style={styles.initialsContainer}>
//                   <Text style={styles.avatarFallback}>{avatarText}</Text>
//                 </View>
//               )}
//             </View>
//           </TouchableOpacity>

//           <View style={styles.profileContent}>
//             <View style={styles.nameRow}>
//               <Text style={styles.driverName} numberOfLines={1}>
//                 {driverNameText}
//               </Text>

//               {isDriverVerified && (
//                 <View style={styles.verifiedBadge}>
//                   <Ionicons name="checkmark-circle" size={14} color="#16A34A" />
//                   <Text style={styles.verifiedText}>Verified</Text>
//                 </View>
//               )}
//             </View>

//             <View style={styles.ratingRow}>
//               <RatingStars rating={driverRating} size={12} showLabel={true} />
//             </View>
//           </View>
//         </View>

//         <View style={styles.priceMatchWrap}>
//           <View style={styles.matchBadge}>
//             <Text style={styles.matchText}>{item.matchPercentage || 0}%</Text>
//           </View>
//           <Text style={styles.priceText}>₹{item.price}</Text>
//           <Text style={styles.perSeatText}>per seat</Text>
//         </View>
//       </View>

//       <View style={styles.infoRow}>
//         <View style={styles.infoItem}>
//           <Ionicons name="calendar-outline" size={13} color={Colors.gray} />
//           <Text style={styles.infoText} numberOfLines={1}>{item.date}</Text>
//         </View>
//         <View style={styles.infoDot} />
//         <View style={styles.infoItem}>
//           <Ionicons name="time-outline" size={13} color={Colors.gray} />
//           <Text style={styles.infoText} numberOfLines={1}>{item.time}</Text>
//         </View>
//         <View style={styles.infoDot} />
//         <View style={styles.infoItem}>
//           <Ionicons name="people-outline" size={13} color={Colors.gray} />
//           <Text style={styles.infoText} numberOfLines={1}>{item.seatsAvailable} left</Text>
//         </View>
//       </View>

//       <View style={styles.divider} />

//       <View style={styles.routeBlock}>
//         <View style={styles.routeRow}>
//           <View style={[styles.routeDot, { backgroundColor: '#22C55E' }]} />
//           <View style={styles.routeTextWrap}>
//             <Text style={styles.routeLabel}>Pickup</Text>
//             <Text style={styles.routeText} numberOfLines={2}>{pickupName}</Text>
//           </View>
//         </View>
//         <View style={styles.routeRow}>
//           <View style={[styles.routeDot, { backgroundColor: '#F97316' }]} />
//           <View style={styles.routeTextWrap}>
//             <Text style={styles.routeLabel}>Drop</Text>
//             <Text style={styles.routeText} numberOfLines={2}>{dropName}</Text>
//           </View>
//         </View>
//       </View>

//       <View style={styles.vehicleRow}>
//         <Ionicons name="car-sport-outline" size={14} color={Colors.gray} />
//         <Text style={styles.vehicleText} numberOfLines={1}>{vehicleLabel}</Text>
//       </View>

//       {preferenceBadges.length > 0 && (
//         <ScrollView
//           horizontal
//           showsHorizontalScrollIndicator={false}
//           contentContainerStyle={styles.badgeScroll}
//         >
//           {preferenceBadges.map((badge, index) => (
//             <PreferenceTag key={`${badge}-${index}`} label={badge} />
//           ))}
//         </ScrollView>
//       )}
//     </TouchableOpacity>
//   );
// };

//   if (authLoading || loading) {
//     return (
//       <View style={styles.loadingContainer}>
//         <LottieView
//           source={require("../assets/loading.json")}
//           autoPlay
//           loop
//           style={{ width: 300, height: 300 }}
//         />
//       </View>
//     );
//   }

//   return (
//     <SafeAreaView style={styles.container}>
//       <StatusBar barStyle="dark-content" backgroundColor={Colors.white} />

//       {/* Header */}
//       <View style={styles.header}>
//         <TouchableOpacity
//           style={styles.backButton}
//           onPress={() => navigation.goBack()}
//         >
//           <MaterialIcons name="arrow-back-ios" size={24} color="#ED7117" />
//         </TouchableOpacity>

//         <Text style={styles.headerTitle}>Available Rides</Text>

//         <TouchableOpacity
//           style={[
//             styles.filterButton,
//             headerFiltersVisible && styles.filterButtonActive
//           ]}
//           onPress={() => setHeaderFiltersVisible(prev => !prev)}
//         >
//           <Ionicons name="options-outline" size={22} color="#ED7117" />
//         </TouchableOpacity>
//       </View>

//       {headerFiltersVisible ? (
//         <View style={styles.topControlsWrap}>
//           <ScrollView
//             horizontal
//             showsHorizontalScrollIndicator={false}
//             contentContainerStyle={styles.filterScroll}
//           >
//             {quickFilterOptions.map((filter) => {
//               const active = quickFilters.includes(filter.key);
//               return (
//                 <TouchableOpacity
//                   key={filter.key}
//                   activeOpacity={0.85}
//                   style={[styles.quickChip, active && styles.quickChipActive]}
//                   onPress={() => toggleQuickFilter(filter.key)}
//                 >
//                   <Text
//                     style={[
//                       styles.quickChipText,
//                       active && styles.quickChipTextActive,
//                     ]}
//                   >
//                     {filter.label}
//                   </Text>
//                 </TouchableOpacity>
//               );
//             })}

//             <TouchableOpacity
//               activeOpacity={0.85}
//               style={styles.moreFilterChip}
//               onPress={() => setFilterModalVisible(true)}
//             >
//               <Ionicons name="options-outline" size={14} color="#ED7117" />
//               <Text style={styles.moreFilterChipText}>More Filters</Text>
//             </TouchableOpacity>
//           </ScrollView>

//           <Text style={styles.sortLabel}>Sort by</Text>

//           <ScrollView
//             horizontal
//             showsHorizontalScrollIndicator={false}
//             contentContainerStyle={styles.sortScroll}
//           >
//             {SORT_OPTIONS.map((option) => {
//               const active = sortBy === option.key;
//               return (
//                 <TouchableOpacity
//                   key={option.key}
//                   activeOpacity={0.85}
//                   style={[styles.sortChip, active && styles.sortChipActive]}
//                   onPress={() => setSortBy(option.key)}
//                 >
//                   <Text
//                     style={[
//                       styles.sortChipText,
//                       active && styles.sortChipTextActive,
//                     ]}
//                   >
//                     {option.label}
//                   </Text>
//                 </TouchableOpacity>
//               );
//             })}
//           </ScrollView>
//         </View>
//       ) : null}

//       {processedRides.length === 0 ? (
//         <View style={styles.emptyContainer}>
//           <Ionicons name="car-outline" size={80} color={Colors.gray} />
//           <Text style={styles.emptyTitle}>No Rides Found</Text>
//           <Text style={styles.emptySubtitle}>
//             {errorMessage
//               ? errorMessage
//               : 'Try changing your filters or search again.'}
//           </Text>

//           <TouchableOpacity style={styles.clearButton} onPress={clearAllFilters}>
//             <Text style={styles.clearButtonText}>Clear Filters</Text>
//           </TouchableOpacity>
//         </View>
//       ) : (
//         <FlatList
//           data={processedRides}
//           renderItem={renderRideCard}
//           keyExtractor={(item) => String(item.id)}
//           contentContainerStyle={styles.listContent}
//           showsVerticalScrollIndicator={false}
//           ItemSeparatorComponent={() => <View style={{ height: 12 }} />}
//         />
//       )}

//       <Modal
//         visible={filterModalVisible}
//         transparent
//         animationType="slide"
//         onRequestClose={() => setFilterModalVisible(false)}
//       >
//         <View style={styles.modalBackdrop}>
//           <TouchableOpacity
//             style={styles.modalOverlay}
//             activeOpacity={1}
//             onPress={() => setFilterModalVisible(false)}
//           />

//           <View style={styles.modalSheet}>
//             <View style={styles.modalHandle} />

//             <View style={styles.modalHeader}>
//               <Text style={styles.modalTitle}>More Filters</Text>
//               <TouchableOpacity onPress={() => setFilterModalVisible(false)}>
//                 <Ionicons name="close" size={24} color={Colors.dark} />
//               </TouchableOpacity>
//             </View>

//             <ScrollView
//               showsVerticalScrollIndicator={false}
//               contentContainerStyle={styles.modalContent}
//             >
//               {advancedFilterOptions.map((pref) => (
//                 <View key={pref.key} style={styles.modalSection}>
//                   <Text style={styles.modalSectionTitle}>{pref.label}</Text>
//                   {renderAdvancedFilterControl(pref)}
//                 </View>
//               ))}
//             </ScrollView>

//             <View style={styles.modalFooter}>
//               <TouchableOpacity
//                 style={styles.modalSecondaryBtn}
//                 onPress={clearAllFilters}
//               >
//                 <Text style={styles.modalSecondaryBtnText}>Clear</Text>
//               </TouchableOpacity>

//               <TouchableOpacity
//                 style={styles.modalPrimaryBtn}
//                 onPress={() => setFilterModalVisible(false)}
//               >
//                 <Text style={styles.modalPrimaryBtnText}>Apply Filters</Text>
//               </TouchableOpacity>
//             </View>
//           </View>
//         </View>
//       </Modal>

//       {/* Profile Image Modal */}
//       <ProfileImageModal
//         visible={selectedProfile.visible}
//         imageUrl={selectedProfile.imageUrl}
//         driverName={selectedProfile.driverName}
//         onClose={() => setSelectedProfile({ visible: false, imageUrl: null, driverName: '' })}
//       />

//       {/* Custom Alert */}
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

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     backgroundColor: '#fff',
//   },
//   header: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     paddingHorizontal: 16,
//     paddingVertical: 12,
//     borderBottomWidth: 0.5,
//     borderBottomColor: '#fff',
//     backgroundColor: Colors.white,
//   },
//   backButton: {
//     width: 44,
//     height: 44,
//     justifyContent: 'center',
//   },
//   filterButton: {
//     width: 44,
//     height: 44,
//     justifyContent: 'center',
//     alignItems: 'center',
//     borderRadius: 22,
//   },
//   filterButtonActive: {
//     backgroundColor: '#fff',
//   },
//   headerTitle: {
//     ...Typography.h2,
//     fontSize: 28,
//     fontWeight: '700',
//     color: Colors.primary,
//     flex: 1,
//     textAlign: 'center',
//   },
//   topControlsWrap: {
//     backgroundColor: Colors.white,
//     paddingTop: 10,
//     paddingBottom: 12,
//     borderBottomWidth: 1,
//     borderBottomColor: '#EEF2F7',
//   },
//   filterScroll: {
//     paddingHorizontal: 16,
//     gap: 10,
//   },
//   quickChip: {
//     paddingHorizontal: 14,
//     paddingVertical: 10,
//     borderRadius: 20,
//     backgroundColor: '#F3F4F6',
//   },
//   quickChipActive: {
//     backgroundColor: Colors.primary,
//   },
//   quickChipText: {
//     fontSize: 12,
//     fontWeight: '600',
//     color: Colors.dark,
//   },
//   quickChipTextActive: {
//     color: Colors.white,
//   },
//   moreFilterChip: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     gap: 6,
//     paddingHorizontal: 14,
//     paddingVertical: 10,
//     borderRadius: 20,
//     backgroundColor: '#EEF6FF',
//   },
//   moreFilterChipText: {
//     fontSize: 12,
//     fontWeight: '700',
//     color: '#ED7117',
//   },
//   sortLabel: {
//     paddingHorizontal: 16,
//     marginTop: 12,
//     marginBottom: 8,
//     fontSize: 12,
//     color: Colors.gray,
//     fontWeight: '700',
//   },
//   sortScroll: {
//     paddingHorizontal: 16,
//     gap: 10,
//   },
//   sortChip: {
//     paddingHorizontal: 14,
//     paddingVertical: 8,
//     borderRadius: 14,
//     backgroundColor: '#F3F4F6',
//   },
//   sortChipActive: {
//     backgroundColor: '#ED7117',
//   },
//   sortChipText: {
//     fontSize: 12,
//     color: Colors.dark,
//     fontWeight: '600',
//   },
//   sortChipTextActive: {
//     color: Colors.white,
//   },
//   listContent: {
//     padding: 16,
//     paddingBottom: 28,
//   },
//   rideCard: {
//     backgroundColor: Colors.white,
//     borderRadius: 18,
//     padding: 14,
//     borderWidth: 1,
//     borderColor: '#EEF2F7',
//     shadowColor: '#0F172A',
//     shadowOffset: { width: 0, height: 6 },
//     shadowOpacity: 0.05,
//     shadowRadius: 14,
//     elevation: 2,
//   },
//   cardTopRow: {
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//     alignItems: 'flex-start',
//   },
//   profileRow: {
//     flexDirection: 'row',
//     flex: 1,
//     paddingRight: 10,
//   },
//   avatarContainer: {
//     width: 48,
//     height: 48,
//     borderRadius: 24,
//     backgroundColor: '#E5E7EB',
//     alignItems: 'center',
//     justifyContent: 'center',
//     overflow: 'hidden',
//     marginRight: 10,
//   },
//   avatarImage: {
//     width: 48,
//     height: 48,
//   },
//   avatarFallback: {
//     fontSize: 14,
//     fontWeight: '800',
//     color: Colors.gray,
//   },
//   profileContent: {
//     flex: 1,
//   },
//   nameRow: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     flexWrap: 'wrap',
//     gap: 6,
//   },
//   driverName: {
//     fontSize: 15,
//     fontWeight: '800',
//     color: Colors.dark,
//     maxWidth: '100%',
//   },
//   verifiedBadge: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     gap: 4,
//     backgroundColor: '#E8F5E9',
//     paddingHorizontal: 6,
//     paddingVertical: 2,
//     borderRadius: 12,
//   },
//   verifiedText: {
//     fontSize: 10,
//     fontWeight: '700',
//     color: '#16A34A',
//   },
//   ratingRow: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     marginTop: 4,
//   },
//   ratingText: {
//     fontSize: 11,
//     color: Colors.gray,
//     fontWeight: '600',
//   },
//   priceMatchWrap: {
//     alignItems: 'flex-end',
//   },
//   matchBadge: {
//     backgroundColor: '#EEF6FF',
//     paddingHorizontal: 8,
//     paddingVertical: 4,
//     borderRadius: 10,
//     marginBottom: 6,
//   },
//   matchText: {
//     fontSize: 12,
//     fontWeight: '800',
//     color: Colors.primary,
//   },
//   priceText: {
//     fontSize: 18,
//     fontWeight: '800',
//     color: '#ED7117',
//     lineHeight: 20,
//   },
//   perSeatText: {
//     fontSize: 10,
//     color: Colors.gray,
//     fontWeight: '600',
//     marginTop: 2,
//   },
//   infoRow: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     flexWrap: 'wrap',
//     marginTop: 12,
//     marginBottom: 10,
//   },
//   infoItem: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     gap: 4,
//   },
//   infoText: {
//     fontSize: 12,
//     color: Colors.dark,
//     fontWeight: '600',
//   },
//   infoDot: {
//     width: 4,
//     height: 4,
//     borderRadius: 2,
//     backgroundColor: '#CBD5E1',
//     marginHorizontal: 8,
//   },
//   divider: {
//     height: 1,
//     backgroundColor: '#EEF2F7',
//     marginBottom: 10,
//   },
//   routeBlock: {
//     gap: 8,
//   },
//   routeRow: {
//     flexDirection: 'row',
//     alignItems: 'flex-start',
//   },
//   routeDot: {
//     width: 8,
//     height: 8,
//     borderRadius: 4,
//     marginTop: 5,
//     marginRight: 8,
//   },
//   routeTextWrap: {
//     flex: 1,
//   },
//   routeLabel: {
//     fontSize: 11,
//     color: Colors.gray,
//     fontWeight: '700',
//     marginBottom: 2,
//   },
//   routeText: {
//     fontSize: 13,
//     color: Colors.dark,
//     fontWeight: '600',
//     lineHeight: 18,
//   },
//   vehicleRow: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     gap: 6,
//     marginTop: 10,
//   },
//   vehicleText: {
//     fontSize: 12,
//     color: Colors.gray,
//     fontWeight: '600',
//     flex: 1,
//   },
//   badgeScroll: {
//     gap: 8,
//     paddingTop: 10,
//   },
//   prefBadge: {
//     paddingHorizontal: 10,
//     paddingVertical: 6,
//     borderRadius: 12,
//     marginRight: 8,
//   },
//   prefBadgeText: {
//     fontSize: 11,
//     fontWeight: '700',
//   },
//   loadingContainer: {
//     flex: 1,
//     justifyContent: 'center',
//     alignItems: 'center',
//     backgroundColor: Colors.white,
//   },
//   emptyContainer: {
//     flex: 1,
//     justifyContent: 'center',
//     alignItems: 'center',
//     paddingHorizontal: 40,
//   },
//   emptyTitle: {
//     fontSize: 22,
//     fontWeight: '700',
//     color: Colors.dark,
//     marginTop: 20,
//     marginBottom: 8,
//   },
//   emptySubtitle: {
//     fontSize: 15,
//     color: Colors.gray,
//     textAlign: 'center',
//     lineHeight: 22,
//     marginBottom: 24,
//   },
//   clearButton: {
//     backgroundColor: Colors.primary,
//     paddingHorizontal: 24,
//     paddingVertical: 12,
//     borderRadius: 12,
//   },
//   clearButtonText: {
//     color: Colors.white,
//     fontSize: 15,
//     fontWeight: '700',
//   },
//   modalBackdrop: {
//     flex: 1,
//     backgroundColor: 'rgba(15,23,42,0.28)',
//     justifyContent: 'flex-end',
//   },
//   modalOverlay: {
//     flex: 1,
//   },
//   modalSheet: {
//     backgroundColor: Colors.white,
//     borderTopLeftRadius: 24,
//     borderTopRightRadius: 24,
//     maxHeight: '78%',
//     paddingTop: 10,
//   },
//   modalHandle: {
//     width: 52,
//     height: 5,
//     borderRadius: 999,
//     backgroundColor: '#D1D5DB',
//     alignSelf: 'center',
//     marginBottom: 14,
//   },
//   modalHeader: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     justifyContent: 'space-between',
//     paddingHorizontal: 18,
//     paddingBottom: 10,
//   },
//   modalTitle: {
//     fontSize: 20,
//     fontWeight: '800',
//     color: Colors.dark,
//   },
//   modalContent: {
//     paddingHorizontal: 18,
//     paddingBottom: 20,
//   },
//   modalSection: {
//     marginBottom: 18,
//   },
//   modalSectionTitle: {
//     fontSize: 14,
//     fontWeight: '700',
//     color: Colors.dark,
//     marginBottom: 10,
//   },
//   modalToggleChip: {
//     borderRadius: 14,
//     borderWidth: 1,
//     borderColor: '#E5E7EB',
//     paddingHorizontal: 14,
//     paddingVertical: 10,
//     alignSelf: 'flex-start',
//     backgroundColor: '#F9FAFB',
//   },
//   modalToggleChipActive: {
//     backgroundColor: Colors.primary,
//     borderColor: Colors.primary,
//   },
//   modalToggleChipText: {
//     fontSize: 13,
//     color: Colors.dark,
//     fontWeight: '600',
//   },
//   modalToggleChipTextActive: {
//     color: Colors.white,
//   },
//   modalOptionWrap: {
//     flexDirection: 'row',
//     flexWrap: 'wrap',
//     gap: 10,
//   },
//   modalOptionChip: {
//     borderRadius: 16,
//     borderWidth: 1,
//     borderColor: '#E5E7EB',
//     paddingHorizontal: 12,
//     paddingVertical: 9,
//     backgroundColor: '#F9FAFB',
//   },
//   modalOptionChipActive: {
//     backgroundColor: Colors.primary,
//     borderColor: Colors.primary,
//   },
//   modalOptionChipText: {
//     fontSize: 13,
//     color: Colors.dark,
//     fontWeight: '600',
//   },
//   modalOptionChipTextActive: {
//     color: Colors.white,
//   },
//   modalFooter: {
//     flexDirection: 'row',
//     paddingHorizontal: 18,
//     paddingTop: 12,
//     paddingBottom: Platform.OS === 'ios' ? 28 : 18,
//     borderTopWidth: 1,
//     borderTopColor: '#EEF2F7',
//     gap: 12,
//   },
//   modalSecondaryBtn: {
//     flex: 1,
//     borderRadius: 14,
//     paddingVertical: 14,
//     alignItems: 'center',
//     backgroundColor: '#F3F4F6',
//   },
//   modalSecondaryBtnText: {
//     fontSize: 15,
//     fontWeight: '700',
//     color: Colors.dark,
//   },
//   modalPrimaryBtn: {
//     flex: 1,
//     borderRadius: 14,
//     paddingVertical: 14,
//     alignItems: 'center',
//     backgroundColor: Colors.primary,
//   },
//   modalPrimaryBtnText: {
//     fontSize: 15,
//     fontWeight: '700',
//     color: Colors.white,
//   },
//   // Profile Image Modal Styles
//   imageModalContainer: {
//     flex: 1,
//     justifyContent: 'center',
//     alignItems: 'center',
//     backgroundColor: 'rgba(0,0,0,0.9)',
//   },
//   imageModalContent: {
//     width: '90%',
//     backgroundColor: Colors.white,
//     borderRadius: 20,
//     overflow: 'hidden',
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
//  svgContainer: {
//   width: 48,
//   height: 48,
//   alignItems: 'center',
//   justifyContent: 'center',
// },
// initialsContainer: {
//   width: '100%',
//   height: '100%',
//   alignItems: 'center',
//   justifyContent: 'center',
//   backgroundColor: '#E5E7EB',
// },
// avatarFallback: {
//   fontSize: 16,
//   fontWeight: '800',
//   color: Colors.gray,
//   textAlign: 'center',
// },
// });
// import React, { useState, useEffect, useCallback, useMemo } from 'react';
// import {
//   View,
//   Text,
//   StyleSheet,
//   TouchableOpacity,
//   FlatList,
//   StatusBar,
//   Platform,
//   Image,
//   ScrollView,
//   Modal,
//   Alert,
// } from 'react-native';
// import { SafeAreaView } from 'react-native-safe-area-context';
// import { Ionicons, MaterialIcons } from '@expo/vector-icons';
// import LottieView from "lottie-react-native";
// import { Colors, Typography } from '../constants/Colors';
// import { useAuth } from '../context/AuthContext';
// import { API_BASE_URL } from '../config/config_ip';
// import DatabaseService from '../services/matchingpreference_ds';
// import CustomAlert from '../components/CustomAlert';
// import { SvgCssUri } from 'react-native-svg/css';

// const IMAGE_BASE_URL = API_BASE_URL;
// import { useFocusEffect } from '@react-navigation/native';

// const QUICK_FILTER_KEYS = [
//   'verified_profiles_only',
//   'same_gender_after_9pm',
//   'smoking_policy',
//   'pets_allowed',
//   'chat_level',
//   'luggage_allowance',
// ];

// const QUICK_FILTER_LABELS = {
//   verified_profiles_only: 'Verified Only',
//   same_gender_after_9pm: 'Same Gender Night',
//   smoking_policy: 'No Smoking',
//   pets_allowed: 'Pets',
//   chat_level: 'Chat Level',
//   luggage_allowance: 'Luggage',
// };

// const ICON_MAP = {
//   smoking_policy: 'smoking',
//   speak_languages: 'language',
//   chat_level: 'chat',
//   age_category: 'person',
//   gender_preference: 'wc',
//   luggage_allowance: 'luggage',
//   pets_allowed: 'pets',
//   detours: 'alt-route',
//   helmet_policy_driver: 'sports-motorsports',
//   helmet_policy_passenger: 'sports-motorsports',
//   avoid_frequent_stops: 'timer-off',
//   same_gender_after_9pm: 'nightlight',
//   verified_profiles_only: 'verified-user',
// };

// const SORT_OPTIONS = [
//   { key: 'time', label: 'Time' },
//   { key: 'price', label: 'Price' },
//   { key: 'rating', label: 'Rating' },
//   { key: 'match', label: 'Match %' },
// ];

// function buildImageUrl(url) {
//   if (!url) return null;
//   if (url.startsWith('http://') || url.startsWith('https://')) return url;
//   return `${IMAGE_BASE_URL}${url.startsWith('/') ? '' : '/'}${url}`;
// }

// function getDriverInitials(name) {
//   if (!name) return 'D';
//   const parts = name.trim().split(' ').filter(Boolean);
//   if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
//   return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
// }

// function normalizeText(value) {
//   if (value === undefined || value === null) return '';
//   return String(value).trim().toLowerCase();
// }

// function prettyPreferenceLabel(key) {
//   return QUICK_FILTER_LABELS[key] || key.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
// }

// function getRidePreferences(item) {
//   if (item.preferences) return item.preferences;
//   if (item.ridePreferences) return item.ridePreferences;
//   if (item.matchingPreferences) return item.matchingPreferences;
//   if (item.travel_preferences) return item.travel_preferences;
//   return {};
// }

// function extractPreferenceBadges(item) {
//   const prefs = getRidePreferences(item);
//   const badges = [];

//   if (!prefs || Object.keys(prefs).length === 0) {
//     return [];
//   }

//   Object.entries(prefs).forEach(([key, value]) => {
//     if (value === null || value === undefined) return;
    
//     if (typeof value === 'boolean') {
//       if (value === true) {
//         if (key === 'verified_profiles_only') {
//           badges.push('Verified Only');
//         } else {
//           const displayKey = key.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
//           badges.push(displayKey);
//         }
//       }
//     } 
//     else if (Array.isArray(value)) {
//       if (value.length > 0) {
//         value.forEach(v => {
//           if (v && v.trim()) {
//             badges.push(v.trim());
//           }
//         });
//       }
//     }
//     else if (typeof value === 'string' && value.trim()) {
//       const lowerValue = value.toLowerCase();
//       if (!['false', 'no', 'none', 'null', 'undefined', 'no preference'].includes(lowerValue)) {
//         badges.push(value);
//       }
//     }
//     else if (typeof value === 'number') {
//       badges.push(String(value));
//     }
//   });

//   return [...new Set(badges)];
// }

// async function fetchUserDocuments(phoneNumber) {
//   try {
//     const url = `${API_BASE_URL}/api/v1/documents/user/${phoneNumber}`;
//     const res = await fetch(url, { headers: { Accept: 'application/json' } });
//     if (!res.ok) return null;
//     const data = await res.json();
//     return data;
//   } catch (e) {
//     console.log('fetchUserDocuments error:', e);
//     return null;
//   }
// }

// async function fetchDriverProfile(phoneNumber, userId) {
//   try {
//     const params = new URLSearchParams();
//     if (userId) params.append('user_id', userId);
//     else if (phoneNumber) params.append('phone_number', phoneNumber);
//     else return null;
//     const url = `${API_BASE_URL}/api/v1/users/profile-public?${params.toString()}`;
//     const res = await fetch(url, { headers: { Accept: 'application/json' } });
//     if (!res.ok) return null;
//     const data = await res.json();
//     return data;
//   } catch (e) {
//     console.log('fetchDriverProfile error:', e);
//     return null;
//   }
// }

// function checkVerifiedDocuments(docs) {
//   if (!docs || !docs.length) return false;
  
//   const verified = docs.filter(doc => {
//     const docType = doc.document_type?.toLowerCase();
//     const status = doc.status?.toUpperCase();
//     return status === 'APPROVED' && ['aadhar', 'dl', 'rc'].includes(docType);
//   });
  
//   return verified.length > 0;
// }

// function RatingStars({ rating, size = 12, showLabel = true }) {
//   const fullStars = Math.floor(rating);
//   const hasHalfStar = rating % 1 >= 0.5;
//   const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);
  
//   return (
//     <View style={{ flexDirection: 'row', alignItems: 'center' }}>
//       {[...Array(fullStars)].map((_, i) => (
//         <Ionicons key={`full-${i}`} name="star" size={size} color="#F59E0B" />
//       ))}
//       {hasHalfStar && (
//         <Ionicons name="star-half" size={size} color="#F59E0B" />
//       )}
//       {[...Array(emptyStars)].map((_, i) => (
//         <Ionicons key={`empty-${i}`} name="star-outline" size={size} color="#F59E0B" />
//       ))}
//       {showLabel && rating > 0 && (
//         <Text style={[styles.ratingText, { marginLeft: 4 }]}>({rating.toFixed(1)})</Text>
//       )}
//       {showLabel && rating === 0 && (
//         <Text style={[styles.ratingText, { marginLeft: 4 }]}>New</Text>
//       )}
//     </View>
//   );
// }

// function matchesQuickFilter(item, key) {
//   const prefs = getRidePreferences(item);
//   const value = prefs?.[key];
//   const normalized = normalizeText(value);

//   if (key === 'verified_profiles_only') {
//     return !!item.isVerified;
//   }

//   if (typeof value === 'boolean') return value;
//   if (Array.isArray(value)) return value.length > 0;

//   if (key === 'smoking_policy') {
//     return normalized.includes('no');
//   }

//   if (key === 'same_gender_after_9pm') {
//     return normalized === 'true' || normalized === 'yes' || normalized === 'same gender';
//   }

//   if (key === 'pets_allowed') {
//     return normalized === 'true' || normalized === 'yes' || normalized === 'allowed';
//   }

//   return !!normalized;
// }

// function matchesAdvancedFilter(item, key, expectedValue) {
//   if (expectedValue === undefined || expectedValue === null || expectedValue === '') {
//     return true;
//   }

//   const prefs = getRidePreferences(item);
//   const rideValue = prefs?.[key];

//   if (typeof expectedValue === 'boolean') {
//     if (key === 'verified_profiles_only') {
//       return expectedValue ? !!item.isVerified : true;
//     }
//     return rideValue === expectedValue || normalizeText(rideValue) === String(expectedValue);
//   }

//   if (Array.isArray(rideValue)) {
//     return rideValue.map(v => normalizeText(v)).includes(normalizeText(expectedValue));
//   }

//   return normalizeText(rideValue) === normalizeText(expectedValue);
// }

// function ProfileImageModal({ visible, imageUrl, driverName, onClose }) {
//   const [isSvg, setIsSvg] = useState(false);
  
//   useEffect(() => {
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
//               <Text style={styles.imageModalTitle}>{driverName}</Text>
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
//                 <Text style={styles.noImageText}>No profile picture available</Text>
//               </View>
//             )}
//           </View>
//         </View>
//       </TouchableOpacity>
//     </Modal>
//   );
// }

// function PreferenceTag({ label }) {
//   if (!label || label.trim() === '') return null;
  
//   let tagColor = '#FFF3E8';
//   let textColor = '#C65D00';
  
//   const lowerLabel = label.toLowerCase();
  
//   if (lowerLabel.includes('chatty') || lowerLabel.includes('talkative')) {
//     tagColor = '#E3F2FD';
//     textColor = '#1565C0';
//   } else if (lowerLabel.includes('quiet')) {
//     tagColor = '#E8F5E9';
//     textColor = '#2E7D32';
//   } else if (lowerLabel.includes('english') || lowerLabel.includes('hindi') || lowerLabel.includes('language')) {
//     tagColor = '#FFF9C4';
//     textColor = '#F57F17';
//   } else if (lowerLabel.includes('music') || lowerLabel.includes('songs')) {
//     tagColor = '#F3E5F5';
//     textColor = '#6A1B9A';
//   } else if (lowerLabel.includes('ac')) {
//     tagColor = '#E3F2FD';
//     textColor = '#1565C0';
//   } else if (lowerLabel.includes('pet')) {
//     tagColor = '#FCE4EC';
//     textColor = '#C2185B';
//   } else if (lowerLabel.includes('smoking')) {
//     tagColor = '#FFEBEE';
//     textColor = '#C62828';
//   } else if (lowerLabel.includes('verified')) {
//     tagColor = '#E8F5E9';
//     textColor = '#2E7D32';
//   } else if (lowerLabel.match(/[0-9]/)) {
//     tagColor = '#E8F5E9';
//     textColor = '#2E7D32';
//   }
  
//   return (
//     <View style={[styles.prefBadge, { backgroundColor: tagColor }]}>
//       <Text style={[styles.prefBadgeText, { color: textColor }]}>{label}</Text>
//     </View>
//   );
// }

// export default function RideNextScreen({ navigation, route }) {
//   const { user, loading: authLoading } = useAuth();
//   const { searchData } = route.params || {};
//   const { from, to, fromCoords, toCoords, dateTime, seats } = searchData || {};

//   const [availableRides, setAvailableRides] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [errorMessage, setErrorMessage] = useState('');
//   const [sortBy, setSortBy] = useState('time');
//   const [quickFilters, setQuickFilters] = useState([]);
//   const [headerFiltersVisible, setHeaderFiltersVisible] = useState(false);
//   const [filterModalVisible, setFilterModalVisible] = useState(false);
//   const [preferenceMaster, setPreferenceMaster] = useState([]);
//   const [userPreferences, setUserPreferences] = useState({});
//   const [advancedFilters, setAdvancedFilters] = useState({});
  
//   const [selectedProfile, setSelectedProfile] = useState({
//     visible: false,
//     imageUrl: null,
//     driverName: '',
//   });

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
//       iconColor = Colors.primary;
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

//   const phoneNumber = user?.phone_number;
//   const userGender = user?.gender; // ✅ Get user gender for filtering
// const fetchAvailableRides = useCallback(async () => {
//   if (!searchData || !fromCoords || !toCoords || !dateTime) {
//     setAvailableRides([]);
//     setLoading(false);
//     return;
//   }

//   try {
//     setLoading(true);
//     setErrorMessage('');

//     const response = await fetch(`${API_BASE_URL}/search-rides`, {
//       method: 'POST',
//       headers: {
//         'Content-Type': 'application/json',
//       },
//       body: JSON.stringify({
//         from_location: from,
//         to_location: to,
//         from_coords: fromCoords,
//         to_coords: toCoords,
//         departure_time: new Date(dateTime).toISOString(),
//         seats_required: seats || 1,
//         passenger_gender: userGender,
//       }),
//     });

//     const rawText = await response.text();
//     let parsedData = null;

//     try {
//       parsedData = rawText ? JSON.parse(rawText) : {};
//     } catch (parseError) {
//       parsedData = { detail: rawText || 'Unexpected server response' };
//     }

//     if (!response.ok) {
//       throw new Error(parsedData?.detail || 'Failed to fetch rides');
//     }

//     const rides = Array.isArray(parsedData?.rides) ? parsedData.rides : [];
    
//     console.log(`📱 Found ${rides.length} rides`);
    
//     // ✅ Log the first ride to see if womenOnly is present
//     if (rides.length > 0) {
//       console.log('🔍 First ride data:', JSON.stringify(rides[0], null, 2));
//       console.log('🔍 womenOnly value:', rides[0].womenOnly);
//     }
    
//     const ridesWithDetails = await Promise.all(
//       rides.map(async (ride) => {
//         let isVerified = false;
//         let avgRating = ride.rating || 0;
//         let profilePictureUrl = null;
        
//         const driverPhone = ride.phoneNumber;
//         const driverUserId = ride.driverUserId;
        
//         if (driverPhone || driverUserId) {
//           if (driverPhone) {
//             const docsData = await fetchUserDocuments(driverPhone);
//             if (docsData?.success && docsData.documents) {
//               isVerified = checkVerifiedDocuments(docsData.documents);
//             }
//           }
          
//           const profileData = await fetchDriverProfile(driverPhone, driverUserId);
          
//           if (profileData?.success && profileData.user) {
//             avgRating = profileData.user.avg_rating || 0;
            
//             const possiblePictureFields = ['profile_picture', 'profilePicture', 'profilePhoto', 'profile_image', 'avatar'];
//             for (const field of possiblePictureFields) {
//               if (profileData.user[field]) {
//                 profilePictureUrl = profileData.user[field];
//                 break;
//               }
//             }
            
//             if (!profilePictureUrl && profileData.user.profile && profileData.user.profile.picture) {
//               profilePictureUrl = profileData.user.profile.picture;
//             }
//           }
//         }
        
//         if (!profilePictureUrl) {
//           if (ride.profilePicture) profilePictureUrl = ride.profilePicture;
//           else if (ride.profilepicture) profilePictureUrl = ride.profilepicture;
//           else if (ride.profilePhoto) profilePictureUrl = ride.profilePhoto;
//           else if (ride.driverProfilePicture) profilePictureUrl = ride.driverProfilePicture;
//         }
        
//         let finalProfilePicture = null;
//         if (profilePictureUrl) {
//           finalProfilePicture = buildImageUrl(profilePictureUrl);
//         }
        
//         // ✅ IMPORTANT: Explicitly preserve the womenOnly field
//         return { 
//           ...ride, 
//           isVerified, 
//           rating: avgRating,
//           profilePicture: finalProfilePicture,
//           profilepicture: finalProfilePicture,
//           profilePhoto: finalProfilePicture,
//           pickupLabel: ride.pickupLocationName || ride.fromLocationName || ride.from || 'Pickup point',
//           dropLabel: ride.dropLocationName || ride.toLocationName || ride.to || 'Drop point',
//           womenOnly: ride.womenOnly === true || ride.women_only === true, // ✅ Ensure womenOnly is preserved
//         };
//       })
//     );
    
//     // ✅ Log after processing to verify womenOnly is preserved
//     if (ridesWithDetails.length > 0) {
//       console.log('✅ After processing - womenOnly:', ridesWithDetails[0].womenOnly);
//     }
    
//     setAvailableRides(ridesWithDetails);
//   } catch (error) {
//     console.log('❌ search-rides error:', error);
//     setAvailableRides([]);
//     setErrorMessage(error.message || 'Failed to search rides');
//     showCustomAlert('Search Error', error.message || 'Failed to search rides', 'error');
//   } finally {
//     setLoading(false);
//   }
// }, [searchData, from, to, fromCoords, toCoords, dateTime, seats, userGender]);
//   const loadPreferenceData = useCallback(async () => {
//     try {
//       const defs = await DatabaseService.getMatchingPreferenceMaster();
//       setPreferenceMaster(defs || []);

//       if (phoneNumber) {
//         const saved = await DatabaseService.getUserMatchingPreferences(phoneNumber);
//         setUserPreferences(saved || {});
//       }
//     } catch (e) {
//       console.log('❌ preference load error:', e);
//     }
//   }, [phoneNumber]);

//   useEffect(() => {
//     if (authLoading) return;
//     fetchAvailableRides();
//     loadPreferenceData();
//   }, [authLoading, fetchAvailableRides, loadPreferenceData]);

//   useFocusEffect(
//     useCallback(() => {
//       if (!authLoading && searchData) {
//         console.log('🔄 Screen focused - reloading rides with fresh data');
//         fetchAvailableRides();
//       }
//     }, [authLoading, searchData, fetchAvailableRides])
//   );

//   const quickFilterOptions = useMemo(() => {
//     const defs = preferenceMaster.filter(pref => QUICK_FILTER_KEYS.includes(pref.key));
//     return defs.slice(0, 3).map(pref => ({
//       key: pref.key,
//       label: QUICK_FILTER_LABELS[pref.key] || pref.label,
//     }));
//   }, [preferenceMaster]);

//   const advancedFilterOptions = useMemo(() => {
//     return preferenceMaster.filter(pref => {
//       if (!pref?.key) return false;
//       if (quickFilterOptions.some(q => q.key === pref.key)) return false;
//       return ['toggle', 'single_select'].includes(pref.input_type);
//     });
//   }, [preferenceMaster, quickFilterOptions]);

//   const processedRides = useMemo(() => {
//     let rides = [...availableRides];
//       // ✅ Log womenOnly values for debugging
//   rides.forEach(ride => {
//     if (ride.womenOnly === true || ride.women_only === true) {
//       console.log('🚺 Women-only ride found:', ride.id, 'womenOnly:', ride.womenOnly, 'women_only:', ride.women_only);
//     }
//   });
//     // ✅ FILTER WOMEN-ONLY RIDES FOR MALE PASSENGERS
//      if (userGender !== 'female') {
//     rides = rides.filter(item => {
//       const isWomenOnly = item.womenOnly === true || item.women_only === true;
//       if (isWomenOnly) {
//         console.log('🚫 Filtering out women-only ride:', item.id);
//       }
//       return !isWomenOnly;
//     });
//     console.log(`🚫 Filtered out women-only rides for male passenger. Remaining: ${rides.length}`);
//   }

//     if (quickFilters.length > 0) {
//       rides = rides.filter(item =>
//         quickFilters.every(key => matchesQuickFilter(item, key))
//       );
//     }

//     const activeAdvanced = Object.entries(advancedFilters).filter(
//       ([, value]) =>
//         value !== '' &&
//         value !== null &&
//         value !== undefined &&
//         value !== false
//     );

//     if (activeAdvanced.length > 0) {
//       rides = rides.filter(item =>
//         activeAdvanced.every(([key, value]) =>
//           matchesAdvancedFilter(item, key, value)
//         )
//       );
//     }

//     rides.sort((a, b) => {
//       if (sortBy === 'price') return (a.price || 0) - (b.price || 0);
//       if (sortBy === 'rating') return (b.rating || 0) - (a.rating || 0);
//       if (sortBy === 'match') return (b.matchPercentage || 0) - (a.matchPercentage || 0);

//       const aDate = new Date(`${a.date || ''} ${a.time || ''}`);
//       const bDate = new Date(`${b.date || ''} ${b.time || ''}`);
//       if (!isNaN(aDate) && !isNaN(bDate)) return aDate - bDate;
//       return 0;
//     });

//     return rides;
//   }, [availableRides, quickFilters, advancedFilters, sortBy, userGender]); // ✅ Added userGender to dependencies

//   const handleCardPress = (ride) => {
//     navigation.navigate('RideDetailScreen', { 
//       ride,
//       searchData: searchData || null,
//     });
//   };

//   const handleProfileImagePress = (imageUrl, driverName) => {
//     setSelectedProfile({
//       visible: true,
//       imageUrl: imageUrl,
//       driverName: driverName,
//     });
//   };

//   const toggleQuickFilter = (key) => {
//     setQuickFilters(prev =>
//       prev.includes(key) ? prev.filter(i => i !== key) : [...prev, key]
//     );
//   };

//   const clearAllFilters = () => {
//     setQuickFilters([]);
//     setAdvancedFilters({});
//     showCustomAlert('Filters Cleared', 'All filters have been reset.', 'info');
//   };

//   const renderAdvancedFilterControl = (pref) => {
//     const currentValue = advancedFilters[pref.key];

//     if (pref.input_type === 'toggle') {
//       const active = !!currentValue;
//       return (
//         <TouchableOpacity
//           activeOpacity={0.85}
//           style={[styles.modalToggleChip, active && styles.modalToggleChipActive]}
//           onPress={() =>
//             setAdvancedFilters(prev => ({ ...prev, [pref.key]: !active }))
//           }
//         >
//           <Text
//             style={[
//               styles.modalToggleChipText,
//               active && styles.modalToggleChipTextActive,
//             ]}
//           >
//             {pref.label}
//           </Text>
//         </TouchableOpacity>
//       );
//     }

//     if (pref.input_type === 'single_select' && Array.isArray(pref.options)) {
//       return (
//         <View style={styles.modalOptionWrap}>
//           {pref.options.map((opt) => {
//             const active = currentValue === opt;
//             return (
//               <TouchableOpacity
//                 key={opt}
//                 activeOpacity={0.85}
//                 style={[
//                   styles.modalOptionChip,
//                   active && styles.modalOptionChipActive,
//                 ]}
//                 onPress={() =>
//                   setAdvancedFilters(prev => ({
//                     ...prev,
//                     [pref.key]: active ? '' : opt,
//                   }))
//                 }
//               >
//                 <Text
//                   style={[
//                     styles.modalOptionChipText,
//                     active && styles.modalOptionChipTextActive,
//                   ]}
//                 >
//                   {opt}
//                 </Text>
//               </TouchableOpacity>
//             );
//           })}
//         </View>
//       );
//     }

//     return null;
//   };

//   const renderRideCard = ({ item }) => {
//     let profilePhotoUrl = null;
//     let isSvg = false;
//     let profilePictureField = null;
    
//     if (item.profilePicture) {
//       profilePhotoUrl = buildImageUrl(item.profilePicture);
//       profilePictureField = 'profilePicture';
//     } else if (item.profilepicture) {
//       profilePhotoUrl = buildImageUrl(item.profilepicture);
//       profilePictureField = 'profilepicture';
//     } else if (item.profilePhoto) {
//       profilePhotoUrl = buildImageUrl(item.profilePhoto);
//       profilePictureField = 'profilePhoto';
//     } else if (item.driverProfilePicture) {
//       profilePhotoUrl = buildImageUrl(item.driverProfilePicture);
//       profilePictureField = 'driverProfilePicture';
//     } else if (item.driver?.profile_picture) {
//       profilePhotoUrl = buildImageUrl(item.driver.profile_picture);
//       profilePictureField = 'driver.profile_picture';
//     } else if (item.user?.profile_picture) {
//       profilePhotoUrl = buildImageUrl(item.user.profile_picture);
//       profilePictureField = 'user.profile_picture';
//     }
    
//     if (profilePhotoUrl && profilePhotoUrl.toLowerCase().includes('.svg')) {
//       isSvg = true;
//     }
    
//     const driverNameText = item.driverName || item.driver_name || item.driver?.full_name || 'Driver';
//     const avatarText = getDriverInitials(driverNameText);

//     let vehicleLabel = 'Vehicle details unavailable';
//     if (item.vehicle) {
//       const vehicleParts = [];
//       if (item.vehicle.model) vehicleParts.push(item.vehicle.model);
//       if (item.vehicle.color && vehicleParts.length > 0) {
//         vehicleLabel = `${vehicleParts.join(' ')} - ${item.vehicle.color}`;
//       } else if (item.vehicle.color) {
//         vehicleLabel = item.vehicle.color;
//       } else if (vehicleParts.length > 0) {
//         vehicleLabel = vehicleParts.join(' ');
//       }
//     } else if (item.vehicleModel) {
//       vehicleLabel = item.vehicleModel;
//       if (item.vehicleColor) {
//         vehicleLabel = `${item.vehicleModel} - ${item.vehicleColor}`;
//       }
//     }

//     const preferenceBadges = extractPreferenceBadges(item);
//     const isDriverVerified = item.isVerified;
//     const driverRating = item.rating || 0;

//     const pickupName = item.pickupLocationName || item.fromLocationName || item.from || 'Pickup point';
//     const dropName = item.dropLocationName || item.toLocationName || item.to || 'Drop point';

//     return (
//       <TouchableOpacity
//         style={styles.rideCard}
//         onPress={() => handleCardPress(item)}
//         activeOpacity={0.9}
//       >
//         <View style={styles.cardTopRow}>
//           <View style={styles.profileRow}>
//             <TouchableOpacity
//               onPress={() => handleProfileImagePress(profilePhotoUrl, driverNameText)}
//               activeOpacity={0.8}
//             >
//               <View style={styles.avatarContainer}>
//                 {profilePhotoUrl ? (
//                   isSvg ? (
//                     <View style={styles.svgContainer}>
//                       <SvgCssUri
//                         uri={profilePhotoUrl}
//                         width="48"
//                         height="48"
//                         onError={(e) => console.log('SVG load error:', e)}
//                       />
//                     </View>
//                   ) : (
//                     <Image
//                       source={{ uri: profilePhotoUrl }}
//                       style={styles.avatarImage}
//                       resizeMode="cover"
//                       onError={(e) => console.log('Image load error:', e.nativeEvent.error, 'URL:', profilePhotoUrl)}
//                     />
//                   )
//                 ) : (
//                   <View style={styles.initialsContainer}>
//                     <Text style={styles.avatarFallback}>{avatarText}</Text>
//                   </View>
//                 )}
//               </View>
//             </TouchableOpacity>

//             <View style={styles.profileContent}>
//               <View style={styles.nameRow}>
//                 <Text style={styles.driverName} numberOfLines={1}>
//                   {driverNameText}
//                 </Text>

//                 {isDriverVerified && (
//                   <View style={styles.verifiedBadge}>
//                     <Ionicons name="checkmark-circle" size={14} color="#16A34A" />
//                     <Text style={styles.verifiedText}>Verified</Text>
//                   </View>
//                 )}

//                 {/* ✅ Women Only Badge - Show for women-only rides */}
//                 {item.womenOnly === true && (
//                   <View style={styles.womenOnlyBadge}>
//                     <Ionicons name="woman" size={12} color="#E91E63" />
//                     <Text style={styles.womenOnlyBadgeText}>Women Only</Text>
//                   </View>
//                 )}
//               </View>

//               <View style={styles.ratingRow}>
//                 <RatingStars rating={driverRating} size={12} showLabel={true} />
//               </View>
//             </View>
//           </View>

//           <View style={styles.priceMatchWrap}>
//             <View style={styles.matchBadge}>
//               <Text style={styles.matchText}>{item.matchPercentage || 0}%</Text>
//             </View>
//             <Text style={styles.priceText}>₹{item.price}</Text>
//             <Text style={styles.perSeatText}>per seat</Text>
//           </View>
//         </View>

//         <View style={styles.infoRow}>
//           <View style={styles.infoItem}>
//             <Ionicons name="calendar-outline" size={13} color={Colors.gray} />
//             <Text style={styles.infoText} numberOfLines={1}>{item.date}</Text>
//           </View>
//           <View style={styles.infoDot} />
//           <View style={styles.infoItem}>
//             <Ionicons name="time-outline" size={13} color={Colors.gray} />
//             <Text style={styles.infoText} numberOfLines={1}>{item.time}</Text>
//           </View>
//           <View style={styles.infoDot} />
//           <View style={styles.infoItem}>
//             <Ionicons name="people-outline" size={13} color={Colors.gray} />
//             <Text style={styles.infoText} numberOfLines={1}>{item.seatsAvailable} left</Text>
//           </View>
//         </View>

//         <View style={styles.divider} />

//         <View style={styles.routeBlock}>
//           <View style={styles.routeRow}>
//             <View style={[styles.routeDot, { backgroundColor: '#22C55E' }]} />
//             <View style={styles.routeTextWrap}>
//               <Text style={styles.routeLabel}>Pickup</Text>
//               <Text style={styles.routeText} numberOfLines={2}>{pickupName}</Text>
//             </View>
//           </View>
//           <View style={styles.routeRow}>
//             <View style={[styles.routeDot, { backgroundColor: '#F97316' }]} />
//             <View style={styles.routeTextWrap}>
//               <Text style={styles.routeLabel}>Drop</Text>
//               <Text style={styles.routeText} numberOfLines={2}>{dropName}</Text>
//             </View>
//           </View>
//         </View>

//         <View style={styles.vehicleRow}>
//           <Ionicons name="car-sport-outline" size={14} color={Colors.gray} />
//           <Text style={styles.vehicleText} numberOfLines={1}>{vehicleLabel}</Text>
//         </View>

//         {preferenceBadges.length > 0 && (
//           <ScrollView
//             horizontal
//             showsHorizontalScrollIndicator={false}
//             contentContainerStyle={styles.badgeScroll}
//           >
//             {preferenceBadges.map((badge, index) => (
//               <PreferenceTag key={`${badge}-${index}`} label={badge} />
//             ))}
//           </ScrollView>
//         )}
//       </TouchableOpacity>
//     );
//   };

//   if (authLoading || loading) {
//     return (
//       <View style={styles.loadingContainer}>
//         <LottieView
//           source={require("../assets/loading.json")}
//           autoPlay
//           loop
//           style={{ width: 300, height: 300 }}
//         />
//       </View>
//     );
//   }

//   return (
//     <SafeAreaView style={styles.container}>
//       <StatusBar barStyle="dark-content" backgroundColor={Colors.white} />

//       <View style={styles.header}>
//         <TouchableOpacity
//           style={styles.backButton}
//           onPress={() => navigation.goBack()}
//         >
//           <MaterialIcons name="arrow-back-ios" size={24} color="#ED7117" />
//         </TouchableOpacity>

//         <Text style={styles.headerTitle}>Available Rides</Text>

//         <TouchableOpacity
//           style={[
//             styles.filterButton,
//             headerFiltersVisible && styles.filterButtonActive
//           ]}
//           onPress={() => setHeaderFiltersVisible(prev => !prev)}
//         >
//           <Ionicons name="options-outline" size={22} color="#ED7117" />
//         </TouchableOpacity>
//       </View>

//       {headerFiltersVisible ? (
//         <View style={styles.topControlsWrap}>
//           <ScrollView
//             horizontal
//             showsHorizontalScrollIndicator={false}
//             contentContainerStyle={styles.filterScroll}
//           >
//             {quickFilterOptions.map((filter) => {
//               const active = quickFilters.includes(filter.key);
//               return (
//                 <TouchableOpacity
//                   key={filter.key}
//                   activeOpacity={0.85}
//                   style={[styles.quickChip, active && styles.quickChipActive]}
//                   onPress={() => toggleQuickFilter(filter.key)}
//                 >
//                   <Text
//                     style={[
//                       styles.quickChipText,
//                       active && styles.quickChipTextActive,
//                     ]}
//                   >
//                     {filter.label}
//                   </Text>
//                 </TouchableOpacity>
//               );
//             })}

//             <TouchableOpacity
//               activeOpacity={0.85}
//               style={styles.moreFilterChip}
//               onPress={() => setFilterModalVisible(true)}
//             >
//               <Ionicons name="options-outline" size={14} color="#ED7117" />
//               <Text style={styles.moreFilterChipText}>More Filters</Text>
//             </TouchableOpacity>
//           </ScrollView>

//           <Text style={styles.sortLabel}>Sort by</Text>

//           <ScrollView
//             horizontal
//             showsHorizontalScrollIndicator={false}
//             contentContainerStyle={styles.sortScroll}
//           >
//             {SORT_OPTIONS.map((option) => {
//               const active = sortBy === option.key;
//               return (
//                 <TouchableOpacity
//                   key={option.key}
//                   activeOpacity={0.85}
//                   style={[styles.sortChip, active && styles.sortChipActive]}
//                   onPress={() => setSortBy(option.key)}
//                 >
//                   <Text
//                     style={[
//                       styles.sortChipText,
//                       active && styles.sortChipTextActive,
//                     ]}
//                   >
//                     {option.label}
//                   </Text>
//                 </TouchableOpacity>
//               );
//             })}
//           </ScrollView>
//         </View>
//       ) : null}

//       {processedRides.length === 0 ? (
//         <View style={styles.emptyContainer}>
//           <Ionicons name="car-outline" size={80} color={Colors.gray} />
//           <Text style={styles.emptyTitle}>No Rides Found</Text>
//           <Text style={styles.emptySubtitle}>
//             {errorMessage
//               ? errorMessage
//               : 'Try changing your filters or search again.'}
//           </Text>

//           <TouchableOpacity style={styles.clearButton} onPress={clearAllFilters}>
//             <Text style={styles.clearButtonText}>Clear Filters</Text>
//           </TouchableOpacity>
//         </View>
//       ) : (
//         <FlatList
//           data={processedRides}
//           renderItem={renderRideCard}
//           keyExtractor={(item) => String(item.id)}
//           contentContainerStyle={styles.listContent}
//           showsVerticalScrollIndicator={false}
//           ItemSeparatorComponent={() => <View style={{ height: 12 }} />}
//         />
//       )}

//       <Modal
//         visible={filterModalVisible}
//         transparent
//         animationType="slide"
//         onRequestClose={() => setFilterModalVisible(false)}
//       >
//         <View style={styles.modalBackdrop}>
//           <TouchableOpacity
//             style={styles.modalOverlay}
//             activeOpacity={1}
//             onPress={() => setFilterModalVisible(false)}
//           />

//           <View style={styles.modalSheet}>
//             <View style={styles.modalHandle} />

//             <View style={styles.modalHeader}>
//               <Text style={styles.modalTitle}>More Filters</Text>
//               <TouchableOpacity onPress={() => setFilterModalVisible(false)}>
//                 <Ionicons name="close" size={24} color={Colors.dark} />
//               </TouchableOpacity>
//             </View>

//             <ScrollView
//               showsVerticalScrollIndicator={false}
//               contentContainerStyle={styles.modalContent}
//             >
//               {advancedFilterOptions.map((pref) => (
//                 <View key={pref.key} style={styles.modalSection}>
//                   <Text style={styles.modalSectionTitle}>{pref.label}</Text>
//                   {renderAdvancedFilterControl(pref)}
//                 </View>
//               ))}
//             </ScrollView>

//             <View style={styles.modalFooter}>
//               <TouchableOpacity
//                 style={styles.modalSecondaryBtn}
//                 onPress={clearAllFilters}
//               >
//                 <Text style={styles.modalSecondaryBtnText}>Clear</Text>
//               </TouchableOpacity>

//               <TouchableOpacity
//                 style={styles.modalPrimaryBtn}
//                 onPress={() => setFilterModalVisible(false)}
//               >
//                 <Text style={styles.modalPrimaryBtnText}>Apply Filters</Text>
//               </TouchableOpacity>
//             </View>
//           </View>
//         </View>
//       </Modal>

//       <ProfileImageModal
//         visible={selectedProfile.visible}
//         imageUrl={selectedProfile.imageUrl}
//         driverName={selectedProfile.driverName}
//         onClose={() => setSelectedProfile({ visible: false, imageUrl: null, driverName: '' })}
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

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     backgroundColor: '#fff',
//   },
//   header: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     paddingHorizontal: 16,
//     paddingVertical: 12,
//     borderBottomWidth: 0.5,
//     borderBottomColor: '#fff',
//     backgroundColor: Colors.white,
//   },
//   backButton: {
//     width: 44,
//     height: 44,
//     justifyContent: 'center',
//   },
//   filterButton: {
//     width: 44,
//     height: 44,
//     justifyContent: 'center',
//     alignItems: 'center',
//     borderRadius: 22,
//   },
//   filterButtonActive: {
//     backgroundColor: '#fff',
//   },
//   headerTitle: {
//     ...Typography.h2,
//     fontSize: 28,
//     fontWeight: '700',
//     color: Colors.primary,
//     flex: 1,
//     textAlign: 'center',
//   },
//   topControlsWrap: {
//     backgroundColor: Colors.white,
//     paddingTop: 10,
//     paddingBottom: 12,
//     borderBottomWidth: 1,
//     borderBottomColor: '#EEF2F7',
//   },
//   filterScroll: {
//     paddingHorizontal: 16,
//     gap: 10,
//   },
//   quickChip: {
//     paddingHorizontal: 14,
//     paddingVertical: 10,
//     borderRadius: 20,
//     backgroundColor: '#F3F4F6',
//   },
//   quickChipActive: {
//     backgroundColor: Colors.primary,
//   },
//   quickChipText: {
//     fontSize: 12,
//     fontWeight: '600',
//     color: Colors.dark,
//   },
//   quickChipTextActive: {
//     color: Colors.white,
//   },
//   moreFilterChip: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     gap: 6,
//     paddingHorizontal: 14,
//     paddingVertical: 10,
//     borderRadius: 20,
//     backgroundColor: '#EEF6FF',
//   },
//   moreFilterChipText: {
//     fontSize: 12,
//     fontWeight: '700',
//     color: '#ED7117',
//   },
//   sortLabel: {
//     paddingHorizontal: 16,
//     marginTop: 12,
//     marginBottom: 8,
//     fontSize: 12,
//     color: Colors.gray,
//     fontWeight: '700',
//   },
//   sortScroll: {
//     paddingHorizontal: 16,
//     gap: 10,
//   },
//   sortChip: {
//     paddingHorizontal: 14,
//     paddingVertical: 8,
//     borderRadius: 14,
//     backgroundColor: '#F3F4F6',
//   },
//   sortChipActive: {
//     backgroundColor: '#ED7117',
//   },
//   sortChipText: {
//     fontSize: 12,
//     color: Colors.dark,
//     fontWeight: '600',
//   },
//   sortChipTextActive: {
//     color: Colors.white,
//   },
//   listContent: {
//     padding: 16,
//     paddingBottom: 28,
//   },
//   rideCard: {
//     backgroundColor: Colors.white,
//     borderRadius: 18,
//     padding: 14,
//     borderWidth: 1,
//     borderColor: '#EEF2F7',
//     shadowColor: '#0F172A',
//     shadowOffset: { width: 0, height: 6 },
//     shadowOpacity: 0.05,
//     shadowRadius: 14,
//     elevation: 2,
//   },
//   cardTopRow: {
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//     alignItems: 'flex-start',
//   },
//   profileRow: {
//     flexDirection: 'row',
//     flex: 1,
//     paddingRight: 10,
//   },
//   avatarContainer: {
//     width: 48,
//     height: 48,
//     borderRadius: 24,
//     backgroundColor: '#E5E7EB',
//     alignItems: 'center',
//     justifyContent: 'center',
//     overflow: 'hidden',
//     marginRight: 10,
//   },
//   avatarImage: {
//     width: 48,
//     height: 48,
//   },
//   avatarFallback: {
//     fontSize: 14,
//     fontWeight: '800',
//     color: Colors.gray,
//   },
//   profileContent: {
//     flex: 1,
//   },
//   nameRow: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     flexWrap: 'wrap',
//     gap: 6,
//   },
//   driverName: {
//     fontSize: 15,
//     fontWeight: '800',
//     color: Colors.dark,
//     maxWidth: '100%',
//   },
//   verifiedBadge: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     gap: 4,
//     backgroundColor: '#E8F5E9',
//     paddingHorizontal: 6,
//     paddingVertical: 2,
//     borderRadius: 12,
//   },
//   verifiedText: {
//     fontSize: 10,
//     fontWeight: '700',
//     color: '#16A34A',
//   },
//   womenOnlyBadge: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     gap: 4,
//     backgroundColor: '#FCE4EC',
//     paddingHorizontal: 8,
//     paddingVertical: 3,
//     borderRadius: 12,
//   },
//   womenOnlyBadgeText: {
//     fontSize: 10,
//     color: '#E91E63',
//     fontWeight: '700',
//   },
//   ratingRow: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     marginTop: 4,
//   },
//   ratingText: {
//     fontSize: 11,
//     color: Colors.gray,
//     fontWeight: '600',
//   },
//   priceMatchWrap: {
//     alignItems: 'flex-end',
//   },
//   matchBadge: {
//     backgroundColor: '#EEF6FF',
//     paddingHorizontal: 8,
//     paddingVertical: 4,
//     borderRadius: 10,
//     marginBottom: 6,
//   },
//   matchText: {
//     fontSize: 12,
//     fontWeight: '800',
//     color: Colors.primary,
//   },
//   priceText: {
//     fontSize: 18,
//     fontWeight: '800',
//     color: '#ED7117',
//     lineHeight: 20,
//   },
//   perSeatText: {
//     fontSize: 10,
//     color: Colors.gray,
//     fontWeight: '600',
//     marginTop: 2,
//   },
//   infoRow: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     flexWrap: 'wrap',
//     marginTop: 12,
//     marginBottom: 10,
//   },
//   infoItem: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     gap: 4,
//   },
//   infoText: {
//     fontSize: 12,
//     color: Colors.dark,
//     fontWeight: '600',
//   },
//   infoDot: {
//     width: 4,
//     height: 4,
//     borderRadius: 2,
//     backgroundColor: '#CBD5E1',
//     marginHorizontal: 8,
//   },
//   divider: {
//     height: 1,
//     backgroundColor: '#EEF2F7',
//     marginBottom: 10,
//   },
//   routeBlock: {
//     gap: 8,
//   },
//   routeRow: {
//     flexDirection: 'row',
//     alignItems: 'flex-start',
//   },
//   routeDot: {
//     width: 8,
//     height: 8,
//     borderRadius: 4,
//     marginTop: 5,
//     marginRight: 8,
//   },
//   routeTextWrap: {
//     flex: 1,
//   },
//   routeLabel: {
//     fontSize: 11,
//     color: Colors.gray,
//     fontWeight: '700',
//     marginBottom: 2,
//   },
//   routeText: {
//     fontSize: 13,
//     color: Colors.dark,
//     fontWeight: '600',
//     lineHeight: 18,
//   },
//   vehicleRow: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     gap: 6,
//     marginTop: 10,
//   },
//   vehicleText: {
//     fontSize: 12,
//     color: Colors.gray,
//     fontWeight: '600',
//     flex: 1,
//   },
//   badgeScroll: {
//     gap: 8,
//     paddingTop: 10,
//   },
//   prefBadge: {
//     paddingHorizontal: 10,
//     paddingVertical: 6,
//     borderRadius: 12,
//     marginRight: 8,
//   },
//   prefBadgeText: {
//     fontSize: 11,
//     fontWeight: '700',
//   },
//   loadingContainer: {
//     flex: 1,
//     justifyContent: 'center',
//     alignItems: 'center',
//     backgroundColor: Colors.white,
//   },
//   emptyContainer: {
//     flex: 1,
//     justifyContent: 'center',
//     alignItems: 'center',
//     paddingHorizontal: 40,
//   },
//   emptyTitle: {
//     fontSize: 22,
//     fontWeight: '700',
//     color: Colors.dark,
//     marginTop: 20,
//     marginBottom: 8,
//   },
//   emptySubtitle: {
//     fontSize: 15,
//     color: Colors.gray,
//     textAlign: 'center',
//     lineHeight: 22,
//     marginBottom: 24,
//   },
//   clearButton: {
//     backgroundColor: Colors.primary,
//     paddingHorizontal: 24,
//     paddingVertical: 12,
//     borderRadius: 12,
//   },
//   clearButtonText: {
//     color: Colors.white,
//     fontSize: 15,
//     fontWeight: '700',
//   },
//   modalBackdrop: {
//     flex: 1,
//     backgroundColor: 'rgba(15,23,42,0.28)',
//     justifyContent: 'flex-end',
//   },
//   modalOverlay: {
//     flex: 1,
//   },
//   modalSheet: {
//     backgroundColor: Colors.white,
//     borderTopLeftRadius: 24,
//     borderTopRightRadius: 24,
//     maxHeight: '78%',
//     paddingTop: 10,
//   },
//   modalHandle: {
//     width: 52,
//     height: 5,
//     borderRadius: 999,
//     backgroundColor: '#D1D5DB',
//     alignSelf: 'center',
//     marginBottom: 14,
//   },
//   modalHeader: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     justifyContent: 'space-between',
//     paddingHorizontal: 18,
//     paddingBottom: 10,
//   },
//   modalTitle: {
//     fontSize: 20,
//     fontWeight: '800',
//     color: Colors.dark,
//   },
//   modalContent: {
//     paddingHorizontal: 18,
//     paddingBottom: 20,
//   },
//   modalSection: {
//     marginBottom: 18,
//   },
//   modalSectionTitle: {
//     fontSize: 14,
//     fontWeight: '700',
//     color: Colors.dark,
//     marginBottom: 10,
//   },
//   modalToggleChip: {
//     borderRadius: 14,
//     borderWidth: 1,
//     borderColor: '#E5E7EB',
//     paddingHorizontal: 14,
//     paddingVertical: 10,
//     alignSelf: 'flex-start',
//     backgroundColor: '#F9FAFB',
//   },
//   modalToggleChipActive: {
//     backgroundColor: Colors.primary,
//     borderColor: Colors.primary,
//   },
//   modalToggleChipText: {
//     fontSize: 13,
//     color: Colors.dark,
//     fontWeight: '600',
//   },
//   modalToggleChipTextActive: {
//     color: Colors.white,
//   },
//   modalOptionWrap: {
//     flexDirection: 'row',
//     flexWrap: 'wrap',
//     gap: 10,
//   },
//   modalOptionChip: {
//     borderRadius: 16,
//     borderWidth: 1,
//     borderColor: '#E5E7EB',
//     paddingHorizontal: 12,
//     paddingVertical: 9,
//     backgroundColor: '#F9FAFB',
//   },
//   modalOptionChipActive: {
//     backgroundColor: Colors.primary,
//     borderColor: Colors.primary,
//   },
//   modalOptionChipText: {
//     fontSize: 13,
//     color: Colors.dark,
//     fontWeight: '600',
//   },
//   modalOptionChipTextActive: {
//     color: Colors.white,
//   },
//   modalFooter: {
//     flexDirection: 'row',
//     paddingHorizontal: 18,
//     paddingTop: 12,
//     paddingBottom: Platform.OS === 'ios' ? 28 : 18,
//     borderTopWidth: 1,
//     borderTopColor: '#EEF2F7',
//     gap: 12,
//   },
//   modalSecondaryBtn: {
//     flex: 1,
//     borderRadius: 14,
//     paddingVertical: 14,
//     alignItems: 'center',
//     backgroundColor: '#F3F4F6',
//   },
//   modalSecondaryBtnText: {
//     fontSize: 15,
//     fontWeight: '700',
//     color: Colors.dark,
//   },
//   modalPrimaryBtn: {
//     flex: 1,
//     borderRadius: 14,
//     paddingVertical: 14,
//     alignItems: 'center',
//     backgroundColor: Colors.primary,
//   },
//   modalPrimaryBtnText: {
//     fontSize: 15,
//     fontWeight: '700',
//     color: Colors.white,
//   },
//   imageModalContainer: {
//     flex: 1,
//     justifyContent: 'center',
//     alignItems: 'center',
//     backgroundColor: 'rgba(0,0,0,0.9)',
//   },
//   imageModalContent: {
//     width: '90%',
//     backgroundColor: Colors.white,
//     borderRadius: 20,
//     overflow: 'hidden',
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
//   svgContainer: {
//     width: 48,
//     height: 48,
//     alignItems: 'center',
//     justifyContent: 'center',
//   },
//   initialsContainer: {
//     width: '100%',
//     height: '100%',
//     alignItems: 'center',
//     justifyContent: 'center',
//     backgroundColor: '#E5E7EB',
//   },
//   modalSvgContainer: {
//     width: '100%',
//     height: 400,
//     backgroundColor: '#F5F5F5',
//     alignItems: 'center',
//     justifyContent: 'center',
//   },
// });
// import React, { useState, useEffect, useCallback, useMemo } from 'react';
// import {
//   View,
//   Text,
//   StyleSheet,
//   TouchableOpacity,
//   FlatList,
//   StatusBar,
//   Platform,
//   Image,
//   ScrollView,
//   Modal,
//   Alert,
// } from 'react-native';
// import { SafeAreaView } from 'react-native-safe-area-context';
// import { Ionicons, MaterialIcons } from '@expo/vector-icons';
// import LottieView from "lottie-react-native";
// import { Colors, Typography } from '../constants/Colors';
// import { useAuth } from '../context/AuthContext';
// import { API_BASE_URL } from '../config/config_ip';
// import DatabaseService from '../services/matchingpreference_ds';
// import CustomAlert from '../components/CustomAlert';
// import { SvgCssUri } from 'react-native-svg/css';

// const IMAGE_BASE_URL = API_BASE_URL;
// import { useFocusEffect } from '@react-navigation/native';

// const QUICK_FILTER_KEYS = [
//   'verified_profiles_only',
//   'same_gender_after_9pm',
//   'smoking_policy',
//   'pets_allowed',
//   'chat_level',
//   'luggage_allowance',
// ];

// const QUICK_FILTER_LABELS = {
//   verified_profiles_only: 'Verified Only',
//   same_gender_after_9pm: 'Same Gender Night',
//   smoking_policy: 'No Smoking',
//   pets_allowed: 'Pets',
//   chat_level: 'Chat Level',
//   luggage_allowance: 'Luggage',
// };

// const ICON_MAP = {
//   smoking_policy: 'smoking',
//   speak_languages: 'language',
//   chat_level: 'chat',
//   age_category: 'person',
//   gender_preference: 'wc',
//   luggage_allowance: 'luggage',
//   pets_allowed: 'pets',
//   detours: 'alt-route',
//   helmet_policy_driver: 'sports-motorsports',
//   helmet_policy_passenger: 'sports-motorsports',
//   avoid_frequent_stops: 'timer-off',
//   same_gender_after_9pm: 'nightlight',
//   verified_profiles_only: 'verified-user',
// };

// const SORT_OPTIONS = [
//   { key: 'time', label: 'Time' },
//   { key: 'price', label: 'Price' },
//   { key: 'rating', label: 'Rating' },
//   { key: 'match', label: 'Match %' },
// ];

// function buildImageUrl(url) {
//   if (!url) return null;
//   if (url.startsWith('http://') || url.startsWith('https://')) return url;
//   return `${IMAGE_BASE_URL}${url.startsWith('/') ? '' : '/'}${url}`;
// }

// function getDriverInitials(name) {
//   if (!name) return 'D';
//   const parts = name.trim().split(' ').filter(Boolean);
//   if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
//   return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
// }

// function normalizeText(value) {
//   if (value === undefined || value === null) return '';
//   return String(value).trim().toLowerCase();
// }

// function prettyPreferenceLabel(key) {
//   return QUICK_FILTER_LABELS[key] || key.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
// }

// function getRidePreferences(item) {
//   if (item.preferences) return item.preferences;
//   if (item.ridePreferences) return item.ridePreferences;
//   if (item.matchingPreferences) return item.matchingPreferences;
//   if (item.travel_preferences) return item.travel_preferences;
//   return {};
// }

// function extractPreferenceBadges(item) {
//   const prefs = getRidePreferences(item);
//   const badges = [];

//   if (!prefs || Object.keys(prefs).length === 0) {
//     return [];
//   }

//   Object.entries(prefs).forEach(([key, value]) => {
//     if (value === null || value === undefined) return;
    
//     if (typeof value === 'boolean') {
//       if (value === true) {
//         if (key === 'verified_profiles_only') {
//           badges.push('Verified Only');
//         } else {
//           const displayKey = key.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
//           badges.push(displayKey);
//         }
//       }
//     } 
//     else if (Array.isArray(value)) {
//       if (value.length > 0) {
//         value.forEach(v => {
//           if (v && v.trim()) {
//             badges.push(v.trim());
//           }
//         });
//       }
//     }
//     else if (typeof value === 'string' && value.trim()) {
//       const lowerValue = value.toLowerCase();
//       if (!['false', 'no', 'none', 'null', 'undefined', 'no preference'].includes(lowerValue)) {
//         badges.push(value);
//       }
//     }
//     else if (typeof value === 'number') {
//       badges.push(String(value));
//     }
//   });

//   return [...new Set(badges)];
// }

// async function fetchUserDocuments(phoneNumber) {
//   try {
//     const url = `${API_BASE_URL}/api/v1/documents/user/${phoneNumber}`;
//     const res = await fetch(url, { headers: { Accept: 'application/json' } });
//     if (!res.ok) return null;
//     const data = await res.json();
//     return data;
//   } catch (e) {
//     console.log('fetchUserDocuments error:', e);
//     return null;
//   }
// }

// async function fetchDriverProfile(phoneNumber, userId) {
//   try {
//     const params = new URLSearchParams();
//     if (userId) params.append('user_id', userId);
//     else if (phoneNumber) params.append('phone_number', phoneNumber);
//     else return null;
//     const url = `${API_BASE_URL}/api/v1/users/profile-public?${params.toString()}`;
//     const res = await fetch(url, { headers: { Accept: 'application/json' } });
//     if (!res.ok) return null;
//     const data = await res.json();
//     return data;
//   } catch (e) {
//     console.log('fetchDriverProfile error:', e);
//     return null;
//   }
// }

// function checkVerifiedDocuments(docs) {
//   if (!docs || !docs.length) return false;
  
//   const verified = docs.filter(doc => {
//     const docType = doc.document_type?.toLowerCase();
//     const status = doc.status?.toUpperCase();
//     return status === 'APPROVED' && ['aadhar', 'dl', 'rc'].includes(docType);
//   });
  
//   return verified.length > 0;
// }

// function RatingStars({ rating, size = 12, showLabel = true }) {
//   const fullStars = Math.floor(rating);
//   const hasHalfStar = rating % 1 >= 0.5;
//   const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);
  
//   return (
//     <View style={{ flexDirection: 'row', alignItems: 'center' }}>
//       {[...Array(fullStars)].map((_, i) => (
//         <Ionicons key={`full-${i}`} name="star" size={size} color="#F59E0B" />
//       ))}
//       {hasHalfStar && (
//         <Ionicons name="star-half" size={size} color="#F59E0B" />
//       )}
//       {[...Array(emptyStars)].map((_, i) => (
//         <Ionicons key={`empty-${i}`} name="star-outline" size={size} color="#F59E0B" />
//       ))}
//       {showLabel && rating > 0 && (
//         <Text style={[styles.ratingText, { marginLeft: 4 }]}>({rating.toFixed(1)})</Text>
//       )}
//       {showLabel && rating === 0 && (
//         <Text style={[styles.ratingText, { marginLeft: 4 }]}>New</Text>
//       )}
//     </View>
//   );
// }

// function matchesQuickFilter(item, key) {
//   const prefs = getRidePreferences(item);
//   const value = prefs?.[key];
//   const normalized = normalizeText(value);

//   if (key === 'verified_profiles_only') {
//     return !!item.isVerified;
//   }

//   if (typeof value === 'boolean') return value;
//   if (Array.isArray(value)) return value.length > 0;

//   if (key === 'smoking_policy') {
//     return normalized.includes('no');
//   }

//   if (key === 'same_gender_after_9pm') {
//     return normalized === 'true' || normalized === 'yes' || normalized === 'same gender';
//   }

//   if (key === 'pets_allowed') {
//     return normalized === 'true' || normalized === 'yes' || normalized === 'allowed';
//   }

//   return !!normalized;
// }

// function matchesAdvancedFilter(item, key, expectedValue) {
//   if (expectedValue === undefined || expectedValue === null || expectedValue === '') {
//     return true;
//   }

//   const prefs = getRidePreferences(item);
//   const rideValue = prefs?.[key];

//   if (typeof expectedValue === 'boolean') {
//     if (key === 'verified_profiles_only') {
//       return expectedValue ? !!item.isVerified : true;
//     }
//     return rideValue === expectedValue || normalizeText(rideValue) === String(expectedValue);
//   }

//   if (Array.isArray(rideValue)) {
//     return rideValue.map(v => normalizeText(v)).includes(normalizeText(expectedValue));
//   }

//   return normalizeText(rideValue) === normalizeText(expectedValue);
// }

// function ProfileImageModal({ visible, imageUrl, driverName, onClose }) {
//   const [isSvg, setIsSvg] = useState(false);
  
//   useEffect(() => {
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
//               <Text style={styles.imageModalTitle}>{driverName}</Text>
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
//                 <Text style={styles.noImageText}>No profile picture available</Text>
//               </View>
//             )}
//           </View>
//         </View>
//       </TouchableOpacity>
//     </Modal>
//   );
// }

// function PreferenceTag({ label }) {
//   if (!label || label.trim() === '') return null;
  
//   let tagColor = '#FFF3E8';
//   let textColor = '#C65D00';
  
//   const lowerLabel = label.toLowerCase();
  
//   if (lowerLabel.includes('chatty') || lowerLabel.includes('talkative')) {
//     tagColor = '#E3F2FD';
//     textColor = '#1565C0';
//   } else if (lowerLabel.includes('quiet')) {
//     tagColor = '#E8F5E9';
//     textColor = '#2E7D32';
//   } else if (lowerLabel.includes('english') || lowerLabel.includes('hindi') || lowerLabel.includes('language')) {
//     tagColor = '#FFF9C4';
//     textColor = '#F57F17';
//   } else if (lowerLabel.includes('music') || lowerLabel.includes('songs')) {
//     tagColor = '#F3E5F5';
//     textColor = '#6A1B9A';
//   } else if (lowerLabel.includes('ac')) {
//     tagColor = '#E3F2FD';
//     textColor = '#1565C0';
//   } else if (lowerLabel.includes('pet')) {
//     tagColor = '#FCE4EC';
//     textColor = '#C2185B';
//   } else if (lowerLabel.includes('smoking')) {
//     tagColor = '#FFEBEE';
//     textColor = '#C62828';
//   } else if (lowerLabel.includes('verified')) {
//     tagColor = '#E8F5E9';
//     textColor = '#2E7D32';
//   } else if (lowerLabel.match(/[0-9]/)) {
//     tagColor = '#E8F5E9';
//     textColor = '#2E7D32';
//   }
  
//   return (
//     <View style={[styles.prefBadge, { backgroundColor: tagColor }]}>
//       <Text style={[styles.prefBadgeText, { color: textColor }]}>{label}</Text>
//     </View>
//   );
// }

// export default function RideNextScreen({ navigation, route }) {
//   const { user, loading: authLoading } = useAuth();
//   const { searchData } = route.params || {};
//   const { from, to, fromCoords, toCoords, dateTime, seats } = searchData || {};

//   const [availableRides, setAvailableRides] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [errorMessage, setErrorMessage] = useState('');
//   const [sortBy, setSortBy] = useState('time');
//   const [quickFilters, setQuickFilters] = useState([]);
//   const [headerFiltersVisible, setHeaderFiltersVisible] = useState(false);
//   const [filterModalVisible, setFilterModalVisible] = useState(false);
//   const [preferenceMaster, setPreferenceMaster] = useState([]);
//   const [userPreferences, setUserPreferences] = useState({});
//   const [advancedFilters, setAdvancedFilters] = useState({});
  
//   const [selectedProfile, setSelectedProfile] = useState({
//     visible: false,
//     imageUrl: null,
//     driverName: '',
//   });

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
//       iconColor = Colors.primary;
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

//   const phoneNumber = user?.phone_number;
//   const userGender = user?.gender;
//   const requestedSeats = seats || 1;

//   const fetchAvailableRides = useCallback(async () => {
//     if (!searchData || !fromCoords || !toCoords || !dateTime) {
//       setAvailableRides([]);
//       setLoading(false);
//       return;
//     }

//     try {
//       setLoading(true);
//       setErrorMessage('');

//       const response = await fetch(`${API_BASE_URL}/search-rides`, {
//         method: 'POST',
//         headers: {
//           'Content-Type': 'application/json',
//         },
//         body: JSON.stringify({
//           from_location: from,
//           to_location: to,
//           from_coords: fromCoords,
//           to_coords: toCoords,
//           departure_time: new Date(dateTime).toISOString(),
//           seats_required: requestedSeats,
//           passenger_gender: userGender,
//         }),
//       });

//       const rawText = await response.text();
//       let parsedData = null;

//       try {
//         parsedData = rawText ? JSON.parse(rawText) : {};
//       } catch (parseError) {
//         parsedData = { detail: rawText || 'Unexpected server response' };
//       }

//       if (!response.ok) {
//         throw new Error(parsedData?.detail || 'Failed to fetch rides');
//       }

//       const rides = Array.isArray(parsedData?.rides) ? parsedData.rides : [];
      
//       console.log(`📱 Found ${rides.length} rides`);
      
//       const ridesWithDetails = await Promise.all(
//         rides.map(async (ride) => {
//           let isVerified = false;
//           let avgRating = ride.rating || 0;
//           let profilePictureUrl = null;
          
//           const driverPhone = ride.phoneNumber;
//           const driverUserId = ride.driverUserId;
          
//           if (driverPhone || driverUserId) {
//             if (driverPhone) {
//               const docsData = await fetchUserDocuments(driverPhone);
//               if (docsData?.success && docsData.documents) {
//                 isVerified = checkVerifiedDocuments(docsData.documents);
//               }
//             }
            
//             const profileData = await fetchDriverProfile(driverPhone, driverUserId);
            
//             if (profileData?.success && profileData.user) {
//               avgRating = profileData.user.avg_rating || 0;
              
//               const possiblePictureFields = ['profile_picture', 'profilePicture', 'profilePhoto', 'profile_image', 'avatar'];
//               for (const field of possiblePictureFields) {
//                 if (profileData.user[field]) {
//                   profilePictureUrl = profileData.user[field];
//                   break;
//                 }
//               }
              
//               if (!profilePictureUrl && profileData.user.profile && profileData.user.profile.picture) {
//                 profilePictureUrl = profileData.user.profile.picture;
//               }
//             }
//           }
          
//           if (!profilePictureUrl) {
//             if (ride.profilePicture) profilePictureUrl = ride.profilePicture;
//             else if (ride.profilepicture) profilePictureUrl = ride.profilepicture;
//             else if (ride.profilePhoto) profilePictureUrl = ride.profilePhoto;
//             else if (ride.driverProfilePicture) profilePictureUrl = ride.driverProfilePicture;
//           }
          
//           let finalProfilePicture = null;
//           if (profilePictureUrl) {
//             finalProfilePicture = buildImageUrl(profilePictureUrl);
//           }
          
//           return { 
//             ...ride, 
//             isVerified, 
//             rating: avgRating,
//             profilePicture: finalProfilePicture,
//             profilepicture: finalProfilePicture,
//             profilePhoto: finalProfilePicture,
//             pickupLabel: ride.pickupLocationName || ride.fromLocationName || ride.from || 'Pickup point',
//             dropLabel: ride.dropLocationName || ride.toLocationName || ride.to || 'Drop point',
//             womenOnly: ride.womenOnly === true || ride.women_only === true,
//             // Ensure seatsAvailable is properly set
//             seatsAvailable: ride.seatsAvailable || 0,
//             requestedSeats: requestedSeats,
//           };
//         })
//       );
      
//       setAvailableRides(ridesWithDetails);
//     } catch (error) {
//       console.log('❌ search-rides error:', error);
//       setAvailableRides([]);
//       setErrorMessage(error.message || 'Failed to search rides');
//       showCustomAlert('Search Error', error.message || 'Failed to search rides', 'error');
//     } finally {
//       setLoading(false);
//     }
//   }, [searchData, from, to, fromCoords, toCoords, dateTime, requestedSeats, userGender]);

//   const loadPreferenceData = useCallback(async () => {
//     try {
//       const defs = await DatabaseService.getMatchingPreferenceMaster();
//       setPreferenceMaster(defs || []);

//       if (phoneNumber) {
//         const saved = await DatabaseService.getUserMatchingPreferences(phoneNumber);
//         setUserPreferences(saved || {});
//       }
//     } catch (e) {
//       console.log('❌ preference load error:', e);
//     }
//   }, [phoneNumber]);

//   useEffect(() => {
//     if (authLoading) return;
//     fetchAvailableRides();
//     loadPreferenceData();
//   }, [authLoading, fetchAvailableRides, loadPreferenceData]);

//   useFocusEffect(
//     useCallback(() => {
//       if (!authLoading && searchData) {
//         console.log('🔄 Screen focused - reloading rides with fresh data');
//         fetchAvailableRides();
//       }
//     }, [authLoading, searchData, fetchAvailableRides])
//   );

//   const quickFilterOptions = useMemo(() => {
//     const defs = preferenceMaster.filter(pref => QUICK_FILTER_KEYS.includes(pref.key));
//     return defs.slice(0, 3).map(pref => ({
//       key: pref.key,
//       label: QUICK_FILTER_LABELS[pref.key] || pref.label,
//     }));
//   }, [preferenceMaster]);

//   const advancedFilterOptions = useMemo(() => {
//     return preferenceMaster.filter(pref => {
//       if (!pref?.key) return false;
//       if (quickFilterOptions.some(q => q.key === pref.key)) return false;
//       return ['toggle', 'single_select'].includes(pref.input_type);
//     });
//   }, [preferenceMaster, quickFilterOptions]);

//   const processedRides = useMemo(() => {
//     let rides = [...availableRides];

//     // Filter women-only rides for male passengers
//     if (userGender !== 'female') {
//       rides = rides.filter(item => {
//         const isWomenOnly = item.womenOnly === true;
//         if (isWomenOnly) {
//           console.log('🚫 Filtering out women-only ride:', item.id);
//         }
//         return !isWomenOnly;
//       });
//     }

//     if (quickFilters.length > 0) {
//       rides = rides.filter(item =>
//         quickFilters.every(key => matchesQuickFilter(item, key))
//       );
//     }

//     const activeAdvanced = Object.entries(advancedFilters).filter(
//       ([, value]) =>
//         value !== '' &&
//         value !== null &&
//         value !== undefined &&
//         value !== false
//     );

//     if (activeAdvanced.length > 0) {
//       rides = rides.filter(item =>
//         activeAdvanced.every(([key, value]) =>
//           matchesAdvancedFilter(item, key, value)
//         )
//       );
//     }

//     rides.sort((a, b) => {
//       if (sortBy === 'price') return (a.price || 0) - (b.price || 0);
//       if (sortBy === 'rating') return (b.rating || 0) - (a.rating || 0);
//       if (sortBy === 'match') return (b.matchPercentage || 0) - (a.matchPercentage || 0);

//       const aDate = new Date(`${a.date || ''} ${a.time || ''}`);
//       const bDate = new Date(`${b.date || ''} ${b.time || ''}`);
//       if (!isNaN(aDate) && !isNaN(bDate)) return aDate - bDate;
//       return 0;
//     });

//     return rides;
//   }, [availableRides, quickFilters, advancedFilters, sortBy, userGender]);

//   const handleCardPress = (ride) => {
//     navigation.navigate('RideDetailScreen', { 
//       ride,
//       searchData: searchData || null,
//     });
//   };

//   const handleProfileImagePress = (imageUrl, driverName) => {
//     setSelectedProfile({
//       visible: true,
//       imageUrl: imageUrl,
//       driverName: driverName,
//     });
//   };

//   const toggleQuickFilter = (key) => {
//     setQuickFilters(prev =>
//       prev.includes(key) ? prev.filter(i => i !== key) : [...prev, key]
//     );
//   };

//   const clearAllFilters = () => {
//     setQuickFilters([]);
//     setAdvancedFilters({});
//     showCustomAlert('Filters Cleared', 'All filters have been reset.', 'info');
//   };

//   const renderAdvancedFilterControl = (pref) => {
//     const currentValue = advancedFilters[pref.key];

//     if (pref.input_type === 'toggle') {
//       const active = !!currentValue;
//       return (
//         <TouchableOpacity
//           activeOpacity={0.85}
//           style={[styles.modalToggleChip, active && styles.modalToggleChipActive]}
//           onPress={() =>
//             setAdvancedFilters(prev => ({ ...prev, [pref.key]: !active }))
//           }
//         >
//           <Text
//             style={[
//               styles.modalToggleChipText,
//               active && styles.modalToggleChipTextActive,
//             ]}
//           >
//             {pref.label}
//           </Text>
//         </TouchableOpacity>
//       );
//     }

//     if (pref.input_type === 'single_select' && Array.isArray(pref.options)) {
//       return (
//         <View style={styles.modalOptionWrap}>
//           {pref.options.map((opt) => {
//             const active = currentValue === opt;
//             return (
//               <TouchableOpacity
//                 key={opt}
//                 activeOpacity={0.85}
//                 style={[
//                   styles.modalOptionChip,
//                   active && styles.modalOptionChipActive,
//                 ]}
//                 onPress={() =>
//                   setAdvancedFilters(prev => ({
//                     ...prev,
//                     [pref.key]: active ? '' : opt,
//                   }))
//                 }
//               >
//                 <Text
//                   style={[
//                     styles.modalOptionChipText,
//                     active && styles.modalOptionChipTextActive,
//                   ]}
//                 >
//                   {opt}
//                 </Text>
//               </TouchableOpacity>
//             );
//           })}
//         </View>
//       );
//     }

//     return null;
//   };

//   const renderRideCard = ({ item }) => {
//     let profilePhotoUrl = null;
//     let isSvg = false;
    
//     if (item.profilePicture) {
//       profilePhotoUrl = buildImageUrl(item.profilePicture);
//     } else if (item.profilepicture) {
//       profilePhotoUrl = buildImageUrl(item.profilepicture);
//     } else if (item.profilePhoto) {
//       profilePhotoUrl = buildImageUrl(item.profilePhoto);
//     } else if (item.driverProfilePicture) {
//       profilePhotoUrl = buildImageUrl(item.driverProfilePicture);
//     } else if (item.driver?.profile_picture) {
//       profilePhotoUrl = buildImageUrl(item.driver.profile_picture);
//     } else if (item.user?.profile_picture) {
//       profilePhotoUrl = buildImageUrl(item.user.profile_picture);
//     }
    
//     if (profilePhotoUrl && profilePhotoUrl.toLowerCase().includes('.svg')) {
//       isSvg = true;
//     }
    
//     const driverNameText = item.driverName || item.driver_name || item.driver?.full_name || 'Driver';
//     const avatarText = getDriverInitials(driverNameText);

//     let vehicleLabel = 'Vehicle details unavailable';
//     if (item.vehicle) {
//       const vehicleParts = [];
//       if (item.vehicle.model) vehicleParts.push(item.vehicle.model);
//       if (item.vehicle.color && vehicleParts.length > 0) {
//         vehicleLabel = `${vehicleParts.join(' ')} - ${item.vehicle.color}`;
//       } else if (item.vehicle.color) {
//         vehicleLabel = item.vehicle.color;
//       } else if (vehicleParts.length > 0) {
//         vehicleLabel = vehicleParts.join(' ');
//       }
//     } else if (item.vehicleModel) {
//       vehicleLabel = item.vehicleModel;
//       if (item.vehicleColor) {
//         vehicleLabel = `${item.vehicleModel} - ${item.vehicleColor}`;
//       }
//     }

//     const preferenceBadges = extractPreferenceBadges(item);
//     const isDriverVerified = item.isVerified;
//     const driverRating = item.rating || 0;

//     const pickupName = item.pickupLabel || item.from || 'Pickup point';
//     const dropName = item.dropLabel || item.to || 'Drop point';
    
//     // Check if requested seats exceed available seats
//     const seatsAvailable = item.seatsAvailable || 0;
//     const isSeatsInsufficient = requestedSeats > seatsAvailable;

//     return (
//       <TouchableOpacity
//         style={[styles.rideCard, isSeatsInsufficient && styles.rideCardDisabled]}
//         onPress={() => !isSeatsInsufficient && handleCardPress(item)}
//         activeOpacity={isSeatsInsufficient ? 1 : 0.9}
//         disabled={isSeatsInsufficient}
//       >
//         <View style={styles.cardTopRow}>
//           <View style={styles.profileRow}>
//             <TouchableOpacity
//               onPress={() => handleProfileImagePress(profilePhotoUrl, driverNameText)}
//               activeOpacity={0.8}
//             >
//               <View style={styles.avatarContainer}>
//                 {profilePhotoUrl ? (
//                   isSvg ? (
//                     <View style={styles.svgContainer}>
//                       <SvgCssUri
//                         uri={profilePhotoUrl}
//                         width="48"
//                         height="48"
//                         onError={(e) => console.log('SVG load error:', e)}
//                       />
//                     </View>
//                   ) : (
//                     <Image
//                       source={{ uri: profilePhotoUrl }}
//                       style={styles.avatarImage}
//                       resizeMode="cover"
//                       onError={(e) => console.log('Image load error:', e.nativeEvent.error, 'URL:', profilePhotoUrl)}
//                     />
//                   )
//                 ) : (
//                   <View style={styles.initialsContainer}>
//                     <Text style={styles.avatarFallback}>{avatarText}</Text>
//                   </View>
//                 )}
//               </View>
//             </TouchableOpacity>

//             <View style={styles.profileContent}>
//               <View style={styles.nameRow}>
//                 <Text style={styles.driverName} numberOfLines={1}>
//                   {driverNameText}
//                 </Text>

//                 {isDriverVerified && (
//                   <View style={styles.verifiedBadge}>
//                     <Ionicons name="checkmark-circle" size={14} color="#16A34A" />
//                     <Text style={styles.verifiedText}>Verified</Text>
//                   </View>
//                 )}

//                 {item.womenOnly === true && (
//                   <View style={styles.womenOnlyBadge}>
//                     <Ionicons name="woman" size={12} color="#E91E63" />
//                     <Text style={styles.womenOnlyBadgeText}>Women Only</Text>
//                   </View>
//                 )}
//               </View>

//               <View style={styles.ratingRow}>
//                 <RatingStars rating={driverRating} size={12} showLabel={true} />
//               </View>
//             </View>
//           </View>

//           <View style={styles.priceMatchWrap}>
//             <View style={styles.matchBadge}>
//               <Text style={styles.matchText}>{item.matchPercentage || 0}%</Text>
//             </View>
//             <Text style={styles.priceText}>₹{item.price}</Text>
//             <Text style={styles.perSeatText}>per seat</Text>
//           </View>
//         </View>

//         <View style={styles.infoRow}>
//           <View style={styles.infoItem}>
//             <Ionicons name="calendar-outline" size={13} color={Colors.gray} />
//             <Text style={styles.infoText} numberOfLines={1}>{item.date}</Text>
//           </View>
//           <View style={styles.infoDot} />
//           <View style={styles.infoItem}>
//             <Ionicons name="time-outline" size={13} color={Colors.gray} />
//             <Text style={styles.infoText} numberOfLines={1}>{item.time}</Text>
//           </View>
//           <View style={styles.infoDot} />
//           <View style={styles.infoItem}>
//             <Ionicons name="people-outline" size={13} color={Colors.gray} />
//             <Text style={[
//               styles.infoText, 
//               seatsAvailable < requestedSeats && styles.warningText
//             ]} numberOfLines={1}>
//               {seatsAvailable} left
//             </Text>
//           </View>
//         </View>

//         {isSeatsInsufficient && (
//           <View style={styles.seatWarningContainer}>
//             <Text style={styles.seatWarningText}>
//               ⚠️ Only {seatsAvailable} seat{seatsAvailable !== 1 ? 's' : ''} left. You requested {requestedSeats} seat{requestedSeats !== 1 ? 's' : ''}.
//             </Text>
//           </View>
//         )}

//         <View style={styles.divider} />

//         <View style={styles.routeBlock}>
//           <View style={styles.routeRow}>
//             <View style={[styles.routeDot, { backgroundColor: '#22C55E' }]} />
//             <View style={styles.routeTextWrap}>
//               <Text style={styles.routeLabel}>Pickup</Text>
//               <Text style={styles.routeText} numberOfLines={2}>{pickupName}</Text>
//             </View>
//           </View>
//           <View style={styles.routeRow}>
//             <View style={[styles.routeDot, { backgroundColor: '#F97316' }]} />
//             <View style={styles.routeTextWrap}>
//               <Text style={styles.routeLabel}>Drop</Text>
//               <Text style={styles.routeText} numberOfLines={2}>{dropName}</Text>
//             </View>
//           </View>
//         </View>

//         <View style={styles.vehicleRow}>
//           <Ionicons name="car-sport-outline" size={14} color={Colors.gray} />
//           <Text style={styles.vehicleText} numberOfLines={1}>{vehicleLabel}</Text>
//         </View>

//         {preferenceBadges.length > 0 && (
//           <ScrollView
//             horizontal
//             showsHorizontalScrollIndicator={false}
//             contentContainerStyle={styles.badgeScroll}
//           >
//             {preferenceBadges.map((badge, index) => (
//               <PreferenceTag key={`${badge}-${index}`} label={badge} />
//             ))}
//           </ScrollView>
//         )}
//       </TouchableOpacity>
//     );
//   };

//   if (authLoading || loading) {
//     return (
//       <View style={styles.loadingContainer}>
//         <LottieView
//           source={require("../assets/loading.json")}
//           autoPlay
//           loop
//           style={{ width: 300, height: 300 }}
//         />
//       </View>
//     );
//   }

//   return (
//     <SafeAreaView style={styles.container}>
//       <StatusBar barStyle="dark-content" backgroundColor={Colors.white} />

//       <View style={styles.header}>
//         <TouchableOpacity
//           style={styles.backButton}
//           onPress={() => navigation.goBack()}
//         >
//           <MaterialIcons name="arrow-back-ios" size={24} color="#ED7117" />
//         </TouchableOpacity>

//         <Text style={styles.headerTitle}>Available Rides</Text>

//         <TouchableOpacity
//           style={[
//             styles.filterButton,
//             headerFiltersVisible && styles.filterButtonActive
//           ]}
//           onPress={() => setHeaderFiltersVisible(prev => !prev)}
//         >
//           <Ionicons name="options-outline" size={22} color="#ED7117" />
//         </TouchableOpacity>
//       </View>

//       {headerFiltersVisible ? (
//         <View style={styles.topControlsWrap}>
//           <ScrollView
//             horizontal
//             showsHorizontalScrollIndicator={false}
//             contentContainerStyle={styles.filterScroll}
//           >
//             {quickFilterOptions.map((filter) => {
//               const active = quickFilters.includes(filter.key);
//               return (
//                 <TouchableOpacity
//                   key={filter.key}
//                   activeOpacity={0.85}
//                   style={[styles.quickChip, active && styles.quickChipActive]}
//                   onPress={() => toggleQuickFilter(filter.key)}
//                 >
//                   <Text
//                     style={[
//                       styles.quickChipText,
//                       active && styles.quickChipTextActive,
//                     ]}
//                   >
//                     {filter.label}
//                   </Text>
//                 </TouchableOpacity>
//               );
//             })}

//             <TouchableOpacity
//               activeOpacity={0.85}
//               style={styles.moreFilterChip}
//               onPress={() => setFilterModalVisible(true)}
//             >
//               <Ionicons name="options-outline" size={14} color="#ED7117" />
//               <Text style={styles.moreFilterChipText}>More Filters</Text>
//             </TouchableOpacity>
//           </ScrollView>

//           <Text style={styles.sortLabel}>Sort by</Text>

//           <ScrollView
//             horizontal
//             showsHorizontalScrollIndicator={false}
//             contentContainerStyle={styles.sortScroll}
//           >
//             {SORT_OPTIONS.map((option) => {
//               const active = sortBy === option.key;
//               return (
//                 <TouchableOpacity
//                   key={option.key}
//                   activeOpacity={0.85}
//                   style={[styles.sortChip, active && styles.sortChipActive]}
//                   onPress={() => setSortBy(option.key)}
//                 >
//                   <Text
//                     style={[
//                       styles.sortChipText,
//                       active && styles.sortChipTextActive,
//                     ]}
//                   >
//                     {option.label}
//                   </Text>
//                 </TouchableOpacity>
//               );
//             })}
//           </ScrollView>
//         </View>
//       ) : null}

//       {processedRides.length === 0 ? (
//         <View style={styles.emptyContainer}>
//           <Ionicons name="car-outline" size={80} color={Colors.gray} />
//           <Text style={styles.emptyTitle}>No Rides Found</Text>
//           <Text style={styles.emptySubtitle}>
//             {errorMessage
//               ? errorMessage
//               : 'Try changing your filters or search again.'}
//           </Text>

//           <TouchableOpacity style={styles.clearButton} onPress={clearAllFilters}>
//             <Text style={styles.clearButtonText}>Clear Filters</Text>
//           </TouchableOpacity>
//         </View>
//       ) : (
//         <FlatList
//           data={processedRides}
//           renderItem={renderRideCard}
//           keyExtractor={(item) => String(item.id)}
//           contentContainerStyle={styles.listContent}
//           showsVerticalScrollIndicator={false}
//           ItemSeparatorComponent={() => <View style={{ height: 12 }} />}
//         />
//       )}

//       <Modal
//         visible={filterModalVisible}
//         transparent
//         animationType="slide"
//         onRequestClose={() => setFilterModalVisible(false)}
//       >
//         <View style={styles.modalBackdrop}>
//           <TouchableOpacity
//             style={styles.modalOverlay}
//             activeOpacity={1}
//             onPress={() => setFilterModalVisible(false)}
//           />

//           <View style={styles.modalSheet}>
//             <View style={styles.modalHandle} />

//             <View style={styles.modalHeader}>
//               <Text style={styles.modalTitle}>More Filters</Text>
//               <TouchableOpacity onPress={() => setFilterModalVisible(false)}>
//                 <Ionicons name="close" size={24} color={Colors.dark} />
//               </TouchableOpacity>
//             </View>

//             <ScrollView
//               showsVerticalScrollIndicator={false}
//               contentContainerStyle={styles.modalContent}
//             >
//               {advancedFilterOptions.map((pref) => (
//                 <View key={pref.key} style={styles.modalSection}>
//                   <Text style={styles.modalSectionTitle}>{pref.label}</Text>
//                   {renderAdvancedFilterControl(pref)}
//                 </View>
//               ))}
//             </ScrollView>

//             <View style={styles.modalFooter}>
//               <TouchableOpacity
//                 style={styles.modalSecondaryBtn}
//                 onPress={clearAllFilters}
//               >
//                 <Text style={styles.modalSecondaryBtnText}>Clear</Text>
//               </TouchableOpacity>

//               <TouchableOpacity
//                 style={styles.modalPrimaryBtn}
//                 onPress={() => setFilterModalVisible(false)}
//               >
//                 <Text style={styles.modalPrimaryBtnText}>Apply Filters</Text>
//               </TouchableOpacity>
//             </View>
//           </View>
//         </View>
//       </Modal>

//       <ProfileImageModal
//         visible={selectedProfile.visible}
//         imageUrl={selectedProfile.imageUrl}
//         driverName={selectedProfile.driverName}
//         onClose={() => setSelectedProfile({ visible: false, imageUrl: null, driverName: '' })}
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

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     backgroundColor: '#fff',
//   },
//   header: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     paddingHorizontal: 16,
//     paddingVertical: 12,
//     borderBottomWidth: 0.5,
//     borderBottomColor: '#fff',
//     backgroundColor: Colors.white,
//   },
//   backButton: {
//     width: 44,
//     height: 44,
//     justifyContent: 'center',
//   },
//   filterButton: {
//     width: 44,
//     height: 44,
//     justifyContent: 'center',
//     alignItems: 'center',
//     borderRadius: 22,
//   },
//   filterButtonActive: {
//     backgroundColor: '#fff',
//   },
//   headerTitle: {
//     ...Typography.h2,
//     fontSize: 28,
//     fontWeight: '700',
//     color: Colors.primary,
//     flex: 1,
//     textAlign: 'center',
//   },
//   topControlsWrap: {
//     backgroundColor: Colors.white,
//     paddingTop: 10,
//     paddingBottom: 12,
//     borderBottomWidth: 1,
//     borderBottomColor: '#EEF2F7',
//   },
//   filterScroll: {
//     paddingHorizontal: 16,
//     gap: 10,
//   },
//   quickChip: {
//     paddingHorizontal: 14,
//     paddingVertical: 10,
//     borderRadius: 20,
//     backgroundColor: '#F3F4F6',
//   },
//   quickChipActive: {
//     backgroundColor: Colors.primary,
//   },
//   quickChipText: {
//     fontSize: 12,
//     fontWeight: '600',
//     color: Colors.dark,
//   },
//   quickChipTextActive: {
//     color: Colors.white,
//   },
//   moreFilterChip: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     gap: 6,
//     paddingHorizontal: 14,
//     paddingVertical: 10,
//     borderRadius: 20,
//     backgroundColor: '#EEF6FF',
//   },
//   moreFilterChipText: {
//     fontSize: 12,
//     fontWeight: '700',
//     color: '#ED7117',
//   },
//   sortLabel: {
//     paddingHorizontal: 16,
//     marginTop: 12,
//     marginBottom: 8,
//     fontSize: 12,
//     color: Colors.gray,
//     fontWeight: '700',
//   },
//   sortScroll: {
//     paddingHorizontal: 16,
//     gap: 10,
//   },
//   sortChip: {
//     paddingHorizontal: 14,
//     paddingVertical: 8,
//     borderRadius: 14,
//     backgroundColor: '#F3F4F6',
//   },
//   sortChipActive: {
//     backgroundColor: '#ED7117',
//   },
//   sortChipText: {
//     fontSize: 12,
//     color: Colors.dark,
//     fontWeight: '600',
//   },
//   sortChipTextActive: {
//     color: Colors.white,
//   },
//   listContent: {
//     padding: 16,
//     paddingBottom: 28,
//   },
//   rideCard: {
//     backgroundColor: Colors.white,
//     borderRadius: 18,
//     padding: 14,
//     borderWidth: 1,
//     borderColor: '#EEF2F7',
//     shadowColor: '#0F172A',
//     shadowOffset: { width: 0, height: 6 },
//     shadowOpacity: 0.05,
//     shadowRadius: 14,
//     elevation: 2,
//   },
//   rideCardDisabled: {
//     opacity: 0.7,
//     backgroundColor: '#F9FAFB',
//   },
//   cardTopRow: {
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//     alignItems: 'flex-start',
//   },
//   profileRow: {
//     flexDirection: 'row',
//     flex: 1,
//     paddingRight: 10,
//   },
//   avatarContainer: {
//     width: 48,
//     height: 48,
//     borderRadius: 24,
//     backgroundColor: '#E5E7EB',
//     alignItems: 'center',
//     justifyContent: 'center',
//     overflow: 'hidden',
//     marginRight: 10,
//   },
//   avatarImage: {
//     width: 48,
//     height: 48,
//   },
//   avatarFallback: {
//     fontSize: 14,
//     fontWeight: '800',
//     color: Colors.gray,
//   },
//   profileContent: {
//     flex: 1,
//   },
//   nameRow: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     flexWrap: 'wrap',
//     gap: 6,
//   },
//   driverName: {
//     fontSize: 15,
//     fontWeight: '800',
//     color: Colors.dark,
//     maxWidth: '100%',
//   },
//   verifiedBadge: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     gap: 4,
//     backgroundColor: '#E8F5E9',
//     paddingHorizontal: 6,
//     paddingVertical: 2,
//     borderRadius: 12,
//   },
//   verifiedText: {
//     fontSize: 10,
//     fontWeight: '700',
//     color: '#16A34A',
//   },
//   womenOnlyBadge: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     gap: 4,
//     backgroundColor: '#FCE4EC',
//     paddingHorizontal: 8,
//     paddingVertical: 3,
//     borderRadius: 12,
//   },
//   womenOnlyBadgeText: {
//     fontSize: 10,
//     color: '#E91E63',
//     fontWeight: '700',
//   },
//   ratingRow: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     marginTop: 4,
//   },
//   ratingText: {
//     fontSize: 11,
//     color: Colors.gray,
//     fontWeight: '600',
//   },
//   priceMatchWrap: {
//     alignItems: 'flex-end',
//   },
//   matchBadge: {
//     backgroundColor: '#EEF6FF',
//     paddingHorizontal: 8,
//     paddingVertical: 4,
//     borderRadius: 10,
//     marginBottom: 6,
//   },
//   matchText: {
//     fontSize: 12,
//     fontWeight: '800',
//     color: Colors.primary,
//   },
//   priceText: {
//     fontSize: 18,
//     fontWeight: '800',
//     color: '#ED7117',
//     lineHeight: 20,
//   },
//   perSeatText: {
//     fontSize: 10,
//     color: Colors.gray,
//     fontWeight: '600',
//     marginTop: 2,
//   },
//   infoRow: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     flexWrap: 'wrap',
//     marginTop: 12,
//     marginBottom: 10,
//   },
//   infoItem: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     gap: 4,
//   },
//   infoText: {
//     fontSize: 12,
//     color: Colors.dark,
//     fontWeight: '600',
//   },
//   warningText: {
//     color: '#EF4444',
//   },
//   infoDot: {
//     width: 4,
//     height: 4,
//     borderRadius: 2,
//     backgroundColor: '#CBD5E1',
//     marginHorizontal: 8,
//   },
//   seatWarningContainer: {
//     backgroundColor: '#FEF2F2',
//     borderRadius: 8,
//     padding: 8,
//     marginTop: 8,
//     marginBottom: 4,
//   },
//   seatWarningText: {
//     fontSize: 11,
//     color: '#EF4444',
//     fontWeight: '600',
//     textAlign: 'center',
//   },
//   divider: {
//     height: 1,
//     backgroundColor: '#EEF2F7',
//     marginBottom: 10,
//   },
//   routeBlock: {
//     gap: 8,
//   },
//   routeRow: {
//     flexDirection: 'row',
//     alignItems: 'flex-start',
//   },
//   routeDot: {
//     width: 8,
//     height: 8,
//     borderRadius: 4,
//     marginTop: 5,
//     marginRight: 8,
//   },
//   routeTextWrap: {
//     flex: 1,
//   },
//   routeLabel: {
//     fontSize: 11,
//     color: Colors.gray,
//     fontWeight: '700',
//     marginBottom: 2,
//   },
//   routeText: {
//     fontSize: 13,
//     color: Colors.dark,
//     fontWeight: '600',
//     lineHeight: 18,
//   },
//   vehicleRow: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     gap: 6,
//     marginTop: 10,
//   },
//   vehicleText: {
//     fontSize: 12,
//     color: Colors.gray,
//     fontWeight: '600',
//     flex: 1,
//   },
//   badgeScroll: {
//     gap: 8,
//     paddingTop: 10,
//   },
//   prefBadge: {
//     paddingHorizontal: 10,
//     paddingVertical: 6,
//     borderRadius: 12,
//     marginRight: 8,
//   },
//   prefBadgeText: {
//     fontSize: 11,
//     fontWeight: '700',
//   },
//   loadingContainer: {
//     flex: 1,
//     justifyContent: 'center',
//     alignItems: 'center',
//     backgroundColor: Colors.white,
//   },
//   emptyContainer: {
//     flex: 1,
//     justifyContent: 'center',
//     alignItems: 'center',
//     paddingHorizontal: 40,
//   },
//   emptyTitle: {
//     fontSize: 22,
//     fontWeight: '700',
//     color: Colors.dark,
//     marginTop: 20,
//     marginBottom: 8,
//   },
//   emptySubtitle: {
//     fontSize: 15,
//     color: Colors.gray,
//     textAlign: 'center',
//     lineHeight: 22,
//     marginBottom: 24,
//   },
//   clearButton: {
//     backgroundColor: Colors.primary,
//     paddingHorizontal: 24,
//     paddingVertical: 12,
//     borderRadius: 12,
//   },
//   clearButtonText: {
//     color: Colors.white,
//     fontSize: 15,
//     fontWeight: '700',
//   },
//   modalBackdrop: {
//     flex: 1,
//     backgroundColor: 'rgba(15,23,42,0.28)',
//     justifyContent: 'flex-end',
//   },
//   modalOverlay: {
//     flex: 1,
//   },
//   modalSheet: {
//     backgroundColor: Colors.white,
//     borderTopLeftRadius: 24,
//     borderTopRightRadius: 24,
//     maxHeight: '78%',
//     paddingTop: 10,
//   },
//   modalHandle: {
//     width: 52,
//     height: 5,
//     borderRadius: 999,
//     backgroundColor: '#D1D5DB',
//     alignSelf: 'center',
//     marginBottom: 14,
//   },
//   modalHeader: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     justifyContent: 'space-between',
//     paddingHorizontal: 18,
//     paddingBottom: 10,
//   },
//   modalTitle: {
//     fontSize: 20,
//     fontWeight: '800',
//     color: Colors.dark,
//   },
//   modalContent: {
//     paddingHorizontal: 18,
//     paddingBottom: 20,
//   },
//   modalSection: {
//     marginBottom: 18,
//   },
//   modalSectionTitle: {
//     fontSize: 14,
//     fontWeight: '700',
//     color: Colors.dark,
//     marginBottom: 10,
//   },
//   modalToggleChip: {
//     borderRadius: 14,
//     borderWidth: 1,
//     borderColor: '#E5E7EB',
//     paddingHorizontal: 14,
//     paddingVertical: 10,
//     alignSelf: 'flex-start',
//     backgroundColor: '#F9FAFB',
//   },
//   modalToggleChipActive: {
//     backgroundColor: Colors.primary,
//     borderColor: Colors.primary,
//   },
//   modalToggleChipText: {
//     fontSize: 13,
//     color: Colors.dark,
//     fontWeight: '600',
//   },
//   modalToggleChipTextActive: {
//     color: Colors.white,
//   },
//   modalOptionWrap: {
//     flexDirection: 'row',
//     flexWrap: 'wrap',
//     gap: 10,
//   },
//   modalOptionChip: {
//     borderRadius: 16,
//     borderWidth: 1,
//     borderColor: '#E5E7EB',
//     paddingHorizontal: 12,
//     paddingVertical: 9,
//     backgroundColor: '#F9FAFB',
//   },
//   modalOptionChipActive: {
//     backgroundColor: Colors.primary,
//     borderColor: Colors.primary,
//   },
//   modalOptionChipText: {
//     fontSize: 13,
//     color: Colors.dark,
//     fontWeight: '600',
//   },
//   modalOptionChipTextActive: {
//     color: Colors.white,
//   },
//   modalFooter: {
//     flexDirection: 'row',
//     paddingHorizontal: 18,
//     paddingTop: 12,
//     paddingBottom: Platform.OS === 'ios' ? 28 : 18,
//     borderTopWidth: 1,
//     borderTopColor: '#EEF2F7',
//     gap: 12,
//   },
//   modalSecondaryBtn: {
//     flex: 1,
//     borderRadius: 14,
//     paddingVertical: 14,
//     alignItems: 'center',
//     backgroundColor: '#F3F4F6',
//   },
//   modalSecondaryBtnText: {
//     fontSize: 15,
//     fontWeight: '700',
//     color: Colors.dark,
//   },
//   modalPrimaryBtn: {
//     flex: 1,
//     borderRadius: 14,
//     paddingVertical: 14,
//     alignItems: 'center',
//     backgroundColor: Colors.primary,
//   },
//   modalPrimaryBtnText: {
//     fontSize: 15,
//     fontWeight: '700',
//     color: Colors.white,
//   },
//   imageModalContainer: {
//     flex: 1,
//     justifyContent: 'center',
//     alignItems: 'center',
//     backgroundColor: 'rgba(0,0,0,0.9)',
//   },
//   imageModalContent: {
//     width: '90%',
//     backgroundColor: Colors.white,
//     borderRadius: 20,
//     overflow: 'hidden',
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
//   svgContainer: {
//     width: 48,
//     height: 48,
//     alignItems: 'center',
//     justifyContent: 'center',
//   },
//   initialsContainer: {
//     width: '100%',
//     height: '100%',
//     alignItems: 'center',
//     justifyContent: 'center',
//     backgroundColor: '#E5E7EB',
//   },
//   modalSvgContainer: {
//     width: '100%',
//     height: 400,
//     backgroundColor: '#F5F5F5',
//     alignItems: 'center',
//     justifyContent: 'center',
//   },
// });
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  StatusBar,
  Platform,
  Image,
  ScrollView,
  Modal,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import LottieView from "lottie-react-native";
import { Colors, Typography } from '../constants/Colors';
import { useAuth } from '../context/AuthContext';
import { API_BASE_URL } from '../config/config_ip';
import DatabaseService from '../services/matchingpreference_ds';
import CustomAlert from '../components/CustomAlert';
import { SvgCssUri } from 'react-native-svg/css';
import { useFocusEffect } from '@react-navigation/native';

const IMAGE_BASE_URL = API_BASE_URL;

const QUICK_FILTER_KEYS = [
  'verified_profiles_only',
  'same_gender_after_9pm',
  'smoking_policy',
  'pets_allowed',
  'chat_level',
  'luggage_allowance',
];

const QUICK_FILTER_LABELS = {
  verified_profiles_only: 'Verified Only',
  same_gender_after_9pm: 'Same Gender Night',
  smoking_policy: 'No Smoking',
  pets_allowed: 'Pets',
  chat_level: 'Chat Level',
  luggage_allowance: 'Luggage',
};

const SORT_OPTIONS = [
  { key: 'time', label: 'Time' },
  { key: 'price', label: 'Price' },
  { key: 'rating', label: 'Rating' },
  { key: 'match', label: 'Match %' },
];

function buildImageUrl(url) {
  if (!url) return null;
  if (url.startsWith('http://') || url.startsWith('https://')) return url;
  return `${IMAGE_BASE_URL}${url.startsWith('/') ? '' : '/'}${url}`;
}

function getDriverInitials(name) {
  if (!name) return 'D';
  const parts = name.trim().split(' ').filter(Boolean);
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
}

function normalizeText(value) {
  if (value === undefined || value === null) return '';
  return String(value).trim().toLowerCase();
}

function getRidePreferences(item) {
  if (item.preferences) return item.preferences;
  if (item.ridePreferences) return item.ridePreferences;
  if (item.matchingPreferences) return item.matchingPreferences;
  if (item.travel_preferences) return item.travel_preferences;
  return {};
}

function extractPreferenceBadges(item) {
  const prefs = getRidePreferences(item);
  const badges = [];

  if (!prefs || Object.keys(prefs).length === 0) {
    return [];
  }

  Object.entries(prefs).forEach(([key, value]) => {
    if (value === null || value === undefined) return;
    
    if (typeof value === 'boolean') {
      if (value === true) {
        if (key === 'verified_profiles_only') {
          badges.push('Verified Only');
        } else {
          const displayKey = key.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
          badges.push(displayKey);
        }
      }
    } 
    else if (Array.isArray(value)) {
      if (value.length > 0) {
        value.forEach(v => {
          if (v && v.trim()) {
            badges.push(v.trim());
          }
        });
      }
    }
    else if (typeof value === 'string' && value.trim()) {
      const lowerValue = value.toLowerCase();
      if (!['false', 'no', 'none', 'null', 'undefined', 'no preference'].includes(lowerValue)) {
        badges.push(value);
      }
    }
    else if (typeof value === 'number') {
      badges.push(String(value));
    }
  });

  return [...new Set(badges)];
}

async function fetchUserDocuments(phoneNumber) {
  try {
    const url = `${API_BASE_URL}/api/v1/documents/user/${phoneNumber}`;
    const res = await fetch(url, { headers: { Accept: 'application/json' } });
    if (!res.ok) return null;
    const data = await res.json();
    return data;
  } catch (e) {
    console.log('fetchUserDocuments error:', e);
    return null;
  }
}

async function fetchDriverProfile(phoneNumber, userId) {
  try {
    const params = new URLSearchParams();
    if (userId) params.append('user_id', userId);
    else if (phoneNumber) params.append('phone_number', phoneNumber);
    else return null;
    const url = `${API_BASE_URL}/api/v1/users/profile-public?${params.toString()}`;
    const res = await fetch(url, { headers: { Accept: 'application/json' } });
    if (!res.ok) return null;
    const data = await res.json();
    return data;
  } catch (e) {
    console.log('fetchDriverProfile error:', e);
    return null;
  }
}

function checkVerifiedDocuments(docs) {
  if (!docs || !docs.length) return false;
  
  const verified = docs.filter(doc => {
    const docType = doc.document_type?.toLowerCase();
    const status = doc.status?.toUpperCase();
    return status === 'APPROVED' && ['aadhar', 'dl', 'rc'].includes(docType);
  });
  
  return verified.length > 0;
}

function RatingStars({ rating, size = 12, showLabel = true }) {
  const fullStars = Math.floor(rating);
  const hasHalfStar = rating % 1 >= 0.5;
  const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);
  
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
      {[...Array(fullStars)].map((_, i) => (
        <Ionicons key={`full-${i}`} name="star" size={size} color="#F59E0B" />
      ))}
      {hasHalfStar && (
        <Ionicons name="star-half" size={size} color="#F59E0B" />
      )}
      {[...Array(emptyStars)].map((_, i) => (
        <Ionicons key={`empty-${i}`} name="star-outline" size={size} color="#F59E0B" />
      ))}
      {showLabel && rating > 0 && (
        <Text style={[styles.ratingText, { marginLeft: 4 }]}>({rating.toFixed(1)})</Text>
      )}
      {showLabel && rating === 0 && (
        <Text style={[styles.ratingText, { marginLeft: 4 }]}>New</Text>
      )}
    </View>
  );
}

function matchesQuickFilter(item, key) {
  const prefs = getRidePreferences(item);
  const value = prefs?.[key];
  const normalized = normalizeText(value);

  if (key === 'verified_profiles_only') {
    return !!item.isVerified;
  }

  if (typeof value === 'boolean') return value;
  if (Array.isArray(value)) return value.length > 0;

  if (key === 'smoking_policy') {
    return normalized.includes('no');
  }

  if (key === 'same_gender_after_9pm') {
    return normalized === 'true' || normalized === 'yes' || normalized === 'same gender';
  }

  if (key === 'pets_allowed') {
    return normalized === 'true' || normalized === 'yes' || normalized === 'allowed';
  }

  return !!normalized;
}

function matchesAdvancedFilter(item, key, expectedValue) {
  if (expectedValue === undefined || expectedValue === null || expectedValue === '') {
    return true;
  }

  const prefs = getRidePreferences(item);
  const rideValue = prefs?.[key];

  if (typeof expectedValue === 'boolean') {
    if (key === 'verified_profiles_only') {
      return expectedValue ? !!item.isVerified : true;
    }
    return rideValue === expectedValue || normalizeText(rideValue) === String(expectedValue);
  }

  if (Array.isArray(rideValue)) {
    return rideValue.map(v => normalizeText(v)).includes(normalizeText(expectedValue));
  }

  return normalizeText(rideValue) === normalizeText(expectedValue);
}

function ProfileImageModal({ visible, imageUrl, driverName, onClose }) {
  const [isSvg, setIsSvg] = useState(false);
  
  useEffect(() => {
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
              <Text style={styles.imageModalTitle}>{driverName}</Text>
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
                  />
                </View>
              ) : (
                <Image
                  source={{ uri: imageUrl }}
                  style={styles.fullProfileImage}
                  resizeMode="contain"
                />
              )
            ) : (
              <View style={styles.noImageContainer}>
                <Text style={styles.noImageText}>No profile picture available</Text>
              </View>
            )}
          </View>
        </View>
      </TouchableOpacity>
    </Modal>
  );
}

function PreferenceTag({ label }) {
  if (!label || label.trim() === '') return null;
  
  let tagColor = '#FFF3E8';
  let textColor = '#C65D00';
  
  const lowerLabel = label.toLowerCase();
  
  if (lowerLabel.includes('chatty') || lowerLabel.includes('talkative')) {
    tagColor = '#E3F2FD';
    textColor = '#1565C0';
  } else if (lowerLabel.includes('quiet')) {
    tagColor = '#E8F5E9';
    textColor = '#2E7D32';
  } else if (lowerLabel.includes('english') || lowerLabel.includes('hindi') || lowerLabel.includes('language')) {
    tagColor = '#FFF9C4';
    textColor = '#F57F17';
  } else if (lowerLabel.includes('music') || lowerLabel.includes('songs')) {
    tagColor = '#F3E5F5';
    textColor = '#6A1B9A';
  } else if (lowerLabel.includes('ac')) {
    tagColor = '#E3F2FD';
    textColor = '#1565C0';
  } else if (lowerLabel.includes('pet')) {
    tagColor = '#FCE4EC';
    textColor = '#C2185B';
  } else if (lowerLabel.includes('smoking')) {
    tagColor = '#FFEBEE';
    textColor = '#C62828';
  } else if (lowerLabel.includes('verified')) {
    tagColor = '#E8F5E9';
    textColor = '#2E7D32';
  } else if (lowerLabel.match(/[0-9]/)) {
    tagColor = '#E8F5E9';
    textColor = '#2E7D32';
  }
  
  return (
    <View style={[styles.prefBadge, { backgroundColor: tagColor }]}>
      <Text style={[styles.prefBadgeText, { color: textColor }]}>{label}</Text>
    </View>
  );
}

export default function RideNextScreen({ navigation, route }) {
  const { user, loading: authLoading } = useAuth();
  const { searchData } = route.params || {};
  const { from, to, fromCoords, toCoords, dateTime, seats } = searchData || {};

  const [availableRides, setAvailableRides] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');
  const [sortBy, setSortBy] = useState('time');
  const [quickFilters, setQuickFilters] = useState([]);
  const [headerFiltersVisible, setHeaderFiltersVisible] = useState(false);
  const [filterModalVisible, setFilterModalVisible] = useState(false);
  const [preferenceMaster, setPreferenceMaster] = useState([]);
  const [userPreferences, setUserPreferences] = useState({});
  const [advancedFilters, setAdvancedFilters] = useState({});
  
  const [selectedProfile, setSelectedProfile] = useState({
    visible: false,
    imageUrl: null,
    driverName: '',
  });

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
      iconColor = Colors.primary;
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

  const phoneNumber = user?.phone_number;
  const userGender = user?.gender;
  const requestedSeats = seats || 1;

  const fetchAvailableRides = useCallback(async () => {
    if (!searchData || !fromCoords || !toCoords || !dateTime) {
      setAvailableRides([]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setErrorMessage('');

      const response = await fetch(`${API_BASE_URL}/search-rides`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          from_location: from,
          to_location: to,
          from_coords: fromCoords,
          to_coords: toCoords,
          departure_time: new Date(dateTime).toISOString(),
          seats_required: requestedSeats,
          passenger_gender: userGender,
        }),
      });

      const rawText = await response.text();
      let parsedData = null;

      try {
        parsedData = rawText ? JSON.parse(rawText) : {};
      } catch (parseError) {
        parsedData = { detail: rawText || 'Unexpected server response' };
      }

      if (!response.ok) {
        throw new Error(parsedData?.detail || 'Failed to fetch rides');
      }

      const rides = Array.isArray(parsedData?.rides) ? parsedData.rides : [];
      
      console.log(`📱 Found ${rides.length} rides`);
      
      const ridesWithDetails = await Promise.all(
        rides.map(async (ride) => {
          let isVerified = false;
          let avgRating = ride.rating || 0;
          let profilePictureUrl = null;
          
          const driverPhone = ride.phoneNumber;
          const driverUserId = ride.driverUserId;
          
          if (driverPhone || driverUserId) {
            if (driverPhone) {
              const docsData = await fetchUserDocuments(driverPhone);
              if (docsData?.success && docsData.documents) {
                isVerified = checkVerifiedDocuments(docsData.documents);
              }
            }
            
            const profileData = await fetchDriverProfile(driverPhone, driverUserId);
            
            if (profileData?.success && profileData.user) {
              avgRating = profileData.user.avg_rating || 0;
              
              const possiblePictureFields = ['profile_picture', 'profilePicture', 'profilePhoto', 'profile_image', 'avatar'];
              for (const field of possiblePictureFields) {
                if (profileData.user[field]) {
                  profilePictureUrl = profileData.user[field];
                  break;
                }
              }
              
              if (!profilePictureUrl && profileData.user.profile && profileData.user.profile.picture) {
                profilePictureUrl = profileData.user.profile.picture;
              }
            }
          }
          
          if (!profilePictureUrl) {
            if (ride.profilePicture) profilePictureUrl = ride.profilePicture;
            else if (ride.profilepicture) profilePictureUrl = ride.profilepicture;
            else if (ride.profilePhoto) profilePictureUrl = ride.profilePhoto;
            else if (ride.driverProfilePicture) profilePictureUrl = ride.driverProfilePicture;
          }
          
          let finalProfilePicture = null;
          if (profilePictureUrl) {
            finalProfilePicture = buildImageUrl(profilePictureUrl);
          }
          
          return { 
            ...ride, 
            isVerified, 
            rating: avgRating,
            profilePicture: finalProfilePicture,
            profilepicture: finalProfilePicture,
            profilePhoto: finalProfilePicture,
            pickupLabel: ride.pickupLocationName || ride.fromLocationName || ride.from || 'Pickup point',
            dropLabel: ride.dropLocationName || ride.toLocationName || ride.to || 'Drop point',
            womenOnly: ride.womenOnly === true || ride.women_only === true,
            seatsAvailable: ride.seatsAvailable || 0,
            requestedSeats: requestedSeats,
          };
        })
      );
      
      setAvailableRides(ridesWithDetails);
    } catch (error) {
      console.log('❌ search-rides error:', error);
      setAvailableRides([]);
      setErrorMessage(error.message || 'Failed to search rides');
      showCustomAlert('Search Error', error.message || 'Failed to search rides', 'error');
    } finally {
      setLoading(false);
    }
  }, [searchData, from, to, fromCoords, toCoords, dateTime, requestedSeats, userGender]);

  const loadPreferenceData = useCallback(async () => {
    try {
      const defs = await DatabaseService.getMatchingPreferenceMaster();
      setPreferenceMaster(defs || []);

      if (phoneNumber) {
        const saved = await DatabaseService.getUserMatchingPreferences(phoneNumber);
        setUserPreferences(saved || {});
      }
    } catch (e) {
      console.log('❌ preference load error:', e);
    }
  }, [phoneNumber]);

  useEffect(() => {
    if (authLoading) return;
    fetchAvailableRides();
    loadPreferenceData();
  }, [authLoading, fetchAvailableRides, loadPreferenceData]);

  useFocusEffect(
    useCallback(() => {
      if (!authLoading && searchData) {
        console.log('🔄 Screen focused - reloading rides with fresh data');
        fetchAvailableRides();
      }
    }, [authLoading, searchData, fetchAvailableRides])
  );

  const quickFilterOptions = useMemo(() => {
    const defs = preferenceMaster.filter(pref => QUICK_FILTER_KEYS.includes(pref.key));
    return defs.slice(0, 3).map(pref => ({
      key: pref.key,
      label: QUICK_FILTER_LABELS[pref.key] || pref.label,
    }));
  }, [preferenceMaster]);

  const advancedFilterOptions = useMemo(() => {
    return preferenceMaster.filter(pref => {
      if (!pref?.key) return false;
      if (quickFilterOptions.some(q => q.key === pref.key)) return false;
      return ['toggle', 'single_select'].includes(pref.input_type);
    });
  }, [preferenceMaster, quickFilterOptions]);

  const processedRides = useMemo(() => {
    let rides = [...availableRides];

    // Filter women-only rides for male passengers
    if (userGender !== 'female') {
      rides = rides.filter(item => {
        const isWomenOnly = item.womenOnly === true;
        if (isWomenOnly) {
          console.log('🚫 Filtering out women-only ride:', item.id);
        }
        return !isWomenOnly;
      });
    }

    if (quickFilters.length > 0) {
      rides = rides.filter(item =>
        quickFilters.every(key => matchesQuickFilter(item, key))
      );
    }

    const activeAdvanced = Object.entries(advancedFilters).filter(
      ([, value]) =>
        value !== '' &&
        value !== null &&
        value !== undefined &&
        value !== false
    );

    if (activeAdvanced.length > 0) {
      rides = rides.filter(item =>
        activeAdvanced.every(([key, value]) =>
          matchesAdvancedFilter(item, key, value)
        )
      );
    }

    rides.sort((a, b) => {
      if (sortBy === 'price') return (a.price || 0) - (b.price || 0);
      if (sortBy === 'rating') return (b.rating || 0) - (a.rating || 0);
      if (sortBy === 'match') return (b.matchPercentage || 0) - (a.matchPercentage || 0);

      const aDate = new Date(`${a.date || ''} ${a.time || ''}`);
      const bDate = new Date(`${b.date || ''} ${b.time || ''}`);
      if (!isNaN(aDate) && !isNaN(bDate)) return aDate - bDate;
      return 0;
    });

    return rides;
  }, [availableRides, quickFilters, advancedFilters, sortBy, userGender]);

  const handleCardPress = (ride) => {
    navigation.navigate('RideDetailScreen', { 
      ride,
      searchData: searchData || null,
    });
  };

  const handleProfileImagePress = (imageUrl, driverName) => {
    setSelectedProfile({
      visible: true,
      imageUrl: imageUrl,
      driverName: driverName,
    });
  };

  const toggleQuickFilter = (key) => {
    setQuickFilters(prev =>
      prev.includes(key) ? prev.filter(i => i !== key) : [...prev, key]
    );
  };

  const clearAllFilters = () => {
    setQuickFilters([]);
    setAdvancedFilters({});
    showCustomAlert('Filters Cleared', 'All filters have been reset.', 'info');
  };

  const renderAdvancedFilterControl = (pref) => {
    const currentValue = advancedFilters[pref.key];

    if (pref.input_type === 'toggle') {
      const active = !!currentValue;
      return (
        <TouchableOpacity
          activeOpacity={0.85}
          style={[styles.modalToggleChip, active && styles.modalToggleChipActive]}
          onPress={() =>
            setAdvancedFilters(prev => ({ ...prev, [pref.key]: !active }))
          }
        >
          <Text
            style={[
              styles.modalToggleChipText,
              active && styles.modalToggleChipTextActive,
            ]}
          >
            {pref.label}
          </Text>
        </TouchableOpacity>
      );
    }

    if (pref.input_type === 'single_select' && Array.isArray(pref.options)) {
      return (
        <View style={styles.modalOptionWrap}>
          {pref.options.map((opt) => {
            const active = currentValue === opt;
            return (
              <TouchableOpacity
                key={opt}
                activeOpacity={0.85}
                style={[
                  styles.modalOptionChip,
                  active && styles.modalOptionChipActive,
                ]}
                onPress={() =>
                  setAdvancedFilters(prev => ({
                    ...prev,
                    [pref.key]: active ? '' : opt,
                  }))
                }
              >
                <Text
                  style={[
                    styles.modalOptionChipText,
                    active && styles.modalOptionChipTextActive,
                  ]}
                >
                  {opt}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      );
    }

    return null;
  };
const renderRideCard = ({ item }) => {
  let profilePhotoUrl = null;
  let isSvg = false;
  
  if (item.profilePicture) {
    profilePhotoUrl = buildImageUrl(item.profilePicture);
  } else if (item.profilepicture) {
    profilePhotoUrl = buildImageUrl(item.profilepicture);
  } else if (item.profilePhoto) {
    profilePhotoUrl = buildImageUrl(item.profilePhoto);
  } else if (item.driverProfilePicture) {
    profilePhotoUrl = buildImageUrl(item.driverProfilePicture);
  } else if (item.driver?.profile_picture) {
    profilePhotoUrl = buildImageUrl(item.driver.profile_picture);
  } else if (item.user?.profile_picture) {
    profilePhotoUrl = buildImageUrl(item.user.profile_picture);
  }
  
  if (profilePhotoUrl && profilePhotoUrl.toLowerCase().includes('.svg')) {
    isSvg = true;
  }
  
  const driverNameText = item.driverName || item.driver_name || item.driver?.full_name || 'Driver';
  const avatarText = getDriverInitials(driverNameText);

  let vehicleLabel = 'Vehicle details unavailable';
  if (item.vehicle) {
    const vehicleParts = [];
    if (item.vehicle.model) vehicleParts.push(item.vehicle.model);
    if (item.vehicle.color && vehicleParts.length > 0) {
      vehicleLabel = `${vehicleParts.join(' ')} - ${item.vehicle.color}`;
    } else if (item.vehicle.color) {
      vehicleLabel = item.vehicle.color;
    } else if (vehicleParts.length > 0) {
      vehicleLabel = vehicleParts.join(' ');
    }
  } else if (item.vehicleModel) {
    vehicleLabel = item.vehicleModel;
    if (item.vehicleColor) {
      vehicleLabel = `${item.vehicleModel} - ${item.vehicleColor}`;
    }
  }

  const preferenceBadges = extractPreferenceBadges(item);
  const isDriverVerified = item.isVerified;
  const driverRating = item.rating || 0;

  const pickupName = item.pickupLabel || item.from || 'Pickup point';
  const dropName = item.dropLabel || item.to || 'Drop point';
  
  const seatsAvailable = item.seatsAvailable || 0;
  const isSeatsInsufficient = requestedSeats > seatsAvailable;
  const isFull = item.isFull || seatsAvailable === 0;

  return (
    <TouchableOpacity
      style={[styles.rideCard, (isSeatsInsufficient || isFull) && styles.rideCardDisabled]}
      onPress={() => !isSeatsInsufficient && !isFull && handleCardPress(item)}
      activeOpacity={(isSeatsInsufficient || isFull) ? 1 : 0.9}
      disabled={isSeatsInsufficient || isFull}
    >
      <View style={styles.cardTopRow}>
        <View style={styles.profileRow}>
          <TouchableOpacity
            onPress={() => handleProfileImagePress(profilePhotoUrl, driverNameText)}
            activeOpacity={0.8}
          >
            <View style={styles.avatarContainer}>
              {profilePhotoUrl ? (
                isSvg ? (
                  <View style={styles.svgContainer}>
                    <SvgCssUri
                      uri={profilePhotoUrl}
                      width="48"
                      height="48"
                    />
                  </View>
                ) : (
                  <Image
                    source={{ uri: profilePhotoUrl }}
                    style={styles.avatarImage}
                    resizeMode="cover"
                  />
                )
              ) : (
                <View style={styles.initialsContainer}>
                  <Text style={styles.avatarFallback}>{avatarText}</Text>
                </View>
              )}
            </View>
          </TouchableOpacity>

          <View style={styles.profileContent}>
            <View style={styles.nameRow}>
              <Text style={styles.driverName} numberOfLines={1}>
                {driverNameText}
              </Text>

              {isDriverVerified && (
                <View style={styles.verifiedBadge}>
                  <Ionicons name="checkmark-circle" size={14} color="#16A34A" />
                  <Text style={styles.verifiedText}>Verified</Text>
                </View>
              )}

              {item.womenOnly === true && (
                <View style={styles.womenOnlyBadge}>
                  <Ionicons name="woman" size={12} color="#E91E63" />
                  <Text style={styles.womenOnlyBadgeText}>Women Only</Text>
                </View>
              )}
              
              {/* ✅ Add "Full" badge for full rides */}
              {isFull && (
                <View style={styles.fullBadge}>
                  <Ionicons name="close-circle" size={12} color="#EF4444" />
                  <Text style={styles.fullBadgeText}>Full</Text>
                </View>
              )}
            </View>

            <View style={styles.ratingRow}>
              <RatingStars rating={driverRating} size={12} showLabel={true} />
            </View>
          </View>
        </View>

        <View style={styles.priceMatchWrap}>
          <View style={styles.matchBadge}>
            <Text style={styles.matchText}>{item.matchPercentage || 0}%</Text>
          </View>
          <Text style={styles.priceText}>₹{item.price}</Text>
          <Text style={styles.perSeatText}>per seat</Text>
        </View>
      </View>

      <View style={styles.infoRow}>
        <View style={styles.infoItem}>
          <Ionicons name="calendar-outline" size={13} color={Colors.gray} />
          <Text style={styles.infoText} numberOfLines={1}>{item.date}</Text>
        </View>
        <View style={styles.infoDot} />
        <View style={styles.infoItem}>
          <Ionicons name="time-outline" size={13} color={Colors.gray} />
          <Text style={styles.infoText} numberOfLines={1}>{item.time}</Text>
        </View>
        <View style={styles.infoDot} />
        <View style={styles.infoItem}>
          <Ionicons name="people-outline" size={13} color={Colors.gray} />
          <Text style={[
            styles.infoText, 
            (seatsAvailable < requestedSeats || isFull) && styles.warningText
          ]} numberOfLines={1}>
            {isFull ? 'Ride Full' : `${seatsAvailable} left`}
          </Text>
        </View>
      </View>

      {(isSeatsInsufficient || isFull) && (
        <View style={styles.seatWarningContainer}>
          <Text style={styles.seatWarningText}>
            {isFull 
              ? '⚠️ This ride is full. Please check back later or try another ride.'
              : `⚠️ Only ${seatsAvailable} seat${seatsAvailable !== 1 ? 's' : ''} left. You requested ${requestedSeats} seat${requestedSeats !== 1 ? 's' : ''}.`}
          </Text>
        </View>
      )}

      <View style={styles.divider} />

      <View style={styles.routeBlock}>
        <View style={styles.routeRow}>
          <View style={[styles.routeDot, { backgroundColor: '#22C55E' }]} />
          <View style={styles.routeTextWrap}>
            <Text style={styles.routeLabel}>Pickup</Text>
            <Text style={styles.routeText} numberOfLines={2}>{pickupName}</Text>
          </View>
        </View>
        <View style={styles.routeRow}>
          <View style={[styles.routeDot, { backgroundColor: '#F97316' }]} />
          <View style={styles.routeTextWrap}>
            <Text style={styles.routeLabel}>Drop</Text>
            <Text style={styles.routeText} numberOfLines={2}>{dropName}</Text>
          </View>
        </View>
      </View>

      <View style={styles.vehicleRow}>
        <Ionicons name="car-sport-outline" size={14} color={Colors.gray} />
        <Text style={styles.vehicleText} numberOfLines={1}>{vehicleLabel}</Text>
      </View>

      {preferenceBadges.length > 0 && (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.badgeScroll}
        >
          {preferenceBadges.map((badge, index) => (
            <PreferenceTag key={`${badge}-${index}`} label={badge} />
          ))}
        </ScrollView>
      )}
    </TouchableOpacity>
  );
};

  if (authLoading || loading) {
    return (
      <View style={styles.loadingContainer}>
        <LottieView
          source={require("../assets/loading.json")}
          autoPlay
          loop
          style={{ width: 300, height: 300 }}
        />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={Colors.white} />

      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <MaterialIcons name="arrow-back-ios" size={24} color="#ED7117" />
        </TouchableOpacity>

        <Text style={styles.headerTitle}>Available Rides</Text>

        <TouchableOpacity
          style={[
            styles.filterButton,
            headerFiltersVisible && styles.filterButtonActive
          ]}
          onPress={() => setHeaderFiltersVisible(prev => !prev)}
        >
          <Ionicons name="options-outline" size={22} color="#ED7117" />
        </TouchableOpacity>
      </View>

      {headerFiltersVisible ? (
        <View style={styles.topControlsWrap}>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.filterScroll}
          >
            {quickFilterOptions.map((filter) => {
              const active = quickFilters.includes(filter.key);
              return (
                <TouchableOpacity
                  key={filter.key}
                  activeOpacity={0.85}
                  style={[styles.quickChip, active && styles.quickChipActive]}
                  onPress={() => toggleQuickFilter(filter.key)}
                >
                  <Text
                    style={[
                      styles.quickChipText,
                      active && styles.quickChipTextActive,
                    ]}
                  >
                    {filter.label}
                  </Text>
                </TouchableOpacity>
              );
            })}

            <TouchableOpacity
              activeOpacity={0.85}
              style={styles.moreFilterChip}
              onPress={() => setFilterModalVisible(true)}
            >
              <Ionicons name="options-outline" size={14} color="#ED7117" />
              <Text style={styles.moreFilterChipText}>More Filters</Text>
            </TouchableOpacity>
          </ScrollView>

          <Text style={styles.sortLabel}>Sort by</Text>

          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.sortScroll}
          >
            {SORT_OPTIONS.map((option) => {
              const active = sortBy === option.key;
              return (
                <TouchableOpacity
                  key={option.key}
                  activeOpacity={0.85}
                  style={[styles.sortChip, active && styles.sortChipActive]}
                  onPress={() => setSortBy(option.key)}
                >
                  <Text
                    style={[
                      styles.sortChipText,
                      active && styles.sortChipTextActive,
                    ]}
                  >
                    {option.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </View>
      ) : null}

      {processedRides.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Ionicons name="car-outline" size={80} color={Colors.gray} />
          <Text style={styles.emptyTitle}>No Rides Found</Text>
          <Text style={styles.emptySubtitle}>
            {errorMessage
              ? errorMessage
              : 'Try changing your filters or search again.'}
          </Text>

          <TouchableOpacity style={styles.clearButton} onPress={clearAllFilters}>
            <Text style={styles.clearButtonText}>Clear Filters</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={processedRides}
          renderItem={renderRideCard}
          keyExtractor={(item) => String(item.id)}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          ItemSeparatorComponent={() => <View style={{ height: 12 }} />}
        />
      )}

      <Modal
        visible={filterModalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setFilterModalVisible(false)}
      >
        <View style={styles.modalBackdrop}>
          <TouchableOpacity
            style={styles.modalOverlay}
            activeOpacity={1}
            onPress={() => setFilterModalVisible(false)}
          />

          <View style={styles.modalSheet}>
            <View style={styles.modalHandle} />

            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>More Filters</Text>
              <TouchableOpacity onPress={() => setFilterModalVisible(false)}>
                <Ionicons name="close" size={24} color={Colors.dark} />
              </TouchableOpacity>
            </View>

            <ScrollView
              showsVerticalScrollIndicator={false}
              contentContainerStyle={styles.modalContent}
            >
              {advancedFilterOptions.map((pref) => (
                <View key={pref.key} style={styles.modalSection}>
                  <Text style={styles.modalSectionTitle}>{pref.label}</Text>
                  {renderAdvancedFilterControl(pref)}
                </View>
              ))}
            </ScrollView>

            <View style={styles.modalFooter}>
              <TouchableOpacity
                style={styles.modalSecondaryBtn}
                onPress={clearAllFilters}
              >
                <Text style={styles.modalSecondaryBtnText}>Clear</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.modalPrimaryBtn}
                onPress={() => setFilterModalVisible(false)}
              >
                <Text style={styles.modalPrimaryBtnText}>Apply Filters</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      <ProfileImageModal
        visible={selectedProfile.visible}
        imageUrl={selectedProfile.imageUrl}
        driverName={selectedProfile.driverName}
        onClose={() => setSelectedProfile({ visible: false, imageUrl: null, driverName: '' })}
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

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 0.5,
    borderBottomColor: '#fff',
    backgroundColor: Colors.white,
  },
  backButton: {
    width: 44,
    height: 44,
    justifyContent: 'center',
  },
  filterButton: {
    width: 44,
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 22,
  },
  filterButtonActive: {
    backgroundColor: '#fff',
  },
  headerTitle: {
    ...Typography.h2,
    fontSize: 28,
    fontWeight: '700',
    color: Colors.primary,
    flex: 1,
    textAlign: 'center',
  },
  topControlsWrap: {
    backgroundColor: Colors.white,
    paddingTop: 10,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#EEF2F7',
  },
  filterScroll: {
    paddingHorizontal: 16,
    gap: 10,
  },
  quickChip: {
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 20,
    backgroundColor: '#F3F4F6',
  },
  quickChipActive: {
    backgroundColor: Colors.primary,
  },
  quickChipText: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.dark,
  },
  quickChipTextActive: {
    color: Colors.white,
  },
  moreFilterChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 20,
    backgroundColor: '#EEF6FF',
  },
  moreFilterChipText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#ED7117',
  },
  sortLabel: {
    paddingHorizontal: 16,
    marginTop: 12,
    marginBottom: 8,
    fontSize: 12,
    color: Colors.gray,
    fontWeight: '700',
  },
  sortScroll: {
    paddingHorizontal: 16,
    gap: 10,
  },
  sortChip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 14,
    backgroundColor: '#F3F4F6',
  },
  sortChipActive: {
    backgroundColor: '#ED7117',
  },
  sortChipText: {
    fontSize: 12,
    color: Colors.dark,
    fontWeight: '600',
  },
  sortChipTextActive: {
    color: Colors.white,
  },
  listContent: {
    padding: 16,
    paddingBottom: 28,
  },
  rideCard: {
    backgroundColor: Colors.white,
    borderRadius: 18,
    padding: 14,
    borderWidth: 1,
    borderColor: '#EEF2F7',
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.05,
    shadowRadius: 14,
    elevation: 2,
  },
  rideCardDisabled: {
    opacity: 0.7,
    backgroundColor: '#F9FAFB',
  },
  cardTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  profileRow: {
    flexDirection: 'row',
    flex: 1,
    paddingRight: 10,
  },
  avatarContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#E5E7EB',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    marginRight: 10,
  },
  avatarImage: {
    width: 48,
    height: 48,
  },
  avatarFallback: {
    fontSize: 14,
    fontWeight: '800',
    color: Colors.gray,
  },
  profileContent: {
    flex: 1,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 6,
  },
  driverName: {
    fontSize: 15,
    fontWeight: '800',
    color: Colors.dark,
    maxWidth: '100%',
  },
  verifiedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#E8F5E9',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 12,
  },
  verifiedText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#16A34A',
  },
  womenOnlyBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#FCE4EC',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 12,
  },
  womenOnlyBadgeText: {
    fontSize: 10,
    color: '#E91E63',
    fontWeight: '700',
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  ratingText: {
    fontSize: 11,
    color: Colors.gray,
    fontWeight: '600',
  },
  priceMatchWrap: {
    alignItems: 'flex-end',
  },
  matchBadge: {
    backgroundColor: '#EEF6FF',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 10,
    marginBottom: 6,
  },
  matchText: {
    fontSize: 12,
    fontWeight: '800',
    color: Colors.primary,
  },
  priceText: {
    fontSize: 18,
    fontWeight: '800',
    color: '#ED7117',
    lineHeight: 20,
  },
  perSeatText: {
    fontSize: 10,
    color: Colors.gray,
    fontWeight: '600',
    marginTop: 2,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    marginTop: 12,
    marginBottom: 10,
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  infoText: {
    fontSize: 12,
    color: Colors.dark,
    fontWeight: '600',
  },
  warningText: {
    color: '#EF4444',
  },
  infoDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#CBD5E1',
    marginHorizontal: 8,
  },
  seatWarningContainer: {
    backgroundColor: '#FEF2F2',
    borderRadius: 8,
    padding: 8,
    marginTop: 8,
    marginBottom: 4,
  },
  seatWarningText: {
    fontSize: 11,
    color: '#EF4444',
    fontWeight: '600',
    textAlign: 'center',
  },
  divider: {
    height: 1,
    backgroundColor: '#EEF2F7',
    marginBottom: 10,
  },
  routeBlock: {
    gap: 8,
  },
  routeRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  routeDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginTop: 5,
    marginRight: 8,
  },
  routeTextWrap: {
    flex: 1,
  },
  routeLabel: {
    fontSize: 11,
    color: Colors.gray,
    fontWeight: '700',
    marginBottom: 2,
  },
  routeText: {
    fontSize: 13,
    color: Colors.dark,
    fontWeight: '600',
    lineHeight: 18,
  },
  vehicleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 10,
  },
  vehicleText: {
    fontSize: 12,
    color: Colors.gray,
    fontWeight: '600',
    flex: 1,
  },
  badgeScroll: {
    gap: 8,
    paddingTop: 10,
  },
  prefBadge: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 12,
    marginRight: 8,
  },
  prefBadgeText: {
    fontSize: 11,
    fontWeight: '700',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.white,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  emptyTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: Colors.dark,
    marginTop: 20,
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 15,
    color: Colors.gray,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 24,
  },
  clearButton: {
    backgroundColor: Colors.primary,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
  },
  clearButtonText: {
    color: Colors.white,
    fontSize: 15,
    fontWeight: '700',
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(15,23,42,0.28)',
    justifyContent: 'flex-end',
  },
  modalOverlay: {
    flex: 1,
  },
  modalSheet: {
    backgroundColor: Colors.white,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: '78%',
    paddingTop: 10,
  },
  modalHandle: {
    width: 52,
    height: 5,
    borderRadius: 999,
    backgroundColor: '#D1D5DB',
    alignSelf: 'center',
    marginBottom: 14,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 18,
    paddingBottom: 10,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: Colors.dark,
  },
  modalContent: {
    paddingHorizontal: 18,
    paddingBottom: 20,
  },
  modalSection: {
    marginBottom: 18,
  },
  modalSectionTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.dark,
    marginBottom: 10,
  },
  modalToggleChip: {
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    paddingHorizontal: 14,
    paddingVertical: 10,
    alignSelf: 'flex-start',
    backgroundColor: '#F9FAFB',
  },
  modalToggleChipActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  modalToggleChipText: {
    fontSize: 13,
    color: Colors.dark,
    fontWeight: '600',
  },
  modalToggleChipTextActive: {
    color: Colors.white,
  },
  modalOptionWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  modalOptionChip: {
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    paddingHorizontal: 12,
    paddingVertical: 9,
    backgroundColor: '#F9FAFB',
  },
  modalOptionChipActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  modalOptionChipText: {
    fontSize: 13,
    color: Colors.dark,
    fontWeight: '600',
  },
  modalOptionChipTextActive: {
    color: Colors.white,
  },
  modalFooter: {
    flexDirection: 'row',
    paddingHorizontal: 18,
    paddingTop: 12,
    paddingBottom: Platform.OS === 'ios' ? 28 : 18,
    borderTopWidth: 1,
    borderTopColor: '#EEF2F7',
    gap: 12,
  },
  modalSecondaryBtn: {
    flex: 1,
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: 'center',
    backgroundColor: '#F3F4F6',
  },
  modalSecondaryBtnText: {
    fontSize: 15,
    fontWeight: '700',
    color: Colors.dark,
  },
  modalPrimaryBtn: {
    flex: 1,
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: 'center',
    backgroundColor: Colors.primary,
  },
  modalPrimaryBtnText: {
    fontSize: 15,
    fontWeight: '700',
    color: Colors.white,
  },
  imageModalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.9)',
  },
  imageModalContent: {
    width: '90%',
    backgroundColor: Colors.white,
    borderRadius: 20,
    overflow: 'hidden',
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
  svgContainer: {
    width: 48,
    height: 48,
    alignItems: 'center',
    justifyContent: 'center',
  },
  initialsContainer: {
    width: '100%',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#E5E7EB',
  },
  modalSvgContainer: {
    width: '100%',
    height: 400,
    backgroundColor: '#F5F5F5',
    alignItems: 'center',
    justifyContent: 'center',
  },
  fullBadge: {
  flexDirection: 'row',
  alignItems: 'center',
  gap: 4,
  backgroundColor: '#FEF2F2',
  paddingHorizontal: 8,
  paddingVertical: 3,
  borderRadius: 12,
  borderWidth: 1,
  borderColor: '#FEE2E2',
},
fullBadgeText: {
  fontSize: 10,
  color: '#EF4444',
  fontWeight: '700',
},
});