// // // // // import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
// // // // // import {
// // // // //   View,
// // // // //   Text,
// // // // //   StyleSheet,
// // // // //   TouchableOpacity,
// // // // //   FlatList,
// // // // //   StatusBar,
// // // // //   Platform,
// // // // //   Image,
// // // // //   ScrollView,
// // // // //   Modal,
// // // // //   RefreshControl,
// // // // //   AppState,
// // // // // } from 'react-native';
// // // // // import { SafeAreaView } from 'react-native-safe-area-context';
// // // // // import { Ionicons, MaterialIcons } from '@expo/vector-icons';
// // // // // import LottieView from "lottie-react-native";
// // // // // import { Colors, Typography } from '../constants/Colors';
// // // // // import { useAuth } from '../context/AuthContext';
// // // // // import { API_BASE_URL } from '../config/config_ip';
// // // // // import DatabaseService from '../services/matchingpreference_ds';
// // // // // import CustomAlert from '../components/CustomAlert';
// // // // // import { SvgCssUri } from 'react-native-svg/css';
// // // // // import { useFocusEffect } from '@react-navigation/native';
// // // // // import io from 'socket.io-client';

// // // // // const IMAGE_BASE_URL = API_BASE_URL;

// // // // // const QUICK_FILTER_KEYS = [
// // // // //   'verified_profiles_only',
// // // // //   'same_gender_after_9pm',
// // // // //   'smoking_policy',
// // // // //   'pets_allowed',
// // // // //   'chat_level',
// // // // //   'luggage_allowance',
// // // // // ];

// // // // // const QUICK_FILTER_LABELS = {
// // // // //   verified_profiles_only: 'Verified Only',
// // // // //   same_gender_after_9pm: 'Same Gender Night',
// // // // //   smoking_policy: 'No Smoking',
// // // // //   pets_allowed: 'Pets',
// // // // //   chat_level: 'Chat Level',
// // // // //   luggage_allowance: 'Luggage',
// // // // // };

// // // // // const SORT_OPTIONS = [
// // // // //   { key: 'time', label: 'Time' },
// // // // //   { key: 'price', label: 'Price' },
// // // // //   { key: 'rating', label: 'Rating' },
// // // // //   { key: 'match', label: 'Match %' },
// // // // // ];

// // // // // function buildImageUrl(url) {
// // // // //   if (!url) return null;
// // // // //   if (url.startsWith('http://') || url.startsWith('https://')) return url;
// // // // //   return `${IMAGE_BASE_URL}${url.startsWith('/') ? '' : '/'}${url}`;
// // // // // }

// // // // // function getDriverInitials(name) {
// // // // //   if (!name) return 'D';
// // // // //   const parts = name.trim().split(' ').filter(Boolean);
// // // // //   if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
// // // // //   return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
// // // // // }

// // // // // function normalizeText(value) {
// // // // //   if (value === undefined || value === null) return '';
// // // // //   return String(value).trim().toLowerCase();
// // // // // }

// // // // // function getRidePreferences(item) {
// // // // //   if (item.preferences) return item.preferences;
// // // // //   if (item.ridePreferences) return item.ridePreferences;
// // // // //   if (item.matchingPreferences) return item.matchingPreferences;
// // // // //   if (item.travel_preferences) return item.travel_preferences;
// // // // //   return {};
// // // // // }

// // // // // function extractPreferenceBadges(item) {
// // // // //   const prefs = getRidePreferences(item);
// // // // //   const badges = [];

// // // // //   if (!prefs || Object.keys(prefs).length === 0) {
// // // // //     return [];
// // // // //   }

// // // // //   Object.entries(prefs).forEach(([key, value]) => {
// // // // //     if (value === null || value === undefined) return;
    
// // // // //     if (typeof value === 'boolean') {
// // // // //       if (value === true) {
// // // // //         if (key === 'verified_profiles_only') {
// // // // //           badges.push('Verified Only');
// // // // //         } else {
// // // // //           const displayKey = key.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
// // // // //           badges.push(displayKey);
// // // // //         }
// // // // //       }
// // // // //     } 
// // // // //     else if (Array.isArray(value)) {
// // // // //       if (value.length > 0) {
// // // // //         value.forEach(v => {
// // // // //           if (v && v.trim()) {
// // // // //             badges.push(v.trim());
// // // // //           }
// // // // //         });
// // // // //       }
// // // // //     }
// // // // //     else if (typeof value === 'string' && value.trim()) {
// // // // //       const lowerValue = value.toLowerCase();
// // // // //       if (!['false', 'no', 'none', 'null', 'undefined', 'no preference'].includes(lowerValue)) {
// // // // //         badges.push(value);
// // // // //       }
// // // // //     }
// // // // //     else if (typeof value === 'number') {
// // // // //       badges.push(String(value));
// // // // //     }
// // // // //   });

// // // // //   return [...new Set(badges)];
// // // // // }

// // // // // async function fetchUserDocuments(phoneNumber) {
// // // // //   try {
// // // // //     const url = `${API_BASE_URL}/api/v1/documents/user/${phoneNumber}`;
// // // // //     const res = await fetch(url, { headers: { Accept: 'application/json' } });
// // // // //     if (!res.ok) return null;
// // // // //     const data = await res.json();
// // // // //     return data;
// // // // //   } catch (e) {
// // // // //     console.log('fetchUserDocuments error:', e);
// // // // //     return null;
// // // // //   }
// // // // // }

// // // // // async function fetchDriverProfile(phoneNumber, userId) {
// // // // //   try {
// // // // //     const params = new URLSearchParams();
// // // // //     if (userId) params.append('user_id', userId);
// // // // //     else if (phoneNumber) params.append('phone_number', phoneNumber);
// // // // //     else return null;
// // // // //     const url = `${API_BASE_URL}/api/v1/users/profile-public?${params.toString()}`;
// // // // //     const res = await fetch(url, { headers: { Accept: 'application/json' } });
// // // // //     if (!res.ok) return null;
// // // // //     const data = await res.json();
// // // // //     return data;
// // // // //   } catch (e) {
// // // // //     console.log('fetchDriverProfile error:', e);
// // // // //     return null;
// // // // //   }
// // // // // }

// // // // // function checkVerifiedDocuments(docs) {
// // // // //   if (!docs || !docs.length) return false;
  
// // // // //   const verified = docs.filter(doc => {
// // // // //     const docType = doc.document_type?.toLowerCase();
// // // // //     const status = doc.status?.toUpperCase();
// // // // //     return status === 'APPROVED' && ['aadhar', 'dl', 'rc'].includes(docType);
// // // // //   });
  
// // // // //   return verified.length > 0;
// // // // // }

// // // // // function RatingStars({ rating, size = 12, showLabel = true }) {
// // // // //   const fullStars = Math.floor(rating);
// // // // //   const hasHalfStar = rating % 1 >= 0.5;
// // // // //   const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);
  
// // // // //   return (
// // // // //     <View style={{ flexDirection: 'row', alignItems: 'center' }}>
// // // // //       {[...Array(fullStars)].map((_, i) => (
// // // // //         <Ionicons key={`full-${i}`} name="star" size={size} color="#F59E0B" />
// // // // //       ))}
// // // // //       {hasHalfStar && (
// // // // //         <Ionicons name="star-half" size={size} color="#F59E0B" />
// // // // //       )}
// // // // //       {[...Array(emptyStars)].map((_, i) => (
// // // // //         <Ionicons key={`empty-${i}`} name="star-outline" size={size} color="#F59E0B" />
// // // // //       ))}
// // // // //       {showLabel && rating > 0 && (
// // // // //         <Text style={[styles.ratingText, { marginLeft: 4 }]}>({rating.toFixed(1)})</Text>
// // // // //       )}
// // // // //       {showLabel && rating === 0 && (
// // // // //         <Text style={[styles.ratingText, { marginLeft: 4 }]}>New</Text>
// // // // //       )}
// // // // //     </View>
// // // // //   );
// // // // // }

// // // // // function matchesQuickFilter(item, key) {
// // // // //   const prefs = getRidePreferences(item);
// // // // //   const value = prefs?.[key];
// // // // //   const normalized = normalizeText(value);

// // // // //   if (key === 'verified_profiles_only') {
// // // // //     return !!item.isVerified;
// // // // //   }

// // // // //   if (typeof value === 'boolean') return value;
// // // // //   if (Array.isArray(value)) return value.length > 0;

// // // // //   if (key === 'smoking_policy') {
// // // // //     return normalized.includes('no');
// // // // //   }

// // // // //   if (key === 'same_gender_after_9pm') {
// // // // //     return normalized === 'true' || normalized === 'yes' || normalized === 'same gender';
// // // // //   }

// // // // //   if (key === 'pets_allowed') {
// // // // //     return normalized === 'true' || normalized === 'yes' || normalized === 'allowed';
// // // // //   }

// // // // //   return !!normalized;
// // // // // }

// // // // // function matchesAdvancedFilter(item, key, expectedValue) {
// // // // //   if (expectedValue === undefined || expectedValue === null || expectedValue === '') {
// // // // //     return true;
// // // // //   }

// // // // //   const prefs = getRidePreferences(item);
// // // // //   const rideValue = prefs?.[key];

// // // // //   if (typeof expectedValue === 'boolean') {
// // // // //     if (key === 'verified_profiles_only') {
// // // // //       return expectedValue ? !!item.isVerified : true;
// // // // //     }
// // // // //     return rideValue === expectedValue || normalizeText(rideValue) === String(expectedValue);
// // // // //   }

// // // // //   if (Array.isArray(rideValue)) {
// // // // //     return rideValue.map(v => normalizeText(v)).includes(normalizeText(expectedValue));
// // // // //   }

// // // // //   return normalizeText(rideValue) === normalizeText(expectedValue);
// // // // // }

// // // // // function ProfileImageModal({ visible, imageUrl, driverName, onClose }) {
// // // // //   const [isSvg, setIsSvg] = useState(false);
  
// // // // //   useEffect(() => {
// // // // //     if (imageUrl) {
// // // // //       setIsSvg(imageUrl.toLowerCase().includes('.svg'));
// // // // //     }
// // // // //   }, [imageUrl]);
  
// // // // //   if (!visible) return null;
  
// // // // //   return (
// // // // //     <Modal
// // // // //       visible={visible}
// // // // //       transparent={true}
// // // // //       animationType="fade"
// // // // //       onRequestClose={onClose}
// // // // //     >
// // // // //       <TouchableOpacity 
// // // // //         style={styles.modalBackdrop}
// // // // //         activeOpacity={1}
// // // // //         onPress={onClose}
// // // // //       >
// // // // //         <View style={styles.imageModalContainer}>
// // // // //           <View style={styles.imageModalContent}>
// // // // //             <View style={styles.imageModalHeader}>
// // // // //               <Text style={styles.imageModalTitle}>{driverName}</Text>
// // // // //               <TouchableOpacity onPress={onClose}>
// // // // //                 <Ionicons name="close" size={24} color={Colors.dark} />
// // // // //               </TouchableOpacity>
// // // // //             </View>
// // // // //             {imageUrl && imageUrl !== 'null' && imageUrl !== 'undefined' ? (
// // // // //               isSvg ? (
// // // // //                 <View style={styles.modalSvgContainer}>
// // // // //                   <SvgCssUri
// // // // //                     uri={imageUrl}
// // // // //                     width="100%"
// // // // //                     height={400}
// // // // //                   />
// // // // //                 </View>
// // // // //               ) : (
// // // // //                 <Image
// // // // //                   source={{ uri: imageUrl }}
// // // // //                   style={styles.fullProfileImage}
// // // // //                   resizeMode="contain"
// // // // //                 />
// // // // //               )
// // // // //             ) : (
// // // // //               <View style={styles.noImageContainer}>
// // // // //                 <Text style={styles.noImageText}>No profile picture available</Text>
// // // // //               </View>
// // // // //             )}
// // // // //           </View>
// // // // //         </View>
// // // // //       </TouchableOpacity>
// // // // //     </Modal>
// // // // //   );
// // // // // }

// // // // // function PreferenceTag({ label }) {
// // // // //   if (!label || label.trim() === '') return null;
  
// // // // //   let tagColor = '#FFF3E8';
// // // // //   let textColor = '#C65D00';
  
// // // // //   const lowerLabel = label.toLowerCase();
  
// // // // //   if (lowerLabel.includes('chatty') || lowerLabel.includes('talkative')) {
// // // // //     tagColor = '#E3F2FD';
// // // // //     textColor = '#1565C0';
// // // // //   } else if (lowerLabel.includes('quiet')) {
// // // // //     tagColor = '#E8F5E9';
// // // // //     textColor = '#2E7D32';
// // // // //   } else if (lowerLabel.includes('english') || lowerLabel.includes('hindi') || lowerLabel.includes('language')) {
// // // // //     tagColor = '#FFF9C4';
// // // // //     textColor = '#F57F17';
// // // // //   } else if (lowerLabel.includes('music') || lowerLabel.includes('songs')) {
// // // // //     tagColor = '#F3E5F5';
// // // // //     textColor = '#6A1B9A';
// // // // //   } else if (lowerLabel.includes('ac')) {
// // // // //     tagColor = '#E3F2FD';
// // // // //     textColor = '#1565C0';
// // // // //   } else if (lowerLabel.includes('pet')) {
// // // // //     tagColor = '#FCE4EC';
// // // // //     textColor = '#C2185B';
// // // // //   } else if (lowerLabel.includes('smoking')) {
// // // // //     tagColor = '#FFEBEE';
// // // // //     textColor = '#C62828';
// // // // //   } else if (lowerLabel.includes('verified')) {
// // // // //     tagColor = '#E8F5E9';
// // // // //     textColor = '#2E7D32';
// // // // //   } else if (lowerLabel.match(/[0-9]/)) {
// // // // //     tagColor = '#E8F5E9';
// // // // //     textColor = '#2E7D32';
// // // // //   }
  
// // // // //   return (
// // // // //     <View style={[styles.prefBadge, { backgroundColor: tagColor }]}>
// // // // //       <Text style={[styles.prefBadgeText, { color: textColor }]}>{label}</Text>
// // // // //     </View>
// // // // //   );
// // // // // }

// // // // // export default function RideNextScreen({ navigation, route }) {
// // // // //   const { user, loading: authLoading } = useAuth();
// // // // //   const { searchData } = route.params || {};
// // // // //   const { from, to, fromCoords, toCoords, dateTime, seats } = searchData || {};

// // // // //   const [availableRides, setAvailableRides] = useState([]);
// // // // //   const [loading, setLoading] = useState(true);
// // // // //   const [refreshing, setRefreshing] = useState(false);
// // // // //   const [errorMessage, setErrorMessage] = useState('');
// // // // //   const [sortBy, setSortBy] = useState('time');
// // // // //   const [quickFilters, setQuickFilters] = useState([]);
// // // // //   const [headerFiltersVisible, setHeaderFiltersVisible] = useState(false);
// // // // //   const [filterModalVisible, setFilterModalVisible] = useState(false);
// // // // //   const [preferenceMaster, setPreferenceMaster] = useState([]);
// // // // //   const [userPreferences, setUserPreferences] = useState({});
// // // // //   const [advancedFilters, setAdvancedFilters] = useState({});
// // // // //   const [fixRun, setFixRun] = useState(false);
  
// // // // //   const [selectedProfile, setSelectedProfile] = useState({
// // // // //     visible: false,
// // // // //     imageUrl: null,
// // // // //     driverName: '',
// // // // //   });

// // // // //   const [alertVisible, setAlertVisible] = useState(false);
// // // // //   const [alertConfig, setAlertConfig] = useState({
// // // // //     title: "",
// // // // //     message: "",
// // // // //     icon: "check-circle",
// // // // //     iconColor: "#10B981",
// // // // //     buttons: []
// // // // //   });

// // // // //   const socketRef = useRef(null);
// // // // //   const pollingIntervalRef = useRef(null);
// // // // //   const joinedRideRooms = useRef(new Set());
// // // // //   const appState = useRef(AppState.currentState);

// // // // //   const showCustomAlert = (title, message, type = 'success') => {
// // // // //     let icon = "check-circle";
// // // // //     let iconColor = "#10B981";
    
// // // // //     if (type === 'error') {
// // // // //       icon = "error";
// // // // //       iconColor = "#EF4444";
// // // // //     } else if (type === 'warning') {
// // // // //       icon = "warning";
// // // // //       iconColor = "#F59E0B";
// // // // //     } else if (type === 'info') {
// // // // //       icon = "info";
// // // // //       iconColor = Colors.primary;
// // // // //     }
    
// // // // //     setAlertConfig({
// // // // //       title,
// // // // //       message,
// // // // //       icon,
// // // // //       iconColor,
// // // // //       buttons: [{ text: 'OK', onPress: () => setAlertVisible(false) }]
// // // // //     });
// // // // //     setAlertVisible(true);
// // // // //   };

// // // // //   const phoneNumber = user?.phone_number;
// // // // //   const userGender = user?.gender;
// // // // //   const requestedSeats = seats || 1;

// // // // //   // Auto-fix rejected modifications on component mount
// // // // //   const autoFixRejectedModifications = useCallback(async () => {
// // // // //     if (fixRun) return;
    
// // // // //     try {
// // // // //       console.log('🔧 Auto-fixing rejected modifications...');
// // // // //       const response = await fetch(`${API_BASE_URL}/fix-rejected-modifications`, {
// // // // //         method: 'POST',
// // // // //       });
// // // // //       const result = await response.json();
      
// // // // //       if (result.success && result.fixed_modifications > 0) {
// // // // //         console.log(`✅ Auto-fix completed: Fixed ${result.fixed_modifications} rejected modifications`);
// // // // //         console.log(`   Updated ${result.updated_rides} rides`);
// // // // //         // Show silent alert (optional - can be removed if you don't want to notify user)
// // // // //         // showCustomAlert('Data Fixed', `${result.fixed_modifications} booking issues resolved.`, 'info');
// // // // //       } else if (result.success) {
// // // // //         console.log('✅ No fixes needed - all data is clean');
// // // // //       }
// // // // //       setFixRun(true);
// // // // //     } catch (error) {
// // // // //       console.log('⚠️ Auto-fix error:', error);
// // // // //       setFixRun(true); // Don't retry on error
// // // // //     }
// // // // //   }, [fixRun]);

// // // // //   // Run auto-fix when component mounts
// // // // //   useEffect(() => {
// // // // //     autoFixRejectedModifications();
// // // // //   }, [autoFixRejectedModifications]);

// // // // //   // Force refresh a specific ride's seat count
// // // // //   const forceRefreshRideSeats = useCallback(async (rideId) => {
// // // // //     try {
// // // // //       console.log(`🔄 Force refreshing ride ${rideId} seat count...`);
      
// // // // //       const refreshResponse = await fetch(`${API_BASE_URL}/ride/${rideId}/refresh-seats`);
// // // // //       if (refreshResponse.ok) {
// // // // //         const refreshData = await refreshResponse.json();
// // // // //         if (refreshData.success) {
// // // // //           const newSeats = refreshData.remaining_seats || 0;
// // // // //           console.log(`✅ Refresh endpoint: ${newSeats} seats available`);
          
// // // // //           setAvailableRides(prevRides => 
// // // // //             prevRides.map(ride => {
// // // // //               if (ride.id === rideId || String(ride.id) === String(rideId)) {
// // // // //                 console.log(`🔄 Updating ride ${rideId}: ${ride.seatsAvailable} -> ${newSeats}`);
// // // // //                 return { 
// // // // //                   ...ride, 
// // // // //                   seatsAvailable: newSeats,
// // // // //                   isFull: newSeats === 0
// // // // //                 };
// // // // //               }
// // // // //               return ride;
// // // // //             })
// // // // //           );
// // // // //           return;
// // // // //         }
// // // // //       }
      
// // // // //       // Fallback - re-fetch all rides
// // // // //       console.log(`⚠️ Refresh endpoint failed, re-fetching all rides...`);
// // // // //       await fetchAvailableRides(true);
      
// // // // //     } catch (error) {
// // // // //       console.log(`Error force refreshing ride ${rideId}:`, error);
// // // // //       await fetchAvailableRides(true);
// // // // //     }
// // // // //   }, [fetchAvailableRides]);

// // // // //   const joinRideRooms = useCallback((rides) => {
// // // // //     if (socketRef.current && socketRef.current.connected) {
// // // // //       rides.forEach(ride => {
// // // // //         const rideId = ride.id;
// // // // //         if (!joinedRideRooms.current.has(rideId)) {
// // // // //           socketRef.current.emit('join-ride-room', rideId);
// // // // //           joinedRideRooms.current.add(rideId);
// // // // //           console.log(`📡 Joined ride room: ride_${rideId}`);
// // // // //         }
// // // // //       });
// // // // //     } else if (socketRef.current) {
// // // // //       socketRef.current.once('connect', () => {
// // // // //         rides.forEach(ride => {
// // // // //           const rideId = ride.id;
// // // // //           if (!joinedRideRooms.current.has(rideId)) {
// // // // //             socketRef.current.emit('join-ride-room', rideId);
// // // // //             joinedRideRooms.current.add(rideId);
// // // // //             console.log(`📡 Joined ride room on connect: ride_${rideId}`);
// // // // //           }
// // // // //         });
// // // // //       });
// // // // //     }
// // // // //   }, []);

// // // // //   const fetchAvailableRides = useCallback(async (showRefresh = false) => {
// // // // //     if (!searchData || !fromCoords || !toCoords || !dateTime) {
// // // // //       setAvailableRides([]);
// // // // //       setLoading(false);
// // // // //       return;
// // // // //     }

// // // // //     try {
// // // // //       if (showRefresh) {
// // // // //         setRefreshing(true);
// // // // //       } else {
// // // // //         setLoading(true);
// // // // //       }
// // // // //       setErrorMessage('');

// // // // //       const response = await fetch(`${API_BASE_URL}/search-rides`, {
// // // // //         method: 'POST',
// // // // //         headers: {
// // // // //           'Content-Type': 'application/json',
// // // // //         },
// // // // //         body: JSON.stringify({
// // // // //           from_location: from,
// // // // //           to_location: to,
// // // // //           from_coords: fromCoords,
// // // // //           to_coords: toCoords,
// // // // //           departure_time: new Date(dateTime).toISOString(),
// // // // //           seats_required: requestedSeats,
// // // // //           passenger_gender: userGender,
// // // // //         }),
// // // // //       });

// // // // //       const rawText = await response.text();
// // // // //       let parsedData = null;

// // // // //       try {
// // // // //         parsedData = rawText ? JSON.parse(rawText) : {};
// // // // //       } catch (parseError) {
// // // // //         parsedData = { detail: rawText || 'Unexpected server response' };
// // // // //       }

// // // // //       if (!response.ok) {
// // // // //         throw new Error(parsedData?.detail || 'Failed to fetch rides');
// // // // //       }

// // // // //       const rides = Array.isArray(parsedData?.rides) ? parsedData.rides : [];
      
// // // // //       console.log(`📱 Found ${rides.length} rides`);
      
// // // // //       const ridesWithDetails = await Promise.all(
// // // // //         rides.map(async (ride) => {
// // // // //           let isVerified = false;
// // // // //           let avgRating = ride.rating || 0;
// // // // //           let profilePictureUrl = null;
          
// // // // //           const driverPhone = ride.phoneNumber;
// // // // //           const driverUserId = ride.driverUserId;
          
// // // // //           if (driverPhone || driverUserId) {
// // // // //             if (driverPhone) {
// // // // //               const docsData = await fetchUserDocuments(driverPhone);
// // // // //               if (docsData?.success && docsData.documents) {
// // // // //                 isVerified = checkVerifiedDocuments(docsData.documents);
// // // // //               }
// // // // //             }
            
// // // // //             const profileData = await fetchDriverProfile(driverPhone, driverUserId);
            
// // // // //             if (profileData?.success && profileData.user) {
// // // // //               avgRating = profileData.user.avg_rating || 0;
              
// // // // //               const possiblePictureFields = ['profile_picture', 'profilePicture', 'profilePhoto', 'profile_image', 'avatar'];
// // // // //               for (const field of possiblePictureFields) {
// // // // //                 if (profileData.user[field]) {
// // // // //                   profilePictureUrl = profileData.user[field];
// // // // //                   break;
// // // // //                 }
// // // // //               }
              
// // // // //               if (!profilePictureUrl && profileData.user.profile && profileData.user.profile.picture) {
// // // // //                 profilePictureUrl = profileData.user.profile.picture;
// // // // //               }
// // // // //             }
// // // // //           }
          
// // // // //           if (!profilePictureUrl) {
// // // // //             if (ride.profilePicture) profilePictureUrl = ride.profilePicture;
// // // // //             else if (ride.profilepicture) profilePictureUrl = ride.profilepicture;
// // // // //             else if (ride.profilePhoto) profilePictureUrl = ride.profilePhoto;
// // // // //             else if (ride.driverProfilePicture) profilePictureUrl = ride.driverProfilePicture;
// // // // //           }
          
// // // // //           let finalProfilePicture = null;
// // // // //           if (profilePictureUrl) {
// // // // //             finalProfilePicture = buildImageUrl(profilePictureUrl);
// // // // //           }
          
// // // // //           let availableSeats = ride.seatsAvailable || ride.available_seats || 0;
          
// // // // //           // Force refresh seat count from server
// // // // //           let freshSeatCount = null;
// // // // //           try {
// // // // //             const refreshResponse = await fetch(`${API_BASE_URL}/ride/${ride.id}/refresh-seats`);
// // // // //             if (refreshResponse.ok) {
// // // // //               const refreshData = await refreshResponse.json();
// // // // //               if (refreshData.success) {
// // // // //                 freshSeatCount = refreshData.remaining_seats;
// // // // //                 console.log(`🔍 Fresh seat count for ride ${ride.id}: ${freshSeatCount} (was ${availableSeats})`);
// // // // //               }
// // // // //             }
// // // // //           } catch (e) {
// // // // //             console.log(`Could not refresh seat count for ride ${ride.id}:`, e);
// // // // //           }
          
// // // // //           const finalSeatsAvailable = freshSeatCount !== null ? freshSeatCount : availableSeats;
          
// // // // //           console.log(`🚗 Ride ${ride.id}: ${finalSeatsAvailable} seats available`);
          
// // // // //           return { 
// // // // //             ...ride, 
// // // // //             isVerified, 
// // // // //             rating: avgRating,
// // // // //             profilePicture: finalProfilePicture,
// // // // //             profilepicture: finalProfilePicture,
// // // // //             profilePhoto: finalProfilePicture,
// // // // //             pickupLabel: ride.pickupLabel || ride.pickupLocationName || ride.fromLocationName || ride.from || 'Pickup point',
// // // // //             dropLabel: ride.dropLabel || ride.dropLocationName || ride.toLocationName || ride.to || 'Drop point',
// // // // //             womenOnly: ride.womenOnly === true || ride.women_only === true,
// // // // //             seatsAvailable: finalSeatsAvailable,
// // // // //             requestedSeats: requestedSeats,
// // // // //             isFull: finalSeatsAvailable === 0,
// // // // //           };
// // // // //         })
// // // // //       );
      
// // // // //       setAvailableRides(ridesWithDetails);
      
// // // // //       // Join ride rooms for real-time updates
// // // // //       joinRideRooms(ridesWithDetails);
      
// // // // //     } catch (error) {
// // // // //       console.log('❌ search-rides error:', error);
// // // // //       setAvailableRides([]);
// // // // //       setErrorMessage(error.message || 'Failed to search rides');
// // // // //       showCustomAlert('Search Error', error.message || 'Failed to search rides', 'error');
// // // // //     } finally {
// // // // //       setLoading(false);
// // // // //       setRefreshing(false);
// // // // //     }
// // // // //   }, [searchData, from, to, fromCoords, toCoords, dateTime, requestedSeats, userGender, joinRideRooms]);

// // // // //   const updateRideSeats = useCallback(async (rideId) => {
// // // // //     try {
// // // // //       console.log(`🔄 Updating seat count for ride ${rideId}`);
      
// // // // //       const response = await fetch(`${API_BASE_URL}/ride/${rideId}/refresh-seats`);
// // // // //       if (!response.ok) {
// // // // //         console.log(`Failed to fetch ride ${rideId}: ${response.status}`);
// // // // //         return;
// // // // //       }
      
// // // // //       const data = await response.json();
      
// // // // //       if (data.success) {
// // // // //         const newAvailableSeats = data.remaining_seats || 0;
// // // // //         console.log(`✅ Ride ${rideId} now has ${newAvailableSeats} seats available`);
        
// // // // //         setAvailableRides(prevRides => 
// // // // //           prevRides.map(ride => {
// // // // //             if (ride.id === rideId || String(ride.id) === String(rideId)) {
// // // // //               const isNowFull = newAvailableSeats === 0;
// // // // //               console.log(`🔄 Updating ride ${rideId}: ${ride.seatsAvailable} -> ${newAvailableSeats}`);
// // // // //               return { 
// // // // //                 ...ride, 
// // // // //                 seatsAvailable: newAvailableSeats,
// // // // //                 isFull: isNowFull
// // // // //               };
// // // // //             }
// // // // //             return ride;
// // // // //           })
// // // // //         );
        
// // // // //         return newAvailableSeats;
// // // // //       }
// // // // //     } catch (error) {
// // // // //       console.log(`Error updating ride ${rideId}:`, error);
// // // // //     }
// // // // //     return null;
// // // // //   }, []);

// // // // //   const refreshAllRides = useCallback(async () => {
// // // // //     console.log('🔄 Force refreshing all rides...');
// // // // //     await fetchAvailableRides(true);
// // // // //   }, [fetchAvailableRides]);

// // // // //   // Setup Socket.IO for real-time updates
// // // // //   useEffect(() => {
// // // // //     if (!searchData) return;

// // // // //     const socket = io(API_BASE_URL, {
// // // // //       transports: ['websocket', 'polling'],
// // // // //       reconnection: true,
// // // // //       reconnectionAttempts: 20,
// // // // //       reconnectionDelay: 1000,
// // // // //       reconnectionDelayMax: 5000,
// // // // //       timeout: 20000,
// // // // //       withCredentials: false,
// // // // //       forceNew: true,
// // // // //     });

// // // // //     socketRef.current = socket;

// // // // //     socket.on('connect', () => {
// // // // //       console.log('🟢 Socket connected successfully for passenger ride updates');
// // // // //       if (user?.phone_number) {
// // // // //         socket.emit('join-user-room', user.phone_number);
// // // // //         console.log(`📡 Joined user room: user_${user.phone_number}`);
// // // // //       }
// // // // //       // Re-join all ride rooms after reconnection
// // // // //       joinedRideRooms.current.forEach(rideId => {
// // // // //         socket.emit('join-ride-room', rideId);
// // // // //         console.log(`📡 Re-joined ride room: ride_${rideId}`);
// // // // //       });
// // // // //     });

// // // // //     socket.on('connect_error', (error) => {
// // // // //       console.log('Socket connection error:', error.message);
// // // // //     });

// // // // //     socket.on('disconnect', (reason) => {
// // // // //       console.log('🔴 Socket disconnected:', reason);
// // // // //     });

// // // // //     // Listen for seats released events
// // // // //     socket.on('seats-released', async (data) => {
// // // // //       console.log('🪑 Seats released event received:', data);
// // // // //       if (data.ride_id) {
// // // // //         showCustomAlert('Seats Available! 🎉', 
// // // // //           data.message || `${data.seats_released || 'Seats'} are now available for booking.`, 
// // // // //           'info');
        
// // // // //         await forceRefreshRideSeats(data.ride_id);
// // // // //       }
// // // // //     });

// // // // //     // Listen for modification rejected events
// // // // //     socket.on('modification-rejected', async (data) => {
// // // // //       console.log('🔴 Modification rejected event received:', data);
// // // // //       if (data.ride_id) {
// // // // //         showCustomAlert('Seats Available! 🎉', 
// // // // //           data.message || `A seat modification was rejected. ${data.seats_released || 'Seats'} are now available.`, 
// // // // //           'info');
        
// // // // //         await forceRefreshRideSeats(data.ride_id);
// // // // //       }
// // // // //     });

// // // // //     // Listen for seat availability updates
// // // // //     socket.on('seat-availability-update', async (data) => {
// // // // //       console.log('💺 Seat availability update received:', data);
// // // // //       if (data.ride_id && data.available_seats !== undefined) {
// // // // //         setAvailableRides(prevRides => 
// // // // //           prevRides.map(ride => {
// // // // //             if (ride.id === data.ride_id || String(ride.id) === String(data.ride_id)) {
// // // // //               console.log(`🔄 Updating ride ${data.ride_id}: seats ${ride.seatsAvailable} -> ${data.available_seats}`);
// // // // //               return { 
// // // // //                 ...ride, 
// // // // //                 seatsAvailable: data.available_seats,
// // // // //                 isFull: data.available_seats === 0
// // // // //               };
// // // // //             }
// // // // //             return ride;
// // // // //           })
// // // // //         );
        
// // // // //         await forceRefreshRideSeats(data.ride_id);
// // // // //       }
// // // // //     });

// // // // //     // Listen for booking cancellation events
// // // // //     socket.on('booking-cancelled', async (data) => {
// // // // //       console.log('❌ Booking cancelled event received:', data);
// // // // //       if (data.ride_id) {
// // // // //         showCustomAlert('Booking Cancelled', 
// // // // //           data.message || `A booking was cancelled. Seats may be available.`, 
// // // // //           'info');
        
// // // // //         await forceRefreshRideSeats(data.ride_id);
// // // // //       }
// // // // //     });

// // // // //     // Listen for booking update events
// // // // //     socket.on('booking-update', async (data) => {
// // // // //       console.log('📝 Booking update received:', data);
// // // // //       if (data.ride_id) {
// // // // //         await forceRefreshRideSeats(data.ride_id);
// // // // //       }
// // // // //     });

// // // // //     // Listen for ride status changes
// // // // //     socket.on('ride-update', async (data) => {
// // // // //       console.log('🚗 Ride update received:', data);
// // // // //       if (data.ride_id) {
// // // // //         await forceRefreshRideSeats(data.ride_id);
// // // // //       }
// // // // //     });

// // // // //     // Listen for ride cancelled events
// // // // //     socket.on('ride-cancelled', async (data) => {
// // // // //       console.log('🚫 Ride cancelled event received:', data);
// // // // //       if (data.ride_id) {
// // // // //         setAvailableRides(prevRides => 
// // // // //           prevRides.filter(ride => ride.id !== data.ride_id && String(ride.id) !== String(data.ride_id))
// // // // //         );
        
// // // // //         showCustomAlert('Ride Cancelled', 
// // // // //           data.message || `The ride has been cancelled by the driver.`, 
// // // // //           'warning');
// // // // //       }
// // // // //     });

// // // // //     // Listen for direct seat update events
// // // // //     socket.on('seat-update', async (data) => {
// // // // //       console.log('🎫 Seat update event received:', data);
// // // // //       if (data.available_seats !== undefined) {
// // // // //         setAvailableRides(prevRides => 
// // // // //           prevRides.map(ride => {
// // // // //             if (ride.id === data.ride_id || String(ride.id) === String(data.ride_id)) {
// // // // //               console.log(`🔄 Updating ride ${data.ride_id}: seats ${ride.seatsAvailable} -> ${data.available_seats}`);
// // // // //               return { 
// // // // //                 ...ride, 
// // // // //                 seatsAvailable: data.available_seats,
// // // // //                 isFull: data.available_seats === 0
// // // // //               };
// // // // //             }
// // // // //             return ride;
// // // // //           })
// // // // //         );
// // // // //       }
// // // // //     });

// // // // //     return () => {
// // // // //       if (socketRef.current) {
// // // // //         socketRef.current.disconnect();
// // // // //         socketRef.current = null;
// // // // //       }
// // // // //       joinedRideRooms.current.clear();
// // // // //     };
// // // // //   }, [searchData, user?.phone_number, forceRefreshRideSeats]);

// // // // //   // Handle app state changes (background/foreground)
// // // // //   useEffect(() => {
// // // // //     const subscription = AppState.addEventListener('change', (nextAppState) => {
// // // // //       if (appState.current.match(/inactive|background/) && nextAppState === 'active') {
// // // // //         console.log('📱 App came to foreground - refreshing rides');
// // // // //         refreshAllRides();
// // // // //       }
// // // // //       appState.current = nextAppState;
// // // // //     });

// // // // //     return () => subscription.remove();
// // // // //   }, [refreshAllRides]);

// // // // //   // Setup polling as fallback for real-time updates
// // // // //   useEffect(() => {
// // // // //     if (!searchData) return;

// // // // //     // Poll every 5 seconds to check for seat availability changes
// // // // //     pollingIntervalRef.current = setInterval(() => {
// // // // //       console.log('🔄 Polling for ride updates...');
// // // // //       refreshAllRides();
// // // // //     }, 5000);

// // // // //     return () => {
// // // // //       if (pollingIntervalRef.current) {
// // // // //         clearInterval(pollingIntervalRef.current);
// // // // //         pollingIntervalRef.current = null;
// // // // //       }
// // // // //     };
// // // // //   }, [searchData, refreshAllRides]);

// // // // //   const loadPreferenceData = useCallback(async () => {
// // // // //     try {
// // // // //       const defs = await DatabaseService.getMatchingPreferenceMaster();
// // // // //       setPreferenceMaster(defs || []);

// // // // //       if (phoneNumber) {
// // // // //         const saved = await DatabaseService.getUserMatchingPreferences(phoneNumber);
// // // // //         setUserPreferences(saved || {});
// // // // //       }
// // // // //     } catch (e) {
// // // // //       console.log('❌ preference load error:', e);
// // // // //     }
// // // // //   }, [phoneNumber]);

// // // // //   useEffect(() => {
// // // // //     if (authLoading) return;
// // // // //     fetchAvailableRides();
// // // // //     loadPreferenceData();
// // // // //   }, [authLoading, fetchAvailableRides, loadPreferenceData]);

// // // // //   // Replace your existing useFocusEffect with this:
// // // // //   useFocusEffect(
// // // // //     useCallback(() => {
// // // // //       if (!authLoading && searchData) {
// // // // //         console.log('🔄 Screen focused - FORCE clearing cache and reloading');
        
// // // // //         // CRITICAL: Clear the state completely
// // // // //         setAvailableRides([]);
// // // // //         setLoading(true);
        
// // // // //         // Small delay to ensure state is cleared
// // // // //         setTimeout(() => {
// // // // //           fetchAvailableRides(true);
// // // // //         }, 100);
// // // // //       }
// // // // //     }, [authLoading, searchData])
// // // // //   );
  
// // // // //   const quickFilterOptions = useMemo(() => {
// // // // //     const defs = preferenceMaster.filter(pref => QUICK_FILTER_KEYS.includes(pref.key));
// // // // //     return defs.slice(0, 3).map(pref => ({
// // // // //       key: pref.key,
// // // // //       label: QUICK_FILTER_LABELS[pref.key] || pref.label,
// // // // //     }));
// // // // //   }, [preferenceMaster]);

// // // // //   const advancedFilterOptions = useMemo(() => {
// // // // //     return preferenceMaster.filter(pref => {
// // // // //       if (!pref?.key) return false;
// // // // //       if (quickFilterOptions.some(q => q.key === pref.key)) return false;
// // // // //       return ['toggle', 'single_select'].includes(pref.input_type);
// // // // //     });
// // // // //   }, [preferenceMaster, quickFilterOptions]);

// // // // //   const processedRides = useMemo(() => {
// // // // //     let rides = [...availableRides];

// // // // //     // Filter women-only rides for male passengers
// // // // //     if (userGender !== 'female') {
// // // // //       rides = rides.filter(item => {
// // // // //         const isWomenOnly = item.womenOnly === true;
// // // // //         if (isWomenOnly) {
// // // // //           console.log('🚫 Filtering out women-only ride:', item.id);
// // // // //         }
// // // // //         return !isWomenOnly;
// // // // //       });
// // // // //     }

// // // // //     // Apply quick filters
// // // // //     if (quickFilters.length > 0) {
// // // // //       rides = rides.filter(item =>
// // // // //         quickFilters.every(key => matchesQuickFilter(item, key))
// // // // //       );
// // // // //     }

// // // // //     // Apply advanced filters
// // // // //     const activeAdvanced = Object.entries(advancedFilters).filter(
// // // // //       ([, value]) =>
// // // // //         value !== '' &&
// // // // //         value !== null &&
// // // // //         value !== undefined &&
// // // // //         value !== false
// // // // //     );

// // // // //     if (activeAdvanced.length > 0) {
// // // // //       rides = rides.filter(item =>
// // // // //         activeAdvanced.every(([key, value]) =>
// // // // //           matchesAdvancedFilter(item, key, value)
// // // // //         )
// // // // //       );
// // // // //     }

// // // // //     // Sort rides
// // // // //     rides.sort((a, b) => {
// // // // //       if (sortBy === 'price') return (a.price || 0) - (b.price || 0);
// // // // //       if (sortBy === 'rating') return (b.rating || 0) - (a.rating || 0);
// // // // //       if (sortBy === 'match') return (b.matchPercentage || 0) - (a.matchPercentage || 0);

// // // // //       const aDate = new Date(`${a.date || ''} ${a.time || ''}`);
// // // // //       const bDate = new Date(`${b.date || ''} ${b.time || ''}`);
// // // // //       if (!isNaN(aDate) && !isNaN(bDate)) return aDate - bDate;
// // // // //       return 0;
// // // // //     });

// // // // //     return rides;
// // // // //   }, [availableRides, quickFilters, advancedFilters, sortBy, userGender]);

// // // // // //   // In your SearchScreen.js - when navigating to ride detail
// // // // // // navigation.navigate('RideDetailScreen', {
// // // // // //   ride,
// // // // // //   searchData: {
// // // // // //     fromCoords: [pickupLng, pickupLat],
// // // // // //     toCoords: [dropLng, dropLat],
// // // // // //     fromAddress: pickupAddress,      // ✅ ADD THIS - full address string
// // // // // //     toAddress: dropoffAddress,       // ✅ ADD THIS - full address string
// // // // // //     fromPlaceName: pickupName,       // ✅ ADD THIS - short name/landmark
// // // // // //     toPlaceName: dropoffName,        // ✅ ADD THIS - short name/landmark
// // // // // //     date: searchDate,
// // // // // //     time: searchTime,
// // // // // //     seats: seatCount
// // // // // //   }
// // // // // // });
// // // // // // Add this function in RideNextScreen component
// // // // // const handleCardPress = (ride) => {
// // // // //   // Get addresses from your searchData state
// // // // //   const pickupAddress = searchData?.fromAddress || ride.from || '';
// // // // //   const dropoffAddress = searchData?.toAddress || ride.to || '';
// // // // //   const pickupPlaceName = searchData?.fromPlaceName || ride.pickupLabel || ride.from?.split(',')[0] || '';
// // // // //   const dropoffPlaceName = searchData?.toPlaceName || ride.dropLabel || ride.to?.split(',')[0] || '';
  
// // // // //   navigation.navigate('RideDetailScreen', {
// // // // //     ride: ride,
// // // // //     searchData: {
// // // // //       fromCoords: fromCoords,        // From your state
// // // // //       toCoords: toCoords,            // From your state
// // // // //       fromAddress: pickupAddress,    // ✅ ADD THIS
// // // // //       toAddress: dropoffAddress,     // ✅ ADD THIS
// // // // //       fromPlaceName: pickupPlaceName, // ✅ ADD THIS
// // // // //       toPlaceName: dropoffPlaceName,  // ✅ ADD THIS
// // // // //       date: dateTime,
// // // // //       time: new Date(dateTime).toLocaleTimeString(),
// // // // //       seats: requestedSeats
// // // // //     }
// // // // //   });
// // // // // };
// // // // //   const handleProfileImagePress = (imageUrl, driverName) => {
// // // // //     setSelectedProfile({
// // // // //       visible: true,
// // // // //       imageUrl: imageUrl,
// // // // //       driverName: driverName,
// // // // //     });
// // // // //   };

// // // // //   const toggleQuickFilter = (key) => {
// // // // //     setQuickFilters(prev =>
// // // // //       prev.includes(key) ? prev.filter(i => i !== key) : [...prev, key]
// // // // //     );
// // // // //   };

// // // // //   const clearAllFilters = () => {
// // // // //     setQuickFilters([]);
// // // // //     setAdvancedFilters({});
// // // // //     showCustomAlert('Filters Cleared', 'All filters have been reset.', 'info');
// // // // //   };

// // // // //   const onRefresh = useCallback(() => {
// // // // //     refreshAllRides();
// // // // //   }, [refreshAllRides]);

// // // // //   const renderAdvancedFilterControl = (pref) => {
// // // // //     const currentValue = advancedFilters[pref.key];

// // // // //     if (pref.input_type === 'toggle') {
// // // // //       const active = !!currentValue;
// // // // //       return (
// // // // //         <TouchableOpacity
// // // // //           activeOpacity={0.85}
// // // // //           style={[styles.modalToggleChip, active && styles.modalToggleChipActive]}
// // // // //           onPress={() =>
// // // // //             setAdvancedFilters(prev => ({ ...prev, [pref.key]: !active }))
// // // // //           }
// // // // //         >
// // // // //           <Text
// // // // //             style={[
// // // // //               styles.modalToggleChipText,
// // // // //               active && styles.modalToggleChipTextActive,
// // // // //             ]}
// // // // //           >
// // // // //             {pref.label}
// // // // //           </Text>
// // // // //         </TouchableOpacity>
// // // // //       );
// // // // //     }

// // // // //     if (pref.input_type === 'single_select' && Array.isArray(pref.options)) {
// // // // //       return (
// // // // //         <View style={styles.modalOptionWrap}>
// // // // //           {pref.options.map((opt) => {
// // // // //             const active = currentValue === opt;
// // // // //             return (
// // // // //               <TouchableOpacity
// // // // //                 key={opt}
// // // // //                 activeOpacity={0.85}
// // // // //                 style={[
// // // // //                   styles.modalOptionChip,
// // // // //                   active && styles.modalOptionChipActive,
// // // // //                 ]}
// // // // //                 onPress={() =>
// // // // //                   setAdvancedFilters(prev => ({
// // // // //                     ...prev,
// // // // //                     [pref.key]: active ? '' : opt,
// // // // //                   }))
// // // // //                 }
// // // // //               >
// // // // //                 <Text
// // // // //                   style={[
// // // // //                     styles.modalOptionChipText,
// // // // //                     active && styles.modalOptionChipTextActive,
// // // // //                   ]}
// // // // //                 >
// // // // //                   {opt}
// // // // //                 </Text>
// // // // //               </TouchableOpacity>
// // // // //             );
// // // // //           })}
// // // // //         </View>
// // // // //       );
// // // // //     }

// // // // //     return null;
// // // // //   };

// // // // //   const renderRideCard = ({ item }) => {
// // // // //     let profilePhotoUrl = null;
// // // // //     let isSvg = false;
    
// // // // //     if (item.profilePicture) {
// // // // //       profilePhotoUrl = buildImageUrl(item.profilePicture);
// // // // //     } else if (item.profilepicture) {
// // // // //       profilePhotoUrl = buildImageUrl(item.profilepicture);
// // // // //     } else if (item.profilePhoto) {
// // // // //       profilePhotoUrl = buildImageUrl(item.profilePhoto);
// // // // //     } else if (item.driverProfilePicture) {
// // // // //       profilePhotoUrl = buildImageUrl(item.driverProfilePicture);
// // // // //     } else if (item.driver?.profile_picture) {
// // // // //       profilePhotoUrl = buildImageUrl(item.driver.profile_picture);
// // // // //     } else if (item.user?.profile_picture) {
// // // // //       profilePhotoUrl = buildImageUrl(item.user.profile_picture);
// // // // //     }
    
// // // // //     if (profilePhotoUrl && profilePhotoUrl.toLowerCase().includes('.svg')) {
// // // // //       isSvg = true;
// // // // //     }
    
// // // // //     const driverNameText = item.driverName || item.driver_name || item.driver?.full_name || 'Driver';
// // // // //     const avatarText = getDriverInitials(driverNameText);

// // // // //     let vehicleLabel = 'Vehicle details unavailable';
// // // // //     if (item.vehicle) {
// // // // //       const vehicleParts = [];
// // // // //       if (item.vehicle.model) vehicleParts.push(item.vehicle.model);
// // // // //       if (item.vehicle.color && vehicleParts.length > 0) {
// // // // //         vehicleLabel = `${vehicleParts.join(' ')} - ${item.vehicle.color}`;
// // // // //       } else if (item.vehicle.color) {
// // // // //         vehicleLabel = item.vehicle.color;
// // // // //       } else if (vehicleParts.length > 0) {
// // // // //         vehicleLabel = vehicleParts.join(' ');
// // // // //       }
// // // // //     } else if (item.vehicleModel) {
// // // // //       vehicleLabel = item.vehicleModel;
// // // // //       if (item.vehicleColor) {
// // // // //         vehicleLabel = `${item.vehicleModel} - ${item.vehicleColor}`;
// // // // //       }
// // // // //     }

// // // // //     const preferenceBadges = extractPreferenceBadges(item);
// // // // //     const isDriverVerified = item.isVerified;
// // // // //     const driverRating = item.rating || 0;

// // // // //     const pickupName = item.pickupLabel || item.from || 'Pickup point';
// // // // //     const dropName = item.dropLabel || item.to || 'Drop point';
    
// // // // //     const seatsAvailable = item.seatsAvailable || 0;
// // // // //     const isSeatsInsufficient = requestedSeats > seatsAvailable && seatsAvailable > 0;
// // // // //     const isFull = seatsAvailable === 0;
// // // // //     const canBook = !isFull && seatsAvailable >= requestedSeats;

// // // // //     return (
// // // // //       <TouchableOpacity
// // // // //         style={[styles.rideCard, !canBook && !isFull && styles.rideCardWarning, isFull && styles.rideCardFull]}
// // // // //         onPress={() => handleCardPress(item)}
// // // // //         activeOpacity={0.9}
// // // // //       >
// // // // //         <View style={styles.cardTopRow}>
// // // // //           <View style={styles.profileRow}>
// // // // //             <TouchableOpacity
// // // // //               // onPress={() => handleProfileImagePress(profilePhotoUrl, driverNameText)}
// // // // //               onPress={() => handleCardPress(item)}
// // // // //               activeOpacity={0.8}
// // // // //             >
// // // // //               <View style={styles.avatarContainer}>
// // // // //                 {profilePhotoUrl ? (
// // // // //                   isSvg ? (
// // // // //                     <View style={styles.svgContainer}>
// // // // //                       <SvgCssUri
// // // // //                         uri={profilePhotoUrl}
// // // // //                         width="48"
// // // // //                         height="48"
// // // // //                       />
// // // // //                     </View>
// // // // //                   ) : (
// // // // //                     <Image
// // // // //                       source={{ uri: profilePhotoUrl }}
// // // // //                       style={styles.avatarImage}
// // // // //                       resizeMode="cover"
// // // // //                     />
// // // // //                   )
// // // // //                 ) : (
// // // // //                   <View style={styles.initialsContainer}>
// // // // //                     <Text style={styles.avatarFallback}>{avatarText}</Text>
// // // // //                   </View>
// // // // //                 )}
// // // // //               </View>
// // // // //             </TouchableOpacity>

// // // // //             <View style={styles.profileContent}>
// // // // //               <View style={styles.nameRow}>
// // // // //                 <Text style={styles.driverName} numberOfLines={1}>
// // // // //                   {driverNameText}
// // // // //                 </Text>

// // // // //                 {isDriverVerified && (
// // // // //                   <View style={styles.verifiedBadge}>
// // // // //                     <Ionicons name="checkmark-circle" size={14} color="#16A34A" />
// // // // //                     <Text style={styles.verifiedText}>Verified</Text>
// // // // //                   </View>
// // // // //                 )}

// // // // //                 {item.womenOnly === true && (
// // // // //                   <View style={styles.womenOnlyBadge}>
// // // // //                     <Ionicons name="woman" size={12} color="#E91E63" />
// // // // //                     <Text style={styles.womenOnlyBadgeText}>Women Only</Text>
// // // // //                   </View>
// // // // //                 )}
                
// // // // //                 {isFull && (
// // // // //                   <View style={styles.fullBadge}>
// // // // //                     <Ionicons name="close-circle" size={12} color="#EF4444" />
// // // // //                     <Text style={styles.fullBadgeText}>Full</Text>
// // // // //                   </View>
// // // // //                 )}
// // // // //               </View>

// // // // //               <View style={styles.ratingRow}>
// // // // //                 <RatingStars rating={driverRating} size={12} showLabel={true} />
// // // // //               </View>
// // // // //             </View>
// // // // //           </View>

// // // // //           <View style={styles.priceMatchWrap}>
// // // // //             <View style={styles.matchBadge}>
// // // // //               <Text style={styles.matchText}>{item.matchPercentage || 0}%</Text>
// // // // //             </View>
// // // // //             <Text style={styles.priceText}>₹{item.price}</Text>
// // // // //             <Text style={styles.perSeatText}>per seat</Text>
// // // // //           </View>
// // // // //         </View>

// // // // //         <View style={styles.infoRow}>
// // // // //           <View style={styles.infoItem}>
// // // // //             <Ionicons name="calendar-outline" size={13} color={Colors.gray} />
// // // // //             <Text style={styles.infoText} numberOfLines={1}>{item.date}</Text>
// // // // //           </View>
// // // // //           <View style={styles.infoDot} />
// // // // //           <View style={styles.infoItem}>
// // // // //             <Ionicons name="time-outline" size={13} color={Colors.gray} />
// // // // //             <Text style={styles.infoText} numberOfLines={1}>{item.time}</Text>
// // // // //           </View>
// // // // //           <View style={styles.infoDot} />
// // // // //           <View style={styles.infoItem}>
// // // // //             <Ionicons name="people-outline" size={13} color={Colors.gray} />
// // // // //             <Text style={[
// // // // //               styles.infoText, 
// // // // //               isFull ? styles.fullText : (isSeatsInsufficient && styles.warningText)
// // // // //             ]} numberOfLines={1}>
// // // // //               {isFull ? 'Ride Full' : `${seatsAvailable} left`}
// // // // //             </Text>
// // // // //           </View>
// // // // //         </View>

// // // // //         {isFull && (
// // // // //           <View style={styles.fullWarningContainer}>
// // // // //             <Ionicons name="close-circle" size={14} color="#EF4444" />
// // // // //             <Text style={styles.fullWarningText}>
// // // // //               This ride is currently full. Check back later or try another ride.
// // // // //             </Text>
// // // // //           </View>
// // // // //         )}

// // // // //         {!isFull && isSeatsInsufficient && seatsAvailable > 0 && (
// // // // //           <View style={styles.seatWarningContainer}>
// // // // //             <Ionicons name="warning" size={14} color="#D97706" />
// // // // //             <Text style={styles.seatWarningText}>
// // // // //               Only {seatsAvailable} seat{seatsAvailable !== 1 ? 's' : ''} left. You requested {requestedSeats} seat{requestedSeats !== 1 ? 's' : ''}.
// // // // //             </Text>
// // // // //           </View>
// // // // //         )}

// // // // //         <View style={styles.divider} />

// // // // //         <View style={styles.routeBlock}>
// // // // //           <View style={styles.routeRow}>
// // // // //             <View style={[styles.routeDot, { backgroundColor: '#22C55E' }]} />
// // // // //             <View style={styles.routeTextWrap}>
// // // // //               <Text style={styles.routeLabel}>Pickup</Text>
// // // // //               <Text style={styles.routeText} numberOfLines={2}>{pickupName}</Text>
// // // // //             </View>
// // // // //           </View>
// // // // //           <View style={styles.routeRow}>
// // // // //             <View style={[styles.routeDot, { backgroundColor: '#F97316' }]} />
// // // // //             <View style={styles.routeTextWrap}>
// // // // //               <Text style={styles.routeLabel}>Drop</Text>
// // // // //               <Text style={styles.routeText} numberOfLines={2}>{dropName}</Text>
// // // // //             </View>
// // // // //           </View>
// // // // //         </View>

// // // // //         <View style={styles.vehicleRow}>
// // // // //           <Ionicons name="car-sport-outline" size={14} color={Colors.gray} />
// // // // //           <Text style={styles.vehicleText} numberOfLines={1}>{vehicleLabel}</Text>
// // // // //         </View>

// // // // //         {preferenceBadges.length > 0 && (
// // // // //           <ScrollView
// // // // //             horizontal
// // // // //             showsHorizontalScrollIndicator={false}
// // // // //             contentContainerStyle={styles.badgeScroll}
// // // // //           >
// // // // //             {preferenceBadges.map((badge, index) => (
// // // // //               <PreferenceTag key={`${badge}-${index}`} label={badge} />
// // // // //             ))}
// // // // //           </ScrollView>
// // // // //         )}
// // // // //       </TouchableOpacity>
// // // // //     );
// // // // //   };

// // // // //   if (authLoading || loading) {
// // // // //     return (
// // // // //       <View style={styles.loadingContainer}>
// // // // //         <LottieView
// // // // //           source={require("../assets/loading.json")}
// // // // //           autoPlay
// // // // //           loop
// // // // //           style={{ width: 300, height: 300 }}
// // // // //         />
// // // // //       </View>
// // // // //     );
// // // // //   }

// // // // //   return (
// // // // //     <SafeAreaView style={styles.container}>
// // // // //       <StatusBar barStyle="dark-content" backgroundColor={Colors.white} />

// // // // //       <View style={styles.header}>
// // // // //         <TouchableOpacity
// // // // //           style={styles.backButton}
// // // // //           onPress={() => navigation.goBack()}
// // // // //         >
// // // // //           <MaterialIcons name="arrow-back-ios" size={24} color="#ED7117" />
// // // // //         </TouchableOpacity>

// // // // //         <Text style={styles.headerTitle}>Available Rides</Text>

// // // // //         <TouchableOpacity
// // // // //           style={[
// // // // //             styles.filterButton,
// // // // //             headerFiltersVisible && styles.filterButtonActive
// // // // //           ]}
// // // // //           onPress={() => setHeaderFiltersVisible(prev => !prev)}
// // // // //         >
// // // // //           <Ionicons name="options-outline" size={22} color="#ED7117" />
// // // // //         </TouchableOpacity>
// // // // //       </View>

// // // // //       {headerFiltersVisible ? (
// // // // //         <View style={styles.topControlsWrap}>
// // // // //           <ScrollView
// // // // //             horizontal
// // // // //             showsHorizontalScrollIndicator={false}
// // // // //             contentContainerStyle={styles.filterScroll}
// // // // //           >
// // // // //             {quickFilterOptions.map((filter) => {
// // // // //               const active = quickFilters.includes(filter.key);
// // // // //               return (
// // // // //                 <TouchableOpacity
// // // // //                   key={filter.key}
// // // // //                   activeOpacity={0.85}
// // // // //                   style={[styles.quickChip, active && styles.quickChipActive]}
// // // // //                   onPress={() => toggleQuickFilter(filter.key)}
// // // // //                 >
// // // // //                   <Text
// // // // //                     style={[
// // // // //                       styles.quickChipText,
// // // // //                       active && styles.quickChipTextActive,
// // // // //                     ]}
// // // // //                   >
// // // // //                     {filter.label}
// // // // //                   </Text>
// // // // //                 </TouchableOpacity>
// // // // //               );
// // // // //             })}

// // // // //             <TouchableOpacity
// // // // //               activeOpacity={0.85}
// // // // //               style={styles.moreFilterChip}
// // // // //               onPress={() => setFilterModalVisible(true)}
// // // // //             >
// // // // //               <Ionicons name="options-outline" size={14} color="#ED7117" />
// // // // //               <Text style={styles.moreFilterChipText}>More Filters</Text>
// // // // //             </TouchableOpacity>
// // // // //           </ScrollView>

// // // // //           <Text style={styles.sortLabel}>Sort by</Text>

// // // // //           <ScrollView
// // // // //             horizontal
// // // // //             showsHorizontalScrollIndicator={false}
// // // // //             contentContainerStyle={styles.sortScroll}
// // // // //           >
// // // // //             {SORT_OPTIONS.map((option) => {
// // // // //               const active = sortBy === option.key;
// // // // //               return (
// // // // //                 <TouchableOpacity
// // // // //                   key={option.key}
// // // // //                   activeOpacity={0.85}
// // // // //                   style={[styles.sortChip, active && styles.sortChipActive]}
// // // // //                   onPress={() => setSortBy(option.key)}
// // // // //                 >
// // // // //                   <Text
// // // // //                     style={[
// // // // //                       styles.sortChipText,
// // // // //                       active && styles.sortChipTextActive,
// // // // //                     ]}
// // // // //                   >
// // // // //                     {option.label}
// // // // //                   </Text>
// // // // //                 </TouchableOpacity>
// // // // //               );
// // // // //             })}
// // // // //           </ScrollView>
// // // // //         </View>
// // // // //       ) : null}

// // // // //       {processedRides.length === 0 ? (
// // // // //         <View style={styles.emptyContainer}>
// // // // //           <Ionicons name="car-outline" size={80} color={Colors.gray} />
// // // // //           <Text style={styles.emptyTitle}>No Rides Found</Text>
// // // // //           <Text style={styles.emptySubtitle}>
// // // // //             {errorMessage
// // // // //               ? errorMessage
// // // // //               : 'Try changing your filters or search again.'}
// // // // //           </Text>

// // // // //           <TouchableOpacity style={styles.clearButton} onPress={clearAllFilters}>
// // // // //             <Text style={styles.clearButtonText}>Clear Filters</Text>
// // // // //           </TouchableOpacity>
// // // // //         </View>
// // // // //       ) : (
// // // // //         <FlatList
// // // // //           data={processedRides}
// // // // //           renderItem={renderRideCard}
// // // // //           keyExtractor={(item) => String(item.id)}
// // // // //           contentContainerStyle={styles.listContent}
// // // // //           showsVerticalScrollIndicator={false}
// // // // //           refreshControl={
// // // // //             <RefreshControl
// // // // //               refreshing={refreshing}
// // // // //               onRefresh={onRefresh}
// // // // //               colors={[Colors.primary]}
// // // // //               tintColor={Colors.primary}
// // // // //             />
// // // // //           }
// // // // //           ItemSeparatorComponent={() => <View style={{ height: 12 }} />}
// // // // //         />
// // // // //       )}

// // // // //       <Modal
// // // // //         visible={filterModalVisible}
// // // // //         transparent
// // // // //         animationType="slide"
// // // // //         onRequestClose={() => setFilterModalVisible(false)}
// // // // //       >
// // // // //         <View style={styles.modalBackdrop}>
// // // // //           <TouchableOpacity
// // // // //             style={styles.modalOverlay}
// // // // //             activeOpacity={1}
// // // // //             onPress={() => setFilterModalVisible(false)}
// // // // //           />

// // // // //           <View style={styles.modalSheet}>
// // // // //             <View style={styles.modalHandle} />

// // // // //             <View style={styles.modalHeader}>
// // // // //               <Text style={styles.modalTitle}>More Filters</Text>
// // // // //               <TouchableOpacity onPress={() => setFilterModalVisible(false)}>
// // // // //                 <Ionicons name="close" size={24} color={Colors.dark} />
// // // // //               </TouchableOpacity>
// // // // //             </View>

// // // // //             <ScrollView
// // // // //               showsVerticalScrollIndicator={false}
// // // // //               contentContainerStyle={styles.modalContent}
// // // // //             >
// // // // //               {advancedFilterOptions.map((pref) => (
// // // // //                 <View key={pref.key} style={styles.modalSection}>
// // // // //                   <Text style={styles.modalSectionTitle}>{pref.label}</Text>
// // // // //                   {renderAdvancedFilterControl(pref)}
// // // // //                 </View>
// // // // //               ))}
// // // // //             </ScrollView>

// // // // //             <View style={styles.modalFooter}>
// // // // //               <TouchableOpacity
// // // // //                 style={styles.modalSecondaryBtn}
// // // // //                 onPress={clearAllFilters}
// // // // //               >
// // // // //                 <Text style={styles.modalSecondaryBtnText}>Clear</Text>
// // // // //               </TouchableOpacity>

// // // // //               <TouchableOpacity
// // // // //                 style={styles.modalPrimaryBtn}
// // // // //                 onPress={() => setFilterModalVisible(false)}
// // // // //               >
// // // // //                 <Text style={styles.modalPrimaryBtnText}>Apply Filters</Text>
// // // // //               </TouchableOpacity>
// // // // //             </View>
// // // // //           </View>
// // // // //         </View>
// // // // //       </Modal>

// // // // //       <ProfileImageModal
// // // // //         visible={selectedProfile.visible}
// // // // //         imageUrl={selectedProfile.imageUrl}
// // // // //         driverName={selectedProfile.driverName}
// // // // //         onClose={() => setSelectedProfile({ visible: false, imageUrl: null, driverName: '' })}
// // // // //       />

// // // // //       <CustomAlert
// // // // //         visible={alertVisible}
// // // // //         title={alertConfig.title}
// // // // //         message={alertConfig.message}
// // // // //         icon={alertConfig.icon}
// // // // //         iconColor={alertConfig.iconColor}
// // // // //         buttons={alertConfig.buttons}
// // // // //         onBackdropPress={() => setAlertVisible(false)}
// // // // //       />
// // // // //     </SafeAreaView>
// // // // //   );
// // // // // }

// // // // // const styles = StyleSheet.create({
// // // // //   container: {
// // // // //     flex: 1,
// // // // //     backgroundColor: '#fff',
// // // // //   },
// // // // //   header: {
// // // // //     flexDirection: 'row',
// // // // //     alignItems: 'center',
// // // // //     paddingHorizontal: 16,
// // // // //     paddingVertical: 12,
// // // // //     borderBottomWidth: 0.5,
// // // // //     borderBottomColor: '#fff',
// // // // //     backgroundColor: Colors.white,
// // // // //   },
// // // // //   backButton: {
// // // // //     width: 44,
// // // // //     height: 44,
// // // // //     justifyContent: 'center',
// // // // //   },
// // // // //   filterButton: {
// // // // //     width: 44,
// // // // //     height: 44,
// // // // //     justifyContent: 'center',
// // // // //     alignItems: 'center',
// // // // //     borderRadius: 22,
// // // // //   },
// // // // //   filterButtonActive: {
// // // // //     backgroundColor: '#fff',
// // // // //   },
// // // // //   headerTitle: {
// // // // //     ...Typography.h2,
// // // // //     fontSize: 28,
// // // // //     fontWeight: '700',
// // // // //     color: Colors.primary,
// // // // //     flex: 1,
// // // // //     textAlign: 'center',
// // // // //   },
// // // // //   topControlsWrap: {
// // // // //     backgroundColor: Colors.white,
// // // // //     paddingTop: 10,
// // // // //     paddingBottom: 12,
// // // // //     borderBottomWidth: 1,
// // // // //     borderBottomColor: '#EEF2F7',
// // // // //   },
// // // // //   filterScroll: {
// // // // //     paddingHorizontal: 16,
// // // // //     gap: 10,
// // // // //   },
// // // // //   quickChip: {
// // // // //     paddingHorizontal: 14,
// // // // //     paddingVertical: 10,
// // // // //     borderRadius: 20,
// // // // //     backgroundColor: '#F3F4F6',
// // // // //   },
// // // // //   quickChipActive: {
// // // // //     backgroundColor: Colors.primary,
// // // // //   },
// // // // //   quickChipText: {
// // // // //     fontSize: 12,
// // // // //     fontWeight: '600',
// // // // //     color: Colors.dark,
// // // // //   },
// // // // //   quickChipTextActive: {
// // // // //     color: Colors.white,
// // // // //   },
// // // // //   moreFilterChip: {
// // // // //     flexDirection: 'row',
// // // // //     alignItems: 'center',
// // // // //     gap: 6,
// // // // //     paddingHorizontal: 14,
// // // // //     paddingVertical: 10,
// // // // //     borderRadius: 20,
// // // // //     backgroundColor: '#EEF6FF',
// // // // //   },
// // // // //   moreFilterChipText: {
// // // // //     fontSize: 12,
// // // // //     fontWeight: '700',
// // // // //     color: '#ED7117',
// // // // //   },
// // // // //   sortLabel: {
// // // // //     paddingHorizontal: 16,
// // // // //     marginTop: 12,
// // // // //     marginBottom: 8,
// // // // //     fontSize: 12,
// // // // //     color: Colors.gray,
// // // // //     fontWeight: '700',
// // // // //   },
// // // // //   sortScroll: {
// // // // //     paddingHorizontal: 16,
// // // // //     gap: 10,
// // // // //   },
// // // // //   sortChip: {
// // // // //     paddingHorizontal: 14,
// // // // //     paddingVertical: 8,
// // // // //     borderRadius: 14,
// // // // //     backgroundColor: '#F3F4F6',
// // // // //   },
// // // // //   sortChipActive: {
// // // // //     backgroundColor: '#ED7117',
// // // // //   },
// // // // //   sortChipText: {
// // // // //     fontSize: 12,
// // // // //     color: Colors.dark,
// // // // //     fontWeight: '600',
// // // // //   },
// // // // //   sortChipTextActive: {
// // // // //     color: Colors.white,
// // // // //   },
// // // // //   listContent: {
// // // // //     padding: 16,
// // // // //     paddingBottom: 28,
// // // // //   },
// // // // //   rideCard: {
// // // // //     backgroundColor: Colors.white,
// // // // //     borderRadius: 18,
// // // // //     padding: 14,
// // // // //     borderWidth: 1,
// // // // //     borderColor: '#EEF2F7',
// // // // //     shadowColor: '#0F172A',
// // // // //     shadowOffset: { width: 0, height: 6 },
// // // // //     shadowOpacity: 0.05,
// // // // //     shadowRadius: 14,
// // // // //     elevation: 2,
// // // // //   },
// // // // //   rideCardWarning: {
// // // // //     backgroundColor: '#FFFBEB',
// // // // //     borderColor: '#FDE68A',
// // // // //   },
// // // // //   rideCardFull: {
// // // // //     backgroundColor: '#FEF2F2',
// // // // //     borderColor: '#FEE2E2',
// // // // //     opacity: 0.85,
// // // // //   },
// // // // //   cardTopRow: {
// // // // //     flexDirection: 'row',
// // // // //     justifyContent: 'space-between',
// // // // //     alignItems: 'flex-start',
// // // // //   },
// // // // //   profileRow: {
// // // // //     flexDirection: 'row',
// // // // //     flex: 1,
// // // // //     paddingRight: 10,
// // // // //   },
// // // // //   avatarContainer: {
// // // // //     width: 48,
// // // // //     height: 48,
// // // // //     borderRadius: 24,
// // // // //     backgroundColor: '#E5E7EB',
// // // // //     alignItems: 'center',
// // // // //     justifyContent: 'center',
// // // // //     overflow: 'hidden',
// // // // //     marginRight: 10,
// // // // //   },
// // // // //   avatarImage: {
// // // // //     width: 48,
// // // // //     height: 48,
// // // // //   },
// // // // //   avatarFallback: {
// // // // //     fontSize: 14,
// // // // //     fontWeight: '800',
// // // // //     color: Colors.gray,
// // // // //   },
// // // // //   profileContent: {
// // // // //     flex: 1,
// // // // //   },
// // // // //   nameRow: {
// // // // //     flexDirection: 'row',
// // // // //     alignItems: 'center',
// // // // //     flexWrap: 'wrap',
// // // // //     gap: 6,
// // // // //   },
// // // // //   driverName: {
// // // // //     fontSize: 15,
// // // // //     fontWeight: '800',
// // // // //     color: Colors.dark,
// // // // //     maxWidth: '100%',
// // // // //   },
// // // // //   verifiedBadge: {
// // // // //     flexDirection: 'row',
// // // // //     alignItems: 'center',
// // // // //     gap: 4,
// // // // //     backgroundColor: '#E8F5E9',
// // // // //     paddingHorizontal: 6,
// // // // //     paddingVertical: 2,
// // // // //     borderRadius: 12,
// // // // //   },
// // // // //   verifiedText: {
// // // // //     fontSize: 10,
// // // // //     fontWeight: '700',
// // // // //     color: '#16A34A',
// // // // //   },
// // // // //   womenOnlyBadge: {
// // // // //     flexDirection: 'row',
// // // // //     alignItems: 'center',
// // // // //     gap: 4,
// // // // //     backgroundColor: '#FCE4EC',
// // // // //     paddingHorizontal: 8,
// // // // //     paddingVertical: 3,
// // // // //     borderRadius: 12,
// // // // //   },
// // // // //   womenOnlyBadgeText: {
// // // // //     fontSize: 10,
// // // // //     color: '#E91E63',
// // // // //     fontWeight: '700',
// // // // //   },
// // // // //   fullBadge: {
// // // // //     flexDirection: 'row',
// // // // //     alignItems: 'center',
// // // // //     gap: 4,
// // // // //     backgroundColor: '#FEF2F2',
// // // // //     paddingHorizontal: 8,
// // // // //     paddingVertical: 3,
// // // // //     borderRadius: 12,
// // // // //     borderWidth: 1,
// // // // //     borderColor: '#FEE2E2',
// // // // //   },
// // // // //   fullBadgeText: {
// // // // //     fontSize: 10,
// // // // //     color: '#EF4444',
// // // // //     fontWeight: '700',
// // // // //   },
// // // // //   ratingRow: {
// // // // //     flexDirection: 'row',
// // // // //     alignItems: 'center',
// // // // //     marginTop: 4,
// // // // //   },
// // // // //   ratingText: {
// // // // //     fontSize: 11,
// // // // //     color: Colors.gray,
// // // // //     fontWeight: '600',
// // // // //   },
// // // // //   priceMatchWrap: {
// // // // //     alignItems: 'flex-end',
// // // // //   },
// // // // //   matchBadge: {
// // // // //     backgroundColor: '#EEF6FF',
// // // // //     paddingHorizontal: 8,
// // // // //     paddingVertical: 4,
// // // // //     borderRadius: 10,
// // // // //     marginBottom: 6,
// // // // //   },
// // // // //   matchText: {
// // // // //     fontSize: 12,
// // // // //     fontWeight: '800',
// // // // //     color: Colors.primary,
// // // // //   },
// // // // //   priceText: {
// // // // //     fontSize: 18,
// // // // //     fontWeight: '800',
// // // // //     color: '#ED7117',
// // // // //     lineHeight: 20,
// // // // //   },
// // // // //   perSeatText: {
// // // // //     fontSize: 10,
// // // // //     color: Colors.gray,
// // // // //     fontWeight: '600',
// // // // //     marginTop: 2,
// // // // //   },
// // // // //   infoRow: {
// // // // //     flexDirection: 'row',
// // // // //     alignItems: 'center',
// // // // //     flexWrap: 'wrap',
// // // // //     marginTop: 12,
// // // // //     marginBottom: 10,
// // // // //   },
// // // // //   infoItem: {
// // // // //     flexDirection: 'row',
// // // // //     alignItems: 'center',
// // // // //     gap: 4,
// // // // //   },
// // // // //   infoText: {
// // // // //     fontSize: 12,
// // // // //     color: Colors.dark,
// // // // //     fontWeight: '600',
// // // // //   },
// // // // //   warningText: {
// // // // //     color: '#F59E0B',
// // // // //   },
// // // // //   fullText: {
// // // // //     color: '#EF4444',
// // // // //   },
// // // // //   infoDot: {
// // // // //     width: 4,
// // // // //     height: 4,
// // // // //     borderRadius: 2,
// // // // //     backgroundColor: '#CBD5E1',
// // // // //     marginHorizontal: 8,
// // // // //   },
// // // // //   seatWarningContainer: {
// // // // //     flexDirection: 'row',
// // // // //     alignItems: 'center',
// // // // //     backgroundColor: '#FEF3C7',
// // // // //     borderRadius: 8,
// // // // //     padding: 8,
// // // // //     marginTop: 8,
// // // // //     marginBottom: 4,
// // // // //     gap: 6,
// // // // //   },
// // // // //   seatWarningText: {
// // // // //     flex: 1,
// // // // //     fontSize: 11,
// // // // //     color: '#D97706',
// // // // //     fontWeight: '600',
// // // // //   },
// // // // //   fullWarningContainer: {
// // // // //     flexDirection: 'row',
// // // // //     alignItems: 'center',
// // // // //     backgroundColor: '#FEF2F2',
// // // // //     borderRadius: 8,
// // // // //     padding: 8,
// // // // //     marginTop: 8,
// // // // //     marginBottom: 4,
// // // // //     borderWidth: 1,
// // // // //     borderColor: '#FEE2E2',
// // // // //     gap: 6,
// // // // //   },
// // // // //   fullWarningText: {
// // // // //     flex: 1,
// // // // //     fontSize: 11,
// // // // //     color: '#EF4444',
// // // // //     fontWeight: '600',
// // // // //   },
// // // // //   divider: {
// // // // //     height: 1,
// // // // //     backgroundColor: '#EEF2F7',
// // // // //     marginBottom: 10,
// // // // //   },
// // // // //   routeBlock: {
// // // // //     gap: 8,
// // // // //   },
// // // // //   routeRow: {
// // // // //     flexDirection: 'row',
// // // // //     alignItems: 'flex-start',
// // // // //   },
// // // // //   routeDot: {
// // // // //     width: 8,
// // // // //     height: 8,
// // // // //     borderRadius: 4,
// // // // //     marginTop: 5,
// // // // //     marginRight: 8,
// // // // //   },
// // // // //   routeTextWrap: {
// // // // //     flex: 1,
// // // // //   },
// // // // //   routeLabel: {
// // // // //     fontSize: 11,
// // // // //     color: Colors.gray,
// // // // //     fontWeight: '700',
// // // // //     marginBottom: 2,
// // // // //   },
// // // // //   routeText: {
// // // // //     fontSize: 13,
// // // // //     color: Colors.dark,
// // // // //     fontWeight: '600',
// // // // //     lineHeight: 18,
// // // // //   },
// // // // //   vehicleRow: {
// // // // //     flexDirection: 'row',
// // // // //     alignItems: 'center',
// // // // //     gap: 6,
// // // // //     marginTop: 10,
// // // // //   },
// // // // //   vehicleText: {
// // // // //     fontSize: 12,
// // // // //     color: Colors.gray,
// // // // //     fontWeight: '600',
// // // // //     flex: 1,
// // // // //   },
// // // // //   badgeScroll: {
// // // // //     gap: 8,
// // // // //     paddingTop: 10,
// // // // //   },
// // // // //   prefBadge: {
// // // // //     paddingHorizontal: 10,
// // // // //     paddingVertical: 6,
// // // // //     borderRadius: 12,
// // // // //     marginRight: 8,
// // // // //   },
// // // // //   prefBadgeText: {
// // // // //     fontSize: 11,
// // // // //     fontWeight: '700',
// // // // //   },
// // // // //   loadingContainer: {
// // // // //     flex: 1,
// // // // //     justifyContent: 'center',
// // // // //     alignItems: 'center',
// // // // //     backgroundColor: Colors.white,
// // // // //   },
// // // // //   emptyContainer: {
// // // // //     flex: 1,
// // // // //     justifyContent: 'center',
// // // // //     alignItems: 'center',
// // // // //     paddingHorizontal: 40,
// // // // //   },
// // // // //   emptyTitle: {
// // // // //     fontSize: 22,
// // // // //     fontWeight: '700',
// // // // //     color: Colors.dark,
// // // // //     marginTop: 20,
// // // // //     marginBottom: 8,
// // // // //   },
// // // // //   emptySubtitle: {
// // // // //     fontSize: 15,
// // // // //     color: Colors.gray,
// // // // //     textAlign: 'center',
// // // // //     lineHeight: 22,
// // // // //     marginBottom: 24,
// // // // //   },
// // // // //   clearButton: {
// // // // //     backgroundColor: Colors.primary,
// // // // //     paddingHorizontal: 24,
// // // // //     paddingVertical: 12,
// // // // //     borderRadius: 12,
// // // // //   },
// // // // //   clearButtonText: {
// // // // //     color: Colors.white,
// // // // //     fontSize: 15,
// // // // //     fontWeight: '700',
// // // // //   },
// // // // //   modalBackdrop: {
// // // // //     flex: 1,
// // // // //     backgroundColor: 'rgba(15,23,42,0.28)',
// // // // //     justifyContent: 'flex-end',
// // // // //   },
// // // // //   modalOverlay: {
// // // // //     flex: 1,
// // // // //   },
// // // // //   modalSheet: {
// // // // //     backgroundColor: Colors.white,
// // // // //     borderTopLeftRadius: 24,
// // // // //     borderTopRightRadius: 24,
// // // // //     maxHeight: '78%',
// // // // //     paddingTop: 10,
// // // // //   },
// // // // //   modalHandle: {
// // // // //     width: 52,
// // // // //     height: 5,
// // // // //     borderRadius: 999,
// // // // //     backgroundColor: '#D1D5DB',
// // // // //     alignSelf: 'center',
// // // // //     marginBottom: 14,
// // // // //   },
// // // // //   modalHeader: {
// // // // //     flexDirection: 'row',
// // // // //     alignItems: 'center',
// // // // //     justifyContent: 'space-between',
// // // // //     paddingHorizontal: 18,
// // // // //     paddingBottom: 10,
// // // // //   },
// // // // //   modalTitle: {
// // // // //     fontSize: 20,
// // // // //     fontWeight: '800',
// // // // //     color: Colors.dark,
// // // // //   },
// // // // //   modalContent: {
// // // // //     paddingHorizontal: 18,
// // // // //     paddingBottom: 20,
// // // // //   },
// // // // //   modalSection: {
// // // // //     marginBottom: 18,
// // // // //   },
// // // // //   modalSectionTitle: {
// // // // //     fontSize: 14,
// // // // //     fontWeight: '700',
// // // // //     color: Colors.dark,
// // // // //     marginBottom: 10,
// // // // //   },
// // // // //   modalToggleChip: {
// // // // //     borderRadius: 14,
// // // // //     borderWidth: 1,
// // // // //     borderColor: '#E5E7EB',
// // // // //     paddingHorizontal: 14,
// // // // //     paddingVertical: 10,
// // // // //     alignSelf: 'flex-start',
// // // // //     backgroundColor: '#F9FAFB',
// // // // //   },
// // // // //   modalToggleChipActive: {
// // // // //     backgroundColor: Colors.primary,
// // // // //     borderColor: Colors.primary,
// // // // //   },
// // // // //   modalToggleChipText: {
// // // // //     fontSize: 13,
// // // // //     color: Colors.dark,
// // // // //     fontWeight: '600',
// // // // //   },
// // // // //   modalToggleChipTextActive: {
// // // // //     color: Colors.white,
// // // // //   },
// // // // //   modalOptionWrap: {
// // // // //     flexDirection: 'row',
// // // // //     flexWrap: 'wrap',
// // // // //     gap: 10,
// // // // //   },
// // // // //   modalOptionChip: {
// // // // //     borderRadius: 16,
// // // // //     borderWidth: 1,
// // // // //     borderColor: '#E5E7EB',
// // // // //     paddingHorizontal: 12,
// // // // //     paddingVertical: 9,
// // // // //     backgroundColor: '#F9FAFB',
// // // // //   },
// // // // //   modalOptionChipActive: {
// // // // //     backgroundColor: Colors.primary,
// // // // //     borderColor: Colors.primary,
// // // // //   },
// // // // //   modalOptionChipText: {
// // // // //     fontSize: 13,
// // // // //     color: Colors.dark,
// // // // //     fontWeight: '600',
// // // // //   },
// // // // //   modalOptionChipTextActive: {
// // // // //     color: Colors.white,
// // // // //   },
// // // // //   modalFooter: {
// // // // //     flexDirection: 'row',
// // // // //     paddingHorizontal: 18,
// // // // //     paddingTop: 12,
// // // // //     paddingBottom: Platform.OS === 'ios' ? 28 : 18,
// // // // //     borderTopWidth: 1,
// // // // //     borderTopColor: '#EEF2F7',
// // // // //     gap: 12,
// // // // //   },
// // // // //   modalSecondaryBtn: {
// // // // //     flex: 1,
// // // // //     borderRadius: 14,
// // // // //     paddingVertical: 14,
// // // // //     alignItems: 'center',
// // // // //     backgroundColor: '#F3F4F6',
// // // // //   },
// // // // //   modalSecondaryBtnText: {
// // // // //     fontSize: 15,
// // // // //     fontWeight: '700',
// // // // //     color: Colors.dark,
// // // // //   },
// // // // //   modalPrimaryBtn: {
// // // // //     flex: 1,
// // // // //     borderRadius: 14,
// // // // //     paddingVertical: 14,
// // // // //     alignItems: 'center',
// // // // //     backgroundColor: Colors.primary,
// // // // //   },
// // // // //   modalPrimaryBtnText: {
// // // // //     fontSize: 15,
// // // // //     fontWeight: '700',
// // // // //     color: Colors.white,
// // // // //   },
// // // // //   imageModalContainer: {
// // // // //     flex: 1,
// // // // //     justifyContent: 'center',
// // // // //     alignItems: 'center',
// // // // //     backgroundColor: 'rgba(0,0,0,0.9)',
// // // // //   },
// // // // //   imageModalContent: {
// // // // //     width: '90%',
// // // // //     backgroundColor: Colors.white,
// // // // //     borderRadius: 20,
// // // // //     overflow: 'hidden',
// // // // //   },
// // // // //   imageModalHeader: {
// // // // //     flexDirection: 'row',
// // // // //     justifyContent: 'space-between',
// // // // //     alignItems: 'center',
// // // // //     padding: 16,
// // // // //     borderBottomWidth: 1,
// // // // //     borderBottomColor: '#EEF2F7',
// // // // //   },
// // // // //   imageModalTitle: {
// // // // //     fontSize: 18,
// // // // //     fontWeight: '700',
// // // // //     color: Colors.dark,
// // // // //   },
// // // // //   fullProfileImage: {
// // // // //     width: '100%',
// // // // //     height: 400,
// // // // //     backgroundColor: '#F5F5F5',
// // // // //   },
// // // // //   noImageContainer: {
// // // // //     width: '100%',
// // // // //     height: 400,
// // // // //     justifyContent: 'center',
// // // // //     alignItems: 'center',
// // // // //     backgroundColor: '#F5F5F5',
// // // // //   },
// // // // //   noImageText: {
// // // // //     fontSize: 16,
// // // // //     color: Colors.gray,
// // // // //   },
// // // // //   svgContainer: {
// // // // //     width: 48,
// // // // //     height: 48,
// // // // //     alignItems: 'center',
// // // // //     justifyContent: 'center',
// // // // //   },
// // // // //   initialsContainer: {
// // // // //     width: '100%',
// // // // //     height: '100%',
// // // // //     alignItems: 'center',
// // // // //     justifyContent: 'center',
// // // // //     backgroundColor: '#E5E7EB',
// // // // //   },
// // // // //   modalSvgContainer: {
// // // // //     width: '100%',
// // // // //     height: 400,
// // // // //     backgroundColor: '#F5F5F5',
// // // // //     alignItems: 'center',
// // // // //     justifyContent: 'center',
// // // // //   },
// // // // // });
// // import React, { useState, useEffect, useCallback, useMemo } from 'react';
// // import {
// //   View,
// //   Text,
// //   StyleSheet,
// //   TouchableOpacity,
// //   FlatList,
// //   StatusBar,
// //   Platform,
// //   Image,
// //   ScrollView,
// //   Modal,
// //   RefreshControl,
// //   TextInput,
// //   ActivityIndicator,
// // } from 'react-native';
// // import { SafeAreaView } from 'react-native-safe-area-context';
// // import { Ionicons, MaterialIcons } from '@expo/vector-icons';
// // import LottieView from "lottie-react-native";
// // import { Colors, Typography } from '../constants/Colors';
// // import { useAuth } from '../context/AuthContext';
// // import { API_BASE_URL } from '../config/config_ip';
// // import DatabaseService from '../services/matchingpreference_ds';
// // import CustomAlert from '../components/CustomAlert';
// // import { SvgCssUri } from 'react-native-svg/css';
// // import { useFocusEffect } from '@react-navigation/native';

// // const IMAGE_BASE_URL = API_BASE_URL;

// // const QUICK_FILTER_KEYS = [
// //   'verified_profiles_only',
// //   'same_gender_after_9pm',
// //   'smoking_policy',
// //   'pets_allowed',
// //   'chat_level',
// //   'luggage_allowance',
// // ];

// // const QUICK_FILTER_LABELS = {
// //   verified_profiles_only: 'Verified Only',
// //   same_gender_after_9pm: 'Same Gender Night',
// //   smoking_policy: 'No Smoking',
// //   pets_allowed: 'Pets',
// //   chat_level: 'Chat Level',
// //   luggage_allowance: 'Luggage',
// // };

// // const SORT_OPTIONS = [
// //   { key: 'time', label: 'Time' },
// //   { key: 'price', label: 'Price' },
// //   { key: 'rating', label: 'Rating' },
// //   { key: 'match', label: 'Match %' },
// // ];

// // function buildImageUrl(url) {
// //   if (!url) return null;
// //   if (url.startsWith('http://') || url.startsWith('https://')) return url;
// //   return `${IMAGE_BASE_URL}${url.startsWith('/') ? '' : '/'}${url}`;
// // }

// // function getDriverInitials(name) {
// //   if (!name) return 'D';
// //   const parts = name.trim().split(' ').filter(Boolean);
// //   if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
// //   return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
// // }

// // function normalizeText(value) {
// //   if (value === undefined || value === null) return '';
// //   return String(value).trim().toLowerCase();
// // }

// // function getRidePreferences(item) {
// //   if (item.preferences) return item.preferences;
// //   if (item.ridePreferences) return item.ridePreferences;
// //   if (item.matchingPreferences) return item.matchingPreferences;
// //   if (item.travel_preferences) return item.travel_preferences;
// //   return {};
// // }

// // function extractPreferenceBadges(item) {
// //   const prefs = getRidePreferences(item);
// //   const badges = [];

// //   if (!prefs || Object.keys(prefs).length === 0) {
// //     return [];
// //   }

// //   Object.entries(prefs).forEach(([key, value]) => {
// //     if (value === null || value === undefined) return;
    
// //     if (typeof value === 'boolean') {
// //       if (value === true) {
// //         if (key === 'verified_profiles_only') {
// //           badges.push('Verified Only');
// //         } else {
// //           const displayKey = key.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
// //           badges.push(displayKey);
// //         }
// //       }
// //     } 
// //     else if (Array.isArray(value)) {
// //       if (value.length > 0) {
// //         value.forEach(v => {
// //           if (v && v.trim()) {
// //             badges.push(v.trim());
// //           }
// //         });
// //       }
// //     }
// //     else if (typeof value === 'string' && value.trim()) {
// //       const lowerValue = value.toLowerCase();
// //       if (!['false', 'no', 'none', 'null', 'undefined', 'no preference'].includes(lowerValue)) {
// //         badges.push(value);
// //       }
// //     }
// //     else if (typeof value === 'number') {
// //       badges.push(String(value));
// //     }
// //   });

// //   return [...new Set(badges)];
// // }

// // async function fetchUserDocuments(phoneNumber) {
// //   try {
// //     const url = `${API_BASE_URL}/api/v1/documents/user/${phoneNumber}`;
// //     const res = await fetch(url, { headers: { Accept: 'application/json' } });
// //     if (!res.ok) return null;
// //     const data = await res.json();
// //     return data;
// //   } catch (e) {
// //     console.log('fetchUserDocuments error:', e);
// //     return null;
// //   }
// // }

// // async function fetchDriverProfile(phoneNumber, userId) {
// //   try {
// //     const params = new URLSearchParams();
// //     if (userId) params.append('user_id', userId);
// //     else if (phoneNumber) params.append('phone_number', phoneNumber);
// //     else return null;
// //     const url = `${API_BASE_URL}/api/v1/users/profile-public?${params.toString()}`;
// //     const res = await fetch(url, { headers: { Accept: 'application/json' } });
// //     if (!res.ok) return null;
// //     const data = await res.json();
// //     return data;
// //   } catch (e) {
// //     console.log('fetchDriverProfile error:', e);
// //     return null;
// //   }
// // }

// // function checkVerifiedDocuments(docs) {
// //   if (!docs || !docs.length) return false;
  
// //   const verified = docs.filter(doc => {
// //     const docType = doc.document_type?.toLowerCase();
// //     const status = doc.status?.toUpperCase();
// //     return status === 'APPROVED' && ['aadhar', 'dl', 'rc'].includes(docType);
// //   });
  
// //   return verified.length > 0;
// // }

// // function RatingStars({ rating, size = 12, showLabel = true }) {
// //   const fullStars = Math.floor(rating);
// //   const hasHalfStar = rating % 1 >= 0.5;
// //   const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);
  
// //   return (
// //     <View style={{ flexDirection: 'row', alignItems: 'center' }}>
// //       {[...Array(fullStars)].map((_, i) => (
// //         <Ionicons key={`full-${i}`} name="star" size={size} color="#F59E0B" />
// //       ))}
// //       {hasHalfStar && (
// //         <Ionicons name="star-half" size={size} color="#F59E0B" />
// //       )}
// //       {[...Array(emptyStars)].map((_, i) => (
// //         <Ionicons key={`empty-${i}`} name="star-outline" size={size} color="#F59E0B" />
// //       ))}
// //       {showLabel && rating > 0 && (
// //         <Text style={[styles.ratingText, { marginLeft: 4 }]}>({rating.toFixed(1)})</Text>
// //       )}
// //       {showLabel && rating === 0 && (
// //         <Text style={[styles.ratingText, { marginLeft: 4 }]}>New</Text>
// //       )}
// //     </View>
// //   );
// // }

// // function matchesQuickFilter(item, key) {
// //   const prefs = getRidePreferences(item);
// //   const value = prefs?.[key];
// //   const normalized = normalizeText(value);

// //   if (key === 'verified_profiles_only') {
// //     return !!item.isVerified;
// //   }

// //   if (typeof value === 'boolean') return value;
// //   if (Array.isArray(value)) return value.length > 0;

// //   if (key === 'smoking_policy') {
// //     return normalized.includes('no');
// //   }

// //   if (key === 'same_gender_after_9pm') {
// //     return normalized === 'true' || normalized === 'yes' || normalized === 'same gender';
// //   }

// //   if (key === 'pets_allowed') {
// //     return normalized === 'true' || normalized === 'yes' || normalized === 'allowed';
// //   }

// //   return !!normalized;
// // }

// // function matchesAdvancedFilter(item, key, expectedValue) {
// //   if (expectedValue === undefined || expectedValue === null || expectedValue === '') {
// //     return true;
// //   }

// //   const prefs = getRidePreferences(item);
// //   const rideValue = prefs?.[key];

// //   if (typeof expectedValue === 'boolean') {
// //     if (key === 'verified_profiles_only') {
// //       return expectedValue ? !!item.isVerified : true;
// //     }
// //     return rideValue === expectedValue || normalizeText(rideValue) === String(expectedValue);
// //   }

// //   if (Array.isArray(rideValue)) {
// //     return rideValue.map(v => normalizeText(v)).includes(normalizeText(expectedValue));
// //   }

// //   return normalizeText(rideValue) === normalizeText(expectedValue);
// // }

// // function ProfileImageModal({ visible, imageUrl, driverName, onClose }) {
// //   const [isSvg, setIsSvg] = useState(false);
  
// //   useEffect(() => {
// //     if (imageUrl) {
// //       setIsSvg(imageUrl.toLowerCase().includes('.svg'));
// //     }
// //   }, [imageUrl]);
  
// //   if (!visible) return null;
  
// //   return (
// //     <Modal
// //       visible={visible}
// //       transparent={true}
// //       animationType="fade"
// //       onRequestClose={onClose}
// //     >
// //       <TouchableOpacity 
// //         style={styles.modalBackdrop}
// //         activeOpacity={1}
// //         onPress={onClose}
// //       >
// //         <View style={styles.imageModalContainer}>
// //           <View style={styles.imageModalContent}>
// //             <View style={styles.imageModalHeader}>
// //               <Text style={styles.imageModalTitle}>{driverName}</Text>
// //               <TouchableOpacity onPress={onClose}>
// //                 <Ionicons name="close" size={24} color={Colors.dark} />
// //               </TouchableOpacity>
// //             </View>
// //             {imageUrl && imageUrl !== 'null' && imageUrl !== 'undefined' ? (
// //               isSvg ? (
// //                 <View style={styles.modalSvgContainer}>
// //                   <SvgCssUri
// //                     uri={imageUrl}
// //                     width="100%"
// //                     height={400}
// //                   />
// //                 </View>
// //               ) : (
// //                 <Image
// //                   source={{ uri: imageUrl }}
// //                   style={styles.fullProfileImage}
// //                   resizeMode="contain"
// //                 />
// //               )
// //             ) : (
// //               <View style={styles.noImageContainer}>
// //                 <Text style={styles.noImageText}>No profile picture available</Text>
// //               </View>
// //             )}
// //           </View>
// //         </View>
// //       </TouchableOpacity>
// //     </Modal>
// //   );
// // }

// // function PreferenceTag({ label }) {
// //   if (!label || label.trim() === '') return null;
  
// //   let tagColor = '#FFF3E8';
// //   let textColor = '#C65D00';
  
// //   const lowerLabel = label.toLowerCase();
  
// //   if (lowerLabel.includes('chatty') || lowerLabel.includes('talkative')) {
// //     tagColor = '#E3F2FD';
// //     textColor = '#1565C0';
// //   } else if (lowerLabel.includes('quiet')) {
// //     tagColor = '#E8F5E9';
// //     textColor = '#2E7D32';
// //   } else if (lowerLabel.includes('english') || lowerLabel.includes('hindi') || lowerLabel.includes('language')) {
// //     tagColor = '#FFF9C4';
// //     textColor = '#F57F17';
// //   } else if (lowerLabel.includes('music') || lowerLabel.includes('songs')) {
// //     tagColor = '#F3E5F5';
// //     textColor = '#6A1B9A';
// //   } else if (lowerLabel.includes('ac')) {
// //     tagColor = '#E3F2FD';
// //     textColor = '#1565C0';
// //   } else if (lowerLabel.includes('pet')) {
// //     tagColor = '#FCE4EC';
// //     textColor = '#C2185B';
// //   } else if (lowerLabel.includes('smoking')) {
// //     tagColor = '#FFEBEE';
// //     textColor = '#C62828';
// //   } else if (lowerLabel.includes('verified')) {
// //     tagColor = '#E8F5E9';
// //     textColor = '#2E7D32';
// //   } else if (lowerLabel.match(/[0-9]/)) {
// //     tagColor = '#E8F5E9';
// //     textColor = '#2E7D32';
// //   }
  
// //   return (
// //     <View style={[styles.prefBadge, { backgroundColor: tagColor }]}>
// //       <Text style={[styles.prefBadgeText, { color: textColor }]}>{label}</Text>
// //     </View>
// //   );
// // }

// // export default function RideNextScreen({ navigation, route }) {
// //   const { user, loading: authLoading } = useAuth();
// //   const { searchData } = route.params || {};
// //   const { from, to, fromCoords, toCoords, dateTime, seats } = searchData || {};

// //   const [availableRides, setAvailableRides] = useState([]);
// //   const [loading, setLoading] = useState(true);
// //   const [refreshing, setRefreshing] = useState(false);
// //   const [errorMessage, setErrorMessage] = useState('');
// //   const [sortBy, setSortBy] = useState('time');
// //   const [quickFilters, setQuickFilters] = useState([]);
// //   const [headerFiltersVisible, setHeaderFiltersVisible] = useState(false);
// //   const [filterModalVisible, setFilterModalVisible] = useState(false);
// //   const [preferenceMaster, setPreferenceMaster] = useState([]);
// //   const [userPreferences, setUserPreferences] = useState({});
// //   const [advancedFilters, setAdvancedFilters] = useState({});
  
// //   // Ride Request Alert States
// //   const [showRideRequestModal, setShowRideRequestModal] = useState(false);
// //   const [rideRequestLoading, setRideRequestLoading] = useState(false);
// //   const [rideRequestEmail, setRideRequestEmail] = useState('');
// //   const [rideRequestNotes, setRideRequestNotes] = useState('');
  
// //   const [selectedProfile, setSelectedProfile] = useState({
// //     visible: false,
// //     imageUrl: null,
// //     driverName: '',
// //   });

// //   const [alertVisible, setAlertVisible] = useState(false);
// //   const [alertConfig, setAlertConfig] = useState({
// //     title: "",
// //     message: "",
// //     icon: "check-circle",
// //     iconColor: "#10B981",
// //     buttons: []
// //   });

// //   const phoneNumber = user?.phone_number;
// //   const userGender = user?.gender;
// //   const requestedSeats = seats || 1;

// //   const showCustomAlert = (title, message, type = 'success') => {
// //     let icon = "check-circle";
// //     let iconColor = "#10B981";
    
// //     if (type === 'error') {
// //       icon = "error";
// //       iconColor = "#EF4444";
// //     } else if (type === 'warning') {
// //       icon = "warning";
// //       iconColor = "#F59E0B";
// //     } else if (type === 'info') {
// //       icon = "info";
// //       iconColor = Colors.primary;
// //     }
    
// //     setAlertConfig({
// //       title,
// //       message,
// //       icon,
// //       iconColor,
// //       buttons: [{ text: 'OK', onPress: () => setAlertVisible(false) }]
// //     });
// //     setAlertVisible(true);
// //   };

// //   // Handle Ride Request Alert
// //   const handleRequestRideAlert = async () => {
// //     const userEmail = user?.email || '';
    
// //     if (!rideRequestEmail && !userEmail) {
// //       showCustomAlert('Email Required', 'Please enter your email address to receive notifications.', 'error');
// //       return;
// //     }
    
// //     const emailToUse = rideRequestEmail || userEmail;
    
// //     if (!emailToUse.includes('@')) {
// //       showCustomAlert('Invalid Email', 'Please enter a valid email address.', 'error');
// //       return;
// //     }
    
// //     setRideRequestLoading(true);
    
// //     try {
// //       const response = await fetch(`${API_BASE_URL}/request-ride-alert`, {
// //         method: 'POST',
// //         headers: {
// //           'Content-Type': 'application/json',
// //         },
// //         body: JSON.stringify({
// //           from_location: from,
// //           to_location: to,
// //           from_coords: fromCoords,
// //           to_coords: toCoords,
// //           preferred_date: dateTime,
// //           preferred_time: new Date(dateTime).toLocaleTimeString(),
// //           seats_needed: requestedSeats,
// //           passenger_phone: user?.phone_number,
// //           passenger_name: user?.full_name || user?.first_name,
// //           passenger_email: emailToUse,
// //           notes: rideRequestNotes
// //         }),
// //       });
      
// //       const result = await response.json();
      
// //       if (result.success) {
// //         showCustomAlert(
// //           'Request Submitted! 📧', 
// //           `We'll email you at ${emailToUse} when a ride matching your route is posted.\n\nRequest expires in 7 days.`,
// //           'success'
// //         );
// //         setShowRideRequestModal(false);
// //         setRideRequestEmail('');
// //         setRideRequestNotes('');
// //       } else {
// //         showCustomAlert('Request Failed', result.message || 'Could not create ride request', 'error');
// //       }
// //     } catch (error) {
// //       console.log('Error creating ride request:', error);
// //       showCustomAlert('Error', 'Could not create ride request. Please try again.', 'error');
// //     } finally {
// //       setRideRequestLoading(false);
// //     }
// //   };

// //   // ONLY fetch rides - NO auto-refresh, NO polling, NO sockets
// //   const fetchAvailableRides = useCallback(async (showRefresh = false) => {
// //     if (!searchData || !fromCoords || !toCoords || !dateTime) {
// //       setAvailableRides([]);
// //       setLoading(false);
// //       return;
// //     }

// //     try {
// //       if (showRefresh) {
// //         setRefreshing(true);
// //       } else {
// //         setLoading(true);
// //       }
// //       setErrorMessage('');

// //       const response = await fetch(`${API_BASE_URL}/search-rides`, {
// //         method: 'POST',
// //         headers: {
// //           'Content-Type': 'application/json',
// //         },
// //         body: JSON.stringify({
// //           from_location: from,
// //           to_location: to,
// //           from_coords: fromCoords,
// //           to_coords: toCoords,
// //           departure_time: new Date(dateTime).toISOString(),
// //           seats_required: requestedSeats,
// //           passenger_gender: userGender,
// //         }),
// //       });

// //       const rawText = await response.text();
// //       let parsedData = null;

// //       try {
// //         parsedData = rawText ? JSON.parse(rawText) : {};
// //       } catch (parseError) {
// //         parsedData = { detail: rawText || 'Unexpected server response' };
// //       }

// //       if (!response.ok) {
// //         throw new Error(parsedData?.detail || 'Failed to fetch rides');
// //       }

// //       const rides = Array.isArray(parsedData?.rides) ? parsedData.rides : [];
      
// //       console.log(`📱 Found ${rides.length} rides`);
      
// //       const ridesWithDetails = await Promise.all(
// //         rides.map(async (ride) => {
// //           let isVerified = false;
// //           let avgRating = ride.rating || 0;
// //           let profilePictureUrl = null;
          
// //           const driverPhone = ride.phoneNumber;
// //           const driverUserId = ride.driverUserId;
          
// //           if (driverPhone || driverUserId) {
// //             if (driverPhone) {
// //               const docsData = await fetchUserDocuments(driverPhone);
// //               if (docsData?.success && docsData.documents) {
// //                 isVerified = checkVerifiedDocuments(docsData.documents);
// //               }
// //             }
            
// //             const profileData = await fetchDriverProfile(driverPhone, driverUserId);
            
// //             if (profileData?.success && profileData.user) {
// //               avgRating = profileData.user.avg_rating || 0;
              
// //               const possiblePictureFields = ['profile_picture', 'profilePicture', 'profilePhoto', 'profile_image', 'avatar'];
// //               for (const field of possiblePictureFields) {
// //                 if (profileData.user[field]) {
// //                   profilePictureUrl = profileData.user[field];
// //                   break;
// //                 }
// //               }
              
// //               if (!profilePictureUrl && profileData.user.profile && profileData.user.profile.picture) {
// //                 profilePictureUrl = profileData.user.profile.picture;
// //               }
// //             }
// //           }
          
// //           if (!profilePictureUrl) {
// //             if (ride.profilePicture) profilePictureUrl = ride.profilePicture;
// //             else if (ride.profilepicture) profilePictureUrl = ride.profilepicture;
// //             else if (ride.profilePhoto) profilePictureUrl = ride.profilePhoto;
// //             else if (ride.driverProfilePicture) profilePictureUrl = ride.driverProfilePicture;
// //           }
          
// //           let finalProfilePicture = null;
// //           if (profilePictureUrl) {
// //             finalProfilePicture = buildImageUrl(profilePictureUrl);
// //           }
          
// //           let availableSeats = ride.seatsAvailable || ride.available_seats || 0;
          
// //           return { 
// //             ...ride, 
// //             isVerified, 
// //             rating: avgRating,
// //             profilePicture: finalProfilePicture,
// //             profilepicture: finalProfilePicture,
// //             profilePhoto: finalProfilePicture,
// //             pickupLabel: ride.pickupLabel || ride.pickupLocationName || ride.fromLocationName || ride.from || 'Pickup point',
// //             dropLabel: ride.dropLabel || ride.dropLocationName || ride.toLocationName || ride.to || 'Drop point',
// //             womenOnly: ride.womenOnly === true || ride.women_only === true,
// //             seatsAvailable: availableSeats,
// //             requestedSeats: requestedSeats,
// //             isFull: availableSeats === 0,
// //           };
// //         })
// //       );
      
// //       setAvailableRides(ridesWithDetails);
      
// //     } catch (error) {
// //       console.log('❌ search-rides error:', error);
// //       setAvailableRides([]);
// //       setErrorMessage(error.message || 'Failed to search rides');
// //       showCustomAlert('Search Error', error.message || 'Failed to search rides', 'error');
// //     } finally {
// //       setLoading(false);
// //       setRefreshing(false);
// //     }
// //   }, [searchData, from, to, fromCoords, toCoords, dateTime, requestedSeats, userGender]);

// //   const loadPreferenceData = useCallback(async () => {
// //     try {
// //       const defs = await DatabaseService.getMatchingPreferenceMaster();
// //       setPreferenceMaster(defs || []);

// //       if (phoneNumber) {
// //         const saved = await DatabaseService.getUserMatchingPreferences(phoneNumber);
// //         setUserPreferences(saved || {});
// //       }
// //     } catch (e) {
// //       console.log('❌ preference load error:', e);
// //     }
// //   }, [phoneNumber]);

// //   // ONLY load on initial mount - NO auto-refresh
// //   useEffect(() => {
// //     if (authLoading) return;
// //     fetchAvailableRides();
// //     loadPreferenceData();
// //   }, [authLoading, fetchAvailableRides, loadPreferenceData]);

// //   // Manual refresh only - when user pulls down
// //   const onRefresh = useCallback(() => {
// //     fetchAvailableRides(true);
// //   }, [fetchAvailableRides]);

// //   const quickFilterOptions = useMemo(() => {
// //     const defs = preferenceMaster.filter(pref => QUICK_FILTER_KEYS.includes(pref.key));
// //     return defs.slice(0, 3).map(pref => ({
// //       key: pref.key,
// //       label: QUICK_FILTER_LABELS[pref.key] || pref.label,
// //     }));
// //   }, [preferenceMaster]);

// //   const advancedFilterOptions = useMemo(() => {
// //     return preferenceMaster.filter(pref => {
// //       if (!pref?.key) return false;
// //       if (quickFilterOptions.some(q => q.key === pref.key)) return false;
// //       return ['toggle', 'single_select'].includes(pref.input_type);
// //     });
// //   }, [preferenceMaster, quickFilterOptions]);

// //   const processedRides = useMemo(() => {
// //     let rides = [...availableRides];

// //     if (userGender !== 'female') {
// //       rides = rides.filter(item => {
// //         const isWomenOnly = item.womenOnly === true;
// //         if (isWomenOnly) {
// //           console.log('🚫 Filtering out women-only ride:', item.id);
// //         }
// //         return !isWomenOnly;
// //       });
// //     }

// //     if (quickFilters.length > 0) {
// //       rides = rides.filter(item =>
// //         quickFilters.every(key => matchesQuickFilter(item, key))
// //       );
// //     }

// //     const activeAdvanced = Object.entries(advancedFilters).filter(
// //       ([, value]) =>
// //         value !== '' &&
// //         value !== null &&
// //         value !== undefined &&
// //         value !== false
// //     );

// //     if (activeAdvanced.length > 0) {
// //       rides = rides.filter(item =>
// //         activeAdvanced.every(([key, value]) =>
// //           matchesAdvancedFilter(item, key, value)
// //         )
// //       );
// //     }

// //     rides.sort((a, b) => {
// //       if (sortBy === 'price') return (a.price || 0) - (b.price || 0);
// //       if (sortBy === 'rating') return (b.rating || 0) - (a.rating || 0);
// //       if (sortBy === 'match') return (b.matchPercentage || 0) - (a.matchPercentage || 0);

// //       const aDate = new Date(`${a.date || ''} ${a.time || ''}`);
// //       const bDate = new Date(`${b.date || ''} ${b.time || ''}`);
// //       if (!isNaN(aDate) && !isNaN(bDate)) return aDate - bDate;
// //       return 0;
// //     });

// //     return rides;
// //   }, [availableRides, quickFilters, advancedFilters, sortBy, userGender]);

// //   const handleCardPress = (ride) => {
// //     const pickupAddress = searchData?.fromAddress || ride.from || '';
// //     const dropoffAddress = searchData?.toAddress || ride.to || '';
// //     const pickupPlaceName = searchData?.fromPlaceName || ride.pickupLabel || ride.from?.split(',')[0] || '';
// //     const dropoffPlaceName = searchData?.toPlaceName || ride.dropLabel || ride.to?.split(',')[0] || '';
    
// //     navigation.navigate('RideDetailScreen', {
// //       ride: ride,
// //       searchData: {
// //         fromCoords: fromCoords,
// //         toCoords: toCoords,
// //         fromAddress: pickupAddress,
// //         toAddress: dropoffAddress,
// //         fromPlaceName: pickupPlaceName,
// //         toPlaceName: dropoffPlaceName,
// //         date: dateTime,
// //         time: new Date(dateTime).toLocaleTimeString(),
// //         seats: requestedSeats
// //       }
// //     });
// //   };

// //   const toggleQuickFilter = (key) => {
// //     setQuickFilters(prev =>
// //       prev.includes(key) ? prev.filter(i => i !== key) : [...prev, key]
// //     );
// //   };

// //   const clearAllFilters = () => {
// //     setQuickFilters([]);
// //     setAdvancedFilters({});
// //     showCustomAlert('Filters Cleared', 'All filters have been reset.', 'info');
// //   };

// //   const renderAdvancedFilterControl = (pref) => {
// //     const currentValue = advancedFilters[pref.key];

// //     if (pref.input_type === 'toggle') {
// //       const active = !!currentValue;
// //       return (
// //         <TouchableOpacity
// //           activeOpacity={0.85}
// //           style={[styles.modalToggleChip, active && styles.modalToggleChipActive]}
// //           onPress={() =>
// //             setAdvancedFilters(prev => ({ ...prev, [pref.key]: !active }))
// //           }
// //         >
// //           <Text
// //             style={[
// //               styles.modalToggleChipText,
// //               active && styles.modalToggleChipTextActive,
// //             ]}
// //           >
// //             {pref.label}
// //           </Text>
// //         </TouchableOpacity>
// //       );
// //     }

// //     if (pref.input_type === 'single_select' && Array.isArray(pref.options)) {
// //       return (
// //         <View style={styles.modalOptionWrap}>
// //           {pref.options.map((opt) => {
// //             const active = currentValue === opt;
// //             return (
// //               <TouchableOpacity
// //                 key={opt}
// //                 activeOpacity={0.85}
// //                 style={[
// //                   styles.modalOptionChip,
// //                   active && styles.modalOptionChipActive,
// //                 ]}
// //                 onPress={() =>
// //                   setAdvancedFilters(prev => ({
// //                     ...prev,
// //                     [pref.key]: active ? '' : opt,
// //                   }))
// //                 }
// //               >
// //                 <Text
// //                   style={[
// //                     styles.modalOptionChipText,
// //                     active && styles.modalOptionChipTextActive,
// //                   ]}
// //                 >
// //                   {opt}
// //                 </Text>
// //               </TouchableOpacity>
// //             );
// //           })}
// //         </View>
// //       );
// //     }

// //     return null;
// //   };

// //   // Ride Request Modal Component
// //   const RideRequestModal = () => {
// //     const userEmail = user?.email || '';
    
// //     return (
// //       <Modal
// //         visible={showRideRequestModal}
// //         transparent={true}
// //         animationType="slide"
// //         onRequestClose={() => setShowRideRequestModal(false)}
// //       >
// //         <View style={styles.modalBackdrop}>
// //           <TouchableOpacity 
// //             style={styles.modalOverlay} 
// //             activeOpacity={1} 
// //             onPress={() => setShowRideRequestModal(false)} 
// //           />
          
// //           <View style={styles.requestModalSheet}>
// //             <View style={styles.modalHandle} />
            
// //             <View style={styles.modalHeader}>
// //               <Text style={styles.modalTitle}>Request Ride Alert</Text>
// //               <TouchableOpacity onPress={() => setShowRideRequestModal(false)}>
// //                 <Ionicons name="close" size={24} color={Colors.dark} />
// //               </TouchableOpacity>
// //             </View>
            
// //             <ScrollView showsVerticalScrollIndicator={false}>
// //               <View style={styles.requestModalContent}>
// //                 <View style={styles.requestInfoBox}>
// //                   <Ionicons name="information-circle" size={20} color={Colors.primary} />
// //                   <Text style={styles.requestInfoText}>
// //                     No rides found for this route. We'll email you when a ride becomes available.
// //                   </Text>
// //                 </View>
                
// //                 <View style={styles.requestRouteBox}>
// //                   <Text style={styles.requestRouteLabel}>Route:</Text>
// //                   <Text style={styles.requestRouteText}>
// //                     {from} → {to}
// //                   </Text>
// //                   <Text style={styles.requestRouteDetail}>
// //                     {new Date(dateTime).toLocaleDateString()} at {new Date(dateTime).toLocaleTimeString()}
// //                   </Text>
// //                   <Text style={styles.requestRouteDetail}>
// //                     {requestedSeats} seat{requestedSeats !== 1 ? 's' : ''} needed
// //                   </Text>
// //                 </View>
                
// //                 <View style={styles.requestInputGroup}>
// //                   <Text style={styles.requestLabel}>Email Address *</Text>
// //                   <TextInput
// //                     style={styles.requestInput}
// //                     placeholder="Enter your email"
// //                     value={rideRequestEmail}
// //                     onChangeText={setRideRequestEmail}
// //                     keyboardType="email-address"
// //                     autoCapitalize="none"
// //                     autoComplete="email"
// //                   />
// //                   {userEmail && !rideRequestEmail && (
// //                     <Text style={styles.requestHelper}>
// //                       Using your registered email: {userEmail}
// //                     </Text>
// //                   )}
// //                   <Text style={styles.requestHelper}>
// //                     We'll notify you at this email when rides are posted
// //                   </Text>
// //                 </View>
                
// //                 <View style={styles.requestInputGroup}>
// //                   <Text style={styles.requestLabel}>Additional Notes (Optional)</Text>
// //                   <TextInput
// //                     style={[styles.requestInput, styles.requestTextArea]}
// //                     placeholder="Any preferences or special requirements?"
// //                     value={rideRequestNotes}
// //                     onChangeText={setRideRequestNotes}
// //                     multiline
// //                     numberOfLines={3}
// //                     textAlignVertical="top"
// //                   />
// //                 </View>
                
// //                 <View style={styles.requestNoteBox}>
// //                   <Ionicons name="time-outline" size={16} color={Colors.gray} />
// //                   <Text style={styles.requestNoteText}>
// //                     Your request will remain active for 7 days. You can cancel it anytime in your profile.
// //                   </Text>
// //                 </View>
// //               </View>
// //             </ScrollView>
            
// //             <View style={styles.modalFooter}>
// //               <TouchableOpacity
// //                 style={styles.modalSecondaryBtn}
// //                 onPress={() => setShowRideRequestModal(false)}
// //               >
// //                 <Text style={styles.modalSecondaryBtnText}>Cancel</Text>
// //               </TouchableOpacity>
              
// //               <TouchableOpacity
// //                 style={[styles.modalPrimaryBtn, rideRequestLoading && styles.disabledButton]}
// //                 onPress={handleRequestRideAlert}
// //                 disabled={rideRequestLoading}
// //               >
// //                 {rideRequestLoading ? (
// //                   <ActivityIndicator size="small" color={Colors.white} />
// //                 ) : (
// //                   <Text style={styles.modalPrimaryBtnText}>Get Email Alert</Text>
// //                 )}
// //               </TouchableOpacity>
// //             </View>
// //           </View>
// //         </View>
// //       </Modal>
// //     );
// //   };

// //   const renderRideCard = ({ item }) => {
// //     let profilePhotoUrl = null;
// //     let isSvg = false;
    
// //     if (item.profilePicture) {
// //       profilePhotoUrl = buildImageUrl(item.profilePicture);
// //     } else if (item.profilepicture) {
// //       profilePhotoUrl = buildImageUrl(item.profilepicture);
// //     } else if (item.profilePhoto) {
// //       profilePhotoUrl = buildImageUrl(item.profilePhoto);
// //     } else if (item.driverProfilePicture) {
// //       profilePhotoUrl = buildImageUrl(item.driverProfilePicture);
// //     } else if (item.driver?.profile_picture) {
// //       profilePhotoUrl = buildImageUrl(item.driver.profile_picture);
// //     } else if (item.user?.profile_picture) {
// //       profilePhotoUrl = buildImageUrl(item.user.profile_picture);
// //     }
    
// //     if (profilePhotoUrl && profilePhotoUrl.toLowerCase().includes('.svg')) {
// //       isSvg = true;
// //     }
    
// //     const driverNameText = item.driverName || item.driver_name || item.driver?.full_name || 'Driver';
// //     const avatarText = getDriverInitials(driverNameText);

// //     let vehicleLabel = 'Vehicle details unavailable';
// //     if (item.vehicle) {
// //       const vehicleParts = [];
// //       if (item.vehicle.model) vehicleParts.push(item.vehicle.model);
// //       if (item.vehicle.color && vehicleParts.length > 0) {
// //         vehicleLabel = `${vehicleParts.join(' ')} - ${item.vehicle.color}`;
// //       } else if (item.vehicle.color) {
// //         vehicleLabel = item.vehicle.color;
// //       } else if (vehicleParts.length > 0) {
// //         vehicleLabel = vehicleParts.join(' ');
// //       }
// //     } else if (item.vehicleModel) {
// //       vehicleLabel = item.vehicleModel;
// //       if (item.vehicleColor) {
// //         vehicleLabel = `${item.vehicleModel} - ${item.vehicleColor}`;
// //       }
// //     }

// //     const preferenceBadges = extractPreferenceBadges(item);
// //     const isDriverVerified = item.isVerified;
// //     const driverRating = item.rating || 0;

// //     const pickupName = item.pickupLabel || item.from || 'Pickup point';
// //     const dropName = item.dropLabel || item.to || 'Drop point';
    
// //     const seatsAvailable = item.seatsAvailable || 0;
// //     const isSeatsInsufficient = requestedSeats > seatsAvailable && seatsAvailable > 0;
// //     const isFull = seatsAvailable === 0;
// //     const canBook = !isFull && seatsAvailable >= requestedSeats;

// //     return (
// //       <TouchableOpacity
// //         style={[styles.rideCard, !canBook && !isFull && styles.rideCardWarning, isFull && styles.rideCardFull]}
// //         onPress={() => handleCardPress(item)}
// //         activeOpacity={0.9}
// //       >
// //         <View style={styles.cardTopRow}>
// //           <View style={styles.profileRow}>
// //             <TouchableOpacity
// //               onPress={() => handleCardPress(item)}
// //               activeOpacity={0.8}
// //             >
// //               <View style={styles.avatarContainer}>
// //                 {profilePhotoUrl ? (
// //                   isSvg ? (
// //                     <View style={styles.svgContainer}>
// //                       <SvgCssUri
// //                         uri={profilePhotoUrl}
// //                         width="48"
// //                         height="48"
// //                       />
// //                     </View>
// //                   ) : (
// //                     <Image
// //                       source={{ uri: profilePhotoUrl }}
// //                       style={styles.avatarImage}
// //                       resizeMode="cover"
// //                     />
// //                   )
// //                 ) : (
// //                   <View style={styles.initialsContainer}>
// //                     <Text style={styles.avatarFallback}>{avatarText}</Text>
// //                   </View>
// //                 )}
// //               </View>
// //             </TouchableOpacity>

// //             <View style={styles.profileContent}>
// //               <View style={styles.nameRow}>
// //                 <Text style={styles.driverName} numberOfLines={1}>
// //                   {driverNameText}
// //                 </Text>

// //                 {isDriverVerified && (
// //                   <View style={styles.verifiedBadge}>
// //                     <Ionicons name="checkmark-circle" size={14} color="#16A34A" />
// //                     <Text style={styles.verifiedText}>Verified</Text>
// //                   </View>
// //                 )}

// //                 {item.womenOnly === true && (
// //                   <View style={styles.womenOnlyBadge}>
// //                     <Ionicons name="woman" size={12} color="#E91E63" />
// //                     <Text style={styles.womenOnlyBadgeText}>Women Only</Text>
// //                   </View>
// //                 )}
                
// //                 {isFull && (
// //                   <View style={styles.fullBadge}>
// //                     <Ionicons name="close-circle" size={12} color="#EF4444" />
// //                     <Text style={styles.fullBadgeText}>Full</Text>
// //                   </View>
// //                 )}
// //               </View>

// //               <View style={styles.ratingRow}>
// //                 <RatingStars rating={driverRating} size={12} showLabel={true} />
// //               </View>
// //             </View>
// //           </View>

// //           <View style={styles.priceMatchWrap}>
// //             <View style={styles.matchBadge}>
// //               <Text style={styles.matchText}>{item.matchPercentage || 0}%</Text>
// //             </View>
// //             <Text style={styles.priceText}>₹{item.price}</Text>
// //             <Text style={styles.perSeatText}>per seat</Text>
// //           </View>
// //         </View>

// //         <View style={styles.infoRow}>
// //           <View style={styles.infoItem}>
// //             <Ionicons name="calendar-outline" size={13} color={Colors.gray} />
// //             <Text style={styles.infoText} numberOfLines={1}>{item.date}</Text>
// //           </View>
// //           <View style={styles.infoDot} />
// //           <View style={styles.infoItem}>
// //             <Ionicons name="time-outline" size={13} color={Colors.gray} />
// //             <Text style={styles.infoText} numberOfLines={1}>{item.time}</Text>
// //           </View>
// //           <View style={styles.infoDot} />
// //           <View style={styles.infoItem}>
// //             <Ionicons name="people-outline" size={13} color={Colors.gray} />
// //             <Text style={[
// //               styles.infoText, 
// //               isFull ? styles.fullText : (isSeatsInsufficient && styles.warningText)
// //             ]} numberOfLines={1}>
// //               {isFull ? 'Ride Full' : `${seatsAvailable} left`}
// //             </Text>
// //           </View>
// //         </View>

// //         {isFull && (
// //           <View style={styles.fullWarningContainer}>
// //             <Ionicons name="close-circle" size={14} color="#EF4444" />
// //             <Text style={styles.fullWarningText}>
// //               This ride is currently full. Check back later or try another ride.
// //             </Text>
// //           </View>
// //         )}

// //         {!isFull && isSeatsInsufficient && seatsAvailable > 0 && (
// //           <View style={styles.seatWarningContainer}>
// //             <Ionicons name="warning" size={14} color="#D97706" />
// //             <Text style={styles.seatWarningText}>
// //               Only {seatsAvailable} seat{seatsAvailable !== 1 ? 's' : ''} left. You requested {requestedSeats} seat{requestedSeats !== 1 ? 's' : ''}.
// //             </Text>
// //           </View>
// //         )}

// //         <View style={styles.divider} />

// //         <View style={styles.routeBlock}>
// //           <View style={styles.routeRow}>
// //             <View style={[styles.routeDot, { backgroundColor: '#22C55E' }]} />
// //             <View style={styles.routeTextWrap}>
// //               <Text style={styles.routeLabel}>Pickup</Text>
// //               <Text style={styles.routeText} numberOfLines={2}>{pickupName}</Text>
// //             </View>
// //           </View>
// //           <View style={styles.routeRow}>
// //             <View style={[styles.routeDot, { backgroundColor: '#F97316' }]} />
// //             <View style={styles.routeTextWrap}>
// //               <Text style={styles.routeLabel}>Drop</Text>
// //               <Text style={styles.routeText} numberOfLines={2}>{dropName}</Text>
// //             </View>
// //           </View>
// //         </View>

// //         <View style={styles.vehicleRow}>
// //           <Ionicons name="car-sport-outline" size={14} color={Colors.gray} />
// //           <Text style={styles.vehicleText} numberOfLines={1}>{vehicleLabel}</Text>
// //         </View>

// //         {preferenceBadges.length > 0 && (
// //           <ScrollView
// //             horizontal
// //             showsHorizontalScrollIndicator={false}
// //             contentContainerStyle={styles.badgeScroll}
// //           >
// //             {preferenceBadges.map((badge, index) => (
// //               <PreferenceTag key={`${badge}-${index}`} label={badge} />
// //             ))}
// //           </ScrollView>
// //         )}
// //       </TouchableOpacity>
// //     );
// //   };

// //   if (authLoading || loading) {
// //     return (
// //       <View style={styles.loadingContainer}>
// //         <LottieView
// //           source={require("../assets/loading.json")}
// //           autoPlay
// //           loop
// //           style={{ width: 300, height: 300 }}
// //         />
// //       </View>
// //     );
// //   }

// //   return (
// //     <SafeAreaView style={styles.container}>
// //       <StatusBar barStyle="dark-content" backgroundColor={Colors.white} />

// //       <View style={styles.header}>
// //         <TouchableOpacity
// //           style={styles.backButton}
// //           onPress={() => navigation.goBack()}
// //         >
// //           <MaterialIcons name="arrow-back-ios" size={24} color="#ED7117" />
// //         </TouchableOpacity>

// //         <Text style={styles.headerTitle}>Available Rides</Text>

// //         <TouchableOpacity
// //           style={[
// //             styles.filterButton,
// //             headerFiltersVisible && styles.filterButtonActive
// //           ]}
// //           onPress={() => setHeaderFiltersVisible(prev => !prev)}
// //         >
// //           <Ionicons name="options-outline" size={22} color="#ED7117" />
// //         </TouchableOpacity>
// //       </View>

// //       {headerFiltersVisible ? (
// //         <View style={styles.topControlsWrap}>
// //           <ScrollView
// //             horizontal
// //             showsHorizontalScrollIndicator={false}
// //             contentContainerStyle={styles.filterScroll}
// //           >
// //             {quickFilterOptions.map((filter) => {
// //               const active = quickFilters.includes(filter.key);
// //               return (
// //                 <TouchableOpacity
// //                   key={filter.key}
// //                   activeOpacity={0.85}
// //                   style={[styles.quickChip, active && styles.quickChipActive]}
// //                   onPress={() => toggleQuickFilter(filter.key)}
// //                 >
// //                   <Text
// //                     style={[
// //                       styles.quickChipText,
// //                       active && styles.quickChipTextActive,
// //                     ]}
// //                   >
// //                     {filter.label}
// //                   </Text>
// //                 </TouchableOpacity>
// //               );
// //             })}

// //             <TouchableOpacity
// //               activeOpacity={0.85}
// //               style={styles.moreFilterChip}
// //               onPress={() => setFilterModalVisible(true)}
// //             >
// //               <Ionicons name="options-outline" size={14} color="#ED7117" />
// //               <Text style={styles.moreFilterChipText}>More Filters</Text>
// //             </TouchableOpacity>
// //           </ScrollView>

// //           <Text style={styles.sortLabel}>Sort by</Text>

// //           <ScrollView
// //             horizontal
// //             showsHorizontalScrollIndicator={false}
// //             contentContainerStyle={styles.sortScroll}
// //           >
// //             {SORT_OPTIONS.map((option) => {
// //               const active = sortBy === option.key;
// //               return (
// //                 <TouchableOpacity
// //                   key={option.key}
// //                   activeOpacity={0.85}
// //                   style={[styles.sortChip, active && styles.sortChipActive]}
// //                   onPress={() => setSortBy(option.key)}
// //                 >
// //                   <Text
// //                     style={[
// //                       styles.sortChipText,
// //                       active && styles.sortChipTextActive,
// //                     ]}
// //                   >
// //                     {option.label}
// //                   </Text>
// //                 </TouchableOpacity>
// //               );
// //             })}
// //           </ScrollView>
// //         </View>
// //       ) : null}

// //       {processedRides.length === 0 ? (
// //         <View style={styles.emptyContainer}>
// //           <Ionicons name="car-outline" size={80} color={Colors.gray} />
// //           <Text style={styles.emptyTitle}>No Rides Found</Text>
// //           <Text style={styles.emptySubtitle}>
// //             {errorMessage
// //               ? errorMessage
// //               : 'No rides available for this route at the selected time.'}
// //           </Text>

// //           <TouchableOpacity 
// //             style={styles.requestAlertButton} 
// //             onPress={() => setShowRideRequestModal(true)}
// //           >
// //             <Ionicons name="notifications-outline" size={20} color={Colors.white} />
// //             <Text style={styles.requestAlertButtonText}>Notify me when a ride is available</Text>
// //           </TouchableOpacity>

// //           <TouchableOpacity style={styles.clearButton} onPress={clearAllFilters}>
// //             <Text style={styles.clearButtonText}>Clear Filters</Text>
// //           </TouchableOpacity>
// //         </View>
// //       ) : (
// //         <FlatList
// //           data={processedRides}
// //           renderItem={renderRideCard}
// //           keyExtractor={(item) => String(item.id)}
// //           contentContainerStyle={styles.listContent}
// //           showsVerticalScrollIndicator={false}
// //           refreshControl={
// //             <RefreshControl
// //               refreshing={refreshing}
// //               onRefresh={onRefresh}
// //               colors={[Colors.primary]}
// //               tintColor={Colors.primary}
// //             />
// //           }
// //           ItemSeparatorComponent={() => <View style={{ height: 12 }} />}
// //         />
// //       )}

// //       <Modal
// //         visible={filterModalVisible}
// //         transparent
// //         animationType="slide"
// //         onRequestClose={() => setFilterModalVisible(false)}
// //       >
// //         <View style={styles.modalBackdrop}>
// //           <TouchableOpacity
// //             style={styles.modalOverlay}
// //             activeOpacity={1}
// //             onPress={() => setFilterModalVisible(false)}
// //           />

// //           <View style={styles.modalSheet}>
// //             <View style={styles.modalHandle} />

// //             <View style={styles.modalHeader}>
// //               <Text style={styles.modalTitle}>More Filters</Text>
// //               <TouchableOpacity onPress={() => setFilterModalVisible(false)}>
// //                 <Ionicons name="close" size={24} color={Colors.dark} />
// //               </TouchableOpacity>
// //             </View>

// //             <ScrollView
// //               showsVerticalScrollIndicator={false}
// //               contentContainerStyle={styles.modalContent}
// //             >
// //               {advancedFilterOptions.map((pref) => (
// //                 <View key={pref.key} style={styles.modalSection}>
// //                   <Text style={styles.modalSectionTitle}>{pref.label}</Text>
// //                   {renderAdvancedFilterControl(pref)}
// //                 </View>
// //               ))}
// //             </ScrollView>

// //             <View style={styles.modalFooter}>
// //               <TouchableOpacity
// //                 style={styles.modalSecondaryBtn}
// //                 onPress={clearAllFilters}
// //               >
// //                 <Text style={styles.modalSecondaryBtnText}>Clear</Text>
// //               </TouchableOpacity>

// //               <TouchableOpacity
// //                 style={styles.modalPrimaryBtn}
// //                 onPress={() => setFilterModalVisible(false)}
// //               >
// //                 <Text style={styles.modalPrimaryBtnText}>Apply Filters</Text>
// //               </TouchableOpacity>
// //             </View>
// //           </View>
// //         </View>
// //       </Modal>

// //       {/* Ride Request Modal */}
// //       <RideRequestModal />

// //       <ProfileImageModal
// //         visible={selectedProfile.visible}
// //         imageUrl={selectedProfile.imageUrl}
// //         driverName={selectedProfile.driverName}
// //         onClose={() => setSelectedProfile({ visible: false, imageUrl: null, driverName: '' })}
// //       />

// //       <CustomAlert
// //         visible={alertVisible}
// //         title={alertConfig.title}
// //         message={alertConfig.message}
// //         icon={alertConfig.icon}
// //         iconColor={alertConfig.iconColor}
// //         buttons={alertConfig.buttons}
// //         onBackdropPress={() => setAlertVisible(false)}
// //       />
// //     </SafeAreaView>
// //   );
// // }

// // const styles = StyleSheet.create({
// //   container: {
// //     flex: 1,
// //     backgroundColor: '#fff',
// //   },
// //   header: {
// //     flexDirection: 'row',
// //     alignItems: 'center',
// //     paddingHorizontal: 16,
// //     paddingVertical: 12,
// //     borderBottomWidth: 0.5,
// //     borderBottomColor: '#fff',
// //     backgroundColor: Colors.white,
// //   },
// //   backButton: {
// //     width: 44,
// //     height: 44,
// //     justifyContent: 'center',
// //   },
// //   filterButton: {
// //     width: 44,
// //     height: 44,
// //     justifyContent: 'center',
// //     alignItems: 'center',
// //     borderRadius: 22,
// //   },
// //   filterButtonActive: {
// //     backgroundColor: '#fff',
// //   },
// //   headerTitle: {
// //     ...Typography.h2,
// //     fontSize: 28,
// //     fontWeight: '700',
// //     color: Colors.primary,
// //     flex: 1,
// //     textAlign: 'center',
// //   },
// //   topControlsWrap: {
// //     backgroundColor: Colors.white,
// //     paddingTop: 10,
// //     paddingBottom: 12,
// //     borderBottomWidth: 1,
// //     borderBottomColor: '#EEF2F7',
// //   },
// //   filterScroll: {
// //     paddingHorizontal: 16,
// //     gap: 10,
// //   },
// //   quickChip: {
// //     paddingHorizontal: 14,
// //     paddingVertical: 10,
// //     borderRadius: 20,
// //     backgroundColor: '#F3F4F6',
// //   },
// //   quickChipActive: {
// //     backgroundColor: Colors.primary,
// //   },
// //   quickChipText: {
// //     fontSize: 12,
// //     fontWeight: '600',
// //     color: Colors.dark,
// //   },
// //   quickChipTextActive: {
// //     color: Colors.white,
// //   },
// //   moreFilterChip: {
// //     flexDirection: 'row',
// //     alignItems: 'center',
// //     gap: 6,
// //     paddingHorizontal: 14,
// //     paddingVertical: 10,
// //     borderRadius: 20,
// //     backgroundColor: '#EEF6FF',
// //   },
// //   moreFilterChipText: {
// //     fontSize: 12,
// //     fontWeight: '700',
// //     color: '#ED7117',
// //   },
// //   sortLabel: {
// //     paddingHorizontal: 16,
// //     marginTop: 12,
// //     marginBottom: 8,
// //     fontSize: 12,
// //     color: Colors.gray,
// //     fontWeight: '700',
// //   },
// //   sortScroll: {
// //     paddingHorizontal: 16,
// //     gap: 10,
// //   },
// //   sortChip: {
// //     paddingHorizontal: 14,
// //     paddingVertical: 8,
// //     borderRadius: 14,
// //     backgroundColor: '#F3F4F6',
// //   },
// //   sortChipActive: {
// //     backgroundColor: '#ED7117',
// //   },
// //   sortChipText: {
// //     fontSize: 12,
// //     color: Colors.dark,
// //     fontWeight: '600',
// //   },
// //   sortChipTextActive: {
// //     color: Colors.white,
// //   },
// //   listContent: {
// //     padding: 16,
// //     paddingBottom: 28,
// //   },
// //   rideCard: {
// //     backgroundColor: Colors.white,
// //     borderRadius: 18,
// //     padding: 14,
// //     borderWidth: 1,
// //     borderColor: '#EEF2F7',
// //     shadowColor: '#0F172A',
// //     shadowOffset: { width: 0, height: 6 },
// //     shadowOpacity: 0.05,
// //     shadowRadius: 14,
// //     elevation: 2,
// //   },
// //   rideCardWarning: {
// //     backgroundColor: '#FFFBEB',
// //     borderColor: '#FDE68A',
// //   },
// //   rideCardFull: {
// //     backgroundColor: '#FEF2F2',
// //     borderColor: '#FEE2E2',
// //     opacity: 0.85,
// //   },
// //   cardTopRow: {
// //     flexDirection: 'row',
// //     justifyContent: 'space-between',
// //     alignItems: 'flex-start',
// //   },
// //   profileRow: {
// //     flexDirection: 'row',
// //     flex: 1,
// //     paddingRight: 10,
// //   },
// //   avatarContainer: {
// //     width: 48,
// //     height: 48,
// //     borderRadius: 24,
// //     backgroundColor: '#E5E7EB',
// //     alignItems: 'center',
// //     justifyContent: 'center',
// //     overflow: 'hidden',
// //     marginRight: 10,
// //   },
// //   avatarImage: {
// //     width: 48,
// //     height: 48,
// //   },
// //   avatarFallback: {
// //     fontSize: 14,
// //     fontWeight: '800',
// //     color: Colors.gray,
// //   },
// //   profileContent: {
// //     flex: 1,
// //   },
// //   nameRow: {
// //     flexDirection: 'row',
// //     alignItems: 'center',
// //     flexWrap: 'wrap',
// //     gap: 6,
// //   },
// //   driverName: {
// //     fontSize: 15,
// //     fontWeight: '800',
// //     color: Colors.dark,
// //     maxWidth: '100%',
// //   },
// //   verifiedBadge: {
// //     flexDirection: 'row',
// //     alignItems: 'center',
// //     gap: 4,
// //     backgroundColor: '#E8F5E9',
// //     paddingHorizontal: 6,
// //     paddingVertical: 2,
// //     borderRadius: 12,
// //   },
// //   verifiedText: {
// //     fontSize: 10,
// //     fontWeight: '700',
// //     color: '#16A34A',
// //   },
// //   womenOnlyBadge: {
// //     flexDirection: 'row',
// //     alignItems: 'center',
// //     gap: 4,
// //     backgroundColor: '#FCE4EC',
// //     paddingHorizontal: 8,
// //     paddingVertical: 3,
// //     borderRadius: 12,
// //   },
// //   womenOnlyBadgeText: {
// //     fontSize: 10,
// //     color: '#E91E63',
// //     fontWeight: '700',
// //   },
// //   fullBadge: {
// //     flexDirection: 'row',
// //     alignItems: 'center',
// //     gap: 4,
// //     backgroundColor: '#FEF2F2',
// //     paddingHorizontal: 8,
// //     paddingVertical: 3,
// //     borderRadius: 12,
// //     borderWidth: 1,
// //     borderColor: '#FEE2E2',
// //   },
// //   fullBadgeText: {
// //     fontSize: 10,
// //     color: '#EF4444',
// //     fontWeight: '700',
// //   },
// //   ratingRow: {
// //     flexDirection: 'row',
// //     alignItems: 'center',
// //     marginTop: 4,
// //   },
// //   ratingText: {
// //     fontSize: 11,
// //     color: Colors.gray,
// //     fontWeight: '600',
// //   },
// //   priceMatchWrap: {
// //     alignItems: 'flex-end',
// //   },
// //   matchBadge: {
// //     backgroundColor: '#EEF6FF',
// //     paddingHorizontal: 8,
// //     paddingVertical: 4,
// //     borderRadius: 10,
// //     marginBottom: 6,
// //   },
// //   matchText: {
// //     fontSize: 12,
// //     fontWeight: '800',
// //     color: Colors.primary,
// //   },
// //   priceText: {
// //     fontSize: 18,
// //     fontWeight: '800',
// //     color: '#ED7117',
// //     lineHeight: 20,
// //   },
// //   perSeatText: {
// //     fontSize: 10,
// //     color: Colors.gray,
// //     fontWeight: '600',
// //     marginTop: 2,
// //   },
// //   infoRow: {
// //     flexDirection: 'row',
// //     alignItems: 'center',
// //     flexWrap: 'wrap',
// //     marginTop: 12,
// //     marginBottom: 10,
// //   },
// //   infoItem: {
// //     flexDirection: 'row',
// //     alignItems: 'center',
// //     gap: 4,
// //   },
// //   infoText: {
// //     fontSize: 12,
// //     color: Colors.dark,
// //     fontWeight: '600',
// //   },
// //   warningText: {
// //     color: '#F59E0B',
// //   },
// //   fullText: {
// //     color: '#EF4444',
// //   },
// //   infoDot: {
// //     width: 4,
// //     height: 4,
// //     borderRadius: 2,
// //     backgroundColor: '#CBD5E1',
// //     marginHorizontal: 8,
// //   },
// //   seatWarningContainer: {
// //     flexDirection: 'row',
// //     alignItems: 'center',
// //     backgroundColor: '#FEF3C7',
// //     borderRadius: 8,
// //     padding: 8,
// //     marginTop: 8,
// //     marginBottom: 4,
// //     gap: 6,
// //   },
// //   seatWarningText: {
// //     flex: 1,
// //     fontSize: 11,
// //     color: '#D97706',
// //     fontWeight: '600',
// //   },
// //   fullWarningContainer: {
// //     flexDirection: 'row',
// //     alignItems: 'center',
// //     backgroundColor: '#FEF2F2',
// //     borderRadius: 8,
// //     padding: 8,
// //     marginTop: 8,
// //     marginBottom: 4,
// //     borderWidth: 1,
// //     borderColor: '#FEE2E2',
// //     gap: 6,
// //   },
// //   fullWarningText: {
// //     flex: 1,
// //     fontSize: 11,
// //     color: '#EF4444',
// //     fontWeight: '600',
// //   },
// //   divider: {
// //     height: 1,
// //     backgroundColor: '#EEF2F7',
// //     marginBottom: 10,
// //   },
// //   routeBlock: {
// //     gap: 8,
// //   },
// //   routeRow: {
// //     flexDirection: 'row',
// //     alignItems: 'flex-start',
// //   },
// //   routeDot: {
// //     width: 8,
// //     height: 8,
// //     borderRadius: 4,
// //     marginTop: 5,
// //     marginRight: 8,
// //   },
// //   routeTextWrap: {
// //     flex: 1,
// //   },
// //   routeLabel: {
// //     fontSize: 11,
// //     color: Colors.gray,
// //     fontWeight: '700',
// //     marginBottom: 2,
// //   },
// //   routeText: {
// //     fontSize: 13,
// //     color: Colors.dark,
// //     fontWeight: '600',
// //     lineHeight: 18,
// //   },
// //   vehicleRow: {
// //     flexDirection: 'row',
// //     alignItems: 'center',
// //     gap: 6,
// //     marginTop: 10,
// //   },
// //   vehicleText: {
// //     fontSize: 12,
// //     color: Colors.gray,
// //     fontWeight: '600',
// //     flex: 1,
// //   },
// //   badgeScroll: {
// //     gap: 8,
// //     paddingTop: 10,
// //   },
// //   prefBadge: {
// //     paddingHorizontal: 10,
// //     paddingVertical: 6,
// //     borderRadius: 12,
// //     marginRight: 8,
// //   },
// //   prefBadgeText: {
// //     fontSize: 11,
// //     fontWeight: '700',
// //   },
// //   loadingContainer: {
// //     flex: 1,
// //     justifyContent: 'center',
// //     alignItems: 'center',
// //     backgroundColor: Colors.white,
// //   },
// //   emptyContainer: {
// //     flex: 1,
// //     justifyContent: 'center',
// //     alignItems: 'center',
// //     paddingHorizontal: 40,
// //   },
// //   emptyTitle: {
// //     fontSize: 22,
// //     fontWeight: '700',
// //     color: Colors.dark,
// //     marginTop: 20,
// //     marginBottom: 8,
// //   },
// //   emptySubtitle: {
// //     fontSize: 15,
// //     color: Colors.gray,
// //     textAlign: 'center',
// //     lineHeight: 22,
// //     marginBottom: 24,
// //   },
// //   requestAlertButton: {
// //     flexDirection: 'row',
// //     alignItems: 'center',
// //     justifyContent: 'center',
// //     backgroundColor: Colors.primary,
// //     paddingHorizontal: 20,
// //     paddingVertical: 14,
// //     borderRadius: 12,
// //     marginBottom: 12,
// //     gap: 8,
// //     width: '100%',
// //   },
// //   requestAlertButtonText: {
// //     color: Colors.white,
// //     fontSize: 15,
// //     fontWeight: '600',
// //   },
// //   clearButton: {
// //     backgroundColor: Colors.primary,
// //     paddingHorizontal: 24,
// //     paddingVertical: 12,
// //     borderRadius: 12,
// //   },
// //   clearButtonText: {
// //     color: Colors.white,
// //     fontSize: 15,
// //     fontWeight: '700',
// //   },
// //   modalBackdrop: {
// //     flex: 1,
// //     backgroundColor: 'rgba(15,23,42,0.28)',
// //     justifyContent: 'flex-end',
// //   },
// //   modalOverlay: {
// //     flex: 1,
// //   },
// //   modalSheet: {
// //     backgroundColor: Colors.white,
// //     borderTopLeftRadius: 24,
// //     borderTopRightRadius: 24,
// //     maxHeight: '78%',
// //     paddingTop: 10,
// //   },
// //   requestModalSheet: {
// //     backgroundColor: Colors.white,
// //     borderTopLeftRadius: 24,
// //     borderTopRightRadius: 24,
// //     maxHeight: '80%',
// //     paddingTop: 10,
// //   },
// //   modalHandle: {
// //     width: 52,
// //     height: 5,
// //     borderRadius: 999,
// //     backgroundColor: '#D1D5DB',
// //     alignSelf: 'center',
// //     marginBottom: 14,
// //   },
// //   modalHeader: {
// //     flexDirection: 'row',
// //     alignItems: 'center',
// //     justifyContent: 'space-between',
// //     paddingHorizontal: 18,
// //     paddingBottom: 10,
// //   },
// //   modalTitle: {
// //     fontSize: 20,
// //     fontWeight: '800',
// //     color: Colors.dark,
// //   },
// //   modalContent: {
// //     paddingHorizontal: 18,
// //     paddingBottom: 20,
// //   },
// //   requestModalContent: {
// //     padding: 20,
// //   },
// //   modalSection: {
// //     marginBottom: 18,
// //   },
// //   modalSectionTitle: {
// //     fontSize: 14,
// //     fontWeight: '700',
// //     color: Colors.dark,
// //     marginBottom: 10,
// //   },
// //   modalToggleChip: {
// //     borderRadius: 14,
// //     borderWidth: 1,
// //     borderColor: '#E5E7EB',
// //     paddingHorizontal: 14,
// //     paddingVertical: 10,
// //     alignSelf: 'flex-start',
// //     backgroundColor: '#F9FAFB',
// //   },
// //   modalToggleChipActive: {
// //     backgroundColor: Colors.primary,
// //     borderColor: Colors.primary,
// //   },
// //   modalToggleChipText: {
// //     fontSize: 13,
// //     color: Colors.dark,
// //     fontWeight: '600',
// //   },
// //   modalToggleChipTextActive: {
// //     color: Colors.white,
// //   },
// //   modalOptionWrap: {
// //     flexDirection: 'row',
// //     flexWrap: 'wrap',
// //     gap: 10,
// //   },
// //   modalOptionChip: {
// //     borderRadius: 16,
// //     borderWidth: 1,
// //     borderColor: '#E5E7EB',
// //     paddingHorizontal: 12,
// //     paddingVertical: 9,
// //     backgroundColor: '#F9FAFB',
// //   },
// //   modalOptionChipActive: {
// //     backgroundColor: Colors.primary,
// //     borderColor: Colors.primary,
// //   },
// //   modalOptionChipText: {
// //     fontSize: 13,
// //     color: Colors.dark,
// //     fontWeight: '600',
// //   },
// //   modalOptionChipTextActive: {
// //     color: Colors.white,
// //   },
// //   modalFooter: {
// //     flexDirection: 'row',
// //     paddingHorizontal: 18,
// //     paddingTop: 12,
// //     paddingBottom: Platform.OS === 'ios' ? 28 : 18,
// //     borderTopWidth: 1,
// //     borderTopColor: '#EEF2F7',
// //     gap: 12,
// //   },
// //   modalSecondaryBtn: {
// //     flex: 1,
// //     borderRadius: 14,
// //     paddingVertical: 14,
// //     alignItems: 'center',
// //     backgroundColor: '#F3F4F6',
// //   },
// //   modalSecondaryBtnText: {
// //     fontSize: 15,
// //     fontWeight: '700',
// //     color: Colors.dark,
// //   },
// //   modalPrimaryBtn: {
// //     flex: 1,
// //     borderRadius: 14,
// //     paddingVertical: 14,
// //     alignItems: 'center',
// //     backgroundColor: Colors.primary,
// //   },
// //   modalPrimaryBtnText: {
// //     fontSize: 15,
// //     fontWeight: '700',
// //     color: Colors.white,
// //   },
// //   requestInfoBox: {
// //     flexDirection: 'row',
// //     alignItems: 'center',
// //     backgroundColor: '#EFF6FF',
// //     padding: 12,
// //     borderRadius: 12,
// //     marginBottom: 16,
// //     gap: 8,
// //   },
// //   requestInfoText: {
// //     flex: 1,
// //     fontSize: 13,
// //     color: '#1E3A8A',
// //     lineHeight: 18,
// //   },
// //   requestRouteBox: {
// //     backgroundColor: '#F3F4F6',
// //     padding: 12,
// //     borderRadius: 12,
// //     marginBottom: 20,
// //   },
// //   requestRouteLabel: {
// //     fontSize: 12,
// //     fontWeight: '600',
// //     color: Colors.gray,
// //     marginBottom: 4,
// //   },
// //   requestRouteText: {
// //     fontSize: 14,
// //     fontWeight: '600',
// //     color: Colors.dark,
// //     marginBottom: 4,
// //   },
// //   requestRouteDetail: {
// //     fontSize: 12,
// //     color: Colors.gray,
// //     marginTop: 2,
// //   },
// //   requestInputGroup: {
// //     marginBottom: 16,
// //   },
// //   requestLabel: {
// //     fontSize: 14,
// //     fontWeight: '600',
// //     color: Colors.dark,
// //     marginBottom: 8,
// //   },
// //   requestInput: {
// //     borderWidth: 1,
// //     borderColor: '#E5E7EB',
// //     borderRadius: 12,
// //     paddingHorizontal: 12,
// //     paddingVertical: 10,
// //     fontSize: 14,
// //     backgroundColor: '#F9FAFB',
// //   },
// //   requestTextArea: {
// //     minHeight: 80,
// //     textAlignVertical: 'top',
// //   },
// //   requestHelper: {
// //     fontSize: 11,
// //     color: Colors.gray,
// //     marginTop: 4,
// //   },
// //   requestNoteBox: {
// //     flexDirection: 'row',
// //     alignItems: 'center',
// //     backgroundColor: '#FEF3C7',
// //     padding: 12,
// //     borderRadius: 12,
// //     gap: 8,
// //   },
// //   requestNoteText: {
// //     flex: 1,
// //     fontSize: 12,
// //     color: '#D97706',
// //   },
// //   disabledButton: {
// //     opacity: 0.6,
// //   },
// //   imageModalContainer: {
// //     flex: 1,
// //     justifyContent: 'center',
// //     alignItems: 'center',
// //     backgroundColor: 'rgba(0,0,0,0.9)',
// //   },
// //   imageModalContent: {
// //     width: '90%',
// //     backgroundColor: Colors.white,
// //     borderRadius: 20,
// //     overflow: 'hidden',
// //   },
// //   imageModalHeader: {
// //     flexDirection: 'row',
// //     justifyContent: 'space-between',
// //     alignItems: 'center',
// //     padding: 16,
// //     borderBottomWidth: 1,
// //     borderBottomColor: '#EEF2F7',
// //   },
// //   imageModalTitle: {
// //     fontSize: 18,
// //     fontWeight: '700',
// //     color: Colors.dark,
// //   },
// //   fullProfileImage: {
// //     width: '100%',
// //     height: 400,
// //     backgroundColor: '#F5F5F5',
// //   },
// //   noImageContainer: {
// //     width: '100%',
// //     height: 400,
// //     justifyContent: 'center',
// //     alignItems: 'center',
// //     backgroundColor: '#F5F5F5',
// //   },
// //   noImageText: {
// //     fontSize: 16,
// //     color: Colors.gray,
// //   },
// //   svgContainer: {
// //     width: 48,
// //     height: 48,
// //     alignItems: 'center',
// //     justifyContent: 'center',
// //   },
// //   initialsContainer: {
// //     width: '100%',
// //     height: '100%',
// //     alignItems: 'center',
// //     justifyContent: 'center',
// //     backgroundColor: '#E5E7EB',
// //   },
// //   modalSvgContainer: {
// //     width: '100%',
// //     height: 400,
// //     backgroundColor: '#F5F5F5',
// //     alignItems: 'center',
// //     justifyContent: 'center',
// //   },
// // });
// // // import React, { useState, useEffect, useCallback, useMemo } from 'react';
// // // import {
// // //   View,
// // //   Text,
// // //   StyleSheet,
// // //   TouchableOpacity,
// // //   FlatList,
// // //   StatusBar,
// // //   Platform,
// // //   Image,
// // //   ScrollView,
// // //   Modal,
// // //   RefreshControl,
// // //   TextInput,
// // //   ActivityIndicator,
// // // } from 'react-native';
// // // import { SafeAreaView } from 'react-native-safe-area-context';
// // // import { Ionicons, MaterialIcons } from '@expo/vector-icons';
// // // import LottieView from "lottie-react-native";
// // // import { Colors, Typography } from '../constants/Colors';
// // // import { useAuth } from '../context/AuthContext';
// // // import { API_BASE_URL } from '../config/config_ip';
// // // import DatabaseService from '../services/matchingpreference_ds';
// // // import CustomAlert from '../components/CustomAlert';
// // // import { SvgCssUri } from 'react-native-svg/css';
// // // import { useFocusEffect } from '@react-navigation/native';

// // // const IMAGE_BASE_URL = API_BASE_URL;

// // // // Enable fetch logging for debugging
// // // const originalFetch = global.fetch;
// // // global.fetch = async (...args) => {
// // //   const [url, options] = args;
  
// // //   // Log outgoing requests for ride-related endpoints
// // //   if (typeof url === 'string' && (url.includes('/request-ride-alert') || 
// // //       url.includes('/my-ride-requests') || 
// // //       url.includes('/search-rides'))) {
// // //     console.log(`\n🌐 ========== API REQUEST ==========`);
// // //     console.log(`📍 URL: ${url}`);
// // //     console.log(`📌 Method: ${options?.method || 'GET'}`);
// // //     if (options?.body) {
// // //       try {
// // //         const body = JSON.parse(options.body);
// // //         console.log(`📦 Body:`, JSON.stringify(body, null, 2));
// // //       } catch(e) {
// // //         console.log(`📦 Body: ${options.body}`);
// // //       }
// // //     }
// // //   }
  
// // //   const response = await originalFetch(...args);
  
// // //   // Log responses
// // //   if (typeof url === 'string' && (url.includes('/request-ride-alert') || 
// // //       url.includes('/my-ride-requests') || 
// // //       url.includes('/search-rides'))) {
// // //     const clonedResponse = response.clone();
// // //     const data = await clonedResponse.json();
// // //     console.log(`\n📥 RESPONSE:`);
// // //     console.log(`   Status: ${response.status}`);
// // //     console.log(`   Data:`, JSON.stringify(data, null, 2));
// // //     console.log(`====================================\n`);
// // //   }
  
// // //   return response;
// // // };

// // // const QUICK_FILTER_KEYS = [
// // //   'verified_profiles_only',
// // //   'same_gender_after_9pm',
// // //   'smoking_policy',
// // //   'pets_allowed',
// // //   'chat_level',
// // //   'luggage_allowance',
// // // ];

// // // const QUICK_FILTER_LABELS = {
// // //   verified_profiles_only: 'Verified Only',
// // //   same_gender_after_9pm: 'Same Gender Night',
// // //   smoking_policy: 'No Smoking',
// // //   pets_allowed: 'Pets',
// // //   chat_level: 'Chat Level',
// // //   luggage_allowance: 'Luggage',
// // // };

// // // const SORT_OPTIONS = [
// // //   { key: 'time', label: 'Time' },
// // //   { key: 'price', label: 'Price' },
// // //   { key: 'rating', label: 'Rating' },
// // //   { key: 'match', label: 'Match %' },
// // // ];

// // // function buildImageUrl(url) {
// // //   if (!url) return null;
// // //   if (url.startsWith('http://') || url.startsWith('https://')) return url;
// // //   return `${IMAGE_BASE_URL}${url.startsWith('/') ? '' : '/'}${url}`;
// // // }

// // // function getDriverInitials(name) {
// // //   if (!name) return 'D';
// // //   const parts = name.trim().split(' ').filter(Boolean);
// // //   if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
// // //   return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
// // // }

// // // function normalizeText(value) {
// // //   if (value === undefined || value === null) return '';
// // //   return String(value).trim().toLowerCase();
// // // }

// // // function getRidePreferences(item) {
// // //   if (item.preferences) return item.preferences;
// // //   if (item.ridePreferences) return item.ridePreferences;
// // //   if (item.matchingPreferences) return item.matchingPreferences;
// // //   if (item.travel_preferences) return item.travel_preferences;
// // //   return {};
// // // }

// // // function extractPreferenceBadges(item) {
// // //   const prefs = getRidePreferences(item);
// // //   const badges = [];

// // //   if (!prefs || Object.keys(prefs).length === 0) {
// // //     return [];
// // //   }

// // //   Object.entries(prefs).forEach(([key, value]) => {
// // //     if (value === null || value === undefined) return;
    
// // //     if (typeof value === 'boolean') {
// // //       if (value === true) {
// // //         if (key === 'verified_profiles_only') {
// // //           badges.push('Verified Only');
// // //         } else {
// // //           const displayKey = key.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
// // //           badges.push(displayKey);
// // //         }
// // //       }
// // //     } 
// // //     else if (Array.isArray(value)) {
// // //       if (value.length > 0) {
// // //         value.forEach(v => {
// // //           if (v && v.trim()) {
// // //             badges.push(v.trim());
// // //           }
// // //         });
// // //       }
// // //     }
// // //     else if (typeof value === 'string' && value.trim()) {
// // //       const lowerValue = value.toLowerCase();
// // //       if (!['false', 'no', 'none', 'null', 'undefined', 'no preference'].includes(lowerValue)) {
// // //         badges.push(value);
// // //       }
// // //     }
// // //     else if (typeof value === 'number') {
// // //       badges.push(String(value));
// // //     }
// // //   });

// // //   return [...new Set(badges)];
// // // }

// // // async function fetchUserDocuments(phoneNumber) {
// // //   try {
// // //     const url = `${API_BASE_URL}/api/v1/documents/user/${phoneNumber}`;
// // //     const res = await fetch(url, { headers: { Accept: 'application/json' } });
// // //     if (!res.ok) return null;
// // //     const data = await res.json();
// // //     return data;
// // //   } catch (e) {
// // //     console.log('fetchUserDocuments error:', e);
// // //     return null;
// // //   }
// // // }

// // // async function fetchDriverProfile(phoneNumber, userId) {
// // //   try {
// // //     const params = new URLSearchParams();
// // //     if (userId) params.append('user_id', userId);
// // //     else if (phoneNumber) params.append('phone_number', phoneNumber);
// // //     else return null;
// // //     const url = `${API_BASE_URL}/api/v1/users/profile-public?${params.toString()}`;
// // //     const res = await fetch(url, { headers: { Accept: 'application/json' } });
// // //     if (!res.ok) return null;
// // //     const data = await res.json();
// // //     return data;
// // //   } catch (e) {
// // //     console.log('fetchDriverProfile error:', e);
// // //     return null;
// // //   }
// // // }

// // // function checkVerifiedDocuments(docs) {
// // //   if (!docs || !docs.length) return false;
  
// // //   const verified = docs.filter(doc => {
// // //     const docType = doc.document_type?.toLowerCase();
// // //     const status = doc.status?.toUpperCase();
// // //     return status === 'APPROVED' && ['aadhar', 'dl', 'rc'].includes(docType);
// // //   });
  
// // //   return verified.length > 0;
// // // }

// // // function RatingStars({ rating, size = 12, showLabel = true }) {
// // //   const fullStars = Math.floor(rating);
// // //   const hasHalfStar = rating % 1 >= 0.5;
// // //   const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);
  
// // //   return (
// // //     <View style={{ flexDirection: 'row', alignItems: 'center' }}>
// // //       {[...Array(fullStars)].map((_, i) => (
// // //         <Ionicons key={`full-${i}`} name="star" size={size} color="#F59E0B" />
// // //       ))}
// // //       {hasHalfStar && (
// // //         <Ionicons name="star-half" size={size} color="#F59E0B" />
// // //       )}
// // //       {[...Array(emptyStars)].map((_, i) => (
// // //         <Ionicons key={`empty-${i}`} name="star-outline" size={size} color="#F59E0B" />
// // //       ))}
// // //       {showLabel && rating > 0 && (
// // //         <Text style={[styles.ratingText, { marginLeft: 4 }]}>({rating.toFixed(1)})</Text>
// // //       )}
// // //       {showLabel && rating === 0 && (
// // //         <Text style={[styles.ratingText, { marginLeft: 4 }]}>New</Text>
// // //       )}
// // //     </View>
// // //   );
// // // }

// // // function matchesQuickFilter(item, key) {
// // //   const prefs = getRidePreferences(item);
// // //   const value = prefs?.[key];
// // //   const normalized = normalizeText(value);

// // //   if (key === 'verified_profiles_only') {
// // //     return !!item.isVerified;
// // //   }

// // //   if (typeof value === 'boolean') return value;
// // //   if (Array.isArray(value)) return value.length > 0;

// // //   if (key === 'smoking_policy') {
// // //     return normalized.includes('no');
// // //   }

// // //   if (key === 'same_gender_after_9pm') {
// // //     return normalized === 'true' || normalized === 'yes' || normalized === 'same gender';
// // //   }

// // //   if (key === 'pets_allowed') {
// // //     return normalized === 'true' || normalized === 'yes' || normalized === 'allowed';
// // //   }

// // //   return !!normalized;
// // // }

// // // function matchesAdvancedFilter(item, key, expectedValue) {
// // //   if (expectedValue === undefined || expectedValue === null || expectedValue === '') {
// // //     return true;
// // //   }

// // //   const prefs = getRidePreferences(item);
// // //   const rideValue = prefs?.[key];

// // //   if (typeof expectedValue === 'boolean') {
// // //     if (key === 'verified_profiles_only') {
// // //       return expectedValue ? !!item.isVerified : true;
// // //     }
// // //     return rideValue === expectedValue || normalizeText(rideValue) === String(expectedValue);
// // //   }

// // //   if (Array.isArray(rideValue)) {
// // //     return rideValue.map(v => normalizeText(v)).includes(normalizeText(expectedValue));
// // //   }

// // //   return normalizeText(rideValue) === normalizeText(expectedValue);
// // // }

// // // function ProfileImageModal({ visible, imageUrl, driverName, onClose }) {
// // //   const [isSvg, setIsSvg] = useState(false);
  
// // //   useEffect(() => {
// // //     if (imageUrl) {
// // //       setIsSvg(imageUrl.toLowerCase().includes('.svg'));
// // //     }
// // //   }, [imageUrl]);
  
// // //   if (!visible) return null;
  
// // //   return (
// // //     <Modal
// // //       visible={visible}
// // //       transparent={true}
// // //       animationType="fade"
// // //       onRequestClose={onClose}
// // //     >
// // //       <TouchableOpacity 
// // //         style={styles.modalBackdrop}
// // //         activeOpacity={1}
// // //         onPress={onClose}
// // //       >
// // //         <View style={styles.imageModalContainer}>
// // //           <View style={styles.imageModalContent}>
// // //             <View style={styles.imageModalHeader}>
// // //               <Text style={styles.imageModalTitle}>{driverName}</Text>
// // //               <TouchableOpacity onPress={onClose}>
// // //                 <Ionicons name="close" size={24} color={Colors.dark} />
// // //               </TouchableOpacity>
// // //             </View>
// // //             {imageUrl && imageUrl !== 'null' && imageUrl !== 'undefined' ? (
// // //               isSvg ? (
// // //                 <View style={styles.modalSvgContainer}>
// // //                   <SvgCssUri
// // //                     uri={imageUrl}
// // //                     width="100%"
// // //                     height={400}
// // //                   />
// // //                 </View>
// // //               ) : (
// // //                 <Image
// // //                   source={{ uri: imageUrl }}
// // //                   style={styles.fullProfileImage}
// // //                   resizeMode="contain"
// // //                 />
// // //               )
// // //             ) : (
// // //               <View style={styles.noImageContainer}>
// // //                 <Text style={styles.noImageText}>No profile picture available</Text>
// // //               </View>
// // //             )}
// // //           </View>
// // //         </View>
// // //       </TouchableOpacity>
// // //     </Modal>
// // //   );
// // // }

// // // function PreferenceTag({ label }) {
// // //   if (!label || label.trim() === '') return null;
  
// // //   let tagColor = '#FFF3E8';
// // //   let textColor = '#C65D00';
  
// // //   const lowerLabel = label.toLowerCase();
  
// // //   if (lowerLabel.includes('chatty') || lowerLabel.includes('talkative')) {
// // //     tagColor = '#E3F2FD';
// // //     textColor = '#1565C0';
// // //   } else if (lowerLabel.includes('quiet')) {
// // //     tagColor = '#E8F5E9';
// // //     textColor = '#2E7D32';
// // //   } else if (lowerLabel.includes('english') || lowerLabel.includes('hindi') || lowerLabel.includes('language')) {
// // //     tagColor = '#FFF9C4';
// // //     textColor = '#F57F17';
// // //   } else if (lowerLabel.includes('music') || lowerLabel.includes('songs')) {
// // //     tagColor = '#F3E5F5';
// // //     textColor = '#6A1B9A';
// // //   } else if (lowerLabel.includes('ac')) {
// // //     tagColor = '#E3F2FD';
// // //     textColor = '#1565C0';
// // //   } else if (lowerLabel.includes('pet')) {
// // //     tagColor = '#FCE4EC';
// // //     textColor = '#C2185B';
// // //   } else if (lowerLabel.includes('smoking')) {
// // //     tagColor = '#FFEBEE';
// // //     textColor = '#C62828';
// // //   } else if (lowerLabel.includes('verified')) {
// // //     tagColor = '#E8F5E9';
// // //     textColor = '#2E7D32';
// // //   } else if (lowerLabel.match(/[0-9]/)) {
// // //     tagColor = '#E8F5E9';
// // //     textColor = '#2E7D32';
// // //   }
  
// // //   return (
// // //     <View style={[styles.prefBadge, { backgroundColor: tagColor }]}>
// // //       <Text style={[styles.prefBadgeText, { color: textColor }]}>{label}</Text>
// // //     </View>
// // //   );
// // // }

// // // export default function RideNextScreen({ navigation, route }) {
// // //   const { user, loading: authLoading } = useAuth();
// // //   const { searchData } = route.params || {};
// // //   const { from, to, fromCoords, toCoords, dateTime, seats } = searchData || {};

// // //   const [availableRides, setAvailableRides] = useState([]);
// // //   const [loading, setLoading] = useState(true);
// // //   const [refreshing, setRefreshing] = useState(false);
// // //   const [errorMessage, setErrorMessage] = useState('');
// // //   const [sortBy, setSortBy] = useState('time');
// // //   const [quickFilters, setQuickFilters] = useState([]);
// // //   const [headerFiltersVisible, setHeaderFiltersVisible] = useState(false);
// // //   const [filterModalVisible, setFilterModalVisible] = useState(false);
// // //   const [preferenceMaster, setPreferenceMaster] = useState([]);
// // //   const [userPreferences, setUserPreferences] = useState({});
// // //   const [advancedFilters, setAdvancedFilters] = useState({});
  
// // //   // Ride Request Alert States
// // //   const [showRideRequestModal, setShowRideRequestModal] = useState(false);
// // //   const [rideRequestLoading, setRideRequestLoading] = useState(false);
// // //   const [rideRequestEmail, setRideRequestEmail] = useState('');
// // //   const [rideRequestNotes, setRideRequestNotes] = useState('');
// // //   const [lastRequestStatus, setLastRequestStatus] = useState(null);
  
// // //   const [selectedProfile, setSelectedProfile] = useState({
// // //     visible: false,
// // //     imageUrl: null,
// // //     driverName: '',
// // //   });

// // //   const [alertVisible, setAlertVisible] = useState(false);
// // //   const [alertConfig, setAlertConfig] = useState({
// // //     title: "",
// // //     message: "",
// // //     icon: "check-circle",
// // //     iconColor: "#10B981",
// // //     buttons: []
// // //   });

// // //   const phoneNumber = user?.phone_number;
// // //   const userGender = user?.gender;
// // //   const requestedSeats = seats || 1;

// // //   const showCustomAlert = (title, message, type = 'success') => {
// // //     let icon = "check-circle";
// // //     let iconColor = "#10B981";
    
// // //     if (type === 'error') {
// // //       icon = "error";
// // //       iconColor = "#EF4444";
// // //     } else if (type === 'warning') {
// // //       icon = "warning";
// // //       iconColor = "#F59E0B";
// // //     } else if (type === 'info') {
// // //       icon = "info";
// // //       iconColor = Colors.primary;
// // //     }
    
// // //     setAlertConfig({
// // //       title,
// // //       message,
// // //       icon,
// // //       iconColor,
// // //       buttons: [{ text: 'OK', onPress: () => setAlertVisible(false) }]
// // //     });
// // //     setAlertVisible(true);
// // //   };

// // //   // Debug function to check ride requests
// // //   const checkUserRideRequests = useCallback(async () => {
// // //     if (!phoneNumber) return;
    
// // //     console.log('\n🔍 ========== CHECKING USER RIDE REQUESTS ==========');
// // //     console.log(`👤 User: ${user?.full_name || user?.first_name} (${phoneNumber})`);
    
// // //     try {
// // //       const response = await fetch(`${API_BASE_URL}/my-ride-requests/${phoneNumber}`);
// // //       const data = await response.json();
      
// // //       if (data.success && data.requests) {
// // //         console.log(`📊 Found ${data.requests.length} ride requests:`);
// // //         data.requests.forEach((req, index) => {
// // //           console.log(`\n   Request ${index + 1} (ID: ${req.id}):`);
// // //           console.log(`      From: ${req.from_location.substring(0, 60)}...`);
// // //           console.log(`      To: ${req.to_location.substring(0, 60)}...`);
// // //           console.log(`      Status: ${req.status}`);
// // //           console.log(`      Seats: ${req.seats_needed}`);
// // //           console.log(`      Created: ${req.created_at}`);
// // //           console.log(`      Expires: ${req.expires_at}`);
// // //           if (req.notified_at) {
// // //             console.log(`      Notified: ${req.notified_at}`);
// // //           }
// // //         });
// // //       } else {
// // //         console.log('📭 No ride requests found');
// // //       }
// // //     } catch (error) {
// // //       console.log('❌ Error checking ride requests:', error);
// // //     }
    
// // //     console.log('🔍 ================================================\n');
// // //   }, [phoneNumber, user]);

// // //   // Check if current rides match any requests
// // //   const checkMatchingWithCurrentRides = useCallback(async () => {
// // //     if (!phoneNumber || availableRides.length === 0) return;
    
// // //     console.log('\n🔍 ========== CHECKING MATCHES ==========');
// // //     console.log(`📊 Available rides: ${availableRides.length}`);
// // //     console.log(`📍 Current search:`);
// // //     console.log(`   From: ${from}`);
// // //     console.log(`   To: ${to}`);
    
// // //     try {
// // //       const response = await fetch(`${API_BASE_URL}/my-ride-requests/${phoneNumber}`);
// // //       const data = await response.json();
      
// // //       if (!data.success || !data.requests) {
// // //         console.log('❌ Could not fetch ride requests');
// // //         return;
// // //       }
      
// // //       const activeRequests = data.requests.filter(req => req.status === 'active');
// // //       console.log(`\n📋 Active requests: ${activeRequests.length}`);
      
// // //       if (activeRequests.length === 0) {
// // //         console.log('📭 No active requests to match');
// // //         console.log('🔍 ==================================\n');
// // //         return;
// // //       }
      
// // //       // For each active request, check if any ride matches
// // //       for (const req of activeRequests) {
// // //         console.log(`\n📋 Checking Request ID ${req.id}:`);
// // //         console.log(`   Request From: ${req.from_location.substring(0, 50)}...`);
// // //         console.log(`   Request To: ${req.to_location.substring(0, 50)}...`);
        
// // //         const reqFromKeyword = req.from_location.split(',')[0].toLowerCase().trim();
// // //         const reqToKeyword = req.to_location.split(',')[0].toLowerCase().trim();
        
// // //         let matched = false;
        
// // //         for (const ride of availableRides) {
// // //           const rideFromKeyword = ride.from.split(',')[0].toLowerCase().trim();
// // //           const rideToKeyword = ride.to.split(',')[0].toLowerCase().trim();
          
// // //           const fromMatch = rideFromKeyword === reqFromKeyword || 
// // //                            rideFromKeyword.includes(reqFromKeyword) || 
// // //                            reqFromKeyword.includes(rideFromKeyword);
// // //           const toMatch = rideToKeyword === reqToKeyword || 
// // //                          rideToKeyword.includes(reqToKeyword) || 
// // //                          reqToKeyword.includes(rideToKeyword);
          
// // //           if (fromMatch && toMatch) {
// // //             console.log(`\n   ✅ MATCH FOUND!`);
// // //             console.log(`      Ride ID: ${ride.id}`);
// // //             console.log(`      Ride From: ${ride.from.substring(0, 50)}...`);
// // //             console.log(`      Ride To: ${ride.to.substring(0, 50)}...`);
// // //             console.log(`      ${rideFromKeyword} → ${reqFromKeyword} (match)`);
// // //             console.log(`      ${rideToKeyword} → ${reqToKeyword} (match)`);
// // //             matched = true;
// // //             break;
// // //           }
// // //         }
        
// // //         if (!matched) {
// // //           console.log(`   ❌ No matching ride found for Request ${req.id}`);
// // //           console.log(`      Looking for: ${reqFromKeyword} → ${reqToKeyword}`);
// // //         }
// // //       }
      
// // //     } catch (error) {
// // //       console.log('❌ Error checking matches:', error);
// // //     }
    
// // //     console.log('🔍 ==================================\n');
// // //   }, [phoneNumber, availableRides, from, to]);

// // //   // Handle Ride Request Alert
// // //   const handleRequestRideAlert = async () => {
// // //     const userEmail = user?.email || '';
    
// // //     console.log('\n📧 ========== RIDE REQUEST ALERT ==========');
// // //     console.log(`👤 User: ${user?.full_name || user?.first_name} (${phoneNumber})`);
// // //     console.log(`📧 User email: ${userEmail}`);
// // //     console.log(`📧 Entered email: ${rideRequestEmail}`);
// // //     console.log(`📍 From: ${from}`);
// // //     console.log(`📍 To: ${to}`);
// // //     console.log(`📅 Date/Time: ${dateTime}`);
// // //     console.log(`💺 Seats needed: ${requestedSeats}`);
// // //     console.log(`📝 Notes: ${rideRequestNotes || '(none)'}`);
    
// // //     if (!rideRequestEmail && !userEmail) {
// // //       console.log('❌ No email provided');
// // //       showCustomAlert('Email Required', 'Please enter your email address to receive notifications.', 'error');
// // //       return;
// // //     }
    
// // //     const emailToUse = rideRequestEmail || userEmail;
    
// // //     if (!emailToUse.includes('@')) {
// // //       console.log('❌ Invalid email format:', emailToUse);
// // //       showCustomAlert('Invalid Email', 'Please enter a valid email address.', 'error');
// // //       return;
// // //     }
    
// // //     setRideRequestLoading(true);
// // //     setLastRequestStatus(null);
    
// // //     try {
// // //       const requestBody = {
// // //         from_location: from,
// // //         to_location: to,
// // //         from_coords: fromCoords,
// // //         to_coords: toCoords,
// // //         preferred_date: dateTime,
// // //         preferred_time: new Date(dateTime).toLocaleTimeString(),
// // //         seats_needed: requestedSeats,
// // //         passenger_phone: user?.phone_number,
// // //         passenger_name: user?.full_name || user?.first_name,
// // //         passenger_email: emailToUse,
// // //         notes: rideRequestNotes
// // //       };
      
// // //       console.log('\n📤 Sending request to server:', JSON.stringify(requestBody, null, 2));
      
// // //       const response = await fetch(`${API_BASE_URL}/request-ride-alert`, {
// // //         method: 'POST',
// // //         headers: {
// // //           'Content-Type': 'application/json',
// // //         },
// // //         body: JSON.stringify(requestBody),
// // //       });
      
// // //       const result = await response.json();
// // //       console.log('\n📥 Server response:', JSON.stringify(result, null, 2));
      
// // //       if (result.success) {
// // //         console.log('✅ Ride request created successfully!');
// // //         console.log(`   Request ID: ${result.request_id}`);
// // //         console.log(`   Expires at: ${result.expires_at}`);
        
// // //         setLastRequestStatus({
// // //           success: true,
// // //           message: `Request #${result.request_id} created. We'll email you when a ride is available.`
// // //         });
        
// // //         showCustomAlert(
// // //           'Request Submitted! 📧', 
// // //           `We'll email you at ${emailToUse} when a ride matching your route is posted.\n\nRequest expires in 7 days.`,
// // //           'success'
// // //         );
// // //         setShowRideRequestModal(false);
// // //         setRideRequestEmail('');
// // //         setRideRequestNotes('');
        
// // //         // Check for immediate matches after creating request
// // //         setTimeout(() => {
// // //           fetchAvailableRides(true);
// // //           checkUserRideRequests();
// // //         }, 1000);
        
// // //       } else {
// // //         console.log('❌ Request failed:', result.message);
// // //         setLastRequestStatus({
// // //           success: false,
// // //           message: result.message || 'Could not create ride request'
// // //         });
// // //         showCustomAlert('Request Failed', result.message || 'Could not create ride request', 'error');
// // //       }
// // //     } catch (error) {
// // //       console.log('❌ Error creating ride request:', error);
// // //       setLastRequestStatus({
// // //         success: false,
// // //         message: error.message || 'Network error'
// // //       });
// // //       showCustomAlert('Error', 'Could not create ride request. Please try again.', 'error');
// // //     } finally {
// // //       setRideRequestLoading(false);
// // //       console.log('📧 ========================================\n');
// // //     }
// // //   };

// // //   // Fetch available rides
// // //   const fetchAvailableRides = useCallback(async (showRefresh = false) => {
// // //     if (!searchData || !fromCoords || !toCoords || !dateTime) {
// // //       console.log('⚠️ Missing search data, skipping fetch');
// // //       setAvailableRides([]);
// // //       setLoading(false);
// // //       return;
// // //     }

// // //     console.log('\n🚗 ========== FETCHING RIDES ==========');
// // //     console.log(`📍 From: ${from}`);
// // //     console.log(`📍 To: ${to}`);
// // //     console.log(`📅 Time: ${dateTime}`);
// // //     console.log(`💺 Seats: ${requestedSeats}`);

// // //     try {
// // //       if (showRefresh) {
// // //         setRefreshing(true);
// // //       } else {
// // //         setLoading(true);
// // //       }
// // //       setErrorMessage('');

// // //       const requestBody = {
// // //         from_location: from,
// // //         to_location: to,
// // //         from_coords: fromCoords,
// // //         to_coords: toCoords,
// // //         departure_time: new Date(dateTime).toISOString(),
// // //         seats_required: requestedSeats,
// // //         passenger_gender: userGender,
// // //       };
      
// // //       console.log('📤 Search request:', JSON.stringify(requestBody, null, 2));

// // //       const response = await fetch(`${API_BASE_URL}/search-rides`, {
// // //         method: 'POST',
// // //         headers: {
// // //           'Content-Type': 'application/json',
// // //         },
// // //         body: JSON.stringify(requestBody),
// // //       });

// // //       const rawText = await response.text();
// // //       let parsedData = null;

// // //       try {
// // //         parsedData = rawText ? JSON.parse(rawText) : {};
// // //       } catch (parseError) {
// // //         parsedData = { detail: rawText || 'Unexpected server response' };
// // //       }

// // //       if (!response.ok) {
// // //         throw new Error(parsedData?.detail || 'Failed to fetch rides');
// // //       }

// // //       const rides = Array.isArray(parsedData?.rides) ? parsedData.rides : [];
      
// // //       console.log(`📱 Found ${rides.length} rides`);
      
// // //       const ridesWithDetails = await Promise.all(
// // //         rides.map(async (ride) => {
// // //           let isVerified = false;
// // //           let avgRating = ride.rating || 0;
// // //           let profilePictureUrl = null;
          
// // //           const driverPhone = ride.phoneNumber;
// // //           const driverUserId = ride.driverUserId;
          
// // //           if (driverPhone || driverUserId) {
// // //             if (driverPhone) {
// // //               const docsData = await fetchUserDocuments(driverPhone);
// // //               if (docsData?.success && docsData.documents) {
// // //                 isVerified = checkVerifiedDocuments(docsData.documents);
// // //               }
// // //             }
            
// // //             const profileData = await fetchDriverProfile(driverPhone, driverUserId);
            
// // //             if (profileData?.success && profileData.user) {
// // //               avgRating = profileData.user.avg_rating || 0;
              
// // //               const possiblePictureFields = ['profile_picture', 'profilePicture', 'profilePhoto', 'profile_image', 'avatar'];
// // //               for (const field of possiblePictureFields) {
// // //                 if (profileData.user[field]) {
// // //                   profilePictureUrl = profileData.user[field];
// // //                   break;
// // //                 }
// // //               }
              
// // //               if (!profilePictureUrl && profileData.user.profile && profileData.user.profile.picture) {
// // //                 profilePictureUrl = profileData.user.profile.picture;
// // //               }
// // //             }
// // //           }
          
// // //           if (!profilePictureUrl) {
// // //             if (ride.profilePicture) profilePictureUrl = ride.profilePicture;
// // //             else if (ride.profilepicture) profilePictureUrl = ride.profilepicture;
// // //             else if (ride.profilePhoto) profilePictureUrl = ride.profilePhoto;
// // //             else if (ride.driverProfilePicture) profilePictureUrl = ride.driverProfilePicture;
// // //           }
          
// // //           let finalProfilePicture = null;
// // //           if (profilePictureUrl) {
// // //             finalProfilePicture = buildImageUrl(profilePictureUrl);
// // //           }
          
// // //           let availableSeats = ride.seatsAvailable || ride.available_seats || 0;
          
// // //           return { 
// // //             ...ride, 
// // //             isVerified, 
// // //             rating: avgRating,
// // //             profilePicture: finalProfilePicture,
// // //             profilepicture: finalProfilePicture,
// // //             profilePhoto: finalProfilePicture,
// // //             pickupLabel: ride.pickupLabel || ride.pickupLocationName || ride.fromLocationName || ride.from || 'Pickup point',
// // //             dropLabel: ride.dropLabel || ride.dropLocationName || ride.toLocationName || ride.to || 'Drop point',
// // //             womenOnly: ride.womenOnly === true || ride.women_only === true,
// // //             seatsAvailable: availableSeats,
// // //             requestedSeats: requestedSeats,
// // //             isFull: availableSeats === 0,
// // //           };
// // //         })
// // //       );
      
// // //       setAvailableRides(ridesWithDetails);
// // //       console.log(`✅ Loaded ${ridesWithDetails.length} rides with details`);
      
// // //       // After loading rides, check for matches
// // //       setTimeout(() => {
// // //         checkMatchingWithCurrentRides();
// // //       }, 500);
      
// // //     } catch (error) {
// // //       console.log('❌ search-rides error:', error);
// // //       setAvailableRides([]);
// // //       setErrorMessage(error.message || 'Failed to search rides');
// // //       showCustomAlert('Search Error', error.message || 'Failed to search rides', 'error');
// // //     } finally {
// // //       setLoading(false);
// // //       setRefreshing(false);
// // //       console.log('🚗 ==================================\n');
// // //     }
// // //   }, [searchData, from, to, fromCoords, toCoords, dateTime, requestedSeats, userGender, checkMatchingWithCurrentRides]);

// // //   const loadPreferenceData = useCallback(async () => {
// // //     try {
// // //       const defs = await DatabaseService.getMatchingPreferenceMaster();
// // //       setPreferenceMaster(defs || []);

// // //       if (phoneNumber) {
// // //         const saved = await DatabaseService.getUserMatchingPreferences(phoneNumber);
// // //         setUserPreferences(saved || {});
// // //       }
// // //     } catch (e) {
// // //       console.log('❌ preference load error:', e);
// // //     }
// // //   }, [phoneNumber]);

// // //   // Initial load
// // //   useEffect(() => {
// // //     if (authLoading) return;
// // //     console.log('\n🚀 Component mounted, loading data...');
// // //     fetchAvailableRides();
// // //     loadPreferenceData();
// // //     checkUserRideRequests();
// // //   }, [authLoading, fetchAvailableRides, loadPreferenceData, checkUserRideRequests]);

// // //   // Manual refresh
// // //   const onRefresh = useCallback(() => {
// // //     console.log('🔄 Manual refresh triggered');
// // //     fetchAvailableRides(true);
// // //     checkUserRideRequests();
// // //   }, [fetchAvailableRides, checkUserRideRequests]);

// // //   const quickFilterOptions = useMemo(() => {
// // //     const defs = preferenceMaster.filter(pref => QUICK_FILTER_KEYS.includes(pref.key));
// // //     return defs.slice(0, 3).map(pref => ({
// // //       key: pref.key,
// // //       label: QUICK_FILTER_LABELS[pref.key] || pref.label,
// // //     }));
// // //   }, [preferenceMaster]);

// // //   const advancedFilterOptions = useMemo(() => {
// // //     return preferenceMaster.filter(pref => {
// // //       if (!pref?.key) return false;
// // //       if (quickFilterOptions.some(q => q.key === pref.key)) return false;
// // //       return ['toggle', 'single_select'].includes(pref.input_type);
// // //     });
// // //   }, [preferenceMaster, quickFilterOptions]);

// // //   const processedRides = useMemo(() => {
// // //     let rides = [...availableRides];

// // //     if (userGender !== 'female') {
// // //       rides = rides.filter(item => {
// // //         const isWomenOnly = item.womenOnly === true;
// // //         if (isWomenOnly) {
// // //           console.log('🚫 Filtering out women-only ride:', item.id);
// // //         }
// // //         return !isWomenOnly;
// // //       });
// // //     }

// // //     if (quickFilters.length > 0) {
// // //       rides = rides.filter(item =>
// // //         quickFilters.every(key => matchesQuickFilter(item, key))
// // //       );
// // //     }

// // //     const activeAdvanced = Object.entries(advancedFilters).filter(
// // //       ([, value]) =>
// // //         value !== '' &&
// // //         value !== null &&
// // //         value !== undefined &&
// // //         value !== false
// // //     );

// // //     if (activeAdvanced.length > 0) {
// // //       rides = rides.filter(item =>
// // //         activeAdvanced.every(([key, value]) =>
// // //           matchesAdvancedFilter(item, key, value)
// // //         )
// // //       );
// // //     }

// // //     rides.sort((a, b) => {
// // //       if (sortBy === 'price') return (a.price || 0) - (b.price || 0);
// // //       if (sortBy === 'rating') return (b.rating || 0) - (a.rating || 0);
// // //       if (sortBy === 'match') return (b.matchPercentage || 0) - (a.matchPercentage || 0);

// // //       const aDate = new Date(`${a.date || ''} ${a.time || ''}`);
// // //       const bDate = new Date(`${b.date || ''} ${b.time || ''}`);
// // //       if (!isNaN(aDate) && !isNaN(bDate)) return aDate - bDate;
// // //       return 0;
// // //     });

// // //     return rides;
// // //   }, [availableRides, quickFilters, advancedFilters, sortBy, userGender]);

// // //   const handleCardPress = (ride) => {
// // //     const pickupAddress = searchData?.fromAddress || ride.from || '';
// // //     const dropoffAddress = searchData?.toAddress || ride.to || '';
// // //     const pickupPlaceName = searchData?.fromPlaceName || ride.pickupLabel || ride.from?.split(',')[0] || '';
// // //     const dropoffPlaceName = searchData?.toPlaceName || ride.dropLabel || ride.to?.split(',')[0] || '';
    
// // //     navigation.navigate('RideDetailScreen', {
// // //       ride: ride,
// // //       searchData: {
// // //         fromCoords: fromCoords,
// // //         toCoords: toCoords,
// // //         fromAddress: pickupAddress,
// // //         toAddress: dropoffAddress,
// // //         fromPlaceName: pickupPlaceName,
// // //         toPlaceName: dropoffPlaceName,
// // //         date: dateTime,
// // //         time: new Date(dateTime).toLocaleTimeString(),
// // //         seats: requestedSeats
// // //       }
// // //     });
// // //   };

// // //   const toggleQuickFilter = (key) => {
// // //     setQuickFilters(prev =>
// // //       prev.includes(key) ? prev.filter(i => i !== key) : [...prev, key]
// // //     );
// // //   };

// // //   const clearAllFilters = () => {
// // //     setQuickFilters([]);
// // //     setAdvancedFilters({});
// // //     showCustomAlert('Filters Cleared', 'All filters have been reset.', 'info');
// // //   };

// // //   const renderAdvancedFilterControl = (pref) => {
// // //     const currentValue = advancedFilters[pref.key];

// // //     if (pref.input_type === 'toggle') {
// // //       const active = !!currentValue;
// // //       return (
// // //         <TouchableOpacity
// // //           activeOpacity={0.85}
// // //           style={[styles.modalToggleChip, active && styles.modalToggleChipActive]}
// // //           onPress={() =>
// // //             setAdvancedFilters(prev => ({ ...prev, [pref.key]: !active }))
// // //           }
// // //         >
// // //           <Text
// // //             style={[
// // //               styles.modalToggleChipText,
// // //               active && styles.modalToggleChipTextActive,
// // //             ]}
// // //           >
// // //             {pref.label}
// // //           </Text>
// // //         </TouchableOpacity>
// // //       );
// // //     }

// // //     if (pref.input_type === 'single_select' && Array.isArray(pref.options)) {
// // //       return (
// // //         <View style={styles.modalOptionWrap}>
// // //           {pref.options.map((opt) => {
// // //             const active = currentValue === opt;
// // //             return (
// // //               <TouchableOpacity
// // //                 key={opt}
// // //                 activeOpacity={0.85}
// // //                 style={[
// // //                   styles.modalOptionChip,
// // //                   active && styles.modalOptionChipActive,
// // //                 ]}
// // //                 onPress={() =>
// // //                   setAdvancedFilters(prev => ({
// // //                     ...prev,
// // //                     [pref.key]: active ? '' : opt,
// // //                   }))
// // //                 }
// // //               >
// // //                 <Text
// // //                   style={[
// // //                     styles.modalOptionChipText,
// // //                     active && styles.modalOptionChipTextActive,
// // //                   ]}
// // //                 >
// // //                   {opt}
// // //                 </Text>
// // //               </TouchableOpacity>
// // //             );
// // //           })}
// // //         </View>
// // //       );
// // //     }

// // //     return null;
// // //   };

// // //   // Ride Request Modal Component
// // //   const RideRequestModal = () => {
// // //     const userEmail = user?.email || '';
    
// // //     return (
// // //       <Modal
// // //         visible={showRideRequestModal}
// // //         transparent={true}
// // //         animationType="slide"
// // //         onRequestClose={() => setShowRideRequestModal(false)}
// // //       >
// // //         <View style={styles.modalBackdrop}>
// // //           <TouchableOpacity 
// // //             style={styles.modalOverlay} 
// // //             activeOpacity={1} 
// // //             onPress={() => setShowRideRequestModal(false)} 
// // //           />
          
// // //           <View style={styles.requestModalSheet}>
// // //             <View style={styles.modalHandle} />
            
// // //             <View style={styles.modalHeader}>
// // //               <Text style={styles.modalTitle}>Request Ride Alert</Text>
// // //               <TouchableOpacity onPress={() => setShowRideRequestModal(false)}>
// // //                 <Ionicons name="close" size={24} color={Colors.dark} />
// // //               </TouchableOpacity>
// // //             </View>
            
// // //             <ScrollView showsVerticalScrollIndicator={false}>
// // //               <View style={styles.requestModalContent}>
// // //                 <View style={styles.requestInfoBox}>
// // //                   <Ionicons name="information-circle" size={20} color={Colors.primary} />
// // //                   <Text style={styles.requestInfoText}>
// // //                     No rides found for this route. We'll email you when a ride becomes available.
// // //                   </Text>
// // //                 </View>
                
// // //                 <View style={styles.requestRouteBox}>
// // //                   <Text style={styles.requestRouteLabel}>Route:</Text>
// // //                   <Text style={styles.requestRouteText}>
// // //                     {from} → {to}
// // //                   </Text>
// // //                   <Text style={styles.requestRouteDetail}>
// // //                     {new Date(dateTime).toLocaleDateString()} at {new Date(dateTime).toLocaleTimeString()}
// // //                   </Text>
// // //                   <Text style={styles.requestRouteDetail}>
// // //                     {requestedSeats} seat{requestedSeats !== 1 ? 's' : ''} needed
// // //                   </Text>
// // //                 </View>
                
// // //                 <View style={styles.requestInputGroup}>
// // //                   <Text style={styles.requestLabel}>Email Address *</Text>
// // //                   <TextInput
// // //                     style={styles.requestInput}
// // //                     placeholder="Enter your email"
// // //                     value={rideRequestEmail}
// // //                     onChangeText={setRideRequestEmail}
// // //                     keyboardType="email-address"
// // //                     autoCapitalize="none"
// // //                     autoComplete="email"
// // //                   />
// // //                   {userEmail && !rideRequestEmail && (
// // //                     <Text style={styles.requestHelper}>
// // //                       Using your registered email: {userEmail}
// // //                     </Text>
// // //                   )}
// // //                   <Text style={styles.requestHelper}>
// // //                     We'll notify you at this email when rides are posted
// // //                   </Text>
// // //                 </View>
                
// // //                 <View style={styles.requestInputGroup}>
// // //                   <Text style={styles.requestLabel}>Additional Notes (Optional)</Text>
// // //                   <TextInput
// // //                     style={[styles.requestInput, styles.requestTextArea]}
// // //                     placeholder="Any preferences or special requirements?"
// // //                     value={rideRequestNotes}
// // //                     onChangeText={setRideRequestNotes}
// // //                     multiline
// // //                     numberOfLines={3}
// // //                     textAlignVertical="top"
// // //                   />
// // //                 </View>
                
// // //                 <View style={styles.requestNoteBox}>
// // //                   <Ionicons name="time-outline" size={16} color={Colors.gray} />
// // //                   <Text style={styles.requestNoteText}>
// // //                     Your request will remain active for 7 days. You can cancel it anytime in your profile.
// // //                   </Text>
// // //                 </View>
// // //               </View>
// // //             </ScrollView>
            
// // //             <View style={styles.modalFooter}>
// // //               <TouchableOpacity
// // //                 style={styles.modalSecondaryBtn}
// // //                 onPress={() => setShowRideRequestModal(false)}
// // //               >
// // //                 <Text style={styles.modalSecondaryBtnText}>Cancel</Text>
// // //               </TouchableOpacity>
              
// // //               <TouchableOpacity
// // //                 style={[styles.modalPrimaryBtn, rideRequestLoading && styles.disabledButton]}
// // //                 onPress={handleRequestRideAlert}
// // //                 disabled={rideRequestLoading}
// // //               >
// // //                 {rideRequestLoading ? (
// // //                   <ActivityIndicator size="small" color={Colors.white} />
// // //                 ) : (
// // //                   <Text style={styles.modalPrimaryBtnText}>Get Email Alert</Text>
// // //                 )}
// // //               </TouchableOpacity>
// // //             </View>
// // //           </View>
// // //         </View>
// // //       </Modal>
// // //     );
// // //   };

// // //   const renderRideCard = ({ item }) => {
// // //     let profilePhotoUrl = null;
// // //     let isSvg = false;
    
// // //     if (item.profilePicture) {
// // //       profilePhotoUrl = buildImageUrl(item.profilePicture);
// // //     } else if (item.profilepicture) {
// // //       profilePhotoUrl = buildImageUrl(item.profilepicture);
// // //     } else if (item.profilePhoto) {
// // //       profilePhotoUrl = buildImageUrl(item.profilePhoto);
// // //     } else if (item.driverProfilePicture) {
// // //       profilePhotoUrl = buildImageUrl(item.driverProfilePicture);
// // //     } else if (item.driver?.profile_picture) {
// // //       profilePhotoUrl = buildImageUrl(item.driver.profile_picture);
// // //     } else if (item.user?.profile_picture) {
// // //       profilePhotoUrl = buildImageUrl(item.user.profile_picture);
// // //     }
    
// // //     if (profilePhotoUrl && profilePhotoUrl.toLowerCase().includes('.svg')) {
// // //       isSvg = true;
// // //     }
    
// // //     const driverNameText = item.driverName || item.driver_name || item.driver?.full_name || 'Driver';
// // //     const avatarText = getDriverInitials(driverNameText);

// // //     let vehicleLabel = 'Vehicle details unavailable';
// // //     if (item.vehicle) {
// // //       const vehicleParts = [];
// // //       if (item.vehicle.model) vehicleParts.push(item.vehicle.model);
// // //       if (item.vehicle.color && vehicleParts.length > 0) {
// // //         vehicleLabel = `${vehicleParts.join(' ')} - ${item.vehicle.color}`;
// // //       } else if (item.vehicle.color) {
// // //         vehicleLabel = item.vehicle.color;
// // //       } else if (vehicleParts.length > 0) {
// // //         vehicleLabel = vehicleParts.join(' ');
// // //       }
// // //     } else if (item.vehicleModel) {
// // //       vehicleLabel = item.vehicleModel;
// // //       if (item.vehicleColor) {
// // //         vehicleLabel = `${item.vehicleModel} - ${item.vehicleColor}`;
// // //       }
// // //     }

// // //     const preferenceBadges = extractPreferenceBadges(item);
// // //     const isDriverVerified = item.isVerified;
// // //     const driverRating = item.rating || 0;

// // //     const pickupName = item.pickupLabel || item.from || 'Pickup point';
// // //     const dropName = item.dropLabel || item.to || 'Drop point';
    
// // //     const seatsAvailable = item.seatsAvailable || 0;
// // //     const isSeatsInsufficient = requestedSeats > seatsAvailable && seatsAvailable > 0;
// // //     const isFull = seatsAvailable === 0;
// // //     const canBook = !isFull && seatsAvailable >= requestedSeats;

// // //     return (
// // //       <TouchableOpacity
// // //         style={[styles.rideCard, !canBook && !isFull && styles.rideCardWarning, isFull && styles.rideCardFull]}
// // //         onPress={() => handleCardPress(item)}
// // //         activeOpacity={0.9}
// // //       >
// // //         <View style={styles.cardTopRow}>
// // //           <View style={styles.profileRow}>
// // //             <TouchableOpacity
// // //               onPress={() => handleCardPress(item)}
// // //               activeOpacity={0.8}
// // //             >
// // //               <View style={styles.avatarContainer}>
// // //                 {profilePhotoUrl ? (
// // //                   isSvg ? (
// // //                     <View style={styles.svgContainer}>
// // //                       <SvgCssUri
// // //                         uri={profilePhotoUrl}
// // //                         width="48"
// // //                         height="48"
// // //                       />
// // //                     </View>
// // //                   ) : (
// // //                     <Image
// // //                       source={{ uri: profilePhotoUrl }}
// // //                       style={styles.avatarImage}
// // //                       resizeMode="cover"
// // //                     />
// // //                   )
// // //                 ) : (
// // //                   <View style={styles.initialsContainer}>
// // //                     <Text style={styles.avatarFallback}>{avatarText}</Text>
// // //                   </View>
// // //                 )}
// // //               </View>
// // //             </TouchableOpacity>

// // //             <View style={styles.profileContent}>
// // //               <View style={styles.nameRow}>
// // //                 <Text style={styles.driverName} numberOfLines={1}>
// // //                   {driverNameText}
// // //                 </Text>

// // //                 {isDriverVerified && (
// // //                   <View style={styles.verifiedBadge}>
// // //                     <Ionicons name="checkmark-circle" size={14} color="#16A34A" />
// // //                     <Text style={styles.verifiedText}>Verified</Text>
// // //                   </View>
// // //                 )}

// // //                 {item.womenOnly === true && (
// // //                   <View style={styles.womenOnlyBadge}>
// // //                     <Ionicons name="woman" size={12} color="#E91E63" />
// // //                     <Text style={styles.womenOnlyBadgeText}>Women Only</Text>
// // //                   </View>
// // //                 )}
                
// // //                 {isFull && (
// // //                   <View style={styles.fullBadge}>
// // //                     <Ionicons name="close-circle" size={12} color="#EF4444" />
// // //                     <Text style={styles.fullBadgeText}>Full</Text>
// // //                   </View>
// // //                 )}
// // //               </View>

// // //               <View style={styles.ratingRow}>
// // //                 <RatingStars rating={driverRating} size={12} showLabel={true} />
// // //               </View>
// // //             </View>
// // //           </View>

// // //           <View style={styles.priceMatchWrap}>
// // //             <View style={styles.matchBadge}>
// // //               <Text style={styles.matchText}>{item.matchPercentage || 0}%</Text>
// // //             </View>
// // //             <Text style={styles.priceText}>₹{item.price}</Text>
// // //             <Text style={styles.perSeatText}>per seat</Text>
// // //           </View>
// // //         </View>

// // //         <View style={styles.infoRow}>
// // //           <View style={styles.infoItem}>
// // //             <Ionicons name="calendar-outline" size={13} color={Colors.gray} />
// // //             <Text style={styles.infoText} numberOfLines={1}>{item.date}</Text>
// // //           </View>
// // //           <View style={styles.infoDot} />
// // //           <View style={styles.infoItem}>
// // //             <Ionicons name="time-outline" size={13} color={Colors.gray} />
// // //             <Text style={styles.infoText} numberOfLines={1}>{item.time}</Text>
// // //           </View>
// // //           <View style={styles.infoDot} />
// // //           <View style={styles.infoItem}>
// // //             <Ionicons name="people-outline" size={13} color={Colors.gray} />
// // //             <Text style={[
// // //               styles.infoText, 
// // //               isFull ? styles.fullText : (isSeatsInsufficient && styles.warningText)
// // //             ]} numberOfLines={1}>
// // //               {isFull ? 'Ride Full' : `${seatsAvailable} left`}
// // //             </Text>
// // //           </View>
// // //         </View>

// // //         {isFull && (
// // //           <View style={styles.fullWarningContainer}>
// // //             <Ionicons name="close-circle" size={14} color="#EF4444" />
// // //             <Text style={styles.fullWarningText}>
// // //               This ride is currently full. Check back later or try another ride.
// // //             </Text>
// // //           </View>
// // //         )}

// // //         {!isFull && isSeatsInsufficient && seatsAvailable > 0 && (
// // //           <View style={styles.seatWarningContainer}>
// // //             <Ionicons name="warning" size={14} color="#D97706" />
// // //             <Text style={styles.seatWarningText}>
// // //               Only {seatsAvailable} seat{seatsAvailable !== 1 ? 's' : ''} left. You requested {requestedSeats} seat{requestedSeats !== 1 ? 's' : ''}.
// // //             </Text>
// // //           </View>
// // //         )}

// // //         <View style={styles.divider} />

// // //         <View style={styles.routeBlock}>
// // //           <View style={styles.routeRow}>
// // //             <View style={[styles.routeDot, { backgroundColor: '#22C55E' }]} />
// // //             <View style={styles.routeTextWrap}>
// // //               <Text style={styles.routeLabel}>Pickup</Text>
// // //               <Text style={styles.routeText} numberOfLines={2}>{pickupName}</Text>
// // //             </View>
// // //           </View>
// // //           <View style={styles.routeRow}>
// // //             <View style={[styles.routeDot, { backgroundColor: '#F97316' }]} />
// // //             <View style={styles.routeTextWrap}>
// // //               <Text style={styles.routeLabel}>Drop</Text>
// // //               <Text style={styles.routeText} numberOfLines={2}>{dropName}</Text>
// // //             </View>
// // //           </View>
// // //         </View>

// // //         <View style={styles.vehicleRow}>
// // //           <Ionicons name="car-sport-outline" size={14} color={Colors.gray} />
// // //           <Text style={styles.vehicleText} numberOfLines={1}>{vehicleLabel}</Text>
// // //         </View>

// // //         {preferenceBadges.length > 0 && (
// // //           <ScrollView
// // //             horizontal
// // //             showsHorizontalScrollIndicator={false}
// // //             contentContainerStyle={styles.badgeScroll}
// // //           >
// // //             {preferenceBadges.map((badge, index) => (
// // //               <PreferenceTag key={`${badge}-${index}`} label={badge} />
// // //             ))}
// // //           </ScrollView>
// // //         )}
// // //       </TouchableOpacity>
// // //     );
// // //   };

// // //   if (authLoading || loading) {
// // //     return (
// // //       <View style={styles.loadingContainer}>
// // //         <LottieView
// // //           source={require("../assets/loading.json")}
// // //           autoPlay
// // //           loop
// // //           style={{ width: 300, height: 300 }}
// // //         />
// // //       </View>
// // //     );
// // //   }

// // //   return (
// // //     <SafeAreaView style={styles.container}>
// // //       <StatusBar barStyle="dark-content" backgroundColor={Colors.white} />

// // //       <View style={styles.header}>
// // //         <TouchableOpacity
// // //           style={styles.backButton}
// // //           onPress={() => navigation.goBack()}
// // //         >
// // //           <MaterialIcons name="arrow-back-ios" size={24} color="#ED7117" />
// // //         </TouchableOpacity>

// // //         <Text style={styles.headerTitle}>Available Rides</Text>

// // //         <TouchableOpacity
// // //           style={[
// // //             styles.filterButton,
// // //             headerFiltersVisible && styles.filterButtonActive
// // //           ]}
// // //           onPress={() => setHeaderFiltersVisible(prev => !prev)}
// // //         >
// // //           <Ionicons name="options-outline" size={22} color="#ED7117" />
// // //         </TouchableOpacity>
// // //       </View>

// // //       {/* Debug Status Banner */}
// // //       {lastRequestStatus && (
// // //         <View style={[
// // //           styles.debugBanner,
// // //           lastRequestStatus.success ? styles.debugBannerSuccess : styles.debugBannerError
// // //         ]}>
// // //           <Ionicons 
// // //             name={lastRequestStatus.success ? "checkmark-circle" : "alert-circle"} 
// // //             size={18} 
// // //             color={lastRequestStatus.success ? "#166534" : "#991B1B"} 
// // //           />
// // //           <Text style={[
// // //             styles.debugBannerText,
// // //             lastRequestStatus.success ? styles.debugBannerTextSuccess : styles.debugBannerTextError
// // //           ]}>
// // //             {lastRequestStatus.message}
// // //           </Text>
// // //           <TouchableOpacity onPress={() => setLastRequestStatus(null)}>
// // //             <Ionicons name="close" size={16} color={lastRequestStatus.success ? "#166534" : "#991B1B"} />
// // //           </TouchableOpacity>
// // //         </View>
// // //       )}

// // //       {headerFiltersVisible ? (
// // //         <View style={styles.topControlsWrap}>
// // //           <ScrollView
// // //             horizontal
// // //             showsHorizontalScrollIndicator={false}
// // //             contentContainerStyle={styles.filterScroll}
// // //           >
// // //             {quickFilterOptions.map((filter) => {
// // //               const active = quickFilters.includes(filter.key);
// // //               return (
// // //                 <TouchableOpacity
// // //                   key={filter.key}
// // //                   activeOpacity={0.85}
// // //                   style={[styles.quickChip, active && styles.quickChipActive]}
// // //                   onPress={() => toggleQuickFilter(filter.key)}
// // //                 >
// // //                   <Text
// // //                     style={[
// // //                       styles.quickChipText,
// // //                       active && styles.quickChipTextActive,
// // //                     ]}
// // //                   >
// // //                     {filter.label}
// // //                   </Text>
// // //                 </TouchableOpacity>
// // //               );
// // //             })}

// // //             <TouchableOpacity
// // //               activeOpacity={0.85}
// // //               style={styles.moreFilterChip}
// // //               onPress={() => setFilterModalVisible(true)}
// // //             >
// // //               <Ionicons name="options-outline" size={14} color="#ED7117" />
// // //               <Text style={styles.moreFilterChipText}>More Filters</Text>
// // //             </TouchableOpacity>
// // //           </ScrollView>

// // //           <Text style={styles.sortLabel}>Sort by</Text>

// // //           <ScrollView
// // //             horizontal
// // //             showsHorizontalScrollIndicator={false}
// // //             contentContainerStyle={styles.sortScroll}
// // //           >
// // //             {SORT_OPTIONS.map((option) => {
// // //               const active = sortBy === option.key;
// // //               return (
// // //                 <TouchableOpacity
// // //                   key={option.key}
// // //                   activeOpacity={0.85}
// // //                   style={[styles.sortChip, active && styles.sortChipActive]}
// // //                   onPress={() => setSortBy(option.key)}
// // //                 >
// // //                   <Text
// // //                     style={[
// // //                       styles.sortChipText,
// // //                       active && styles.sortChipTextActive,
// // //                     ]}
// // //                   >
// // //                     {option.label}
// // //                   </Text>
// // //                 </TouchableOpacity>
// // //               );
// // //             })}
// // //           </ScrollView>
// // //         </View>
// // //       ) : null}

// // //       {processedRides.length === 0 ? (
// // //         <View style={styles.emptyContainer}>
// // //           <Ionicons name="car-outline" size={80} color={Colors.gray} />
// // //           <Text style={styles.emptyTitle}>No Rides Found</Text>
// // //           <Text style={styles.emptySubtitle}>
// // //             {errorMessage
// // //               ? errorMessage
// // //               : 'No rides available for this route at the selected time.'}
// // //           </Text>

// // //           <TouchableOpacity 
// // //             style={styles.requestAlertButton} 
// // //             onPress={() => setShowRideRequestModal(true)}
// // //           >
// // //             <Ionicons name="notifications-outline" size={20} color={Colors.white} />
// // //             <Text style={styles.requestAlertButtonText}>Notify me when a ride is available</Text>
// // //           </TouchableOpacity>

// // //           <TouchableOpacity style={styles.clearButton} onPress={clearAllFilters}>
// // //             <Text style={styles.clearButtonText}>Clear Filters</Text>
// // //           </TouchableOpacity>
// // //         </View>
// // //       ) : (
// // //         <FlatList
// // //           data={processedRides}
// // //           renderItem={renderRideCard}
// // //           keyExtractor={(item) => String(item.id)}
// // //           contentContainerStyle={styles.listContent}
// // //           showsVerticalScrollIndicator={false}
// // //           refreshControl={
// // //             <RefreshControl
// // //               refreshing={refreshing}
// // //               onRefresh={onRefresh}
// // //               colors={[Colors.primary]}
// // //               tintColor={Colors.primary}
// // //             />
// // //           }
// // //           ItemSeparatorComponent={() => <View style={{ height: 12 }} />}
// // //         />
// // //       )}

// // //       <Modal
// // //         visible={filterModalVisible}
// // //         transparent
// // //         animationType="slide"
// // //         onRequestClose={() => setFilterModalVisible(false)}
// // //       >
// // //         <View style={styles.modalBackdrop}>
// // //           <TouchableOpacity
// // //             style={styles.modalOverlay}
// // //             activeOpacity={1}
// // //             onPress={() => setFilterModalVisible(false)}
// // //           />

// // //           <View style={styles.modalSheet}>
// // //             <View style={styles.modalHandle} />

// // //             <View style={styles.modalHeader}>
// // //               <Text style={styles.modalTitle}>More Filters</Text>
// // //               <TouchableOpacity onPress={() => setFilterModalVisible(false)}>
// // //                 <Ionicons name="close" size={24} color={Colors.dark} />
// // //               </TouchableOpacity>
// // //             </View>

// // //             <ScrollView
// // //               showsVerticalScrollIndicator={false}
// // //               contentContainerStyle={styles.modalContent}
// // //             >
// // //               {advancedFilterOptions.map((pref) => (
// // //                 <View key={pref.key} style={styles.modalSection}>
// // //                   <Text style={styles.modalSectionTitle}>{pref.label}</Text>
// // //                   {renderAdvancedFilterControl(pref)}
// // //                 </View>
// // //               ))}
// // //             </ScrollView>

// // //             <View style={styles.modalFooter}>
// // //               <TouchableOpacity
// // //                 style={styles.modalSecondaryBtn}
// // //                 onPress={clearAllFilters}
// // //               >
// // //                 <Text style={styles.modalSecondaryBtnText}>Clear</Text>
// // //               </TouchableOpacity>

// // //               <TouchableOpacity
// // //                 style={styles.modalPrimaryBtn}
// // //                 onPress={() => setFilterModalVisible(false)}
// // //               >
// // //                 <Text style={styles.modalPrimaryBtnText}>Apply Filters</Text>
// // //               </TouchableOpacity>
// // //             </View>
// // //           </View>
// // //         </View>
// // //       </Modal>

// // //       {/* Ride Request Modal */}
// // //       <RideRequestModal />

// // //       <ProfileImageModal
// // //         visible={selectedProfile.visible}
// // //         imageUrl={selectedProfile.imageUrl}
// // //         driverName={selectedProfile.driverName}
// // //         onClose={() => setSelectedProfile({ visible: false, imageUrl: null, driverName: '' })}
// // //       />

// // //       <CustomAlert
// // //         visible={alertVisible}
// // //         title={alertConfig.title}
// // //         message={alertConfig.message}
// // //         icon={alertConfig.icon}
// // //         iconColor={alertConfig.iconColor}
// // //         buttons={alertConfig.buttons}
// // //         onBackdropPress={() => setAlertVisible(false)}
// // //       />
// // //     </SafeAreaView>
// // //   );
// // // }

// // // const styles = StyleSheet.create({
// // //   container: {
// // //     flex: 1,
// // //     backgroundColor: '#fff',
// // //   },
// // //   header: {
// // //     flexDirection: 'row',
// // //     alignItems: 'center',
// // //     paddingHorizontal: 16,
// // //     paddingVertical: 12,
// // //     borderBottomWidth: 0.5,
// // //     borderBottomColor: '#fff',
// // //     backgroundColor: Colors.white,
// // //   },
// // //   backButton: {
// // //     width: 44,
// // //     height: 44,
// // //     justifyContent: 'center',
// // //   },
// // //   filterButton: {
// // //     width: 44,
// // //     height: 44,
// // //     justifyContent: 'center',
// // //     alignItems: 'center',
// // //     borderRadius: 22,
// // //   },
// // //   filterButtonActive: {
// // //     backgroundColor: '#fff',
// // //   },
// // //   headerTitle: {
// // //     ...Typography.h2,
// // //     fontSize: 28,
// // //     fontWeight: '700',
// // //     color: Colors.primary,
// // //     flex: 1,
// // //     textAlign: 'center',
// // //   },
// // //   topControlsWrap: {
// // //     backgroundColor: Colors.white,
// // //     paddingTop: 10,
// // //     paddingBottom: 12,
// // //     borderBottomWidth: 1,
// // //     borderBottomColor: '#EEF2F7',
// // //   },
// // //   filterScroll: {
// // //     paddingHorizontal: 16,
// // //     gap: 10,
// // //   },
// // //   quickChip: {
// // //     paddingHorizontal: 14,
// // //     paddingVertical: 10,
// // //     borderRadius: 20,
// // //     backgroundColor: '#F3F4F6',
// // //   },
// // //   quickChipActive: {
// // //     backgroundColor: Colors.primary,
// // //   },
// // //   quickChipText: {
// // //     fontSize: 12,
// // //     fontWeight: '600',
// // //     color: Colors.dark,
// // //   },
// // //   quickChipTextActive: {
// // //     color: Colors.white,
// // //   },
// // //   moreFilterChip: {
// // //     flexDirection: 'row',
// // //     alignItems: 'center',
// // //     gap: 6,
// // //     paddingHorizontal: 14,
// // //     paddingVertical: 10,
// // //     borderRadius: 20,
// // //     backgroundColor: '#EEF6FF',
// // //   },
// // //   moreFilterChipText: {
// // //     fontSize: 12,
// // //     fontWeight: '700',
// // //     color: '#ED7117',
// // //   },
// // //   sortLabel: {
// // //     paddingHorizontal: 16,
// // //     marginTop: 12,
// // //     marginBottom: 8,
// // //     fontSize: 12,
// // //     color: Colors.gray,
// // //     fontWeight: '700',
// // //   },
// // //   sortScroll: {
// // //     paddingHorizontal: 16,
// // //     gap: 10,
// // //   },
// // //   sortChip: {
// // //     paddingHorizontal: 14,
// // //     paddingVertical: 8,
// // //     borderRadius: 14,
// // //     backgroundColor: '#F3F4F6',
// // //   },
// // //   sortChipActive: {
// // //     backgroundColor: '#ED7117',
// // //   },
// // //   sortChipText: {
// // //     fontSize: 12,
// // //     color: Colors.dark,
// // //     fontWeight: '600',
// // //   },
// // //   sortChipTextActive: {
// // //     color: Colors.white,
// // //   },
// // //   listContent: {
// // //     padding: 16,
// // //     paddingBottom: 28,
// // //   },
// // //   rideCard: {
// // //     backgroundColor: Colors.white,
// // //     borderRadius: 18,
// // //     padding: 14,
// // //     borderWidth: 1,
// // //     borderColor: '#EEF2F7',
// // //     shadowColor: '#0F172A',
// // //     shadowOffset: { width: 0, height: 6 },
// // //     shadowOpacity: 0.05,
// // //     shadowRadius: 14,
// // //     elevation: 2,
// // //   },
// // //   rideCardWarning: {
// // //     backgroundColor: '#FFFBEB',
// // //     borderColor: '#FDE68A',
// // //   },
// // //   rideCardFull: {
// // //     backgroundColor: '#FEF2F2',
// // //     borderColor: '#FEE2E2',
// // //     opacity: 0.85,
// // //   },
// // //   cardTopRow: {
// // //     flexDirection: 'row',
// // //     justifyContent: 'space-between',
// // //     alignItems: 'flex-start',
// // //   },
// // //   profileRow: {
// // //     flexDirection: 'row',
// // //     flex: 1,
// // //     paddingRight: 10,
// // //   },
// // //   avatarContainer: {
// // //     width: 48,
// // //     height: 48,
// // //     borderRadius: 24,
// // //     backgroundColor: '#E5E7EB',
// // //     alignItems: 'center',
// // //     justifyContent: 'center',
// // //     overflow: 'hidden',
// // //     marginRight: 10,
// // //   },
// // //   avatarImage: {
// // //     width: 48,
// // //     height: 48,
// // //   },
// // //   avatarFallback: {
// // //     fontSize: 14,
// // //     fontWeight: '800',
// // //     color: Colors.gray,
// // //   },
// // //   profileContent: {
// // //     flex: 1,
// // //   },
// // //   nameRow: {
// // //     flexDirection: 'row',
// // //     alignItems: 'center',
// // //     flexWrap: 'wrap',
// // //     gap: 6,
// // //   },
// // //   driverName: {
// // //     fontSize: 15,
// // //     fontWeight: '800',
// // //     color: Colors.dark,
// // //     maxWidth: '100%',
// // //   },
// // //   verifiedBadge: {
// // //     flexDirection: 'row',
// // //     alignItems: 'center',
// // //     gap: 4,
// // //     backgroundColor: '#E8F5E9',
// // //     paddingHorizontal: 6,
// // //     paddingVertical: 2,
// // //     borderRadius: 12,
// // //   },
// // //   verifiedText: {
// // //     fontSize: 10,
// // //     fontWeight: '700',
// // //     color: '#16A34A',
// // //   },
// // //   womenOnlyBadge: {
// // //     flexDirection: 'row',
// // //     alignItems: 'center',
// // //     gap: 4,
// // //     backgroundColor: '#FCE4EC',
// // //     paddingHorizontal: 8,
// // //     paddingVertical: 3,
// // //     borderRadius: 12,
// // //   },
// // //   womenOnlyBadgeText: {
// // //     fontSize: 10,
// // //     color: '#E91E63',
// // //     fontWeight: '700',
// // //   },
// // //   fullBadge: {
// // //     flexDirection: 'row',
// // //     alignItems: 'center',
// // //     gap: 4,
// // //     backgroundColor: '#FEF2F2',
// // //     paddingHorizontal: 8,
// // //     paddingVertical: 3,
// // //     borderRadius: 12,
// // //     borderWidth: 1,
// // //     borderColor: '#FEE2E2',
// // //   },
// // //   fullBadgeText: {
// // //     fontSize: 10,
// // //     color: '#EF4444',
// // //     fontWeight: '700',
// // //   },
// // //   ratingRow: {
// // //     flexDirection: 'row',
// // //     alignItems: 'center',
// // //     marginTop: 4,
// // //   },
// // //   ratingText: {
// // //     fontSize: 11,
// // //     color: Colors.gray,
// // //     fontWeight: '600',
// // //   },
// // //   priceMatchWrap: {
// // //     alignItems: 'flex-end',
// // //   },
// // //   matchBadge: {
// // //     backgroundColor: '#EEF6FF',
// // //     paddingHorizontal: 8,
// // //     paddingVertical: 4,
// // //     borderRadius: 10,
// // //     marginBottom: 6,
// // //   },
// // //   matchText: {
// // //     fontSize: 12,
// // //     fontWeight: '800',
// // //     color: Colors.primary,
// // //   },
// // //   priceText: {
// // //     fontSize: 18,
// // //     fontWeight: '800',
// // //     color: '#ED7117',
// // //     lineHeight: 20,
// // //   },
// // //   perSeatText: {
// // //     fontSize: 10,
// // //     color: Colors.gray,
// // //     fontWeight: '600',
// // //     marginTop: 2,
// // //   },
// // //   infoRow: {
// // //     flexDirection: 'row',
// // //     alignItems: 'center',
// // //     flexWrap: 'wrap',
// // //     marginTop: 12,
// // //     marginBottom: 10,
// // //   },
// // //   infoItem: {
// // //     flexDirection: 'row',
// // //     alignItems: 'center',
// // //     gap: 4,
// // //   },
// // //   infoText: {
// // //     fontSize: 12,
// // //     color: Colors.dark,
// // //     fontWeight: '600',
// // //   },
// // //   warningText: {
// // //     color: '#F59E0B',
// // //   },
// // //   fullText: {
// // //     color: '#EF4444',
// // //   },
// // //   infoDot: {
// // //     width: 4,
// // //     height: 4,
// // //     borderRadius: 2,
// // //     backgroundColor: '#CBD5E1',
// // //     marginHorizontal: 8,
// // //   },
// // //   seatWarningContainer: {
// // //     flexDirection: 'row',
// // //     alignItems: 'center',
// // //     backgroundColor: '#FEF3C7',
// // //     borderRadius: 8,
// // //     padding: 8,
// // //     marginTop: 8,
// // //     marginBottom: 4,
// // //     gap: 6,
// // //   },
// // //   seatWarningText: {
// // //     flex: 1,
// // //     fontSize: 11,
// // //     color: '#D97706',
// // //     fontWeight: '600',
// // //   },
// // //   fullWarningContainer: {
// // //     flexDirection: 'row',
// // //     alignItems: 'center',
// // //     backgroundColor: '#FEF2F2',
// // //     borderRadius: 8,
// // //     padding: 8,
// // //     marginTop: 8,
// // //     marginBottom: 4,
// // //     borderWidth: 1,
// // //     borderColor: '#FEE2E2',
// // //     gap: 6,
// // //   },
// // //   fullWarningText: {
// // //     flex: 1,
// // //     fontSize: 11,
// // //     color: '#EF4444',
// // //     fontWeight: '600',
// // //   },
// // //   divider: {
// // //     height: 1,
// // //     backgroundColor: '#EEF2F7',
// // //     marginBottom: 10,
// // //   },
// // //   routeBlock: {
// // //     gap: 8,
// // //   },
// // //   routeRow: {
// // //     flexDirection: 'row',
// // //     alignItems: 'flex-start',
// // //   },
// // //   routeDot: {
// // //     width: 8,
// // //     height: 8,
// // //     borderRadius: 4,
// // //     marginTop: 5,
// // //     marginRight: 8,
// // //   },
// // //   routeTextWrap: {
// // //     flex: 1,
// // //   },
// // //   routeLabel: {
// // //     fontSize: 11,
// // //     color: Colors.gray,
// // //     fontWeight: '700',
// // //     marginBottom: 2,
// // //   },
// // //   routeText: {
// // //     fontSize: 13,
// // //     color: Colors.dark,
// // //     fontWeight: '600',
// // //     lineHeight: 18,
// // //   },
// // //   vehicleRow: {
// // //     flexDirection: 'row',
// // //     alignItems: 'center',
// // //     gap: 6,
// // //     marginTop: 10,
// // //   },
// // //   vehicleText: {
// // //     fontSize: 12,
// // //     color: Colors.gray,
// // //     fontWeight: '600',
// // //     flex: 1,
// // //   },
// // //   badgeScroll: {
// // //     gap: 8,
// // //     paddingTop: 10,
// // //   },
// // //   prefBadge: {
// // //     paddingHorizontal: 10,
// // //     paddingVertical: 6,
// // //     borderRadius: 12,
// // //     marginRight: 8,
// // //   },
// // //   prefBadgeText: {
// // //     fontSize: 11,
// // //     fontWeight: '700',
// // //   },
// // //   loadingContainer: {
// // //     flex: 1,
// // //     justifyContent: 'center',
// // //     alignItems: 'center',
// // //     backgroundColor: Colors.white,
// // //   },
// // //   emptyContainer: {
// // //     flex: 1,
// // //     justifyContent: 'center',
// // //     alignItems: 'center',
// // //     paddingHorizontal: 40,
// // //   },
// // //   emptyTitle: {
// // //     fontSize: 22,
// // //     fontWeight: '700',
// // //     color: Colors.dark,
// // //     marginTop: 20,
// // //     marginBottom: 8,
// // //   },
// // //   emptySubtitle: {
// // //     fontSize: 15,
// // //     color: Colors.gray,
// // //     textAlign: 'center',
// // //     lineHeight: 22,
// // //     marginBottom: 24,
// // //   },
// // //   requestAlertButton: {
// // //     flexDirection: 'row',
// // //     alignItems: 'center',
// // //     justifyContent: 'center',
// // //     backgroundColor: Colors.primary,
// // //     paddingHorizontal: 20,
// // //     paddingVertical: 14,
// // //     borderRadius: 12,
// // //     marginBottom: 12,
// // //     gap: 8,
// // //     width: '100%',
// // //   },
// // //   requestAlertButtonText: {
// // //     color: Colors.white,
// // //     fontSize: 15,
// // //     fontWeight: '600',
// // //   },
// // //   clearButton: {
// // //     backgroundColor: Colors.primary,
// // //     paddingHorizontal: 24,
// // //     paddingVertical: 12,
// // //     borderRadius: 12,
// // //   },
// // //   clearButtonText: {
// // //     color: Colors.white,
// // //     fontSize: 15,
// // //     fontWeight: '700',
// // //   },
// // //   modalBackdrop: {
// // //     flex: 1,
// // //     backgroundColor: 'rgba(15,23,42,0.28)',
// // //     justifyContent: 'flex-end',
// // //   },
// // //   modalOverlay: {
// // //     flex: 1,
// // //   },
// // //   modalSheet: {
// // //     backgroundColor: Colors.white,
// // //     borderTopLeftRadius: 24,
// // //     borderTopRightRadius: 24,
// // //     maxHeight: '78%',
// // //     paddingTop: 10,
// // //   },
// // //   requestModalSheet: {
// // //     backgroundColor: Colors.white,
// // //     borderTopLeftRadius: 24,
// // //     borderTopRightRadius: 24,
// // //     maxHeight: '80%',
// // //     paddingTop: 10,
// // //   },
// // //   modalHandle: {
// // //     width: 52,
// // //     height: 5,
// // //     borderRadius: 999,
// // //     backgroundColor: '#D1D5DB',
// // //     alignSelf: 'center',
// // //     marginBottom: 14,
// // //   },
// // //   modalHeader: {
// // //     flexDirection: 'row',
// // //     alignItems: 'center',
// // //     justifyContent: 'space-between',
// // //     paddingHorizontal: 18,
// // //     paddingBottom: 10,
// // //   },
// // //   modalTitle: {
// // //     fontSize: 20,
// // //     fontWeight: '800',
// // //     color: Colors.dark,
// // //   },
// // //   modalContent: {
// // //     paddingHorizontal: 18,
// // //     paddingBottom: 20,
// // //   },
// // //   requestModalContent: {
// // //     padding: 20,
// // //   },
// // //   modalSection: {
// // //     marginBottom: 18,
// // //   },
// // //   modalSectionTitle: {
// // //     fontSize: 14,
// // //     fontWeight: '700',
// // //     color: Colors.dark,
// // //     marginBottom: 10,
// // //   },
// // //   modalToggleChip: {
// // //     borderRadius: 14,
// // //     borderWidth: 1,
// // //     borderColor: '#E5E7EB',
// // //     paddingHorizontal: 14,
// // //     paddingVertical: 10,
// // //     alignSelf: 'flex-start',
// // //     backgroundColor: '#F9FAFB',
// // //   },
// // //   modalToggleChipActive: {
// // //     backgroundColor: Colors.primary,
// // //     borderColor: Colors.primary,
// // //   },
// // //   modalToggleChipText: {
// // //     fontSize: 13,
// // //     color: Colors.dark,
// // //     fontWeight: '600',
// // //   },
// // //   modalToggleChipTextActive: {
// // //     color: Colors.white,
// // //   },
// // //   modalOptionWrap: {
// // //     flexDirection: 'row',
// // //     flexWrap: 'wrap',
// // //     gap: 10,
// // //   },
// // //   modalOptionChip: {
// // //     borderRadius: 16,
// // //     borderWidth: 1,
// // //     borderColor: '#E5E7EB',
// // //     paddingHorizontal: 12,
// // //     paddingVertical: 9,
// // //     backgroundColor: '#F9FAFB',
// // //   },
// // //   modalOptionChipActive: {
// // //     backgroundColor: Colors.primary,
// // //     borderColor: Colors.primary,
// // //   },
// // //   modalOptionChipText: {
// // //     fontSize: 13,
// // //     color: Colors.dark,
// // //     fontWeight: '600',
// // //   },
// // //   modalOptionChipTextActive: {
// // //     color: Colors.white,
// // //   },
// // //   modalFooter: {
// // //     flexDirection: 'row',
// // //     paddingHorizontal: 18,
// // //     paddingTop: 12,
// // //     paddingBottom: Platform.OS === 'ios' ? 28 : 18,
// // //     borderTopWidth: 1,
// // //     borderTopColor: '#EEF2F7',
// // //     gap: 12,
// // //   },
// // //   modalSecondaryBtn: {
// // //     flex: 1,
// // //     borderRadius: 14,
// // //     paddingVertical: 14,
// // //     alignItems: 'center',
// // //     backgroundColor: '#F3F4F6',
// // //   },
// // //   modalSecondaryBtnText: {
// // //     fontSize: 15,
// // //     fontWeight: '700',
// // //     color: Colors.dark,
// // //   },
// // //   modalPrimaryBtn: {
// // //     flex: 1,
// // //     borderRadius: 14,
// // //     paddingVertical: 14,
// // //     alignItems: 'center',
// // //     backgroundColor: Colors.primary,
// // //   },
// // //   modalPrimaryBtnText: {
// // //     fontSize: 15,
// // //     fontWeight: '700',
// // //     color: Colors.white,
// // //   },
// // //   requestInfoBox: {
// // //     flexDirection: 'row',
// // //     alignItems: 'center',
// // //     backgroundColor: '#EFF6FF',
// // //     padding: 12,
// // //     borderRadius: 12,
// // //     marginBottom: 16,
// // //     gap: 8,
// // //   },
// // //   requestInfoText: {
// // //     flex: 1,
// // //     fontSize: 13,
// // //     color: '#1E3A8A',
// // //     lineHeight: 18,
// // //   },
// // //   requestRouteBox: {
// // //     backgroundColor: '#F3F4F6',
// // //     padding: 12,
// // //     borderRadius: 12,
// // //     marginBottom: 20,
// // //   },
// // //   requestRouteLabel: {
// // //     fontSize: 12,
// // //     fontWeight: '600',
// // //     color: Colors.gray,
// // //     marginBottom: 4,
// // //   },
// // //   requestRouteText: {
// // //     fontSize: 14,
// // //     fontWeight: '600',
// // //     color: Colors.dark,
// // //     marginBottom: 4,
// // //   },
// // //   requestRouteDetail: {
// // //     fontSize: 12,
// // //     color: Colors.gray,
// // //     marginTop: 2,
// // //   },
// // //   requestInputGroup: {
// // //     marginBottom: 16,
// // //   },
// // //   requestLabel: {
// // //     fontSize: 14,
// // //     fontWeight: '600',
// // //     color: Colors.dark,
// // //     marginBottom: 8,
// // //   },
// // //   requestInput: {
// // //     borderWidth: 1,
// // //     borderColor: '#E5E7EB',
// // //     borderRadius: 12,
// // //     paddingHorizontal: 12,
// // //     paddingVertical: 10,
// // //     fontSize: 14,
// // //     backgroundColor: '#F9FAFB',
// // //   },
// // //   requestTextArea: {
// // //     minHeight: 80,
// // //     textAlignVertical: 'top',
// // //   },
// // //   requestHelper: {
// // //     fontSize: 11,
// // //     color: Colors.gray,
// // //     marginTop: 4,
// // //   },
// // //   requestNoteBox: {
// // //     flexDirection: 'row',
// // //     alignItems: 'center',
// // //     backgroundColor: '#FEF3C7',
// // //     padding: 12,
// // //     borderRadius: 12,
// // //     gap: 8,
// // //   },
// // //   requestNoteText: {
// // //     flex: 1,
// // //     fontSize: 12,
// // //     color: '#D97706',
// // //   },
// // //   disabledButton: {
// // //     opacity: 0.6,
// // //   },
// // //   imageModalContainer: {
// // //     flex: 1,
// // //     justifyContent: 'center',
// // //     alignItems: 'center',
// // //     backgroundColor: 'rgba(0,0,0,0.9)',
// // //   },
// // //   imageModalContent: {
// // //     width: '90%',
// // //     backgroundColor: Colors.white,
// // //     borderRadius: 20,
// // //     overflow: 'hidden',
// // //   },
// // //   imageModalHeader: {
// // //     flexDirection: 'row',
// // //     justifyContent: 'space-between',
// // //     alignItems: 'center',
// // //     padding: 16,
// // //     borderBottomWidth: 1,
// // //     borderBottomColor: '#EEF2F7',
// // //   },
// // //   imageModalTitle: {
// // //     fontSize: 18,
// // //     fontWeight: '700',
// // //     color: Colors.dark,
// // //   },
// // //   fullProfileImage: {
// // //     width: '100%',
// // //     height: 400,
// // //     backgroundColor: '#F5F5F5',
// // //   },
// // //   noImageContainer: {
// // //     width: '100%',
// // //     height: 400,
// // //     justifyContent: 'center',
// // //     alignItems: 'center',
// // //     backgroundColor: '#F5F5F5',
// // //   },
// // //   noImageText: {
// // //     fontSize: 16,
// // //     color: Colors.gray,
// // //   },
// // //   svgContainer: {
// // //     width: 48,
// // //     height: 48,
// // //     alignItems: 'center',
// // //     justifyContent: 'center',
// // //   },
// // //   initialsContainer: {
// // //     width: '100%',
// // //     height: '100%',
// // //     alignItems: 'center',
// // //     justifyContent: 'center',
// // //     backgroundColor: '#E5E7EB',
// // //   },
// // //   modalSvgContainer: {
// // //     width: '100%',
// // //     height: 400,
// // //     backgroundColor: '#F5F5F5',
// // //     alignItems: 'center',
// // //     justifyContent: 'center',
// // //   },
// // //   debugBanner: {
// // //     flexDirection: 'row',
// // //     alignItems: 'center',
// // //     padding: 12,
// // //     marginHorizontal: 16,
// // //     marginTop: 8,
// // //     marginBottom: 8,
// // //     borderRadius: 8,
// // //     gap: 8,
// // //   },
// // //   debugBannerSuccess: {
// // //     backgroundColor: '#DCFCE7',
// // //     borderLeftWidth: 4,
// // //     borderLeftColor: '#22C55E',
// // //   },
// // //   debugBannerError: {
// // //     backgroundColor: '#FEE2E2',
// // //     borderLeftWidth: 4,
// // //     borderLeftColor: '#EF4444',
// // //   },
// // //   debugBannerText: {
// // //     flex: 1,
// // //     fontSize: 12,
// // //     fontWeight: '500',
// // //   },
// // //   debugBannerTextSuccess: {
// // //     color: '#166534',
// // //   },
// // //   debugBannerTextError: {
// // //     color: '#991B1B',
// // //   },
// // // });
// // // import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
// // // import {
// // //   View,
// // //   Text,
// // //   StyleSheet,
// // //   TouchableOpacity,
// // //   FlatList,
// // //   StatusBar,
// // //   Platform,
// // //   Image,
// // //   ScrollView,
// // //   Modal,
// // //   RefreshControl,
// // //   TextInput,
// // //   ActivityIndicator,
// // // } from 'react-native';
// // // import { SafeAreaView } from 'react-native-safe-area-context';
// // // import { Ionicons, MaterialIcons } from '@expo/vector-icons';
// // // import LottieView from "lottie-react-native";
// // // import { Colors, Typography } from '../constants/Colors';
// // // import { useAuth } from '../context/AuthContext';
// // // import { API_BASE_URL } from '../config/config_ip';
// // // import DatabaseService from '../services/matchingpreference_ds';
// // // import CustomAlert from '../components/CustomAlert';
// // // import { SvgCssUri } from 'react-native-svg/css';
// // // import { useFocusEffect } from '@react-navigation/native';

// // // const IMAGE_BASE_URL = API_BASE_URL;

// // // // Enable fetch logging for debugging
// // // const originalFetch = global.fetch;
// // // global.fetch = async (...args) => {
// // //   const [url, options] = args;
  
// // //   // Log outgoing requests for ride-related endpoints
// // //   if (typeof url === 'string' && (url.includes('/request-ride-alert') || 
// // //       url.includes('/my-ride-requests') || 
// // //       url.includes('/search-rides'))) {
// // //     console.log(`\n🌐 ========== API REQUEST ==========`);
// // //     console.log(`📍 URL: ${url}`);
// // //     console.log(`📌 Method: ${options?.method || 'GET'}`);
// // //     if (options?.body) {
// // //       try {
// // //         const body = JSON.parse(options.body);
// // //         console.log(`📦 Body:`, JSON.stringify(body, null, 2));
// // //       } catch(e) {
// // //         console.log(`📦 Body: ${options.body}`);
// // //       }
// // //     }
// // //   }
  
// // //   const response = await originalFetch(...args);
  
// // //   // Log responses
// // //   if (typeof url === 'string' && (url.includes('/request-ride-alert') || 
// // //       url.includes('/my-ride-requests') || 
// // //       url.includes('/search-rides'))) {
// // //     const clonedResponse = response.clone();
// // //     const data = await clonedResponse.json();
// // //     console.log(`\n📥 RESPONSE:`);
// // //     console.log(`   Status: ${response.status}`);
// // //     console.log(`   Data:`, JSON.stringify(data, null, 2));
// // //     console.log(`====================================\n`);
// // //   }
  
// // //   return response;
// // // };

// // // const QUICK_FILTER_KEYS = [
// // //   'verified_profiles_only',
// // //   'same_gender_after_9pm',
// // //   'smoking_policy',
// // //   'pets_allowed',
// // //   'chat_level',
// // //   'luggage_allowance',
// // // ];

// // // const QUICK_FILTER_LABELS = {
// // //   verified_profiles_only: 'Verified Only',
// // //   same_gender_after_9pm: 'Same Gender Night',
// // //   smoking_policy: 'No Smoking',
// // //   pets_allowed: 'Pets',
// // //   chat_level: 'Chat Level',
// // //   luggage_allowance: 'Luggage',
// // // };

// // // const SORT_OPTIONS = [
// // //   { key: 'time', label: 'Time' },
// // //   { key: 'price', label: 'Price' },
// // //   { key: 'rating', label: 'Rating' },
// // //   { key: 'match', label: 'Match %' },
// // // ];

// // // function buildImageUrl(url) {
// // //   if (!url) return null;
// // //   if (url.startsWith('http://') || url.startsWith('https://')) return url;
// // //   return `${IMAGE_BASE_URL}${url.startsWith('/') ? '' : '/'}${url}`;
// // // }

// // // function getDriverInitials(name) {
// // //   if (!name) return 'D';
// // //   const parts = name.trim().split(' ').filter(Boolean);
// // //   if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
// // //   return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
// // // }

// // // function normalizeText(value) {
// // //   if (value === undefined || value === null) return '';
// // //   return String(value).trim().toLowerCase();
// // // }

// // // function getRidePreferences(item) {
// // //   if (item.preferences) return item.preferences;
// // //   if (item.ridePreferences) return item.ridePreferences;
// // //   if (item.matchingPreferences) return item.matchingPreferences;
// // //   if (item.travel_preferences) return item.travel_preferences;
// // //   return {};
// // // }

// // // function extractPreferenceBadges(item) {
// // //   const prefs = getRidePreferences(item);
// // //   const badges = [];

// // //   if (!prefs || Object.keys(prefs).length === 0) {
// // //     return [];
// // //   }

// // //   Object.entries(prefs).forEach(([key, value]) => {
// // //     if (value === null || value === undefined) return;
    
// // //     if (typeof value === 'boolean') {
// // //       if (value === true) {
// // //         if (key === 'verified_profiles_only') {
// // //           badges.push('Verified Only');
// // //         } else {
// // //           const displayKey = key.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
// // //           badges.push(displayKey);
// // //         }
// // //       }
// // //     } 
// // //     else if (Array.isArray(value)) {
// // //       if (value.length > 0) {
// // //         value.forEach(v => {
// // //           if (v && v.trim()) {
// // //             badges.push(v.trim());
// // //           }
// // //         });
// // //       }
// // //     }
// // //     else if (typeof value === 'string' && value.trim()) {
// // //       const lowerValue = value.toLowerCase();
// // //       if (!['false', 'no', 'none', 'null', 'undefined', 'no preference'].includes(lowerValue)) {
// // //         badges.push(value);
// // //       }
// // //     }
// // //     else if (typeof value === 'number') {
// // //       badges.push(String(value));
// // //     }
// // //   });

// // //   return [...new Set(badges)];
// // // }

// // // async function fetchUserDocuments(phoneNumber) {
// // //   try {
// // //     const url = `${API_BASE_URL}/api/v1/documents/user/${phoneNumber}`;
// // //     const res = await fetch(url, { headers: { Accept: 'application/json' } });
// // //     if (!res.ok) return null;
// // //     const data = await res.json();
// // //     return data;
// // //   } catch (e) {
// // //     console.log('fetchUserDocuments error:', e);
// // //     return null;
// // //   }
// // // }

// // // async function fetchDriverProfile(phoneNumber, userId) {
// // //   try {
// // //     const params = new URLSearchParams();
// // //     if (userId) params.append('user_id', userId);
// // //     else if (phoneNumber) params.append('phone_number', phoneNumber);
// // //     else return null;
// // //     const url = `${API_BASE_URL}/api/v1/users/profile-public?${params.toString()}`;
// // //     const res = await fetch(url, { headers: { Accept: 'application/json' } });
// // //     if (!res.ok) return null;
// // //     const data = await res.json();
// // //     return data;
// // //   } catch (e) {
// // //     console.log('fetchDriverProfile error:', e);
// // //     return null;
// // //   }
// // // }

// // // function checkVerifiedDocuments(docs) {
// // //   if (!docs || !docs.length) return false;
  
// // //   const verified = docs.filter(doc => {
// // //     const docType = doc.document_type?.toLowerCase();
// // //     const status = doc.status?.toUpperCase();
// // //     return status === 'APPROVED' && ['aadhar', 'dl', 'rc'].includes(docType);
// // //   });
  
// // //   return verified.length > 0;
// // // }

// // // function RatingStars({ rating, size = 12, showLabel = true }) {
// // //   const fullStars = Math.floor(rating);
// // //   const hasHalfStar = rating % 1 >= 0.5;
// // //   const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);
  
// // //   return (
// // //     <View style={{ flexDirection: 'row', alignItems: 'center' }}>
// // //       {[...Array(fullStars)].map((_, i) => (
// // //         <Ionicons key={`full-${i}`} name="star" size={size} color="#F59E0B" />
// // //       ))}
// // //       {hasHalfStar && (
// // //         <Ionicons name="star-half" size={size} color="#F59E0B" />
// // //       )}
// // //       {[...Array(emptyStars)].map((_, i) => (
// // //         <Ionicons key={`empty-${i}`} name="star-outline" size={size} color="#F59E0B" />
// // //       ))}
// // //       {showLabel && rating > 0 && (
// // //         <Text style={[styles.ratingText, { marginLeft: 4 }]}>({rating.toFixed(1)})</Text>
// // //       )}
// // //       {showLabel && rating === 0 && (
// // //         <Text style={[styles.ratingText, { marginLeft: 4 }]}>New</Text>
// // //       )}
// // //     </View>
// // //   );
// // // }

// // // function matchesQuickFilter(item, key) {
// // //   const prefs = getRidePreferences(item);
// // //   const value = prefs?.[key];
// // //   const normalized = normalizeText(value);

// // //   if (key === 'verified_profiles_only') {
// // //     return !!item.isVerified;
// // //   }

// // //   if (typeof value === 'boolean') return value;
// // //   if (Array.isArray(value)) return value.length > 0;

// // //   if (key === 'smoking_policy') {
// // //     return normalized.includes('no');
// // //   }

// // //   if (key === 'same_gender_after_9pm') {
// // //     return normalized === 'true' || normalized === 'yes' || normalized === 'same gender';
// // //   }

// // //   if (key === 'pets_allowed') {
// // //     return normalized === 'true' || normalized === 'yes' || normalized === 'allowed';
// // //   }

// // //   return !!normalized;
// // // }

// // // function matchesAdvancedFilter(item, key, expectedValue) {
// // //   if (expectedValue === undefined || expectedValue === null || expectedValue === '') {
// // //     return true;
// // //   }

// // //   const prefs = getRidePreferences(item);
// // //   const rideValue = prefs?.[key];

// // //   if (typeof expectedValue === 'boolean') {
// // //     if (key === 'verified_profiles_only') {
// // //       return expectedValue ? !!item.isVerified : true;
// // //     }
// // //     return rideValue === expectedValue || normalizeText(rideValue) === String(expectedValue);
// // //   }

// // //   if (Array.isArray(rideValue)) {
// // //     return rideValue.map(v => normalizeText(v)).includes(normalizeText(expectedValue));
// // //   }

// // //   return normalizeText(rideValue) === normalizeText(expectedValue);
// // // }

// // // function ProfileImageModal({ visible, imageUrl, driverName, onClose }) {
// // //   const [isSvg, setIsSvg] = useState(false);
  
// // //   useEffect(() => {
// // //     if (imageUrl) {
// // //       setIsSvg(imageUrl.toLowerCase().includes('.svg'));
// // //     }
// // //   }, [imageUrl]);
  
// // //   if (!visible) return null;
  
// // //   return (
// // //     <Modal
// // //       visible={visible}
// // //       transparent={true}
// // //       animationType="fade"
// // //       onRequestClose={onClose}
// // //     >
// // //       <TouchableOpacity 
// // //         style={styles.modalBackdrop}
// // //         activeOpacity={1}
// // //         onPress={onClose}
// // //       >
// // //         <View style={styles.imageModalContainer}>
// // //           <View style={styles.imageModalContent}>
// // //             <View style={styles.imageModalHeader}>
// // //               <Text style={styles.imageModalTitle}>{driverName}</Text>
// // //               <TouchableOpacity onPress={onClose}>
// // //                 <Ionicons name="close" size={24} color={Colors.dark} />
// // //               </TouchableOpacity>
// // //             </View>
// // //             {imageUrl && imageUrl !== 'null' && imageUrl !== 'undefined' ? (
// // //               isSvg ? (
// // //                 <View style={styles.modalSvgContainer}>
// // //                   <SvgCssUri
// // //                     uri={imageUrl}
// // //                     width="100%"
// // //                     height={400}
// // //                   />
// // //                 </View>
// // //               ) : (
// // //                 <Image
// // //                   source={{ uri: imageUrl }}
// // //                   style={styles.fullProfileImage}
// // //                   resizeMode="contain"
// // //                 />
// // //               )
// // //             ) : (
// // //               <View style={styles.noImageContainer}>
// // //                 <Text style={styles.noImageText}>No profile picture available</Text>
// // //               </View>
// // //             )}
// // //           </View>
// // //         </View>
// // //       </TouchableOpacity>
// // //     </Modal>
// // //   );
// // // }

// // // function PreferenceTag({ label }) {
// // //   if (!label || label.trim() === '') return null;
  
// // //   let tagColor = '#FFF3E8';
// // //   let textColor = '#C65D00';
  
// // //   const lowerLabel = label.toLowerCase();
  
// // //   if (lowerLabel.includes('chatty') || lowerLabel.includes('talkative')) {
// // //     tagColor = '#E3F2FD';
// // //     textColor = '#1565C0';
// // //   } else if (lowerLabel.includes('quiet')) {
// // //     tagColor = '#E8F5E9';
// // //     textColor = '#2E7D32';
// // //   } else if (lowerLabel.includes('english') || lowerLabel.includes('hindi') || lowerLabel.includes('language')) {
// // //     tagColor = '#FFF9C4';
// // //     textColor = '#F57F17';
// // //   } else if (lowerLabel.includes('music') || lowerLabel.includes('songs')) {
// // //     tagColor = '#F3E5F5';
// // //     textColor = '#6A1B9A';
// // //   } else if (lowerLabel.includes('ac')) {
// // //     tagColor = '#E3F2FD';
// // //     textColor = '#1565C0';
// // //   } else if (lowerLabel.includes('pet')) {
// // //     tagColor = '#FCE4EC';
// // //     textColor = '#C2185B';
// // //   } else if (lowerLabel.includes('smoking')) {
// // //     tagColor = '#FFEBEE';
// // //     textColor = '#C62828';
// // //   } else if (lowerLabel.includes('verified')) {
// // //     tagColor = '#E8F5E9';
// // //     textColor = '#2E7D32';
// // //   } else if (lowerLabel.match(/[0-9]/)) {
// // //     tagColor = '#E8F5E9';
// // //     textColor = '#2E7D32';
// // //   }
  
// // //   return (
// // //     <View style={[styles.prefBadge, { backgroundColor: tagColor }]}>
// // //       <Text style={[styles.prefBadgeText, { color: textColor }]}>{label}</Text>
// // //     </View>
// // //   );
// // // }

// // // export default function RideNextScreen({ navigation, route }) {
// // //   const { user, loading: authLoading } = useAuth();
// // //   const { searchData } = route.params || {};
// // //   const { from, to, fromCoords, toCoords, dateTime, seats } = searchData || {};

// // //   const [availableRides, setAvailableRides] = useState([]);
// // //   const [loading, setLoading] = useState(true);
// // //   const [refreshing, setRefreshing] = useState(false);
// // //   const [errorMessage, setErrorMessage] = useState('');
// // //   const [sortBy, setSortBy] = useState('time');
// // //   const [quickFilters, setQuickFilters] = useState([]);
// // //   const [headerFiltersVisible, setHeaderFiltersVisible] = useState(false);
// // //   const [filterModalVisible, setFilterModalVisible] = useState(false);
// // //   const [preferenceMaster, setPreferenceMaster] = useState([]);
// // //   const [userPreferences, setUserPreferences] = useState({});
// // //   const [advancedFilters, setAdvancedFilters] = useState({});
  
// // //   // Ride Request Alert States
// // //   const [showRideRequestModal, setShowRideRequestModal] = useState(false);
// // //   const [rideRequestLoading, setRideRequestLoading] = useState(false);
// // //   const [rideRequestEmail, setRideRequestEmail] = useState('');
// // //   const [rideRequestNotes, setRideRequestNotes] = useState('');
// // //   const [lastRequestStatus, setLastRequestStatus] = useState(null);
  
// // //   // User Ride Requests States
// // //   const [userRideRequests, setUserRideRequests] = useState([]);
// // //   const [showRequestsList, setShowRequestsList] = useState(false);
// // //   const [cancelRequestLoading, setCancelRequestLoading] = useState(false);
  
// // //   const [selectedProfile, setSelectedProfile] = useState({
// // //     visible: false,
// // //     imageUrl: null,
// // //     driverName: '',
// // //   });

// // //   const [alertVisible, setAlertVisible] = useState(false);
// // //   const [alertConfig, setAlertConfig] = useState({
// // //     title: "",
// // //     message: "",
// // //     icon: "check-circle",
// // //     iconColor: "#10B981",
// // //     buttons: []
// // //   });

// // //   const phoneNumber = user?.phone_number;
// // //   const userGender = user?.gender;
// // //   const requestedSeats = seats || 1;

// // //   const showCustomAlert = (title, message, type = 'success') => {
// // //     let icon = "check-circle";
// // //     let iconColor = "#10B981";
    
// // //     if (type === 'error') {
// // //       icon = "error";
// // //       iconColor = "#EF4444";
// // //     } else if (type === 'warning') {
// // //       icon = "warning";
// // //       iconColor = "#F59E0B";
// // //     } else if (type === 'info') {
// // //       icon = "info";
// // //       iconColor = Colors.primary;
// // //     }
    
// // //     setAlertConfig({
// // //       title,
// // //       message,
// // //       icon,
// // //       iconColor,
// // //       buttons: [{ text: 'OK', onPress: () => setAlertVisible(false) }]
// // //     });
// // //     setAlertVisible(true);
// // //   };

// // // // Fetch user's ride requests - ADD useCallback with proper deps
// // // const fetchUserRideRequests = useCallback(async () => {
// // //   if (!phoneNumber) return;
  
// // //   try {
// // //     const response = await fetch(`${API_BASE_URL}/my-ride-requests/${phoneNumber}`);
// // //     const data = await response.json();
    
// // //     if (data.success && data.requests) {
// // //       const activeRequests = data.requests.filter(req => req.status === 'active');
// // //       setUserRideRequests(activeRequests);
// // //       console.log(`📋 Found ${activeRequests.length} active ride requests`);
// // //     }
// // //   } catch (error) {
// // //     console.log('Error fetching ride requests:', error);
// // //   }
// // // }, [phoneNumber]); // Only depend on phoneNumber
// // //   // Cancel a ride request
// // //   const cancelRideRequest = async (requestId) => {
// // //     if (!phoneNumber) return;
    
// // //     setCancelRequestLoading(true);
    
// // //     try {
// // //       const response = await fetch(`${API_BASE_URL}/ride-request/${requestId}?phone_number=${phoneNumber}`, {
// // //         method: 'DELETE',
// // //       });
      
// // //       const result = await response.json();
      
// // //       if (result.success) {
// // //         showCustomAlert('Request Cancelled', 'Your ride request has been cancelled.', 'success');
// // //         await fetchUserRideRequests(); // Refresh the list
// // //         setShowRequestsList(false);
// // //       } else {
// // //         showCustomAlert('Error', result.message || 'Could not cancel request', 'error');
// // //       }
// // //     } catch (error) {
// // //       console.log('Error cancelling ride request:', error);
// // //       showCustomAlert('Error', 'Could not cancel request. Please try again.', 'error');
// // //     } finally {
// // //       setCancelRequestLoading(false);
// // //     }
// // //   };

// // //   // Debug function to check ride requests
// // //   const checkUserRideRequests = useCallback(async () => {
// // //     if (!phoneNumber) return;
    
// // //     console.log('\n🔍 ========== CHECKING USER RIDE REQUESTS ==========');
// // //     console.log(`👤 User: ${user?.full_name || user?.first_name} (${phoneNumber})`);
    
// // //     try {
// // //       const response = await fetch(`${API_BASE_URL}/my-ride-requests/${phoneNumber}`);
// // //       const data = await response.json();
      
// // //       if (data.success && data.requests) {
// // //         console.log(`📊 Found ${data.requests.length} ride requests:`);
// // //         data.requests.forEach((req, index) => {
// // //           console.log(`\n   Request ${index + 1} (ID: ${req.id}):`);
// // //           console.log(`      From: ${req.from_location.substring(0, 60)}...`);
// // //           console.log(`      To: ${req.to_location.substring(0, 60)}...`);
// // //           console.log(`      Status: ${req.status}`);
// // //           console.log(`      Seats: ${req.seats_needed}`);
// // //           console.log(`      Created: ${req.created_at}`);
// // //           console.log(`      Expires: ${req.expires_at}`);
// // //           if (req.notified_at) {
// // //             console.log(`      Notified: ${req.notified_at}`);
// // //           }
// // //         });
// // //       } else {
// // //         console.log('📭 No ride requests found');
// // //       }
// // //     } catch (error) {
// // //       console.log('❌ Error checking ride requests:', error);
// // //     }
    
// // //     console.log('🔍 ================================================\n');
// // //   }, [phoneNumber, user]);

// // //   // Check if current rides match any requests
// // //   const checkMatchingWithCurrentRides = useCallback(async () => {
// // //     if (!phoneNumber || availableRides.length === 0) return;
    
// // //     console.log('\n🔍 ========== CHECKING MATCHES ==========');
// // //     console.log(`📊 Available rides: ${availableRides.length}`);
// // //     console.log(`📍 Current search:`);
// // //     console.log(`   From: ${from}`);
// // //     console.log(`   To: ${to}`);
    
// // //     try {
// // //       const response = await fetch(`${API_BASE_URL}/my-ride-requests/${phoneNumber}`);
// // //       const data = await response.json();
      
// // //       if (!data.success || !data.requests) {
// // //         console.log('❌ Could not fetch ride requests');
// // //         return;
// // //       }
      
// // //       const activeRequests = data.requests.filter(req => req.status === 'active');
// // //       console.log(`\n📋 Active requests: ${activeRequests.length}`);
      
// // //       if (activeRequests.length === 0) {
// // //         console.log('📭 No active requests to match');
// // //         console.log('🔍 ==================================\n');
// // //         return;
// // //       }
      
// // //       // For each active request, check if any ride matches
// // //       for (const req of activeRequests) {
// // //         console.log(`\n📋 Checking Request ID ${req.id}:`);
// // //         console.log(`   Request From: ${req.from_location.substring(0, 50)}...`);
// // //         console.log(`   Request To: ${req.to_location.substring(0, 50)}...`);
        
// // //         const reqFromKeyword = req.from_location.split(',')[0].toLowerCase().trim();
// // //         const reqToKeyword = req.to_location.split(',')[0].toLowerCase().trim();
        
// // //         let matched = false;
        
// // //         for (const ride of availableRides) {
// // //           const rideFromKeyword = ride.from.split(',')[0].toLowerCase().trim();
// // //           const rideToKeyword = ride.to.split(',')[0].toLowerCase().trim();
          
// // //           const fromMatch = rideFromKeyword === reqFromKeyword || 
// // //                            rideFromKeyword.includes(reqFromKeyword) || 
// // //                            reqFromKeyword.includes(rideFromKeyword);
// // //           const toMatch = rideToKeyword === reqToKeyword || 
// // //                          rideToKeyword.includes(reqToKeyword) || 
// // //                          reqToKeyword.includes(rideToKeyword);
          
// // //           if (fromMatch && toMatch) {
// // //             console.log(`\n   ✅ MATCH FOUND!`);
// // //             console.log(`      Ride ID: ${ride.id}`);
// // //             console.log(`      Ride From: ${ride.from.substring(0, 50)}...`);
// // //             console.log(`      Ride To: ${ride.to.substring(0, 50)}...`);
// // //             console.log(`      ${rideFromKeyword} → ${reqFromKeyword} (match)`);
// // //             console.log(`      ${rideToKeyword} → ${reqToKeyword} (match)`);
// // //             matched = true;
// // //             break;
// // //           }
// // //         }
        
// // //         if (!matched) {
// // //           console.log(`   ❌ No matching ride found for Request ${req.id}`);
// // //           console.log(`      Looking for: ${reqFromKeyword} → ${reqToKeyword}`);
// // //         }
// // //       }
      
// // //     } catch (error) {
// // //       console.log('❌ Error checking matches:', error);
// // //     }
    
// // //     console.log('🔍 ==================================\n');
// // //   }, [phoneNumber, availableRides, from, to]);

// // //   // Handle Ride Request Alert
// // //   const handleRequestRideAlert = async () => {
// // //     const userEmail = user?.email || '';
    
// // //     console.log('\n📧 ========== RIDE REQUEST ALERT ==========');
// // //     console.log(`👤 User: ${user?.full_name || user?.first_name} (${phoneNumber})`);
// // //     console.log(`📧 User email: ${userEmail}`);
// // //     console.log(`📧 Entered email: ${rideRequestEmail}`);
// // //     console.log(`📍 From: ${from}`);
// // //     console.log(`📍 To: ${to}`);
// // //     console.log(`📅 Date/Time: ${dateTime}`);
// // //     console.log(`💺 Seats needed: ${requestedSeats}`);
// // //     console.log(`📝 Notes: ${rideRequestNotes || '(none)'}`);
    
// // //     if (!rideRequestEmail && !userEmail) {
// // //       console.log('❌ No email provided');
// // //       showCustomAlert('Email Required', 'Please enter your email address to receive notifications.', 'error');
// // //       return;
// // //     }
    
// // //     const emailToUse = rideRequestEmail || userEmail;
    
// // //     if (!emailToUse.includes('@')) {
// // //       console.log('❌ Invalid email format:', emailToUse);
// // //       showCustomAlert('Invalid Email', 'Please enter a valid email address.', 'error');
// // //       return;
// // //     }
    
// // //     setRideRequestLoading(true);
// // //     setLastRequestStatus(null);
    
// // //     try {
// // //       const requestBody = {
// // //         from_location: from,
// // //         to_location: to,
// // //         from_coords: fromCoords,
// // //         to_coords: toCoords,
// // //         preferred_date: dateTime,
// // //         preferred_time: new Date(dateTime).toLocaleTimeString(),
// // //         seats_needed: requestedSeats,
// // //         passenger_phone: user?.phone_number,
// // //         passenger_name: user?.full_name || user?.first_name,
// // //         passenger_email: emailToUse,
// // //         notes: rideRequestNotes
// // //       };
      
// // //       console.log('\n📤 Sending request to server:', JSON.stringify(requestBody, null, 2));
      
// // //       const response = await fetch(`${API_BASE_URL}/request-ride-alert`, {
// // //         method: 'POST',
// // //         headers: {
// // //           'Content-Type': 'application/json',
// // //         },
// // //         body: JSON.stringify(requestBody),
// // //       });
      
// // //       const result = await response.json();
// // //       console.log('\n📥 Server response:', JSON.stringify(result, null, 2));
      
// // //       if (result.success) {
// // //         console.log('✅ Ride request created successfully!');
// // //         console.log(`   Request ID: ${result.request_id}`);
// // //         console.log(`   Expires at: ${result.expires_at}`);
        
// // //         setLastRequestStatus({
// // //           success: true,
// // //           message: `Request #${result.request_id} created. We'll email you when a ride is available.`
// // //         });
        
// // //         showCustomAlert(
// // //           'Request Submitted! 📧', 
// // //           `We'll email you at ${emailToUse} when a ride matching your route is posted.\n\nRequest expires in 7 days.`,
// // //           'success'
// // //         );
// // //         setShowRideRequestModal(false);
// // //         setRideRequestEmail('');
// // //         setRideRequestNotes('');
        
// // //         // Refresh user's ride requests
// // //         await fetchUserRideRequests();
        
// // //         // Check for immediate matches after creating request
// // //         setTimeout(() => {
// // //           fetchAvailableRides(true);
// // //           checkUserRideRequests();
// // //         }, 1000);
        
// // //       } else {
// // //         console.log('❌ Request failed:', result.message);
// // //         setLastRequestStatus({
// // //           success: false,
// // //           message: result.message || 'Could not create ride request'
// // //         });
// // //         showCustomAlert('Request Failed', result.message || 'Could not create ride request', 'error');
// // //       }
// // //     } catch (error) {
// // //       console.log('❌ Error creating ride request:', error);
// // //       setLastRequestStatus({
// // //         success: false,
// // //         message: error.message || 'Network error'
// // //       });
// // //       showCustomAlert('Error', 'Could not create ride request. Please try again.', 'error');
// // //     } finally {
// // //       setRideRequestLoading(false);
// // //       console.log('📧 ========================================\n');
// // //     }
// // //   };

// // // const fetchAvailableRides = useCallback(async (showRefresh = false) => {
// // //   if (!searchData || !fromCoords || !toCoords || !dateTime) {
// // //     console.log('⚠️ Missing search data, skipping fetch');
// // //     if (!showRefresh) {
// // //       setAvailableRides([]);
// // //       setLoading(false);
// // //     }
// // //     return;
// // //   }

// // //   console.log('\n🚗 ========== FETCHING RIDES ==========');

// // //   try {
// // //     if (showRefresh) {
// // //       setRefreshing(true);
// // //     } else {
// // //       setLoading(true);
// // //     }
// // //     setErrorMessage('');

// // //     const requestBody = {
// // //       from_location: from,
// // //       to_location: to,
// // //       from_coords: fromCoords,
// // //       to_coords: toCoords,
// // //       departure_time: new Date(dateTime).toISOString(),
// // //       seats_required: requestedSeats,
// // //       passenger_gender: userGender,
// // //     };
    
// // //     console.log('📤 Search request:', JSON.stringify(requestBody, null, 2));

// // //     const response = await fetch(`${API_BASE_URL}/search-rides`, {
// // //       method: 'POST',
// // //       headers: {
// // //         'Content-Type': 'application/json',
// // //       },
// // //       body: JSON.stringify(requestBody),
// // //     });

// // //     const rawText = await response.text();
// // //     let parsedData = null;

// // //     try {
// // //       parsedData = rawText ? JSON.parse(rawText) : {};
// // //     } catch (parseError) {
// // //       parsedData = { detail: rawText || 'Unexpected server response' };
// // //     }

// // //     if (!response.ok) {
// // //       throw new Error(parsedData?.detail || 'Failed to fetch rides');
// // //     }

// // //     const rides = Array.isArray(parsedData?.rides) ? parsedData.rides : [];
    
// // //     console.log(`📱 Found ${rides.length} rides`);
    
// // //     const ridesWithDetails = await Promise.all(
// // //       rides.map(async (ride) => {
// // //         // ... rest of your mapping code stays the same ...
// // //         let isVerified = false;
// // //         let avgRating = ride.rating || 0;
// // //         let profilePictureUrl = null;
        
// // //         const driverPhone = ride.phoneNumber;
// // //         const driverUserId = ride.driverUserId;
        
// // //         if (driverPhone || driverUserId) {
// // //           if (driverPhone) {
// // //             const docsData = await fetchUserDocuments(driverPhone);
// // //             if (docsData?.success && docsData.documents) {
// // //               isVerified = checkVerifiedDocuments(docsData.documents);
// // //             }
// // //           }
          
// // //           const profileData = await fetchDriverProfile(driverPhone, driverUserId);
          
// // //           if (profileData?.success && profileData.user) {
// // //             avgRating = profileData.user.avg_rating || 0;
            
// // //             const possiblePictureFields = ['profile_picture', 'profilePicture', 'profilePhoto', 'profile_image', 'avatar'];
// // //             for (const field of possiblePictureFields) {
// // //               if (profileData.user[field]) {
// // //                 profilePictureUrl = profileData.user[field];
// // //                 break;
// // //               }
// // //             }
            
// // //             if (!profilePictureUrl && profileData.user.profile && profileData.user.profile.picture) {
// // //               profilePictureUrl = profileData.user.profile.picture;
// // //             }
// // //           }
// // //         }
        
// // //         if (!profilePictureUrl) {
// // //           if (ride.profilePicture) profilePictureUrl = ride.profilePicture;
// // //           else if (ride.profilepicture) profilePictureUrl = ride.profilepicture;
// // //           else if (ride.profilePhoto) profilePictureUrl = ride.profilePhoto;
// // //           else if (ride.driverProfilePicture) profilePictureUrl = ride.driverProfilePicture;
// // //         }
        
// // //         let finalProfilePicture = null;
// // //         if (profilePictureUrl) {
// // //           finalProfilePicture = buildImageUrl(profilePictureUrl);
// // //         }
        
// // //         let availableSeats = ride.seatsAvailable || ride.available_seats || 0;
        
// // //         return { 
// // //           ...ride, 
// // //           isVerified, 
// // //           rating: avgRating,
// // //           profilePicture: finalProfilePicture,
// // //           profilepicture: finalProfilePicture,
// // //           profilePhoto: finalProfilePicture,
// // //           pickupLabel: ride.pickupLabel || ride.pickupLocationName || ride.fromLocationName || ride.from || 'Pickup point',
// // //           dropLabel: ride.dropLabel || ride.dropLocationName || ride.toLocationName || ride.to || 'Drop point',
// // //           womenOnly: ride.womenOnly === true || ride.women_only === true,
// // //           seatsAvailable: availableSeats,
// // //           requestedSeats: requestedSeats,
// // //           isFull: availableSeats === 0,
// // //         };
// // //       })
// // //     );
    
// // //     setAvailableRides(ridesWithDetails);
// // //     console.log(`✅ Loaded ${ridesWithDetails.length} rides with details`);
    
// // //   } catch (error) {
// // //     console.log('❌ search-rides error:', error);
// // //     setAvailableRides([]);
// // //     setErrorMessage(error.message || 'Failed to search rides');
// // //     showCustomAlert('Search Error', error.message || 'Failed to search rides', 'error');
// // //   } finally {
// // //     setLoading(false);
// // //     setRefreshing(false);
// // //     console.log('🚗 ==================================\n');
// // //   }
// // // }, [searchData, from, to, fromCoords, toCoords, dateTime, requestedSeats, userGender]); // Keep dependencies
// // //   const loadPreferenceData = useCallback(async () => {
// // //     try {
// // //       const defs = await DatabaseService.getMatchingPreferenceMaster();
// // //       setPreferenceMaster(defs || []);

// // //       if (phoneNumber) {
// // //         const saved = await DatabaseService.getUserMatchingPreferences(phoneNumber);
// // //         setUserPreferences(saved || {});
// // //       }
// // //     } catch (e) {
// // //       console.log('❌ preference load error:', e);
// // //     }
// // //   }, [phoneNumber]);

// // //  // Add this with your other useRef declarations (around line 200)
// // // const hasLoaded = useRef(false);

// // // // Initial load - FIXED to prevent infinite loop
// // // useEffect(() => {
// // //   if (authLoading) return;
// // //   if (hasLoaded.current) return;
// // //   hasLoaded.current = true;
  
// // //   console.log('\n🚀 Component mounted, loading data...');
// // //   fetchAvailableRides();
// // //   loadPreferenceData();
// // //   checkUserRideRequests();
// // //   fetchUserRideRequests();
// // // }, [authLoading]); // Remove all dependencies except authLoading
// // //   // Refresh on focus
// // //   // Refresh on focus - ONLY refresh, don't reload everything
// // // useFocusEffect(
// // //   useCallback(() => {
// // //     // Only refresh ride requests, not full search
// // //     fetchUserRideRequests();
// // //   }, [fetchUserRideRequests])
// // // );

// // // // Manual refresh
// // // const onRefresh = useCallback(() => {
// // //   console.log('🔄 Manual refresh triggered');
// // //   fetchAvailableRides(true);
// // //   // Don't call checkUserRideRequests here - it will be called inside fetchAvailableRides
// // //   // Don't call fetchUserRideRequests here - it will cause re-render loop
// // // }, [fetchAvailableRides]);
// // //   const quickFilterOptions = useMemo(() => {
// // //     const defs = preferenceMaster.filter(pref => QUICK_FILTER_KEYS.includes(pref.key));
// // //     return defs.slice(0, 3).map(pref => ({
// // //       key: pref.key,
// // //       label: QUICK_FILTER_LABELS[pref.key] || pref.label,
// // //     }));
// // //   }, [preferenceMaster]);

// // //   const advancedFilterOptions = useMemo(() => {
// // //     return preferenceMaster.filter(pref => {
// // //       if (!pref?.key) return false;
// // //       if (quickFilterOptions.some(q => q.key === pref.key)) return false;
// // //       return ['toggle', 'single_select'].includes(pref.input_type);
// // //     });
// // //   }, [preferenceMaster, quickFilterOptions]);

// // //   const processedRides = useMemo(() => {
// // //     let rides = [...availableRides];

// // //     if (userGender !== 'female') {
// // //       rides = rides.filter(item => {
// // //         const isWomenOnly = item.womenOnly === true;
// // //         if (isWomenOnly) {
// // //           console.log('🚫 Filtering out women-only ride:', item.id);
// // //         }
// // //         return !isWomenOnly;
// // //       });
// // //     }

// // //     if (quickFilters.length > 0) {
// // //       rides = rides.filter(item =>
// // //         quickFilters.every(key => matchesQuickFilter(item, key))
// // //       );
// // //     }

// // //     const activeAdvanced = Object.entries(advancedFilters).filter(
// // //       ([, value]) =>
// // //         value !== '' &&
// // //         value !== null &&
// // //         value !== undefined &&
// // //         value !== false
// // //     );

// // //     if (activeAdvanced.length > 0) {
// // //       rides = rides.filter(item =>
// // //         activeAdvanced.every(([key, value]) =>
// // //           matchesAdvancedFilter(item, key, value)
// // //         )
// // //       );
// // //     }

// // //     rides.sort((a, b) => {
// // //       if (sortBy === 'price') return (a.price || 0) - (b.price || 0);
// // //       if (sortBy === 'rating') return (b.rating || 0) - (a.rating || 0);
// // //       if (sortBy === 'match') return (b.matchPercentage || 0) - (a.matchPercentage || 0);

// // //       const aDate = new Date(`${a.date || ''} ${a.time || ''}`);
// // //       const bDate = new Date(`${b.date || ''} ${b.time || ''}`);
// // //       if (!isNaN(aDate) && !isNaN(bDate)) return aDate - bDate;
// // //       return 0;
// // //     });

// // //     return rides;
// // //   }, [availableRides, quickFilters, advancedFilters, sortBy, userGender]);

// // //   const handleCardPress = (ride) => {
// // //     const pickupAddress = searchData?.fromAddress || ride.from || '';
// // //     const dropoffAddress = searchData?.toAddress || ride.to || '';
// // //     const pickupPlaceName = searchData?.fromPlaceName || ride.pickupLabel || ride.from?.split(',')[0] || '';
// // //     const dropoffPlaceName = searchData?.toPlaceName || ride.dropLabel || ride.to?.split(',')[0] || '';
    
// // //     navigation.navigate('RideDetailScreen', {
// // //       ride: ride,
// // //       searchData: {
// // //         fromCoords: fromCoords,
// // //         toCoords: toCoords,
// // //         fromAddress: pickupAddress,
// // //         toAddress: dropoffAddress,
// // //         fromPlaceName: pickupPlaceName,
// // //         toPlaceName: dropoffPlaceName,
// // //         date: dateTime,
// // //         time: new Date(dateTime).toLocaleTimeString(),
// // //         seats: requestedSeats
// // //       }
// // //     });
// // //   };

// // //   const toggleQuickFilter = (key) => {
// // //     setQuickFilters(prev =>
// // //       prev.includes(key) ? prev.filter(i => i !== key) : [...prev, key]
// // //     );
// // //   };

// // //   const clearAllFilters = () => {
// // //     setQuickFilters([]);
// // //     setAdvancedFilters({});
// // //     showCustomAlert('Filters Cleared', 'All filters have been reset.', 'info');
// // //   };

// // //   const renderAdvancedFilterControl = (pref) => {
// // //     const currentValue = advancedFilters[pref.key];

// // //     if (pref.input_type === 'toggle') {
// // //       const active = !!currentValue;
// // //       return (
// // //         <TouchableOpacity
// // //           activeOpacity={0.85}
// // //           style={[styles.modalToggleChip, active && styles.modalToggleChipActive]}
// // //           onPress={() =>
// // //             setAdvancedFilters(prev => ({ ...prev, [pref.key]: !active }))
// // //           }
// // //         >
// // //           <Text
// // //             style={[
// // //               styles.modalToggleChipText,
// // //               active && styles.modalToggleChipTextActive,
// // //             ]}
// // //           >
// // //             {pref.label}
// // //           </Text>
// // //         </TouchableOpacity>
// // //       );
// // //     }

// // //     if (pref.input_type === 'single_select' && Array.isArray(pref.options)) {
// // //       return (
// // //         <View style={styles.modalOptionWrap}>
// // //           {pref.options.map((opt) => {
// // //             const active = currentValue === opt;
// // //             return (
// // //               <TouchableOpacity
// // //                 key={opt}
// // //                 activeOpacity={0.85}
// // //                 style={[
// // //                   styles.modalOptionChip,
// // //                   active && styles.modalOptionChipActive,
// // //                 ]}
// // //                 onPress={() =>
// // //                   setAdvancedFilters(prev => ({
// // //                     ...prev,
// // //                     [pref.key]: active ? '' : opt,
// // //                   }))
// // //                 }
// // //               >
// // //                 <Text
// // //                   style={[
// // //                     styles.modalOptionChipText,
// // //                     active && styles.modalOptionChipTextActive,
// // //                   ]}
// // //                 >
// // //                   {opt}
// // //                 </Text>
// // //               </TouchableOpacity>
// // //             );
// // //           })}
// // //         </View>
// // //       );
// // //     }

// // //     return null;
// // //   };

// // //   // Active Requests List Modal Component
// // //   const RequestsListModal = () => {
// // //     return (
// // //       <Modal
// // //         visible={showRequestsList}
// // //         transparent={true}
// // //         animationType="slide"
// // //         onRequestClose={() => setShowRequestsList(false)}
// // //       >
// // //         <View style={styles.modalBackdrop}>
// // //           <TouchableOpacity 
// // //             style={styles.modalOverlay} 
// // //             activeOpacity={1} 
// // //             onPress={() => setShowRequestsList(false)} 
// // //           />
          
// // //           <View style={styles.requestsModalSheet}>
// // //             <View style={styles.modalHandle} />
            
// // //             <View style={styles.modalHeader}>
// // //               <Text style={styles.modalTitle}>Your Ride Requests</Text>
// // //               <TouchableOpacity onPress={() => setShowRequestsList(false)}>
// // //                 <Ionicons name="close" size={24} color={Colors.dark} />
// // //               </TouchableOpacity>
// // //             </View>
            
// // //             <ScrollView showsVerticalScrollIndicator={false}>
// // //               {userRideRequests.length === 0 ? (
// // //                 <View style={styles.emptyRequestsContainer}>
// // //                   <Ionicons name="notifications-off-outline" size={50} color={Colors.gray} />
// // //                   <Text style={styles.emptyRequestsText}>No active ride requests</Text>
// // //                   <Text style={styles.emptyRequestsSubtext}>
// // //                     When you request a ride alert, it will appear here
// // //                   </Text>
// // //                 </View>
// // //               ) : (
// // //                 userRideRequests.map((req) => (
// // //                   <View key={req.id} style={styles.requestCard}>
// // //                     <View style={styles.requestCardHeader}>
// // //                       <View style={styles.requestStatusBadge}>
// // //                         <Text style={styles.requestStatusText}>Active</Text>
// // //                       </View>
// // //                       <Text style={styles.requestExpiry}>
// // //                         Expires: {new Date(req.expires_at).toLocaleDateString()}
// // //                       </Text>
// // //                     </View>
                    
// // //                     <View style={styles.requestRoute}>
// // //                       <View style={styles.requestRouteRow}>
// // //                         <View style={[styles.routeDot, { backgroundColor: '#22C55E' }]} />
// // //                         <Text style={styles.requestLocation} numberOfLines={2}>{req.from_location}</Text>
// // //                       </View>
// // //                       <View style={styles.requestRouteRow}>
// // //                         <View style={[styles.routeDot, { backgroundColor: '#F97316' }]} />
// // //                         <Text style={styles.requestLocation} numberOfLines={2}>{req.to_location}</Text>
// // //                       </View>
// // //                     </View>
                    
// // //                     <View style={styles.requestDetails}>
// // //                       <View style={styles.requestDetailItem}>
// // //                         <Ionicons name="calendar-outline" size={14} color={Colors.gray} />
// // //                         <Text style={styles.requestDetailText}>
// // //                           {req.preferred_date ? new Date(req.preferred_date).toLocaleDateString() : 'Any date'}
// // //                         </Text>
// // //                       </View>
// // //                       <View style={styles.requestDetailItem}>
// // //                         <Ionicons name="time-outline" size={14} color={Colors.gray} />
// // //                         <Text style={styles.requestDetailText}>
// // //                           {req.preferred_time || 'Any time'}
// // //                         </Text>
// // //                       </View>
// // //                       <View style={styles.requestDetailItem}>
// // //                         <Ionicons name="people-outline" size={14} color={Colors.gray} />
// // //                         <Text style={styles.requestDetailText}>{req.seats_needed} seat(s)</Text>
// // //                       </View>
// // //                     </View>
                    
// // //                     {req.notes && (
// // //                       <Text style={styles.requestNotes} numberOfLines={2}>
// // //                         📝 {req.notes}
// // //                       </Text>
// // //                     )}
                    
// // //                     {req.notified_at && (
// // //                       <View style={styles.notifiedBadge}>
// // //                         <Ionicons name="mail-outline" size={12} color="#16A34A" />
// // //                         <Text style={styles.notifiedText}>
// // //                           Notified on {new Date(req.notified_at).toLocaleDateString()}
// // //                         </Text>
// // //                       </View>
// // //                     )}
                    
// // //                     <TouchableOpacity 
// // //                       style={styles.cancelRequestButton}
// // //                       onPress={() => cancelRideRequest(req.id)}
// // //                       disabled={cancelRequestLoading}
// // //                     >
// // //                       {cancelRequestLoading ? (
// // //                         <ActivityIndicator size="small" color="#EF4444" />
// // //                       ) : (
// // //                         <Text style={styles.cancelRequestText}>Cancel Request</Text>
// // //                       )}
// // //                     </TouchableOpacity>
// // //                   </View>
// // //                 ))
// // //               )}
// // //             </ScrollView>
// // //           </View>
// // //         </View>
// // //       </Modal>
// // //     );
// // //   };

// // //   // Ride Request Modal Component
// // // // Ride Request Modal Component
// // // const RideRequestModal = () => {
// // //   const userEmail = user?.email || '';
  
// // //   // Add function to reset form
// // //   const resetForm = () => {
// // //     setRideRequestEmail('');
// // //     setRideRequestNotes('');
// // //   };
  
// // //   // Handle close
// // //   const handleClose = () => {
// // //     resetForm();
// // //     setShowRideRequestModal(false);
// // //   };
  
// // //   return (
// // //     <Modal
// // //       visible={showRideRequestModal}
// // //       transparent={true}
// // //       animationType="slide"
// // //       onRequestClose={handleClose}
// // //     >
// // //       <View style={styles.modalBackdrop}>
// // //         <TouchableOpacity 
// // //           style={styles.modalOverlay} 
// // //           activeOpacity={1} 
// // //           onPress={handleClose}
// // //         />
        
// // //         <View style={styles.requestModalSheet}>
// // //           <View style={styles.modalHandle} />
          
// // //           <View style={styles.modalHeader}>
// // //             <Text style={styles.modalTitle}>Request Ride Alert</Text>
// // //             <TouchableOpacity onPress={handleClose}>
// // //               <Ionicons name="close" size={24} color={Colors.dark} />
// // //             </TouchableOpacity>
// // //           </View>
          
// // //           <ScrollView showsVerticalScrollIndicator={false}>
// // //             <View style={styles.requestModalContent}>
// // //               <View style={styles.requestInfoBox}>
// // //                 <Ionicons name="information-circle" size={20} color={Colors.primary} />
// // //                 <Text style={styles.requestInfoText}>
// // //                   No rides found for this route. We'll email you when a ride becomes available.
// // //                 </Text>
// // //               </View>
              
// // //               <View style={styles.requestRouteBox}>
// // //                 <Text style={styles.requestRouteLabel}>Route:</Text>
// // //                 <Text style={styles.requestRouteText}>
// // //                   {from} → {to}
// // //                 </Text>
// // //                 <Text style={styles.requestRouteDetail}>
// // //                   {new Date(dateTime).toLocaleDateString()} at {new Date(dateTime).toLocaleTimeString()}
// // //                 </Text>
// // //                 <Text style={styles.requestRouteDetail}>
// // //                   {requestedSeats} seat{requestedSeats !== 1 ? 's' : ''} needed
// // //                 </Text>
// // //               </View>
              
// // //               <View style={styles.requestInputGroup}>
// // //                 <Text style={styles.requestLabel}>Email Address *</Text>
// // //                 <TextInput
// // //                   style={styles.requestInput}
// // //                   placeholder="Enter your email"
// // //                   value={rideRequestEmail}
// // //                   onChangeText={setRideRequestEmail}
// // //                   keyboardType="email-address"
// // //                   autoCapitalize="none"
// // //                   autoComplete="email"
// // //                 />
// // //                 {userEmail && !rideRequestEmail && (
// // //                   <Text style={styles.requestHelper}>
// // //                     Using your registered email: {userEmail}
// // //                   </Text>
// // //                 )}
// // //                 <Text style={styles.requestHelper}>
// // //                   We'll notify you at this email when rides are posted
// // //                 </Text>
// // //               </View>
              
// // //               <View style={styles.requestInputGroup}>
// // //                 <Text style={styles.requestLabel}>Additional Notes (Optional)</Text>
// // //                 <TextInput
// // //                   style={[styles.requestInput, styles.requestTextArea]}
// // //                   placeholder="Any preferences or special requirements?"
// // //                   value={rideRequestNotes}
// // //                   onChangeText={setRideRequestNotes}
// // //                   multiline
// // //                   numberOfLines={3}
// // //                   textAlignVertical="top"
// // //                 />
// // //               </View>
              
// // //               <View style={styles.requestNoteBox}>
// // //                 <Ionicons name="time-outline" size={16} color={Colors.gray} />
// // //                 <Text style={styles.requestNoteText}>
// // //                   Your request will remain active for 7 days. You can cancel it anytime in your profile.
// // //                 </Text>
// // //               </View>
// // //             </View>
// // //           </ScrollView>
          
// // //           <View style={styles.modalFooter}>
// // //             <TouchableOpacity
// // //               style={styles.modalSecondaryBtn}
// // //               onPress={handleClose}
// // //             >
// // //               <Text style={styles.modalSecondaryBtnText}>Cancel</Text>
// // //             </TouchableOpacity>
            
// // //             <TouchableOpacity
// // //               style={[styles.modalPrimaryBtn, rideRequestLoading && styles.disabledButton]}
// // //               onPress={handleRequestRideAlert}
// // //               disabled={rideRequestLoading}
// // //             >
// // //               {rideRequestLoading ? (
// // //                 <ActivityIndicator size="small" color={Colors.white} />
// // //               ) : (
// // //                 <Text style={styles.modalPrimaryBtnText}>Get Email Alert</Text>
// // //               )}
// // //             </TouchableOpacity>
// // //           </View>
// // //         </View>
// // //       </View>
// // //     </Modal>
// // //   );
// // // };

// // //   const renderRideCard = ({ item }) => {
// // //     let profilePhotoUrl = null;
// // //     let isSvg = false;
    
// // //     if (item.profilePicture) {
// // //       profilePhotoUrl = buildImageUrl(item.profilePicture);
// // //     } else if (item.profilepicture) {
// // //       profilePhotoUrl = buildImageUrl(item.profilepicture);
// // //     } else if (item.profilePhoto) {
// // //       profilePhotoUrl = buildImageUrl(item.profilePhoto);
// // //     } else if (item.driverProfilePicture) {
// // //       profilePhotoUrl = buildImageUrl(item.driverProfilePicture);
// // //     } else if (item.driver?.profile_picture) {
// // //       profilePhotoUrl = buildImageUrl(item.driver.profile_picture);
// // //     } else if (item.user?.profile_picture) {
// // //       profilePhotoUrl = buildImageUrl(item.user.profile_picture);
// // //     }
    
// // //     if (profilePhotoUrl && profilePhotoUrl.toLowerCase().includes('.svg')) {
// // //       isSvg = true;
// // //     }
    
// // //     const driverNameText = item.driverName || item.driver_name || item.driver?.full_name || 'Driver';
// // //     const avatarText = getDriverInitials(driverNameText);

// // //     let vehicleLabel = 'Vehicle details unavailable';
// // //     if (item.vehicle) {
// // //       const vehicleParts = [];
// // //       if (item.vehicle.model) vehicleParts.push(item.vehicle.model);
// // //       if (item.vehicle.color && vehicleParts.length > 0) {
// // //         vehicleLabel = `${vehicleParts.join(' ')} - ${item.vehicle.color}`;
// // //       } else if (item.vehicle.color) {
// // //         vehicleLabel = item.vehicle.color;
// // //       } else if (vehicleParts.length > 0) {
// // //         vehicleLabel = vehicleParts.join(' ');
// // //       }
// // //     } else if (item.vehicleModel) {
// // //       vehicleLabel = item.vehicleModel;
// // //       if (item.vehicleColor) {
// // //         vehicleLabel = `${item.vehicleModel} - ${item.vehicleColor}`;
// // //       }
// // //     }

// // //     const preferenceBadges = extractPreferenceBadges(item);
// // //     const isDriverVerified = item.isVerified;
// // //     const driverRating = item.rating || 0;

// // //     const pickupName = item.pickupLabel || item.from || 'Pickup point';
// // //     const dropName = item.dropLabel || item.to || 'Drop point';
    
// // //     const seatsAvailable = item.seatsAvailable || 0;
// // //     const isSeatsInsufficient = requestedSeats > seatsAvailable && seatsAvailable > 0;
// // //     const isFull = seatsAvailable === 0;
// // //     const canBook = !isFull && seatsAvailable >= requestedSeats;

// // //     return (
// // //       <TouchableOpacity
// // //         style={[styles.rideCard, !canBook && !isFull && styles.rideCardWarning, isFull && styles.rideCardFull]}
// // //         onPress={() => handleCardPress(item)}
// // //         activeOpacity={0.9}
// // //       >
// // //         <View style={styles.cardTopRow}>
// // //           <View style={styles.profileRow}>
// // //             <TouchableOpacity
// // //               onPress={() => handleCardPress(item)}
// // //               activeOpacity={0.8}
// // //             >
// // //               <View style={styles.avatarContainer}>
// // //                 {profilePhotoUrl ? (
// // //                   isSvg ? (
// // //                     <View style={styles.svgContainer}>
// // //                       <SvgCssUri
// // //                         uri={profilePhotoUrl}
// // //                         width="48"
// // //                         height="48"
// // //                       />
// // //                     </View>
// // //                   ) : (
// // //                     <Image
// // //                       source={{ uri: profilePhotoUrl }}
// // //                       style={styles.avatarImage}
// // //                       resizeMode="cover"
// // //                     />
// // //                   )
// // //                 ) : (
// // //                   <View style={styles.initialsContainer}>
// // //                     <Text style={styles.avatarFallback}>{avatarText}</Text>
// // //                   </View>
// // //                 )}
// // //               </View>
// // //             </TouchableOpacity>

// // //             <View style={styles.profileContent}>
// // //               <View style={styles.nameRow}>
// // //                 <Text style={styles.driverName} numberOfLines={1}>
// // //                   {driverNameText}
// // //                 </Text>

// // //                 {isDriverVerified && (
// // //                   <View style={styles.verifiedBadge}>
// // //                     <Ionicons name="checkmark-circle" size={14} color="#16A34A" />
// // //                     <Text style={styles.verifiedText}>Verified</Text>
// // //                   </View>
// // //                 )}

// // //                 {item.womenOnly === true && (
// // //                   <View style={styles.womenOnlyBadge}>
// // //                     <Ionicons name="woman" size={12} color="#E91E63" />
// // //                     <Text style={styles.womenOnlyBadgeText}>Women Only</Text>
// // //                   </View>
// // //                 )}
                
// // //                 {isFull && (
// // //                   <View style={styles.fullBadge}>
// // //                     <Ionicons name="close-circle" size={12} color="#EF4444" />
// // //                     <Text style={styles.fullBadgeText}>Full</Text>
// // //                   </View>
// // //                 )}
// // //               </View>

// // //               <View style={styles.ratingRow}>
// // //                 <RatingStars rating={driverRating} size={12} showLabel={true} />
// // //               </View>
// // //             </View>
// // //           </View>

// // //           <View style={styles.priceMatchWrap}>
// // //             <View style={styles.matchBadge}>
// // //               <Text style={styles.matchText}>{item.matchPercentage || 0}%</Text>
// // //             </View>
// // //             <Text style={styles.priceText}>₹{item.price}</Text>
// // //             <Text style={styles.perSeatText}>per seat</Text>
// // //           </View>
// // //         </View>

// // //         <View style={styles.infoRow}>
// // //           <View style={styles.infoItem}>
// // //             <Ionicons name="calendar-outline" size={13} color={Colors.gray} />
// // //             <Text style={styles.infoText} numberOfLines={1}>{item.date}</Text>
// // //           </View>
// // //           <View style={styles.infoDot} />
// // //           <View style={styles.infoItem}>
// // //             <Ionicons name="time-outline" size={13} color={Colors.gray} />
// // //             <Text style={styles.infoText} numberOfLines={1}>{item.time}</Text>
// // //           </View>
// // //           <View style={styles.infoDot} />
// // //           <View style={styles.infoItem}>
// // //             <Ionicons name="people-outline" size={13} color={Colors.gray} />
// // //             <Text style={[
// // //               styles.infoText, 
// // //               isFull ? styles.fullText : (isSeatsInsufficient && styles.warningText)
// // //             ]} numberOfLines={1}>
// // //               {isFull ? 'Ride Full' : `${seatsAvailable} left`}
// // //             </Text>
// // //           </View>
// // //         </View>

// // //         {isFull && (
// // //           <View style={styles.fullWarningContainer}>
// // //             <Ionicons name="close-circle" size={14} color="#EF4444" />
// // //             <Text style={styles.fullWarningText}>
// // //               This ride is currently full. Check back later or try another ride.
// // //             </Text>
// // //           </View>
// // //         )}

// // //         {!isFull && isSeatsInsufficient && seatsAvailable > 0 && (
// // //           <View style={styles.seatWarningContainer}>
// // //             <Ionicons name="warning" size={14} color="#D97706" />
// // //             <Text style={styles.seatWarningText}>
// // //               Only {seatsAvailable} seat{seatsAvailable !== 1 ? 's' : ''} left. You requested {requestedSeats} seat{requestedSeats !== 1 ? 's' : ''}.
// // //             </Text>
// // //           </View>
// // //         )}

// // //         <View style={styles.divider} />

// // //         <View style={styles.routeBlock}>
// // //           <View style={styles.routeRow}>
// // //             <View style={[styles.routeDot, { backgroundColor: '#22C55E' }]} />
// // //             <View style={styles.routeTextWrap}>
// // //               <Text style={styles.routeLabel}>Pickup</Text>
// // //               <Text style={styles.routeText} numberOfLines={2}>{pickupName}</Text>
// // //             </View>
// // //           </View>
// // //           <View style={styles.routeRow}>
// // //             <View style={[styles.routeDot, { backgroundColor: '#F97316' }]} />
// // //             <View style={styles.routeTextWrap}>
// // //               <Text style={styles.routeLabel}>Drop</Text>
// // //               <Text style={styles.routeText} numberOfLines={2}>{dropName}</Text>
// // //             </View>
// // //           </View>
// // //         </View>

// // //         <View style={styles.vehicleRow}>
// // //           <Ionicons name="car-sport-outline" size={14} color={Colors.gray} />
// // //           <Text style={styles.vehicleText} numberOfLines={1}>{vehicleLabel}</Text>
// // //         </View>

// // //         {preferenceBadges.length > 0 && (
// // //           <ScrollView
// // //             horizontal
// // //             showsHorizontalScrollIndicator={false}
// // //             contentContainerStyle={styles.badgeScroll}
// // //           >
// // //             {preferenceBadges.map((badge, index) => (
// // //               <PreferenceTag key={`${badge}-${index}`} label={badge} />
// // //             ))}
// // //           </ScrollView>
// // //         )}
// // //       </TouchableOpacity>
// // //     );
// // //   };

// // //   if (authLoading || loading) {
// // //     return (
// // //       <View style={styles.loadingContainer}>
// // //         <LottieView
// // //           source={require("../assets/loading.json")}
// // //           autoPlay
// // //           loop
// // //           style={{ width: 300, height: 300 }}
// // //         />
// // //       </View>
// // //     );
// // //   }

// // //   return (
// // //     <SafeAreaView style={styles.container}>
// // //       <StatusBar barStyle="dark-content" backgroundColor={Colors.white} />

// // //       <View style={styles.header}>
// // //         <TouchableOpacity
// // //           style={styles.backButton}
// // //           onPress={() => navigation.goBack()}
// // //         >
// // //           <MaterialIcons name="arrow-back-ios" size={24} color="#ED7117" />
// // //         </TouchableOpacity>

// // //         <Text style={styles.headerTitle}>Available Rides</Text>

// // //         <TouchableOpacity
// // //           style={[
// // //             styles.filterButton,
// // //             headerFiltersVisible && styles.filterButtonActive
// // //           ]}
// // //           onPress={() => setHeaderFiltersVisible(prev => !prev)}
// // //         >
// // //           <Ionicons name="options-outline" size={22} color="#ED7117" />
// // //         </TouchableOpacity>
// // //       </View>

// // //       {/* Debug Status Banner */}
// // //       {lastRequestStatus && (
// // //         <View style={[
// // //           styles.debugBanner,
// // //           lastRequestStatus.success ? styles.debugBannerSuccess : styles.debugBannerError
// // //         ]}>
// // //           <Ionicons 
// // //             name={lastRequestStatus.success ? "checkmark-circle" : "alert-circle"} 
// // //             size={18} 
// // //             color={lastRequestStatus.success ? "#166534" : "#991B1B"} 
// // //           />
// // //           <Text style={[
// // //             styles.debugBannerText,
// // //             lastRequestStatus.success ? styles.debugBannerTextSuccess : styles.debugBannerTextError
// // //           ]}>
// // //             {lastRequestStatus.message}
// // //           </Text>
// // //           <TouchableOpacity onPress={() => setLastRequestStatus(null)}>
// // //             <Ionicons name="close" size={16} color={lastRequestStatus.success ? "#166534" : "#991B1B"} />
// // //           </TouchableOpacity>
// // //         </View>
// // //       )}

// // //       {headerFiltersVisible ? (
// // //         <View style={styles.topControlsWrap}>
// // //           <ScrollView
// // //             horizontal
// // //             showsHorizontalScrollIndicator={false}
// // //             contentContainerStyle={styles.filterScroll}
// // //           >
// // //             {quickFilterOptions.map((filter) => {
// // //               const active = quickFilters.includes(filter.key);
// // //               return (
// // //                 <TouchableOpacity
// // //                   key={filter.key}
// // //                   activeOpacity={0.85}
// // //                   style={[styles.quickChip, active && styles.quickChipActive]}
// // //                   onPress={() => toggleQuickFilter(filter.key)}
// // //                 >
// // //                   <Text
// // //                     style={[
// // //                       styles.quickChipText,
// // //                       active && styles.quickChipTextActive,
// // //                     ]}
// // //                   >
// // //                     {filter.label}
// // //                   </Text>
// // //                 </TouchableOpacity>
// // //               );
// // //             })}

// // //             <TouchableOpacity
// // //               activeOpacity={0.85}
// // //               style={styles.moreFilterChip}
// // //               onPress={() => setFilterModalVisible(true)}
// // //             >
// // //               <Ionicons name="options-outline" size={14} color="#ED7117" />
// // //               <Text style={styles.moreFilterChipText}>More Filters</Text>
// // //             </TouchableOpacity>
// // //           </ScrollView>

// // //           <Text style={styles.sortLabel}>Sort by</Text>

// // //           <ScrollView
// // //             horizontal
// // //             showsHorizontalScrollIndicator={false}
// // //             contentContainerStyle={styles.sortScroll}
// // //           >
// // //             {SORT_OPTIONS.map((option) => {
// // //               const active = sortBy === option.key;
// // //               return (
// // //                 <TouchableOpacity
// // //                   key={option.key}
// // //                   activeOpacity={0.85}
// // //                   style={[styles.sortChip, active && styles.sortChipActive]}
// // //                   onPress={() => setSortBy(option.key)}
// // //                 >
// // //                   <Text
// // //                     style={[
// // //                       styles.sortChipText,
// // //                       active && styles.sortChipTextActive,
// // //                     ]}
// // //                   >
// // //                     {option.label}
// // //                   </Text>
// // //                 </TouchableOpacity>
// // //               );
// // //             })}
// // //           </ScrollView>
// // //         </View>
// // //       ) : null}

// // //       {processedRides.length === 0 ? (
// // //         <ScrollView 
// // //           contentContainerStyle={styles.emptyContainer}
// // //           showsVerticalScrollIndicator={false}
// // //         >
// // //           <Ionicons name="car-outline" size={80} color={Colors.gray} />
// // //           <Text style={styles.emptyTitle}>No Rides Found</Text>
// // //           <Text style={styles.emptySubtitle}>
// // //             {errorMessage
// // //               ? errorMessage
// // //               : 'No rides available for this route at the selected time.'}
// // //           </Text>

// // //           {/* Show active requests count */}
// // //           {userRideRequests.length > 0 && (
// // //             <TouchableOpacity 
// // //               style={styles.viewRequestsButton}
// // //               onPress={() => setShowRequestsList(true)}
// // //             >
// // //               <Ionicons name="list-outline" size={20} color={Colors.primary} />
// // //               <Text style={styles.viewRequestsButtonText}>
// // //                 You have {userRideRequests.length} active request{userRideRequests.length !== 1 ? 's' : ''}
// // //               </Text>
// // //               <Ionicons name="chevron-forward" size={16} color={Colors.primary} />
// // //             </TouchableOpacity>
// // //           )}

// // //           <TouchableOpacity 
// // //             style={styles.requestAlertButton} 
// // //             onPress={() => setShowRideRequestModal(true)}
// // //           >
// // //             <Ionicons name="notifications-outline" size={20} color={Colors.white} />
// // //             <Text style={styles.requestAlertButtonText}>Notify me when a ride is available</Text>
// // //           </TouchableOpacity>

// // //           {quickFilters.length > 0 && (
// // //             <TouchableOpacity style={styles.clearButton} onPress={clearAllFilters}>
// // //               <Text style={styles.clearButtonText}>Clear Filters</Text>
// // //             </TouchableOpacity>
// // //           )}
// // //         </ScrollView>
// // //       ) : (
// // //         <FlatList
// // //           data={processedRides}
// // //           renderItem={renderRideCard}
// // //           keyExtractor={(item) => String(item.id)}
// // //           contentContainerStyle={styles.listContent}
// // //           showsVerticalScrollIndicator={false}
// // //           refreshControl={
// // //             <RefreshControl
// // //               refreshing={refreshing}
// // //               onRefresh={onRefresh}
// // //               colors={[Colors.primary]}
// // //               tintColor={Colors.primary}
// // //             />
// // //           }
// // //           ItemSeparatorComponent={() => <View style={{ height: 12 }} />}
// // //         />
// // //       )}

// // //       <Modal
// // //         visible={filterModalVisible}
// // //         transparent
// // //         animationType="slide"
// // //         onRequestClose={() => setFilterModalVisible(false)}
// // //       >
// // //         <View style={styles.modalBackdrop}>
// // //           <TouchableOpacity
// // //             style={styles.modalOverlay}
// // //             activeOpacity={1}
// // //             onPress={() => setFilterModalVisible(false)}
// // //           />

// // //           <View style={styles.modalSheet}>
// // //             <View style={styles.modalHandle} />

// // //             <View style={styles.modalHeader}>
// // //               <Text style={styles.modalTitle}>More Filters</Text>
// // //               <TouchableOpacity onPress={() => setFilterModalVisible(false)}>
// // //                 <Ionicons name="close" size={24} color={Colors.dark} />
// // //               </TouchableOpacity>
// // //             </View>

// // //             <ScrollView
// // //               showsVerticalScrollIndicator={false}
// // //               contentContainerStyle={styles.modalContent}
// // //             >
// // //               {advancedFilterOptions.map((pref) => (
// // //                 <View key={pref.key} style={styles.modalSection}>
// // //                   <Text style={styles.modalSectionTitle}>{pref.label}</Text>
// // //                   {renderAdvancedFilterControl(pref)}
// // //                 </View>
// // //               ))}
// // //             </ScrollView>

// // //             <View style={styles.modalFooter}>
// // //               <TouchableOpacity
// // //                 style={styles.modalSecondaryBtn}
// // //                 onPress={clearAllFilters}
// // //               >
// // //                 <Text style={styles.modalSecondaryBtnText}>Clear</Text>
// // //               </TouchableOpacity>

// // //               <TouchableOpacity
// // //                 style={styles.modalPrimaryBtn}
// // //                 onPress={() => setFilterModalVisible(false)}
// // //               >
// // //                 <Text style={styles.modalPrimaryBtnText}>Apply Filters</Text>
// // //               </TouchableOpacity>
// // //             </View>
// // //           </View>
// // //         </View>
// // //       </Modal>

// // //       {/* Ride Request Modal */}
// // //       <RideRequestModal />

// // //       {/* Requests List Modal */}
// // //       <RequestsListModal />

// // //       <ProfileImageModal
// // //         visible={selectedProfile.visible}
// // //         imageUrl={selectedProfile.imageUrl}
// // //         driverName={selectedProfile.driverName}
// // //         onClose={() => setSelectedProfile({ visible: false, imageUrl: null, driverName: '' })}
// // //       />

// // //       <CustomAlert
// // //         visible={alertVisible}
// // //         title={alertConfig.title}
// // //         message={alertConfig.message}
// // //         icon={alertConfig.icon}
// // //         iconColor={alertConfig.iconColor}
// // //         buttons={alertConfig.buttons}
// // //         onBackdropPress={() => setAlertVisible(false)}
// // //       />
// // //     </SafeAreaView>
// // //   );
// // // }

// // // const styles = StyleSheet.create({
// // //   container: {
// // //     flex: 1,
// // //     backgroundColor: '#fff',
// // //   },
// // //   header: {
// // //     flexDirection: 'row',
// // //     alignItems: 'center',
// // //     paddingHorizontal: 16,
// // //     paddingVertical: 12,
// // //     borderBottomWidth: 0.5,
// // //     borderBottomColor: '#fff',
// // //     backgroundColor: Colors.white,
// // //   },
// // //   backButton: {
// // //     width: 44,
// // //     height: 44,
// // //     justifyContent: 'center',
// // //   },
// // //   filterButton: {
// // //     width: 44,
// // //     height: 44,
// // //     justifyContent: 'center',
// // //     alignItems: 'center',
// // //     borderRadius: 22,
// // //   },
// // //   filterButtonActive: {
// // //     backgroundColor: '#fff',
// // //   },
// // //   headerTitle: {
// // //     ...Typography.h2,
// // //     fontSize: 28,
// // //     fontWeight: '700',
// // //     color: Colors.primary,
// // //     flex: 1,
// // //     textAlign: 'center',
// // //   },
// // //   topControlsWrap: {
// // //     backgroundColor: Colors.white,
// // //     paddingTop: 10,
// // //     paddingBottom: 12,
// // //     borderBottomWidth: 1,
// // //     borderBottomColor: '#EEF2F7',
// // //   },
// // //   filterScroll: {
// // //     paddingHorizontal: 16,
// // //     gap: 10,
// // //   },
// // //   quickChip: {
// // //     paddingHorizontal: 14,
// // //     paddingVertical: 10,
// // //     borderRadius: 20,
// // //     backgroundColor: '#F3F4F6',
// // //   },
// // //   quickChipActive: {
// // //     backgroundColor: Colors.primary,
// // //   },
// // //   quickChipText: {
// // //     fontSize: 12,
// // //     fontWeight: '600',
// // //     color: Colors.dark,
// // //   },
// // //   quickChipTextActive: {
// // //     color: Colors.white,
// // //   },
// // //   moreFilterChip: {
// // //     flexDirection: 'row',
// // //     alignItems: 'center',
// // //     gap: 6,
// // //     paddingHorizontal: 14,
// // //     paddingVertical: 10,
// // //     borderRadius: 20,
// // //     backgroundColor: '#EEF6FF',
// // //   },
// // //   moreFilterChipText: {
// // //     fontSize: 12,
// // //     fontWeight: '700',
// // //     color: '#ED7117',
// // //   },
// // //   sortLabel: {
// // //     paddingHorizontal: 16,
// // //     marginTop: 12,
// // //     marginBottom: 8,
// // //     fontSize: 12,
// // //     color: Colors.gray,
// // //     fontWeight: '700',
// // //   },
// // //   sortScroll: {
// // //     paddingHorizontal: 16,
// // //     gap: 10,
// // //   },
// // //   sortChip: {
// // //     paddingHorizontal: 14,
// // //     paddingVertical: 8,
// // //     borderRadius: 14,
// // //     backgroundColor: '#F3F4F6',
// // //   },
// // //   sortChipActive: {
// // //     backgroundColor: '#ED7117',
// // //   },
// // //   sortChipText: {
// // //     fontSize: 12,
// // //     color: Colors.dark,
// // //     fontWeight: '600',
// // //   },
// // //   sortChipTextActive: {
// // //     color: Colors.white,
// // //   },
// // //   listContent: {
// // //     padding: 16,
// // //     paddingBottom: 28,
// // //   },
// // //   rideCard: {
// // //     backgroundColor: Colors.white,
// // //     borderRadius: 18,
// // //     padding: 14,
// // //     borderWidth: 1,
// // //     borderColor: '#EEF2F7',
// // //     shadowColor: '#0F172A',
// // //     shadowOffset: { width: 0, height: 6 },
// // //     shadowOpacity: 0.05,
// // //     shadowRadius: 14,
// // //     elevation: 2,
// // //   },
// // //   rideCardWarning: {
// // //     backgroundColor: '#FFFBEB',
// // //     borderColor: '#FDE68A',
// // //   },
// // //   rideCardFull: {
// // //     backgroundColor: '#FEF2F2',
// // //     borderColor: '#FEE2E2',
// // //     opacity: 0.85,
// // //   },
// // //   cardTopRow: {
// // //     flexDirection: 'row',
// // //     justifyContent: 'space-between',
// // //     alignItems: 'flex-start',
// // //   },
// // //   profileRow: {
// // //     flexDirection: 'row',
// // //     flex: 1,
// // //     paddingRight: 10,
// // //   },
// // //   avatarContainer: {
// // //     width: 48,
// // //     height: 48,
// // //     borderRadius: 24,
// // //     backgroundColor: '#E5E7EB',
// // //     alignItems: 'center',
// // //     justifyContent: 'center',
// // //     overflow: 'hidden',
// // //     marginRight: 10,
// // //   },
// // //   avatarImage: {
// // //     width: 48,
// // //     height: 48,
// // //   },
// // //   avatarFallback: {
// // //     fontSize: 14,
// // //     fontWeight: '800',
// // //     color: Colors.gray,
// // //   },
// // //   profileContent: {
// // //     flex: 1,
// // //   },
// // //   nameRow: {
// // //     flexDirection: 'row',
// // //     alignItems: 'center',
// // //     flexWrap: 'wrap',
// // //     gap: 6,
// // //   },
// // //   driverName: {
// // //     fontSize: 15,
// // //     fontWeight: '800',
// // //     color: Colors.dark,
// // //     maxWidth: '100%',
// // //   },
// // //   verifiedBadge: {
// // //     flexDirection: 'row',
// // //     alignItems: 'center',
// // //     gap: 4,
// // //     backgroundColor: '#E8F5E9',
// // //     paddingHorizontal: 6,
// // //     paddingVertical: 2,
// // //     borderRadius: 12,
// // //   },
// // //   verifiedText: {
// // //     fontSize: 10,
// // //     fontWeight: '700',
// // //     color: '#16A34A',
// // //   },
// // //   womenOnlyBadge: {
// // //     flexDirection: 'row',
// // //     alignItems: 'center',
// // //     gap: 4,
// // //     backgroundColor: '#FCE4EC',
// // //     paddingHorizontal: 8,
// // //     paddingVertical: 3,
// // //     borderRadius: 12,
// // //   },
// // //   womenOnlyBadgeText: {
// // //     fontSize: 10,
// // //     color: '#E91E63',
// // //     fontWeight: '700',
// // //   },
// // //   fullBadge: {
// // //     flexDirection: 'row',
// // //     alignItems: 'center',
// // //     gap: 4,
// // //     backgroundColor: '#FEF2F2',
// // //     paddingHorizontal: 8,
// // //     paddingVertical: 3,
// // //     borderRadius: 12,
// // //     borderWidth: 1,
// // //     borderColor: '#FEE2E2',
// // //   },
// // //   fullBadgeText: {
// // //     fontSize: 10,
// // //     color: '#EF4444',
// // //     fontWeight: '700',
// // //   },
// // //   ratingRow: {
// // //     flexDirection: 'row',
// // //     alignItems: 'center',
// // //     marginTop: 4,
// // //   },
// // //   ratingText: {
// // //     fontSize: 11,
// // //     color: Colors.gray,
// // //     fontWeight: '600',
// // //   },
// // //   priceMatchWrap: {
// // //     alignItems: 'flex-end',
// // //   },
// // //   matchBadge: {
// // //     backgroundColor: '#EEF6FF',
// // //     paddingHorizontal: 8,
// // //     paddingVertical: 4,
// // //     borderRadius: 10,
// // //     marginBottom: 6,
// // //   },
// // //   matchText: {
// // //     fontSize: 12,
// // //     fontWeight: '800',
// // //     color: Colors.primary,
// // //   },
// // //   priceText: {
// // //     fontSize: 18,
// // //     fontWeight: '800',
// // //     color: '#ED7117',
// // //     lineHeight: 20,
// // //   },
// // //   perSeatText: {
// // //     fontSize: 10,
// // //     color: Colors.gray,
// // //     fontWeight: '600',
// // //     marginTop: 2,
// // //   },
// // //   infoRow: {
// // //     flexDirection: 'row',
// // //     alignItems: 'center',
// // //     flexWrap: 'wrap',
// // //     marginTop: 12,
// // //     marginBottom: 10,
// // //   },
// // //   infoItem: {
// // //     flexDirection: 'row',
// // //     alignItems: 'center',
// // //     gap: 4,
// // //   },
// // //   infoText: {
// // //     fontSize: 12,
// // //     color: Colors.dark,
// // //     fontWeight: '600',
// // //   },
// // //   warningText: {
// // //     color: '#F59E0B',
// // //   },
// // //   fullText: {
// // //     color: '#EF4444',
// // //   },
// // //   infoDot: {
// // //     width: 4,
// // //     height: 4,
// // //     borderRadius: 2,
// // //     backgroundColor: '#CBD5E1',
// // //     marginHorizontal: 8,
// // //   },
// // //   seatWarningContainer: {
// // //     flexDirection: 'row',
// // //     alignItems: 'center',
// // //     backgroundColor: '#FEF3C7',
// // //     borderRadius: 8,
// // //     padding: 8,
// // //     marginTop: 8,
// // //     marginBottom: 4,
// // //     gap: 6,
// // //   },
// // //   seatWarningText: {
// // //     flex: 1,
// // //     fontSize: 11,
// // //     color: '#D97706',
// // //     fontWeight: '600',
// // //   },
// // //   fullWarningContainer: {
// // //     flexDirection: 'row',
// // //     alignItems: 'center',
// // //     backgroundColor: '#FEF2F2',
// // //     borderRadius: 8,
// // //     padding: 8,
// // //     marginTop: 8,
// // //     marginBottom: 4,
// // //     borderWidth: 1,
// // //     borderColor: '#FEE2E2',
// // //     gap: 6,
// // //   },
// // //   fullWarningText: {
// // //     flex: 1,
// // //     fontSize: 11,
// // //     color: '#EF4444',
// // //     fontWeight: '600',
// // //   },
// // //   divider: {
// // //     height: 1,
// // //     backgroundColor: '#EEF2F7',
// // //     marginBottom: 10,
// // //   },
// // //   routeBlock: {
// // //     gap: 8,
// // //   },
// // //   routeRow: {
// // //     flexDirection: 'row',
// // //     alignItems: 'flex-start',
// // //   },
// // //   routeDot: {
// // //     width: 8,
// // //     height: 8,
// // //     borderRadius: 4,
// // //     marginTop: 5,
// // //     marginRight: 8,
// // //   },
// // //   routeTextWrap: {
// // //     flex: 1,
// // //   },
// // //   routeLabel: {
// // //     fontSize: 11,
// // //     color: Colors.gray,
// // //     fontWeight: '700',
// // //     marginBottom: 2,
// // //   },
// // //   routeText: {
// // //     fontSize: 13,
// // //     color: Colors.dark,
// // //     fontWeight: '600',
// // //     lineHeight: 18,
// // //   },
// // //   vehicleRow: {
// // //     flexDirection: 'row',
// // //     alignItems: 'center',
// // //     gap: 6,
// // //     marginTop: 10,
// // //   },
// // //   vehicleText: {
// // //     fontSize: 12,
// // //     color: Colors.gray,
// // //     fontWeight: '600',
// // //     flex: 1,
// // //   },
// // //   badgeScroll: {
// // //     gap: 8,
// // //     paddingTop: 10,
// // //   },
// // //   prefBadge: {
// // //     paddingHorizontal: 10,
// // //     paddingVertical: 6,
// // //     borderRadius: 12,
// // //     marginRight: 8,
// // //   },
// // //   prefBadgeText: {
// // //     fontSize: 11,
// // //     fontWeight: '700',
// // //   },
// // //   loadingContainer: {
// // //     flex: 1,
// // //     justifyContent: 'center',
// // //     alignItems: 'center',
// // //     backgroundColor: Colors.white,
// // //   },
// // //   emptyContainer: {
// // //     flexGrow: 1,
// // //     justifyContent: 'center',
// // //     alignItems: 'center',
// // //     paddingHorizontal: 40,
// // //     paddingVertical: 40,
// // //   },
// // //   emptyTitle: {
// // //     fontSize: 22,
// // //     fontWeight: '700',
// // //     color: Colors.dark,
// // //     marginTop: 20,
// // //     marginBottom: 8,
// // //   },
// // //   emptySubtitle: {
// // //     fontSize: 15,
// // //     color: Colors.gray,
// // //     textAlign: 'center',
// // //     lineHeight: 22,
// // //     marginBottom: 24,
// // //   },
// // //   viewRequestsButton: {
// // //     flexDirection: 'row',
// // //     alignItems: 'center',
// // //     justifyContent: 'center',
// // //     backgroundColor: '#F3F4F6',
// // //     paddingHorizontal: 20,
// // //     paddingVertical: 12,
// // //     borderRadius: 12,
// // //     marginBottom: 12,
// // //     gap: 8,
// // //     width: '100%',
// // //   },
// // //   viewRequestsButtonText: {
// // //     color: Colors.primary,
// // //     fontSize: 14,
// // //     fontWeight: '600',
// // //     flex: 1,
// // //   },
// // //   requestAlertButton: {
// // //     flexDirection: 'row',
// // //     alignItems: 'center',
// // //     justifyContent: 'center',
// // //     backgroundColor: Colors.primary,
// // //     paddingHorizontal: 20,
// // //     paddingVertical: 14,
// // //     borderRadius: 12,
// // //     marginBottom: 12,
// // //     gap: 8,
// // //     width: '100%',
// // //   },
// // //   requestAlertButtonText: {
// // //     color: Colors.white,
// // //     fontSize: 15,
// // //     fontWeight: '600',
// // //   },
// // //   clearButton: {
// // //     backgroundColor: Colors.primary,
// // //     paddingHorizontal: 24,
// // //     paddingVertical: 12,
// // //     borderRadius: 12,
// // //   },
// // //   clearButtonText: {
// // //     color: Colors.white,
// // //     fontSize: 15,
// // //     fontWeight: '700',
// // //   },
// // //   modalBackdrop: {
// // //     flex: 1,
// // //     backgroundColor: 'rgba(15,23,42,0.28)',
// // //     justifyContent: 'flex-end',
// // //   },
// // //   modalOverlay: {
// // //     flex: 1,
// // //   },
// // //   modalSheet: {
// // //     backgroundColor: Colors.white,
// // //     borderTopLeftRadius: 24,
// // //     borderTopRightRadius: 24,
// // //     maxHeight: '78%',
// // //     paddingTop: 10,
// // //   },
// // //   requestModalSheet: {
// // //     backgroundColor: Colors.white,
// // //     borderTopLeftRadius: 24,
// // //     borderTopRightRadius: 24,
// // //     maxHeight: '80%',
// // //     paddingTop: 10,
// // //   },
// // //   requestsModalSheet: {
// // //     backgroundColor: Colors.white,
// // //     borderTopLeftRadius: 24,
// // //     borderTopRightRadius: 24,
// // //     maxHeight: '80%',
// // //     paddingTop: 10,
// // //   },
// // //   modalHandle: {
// // //     width: 52,
// // //     height: 5,
// // //     borderRadius: 999,
// // //     backgroundColor: '#D1D5DB',
// // //     alignSelf: 'center',
// // //     marginBottom: 14,
// // //   },
// // //   modalHeader: {
// // //     flexDirection: 'row',
// // //     alignItems: 'center',
// // //     justifyContent: 'space-between',
// // //     paddingHorizontal: 18,
// // //     paddingBottom: 10,
// // //   },
// // //   modalTitle: {
// // //     fontSize: 20,
// // //     fontWeight: '800',
// // //     color: Colors.dark,
// // //   },
// // //   modalContent: {
// // //     paddingHorizontal: 18,
// // //     paddingBottom: 20,
// // //   },
// // //   requestModalContent: {
// // //     padding: 20,
// // //   },
// // //   modalSection: {
// // //     marginBottom: 18,
// // //   },
// // //   modalSectionTitle: {
// // //     fontSize: 14,
// // //     fontWeight: '700',
// // //     color: Colors.dark,
// // //     marginBottom: 10,
// // //   },
// // //   modalToggleChip: {
// // //     borderRadius: 14,
// // //     borderWidth: 1,
// // //     borderColor: '#E5E7EB',
// // //     paddingHorizontal: 14,
// // //     paddingVertical: 10,
// // //     alignSelf: 'flex-start',
// // //     backgroundColor: '#F9FAFB',
// // //   },
// // //   modalToggleChipActive: {
// // //     backgroundColor: Colors.primary,
// // //     borderColor: Colors.primary,
// // //   },
// // //   modalToggleChipText: {
// // //     fontSize: 13,
// // //     color: Colors.dark,
// // //     fontWeight: '600',
// // //   },
// // //   modalToggleChipTextActive: {
// // //     color: Colors.white,
// // //   },
// // //   modalOptionWrap: {
// // //     flexDirection: 'row',
// // //     flexWrap: 'wrap',
// // //     gap: 10,
// // //   },
// // //   modalOptionChip: {
// // //     borderRadius: 16,
// // //     borderWidth: 1,
// // //     borderColor: '#E5E7EB',
// // //     paddingHorizontal: 12,
// // //     paddingVertical: 9,
// // //     backgroundColor: '#F9FAFB',
// // //   },
// // //   modalOptionChipActive: {
// // //     backgroundColor: Colors.primary,
// // //     borderColor: Colors.primary,
// // //   },
// // //   modalOptionChipText: {
// // //     fontSize: 13,
// // //     color: Colors.dark,
// // //     fontWeight: '600',
// // //   },
// // //   modalOptionChipTextActive: {
// // //     color: Colors.white,
// // //   },
// // //   modalFooter: {
// // //     flexDirection: 'row',
// // //     paddingHorizontal: 18,
// // //     paddingTop: 12,
// // //     paddingBottom: Platform.OS === 'ios' ? 28 : 18,
// // //     borderTopWidth: 1,
// // //     borderTopColor: '#EEF2F7',
// // //     gap: 12,
// // //   },
// // //   modalSecondaryBtn: {
// // //     flex: 1,
// // //     borderRadius: 14,
// // //     paddingVertical: 14,
// // //     alignItems: 'center',
// // //     backgroundColor: '#F3F4F6',
// // //   },
// // //   modalSecondaryBtnText: {
// // //     fontSize: 15,
// // //     fontWeight: '700',
// // //     color: Colors.dark,
// // //   },
// // //   modalPrimaryBtn: {
// // //     flex: 1,
// // //     borderRadius: 14,
// // //     paddingVertical: 14,
// // //     alignItems: 'center',
// // //     backgroundColor: Colors.primary,
// // //   },
// // //   modalPrimaryBtnText: {
// // //     fontSize: 15,
// // //     fontWeight: '700',
// // //     color: Colors.white,
// // //   },
// // //   requestInfoBox: {
// // //     flexDirection: 'row',
// // //     alignItems: 'center',
// // //     backgroundColor: '#EFF6FF',
// // //     padding: 12,
// // //     borderRadius: 12,
// // //     marginBottom: 16,
// // //     gap: 8,
// // //   },
// // //   requestInfoText: {
// // //     flex: 1,
// // //     fontSize: 13,
// // //     color: '#1E3A8A',
// // //     lineHeight: 18,
// // //   },
// // //   requestRouteBox: {
// // //     backgroundColor: '#F3F4F6',
// // //     padding: 12,
// // //     borderRadius: 12,
// // //     marginBottom: 20,
// // //   },
// // //   requestRouteLabel: {
// // //     fontSize: 12,
// // //     fontWeight: '600',
// // //     color: Colors.gray,
// // //     marginBottom: 4,
// // //   },
// // //   requestRouteText: {
// // //     fontSize: 14,
// // //     fontWeight: '600',
// // //     color: Colors.dark,
// // //     marginBottom: 4,
// // //   },
// // //   requestRouteDetail: {
// // //     fontSize: 12,
// // //     color: Colors.gray,
// // //     marginTop: 2,
// // //   },
// // //   requestInputGroup: {
// // //     marginBottom: 16,
// // //   },
// // //   requestLabel: {
// // //     fontSize: 14,
// // //     fontWeight: '600',
// // //     color: Colors.dark,
// // //     marginBottom: 8,
// // //   },
// // //   requestInput: {
// // //     borderWidth: 1,
// // //     borderColor: '#E5E7EB',
// // //     borderRadius: 12,
// // //     paddingHorizontal: 12,
// // //     paddingVertical: 10,
// // //     fontSize: 14,
// // //     backgroundColor: '#F9FAFB',
// // //   },
// // //   requestTextArea: {
// // //     minHeight: 80,
// // //     textAlignVertical: 'top',
// // //   },
// // //   requestHelper: {
// // //     fontSize: 11,
// // //     color: Colors.gray,
// // //     marginTop: 4,
// // //   },
// // //   requestNoteBox: {
// // //     flexDirection: 'row',
// // //     alignItems: 'center',
// // //     backgroundColor: '#FEF3C7',
// // //     padding: 12,
// // //     borderRadius: 12,
// // //     gap: 8,
// // //   },
// // //   requestNoteText: {
// // //     flex: 1,
// // //     fontSize: 12,
// // //     color: '#D97706',
// // //   },
// // //   disabledButton: {
// // //     opacity: 0.6,
// // //   },
// // //   imageModalContainer: {
// // //     flex: 1,
// // //     justifyContent: 'center',
// // //     alignItems: 'center',
// // //     backgroundColor: 'rgba(0,0,0,0.9)',
// // //   },
// // //   imageModalContent: {
// // //     width: '90%',
// // //     backgroundColor: Colors.white,
// // //     borderRadius: 20,
// // //     overflow: 'hidden',
// // //   },
// // //   imageModalHeader: {
// // //     flexDirection: 'row',
// // //     justifyContent: 'space-between',
// // //     alignItems: 'center',
// // //     padding: 16,
// // //     borderBottomWidth: 1,
// // //     borderBottomColor: '#EEF2F7',
// // //   },
// // //   imageModalTitle: {
// // //     fontSize: 18,
// // //     fontWeight: '700',
// // //     color: Colors.dark,
// // //   },
// // //   fullProfileImage: {
// // //     width: '100%',
// // //     height: 400,
// // //     backgroundColor: '#F5F5F5',
// // //   },
// // //   noImageContainer: {
// // //     width: '100%',
// // //     height: 400,
// // //     justifyContent: 'center',
// // //     alignItems: 'center',
// // //     backgroundColor: '#F5F5F5',
// // //   },
// // //   noImageText: {
// // //     fontSize: 16,
// // //     color: Colors.gray,
// // //   },
// // //   svgContainer: {
// // //     width: 48,
// // //     height: 48,
// // //     alignItems: 'center',
// // //     justifyContent: 'center',
// // //   },
// // //   initialsContainer: {
// // //     width: '100%',
// // //     height: '100%',
// // //     alignItems: 'center',
// // //     justifyContent: 'center',
// // //     backgroundColor: '#E5E7EB',
// // //   },
// // //   modalSvgContainer: {
// // //     width: '100%',
// // //     height: 400,
// // //     backgroundColor: '#F5F5F5',
// // //     alignItems: 'center',
// // //     justifyContent: 'center',
// // //   },
// // //   debugBanner: {
// // //     flexDirection: 'row',
// // //     alignItems: 'center',
// // //     padding: 12,
// // //     marginHorizontal: 16,
// // //     marginTop: 8,
// // //     marginBottom: 8,
// // //     borderRadius: 8,
// // //     gap: 8,
// // //   },
// // //   debugBannerSuccess: {
// // //     backgroundColor: '#DCFCE7',
// // //     borderLeftWidth: 4,
// // //     borderLeftColor: '#22C55E',
// // //   },
// // //   debugBannerError: {
// // //     backgroundColor: '#FEE2E2',
// // //     borderLeftWidth: 4,
// // //     borderLeftColor: '#EF4444',
// // //   },
// // //   debugBannerText: {
// // //     flex: 1,
// // //     fontSize: 12,
// // //     fontWeight: '500',
// // //   },
// // //   debugBannerTextSuccess: {
// // //     color: '#166534',
// // //   },
// // //   debugBannerTextError: {
// // //     color: '#991B1B',
// // //   },
// // //   emptyRequestsContainer: {
// // //     alignItems: 'center',
// // //     padding: 40,
// // //   },
// // //   emptyRequestsText: {
// // //     fontSize: 16,
// // //     fontWeight: '600',
// // //     color: Colors.dark,
// // //     marginTop: 12,
// // //   },
// // //   emptyRequestsSubtext: {
// // //     fontSize: 13,
// // //     color: Colors.gray,
// // //     textAlign: 'center',
// // //     marginTop: 8,
// // //   },
// // //   requestCard: {
// // //     backgroundColor: '#F9FAFB',
// // //     borderRadius: 16,
// // //     padding: 16,
// // //     marginHorizontal: 16,
// // //     marginBottom: 12,
// // //     borderWidth: 1,
// // //     borderColor: '#EEF2F7',
// // //   },
// // //   requestCardHeader: {
// // //     flexDirection: 'row',
// // //     justifyContent: 'space-between',
// // //     alignItems: 'center',
// // //     marginBottom: 12,
// // //   },
// // //   requestStatusBadge: {
// // //     backgroundColor: '#DCFCE7',
// // //     paddingHorizontal: 8,
// // //     paddingVertical: 4,
// // //     borderRadius: 8,
// // //   },
// // //   requestStatusText: {
// // //     fontSize: 11,
// // //     fontWeight: '700',
// // //     color: '#16A34A',
// // //   },
// // //   requestExpiry: {
// // //     fontSize: 11,
// // //     color: Colors.gray,
// // //   },
// // //   requestRoute: {
// // //     marginBottom: 12,
// // //   },
// // //   requestRouteRow: {
// // //     flexDirection: 'row',
// // //     alignItems: 'center',
// // //     marginBottom: 8,
// // //   },
// // //   requestLocation: {
// // //     fontSize: 14,
// // //     fontWeight: '600',
// // //     color: Colors.dark,
// // //     flex: 1,
// // //     marginLeft: 8,
// // //   },
// // //   requestDetails: {
// // //     flexDirection: 'row',
// // //     gap: 16,
// // //     marginBottom: 12,
// // //     paddingTop: 8,
// // //     borderTopWidth: 1,
// // //     borderTopColor: '#EEF2F7',
// // //   },
// // //   requestDetailItem: {
// // //     flexDirection: 'row',
// // //     alignItems: 'center',
// // //     gap: 4,
// // //   },
// // //   requestDetailText: {
// // //     fontSize: 12,
// // //     color: Colors.gray,
// // //   },
// // //   requestNotes: {
// // //     fontSize: 12,
// // //     color: Colors.gray,
// // //     marginBottom: 12,
// // //     padding: 8,
// // //     backgroundColor: '#F3F4F6',
// // //     borderRadius: 8,
// // //   },
// // //   notifiedBadge: {
// // //     flexDirection: 'row',
// // //     alignItems: 'center',
// // //     backgroundColor: '#DCFCE7',
// // //     padding: 6,
// // //     borderRadius: 8,
// // //     marginBottom: 12,
// // //     gap: 4,
// // //   },
// // //   notifiedText: {
// // //     fontSize: 10,
// // //     color: '#16A34A',
// // //     fontWeight: '500',
// // //   },
// // //   cancelRequestButton: {
// // //     paddingVertical: 8,
// // //     alignItems: 'center',
// // //     borderRadius: 8,
// // //     backgroundColor: '#FEF2F2',
// // //     marginTop: 8,
// // //   },
// // //   cancelRequestText: {
// // //     fontSize: 13,
// // //     fontWeight: '600',
// // //     color: '#EF4444',
// // //   },
// // // });
// // import React, { useState, useEffect, useCallback, useMemo } from 'react';
// // import {
// //   View,
// //   Text,
// //   StyleSheet,
// //   TouchableOpacity,
// //   FlatList,
// //   StatusBar,
// //   Platform,
// //   Image,
// //   ScrollView,
// //   Modal,
// //   RefreshControl,
// //   TextInput,
// //   ActivityIndicator,
// // } from 'react-native';
// // import { SafeAreaView } from 'react-native-safe-area-context';
// // import { Ionicons, MaterialIcons } from '@expo/vector-icons';
// // import LottieView from "lottie-react-native";
// // import { Colors, Typography } from '../constants/Colors';
// // import { useAuth } from '../context/AuthContext';
// // import { API_BASE_URL } from '../config/config_ip';
// // import DatabaseService from '../services/matchingpreference_ds';
// // import CustomAlert from '../components/CustomAlert';
// // import { SvgCssUri } from 'react-native-svg/css';
// // import { useFocusEffect } from '@react-navigation/native';

// // const IMAGE_BASE_URL = API_BASE_URL;

// // // Enable fetch logging for debugging
// // const originalFetch = global.fetch;
// // global.fetch = async (...args) => {
// //   const [url, options] = args;
  
// //   // Log outgoing requests for ride-related endpoints
// //   if (typeof url === 'string' && (url.includes('/request-ride-alert') || 
// //       url.includes('/my-ride-requests') || 
// //       url.includes('/search-rides'))) {
// //     console.log(`\n🌐 ========== API REQUEST ==========`);
// //     console.log(`📍 URL: ${url}`);
// //     console.log(`📌 Method: ${options?.method || 'GET'}`);
// //     if (options?.body) {
// //       try {
// //         const body = JSON.parse(options.body);
// //         console.log(`📦 Body:`, JSON.stringify(body, null, 2));
// //       } catch(e) {
// //         console.log(`📦 Body: ${options.body}`);
// //       }
// //     }
// //   }
  
// //   const response = await originalFetch(...args);
  
// //   // Log responses
// //   if (typeof url === 'string' && (url.includes('/request-ride-alert') || 
// //       url.includes('/my-ride-requests') || 
// //       url.includes('/search-rides'))) {
// //     const clonedResponse = response.clone();
// //     const data = await clonedResponse.json();
// //     console.log(`\n📥 RESPONSE:`);
// //     console.log(`   Status: ${response.status}`);
// //     console.log(`   Data:`, JSON.stringify(data, null, 2));
// //     console.log(`====================================\n`);
// //   }
  
// //   return response;
// // };

// // const QUICK_FILTER_KEYS = [
// //   'verified_profiles_only',
// //   'same_gender_after_9pm',
// //   'smoking_policy',
// //   'pets_allowed',
// //   'chat_level',
// //   'luggage_allowance',
// // ];

// // const QUICK_FILTER_LABELS = {
// //   verified_profiles_only: 'Verified Only',
// //   same_gender_after_9pm: 'Same Gender Night',
// //   smoking_policy: 'No Smoking',
// //   pets_allowed: 'Pets',
// //   chat_level: 'Chat Level',
// //   luggage_allowance: 'Luggage',
// // };

// // const SORT_OPTIONS = [
// //   { key: 'time', label: 'Time' },
// //   { key: 'price', label: 'Price' },
// //   { key: 'rating', label: 'Rating' },
// //   { key: 'match', label: 'Match %' },
// // ];

// // function buildImageUrl(url) {
// //   if (!url) return null;
// //   if (url.startsWith('http://') || url.startsWith('https://')) return url;
// //   return `${IMAGE_BASE_URL}${url.startsWith('/') ? '' : '/'}${url}`;
// // }

// // function getDriverInitials(name) {
// //   if (!name) return 'D';
// //   const parts = name.trim().split(' ').filter(Boolean);
// //   if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
// //   return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
// // }

// // function normalizeText(value) {
// //   if (value === undefined || value === null) return '';
// //   return String(value).trim().toLowerCase();
// // }

// // function getRidePreferences(item) {
// //   if (item.preferences) return item.preferences;
// //   if (item.ridePreferences) return item.ridePreferences;
// //   if (item.matchingPreferences) return item.matchingPreferences;
// //   if (item.travel_preferences) return item.travel_preferences;
// //   return {};
// // }

// // function extractPreferenceBadges(item) {
// //   const prefs = getRidePreferences(item);
// //   const badges = [];

// //   if (!prefs || Object.keys(prefs).length === 0) {
// //     return [];
// //   }

// //   Object.entries(prefs).forEach(([key, value]) => {
// //     if (value === null || value === undefined) return;
    
// //     if (typeof value === 'boolean') {
// //       if (value === true) {
// //         if (key === 'verified_profiles_only') {
// //           badges.push('Verified Only');
// //         } else {
// //           const displayKey = key.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
// //           badges.push(displayKey);
// //         }
// //       }
// //     } 
// //     else if (Array.isArray(value)) {
// //       if (value.length > 0) {
// //         value.forEach(v => {
// //           if (v && v.trim()) {
// //             badges.push(v.trim());
// //           }
// //         });
// //       }
// //     }
// //     else if (typeof value === 'string' && value.trim()) {
// //       const lowerValue = value.toLowerCase();
// //       if (!['false', 'no', 'none', 'null', 'undefined', 'no preference'].includes(lowerValue)) {
// //         badges.push(value);
// //       }
// //     }
// //     else if (typeof value === 'number') {
// //       badges.push(String(value));
// //     }
// //   });

// //   return [...new Set(badges)];
// // }

// // async function fetchUserDocuments(phoneNumber) {
// //   try {
// //     const url = `${API_BASE_URL}/api/v1/documents/user/${phoneNumber}`;
// //     const res = await fetch(url, { headers: { Accept: 'application/json' } });
// //     if (!res.ok) return null;
// //     const data = await res.json();
// //     return data;
// //   } catch (e) {
// //     console.log('fetchUserDocuments error:', e);
// //     return null;
// //   }
// // }

// // async function fetchDriverProfile(phoneNumber, userId) {
// //   try {
// //     const params = new URLSearchParams();
// //     if (userId) params.append('user_id', userId);
// //     else if (phoneNumber) params.append('phone_number', phoneNumber);
// //     else return null;
// //     const url = `${API_BASE_URL}/api/v1/users/profile-public?${params.toString()}`;
// //     const res = await fetch(url, { headers: { Accept: 'application/json' } });
// //     if (!res.ok) return null;
// //     const data = await res.json();
// //     return data;
// //   } catch (e) {
// //     console.log('fetchDriverProfile error:', e);
// //     return null;
// //   }
// // }

// // function checkVerifiedDocuments(docs) {
// //   if (!docs || !docs.length) return false;
  
// //   const verified = docs.filter(doc => {
// //     const docType = doc.document_type?.toLowerCase();
// //     const status = doc.status?.toUpperCase();
// //     return status === 'APPROVED' && ['aadhar', 'dl', 'rc'].includes(docType);
// //   });
  
// //   return verified.length > 0;
// // }

// // function RatingStars({ rating, size = 12, showLabel = true }) {
// //   const fullStars = Math.floor(rating);
// //   const hasHalfStar = rating % 1 >= 0.5;
// //   const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);
  
// //   return (
// //     <View style={{ flexDirection: 'row', alignItems: 'center' }}>
// //       {[...Array(fullStars)].map((_, i) => (
// //         <Ionicons key={`full-${i}`} name="star" size={size} color="#F59E0B" />
// //       ))}
// //       {hasHalfStar && (
// //         <Ionicons name="star-half" size={size} color="#F59E0B" />
// //       )}
// //       {[...Array(emptyStars)].map((_, i) => (
// //         <Ionicons key={`empty-${i}`} name="star-outline" size={size} color="#F59E0B" />
// //       ))}
// //       {showLabel && rating > 0 && (
// //         <Text style={[styles.ratingText, { marginLeft: 4 }]}>({rating.toFixed(1)})</Text>
// //       )}
// //       {showLabel && rating === 0 && (
// //         <Text style={[styles.ratingText, { marginLeft: 4 }]}>New</Text>
// //       )}
// //     </View>
// //   );
// // }

// // function matchesQuickFilter(item, key) {
// //   const prefs = getRidePreferences(item);
// //   const value = prefs?.[key];
// //   const normalized = normalizeText(value);

// //   if (key === 'verified_profiles_only') {
// //     return !!item.isVerified;
// //   }

// //   if (typeof value === 'boolean') return value;
// //   if (Array.isArray(value)) return value.length > 0;

// //   if (key === 'smoking_policy') {
// //     return normalized.includes('no');
// //   }

// //   if (key === 'same_gender_after_9pm') {
// //     return normalized === 'true' || normalized === 'yes' || normalized === 'same gender';
// //   }

// //   if (key === 'pets_allowed') {
// //     return normalized === 'true' || normalized === 'yes' || normalized === 'allowed';
// //   }

// //   return !!normalized;
// // }

// // function matchesAdvancedFilter(item, key, expectedValue) {
// //   if (expectedValue === undefined || expectedValue === null || expectedValue === '') {
// //     return true;
// //   }

// //   const prefs = getRidePreferences(item);
// //   const rideValue = prefs?.[key];

// //   if (typeof expectedValue === 'boolean') {
// //     if (key === 'verified_profiles_only') {
// //       return expectedValue ? !!item.isVerified : true;
// //     }
// //     return rideValue === expectedValue || normalizeText(rideValue) === String(expectedValue);
// //   }

// //   if (Array.isArray(rideValue)) {
// //     return rideValue.map(v => normalizeText(v)).includes(normalizeText(expectedValue));
// //   }

// //   return normalizeText(rideValue) === normalizeText(expectedValue);
// // }

// // function ProfileImageModal({ visible, imageUrl, driverName, onClose }) {
// //   const [isSvg, setIsSvg] = useState(false);
  
// //   useEffect(() => {
// //     if (imageUrl) {
// //       setIsSvg(imageUrl.toLowerCase().includes('.svg'));
// //     }
// //   }, [imageUrl]);
  
// //   if (!visible) return null;
  
// //   return (
// //     <Modal
// //       visible={visible}
// //       transparent={true}
// //       animationType="fade"
// //       onRequestClose={onClose}
// //     >
// //       <TouchableOpacity 
// //         style={styles.modalBackdrop}
// //         activeOpacity={1}
// //         onPress={onClose}
// //       >
// //         <View style={styles.imageModalContainer}>
// //           <View style={styles.imageModalContent}>
// //             <View style={styles.imageModalHeader}>
// //               <Text style={styles.imageModalTitle}>{driverName}</Text>
// //               <TouchableOpacity onPress={onClose}>
// //                 <Ionicons name="close" size={24} color={Colors.dark} />
// //               </TouchableOpacity>
// //             </View>
// //             {imageUrl && imageUrl !== 'null' && imageUrl !== 'undefined' ? (
// //               isSvg ? (
// //                 <View style={styles.modalSvgContainer}>
// //                   <SvgCssUri
// //                     uri={imageUrl}
// //                     width="100%"
// //                     height={400}
// //                   />
// //                 </View>
// //               ) : (
// //                 <Image
// //                   source={{ uri: imageUrl }}
// //                   style={styles.fullProfileImage}
// //                   resizeMode="contain"
// //                 />
// //               )
// //             ) : (
// //               <View style={styles.noImageContainer}>
// //                 <Text style={styles.noImageText}>No profile picture available</Text>
// //               </View>
// //             )}
// //           </View>
// //         </View>
// //       </TouchableOpacity>
// //     </Modal>
// //   );
// // }

// // function PreferenceTag({ label }) {
// //   if (!label || label.trim() === '') return null;
  
// //   let tagColor = '#FFF3E8';
// //   let textColor = '#C65D00';
  
// //   const lowerLabel = label.toLowerCase();
  
// //   if (lowerLabel.includes('chatty') || lowerLabel.includes('talkative')) {
// //     tagColor = '#E3F2FD';
// //     textColor = '#1565C0';
// //   } else if (lowerLabel.includes('quiet')) {
// //     tagColor = '#E8F5E9';
// //     textColor = '#2E7D32';
// //   } else if (lowerLabel.includes('english') || lowerLabel.includes('hindi') || lowerLabel.includes('language')) {
// //     tagColor = '#FFF9C4';
// //     textColor = '#F57F17';
// //   } else if (lowerLabel.includes('music') || lowerLabel.includes('songs')) {
// //     tagColor = '#F3E5F5';
// //     textColor = '#6A1B9A';
// //   } else if (lowerLabel.includes('ac')) {
// //     tagColor = '#E3F2FD';
// //     textColor = '#1565C0';
// //   } else if (lowerLabel.includes('pet')) {
// //     tagColor = '#FCE4EC';
// //     textColor = '#C2185B';
// //   } else if (lowerLabel.includes('smoking')) {
// //     tagColor = '#FFEBEE';
// //     textColor = '#C62828';
// //   } else if (lowerLabel.includes('verified')) {
// //     tagColor = '#E8F5E9';
// //     textColor = '#2E7D32';
// //   } else if (lowerLabel.match(/[0-9]/)) {
// //     tagColor = '#E8F5E9';
// //     textColor = '#2E7D32';
// //   }
  
// //   return (
// //     <View style={[styles.prefBadge, { backgroundColor: tagColor }]}>
// //       <Text style={[styles.prefBadgeText, { color: textColor }]}>{label}</Text>
// //     </View>
// //   );
// // }

// // export default function RideNextScreen({ navigation, route }) {
// //   const { user, loading: authLoading } = useAuth();
// //   const { searchData } = route.params || {};
// //   const { from, to, fromCoords, toCoords, dateTime, seats } = searchData || {};

// //   const [availableRides, setAvailableRides] = useState([]);
// //   const [loading, setLoading] = useState(true);
// //   const [refreshing, setRefreshing] = useState(false);
// //   const [errorMessage, setErrorMessage] = useState('');
// //   const [sortBy, setSortBy] = useState('time');
// //   const [quickFilters, setQuickFilters] = useState([]);
// //   const [headerFiltersVisible, setHeaderFiltersVisible] = useState(false);
// //   const [filterModalVisible, setFilterModalVisible] = useState(false);
// //   const [preferenceMaster, setPreferenceMaster] = useState([]);
// //   const [userPreferences, setUserPreferences] = useState({});
// //   const [advancedFilters, setAdvancedFilters] = useState({});
  
// //   // Ride Request Alert States
// //   const [showRideRequestModal, setShowRideRequestModal] = useState(false);
// //   const [rideRequestLoading, setRideRequestLoading] = useState(false);
// //   const [rideRequestEmail, setRideRequestEmail] = useState('');
// //   const [rideRequestNotes, setRideRequestNotes] = useState('');
// //   const [lastRequestStatus, setLastRequestStatus] = useState(null);
  
// //   const [selectedProfile, setSelectedProfile] = useState({
// //     visible: false,
// //     imageUrl: null,
// //     driverName: '',
// //   });

// //   const [alertVisible, setAlertVisible] = useState(false);
// //   const [alertConfig, setAlertConfig] = useState({
// //     title: "",
// //     message: "",
// //     icon: "check-circle",
// //     iconColor: "#10B981",
// //     buttons: []
// //   });

// //   const phoneNumber = user?.phone_number;
// //   const userGender = user?.gender;
// //   const requestedSeats = seats || 1;

// //   const showCustomAlert = (title, message, type = 'success') => {
// //     let icon = "check-circle";
// //     let iconColor = "#10B981";
    
// //     if (type === 'error') {
// //       icon = "error";
// //       iconColor = "#EF4444";
// //     } else if (type === 'warning') {
// //       icon = "warning";
// //       iconColor = "#F59E0B";
// //     } else if (type === 'info') {
// //       icon = "info";
// //       iconColor = Colors.primary;
// //     }
    
// //     setAlertConfig({
// //       title,
// //       message,
// //       icon,
// //       iconColor,
// //       buttons: [{ text: 'OK', onPress: () => setAlertVisible(false) }]
// //     });
// //     setAlertVisible(true);
// //   };

// //   // Debug function to check ride requests
// //   const checkUserRideRequests = useCallback(async () => {
// //     if (!phoneNumber) return;
    
// //     console.log('\n🔍 ========== CHECKING USER RIDE REQUESTS ==========');
// //     console.log(`👤 User: ${user?.full_name || user?.first_name} (${phoneNumber})`);
    
// //     try {
// //       const response = await fetch(`${API_BASE_URL}/my-ride-requests/${phoneNumber}`);
// //       const data = await response.json();
      
// //       if (data.success && data.requests) {
// //         console.log(`📊 Found ${data.requests.length} ride requests:`);
// //         data.requests.forEach((req, index) => {
// //           console.log(`\n   Request ${index + 1} (ID: ${req.id}):`);
// //           console.log(`      From: ${req.from_location.substring(0, 60)}...`);
// //           console.log(`      To: ${req.to_location.substring(0, 60)}...`);
// //           console.log(`      Status: ${req.status}`);
// //           console.log(`      Seats: ${req.seats_needed}`);
// //           console.log(`      Created: ${req.created_at}`);
// //           console.log(`      Expires: ${req.expires_at}`);
// //           if (req.notified_at) {
// //             console.log(`      Notified: ${req.notified_at}`);
// //           }
// //         });
// //       } else {
// //         console.log('📭 No ride requests found');
// //       }
// //     } catch (error) {
// //       console.log('❌ Error checking ride requests:', error);
// //     }
    
// //     console.log('🔍 ================================================\n');
// //   }, [phoneNumber, user]);

// //   // Check if current rides match any requests
// //   const checkMatchingWithCurrentRides = useCallback(async () => {
// //     if (!phoneNumber || availableRides.length === 0) return;
    
// //     console.log('\n🔍 ========== CHECKING MATCHES ==========');
// //     console.log(`📊 Available rides: ${availableRides.length}`);
// //     console.log(`📍 Current search:`);
// //     console.log(`   From: ${from}`);
// //     console.log(`   To: ${to}`);
    
// //     try {
// //       const response = await fetch(`${API_BASE_URL}/my-ride-requests/${phoneNumber}`);
// //       const data = await response.json();
      
// //       if (!data.success || !data.requests) {
// //         console.log('❌ Could not fetch ride requests');
// //         return;
// //       }
      
// //       const activeRequests = data.requests.filter(req => req.status === 'active');
// //       console.log(`\n📋 Active requests: ${activeRequests.length}`);
      
// //       if (activeRequests.length === 0) {
// //         console.log('📭 No active requests to match');
// //         console.log('🔍 ==================================\n');
// //         return;
// //       }
      
// //       // For each active request, check if any ride matches
// //       for (const req of activeRequests) {
// //         console.log(`\n📋 Checking Request ID ${req.id}:`);
// //         console.log(`   Request From: ${req.from_location.substring(0, 50)}...`);
// //         console.log(`   Request To: ${req.to_location.substring(0, 50)}...`);
        
// //         const reqFromKeyword = req.from_location.split(',')[0].toLowerCase().trim();
// //         const reqToKeyword = req.to_location.split(',')[0].toLowerCase().trim();
        
// //         let matched = false;
        
// //         for (const ride of availableRides) {
// //           const rideFromKeyword = ride.from.split(',')[0].toLowerCase().trim();
// //           const rideToKeyword = ride.to.split(',')[0].toLowerCase().trim();
          
// //           const fromMatch = rideFromKeyword === reqFromKeyword || 
// //                            rideFromKeyword.includes(reqFromKeyword) || 
// //                            reqFromKeyword.includes(rideFromKeyword);
// //           const toMatch = rideToKeyword === reqToKeyword || 
// //                          rideToKeyword.includes(reqToKeyword) || 
// //                          reqToKeyword.includes(rideToKeyword);
          
// //           if (fromMatch && toMatch) {
// //             console.log(`\n   ✅ MATCH FOUND!`);
// //             console.log(`      Ride ID: ${ride.id}`);
// //             console.log(`      Ride From: ${ride.from.substring(0, 50)}...`);
// //             console.log(`      Ride To: ${ride.to.substring(0, 50)}...`);
// //             console.log(`      ${rideFromKeyword} → ${reqFromKeyword} (match)`);
// //             console.log(`      ${rideToKeyword} → ${reqToKeyword} (match)`);
// //             matched = true;
// //             break;
// //           }
// //         }
        
// //         if (!matched) {
// //           console.log(`   ❌ No matching ride found for Request ${req.id}`);
// //           console.log(`      Looking for: ${reqFromKeyword} → ${reqToKeyword}`);
// //         }
// //       }
      
// //     } catch (error) {
// //       console.log('❌ Error checking matches:', error);
// //     }
    
// //     console.log('🔍 ==================================\n');
// //   }, [phoneNumber, availableRides, from, to]);

// //   // Handle Ride Request Alert
// //   const handleRequestRideAlert = async () => {
// //     const userEmail = user?.email || '';
    
// //     console.log('\n📧 ========== RIDE REQUEST ALERT ==========');
// //     console.log(`👤 User: ${user?.full_name || user?.first_name} (${phoneNumber})`);
// //     console.log(`📧 User email: ${userEmail}`);
// //     console.log(`📧 Entered email: ${rideRequestEmail}`);
// //     console.log(`📍 From: ${from}`);
// //     console.log(`📍 To: ${to}`);
// //     console.log(`📅 Date/Time: ${dateTime}`);
// //     console.log(`💺 Seats needed: ${requestedSeats}`);
// //     console.log(`📝 Notes: ${rideRequestNotes || '(none)'}`);
    
// //     if (!rideRequestEmail && !userEmail) {
// //       console.log('❌ No email provided');
// //       showCustomAlert('Email Required', 'Please enter your email address to receive notifications.', 'error');
// //       return;
// //     }
    
// //     const emailToUse = rideRequestEmail || userEmail;
    
// //     if (!emailToUse.includes('@')) {
// //       console.log('❌ Invalid email format:', emailToUse);
// //       showCustomAlert('Invalid Email', 'Please enter a valid email address.', 'error');
// //       return;
// //     }
    
// //     setRideRequestLoading(true);
// //     setLastRequestStatus(null);
    
// //     try {
// //       const requestBody = {
// //         from_location: from,
// //         to_location: to,
// //         from_coords: fromCoords,
// //         to_coords: toCoords,
// //         preferred_date: dateTime,
// //         preferred_time: new Date(dateTime).toLocaleTimeString(),
// //         seats_needed: requestedSeats,
// //         passenger_phone: user?.phone_number,
// //         passenger_name: user?.full_name || user?.first_name,
// //         passenger_email: emailToUse,
// //         notes: rideRequestNotes
// //       };
      
// //       console.log('\n📤 Sending request to server:', JSON.stringify(requestBody, null, 2));
      
// //       const response = await fetch(`${API_BASE_URL}/request-ride-alert`, {
// //         method: 'POST',
// //         headers: {
// //           'Content-Type': 'application/json',
// //         },
// //         body: JSON.stringify(requestBody),
// //       });
      
// //       const result = await response.json();
// //       console.log('\n📥 Server response:', JSON.stringify(result, null, 2));
      
// //       if (result.success) {
// //         console.log('✅ Ride request created successfully!');
// //         console.log(`   Request ID: ${result.request_id}`);
// //         console.log(`   Expires at: ${result.expires_at}`);
        
// //         setLastRequestStatus({
// //           success: true,
// //           message: `Request #${result.request_id} created. We'll email you when a ride is available.`
// //         });
        
// //         showCustomAlert(
// //           'Request Submitted! 📧', 
// //           `We'll email you at ${emailToUse} when a ride matching your route is posted.\n\nRequest expires in 7 days.`,
// //           'success'
// //         );
// //         setShowRideRequestModal(false);
// //         setRideRequestEmail('');
// //         setRideRequestNotes('');
        
// //         // Check for immediate matches after creating request
// //         setTimeout(() => {
// //           fetchAvailableRides(true);
// //           checkUserRideRequests();
// //         }, 1000);
        
// //       } else {
// //         console.log('❌ Request failed:', result.message);
// //         setLastRequestStatus({
// //           success: false,
// //           message: result.message || 'Could not create ride request'
// //         });
// //         showCustomAlert('Request Failed', result.message || 'Could not create ride request', 'error');
// //       }
// //     } catch (error) {
// //       console.log('❌ Error creating ride request:', error);
// //       setLastRequestStatus({
// //         success: false,
// //         message: error.message || 'Network error'
// //       });
// //       showCustomAlert('Error', 'Could not create ride request. Please try again.', 'error');
// //     } finally {
// //       setRideRequestLoading(false);
// //       console.log('📧 ========================================\n');
// //     }
// //   };

// //   // Fetch available rides
// //   const fetchAvailableRides = useCallback(async (showRefresh = false) => {
// //     if (!searchData || !fromCoords || !toCoords || !dateTime) {
// //       console.log('⚠️ Missing search data, skipping fetch');
// //       setAvailableRides([]);
// //       setLoading(false);
// //       return;
// //     }

// //     console.log('\n🚗 ========== FETCHING RIDES ==========');
// //     console.log(`📍 From: ${from}`);
// //     console.log(`📍 To: ${to}`);
// //     console.log(`📅 Time: ${dateTime}`);
// //     console.log(`💺 Seats: ${requestedSeats}`);

// //     try {
// //       if (showRefresh) {
// //         setRefreshing(true);
// //       } else {
// //         setLoading(true);
// //       }
// //       setErrorMessage('');

// //       const requestBody = {
// //         from_location: from,
// //         to_location: to,
// //         from_coords: fromCoords,
// //         to_coords: toCoords,
// //         departure_time: new Date(dateTime).toISOString(),
// //         seats_required: requestedSeats,
// //         passenger_gender: userGender,
// //       };
      
// //       console.log('📤 Search request:', JSON.stringify(requestBody, null, 2));

// //       const response = await fetch(`${API_BASE_URL}/search-rides`, {
// //         method: 'POST',
// //         headers: {
// //           'Content-Type': 'application/json',
// //         },
// //         body: JSON.stringify(requestBody),
// //       });

// //       const rawText = await response.text();
// //       let parsedData = null;

// //       try {
// //         parsedData = rawText ? JSON.parse(rawText) : {};
// //       } catch (parseError) {
// //         parsedData = { detail: rawText || 'Unexpected server response' };
// //       }

// //       if (!response.ok) {
// //         throw new Error(parsedData?.detail || 'Failed to fetch rides');
// //       }

// //       const rides = Array.isArray(parsedData?.rides) ? parsedData.rides : [];
      
// //       console.log(`📱 Found ${rides.length} rides`);
      
// //       const ridesWithDetails = await Promise.all(
// //         rides.map(async (ride) => {
// //           let isVerified = false;
// //           let avgRating = ride.rating || 0;
// //           let profilePictureUrl = null;
          
// //           const driverPhone = ride.phoneNumber;
// //           const driverUserId = ride.driverUserId;
          
// //           if (driverPhone || driverUserId) {
// //             if (driverPhone) {
// //               const docsData = await fetchUserDocuments(driverPhone);
// //               if (docsData?.success && docsData.documents) {
// //                 isVerified = checkVerifiedDocuments(docsData.documents);
// //               }
// //             }
            
// //             const profileData = await fetchDriverProfile(driverPhone, driverUserId);
            
// //             if (profileData?.success && profileData.user) {
// //               avgRating = profileData.user.avg_rating || 0;
              
// //               const possiblePictureFields = ['profile_picture', 'profilePicture', 'profilePhoto', 'profile_image', 'avatar'];
// //               for (const field of possiblePictureFields) {
// //                 if (profileData.user[field]) {
// //                   profilePictureUrl = profileData.user[field];
// //                   break;
// //                 }
// //               }
              
// //               if (!profilePictureUrl && profileData.user.profile && profileData.user.profile.picture) {
// //                 profilePictureUrl = profileData.user.profile.picture;
// //               }
// //             }
// //           }
          
// //           if (!profilePictureUrl) {
// //             if (ride.profilePicture) profilePictureUrl = ride.profilePicture;
// //             else if (ride.profilepicture) profilePictureUrl = ride.profilepicture;
// //             else if (ride.profilePhoto) profilePictureUrl = ride.profilePhoto;
// //             else if (ride.driverProfilePicture) profilePictureUrl = ride.driverProfilePicture;
// //           }
          
// //           let finalProfilePicture = null;
// //           if (profilePictureUrl) {
// //             finalProfilePicture = buildImageUrl(profilePictureUrl);
// //           }
          
// //           let availableSeats = ride.seatsAvailable || ride.available_seats || 0;
          
// //           return { 
// //             ...ride, 
// //             isVerified, 
// //             rating: avgRating,
// //             profilePicture: finalProfilePicture,
// //             profilepicture: finalProfilePicture,
// //             profilePhoto: finalProfilePicture,
// //             pickupLabel: ride.pickupLabel || ride.pickupLocationName || ride.fromLocationName || ride.from || 'Pickup point',
// //             dropLabel: ride.dropLabel || ride.dropLocationName || ride.toLocationName || ride.to || 'Drop point',
// //             womenOnly: ride.womenOnly === true || ride.women_only === true,
// //             seatsAvailable: availableSeats,
// //             requestedSeats: requestedSeats,
// //             isFull: availableSeats === 0,
// //           };
// //         })
// //       );
      
// //       setAvailableRides(ridesWithDetails);
// //       console.log(`✅ Loaded ${ridesWithDetails.length} rides with details`);
      
// //       // After loading rides, check for matches
// //       setTimeout(() => {
// //         checkMatchingWithCurrentRides();
// //       }, 500);
      
// //     } catch (error) {
// //       console.log('❌ search-rides error:', error);
// //       setAvailableRides([]);
// //       setErrorMessage(error.message || 'Failed to search rides');
// //       showCustomAlert('Search Error', error.message || 'Failed to search rides', 'error');
// //     } finally {
// //       setLoading(false);
// //       setRefreshing(false);
// //       console.log('🚗 ==================================\n');
// //     }
// //   }, [searchData, from, to, fromCoords, toCoords, dateTime, requestedSeats, userGender, checkMatchingWithCurrentRides]);

// //   const loadPreferenceData = useCallback(async () => {
// //     try {
// //       const defs = await DatabaseService.getMatchingPreferenceMaster();
// //       setPreferenceMaster(defs || []);

// //       if (phoneNumber) {
// //         const saved = await DatabaseService.getUserMatchingPreferences(phoneNumber);
// //         setUserPreferences(saved || {});
// //       }
// //     } catch (e) {
// //       console.log('❌ preference load error:', e);
// //     }
// //   }, [phoneNumber]);

// //   // Initial load
// //   useEffect(() => {
// //     if (authLoading) return;
// //     console.log('\n🚀 Component mounted, loading data...');
// //     fetchAvailableRides();
// //     loadPreferenceData();
// //     checkUserRideRequests();
// //   }, [authLoading, fetchAvailableRides, loadPreferenceData, checkUserRideRequests]);

// //   // Manual refresh
// //   const onRefresh = useCallback(() => {
// //     console.log('🔄 Manual refresh triggered');
// //     fetchAvailableRides(true);
// //     checkUserRideRequests();
// //   }, [fetchAvailableRides, checkUserRideRequests]);

// //   const quickFilterOptions = useMemo(() => {
// //     const defs = preferenceMaster.filter(pref => QUICK_FILTER_KEYS.includes(pref.key));
// //     return defs.slice(0, 3).map(pref => ({
// //       key: pref.key,
// //       label: QUICK_FILTER_LABELS[pref.key] || pref.label,
// //     }));
// //   }, [preferenceMaster]);

// //   const advancedFilterOptions = useMemo(() => {
// //     return preferenceMaster.filter(pref => {
// //       if (!pref?.key) return false;
// //       if (quickFilterOptions.some(q => q.key === pref.key)) return false;
// //       return ['toggle', 'single_select'].includes(pref.input_type);
// //     });
// //   }, [preferenceMaster, quickFilterOptions]);

// //   const processedRides = useMemo(() => {
// //     let rides = [...availableRides];

// //     if (userGender !== 'female') {
// //       rides = rides.filter(item => {
// //         const isWomenOnly = item.womenOnly === true;
// //         if (isWomenOnly) {
// //           console.log('🚫 Filtering out women-only ride:', item.id);
// //         }
// //         return !isWomenOnly;
// //       });
// //     }

// //     if (quickFilters.length > 0) {
// //       rides = rides.filter(item =>
// //         quickFilters.every(key => matchesQuickFilter(item, key))
// //       );
// //     }

// //     const activeAdvanced = Object.entries(advancedFilters).filter(
// //       ([, value]) =>
// //         value !== '' &&
// //         value !== null &&
// //         value !== undefined &&
// //         value !== false
// //     );

// //     if (activeAdvanced.length > 0) {
// //       rides = rides.filter(item =>
// //         activeAdvanced.every(([key, value]) =>
// //           matchesAdvancedFilter(item, key, value)
// //         )
// //       );
// //     }

// //     rides.sort((a, b) => {
// //       if (sortBy === 'price') return (a.price || 0) - (b.price || 0);
// //       if (sortBy === 'rating') return (b.rating || 0) - (a.rating || 0);
// //       if (sortBy === 'match') return (b.matchPercentage || 0) - (a.matchPercentage || 0);

// //       const aDate = new Date(`${a.date || ''} ${a.time || ''}`);
// //       const bDate = new Date(`${b.date || ''} ${b.time || ''}`);
// //       if (!isNaN(aDate) && !isNaN(bDate)) return aDate - bDate;
// //       return 0;
// //     });

// //     return rides;
// //   }, [availableRides, quickFilters, advancedFilters, sortBy, userGender]);

// //   const handleCardPress = (ride) => {
// //     const pickupAddress = searchData?.fromAddress || ride.from || '';
// //     const dropoffAddress = searchData?.toAddress || ride.to || '';
// //     const pickupPlaceName = searchData?.fromPlaceName || ride.pickupLabel || ride.from?.split(',')[0] || '';
// //     const dropoffPlaceName = searchData?.toPlaceName || ride.dropLabel || ride.to?.split(',')[0] || '';
    
// //     navigation.navigate('RideDetailScreen', {
// //       ride: ride,
// //       searchData: {
// //         fromCoords: fromCoords,
// //         toCoords: toCoords,
// //         fromAddress: pickupAddress,
// //         toAddress: dropoffAddress,
// //         fromPlaceName: pickupPlaceName,
// //         toPlaceName: dropoffPlaceName,
// //         date: dateTime,
// //         time: new Date(dateTime).toLocaleTimeString(),
// //         seats: requestedSeats
// //       }
// //     });
// //   };

// //   const toggleQuickFilter = (key) => {
// //     setQuickFilters(prev =>
// //       prev.includes(key) ? prev.filter(i => i !== key) : [...prev, key]
// //     );
// //   };

// //   const clearAllFilters = () => {
// //     setQuickFilters([]);
// //     setAdvancedFilters({});
// //     showCustomAlert('Filters Cleared', 'All filters have been reset.', 'info');
// //   };

// //   const renderAdvancedFilterControl = (pref) => {
// //     const currentValue = advancedFilters[pref.key];

// //     if (pref.input_type === 'toggle') {
// //       const active = !!currentValue;
// //       return (
// //         <TouchableOpacity
// //           activeOpacity={0.85}
// //           style={[styles.modalToggleChip, active && styles.modalToggleChipActive]}
// //           onPress={() =>
// //             setAdvancedFilters(prev => ({ ...prev, [pref.key]: !active }))
// //           }
// //         >
// //           <Text
// //             style={[
// //               styles.modalToggleChipText,
// //               active && styles.modalToggleChipTextActive,
// //             ]}
// //           >
// //             {pref.label}
// //           </Text>
// //         </TouchableOpacity>
// //       );
// //     }

// //     if (pref.input_type === 'single_select' && Array.isArray(pref.options)) {
// //       return (
// //         <View style={styles.modalOptionWrap}>
// //           {pref.options.map((opt) => {
// //             const active = currentValue === opt;
// //             return (
// //               <TouchableOpacity
// //                 key={opt}
// //                 activeOpacity={0.85}
// //                 style={[
// //                   styles.modalOptionChip,
// //                   active && styles.modalOptionChipActive,
// //                 ]}
// //                 onPress={() =>
// //                   setAdvancedFilters(prev => ({
// //                     ...prev,
// //                     [pref.key]: active ? '' : opt,
// //                   }))
// //                 }
// //               >
// //                 <Text
// //                   style={[
// //                     styles.modalOptionChipText,
// //                     active && styles.modalOptionChipTextActive,
// //                   ]}
// //                 >
// //                   {opt}
// //                 </Text>
// //               </TouchableOpacity>
// //             );
// //           })}
// //         </View>
// //       );
// //     }

// //     return null;
// //   };

// //   // Ride Request Modal Component
// //   const RideRequestModal = () => {
// //     const userEmail = user?.email || '';
    
// //     return (
// //       <Modal
// //         visible={showRideRequestModal}
// //         transparent={true}
// //         animationType="slide"
// //         onRequestClose={() => setShowRideRequestModal(false)}
// //       >
// //         <View style={styles.modalBackdrop}>
// //           <TouchableOpacity 
// //             style={styles.modalOverlay} 
// //             activeOpacity={1} 
// //             onPress={() => setShowRideRequestModal(false)} 
// //           />
          
// //           <View style={styles.requestModalSheet}>
// //             <View style={styles.modalHandle} />
            
// //             <View style={styles.modalHeader}>
// //               <Text style={styles.modalTitle}>Request Ride Alert</Text>
// //               <TouchableOpacity onPress={() => setShowRideRequestModal(false)}>
// //                 <Ionicons name="close" size={24} color={Colors.dark} />
// //               </TouchableOpacity>
// //             </View>
            
// //             <ScrollView showsVerticalScrollIndicator={false}>
// //               <View style={styles.requestModalContent}>
// //                 <View style={styles.requestInfoBox}>
// //                   <Ionicons name="information-circle" size={20} color={Colors.primary} />
// //                   <Text style={styles.requestInfoText}>
// //                     No rides found for this route. We'll email you when a ride becomes available.
// //                   </Text>
// //                 </View>
                
// //                 <View style={styles.requestRouteBox}>
// //                   <Text style={styles.requestRouteLabel}>Route:</Text>
// //                   <Text style={styles.requestRouteText}>
// //                     {from} → {to}
// //                   </Text>
// //                   <Text style={styles.requestRouteDetail}>
// //                     {new Date(dateTime).toLocaleDateString()} at {new Date(dateTime).toLocaleTimeString()}
// //                   </Text>
// //                   <Text style={styles.requestRouteDetail}>
// //                     {requestedSeats} seat{requestedSeats !== 1 ? 's' : ''} needed
// //                   </Text>
// //                 </View>
                
// //                 <View style={styles.requestInputGroup}>
// //                   <Text style={styles.requestLabel}>Email Address *</Text>
// //                   <TextInput
// //                     style={styles.requestInput}
// //                     placeholder="Enter your email"
// //                     value={rideRequestEmail}
// //                     onChangeText={setRideRequestEmail}
// //                     keyboardType="email-address"
// //                     autoCapitalize="none"
// //                     autoComplete="email"
// //                   />
// //                   {userEmail && !rideRequestEmail && (
// //                     <Text style={styles.requestHelper}>
// //                       Using your registered email: {userEmail}
// //                     </Text>
// //                   )}
// //                   <Text style={styles.requestHelper}>
// //                     We'll notify you at this email when rides are posted
// //                   </Text>
// //                 </View>
                
// //                 <View style={styles.requestInputGroup}>
// //                   <Text style={styles.requestLabel}>Additional Notes (Optional)</Text>
// //                   <TextInput
// //                     style={[styles.requestInput, styles.requestTextArea]}
// //                     placeholder="Any preferences or special requirements?"
// //                     value={rideRequestNotes}
// //                     onChangeText={setRideRequestNotes}
// //                     multiline
// //                     numberOfLines={3}
// //                     textAlignVertical="top"
// //                   />
// //                 </View>
                
// //                 <View style={styles.requestNoteBox}>
// //                   <Ionicons name="time-outline" size={16} color={Colors.gray} />
// //                   <Text style={styles.requestNoteText}>
// //                     Your request will remain active for 7 days. You can cancel it anytime in your profile.
// //                   </Text>
// //                 </View>
// //               </View>
// //             </ScrollView>
            
// //             <View style={styles.modalFooter}>
// //               <TouchableOpacity
// //                 style={styles.modalSecondaryBtn}
// //                 onPress={() => setShowRideRequestModal(false)}
// //               >
// //                 <Text style={styles.modalSecondaryBtnText}>Cancel</Text>
// //               </TouchableOpacity>
              
// //               <TouchableOpacity
// //                 style={[styles.modalPrimaryBtn, rideRequestLoading && styles.disabledButton]}
// //                 onPress={handleRequestRideAlert}
// //                 disabled={rideRequestLoading}
// //               >
// //                 {rideRequestLoading ? (
// //                   <ActivityIndicator size="small" color={Colors.white} />
// //                 ) : (
// //                   <Text style={styles.modalPrimaryBtnText}>Get Email Alert</Text>
// //                 )}
// //               </TouchableOpacity>
// //             </View>
// //           </View>
// //         </View>
// //       </Modal>
// //     );
// //   };

// //   const renderRideCard = ({ item }) => {
// //     let profilePhotoUrl = null;
// //     let isSvg = false;
    
// //     if (item.profilePicture) {
// //       profilePhotoUrl = buildImageUrl(item.profilePicture);
// //     } else if (item.profilepicture) {
// //       profilePhotoUrl = buildImageUrl(item.profilepicture);
// //     } else if (item.profilePhoto) {
// //       profilePhotoUrl = buildImageUrl(item.profilePhoto);
// //     } else if (item.driverProfilePicture) {
// //       profilePhotoUrl = buildImageUrl(item.driverProfilePicture);
// //     } else if (item.driver?.profile_picture) {
// //       profilePhotoUrl = buildImageUrl(item.driver.profile_picture);
// //     } else if (item.user?.profile_picture) {
// //       profilePhotoUrl = buildImageUrl(item.user.profile_picture);
// //     }
    
// //     if (profilePhotoUrl && profilePhotoUrl.toLowerCase().includes('.svg')) {
// //       isSvg = true;
// //     }
    
// //     const driverNameText = item.driverName || item.driver_name || item.driver?.full_name || 'Driver';
// //     const avatarText = getDriverInitials(driverNameText);

// //     let vehicleLabel = 'Vehicle details unavailable';
// //     if (item.vehicle) {
// //       const vehicleParts = [];
// //       if (item.vehicle.model) vehicleParts.push(item.vehicle.model);
// //       if (item.vehicle.color && vehicleParts.length > 0) {
// //         vehicleLabel = `${vehicleParts.join(' ')} - ${item.vehicle.color}`;
// //       } else if (item.vehicle.color) {
// //         vehicleLabel = item.vehicle.color;
// //       } else if (vehicleParts.length > 0) {
// //         vehicleLabel = vehicleParts.join(' ');
// //       }
// //     } else if (item.vehicleModel) {
// //       vehicleLabel = item.vehicleModel;
// //       if (item.vehicleColor) {
// //         vehicleLabel = `${item.vehicleModel} - ${item.vehicleColor}`;
// //       }
// //     }

// //     const preferenceBadges = extractPreferenceBadges(item);
// //     const isDriverVerified = item.isVerified;
// //     const driverRating = item.rating || 0;

// //     const pickupName = item.pickupLabel || item.from || 'Pickup point';
// //     const dropName = item.dropLabel || item.to || 'Drop point';
    
// //     const seatsAvailable = item.seatsAvailable || 0;
// //     const isSeatsInsufficient = requestedSeats > seatsAvailable && seatsAvailable > 0;
// //     const isFull = seatsAvailable === 0;
// //     const canBook = !isFull && seatsAvailable >= requestedSeats;

// //     return (
// //       <TouchableOpacity
// //         style={[styles.rideCard, !canBook && !isFull && styles.rideCardWarning, isFull && styles.rideCardFull]}
// //         onPress={() => handleCardPress(item)}
// //         activeOpacity={0.9}
// //       >
// //         <View style={styles.cardTopRow}>
// //           <View style={styles.profileRow}>
// //             <TouchableOpacity
// //               onPress={() => handleCardPress(item)}
// //               activeOpacity={0.8}
// //             >
// //               <View style={styles.avatarContainer}>
// //                 {profilePhotoUrl ? (
// //                   isSvg ? (
// //                     <View style={styles.svgContainer}>
// //                       <SvgCssUri
// //                         uri={profilePhotoUrl}
// //                         width="48"
// //                         height="48"
// //                       />
// //                     </View>
// //                   ) : (
// //                     <Image
// //                       source={{ uri: profilePhotoUrl }}
// //                       style={styles.avatarImage}
// //                       resizeMode="cover"
// //                     />
// //                   )
// //                 ) : (
// //                   <View style={styles.initialsContainer}>
// //                     <Text style={styles.avatarFallback}>{avatarText}</Text>
// //                   </View>
// //                 )}
// //               </View>
// //             </TouchableOpacity>

// //             <View style={styles.profileContent}>
// //               <View style={styles.nameRow}>
// //                 <Text style={styles.driverName} numberOfLines={1}>
// //                   {driverNameText}
// //                 </Text>

// //                 {isDriverVerified && (
// //                   <View style={styles.verifiedBadge}>
// //                     <Ionicons name="checkmark-circle" size={14} color="#16A34A" />
// //                     <Text style={styles.verifiedText}>Verified</Text>
// //                   </View>
// //                 )}

// //                 {item.womenOnly === true && (
// //                   <View style={styles.womenOnlyBadge}>
// //                     <Ionicons name="woman" size={12} color="#E91E63" />
// //                     <Text style={styles.womenOnlyBadgeText}>Women Only</Text>
// //                   </View>
// //                 )}
                
// //                 {isFull && (
// //                   <View style={styles.fullBadge}>
// //                     <Ionicons name="close-circle" size={12} color="#EF4444" />
// //                     <Text style={styles.fullBadgeText}>Full</Text>
// //                   </View>
// //                 )}
// //               </View>

// //               <View style={styles.ratingRow}>
// //                 <RatingStars rating={driverRating} size={12} showLabel={true} />
// //               </View>
// //             </View>
// //           </View>

// //           <View style={styles.priceMatchWrap}>
// //             <View style={styles.matchBadge}>
// //               <Text style={styles.matchText}>{item.matchPercentage || 0}%</Text>
// //             </View>
// //             <Text style={styles.priceText}>₹{item.price}</Text>
// //             <Text style={styles.perSeatText}>per seat</Text>
// //           </View>
// //         </View>

// //         <View style={styles.infoRow}>
// //           <View style={styles.infoItem}>
// //             <Ionicons name="calendar-outline" size={13} color={Colors.gray} />
// //             <Text style={styles.infoText} numberOfLines={1}>{item.date}</Text>
// //           </View>
// //           <View style={styles.infoDot} />
// //           <View style={styles.infoItem}>
// //             <Ionicons name="time-outline" size={13} color={Colors.gray} />
// //             <Text style={styles.infoText} numberOfLines={1}>{item.time}</Text>
// //           </View>
// //           <View style={styles.infoDot} />
// //           <View style={styles.infoItem}>
// //             <Ionicons name="people-outline" size={13} color={Colors.gray} />
// //             <Text style={[
// //               styles.infoText, 
// //               isFull ? styles.fullText : (isSeatsInsufficient && styles.warningText)
// //             ]} numberOfLines={1}>
// //               {isFull ? 'Ride Full' : `${seatsAvailable} left`}
// //             </Text>
// //           </View>
// //         </View>

// //         {isFull && (
// //           <View style={styles.fullWarningContainer}>
// //             <Ionicons name="close-circle" size={14} color="#EF4444" />
// //             <Text style={styles.fullWarningText}>
// //               This ride is currently full. Check back later or try another ride.
// //             </Text>
// //           </View>
// //         )}

// //         {!isFull && isSeatsInsufficient && seatsAvailable > 0 && (
// //           <View style={styles.seatWarningContainer}>
// //             <Ionicons name="warning" size={14} color="#D97706" />
// //             <Text style={styles.seatWarningText}>
// //               Only {seatsAvailable} seat{seatsAvailable !== 1 ? 's' : ''} left. You requested {requestedSeats} seat{requestedSeats !== 1 ? 's' : ''}.
// //             </Text>
// //           </View>
// //         )}

// //         <View style={styles.divider} />

// //         <View style={styles.routeBlock}>
// //           <View style={styles.routeRow}>
// //             <View style={[styles.routeDot, { backgroundColor: '#22C55E' }]} />
// //             <View style={styles.routeTextWrap}>
// //               <Text style={styles.routeLabel}>Pickup</Text>
// //               <Text style={styles.routeText} numberOfLines={2}>{pickupName}</Text>
// //             </View>
// //           </View>
// //           <View style={styles.routeRow}>
// //             <View style={[styles.routeDot, { backgroundColor: '#F97316' }]} />
// //             <View style={styles.routeTextWrap}>
// //               <Text style={styles.routeLabel}>Drop</Text>
// //               <Text style={styles.routeText} numberOfLines={2}>{dropName}</Text>
// //             </View>
// //           </View>
// //         </View>

// //         <View style={styles.vehicleRow}>
// //           <Ionicons name="car-sport-outline" size={14} color={Colors.gray} />
// //           <Text style={styles.vehicleText} numberOfLines={1}>{vehicleLabel}</Text>
// //         </View>

// //         {preferenceBadges.length > 0 && (
// //           <ScrollView
// //             horizontal
// //             showsHorizontalScrollIndicator={false}
// //             contentContainerStyle={styles.badgeScroll}
// //           >
// //             {preferenceBadges.map((badge, index) => (
// //               <PreferenceTag key={`${badge}-${index}`} label={badge} />
// //             ))}
// //           </ScrollView>
// //         )}
// //       </TouchableOpacity>
// //     );
// //   };

// //   if (authLoading || loading) {
// //     return (
// //       <View style={styles.loadingContainer}>
// //         <LottieView
// //           source={require("../assets/loading.json")}
// //           autoPlay
// //           loop
// //           style={{ width: 300, height: 300 }}
// //         />
// //       </View>
// //     );
// //   }

// //   return (
// //     <SafeAreaView style={styles.container}>
// //       <StatusBar barStyle="dark-content" backgroundColor={Colors.white} />

// //       <View style={styles.header}>
// //         <TouchableOpacity
// //           style={styles.backButton}
// //           onPress={() => navigation.goBack()}
// //         >
// //           <MaterialIcons name="arrow-back-ios" size={24} color="#ED7117" />
// //         </TouchableOpacity>

// //         <Text style={styles.headerTitle}>Available Rides</Text>

// //         <TouchableOpacity
// //           style={[
// //             styles.filterButton,
// //             headerFiltersVisible && styles.filterButtonActive
// //           ]}
// //           onPress={() => setHeaderFiltersVisible(prev => !prev)}
// //         >
// //           <Ionicons name="options-outline" size={22} color="#ED7117" />
// //         </TouchableOpacity>
// //       </View>

// //       {/* Debug Status Banner */}
// //       {lastRequestStatus && (
// //         <View style={[
// //           styles.debugBanner,
// //           lastRequestStatus.success ? styles.debugBannerSuccess : styles.debugBannerError
// //         ]}>
// //           <Ionicons 
// //             name={lastRequestStatus.success ? "checkmark-circle" : "alert-circle"} 
// //             size={18} 
// //             color={lastRequestStatus.success ? "#166534" : "#991B1B"} 
// //           />
// //           <Text style={[
// //             styles.debugBannerText,
// //             lastRequestStatus.success ? styles.debugBannerTextSuccess : styles.debugBannerTextError
// //           ]}>
// //             {lastRequestStatus.message}
// //           </Text>
// //           <TouchableOpacity onPress={() => setLastRequestStatus(null)}>
// //             <Ionicons name="close" size={16} color={lastRequestStatus.success ? "#166534" : "#991B1B"} />
// //           </TouchableOpacity>
// //         </View>
// //       )}

// //       {headerFiltersVisible ? (
// //         <View style={styles.topControlsWrap}>
// //           <ScrollView
// //             horizontal
// //             showsHorizontalScrollIndicator={false}
// //             contentContainerStyle={styles.filterScroll}
// //           >
// //             {quickFilterOptions.map((filter) => {
// //               const active = quickFilters.includes(filter.key);
// //               return (
// //                 <TouchableOpacity
// //                   key={filter.key}
// //                   activeOpacity={0.85}
// //                   style={[styles.quickChip, active && styles.quickChipActive]}
// //                   onPress={() => toggleQuickFilter(filter.key)}
// //                 >
// //                   <Text
// //                     style={[
// //                       styles.quickChipText,
// //                       active && styles.quickChipTextActive,
// //                     ]}
// //                   >
// //                     {filter.label}
// //                   </Text>
// //                 </TouchableOpacity>
// //               );
// //             })}

// //             <TouchableOpacity
// //               activeOpacity={0.85}
// //               style={styles.moreFilterChip}
// //               onPress={() => setFilterModalVisible(true)}
// //             >
// //               <Ionicons name="options-outline" size={14} color="#ED7117" />
// //               <Text style={styles.moreFilterChipText}>More Filters</Text>
// //             </TouchableOpacity>
// //           </ScrollView>

// //           <Text style={styles.sortLabel}>Sort by</Text>

// //           <ScrollView
// //             horizontal
// //             showsHorizontalScrollIndicator={false}
// //             contentContainerStyle={styles.sortScroll}
// //           >
// //             {SORT_OPTIONS.map((option) => {
// //               const active = sortBy === option.key;
// //               return (
// //                 <TouchableOpacity
// //                   key={option.key}
// //                   activeOpacity={0.85}
// //                   style={[styles.sortChip, active && styles.sortChipActive]}
// //                   onPress={() => setSortBy(option.key)}
// //                 >
// //                   <Text
// //                     style={[
// //                       styles.sortChipText,
// //                       active && styles.sortChipTextActive,
// //                     ]}
// //                   >
// //                     {option.label}
// //                   </Text>
// //                 </TouchableOpacity>
// //               );
// //             })}
// //           </ScrollView>
// //         </View>
// //       ) : null}

// //       {processedRides.length === 0 ? (
// //         <View style={styles.emptyContainer}>
// //           <Ionicons name="car-outline" size={80} color={Colors.gray} />
// //           <Text style={styles.emptyTitle}>No Rides Found</Text>
// //           <Text style={styles.emptySubtitle}>
// //             {errorMessage
// //               ? errorMessage
// //               : 'No rides available for this route at the selected time.'}
// //           </Text>

// //           <TouchableOpacity 
// //             style={styles.requestAlertButton} 
// //             onPress={() => setShowRideRequestModal(true)}
// //           >
// //             <Ionicons name="notifications-outline" size={20} color={Colors.white} />
// //             <Text style={styles.requestAlertButtonText}>Notify me when a ride is available</Text>
// //           </TouchableOpacity>

// //           <TouchableOpacity style={styles.clearButton} onPress={clearAllFilters}>
// //             <Text style={styles.clearButtonText}>Clear Filters</Text>
// //           </TouchableOpacity>
// //         </View>
// //       ) : (
// //         <FlatList
// //           data={processedRides}
// //           renderItem={renderRideCard}
// //           keyExtractor={(item) => String(item.id)}
// //           contentContainerStyle={styles.listContent}
// //           showsVerticalScrollIndicator={false}
// //           refreshControl={
// //             <RefreshControl
// //               refreshing={refreshing}
// //               onRefresh={onRefresh}
// //               colors={[Colors.primary]}
// //               tintColor={Colors.primary}
// //             />
// //           }
// //           ItemSeparatorComponent={() => <View style={{ height: 12 }} />}
// //         />
// //       )}

// //       <Modal
// //         visible={filterModalVisible}
// //         transparent
// //         animationType="slide"
// //         onRequestClose={() => setFilterModalVisible(false)}
// //       >
// //         <View style={styles.modalBackdrop}>
// //           <TouchableOpacity
// //             style={styles.modalOverlay}
// //             activeOpacity={1}
// //             onPress={() => setFilterModalVisible(false)}
// //           />

// //           <View style={styles.modalSheet}>
// //             <View style={styles.modalHandle} />

// //             <View style={styles.modalHeader}>
// //               <Text style={styles.modalTitle}>More Filters</Text>
// //               <TouchableOpacity onPress={() => setFilterModalVisible(false)}>
// //                 <Ionicons name="close" size={24} color={Colors.dark} />
// //               </TouchableOpacity>
// //             </View>

// //             <ScrollView
// //               showsVerticalScrollIndicator={false}
// //               contentContainerStyle={styles.modalContent}
// //             >
// //               {advancedFilterOptions.map((pref) => (
// //                 <View key={pref.key} style={styles.modalSection}>
// //                   <Text style={styles.modalSectionTitle}>{pref.label}</Text>
// //                   {renderAdvancedFilterControl(pref)}
// //                 </View>
// //               ))}
// //             </ScrollView>

// //             <View style={styles.modalFooter}>
// //               <TouchableOpacity
// //                 style={styles.modalSecondaryBtn}
// //                 onPress={clearAllFilters}
// //               >
// //                 <Text style={styles.modalSecondaryBtnText}>Clear</Text>
// //               </TouchableOpacity>

// //               <TouchableOpacity
// //                 style={styles.modalPrimaryBtn}
// //                 onPress={() => setFilterModalVisible(false)}
// //               >
// //                 <Text style={styles.modalPrimaryBtnText}>Apply Filters</Text>
// //               </TouchableOpacity>
// //             </View>
// //           </View>
// //         </View>
// //       </Modal>

// //       {/* Ride Request Modal */}
// //       <RideRequestModal />

// //       <ProfileImageModal
// //         visible={selectedProfile.visible}
// //         imageUrl={selectedProfile.imageUrl}
// //         driverName={selectedProfile.driverName}
// //         onClose={() => setSelectedProfile({ visible: false, imageUrl: null, driverName: '' })}
// //       />

// //       <CustomAlert
// //         visible={alertVisible}
// //         title={alertConfig.title}
// //         message={alertConfig.message}
// //         icon={alertConfig.icon}
// //         iconColor={alertConfig.iconColor}
// //         buttons={alertConfig.buttons}
// //         onBackdropPress={() => setAlertVisible(false)}
// //       />
// //     </SafeAreaView>
// //   );
// // }

// // const styles = StyleSheet.create({
// //   container: {
// //     flex: 1,
// //     backgroundColor: '#fff',
// //   },
// //   header: {
// //     flexDirection: 'row',
// //     alignItems: 'center',
// //     paddingHorizontal: 16,
// //     paddingVertical: 12,
// //     borderBottomWidth: 0.5,
// //     borderBottomColor: '#fff',
// //     backgroundColor: Colors.white,
// //   },
// //   backButton: {
// //     width: 44,
// //     height: 44,
// //     justifyContent: 'center',
// //   },
// //   filterButton: {
// //     width: 44,
// //     height: 44,
// //     justifyContent: 'center',
// //     alignItems: 'center',
// //     borderRadius: 22,
// //   },
// //   filterButtonActive: {
// //     backgroundColor: '#fff',
// //   },
// //   headerTitle: {
// //     ...Typography.h2,
// //     fontSize: 28,
// //     fontWeight: '700',
// //     color: Colors.primary,
// //     flex: 1,
// //     textAlign: 'center',
// //   },
// //   topControlsWrap: {
// //     backgroundColor: Colors.white,
// //     paddingTop: 10,
// //     paddingBottom: 12,
// //     borderBottomWidth: 1,
// //     borderBottomColor: '#EEF2F7',
// //   },
// //   filterScroll: {
// //     paddingHorizontal: 16,
// //     gap: 10,
// //   },
// //   quickChip: {
// //     paddingHorizontal: 14,
// //     paddingVertical: 10,
// //     borderRadius: 20,
// //     backgroundColor: '#F3F4F6',
// //   },
// //   quickChipActive: {
// //     backgroundColor: Colors.primary,
// //   },
// //   quickChipText: {
// //     fontSize: 12,
// //     fontWeight: '600',
// //     color: Colors.dark,
// //   },
// //   quickChipTextActive: {
// //     color: Colors.white,
// //   },
// //   moreFilterChip: {
// //     flexDirection: 'row',
// //     alignItems: 'center',
// //     gap: 6,
// //     paddingHorizontal: 14,
// //     paddingVertical: 10,
// //     borderRadius: 20,
// //     backgroundColor: '#EEF6FF',
// //   },
// //   moreFilterChipText: {
// //     fontSize: 12,
// //     fontWeight: '700',
// //     color: '#ED7117',
// //   },
// //   sortLabel: {
// //     paddingHorizontal: 16,
// //     marginTop: 12,
// //     marginBottom: 8,
// //     fontSize: 12,
// //     color: Colors.gray,
// //     fontWeight: '700',
// //   },
// //   sortScroll: {
// //     paddingHorizontal: 16,
// //     gap: 10,
// //   },
// //   sortChip: {
// //     paddingHorizontal: 14,
// //     paddingVertical: 8,
// //     borderRadius: 14,
// //     backgroundColor: '#F3F4F6',
// //   },
// //   sortChipActive: {
// //     backgroundColor: '#ED7117',
// //   },
// //   sortChipText: {
// //     fontSize: 12,
// //     color: Colors.dark,
// //     fontWeight: '600',
// //   },
// //   sortChipTextActive: {
// //     color: Colors.white,
// //   },
// //   listContent: {
// //     padding: 16,
// //     paddingBottom: 28,
// //   },
// //   rideCard: {
// //     backgroundColor: Colors.white,
// //     borderRadius: 18,
// //     padding: 14,
// //     borderWidth: 1,
// //     borderColor: '#EEF2F7',
// //     shadowColor: '#0F172A',
// //     shadowOffset: { width: 0, height: 6 },
// //     shadowOpacity: 0.05,
// //     shadowRadius: 14,
// //     elevation: 2,
// //   },
// //   rideCardWarning: {
// //     backgroundColor: '#FFFBEB',
// //     borderColor: '#FDE68A',
// //   },
// //   rideCardFull: {
// //     backgroundColor: '#FEF2F2',
// //     borderColor: '#FEE2E2',
// //     opacity: 0.85,
// //   },
// //   cardTopRow: {
// //     flexDirection: 'row',
// //     justifyContent: 'space-between',
// //     alignItems: 'flex-start',
// //   },
// //   profileRow: {
// //     flexDirection: 'row',
// //     flex: 1,
// //     paddingRight: 10,
// //   },
// //   avatarContainer: {
// //     width: 48,
// //     height: 48,
// //     borderRadius: 24,
// //     backgroundColor: '#E5E7EB',
// //     alignItems: 'center',
// //     justifyContent: 'center',
// //     overflow: 'hidden',
// //     marginRight: 10,
// //   },
// //   avatarImage: {
// //     width: 48,
// //     height: 48,
// //   },
// //   avatarFallback: {
// //     fontSize: 14,
// //     fontWeight: '800',
// //     color: Colors.gray,
// //   },
// //   profileContent: {
// //     flex: 1,
// //   },
// //   nameRow: {
// //     flexDirection: 'row',
// //     alignItems: 'center',
// //     flexWrap: 'wrap',
// //     gap: 6,
// //   },
// //   driverName: {
// //     fontSize: 15,
// //     fontWeight: '800',
// //     color: Colors.dark,
// //     maxWidth: '100%',
// //   },
// //   verifiedBadge: {
// //     flexDirection: 'row',
// //     alignItems: 'center',
// //     gap: 4,
// //     backgroundColor: '#E8F5E9',
// //     paddingHorizontal: 6,
// //     paddingVertical: 2,
// //     borderRadius: 12,
// //   },
// //   verifiedText: {
// //     fontSize: 10,
// //     fontWeight: '700',
// //     color: '#16A34A',
// //   },
// //   womenOnlyBadge: {
// //     flexDirection: 'row',
// //     alignItems: 'center',
// //     gap: 4,
// //     backgroundColor: '#FCE4EC',
// //     paddingHorizontal: 8,
// //     paddingVertical: 3,
// //     borderRadius: 12,
// //   },
// //   womenOnlyBadgeText: {
// //     fontSize: 10,
// //     color: '#E91E63',
// //     fontWeight: '700',
// //   },
// //   fullBadge: {
// //     flexDirection: 'row',
// //     alignItems: 'center',
// //     gap: 4,
// //     backgroundColor: '#FEF2F2',
// //     paddingHorizontal: 8,
// //     paddingVertical: 3,
// //     borderRadius: 12,
// //     borderWidth: 1,
// //     borderColor: '#FEE2E2',
// //   },
// //   fullBadgeText: {
// //     fontSize: 10,
// //     color: '#EF4444',
// //     fontWeight: '700',
// //   },
// //   ratingRow: {
// //     flexDirection: 'row',
// //     alignItems: 'center',
// //     marginTop: 4,
// //   },
// //   ratingText: {
// //     fontSize: 11,
// //     color: Colors.gray,
// //     fontWeight: '600',
// //   },
// //   priceMatchWrap: {
// //     alignItems: 'flex-end',
// //   },
// //   matchBadge: {
// //     backgroundColor: '#EEF6FF',
// //     paddingHorizontal: 8,
// //     paddingVertical: 4,
// //     borderRadius: 10,
// //     marginBottom: 6,
// //   },
// //   matchText: {
// //     fontSize: 12,
// //     fontWeight: '800',
// //     color: Colors.primary,
// //   },
// //   priceText: {
// //     fontSize: 18,
// //     fontWeight: '800',
// //     color: '#ED7117',
// //     lineHeight: 20,
// //   },
// //   perSeatText: {
// //     fontSize: 10,
// //     color: Colors.gray,
// //     fontWeight: '600',
// //     marginTop: 2,
// //   },
// //   infoRow: {
// //     flexDirection: 'row',
// //     alignItems: 'center',
// //     flexWrap: 'wrap',
// //     marginTop: 12,
// //     marginBottom: 10,
// //   },
// //   infoItem: {
// //     flexDirection: 'row',
// //     alignItems: 'center',
// //     gap: 4,
// //   },
// //   infoText: {
// //     fontSize: 12,
// //     color: Colors.dark,
// //     fontWeight: '600',
// //   },
// //   warningText: {
// //     color: '#F59E0B',
// //   },
// //   fullText: {
// //     color: '#EF4444',
// //   },
// //   infoDot: {
// //     width: 4,
// //     height: 4,
// //     borderRadius: 2,
// //     backgroundColor: '#CBD5E1',
// //     marginHorizontal: 8,
// //   },
// //   seatWarningContainer: {
// //     flexDirection: 'row',
// //     alignItems: 'center',
// //     backgroundColor: '#FEF3C7',
// //     borderRadius: 8,
// //     padding: 8,
// //     marginTop: 8,
// //     marginBottom: 4,
// //     gap: 6,
// //   },
// //   seatWarningText: {
// //     flex: 1,
// //     fontSize: 11,
// //     color: '#D97706',
// //     fontWeight: '600',
// //   },
// //   fullWarningContainer: {
// //     flexDirection: 'row',
// //     alignItems: 'center',
// //     backgroundColor: '#FEF2F2',
// //     borderRadius: 8,
// //     padding: 8,
// //     marginTop: 8,
// //     marginBottom: 4,
// //     borderWidth: 1,
// //     borderColor: '#FEE2E2',
// //     gap: 6,
// //   },
// //   fullWarningText: {
// //     flex: 1,
// //     fontSize: 11,
// //     color: '#EF4444',
// //     fontWeight: '600',
// //   },
// //   divider: {
// //     height: 1,
// //     backgroundColor: '#EEF2F7',
// //     marginBottom: 10,
// //   },
// //   routeBlock: {
// //     gap: 8,
// //   },
// //   routeRow: {
// //     flexDirection: 'row',
// //     alignItems: 'flex-start',
// //   },
// //   routeDot: {
// //     width: 8,
// //     height: 8,
// //     borderRadius: 4,
// //     marginTop: 5,
// //     marginRight: 8,
// //   },
// //   routeTextWrap: {
// //     flex: 1,
// //   },
// //   routeLabel: {
// //     fontSize: 11,
// //     color: Colors.gray,
// //     fontWeight: '700',
// //     marginBottom: 2,
// //   },
// //   routeText: {
// //     fontSize: 13,
// //     color: Colors.dark,
// //     fontWeight: '600',
// //     lineHeight: 18,
// //   },
// //   vehicleRow: {
// //     flexDirection: 'row',
// //     alignItems: 'center',
// //     gap: 6,
// //     marginTop: 10,
// //   },
// //   vehicleText: {
// //     fontSize: 12,
// //     color: Colors.gray,
// //     fontWeight: '600',
// //     flex: 1,
// //   },
// //   badgeScroll: {
// //     gap: 8,
// //     paddingTop: 10,
// //   },
// //   prefBadge: {
// //     paddingHorizontal: 10,
// //     paddingVertical: 6,
// //     borderRadius: 12,
// //     marginRight: 8,
// //   },
// //   prefBadgeText: {
// //     fontSize: 11,
// //     fontWeight: '700',
// //   },
// //   loadingContainer: {
// //     flex: 1,
// //     justifyContent: 'center',
// //     alignItems: 'center',
// //     backgroundColor: Colors.white,
// //   },
// //   emptyContainer: {
// //     flex: 1,
// //     justifyContent: 'center',
// //     alignItems: 'center',
// //     paddingHorizontal: 40,
// //   },
// //   emptyTitle: {
// //     fontSize: 22,
// //     fontWeight: '700',
// //     color: Colors.dark,
// //     marginTop: 20,
// //     marginBottom: 8,
// //   },
// //   emptySubtitle: {
// //     fontSize: 15,
// //     color: Colors.gray,
// //     textAlign: 'center',
// //     lineHeight: 22,
// //     marginBottom: 24,
// //   },
// //   requestAlertButton: {
// //     flexDirection: 'row',
// //     alignItems: 'center',
// //     justifyContent: 'center',
// //     backgroundColor: Colors.primary,
// //     paddingHorizontal: 20,
// //     paddingVertical: 14,
// //     borderRadius: 12,
// //     marginBottom: 12,
// //     gap: 8,
// //     width: '100%',
// //   },
// //   requestAlertButtonText: {
// //     color: Colors.white,
// //     fontSize: 15,
// //     fontWeight: '600',
// //   },
// //   clearButton: {
// //     backgroundColor: Colors.primary,
// //     paddingHorizontal: 24,
// //     paddingVertical: 12,
// //     borderRadius: 12,
// //   },
// //   clearButtonText: {
// //     color: Colors.white,
// //     fontSize: 15,
// //     fontWeight: '700',
// //   },
// //   modalBackdrop: {
// //     flex: 1,
// //     backgroundColor: 'rgba(15,23,42,0.28)',
// //     justifyContent: 'flex-end',
// //   },
// //   modalOverlay: {
// //     flex: 1,
// //   },
// //   modalSheet: {
// //     backgroundColor: Colors.white,
// //     borderTopLeftRadius: 24,
// //     borderTopRightRadius: 24,
// //     maxHeight: '78%',
// //     paddingTop: 10,
// //   },
// //   requestModalSheet: {
// //     backgroundColor: Colors.white,
// //     borderTopLeftRadius: 24,
// //     borderTopRightRadius: 24,
// //     maxHeight: '80%',
// //     paddingTop: 10,
// //   },
// //   modalHandle: {
// //     width: 52,
// //     height: 5,
// //     borderRadius: 999,
// //     backgroundColor: '#D1D5DB',
// //     alignSelf: 'center',
// //     marginBottom: 14,
// //   },
// //   modalHeader: {
// //     flexDirection: 'row',
// //     alignItems: 'center',
// //     justifyContent: 'space-between',
// //     paddingHorizontal: 18,
// //     paddingBottom: 10,
// //   },
// //   modalTitle: {
// //     fontSize: 20,
// //     fontWeight: '800',
// //     color: Colors.dark,
// //   },
// //   modalContent: {
// //     paddingHorizontal: 18,
// //     paddingBottom: 20,
// //   },
// //   requestModalContent: {
// //     padding: 20,
// //   },
// //   modalSection: {
// //     marginBottom: 18,
// //   },
// //   modalSectionTitle: {
// //     fontSize: 14,
// //     fontWeight: '700',
// //     color: Colors.dark,
// //     marginBottom: 10,
// //   },
// //   modalToggleChip: {
// //     borderRadius: 14,
// //     borderWidth: 1,
// //     borderColor: '#E5E7EB',
// //     paddingHorizontal: 14,
// //     paddingVertical: 10,
// //     alignSelf: 'flex-start',
// //     backgroundColor: '#F9FAFB',
// //   },
// //   modalToggleChipActive: {
// //     backgroundColor: Colors.primary,
// //     borderColor: Colors.primary,
// //   },
// //   modalToggleChipText: {
// //     fontSize: 13,
// //     color: Colors.dark,
// //     fontWeight: '600',
// //   },
// //   modalToggleChipTextActive: {
// //     color: Colors.white,
// //   },
// //   modalOptionWrap: {
// //     flexDirection: 'row',
// //     flexWrap: 'wrap',
// //     gap: 10,
// //   },
// //   modalOptionChip: {
// //     borderRadius: 16,
// //     borderWidth: 1,
// //     borderColor: '#E5E7EB',
// //     paddingHorizontal: 12,
// //     paddingVertical: 9,
// //     backgroundColor: '#F9FAFB',
// //   },
// //   modalOptionChipActive: {
// //     backgroundColor: Colors.primary,
// //     borderColor: Colors.primary,
// //   },
// //   modalOptionChipText: {
// //     fontSize: 13,
// //     color: Colors.dark,
// //     fontWeight: '600',
// //   },
// //   modalOptionChipTextActive: {
// //     color: Colors.white,
// //   },
// //   modalFooter: {
// //     flexDirection: 'row',
// //     paddingHorizontal: 18,
// //     paddingTop: 12,
// //     paddingBottom: Platform.OS === 'ios' ? 28 : 18,
// //     borderTopWidth: 1,
// //     borderTopColor: '#EEF2F7',
// //     gap: 12,
// //   },
// //   modalSecondaryBtn: {
// //     flex: 1,
// //     borderRadius: 14,
// //     paddingVertical: 14,
// //     alignItems: 'center',
// //     backgroundColor: '#F3F4F6',
// //   },
// //   modalSecondaryBtnText: {
// //     fontSize: 15,
// //     fontWeight: '700',
// //     color: Colors.dark,
// //   },
// //   modalPrimaryBtn: {
// //     flex: 1,
// //     borderRadius: 14,
// //     paddingVertical: 14,
// //     alignItems: 'center',
// //     backgroundColor: Colors.primary,
// //   },
// //   modalPrimaryBtnText: {
// //     fontSize: 15,
// //     fontWeight: '700',
// //     color: Colors.white,
// //   },
// //   requestInfoBox: {
// //     flexDirection: 'row',
// //     alignItems: 'center',
// //     backgroundColor: '#EFF6FF',
// //     padding: 12,
// //     borderRadius: 12,
// //     marginBottom: 16,
// //     gap: 8,
// //   },
// //   requestInfoText: {
// //     flex: 1,
// //     fontSize: 13,
// //     color: '#1E3A8A',
// //     lineHeight: 18,
// //   },
// //   requestRouteBox: {
// //     backgroundColor: '#F3F4F6',
// //     padding: 12,
// //     borderRadius: 12,
// //     marginBottom: 20,
// //   },
// //   requestRouteLabel: {
// //     fontSize: 12,
// //     fontWeight: '600',
// //     color: Colors.gray,
// //     marginBottom: 4,
// //   },
// //   requestRouteText: {
// //     fontSize: 14,
// //     fontWeight: '600',
// //     color: Colors.dark,
// //     marginBottom: 4,
// //   },
// //   requestRouteDetail: {
// //     fontSize: 12,
// //     color: Colors.gray,
// //     marginTop: 2,
// //   },
// //   requestInputGroup: {
// //     marginBottom: 16,
// //   },
// //   requestLabel: {
// //     fontSize: 14,
// //     fontWeight: '600',
// //     color: Colors.dark,
// //     marginBottom: 8,
// //   },
// //   requestInput: {
// //     borderWidth: 1,
// //     borderColor: '#E5E7EB',
// //     borderRadius: 12,
// //     paddingHorizontal: 12,
// //     paddingVertical: 10,
// //     fontSize: 14,
// //     backgroundColor: '#F9FAFB',
// //   },
// //   requestTextArea: {
// //     minHeight: 80,
// //     textAlignVertical: 'top',
// //   },
// //   requestHelper: {
// //     fontSize: 11,
// //     color: Colors.gray,
// //     marginTop: 4,
// //   },
// //   requestNoteBox: {
// //     flexDirection: 'row',
// //     alignItems: 'center',
// //     backgroundColor: '#FEF3C7',
// //     padding: 12,
// //     borderRadius: 12,
// //     gap: 8,
// //   },
// //   requestNoteText: {
// //     flex: 1,
// //     fontSize: 12,
// //     color: '#D97706',
// //   },
// //   disabledButton: {
// //     opacity: 0.6,
// //   },
// //   imageModalContainer: {
// //     flex: 1,
// //     justifyContent: 'center',
// //     alignItems: 'center',
// //     backgroundColor: 'rgba(0,0,0,0.9)',
// //   },
// //   imageModalContent: {
// //     width: '90%',
// //     backgroundColor: Colors.white,
// //     borderRadius: 20,
// //     overflow: 'hidden',
// //   },
// //   imageModalHeader: {
// //     flexDirection: 'row',
// //     justifyContent: 'space-between',
// //     alignItems: 'center',
// //     padding: 16,
// //     borderBottomWidth: 1,
// //     borderBottomColor: '#EEF2F7',
// //   },
// //   imageModalTitle: {
// //     fontSize: 18,
// //     fontWeight: '700',
// //     color: Colors.dark,
// //   },
// //   fullProfileImage: {
// //     width: '100%',
// //     height: 400,
// //     backgroundColor: '#F5F5F5',
// //   },
// //   noImageContainer: {
// //     width: '100%',
// //     height: 400,
// //     justifyContent: 'center',
// //     alignItems: 'center',
// //     backgroundColor: '#F5F5F5',
// //   },
// //   noImageText: {
// //     fontSize: 16,
// //     color: Colors.gray,
// //   },
// //   svgContainer: {
// //     width: 48,
// //     height: 48,
// //     alignItems: 'center',
// //     justifyContent: 'center',
// //   },
// //   initialsContainer: {
// //     width: '100%',
// //     height: '100%',
// //     alignItems: 'center',
// //     justifyContent: 'center',
// //     backgroundColor: '#E5E7EB',
// //   },
// //   modalSvgContainer: {
// //     width: '100%',
// //     height: 400,
// //     backgroundColor: '#F5F5F5',
// //     alignItems: 'center',
// //     justifyContent: 'center',
// //   },
// //   debugBanner: {
// //     flexDirection: 'row',
// //     alignItems: 'center',
// //     padding: 12,
// //     marginHorizontal: 16,
// //     marginTop: 8,
// //     marginBottom: 8,
// //     borderRadius: 8,
// //     gap: 8,
// //   },
// //   debugBannerSuccess: {
// //     backgroundColor: '#DCFCE7',
// //     borderLeftWidth: 4,
// //     borderLeftColor: '#22C55E',
// //   },
// //   debugBannerError: {
// //     backgroundColor: '#FEE2E2',
// //     borderLeftWidth: 4,
// //     borderLeftColor: '#EF4444',
// //   },
// //   debugBannerText: {
// //     flex: 1,
// //     fontSize: 12,
// //     fontWeight: '500',
// //   },
// //   debugBannerTextSuccess: {
// //     color: '#166534',
// //   },
// //   debugBannerTextError: {
// //     color: '#991B1B',
// //   },
// // });
// // import React, { useState, useEffect, useCallback, useMemo } from 'react';
// // import {
// //   View,
// //   Text,
// //   StyleSheet,
// //   TouchableOpacity,
// //   FlatList,
// //   StatusBar,
// //   Platform,
// //   Image,
// //   ScrollView,
// //   Modal,
// //   RefreshControl,
// //   TextInput,
// //   ActivityIndicator,
// // } from 'react-native';
// // import { SafeAreaView } from 'react-native-safe-area-context';
// // import { Ionicons, MaterialIcons } from '@expo/vector-icons';
// // import LottieView from "lottie-react-native";
// // import { Colors, Typography } from '../constants/Colors';
// // import { useAuth } from '../context/AuthContext';
// // import { API_BASE_URL } from '../config/config_ip';
// // import DatabaseService from '../services/matchingpreference_ds';
// // import CustomAlert from '../components/CustomAlert';
// // import { SvgCssUri } from 'react-native-svg/css';
// // import { useFocusEffect } from '@react-navigation/native';

// // const IMAGE_BASE_URL = API_BASE_URL;

// // // Enable fetch logging for debugging
// // const originalFetch = global.fetch;
// // global.fetch = async (...args) => {
// //   const [url, options] = args;
  
// //   // Log outgoing requests for ride-related endpoints
// //   if (typeof url === 'string' && (url.includes('/request-ride-alert') || 
// //       url.includes('/my-ride-requests') || 
// //       url.includes('/search-rides'))) {
// //     console.log(`\n🌐 ========== API REQUEST ==========`);
// //     console.log(`📍 URL: ${url}`);
// //     console.log(`📌 Method: ${options?.method || 'GET'}`);
// //     if (options?.body) {
// //       try {
// //         const body = JSON.parse(options.body);
// //         console.log(`📦 Body:`, JSON.stringify(body, null, 2));
// //       } catch(e) {
// //         console.log(`📦 Body: ${options.body}`);
// //       }
// //     }
// //   }
  
// //   const response = await originalFetch(...args);
  
// //   // Log responses
// //   if (typeof url === 'string' && (url.includes('/request-ride-alert') || 
// //       url.includes('/my-ride-requests') || 
// //       url.includes('/search-rides'))) {
// //     const clonedResponse = response.clone();
// //     const data = await clonedResponse.json();
// //     console.log(`\n📥 RESPONSE:`);
// //     console.log(`   Status: ${response.status}`);
// //     console.log(`   Data:`, JSON.stringify(data, null, 2));
// //     console.log(`====================================\n`);
// //   }
  
// //   return response;
// // };

// // const QUICK_FILTER_KEYS = [
// //   'verified_profiles_only',
// //   'same_gender_after_9pm',
// //   'smoking_policy',
// //   'pets_allowed',
// //   'chat_level',
// //   'luggage_allowance',
// // ];

// // const QUICK_FILTER_LABELS = {
// //   verified_profiles_only: 'Verified Only',
// //   same_gender_after_9pm: 'Same Gender Night',
// //   smoking_policy: 'No Smoking',
// //   pets_allowed: 'Pets',
// //   chat_level: 'Chat Level',
// //   luggage_allowance: 'Luggage',
// // };

// // const SORT_OPTIONS = [
// //   { key: 'time', label: 'Time' },
// //   { key: 'price', label: 'Price' },
// //   { key: 'rating', label: 'Rating' },
// //   { key: 'match', label: 'Match %' },
// // ];

// // function buildImageUrl(url) {
// //   if (!url) return null;
// //   if (url.startsWith('http://') || url.startsWith('https://')) return url;
// //   return `${IMAGE_BASE_URL}${url.startsWith('/') ? '' : '/'}${url}`;
// // }

// // function getDriverInitials(name) {
// //   if (!name) return 'D';
// //   const parts = name.trim().split(' ').filter(Boolean);
// //   if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
// //   return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
// // }

// // function normalizeText(value) {
// //   if (value === undefined || value === null) return '';
// //   return String(value).trim().toLowerCase();
// // }

// // // Helper function to normalize location for better matching
// // const normalizeLocation = (location) => {
// //   if (!location) return '';
// //   return location
// //     .toLowerCase()
// //     // Remove "Tower-2", "Tower 2", etc.
// //     .replace(/tower[-\s]*\d+/i, '')
// //     // Remove "5th", "1066", etc.
// //     .replace(/[-\s]*\d+[-\s]*(?:th|st|nd|rd)/i, '')
// //     // Remove "Sector 4", "Block A", etc.
// //     .replace(/\b(?:tower|block|sector|sect|building|no\.?|#|flat|apartment|apt)\s*\d+/gi, '')
// //     // Remove all standalone numbers
// //     .replace(/\b\d+\b/g, '')
// //     // Remove punctuation
// //     .replace(/[^\w\s]/g, ' ')
// //     // Remove extra spaces
// //     .replace(/\s+/g, ' ')
// //     .trim();
// // };

// // // Check if two locations match (flexible matching)
// // const locationsMatch = (loc1, loc2) => {
// //   const norm1 = normalizeLocation(loc1);
// //   const norm2 = normalizeLocation(loc2);
  
// //   if (!norm1 || !norm2) return false;
  
// //   // Exact match after normalization
// //   if (norm1 === norm2) return true;
  
// //   // One contains the other
// //   if (norm1.includes(norm2) || norm2.includes(norm1)) {
// //     return true;
// //   }
  
// //   // Split into words and check common significant words
// //   const words1 = norm1.split(' ');
// //   const words2 = norm2.split(' ');
// //   const commonWords = words1.filter(w => 
// //     words2.includes(w) && w.length > 2 && !['the','and','of','to','for','with'].includes(w)
// //   );
  
// //   // If they share at least 2 significant words, consider it a match
// //   if (commonWords.length >= 2) {
// //     return true;
// //   }
  
// //   // Special check for "Avenue" vs "Av" / "Ave"
// //   const avMatch = (norm1.includes('avenue') && (norm2.includes('av') || norm2.includes('ave'))) ||
// //                   ((norm1.includes('av') || norm1.includes('ave')) && norm2.includes('avenue'));
  
// //   // Special check for "Sector" abbreviations
// //   const sectorMatch = (norm1.includes('sector') && (norm2.includes('sec') || norm2.includes('sect'))) ||
// //                       ((norm1.includes('sec') || norm1.includes('sect')) && norm2.includes('sector'));
  
// //   // Special check for "Gaur City" variations
// //   const gaurCityMatch = (norm1.includes('gaur city') && norm2.includes('gaur city')) ||
// //                         (norm1.includes('gaurcity') && norm2.includes('gaur city'));
  
// //   // Special check for college names
// //   const collegeMatch = (norm1.includes('engineering college') && norm2.includes('engineering college'));
  
// //   return avMatch || sectorMatch || gaurCityMatch || collegeMatch;
// // };

// // function getRidePreferences(item) {
// //   if (item.preferences) return item.preferences;
// //   if (item.ridePreferences) return item.ridePreferences;
// //   if (item.matchingPreferences) return item.matchingPreferences;
// //   if (item.travel_preferences) return item.travel_preferences;
// //   return {};
// // }

// // function extractPreferenceBadges(item) {
// //   const prefs = getRidePreferences(item);
// //   const badges = [];

// //   if (!prefs || Object.keys(prefs).length === 0) {
// //     return [];
// //   }

// //   Object.entries(prefs).forEach(([key, value]) => {
// //     if (value === null || value === undefined) return;
    
// //     if (typeof value === 'boolean') {
// //       if (value === true) {
// //         if (key === 'verified_profiles_only') {
// //           badges.push('Verified Only');
// //         } else {
// //           const displayKey = key.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
// //           badges.push(displayKey);
// //         }
// //       }
// //     } 
// //     else if (Array.isArray(value)) {
// //       if (value.length > 0) {
// //         value.forEach(v => {
// //           if (v && v.trim()) {
// //             badges.push(v.trim());
// //           }
// //         });
// //       }
// //     }
// //     else if (typeof value === 'string' && value.trim()) {
// //       const lowerValue = value.toLowerCase();
// //       if (!['false', 'no', 'none', 'null', 'undefined', 'no preference'].includes(lowerValue)) {
// //         badges.push(value);
// //       }
// //     }
// //     else if (typeof value === 'number') {
// //       badges.push(String(value));
// //     }
// //   });

// //   return [...new Set(badges)];
// // }

// // async function fetchUserDocuments(phoneNumber) {
// //   try {
// //     const url = `${API_BASE_URL}/api/v1/documents/user/${phoneNumber}`;
// //     const res = await fetch(url, { headers: { Accept: 'application/json' } });
// //     if (!res.ok) return null;
// //     const data = await res.json();
// //     return data;
// //   } catch (e) {
// //     console.log('fetchUserDocuments error:', e);
// //     return null;
// //   }
// // }

// // async function fetchDriverProfile(phoneNumber, userId) {
// //   try {
// //     const params = new URLSearchParams();
// //     if (userId) params.append('user_id', userId);
// //     else if (phoneNumber) params.append('phone_number', phoneNumber);
// //     else return null;
// //     const url = `${API_BASE_URL}/api/v1/users/profile-public?${params.toString()}`;
// //     const res = await fetch(url, { headers: { Accept: 'application/json' } });
// //     if (!res.ok) return null;
// //     const data = await res.json();
// //     return data;
// //   } catch (e) {
// //     console.log('fetchDriverProfile error:', e);
// //     return null;
// //   }
// // }

// // function checkVerifiedDocuments(docs) {
// //   if (!docs || !docs.length) return false;
  
// //   const verified = docs.filter(doc => {
// //     const docType = doc.document_type?.toLowerCase();
// //     const status = doc.status?.toUpperCase();
// //     return status === 'APPROVED' && ['aadhar', 'dl', 'rc'].includes(docType);
// //   });
  
// //   return verified.length > 0;
// // }

// // function RatingStars({ rating, size = 12, showLabel = true }) {
// //   const fullStars = Math.floor(rating);
// //   const hasHalfStar = rating % 1 >= 0.5;
// //   const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);
  
// //   return (
// //     <View style={{ flexDirection: 'row', alignItems: 'center' }}>
// //       {[...Array(fullStars)].map((_, i) => (
// //         <Ionicons key={`full-${i}`} name="star" size={size} color="#F59E0B" />
// //       ))}
// //       {hasHalfStar && (
// //         <Ionicons name="star-half" size={size} color="#F59E0B" />
// //       )}
// //       {[...Array(emptyStars)].map((_, i) => (
// //         <Ionicons key={`empty-${i}`} name="star-outline" size={size} color="#F59E0B" />
// //       ))}
// //       {showLabel && rating > 0 && (
// //         <Text style={[styles.ratingText, { marginLeft: 4 }]}>({rating.toFixed(1)})</Text>
// //       )}
// //       {showLabel && rating === 0 && (
// //         <Text style={[styles.ratingText, { marginLeft: 4 }]}>New</Text>
// //       )}
// //     </View>
// //   );
// // }

// // function matchesQuickFilter(item, key) {
// //   const prefs = getRidePreferences(item);
// //   const value = prefs?.[key];
// //   const normalized = normalizeText(value);

// //   if (key === 'verified_profiles_only') {
// //     return !!item.isVerified;
// //   }

// //   if (typeof value === 'boolean') return value;
// //   if (Array.isArray(value)) return value.length > 0;

// //   if (key === 'smoking_policy') {
// //     return normalized.includes('no');
// //   }

// //   if (key === 'same_gender_after_9pm') {
// //     return normalized === 'true' || normalized === 'yes' || normalized === 'same gender';
// //   }

// //   if (key === 'pets_allowed') {
// //     return normalized === 'true' || normalized === 'yes' || normalized === 'allowed';
// //   }

// //   return !!normalized;
// // }

// // function matchesAdvancedFilter(item, key, expectedValue) {
// //   if (expectedValue === undefined || expectedValue === null || expectedValue === '') {
// //     return true;
// //   }

// //   const prefs = getRidePreferences(item);
// //   const rideValue = prefs?.[key];

// //   if (typeof expectedValue === 'boolean') {
// //     if (key === 'verified_profiles_only') {
// //       return expectedValue ? !!item.isVerified : true;
// //     }
// //     return rideValue === expectedValue || normalizeText(rideValue) === String(expectedValue);
// //   }

// //   if (Array.isArray(rideValue)) {
// //     return rideValue.map(v => normalizeText(v)).includes(normalizeText(expectedValue));
// //   }

// //   return normalizeText(rideValue) === normalizeText(expectedValue);
// // }

// // function ProfileImageModal({ visible, imageUrl, driverName, onClose }) {
// //   const [isSvg, setIsSvg] = useState(false);
  
// //   useEffect(() => {
// //     if (imageUrl) {
// //       setIsSvg(imageUrl.toLowerCase().includes('.svg'));
// //     }
// //   }, [imageUrl]);
  
// //   if (!visible) return null;
  
// //   return (
// //     <Modal
// //       visible={visible}
// //       transparent={true}
// //       animationType="fade"
// //       onRequestClose={onClose}
// //     >
// //       <TouchableOpacity 
// //         style={styles.modalBackdrop}
// //         activeOpacity={1}
// //         onPress={onClose}
// //       >
// //         <View style={styles.imageModalContainer}>
// //           <View style={styles.imageModalContent}>
// //             <View style={styles.imageModalHeader}>
// //               <Text style={styles.imageModalTitle}>{driverName}</Text>
// //               <TouchableOpacity onPress={onClose}>
// //                 <Ionicons name="close" size={24} color={Colors.dark} />
// //               </TouchableOpacity>
// //             </View>
// //             {imageUrl && imageUrl !== 'null' && imageUrl !== 'undefined' ? (
// //               isSvg ? (
// //                 <View style={styles.modalSvgContainer}>
// //                   <SvgCssUri
// //                     uri={imageUrl}
// //                     width="100%"
// //                     height={400}
// //                   />
// //                 </View>
// //               ) : (
// //                 <Image
// //                   source={{ uri: imageUrl }}
// //                   style={styles.fullProfileImage}
// //                   resizeMode="contain"
// //                 />
// //               )
// //             ) : (
// //               <View style={styles.noImageContainer}>
// //                 <Text style={styles.noImageText}>No profile picture available</Text>
// //               </View>
// //             )}
// //           </View>
// //         </View>
// //       </TouchableOpacity>
// //     </Modal>
// //   );
// // }

// // function PreferenceTag({ label }) {
// //   if (!label || label.trim() === '') return null;
  
// //   let tagColor = '#FFF3E8';
// //   let textColor = '#C65D00';
  
// //   const lowerLabel = label.toLowerCase();
  
// //   if (lowerLabel.includes('chatty') || lowerLabel.includes('talkative')) {
// //     tagColor = '#E3F2FD';
// //     textColor = '#1565C0';
// //   } else if (lowerLabel.includes('quiet')) {
// //     tagColor = '#E8F5E9';
// //     textColor = '#2E7D32';
// //   } else if (lowerLabel.includes('english') || lowerLabel.includes('hindi') || lowerLabel.includes('language')) {
// //     tagColor = '#FFF9C4';
// //     textColor = '#F57F17';
// //   } else if (lowerLabel.includes('music') || lowerLabel.includes('songs')) {
// //     tagColor = '#F3E5F5';
// //     textColor = '#6A1B9A';
// //   } else if (lowerLabel.includes('ac')) {
// //     tagColor = '#E3F2FD';
// //     textColor = '#1565C0';
// //   } else if (lowerLabel.includes('pet')) {
// //     tagColor = '#FCE4EC';
// //     textColor = '#C2185B';
// //   } else if (lowerLabel.includes('smoking')) {
// //     tagColor = '#FFEBEE';
// //     textColor = '#C62828';
// //   } else if (lowerLabel.includes('verified')) {
// //     tagColor = '#E8F5E9';
// //     textColor = '#2E7D32';
// //   } else if (lowerLabel.match(/[0-9]/)) {
// //     tagColor = '#E8F5E9';
// //     textColor = '#2E7D32';
// //   }
  
// //   return (
// //     <View style={[styles.prefBadge, { backgroundColor: tagColor }]}>
// //       <Text style={[styles.prefBadgeText, { color: textColor }]}>{label}</Text>
// //     </View>
// //   );
// // }

// // export default function RideNextScreen({ navigation, route }) {
// //   const { user, loading: authLoading } = useAuth();
// //   const { searchData } = route.params || {};
// //   const { from, to, fromCoords, toCoords, dateTime, seats } = searchData || {};

// //   const [availableRides, setAvailableRides] = useState([]);
// //   const [loading, setLoading] = useState(true);
// //   const [refreshing, setRefreshing] = useState(false);
// //   const [errorMessage, setErrorMessage] = useState('');
// //   const [sortBy, setSortBy] = useState('time');
// //   const [quickFilters, setQuickFilters] = useState([]);
// //   const [headerFiltersVisible, setHeaderFiltersVisible] = useState(false);
// //   const [filterModalVisible, setFilterModalVisible] = useState(false);
// //   const [preferenceMaster, setPreferenceMaster] = useState([]);
// //   const [userPreferences, setUserPreferences] = useState({});
// //   const [advancedFilters, setAdvancedFilters] = useState({});
  
// //   // Ride Request Alert States
// //   const [showRideRequestModal, setShowRideRequestModal] = useState(false);
// //   const [rideRequestLoading, setRideRequestLoading] = useState(false);
// //   const [rideRequestEmail, setRideRequestEmail] = useState('');
// //   const [rideRequestNotes, setRideRequestNotes] = useState('');
// //   const [lastRequestStatus, setLastRequestStatus] = useState(null);
  
// //   const [selectedProfile, setSelectedProfile] = useState({
// //     visible: false,
// //     imageUrl: null,
// //     driverName: '',
// //   });

// //   const [alertVisible, setAlertVisible] = useState(false);
// //   const [alertConfig, setAlertConfig] = useState({
// //     title: "",
// //     message: "",
// //     icon: "check-circle",
// //     iconColor: "#10B981",
// //     buttons: []
// //   });

// //   const phoneNumber = user?.phone_number;
// //   const userGender = user?.gender;
// //   const requestedSeats = seats || 1;

// //   const showCustomAlert = (title, message, type = 'success') => {
// //     let icon = "check-circle";
// //     let iconColor = "#10B981";
    
// //     if (type === 'error') {
// //       icon = "error";
// //       iconColor = "#EF4444";
// //     } else if (type === 'warning') {
// //       icon = "warning";
// //       iconColor = "#F59E0B";
// //     } else if (type === 'info') {
// //       icon = "info";
// //       iconColor = Colors.primary;
// //     }
    
// //     setAlertConfig({
// //       title,
// //       message,
// //       icon,
// //       iconColor,
// //       buttons: [{ text: 'OK', onPress: () => setAlertVisible(false) }]
// //     });
// //     setAlertVisible(true);
// //   };

// //   // Debug function to check ride requests
// //   const checkUserRideRequests = useCallback(async () => {
// //     if (!phoneNumber) return;
    
// //     console.log('\n🔍 ========== CHECKING USER RIDE REQUESTS ==========');
// //     console.log(`👤 User: ${user?.full_name || user?.first_name} (${phoneNumber})`);
    
// //     try {
// //       const response = await fetch(`${API_BASE_URL}/my-ride-requests/${phoneNumber}`);
// //       const data = await response.json();
      
// //       if (data.success && data.requests) {
// //         console.log(`📊 Found ${data.requests.length} ride requests:`);
// //         data.requests.forEach((req, index) => {
// //           console.log(`\n   Request ${index + 1} (ID: ${req.id}):`);
// //           console.log(`      From: ${req.from_location.substring(0, 60)}...`);
// //           console.log(`      To: ${req.to_location.substring(0, 60)}...`);
// //           console.log(`      Status: ${req.status}`);
// //           console.log(`      Seats: ${req.seats_needed}`);
// //           console.log(`      Created: ${req.created_at}`);
// //           console.log(`      Expires: ${req.expires_at}`);
// //           if (req.notified_at) {
// //             console.log(`      Notified: ${req.notified_at}`);
// //           }
// //         });
// //       } else {
// //         console.log('📭 No ride requests found');
// //       }
// //     } catch (error) {
// //       console.log('❌ Error checking ride requests:', error);
// //     }
    
// //     console.log('🔍 ================================================\n');
// //   }, [phoneNumber, user]);

// //   // Check if current rides match any requests
// //   const checkMatchingWithCurrentRides = useCallback(async () => {
// //     if (!phoneNumber || availableRides.length === 0) return;
    
// //     console.log('\n🔍 ========== CHECKING MATCHES ==========');
// //     console.log(`📊 Available rides: ${availableRides.length}`);
// //     console.log(`📍 Current search:`);
// //     console.log(`   From: ${from}`);
// //     console.log(`   To: ${to}`);
    
// //     try {
// //       const response = await fetch(`${API_BASE_URL}/my-ride-requests/${phoneNumber}`);
// //       const data = await response.json();
      
// //       if (!data.success || !data.requests) {
// //         console.log('❌ Could not fetch ride requests');
// //         return;
// //       }
      
// //       const activeRequests = data.requests.filter(req => req.status === 'active');
// //       console.log(`\n📋 Active requests: ${activeRequests.length}`);
      
// //       if (activeRequests.length === 0) {
// //         console.log('📭 No active requests to match');
// //         console.log('🔍 ==================================\n');
// //         return;
// //       }
      
// //       // For each active request, check if any ride matches
// //       for (const req of activeRequests) {
// //         console.log(`\n📋 Checking Request ID ${req.id}:`);
// //         console.log(`   Request From: ${req.from_location.substring(0, 60)}...`);
// //         console.log(`   Request To: ${req.to_location.substring(0, 60)}...`);
        
// //         let matchedRide = null;
        
// //         for (const ride of availableRides) {
// //           const fromMatch = locationsMatch(ride.from, req.from_location);
// //           const toMatch = locationsMatch(ride.to, req.to_location);
          
// //           if (fromMatch && toMatch) {
// //             matchedRide = ride;
// //             console.log(`\n   ✅ MATCH FOUND!`);
// //             console.log(`      Ride ID: ${ride.id}`);
// //             console.log(`      Ride From: ${ride.from.substring(0, 60)}...`);
// //             console.log(`      Ride To: ${ride.to.substring(0, 60)}...`);
// //             console.log(`      Match details:`);
// //             console.log(`        - From: "${ride.from}" ≈ "${req.from_location}"`);
// //             console.log(`        - To: "${ride.to}" ≈ "${req.to_location}"`);
            
// //             // Show notification to user about the match
// //             showCustomAlert(
// //               'Ride Match Found! 🎉',
// //               `A ride matching your request "${req.from_location.split(',')[0]} → ${req.to_location.split(',')[0]}" is now available!`,
// //               'success'
// //             );
// //             break;
// //           }
// //         }
        
// //         if (!matchedRide) {
// //           console.log(`   ❌ No matching ride found for Request ${req.id}`);
          
// //           // Debug: Show normalized versions for comparison
// //           if (availableRides[0]) {
// //             console.log(`      Normalized Request From: "${normalizeLocation(req.from_location)}"`);
// //             console.log(`      Normalized Ride From: "${normalizeLocation(availableRides[0].from)}"`);
// //             console.log(`      Normalized Request To: "${normalizeLocation(req.to_location)}"`);
// //             console.log(`      Normalized Ride To: "${normalizeLocation(availableRides[0].to)}"`);
// //           }
// //         }
// //       }
      
// //     } catch (error) {
// //       console.log('❌ Error checking matches:', error);
// //     }
    
// //     console.log('🔍 ==================================\n');
// //   }, [phoneNumber, availableRides, from, to, showCustomAlert]);

// //   // Handle Ride Request Alert
// //   const handleRequestRideAlert = async () => {
// //     const userEmail = user?.email || '';
    
// //     console.log('\n📧 ========== RIDE REQUEST ALERT ==========');
// //     console.log(`👤 User: ${user?.full_name || user?.first_name} (${phoneNumber})`);
// //     console.log(`📧 User email: ${userEmail}`);
// //     console.log(`📧 Entered email: ${rideRequestEmail}`);
// //     console.log(`📍 From: ${from}`);
// //     console.log(`📍 To: ${to}`);
// //     console.log(`📅 Date/Time: ${dateTime}`);
// //     console.log(`💺 Seats needed: ${requestedSeats}`);
// //     console.log(`📝 Notes: ${rideRequestNotes || '(none)'}`);
    
// //     if (!rideRequestEmail && !userEmail) {
// //       console.log('❌ No email provided');
// //       showCustomAlert('Email Required', 'Please enter your email address to receive notifications.', 'error');
// //       return;
// //     }
    
// //     const emailToUse = rideRequestEmail || userEmail;
    
// //     if (!emailToUse.includes('@')) {
// //       console.log('❌ Invalid email format:', emailToUse);
// //       showCustomAlert('Invalid Email', 'Please enter a valid email address.', 'error');
// //       return;
// //     }
    
// //     setRideRequestLoading(true);
// //     setLastRequestStatus(null);
    
// //     try {
// //       const requestBody = {
// //         from_location: from,
// //         to_location: to,
// //         from_coords: fromCoords,
// //         to_coords: toCoords,
// //         preferred_date: dateTime,
// //         preferred_time: new Date(dateTime).toLocaleTimeString(),
// //         seats_needed: requestedSeats,
// //         passenger_phone: user?.phone_number,
// //         passenger_name: user?.full_name || user?.first_name,
// //         passenger_email: emailToUse,
// //         notes: rideRequestNotes
// //       };
      
// //       console.log('\n📤 Sending request to server:', JSON.stringify(requestBody, null, 2));
      
// //       const response = await fetch(`${API_BASE_URL}/request-ride-alert`, {
// //         method: 'POST',
// //         headers: {
// //           'Content-Type': 'application/json',
// //         },
// //         body: JSON.stringify(requestBody),
// //       });
      
// //       const result = await response.json();
// //       console.log('\n📥 Server response:', JSON.stringify(result, null, 2));
      
// //       if (result.success) {
// //         console.log('✅ Ride request created successfully!');
// //         console.log(`   Request ID: ${result.request_id}`);
// //         console.log(`   Expires at: ${result.expires_at}`);
        
// //         setLastRequestStatus({
// //           success: true,
// //           message: `Request #${result.request_id} created. We'll email you when a ride is available.`
// //         });
        
// //         showCustomAlert(
// //           'Request Submitted! 📧', 
// //           `We'll email you at ${emailToUse} when a ride matching your route is posted.\n\nRequest expires in 7 days.`,
// //           'success'
// //         );
// //         setShowRideRequestModal(false);
// //         setRideRequestEmail('');
// //         setRideRequestNotes('');
        
// //         // Check for immediate matches after creating request
// //         setTimeout(() => {
// //           fetchAvailableRides(true);
// //           checkUserRideRequests();
// //         }, 1000);
        
// //       } else {
// //         console.log('❌ Request failed:', result.message);
// //         setLastRequestStatus({
// //           success: false,
// //           message: result.message || 'Could not create ride request'
// //         });
// //         showCustomAlert('Request Failed', result.message || 'Could not create ride request', 'error');
// //       }
// //     } catch (error) {
// //       console.log('❌ Error creating ride request:', error);
// //       setLastRequestStatus({
// //         success: false,
// //         message: error.message || 'Network error'
// //       });
// //       showCustomAlert('Error', 'Could not create ride request. Please try again.', 'error');
// //     } finally {
// //       setRideRequestLoading(false);
// //       console.log('📧 ========================================\n');
// //     }
// //   };

// //   // Fetch available rides
// //   const fetchAvailableRides = useCallback(async (showRefresh = false) => {
// //     if (!searchData || !fromCoords || !toCoords || !dateTime) {
// //       console.log('⚠️ Missing search data, skipping fetch');
// //       setAvailableRides([]);
// //       setLoading(false);
// //       return;
// //     }

// //     console.log('\n🚗 ========== FETCHING RIDES ==========');
// //     console.log(`📍 From: ${from}`);
// //     console.log(`📍 To: ${to}`);
// //     console.log(`📅 Time: ${dateTime}`);
// //     console.log(`💺 Seats: ${requestedSeats}`);

// //     try {
// //       if (showRefresh) {
// //         setRefreshing(true);
// //       } else {
// //         setLoading(true);
// //       }
// //       setErrorMessage('');

// //       const requestBody = {
// //         from_location: from,
// //         to_location: to,
// //         from_coords: fromCoords,
// //         to_coords: toCoords,
// //         departure_time: new Date(dateTime).toISOString(),
// //         seats_required: requestedSeats,
// //         passenger_gender: userGender,
// //       };
      
// //       console.log('📤 Search request:', JSON.stringify(requestBody, null, 2));

// //       const response = await fetch(`${API_BASE_URL}/search-rides`, {
// //         method: 'POST',
// //         headers: {
// //           'Content-Type': 'application/json',
// //         },
// //         body: JSON.stringify(requestBody),
// //       });

// //       const rawText = await response.text();
// //       let parsedData = null;

// //       try {
// //         parsedData = rawText ? JSON.parse(rawText) : {};
// //       } catch (parseError) {
// //         parsedData = { detail: rawText || 'Unexpected server response' };
// //       }

// //       if (!response.ok) {
// //         throw new Error(parsedData?.detail || 'Failed to fetch rides');
// //       }

// //       const rides = Array.isArray(parsedData?.rides) ? parsedData.rides : [];
      
// //       console.log(`📱 Found ${rides.length} rides`);
      
// //       const ridesWithDetails = await Promise.all(
// //         rides.map(async (ride) => {
// //           let isVerified = false;
// //           let avgRating = ride.rating || 0;
// //           let profilePictureUrl = null;
          
// //           const driverPhone = ride.phoneNumber;
// //           const driverUserId = ride.driverUserId;
          
// //           if (driverPhone || driverUserId) {
// //             if (driverPhone) {
// //               const docsData = await fetchUserDocuments(driverPhone);
// //               if (docsData?.success && docsData.documents) {
// //                 isVerified = checkVerifiedDocuments(docsData.documents);
// //               }
// //             }
            
// //             const profileData = await fetchDriverProfile(driverPhone, driverUserId);
            
// //             if (profileData?.success && profileData.user) {
// //               avgRating = profileData.user.avg_rating || 0;
              
// //               const possiblePictureFields = ['profile_picture', 'profilePicture', 'profilePhoto', 'profile_image', 'avatar'];
// //               for (const field of possiblePictureFields) {
// //                 if (profileData.user[field]) {
// //                   profilePictureUrl = profileData.user[field];
// //                   break;
// //                 }
// //               }
              
// //               if (!profilePictureUrl && profileData.user.profile && profileData.user.profile.picture) {
// //                 profilePictureUrl = profileData.user.profile.picture;
// //               }
// //             }
// //           }
          
// //           if (!profilePictureUrl) {
// //             if (ride.profilePicture) profilePictureUrl = ride.profilePicture;
// //             else if (ride.profilepicture) profilePictureUrl = ride.profilepicture;
// //             else if (ride.profilePhoto) profilePictureUrl = ride.profilePhoto;
// //             else if (ride.driverProfilePicture) profilePictureUrl = ride.driverProfilePicture;
// //           }
          
// //           let finalProfilePicture = null;
// //           if (profilePictureUrl) {
// //             finalProfilePicture = buildImageUrl(profilePictureUrl);
// //           }
          
// //           let availableSeats = ride.seatsAvailable || ride.available_seats || 0;
          
// //           return { 
// //             ...ride, 
// //             isVerified, 
// //             rating: avgRating,
// //             profilePicture: finalProfilePicture,
// //             profilepicture: finalProfilePicture,
// //             profilePhoto: finalProfilePicture,
// //             pickupLabel: ride.pickupLabel || ride.pickupLocationName || ride.fromLocationName || ride.from || 'Pickup point',
// //             dropLabel: ride.dropLabel || ride.dropLocationName || ride.toLocationName || ride.to || 'Drop point',
// //             womenOnly: ride.womenOnly === true || ride.women_only === true,
// //             seatsAvailable: availableSeats,
// //             requestedSeats: requestedSeats,
// //             isFull: availableSeats === 0,
// //           };
// //         })
// //       );
      
// //       setAvailableRides(ridesWithDetails);
// //       console.log(`✅ Loaded ${ridesWithDetails.length} rides with details`);
      
// //       // After loading rides, check for matches
// //       setTimeout(() => {
// //         checkMatchingWithCurrentRides();
// //       }, 500);
      
// //     } catch (error) {
// //       console.log('❌ search-rides error:', error);
// //       setAvailableRides([]);
// //       setErrorMessage(error.message || 'Failed to search rides');
// //       showCustomAlert('Search Error', error.message || 'Failed to search rides', 'error');
// //     } finally {
// //       setLoading(false);
// //       setRefreshing(false);
// //       console.log('🚗 ==================================\n');
// //     }
// //   }, [searchData, from, to, fromCoords, toCoords, dateTime, requestedSeats, userGender, checkMatchingWithCurrentRides]);

// //   const loadPreferenceData = useCallback(async () => {
// //     try {
// //       const defs = await DatabaseService.getMatchingPreferenceMaster();
// //       setPreferenceMaster(defs || []);

// //       if (phoneNumber) {
// //         const saved = await DatabaseService.getUserMatchingPreferences(phoneNumber);
// //         setUserPreferences(saved || {});
// //       }
// //     } catch (e) {
// //       console.log('❌ preference load error:', e);
// //     }
// //   }, [phoneNumber]);

// //   // Initial load
// //   useEffect(() => {
// //     if (authLoading) return;
// //     console.log('\n🚀 Component mounted, loading data...');
// //     fetchAvailableRides();
// //     loadPreferenceData();
// //     checkUserRideRequests();
// //   }, [authLoading]);

// //   // Manual refresh
// //   const onRefresh = useCallback(() => {
// //     console.log('🔄 Manual refresh triggered');
// //     fetchAvailableRides(true);
// //     checkUserRideRequests();
// //   }, [fetchAvailableRides, checkUserRideRequests]);

// //   const quickFilterOptions = useMemo(() => {
// //     const defs = preferenceMaster.filter(pref => QUICK_FILTER_KEYS.includes(pref.key));
// //     return defs.slice(0, 3).map(pref => ({
// //       key: pref.key,
// //       label: QUICK_FILTER_LABELS[pref.key] || pref.label,
// //     }));
// //   }, [preferenceMaster]);

// //   const advancedFilterOptions = useMemo(() => {
// //     return preferenceMaster.filter(pref => {
// //       if (!pref?.key) return false;
// //       if (quickFilterOptions.some(q => q.key === pref.key)) return false;
// //       return ['toggle', 'single_select'].includes(pref.input_type);
// //     });
// //   }, [preferenceMaster, quickFilterOptions]);

// //   const processedRides = useMemo(() => {
// //     let rides = [...availableRides];

// //     if (userGender !== 'female') {
// //       rides = rides.filter(item => {
// //         const isWomenOnly = item.womenOnly === true;
// //         if (isWomenOnly) {
// //           console.log('🚫 Filtering out women-only ride:', item.id);
// //         }
// //         return !isWomenOnly;
// //       });
// //     }

// //     if (quickFilters.length > 0) {
// //       rides = rides.filter(item =>
// //         quickFilters.every(key => matchesQuickFilter(item, key))
// //       );
// //     }

// //     const activeAdvanced = Object.entries(advancedFilters).filter(
// //       ([, value]) =>
// //         value !== '' &&
// //         value !== null &&
// //         value !== undefined &&
// //         value !== false
// //     );

// //     if (activeAdvanced.length > 0) {
// //       rides = rides.filter(item =>
// //         activeAdvanced.every(([key, value]) =>
// //           matchesAdvancedFilter(item, key, value)
// //         )
// //       );
// //     }

// //     rides.sort((a, b) => {
// //       if (sortBy === 'price') return (a.price || 0) - (b.price || 0);
// //       if (sortBy === 'rating') return (b.rating || 0) - (a.rating || 0);
// //       if (sortBy === 'match') return (b.matchPercentage || 0) - (a.matchPercentage || 0);

// //       const aDate = new Date(`${a.date || ''} ${a.time || ''}`);
// //       const bDate = new Date(`${b.date || ''} ${b.time || ''}`);
// //       if (!isNaN(aDate) && !isNaN(bDate)) return aDate - bDate;
// //       return 0;
// //     });

// //     return rides;
// //   }, [availableRides, quickFilters, advancedFilters, sortBy, userGender]);

// //   const handleCardPress = (ride) => {
// //     const pickupAddress = searchData?.fromAddress || ride.from || '';
// //     const dropoffAddress = searchData?.toAddress || ride.to || '';
// //     const pickupPlaceName = searchData?.fromPlaceName || ride.pickupLabel || ride.from?.split(',')[0] || '';
// //     const dropoffPlaceName = searchData?.toPlaceName || ride.dropLabel || ride.to?.split(',')[0] || '';
    
// //     navigation.navigate('RideDetailScreen', {
// //       ride: ride,
// //       searchData: {
// //         fromCoords: fromCoords,
// //         toCoords: toCoords,
// //         fromAddress: pickupAddress,
// //         toAddress: dropoffAddress,
// //         fromPlaceName: pickupPlaceName,
// //         toPlaceName: dropoffPlaceName,
// //         date: dateTime,
// //         time: new Date(dateTime).toLocaleTimeString(),
// //         seats: requestedSeats
// //       }
// //     });
// //   };

// //   const toggleQuickFilter = (key) => {
// //     setQuickFilters(prev =>
// //       prev.includes(key) ? prev.filter(i => i !== key) : [...prev, key]
// //     );
// //   };

// //   const clearAllFilters = () => {
// //     setQuickFilters([]);
// //     setAdvancedFilters({});
// //     showCustomAlert('Filters Cleared', 'All filters have been reset.', 'info');
// //   };

// //   const renderAdvancedFilterControl = (pref) => {
// //     const currentValue = advancedFilters[pref.key];

// //     if (pref.input_type === 'toggle') {
// //       const active = !!currentValue;
// //       return (
// //         <TouchableOpacity
// //           activeOpacity={0.85}
// //           style={[styles.modalToggleChip, active && styles.modalToggleChipActive]}
// //           onPress={() =>
// //             setAdvancedFilters(prev => ({ ...prev, [pref.key]: !active }))
// //           }
// //         >
// //           <Text
// //             style={[
// //               styles.modalToggleChipText,
// //               active && styles.modalToggleChipTextActive,
// //             ]}
// //           >
// //             {pref.label}
// //           </Text>
// //         </TouchableOpacity>
// //       );
// //     }

// //     if (pref.input_type === 'single_select' && Array.isArray(pref.options)) {
// //       return (
// //         <View style={styles.modalOptionWrap}>
// //           {pref.options.map((opt) => {
// //             const active = currentValue === opt;
// //             return (
// //               <TouchableOpacity
// //                 key={opt}
// //                 activeOpacity={0.85}
// //                 style={[
// //                   styles.modalOptionChip,
// //                   active && styles.modalOptionChipActive,
// //                 ]}
// //                 onPress={() =>
// //                   setAdvancedFilters(prev => ({
// //                     ...prev,
// //                     [pref.key]: active ? '' : opt,
// //                   }))
// //                 }
// //               >
// //                 <Text
// //                   style={[
// //                     styles.modalOptionChipText,
// //                     active && styles.modalOptionChipTextActive,
// //                   ]}
// //                 >
// //                   {opt}
// //                 </Text>
// //               </TouchableOpacity>
// //             );
// //           })}
// //         </View>
// //       );
// //     }

// //     return null;
// //   };

// //   // Ride Request Modal Component
// //   const RideRequestModal = () => {
// //     const userEmail = user?.email || '';
    
// //     return (
// //       <Modal
// //         visible={showRideRequestModal}
// //         transparent={true}
// //         animationType="slide"
// //         onRequestClose={() => setShowRideRequestModal(false)}
// //       >
// //         <View style={styles.modalBackdrop}>
// //           <TouchableOpacity 
// //             style={styles.modalOverlay} 
// //             activeOpacity={1} 
// //             onPress={() => setShowRideRequestModal(false)} 
// //           />
          
// //           <View style={styles.requestModalSheet}>
// //             <View style={styles.modalHandle} />
            
// //             <View style={styles.modalHeader}>
// //               <Text style={styles.modalTitle}>Request Ride Alert</Text>
// //               <TouchableOpacity onPress={() => setShowRideRequestModal(false)}>
// //                 <Ionicons name="close" size={24} color={Colors.dark} />
// //               </TouchableOpacity>
// //             </View>
            
// //             <ScrollView showsVerticalScrollIndicator={false}>
// //               <View style={styles.requestModalContent}>
// //                 <View style={styles.requestInfoBox}>
// //                   <Ionicons name="information-circle" size={20} color={Colors.primary} />
// //                   <Text style={styles.requestInfoText}>
// //                     No rides found for this route. We'll email you when a ride becomes available.
// //                   </Text>
// //                 </View>
                
// //                 <View style={styles.requestRouteBox}>
// //                   <Text style={styles.requestRouteLabel}>Route:</Text>
// //                   <Text style={styles.requestRouteText}>
// //                     {from} → {to}
// //                   </Text>
// //                   <Text style={styles.requestRouteDetail}>
// //                     {new Date(dateTime).toLocaleDateString()} at {new Date(dateTime).toLocaleTimeString()}
// //                   </Text>
// //                   <Text style={styles.requestRouteDetail}>
// //                     {requestedSeats} seat{requestedSeats !== 1 ? 's' : ''} needed
// //                   </Text>
// //                 </View>
                
// //                 <View style={styles.requestInputGroup}>
// //                   <Text style={styles.requestLabel}>Email Address *</Text>
// //                   <TextInput
// //                     style={styles.requestInput}
// //                     placeholder="Enter your email"
// //                     value={rideRequestEmail}
// //                     onChangeText={setRideRequestEmail}
// //                     keyboardType="email-address"
// //                     autoCapitalize="none"
// //                     autoComplete="email"
// //                   />
// //                   {userEmail && !rideRequestEmail && (
// //                     <Text style={styles.requestHelper}>
// //                       Using your registered email: {userEmail}
// //                     </Text>
// //                   )}
// //                   <Text style={styles.requestHelper}>
// //                     We'll notify you at this email when rides are posted
// //                   </Text>
// //                 </View>
                
// //                 <View style={styles.requestInputGroup}>
// //                   <Text style={styles.requestLabel}>Additional Notes (Optional)</Text>
// //                   <TextInput
// //                     style={[styles.requestInput, styles.requestTextArea]}
// //                     placeholder="Any preferences or special requirements?"
// //                     value={rideRequestNotes}
// //                     onChangeText={setRideRequestNotes}
// //                     multiline
// //                     numberOfLines={3}
// //                     textAlignVertical="top"
// //                   />
// //                 </View>
                
// //                 <View style={styles.requestNoteBox}>
// //                   <Ionicons name="time-outline" size={16} color={Colors.gray} />
// //                   <Text style={styles.requestNoteText}>
// //                     Your request will remain active for 7 days. You can cancel it anytime in your profile.
// //                   </Text>
// //                 </View>
// //               </View>
// //             </ScrollView>
            
// //             <View style={styles.modalFooter}>
// //               <TouchableOpacity
// //                 style={styles.modalSecondaryBtn}
// //                 onPress={() => setShowRideRequestModal(false)}
// //               >
// //                 <Text style={styles.modalSecondaryBtnText}>Cancel</Text>
// //               </TouchableOpacity>
              
// //               <TouchableOpacity
// //                 style={[styles.modalPrimaryBtn, rideRequestLoading && styles.disabledButton]}
// //                 onPress={handleRequestRideAlert}
// //                 disabled={rideRequestLoading}
// //               >
// //                 {rideRequestLoading ? (
// //                   <ActivityIndicator size="small" color={Colors.white} />
// //                 ) : (
// //                   <Text style={styles.modalPrimaryBtnText}>Get Email Alert</Text>
// //                 )}
// //               </TouchableOpacity>
// //             </View>
// //           </View>
// //         </View>
// //       </Modal>
// //     );
// //   };

// //   const renderRideCard = ({ item }) => {
// //     let profilePhotoUrl = null;
// //     let isSvg = false;
    
// //     if (item.profilePicture) {
// //       profilePhotoUrl = buildImageUrl(item.profilePicture);
// //     } else if (item.profilepicture) {
// //       profilePhotoUrl = buildImageUrl(item.profilepicture);
// //     } else if (item.profilePhoto) {
// //       profilePhotoUrl = buildImageUrl(item.profilePhoto);
// //     } else if (item.driverProfilePicture) {
// //       profilePhotoUrl = buildImageUrl(item.driverProfilePicture);
// //     } else if (item.driver?.profile_picture) {
// //       profilePhotoUrl = buildImageUrl(item.driver.profile_picture);
// //     } else if (item.user?.profile_picture) {
// //       profilePhotoUrl = buildImageUrl(item.user.profile_picture);
// //     }
    
// //     if (profilePhotoUrl && profilePhotoUrl.toLowerCase().includes('.svg')) {
// //       isSvg = true;
// //     }
    
// //     const driverNameText = item.driverName || item.driver_name || item.driver?.full_name || 'Driver';
// //     const avatarText = getDriverInitials(driverNameText);

// //     let vehicleLabel = 'Vehicle details unavailable';
// //     if (item.vehicle) {
// //       const vehicleParts = [];
// //       if (item.vehicle.model) vehicleParts.push(item.vehicle.model);
// //       if (item.vehicle.color && vehicleParts.length > 0) {
// //         vehicleLabel = `${vehicleParts.join(' ')} - ${item.vehicle.color}`;
// //       } else if (item.vehicle.color) {
// //         vehicleLabel = item.vehicle.color;
// //       } else if (vehicleParts.length > 0) {
// //         vehicleLabel = vehicleParts.join(' ');
// //       }
// //     } else if (item.vehicleModel) {
// //       vehicleLabel = item.vehicleModel;
// //       if (item.vehicleColor) {
// //         vehicleLabel = `${item.vehicleModel} - ${item.vehicleColor}`;
// //       }
// //     }

// //     const preferenceBadges = extractPreferenceBadges(item);
// //     const isDriverVerified = item.isVerified;
// //     const driverRating = item.rating || 0;

// //     const pickupName = item.pickupLabel || item.from || 'Pickup point';
// //     const dropName = item.dropLabel || item.to || 'Drop point';
    
// //     const seatsAvailable = item.seatsAvailable || 0;
// //     const isSeatsInsufficient = requestedSeats > seatsAvailable && seatsAvailable > 0;
// //     const isFull = seatsAvailable === 0;
// //     const canBook = !isFull && seatsAvailable >= requestedSeats;

// //     return (
// //       <TouchableOpacity
// //         style={[styles.rideCard, !canBook && !isFull && styles.rideCardWarning, isFull && styles.rideCardFull]}
// //         onPress={() => handleCardPress(item)}
// //         activeOpacity={0.9}
// //       >
// //         <View style={styles.cardTopRow}>
// //           <View style={styles.profileRow}>
// //             <TouchableOpacity
// //               onPress={() => handleCardPress(item)}
// //               activeOpacity={0.8}
// //             >
// //               <View style={styles.avatarContainer}>
// //                 {profilePhotoUrl ? (
// //                   isSvg ? (
// //                     <View style={styles.svgContainer}>
// //                       <SvgCssUri
// //                         uri={profilePhotoUrl}
// //                         width="48"
// //                         height="48"
// //                       />
// //                     </View>
// //                   ) : (
// //                     <Image
// //                       source={{ uri: profilePhotoUrl }}
// //                       style={styles.avatarImage}
// //                       resizeMode="cover"
// //                     />
// //                   )
// //                 ) : (
// //                   <View style={styles.initialsContainer}>
// //                     <Text style={styles.avatarFallback}>{avatarText}</Text>
// //                   </View>
// //                 )}
// //               </View>
// //             </TouchableOpacity>

// //             <View style={styles.profileContent}>
// //               <View style={styles.nameRow}>
// //                 <Text style={styles.driverName} numberOfLines={1}>
// //                   {driverNameText}
// //                 </Text>

// //                 {isDriverVerified && (
// //                   <View style={styles.verifiedBadge}>
// //                     <Ionicons name="checkmark-circle" size={14} color="#16A34A" />
// //                     <Text style={styles.verifiedText}>Verified</Text>
// //                   </View>
// //                 )}

// //                 {item.womenOnly === true && (
// //                   <View style={styles.womenOnlyBadge}>
// //                     <Ionicons name="woman" size={12} color="#E91E63" />
// //                     <Text style={styles.womenOnlyBadgeText}>Women Only</Text>
// //                   </View>
// //                 )}
                
// //                 {isFull && (
// //                   <View style={styles.fullBadge}>
// //                     <Ionicons name="close-circle" size={12} color="#EF4444" />
// //                     <Text style={styles.fullBadgeText}>Full</Text>
// //                   </View>
// //                 )}
// //               </View>

// //               <View style={styles.ratingRow}>
// //                 <RatingStars rating={driverRating} size={12} showLabel={true} />
// //               </View>
// //             </View>
// //           </View>

// //           <View style={styles.priceMatchWrap}>
// //             <View style={styles.matchBadge}>
// //               <Text style={styles.matchText}>{item.matchPercentage || 0}%</Text>
// //             </View>
// //             <Text style={styles.priceText}>₹{item.price}</Text>
// //             <Text style={styles.perSeatText}>per seat</Text>
// //           </View>
// //         </View>

// //         <View style={styles.infoRow}>
// //           <View style={styles.infoItem}>
// //             <Ionicons name="calendar-outline" size={13} color={Colors.gray} />
// //             <Text style={styles.infoText} numberOfLines={1}>{item.date}</Text>
// //           </View>
// //           <View style={styles.infoDot} />
// //           <View style={styles.infoItem}>
// //             <Ionicons name="time-outline" size={13} color={Colors.gray} />
// //             <Text style={styles.infoText} numberOfLines={1}>{item.time}</Text>
// //           </View>
// //           <View style={styles.infoDot} />
// //           <View style={styles.infoItem}>
// //             <Ionicons name="people-outline" size={13} color={Colors.gray} />
// //             <Text style={[
// //               styles.infoText, 
// //               isFull ? styles.fullText : (isSeatsInsufficient && styles.warningText)
// //             ]} numberOfLines={1}>
// //               {isFull ? 'Ride Full' : `${seatsAvailable} left`}
// //             </Text>
// //           </View>
// //         </View>

// //         {isFull && (
// //           <View style={styles.fullWarningContainer}>
// //             <Ionicons name="close-circle" size={14} color="#EF4444" />
// //             <Text style={styles.fullWarningText}>
// //               This ride is currently full. Check back later or try another ride.
// //             </Text>
// //           </View>
// //         )}

// //         {!isFull && isSeatsInsufficient && seatsAvailable > 0 && (
// //           <View style={styles.seatWarningContainer}>
// //             <Ionicons name="warning" size={14} color="#D97706" />
// //             <Text style={styles.seatWarningText}>
// //               Only {seatsAvailable} seat{seatsAvailable !== 1 ? 's' : ''} left. You requested {requestedSeats} seat{requestedSeats !== 1 ? 's' : ''}.
// //             </Text>
// //           </View>
// //         )}

// //         <View style={styles.divider} />

// //         <View style={styles.routeBlock}>
// //           <View style={styles.routeRow}>
// //             <View style={[styles.routeDot, { backgroundColor: '#22C55E' }]} />
// //             <View style={styles.routeTextWrap}>
// //               <Text style={styles.routeLabel}>Pickup</Text>
// //               <Text style={styles.routeText} numberOfLines={2}>{pickupName}</Text>
// //             </View>
// //           </View>
// //           <View style={styles.routeRow}>
// //             <View style={[styles.routeDot, { backgroundColor: '#F97316' }]} />
// //             <View style={styles.routeTextWrap}>
// //               <Text style={styles.routeLabel}>Drop</Text>
// //               <Text style={styles.routeText} numberOfLines={2}>{dropName}</Text>
// //             </View>
// //           </View>
// //         </View>

// //         <View style={styles.vehicleRow}>
// //           <Ionicons name="car-sport-outline" size={14} color={Colors.gray} />
// //           <Text style={styles.vehicleText} numberOfLines={1}>{vehicleLabel}</Text>
// //         </View>

// //         {preferenceBadges.length > 0 && (
// //           <ScrollView
// //             horizontal
// //             showsHorizontalScrollIndicator={false}
// //             contentContainerStyle={styles.badgeScroll}
// //           >
// //             {preferenceBadges.map((badge, index) => (
// //               <PreferenceTag key={`${badge}-${index}`} label={badge} />
// //             ))}
// //           </ScrollView>
// //         )}
// //       </TouchableOpacity>
// //     );
// //   };

// //   if (authLoading || loading) {
// //     return (
// //       <View style={styles.loadingContainer}>
// //         <LottieView
// //           source={require("../assets/loading.json")}
// //           autoPlay
// //           loop
// //           style={{ width: 300, height: 300 }}
// //         />
// //       </View>
// //     );
// //   }

// //   return (
// //     <SafeAreaView style={styles.container}>
// //       <StatusBar barStyle="dark-content" backgroundColor={Colors.white} />

// //       <View style={styles.header}>
// //         <TouchableOpacity
// //           style={styles.backButton}
// //           onPress={() => navigation.goBack()}
// //         >
// //           <MaterialIcons name="arrow-back-ios" size={24} color="#ED7117" />
// //         </TouchableOpacity>

// //         <Text style={styles.headerTitle}>Available Rides</Text>

// //         <TouchableOpacity
// //           style={[
// //             styles.filterButton,
// //             headerFiltersVisible && styles.filterButtonActive
// //           ]}
// //           onPress={() => setHeaderFiltersVisible(prev => !prev)}
// //         >
// //           <Ionicons name="options-outline" size={22} color="#ED7117" />
// //         </TouchableOpacity>
// //       </View>

// //       {/* Debug Status Banner */}
// //       {lastRequestStatus && (
// //         <View style={[
// //           styles.debugBanner,
// //           lastRequestStatus.success ? styles.debugBannerSuccess : styles.debugBannerError
// //         ]}>
// //           <Ionicons 
// //             name={lastRequestStatus.success ? "checkmark-circle" : "alert-circle"} 
// //             size={18} 
// //             color={lastRequestStatus.success ? "#166534" : "#991B1B"} 
// //           />
// //           <Text style={[
// //             styles.debugBannerText,
// //             lastRequestStatus.success ? styles.debugBannerTextSuccess : styles.debugBannerTextError
// //           ]}>
// //             {lastRequestStatus.message}
// //           </Text>
// //           <TouchableOpacity onPress={() => setLastRequestStatus(null)}>
// //             <Ionicons name="close" size={16} color={lastRequestStatus.success ? "#166534" : "#991B1B"} />
// //           </TouchableOpacity>
// //         </View>
// //       )}

// //       {headerFiltersVisible ? (
// //         <View style={styles.topControlsWrap}>
// //           <ScrollView
// //             horizontal
// //             showsHorizontalScrollIndicator={false}
// //             contentContainerStyle={styles.filterScroll}
// //           >
// //             {quickFilterOptions.map((filter) => {
// //               const active = quickFilters.includes(filter.key);
// //               return (
// //                 <TouchableOpacity
// //                   key={filter.key}
// //                   activeOpacity={0.85}
// //                   style={[styles.quickChip, active && styles.quickChipActive]}
// //                   onPress={() => toggleQuickFilter(filter.key)}
// //                 >
// //                   <Text
// //                     style={[
// //                       styles.quickChipText,
// //                       active && styles.quickChipTextActive,
// //                     ]}
// //                   >
// //                     {filter.label}
// //                   </Text>
// //                 </TouchableOpacity>
// //               );
// //             })}

// //             <TouchableOpacity
// //               activeOpacity={0.85}
// //               style={styles.moreFilterChip}
// //               onPress={() => setFilterModalVisible(true)}
// //             >
// //               <Ionicons name="options-outline" size={14} color="#ED7117" />
// //               <Text style={styles.moreFilterChipText}>More Filters</Text>
// //             </TouchableOpacity>
// //           </ScrollView>

// //           <Text style={styles.sortLabel}>Sort by</Text>

// //           <ScrollView
// //             horizontal
// //             showsHorizontalScrollIndicator={false}
// //             contentContainerStyle={styles.sortScroll}
// //           >
// //             {SORT_OPTIONS.map((option) => {
// //               const active = sortBy === option.key;
// //               return (
// //                 <TouchableOpacity
// //                   key={option.key}
// //                   activeOpacity={0.85}
// //                   style={[styles.sortChip, active && styles.sortChipActive]}
// //                   onPress={() => setSortBy(option.key)}
// //                 >
// //                   <Text
// //                     style={[
// //                       styles.sortChipText,
// //                       active && styles.sortChipTextActive,
// //                     ]}
// //                   >
// //                     {option.label}
// //                   </Text>
// //                 </TouchableOpacity>
// //               );
// //             })}
// //           </ScrollView>
// //         </View>
// //       ) : null}

// //       {processedRides.length === 0 ? (
// //         <View style={styles.emptyContainer}>
// //           <Ionicons name="car-outline" size={80} color={Colors.gray} />
// //           <Text style={styles.emptyTitle}>No Rides Found</Text>
// //           <Text style={styles.emptySubtitle}>
// //             {errorMessage
// //               ? errorMessage
// //               : 'No rides available for this route at the selected time.'}
// //           </Text>

// //           <TouchableOpacity 
// //             style={styles.requestAlertButton} 
// //             onPress={() => setShowRideRequestModal(true)}
// //           >
// //             <Ionicons name="notifications-outline" size={20} color={Colors.white} />
// //             <Text style={styles.requestAlertButtonText}>Notify me when a ride is available</Text>
// //           </TouchableOpacity>

// //           <TouchableOpacity style={styles.clearButton} onPress={clearAllFilters}>
// //             <Text style={styles.clearButtonText}>Clear Filters</Text>
// //           </TouchableOpacity>
// //         </View>
// //       ) : (
// //         <FlatList
// //           data={processedRides}
// //           renderItem={renderRideCard}
// //           keyExtractor={(item) => String(item.id)}
// //           contentContainerStyle={styles.listContent}
// //           showsVerticalScrollIndicator={false}
// //           refreshControl={
// //             <RefreshControl
// //               refreshing={refreshing}
// //               onRefresh={onRefresh}
// //               colors={[Colors.primary]}
// //               tintColor={Colors.primary}
// //             />
// //           }
// //           ItemSeparatorComponent={() => <View style={{ height: 12 }} />}
// //         />
// //       )}

// //       <Modal
// //         visible={filterModalVisible}
// //         transparent
// //         animationType="slide"
// //         onRequestClose={() => setFilterModalVisible(false)}
// //       >
// //         <View style={styles.modalBackdrop}>
// //           <TouchableOpacity
// //             style={styles.modalOverlay}
// //             activeOpacity={1}
// //             onPress={() => setFilterModalVisible(false)}
// //           />

// //           <View style={styles.modalSheet}>
// //             <View style={styles.modalHandle} />

// //             <View style={styles.modalHeader}>
// //               <Text style={styles.modalTitle}>More Filters</Text>
// //               <TouchableOpacity onPress={() => setFilterModalVisible(false)}>
// //                 <Ionicons name="close" size={24} color={Colors.dark} />
// //               </TouchableOpacity>
// //             </View>

// //             <ScrollView
// //               showsVerticalScrollIndicator={false}
// //               contentContainerStyle={styles.modalContent}
// //             >
// //               {advancedFilterOptions.map((pref) => (
// //                 <View key={pref.key} style={styles.modalSection}>
// //                   <Text style={styles.modalSectionTitle}>{pref.label}</Text>
// //                   {renderAdvancedFilterControl(pref)}
// //                 </View>
// //               ))}
// //             </ScrollView>

// //             <View style={styles.modalFooter}>
// //               <TouchableOpacity
// //                 style={styles.modalSecondaryBtn}
// //                 onPress={clearAllFilters}
// //               >
// //                 <Text style={styles.modalSecondaryBtnText}>Clear</Text>
// //               </TouchableOpacity>

// //               <TouchableOpacity
// //                 style={styles.modalPrimaryBtn}
// //                 onPress={() => setFilterModalVisible(false)}
// //               >
// //                 <Text style={styles.modalPrimaryBtnText}>Apply Filters</Text>
// //               </TouchableOpacity>
// //             </View>
// //           </View>
// //         </View>
// //       </Modal>

// //       {/* Ride Request Modal */}
// //       <RideRequestModal />

// //       <ProfileImageModal
// //         visible={selectedProfile.visible}
// //         imageUrl={selectedProfile.imageUrl}
// //         driverName={selectedProfile.driverName}
// //         onClose={() => setSelectedProfile({ visible: false, imageUrl: null, driverName: '' })}
// //       />

// //       <CustomAlert
// //         visible={alertVisible}
// //         title={alertConfig.title}
// //         message={alertConfig.message}
// //         icon={alertConfig.icon}
// //         iconColor={alertConfig.iconColor}
// //         buttons={alertConfig.buttons}
// //         onBackdropPress={() => setAlertVisible(false)}
// //       />
// //     </SafeAreaView>
// //   );
// // }

// // const styles = StyleSheet.create({
// //   container: {
// //     flex: 1,
// //     backgroundColor: '#fff',
// //   },
// //   header: {
// //     flexDirection: 'row',
// //     alignItems: 'center',
// //     paddingHorizontal: 16,
// //     paddingVertical: 12,
// //     borderBottomWidth: 0.5,
// //     borderBottomColor: '#fff',
// //     backgroundColor: Colors.white,
// //   },
// //   backButton: {
// //     width: 44,
// //     height: 44,
// //     justifyContent: 'center',
// //   },
// //   filterButton: {
// //     width: 44,
// //     height: 44,
// //     justifyContent: 'center',
// //     alignItems: 'center',
// //     borderRadius: 22,
// //   },
// //   filterButtonActive: {
// //     backgroundColor: '#fff',
// //   },
// //   headerTitle: {
// //     ...Typography.h2,
// //     fontSize: 28,
// //     fontWeight: '700',
// //     color: Colors.primary,
// //     flex: 1,
// //     textAlign: 'center',
// //   },
// //   topControlsWrap: {
// //     backgroundColor: Colors.white,
// //     paddingTop: 10,
// //     paddingBottom: 12,
// //     borderBottomWidth: 1,
// //     borderBottomColor: '#EEF2F7',
// //   },
// //   filterScroll: {
// //     paddingHorizontal: 16,
// //     gap: 10,
// //   },
// //   quickChip: {
// //     paddingHorizontal: 14,
// //     paddingVertical: 10,
// //     borderRadius: 20,
// //     backgroundColor: '#F3F4F6',
// //   },
// //   quickChipActive: {
// //     backgroundColor: Colors.primary,
// //   },
// //   quickChipText: {
// //     fontSize: 12,
// //     fontWeight: '600',
// //     color: Colors.dark,
// //   },
// //   quickChipTextActive: {
// //     color: Colors.white,
// //   },
// //   moreFilterChip: {
// //     flexDirection: 'row',
// //     alignItems: 'center',
// //     gap: 6,
// //     paddingHorizontal: 14,
// //     paddingVertical: 10,
// //     borderRadius: 20,
// //     backgroundColor: '#EEF6FF',
// //   },
// //   moreFilterChipText: {
// //     fontSize: 12,
// //     fontWeight: '700',
// //     color: '#ED7117',
// //   },
// //   sortLabel: {
// //     paddingHorizontal: 16,
// //     marginTop: 12,
// //     marginBottom: 8,
// //     fontSize: 12,
// //     color: Colors.gray,
// //     fontWeight: '700',
// //   },
// //   sortScroll: {
// //     paddingHorizontal: 16,
// //     gap: 10,
// //   },
// //   sortChip: {
// //     paddingHorizontal: 14,
// //     paddingVertical: 8,
// //     borderRadius: 14,
// //     backgroundColor: '#F3F4F6',
// //   },
// //   sortChipActive: {
// //     backgroundColor: '#ED7117',
// //   },
// //   sortChipText: {
// //     fontSize: 12,
// //     color: Colors.dark,
// //     fontWeight: '600',
// //   },
// //   sortChipTextActive: {
// //     color: Colors.white,
// //   },
// //   listContent: {
// //     padding: 16,
// //     paddingBottom: 28,
// //   },
// //   rideCard: {
// //     backgroundColor: Colors.white,
// //     borderRadius: 18,
// //     padding: 14,
// //     borderWidth: 1,
// //     borderColor: '#EEF2F7',
// //     shadowColor: '#0F172A',
// //     shadowOffset: { width: 0, height: 6 },
// //     shadowOpacity: 0.05,
// //     shadowRadius: 14,
// //     elevation: 2,
// //   },
// //   rideCardWarning: {
// //     backgroundColor: '#FFFBEB',
// //     borderColor: '#FDE68A',
// //   },
// //   rideCardFull: {
// //     backgroundColor: '#FEF2F2',
// //     borderColor: '#FEE2E2',
// //     opacity: 0.85,
// //   },
// //   cardTopRow: {
// //     flexDirection: 'row',
// //     justifyContent: 'space-between',
// //     alignItems: 'flex-start',
// //   },
// //   profileRow: {
// //     flexDirection: 'row',
// //     flex: 1,
// //     paddingRight: 10,
// //   },
// //   avatarContainer: {
// //     width: 48,
// //     height: 48,
// //     borderRadius: 24,
// //     backgroundColor: '#E5E7EB',
// //     alignItems: 'center',
// //     justifyContent: 'center',
// //     overflow: 'hidden',
// //     marginRight: 10,
// //   },
// //   avatarImage: {
// //     width: 48,
// //     height: 48,
// //   },
// //   avatarFallback: {
// //     fontSize: 14,
// //     fontWeight: '800',
// //     color: Colors.gray,
// //   },
// //   profileContent: {
// //     flex: 1,
// //   },
// //   nameRow: {
// //     flexDirection: 'row',
// //     alignItems: 'center',
// //     flexWrap: 'wrap',
// //     gap: 6,
// //   },
// //   driverName: {
// //     fontSize: 15,
// //     fontWeight: '800',
// //     color: Colors.dark,
// //     maxWidth: '100%',
// //   },
// //   verifiedBadge: {
// //     flexDirection: 'row',
// //     alignItems: 'center',
// //     gap: 4,
// //     backgroundColor: '#E8F5E9',
// //     paddingHorizontal: 6,
// //     paddingVertical: 2,
// //     borderRadius: 12,
// //   },
// //   verifiedText: {
// //     fontSize: 10,
// //     fontWeight: '700',
// //     color: '#16A34A',
// //   },
// //   womenOnlyBadge: {
// //     flexDirection: 'row',
// //     alignItems: 'center',
// //     gap: 4,
// //     backgroundColor: '#FCE4EC',
// //     paddingHorizontal: 8,
// //     paddingVertical: 3,
// //     borderRadius: 12,
// //   },
// //   womenOnlyBadgeText: {
// //     fontSize: 10,
// //     color: '#E91E63',
// //     fontWeight: '700',
// //   },
// //   fullBadge: {
// //     flexDirection: 'row',
// //     alignItems: 'center',
// //     gap: 4,
// //     backgroundColor: '#FEF2F2',
// //     paddingHorizontal: 8,
// //     paddingVertical: 3,
// //     borderRadius: 12,
// //     borderWidth: 1,
// //     borderColor: '#FEE2E2',
// //   },
// //   fullBadgeText: {
// //     fontSize: 10,
// //     color: '#EF4444',
// //     fontWeight: '700',
// //   },
// //   ratingRow: {
// //     flexDirection: 'row',
// //     alignItems: 'center',
// //     marginTop: 4,
// //   },
// //   ratingText: {
// //     fontSize: 11,
// //     color: Colors.gray,
// //     fontWeight: '600',
// //   },
// //   priceMatchWrap: {
// //     alignItems: 'flex-end',
// //   },
// //   matchBadge: {
// //     backgroundColor: '#EEF6FF',
// //     paddingHorizontal: 8,
// //     paddingVertical: 4,
// //     borderRadius: 10,
// //     marginBottom: 6,
// //   },
// //   matchText: {
// //     fontSize: 12,
// //     fontWeight: '800',
// //     color: Colors.primary,
// //   },
// //   priceText: {
// //     fontSize: 18,
// //     fontWeight: '800',
// //     color: '#ED7117',
// //     lineHeight: 20,
// //   },
// //   perSeatText: {
// //     fontSize: 10,
// //     color: Colors.gray,
// //     fontWeight: '600',
// //     marginTop: 2,
// //   },
// //   infoRow: {
// //     flexDirection: 'row',
// //     alignItems: 'center',
// //     flexWrap: 'wrap',
// //     marginTop: 12,
// //     marginBottom: 10,
// //   },
// //   infoItem: {
// //     flexDirection: 'row',
// //     alignItems: 'center',
// //     gap: 4,
// //   },
// //   infoText: {
// //     fontSize: 12,
// //     color: Colors.dark,
// //     fontWeight: '600',
// //   },
// //   warningText: {
// //     color: '#F59E0B',
// //   },
// //   fullText: {
// //     color: '#EF4444',
// //   },
// //   infoDot: {
// //     width: 4,
// //     height: 4,
// //     borderRadius: 2,
// //     backgroundColor: '#CBD5E1',
// //     marginHorizontal: 8,
// //   },
// //   seatWarningContainer: {
// //     flexDirection: 'row',
// //     alignItems: 'center',
// //     backgroundColor: '#FEF3C7',
// //     borderRadius: 8,
// //     padding: 8,
// //     marginTop: 8,
// //     marginBottom: 4,
// //     gap: 6,
// //   },
// //   seatWarningText: {
// //     flex: 1,
// //     fontSize: 11,
// //     color: '#D97706',
// //     fontWeight: '600',
// //   },
// //   fullWarningContainer: {
// //     flexDirection: 'row',
// //     alignItems: 'center',
// //     backgroundColor: '#FEF2F2',
// //     borderRadius: 8,
// //     padding: 8,
// //     marginTop: 8,
// //     marginBottom: 4,
// //     borderWidth: 1,
// //     borderColor: '#FEE2E2',
// //     gap: 6,
// //   },
// //   fullWarningText: {
// //     flex: 1,
// //     fontSize: 11,
// //     color: '#EF4444',
// //     fontWeight: '600',
// //   },
// //   divider: {
// //     height: 1,
// //     backgroundColor: '#EEF2F7',
// //     marginBottom: 10,
// //   },
// //   routeBlock: {
// //     gap: 8,
// //   },
// //   routeRow: {
// //     flexDirection: 'row',
// //     alignItems: 'flex-start',
// //   },
// //   routeDot: {
// //     width: 8,
// //     height: 8,
// //     borderRadius: 4,
// //     marginTop: 5,
// //     marginRight: 8,
// //   },
// //   routeTextWrap: {
// //     flex: 1,
// //   },
// //   routeLabel: {
// //     fontSize: 11,
// //     color: Colors.gray,
// //     fontWeight: '700',
// //     marginBottom: 2,
// //   },
// //   routeText: {
// //     fontSize: 13,
// //     color: Colors.dark,
// //     fontWeight: '600',
// //     lineHeight: 18,
// //   },
// //   vehicleRow: {
// //     flexDirection: 'row',
// //     alignItems: 'center',
// //     gap: 6,
// //     marginTop: 10,
// //   },
// //   vehicleText: {
// //     fontSize: 12,
// //     color: Colors.gray,
// //     fontWeight: '600',
// //     flex: 1,
// //   },
// //   badgeScroll: {
// //     gap: 8,
// //     paddingTop: 10,
// //   },
// //   prefBadge: {
// //     paddingHorizontal: 10,
// //     paddingVertical: 6,
// //     borderRadius: 12,
// //     marginRight: 8,
// //   },
// //   prefBadgeText: {
// //     fontSize: 11,
// //     fontWeight: '700',
// //   },
// //   loadingContainer: {
// //     flex: 1,
// //     justifyContent: 'center',
// //     alignItems: 'center',
// //     backgroundColor: Colors.white,
// //   },
// //   emptyContainer: {
// //     flex: 1,
// //     justifyContent: 'center',
// //     alignItems: 'center',
// //     paddingHorizontal: 40,
// //   },
// //   emptyTitle: {
// //     fontSize: 22,
// //     fontWeight: '700',
// //     color: Colors.dark,
// //     marginTop: 20,
// //     marginBottom: 8,
// //   },
// //   emptySubtitle: {
// //     fontSize: 15,
// //     color: Colors.gray,
// //     textAlign: 'center',
// //     lineHeight: 22,
// //     marginBottom: 24,
// //   },
// //   requestAlertButton: {
// //     flexDirection: 'row',
// //     alignItems: 'center',
// //     justifyContent: 'center',
// //     backgroundColor: Colors.primary,
// //     paddingHorizontal: 20,
// //     paddingVertical: 14,
// //     borderRadius: 12,
// //     marginBottom: 12,
// //     gap: 8,
// //     width: '100%',
// //   },
// //   requestAlertButtonText: {
// //     color: Colors.white,
// //     fontSize: 15,
// //     fontWeight: '600',
// //   },
// //   clearButton: {
// //     backgroundColor: Colors.primary,
// //     paddingHorizontal: 24,
// //     paddingVertical: 12,
// //     borderRadius: 12,
// //   },
// //   clearButtonText: {
// //     color: Colors.white,
// //     fontSize: 15,
// //     fontWeight: '700',
// //   },
// //   modalBackdrop: {
// //     flex: 1,
// //     backgroundColor: 'rgba(15,23,42,0.28)',
// //     justifyContent: 'flex-end',
// //   },
// //   modalOverlay: {
// //     flex: 1,
// //   },
// //   modalSheet: {
// //     backgroundColor: Colors.white,
// //     borderTopLeftRadius: 24,
// //     borderTopRightRadius: 24,
// //     maxHeight: '78%',
// //     paddingTop: 10,
// //   },
// //   requestModalSheet: {
// //     backgroundColor: Colors.white,
// //     borderTopLeftRadius: 24,
// //     borderTopRightRadius: 24,
// //     maxHeight: '80%',
// //     paddingTop: 10,
// //   },
// //   modalHandle: {
// //     width: 52,
// //     height: 5,
// //     borderRadius: 999,
// //     backgroundColor: '#D1D5DB',
// //     alignSelf: 'center',
// //     marginBottom: 14,
// //   },
// //   modalHeader: {
// //     flexDirection: 'row',
// //     alignItems: 'center',
// //     justifyContent: 'space-between',
// //     paddingHorizontal: 18,
// //     paddingBottom: 10,
// //   },
// //   modalTitle: {
// //     fontSize: 20,
// //     fontWeight: '800',
// //     color: Colors.dark,
// //   },
// //   modalContent: {
// //     paddingHorizontal: 18,
// //     paddingBottom: 20,
// //   },
// //   requestModalContent: {
// //     padding: 20,
// //   },
// //   modalSection: {
// //     marginBottom: 18,
// //   },
// //   modalSectionTitle: {
// //     fontSize: 14,
// //     fontWeight: '700',
// //     color: Colors.dark,
// //     marginBottom: 10,
// //   },
// //   modalToggleChip: {
// //     borderRadius: 14,
// //     borderWidth: 1,
// //     borderColor: '#E5E7EB',
// //     paddingHorizontal: 14,
// //     paddingVertical: 10,
// //     alignSelf: 'flex-start',
// //     backgroundColor: '#F9FAFB',
// //   },
// //   modalToggleChipActive: {
// //     backgroundColor: Colors.primary,
// //     borderColor: Colors.primary,
// //   },
// //   modalToggleChipText: {
// //     fontSize: 13,
// //     color: Colors.dark,
// //     fontWeight: '600',
// //   },
// //   modalToggleChipTextActive: {
// //     color: Colors.white,
// //   },
// //   modalOptionWrap: {
// //     flexDirection: 'row',
// //     flexWrap: 'wrap',
// //     gap: 10,
// //   },
// //   modalOptionChip: {
// //     borderRadius: 16,
// //     borderWidth: 1,
// //     borderColor: '#E5E7EB',
// //     paddingHorizontal: 12,
// //     paddingVertical: 9,
// //     backgroundColor: '#F9FAFB',
// //   },
// //   modalOptionChipActive: {
// //     backgroundColor: Colors.primary,
// //     borderColor: Colors.primary,
// //   },
// //   modalOptionChipText: {
// //     fontSize: 13,
// //     color: Colors.dark,
// //     fontWeight: '600',
// //   },
// //   modalOptionChipTextActive: {
// //     color: Colors.white,
// //   },
// //   modalFooter: {
// //     flexDirection: 'row',
// //     paddingHorizontal: 18,
// //     paddingTop: 12,
// //     paddingBottom: Platform.OS === 'ios' ? 28 : 18,
// //     borderTopWidth: 1,
// //     borderTopColor: '#EEF2F7',
// //     gap: 12,
// //   },
// //   modalSecondaryBtn: {
// //     flex: 1,
// //     borderRadius: 14,
// //     paddingVertical: 14,
// //     alignItems: 'center',
// //     backgroundColor: '#F3F4F6',
// //   },
// //   modalSecondaryBtnText: {
// //     fontSize: 15,
// //     fontWeight: '700',
// //     color: Colors.dark,
// //   },
// //   modalPrimaryBtn: {
// //     flex: 1,
// //     borderRadius: 14,
// //     paddingVertical: 14,
// //     alignItems: 'center',
// //     backgroundColor: Colors.primary,
// //   },
// //   modalPrimaryBtnText: {
// //     fontSize: 15,
// //     fontWeight: '700',
// //     color: Colors.white,
// //   },
// //   requestInfoBox: {
// //     flexDirection: 'row',
// //     alignItems: 'center',
// //     backgroundColor: '#EFF6FF',
// //     padding: 12,
// //     borderRadius: 12,
// //     marginBottom: 16,
// //     gap: 8,
// //   },
// //   requestInfoText: {
// //     flex: 1,
// //     fontSize: 13,
// //     color: '#1E3A8A',
// //     lineHeight: 18,
// //   },
// //   requestRouteBox: {
// //     backgroundColor: '#F3F4F6',
// //     padding: 12,
// //     borderRadius: 12,
// //     marginBottom: 20,
// //   },
// //   requestRouteLabel: {
// //     fontSize: 12,
// //     fontWeight: '600',
// //     color: Colors.gray,
// //     marginBottom: 4,
// //   },
// //   requestRouteText: {
// //     fontSize: 14,
// //     fontWeight: '600',
// //     color: Colors.dark,
// //     marginBottom: 4,
// //   },
// //   requestRouteDetail: {
// //     fontSize: 12,
// //     color: Colors.gray,
// //     marginTop: 2,
// //   },
// //   requestInputGroup: {
// //     marginBottom: 16,
// //   },
// //   requestLabel: {
// //     fontSize: 14,
// //     fontWeight: '600',
// //     color: Colors.dark,
// //     marginBottom: 8,
// //   },
// //   requestInput: {
// //     borderWidth: 1,
// //     borderColor: '#E5E7EB',
// //     borderRadius: 12,
// //     paddingHorizontal: 12,
// //     paddingVertical: 10,
// //     fontSize: 14,
// //     backgroundColor: '#F9FAFB',
// //   },
// //   requestTextArea: {
// //     minHeight: 80,
// //     textAlignVertical: 'top',
// //   },
// //   requestHelper: {
// //     fontSize: 11,
// //     color: Colors.gray,
// //     marginTop: 4,
// //   },
// //   requestNoteBox: {
// //     flexDirection: 'row',
// //     alignItems: 'center',
// //     backgroundColor: '#FEF3C7',
// //     padding: 12,
// //     borderRadius: 12,
// //     gap: 8,
// //   },
// //   requestNoteText: {
// //     flex: 1,
// //     fontSize: 12,
// //     color: '#D97706',
// //   },
// //   disabledButton: {
// //     opacity: 0.6,
// //   },
// //   imageModalContainer: {
// //     flex: 1,
// //     justifyContent: 'center',
// //     alignItems: 'center',
// //     backgroundColor: 'rgba(0,0,0,0.9)',
// //   },
// //   imageModalContent: {
// //     width: '90%',
// //     backgroundColor: Colors.white,
// //     borderRadius: 20,
// //     overflow: 'hidden',
// //   },
// //   imageModalHeader: {
// //     flexDirection: 'row',
// //     justifyContent: 'space-between',
// //     alignItems: 'center',
// //     padding: 16,
// //     borderBottomWidth: 1,
// //     borderBottomColor: '#EEF2F7',
// //   },
// //   imageModalTitle: {
// //     fontSize: 18,
// //     fontWeight: '700',
// //     color: Colors.dark,
// //   },
// //   fullProfileImage: {
// //     width: '100%',
// //     height: 400,
// //     backgroundColor: '#F5F5F5',
// //   },
// //   noImageContainer: {
// //     width: '100%',
// //     height: 400,
// //     justifyContent: 'center',
// //     alignItems: 'center',
// //     backgroundColor: '#F5F5F5',
// //   },
// //   noImageText: {
// //     fontSize: 16,
// //     color: Colors.gray,
// //   },
// //   svgContainer: {
// //     width: 48,
// //     height: 48,
// //     alignItems: 'center',
// //     justifyContent: 'center',
// //   },
// //   initialsContainer: {
// //     width: '100%',
// //     height: '100%',
// //     alignItems: 'center',
// //     justifyContent: 'center',
// //     backgroundColor: '#E5E7EB',
// //   },
// //   modalSvgContainer: {
// //     width: '100%',
// //     height: 400,
// //     backgroundColor: '#F5F5F5',
// //     alignItems: 'center',
// //     justifyContent: 'center',
// //   },
// //   debugBanner: {
// //     flexDirection: 'row',
// //     alignItems: 'center',
// //     padding: 12,
// //     marginHorizontal: 16,
// //     marginTop: 8,
// //     marginBottom: 8,
// //     borderRadius: 8,
// //     gap: 8,
// //   },
// //   debugBannerSuccess: {
// //     backgroundColor: '#DCFCE7',
// //     borderLeftWidth: 4,
// //     borderLeftColor: '#22C55E',
// //   },
// //   debugBannerError: {
// //     backgroundColor: '#FEE2E2',
// //     borderLeftWidth: 4,
// //     borderLeftColor: '#EF4444',
// //   },
// //   debugBannerText: {
// //     flex: 1,
// //     fontSize: 12,
// //     fontWeight: '500',
// //   },
// //   debugBannerTextSuccess: {
// //     color: '#166534',
// //   },
// //   debugBannerTextError: {
// //     color: '#991B1B',
// //   },
// // });
// import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
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
//   RefreshControl,
//   TextInput,
//   ActivityIndicator,
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

// const normalizeLocation = (location) => {
//   if (!location) return '';
//   return location
//     .toLowerCase()
//     .replace(/tower[-\s]*\d+/i, '')
//     .replace(/[-\s]*\d+[-\s]*(?:th|st|nd|rd)/i, '')
//     .replace(/\b(?:tower|block|sector|sect|building|no\.?|#|flat|apartment|apt)\s*\d+/gi, '')
//     .replace(/\b\d+\b/g, '')
//     .replace(/[^\w\s]/g, ' ')
//     .replace(/\s+/g, ' ')
//     .trim();
// };

// const locationsMatch = (loc1, loc2) => {
//   const norm1 = normalizeLocation(loc1);
//   const norm2 = normalizeLocation(loc2);
  
//   if (!norm1 || !norm2) return false;
//   if (norm1 === norm2) return true;
//   if (norm1.includes(norm2) || norm2.includes(norm1)) return true;
  
//   const words1 = norm1.split(' ');
//   const words2 = norm2.split(' ');
//   const commonWords = words1.filter(w => 
//     words2.includes(w) && w.length > 2 && !['the','and','of','to','for','with'].includes(w)
//   );
  
//   if (commonWords.length >= 2) return true;
  
//   const avMatch = (norm1.includes('avenue') && (norm2.includes('av') || norm2.includes('ave'))) ||
//                   ((norm1.includes('av') || norm1.includes('ave')) && norm2.includes('avenue'));
//   const sectorMatch = (norm1.includes('sector') && (norm2.includes('sec') || norm2.includes('sect'))) ||
//                       ((norm1.includes('sec') || norm1.includes('sect')) && norm2.includes('sector'));
//   const gaurCityMatch = (norm1.includes('gaur city') && norm2.includes('gaur city')) ||
//                         (norm1.includes('gaurcity') && norm2.includes('gaur city'));
//   const collegeMatch = (norm1.includes('engineering college') && norm2.includes('engineering college'));
  
//   return avMatch || sectorMatch || gaurCityMatch || collegeMatch;
// };

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

//   if (!prefs || Object.keys(prefs).length === 0) return [];

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
//           if (v && v.trim()) badges.push(v.trim());
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

//   if (key === 'verified_profiles_only') return !!item.isVerified;
//   if (typeof value === 'boolean') return value;
//   if (Array.isArray(value)) return value.length > 0;
//   if (key === 'smoking_policy') return normalized.includes('no');
//   if (key === 'same_gender_after_9pm') return normalized === 'true' || normalized === 'yes' || normalized === 'same gender';
//   if (key === 'pets_allowed') return normalized === 'true' || normalized === 'yes' || normalized === 'allowed';
  
//   return !!normalized;
// }

// function matchesAdvancedFilter(item, key, expectedValue) {
//   if (expectedValue === undefined || expectedValue === null || expectedValue === '') return true;

//   const prefs = getRidePreferences(item);
//   const rideValue = prefs?.[key];

//   if (typeof expectedValue === 'boolean') {
//     if (key === 'verified_profiles_only') return expectedValue ? !!item.isVerified : true;
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
//     if (imageUrl) setIsSvg(imageUrl.toLowerCase().includes('.svg'));
//   }, [imageUrl]);
  
//   if (!visible) return null;
  
//   return (
//     <Modal visible={visible} transparent={true} animationType="fade" onRequestClose={onClose}>
//       <TouchableOpacity style={styles.modalBackdrop} activeOpacity={1} onPress={onClose}>
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
//                   <SvgCssUri uri={imageUrl} width="100%" height={400} />
//                 </View>
//               ) : (
//                 <Image source={{ uri: imageUrl }} style={styles.fullProfileImage} resizeMode="contain" />
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
//   const [refreshing, setRefreshing] = useState(false);
//   const [errorMessage, setErrorMessage] = useState('');
//   const [sortBy, setSortBy] = useState('time');
//   const [quickFilters, setQuickFilters] = useState([]);
//   const [headerFiltersVisible, setHeaderFiltersVisible] = useState(false);
//   const [filterModalVisible, setFilterModalVisible] = useState(false);
//   const [preferenceMaster, setPreferenceMaster] = useState([]);
//   const [userPreferences, setUserPreferences] = useState({});
//   const [advancedFilters, setAdvancedFilters] = useState({});
  
//   const [showRideRequestModal, setShowRideRequestModal] = useState(false);
//   const [rideRequestLoading, setRideRequestLoading] = useState(false);
//   const [rideRequestEmail, setRideRequestEmail] = useState('');
//   const [rideRequestNotes, setRideRequestNotes] = useState('');
//   const [lastRequestStatus, setLastRequestStatus] = useState(null);
  
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

//   // Track notified ride requests to prevent duplicate alerts
//   const [notifiedRequestIds, setNotifiedRequestIds] = useState(new Set());
  
//   // Track if component has initialized to prevent double execution
//   const hasInitialized = useRef(false);

//   const phoneNumber = user?.phone_number;
//   const userGender = user?.gender;
//   const requestedSeats = seats || 1;

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

//   // Debug function to check ride requests
//   const checkUserRideRequests = useCallback(async () => {
//     if (!phoneNumber) return;
    
//     console.log('\n🔍 ========== CHECKING USER RIDE REQUESTS ==========');
//     console.log(`👤 User: ${user?.full_name || user?.first_name} (${phoneNumber})`);
    
//     try {
//       const response = await fetch(`${API_BASE_URL}/my-ride-requests/${phoneNumber}`);
//       const data = await response.json();
      
//       if (data.success && data.requests) {
//         console.log(`📊 Found ${data.requests.length} ride requests:`);
//         data.requests.forEach((req, index) => {
//           console.log(`\n   Request ${index + 1} (ID: ${req.id}):`);
//           console.log(`      From: ${req.from_location.substring(0, 60)}...`);
//           console.log(`      To: ${req.to_location.substring(0, 60)}...`);
//           console.log(`      Status: ${req.status}`);
//           console.log(`      Seats: ${req.seats_needed}`);
//         });
//       } else {
//         console.log('📭 No ride requests found');
//       }
//     } catch (error) {
//       console.log('❌ Error checking ride requests:', error);
//     }
    
//     console.log('🔍 ================================================\n');
//   }, [phoneNumber, user]);

//   // Check if current rides match any requests (with duplicate prevention)
//   const checkMatchingWithCurrentRides = useCallback(async () => {
//     if (!phoneNumber || availableRides.length === 0) return;
    
//     console.log('\n🔍 ========== CHECKING MATCHES ==========');
//     console.log(`📊 Available rides: ${availableRides.length}`);
    
//     try {
//       const response = await fetch(`${API_BASE_URL}/my-ride-requests/${phoneNumber}`);
//       const data = await response.json();
      
//       if (!data.success || !data.requests) {
//         console.log('❌ Could not fetch ride requests');
//         return;
//       }
      
//       // Filter out requests that have already been notified
//       const activeRequests = data.requests.filter(req => 
//         req.status === 'active' && !notifiedRequestIds.has(req.id)
//       );
      
//       console.log(`\n📋 Active un-notified requests: ${activeRequests.length}`);
      
//       if (activeRequests.length === 0) {
//         console.log('📭 No active un-notified requests to match');
//         console.log('🔍 ==================================\n');
//         return;
//       }
      
//       // For each active request, check if any ride matches
//       for (const req of activeRequests) {
//         console.log(`\n📋 Checking Request ID ${req.id}:`);
        
//         let matchedRide = null;
        
//         for (const ride of availableRides) {
//           const fromMatch = locationsMatch(ride.from, req.from_location);
//           const toMatch = locationsMatch(ride.to, req.to_location);
          
//           if (fromMatch && toMatch) {
//             matchedRide = ride;
//             console.log(`\n   ✅ MATCH FOUND!`);
//             console.log(`      Ride ID: ${ride.id}`);
            
//             // Mark as notified immediately to prevent duplicate alerts
//             setNotifiedRequestIds(prev => new Set([...prev, req.id]));
            
//             // Show notification only once
//             showCustomAlert(
//               'Ride Match Found! 🎉',
//               `A ride matching your request "${req.from_location.split(',')[0]} → ${req.to_location.split(',')[0]}" is now available!`,
//               'success'
//             );
//             break;
//           }
//         }
        
//         if (!matchedRide) {
//           console.log(`   ❌ No matching ride found for Request ${req.id}`);
//         }
//       }
      
//     } catch (error) {
//       console.log('❌ Error checking matches:', error);
//     }
    
//     console.log('🔍 ==================================\n');
//   }, [phoneNumber, availableRides, notifiedRequestIds, showCustomAlert]);

//   // Handle Ride Request Alert
//   const handleRequestRideAlert = async () => {
//     const userEmail = user?.email || '';
    
//     console.log('\n📧 ========== RIDE REQUEST ALERT ==========');
//     console.log(`👤 User: ${user?.full_name || user?.first_name} (${phoneNumber})`);
//     console.log(`📍 From: ${from}`);
//     console.log(`📍 To: ${to}`);
//     console.log(`💺 Seats needed: ${requestedSeats}`);
    
//     if (!rideRequestEmail && !userEmail) {
//       showCustomAlert('Email Required', 'Please enter your email address to receive notifications.', 'error');
//       return;
//     }
    
//     const emailToUse = rideRequestEmail || userEmail;
    
//     if (!emailToUse.includes('@')) {
//       showCustomAlert('Invalid Email', 'Please enter a valid email address.', 'error');
//       return;
//     }
    
//     setRideRequestLoading(true);
//     setLastRequestStatus(null);
    
//     try {
//       const requestBody = {
//         from_location: from,
//         to_location: to,
//         from_coords: fromCoords,
//         to_coords: toCoords,
//         preferred_date: dateTime,
//         preferred_time: new Date(dateTime).toLocaleTimeString(),
//         seats_needed: requestedSeats,
//         passenger_phone: user?.phone_number,
//         passenger_name: user?.full_name || user?.first_name,
//         passenger_email: emailToUse,
//         notes: rideRequestNotes
//       };
      
//       const response = await fetch(`${API_BASE_URL}/request-ride-alert`, {
//         method: 'POST',
//         headers: { 'Content-Type': 'application/json' },
//         body: JSON.stringify(requestBody),
//       });
      
//       const result = await response.json();
      
//       if (result.success) {
//         setLastRequestStatus({
//           success: true,
//           message: `Request #${result.request_id} created. We'll email you when a ride is available.`
//         });
        
//         showCustomAlert(
//           'Request Submitted! 📧', 
//           `We'll email you at ${emailToUse} when a ride matching your route is posted.\n\nRequest expires in 7 days.`,
//           'success'
//         );
//         setShowRideRequestModal(false);
//         setRideRequestEmail('');
//         setRideRequestNotes('');
        
//         // Fetch rides again to check for immediate matches
//         setTimeout(() => {
//           fetchAvailableRides(true);
//         }, 1000);
        
//       } else {
//         setLastRequestStatus({
//           success: false,
//           message: result.message || 'Could not create ride request'
//         });
//         showCustomAlert('Request Failed', result.message || 'Could not create ride request', 'error');
//       }
//     } catch (error) {
//       setLastRequestStatus({
//         success: false,
//         message: error.message || 'Network error'
//       });
//       showCustomAlert('Error', 'Could not create ride request. Please try again.', 'error');
//     } finally {
//       setRideRequestLoading(false);
//     }
//   };

//   // Fetch available rides
//   const fetchAvailableRides = useCallback(async (showRefresh = false) => {
//     if (!searchData || !fromCoords || !toCoords || !dateTime) {
//       console.log('⚠️ Missing search data, skipping fetch');
//       setAvailableRides([]);
//       setLoading(false);
//       return;
//     }

//     console.log('\n🚗 ========== FETCHING RIDES ==========');
//     console.log(`📍 From: ${from}`);
//     console.log(`📍 To: ${to}`);
//     console.log(`📅 Time: ${dateTime}`);

//     try {
//       if (showRefresh) {
//         setRefreshing(true);
//       } else {
//         setLoading(true);
//       }
//       setErrorMessage('');

//       const requestBody = {
//         from_location: from,
//         to_location: to,
//         from_coords: fromCoords,
//         to_coords: toCoords,
//         departure_time: new Date(dateTime).toISOString(),
//         seats_required: requestedSeats,
//         passenger_gender: userGender,
//       };
      
//       const response = await fetch(`${API_BASE_URL}/search-rides`, {
//         method: 'POST',
//         headers: { 'Content-Type': 'application/json' },
//         body: JSON.stringify(requestBody),
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
          
//           let availableSeats = ride.seatsAvailable || ride.available_seats || 0;
          
//           return { 
//             ...ride, 
//             isVerified, 
//             rating: avgRating,
//             profilePicture: finalProfilePicture,
//             profilepicture: finalProfilePicture,
//             profilePhoto: finalProfilePicture,
//             pickupLabel: ride.pickupLabel || ride.pickupLocationName || ride.fromLocationName || ride.from || 'Pickup point',
//             dropLabel: ride.dropLabel || ride.dropLocationName || ride.toLocationName || ride.to || 'Drop point',
//             womenOnly: ride.womenOnly === true || ride.women_only === true,
//             seatsAvailable: availableSeats,
//             requestedSeats: requestedSeats,
//             isFull: availableSeats === 0,
//           };
//         })
//       );
      
//       setAvailableRides(ridesWithDetails);
//       console.log(`✅ Loaded ${ridesWithDetails.length} rides with details`);
      
//       // Check for matches after loading rides
//       await checkMatchingWithCurrentRides();
      
//     } catch (error) {
//       console.log('❌ search-rides error:', error);
//       setAvailableRides([]);
//       setErrorMessage(error.message || 'Failed to search rides');
//       showCustomAlert('Search Error', error.message || 'Failed to search rides', 'error');
//     } finally {
//       setLoading(false);
//       setRefreshing(false);
//       console.log('🚗 ==================================\n');
//     }
//   }, [searchData, from, to, fromCoords, toCoords, dateTime, requestedSeats, userGender, checkMatchingWithCurrentRides]);

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

//   // Initial load - FIXED: Only runs once
//   useEffect(() => {
//     if (authLoading) return;
//     if (hasInitialized.current) return;
//     hasInitialized.current = true;
    
//     console.log('\n🚀 Component mounted, loading data...');
//     fetchAvailableRides();
//     loadPreferenceData();
//     checkUserRideRequests();
//   }, [authLoading]); // Only depends on authLoading

//   // Manual refresh
//   const onRefresh = useCallback(() => {
//     console.log('🔄 Manual refresh triggered');
//     setNotifiedRequestIds(new Set()); // Clear notified matches on refresh
//     fetchAvailableRides(true);
//     checkUserRideRequests();
//   }, [fetchAvailableRides, checkUserRideRequests]);

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

//     if (userGender !== 'female') {
//       rides = rides.filter(item => !(item.womenOnly === true));
//     }

//     if (quickFilters.length > 0) {
//       rides = rides.filter(item =>
//         quickFilters.every(key => matchesQuickFilter(item, key))
//       );
//     }

//     const activeAdvanced = Object.entries(advancedFilters).filter(
//       ([, value]) => value !== '' && value !== null && value !== undefined && value !== false
//     );

//     if (activeAdvanced.length > 0) {
//       rides = rides.filter(item =>
//         activeAdvanced.every(([key, value]) => matchesAdvancedFilter(item, key, value))
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
//     const pickupAddress = searchData?.fromAddress || ride.from || '';
//     const dropoffAddress = searchData?.toAddress || ride.to || '';
//     const pickupPlaceName = searchData?.fromPlaceName || ride.pickupLabel || ride.from?.split(',')[0] || '';
//     const dropoffPlaceName = searchData?.toPlaceName || ride.dropLabel || ride.to?.split(',')[0] || '';
    
//     navigation.navigate('RideDetailScreen', {
//       ride: ride,
//       searchData: {
//         fromCoords: fromCoords,
//         toCoords: toCoords,
//         fromAddress: pickupAddress,
//         toAddress: dropoffAddress,
//         fromPlaceName: pickupPlaceName,
//         toPlaceName: dropoffPlaceName,
//         date: dateTime,
//         time: new Date(dateTime).toLocaleTimeString(),
//         seats: requestedSeats
//       }
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
//           onPress={() => setAdvancedFilters(prev => ({ ...prev, [pref.key]: !active }))}
//         >
//           <Text style={[styles.modalToggleChipText, active && styles.modalToggleChipTextActive]}>
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
//                 style={[styles.modalOptionChip, active && styles.modalOptionChipActive]}
//                 onPress={() => setAdvancedFilters(prev => ({ ...prev, [pref.key]: active ? '' : opt }))}
//               >
//                 <Text style={[styles.modalOptionChipText, active && styles.modalOptionChipTextActive]}>
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

//   const RideRequestModal = () => {
//     const userEmail = user?.email || '';
    
//     return (
//       <Modal visible={showRideRequestModal} transparent={true} animationType="slide" onRequestClose={() => setShowRideRequestModal(false)}>
//         <View style={styles.modalBackdrop}>
//           <TouchableOpacity style={styles.modalOverlay} activeOpacity={1} onPress={() => setShowRideRequestModal(false)} />
          
//           <View style={styles.requestModalSheet}>
//             <View style={styles.modalHandle} />
            
//             <View style={styles.modalHeader}>
//               <Text style={styles.modalTitle}>Request Ride Alert</Text>
//               <TouchableOpacity onPress={() => setShowRideRequestModal(false)}>
//                 <Ionicons name="close" size={24} color={Colors.dark} />
//               </TouchableOpacity>
//             </View>
            
//             <ScrollView showsVerticalScrollIndicator={false}>
//               <View style={styles.requestModalContent}>
//                 <View style={styles.requestInfoBox}>
//                   <Ionicons name="information-circle" size={20} color={Colors.primary} />
//                   <Text style={styles.requestInfoText}>
//                     No rides found for this route. We'll email you when a ride becomes available.
//                   </Text>
//                 </View>
                
//                 <View style={styles.requestRouteBox}>
//                   <Text style={styles.requestRouteLabel}>Route:</Text>
//                   <Text style={styles.requestRouteText}>{from} → {to}</Text>
//                   <Text style={styles.requestRouteDetail}>
//                     {new Date(dateTime).toLocaleDateString()} at {new Date(dateTime).toLocaleTimeString()}
//                   </Text>
//                   <Text style={styles.requestRouteDetail}>
//                     {requestedSeats} seat{requestedSeats !== 1 ? 's' : ''} needed
//                   </Text>
//                 </View>
                
//                 <View style={styles.requestInputGroup}>
//                   <Text style={styles.requestLabel}>Email Address *</Text>
//                   <TextInput
//                     style={styles.requestInput}
//                     placeholder="Enter your email"
//                     value={rideRequestEmail}
//                     onChangeText={setRideRequestEmail}
//                     keyboardType="email-address"
//                     autoCapitalize="none"
//                     autoComplete="email"
//                   />
//                   {userEmail && !rideRequestEmail && (
//                     <Text style={styles.requestHelper}>Using your registered email: {userEmail}</Text>
//                   )}
//                   <Text style={styles.requestHelper}>We'll notify you at this email when rides are posted</Text>
//                 </View>
                
//                 <View style={styles.requestInputGroup}>
//                   <Text style={styles.requestLabel}>Additional Notes (Optional)</Text>
//                   <TextInput
//                     style={[styles.requestInput, styles.requestTextArea]}
//                     placeholder="Any preferences or special requirements?"
//                     value={rideRequestNotes}
//                     onChangeText={setRideRequestNotes}
//                     multiline
//                     numberOfLines={3}
//                     textAlignVertical="top"
//                   />
//                 </View>
                
//                 <View style={styles.requestNoteBox}>
//                   <Ionicons name="time-outline" size={16} color={Colors.gray} />
//                   <Text style={styles.requestNoteText}>
//                     Your request will remain active for 7 days. You can cancel it anytime in your profile.
//                   </Text>
//                 </View>
//               </View>
//             </ScrollView>
            
//             <View style={styles.modalFooter}>
//               <TouchableOpacity style={styles.modalSecondaryBtn} onPress={() => setShowRideRequestModal(false)}>
//                 <Text style={styles.modalSecondaryBtnText}>Cancel</Text>
//               </TouchableOpacity>
              
//               <TouchableOpacity
//                 style={[styles.modalPrimaryBtn, rideRequestLoading && styles.disabledButton]}
//                 onPress={handleRequestRideAlert}
//                 disabled={rideRequestLoading}
//               >
//                 {rideRequestLoading ? (
//                   <ActivityIndicator size="small" color={Colors.white} />
//                 ) : (
//                   <Text style={styles.modalPrimaryBtnText}>Get Email Alert</Text>
//                 )}
//               </TouchableOpacity>
//             </View>
//           </View>
//         </View>
//       </Modal>
//     );
//   };

//   const renderRideCard = ({ item }) => {
//     let profilePhotoUrl = null;
//     let isSvg = false;
    
//     if (item.profilePicture) profilePhotoUrl = buildImageUrl(item.profilePicture);
//     else if (item.profilepicture) profilePhotoUrl = buildImageUrl(item.profilepicture);
//     else if (item.profilePhoto) profilePhotoUrl = buildImageUrl(item.profilePhoto);
//     else if (item.driverProfilePicture) profilePhotoUrl = buildImageUrl(item.driverProfilePicture);
//     else if (item.driver?.profile_picture) profilePhotoUrl = buildImageUrl(item.driver.profile_picture);
//     else if (item.user?.profile_picture) profilePhotoUrl = buildImageUrl(item.user.profile_picture);
    
//     if (profilePhotoUrl && profilePhotoUrl.toLowerCase().includes('.svg')) isSvg = true;
    
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
//       if (item.vehicleColor) vehicleLabel = `${item.vehicleModel} - ${item.vehicleColor}`;
//     }

//     const preferenceBadges = extractPreferenceBadges(item);
//     const isDriverVerified = item.isVerified;
//     const driverRating = item.rating || 0;

//     const pickupName = item.pickupLabel || item.from || 'Pickup point';
//     const dropName = item.dropLabel || item.to || 'Drop point';
    
//     const seatsAvailable = item.seatsAvailable || 0;
//     const isSeatsInsufficient = requestedSeats > seatsAvailable && seatsAvailable > 0;
//     const isFull = seatsAvailable === 0;
//     const canBook = !isFull && seatsAvailable >= requestedSeats;

//     return (
//       <TouchableOpacity
//         style={[styles.rideCard, !canBook && !isFull && styles.rideCardWarning, isFull && styles.rideCardFull]}
//         onPress={() => handleCardPress(item)}
//         activeOpacity={0.9}
//       >
//         <View style={styles.cardTopRow}>
//           <View style={styles.profileRow}>
//             <TouchableOpacity onPress={() => handleCardPress(item)} activeOpacity={0.8}>
//               <View style={styles.avatarContainer}>
//                 {profilePhotoUrl ? (
//                   isSvg ? (
//                     <View style={styles.svgContainer}>
//                       <SvgCssUri uri={profilePhotoUrl} width="48" height="48" />
//                     </View>
//                   ) : (
//                     <Image source={{ uri: profilePhotoUrl }} style={styles.avatarImage} resizeMode="cover" />
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
//                 <Text style={styles.driverName} numberOfLines={1}>{driverNameText}</Text>

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
                
//                 {isFull && (
//                   <View style={styles.fullBadge}>
//                     <Ionicons name="close-circle" size={12} color="#EF4444" />
//                     <Text style={styles.fullBadgeText}>Full</Text>
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
//             <Text style={[styles.infoText, isFull ? styles.fullText : (isSeatsInsufficient && styles.warningText)]} numberOfLines={1}>
//               {isFull ? 'Ride Full' : `${seatsAvailable} left`}
//             </Text>
//           </View>
//         </View>

//         {isFull && (
//           <View style={styles.fullWarningContainer}>
//             <Ionicons name="close-circle" size={14} color="#EF4444" />
//             <Text style={styles.fullWarningText}>This ride is currently full. Check back later or try another ride.</Text>
//           </View>
//         )}

//         {!isFull && isSeatsInsufficient && seatsAvailable > 0 && (
//           <View style={styles.seatWarningContainer}>
//             <Ionicons name="warning" size={14} color="#D97706" />
//             <Text style={styles.seatWarningText}>
//               Only {seatsAvailable} seat{seatsAvailable !== 1 ? 's' : ''} left. You requested {requestedSeats} seat{requestedSeats !== 1 ? 's' : ''}.
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
//           <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.badgeScroll}>
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
//         <LottieView source={require("../assets/loading.json")} autoPlay loop style={{ width: 300, height: 300 }} />
//       </View>
//     );
//   }

//   return (
//     <SafeAreaView style={styles.container}>
//       <StatusBar barStyle="dark-content" backgroundColor={Colors.white} />

//       <View style={styles.header}>
//         <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
//           <MaterialIcons name="arrow-back-ios" size={24} color="#ED7117" />
//         </TouchableOpacity>

//         <Text style={styles.headerTitle}>Available Rides</Text>

//         <TouchableOpacity
//           style={[styles.filterButton, headerFiltersVisible && styles.filterButtonActive]}
//           onPress={() => setHeaderFiltersVisible(prev => !prev)}
//         >
//           <Ionicons name="options-outline" size={22} color="#ED7117" />
//         </TouchableOpacity>
//       </View>

//       {lastRequestStatus && (
//         <View style={[styles.debugBanner, lastRequestStatus.success ? styles.debugBannerSuccess : styles.debugBannerError]}>
//           <Ionicons name={lastRequestStatus.success ? "checkmark-circle" : "alert-circle"} size={18} color={lastRequestStatus.success ? "#166534" : "#991B1B"} />
//           <Text style={[styles.debugBannerText, lastRequestStatus.success ? styles.debugBannerTextSuccess : styles.debugBannerTextError]}>
//             {lastRequestStatus.message}
//           </Text>
//           <TouchableOpacity onPress={() => setLastRequestStatus(null)}>
//             <Ionicons name="close" size={16} color={lastRequestStatus.success ? "#166534" : "#991B1B"} />
//           </TouchableOpacity>
//         </View>
//       )}

//       {headerFiltersVisible && (
//         <View style={styles.topControlsWrap}>
//           <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterScroll}>
//             {quickFilterOptions.map((filter) => {
//               const active = quickFilters.includes(filter.key);
//               return (
//                 <TouchableOpacity
//                   key={filter.key}
//                   activeOpacity={0.85}
//                   style={[styles.quickChip, active && styles.quickChipActive]}
//                   onPress={() => toggleQuickFilter(filter.key)}
//                 >
//                   <Text style={[styles.quickChipText, active && styles.quickChipTextActive]}>{filter.label}</Text>
//                 </TouchableOpacity>
//               );
//             })}
//             <TouchableOpacity activeOpacity={0.85} style={styles.moreFilterChip} onPress={() => setFilterModalVisible(true)}>
//               <Ionicons name="options-outline" size={14} color="#ED7117" />
//               <Text style={styles.moreFilterChipText}>More Filters</Text>
//             </TouchableOpacity>
//           </ScrollView>

//           <Text style={styles.sortLabel}>Sort by</Text>

//           <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.sortScroll}>
//             {SORT_OPTIONS.map((option) => {
//               const active = sortBy === option.key;
//               return (
//                 <TouchableOpacity
//                   key={option.key}
//                   activeOpacity={0.85}
//                   style={[styles.sortChip, active && styles.sortChipActive]}
//                   onPress={() => setSortBy(option.key)}
//                 >
//                   <Text style={[styles.sortChipText, active && styles.sortChipTextActive]}>{option.label}</Text>
//                 </TouchableOpacity>
//               );
//             })}
//           </ScrollView>
//         </View>
//       )}

//       {processedRides.length === 0 ? (
//         <View style={styles.emptyContainer}>
//           <Ionicons name="car-outline" size={80} color={Colors.gray} />
//           <Text style={styles.emptyTitle}>No Rides Found</Text>
//           <Text style={styles.emptySubtitle}>
//             {errorMessage ? errorMessage : 'No rides available for this route at the selected time.'}
//           </Text>

//           <TouchableOpacity style={styles.requestAlertButton} onPress={() => setShowRideRequestModal(true)}>
//             <Ionicons name="notifications-outline" size={20} color={Colors.white} />
//             <Text style={styles.requestAlertButtonText}>Notify me when a ride is available</Text>
//           </TouchableOpacity>

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
//           refreshControl={
//             <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[Colors.primary]} tintColor={Colors.primary} />
//           }
//           ItemSeparatorComponent={() => <View style={{ height: 12 }} />}
//         />
//       )}

//       <Modal visible={filterModalVisible} transparent animationType="slide" onRequestClose={() => setFilterModalVisible(false)}>
//         <View style={styles.modalBackdrop}>
//           <TouchableOpacity style={styles.modalOverlay} activeOpacity={1} onPress={() => setFilterModalVisible(false)} />
//           <View style={styles.modalSheet}>
//             <View style={styles.modalHandle} />
//             <View style={styles.modalHeader}>
//               <Text style={styles.modalTitle}>More Filters</Text>
//               <TouchableOpacity onPress={() => setFilterModalVisible(false)}>
//                 <Ionicons name="close" size={24} color={Colors.dark} />
//               </TouchableOpacity>
//             </View>
//             <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.modalContent}>
//               {advancedFilterOptions.map((pref) => (
//                 <View key={pref.key} style={styles.modalSection}>
//                   <Text style={styles.modalSectionTitle}>{pref.label}</Text>
//                   {renderAdvancedFilterControl(pref)}
//                 </View>
//               ))}
//             </ScrollView>
//             <View style={styles.modalFooter}>
//               <TouchableOpacity style={styles.modalSecondaryBtn} onPress={clearAllFilters}>
//                 <Text style={styles.modalSecondaryBtnText}>Clear</Text>
//               </TouchableOpacity>
//               <TouchableOpacity style={styles.modalPrimaryBtn} onPress={() => setFilterModalVisible(false)}>
//                 <Text style={styles.modalPrimaryBtnText}>Apply Filters</Text>
//               </TouchableOpacity>
//             </View>
//           </View>
//         </View>
//       </Modal>

//       <RideRequestModal />

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
//   container: { flex: 1, backgroundColor: '#fff' },
//   header: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 12, borderBottomWidth: 0.5, borderBottomColor: '#fff', backgroundColor: Colors.white },
//   backButton: { width: 44, height: 44, justifyContent: 'center' },
//   filterButton: { width: 44, height: 44, justifyContent: 'center', alignItems: 'center', borderRadius: 22 },
//   filterButtonActive: { backgroundColor: '#fff' },
//   headerTitle: { ...Typography.h2, fontSize: 28, fontWeight: '700', color: Colors.primary, flex: 1, textAlign: 'center' },
//   topControlsWrap: { backgroundColor: Colors.white, paddingTop: 10, paddingBottom: 12, borderBottomWidth: 1, borderBottomColor: '#EEF2F7' },
//   filterScroll: { paddingHorizontal: 16, gap: 10 },
//   quickChip: { paddingHorizontal: 14, paddingVertical: 10, borderRadius: 20, backgroundColor: '#F3F4F6' },
//   quickChipActive: { backgroundColor: Colors.primary },
//   quickChipText: { fontSize: 12, fontWeight: '600', color: Colors.dark },
//   quickChipTextActive: { color: Colors.white },
//   moreFilterChip: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 14, paddingVertical: 10, borderRadius: 20, backgroundColor: '#EEF6FF' },
//   moreFilterChipText: { fontSize: 12, fontWeight: '700', color: '#ED7117' },
//   sortLabel: { paddingHorizontal: 16, marginTop: 12, marginBottom: 8, fontSize: 12, color: Colors.gray, fontWeight: '700' },
//   sortScroll: { paddingHorizontal: 16, gap: 10 },
//   sortChip: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 14, backgroundColor: '#F3F4F6' },
//   sortChipActive: { backgroundColor: '#ED7117' },
//   sortChipText: { fontSize: 12, color: Colors.dark, fontWeight: '600' },
//   sortChipTextActive: { color: Colors.white },
//   listContent: { padding: 16, paddingBottom: 28 },
//   rideCard: { backgroundColor: Colors.white, borderRadius: 18, padding: 14, borderWidth: 1, borderColor: '#EEF2F7', shadowColor: '#0F172A', shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.05, shadowRadius: 14, elevation: 2 },
//   rideCardWarning: { backgroundColor: '#FFFBEB', borderColor: '#FDE68A' },
//   rideCardFull: { backgroundColor: '#FEF2F2', borderColor: '#FEE2E2', opacity: 0.85 },
//   cardTopRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
//   profileRow: { flexDirection: 'row', flex: 1, paddingRight: 10 },
//   avatarContainer: { width: 48, height: 48, borderRadius: 24, backgroundColor: '#E5E7EB', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', marginRight: 10 },
//   avatarImage: { width: 48, height: 48 },
//   avatarFallback: { fontSize: 14, fontWeight: '800', color: Colors.gray },
//   profileContent: { flex: 1 },
//   nameRow: { flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap', gap: 6 },
//   driverName: { fontSize: 15, fontWeight: '800', color: Colors.dark, maxWidth: '100%' },
//   verifiedBadge: { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: '#E8F5E9', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 12 },
//   verifiedText: { fontSize: 10, fontWeight: '700', color: '#16A34A' },
//   womenOnlyBadge: { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: '#FCE4EC', paddingHorizontal: 8, paddingVertical: 3, borderRadius: 12 },
//   womenOnlyBadgeText: { fontSize: 10, color: '#E91E63', fontWeight: '700' },
//   fullBadge: { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: '#FEF2F2', paddingHorizontal: 8, paddingVertical: 3, borderRadius: 12, borderWidth: 1, borderColor: '#FEE2E2' },
//   fullBadgeText: { fontSize: 10, color: '#EF4444', fontWeight: '700' },
//   ratingRow: { flexDirection: 'row', alignItems: 'center', marginTop: 4 },
//   ratingText: { fontSize: 11, color: Colors.gray, fontWeight: '600' },
//   priceMatchWrap: { alignItems: 'flex-end' },
//   matchBadge: { backgroundColor: '#EEF6FF', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 10, marginBottom: 6 },
//   matchText: { fontSize: 12, fontWeight: '800', color: Colors.primary },
//   priceText: { fontSize: 18, fontWeight: '800', color: '#ED7117', lineHeight: 20 },
//   perSeatText: { fontSize: 10, color: Colors.gray, fontWeight: '600', marginTop: 2 },
//   infoRow: { flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap', marginTop: 12, marginBottom: 10 },
//   infoItem: { flexDirection: 'row', alignItems: 'center', gap: 4 },
//   infoText: { fontSize: 12, color: Colors.dark, fontWeight: '600' },
//   warningText: { color: '#F59E0B' },
//   fullText: { color: '#EF4444' },
//   infoDot: { width: 4, height: 4, borderRadius: 2, backgroundColor: '#CBD5E1', marginHorizontal: 8 },
//   seatWarningContainer: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#FEF3C7', borderRadius: 8, padding: 8, marginTop: 8, marginBottom: 4, gap: 6 },
//   seatWarningText: { flex: 1, fontSize: 11, color: '#D97706', fontWeight: '600' },
//   fullWarningContainer: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#FEF2F2', borderRadius: 8, padding: 8, marginTop: 8, marginBottom: 4, borderWidth: 1, borderColor: '#FEE2E2', gap: 6 },
//   fullWarningText: { flex: 1, fontSize: 11, color: '#EF4444', fontWeight: '600' },
//   divider: { height: 1, backgroundColor: '#EEF2F7', marginBottom: 10 },
//   routeBlock: { gap: 8 },
//   routeRow: { flexDirection: 'row', alignItems: 'flex-start' },
//   routeDot: { width: 8, height: 8, borderRadius: 4, marginTop: 5, marginRight: 8 },
//   routeTextWrap: { flex: 1 },
//   routeLabel: { fontSize: 11, color: Colors.gray, fontWeight: '700', marginBottom: 2 },
//   routeText: { fontSize: 13, color: Colors.dark, fontWeight: '600', lineHeight: 18 },
//   vehicleRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 10 },
//   vehicleText: { fontSize: 12, color: Colors.gray, fontWeight: '600', flex: 1 },
//   badgeScroll: { gap: 8, paddingTop: 10 },
//   prefBadge: { paddingHorizontal: 10, paddingVertical: 6, borderRadius: 12, marginRight: 8 },
//   prefBadgeText: { fontSize: 11, fontWeight: '700' },
//   loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: Colors.white },
//   emptyContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingHorizontal: 40 },
//   emptyTitle: { fontSize: 22, fontWeight: '700', color: Colors.dark, marginTop: 20, marginBottom: 8 },
//   emptySubtitle: { fontSize: 15, color: Colors.gray, textAlign: 'center', lineHeight: 22, marginBottom: 24 },
//   requestAlertButton: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', backgroundColor: Colors.primary, paddingHorizontal: 20, paddingVertical: 14, borderRadius: 12, marginBottom: 12, gap: 8, width: '100%' },
//   requestAlertButtonText: { color: Colors.white, fontSize: 15, fontWeight: '600' },
//   clearButton: { backgroundColor: Colors.primary, paddingHorizontal: 24, paddingVertical: 12, borderRadius: 12 },
//   clearButtonText: { color: Colors.white, fontSize: 15, fontWeight: '700' },
//   modalBackdrop: { flex: 1, backgroundColor: 'rgba(15,23,42,0.28)', justifyContent: 'flex-end' },
//   modalOverlay: { flex: 1 },
//   modalSheet: { backgroundColor: Colors.white, borderTopLeftRadius: 24, borderTopRightRadius: 24, maxHeight: '78%', paddingTop: 10 },
//   requestModalSheet: { backgroundColor: Colors.white, borderTopLeftRadius: 24, borderTopRightRadius: 24, maxHeight: '80%', paddingTop: 10 },
//   modalHandle: { width: 52, height: 5, borderRadius: 999, backgroundColor: '#D1D5DB', alignSelf: 'center', marginBottom: 14 },
//   modalHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 18, paddingBottom: 10 },
//   modalTitle: { fontSize: 20, fontWeight: '800', color: Colors.dark },
//   modalContent: { paddingHorizontal: 18, paddingBottom: 20 },
//   requestModalContent: { padding: 20 },
//   modalSection: { marginBottom: 18 },
//   modalSectionTitle: { fontSize: 14, fontWeight: '700', color: Colors.dark, marginBottom: 10 },
//   modalToggleChip: { borderRadius: 14, borderWidth: 1, borderColor: '#E5E7EB', paddingHorizontal: 14, paddingVertical: 10, alignSelf: 'flex-start', backgroundColor: '#F9FAFB' },
//   modalToggleChipActive: { backgroundColor: Colors.primary, borderColor: Colors.primary },
//   modalToggleChipText: { fontSize: 13, color: Colors.dark, fontWeight: '600' },
//   modalToggleChipTextActive: { color: Colors.white },
//   modalOptionWrap: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
//   modalOptionChip: { borderRadius: 16, borderWidth: 1, borderColor: '#E5E7EB', paddingHorizontal: 12, paddingVertical: 9, backgroundColor: '#F9FAFB' },
//   modalOptionChipActive: { backgroundColor: Colors.primary, borderColor: Colors.primary },
//   modalOptionChipText: { fontSize: 13, color: Colors.dark, fontWeight: '600' },
//   modalOptionChipTextActive: { color: Colors.white },
//   modalFooter: { flexDirection: 'row', paddingHorizontal: 18, paddingTop: 12, paddingBottom: Platform.OS === 'ios' ? 28 : 18, borderTopWidth: 1, borderTopColor: '#EEF2F7', gap: 12 },
//   modalSecondaryBtn: { flex: 1, borderRadius: 14, paddingVertical: 14, alignItems: 'center', backgroundColor: '#F3F4F6' },
//   modalSecondaryBtnText: { fontSize: 15, fontWeight: '700', color: Colors.dark },
//   modalPrimaryBtn: { flex: 1, borderRadius: 14, paddingVertical: 14, alignItems: 'center', backgroundColor: Colors.primary },
//   modalPrimaryBtnText: { fontSize: 15, fontWeight: '700', color: Colors.white },
//   requestInfoBox: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#EFF6FF', padding: 12, borderRadius: 12, marginBottom: 16, gap: 8 },
//   requestInfoText: { flex: 1, fontSize: 13, color: '#1E3A8A', lineHeight: 18 },
//   requestRouteBox: { backgroundColor: '#F3F4F6', padding: 12, borderRadius: 12, marginBottom: 20 },
//   requestRouteLabel: { fontSize: 12, fontWeight: '600', color: Colors.gray, marginBottom: 4 },
//   requestRouteText: { fontSize: 14, fontWeight: '600', color: Colors.dark, marginBottom: 4 },
//   requestRouteDetail: { fontSize: 12, color: Colors.gray, marginTop: 2 },
//   requestInputGroup: { marginBottom: 16 },
//   requestLabel: { fontSize: 14, fontWeight: '600', color: Colors.dark, marginBottom: 8 },
//   requestInput: { borderWidth: 1, borderColor: '#E5E7EB', borderRadius: 12, paddingHorizontal: 12, paddingVertical: 10, fontSize: 14, backgroundColor: '#F9FAFB' },
//   requestTextArea: { minHeight: 80, textAlignVertical: 'top' },
//   requestHelper: { fontSize: 11, color: Colors.gray, marginTop: 4 },
//   requestNoteBox: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#FEF3C7', padding: 12, borderRadius: 12, gap: 8 },
//   requestNoteText: { flex: 1, fontSize: 12, color: '#D97706' },
//   disabledButton: { opacity: 0.6 },
//   imageModalContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.9)' },
//   imageModalContent: { width: '90%', backgroundColor: Colors.white, borderRadius: 20, overflow: 'hidden' },
//   imageModalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 16, borderBottomWidth: 1, borderBottomColor: '#EEF2F7' },
//   imageModalTitle: { fontSize: 18, fontWeight: '700', color: Colors.dark },
//   fullProfileImage: { width: '100%', height: 400, backgroundColor: '#F5F5F5' },
//   noImageContainer: { width: '100%', height: 400, justifyContent: 'center', alignItems: 'center', backgroundColor: '#F5F5F5' },
//   noImageText: { fontSize: 16, color: Colors.gray },
//   svgContainer: { width: 48, height: 48, alignItems: 'center', justifyContent: 'center' },
//   initialsContainer: { width: '100%', height: '100%', alignItems: 'center', justifyContent: 'center', backgroundColor: '#E5E7EB' },
//   modalSvgContainer: { width: '100%', height: 400, backgroundColor: '#F5F5F5', alignItems: 'center', justifyContent: 'center' },
//   debugBanner: { flexDirection: 'row', alignItems: 'center', padding: 12, marginHorizontal: 16, marginTop: 8, marginBottom: 8, borderRadius: 8, gap: 8 },
//   debugBannerSuccess: { backgroundColor: '#DCFCE7', borderLeftWidth: 4, borderLeftColor: '#22C55E' },
//   debugBannerError: { backgroundColor: '#FEE2E2', borderLeftWidth: 4, borderLeftColor: '#EF4444' },
//   debugBannerText: { flex: 1, fontSize: 12, fontWeight: '500' },
//   debugBannerTextSuccess: { color: '#166534' },
//   debugBannerTextError: { color: '#991B1B' },
// });
// import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
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
//   RefreshControl,
//   TextInput,
//   ActivityIndicator,
//   KeyboardAvoidingView,
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
// import { useFocusEffect } from '@react-navigation/native';
// import DatabaseServiceds from '../services/myprofile_ds';
// import createDatabaseService from '../services/createprofile_ds'
// import { AppState } from 'react-native';


// const IMAGE_BASE_URL = API_BASE_URL;

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

// const normalizeLocation = (location) => {
//   if (!location) return '';
//   return location
//     .toLowerCase()
//     .replace(/tower[-\s]*\d+/i, '')
//     .replace(/[-\s]*\d+[-\s]*(?:th|st|nd|rd)/i, '')
//     .replace(/\b(?:tower|block|sector|sect|building|no\.?|#|flat|apartment|apt)\s*\d+/gi, '')
//     .replace(/\b\d+\b/g, '')
//     .replace(/[^\w\s]/g, ' ')
//     .replace(/\s+/g, ' ')
//     .trim();
// };

// const locationsMatch = (loc1, loc2) => {
//   const norm1 = normalizeLocation(loc1);
//   const norm2 = normalizeLocation(loc2);
  
//   if (!norm1 || !norm2) return false;
//   if (norm1 === norm2) return true;
//   if (norm1.includes(norm2) || norm2.includes(norm1)) return true;
  
//   const words1 = norm1.split(' ');
//   const words2 = norm2.split(' ');
//   const commonWords = words1.filter(w => 
//     words2.includes(w) && w.length > 2 && !['the','and','of','to','for','with'].includes(w)
//   );
  
//   if (commonWords.length >= 2) return true;
  
//   const avMatch = (norm1.includes('avenue') && (norm2.includes('av') || norm2.includes('ave'))) ||
//                   ((norm1.includes('av') || norm1.includes('ave')) && norm2.includes('avenue'));
//   const sectorMatch = (norm1.includes('sector') && (norm2.includes('sec') || norm2.includes('sect'))) ||
//                       ((norm1.includes('sec') || norm1.includes('sect')) && norm2.includes('sector'));
//   const gaurCityMatch = (norm1.includes('gaur city') && norm2.includes('gaur city')) ||
//                         (norm1.includes('gaurcity') && norm2.includes('gaur city'));
//   const collegeMatch = (norm1.includes('engineering college') && norm2.includes('engineering college'));
  
//   return avMatch || sectorMatch || gaurCityMatch || collegeMatch;
// };

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

//   if (!prefs || Object.keys(prefs).length === 0) return [];

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
//           if (v && v.trim()) badges.push(v.trim());
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

//   if (key === 'verified_profiles_only') return !!item.isVerified;
//   if (typeof value === 'boolean') return value;
//   if (Array.isArray(value)) return value.length > 0;
//   if (key === 'smoking_policy') return normalized.includes('no');
//   if (key === 'same_gender_after_9pm') return normalized === 'true' || normalized === 'yes' || normalized === 'same gender';
//   if (key === 'pets_allowed') return normalized === 'true' || normalized === 'yes' || normalized === 'allowed';
  
//   return !!normalized;
// }

// function matchesAdvancedFilter(item, key, expectedValue) {
//   if (expectedValue === undefined || expectedValue === null || expectedValue === '') return true;

//   const prefs = getRidePreferences(item);
//   const rideValue = prefs?.[key];

//   if (typeof expectedValue === 'boolean') {
//     if (key === 'verified_profiles_only') return expectedValue ? !!item.isVerified : true;
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
//     if (imageUrl) setIsSvg(imageUrl.toLowerCase().includes('.svg'));
//   }, [imageUrl]);
  
//   if (!visible) return null;
  
//   return (
//     <Modal visible={visible} transparent={true} animationType="fade" onRequestClose={onClose}>
//       <TouchableOpacity style={styles.modalBackdrop} activeOpacity={1} onPress={onClose}>
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
//                   <SvgCssUri uri={imageUrl} width="100%" height={400} />
//                 </View>
//               ) : (
//                 <Image source={{ uri: imageUrl }} style={styles.fullProfileImage} resizeMode="contain" />
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
// // Add this import at the top

// // Persistent Email Verification Modal - Won't close on app background/foreground
// function EmailVerificationModal({ visible, onVerify, onClose }) {
//   const [otp, setOtp] = useState('');
//   const [showOtpInput, setShowOtpInput] = useState(false);
//   const [verificationError, setVerificationError] = useState('');
//   const [sendingOtp, setSendingOtp] = useState(false);
//   const [email, setEmail] = useState('');
//   const [internalVisible, setInternalVisible] = useState(false);
//   const [hasSentOtp, setHasSentOtp] = useState(false);
  
//   // Preserve email and OTP state when app goes to background
//   const preservedEmailRef = useRef('');
//   const preservedOtpRef = useRef('');
//   const preservedShowOtpRef = useRef(false);

//   // Handle modal visibility - preserve state
//   useEffect(() => {
//     if (visible) {
//       // Restore preserved state if available
//       if (preservedEmailRef.current) {
//         setEmail(preservedEmailRef.current);
//         setOtp(preservedOtpRef.current);
//         setShowOtpInput(preservedShowOtpRef.current);
//         setHasSentOtp(preservedShowOtpRef.current);
//       }
//       setInternalVisible(true);
//     } else {
//       // Save state before closing
//       if (showOtpInput) {
//         preservedEmailRef.current = email;
//         preservedOtpRef.current = otp;
//         preservedShowOtpRef.current = showOtpInput;
//       } else {
//         // Clear preserved state on fresh close
//         preservedEmailRef.current = '';
//         preservedOtpRef.current = '';
//         preservedShowOtpRef.current = false;
//       }
//       setInternalVisible(false);
//     }
//   }, [visible]);

//   // Reset preserved state on successful verification
//   const resetPreservedState = () => {
//     preservedEmailRef.current = '';
//     preservedOtpRef.current = '';
//     preservedShowOtpRef.current = false;
//   };

//   const handleSendOtp = async () => {
//     if (!email || !email.includes('@')) {
//       setVerificationError('Please enter a valid email address');
//       return;
//     }
    
//     setSendingOtp(true);
//     setVerificationError('');
    
//     try {
//       const result = await createDatabaseService.sendEmailOTP(email);
      
//       if (result?.success) {
//         setShowOtpInput(true);
//         setHasSentOtp(true);
//         preservedShowOtpRef.current = true;
//         preservedEmailRef.current = email;
//       } else {
//         setVerificationError(result?.message || 'Failed to send verification code');
//       }
//     } catch (error) {
//       setVerificationError('Network error. Please try again.');
//     } finally {
//       setSendingOtp(false);
//     }
//   };

//   const handleVerifyOtp = async () => {
//     if (!otp || otp.length < 4) {
//       setVerificationError('Please enter the verification code');
//       return;
//     }
    
//     setSendingOtp(true);
//     setVerificationError('');
    
//     try {
//       const result = await createDatabaseService.verifyEmailOTP(email, otp);
      
//       if (result?.success) {
//         onVerify(email);
//         resetPreservedState();
//         setOtp('');
//         setShowOtpInput(false);
//         setHasSentOtp(false);
//         setInternalVisible(false);
//         onClose();
//       } else {
//         setVerificationError(result?.message || 'Invalid verification code');
//       }
//     } catch (error) {
//       setVerificationError('Verification failed. Please try again.');
//     } finally {
//       setSendingOtp(false);
//     }
//   };

//   const handleClose = () => {
//     resetPreservedState();
//     setShowOtpInput(false);
//     setOtp('');
//     setVerificationError('');
//     setSendingOtp(false);
//     setEmail('');
//     setHasSentOtp(false);
//     setInternalVisible(false);
//     onClose();
//   };

//   if (!internalVisible) return null;

//   return (
//     <Modal 
//       visible={internalVisible} 
//       transparent={true} 
//       animationType="slide" 
//       onRequestClose={handleClose}
//     >
//       <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.modalBackdrop}>
//         <TouchableOpacity style={styles.modalOverlay} activeOpacity={1} onPress={handleClose} />
        
//         <View style={styles.verifyModalSheet}>
//           <View style={styles.modalHandle} />
          
//           <View style={styles.modalHeader}>
//             <Text style={styles.modalTitle}>Verify Your Email</Text>
//             <TouchableOpacity onPress={handleClose}>
//               <Ionicons name="close" size={24} color={Colors.dark} />
//             </TouchableOpacity>
//           </View>
          
//           <ScrollView 
//             showsVerticalScrollIndicator={false}
//             keyboardShouldPersistTaps="handled"
//           >
//             <View style={styles.verifyModalContent}>
//               <View style={styles.verifyInfoBox}>
//                 <Ionicons name="mail-outline" size={48} color={Colors.primary} />
//                 <Text style={styles.verifyTitle}>Email Required</Text>
//                 <Text style={styles.verifyDescription}>
//                   Please verify your email to receive ride alerts.
//                 </Text>
//               </View>
              
//               {!showOtpInput ? (
//                 <>
//                   <View style={styles.requestInputGroup}>
//                     <Text style={styles.requestLabel}>Email Address</Text>
//                     <TextInput
//                       style={[styles.requestInput, verificationError && styles.inputError]}
//                       placeholder="Enter your email address"
//                       value={email}
//                       onChangeText={(text) => {
//                         setEmail(text);
//                         setVerificationError('');
//                         preservedEmailRef.current = text;
//                       }}
//                       keyboardType="email-address"
//                       autoCapitalize="none"
//                       autoComplete="email"
//                     />
//                     {verificationError && <Text style={styles.errorText}>{verificationError}</Text>}
//                   </View>
                  
//                   <TouchableOpacity
//                     style={[styles.modalPrimaryBtn, sendingOtp && styles.disabledButton]}
//                     onPress={handleSendOtp}
//                     disabled={sendingOtp || !email}
//                   >
//                     {sendingOtp ? (
//                       <ActivityIndicator size="small" color={Colors.white} />
//                     ) : (
//                       <Text style={styles.modalPrimaryBtnText}>Send Verification Code</Text>
//                     )}
//                   </TouchableOpacity>
//                 </>
//               ) : (
//                 <>
//                   <View style={styles.requestInputGroup}>
//                     <Text style={styles.requestLabel}>Verification Code</Text>
//                     <TextInput
//                       style={[styles.requestInput, verificationError && styles.inputError]}
//                       placeholder="Enter 6-digit code"
//                       value={otp}
//                       onChangeText={(text) => {
//                         setOtp(text);
//                         setVerificationError('');
//                         preservedOtpRef.current = text;
//                       }}
//                       keyboardType="number-pad"
//                       maxLength={6}
//                     />
//                     {verificationError && <Text style={styles.errorText}>{verificationError}</Text>}
//                     <Text style={styles.requestHelper}>
//                       Enter the code sent to {email}
//                     </Text>
//                   </View>
                  
//                   <TouchableOpacity
//                     style={[styles.modalPrimaryBtn, sendingOtp && styles.disabledButton]}
//                     onPress={handleVerifyOtp}
//                     disabled={sendingOtp || otp.length < 4}
//                   >
//                     {sendingOtp ? (
//                       <ActivityIndicator size="small" color={Colors.white} />
//                     ) : (
//                       <Text style={styles.modalPrimaryBtnText}>Verify & Continue</Text>
//                     )}
//                   </TouchableOpacity>
                  
//                   <TouchableOpacity
//                     style={styles.resendButton}
//                     onPress={handleSendOtp}
//                     disabled={sendingOtp}
//                   >
//                     <Text style={styles.resendButtonText}>Resend Code</Text>
//                   </TouchableOpacity>
//                 </>
//               )}
//             </View>
//           </ScrollView>
//         </View>
//       </KeyboardAvoidingView>
//     </Modal>
//   );
// }


// export default function RideNextScreen({ navigation, route }) {
//   const { user: authUser, loading: authLoading, refreshUser } = useAuth();
//   const { searchData } = route.params || {};
//   const { from, to, fromCoords, toCoords, dateTime, seats } = searchData || {};

//   // Local user state for email verification status
//   const [localUser, setLocalUser] = useState(null);
//   const [isLoadingProfile, setIsLoadingProfile] = useState(false);

//   const [availableRides, setAvailableRides] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [refreshing, setRefreshing] = useState(false);
//   const [errorMessage, setErrorMessage] = useState('');
//   const [sortBy, setSortBy] = useState('time');
//   const [quickFilters, setQuickFilters] = useState([]);
//   const [headerFiltersVisible, setHeaderFiltersVisible] = useState(false);
//   const [filterModalVisible, setFilterModalVisible] = useState(false);
//   const [preferenceMaster, setPreferenceMaster] = useState([]);
//   const [userPreferences, setUserPreferences] = useState({});
//   const [advancedFilters, setAdvancedFilters] = useState({});
  
//   const [showRideRequestModal, setShowRideRequestModal] = useState(false);
//   const [showEmailVerification, setShowEmailVerification] = useState(false);
//   const [rideRequestLoading, setRideRequestLoading] = useState(false);
//   const [rideRequestNotes, setRideRequestNotes] = useState('');
//   const [lastRequestStatus, setLastRequestStatus] = useState(null);
//   const [pendingRideRequest, setPendingRideRequest] = useState(false);
  
// // Add this state
// const [appState, setAppState] = useState(AppState.currentState);

// // Add this useEffect
// useEffect(() => {
//   const subscription = AppState.addEventListener('change', (nextAppState) => {
//     console.log('App state changed from', appState, 'to', nextAppState);
//     setAppState(nextAppState);
//     // No need to close modal - just preserve state
//   });

//   return () => {
//     subscription.remove();
//   };
// }, [appState]);
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

//   const [notifiedRequestIds, setNotifiedRequestIds] = useState(new Set());
//   const hasInitialized = useRef(false);

//   const phoneNumber = authUser?.phone_number || localUser?.phone_number;
//   const userGender = authUser?.gender || localUser?.gender;
//   const requestedSeats = seats || 1;
  
//   // Use local user data for email verification status
//   const hasVerifiedEmail = (localUser?.email_verified === true) && localUser?.email;
//   const userEmail = localUser?.email || '';

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

//   // Load user profile using DatabaseService
//   const loadUserProfile = useCallback(async () => {
//     if (!phoneNumber) return;
    
//     try {
//       setIsLoadingProfile(true);
//       const res = await DatabaseServiceds.getUserProfile(phoneNumber);
      
//       if (res?.success && res.user) {
//         const userData = res.user;
//         setLocalUser(userData);
//       }
//     } catch (err) {
//       console.log("Profile fetch error:", err);
//     } finally {
//       setIsLoadingProfile(false);
//     }
//   }, [phoneNumber]);

//   const checkUserRideRequests = useCallback(async () => {
//     if (!phoneNumber) return;
    
//     try {
//       const response = await fetch(`${API_BASE_URL}/my-ride-requests/${phoneNumber}`);
//       const data = await response.json();
      
//       if (data.success && data.requests) {
//         console.log(`📊 Found ${data.requests.length} ride requests`);
//       }
//     } catch (error) {
//       console.log('❌ Error checking ride requests:', error);
//     }
//   }, [phoneNumber]);

//   const checkMatchingWithCurrentRides = useCallback(async () => {
//     if (!phoneNumber || availableRides.length === 0) return;
    
//     try {
//       const response = await fetch(`${API_BASE_URL}/my-ride-requests/${phoneNumber}`);
//       const data = await response.json();
      
//       if (!data.success || !data.requests) return;
      
//       const activeRequests = data.requests.filter(req => 
//         req.status === 'active' && !notifiedRequestIds.has(req.id)
//       );
      
//       for (const req of activeRequests) {
//         for (const ride of availableRides) {
//           const fromMatch = locationsMatch(ride.from, req.from_location);
//           const toMatch = locationsMatch(ride.to, req.to_location);
          
//           if (fromMatch && toMatch) {
//             setNotifiedRequestIds(prev => new Set([...prev, req.id]));
//             showCustomAlert(
//               'Ride Match Found! 🎉',
//               `A ride matching your request is now available!`,
//               'success'
//             );
//             break;
//           }
//         }
//       }
//     } catch (error) {
//       console.log('❌ Error checking matches:', error);
//     }
//   }, [phoneNumber, availableRides, notifiedRequestIds]);

//   // Update user email in profile after verification
//   const updateUserEmailVerified = async (verifiedEmail, userPhoneNumber) => {
//     try {
//       const response = await fetch(`${API_BASE_URL}/api/v1/users/updateprofile`, {
//         method: 'PUT',
//         headers: { 'Content-Type': 'application/json' },
//         body: JSON.stringify({
//           phone_number: userPhoneNumber || phoneNumber,
//           email: verifiedEmail,
//           email_verified: true,
//         }),
//       });
      
//       if (response.ok) {
//         await loadUserProfile();
//         if (refreshUser) {
//           await refreshUser();
//         }
//         return true;
//       }
//       return false;
//     } catch (error) {
//       console.log('Error updating email verification:', error);
//       return false;
//     }
//   };

//   // Submit the actual ride request
//   const submitRideRequest = async (emailToUse) => {
//     if (!emailToUse || !emailToUse.includes('@')) {
//       showCustomAlert('Invalid Email', 'Please provide a valid email address.', 'error');
//       return false;
//     }
    
//     setRideRequestLoading(true);
//     setLastRequestStatus(null);
    
//     try {
//       const requestBody = {
//         from_location: from,
//         to_location: to,
//         from_coords: fromCoords,
//         to_coords: toCoords,
//         preferred_date: dateTime,
//         preferred_time: new Date(dateTime).toLocaleTimeString(),
//         seats_needed: requestedSeats,
//         passenger_phone: phoneNumber,
//         passenger_name: authUser?.full_name || localUser?.full_name || authUser?.first_name,
//         passenger_email: emailToUse,
//         notes: rideRequestNotes
//       };
      
//       const response = await fetch(`${API_BASE_URL}/request-ride-alert`, {
//         method: 'POST',
//         headers: { 'Content-Type': 'application/json' },
//         body: JSON.stringify(requestBody),
//       });
      
//       const result = await response.json();
      
//       if (result.success) {
//         setLastRequestStatus({
//           success: true,
//           message: `Request #${result.request_id} created. We'll email you when a ride is available.`
//         });
        
//         showCustomAlert(
//           'Request Submitted! 📧', 
//           `We'll email you at ${emailToUse} when a ride matching your route is posted.\n\nRequest expires in 7 days.`,
//           'success'
//         );
//         setShowRideRequestModal(false);
//         setRideRequestNotes('');
//         setPendingRideRequest(false);
        
//         setTimeout(() => {
//           fetchAvailableRides(true);
//         }, 1000);
        
//         return true;
//       } else {
//         setLastRequestStatus({
//           success: false,
//           message: result.message || 'Could not create ride request'
//         });
//         showCustomAlert('Request Failed', result.message || 'Could not create ride request', 'error');
//         return false;
//       }
//     } catch (error) {
//       setLastRequestStatus({
//         success: false,
//         message: error.message || 'Network error'
//       });
//       showCustomAlert('Error', 'Could not create ride request. Please try again.', 'error');
//       return false;
//     } finally {
//       setRideRequestLoading(false);
//     }
//   };

//   // Handle ride request button press
//   const handleRequestRideAlert = () => {
//     if (hasVerifiedEmail && userEmail) {
//       submitRideRequest(userEmail);
//     } else {
//       setPendingRideRequest(true);
//       setShowEmailVerification(true);
//     }
//   };

//   // Handle successful email verification
//   const handleEmailVerified = async (verifiedEmail) => {
//     setShowEmailVerification(false);
//     const success = await updateUserEmailVerified(verifiedEmail, phoneNumber);
    
//     if (success) {
//       if (pendingRideRequest) {
//         await submitRideRequest(verifiedEmail);
//         setPendingRideRequest(false);
//       }
//       showCustomAlert('Success', 'Email verified successfully!', 'success');
//     } else {
//       showCustomAlert('Error', 'Failed to update email verification status', 'error');
//     }
//   };

//   // Fetch available rides
//   const fetchAvailableRides = useCallback(async (showRefresh = false) => {
//     if (!searchData || !fromCoords || !toCoords || !dateTime) {
//       setAvailableRides([]);
//       setLoading(false);
//       return;
//     }

//     try {
//       if (showRefresh) {
//         setRefreshing(true);
//       } else {
//         setLoading(true);
//       }
//       setErrorMessage('');

//       const requestBody = {
//         from_location: from,
//         to_location: to,
//         from_coords: fromCoords,
//         to_coords: toCoords,
//         departure_time: new Date(dateTime).toISOString(),
//         seats_required: requestedSeats,
//         passenger_gender: userGender,
//       };
      
//       const response = await fetch(`${API_BASE_URL}/search-rides`, {
//         method: 'POST',
//         headers: { 'Content-Type': 'application/json' },
//         body: JSON.stringify(requestBody),
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
          
//           let availableSeats = ride.seatsAvailable || ride.available_seats || 0;
          
//           return { 
//             ...ride, 
//             isVerified, 
//             rating: avgRating,
//             profilePicture: finalProfilePicture,
//             profilepicture: finalProfilePicture,
//             profilePhoto: finalProfilePicture,
//             pickupLabel: ride.pickupLabel || ride.pickupLocationName || ride.fromLocationName || ride.from || 'Pickup point',
//             dropLabel: ride.dropLabel || ride.dropLocationName || ride.toLocationName || ride.to || 'Drop point',
//             womenOnly: ride.womenOnly === true || ride.women_only === true,
//             seatsAvailable: availableSeats,
//             requestedSeats: requestedSeats,
//             isFull: availableSeats === 0,
//           };
//         })
//       );
      
//       setAvailableRides(ridesWithDetails);
//       await checkMatchingWithCurrentRides();
      
//     } catch (error) {
//       setAvailableRides([]);
//       setErrorMessage(error.message || 'Failed to search rides');
//       showCustomAlert('Search Error', error.message || 'Failed to search rides', 'error');
//     } finally {
//       setLoading(false);
//       setRefreshing(false);
//     }
//   }, [searchData, from, to, fromCoords, toCoords, dateTime, requestedSeats, userGender, checkMatchingWithCurrentRides]);

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

//   // Initial load
//   useEffect(() => {
//     if (authLoading) return;
//     if (hasInitialized.current) return;
//     hasInitialized.current = true;
    
//     loadUserProfile();
//     fetchAvailableRides();
//     loadPreferenceData();
//     checkUserRideRequests();
//   }, [authLoading]);

//   // Refresh when screen comes into focus
//   useFocusEffect(
//     useCallback(() => {
//       loadUserProfile();
//       fetchAvailableRides(true);
//       checkUserRideRequests();
      
//       return () => {};
//     }, [])
//   );

//   // Manual refresh
//   const onRefresh = useCallback(() => {
//     setNotifiedRequestIds(new Set());
//     loadUserProfile();
//     fetchAvailableRides(true);
//     checkUserRideRequests();
//   }, [fetchAvailableRides, checkUserRideRequests, loadUserProfile]);

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

//     if (userGender !== 'female') {
//       rides = rides.filter(item => !(item.womenOnly === true));
//     }

//     if (quickFilters.length > 0) {
//       rides = rides.filter(item =>
//         quickFilters.every(key => matchesQuickFilter(item, key))
//       );
//     }

//     const activeAdvanced = Object.entries(advancedFilters).filter(
//       ([, value]) => value !== '' && value !== null && value !== undefined && value !== false
//     );

//     if (activeAdvanced.length > 0) {
//       rides = rides.filter(item =>
//         activeAdvanced.every(([key, value]) => matchesAdvancedFilter(item, key, value))
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
//       ride: ride,
//       searchData: {
//         fromCoords: fromCoords,
//         toCoords: toCoords,
//         fromAddress: searchData?.fromAddress || ride.from || '',
//         toAddress: searchData?.toAddress || ride.to || '',
//         fromPlaceName: searchData?.fromPlaceName || ride.pickupLabel || ride.from?.split(',')[0] || '',
//         toPlaceName: searchData?.toPlaceName || ride.dropLabel || ride.to?.split(',')[0] || '',
//         date: dateTime,
//         time: new Date(dateTime).toLocaleTimeString(),
//         seats: requestedSeats
//       }
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
//           onPress={() => setAdvancedFilters(prev => ({ ...prev, [pref.key]: !active }))}
//         >
//           <Text style={[styles.modalToggleChipText, active && styles.modalToggleChipTextActive]}>
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
//                 style={[styles.modalOptionChip, active && styles.modalOptionChipActive]}
//                 onPress={() => setAdvancedFilters(prev => ({ ...prev, [pref.key]: active ? '' : opt }))}
//               >
//                 <Text style={[styles.modalOptionChipText, active && styles.modalOptionChipTextActive]}>
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

//   const RideRequestModal = () => {
//     return (
//       <Modal visible={showRideRequestModal} transparent={true} animationType="slide" onRequestClose={() => setShowRideRequestModal(false)}>
//         <View style={styles.modalBackdrop}>
//           <TouchableOpacity style={styles.modalOverlay} activeOpacity={1} onPress={() => setShowRideRequestModal(false)} />
          
//           <View style={styles.requestModalSheet}>
//             <View style={styles.modalHandle} />
            
//             <View style={styles.modalHeader}>
//               <Text style={styles.modalTitle}>Request Ride Alert</Text>
//               <TouchableOpacity onPress={() => setShowRideRequestModal(false)}>
//                 <Ionicons name="close" size={24} color={Colors.dark} />
//               </TouchableOpacity>
//             </View>
            
//             <ScrollView showsVerticalScrollIndicator={false}>
//               <View style={styles.requestModalContent}>
//                 <View style={styles.requestInfoBox}>
//                   <Ionicons name="information-circle" size={20} color={Colors.primary} />
//                   <Text style={styles.requestInfoText}>
//                     No rides found for this route. We'll email you when a ride becomes available.
//                   </Text>
//                 </View>
                
//                 <View style={styles.requestRouteBox}>
//                   <Text style={styles.requestRouteLabel}>Route:</Text>
//                   <Text style={styles.requestRouteText}>{from} → {to}</Text>
//                   <Text style={styles.requestRouteDetail}>
//                     {new Date(dateTime).toLocaleDateString()} at {new Date(dateTime).toLocaleTimeString()}
//                   </Text>
//                   <Text style={styles.requestRouteDetail}>
//                     {requestedSeats} seat{requestedSeats !== 1 ? 's' : ''} needed
//                   </Text>
//                 </View>
                
//                 {!hasVerifiedEmail && (
//                   <View style={styles.requestNoteBox}>
//                     <Ionicons name="mail-outline" size={16} color="#D97706" />
//                     <Text style={styles.requestNoteText}>
//                       Email verification required. You'll need to verify your email to receive alerts.
//                     </Text>
//                   </View>
//                 )}
                
//                 <View style={styles.requestNoteBox}>
//                   <Ionicons name="time-outline" size={16} color={Colors.gray} />
//                   <Text style={styles.requestNoteText}>
//                     Your request will remain active for 7 days. You can cancel it anytime in your profile.
//                   </Text>
//                 </View>
//               </View>
//             </ScrollView>
            
//             <View style={styles.modalFooter}>
//               <TouchableOpacity style={styles.modalSecondaryBtn} onPress={() => setShowRideRequestModal(false)}>
//                 <Text style={styles.modalSecondaryBtnText}>Cancel</Text>
//               </TouchableOpacity>
              
//               <TouchableOpacity
//                 style={[styles.modalPrimaryBtn, rideRequestLoading && styles.disabledButton]}
//                 onPress={handleRequestRideAlert}
//                 disabled={rideRequestLoading}
//               >
//                 {rideRequestLoading ? (
//                   <ActivityIndicator size="small" color={Colors.white} />
//                 ) : (
//                   <Text style={styles.modalPrimaryBtnText}>
//                     {hasVerifiedEmail ? 'Get Email Alert' : 'Verify Email & Continue'}
//                   </Text>
//                 )}
//               </TouchableOpacity>
//             </View>
//           </View>
//         </View>
//       </Modal>
//     );
//   };

//   const renderRideCard = ({ item }) => {
//     let profilePhotoUrl = null;
//     let isSvg = false;
    
//     if (item.profilePicture) profilePhotoUrl = buildImageUrl(item.profilePicture);
//     else if (item.profilepicture) profilePhotoUrl = buildImageUrl(item.profilepicture);
//     else if (item.profilePhoto) profilePhotoUrl = buildImageUrl(item.profilePhoto);
//     else if (item.driverProfilePicture) profilePhotoUrl = buildImageUrl(item.driverProfilePicture);
    
//     if (profilePhotoUrl && profilePhotoUrl.toLowerCase().includes('.svg')) isSvg = true;
    
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
//     }

//     const preferenceBadges = extractPreferenceBadges(item);
//     const isDriverVerified = item.isVerified;
//     const driverRating = item.rating || 0;

//     const pickupName = item.pickupLabel || item.from || 'Pickup point';
//     const dropName = item.dropLabel || item.to || 'Drop point';
    
//     const seatsAvailable = item.seatsAvailable || 0;
//     const isSeatsInsufficient = requestedSeats > seatsAvailable && seatsAvailable > 0;
//     const isFull = seatsAvailable === 0;
//     const canBook = !isFull && seatsAvailable >= requestedSeats;

//     return (
//       <TouchableOpacity
//         style={[styles.rideCard, !canBook && !isFull && styles.rideCardWarning, isFull && styles.rideCardFull]}
//         onPress={() => handleCardPress(item)}
//         activeOpacity={0.9}
//       >
//         <View style={styles.cardTopRow}>
//           <View style={styles.profileRow}>
//             <TouchableOpacity onPress={() => handleCardPress(item)} activeOpacity={0.8}>
//               <View style={styles.avatarContainer}>
//                 {profilePhotoUrl ? (
//                   isSvg ? (
//                     <View style={styles.svgContainer}>
//                       <SvgCssUri uri={profilePhotoUrl} width="48" height="48" />
//                     </View>
//                   ) : (
//                     <Image source={{ uri: profilePhotoUrl }} style={styles.avatarImage} resizeMode="cover" />
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
//                 <Text style={styles.driverName} numberOfLines={1}>{driverNameText}</Text>

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
                
//                 {isFull && (
//                   <View style={styles.fullBadge}>
//                     <Ionicons name="close-circle" size={12} color="#EF4444" />
//                     <Text style={styles.fullBadgeText}>Full</Text>
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
//             <Text style={[styles.infoText, isFull ? styles.fullText : (isSeatsInsufficient && styles.warningText)]} numberOfLines={1}>
//               {isFull ? 'Ride Full' : `${seatsAvailable} left`}
//             </Text>
//           </View>
//         </View>

//         {isFull && (
//           <View style={styles.fullWarningContainer}>
//             <Ionicons name="close-circle" size={14} color="#EF4444" />
//             <Text style={styles.fullWarningText}>This ride is currently full. Check back later or try another ride.</Text>
//           </View>
//         )}

//         {!isFull && isSeatsInsufficient && seatsAvailable > 0 && (
//           <View style={styles.seatWarningContainer}>
//             <Ionicons name="warning" size={14} color="#D97706" />
//             <Text style={styles.seatWarningText}>
//               Only {seatsAvailable} seat{seatsAvailable !== 1 ? 's' : ''} left. You requested {requestedSeats} seat{requestedSeats !== 1 ? 's' : ''}.
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
//           <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.badgeScroll}>
//             {preferenceBadges.map((badge, index) => (
//               <PreferenceTag key={`${badge}-${index}`} label={badge} />
//             ))}
//           </ScrollView>
//         )}
//       </TouchableOpacity>
//     );
//   };

//   if (authLoading || loading || isLoadingProfile) {
//     return (
//       <View style={styles.loadingContainer}>
//         <LottieView source={require("../assets/loading.json")} autoPlay loop style={{ width: 300, height: 300 }} />
//       </View>
//     );
//   }

//   return (
//     <SafeAreaView style={styles.container}>
//       <StatusBar barStyle="dark-content" backgroundColor={Colors.white} />

//       <View style={styles.header}>
//         <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
//           <MaterialIcons name="arrow-back-ios" size={24} color="#ED7117" />
//         </TouchableOpacity>

//         <Text style={styles.headerTitle}>Available Rides</Text>

//         <TouchableOpacity
//           style={[styles.filterButton, headerFiltersVisible && styles.filterButtonActive]}
//           onPress={() => setHeaderFiltersVisible(prev => !prev)}
//         >
//           <Ionicons name="options-outline" size={22} color="#ED7117" />
//         </TouchableOpacity>
//       </View>

//       {lastRequestStatus && (
//         <View style={[styles.debugBanner, lastRequestStatus.success ? styles.debugBannerSuccess : styles.debugBannerError]}>
//           <Ionicons name={lastRequestStatus.success ? "checkmark-circle" : "alert-circle"} size={18} color={lastRequestStatus.success ? "#166534" : "#991B1B"} />
//           <Text style={[styles.debugBannerText, lastRequestStatus.success ? styles.debugBannerTextSuccess : styles.debugBannerTextError]}>
//             {lastRequestStatus.message}
//           </Text>
//           <TouchableOpacity onPress={() => setLastRequestStatus(null)}>
//             <Ionicons name="close" size={16} color={lastRequestStatus.success ? "#166534" : "#991B1B"} />
//           </TouchableOpacity>
//         </View>
//       )}

//       {headerFiltersVisible && (
//         <View style={styles.topControlsWrap}>
//           <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterScroll}>
//             {quickFilterOptions.map((filter) => {
//               const active = quickFilters.includes(filter.key);
//               return (
//                 <TouchableOpacity
//                   key={filter.key}
//                   activeOpacity={0.85}
//                   style={[styles.quickChip, active && styles.quickChipActive]}
//                   onPress={() => toggleQuickFilter(filter.key)}
//                 >
//                   <Text style={[styles.quickChipText, active && styles.quickChipTextActive]}>{filter.label}</Text>
//                 </TouchableOpacity>
//               );
//             })}
//             <TouchableOpacity activeOpacity={0.85} style={styles.moreFilterChip} onPress={() => setFilterModalVisible(true)}>
//               <Ionicons name="options-outline" size={14} color="#ED7117" />
//               <Text style={styles.moreFilterChipText}>More Filters</Text>
//             </TouchableOpacity>
//           </ScrollView>

//           <Text style={styles.sortLabel}>Sort by</Text>

//           <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.sortScroll}>
//             {SORT_OPTIONS.map((option) => {
//               const active = sortBy === option.key;
//               return (
//                 <TouchableOpacity
//                   key={option.key}
//                   activeOpacity={0.85}
//                   style={[styles.sortChip, active && styles.sortChipActive]}
//                   onPress={() => setSortBy(option.key)}
//                 >
//                   <Text style={[styles.sortChipText, active && styles.sortChipTextActive]}>{option.label}</Text>
//                 </TouchableOpacity>
//               );
//             })}
//           </ScrollView>
//         </View>
//       )}

//       {processedRides.length === 0 ? (
//         <View style={styles.emptyContainer}>
//           <Ionicons name="car-outline" size={80} color={Colors.gray} />
//           <Text style={styles.emptyTitle}>No Rides Found</Text>
//           <Text style={styles.emptySubtitle}>
//             {errorMessage ? errorMessage : 'No rides available for this route at the selected time.'}
//           </Text>

//           <TouchableOpacity style={styles.requestAlertButton} onPress={() => setShowRideRequestModal(true)}>
//             <Ionicons name="notifications-outline" size={20} color={Colors.white} />
//             <Text style={styles.requestAlertButtonText}>Notify me when a ride is available</Text>
//           </TouchableOpacity>

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
//           refreshControl={
//             <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[Colors.primary]} tintColor={Colors.primary} />
//           }
//           ItemSeparatorComponent={() => <View style={{ height: 12 }} />}
//         />
//       )}

//       <Modal visible={filterModalVisible} transparent animationType="slide" onRequestClose={() => setFilterModalVisible(false)}>
//         <View style={styles.modalBackdrop}>
//           <TouchableOpacity style={styles.modalOverlay} activeOpacity={1} onPress={() => setFilterModalVisible(false)} />
//           <View style={styles.modalSheet}>
//             <View style={styles.modalHandle} />
//             <View style={styles.modalHeader}>
//               <Text style={styles.modalTitle}>More Filters</Text>
//               <TouchableOpacity onPress={() => setFilterModalVisible(false)}>
//                 <Ionicons name="close" size={24} color={Colors.dark} />
//               </TouchableOpacity>
//             </View>
//             <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.modalContent}>
//               {advancedFilterOptions.map((pref) => (
//                 <View key={pref.key} style={styles.modalSection}>
//                   <Text style={styles.modalSectionTitle}>{pref.label}</Text>
//                   {renderAdvancedFilterControl(pref)}
//                 </View>
//               ))}
//             </ScrollView>
//             <View style={styles.modalFooter}>
//               <TouchableOpacity style={styles.modalSecondaryBtn} onPress={clearAllFilters}>
//                 <Text style={styles.modalSecondaryBtnText}>Clear</Text>
//               </TouchableOpacity>
//               <TouchableOpacity style={styles.modalPrimaryBtn} onPress={() => setFilterModalVisible(false)}>
//                 <Text style={styles.modalPrimaryBtnText}>Apply Filters</Text>
//               </TouchableOpacity>
//             </View>
//           </View>
//         </View>
//       </Modal>

//       <RideRequestModal />

//       <EmailVerificationModal
//         visible={showEmailVerification}
//         onVerify={handleEmailVerified}
//         onClose={() => {
//           setShowEmailVerification(false);
//           setPendingRideRequest(false);
//         }}
//       />

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
//   container: { flex: 1, backgroundColor: '#fff' },
//   header: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 12, borderBottomWidth: 0.5, borderBottomColor: '#fff', backgroundColor: Colors.white },
//   backButton: { width: 44, height: 44, justifyContent: 'center' },
//   filterButton: { width: 44, height: 44, justifyContent: 'center', alignItems: 'center', borderRadius: 22 },
//   filterButtonActive: { backgroundColor: '#fff' },
//   headerTitle: { ...Typography.h2, fontSize: 28, fontWeight: '700', color: Colors.primary, flex: 1, textAlign: 'center' },
//   topControlsWrap: { backgroundColor: Colors.white, paddingTop: 10, paddingBottom: 12, borderBottomWidth: 1, borderBottomColor: '#EEF2F7' },
//   filterScroll: { paddingHorizontal: 16, gap: 10 },
//   quickChip: { paddingHorizontal: 14, paddingVertical: 10, borderRadius: 20, backgroundColor: '#F3F4F6' },
//   quickChipActive: { backgroundColor: Colors.primary },
//   quickChipText: { fontSize: 12, fontWeight: '600', color: Colors.dark },
//   quickChipTextActive: { color: Colors.white },
//   moreFilterChip: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 14, paddingVertical: 10, borderRadius: 20, backgroundColor: '#EEF6FF' },
//   moreFilterChipText: { fontSize: 12, fontWeight: '700', color: '#ED7117' },
//   sortLabel: { paddingHorizontal: 16, marginTop: 12, marginBottom: 8, fontSize: 12, color: Colors.gray, fontWeight: '700' },
//   sortScroll: { paddingHorizontal: 16, gap: 10 },
//   sortChip: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 14, backgroundColor: '#F3F4F6' },
//   sortChipActive: { backgroundColor: '#ED7117' },
//   sortChipText: { fontSize: 12, color: Colors.dark, fontWeight: '600' },
//   sortChipTextActive: { color: Colors.white },
//   listContent: { padding: 16, paddingBottom: 28 },
//   rideCard: { backgroundColor: Colors.white, borderRadius: 18, padding: 14, borderWidth: 1, borderColor: '#EEF2F7', shadowColor: '#0F172A', shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.05, shadowRadius: 14, elevation: 2 },
//   rideCardWarning: { backgroundColor: '#FFFBEB', borderColor: '#FDE68A' },
//   rideCardFull: { backgroundColor: '#FEF2F2', borderColor: '#FEE2E2', opacity: 0.85 },
//   cardTopRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
//   profileRow: { flexDirection: 'row', flex: 1, paddingRight: 10 },
//   avatarContainer: { width: 48, height: 48, borderRadius: 24, backgroundColor: '#E5E7EB', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', marginRight: 10 },
//   avatarImage: { width: 48, height: 48 },
//   avatarFallback: { fontSize: 14, fontWeight: '800', color: Colors.gray },
//   profileContent: { flex: 1 },
//   nameRow: { flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap', gap: 6 },
//   driverName: { fontSize: 15, fontWeight: '800', color: Colors.dark, maxWidth: '100%' },
//   verifiedBadge: { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: '#E8F5E9', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 12 },
//   verifiedText: { fontSize: 10, fontWeight: '700', color: '#16A34A' },
//   womenOnlyBadge: { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: '#FCE4EC', paddingHorizontal: 8, paddingVertical: 3, borderRadius: 12 },
//   womenOnlyBadgeText: { fontSize: 10, color: '#E91E63', fontWeight: '700' },
//   fullBadge: { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: '#FEF2F2', paddingHorizontal: 8, paddingVertical: 3, borderRadius: 12, borderWidth: 1, borderColor: '#FEE2E2' },
//   fullBadgeText: { fontSize: 10, color: '#EF4444', fontWeight: '700' },
//   ratingRow: { flexDirection: 'row', alignItems: 'center', marginTop: 4 },
//   ratingText: { fontSize: 11, color: Colors.gray, fontWeight: '600' },
//   priceMatchWrap: { alignItems: 'flex-end' },
//   matchBadge: { backgroundColor: '#EEF6FF', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 10, marginBottom: 6 },
//   matchText: { fontSize: 12, fontWeight: '800', color: Colors.primary },
//   priceText: { fontSize: 18, fontWeight: '800', color: '#ED7117', lineHeight: 20 },
//   perSeatText: { fontSize: 10, color: Colors.gray, fontWeight: '600', marginTop: 2 },
//   infoRow: { flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap', marginTop: 12, marginBottom: 10 },
//   infoItem: { flexDirection: 'row', alignItems: 'center', gap: 4 },
//   infoText: { fontSize: 12, color: Colors.dark, fontWeight: '600' },
//   warningText: { color: '#F59E0B' },
//   fullText: { color: '#EF4444' },
//   infoDot: { width: 4, height: 4, borderRadius: 2, backgroundColor: '#CBD5E1', marginHorizontal: 8 },
//   seatWarningContainer: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#FEF3C7', borderRadius: 8, padding: 8, marginTop: 8, marginBottom: 4, gap: 6 },
//   seatWarningText: { flex: 1, fontSize: 11, color: '#D97706', fontWeight: '600' },
//   fullWarningContainer: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#FEF2F2', borderRadius: 8, padding: 8, marginTop: 8, marginBottom: 4, borderWidth: 1, borderColor: '#FEE2E2', gap: 6 },
//   fullWarningText: { flex: 1, fontSize: 11, color: '#EF4444', fontWeight: '600' },
//   divider: { height: 1, backgroundColor: '#EEF2F7', marginBottom: 10 },
//   routeBlock: { gap: 8 },
//   routeRow: { flexDirection: 'row', alignItems: 'flex-start' },
//   routeDot: { width: 8, height: 8, borderRadius: 4, marginTop: 5, marginRight: 8 },
//   routeTextWrap: { flex: 1 },
//   routeLabel: { fontSize: 11, color: Colors.gray, fontWeight: '700', marginBottom: 2 },
//   routeText: { fontSize: 13, color: Colors.dark, fontWeight: '600', lineHeight: 18 },
//   vehicleRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 10 },
//   vehicleText: { fontSize: 12, color: Colors.gray, fontWeight: '600', flex: 1 },
//   badgeScroll: { gap: 8, paddingTop: 10 },
//   prefBadge: { paddingHorizontal: 10, paddingVertical: 6, borderRadius: 12, marginRight: 8 },
//   prefBadgeText: { fontSize: 11, fontWeight: '700' },
//   loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: Colors.white },
//   emptyContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingHorizontal: 40 },
//   emptyTitle: { fontSize: 22, fontWeight: '700', color: Colors.dark, marginTop: 20, marginBottom: 8 },
//   emptySubtitle: { fontSize: 15, color: Colors.gray, textAlign: 'center', lineHeight: 22, marginBottom: 24 },
//   requestAlertButton: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', backgroundColor: Colors.primary, paddingHorizontal: 20, paddingVertical: 14, borderRadius: 12, marginBottom: 12, gap: 8, width: '100%' },
//   requestAlertButtonText: { color: Colors.white, fontSize: 15, fontWeight: '600' },
//   clearButton: { backgroundColor: Colors.primary, paddingHorizontal: 24, paddingVertical: 12, borderRadius: 12 },
//   clearButtonText: { color: Colors.white, fontSize: 15, fontWeight: '700' },
//   modalBackdrop: { flex: 1, backgroundColor: 'rgba(15,23,42,0.28)', justifyContent: 'flex-end' },
//   modalOverlay: { flex: 1 },
//   modalSheet: { backgroundColor: Colors.white, borderTopLeftRadius: 24, borderTopRightRadius: 24, maxHeight: '78%', paddingTop: 10 },
//   requestModalSheet: { backgroundColor: Colors.white, borderTopLeftRadius: 24, borderTopRightRadius: 24, maxHeight: '80%', paddingTop: 10 },
//   verifyModalSheet: { backgroundColor: Colors.white, borderTopLeftRadius: 24, borderTopRightRadius: 24, maxHeight: '85%', paddingTop: 10 },
//   modalHandle: { width: 52, height: 5, borderRadius: 999, backgroundColor: '#D1D5DB', alignSelf: 'center', marginBottom: 14 },
//   modalHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 18, paddingBottom: 10 },
//   modalTitle: { fontSize: 20, fontWeight: '800', color: Colors.dark },
//   modalContent: { paddingHorizontal: 18, paddingBottom: 20 },
//   requestModalContent: { padding: 20 },
//   verifyModalContent: { padding: 20 },
//   modalSection: { marginBottom: 18 },
//   modalSectionTitle: { fontSize: 14, fontWeight: '700', color: Colors.dark, marginBottom: 10 },
//   modalToggleChip: { borderRadius: 14, borderWidth: 1, borderColor: '#E5E7EB', paddingHorizontal: 14, paddingVertical: 10, alignSelf: 'flex-start', backgroundColor: '#F9FAFB' },
//   modalToggleChipActive: { backgroundColor: Colors.primary, borderColor: Colors.primary },
//   modalToggleChipText: { fontSize: 13, color: Colors.dark, fontWeight: '600' },
//   modalToggleChipTextActive: { color: Colors.white },
//   modalOptionWrap: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
//   modalOptionChip: { borderRadius: 16, borderWidth: 1, borderColor: '#E5E7EB', paddingHorizontal: 12, paddingVertical: 9, backgroundColor: '#F9FAFB' },
//   modalOptionChipActive: { backgroundColor: Colors.primary, borderColor: Colors.primary },
//   modalOptionChipText: { fontSize: 13, color: Colors.dark, fontWeight: '600' },
//   modalOptionChipTextActive: { color: Colors.white },
//   modalFooter: { flexDirection: 'row', paddingHorizontal: 18, paddingTop: 12, paddingBottom: Platform.OS === 'ios' ? 28 : 18, borderTopWidth: 1, borderTopColor: '#EEF2F7', gap: 12 },
//   modalSecondaryBtn: { flex: 1, borderRadius: 14, paddingVertical: 14, alignItems: 'center', backgroundColor: '#F3F4F6' },
//   modalSecondaryBtnText: { fontSize: 15, fontWeight: '700', color: Colors.dark },
//   modalPrimaryBtn: { flex: 1, borderRadius: 14, paddingVertical: 14, alignItems: 'center', backgroundColor: Colors.primary },
//   modalPrimaryBtnText: { fontSize: 15, fontWeight: '700', color: Colors.white },
//   requestInfoBox: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#EFF6FF', padding: 12, borderRadius: 12, marginBottom: 16, gap: 8 },
//   requestInfoText: { flex: 1, fontSize: 13, color: '#1E3A8A', lineHeight: 18 },
//   requestRouteBox: { backgroundColor: '#F3F4F6', padding: 12, borderRadius: 12, marginBottom: 20 },
//   requestRouteLabel: { fontSize: 12, fontWeight: '600', color: Colors.gray, marginBottom: 4 },
//   requestRouteText: { fontSize: 14, fontWeight: '600', color: Colors.dark, marginBottom: 4 },
//   requestRouteDetail: { fontSize: 12, color: Colors.gray, marginTop: 2 },
//   requestInputGroup: { marginBottom: 16 },
//   requestLabel: { fontSize: 14, fontWeight: '600', color: Colors.dark, marginBottom: 8 },
//   requestInput: { borderWidth: 1, borderColor: '#E5E7EB', borderRadius: 12, paddingHorizontal: 12, paddingVertical: 10, fontSize: 14, backgroundColor: '#F9FAFB' },
//   requestTextArea: { minHeight: 80, textAlignVertical: 'top' },
//   requestHelper: { fontSize: 11, color: Colors.gray, marginTop: 4 },
//   requestNoteBox: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#FEF3C7', padding: 12, borderRadius: 12, gap: 8 },
//   requestNoteText: { flex: 1, fontSize: 12, color: '#D97706' },
//   disabledButton: { opacity: 0.6 },
//   imageModalContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.9)' },
//   imageModalContent: { width: '90%', backgroundColor: Colors.white, borderRadius: 20, overflow: 'hidden' },
//   imageModalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 16, borderBottomWidth: 1, borderBottomColor: '#EEF2F7' },
//   imageModalTitle: { fontSize: 18, fontWeight: '700', color: Colors.dark },
//   fullProfileImage: { width: '100%', height: 400, backgroundColor: '#F5F5F5' },
//   noImageContainer: { width: '100%', height: 400, justifyContent: 'center', alignItems: 'center', backgroundColor: '#F5F5F5' },
//   noImageText: { fontSize: 16, color: Colors.gray },
//   svgContainer: { width: 48, height: 48, alignItems: 'center', justifyContent: 'center' },
//   initialsContainer: { width: '100%', height: '100%', alignItems: 'center', justifyContent: 'center', backgroundColor: '#E5E7EB' },
//   modalSvgContainer: { width: '100%', height: 400, backgroundColor: '#F5F5F5', alignItems: 'center', justifyContent: 'center' },
//   debugBanner: { flexDirection: 'row', alignItems: 'center', padding: 12, marginHorizontal: 16, marginTop: 8, marginBottom: 8, borderRadius: 8, gap: 8 },
//   debugBannerSuccess: { backgroundColor: '#DCFCE7', borderLeftWidth: 4, borderLeftColor: '#22C55E' },
//   debugBannerError: { backgroundColor: '#FEE2E2', borderLeftWidth: 4, borderLeftColor: '#EF4444' },
//   debugBannerText: { flex: 1, fontSize: 12, fontWeight: '500' },
//   debugBannerTextSuccess: { color: '#166534' },
//   debugBannerTextError: { color: '#991B1B' },
//   verifyInfoBox: { alignItems: 'center', marginBottom: 24 },
//   verifyTitle: { fontSize: 20, fontWeight: '700', color: Colors.dark, marginTop: 12, marginBottom: 8 },
//   verifyDescription: { fontSize: 14, color: Colors.gray, textAlign: 'center', lineHeight: 20, marginBottom: 16 },
//   inputError: { borderColor: '#EF4444', borderWidth: 2 },
//   errorText: { fontSize: 12, color: '#EF4444', marginTop: 4 },
//   resendButton: { marginTop: 12, alignSelf: 'center' },
//   resendButtonText: { fontSize: 14, color: Colors.primary, fontWeight: '600' },
// });
import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
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
  RefreshControl,
  TextInput,
  ActivityIndicator,
  KeyboardAvoidingView,
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
import DatabaseServiceds from '../services/myprofile_ds';
import createDatabaseService from '../services/createprofile_ds'
import { AppState } from 'react-native';

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

const normalizeLocation = (location) => {
  if (!location) return '';
  return location
    .toLowerCase()
    .replace(/tower[-\s]*\d+/i, '')
    .replace(/[-\s]*\d+[-\s]*(?:th|st|nd|rd)/i, '')
    .replace(/\b(?:tower|block|sector|sect|building|no\.?|#|flat|apartment|apt)\s*\d+/gi, '')
    .replace(/\b\d+\b/g, '')
    .replace(/[^\w\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
};

const locationsMatch = (loc1, loc2) => {
  const norm1 = normalizeLocation(loc1);
  const norm2 = normalizeLocation(loc2);
  
  if (!norm1 || !norm2) return false;
  if (norm1 === norm2) return true;
  if (norm1.includes(norm2) || norm2.includes(norm1)) return true;
  
  const words1 = norm1.split(' ');
  const words2 = norm2.split(' ');
  const commonWords = words1.filter(w => 
    words2.includes(w) && w.length > 2 && !['the','and','of','to','for','with'].includes(w)
  );
  
  if (commonWords.length >= 2) return true;
  
  const avMatch = (norm1.includes('avenue') && (norm2.includes('av') || norm2.includes('ave'))) ||
                  ((norm1.includes('av') || norm1.includes('ave')) && norm2.includes('avenue'));
  const sectorMatch = (norm1.includes('sector') && (norm2.includes('sec') || norm2.includes('sect'))) ||
                      ((norm1.includes('sec') || norm1.includes('sect')) && norm2.includes('sector'));
  const gaurCityMatch = (norm1.includes('gaur city') && norm2.includes('gaur city')) ||
                        (norm1.includes('gaurcity') && norm2.includes('gaur city'));
  const collegeMatch = (norm1.includes('engineering college') && norm2.includes('engineering college'));
  
  return avMatch || sectorMatch || gaurCityMatch || collegeMatch;
};

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

  if (!prefs || Object.keys(prefs).length === 0) return [];

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
          if (v && v.trim()) badges.push(v.trim());
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

  if (key === 'verified_profiles_only') return !!item.isVerified;
  if (typeof value === 'boolean') return value;
  if (Array.isArray(value)) return value.length > 0;
  if (key === 'smoking_policy') return normalized.includes('no');
  if (key === 'same_gender_after_9pm') return normalized === 'true' || normalized === 'yes' || normalized === 'same gender';
  if (key === 'pets_allowed') return normalized === 'true' || normalized === 'yes' || normalized === 'allowed';
  
  return !!normalized;
}

function matchesAdvancedFilter(item, key, expectedValue) {
  if (expectedValue === undefined || expectedValue === null || expectedValue === '') return true;

  const prefs = getRidePreferences(item);
  const rideValue = prefs?.[key];

  if (typeof expectedValue === 'boolean') {
    if (key === 'verified_profiles_only') return expectedValue ? !!item.isVerified : true;
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
    if (imageUrl) setIsSvg(imageUrl.toLowerCase().includes('.svg'));
  }, [imageUrl]);
  
  if (!visible) return null;
  
  return (
    <Modal visible={visible} transparent={true} animationType="fade" onRequestClose={onClose}>
      <TouchableOpacity style={styles.modalBackdrop} activeOpacity={1} onPress={onClose}>
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
                  <SvgCssUri uri={imageUrl} width="100%" height={400} />
                </View>
              ) : (
                <Image source={{ uri: imageUrl }} style={styles.fullProfileImage} resizeMode="contain" />
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

function EmailVerificationModal({ visible, onVerify, onClose }) {
  const [otp, setOtp] = useState('');
  const [showOtpInput, setShowOtpInput] = useState(false);
  const [verificationError, setVerificationError] = useState('');
  const [sendingOtp, setSendingOtp] = useState(false);
  const [email, setEmail] = useState('');
  const [internalVisible, setInternalVisible] = useState(false);
  const [hasSentOtp, setHasSentOtp] = useState(false);
  
  const preservedEmailRef = useRef('');
  const preservedOtpRef = useRef('');
  const preservedShowOtpRef = useRef(false);

  useEffect(() => {
    if (visible) {
      if (preservedEmailRef.current) {
        setEmail(preservedEmailRef.current);
        setOtp(preservedOtpRef.current);
        setShowOtpInput(preservedShowOtpRef.current);
        setHasSentOtp(preservedShowOtpRef.current);
      }
      setInternalVisible(true);
    } else {
      if (showOtpInput) {
        preservedEmailRef.current = email;
        preservedOtpRef.current = otp;
        preservedShowOtpRef.current = showOtpInput;
      } else {
        preservedEmailRef.current = '';
        preservedOtpRef.current = '';
        preservedShowOtpRef.current = false;
      }
      setInternalVisible(false);
    }
  }, [visible]);

  const resetPreservedState = () => {
    preservedEmailRef.current = '';
    preservedOtpRef.current = '';
    preservedShowOtpRef.current = false;
  };

  const handleSendOtp = async () => {
    if (!email || !email.includes('@')) {
      setVerificationError('Please enter a valid email address');
      return;
    }
    
    setSendingOtp(true);
    setVerificationError('');
    
    try {
      const result = await createDatabaseService.sendEmailOTP(email);
      
      if (result?.success) {
        setShowOtpInput(true);
        setHasSentOtp(true);
        preservedShowOtpRef.current = true;
        preservedEmailRef.current = email;
      } else {
        setVerificationError(result?.message || 'Failed to send verification code');
      }
    } catch (error) {
      setVerificationError('Network error. Please try again.');
    } finally {
      setSendingOtp(false);
    }
  };

  const handleVerifyOtp = async () => {
    if (!otp || otp.length < 4) {
      setVerificationError('Please enter the verification code');
      return;
    }
    
    setSendingOtp(true);
    setVerificationError('');
    
    try {
      const result = await createDatabaseService.verifyEmailOTP(email, otp);
      
      if (result?.success) {
        onVerify(email);
        resetPreservedState();
        setOtp('');
        setShowOtpInput(false);
        setHasSentOtp(false);
        setInternalVisible(false);
        onClose();
      } else {
        setVerificationError(result?.message || 'Invalid verification code');
      }
    } catch (error) {
      setVerificationError('Verification failed. Please try again.');
    } finally {
      setSendingOtp(false);
    }
  };

  const handleClose = () => {
    resetPreservedState();
    setShowOtpInput(false);
    setOtp('');
    setVerificationError('');
    setSendingOtp(false);
    setEmail('');
    setHasSentOtp(false);
    setInternalVisible(false);
    onClose();
  };

  if (!internalVisible) return null;

  return (
    <Modal visible={internalVisible} transparent={true} animationType="slide" onRequestClose={handleClose}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.modalBackdrop}>
        <TouchableOpacity style={styles.modalOverlay} activeOpacity={1} onPress={handleClose} />
        <View style={styles.verifyModalSheet}>
          <View style={styles.modalHandle} />
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Verify Your Email</Text>
            <TouchableOpacity onPress={handleClose}>
              <Ionicons name="close" size={24} color={Colors.dark} />
            </TouchableOpacity>
          </View>
          <ScrollView showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
            <View style={styles.verifyModalContent}>
              <View style={styles.verifyInfoBox}>
                <Ionicons name="mail-outline" size={48} color={Colors.primary} />
                <Text style={styles.verifyTitle}>Email Required</Text>
                <Text style={styles.verifyDescription}>Please verify your email to receive ride alerts.</Text>
              </View>
              {!showOtpInput ? (
                <>
                  <View style={styles.requestInputGroup}>
                    <Text style={styles.requestLabel}>Email Address</Text>
                    <TextInput
                      style={[styles.requestInput, verificationError && styles.inputError]}
                      placeholder="Enter your email address"
                      value={email}
                      onChangeText={(text) => {
                        setEmail(text);
                        setVerificationError('');
                        preservedEmailRef.current = text;
                      }}
                      keyboardType="email-address"
                      autoCapitalize="none"
                      autoComplete="email"
                    />
                    {verificationError && <Text style={styles.errorText}>{verificationError}</Text>}
                  </View>
                  <TouchableOpacity
                    style={[styles.modalPrimaryBtn, sendingOtp && styles.disabledButton]}
                    onPress={handleSendOtp}
                    disabled={sendingOtp || !email}
                  >
                    {sendingOtp ? (
                      <ActivityIndicator size="small" color={Colors.white} />
                    ) : (
                      <Text style={styles.modalPrimaryBtnText}>Send Verification Code</Text>
                    )}
                  </TouchableOpacity>
                </>
              ) : (
                <>
                  <View style={styles.requestInputGroup}>
                    <Text style={styles.requestLabel}>Verification Code</Text>
                    <TextInput
                      style={[styles.requestInput, verificationError && styles.inputError]}
                      placeholder="Enter 6-digit code"
                      value={otp}
                      onChangeText={(text) => {
                        setOtp(text);
                        setVerificationError('');
                        preservedOtpRef.current = text;
                      }}
                      keyboardType="number-pad"
                      maxLength={6}
                    />
                    {verificationError && <Text style={styles.errorText}>{verificationError}</Text>}
                    <Text style={styles.requestHelper}>Enter the code sent to {email}</Text>
                  </View>
                  <TouchableOpacity
                    style={[styles.modalPrimaryBtn, sendingOtp && styles.disabledButton]}
                    onPress={handleVerifyOtp}
                    disabled={sendingOtp || otp.length < 4}
                  >
                    {sendingOtp ? (
                      <ActivityIndicator size="small" color={Colors.white} />
                    ) : (
                      <Text style={styles.modalPrimaryBtnText}>Verify & Continue</Text>
                    )}
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.resendButton} onPress={handleSendOtp} disabled={sendingOtp}>
                    <Text style={styles.resendButtonText}>Resend Code</Text>
                  </TouchableOpacity>
                </>
              )}
            </View>
          </ScrollView>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

// export default function RideNextScreen({ navigation, route }) {
//   const { user: authUser, loading: authLoading, refreshUser } = useAuth();
//   const { searchData } = route.params || {};
//   const { from, to, fromCoords, toCoords, dateTime, seats } = searchData || {};

//   const [localUser, setLocalUser] = useState(null);
//   const [isLoadingProfile, setIsLoadingProfile] = useState(false);
//   const [availableRides, setAvailableRides] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [refreshing, setRefreshing] = useState(false);
//   const [errorMessage, setErrorMessage] = useState('');
//   const [sortBy, setSortBy] = useState('time');
//   const [quickFilters, setQuickFilters] = useState([]);
//   const [headerFiltersVisible, setHeaderFiltersVisible] = useState(false);
//   const [filterModalVisible, setFilterModalVisible] = useState(false);
//   const [preferenceMaster, setPreferenceMaster] = useState([]);
//   const [userPreferences, setUserPreferences] = useState({});
//   const [advancedFilters, setAdvancedFilters] = useState({});
//   const [showRideRequestModal, setShowRideRequestModal] = useState(false);
//   const [showEmailVerification, setShowEmailVerification] = useState(false);
//   const [rideRequestLoading, setRideRequestLoading] = useState(false);
//   const [rideRequestNotes, setRideRequestNotes] = useState('');
//   const [lastRequestStatus, setLastRequestStatus] = useState(null);
//   const [pendingRideRequest, setPendingRideRequest] = useState(false);
//   const [appState, setAppState] = useState(AppState.currentState);
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
//   const [notifiedRequestIds, setNotifiedRequestIds] = useState(new Set());
//   const hasInitialized = useRef(false);
//   const refreshIntervalRef = useRef(null);
//   const pollingIntervalRef = useRef(null);

//   const phoneNumber = authUser?.phone_number || localUser?.phone_number;
//   const userGender = authUser?.gender || localUser?.gender;
//   const requestedSeats = seats || 1;
//   const hasVerifiedEmail = (localUser?.email_verified === true) && localUser?.email;
//   const userEmail = localUser?.email || '';

//   useEffect(() => {
//     const subscription = AppState.addEventListener('change', (nextAppState) => {
//       console.log('App state changed from', appState, 'to', nextAppState);
//       setAppState(nextAppState);
//     });
//     return () => subscription.remove();
//   }, [appState]);

//   const showCustomAlert = (title, message, type = 'success') => {
//     let icon = "check-circle";
//     let iconColor = "#10B981";
//     if (type === 'error') { icon = "error"; iconColor = "#EF4444"; }
//     else if (type === 'warning') { icon = "warning"; iconColor = "#F59E0B"; }
//     else if (type === 'info') { icon = "info"; iconColor = Colors.primary; }
//     setAlertConfig({
//       title,
//       message,
//       icon,
//       iconColor,
//       buttons: [{ text: 'OK', onPress: () => setAlertVisible(false) }]
//     });
//     setAlertVisible(true);
//   };

//   const loadUserProfile = useCallback(async () => {
//     if (!phoneNumber) return;
//     try {
//       setIsLoadingProfile(true);
//       const res = await DatabaseServiceds.getUserProfile(phoneNumber);
//       if (res?.success && res.user) {
//         setLocalUser(res.user);
//       }
//     } catch (err) {
//       console.log("Profile fetch error:", err);
//     } finally {
//       setIsLoadingProfile(false);
//     }
//   }, [phoneNumber]);

//   const checkUserRideRequests = useCallback(async () => {
//     if (!phoneNumber) return;
//     try {
//       const response = await fetch(`${API_BASE_URL}/my-ride-requests/${phoneNumber}`);
//       const data = await response.json();
//       if (data.success && data.requests) {
//         console.log(`📊 Found ${data.requests.length} ride requests`);
//       }
//     } catch (error) {
//       console.log('❌ Error checking ride requests:', error);
//     }
//   }, [phoneNumber]);

//   const checkMatchingWithCurrentRides = useCallback(async () => {
//     if (!phoneNumber || availableRides.length === 0) return;
//     try {
//       const response = await fetch(`${API_BASE_URL}/my-ride-requests/${phoneNumber}`);
//       const data = await response.json();
//       if (!data.success || !data.requests) return;
//       const activeRequests = data.requests.filter(req => req.status === 'active' && !notifiedRequestIds.has(req.id));
//       for (const req of activeRequests) {
//         for (const ride of availableRides) {
//           const fromMatch = locationsMatch(ride.from, req.from_location);
//           const toMatch = locationsMatch(ride.to, req.to_location);
//           if (fromMatch && toMatch) {
//             setNotifiedRequestIds(prev => new Set([...prev, req.id]));
//             showCustomAlert('Ride Match Found! 🎉', `A ride matching your request is now available!`, 'success');
//             break;
//           }
//         }
//       }
//     } catch (error) {
//       console.log('❌ Error checking matches:', error);
//     }
//   }, [phoneNumber, availableRides, notifiedRequestIds]);

//   const updateUserEmailVerified = async (verifiedEmail, userPhoneNumber) => {
//     try {
//       const response = await fetch(`${API_BASE_URL}/api/v1/users/updateprofile`, {
//         method: 'PUT',
//         headers: { 'Content-Type': 'application/json' },
//         body: JSON.stringify({
//           phone_number: userPhoneNumber || phoneNumber,
//           email: verifiedEmail,
//           email_verified: true,
//         }),
//       });
//       if (response.ok) {
//         await loadUserProfile();
//         if (refreshUser) await refreshUser();
//         return true;
//       }
//       return false;
//     } catch (error) {
//       console.log('Error updating email verification:', error);
//       return false;
//     }
//   };

//   const submitRideRequest = async (emailToUse) => {
//     if (!emailToUse || !emailToUse.includes('@')) {
//       showCustomAlert('Invalid Email', 'Please provide a valid email address.', 'error');
//       return false;
//     }
//     setRideRequestLoading(true);
//     setLastRequestStatus(null);
//     try {
//       const requestBody = {
//         from_location: from,
//         to_location: to,
//         from_coords: fromCoords,
//         to_coords: toCoords,
//         preferred_date: dateTime,
//         preferred_time: new Date(dateTime).toLocaleTimeString(),
//         seats_needed: requestedSeats,
//         passenger_phone: phoneNumber,
//         passenger_name: authUser?.full_name || localUser?.full_name || authUser?.first_name,
//         passenger_email: emailToUse,
//         notes: rideRequestNotes
//       };
//       const response = await fetch(`${API_BASE_URL}/request-ride-alert`, {
//         method: 'POST',
//         headers: { 'Content-Type': 'application/json' },
//         body: JSON.stringify(requestBody),
//       });
//       const result = await response.json();
//       if (result.success) {
//         setLastRequestStatus({
//           success: true,
//           message: `Request #${result.request_id} created. We'll email you when a ride is available.`
//         });
//         showCustomAlert('Request Submitted! 📧', `We'll email you at ${emailToUse} when a ride matching your route is posted.\n\nRequest expires in 7 days.`, 'success');
//         setShowRideRequestModal(false);
//         setRideRequestNotes('');
//         setPendingRideRequest(false);
//         setTimeout(() => fetchAvailableRides(true), 1000);
//         return true;
//       } else {
//         setLastRequestStatus({ success: false, message: result.message || 'Could not create ride request' });
//         showCustomAlert('Request Failed', result.message || 'Could not create ride request', 'error');
//         return false;
//       }
//     } catch (error) {
//       setLastRequestStatus({ success: false, message: error.message || 'Network error' });
//       showCustomAlert('Error', 'Could not create ride request. Please try again.', 'error');
//       return false;
//     } finally {
//       setRideRequestLoading(false);
//     }
//   };

//   const handleRequestRideAlert = () => {
//     if (hasVerifiedEmail && userEmail) {
//       submitRideRequest(userEmail);
//     } else {
//       setPendingRideRequest(true);
//       setShowEmailVerification(true);
//     }
//   };

//   const handleEmailVerified = async (verifiedEmail) => {
//     setShowEmailVerification(false);
//     const success = await updateUserEmailVerified(verifiedEmail, phoneNumber);
//     if (success) {
//       if (pendingRideRequest) {
//         await submitRideRequest(verifiedEmail);
//         setPendingRideRequest(false);
//       }
//       showCustomAlert('Success', 'Email verified successfully!', 'success');
//     } else {
//       showCustomAlert('Error', 'Failed to update email verification status', 'error');
//     }
//   };

//   // CRITICAL FIX: Updated fetchAvailableRides with proper seat calculation
//   const fetchAvailableRides = useCallback(async (showRefresh = false) => {
//     if (!searchData || !fromCoords || !toCoords || !dateTime) {
//       setAvailableRides([]);
//       setLoading(false);
//       return;
//     }

//     try {
//       if (showRefresh) {
//         setRefreshing(true);
//       } else {
//         setLoading(true);
//       }
//       setErrorMessage('');

//       const requestBody = {
//         from_location: from,
//         to_location: to,
//         from_coords: fromCoords,
//         to_coords: toCoords,
//         departure_time: new Date(dateTime).toISOString(),
//         seats_required: requestedSeats,
//         passenger_gender: userGender,
//       };
      
//       const response = await fetch(`${API_BASE_URL}/search-rides`, {
//         method: 'POST',
//         headers: { 'Content-Type': 'application/json' },
//         body: JSON.stringify(requestBody),
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
          
//           // ========== CRITICAL FIX: Calculate available seats correctly ==========
//           let availableSeats = ride.seatsAvailable || ride.available_seats || 0;
//           const totalSeats = ride.totalSeats || ride.capacity || 4;
          
//           const bookings = ride.bookings || [];
          
//           // Filter out bookings that are cancelled or have rejected modifications
//           const activeBookings = bookings.filter(booking => {
//             if (booking.status === 'cancelled') return false;
//             if (booking.status === 'rejected') return false;
//             if (booking.modification_request?.status === 'rejected') return false;
//             return booking.status === 'confirmed' || booking.status === 'accepted';
//           });
          
//           let bookedSeats = 0;
//           activeBookings.forEach(booking => {
//             let seatCount = booking.seats || booking.seats_booked || 0;
//             if (booking.modification_request?.status === 'approved') {
//               seatCount = booking.modification_request.requested_seats || seatCount;
//             }
//             bookedSeats += seatCount;
//           });
          
//           const rejectedModifications = ride.modification_history?.filter(
//             mod => mod.status === 'REJECTED' || mod.status === 'rejected'
//           ) || [];
          
//           if (rejectedModifications.length > 0) {
//             console.log(`🔴 Ride ${ride.id} has ${rejectedModifications.length} rejected modifications`);
//             rejectedModifications.forEach(rejectedMod => {
//               const affectedBooking = bookings.find(b => b.id === rejectedMod.booking_id);
//               if (affectedBooking && (affectedBooking.status === 'confirmed' || affectedBooking.status === 'accepted')) {
//                 const seatsToSubtract = affectedBooking.seats || affectedBooking.seats_booked || 0;
//                 console.log(`🔴 Excluding ${seatsToSubtract} seats from booking ${affectedBooking.id} due to rejected modification`);
//                 bookedSeats = Math.max(0, bookedSeats - seatsToSubtract);
//               }
//             });
//           }
          
//           const calculatedAvailableSeats = Math.max(0, totalSeats - bookedSeats);
          
//           if (calculatedAvailableSeats !== availableSeats) {
//             console.log(`📊 Seat correction for ride ${ride.id}: API said ${availableSeats}, calculated ${calculatedAvailableSeats}`);
//             availableSeats = calculatedAvailableSeats;
//           }
          
//           console.log(`📊 Ride ${ride.id}: Total=${totalSeats}, Booked=${bookedSeats}, Available=${availableSeats}`);
//           // ========== END OF CRITICAL FIX ==========
          
//           return { 
//             ...ride, 
//             isVerified, 
//             rating: avgRating,
//             profilePicture: finalProfilePicture,
//             profilepicture: finalProfilePicture,
//             profilePhoto: finalProfilePicture,
//             pickupLabel: ride.pickupLabel || ride.pickupLocationName || ride.fromLocationName || ride.from || 'Pickup point',
//             dropLabel: ride.dropLabel || ride.dropLocationName || ride.toLocationName || ride.to || 'Drop point',
//             womenOnly: ride.womenOnly === true || ride.women_only === true,
//             seatsAvailable: availableSeats,
//             requestedSeats: requestedSeats,
//             isFull: availableSeats === 0,
//             totalSeats: totalSeats,
//             bookedSeats: bookedSeats,
//           };
//         })
//       );
      
//       setAvailableRides(ridesWithDetails);
//       await checkMatchingWithCurrentRides();
      
//     } catch (error) {
//       setAvailableRides([]);
//       setErrorMessage(error.message || 'Failed to search rides');
//       showCustomAlert('Search Error', error.message || 'Failed to search rides', 'error');
//     } finally {
//       setLoading(false);
//       setRefreshing(false);
//     }
//   }, [searchData, from, to, fromCoords, toCoords, dateTime, requestedSeats, userGender, checkMatchingWithCurrentRides]);

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

//   // Setup modification listener
//   const setupModificationListener = useCallback(() => {
//     if (!phoneNumber) return;
//     if (pollingIntervalRef.current) clearInterval(pollingIntervalRef.current);
    
//     pollingIntervalRef.current = setInterval(async () => {
//       try {
//         console.log('🔍 Checking for modification status updates...');
//         const response = await fetch(`${API_BASE_URL}/check-modification-status/${phoneNumber}?_t=${Date.now()}`);
//         const data = await response.json();
        
//         if (data.success && data.has_updates) {
//           console.log('📢 Modification updates detected:', data);
//           await fetchAvailableRides(true);
          
//           if (data.rejected_modifications && data.rejected_modifications.length > 0) {
//             const totalSeatsReleased = data.rejected_modifications.reduce((sum, mod) => sum + (mod.current_seats || 0), 0);
//             showCustomAlert('Seats Available! 🎉', `${totalSeatsReleased} seat(s) are now available on your requested route due to a cancelled modification.`, 'info');
//           }
//         }
//       } catch (error) {
//         console.log('Error checking modification status:', error);
//       }
//     }, 10000);
    
//     return () => {
//       if (pollingIntervalRef.current) {
//         clearInterval(pollingIntervalRef.current);
//         pollingIntervalRef.current = null;
//       }
//     };
//   }, [phoneNumber, fetchAvailableRides]);

// useEffect(() => {
//   if (authLoading) return;
//   if (hasInitialized.current) return;
//   hasInitialized.current = true;
  
//   loadUserProfile();
//   fetchAvailableRides();
//   loadPreferenceData();
//   checkUserRideRequests();
  
//   return () => {
//     if (refreshIntervalRef.current) clearInterval(refreshIntervalRef.current);
//     if (pollingIntervalRef.current) clearInterval(pollingIntervalRef.current);
//   };
// }, [authLoading]); // Removed setupModificationListener from here too
//   useFocusEffect(
//     useCallback(() => {
//       let isMounted = true;
      
//       const refreshData = async () => {
//         if (!isMounted) return;
//         await loadUserProfile();
//         if (!isMounted) return;
//         await fetchAvailableRides(true);
//         if (!isMounted) return;
//         await checkUserRideRequests();
//       };
      
//       refreshData();
      
//     //   if (refreshIntervalRef.current) clearInterval(refreshIntervalRef.current);
//     //   refreshIntervalRef.current = setInterval(() => {
//     //     if (isMounted) {
//     //       console.log('🔄 Auto-refreshing rides...');
//     //       fetchAvailableRides(true);
//     //     }
//     //   }, 15000);
      
//     //   const cleanupPolling = setupModificationListener();
      
//        return () => {
//       isMounted = false;
//       // Clean up any remaining intervals if they exist
//       if (refreshIntervalRef.current) {
//         clearInterval(refreshIntervalRef.current);
//         refreshIntervalRef.current = null;
//       }
//       if (pollingIntervalRef.current) {
//         clearInterval(pollingIntervalRef.current);
//         pollingIntervalRef.current = null;
//       }
//     };
//   }, [fetchAvailableRides, checkUserRideRequests, loadUserProfile])  );
// const onRefresh = useCallback(() => {
//   setNotifiedRequestIds(new Set());
//   loadUserProfile();
//   fetchAvailableRides(true);
//   checkUserRideRequests();
// }, [fetchAvailableRides, checkUserRideRequests, loadUserProfile]);
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
//     if (userGender !== 'female') rides = rides.filter(item => !(item.womenOnly === true));
//     if (quickFilters.length > 0) rides = rides.filter(item => quickFilters.every(key => matchesQuickFilter(item, key)));
//     const activeAdvanced = Object.entries(advancedFilters).filter(([, value]) => value !== '' && value !== null && value !== undefined && value !== false);
//     if (activeAdvanced.length > 0) rides = rides.filter(item => activeAdvanced.every(([key, value]) => matchesAdvancedFilter(item, key, value)));
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
//       ride: ride,
//       searchData: {
//         fromCoords: fromCoords,
//         toCoords: toCoords,
//         fromAddress: searchData?.fromAddress || ride.from || '',
//         toAddress: searchData?.toAddress || ride.to || '',
//         fromPlaceName: searchData?.fromPlaceName || ride.pickupLabel || ride.from?.split(',')[0] || '',
//         toPlaceName: searchData?.toPlaceName || ride.dropLabel || ride.to?.split(',')[0] || '',
//         date: dateTime,
//         time: new Date(dateTime).toLocaleTimeString(),
//         seats: requestedSeats
//       }
//     });
//   };

//   const toggleQuickFilter = (key) => {
//     setQuickFilters(prev => prev.includes(key) ? prev.filter(i => i !== key) : [...prev, key]);
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
//           onPress={() => setAdvancedFilters(prev => ({ ...prev, [pref.key]: !active }))}
//         >
//           <Text style={[styles.modalToggleChipText, active && styles.modalToggleChipTextActive]}>
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
//                 style={[styles.modalOptionChip, active && styles.modalOptionChipActive]}
//                 onPress={() => setAdvancedFilters(prev => ({ ...prev, [pref.key]: active ? '' : opt }))}
//               >
//                 <Text style={[styles.modalOptionChipText, active && styles.modalOptionChipTextActive]}>
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

//   const RideRequestModal = () => (
//     <Modal visible={showRideRequestModal} transparent={true} animationType="slide" onRequestClose={() => setShowRideRequestModal(false)}>
//       <View style={styles.modalBackdrop}>
//         <TouchableOpacity style={styles.modalOverlay} activeOpacity={1} onPress={() => setShowRideRequestModal(false)} />
//         <View style={styles.requestModalSheet}>
//           <View style={styles.modalHandle} />
//           <View style={styles.modalHeader}>
//             <Text style={styles.modalTitle}>Request Ride Alert</Text>
//             <TouchableOpacity onPress={() => setShowRideRequestModal(false)}><Ionicons name="close" size={24} color={Colors.dark} /></TouchableOpacity>
//           </View>
//           <ScrollView showsVerticalScrollIndicator={false}>
//             <View style={styles.requestModalContent}>
//               <View style={styles.requestInfoBox}>
//                 <Ionicons name="information-circle" size={20} color={Colors.primary} />
//                 <Text style={styles.requestInfoText}>No rides found for this route. We'll email you when a ride becomes available.</Text>
//               </View>
//               <View style={styles.requestRouteBox}>
//                 <Text style={styles.requestRouteLabel}>Route:</Text>
//                 <Text style={styles.requestRouteText}>{from} → {to}</Text>
//                 <Text style={styles.requestRouteDetail}>{new Date(dateTime).toLocaleDateString()} at {new Date(dateTime).toLocaleTimeString()}</Text>
//                 <Text style={styles.requestRouteDetail}>{requestedSeats} seat{requestedSeats !== 1 ? 's' : ''} needed</Text>
//               </View>
//               {!hasVerifiedEmail && (
//                 <View style={styles.requestNoteBox}>
//                   <Ionicons name="mail-outline" size={16} color="#D97706" />
//                   <Text style={styles.requestNoteText}>Email verification required. You'll need to verify your email to receive alerts.</Text>
//                 </View>
//               )}
//               <View style={styles.requestNoteBox}>
//                 <Ionicons name="time-outline" size={16} color={Colors.gray} />
//                 <Text style={styles.requestNoteText}>Your request will remain active for 7 days. You can cancel it anytime in your profile.</Text>
//               </View>
//             </View>
//           </ScrollView>
//           <View style={styles.modalFooter}>
//             <TouchableOpacity style={styles.modalSecondaryBtn} onPress={() => setShowRideRequestModal(false)}>
//               <Text style={styles.modalSecondaryBtnText}>Cancel</Text>
//             </TouchableOpacity>
//             <TouchableOpacity style={[styles.modalPrimaryBtn, rideRequestLoading && styles.disabledButton]} onPress={handleRequestRideAlert} disabled={rideRequestLoading}>
//               {rideRequestLoading ? <ActivityIndicator size="small" color={Colors.white} /> : <Text style={styles.modalPrimaryBtnText}>{hasVerifiedEmail ? 'Get Email Alert' : 'Verify Email & Continue'}</Text>}
//             </TouchableOpacity>
//           </View>
//         </View>
//       </View>
//     </Modal>
//   );

//   const renderRideCard = ({ item }) => {
//     let profilePhotoUrl = null;
//     let isSvg = false;
    
//     if (item.profilePicture) profilePhotoUrl = buildImageUrl(item.profilePicture);
//     else if (item.profilepicture) profilePhotoUrl = buildImageUrl(item.profilepicture);
//     else if (item.profilePhoto) profilePhotoUrl = buildImageUrl(item.profilePhoto);
//     else if (item.driverProfilePicture) profilePhotoUrl = buildImageUrl(item.driverProfilePicture);
    
//     if (profilePhotoUrl && profilePhotoUrl.toLowerCase().includes('.svg')) isSvg = true;
    
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
//     }

//     const preferenceBadges = extractPreferenceBadges(item);
//     const isDriverVerified = item.isVerified;
//     const driverRating = item.rating || 0;

//     const pickupName = item.pickupLabel || item.from || 'Pickup point';
//     const dropName = item.dropLabel || item.to || 'Drop point';
    
//     const seatsAvailable = item.seatsAvailable || 0;
//     const isSeatsInsufficient = requestedSeats > seatsAvailable && seatsAvailable > 0;
//     const isFull = seatsAvailable === 0;
//     const canBook = !isFull && seatsAvailable >= requestedSeats;

//     return (
//       <TouchableOpacity style={[styles.rideCard, !canBook && !isFull && styles.rideCardWarning, isFull && styles.rideCardFull]} onPress={() => handleCardPress(item)} activeOpacity={0.9}>
//         <View style={styles.cardTopRow}>
//           <View style={styles.profileRow}>
//             <TouchableOpacity onPress={() => handleCardPress(item)} activeOpacity={0.8}>
//               <View style={styles.avatarContainer}>
//                 {profilePhotoUrl ? (isSvg ? <View style={styles.svgContainer}><SvgCssUri uri={profilePhotoUrl} width="48" height="48" /></View> : <Image source={{ uri: profilePhotoUrl }} style={styles.avatarImage} resizeMode="cover" />) : (
//                   <View style={styles.initialsContainer}><Text style={styles.avatarFallback}>{avatarText}</Text></View>
//                 )}
//               </View>
//             </TouchableOpacity>
//             <View style={styles.profileContent}>
//               <View style={styles.nameRow}>
//                 <Text style={styles.driverName} numberOfLines={1}>{driverNameText}</Text>
//                 {isDriverVerified && (<View style={styles.verifiedBadge}><Ionicons name="checkmark-circle" size={14} color="#16A34A" /><Text style={styles.verifiedText}>Verified</Text></View>)}
//                 {item.womenOnly === true && (<View style={styles.womenOnlyBadge}><Ionicons name="woman" size={12} color="#E91E63" /><Text style={styles.womenOnlyBadgeText}>Women Only</Text></View>)}
//                 {isFull && (<View style={styles.fullBadge}><Ionicons name="close-circle" size={12} color="#EF4444" /><Text style={styles.fullBadgeText}>Full</Text></View>)}
//               </View>
//               <View style={styles.ratingRow}><RatingStars rating={driverRating} size={12} showLabel={true} /></View>
//             </View>
//           </View>
//           <View style={styles.priceMatchWrap}>
//             <View style={styles.matchBadge}><Text style={styles.matchText}>{item.matchPercentage || 0}%</Text></View>
//             <Text style={styles.priceText}>₹{item.price}</Text>
//             <Text style={styles.perSeatText}>per seat</Text>
//           </View>
//         </View>
//         <View style={styles.infoRow}>
//           <View style={styles.infoItem}><Ionicons name="calendar-outline" size={13} color={Colors.gray} /><Text style={styles.infoText} numberOfLines={1}>{item.date}</Text></View>
//           <View style={styles.infoDot} />
//           <View style={styles.infoItem}><Ionicons name="time-outline" size={13} color={Colors.gray} /><Text style={styles.infoText} numberOfLines={1}>{item.time}</Text></View>
//           <View style={styles.infoDot} />
//           <View style={styles.infoItem}><Ionicons name="people-outline" size={13} color={Colors.gray} /><Text style={[styles.infoText, isFull ? styles.fullText : (isSeatsInsufficient && styles.warningText)]} numberOfLines={1}>{isFull ? 'Ride Full' : `${seatsAvailable} left`}</Text></View>
//         </View>
//         {isFull && (<View style={styles.fullWarningContainer}><Ionicons name="close-circle" size={14} color="#EF4444" /><Text style={styles.fullWarningText}>This ride is currently full. Check back later or try another ride.</Text></View>)}
//         {!isFull && isSeatsInsufficient && seatsAvailable > 0 && (<View style={styles.seatWarningContainer}><Ionicons name="warning" size={14} color="#D97706" /><Text style={styles.seatWarningText}>Only {seatsAvailable} seat{seatsAvailable !== 1 ? 's' : ''} left. You requested {requestedSeats} seat{requestedSeats !== 1 ? 's' : ''}.</Text></View>)}
//         <View style={styles.divider} />
//         <View style={styles.routeBlock}>
//           <View style={styles.routeRow}><View style={[styles.routeDot, { backgroundColor: '#22C55E' }]} /><View style={styles.routeTextWrap}><Text style={styles.routeLabel}>Pickup</Text><Text style={styles.routeText} numberOfLines={2}>{pickupName}</Text></View></View>
//           <View style={styles.routeRow}><View style={[styles.routeDot, { backgroundColor: '#F97316' }]} /><View style={styles.routeTextWrap}><Text style={styles.routeLabel}>Drop</Text><Text style={styles.routeText} numberOfLines={2}>{dropName}</Text></View></View>
//         </View>
//         <View style={styles.vehicleRow}><Ionicons name="car-sport-outline" size={14} color={Colors.gray} /><Text style={styles.vehicleText} numberOfLines={1}>{vehicleLabel}</Text></View>
//         {preferenceBadges.length > 0 && (<ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.badgeScroll}>{preferenceBadges.map((badge, index) => (<PreferenceTag key={`${badge}-${index}`} label={badge} />))}</ScrollView>)}
//       </TouchableOpacity>
//     );
//   };

//   if (authLoading || loading || isLoadingProfile) {
//     return (<View style={styles.loadingContainer}><LottieView source={require("../assets/loading.json")} autoPlay loop style={{ width: 300, height: 300 }} /></View>);
//   }

//   return (
//     <SafeAreaView style={styles.container}>
//       <StatusBar barStyle="dark-content" backgroundColor={Colors.white} />
//       <View style={styles.header}>
//         <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}><MaterialIcons name="arrow-back-ios" size={24} color="#ED7117" /></TouchableOpacity>
//         <Text style={styles.headerTitle}>Available Rides</Text>
//         <TouchableOpacity style={[styles.filterButton, headerFiltersVisible && styles.filterButtonActive]} onPress={() => setHeaderFiltersVisible(prev => !prev)}><Ionicons name="options-outline" size={22} color="#ED7117" /></TouchableOpacity>
//       </View>
//       {lastRequestStatus && (<View style={[styles.debugBanner, lastRequestStatus.success ? styles.debugBannerSuccess : styles.debugBannerError]}><Ionicons name={lastRequestStatus.success ? "checkmark-circle" : "alert-circle"} size={18} color={lastRequestStatus.success ? "#166534" : "#991B1B"} /><Text style={[styles.debugBannerText, lastRequestStatus.success ? styles.debugBannerTextSuccess : styles.debugBannerTextError]}>{lastRequestStatus.message}</Text><TouchableOpacity onPress={() => setLastRequestStatus(null)}><Ionicons name="close" size={16} color={lastRequestStatus.success ? "#166534" : "#991B1B"} /></TouchableOpacity></View>)}
//       {headerFiltersVisible && (<View style={styles.topControlsWrap}>
//         <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterScroll}>
//           {quickFilterOptions.map((filter) => { const active = quickFilters.includes(filter.key); return (<TouchableOpacity key={filter.key} activeOpacity={0.85} style={[styles.quickChip, active && styles.quickChipActive]} onPress={() => toggleQuickFilter(filter.key)}><Text style={[styles.quickChipText, active && styles.quickChipTextActive]}>{filter.label}</Text></TouchableOpacity>); })}
//           <TouchableOpacity activeOpacity={0.85} style={styles.moreFilterChip} onPress={() => setFilterModalVisible(true)}><Ionicons name="options-outline" size={14} color="#ED7117" /><Text style={styles.moreFilterChipText}>More Filters</Text></TouchableOpacity>
//         </ScrollView>
//         <Text style={styles.sortLabel}>Sort by</Text>
//         <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.sortScroll}>
//           {SORT_OPTIONS.map((option) => { const active = sortBy === option.key; return (<TouchableOpacity key={option.key} activeOpacity={0.85} style={[styles.sortChip, active && styles.sortChipActive]} onPress={() => setSortBy(option.key)}><Text style={[styles.sortChipText, active && styles.sortChipTextActive]}>{option.label}</Text></TouchableOpacity>); })}
//         </ScrollView>
//       </View>)}
//       {processedRides.length === 0 ? (<View style={styles.emptyContainer}>
//         <Ionicons name="car-outline" size={80} color={Colors.gray} />
//         <Text style={styles.emptyTitle}>No Rides Found</Text>
//         <Text style={styles.emptySubtitle}>{errorMessage ? errorMessage : 'No rides available for this route at the selected time.'}</Text>
//         <TouchableOpacity style={styles.requestAlertButton} onPress={() => setShowRideRequestModal(true)}><Ionicons name="notifications-outline" size={20} color={Colors.white} /><Text style={styles.requestAlertButtonText}>Notify me when a ride is available</Text></TouchableOpacity>
//         <TouchableOpacity style={styles.clearButton} onPress={clearAllFilters}><Text style={styles.clearButtonText}>Clear Filters</Text></TouchableOpacity>
//       </View>) : (<FlatList data={processedRides} renderItem={renderRideCard} keyExtractor={(item) => String(item.id)} contentContainerStyle={styles.listContent} showsVerticalScrollIndicator={false} refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[Colors.primary]} tintColor={Colors.primary} />} ItemSeparatorComponent={() => <View style={{ height: 12 }} />} />)}
//       <Modal visible={filterModalVisible} transparent animationType="slide" onRequestClose={() => setFilterModalVisible(false)}>
//         <View style={styles.modalBackdrop}>
//           <TouchableOpacity style={styles.modalOverlay} activeOpacity={1} onPress={() => setFilterModalVisible(false)} />
//           <View style={styles.modalSheet}>
//             <View style={styles.modalHandle} />
//             <View style={styles.modalHeader}><Text style={styles.modalTitle}>More Filters</Text><TouchableOpacity onPress={() => setFilterModalVisible(false)}><Ionicons name="close" size={24} color={Colors.dark} /></TouchableOpacity></View>
//             <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.modalContent}>
//               {advancedFilterOptions.map((pref) => (<View key={pref.key} style={styles.modalSection}><Text style={styles.modalSectionTitle}>{pref.label}</Text>{renderAdvancedFilterControl(pref)}</View>))}
//             </ScrollView>
//             <View style={styles.modalFooter}>
//               <TouchableOpacity style={styles.modalSecondaryBtn} onPress={clearAllFilters}><Text style={styles.modalSecondaryBtnText}>Clear</Text></TouchableOpacity>
//               <TouchableOpacity style={styles.modalPrimaryBtn} onPress={() => setFilterModalVisible(false)}><Text style={styles.modalPrimaryBtnText}>Apply Filters</Text></TouchableOpacity>
//             </View>
//           </View>
//         </View>
//       </Modal>
//       <RideRequestModal />
//       <EmailVerificationModal visible={showEmailVerification} onVerify={handleEmailVerified} onClose={() => { setShowEmailVerification(false); setPendingRideRequest(false); }} />
//       <ProfileImageModal visible={selectedProfile.visible} imageUrl={selectedProfile.imageUrl} driverName={selectedProfile.driverName} onClose={() => setSelectedProfile({ visible: false, imageUrl: null, driverName: '' })} />
//       <CustomAlert visible={alertVisible} title={alertConfig.title} message={alertConfig.message} icon={alertConfig.icon} iconColor={alertConfig.iconColor} buttons={alertConfig.buttons} onBackdropPress={() => setAlertVisible(false)} />
//     </SafeAreaView>
//   );
// }
export default function RideNextScreen({ navigation, route }) {
  const { user: authUser, loading: authLoading, refreshUser } = useAuth();
  const { searchData } = route.params || {};
  const { from, to, fromCoords, toCoords, dateTime, seats } = searchData || {};

  const [localUser, setLocalUser] = useState(null);
  const [isLoadingProfile, setIsLoadingProfile] = useState(false);
  const [availableRides, setAvailableRides] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [sortBy, setSortBy] = useState('time');
  const [quickFilters, setQuickFilters] = useState([]);
  const [headerFiltersVisible, setHeaderFiltersVisible] = useState(false);
  const [filterModalVisible, setFilterModalVisible] = useState(false);
  const [preferenceMaster, setPreferenceMaster] = useState([]);
  const [userPreferences, setUserPreferences] = useState({});
  const [advancedFilters, setAdvancedFilters] = useState({});
  const [showRideRequestModal, setShowRideRequestModal] = useState(false);
  const [showEmailVerification, setShowEmailVerification] = useState(false);
  const [rideRequestLoading, setRideRequestLoading] = useState(false);
  const [rideRequestNotes, setRideRequestNotes] = useState('');
  const [lastRequestStatus, setLastRequestStatus] = useState(null);
  const [pendingRideRequest, setPendingRideRequest] = useState(false);
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
  const [notifiedRequestIds, setNotifiedRequestIds] = useState(new Set());
  const hasInitialized = useRef(false);
  const isMountedRef = useRef(true); // Add this for cleanup

  const phoneNumber = authUser?.phone_number || localUser?.phone_number;
  const userGender = authUser?.gender || localUser?.gender;
  const requestedSeats = seats || 1;
  const hasVerifiedEmail = (localUser?.email_verified === true) && localUser?.email;
  const userEmail = localUser?.email || '';

  // REMOVED: AppState listener that might cause refreshes
  // useEffect(() => {
  //   const subscription = AppState.addEventListener('change', (nextAppState) => {
  //     console.log('App state changed from', appState, 'to', nextAppState);
  //     setAppState(nextAppState);
  //   });
  //   return () => subscription.remove();
  // }, [appState]);

  const showCustomAlert = (title, message, type = 'success') => {
    let icon = "check-circle";
    let iconColor = "#10B981";
    if (type === 'error') { icon = "error"; iconColor = "#EF4444"; }
    else if (type === 'warning') { icon = "warning"; iconColor = "#F59E0B"; }
    else if (type === 'info') { icon = "info"; iconColor = Colors.primary; }
    setAlertConfig({
      title,
      message,
      icon,
      iconColor,
      buttons: [{ text: 'OK', onPress: () => setAlertVisible(false) }]
    });
    setAlertVisible(true);
  };

  const loadUserProfile = useCallback(async () => {
    if (!phoneNumber || !isMountedRef.current) return;
    try {
      setIsLoadingProfile(true);
      const res = await DatabaseServiceds.getUserProfile(phoneNumber);
      if (res?.success && res.user && isMountedRef.current) {
        setLocalUser(res.user);
      }
    } catch (err) {
      console.log("Profile fetch error:", err);
    } finally {
      if (isMountedRef.current) setIsLoadingProfile(false);
    }
  }, [phoneNumber]);

  const checkUserRideRequests = useCallback(async () => {
    if (!phoneNumber || !isMountedRef.current) return;
    try {
      const response = await fetch(`${API_BASE_URL}/my-ride-requests/${phoneNumber}`);
      const data = await response.json();
      if (data.success && data.requests && isMountedRef.current) {
        console.log(`📊 Found ${data.requests.length} ride requests`);
      }
    } catch (error) {
      console.log('❌ Error checking ride requests:', error);
    }
  }, [phoneNumber]);

  const checkMatchingWithCurrentRides = useCallback(async () => {
    if (!phoneNumber || availableRides.length === 0 || !isMountedRef.current) return;
    try {
      const response = await fetch(`${API_BASE_URL}/my-ride-requests/${phoneNumber}`);
      const data = await response.json();
      if (!data.success || !data.requests) return;
      const activeRequests = data.requests.filter(req => req.status === 'active' && !notifiedRequestIds.has(req.id));
      for (const req of activeRequests) {
        for (const ride of availableRides) {
          const fromMatch = locationsMatch(ride.from, req.from_location);
          const toMatch = locationsMatch(ride.to, req.to_location);
          if (fromMatch && toMatch) {
            setNotifiedRequestIds(prev => new Set([...prev, req.id]));
            showCustomAlert('Ride Match Found! 🎉', `A ride matching your request is now available!`, 'success');
            break;
          }
        }
      }
    } catch (error) {
      console.log('❌ Error checking matches:', error);
    }
  }, [phoneNumber, availableRides, notifiedRequestIds]);

  const updateUserEmailVerified = async (verifiedEmail, userPhoneNumber) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/v1/users/updateprofile`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          phone_number: userPhoneNumber || phoneNumber,
          email: verifiedEmail,
          email_verified: true,
        }),
      });
      if (response.ok) {
        await loadUserProfile();
        if (refreshUser) await refreshUser();
        return true;
      }
      return false;
    } catch (error) {
      console.log('Error updating email verification:', error);
      return false;
    }
  };

  const submitRideRequest = async (emailToUse) => {
    if (!emailToUse || !emailToUse.includes('@')) {
      showCustomAlert('Invalid Email', 'Please provide a valid email address.', 'error');
      return false;
    }
    setRideRequestLoading(true);
    setLastRequestStatus(null);
    try {
      const requestBody = {
        from_location: from,
        to_location: to,
        from_coords: fromCoords,
        to_coords: toCoords,
        preferred_date: dateTime,
        preferred_time: new Date(dateTime).toLocaleTimeString(),
        seats_needed: requestedSeats,
        passenger_phone: phoneNumber,
        passenger_name: authUser?.full_name || localUser?.full_name || authUser?.first_name,
        passenger_email: emailToUse,
        notes: rideRequestNotes
      };
      const response = await fetch(`${API_BASE_URL}/request-ride-alert`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestBody),
      });
      const result = await response.json();
      if (result.success) {
        setLastRequestStatus({
          success: true,
          message: `Request #${result.request_id} created. We'll email you when a ride is available.`
        });
        showCustomAlert('Request Submitted! 📧', `We'll email you at ${emailToUse} when a ride matching your route is posted.\n\nRequest expires in 7 days.`, 'success');
        setShowRideRequestModal(false);
        setRideRequestNotes('');
        setPendingRideRequest(false);
        return true;
      } else {
        setLastRequestStatus({ success: false, message: result.message || 'Could not create ride request' });
        showCustomAlert('Request Failed', result.message || 'Could not create ride request', 'error');
        return false;
      }
    } catch (error) {
      setLastRequestStatus({ success: false, message: error.message || 'Network error' });
      showCustomAlert('Error', 'Could not create ride request. Please try again.', 'error');
      return false;
    } finally {
      setRideRequestLoading(false);
    }
  };

  const handleRequestRideAlert = () => {
    if (hasVerifiedEmail && userEmail) {
      submitRideRequest(userEmail);
    } else {
      setPendingRideRequest(true);
      setShowEmailVerification(true);
    }
  };

  const handleEmailVerified = async (verifiedEmail) => {
    setShowEmailVerification(false);
    const success = await updateUserEmailVerified(verifiedEmail, phoneNumber);
    if (success) {
      if (pendingRideRequest) {
        await submitRideRequest(verifiedEmail);
        setPendingRideRequest(false);
      }
      showCustomAlert('Success', 'Email verified successfully!', 'success');
    } else {
      showCustomAlert('Error', 'Failed to update email verification status', 'error');
    }
  };

  // CRITICAL FIX: Updated fetchAvailableRides with proper seat calculation
  const fetchAvailableRides = useCallback(async (showRefresh = false) => {
    if (!searchData || !fromCoords || !toCoords || !dateTime) {
      if (isMountedRef.current) {
        setAvailableRides([]);
        setLoading(false);
      }
      return;
    }

    try {
      if (showRefresh && isMountedRef.current) {
        setRefreshing(true);
      } else if (isMountedRef.current) {
        setLoading(true);
      }
      if (isMountedRef.current) setErrorMessage('');

      const requestBody = {
        from_location: from,
        to_location: to,
        from_coords: fromCoords,
        to_coords: toCoords,
        departure_time: new Date(dateTime).toISOString(),
        seats_required: requestedSeats,
        passenger_gender: userGender,
      };
      
      const response = await fetch(`${API_BASE_URL}/search-rides`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestBody),
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
          
          // ========== CRITICAL FIX: Calculate available seats correctly ==========
          let availableSeats = ride.seatsAvailable || ride.available_seats || 0;
          const totalSeats = ride.totalSeats || ride.capacity || 4;
          
          const bookings = ride.bookings || [];
          
          // Filter out bookings that are cancelled or have rejected modifications
          const activeBookings = bookings.filter(booking => {
            if (booking.status === 'cancelled') return false;
            if (booking.status === 'rejected') return false;
            if (booking.modification_request?.status === 'rejected') return false;
            return booking.status === 'confirmed' || booking.status === 'accepted';
          });
          
          let bookedSeats = 0;
          activeBookings.forEach(booking => {
            let seatCount = booking.seats || booking.seats_booked || 0;
            if (booking.modification_request?.status === 'approved') {
              seatCount = booking.modification_request.requested_seats || seatCount;
            }
            bookedSeats += seatCount;
          });
          
          const rejectedModifications = ride.modification_history?.filter(
            mod => mod.status === 'REJECTED' || mod.status === 'rejected'
          ) || [];
          
          if (rejectedModifications.length > 0) {
            console.log(`🔴 Ride ${ride.id} has ${rejectedModifications.length} rejected modifications`);
            rejectedModifications.forEach(rejectedMod => {
              const affectedBooking = bookings.find(b => b.id === rejectedMod.booking_id);
              if (affectedBooking && (affectedBooking.status === 'confirmed' || affectedBooking.status === 'accepted')) {
                const seatsToSubtract = affectedBooking.seats || affectedBooking.seats_booked || 0;
                console.log(`🔴 Excluding ${seatsToSubtract} seats from booking ${affectedBooking.id} due to rejected modification`);
                bookedSeats = Math.max(0, bookedSeats - seatsToSubtract);
              }
            });
          }
          
          const calculatedAvailableSeats = Math.max(0, totalSeats - bookedSeats);
          
          if (calculatedAvailableSeats !== availableSeats) {
            console.log(`📊 Seat correction for ride ${ride.id}: API said ${availableSeats}, calculated ${calculatedAvailableSeats}`);
            availableSeats = calculatedAvailableSeats;
          }
          
          console.log(`📊 Ride ${ride.id}: Total=${totalSeats}, Booked=${bookedSeats}, Available=${availableSeats}`);
          // ========== END OF CRITICAL FIX ==========
          
          return { 
            ...ride, 
            isVerified, 
            rating: avgRating,
            profilePicture: finalProfilePicture,
            profilepicture: finalProfilePicture,
            profilePhoto: finalProfilePicture,
            pickupLabel: ride.pickupLabel || ride.pickupLocationName || ride.fromLocationName || ride.from || 'Pickup point',
            dropLabel: ride.dropLabel || ride.dropLocationName || ride.toLocationName || ride.to || 'Drop point',
            womenOnly: ride.womenOnly === true || ride.women_only === true,
            seatsAvailable: availableSeats,
            requestedSeats: requestedSeats,
            isFull: availableSeats === 0,
            totalSeats: totalSeats,
            bookedSeats: bookedSeats,
          };
        })
      );
      
      if (isMountedRef.current) {
        setAvailableRides(ridesWithDetails);
        await checkMatchingWithCurrentRides();
      }
      
    } catch (error) {
      if (isMountedRef.current) {
        setAvailableRides([]);
        setErrorMessage(error.message || 'Failed to search rides');
        showCustomAlert('Search Error', error.message || 'Failed to search rides', 'error');
      }
    } finally {
      if (isMountedRef.current) {
        setLoading(false);
        setRefreshing(false);
      }
    }
  }, [searchData, from, to, fromCoords, toCoords, dateTime, requestedSeats, userGender, checkMatchingWithCurrentRides]);

  const loadPreferenceData = useCallback(async () => {
    try {
      const defs = await DatabaseService.getMatchingPreferenceMaster();
      if (isMountedRef.current) setPreferenceMaster(defs || []);
      if (phoneNumber && isMountedRef.current) {
        const saved = await DatabaseService.getUserMatchingPreferences(phoneNumber);
        setUserPreferences(saved || {});
      }
    } catch (e) {
      console.log('❌ preference load error:', e);
    }
  }, [phoneNumber]);

  // REMOVED: setupModificationListener entirely
  // const setupModificationListener = useCallback(() => { ... }, []);

  // INITIAL LOAD ONLY - NO AUTOMATIC REFRESH
  useEffect(() => {
    if (authLoading) return;
    if (hasInitialized.current) return;
    hasInitialized.current = true;
    
    console.log('📱 Initial load only - no automatic refresh');
    loadUserProfile();
    fetchAvailableRides();
    loadPreferenceData();
    checkUserRideRequests();
    
    return () => {
      isMountedRef.current = false;
    };
  }, [authLoading]); // Only runs once on mount

  // FOCUS EFFECT - Refresh only when screen comes into focus (once, not continuously)
//   useFocusEffect(
//     useCallback(() => {
//       console.log('📱 Screen focused - manual refresh');
      
//       const refreshData = async () => {
//         await loadUserProfile();
//         await fetchAvailableRides(true);
//         await checkUserRideRequests();
//       };
      
//       refreshData();
      
//       // NO intervals, NO polling, NO automatic refresh
//       return () => {
//         // Cleanup if needed
//       };
//     }, [fetchAvailableRides, checkUserRideRequests, loadUserProfile])
//   );

  // MANUAL PULL-TO-REFRESH ONLY
  const onRefresh = useCallback(() => {
    console.log('📱 Manual pull-to-refresh');
    setNotifiedRequestIds(new Set());
    loadUserProfile();
    fetchAvailableRides(true);
    checkUserRideRequests();
  }, [fetchAvailableRides, checkUserRideRequests, loadUserProfile]);

  // Rest of your component remains the same...
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
    if (userGender !== 'female') rides = rides.filter(item => !(item.womenOnly === true));
    if (quickFilters.length > 0) rides = rides.filter(item => quickFilters.every(key => matchesQuickFilter(item, key)));
    const activeAdvanced = Object.entries(advancedFilters).filter(([, value]) => value !== '' && value !== null && value !== undefined && value !== false);
    if (activeAdvanced.length > 0) rides = rides.filter(item => activeAdvanced.every(([key, value]) => matchesAdvancedFilter(item, key, value)));
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
      ride: ride,
      searchData: {
        fromCoords: fromCoords,
        toCoords: toCoords,
        fromAddress: searchData?.fromAddress || ride.from || '',
        toAddress: searchData?.toAddress || ride.to || '',
        fromPlaceName: searchData?.fromPlaceName || ride.pickupLabel || ride.from?.split(',')[0] || '',
        toPlaceName: searchData?.toPlaceName || ride.dropLabel || ride.to?.split(',')[0] || '',
        date: dateTime,
        time: new Date(dateTime).toLocaleTimeString(),
        seats: requestedSeats
      }
    });
  };

  const toggleQuickFilter = (key) => {
    setQuickFilters(prev => prev.includes(key) ? prev.filter(i => i !== key) : [...prev, key]);
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
          onPress={() => setAdvancedFilters(prev => ({ ...prev, [pref.key]: !active }))}
        >
          <Text style={[styles.modalToggleChipText, active && styles.modalToggleChipTextActive]}>
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
                style={[styles.modalOptionChip, active && styles.modalOptionChipActive]}
                onPress={() => setAdvancedFilters(prev => ({ ...prev, [pref.key]: active ? '' : opt }))}
              >
                <Text style={[styles.modalOptionChipText, active && styles.modalOptionChipTextActive]}>
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

  const RideRequestModal = () => (
    <Modal visible={showRideRequestModal} transparent={true} animationType="slide" onRequestClose={() => setShowRideRequestModal(false)}>
      <View style={styles.modalBackdrop}>
        <TouchableOpacity style={styles.modalOverlay} activeOpacity={1} onPress={() => setShowRideRequestModal(false)} />
        <View style={styles.requestModalSheet}>
          <View style={styles.modalHandle} />
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Request Ride Alert</Text>
            <TouchableOpacity onPress={() => setShowRideRequestModal(false)}><Ionicons name="close" size={24} color={Colors.dark} /></TouchableOpacity>
          </View>
          <ScrollView showsVerticalScrollIndicator={false}>
            <View style={styles.requestModalContent}>
              <View style={styles.requestInfoBox}>
                <Ionicons name="information-circle" size={20} color={Colors.primary} />
                <Text style={styles.requestInfoText}>No rides found for this route. We'll email you when a ride becomes available.</Text>
              </View>
              <View style={styles.requestRouteBox}>
                <Text style={styles.requestRouteLabel}>Route:</Text>
                <Text style={styles.requestRouteText}>{from} → {to}</Text>
                <Text style={styles.requestRouteDetail}>{new Date(dateTime).toLocaleDateString()} at {new Date(dateTime).toLocaleTimeString()}</Text>
                <Text style={styles.requestRouteDetail}>{requestedSeats} seat{requestedSeats !== 1 ? 's' : ''} needed</Text>
              </View>
              {!hasVerifiedEmail && (
                <View style={styles.requestNoteBox}>
                  <Ionicons name="mail-outline" size={16} color="#D97706" />
                  <Text style={styles.requestNoteText}>Email verification required. You'll need to verify your email to receive alerts.</Text>
                </View>
              )}
              <View style={styles.requestNoteBox}>
                <Ionicons name="time-outline" size={16} color={Colors.gray} />
                <Text style={styles.requestNoteText}>Your request will remain active for 7 days. You can cancel it anytime in your profile.</Text>
              </View>
            </View>
          </ScrollView>
          <View style={styles.modalFooter}>
            <TouchableOpacity style={styles.modalSecondaryBtn} onPress={() => setShowRideRequestModal(false)}>
              <Text style={styles.modalSecondaryBtnText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.modalPrimaryBtn, rideRequestLoading && styles.disabledButton]} onPress={handleRequestRideAlert} disabled={rideRequestLoading}>
              {rideRequestLoading ? <ActivityIndicator size="small" color={Colors.white} /> : <Text style={styles.modalPrimaryBtnText}>{hasVerifiedEmail ? 'Get Email Alert' : 'Verify Email & Continue'}</Text>}
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );

  const renderRideCard = ({ item }) => {
    let profilePhotoUrl = null;
    let isSvg = false;
    
    if (item.profilePicture) profilePhotoUrl = buildImageUrl(item.profilePicture);
    else if (item.profilepicture) profilePhotoUrl = buildImageUrl(item.profilepicture);
    else if (item.profilePhoto) profilePhotoUrl = buildImageUrl(item.profilePhoto);
    else if (item.driverProfilePicture) profilePhotoUrl = buildImageUrl(item.driverProfilePicture);
    
    if (profilePhotoUrl && profilePhotoUrl.toLowerCase().includes('.svg')) isSvg = true;
    
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
    }

    const preferenceBadges = extractPreferenceBadges(item);
    const isDriverVerified = item.isVerified;
    const driverRating = item.rating || 0;

    const pickupName = item.pickupLabel || item.from || 'Pickup point';
    const dropName = item.dropLabel || item.to || 'Drop point';
    
    const seatsAvailable = item.seatsAvailable || 0;
    const isSeatsInsufficient = requestedSeats > seatsAvailable && seatsAvailable > 0;
    const isFull = seatsAvailable === 0;
    const canBook = !isFull && seatsAvailable >= requestedSeats;

    return (
      <TouchableOpacity style={[styles.rideCard, !canBook && !isFull && styles.rideCardWarning, isFull && styles.rideCardFull]} onPress={() => handleCardPress(item)} activeOpacity={0.9}>
        <View style={styles.cardTopRow}>
          <View style={styles.profileRow}>
            <TouchableOpacity onPress={() => handleCardPress(item)} activeOpacity={0.8}>
              <View style={styles.avatarContainer}>
                {profilePhotoUrl ? (isSvg ? <View style={styles.svgContainer}><SvgCssUri uri={profilePhotoUrl} width="48" height="48" /></View> : <Image source={{ uri: profilePhotoUrl }} style={styles.avatarImage} resizeMode="cover" />) : (
                  <View style={styles.initialsContainer}><Text style={styles.avatarFallback}>{avatarText}</Text></View>
                )}
              </View>
            </TouchableOpacity>
            <View style={styles.profileContent}>
              <View style={styles.nameRow}>
                <Text style={styles.driverName} numberOfLines={1}>{driverNameText}</Text>
                {isDriverVerified && (<View style={styles.verifiedBadge}><Ionicons name="checkmark-circle" size={14} color="#16A34A" /><Text style={styles.verifiedText}>Verified</Text></View>)}
                {item.womenOnly === true && (<View style={styles.womenOnlyBadge}><Ionicons name="woman" size={12} color="#E91E63" /><Text style={styles.womenOnlyBadgeText}>Women Only</Text></View>)}
                {isFull && (<View style={styles.fullBadge}><Ionicons name="close-circle" size={12} color="#EF4444" /><Text style={styles.fullBadgeText}>Full</Text></View>)}
              </View>
              <View style={styles.ratingRow}><RatingStars rating={driverRating} size={12} showLabel={true} /></View>
            </View>
          </View>
          <View style={styles.priceMatchWrap}>
            <View style={styles.matchBadge}><Text style={styles.matchText}>{item.matchPercentage || 0}%</Text></View>
            <Text style={styles.priceText}>₹{item.price}</Text>
            <Text style={styles.perSeatText}>per seat</Text>
          </View>
        </View>
        <View style={styles.infoRow}>
          <View style={styles.infoItem}><Ionicons name="calendar-outline" size={13} color={Colors.gray} /><Text style={styles.infoText} numberOfLines={1}>{item.date}</Text></View>
          <View style={styles.infoDot} />
          <View style={styles.infoItem}><Ionicons name="time-outline" size={13} color={Colors.gray} /><Text style={styles.infoText} numberOfLines={1}>{item.time}</Text></View>
          <View style={styles.infoDot} />
          <View style={styles.infoItem}><Ionicons name="people-outline" size={13} color={Colors.gray} /><Text style={[styles.infoText, isFull ? styles.fullText : (isSeatsInsufficient && styles.warningText)]} numberOfLines={1}>{isFull ? 'Ride Full' : `${seatsAvailable} left`}</Text></View>
        </View>
        {isFull && (<View style={styles.fullWarningContainer}><Ionicons name="close-circle" size={14} color="#EF4444" /><Text style={styles.fullWarningText}>This ride is currently full. Check back later or try another ride.</Text></View>)}
        {!isFull && isSeatsInsufficient && seatsAvailable > 0 && (<View style={styles.seatWarningContainer}><Ionicons name="warning" size={14} color="#D97706" /><Text style={styles.seatWarningText}>Only {seatsAvailable} seat{seatsAvailable !== 1 ? 's' : ''} left. You requested {requestedSeats} seat{requestedSeats !== 1 ? 's' : ''}.</Text></View>)}
        <View style={styles.divider} />
        <View style={styles.routeBlock}>
          <View style={styles.routeRow}><View style={[styles.routeDot, { backgroundColor: '#22C55E' }]} /><View style={styles.routeTextWrap}><Text style={styles.routeLabel}>Pickup</Text><Text style={styles.routeText} numberOfLines={2}>{pickupName}</Text></View></View>
          <View style={styles.routeRow}><View style={[styles.routeDot, { backgroundColor: '#F97316' }]} /><View style={styles.routeTextWrap}><Text style={styles.routeLabel}>Drop</Text><Text style={styles.routeText} numberOfLines={2}>{dropName}</Text></View></View>
        </View>
        <View style={styles.vehicleRow}><Ionicons name="car-sport-outline" size={14} color={Colors.gray} /><Text style={styles.vehicleText} numberOfLines={1}>{vehicleLabel}</Text></View>
        {preferenceBadges.length > 0 && (<ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.badgeScroll}>{preferenceBadges.map((badge, index) => (<PreferenceTag key={`${badge}-${index}`} label={badge} />))}</ScrollView>)}
      </TouchableOpacity>
    );
  };

  if (authLoading || loading || isLoadingProfile) {
    return (<View style={styles.loadingContainer}><LottieView source={require("../assets/loading.json")} autoPlay loop style={{ width: 300, height: 300 }} /></View>);
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={Colors.white} />
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}><MaterialIcons name="arrow-back-ios" size={24} color="#ED7117" /></TouchableOpacity>
        <Text style={styles.headerTitle}>Available Rides</Text>
        <TouchableOpacity style={[styles.filterButton, headerFiltersVisible && styles.filterButtonActive]} onPress={() => setHeaderFiltersVisible(prev => !prev)}><Ionicons name="options-outline" size={22} color="#ED7117" /></TouchableOpacity>
      </View>
      {lastRequestStatus && (<View style={[styles.debugBanner, lastRequestStatus.success ? styles.debugBannerSuccess : styles.debugBannerError]}><Ionicons name={lastRequestStatus.success ? "checkmark-circle" : "alert-circle"} size={18} color={lastRequestStatus.success ? "#166534" : "#991B1B"} /><Text style={[styles.debugBannerText, lastRequestStatus.success ? styles.debugBannerTextSuccess : styles.debugBannerTextError]}>{lastRequestStatus.message}</Text><TouchableOpacity onPress={() => setLastRequestStatus(null)}><Ionicons name="close" size={16} color={lastRequestStatus.success ? "#166534" : "#991B1B"} /></TouchableOpacity></View>)}
      {headerFiltersVisible && (<View style={styles.topControlsWrap}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterScroll}>
          {quickFilterOptions.map((filter) => { const active = quickFilters.includes(filter.key); return (<TouchableOpacity key={filter.key} activeOpacity={0.85} style={[styles.quickChip, active && styles.quickChipActive]} onPress={() => toggleQuickFilter(filter.key)}><Text style={[styles.quickChipText, active && styles.quickChipTextActive]}>{filter.label}</Text></TouchableOpacity>); })}
          <TouchableOpacity activeOpacity={0.85} style={styles.moreFilterChip} onPress={() => setFilterModalVisible(true)}><Ionicons name="options-outline" size={14} color="#ED7117" /><Text style={styles.moreFilterChipText}>More Filters</Text></TouchableOpacity>
        </ScrollView>
        <Text style={styles.sortLabel}>Sort by</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.sortScroll}>
          {SORT_OPTIONS.map((option) => { const active = sortBy === option.key; return (<TouchableOpacity key={option.key} activeOpacity={0.85} style={[styles.sortChip, active && styles.sortChipActive]} onPress={() => setSortBy(option.key)}><Text style={[styles.sortChipText, active && styles.sortChipTextActive]}>{option.label}</Text></TouchableOpacity>); })}
        </ScrollView>
      </View>)}
      {processedRides.length === 0 ? (<View style={styles.emptyContainer}>
        <Ionicons name="car-outline" size={80} color={Colors.gray} />
        <Text style={styles.emptyTitle}>No Rides Found</Text>
        <Text style={styles.emptySubtitle}>{errorMessage ? errorMessage : 'No rides available for this route at the selected time.'}</Text>
        <TouchableOpacity style={styles.requestAlertButton} onPress={() => setShowRideRequestModal(true)}><Ionicons name="notifications-outline" size={20} color={Colors.white} /><Text style={styles.requestAlertButtonText}>Notify me when a ride is available</Text></TouchableOpacity>
        <TouchableOpacity style={styles.clearButton} onPress={clearAllFilters}><Text style={styles.clearButtonText}>Clear Filters</Text></TouchableOpacity>
      </View>) : (<FlatList data={processedRides} renderItem={renderRideCard} keyExtractor={(item) => String(item.id)} contentContainerStyle={styles.listContent} showsVerticalScrollIndicator={false} refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[Colors.primary]} tintColor={Colors.primary} />} ItemSeparatorComponent={() => <View style={{ height: 12 }} />} />)}
      <Modal visible={filterModalVisible} transparent animationType="slide" onRequestClose={() => setFilterModalVisible(false)}>
        <View style={styles.modalBackdrop}>
          <TouchableOpacity style={styles.modalOverlay} activeOpacity={1} onPress={() => setFilterModalVisible(false)} />
          <View style={styles.modalSheet}>
            <View style={styles.modalHandle} />
            <View style={styles.modalHeader}><Text style={styles.modalTitle}>More Filters</Text><TouchableOpacity onPress={() => setFilterModalVisible(false)}><Ionicons name="close" size={24} color={Colors.dark} /></TouchableOpacity></View>
            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.modalContent}>
              {advancedFilterOptions.map((pref) => (<View key={pref.key} style={styles.modalSection}><Text style={styles.modalSectionTitle}>{pref.label}</Text>{renderAdvancedFilterControl(pref)}</View>))}
            </ScrollView>
            <View style={styles.modalFooter}>
              <TouchableOpacity style={styles.modalSecondaryBtn} onPress={clearAllFilters}><Text style={styles.modalSecondaryBtnText}>Clear</Text></TouchableOpacity>
              <TouchableOpacity style={styles.modalPrimaryBtn} onPress={() => setFilterModalVisible(false)}><Text style={styles.modalPrimaryBtnText}>Apply Filters</Text></TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
      <RideRequestModal />
      <EmailVerificationModal visible={showEmailVerification} onVerify={handleEmailVerified} onClose={() => { setShowEmailVerification(false); setPendingRideRequest(false); }} />
      <ProfileImageModal visible={selectedProfile.visible} imageUrl={selectedProfile.imageUrl} driverName={selectedProfile.driverName} onClose={() => setSelectedProfile({ visible: false, imageUrl: null, driverName: '' })} />
      <CustomAlert visible={alertVisible} title={alertConfig.title} message={alertConfig.message} icon={alertConfig.icon} iconColor={alertConfig.iconColor} buttons={alertConfig.buttons} onBackdropPress={() => setAlertVisible(false)} />
    </SafeAreaView>
  );
}
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  header: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 12, borderBottomWidth: 0.5, borderBottomColor: '#fff', backgroundColor: Colors.white },
  backButton: { width: 44, height: 44, justifyContent: 'center' },
  filterButton: { width: 44, height: 44, justifyContent: 'center', alignItems: 'center', borderRadius: 22 },
  filterButtonActive: { backgroundColor: '#fff' },
  headerTitle: { ...Typography.h2, fontSize: 28, fontWeight: '700', color: Colors.primary, flex: 1, textAlign: 'center' },
  topControlsWrap: { backgroundColor: Colors.white, paddingTop: 10, paddingBottom: 12, borderBottomWidth: 1, borderBottomColor: '#EEF2F7' },
  filterScroll: { paddingHorizontal: 16, gap: 10 },
  quickChip: { paddingHorizontal: 14, paddingVertical: 10, borderRadius: 20, backgroundColor: '#F3F4F6' },
  quickChipActive: { backgroundColor: Colors.primary },
  quickChipText: { fontSize: 12, fontWeight: '600', color: Colors.dark },
  quickChipTextActive: { color: Colors.white },
  moreFilterChip: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 14, paddingVertical: 10, borderRadius: 20, backgroundColor: '#EEF6FF' },
  moreFilterChipText: { fontSize: 12, fontWeight: '700', color: '#ED7117' },
  sortLabel: { paddingHorizontal: 16, marginTop: 12, marginBottom: 8, fontSize: 12, color: Colors.gray, fontWeight: '700' },
  sortScroll: { paddingHorizontal: 16, gap: 10 },
  sortChip: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 14, backgroundColor: '#F3F4F6' },
  sortChipActive: { backgroundColor: '#ED7117' },
  sortChipText: { fontSize: 12, color: Colors.dark, fontWeight: '600' },
  sortChipTextActive: { color: Colors.white },
  listContent: { padding: 16, paddingBottom: 28 },
  rideCard: { backgroundColor: Colors.white, borderRadius: 18, padding: 14, borderWidth: 1, borderColor: '#EEF2F7', shadowColor: '#0F172A', shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.05, shadowRadius: 14, elevation: 2 },
  rideCardWarning: { backgroundColor: '#FFFBEB', borderColor: '#FDE68A' },
  rideCardFull: { backgroundColor: '#FEF2F2', borderColor: '#FEE2E2', opacity: 0.85 },
  cardTopRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  profileRow: { flexDirection: 'row', flex: 1, paddingRight: 10 },
  avatarContainer: { width: 48, height: 48, borderRadius: 24, backgroundColor: '#E5E7EB', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', marginRight: 10 },
  avatarImage: { width: 48, height: 48 },
  avatarFallback: { fontSize: 14, fontWeight: '800', color: Colors.gray },
  profileContent: { flex: 1 },
  nameRow: { flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap', gap: 6 },
  driverName: { fontSize: 15, fontWeight: '800', color: Colors.dark, maxWidth: '100%' },
  verifiedBadge: { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: '#E8F5E9', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 12 },
  verifiedText: { fontSize: 10, fontWeight: '700', color: '#16A34A' },
  womenOnlyBadge: { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: '#FCE4EC', paddingHorizontal: 8, paddingVertical: 3, borderRadius: 12 },
  womenOnlyBadgeText: { fontSize: 10, color: '#E91E63', fontWeight: '700' },
  fullBadge: { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: '#FEF2F2', paddingHorizontal: 8, paddingVertical: 3, borderRadius: 12, borderWidth: 1, borderColor: '#FEE2E2' },
  fullBadgeText: { fontSize: 10, color: '#EF4444', fontWeight: '700' },
  ratingRow: { flexDirection: 'row', alignItems: 'center', marginTop: 4 },
  ratingText: { fontSize: 11, color: Colors.gray, fontWeight: '600' },
  priceMatchWrap: { alignItems: 'flex-end' },
  matchBadge: { backgroundColor: '#EEF6FF', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 10, marginBottom: 6 },
  matchText: { fontSize: 12, fontWeight: '800', color: Colors.primary },
  priceText: { fontSize: 18, fontWeight: '800', color: '#ED7117', lineHeight: 20 },
  perSeatText: { fontSize: 10, color: Colors.gray, fontWeight: '600', marginTop: 2 },
  infoRow: { flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap', marginTop: 12, marginBottom: 10 },
  infoItem: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  infoText: { fontSize: 12, color: Colors.dark, fontWeight: '600' },
  warningText: { color: '#F59E0B' },
  fullText: { color: '#EF4444' },
  infoDot: { width: 4, height: 4, borderRadius: 2, backgroundColor: '#CBD5E1', marginHorizontal: 8 },
  seatWarningContainer: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#FEF3C7', borderRadius: 8, padding: 8, marginTop: 8, marginBottom: 4, gap: 6 },
  seatWarningText: { flex: 1, fontSize: 11, color: '#D97706', fontWeight: '600' },
  fullWarningContainer: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#FEF2F2', borderRadius: 8, padding: 8, marginTop: 8, marginBottom: 4, borderWidth: 1, borderColor: '#FEE2E2', gap: 6 },
  fullWarningText: { flex: 1, fontSize: 11, color: '#EF4444', fontWeight: '600' },
  divider: { height: 1, backgroundColor: '#EEF2F7', marginBottom: 10 },
  routeBlock: { gap: 8 },
  routeRow: { flexDirection: 'row', alignItems: 'flex-start' },
  routeDot: { width: 8, height: 8, borderRadius: 4, marginTop: 5, marginRight: 8 },
  routeTextWrap: { flex: 1 },
  routeLabel: { fontSize: 11, color: Colors.gray, fontWeight: '700', marginBottom: 2 },
  routeText: { fontSize: 13, color: Colors.dark, fontWeight: '600', lineHeight: 18 },
  vehicleRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 10 },
  vehicleText: { fontSize: 12, color: Colors.gray, fontWeight: '600', flex: 1 },
  badgeScroll: { gap: 8, paddingTop: 10 },
  prefBadge: { paddingHorizontal: 10, paddingVertical: 6, borderRadius: 12, marginRight: 8 },
  prefBadgeText: { fontSize: 11, fontWeight: '700' },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: Colors.white },
  emptyContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingHorizontal: 40 },
  emptyTitle: { fontSize: 22, fontWeight: '700', color: Colors.dark, marginTop: 20, marginBottom: 8 },
  emptySubtitle: { fontSize: 15, color: Colors.gray, textAlign: 'center', lineHeight: 22, marginBottom: 24 },
  requestAlertButton: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', backgroundColor: Colors.primary, paddingHorizontal: 20, paddingVertical: 14, borderRadius: 12, marginBottom: 12, gap: 8, width: '100%' },
  requestAlertButtonText: { color: Colors.white, fontSize: 15, fontWeight: '600' },
  clearButton: { backgroundColor: Colors.primary, paddingHorizontal: 24, paddingVertical: 12, borderRadius: 12 },
  clearButtonText: { color: Colors.white, fontSize: 15, fontWeight: '700' },
  modalBackdrop: { flex: 1, backgroundColor: 'rgba(15,23,42,0.28)', justifyContent: 'flex-end' },
  modalOverlay: { flex: 1 },
  modalSheet: { backgroundColor: Colors.white, borderTopLeftRadius: 24, borderTopRightRadius: 24, maxHeight: '78%', paddingTop: 10 },
  requestModalSheet: { backgroundColor: Colors.white, borderTopLeftRadius: 24, borderTopRightRadius: 24, maxHeight: '80%', paddingTop: 10 },
  verifyModalSheet: { backgroundColor: Colors.white, borderTopLeftRadius: 24, borderTopRightRadius: 24, maxHeight: '85%', paddingTop: 10 },
  modalHandle: { width: 52, height: 5, borderRadius: 999, backgroundColor: '#D1D5DB', alignSelf: 'center', marginBottom: 14 },
  modalHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 18, paddingBottom: 10 },
  modalTitle: { fontSize: 20, fontWeight: '800', color: Colors.dark },
  modalContent: { paddingHorizontal: 18, paddingBottom: 20 },
  requestModalContent: { padding: 20 },
  verifyModalContent: { padding: 20 },
  modalSection: { marginBottom: 18 },
  modalSectionTitle: { fontSize: 14, fontWeight: '700', color: Colors.dark, marginBottom: 10 },
  modalToggleChip: { borderRadius: 14, borderWidth: 1, borderColor: '#E5E7EB', paddingHorizontal: 14, paddingVertical: 10, alignSelf: 'flex-start', backgroundColor: '#F9FAFB' },
  modalToggleChipActive: { backgroundColor: Colors.primary, borderColor: Colors.primary },
  modalToggleChipText: { fontSize: 13, color: Colors.dark, fontWeight: '600' },
  modalToggleChipTextActive: { color: Colors.white },
  modalOptionWrap: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  modalOptionChip: { borderRadius: 16, borderWidth: 1, borderColor: '#E5E7EB', paddingHorizontal: 12, paddingVertical: 9, backgroundColor: '#F9FAFB' },
  modalOptionChipActive: { backgroundColor: Colors.primary, borderColor: Colors.primary },
  modalOptionChipText: { fontSize: 13, color: Colors.dark, fontWeight: '600' },
  modalOptionChipTextActive: { color: Colors.white },
  modalFooter: { flexDirection: 'row', paddingHorizontal: 18, paddingTop: 12, paddingBottom: Platform.OS === 'ios' ? 28 : 18, borderTopWidth: 1, borderTopColor: '#EEF2F7', gap: 12 },
  modalSecondaryBtn: { flex: 1, borderRadius: 14, paddingVertical: 14, alignItems: 'center', backgroundColor: '#F3F4F6' },
  modalSecondaryBtnText: { fontSize: 15, fontWeight: '700', color: Colors.dark },
  modalPrimaryBtn: { flex: 1, borderRadius: 14, paddingVertical: 14, alignItems: 'center', backgroundColor: Colors.primary },
  modalPrimaryBtnText: { fontSize: 15, fontWeight: '700', color: Colors.white },
  requestInfoBox: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#EFF6FF', padding: 12, borderRadius: 12, marginBottom: 16, gap: 8 },
  requestInfoText: { flex: 1, fontSize: 13, color: '#1E3A8A', lineHeight: 18 },
  requestRouteBox: { backgroundColor: '#F3F4F6', padding: 12, borderRadius: 12, marginBottom: 20 },
  requestRouteLabel: { fontSize: 12, fontWeight: '600', color: Colors.gray, marginBottom: 4 },
  requestRouteText: { fontSize: 14, fontWeight: '600', color: Colors.dark, marginBottom: 4 },
  requestRouteDetail: { fontSize: 12, color: Colors.gray, marginTop: 2 },
  requestInputGroup: { marginBottom: 16 },
  requestLabel: { fontSize: 14, fontWeight: '600', color: Colors.dark, marginBottom: 8 },
  requestInput: { borderWidth: 1, borderColor: '#E5E7EB', borderRadius: 12, paddingHorizontal: 12, paddingVertical: 10, fontSize: 14, backgroundColor: '#F9FAFB' },
  requestTextArea: { minHeight: 80, textAlignVertical: 'top' },
  requestHelper: { fontSize: 11, color: Colors.gray, marginTop: 4 },
  requestNoteBox: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#FEF3C7', padding: 12, borderRadius: 12, gap: 8 },
  requestNoteText: { flex: 1, fontSize: 12, color: '#D97706' },
  disabledButton: { opacity: 0.6 },
  imageModalContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.9)' },
  imageModalContent: { width: '90%', backgroundColor: Colors.white, borderRadius: 20, overflow: 'hidden' },
  imageModalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 16, borderBottomWidth: 1, borderBottomColor: '#EEF2F7' },
  imageModalTitle: { fontSize: 18, fontWeight: '700', color: Colors.dark },
  fullProfileImage: { width: '100%', height: 400, backgroundColor: '#F5F5F5' },
  noImageContainer: { width: '100%', height: 400, justifyContent: 'center', alignItems: 'center', backgroundColor: '#F5F5F5' },
  noImageText: { fontSize: 16, color: Colors.gray },
  svgContainer: { width: 48, height: 48, alignItems: 'center', justifyContent: 'center' },
  initialsContainer: { width: '100%', height: '100%', alignItems: 'center', justifyContent: 'center', backgroundColor: '#E5E7EB' },
  modalSvgContainer: { width: '100%', height: 400, backgroundColor: '#F5F5F5', alignItems: 'center', justifyContent: 'center' },
  debugBanner: { flexDirection: 'row', alignItems: 'center', padding: 12, marginHorizontal: 16, marginTop: 8, marginBottom: 8, borderRadius: 8, gap: 8 },
  debugBannerSuccess: { backgroundColor: '#DCFCE7', borderLeftWidth: 4, borderLeftColor: '#22C55E' },
  debugBannerError: { backgroundColor: '#FEE2E2', borderLeftWidth: 4, borderLeftColor: '#EF4444' },
  debugBannerText: { flex: 1, fontSize: 12, fontWeight: '500' },
  debugBannerTextSuccess: { color: '#166534' },
  debugBannerTextError: { color: '#991B1B' },
  verifyInfoBox: { alignItems: 'center', marginBottom: 24 },
  verifyTitle: { fontSize: 20, fontWeight: '700', color: Colors.dark, marginTop: 12, marginBottom: 8 },
  verifyDescription: { fontSize: 14, color: Colors.gray, textAlign: 'center', lineHeight: 20, marginBottom: 16 },
  inputError: { borderColor: '#EF4444', borderWidth: 2 },
  errorText: { fontSize: 12, color: '#EF4444', marginTop: 4 },
  resendButton: { marginTop: 12, alignSelf: 'center' },
  resendButtonText: { fontSize: 14, color: Colors.primary, fontWeight: '600' },
});