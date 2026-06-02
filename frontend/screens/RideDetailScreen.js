// import React, { useMemo, useRef, useState, useEffect, useCallback } from 'react';
// import {
//   View,
//   Text,
//   StyleSheet,
//   TouchableOpacity,
//   ScrollView,
//   Platform,
//   StatusBar,
//   Image,
//   Dimensions,
//   Animated,
//   PanResponder,
//   Modal
// } from 'react-native';
// import MapView, { Marker, Polyline, PROVIDER_GOOGLE } from 'react-native-maps';
// import { Ionicons } from '@expo/vector-icons';
// import LottieView from "lottie-react-native";
// import { SvgCssUri } from 'react-native-svg/css';
// import { Colors } from '../constants/Colors';
// import { useAuth } from '../context/AuthContext';
// import { API_BASE_URL } from '../config/config_ip';
// import CustomAlert from '../components/CustomAlert';
// import { useFocusEffect } from '@react-navigation/native';

// const { height } = Dimensions.get('window');
// const SAFE_TOP = Platform.OS === 'ios' ? 56 : 24;
// const COLLAPSED_HEIGHT = 84;
// const EXPANDED_HEIGHT = height * 0.72;

// // Cache for driver profiles and images
// const driverProfileCache = new Map();
// const profileImageCache = new Map();

// function buildImageUrl(url) {
//   if (!url) return null;
//   if (url.startsWith('http://') || url.startsWith('https://')) return url;
//   return `${API_BASE_URL}${url.startsWith('/') ? '' : '/'}${url}`;
// }

// function getDriverInitials(name) {
//   if (!name) return 'D';
//   const parts = name.trim().split(' ').filter(Boolean);
//   if (parts.length > 1) return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
//   return parts[0].slice(0, 2).toUpperCase();
// }

// function parseSuggestedPoint(point) {
//   if (!point) return null;

//   if (Array.isArray(point) && point.length === 2) {
//     return {
//       longitude: Number(point[0]),
//       latitude: Number(point[1]),
//     };
//   }

//   if (point.lng != null && point.lat != null) {
//     return {
//       longitude: Number(point.lng),
//       latitude: Number(point.lat),
//     };
//   }

//   if (point.longitude != null && point.latitude != null) {
//     return {
//       longitude: Number(point.longitude),
//       latitude: Number(point.latitude),
//     };
//   }

//   return null;
// }

// function parseRouteCoordinates(routeCoordinates) {
//   if (!Array.isArray(routeCoordinates)) return [];

//   return routeCoordinates
//     .map((item) => {
//       if (Array.isArray(item) && item.length === 2) {
//         return {
//           longitude: Number(item[0]),
//           latitude: Number(item[1]),
//         };
//       }
//       return parseSuggestedPoint(item);
//     })
//     .filter(Boolean);
// }

// // Fetch user documents to check verification status
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

// // Fetch driver profile for bio and other details
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

// // Generic function to extract all ride preferences dynamically
// function extractAllPreferences(ride, driverTravelPrefs) {
//   // First try ride preferences
//   let ridePrefs = ride?.preferences;
  
//   // Handle if preferences is a string (JSON)
//   if (ridePrefs && typeof ridePrefs === 'string') {
//     try {
//       ridePrefs = JSON.parse(ridePrefs);
//       console.log('Parsed ride preferences from string:', ridePrefs);
//     } catch (e) {
//       console.log('Failed to parse preferences string:', e);
//       ridePrefs = null;
//     }
//   }
  
//   // Check if we have valid ride preferences
//   if (ridePrefs && typeof ridePrefs === 'object' && Object.keys(ridePrefs).length > 0) {
//     console.log('✅ Using ride preferences:', ridePrefs);
//     return extractFromObject(ridePrefs);
//   }
  
//   // Fallback to driver's travel preferences
//   if (driverTravelPrefs && typeof driverTravelPrefs === 'object' && Object.keys(driverTravelPrefs).length > 0) {
//     console.log('✅ Using driver travel preferences as fallback:', driverTravelPrefs);
//     return extractFromObject(driverTravelPrefs);
//   }
  
//   // If no preferences at all, return empty array (don't show anything)
//   console.log('⚠️ No preferences found');
//   return [];
// }

// function extractFromObject(prefs) {
//   const allPreferences = [];

//   Object.entries(prefs).forEach(([key, value]) => {
//     // Skip if value is null, undefined, or empty
//     if (value === null || value === undefined) return;
    
//     // Format the key for display
//     const formattedKey = key.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
    
//     // Handle different value types
//     if (typeof value === 'boolean') {
//       // Only show boolean preferences if they are true
//       if (value === true) {
//         allPreferences.push(formattedKey);
//       }
//     } 
//     else if (Array.isArray(value)) {
//       // Handle arrays (like speak_languages: ["English"])
//       if (value.length > 0) {
//         allPreferences.push(`${formattedKey}: ${value.join(', ')}`);
//       }
//     }
//     else if (typeof value === 'object') {
//       // Handle nested objects if any
//       const nestedPrefs = extractFromObject(value);
//       allPreferences.push(...nestedPrefs);
//     }
//     else if (typeof value === 'string' && value.trim()) {
//       // Handle string values (like "Chatty", "26–35", "No Preference")
//       // Don't show if it's a false-y string
//       const lowerValue = value.toLowerCase();
//       if (!['false', 'no', 'none', 'null', 'undefined'].includes(lowerValue)) {
//         allPreferences.push(`${formattedKey}: ${value}`);
//       }
//     }
//     else if (typeof value === 'number') {
//       // Handle numbers
//       allPreferences.push(`${formattedKey}: ${value}`);
//     }
//   });

//   // Remove duplicates
//   return [...new Set(allPreferences)];
// }

// // Generic Preference Tag Component
// function GenericPreferenceTag({ label }) {
//   if (!label || label.trim() === '') return null;
  
//   // Determine if it's a key: value pair or just a key
//   const isKeyValue = label.includes(':');
//   let displayText = label;
//   let tagColor = '#FFF3E8';
//   let textColor = '#C65D00';
  
//   // Color coding based on preference type
//   const lowerLabel = label.toLowerCase();
  
//   if (lowerLabel.includes('age') || lowerLabel.includes('category')) {
//     tagColor = '#E8F5E9';
//     textColor = '#2E7D32';
//   } else if (lowerLabel.includes('chat') || lowerLabel.includes('talk')) {
//     tagColor = '#E3F2FD';
//     textColor = '#1565C0';
//   } else if (lowerLabel.includes('gender')) {
//     tagColor = '#F3E5F5';
//     textColor = '#6A1B9A';
//   } else if (lowerLabel.includes('language') || lowerLabel.includes('speak')) {
//     tagColor = '#FFF9C4';
//     textColor = '#F57F17';
//   } else if (lowerLabel.includes('verified')) {
//     tagColor = '#E8F5E9';
//     textColor = '#2E7D32';
//   } else if (lowerLabel.includes('music')) {
//     tagColor = '#E8F5E9';
//     textColor = '#2E7D32';
//   } else if (lowerLabel.includes('ac')) {
//     tagColor = '#E3F2FD';
//     textColor = '#1565C0';
//   } else if (lowerLabel.includes('pet')) {
//     tagColor = '#FCE4EC';
//     textColor = '#C2185B';
//   } else if (lowerLabel.includes('smoking')) {
//     tagColor = '#FFEBEE';
//     textColor = '#C62828';
//   }
  
//   return (
//     <View style={[styles.preferenceTag, { backgroundColor: tagColor }]}>
//       <Text style={[styles.preferenceTagText, { color: textColor }]}>{displayText}</Text>
//     </View>
//   );
// }

// // Profile Image Modal Component with SVG support
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

// export default function RideDetailScreen({ navigation, route }) {
//   const { user, isAuthenticated } = useAuth();
//   const { ride, searchData } = route.params || {};

//   const [seatsRequested, setSeatsRequested] = useState(1);
//   const [requestLoading, setRequestLoading] = useState(false);
//   const [drawerExpanded, setDrawerExpanded] = useState(true);
//   const [driverProfile, setDriverProfile] = useState(null);
//   const [isVerified, setIsVerified] = useState(false);
//   const [loadingProfile, setLoadingProfile] = useState(false);
//   const [mapReady, setMapReady] = useState(false);
//   const animatedDrawer = useRef(new Animated.Value(1)).current;
//   const mapRef = useRef(null);
  
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

//   const showConfirmationAlert = (title, message, onConfirm) => {
//     setAlertConfig({
//       title,
//       message,
//       icon: "warning",
//       iconColor: "#F59E0B",
//       buttons: [
//         { text: 'Cancel', onPress: () => setAlertVisible(false), style: 'cancel' },
//         { text: 'Login', onPress: () => {
//           setAlertVisible(false);
//           onConfirm();
//         }, style: 'destructive' }
//       ]
//     });
//     setAlertVisible(true);
//   };

//   // Fetch driver profile and verification status with caching
//   useEffect(() => {
//     const loadDriverData = async () => {
//       const driverPhone = ride?.phoneNumber;
//       const driverUserId = ride?.driverUserId;
//       const cacheKey = driverPhone || driverUserId || ride?.id;
      
//       // Check cache first
//       if (driverProfileCache.has(cacheKey)) {
//         console.log('📦 Using cached driver profile for:', cacheKey);
//         const cached = driverProfileCache.get(cacheKey);
//         setDriverProfile(cached.profile);
//         setIsVerified(cached.isVerified);
//         setLoadingProfile(false);
//         return;
//       }
      
//       if (driverPhone || driverUserId) {
//         setLoadingProfile(true);
        
//         const profileData = await fetchDriverProfile(driverPhone, driverUserId);
//         if (profileData?.success && profileData.user) {
//           setDriverProfile(profileData.user);
//         }
        
//         let verified = false;
//         if (driverPhone) {
//           const docsData = await fetchUserDocuments(driverPhone);
//           if (docsData?.success && docsData.documents) {
//             const verifiedDocs = docsData.documents.filter(doc => {
//               const status = doc.status?.toUpperCase();
//               return status === 'APPROVED' && ['aadhar', 'dl', 'rc'].includes(doc.document_type?.toLowerCase());
//             });
//             verified = verifiedDocs.length > 0;
//             setIsVerified(verified);
//           }
//         }
        
//         // Cache the results
//         driverProfileCache.set(cacheKey, {
//           profile: profileData?.user,
//           isVerified: verified
//         });
        
//         setLoadingProfile(false);
//       }
//     };
    
//     loadDriverData();
//   }, [ride]);

//   useEffect(() => {
//     if (!isAuthenticated) {
//       showConfirmationAlert(
//         'Login Required',
//         'Please login to book rides or chat with drivers.',
//         () => navigation.navigate('Login')
//       );
//       navigation.goBack();
//     }
//   }, [isAuthenticated, navigation]);

//   // Get profile photo URL with caching
//   const getProfilePhotoUrl = useCallback(() => {
//     const driverId = ride?.phoneNumber || ride?.driverUserId || ride?.id;
//     const rawUrl = driverProfile?.profile_picture || ride?.profilePicture;
    
//     if (!rawUrl) return null;
    
//     // Check cache first
//     if (profileImageCache.has(driverId)) {
//       return profileImageCache.get(driverId);
//     }
    
//     const fullUrl = buildImageUrl(rawUrl);
//     if (fullUrl) {
//       profileImageCache.set(driverId, fullUrl);
//     }
//     return fullUrl;
//   }, [driverProfile, ride]);
  
//   const profilePhotoUrl = getProfilePhotoUrl();
//   const avatarText = getDriverInitials(driverProfile?.full_name || ride?.driverName || 'Driver');
//   const isProfilePhotoSvg = profilePhotoUrl ? profilePhotoUrl.toLowerCase().includes('.svg') : false;
  
//   // Extract preferences from ride or driver profile
//   const allPreferences = useMemo(() => {
//     return extractAllPreferences(ride, driverProfile?.travel_preferences);
//   }, [ride, driverProfile]);

//   // Driver route points
//   const driverStart = useMemo(() => {
//     const coords = ride?.routeCoordinates;
//     if (Array.isArray(coords) && coords.length > 0) {
//       const first = coords[0];
//       if (Array.isArray(first) && first.length === 2) {
//         return { latitude: first[1], longitude: first[0] };
//       }
//     }
//     return parseSuggestedPoint(ride?.suggestedPickup);
//   }, [ride]);

//   const driverEnd = useMemo(() => {
//     const coords = ride?.routeCoordinates;
//     if (Array.isArray(coords) && coords.length > 0) {
//       const last = coords[coords.length - 1];
//       if (Array.isArray(last) && last.length === 2) {
//         return { latitude: last[1], longitude: last[0] };
//       }
//     }
//     return parseSuggestedPoint(ride?.suggestedDrop);
//   }, [ride]);

//   const intersectionPickup = useMemo(
//     () => parseSuggestedPoint(ride?.suggestedPickup),
//     [ride]
//   );
//   const intersectionDrop = useMemo(
//     () => parseSuggestedPoint(ride?.suggestedDrop),
//     [ride]
//   );

//   const userPickup = useMemo(() => {
//     if (!searchData?.fromCoords) return null;
//     const c = searchData.fromCoords;
//     if (Array.isArray(c) && c.length === 2) {
//       return { latitude: c[1], longitude: c[0] };
//     }
//     return null;
//   }, [searchData]);

//   const userDrop = useMemo(() => {
//     if (!searchData?.toCoords) return null;
//     const c = searchData.toCoords;
//     if (Array.isArray(c) && c.length === 2) {
//       return { latitude: c[1], longitude: c[0] };
//     }
//     return null;
//   }, [searchData]);

//   const routePath = useMemo(() => {
//     const fullRoute = parseRouteCoordinates(ride?.routeCoordinates);
//     if (fullRoute.length >= 2) return fullRoute;
//     if (intersectionPickup && intersectionDrop) return [intersectionPickup, intersectionDrop];
//     return [];
//   }, [ride, intersectionPickup, intersectionDrop]);

//   const walkToPickupPath = useMemo(() => {
//     if (userPickup && intersectionPickup) return [userPickup, intersectionPickup];
//     return [];
//   }, [userPickup, intersectionPickup]);

//   const walkFromDropPath = useMemo(() => {
//     if (userDrop && intersectionDrop) return [intersectionDrop, userDrop];
//     return [];
//   }, [userDrop, intersectionDrop]);

//   const allMarkerCoords = useMemo(() => {
//     const coords = [];
//     if (driverStart) coords.push(driverStart);
//     if (driverEnd) coords.push(driverEnd);
//     if (userPickup) coords.push(userPickup);
//     if (userDrop) coords.push(userDrop);
//     if (intersectionPickup) coords.push(intersectionPickup);
//     if (intersectionDrop) coords.push(intersectionDrop);
//     return coords;
//   }, [driverStart, driverEnd, userPickup, userDrop, intersectionPickup, intersectionDrop]);

//   // Fit map to show all markers when map is ready
//   const fitMapToMarkers = useCallback(() => {
//     if (mapRef.current && mapReady && allMarkerCoords.length >= 2) {
//       setTimeout(() => {
//         try {
//           mapRef.current.fitToCoordinates(allMarkerCoords, {
//             edgePadding: { top: 80, right: 50, bottom: 50, left: 50 },
//             animated: true,
//           });
//         } catch (e) {
//           console.log('fitToCoordinates error:', e);
//         }
//       }, 500);
//     }
//   }, [mapReady, allMarkerCoords]);

//   useEffect(() => {
//     if (mapReady && allMarkerCoords.length >= 2) {
//       fitMapToMarkers();
//     }
//   }, [mapReady, allMarkerCoords, fitMapToMarkers]);

//   const vehicleName = driverProfile?.vehicle 
//     ? [driverProfile.vehicle.model].filter(Boolean).join(' ')
//     : [ride?.vehicle?.model].filter(Boolean).join(' ') || 'Vehicle details unavailable';
  
//   const vehicleRegNumber = driverProfile?.vehicle?.registration_number || 
//                            ride?.vehicle?.registration_number || 
//                            null;
  
//   const vehicleColor = driverProfile?.vehicle?.color || 
//                        ride?.vehicle?.color || 
//                        'Not specified';

//   const totalPrice = Number(ride?.price || 0) * seatsRequested;

//   const handleProfileImagePress = () => {
//     if (profilePhotoUrl) {
//       setSelectedProfile({
//         visible: true,
//         imageUrl: profilePhotoUrl,
//         driverName: driverProfile?.full_name || ride?.driverName || 'Driver',
//       });
//     } else {
//       showCustomAlert('No Photo', 'Driver has not uploaded a profile picture', 'warning');
//     }
//   };

//   const mapHeight = animatedDrawer.interpolate({
//     inputRange: [0, 1],
//     outputRange: [height - SAFE_TOP - COLLAPSED_HEIGHT, height * 0.32],
//   });

//   const drawerHeight = animatedDrawer.interpolate({
//     inputRange: [0, 1],
//     outputRange: [COLLAPSED_HEIGHT, EXPANDED_HEIGHT],
//   });

//   const toggleDrawer = () => {
//     const nextExpanded = !drawerExpanded;
//     setDrawerExpanded(nextExpanded);

//     Animated.timing(animatedDrawer, {
//       toValue: nextExpanded ? 1 : 0,
//       duration: 260,
//       useNativeDriver: false,
//     }).start();
//   };

//   const panResponder = useRef(
//     PanResponder.create({
//       onMoveShouldSetPanResponder: (_, gestureState) =>
//         Math.abs(gestureState.dy) > 5,
//       onPanResponderMove: (_, gestureState) => {
//         const dragRange = EXPANDED_HEIGHT - COLLAPSED_HEIGHT;
//         const progress = drawerExpanded
//           ? 1 - (gestureState.dy / dragRange)
//           : gestureState.dy / dragRange;
//         const clamped = Math.max(0, Math.min(1, progress));
//         animatedDrawer.setValue(clamped);
//       },
//       onPanResponderRelease: (_, gestureState) => {
//         const dragRange = EXPANDED_HEIGHT - COLLAPSED_HEIGHT;
//         const threshold = dragRange * 0.2;
//         if (drawerExpanded) {
//           if (gestureState.dy > threshold) {
//             setDrawerExpanded(false);
//             Animated.timing(animatedDrawer, {
//               toValue: 0,
//               duration: 200,
//               useNativeDriver: false,
//             }).start();
//           } else {
//             setDrawerExpanded(true);
//             Animated.timing(animatedDrawer, {
//               toValue: 1,
//               duration: 200,
//               useNativeDriver: false,
//             }).start();
//           }
//         } else {
//           if (gestureState.dy < -threshold) {
//             setDrawerExpanded(true);
//             Animated.timing(animatedDrawer, {
//               toValue: 1,
//               duration: 200,
//               useNativeDriver: false,
//             }).start();
//           } else {
//             setDrawerExpanded(false);
//             Animated.timing(animatedDrawer, {
//               toValue: 0,
//               duration: 200,
//               useNativeDriver: false,
//             }).start();
//           }
//         }
//       },
//     })
//   ).current;

//   const handleRequestJoin = async () => {
//     if (!user?.phone_number) {
//       showCustomAlert('Login Required', 'Please log in to request a ride.', 'warning');
//       return;
//     }

//     setRequestLoading(true);
//     try {
//       const payload = {
//         ride_id: ride.id,
//         passenger_phone: user.phone_number,
//         seats_requested: seatsRequested,
//       };

//       if (searchData?.fromCoords && Array.isArray(searchData.fromCoords)) {
//         payload.from_coords = searchData.fromCoords;
//       }
//       if (searchData?.toCoords && Array.isArray(searchData.toCoords)) {
//         payload.to_coords = searchData.toCoords;
//       }

//       const response = await fetch(`${API_BASE_URL}/ride-bookings`, {
//         method: 'POST',
//         headers: { 'Content-Type': 'application/json' },
//         body: JSON.stringify(payload),
//       });

//       const raw = await response.text();
//       let data = {};

//       try {
//         data = raw ? JSON.parse(raw) : {};
//       } catch {
//         data.detail = raw;
//       }

//       if (!response.ok) {
//         console.error('Booking error response:', raw);
//         throw new Error(data.detail || data.message || `Server error (${response.status})`);
//       }

//       showCustomAlert('Success', data.message || 'Ride request sent successfully', 'success');
//       setTimeout(() => navigation.goBack(), 1500);
//     } catch (error) {
//       showCustomAlert('Error', error.message || 'Failed to send request', 'error');
//     } finally {
//       setRequestLoading(false);
//     }
//   };

//   const viewDriverProfile = () => {
//     const driverPhone = ride?.phoneNumber;
//     const driverUserId = ride?.driverUserId;
    
//     if (driverPhone || driverUserId) {
//       navigation.navigate('ViewProfileScreen', {
//         userId: driverUserId || null,
//         phoneNumber: driverPhone || null,
//         driverName: driverProfile?.full_name || ride?.driverName || 'Driver',
//         profilePicture: profilePhotoUrl,
//         vehicleNumber: vehicleRegNumber,
//         vehicleModel: vehicleName,
//         driverRating: driverProfile?.avg_rating || ride?.rating || 0,
//       });
//     } else {
//       showCustomAlert('Profile', 'Driver profile not available', 'warning');
//     }
//   };

//   const getOrCreateConversation = async (receiverPhone, rideId) => {
//     try {
//       const myPhone = user?.phone_number;
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
//         body: JSON.stringify({ participant_phone: receiverPhone, ride_id: rideId }),
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

//   const startChat = async () => {
//     const driverPhone = ride?.phoneNumber;
//     if (driverPhone) {
//       const conversationId = await getOrCreateConversation(driverPhone, ride.id);
//       if (conversationId) {
//         navigation.navigate('ChatScreen', {
//           receiverPhone: driverPhone,
//           conversationId,
//           user: {
//             name: driverProfile?.full_name || ride?.driverName || 'Driver',
//             tripInfo: `${ride.from || 'Pickup'} → ${ride.to || 'Drop'}`,
//           },
//         });
//       } else {
//         showCustomAlert('Chat', 'Unable to start chat. Please try again.', 'error');
//       }
//     } else {
//       showCustomAlert('Chat', 'Driver contact not available', 'warning');
//     }
//   };

//   // Loading state
//   if (requestLoading || loadingProfile) {
//     return (
//       <View style={styles.loaderContainer}>
//         <LottieView
//           source={require("../assets/loading.json")}
//           autoPlay
//           loop
//           style={{ width: 300, height: 300 }}
//         />
//       </View>
//     );
//   }

//   if (!ride) {
//     return (
//       <View style={styles.centerContainer}>
//         <Text style={styles.errorText}>No ride data available</Text>
//         <TouchableOpacity
//           onPress={() => navigation.goBack()}
//           style={styles.fallbackBtn}
//         >
//           <Text style={styles.fallbackBtnText}>Go Back</Text>
//         </TouchableOpacity>
//       </View>
//     );
//   }

//   const initialRegion = {
//     latitude: intersectionPickup?.latitude || driverStart?.latitude || 28.6139,
//     longitude: intersectionPickup?.longitude || driverStart?.longitude || 77.2090,
//     latitudeDelta: 0.05,
//     longitudeDelta: 0.05,
//   };

//   return (
//     <View style={styles.container}>
//       <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />

//       <Animated.View style={[styles.mapContainer, { height: mapHeight }]}>
//         <MapView
//           ref={mapRef}
//           provider={PROVIDER_GOOGLE}
//           style={styles.map}
//           initialRegion={initialRegion}
//           onMapReady={() => {
//             console.log('Map ready');
//             setMapReady(true);
//           }}
//           showsUserLocation={false}
//           showsMyLocationButton={false}
//           zoomEnabled={true}
//           zoomControlEnabled={true}
//         >
//           {routePath.length >= 2 && (
//             <Polyline
//               coordinates={routePath}
//               strokeColor="#2457A6"
//               strokeWidth={5}
//               lineCap="round"
//               lineJoin="round"
//             />
//           )}

//           {driverStart && (
//             <Marker  coordinate={driverStart} anchor={{ x: 0.5, y: 1 }}>
//               <View style={styles.markerWrapper}>
//                 <View style={[styles.pinBubble, { backgroundColor: '#16A34A' }]}>
//                   <Text style={styles.pinIcon}>S</Text>
//                 </View>
//                 <View style={[styles.pinPointer, { borderTopColor: '#16A34A' }]} />
//               </View>
//             </Marker>
//           )}

//           {driverEnd && (
//             <Marker coordinate={driverEnd} anchor={{ x: 0.5, y: 1 }}>
//               <View style={styles.markerWrapper}>
//                 <View style={[styles.pinBubble, { backgroundColor: '#DC2626' }]}>
//                   <Text style={styles.pinIcon}>E</Text>
//                 </View>
//                 <View style={[styles.pinPointer, { borderTopColor: '#DC2626' }]} />
//               </View>
//             </Marker>
//           )}

//           {userPickup && (
//             <Marker coordinate={userPickup} anchor={{ x: 0.5, y: 1 }}>
//               <View style={styles.markerWrapper}>
//                 <View style={[styles.pinBubble, { backgroundColor: '#3B82F6' }]}>
//                   <Ionicons name="person" size={12} color="white" />
//                 </View>
//                 <View style={[styles.pinPointer, { borderTopColor: '#3B82F6' }]} />
//                 <View style={styles.pinLabelBubble}>
//                   <Text style={styles.pinLabelText}>Your Pickup</Text>
//                 </View>
//               </View>
//             </Marker>
//           )}

//           {userDrop && (
//             <Marker coordinate={userDrop} anchor={{ x: 0.5, y: 1 }}>
//               <View style={styles.markerWrapper}>
//                 <View style={[styles.pinBubble, { backgroundColor: '#F97316' }]}>
//                   <Ionicons name="flag" size={12} color="white" />
//                 </View>
//                 <View style={[styles.pinPointer, { borderTopColor: '#F97316' }]} />
//                 <View style={styles.pinLabelBubble}>
//                   <Text style={styles.pinLabelText}>Your Drop</Text>
//                 </View>
//               </View>
//             </Marker>
//           )}

//           {intersectionPickup && (
//             <Marker coordinate={intersectionPickup} anchor={{ x: 0.5, y: 1 }}>
//               <View style={styles.markerWrapper}>
//                 <View style={[styles.pinBubble, { backgroundColor: '#FACC15' }]}>
//                   <Ionicons name="hand-right" size={12} color="#713F12" />
//                 </View>
//                 <View style={[styles.pinPointer, { borderTopColor: '#FACC15' }]} />
//                 <View style={styles.pinLabelBubbleYellow}>
//                   <Text style={styles.pinLabelTextYellow}>Meet Driver</Text>
//                 </View>
//               </View>
//             </Marker>
//           )}

//           {intersectionDrop && (
//             <Marker coordinate={intersectionDrop} anchor={{ x: 0.5, y: 1 }}>
//               <View style={styles.markerWrapper}>
//                 <View style={[styles.pinBubble, { backgroundColor: '#FACC15' }]}>
//                   <Ionicons name="exit" size={12} color="#713F12" />
//                 </View>
//                 <View style={[styles.pinPointer, { borderTopColor: '#FACC15' }]} />
//                 <View style={styles.pinLabelBubbleYellow}>
//                   <Text style={styles.pinLabelTextYellow}>Exit Here</Text>
//                 </View>
//               </View>
//             </Marker>
//           )}

//           {walkToPickupPath.length >= 2 && (
//             <Polyline
//               coordinates={walkToPickupPath}
//               strokeColor="#FACC15"
//               strokeWidth={4}
//               lineDashPattern={[8, 6]}
//               lineCap="round"
//               lineJoin="round"
//             />
//           )}

//           {walkFromDropPath.length >= 2 && (
//             <Polyline
//               coordinates={walkFromDropPath}
//               strokeColor="#FACC15"
//               strokeWidth={4}
//               lineDashPattern={[8, 6]}
//               lineCap="round"
//               lineJoin="round"
//             />
//           )}
//         </MapView>

//         <TouchableOpacity
//           style={styles.mapBackButton}
//           onPress={() => navigation.goBack()}
//         >
//           <Ionicons name="chevron-back" size={26} color={Colors.secondary} />
//         </TouchableOpacity>
//       </Animated.View>

//       <Animated.View style={[styles.drawer, { height: drawerHeight }]}>
//         <View style={styles.handleWrap} {...panResponder.panHandlers}>
//           <TouchableOpacity
//             activeOpacity={0.9}
//             onPress={toggleDrawer}
//             style={styles.handleHitArea}
//           >
//             <View style={styles.handleBar} />
//           </TouchableOpacity>
//         </View>

//         {!drawerExpanded ? (
//           <View style={styles.collapsedSummary}>
//             <View style={styles.collapsedTopRow}>
//               <View style={{ flex: 1 }}>
//                 <Text style={styles.collapsedDriver} numberOfLines={1}>
//                   {driverProfile?.full_name || ride?.driverName || 'Driver'}
//                 </Text>
//                 <Text style={styles.collapsedSub} numberOfLines={1}>
//                   {ride.from || 'Pickup'} → {ride.to || 'Drop'}
//                 </Text>
//               </View>

//               <View style={styles.collapsedPriceWrap}>
//                 <Text style={styles.collapsedPrice}>₹{ride.price}</Text>
//                 <Text style={styles.collapsedPerSeat}>per seat</Text>
//               </View>
//             </View>
//           </View>
//         ) : (
//           <>
//             <ScrollView
//               style={styles.drawerScroll}
//               contentContainerStyle={styles.drawerContent}
//               showsVerticalScrollIndicator={false}
//             >
//               <View style={styles.driverCard}>
//                 <View style={styles.driverTopRow}>
//                   <View style={styles.driverLeftWrap}>
//                     <TouchableOpacity 
//                       style={styles.driverAvatar} 
//                       onPress={handleProfileImagePress}
//                       activeOpacity={0.8}
//                     >
//                       {profilePhotoUrl ? (
//                         isProfilePhotoSvg ? (
//                           <View style={styles.svgAvatarContainer}>
//                             <SvgCssUri
//                               uri={profilePhotoUrl}
//                               width={56}
//                               height={56}
//                               onError={(e) => console.log('SVG avatar error:', e)}
//                               onLoad={() => console.log('SVG loaded successfully:', profilePhotoUrl)}
//                             />
//                           </View>
//                         ) : (
//                           <Image 
//                             source={{ uri: profilePhotoUrl }} 
//                             style={styles.avatarImg}
//                             onError={(e) => console.log('Image load error:', e.nativeEvent.error)}
//                             onLoad={() => console.log('Image loaded successfully:', profilePhotoUrl)}
//                           />
//                         )
//                       ) : (
//                         <Text style={styles.avatarText}>{avatarText}</Text>
//                       )}
//                     </TouchableOpacity>

//                     <View style={styles.driverMeta}>
//                       <View style={styles.driverNameRow}>
//                         <Text style={styles.driverName}>
//                           {driverProfile?.full_name || ride?.driverName || 'Driver'}
//                         </Text>
//                         {isVerified && (
//                           <View style={styles.verifiedBadge}>
//                             <Ionicons name="checkmark-circle" size={12} color="#2457A6" />
//                             <Text style={styles.verifiedBadgeText}>Verified</Text>
//                           </View>
//                         )}
//                       </View>

//                       <View style={styles.ratingRow}>
//                         <Ionicons name="star" size={13} color="#F59E0B" />
//                         <Text style={styles.ratingText}>
//                           {driverProfile?.avg_rating || ride?.rating || 4.5}
//                         </Text>
//                       </View>
//                     </View>
//                   </View>

//                   <TouchableOpacity style={styles.chatButtonCircle} onPress={startChat}>
//                     <Ionicons name="chatbubble-outline" size={20} color="#2457A6" />
//                   </TouchableOpacity>
//                 </View>

//                 <Text style={styles.driverBio}>
//                   {driverProfile?.bio || driverProfile?.about || 'Friendly driver, love meeting new people!'}
//                 </Text>

//                 <TouchableOpacity style={styles.profileOutlineBtn} onPress={viewDriverProfile}>
//                   <Text style={styles.profileOutlineBtnText}>View Full Profile</Text>
//                 </TouchableOpacity>
//               </View>

//               <View style={styles.cardSection}>
//                 <Text style={styles.sectionTitle}>Trip Details</Text>

//                 <View style={styles.tripTimelineWrap}>
//                   <View style={styles.timelineRail}>
//                     <View style={[styles.timelineDot, { backgroundColor: '#2457A6' }]} />
//                     <View style={styles.timelineLine} />
//                     <View style={[styles.timelineDot, { backgroundColor: '#FF7A00' }]} />
//                   </View>

//                   <View style={styles.timelineContent}>
//                     <View style={styles.timelineItem}>
//                       <Text style={styles.timelineLabel}>Pickup</Text>
//                       <Text style={styles.timelinePlace}>
//                         {ride.pickupLabel || ride.from || 'Pickup point'}
//                       </Text>
//                       <View style={styles.timelineMetaRow}>
//                         <Ionicons name="time-outline" size={13} color={Colors.gray} />
//                         <Text style={styles.timelineMetaText}>
//                           {ride.date} at {ride.time}
//                         </Text>
//                       </View>
//                     </View>

//                     <View style={styles.timelineItem}>
//                       <Text style={styles.timelineLabel}>Dropoff</Text>
//                       <Text style={styles.timelinePlace}>
//                         {ride.dropLabel || ride.to || 'Drop point'}
//                       </Text>
//                       <Text style={styles.timelineMetaText}>
//                         Estimated: {ride.durationText || '--'}
//                       </Text>
//                     </View>
//                   </View>
//                 </View>
//               </View>

//               {/* Vehicle Details Section with Registration Number */}
//               <View style={styles.cardSection}>
//                 <Text style={styles.sectionTitle}>Vehicle Details</Text>

//                 <View style={styles.vehicleHeaderRow}>
//                   <View style={styles.vehicleIconCircle}>
//                     <Ionicons name="car-sport-outline" size={18} color="#2457A6" />
//                   </View>

//                   <View style={styles.vehicleMeta}>
//                     <Text style={styles.vehicleTitle}>{vehicleName}</Text>
//                     <Text style={styles.vehicleSub}>
//                       {vehicleColor} • {ride?.seatsAvailable || 4} seats
//                     </Text>
//                     {vehicleRegNumber && (
//                       <View style={styles.vehicleRegContainer}>
//                         <Text style={styles.vehicleRegText}>
//                           Vehicle Number: {vehicleRegNumber}
//                         </Text>
//                       </View>
//                     )}
//                   </View>
//                 </View>
//               </View>

//               {/* Dynamic Ride Preferences Section */}
//               <View style={styles.cardSection}>
//                 <Text style={styles.sectionTitle}>Ride Preferences</Text>
//                 <View style={styles.tagRow}>
//                   {allPreferences.length > 0 ? (
//                     allPreferences.map((pref, index) => (
//                       <GenericPreferenceTag key={`${pref}-${index}`} label={pref} />
//                     ))
//                   ) : (
//                     <Text style={styles.emptyText}>No specific preferences added for this ride</Text>
//                   )}
//                 </View>
//               </View>

//               <View style={styles.cardSection}>
//                 <Text style={styles.sectionTitle}>Cost Breakdown</Text>

//                 <View style={styles.priceRow}>
//                   <Text style={styles.priceLabel}>Base fare (per seat)</Text>
//                   <Text style={styles.priceValue}>₹{ride.price || 0}</Text>
//                 </View>

//                 <View style={styles.priceRow}>
//                   <Text style={styles.priceLabel}>Platform fee</Text>
//                   <Text style={styles.priceValue}>₹0</Text>
//                 </View>

//                 <View style={styles.priceDivider} />

//                 <View style={styles.priceRow}>
//                   <Text style={styles.totalLabel}>Total per seat</Text>
//                   <Text style={styles.totalValue}>₹{ride.price || 0}</Text>
//                 </View>

//                 <View style={styles.noticeBox}>
//                   <Text style={styles.noticeText}>
//                     <Text style={styles.noticeBold}>Cost-share contribution:</Text>{' '}
//                     This is not a commercial fare. You're sharing the travel costs with the driver.
//                   </Text>
//                 </View>
//               </View>

//               <View style={styles.cardSection}>
//                 <Text style={styles.sectionTitle}>Select Seats</Text>
//                 <View style={styles.seatSelectorRow}>
//                   <TouchableOpacity
//                     style={styles.seatActionBtn}
//                     onPress={() => setSeatsRequested(Math.max(1, seatsRequested - 1))}
//                     disabled={seatsRequested === 1 || requestLoading}
//                   >
//                     <Ionicons name="remove" size={20} color={Colors.gray} />
//                   </TouchableOpacity>

//                   <View style={styles.seatCountWrap}>
//                     <Text style={styles.seatCountText}>{seatsRequested}</Text>
//                     <Text style={styles.seatAvailableText}>/ {ride.seatsAvailable} available</Text>
//                   </View>

//                   <TouchableOpacity
//                     style={styles.seatActionBtn}
//                     onPress={() => setSeatsRequested(Math.min(ride.seatsAvailable || 1, seatsRequested + 1))}
//                     disabled={seatsRequested === ride.seatsAvailable || requestLoading}
//                   >
//                     <Ionicons name="add" size={20} color="#2457A6" />
//                   </TouchableOpacity>
//                 </View>
//               </View>

//               <View style={styles.safetyCard}>
//                 <View style={styles.simpleInfoLeft}>
//                   <Ionicons name="shield-checkmark-outline" size={18} color="#2457A6" />
//                   <View>
//                     <Text style={styles.safetyTitle}>Safety First</Text>
//                     <Text style={styles.safetySub}>Live GPS tracking & 24/7 support</Text>
//                   </View>
//                 </View>
//               </View>

//               <View style={{ height: 110 }} />
//             </ScrollView>

//             <View style={styles.bottomBar}>
//               <View>
//                 <Text style={styles.bottomCaption}>Total for {seatsRequested} seat(s)</Text>
//                 <Text style={styles.bottomTotal}>₹{totalPrice}</Text>
//               </View>

//               <TouchableOpacity
//                 style={[styles.bookNowBtn, requestLoading && styles.bookNowBtnDisabled]}
//                 onPress={handleRequestJoin}
//                 disabled={requestLoading}
//               >
//                 <Text style={styles.bookNowText}>Book Now</Text>
//               </TouchableOpacity>
//             </View>
//           </>
//         )}
//       </Animated.View>

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
//     </View>
//   );
// }

// const styles = StyleSheet.create({
//   container: { flex: 1, backgroundColor: '#F4F5F7' },
//   centerContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 24 },
//   errorText: { fontSize: 18, color: Colors.gray, marginBottom: 16, textAlign: 'center' },
//   fallbackBtn: { backgroundColor: Colors.primary, paddingHorizontal: 20, paddingVertical: 12, borderRadius: 12 },
//   fallbackBtnText: { color: 'white', fontWeight: '700' },
//   mapContainer: { width: '100%', overflow: 'hidden', backgroundColor: '#E8EEF7' },
//   map: { flex: 1, backgroundColor: '#E8EEF7' },
//   mapBackButton: { position: 'absolute', top: Platform.OS === 'ios' ? 54 : 22, left: 14, width: 42, height: 42, borderRadius: 25, backgroundColor: 'rgba(255,255,255,0.96)', alignItems: 'center', justifyContent: 'center' },
//   markerWrapper: { alignItems: 'center' },
//   pinBubble: { width: 28, height: 28, borderRadius: 14, borderWidth: 3, borderColor: 'white', alignItems: 'center', justifyContent: 'center', shadowColor: '#000', shadowOffset: { width: 0, height: 3 }, shadowOpacity: 0.25, shadowRadius: 4, elevation: 5 },
//   pinPointer: { width: 0, height: 0, backgroundColor: 'transparent', borderStyle: 'solid', borderLeftWidth: 7, borderRightWidth: 7, borderTopWidth: 10, borderLeftColor: 'transparent', borderRightColor: 'transparent', marginTop: -2 },
//   pinIcon: { fontSize: 11, fontWeight: '800', color: 'white', textAlign: 'center', lineHeight: 18 },
//   pinLabelBubble: { backgroundColor: 'rgba(0,0,0,0.75)', borderRadius: 8, paddingHorizontal: 8, paddingVertical: 3, marginTop: 4 },
//   pinLabelText: { color: 'white', fontSize: 10, fontWeight: '700' },
//   pinLabelBubbleYellow: { backgroundColor: 'rgba(113, 63, 18, 0.9)', borderRadius: 8, paddingHorizontal: 8, paddingVertical: 3, marginTop: 4 },
//   pinLabelTextYellow: { color: '#FACC15', fontSize: 10, fontWeight: '700' },
//   drawer: { position: 'absolute', bottom: 0, left: 0, right: 0, backgroundColor: '#F4F5F7', borderTopLeftRadius: 28, borderTopRightRadius: 28, overflow: 'hidden' },
//   handleWrap: { alignItems: 'center', paddingTop: 10, paddingBottom: 8, backgroundColor: '#F4F5F7' },
//   handleHitArea: { paddingHorizontal: 40, paddingVertical: 10, alignItems: 'center', justifyContent: 'center' },
//   handleBar: { width: 64, height: 6, borderRadius: 99, backgroundColor: '#CDD2D8' },
//   collapsedSummary: { paddingHorizontal: 16, paddingTop: 4, paddingBottom: 12 },
//   collapsedTopRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: 12 },
//   collapsedDriver: { fontSize: 16, fontWeight: '800', color: Colors.dark },
//   collapsedSub: { marginTop: 2, fontSize: 12, color: Colors.gray, fontWeight: '600' },
//   collapsedPriceWrap: { alignItems: 'flex-end' },
//   collapsedPrice: { fontSize: 18, fontWeight: '900', color: Colors.dark },
//   collapsedPerSeat: { fontSize: 10, color: Colors.gray, fontWeight: '600' },
//   drawerScroll: { flex: 1 },
//   drawerContent: { paddingHorizontal: 16, paddingBottom: 16 },
//   driverCard: { backgroundColor: 'white', borderRadius: 20, padding: 16, marginBottom: 14, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 8, elevation: 2 },
//   driverTopRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
//   driverLeftWrap: { flexDirection: 'row', flex: 1, paddingRight: 10 },
//   driverAvatar: { width: 56, height: 56, borderRadius: 28, backgroundColor: '#E5E7EB', overflow: 'hidden', alignItems: 'center', justifyContent: 'center', marginRight: 12 },
//   avatarImg: { width: 56, height: 56, borderRadius: 28 },
//   avatarText: { fontSize: 15, fontWeight: '800', color: Colors.gray },
//   svgAvatarContainer: {
//     width: 56,
//     height: 56,
//     borderRadius: 28,
//     overflow: 'hidden',
//     alignItems: 'center',
//     justifyContent: 'center',
//     backgroundColor: '#E5E7EB',
//   },
//   driverMeta: { flex: 1 },
//   driverNameRow: { flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap', gap: 6 },
//   driverName: { fontSize: 17, fontWeight: '800', color: Colors.dark },
//   verifiedBadge: { flexDirection: 'row', alignItems: 'center', gap: 4 },
//   verifiedBadgeText: { fontSize: 11, color: '#2457A6', fontWeight: '700' },
//   ratingRow: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 6 },
//   ratingText: { fontSize: 13, color: Colors.dark, fontWeight: '700' },
//   chatButtonCircle: { width: 42, height: 42, borderRadius: 21, backgroundColor: '#EAF1FF', alignItems: 'center', justifyContent: 'center' },
//   driverBio: { marginTop: 12, fontSize: 14, lineHeight: 20, color: Colors.gray },
//   profileOutlineBtn: { marginTop: 14, borderWidth: 1, borderColor: '#2457A6', borderRadius: 16, paddingVertical: 12, alignItems: 'center' },
//   profileOutlineBtnText: { color: '#2457A6', fontWeight: '700', fontSize: 14 },
//   cardSection: { backgroundColor: 'white', borderRadius: 20, padding: 16, marginBottom: 14, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 8, elevation: 2 },
//   sectionTitle: { fontSize: 16, fontWeight: '800', color: Colors.dark, marginBottom: 14 },
//   tripTimelineWrap: { flexDirection: 'row' },
//   timelineRail: { width: 18, alignItems: 'center', marginTop: 4 },
//   timelineDot: { width: 10, height: 10, borderRadius: 5 },
//   timelineLine: { width: 2, flex: 1, backgroundColor: '#D8DCE3', marginVertical: 6 },
//   timelineContent: { flex: 1, paddingLeft: 8 },
//   timelineItem: { marginBottom: 14 },
//   timelineLabel: { fontSize: 12, color: Colors.gray, fontWeight: '700' },
//   timelinePlace: { fontSize: 15, color: Colors.dark, fontWeight: '700', marginTop: 4 },
//   timelineMetaRow: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 6 },
//   timelineMetaText: { fontSize: 12, color: Colors.gray, fontWeight: '600' },
//   vehicleHeaderRow: { flexDirection: 'row', alignItems: 'center' },
//   vehicleIconCircle: { width: 42, height: 42, borderRadius: 21, backgroundColor: '#EAF1FF', alignItems: 'center', justifyContent: 'center', marginRight: 12 },
//   vehicleMeta: { flex: 1 },
//   vehicleTitle: { fontSize: 15, fontWeight: '800', color: Colors.dark },
//   vehicleSub: { marginTop: 3, fontSize: 12, color: Colors.gray, fontWeight: '600' },
//   vehicleRegContainer: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     gap: 4,
//     marginTop: 6,
//     paddingTop: 6,
//     borderTopWidth: 1,
//     borderTopColor: '#F0F0F0',
//   },
//   vehicleRegText: {
//     fontSize: 11,
//     color: '#6B7280',
//     fontWeight: '500',
//   },
//   tagRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 14 },
//   preferenceTag: { paddingHorizontal: 12, paddingVertical: 8, borderRadius: 999, backgroundColor: '#FFF3E8' },
//   preferenceTagText: { fontSize: 12, color: '#C65D00', fontWeight: '700' },
//   emptyText: { fontSize: 13, color: Colors.gray, fontWeight: '600' },
//   priceRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
//   priceLabel: { fontSize: 14, color: Colors.gray, fontWeight: '500' },
//   priceValue: { fontSize: 14, color: Colors.dark, fontWeight: '700' },
//   priceDivider: { height: 1, backgroundColor: '#ECEEF2', marginVertical: 8 },
//   totalLabel: { fontSize: 15, color: Colors.dark, fontWeight: '800' },
//   totalValue: { fontSize: 15, color: '#2457A6', fontWeight: '800' },
//   noticeBox: { marginTop: 12, backgroundColor: '#FFF2E9', borderRadius: 14, padding: 12 },
//   noticeText: { fontSize: 12.5, color: Colors.dark, lineHeight: 18 },
//   noticeBold: { fontWeight: '800' },
//   seatSelectorRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: '#FAFAFB', borderRadius: 18, padding: 14 },
//   seatActionBtn: { width: 38, height: 38, borderRadius: 12, borderWidth: 1, borderColor: '#D6DDE7', alignItems: 'center', justifyContent: 'center', backgroundColor: 'white' },
//   seatCountWrap: { flexDirection: 'row', alignItems: 'baseline' },
//   seatCountText: { fontSize: 28, fontWeight: '900', color: Colors.dark },
//   seatAvailableText: { fontSize: 13, color: Colors.gray, marginLeft: 6, fontWeight: '600' },
//   simpleInfoLeft: { flexDirection: 'row', alignItems: 'center', gap: 8 },
//   safetyCard: { backgroundColor: '#FFF3E7', borderRadius: 18, padding: 16, marginBottom: 14 },
//   safetyTitle: { fontSize: 14, color: '#2457A6', fontWeight: '800' },
//   safetySub: { marginTop: 2, fontSize: 12, color: '#2457A6', opacity: 0.9, fontWeight: '600' },
//   bottomBar: { position: 'absolute', left: 0, right: 0, bottom: 0, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 16, paddingTop: 12, paddingBottom: Platform.OS === 'ios' ? 28 : 16, backgroundColor: 'white', borderTopWidth: 1, borderTopColor: '#ECEEF2' },
//   bottomCaption: { fontSize: 12, color: Colors.gray, fontWeight: '500' },
//   bottomTotal: { fontSize: 26, color: Colors.dark, fontWeight: '900', marginTop: 2 },
//   bookNowBtn: { backgroundColor: '#FF7A00', paddingHorizontal: 24, paddingVertical: 14, borderRadius: 22, minWidth: 128, alignItems: 'center', justifyContent: 'center' },
//   bookNowBtnDisabled: { opacity: 0.7 },
//   bookNowText: { color: 'white', fontSize: 16, fontWeight: '800' },
//   loaderContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#fff' },
  
//   // Profile Image Modal Styles
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
// import React, { useMemo, useRef, useState, useEffect, useCallback } from 'react';
// import {
//   View,
//   Text,
//   StyleSheet,
//   TouchableOpacity,
//   ScrollView,
//   Platform,
//   StatusBar,
//   Image,
//   Dimensions,
//   Animated,
//   PanResponder,
//   Modal
// } from 'react-native';
// import MapView, { Marker, Polyline, PROVIDER_GOOGLE } from 'react-native-maps';
// import { Ionicons } from '@expo/vector-icons';
// import LottieView from "lottie-react-native";
// import { SvgCssUri } from 'react-native-svg/css';
// import { Colors } from '../constants/Colors';
// import { useAuth } from '../context/AuthContext';
// import { API_BASE_URL } from '../config/config_ip';
// import CustomAlert from '../components/CustomAlert';
// import { useFocusEffect } from '@react-navigation/native';

// const { height } = Dimensions.get('window');
// const SAFE_TOP = Platform.OS === 'ios' ? 56 : 24;
// const COLLAPSED_HEIGHT = 84;
// const EXPANDED_HEIGHT = height * 0.72;

// // No cache - always fetch fresh data

// function buildImageUrl(url) {
//   if (!url) return null;
//   if (url.startsWith('http://') || url.startsWith('https://')) return url;
//   return `${API_BASE_URL}${url.startsWith('/') ? '' : '/'}${url}`;
// }

// function getDriverInitials(name) {
//   if (!name) return 'D';
//   const parts = name.trim().split(' ').filter(Boolean);
//   if (parts.length > 1) return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
//   return parts[0].slice(0, 2).toUpperCase();
// }

// function parseSuggestedPoint(point) {
//   if (!point) return null;

//   if (Array.isArray(point) && point.length === 2) {
//     return {
//       longitude: Number(point[0]),
//       latitude: Number(point[1]),
//     };
//   }

//   if (point.lng != null && point.lat != null) {
//     return {
//       longitude: Number(point.lng),
//       latitude: Number(point.lat),
//     };
//   }

//   if (point.longitude != null && point.latitude != null) {
//     return {
//       longitude: Number(point.longitude),
//       latitude: Number(point.latitude),
//     };
//   }

//   return null;
// }

// function parseRouteCoordinates(routeCoordinates) {
//   if (!Array.isArray(routeCoordinates)) return [];

//   return routeCoordinates
//     .map((item) => {
//       if (Array.isArray(item) && item.length === 2) {
//         return {
//           longitude: Number(item[0]),
//           latitude: Number(item[1]),
//         };
//       }
//       return parseSuggestedPoint(item);
//     })
//     .filter(Boolean);
// }

// // Fetch user documents to check verification status
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

// // Fetch driver profile for bio and other details
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

// // Generic function to extract all ride preferences dynamically
// function extractAllPreferences(ride, driverTravelPrefs) {
//   // First try ride preferences
//   let ridePrefs = ride?.preferences;
  
//   // Handle if preferences is a string (JSON)
//   if (ridePrefs && typeof ridePrefs === 'string') {
//     try {
//       ridePrefs = JSON.parse(ridePrefs);
//       console.log('Parsed ride preferences from string:', ridePrefs);
//     } catch (e) {
//       console.log('Failed to parse preferences string:', e);
//       ridePrefs = null;
//     }
//   }
  
//   // Check if we have valid ride preferences
//   if (ridePrefs && typeof ridePrefs === 'object' && Object.keys(ridePrefs).length > 0) {
//     console.log('✅ Using ride preferences:', ridePrefs);
//     return extractFromObject(ridePrefs);
//   }
  
//   // Fallback to driver's travel preferences
//   if (driverTravelPrefs && typeof driverTravelPrefs === 'object' && Object.keys(driverTravelPrefs).length > 0) {
//     console.log('✅ Using driver travel preferences as fallback:', driverTravelPrefs);
//     return extractFromObject(driverTravelPrefs);
//   }
  
//   // If no preferences at all, return empty array (don't show anything)
//   console.log('⚠️ No preferences found');
//   return [];
// }

// function extractFromObject(prefs) {
//   const allPreferences = [];

//   Object.entries(prefs).forEach(([key, value]) => {
//     // Skip if value is null, undefined, or empty
//     if (value === null || value === undefined) return;
    
//     // Format the key for display
//     const formattedKey = key.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
    
//     // Handle different value types
//     if (typeof value === 'boolean') {
//       // Only show boolean preferences if they are true
//       if (value === true) {
//         allPreferences.push(formattedKey);
//       }
//     } 
//     else if (Array.isArray(value)) {
//       // Handle arrays (like speak_languages: ["English"])
//       if (value.length > 0) {
//         allPreferences.push(`${formattedKey}: ${value.join(', ')}`);
//       }
//     }
//     else if (typeof value === 'object') {
//       // Handle nested objects if any
//       const nestedPrefs = extractFromObject(value);
//       allPreferences.push(...nestedPrefs);
//     }
//     else if (typeof value === 'string' && value.trim()) {
//       // Handle string values (like "Chatty", "26–35", "No Preference")
//       // Don't show if it's a false-y string
//       const lowerValue = value.toLowerCase();
//       if (!['false', 'no', 'none', 'null', 'undefined'].includes(lowerValue)) {
//         allPreferences.push(`${formattedKey}: ${value}`);
//       }
//     }
//     else if (typeof value === 'number') {
//       // Handle numbers
//       allPreferences.push(`${formattedKey}: ${value}`);
//     }
//   });

//   // Remove duplicates
//   return [...new Set(allPreferences)];
// }

// // Generic Preference Tag Component
// function GenericPreferenceTag({ label }) {
//   if (!label || label.trim() === '') return null;
  
//   // Determine if it's a key: value pair or just a key
//   const isKeyValue = label.includes(':');
//   let displayText = label;
//   let tagColor = '#FFF3E8';
//   let textColor = '#C65D00';
  
//   // Color coding based on preference type
//   const lowerLabel = label.toLowerCase();
  
//   if (lowerLabel.includes('age') || lowerLabel.includes('category')) {
//     tagColor = '#E8F5E9';
//     textColor = '#2E7D32';
//   } else if (lowerLabel.includes('chat') || lowerLabel.includes('talk')) {
//     tagColor = '#E3F2FD';
//     textColor = '#1565C0';
//   } else if (lowerLabel.includes('gender')) {
//     tagColor = '#F3E5F5';
//     textColor = '#6A1B9A';
//   } else if (lowerLabel.includes('language') || lowerLabel.includes('speak')) {
//     tagColor = '#FFF9C4';
//     textColor = '#F57F17';
//   } else if (lowerLabel.includes('verified')) {
//     tagColor = '#E8F5E9';
//     textColor = '#2E7D32';
//   } else if (lowerLabel.includes('music')) {
//     tagColor = '#E8F5E9';
//     textColor = '#2E7D32';
//   } else if (lowerLabel.includes('ac')) {
//     tagColor = '#E3F2FD';
//     textColor = '#1565C0';
//   } else if (lowerLabel.includes('pet')) {
//     tagColor = '#FCE4EC';
//     textColor = '#C2185B';
//   } else if (lowerLabel.includes('smoking')) {
//     tagColor = '#FFEBEE';
//     textColor = '#C62828';
//   }
  
//   return (
//     <View style={[styles.preferenceTag, { backgroundColor: tagColor }]}>
//       <Text style={[styles.preferenceTagText, { color: textColor }]}>{displayText}</Text>
//     </View>
//   );
// }

// // Profile Image Modal Component with SVG support
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

// export default function RideDetailScreen({ navigation, route }) {
//   const { user, isAuthenticated } = useAuth();
//   const { ride, searchData } = route.params || {};

//   const [seatsRequested, setSeatsRequested] = useState(1);
//   const [requestLoading, setRequestLoading] = useState(false);
//   const [drawerExpanded, setDrawerExpanded] = useState(true);
//   const [driverProfile, setDriverProfile] = useState(null);
//   const [isVerified, setIsVerified] = useState(false);
//   const [loadingProfile, setLoadingProfile] = useState(false);
//   const [mapReady, setMapReady] = useState(false);
//   const animatedDrawer = useRef(new Animated.Value(1)).current;
//   const mapRef = useRef(null);
  
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

//   const showConfirmationAlert = (title, message, onConfirm) => {
//     setAlertConfig({
//       title,
//       message,
//       icon: "warning",
//       iconColor: "#F59E0B",
//       buttons: [
//         { text: 'Cancel', onPress: () => setAlertVisible(false), style: 'cancel' },
//         { text: 'Login', onPress: () => {
//           setAlertVisible(false);
//           onConfirm();
//         }, style: 'destructive' }
//       ]
//     });
//     setAlertVisible(true);
//   };

//   // Fetch driver profile and verification status - ALWAYS FRESH (no caching)
//   const loadDriverData = useCallback(async () => {
//     const driverPhone = ride?.phoneNumber;
//     const driverUserId = ride?.driverUserId;
    
//     if (driverPhone || driverUserId) {
//       setLoadingProfile(true);
      
//       try {
//         const profileData = await fetchDriverProfile(driverPhone, driverUserId);
//         if (profileData?.success && profileData.user) {
//           setDriverProfile(profileData.user);
//         } else {
//           setDriverProfile(null);
//         }
        
//         let verified = false;
//         if (driverPhone) {
//           const docsData = await fetchUserDocuments(driverPhone);
//           if (docsData?.success && docsData.documents) {
//             const verifiedDocs = docsData.documents.filter(doc => {
//               const status = doc.status?.toUpperCase();
//               return status === 'APPROVED' && ['aadhar', 'dl', 'rc'].includes(doc.document_type?.toLowerCase());
//             });
//             verified = verifiedDocs.length > 0;
//             setIsVerified(verified);
//           }
//         }
//       } catch (error) {
//         console.log('Error loading driver data:', error);
//       } finally {
//         setLoadingProfile(false);
//       }
//     }
//   }, [ride?.phoneNumber, ride?.driverUserId]);

//   // Refresh data whenever screen comes into focus
//   useFocusEffect(
//     useCallback(() => {
//       console.log('RideDetailScreen focused - refreshing driver data');
//       loadDriverData();
//     }, [loadDriverData])
//   );

//   useEffect(() => {
//     if (!isAuthenticated) {
//       showConfirmationAlert(
//         'Login Required',
//         'Please login to book rides or chat with drivers.',
//         () => navigation.navigate('Login')
//       );
//       navigation.goBack();
//     }
//   }, [isAuthenticated, navigation]);

//   // Get profile photo URL - always fresh
//   const getProfilePhotoUrl = useCallback(() => {
//     const rawUrl = driverProfile?.profile_picture || ride?.profilePicture;
    
//     if (!rawUrl) return null;
    
//     const fullUrl = buildImageUrl(rawUrl);
//     return fullUrl;
//   }, [driverProfile, ride]);
  
//   const profilePhotoUrl = getProfilePhotoUrl();
//   const avatarText = getDriverInitials(driverProfile?.full_name || ride?.driverName || 'Driver');
//   const isProfilePhotoSvg = profilePhotoUrl ? profilePhotoUrl.toLowerCase().includes('.svg') : false;
  
//   // Extract preferences from ride or driver profile
//   const allPreferences = useMemo(() => {
//     return extractAllPreferences(ride, driverProfile?.travel_preferences);
//   }, [ride, driverProfile]);

//   // Driver route points
//   const driverStart = useMemo(() => {
//     const coords = ride?.routeCoordinates;
//     if (Array.isArray(coords) && coords.length > 0) {
//       const first = coords[0];
//       if (Array.isArray(first) && first.length === 2) {
//         return { latitude: first[1], longitude: first[0] };
//       }
//     }
//     return parseSuggestedPoint(ride?.suggestedPickup);
//   }, [ride]);

//   const driverEnd = useMemo(() => {
//     const coords = ride?.routeCoordinates;
//     if (Array.isArray(coords) && coords.length > 0) {
//       const last = coords[coords.length - 1];
//       if (Array.isArray(last) && last.length === 2) {
//         return { latitude: last[1], longitude: last[0] };
//       }
//     }
//     return parseSuggestedPoint(ride?.suggestedDrop);
//   }, [ride]);

//   const intersectionPickup = useMemo(
//     () => parseSuggestedPoint(ride?.suggestedPickup),
//     [ride]
//   );
//   const intersectionDrop = useMemo(
//     () => parseSuggestedPoint(ride?.suggestedDrop),
//     [ride]
//   );

//   const userPickup = useMemo(() => {
//     if (!searchData?.fromCoords) return null;
//     const c = searchData.fromCoords;
//     if (Array.isArray(c) && c.length === 2) {
//       return { latitude: c[1], longitude: c[0] };
//     }
//     return null;
//   }, [searchData]);

//   const userDrop = useMemo(() => {
//     if (!searchData?.toCoords) return null;
//     const c = searchData.toCoords;
//     if (Array.isArray(c) && c.length === 2) {
//       return { latitude: c[1], longitude: c[0] };
//     }
//     return null;
//   }, [searchData]);

//   const routePath = useMemo(() => {
//     const fullRoute = parseRouteCoordinates(ride?.routeCoordinates);
//     if (fullRoute.length >= 2) return fullRoute;
//     if (intersectionPickup && intersectionDrop) return [intersectionPickup, intersectionDrop];
//     return [];
//   }, [ride, intersectionPickup, intersectionDrop]);

//   const walkToPickupPath = useMemo(() => {
//     if (userPickup && intersectionPickup) return [userPickup, intersectionPickup];
//     return [];
//   }, [userPickup, intersectionPickup]);

//   const walkFromDropPath = useMemo(() => {
//     if (userDrop && intersectionDrop) return [intersectionDrop, userDrop];
//     return [];
//   }, [userDrop, intersectionDrop]);

//   const allMarkerCoords = useMemo(() => {
//     const coords = [];
//     if (driverStart) coords.push(driverStart);
//     if (driverEnd) coords.push(driverEnd);
//     if (userPickup) coords.push(userPickup);
//     if (userDrop) coords.push(userDrop);
//     if (intersectionPickup) coords.push(intersectionPickup);
//     if (intersectionDrop) coords.push(intersectionDrop);
//     return coords;
//   }, [driverStart, driverEnd, userPickup, userDrop, intersectionPickup, intersectionDrop]);

//   // Fit map to show all markers when map is ready
//   const fitMapToMarkers = useCallback(() => {
//     if (mapRef.current && mapReady && allMarkerCoords.length >= 2) {
//       setTimeout(() => {
//         try {
//           mapRef.current.fitToCoordinates(allMarkerCoords, {
//             edgePadding: { top: 80, right: 50, bottom: 50, left: 50 },
//             animated: true,
//           });
//         } catch (e) {
//           console.log('fitToCoordinates error:', e);
//         }
//       }, 500);
//     }
//   }, [mapReady, allMarkerCoords]);

//   useEffect(() => {
//     if (mapReady && allMarkerCoords.length >= 2) {
//       fitMapToMarkers();
//     }
//   }, [mapReady, allMarkerCoords, fitMapToMarkers]);

//   const vehicleName = driverProfile?.vehicle 
//     ? [driverProfile.vehicle.model].filter(Boolean).join(' ')
//     : [ride?.vehicle?.model].filter(Boolean).join(' ') || 'Vehicle details unavailable';
  
//   const vehicleRegNumber = driverProfile?.vehicle?.registration_number || 
//                            ride?.vehicle?.registration_number || 
//                            null;
  
//   const vehicleColor = driverProfile?.vehicle?.color || 
//                        ride?.vehicle?.color || 
//                        'Not specified';

//   const totalPrice = Number(ride?.price || 0) * seatsRequested;

//   const handleProfileImagePress = () => {
//     if (profilePhotoUrl) {
//       setSelectedProfile({
//         visible: true,
//         imageUrl: profilePhotoUrl,
//         driverName: driverProfile?.full_name || ride?.driverName || 'Driver',
//       });
//     } else {
//       showCustomAlert('No Photo', 'Driver has not uploaded a profile picture', 'warning');
//     }
//   };

//   const mapHeight = animatedDrawer.interpolate({
//     inputRange: [0, 1],
//     outputRange: [height - SAFE_TOP - COLLAPSED_HEIGHT, height * 0.32],
//   });

//   const drawerHeight = animatedDrawer.interpolate({
//     inputRange: [0, 1],
//     outputRange: [COLLAPSED_HEIGHT, EXPANDED_HEIGHT],
//   });

//   const toggleDrawer = () => {
//     const nextExpanded = !drawerExpanded;
//     setDrawerExpanded(nextExpanded);

//     Animated.timing(animatedDrawer, {
//       toValue: nextExpanded ? 1 : 0,
//       duration: 260,
//       useNativeDriver: false,
//     }).start();
//   };

//   const panResponder = useRef(
//     PanResponder.create({
//       onMoveShouldSetPanResponder: (_, gestureState) =>
//         Math.abs(gestureState.dy) > 5,
//       onPanResponderMove: (_, gestureState) => {
//         const dragRange = EXPANDED_HEIGHT - COLLAPSED_HEIGHT;
//         const progress = drawerExpanded
//           ? 1 - (gestureState.dy / dragRange)
//           : gestureState.dy / dragRange;
//         const clamped = Math.max(0, Math.min(1, progress));
//         animatedDrawer.setValue(clamped);
//       },
//       onPanResponderRelease: (_, gestureState) => {
//         const dragRange = EXPANDED_HEIGHT - COLLAPSED_HEIGHT;
//         const threshold = dragRange * 0.2;
//         if (drawerExpanded) {
//           if (gestureState.dy > threshold) {
//             setDrawerExpanded(false);
//             Animated.timing(animatedDrawer, {
//               toValue: 0,
//               duration: 200,
//               useNativeDriver: false,
//             }).start();
//           } else {
//             setDrawerExpanded(true);
//             Animated.timing(animatedDrawer, {
//               toValue: 1,
//               duration: 200,
//               useNativeDriver: false,
//             }).start();
//           }
//         } else {
//           if (gestureState.dy < -threshold) {
//             setDrawerExpanded(true);
//             Animated.timing(animatedDrawer, {
//               toValue: 1,
//               duration: 200,
//               useNativeDriver: false,
//             }).start();
//           } else {
//             setDrawerExpanded(false);
//             Animated.timing(animatedDrawer, {
//               toValue: 0,
//               duration: 200,
//               useNativeDriver: false,
//             }).start();
//           }
//         }
//       },
//     })
//   ).current;
//   // Add this function inside the RideDetailScreen component, before handleRequestJoin
// const checkPassengerOverlap = async (departureTime, durationMinutes = 60) => {
//   try {
//     if (!user?.phone_number) return false;
    
//     const url = `${API_BASE_URL}/check-passenger-overlap?phone_number=${encodeURIComponent(user.phone_number)}&departure_time=${departureTime.toISOString()}&duration_minutes=${durationMinutes}`;
//     console.log('🔍 Checking overlap:', url);
    
//     const response = await fetch(url);
//     const data = await response.json();
    
//     if (data.has_overlap) {
//       const overlap = data.overlapping_booking;
//       showCustomAlert(
//         'Overlapping Ride',
//         `You already have a confirmed booking for a ride from ${overlap.origin} to ${overlap.destination} at ${new Date(overlap.departure_time).toLocaleTimeString()}. Please complete that ride before booking another.`,
//         'warning'
//       );
//       return true;
//     }
//     return false;
//   } catch (error) {
//     console.log('Error checking passenger overlap:', error);
//     return false;
//   }
// };

// // Replace the existing handleRequestJoin with this updated version
// const handleRequestJoin = async () => {
//   if (!user?.phone_number) {
//     showCustomAlert('Login Required', 'Please log in to request a ride.', 'warning');
//     return;
//   }

//   // ✅ Check if ride is women-only and user is not female
//   if (ride?.womenOnly === true && user?.gender !== 'female') {
//     showCustomAlert(
//       'Not Available', 
//       'This ride is for women passengers only. Please search for other rides.',
//       'warning'
//     );
//     return;
//   }

//   // ✅ Check if requested seats exceed available seats
//   const availableSeats = ride?.seatsAvailable || 0;
//   if (seatsRequested > availableSeats) {
//     showCustomAlert(
//       'Not Enough Seats',
//       `Only ${availableSeats} seat${availableSeats !== 1 ? 's' : ''} left in this ride. Please reduce your seat request.`,
//       'warning'
//     );
//     return;
//   }

//   // ✅ Check for overlapping bookings
//   // Parse the ride date and time
//   let rideDateTime;
//   if (ride?.date && ride?.time) {
//     rideDateTime = new Date(`${ride.date} ${ride.time}`);
//   } else if (ride?.departure_time) {
//     rideDateTime = new Date(ride.departure_time);
//   } else {
//     rideDateTime = new Date();
//   }
  
//   // Extract duration minutes from durationText
//   let durationMinutes = 60; // default
//   if (ride?.durationMinutes) {
//     durationMinutes = ride.durationMinutes;
//   } else if (ride?.durationText) {
//     const match = ride.durationText.match(/\d+/);
//     if (match) durationMinutes = parseInt(match[0]);
//   }
  
//   const hasOverlap = await checkPassengerOverlap(rideDateTime, durationMinutes);
//   if (hasOverlap) {
//     return;
//   }

//   setRequestLoading(true);
//   try {
//     const payload = {
//       ride_id: ride.id,
//       passenger_phone: user.phone_number,
//       seats_requested: seatsRequested,
//     };

//     if (searchData?.fromCoords && Array.isArray(searchData.fromCoords)) {
//       payload.from_coords = searchData.fromCoords;
//     }
//     if (searchData?.toCoords && Array.isArray(searchData.toCoords)) {
//       payload.to_coords = searchData.toCoords;
//     }

//     const url = `${API_BASE_URL}/ride-bookings`;
//     console.log('📡 Booking URL:', url);
//     console.log('📦 Booking payload:', payload);

//     const response = await fetch(url, {
//       method: 'POST',
//       headers: { 
//         'Content-Type': 'application/json',
//         'Accept': 'application/json'
//       },
//       body: JSON.stringify(payload),
//     });

//     const raw = await response.text();
//     console.log('📥 Booking response:', raw);
    
//     let data = {};
//     try {
//       data = raw ? JSON.parse(raw) : {};
//     } catch {
//       data.detail = raw;
//     }

//     if (!response.ok) {
//       throw new Error(data.detail || data.message || `Server error (${response.status})`);
//     }

//     showCustomAlert('Success', data.message || 'Ride request sent successfully', 'success');
//     setTimeout(() => navigation.goBack(), 1500);
//   } catch (error) {
//     console.error('Booking error:', error);
//     showCustomAlert('Error', error.message || 'Failed to send request', 'error');
//   } finally {
//     setRequestLoading(false);
//   }
// };
// // const handleRequestJoin = async () => {
// //   if (!user?.phone_number) {
// //     showCustomAlert('Login Required', 'Please log in to request a ride.', 'warning');
// //     return;
// //   }

// //   // ✅ Check if ride is women-only and user is not female
// //   if (ride?.womenOnly === true && user?.gender !== 'female') {
// //     showCustomAlert(
// //       'Not Available', 
// //       'This ride is for women passengers only. Please search for other rides.',
// //       'warning'
// //     );
// //     return;
// //   }

// //   setRequestLoading(true);
// //   try {
// //     const payload = {
// //       ride_id: ride.id,
// //       passenger_phone: user.phone_number,
// //       seats_requested: seatsRequested,
// //     };

// //     if (searchData?.fromCoords && Array.isArray(searchData.fromCoords)) {
// //       payload.from_coords = searchData.fromCoords;
// //     }
// //     if (searchData?.toCoords && Array.isArray(searchData.toCoords)) {
// //       payload.to_coords = searchData.toCoords;
// //     }

// //     const url = `${API_BASE_URL}/ride-bookings`;
// //     console.log('📡 Booking URL:', url);
// //     console.log('📦 Booking payload:', payload);

// //     const response = await fetch(url, {
// //       method: 'POST',
// //       headers: { 
// //         'Content-Type': 'application/json',
// //         'Accept': 'application/json'
// //       },
// //       body: JSON.stringify(payload),
// //     });

// //     const raw = await response.text();
// //     console.log('📥 Booking response:', raw);
    
// //     let data = {};
// //     try {
// //       data = raw ? JSON.parse(raw) : {};
// //     } catch {
// //       data.detail = raw;
// //     }

// //     if (!response.ok) {
// //       throw new Error(data.detail || data.message || `Server error (${response.status})`);
// //     }

// //     showCustomAlert('Success', data.message || 'Ride request sent successfully', 'success');
// //     setTimeout(() => navigation.goBack(), 1500);
// //   } catch (error) {
// //     console.error('Booking error:', error);
// //     showCustomAlert('Error', error.message || 'Failed to send request', 'error');
// //   } finally {
// //     setRequestLoading(false);
// //   }
// // };
// //   const handleRequestJoin = async () => {
// //   if (!user?.phone_number) {
// //     showCustomAlert('Login Required', 'Please log in to request a ride.', 'warning');
// //     return;
// //   }

// //   setRequestLoading(true);
// //   try {
// //     const payload = {
// //       ride_id: ride.id,
// //       passenger_phone: user.phone_number,
// //       seats_requested: seatsRequested,
// //     };

// //     if (searchData?.fromCoords && Array.isArray(searchData.fromCoords)) {
// //       payload.from_coords = searchData.fromCoords;
// //     }
// //     if (searchData?.toCoords && Array.isArray(searchData.toCoords)) {
// //       payload.to_coords = searchData.toCoords;
// //     }

// //     // ✅ FIX: Use template literal without double slash
// //     const url = `${API_BASE_URL}/ride-bookings`;
// //     console.log('📡 Booking URL:', url);
// //     console.log('📦 Booking payload:', payload);

// //     const response = await fetch(url, {
// //       method: 'POST',
// //       headers: { 
// //         'Content-Type': 'application/json',
// //         'Accept': 'application/json'
// //       },
// //       body: JSON.stringify(payload),
// //     });

// //     const raw = await response.text();
// //     console.log('📥 Booking response:', raw);
    
// //     let data = {};
// //     try {
// //       data = raw ? JSON.parse(raw) : {};
// //     } catch {
// //       data.detail = raw;
// //     }

// //     if (!response.ok) {
// //       throw new Error(data.detail || data.message || `Server error (${response.status})`);
// //     }

// //     showCustomAlert('Success', data.message || 'Ride request sent successfully', 'success');
// //     setTimeout(() => navigation.goBack(), 1500);
// //   } catch (error) {
// //     console.error('Booking error:', error);
// //     showCustomAlert('Error', error.message || 'Failed to send request', 'error');
// //   } finally {
// //     setRequestLoading(false);
// //   }
// // };
//   const viewDriverProfile = () => {
//     const driverPhone = ride?.phoneNumber;
//     const driverUserId = ride?.driverUserId;
    
//     if (driverPhone || driverUserId) {
//       navigation.navigate('ViewProfileScreen', {
//         userId: driverUserId || null,
//         phoneNumber: driverPhone || null,
//         driverName: driverProfile?.full_name || ride?.driverName || 'Driver',
//         profilePicture: profilePhotoUrl,
//         vehicleNumber: vehicleRegNumber,
//         vehicleModel: vehicleName,
//         driverRating: driverProfile?.avg_rating || ride?.rating || 0,
//       });
//     } else {
//       showCustomAlert('Profile', 'Driver profile not available', 'warning');
//     }
//   };

//   const getOrCreateConversation = async (receiverPhone, rideId) => {
//     try {
//       const myPhone = user?.phone_number;
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
//         body: JSON.stringify({ participant_phone: receiverPhone, ride_id: rideId }),
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

//   const startChat = async () => {
//     const driverPhone = ride?.phoneNumber;
//     if (driverPhone) {
//       const conversationId = await getOrCreateConversation(driverPhone, ride.id);
//       if (conversationId) {
//         navigation.navigate('ChatScreen', {
//           receiverPhone: driverPhone,
//           conversationId,
//           user: {
//             name: driverProfile?.full_name || ride?.driverName || 'Driver',
//             tripInfo: `${ride.from || 'Pickup'} → ${ride.to || 'Drop'}`,
//           },
//         });
//       } else {
//         showCustomAlert('Chat', 'Unable to start chat. Please try again.', 'error');
//       }
//     } else {
//       showCustomAlert('Chat', 'Driver contact not available', 'warning');
//     }
//   };

//   // Loading state
//   if (requestLoading || loadingProfile) {
//     return (
//       <View style={styles.loaderContainer}>
//         <LottieView
//           source={require("../assets/loading.json")}
//           autoPlay
//           loop
//           style={{ width: 300, height: 300 }}
//         />
//       </View>
//     );
//   }

//   if (!ride) {
//     return (
//       <View style={styles.centerContainer}>
//         <Text style={styles.errorText}>No ride data available</Text>
//         <TouchableOpacity
//           onPress={() => navigation.goBack()}
//           style={styles.fallbackBtn}
//         >
//           <Text style={styles.fallbackBtnText}>Go Back</Text>
//         </TouchableOpacity>
//       </View>
//     );
//   }

//   const initialRegion = {
//     latitude: intersectionPickup?.latitude || driverStart?.latitude || 28.6139,
//     longitude: intersectionPickup?.longitude || driverStart?.longitude || 77.2090,
//     latitudeDelta: 0.05,
//     longitudeDelta: 0.05,
//   };

//   return (
//     <View style={styles.container}>
//       <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />

//       <Animated.View style={[styles.mapContainer, { height: mapHeight }]}>
//         <MapView
//           ref={mapRef}
//           provider={PROVIDER_GOOGLE}
//           style={styles.map}
//           initialRegion={initialRegion}
//           onMapReady={() => {
//             console.log('Map ready');
//             setMapReady(true);
//           }}
//           showsUserLocation={false}
//           showsMyLocationButton={false}
//           zoomEnabled={true}
//           zoomControlEnabled={true}
//         >
//           {routePath.length >= 2 && (
//             <Polyline
//               coordinates={routePath}
//               strokeColor="#2457A6"
//               strokeWidth={5}
//               lineCap="round"
//               lineJoin="round"
//             />
//           )}

//           {driverStart && (
//             <Marker  coordinate={driverStart} anchor={{ x: 0.5, y: 1 }}>
//               <View style={styles.markerWrapper}>
//                 <View style={[styles.pinBubble, { backgroundColor: '#16A34A' }]}>
//                   <Text style={styles.pinIcon}>S</Text>
//                 </View>
//                 <View style={[styles.pinPointer, { borderTopColor: '#16A34A' }]} />
//               </View>
//             </Marker>
//           )}

//           {driverEnd && (
//             <Marker coordinate={driverEnd} anchor={{ x: 0.5, y: 1 }}>
//               <View style={styles.markerWrapper}>
//                 <View style={[styles.pinBubble, { backgroundColor: '#DC2626' }]}>
//                   <Text style={styles.pinIcon}>E</Text>
//                 </View>
//                 <View style={[styles.pinPointer, { borderTopColor: '#DC2626' }]} />
//               </View>
//             </Marker>
//           )}

//           {userPickup && (
//             <Marker coordinate={userPickup} anchor={{ x: 0.5, y: 1 }}>
//               <View style={styles.markerWrapper}>
//                 <View style={[styles.pinBubble, { backgroundColor: '#3B82F6' }]}>
//                   <Ionicons name="person" size={12} color="white" />
//                 </View>
//                 <View style={[styles.pinPointer, { borderTopColor: '#3B82F6' }]} />
//                 <View style={styles.pinLabelBubble}>
//                   <Text style={styles.pinLabelText}>Your Pickup</Text>
//                 </View>
//               </View>
//             </Marker>
//           )}

//           {userDrop && (
//             <Marker coordinate={userDrop} anchor={{ x: 0.5, y: 1 }}>
//               <View style={styles.markerWrapper}>
//                 <View style={[styles.pinBubble, { backgroundColor: '#F97316' }]}>
//                   <Ionicons name="flag" size={12} color="white" />
//                 </View>
//                 <View style={[styles.pinPointer, { borderTopColor: '#F97316' }]} />
//                 <View style={styles.pinLabelBubble}>
//                   <Text style={styles.pinLabelText}>Your Drop</Text>
//                 </View>
//               </View>
//             </Marker>
//           )}

//           {intersectionPickup && (
//             <Marker coordinate={intersectionPickup} anchor={{ x: 0.5, y: 1 }}>
//               <View style={styles.markerWrapper}>
//                 <View style={[styles.pinBubble, { backgroundColor: '#FACC15' }]}>
//                   <Ionicons name="hand-right" size={12} color="#713F12" />
//                 </View>
//                 <View style={[styles.pinPointer, { borderTopColor: '#FACC15' }]} />
//                 <View style={styles.pinLabelBubbleYellow}>
//                   <Text style={styles.pinLabelTextYellow}>Meet Driver</Text>
//                 </View>
//               </View>
//             </Marker>
//           )}

//           {intersectionDrop && (
//             <Marker coordinate={intersectionDrop} anchor={{ x: 0.5, y: 1 }}>
//               <View style={styles.markerWrapper}>
//                 <View style={[styles.pinBubble, { backgroundColor: '#FACC15' }]}>
//                   <Ionicons name="exit" size={12} color="#713F12" />
//                 </View>
//                 <View style={[styles.pinPointer, { borderTopColor: '#FACC15' }]} />
//                 <View style={styles.pinLabelBubbleYellow}>
//                   <Text style={styles.pinLabelTextYellow}>Exit Here</Text>
//                 </View>
//               </View>
//             </Marker>
//           )}

//           {walkToPickupPath.length >= 2 && (
//             <Polyline
//               coordinates={walkToPickupPath}
//               strokeColor="#FACC15"
//               strokeWidth={4}
//               lineDashPattern={[8, 6]}
//               lineCap="round"
//               lineJoin="round"
//             />
//           )}

//           {walkFromDropPath.length >= 2 && (
//             <Polyline
//               coordinates={walkFromDropPath}
//               strokeColor="#FACC15"
//               strokeWidth={4}
//               lineDashPattern={[8, 6]}
//               lineCap="round"
//               lineJoin="round"
//             />
//           )}
//         </MapView>

//         <TouchableOpacity
//           style={styles.mapBackButton}
//           onPress={() => navigation.goBack()}
//         >
//           <Ionicons name="chevron-back" size={26} color={Colors.secondary} />
//         </TouchableOpacity>
//       </Animated.View>

//       <Animated.View style={[styles.drawer, { height: drawerHeight }]}>
//         <View style={styles.handleWrap} {...panResponder.panHandlers}>
//           <TouchableOpacity
//             activeOpacity={0.9}
//             onPress={toggleDrawer}
//             style={styles.handleHitArea}
//           >
//             <View style={styles.handleBar} />
//           </TouchableOpacity>
//         </View>

//         {!drawerExpanded ? (
//           <View style={styles.collapsedSummary}>
//             <View style={styles.collapsedTopRow}>
//               <View style={{ flex: 1 }}>
//                 <Text style={styles.collapsedDriver} numberOfLines={1}>
//                   {driverProfile?.full_name || ride?.driverName || 'Driver'}
//                 </Text>
//                 <Text style={styles.collapsedSub} numberOfLines={1}>
//                   {ride.from || 'Pickup'} → {ride.to || 'Drop'}
//                 </Text>
//               </View>

//               <View style={styles.collapsedPriceWrap}>
//                 <Text style={styles.collapsedPrice}>₹{ride.price}</Text>
//                 <Text style={styles.collapsedPerSeat}>per seat</Text>
//               </View>
//             </View>
//           </View>
//         ) : (
//           <>
//             <ScrollView
//               style={styles.drawerScroll}
//               contentContainerStyle={styles.drawerContent}
//               showsVerticalScrollIndicator={false}
//             >
//               <View style={styles.driverCard}>
//                 <View style={styles.driverTopRow}>
//                   <View style={styles.driverLeftWrap}>
//                     <TouchableOpacity 
//                       style={styles.driverAvatar} 
//                       onPress={handleProfileImagePress}
//                       activeOpacity={0.8}
//                     >
//                       {profilePhotoUrl ? (
//                         isProfilePhotoSvg ? (
//                           <View style={styles.svgAvatarContainer}>
//                             <SvgCssUri
//                               uri={profilePhotoUrl}
//                               width={56}
//                               height={56}
//                               onError={(e) => console.log('SVG avatar error:', e)}
//                               onLoad={() => console.log('SVG loaded successfully:', profilePhotoUrl)}
//                             />
//                           </View>
//                         ) : (
//                           <Image 
//                             source={{ uri: profilePhotoUrl }} 
//                             style={styles.avatarImg}
//                             onError={(e) => console.log('Image load error:', e.nativeEvent.error)}
//                             onLoad={() => console.log('Image loaded successfully:', profilePhotoUrl)}
//                           />
//                         )
//                       ) : (
//                         <Text style={styles.avatarText}>{avatarText}</Text>
//                       )}
//                     </TouchableOpacity>

//                     <View style={styles.driverMeta}>
//                       <View style={styles.driverNameRow}>
//                         <Text style={styles.driverName}>
//                           {driverProfile?.full_name || ride?.driverName || 'Driver'}
//                         </Text>
//                         {isVerified && (
//                           <View style={styles.verifiedBadge}>
//                             <Ionicons name="checkmark-circle" size={12} color="#2457A6" />
//                             <Text style={styles.verifiedBadgeText}>Verified</Text>
//                           </View>
//                         )}
//                       </View>

//                       <View style={styles.ratingRow}>
//                         <Ionicons name="star" size={13} color="#F59E0B" />
//                         <Text style={styles.ratingText}>
//                           {driverProfile?.avg_rating || ride?.rating || 4.5}
//                         </Text>
//                       </View>
//                     </View>
//                   </View>

//                   <TouchableOpacity style={styles.chatButtonCircle} onPress={startChat}>
//                     <Ionicons name="chatbubble-outline" size={20} color="#2457A6" />
//                   </TouchableOpacity>
//                 </View>

//                 <Text style={styles.driverBio}>
//                   {driverProfile?.bio || driverProfile?.about || 'Friendly driver, love meeting new people!'}
//                 </Text>

//                 <TouchableOpacity style={styles.profileOutlineBtn} onPress={viewDriverProfile}>
//                   <Text style={styles.profileOutlineBtnText}>View Full Profile</Text>
//                 </TouchableOpacity>
//               </View>

//               <View style={styles.cardSection}>
//                 <Text style={styles.sectionTitle}>Trip Details</Text>

//                 <View style={styles.tripTimelineWrap}>
//                   <View style={styles.timelineRail}>
//                     <View style={[styles.timelineDot, { backgroundColor: '#2457A6' }]} />
//                     <View style={styles.timelineLine} />
//                     <View style={[styles.timelineDot, { backgroundColor: '#FF7A00' }]} />
//                   </View>

//                   <View style={styles.timelineContent}>
//                     <View style={styles.timelineItem}>
//                       <Text style={styles.timelineLabel}>Pickup</Text>
//                       <Text style={styles.timelinePlace}>
//                         {ride.pickupLabel || ride.from || 'Pickup point'}
//                       </Text>
//                       <View style={styles.timelineMetaRow}>
//                         <Ionicons name="time-outline" size={13} color={Colors.gray} />
//                         <Text style={styles.timelineMetaText}>
//                           {ride.date} at {ride.time}
//                         </Text>
//                       </View>
//                     </View>

//                     <View style={styles.timelineItem}>
//                       <Text style={styles.timelineLabel}>Dropoff</Text>
//                       <Text style={styles.timelinePlace}>
//                         {ride.dropLabel || ride.to || 'Drop point'}
//                       </Text>
//                       <Text style={styles.timelineMetaText}>
//                         Estimated: {ride.durationText || '--'}
//                       </Text>
//                     </View>
//                   </View>
//                 </View>
//               </View>

//               {/* Vehicle Details Section with Registration Number */}
//               <View style={styles.cardSection}>
//                 <Text style={styles.sectionTitle}>Vehicle Details</Text>

//                 <View style={styles.vehicleHeaderRow}>
//                   <View style={styles.vehicleIconCircle}>
//                     <Ionicons name="car-sport-outline" size={18} color="#2457A6" />
//                   </View>

//                   <View style={styles.vehicleMeta}>
//                     <Text style={styles.vehicleTitle}>{vehicleName}</Text>
//                     <Text style={styles.vehicleSub}>
//                       {vehicleColor} • {ride?.seatsAvailable || 4} seats
//                     </Text>
//                     {vehicleRegNumber && (
//                       <View style={styles.vehicleRegContainer}>
//                         <Text style={styles.vehicleRegText}>
//                           Vehicle Number: {vehicleRegNumber}
//                         </Text>
//                       </View>
//                     )}
//                   </View>
//                 </View>
//               </View>

//               {/* Dynamic Ride Preferences Section */}
//               <View style={styles.cardSection}>
//                 <Text style={styles.sectionTitle}>Ride Preferences</Text>
//                 <View style={styles.tagRow}>
//                   {allPreferences.length > 0 ? (
//                     allPreferences.map((pref, index) => (
//                       <GenericPreferenceTag key={`${pref}-${index}`} label={pref} />
//                     ))
//                   ) : (
//                     <Text style={styles.emptyText}>No specific preferences added for this ride</Text>
//                   )}
//                 </View>
//               </View>

//               <View style={styles.cardSection}>
//                 <Text style={styles.sectionTitle}>Cost Breakdown</Text>

//                 <View style={styles.priceRow}>
//                   <Text style={styles.priceLabel}>Base fare (per seat)</Text>
//                   <Text style={styles.priceValue}>₹{ride.price || 0}</Text>
//                 </View>

//                 <View style={styles.priceRow}>
//                   <Text style={styles.priceLabel}>Platform fee</Text>
//                   <Text style={styles.priceValue}>₹0</Text>
//                 </View>

//                 <View style={styles.priceDivider} />

//                 <View style={styles.priceRow}>
//                   <Text style={styles.totalLabel}>Total per seat</Text>
//                   <Text style={styles.totalValue}>₹{ride.price || 0}</Text>
//                 </View>

//                 <View style={styles.noticeBox}>
//                   <Text style={styles.noticeText}>
//                     <Text style={styles.noticeBold}>Cost-share contribution:</Text>{' '}
//                     This is not a commercial fare. You're sharing the travel costs with the driver.
//                   </Text>
//                 </View>
//               </View>

//               <View style={styles.cardSection}>
//                 <Text style={styles.sectionTitle}>Select Seats</Text>
//                 <View style={styles.seatSelectorRow}>
//                   <TouchableOpacity
//                     style={styles.seatActionBtn}
//                     onPress={() => setSeatsRequested(Math.max(1, seatsRequested - 1))}
//                     disabled={seatsRequested === 1 || requestLoading}
//                   >
//                     <Ionicons name="remove" size={20} color={Colors.gray} />
//                   </TouchableOpacity>

//                   <View style={styles.seatCountWrap}>
//                     <Text style={styles.seatCountText}>{seatsRequested}</Text>
//                     <Text style={styles.seatAvailableText}>/ {ride.seatsAvailable} available</Text>
//                   </View>

//                   <TouchableOpacity
//                     style={styles.seatActionBtn}
//                     onPress={() => setSeatsRequested(Math.min(ride.seatsAvailable || 1, seatsRequested + 1))}
//                     disabled={seatsRequested === ride.seatsAvailable || requestLoading}
//                   >
//                     <Ionicons name="add" size={20} color="#2457A6" />
//                   </TouchableOpacity>
//                 </View>
//               </View>

//               <View style={styles.safetyCard}>
//                 <View style={styles.simpleInfoLeft}>
//                   <Ionicons name="shield-checkmark-outline" size={18} color="#2457A6" />
//                   <View>
//                     <Text style={styles.safetyTitle}>Safety First</Text>
//                     <Text style={styles.safetySub}>Live GPS tracking & 24/7 support</Text>
//                   </View>
//                 </View>
//               </View>

//               <View style={{ height: 110 }} />
//             </ScrollView>

//             <View style={styles.bottomBar}>
//               <View>
//                 <Text style={styles.bottomCaption}>Total for {seatsRequested} seat(s)</Text>
//                 <Text style={styles.bottomTotal}>₹{totalPrice}</Text>
//               </View>

//               <TouchableOpacity
//                 style={[styles.bookNowBtn, requestLoading && styles.bookNowBtnDisabled]}
//                 onPress={handleRequestJoin}
//                 disabled={requestLoading}
//               >
//                 <Text style={styles.bookNowText}>Book Now</Text>
//               </TouchableOpacity>
//             </View>
//           </>
//         )}
//       </Animated.View>

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
//     </View>
//   );
// }

// const styles = StyleSheet.create({
//   container: { flex: 1, backgroundColor: '#F4F5F7' },
//   centerContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 24 },
//   errorText: { fontSize: 18, color: Colors.gray, marginBottom: 16, textAlign: 'center' },
//   fallbackBtn: { backgroundColor: Colors.primary, paddingHorizontal: 20, paddingVertical: 12, borderRadius: 12 },
//   fallbackBtnText: { color: 'white', fontWeight: '700' },
//   mapContainer: { width: '100%', overflow: 'hidden', backgroundColor: '#E8EEF7' },
//   map: { flex: 1, backgroundColor: '#E8EEF7' },
//   mapBackButton: { position: 'absolute', top: Platform.OS === 'ios' ? 54 : 22, left: 14, width: 42, height: 42, borderRadius: 25, backgroundColor: 'rgba(255,255,255,0.96)', alignItems: 'center', justifyContent: 'center' },
//   markerWrapper: { alignItems: 'center' },
//   pinBubble: { width: 28, height: 28, borderRadius: 14, borderWidth: 3, borderColor: 'white', alignItems: 'center', justifyContent: 'center', shadowColor: '#000', shadowOffset: { width: 0, height: 3 }, shadowOpacity: 0.25, shadowRadius: 4, elevation: 5 },
//   pinPointer: { width: 0, height: 0, backgroundColor: 'transparent', borderStyle: 'solid', borderLeftWidth: 7, borderRightWidth: 7, borderTopWidth: 10, borderLeftColor: 'transparent', borderRightColor: 'transparent', marginTop: -2 },
//   pinIcon: { fontSize: 11, fontWeight: '800', color: 'white', textAlign: 'center', lineHeight: 18 },
//   pinLabelBubble: { backgroundColor: 'rgba(0,0,0,0.75)', borderRadius: 8, paddingHorizontal: 8, paddingVertical: 3, marginTop: 4 },
//   pinLabelText: { color: 'white', fontSize: 10, fontWeight: '700' },
//   pinLabelBubbleYellow: { backgroundColor: 'rgba(113, 63, 18, 0.9)', borderRadius: 8, paddingHorizontal: 8, paddingVertical: 3, marginTop: 4 },
//   pinLabelTextYellow: { color: '#FACC15', fontSize: 10, fontWeight: '700' },
//   drawer: { position: 'absolute', bottom: 0, left: 0, right: 0, backgroundColor: '#F4F5F7', borderTopLeftRadius: 28, borderTopRightRadius: 28, overflow: 'hidden' },
//   handleWrap: { alignItems: 'center', paddingTop: 10, paddingBottom: 8, backgroundColor: '#F4F5F7' },
//   handleHitArea: { paddingHorizontal: 40, paddingVertical: 10, alignItems: 'center', justifyContent: 'center' },
//   handleBar: { width: 64, height: 6, borderRadius: 99, backgroundColor: '#CDD2D8' },
//   collapsedSummary: { paddingHorizontal: 16, paddingTop: 4, paddingBottom: 12 },
//   collapsedTopRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: 12 },
//   collapsedDriver: { fontSize: 16, fontWeight: '800', color: Colors.dark },
//   collapsedSub: { marginTop: 2, fontSize: 12, color: Colors.gray, fontWeight: '600' },
//   collapsedPriceWrap: { alignItems: 'flex-end' },
//   collapsedPrice: { fontSize: 18, fontWeight: '900', color: Colors.dark },
//   collapsedPerSeat: { fontSize: 10, color: Colors.gray, fontWeight: '600' },
//   drawerScroll: { flex: 1 },
//   drawerContent: { paddingHorizontal: 16, paddingBottom: 16 },
//   driverCard: { backgroundColor: 'white', borderRadius: 20, padding: 16, marginBottom: 14, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 8, elevation: 2 },
//   driverTopRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
//   driverLeftWrap: { flexDirection: 'row', flex: 1, paddingRight: 10 },
//   driverAvatar: { width: 56, height: 56, borderRadius: 28, backgroundColor: '#E5E7EB', overflow: 'hidden', alignItems: 'center', justifyContent: 'center', marginRight: 12 },
//   avatarImg: { width: 56, height: 56, borderRadius: 28 },
//   avatarText: { fontSize: 15, fontWeight: '800', color: Colors.gray },
//   svgAvatarContainer: {
//     width: 56,
//     height: 56,
//     borderRadius: 28,
//     overflow: 'hidden',
//     alignItems: 'center',
//     justifyContent: 'center',
//     backgroundColor: '#E5E7EB',
//   },
//   driverMeta: { flex: 1 },
//   driverNameRow: { flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap', gap: 6 },
//   driverName: { fontSize: 17, fontWeight: '800', color: Colors.dark },
//   verifiedBadge: { flexDirection: 'row', alignItems: 'center', gap: 4 },
//   verifiedBadgeText: { fontSize: 11, color: '#2457A6', fontWeight: '700' },
//   ratingRow: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 6 },
//   ratingText: { fontSize: 13, color: Colors.dark, fontWeight: '700' },
//   chatButtonCircle: { width: 42, height: 42, borderRadius: 21, backgroundColor: '#EAF1FF', alignItems: 'center', justifyContent: 'center' },
//   driverBio: { marginTop: 12, fontSize: 14, lineHeight: 20, color: Colors.gray },
//   profileOutlineBtn: { marginTop: 14, borderWidth: 1, borderColor: '#2457A6', borderRadius: 16, paddingVertical: 12, alignItems: 'center' },
//   profileOutlineBtnText: { color: '#2457A6', fontWeight: '700', fontSize: 14 },
//   cardSection: { backgroundColor: 'white', borderRadius: 20, padding: 16, marginBottom: 14, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 8, elevation: 2 },
//   sectionTitle: { fontSize: 16, fontWeight: '800', color: Colors.dark, marginBottom: 14 },
//   tripTimelineWrap: { flexDirection: 'row' },
//   timelineRail: { width: 18, alignItems: 'center', marginTop: 4 },
//   timelineDot: { width: 10, height: 10, borderRadius: 5 },
//   timelineLine: { width: 2, flex: 1, backgroundColor: '#D8DCE3', marginVertical: 6 },
//   timelineContent: { flex: 1, paddingLeft: 8 },
//   timelineItem: { marginBottom: 14 },
//   timelineLabel: { fontSize: 12, color: Colors.gray, fontWeight: '700' },
//   timelinePlace: { fontSize: 15, color: Colors.dark, fontWeight: '700', marginTop: 4 },
//   timelineMetaRow: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 6 },
//   timelineMetaText: { fontSize: 12, color: Colors.gray, fontWeight: '600' },
//   vehicleHeaderRow: { flexDirection: 'row', alignItems: 'center' },
//   vehicleIconCircle: { width: 42, height: 42, borderRadius: 21, backgroundColor: '#EAF1FF', alignItems: 'center', justifyContent: 'center', marginRight: 12 },
//   vehicleMeta: { flex: 1 },
//   vehicleTitle: { fontSize: 15, fontWeight: '800', color: Colors.dark },
//   vehicleSub: { marginTop: 3, fontSize: 12, color: Colors.gray, fontWeight: '600' },
//   vehicleRegContainer: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     gap: 4,
//     marginTop: 6,
//     paddingTop: 6,
//     borderTopWidth: 1,
//     borderTopColor: '#F0F0F0',
//   },
//   vehicleRegText: {
//     fontSize: 11,
//     color: '#6B7280',
//     fontWeight: '500',
//   },
//   tagRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 14 },
//   preferenceTag: { paddingHorizontal: 12, paddingVertical: 8, borderRadius: 999, backgroundColor: '#FFF3E8' },
//   preferenceTagText: { fontSize: 12, color: '#C65D00', fontWeight: '700' },
//   emptyText: { fontSize: 13, color: Colors.gray, fontWeight: '600' },
//   priceRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
//   priceLabel: { fontSize: 14, color: Colors.gray, fontWeight: '500' },
//   priceValue: { fontSize: 14, color: Colors.dark, fontWeight: '700' },
//   priceDivider: { height: 1, backgroundColor: '#ECEEF2', marginVertical: 8 },
//   totalLabel: { fontSize: 15, color: Colors.dark, fontWeight: '800' },
//   totalValue: { fontSize: 15, color: '#2457A6', fontWeight: '800' },
//   noticeBox: { marginTop: 12, backgroundColor: '#FFF2E9', borderRadius: 14, padding: 12 },
//   noticeText: { fontSize: 12.5, color: Colors.dark, lineHeight: 18 },
//   noticeBold: { fontWeight: '800' },
//   seatSelectorRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: '#FAFAFB', borderRadius: 18, padding: 14 },
//   seatActionBtn: { width: 38, height: 38, borderRadius: 12, borderWidth: 1, borderColor: '#D6DDE7', alignItems: 'center', justifyContent: 'center', backgroundColor: 'white' },
//   seatCountWrap: { flexDirection: 'row', alignItems: 'baseline' },
//   seatCountText: { fontSize: 28, fontWeight: '900', color: Colors.dark },
//   seatAvailableText: { fontSize: 13, color: Colors.gray, marginLeft: 6, fontWeight: '600' },
//   simpleInfoLeft: { flexDirection: 'row', alignItems: 'center', gap: 8 },
//   safetyCard: { backgroundColor: '#FFF3E7', borderRadius: 18, padding: 16, marginBottom: 14 },
//   safetyTitle: { fontSize: 14, color: '#2457A6', fontWeight: '800' },
//   safetySub: { marginTop: 2, fontSize: 12, color: '#2457A6', opacity: 0.9, fontWeight: '600' },
//   bottomBar: { position: 'absolute', left: 0, right: 0, bottom: 0, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 16, paddingTop: 12, paddingBottom: Platform.OS === 'ios' ? 28 : 16, backgroundColor: 'white', borderTopWidth: 1, borderTopColor: '#ECEEF2' },
//   bottomCaption: { fontSize: 12, color: Colors.gray, fontWeight: '500' },
//   bottomTotal: { fontSize: 26, color: Colors.dark, fontWeight: '900', marginTop: 2 },
//   bookNowBtn: { backgroundColor: '#FF7A00', paddingHorizontal: 24, paddingVertical: 14, borderRadius: 22, minWidth: 128, alignItems: 'center', justifyContent: 'center' },
//   bookNowBtnDisabled: { opacity: 0.7 },
//   bookNowText: { color: 'white', fontSize: 16, fontWeight: '800' },
//   loaderContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#fff' },
  
//   // Profile Image Modal Styles
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
// import React, { useMemo, useRef, useState, useEffect, useCallback } from 'react';
// import {
//   View,
//   Text,
//   StyleSheet,
//   TouchableOpacity,
//   ScrollView,
//   Platform,
//   StatusBar,
//   Image,
//   Dimensions,
//   Animated,
//   PanResponder,
//   Modal
// } from 'react-native';
// import MapView, { Marker, Polyline, PROVIDER_GOOGLE } from 'react-native-maps';
// import { Ionicons } from '@expo/vector-icons';
// import LottieView from "lottie-react-native";
// import { SvgCssUri } from 'react-native-svg/css';
// import { Colors } from '../constants/Colors';
// import { useAuth } from '../context/AuthContext';
// import { API_BASE_URL } from '../config/config_ip';
// import CustomAlert from '../components/CustomAlert';
// import { useFocusEffect } from '@react-navigation/native';

// const { height } = Dimensions.get('window');
// const SAFE_TOP = Platform.OS === 'ios' ? 56 : 24;
// const COLLAPSED_HEIGHT = 84;
// const EXPANDED_HEIGHT = height * 0.72;
// const [userBooking, setUserBooking] = useState(null);

// function buildImageUrl(url) {
//   if (!url) return null;
//   if (url.startsWith('http://') || url.startsWith('https://')) return url;
//   return `${API_BASE_URL}${url.startsWith('/') ? '' : '/'}${url}`;
// }

// function getDriverInitials(name) {
//   if (!name) return 'D';
//   const parts = name.trim().split(' ').filter(Boolean);
//   if (parts.length > 1) return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
//   return parts[0].slice(0, 2).toUpperCase();
// }

// function parseSuggestedPoint(point) {
//   if (!point) return null;

//   if (Array.isArray(point) && point.length === 2) {
//     return {
//       longitude: Number(point[0]),
//       latitude: Number(point[1]),
//     };
//   }

//   if (point.lng != null && point.lat != null) {
//     return {
//       longitude: Number(point.lng),
//       latitude: Number(point.lat),
//     };
//   }

//   if (point.longitude != null && point.latitude != null) {
//     return {
//       longitude: Number(point.longitude),
//       latitude: Number(point.latitude),
//     };
//   }

//   return null;
// }

// function parseRouteCoordinates(routeCoordinates) {
//   if (!Array.isArray(routeCoordinates)) return [];

//   return routeCoordinates
//     .map((item) => {
//       if (Array.isArray(item) && item.length === 2) {
//         return {
//           longitude: Number(item[0]),
//           latitude: Number(item[1]),
//         };
//       }
//       return parseSuggestedPoint(item);
//     })
//     .filter(Boolean);
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

// function extractAllPreferences(ride, driverTravelPrefs) {
//   let ridePrefs = ride?.preferences;
  
//   if (ridePrefs && typeof ridePrefs === 'string') {
//     try {
//       ridePrefs = JSON.parse(ridePrefs);
//     } catch (e) {
//       ridePrefs = null;
//     }
//   }
  
//   if (ridePrefs && typeof ridePrefs === 'object' && Object.keys(ridePrefs).length > 0) {
//     return extractFromObject(ridePrefs);
//   }
  
//   if (driverTravelPrefs && typeof driverTravelPrefs === 'object' && Object.keys(driverTravelPrefs).length > 0) {
//     return extractFromObject(driverTravelPrefs);
//   }
  
//   return [];
// }

// function extractFromObject(prefs) {
//   const allPreferences = [];

//   Object.entries(prefs).forEach(([key, value]) => {
//     if (value === null || value === undefined) return;
    
//     const formattedKey = key.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
    
//     if (typeof value === 'boolean') {
//       if (value === true) {
//         allPreferences.push(formattedKey);
//       }
//     } 
//     else if (Array.isArray(value)) {
//       if (value.length > 0) {
//         allPreferences.push(`${formattedKey}: ${value.join(', ')}`);
//       }
//     }
//     else if (typeof value === 'object') {
//       const nestedPrefs = extractFromObject(value);
//       allPreferences.push(...nestedPrefs);
//     }
//     else if (typeof value === 'string' && value.trim()) {
//       const lowerValue = value.toLowerCase();
//       if (!['false', 'no', 'none', 'null', 'undefined'].includes(lowerValue)) {
//         allPreferences.push(`${formattedKey}: ${value}`);
//       }
//     }
//     else if (typeof value === 'number') {
//       allPreferences.push(`${formattedKey}: ${value}`);
//     }
//   });

//   return [...new Set(allPreferences)];
// }

// function GenericPreferenceTag({ label }) {
//   if (!label || label.trim() === '') return null;
  
//   let tagColor = '#FFF3E8';
//   let textColor = '#C65D00';
  
//   const lowerLabel = label.toLowerCase();
  
//   if (lowerLabel.includes('age') || lowerLabel.includes('category')) {
//     tagColor = '#E8F5E9';
//     textColor = '#2E7D32';
//   } else if (lowerLabel.includes('chat') || lowerLabel.includes('talk')) {
//     tagColor = '#E3F2FD';
//     textColor = '#1565C0';
//   } else if (lowerLabel.includes('gender')) {
//     tagColor = '#F3E5F5';
//     textColor = '#6A1B9A';
//   } else if (lowerLabel.includes('language') || lowerLabel.includes('speak')) {
//     tagColor = '#FFF9C4';
//     textColor = '#F57F17';
//   } else if (lowerLabel.includes('verified')) {
//     tagColor = '#E8F5E9';
//     textColor = '#2E7D32';
//   }
  
//   return (
//     <View style={[styles.preferenceTag, { backgroundColor: tagColor }]}>
//       <Text style={[styles.preferenceTagText, { color: textColor }]}>{label}</Text>
//     </View>
//   );
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
//                   />
//                 </View>
//               ) : (
//                 <Image
//                   source={{ uri: imageUrl }}
//                   style={styles.fullProfileImage}
//                   resizeMode="contain"
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

// export default function RideDetailScreen({ navigation, route }) {
//   const { user, isAuthenticated } = useAuth();
//   const { ride, searchData } = route.params || {};

//   const [seatsRequested, setSeatsRequested] = useState(1);
//   const [requestLoading, setRequestLoading] = useState(false);
//   const [drawerExpanded, setDrawerExpanded] = useState(true);
//   const [driverProfile, setDriverProfile] = useState(null);
//   const [isVerified, setIsVerified] = useState(false);
//   const [loadingProfile, setLoadingProfile] = useState(false);
//   const [mapReady, setMapReady] = useState(false);
//   const [userBooking, setUserBooking] = useState(null);
//   const animatedDrawer = useRef(new Animated.Value(1)).current;
//   const mapRef = useRef(null);
  
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

//   const showConfirmationAlert = (title, message, onConfirm) => {
//     setAlertConfig({
//       title,
//       message,
//       icon: "warning",
//       iconColor: "#F59E0B",
//       buttons: [
//         { text: 'Cancel', onPress: () => setAlertVisible(false), style: 'cancel' },
//         { text: 'Login', onPress: () => {
//           setAlertVisible(false);
//           onConfirm();
//         }, style: 'destructive' }
//       ]
//     });
//     setAlertVisible(true);
//   };

// // Function to check if user already has a booking for this ride
// const checkUserBooking = useCallback(async () => {
//   if (!user?.phone_number || !ride?.id) return;
  
//   try {
//     const response = await fetch(`${API_BASE_URL}/my-rides/${user.phone_number}`);
//     const data = await response.json();
    
//     const booking = data.requested_rides?.find(
//       b => b.ride_id === ride.id && b.status === 'accepted'
//     );
    
//     if (booking) {
//       setUserBooking(booking);
//       setSeatsRequested(booking.seats_requested);
//       console.log('📦 Found existing booking:', booking);
//     }
//   } catch (error) {
//     console.log('Error checking user booking:', error);
//   }
// }, [user?.phone_number, ride?.id]);

// // Call this when screen loads
// useFocusEffect(
//   useCallback(() => {
//     loadDriverData();
//     checkUserBooking();
//   }, [loadDriverData, checkUserBooking])
// );
//   // // Check if user already has a booking for this ride
//   // const checkUserBooking = useCallback(async () => {
//   //   if (!user?.phone_number || !ride?.id) return;
    
//   //   try {
//   //     const response = await fetch(`${API_BASE_URL}/my-rides/${user.phone_number}`);
//   //     const data = await response.json();
      
//   //     const booking = data.requested_rides?.find(
//   //       b => b.ride_id === ride.id && b.status === 'accepted'
//   //     );
      
//   //     if (booking) {
//   //       setUserBooking(booking);
//   //       setSeatsRequested(booking.seats_requested);
//   //     }
//   //   } catch (error) {
//   //     console.log('Error checking user booking:', error);
//   //   }
//   // }, [user?.phone_number, ride?.id]);

//   const loadDriverData = useCallback(async () => {
//     const driverPhone = ride?.phoneNumber;
//     const driverUserId = ride?.driverUserId;
    
//     if (driverPhone || driverUserId) {
//       setLoadingProfile(true);
      
//       try {
//         const profileData = await fetchDriverProfile(driverPhone, driverUserId);
//         if (profileData?.success && profileData.user) {
//           setDriverProfile(profileData.user);
//         } else {
//           setDriverProfile(null);
//         }
        
//         let verified = false;
//         if (driverPhone) {
//           const docsData = await fetchUserDocuments(driverPhone);
//           if (docsData?.success && docsData.documents) {
//             const verifiedDocs = docsData.documents.filter(doc => {
//               const status = doc.status?.toUpperCase();
//               return status === 'APPROVED' && ['aadhar', 'dl', 'rc'].includes(doc.document_type?.toLowerCase());
//             });
//             verified = verifiedDocs.length > 0;
//             setIsVerified(verified);
//           }
//         }
//       } catch (error) {
//         console.log('Error loading driver data:', error);
//       } finally {
//         setLoadingProfile(false);
//       }
//     }
//   }, [ride?.phoneNumber, ride?.driverUserId]);

//   useFocusEffect(
//     useCallback(() => {
//       loadDriverData();
//       checkUserBooking();
//     }, [loadDriverData, checkUserBooking])
//   );

//   useEffect(() => {
//     if (!isAuthenticated) {
//       showConfirmationAlert(
//         'Login Required',
//         'Please login to book rides or chat with drivers.',
//         () => navigation.navigate('Login')
//       );
//       navigation.goBack();
//     }
//   }, [isAuthenticated, navigation]);

//   const getProfilePhotoUrl = useCallback(() => {
//     const rawUrl = driverProfile?.profile_picture || ride?.profilePicture;
//     if (!rawUrl) return null;
//     return buildImageUrl(rawUrl);
//   }, [driverProfile, ride]);
  
//   const profilePhotoUrl = getProfilePhotoUrl();
//   const avatarText = getDriverInitials(driverProfile?.full_name || ride?.driverName || 'Driver');
//   const isProfilePhotoSvg = profilePhotoUrl ? profilePhotoUrl.toLowerCase().includes('.svg') : false;
  
//   const allPreferences = useMemo(() => {
//     return extractAllPreferences(ride, driverProfile?.travel_preferences);
//   }, [ride, driverProfile]);

//   const driverStart = useMemo(() => {
//     const coords = ride?.routeCoordinates;
//     if (Array.isArray(coords) && coords.length > 0) {
//       const first = coords[0];
//       if (Array.isArray(first) && first.length === 2) {
//         return { latitude: first[1], longitude: first[0] };
//       }
//     }
//     return parseSuggestedPoint(ride?.suggestedPickup);
//   }, [ride]);

//   const driverEnd = useMemo(() => {
//     const coords = ride?.routeCoordinates;
//     if (Array.isArray(coords) && coords.length > 0) {
//       const last = coords[coords.length - 1];
//       if (Array.isArray(last) && last.length === 2) {
//         return { latitude: last[1], longitude: last[0] };
//       }
//     }
//     return parseSuggestedPoint(ride?.suggestedDrop);
//   }, [ride]);

//   const intersectionPickup = useMemo(
//     () => parseSuggestedPoint(ride?.suggestedPickup),
//     [ride]
//   );
//   const intersectionDrop = useMemo(
//     () => parseSuggestedPoint(ride?.suggestedDrop),
//     [ride]
//   );

//   const userPickup = useMemo(() => {
//     if (!searchData?.fromCoords) return null;
//     const c = searchData.fromCoords;
//     if (Array.isArray(c) && c.length === 2) {
//       return { latitude: c[1], longitude: c[0] };
//     }
//     return null;
//   }, [searchData]);

//   const userDrop = useMemo(() => {
//     if (!searchData?.toCoords) return null;
//     const c = searchData.toCoords;
//     if (Array.isArray(c) && c.length === 2) {
//       return { latitude: c[1], longitude: c[0] };
//     }
//     return null;
//   }, [searchData]);

//   const routePath = useMemo(() => {
//     const fullRoute = parseRouteCoordinates(ride?.routeCoordinates);
//     if (fullRoute.length >= 2) return fullRoute;
//     if (intersectionPickup && intersectionDrop) return [intersectionPickup, intersectionDrop];
//     return [];
//   }, [ride, intersectionPickup, intersectionDrop]);

//   const walkToPickupPath = useMemo(() => {
//     if (userPickup && intersectionPickup) return [userPickup, intersectionPickup];
//     return [];
//   }, [userPickup, intersectionPickup]);

//   const walkFromDropPath = useMemo(() => {
//     if (userDrop && intersectionDrop) return [intersectionDrop, userDrop];
//     return [];
//   }, [userDrop, intersectionDrop]);

//   const allMarkerCoords = useMemo(() => {
//     const coords = [];
//     if (driverStart) coords.push(driverStart);
//     if (driverEnd) coords.push(driverEnd);
//     if (userPickup) coords.push(userPickup);
//     if (userDrop) coords.push(userDrop);
//     if (intersectionPickup) coords.push(intersectionPickup);
//     if (intersectionDrop) coords.push(intersectionDrop);
//     return coords;
//   }, [driverStart, driverEnd, userPickup, userDrop, intersectionPickup, intersectionDrop]);

//   const fitMapToMarkers = useCallback(() => {
//     if (mapRef.current && mapReady && allMarkerCoords.length >= 2) {
//       setTimeout(() => {
//         try {
//           mapRef.current.fitToCoordinates(allMarkerCoords, {
//             edgePadding: { top: 80, right: 50, bottom: 50, left: 50 },
//             animated: true,
//           });
//         } catch (e) {
//           console.log('fitToCoordinates error:', e);
//         }
//       }, 500);
//     }
//   }, [mapReady, allMarkerCoords]);

//   useEffect(() => {
//     if (mapReady && allMarkerCoords.length >= 2) {
//       fitMapToMarkers();
//     }
//   }, [mapReady, allMarkerCoords, fitMapToMarkers]);

//   const vehicleName = driverProfile?.vehicle 
//     ? [driverProfile.vehicle.model].filter(Boolean).join(' ')
//     : [ride?.vehicle?.model].filter(Boolean).join(' ') || 'Vehicle details unavailable';
  
//   const vehicleRegNumber = driverProfile?.vehicle?.registration_number || 
//                            ride?.vehicle?.registration_number || 
//                            null;
  
//   const vehicleColor = driverProfile?.vehicle?.color || 
//                        ride?.vehicle?.color || 
//                        'Not specified';

//   const totalPrice = Number(ride?.price || 0) * seatsRequested;

//   const handleProfileImagePress = () => {
//     if (profilePhotoUrl) {
//       setSelectedProfile({
//         visible: true,
//         imageUrl: profilePhotoUrl,
//         driverName: driverProfile?.full_name || ride?.driverName || 'Driver',
//       });
//     } else {
//       showCustomAlert('No Photo', 'Driver has not uploaded a profile picture', 'warning');
//     }
//   };

//   const mapHeight = animatedDrawer.interpolate({
//     inputRange: [0, 1],
//     outputRange: [height - SAFE_TOP - COLLAPSED_HEIGHT, height * 0.32],
//   });

//   const drawerHeight = animatedDrawer.interpolate({
//     inputRange: [0, 1],
//     outputRange: [COLLAPSED_HEIGHT, EXPANDED_HEIGHT],
//   });

//   const toggleDrawer = () => {
//     const nextExpanded = !drawerExpanded;
//     setDrawerExpanded(nextExpanded);

//     Animated.timing(animatedDrawer, {
//       toValue: nextExpanded ? 1 : 0,
//       duration: 260,
//       useNativeDriver: false,
//     }).start();
//   };

//   const panResponder = useRef(
//     PanResponder.create({
//       onMoveShouldSetPanResponder: (_, gestureState) =>
//         Math.abs(gestureState.dy) > 5,
//       onPanResponderMove: (_, gestureState) => {
//         const dragRange = EXPANDED_HEIGHT - COLLAPSED_HEIGHT;
//         const progress = drawerExpanded
//           ? 1 - (gestureState.dy / dragRange)
//           : gestureState.dy / dragRange;
//         const clamped = Math.max(0, Math.min(1, progress));
//         animatedDrawer.setValue(clamped);
//       },
//       onPanResponderRelease: (_, gestureState) => {
//         const dragRange = EXPANDED_HEIGHT - COLLAPSED_HEIGHT;
//         const threshold = dragRange * 0.2;
//         if (drawerExpanded) {
//           if (gestureState.dy > threshold) {
//             setDrawerExpanded(false);
//             Animated.timing(animatedDrawer, {
//               toValue: 0,
//               duration: 200,
//               useNativeDriver: false,
//             }).start();
//           } else {
//             setDrawerExpanded(true);
//             Animated.timing(animatedDrawer, {
//               toValue: 1,
//               duration: 200,
//               useNativeDriver: false,
//             }).start();
//           }
//         } else {
//           if (gestureState.dy < -threshold) {
//             setDrawerExpanded(true);
//             Animated.timing(animatedDrawer, {
//               toValue: 1,
//               duration: 200,
//               useNativeDriver: false,
//             }).start();
//           } else {
//             setDrawerExpanded(false);
//             Animated.timing(animatedDrawer, {
//               toValue: 0,
//               duration: 200,
//               useNativeDriver: false,
//             }).start();
//           }
//         }
//       },
//     })
//   ).current;

//   const checkPassengerOverlap = async (departureTime, durationMinutes = 60) => {
//     try {
//       if (!user?.phone_number) return false;
      
//       const url = `${API_BASE_URL}/check-passenger-overlap?phone_number=${encodeURIComponent(user.phone_number)}&departure_time=${departureTime.toISOString()}&duration_minutes=${durationMinutes}`;
      
//       const response = await fetch(url);
//       const data = await response.json();
      
//       if (data.has_overlap) {
//         const overlap = data.overlapping_booking;
//         showCustomAlert(
//           'Overlapping Ride',
//           `You already have a confirmed booking for a ride from ${overlap.origin} to ${overlap.destination} at ${new Date(overlap.departure_time).toLocaleTimeString()}. Please complete that ride before booking another.`,
//           'warning'
//         );
//         return true;
//       }
//       return false;
//     } catch (error) {
//       console.log('Error checking passenger overlap:', error);
//       return false;
//     }
//   };

//   // const handleModifySeats = async (newSeatCount) => {
//   //   if (!user?.phone_number) {
//   //     showCustomAlert('Login Required', 'Please log in to modify booking.', 'warning');
//   //     return;
//   //   }

//   //   setRequestLoading(true);
//   //   try {
//   //     const response = await fetch(`${API_BASE_URL}/booking/${userBooking.id}/modify-seats`, {
//   //       method: 'PUT',
//   //       headers: { 
//   //         'Content-Type': 'application/json',
//   //         'Accept': 'application/json'
//   //       },
//   //       body: JSON.stringify({ new_seats: newSeatCount }),
//   //     });

//   //     const data = await response.json();

//   //     if (!response.ok) {
//   //       throw new Error(data.detail || data.message || 'Failed to modify booking');
//   //     }

//   //     showCustomAlert('Success', data.message || 'Booking updated successfully', 'success');
//   //     setUserBooking({ ...userBooking, seats_requested: newSeatCount });
//   //   } catch (error) {
//   //     console.error('Modify booking error:', error);
//   //     showCustomAlert('Error', error.message || 'Failed to modify booking', 'error');
//   //   } finally {
//   //     setRequestLoading(false);
//   //   }
//   // };

//   const handleRequestJoin = async () => {
//     if (!user?.phone_number) {
//       showCustomAlert('Login Required', 'Please log in to request a ride.', 'warning');
//       return;
//     }

//     // If user already has a booking for this ride, modify seats instead
//     if (userBooking) {
//       await handleModifySeats(seatsRequested);
//       return;
//     }

//     if (ride?.womenOnly === true && user?.gender !== 'female') {
//       showCustomAlert(
//         'Not Available', 
//         'This ride is for women passengers only. Please search for other rides.',
//         'warning'
//       );
//       return;
//     }

//     const availableSeats = ride?.seatsAvailable || 0;
//     if (seatsRequested > availableSeats) {
//       showCustomAlert(
//         'Not Enough Seats',
//         `Only ${availableSeats} seat${availableSeats !== 1 ? 's' : ''} left in this ride. Please reduce your seat request.`,
//         'warning'
//       );
//       return;
//     }

//     let rideDateTime;
//     if (ride?.date && ride?.time) {
//       rideDateTime = new Date(`${ride.date} ${ride.time}`);
//     } else if (ride?.departure_time) {
//       rideDateTime = new Date(ride.departure_time);
//     } else {
//       rideDateTime = new Date();
//     }
    
//     let durationMinutes = 60;
//     if (ride?.durationMinutes) {
//       durationMinutes = ride.durationMinutes;
//     } else if (ride?.durationText) {
//       const match = ride.durationText.match(/\d+/);
//       if (match) durationMinutes = parseInt(match[0]);
//     }
    
//     const hasOverlap = await checkPassengerOverlap(rideDateTime, durationMinutes);
//     if (hasOverlap) {
//       return;
//     }

//     setRequestLoading(true);
//     try {
//       const payload = {
//         ride_id: ride.id,
//         passenger_phone: user.phone_number,
//         seats_requested: seatsRequested,
//       };

//       if (searchData?.fromCoords && Array.isArray(searchData.fromCoords)) {
//         payload.from_coords = searchData.fromCoords;
//       }
//       if (searchData?.toCoords && Array.isArray(searchData.toCoords)) {
//         payload.to_coords = searchData.toCoords;
//       }

//       const response = await fetch(`${API_BASE_URL}/ride-bookings`, {
//         method: 'POST',
//         headers: { 
//           'Content-Type': 'application/json',
//           'Accept': 'application/json'
//         },
//         body: JSON.stringify(payload),
//       });

//       const raw = await response.text();
//       let data = {};
//       try {
//         data = raw ? JSON.parse(raw) : {};
//       } catch {
//         data.detail = raw;
//       }

//       if (!response.ok) {
//         throw new Error(data.detail || data.message || `Server error (${response.status})`);
//       }

//       showCustomAlert('Success', data.message || 'Ride request sent successfully', 'success');
//       setTimeout(() => navigation.goBack(), 1500);
//     } catch (error) {
//       console.error('Booking error:', error);
//       showCustomAlert('Error', error.message || 'Failed to send request', 'error');
//     } finally {
//       setRequestLoading(false);
//     }
//   };

//   const viewDriverProfile = () => {
//     const driverPhone = ride?.phoneNumber;
//     const driverUserId = ride?.driverUserId;
    
//     if (driverPhone || driverUserId) {
//       navigation.navigate('ViewProfileScreen', {
//         userId: driverUserId || null,
//         phoneNumber: driverPhone || null,
//         driverName: driverProfile?.full_name || ride?.driverName || 'Driver',
//         profilePicture: profilePhotoUrl,
//         vehicleNumber: vehicleRegNumber,
//         vehicleModel: vehicleName,
//         driverRating: driverProfile?.avg_rating || ride?.rating || 0,
//       });
//     } else {
//       showCustomAlert('Profile', 'Driver profile not available', 'warning');
//     }
//   };

//   const getOrCreateConversation = async (receiverPhone, rideId) => {
//     try {
//       const myPhone = user?.phone_number;
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
//         body: JSON.stringify({ participant_phone: receiverPhone, ride_id: rideId }),
//       });
//       const data = await response.json();
//       if (data.success) {
//         return data.conversation.id;
//       }
//       return null;
//     } catch (error) {
//       console.error('getOrCreateConversation error:', error);
//       return null;
//     }
//   };

//   const startChat = async () => {
//     const driverPhone = ride?.phoneNumber;
//     if (driverPhone) {
//       const conversationId = await getOrCreateConversation(driverPhone, ride.id);
//       if (conversationId) {
//         navigation.navigate('ChatScreen', {
//           receiverPhone: driverPhone,
//           conversationId,
//           user: {
//             name: driverProfile?.full_name || ride?.driverName || 'Driver',
//             tripInfo: `${ride.from || 'Pickup'} → ${ride.to || 'Drop'}`,
//           },
//         });
//       } else {
//         showCustomAlert('Chat', 'Unable to start chat. Please try again.', 'error');
//       }
//     } else {
//       showCustomAlert('Chat', 'Driver contact not available', 'warning');
//     }
//   };

//   if (requestLoading || loadingProfile) {
//     return (
//       <View style={styles.loaderContainer}>
//         <LottieView
//           source={require("../assets/loading.json")}
//           autoPlay
//           loop
//           style={{ width: 300, height: 300 }}
//         />
//       </View>
//     );
//   }

//   if (!ride) {
//     return (
//       <View style={styles.centerContainer}>
//         <Text style={styles.errorText}>No ride data available</Text>
//         <TouchableOpacity
//           onPress={() => navigation.goBack()}
//           style={styles.fallbackBtn}
//         >
//           <Text style={styles.fallbackBtnText}>Go Back</Text>
//         </TouchableOpacity>
//       </View>
//     );
//   }

//   const initialRegion = {
//     latitude: intersectionPickup?.latitude || driverStart?.latitude || 28.6139,
//     longitude: intersectionPickup?.longitude || driverStart?.longitude || 77.2090,
//     latitudeDelta: 0.05,
//     longitudeDelta: 0.05,
//   };

//   return (
//     <View style={styles.container}>
//       <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />

//       <Animated.View style={[styles.mapContainer, { height: mapHeight }]}>
//         <MapView
//           ref={mapRef}
//           provider={PROVIDER_GOOGLE}
//           style={styles.map}
//           initialRegion={initialRegion}
//           onMapReady={() => setMapReady(true)}
//           showsUserLocation={false}
//           showsMyLocationButton={false}
//           zoomEnabled={true}
//           zoomControlEnabled={true}
//         >
//           {routePath.length >= 2 && (
//             <Polyline
//               coordinates={routePath}
//               strokeColor="#2457A6"
//               strokeWidth={5}
//               lineCap="round"
//               lineJoin="round"
//             />
//           )}

//           {driverStart && (
//             <Marker coordinate={driverStart} anchor={{ x: 0.5, y: 1 }}>
//               <View style={styles.markerWrapper}>
//                 <View style={[styles.pinBubble, { backgroundColor: '#16A34A' }]}>
//                   <Text style={styles.pinIcon}>S</Text>
//                 </View>
//                 <View style={[styles.pinPointer, { borderTopColor: '#16A34A' }]} />
//               </View>
//             </Marker>
//           )}

//           {driverEnd && (
//             <Marker coordinate={driverEnd} anchor={{ x: 0.5, y: 1 }}>
//               <View style={styles.markerWrapper}>
//                 <View style={[styles.pinBubble, { backgroundColor: '#DC2626' }]}>
//                   <Text style={styles.pinIcon}>E</Text>
//                 </View>
//                 <View style={[styles.pinPointer, { borderTopColor: '#DC2626' }]} />
//               </View>
//             </Marker>
//           )}

//           {userPickup && (
//             <Marker coordinate={userPickup} anchor={{ x: 0.5, y: 1 }}>
//               <View style={styles.markerWrapper}>
//                 <View style={[styles.pinBubble, { backgroundColor: '#3B82F6' }]}>
//                   <Ionicons name="person" size={12} color="white" />
//                 </View>
//                 <View style={[styles.pinPointer, { borderTopColor: '#3B82F6' }]} />
//                 <View style={styles.pinLabelBubble}>
//                   <Text style={styles.pinLabelText}>Your Pickup</Text>
//                 </View>
//               </View>
//             </Marker>
//           )}

//           {userDrop && (
//             <Marker coordinate={userDrop} anchor={{ x: 0.5, y: 1 }}>
//               <View style={styles.markerWrapper}>
//                 <View style={[styles.pinBubble, { backgroundColor: '#F97316' }]}>
//                   <Ionicons name="flag" size={12} color="white" />
//                 </View>
//                 <View style={[styles.pinPointer, { borderTopColor: '#F97316' }]} />
//                 <View style={styles.pinLabelBubble}>
//                   <Text style={styles.pinLabelText}>Your Drop</Text>
//                 </View>
//               </View>
//             </Marker>
//           )}

//           {intersectionPickup && (
//             <Marker coordinate={intersectionPickup} anchor={{ x: 0.5, y: 1 }}>
//               <View style={styles.markerWrapper}>
//                 <View style={[styles.pinBubble, { backgroundColor: '#FACC15' }]}>
//                   <Ionicons name="hand-right" size={12} color="#713F12" />
//                 </View>
//                 <View style={[styles.pinPointer, { borderTopColor: '#FACC15' }]} />
//                 <View style={styles.pinLabelBubbleYellow}>
//                   <Text style={styles.pinLabelTextYellow}>Meet Driver</Text>
//                 </View>
//               </View>
//             </Marker>
//           )}

//           {intersectionDrop && (
//             <Marker coordinate={intersectionDrop} anchor={{ x: 0.5, y: 1 }}>
//               <View style={styles.markerWrapper}>
//                 <View style={[styles.pinBubble, { backgroundColor: '#FACC15' }]}>
//                   <Ionicons name="exit" size={12} color="#713F12" />
//                 </View>
//                 <View style={[styles.pinPointer, { borderTopColor: '#FACC15' }]} />
//                 <View style={styles.pinLabelBubbleYellow}>
//                   <Text style={styles.pinLabelTextYellow}>Exit Here</Text>
//                 </View>
//               </View>
//             </Marker>
//           )}

//           {walkToPickupPath.length >= 2 && (
//             <Polyline
//               coordinates={walkToPickupPath}
//               strokeColor="#FACC15"
//               strokeWidth={4}
//               lineDashPattern={[8, 6]}
//               lineCap="round"
//               lineJoin="round"
//             />
//           )}

//           {walkFromDropPath.length >= 2 && (
//             <Polyline
//               coordinates={walkFromDropPath}
//               strokeColor="#FACC15"
//               strokeWidth={4}
//               lineDashPattern={[8, 6]}
//               lineCap="round"
//               lineJoin="round"
//             />
//           )}
//         </MapView>

//         <TouchableOpacity
//           style={styles.mapBackButton}
//           onPress={() => navigation.goBack()}
//         >
//           <Ionicons name="chevron-back" size={26} color={Colors.secondary} />
//         </TouchableOpacity>
//       </Animated.View>

//       <Animated.View style={[styles.drawer, { height: drawerHeight }]}>
//         <View style={styles.handleWrap} {...panResponder.panHandlers}>
//           <TouchableOpacity
//             activeOpacity={0.9}
//             onPress={toggleDrawer}
//             style={styles.handleHitArea}
//           >
//             <View style={styles.handleBar} />
//           </TouchableOpacity>
//         </View>

//         {!drawerExpanded ? (
//           <View style={styles.collapsedSummary}>
//             <View style={styles.collapsedTopRow}>
//               <View style={{ flex: 1 }}>
//                 <Text style={styles.collapsedDriver} numberOfLines={1}>
//                   {driverProfile?.full_name || ride?.driverName || 'Driver'}
//                 </Text>
//                 <Text style={styles.collapsedSub} numberOfLines={1}>
//                   {ride.from || 'Pickup'} → {ride.to || 'Drop'}
//                 </Text>
//               </View>

//               <View style={styles.collapsedPriceWrap}>
//                 <Text style={styles.collapsedPrice}>₹{ride.price}</Text>
//                 <Text style={styles.collapsedPerSeat}>per seat</Text>
//               </View>
//             </View>
//           </View>
//         ) : (
//           <>
//             <ScrollView
//               style={styles.drawerScroll}
//               contentContainerStyle={styles.drawerContent}
//               showsVerticalScrollIndicator={false}
//             >
//               <View style={styles.driverCard}>
//                 <View style={styles.driverTopRow}>
//                   <View style={styles.driverLeftWrap}>
//                     <TouchableOpacity 
//                       style={styles.driverAvatar} 
//                       onPress={handleProfileImagePress}
//                       activeOpacity={0.8}
//                     >
//                       {profilePhotoUrl ? (
//                         isProfilePhotoSvg ? (
//                           <View style={styles.svgAvatarContainer}>
//                             <SvgCssUri
//                               uri={profilePhotoUrl}
//                               width={56}
//                               height={56}
//                             />
//                           </View>
//                         ) : (
//                           <Image 
//                             source={{ uri: profilePhotoUrl }} 
//                             style={styles.avatarImg}
//                           />
//                         )
//                       ) : (
//                         <Text style={styles.avatarText}>{avatarText}</Text>
//                       )}
//                     </TouchableOpacity>

//                     <View style={styles.driverMeta}>
//                       <View style={styles.driverNameRow}>
//                         <Text style={styles.driverName}>
//                           {driverProfile?.full_name || ride?.driverName || 'Driver'}
//                         </Text>
//                         {isVerified && (
//                           <View style={styles.verifiedBadge}>
//                             <Ionicons name="checkmark-circle" size={12} color="#2457A6" />
//                             <Text style={styles.verifiedBadgeText}>Verified</Text>
//                           </View>
//                         )}
//                       </View>

//                       <View style={styles.ratingRow}>
//                         <Ionicons name="star" size={13} color="#F59E0B" />
//                         <Text style={styles.ratingText}>
//                           {driverProfile?.avg_rating || ride?.rating || 4.5}
//                         </Text>
//                       </View>
//                     </View>
//                   </View>

//                   <TouchableOpacity style={styles.chatButtonCircle} onPress={startChat}>
//                     <Ionicons name="chatbubble-outline" size={20} color="#2457A6" />
//                   </TouchableOpacity>
//                 </View>

//                 <Text style={styles.driverBio}>
//                   {driverProfile?.bio || driverProfile?.about || 'Friendly driver, love meeting new people!'}
//                 </Text>

//                 <TouchableOpacity style={styles.profileOutlineBtn} onPress={viewDriverProfile}>
//                   <Text style={styles.profileOutlineBtnText}>View Full Profile</Text>
//                 </TouchableOpacity>
//               </View>

//               <View style={styles.cardSection}>
//                 <Text style={styles.sectionTitle}>Trip Details</Text>

//                 <View style={styles.tripTimelineWrap}>
//                   <View style={styles.timelineRail}>
//                     <View style={[styles.timelineDot, { backgroundColor: '#2457A6' }]} />
//                     <View style={styles.timelineLine} />
//                     <View style={[styles.timelineDot, { backgroundColor: '#FF7A00' }]} />
//                   </View>

//                   <View style={styles.timelineContent}>
//                     <View style={styles.timelineItem}>
//                       <Text style={styles.timelineLabel}>Pickup</Text>
//                       <Text style={styles.timelinePlace}>
//                         {ride.pickupLabel || ride.from || 'Pickup point'}
//                       </Text>
//                       <View style={styles.timelineMetaRow}>
//                         <Ionicons name="time-outline" size={13} color={Colors.gray} />
//                         <Text style={styles.timelineMetaText}>
//                           {ride.date} at {ride.time}
//                         </Text>
//                       </View>
//                     </View>

//                     <View style={styles.timelineItem}>
//                       <Text style={styles.timelineLabel}>Dropoff</Text>
//                       <Text style={styles.timelinePlace}>
//                         {ride.dropLabel || ride.to || 'Drop point'}
//                       </Text>
//                       <Text style={styles.timelineMetaText}>
//                         Estimated: {ride.durationText || '--'}
//                       </Text>
//                     </View>
//                   </View>
//                 </View>
//               </View>

//               <View style={styles.cardSection}>
//                 <Text style={styles.sectionTitle}>Vehicle Details</Text>

//                 <View style={styles.vehicleHeaderRow}>
//                   <View style={styles.vehicleIconCircle}>
//                     <Ionicons name="car-sport-outline" size={18} color="#2457A6" />
//                   </View>

//                   <View style={styles.vehicleMeta}>
//                     <Text style={styles.vehicleTitle}>{vehicleName}</Text>
//                     <Text style={styles.vehicleSub}>
//                       {vehicleColor} • {ride?.seatsAvailable || 4} seats
//                     </Text>
//                     {vehicleRegNumber && (
//                       <View style={styles.vehicleRegContainer}>
//                         <Text style={styles.vehicleRegText}>
//                           Vehicle Number: {vehicleRegNumber}
//                         </Text>
//                       </View>
//                     )}
//                   </View>
//                 </View>
//               </View>

//               <View style={styles.cardSection}>
//                 <Text style={styles.sectionTitle}>Ride Preferences</Text>
//                 <View style={styles.tagRow}>
//                   {allPreferences.length > 0 ? (
//                     allPreferences.map((pref, index) => (
//                       <GenericPreferenceTag key={`${pref}-${index}`} label={pref} />
//                     ))
//                   ) : (
//                     <Text style={styles.emptyText}>No specific preferences added for this ride</Text>
//                   )}
//                 </View>
//               </View>

//               <View style={styles.cardSection}>
//                 <Text style={styles.sectionTitle}>Cost Breakdown</Text>

//                 <View style={styles.priceRow}>
//                   <Text style={styles.priceLabel}>Base fare (per seat)</Text>
//                   <Text style={styles.priceValue}>₹{ride.price || 0}</Text>
//                 </View>

//                 <View style={styles.priceRow}>
//                   <Text style={styles.priceLabel}>Platform fee</Text>
//                   <Text style={styles.priceValue}>₹0</Text>
//                 </View>

//                 <View style={styles.priceDivider} />

//                 <View style={styles.priceRow}>
//                   <Text style={styles.totalLabel}>Total per seat</Text>
//                   <Text style={styles.totalValue}>₹{ride.price || 0}</Text>
//                 </View>

//                 <View style={styles.noticeBox}>
//                   <Text style={styles.noticeText}>
//                     <Text style={styles.noticeBold}>Cost-share contribution:</Text>{' '}
//                     This is not a commercial fare. You're sharing the travel costs with the driver.
//                   </Text>
//                 </View>
//               </View>

//               <View style={styles.cardSection}>
//                 <Text style={styles.sectionTitle}>
//                   {userBooking ? 'Modify Seats' : 'Select Seats'}
//                 </Text>
//                 {userBooking && (
//                   <Text style={styles.currentBookingText}>
//                     You have already booked {userBooking.seats_requested} seat(s) for this ride.
//                   </Text>
//                 )}
//                 <View style={styles.seatSelectorRow}>
//                   <TouchableOpacity
//                     style={styles.seatActionBtn}
//                     onPress={() => {
//                       const newCount = Math.max(1, seatsRequested - 1);
//                       setSeatsRequested(newCount);
//                       if (userBooking) {
//                         handleModifySeats(newCount);
//                       }
//                     }}
//                     disabled={seatsRequested === 1 || requestLoading}
//                   >
//                     <Ionicons name="remove" size={20} color={Colors.gray} />
//                   </TouchableOpacity>

//                   <View style={styles.seatCountWrap}>
//                     <Text style={styles.seatCountText}>{seatsRequested}</Text>
//                     <Text style={styles.seatAvailableText}>/ {ride.seatsAvailable} available</Text>
//                   </View>

//                   <TouchableOpacity
//                     style={styles.seatActionBtn}
//                     onPress={() => {
//                       const newCount = Math.min(ride.seatsAvailable || 1, seatsRequested + 1);
//                       setSeatsRequested(newCount);
//                       if (userBooking) {
//                         handleModifySeats(newCount);
//                       }
//                     }}
//                     disabled={seatsRequested === ride.seatsAvailable || requestLoading}
//                   >
//                     <Ionicons name="add" size={20} color="#2457A6" />
//                   </TouchableOpacity>
//                 </View>
//               </View>

//               <View style={styles.safetyCard}>
//                 <View style={styles.simpleInfoLeft}>
//                   <Ionicons name="shield-checkmark-outline" size={18} color="#2457A6" />
//                   <View>
//                     <Text style={styles.safetyTitle}>Safety First</Text>
//                     <Text style={styles.safetySub}>Live GPS tracking & 24/7 support</Text>
//                   </View>
//                 </View>
//               </View>

//               <View style={{ height: 110 }} />
//             </ScrollView>

//             <View style={styles.bottomBar}>
//               <View>
//                 <Text style={styles.bottomCaption}>Total for {seatsRequested} seat(s)</Text>
//                 <Text style={styles.bottomTotal}>₹{totalPrice}</Text>
//               </View>

//               <TouchableOpacity
//                 style={[styles.bookNowBtn, requestLoading && styles.bookNowBtnDisabled]}
//                 onPress={handleRequestJoin}
//                 disabled={requestLoading}
//               >
//                 <Text style={styles.bookNowText}>
//                   {userBooking ? 'Update Booking' : 'Book Now'}
//                 </Text>
//               </TouchableOpacity>
//             </View>
//           </>
//         )}
//       </Animated.View>

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
//     </View>
//   );
// }

// const styles = StyleSheet.create({
//   container: { flex: 1, backgroundColor: '#F4F5F7' },
//   centerContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 24 },
//   errorText: { fontSize: 18, color: Colors.gray, marginBottom: 16, textAlign: 'center' },
//   fallbackBtn: { backgroundColor: Colors.primary, paddingHorizontal: 20, paddingVertical: 12, borderRadius: 12 },
//   fallbackBtnText: { color: 'white', fontWeight: '700' },
//   mapContainer: { width: '100%', overflow: 'hidden', backgroundColor: '#E8EEF7' },
//   map: { flex: 1, backgroundColor: '#E8EEF7' },
//   mapBackButton: { position: 'absolute', top: Platform.OS === 'ios' ? 54 : 22, left: 14, width: 42, height: 42, borderRadius: 25, backgroundColor: 'rgba(255,255,255,0.96)', alignItems: 'center', justifyContent: 'center' },
//   markerWrapper: { alignItems: 'center' },
//   pinBubble: { width: 28, height: 28, borderRadius: 14, borderWidth: 3, borderColor: 'white', alignItems: 'center', justifyContent: 'center', shadowColor: '#000', shadowOffset: { width: 0, height: 3 }, shadowOpacity: 0.25, shadowRadius: 4, elevation: 5 },
//   pinPointer: { width: 0, height: 0, backgroundColor: 'transparent', borderStyle: 'solid', borderLeftWidth: 7, borderRightWidth: 7, borderTopWidth: 10, borderLeftColor: 'transparent', borderRightColor: 'transparent', marginTop: -2 },
//   pinIcon: { fontSize: 11, fontWeight: '800', color: 'white', textAlign: 'center', lineHeight: 18 },
//   pinLabelBubble: { backgroundColor: 'rgba(0,0,0,0.75)', borderRadius: 8, paddingHorizontal: 8, paddingVertical: 3, marginTop: 4 },
//   pinLabelText: { color: 'white', fontSize: 10, fontWeight: '700' },
//   pinLabelBubbleYellow: { backgroundColor: 'rgba(113, 63, 18, 0.9)', borderRadius: 8, paddingHorizontal: 8, paddingVertical: 3, marginTop: 4 },
//   pinLabelTextYellow: { color: '#FACC15', fontSize: 10, fontWeight: '700' },
//   drawer: { position: 'absolute', bottom: 0, left: 0, right: 0, backgroundColor: '#F4F5F7', borderTopLeftRadius: 28, borderTopRightRadius: 28, overflow: 'hidden' },
//   handleWrap: { alignItems: 'center', paddingTop: 10, paddingBottom: 8, backgroundColor: '#F4F5F7' },
//   handleHitArea: { paddingHorizontal: 40, paddingVertical: 10, alignItems: 'center', justifyContent: 'center' },
//   handleBar: { width: 64, height: 6, borderRadius: 99, backgroundColor: '#CDD2D8' },
//   collapsedSummary: { paddingHorizontal: 16, paddingTop: 4, paddingBottom: 12 },
//   collapsedTopRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: 12 },
//   collapsedDriver: { fontSize: 16, fontWeight: '800', color: Colors.dark },
//   collapsedSub: { marginTop: 2, fontSize: 12, color: Colors.gray, fontWeight: '600' },
//   collapsedPriceWrap: { alignItems: 'flex-end' },
//   collapsedPrice: { fontSize: 18, fontWeight: '900', color: Colors.dark },
//   collapsedPerSeat: { fontSize: 10, color: Colors.gray, fontWeight: '600' },
//   drawerScroll: { flex: 1 },
//   drawerContent: { paddingHorizontal: 16, paddingBottom: 16 },
//   driverCard: { backgroundColor: 'white', borderRadius: 20, padding: 16, marginBottom: 14, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 8, elevation: 2 },
//   driverTopRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
//   driverLeftWrap: { flexDirection: 'row', flex: 1, paddingRight: 10 },
//   driverAvatar: { width: 56, height: 56, borderRadius: 28, backgroundColor: '#E5E7EB', overflow: 'hidden', alignItems: 'center', justifyContent: 'center', marginRight: 12 },
//   avatarImg: { width: 56, height: 56, borderRadius: 28 },
//   avatarText: { fontSize: 15, fontWeight: '800', color: Colors.gray },
//   svgAvatarContainer: { width: 56, height: 56, borderRadius: 28, overflow: 'hidden', alignItems: 'center', justifyContent: 'center', backgroundColor: '#E5E7EB' },
//   driverMeta: { flex: 1 },
//   driverNameRow: { flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap', gap: 6 },
//   driverName: { fontSize: 17, fontWeight: '800', color: Colors.dark },
//   verifiedBadge: { flexDirection: 'row', alignItems: 'center', gap: 4 },
//   verifiedBadgeText: { fontSize: 11, color: '#2457A6', fontWeight: '700' },
//   ratingRow: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 6 },
//   ratingText: { fontSize: 13, color: Colors.dark, fontWeight: '700' },
//   chatButtonCircle: { width: 42, height: 42, borderRadius: 21, backgroundColor: '#EAF1FF', alignItems: 'center', justifyContent: 'center' },
//   driverBio: { marginTop: 12, fontSize: 14, lineHeight: 20, color: Colors.gray },
//   profileOutlineBtn: { marginTop: 14, borderWidth: 1, borderColor: '#2457A6', borderRadius: 16, paddingVertical: 12, alignItems: 'center' },
//   profileOutlineBtnText: { color: '#2457A6', fontWeight: '700', fontSize: 14 },
//   cardSection: { backgroundColor: 'white', borderRadius: 20, padding: 16, marginBottom: 14, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 8, elevation: 2 },
//   sectionTitle: { fontSize: 16, fontWeight: '800', color: Colors.dark, marginBottom: 14 },
//   currentBookingText: { fontSize: 12, color: Colors.primary, marginBottom: 10, fontWeight: '600' },
//   tripTimelineWrap: { flexDirection: 'row' },
//   timelineRail: { width: 18, alignItems: 'center', marginTop: 4 },
//   timelineDot: { width: 10, height: 10, borderRadius: 5 },
//   timelineLine: { width: 2, flex: 1, backgroundColor: '#D8DCE3', marginVertical: 6 },
//   timelineContent: { flex: 1, paddingLeft: 8 },
//   timelineItem: { marginBottom: 14 },
//   timelineLabel: { fontSize: 12, color: Colors.gray, fontWeight: '700' },
//   timelinePlace: { fontSize: 15, color: Colors.dark, fontWeight: '700', marginTop: 4 },
//   timelineMetaRow: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 6 },
//   timelineMetaText: { fontSize: 12, color: Colors.gray, fontWeight: '600' },
//   vehicleHeaderRow: { flexDirection: 'row', alignItems: 'center' },
//   vehicleIconCircle: { width: 42, height: 42, borderRadius: 21, backgroundColor: '#EAF1FF', alignItems: 'center', justifyContent: 'center', marginRight: 12 },
//   vehicleMeta: { flex: 1 },
//   vehicleTitle: { fontSize: 15, fontWeight: '800', color: Colors.dark },
//   vehicleSub: { marginTop: 3, fontSize: 12, color: Colors.gray, fontWeight: '600' },
//   vehicleRegContainer: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 6, paddingTop: 6, borderTopWidth: 1, borderTopColor: '#F0F0F0' },
//   vehicleRegText: { fontSize: 11, color: '#6B7280', fontWeight: '500' },
//   tagRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 14 },
//   preferenceTag: { paddingHorizontal: 12, paddingVertical: 8, borderRadius: 999, backgroundColor: '#FFF3E8' },
//   preferenceTagText: { fontSize: 12, color: '#C65D00', fontWeight: '700' },
//   emptyText: { fontSize: 13, color: Colors.gray, fontWeight: '600' },
//   priceRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
//   priceLabel: { fontSize: 14, color: Colors.gray, fontWeight: '500' },
//   priceValue: { fontSize: 14, color: Colors.dark, fontWeight: '700' },
//   priceDivider: { height: 1, backgroundColor: '#ECEEF2', marginVertical: 8 },
//   totalLabel: { fontSize: 15, color: Colors.dark, fontWeight: '800' },
//   totalValue: { fontSize: 15, color: '#2457A6', fontWeight: '800' },
//   noticeBox: { marginTop: 12, backgroundColor: '#FFF2E9', borderRadius: 14, padding: 12 },
//   noticeText: { fontSize: 12.5, color: Colors.dark, lineHeight: 18 },
//   noticeBold: { fontWeight: '800' },
//   seatSelectorRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: '#FAFAFB', borderRadius: 18, padding: 14 },
//   seatActionBtn: { width: 38, height: 38, borderRadius: 12, borderWidth: 1, borderColor: '#D6DDE7', alignItems: 'center', justifyContent: 'center', backgroundColor: 'white' },
//   seatCountWrap: { flexDirection: 'row', alignItems: 'baseline' },
//   seatCountText: { fontSize: 28, fontWeight: '900', color: Colors.dark },
//   seatAvailableText: { fontSize: 13, color: Colors.gray, marginLeft: 6, fontWeight: '600' },
//   simpleInfoLeft: { flexDirection: 'row', alignItems: 'center', gap: 8 },
//   safetyCard: { backgroundColor: '#FFF3E7', borderRadius: 18, padding: 16, marginBottom: 14 },
//   safetyTitle: { fontSize: 14, color: '#2457A6', fontWeight: '800' },
//   safetySub: { marginTop: 2, fontSize: 12, color: '#2457A6', opacity: 0.9, fontWeight: '600' },
//   bottomBar: { position: 'absolute', left: 0, right: 0, bottom: 0, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 16, paddingTop: 12, paddingBottom: Platform.OS === 'ios' ? 28 : 16, backgroundColor: 'white', borderTopWidth: 1, borderTopColor: '#ECEEF2' },
//   bottomCaption: { fontSize: 12, color: Colors.gray, fontWeight: '500' },
//   bottomTotal: { fontSize: 26, color: Colors.dark, fontWeight: '900', marginTop: 2 },
//   bookNowBtn: { backgroundColor: '#FF7A00', paddingHorizontal: 24, paddingVertical: 14, borderRadius: 22, minWidth: 128, alignItems: 'center', justifyContent: 'center' },
//   bookNowBtnDisabled: { opacity: 0.7 },
//   bookNowText: { color: 'white', fontSize: 16, fontWeight: '800' },
//   loaderContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#fff' },
//   modalBackdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.9)', justifyContent: 'center', alignItems: 'center' },
//   imageModalContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', width: '100%' },
//   imageModalContent: { width: '90%', backgroundColor: Colors.white, borderRadius: 20, overflow: 'hidden', maxHeight: '80%' },
//   imageModalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 16, borderBottomWidth: 1, borderBottomColor: '#EEF2F7' },
//   imageModalTitle: { fontSize: 18, fontWeight: '700', color: Colors.dark },
//   fullProfileImage: { width: '100%', height: 400, backgroundColor: '#F5F5F5' },
//   modalSvgContainer: { width: '100%', height: 400, backgroundColor: '#F5F5F5', alignItems: 'center', justifyContent: 'center' },
//   noImageContainer: { width: '100%', height: 400, justifyContent: 'center', alignItems: 'center', backgroundColor: '#F5F5F5' },
//   noImageText: { fontSize: 16, color: Colors.gray },
// });
// import React, { useMemo, useRef, useState, useEffect, useCallback } from 'react';
// import {
//   View,
//   Text,
//   StyleSheet,
//   TouchableOpacity,
//   ScrollView,
//   Platform,
//   StatusBar,
//   Image,
//   Dimensions,
//   Animated,
//   PanResponder,
//   Modal
// } from 'react-native';
// import MapView, { Marker, Polyline, PROVIDER_GOOGLE } from 'react-native-maps';
// import { Ionicons } from '@expo/vector-icons';
// import LottieView from "lottie-react-native";
// import { SvgCssUri } from 'react-native-svg/css';
// import { Colors } from '../constants/Colors';
// import { useAuth } from '../context/AuthContext';
// import { API_BASE_URL } from '../config/config_ip';
// import CustomAlert from '../components/CustomAlert';
// import { useFocusEffect } from '@react-navigation/native';

// const { height } = Dimensions.get('window');
// const SAFE_TOP = Platform.OS === 'ios' ? 56 : 24;
// const COLLAPSED_HEIGHT = 84;
// const EXPANDED_HEIGHT = height * 0.72;

// function buildImageUrl(url) {
//   if (!url) return null;
//   if (url.startsWith('http://') || url.startsWith('https://')) return url;
//   return `${API_BASE_URL}${url.startsWith('/') ? '' : '/'}${url}`;
// }

// function getDriverInitials(name) {
//   if (!name) return 'D';
//   const parts = name.trim().split(' ').filter(Boolean);
//   if (parts.length > 1) return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
//   return parts[0].slice(0, 2).toUpperCase();
// }

// function parseSuggestedPoint(point) {
//   if (!point) return null;

//   if (Array.isArray(point) && point.length === 2) {
//     return {
//       longitude: Number(point[0]),
//       latitude: Number(point[1]),
//     };
//   }

//   if (point.lng != null && point.lat != null) {
//     return {
//       longitude: Number(point.lng),
//       latitude: Number(point.lat),
//     };
//   }

//   if (point.longitude != null && point.latitude != null) {
//     return {
//       longitude: Number(point.longitude),
//       latitude: Number(point.latitude),
//     };
//   }

//   return null;
// }

// function parseRouteCoordinates(routeCoordinates) {
//   if (!Array.isArray(routeCoordinates)) return [];

//   return routeCoordinates
//     .map((item) => {
//       if (Array.isArray(item) && item.length === 2) {
//         return {
//           longitude: Number(item[0]),
//           latitude: Number(item[1]),
//         };
//       }
//       return parseSuggestedPoint(item);
//     })
//     .filter(Boolean);
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

// function extractAllPreferences(ride, driverTravelPrefs) {
//   let ridePrefs = ride?.preferences;
  
//   if (ridePrefs && typeof ridePrefs === 'string') {
//     try {
//       ridePrefs = JSON.parse(ridePrefs);
//     } catch (e) {
//       ridePrefs = null;
//     }
//   }
  
//   if (ridePrefs && typeof ridePrefs === 'object' && Object.keys(ridePrefs).length > 0) {
//     return extractFromObject(ridePrefs);
//   }
  
//   if (driverTravelPrefs && typeof driverTravelPrefs === 'object' && Object.keys(driverTravelPrefs).length > 0) {
//     return extractFromObject(driverTravelPrefs);
//   }
  
//   return [];
// }

// function extractFromObject(prefs) {
//   const allPreferences = [];

//   Object.entries(prefs).forEach(([key, value]) => {
//     if (value === null || value === undefined) return;
    
//     const formattedKey = key.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
    
//     if (typeof value === 'boolean') {
//       if (value === true) {
//         allPreferences.push(formattedKey);
//       }
//     } 
//     else if (Array.isArray(value)) {
//       if (value.length > 0) {
//         allPreferences.push(`${formattedKey}: ${value.join(', ')}`);
//       }
//     }
//     else if (typeof value === 'object') {
//       const nestedPrefs = extractFromObject(value);
//       allPreferences.push(...nestedPrefs);
//     }
//     else if (typeof value === 'string' && value.trim()) {
//       const lowerValue = value.toLowerCase();
//       if (!['false', 'no', 'none', 'null', 'undefined'].includes(lowerValue)) {
//         allPreferences.push(`${formattedKey}: ${value}`);
//       }
//     }
//     else if (typeof value === 'number') {
//       allPreferences.push(`${formattedKey}: ${value}`);
//     }
//   });

//   return [...new Set(allPreferences)];
// }

// function GenericPreferenceTag({ label }) {
//   if (!label || label.trim() === '') return null;
  
//   let tagColor = '#FFF3E8';
//   let textColor = '#C65D00';
  
//   const lowerLabel = label.toLowerCase();
  
//   if (lowerLabel.includes('age') || lowerLabel.includes('category')) {
//     tagColor = '#E8F5E9';
//     textColor = '#2E7D32';
//   } else if (lowerLabel.includes('chat') || lowerLabel.includes('talk')) {
//     tagColor = '#E3F2FD';
//     textColor = '#1565C0';
//   } else if (lowerLabel.includes('gender')) {
//     tagColor = '#F3E5F5';
//     textColor = '#6A1B9A';
//   } else if (lowerLabel.includes('language') || lowerLabel.includes('speak')) {
//     tagColor = '#FFF9C4';
//     textColor = '#F57F17';
//   } else if (lowerLabel.includes('verified')) {
//     tagColor = '#E8F5E9';
//     textColor = '#2E7D32';
//   }
  
//   return (
//     <View style={[styles.preferenceTag, { backgroundColor: tagColor }]}>
//       <Text style={[styles.preferenceTagText, { color: textColor }]}>{label}</Text>
//     </View>
//   );
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
//                   />
//                 </View>
//               ) : (
//                 <Image
//                   source={{ uri: imageUrl }}
//                   style={styles.fullProfileImage}
//                   resizeMode="contain"
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

// export default function RideDetailScreen({ navigation, route }) {
//   const { user, isAuthenticated } = useAuth();
//   const { ride, searchData } = route.params || {};

//   const [seatsRequested, setSeatsRequested] = useState(1);
//   const [requestLoading, setRequestLoading] = useState(false);
//   const [drawerExpanded, setDrawerExpanded] = useState(true);
//   const [driverProfile, setDriverProfile] = useState(null);
//   const [isVerified, setIsVerified] = useState(false);
//   const [loadingProfile, setLoadingProfile] = useState(false);
//   const [mapReady, setMapReady] = useState(false);
//   const [userBooking, setUserBooking] = useState(null);
//   const animatedDrawer = useRef(new Animated.Value(1)).current;
//   const mapRef = useRef(null);
  
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

//   const showConfirmationAlert = (title, message, onConfirm) => {
//     setAlertConfig({
//       title,
//       message,
//       icon: "warning",
//       iconColor: "#F59E0B",
//       buttons: [
//         { text: 'Cancel', onPress: () => setAlertVisible(false), style: 'cancel' },
//         { text: 'Login', onPress: () => {
//           setAlertVisible(false);
//           onConfirm();
//         }, style: 'destructive' }
//       ]
//     });
//     setAlertVisible(true);
//   };

//   // Function to check if user already has a booking for this ride
//   const checkUserBooking = useCallback(async () => {
//     if (!user?.phone_number || !ride?.id) return;
    
//     try {
//       const response = await fetch(`${API_BASE_URL}/my-rides/${user.phone_number}`);
//       const data = await response.json();
      
//       const booking = data.requested_rides?.find(
//         b => b.ride_id === ride.id && b.status === 'accepted'
//       );
      
//       if (booking) {
//         setUserBooking(booking);
//         setSeatsRequested(booking.seats_requested);
//         console.log('📦 Found existing booking:', booking);
//       }
//     } catch (error) {
//       console.log('Error checking user booking:', error);
//     }
//   }, [user?.phone_number, ride?.id]);

//   const loadDriverData = useCallback(async () => {
//     const driverPhone = ride?.phoneNumber;
//     const driverUserId = ride?.driverUserId;
    
//     if (driverPhone || driverUserId) {
//       setLoadingProfile(true);
      
//       try {
//         const profileData = await fetchDriverProfile(driverPhone, driverUserId);
//         if (profileData?.success && profileData.user) {
//           setDriverProfile(profileData.user);
//         } else {
//           setDriverProfile(null);
//         }
        
//         let verified = false;
//         if (driverPhone) {
//           const docsData = await fetchUserDocuments(driverPhone);
//           if (docsData?.success && docsData.documents) {
//             const verifiedDocs = docsData.documents.filter(doc => {
//               const status = doc.status?.toUpperCase();
//               return status === 'APPROVED' && ['aadhar', 'dl', 'rc'].includes(doc.document_type?.toLowerCase());
//             });
//             verified = verifiedDocs.length > 0;
//             setIsVerified(verified);
//           }
//         }
//       } catch (error) {
//         console.log('Error loading driver data:', error);
//       } finally {
//         setLoadingProfile(false);
//       }
//     }
//   }, [ride?.phoneNumber, ride?.driverUserId]);

//   useFocusEffect(
//     useCallback(() => {
//       loadDriverData();
//       checkUserBooking();
//     }, [loadDriverData, checkUserBooking])
//   );

//   useEffect(() => {
//     if (!isAuthenticated) {
//       showConfirmationAlert(
//         'Login Required',
//         'Please login to book rides or chat with drivers.',
//         () => navigation.navigate('Login')
//       );
//       navigation.goBack();
//     }
//   }, [isAuthenticated, navigation]);

//   const getProfilePhotoUrl = useCallback(() => {
//     const rawUrl = driverProfile?.profile_picture || ride?.profilePicture;
//     if (!rawUrl) return null;
//     return buildImageUrl(rawUrl);
//   }, [driverProfile, ride]);
  
//   const profilePhotoUrl = getProfilePhotoUrl();
//   const avatarText = getDriverInitials(driverProfile?.full_name || ride?.driverName || 'Driver');
//   const isProfilePhotoSvg = profilePhotoUrl ? profilePhotoUrl.toLowerCase().includes('.svg') : false;
  
//   const allPreferences = useMemo(() => {
//     return extractAllPreferences(ride, driverProfile?.travel_preferences);
//   }, [ride, driverProfile]);

//   const driverStart = useMemo(() => {
//     const coords = ride?.routeCoordinates;
//     if (Array.isArray(coords) && coords.length > 0) {
//       const first = coords[0];
//       if (Array.isArray(first) && first.length === 2) {
//         return { latitude: first[1], longitude: first[0] };
//       }
//     }
//     return parseSuggestedPoint(ride?.suggestedPickup);
//   }, [ride]);

//   const driverEnd = useMemo(() => {
//     const coords = ride?.routeCoordinates;
//     if (Array.isArray(coords) && coords.length > 0) {
//       const last = coords[coords.length - 1];
//       if (Array.isArray(last) && last.length === 2) {
//         return { latitude: last[1], longitude: last[0] };
//       }
//     }
//     return parseSuggestedPoint(ride?.suggestedDrop);
//   }, [ride]);

//   const intersectionPickup = useMemo(
//     () => parseSuggestedPoint(ride?.suggestedPickup),
//     [ride]
//   );
//   const intersectionDrop = useMemo(
//     () => parseSuggestedPoint(ride?.suggestedDrop),
//     [ride]
//   );

//   const userPickup = useMemo(() => {
//     if (!searchData?.fromCoords) return null;
//     const c = searchData.fromCoords;
//     if (Array.isArray(c) && c.length === 2) {
//       return { latitude: c[1], longitude: c[0] };
//     }
//     return null;
//   }, [searchData]);

//   const userDrop = useMemo(() => {
//     if (!searchData?.toCoords) return null;
//     const c = searchData.toCoords;
//     if (Array.isArray(c) && c.length === 2) {
//       return { latitude: c[1], longitude: c[0] };
//     }
//     return null;
//   }, [searchData]);

//   const routePath = useMemo(() => {
//     const fullRoute = parseRouteCoordinates(ride?.routeCoordinates);
//     if (fullRoute.length >= 2) return fullRoute;
//     if (intersectionPickup && intersectionDrop) return [intersectionPickup, intersectionDrop];
//     return [];
//   }, [ride, intersectionPickup, intersectionDrop]);

//   const walkToPickupPath = useMemo(() => {
//     if (userPickup && intersectionPickup) return [userPickup, intersectionPickup];
//     return [];
//   }, [userPickup, intersectionPickup]);

//   const walkFromDropPath = useMemo(() => {
//     if (userDrop && intersectionDrop) return [intersectionDrop, userDrop];
//     return [];
//   }, [userDrop, intersectionDrop]);

//   const allMarkerCoords = useMemo(() => {
//     const coords = [];
//     if (driverStart) coords.push(driverStart);
//     if (driverEnd) coords.push(driverEnd);
//     if (userPickup) coords.push(userPickup);
//     if (userDrop) coords.push(userDrop);
//     if (intersectionPickup) coords.push(intersectionPickup);
//     if (intersectionDrop) coords.push(intersectionDrop);
//     return coords;
//   }, [driverStart, driverEnd, userPickup, userDrop, intersectionPickup, intersectionDrop]);

//   const fitMapToMarkers = useCallback(() => {
//     if (mapRef.current && mapReady && allMarkerCoords.length >= 2) {
//       setTimeout(() => {
//         try {
//           mapRef.current.fitToCoordinates(allMarkerCoords, {
//             edgePadding: { top: 80, right: 50, bottom: 50, left: 50 },
//             animated: true,
//           });
//         } catch (e) {
//           console.log('fitToCoordinates error:', e);
//         }
//       }, 500);
//     }
//   }, [mapReady, allMarkerCoords]);

//   useEffect(() => {
//     if (mapReady && allMarkerCoords.length >= 2) {
//       fitMapToMarkers();
//     }
//   }, [mapReady, allMarkerCoords, fitMapToMarkers]);

//   const vehicleName = driverProfile?.vehicle 
//     ? [driverProfile.vehicle.model].filter(Boolean).join(' ')
//     : [ride?.vehicle?.model].filter(Boolean).join(' ') || 'Vehicle details unavailable';
  
//   const vehicleRegNumber = driverProfile?.vehicle?.registration_number || 
//                            ride?.vehicle?.registration_number || 
//                            null;
  
//   const vehicleColor = driverProfile?.vehicle?.color || 
//                        ride?.vehicle?.color || 
//                        'Not specified';

//   const totalPrice = Number(ride?.price || 0) * seatsRequested;

//   const handleProfileImagePress = () => {
//     if (profilePhotoUrl) {
//       setSelectedProfile({
//         visible: true,
//         imageUrl: profilePhotoUrl,
//         driverName: driverProfile?.full_name || ride?.driverName || 'Driver',
//       });
//     } else {
//       showCustomAlert('No Photo', 'Driver has not uploaded a profile picture', 'warning');
//     }
//   };

//   const mapHeight = animatedDrawer.interpolate({
//     inputRange: [0, 1],
//     outputRange: [height - SAFE_TOP - COLLAPSED_HEIGHT, height * 0.32],
//   });

//   const drawerHeight = animatedDrawer.interpolate({
//     inputRange: [0, 1],
//     outputRange: [COLLAPSED_HEIGHT, EXPANDED_HEIGHT],
//   });

//   const toggleDrawer = () => {
//     const nextExpanded = !drawerExpanded;
//     setDrawerExpanded(nextExpanded);

//     Animated.timing(animatedDrawer, {
//       toValue: nextExpanded ? 1 : 0,
//       duration: 260,
//       useNativeDriver: false,
//     }).start();
//   };

//   const panResponder = useRef(
//     PanResponder.create({
//       onMoveShouldSetPanResponder: (_, gestureState) =>
//         Math.abs(gestureState.dy) > 5,
//       onPanResponderMove: (_, gestureState) => {
//         const dragRange = EXPANDED_HEIGHT - COLLAPSED_HEIGHT;
//         const progress = drawerExpanded
//           ? 1 - (gestureState.dy / dragRange)
//           : gestureState.dy / dragRange;
//         const clamped = Math.max(0, Math.min(1, progress));
//         animatedDrawer.setValue(clamped);
//       },
//       onPanResponderRelease: (_, gestureState) => {
//         const dragRange = EXPANDED_HEIGHT - COLLAPSED_HEIGHT;
//         const threshold = dragRange * 0.2;
//         if (drawerExpanded) {
//           if (gestureState.dy > threshold) {
//             setDrawerExpanded(false);
//             Animated.timing(animatedDrawer, {
//               toValue: 0,
//               duration: 200,
//               useNativeDriver: false,
//             }).start();
//           } else {
//             setDrawerExpanded(true);
//             Animated.timing(animatedDrawer, {
//               toValue: 1,
//               duration: 200,
//               useNativeDriver: false,
//             }).start();
//           }
//         } else {
//           if (gestureState.dy < -threshold) {
//             setDrawerExpanded(true);
//             Animated.timing(animatedDrawer, {
//               toValue: 1,
//               duration: 200,
//               useNativeDriver: false,
//             }).start();
//           } else {
//             setDrawerExpanded(false);
//             Animated.timing(animatedDrawer, {
//               toValue: 0,
//               duration: 200,
//               useNativeDriver: false,
//             }).start();
//           }
//         }
//       },
//     })
//   ).current;

//   const checkPassengerOverlap = async (departureTime, durationMinutes = 60) => {
//     try {
//       if (!user?.phone_number) return false;
      
//       const url = `${API_BASE_URL}/check-passenger-overlap?phone_number=${encodeURIComponent(user.phone_number)}&departure_time=${departureTime.toISOString()}&duration_minutes=${durationMinutes}`;
      
//       const response = await fetch(url);
//       const data = await response.json();
      
//       if (data.has_overlap) {
//         const overlap = data.overlapping_booking;
//         showCustomAlert(
//           'Overlapping Ride',
//           `You already have a confirmed booking for a ride from ${overlap.origin} to ${overlap.destination} at ${new Date(overlap.departure_time).toLocaleTimeString()}. Please complete that ride before booking another.`,
//           'warning'
//         );
//         return true;
//       }
//       return false;
//     } catch (error) {
//       console.log('Error checking passenger overlap:', error);
//       return false;
//     }
//   };

//   // Function to modify existing booking seats
//   const handleModifySeats = async (newSeatCount) => {
//     if (!user?.phone_number) {
//       showCustomAlert('Login Required', 'Please log in to modify booking.', 'warning');
//       return;
//     }

//     if (!userBooking) {
//       return;
//     }

//     // Check if requested seats exceed available seats
//     const availableSeats = ride?.seatsAvailable || 0;
//     const totalAvailable = availableSeats + userBooking.seats_requested;
    
//     if (newSeatCount > totalAvailable) {
//       showCustomAlert(
//         'Not Enough Seats',
//         `Only ${totalAvailable} total seats available. You currently have ${userBooking.seats_requested} seat(s). You can add up to ${availableSeats} more seat(s).`,
//         'warning'
//       );
//       return;
//     }

//     if (newSeatCount < 1) {
//       showCustomAlert('Invalid Seats', 'You must book at least 1 seat.', 'warning');
//       return;
//     }

//     setRequestLoading(true);
//     try {
//       const response = await fetch(`${API_BASE_URL}/booking/${userBooking.id}/modify-seats`, {
//         method: 'PUT',
//         headers: { 
//           'Content-Type': 'application/json',
//           'Accept': 'application/json'
//         },
//         body: JSON.stringify({ new_seats: newSeatCount }),
//       });

//       const data = await response.json();

//       if (!response.ok) {
//         throw new Error(data.detail || data.message || 'Failed to modify booking');
//       }

//       showCustomAlert('Success', data.message || 'Booking updated successfully', 'success');
//       setUserBooking({ ...userBooking, seats_requested: newSeatCount });
      
//       setTimeout(() => navigation.goBack(), 1500);
//     } catch (error) {
//       console.error('Modify booking error:', error);
//       showCustomAlert('Error', error.message || 'Failed to modify booking', 'error');
//     } finally {
//       setRequestLoading(false);
//     }
//   };

//   const handleRequestJoin = async () => {
//     if (!user?.phone_number) {
//       showCustomAlert('Login Required', 'Please log in to request a ride.', 'warning');
//       return;
//     }

//     // If user already has a booking for this ride, modify seats instead
//     if (userBooking) {
//       await handleModifySeats(seatsRequested);
//       return;
//     }

//     if (ride?.womenOnly === true && user?.gender !== 'female') {
//       showCustomAlert(
//         'Not Available', 
//         'This ride is for women passengers only. Please search for other rides.',
//         'warning'
//       );
//       return;
//     }

//     const availableSeats = ride?.seatsAvailable || 0;
//     if (seatsRequested > availableSeats) {
//       showCustomAlert(
//         'Not Enough Seats',
//         `Only ${availableSeats} seat${availableSeats !== 1 ? 's' : ''} left in this ride. Please reduce your seat request.`,
//         'warning'
//       );
//       return;
//     }

//     let rideDateTime;
//     if (ride?.date && ride?.time) {
//       rideDateTime = new Date(`${ride.date} ${ride.time}`);
//     } else if (ride?.departure_time) {
//       rideDateTime = new Date(ride.departure_time);
//     } else {
//       rideDateTime = new Date();
//     }
    
//     let durationMinutes = 60;
//     if (ride?.durationMinutes) {
//       durationMinutes = ride.durationMinutes;
//     } else if (ride?.durationText) {
//       const match = ride.durationText.match(/\d+/);
//       if (match) durationMinutes = parseInt(match[0]);
//     }
    
//     const hasOverlap = await checkPassengerOverlap(rideDateTime, durationMinutes);
//     if (hasOverlap) {
//       return;
//     }

//     setRequestLoading(true);
//     try {
//       const payload = {
//         ride_id: ride.id,
//         passenger_phone: user.phone_number,
//         seats_requested: seatsRequested,
//       };

//       if (searchData?.fromCoords && Array.isArray(searchData.fromCoords)) {
//         payload.from_coords = searchData.fromCoords;
//       }
//       if (searchData?.toCoords && Array.isArray(searchData.toCoords)) {
//         payload.to_coords = searchData.toCoords;
//       }

//       const response = await fetch(`${API_BASE_URL}/ride-bookings`, {
//         method: 'POST',
//         headers: { 
//           'Content-Type': 'application/json',
//           'Accept': 'application/json'
//         },
//         body: JSON.stringify(payload),
//       });

//       const raw = await response.text();
//       let data = {};
//       try {
//         data = raw ? JSON.parse(raw) : {};
//       } catch {
//         data.detail = raw;
//       }

//       if (!response.ok) {
//         throw new Error(data.detail || data.message || `Server error (${response.status})`);
//       }

//       showCustomAlert('Success', data.message || 'Ride request sent successfully', 'success');
//       setTimeout(() => navigation.goBack(), 1500);
//     } catch (error) {
//       console.error('Booking error:', error);
//       showCustomAlert('Error', error.message || 'Failed to send request', 'error');
//     } finally {
//       setRequestLoading(false);
//     }
//   };

//   const viewDriverProfile = () => {
//     const driverPhone = ride?.phoneNumber;
//     const driverUserId = ride?.driverUserId;
    
//     if (driverPhone || driverUserId) {
//       navigation.navigate('ViewProfileScreen', {
//         userId: driverUserId || null,
//         phoneNumber: driverPhone || null,
//         driverName: driverProfile?.full_name || ride?.driverName || 'Driver',
//         profilePicture: profilePhotoUrl,
//         vehicleNumber: vehicleRegNumber,
//         vehicleModel: vehicleName,
//         driverRating: driverProfile?.avg_rating || ride?.rating || 0,
//       });
//     } else {
//       showCustomAlert('Profile', 'Driver profile not available', 'warning');
//     }
//   };

//   const getOrCreateConversation = async (receiverPhone, rideId) => {
//     try {
//       const myPhone = user?.phone_number;
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
//         body: JSON.stringify({ participant_phone: receiverPhone, ride_id: rideId }),
//       });
//       const data = await response.json();
//       if (data.success) {
//         return data.conversation.id;
//       }
//       return null;
//     } catch (error) {
//       console.error('getOrCreateConversation error:', error);
//       return null;
//     }
//   };

//   const startChat = async () => {
//     const driverPhone = ride?.phoneNumber;
//     if (driverPhone) {
//       const conversationId = await getOrCreateConversation(driverPhone, ride.id);
//       if (conversationId) {
//         navigation.navigate('ChatScreen', {
//           receiverPhone: driverPhone,
//           conversationId,
//           user: {
//             name: driverProfile?.full_name || ride?.driverName || 'Driver',
//             tripInfo: `${ride.from || 'Pickup'} → ${ride.to || 'Drop'}`,
//           },
//         });
//       } else {
//         showCustomAlert('Chat', 'Unable to start chat. Please try again.', 'error');
//       }
//     } else {
//       showCustomAlert('Chat', 'Driver contact not available', 'warning');
//     }
//   };

//   if (requestLoading || loadingProfile) {
//     return (
//       <View style={styles.loaderContainer}>
//         <LottieView
//           source={require("../assets/loading.json")}
//           autoPlay
//           loop
//           style={{ width: 300, height: 300 }}
//         />
//       </View>
//     );
//   }

//   if (!ride) {
//     return (
//       <View style={styles.centerContainer}>
//         <Text style={styles.errorText}>No ride data available</Text>
//         <TouchableOpacity
//           onPress={() => navigation.goBack()}
//           style={styles.fallbackBtn}
//         >
//           <Text style={styles.fallbackBtnText}>Go Back</Text>
//         </TouchableOpacity>
//       </View>
//     );
//   }

//   const initialRegion = {
//     latitude: intersectionPickup?.latitude || driverStart?.latitude || 28.6139,
//     longitude: intersectionPickup?.longitude || driverStart?.longitude || 77.2090,
//     latitudeDelta: 0.05,
//     longitudeDelta: 0.05,
//   };

//   const maxAvailableSeats = userBooking 
//     ? (ride.seatsAvailable + userBooking.seats_requested)
//     : (ride.seatsAvailable || 1);

//   return (
//     <View style={styles.container}>
//       <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />

//       <Animated.View style={[styles.mapContainer, { height: mapHeight }]}>
//         <MapView
//           ref={mapRef}
//           provider={PROVIDER_GOOGLE}
//           style={styles.map}
//           initialRegion={initialRegion}
//           onMapReady={() => setMapReady(true)}
//           showsUserLocation={false}
//           showsMyLocationButton={false}
//           zoomEnabled={true}
//           zoomControlEnabled={true}
//         >
//           {routePath.length >= 2 && (
//             <Polyline
//               coordinates={routePath}
//               strokeColor="#2457A6"
//               strokeWidth={5}
//               lineCap="round"
//               lineJoin="round"
//             />
//           )}

//           {driverStart && (
//             <Marker coordinate={driverStart} anchor={{ x: 0.5, y: 1 }}>
//               <View style={styles.markerWrapper}>
//                 <View style={[styles.pinBubble, { backgroundColor: '#16A34A' }]}>
//                   <Text style={styles.pinIcon}>S</Text>
//                 </View>
//                 <View style={[styles.pinPointer, { borderTopColor: '#16A34A' }]} />
//               </View>
//             </Marker>
//           )}

//           {driverEnd && (
//             <Marker coordinate={driverEnd} anchor={{ x: 0.5, y: 1 }}>
//               <View style={styles.markerWrapper}>
//                 <View style={[styles.pinBubble, { backgroundColor: '#DC2626' }]}>
//                   <Text style={styles.pinIcon}>E</Text>
//                 </View>
//                 <View style={[styles.pinPointer, { borderTopColor: '#DC2626' }]} />
//               </View>
//             </Marker>
//           )}

//           {userPickup && (
//             <Marker coordinate={userPickup} anchor={{ x: 0.5, y: 1 }}>
//               <View style={styles.markerWrapper}>
//                 <View style={[styles.pinBubble, { backgroundColor: '#3B82F6' }]}>
//                   <Ionicons name="person" size={12} color="white" />
//                 </View>
//                 <View style={[styles.pinPointer, { borderTopColor: '#3B82F6' }]} />
//                 <View style={styles.pinLabelBubble}>
//                   <Text style={styles.pinLabelText}>Your Pickup</Text>
//                 </View>
//               </View>
//             </Marker>
//           )}

//           {userDrop && (
//             <Marker coordinate={userDrop} anchor={{ x: 0.5, y: 1 }}>
//               <View style={styles.markerWrapper}>
//                 <View style={[styles.pinBubble, { backgroundColor: '#F97316' }]}>
//                   <Ionicons name="flag" size={12} color="white" />
//                 </View>
//                 <View style={[styles.pinPointer, { borderTopColor: '#F97316' }]} />
//                 <View style={styles.pinLabelBubble}>
//                   <Text style={styles.pinLabelText}>Your Drop</Text>
//                 </View>
//               </View>
//             </Marker>
//           )}

//           {intersectionPickup && (
//             <Marker coordinate={intersectionPickup} anchor={{ x: 0.5, y: 1 }}>
//               <View style={styles.markerWrapper}>
//                 <View style={[styles.pinBubble, { backgroundColor: '#FACC15' }]}>
//                   <Ionicons name="hand-right" size={12} color="#713F12" />
//                 </View>
//                 <View style={[styles.pinPointer, { borderTopColor: '#FACC15' }]} />
//                 <View style={styles.pinLabelBubbleYellow}>
//                   <Text style={styles.pinLabelTextYellow}>Meet Driver</Text>
//                 </View>
//               </View>
//             </Marker>
//           )}

//           {intersectionDrop && (
//             <Marker coordinate={intersectionDrop} anchor={{ x: 0.5, y: 1 }}>
//               <View style={styles.markerWrapper}>
//                 <View style={[styles.pinBubble, { backgroundColor: '#FACC15' }]}>
//                   <Ionicons name="exit" size={12} color="#713F12" />
//                 </View>
//                 <View style={[styles.pinPointer, { borderTopColor: '#FACC15' }]} />
//                 <View style={styles.pinLabelBubbleYellow}>
//                   <Text style={styles.pinLabelTextYellow}>Exit Here</Text>
//                 </View>
//               </View>
//             </Marker>
//           )}

//           {walkToPickupPath.length >= 2 && (
//             <Polyline
//               coordinates={walkToPickupPath}
//               strokeColor="#FACC15"
//               strokeWidth={4}
//               lineDashPattern={[8, 6]}
//               lineCap="round"
//               lineJoin="round"
//             />
//           )}

//           {walkFromDropPath.length >= 2 && (
//             <Polyline
//               coordinates={walkFromDropPath}
//               strokeColor="#FACC15"
//               strokeWidth={4}
//               lineDashPattern={[8, 6]}
//               lineCap="round"
//               lineJoin="round"
//             />
//           )}
//         </MapView>

//         <TouchableOpacity
//           style={styles.mapBackButton}
//           onPress={() => navigation.goBack()}
//         >
//           <Ionicons name="chevron-back" size={26} color={Colors.secondary} />
//         </TouchableOpacity>
//       </Animated.View>

//       <Animated.View style={[styles.drawer, { height: drawerHeight }]}>
//         <View style={styles.handleWrap} {...panResponder.panHandlers}>
//           <TouchableOpacity
//             activeOpacity={0.9}
//             onPress={toggleDrawer}
//             style={styles.handleHitArea}
//           >
//             <View style={styles.handleBar} />
//           </TouchableOpacity>
//         </View>

//         {!drawerExpanded ? (
//           <View style={styles.collapsedSummary}>
//             <View style={styles.collapsedTopRow}>
//               <View style={{ flex: 1 }}>
//                 <Text style={styles.collapsedDriver} numberOfLines={1}>
//                   {driverProfile?.full_name || ride?.driverName || 'Driver'}
//                 </Text>
//                 <Text style={styles.collapsedSub} numberOfLines={1}>
//                   {ride.from || 'Pickup'} → {ride.to || 'Drop'}
//                 </Text>
//               </View>

//               <View style={styles.collapsedPriceWrap}>
//                 <Text style={styles.collapsedPrice}>₹{ride.price}</Text>
//                 <Text style={styles.collapsedPerSeat}>per seat</Text>
//               </View>
//             </View>
//           </View>
//         ) : (
//           <>
//             <ScrollView
//               style={styles.drawerScroll}
//               contentContainerStyle={styles.drawerContent}
//               showsVerticalScrollIndicator={false}
//             >
//               <View style={styles.driverCard}>
//                 <View style={styles.driverTopRow}>
//                   <View style={styles.driverLeftWrap}>
//                     <TouchableOpacity 
//                       style={styles.driverAvatar} 
//                       onPress={handleProfileImagePress}
//                       activeOpacity={0.8}
//                     >
//                       {profilePhotoUrl ? (
//                         isProfilePhotoSvg ? (
//                           <View style={styles.svgAvatarContainer}>
//                             <SvgCssUri
//                               uri={profilePhotoUrl}
//                               width={56}
//                               height={56}
//                             />
//                           </View>
//                         ) : (
//                           <Image 
//                             source={{ uri: profilePhotoUrl }} 
//                             style={styles.avatarImg}
//                           />
//                         )
//                       ) : (
//                         <Text style={styles.avatarText}>{avatarText}</Text>
//                       )}
//                     </TouchableOpacity>

//                     <View style={styles.driverMeta}>
//                       <View style={styles.driverNameRow}>
//                         <Text style={styles.driverName}>
//                           {driverProfile?.full_name || ride?.driverName || 'Driver'}
//                         </Text>
//                         {isVerified && (
//                           <View style={styles.verifiedBadge}>
//                             <Ionicons name="checkmark-circle" size={12} color="#2457A6" />
//                             <Text style={styles.verifiedBadgeText}>Verified</Text>
//                           </View>
//                         )}
//                       </View>

//                       <View style={styles.ratingRow}>
//                         <Ionicons name="star" size={13} color="#F59E0B" />
//                         <Text style={styles.ratingText}>
//                           {driverProfile?.avg_rating || ride?.rating || 4.5}
//                         </Text>
//                       </View>
//                     </View>
//                   </View>

//                   <TouchableOpacity style={styles.chatButtonCircle} onPress={startChat}>
//                     <Ionicons name="chatbubble-outline" size={20} color="#2457A6" />
//                   </TouchableOpacity>
//                 </View>

//                 <Text style={styles.driverBio}>
//                   {driverProfile?.bio || driverProfile?.about || 'Friendly driver, love meeting new people!'}
//                 </Text>

//                 <TouchableOpacity style={styles.profileOutlineBtn} onPress={viewDriverProfile}>
//                   <Text style={styles.profileOutlineBtnText}>View Full Profile</Text>
//                 </TouchableOpacity>
//               </View>

//               <View style={styles.cardSection}>
//                 <Text style={styles.sectionTitle}>Trip Details</Text>

//                 <View style={styles.tripTimelineWrap}>
//                   <View style={styles.timelineRail}>
//                     <View style={[styles.timelineDot, { backgroundColor: '#2457A6' }]} />
//                     <View style={styles.timelineLine} />
//                     <View style={[styles.timelineDot, { backgroundColor: '#FF7A00' }]} />
//                   </View>

//                   <View style={styles.timelineContent}>
//                     <View style={styles.timelineItem}>
//                       <Text style={styles.timelineLabel}>Pickup</Text>
//                       <Text style={styles.timelinePlace}>
//                         {ride.pickupLabel || ride.from || 'Pickup point'}
//                       </Text>
//                       <View style={styles.timelineMetaRow}>
//                         <Ionicons name="time-outline" size={13} color={Colors.gray} />
//                         <Text style={styles.timelineMetaText}>
//                           {ride.date} at {ride.time}
//                         </Text>
//                       </View>
//                     </View>

//                     <View style={styles.timelineItem}>
//                       <Text style={styles.timelineLabel}>Dropoff</Text>
//                       <Text style={styles.timelinePlace}>
//                         {ride.dropLabel || ride.to || 'Drop point'}
//                       </Text>
//                       <Text style={styles.timelineMetaText}>
//                         Estimated: {ride.durationText || '--'}
//                       </Text>
//                     </View>
//                   </View>
//                 </View>
//               </View>

//               <View style={styles.cardSection}>
//                 <Text style={styles.sectionTitle}>Vehicle Details</Text>

//                 <View style={styles.vehicleHeaderRow}>
//                   <View style={styles.vehicleIconCircle}>
//                     <Ionicons name="car-sport-outline" size={18} color="#2457A6" />
//                   </View>

//                   <View style={styles.vehicleMeta}>
//                     <Text style={styles.vehicleTitle}>{vehicleName}</Text>
//                     <Text style={styles.vehicleSub}>
//                       {vehicleColor} • {ride?.seatsAvailable || 4} seats
//                     </Text>
//                     {vehicleRegNumber && (
//                       <View style={styles.vehicleRegContainer}>
//                         <Text style={styles.vehicleRegText}>
//                           Vehicle Number: {vehicleRegNumber}
//                         </Text>
//                       </View>
//                     )}
//                   </View>
//                 </View>
//               </View>

//               <View style={styles.cardSection}>
//                 <Text style={styles.sectionTitle}>Ride Preferences</Text>
//                 <View style={styles.tagRow}>
//                   {allPreferences.length > 0 ? (
//                     allPreferences.map((pref, index) => (
//                       <GenericPreferenceTag key={`${pref}-${index}`} label={pref} />
//                     ))
//                   ) : (
//                     <Text style={styles.emptyText}>No specific preferences added for this ride</Text>
//                   )}
//                 </View>
//               </View>

//               <View style={styles.cardSection}>
//                 <Text style={styles.sectionTitle}>Cost Breakdown</Text>

//                 <View style={styles.priceRow}>
//                   <Text style={styles.priceLabel}>Base fare (per seat)</Text>
//                   <Text style={styles.priceValue}>₹{ride.price || 0}</Text>
//                 </View>

//                 <View style={styles.priceRow}>
//                   <Text style={styles.priceLabel}>Platform fee</Text>
//                   <Text style={styles.priceValue}>₹0</Text>
//                 </View>

//                 <View style={styles.priceDivider} />

//                 <View style={styles.priceRow}>
//                   <Text style={styles.totalLabel}>Total per seat</Text>
//                   <Text style={styles.totalValue}>₹{ride.price || 0}</Text>
//                 </View>

//                 <View style={styles.noticeBox}>
//                   <Text style={styles.noticeText}>
//                     <Text style={styles.noticeBold}>Cost-share contribution:</Text>{' '}
//                     This is not a commercial fare. You're sharing the travel costs with the driver.
//                   </Text>
//                 </View>
//               </View>

//               <View style={styles.cardSection}>
//                 <Text style={styles.sectionTitle}>
//                   {userBooking ? 'Modify Seats' : 'Select Seats'}
//                 </Text>
//                 {userBooking && (
//                   <View style={styles.currentBookingContainer}>
//                     <Text style={styles.currentBookingText}>
//                       You have already booked {userBooking.seats_requested} seat(s) for this ride.
//                     </Text>
//                     <Text style={styles.currentBookingHint}>
//                       Use the buttons below to increase or decrease your seat count.
//                     </Text>
//                   </View>
//                 )}
//                 <View style={styles.seatSelectorRow}>
//                   <TouchableOpacity
//                     style={styles.seatActionBtn}
//                     onPress={() => {
//                       const newCount = Math.max(1, seatsRequested - 1);
//                       setSeatsRequested(newCount);
//                       if (userBooking) {
//                         handleModifySeats(newCount);
//                       }
//                     }}
//                     disabled={seatsRequested === 1 || requestLoading}
//                   >
//                     <Ionicons name="remove" size={20} color={Colors.gray} />
//                   </TouchableOpacity>

//                   <View style={styles.seatCountWrap}>
//                     <Text style={styles.seatCountText}>{seatsRequested}</Text>
//                     <Text style={styles.seatAvailableText}>
//                       / {maxAvailableSeats} available
//                     </Text>
//                   </View>

//                   <TouchableOpacity
//                     style={styles.seatActionBtn}
//                     onPress={() => {
//                       const newCount = Math.min(maxAvailableSeats, seatsRequested + 1);
//                       setSeatsRequested(newCount);
//                       if (userBooking) {
//                         handleModifySeats(newCount);
//                       }
//                     }}
//                     disabled={seatsRequested === maxAvailableSeats || requestLoading}
//                   >
//                     <Ionicons name="add" size={20} color="#2457A6" />
//                   </TouchableOpacity>
//                 </View>
//                 {userBooking && (
//                   <View style={styles.seatInfoNote}>
//                     <Text style={styles.seatInfoNoteText}>
//                       💡 Tip: You can increase your seats up to the total available seats. 
//                       Additional fare will be calculated automatically.
//                     </Text>
//                   </View>
//                 )}
//               </View>

//               <View style={styles.safetyCard}>
//                 <View style={styles.simpleInfoLeft}>
//                   <Ionicons name="shield-checkmark-outline" size={18} color="#2457A6" />
//                   <View>
//                     <Text style={styles.safetyTitle}>Safety First</Text>
//                     <Text style={styles.safetySub}>Live GPS tracking & 24/7 support</Text>
//                   </View>
//                 </View>
//               </View>

//               <View style={{ height: 110 }} />
//             </ScrollView>

//             <View style={styles.bottomBar}>
//               <View>
//                 <Text style={styles.bottomCaption}>Total for {seatsRequested} seat(s)</Text>
//                 <Text style={styles.bottomTotal}>₹{totalPrice}</Text>
//               </View>

//               <TouchableOpacity
//                 style={[styles.bookNowBtn, requestLoading && styles.bookNowBtnDisabled]}
//                 onPress={handleRequestJoin}
//                 disabled={requestLoading}
//               >
//                 <Text style={styles.bookNowText}>
//                   {userBooking ? 'Update Booking' : 'Book Now'}
//                 </Text>
//               </TouchableOpacity>
//             </View>
//           </>
//         )}
//       </Animated.View>

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
//     </View>
//   );
// }

// const styles = StyleSheet.create({
//   container: { flex: 1, backgroundColor: '#F4F5F7' },
//   centerContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 24 },
//   errorText: { fontSize: 18, color: Colors.gray, marginBottom: 16, textAlign: 'center' },
//   fallbackBtn: { backgroundColor: Colors.primary, paddingHorizontal: 20, paddingVertical: 12, borderRadius: 12 },
//   fallbackBtnText: { color: 'white', fontWeight: '700' },
//   mapContainer: { width: '100%', overflow: 'hidden', backgroundColor: '#E8EEF7' },
//   map: { flex: 1, backgroundColor: '#E8EEF7' },
//   mapBackButton: { position: 'absolute', top: Platform.OS === 'ios' ? 54 : 22, left: 14, width: 42, height: 42, borderRadius: 25, backgroundColor: 'rgba(255,255,255,0.96)', alignItems: 'center', justifyContent: 'center' },
//   markerWrapper: { alignItems: 'center' },
//   pinBubble: { width: 28, height: 28, borderRadius: 14, borderWidth: 3, borderColor: 'white', alignItems: 'center', justifyContent: 'center', shadowColor: '#000', shadowOffset: { width: 0, height: 3 }, shadowOpacity: 0.25, shadowRadius: 4, elevation: 5 },
//   pinPointer: { width: 0, height: 0, backgroundColor: 'transparent', borderStyle: 'solid', borderLeftWidth: 7, borderRightWidth: 7, borderTopWidth: 10, borderLeftColor: 'transparent', borderRightColor: 'transparent', marginTop: -2 },
//   pinIcon: { fontSize: 11, fontWeight: '800', color: 'white', textAlign: 'center', lineHeight: 18 },
//   pinLabelBubble: { backgroundColor: 'rgba(0,0,0,0.75)', borderRadius: 8, paddingHorizontal: 8, paddingVertical: 3, marginTop: 4 },
//   pinLabelText: { color: 'white', fontSize: 10, fontWeight: '700' },
//   pinLabelBubbleYellow: { backgroundColor: 'rgba(113, 63, 18, 0.9)', borderRadius: 8, paddingHorizontal: 8, paddingVertical: 3, marginTop: 4 },
//   pinLabelTextYellow: { color: '#FACC15', fontSize: 10, fontWeight: '700' },
//   drawer: { position: 'absolute', bottom: 0, left: 0, right: 0, backgroundColor: '#F4F5F7', borderTopLeftRadius: 28, borderTopRightRadius: 28, overflow: 'hidden' },
//   handleWrap: { alignItems: 'center', paddingTop: 10, paddingBottom: 8, backgroundColor: '#F4F5F7' },
//   handleHitArea: { paddingHorizontal: 40, paddingVertical: 10, alignItems: 'center', justifyContent: 'center' },
//   handleBar: { width: 64, height: 6, borderRadius: 99, backgroundColor: '#CDD2D8' },
//   collapsedSummary: { paddingHorizontal: 16, paddingTop: 4, paddingBottom: 12 },
//   collapsedTopRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: 12 },
//   collapsedDriver: { fontSize: 16, fontWeight: '800', color: Colors.dark },
//   collapsedSub: { marginTop: 2, fontSize: 12, color: Colors.gray, fontWeight: '600' },
//   collapsedPriceWrap: { alignItems: 'flex-end' },
//   collapsedPrice: { fontSize: 18, fontWeight: '900', color: Colors.dark },
//   collapsedPerSeat: { fontSize: 10, color: Colors.gray, fontWeight: '600' },
//   drawerScroll: { flex: 1 },
//   drawerContent: { paddingHorizontal: 16, paddingBottom: 16 },
//   driverCard: { backgroundColor: 'white', borderRadius: 20, padding: 16, marginBottom: 14, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 8, elevation: 2 },
//   driverTopRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
//   driverLeftWrap: { flexDirection: 'row', flex: 1, paddingRight: 10 },
//   driverAvatar: { width: 56, height: 56, borderRadius: 28, backgroundColor: '#E5E7EB', overflow: 'hidden', alignItems: 'center', justifyContent: 'center', marginRight: 12 },
//   avatarImg: { width: 56, height: 56, borderRadius: 28 },
//   avatarText: { fontSize: 15, fontWeight: '800', color: Colors.gray },
//   svgAvatarContainer: { width: 56, height: 56, borderRadius: 28, overflow: 'hidden', alignItems: 'center', justifyContent: 'center', backgroundColor: '#E5E7EB' },
//   driverMeta: { flex: 1 },
//   driverNameRow: { flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap', gap: 6 },
//   driverName: { fontSize: 17, fontWeight: '800', color: Colors.dark },
//   verifiedBadge: { flexDirection: 'row', alignItems: 'center', gap: 4 },
//   verifiedBadgeText: { fontSize: 11, color: '#2457A6', fontWeight: '700' },
//   ratingRow: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 6 },
//   ratingText: { fontSize: 13, color: Colors.dark, fontWeight: '700' },
//   chatButtonCircle: { width: 42, height: 42, borderRadius: 21, backgroundColor: '#EAF1FF', alignItems: 'center', justifyContent: 'center' },
//   driverBio: { marginTop: 12, fontSize: 14, lineHeight: 20, color: Colors.gray },
//   profileOutlineBtn: { marginTop: 14, borderWidth: 1, borderColor: '#2457A6', borderRadius: 16, paddingVertical: 12, alignItems: 'center' },
//   profileOutlineBtnText: { color: '#2457A6', fontWeight: '700', fontSize: 14 },
//   cardSection: { backgroundColor: 'white', borderRadius: 20, padding: 16, marginBottom: 14, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 8, elevation: 2 },
//   sectionTitle: { fontSize: 16, fontWeight: '800', color: Colors.dark, marginBottom: 14 },
//   currentBookingContainer: {
//     backgroundColor: '#EFF6FF',
//     borderRadius: 12,
//     padding: 12,
//     marginBottom: 16,
//   },
//   currentBookingText: {
//     fontSize: 14,
//     fontWeight: '600',
//     color: Colors.primary,
//     marginBottom: 4,
//   },
//   currentBookingHint: {
//     fontSize: 12,
//     color: Colors.gray,
//   },
//   seatInfoNote: {
//     marginTop: 12,
//     backgroundColor: '#FEF3C7',
//     borderRadius: 8,
//     padding: 10,
//   },
//   seatInfoNoteText: {
//     fontSize: 11,
//     color: '#92400E',
//     textAlign: 'center',
//   },
//   tripTimelineWrap: { flexDirection: 'row' },
//   timelineRail: { width: 18, alignItems: 'center', marginTop: 4 },
//   timelineDot: { width: 10, height: 10, borderRadius: 5 },
//   timelineLine: { width: 2, flex: 1, backgroundColor: '#D8DCE3', marginVertical: 6 },
//   timelineContent: { flex: 1, paddingLeft: 8 },
//   timelineItem: { marginBottom: 14 },
//   timelineLabel: { fontSize: 12, color: Colors.gray, fontWeight: '700' },
//   timelinePlace: { fontSize: 15, color: Colors.dark, fontWeight: '700', marginTop: 4 },
//   timelineMetaRow: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 6 },
//   timelineMetaText: { fontSize: 12, color: Colors.gray, fontWeight: '600' },
//   vehicleHeaderRow: { flexDirection: 'row', alignItems: 'center' },
//   vehicleIconCircle: { width: 42, height: 42, borderRadius: 21, backgroundColor: '#EAF1FF', alignItems: 'center', justifyContent: 'center', marginRight: 12 },
//   vehicleMeta: { flex: 1 },
//   vehicleTitle: { fontSize: 15, fontWeight: '800', color: Colors.dark },
//   vehicleSub: { marginTop: 3, fontSize: 12, color: Colors.gray, fontWeight: '600' },
//   vehicleRegContainer: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 6, paddingTop: 6, borderTopWidth: 1, borderTopColor: '#F0F0F0' },
//   vehicleRegText: { fontSize: 11, color: '#6B7280', fontWeight: '500' },
//   tagRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 14 },
//   preferenceTag: { paddingHorizontal: 12, paddingVertical: 8, borderRadius: 999, backgroundColor: '#FFF3E8' },
//   preferenceTagText: { fontSize: 12, color: '#C65D00', fontWeight: '700' },
//   emptyText: { fontSize: 13, color: Colors.gray, fontWeight: '600' },
//   priceRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
//   priceLabel: { fontSize: 14, color: Colors.gray, fontWeight: '500' },
//   priceValue: { fontSize: 14, color: Colors.dark, fontWeight: '700' },
//   priceDivider: { height: 1, backgroundColor: '#ECEEF2', marginVertical: 8 },
//   totalLabel: { fontSize: 15, color: Colors.dark, fontWeight: '800' },
//   totalValue: { fontSize: 15, color: '#2457A6', fontWeight: '800' },
//   noticeBox: { marginTop: 12, backgroundColor: '#FFF2E9', borderRadius: 14, padding: 12 },
//   noticeText: { fontSize: 12.5, color: Colors.dark, lineHeight: 18 },
//   noticeBold: { fontWeight: '800' },
//   seatSelectorRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: '#FAFAFB', borderRadius: 18, padding: 14 },
//   seatActionBtn: { width: 38, height: 38, borderRadius: 12, borderWidth: 1, borderColor: '#D6DDE7', alignItems: 'center', justifyContent: 'center', backgroundColor: 'white' },
//   seatCountWrap: { flexDirection: 'row', alignItems: 'baseline' },
//   seatCountText: { fontSize: 28, fontWeight: '900', color: Colors.dark },
//   seatAvailableText: { fontSize: 13, color: Colors.gray, marginLeft: 6, fontWeight: '600' },
//   simpleInfoLeft: { flexDirection: 'row', alignItems: 'center', gap: 8 },
//   safetyCard: { backgroundColor: '#FFF3E7', borderRadius: 18, padding: 16, marginBottom: 14 },
//   safetyTitle: { fontSize: 14, color: '#2457A6', fontWeight: '800' },
//   safetySub: { marginTop: 2, fontSize: 12, color: '#2457A6', opacity: 0.9, fontWeight: '600' },
//   bottomBar: { position: 'absolute', left: 0, right: 0, bottom: 0, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 16, paddingTop: 12, paddingBottom: Platform.OS === 'ios' ? 28 : 16, backgroundColor: 'white', borderTopWidth: 1, borderTopColor: '#ECEEF2' },
//   bottomCaption: { fontSize: 12, color: Colors.gray, fontWeight: '500' },
//   bottomTotal: { fontSize: 26, color: Colors.dark, fontWeight: '900', marginTop: 2 },
//   bookNowBtn: { backgroundColor: '#FF7A00', paddingHorizontal: 24, paddingVertical: 14, borderRadius: 22, minWidth: 128, alignItems: 'center', justifyContent: 'center' },
//   bookNowBtnDisabled: { opacity: 0.7 },
//   bookNowText: { color: 'white', fontSize: 16, fontWeight: '800' },
//   loaderContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#fff' },
//   modalBackdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.9)', justifyContent: 'center', alignItems: 'center' },
//   imageModalContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', width: '100%' },
//   imageModalContent: { width: '90%', backgroundColor: Colors.white, borderRadius: 20, overflow: 'hidden', maxHeight: '80%' },
//   imageModalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 16, borderBottomWidth: 1, borderBottomColor: '#EEF2F7' },
//   imageModalTitle: { fontSize: 18, fontWeight: '700', color: Colors.dark },
//   fullProfileImage: { width: '100%', height: 400, backgroundColor: '#F5F5F5' },
//   modalSvgContainer: { width: '100%', height: 400, backgroundColor: '#F5F5F5', alignItems: 'center', justifyContent: 'center' },
//   noImageContainer: { width: '100%', height: 400, justifyContent: 'center', alignItems: 'center', backgroundColor: '#F5F5F5' },
//   noImageText: { fontSize: 16, color: Colors.gray },
// });
import React, { useMemo, useRef, useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Platform,
  StatusBar,
  Image,
  Dimensions,
  Animated,
  PanResponder,
  Modal
} from 'react-native';
import MapView, { Marker, Polyline, PROVIDER_GOOGLE } from 'react-native-maps';
import { Ionicons } from '@expo/vector-icons';
import LottieView from "lottie-react-native";
import { SvgCssUri } from 'react-native-svg/css';
import { Colors } from '../constants/Colors';
import { useAuth } from '../context/AuthContext';
import { API_BASE_URL } from '../config/config_ip';
import CustomAlert from '../components/CustomAlert';
import { useFocusEffect } from '@react-navigation/native';

const { height } = Dimensions.get('window');
const SAFE_TOP = Platform.OS === 'ios' ? 56 : 24;
const COLLAPSED_HEIGHT = 84;
const EXPANDED_HEIGHT = height * 0.72;

function buildImageUrl(url) {
  if (!url) return null;
  if (url.startsWith('http://') || url.startsWith('https://')) return url;
  return `${API_BASE_URL}${url.startsWith('/') ? '' : '/'}${url}`;
}

function getDriverInitials(name) {
  if (!name) return 'D';
  const parts = name.trim().split(' ').filter(Boolean);
  if (parts.length > 1) return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
  return parts[0].slice(0, 2).toUpperCase();
}

function parseSuggestedPoint(point) {
  if (!point) return null;

  if (Array.isArray(point) && point.length === 2) {
    return {
      longitude: Number(point[0]),
      latitude: Number(point[1]),
    };
  }

  if (point.lng != null && point.lat != null) {
    return {
      longitude: Number(point.lng),
      latitude: Number(point.lat),
    };
  }

  if (point.longitude != null && point.latitude != null) {
    return {
      longitude: Number(point.longitude),
      latitude: Number(point.latitude),
    };
  }

  return null;
}

function parseRouteCoordinates(routeCoordinates) {
  if (!Array.isArray(routeCoordinates)) return [];

  return routeCoordinates
    .map((item) => {
      if (Array.isArray(item) && item.length === 2) {
        return {
          longitude: Number(item[0]),
          latitude: Number(item[1]),
        };
      }
      return parseSuggestedPoint(item);
    })
    .filter(Boolean);
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

function extractAllPreferences(ride, driverTravelPrefs) {
  let ridePrefs = ride?.preferences;
  
  if (ridePrefs && typeof ridePrefs === 'string') {
    try {
      ridePrefs = JSON.parse(ridePrefs);
    } catch (e) {
      ridePrefs = null;
    }
  }
  
  if (ridePrefs && typeof ridePrefs === 'object' && Object.keys(ridePrefs).length > 0) {
    return extractFromObject(ridePrefs);
  }
  
  if (driverTravelPrefs && typeof driverTravelPrefs === 'object' && Object.keys(driverTravelPrefs).length > 0) {
    return extractFromObject(driverTravelPrefs);
  }
  
  return [];
}

function extractFromObject(prefs) {
  const allPreferences = [];

  Object.entries(prefs).forEach(([key, value]) => {
    if (value === null || value === undefined) return;
    
    const formattedKey = key.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
    
    if (typeof value === 'boolean') {
      if (value === true) {
        allPreferences.push(formattedKey);
      }
    } 
    else if (Array.isArray(value)) {
      if (value.length > 0) {
        allPreferences.push(`${formattedKey}: ${value.join(', ')}`);
      }
    }
    else if (typeof value === 'object') {
      const nestedPrefs = extractFromObject(value);
      allPreferences.push(...nestedPrefs);
    }
    else if (typeof value === 'string' && value.trim()) {
      const lowerValue = value.toLowerCase();
      if (!['false', 'no', 'none', 'null', 'undefined'].includes(lowerValue)) {
        allPreferences.push(`${formattedKey}: ${value}`);
      }
    }
    else if (typeof value === 'number') {
      allPreferences.push(`${formattedKey}: ${value}`);
    }
  });

  return [...new Set(allPreferences)];
}

function GenericPreferenceTag({ label }) {
  if (!label || label.trim() === '') return null;
  
  let tagColor = '#FFF3E8';
  let textColor = '#C65D00';
  
  const lowerLabel = label.toLowerCase();
  
  if (lowerLabel.includes('age') || lowerLabel.includes('category')) {
    tagColor = '#E8F5E9';
    textColor = '#2E7D32';
  } else if (lowerLabel.includes('chat') || lowerLabel.includes('talk')) {
    tagColor = '#E3F2FD';
    textColor = '#1565C0';
  } else if (lowerLabel.includes('gender')) {
    tagColor = '#F3E5F5';
    textColor = '#6A1B9A';
  } else if (lowerLabel.includes('language') || lowerLabel.includes('speak')) {
    tagColor = '#FFF9C4';
    textColor = '#F57F17';
  } else if (lowerLabel.includes('verified')) {
    tagColor = '#E8F5E9';
    textColor = '#2E7D32';
  }
  
  return (
    <View style={[styles.preferenceTag, { backgroundColor: tagColor }]}>
      <Text style={[styles.preferenceTagText, { color: textColor }]}>{label}</Text>
    </View>
  );
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

export default function RideDetailScreen({ navigation, route }) {
  const { user, isAuthenticated } = useAuth();
  const { ride, searchData } = route.params || {};

  const [seatsRequested, setSeatsRequested] = useState(1);
  const [requestLoading, setRequestLoading] = useState(false);
  const [cancelLoading, setCancelLoading] = useState(false);
  const [drawerExpanded, setDrawerExpanded] = useState(true);
  const [driverProfile, setDriverProfile] = useState(null);
  const [isVerified, setIsVerified] = useState(false);
  const [loadingProfile, setLoadingProfile] = useState(false);
  const [mapReady, setMapReady] = useState(false);
  const [userBooking, setUserBooking] = useState(null);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const animatedDrawer = useRef(new Animated.Value(1)).current;
  const mapRef = useRef(null);
  
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

  const showConfirmationAlert = (title, message, onConfirm) => {
    setAlertConfig({
      title,
      message,
      icon: "warning",
      iconColor: "#F59E0B",
      buttons: [
        { text: 'Cancel', onPress: () => setAlertVisible(false), style: 'cancel' },
        { text: 'Confirm', onPress: () => {
          setAlertVisible(false);
          onConfirm();
        }, style: 'destructive' }
      ]
    });
    setAlertVisible(true);
  };

  // Check if user already has a booking for this ride
  const checkUserBooking = useCallback(async () => {
    if (!user?.phone_number || !ride?.id) return;
    
    try {
      const response = await fetch(`${API_BASE_URL}/my-rides/${user.phone_number}`);
      const data = await response.json();
      
      // Check for any booking (pending or accepted) for this ride
      const booking = data.requested_rides?.find(
        b => b.ride_id === ride.id && (b.status === 'accepted' || b.status === 'pending')
      );
      
      if (booking) {
        setUserBooking(booking);
        setSeatsRequested(booking.seats_requested);
        console.log('📦 Found existing booking:', booking);
      } else {
        setUserBooking(null);
        setSeatsRequested(1);
      }
    } catch (error) {
      console.log('Error checking user booking:', error);
    }
  }, [user?.phone_number, ride?.id]);

  // Check for overlapping rides (only when trying to book a new ride)
  const checkPassengerOverlap = async (departureTime, durationMinutes = 60) => {
    try {
      if (!user?.phone_number) return false;
      
      const url = `${API_BASE_URL}/check-passenger-overlap?phone_number=${encodeURIComponent(user.phone_number)}&departure_time=${departureTime.toISOString()}&duration_minutes=${durationMinutes}`;
      
      const response = await fetch(url);
      const data = await response.json();
      
      if (data.has_overlap) {
        const overlap = data.overlapping_booking;
        showCustomAlert(
          'Overlapping Ride',
          `You already have a confirmed booking for a ride from ${overlap.origin} to ${overlap.destination} at ${new Date(overlap.departure_time).toLocaleTimeString()}. Please complete that ride before booking another.`,
          'warning'
        );
        return true;
      }
      return false;
    } catch (error) {
      console.log('Error checking passenger overlap:', error);
      return false;
    }
  };

  const loadDriverData = useCallback(async () => {
    const driverPhone = ride?.phoneNumber;
    const driverUserId = ride?.driverUserId;
    
    if (driverPhone || driverUserId) {
      setLoadingProfile(true);
      
      try {
        const profileData = await fetchDriverProfile(driverPhone, driverUserId);
        if (profileData?.success && profileData.user) {
          setDriverProfile(profileData.user);
        } else {
          setDriverProfile(null);
        }
        
        let verified = false;
        if (driverPhone) {
          const docsData = await fetchUserDocuments(driverPhone);
          if (docsData?.success && docsData.documents) {
            const verifiedDocs = docsData.documents.filter(doc => {
              const status = doc.status?.toUpperCase();
              return status === 'APPROVED' && ['aadhar', 'dl', 'rc'].includes(doc.document_type?.toLowerCase());
            });
            verified = verifiedDocs.length > 0;
            setIsVerified(verified);
          }
        }
      } catch (error) {
        console.log('Error loading driver data:', error);
      } finally {
        setLoadingProfile(false);
      }
    }
  }, [ride?.phoneNumber, ride?.driverUserId]);

  useFocusEffect(
    useCallback(() => {
      loadDriverData();
      checkUserBooking();
    }, [loadDriverData, checkUserBooking])
  );

  useEffect(() => {
    if (!isAuthenticated) {
      showCustomAlert(
        'Login Required',
        'Please login to book rides.',
        'warning'
      );
      navigation.goBack();
    }
  }, [isAuthenticated, navigation]);

  const getProfilePhotoUrl = useCallback(() => {
    const rawUrl = driverProfile?.profile_picture || ride?.profilePicture;
    if (!rawUrl) return null;
    return buildImageUrl(rawUrl);
  }, [driverProfile, ride]);
  
  const profilePhotoUrl = getProfilePhotoUrl();
  const avatarText = getDriverInitials(driverProfile?.full_name || ride?.driverName || 'Driver');
  const isProfilePhotoSvg = profilePhotoUrl ? profilePhotoUrl.toLowerCase().includes('.svg') : false;
  
  const allPreferences = useMemo(() => {
    return extractAllPreferences(ride, driverProfile?.travel_preferences);
  }, [ride, driverProfile]);

  const driverStart = useMemo(() => {
    const coords = ride?.routeCoordinates;
    if (Array.isArray(coords) && coords.length > 0) {
      const first = coords[0];
      if (Array.isArray(first) && first.length === 2) {
        return { latitude: first[1], longitude: first[0] };
      }
    }
    return parseSuggestedPoint(ride?.suggestedPickup);
  }, [ride]);

  const driverEnd = useMemo(() => {
    const coords = ride?.routeCoordinates;
    if (Array.isArray(coords) && coords.length > 0) {
      const last = coords[coords.length - 1];
      if (Array.isArray(last) && last.length === 2) {
        return { latitude: last[1], longitude: last[0] };
      }
    }
    return parseSuggestedPoint(ride?.suggestedDrop);
  }, [ride]);

  const intersectionPickup = useMemo(
    () => parseSuggestedPoint(ride?.suggestedPickup),
    [ride]
  );
  const intersectionDrop = useMemo(
    () => parseSuggestedPoint(ride?.suggestedDrop),
    [ride]
  );

  const userPickup = useMemo(() => {
    if (!searchData?.fromCoords) return null;
    const c = searchData.fromCoords;
    if (Array.isArray(c) && c.length === 2) {
      return { latitude: c[1], longitude: c[0] };
    }
    return null;
  }, [searchData]);

  const userDrop = useMemo(() => {
    if (!searchData?.toCoords) return null;
    const c = searchData.toCoords;
    if (Array.isArray(c) && c.length === 2) {
      return { latitude: c[1], longitude: c[0] };
    }
    return null;
  }, [searchData]);

  const routePath = useMemo(() => {
    const fullRoute = parseRouteCoordinates(ride?.routeCoordinates);
    if (fullRoute.length >= 2) return fullRoute;
    if (intersectionPickup && intersectionDrop) return [intersectionPickup, intersectionDrop];
    return [];
  }, [ride, intersectionPickup, intersectionDrop]);

  const walkToPickupPath = useMemo(() => {
    if (userPickup && intersectionPickup) return [userPickup, intersectionPickup];
    return [];
  }, [userPickup, intersectionPickup]);

  const walkFromDropPath = useMemo(() => {
    if (userDrop && intersectionDrop) return [intersectionDrop, userDrop];
    return [];
  }, [userDrop, intersectionDrop]);

  const allMarkerCoords = useMemo(() => {
    const coords = [];
    if (driverStart) coords.push(driverStart);
    if (driverEnd) coords.push(driverEnd);
    if (userPickup) coords.push(userPickup);
    if (userDrop) coords.push(userDrop);
    if (intersectionPickup) coords.push(intersectionPickup);
    if (intersectionDrop) coords.push(intersectionDrop);
    return coords;
  }, [driverStart, driverEnd, userPickup, userDrop, intersectionPickup, intersectionDrop]);

  const fitMapToMarkers = useCallback(() => {
    if (mapRef.current && mapReady && allMarkerCoords.length >= 2) {
      setTimeout(() => {
        try {
          mapRef.current.fitToCoordinates(allMarkerCoords, {
            edgePadding: { top: 80, right: 50, bottom: 50, left: 50 },
            animated: true,
          });
        } catch (e) {
          console.log('fitToCoordinates error:', e);
        }
      }, 500);
    }
  }, [mapReady, allMarkerCoords]);

  useEffect(() => {
    if (mapReady && allMarkerCoords.length >= 2) {
      fitMapToMarkers();
    }
  }, [mapReady, allMarkerCoords, fitMapToMarkers]);

  const vehicleName = driverProfile?.vehicle 
    ? [driverProfile.vehicle.model].filter(Boolean).join(' ')
    : [ride?.vehicle?.model].filter(Boolean).join(' ') || 'Vehicle details unavailable';
  
  const vehicleRegNumber = driverProfile?.vehicle?.registration_number || 
                           ride?.vehicle?.registration_number || 
                           null;
  
  const vehicleColor = driverProfile?.vehicle?.color || 
                       ride?.vehicle?.color || 
                       'Not specified';

  const totalPrice = Number(ride?.price || 0) * seatsRequested;

  const handleProfileImagePress = () => {
    if (profilePhotoUrl) {
      setSelectedProfile({
        visible: true,
        imageUrl: profilePhotoUrl,
        driverName: driverProfile?.full_name || ride?.driverName || 'Driver',
      });
    } else {
      showCustomAlert('No Photo', 'Driver has not uploaded a profile picture', 'warning');
    }
  };

  const mapHeight = animatedDrawer.interpolate({
    inputRange: [0, 1],
    outputRange: [height - SAFE_TOP - COLLAPSED_HEIGHT, height * 0.32],
  });

  const drawerHeight = animatedDrawer.interpolate({
    inputRange: [0, 1],
    outputRange: [COLLAPSED_HEIGHT, EXPANDED_HEIGHT],
  });

  const toggleDrawer = () => {
    const nextExpanded = !drawerExpanded;
    setDrawerExpanded(nextExpanded);

    Animated.timing(animatedDrawer, {
      toValue: nextExpanded ? 1 : 0,
      duration: 260,
      useNativeDriver: false,
    }).start();
  };

  const panResponder = useRef(
    PanResponder.create({
      onMoveShouldSetPanResponder: (_, gestureState) =>
        Math.abs(gestureState.dy) > 5,
      onPanResponderMove: (_, gestureState) => {
        const dragRange = EXPANDED_HEIGHT - COLLAPSED_HEIGHT;
        const progress = drawerExpanded
          ? 1 - (gestureState.dy / dragRange)
          : gestureState.dy / dragRange;
        const clamped = Math.max(0, Math.min(1, progress));
        animatedDrawer.setValue(clamped);
      },
      onPanResponderRelease: (_, gestureState) => {
        const dragRange = EXPANDED_HEIGHT - COLLAPSED_HEIGHT;
        const threshold = dragRange * 0.2;
        if (drawerExpanded) {
          if (gestureState.dy > threshold) {
            setDrawerExpanded(false);
            Animated.timing(animatedDrawer, {
              toValue: 0,
              duration: 200,
              useNativeDriver: false,
            }).start();
          } else {
            setDrawerExpanded(true);
            Animated.timing(animatedDrawer, {
              toValue: 1,
              duration: 200,
              useNativeDriver: false,
            }).start();
          }
        } else {
          if (gestureState.dy < -threshold) {
            setDrawerExpanded(true);
            Animated.timing(animatedDrawer, {
              toValue: 1,
              duration: 200,
              useNativeDriver: false,
            }).start();
          } else {
            setDrawerExpanded(false);
            Animated.timing(animatedDrawer, {
              toValue: 0,
              duration: 200,
              useNativeDriver: false,
            }).start();
          }
        }
      },
    })
  ).current;

  // Modify existing booking seats
  const handleModifySeats = async (newSeatCount) => {
    if (!user?.phone_number) {
      showCustomAlert('Login Required', 'Please log in to modify booking.', 'warning');
      return;
    }

    if (!userBooking) {
      return;
    }

    // Check if requested seats exceed available seats
    const availableSeats = ride?.seatsAvailable || 0;
    const totalAvailable = availableSeats + userBooking.seats_requested;
    
    if (newSeatCount > totalAvailable) {
      showCustomAlert(
        'Not Enough Seats',
        `Only ${totalAvailable} total seats available. You currently have ${userBooking.seats_requested} seat(s). You can add up to ${availableSeats} more seat(s).`,
        'warning'
      );
      return;
    }

    if (newSeatCount < 1) {
      showCustomAlert('Invalid Seats', 'You must book at least 1 seat.', 'warning');
      return;
    }

    setRequestLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/booking/${userBooking.id}/modify-seats`, {
        method: 'PUT',
        headers: { 
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({ new_seats: newSeatCount }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.detail || data.message || 'Failed to modify booking');
      }

      showCustomAlert('Success', data.message || 'Booking updated successfully', 'success');
      setUserBooking({ ...userBooking, seats_requested: newSeatCount });
      
      setTimeout(() => navigation.goBack(), 1500);
    } catch (error) {
      console.error('Modify booking error:', error);
      showCustomAlert('Error', error.message || 'Failed to modify booking', 'error');
    } finally {
      setRequestLoading(false);
    }
  };

  // Cancel booking
  const handleCancelBooking = async () => {
    if (!user?.phone_number || !userBooking) {
      return;
    }

    setCancelLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/booking/${userBooking.id}/cancel`, {
        method: 'PUT',
        headers: { 
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.detail || data.message || 'Failed to cancel booking');
      }

      showCustomAlert('Success', data.message || 'Booking cancelled successfully', 'success');
      setUserBooking(null);
      setSeatsRequested(1);
      
      setTimeout(() => navigation.goBack(), 1500);
    } catch (error) {
      console.error('Cancel booking error:', error);
      showCustomAlert('Error', error.message || 'Failed to cancel booking', 'error');
    } finally {
      setCancelLoading(false);
      setShowCancelModal(false);
    }
  };

  // Request to join ride (new booking)
  const handleRequestJoin = async () => {
    if (!user?.phone_number) {
      showCustomAlert('Login Required', 'Please log in to request a ride.', 'warning');
      return;
    }

    // If user already has a booking for this ride, modify seats instead
    if (userBooking) {
      await handleModifySeats(seatsRequested);
      return;
    }

    if (ride?.womenOnly === true && user?.gender !== 'female') {
      showCustomAlert(
        'Not Available', 
        'This ride is for women passengers only. Please search for other rides.',
        'warning'
      );
      return;
    }

    const availableSeats = ride?.seatsAvailable || 0;
    if (seatsRequested > availableSeats) {
      showCustomAlert(
        'Not Enough Seats',
        `Only ${availableSeats} seat${availableSeats !== 1 ? 's' : ''} left in this ride. Please reduce your seat request.`,
        'warning'
      );
      return;
    }

    let rideDateTime;
    if (ride?.date && ride?.time) {
      rideDateTime = new Date(`${ride.date} ${ride.time}`);
    } else if (ride?.departure_time) {
      rideDateTime = new Date(ride.departure_time);
    } else {
      rideDateTime = new Date();
    }
    
    let durationMinutes = 60;
    if (ride?.durationMinutes) {
      durationMinutes = ride.durationMinutes;
    } else if (ride?.durationText) {
      const match = ride.durationText.match(/\d+/);
      if (match) durationMinutes = parseInt(match[0]);
    }
    
    // Check for overlapping rides - ONLY FOR NEW BOOKINGS
    const hasOverlap = await checkPassengerOverlap(rideDateTime, durationMinutes);
    if (hasOverlap) {
      return;
    }

    setRequestLoading(true);
    try {
      const payload = {
        ride_id: ride.id,
        passenger_phone: user.phone_number,
        seats_requested: seatsRequested,
      };

      if (searchData?.fromCoords && Array.isArray(searchData.fromCoords)) {
        payload.from_coords = searchData.fromCoords;
      }
      if (searchData?.toCoords && Array.isArray(searchData.toCoords)) {
        payload.to_coords = searchData.toCoords;
      }

      const response = await fetch(`${API_BASE_URL}/ride-bookings`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify(payload),
      });

      const raw = await response.text();
      let data = {};
      try {
        data = raw ? JSON.parse(raw) : {};
      } catch {
        data.detail = raw;
      }

      if (!response.ok) {
        throw new Error(data.detail || data.message || `Server error (${response.status})`);
      }

      showCustomAlert('Success', data.message || 'Ride request sent successfully', 'success');
      setTimeout(() => navigation.goBack(), 1500);
    } catch (error) {
      console.error('Booking error:', error);
      showCustomAlert('Error', error.message || 'Failed to send request', 'error');
    } finally {
      setRequestLoading(false);
    }
  };

  const viewDriverProfile = () => {
    const driverPhone = ride?.phoneNumber;
    const driverUserId = ride?.driverUserId;
    
    if (driverPhone || driverUserId) {
      navigation.navigate('ViewProfileScreen', {
        userId: driverUserId || null,
        phoneNumber: driverPhone || null,
        driverName: driverProfile?.full_name || ride?.driverName || 'Driver',
        profilePicture: profilePhotoUrl,
        vehicleNumber: vehicleRegNumber,
        vehicleModel: vehicleName,
        driverRating: driverProfile?.avg_rating || ride?.rating || 0,
      });
    } else {
      showCustomAlert('Profile', 'Driver profile not available', 'warning');
    }
  };

  const getOrCreateConversation = async (receiverPhone, rideId) => {
    try {
      const myPhone = user?.phone_number;
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
        body: JSON.stringify({ participant_phone: receiverPhone, ride_id: rideId }),
      });
      const data = await response.json();
      if (data.success) {
        return data.conversation.id;
      }
      return null;
    } catch (error) {
      console.error('getOrCreateConversation error:', error);
      return null;
    }
  };

  const startChat = async () => {
    const driverPhone = ride?.phoneNumber;
    if (driverPhone) {
      const conversationId = await getOrCreateConversation(driverPhone, ride.id);
      if (conversationId) {
        navigation.navigate('ChatScreen', {
          receiverPhone: driverPhone,
          conversationId,
          user: {
            name: driverProfile?.full_name || ride?.driverName || 'Driver',
            tripInfo: `${ride.from || 'Pickup'} → ${ride.to || 'Drop'}`,
          },
        });
      } else {
        showCustomAlert('Chat', 'Unable to start chat. Please try again.', 'error');
      }
    } else {
      showCustomAlert('Chat', 'Driver contact not available', 'warning');
    }
  };

  if (requestLoading || cancelLoading || loadingProfile) {
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

  if (!ride) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.errorText}>No ride data available</Text>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.fallbackBtn}
        >
          <Text style={styles.fallbackBtnText}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const initialRegion = {
    latitude: intersectionPickup?.latitude || driverStart?.latitude || 28.6139,
    longitude: intersectionPickup?.longitude || driverStart?.longitude || 77.2090,
    latitudeDelta: 0.05,
    longitudeDelta: 0.05,
  };

  const maxAvailableSeats = userBooking 
    ? (ride.seatsAvailable + userBooking.seats_requested)
    : (ride.seatsAvailable || 1);

  const isBooked = !!userBooking;

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />

      <Animated.View style={[styles.mapContainer, { height: mapHeight }]}>
        <MapView
          ref={mapRef}
          provider={PROVIDER_GOOGLE}
          style={styles.map}
          initialRegion={initialRegion}
          onMapReady={() => setMapReady(true)}
          showsUserLocation={false}
          showsMyLocationButton={false}
          zoomEnabled={true}
          zoomControlEnabled={true}
        >
          {routePath.length >= 2 && (
            <Polyline
              coordinates={routePath}
              strokeColor="#2457A6"
              strokeWidth={5}
              lineCap="round"
              lineJoin="round"
            />
          )}

          {driverStart && (
            <Marker coordinate={driverStart} anchor={{ x: 0.5, y: 1 }}>
              <View style={styles.markerWrapper}>
                <View style={[styles.pinBubble, { backgroundColor: '#16A34A' }]}>
                  <Text style={styles.pinIcon}>S</Text>
                </View>
                <View style={[styles.pinPointer, { borderTopColor: '#16A34A' }]} />
              </View>
            </Marker>
          )}

          {driverEnd && (
            <Marker coordinate={driverEnd} anchor={{ x: 0.5, y: 1 }}>
              <View style={styles.markerWrapper}>
                <View style={[styles.pinBubble, { backgroundColor: '#DC2626' }]}>
                  <Text style={styles.pinIcon}>E</Text>
                </View>
                <View style={[styles.pinPointer, { borderTopColor: '#DC2626' }]} />
              </View>
            </Marker>
          )}

          {userPickup && (
            <Marker coordinate={userPickup} anchor={{ x: 0.5, y: 1 }}>
              <View style={styles.markerWrapper}>
                <View style={[styles.pinBubble, { backgroundColor: '#3B82F6' }]}>
                  <Ionicons name="person" size={12} color="white" />
                </View>
                <View style={[styles.pinPointer, { borderTopColor: '#3B82F6' }]} />
                <View style={styles.pinLabelBubble}>
                  <Text style={styles.pinLabelText}>Your Pickup</Text>
                </View>
              </View>
            </Marker>
          )}

          {userDrop && (
            <Marker coordinate={userDrop} anchor={{ x: 0.5, y: 1 }}>
              <View style={styles.markerWrapper}>
                <View style={[styles.pinBubble, { backgroundColor: '#F97316' }]}>
                  <Ionicons name="flag" size={12} color="white" />
                </View>
                <View style={[styles.pinPointer, { borderTopColor: '#F97316' }]} />
                <View style={styles.pinLabelBubble}>
                  <Text style={styles.pinLabelText}>Your Drop</Text>
                </View>
              </View>
            </Marker>
          )}

          {intersectionPickup && (
            <Marker coordinate={intersectionPickup} anchor={{ x: 0.5, y: 1 }}>
              <View style={styles.markerWrapper}>
                <View style={[styles.pinBubble, { backgroundColor: '#FACC15' }]}>
                  <Ionicons name="hand-right" size={12} color="#713F12" />
                </View>
                <View style={[styles.pinPointer, { borderTopColor: '#FACC15' }]} />
                <View style={styles.pinLabelBubbleYellow}>
                  <Text style={styles.pinLabelTextYellow}>Meet Driver</Text>
                </View>
              </View>
            </Marker>
          )}

          {intersectionDrop && (
            <Marker coordinate={intersectionDrop} anchor={{ x: 0.5, y: 1 }}>
              <View style={styles.markerWrapper}>
                <View style={[styles.pinBubble, { backgroundColor: '#FACC15' }]}>
                  <Ionicons name="exit" size={12} color="#713F12" />
                </View>
                <View style={[styles.pinPointer, { borderTopColor: '#FACC15' }]} />
                <View style={styles.pinLabelBubbleYellow}>
                  <Text style={styles.pinLabelTextYellow}>Exit Here</Text>
                </View>
              </View>
            </Marker>
          )}

          {walkToPickupPath.length >= 2 && (
            <Polyline
              coordinates={walkToPickupPath}
              strokeColor="#FACC15"
              strokeWidth={4}
              lineDashPattern={[8, 6]}
              lineCap="round"
              lineJoin="round"
            />
          )}

          {walkFromDropPath.length >= 2 && (
            <Polyline
              coordinates={walkFromDropPath}
              strokeColor="#FACC15"
              strokeWidth={4}
              lineDashPattern={[8, 6]}
              lineCap="round"
              lineJoin="round"
            />
          )}
        </MapView>

        <TouchableOpacity
          style={styles.mapBackButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="chevron-back" size={26} color={Colors.secondary} />
        </TouchableOpacity>
      </Animated.View>

      <Animated.View style={[styles.drawer, { height: drawerHeight }]}>
        <View style={styles.handleWrap} {...panResponder.panHandlers}>
          <TouchableOpacity
            activeOpacity={0.9}
            onPress={toggleDrawer}
            style={styles.handleHitArea}
          >
            <View style={styles.handleBar} />
          </TouchableOpacity>
        </View>

        {!drawerExpanded ? (
          <View style={styles.collapsedSummary}>
            <View style={styles.collapsedTopRow}>
              <View style={{ flex: 1 }}>
                <Text style={styles.collapsedDriver} numberOfLines={1}>
                  {driverProfile?.full_name || ride?.driverName || 'Driver'}
                </Text>
                <Text style={styles.collapsedSub} numberOfLines={1}>
                  {ride.from || 'Pickup'} → {ride.to || 'Drop'}
                </Text>
              </View>

              <View style={styles.collapsedPriceWrap}>
                <Text style={styles.collapsedPrice}>₹{ride.price}</Text>
                <Text style={styles.collapsedPerSeat}>per seat</Text>
              </View>
            </View>
          </View>
        ) : (
          <>
            <ScrollView
              style={styles.drawerScroll}
              contentContainerStyle={styles.drawerContent}
              showsVerticalScrollIndicator={false}
            >
              <View style={styles.driverCard}>
                <View style={styles.driverTopRow}>
                  <View style={styles.driverLeftWrap}>
                    <TouchableOpacity 
                      style={styles.driverAvatar} 
                      onPress={handleProfileImagePress}
                      activeOpacity={0.8}
                    >
                      {profilePhotoUrl ? (
                        isProfilePhotoSvg ? (
                          <View style={styles.svgAvatarContainer}>
                            <SvgCssUri
                              uri={profilePhotoUrl}
                              width={56}
                              height={56}
                            />
                          </View>
                        ) : (
                          <Image 
                            source={{ uri: profilePhotoUrl }} 
                            style={styles.avatarImg}
                          />
                        )
                      ) : (
                        <Text style={styles.avatarText}>{avatarText}</Text>
                      )}
                    </TouchableOpacity>

                    <View style={styles.driverMeta}>
                      <View style={styles.driverNameRow}>
                        <Text style={styles.driverName}>
                          {driverProfile?.full_name || ride?.driverName || 'Driver'}
                        </Text>
                        {isVerified && (
                          <View style={styles.verifiedBadge}>
                            <Ionicons name="checkmark-circle" size={12} color="#2457A6" />
                            <Text style={styles.verifiedBadgeText}>Verified</Text>
                          </View>
                        )}
                      </View>

                      <View style={styles.ratingRow}>
                        <Ionicons name="star" size={13} color="#F59E0B" />
                        <Text style={styles.ratingText}>
                          {driverProfile?.avg_rating || ride?.rating || 4.5}
                        </Text>
                      </View>
                    </View>
                  </View>

                  <TouchableOpacity style={styles.chatButtonCircle} onPress={startChat}>
                    <Ionicons name="chatbubble-outline" size={20} color="#2457A6" />
                  </TouchableOpacity>
                </View>

                <Text style={styles.driverBio}>
                  {driverProfile?.bio || driverProfile?.about || 'Friendly driver, love meeting new people!'}
                </Text>

                <TouchableOpacity style={styles.profileOutlineBtn} onPress={viewDriverProfile}>
                  <Text style={styles.profileOutlineBtnText}>View Full Profile</Text>
                </TouchableOpacity>
              </View>

              <View style={styles.cardSection}>
                <Text style={styles.sectionTitle}>Trip Details</Text>

                <View style={styles.tripTimelineWrap}>
                  <View style={styles.timelineRail}>
                    <View style={[styles.timelineDot, { backgroundColor: '#2457A6' }]} />
                    <View style={styles.timelineLine} />
                    <View style={[styles.timelineDot, { backgroundColor: '#FF7A00' }]} />
                  </View>

                  <View style={styles.timelineContent}>
                    <View style={styles.timelineItem}>
                      <Text style={styles.timelineLabel}>Pickup</Text>
                      <Text style={styles.timelinePlace}>
                        {ride.pickupLabel || ride.from || 'Pickup point'}
                      </Text>
                      <View style={styles.timelineMetaRow}>
                        <Ionicons name="time-outline" size={13} color={Colors.gray} />
                        <Text style={styles.timelineMetaText}>
                          {ride.date} at {ride.time}
                        </Text>
                      </View>
                    </View>

                    <View style={styles.timelineItem}>
                      <Text style={styles.timelineLabel}>Dropoff</Text>
                      <Text style={styles.timelinePlace}>
                        {ride.dropLabel || ride.to || 'Drop point'}
                      </Text>
                      <Text style={styles.timelineMetaText}>
                        Estimated: {ride.durationText || '--'}
                      </Text>
                    </View>
                  </View>
                </View>
              </View>

              <View style={styles.cardSection}>
                <Text style={styles.sectionTitle}>Vehicle Details</Text>

                <View style={styles.vehicleHeaderRow}>
                  <View style={styles.vehicleIconCircle}>
                    <Ionicons name="car-sport-outline" size={18} color="#2457A6" />
                  </View>

                  <View style={styles.vehicleMeta}>
                    <Text style={styles.vehicleTitle}>{vehicleName}</Text>
                    <Text style={styles.vehicleSub}>
                      {vehicleColor} • {ride?.seatsAvailable || 4} seats
                    </Text>
                    {vehicleRegNumber && (
                      <View style={styles.vehicleRegContainer}>
                        <Text style={styles.vehicleRegText}>
                          Vehicle Number: {vehicleRegNumber}
                        </Text>
                      </View>
                    )}
                  </View>
                </View>
              </View>

              <View style={styles.cardSection}>
                <Text style={styles.sectionTitle}>Ride Preferences</Text>
                <View style={styles.tagRow}>
                  {allPreferences.length > 0 ? (
                    allPreferences.map((pref, index) => (
                      <GenericPreferenceTag key={`${pref}-${index}`} label={pref} />
                    ))
                  ) : (
                    <Text style={styles.emptyText}>No specific preferences added for this ride</Text>
                  )}
                </View>
              </View>

              <View style={styles.cardSection}>
                <Text style={styles.sectionTitle}>Cost Breakdown</Text>

                <View style={styles.priceRow}>
                  <Text style={styles.priceLabel}>Base fare (per seat)</Text>
                  <Text style={styles.priceValue}>₹{ride.price || 0}</Text>
                </View>

                <View style={styles.priceRow}>
                  <Text style={styles.priceLabel}>Platform fee</Text>
                  <Text style={styles.priceValue}>₹0</Text>
                </View>

                <View style={styles.priceDivider} />

                <View style={styles.priceRow}>
                  <Text style={styles.totalLabel}>Total per seat</Text>
                  <Text style={styles.totalValue}>₹{ride.price || 0}</Text>
                </View>

                <View style={styles.noticeBox}>
                  <Text style={styles.noticeText}>
                    <Text style={styles.noticeBold}>Cost-share contribution:</Text>{' '}
                    This is not a commercial fare. You're sharing the travel costs with the driver.
                  </Text>
                </View>
              </View>

              <View style={styles.cardSection}>
                <Text style={styles.sectionTitle}>
                  {isBooked ? 'Modify or Cancel Booking' : 'Select Seats'}
                </Text>
                
                {isBooked && (
                  <View style={styles.currentBookingContainer}>
                    <Text style={styles.currentBookingText}>
                      You have already booked {userBooking.seats_requested} seat(s) for this ride.
                    </Text>
                    <Text style={styles.currentBookingHint}>
                      Use the buttons below to increase, decrease, or cancel your booking.
                    </Text>
                  </View>
                )}
                
                <View style={styles.seatSelectorRow}>
                  <TouchableOpacity
                    style={styles.seatActionBtn}
                    onPress={() => {
                      const newCount = Math.max(1, seatsRequested - 1);
                      setSeatsRequested(newCount);
                      if (isBooked) {
                        handleModifySeats(newCount);
                      }
                    }}
                    disabled={seatsRequested === 1 || requestLoading}
                  >
                    <Ionicons name="remove" size={20} color={Colors.gray} />
                  </TouchableOpacity>

                  <View style={styles.seatCountWrap}>
                    <Text style={styles.seatCountText}>{seatsRequested}</Text>
                    <Text style={styles.seatAvailableText}>
                      / {maxAvailableSeats} available
                    </Text>
                  </View>

                  <TouchableOpacity
                    style={styles.seatActionBtn}
                    onPress={() => {
                      const newCount = Math.min(maxAvailableSeats, seatsRequested + 1);
                      setSeatsRequested(newCount);
                      if (isBooked) {
                        handleModifySeats(newCount);
                      }
                    }}
                    disabled={seatsRequested === maxAvailableSeats || requestLoading}
                  >
                    <Ionicons name="add" size={20} color="#2457A6" />
                  </TouchableOpacity>
                </View>
                
                {isBooked && (
                  <TouchableOpacity
                    style={styles.cancelBookingBtn}
                    onPress={() => setShowCancelModal(true)}
                    disabled={cancelLoading}
                  >
                    <Text style={styles.cancelBookingBtnText}>Cancel Booking</Text>
                  </TouchableOpacity>
                )}
                
                {!isBooked && (
                  <View style={styles.seatInfoNote}>
                    <Text style={styles.seatInfoNoteText}>
                      💡 You can modify or cancel your booking anytime before the ride starts.
                    </Text>
                  </View>
                )}
              </View>

              <View style={styles.safetyCard}>
                <View style={styles.simpleInfoLeft}>
                  <Ionicons name="shield-checkmark-outline" size={18} color="#2457A6" />
                  <View>
                    <Text style={styles.safetyTitle}>Safety First</Text>
                    <Text style={styles.safetySub}>Live GPS tracking & 24/7 support</Text>
                  </View>
                </View>
              </View>

              <View style={{ height: 110 }} />
            </ScrollView>

            <View style={styles.bottomBar}>
              <View>
                <Text style={styles.bottomCaption}>Total for {seatsRequested} seat(s)</Text>
                <Text style={styles.bottomTotal}>₹{totalPrice}</Text>
              </View>

              <TouchableOpacity
                style={[
                  styles.bookNowBtn, 
                  (requestLoading || cancelLoading) && styles.bookNowBtnDisabled,
                  isBooked && styles.modifyBtn
                ]}
                onPress={handleRequestJoin}
                disabled={requestLoading || cancelLoading}
              >
                <Text style={styles.bookNowText}>
                  {isBooked ? 'Update Booking' : 'Book Now'}
                </Text>
              </TouchableOpacity>
            </View>
          </>
        )}
      </Animated.View>

      {/* Cancel Confirmation Modal */}
      <Modal
        visible={showCancelModal}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowCancelModal(false)}
      >
        <View style={styles.modalBackdrop}>
          <View style={styles.confirmModalContainer}>
            <View style={styles.confirmModalContent}>
              <View style={styles.confirmModalHeader}>
                <Ionicons name="alert-circle" size={40} color="#F59E0B" />
                <Text style={styles.confirmModalTitle}>Cancel Booking?</Text>
              </View>
              <Text style={styles.confirmModalMessage}>
                Are you sure you want to cancel your booking for this ride? This action cannot be undone.
              </Text>
              <View style={styles.confirmModalButtons}>
                <TouchableOpacity
                  style={[styles.confirmModalBtn, styles.confirmModalCancelBtn]}
                  onPress={() => setShowCancelModal(false)}
                >
                  <Text style={styles.confirmModalCancelBtnText}>No, Keep</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.confirmModalBtn, styles.confirmModalConfirmBtn]}
                  onPress={handleCancelBooking}
                >
                  <Text style={styles.confirmModalConfirmBtnText}>Yes, Cancel</Text>
                </TouchableOpacity>
              </View>
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
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F4F5F7' },
  centerContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 24 },
  errorText: { fontSize: 18, color: Colors.gray, marginBottom: 16, textAlign: 'center' },
  fallbackBtn: { backgroundColor: Colors.primary, paddingHorizontal: 20, paddingVertical: 12, borderRadius: 12 },
  fallbackBtnText: { color: 'white', fontWeight: '700' },
  mapContainer: { width: '100%', overflow: 'hidden', backgroundColor: '#E8EEF7' },
  map: { flex: 1, backgroundColor: '#E8EEF7' },
  mapBackButton: { position: 'absolute', top: Platform.OS === 'ios' ? 54 : 22, left: 14, width: 42, height: 42, borderRadius: 25, backgroundColor: 'rgba(255,255,255,0.96)', alignItems: 'center', justifyContent: 'center' },
  markerWrapper: { alignItems: 'center' },
  pinBubble: { width: 28, height: 28, borderRadius: 14, borderWidth: 3, borderColor: 'white', alignItems: 'center', justifyContent: 'center', shadowColor: '#000', shadowOffset: { width: 0, height: 3 }, shadowOpacity: 0.25, shadowRadius: 4, elevation: 5 },
  pinPointer: { width: 0, height: 0, backgroundColor: 'transparent', borderStyle: 'solid', borderLeftWidth: 7, borderRightWidth: 7, borderTopWidth: 10, borderLeftColor: 'transparent', borderRightColor: 'transparent', marginTop: -2 },
  pinIcon: {
    fontSize: 14,
    fontWeight: '800',
    color: 'white',
    textAlign: 'center',
    lineHeight: 18,
  },
  pinLabelBubble: { backgroundColor: 'rgba(0,0,0,0.75)', borderRadius: 8, paddingHorizontal: 8, paddingVertical: 3, marginTop: 4 },
  pinLabelText: { color: 'white', fontSize: 10, fontWeight: '700' },
  pinLabelBubbleYellow: { backgroundColor: 'rgba(113, 63, 18, 0.9)', borderRadius: 8, paddingHorizontal: 8, paddingVertical: 3, marginTop: 4 },
  pinLabelTextYellow: { color: '#FACC15', fontSize: 10, fontWeight: '700' },
  drawer: { position: 'absolute', bottom: 0, left: 0, right: 0, backgroundColor: '#F4F5F7', borderTopLeftRadius: 28, borderTopRightRadius: 28, overflow: 'hidden' },
  handleWrap: { alignItems: 'center', paddingTop: 10, paddingBottom: 8, backgroundColor: '#F4F5F7' },
  handleHitArea: { paddingHorizontal: 40, paddingVertical: 10, alignItems: 'center', justifyContent: 'center' },
  handleBar: { width: 64, height: 6, borderRadius: 99, backgroundColor: '#CDD2D8' },
  collapsedSummary: { paddingHorizontal: 16, paddingTop: 4, paddingBottom: 12 },
  collapsedTopRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: 12 },
  collapsedDriver: { fontSize: 16, fontWeight: '800', color: Colors.dark },
  collapsedSub: { marginTop: 2, fontSize: 12, color: Colors.gray, fontWeight: '600' },
  collapsedPriceWrap: { alignItems: 'flex-end' },
  collapsedPrice: { fontSize: 18, fontWeight: '900', color: Colors.dark },
  collapsedPerSeat: { fontSize: 10, color: Colors.gray, fontWeight: '600' },
  drawerScroll: { flex: 1 },
  drawerContent: { paddingHorizontal: 16, paddingBottom: 16 },
  driverCard: { backgroundColor: 'white', borderRadius: 20, padding: 16, marginBottom: 14, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 8, elevation: 2 },
  driverTopRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  driverLeftWrap: { flexDirection: 'row', flex: 1, paddingRight: 10 },
  driverAvatar: { width: 56, height: 56, borderRadius: 28, backgroundColor: '#E5E7EB', overflow: 'hidden', alignItems: 'center', justifyContent: 'center', marginRight: 12 },
  avatarImg: { width: 56, height: 56, borderRadius: 28 },
  avatarText: { fontSize: 15, fontWeight: '800', color: Colors.gray },
  svgAvatarContainer: { width: 56, height: 56, borderRadius: 28, overflow: 'hidden', alignItems: 'center', justifyContent: 'center', backgroundColor: '#E5E7EB' },
  driverMeta: { flex: 1 },
  driverNameRow: { flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap', gap: 6 },
  driverName: { fontSize: 17, fontWeight: '800', color: Colors.dark },
  verifiedBadge: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  verifiedBadgeText: { fontSize: 11, color: '#2457A6', fontWeight: '700' },
  ratingRow: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 6 },
  ratingText: { fontSize: 13, color: Colors.dark, fontWeight: '700' },
  chatButtonCircle: { width: 42, height: 42, borderRadius: 21, backgroundColor: '#EAF1FF', alignItems: 'center', justifyContent: 'center' },
  driverBio: { marginTop: 12, fontSize: 14, lineHeight: 20, color: Colors.gray },
  profileOutlineBtn: { marginTop: 14, borderWidth: 1, borderColor: '#2457A6', borderRadius: 16, paddingVertical: 12, alignItems: 'center' },
  profileOutlineBtnText: { color: '#2457A6', fontWeight: '700', fontSize: 14 },
  cardSection: { backgroundColor: 'white', borderRadius: 20, padding: 16, marginBottom: 14, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 8, elevation: 2 },
  sectionTitle: { fontSize: 16, fontWeight: '800', color: Colors.dark, marginBottom: 14 },
  currentBookingContainer: {
    backgroundColor: '#EFF6FF',
    borderRadius: 12,
    padding: 12,
    marginBottom: 16,
  },
  currentBookingText: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.primary,
    marginBottom: 4,
  },
  currentBookingHint: {
    fontSize: 12,
    color: Colors.gray,
  },
  seatInfoNote: {
    marginTop: 12,
    backgroundColor: '#FEF3C7',
    borderRadius: 8,
    padding: 10,
  },
  seatInfoNoteText: {
    fontSize: 11,
    color: '#92400E',
    textAlign: 'center',
  },
  tripTimelineWrap: { flexDirection: 'row' },
  timelineRail: { width: 18, alignItems: 'center', marginTop: 4 },
  timelineDot: { width: 10, height: 10, borderRadius: 5 },
  timelineLine: { width: 2, flex: 1, backgroundColor: '#D8DCE3', marginVertical: 6 },
  timelineContent: { flex: 1, paddingLeft: 8 },
  timelineItem: { marginBottom: 14 },
  timelineLabel: { fontSize: 12, color: Colors.gray, fontWeight: '700' },
  timelinePlace: { fontSize: 15, color: Colors.dark, fontWeight: '700', marginTop: 4 },
  timelineMetaRow: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 6 },
  timelineMetaText: { fontSize: 12, color: Colors.gray, fontWeight: '600' },
  vehicleHeaderRow: { flexDirection: 'row', alignItems: 'center' },
  vehicleIconCircle: { width: 42, height: 42, borderRadius: 21, backgroundColor: '#EAF1FF', alignItems: 'center', justifyContent: 'center', marginRight: 12 },
  vehicleMeta: { flex: 1 },
  vehicleTitle: { fontSize: 15, fontWeight: '800', color: Colors.dark },
  vehicleSub: { marginTop: 3, fontSize: 12, color: Colors.gray, fontWeight: '600' },
  vehicleRegContainer: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 6, paddingTop: 6, borderTopWidth: 1, borderTopColor: '#F0F0F0' },
  vehicleRegText: { fontSize: 11, color: '#6B7280', fontWeight: '500' },
  tagRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 14 },
  preferenceTag: { paddingHorizontal: 12, paddingVertical: 8, borderRadius: 999, backgroundColor: '#FFF3E8' },
  preferenceTagText: { fontSize: 12, color: '#C65D00', fontWeight: '700' },
  emptyText: { fontSize: 13, color: Colors.gray, fontWeight: '600' },
  priceRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
  priceLabel: { fontSize: 14, color: Colors.gray, fontWeight: '500' },
  priceValue: { fontSize: 14, color: Colors.dark, fontWeight: '700' },
  priceDivider: { height: 1, backgroundColor: '#ECEEF2', marginVertical: 8 },
  totalLabel: { fontSize: 15, color: Colors.dark, fontWeight: '800' },
  totalValue: { fontSize: 15, color: '#2457A6', fontWeight: '800' },
  noticeBox: { marginTop: 12, backgroundColor: '#FFF2E9', borderRadius: 14, padding: 12 },
  noticeText: { fontSize: 12.5, color: Colors.dark, lineHeight: 18 },
  noticeBold: { fontWeight: '800' },
  seatSelectorRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: '#FAFAFB', borderRadius: 18, padding: 14 },
  seatActionBtn: { width: 38, height: 38, borderRadius: 12, borderWidth: 1, borderColor: '#D6DDE7', alignItems: 'center', justifyContent: 'center', backgroundColor: 'white' },
  seatCountWrap: { flexDirection: 'row', alignItems: 'baseline' },
  seatCountText: { fontSize: 28, fontWeight: '900', color: Colors.dark },
  seatAvailableText: { fontSize: 13, color: Colors.gray, marginLeft: 6, fontWeight: '600' },
  cancelBookingBtn: {
    marginTop: 16,
    backgroundColor: '#FEF2F2',
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#EF4444',
  },
  cancelBookingBtnText: {
    color: '#EF4444',
    fontWeight: '700',
    fontSize: 14,
  },
  simpleInfoLeft: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  safetyCard: { backgroundColor: '#FFF3E7', borderRadius: 18, padding: 16, marginBottom: 14 },
  safetyTitle: { fontSize: 14, color: '#2457A6', fontWeight: '800' },
  safetySub: { marginTop: 2, fontSize: 12, color: '#2457A6', opacity: 0.9, fontWeight: '600' },
  bottomBar: { position: 'absolute', left: 0, right: 0, bottom: 0, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 16, paddingTop: 12, paddingBottom: Platform.OS === 'ios' ? 28 : 16, backgroundColor: 'white', borderTopWidth: 1, borderTopColor: '#ECEEF2' },
  bottomCaption: { fontSize: 12, color: Colors.gray, fontWeight: '500' },
  bottomTotal: { fontSize: 26, color: Colors.dark, fontWeight: '900', marginTop: 2 },
  bookNowBtn: { backgroundColor: '#FF7A00', paddingHorizontal: 24, paddingVertical: 14, borderRadius: 22, minWidth: 128, alignItems: 'center', justifyContent: 'center' },
  modifyBtn: { backgroundColor: '#2457A6' },
  bookNowBtnDisabled: { opacity: 0.7 },
  bookNowText: { color: 'white', fontSize: 16, fontWeight: '800' },
  loaderContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#fff' },
  modalBackdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center' },
  confirmModalContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  confirmModalContent: { backgroundColor: 'white', borderRadius: 24, padding: 24, width: '85%', alignItems: 'center' },
  confirmModalHeader: { alignItems: 'center', marginBottom: 16 },
  confirmModalTitle: { fontSize: 20, fontWeight: '800', color: Colors.dark, marginTop: 12 },
  confirmModalMessage: { fontSize: 14, color: Colors.gray, textAlign: 'center', marginBottom: 24, lineHeight: 20 },
  confirmModalButtons: { flexDirection: 'row', gap: 12, width: '100%' },
  confirmModalBtn: { flex: 1, paddingVertical: 12, borderRadius: 12, alignItems: 'center' },
  confirmModalCancelBtn: { backgroundColor: '#F3F4F6' },
  confirmModalCancelBtnText: { color: Colors.dark, fontWeight: '700' },
  confirmModalConfirmBtn: { backgroundColor: '#EF4444' },
  confirmModalConfirmBtnText: { color: 'white', fontWeight: '700' },
  imageModalContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', width: '100%' },
  imageModalContent: { width: '90%', backgroundColor: Colors.white, borderRadius: 20, overflow: 'hidden', maxHeight: '80%' },
  imageModalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 16, borderBottomWidth: 1, borderBottomColor: '#EEF2F7' },
  imageModalTitle: { fontSize: 18, fontWeight: '700', color: Colors.dark },
  fullProfileImage: { width: '100%', height: 400, backgroundColor: '#F5F5F5' },
  modalSvgContainer: { width: '100%', height: 400, backgroundColor: '#F5F5F5', alignItems: 'center', justifyContent: 'center' },
  noImageContainer: { width: '100%', height: 400, justifyContent: 'center', alignItems: 'center', backgroundColor: '#F5F5F5' },
  noImageText: { fontSize: 16, color: Colors.gray },
});