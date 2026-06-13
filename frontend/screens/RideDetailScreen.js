// // import React, { useMemo, useRef, useState, useEffect, useCallback } from 'react';
// // import {
// //   View,
// //   Text,
// //   StyleSheet,
// //   TouchableOpacity,
// //   ScrollView,
// //   Platform,
// //   StatusBar,
// //   Image,
// //   Dimensions,
// //   Animated,
// //   PanResponder,
// //   Modal
// // } from 'react-native';
// // import MapView, { Marker, Polyline, PROVIDER_GOOGLE } from 'react-native-maps';
// // import { Ionicons } from '@expo/vector-icons';
// // import LottieView from "lottie-react-native";
// // import { SvgCssUri } from 'react-native-svg/css';
// // import { Colors } from '../constants/Colors';
// // import { useAuth } from '../context/AuthContext';
// // import { API_BASE_URL } from '../config/config_ip';
// // import CustomAlert from '../components/CustomAlert';
// // import { useFocusEffect } from '@react-navigation/native';

// // const { height } = Dimensions.get('window');
// // const SAFE_TOP = Platform.OS === 'ios' ? 56 : 24;
// // const COLLAPSED_HEIGHT = 84;
// // const EXPANDED_HEIGHT = height * 0.72;

// // // Cache for driver profiles and images
// // const driverProfileCache = new Map();
// // const profileImageCache = new Map();

// // function buildImageUrl(url) {
// //   if (!url) return null;
// //   if (url.startsWith('http://') || url.startsWith('https://')) return url;
// //   return `${API_BASE_URL}${url.startsWith('/') ? '' : '/'}${url}`;
// // }

// // function getDriverInitials(name) {
// //   if (!name) return 'D';
// //   const parts = name.trim().split(' ').filter(Boolean);
// //   if (parts.length > 1) return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
// //   return parts[0].slice(0, 2).toUpperCase();
// // }

// // function parseSuggestedPoint(point) {
// //   if (!point) return null;

// //   if (Array.isArray(point) && point.length === 2) {
// //     return {
// //       longitude: Number(point[0]),
// //       latitude: Number(point[1]),
// //     };
// //   }

// //   if (point.lng != null && point.lat != null) {
// //     return {
// //       longitude: Number(point.lng),
// //       latitude: Number(point.lat),
// //     };
// //   }

// //   if (point.longitude != null && point.latitude != null) {
// //     return {
// //       longitude: Number(point.longitude),
// //       latitude: Number(point.latitude),
// //     };
// //   }

// //   return null;
// // }

// // function parseRouteCoordinates(routeCoordinates) {
// //   if (!Array.isArray(routeCoordinates)) return [];

// //   return routeCoordinates
// //     .map((item) => {
// //       if (Array.isArray(item) && item.length === 2) {
// //         return {
// //           longitude: Number(item[0]),
// //           latitude: Number(item[1]),
// //         };
// //       }
// //       return parseSuggestedPoint(item);
// //     })
// //     .filter(Boolean);
// // }

// // // Fetch user documents to check verification status
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

// // // Fetch driver profile for bio and other details
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

// // // Generic function to extract all ride preferences dynamically
// // function extractAllPreferences(ride, driverTravelPrefs) {
// //   // First try ride preferences
// //   let ridePrefs = ride?.preferences;
  
// //   // Handle if preferences is a string (JSON)
// //   if (ridePrefs && typeof ridePrefs === 'string') {
// //     try {
// //       ridePrefs = JSON.parse(ridePrefs);
// //       console.log('Parsed ride preferences from string:', ridePrefs);
// //     } catch (e) {
// //       console.log('Failed to parse preferences string:', e);
// //       ridePrefs = null;
// //     }
// //   }
  
// //   // Check if we have valid ride preferences
// //   if (ridePrefs && typeof ridePrefs === 'object' && Object.keys(ridePrefs).length > 0) {
// //     console.log('✅ Using ride preferences:', ridePrefs);
// //     return extractFromObject(ridePrefs);
// //   }
  
// //   // Fallback to driver's travel preferences
// //   if (driverTravelPrefs && typeof driverTravelPrefs === 'object' && Object.keys(driverTravelPrefs).length > 0) {
// //     console.log('✅ Using driver travel preferences as fallback:', driverTravelPrefs);
// //     return extractFromObject(driverTravelPrefs);
// //   }
  
// //   // If no preferences at all, return empty array (don't show anything)
// //   console.log('⚠️ No preferences found');
// //   return [];
// // }

// // function extractFromObject(prefs) {
// //   const allPreferences = [];

// //   Object.entries(prefs).forEach(([key, value]) => {
// //     // Skip if value is null, undefined, or empty
// //     if (value === null || value === undefined) return;
    
// //     // Format the key for display
// //     const formattedKey = key.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
    
// //     // Handle different value types
// //     if (typeof value === 'boolean') {
// //       // Only show boolean preferences if they are true
// //       if (value === true) {
// //         allPreferences.push(formattedKey);
// //       }
// //     } 
// //     else if (Array.isArray(value)) {
// //       // Handle arrays (like speak_languages: ["English"])
// //       if (value.length > 0) {
// //         allPreferences.push(`${formattedKey}: ${value.join(', ')}`);
// //       }
// //     }
// //     else if (typeof value === 'object') {
// //       // Handle nested objects if any
// //       const nestedPrefs = extractFromObject(value);
// //       allPreferences.push(...nestedPrefs);
// //     }
// //     else if (typeof value === 'string' && value.trim()) {
// //       // Handle string values (like "Chatty", "26–35", "No Preference")
// //       // Don't show if it's a false-y string
// //       const lowerValue = value.toLowerCase();
// //       if (!['false', 'no', 'none', 'null', 'undefined'].includes(lowerValue)) {
// //         allPreferences.push(`${formattedKey}: ${value}`);
// //       }
// //     }
// //     else if (typeof value === 'number') {
// //       // Handle numbers
// //       allPreferences.push(`${formattedKey}: ${value}`);
// //     }
// //   });

// //   // Remove duplicates
// //   return [...new Set(allPreferences)];
// // }

// // // Generic Preference Tag Component
// // function GenericPreferenceTag({ label }) {
// //   if (!label || label.trim() === '') return null;
  
// //   // Determine if it's a key: value pair or just a key
// //   const isKeyValue = label.includes(':');
// //   let displayText = label;
// //   let tagColor = '#FFF3E8';
// //   let textColor = '#C65D00';
  
// //   // Color coding based on preference type
// //   const lowerLabel = label.toLowerCase();
  
// //   if (lowerLabel.includes('age') || lowerLabel.includes('category')) {
// //     tagColor = '#E8F5E9';
// //     textColor = '#2E7D32';
// //   } else if (lowerLabel.includes('chat') || lowerLabel.includes('talk')) {
// //     tagColor = '#E3F2FD';
// //     textColor = '#1565C0';
// //   } else if (lowerLabel.includes('gender')) {
// //     tagColor = '#F3E5F5';
// //     textColor = '#6A1B9A';
// //   } else if (lowerLabel.includes('language') || lowerLabel.includes('speak')) {
// //     tagColor = '#FFF9C4';
// //     textColor = '#F57F17';
// //   } else if (lowerLabel.includes('verified')) {
// //     tagColor = '#E8F5E9';
// //     textColor = '#2E7D32';
// //   } else if (lowerLabel.includes('music')) {
// //     tagColor = '#E8F5E9';
// //     textColor = '#2E7D32';
// //   } else if (lowerLabel.includes('ac')) {
// //     tagColor = '#E3F2FD';
// //     textColor = '#1565C0';
// //   } else if (lowerLabel.includes('pet')) {
// //     tagColor = '#FCE4EC';
// //     textColor = '#C2185B';
// //   } else if (lowerLabel.includes('smoking')) {
// //     tagColor = '#FFEBEE';
// //     textColor = '#C62828';
// //   }
  
// //   return (
// //     <View style={[styles.preferenceTag, { backgroundColor: tagColor }]}>
// //       <Text style={[styles.preferenceTagText, { color: textColor }]}>{displayText}</Text>
// //     </View>
// //   );
// // }

// // // Profile Image Modal Component with SVG support
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
// //                     onError={(e) => console.log('Modal SVG load error:', e)}
// //                     onLoad={() => console.log('Modal SVG loaded successfully')}
// //                   />
// //                 </View>
// //               ) : (
// //                 <Image
// //                   source={{ uri: imageUrl }}
// //                   style={styles.fullProfileImage}
// //                   resizeMode="contain"
// //                   onError={(e) => console.log('Modal Image load error:', e.nativeEvent.error, 'URL:', imageUrl)}
// //                   onLoad={() => console.log('Modal Image loaded successfully:', imageUrl)}
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

// // export default function RideDetailScreen({ navigation, route }) {
// //   const { user, isAuthenticated } = useAuth();
// //   const { ride, searchData } = route.params || {};

// //   const [seatsRequested, setSeatsRequested] = useState(1);
// //   const [requestLoading, setRequestLoading] = useState(false);
// //   const [drawerExpanded, setDrawerExpanded] = useState(true);
// //   const [driverProfile, setDriverProfile] = useState(null);
// //   const [isVerified, setIsVerified] = useState(false);
// //   const [loadingProfile, setLoadingProfile] = useState(false);
// //   const [mapReady, setMapReady] = useState(false);
// //   const animatedDrawer = useRef(new Animated.Value(1)).current;
// //   const mapRef = useRef(null);
  
// //   // Profile image modal state
// //   const [selectedProfile, setSelectedProfile] = useState({
// //     visible: false,
// //     imageUrl: null,
// //     driverName: '',
// //   });
  
// //   // Custom Alert states
// //   const [alertVisible, setAlertVisible] = useState(false);
// //   const [alertConfig, setAlertConfig] = useState({
// //     title: "",
// //     message: "",
// //     icon: "check-circle",
// //     iconColor: "#10B981",
// //     buttons: []
// //   });

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

// //   const showConfirmationAlert = (title, message, onConfirm) => {
// //     setAlertConfig({
// //       title,
// //       message,
// //       icon: "warning",
// //       iconColor: "#F59E0B",
// //       buttons: [
// //         { text: 'Cancel', onPress: () => setAlertVisible(false), style: 'cancel' },
// //         { text: 'Login', onPress: () => {
// //           setAlertVisible(false);
// //           onConfirm();
// //         }, style: 'destructive' }
// //       ]
// //     });
// //     setAlertVisible(true);
// //   };

// //   // Fetch driver profile and verification status with caching
// //   useEffect(() => {
// //     const loadDriverData = async () => {
// //       const driverPhone = ride?.phoneNumber;
// //       const driverUserId = ride?.driverUserId;
// //       const cacheKey = driverPhone || driverUserId || ride?.id;
      
// //       // Check cache first
// //       if (driverProfileCache.has(cacheKey)) {
// //         console.log('📦 Using cached driver profile for:', cacheKey);
// //         const cached = driverProfileCache.get(cacheKey);
// //         setDriverProfile(cached.profile);
// //         setIsVerified(cached.isVerified);
// //         setLoadingProfile(false);
// //         return;
// //       }
      
// //       if (driverPhone || driverUserId) {
// //         setLoadingProfile(true);
        
// //         const profileData = await fetchDriverProfile(driverPhone, driverUserId);
// //         if (profileData?.success && profileData.user) {
// //           setDriverProfile(profileData.user);
// //         }
        
// //         let verified = false;
// //         if (driverPhone) {
// //           const docsData = await fetchUserDocuments(driverPhone);
// //           if (docsData?.success && docsData.documents) {
// //             const verifiedDocs = docsData.documents.filter(doc => {
// //               const status = doc.status?.toUpperCase();
// //               return status === 'APPROVED' && ['aadhar', 'dl', 'rc'].includes(doc.document_type?.toLowerCase());
// //             });
// //             verified = verifiedDocs.length > 0;
// //             setIsVerified(verified);
// //           }
// //         }
        
// //         // Cache the results
// //         driverProfileCache.set(cacheKey, {
// //           profile: profileData?.user,
// //           isVerified: verified
// //         });
        
// //         setLoadingProfile(false);
// //       }
// //     };
    
// //     loadDriverData();
// //   }, [ride]);

// //   useEffect(() => {
// //     if (!isAuthenticated) {
// //       showConfirmationAlert(
// //         'Login Required',
// //         'Please login to book rides or chat with drivers.',
// //         () => navigation.navigate('Login')
// //       );
// //       navigation.goBack();
// //     }
// //   }, [isAuthenticated, navigation]);

// //   // Get profile photo URL with caching
// //   const getProfilePhotoUrl = useCallback(() => {
// //     const driverId = ride?.phoneNumber || ride?.driverUserId || ride?.id;
// //     const rawUrl = driverProfile?.profile_picture || ride?.profilePicture;
    
// //     if (!rawUrl) return null;
    
// //     // Check cache first
// //     if (profileImageCache.has(driverId)) {
// //       return profileImageCache.get(driverId);
// //     }
    
// //     const fullUrl = buildImageUrl(rawUrl);
// //     if (fullUrl) {
// //       profileImageCache.set(driverId, fullUrl);
// //     }
// //     return fullUrl;
// //   }, [driverProfile, ride]);
  
// //   const profilePhotoUrl = getProfilePhotoUrl();
// //   const avatarText = getDriverInitials(driverProfile?.full_name || ride?.driverName || 'Driver');
// //   const isProfilePhotoSvg = profilePhotoUrl ? profilePhotoUrl.toLowerCase().includes('.svg') : false;
  
// //   // Extract preferences from ride or driver profile
// //   const allPreferences = useMemo(() => {
// //     return extractAllPreferences(ride, driverProfile?.travel_preferences);
// //   }, [ride, driverProfile]);

// //   // Driver route points
// //   const driverStart = useMemo(() => {
// //     const coords = ride?.routeCoordinates;
// //     if (Array.isArray(coords) && coords.length > 0) {
// //       const first = coords[0];
// //       if (Array.isArray(first) && first.length === 2) {
// //         return { latitude: first[1], longitude: first[0] };
// //       }
// //     }
// //     return parseSuggestedPoint(ride?.suggestedPickup);
// //   }, [ride]);

// //   const driverEnd = useMemo(() => {
// //     const coords = ride?.routeCoordinates;
// //     if (Array.isArray(coords) && coords.length > 0) {
// //       const last = coords[coords.length - 1];
// //       if (Array.isArray(last) && last.length === 2) {
// //         return { latitude: last[1], longitude: last[0] };
// //       }
// //     }
// //     return parseSuggestedPoint(ride?.suggestedDrop);
// //   }, [ride]);

// //   const intersectionPickup = useMemo(
// //     () => parseSuggestedPoint(ride?.suggestedPickup),
// //     [ride]
// //   );
// //   const intersectionDrop = useMemo(
// //     () => parseSuggestedPoint(ride?.suggestedDrop),
// //     [ride]
// //   );

// //   const userPickup = useMemo(() => {
// //     if (!searchData?.fromCoords) return null;
// //     const c = searchData.fromCoords;
// //     if (Array.isArray(c) && c.length === 2) {
// //       return { latitude: c[1], longitude: c[0] };
// //     }
// //     return null;
// //   }, [searchData]);

// //   const userDrop = useMemo(() => {
// //     if (!searchData?.toCoords) return null;
// //     const c = searchData.toCoords;
// //     if (Array.isArray(c) && c.length === 2) {
// //       return { latitude: c[1], longitude: c[0] };
// //     }
// //     return null;
// //   }, [searchData]);

// //   const routePath = useMemo(() => {
// //     const fullRoute = parseRouteCoordinates(ride?.routeCoordinates);
// //     if (fullRoute.length >= 2) return fullRoute;
// //     if (intersectionPickup && intersectionDrop) return [intersectionPickup, intersectionDrop];
// //     return [];
// //   }, [ride, intersectionPickup, intersectionDrop]);

// //   const walkToPickupPath = useMemo(() => {
// //     if (userPickup && intersectionPickup) return [userPickup, intersectionPickup];
// //     return [];
// //   }, [userPickup, intersectionPickup]);

// //   const walkFromDropPath = useMemo(() => {
// //     if (userDrop && intersectionDrop) return [intersectionDrop, userDrop];
// //     return [];
// //   }, [userDrop, intersectionDrop]);

// //   const allMarkerCoords = useMemo(() => {
// //     const coords = [];
// //     if (driverStart) coords.push(driverStart);
// //     if (driverEnd) coords.push(driverEnd);
// //     if (userPickup) coords.push(userPickup);
// //     if (userDrop) coords.push(userDrop);
// //     if (intersectionPickup) coords.push(intersectionPickup);
// //     if (intersectionDrop) coords.push(intersectionDrop);
// //     return coords;
// //   }, [driverStart, driverEnd, userPickup, userDrop, intersectionPickup, intersectionDrop]);

// //   // Fit map to show all markers when map is ready
// //   const fitMapToMarkers = useCallback(() => {
// //     if (mapRef.current && mapReady && allMarkerCoords.length >= 2) {
// //       setTimeout(() => {
// //         try {
// //           mapRef.current.fitToCoordinates(allMarkerCoords, {
// //             edgePadding: { top: 80, right: 50, bottom: 50, left: 50 },
// //             animated: true,
// //           });
// //         } catch (e) {
// //           console.log('fitToCoordinates error:', e);
// //         }
// //       }, 500);
// //     }
// //   }, [mapReady, allMarkerCoords]);

// //   useEffect(() => {
// //     if (mapReady && allMarkerCoords.length >= 2) {
// //       fitMapToMarkers();
// //     }
// //   }, [mapReady, allMarkerCoords, fitMapToMarkers]);

// //   const vehicleName = driverProfile?.vehicle 
// //     ? [driverProfile.vehicle.model].filter(Boolean).join(' ')
// //     : [ride?.vehicle?.model].filter(Boolean).join(' ') || 'Vehicle details unavailable';
  
// //   const vehicleRegNumber = driverProfile?.vehicle?.registration_number || 
// //                            ride?.vehicle?.registration_number || 
// //                            null;
  
// //   const vehicleColor = driverProfile?.vehicle?.color || 
// //                        ride?.vehicle?.color || 
// //                        'Not specified';

// //   const totalPrice = Number(ride?.price || 0) * seatsRequested;

// //   const handleProfileImagePress = () => {
// //     if (profilePhotoUrl) {
// //       setSelectedProfile({
// //         visible: true,
// //         imageUrl: profilePhotoUrl,
// //         driverName: driverProfile?.full_name || ride?.driverName || 'Driver',
// //       });
// //     } else {
// //       showCustomAlert('No Photo', 'Driver has not uploaded a profile picture', 'warning');
// //     }
// //   };

// //   const mapHeight = animatedDrawer.interpolate({
// //     inputRange: [0, 1],
// //     outputRange: [height - SAFE_TOP - COLLAPSED_HEIGHT, height * 0.32],
// //   });

// //   const drawerHeight = animatedDrawer.interpolate({
// //     inputRange: [0, 1],
// //     outputRange: [COLLAPSED_HEIGHT, EXPANDED_HEIGHT],
// //   });

// //   const toggleDrawer = () => {
// //     const nextExpanded = !drawerExpanded;
// //     setDrawerExpanded(nextExpanded);

// //     Animated.timing(animatedDrawer, {
// //       toValue: nextExpanded ? 1 : 0,
// //       duration: 260,
// //       useNativeDriver: false,
// //     }).start();
// //   };

// //   const panResponder = useRef(
// //     PanResponder.create({
// //       onMoveShouldSetPanResponder: (_, gestureState) =>
// //         Math.abs(gestureState.dy) > 5,
// //       onPanResponderMove: (_, gestureState) => {
// //         const dragRange = EXPANDED_HEIGHT - COLLAPSED_HEIGHT;
// //         const progress = drawerExpanded
// //           ? 1 - (gestureState.dy / dragRange)
// //           : gestureState.dy / dragRange;
// //         const clamped = Math.max(0, Math.min(1, progress));
// //         animatedDrawer.setValue(clamped);
// //       },
// //       onPanResponderRelease: (_, gestureState) => {
// //         const dragRange = EXPANDED_HEIGHT - COLLAPSED_HEIGHT;
// //         const threshold = dragRange * 0.2;
// //         if (drawerExpanded) {
// //           if (gestureState.dy > threshold) {
// //             setDrawerExpanded(false);
// //             Animated.timing(animatedDrawer, {
// //               toValue: 0,
// //               duration: 200,
// //               useNativeDriver: false,
// //             }).start();
// //           } else {
// //             setDrawerExpanded(true);
// //             Animated.timing(animatedDrawer, {
// //               toValue: 1,
// //               duration: 200,
// //               useNativeDriver: false,
// //             }).start();
// //           }
// //         } else {
// //           if (gestureState.dy < -threshold) {
// //             setDrawerExpanded(true);
// //             Animated.timing(animatedDrawer, {
// //               toValue: 1,
// //               duration: 200,
// //               useNativeDriver: false,
// //             }).start();
// //           } else {
// //             setDrawerExpanded(false);
// //             Animated.timing(animatedDrawer, {
// //               toValue: 0,
// //               duration: 200,
// //               useNativeDriver: false,
// //             }).start();
// //           }
// //         }
// //       },
// //     })
// //   ).current;

// //   const handleRequestJoin = async () => {
// //     if (!user?.phone_number) {
// //       showCustomAlert('Login Required', 'Please log in to request a ride.', 'warning');
// //       return;
// //     }

// //     setRequestLoading(true);
// //     try {
// //       const payload = {
// //         ride_id: ride.id,
// //         passenger_phone: user.phone_number,
// //         seats_requested: seatsRequested,
// //       };

// //       if (searchData?.fromCoords && Array.isArray(searchData.fromCoords)) {
// //         payload.from_coords = searchData.fromCoords;
// //       }
// //       if (searchData?.toCoords && Array.isArray(searchData.toCoords)) {
// //         payload.to_coords = searchData.toCoords;
// //       }

// //       const response = await fetch(`${API_BASE_URL}/ride-bookings`, {
// //         method: 'POST',
// //         headers: { 'Content-Type': 'application/json' },
// //         body: JSON.stringify(payload),
// //       });

// //       const raw = await response.text();
// //       let data = {};

// //       try {
// //         data = raw ? JSON.parse(raw) : {};
// //       } catch {
// //         data.detail = raw;
// //       }

// //       if (!response.ok) {
// //         console.error('Booking error response:', raw);
// //         throw new Error(data.detail || data.message || `Server error (${response.status})`);
// //       }

// //       showCustomAlert('Success', data.message || 'Ride request sent successfully', 'success');
// //       setTimeout(() => navigation.goBack(), 1500);
// //     } catch (error) {
// //       showCustomAlert('Error', error.message || 'Failed to send request', 'error');
// //     } finally {
// //       setRequestLoading(false);
// //     }
// //   };

// //   const viewDriverProfile = () => {
// //     const driverPhone = ride?.phoneNumber;
// //     const driverUserId = ride?.driverUserId;
    
// //     if (driverPhone || driverUserId) {
// //       navigation.navigate('ViewProfileScreen', {
// //         userId: driverUserId || null,
// //         phoneNumber: driverPhone || null,
// //         driverName: driverProfile?.full_name || ride?.driverName || 'Driver',
// //         profilePicture: profilePhotoUrl,
// //         vehicleNumber: vehicleRegNumber,
// //         vehicleModel: vehicleName,
// //         driverRating: driverProfile?.avg_rating || ride?.rating || 0,
// //       });
// //     } else {
// //       showCustomAlert('Profile', 'Driver profile not available', 'warning');
// //     }
// //   };

// //   const getOrCreateConversation = async (receiverPhone, rideId) => {
// //     try {
// //       const myPhone = user?.phone_number;
// //       if (!myPhone) {
// //         showCustomAlert('Login Required', 'Please log in to use chat.', 'warning');
// //         return null;
// //       }
// //       const response = await fetch(`${API_BASE_URL}/api/chat/conversations`, {
// //         method: 'POST',
// //         headers: {
// //           'X-Phone-Number': myPhone,
// //           'Content-Type': 'application/json',
// //         },
// //         body: JSON.stringify({ participant_phone: receiverPhone, ride_id: rideId }),
// //       });
// //       const data = await response.json();
// //       if (data.success) {
// //         return data.conversation.id;
// //       }
// //       console.error('Failed to create conversation:', data);
// //       return null;
// //     } catch (error) {
// //       console.error('getOrCreateConversation error:', error);
// //       return null;
// //     }
// //   };

// //   const startChat = async () => {
// //     const driverPhone = ride?.phoneNumber;
// //     if (driverPhone) {
// //       const conversationId = await getOrCreateConversation(driverPhone, ride.id);
// //       if (conversationId) {
// //         navigation.navigate('ChatScreen', {
// //           receiverPhone: driverPhone,
// //           conversationId,
// //           user: {
// //             name: driverProfile?.full_name || ride?.driverName || 'Driver',
// //             tripInfo: `${ride.from || 'Pickup'} → ${ride.to || 'Drop'}`,
// //           },
// //         });
// //       } else {
// //         showCustomAlert('Chat', 'Unable to start chat. Please try again.', 'error');
// //       }
// //     } else {
// //       showCustomAlert('Chat', 'Driver contact not available', 'warning');
// //     }
// //   };

// //   // Loading state
// //   if (requestLoading || loadingProfile) {
// //     return (
// //       <View style={styles.loaderContainer}>
// //         <LottieView
// //           source={require("../assets/loading.json")}
// //           autoPlay
// //           loop
// //           style={{ width: 300, height: 300 }}
// //         />
// //       </View>
// //     );
// //   }

// //   if (!ride) {
// //     return (
// //       <View style={styles.centerContainer}>
// //         <Text style={styles.errorText}>No ride data available</Text>
// //         <TouchableOpacity
// //           onPress={() => navigation.goBack()}
// //           style={styles.fallbackBtn}
// //         >
// //           <Text style={styles.fallbackBtnText}>Go Back</Text>
// //         </TouchableOpacity>
// //       </View>
// //     );
// //   }

// //   const initialRegion = {
// //     latitude: intersectionPickup?.latitude || driverStart?.latitude || 28.6139,
// //     longitude: intersectionPickup?.longitude || driverStart?.longitude || 77.2090,
// //     latitudeDelta: 0.05,
// //     longitudeDelta: 0.05,
// //   };

// //   return (
// //     <View style={styles.container}>
// //       <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />

// //       <Animated.View style={[styles.mapContainer, { height: mapHeight }]}>
// //         <MapView
// //           ref={mapRef}
// //           provider={PROVIDER_GOOGLE}
// //           style={styles.map}
// //           initialRegion={initialRegion}
// //           onMapReady={() => {
// //             console.log('Map ready');
// //             setMapReady(true);
// //           }}
// //           showsUserLocation={false}
// //           showsMyLocationButton={false}
// //           zoomEnabled={true}
// //           zoomControlEnabled={true}
// //         >
// //           {routePath.length >= 2 && (
// //             <Polyline
// //               coordinates={routePath}
// //               strokeColor="#2457A6"
// //               strokeWidth={5}
// //               lineCap="round"
// //               lineJoin="round"
// //             />
// //           )}

// //           {driverStart && (
// //             <Marker  coordinate={driverStart} anchor={{ x: 0.5, y: 1 }}>
// //               <View style={styles.markerWrapper}>
// //                 <View style={[styles.pinBubble, { backgroundColor: '#16A34A' }]}>
// //                   <Text style={styles.pinIcon}>S</Text>
// //                 </View>
// //                 <View style={[styles.pinPointer, { borderTopColor: '#16A34A' }]} />
// //               </View>
// //             </Marker>
// //           )}

// //           {driverEnd && (
// //             <Marker coordinate={driverEnd} anchor={{ x: 0.5, y: 1 }}>
// //               <View style={styles.markerWrapper}>
// //                 <View style={[styles.pinBubble, { backgroundColor: '#DC2626' }]}>
// //                   <Text style={styles.pinIcon}>E</Text>
// //                 </View>
// //                 <View style={[styles.pinPointer, { borderTopColor: '#DC2626' }]} />
// //               </View>
// //             </Marker>
// //           )}

// //           {userPickup && (
// //             <Marker coordinate={userPickup} anchor={{ x: 0.5, y: 1 }}>
// //               <View style={styles.markerWrapper}>
// //                 <View style={[styles.pinBubble, { backgroundColor: '#3B82F6' }]}>
// //                   <Ionicons name="person" size={12} color="white" />
// //                 </View>
// //                 <View style={[styles.pinPointer, { borderTopColor: '#3B82F6' }]} />
// //                 <View style={styles.pinLabelBubble}>
// //                   <Text style={styles.pinLabelText}>Your Pickup</Text>
// //                 </View>
// //               </View>
// //             </Marker>
// //           )}

// //           {userDrop && (
// //             <Marker coordinate={userDrop} anchor={{ x: 0.5, y: 1 }}>
// //               <View style={styles.markerWrapper}>
// //                 <View style={[styles.pinBubble, { backgroundColor: '#F97316' }]}>
// //                   <Ionicons name="flag" size={12} color="white" />
// //                 </View>
// //                 <View style={[styles.pinPointer, { borderTopColor: '#F97316' }]} />
// //                 <View style={styles.pinLabelBubble}>
// //                   <Text style={styles.pinLabelText}>Your Drop</Text>
// //                 </View>
// //               </View>
// //             </Marker>
// //           )}

// //           {intersectionPickup && (
// //             <Marker coordinate={intersectionPickup} anchor={{ x: 0.5, y: 1 }}>
// //               <View style={styles.markerWrapper}>
// //                 <View style={[styles.pinBubble, { backgroundColor: '#FACC15' }]}>
// //                   <Ionicons name="hand-right" size={12} color="#713F12" />
// //                 </View>
// //                 <View style={[styles.pinPointer, { borderTopColor: '#FACC15' }]} />
// //                 <View style={styles.pinLabelBubbleYellow}>
// //                   <Text style={styles.pinLabelTextYellow}>Meet Driver</Text>
// //                 </View>
// //               </View>
// //             </Marker>
// //           )}

// //           {intersectionDrop && (
// //             <Marker coordinate={intersectionDrop} anchor={{ x: 0.5, y: 1 }}>
// //               <View style={styles.markerWrapper}>
// //                 <View style={[styles.pinBubble, { backgroundColor: '#FACC15' }]}>
// //                   <Ionicons name="exit" size={12} color="#713F12" />
// //                 </View>
// //                 <View style={[styles.pinPointer, { borderTopColor: '#FACC15' }]} />
// //                 <View style={styles.pinLabelBubbleYellow}>
// //                   <Text style={styles.pinLabelTextYellow}>Exit Here</Text>
// //                 </View>
// //               </View>
// //             </Marker>
// //           )}

// //           {walkToPickupPath.length >= 2 && (
// //             <Polyline
// //               coordinates={walkToPickupPath}
// //               strokeColor="#FACC15"
// //               strokeWidth={4}
// //               lineDashPattern={[8, 6]}
// //               lineCap="round"
// //               lineJoin="round"
// //             />
// //           )}

// //           {walkFromDropPath.length >= 2 && (
// //             <Polyline
// //               coordinates={walkFromDropPath}
// //               strokeColor="#FACC15"
// //               strokeWidth={4}
// //               lineDashPattern={[8, 6]}
// //               lineCap="round"
// //               lineJoin="round"
// //             />
// //           )}
// //         </MapView>

// //         <TouchableOpacity
// //           style={styles.mapBackButton}
// //           onPress={() => navigation.goBack()}
// //         >
// //           <Ionicons name="chevron-back" size={26} color={Colors.secondary} />
// //         </TouchableOpacity>
// //       </Animated.View>

// //       <Animated.View style={[styles.drawer, { height: drawerHeight }]}>
// //         <View style={styles.handleWrap} {...panResponder.panHandlers}>
// //           <TouchableOpacity
// //             activeOpacity={0.9}
// //             onPress={toggleDrawer}
// //             style={styles.handleHitArea}
// //           >
// //             <View style={styles.handleBar} />
// //           </TouchableOpacity>
// //         </View>

// //         {!drawerExpanded ? (
// //           <View style={styles.collapsedSummary}>
// //             <View style={styles.collapsedTopRow}>
// //               <View style={{ flex: 1 }}>
// //                 <Text style={styles.collapsedDriver} numberOfLines={1}>
// //                   {driverProfile?.full_name || ride?.driverName || 'Driver'}
// //                 </Text>
// //                 <Text style={styles.collapsedSub} numberOfLines={1}>
// //                   {ride.from || 'Pickup'} → {ride.to || 'Drop'}
// //                 </Text>
// //               </View>

// //               <View style={styles.collapsedPriceWrap}>
// //                 <Text style={styles.collapsedPrice}>₹{ride.price}</Text>
// //                 <Text style={styles.collapsedPerSeat}>per seat</Text>
// //               </View>
// //             </View>
// //           </View>
// //         ) : (
// //           <>
// //             <ScrollView
// //               style={styles.drawerScroll}
// //               contentContainerStyle={styles.drawerContent}
// //               showsVerticalScrollIndicator={false}
// //             >
// //               <View style={styles.driverCard}>
// //                 <View style={styles.driverTopRow}>
// //                   <View style={styles.driverLeftWrap}>
// //                     <TouchableOpacity 
// //                       style={styles.driverAvatar} 
// //                       onPress={handleProfileImagePress}
// //                       activeOpacity={0.8}
// //                     >
// //                       {profilePhotoUrl ? (
// //                         isProfilePhotoSvg ? (
// //                           <View style={styles.svgAvatarContainer}>
// //                             <SvgCssUri
// //                               uri={profilePhotoUrl}
// //                               width={56}
// //                               height={56}
// //                               onError={(e) => console.log('SVG avatar error:', e)}
// //                               onLoad={() => console.log('SVG loaded successfully:', profilePhotoUrl)}
// //                             />
// //                           </View>
// //                         ) : (
// //                           <Image 
// //                             source={{ uri: profilePhotoUrl }} 
// //                             style={styles.avatarImg}
// //                             onError={(e) => console.log('Image load error:', e.nativeEvent.error)}
// //                             onLoad={() => console.log('Image loaded successfully:', profilePhotoUrl)}
// //                           />
// //                         )
// //                       ) : (
// //                         <Text style={styles.avatarText}>{avatarText}</Text>
// //                       )}
// //                     </TouchableOpacity>

// //                     <View style={styles.driverMeta}>
// //                       <View style={styles.driverNameRow}>
// //                         <Text style={styles.driverName}>
// //                           {driverProfile?.full_name || ride?.driverName || 'Driver'}
// //                         </Text>
// //                         {isVerified && (
// //                           <View style={styles.verifiedBadge}>
// //                             <Ionicons name="checkmark-circle" size={12} color="#2457A6" />
// //                             <Text style={styles.verifiedBadgeText}>Verified</Text>
// //                           </View>
// //                         )}
// //                       </View>

// //                       <View style={styles.ratingRow}>
// //                         <Ionicons name="star" size={13} color="#F59E0B" />
// //                         <Text style={styles.ratingText}>
// //                           {driverProfile?.avg_rating || ride?.rating || 4.5}
// //                         </Text>
// //                       </View>
// //                     </View>
// //                   </View>

// //                   <TouchableOpacity style={styles.chatButtonCircle} onPress={startChat}>
// //                     <Ionicons name="chatbubble-outline" size={20} color="#2457A6" />
// //                   </TouchableOpacity>
// //                 </View>

// //                 <Text style={styles.driverBio}>
// //                   {driverProfile?.bio || driverProfile?.about || 'Friendly driver, love meeting new people!'}
// //                 </Text>

// //                 <TouchableOpacity style={styles.profileOutlineBtn} onPress={viewDriverProfile}>
// //                   <Text style={styles.profileOutlineBtnText}>View Full Profile</Text>
// //                 </TouchableOpacity>
// //               </View>

// //               <View style={styles.cardSection}>
// //                 <Text style={styles.sectionTitle}>Trip Details</Text>

// //                 <View style={styles.tripTimelineWrap}>
// //                   <View style={styles.timelineRail}>
// //                     <View style={[styles.timelineDot, { backgroundColor: '#2457A6' }]} />
// //                     <View style={styles.timelineLine} />
// //                     <View style={[styles.timelineDot, { backgroundColor: '#FF7A00' }]} />
// //                   </View>

// //                   <View style={styles.timelineContent}>
// //                     <View style={styles.timelineItem}>
// //                       <Text style={styles.timelineLabel}>Pickup</Text>
// //                       <Text style={styles.timelinePlace}>
// //                         {ride.pickupLabel || ride.from || 'Pickup point'}
// //                       </Text>
// //                       <View style={styles.timelineMetaRow}>
// //                         <Ionicons name="time-outline" size={13} color={Colors.gray} />
// //                         <Text style={styles.timelineMetaText}>
// //                           {ride.date} at {ride.time}
// //                         </Text>
// //                       </View>
// //                     </View>

// //                     <View style={styles.timelineItem}>
// //                       <Text style={styles.timelineLabel}>Dropoff</Text>
// //                       <Text style={styles.timelinePlace}>
// //                         {ride.dropLabel || ride.to || 'Drop point'}
// //                       </Text>
// //                       <Text style={styles.timelineMetaText}>
// //                         Estimated: {ride.durationText || '--'}
// //                       </Text>
// //                     </View>
// //                   </View>
// //                 </View>
// //               </View>

// //               {/* Vehicle Details Section with Registration Number */}
// //               <View style={styles.cardSection}>
// //                 <Text style={styles.sectionTitle}>Vehicle Details</Text>

// //                 <View style={styles.vehicleHeaderRow}>
// //                   <View style={styles.vehicleIconCircle}>
// //                     <Ionicons name="car-sport-outline" size={18} color="#2457A6" />
// //                   </View>

// //                   <View style={styles.vehicleMeta}>
// //                     <Text style={styles.vehicleTitle}>{vehicleName}</Text>
// //                     <Text style={styles.vehicleSub}>
// //                       {vehicleColor} • {ride?.seatsAvailable || 4} seats
// //                     </Text>
// //                     {vehicleRegNumber && (
// //                       <View style={styles.vehicleRegContainer}>
// //                         <Text style={styles.vehicleRegText}>
// //                           Vehicle Number: {vehicleRegNumber}
// //                         </Text>
// //                       </View>
// //                     )}
// //                   </View>
// //                 </View>
// //               </View>

// //               {/* Dynamic Ride Preferences Section */}
// //               <View style={styles.cardSection}>
// //                 <Text style={styles.sectionTitle}>Ride Preferences</Text>
// //                 <View style={styles.tagRow}>
// //                   {allPreferences.length > 0 ? (
// //                     allPreferences.map((pref, index) => (
// //                       <GenericPreferenceTag key={`${pref}-${index}`} label={pref} />
// //                     ))
// //                   ) : (
// //                     <Text style={styles.emptyText}>No specific preferences added for this ride</Text>
// //                   )}
// //                 </View>
// //               </View>

// //               <View style={styles.cardSection}>
// //                 <Text style={styles.sectionTitle}>Cost Breakdown</Text>

// //                 <View style={styles.priceRow}>
// //                   <Text style={styles.priceLabel}>Base fare (per seat)</Text>
// //                   <Text style={styles.priceValue}>₹{ride.price || 0}</Text>
// //                 </View>

// //                 <View style={styles.priceRow}>
// //                   <Text style={styles.priceLabel}>Platform fee</Text>
// //                   <Text style={styles.priceValue}>₹0</Text>
// //                 </View>

// //                 <View style={styles.priceDivider} />

// //                 <View style={styles.priceRow}>
// //                   <Text style={styles.totalLabel}>Total per seat</Text>
// //                   <Text style={styles.totalValue}>₹{ride.price || 0}</Text>
// //                 </View>

// //                 <View style={styles.noticeBox}>
// //                   <Text style={styles.noticeText}>
// //                     <Text style={styles.noticeBold}>Cost-share contribution:</Text>{' '}
// //                     This is not a commercial fare. You're sharing the travel costs with the driver.
// //                   </Text>
// //                 </View>
// //               </View>

// //               <View style={styles.cardSection}>
// //                 <Text style={styles.sectionTitle}>Select Seats</Text>
// //                 <View style={styles.seatSelectorRow}>
// //                   <TouchableOpacity
// //                     style={styles.seatActionBtn}
// //                     onPress={() => setSeatsRequested(Math.max(1, seatsRequested - 1))}
// //                     disabled={seatsRequested === 1 || requestLoading}
// //                   >
// //                     <Ionicons name="remove" size={20} color={Colors.gray} />
// //                   </TouchableOpacity>

// //                   <View style={styles.seatCountWrap}>
// //                     <Text style={styles.seatCountText}>{seatsRequested}</Text>
// //                     <Text style={styles.seatAvailableText}>/ {ride.seatsAvailable} available</Text>
// //                   </View>

// //                   <TouchableOpacity
// //                     style={styles.seatActionBtn}
// //                     onPress={() => setSeatsRequested(Math.min(ride.seatsAvailable || 1, seatsRequested + 1))}
// //                     disabled={seatsRequested === ride.seatsAvailable || requestLoading}
// //                   >
// //                     <Ionicons name="add" size={20} color="#2457A6" />
// //                   </TouchableOpacity>
// //                 </View>
// //               </View>

// //               <View style={styles.safetyCard}>
// //                 <View style={styles.simpleInfoLeft}>
// //                   <Ionicons name="shield-checkmark-outline" size={18} color="#2457A6" />
// //                   <View>
// //                     <Text style={styles.safetyTitle}>Safety First</Text>
// //                     <Text style={styles.safetySub}>Live GPS tracking & 24/7 support</Text>
// //                   </View>
// //                 </View>
// //               </View>

// //               <View style={{ height: 110 }} />
// //             </ScrollView>

// //             <View style={styles.bottomBar}>
// //               <View>
// //                 <Text style={styles.bottomCaption}>Total for {seatsRequested} seat(s)</Text>
// //                 <Text style={styles.bottomTotal}>₹{totalPrice}</Text>
// //               </View>

// //               <TouchableOpacity
// //                 style={[styles.bookNowBtn, requestLoading && styles.bookNowBtnDisabled]}
// //                 onPress={handleRequestJoin}
// //                 disabled={requestLoading}
// //               >
// //                 <Text style={styles.bookNowText}>Book Now</Text>
// //               </TouchableOpacity>
// //             </View>
// //           </>
// //         )}
// //       </Animated.View>

// //       {/* Profile Image Modal */}
// //       <ProfileImageModal
// //         visible={selectedProfile.visible}
// //         imageUrl={selectedProfile.imageUrl}
// //         driverName={selectedProfile.driverName}
// //         onClose={() => setSelectedProfile({ visible: false, imageUrl: null, driverName: '' })}
// //       />

// //       {/* Custom Alert */}
// //       <CustomAlert
// //         visible={alertVisible}
// //         title={alertConfig.title}
// //         message={alertConfig.message}
// //         icon={alertConfig.icon}
// //         iconColor={alertConfig.iconColor}
// //         buttons={alertConfig.buttons}
// //         onBackdropPress={() => setAlertVisible(false)}
// //       />
// //     </View>
// //   );
// // }

// // const styles = StyleSheet.create({
// //   container: { flex: 1, backgroundColor: '#F4F5F7' },
// //   centerContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 24 },
// //   errorText: { fontSize: 18, color: Colors.gray, marginBottom: 16, textAlign: 'center' },
// //   fallbackBtn: { backgroundColor: Colors.primary, paddingHorizontal: 20, paddingVertical: 12, borderRadius: 12 },
// //   fallbackBtnText: { color: 'white', fontWeight: '700' },
// //   mapContainer: { width: '100%', overflow: 'hidden', backgroundColor: '#E8EEF7' },
// //   map: { flex: 1, backgroundColor: '#E8EEF7' },
// //   mapBackButton: { position: 'absolute', top: Platform.OS === 'ios' ? 54 : 22, left: 14, width: 42, height: 42, borderRadius: 25, backgroundColor: 'rgba(255,255,255,0.96)', alignItems: 'center', justifyContent: 'center' },
// //   markerWrapper: { alignItems: 'center' },
// //   pinBubble: { width: 28, height: 28, borderRadius: 14, borderWidth: 3, borderColor: 'white', alignItems: 'center', justifyContent: 'center', shadowColor: '#000', shadowOffset: { width: 0, height: 3 }, shadowOpacity: 0.25, shadowRadius: 4, elevation: 5 },
// //   pinPointer: { width: 0, height: 0, backgroundColor: 'transparent', borderStyle: 'solid', borderLeftWidth: 7, borderRightWidth: 7, borderTopWidth: 10, borderLeftColor: 'transparent', borderRightColor: 'transparent', marginTop: -2 },
// //   pinIcon: { fontSize: 11, fontWeight: '800', color: 'white', textAlign: 'center', lineHeight: 18 },
// //   pinLabelBubble: { backgroundColor: 'rgba(0,0,0,0.75)', borderRadius: 8, paddingHorizontal: 8, paddingVertical: 3, marginTop: 4 },
// //   pinLabelText: { color: 'white', fontSize: 10, fontWeight: '700' },
// //   pinLabelBubbleYellow: { backgroundColor: 'rgba(113, 63, 18, 0.9)', borderRadius: 8, paddingHorizontal: 8, paddingVertical: 3, marginTop: 4 },
// //   pinLabelTextYellow: { color: '#FACC15', fontSize: 10, fontWeight: '700' },
// //   drawer: { position: 'absolute', bottom: 0, left: 0, right: 0, backgroundColor: '#F4F5F7', borderTopLeftRadius: 28, borderTopRightRadius: 28, overflow: 'hidden' },
// //   handleWrap: { alignItems: 'center', paddingTop: 10, paddingBottom: 8, backgroundColor: '#F4F5F7' },
// //   handleHitArea: { paddingHorizontal: 40, paddingVertical: 10, alignItems: 'center', justifyContent: 'center' },
// //   handleBar: { width: 64, height: 6, borderRadius: 99, backgroundColor: '#CDD2D8' },
// //   collapsedSummary: { paddingHorizontal: 16, paddingTop: 4, paddingBottom: 12 },
// //   collapsedTopRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: 12 },
// //   collapsedDriver: { fontSize: 16, fontWeight: '800', color: Colors.dark },
// //   collapsedSub: { marginTop: 2, fontSize: 12, color: Colors.gray, fontWeight: '600' },
// //   collapsedPriceWrap: { alignItems: 'flex-end' },
// //   collapsedPrice: { fontSize: 18, fontWeight: '900', color: Colors.dark },
// //   collapsedPerSeat: { fontSize: 10, color: Colors.gray, fontWeight: '600' },
// //   drawerScroll: { flex: 1 },
// //   drawerContent: { paddingHorizontal: 16, paddingBottom: 16 },
// //   driverCard: { backgroundColor: 'white', borderRadius: 20, padding: 16, marginBottom: 14, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 8, elevation: 2 },
// //   driverTopRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
// //   driverLeftWrap: { flexDirection: 'row', flex: 1, paddingRight: 10 },
// //   driverAvatar: { width: 56, height: 56, borderRadius: 28, backgroundColor: '#E5E7EB', overflow: 'hidden', alignItems: 'center', justifyContent: 'center', marginRight: 12 },
// //   avatarImg: { width: 56, height: 56, borderRadius: 28 },
// //   avatarText: { fontSize: 15, fontWeight: '800', color: Colors.gray },
// //   svgAvatarContainer: {
// //     width: 56,
// //     height: 56,
// //     borderRadius: 28,
// //     overflow: 'hidden',
// //     alignItems: 'center',
// //     justifyContent: 'center',
// //     backgroundColor: '#E5E7EB',
// //   },
// //   driverMeta: { flex: 1 },
// //   driverNameRow: { flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap', gap: 6 },
// //   driverName: { fontSize: 17, fontWeight: '800', color: Colors.dark },
// //   verifiedBadge: { flexDirection: 'row', alignItems: 'center', gap: 4 },
// //   verifiedBadgeText: { fontSize: 11, color: '#2457A6', fontWeight: '700' },
// //   ratingRow: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 6 },
// //   ratingText: { fontSize: 13, color: Colors.dark, fontWeight: '700' },
// //   chatButtonCircle: { width: 42, height: 42, borderRadius: 21, backgroundColor: '#EAF1FF', alignItems: 'center', justifyContent: 'center' },
// //   driverBio: { marginTop: 12, fontSize: 14, lineHeight: 20, color: Colors.gray },
// //   profileOutlineBtn: { marginTop: 14, borderWidth: 1, borderColor: '#2457A6', borderRadius: 16, paddingVertical: 12, alignItems: 'center' },
// //   profileOutlineBtnText: { color: '#2457A6', fontWeight: '700', fontSize: 14 },
// //   cardSection: { backgroundColor: 'white', borderRadius: 20, padding: 16, marginBottom: 14, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 8, elevation: 2 },
// //   sectionTitle: { fontSize: 16, fontWeight: '800', color: Colors.dark, marginBottom: 14 },
// //   tripTimelineWrap: { flexDirection: 'row' },
// //   timelineRail: { width: 18, alignItems: 'center', marginTop: 4 },
// //   timelineDot: { width: 10, height: 10, borderRadius: 5 },
// //   timelineLine: { width: 2, flex: 1, backgroundColor: '#D8DCE3', marginVertical: 6 },
// //   timelineContent: { flex: 1, paddingLeft: 8 },
// //   timelineItem: { marginBottom: 14 },
// //   timelineLabel: { fontSize: 12, color: Colors.gray, fontWeight: '700' },
// //   timelinePlace: { fontSize: 15, color: Colors.dark, fontWeight: '700', marginTop: 4 },
// //   timelineMetaRow: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 6 },
// //   timelineMetaText: { fontSize: 12, color: Colors.gray, fontWeight: '600' },
// //   vehicleHeaderRow: { flexDirection: 'row', alignItems: 'center' },
// //   vehicleIconCircle: { width: 42, height: 42, borderRadius: 21, backgroundColor: '#EAF1FF', alignItems: 'center', justifyContent: 'center', marginRight: 12 },
// //   vehicleMeta: { flex: 1 },
// //   vehicleTitle: { fontSize: 15, fontWeight: '800', color: Colors.dark },
// //   vehicleSub: { marginTop: 3, fontSize: 12, color: Colors.gray, fontWeight: '600' },
// //   vehicleRegContainer: {
// //     flexDirection: 'row',
// //     alignItems: 'center',
// //     gap: 4,
// //     marginTop: 6,
// //     paddingTop: 6,
// //     borderTopWidth: 1,
// //     borderTopColor: '#F0F0F0',
// //   },
// //   vehicleRegText: {
// //     fontSize: 11,
// //     color: '#6B7280',
// //     fontWeight: '500',
// //   },
// //   tagRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 14 },
// //   preferenceTag: { paddingHorizontal: 12, paddingVertical: 8, borderRadius: 999, backgroundColor: '#FFF3E8' },
// //   preferenceTagText: { fontSize: 12, color: '#C65D00', fontWeight: '700' },
// //   emptyText: { fontSize: 13, color: Colors.gray, fontWeight: '600' },
// //   priceRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
// //   priceLabel: { fontSize: 14, color: Colors.gray, fontWeight: '500' },
// //   priceValue: { fontSize: 14, color: Colors.dark, fontWeight: '700' },
// //   priceDivider: { height: 1, backgroundColor: '#ECEEF2', marginVertical: 8 },
// //   totalLabel: { fontSize: 15, color: Colors.dark, fontWeight: '800' },
// //   totalValue: { fontSize: 15, color: '#2457A6', fontWeight: '800' },
// //   noticeBox: { marginTop: 12, backgroundColor: '#FFF2E9', borderRadius: 14, padding: 12 },
// //   noticeText: { fontSize: 12.5, color: Colors.dark, lineHeight: 18 },
// //   noticeBold: { fontWeight: '800' },
// //   seatSelectorRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: '#FAFAFB', borderRadius: 18, padding: 14 },
// //   seatActionBtn: { width: 38, height: 38, borderRadius: 12, borderWidth: 1, borderColor: '#D6DDE7', alignItems: 'center', justifyContent: 'center', backgroundColor: 'white' },
// //   seatCountWrap: { flexDirection: 'row', alignItems: 'baseline' },
// //   seatCountText: { fontSize: 28, fontWeight: '900', color: Colors.dark },
// //   seatAvailableText: { fontSize: 13, color: Colors.gray, marginLeft: 6, fontWeight: '600' },
// //   simpleInfoLeft: { flexDirection: 'row', alignItems: 'center', gap: 8 },
// //   safetyCard: { backgroundColor: '#FFF3E7', borderRadius: 18, padding: 16, marginBottom: 14 },
// //   safetyTitle: { fontSize: 14, color: '#2457A6', fontWeight: '800' },
// //   safetySub: { marginTop: 2, fontSize: 12, color: '#2457A6', opacity: 0.9, fontWeight: '600' },
// //   bottomBar: { position: 'absolute', left: 0, right: 0, bottom: 0, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 16, paddingTop: 12, paddingBottom: Platform.OS === 'ios' ? 28 : 16, backgroundColor: 'white', borderTopWidth: 1, borderTopColor: '#ECEEF2' },
// //   bottomCaption: { fontSize: 12, color: Colors.gray, fontWeight: '500' },
// //   bottomTotal: { fontSize: 26, color: Colors.dark, fontWeight: '900', marginTop: 2 },
// //   bookNowBtn: { backgroundColor: '#FF7A00', paddingHorizontal: 24, paddingVertical: 14, borderRadius: 22, minWidth: 128, alignItems: 'center', justifyContent: 'center' },
// //   bookNowBtnDisabled: { opacity: 0.7 },
// //   bookNowText: { color: 'white', fontSize: 16, fontWeight: '800' },
// //   loaderContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#fff' },
  
// //   // Profile Image Modal Styles
// //   modalBackdrop: {
// //     flex: 1,
// //     backgroundColor: 'rgba(0,0,0,0.9)',
// //     justifyContent: 'center',
// //     alignItems: 'center',
// //   },
// //   imageModalContainer: {
// //     flex: 1,
// //     justifyContent: 'center',
// //     alignItems: 'center',
// //     width: '100%',
// //   },
// //   imageModalContent: {
// //     width: '90%',
// //     backgroundColor: Colors.white,
// //     borderRadius: 20,
// //     overflow: 'hidden',
// //     maxHeight: '80%',
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
// //   modalSvgContainer: {
// //     width: '100%',
// //     height: 400,
// //     backgroundColor: '#F5F5F5',
// //     alignItems: 'center',
// //     justifyContent: 'center',
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
// // });
// // import React, { useMemo, useRef, useState, useEffect, useCallback } from 'react';
// // import {
// //   View,
// //   Text,
// //   StyleSheet,
// //   TouchableOpacity,
// //   ScrollView,
// //   Platform,
// //   StatusBar,
// //   Image,
// //   Dimensions,
// //   Animated,
// //   PanResponder,
// //   Modal
// // } from 'react-native';
// // import MapView, { Marker, Polyline, PROVIDER_GOOGLE } from 'react-native-maps';
// // import { Ionicons } from '@expo/vector-icons';
// // import LottieView from "lottie-react-native";
// // import { SvgCssUri } from 'react-native-svg/css';
// // import { Colors } from '../constants/Colors';
// // import { useAuth } from '../context/AuthContext';
// // import { API_BASE_URL } from '../config/config_ip';
// // import CustomAlert from '../components/CustomAlert';
// // import { useFocusEffect } from '@react-navigation/native';

// // const { height } = Dimensions.get('window');
// // const SAFE_TOP = Platform.OS === 'ios' ? 56 : 24;
// // const COLLAPSED_HEIGHT = 84;
// // const EXPANDED_HEIGHT = height * 0.72;

// // // No cache - always fetch fresh data

// // function buildImageUrl(url) {
// //   if (!url) return null;
// //   if (url.startsWith('http://') || url.startsWith('https://')) return url;
// //   return `${API_BASE_URL}${url.startsWith('/') ? '' : '/'}${url}`;
// // }

// // function getDriverInitials(name) {
// //   if (!name) return 'D';
// //   const parts = name.trim().split(' ').filter(Boolean);
// //   if (parts.length > 1) return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
// //   return parts[0].slice(0, 2).toUpperCase();
// // }

// // function parseSuggestedPoint(point) {
// //   if (!point) return null;

// //   if (Array.isArray(point) && point.length === 2) {
// //     return {
// //       longitude: Number(point[0]),
// //       latitude: Number(point[1]),
// //     };
// //   }

// //   if (point.lng != null && point.lat != null) {
// //     return {
// //       longitude: Number(point.lng),
// //       latitude: Number(point.lat),
// //     };
// //   }

// //   if (point.longitude != null && point.latitude != null) {
// //     return {
// //       longitude: Number(point.longitude),
// //       latitude: Number(point.latitude),
// //     };
// //   }

// //   return null;
// // }

// // function parseRouteCoordinates(routeCoordinates) {
// //   if (!Array.isArray(routeCoordinates)) return [];

// //   return routeCoordinates
// //     .map((item) => {
// //       if (Array.isArray(item) && item.length === 2) {
// //         return {
// //           longitude: Number(item[0]),
// //           latitude: Number(item[1]),
// //         };
// //       }
// //       return parseSuggestedPoint(item);
// //     })
// //     .filter(Boolean);
// // }

// // // Fetch user documents to check verification status
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

// // // Fetch driver profile for bio and other details
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

// // // Generic function to extract all ride preferences dynamically
// // function extractAllPreferences(ride, driverTravelPrefs) {
// //   // First try ride preferences
// //   let ridePrefs = ride?.preferences;
  
// //   // Handle if preferences is a string (JSON)
// //   if (ridePrefs && typeof ridePrefs === 'string') {
// //     try {
// //       ridePrefs = JSON.parse(ridePrefs);
// //       console.log('Parsed ride preferences from string:', ridePrefs);
// //     } catch (e) {
// //       console.log('Failed to parse preferences string:', e);
// //       ridePrefs = null;
// //     }
// //   }
  
// //   // Check if we have valid ride preferences
// //   if (ridePrefs && typeof ridePrefs === 'object' && Object.keys(ridePrefs).length > 0) {
// //     console.log('✅ Using ride preferences:', ridePrefs);
// //     return extractFromObject(ridePrefs);
// //   }
  
// //   // Fallback to driver's travel preferences
// //   if (driverTravelPrefs && typeof driverTravelPrefs === 'object' && Object.keys(driverTravelPrefs).length > 0) {
// //     console.log('✅ Using driver travel preferences as fallback:', driverTravelPrefs);
// //     return extractFromObject(driverTravelPrefs);
// //   }
  
// //   // If no preferences at all, return empty array (don't show anything)
// //   console.log('⚠️ No preferences found');
// //   return [];
// // }

// // function extractFromObject(prefs) {
// //   const allPreferences = [];

// //   Object.entries(prefs).forEach(([key, value]) => {
// //     // Skip if value is null, undefined, or empty
// //     if (value === null || value === undefined) return;
    
// //     // Format the key for display
// //     const formattedKey = key.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
    
// //     // Handle different value types
// //     if (typeof value === 'boolean') {
// //       // Only show boolean preferences if they are true
// //       if (value === true) {
// //         allPreferences.push(formattedKey);
// //       }
// //     } 
// //     else if (Array.isArray(value)) {
// //       // Handle arrays (like speak_languages: ["English"])
// //       if (value.length > 0) {
// //         allPreferences.push(`${formattedKey}: ${value.join(', ')}`);
// //       }
// //     }
// //     else if (typeof value === 'object') {
// //       // Handle nested objects if any
// //       const nestedPrefs = extractFromObject(value);
// //       allPreferences.push(...nestedPrefs);
// //     }
// //     else if (typeof value === 'string' && value.trim()) {
// //       // Handle string values (like "Chatty", "26–35", "No Preference")
// //       // Don't show if it's a false-y string
// //       const lowerValue = value.toLowerCase();
// //       if (!['false', 'no', 'none', 'null', 'undefined'].includes(lowerValue)) {
// //         allPreferences.push(`${formattedKey}: ${value}`);
// //       }
// //     }
// //     else if (typeof value === 'number') {
// //       // Handle numbers
// //       allPreferences.push(`${formattedKey}: ${value}`);
// //     }
// //   });

// //   // Remove duplicates
// //   return [...new Set(allPreferences)];
// // }

// // // Generic Preference Tag Component
// // function GenericPreferenceTag({ label }) {
// //   if (!label || label.trim() === '') return null;
  
// //   // Determine if it's a key: value pair or just a key
// //   const isKeyValue = label.includes(':');
// //   let displayText = label;
// //   let tagColor = '#FFF3E8';
// //   let textColor = '#C65D00';
  
// //   // Color coding based on preference type
// //   const lowerLabel = label.toLowerCase();
  
// //   if (lowerLabel.includes('age') || lowerLabel.includes('category')) {
// //     tagColor = '#E8F5E9';
// //     textColor = '#2E7D32';
// //   } else if (lowerLabel.includes('chat') || lowerLabel.includes('talk')) {
// //     tagColor = '#E3F2FD';
// //     textColor = '#1565C0';
// //   } else if (lowerLabel.includes('gender')) {
// //     tagColor = '#F3E5F5';
// //     textColor = '#6A1B9A';
// //   } else if (lowerLabel.includes('language') || lowerLabel.includes('speak')) {
// //     tagColor = '#FFF9C4';
// //     textColor = '#F57F17';
// //   } else if (lowerLabel.includes('verified')) {
// //     tagColor = '#E8F5E9';
// //     textColor = '#2E7D32';
// //   } else if (lowerLabel.includes('music')) {
// //     tagColor = '#E8F5E9';
// //     textColor = '#2E7D32';
// //   } else if (lowerLabel.includes('ac')) {
// //     tagColor = '#E3F2FD';
// //     textColor = '#1565C0';
// //   } else if (lowerLabel.includes('pet')) {
// //     tagColor = '#FCE4EC';
// //     textColor = '#C2185B';
// //   } else if (lowerLabel.includes('smoking')) {
// //     tagColor = '#FFEBEE';
// //     textColor = '#C62828';
// //   }
  
// //   return (
// //     <View style={[styles.preferenceTag, { backgroundColor: tagColor }]}>
// //       <Text style={[styles.preferenceTagText, { color: textColor }]}>{displayText}</Text>
// //     </View>
// //   );
// // }

// // // Profile Image Modal Component with SVG support
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
// //                     onError={(e) => console.log('Modal SVG load error:', e)}
// //                     onLoad={() => console.log('Modal SVG loaded successfully')}
// //                   />
// //                 </View>
// //               ) : (
// //                 <Image
// //                   source={{ uri: imageUrl }}
// //                   style={styles.fullProfileImage}
// //                   resizeMode="contain"
// //                   onError={(e) => console.log('Modal Image load error:', e.nativeEvent.error, 'URL:', imageUrl)}
// //                   onLoad={() => console.log('Modal Image loaded successfully:', imageUrl)}
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

// // export default function RideDetailScreen({ navigation, route }) {
// //   const { user, isAuthenticated } = useAuth();
// //   const { ride, searchData } = route.params || {};

// //   const [seatsRequested, setSeatsRequested] = useState(1);
// //   const [requestLoading, setRequestLoading] = useState(false);
// //   const [drawerExpanded, setDrawerExpanded] = useState(true);
// //   const [driverProfile, setDriverProfile] = useState(null);
// //   const [isVerified, setIsVerified] = useState(false);
// //   const [loadingProfile, setLoadingProfile] = useState(false);
// //   const [mapReady, setMapReady] = useState(false);
// //   const animatedDrawer = useRef(new Animated.Value(1)).current;
// //   const mapRef = useRef(null);
  
// //   // Profile image modal state
// //   const [selectedProfile, setSelectedProfile] = useState({
// //     visible: false,
// //     imageUrl: null,
// //     driverName: '',
// //   });
  
// //   // Custom Alert states
// //   const [alertVisible, setAlertVisible] = useState(false);
// //   const [alertConfig, setAlertConfig] = useState({
// //     title: "",
// //     message: "",
// //     icon: "check-circle",
// //     iconColor: "#10B981",
// //     buttons: []
// //   });

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

// //   const showConfirmationAlert = (title, message, onConfirm) => {
// //     setAlertConfig({
// //       title,
// //       message,
// //       icon: "warning",
// //       iconColor: "#F59E0B",
// //       buttons: [
// //         { text: 'Cancel', onPress: () => setAlertVisible(false), style: 'cancel' },
// //         { text: 'Login', onPress: () => {
// //           setAlertVisible(false);
// //           onConfirm();
// //         }, style: 'destructive' }
// //       ]
// //     });
// //     setAlertVisible(true);
// //   };

// //   // Fetch driver profile and verification status - ALWAYS FRESH (no caching)
// //   const loadDriverData = useCallback(async () => {
// //     const driverPhone = ride?.phoneNumber;
// //     const driverUserId = ride?.driverUserId;
    
// //     if (driverPhone || driverUserId) {
// //       setLoadingProfile(true);
      
// //       try {
// //         const profileData = await fetchDriverProfile(driverPhone, driverUserId);
// //         if (profileData?.success && profileData.user) {
// //           setDriverProfile(profileData.user);
// //         } else {
// //           setDriverProfile(null);
// //         }
        
// //         let verified = false;
// //         if (driverPhone) {
// //           const docsData = await fetchUserDocuments(driverPhone);
// //           if (docsData?.success && docsData.documents) {
// //             const verifiedDocs = docsData.documents.filter(doc => {
// //               const status = doc.status?.toUpperCase();
// //               return status === 'APPROVED' && ['aadhar', 'dl', 'rc'].includes(doc.document_type?.toLowerCase());
// //             });
// //             verified = verifiedDocs.length > 0;
// //             setIsVerified(verified);
// //           }
// //         }
// //       } catch (error) {
// //         console.log('Error loading driver data:', error);
// //       } finally {
// //         setLoadingProfile(false);
// //       }
// //     }
// //   }, [ride?.phoneNumber, ride?.driverUserId]);

// //   // Refresh data whenever screen comes into focus
// //   useFocusEffect(
// //     useCallback(() => {
// //       console.log('RideDetailScreen focused - refreshing driver data');
// //       loadDriverData();
// //     }, [loadDriverData])
// //   );

// //   useEffect(() => {
// //     if (!isAuthenticated) {
// //       showConfirmationAlert(
// //         'Login Required',
// //         'Please login to book rides or chat with drivers.',
// //         () => navigation.navigate('Login')
// //       );
// //       navigation.goBack();
// //     }
// //   }, [isAuthenticated, navigation]);

// //   // Get profile photo URL - always fresh
// //   const getProfilePhotoUrl = useCallback(() => {
// //     const rawUrl = driverProfile?.profile_picture || ride?.profilePicture;
    
// //     if (!rawUrl) return null;
    
// //     const fullUrl = buildImageUrl(rawUrl);
// //     return fullUrl;
// //   }, [driverProfile, ride]);
  
// //   const profilePhotoUrl = getProfilePhotoUrl();
// //   const avatarText = getDriverInitials(driverProfile?.full_name || ride?.driverName || 'Driver');
// //   const isProfilePhotoSvg = profilePhotoUrl ? profilePhotoUrl.toLowerCase().includes('.svg') : false;
  
// //   // Extract preferences from ride or driver profile
// //   const allPreferences = useMemo(() => {
// //     return extractAllPreferences(ride, driverProfile?.travel_preferences);
// //   }, [ride, driverProfile]);

// //   // Driver route points
// //   const driverStart = useMemo(() => {
// //     const coords = ride?.routeCoordinates;
// //     if (Array.isArray(coords) && coords.length > 0) {
// //       const first = coords[0];
// //       if (Array.isArray(first) && first.length === 2) {
// //         return { latitude: first[1], longitude: first[0] };
// //       }
// //     }
// //     return parseSuggestedPoint(ride?.suggestedPickup);
// //   }, [ride]);

// //   const driverEnd = useMemo(() => {
// //     const coords = ride?.routeCoordinates;
// //     if (Array.isArray(coords) && coords.length > 0) {
// //       const last = coords[coords.length - 1];
// //       if (Array.isArray(last) && last.length === 2) {
// //         return { latitude: last[1], longitude: last[0] };
// //       }
// //     }
// //     return parseSuggestedPoint(ride?.suggestedDrop);
// //   }, [ride]);

// //   const intersectionPickup = useMemo(
// //     () => parseSuggestedPoint(ride?.suggestedPickup),
// //     [ride]
// //   );
// //   const intersectionDrop = useMemo(
// //     () => parseSuggestedPoint(ride?.suggestedDrop),
// //     [ride]
// //   );

// //   const userPickup = useMemo(() => {
// //     if (!searchData?.fromCoords) return null;
// //     const c = searchData.fromCoords;
// //     if (Array.isArray(c) && c.length === 2) {
// //       return { latitude: c[1], longitude: c[0] };
// //     }
// //     return null;
// //   }, [searchData]);

// //   const userDrop = useMemo(() => {
// //     if (!searchData?.toCoords) return null;
// //     const c = searchData.toCoords;
// //     if (Array.isArray(c) && c.length === 2) {
// //       return { latitude: c[1], longitude: c[0] };
// //     }
// //     return null;
// //   }, [searchData]);

// //   const routePath = useMemo(() => {
// //     const fullRoute = parseRouteCoordinates(ride?.routeCoordinates);
// //     if (fullRoute.length >= 2) return fullRoute;
// //     if (intersectionPickup && intersectionDrop) return [intersectionPickup, intersectionDrop];
// //     return [];
// //   }, [ride, intersectionPickup, intersectionDrop]);

// //   const walkToPickupPath = useMemo(() => {
// //     if (userPickup && intersectionPickup) return [userPickup, intersectionPickup];
// //     return [];
// //   }, [userPickup, intersectionPickup]);

// //   const walkFromDropPath = useMemo(() => {
// //     if (userDrop && intersectionDrop) return [intersectionDrop, userDrop];
// //     return [];
// //   }, [userDrop, intersectionDrop]);

// //   const allMarkerCoords = useMemo(() => {
// //     const coords = [];
// //     if (driverStart) coords.push(driverStart);
// //     if (driverEnd) coords.push(driverEnd);
// //     if (userPickup) coords.push(userPickup);
// //     if (userDrop) coords.push(userDrop);
// //     if (intersectionPickup) coords.push(intersectionPickup);
// //     if (intersectionDrop) coords.push(intersectionDrop);
// //     return coords;
// //   }, [driverStart, driverEnd, userPickup, userDrop, intersectionPickup, intersectionDrop]);

// //   // Fit map to show all markers when map is ready
// //   const fitMapToMarkers = useCallback(() => {
// //     if (mapRef.current && mapReady && allMarkerCoords.length >= 2) {
// //       setTimeout(() => {
// //         try {
// //           mapRef.current.fitToCoordinates(allMarkerCoords, {
// //             edgePadding: { top: 80, right: 50, bottom: 50, left: 50 },
// //             animated: true,
// //           });
// //         } catch (e) {
// //           console.log('fitToCoordinates error:', e);
// //         }
// //       }, 500);
// //     }
// //   }, [mapReady, allMarkerCoords]);

// //   useEffect(() => {
// //     if (mapReady && allMarkerCoords.length >= 2) {
// //       fitMapToMarkers();
// //     }
// //   }, [mapReady, allMarkerCoords, fitMapToMarkers]);

// //   const vehicleName = driverProfile?.vehicle 
// //     ? [driverProfile.vehicle.model].filter(Boolean).join(' ')
// //     : [ride?.vehicle?.model].filter(Boolean).join(' ') || 'Vehicle details unavailable';
  
// //   const vehicleRegNumber = driverProfile?.vehicle?.registration_number || 
// //                            ride?.vehicle?.registration_number || 
// //                            null;
  
// //   const vehicleColor = driverProfile?.vehicle?.color || 
// //                        ride?.vehicle?.color || 
// //                        'Not specified';

// //   const totalPrice = Number(ride?.price || 0) * seatsRequested;

// //   const handleProfileImagePress = () => {
// //     if (profilePhotoUrl) {
// //       setSelectedProfile({
// //         visible: true,
// //         imageUrl: profilePhotoUrl,
// //         driverName: driverProfile?.full_name || ride?.driverName || 'Driver',
// //       });
// //     } else {
// //       showCustomAlert('No Photo', 'Driver has not uploaded a profile picture', 'warning');
// //     }
// //   };

// //   const mapHeight = animatedDrawer.interpolate({
// //     inputRange: [0, 1],
// //     outputRange: [height - SAFE_TOP - COLLAPSED_HEIGHT, height * 0.32],
// //   });

// //   const drawerHeight = animatedDrawer.interpolate({
// //     inputRange: [0, 1],
// //     outputRange: [COLLAPSED_HEIGHT, EXPANDED_HEIGHT],
// //   });

// //   const toggleDrawer = () => {
// //     const nextExpanded = !drawerExpanded;
// //     setDrawerExpanded(nextExpanded);

// //     Animated.timing(animatedDrawer, {
// //       toValue: nextExpanded ? 1 : 0,
// //       duration: 260,
// //       useNativeDriver: false,
// //     }).start();
// //   };

// //   const panResponder = useRef(
// //     PanResponder.create({
// //       onMoveShouldSetPanResponder: (_, gestureState) =>
// //         Math.abs(gestureState.dy) > 5,
// //       onPanResponderMove: (_, gestureState) => {
// //         const dragRange = EXPANDED_HEIGHT - COLLAPSED_HEIGHT;
// //         const progress = drawerExpanded
// //           ? 1 - (gestureState.dy / dragRange)
// //           : gestureState.dy / dragRange;
// //         const clamped = Math.max(0, Math.min(1, progress));
// //         animatedDrawer.setValue(clamped);
// //       },
// //       onPanResponderRelease: (_, gestureState) => {
// //         const dragRange = EXPANDED_HEIGHT - COLLAPSED_HEIGHT;
// //         const threshold = dragRange * 0.2;
// //         if (drawerExpanded) {
// //           if (gestureState.dy > threshold) {
// //             setDrawerExpanded(false);
// //             Animated.timing(animatedDrawer, {
// //               toValue: 0,
// //               duration: 200,
// //               useNativeDriver: false,
// //             }).start();
// //           } else {
// //             setDrawerExpanded(true);
// //             Animated.timing(animatedDrawer, {
// //               toValue: 1,
// //               duration: 200,
// //               useNativeDriver: false,
// //             }).start();
// //           }
// //         } else {
// //           if (gestureState.dy < -threshold) {
// //             setDrawerExpanded(true);
// //             Animated.timing(animatedDrawer, {
// //               toValue: 1,
// //               duration: 200,
// //               useNativeDriver: false,
// //             }).start();
// //           } else {
// //             setDrawerExpanded(false);
// //             Animated.timing(animatedDrawer, {
// //               toValue: 0,
// //               duration: 200,
// //               useNativeDriver: false,
// //             }).start();
// //           }
// //         }
// //       },
// //     })
// //   ).current;
// //   // Add this function inside the RideDetailScreen component, before handleRequestJoin
// // const checkPassengerOverlap = async (departureTime, durationMinutes = 60) => {
// //   try {
// //     if (!user?.phone_number) return false;
    
// //     const url = `${API_BASE_URL}/check-passenger-overlap?phone_number=${encodeURIComponent(user.phone_number)}&departure_time=${departureTime.toISOString()}&duration_minutes=${durationMinutes}`;
// //     console.log('🔍 Checking overlap:', url);
    
// //     const response = await fetch(url);
// //     const data = await response.json();
    
// //     if (data.has_overlap) {
// //       const overlap = data.overlapping_booking;
// //       showCustomAlert(
// //         'Overlapping Ride',
// //         `You already have a confirmed booking for a ride from ${overlap.origin} to ${overlap.destination} at ${new Date(overlap.departure_time).toLocaleTimeString()}. Please complete that ride before booking another.`,
// //         'warning'
// //       );
// //       return true;
// //     }
// //     return false;
// //   } catch (error) {
// //     console.log('Error checking passenger overlap:', error);
// //     return false;
// //   }
// // };

// // // Replace the existing handleRequestJoin with this updated version
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

// //   // ✅ Check if requested seats exceed available seats
// //   const availableSeats = ride?.seatsAvailable || 0;
// //   if (seatsRequested > availableSeats) {
// //     showCustomAlert(
// //       'Not Enough Seats',
// //       `Only ${availableSeats} seat${availableSeats !== 1 ? 's' : ''} left in this ride. Please reduce your seat request.`,
// //       'warning'
// //     );
// //     return;
// //   }

// //   // ✅ Check for overlapping bookings
// //   // Parse the ride date and time
// //   let rideDateTime;
// //   if (ride?.date && ride?.time) {
// //     rideDateTime = new Date(`${ride.date} ${ride.time}`);
// //   } else if (ride?.departure_time) {
// //     rideDateTime = new Date(ride.departure_time);
// //   } else {
// //     rideDateTime = new Date();
// //   }
  
// //   // Extract duration minutes from durationText
// //   let durationMinutes = 60; // default
// //   if (ride?.durationMinutes) {
// //     durationMinutes = ride.durationMinutes;
// //   } else if (ride?.durationText) {
// //     const match = ride.durationText.match(/\d+/);
// //     if (match) durationMinutes = parseInt(match[0]);
// //   }
  
// //   const hasOverlap = await checkPassengerOverlap(rideDateTime, durationMinutes);
// //   if (hasOverlap) {
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
// // // const handleRequestJoin = async () => {
// // //   if (!user?.phone_number) {
// // //     showCustomAlert('Login Required', 'Please log in to request a ride.', 'warning');
// // //     return;
// // //   }

// // //   // ✅ Check if ride is women-only and user is not female
// // //   if (ride?.womenOnly === true && user?.gender !== 'female') {
// // //     showCustomAlert(
// // //       'Not Available', 
// // //       'This ride is for women passengers only. Please search for other rides.',
// // //       'warning'
// // //     );
// // //     return;
// // //   }

// // //   setRequestLoading(true);
// // //   try {
// // //     const payload = {
// // //       ride_id: ride.id,
// // //       passenger_phone: user.phone_number,
// // //       seats_requested: seatsRequested,
// // //     };

// // //     if (searchData?.fromCoords && Array.isArray(searchData.fromCoords)) {
// // //       payload.from_coords = searchData.fromCoords;
// // //     }
// // //     if (searchData?.toCoords && Array.isArray(searchData.toCoords)) {
// // //       payload.to_coords = searchData.toCoords;
// // //     }

// // //     const url = `${API_BASE_URL}/ride-bookings`;
// // //     console.log('📡 Booking URL:', url);
// // //     console.log('📦 Booking payload:', payload);

// // //     const response = await fetch(url, {
// // //       method: 'POST',
// // //       headers: { 
// // //         'Content-Type': 'application/json',
// // //         'Accept': 'application/json'
// // //       },
// // //       body: JSON.stringify(payload),
// // //     });

// // //     const raw = await response.text();
// // //     console.log('📥 Booking response:', raw);
    
// // //     let data = {};
// // //     try {
// // //       data = raw ? JSON.parse(raw) : {};
// // //     } catch {
// // //       data.detail = raw;
// // //     }

// // //     if (!response.ok) {
// // //       throw new Error(data.detail || data.message || `Server error (${response.status})`);
// // //     }

// // //     showCustomAlert('Success', data.message || 'Ride request sent successfully', 'success');
// // //     setTimeout(() => navigation.goBack(), 1500);
// // //   } catch (error) {
// // //     console.error('Booking error:', error);
// // //     showCustomAlert('Error', error.message || 'Failed to send request', 'error');
// // //   } finally {
// // //     setRequestLoading(false);
// // //   }
// // // };
// // //   const handleRequestJoin = async () => {
// // //   if (!user?.phone_number) {
// // //     showCustomAlert('Login Required', 'Please log in to request a ride.', 'warning');
// // //     return;
// // //   }

// // //   setRequestLoading(true);
// // //   try {
// // //     const payload = {
// // //       ride_id: ride.id,
// // //       passenger_phone: user.phone_number,
// // //       seats_requested: seatsRequested,
// // //     };

// // //     if (searchData?.fromCoords && Array.isArray(searchData.fromCoords)) {
// // //       payload.from_coords = searchData.fromCoords;
// // //     }
// // //     if (searchData?.toCoords && Array.isArray(searchData.toCoords)) {
// // //       payload.to_coords = searchData.toCoords;
// // //     }

// // //     // ✅ FIX: Use template literal without double slash
// // //     const url = `${API_BASE_URL}/ride-bookings`;
// // //     console.log('📡 Booking URL:', url);
// // //     console.log('📦 Booking payload:', payload);

// // //     const response = await fetch(url, {
// // //       method: 'POST',
// // //       headers: { 
// // //         'Content-Type': 'application/json',
// // //         'Accept': 'application/json'
// // //       },
// // //       body: JSON.stringify(payload),
// // //     });

// // //     const raw = await response.text();
// // //     console.log('📥 Booking response:', raw);
    
// // //     let data = {};
// // //     try {
// // //       data = raw ? JSON.parse(raw) : {};
// // //     } catch {
// // //       data.detail = raw;
// // //     }

// // //     if (!response.ok) {
// // //       throw new Error(data.detail || data.message || `Server error (${response.status})`);
// // //     }

// // //     showCustomAlert('Success', data.message || 'Ride request sent successfully', 'success');
// // //     setTimeout(() => navigation.goBack(), 1500);
// // //   } catch (error) {
// // //     console.error('Booking error:', error);
// // //     showCustomAlert('Error', error.message || 'Failed to send request', 'error');
// // //   } finally {
// // //     setRequestLoading(false);
// // //   }
// // // };
// //   const viewDriverProfile = () => {
// //     const driverPhone = ride?.phoneNumber;
// //     const driverUserId = ride?.driverUserId;
    
// //     if (driverPhone || driverUserId) {
// //       navigation.navigate('ViewProfileScreen', {
// //         userId: driverUserId || null,
// //         phoneNumber: driverPhone || null,
// //         driverName: driverProfile?.full_name || ride?.driverName || 'Driver',
// //         profilePicture: profilePhotoUrl,
// //         vehicleNumber: vehicleRegNumber,
// //         vehicleModel: vehicleName,
// //         driverRating: driverProfile?.avg_rating || ride?.rating || 0,
// //       });
// //     } else {
// //       showCustomAlert('Profile', 'Driver profile not available', 'warning');
// //     }
// //   };

// //   const getOrCreateConversation = async (receiverPhone, rideId) => {
// //     try {
// //       const myPhone = user?.phone_number;
// //       if (!myPhone) {
// //         showCustomAlert('Login Required', 'Please log in to use chat.', 'warning');
// //         return null;
// //       }
// //       const response = await fetch(`${API_BASE_URL}/api/chat/conversations`, {
// //         method: 'POST',
// //         headers: {
// //           'X-Phone-Number': myPhone,
// //           'Content-Type': 'application/json',
// //         },
// //         body: JSON.stringify({ participant_phone: receiverPhone, ride_id: rideId }),
// //       });
// //       const data = await response.json();
// //       if (data.success) {
// //         return data.conversation.id;
// //       }
// //       console.error('Failed to create conversation:', data);
// //       return null;
// //     } catch (error) {
// //       console.error('getOrCreateConversation error:', error);
// //       return null;
// //     }
// //   };

// //   const startChat = async () => {
// //     const driverPhone = ride?.phoneNumber;
// //     if (driverPhone) {
// //       const conversationId = await getOrCreateConversation(driverPhone, ride.id);
// //       if (conversationId) {
// //         navigation.navigate('ChatScreen', {
// //           receiverPhone: driverPhone,
// //           conversationId,
// //           user: {
// //             name: driverProfile?.full_name || ride?.driverName || 'Driver',
// //             tripInfo: `${ride.from || 'Pickup'} → ${ride.to || 'Drop'}`,
// //           },
// //         });
// //       } else {
// //         showCustomAlert('Chat', 'Unable to start chat. Please try again.', 'error');
// //       }
// //     } else {
// //       showCustomAlert('Chat', 'Driver contact not available', 'warning');
// //     }
// //   };

// //   // Loading state
// //   if (requestLoading || loadingProfile) {
// //     return (
// //       <View style={styles.loaderContainer}>
// //         <LottieView
// //           source={require("../assets/loading.json")}
// //           autoPlay
// //           loop
// //           style={{ width: 300, height: 300 }}
// //         />
// //       </View>
// //     );
// //   }

// //   if (!ride) {
// //     return (
// //       <View style={styles.centerContainer}>
// //         <Text style={styles.errorText}>No ride data available</Text>
// //         <TouchableOpacity
// //           onPress={() => navigation.goBack()}
// //           style={styles.fallbackBtn}
// //         >
// //           <Text style={styles.fallbackBtnText}>Go Back</Text>
// //         </TouchableOpacity>
// //       </View>
// //     );
// //   }

// //   const initialRegion = {
// //     latitude: intersectionPickup?.latitude || driverStart?.latitude || 28.6139,
// //     longitude: intersectionPickup?.longitude || driverStart?.longitude || 77.2090,
// //     latitudeDelta: 0.05,
// //     longitudeDelta: 0.05,
// //   };

// //   return (
// //     <View style={styles.container}>
// //       <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />

// //       <Animated.View style={[styles.mapContainer, { height: mapHeight }]}>
// //         <MapView
// //           ref={mapRef}
// //           provider={PROVIDER_GOOGLE}
// //           style={styles.map}
// //           initialRegion={initialRegion}
// //           onMapReady={() => {
// //             console.log('Map ready');
// //             setMapReady(true);
// //           }}
// //           showsUserLocation={false}
// //           showsMyLocationButton={false}
// //           zoomEnabled={true}
// //           zoomControlEnabled={true}
// //         >
// //           {routePath.length >= 2 && (
// //             <Polyline
// //               coordinates={routePath}
// //               strokeColor="#2457A6"
// //               strokeWidth={5}
// //               lineCap="round"
// //               lineJoin="round"
// //             />
// //           )}

// //           {driverStart && (
// //             <Marker  coordinate={driverStart} anchor={{ x: 0.5, y: 1 }}>
// //               <View style={styles.markerWrapper}>
// //                 <View style={[styles.pinBubble, { backgroundColor: '#16A34A' }]}>
// //                   <Text style={styles.pinIcon}>S</Text>
// //                 </View>
// //                 <View style={[styles.pinPointer, { borderTopColor: '#16A34A' }]} />
// //               </View>
// //             </Marker>
// //           )}

// //           {driverEnd && (
// //             <Marker coordinate={driverEnd} anchor={{ x: 0.5, y: 1 }}>
// //               <View style={styles.markerWrapper}>
// //                 <View style={[styles.pinBubble, { backgroundColor: '#DC2626' }]}>
// //                   <Text style={styles.pinIcon}>E</Text>
// //                 </View>
// //                 <View style={[styles.pinPointer, { borderTopColor: '#DC2626' }]} />
// //               </View>
// //             </Marker>
// //           )}

// //           {userPickup && (
// //             <Marker coordinate={userPickup} anchor={{ x: 0.5, y: 1 }}>
// //               <View style={styles.markerWrapper}>
// //                 <View style={[styles.pinBubble, { backgroundColor: '#3B82F6' }]}>
// //                   <Ionicons name="person" size={12} color="white" />
// //                 </View>
// //                 <View style={[styles.pinPointer, { borderTopColor: '#3B82F6' }]} />
// //                 <View style={styles.pinLabelBubble}>
// //                   <Text style={styles.pinLabelText}>Your Pickup</Text>
// //                 </View>
// //               </View>
// //             </Marker>
// //           )}

// //           {userDrop && (
// //             <Marker coordinate={userDrop} anchor={{ x: 0.5, y: 1 }}>
// //               <View style={styles.markerWrapper}>
// //                 <View style={[styles.pinBubble, { backgroundColor: '#F97316' }]}>
// //                   <Ionicons name="flag" size={12} color="white" />
// //                 </View>
// //                 <View style={[styles.pinPointer, { borderTopColor: '#F97316' }]} />
// //                 <View style={styles.pinLabelBubble}>
// //                   <Text style={styles.pinLabelText}>Your Drop</Text>
// //                 </View>
// //               </View>
// //             </Marker>
// //           )}

// //           {intersectionPickup && (
// //             <Marker coordinate={intersectionPickup} anchor={{ x: 0.5, y: 1 }}>
// //               <View style={styles.markerWrapper}>
// //                 <View style={[styles.pinBubble, { backgroundColor: '#FACC15' }]}>
// //                   <Ionicons name="hand-right" size={12} color="#713F12" />
// //                 </View>
// //                 <View style={[styles.pinPointer, { borderTopColor: '#FACC15' }]} />
// //                 <View style={styles.pinLabelBubbleYellow}>
// //                   <Text style={styles.pinLabelTextYellow}>Meet Driver</Text>
// //                 </View>
// //               </View>
// //             </Marker>
// //           )}

// //           {intersectionDrop && (
// //             <Marker coordinate={intersectionDrop} anchor={{ x: 0.5, y: 1 }}>
// //               <View style={styles.markerWrapper}>
// //                 <View style={[styles.pinBubble, { backgroundColor: '#FACC15' }]}>
// //                   <Ionicons name="exit" size={12} color="#713F12" />
// //                 </View>
// //                 <View style={[styles.pinPointer, { borderTopColor: '#FACC15' }]} />
// //                 <View style={styles.pinLabelBubbleYellow}>
// //                   <Text style={styles.pinLabelTextYellow}>Exit Here</Text>
// //                 </View>
// //               </View>
// //             </Marker>
// //           )}

// //           {walkToPickupPath.length >= 2 && (
// //             <Polyline
// //               coordinates={walkToPickupPath}
// //               strokeColor="#FACC15"
// //               strokeWidth={4}
// //               lineDashPattern={[8, 6]}
// //               lineCap="round"
// //               lineJoin="round"
// //             />
// //           )}

// //           {walkFromDropPath.length >= 2 && (
// //             <Polyline
// //               coordinates={walkFromDropPath}
// //               strokeColor="#FACC15"
// //               strokeWidth={4}
// //               lineDashPattern={[8, 6]}
// //               lineCap="round"
// //               lineJoin="round"
// //             />
// //           )}
// //         </MapView>

// //         <TouchableOpacity
// //           style={styles.mapBackButton}
// //           onPress={() => navigation.goBack()}
// //         >
// //           <Ionicons name="chevron-back" size={26} color={Colors.secondary} />
// //         </TouchableOpacity>
// //       </Animated.View>

// //       <Animated.View style={[styles.drawer, { height: drawerHeight }]}>
// //         <View style={styles.handleWrap} {...panResponder.panHandlers}>
// //           <TouchableOpacity
// //             activeOpacity={0.9}
// //             onPress={toggleDrawer}
// //             style={styles.handleHitArea}
// //           >
// //             <View style={styles.handleBar} />
// //           </TouchableOpacity>
// //         </View>

// //         {!drawerExpanded ? (
// //           <View style={styles.collapsedSummary}>
// //             <View style={styles.collapsedTopRow}>
// //               <View style={{ flex: 1 }}>
// //                 <Text style={styles.collapsedDriver} numberOfLines={1}>
// //                   {driverProfile?.full_name || ride?.driverName || 'Driver'}
// //                 </Text>
// //                 <Text style={styles.collapsedSub} numberOfLines={1}>
// //                   {ride.from || 'Pickup'} → {ride.to || 'Drop'}
// //                 </Text>
// //               </View>

// //               <View style={styles.collapsedPriceWrap}>
// //                 <Text style={styles.collapsedPrice}>₹{ride.price}</Text>
// //                 <Text style={styles.collapsedPerSeat}>per seat</Text>
// //               </View>
// //             </View>
// //           </View>
// //         ) : (
// //           <>
// //             <ScrollView
// //               style={styles.drawerScroll}
// //               contentContainerStyle={styles.drawerContent}
// //               showsVerticalScrollIndicator={false}
// //             >
// //               <View style={styles.driverCard}>
// //                 <View style={styles.driverTopRow}>
// //                   <View style={styles.driverLeftWrap}>
// //                     <TouchableOpacity 
// //                       style={styles.driverAvatar} 
// //                       onPress={handleProfileImagePress}
// //                       activeOpacity={0.8}
// //                     >
// //                       {profilePhotoUrl ? (
// //                         isProfilePhotoSvg ? (
// //                           <View style={styles.svgAvatarContainer}>
// //                             <SvgCssUri
// //                               uri={profilePhotoUrl}
// //                               width={56}
// //                               height={56}
// //                               onError={(e) => console.log('SVG avatar error:', e)}
// //                               onLoad={() => console.log('SVG loaded successfully:', profilePhotoUrl)}
// //                             />
// //                           </View>
// //                         ) : (
// //                           <Image 
// //                             source={{ uri: profilePhotoUrl }} 
// //                             style={styles.avatarImg}
// //                             onError={(e) => console.log('Image load error:', e.nativeEvent.error)}
// //                             onLoad={() => console.log('Image loaded successfully:', profilePhotoUrl)}
// //                           />
// //                         )
// //                       ) : (
// //                         <Text style={styles.avatarText}>{avatarText}</Text>
// //                       )}
// //                     </TouchableOpacity>

// //                     <View style={styles.driverMeta}>
// //                       <View style={styles.driverNameRow}>
// //                         <Text style={styles.driverName}>
// //                           {driverProfile?.full_name || ride?.driverName || 'Driver'}
// //                         </Text>
// //                         {isVerified && (
// //                           <View style={styles.verifiedBadge}>
// //                             <Ionicons name="checkmark-circle" size={12} color="#2457A6" />
// //                             <Text style={styles.verifiedBadgeText}>Verified</Text>
// //                           </View>
// //                         )}
// //                       </View>

// //                       <View style={styles.ratingRow}>
// //                         <Ionicons name="star" size={13} color="#F59E0B" />
// //                         <Text style={styles.ratingText}>
// //                           {driverProfile?.avg_rating || ride?.rating || 4.5}
// //                         </Text>
// //                       </View>
// //                     </View>
// //                   </View>

// //                   <TouchableOpacity style={styles.chatButtonCircle} onPress={startChat}>
// //                     <Ionicons name="chatbubble-outline" size={20} color="#2457A6" />
// //                   </TouchableOpacity>
// //                 </View>

// //                 <Text style={styles.driverBio}>
// //                   {driverProfile?.bio || driverProfile?.about || 'Friendly driver, love meeting new people!'}
// //                 </Text>

// //                 <TouchableOpacity style={styles.profileOutlineBtn} onPress={viewDriverProfile}>
// //                   <Text style={styles.profileOutlineBtnText}>View Full Profile</Text>
// //                 </TouchableOpacity>
// //               </View>

// //               <View style={styles.cardSection}>
// //                 <Text style={styles.sectionTitle}>Trip Details</Text>

// //                 <View style={styles.tripTimelineWrap}>
// //                   <View style={styles.timelineRail}>
// //                     <View style={[styles.timelineDot, { backgroundColor: '#2457A6' }]} />
// //                     <View style={styles.timelineLine} />
// //                     <View style={[styles.timelineDot, { backgroundColor: '#FF7A00' }]} />
// //                   </View>

// //                   <View style={styles.timelineContent}>
// //                     <View style={styles.timelineItem}>
// //                       <Text style={styles.timelineLabel}>Pickup</Text>
// //                       <Text style={styles.timelinePlace}>
// //                         {ride.pickupLabel || ride.from || 'Pickup point'}
// //                       </Text>
// //                       <View style={styles.timelineMetaRow}>
// //                         <Ionicons name="time-outline" size={13} color={Colors.gray} />
// //                         <Text style={styles.timelineMetaText}>
// //                           {ride.date} at {ride.time}
// //                         </Text>
// //                       </View>
// //                     </View>

// //                     <View style={styles.timelineItem}>
// //                       <Text style={styles.timelineLabel}>Dropoff</Text>
// //                       <Text style={styles.timelinePlace}>
// //                         {ride.dropLabel || ride.to || 'Drop point'}
// //                       </Text>
// //                       <Text style={styles.timelineMetaText}>
// //                         Estimated: {ride.durationText || '--'}
// //                       </Text>
// //                     </View>
// //                   </View>
// //                 </View>
// //               </View>

// //               {/* Vehicle Details Section with Registration Number */}
// //               <View style={styles.cardSection}>
// //                 <Text style={styles.sectionTitle}>Vehicle Details</Text>

// //                 <View style={styles.vehicleHeaderRow}>
// //                   <View style={styles.vehicleIconCircle}>
// //                     <Ionicons name="car-sport-outline" size={18} color="#2457A6" />
// //                   </View>

// //                   <View style={styles.vehicleMeta}>
// //                     <Text style={styles.vehicleTitle}>{vehicleName}</Text>
// //                     <Text style={styles.vehicleSub}>
// //                       {vehicleColor} • {ride?.seatsAvailable || 4} seats
// //                     </Text>
// //                     {vehicleRegNumber && (
// //                       <View style={styles.vehicleRegContainer}>
// //                         <Text style={styles.vehicleRegText}>
// //                           Vehicle Number: {vehicleRegNumber}
// //                         </Text>
// //                       </View>
// //                     )}
// //                   </View>
// //                 </View>
// //               </View>

// //               {/* Dynamic Ride Preferences Section */}
// //               <View style={styles.cardSection}>
// //                 <Text style={styles.sectionTitle}>Ride Preferences</Text>
// //                 <View style={styles.tagRow}>
// //                   {allPreferences.length > 0 ? (
// //                     allPreferences.map((pref, index) => (
// //                       <GenericPreferenceTag key={`${pref}-${index}`} label={pref} />
// //                     ))
// //                   ) : (
// //                     <Text style={styles.emptyText}>No specific preferences added for this ride</Text>
// //                   )}
// //                 </View>
// //               </View>

// //               <View style={styles.cardSection}>
// //                 <Text style={styles.sectionTitle}>Cost Breakdown</Text>

// //                 <View style={styles.priceRow}>
// //                   <Text style={styles.priceLabel}>Base fare (per seat)</Text>
// //                   <Text style={styles.priceValue}>₹{ride.price || 0}</Text>
// //                 </View>

// //                 <View style={styles.priceRow}>
// //                   <Text style={styles.priceLabel}>Platform fee</Text>
// //                   <Text style={styles.priceValue}>₹0</Text>
// //                 </View>

// //                 <View style={styles.priceDivider} />

// //                 <View style={styles.priceRow}>
// //                   <Text style={styles.totalLabel}>Total per seat</Text>
// //                   <Text style={styles.totalValue}>₹{ride.price || 0}</Text>
// //                 </View>

// //                 <View style={styles.noticeBox}>
// //                   <Text style={styles.noticeText}>
// //                     <Text style={styles.noticeBold}>Cost-share contribution:</Text>{' '}
// //                     This is not a commercial fare. You're sharing the travel costs with the driver.
// //                   </Text>
// //                 </View>
// //               </View>

// //               <View style={styles.cardSection}>
// //                 <Text style={styles.sectionTitle}>Select Seats</Text>
// //                 <View style={styles.seatSelectorRow}>
// //                   <TouchableOpacity
// //                     style={styles.seatActionBtn}
// //                     onPress={() => setSeatsRequested(Math.max(1, seatsRequested - 1))}
// //                     disabled={seatsRequested === 1 || requestLoading}
// //                   >
// //                     <Ionicons name="remove" size={20} color={Colors.gray} />
// //                   </TouchableOpacity>

// //                   <View style={styles.seatCountWrap}>
// //                     <Text style={styles.seatCountText}>{seatsRequested}</Text>
// //                     <Text style={styles.seatAvailableText}>/ {ride.seatsAvailable} available</Text>
// //                   </View>

// //                   <TouchableOpacity
// //                     style={styles.seatActionBtn}
// //                     onPress={() => setSeatsRequested(Math.min(ride.seatsAvailable || 1, seatsRequested + 1))}
// //                     disabled={seatsRequested === ride.seatsAvailable || requestLoading}
// //                   >
// //                     <Ionicons name="add" size={20} color="#2457A6" />
// //                   </TouchableOpacity>
// //                 </View>
// //               </View>

// //               <View style={styles.safetyCard}>
// //                 <View style={styles.simpleInfoLeft}>
// //                   <Ionicons name="shield-checkmark-outline" size={18} color="#2457A6" />
// //                   <View>
// //                     <Text style={styles.safetyTitle}>Safety First</Text>
// //                     <Text style={styles.safetySub}>Live GPS tracking & 24/7 support</Text>
// //                   </View>
// //                 </View>
// //               </View>

// //               <View style={{ height: 110 }} />
// //             </ScrollView>

// //             <View style={styles.bottomBar}>
// //               <View>
// //                 <Text style={styles.bottomCaption}>Total for {seatsRequested} seat(s)</Text>
// //                 <Text style={styles.bottomTotal}>₹{totalPrice}</Text>
// //               </View>

// //               <TouchableOpacity
// //                 style={[styles.bookNowBtn, requestLoading && styles.bookNowBtnDisabled]}
// //                 onPress={handleRequestJoin}
// //                 disabled={requestLoading}
// //               >
// //                 <Text style={styles.bookNowText}>Book Now</Text>
// //               </TouchableOpacity>
// //             </View>
// //           </>
// //         )}
// //       </Animated.View>

// //       {/* Profile Image Modal */}
// //       <ProfileImageModal
// //         visible={selectedProfile.visible}
// //         imageUrl={selectedProfile.imageUrl}
// //         driverName={selectedProfile.driverName}
// //         onClose={() => setSelectedProfile({ visible: false, imageUrl: null, driverName: '' })}
// //       />

// //       {/* Custom Alert */}
// //       <CustomAlert
// //         visible={alertVisible}
// //         title={alertConfig.title}
// //         message={alertConfig.message}
// //         icon={alertConfig.icon}
// //         iconColor={alertConfig.iconColor}
// //         buttons={alertConfig.buttons}
// //         onBackdropPress={() => setAlertVisible(false)}
// //       />
// //     </View>
// //   );
// // }

// // const styles = StyleSheet.create({
// //   container: { flex: 1, backgroundColor: '#F4F5F7' },
// //   centerContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 24 },
// //   errorText: { fontSize: 18, color: Colors.gray, marginBottom: 16, textAlign: 'center' },
// //   fallbackBtn: { backgroundColor: Colors.primary, paddingHorizontal: 20, paddingVertical: 12, borderRadius: 12 },
// //   fallbackBtnText: { color: 'white', fontWeight: '700' },
// //   mapContainer: { width: '100%', overflow: 'hidden', backgroundColor: '#E8EEF7' },
// //   map: { flex: 1, backgroundColor: '#E8EEF7' },
// //   mapBackButton: { position: 'absolute', top: Platform.OS === 'ios' ? 54 : 22, left: 14, width: 42, height: 42, borderRadius: 25, backgroundColor: 'rgba(255,255,255,0.96)', alignItems: 'center', justifyContent: 'center' },
// //   markerWrapper: { alignItems: 'center' },
// //   pinBubble: { width: 28, height: 28, borderRadius: 14, borderWidth: 3, borderColor: 'white', alignItems: 'center', justifyContent: 'center', shadowColor: '#000', shadowOffset: { width: 0, height: 3 }, shadowOpacity: 0.25, shadowRadius: 4, elevation: 5 },
// //   pinPointer: { width: 0, height: 0, backgroundColor: 'transparent', borderStyle: 'solid', borderLeftWidth: 7, borderRightWidth: 7, borderTopWidth: 10, borderLeftColor: 'transparent', borderRightColor: 'transparent', marginTop: -2 },
// //   pinIcon: { fontSize: 11, fontWeight: '800', color: 'white', textAlign: 'center', lineHeight: 18 },
// //   pinLabelBubble: { backgroundColor: 'rgba(0,0,0,0.75)', borderRadius: 8, paddingHorizontal: 8, paddingVertical: 3, marginTop: 4 },
// //   pinLabelText: { color: 'white', fontSize: 10, fontWeight: '700' },
// //   pinLabelBubbleYellow: { backgroundColor: 'rgba(113, 63, 18, 0.9)', borderRadius: 8, paddingHorizontal: 8, paddingVertical: 3, marginTop: 4 },
// //   pinLabelTextYellow: { color: '#FACC15', fontSize: 10, fontWeight: '700' },
// //   drawer: { position: 'absolute', bottom: 0, left: 0, right: 0, backgroundColor: '#F4F5F7', borderTopLeftRadius: 28, borderTopRightRadius: 28, overflow: 'hidden' },
// //   handleWrap: { alignItems: 'center', paddingTop: 10, paddingBottom: 8, backgroundColor: '#F4F5F7' },
// //   handleHitArea: { paddingHorizontal: 40, paddingVertical: 10, alignItems: 'center', justifyContent: 'center' },
// //   handleBar: { width: 64, height: 6, borderRadius: 99, backgroundColor: '#CDD2D8' },
// //   collapsedSummary: { paddingHorizontal: 16, paddingTop: 4, paddingBottom: 12 },
// //   collapsedTopRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: 12 },
// //   collapsedDriver: { fontSize: 16, fontWeight: '800', color: Colors.dark },
// //   collapsedSub: { marginTop: 2, fontSize: 12, color: Colors.gray, fontWeight: '600' },
// //   collapsedPriceWrap: { alignItems: 'flex-end' },
// //   collapsedPrice: { fontSize: 18, fontWeight: '900', color: Colors.dark },
// //   collapsedPerSeat: { fontSize: 10, color: Colors.gray, fontWeight: '600' },
// //   drawerScroll: { flex: 1 },
// //   drawerContent: { paddingHorizontal: 16, paddingBottom: 16 },
// //   driverCard: { backgroundColor: 'white', borderRadius: 20, padding: 16, marginBottom: 14, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 8, elevation: 2 },
// //   driverTopRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
// //   driverLeftWrap: { flexDirection: 'row', flex: 1, paddingRight: 10 },
// //   driverAvatar: { width: 56, height: 56, borderRadius: 28, backgroundColor: '#E5E7EB', overflow: 'hidden', alignItems: 'center', justifyContent: 'center', marginRight: 12 },
// //   avatarImg: { width: 56, height: 56, borderRadius: 28 },
// //   avatarText: { fontSize: 15, fontWeight: '800', color: Colors.gray },
// //   svgAvatarContainer: {
// //     width: 56,
// //     height: 56,
// //     borderRadius: 28,
// //     overflow: 'hidden',
// //     alignItems: 'center',
// //     justifyContent: 'center',
// //     backgroundColor: '#E5E7EB',
// //   },
// //   driverMeta: { flex: 1 },
// //   driverNameRow: { flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap', gap: 6 },
// //   driverName: { fontSize: 17, fontWeight: '800', color: Colors.dark },
// //   verifiedBadge: { flexDirection: 'row', alignItems: 'center', gap: 4 },
// //   verifiedBadgeText: { fontSize: 11, color: '#2457A6', fontWeight: '700' },
// //   ratingRow: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 6 },
// //   ratingText: { fontSize: 13, color: Colors.dark, fontWeight: '700' },
// //   chatButtonCircle: { width: 42, height: 42, borderRadius: 21, backgroundColor: '#EAF1FF', alignItems: 'center', justifyContent: 'center' },
// //   driverBio: { marginTop: 12, fontSize: 14, lineHeight: 20, color: Colors.gray },
// //   profileOutlineBtn: { marginTop: 14, borderWidth: 1, borderColor: '#2457A6', borderRadius: 16, paddingVertical: 12, alignItems: 'center' },
// //   profileOutlineBtnText: { color: '#2457A6', fontWeight: '700', fontSize: 14 },
// //   cardSection: { backgroundColor: 'white', borderRadius: 20, padding: 16, marginBottom: 14, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 8, elevation: 2 },
// //   sectionTitle: { fontSize: 16, fontWeight: '800', color: Colors.dark, marginBottom: 14 },
// //   tripTimelineWrap: { flexDirection: 'row' },
// //   timelineRail: { width: 18, alignItems: 'center', marginTop: 4 },
// //   timelineDot: { width: 10, height: 10, borderRadius: 5 },
// //   timelineLine: { width: 2, flex: 1, backgroundColor: '#D8DCE3', marginVertical: 6 },
// //   timelineContent: { flex: 1, paddingLeft: 8 },
// //   timelineItem: { marginBottom: 14 },
// //   timelineLabel: { fontSize: 12, color: Colors.gray, fontWeight: '700' },
// //   timelinePlace: { fontSize: 15, color: Colors.dark, fontWeight: '700', marginTop: 4 },
// //   timelineMetaRow: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 6 },
// //   timelineMetaText: { fontSize: 12, color: Colors.gray, fontWeight: '600' },
// //   vehicleHeaderRow: { flexDirection: 'row', alignItems: 'center' },
// //   vehicleIconCircle: { width: 42, height: 42, borderRadius: 21, backgroundColor: '#EAF1FF', alignItems: 'center', justifyContent: 'center', marginRight: 12 },
// //   vehicleMeta: { flex: 1 },
// //   vehicleTitle: { fontSize: 15, fontWeight: '800', color: Colors.dark },
// //   vehicleSub: { marginTop: 3, fontSize: 12, color: Colors.gray, fontWeight: '600' },
// //   vehicleRegContainer: {
// //     flexDirection: 'row',
// //     alignItems: 'center',
// //     gap: 4,
// //     marginTop: 6,
// //     paddingTop: 6,
// //     borderTopWidth: 1,
// //     borderTopColor: '#F0F0F0',
// //   },
// //   vehicleRegText: {
// //     fontSize: 11,
// //     color: '#6B7280',
// //     fontWeight: '500',
// //   },
// //   tagRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 14 },
// //   preferenceTag: { paddingHorizontal: 12, paddingVertical: 8, borderRadius: 999, backgroundColor: '#FFF3E8' },
// //   preferenceTagText: { fontSize: 12, color: '#C65D00', fontWeight: '700' },
// //   emptyText: { fontSize: 13, color: Colors.gray, fontWeight: '600' },
// //   priceRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
// //   priceLabel: { fontSize: 14, color: Colors.gray, fontWeight: '500' },
// //   priceValue: { fontSize: 14, color: Colors.dark, fontWeight: '700' },
// //   priceDivider: { height: 1, backgroundColor: '#ECEEF2', marginVertical: 8 },
// //   totalLabel: { fontSize: 15, color: Colors.dark, fontWeight: '800' },
// //   totalValue: { fontSize: 15, color: '#2457A6', fontWeight: '800' },
// //   noticeBox: { marginTop: 12, backgroundColor: '#FFF2E9', borderRadius: 14, padding: 12 },
// //   noticeText: { fontSize: 12.5, color: Colors.dark, lineHeight: 18 },
// //   noticeBold: { fontWeight: '800' },
// //   seatSelectorRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: '#FAFAFB', borderRadius: 18, padding: 14 },
// //   seatActionBtn: { width: 38, height: 38, borderRadius: 12, borderWidth: 1, borderColor: '#D6DDE7', alignItems: 'center', justifyContent: 'center', backgroundColor: 'white' },
// //   seatCountWrap: { flexDirection: 'row', alignItems: 'baseline' },
// //   seatCountText: { fontSize: 28, fontWeight: '900', color: Colors.dark },
// //   seatAvailableText: { fontSize: 13, color: Colors.gray, marginLeft: 6, fontWeight: '600' },
// //   simpleInfoLeft: { flexDirection: 'row', alignItems: 'center', gap: 8 },
// //   safetyCard: { backgroundColor: '#FFF3E7', borderRadius: 18, padding: 16, marginBottom: 14 },
// //   safetyTitle: { fontSize: 14, color: '#2457A6', fontWeight: '800' },
// //   safetySub: { marginTop: 2, fontSize: 12, color: '#2457A6', opacity: 0.9, fontWeight: '600' },
// //   bottomBar: { position: 'absolute', left: 0, right: 0, bottom: 0, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 16, paddingTop: 12, paddingBottom: Platform.OS === 'ios' ? 28 : 16, backgroundColor: 'white', borderTopWidth: 1, borderTopColor: '#ECEEF2' },
// //   bottomCaption: { fontSize: 12, color: Colors.gray, fontWeight: '500' },
// //   bottomTotal: { fontSize: 26, color: Colors.dark, fontWeight: '900', marginTop: 2 },
// //   bookNowBtn: { backgroundColor: '#FF7A00', paddingHorizontal: 24, paddingVertical: 14, borderRadius: 22, minWidth: 128, alignItems: 'center', justifyContent: 'center' },
// //   bookNowBtnDisabled: { opacity: 0.7 },
// //   bookNowText: { color: 'white', fontSize: 16, fontWeight: '800' },
// //   loaderContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#fff' },
  
// //   // Profile Image Modal Styles
// //   modalBackdrop: {
// //     flex: 1,
// //     backgroundColor: 'rgba(0,0,0,0.9)',
// //     justifyContent: 'center',
// //     alignItems: 'center',
// //   },
// //   imageModalContainer: {
// //     flex: 1,
// //     justifyContent: 'center',
// //     alignItems: 'center',
// //     width: '100%',
// //   },
// //   imageModalContent: {
// //     width: '90%',
// //     backgroundColor: Colors.white,
// //     borderRadius: 20,
// //     overflow: 'hidden',
// //     maxHeight: '80%',
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
// //   modalSvgContainer: {
// //     width: '100%',
// //     height: 400,
// //     backgroundColor: '#F5F5F5',
// //     alignItems: 'center',
// //     justifyContent: 'center',
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
// // });
// // import React, { useMemo, useRef, useState, useEffect, useCallback } from 'react';
// // import {
// //   View,
// //   Text,
// //   StyleSheet,
// //   TouchableOpacity,
// //   ScrollView,
// //   Platform,
// //   StatusBar,
// //   Image,
// //   Dimensions,
// //   Animated,
// //   PanResponder,
// //   Modal
// // } from 'react-native';
// // import MapView, { Marker, Polyline, PROVIDER_GOOGLE } from 'react-native-maps';
// // import { Ionicons } from '@expo/vector-icons';
// // import LottieView from "lottie-react-native";
// // import { SvgCssUri } from 'react-native-svg/css';
// // import { Colors } from '../constants/Colors';
// // import { useAuth } from '../context/AuthContext';
// // import { API_BASE_URL } from '../config/config_ip';
// // import CustomAlert from '../components/CustomAlert';
// // import { useFocusEffect } from '@react-navigation/native';

// // const { height } = Dimensions.get('window');
// // const SAFE_TOP = Platform.OS === 'ios' ? 56 : 24;
// // const COLLAPSED_HEIGHT = 84;
// // const EXPANDED_HEIGHT = height * 0.72;
// // const [userBooking, setUserBooking] = useState(null);

// // function buildImageUrl(url) {
// //   if (!url) return null;
// //   if (url.startsWith('http://') || url.startsWith('https://')) return url;
// //   return `${API_BASE_URL}${url.startsWith('/') ? '' : '/'}${url}`;
// // }

// // function getDriverInitials(name) {
// //   if (!name) return 'D';
// //   const parts = name.trim().split(' ').filter(Boolean);
// //   if (parts.length > 1) return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
// //   return parts[0].slice(0, 2).toUpperCase();
// // }

// // function parseSuggestedPoint(point) {
// //   if (!point) return null;

// //   if (Array.isArray(point) && point.length === 2) {
// //     return {
// //       longitude: Number(point[0]),
// //       latitude: Number(point[1]),
// //     };
// //   }

// //   if (point.lng != null && point.lat != null) {
// //     return {
// //       longitude: Number(point.lng),
// //       latitude: Number(point.lat),
// //     };
// //   }

// //   if (point.longitude != null && point.latitude != null) {
// //     return {
// //       longitude: Number(point.longitude),
// //       latitude: Number(point.latitude),
// //     };
// //   }

// //   return null;
// // }

// // function parseRouteCoordinates(routeCoordinates) {
// //   if (!Array.isArray(routeCoordinates)) return [];

// //   return routeCoordinates
// //     .map((item) => {
// //       if (Array.isArray(item) && item.length === 2) {
// //         return {
// //           longitude: Number(item[0]),
// //           latitude: Number(item[1]),
// //         };
// //       }
// //       return parseSuggestedPoint(item);
// //     })
// //     .filter(Boolean);
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

// // function extractAllPreferences(ride, driverTravelPrefs) {
// //   let ridePrefs = ride?.preferences;
  
// //   if (ridePrefs && typeof ridePrefs === 'string') {
// //     try {
// //       ridePrefs = JSON.parse(ridePrefs);
// //     } catch (e) {
// //       ridePrefs = null;
// //     }
// //   }
  
// //   if (ridePrefs && typeof ridePrefs === 'object' && Object.keys(ridePrefs).length > 0) {
// //     return extractFromObject(ridePrefs);
// //   }
  
// //   if (driverTravelPrefs && typeof driverTravelPrefs === 'object' && Object.keys(driverTravelPrefs).length > 0) {
// //     return extractFromObject(driverTravelPrefs);
// //   }
  
// //   return [];
// // }

// // function extractFromObject(prefs) {
// //   const allPreferences = [];

// //   Object.entries(prefs).forEach(([key, value]) => {
// //     if (value === null || value === undefined) return;
    
// //     const formattedKey = key.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
    
// //     if (typeof value === 'boolean') {
// //       if (value === true) {
// //         allPreferences.push(formattedKey);
// //       }
// //     } 
// //     else if (Array.isArray(value)) {
// //       if (value.length > 0) {
// //         allPreferences.push(`${formattedKey}: ${value.join(', ')}`);
// //       }
// //     }
// //     else if (typeof value === 'object') {
// //       const nestedPrefs = extractFromObject(value);
// //       allPreferences.push(...nestedPrefs);
// //     }
// //     else if (typeof value === 'string' && value.trim()) {
// //       const lowerValue = value.toLowerCase();
// //       if (!['false', 'no', 'none', 'null', 'undefined'].includes(lowerValue)) {
// //         allPreferences.push(`${formattedKey}: ${value}`);
// //       }
// //     }
// //     else if (typeof value === 'number') {
// //       allPreferences.push(`${formattedKey}: ${value}`);
// //     }
// //   });

// //   return [...new Set(allPreferences)];
// // }

// // function GenericPreferenceTag({ label }) {
// //   if (!label || label.trim() === '') return null;
  
// //   let tagColor = '#FFF3E8';
// //   let textColor = '#C65D00';
  
// //   const lowerLabel = label.toLowerCase();
  
// //   if (lowerLabel.includes('age') || lowerLabel.includes('category')) {
// //     tagColor = '#E8F5E9';
// //     textColor = '#2E7D32';
// //   } else if (lowerLabel.includes('chat') || lowerLabel.includes('talk')) {
// //     tagColor = '#E3F2FD';
// //     textColor = '#1565C0';
// //   } else if (lowerLabel.includes('gender')) {
// //     tagColor = '#F3E5F5';
// //     textColor = '#6A1B9A';
// //   } else if (lowerLabel.includes('language') || lowerLabel.includes('speak')) {
// //     tagColor = '#FFF9C4';
// //     textColor = '#F57F17';
// //   } else if (lowerLabel.includes('verified')) {
// //     tagColor = '#E8F5E9';
// //     textColor = '#2E7D32';
// //   }
  
// //   return (
// //     <View style={[styles.preferenceTag, { backgroundColor: tagColor }]}>
// //       <Text style={[styles.preferenceTagText, { color: textColor }]}>{label}</Text>
// //     </View>
// //   );
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

// // export default function RideDetailScreen({ navigation, route }) {
// //   const { user, isAuthenticated } = useAuth();
// //   const { ride, searchData } = route.params || {};

// //   const [seatsRequested, setSeatsRequested] = useState(1);
// //   const [requestLoading, setRequestLoading] = useState(false);
// //   const [drawerExpanded, setDrawerExpanded] = useState(true);
// //   const [driverProfile, setDriverProfile] = useState(null);
// //   const [isVerified, setIsVerified] = useState(false);
// //   const [loadingProfile, setLoadingProfile] = useState(false);
// //   const [mapReady, setMapReady] = useState(false);
// //   const [userBooking, setUserBooking] = useState(null);
// //   const animatedDrawer = useRef(new Animated.Value(1)).current;
// //   const mapRef = useRef(null);
  
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

// //   const showConfirmationAlert = (title, message, onConfirm) => {
// //     setAlertConfig({
// //       title,
// //       message,
// //       icon: "warning",
// //       iconColor: "#F59E0B",
// //       buttons: [
// //         { text: 'Cancel', onPress: () => setAlertVisible(false), style: 'cancel' },
// //         { text: 'Login', onPress: () => {
// //           setAlertVisible(false);
// //           onConfirm();
// //         }, style: 'destructive' }
// //       ]
// //     });
// //     setAlertVisible(true);
// //   };

// // // Function to check if user already has a booking for this ride
// // const checkUserBooking = useCallback(async () => {
// //   if (!user?.phone_number || !ride?.id) return;
  
// //   try {
// //     const response = await fetch(`${API_BASE_URL}/my-rides/${user.phone_number}`);
// //     const data = await response.json();
    
// //     const booking = data.requested_rides?.find(
// //       b => b.ride_id === ride.id && b.status === 'accepted'
// //     );
    
// //     if (booking) {
// //       setUserBooking(booking);
// //       setSeatsRequested(booking.seats_requested);
// //       console.log('📦 Found existing booking:', booking);
// //     }
// //   } catch (error) {
// //     console.log('Error checking user booking:', error);
// //   }
// // }, [user?.phone_number, ride?.id]);

// // // Call this when screen loads
// // useFocusEffect(
// //   useCallback(() => {
// //     loadDriverData();
// //     checkUserBooking();
// //   }, [loadDriverData, checkUserBooking])
// // );
// //   // // Check if user already has a booking for this ride
// //   // const checkUserBooking = useCallback(async () => {
// //   //   if (!user?.phone_number || !ride?.id) return;
    
// //   //   try {
// //   //     const response = await fetch(`${API_BASE_URL}/my-rides/${user.phone_number}`);
// //   //     const data = await response.json();
      
// //   //     const booking = data.requested_rides?.find(
// //   //       b => b.ride_id === ride.id && b.status === 'accepted'
// //   //     );
      
// //   //     if (booking) {
// //   //       setUserBooking(booking);
// //   //       setSeatsRequested(booking.seats_requested);
// //   //     }
// //   //   } catch (error) {
// //   //     console.log('Error checking user booking:', error);
// //   //   }
// //   // }, [user?.phone_number, ride?.id]);

// //   const loadDriverData = useCallback(async () => {
// //     const driverPhone = ride?.phoneNumber;
// //     const driverUserId = ride?.driverUserId;
    
// //     if (driverPhone || driverUserId) {
// //       setLoadingProfile(true);
      
// //       try {
// //         const profileData = await fetchDriverProfile(driverPhone, driverUserId);
// //         if (profileData?.success && profileData.user) {
// //           setDriverProfile(profileData.user);
// //         } else {
// //           setDriverProfile(null);
// //         }
        
// //         let verified = false;
// //         if (driverPhone) {
// //           const docsData = await fetchUserDocuments(driverPhone);
// //           if (docsData?.success && docsData.documents) {
// //             const verifiedDocs = docsData.documents.filter(doc => {
// //               const status = doc.status?.toUpperCase();
// //               return status === 'APPROVED' && ['aadhar', 'dl', 'rc'].includes(doc.document_type?.toLowerCase());
// //             });
// //             verified = verifiedDocs.length > 0;
// //             setIsVerified(verified);
// //           }
// //         }
// //       } catch (error) {
// //         console.log('Error loading driver data:', error);
// //       } finally {
// //         setLoadingProfile(false);
// //       }
// //     }
// //   }, [ride?.phoneNumber, ride?.driverUserId]);

// //   useFocusEffect(
// //     useCallback(() => {
// //       loadDriverData();
// //       checkUserBooking();
// //     }, [loadDriverData, checkUserBooking])
// //   );

// //   useEffect(() => {
// //     if (!isAuthenticated) {
// //       showConfirmationAlert(
// //         'Login Required',
// //         'Please login to book rides or chat with drivers.',
// //         () => navigation.navigate('Login')
// //       );
// //       navigation.goBack();
// //     }
// //   }, [isAuthenticated, navigation]);

// //   const getProfilePhotoUrl = useCallback(() => {
// //     const rawUrl = driverProfile?.profile_picture || ride?.profilePicture;
// //     if (!rawUrl) return null;
// //     return buildImageUrl(rawUrl);
// //   }, [driverProfile, ride]);
  
// //   const profilePhotoUrl = getProfilePhotoUrl();
// //   const avatarText = getDriverInitials(driverProfile?.full_name || ride?.driverName || 'Driver');
// //   const isProfilePhotoSvg = profilePhotoUrl ? profilePhotoUrl.toLowerCase().includes('.svg') : false;
  
// //   const allPreferences = useMemo(() => {
// //     return extractAllPreferences(ride, driverProfile?.travel_preferences);
// //   }, [ride, driverProfile]);

// //   const driverStart = useMemo(() => {
// //     const coords = ride?.routeCoordinates;
// //     if (Array.isArray(coords) && coords.length > 0) {
// //       const first = coords[0];
// //       if (Array.isArray(first) && first.length === 2) {
// //         return { latitude: first[1], longitude: first[0] };
// //       }
// //     }
// //     return parseSuggestedPoint(ride?.suggestedPickup);
// //   }, [ride]);

// //   const driverEnd = useMemo(() => {
// //     const coords = ride?.routeCoordinates;
// //     if (Array.isArray(coords) && coords.length > 0) {
// //       const last = coords[coords.length - 1];
// //       if (Array.isArray(last) && last.length === 2) {
// //         return { latitude: last[1], longitude: last[0] };
// //       }
// //     }
// //     return parseSuggestedPoint(ride?.suggestedDrop);
// //   }, [ride]);

// //   const intersectionPickup = useMemo(
// //     () => parseSuggestedPoint(ride?.suggestedPickup),
// //     [ride]
// //   );
// //   const intersectionDrop = useMemo(
// //     () => parseSuggestedPoint(ride?.suggestedDrop),
// //     [ride]
// //   );

// //   const userPickup = useMemo(() => {
// //     if (!searchData?.fromCoords) return null;
// //     const c = searchData.fromCoords;
// //     if (Array.isArray(c) && c.length === 2) {
// //       return { latitude: c[1], longitude: c[0] };
// //     }
// //     return null;
// //   }, [searchData]);

// //   const userDrop = useMemo(() => {
// //     if (!searchData?.toCoords) return null;
// //     const c = searchData.toCoords;
// //     if (Array.isArray(c) && c.length === 2) {
// //       return { latitude: c[1], longitude: c[0] };
// //     }
// //     return null;
// //   }, [searchData]);

// //   const routePath = useMemo(() => {
// //     const fullRoute = parseRouteCoordinates(ride?.routeCoordinates);
// //     if (fullRoute.length >= 2) return fullRoute;
// //     if (intersectionPickup && intersectionDrop) return [intersectionPickup, intersectionDrop];
// //     return [];
// //   }, [ride, intersectionPickup, intersectionDrop]);

// //   const walkToPickupPath = useMemo(() => {
// //     if (userPickup && intersectionPickup) return [userPickup, intersectionPickup];
// //     return [];
// //   }, [userPickup, intersectionPickup]);

// //   const walkFromDropPath = useMemo(() => {
// //     if (userDrop && intersectionDrop) return [intersectionDrop, userDrop];
// //     return [];
// //   }, [userDrop, intersectionDrop]);

// //   const allMarkerCoords = useMemo(() => {
// //     const coords = [];
// //     if (driverStart) coords.push(driverStart);
// //     if (driverEnd) coords.push(driverEnd);
// //     if (userPickup) coords.push(userPickup);
// //     if (userDrop) coords.push(userDrop);
// //     if (intersectionPickup) coords.push(intersectionPickup);
// //     if (intersectionDrop) coords.push(intersectionDrop);
// //     return coords;
// //   }, [driverStart, driverEnd, userPickup, userDrop, intersectionPickup, intersectionDrop]);

// //   const fitMapToMarkers = useCallback(() => {
// //     if (mapRef.current && mapReady && allMarkerCoords.length >= 2) {
// //       setTimeout(() => {
// //         try {
// //           mapRef.current.fitToCoordinates(allMarkerCoords, {
// //             edgePadding: { top: 80, right: 50, bottom: 50, left: 50 },
// //             animated: true,
// //           });
// //         } catch (e) {
// //           console.log('fitToCoordinates error:', e);
// //         }
// //       }, 500);
// //     }
// //   }, [mapReady, allMarkerCoords]);

// //   useEffect(() => {
// //     if (mapReady && allMarkerCoords.length >= 2) {
// //       fitMapToMarkers();
// //     }
// //   }, [mapReady, allMarkerCoords, fitMapToMarkers]);

// //   const vehicleName = driverProfile?.vehicle 
// //     ? [driverProfile.vehicle.model].filter(Boolean).join(' ')
// //     : [ride?.vehicle?.model].filter(Boolean).join(' ') || 'Vehicle details unavailable';
  
// //   const vehicleRegNumber = driverProfile?.vehicle?.registration_number || 
// //                            ride?.vehicle?.registration_number || 
// //                            null;
  
// //   const vehicleColor = driverProfile?.vehicle?.color || 
// //                        ride?.vehicle?.color || 
// //                        'Not specified';

// //   const totalPrice = Number(ride?.price || 0) * seatsRequested;

// //   const handleProfileImagePress = () => {
// //     if (profilePhotoUrl) {
// //       setSelectedProfile({
// //         visible: true,
// //         imageUrl: profilePhotoUrl,
// //         driverName: driverProfile?.full_name || ride?.driverName || 'Driver',
// //       });
// //     } else {
// //       showCustomAlert('No Photo', 'Driver has not uploaded a profile picture', 'warning');
// //     }
// //   };

// //   const mapHeight = animatedDrawer.interpolate({
// //     inputRange: [0, 1],
// //     outputRange: [height - SAFE_TOP - COLLAPSED_HEIGHT, height * 0.32],
// //   });

// //   const drawerHeight = animatedDrawer.interpolate({
// //     inputRange: [0, 1],
// //     outputRange: [COLLAPSED_HEIGHT, EXPANDED_HEIGHT],
// //   });

// //   const toggleDrawer = () => {
// //     const nextExpanded = !drawerExpanded;
// //     setDrawerExpanded(nextExpanded);

// //     Animated.timing(animatedDrawer, {
// //       toValue: nextExpanded ? 1 : 0,
// //       duration: 260,
// //       useNativeDriver: false,
// //     }).start();
// //   };

// //   const panResponder = useRef(
// //     PanResponder.create({
// //       onMoveShouldSetPanResponder: (_, gestureState) =>
// //         Math.abs(gestureState.dy) > 5,
// //       onPanResponderMove: (_, gestureState) => {
// //         const dragRange = EXPANDED_HEIGHT - COLLAPSED_HEIGHT;
// //         const progress = drawerExpanded
// //           ? 1 - (gestureState.dy / dragRange)
// //           : gestureState.dy / dragRange;
// //         const clamped = Math.max(0, Math.min(1, progress));
// //         animatedDrawer.setValue(clamped);
// //       },
// //       onPanResponderRelease: (_, gestureState) => {
// //         const dragRange = EXPANDED_HEIGHT - COLLAPSED_HEIGHT;
// //         const threshold = dragRange * 0.2;
// //         if (drawerExpanded) {
// //           if (gestureState.dy > threshold) {
// //             setDrawerExpanded(false);
// //             Animated.timing(animatedDrawer, {
// //               toValue: 0,
// //               duration: 200,
// //               useNativeDriver: false,
// //             }).start();
// //           } else {
// //             setDrawerExpanded(true);
// //             Animated.timing(animatedDrawer, {
// //               toValue: 1,
// //               duration: 200,
// //               useNativeDriver: false,
// //             }).start();
// //           }
// //         } else {
// //           if (gestureState.dy < -threshold) {
// //             setDrawerExpanded(true);
// //             Animated.timing(animatedDrawer, {
// //               toValue: 1,
// //               duration: 200,
// //               useNativeDriver: false,
// //             }).start();
// //           } else {
// //             setDrawerExpanded(false);
// //             Animated.timing(animatedDrawer, {
// //               toValue: 0,
// //               duration: 200,
// //               useNativeDriver: false,
// //             }).start();
// //           }
// //         }
// //       },
// //     })
// //   ).current;

// //   const checkPassengerOverlap = async (departureTime, durationMinutes = 60) => {
// //     try {
// //       if (!user?.phone_number) return false;
      
// //       const url = `${API_BASE_URL}/check-passenger-overlap?phone_number=${encodeURIComponent(user.phone_number)}&departure_time=${departureTime.toISOString()}&duration_minutes=${durationMinutes}`;
      
// //       const response = await fetch(url);
// //       const data = await response.json();
      
// //       if (data.has_overlap) {
// //         const overlap = data.overlapping_booking;
// //         showCustomAlert(
// //           'Overlapping Ride',
// //           `You already have a confirmed booking for a ride from ${overlap.origin} to ${overlap.destination} at ${new Date(overlap.departure_time).toLocaleTimeString()}. Please complete that ride before booking another.`,
// //           'warning'
// //         );
// //         return true;
// //       }
// //       return false;
// //     } catch (error) {
// //       console.log('Error checking passenger overlap:', error);
// //       return false;
// //     }
// //   };

// //   // const handleModifySeats = async (newSeatCount) => {
// //   //   if (!user?.phone_number) {
// //   //     showCustomAlert('Login Required', 'Please log in to modify booking.', 'warning');
// //   //     return;
// //   //   }

// //   //   setRequestLoading(true);
// //   //   try {
// //   //     const response = await fetch(`${API_BASE_URL}/booking/${userBooking.id}/modify-seats`, {
// //   //       method: 'PUT',
// //   //       headers: { 
// //   //         'Content-Type': 'application/json',
// //   //         'Accept': 'application/json'
// //   //       },
// //   //       body: JSON.stringify({ new_seats: newSeatCount }),
// //   //     });

// //   //     const data = await response.json();

// //   //     if (!response.ok) {
// //   //       throw new Error(data.detail || data.message || 'Failed to modify booking');
// //   //     }

// //   //     showCustomAlert('Success', data.message || 'Booking updated successfully', 'success');
// //   //     setUserBooking({ ...userBooking, seats_requested: newSeatCount });
// //   //   } catch (error) {
// //   //     console.error('Modify booking error:', error);
// //   //     showCustomAlert('Error', error.message || 'Failed to modify booking', 'error');
// //   //   } finally {
// //   //     setRequestLoading(false);
// //   //   }
// //   // };

// //   const handleRequestJoin = async () => {
// //     if (!user?.phone_number) {
// //       showCustomAlert('Login Required', 'Please log in to request a ride.', 'warning');
// //       return;
// //     }

// //     // If user already has a booking for this ride, modify seats instead
// //     if (userBooking) {
// //       await handleModifySeats(seatsRequested);
// //       return;
// //     }

// //     if (ride?.womenOnly === true && user?.gender !== 'female') {
// //       showCustomAlert(
// //         'Not Available', 
// //         'This ride is for women passengers only. Please search for other rides.',
// //         'warning'
// //       );
// //       return;
// //     }

// //     const availableSeats = ride?.seatsAvailable || 0;
// //     if (seatsRequested > availableSeats) {
// //       showCustomAlert(
// //         'Not Enough Seats',
// //         `Only ${availableSeats} seat${availableSeats !== 1 ? 's' : ''} left in this ride. Please reduce your seat request.`,
// //         'warning'
// //       );
// //       return;
// //     }

// //     let rideDateTime;
// //     if (ride?.date && ride?.time) {
// //       rideDateTime = new Date(`${ride.date} ${ride.time}`);
// //     } else if (ride?.departure_time) {
// //       rideDateTime = new Date(ride.departure_time);
// //     } else {
// //       rideDateTime = new Date();
// //     }
    
// //     let durationMinutes = 60;
// //     if (ride?.durationMinutes) {
// //       durationMinutes = ride.durationMinutes;
// //     } else if (ride?.durationText) {
// //       const match = ride.durationText.match(/\d+/);
// //       if (match) durationMinutes = parseInt(match[0]);
// //     }
    
// //     const hasOverlap = await checkPassengerOverlap(rideDateTime, durationMinutes);
// //     if (hasOverlap) {
// //       return;
// //     }

// //     setRequestLoading(true);
// //     try {
// //       const payload = {
// //         ride_id: ride.id,
// //         passenger_phone: user.phone_number,
// //         seats_requested: seatsRequested,
// //       };

// //       if (searchData?.fromCoords && Array.isArray(searchData.fromCoords)) {
// //         payload.from_coords = searchData.fromCoords;
// //       }
// //       if (searchData?.toCoords && Array.isArray(searchData.toCoords)) {
// //         payload.to_coords = searchData.toCoords;
// //       }

// //       const response = await fetch(`${API_BASE_URL}/ride-bookings`, {
// //         method: 'POST',
// //         headers: { 
// //           'Content-Type': 'application/json',
// //           'Accept': 'application/json'
// //         },
// //         body: JSON.stringify(payload),
// //       });

// //       const raw = await response.text();
// //       let data = {};
// //       try {
// //         data = raw ? JSON.parse(raw) : {};
// //       } catch {
// //         data.detail = raw;
// //       }

// //       if (!response.ok) {
// //         throw new Error(data.detail || data.message || `Server error (${response.status})`);
// //       }

// //       showCustomAlert('Success', data.message || 'Ride request sent successfully', 'success');
// //       setTimeout(() => navigation.goBack(), 1500);
// //     } catch (error) {
// //       console.error('Booking error:', error);
// //       showCustomAlert('Error', error.message || 'Failed to send request', 'error');
// //     } finally {
// //       setRequestLoading(false);
// //     }
// //   };

// //   const viewDriverProfile = () => {
// //     const driverPhone = ride?.phoneNumber;
// //     const driverUserId = ride?.driverUserId;
    
// //     if (driverPhone || driverUserId) {
// //       navigation.navigate('ViewProfileScreen', {
// //         userId: driverUserId || null,
// //         phoneNumber: driverPhone || null,
// //         driverName: driverProfile?.full_name || ride?.driverName || 'Driver',
// //         profilePicture: profilePhotoUrl,
// //         vehicleNumber: vehicleRegNumber,
// //         vehicleModel: vehicleName,
// //         driverRating: driverProfile?.avg_rating || ride?.rating || 0,
// //       });
// //     } else {
// //       showCustomAlert('Profile', 'Driver profile not available', 'warning');
// //     }
// //   };

// //   const getOrCreateConversation = async (receiverPhone, rideId) => {
// //     try {
// //       const myPhone = user?.phone_number;
// //       if (!myPhone) {
// //         showCustomAlert('Login Required', 'Please log in to use chat.', 'warning');
// //         return null;
// //       }
// //       const response = await fetch(`${API_BASE_URL}/api/chat/conversations`, {
// //         method: 'POST',
// //         headers: {
// //           'X-Phone-Number': myPhone,
// //           'Content-Type': 'application/json',
// //         },
// //         body: JSON.stringify({ participant_phone: receiverPhone, ride_id: rideId }),
// //       });
// //       const data = await response.json();
// //       if (data.success) {
// //         return data.conversation.id;
// //       }
// //       return null;
// //     } catch (error) {
// //       console.error('getOrCreateConversation error:', error);
// //       return null;
// //     }
// //   };

// //   const startChat = async () => {
// //     const driverPhone = ride?.phoneNumber;
// //     if (driverPhone) {
// //       const conversationId = await getOrCreateConversation(driverPhone, ride.id);
// //       if (conversationId) {
// //         navigation.navigate('ChatScreen', {
// //           receiverPhone: driverPhone,
// //           conversationId,
// //           user: {
// //             name: driverProfile?.full_name || ride?.driverName || 'Driver',
// //             tripInfo: `${ride.from || 'Pickup'} → ${ride.to || 'Drop'}`,
// //           },
// //         });
// //       } else {
// //         showCustomAlert('Chat', 'Unable to start chat. Please try again.', 'error');
// //       }
// //     } else {
// //       showCustomAlert('Chat', 'Driver contact not available', 'warning');
// //     }
// //   };

// //   if (requestLoading || loadingProfile) {
// //     return (
// //       <View style={styles.loaderContainer}>
// //         <LottieView
// //           source={require("../assets/loading.json")}
// //           autoPlay
// //           loop
// //           style={{ width: 300, height: 300 }}
// //         />
// //       </View>
// //     );
// //   }

// //   if (!ride) {
// //     return (
// //       <View style={styles.centerContainer}>
// //         <Text style={styles.errorText}>No ride data available</Text>
// //         <TouchableOpacity
// //           onPress={() => navigation.goBack()}
// //           style={styles.fallbackBtn}
// //         >
// //           <Text style={styles.fallbackBtnText}>Go Back</Text>
// //         </TouchableOpacity>
// //       </View>
// //     );
// //   }

// //   const initialRegion = {
// //     latitude: intersectionPickup?.latitude || driverStart?.latitude || 28.6139,
// //     longitude: intersectionPickup?.longitude || driverStart?.longitude || 77.2090,
// //     latitudeDelta: 0.05,
// //     longitudeDelta: 0.05,
// //   };

// //   return (
// //     <View style={styles.container}>
// //       <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />

// //       <Animated.View style={[styles.mapContainer, { height: mapHeight }]}>
// //         <MapView
// //           ref={mapRef}
// //           provider={PROVIDER_GOOGLE}
// //           style={styles.map}
// //           initialRegion={initialRegion}
// //           onMapReady={() => setMapReady(true)}
// //           showsUserLocation={false}
// //           showsMyLocationButton={false}
// //           zoomEnabled={true}
// //           zoomControlEnabled={true}
// //         >
// //           {routePath.length >= 2 && (
// //             <Polyline
// //               coordinates={routePath}
// //               strokeColor="#2457A6"
// //               strokeWidth={5}
// //               lineCap="round"
// //               lineJoin="round"
// //             />
// //           )}

// //           {driverStart && (
// //             <Marker coordinate={driverStart} anchor={{ x: 0.5, y: 1 }}>
// //               <View style={styles.markerWrapper}>
// //                 <View style={[styles.pinBubble, { backgroundColor: '#16A34A' }]}>
// //                   <Text style={styles.pinIcon}>S</Text>
// //                 </View>
// //                 <View style={[styles.pinPointer, { borderTopColor: '#16A34A' }]} />
// //               </View>
// //             </Marker>
// //           )}

// //           {driverEnd && (
// //             <Marker coordinate={driverEnd} anchor={{ x: 0.5, y: 1 }}>
// //               <View style={styles.markerWrapper}>
// //                 <View style={[styles.pinBubble, { backgroundColor: '#DC2626' }]}>
// //                   <Text style={styles.pinIcon}>E</Text>
// //                 </View>
// //                 <View style={[styles.pinPointer, { borderTopColor: '#DC2626' }]} />
// //               </View>
// //             </Marker>
// //           )}

// //           {userPickup && (
// //             <Marker coordinate={userPickup} anchor={{ x: 0.5, y: 1 }}>
// //               <View style={styles.markerWrapper}>
// //                 <View style={[styles.pinBubble, { backgroundColor: '#3B82F6' }]}>
// //                   <Ionicons name="person" size={12} color="white" />
// //                 </View>
// //                 <View style={[styles.pinPointer, { borderTopColor: '#3B82F6' }]} />
// //                 <View style={styles.pinLabelBubble}>
// //                   <Text style={styles.pinLabelText}>Your Pickup</Text>
// //                 </View>
// //               </View>
// //             </Marker>
// //           )}

// //           {userDrop && (
// //             <Marker coordinate={userDrop} anchor={{ x: 0.5, y: 1 }}>
// //               <View style={styles.markerWrapper}>
// //                 <View style={[styles.pinBubble, { backgroundColor: '#F97316' }]}>
// //                   <Ionicons name="flag" size={12} color="white" />
// //                 </View>
// //                 <View style={[styles.pinPointer, { borderTopColor: '#F97316' }]} />
// //                 <View style={styles.pinLabelBubble}>
// //                   <Text style={styles.pinLabelText}>Your Drop</Text>
// //                 </View>
// //               </View>
// //             </Marker>
// //           )}

// //           {intersectionPickup && (
// //             <Marker coordinate={intersectionPickup} anchor={{ x: 0.5, y: 1 }}>
// //               <View style={styles.markerWrapper}>
// //                 <View style={[styles.pinBubble, { backgroundColor: '#FACC15' }]}>
// //                   <Ionicons name="hand-right" size={12} color="#713F12" />
// //                 </View>
// //                 <View style={[styles.pinPointer, { borderTopColor: '#FACC15' }]} />
// //                 <View style={styles.pinLabelBubbleYellow}>
// //                   <Text style={styles.pinLabelTextYellow}>Meet Driver</Text>
// //                 </View>
// //               </View>
// //             </Marker>
// //           )}

// //           {intersectionDrop && (
// //             <Marker coordinate={intersectionDrop} anchor={{ x: 0.5, y: 1 }}>
// //               <View style={styles.markerWrapper}>
// //                 <View style={[styles.pinBubble, { backgroundColor: '#FACC15' }]}>
// //                   <Ionicons name="exit" size={12} color="#713F12" />
// //                 </View>
// //                 <View style={[styles.pinPointer, { borderTopColor: '#FACC15' }]} />
// //                 <View style={styles.pinLabelBubbleYellow}>
// //                   <Text style={styles.pinLabelTextYellow}>Exit Here</Text>
// //                 </View>
// //               </View>
// //             </Marker>
// //           )}

// //           {walkToPickupPath.length >= 2 && (
// //             <Polyline
// //               coordinates={walkToPickupPath}
// //               strokeColor="#FACC15"
// //               strokeWidth={4}
// //               lineDashPattern={[8, 6]}
// //               lineCap="round"
// //               lineJoin="round"
// //             />
// //           )}

// //           {walkFromDropPath.length >= 2 && (
// //             <Polyline
// //               coordinates={walkFromDropPath}
// //               strokeColor="#FACC15"
// //               strokeWidth={4}
// //               lineDashPattern={[8, 6]}
// //               lineCap="round"
// //               lineJoin="round"
// //             />
// //           )}
// //         </MapView>

// //         <TouchableOpacity
// //           style={styles.mapBackButton}
// //           onPress={() => navigation.goBack()}
// //         >
// //           <Ionicons name="chevron-back" size={26} color={Colors.secondary} />
// //         </TouchableOpacity>
// //       </Animated.View>

// //       <Animated.View style={[styles.drawer, { height: drawerHeight }]}>
// //         <View style={styles.handleWrap} {...panResponder.panHandlers}>
// //           <TouchableOpacity
// //             activeOpacity={0.9}
// //             onPress={toggleDrawer}
// //             style={styles.handleHitArea}
// //           >
// //             <View style={styles.handleBar} />
// //           </TouchableOpacity>
// //         </View>

// //         {!drawerExpanded ? (
// //           <View style={styles.collapsedSummary}>
// //             <View style={styles.collapsedTopRow}>
// //               <View style={{ flex: 1 }}>
// //                 <Text style={styles.collapsedDriver} numberOfLines={1}>
// //                   {driverProfile?.full_name || ride?.driverName || 'Driver'}
// //                 </Text>
// //                 <Text style={styles.collapsedSub} numberOfLines={1}>
// //                   {ride.from || 'Pickup'} → {ride.to || 'Drop'}
// //                 </Text>
// //               </View>

// //               <View style={styles.collapsedPriceWrap}>
// //                 <Text style={styles.collapsedPrice}>₹{ride.price}</Text>
// //                 <Text style={styles.collapsedPerSeat}>per seat</Text>
// //               </View>
// //             </View>
// //           </View>
// //         ) : (
// //           <>
// //             <ScrollView
// //               style={styles.drawerScroll}
// //               contentContainerStyle={styles.drawerContent}
// //               showsVerticalScrollIndicator={false}
// //             >
// //               <View style={styles.driverCard}>
// //                 <View style={styles.driverTopRow}>
// //                   <View style={styles.driverLeftWrap}>
// //                     <TouchableOpacity 
// //                       style={styles.driverAvatar} 
// //                       onPress={handleProfileImagePress}
// //                       activeOpacity={0.8}
// //                     >
// //                       {profilePhotoUrl ? (
// //                         isProfilePhotoSvg ? (
// //                           <View style={styles.svgAvatarContainer}>
// //                             <SvgCssUri
// //                               uri={profilePhotoUrl}
// //                               width={56}
// //                               height={56}
// //                             />
// //                           </View>
// //                         ) : (
// //                           <Image 
// //                             source={{ uri: profilePhotoUrl }} 
// //                             style={styles.avatarImg}
// //                           />
// //                         )
// //                       ) : (
// //                         <Text style={styles.avatarText}>{avatarText}</Text>
// //                       )}
// //                     </TouchableOpacity>

// //                     <View style={styles.driverMeta}>
// //                       <View style={styles.driverNameRow}>
// //                         <Text style={styles.driverName}>
// //                           {driverProfile?.full_name || ride?.driverName || 'Driver'}
// //                         </Text>
// //                         {isVerified && (
// //                           <View style={styles.verifiedBadge}>
// //                             <Ionicons name="checkmark-circle" size={12} color="#2457A6" />
// //                             <Text style={styles.verifiedBadgeText}>Verified</Text>
// //                           </View>
// //                         )}
// //                       </View>

// //                       <View style={styles.ratingRow}>
// //                         <Ionicons name="star" size={13} color="#F59E0B" />
// //                         <Text style={styles.ratingText}>
// //                           {driverProfile?.avg_rating || ride?.rating || 4.5}
// //                         </Text>
// //                       </View>
// //                     </View>
// //                   </View>

// //                   <TouchableOpacity style={styles.chatButtonCircle} onPress={startChat}>
// //                     <Ionicons name="chatbubble-outline" size={20} color="#2457A6" />
// //                   </TouchableOpacity>
// //                 </View>

// //                 <Text style={styles.driverBio}>
// //                   {driverProfile?.bio || driverProfile?.about || 'Friendly driver, love meeting new people!'}
// //                 </Text>

// //                 <TouchableOpacity style={styles.profileOutlineBtn} onPress={viewDriverProfile}>
// //                   <Text style={styles.profileOutlineBtnText}>View Full Profile</Text>
// //                 </TouchableOpacity>
// //               </View>

// //               <View style={styles.cardSection}>
// //                 <Text style={styles.sectionTitle}>Trip Details</Text>

// //                 <View style={styles.tripTimelineWrap}>
// //                   <View style={styles.timelineRail}>
// //                     <View style={[styles.timelineDot, { backgroundColor: '#2457A6' }]} />
// //                     <View style={styles.timelineLine} />
// //                     <View style={[styles.timelineDot, { backgroundColor: '#FF7A00' }]} />
// //                   </View>

// //                   <View style={styles.timelineContent}>
// //                     <View style={styles.timelineItem}>
// //                       <Text style={styles.timelineLabel}>Pickup</Text>
// //                       <Text style={styles.timelinePlace}>
// //                         {ride.pickupLabel || ride.from || 'Pickup point'}
// //                       </Text>
// //                       <View style={styles.timelineMetaRow}>
// //                         <Ionicons name="time-outline" size={13} color={Colors.gray} />
// //                         <Text style={styles.timelineMetaText}>
// //                           {ride.date} at {ride.time}
// //                         </Text>
// //                       </View>
// //                     </View>

// //                     <View style={styles.timelineItem}>
// //                       <Text style={styles.timelineLabel}>Dropoff</Text>
// //                       <Text style={styles.timelinePlace}>
// //                         {ride.dropLabel || ride.to || 'Drop point'}
// //                       </Text>
// //                       <Text style={styles.timelineMetaText}>
// //                         Estimated: {ride.durationText || '--'}
// //                       </Text>
// //                     </View>
// //                   </View>
// //                 </View>
// //               </View>

// //               <View style={styles.cardSection}>
// //                 <Text style={styles.sectionTitle}>Vehicle Details</Text>

// //                 <View style={styles.vehicleHeaderRow}>
// //                   <View style={styles.vehicleIconCircle}>
// //                     <Ionicons name="car-sport-outline" size={18} color="#2457A6" />
// //                   </View>

// //                   <View style={styles.vehicleMeta}>
// //                     <Text style={styles.vehicleTitle}>{vehicleName}</Text>
// //                     <Text style={styles.vehicleSub}>
// //                       {vehicleColor} • {ride?.seatsAvailable || 4} seats
// //                     </Text>
// //                     {vehicleRegNumber && (
// //                       <View style={styles.vehicleRegContainer}>
// //                         <Text style={styles.vehicleRegText}>
// //                           Vehicle Number: {vehicleRegNumber}
// //                         </Text>
// //                       </View>
// //                     )}
// //                   </View>
// //                 </View>
// //               </View>

// //               <View style={styles.cardSection}>
// //                 <Text style={styles.sectionTitle}>Ride Preferences</Text>
// //                 <View style={styles.tagRow}>
// //                   {allPreferences.length > 0 ? (
// //                     allPreferences.map((pref, index) => (
// //                       <GenericPreferenceTag key={`${pref}-${index}`} label={pref} />
// //                     ))
// //                   ) : (
// //                     <Text style={styles.emptyText}>No specific preferences added for this ride</Text>
// //                   )}
// //                 </View>
// //               </View>

// //               <View style={styles.cardSection}>
// //                 <Text style={styles.sectionTitle}>Cost Breakdown</Text>

// //                 <View style={styles.priceRow}>
// //                   <Text style={styles.priceLabel}>Base fare (per seat)</Text>
// //                   <Text style={styles.priceValue}>₹{ride.price || 0}</Text>
// //                 </View>

// //                 <View style={styles.priceRow}>
// //                   <Text style={styles.priceLabel}>Platform fee</Text>
// //                   <Text style={styles.priceValue}>₹0</Text>
// //                 </View>

// //                 <View style={styles.priceDivider} />

// //                 <View style={styles.priceRow}>
// //                   <Text style={styles.totalLabel}>Total per seat</Text>
// //                   <Text style={styles.totalValue}>₹{ride.price || 0}</Text>
// //                 </View>

// //                 <View style={styles.noticeBox}>
// //                   <Text style={styles.noticeText}>
// //                     <Text style={styles.noticeBold}>Cost-share contribution:</Text>{' '}
// //                     This is not a commercial fare. You're sharing the travel costs with the driver.
// //                   </Text>
// //                 </View>
// //               </View>

// //               <View style={styles.cardSection}>
// //                 <Text style={styles.sectionTitle}>
// //                   {userBooking ? 'Modify Seats' : 'Select Seats'}
// //                 </Text>
// //                 {userBooking && (
// //                   <Text style={styles.currentBookingText}>
// //                     You have already booked {userBooking.seats_requested} seat(s) for this ride.
// //                   </Text>
// //                 )}
// //                 <View style={styles.seatSelectorRow}>
// //                   <TouchableOpacity
// //                     style={styles.seatActionBtn}
// //                     onPress={() => {
// //                       const newCount = Math.max(1, seatsRequested - 1);
// //                       setSeatsRequested(newCount);
// //                       if (userBooking) {
// //                         handleModifySeats(newCount);
// //                       }
// //                     }}
// //                     disabled={seatsRequested === 1 || requestLoading}
// //                   >
// //                     <Ionicons name="remove" size={20} color={Colors.gray} />
// //                   </TouchableOpacity>

// //                   <View style={styles.seatCountWrap}>
// //                     <Text style={styles.seatCountText}>{seatsRequested}</Text>
// //                     <Text style={styles.seatAvailableText}>/ {ride.seatsAvailable} available</Text>
// //                   </View>

// //                   <TouchableOpacity
// //                     style={styles.seatActionBtn}
// //                     onPress={() => {
// //                       const newCount = Math.min(ride.seatsAvailable || 1, seatsRequested + 1);
// //                       setSeatsRequested(newCount);
// //                       if (userBooking) {
// //                         handleModifySeats(newCount);
// //                       }
// //                     }}
// //                     disabled={seatsRequested === ride.seatsAvailable || requestLoading}
// //                   >
// //                     <Ionicons name="add" size={20} color="#2457A6" />
// //                   </TouchableOpacity>
// //                 </View>
// //               </View>

// //               <View style={styles.safetyCard}>
// //                 <View style={styles.simpleInfoLeft}>
// //                   <Ionicons name="shield-checkmark-outline" size={18} color="#2457A6" />
// //                   <View>
// //                     <Text style={styles.safetyTitle}>Safety First</Text>
// //                     <Text style={styles.safetySub}>Live GPS tracking & 24/7 support</Text>
// //                   </View>
// //                 </View>
// //               </View>

// //               <View style={{ height: 110 }} />
// //             </ScrollView>

// //             <View style={styles.bottomBar}>
// //               <View>
// //                 <Text style={styles.bottomCaption}>Total for {seatsRequested} seat(s)</Text>
// //                 <Text style={styles.bottomTotal}>₹{totalPrice}</Text>
// //               </View>

// //               <TouchableOpacity
// //                 style={[styles.bookNowBtn, requestLoading && styles.bookNowBtnDisabled]}
// //                 onPress={handleRequestJoin}
// //                 disabled={requestLoading}
// //               >
// //                 <Text style={styles.bookNowText}>
// //                   {userBooking ? 'Update Booking' : 'Book Now'}
// //                 </Text>
// //               </TouchableOpacity>
// //             </View>
// //           </>
// //         )}
// //       </Animated.View>

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
// //     </View>
// //   );
// // }

// // const styles = StyleSheet.create({
// //   container: { flex: 1, backgroundColor: '#F4F5F7' },
// //   centerContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 24 },
// //   errorText: { fontSize: 18, color: Colors.gray, marginBottom: 16, textAlign: 'center' },
// //   fallbackBtn: { backgroundColor: Colors.primary, paddingHorizontal: 20, paddingVertical: 12, borderRadius: 12 },
// //   fallbackBtnText: { color: 'white', fontWeight: '700' },
// //   mapContainer: { width: '100%', overflow: 'hidden', backgroundColor: '#E8EEF7' },
// //   map: { flex: 1, backgroundColor: '#E8EEF7' },
// //   mapBackButton: { position: 'absolute', top: Platform.OS === 'ios' ? 54 : 22, left: 14, width: 42, height: 42, borderRadius: 25, backgroundColor: 'rgba(255,255,255,0.96)', alignItems: 'center', justifyContent: 'center' },
// //   markerWrapper: { alignItems: 'center' },
// //   pinBubble: { width: 28, height: 28, borderRadius: 14, borderWidth: 3, borderColor: 'white', alignItems: 'center', justifyContent: 'center', shadowColor: '#000', shadowOffset: { width: 0, height: 3 }, shadowOpacity: 0.25, shadowRadius: 4, elevation: 5 },
// //   pinPointer: { width: 0, height: 0, backgroundColor: 'transparent', borderStyle: 'solid', borderLeftWidth: 7, borderRightWidth: 7, borderTopWidth: 10, borderLeftColor: 'transparent', borderRightColor: 'transparent', marginTop: -2 },
// //   pinIcon: { fontSize: 11, fontWeight: '800', color: 'white', textAlign: 'center', lineHeight: 18 },
// //   pinLabelBubble: { backgroundColor: 'rgba(0,0,0,0.75)', borderRadius: 8, paddingHorizontal: 8, paddingVertical: 3, marginTop: 4 },
// //   pinLabelText: { color: 'white', fontSize: 10, fontWeight: '700' },
// //   pinLabelBubbleYellow: { backgroundColor: 'rgba(113, 63, 18, 0.9)', borderRadius: 8, paddingHorizontal: 8, paddingVertical: 3, marginTop: 4 },
// //   pinLabelTextYellow: { color: '#FACC15', fontSize: 10, fontWeight: '700' },
// //   drawer: { position: 'absolute', bottom: 0, left: 0, right: 0, backgroundColor: '#F4F5F7', borderTopLeftRadius: 28, borderTopRightRadius: 28, overflow: 'hidden' },
// //   handleWrap: { alignItems: 'center', paddingTop: 10, paddingBottom: 8, backgroundColor: '#F4F5F7' },
// //   handleHitArea: { paddingHorizontal: 40, paddingVertical: 10, alignItems: 'center', justifyContent: 'center' },
// //   handleBar: { width: 64, height: 6, borderRadius: 99, backgroundColor: '#CDD2D8' },
// //   collapsedSummary: { paddingHorizontal: 16, paddingTop: 4, paddingBottom: 12 },
// //   collapsedTopRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: 12 },
// //   collapsedDriver: { fontSize: 16, fontWeight: '800', color: Colors.dark },
// //   collapsedSub: { marginTop: 2, fontSize: 12, color: Colors.gray, fontWeight: '600' },
// //   collapsedPriceWrap: { alignItems: 'flex-end' },
// //   collapsedPrice: { fontSize: 18, fontWeight: '900', color: Colors.dark },
// //   collapsedPerSeat: { fontSize: 10, color: Colors.gray, fontWeight: '600' },
// //   drawerScroll: { flex: 1 },
// //   drawerContent: { paddingHorizontal: 16, paddingBottom: 16 },
// //   driverCard: { backgroundColor: 'white', borderRadius: 20, padding: 16, marginBottom: 14, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 8, elevation: 2 },
// //   driverTopRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
// //   driverLeftWrap: { flexDirection: 'row', flex: 1, paddingRight: 10 },
// //   driverAvatar: { width: 56, height: 56, borderRadius: 28, backgroundColor: '#E5E7EB', overflow: 'hidden', alignItems: 'center', justifyContent: 'center', marginRight: 12 },
// //   avatarImg: { width: 56, height: 56, borderRadius: 28 },
// //   avatarText: { fontSize: 15, fontWeight: '800', color: Colors.gray },
// //   svgAvatarContainer: { width: 56, height: 56, borderRadius: 28, overflow: 'hidden', alignItems: 'center', justifyContent: 'center', backgroundColor: '#E5E7EB' },
// //   driverMeta: { flex: 1 },
// //   driverNameRow: { flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap', gap: 6 },
// //   driverName: { fontSize: 17, fontWeight: '800', color: Colors.dark },
// //   verifiedBadge: { flexDirection: 'row', alignItems: 'center', gap: 4 },
// //   verifiedBadgeText: { fontSize: 11, color: '#2457A6', fontWeight: '700' },
// //   ratingRow: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 6 },
// //   ratingText: { fontSize: 13, color: Colors.dark, fontWeight: '700' },
// //   chatButtonCircle: { width: 42, height: 42, borderRadius: 21, backgroundColor: '#EAF1FF', alignItems: 'center', justifyContent: 'center' },
// //   driverBio: { marginTop: 12, fontSize: 14, lineHeight: 20, color: Colors.gray },
// //   profileOutlineBtn: { marginTop: 14, borderWidth: 1, borderColor: '#2457A6', borderRadius: 16, paddingVertical: 12, alignItems: 'center' },
// //   profileOutlineBtnText: { color: '#2457A6', fontWeight: '700', fontSize: 14 },
// //   cardSection: { backgroundColor: 'white', borderRadius: 20, padding: 16, marginBottom: 14, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 8, elevation: 2 },
// //   sectionTitle: { fontSize: 16, fontWeight: '800', color: Colors.dark, marginBottom: 14 },
// //   currentBookingText: { fontSize: 12, color: Colors.primary, marginBottom: 10, fontWeight: '600' },
// //   tripTimelineWrap: { flexDirection: 'row' },
// //   timelineRail: { width: 18, alignItems: 'center', marginTop: 4 },
// //   timelineDot: { width: 10, height: 10, borderRadius: 5 },
// //   timelineLine: { width: 2, flex: 1, backgroundColor: '#D8DCE3', marginVertical: 6 },
// //   timelineContent: { flex: 1, paddingLeft: 8 },
// //   timelineItem: { marginBottom: 14 },
// //   timelineLabel: { fontSize: 12, color: Colors.gray, fontWeight: '700' },
// //   timelinePlace: { fontSize: 15, color: Colors.dark, fontWeight: '700', marginTop: 4 },
// //   timelineMetaRow: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 6 },
// //   timelineMetaText: { fontSize: 12, color: Colors.gray, fontWeight: '600' },
// //   vehicleHeaderRow: { flexDirection: 'row', alignItems: 'center' },
// //   vehicleIconCircle: { width: 42, height: 42, borderRadius: 21, backgroundColor: '#EAF1FF', alignItems: 'center', justifyContent: 'center', marginRight: 12 },
// //   vehicleMeta: { flex: 1 },
// //   vehicleTitle: { fontSize: 15, fontWeight: '800', color: Colors.dark },
// //   vehicleSub: { marginTop: 3, fontSize: 12, color: Colors.gray, fontWeight: '600' },
// //   vehicleRegContainer: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 6, paddingTop: 6, borderTopWidth: 1, borderTopColor: '#F0F0F0' },
// //   vehicleRegText: { fontSize: 11, color: '#6B7280', fontWeight: '500' },
// //   tagRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 14 },
// //   preferenceTag: { paddingHorizontal: 12, paddingVertical: 8, borderRadius: 999, backgroundColor: '#FFF3E8' },
// //   preferenceTagText: { fontSize: 12, color: '#C65D00', fontWeight: '700' },
// //   emptyText: { fontSize: 13, color: Colors.gray, fontWeight: '600' },
// //   priceRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
// //   priceLabel: { fontSize: 14, color: Colors.gray, fontWeight: '500' },
// //   priceValue: { fontSize: 14, color: Colors.dark, fontWeight: '700' },
// //   priceDivider: { height: 1, backgroundColor: '#ECEEF2', marginVertical: 8 },
// //   totalLabel: { fontSize: 15, color: Colors.dark, fontWeight: '800' },
// //   totalValue: { fontSize: 15, color: '#2457A6', fontWeight: '800' },
// //   noticeBox: { marginTop: 12, backgroundColor: '#FFF2E9', borderRadius: 14, padding: 12 },
// //   noticeText: { fontSize: 12.5, color: Colors.dark, lineHeight: 18 },
// //   noticeBold: { fontWeight: '800' },
// //   seatSelectorRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: '#FAFAFB', borderRadius: 18, padding: 14 },
// //   seatActionBtn: { width: 38, height: 38, borderRadius: 12, borderWidth: 1, borderColor: '#D6DDE7', alignItems: 'center', justifyContent: 'center', backgroundColor: 'white' },
// //   seatCountWrap: { flexDirection: 'row', alignItems: 'baseline' },
// //   seatCountText: { fontSize: 28, fontWeight: '900', color: Colors.dark },
// //   seatAvailableText: { fontSize: 13, color: Colors.gray, marginLeft: 6, fontWeight: '600' },
// //   simpleInfoLeft: { flexDirection: 'row', alignItems: 'center', gap: 8 },
// //   safetyCard: { backgroundColor: '#FFF3E7', borderRadius: 18, padding: 16, marginBottom: 14 },
// //   safetyTitle: { fontSize: 14, color: '#2457A6', fontWeight: '800' },
// //   safetySub: { marginTop: 2, fontSize: 12, color: '#2457A6', opacity: 0.9, fontWeight: '600' },
// //   bottomBar: { position: 'absolute', left: 0, right: 0, bottom: 0, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 16, paddingTop: 12, paddingBottom: Platform.OS === 'ios' ? 28 : 16, backgroundColor: 'white', borderTopWidth: 1, borderTopColor: '#ECEEF2' },
// //   bottomCaption: { fontSize: 12, color: Colors.gray, fontWeight: '500' },
// //   bottomTotal: { fontSize: 26, color: Colors.dark, fontWeight: '900', marginTop: 2 },
// //   bookNowBtn: { backgroundColor: '#FF7A00', paddingHorizontal: 24, paddingVertical: 14, borderRadius: 22, minWidth: 128, alignItems: 'center', justifyContent: 'center' },
// //   bookNowBtnDisabled: { opacity: 0.7 },
// //   bookNowText: { color: 'white', fontSize: 16, fontWeight: '800' },
// //   loaderContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#fff' },
// //   modalBackdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.9)', justifyContent: 'center', alignItems: 'center' },
// //   imageModalContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', width: '100%' },
// //   imageModalContent: { width: '90%', backgroundColor: Colors.white, borderRadius: 20, overflow: 'hidden', maxHeight: '80%' },
// //   imageModalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 16, borderBottomWidth: 1, borderBottomColor: '#EEF2F7' },
// //   imageModalTitle: { fontSize: 18, fontWeight: '700', color: Colors.dark },
// //   fullProfileImage: { width: '100%', height: 400, backgroundColor: '#F5F5F5' },
// //   modalSvgContainer: { width: '100%', height: 400, backgroundColor: '#F5F5F5', alignItems: 'center', justifyContent: 'center' },
// //   noImageContainer: { width: '100%', height: 400, justifyContent: 'center', alignItems: 'center', backgroundColor: '#F5F5F5' },
// //   noImageText: { fontSize: 16, color: Colors.gray },
// // });
// // import React, { useMemo, useRef, useState, useEffect, useCallback } from 'react';
// // import {
// //   View,
// //   Text,
// //   StyleSheet,
// //   TouchableOpacity,
// //   ScrollView,
// //   Platform,
// //   StatusBar,
// //   Image,
// //   Dimensions,
// //   Animated,
// //   PanResponder,
// //   Modal
// // } from 'react-native';
// // import MapView, { Marker, Polyline, PROVIDER_GOOGLE } from 'react-native-maps';
// // import { Ionicons } from '@expo/vector-icons';
// // import LottieView from "lottie-react-native";
// // import { SvgCssUri } from 'react-native-svg/css';
// // import { Colors } from '../constants/Colors';
// // import { useAuth } from '../context/AuthContext';
// // import { API_BASE_URL } from '../config/config_ip';
// // import CustomAlert from '../components/CustomAlert';
// // import { useFocusEffect } from '@react-navigation/native';

// // const { height } = Dimensions.get('window');
// // const SAFE_TOP = Platform.OS === 'ios' ? 56 : 24;
// // const COLLAPSED_HEIGHT = 84;
// // const EXPANDED_HEIGHT = height * 0.72;

// // function buildImageUrl(url) {
// //   if (!url) return null;
// //   if (url.startsWith('http://') || url.startsWith('https://')) return url;
// //   return `${API_BASE_URL}${url.startsWith('/') ? '' : '/'}${url}`;
// // }

// // function getDriverInitials(name) {
// //   if (!name) return 'D';
// //   const parts = name.trim().split(' ').filter(Boolean);
// //   if (parts.length > 1) return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
// //   return parts[0].slice(0, 2).toUpperCase();
// // }

// // function parseSuggestedPoint(point) {
// //   if (!point) return null;

// //   if (Array.isArray(point) && point.length === 2) {
// //     return {
// //       longitude: Number(point[0]),
// //       latitude: Number(point[1]),
// //     };
// //   }

// //   if (point.lng != null && point.lat != null) {
// //     return {
// //       longitude: Number(point.lng),
// //       latitude: Number(point.lat),
// //     };
// //   }

// //   if (point.longitude != null && point.latitude != null) {
// //     return {
// //       longitude: Number(point.longitude),
// //       latitude: Number(point.latitude),
// //     };
// //   }

// //   return null;
// // }

// // function parseRouteCoordinates(routeCoordinates) {
// //   if (!Array.isArray(routeCoordinates)) return [];

// //   return routeCoordinates
// //     .map((item) => {
// //       if (Array.isArray(item) && item.length === 2) {
// //         return {
// //           longitude: Number(item[0]),
// //           latitude: Number(item[1]),
// //         };
// //       }
// //       return parseSuggestedPoint(item);
// //     })
// //     .filter(Boolean);
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

// // function extractAllPreferences(ride, driverTravelPrefs) {
// //   let ridePrefs = ride?.preferences;
  
// //   if (ridePrefs && typeof ridePrefs === 'string') {
// //     try {
// //       ridePrefs = JSON.parse(ridePrefs);
// //     } catch (e) {
// //       ridePrefs = null;
// //     }
// //   }
  
// //   if (ridePrefs && typeof ridePrefs === 'object' && Object.keys(ridePrefs).length > 0) {
// //     return extractFromObject(ridePrefs);
// //   }
  
// //   if (driverTravelPrefs && typeof driverTravelPrefs === 'object' && Object.keys(driverTravelPrefs).length > 0) {
// //     return extractFromObject(driverTravelPrefs);
// //   }
  
// //   return [];
// // }

// // function extractFromObject(prefs) {
// //   const allPreferences = [];

// //   Object.entries(prefs).forEach(([key, value]) => {
// //     if (value === null || value === undefined) return;
    
// //     const formattedKey = key.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
    
// //     if (typeof value === 'boolean') {
// //       if (value === true) {
// //         allPreferences.push(formattedKey);
// //       }
// //     } 
// //     else if (Array.isArray(value)) {
// //       if (value.length > 0) {
// //         allPreferences.push(`${formattedKey}: ${value.join(', ')}`);
// //       }
// //     }
// //     else if (typeof value === 'object') {
// //       const nestedPrefs = extractFromObject(value);
// //       allPreferences.push(...nestedPrefs);
// //     }
// //     else if (typeof value === 'string' && value.trim()) {
// //       const lowerValue = value.toLowerCase();
// //       if (!['false', 'no', 'none', 'null', 'undefined'].includes(lowerValue)) {
// //         allPreferences.push(`${formattedKey}: ${value}`);
// //       }
// //     }
// //     else if (typeof value === 'number') {
// //       allPreferences.push(`${formattedKey}: ${value}`);
// //     }
// //   });

// //   return [...new Set(allPreferences)];
// // }

// // function GenericPreferenceTag({ label }) {
// //   if (!label || label.trim() === '') return null;
  
// //   let tagColor = '#FFF3E8';
// //   let textColor = '#C65D00';
  
// //   const lowerLabel = label.toLowerCase();
  
// //   if (lowerLabel.includes('age') || lowerLabel.includes('category')) {
// //     tagColor = '#E8F5E9';
// //     textColor = '#2E7D32';
// //   } else if (lowerLabel.includes('chat') || lowerLabel.includes('talk')) {
// //     tagColor = '#E3F2FD';
// //     textColor = '#1565C0';
// //   } else if (lowerLabel.includes('gender')) {
// //     tagColor = '#F3E5F5';
// //     textColor = '#6A1B9A';
// //   } else if (lowerLabel.includes('language') || lowerLabel.includes('speak')) {
// //     tagColor = '#FFF9C4';
// //     textColor = '#F57F17';
// //   } else if (lowerLabel.includes('verified')) {
// //     tagColor = '#E8F5E9';
// //     textColor = '#2E7D32';
// //   }
  
// //   return (
// //     <View style={[styles.preferenceTag, { backgroundColor: tagColor }]}>
// //       <Text style={[styles.preferenceTagText, { color: textColor }]}>{label}</Text>
// //     </View>
// //   );
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

// // export default function RideDetailScreen({ navigation, route }) {
// //   const { user, isAuthenticated } = useAuth();
// //   const { ride, searchData } = route.params || {};

// //   const [seatsRequested, setSeatsRequested] = useState(1);
// //   const [requestLoading, setRequestLoading] = useState(false);
// //   const [drawerExpanded, setDrawerExpanded] = useState(true);
// //   const [driverProfile, setDriverProfile] = useState(null);
// //   const [isVerified, setIsVerified] = useState(false);
// //   const [loadingProfile, setLoadingProfile] = useState(false);
// //   const [mapReady, setMapReady] = useState(false);
// //   const [userBooking, setUserBooking] = useState(null);
// //   const animatedDrawer = useRef(new Animated.Value(1)).current;
// //   const mapRef = useRef(null);
  
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

// //   const showConfirmationAlert = (title, message, onConfirm) => {
// //     setAlertConfig({
// //       title,
// //       message,
// //       icon: "warning",
// //       iconColor: "#F59E0B",
// //       buttons: [
// //         { text: 'Cancel', onPress: () => setAlertVisible(false), style: 'cancel' },
// //         { text: 'Login', onPress: () => {
// //           setAlertVisible(false);
// //           onConfirm();
// //         }, style: 'destructive' }
// //       ]
// //     });
// //     setAlertVisible(true);
// //   };

// //   // Function to check if user already has a booking for this ride
// //   const checkUserBooking = useCallback(async () => {
// //     if (!user?.phone_number || !ride?.id) return;
    
// //     try {
// //       const response = await fetch(`${API_BASE_URL}/my-rides/${user.phone_number}`);
// //       const data = await response.json();
      
// //       const booking = data.requested_rides?.find(
// //         b => b.ride_id === ride.id && b.status === 'accepted'
// //       );
      
// //       if (booking) {
// //         setUserBooking(booking);
// //         setSeatsRequested(booking.seats_requested);
// //         console.log('📦 Found existing booking:', booking);
// //       }
// //     } catch (error) {
// //       console.log('Error checking user booking:', error);
// //     }
// //   }, [user?.phone_number, ride?.id]);

// //   const loadDriverData = useCallback(async () => {
// //     const driverPhone = ride?.phoneNumber;
// //     const driverUserId = ride?.driverUserId;
    
// //     if (driverPhone || driverUserId) {
// //       setLoadingProfile(true);
      
// //       try {
// //         const profileData = await fetchDriverProfile(driverPhone, driverUserId);
// //         if (profileData?.success && profileData.user) {
// //           setDriverProfile(profileData.user);
// //         } else {
// //           setDriverProfile(null);
// //         }
        
// //         let verified = false;
// //         if (driverPhone) {
// //           const docsData = await fetchUserDocuments(driverPhone);
// //           if (docsData?.success && docsData.documents) {
// //             const verifiedDocs = docsData.documents.filter(doc => {
// //               const status = doc.status?.toUpperCase();
// //               return status === 'APPROVED' && ['aadhar', 'dl', 'rc'].includes(doc.document_type?.toLowerCase());
// //             });
// //             verified = verifiedDocs.length > 0;
// //             setIsVerified(verified);
// //           }
// //         }
// //       } catch (error) {
// //         console.log('Error loading driver data:', error);
// //       } finally {
// //         setLoadingProfile(false);
// //       }
// //     }
// //   }, [ride?.phoneNumber, ride?.driverUserId]);

// //   useFocusEffect(
// //     useCallback(() => {
// //       loadDriverData();
// //       checkUserBooking();
// //     }, [loadDriverData, checkUserBooking])
// //   );

// //   useEffect(() => {
// //     if (!isAuthenticated) {
// //       showConfirmationAlert(
// //         'Login Required',
// //         'Please login to book rides or chat with drivers.',
// //         () => navigation.navigate('Login')
// //       );
// //       navigation.goBack();
// //     }
// //   }, [isAuthenticated, navigation]);

// //   const getProfilePhotoUrl = useCallback(() => {
// //     const rawUrl = driverProfile?.profile_picture || ride?.profilePicture;
// //     if (!rawUrl) return null;
// //     return buildImageUrl(rawUrl);
// //   }, [driverProfile, ride]);
  
// //   const profilePhotoUrl = getProfilePhotoUrl();
// //   const avatarText = getDriverInitials(driverProfile?.full_name || ride?.driverName || 'Driver');
// //   const isProfilePhotoSvg = profilePhotoUrl ? profilePhotoUrl.toLowerCase().includes('.svg') : false;
  
// //   const allPreferences = useMemo(() => {
// //     return extractAllPreferences(ride, driverProfile?.travel_preferences);
// //   }, [ride, driverProfile]);

// //   const driverStart = useMemo(() => {
// //     const coords = ride?.routeCoordinates;
// //     if (Array.isArray(coords) && coords.length > 0) {
// //       const first = coords[0];
// //       if (Array.isArray(first) && first.length === 2) {
// //         return { latitude: first[1], longitude: first[0] };
// //       }
// //     }
// //     return parseSuggestedPoint(ride?.suggestedPickup);
// //   }, [ride]);

// //   const driverEnd = useMemo(() => {
// //     const coords = ride?.routeCoordinates;
// //     if (Array.isArray(coords) && coords.length > 0) {
// //       const last = coords[coords.length - 1];
// //       if (Array.isArray(last) && last.length === 2) {
// //         return { latitude: last[1], longitude: last[0] };
// //       }
// //     }
// //     return parseSuggestedPoint(ride?.suggestedDrop);
// //   }, [ride]);

// //   const intersectionPickup = useMemo(
// //     () => parseSuggestedPoint(ride?.suggestedPickup),
// //     [ride]
// //   );
// //   const intersectionDrop = useMemo(
// //     () => parseSuggestedPoint(ride?.suggestedDrop),
// //     [ride]
// //   );

// //   const userPickup = useMemo(() => {
// //     if (!searchData?.fromCoords) return null;
// //     const c = searchData.fromCoords;
// //     if (Array.isArray(c) && c.length === 2) {
// //       return { latitude: c[1], longitude: c[0] };
// //     }
// //     return null;
// //   }, [searchData]);

// //   const userDrop = useMemo(() => {
// //     if (!searchData?.toCoords) return null;
// //     const c = searchData.toCoords;
// //     if (Array.isArray(c) && c.length === 2) {
// //       return { latitude: c[1], longitude: c[0] };
// //     }
// //     return null;
// //   }, [searchData]);

// //   const routePath = useMemo(() => {
// //     const fullRoute = parseRouteCoordinates(ride?.routeCoordinates);
// //     if (fullRoute.length >= 2) return fullRoute;
// //     if (intersectionPickup && intersectionDrop) return [intersectionPickup, intersectionDrop];
// //     return [];
// //   }, [ride, intersectionPickup, intersectionDrop]);

// //   const walkToPickupPath = useMemo(() => {
// //     if (userPickup && intersectionPickup) return [userPickup, intersectionPickup];
// //     return [];
// //   }, [userPickup, intersectionPickup]);

// //   const walkFromDropPath = useMemo(() => {
// //     if (userDrop && intersectionDrop) return [intersectionDrop, userDrop];
// //     return [];
// //   }, [userDrop, intersectionDrop]);

// //   const allMarkerCoords = useMemo(() => {
// //     const coords = [];
// //     if (driverStart) coords.push(driverStart);
// //     if (driverEnd) coords.push(driverEnd);
// //     if (userPickup) coords.push(userPickup);
// //     if (userDrop) coords.push(userDrop);
// //     if (intersectionPickup) coords.push(intersectionPickup);
// //     if (intersectionDrop) coords.push(intersectionDrop);
// //     return coords;
// //   }, [driverStart, driverEnd, userPickup, userDrop, intersectionPickup, intersectionDrop]);

// //   const fitMapToMarkers = useCallback(() => {
// //     if (mapRef.current && mapReady && allMarkerCoords.length >= 2) {
// //       setTimeout(() => {
// //         try {
// //           mapRef.current.fitToCoordinates(allMarkerCoords, {
// //             edgePadding: { top: 80, right: 50, bottom: 50, left: 50 },
// //             animated: true,
// //           });
// //         } catch (e) {
// //           console.log('fitToCoordinates error:', e);
// //         }
// //       }, 500);
// //     }
// //   }, [mapReady, allMarkerCoords]);

// //   useEffect(() => {
// //     if (mapReady && allMarkerCoords.length >= 2) {
// //       fitMapToMarkers();
// //     }
// //   }, [mapReady, allMarkerCoords, fitMapToMarkers]);

// //   const vehicleName = driverProfile?.vehicle 
// //     ? [driverProfile.vehicle.model].filter(Boolean).join(' ')
// //     : [ride?.vehicle?.model].filter(Boolean).join(' ') || 'Vehicle details unavailable';
  
// //   const vehicleRegNumber = driverProfile?.vehicle?.registration_number || 
// //                            ride?.vehicle?.registration_number || 
// //                            null;
  
// //   const vehicleColor = driverProfile?.vehicle?.color || 
// //                        ride?.vehicle?.color || 
// //                        'Not specified';

// //   const totalPrice = Number(ride?.price || 0) * seatsRequested;

// //   const handleProfileImagePress = () => {
// //     if (profilePhotoUrl) {
// //       setSelectedProfile({
// //         visible: true,
// //         imageUrl: profilePhotoUrl,
// //         driverName: driverProfile?.full_name || ride?.driverName || 'Driver',
// //       });
// //     } else {
// //       showCustomAlert('No Photo', 'Driver has not uploaded a profile picture', 'warning');
// //     }
// //   };

// //   const mapHeight = animatedDrawer.interpolate({
// //     inputRange: [0, 1],
// //     outputRange: [height - SAFE_TOP - COLLAPSED_HEIGHT, height * 0.32],
// //   });

// //   const drawerHeight = animatedDrawer.interpolate({
// //     inputRange: [0, 1],
// //     outputRange: [COLLAPSED_HEIGHT, EXPANDED_HEIGHT],
// //   });

// //   const toggleDrawer = () => {
// //     const nextExpanded = !drawerExpanded;
// //     setDrawerExpanded(nextExpanded);

// //     Animated.timing(animatedDrawer, {
// //       toValue: nextExpanded ? 1 : 0,
// //       duration: 260,
// //       useNativeDriver: false,
// //     }).start();
// //   };

// //   const panResponder = useRef(
// //     PanResponder.create({
// //       onMoveShouldSetPanResponder: (_, gestureState) =>
// //         Math.abs(gestureState.dy) > 5,
// //       onPanResponderMove: (_, gestureState) => {
// //         const dragRange = EXPANDED_HEIGHT - COLLAPSED_HEIGHT;
// //         const progress = drawerExpanded
// //           ? 1 - (gestureState.dy / dragRange)
// //           : gestureState.dy / dragRange;
// //         const clamped = Math.max(0, Math.min(1, progress));
// //         animatedDrawer.setValue(clamped);
// //       },
// //       onPanResponderRelease: (_, gestureState) => {
// //         const dragRange = EXPANDED_HEIGHT - COLLAPSED_HEIGHT;
// //         const threshold = dragRange * 0.2;
// //         if (drawerExpanded) {
// //           if (gestureState.dy > threshold) {
// //             setDrawerExpanded(false);
// //             Animated.timing(animatedDrawer, {
// //               toValue: 0,
// //               duration: 200,
// //               useNativeDriver: false,
// //             }).start();
// //           } else {
// //             setDrawerExpanded(true);
// //             Animated.timing(animatedDrawer, {
// //               toValue: 1,
// //               duration: 200,
// //               useNativeDriver: false,
// //             }).start();
// //           }
// //         } else {
// //           if (gestureState.dy < -threshold) {
// //             setDrawerExpanded(true);
// //             Animated.timing(animatedDrawer, {
// //               toValue: 1,
// //               duration: 200,
// //               useNativeDriver: false,
// //             }).start();
// //           } else {
// //             setDrawerExpanded(false);
// //             Animated.timing(animatedDrawer, {
// //               toValue: 0,
// //               duration: 200,
// //               useNativeDriver: false,
// //             }).start();
// //           }
// //         }
// //       },
// //     })
// //   ).current;

// //   const checkPassengerOverlap = async (departureTime, durationMinutes = 60) => {
// //     try {
// //       if (!user?.phone_number) return false;
      
// //       const url = `${API_BASE_URL}/check-passenger-overlap?phone_number=${encodeURIComponent(user.phone_number)}&departure_time=${departureTime.toISOString()}&duration_minutes=${durationMinutes}`;
      
// //       const response = await fetch(url);
// //       const data = await response.json();
      
// //       if (data.has_overlap) {
// //         const overlap = data.overlapping_booking;
// //         showCustomAlert(
// //           'Overlapping Ride',
// //           `You already have a confirmed booking for a ride from ${overlap.origin} to ${overlap.destination} at ${new Date(overlap.departure_time).toLocaleTimeString()}. Please complete that ride before booking another.`,
// //           'warning'
// //         );
// //         return true;
// //       }
// //       return false;
// //     } catch (error) {
// //       console.log('Error checking passenger overlap:', error);
// //       return false;
// //     }
// //   };

// //   // Function to modify existing booking seats
// //   const handleModifySeats = async (newSeatCount) => {
// //     if (!user?.phone_number) {
// //       showCustomAlert('Login Required', 'Please log in to modify booking.', 'warning');
// //       return;
// //     }

// //     if (!userBooking) {
// //       return;
// //     }

// //     // Check if requested seats exceed available seats
// //     const availableSeats = ride?.seatsAvailable || 0;
// //     const totalAvailable = availableSeats + userBooking.seats_requested;
    
// //     if (newSeatCount > totalAvailable) {
// //       showCustomAlert(
// //         'Not Enough Seats',
// //         `Only ${totalAvailable} total seats available. You currently have ${userBooking.seats_requested} seat(s). You can add up to ${availableSeats} more seat(s).`,
// //         'warning'
// //       );
// //       return;
// //     }

// //     if (newSeatCount < 1) {
// //       showCustomAlert('Invalid Seats', 'You must book at least 1 seat.', 'warning');
// //       return;
// //     }

// //     setRequestLoading(true);
// //     try {
// //       const response = await fetch(`${API_BASE_URL}/booking/${userBooking.id}/modify-seats`, {
// //         method: 'PUT',
// //         headers: { 
// //           'Content-Type': 'application/json',
// //           'Accept': 'application/json'
// //         },
// //         body: JSON.stringify({ new_seats: newSeatCount }),
// //       });

// //       const data = await response.json();

// //       if (!response.ok) {
// //         throw new Error(data.detail || data.message || 'Failed to modify booking');
// //       }

// //       showCustomAlert('Success', data.message || 'Booking updated successfully', 'success');
// //       setUserBooking({ ...userBooking, seats_requested: newSeatCount });
      
// //       setTimeout(() => navigation.goBack(), 1500);
// //     } catch (error) {
// //       console.error('Modify booking error:', error);
// //       showCustomAlert('Error', error.message || 'Failed to modify booking', 'error');
// //     } finally {
// //       setRequestLoading(false);
// //     }
// //   };

// //   const handleRequestJoin = async () => {
// //     if (!user?.phone_number) {
// //       showCustomAlert('Login Required', 'Please log in to request a ride.', 'warning');
// //       return;
// //     }

// //     // If user already has a booking for this ride, modify seats instead
// //     if (userBooking) {
// //       await handleModifySeats(seatsRequested);
// //       return;
// //     }

// //     if (ride?.womenOnly === true && user?.gender !== 'female') {
// //       showCustomAlert(
// //         'Not Available', 
// //         'This ride is for women passengers only. Please search for other rides.',
// //         'warning'
// //       );
// //       return;
// //     }

// //     const availableSeats = ride?.seatsAvailable || 0;
// //     if (seatsRequested > availableSeats) {
// //       showCustomAlert(
// //         'Not Enough Seats',
// //         `Only ${availableSeats} seat${availableSeats !== 1 ? 's' : ''} left in this ride. Please reduce your seat request.`,
// //         'warning'
// //       );
// //       return;
// //     }

// //     let rideDateTime;
// //     if (ride?.date && ride?.time) {
// //       rideDateTime = new Date(`${ride.date} ${ride.time}`);
// //     } else if (ride?.departure_time) {
// //       rideDateTime = new Date(ride.departure_time);
// //     } else {
// //       rideDateTime = new Date();
// //     }
    
// //     let durationMinutes = 60;
// //     if (ride?.durationMinutes) {
// //       durationMinutes = ride.durationMinutes;
// //     } else if (ride?.durationText) {
// //       const match = ride.durationText.match(/\d+/);
// //       if (match) durationMinutes = parseInt(match[0]);
// //     }
    
// //     const hasOverlap = await checkPassengerOverlap(rideDateTime, durationMinutes);
// //     if (hasOverlap) {
// //       return;
// //     }

// //     setRequestLoading(true);
// //     try {
// //       const payload = {
// //         ride_id: ride.id,
// //         passenger_phone: user.phone_number,
// //         seats_requested: seatsRequested,
// //       };

// //       if (searchData?.fromCoords && Array.isArray(searchData.fromCoords)) {
// //         payload.from_coords = searchData.fromCoords;
// //       }
// //       if (searchData?.toCoords && Array.isArray(searchData.toCoords)) {
// //         payload.to_coords = searchData.toCoords;
// //       }

// //       const response = await fetch(`${API_BASE_URL}/ride-bookings`, {
// //         method: 'POST',
// //         headers: { 
// //           'Content-Type': 'application/json',
// //           'Accept': 'application/json'
// //         },
// //         body: JSON.stringify(payload),
// //       });

// //       const raw = await response.text();
// //       let data = {};
// //       try {
// //         data = raw ? JSON.parse(raw) : {};
// //       } catch {
// //         data.detail = raw;
// //       }

// //       if (!response.ok) {
// //         throw new Error(data.detail || data.message || `Server error (${response.status})`);
// //       }

// //       showCustomAlert('Success', data.message || 'Ride request sent successfully', 'success');
// //       setTimeout(() => navigation.goBack(), 1500);
// //     } catch (error) {
// //       console.error('Booking error:', error);
// //       showCustomAlert('Error', error.message || 'Failed to send request', 'error');
// //     } finally {
// //       setRequestLoading(false);
// //     }
// //   };

// //   const viewDriverProfile = () => {
// //     const driverPhone = ride?.phoneNumber;
// //     const driverUserId = ride?.driverUserId;
    
// //     if (driverPhone || driverUserId) {
// //       navigation.navigate('ViewProfileScreen', {
// //         userId: driverUserId || null,
// //         phoneNumber: driverPhone || null,
// //         driverName: driverProfile?.full_name || ride?.driverName || 'Driver',
// //         profilePicture: profilePhotoUrl,
// //         vehicleNumber: vehicleRegNumber,
// //         vehicleModel: vehicleName,
// //         driverRating: driverProfile?.avg_rating || ride?.rating || 0,
// //       });
// //     } else {
// //       showCustomAlert('Profile', 'Driver profile not available', 'warning');
// //     }
// //   };

// //   const getOrCreateConversation = async (receiverPhone, rideId) => {
// //     try {
// //       const myPhone = user?.phone_number;
// //       if (!myPhone) {
// //         showCustomAlert('Login Required', 'Please log in to use chat.', 'warning');
// //         return null;
// //       }
// //       const response = await fetch(`${API_BASE_URL}/api/chat/conversations`, {
// //         method: 'POST',
// //         headers: {
// //           'X-Phone-Number': myPhone,
// //           'Content-Type': 'application/json',
// //         },
// //         body: JSON.stringify({ participant_phone: receiverPhone, ride_id: rideId }),
// //       });
// //       const data = await response.json();
// //       if (data.success) {
// //         return data.conversation.id;
// //       }
// //       return null;
// //     } catch (error) {
// //       console.error('getOrCreateConversation error:', error);
// //       return null;
// //     }
// //   };

// //   const startChat = async () => {
// //     const driverPhone = ride?.phoneNumber;
// //     if (driverPhone) {
// //       const conversationId = await getOrCreateConversation(driverPhone, ride.id);
// //       if (conversationId) {
// //         navigation.navigate('ChatScreen', {
// //           receiverPhone: driverPhone,
// //           conversationId,
// //           user: {
// //             name: driverProfile?.full_name || ride?.driverName || 'Driver',
// //             tripInfo: `${ride.from || 'Pickup'} → ${ride.to || 'Drop'}`,
// //           },
// //         });
// //       } else {
// //         showCustomAlert('Chat', 'Unable to start chat. Please try again.', 'error');
// //       }
// //     } else {
// //       showCustomAlert('Chat', 'Driver contact not available', 'warning');
// //     }
// //   };

// //   if (requestLoading || loadingProfile) {
// //     return (
// //       <View style={styles.loaderContainer}>
// //         <LottieView
// //           source={require("../assets/loading.json")}
// //           autoPlay
// //           loop
// //           style={{ width: 300, height: 300 }}
// //         />
// //       </View>
// //     );
// //   }

// //   if (!ride) {
// //     return (
// //       <View style={styles.centerContainer}>
// //         <Text style={styles.errorText}>No ride data available</Text>
// //         <TouchableOpacity
// //           onPress={() => navigation.goBack()}
// //           style={styles.fallbackBtn}
// //         >
// //           <Text style={styles.fallbackBtnText}>Go Back</Text>
// //         </TouchableOpacity>
// //       </View>
// //     );
// //   }

// //   const initialRegion = {
// //     latitude: intersectionPickup?.latitude || driverStart?.latitude || 28.6139,
// //     longitude: intersectionPickup?.longitude || driverStart?.longitude || 77.2090,
// //     latitudeDelta: 0.05,
// //     longitudeDelta: 0.05,
// //   };

// //   const maxAvailableSeats = userBooking 
// //     ? (ride.seatsAvailable + userBooking.seats_requested)
// //     : (ride.seatsAvailable || 1);

// //   return (
// //     <View style={styles.container}>
// //       <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />

// //       <Animated.View style={[styles.mapContainer, { height: mapHeight }]}>
// //         <MapView
// //           ref={mapRef}
// //           provider={PROVIDER_GOOGLE}
// //           style={styles.map}
// //           initialRegion={initialRegion}
// //           onMapReady={() => setMapReady(true)}
// //           showsUserLocation={false}
// //           showsMyLocationButton={false}
// //           zoomEnabled={true}
// //           zoomControlEnabled={true}
// //         >
// //           {routePath.length >= 2 && (
// //             <Polyline
// //               coordinates={routePath}
// //               strokeColor="#2457A6"
// //               strokeWidth={5}
// //               lineCap="round"
// //               lineJoin="round"
// //             />
// //           )}

// //           {driverStart && (
// //             <Marker coordinate={driverStart} anchor={{ x: 0.5, y: 1 }}>
// //               <View style={styles.markerWrapper}>
// //                 <View style={[styles.pinBubble, { backgroundColor: '#16A34A' }]}>
// //                   <Text style={styles.pinIcon}>S</Text>
// //                 </View>
// //                 <View style={[styles.pinPointer, { borderTopColor: '#16A34A' }]} />
// //               </View>
// //             </Marker>
// //           )}

// //           {driverEnd && (
// //             <Marker coordinate={driverEnd} anchor={{ x: 0.5, y: 1 }}>
// //               <View style={styles.markerWrapper}>
// //                 <View style={[styles.pinBubble, { backgroundColor: '#DC2626' }]}>
// //                   <Text style={styles.pinIcon}>E</Text>
// //                 </View>
// //                 <View style={[styles.pinPointer, { borderTopColor: '#DC2626' }]} />
// //               </View>
// //             </Marker>
// //           )}

// //           {userPickup && (
// //             <Marker coordinate={userPickup} anchor={{ x: 0.5, y: 1 }}>
// //               <View style={styles.markerWrapper}>
// //                 <View style={[styles.pinBubble, { backgroundColor: '#3B82F6' }]}>
// //                   <Ionicons name="person" size={12} color="white" />
// //                 </View>
// //                 <View style={[styles.pinPointer, { borderTopColor: '#3B82F6' }]} />
// //                 <View style={styles.pinLabelBubble}>
// //                   <Text style={styles.pinLabelText}>Your Pickup</Text>
// //                 </View>
// //               </View>
// //             </Marker>
// //           )}

// //           {userDrop && (
// //             <Marker coordinate={userDrop} anchor={{ x: 0.5, y: 1 }}>
// //               <View style={styles.markerWrapper}>
// //                 <View style={[styles.pinBubble, { backgroundColor: '#F97316' }]}>
// //                   <Ionicons name="flag" size={12} color="white" />
// //                 </View>
// //                 <View style={[styles.pinPointer, { borderTopColor: '#F97316' }]} />
// //                 <View style={styles.pinLabelBubble}>
// //                   <Text style={styles.pinLabelText}>Your Drop</Text>
// //                 </View>
// //               </View>
// //             </Marker>
// //           )}

// //           {intersectionPickup && (
// //             <Marker coordinate={intersectionPickup} anchor={{ x: 0.5, y: 1 }}>
// //               <View style={styles.markerWrapper}>
// //                 <View style={[styles.pinBubble, { backgroundColor: '#FACC15' }]}>
// //                   <Ionicons name="hand-right" size={12} color="#713F12" />
// //                 </View>
// //                 <View style={[styles.pinPointer, { borderTopColor: '#FACC15' }]} />
// //                 <View style={styles.pinLabelBubbleYellow}>
// //                   <Text style={styles.pinLabelTextYellow}>Meet Driver</Text>
// //                 </View>
// //               </View>
// //             </Marker>
// //           )}

// //           {intersectionDrop && (
// //             <Marker coordinate={intersectionDrop} anchor={{ x: 0.5, y: 1 }}>
// //               <View style={styles.markerWrapper}>
// //                 <View style={[styles.pinBubble, { backgroundColor: '#FACC15' }]}>
// //                   <Ionicons name="exit" size={12} color="#713F12" />
// //                 </View>
// //                 <View style={[styles.pinPointer, { borderTopColor: '#FACC15' }]} />
// //                 <View style={styles.pinLabelBubbleYellow}>
// //                   <Text style={styles.pinLabelTextYellow}>Exit Here</Text>
// //                 </View>
// //               </View>
// //             </Marker>
// //           )}

// //           {walkToPickupPath.length >= 2 && (
// //             <Polyline
// //               coordinates={walkToPickupPath}
// //               strokeColor="#FACC15"
// //               strokeWidth={4}
// //               lineDashPattern={[8, 6]}
// //               lineCap="round"
// //               lineJoin="round"
// //             />
// //           )}

// //           {walkFromDropPath.length >= 2 && (
// //             <Polyline
// //               coordinates={walkFromDropPath}
// //               strokeColor="#FACC15"
// //               strokeWidth={4}
// //               lineDashPattern={[8, 6]}
// //               lineCap="round"
// //               lineJoin="round"
// //             />
// //           )}
// //         </MapView>

// //         <TouchableOpacity
// //           style={styles.mapBackButton}
// //           onPress={() => navigation.goBack()}
// //         >
// //           <Ionicons name="chevron-back" size={26} color={Colors.secondary} />
// //         </TouchableOpacity>
// //       </Animated.View>

// //       <Animated.View style={[styles.drawer, { height: drawerHeight }]}>
// //         <View style={styles.handleWrap} {...panResponder.panHandlers}>
// //           <TouchableOpacity
// //             activeOpacity={0.9}
// //             onPress={toggleDrawer}
// //             style={styles.handleHitArea}
// //           >
// //             <View style={styles.handleBar} />
// //           </TouchableOpacity>
// //         </View>

// //         {!drawerExpanded ? (
// //           <View style={styles.collapsedSummary}>
// //             <View style={styles.collapsedTopRow}>
// //               <View style={{ flex: 1 }}>
// //                 <Text style={styles.collapsedDriver} numberOfLines={1}>
// //                   {driverProfile?.full_name || ride?.driverName || 'Driver'}
// //                 </Text>
// //                 <Text style={styles.collapsedSub} numberOfLines={1}>
// //                   {ride.from || 'Pickup'} → {ride.to || 'Drop'}
// //                 </Text>
// //               </View>

// //               <View style={styles.collapsedPriceWrap}>
// //                 <Text style={styles.collapsedPrice}>₹{ride.price}</Text>
// //                 <Text style={styles.collapsedPerSeat}>per seat</Text>
// //               </View>
// //             </View>
// //           </View>
// //         ) : (
// //           <>
// //             <ScrollView
// //               style={styles.drawerScroll}
// //               contentContainerStyle={styles.drawerContent}
// //               showsVerticalScrollIndicator={false}
// //             >
// //               <View style={styles.driverCard}>
// //                 <View style={styles.driverTopRow}>
// //                   <View style={styles.driverLeftWrap}>
// //                     <TouchableOpacity 
// //                       style={styles.driverAvatar} 
// //                       onPress={handleProfileImagePress}
// //                       activeOpacity={0.8}
// //                     >
// //                       {profilePhotoUrl ? (
// //                         isProfilePhotoSvg ? (
// //                           <View style={styles.svgAvatarContainer}>
// //                             <SvgCssUri
// //                               uri={profilePhotoUrl}
// //                               width={56}
// //                               height={56}
// //                             />
// //                           </View>
// //                         ) : (
// //                           <Image 
// //                             source={{ uri: profilePhotoUrl }} 
// //                             style={styles.avatarImg}
// //                           />
// //                         )
// //                       ) : (
// //                         <Text style={styles.avatarText}>{avatarText}</Text>
// //                       )}
// //                     </TouchableOpacity>

// //                     <View style={styles.driverMeta}>
// //                       <View style={styles.driverNameRow}>
// //                         <Text style={styles.driverName}>
// //                           {driverProfile?.full_name || ride?.driverName || 'Driver'}
// //                         </Text>
// //                         {isVerified && (
// //                           <View style={styles.verifiedBadge}>
// //                             <Ionicons name="checkmark-circle" size={12} color="#2457A6" />
// //                             <Text style={styles.verifiedBadgeText}>Verified</Text>
// //                           </View>
// //                         )}
// //                       </View>

// //                       <View style={styles.ratingRow}>
// //                         <Ionicons name="star" size={13} color="#F59E0B" />
// //                         <Text style={styles.ratingText}>
// //                           {driverProfile?.avg_rating || ride?.rating || 4.5}
// //                         </Text>
// //                       </View>
// //                     </View>
// //                   </View>

// //                   <TouchableOpacity style={styles.chatButtonCircle} onPress={startChat}>
// //                     <Ionicons name="chatbubble-outline" size={20} color="#2457A6" />
// //                   </TouchableOpacity>
// //                 </View>

// //                 <Text style={styles.driverBio}>
// //                   {driverProfile?.bio || driverProfile?.about || 'Friendly driver, love meeting new people!'}
// //                 </Text>

// //                 <TouchableOpacity style={styles.profileOutlineBtn} onPress={viewDriverProfile}>
// //                   <Text style={styles.profileOutlineBtnText}>View Full Profile</Text>
// //                 </TouchableOpacity>
// //               </View>

// //               <View style={styles.cardSection}>
// //                 <Text style={styles.sectionTitle}>Trip Details</Text>

// //                 <View style={styles.tripTimelineWrap}>
// //                   <View style={styles.timelineRail}>
// //                     <View style={[styles.timelineDot, { backgroundColor: '#2457A6' }]} />
// //                     <View style={styles.timelineLine} />
// //                     <View style={[styles.timelineDot, { backgroundColor: '#FF7A00' }]} />
// //                   </View>

// //                   <View style={styles.timelineContent}>
// //                     <View style={styles.timelineItem}>
// //                       <Text style={styles.timelineLabel}>Pickup</Text>
// //                       <Text style={styles.timelinePlace}>
// //                         {ride.pickupLabel || ride.from || 'Pickup point'}
// //                       </Text>
// //                       <View style={styles.timelineMetaRow}>
// //                         <Ionicons name="time-outline" size={13} color={Colors.gray} />
// //                         <Text style={styles.timelineMetaText}>
// //                           {ride.date} at {ride.time}
// //                         </Text>
// //                       </View>
// //                     </View>

// //                     <View style={styles.timelineItem}>
// //                       <Text style={styles.timelineLabel}>Dropoff</Text>
// //                       <Text style={styles.timelinePlace}>
// //                         {ride.dropLabel || ride.to || 'Drop point'}
// //                       </Text>
// //                       <Text style={styles.timelineMetaText}>
// //                         Estimated: {ride.durationText || '--'}
// //                       </Text>
// //                     </View>
// //                   </View>
// //                 </View>
// //               </View>

// //               <View style={styles.cardSection}>
// //                 <Text style={styles.sectionTitle}>Vehicle Details</Text>

// //                 <View style={styles.vehicleHeaderRow}>
// //                   <View style={styles.vehicleIconCircle}>
// //                     <Ionicons name="car-sport-outline" size={18} color="#2457A6" />
// //                   </View>

// //                   <View style={styles.vehicleMeta}>
// //                     <Text style={styles.vehicleTitle}>{vehicleName}</Text>
// //                     <Text style={styles.vehicleSub}>
// //                       {vehicleColor} • {ride?.seatsAvailable || 4} seats
// //                     </Text>
// //                     {vehicleRegNumber && (
// //                       <View style={styles.vehicleRegContainer}>
// //                         <Text style={styles.vehicleRegText}>
// //                           Vehicle Number: {vehicleRegNumber}
// //                         </Text>
// //                       </View>
// //                     )}
// //                   </View>
// //                 </View>
// //               </View>

// //               <View style={styles.cardSection}>
// //                 <Text style={styles.sectionTitle}>Ride Preferences</Text>
// //                 <View style={styles.tagRow}>
// //                   {allPreferences.length > 0 ? (
// //                     allPreferences.map((pref, index) => (
// //                       <GenericPreferenceTag key={`${pref}-${index}`} label={pref} />
// //                     ))
// //                   ) : (
// //                     <Text style={styles.emptyText}>No specific preferences added for this ride</Text>
// //                   )}
// //                 </View>
// //               </View>

// //               <View style={styles.cardSection}>
// //                 <Text style={styles.sectionTitle}>Cost Breakdown</Text>

// //                 <View style={styles.priceRow}>
// //                   <Text style={styles.priceLabel}>Base fare (per seat)</Text>
// //                   <Text style={styles.priceValue}>₹{ride.price || 0}</Text>
// //                 </View>

// //                 <View style={styles.priceRow}>
// //                   <Text style={styles.priceLabel}>Platform fee</Text>
// //                   <Text style={styles.priceValue}>₹0</Text>
// //                 </View>

// //                 <View style={styles.priceDivider} />

// //                 <View style={styles.priceRow}>
// //                   <Text style={styles.totalLabel}>Total per seat</Text>
// //                   <Text style={styles.totalValue}>₹{ride.price || 0}</Text>
// //                 </View>

// //                 <View style={styles.noticeBox}>
// //                   <Text style={styles.noticeText}>
// //                     <Text style={styles.noticeBold}>Cost-share contribution:</Text>{' '}
// //                     This is not a commercial fare. You're sharing the travel costs with the driver.
// //                   </Text>
// //                 </View>
// //               </View>

// //               <View style={styles.cardSection}>
// //                 <Text style={styles.sectionTitle}>
// //                   {userBooking ? 'Modify Seats' : 'Select Seats'}
// //                 </Text>
// //                 {userBooking && (
// //                   <View style={styles.currentBookingContainer}>
// //                     <Text style={styles.currentBookingText}>
// //                       You have already booked {userBooking.seats_requested} seat(s) for this ride.
// //                     </Text>
// //                     <Text style={styles.currentBookingHint}>
// //                       Use the buttons below to increase or decrease your seat count.
// //                     </Text>
// //                   </View>
// //                 )}
// //                 <View style={styles.seatSelectorRow}>
// //                   <TouchableOpacity
// //                     style={styles.seatActionBtn}
// //                     onPress={() => {
// //                       const newCount = Math.max(1, seatsRequested - 1);
// //                       setSeatsRequested(newCount);
// //                       if (userBooking) {
// //                         handleModifySeats(newCount);
// //                       }
// //                     }}
// //                     disabled={seatsRequested === 1 || requestLoading}
// //                   >
// //                     <Ionicons name="remove" size={20} color={Colors.gray} />
// //                   </TouchableOpacity>

// //                   <View style={styles.seatCountWrap}>
// //                     <Text style={styles.seatCountText}>{seatsRequested}</Text>
// //                     <Text style={styles.seatAvailableText}>
// //                       / {maxAvailableSeats} available
// //                     </Text>
// //                   </View>

// //                   <TouchableOpacity
// //                     style={styles.seatActionBtn}
// //                     onPress={() => {
// //                       const newCount = Math.min(maxAvailableSeats, seatsRequested + 1);
// //                       setSeatsRequested(newCount);
// //                       if (userBooking) {
// //                         handleModifySeats(newCount);
// //                       }
// //                     }}
// //                     disabled={seatsRequested === maxAvailableSeats || requestLoading}
// //                   >
// //                     <Ionicons name="add" size={20} color="#2457A6" />
// //                   </TouchableOpacity>
// //                 </View>
// //                 {userBooking && (
// //                   <View style={styles.seatInfoNote}>
// //                     <Text style={styles.seatInfoNoteText}>
// //                       💡 Tip: You can increase your seats up to the total available seats. 
// //                       Additional fare will be calculated automatically.
// //                     </Text>
// //                   </View>
// //                 )}
// //               </View>

// //               <View style={styles.safetyCard}>
// //                 <View style={styles.simpleInfoLeft}>
// //                   <Ionicons name="shield-checkmark-outline" size={18} color="#2457A6" />
// //                   <View>
// //                     <Text style={styles.safetyTitle}>Safety First</Text>
// //                     <Text style={styles.safetySub}>Live GPS tracking & 24/7 support</Text>
// //                   </View>
// //                 </View>
// //               </View>

// //               <View style={{ height: 110 }} />
// //             </ScrollView>

// //             <View style={styles.bottomBar}>
// //               <View>
// //                 <Text style={styles.bottomCaption}>Total for {seatsRequested} seat(s)</Text>
// //                 <Text style={styles.bottomTotal}>₹{totalPrice}</Text>
// //               </View>

// //               <TouchableOpacity
// //                 style={[styles.bookNowBtn, requestLoading && styles.bookNowBtnDisabled]}
// //                 onPress={handleRequestJoin}
// //                 disabled={requestLoading}
// //               >
// //                 <Text style={styles.bookNowText}>
// //                   {userBooking ? 'Update Booking' : 'Book Now'}
// //                 </Text>
// //               </TouchableOpacity>
// //             </View>
// //           </>
// //         )}
// //       </Animated.View>

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
// //     </View>
// //   );
// // }

// // const styles = StyleSheet.create({
// //   container: { flex: 1, backgroundColor: '#F4F5F7' },
// //   centerContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 24 },
// //   errorText: { fontSize: 18, color: Colors.gray, marginBottom: 16, textAlign: 'center' },
// //   fallbackBtn: { backgroundColor: Colors.primary, paddingHorizontal: 20, paddingVertical: 12, borderRadius: 12 },
// //   fallbackBtnText: { color: 'white', fontWeight: '700' },
// //   mapContainer: { width: '100%', overflow: 'hidden', backgroundColor: '#E8EEF7' },
// //   map: { flex: 1, backgroundColor: '#E8EEF7' },
// //   mapBackButton: { position: 'absolute', top: Platform.OS === 'ios' ? 54 : 22, left: 14, width: 42, height: 42, borderRadius: 25, backgroundColor: 'rgba(255,255,255,0.96)', alignItems: 'center', justifyContent: 'center' },
// //   markerWrapper: { alignItems: 'center' },
// //   pinBubble: { width: 28, height: 28, borderRadius: 14, borderWidth: 3, borderColor: 'white', alignItems: 'center', justifyContent: 'center', shadowColor: '#000', shadowOffset: { width: 0, height: 3 }, shadowOpacity: 0.25, shadowRadius: 4, elevation: 5 },
// //   pinPointer: { width: 0, height: 0, backgroundColor: 'transparent', borderStyle: 'solid', borderLeftWidth: 7, borderRightWidth: 7, borderTopWidth: 10, borderLeftColor: 'transparent', borderRightColor: 'transparent', marginTop: -2 },
// //   pinIcon: { fontSize: 11, fontWeight: '800', color: 'white', textAlign: 'center', lineHeight: 18 },
// //   pinLabelBubble: { backgroundColor: 'rgba(0,0,0,0.75)', borderRadius: 8, paddingHorizontal: 8, paddingVertical: 3, marginTop: 4 },
// //   pinLabelText: { color: 'white', fontSize: 10, fontWeight: '700' },
// //   pinLabelBubbleYellow: { backgroundColor: 'rgba(113, 63, 18, 0.9)', borderRadius: 8, paddingHorizontal: 8, paddingVertical: 3, marginTop: 4 },
// //   pinLabelTextYellow: { color: '#FACC15', fontSize: 10, fontWeight: '700' },
// //   drawer: { position: 'absolute', bottom: 0, left: 0, right: 0, backgroundColor: '#F4F5F7', borderTopLeftRadius: 28, borderTopRightRadius: 28, overflow: 'hidden' },
// //   handleWrap: { alignItems: 'center', paddingTop: 10, paddingBottom: 8, backgroundColor: '#F4F5F7' },
// //   handleHitArea: { paddingHorizontal: 40, paddingVertical: 10, alignItems: 'center', justifyContent: 'center' },
// //   handleBar: { width: 64, height: 6, borderRadius: 99, backgroundColor: '#CDD2D8' },
// //   collapsedSummary: { paddingHorizontal: 16, paddingTop: 4, paddingBottom: 12 },
// //   collapsedTopRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: 12 },
// //   collapsedDriver: { fontSize: 16, fontWeight: '800', color: Colors.dark },
// //   collapsedSub: { marginTop: 2, fontSize: 12, color: Colors.gray, fontWeight: '600' },
// //   collapsedPriceWrap: { alignItems: 'flex-end' },
// //   collapsedPrice: { fontSize: 18, fontWeight: '900', color: Colors.dark },
// //   collapsedPerSeat: { fontSize: 10, color: Colors.gray, fontWeight: '600' },
// //   drawerScroll: { flex: 1 },
// //   drawerContent: { paddingHorizontal: 16, paddingBottom: 16 },
// //   driverCard: { backgroundColor: 'white', borderRadius: 20, padding: 16, marginBottom: 14, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 8, elevation: 2 },
// //   driverTopRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
// //   driverLeftWrap: { flexDirection: 'row', flex: 1, paddingRight: 10 },
// //   driverAvatar: { width: 56, height: 56, borderRadius: 28, backgroundColor: '#E5E7EB', overflow: 'hidden', alignItems: 'center', justifyContent: 'center', marginRight: 12 },
// //   avatarImg: { width: 56, height: 56, borderRadius: 28 },
// //   avatarText: { fontSize: 15, fontWeight: '800', color: Colors.gray },
// //   svgAvatarContainer: { width: 56, height: 56, borderRadius: 28, overflow: 'hidden', alignItems: 'center', justifyContent: 'center', backgroundColor: '#E5E7EB' },
// //   driverMeta: { flex: 1 },
// //   driverNameRow: { flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap', gap: 6 },
// //   driverName: { fontSize: 17, fontWeight: '800', color: Colors.dark },
// //   verifiedBadge: { flexDirection: 'row', alignItems: 'center', gap: 4 },
// //   verifiedBadgeText: { fontSize: 11, color: '#2457A6', fontWeight: '700' },
// //   ratingRow: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 6 },
// //   ratingText: { fontSize: 13, color: Colors.dark, fontWeight: '700' },
// //   chatButtonCircle: { width: 42, height: 42, borderRadius: 21, backgroundColor: '#EAF1FF', alignItems: 'center', justifyContent: 'center' },
// //   driverBio: { marginTop: 12, fontSize: 14, lineHeight: 20, color: Colors.gray },
// //   profileOutlineBtn: { marginTop: 14, borderWidth: 1, borderColor: '#2457A6', borderRadius: 16, paddingVertical: 12, alignItems: 'center' },
// //   profileOutlineBtnText: { color: '#2457A6', fontWeight: '700', fontSize: 14 },
// //   cardSection: { backgroundColor: 'white', borderRadius: 20, padding: 16, marginBottom: 14, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 8, elevation: 2 },
// //   sectionTitle: { fontSize: 16, fontWeight: '800', color: Colors.dark, marginBottom: 14 },
// //   currentBookingContainer: {
// //     backgroundColor: '#EFF6FF',
// //     borderRadius: 12,
// //     padding: 12,
// //     marginBottom: 16,
// //   },
// //   currentBookingText: {
// //     fontSize: 14,
// //     fontWeight: '600',
// //     color: Colors.primary,
// //     marginBottom: 4,
// //   },
// //   currentBookingHint: {
// //     fontSize: 12,
// //     color: Colors.gray,
// //   },
// //   seatInfoNote: {
// //     marginTop: 12,
// //     backgroundColor: '#FEF3C7',
// //     borderRadius: 8,
// //     padding: 10,
// //   },
// //   seatInfoNoteText: {
// //     fontSize: 11,
// //     color: '#92400E',
// //     textAlign: 'center',
// //   },
// //   tripTimelineWrap: { flexDirection: 'row' },
// //   timelineRail: { width: 18, alignItems: 'center', marginTop: 4 },
// //   timelineDot: { width: 10, height: 10, borderRadius: 5 },
// //   timelineLine: { width: 2, flex: 1, backgroundColor: '#D8DCE3', marginVertical: 6 },
// //   timelineContent: { flex: 1, paddingLeft: 8 },
// //   timelineItem: { marginBottom: 14 },
// //   timelineLabel: { fontSize: 12, color: Colors.gray, fontWeight: '700' },
// //   timelinePlace: { fontSize: 15, color: Colors.dark, fontWeight: '700', marginTop: 4 },
// //   timelineMetaRow: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 6 },
// //   timelineMetaText: { fontSize: 12, color: Colors.gray, fontWeight: '600' },
// //   vehicleHeaderRow: { flexDirection: 'row', alignItems: 'center' },
// //   vehicleIconCircle: { width: 42, height: 42, borderRadius: 21, backgroundColor: '#EAF1FF', alignItems: 'center', justifyContent: 'center', marginRight: 12 },
// //   vehicleMeta: { flex: 1 },
// //   vehicleTitle: { fontSize: 15, fontWeight: '800', color: Colors.dark },
// //   vehicleSub: { marginTop: 3, fontSize: 12, color: Colors.gray, fontWeight: '600' },
// //   vehicleRegContainer: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 6, paddingTop: 6, borderTopWidth: 1, borderTopColor: '#F0F0F0' },
// //   vehicleRegText: { fontSize: 11, color: '#6B7280', fontWeight: '500' },
// //   tagRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 14 },
// //   preferenceTag: { paddingHorizontal: 12, paddingVertical: 8, borderRadius: 999, backgroundColor: '#FFF3E8' },
// //   preferenceTagText: { fontSize: 12, color: '#C65D00', fontWeight: '700' },
// //   emptyText: { fontSize: 13, color: Colors.gray, fontWeight: '600' },
// //   priceRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
// //   priceLabel: { fontSize: 14, color: Colors.gray, fontWeight: '500' },
// //   priceValue: { fontSize: 14, color: Colors.dark, fontWeight: '700' },
// //   priceDivider: { height: 1, backgroundColor: '#ECEEF2', marginVertical: 8 },
// //   totalLabel: { fontSize: 15, color: Colors.dark, fontWeight: '800' },
// //   totalValue: { fontSize: 15, color: '#2457A6', fontWeight: '800' },
// //   noticeBox: { marginTop: 12, backgroundColor: '#FFF2E9', borderRadius: 14, padding: 12 },
// //   noticeText: { fontSize: 12.5, color: Colors.dark, lineHeight: 18 },
// //   noticeBold: { fontWeight: '800' },
// //   seatSelectorRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: '#FAFAFB', borderRadius: 18, padding: 14 },
// //   seatActionBtn: { width: 38, height: 38, borderRadius: 12, borderWidth: 1, borderColor: '#D6DDE7', alignItems: 'center', justifyContent: 'center', backgroundColor: 'white' },
// //   seatCountWrap: { flexDirection: 'row', alignItems: 'baseline' },
// //   seatCountText: { fontSize: 28, fontWeight: '900', color: Colors.dark },
// //   seatAvailableText: { fontSize: 13, color: Colors.gray, marginLeft: 6, fontWeight: '600' },
// //   simpleInfoLeft: { flexDirection: 'row', alignItems: 'center', gap: 8 },
// //   safetyCard: { backgroundColor: '#FFF3E7', borderRadius: 18, padding: 16, marginBottom: 14 },
// //   safetyTitle: { fontSize: 14, color: '#2457A6', fontWeight: '800' },
// //   safetySub: { marginTop: 2, fontSize: 12, color: '#2457A6', opacity: 0.9, fontWeight: '600' },
// //   bottomBar: { position: 'absolute', left: 0, right: 0, bottom: 0, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 16, paddingTop: 12, paddingBottom: Platform.OS === 'ios' ? 28 : 16, backgroundColor: 'white', borderTopWidth: 1, borderTopColor: '#ECEEF2' },
// //   bottomCaption: { fontSize: 12, color: Colors.gray, fontWeight: '500' },
// //   bottomTotal: { fontSize: 26, color: Colors.dark, fontWeight: '900', marginTop: 2 },
// //   bookNowBtn: { backgroundColor: '#FF7A00', paddingHorizontal: 24, paddingVertical: 14, borderRadius: 22, minWidth: 128, alignItems: 'center', justifyContent: 'center' },
// //   bookNowBtnDisabled: { opacity: 0.7 },
// //   bookNowText: { color: 'white', fontSize: 16, fontWeight: '800' },
// //   loaderContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#fff' },
// //   modalBackdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.9)', justifyContent: 'center', alignItems: 'center' },
// //   imageModalContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', width: '100%' },
// //   imageModalContent: { width: '90%', backgroundColor: Colors.white, borderRadius: 20, overflow: 'hidden', maxHeight: '80%' },
// //   imageModalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 16, borderBottomWidth: 1, borderBottomColor: '#EEF2F7' },
// //   imageModalTitle: { fontSize: 18, fontWeight: '700', color: Colors.dark },
// //   fullProfileImage: { width: '100%', height: 400, backgroundColor: '#F5F5F5' },
// //   modalSvgContainer: { width: '100%', height: 400, backgroundColor: '#F5F5F5', alignItems: 'center', justifyContent: 'center' },
// //   noImageContainer: { width: '100%', height: 400, justifyContent: 'center', alignItems: 'center', backgroundColor: '#F5F5F5' },
// //   noImageText: { fontSize: 16, color: Colors.gray },
// // });
// // import { LogBox } from 'react-native';

// // // Ignore accessibility warnings immediately
// // LogBox.ignoreLogs([
// //   'Accessibility: View',
// //   'Property accessibilityState',
// //   'RCTView',
// //   'TouchableOpacity'
// // ]);

// // import React, { useMemo, useRef, useState, useEffect, useCallback } from 'react';
// // import {
// //   View,
// //   Text,
// //   StyleSheet,
// //   TouchableOpacity,
// //   ScrollView,
// //   Platform,
// //   StatusBar,
// //   Image,
// //   Dimensions,
// //   Animated,
// //   PanResponder,
// //   Modal,
// //   ActivityIndicator,
// //   RefreshControl,
// // } from 'react-native';
// // import MapView, { Marker, Polyline, PROVIDER_GOOGLE } from 'react-native-maps';
// // import { Ionicons } from '@expo/vector-icons';
// // import LottieView from "lottie-react-native";
// // import { SvgCssUri } from 'react-native-svg/css';
// // import { Colors } from '../constants/Colors';
// // import { useAuth } from '../context/AuthContext';
// // import { API_BASE_URL } from '../config/config_ip';
// // import CustomAlert from '../components/CustomAlert';
// // import { useFocusEffect } from '@react-navigation/native';
// // import io from 'socket.io-client';

// // const { height } = Dimensions.get('window');
// // const SAFE_TOP = Platform.OS === 'ios' ? 56 : 24;
// // const COLLAPSED_HEIGHT = 84;
// // const EXPANDED_HEIGHT = height * 0.72;

// // function buildImageUrl(url) {
// //   if (!url) return null;
// //   if (url.startsWith('http://') || url.startsWith('https://')) return url;
// //   return `${API_BASE_URL}${url.startsWith('/') ? '' : '/'}${url}`;
// // }

// // function getDriverInitials(name) {
// //   if (!name) return 'D';
// //   const parts = name.trim().split(' ').filter(Boolean);
// //   if (parts.length > 1) return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
// //   return parts[0].slice(0, 2).toUpperCase();
// // }

// // function parseSuggestedPoint(point) {
// //   if (!point) return null;
// //   if (Array.isArray(point) && point.length === 2) {
// //     return { longitude: Number(point[0]), latitude: Number(point[1]) };
// //   }
// //   if (point.lng != null && point.lat != null) {
// //     return { longitude: Number(point.lng), latitude: Number(point.lat) };
// //   }
// //   if (point.longitude != null && point.latitude != null) {
// //     return { longitude: Number(point.longitude), latitude: Number(point.latitude) };
// //   }
// //   return null;
// // }

// // function parseRouteCoordinates(routeCoordinates) {
// //   if (!Array.isArray(routeCoordinates)) return [];
// //   return routeCoordinates.map((item) => {
// //     if (Array.isArray(item) && item.length === 2) {
// //       return { longitude: Number(item[0]), latitude: Number(item[1]) };
// //     }
// //     return parseSuggestedPoint(item);
// //   }).filter(Boolean);
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

// // function extractAllPreferences(ride, driverTravelPrefs) {
// //   let ridePrefs = ride?.preferences;
// //   if (ridePrefs && typeof ridePrefs === 'string') {
// //     try { ridePrefs = JSON.parse(ridePrefs); } catch (e) { ridePrefs = null; }
// //   }
// //   if (ridePrefs && typeof ridePrefs === 'object' && Object.keys(ridePrefs).length > 0) {
// //     return extractFromObject(ridePrefs);
// //   }
// //   if (driverTravelPrefs && typeof driverTravelPrefs === 'object' && Object.keys(driverTravelPrefs).length > 0) {
// //     return extractFromObject(driverTravelPrefs);
// //   }
// //   return [];
// // }

// // function extractFromObject(prefs) {
// //   const allPreferences = [];
// //   Object.entries(prefs).forEach(([key, value]) => {
// //     if (value === null || value === undefined) return;
// //     const formattedKey = key.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
// //     if (typeof value === 'boolean') {
// //       if (value === true) allPreferences.push(formattedKey);
// //     } else if (Array.isArray(value)) {
// //       if (value.length > 0) allPreferences.push(`${formattedKey}: ${value.join(', ')}`);
// //     } else if (typeof value === 'object') {
// //       allPreferences.push(...extractFromObject(value));
// //     } else if (typeof value === 'string' && value.trim()) {
// //       const lowerValue = value.toLowerCase();
// //       if (!['false', 'no', 'none', 'null', 'undefined'].includes(lowerValue)) {
// //         allPreferences.push(`${formattedKey}: ${value}`);
// //       }
// //     } else if (typeof value === 'number') {
// //       allPreferences.push(`${formattedKey}: ${value}`);
// //     }
// //   });
// //   return [...new Set(allPreferences)];
// // }

// // function GenericPreferenceTag({ label }) {
// //   if (!label || label.trim() === '') return null;
// //   let tagColor = '#FFF3E8';
// //   let textColor = '#C65D00';
// //   const lowerLabel = label.toLowerCase();
// //   if (lowerLabel.includes('age') || lowerLabel.includes('category')) {
// //     tagColor = '#E8F5E9'; textColor = '#2E7D32';
// //   } else if (lowerLabel.includes('chat') || lowerLabel.includes('talk')) {
// //     tagColor = '#E3F2FD'; textColor = '#1565C0';
// //   } else if (lowerLabel.includes('gender')) {
// //     tagColor = '#F3E5F5'; textColor = '#6A1B9A';
// //   } else if (lowerLabel.includes('language') || lowerLabel.includes('speak')) {
// //     tagColor = '#FFF9C4'; textColor = '#F57F17';
// //   } else if (lowerLabel.includes('verified')) {
// //     tagColor = '#E8F5E9'; textColor = '#2E7D32';
// //   }
// //   return (
// //     <View style={[styles.preferenceTag, { backgroundColor: tagColor }]}>
// //       <Text style={[styles.preferenceTagText, { color: textColor }]}>{label}</Text>
// //     </View>
// //   );
// // }

// // function ProfileImageModal({ visible, imageUrl, driverName, onClose }) {
// //   const [isSvg, setIsSvg] = useState(false);
// //   useEffect(() => {
// //     if (imageUrl) setIsSvg(imageUrl.toLowerCase().includes('.svg'));
// //   }, [imageUrl]);
// //   if (!visible) return null;
// //   return (
// //     <Modal visible={visible} transparent={true} animationType="fade" onRequestClose={onClose}>
// //       <TouchableOpacity style={styles.modalBackdrop} activeOpacity={1} onPress={onClose}>
// //         <View style={styles.imageModalContainer}>
// //           <View style={styles.imageModalContent}>
// //             <View style={styles.imageModalHeader}>
// //               <Text style={styles.imageModalTitle}>{driverName}</Text>
// //               <TouchableOpacity onPress={onClose}><Ionicons name="close" size={24} color={Colors.dark} /></TouchableOpacity>
// //             </View>
// //             {imageUrl && imageUrl !== 'null' && imageUrl !== 'undefined' ? (
// //               isSvg ? (
// //                 <View style={styles.modalSvgContainer}><SvgCssUri uri={imageUrl} width="100%" height={400} /></View>
// //               ) : (
// //                 <Image source={{ uri: imageUrl }} style={styles.fullProfileImage} resizeMode="contain" />
// //               )
// //             ) : (
// //               <View style={styles.noImageContainer}><Text style={styles.noImageText}>No profile picture available</Text></View>
// //             )}
// //           </View>
// //         </View>
// //       </TouchableOpacity>
// //     </Modal>
// //   );
// // }

// // export default function RideDetailScreen({ navigation, route }) {
// //   const { user, isAuthenticated } = useAuth();
// //   const { ride, searchData } = route.params || {};

// //   const [seatsRequested, setSeatsRequested] = useState(1);
// //   const [requestLoading, setRequestLoading] = useState(false);
// //   const [cancelLoading, setCancelLoading] = useState(false);
// //   const [drawerExpanded, setDrawerExpanded] = useState(true);
// //   const [driverProfile, setDriverProfile] = useState(null);
// //   const [isVerified, setIsVerified] = useState(false);
// //   const [loadingProfile, setLoadingProfile] = useState(false);
// //   const [mapReady, setMapReady] = useState(false);
// //   const [userBooking, setUserBooking] = useState(null);
// //   const [showCancelModal, setShowCancelModal] = useState(false);
  
// //   // States for seat modification
// //   const [modifyingSeats, setModifyingSeats] = useState(false);
// //   const [refreshing, setRefreshing] = useState(false);
  
// //   // State for actual seat availability
// //   const [totalRideSeats, setTotalRideSeats] = useState(3);
// //   const [otherBookedSeats, setOtherBookedSeats] = useState(0);
  
// //   const animatedDrawer = useRef(new Animated.Value(1)).current;
// //   const mapRef = useRef(null);
// //   const socketRef = useRef(null);
  
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

// //   const showCustomAlert = (title, message, type = 'success') => {
// //     let icon = "check-circle";
// //     let iconColor = "#10B981";
// //     if (type === 'error') { icon = "error"; iconColor = "#EF4444"; }
// //     else if (type === 'warning') { icon = "warning"; iconColor = "#F59E0B"; }
// //     else if (type === 'info') { icon = "info"; iconColor = Colors.primary; }
// //     setAlertConfig({ title, message, icon, iconColor, buttons: [{ text: 'OK', onPress: () => setAlertVisible(false) }] });
// //     setAlertVisible(true);
// //   };

// //   // Get ride status
// //   const getRideStatus = useCallback(() => {
// //     if (!ride?.departure_time) return 'unknown';
// //     const now = new Date();
// //     const departureTime = new Date(ride.departure_time);
// //     const minutesDiff = (departureTime - now) / (1000 * 60);
    
// //     if (now >= departureTime) return 'completed';
// //     if (minutesDiff <= 2 && minutesDiff > 0) return 'ongoing';
// //     if (minutesDiff > 2) return 'upcoming';
// //     return 'unknown';
// //   }, [ride?.departure_time]);

// //   // Fetch ride details
// //   const fetchRideDetails = useCallback(async () => {
// //     if (!ride?.id) return;
    
// //     try {
// //       const response = await fetch(`${API_BASE_URL}/ride/${ride.id}/details`);
// //       const data = await response.json();
      
// //       if (data) {
// //         const totalSeats = data.available_seats || ride.totalSeats || 4;
// //         setTotalRideSeats(totalSeats);
        
// //         let otherBooked = 0;
// //         if (data.bookings && Array.isArray(data.bookings)) {
// //           otherBooked = data.bookings
// //             .filter(b => b.status === 'accepted' && b.passenger_phone !== user?.phone_number)
// //             .reduce((sum, b) => sum + (b.seats || b.seats_booked || 0), 0);
// //         }
// //         setOtherBookedSeats(otherBooked);
// //       }
// //     } catch (error) {
// //       console.log('Error fetching ride details:', error);
// //     }
// //   }, [ride?.id, ride?.totalSeats, ride?.seatsAvailable, user?.phone_number]);

// //   // Check user booking
// //   const checkUserBooking = useCallback(async () => {
// //     if (!user?.phone_number || !ride?.id) return;
    
// //     try {
// //       const response = await fetch(`${API_BASE_URL}/my-rides/${user.phone_number}`);
// //       const data = await response.json();
      
// //       const booking = data.requested_rides?.find(
// //         b => b.ride_id === ride.id && (b.status === 'accepted' || b.status === 'pending')
// //       );
      
// //       if (booking) {
// //         setUserBooking(booking);
// //         setSeatsRequested(booking.seats_requested);
// //         console.log('📦 Found existing booking:', booking);
// //       } else {
// //         setUserBooking(null);
// //         setSeatsRequested(1);
// //       }
// //     } catch (error) {
// //       console.log('Error checking user booking:', error);
// //     }
// //   }, [user?.phone_number, ride?.id]);

// //   // Setup socket listener for booking updates
// //   const setupSocketListener = useCallback(() => {
// //     if (!userBooking?.id) return;
    
// //     const socket = io(API_BASE_URL);
// //     socketRef.current = socket;
    
// //     socket.on('connect', () => {
// //       console.log('Socket connected for booking updates');
// //       socket.emit('join-booking-room', userBooking.id);
// //     });
    
// //     socket.on('booking_accepted', (data) => {
// //       console.log('✅ Booking accepted:', data);
// //       showCustomAlert(
// //         'Booking Confirmed ✅',
// //         `Your booking for ${data.seats} seat(s) has been confirmed by the driver!`,
// //         'success'
// //       );
// //       checkUserBooking(); // Refresh booking status
// //       fetchRideDetails();
// //     });
    
// //     socket.on('booking_rejected', (data) => {
// //       console.log('❌ Booking rejected:', data);
// //       showCustomAlert(
// //         'Booking Declined ❌',
// //         `Your booking request was declined by the driver.`,
// //         'warning'
// //       );
// //       setUserBooking(null);
// //       setSeatsRequested(1);
// //     });
    
// //     socket.on('booking_modified', (data) => {
// //       console.log('📝 Booking modified:', data);
// //       showCustomAlert(
// //         'Booking Updated',
// //         `Your booking has been updated to ${data.seats} seat(s).`,
// //         'info'
// //       );
// //       checkUserBooking();
// //       fetchRideDetails();
// //     });
    
// //     return socket;
// //   }, [userBooking, checkUserBooking, fetchRideDetails]);

// //   useEffect(() => {
// //     if (userBooking?.id) {
// //       const socket = setupSocketListener();
// //       return () => {
// //         if (socket) {
// //           socket.disconnect();
// //           socketRef.current = null;
// //         }
// //       };
// //     }
// //   }, [userBooking?.id, setupSocketListener]);

// //   const loadDriverData = useCallback(async () => {
// //     const driverPhone = ride?.phoneNumber;
// //     const driverUserId = ride?.driverUserId;
    
// //     if (driverPhone || driverUserId) {
// //       setLoadingProfile(true);
// //       try {
// //         const profileData = await fetchDriverProfile(driverPhone, driverUserId);
// //         if (profileData?.success && profileData.user) {
// //           setDriverProfile(profileData.user);
// //         } else {
// //           setDriverProfile(null);
// //         }
        
// //         let verified = false;
// //         if (driverPhone) {
// //           const docsData = await fetchUserDocuments(driverPhone);
// //           if (docsData?.success && docsData.documents) {
// //             const verifiedDocs = docsData.documents.filter(doc => {
// //               const status = doc.status?.toUpperCase();
// //               return status === 'APPROVED' && ['aadhar', 'dl', 'rc'].includes(doc.document_type?.toLowerCase());
// //             });
// //             verified = verifiedDocs.length > 0;
// //             setIsVerified(verified);
// //           }
// //         }
// //       } catch (error) {
// //         console.log('Error loading driver data:', error);
// //       } finally {
// //         setLoadingProfile(false);
// //       }
// //     }
// //   }, [ride?.phoneNumber, ride?.driverUserId]);

// //   // Refresh function
// //   const onRefresh = useCallback(async () => {
// //     setRefreshing(true);
// //     await Promise.all([
// //       loadDriverData(),
// //       checkUserBooking(),
// //       fetchRideDetails(),
// //     ]);
// //     setRefreshing(false);
// //   }, [loadDriverData, checkUserBooking, fetchRideDetails]);

// //   useFocusEffect(
// //     useCallback(() => {
// //       loadDriverData();
// //       checkUserBooking();
// //       fetchRideDetails();
      
// //       return () => {
// //         if (socketRef.current) {
// //           socketRef.current.disconnect();
// //           socketRef.current = null;
// //         }
// //       };
// //     }, [loadDriverData, checkUserBooking, fetchRideDetails])
// //   );

// //   useEffect(() => {
// //     if (!isAuthenticated) {
// //       showCustomAlert('Login Required', 'Please login to book rides.', 'warning');
// //       navigation.goBack();
// //     }
// //   }, [isAuthenticated, navigation]);

// //   const getProfilePhotoUrl = useCallback(() => {
// //     const rawUrl = driverProfile?.profile_picture || ride?.profilePicture;
// //     if (!rawUrl) return null;
// //     return buildImageUrl(rawUrl);
// //   }, [driverProfile, ride]);
  
// //   const profilePhotoUrl = getProfilePhotoUrl();
// //   const avatarText = getDriverInitials(driverProfile?.full_name || ride?.driverName || 'Driver');
// //   const isProfilePhotoSvg = profilePhotoUrl ? profilePhotoUrl.toLowerCase().includes('.svg') : false;
  
// //   const allPreferences = useMemo(() => {
// //     return extractAllPreferences(ride, driverProfile?.travel_preferences);
// //   }, [ride, driverProfile]);

// //   const driverStart = useMemo(() => {
// //     const coords = ride?.routeCoordinates;
// //     if (Array.isArray(coords) && coords.length > 0) {
// //       const first = coords[0];
// //       if (Array.isArray(first) && first.length === 2) return { latitude: first[1], longitude: first[0] };
// //     }
// //     return parseSuggestedPoint(ride?.suggestedPickup);
// //   }, [ride]);

// //   const driverEnd = useMemo(() => {
// //     const coords = ride?.routeCoordinates;
// //     if (Array.isArray(coords) && coords.length > 0) {
// //       const last = coords[coords.length - 1];
// //       if (Array.isArray(last) && last.length === 2) return { latitude: last[1], longitude: last[0] };
// //     }
// //     return parseSuggestedPoint(ride?.suggestedDrop);
// //   }, [ride]);

// //   const intersectionPickup = useMemo(() => parseSuggestedPoint(ride?.suggestedPickup), [ride]);
// //   const intersectionDrop = useMemo(() => parseSuggestedPoint(ride?.suggestedDrop), [ride]);

// //   const userPickup = useMemo(() => {
// //     if (!searchData?.fromCoords) return null;
// //     const c = searchData.fromCoords;
// //     if (Array.isArray(c) && c.length === 2) return { latitude: c[1], longitude: c[0] };
// //     return null;
// //   }, [searchData]);

// //   const userDrop = useMemo(() => {
// //     if (!searchData?.toCoords) return null;
// //     const c = searchData.toCoords;
// //     if (Array.isArray(c) && c.length === 2) return { latitude: c[1], longitude: c[0] };
// //     return null;
// //   }, [searchData]);

// //   const routePath = useMemo(() => {
// //     const fullRoute = parseRouteCoordinates(ride?.routeCoordinates);
// //     if (fullRoute.length >= 2) return fullRoute;
// //     if (intersectionPickup && intersectionDrop) return [intersectionPickup, intersectionDrop];
// //     return [];
// //   }, [ride, intersectionPickup, intersectionDrop]);

// //   const walkToPickupPath = useMemo(() => {
// //     if (userPickup && intersectionPickup) return [userPickup, intersectionPickup];
// //     return [];
// //   }, [userPickup, intersectionPickup]);

// //   const walkFromDropPath = useMemo(() => {
// //     if (userDrop && intersectionDrop) return [intersectionDrop, userDrop];
// //     return [];
// //   }, [userDrop, intersectionDrop]);

// //   const allMarkerCoords = useMemo(() => {
// //     const coords = [];
// //     if (driverStart) coords.push(driverStart);
// //     if (driverEnd) coords.push(driverEnd);
// //     if (userPickup) coords.push(userPickup);
// //     if (userDrop) coords.push(userDrop);
// //     if (intersectionPickup) coords.push(intersectionPickup);
// //     if (intersectionDrop) coords.push(intersectionDrop);
// //     return coords;
// //   }, [driverStart, driverEnd, userPickup, userDrop, intersectionPickup, intersectionDrop]);

// //   const fitMapToMarkers = useCallback(() => {
// //     if (mapRef.current && mapReady && allMarkerCoords.length >= 2) {
// //       setTimeout(() => {
// //         try {
// //           mapRef.current.fitToCoordinates(allMarkerCoords, {
// //             edgePadding: { top: 80, right: 50, bottom: 50, left: 50 },
// //             animated: true,
// //           });
// //         } catch (e) { console.log('fitToCoordinates error:', e); }
// //       }, 500);
// //     }
// //   }, [mapReady, allMarkerCoords]);

// //   useEffect(() => {
// //     if (mapReady && allMarkerCoords.length >= 2) fitMapToMarkers();
// //   }, [mapReady, allMarkerCoords, fitMapToMarkers]);

// //   const vehicleName = driverProfile?.vehicle 
// //     ? [driverProfile.vehicle.model].filter(Boolean).join(' ')
// //     : [ride?.vehicle?.model].filter(Boolean).join(' ') || 'Vehicle details unavailable';
  
// //   const vehicleRegNumber = driverProfile?.vehicle?.registration_number || ride?.vehicle?.registration_number || null;
// //   const vehicleColor = driverProfile?.vehicle?.color || ride?.vehicle?.color || 'Not specified';

// //   const totalPrice = Number(ride?.price || 0) * seatsRequested;

// //   const handleProfileImagePress = () => {
// //     if (profilePhotoUrl) {
// //       setSelectedProfile({ visible: true, imageUrl: profilePhotoUrl, driverName: driverProfile?.full_name || ride?.driverName || 'Driver' });
// //     } else {
// //       showCustomAlert('No Photo', 'Driver has not uploaded a profile picture', 'warning');
// //     }
// //   };

// //   const mapHeight = animatedDrawer.interpolate({ inputRange: [0, 1], outputRange: [height - SAFE_TOP - COLLAPSED_HEIGHT, height * 0.32] });
// //   const drawerHeight = animatedDrawer.interpolate({ inputRange: [0, 1], outputRange: [COLLAPSED_HEIGHT, EXPANDED_HEIGHT] });

// //   const toggleDrawer = () => {
// //     const nextExpanded = !drawerExpanded;
// //     setDrawerExpanded(nextExpanded);
// //     Animated.timing(animatedDrawer, { toValue: nextExpanded ? 1 : 0, duration: 260, useNativeDriver: false }).start();
// //   };

// //   const panResponder = useRef(PanResponder.create({
// //     onMoveShouldSetPanResponder: (_, gestureState) => Math.abs(gestureState.dy) > 5,
// //     onPanResponderMove: (_, gestureState) => {
// //       const dragRange = EXPANDED_HEIGHT - COLLAPSED_HEIGHT;
// //       const progress = drawerExpanded ? 1 - (gestureState.dy / dragRange) : gestureState.dy / dragRange;
// //       animatedDrawer.setValue(Math.max(0, Math.min(1, progress)));
// //     },
// //     onPanResponderRelease: (_, gestureState) => {
// //       const dragRange = EXPANDED_HEIGHT - COLLAPSED_HEIGHT;
// //       const threshold = dragRange * 0.2;
// //       if (drawerExpanded) {
// //         if (gestureState.dy > threshold) {
// //           setDrawerExpanded(false);
// //           Animated.timing(animatedDrawer, { toValue: 0, duration: 200, useNativeDriver: false }).start();
// //         } else {
// //           setDrawerExpanded(true);
// //           Animated.timing(animatedDrawer, { toValue: 1, duration: 200, useNativeDriver: false }).start();
// //         }
// //       } else {
// //         if (gestureState.dy < -threshold) {
// //           setDrawerExpanded(true);
// //           Animated.timing(animatedDrawer, { toValue: 1, duration: 200, useNativeDriver: false }).start();
// //         } else {
// //           setDrawerExpanded(false);
// //           Animated.timing(animatedDrawer, { toValue: 0, duration: 200, useNativeDriver: false }).start();
// //         }
// //       }
// //     },
// //   })).current;

// //   // Modify seats for pending booking (direct update)
// //   const handleModifySeats = async (newSeatCount) => {
// //     if (!user?.phone_number || !userBooking) return;

// //     if (newSeatCount < 1) {
// //       showCustomAlert('Invalid Seats', 'You must book at least 1 seat.', 'warning');
// //       return;
// //     }

// //     if (newSeatCount > totalRideSeats) {
// //       showCustomAlert('Not Enough Seats', `Cannot exceed ${totalRideSeats} total seats in this ride.`, 'warning');
// //       return;
// //     }

// //     if (newSeatCount === userBooking.seats_requested) {
// //       showCustomAlert('No Change', 'Seat count is already set to this value.', 'info');
// //       return;
// //     }

// //     setModifyingSeats(true);
// //     try {
// //       const response = await fetch(`${API_BASE_URL}/booking/${userBooking.id}/modify-seats`, {
// //         method: 'PUT',
// //         headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
// //         body: JSON.stringify({ new_seats: newSeatCount }),
// //       });

// //       const data = await response.json();

// //       if (!response.ok) {
// //         throw new Error(data.detail || data.message || 'Failed to modify booking');
// //       }

// //       showCustomAlert(
// //         'Booking Updated ✅',
// //         `Your booking has been updated from ${userBooking.seats_requested} to ${newSeatCount} seat(s).`,
// //         'success'
// //       );
      
// //       setUserBooking({ ...userBooking, seats_requested: newSeatCount });
// //       fetchRideDetails();
      
// //     } catch (error) {
// //       console.error('Modify seats error:', error);
// //       showCustomAlert('Error', error.message || 'Failed to modify booking', 'error');
// //     } finally {
// //       setModifyingSeats(false);
// //     }
// //   };

// //   // Cancel booking
// //   const handleCancelBooking = async () => {
// //     if (!user?.phone_number || !userBooking) return;

// //     setCancelLoading(true);
// //     try {
// //       const response = await fetch(`${API_BASE_URL}/booking/${userBooking.id}/cancel`, {
// //         method: 'PUT',
// //         headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
// //       });

// //       const data = await response.json();

// //       if (!response.ok) {
// //         throw new Error(data.detail || data.message || 'Failed to cancel booking');
// //       }

// //       showCustomAlert('Success', data.message || 'Booking cancelled successfully', 'success');
// //       setUserBooking(null);
// //       setSeatsRequested(1);
// //       fetchRideDetails();
      
// //       setTimeout(() => navigation.goBack(), 1500);
// //     } catch (error) {
// //       console.error('Cancel booking error:', error);
// //       showCustomAlert('Error', error.message || 'Failed to cancel booking', 'error');
// //     } finally {
// //       setCancelLoading(false);
// //       setShowCancelModal(false);
// //     }
// //   };

// //   // Create new booking
// //   const handleCreateBooking = async () => {
// //     if (!user?.phone_number) {
// //       showCustomAlert('Login Required', 'Please log in to request a ride.', 'warning');
// //       return;
// //     }

// //     if (ride?.womenOnly === true && user?.gender !== 'female') {
// //       showCustomAlert('Not Available', 'This ride is for women passengers only.', 'warning');
// //       return;
// //     }

// //     const remainingSeats = totalRideSeats - otherBookedSeats;
    
// //     if (seatsRequested > remainingSeats) {
// //       showCustomAlert('Not Enough Seats', `Only ${remainingSeats} seat(s) left in this ride.`, 'warning');
// //       return;
// //     }

// //     setRequestLoading(true);
// //     try {
// //       const payload = {
// //         ride_id: ride.id,
// //         passenger_phone: user.phone_number,
// //         seats_requested: seatsRequested,
// //       };

// //       if (searchData?.fromCoords) payload.from_coords = searchData.fromCoords;
// //       if (searchData?.toCoords) payload.to_coords = searchData.toCoords;

// //       const response = await fetch(`${API_BASE_URL}/ride-bookings`, {
// //         method: 'POST',
// //         headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
// //         body: JSON.stringify(payload),
// //       });

// //       const data = await response.json();

// //       if (!response.ok) {
// //         throw new Error(data.detail || data.message || `Server error (${response.status})`);
// //       }

// //       showCustomAlert(
// //         'Request Sent 📨', 
// //         `Your request for ${seatsRequested} seat(s) has been sent to the driver. You will be notified when they respond.`,
// //         'info'
// //       );
      
// //       // Refresh booking status after a short delay
// //       setTimeout(() => {
// //         checkUserBooking();
// //         fetchRideDetails();
// //       }, 1000);
      
// //     } catch (error) {
// //       console.error('Booking error:', error);
// //       showCustomAlert('Error', error.message || 'Failed to send request', 'error');
// //     } finally {
// //       setRequestLoading(false);
// //     }
// //   };

// //   // Handle button press based on booking status
// //   const handleMainAction = async () => {
// //     if (userBooking) {
// //       // If booking exists, modify seats
// //       await handleModifySeats(seatsRequested);
// //     } else {
// //       // Create new booking
// //       await handleCreateBooking();
// //     }
// //   };

// //   const viewDriverProfile = () => {
// //     const driverPhone = ride?.phoneNumber;
// //     const driverUserId = ride?.driverUserId;
    
// //     if (driverPhone || driverUserId) {
// //       navigation.navigate('ViewProfileScreen', {
// //         userId: driverUserId || null,
// //         phoneNumber: driverPhone || null,
// //         driverName: driverProfile?.full_name || ride?.driverName || 'Driver',
// //         profilePicture: profilePhotoUrl,
// //         vehicleNumber: vehicleRegNumber,
// //         vehicleModel: vehicleName,
// //         driverRating: driverProfile?.avg_rating || ride?.rating || 0,
// //       });
// //     } else {
// //       showCustomAlert('Profile', 'Driver profile not available', 'warning');
// //     }
// //   };

// //   const getOrCreateConversation = async (receiverPhone, rideId) => {
// //     try {
// //       const myPhone = user?.phone_number;
// //       if (!myPhone) return null;
// //       const response = await fetch(`${API_BASE_URL}/api/chat/conversations`, {
// //         method: 'POST',
// //         headers: { 'X-Phone-Number': myPhone, 'Content-Type': 'application/json' },
// //         body: JSON.stringify({ participant_phone: receiverPhone, ride_id: rideId }),
// //       });
// //       const data = await response.json();
// //       return data.success ? data.conversation.id : null;
// //     } catch (error) {
// //       console.error('getOrCreateConversation error:', error);
// //       return null;
// //     }
// //   };

// //   const startChat = async () => {
// //     const driverPhone = ride?.phoneNumber;
// //     if (driverPhone) {
// //       const conversationId = await getOrCreateConversation(driverPhone, ride.id);
// //       if (conversationId) {
// //         navigation.navigate('ChatScreen', {
// //           receiverPhone: driverPhone,
// //           conversationId,
// //           user: { name: driverProfile?.full_name || ride?.driverName || 'Driver', tripInfo: `${ride.from} → ${ride.to}` },
// //         });
// //       } else {
// //         showCustomAlert('Chat', 'Unable to start chat.', 'error');
// //       }
// //     } else {
// //       showCustomAlert('Chat', 'Driver contact not available', 'warning');
// //     }
// //   };

// //   if (requestLoading || cancelLoading || loadingProfile) {
// //     return (
// //       <View style={styles.loaderContainer}>
// //         <LottieView source={require("../assets/loading.json")} autoPlay loop style={{ width: 300, height: 300 }} />
// //       </View>
// //     );
// //   }

// //   if (!ride) {
// //     return (
// //       <View style={styles.centerContainer}>
// //         <Text style={styles.errorText}>No ride data available</Text>
// //         <TouchableOpacity onPress={() => navigation.goBack()} style={styles.fallbackBtn}>
// //           <Text style={styles.fallbackBtnText}>Go Back</Text>
// //         </TouchableOpacity>
// //       </View>
// //     );
// //   }

// //   const initialRegion = {
// //     latitude: intersectionPickup?.latitude || driverStart?.latitude || 28.6139,
// //     longitude: intersectionPickup?.longitude || driverStart?.longitude || 77.2090,
// //     latitudeDelta: 0.05,
// //     longitudeDelta: 0.05,
// //   };

// //   const isBooked = !!userBooking;
// //   const canModify = isBooked && userBooking.status === 'pending';
// //   const isAccepted = isBooked && userBooking.status === 'accepted';
  
// //   const remainingForOthers = totalRideSeats - otherBookedSeats;
// //   const maxSelectable = isBooked ? totalRideSeats : remainingForOthers;
// //   const currentBookedSeats = userBooking?.seats_requested || 0;

// //   return (
// //     <View style={styles.container}>
// //       <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />

// //       <Animated.View style={[styles.mapContainer, { height: mapHeight }]}>
// //         <MapView
// //           ref={mapRef}
// //           provider={PROVIDER_GOOGLE}
// //           style={styles.map}
// //           initialRegion={initialRegion}
// //           onMapReady={() => setMapReady(true)}
// //           showsUserLocation={false}
// //           showsMyLocationButton={false}
// //           zoomEnabled={true}
// //           zoomControlEnabled={true}
// //         >
// //           {routePath.length >= 2 && (
// //             <Polyline coordinates={routePath} strokeColor="#2457A6" strokeWidth={5} lineCap="round" lineJoin="round" />
// //           )}

// //           {driverStart && (
// //             <Marker coordinate={driverStart} anchor={{ x: 0.5, y: 1 }}>
// //               <View style={styles.markerWrapper}>
// //                 <View style={[styles.pinBubble, { backgroundColor: '#16A34A' }]}>
// //                   <Text style={styles.pinIcon}>S</Text>
// //                 </View>
// //                 <View style={[styles.pinPointer, { borderTopColor: '#16A34A' }]} />
// //               </View>
// //             </Marker>
// //           )}

// //           {driverEnd && (
// //             <Marker coordinate={driverEnd} anchor={{ x: 0.5, y: 1 }}>
// //               <View style={styles.markerWrapper}>
// //                 <View style={[styles.pinBubble, { backgroundColor: '#DC2626' }]}>
// //                   <Text style={styles.pinIcon}>E</Text>
// //                 </View>
// //                 <View style={[styles.pinPointer, { borderTopColor: '#DC2626' }]} />
// //               </View>
// //             </Marker>
// //           )}

// //           {userPickup && (
// //             <Marker coordinate={userPickup} anchor={{ x: 0.5, y: 1 }}>
// //               <View style={styles.markerWrapper}>
// //                 <View style={[styles.pinBubble, { backgroundColor: '#3B82F6' }]}>
// //                   <Ionicons name="person" size={12} color="white" />
// //                 </View>
// //                 <View style={[styles.pinPointer, { borderTopColor: '#3B82F6' }]} />
// //                 <View style={styles.pinLabelBubble}>
// //                   <Text style={styles.pinLabelText}>Your Pickup</Text>
// //                 </View>
// //               </View>
// //             </Marker>
// //           )}

// //           {userDrop && (
// //             <Marker coordinate={userDrop} anchor={{ x: 0.5, y: 1 }}>
// //               <View style={styles.markerWrapper}>
// //                 <View style={[styles.pinBubble, { backgroundColor: '#F97316' }]}>
// //                   <Ionicons name="flag" size={12} color="white" />
// //                 </View>
// //                 <View style={[styles.pinPointer, { borderTopColor: '#F97316' }]} />
// //                 <View style={styles.pinLabelBubble}>
// //                   <Text style={styles.pinLabelText}>Your Drop</Text>
// //                 </View>
// //               </View>
// //             </Marker>
// //           )}

// //           {intersectionPickup && (
// //             <Marker coordinate={intersectionPickup} anchor={{ x: 0.5, y: 1 }}>
// //               <View style={styles.markerWrapper}>
// //                 <View style={[styles.pinBubble, { backgroundColor: '#FACC15' }]}>
// //                   <Ionicons name="hand-right" size={12} color="#713F12" />
// //                 </View>
// //                 <View style={[styles.pinPointer, { borderTopColor: '#FACC15' }]} />
// //                 <View style={styles.pinLabelBubbleYellow}>
// //                   <Text style={styles.pinLabelTextYellow}>Meet Driver</Text>
// //                 </View>
// //               </View>
// //             </Marker>
// //           )}

// //           {intersectionDrop && (
// //             <Marker coordinate={intersectionDrop} anchor={{ x: 0.5, y: 1 }}>
// //               <View style={styles.markerWrapper}>
// //                 <View style={[styles.pinBubble, { backgroundColor: '#FACC15' }]}>
// //                   <Ionicons name="exit" size={12} color="#713F12" />
// //                 </View>
// //                 <View style={[styles.pinPointer, { borderTopColor: '#FACC15' }]} />
// //                 <View style={styles.pinLabelBubbleYellow}>
// //                   <Text style={styles.pinLabelTextYellow}>Exit Here</Text>
// //                 </View>
// //               </View>
// //             </Marker>
// //           )}

// //           {walkToPickupPath.length >= 2 && (
// //             <Polyline coordinates={walkToPickupPath} strokeColor="#FACC15" strokeWidth={4} lineDashPattern={[8, 6]} lineCap="round" lineJoin="round" />
// //           )}

// //           {walkFromDropPath.length >= 2 && (
// //             <Polyline coordinates={walkFromDropPath} strokeColor="#FACC15" strokeWidth={4} lineDashPattern={[8, 6]} lineCap="round" lineJoin="round" />
// //           )}
// //         </MapView>

// //         <TouchableOpacity style={styles.mapBackButton} onPress={() => navigation.goBack()}>
// //           <Ionicons name="chevron-back" size={26} color={Colors.secondary} />
// //         </TouchableOpacity>
// //       </Animated.View>

// //       <Animated.View style={[styles.drawer, { height: drawerHeight }]}>
// //         <View style={styles.handleWrap} {...panResponder.panHandlers}>
// //           <TouchableOpacity activeOpacity={0.9} onPress={toggleDrawer} style={styles.handleHitArea}>
// //             <View style={styles.handleBar} />
// //           </TouchableOpacity>
// //         </View>

// //         {!drawerExpanded ? (
// //           <View style={styles.collapsedSummary}>
// //             <View style={styles.collapsedTopRow}>
// //               <View style={{ flex: 1 }}>
// //                 <Text style={styles.collapsedDriver} numberOfLines={1}>{driverProfile?.full_name || ride?.driverName || 'Driver'}</Text>
// //                 <Text style={styles.collapsedSub} numberOfLines={1}>{ride.from} → {ride.to}</Text>
// //               </View>
// //               <View style={styles.collapsedPriceWrap}>
// //                 <Text style={styles.collapsedPrice}>₹{ride.price}</Text>
// //                 <Text style={styles.collapsedPerSeat}>per seat</Text>
// //               </View>
// //             </View>
// //           </View>
// //         ) : (
// //           <>
// //             <ScrollView 
// //               style={styles.drawerScroll} 
// //               contentContainerStyle={styles.drawerContent} 
// //               showsVerticalScrollIndicator={false}
// //               refreshControl={
// //                 <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
// //               }
// //             >
// //               <View style={styles.driverCard}>
// //                 <View style={styles.driverTopRow}>
// //                   <View style={styles.driverLeftWrap}>
// //                     <TouchableOpacity style={styles.driverAvatar} onPress={handleProfileImagePress} activeOpacity={0.8}>
// //                       {profilePhotoUrl ? (
// //                         isProfilePhotoSvg ? (
// //                           <View style={styles.svgAvatarContainer}><SvgCssUri uri={profilePhotoUrl} width={56} height={56} /></View>
// //                         ) : (
// //                           <Image source={{ uri: profilePhotoUrl }} style={styles.avatarImg} />
// //                         )
// //                       ) : (
// //                         <Text style={styles.avatarText}>{avatarText}</Text>
// //                       )}
// //                     </TouchableOpacity>
// //                     <View style={styles.driverMeta}>
// //                       <View style={styles.driverNameRow}>
// //                         <Text style={styles.driverName}>{driverProfile?.full_name || ride?.driverName || 'Driver'}</Text>
// //                         {isVerified && (
// //                           <View style={styles.verifiedBadge}>
// //                             <Ionicons name="checkmark-circle" size={12} color="#2457A6" />
// //                             <Text style={styles.verifiedBadgeText}>Verified</Text>
// //                           </View>
// //                         )}
// //                       </View>
// //                       <View style={styles.ratingRow}>
// //                         <Ionicons name="star" size={13} color="#F59E0B" />
// //                         <Text style={styles.ratingText}>{driverProfile?.avg_rating || ride?.rating || 4.5}</Text>
// //                       </View>
// //                     </View>
// //                   </View>
// //                   <TouchableOpacity style={styles.chatButtonCircle} onPress={startChat}>
// //                     <Ionicons name="chatbubble-outline" size={20} color="#2457A6" />
// //                   </TouchableOpacity>
// //                 </View>
// //                 <Text style={styles.driverBio}>{driverProfile?.bio || driverProfile?.about || 'Friendly driver, love meeting new people!'}</Text>
// //                 <TouchableOpacity style={styles.profileOutlineBtn} onPress={viewDriverProfile}>
// //                   <Text style={styles.profileOutlineBtnText}>View Full Profile</Text>
// //                 </TouchableOpacity>
// //               </View>

// //               <View style={styles.cardSection}>
// //                 <Text style={styles.sectionTitle}>Trip Details</Text>
// //                 <View style={styles.tripTimelineWrap}>
// //                   <View style={styles.timelineRail}>
// //                     <View style={[styles.timelineDot, { backgroundColor: '#2457A6' }]} />
// //                     <View style={styles.timelineLine} />
// //                     <View style={[styles.timelineDot, { backgroundColor: '#FF7A00' }]} />
// //                   </View>
// //                   <View style={styles.timelineContent}>
// //                     <View style={styles.timelineItem}>
// //                       <Text style={styles.timelineLabel}>Pickup</Text>
// //                       <Text style={styles.timelinePlace}>{ride.pickupLabel || ride.from}</Text>
// //                       <View style={styles.timelineMetaRow}>
// //                         <Ionicons name="time-outline" size={13} color={Colors.gray} />
// //                         <Text style={styles.timelineMetaText}>{ride.date} at {ride.time}</Text>
// //                       </View>
// //                     </View>
// //                     <View style={styles.timelineItem}>
// //                       <Text style={styles.timelineLabel}>Dropoff</Text>
// //                       <Text style={styles.timelinePlace}>{ride.dropLabel || ride.to}</Text>
// //                       <Text style={styles.timelineMetaText}>Estimated: {ride.durationText || '--'}</Text>
// //                     </View>
// //                   </View>
// //                 </View>
// //               </View>

// //               <View style={styles.cardSection}>
// //                 <Text style={styles.sectionTitle}>Vehicle Details</Text>
// //                 <View style={styles.vehicleHeaderRow}>
// //                   <View style={styles.vehicleIconCircle}><Ionicons name="car-sport-outline" size={18} color="#2457A6" /></View>
// //                   <View style={styles.vehicleMeta}>
// //                     <Text style={styles.vehicleTitle}>{vehicleName}</Text>
// //                     <Text style={styles.vehicleSub}>{vehicleColor} • {totalRideSeats} seats total</Text>
// //                     {vehicleRegNumber && (
// //                       <View style={styles.vehicleRegContainer}>
// //                         <Text style={styles.vehicleRegText}>Vehicle Number: {vehicleRegNumber}</Text>
// //                       </View>
// //                     )}
// //                   </View>
// //                 </View>
// //               </View>

// //               <View style={styles.cardSection}>
// //                 <Text style={styles.sectionTitle}>Ride Preferences</Text>
// //                 <View style={styles.tagRow}>
// //                   {allPreferences.length > 0 ? (
// //                     allPreferences.map((pref, index) => <GenericPreferenceTag key={`${pref}-${index}`} label={pref} />)
// //                   ) : (
// //                     <Text style={styles.emptyText}>No specific preferences added</Text>
// //                   )}
// //                 </View>
// //               </View>

// //               <View style={styles.cardSection}>
// //                 <Text style={styles.sectionTitle}>Cost Breakdown</Text>
// //                 <View style={styles.priceRow}>
// //                   <Text style={styles.priceLabel}>Base fare (per seat)</Text>
// //                   <Text style={styles.priceValue}>₹{ride.price}</Text>
// //                 </View>
// //                 <View style={styles.priceDivider} />
// //                 <View style={styles.priceRow}>
// //                   <Text style={styles.totalLabel}>Total for {seatsRequested} seat(s)</Text>
// //                   <Text style={styles.totalValue}>₹{totalPrice}</Text>
// //                 </View>
// //                 <View style={styles.noticeBox}>
// //                   <Text style={styles.noticeText}>Cost-share contribution - sharing travel costs with the driver.</Text>
// //                 </View>
// //               </View>

// //               <View style={styles.cardSection}>
// //                 <Text style={styles.sectionTitle}>{isBooked ? 'Your Booking' : 'Select Seats'}</Text>
                
// //                 <View style={styles.seatInfoBox}>
// //                   <Text style={styles.seatInfoText}>
// //                     🚗 Total seats in vehicle: <Text style={styles.seatInfoBold}>{totalRideSeats}</Text>
// //                   </Text>
// //                   {otherBookedSeats > 0 && !isBooked && (
// //                     <Text style={styles.seatInfoText}>
// //                       👥 Other passengers booked: <Text style={styles.seatInfoBold}>{otherBookedSeats}</Text> seat(s)
// //                     </Text>
// //                   )}
// //                   {isBooked && (
// //                     <Text style={styles.seatInfoText}>
// //                       ✅ You have booked: <Text style={styles.seatInfoBold}>{currentBookedSeats}</Text> seat(s)
// //                     </Text>
// //                   )}
// //                   <Text style={styles.seatInfoText}>
// //                     📍 Seats available: <Text style={styles.seatInfoBold}>{remainingForOthers}</Text> seat(s)
// //                   </Text>
// //                 </View>
                
// //                 {isBooked && (
// //                   <View style={[styles.currentBookingContainer, isAccepted && styles.confirmedBookingContainer]}>
// //                     {userBooking.status === 'pending' ? (
// //                       <>
// //                         <Ionicons name="time-outline" size={24} color="#F59E0B" />
// //                         <Text style={styles.pendingBookingTitle}>
// //                           ⏳ Waiting for Driver Confirmation
// //                         </Text>
// //                         <Text style={styles.currentBookingText}>
// //                           You have requested {userBooking.seats_requested} seat(s) for this ride.
// //                         </Text>
// //                         <Text style={styles.currentBookingHint}>
// //                           You can modify or cancel your request anytime. The driver will notify you once confirmed.
// //                         </Text>
// //                       </>
// //                     ) : (
// //                       <>
// //                         <Ionicons name="checkmark-circle" size={24} color="#10B981" />
// //                         <Text style={styles.confirmedBookingTitle}>
// //                           ✅ Booking Confirmed!
// //                         </Text>
// //                         <Text style={styles.currentBookingText}>
// //                           You have booked {userBooking.seats_requested} seat(s) for this ride.
// //                         </Text>
// //                         <Text style={styles.currentBookingHint}>
// //                           You can modify or cancel your booking anytime before the ride starts.
// //                         </Text>
// //                       </>
// //                     )}
// //                   </View>
// //                 )}
                
// //                 {isBooked && canModify && (
// //                   <>
// //                     <View style={styles.seatSelectorRow}>
// //                       <TouchableOpacity
// //                         style={[styles.seatActionBtn, seatsRequested === 1 && styles.seatActionBtnDisabled]}
// //                         onPress={() => setSeatsRequested(Math.max(1, seatsRequested - 1))}
// //                         disabled={seatsRequested === 1 || modifyingSeats}
// //                       >
// //                         <Ionicons name="remove" size={20} color={seatsRequested === 1 ? Colors.gray : Colors.dark} />
// //                       </TouchableOpacity>

// //                       <View style={styles.seatCountWrap}>
// //                         <Text style={styles.seatCountText}>{seatsRequested}</Text>
// //                         <Text style={styles.seatAvailableText}>
// //                           / {totalRideSeats} total seats
// //                         </Text>
// //                       </View>

// //                       <TouchableOpacity
// //                         style={[styles.seatActionBtn, seatsRequested === totalRideSeats && styles.seatActionBtnDisabled]}
// //                         onPress={() => setSeatsRequested(Math.min(totalRideSeats, seatsRequested + 1))}
// //                         disabled={seatsRequested === totalRideSeats || modifyingSeats}
// //                       >
// //                         <Ionicons name="add" size={20} color={seatsRequested === totalRideSeats ? Colors.gray : "#2457A6"} />
// //                       </TouchableOpacity>
// //                     </View>
                    
// //                     {seatsRequested !== currentBookedSeats && (
// //                       <View style={styles.priceDifferenceContainer}>
// //                         <Text style={styles.priceDifferenceText}>
// //                           {seatsRequested > currentBookedSeats 
// //                             ? `+ ₹${ride.price * (seatsRequested - currentBookedSeats)} will be charged`
// //                             : `- ₹${ride.price * (currentBookedSeats - seatsRequested)} will be refunded`}
// //                         </Text>
// //                       </View>
// //                     )}
// //                   </>
// //                 )}
                
// //                 {!isBooked && (
// //                   <>
// //                     <View style={styles.seatSelectorRow}>
// //                       <TouchableOpacity
// //                         style={[styles.seatActionBtn, seatsRequested === 1 && styles.seatActionBtnDisabled]}
// //                         onPress={() => setSeatsRequested(Math.max(1, seatsRequested - 1))}
// //                         disabled={seatsRequested === 1}
// //                       >
// //                         <Ionicons name="remove" size={20} color={seatsRequested === 1 ? Colors.gray : Colors.dark} />
// //                       </TouchableOpacity>

// //                       <View style={styles.seatCountWrap}>
// //                         <Text style={styles.seatCountText}>{seatsRequested}</Text>
// //                         <Text style={styles.seatAvailableText}>
// //                           / {remainingForOthers} available
// //                         </Text>
// //                       </View>

// //                       <TouchableOpacity
// //                         style={[styles.seatActionBtn, seatsRequested === remainingForOthers && styles.seatActionBtnDisabled]}
// //                         onPress={() => setSeatsRequested(Math.min(remainingForOthers, seatsRequested + 1))}
// //                         disabled={seatsRequested === remainingForOthers}
// //                       >
// //                         <Ionicons name="add" size={20} color={seatsRequested === remainingForOthers ? Colors.gray : "#2457A6"} />
// //                       </TouchableOpacity>
// //                     </View>
// //                     <View style={styles.seatInfoNote}>
// //                       <Text style={styles.seatInfoNoteText}>💡 You can modify or cancel anytime before the ride starts.</Text>
// //                     </View>
// //                   </>
// //                 )}
                
// //                 {isBooked && (
// //                   <TouchableOpacity 
// //                     style={styles.cancelBookingBtn} 
// //                     onPress={() => setShowCancelModal(true)} 
// //                     disabled={cancelLoading}
// //                   >
// //                     <Text style={styles.cancelBookingBtnText}>
// //                       {userBooking.status === 'pending' ? 'Cancel Request' : 'Cancel Booking'}
// //                     </Text>
// //                   </TouchableOpacity>
// //                 )}
// //               </View>

// //               <View style={styles.safetyCard}>
// //                 <View style={styles.simpleInfoLeft}>
// //                   <Ionicons name="shield-checkmark-outline" size={18} color="#2457A6" />
// //                   <View>
// //                     <Text style={styles.safetyTitle}>Safety First</Text>
// //                     <Text style={styles.safetySub}>Live GPS tracking & 24/7 support</Text>
// //                   </View>
// //                 </View>
// //               </View>

// //               <View style={{ height: 110 }} />
// //             </ScrollView>

// //             <View style={styles.bottomBar}>
// //               <View>
// //                 <Text style={styles.bottomCaption}>Total for {seatsRequested} seat(s)</Text>
// //                 <Text style={styles.bottomTotal}>₹{totalPrice}</Text>
// //               </View>

// //               <TouchableOpacity
// //                 style={[
// //                   styles.bookNowBtn, 
// //                   (requestLoading || cancelLoading || modifyingSeats) && styles.bookNowBtnDisabled,
// //                   isBooked && styles.modifyBtn
// //                 ]}
// //                 onPress={handleMainAction}
// //                 disabled={requestLoading || cancelLoading || modifyingSeats}
// //               >
// //                 <Text style={styles.bookNowText}>
// //                   {isBooked 
// //                     ? (modifyingSeats ? 'Updating...' : 'Update Booking')
// //                     : (requestLoading ? 'Sending Request...' : 'Request Ride')}
// //                 </Text>
// //               </TouchableOpacity>
// //             </View>
// //           </>
// //         )}
// //       </Animated.View>

// //       <Modal visible={showCancelModal} transparent={true} animationType="fade" onRequestClose={() => setShowCancelModal(false)}>
// //         <View style={styles.modalBackdrop}>
// //           <View style={styles.confirmModalContainer}>
// //             <View style={styles.confirmModalContent}>
// //               <View style={styles.confirmModalHeader}>
// //                 <Ionicons name="alert-circle" size={40} color="#F59E0B" />
// //                 <Text style={styles.confirmModalTitle}>
// //                   {userBooking?.status === 'pending' ? 'Cancel Request?' : 'Cancel Booking?'}
// //                 </Text>
// //               </View>
// //               <Text style={styles.confirmModalMessage}>
// //                 {userBooking?.status === 'pending' 
// //                   ? 'Are you sure you want to cancel your ride request?'
// //                   : 'Are you sure you want to cancel your booking? This action cannot be undone.'}
// //               </Text>
// //               <View style={styles.confirmModalButtons}>
// //                 <TouchableOpacity style={[styles.confirmModalBtn, styles.confirmModalCancelBtn]} onPress={() => setShowCancelModal(false)}>
// //                   <Text style={styles.confirmModalCancelBtnText}>No, Keep</Text>
// //                 </TouchableOpacity>
// //                 <TouchableOpacity style={[styles.confirmModalBtn, styles.confirmModalConfirmBtn]} onPress={handleCancelBooking}>
// //                   <Text style={styles.confirmModalConfirmBtnText}>Yes, Cancel</Text>
// //                 </TouchableOpacity>
// //               </View>
// //             </View>
// //           </View>
// //         </View>
// //       </Modal>

// //       <ProfileImageModal visible={selectedProfile.visible} imageUrl={selectedProfile.imageUrl} driverName={selectedProfile.driverName} onClose={() => setSelectedProfile({ visible: false, imageUrl: null, driverName: '' })} />

// //       <CustomAlert visible={alertVisible} title={alertConfig.title} message={alertConfig.message} icon={alertConfig.icon} iconColor={alertConfig.iconColor} buttons={alertConfig.buttons} onBackdropPress={() => setAlertVisible(false)} />
// //     </View>
// //   );
// // }

// // const styles = StyleSheet.create({
// //   container: { flex: 1, backgroundColor: '#F4F5F7' },
// //   centerContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 24 },
// //   errorText: { fontSize: 18, color: Colors.gray, marginBottom: 16, textAlign: 'center' },
// //   fallbackBtn: { backgroundColor: Colors.primary, paddingHorizontal: 20, paddingVertical: 12, borderRadius: 12 },
// //   fallbackBtnText: { color: 'white', fontWeight: '700' },
// //   mapContainer: { width: '100%', overflow: 'hidden', backgroundColor: '#E8EEF7' },
// //   map: { flex: 1, backgroundColor: '#E8EEF7' },
// //   mapBackButton: { position: 'absolute', top: Platform.OS === 'ios' ? 54 : 22, left: 14, width: 42, height: 42, borderRadius: 25, backgroundColor: 'rgba(255,255,255,0.96)', alignItems: 'center', justifyContent: 'center' },
// //   markerWrapper: { alignItems: 'center' },
// //   pinBubble: { width: 28, height: 28, borderRadius: 14, borderWidth: 3, borderColor: 'white', alignItems: 'center', justifyContent: 'center', shadowColor: '#000', shadowOffset: { width: 0, height: 3 }, shadowOpacity: 0.25, shadowRadius: 4, elevation: 5 },
// //   pinPointer: { width: 0, height: 0, backgroundColor: 'transparent', borderStyle: 'solid', borderLeftWidth: 7, borderRightWidth: 7, borderTopWidth: 10, borderLeftColor: 'transparent', borderRightColor: 'transparent', marginTop: -2 },
// //   pinIcon: { fontSize: 14, fontWeight: '800', color: 'white', textAlign: 'center', lineHeight: 18 },
// //   pinLabelBubble: { backgroundColor: 'rgba(0,0,0,0.75)', borderRadius: 8, paddingHorizontal: 8, paddingVertical: 3, marginTop: 4 },
// //   pinLabelText: { color: 'white', fontSize: 10, fontWeight: '700' },
// //   pinLabelBubbleYellow: { backgroundColor: 'rgba(113, 63, 18, 0.9)', borderRadius: 8, paddingHorizontal: 8, paddingVertical: 3, marginTop: 4 },
// //   pinLabelTextYellow: { color: '#FACC15', fontSize: 10, fontWeight: '700' },
// //   drawer: { position: 'absolute', bottom: 0, left: 0, right: 0, backgroundColor: '#F4F5F7', borderTopLeftRadius: 28, borderTopRightRadius: 28, overflow: 'hidden' },
// //   handleWrap: { alignItems: 'center', paddingTop: 10, paddingBottom: 8, backgroundColor: '#F4F5F7' },
// //   handleHitArea: { paddingHorizontal: 40, paddingVertical: 10, alignItems: 'center', justifyContent: 'center' },
// //   handleBar: { width: 64, height: 6, borderRadius: 99, backgroundColor: '#CDD2D8' },
// //   collapsedSummary: { paddingHorizontal: 16, paddingTop: 4, paddingBottom: 12 },
// //   collapsedTopRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: 12 },
// //   collapsedDriver: { fontSize: 16, fontWeight: '800', color: Colors.dark },
// //   collapsedSub: { marginTop: 2, fontSize: 12, color: Colors.gray, fontWeight: '600' },
// //   collapsedPriceWrap: { alignItems: 'flex-end' },
// //   collapsedPrice: { fontSize: 18, fontWeight: '900', color: Colors.dark },
// //   collapsedPerSeat: { fontSize: 10, color: Colors.gray, fontWeight: '600' },
// //   drawerScroll: { flex: 1 },
// //   drawerContent: { paddingHorizontal: 16, paddingBottom: 16 },
// //   driverCard: { backgroundColor: 'white', borderRadius: 20, padding: 16, marginBottom: 14, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 8, elevation: 2 },
// //   driverTopRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
// //   driverLeftWrap: { flexDirection: 'row', flex: 1, paddingRight: 10 },
// //   driverAvatar: { width: 56, height: 56, borderRadius: 28, backgroundColor: '#E5E7EB', overflow: 'hidden', alignItems: 'center', justifyContent: 'center', marginRight: 12 },
// //   avatarImg: { width: 56, height: 56, borderRadius: 28 },
// //   avatarText: { fontSize: 15, fontWeight: '800', color: Colors.gray },
// //   svgAvatarContainer: { width: 56, height: 56, borderRadius: 28, overflow: 'hidden', alignItems: 'center', justifyContent: 'center', backgroundColor: '#E5E7EB' },
// //   driverMeta: { flex: 1 },
// //   driverNameRow: { flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap', gap: 6 },
// //   driverName: { fontSize: 17, fontWeight: '800', color: Colors.dark },
// //   verifiedBadge: { flexDirection: 'row', alignItems: 'center', gap: 4 },
// //   verifiedBadgeText: { fontSize: 11, color: '#2457A6', fontWeight: '700' },
// //   ratingRow: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 6 },
// //   ratingText: { fontSize: 13, color: Colors.dark, fontWeight: '700' },
// //   chatButtonCircle: { width: 42, height: 42, borderRadius: 21, backgroundColor: '#EAF1FF', alignItems: 'center', justifyContent: 'center' },
// //   driverBio: { marginTop: 12, fontSize: 14, lineHeight: 20, color: Colors.gray },
// //   profileOutlineBtn: { marginTop: 14, borderWidth: 1, borderColor: '#2457A6', borderRadius: 16, paddingVertical: 12, alignItems: 'center' },
// //   profileOutlineBtnText: { color: '#2457A6', fontWeight: '700', fontSize: 14 },
// //   cardSection: { backgroundColor: 'white', borderRadius: 20, padding: 16, marginBottom: 14, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 8, elevation: 2 },
// //   sectionTitle: { fontSize: 16, fontWeight: '800', color: Colors.dark, marginBottom: 14 },
// //   seatInfoBox: { backgroundColor: '#F0F9FF', borderRadius: 12, padding: 12, marginBottom: 16 },
// //   seatInfoText: { fontSize: 13, color: Colors.dark, marginBottom: 4 },
// //   seatInfoBold: { fontWeight: '800', color: Colors.primary },
// //   currentBookingContainer: { backgroundColor: '#EFF6FF', borderRadius: 12, padding: 16, marginBottom: 16, alignItems: 'center' },
// //   confirmedBookingContainer: { backgroundColor: '#E8F5E9' },
// //   pendingBookingTitle: { fontSize: 16, fontWeight: '700', color: '#F59E0B', marginTop: 8, marginBottom: 4 },
// //   confirmedBookingTitle: { fontSize: 16, fontWeight: '700', color: '#10B981', marginTop: 8, marginBottom: 4 },
// //   currentBookingText: { fontSize: 14, color: Colors.dark, textAlign: 'center', marginBottom: 4 },
// //   currentBookingHint: { fontSize: 12, color: Colors.gray, textAlign: 'center' },
// //   seatInfoNote: { marginTop: 12, backgroundColor: '#FEF3C7', borderRadius: 8, padding: 10 },
// //   seatInfoNoteText: { fontSize: 11, color: '#92400E', textAlign: 'center' },
// //   priceDifferenceContainer: { marginTop: 12, padding: 10, backgroundColor: '#EFF6FF', borderRadius: 8, alignItems: 'center' },
// //   priceDifferenceText: { fontSize: 12, color: '#2457A6', fontWeight: '600' },
// //   tripTimelineWrap: { flexDirection: 'row' },
// //   timelineRail: { width: 18, alignItems: 'center', marginTop: 4 },
// //   timelineDot: { width: 10, height: 10, borderRadius: 5 },
// //   timelineLine: { width: 2, flex: 1, backgroundColor: '#D8DCE3', marginVertical: 6 },
// //   timelineContent: { flex: 1, paddingLeft: 8 },
// //   timelineItem: { marginBottom: 14 },
// //   timelineLabel: { fontSize: 12, color: Colors.gray, fontWeight: '700' },
// //   timelinePlace: { fontSize: 15, color: Colors.dark, fontWeight: '700', marginTop: 4 },
// //   timelineMetaRow: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 6 },
// //   timelineMetaText: { fontSize: 12, color: Colors.gray, fontWeight: '600' },
// //   vehicleHeaderRow: { flexDirection: 'row', alignItems: 'center' },
// //   vehicleIconCircle: { width: 42, height: 42, borderRadius: 21, backgroundColor: '#EAF1FF', alignItems: 'center', justifyContent: 'center', marginRight: 12 },
// //   vehicleMeta: { flex: 1 },
// //   vehicleTitle: { fontSize: 15, fontWeight: '800', color: Colors.dark },
// //   vehicleSub: { marginTop: 3, fontSize: 12, color: Colors.gray, fontWeight: '600' },
// //   vehicleRegContainer: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 6, paddingTop: 6, borderTopWidth: 1, borderTopColor: '#F0F0F0' },
// //   vehicleRegText: { fontSize: 11, color: '#6B7280', fontWeight: '500' },
// //   tagRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 14 },
// //   preferenceTag: { paddingHorizontal: 12, paddingVertical: 8, borderRadius: 999, backgroundColor: '#FFF3E8' },
// //   preferenceTagText: { fontSize: 12, color: '#C65D00', fontWeight: '700' },
// //   emptyText: { fontSize: 13, color: Colors.gray, fontWeight: '600' },
// //   priceRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
// //   priceLabel: { fontSize: 14, color: Colors.gray, fontWeight: '500' },
// //   priceValue: { fontSize: 14, color: Colors.dark, fontWeight: '700' },
// //   priceDivider: { height: 1, backgroundColor: '#ECEEF2', marginVertical: 8 },
// //   totalLabel: { fontSize: 15, color: Colors.dark, fontWeight: '800' },
// //   totalValue: { fontSize: 15, color: '#2457A6', fontWeight: '800' },
// //   noticeBox: { marginTop: 12, backgroundColor: '#FFF2E9', borderRadius: 14, padding: 12 },
// //   noticeText: { fontSize: 12.5, color: Colors.dark, lineHeight: 18 },
// //   seatSelectorRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: '#FAFAFB', borderRadius: 18, padding: 14 },
// //   seatActionBtn: { width: 38, height: 38, borderRadius: 12, borderWidth: 1, borderColor: '#D6DDE7', alignItems: 'center', justifyContent: 'center', backgroundColor: 'white' },
// //   seatActionBtnDisabled: { opacity: 0.5, backgroundColor: '#F5F5F5' },
// //   seatCountWrap: { flexDirection: 'row', alignItems: 'baseline' },
// //   seatCountText: { fontSize: 28, fontWeight: '900', color: Colors.dark },
// //   seatAvailableText: { fontSize: 13, color: Colors.gray, marginLeft: 6, fontWeight: '600' },
// //   cancelBookingBtn: { marginTop: 16, backgroundColor: '#FEF2F2', paddingVertical: 12, borderRadius: 12, alignItems: 'center', borderWidth: 1, borderColor: '#EF4444' },
// //   cancelBookingBtnText: { color: '#EF4444', fontWeight: '700', fontSize: 14 },
// //   simpleInfoLeft: { flexDirection: 'row', alignItems: 'center', gap: 8 },
// //   safetyCard: { backgroundColor: '#FFF3E7', borderRadius: 18, padding: 16, marginBottom: 14 },
// //   safetyTitle: { fontSize: 14, color: '#2457A6', fontWeight: '800' },
// //   safetySub: { marginTop: 2, fontSize: 12, color: '#2457A6', opacity: 0.9, fontWeight: '600' },
// //   bottomBar: { position: 'absolute', left: 0, right: 0, bottom: 0, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 16, paddingTop: 12, paddingBottom: Platform.OS === 'ios' ? 28 : 16, backgroundColor: 'white', borderTopWidth: 1, borderTopColor: '#ECEEF2' },
// //   bottomCaption: { fontSize: 12, color: Colors.gray, fontWeight: '500' },
// //   bottomTotal: { fontSize: 26, color: Colors.dark, fontWeight: '900', marginTop: 2 },
// //   bookNowBtn: { backgroundColor: '#FF7A00', paddingHorizontal: 24, paddingVertical: 14, borderRadius: 22, minWidth: 128, alignItems: 'center', justifyContent: 'center' },
// //   modifyBtn: { backgroundColor: '#2457A6' },
// //   bookNowBtnDisabled: { opacity: 0.7 },
// //   bookNowText: { color: 'white', fontSize: 16, fontWeight: '800' },
// //   loaderContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#fff' },
// //   modalBackdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center' },
// //   confirmModalContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
// //   confirmModalContent: { backgroundColor: 'white', borderRadius: 24, padding: 24, width: '85%', alignItems: 'center' },
// //   confirmModalHeader: { alignItems: 'center', marginBottom: 16 },
// //   confirmModalTitle: { fontSize: 20, fontWeight: '800', color: Colors.dark, marginTop: 12 },
// //   confirmModalMessage: { fontSize: 14, color: Colors.gray, textAlign: 'center', marginBottom: 24, lineHeight: 20 },
// //   confirmModalButtons: { flexDirection: 'row', gap: 12, width: '100%' },
// //   confirmModalBtn: { flex: 1, paddingVertical: 12, borderRadius: 12, alignItems: 'center' },
// //   confirmModalCancelBtn: { backgroundColor: '#F3F4F6' },
// //   confirmModalCancelBtnText: { color: Colors.dark, fontWeight: '700' },
// //   confirmModalConfirmBtn: { backgroundColor: '#EF4444' },
// //   confirmModalConfirmBtnText: { color: 'white', fontWeight: '700' },
// //   imageModalContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', width: '100%' },
// //   imageModalContent: { width: '90%', backgroundColor: Colors.white, borderRadius: 20, overflow: 'hidden', maxHeight: '80%' },
// //   imageModalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 16, borderBottomWidth: 1, borderBottomColor: '#EEF2F7' },
// //   imageModalTitle: { fontSize: 18, fontWeight: '700', color: Colors.dark },
// //   fullProfileImage: { width: '100%', height: 400, backgroundColor: '#F5F5F5' },
// //   modalSvgContainer: { width: '100%', height: 400, backgroundColor: '#F5F5F5', alignItems: 'center', justifyContent: 'center' },
// //   noImageContainer: { width: '100%', height: 400, justifyContent: 'center', alignItems: 'center', backgroundColor: '#F5F5F5' },
// //   noImageText: { fontSize: 16, color: Colors.gray },
// //   pendingHintText: { fontSize: 10, color: '#F59E0B', fontWeight: '500', marginTop: 2 },
// // });
// // import { LogBox } from 'react-native';

// // // Ignore accessibility warnings immediately
// // LogBox.ignoreLogs([
// //   'Accessibility: View',
// //   'Property accessibilityState',
// //   'RCTView',
// //   'TouchableOpacity'
// // ]);

// // import React, { useMemo, useRef, useState, useEffect, useCallback } from 'react';
// // import {
// //   View,
// //   Text,
// //   StyleSheet,
// //   TouchableOpacity,
// //   ScrollView,
// //   Platform,
// //   StatusBar,
// //   Image,
// //   Dimensions,
// //   Animated,
// //   PanResponder,
// //   Modal,
// //   ActivityIndicator,
// //   RefreshControl,
// // } from 'react-native';
// // import MapView, { Marker, Polyline, PROVIDER_GOOGLE } from 'react-native-maps';
// // import { Ionicons } from '@expo/vector-icons';
// // import LottieView from "lottie-react-native";
// // import { SvgCssUri } from 'react-native-svg/css';
// // import { Colors } from '../constants/Colors';
// // import { useAuth } from '../context/AuthContext';
// // import { API_BASE_URL } from '../config/config_ip';
// // import CustomAlert from '../components/CustomAlert';
// // import { useFocusEffect } from '@react-navigation/native';
// // import io from 'socket.io-client';

// // const { height } = Dimensions.get('window');
// // const SAFE_TOP = Platform.OS === 'ios' ? 56 : 24;
// // const COLLAPSED_HEIGHT = 84;
// // const EXPANDED_HEIGHT = height * 0.72;

// // function buildImageUrl(url) {
// //   if (!url) return null;
// //   if (url.startsWith('http://') || url.startsWith('https://')) return url;
// //   return `${API_BASE_URL}${url.startsWith('/') ? '' : '/'}${url}`;
// // }

// // function getDriverInitials(name) {
// //   if (!name) return 'D';
// //   const parts = name.trim().split(' ').filter(Boolean);
// //   if (parts.length > 1) return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
// //   return parts[0].slice(0, 2).toUpperCase();
// // }

// // function parseSuggestedPoint(point) {
// //   if (!point) return null;
// //   if (Array.isArray(point) && point.length === 2) {
// //     return { longitude: Number(point[0]), latitude: Number(point[1]) };
// //   }
// //   if (point.lng != null && point.lat != null) {
// //     return { longitude: Number(point.lng), latitude: Number(point.lat) };
// //   }
// //   if (point.longitude != null && point.latitude != null) {
// //     return { longitude: Number(point.longitude), latitude: Number(point.latitude) };
// //   }
// //   return null;
// // }

// // function parseRouteCoordinates(routeCoordinates) {
// //   if (!Array.isArray(routeCoordinates)) return [];
// //   return routeCoordinates.map((item) => {
// //     if (Array.isArray(item) && item.length === 2) {
// //       return { longitude: Number(item[0]), latitude: Number(item[1]) };
// //     }
// //     return parseSuggestedPoint(item);
// //   }).filter(Boolean);
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

// // function extractAllPreferences(ride, driverTravelPrefs) {
// //   let ridePrefs = ride?.preferences;
// //   if (ridePrefs && typeof ridePrefs === 'string') {
// //     try { ridePrefs = JSON.parse(ridePrefs); } catch (e) { ridePrefs = null; }
// //   }
// //   if (ridePrefs && typeof ridePrefs === 'object' && Object.keys(ridePrefs).length > 0) {
// //     return extractFromObject(ridePrefs);
// //   }
// //   if (driverTravelPrefs && typeof driverTravelPrefs === 'object' && Object.keys(driverTravelPrefs).length > 0) {
// //     return extractFromObject(driverTravelPrefs);
// //   }
// //   return [];
// // }

// // function extractFromObject(prefs) {
// //   const allPreferences = [];
// //   Object.entries(prefs).forEach(([key, value]) => {
// //     if (value === null || value === undefined) return;
// //     const formattedKey = key.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
// //     if (typeof value === 'boolean') {
// //       if (value === true) allPreferences.push(formattedKey);
// //     } else if (Array.isArray(value)) {
// //       if (value.length > 0) allPreferences.push(`${formattedKey}: ${value.join(', ')}`);
// //     } else if (typeof value === 'object') {
// //       allPreferences.push(...extractFromObject(value));
// //     } else if (typeof value === 'string' && value.trim()) {
// //       const lowerValue = value.toLowerCase();
// //       if (!['false', 'no', 'none', 'null', 'undefined'].includes(lowerValue)) {
// //         allPreferences.push(`${formattedKey}: ${value}`);
// //       }
// //     } else if (typeof value === 'number') {
// //       allPreferences.push(`${formattedKey}: ${value}`);
// //     }
// //   });
// //   return [...new Set(allPreferences)];
// // }

// // function GenericPreferenceTag({ label }) {
// //   if (!label || label.trim() === '') return null;
// //   let tagColor = '#FFF3E8';
// //   let textColor = '#C65D00';
// //   const lowerLabel = label.toLowerCase();
// //   if (lowerLabel.includes('age') || lowerLabel.includes('category')) {
// //     tagColor = '#E8F5E9'; textColor = '#2E7D32';
// //   } else if (lowerLabel.includes('chat') || lowerLabel.includes('talk')) {
// //     tagColor = '#E3F2FD'; textColor = '#1565C0';
// //   } else if (lowerLabel.includes('gender')) {
// //     tagColor = '#F3E5F5'; textColor = '#6A1B9A';
// //   } else if (lowerLabel.includes('language') || lowerLabel.includes('speak')) {
// //     tagColor = '#FFF9C4'; textColor = '#F57F17';
// //   } else if (lowerLabel.includes('verified')) {
// //     tagColor = '#E8F5E9'; textColor = '#2E7D32';
// //   }
// //   return (
// //     <View style={[styles.preferenceTag, { backgroundColor: tagColor }]}>
// //       <Text style={[styles.preferenceTagText, { color: textColor }]}>{label}</Text>
// //     </View>
// //   );
// // }

// // function ProfileImageModal({ visible, imageUrl, driverName, onClose }) {
// //   const [isSvg, setIsSvg] = useState(false);
// //   useEffect(() => {
// //     if (imageUrl) setIsSvg(imageUrl.toLowerCase().includes('.svg'));
// //   }, [imageUrl]);
// //   if (!visible) return null;
// //   return (
// //     <Modal visible={visible} transparent={true} animationType="fade" onRequestClose={onClose}>
// //       <TouchableOpacity style={styles.modalBackdrop} activeOpacity={1} onPress={onClose}>
// //         <View style={styles.imageModalContainer}>
// //           <View style={styles.imageModalContent}>
// //             <View style={styles.imageModalHeader}>
// //               <Text style={styles.imageModalTitle}>{driverName}</Text>
// //               <TouchableOpacity onPress={onClose}><Ionicons name="close" size={24} color={Colors.dark} /></TouchableOpacity>
// //             </View>
// //             {imageUrl && imageUrl !== 'null' && imageUrl !== 'undefined' ? (
// //               isSvg ? (
// //                 <View style={styles.modalSvgContainer}><SvgCssUri uri={imageUrl} width="100%" height={400} /></View>
// //               ) : (
// //                 <Image source={{ uri: imageUrl }} style={styles.fullProfileImage} resizeMode="contain" />
// //               )
// //             ) : (
// //               <View style={styles.noImageContainer}><Text style={styles.noImageText}>No profile picture available</Text></View>
// //             )}
// //           </View>
// //         </View>
// //       </TouchableOpacity>
// //     </Modal>
// //   );
// // }

// // export default function RideDetailScreen({ navigation, route }) {
// //   const { user, isAuthenticated } = useAuth();
// //   const { ride, searchData } = route.params || {};

// //   const [seatsRequested, setSeatsRequested] = useState(1);
// //   const [requestLoading, setRequestLoading] = useState(false);
// //   const [cancelLoading, setCancelLoading] = useState(false);
// //   const [drawerExpanded, setDrawerExpanded] = useState(true);
// //   const [driverProfile, setDriverProfile] = useState(null);
// //   const [isVerified, setIsVerified] = useState(false);
// //   const [loadingProfile, setLoadingProfile] = useState(false);
// //   const [mapReady, setMapReady] = useState(false);
// //   const [userBooking, setUserBooking] = useState(null);
// //   const [showCancelModal, setShowCancelModal] = useState(false);
  
// //   // States for seat modification
// //   const [modifyingSeats, setModifyingSeats] = useState(false);
// //   const [refreshing, setRefreshing] = useState(false);
  
// //   // State for actual seat availability
// //   const [totalRideSeats, setTotalRideSeats] = useState(4);
// //   const [otherBookedSeats, setOtherBookedSeats] = useState(0);
// //   const [rideDetails, setRideDetails] = useState(null);
  
// //   // Modification request state
// //   const [hasPendingModification, setHasPendingModification] = useState(false);
// //   const [pendingModificationDetails, setPendingModificationDetails] = useState(null);
// //   const [pendingModificationSeats, setPendingModificationSeats] = useState(null);
  
// //   // Ride status states
// //   const [rideStarted, setRideStarted] = useState(false);
// //   const [rideCancelled, setRideCancelled] = useState(false);
// //   const [rideAutoCancelled, setRideAutoCancelled] = useState(false);
// //   const [minutesToDeparture, setMinutesToDeparture] = useState(null);
// //   const [modificationsLocked, setModificationsLocked] = useState(false);
  
// //   const animatedDrawer = useRef(new Animated.Value(1)).current;
// //   const mapRef = useRef(null);
// //   const socketRef = useRef(null);
// //   const refreshInterval = useRef(null);
  
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

// //   const showCustomAlert = (title, message, type = 'success') => {
// //     let icon = "check-circle";
// //     let iconColor = "#10B981";
// //     if (type === 'error') { icon = "error"; iconColor = "#EF4444"; }
// //     else if (type === 'warning') { icon = "warning"; iconColor = "#F59E0B"; }
// //     else if (type === 'info') { icon = "info"; iconColor = Colors.primary; }
// //     setAlertConfig({ title, message, icon, iconColor, buttons: [{ text: 'OK', onPress: () => setAlertVisible(false) }] });
// //     setAlertVisible(true);
// //   };

// //   // Calculate ride status and modification lock
// //   const calculateRideStatus = useCallback(() => {
// //     if (!ride?.departure_time) return;
    
// //     const now = new Date();
// //     const departureTime = new Date(ride.departure_time);
// //     const minutesToDep = (departureTime - now) / (1000 * 60);
// //     const minutesSinceDep = (now - departureTime) / (1000 * 60);
    
// //     setMinutesToDeparture(Math.round(minutesToDep));
    
// //     // Check if modifications are locked (within 15 minutes of departure)
// //     const isLocked = minutesToDep <= 15 && minutesToDep > -30;
// //     setModificationsLocked(isLocked);
    
// //     // Check if ride is auto-cancelled (more than 30 minutes past departure without start)
// //     if (minutesSinceDep > 30 && !rideStarted && !rideCancelled) {
// //       setRideAutoCancelled(true);
// //     }
// //   }, [ride?.departure_time, rideStarted, rideCancelled]);

// //   // Check for pending modification request
// //   const checkPendingModification = useCallback(async () => {
// //     if (!userBooking?.id) return;
    
// //     try {
// //       const response = await fetch(`${API_BASE_URL}/booking/${userBooking.id}/modification-request?_t=${Date.now()}`);
// //       const data = await response.json();
      
// //       if (data.has_pending && data.request) {
// //         setHasPendingModification(true);
// //         setPendingModificationDetails(data.request);
// //         setPendingModificationSeats(data.request.requested_seats);
// //       } else {
// //         setHasPendingModification(false);
// //         setPendingModificationDetails(null);
// //         setPendingModificationSeats(null);
// //       }
// //     } catch (error) {
// //       console.log('Error checking pending modification:', error);
// //       setHasPendingModification(false);
// //     }
// //   }, [userBooking?.id]);

// //   // Fetch ride details with seat availability
// //   const fetchRideDetails = useCallback(async () => {
// //     if (!ride?.id) return;
    
// //     try {
// //       const response = await fetch(`${API_BASE_URL}/ride/${ride.id}/passengers?_t=${Date.now()}`);
// //       const data = await response.json();
      
// //       if (data) {
// //         setRideDetails(data);
// //         const totalSeats = data.available_seats || ride.totalSeats || 4;
// //         setTotalRideSeats(totalSeats);
        
// //         // Calculate other booked seats excluding current user
// //         let otherBooked = 0;
// //         if (data.passengers && Array.isArray(data.passengers)) {
// //           otherBooked = data.passengers
// //             .filter(p => p.status === 'accepted' && p.passenger_phone !== user?.phone_number)
// //             .reduce((sum, p) => sum + (p.seats_booked || 0), 0);
// //         }
// //         setOtherBookedSeats(otherBooked);
        
// //         // Check if ride has started
// //         if (data.started_at) {
// //           setRideStarted(true);
// //         }
        
// //         // Check if ride is cancelled
// //         if (data.status === 'cancelled') {
// //           setRideCancelled(true);
// //         }
// //       }
// //     } catch (error) {
// //       console.log('Error fetching ride details:', error);
// //     }
// //   }, [ride?.id, ride?.totalSeats, user?.phone_number]);

// //   // Check user booking
// //   const checkUserBooking = useCallback(async () => {
// //     if (!user?.phone_number || !ride?.id) return;
    
// //     try {
// //       const response = await fetch(`${API_BASE_URL}/my-rides/${user.phone_number}`);
// //       const data = await response.json();
      
// //       const booking = data.requested_rides?.find(
// //         b => b.ride_id === ride.id && (b.status === 'accepted' || b.status === 'pending')
// //       );
      
// //       if (booking) {
// //         setUserBooking(booking);
// //         setSeatsRequested(booking.seats_requested);
// //         console.log('📦 Found existing booking:', booking);
// //       } else {
// //         setUserBooking(null);
// //         setSeatsRequested(1);
// //       }
// //     } catch (error) {
// //       console.log('Error checking user booking:', error);
// //     }
// //   }, [user?.phone_number, ride?.id]);

// //   // Setup auto-refresh interval
// //   useEffect(() => {
// //     // Refresh every 30 seconds to update ride status
// //     refreshInterval.current = setInterval(() => {
// //       fetchRideDetails();
// //       checkUserBooking();
// //       if (userBooking?.id) {
// //         checkPendingModification();
// //       }
// //       calculateRideStatus();
// //     }, 30000);
    
// //     return () => {
// //       if (refreshInterval.current) {
// //         clearInterval(refreshInterval.current);
// //       }
// //     };
// //   }, [fetchRideDetails, checkUserBooking, checkPendingModification, calculateRideStatus, userBooking?.id]);

// //   // Setup socket listener for real-time updates
// //   const setupSocketListener = useCallback(() => {
// //     if (!ride?.id) return;
    
// //     const socket = io(API_BASE_URL);
// //     socketRef.current = socket;
    
// //     socket.on('connect', () => {
// //       console.log('Socket connected for ride updates');
// //       socket.emit('join-ride-room', ride.id);
// //       if (user?.phone_number) {
// //         socket.emit('join-user-room', user.phone_number);
// //       }
// //     });
    
// //     socket.on('booking_accepted', (data) => {
// //       console.log('✅ Booking accepted:', data);
// //       showCustomAlert(
// //         'Booking Confirmed ✅',
// //         `Your booking for ${data.seats} seat(s) has been confirmed by the driver!`,
// //         'success'
// //       );
// //       checkUserBooking();
// //       fetchRideDetails();
// //     });
    
// //     socket.on('booking_rejected', (data) => {
// //       console.log('❌ Booking rejected:', data);
// //       showCustomAlert(
// //         'Booking Declined ❌',
// //         `Your booking request was declined by the driver.`,
// //         'warning'
// //       );
// //       setUserBooking(null);
// //       setSeatsRequested(1);
// //     });
    
// //     socket.on('modification-response', (data) => {
// //       console.log('📝 Modification response:', data);
// //       if (data.status === 'approved') {
// //         showCustomAlert(
// //           'Modification Approved ✅',
// //           `Your seat change request has been approved! New seats: ${data.new_seats}`,
// //           'success'
// //         );
// //         setHasPendingModification(false);
// //         setPendingModificationDetails(null);
// //         setPendingModificationSeats(null);
// //         checkUserBooking();
// //         fetchRideDetails();
// //       } else if (data.status === 'rejected') {
// //         showCustomAlert(
// //           'Modification Rejected ❌',
// //           `Your seat change request was rejected: ${data.reason || 'Driver declined'}`,
// //           'warning'
// //         );
// //         setHasPendingModification(false);
// //         setPendingModificationDetails(null);
// //         setPendingModificationSeats(null);
// //       }
// //     });
    
// //     socket.on('ride-started', (data) => {
// //       console.log('🚗 Ride started:', data);
// //       setRideStarted(true);
// //       showCustomAlert(
// //         'Ride Started! 🚗',
// //         'The driver has started the ride. You can now track your journey live.',
// //         'info'
// //       );
// //     });
    
// //     socket.on('ride-auto-cancelled', (data) => {
// //       console.log('⚠️ Ride auto-cancelled:', data);
// //       setRideAutoCancelled(true);
// //       setUserBooking(null);
// //       showCustomAlert(
// //         'Ride Auto-Cancelled ❌',
// //         data.reason || 'The ride has been auto-cancelled as the driver did not start on time.',
// //         'error'
// //       );
// //     });
    
// //     return socket;
// //   }, [ride?.id, user?.phone_number, checkUserBooking, fetchRideDetails]);

// //   useEffect(() => {
// //     const socket = setupSocketListener();
// //     return () => {
// //       if (socket) {
// //         socket.disconnect();
// //         socketRef.current = null;
// //       }
// //     };
// //   }, [setupSocketListener]);

// //   const loadDriverData = useCallback(async () => {
// //     const driverPhone = ride?.phoneNumber;
// //     const driverUserId = ride?.driverUserId;
    
// //     if (driverPhone || driverUserId) {
// //       setLoadingProfile(true);
// //       try {
// //         const profileData = await fetchDriverProfile(driverPhone, driverUserId);
// //         if (profileData?.success && profileData.user) {
// //           setDriverProfile(profileData.user);
// //         } else {
// //           setDriverProfile(null);
// //         }
        
// //         let verified = false;
// //         if (driverPhone) {
// //           const docsData = await fetchUserDocuments(driverPhone);
// //           if (docsData?.success && docsData.documents) {
// //             const verifiedDocs = docsData.documents.filter(doc => {
// //               const status = doc.status?.toUpperCase();
// //               return status === 'APPROVED' && ['aadhar', 'dl', 'rc'].includes(doc.document_type?.toLowerCase());
// //             });
// //             verified = verifiedDocs.length > 0;
// //             setIsVerified(verified);
// //           }
// //         }
// //       } catch (error) {
// //         console.log('Error loading driver data:', error);
// //       } finally {
// //         setLoadingProfile(false);
// //       }
// //     }
// //   }, [ride?.phoneNumber, ride?.driverUserId]);

// //   // Refresh function
// //   const onRefresh = useCallback(async () => {
// //     setRefreshing(true);
// //     await Promise.all([
// //       loadDriverData(),
// //       checkUserBooking(),
// //       fetchRideDetails(),
// //       checkPendingModification(),
// //       calculateRideStatus(),
// //     ]);
// //     setRefreshing(false);
// //   }, [loadDriverData, checkUserBooking, fetchRideDetails, checkPendingModification, calculateRideStatus]);

// //   useFocusEffect(
// //     useCallback(() => {
// //       loadDriverData();
// //       checkUserBooking();
// //       fetchRideDetails();
// //       calculateRideStatus();
      
// //       return () => {
// //         if (socketRef.current) {
// //           socketRef.current.disconnect();
// //           socketRef.current = null;
// //         }
// //       };
// //     }, [loadDriverData, checkUserBooking, fetchRideDetails, calculateRideStatus])
// //   );

// //   // Check pending modification when userBooking changes
// //   useEffect(() => {
// //     if (userBooking?.id) {
// //       checkPendingModification();
// //     }
// //   }, [userBooking?.id, checkPendingModification]);

// //   useEffect(() => {
// //     if (!isAuthenticated) {
// //       showCustomAlert('Login Required', 'Please login to book rides.', 'warning');
// //       navigation.goBack();
// //     }
// //   }, [isAuthenticated, navigation]);

// //   const getProfilePhotoUrl = useCallback(() => {
// //     const rawUrl = driverProfile?.profile_picture || ride?.profilePicture;
// //     if (!rawUrl) return null;
// //     return buildImageUrl(rawUrl);
// //   }, [driverProfile, ride]);
  
// //   const profilePhotoUrl = getProfilePhotoUrl();
// //   const avatarText = getDriverInitials(driverProfile?.full_name || ride?.driverName || 'Driver');
// //   const isProfilePhotoSvg = profilePhotoUrl ? profilePhotoUrl.toLowerCase().includes('.svg') : false;
  
// //   const allPreferences = useMemo(() => {
// //     return extractAllPreferences(ride, driverProfile?.travel_preferences);
// //   }, [ride, driverProfile]);

// //   const driverStart = useMemo(() => {
// //     const coords = ride?.routeCoordinates;
// //     if (Array.isArray(coords) && coords.length > 0) {
// //       const first = coords[0];
// //       if (Array.isArray(first) && first.length === 2) return { latitude: first[1], longitude: first[0] };
// //     }
// //     return parseSuggestedPoint(ride?.suggestedPickup);
// //   }, [ride]);

// //   const driverEnd = useMemo(() => {
// //     const coords = ride?.routeCoordinates;
// //     if (Array.isArray(coords) && coords.length > 0) {
// //       const last = coords[coords.length - 1];
// //       if (Array.isArray(last) && last.length === 2) return { latitude: last[1], longitude: last[0] };
// //     }
// //     return parseSuggestedPoint(ride?.suggestedDrop);
// //   }, [ride]);

// //   const intersectionPickup = useMemo(() => parseSuggestedPoint(ride?.suggestedPickup), [ride]);
// //   const intersectionDrop = useMemo(() => parseSuggestedPoint(ride?.suggestedDrop), [ride]);

// //   const userPickup = useMemo(() => {
// //     if (!searchData?.fromCoords) return null;
// //     const c = searchData.fromCoords;
// //     if (Array.isArray(c) && c.length === 2) return { latitude: c[1], longitude: c[0] };
// //     return null;
// //   }, [searchData]);

// //   const userDrop = useMemo(() => {
// //     if (!searchData?.toCoords) return null;
// //     const c = searchData.toCoords;
// //     if (Array.isArray(c) && c.length === 2) return { latitude: c[1], longitude: c[0] };
// //     return null;
// //   }, [searchData]);

// //   const routePath = useMemo(() => {
// //     const fullRoute = parseRouteCoordinates(ride?.routeCoordinates);
// //     if (fullRoute.length >= 2) return fullRoute;
// //     if (intersectionPickup && intersectionDrop) return [intersectionPickup, intersectionDrop];
// //     return [];
// //   }, [ride, intersectionPickup, intersectionDrop]);

// //   const walkToPickupPath = useMemo(() => {
// //     if (userPickup && intersectionPickup) return [userPickup, intersectionPickup];
// //     return [];
// //   }, [userPickup, intersectionPickup]);

// //   const walkFromDropPath = useMemo(() => {
// //     if (userDrop && intersectionDrop) return [intersectionDrop, userDrop];
// //     return [];
// //   }, [userDrop, intersectionDrop]);

// //   const allMarkerCoords = useMemo(() => {
// //     const coords = [];
// //     if (driverStart) coords.push(driverStart);
// //     if (driverEnd) coords.push(driverEnd);
// //     if (userPickup) coords.push(userPickup);
// //     if (userDrop) coords.push(userDrop);
// //     if (intersectionPickup) coords.push(intersectionPickup);
// //     if (intersectionDrop) coords.push(intersectionDrop);
// //     return coords;
// //   }, [driverStart, driverEnd, userPickup, userDrop, intersectionPickup, intersectionDrop]);

// //   const fitMapToMarkers = useCallback(() => {
// //     if (mapRef.current && mapReady && allMarkerCoords.length >= 2) {
// //       setTimeout(() => {
// //         try {
// //           mapRef.current.fitToCoordinates(allMarkerCoords, {
// //             edgePadding: { top: 80, right: 50, bottom: 50, left: 50 },
// //             animated: true,
// //           });
// //         } catch (e) { console.log('fitToCoordinates error:', e); }
// //       }, 500);
// //     }
// //   }, [mapReady, allMarkerCoords]);

// //   useEffect(() => {
// //     if (mapReady && allMarkerCoords.length >= 2) fitMapToMarkers();
// //   }, [mapReady, allMarkerCoords, fitMapToMarkers]);

// //   const vehicleName = driverProfile?.vehicle 
// //     ? [driverProfile.vehicle.model].filter(Boolean).join(' ')
// //     : [ride?.vehicle?.model].filter(Boolean).join(' ') || 'Vehicle details unavailable';
  
// //   const vehicleRegNumber = driverProfile?.vehicle?.registration_number || ride?.vehicle?.registration_number || null;
// //   const vehicleColor = driverProfile?.vehicle?.color || ride?.vehicle?.color || 'Not specified';

// //   const totalPrice = Number(ride?.price || 0) * seatsRequested;

// //   const handleProfileImagePress = () => {
// //     if (profilePhotoUrl) {
// //       setSelectedProfile({ visible: true, imageUrl: profilePhotoUrl, driverName: driverProfile?.full_name || ride?.driverName || 'Driver' });
// //     } else {
// //       showCustomAlert('No Photo', 'Driver has not uploaded a profile picture', 'warning');
// //     }
// //   };

// //   const mapHeight = animatedDrawer.interpolate({ inputRange: [0, 1], outputRange: [height - SAFE_TOP - COLLAPSED_HEIGHT, height * 0.32] });
// //   const drawerHeight = animatedDrawer.interpolate({ inputRange: [0, 1], outputRange: [COLLAPSED_HEIGHT, EXPANDED_HEIGHT] });

// //   const toggleDrawer = () => {
// //     const nextExpanded = !drawerExpanded;
// //     setDrawerExpanded(nextExpanded);
// //     Animated.timing(animatedDrawer, { toValue: nextExpanded ? 1 : 0, duration: 260, useNativeDriver: false }).start();
// //   };

// //   const panResponder = useRef(PanResponder.create({
// //     onMoveShouldSetPanResponder: (_, gestureState) => Math.abs(gestureState.dy) > 5,
// //     onPanResponderMove: (_, gestureState) => {
// //       const dragRange = EXPANDED_HEIGHT - COLLAPSED_HEIGHT;
// //       const progress = drawerExpanded ? 1 - (gestureState.dy / dragRange) : gestureState.dy / dragRange;
// //       animatedDrawer.setValue(Math.max(0, Math.min(1, progress)));
// //     },
// //     onPanResponderRelease: (_, gestureState) => {
// //       const dragRange = EXPANDED_HEIGHT - COLLAPSED_HEIGHT;
// //       const threshold = dragRange * 0.2;
// //       if (drawerExpanded) {
// //         if (gestureState.dy > threshold) {
// //           setDrawerExpanded(false);
// //           Animated.timing(animatedDrawer, { toValue: 0, duration: 200, useNativeDriver: false }).start();
// //         } else {
// //           setDrawerExpanded(true);
// //           Animated.timing(animatedDrawer, { toValue: 1, duration: 200, useNativeDriver: false }).start();
// //         }
// //       } else {
// //         if (gestureState.dy < -threshold) {
// //           setDrawerExpanded(true);
// //           Animated.timing(animatedDrawer, { toValue: 1, duration: 200, useNativeDriver: false }).start();
// //         } else {
// //           setDrawerExpanded(false);
// //           Animated.timing(animatedDrawer, { toValue: 0, duration: 200, useNativeDriver: false }).start();
// //         }
// //       }
// //     },
// //   })).current;

// //   // Request seat modification (send to driver)
// //   const handleRequestModification = async (newSeatCount) => {
// //     if (!user?.phone_number || !userBooking) return;
    
// //     if (modificationsLocked) {
// //       showCustomAlert(
// //         'Modifications Locked',
// //         `Modifications are locked within 15 minutes of departure. Please contact driver directly.`,
// //         'warning'
// //       );
// //       return;
// //     }
    
// //     if (rideStarted) {
// //       showCustomAlert('Cannot Modify', 'Cannot modify seats after ride has started.', 'warning');
// //       return;
// //     }
    
// //     if (rideAutoCancelled || rideCancelled) {
// //       showCustomAlert('Ride Cancelled', 'This ride has been cancelled.', 'warning');
// //       return;
// //     }
    
// //     if (newSeatCount < 1) {
// //       showCustomAlert('Invalid Seats', 'You must book at least 1 seat.', 'warning');
// //       return;
// //     }
    
// //     const maxSeats = totalRideSeats - otherBookedSeats;
// //     if (newSeatCount > maxSeats) {
// //       showCustomAlert('Not Enough Seats', `Only ${maxSeats} seat(s) available for modification.`, 'warning');
// //       return;
// //     }
    
// //     if (newSeatCount === userBooking.seats_requested) {
// //       showCustomAlert('No Change', 'Seat count is already set to this value.', 'info');
// //       return;
// //     }
    
// //     setModifyingSeats(true);
// //     try {
// //       const response = await fetch(`${API_BASE_URL}/booking/${userBooking.id}/request-modification`, {
// //         method: 'POST',
// //         headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
// //         body: JSON.stringify({ requested_seats: newSeatCount }),
// //       });
      
// //       const data = await response.json();
      
// //       if (!response.ok) {
// //         throw new Error(data.detail || data.message || 'Failed to send modification request');
// //       }
      
// //       showCustomAlert(
// //         'Request Sent 📨',
// //         `Your request to change from ${userBooking.seats_requested} to ${newSeatCount} seat(s) has been sent to the driver.`,
// //         'info'
// //       );
      
// //       setHasPendingModification(true);
// //       setPendingModificationDetails({
// //         current_seats: userBooking.seats_requested,
// //         requested_seats: newSeatCount
// //       });
// //       setPendingModificationSeats(newSeatCount);
// //       setSeatsRequested(newSeatCount);
      
// //     } catch (error) {
// //       console.error('Modification request error:', error);
// //       showCustomAlert('Error', error.message || 'Failed to send modification request', 'error');
// //     } finally {
// //       setModifyingSeats(false);
// //     }
// //   };
  
// //   // Cancel pending modification request
// //   const handleCancelModificationRequest = async () => {
// //     if (!userBooking?.id) return;
    
// //     setModifyingSeats(true);
// //     try {
// //       const response = await fetch(`${API_BASE_URL}/booking/${userBooking.id}/cancel-modification-request`, {
// //         method: 'DELETE',
// //         headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
// //       });
      
// //       const data = await response.json();
      
// //       if (!response.ok) {
// //         throw new Error(data.detail || data.message || 'Failed to cancel modification request');
// //       }
      
// //       showCustomAlert('Request Cancelled', 'Your seat modification request has been cancelled.', 'success');
// //       setHasPendingModification(false);
// //       setPendingModificationDetails(null);
// //       setPendingModificationSeats(null);
      
// //     } catch (error) {
// //       console.error('Cancel modification error:', error);
// //       showCustomAlert('Error', error.message || 'Failed to cancel modification request', 'error');
// //     } finally {
// //       setModifyingSeats(false);
// //     }
// //   };

// //   // Cancel booking
// //   const handleCancelBooking = async () => {
// //     if (!user?.phone_number || !userBooking) return;
    
// //     if (modificationsLocked) {
// //       showCustomAlert('Cannot Cancel', 'Cancellation is locked within 15 minutes of departure.', 'warning');
// //       setShowCancelModal(false);
// //       return;
// //     }
    
// //     if (rideStarted) {
// //       showCustomAlert('Cannot Cancel', 'Cannot cancel after ride has started.', 'warning');
// //       setShowCancelModal(false);
// //       return;
// //     }

// //     setCancelLoading(true);
// //     try {
// //       const response = await fetch(`${API_BASE_URL}/booking/${userBooking.id}/cancel`, {
// //         method: 'PUT',
// //         headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
// //       });

// //       const data = await response.json();

// //       if (!response.ok) {
// //         throw new Error(data.detail || data.message || 'Failed to cancel booking');
// //       }

// //       showCustomAlert('Success', data.message || 'Booking cancelled successfully', 'success');
// //       setUserBooking(null);
// //       setSeatsRequested(1);
// //       setHasPendingModification(false);
// //       fetchRideDetails();
      
// //       setTimeout(() => navigation.goBack(), 1500);
// //     } catch (error) {
// //       console.error('Cancel booking error:', error);
// //       showCustomAlert('Error', error.message || 'Failed to cancel booking', 'error');
// //     } finally {
// //       setCancelLoading(false);
// //       setShowCancelModal(false);
// //     }
// //   };

// //   // Create new booking
// //   const handleCreateBooking = async () => {
// //     if (!user?.phone_number) {
// //       showCustomAlert('Login Required', 'Please log in to request a ride.', 'warning');
// //       return;
// //     }

// //     if (ride?.womenOnly === true && user?.gender !== 'female') {
// //       showCustomAlert('Not Available', 'This ride is for women passengers only.', 'warning');
// //       return;
// //     }

// //     const remainingSeats = totalRideSeats - otherBookedSeats;
    
// //     if (seatsRequested > remainingSeats) {
// //       showCustomAlert('Not Enough Seats', `Only ${remainingSeats} seat(s) left in this ride.`, 'warning');
// //       return;
// //     }

// //     setRequestLoading(true);
// //     try {
// //       const payload = {
// //         ride_id: ride.id,
// //         passenger_phone: user.phone_number,
// //         seats_requested: seatsRequested,
// //       };

// //       if (searchData?.fromCoords) payload.from_coords = searchData.fromCoords;
// //       if (searchData?.toCoords) payload.to_coords = searchData.toCoords;

// //       const response = await fetch(`${API_BASE_URL}/ride-bookings`, {
// //         method: 'POST',
// //         headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
// //         body: JSON.stringify(payload),
// //       });

// //       const data = await response.json();

// //       if (!response.ok) {
// //         throw new Error(data.detail || data.message || `Server error (${response.status})`);
// //       }

// //       showCustomAlert(
// //         'Request Sent 📨', 
// //         `Your request for ${seatsRequested} seat(s) has been sent to the driver. You will be notified when they respond.`,
// //         'info'
// //       );
      
// //       setTimeout(() => {
// //         checkUserBooking();
// //         fetchRideDetails();
// //       }, 1000);
      
// //     } catch (error) {
// //       console.error('Booking error:', error);
// //       showCustomAlert('Error', error.message || 'Failed to send request', 'error');
// //     } finally {
// //       setRequestLoading(false);
// //     }
// //   };

// //   // Handle seat change - either direct modify or send modification request
// //   const handleSeatChange = async () => {
// //     if (rideAutoCancelled || rideCancelled) {
// //       showCustomAlert('Ride Cancelled', 'This ride is no longer available.', 'warning');
// //       return;
// //     }
    
// //     if (rideStarted) {
// //       showCustomAlert('Cannot Modify', 'Cannot modify seats after ride has started.', 'warning');
// //       return;
// //     }
    
// //     if (userBooking) {
// //       // If booking is accepted, send modification request to driver
// //       if (userBooking.status === 'accepted') {
// //         if (hasPendingModification) {
// //           showCustomAlert(
// //             'Request Pending',
// //             `You already have a pending modification request to change to ${pendingModificationSeats} seat(s). Please wait for driver response.`,
// //             'warning'
// //           );
// //           return;
// //         }
// //         await handleRequestModification(seatsRequested);
// //       } 
// //       // If booking is pending, can modify directly
// //       else if (userBooking.status === 'pending') {
// //         await handleDirectModify(seatsRequested);
// //       }
// //     } else {
// //       await handleCreateBooking();
// //     }
// //   };
  
// //   // Direct modify for pending bookings
// //   const handleDirectModify = async (newSeatCount) => {
// //     if (!user?.phone_number || !userBooking) return;
    
// //     if (newSeatCount < 1) {
// //       showCustomAlert('Invalid Seats', 'You must book at least 1 seat.', 'warning');
// //       return;
// //     }
    
// //     const maxSeats = totalRideSeats - otherBookedSeats;
// //     if (newSeatCount > maxSeats) {
// //       showCustomAlert('Not Enough Seats', `Only ${maxSeats} seat(s) available.`, 'warning');
// //       return;
// //     }
    
// //     if (newSeatCount === userBooking.seats_requested) {
// //       showCustomAlert('No Change', 'Seat count is already set to this value.', 'info');
// //       return;
// //     }
    
// //     setModifyingSeats(true);
// //     try {
// //       const response = await fetch(`${API_BASE_URL}/booking/${userBooking.id}/modify-seats`, {
// //         method: 'PUT',
// //         headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
// //         body: JSON.stringify({ new_seats: newSeatCount }),
// //       });
      
// //       const data = await response.json();
      
// //       if (!response.ok) {
// //         throw new Error(data.detail || data.message || 'Failed to modify booking');
// //       }
      
// //       showCustomAlert(
// //         'Booking Updated ✅',
// //         `Your booking has been updated from ${userBooking.seats_requested} to ${newSeatCount} seat(s).`,
// //         'success'
// //       );
      
// //       setUserBooking({ ...userBooking, seats_requested: newSeatCount });
// //       fetchRideDetails();
      
// //     } catch (error) {
// //       console.error('Modify seats error:', error);
// //       showCustomAlert('Error', error.message || 'Failed to modify booking', 'error');
// //     } finally {
// //       setModifyingSeats(false);
// //     }
// //   };

// //   const viewDriverProfile = () => {
// //     const driverPhone = ride?.phoneNumber;
// //     const driverUserId = ride?.driverUserId;
    
// //     if (driverPhone || driverUserId) {
// //       navigation.navigate('ViewProfileScreen', {
// //         userId: driverUserId || null,
// //         phoneNumber: driverPhone || null,
// //         driverName: driverProfile?.full_name || ride?.driverName || 'Driver',
// //         profilePicture: profilePhotoUrl,
// //         vehicleNumber: vehicleRegNumber,
// //         vehicleModel: vehicleName,
// //         driverRating: driverProfile?.avg_rating || ride?.rating || 0,
// //       });
// //     } else {
// //       showCustomAlert('Profile', 'Driver profile not available', 'warning');
// //     }
// //   };

// //   const getOrCreateConversation = async (receiverPhone, rideId) => {
// //     try {
// //       const myPhone = user?.phone_number;
// //       if (!myPhone) return null;
// //       const response = await fetch(`${API_BASE_URL}/api/chat/conversations`, {
// //         method: 'POST',
// //         headers: { 'X-Phone-Number': myPhone, 'Content-Type': 'application/json' },
// //         body: JSON.stringify({ participant_phone: receiverPhone, ride_id: rideId }),
// //       });
// //       const data = await response.json();
// //       return data.success ? data.conversation.id : null;
// //     } catch (error) {
// //       console.error('getOrCreateConversation error:', error);
// //       return null;
// //     }
// //   };

// //   const startChat = async () => {
// //     const driverPhone = ride?.phoneNumber;
// //     if (driverPhone) {
// //       const conversationId = await getOrCreateConversation(driverPhone, ride.id);
// //       if (conversationId) {
// //         navigation.navigate('ChatScreen', {
// //           receiverPhone: driverPhone,
// //           conversationId,
// //           user: { name: driverProfile?.full_name || ride?.driverName || 'Driver', tripInfo: `${ride.from} → ${ride.to}` },
// //         });
// //       } else {
// //         showCustomAlert('Chat', 'Unable to start chat.', 'error');
// //       }
// //     } else {
// //       showCustomAlert('Chat', 'Driver contact not available', 'warning');
// //     }
// //   };

// //   if (requestLoading || cancelLoading || loadingProfile) {
// //     return (
// //       <View style={styles.loaderContainer}>
// //         <LottieView source={require("../assets/loading.json")} autoPlay loop style={{ width: 300, height: 300 }} />
// //       </View>
// //     );
// //   }

// //   if (!ride) {
// //     return (
// //       <View style={styles.centerContainer}>
// //         <Text style={styles.errorText}>No ride data available</Text>
// //         <TouchableOpacity onPress={() => navigation.goBack()} style={styles.fallbackBtn}>
// //           <Text style={styles.fallbackBtnText}>Go Back</Text>
// //         </TouchableOpacity>
// //       </View>
// //     );
// //   }

// //   const initialRegion = {
// //     latitude: intersectionPickup?.latitude || driverStart?.latitude || 28.6139,
// //     longitude: intersectionPickup?.longitude || driverStart?.longitude || 77.2090,
// //     latitudeDelta: 0.05,
// //     longitudeDelta: 0.05,
// //   };

// //   const isBooked = !!userBooking;
// //   const isAccepted = isBooked && userBooking.status === 'accepted';
// //   const isPending = isBooked && userBooking.status === 'pending';
  
// //   const remainingForOthers = totalRideSeats - otherBookedSeats;
// //   const maxSelectable = isBooked ? totalRideSeats : remainingForOthers;
// //   const currentBookedSeats = userBooking?.seats_requested || 0;
  
// //   const canRequestModification = isAccepted && !modificationsLocked && !rideStarted && !rideAutoCancelled && !rideCancelled && !hasPendingModification;
// //   const canCancel = (isAccepted || isPending) && !modificationsLocked && !rideStarted && !rideAutoCancelled && !rideCancelled;
  
// //   // Get warning message based on ride status
// //   const getRideStatusMessage = () => {
// //     if (rideAutoCancelled) {
// //       return { message: "This ride has been auto-cancelled as the driver did not start on time.", type: 'error', icon: 'alert-circle' };
// //     }
// //     if (rideCancelled) {
// //       return { message: "This ride has been cancelled by the driver.", type: 'error', icon: 'close-circle' };
// //     }
// //     if (rideStarted) {
// //       return { message: "Ride in progress! You can track the driver's location.", type: 'success', icon: 'car-sport' };
// //     }
// //     if (modificationsLocked && isAccepted) {
// //       return { message: `Modifications locked - Departure in ${Math.abs(minutesToDeparture)} minutes`, type: 'warning', icon: 'lock-closed' };
// //     }
// //     if (minutesToDeparture <= 0 && minutesToDeparture > -30 && !rideStarted) {
// //       return { message: `⚠️ Ride is ${Math.abs(minutesToDeparture)} minutes late. Driver must start within ${30 - Math.abs(minutesToDeparture)} minutes.`, type: 'warning', icon: 'time-outline' };
// //     }
// //     if (minutesToDeparture > 0 && minutesToDeparture <= 15) {
// //       return { message: `Ride starts in ${minutesToDeparture} minutes`, type: 'info', icon: 'time-outline' };
// //     }
// //     return null;
// //   };
  
// //   const statusMessage = getRideStatusMessage();

// //   return (
// //     <View style={styles.container}>
// //       <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />

// //       <Animated.View style={[styles.mapContainer, { height: mapHeight }]}>
// //         <MapView
// //           ref={mapRef}
// //           provider={PROVIDER_GOOGLE}
// //           style={styles.map}
// //           initialRegion={initialRegion}
// //           onMapReady={() => setMapReady(true)}
// //           showsUserLocation={false}
// //           showsMyLocationButton={false}
// //           zoomEnabled={true}
// //           zoomControlEnabled={true}
// //         >
// //           {routePath.length >= 2 && (
// //             <Polyline coordinates={routePath} strokeColor="#2457A6" strokeWidth={5} lineCap="round" lineJoin="round" />
// //           )}

// //           {driverStart && (
// //             <Marker coordinate={driverStart} anchor={{ x: 0.5, y: 1 }}>
// //               <View style={styles.markerWrapper}>
// //                 <View style={[styles.pinBubble, { backgroundColor: '#16A34A' }]}>
// //                   <Text style={styles.pinIcon}>S</Text>
// //                 </View>
// //                 <View style={[styles.pinPointer, { borderTopColor: '#16A34A' }]} />
// //               </View>
// //             </Marker>
// //           )}

// //           {driverEnd && (
// //             <Marker coordinate={driverEnd} anchor={{ x: 0.5, y: 1 }}>
// //               <View style={styles.markerWrapper}>
// //                 <View style={[styles.pinBubble, { backgroundColor: '#DC2626' }]}>
// //                   <Text style={styles.pinIcon}>E</Text>
// //                 </View>
// //                 <View style={[styles.pinPointer, { borderTopColor: '#DC2626' }]} />
// //               </View>
// //             </Marker>
// //           )}

// //           {userPickup && (
// //             <Marker coordinate={userPickup} anchor={{ x: 0.5, y: 1 }}>
// //               <View style={styles.markerWrapper}>
// //                 <View style={[styles.pinBubble, { backgroundColor: '#3B82F6' }]}>
// //                   <Ionicons name="person" size={12} color="white" />
// //                 </View>
// //                 <View style={[styles.pinPointer, { borderTopColor: '#3B82F6' }]} />
// //                 <View style={styles.pinLabelBubble}>
// //                   <Text style={styles.pinLabelText}>Your Pickup</Text>
// //                 </View>
// //               </View>
// //             </Marker>
// //           )}

// //           {userDrop && (
// //             <Marker coordinate={userDrop} anchor={{ x: 0.5, y: 1 }}>
// //               <View style={styles.markerWrapper}>
// //                 <View style={[styles.pinBubble, { backgroundColor: '#F97316' }]}>
// //                   <Ionicons name="flag" size={12} color="white" />
// //                 </View>
// //                 <View style={[styles.pinPointer, { borderTopColor: '#F97316' }]} />
// //                 <View style={styles.pinLabelBubble}>
// //                   <Text style={styles.pinLabelText}>Your Drop</Text>
// //                 </View>
// //               </View>
// //             </Marker>
// //           )}

// //           {intersectionPickup && (
// //             <Marker coordinate={intersectionPickup} anchor={{ x: 0.5, y: 1 }}>
// //               <View style={styles.markerWrapper}>
// //                 <View style={[styles.pinBubble, { backgroundColor: '#FACC15' }]}>
// //                   <Ionicons name="hand-right" size={12} color="#713F12" />
// //                 </View>
// //                 <View style={[styles.pinPointer, { borderTopColor: '#FACC15' }]} />
// //                 <View style={styles.pinLabelBubbleYellow}>
// //                   <Text style={styles.pinLabelTextYellow}>Meet Driver</Text>
// //                 </View>
// //               </View>
// //             </Marker>
// //           )}

// //           {intersectionDrop && (
// //             <Marker coordinate={intersectionDrop} anchor={{ x: 0.5, y: 1 }}>
// //               <View style={styles.markerWrapper}>
// //                 <View style={[styles.pinBubble, { backgroundColor: '#FACC15' }]}>
// //                   <Ionicons name="exit" size={12} color="#713F12" />
// //                 </View>
// //                 <View style={[styles.pinPointer, { borderTopColor: '#FACC15' }]} />
// //                 <View style={styles.pinLabelBubbleYellow}>
// //                   <Text style={styles.pinLabelTextYellow}>Exit Here</Text>
// //                 </View>
// //               </View>
// //             </Marker>
// //           )}

// //           {walkToPickupPath.length >= 2 && (
// //             <Polyline coordinates={walkToPickupPath} strokeColor="#FACC15" strokeWidth={4} strokeDasharray={[8, 6]} lineCap="round" lineJoin="round" />
// //           )}

// //           {walkFromDropPath.length >= 2 && (
// //             <Polyline coordinates={walkFromDropPath} strokeColor="#FACC15" strokeWidth={4} strokeDasharray={[8, 6]} lineCap="round" lineJoin="round" />
// //           )}
// //         </MapView>

// //         <TouchableOpacity style={styles.mapBackButton} onPress={() => navigation.goBack()}>
// //           <Ionicons name="chevron-back" size={26} color={Colors.secondary} />
// //         </TouchableOpacity>
// //       </Animated.View>

// //       <Animated.View style={[styles.drawer, { height: drawerHeight }]}>
// //         <View style={styles.handleWrap} {...panResponder.panHandlers}>
// //           <TouchableOpacity activeOpacity={0.9} onPress={toggleDrawer} style={styles.handleHitArea}>
// //             <View style={styles.handleBar} />
// //           </TouchableOpacity>
// //         </View>

// //         {!drawerExpanded ? (
// //           <View style={styles.collapsedSummary}>
// //             <View style={styles.collapsedTopRow}>
// //               <View style={{ flex: 1 }}>
// //                 <Text style={styles.collapsedDriver} numberOfLines={1}>{driverProfile?.full_name || ride?.driverName || 'Driver'}</Text>
// //                 <Text style={styles.collapsedSub} numberOfLines={1}>{ride.from} → {ride.to}</Text>
// //               </View>
// //               <View style={styles.collapsedPriceWrap}>
// //                 <Text style={styles.collapsedPrice}>₹{ride.price}</Text>
// //                 <Text style={styles.collapsedPerSeat}>per seat</Text>
// //               </View>
// //             </View>
// //           </View>
// //         ) : (
// //           <>
// //             <ScrollView 
// //               style={styles.drawerScroll} 
// //               contentContainerStyle={styles.drawerContent} 
// //               showsVerticalScrollIndicator={false}
// //               refreshControl={
// //                 <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
// //               }
// //             >
// //               {/* Ride Status Banner */}
// //               {statusMessage && (
// //                 <View style={[styles.statusBanner, { backgroundColor: statusMessage.type === 'error' ? '#FEF2F2' : statusMessage.type === 'warning' ? '#FFFBEB' : '#E8F5E9' }]}>
// //                   <Ionicons name={statusMessage.icon} size={20} color={statusMessage.type === 'error' ? '#DC2626' : statusMessage.type === 'warning' ? '#F59E0B' : '#10B981'} />
// //                   <Text style={[styles.statusBannerText, { color: statusMessage.type === 'error' ? '#DC2626' : statusMessage.type === 'warning' ? '#92400E' : '#166534', flex: 1 }]}>
// //                     {statusMessage.message}
// //                   </Text>
// //                 </View>
// //               )}
              
// //               {/* Modification Lock Warning */}
// //               {modificationsLocked && isAccepted && !rideStarted && !rideAutoCancelled && (
// //                 <View style={styles.modificationsLockedBanner}>
// //                   <Ionicons name="lock-closed" size={16} color="#DC2626" />
// //                   <Text style={styles.modificationsLockedText}>
// //                     Modifications locked - Cannot change seats within 15 minutes of departure
// //                   </Text>
// //                 </View>
// //               )}

// //               <View style={styles.driverCard}>
// //                 <View style={styles.driverTopRow}>
// //                   <View style={styles.driverLeftWrap}>
// //                     <TouchableOpacity style={styles.driverAvatar} onPress={handleProfileImagePress} activeOpacity={0.8}>
// //                       {profilePhotoUrl ? (
// //                         isProfilePhotoSvg ? (
// //                           <View style={styles.svgAvatarContainer}><SvgCssUri uri={profilePhotoUrl} width={56} height={56} /></View>
// //                         ) : (
// //                           <Image source={{ uri: profilePhotoUrl }} style={styles.avatarImg} />
// //                         )
// //                       ) : (
// //                         <Text style={styles.avatarText}>{avatarText}</Text>
// //                       )}
// //                     </TouchableOpacity>
// //                     <View style={styles.driverMeta}>
// //                       <View style={styles.driverNameRow}>
// //                         <Text style={styles.driverName}>{driverProfile?.full_name || ride?.driverName || 'Driver'}</Text>
// //                         {isVerified && (
// //                           <View style={styles.verifiedBadge}>
// //                             <Ionicons name="checkmark-circle" size={12} color="#2457A6" />
// //                             <Text style={styles.verifiedBadgeText}>Verified</Text>
// //                           </View>
// //                         )}
// //                       </View>
// //                       <View style={styles.ratingRow}>
// //                         <Ionicons name="star" size={13} color="#F59E0B" />
// //                         <Text style={styles.ratingText}>{driverProfile?.avg_rating || ride?.rating || 4.5}</Text>
// //                       </View>
// //                     </View>
// //                   </View>
// //                   <TouchableOpacity style={styles.chatButtonCircle} onPress={startChat}>
// //                     <Ionicons name="chatbubble-outline" size={20} color="#2457A6" />
// //                   </TouchableOpacity>
// //                 </View>
// //                 <Text style={styles.driverBio}>{driverProfile?.bio || driverProfile?.about || 'Friendly driver, love meeting new people!'}</Text>
// //                 <TouchableOpacity style={styles.profileOutlineBtn} onPress={viewDriverProfile}>
// //                   <Text style={styles.profileOutlineBtnText}>View Full Profile</Text>
// //                 </TouchableOpacity>
// //               </View>

// //               <View style={styles.cardSection}>
// //                 <Text style={styles.sectionTitle}>Trip Details</Text>
// //                 <View style={styles.tripTimelineWrap}>
// //                   <View style={styles.timelineRail}>
// //                     <View style={[styles.timelineDot, { backgroundColor: '#2457A6' }]} />
// //                     <View style={styles.timelineLine} />
// //                     <View style={[styles.timelineDot, { backgroundColor: '#FF7A00' }]} />
// //                   </View>
// //                   <View style={styles.timelineContent}>
// //                     <View style={styles.timelineItem}>
// //                       <Text style={styles.timelineLabel}>Pickup</Text>
// //                       <Text style={styles.timelinePlace}>{ride.pickupLabel || ride.from}</Text>
// //                       <View style={styles.timelineMetaRow}>
// //                         <Ionicons name="time-outline" size={13} color={Colors.gray} />
// //                         <Text style={styles.timelineMetaText}>{ride.date} at {ride.time}</Text>
// //                       </View>
// //                     </View>
// //                     <View style={styles.timelineItem}>
// //                       <Text style={styles.timelineLabel}>Dropoff</Text>
// //                       <Text style={styles.timelinePlace}>{ride.dropLabel || ride.to}</Text>
// //                       <Text style={styles.timelineMetaText}>Estimated: {ride.durationText || '--'}</Text>
// //                     </View>
// //                   </View>
// //                 </View>
// //               </View>

// //               <View style={styles.cardSection}>
// //                 <Text style={styles.sectionTitle}>Vehicle Details</Text>
// //                 <View style={styles.vehicleHeaderRow}>
// //                   <View style={styles.vehicleIconCircle}><Ionicons name="car-sport-outline" size={18} color="#2457A6" /></View>
// //                   <View style={styles.vehicleMeta}>
// //                     <Text style={styles.vehicleTitle}>{vehicleName}</Text>
// //                     <Text style={styles.vehicleSub}>{vehicleColor} • {totalRideSeats} seats total</Text>
// //                     {vehicleRegNumber && (
// //                       <View style={styles.vehicleRegContainer}>
// //                         <Text style={styles.vehicleRegText}>Vehicle Number: {vehicleRegNumber}</Text>
// //                       </View>
// //                     )}
// //                   </View>
// //                 </View>
// //               </View>

// //               <View style={styles.cardSection}>
// //                 <Text style={styles.sectionTitle}>Ride Preferences</Text>
// //                 <View style={styles.tagRow}>
// //                   {allPreferences.length > 0 ? (
// //                     allPreferences.map((pref, index) => <GenericPreferenceTag key={`${pref}-${index}`} label={pref} />)
// //                   ) : (
// //                     <Text style={styles.emptyText}>No specific preferences added</Text>
// //                   )}
// //                 </View>
// //               </View>

// //               <View style={styles.cardSection}>
// //                 <Text style={styles.sectionTitle}>Cost Breakdown</Text>
// //                 <View style={styles.priceRow}>
// //                   <Text style={styles.priceLabel}>Base fare (per seat)</Text>
// //                   <Text style={styles.priceValue}>₹{ride.price}</Text>
// //                 </View>
// //                 <View style={styles.priceDivider} />
// //                 <View style={styles.priceRow}>
// //                   <Text style={styles.totalLabel}>Total for {seatsRequested} seat(s)</Text>
// //                   <Text style={styles.totalValue}>₹{totalPrice}</Text>
// //                 </View>
// //                 <View style={styles.noticeBox}>
// //                   <Text style={styles.noticeText}>Cost-share contribution - sharing travel costs with the driver.</Text>
// //                 </View>
// //               </View>

// //               <View style={styles.cardSection}>
// //                 <Text style={styles.sectionTitle}>{isBooked ? 'Your Booking' : 'Select Seats'}</Text>
                
// //                 <View style={styles.seatInfoBox}>
// //                   <Text style={styles.seatInfoText}>
// //                     🚗 Total seats in vehicle: <Text style={styles.seatInfoBold}>{totalRideSeats}</Text>
// //                   </Text>
// //                   {otherBookedSeats > 0 && !isBooked && (
// //                     <Text style={styles.seatInfoText}>
// //                       👥 Other passengers booked: <Text style={styles.seatInfoBold}>{otherBookedSeats}</Text> seat(s)
// //                     </Text>
// //                   )}
// //                   {isBooked && (
// //                     <Text style={styles.seatInfoText}>
// //                       ✅ You have booked: <Text style={styles.seatInfoBold}>{currentBookedSeats}</Text> seat(s)
// //                     </Text>
// //                   )}
// //                   <Text style={styles.seatInfoText}>
// //                     📍 Seats available: <Text style={styles.seatInfoBold}>{remainingForOthers}</Text> seat(s)
// //                   </Text>
// //                 </View>
                
// //                 {/* Pending Modification Request Card */}
// //                 {hasPendingModification && pendingModificationDetails && isAccepted && (
// //                   <View style={styles.pendingModificationCard}>
// //                     <View style={styles.pendingModificationHeader}>
// //                       <Ionicons name="time-outline" size={24} color="#F59E0B" />
// //                       <Text style={styles.pendingModificationTitle}>Modification Request Pending</Text>
// //                     </View>
// //                     <Text style={styles.pendingModificationText}>
// //                       Requested to change from <Text style={styles.oldSeatCount}>{pendingModificationDetails.current_seats}</Text> 
// //                       {' → '}
// //                       <Text style={styles.newSeatCount}>{pendingModificationDetails.requested_seats}</Text> seat(s)
// //                     </Text>
// //                     <Text style={styles.pendingModificationSubtext}>
// //                       Your request has been sent to the driver. You will be notified once they respond.
// //                     </Text>
// //                     <TouchableOpacity 
// //                       style={styles.cancelRequestButton} 
// //                       onPress={handleCancelModificationRequest}
// //                       disabled={modifyingSeats}>
// //                       <Text style={styles.cancelRequestButtonText}>
// //                         {modifyingSeats ? 'Cancelling...' : 'Cancel Request'}
// //                       </Text>
// //                     </TouchableOpacity>
// //                   </View>
// //                 )}
                
// //                 {isBooked && (
// //                   <View style={[styles.currentBookingContainer, isAccepted && styles.confirmedBookingContainer]}>
// //                     {isPending ? (
// //                       <>
// //                         <Ionicons name="time-outline" size={24} color="#F59E0B" />
// //                         <Text style={styles.pendingBookingTitle}>
// //                           ⏳ Waiting for Driver Confirmation
// //                         </Text>
// //                         <Text style={styles.currentBookingText}>
// //                           You have requested {userBooking.seats_requested} seat(s) for this ride.
// //                         </Text>
// //                         <Text style={styles.currentBookingHint}>
// //                           You can modify or cancel your request anytime. The driver will notify you once confirmed.
// //                         </Text>
// //                       </>
// //                     ) : (
// //                       <>
// //                         <Ionicons name="checkmark-circle" size={24} color="#10B981" />
// //                         <Text style={styles.confirmedBookingTitle}>
// //                           ✅ Booking Confirmed!
// //                         </Text>
// //                         <Text style={styles.currentBookingText}>
// //                           You have booked {userBooking.seats_requested} seat(s) for this ride.
// //                         </Text>
// //                         <Text style={styles.currentBookingHint}>
// //                           {modificationsLocked 
// //                             ? "Modifications are locked within 15 minutes of departure." 
// //                             : "You can request a seat change anytime before the ride starts."}
// //                         </Text>
// //                       </>
// //                     )}
// //                   </View>
// //                 )}
                
// //                 {/* Seat Selector - Only show if ride is not cancelled/auto-cancelled and not started */}
// //                 {!rideStarted && !rideAutoCancelled && !rideCancelled && (
// //                   <>
// //                     <View style={styles.seatSelectorRow}>
// //                       <TouchableOpacity
// //                         style={[styles.seatActionBtn, (seatsRequested === 1 || modifyingSeats) && styles.seatActionBtnDisabled]}
// //                         onPress={() => setSeatsRequested(Math.max(1, seatsRequested - 1))}
// //                         disabled={seatsRequested === 1 || modifyingSeats}
// //                       >
// //                         <Ionicons name="remove" size={20} color={seatsRequested === 1 ? Colors.gray : Colors.dark} />
// //                       </TouchableOpacity>

// //                       <View style={styles.seatCountWrap}>
// //                         <Text style={styles.seatCountText}>{seatsRequested}</Text>
// //                         <Text style={styles.seatAvailableText}>
// //                           / {maxSelectable} {isBooked ? 'total' : 'available'}
// //                         </Text>
// //                       </View>

// //                       <TouchableOpacity
// //                         style={[styles.seatActionBtn, (seatsRequested === maxSelectable || modifyingSeats) && styles.seatActionBtnDisabled]}
// //                         onPress={() => setSeatsRequested(Math.min(maxSelectable, seatsRequested + 1))}
// //                         disabled={seatsRequested === maxSelectable || modifyingSeats}
// //                       >
// //                         <Ionicons name="add" size={20} color={seatsRequested === maxSelectable ? Colors.gray : "#2457A6"} />
// //                       </TouchableOpacity>
// //                     </View>
                    
// //                     {isAccepted && seatsRequested !== currentBookedSeats && !hasPendingModification && (
// //                       <View style={styles.priceDifferenceContainer}>
// //                         <Text style={styles.priceDifferenceText}>
// //                           {seatsRequested > currentBookedSeats 
// //                             ? `+ ₹${ride.price * (seatsRequested - currentBookedSeats)} will be charged if approved`
// //                             : `- ₹${ride.price * (currentBookedSeats - seatsRequested)} will be refunded if approved`}
// //                         </Text>
// //                         <Text style={styles.approvalNoteText}>* Changes require driver approval</Text>
// //                       </View>
// //                     )}
                    
// //                     {!isBooked && (
// //                       <View style={styles.seatInfoNote}>
// //                         <Text style={styles.seatInfoNoteText}>💡 You can modify or cancel anytime before the ride starts.</Text>
// //                       </View>
// //                     )}
// //                   </>
// //                 )}
                
// //                 {/* Cancel Booking Button */}
// //                 {canCancel && (
// //                   <TouchableOpacity 
// //                     style={styles.cancelBookingBtn} 
// //                     onPress={() => setShowCancelModal(true)} 
// //                     disabled={cancelLoading}
// //                   >
// //                     <Text style={styles.cancelBookingBtnText}>
// //                       {isPending ? 'Cancel Request' : 'Cancel Booking'}
// //                     </Text>
// //                   </TouchableOpacity>
// //                 )}
// //               </View>

// //               <View style={styles.safetyCard}>
// //                 <View style={styles.simpleInfoLeft}>
// //                   <Ionicons name="shield-checkmark-outline" size={18} color="#2457A6" />
// //                   <View>
// //                     <Text style={styles.safetyTitle}>Safety First</Text>
// //                     <Text style={styles.safetySub}>Live GPS tracking & 24/7 support</Text>
// //                   </View>
// //                 </View>
// //               </View>

// //               <View style={{ height: 110 }} />
// //             </ScrollView>

// //             {/* Bottom Action Button */}
// //             {(rideStarted || rideAutoCancelled || rideCancelled) ? null : (
// //               <View style={styles.bottomBar}>
// //                 <View>
// //                   <Text style={styles.bottomCaption}>
// //                     {isAccepted && hasPendingModification ? 'Requested total' : `Total for ${seatsRequested} seat(s)`}
// //                   </Text>
// //                   <Text style={styles.bottomTotal}>₹{totalPrice}</Text>
// //                 </View>

// //                 <TouchableOpacity
// //                   style={[
// //                     styles.bookNowBtn, 
// //                     (requestLoading || cancelLoading || modifyingSeats) && styles.bookNowBtnDisabled,
// //                     isAccepted && styles.modifyBtn,
// //                     (modificationsLocked && isAccepted) && styles.disabledBtn
// //                   ]}
// //                   onPress={handleSeatChange}
// //                   disabled={requestLoading || cancelLoading || modifyingSeats || (modificationsLocked && isAccepted) || rideStarted || rideAutoCancelled || rideCancelled}
// //                 >
// //                   <Text style={styles.bookNowText}>
// //                     {modificationsLocked && isAccepted ? 'Modifications Locked' :
// //                      isAccepted ? (hasPendingModification ? 'Request Pending' : (modifyingSeats ? 'Sending...' : 'Request Change')) :
// //                      isPending ? (modifyingSeats ? 'Updating...' : 'Update Booking') :
// //                      (requestLoading ? 'Sending Request...' : 'Request Ride')}
// //                   </Text>
// //                 </TouchableOpacity>
// //               </View>
// //             )}
// //           </>
// //         )}
// //       </Animated.View>

// //       <Modal visible={showCancelModal} transparent={true} animationType="fade" onRequestClose={() => setShowCancelModal(false)}>
// //         <View style={styles.modalBackdrop}>
// //           <View style={styles.confirmModalContainer}>
// //             <View style={styles.confirmModalContent}>
// //               <View style={styles.confirmModalHeader}>
// //                 <Ionicons name="alert-circle" size={40} color="#F59E0B" />
// //                 <Text style={styles.confirmModalTitle}>
// //                   {isPending ? 'Cancel Request?' : 'Cancel Booking?'}
// //                 </Text>
// //               </View>
// //               <Text style={styles.confirmModalMessage}>
// //                 {isPending 
// //                   ? 'Are you sure you want to cancel your ride request?'
// //                   : 'Are you sure you want to cancel your booking? This action cannot be undone.'}
// //               </Text>
// //               <View style={styles.confirmModalButtons}>
// //                 <TouchableOpacity style={[styles.confirmModalBtn, styles.confirmModalCancelBtn]} onPress={() => setShowCancelModal(false)}>
// //                   <Text style={styles.confirmModalCancelBtnText}>No, Keep</Text>
// //                 </TouchableOpacity>
// //                 <TouchableOpacity style={[styles.confirmModalBtn, styles.confirmModalConfirmBtn]} onPress={handleCancelBooking}>
// //                   <Text style={styles.confirmModalConfirmBtnText}>Yes, Cancel</Text>
// //                 </TouchableOpacity>
// //               </View>
// //             </View>
// //           </View>
// //         </View>
// //       </Modal>

// //       <ProfileImageModal visible={selectedProfile.visible} imageUrl={selectedProfile.imageUrl} driverName={selectedProfile.driverName} onClose={() => setSelectedProfile({ visible: false, imageUrl: null, driverName: '' })} />

// //       <CustomAlert visible={alertVisible} title={alertConfig.title} message={alertConfig.message} icon={alertConfig.icon} iconColor={alertConfig.iconColor} buttons={alertConfig.buttons} onBackdropPress={() => setAlertVisible(false)} />
// //     </View>
// //   );
// // }

// // const styles = StyleSheet.create({
// //   container: { flex: 1, backgroundColor: '#F4F5F7' },
// //   centerContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 24 },
// //   errorText: { fontSize: 18, color: Colors.gray, marginBottom: 16, textAlign: 'center' },
// //   fallbackBtn: { backgroundColor: Colors.primary, paddingHorizontal: 20, paddingVertical: 12, borderRadius: 12 },
// //   fallbackBtnText: { color: 'white', fontWeight: '700' },
// //   mapContainer: { width: '100%', overflow: 'hidden', backgroundColor: '#E8EEF7' },
// //   map: { flex: 1, backgroundColor: '#E8EEF7' },
// //   mapBackButton: { position: 'absolute', top: Platform.OS === 'ios' ? 54 : 22, left: 14, width: 42, height: 42, borderRadius: 25, backgroundColor: 'rgba(255,255,255,0.96)', alignItems: 'center', justifyContent: 'center' },
// //   markerWrapper: { alignItems: 'center' },
// //   pinBubble: { width: 28, height: 28, borderRadius: 14, borderWidth: 3, borderColor: 'white', alignItems: 'center', justifyContent: 'center', shadowColor: '#000', shadowOffset: { width: 0, height: 3 }, shadowOpacity: 0.25, shadowRadius: 4, elevation: 5 },
// //   pinPointer: { width: 0, height: 0, backgroundColor: 'transparent', borderStyle: 'solid', borderLeftWidth: 7, borderRightWidth: 7, borderTopWidth: 10, borderLeftColor: 'transparent', borderRightColor: 'transparent', marginTop: -2 },
// //   pinIcon: { fontSize: 14, fontWeight: '800', color: 'white', textAlign: 'center', lineHeight: 18 },
// //   pinLabelBubble: { backgroundColor: 'rgba(0,0,0,0.75)', borderRadius: 8, paddingHorizontal: 8, paddingVertical: 3, marginTop: 4 },
// //   pinLabelText: { color: 'white', fontSize: 10, fontWeight: '700' },
// //   pinLabelBubbleYellow: { backgroundColor: 'rgba(113, 63, 18, 0.9)', borderRadius: 8, paddingHorizontal: 8, paddingVertical: 3, marginTop: 4 },
// //   pinLabelTextYellow: { color: '#FACC15', fontSize: 10, fontWeight: '700' },
// //   drawer: { position: 'absolute', bottom: 0, left: 0, right: 0, backgroundColor: '#F4F5F7', borderTopLeftRadius: 28, borderTopRightRadius: 28, overflow: 'hidden' },
// //   handleWrap: { alignItems: 'center', paddingTop: 10, paddingBottom: 8, backgroundColor: '#F4F5F7' },
// //   handleHitArea: { paddingHorizontal: 40, paddingVertical: 10, alignItems: 'center', justifyContent: 'center' },
// //   handleBar: { width: 64, height: 6, borderRadius: 99, backgroundColor: '#CDD2D8' },
// //   collapsedSummary: { paddingHorizontal: 16, paddingTop: 4, paddingBottom: 12 },
// //   collapsedTopRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: 12 },
// //   collapsedDriver: { fontSize: 16, fontWeight: '800', color: Colors.dark },
// //   collapsedSub: { marginTop: 2, fontSize: 12, color: Colors.gray, fontWeight: '600' },
// //   collapsedPriceWrap: { alignItems: 'flex-end' },
// //   collapsedPrice: { fontSize: 18, fontWeight: '900', color: Colors.dark },
// //   collapsedPerSeat: { fontSize: 10, color: Colors.gray, fontWeight: '600' },
// //   drawerScroll: { flex: 1 },
// //   drawerContent: { paddingHorizontal: 16, paddingBottom: 16 },
// //   statusBanner: { flexDirection: 'row', alignItems: 'center', padding: 12, borderRadius: 12, marginBottom: 14, gap: 8 },
// //   statusBannerText: { fontSize: 13, fontWeight: '700' },
// //   modificationsLockedBanner: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#FEF2F2', padding: 12, borderRadius: 12, marginBottom: 14, gap: 8, borderWidth: 1, borderColor: '#FEE2E2' },
// //   modificationsLockedText: { fontSize: 12, color: '#DC2626', flex: 1 },
// //   driverCard: { backgroundColor: 'white', borderRadius: 20, padding: 16, marginBottom: 14, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 8, elevation: 2 },
// //   driverTopRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
// //   driverLeftWrap: { flexDirection: 'row', flex: 1, paddingRight: 10 },
// //   driverAvatar: { width: 56, height: 56, borderRadius: 28, backgroundColor: '#E5E7EB', overflow: 'hidden', alignItems: 'center', justifyContent: 'center', marginRight: 12 },
// //   avatarImg: { width: 56, height: 56, borderRadius: 28 },
// //   avatarText: { fontSize: 15, fontWeight: '800', color: Colors.gray },
// //   svgAvatarContainer: { width: 56, height: 56, borderRadius: 28, overflow: 'hidden', alignItems: 'center', justifyContent: 'center', backgroundColor: '#E5E7EB' },
// //   driverMeta: { flex: 1 },
// //   driverNameRow: { flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap', gap: 6 },
// //   driverName: { fontSize: 17, fontWeight: '800', color: Colors.dark },
// //   verifiedBadge: { flexDirection: 'row', alignItems: 'center', gap: 4 },
// //   verifiedBadgeText: { fontSize: 11, color: '#2457A6', fontWeight: '700' },
// //   ratingRow: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 6 },
// //   ratingText: { fontSize: 13, color: Colors.dark, fontWeight: '700' },
// //   chatButtonCircle: { width: 42, height: 42, borderRadius: 21, backgroundColor: '#EAF1FF', alignItems: 'center', justifyContent: 'center' },
// //   driverBio: { marginTop: 12, fontSize: 14, lineHeight: 20, color: Colors.gray },
// //   profileOutlineBtn: { marginTop: 14, borderWidth: 1, borderColor: '#2457A6', borderRadius: 16, paddingVertical: 12, alignItems: 'center' },
// //   profileOutlineBtnText: { color: '#2457A6', fontWeight: '700', fontSize: 14 },
// //   cardSection: { backgroundColor: 'white', borderRadius: 20, padding: 16, marginBottom: 14, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 8, elevation: 2 },
// //   sectionTitle: { fontSize: 16, fontWeight: '800', color: Colors.dark, marginBottom: 14 },
// //   seatInfoBox: { backgroundColor: '#F0F9FF', borderRadius: 12, padding: 12, marginBottom: 16 },
// //   seatInfoText: { fontSize: 13, color: Colors.dark, marginBottom: 4 },
// //   seatInfoBold: { fontWeight: '800', color: Colors.primary },
// //   currentBookingContainer: { backgroundColor: '#EFF6FF', borderRadius: 12, padding: 16, marginBottom: 16, alignItems: 'center' },
// //   confirmedBookingContainer: { backgroundColor: '#E8F5E9' },
// //   pendingBookingTitle: { fontSize: 16, fontWeight: '700', color: '#F59E0B', marginTop: 8, marginBottom: 4 },
// //   confirmedBookingTitle: { fontSize: 16, fontWeight: '700', color: '#10B981', marginTop: 8, marginBottom: 4 },
// //   currentBookingText: { fontSize: 14, color: Colors.dark, textAlign: 'center', marginBottom: 4 },
// //   currentBookingHint: { fontSize: 12, color: Colors.gray, textAlign: 'center' },
// //   pendingModificationCard: { backgroundColor: '#FFFBEB', borderRadius: 12, padding: 16, marginBottom: 16, borderWidth: 1, borderColor: '#FDE68A' },
// //   pendingModificationHeader: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 12 },
// //   pendingModificationTitle: { fontSize: 14, fontWeight: '700', color: '#92400E' },
// //   pendingModificationText: { fontSize: 13, color: '#B45309', marginBottom: 8, textAlign: 'center' },
// //   pendingModificationSubtext: { fontSize: 11, color: '#B45309', textAlign: 'center', marginBottom: 12 },
// //   oldSeatCount: { textDecorationLine: 'line-through', fontWeight: '700', color: '#DC2626' },
// //   newSeatCount: { fontWeight: '700', color: '#10B981' },
// //   cancelRequestButton: { backgroundColor: '#FEF2F2', paddingVertical: 10, borderRadius: 8, borderWidth: 1, borderColor: '#EF4444', alignItems: 'center' },
// //   cancelRequestButtonText: { color: '#EF4444', fontWeight: '600', fontSize: 14 },
// //   seatInfoNote: { marginTop: 12, backgroundColor: '#FEF3C7', borderRadius: 8, padding: 10 },
// //   seatInfoNoteText: { fontSize: 11, color: '#92400E', textAlign: 'center' },
// //   priceDifferenceContainer: { marginTop: 12, padding: 10, backgroundColor: '#EFF6FF', borderRadius: 8, alignItems: 'center' },
// //   priceDifferenceText: { fontSize: 12, color: '#2457A6', fontWeight: '600' },
// //   approvalNoteText: { fontSize: 10, color: '#6B7280', marginTop: 4 },
// //   tripTimelineWrap: { flexDirection: 'row' },
// //   timelineRail: { width: 18, alignItems: 'center', marginTop: 4 },
// //   timelineDot: { width: 10, height: 10, borderRadius: 5 },
// //   timelineLine: { width: 2, flex: 1, backgroundColor: '#D8DCE3', marginVertical: 6 },
// //   timelineContent: { flex: 1, paddingLeft: 8 },
// //   timelineItem: { marginBottom: 14 },
// //   timelineLabel: { fontSize: 12, color: Colors.gray, fontWeight: '700' },
// //   timelinePlace: { fontSize: 15, color: Colors.dark, fontWeight: '700', marginTop: 4 },
// //   timelineMetaRow: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 6 },
// //   timelineMetaText: { fontSize: 12, color: Colors.gray, fontWeight: '600' },
// //   vehicleHeaderRow: { flexDirection: 'row', alignItems: 'center' },
// //   vehicleIconCircle: { width: 42, height: 42, borderRadius: 21, backgroundColor: '#EAF1FF', alignItems: 'center', justifyContent: 'center', marginRight: 12 },
// //   vehicleMeta: { flex: 1 },
// //   vehicleTitle: { fontSize: 15, fontWeight: '800', color: Colors.dark },
// //   vehicleSub: { marginTop: 3, fontSize: 12, color: Colors.gray, fontWeight: '600' },
// //   vehicleRegContainer: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 6, paddingTop: 6, borderTopWidth: 1, borderTopColor: '#F0F0F0' },
// //   vehicleRegText: { fontSize: 11, color: '#6B7280', fontWeight: '500' },
// //   tagRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 14 },
// //   preferenceTag: { paddingHorizontal: 12, paddingVertical: 8, borderRadius: 999, backgroundColor: '#FFF3E8' },
// //   preferenceTagText: { fontSize: 12, color: '#C65D00', fontWeight: '700' },
// //   emptyText: { fontSize: 13, color: Colors.gray, fontWeight: '600' },
// //   priceRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
// //   priceLabel: { fontSize: 14, color: Colors.gray, fontWeight: '500' },
// //   priceValue: { fontSize: 14, color: Colors.dark, fontWeight: '700' },
// //   priceDivider: { height: 1, backgroundColor: '#ECEEF2', marginVertical: 8 },
// //   totalLabel: { fontSize: 15, color: Colors.dark, fontWeight: '800' },
// //   totalValue: { fontSize: 15, color: '#2457A6', fontWeight: '800' },
// //   noticeBox: { marginTop: 12, backgroundColor: '#FFF2E9', borderRadius: 14, padding: 12 },
// //   noticeText: { fontSize: 12.5, color: Colors.dark, lineHeight: 18 },
// //   seatSelectorRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: '#FAFAFB', borderRadius: 18, padding: 14 },
// //   seatActionBtn: { width: 38, height: 38, borderRadius: 12, borderWidth: 1, borderColor: '#D6DDE7', alignItems: 'center', justifyContent: 'center', backgroundColor: 'white' },
// //   seatActionBtnDisabled: { opacity: 0.5, backgroundColor: '#F5F5F5' },
// //   seatCountWrap: { flexDirection: 'row', alignItems: 'baseline' },
// //   seatCountText: { fontSize: 28, fontWeight: '900', color: Colors.dark },
// //   seatAvailableText: { fontSize: 13, color: Colors.gray, marginLeft: 6, fontWeight: '600' },
// //   cancelBookingBtn: { marginTop: 16, backgroundColor: '#FEF2F2', paddingVertical: 12, borderRadius: 12, alignItems: 'center', borderWidth: 1, borderColor: '#EF4444' },
// //   cancelBookingBtnText: { color: '#EF4444', fontWeight: '700', fontSize: 14 },
// //   simpleInfoLeft: { flexDirection: 'row', alignItems: 'center', gap: 8 },
// //   safetyCard: { backgroundColor: '#FFF3E7', borderRadius: 18, padding: 16, marginBottom: 14 },
// //   safetyTitle: { fontSize: 14, color: '#2457A6', fontWeight: '800' },
// //   safetySub: { marginTop: 2, fontSize: 12, color: '#2457A6', opacity: 0.9, fontWeight: '600' },
// //   bottomBar: { position: 'absolute', left: 0, right: 0, bottom: 0, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 16, paddingTop: 12, paddingBottom: Platform.OS === 'ios' ? 28 : 16, backgroundColor: 'white', borderTopWidth: 1, borderTopColor: '#ECEEF2' },
// //   bottomCaption: { fontSize: 12, color: Colors.gray, fontWeight: '500' },
// //   bottomTotal: { fontSize: 26, color: Colors.dark, fontWeight: '900', marginTop: 2 },
// //   bookNowBtn: { backgroundColor: '#FF7A00', paddingHorizontal: 24, paddingVertical: 14, borderRadius: 22, minWidth: 128, alignItems: 'center', justifyContent: 'center' },
// //   modifyBtn: { backgroundColor: '#2457A6' },
// //   disabledBtn: { backgroundColor: '#9CA3AF', opacity: 0.6 },
// //   bookNowBtnDisabled: { opacity: 0.7 },
// //   bookNowText: { color: 'white', fontSize: 16, fontWeight: '800' },
// //   loaderContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#fff' },
// //   modalBackdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center' },
// //   confirmModalContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
// //   confirmModalContent: { backgroundColor: 'white', borderRadius: 24, padding: 24, width: '85%', alignItems: 'center' },
// //   confirmModalHeader: { alignItems: 'center', marginBottom: 16 },
// //   confirmModalTitle: { fontSize: 20, fontWeight: '800', color: Colors.dark, marginTop: 12 },
// //   confirmModalMessage: { fontSize: 14, color: Colors.gray, textAlign: 'center', marginBottom: 24, lineHeight: 20 },
// //   confirmModalButtons: { flexDirection: 'row', gap: 12, width: '100%' },
// //   confirmModalBtn: { flex: 1, paddingVertical: 12, borderRadius: 12, alignItems: 'center' },
// //   confirmModalCancelBtn: { backgroundColor: '#F3F4F6' },
// //   confirmModalCancelBtnText: { color: Colors.dark, fontWeight: '700' },
// //   confirmModalConfirmBtn: { backgroundColor: '#EF4444' },
// //   confirmModalConfirmBtnText: { color: 'white', fontWeight: '700' },
// //   imageModalContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', width: '100%' },
// //   imageModalContent: { width: '90%', backgroundColor: Colors.white, borderRadius: 20, overflow: 'hidden', maxHeight: '80%' },
// //   imageModalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 16, borderBottomWidth: 1, borderBottomColor: '#EEF2F7' },
// //   imageModalTitle: { fontSize: 18, fontWeight: '700', color: Colors.dark },
// //   fullProfileImage: { width: '100%', height: 400, backgroundColor: '#F5F5F5' },
// //   modalSvgContainer: { width: '100%', height: 400, backgroundColor: '#F5F5F5', alignItems: 'center', justifyContent: 'center' },
// //   noImageContainer: { width: '100%', height: 400, justifyContent: 'center', alignItems: 'center', backgroundColor: '#F5F5F5' },
// //   noImageText: { fontSize: 16, color: Colors.gray },
// // });
// // import { LogBox } from 'react-native';

// // // Ignore accessibility warnings immediately
// // LogBox.ignoreLogs([
// //   'Accessibility: View',
// //   'Property accessibilityState',
// //   'RCTView',
// //   'TouchableOpacity'
// // ]);

// // import React, { useMemo, useRef, useState, useEffect, useCallback } from 'react';
// // import {
// //   View,
// //   Text,
// //   StyleSheet,
// //   TouchableOpacity,
// //   ScrollView,
// //   Platform,
// //   StatusBar,
// //   Image,
// //   Dimensions,
// //   Animated,
// //   PanResponder,
// //   Modal,
// //   ActivityIndicator,
// //   RefreshControl,
// // } from 'react-native';
// // import MapView, { Marker, Polyline, PROVIDER_GOOGLE } from 'react-native-maps';
// // import { Ionicons } from '@expo/vector-icons';
// // import LottieView from "lottie-react-native";
// // import { SvgCssUri } from 'react-native-svg/css';
// // import { Colors } from '../constants/Colors';
// // import { useAuth } from '../context/AuthContext';
// // import { API_BASE_URL } from '../config/config_ip';
// // import CustomAlert from '../components/CustomAlert';
// // import { useFocusEffect } from '@react-navigation/native';
// // import io from 'socket.io-client';
// // import axios from 'axios';

// // const { height } = Dimensions.get('window');
// // const SAFE_TOP = Platform.OS === 'ios' ? 56 : 24;
// // const COLLAPSED_HEIGHT = 84;
// // const EXPANDED_HEIGHT = height * 0.72;

// // function buildImageUrl(url) {
// //   if (!url) return null;
// //   if (url.startsWith('http://') || url.startsWith('https://')) return url;
// //   return `${API_BASE_URL}${url.startsWith('/') ? '' : '/'}${url}`;
// // }

// // function getDriverInitials(name) {
// //   if (!name) return 'D';
// //   const parts = name.trim().split(' ').filter(Boolean);
// //   if (parts.length > 1) return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
// //   return parts[0].slice(0, 2).toUpperCase();
// // }

// // function parseSuggestedPoint(point) {
// //   if (!point) return null;
// //   if (Array.isArray(point) && point.length === 2) {
// //     return { longitude: Number(point[0]), latitude: Number(point[1]) };
// //   }
// //   if (point.lng != null && point.lat != null) {
// //     return { longitude: Number(point.lng), latitude: Number(point.lat) };
// //   }
// //   if (point.longitude != null && point.latitude != null) {
// //     return { longitude: Number(point.longitude), latitude: Number(point.latitude) };
// //   }
// //   return null;
// // }

// // function parseRouteCoordinates(routeCoordinates) {
// //   if (!Array.isArray(routeCoordinates)) return [];
// //   return routeCoordinates.map((item) => {
// //     if (Array.isArray(item) && item.length === 2) {
// //       return { longitude: Number(item[0]), latitude: Number(item[1]) };
// //     }
// //     return parseSuggestedPoint(item);
// //   }).filter(Boolean);
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

// // function extractAllPreferences(ride, driverTravelPrefs) {
// //   let ridePrefs = ride?.preferences;
// //   if (ridePrefs && typeof ridePrefs === 'string') {
// //     try { ridePrefs = JSON.parse(ridePrefs); } catch (e) { ridePrefs = null; }
// //   }
// //   if (ridePrefs && typeof ridePrefs === 'object' && Object.keys(ridePrefs).length > 0) {
// //     return extractFromObject(ridePrefs);
// //   }
// //   if (driverTravelPrefs && typeof driverTravelPrefs === 'object' && Object.keys(driverTravelPrefs).length > 0) {
// //     return extractFromObject(driverTravelPrefs);
// //   }
// //   return [];
// // }

// // function extractFromObject(prefs) {
// //   const allPreferences = [];
// //   Object.entries(prefs).forEach(([key, value]) => {
// //     if (value === null || value === undefined) return;
// //     const formattedKey = key.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
// //     if (typeof value === 'boolean') {
// //       if (value === true) allPreferences.push(formattedKey);
// //     } else if (Array.isArray(value)) {
// //       if (value.length > 0) allPreferences.push(`${formattedKey}: ${value.join(', ')}`);
// //     } else if (typeof value === 'object') {
// //       allPreferences.push(...extractFromObject(value));
// //     } else if (typeof value === 'string' && value.trim()) {
// //       const lowerValue = value.toLowerCase();
// //       if (!['false', 'no', 'none', 'null', 'undefined'].includes(lowerValue)) {
// //         allPreferences.push(`${formattedKey}: ${value}`);
// //       }
// //     } else if (typeof value === 'number') {
// //       allPreferences.push(`${formattedKey}: ${value}`);
// //     }
// //   });
// //   return [...new Set(allPreferences)];
// // }

// // function GenericPreferenceTag({ label }) {
// //   if (!label || label.trim() === '') return null;
// //   let tagColor = '#FFF3E8';
// //   let textColor = '#C65D00';
// //   const lowerLabel = label.toLowerCase();
// //   if (lowerLabel.includes('age') || lowerLabel.includes('category')) {
// //     tagColor = '#E8F5E9'; textColor = '#2E7D32';
// //   } else if (lowerLabel.includes('chat') || lowerLabel.includes('talk')) {
// //     tagColor = '#E3F2FD'; textColor = '#1565C0';
// //   } else if (lowerLabel.includes('gender')) {
// //     tagColor = '#F3E5F5'; textColor = '#6A1B9A';
// //   } else if (lowerLabel.includes('language') || lowerLabel.includes('speak')) {
// //     tagColor = '#FFF9C4'; textColor = '#F57F17';
// //   } else if (lowerLabel.includes('verified')) {
// //     tagColor = '#E8F5E9'; textColor = '#2E7D32';
// //   }
// //   return (
// //     <View style={[styles.preferenceTag, { backgroundColor: tagColor }]}>
// //       <Text style={[styles.preferenceTagText, { color: textColor }]}>{label}</Text>
// //     </View>
// //   );
// // }

// // function ProfileImageModal({ visible, imageUrl, driverName, onClose }) {
// //   const [isSvg, setIsSvg] = useState(false);
// //   useEffect(() => {
// //     if (imageUrl) setIsSvg(imageUrl.toLowerCase().includes('.svg'));
// //   }, [imageUrl]);
// //   if (!visible) return null;
// //   return (
// //     <Modal visible={visible} transparent={true} animationType="fade" onRequestClose={onClose}>
// //       <TouchableOpacity style={styles.modalBackdrop} activeOpacity={1} onPress={onClose}>
// //         <View style={styles.imageModalContainer}>
// //           <View style={styles.imageModalContent}>
// //             <View style={styles.imageModalHeader}>
// //               <Text style={styles.imageModalTitle}>{driverName}</Text>
// //               <TouchableOpacity onPress={onClose}><Ionicons name="close" size={24} color={Colors.dark} /></TouchableOpacity>
// //             </View>
// //             {imageUrl && imageUrl !== 'null' && imageUrl !== 'undefined' ? (
// //               isSvg ? (
// //                 <View style={styles.modalSvgContainer}><SvgCssUri uri={imageUrl} width="100%" height={400} /></View>
// //               ) : (
// //                 <Image source={{ uri: imageUrl }} style={styles.fullProfileImage} resizeMode="contain" />
// //               )
// //             ) : (
// //               <View style={styles.noImageContainer}><Text style={styles.noImageText}>No profile picture available</Text></View>
// //             )}
// //           </View>
// //         </View>
// //       </TouchableOpacity>
// //     </Modal>
// //   );
// // }

// // export default function RideDetailScreen({ navigation, route }) {
// //   const { user, isAuthenticated } = useAuth();
// //   const { ride, searchData } = route.params || {};

// //   const [seatsRequested, setSeatsRequested] = useState(1);
// //   const [requestLoading, setRequestLoading] = useState(false);
// //   const [cancelLoading, setCancelLoading] = useState(false);
// //   const [drawerExpanded, setDrawerExpanded] = useState(true);
// //   const [driverProfile, setDriverProfile] = useState(null);
// //   const [isVerified, setIsVerified] = useState(false);
// //   const [loadingProfile, setLoadingProfile] = useState(false);
// //   const [mapReady, setMapReady] = useState(false);
// //   const [userBooking, setUserBooking] = useState(null);
// //   const [showCancelModal, setShowCancelModal] = useState(false);
  
// //   // States for seat modification
// //   const [modifyingSeats, setModifyingSeats] = useState(false);
// //   const [refreshing, setRefreshing] = useState(false);
  
// //   // State for actual seat availability
// //   const [totalRideSeats, setTotalRideSeats] = useState(ride?.totalSeats || ride?.available_seats || 4);
// //   const [otherBookedSeats, setOtherBookedSeats] = useState(0);
// //   const [rideDetails, setRideDetails] = useState(null);
  
// //   // Modification request state
// //   const [hasPendingModification, setHasPendingModification] = useState(false);
// //   const [pendingModificationDetails, setPendingModificationDetails] = useState(null);
// //   const [pendingModificationSeats, setPendingModificationSeats] = useState(null);
  
// //   // Ride status states
// //   const [rideStarted, setRideStarted] = useState(ride?.started_at || false);
// //   const [rideCancelled, setRideCancelled] = useState(ride?.cancellation_reason ? true : false);
// //   const [rideAutoCancelled, setRideAutoCancelled] = useState(false);
// //   const [minutesToDeparture, setMinutesToDeparture] = useState(null);
// //   const [modificationsLocked, setModificationsLocked] = useState(false);
  
// //   const animatedDrawer = useRef(new Animated.Value(1)).current;
// //   const mapRef = useRef(null);
// //   const socketRef = useRef(null);
// //   const refreshInterval = useRef(null);
  
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

// //   const showCustomAlert = (title, message, type = 'success') => {
// //     let icon = "check-circle";
// //     let iconColor = "#10B981";
// //     if (type === 'error') { icon = "error"; iconColor = "#EF4444"; }
// //     else if (type === 'warning') { icon = "warning"; iconColor = "#F59E0B"; }
// //     else if (type === 'info') { icon = "info"; iconColor = Colors.primary; }
// //     setAlertConfig({ title, message, icon, iconColor, buttons: [{ text: 'OK', onPress: () => setAlertVisible(false) }] });
// //     setAlertVisible(true);
// //   };

// //   // Calculate ride status and modification lock
// //   const calculateRideStatus = useCallback(() => {
// //     if (!ride?.departure_time) return;
    
// //     const now = new Date();
// //     const departureTime = new Date(ride.departure_time);
// //     const minutesToDep = (departureTime - now) / (1000 * 60);
// //     const minutesSinceDep = (now - departureTime) / (1000 * 60);
    
// //     setMinutesToDeparture(Math.round(minutesToDep));
    
// //     // Check if modifications are locked (within 15 minutes of departure)
// //     const isLocked = minutesToDep <= 15 && minutesToDep > -30;
// //     setModificationsLocked(isLocked);
    
// //     // Check if ride is auto-cancelled (more than 30 minutes past departure without start)
// //     if (minutesSinceDep > 30 && !rideStarted && !rideCancelled) {
// //       setRideAutoCancelled(true);
// //     }
// //   }, [ride?.departure_time, rideStarted, rideCancelled]);

// //   // Check for pending modification request
// //   const checkPendingModification = useCallback(async () => {
// //     if (!userBooking?.id) return;
    
// //     try {
// //       const response = await axios.get(`${API_BASE_URL}/booking/${userBooking.id}/modification-request?_t=${Date.now()}`);
      
// //       if (response.data && response.data.has_pending && response.data.request) {
// //         setHasPendingModification(true);
// //         setPendingModificationDetails(response.data.request);
// //         setPendingModificationSeats(response.data.request.requested_seats);
// //       } else {
// //         setHasPendingModification(false);
// //         setPendingModificationDetails(null);
// //         setPendingModificationSeats(null);
// //       }
// //     } catch (error) {
// //       console.log('Error checking pending modification:', error);
// //       setHasPendingModification(false);
// //     }
// //   }, [userBooking?.id]);

// //   // Fetch ride details with seat availability
// //   const fetchRideDetails = useCallback(async () => {
// //     if (!ride?.id) return;
    
// //     try {
// //       const response = await axios.get(`${API_BASE_URL}/ride/${ride.id}/passengers?_t=${Date.now()}`);
      
// //       if (response.data) {
// //         setRideDetails(response.data);
// //         const totalSeats = response.data.available_seats || ride.totalSeats || ride.available_seats || 4;
// //         setTotalRideSeats(totalSeats);
        
// //         // Calculate other booked seats excluding current user
// //         let otherBooked = 0;
// //         if (response.data.passengers && Array.isArray(response.data.passengers)) {
// //           otherBooked = response.data.passengers
// //             .filter(p => p.status === 'accepted' && p.passenger_phone !== user?.phone_number)
// //             .reduce((sum, p) => sum + (p.seats_booked || 0), 0);
// //         }
// //         setOtherBookedSeats(otherBooked);
        
// //         // Check if ride has started
// //         if (response.data.started_at) {
// //           setRideStarted(true);
// //         }
        
// //         // Check if ride is cancelled
// //         if (response.data.status === 'cancelled') {
// //           setRideCancelled(true);
// //         }
// //       }
// //     } catch (error) {
// //       console.log('Error fetching ride details:', error);
// //     }
// //   }, [ride?.id, ride?.totalSeats, ride?.available_seats, user?.phone_number]);

// //   // Check user booking using axios
// //   const checkUserBooking = useCallback(async () => {
// //     if (!user?.phone_number || !ride?.id) return;
    
// //     try {
// //       const response = await axios.get(`${API_BASE_URL}/my-rides/${user.phone_number}`);
      
// //       if (response.data && response.data.requested_rides) {
// //         const booking = response.data.requested_rides.find(
// //           b => b.ride_id === ride.id && (b.status === 'accepted' || b.status === 'pending')
// //         );
        
// //         if (booking) {
// //           setUserBooking(booking);
// //           setSeatsRequested(booking.seats_requested);
// //           console.log('📦 Found existing booking:', booking);
// //         } else {
// //           setUserBooking(null);
// //           setSeatsRequested(1);
// //         }
// //       }
// //     } catch (error) {
// //       console.log('Error checking user booking:', error);
// //     }
// //   }, [user?.phone_number, ride?.id]);

// //   // Setup auto-refresh interval
// //   useEffect(() => {
// //     // Refresh every 30 seconds to update ride status
// //     refreshInterval.current = setInterval(() => {
// //       fetchRideDetails();
// //       checkUserBooking();
// //       if (userBooking?.id) {
// //         checkPendingModification();
// //       }
// //       calculateRideStatus();
// //     }, 30000);
    
// //     return () => {
// //       if (refreshInterval.current) {
// //         clearInterval(refreshInterval.current);
// //       }
// //     };
// //   }, [fetchRideDetails, checkUserBooking, checkPendingModification, calculateRideStatus, userBooking?.id]);

// //   // Setup socket listener for real-time updates
// //   const setupSocketListener = useCallback(() => {
// //     if (!ride?.id) return;
    
// //     const socket = io(API_BASE_URL, {
// //       transports: ['websocket'],
// //       reconnection: true,
// //     });
// //     socketRef.current = socket;
    
// //     socket.on('connect', () => {
// //       console.log('Socket connected for ride updates');
// //       socket.emit('join-ride-room', ride.id);
// //       if (user?.phone_number) {
// //         socket.emit('join-user-room', user.phone_number);
// //       }
// //     });
    
// //     socket.on('booking_accepted', (data) => {
// //       console.log('✅ Booking accepted:', data);
// //       showCustomAlert(
// //         'Booking Confirmed ✅',
// //         `Your booking for ${data.seats} seat(s) has been confirmed by the driver!`,
// //         'success'
// //       );
// //       checkUserBooking();
// //       fetchRideDetails();
// //     });
    
// //     socket.on('booking_rejected', (data) => {
// //       console.log('❌ Booking rejected:', data);
// //       showCustomAlert(
// //         'Booking Declined ❌',
// //         `Your booking request was declined by the driver.`,
// //         'warning'
// //       );
// //       setUserBooking(null);
// //       setSeatsRequested(1);
// //     });
    
// //     socket.on('modification-response', (data) => {
// //       console.log('📝 Modification response:', data);
// //       if (data.status === 'approved') {
// //         showCustomAlert(
// //           'Modification Approved ✅',
// //           `Your seat change request has been approved! New seats: ${data.new_seats}`,
// //           'success'
// //         );
// //         setHasPendingModification(false);
// //         setPendingModificationDetails(null);
// //         setPendingModificationSeats(null);
// //         checkUserBooking();
// //         fetchRideDetails();
// //       } else if (data.status === 'rejected') {
// //         showCustomAlert(
// //           'Modification Rejected ❌',
// //           `Your seat change request was rejected: ${data.reason || 'Driver declined'}`,
// //           'warning'
// //         );
// //         setHasPendingModification(false);
// //         setPendingModificationDetails(null);
// //         setPendingModificationSeats(null);
// //       }
// //     });
    
// //     socket.on('ride-started', (data) => {
// //       console.log('🚗 Ride started:', data);
// //       setRideStarted(true);
// //       showCustomAlert(
// //         'Ride Started! 🚗',
// //         'The driver has started the ride. You can now track your journey live.',
// //         'info'
// //       );
// //     });
    
// //     socket.on('ride-auto-cancelled', (data) => {
// //       console.log('⚠️ Ride auto-cancelled:', data);
// //       setRideAutoCancelled(true);
// //       setUserBooking(null);
// //       showCustomAlert(
// //         'Ride Auto-Cancelled ❌',
// //         data.reason || 'The ride has been auto-cancelled as the driver did not start on time.',
// //         'error'
// //       );
// //     });
    
// //     return socket;
// //   }, [ride?.id, user?.phone_number, checkUserBooking, fetchRideDetails]);

// //   useEffect(() => {
// //     const socket = setupSocketListener();
// //     return () => {
// //       if (socket) {
// //         socket.disconnect();
// //         socketRef.current = null;
// //       }
// //     };
// //   }, [setupSocketListener]);

// //   const loadDriverData = useCallback(async () => {
// //     const driverPhone = ride?.phoneNumber;
// //     const driverUserId = ride?.driverUserId;
    
// //     if (driverPhone || driverUserId) {
// //       setLoadingProfile(true);
// //       try {
// //         const profileData = await fetchDriverProfile(driverPhone, driverUserId);
// //         if (profileData?.success && profileData.user) {
// //           setDriverProfile(profileData.user);
// //         } else {
// //           setDriverProfile(null);
// //         }
        
// //         let verified = false;
// //         if (driverPhone) {
// //           const docsData = await fetchUserDocuments(driverPhone);
// //           if (docsData?.success && docsData.documents) {
// //             const verifiedDocs = docsData.documents.filter(doc => {
// //               const status = doc.status?.toUpperCase();
// //               return status === 'APPROVED' && ['aadhar', 'dl', 'rc'].includes(doc.document_type?.toLowerCase());
// //             });
// //             verified = verifiedDocs.length > 0;
// //             setIsVerified(verified);
// //           }
// //         }
// //       } catch (error) {
// //         console.log('Error loading driver data:', error);
// //       } finally {
// //         setLoadingProfile(false);
// //       }
// //     }
// //   }, [ride?.phoneNumber, ride?.driverUserId]);

// //   // Refresh function
// //   const onRefresh = useCallback(async () => {
// //     setRefreshing(true);
// //     await Promise.all([
// //       loadDriverData(),
// //       checkUserBooking(),
// //       fetchRideDetails(),
// //       checkPendingModification(),
// //       calculateRideStatus(),
// //     ]);
// //     setRefreshing(false);
// //   }, [loadDriverData, checkUserBooking, fetchRideDetails, checkPendingModification, calculateRideStatus]);

// //   useFocusEffect(
// //     useCallback(() => {
// //       loadDriverData();
// //       checkUserBooking();
// //       fetchRideDetails();
// //       calculateRideStatus();
      
// //       return () => {
// //         if (socketRef.current) {
// //           socketRef.current.disconnect();
// //           socketRef.current = null;
// //         }
// //       };
// //     }, [loadDriverData, checkUserBooking, fetchRideDetails, calculateRideStatus])
// //   );

// //   // Check pending modification when userBooking changes
// //   useEffect(() => {
// //     if (userBooking?.id) {
// //       checkPendingModification();
// //     }
// //   }, [userBooking?.id, checkPendingModification]);

// //   useEffect(() => {
// //     if (!isAuthenticated) {
// //       showCustomAlert('Login Required', 'Please login to book rides.', 'warning');
// //       navigation.goBack();
// //     }
// //   }, [isAuthenticated, navigation]);

// //   const getProfilePhotoUrl = useCallback(() => {
// //     const rawUrl = driverProfile?.profile_picture || ride?.profilePicture;
// //     if (!rawUrl) return null;
// //     return buildImageUrl(rawUrl);
// //   }, [driverProfile, ride]);
  
// //   const profilePhotoUrl = getProfilePhotoUrl();
// //   const avatarText = getDriverInitials(driverProfile?.full_name || ride?.driverName || 'Driver');
// //   const isProfilePhotoSvg = profilePhotoUrl ? profilePhotoUrl.toLowerCase().includes('.svg') : false;
  
// //   const allPreferences = useMemo(() => {
// //     return extractAllPreferences(ride, driverProfile?.travel_preferences);
// //   }, [ride, driverProfile]);

// //   const driverStart = useMemo(() => {
// //     const coords = ride?.routeCoordinates;
// //     if (Array.isArray(coords) && coords.length > 0) {
// //       const first = coords[0];
// //       if (Array.isArray(first) && first.length === 2) return { latitude: first[1], longitude: first[0] };
// //     }
// //     return parseSuggestedPoint(ride?.suggestedPickup);
// //   }, [ride]);

// //   const driverEnd = useMemo(() => {
// //     const coords = ride?.routeCoordinates;
// //     if (Array.isArray(coords) && coords.length > 0) {
// //       const last = coords[coords.length - 1];
// //       if (Array.isArray(last) && last.length === 2) return { latitude: last[1], longitude: last[0] };
// //     }
// //     return parseSuggestedPoint(ride?.suggestedDrop);
// //   }, [ride]);

// //   const intersectionPickup = useMemo(() => parseSuggestedPoint(ride?.suggestedPickup), [ride]);
// //   const intersectionDrop = useMemo(() => parseSuggestedPoint(ride?.suggestedDrop), [ride]);

// //   const userPickup = useMemo(() => {
// //     if (!searchData?.fromCoords) return null;
// //     const c = searchData.fromCoords;
// //     if (Array.isArray(c) && c.length === 2) return { latitude: c[1], longitude: c[0] };
// //     return null;
// //   }, [searchData]);

// //   const userDrop = useMemo(() => {
// //     if (!searchData?.toCoords) return null;
// //     const c = searchData.toCoords;
// //     if (Array.isArray(c) && c.length === 2) return { latitude: c[1], longitude: c[0] };
// //     return null;
// //   }, [searchData]);

// //   const routePath = useMemo(() => {
// //     const fullRoute = parseRouteCoordinates(ride?.routeCoordinates);
// //     if (fullRoute.length >= 2) return fullRoute;
// //     if (intersectionPickup && intersectionDrop) return [intersectionPickup, intersectionDrop];
// //     return [];
// //   }, [ride, intersectionPickup, intersectionDrop]);

// //   const walkToPickupPath = useMemo(() => {
// //     if (userPickup && intersectionPickup) return [userPickup, intersectionPickup];
// //     return [];
// //   }, [userPickup, intersectionPickup]);

// //   const walkFromDropPath = useMemo(() => {
// //     if (userDrop && intersectionDrop) return [intersectionDrop, userDrop];
// //     return [];
// //   }, [userDrop, intersectionDrop]);

// //   const allMarkerCoords = useMemo(() => {
// //     const coords = [];
// //     if (driverStart) coords.push(driverStart);
// //     if (driverEnd) coords.push(driverEnd);
// //     if (userPickup) coords.push(userPickup);
// //     if (userDrop) coords.push(userDrop);
// //     if (intersectionPickup) coords.push(intersectionPickup);
// //     if (intersectionDrop) coords.push(intersectionDrop);
// //     return coords;
// //   }, [driverStart, driverEnd, userPickup, userDrop, intersectionPickup, intersectionDrop]);

// //   const fitMapToMarkers = useCallback(() => {
// //     if (mapRef.current && mapReady && allMarkerCoords.length >= 2) {
// //       setTimeout(() => {
// //         try {
// //           mapRef.current.fitToCoordinates(allMarkerCoords, {
// //             edgePadding: { top: 80, right: 50, bottom: 50, left: 50 },
// //             animated: true,
// //           });
// //         } catch (e) { console.log('fitToCoordinates error:', e); }
// //       }, 500);
// //     }
// //   }, [mapReady, allMarkerCoords]);

// //   useEffect(() => {
// //     if (mapReady && allMarkerCoords.length >= 2) fitMapToMarkers();
// //   }, [mapReady, allMarkerCoords, fitMapToMarkers]);

// //   const vehicleName = driverProfile?.vehicle 
// //     ? [driverProfile.vehicle.model].filter(Boolean).join(' ')
// //     : [ride?.vehicle?.model].filter(Boolean).join(' ') || 'Vehicle details unavailable';
  
// //   const vehicleRegNumber = driverProfile?.vehicle?.registration_number || ride?.vehicle?.registration_number || null;
// //   const vehicleColor = driverProfile?.vehicle?.color || ride?.vehicle?.color || 'Not specified';

// //   const totalPrice = Number(ride?.price || 0) * seatsRequested;

// //   const handleProfileImagePress = () => {
// //     if (profilePhotoUrl) {
// //       setSelectedProfile({ visible: true, imageUrl: profilePhotoUrl, driverName: driverProfile?.full_name || ride?.driverName || 'Driver' });
// //     } else {
// //       showCustomAlert('No Photo', 'Driver has not uploaded a profile picture', 'warning');
// //     }
// //   };

// //   const mapHeight = animatedDrawer.interpolate({ inputRange: [0, 1], outputRange: [height - SAFE_TOP - COLLAPSED_HEIGHT, height * 0.32] });
// //   const drawerHeight = animatedDrawer.interpolate({ inputRange: [0, 1], outputRange: [COLLAPSED_HEIGHT, EXPANDED_HEIGHT] });

// //   const toggleDrawer = () => {
// //     const nextExpanded = !drawerExpanded;
// //     setDrawerExpanded(nextExpanded);
// //     Animated.timing(animatedDrawer, { toValue: nextExpanded ? 1 : 0, duration: 260, useNativeDriver: false }).start();
// //   };

// //   const panResponder = useRef(PanResponder.create({
// //     onMoveShouldSetPanResponder: (_, gestureState) => Math.abs(gestureState.dy) > 5,
// //     onPanResponderMove: (_, gestureState) => {
// //       const dragRange = EXPANDED_HEIGHT - COLLAPSED_HEIGHT;
// //       const progress = drawerExpanded ? 1 - (gestureState.dy / dragRange) : gestureState.dy / dragRange;
// //       animatedDrawer.setValue(Math.max(0, Math.min(1, progress)));
// //     },
// //     onPanResponderRelease: (_, gestureState) => {
// //       const dragRange = EXPANDED_HEIGHT - COLLAPSED_HEIGHT;
// //       const threshold = dragRange * 0.2;
// //       if (drawerExpanded) {
// //         if (gestureState.dy > threshold) {
// //           setDrawerExpanded(false);
// //           Animated.timing(animatedDrawer, { toValue: 0, duration: 200, useNativeDriver: false }).start();
// //         } else {
// //           setDrawerExpanded(true);
// //           Animated.timing(animatedDrawer, { toValue: 1, duration: 200, useNativeDriver: false }).start();
// //         }
// //       } else {
// //         if (gestureState.dy < -threshold) {
// //           setDrawerExpanded(true);
// //           Animated.timing(animatedDrawer, { toValue: 1, duration: 200, useNativeDriver: false }).start();
// //         } else {
// //           setDrawerExpanded(false);
// //           Animated.timing(animatedDrawer, { toValue: 0, duration: 200, useNativeDriver: false }).start();
// //         }
// //       }
// //     },
// //   })).current;

// //   // Request seat modification (send to driver)
// //   const handleRequestModification = async (newSeatCount) => {
// //     if (!user?.phone_number || !userBooking) return;
    
// //     if (modificationsLocked) {
// //       showCustomAlert(
// //         'Modifications Locked',
// //         `Modifications are locked within 15 minutes of departure. Please contact driver directly.`,
// //         'warning'
// //       );
// //       return;
// //     }
    
// //     if (rideStarted) {
// //       showCustomAlert('Cannot Modify', 'Cannot modify seats after ride has started.', 'warning');
// //       return;
// //     }
    
// //     if (rideAutoCancelled || rideCancelled) {
// //       showCustomAlert('Ride Cancelled', 'This ride has been cancelled.', 'warning');
// //       return;
// //     }
    
// //     if (newSeatCount < 1) {
// //       showCustomAlert('Invalid Seats', 'You must book at least 1 seat.', 'warning');
// //       return;
// //     }
    
// //     const maxSeats = totalRideSeats - otherBookedSeats;
// //     if (newSeatCount > maxSeats) {
// //       showCustomAlert('Not Enough Seats', `Only ${maxSeats} seat(s) available for modification.`, 'warning');
// //       return;
// //     }
    
// //     if (newSeatCount === userBooking.seats_requested) {
// //       showCustomAlert('No Change', 'Seat count is already set to this value.', 'info');
// //       return;
// //     }
    
// //     setModifyingSeats(true);
// //     try {
// //       const response = await axios.post(`${API_BASE_URL}/booking/${userBooking.id}/request-modification`, {
// //         requested_seats: newSeatCount
// //       });
      
// //       if (response.data && response.data.success) {
// //         showCustomAlert(
// //           'Request Sent 📨',
// //           `Your request to change from ${userBooking.seats_requested} to ${newSeatCount} seat(s) has been sent to the driver.`,
// //           'info'
// //         );
        
// //         setHasPendingModification(true);
// //         setPendingModificationDetails({
// //           current_seats: userBooking.seats_requested,
// //           requested_seats: newSeatCount
// //         });
// //         setPendingModificationSeats(newSeatCount);
// //         setSeatsRequested(newSeatCount);
// //       } else {
// //         throw new Error(response.data?.message || 'Failed to send modification request');
// //       }
      
// //     } catch (error) {
// //       console.error('Modification request error:', error);
// //       const errorMsg = error.response?.data?.message || error.response?.data?.detail || error.message || 'Failed to send modification request';
// //       showCustomAlert('Error', errorMsg, 'error');
// //     } finally {
// //       setModifyingSeats(false);
// //     }
// //   };
  
// //   // Cancel pending modification request
// //   const handleCancelModificationRequest = async () => {
// //     if (!userBooking?.id) return;
    
// //     setModifyingSeats(true);
// //     try {
// //       const response = await axios.delete(`${API_BASE_URL}/booking/${userBooking.id}/cancel-modification-request`);
      
// //       if (response.data && response.data.success) {
// //         showCustomAlert('Request Cancelled', 'Your seat modification request has been cancelled.', 'success');
// //         setHasPendingModification(false);
// //         setPendingModificationDetails(null);
// //         setPendingModificationSeats(null);
// //       } else {
// //         throw new Error(response.data?.message || 'Failed to cancel modification request');
// //       }
      
// //     } catch (error) {
// //       console.error('Cancel modification error:', error);
// //       const errorMsg = error.response?.data?.message || error.response?.data?.detail || error.message || 'Failed to cancel modification request';
// //       showCustomAlert('Error', errorMsg, 'error');
// //     } finally {
// //       setModifyingSeats(false);
// //     }
// //   };

// //   // Cancel booking
// //   const handleCancelBooking = async () => {
// //     if (!user?.phone_number || !userBooking) return;
    
// //     if (modificationsLocked) {
// //       showCustomAlert('Cannot Cancel', 'Cancellation is locked within 15 minutes of departure.', 'warning');
// //       setShowCancelModal(false);
// //       return;
// //     }
    
// //     if (rideStarted) {
// //       showCustomAlert('Cannot Cancel', 'Cannot cancel after ride has started.', 'warning');
// //       setShowCancelModal(false);
// //       return;
// //     }

// //     setCancelLoading(true);
// //     try {
// //       const response = await axios.put(`${API_BASE_URL}/booking/${userBooking.id}/cancel`);
      
// //       if (response.data) {
// //         showCustomAlert('Success', response.data.message || 'Booking cancelled successfully', 'success');
// //         setUserBooking(null);
// //         setSeatsRequested(1);
// //         setHasPendingModification(false);
// //         fetchRideDetails();
        
// //         setTimeout(() => navigation.goBack(), 1500);
// //       } else {
// //         throw new Error('Failed to cancel booking');
// //       }
// //     } catch (error) {
// //       console.error('Cancel booking error:', error);
// //       const errorMsg = error.response?.data?.message || error.response?.data?.detail || error.message || 'Failed to cancel booking';
// //       showCustomAlert('Error', errorMsg, 'error');
// //     } finally {
// //       setCancelLoading(false);
// //       setShowCancelModal(false);
// //     }
// //   };

// //   // Create new booking
// //   const handleCreateBooking = async () => {
// //     if (!user?.phone_number) {
// //       showCustomAlert('Login Required', 'Please log in to request a ride.', 'warning');
// //       return;
// //     }

// //     if (ride?.womenOnly === true && user?.gender !== 'female') {
// //       showCustomAlert('Not Available', 'This ride is for women passengers only.', 'warning');
// //       return;
// //     }

// //     const remainingSeats = totalRideSeats - otherBookedSeats;
    
// //     if (seatsRequested > remainingSeats) {
// //       showCustomAlert('Not Enough Seats', `Only ${remainingSeats} seat(s) left in this ride.`, 'warning');
// //       return;
// //     }

// //     setRequestLoading(true);
// //     try {
// //       const payload = {
// //         ride_id: ride.id,
// //         passenger_phone: user.phone_number,
// //         seats_requested: seatsRequested,
// //       };

// //       if (searchData?.fromCoords) payload.from_coords = searchData.fromCoords;
// //       if (searchData?.toCoords) payload.to_coords = searchData.toCoords;

// //       const response = await axios.post(`${API_BASE_URL}/ride-bookings`, payload);

// //       if (response.data) {
// //         showCustomAlert(
// //           'Request Sent 📨', 
// //           `Your request for ${seatsRequested} seat(s) has been sent to the driver. You will be notified when they respond.`,
// //           'info'
// //         );
        
// //         setTimeout(() => {
// //           checkUserBooking();
// //           fetchRideDetails();
// //         }, 1000);
// //       } else {
// //         throw new Error('Failed to send request');
// //       }
      
// //     } catch (error) {
// //       console.error('Booking error:', error);
// //       const errorMsg = error.response?.data?.message || error.response?.data?.detail || error.message || 'Failed to send request';
// //       showCustomAlert('Error', errorMsg, 'error');
// //     } finally {
// //       setRequestLoading(false);
// //     }
// //   };

// //   // Handle seat change - either direct modify or send modification request
// //   const handleSeatChange = async () => {
// //     if (rideAutoCancelled || rideCancelled) {
// //       showCustomAlert('Ride Cancelled', 'This ride is no longer available.', 'warning');
// //       return;
// //     }
    
// //     if (rideStarted) {
// //       showCustomAlert('Cannot Modify', 'Cannot modify seats after ride has started.', 'warning');
// //       return;
// //     }
    
// //     if (userBooking) {
// //       // If booking is accepted, send modification request to driver
// //       if (userBooking.status === 'accepted') {
// //         if (hasPendingModification) {
// //           showCustomAlert(
// //             'Request Pending',
// //             `You already have a pending modification request to change to ${pendingModificationSeats} seat(s). Please wait for driver response.`,
// //             'warning'
// //           );
// //           return;
// //         }
// //         await handleRequestModification(seatsRequested);
// //       } 
// //       // If booking is pending, can modify directly
// //       else if (userBooking.status === 'pending') {
// //         await handleDirectModify(seatsRequested);
// //       }
// //     } else {
// //       await handleCreateBooking();
// //     }
// //   };
  
// // // Add this helper function to debug API calls
// // const debugApiCall = async (url, method, data) => {
// //   console.log(`🔍 DEBUG: ${method} ${url}`);
// //   console.log('📦 Request data:', JSON.stringify(data, null, 2));
  
// //   try {
// //     const response = await axios({
// //       method: method,
// //       url: url,
// //       data: data,
// //       headers: {
// //         'Content-Type': 'application/json',
// //         'Accept': 'application/json'
// //       }
// //     });
// //     console.log('✅ Response:', response.status, response.data);
// //     return response;
// //   } catch (error) {
// //     console.log('❌ Error Status:', error.response?.status);
// //     console.log('❌ Error Data:', error.response?.data);
// //     console.log('❌ Error Message:', error.message);
// //     throw error;
// //   }
// // };

// // // Updated handleDirectModify with debugging
// // const handleDirectModify = async (newSeatCount) => {
// //   if (!user?.phone_number || !userBooking) {
// //     console.log('❌ Missing user or booking:', { user: !!user, booking: !!userBooking });
// //     return;
// //   }
  
// //   console.log('🪑 Attempting to modify seats:', {
// //     bookingId: userBooking.id,
// //     currentSeats: userBooking.seats_requested,
// //     newSeats: newSeatCount,
// //     totalSeats: totalRideSeats,
// //     otherBooked: otherBookedSeats
// //   });
  
// //   if (newSeatCount < 1) {
// //     showCustomAlert('Invalid Seats', 'You must book at least 1 seat.', 'warning');
// //     return;
// //   }
  
// //   const maxSeats = totalRideSeats - otherBookedSeats;
// //   if (newSeatCount > maxSeats) {
// //     showCustomAlert('Not Enough Seats', `Only ${maxSeats} seat(s) available.`, 'warning');
// //     return;
// //   }
  
// //   if (newSeatCount === userBooking.seats_requested) {
// //     showCustomAlert('No Change', 'Seat count is already set to this value.', 'info');
// //     return;
// //   }
  
// //   setModifyingSeats(true);
// //   try {
// //     // Use the debug function
// //     const response = await debugApiCall(
// //       `${API_BASE_URL}/booking/${userBooking.id}/modify-seats`,
// //       'put',
// //       { new_seats: newSeatCount }
// //     );
    
// //     if (response.data) {
// //       showCustomAlert(
// //         'Booking Updated ✅',
// //         `Your booking has been updated from ${userBooking.seats_requested} to ${newSeatCount} seat(s).`,
// //         'success'
// //       );
      
// //       setUserBooking({ ...userBooking, seats_requested: newSeatCount });
// //       setSeatsRequested(newSeatCount);
// //       fetchRideDetails();
// //       checkUserBooking();
// //     }
    
// //   } catch (error) {
// //     console.error('❌ Modification error full details:', error);
    
// //     let errorMsg = 'Failed to modify booking';
// //     if (error.response?.data?.detail) {
// //       errorMsg = error.response.data.detail;
// //     } else if (error.response?.data?.message) {
// //       errorMsg = error.response.data.message;
// //     } else if (error.response?.data?.error) {
// //       errorMsg = error.response.data.error;
// //     } else if (error.message) {
// //       errorMsg = error.message;
// //     }
    
// //     showCustomAlert('Error', errorMsg, 'error');
// //   } finally {
// //     setModifyingSeats(false);
// //   }
// // };
// //   const viewDriverProfile = () => {
// //     const driverPhone = ride?.phoneNumber;
// //     const driverUserId = ride?.driverUserId;
    
// //     if (driverPhone || driverUserId) {
// //       navigation.navigate('ViewProfileScreen', {
// //         userId: driverUserId || null,
// //         phoneNumber: driverPhone || null,
// //         driverName: driverProfile?.full_name || ride?.driverName || 'Driver',
// //         profilePicture: profilePhotoUrl,
// //         vehicleNumber: vehicleRegNumber,
// //         vehicleModel: vehicleName,
// //         driverRating: driverProfile?.avg_rating || ride?.rating || 0,
// //       });
// //     } else {
// //       showCustomAlert('Profile', 'Driver profile not available', 'warning');
// //     }
// //   };

// //   const getOrCreateConversation = async (receiverPhone, rideId) => {
// //     try {
// //       const myPhone = user?.phone_number;
// //       if (!myPhone) return null;
// //       const response = await axios.post(`${API_BASE_URL}/api/chat/conversations`, {
// //         participant_phone: receiverPhone,
// //         ride_id: rideId
// //       }, {
// //         headers: { 'X-Phone-Number': myPhone }
// //       });
// //       return response.data?.success ? response.data.conversation.id : null;
// //     } catch (error) {
// //       console.error('getOrCreateConversation error:', error);
// //       return null;
// //     }
// //   };

// //   const startChat = async () => {
// //     const driverPhone = ride?.phoneNumber;
// //     if (driverPhone) {
// //       const conversationId = await getOrCreateConversation(driverPhone, ride.id);
// //       if (conversationId) {
// //         navigation.navigate('ChatScreen', {
// //           receiverPhone: driverPhone,
// //           conversationId,
// //           user: { name: driverProfile?.full_name || ride?.driverName || 'Driver', tripInfo: `${ride.from} → ${ride.to}` },
// //         });
// //       } else {
// //         showCustomAlert('Chat', 'Unable to start chat.', 'error');
// //       }
// //     } else {
// //       showCustomAlert('Chat', 'Driver contact not available', 'warning');
// //     }
// //   };

// //   if (requestLoading || cancelLoading || loadingProfile) {
// //     return (
// //       <View style={styles.loaderContainer}>
// //         <LottieView source={require("../assets/loading.json")} autoPlay loop style={{ width: 300, height: 300 }} />
// //       </View>
// //     );
// //   }

// //   if (!ride) {
// //     return (
// //       <View style={styles.centerContainer}>
// //         <Text style={styles.errorText}>No ride data available</Text>
// //         <TouchableOpacity onPress={() => navigation.goBack()} style={styles.fallbackBtn}>
// //           <Text style={styles.fallbackBtnText}>Go Back</Text>
// //         </TouchableOpacity>
// //       </View>
// //     );
// //   }

// //   const initialRegion = {
// //     latitude: intersectionPickup?.latitude || driverStart?.latitude || 28.6139,
// //     longitude: intersectionPickup?.longitude || driverStart?.longitude || 77.2090,
// //     latitudeDelta: 0.05,
// //     longitudeDelta: 0.05,
// //   };

// //   const isBooked = !!userBooking;
// //   const isAccepted = isBooked && userBooking.status === 'accepted';
// //   const isPending = isBooked && userBooking.status === 'pending';
  
// //   const remainingForOthers = totalRideSeats - otherBookedSeats;
// //   const maxSelectable = isBooked ? totalRideSeats : remainingForOthers;
// //   const currentBookedSeats = userBooking?.seats_requested || 0;
  
// //   const canRequestModification = isAccepted && !modificationsLocked && !rideStarted && !rideAutoCancelled && !rideCancelled && !hasPendingModification;
// //   const canCancel = (isAccepted || isPending) && !modificationsLocked && !rideStarted && !rideAutoCancelled && !rideCancelled;
  
// //   // Get warning message based on ride status
// //   const getRideStatusMessage = () => {
// //     if (rideAutoCancelled) {
// //       return { message: "This ride has been auto-cancelled as the driver did not start on time.", type: 'error', icon: 'alert-circle' };
// //     }
// //     if (rideCancelled) {
// //       return { message: "This ride has been cancelled by the driver.", type: 'error', icon: 'close-circle' };
// //     }
// //     if (rideStarted) {
// //       return { message: "Ride in progress! You can track the driver's location.", type: 'success', icon: 'car-sport' };
// //     }
// //     if (modificationsLocked && isAccepted) {
// //       return { message: `Modifications locked - Departure in ${Math.abs(minutesToDeparture)} minutes`, type: 'warning', icon: 'lock-closed' };
// //     }
// //     if (minutesToDeparture <= 0 && minutesToDeparture > -30 && !rideStarted) {
// //       return { message: `⚠️ Ride is ${Math.abs(minutesToDeparture)} minutes late. Driver must start within ${30 - Math.abs(minutesToDeparture)} minutes.`, type: 'warning', icon: 'time-outline' };
// //     }
// //     if (minutesToDeparture > 0 && minutesToDeparture <= 15) {
// //       return { message: `Ride starts in ${minutesToDeparture} minutes`, type: 'info', icon: 'time-outline' };
// //     }
// //     return null;
// //   };
  
// //   const statusMessage = getRideStatusMessage();

// //   return (
// //     <View style={styles.container}>
// //       <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />

// //       <Animated.View style={[styles.mapContainer, { height: mapHeight }]}>
// //         <MapView
// //           ref={mapRef}
// //           provider={PROVIDER_GOOGLE}
// //           style={styles.map}
// //           initialRegion={initialRegion}
// //           onMapReady={() => setMapReady(true)}
// //           showsUserLocation={false}
// //           showsMyLocationButton={false}
// //           zoomEnabled={true}
// //           zoomControlEnabled={true}
// //         >
// //           {/* ... Marker components remain the same ... */}
// //           {routePath.length >= 2 && (
// //             <Polyline coordinates={routePath} strokeColor="#2457A6" strokeWidth={5} lineCap="round" lineJoin="round" />
// //           )}

// //           {driverStart && (
// //             <Marker coordinate={driverStart} anchor={{ x: 0.5, y: 1 }}>
// //               <View style={styles.markerWrapper}>
// //                 <View style={[styles.pinBubble, { backgroundColor: '#16A34A' }]}>
// //                   <Text style={styles.pinIcon}>S</Text>
// //                 </View>
// //                 <View style={[styles.pinPointer, { borderTopColor: '#16A34A' }]} />
// //               </View>
// //             </Marker>
// //           )}

// //           {driverEnd && (
// //             <Marker coordinate={driverEnd} anchor={{ x: 0.5, y: 1 }}>
// //               <View style={styles.markerWrapper}>
// //                 <View style={[styles.pinBubble, { backgroundColor: '#DC2626' }]}>
// //                   <Text style={styles.pinIcon}>E</Text>
// //                 </View>
// //                 <View style={[styles.pinPointer, { borderTopColor: '#DC2626' }]} />
// //               </View>
// //             </Marker>
// //           )}

// //           {userPickup && (
// //             <Marker coordinate={userPickup} anchor={{ x: 0.5, y: 1 }}>
// //               <View style={styles.markerWrapper}>
// //                 <View style={[styles.pinBubble, { backgroundColor: '#3B82F6' }]}>
// //                   <Ionicons name="person" size={12} color="white" />
// //                 </View>
// //                 <View style={[styles.pinPointer, { borderTopColor: '#3B82F6' }]} />
// //                 <View style={styles.pinLabelBubble}>
// //                   <Text style={styles.pinLabelText}>Your Pickup</Text>
// //                 </View>
// //               </View>
// //             </Marker>
// //           )}

// //           {userDrop && (
// //             <Marker coordinate={userDrop} anchor={{ x: 0.5, y: 1 }}>
// //               <View style={styles.markerWrapper}>
// //                 <View style={[styles.pinBubble, { backgroundColor: '#F97316' }]}>
// //                   <Ionicons name="flag" size={12} color="white" />
// //                 </View>
// //                 <View style={[styles.pinPointer, { borderTopColor: '#F97316' }]} />
// //                 <View style={styles.pinLabelBubble}>
// //                   <Text style={styles.pinLabelText}>Your Drop</Text>
// //                 </View>
// //               </View>
// //             </Marker>
// //           )}

// //           {intersectionPickup && (
// //             <Marker coordinate={intersectionPickup} anchor={{ x: 0.5, y: 1 }}>
// //               <View style={styles.markerWrapper}>
// //                 <View style={[styles.pinBubble, { backgroundColor: '#FACC15' }]}>
// //                   <Ionicons name="hand-right" size={12} color="#713F12" />
// //                 </View>
// //                 <View style={[styles.pinPointer, { borderTopColor: '#FACC15' }]} />
// //                 <View style={styles.pinLabelBubbleYellow}>
// //                   <Text style={styles.pinLabelTextYellow}>Meet Driver</Text>
// //                 </View>
// //               </View>
// //             </Marker>
// //           )}

// //           {intersectionDrop && (
// //             <Marker coordinate={intersectionDrop} anchor={{ x: 0.5, y: 1 }}>
// //               <View style={styles.markerWrapper}>
// //                 <View style={[styles.pinBubble, { backgroundColor: '#FACC15' }]}>
// //                   <Ionicons name="exit" size={12} color="#713F12" />
// //                 </View>
// //                 <View style={[styles.pinPointer, { borderTopColor: '#FACC15' }]} />
// //                 <View style={styles.pinLabelBubbleYellow}>
// //                   <Text style={styles.pinLabelTextYellow}>Exit Here</Text>
// //                 </View>
// //               </View>
// //             </Marker>
// //           )}

// //           {walkToPickupPath.length >= 2 && (
// //             <Polyline coordinates={walkToPickupPath} strokeColor="#FACC15" strokeWidth={4} strokeDasharray={[8, 6]} lineCap="round" lineJoin="round" />
// //           )}

// //           {walkFromDropPath.length >= 2 && (
// //             <Polyline coordinates={walkFromDropPath} strokeColor="#FACC15" strokeWidth={4} strokeDasharray={[8, 6]} lineCap="round" lineJoin="round" />
// //           )}
// //         </MapView>

// //         <TouchableOpacity style={styles.mapBackButton} onPress={() => navigation.goBack()}>
// //           <Ionicons name="chevron-back" size={26} color={Colors.secondary} />
// //         </TouchableOpacity>
// //       </Animated.View>

// //       <Animated.View style={[styles.drawer, { height: drawerHeight }]}>
// //         <View style={styles.handleWrap} {...panResponder.panHandlers}>
// //           <TouchableOpacity activeOpacity={0.9} onPress={toggleDrawer} style={styles.handleHitArea}>
// //             <View style={styles.handleBar} />
// //           </TouchableOpacity>
// //         </View>

// //         {!drawerExpanded ? (
// //           <View style={styles.collapsedSummary}>
// //             <View style={styles.collapsedTopRow}>
// //               <View style={{ flex: 1 }}>
// //                 <Text style={styles.collapsedDriver} numberOfLines={1}>{driverProfile?.full_name || ride?.driverName || 'Driver'}</Text>
// //                 <Text style={styles.collapsedSub} numberOfLines={1}>{ride.from} → {ride.to}</Text>
// //               </View>
// //               <View style={styles.collapsedPriceWrap}>
// //                 <Text style={styles.collapsedPrice}>₹{ride.price}</Text>
// //                 <Text style={styles.collapsedPerSeat}>per seat</Text>
// //               </View>
// //             </View>
// //           </View>
// //         ) : (
// //           <>
// //             <ScrollView 
// //               style={styles.drawerScroll} 
// //               contentContainerStyle={styles.drawerContent} 
// //               showsVerticalScrollIndicator={false}
// //               refreshControl={
// //                 <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
// //               }
// //             >
// //               {/* Ride Status Banner */}
// //               {statusMessage && (
// //                 <View style={[styles.statusBanner, { backgroundColor: statusMessage.type === 'error' ? '#FEF2F2' : statusMessage.type === 'warning' ? '#FFFBEB' : '#E8F5E9' }]}>
// //                   <Ionicons name={statusMessage.icon} size={20} color={statusMessage.type === 'error' ? '#DC2626' : statusMessage.type === 'warning' ? '#F59E0B' : '#10B981'} />
// //                   <Text style={[styles.statusBannerText, { color: statusMessage.type === 'error' ? '#DC2626' : statusMessage.type === 'warning' ? '#92400E' : '#166534', flex: 1 }]}>
// //                     {statusMessage.message}
// //                   </Text>
// //                 </View>
// //               )}
              
// //               {/* Modification Lock Warning */}
// //               {modificationsLocked && isAccepted && !rideStarted && !rideAutoCancelled && (
// //                 <View style={styles.modificationsLockedBanner}>
// //                   <Ionicons name="lock-closed" size={16} color="#DC2626" />
// //                   <Text style={styles.modificationsLockedText}>
// //                     Modifications locked - Cannot change seats within 15 minutes of departure
// //                   </Text>
// //                 </View>
// //               )}

// //               <View style={styles.driverCard}>
// //                 <View style={styles.driverTopRow}>
// //                   <View style={styles.driverLeftWrap}>
// //                     <TouchableOpacity style={styles.driverAvatar} onPress={handleProfileImagePress} activeOpacity={0.8}>
// //                       {profilePhotoUrl ? (
// //                         isProfilePhotoSvg ? (
// //                           <View style={styles.svgAvatarContainer}><SvgCssUri uri={profilePhotoUrl} width={56} height={56} /></View>
// //                         ) : (
// //                           <Image source={{ uri: profilePhotoUrl }} style={styles.avatarImg} />
// //                         )
// //                       ) : (
// //                         <Text style={styles.avatarText}>{avatarText}</Text>
// //                       )}
// //                     </TouchableOpacity>
// //                     <View style={styles.driverMeta}>
// //                       <View style={styles.driverNameRow}>
// //                         <Text style={styles.driverName}>{driverProfile?.full_name || ride?.driverName || 'Driver'}</Text>
// //                         {isVerified && (
// //                           <View style={styles.verifiedBadge}>
// //                             <Ionicons name="checkmark-circle" size={12} color="#2457A6" />
// //                             <Text style={styles.verifiedBadgeText}>Verified</Text>
// //                           </View>
// //                         )}
// //                       </View>
// //                       <View style={styles.ratingRow}>
// //                         <Ionicons name="star" size={13} color="#F59E0B" />
// //                         <Text style={styles.ratingText}>{driverProfile?.avg_rating || ride?.rating || 4.5}</Text>
// //                       </View>
// //                     </View>
// //                   </View>
// //                   <TouchableOpacity style={styles.chatButtonCircle} onPress={startChat}>
// //                     <Ionicons name="chatbubble-outline" size={20} color="#2457A6" />
// //                   </TouchableOpacity>
// //                 </View>
// //                 <Text style={styles.driverBio}>{driverProfile?.bio || driverProfile?.about || 'Friendly driver, love meeting new people!'}</Text>
// //                 <TouchableOpacity style={styles.profileOutlineBtn} onPress={viewDriverProfile}>
// //                   <Text style={styles.profileOutlineBtnText}>View Full Profile</Text>
// //                 </TouchableOpacity>
// //               </View>

// //               <View style={styles.cardSection}>
// //                 <Text style={styles.sectionTitle}>Trip Details</Text>
// //                 <View style={styles.tripTimelineWrap}>
// //                   <View style={styles.timelineRail}>
// //                     <View style={[styles.timelineDot, { backgroundColor: '#2457A6' }]} />
// //                     <View style={styles.timelineLine} />
// //                     <View style={[styles.timelineDot, { backgroundColor: '#FF7A00' }]} />
// //                   </View>
// //                   <View style={styles.timelineContent}>
// //                     <View style={styles.timelineItem}>
// //                       <Text style={styles.timelineLabel}>Pickup</Text>
// //                       <Text style={styles.timelinePlace}>{ride.pickupLabel || ride.from}</Text>
// //                       <View style={styles.timelineMetaRow}>
// //                         <Ionicons name="time-outline" size={13} color={Colors.gray} />
// //                         <Text style={styles.timelineMetaText}>{ride.date} at {ride.time}</Text>
// //                       </View>
// //                     </View>
// //                     <View style={styles.timelineItem}>
// //                       <Text style={styles.timelineLabel}>Dropoff</Text>
// //                       <Text style={styles.timelinePlace}>{ride.dropLabel || ride.to}</Text>
// //                       <Text style={styles.timelineMetaText}>Estimated: {ride.durationText || '--'}</Text>
// //                     </View>
// //                   </View>
// //                 </View>
// //               </View>

// //               <View style={styles.cardSection}>
// //                 <Text style={styles.sectionTitle}>Vehicle Details</Text>
// //                 <View style={styles.vehicleHeaderRow}>
// //                   <View style={styles.vehicleIconCircle}><Ionicons name="car-sport-outline" size={18} color="#2457A6" /></View>
// //                   <View style={styles.vehicleMeta}>
// //                     <Text style={styles.vehicleTitle}>{vehicleName}</Text>
// //                     <Text style={styles.vehicleSub}>{vehicleColor} • {totalRideSeats} seats total</Text>
// //                     {vehicleRegNumber && (
// //                       <View style={styles.vehicleRegContainer}>
// //                         <Text style={styles.vehicleRegText}>Vehicle Number: {vehicleRegNumber}</Text>
// //                       </View>
// //                     )}
// //                   </View>
// //                 </View>
// //               </View>

// //               <View style={styles.cardSection}>
// //                 <Text style={styles.sectionTitle}>Ride Preferences</Text>
// //                 <View style={styles.tagRow}>
// //                   {allPreferences.length > 0 ? (
// //                     allPreferences.map((pref, index) => <GenericPreferenceTag key={`${pref}-${index}`} label={pref} />)
// //                   ) : (
// //                     <Text style={styles.emptyText}>No specific preferences added</Text>
// //                   )}
// //                 </View>
// //               </View>

// //               <View style={styles.cardSection}>
// //                 <Text style={styles.sectionTitle}>Cost Breakdown</Text>
// //                 <View style={styles.priceRow}>
// //                   <Text style={styles.priceLabel}>Base fare (per seat)</Text>
// //                   <Text style={styles.priceValue}>₹{ride.price}</Text>
// //                 </View>
// //                 <View style={styles.priceDivider} />
// //                 <View style={styles.priceRow}>
// //                   <Text style={styles.totalLabel}>Total for {seatsRequested} seat(s)</Text>
// //                   <Text style={styles.totalValue}>₹{totalPrice}</Text>
// //                 </View>
// //                 <View style={styles.noticeBox}>
// //                   <Text style={styles.noticeText}>Cost-share contribution - sharing travel costs with the driver.</Text>
// //                 </View>
// //               </View>

// //               <View style={styles.cardSection}>
// //                 <Text style={styles.sectionTitle}>{isBooked ? 'Your Booking' : 'Select Seats'}</Text>
                
// //                 <View style={styles.seatInfoBox}>
// //                   <Text style={styles.seatInfoText}>
// //                     🚗 Total seats in vehicle: <Text style={styles.seatInfoBold}>{totalRideSeats}</Text>
// //                   </Text>
// //                   {otherBookedSeats > 0 && !isBooked && (
// //                     <Text style={styles.seatInfoText}>
// //                       👥 Other passengers booked: <Text style={styles.seatInfoBold}>{otherBookedSeats}</Text> seat(s)
// //                     </Text>
// //                   )}
// //                   {isBooked && (
// //                     <Text style={styles.seatInfoText}>
// //                       ✅ You have booked: <Text style={styles.seatInfoBold}>{currentBookedSeats}</Text> seat(s)
// //                     </Text>
// //                   )}
// //                   <Text style={styles.seatInfoText}>
// //                     📍 Seats available: <Text style={styles.seatInfoBold}>{remainingForOthers}</Text> seat(s)
// //                   </Text>
// //                 </View>
                
// //                 {/* Pending Modification Request Card */}
// //                 {hasPendingModification && pendingModificationDetails && isAccepted && (
// //                   <View style={styles.pendingModificationCard}>
// //                     <View style={styles.pendingModificationHeader}>
// //                       <Ionicons name="time-outline" size={24} color="#F59E0B" />
// //                       <Text style={styles.pendingModificationTitle}>Modification Request Pending</Text>
// //                     </View>
// //                     <Text style={styles.pendingModificationText}>
// //                       Requested to change from <Text style={styles.oldSeatCount}>{pendingModificationDetails.current_seats}</Text> 
// //                       {' → '}
// //                       <Text style={styles.newSeatCount}>{pendingModificationDetails.requested_seats}</Text> seat(s)
// //                     </Text>
// //                     <Text style={styles.pendingModificationSubtext}>
// //                       Your request has been sent to the driver. You will be notified once they respond.
// //                     </Text>
// //                     <TouchableOpacity 
// //                       style={styles.cancelRequestButton} 
// //                       onPress={handleCancelModificationRequest}
// //                       disabled={modifyingSeats}>
// //                       <Text style={styles.cancelRequestButtonText}>
// //                         {modifyingSeats ? 'Cancelling...' : 'Cancel Request'}
// //                       </Text>
// //                     </TouchableOpacity>
// //                   </View>
// //                 )}
                
// //                 {isBooked && (
// //                   <View style={[styles.currentBookingContainer, isAccepted && styles.confirmedBookingContainer]}>
// //                     {isPending ? (
// //                       <>
// //                         <Ionicons name="time-outline" size={24} color="#F59E0B" />
// //                         <Text style={styles.pendingBookingTitle}>
// //                           ⏳ Waiting for Driver Confirmation
// //                         </Text>
// //                         <Text style={styles.currentBookingText}>
// //                           You have requested {userBooking.seats_requested} seat(s) for this ride.
// //                         </Text>
// //                         <Text style={styles.currentBookingHint}>
// //                           You can modify or cancel your request anytime. The driver will notify you once confirmed.
// //                         </Text>
// //                       </>
// //                     ) : (
// //                       <>
// //                         <Ionicons name="checkmark-circle" size={24} color="#10B981" />
// //                         <Text style={styles.confirmedBookingTitle}>
// //                           ✅ Booking Confirmed!
// //                         </Text>
// //                         <Text style={styles.currentBookingText}>
// //                           You have booked {userBooking.seats_requested} seat(s) for this ride.
// //                         </Text>
// //                         <Text style={styles.currentBookingHint}>
// //                           {modificationsLocked 
// //                             ? "Modifications are locked within 15 minutes of departure." 
// //                             : "You can request a seat change anytime before the ride starts."}
// //                         </Text>
// //                       </>
// //                     )}
// //                   </View>
// //                 )}
                
// //                 {/* Seat Selector - Only show if ride is not cancelled/auto-cancelled and not started */}
// //                 {!rideStarted && !rideAutoCancelled && !rideCancelled && (
// //                   <>
// //                     <View style={styles.seatSelectorRow}>
// //                       <TouchableOpacity
// //                         style={[styles.seatActionBtn, (seatsRequested === 1 || modifyingSeats) && styles.seatActionBtnDisabled]}
// //                         onPress={() => setSeatsRequested(Math.max(1, seatsRequested - 1))}
// //                         disabled={seatsRequested === 1 || modifyingSeats}
// //                       >
// //                         <Ionicons name="remove" size={20} color={seatsRequested === 1 ? Colors.gray : Colors.dark} />
// //                       </TouchableOpacity>

// //                       <View style={styles.seatCountWrap}>
// //                         <Text style={styles.seatCountText}>{seatsRequested}</Text>
// //                         <Text style={styles.seatAvailableText}>
// //                           / {maxSelectable} {isBooked ? 'total' : 'available'}
// //                         </Text>
// //                       </View>

// //                       <TouchableOpacity
// //                         style={[styles.seatActionBtn, (seatsRequested === maxSelectable || modifyingSeats) && styles.seatActionBtnDisabled]}
// //                         onPress={() => setSeatsRequested(Math.min(maxSelectable, seatsRequested + 1))}
// //                         disabled={seatsRequested === maxSelectable || modifyingSeats}
// //                       >
// //                         <Ionicons name="add" size={20} color={seatsRequested === maxSelectable ? Colors.gray : "#2457A6"} />
// //                       </TouchableOpacity>
// //                     </View>
                    
// //                     {isAccepted && seatsRequested !== currentBookedSeats && !hasPendingModification && (
// //                       <View style={styles.priceDifferenceContainer}>
// //                         <Text style={styles.priceDifferenceText}>
// //                           {seatsRequested > currentBookedSeats 
// //                             ? `+ ₹${ride.price * (seatsRequested - currentBookedSeats)} will be charged if approved`
// //                             : `- ₹${ride.price * (currentBookedSeats - seatsRequested)} will be refunded if approved`}
// //                         </Text>
// //                         <Text style={styles.approvalNoteText}>* Changes require driver approval</Text>
// //                       </View>
// //                     )}
                    
// //                     {!isBooked && (
// //                       <View style={styles.seatInfoNote}>
// //                         <Text style={styles.seatInfoNoteText}>💡 You can modify or cancel anytime before the ride starts.</Text>
// //                       </View>
// //                     )}
// //                   </>
// //                 )}
                
// //                 {/* Cancel Booking Button */}
// //                 {canCancel && (
// //                   <TouchableOpacity 
// //                     style={styles.cancelBookingBtn} 
// //                     onPress={() => setShowCancelModal(true)} 
// //                     disabled={cancelLoading}
// //                   >
// //                     <Text style={styles.cancelBookingBtnText}>
// //                       {isPending ? 'Cancel Request' : 'Cancel Booking'}
// //                     </Text>
// //                   </TouchableOpacity>
// //                 )}
// //               </View>

// //               <View style={styles.safetyCard}>
// //                 <View style={styles.simpleInfoLeft}>
// //                   <Ionicons name="shield-checkmark-outline" size={18} color="#2457A6" />
// //                   <View>
// //                     <Text style={styles.safetyTitle}>Safety First</Text>
// //                     <Text style={styles.safetySub}>Live GPS tracking & 24/7 support</Text>
// //                   </View>
// //                 </View>
// //               </View>

// //               <View style={{ height: 110 }} />
// //             </ScrollView>

// //             {/* Bottom Action Button */}
// //             {(rideStarted || rideAutoCancelled || rideCancelled) ? null : (
// //               <View style={styles.bottomBar}>
// //                 <View>
// //                   <Text style={styles.bottomCaption}>
// //                     {isAccepted && hasPendingModification ? 'Requested total' : `Total for ${seatsRequested} seat(s)`}
// //                   </Text>
// //                   <Text style={styles.bottomTotal}>₹{totalPrice}</Text>
// //                 </View>

// //                 <TouchableOpacity
// //                   style={[
// //                     styles.bookNowBtn, 
// //                     (requestLoading || cancelLoading || modifyingSeats) && styles.bookNowBtnDisabled,
// //                     isAccepted && styles.modifyBtn,
// //                     (modificationsLocked && isAccepted) && styles.disabledBtn
// //                   ]}
// //                   onPress={handleSeatChange}
// //                   disabled={requestLoading || cancelLoading || modifyingSeats || (modificationsLocked && isAccepted) || rideStarted || rideAutoCancelled || rideCancelled}
// //                 >
// //                   <Text style={styles.bookNowText}>
// //                     {modificationsLocked && isAccepted ? 'Modifications Locked' :
// //                      isAccepted ? (hasPendingModification ? 'Request Pending' : (modifyingSeats ? 'Sending...' : 'Request Change')) :
// //                      isPending ? (modifyingSeats ? 'Updating...' : 'Update Booking') :
// //                      (requestLoading ? 'Sending Request...' : 'Request Ride')}
// //                   </Text>
// //                 </TouchableOpacity>
// //               </View>
// //             )}
// //           </>
// //         )}
// //       </Animated.View>

// //       <Modal visible={showCancelModal} transparent={true} animationType="fade" onRequestClose={() => setShowCancelModal(false)}>
// //         <View style={styles.modalBackdrop}>
// //           <View style={styles.confirmModalContainer}>
// //             <View style={styles.confirmModalContent}>
// //               <View style={styles.confirmModalHeader}>
// //                 <Ionicons name="alert-circle" size={40} color="#F59E0B" />
// //                 <Text style={styles.confirmModalTitle}>
// //                   {isPending ? 'Cancel Request?' : 'Cancel Booking?'}
// //                 </Text>
// //               </View>
// //               <Text style={styles.confirmModalMessage}>
// //                 {isPending 
// //                   ? 'Are you sure you want to cancel your ride request?'
// //                   : 'Are you sure you want to cancel your booking? This action cannot be undone.'}
// //               </Text>
// //               <View style={styles.confirmModalButtons}>
// //                 <TouchableOpacity style={[styles.confirmModalBtn, styles.confirmModalCancelBtn]} onPress={() => setShowCancelModal(false)}>
// //                   <Text style={styles.confirmModalCancelBtnText}>No, Keep</Text>
// //                 </TouchableOpacity>
// //                 <TouchableOpacity style={[styles.confirmModalBtn, styles.confirmModalConfirmBtn]} onPress={handleCancelBooking}>
// //                   <Text style={styles.confirmModalConfirmBtnText}>Yes, Cancel</Text>
// //                 </TouchableOpacity>
// //               </View>
// //             </View>
// //           </View>
// //         </View>
// //       </Modal>

// //       <ProfileImageModal visible={selectedProfile.visible} imageUrl={selectedProfile.imageUrl} driverName={selectedProfile.driverName} onClose={() => setSelectedProfile({ visible: false, imageUrl: null, driverName: '' })} />

// //       <CustomAlert visible={alertVisible} title={alertConfig.title} message={alertConfig.message} icon={alertConfig.icon} iconColor={alertConfig.iconColor} buttons={alertConfig.buttons} onBackdropPress={() => setAlertVisible(false)} />
// //     </View>
// //   );
// // }

// // const styles = StyleSheet.create({
// //   container: { flex: 1, backgroundColor: '#F4F5F7' },
// //   centerContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 24 },
// //   errorText: { fontSize: 18, color: Colors.gray, marginBottom: 16, textAlign: 'center' },
// //   fallbackBtn: { backgroundColor: Colors.primary, paddingHorizontal: 20, paddingVertical: 12, borderRadius: 12 },
// //   fallbackBtnText: { color: 'white', fontWeight: '700' },
// //   mapContainer: { width: '100%', overflow: 'hidden', backgroundColor: '#E8EEF7' },
// //   map: { flex: 1, backgroundColor: '#E8EEF7' },
// //   mapBackButton: { position: 'absolute', top: Platform.OS === 'ios' ? 54 : 22, left: 14, width: 42, height: 42, borderRadius: 25, backgroundColor: 'rgba(255,255,255,0.96)', alignItems: 'center', justifyContent: 'center' },
// //   markerWrapper: { alignItems: 'center' },
// //   pinBubble: { width: 28, height: 28, borderRadius: 14, borderWidth: 3, borderColor: 'white', alignItems: 'center', justifyContent: 'center', shadowColor: '#000', shadowOffset: { width: 0, height: 3 }, shadowOpacity: 0.25, shadowRadius: 4, elevation: 5 },
// //   pinPointer: { width: 0, height: 0, backgroundColor: 'transparent', borderStyle: 'solid', borderLeftWidth: 7, borderRightWidth: 7, borderTopWidth: 10, borderLeftColor: 'transparent', borderRightColor: 'transparent', marginTop: -2 },
// //   pinIcon: { fontSize: 14, fontWeight: '800', color: 'white', textAlign: 'center', lineHeight: 18 },
// //   pinLabelBubble: { backgroundColor: 'rgba(0,0,0,0.75)', borderRadius: 8, paddingHorizontal: 8, paddingVertical: 3, marginTop: 4 },
// //   pinLabelText: { color: 'white', fontSize: 10, fontWeight: '700' },
// //   pinLabelBubbleYellow: { backgroundColor: 'rgba(113, 63, 18, 0.9)', borderRadius: 8, paddingHorizontal: 8, paddingVertical: 3, marginTop: 4 },
// //   pinLabelTextYellow: { color: '#FACC15', fontSize: 10, fontWeight: '700' },
// //   drawer: { position: 'absolute', bottom: 0, left: 0, right: 0, backgroundColor: '#F4F5F7', borderTopLeftRadius: 28, borderTopRightRadius: 28, overflow: 'hidden' },
// //   handleWrap: { alignItems: 'center', paddingTop: 10, paddingBottom: 8, backgroundColor: '#F4F5F7' },
// //   handleHitArea: { paddingHorizontal: 40, paddingVertical: 10, alignItems: 'center', justifyContent: 'center' },
// //   handleBar: { width: 64, height: 6, borderRadius: 99, backgroundColor: '#CDD2D8' },
// //   collapsedSummary: { paddingHorizontal: 16, paddingTop: 4, paddingBottom: 12 },
// //   collapsedTopRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: 12 },
// //   collapsedDriver: { fontSize: 16, fontWeight: '800', color: Colors.dark },
// //   collapsedSub: { marginTop: 2, fontSize: 12, color: Colors.gray, fontWeight: '600' },
// //   collapsedPriceWrap: { alignItems: 'flex-end' },
// //   collapsedPrice: { fontSize: 18, fontWeight: '900', color: Colors.dark },
// //   collapsedPerSeat: { fontSize: 10, color: Colors.gray, fontWeight: '600' },
// //   drawerScroll: { flex: 1 },
// //   drawerContent: { paddingHorizontal: 16, paddingBottom: 16 },
// //   statusBanner: { flexDirection: 'row', alignItems: 'center', padding: 12, borderRadius: 12, marginBottom: 14, gap: 8 },
// //   statusBannerText: { fontSize: 13, fontWeight: '700' },
// //   modificationsLockedBanner: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#FEF2F2', padding: 12, borderRadius: 12, marginBottom: 14, gap: 8, borderWidth: 1, borderColor: '#FEE2E2' },
// //   modificationsLockedText: { fontSize: 12, color: '#DC2626', flex: 1 },
// //   driverCard: { backgroundColor: 'white', borderRadius: 20, padding: 16, marginBottom: 14, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 8, elevation: 2 },
// //   driverTopRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
// //   driverLeftWrap: { flexDirection: 'row', flex: 1, paddingRight: 10 },
// //   driverAvatar: { width: 56, height: 56, borderRadius: 28, backgroundColor: '#E5E7EB', overflow: 'hidden', alignItems: 'center', justifyContent: 'center', marginRight: 12 },
// //   avatarImg: { width: 56, height: 56, borderRadius: 28 },
// //   avatarText: { fontSize: 15, fontWeight: '800', color: Colors.gray },
// //   svgAvatarContainer: { width: 56, height: 56, borderRadius: 28, overflow: 'hidden', alignItems: 'center', justifyContent: 'center', backgroundColor: '#E5E7EB' },
// //   driverMeta: { flex: 1 },
// //   driverNameRow: { flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap', gap: 6 },
// //   driverName: { fontSize: 17, fontWeight: '800', color: Colors.dark },
// //   verifiedBadge: { flexDirection: 'row', alignItems: 'center', gap: 4 },
// //   verifiedBadgeText: { fontSize: 11, color: '#2457A6', fontWeight: '700' },
// //   ratingRow: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 6 },
// //   ratingText: { fontSize: 13, color: Colors.dark, fontWeight: '700' },
// //   chatButtonCircle: { width: 42, height: 42, borderRadius: 21, backgroundColor: '#EAF1FF', alignItems: 'center', justifyContent: 'center' },
// //   driverBio: { marginTop: 12, fontSize: 14, lineHeight: 20, color: Colors.gray },
// //   profileOutlineBtn: { marginTop: 14, borderWidth: 1, borderColor: '#2457A6', borderRadius: 16, paddingVertical: 12, alignItems: 'center' },
// //   profileOutlineBtnText: { color: '#2457A6', fontWeight: '700', fontSize: 14 },
// //   cardSection: { backgroundColor: 'white', borderRadius: 20, padding: 16, marginBottom: 14, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 8, elevation: 2 },
// //   sectionTitle: { fontSize: 16, fontWeight: '800', color: Colors.dark, marginBottom: 14 },
// //   seatInfoBox: { backgroundColor: '#F0F9FF', borderRadius: 12, padding: 12, marginBottom: 16 },
// //   seatInfoText: { fontSize: 13, color: Colors.dark, marginBottom: 4 },
// //   seatInfoBold: { fontWeight: '800', color: Colors.primary },
// //   currentBookingContainer: { backgroundColor: '#EFF6FF', borderRadius: 12, padding: 16, marginBottom: 16, alignItems: 'center' },
// //   confirmedBookingContainer: { backgroundColor: '#E8F5E9' },
// //   pendingBookingTitle: { fontSize: 16, fontWeight: '700', color: '#F59E0B', marginTop: 8, marginBottom: 4 },
// //   confirmedBookingTitle: { fontSize: 16, fontWeight: '700', color: '#10B981', marginTop: 8, marginBottom: 4 },
// //   currentBookingText: { fontSize: 14, color: Colors.dark, textAlign: 'center', marginBottom: 4 },
// //   currentBookingHint: { fontSize: 12, color: Colors.gray, textAlign: 'center' },
// //   pendingModificationCard: { backgroundColor: '#FFFBEB', borderRadius: 12, padding: 16, marginBottom: 16, borderWidth: 1, borderColor: '#FDE68A' },
// //   pendingModificationHeader: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 12 },
// //   pendingModificationTitle: { fontSize: 14, fontWeight: '700', color: '#92400E' },
// //   pendingModificationText: { fontSize: 13, color: '#B45309', marginBottom: 8, textAlign: 'center' },
// //   pendingModificationSubtext: { fontSize: 11, color: '#B45309', textAlign: 'center', marginBottom: 12 },
// //   oldSeatCount: { textDecorationLine: 'line-through', fontWeight: '700', color: '#DC2626' },
// //   newSeatCount: { fontWeight: '700', color: '#10B981' },
// //   cancelRequestButton: { backgroundColor: '#FEF2F2', paddingVertical: 10, borderRadius: 8, borderWidth: 1, borderColor: '#EF4444', alignItems: 'center' },
// //   cancelRequestButtonText: { color: '#EF4444', fontWeight: '600', fontSize: 14 },
// //   seatInfoNote: { marginTop: 12, backgroundColor: '#FEF3C7', borderRadius: 8, padding: 10 },
// //   seatInfoNoteText: { fontSize: 11, color: '#92400E', textAlign: 'center' },
// //   priceDifferenceContainer: { marginTop: 12, padding: 10, backgroundColor: '#EFF6FF', borderRadius: 8, alignItems: 'center' },
// //   priceDifferenceText: { fontSize: 12, color: '#2457A6', fontWeight: '600' },
// //   approvalNoteText: { fontSize: 10, color: '#6B7280', marginTop: 4 },
// //   tripTimelineWrap: { flexDirection: 'row' },
// //   timelineRail: { width: 18, alignItems: 'center', marginTop: 4 },
// //   timelineDot: { width: 10, height: 10, borderRadius: 5 },
// //   timelineLine: { width: 2, flex: 1, backgroundColor: '#D8DCE3', marginVertical: 6 },
// //   timelineContent: { flex: 1, paddingLeft: 8 },
// //   timelineItem: { marginBottom: 14 },
// //   timelineLabel: { fontSize: 12, color: Colors.gray, fontWeight: '700' },
// //   timelinePlace: { fontSize: 15, color: Colors.dark, fontWeight: '700', marginTop: 4 },
// //   timelineMetaRow: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 6 },
// //   timelineMetaText: { fontSize: 12, color: Colors.gray, fontWeight: '600' },
// //   vehicleHeaderRow: { flexDirection: 'row', alignItems: 'center' },
// //   vehicleIconCircle: { width: 42, height: 42, borderRadius: 21, backgroundColor: '#EAF1FF', alignItems: 'center', justifyContent: 'center', marginRight: 12 },
// //   vehicleMeta: { flex: 1 },
// //   vehicleTitle: { fontSize: 15, fontWeight: '800', color: Colors.dark },
// //   vehicleSub: { marginTop: 3, fontSize: 12, color: Colors.gray, fontWeight: '600' },
// //   vehicleRegContainer: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 6, paddingTop: 6, borderTopWidth: 1, borderTopColor: '#F0F0F0' },
// //   vehicleRegText: { fontSize: 11, color: '#6B7280', fontWeight: '500' },
// //   tagRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 14 },
// //   preferenceTag: { paddingHorizontal: 12, paddingVertical: 8, borderRadius: 999, backgroundColor: '#FFF3E8' },
// //   preferenceTagText: { fontSize: 12, color: '#C65D00', fontWeight: '700' },
// //   emptyText: { fontSize: 13, color: Colors.gray, fontWeight: '600' },
// //   priceRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
// //   priceLabel: { fontSize: 14, color: Colors.gray, fontWeight: '500' },
// //   priceValue: { fontSize: 14, color: Colors.dark, fontWeight: '700' },
// //   priceDivider: { height: 1, backgroundColor: '#ECEEF2', marginVertical: 8 },
// //   totalLabel: { fontSize: 15, color: Colors.dark, fontWeight: '800' },
// //   totalValue: { fontSize: 15, color: '#2457A6', fontWeight: '800' },
// //   noticeBox: { marginTop: 12, backgroundColor: '#FFF2E9', borderRadius: 14, padding: 12 },
// //   noticeText: { fontSize: 12.5, color: Colors.dark, lineHeight: 18 },
// //   seatSelectorRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: '#FAFAFB', borderRadius: 18, padding: 14 },
// //   seatActionBtn: { width: 38, height: 38, borderRadius: 12, borderWidth: 1, borderColor: '#D6DDE7', alignItems: 'center', justifyContent: 'center', backgroundColor: 'white' },
// //   seatActionBtnDisabled: { opacity: 0.5, backgroundColor: '#F5F5F5' },
// //   seatCountWrap: { flexDirection: 'row', alignItems: 'baseline' },
// //   seatCountText: { fontSize: 28, fontWeight: '900', color: Colors.dark },
// //   seatAvailableText: { fontSize: 13, color: Colors.gray, marginLeft: 6, fontWeight: '600' },
// //   cancelBookingBtn: { marginTop: 16, backgroundColor: '#FEF2F2', paddingVertical: 12, borderRadius: 12, alignItems: 'center', borderWidth: 1, borderColor: '#EF4444' },
// //   cancelBookingBtnText: { color: '#EF4444', fontWeight: '700', fontSize: 14 },
// //   simpleInfoLeft: { flexDirection: 'row', alignItems: 'center', gap: 8 },
// //   safetyCard: { backgroundColor: '#FFF3E7', borderRadius: 18, padding: 16, marginBottom: 14 },
// //   safetyTitle: { fontSize: 14, color: '#2457A6', fontWeight: '800' },
// //   safetySub: { marginTop: 2, fontSize: 12, color: '#2457A6', opacity: 0.9, fontWeight: '600' },
// //   bottomBar: { position: 'absolute', left: 0, right: 0, bottom: 0, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 16, paddingTop: 12, paddingBottom: Platform.OS === 'ios' ? 28 : 16, backgroundColor: 'white', borderTopWidth: 1, borderTopColor: '#ECEEF2' },
// //   bottomCaption: { fontSize: 12, color: Colors.gray, fontWeight: '500' },
// //   bottomTotal: { fontSize: 26, color: Colors.dark, fontWeight: '900', marginTop: 2 },
// //   bookNowBtn: { backgroundColor: '#FF7A00', paddingHorizontal: 24, paddingVertical: 14, borderRadius: 22, minWidth: 128, alignItems: 'center', justifyContent: 'center' },
// //   modifyBtn: { backgroundColor: '#2457A6' },
// //   disabledBtn: { backgroundColor: '#9CA3AF', opacity: 0.6 },
// //   bookNowBtnDisabled: { opacity: 0.7 },
// //   bookNowText: { color: 'white', fontSize: 16, fontWeight: '800' },
// //   loaderContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#fff' },
// //   modalBackdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center' },
// //   confirmModalContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
// //   confirmModalContent: { backgroundColor: 'white', borderRadius: 24, padding: 24, width: '85%', alignItems: 'center' },
// //   confirmModalHeader: { alignItems: 'center', marginBottom: 16 },
// //   confirmModalTitle: { fontSize: 20, fontWeight: '800', color: Colors.dark, marginTop: 12 },
// //   confirmModalMessage: { fontSize: 14, color: Colors.gray, textAlign: 'center', marginBottom: 24, lineHeight: 20 },
// //   confirmModalButtons: { flexDirection: 'row', gap: 12, width: '100%' },
// //   confirmModalBtn: { flex: 1, paddingVertical: 12, borderRadius: 12, alignItems: 'center' },
// //   confirmModalCancelBtn: { backgroundColor: '#F3F4F6' },
// //   confirmModalCancelBtnText: { color: Colors.dark, fontWeight: '700' },
// //   confirmModalConfirmBtn: { backgroundColor: '#EF4444' },
// //   confirmModalConfirmBtnText: { color: 'white', fontWeight: '700' },
// //   imageModalContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', width: '100%' },
// //   imageModalContent: { width: '90%', backgroundColor: Colors.white, borderRadius: 20, overflow: 'hidden', maxHeight: '80%' },
// //   imageModalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 16, borderBottomWidth: 1, borderBottomColor: '#EEF2F7' },
// //   imageModalTitle: { fontSize: 18, fontWeight: '700', color: Colors.dark },
// //   fullProfileImage: { width: '100%', height: 400, backgroundColor: '#F5F5F5' },
// //   modalSvgContainer: { width: '100%', height: 400, backgroundColor: '#F5F5F5', alignItems: 'center', justifyContent: 'center' },
// //   noImageContainer: { width: '100%', height: 400, justifyContent: 'center', alignItems: 'center', backgroundColor: '#F5F5F5' },
// //   noImageText: { fontSize: 16, color: Colors.gray },
// // });
// import { LogBox } from 'react-native';

// // Ignore accessibility warnings immediately
// LogBox.ignoreLogs([
//   'Accessibility: View',
//   'Property accessibilityState',
//   'RCTView',
//   'TouchableOpacity'
// ]);

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
//   Modal,
//   ActivityIndicator,
//   RefreshControl,
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
// import io from 'socket.io-client';
// import axios from 'axios';

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
//     return { longitude: Number(point[0]), latitude: Number(point[1]) };
//   }
//   if (point.lng != null && point.lat != null) {
//     return { longitude: Number(point.lng), latitude: Number(point.lat) };
//   }
//   if (point.longitude != null && point.latitude != null) {
//     return { longitude: Number(point.longitude), latitude: Number(point.latitude) };
//   }
//   return null;
// }

// function parseRouteCoordinates(routeCoordinates) {
//   if (!Array.isArray(routeCoordinates)) return [];
//   return routeCoordinates.map((item) => {
//     if (Array.isArray(item) && item.length === 2) {
//       return { longitude: Number(item[0]), latitude: Number(item[1]) };
//     }
//     return parseSuggestedPoint(item);
//   }).filter(Boolean);
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
//     try { ridePrefs = JSON.parse(ridePrefs); } catch (e) { ridePrefs = null; }
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
//       if (value === true) allPreferences.push(formattedKey);
//     } else if (Array.isArray(value)) {
//       if (value.length > 0) allPreferences.push(`${formattedKey}: ${value.join(', ')}`);
//     } else if (typeof value === 'object') {
//       allPreferences.push(...extractFromObject(value));
//     } else if (typeof value === 'string' && value.trim()) {
//       const lowerValue = value.toLowerCase();
//       if (!['false', 'no', 'none', 'null', 'undefined'].includes(lowerValue)) {
//         allPreferences.push(`${formattedKey}: ${value}`);
//       }
//     } else if (typeof value === 'number') {
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
//     tagColor = '#E8F5E9'; textColor = '#2E7D32';
//   } else if (lowerLabel.includes('chat') || lowerLabel.includes('talk')) {
//     tagColor = '#E3F2FD'; textColor = '#1565C0';
//   } else if (lowerLabel.includes('gender')) {
//     tagColor = '#F3E5F5'; textColor = '#6A1B9A';
//   } else if (lowerLabel.includes('language') || lowerLabel.includes('speak')) {
//     tagColor = '#FFF9C4'; textColor = '#F57F17';
//   } else if (lowerLabel.includes('verified')) {
//     tagColor = '#E8F5E9'; textColor = '#2E7D32';
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
//               <TouchableOpacity onPress={onClose}><Ionicons name="close" size={24} color={Colors.dark} /></TouchableOpacity>
//             </View>
//             {imageUrl && imageUrl !== 'null' && imageUrl !== 'undefined' ? (
//               isSvg ? (
//                 <View style={styles.modalSvgContainer}><SvgCssUri uri={imageUrl} width="100%" height={400} /></View>
//               ) : (
//                 <Image source={{ uri: imageUrl }} style={styles.fullProfileImage} resizeMode="contain" />
//               )
//             ) : (
//               <View style={styles.noImageContainer}><Text style={styles.noImageText}>No profile picture available</Text></View>
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
//   const [cancelLoading, setCancelLoading] = useState(false);
//   const [drawerExpanded, setDrawerExpanded] = useState(true);
//   const [driverProfile, setDriverProfile] = useState(null);
//   const [isVerified, setIsVerified] = useState(false);
//   const [loadingProfile, setLoadingProfile] = useState(true); // Start true for loading
//   const [loadingInitial, setLoadingInitial] = useState(true); // New state for initial load
//   const [mapReady, setMapReady] = useState(false);
//   const [userBooking, setUserBooking] = useState(null);
//   const [showCancelModal, setShowCancelModal] = useState(false);
  
//   // States for seat modification
//   const [modifyingSeats, setModifyingSeats] = useState(false);
//   const [refreshing, setRefreshing] = useState(false);
  
//   // State for actual seat availability
//   const [totalRideSeats, setTotalRideSeats] = useState(ride?.totalSeats || ride?.available_seats || 4);
//   const [otherBookedSeats, setOtherBookedSeats] = useState(0);
//   const [rideDetails, setRideDetails] = useState(null);
  
//   // Modification request state
//   const [hasPendingModification, setHasPendingModification] = useState(false);
//   const [pendingModificationDetails, setPendingModificationDetails] = useState(null);
//   const [pendingModificationSeats, setPendingModificationSeats] = useState(null);
  
//   // Ride status states
//   const [rideStarted, setRideStarted] = useState(ride?.started_at || false);
//   const [rideCancelled, setRideCancelled] = useState(ride?.cancellation_reason ? true : false);
//   const [rideAutoCancelled, setRideAutoCancelled] = useState(false);
//   const [minutesToDeparture, setMinutesToDeparture] = useState(null);
//   const [modificationsLocked, setModificationsLocked] = useState(false);
  
//   // Conflict resolution states
//   const [conflictModalVisible, setConflictModalVisible] = useState(false);
//   const [conflictData, setConflictData] = useState(null);
//   const [resolvingConflict, setResolvingConflict] = useState(false);
  
//   const animatedDrawer = useRef(new Animated.Value(1)).current;
//   const mapRef = useRef(null);
//   const socketRef = useRef(null);
//   const refreshInterval = useRef(null);
//   const initialLoadTimeout = useRef(null);
  
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
//     if (type === 'error') { icon = "error"; iconColor = "#EF4444"; }
//     else if (type === 'warning') { icon = "warning"; iconColor = "#F59E0B"; }
//     else if (type === 'info') { icon = "info"; iconColor = Colors.primary; }
//     setAlertConfig({ title, message, icon, iconColor, buttons: [{ text: 'OK', onPress: () => setAlertVisible(false) }] });
//     setAlertVisible(true);
//   };

//   // Calculate ride status and modification lock
//   const calculateRideStatus = useCallback(() => {
//     if (!ride?.departure_time) return;
    
//     const now = new Date();
//     const departureTime = new Date(ride.departure_time);
//     const minutesToDep = (departureTime - now) / (1000 * 60);
//     const minutesSinceDep = (now - departureTime) / (1000 * 60);
    
//     setMinutesToDeparture(Math.round(minutesToDep));
    
//     // Check if modifications are locked (within 15 minutes of departure)
//     const isLocked = minutesToDep <= 15 && minutesToDep > -30;
//     setModificationsLocked(isLocked);
    
//     // Check if ride is auto-cancelled (more than 30 minutes past departure without start)
//     if (minutesSinceDep > 30 && !rideStarted && !rideCancelled) {
//       setRideAutoCancelled(true);
//     }
//   }, [ride?.departure_time, rideStarted, rideCancelled]);

//   // Check for pending modification request
//   const checkPendingModification = useCallback(async () => {
//     if (!userBooking?.id) return;
    
//     try {
//       const response = await axios.get(`${API_BASE_URL}/booking/${userBooking.id}/modification-request?_t=${Date.now()}`);
      
//       if (response.data && response.data.has_pending && response.data.request) {
//         setHasPendingModification(true);
//         setPendingModificationDetails(response.data.request);
//         setPendingModificationSeats(response.data.request.requested_seats);
//       } else {
//         setHasPendingModification(false);
//         setPendingModificationDetails(null);
//         setPendingModificationSeats(null);
//       }
//     } catch (error) {
//       console.log('Error checking pending modification:', error);
//       setHasPendingModification(false);
//     }
//   }, [userBooking?.id]);

//   // Check for concurrent requests (for driver - but rider sees this as conflict)
//   const checkConcurrentConflict = useCallback(async () => {
//     if (!ride?.id) return;
    
//     try {
//       const response = await axios.get(`${API_BASE_URL}/ride/${ride.id}/concurrent-requests?_t=${Date.now()}`);
      
//       if (response.data && response.data.has_concurrent_requests) {
//         setConflictData(response.data);
//         setConflictModalVisible(true);
//       }
//     } catch (error) {
//       console.log('Error checking concurrent requests:', error);
//     }
//   }, [ride?.id]);

//   // Fetch ride details with seat availability
//   const fetchRideDetails = useCallback(async () => {
//     if (!ride?.id) return;
    
//     try {
//       const response = await axios.get(`${API_BASE_URL}/ride/${ride.id}/passengers?_t=${Date.now()}`);
      
//       if (response.data) {
//         setRideDetails(response.data);
//         const totalSeats = response.data.available_seats || ride.totalSeats || ride.available_seats || 4;
//         setTotalRideSeats(totalSeats);
        
//         // Calculate other booked seats excluding current user
//         let otherBooked = 0;
//         if (response.data.passengers && Array.isArray(response.data.passengers)) {
//           otherBooked = response.data.passengers
//             .filter(p => p.status === 'accepted' && p.passenger_phone !== user?.phone_number)
//             .reduce((sum, p) => sum + (p.seats_booked || 0), 0);
//         }
//         setOtherBookedSeats(otherBooked);
        
//         // Check if ride has started
//         if (response.data.started_at) {
//           setRideStarted(true);
//         }
        
//         // Check if ride is cancelled
//         if (response.data.status === 'cancelled') {
//           setRideCancelled(true);
//         }
//       }
//     } catch (error) {
//       console.log('Error fetching ride details:', error);
//     }
//   }, [ride?.id, ride?.totalSeats, ride?.available_seats, user?.phone_number]);

//   // Check user booking using axios
//   const checkUserBooking = useCallback(async () => {
//     if (!user?.phone_number || !ride?.id) return;
    
//     try {
//       const response = await axios.get(`${API_BASE_URL}/my-rides/${user.phone_number}`);
      
//       if (response.data && response.data.requested_rides) {
//         const booking = response.data.requested_rides.find(
//           b => b.ride_id === ride.id && (b.status === 'accepted' || b.status === 'pending')
//         );
        
//         if (booking) {
//           setUserBooking(booking);
//           setSeatsRequested(booking.seats_requested);
//           console.log('📦 Found existing booking:', booking);
//         } else {
//           setUserBooking(null);
//           setSeatsRequested(1);
//         }
//       }
//     } catch (error) {
//       console.log('Error checking user booking:', error);
//     }
//   }, [user?.phone_number, ride?.id]);

//   // Setup auto-refresh interval
//   useEffect(() => {
//     // Clear any existing interval
//     if (refreshInterval.current) {
//       clearInterval(refreshInterval.current);
//     }
    
//     // Refresh every 30 seconds to update ride status
//     refreshInterval.current = setInterval(() => {
//       fetchRideDetails();
//       checkUserBooking();
//       if (userBooking?.id) {
//         checkPendingModification();
//       }
//       calculateRideStatus();
//     }, 30000);
    
//     return () => {
//       if (refreshInterval.current) {
//         clearInterval(refreshInterval.current);
//       }
//     };
//   }, [fetchRideDetails, checkUserBooking, checkPendingModification, calculateRideStatus, userBooking?.id]);

//   // Setup socket listener for real-time updates
//   const setupSocketListener = useCallback(() => {
//     if (!ride?.id) return;
    
//     const socket = io(API_BASE_URL, {
//       transports: ['websocket'],
//       reconnection: true,
//       timeout: 10000,
//     });
//     socketRef.current = socket;
    
//     socket.on('connect', () => {
//       console.log('Socket connected for ride updates');
//       socket.emit('join-ride-room', ride.id);
//       if (user?.phone_number) {
//         socket.emit('join-user-room', user.phone_number);
//       }
//     });
    
//     socket.on('booking_accepted', (data) => {
//       console.log('✅ Booking accepted:', data);
//       showCustomAlert(
//         'Booking Confirmed ✅',
//         `Your booking for ${data.seats} seat(s) has been confirmed by the driver!`,
//         'success'
//       );
//       checkUserBooking();
//       fetchRideDetails();
//     });
    
//     socket.on('booking_rejected', (data) => {
//       console.log('❌ Booking rejected:', data);
//       showCustomAlert(
//         'Booking Declined ❌',
//         `Your booking request was declined by the driver.`,
//         'warning'
//       );
//       setUserBooking(null);
//       setSeatsRequested(1);
//     });
    
//     socket.on('modification-response', (data) => {
//       console.log('📝 Modification response:', data);
//       if (data.status === 'approved') {
//         showCustomAlert(
//           'Modification Approved ✅',
//           `Your seat change request has been approved! New seats: ${data.new_seats}`,
//           'success'
//         );
//         setHasPendingModification(false);
//         setPendingModificationDetails(null);
//         setPendingModificationSeats(null);
//         checkUserBooking();
//         fetchRideDetails();
//       } else if (data.status === 'rejected') {
//         showCustomAlert(
//           'Modification Rejected ❌',
//           `Your seat change request was rejected: ${data.reason || 'Driver declined'}`,
//           'warning'
//         );
//         setHasPendingModification(false);
//         setPendingModificationDetails(null);
//         setPendingModificationSeats(null);
//       }
//     });
    
//     socket.on('ride-started', (data) => {
//       console.log('🚗 Ride started:', data);
//       setRideStarted(true);
//       showCustomAlert(
//         'Ride Started! 🚗',
//         'The driver has started the ride. You can now track your journey live.',
//         'info'
//       );
//     });
    
//     socket.on('ride-auto-cancelled', (data) => {
//       console.log('⚠️ Ride auto-cancelled:', data);
//       setRideAutoCancelled(true);
//       setUserBooking(null);
//       showCustomAlert(
//         'Ride Auto-Cancelled ❌',
//         data.reason || 'The ride has been auto-cancelled as the driver did not start on time.',
//         'error'
//       );
//     });
    
//     socket.on('concurrent-requests-detected', (data) => {
//       console.log('⚡ Concurrent requests detected:', data);
//       if (data.ride_id === ride.id) {
//         checkConcurrentConflict();
//       }
//     });
    
//     return socket;
//   }, [ride?.id, user?.phone_number, checkUserBooking, fetchRideDetails, checkConcurrentConflict]);

//   useEffect(() => {
//     const socket = setupSocketListener();
//     return () => {
//       if (socket) {
//         socket.disconnect();
//         socketRef.current = null;
//       }
//     };
//   }, [setupSocketListener]);

//   const loadDriverData = useCallback(async () => {
//     const driverPhone = ride?.phoneNumber;
//     const driverUserId = ride?.driverUserId;
    
//     if (driverPhone || driverUserId) {
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
//     } else {
//       setLoadingProfile(false);
//     }
//   }, [ride?.phoneNumber, ride?.driverUserId]);

//   // Initial load with timeout to prevent infinite loading
//   const initialLoad = useCallback(async () => {
//     setLoadingInitial(true);
//     setLoadingProfile(true);
    
//     // Set a timeout to force hide loading after 5 seconds
//     initialLoadTimeout.current = setTimeout(() => {
//       console.log('⚠️ Initial load timeout - forcing loading to stop');
//       setLoadingInitial(false);
//       setLoadingProfile(false);
//     }, 5000);
    
//     try {
//       await Promise.all([
//         loadDriverData(),
//         checkUserBooking(),
//         fetchRideDetails(),
//         calculateRideStatus(),
//       ]);
//     } catch (error) {
//       console.log('Initial load error:', error);
//     } finally {
//       clearTimeout(initialLoadTimeout.current);
//       setLoadingInitial(false);
//     }
//   }, [loadDriverData, checkUserBooking, fetchRideDetails, calculateRideStatus]);

//   // Refresh function
//   const onRefresh = useCallback(async () => {
//     setRefreshing(true);
//     try {
//       await Promise.all([
//         loadDriverData(),
//         checkUserBooking(),
//         fetchRideDetails(),
//         checkPendingModification(),
//         calculateRideStatus(),
//         checkConcurrentConflict(),
//       ]);
//     } catch (error) {
//       console.log('Refresh error:', error);
//     } finally {
//       setRefreshing(false);
//     }
//   }, [loadDriverData, checkUserBooking, fetchRideDetails, checkPendingModification, calculateRideStatus, checkConcurrentConflict]);

//   useFocusEffect(
//     useCallback(() => {
//       initialLoad();
      
//       return () => {
//         if (initialLoadTimeout.current) {
//           clearTimeout(initialLoadTimeout.current);
//         }
//         if (socketRef.current) {
//           socketRef.current.disconnect();
//           socketRef.current = null;
//         }
//       };
//     }, [initialLoad])
//   );

//   // Check pending modification when userBooking changes
//   useEffect(() => {
//     if (userBooking?.id) {
//       checkPendingModification();
//     }
//   }, [userBooking?.id, checkPendingModification]);

//   useEffect(() => {
//     if (!isAuthenticated) {
//       showCustomAlert('Login Required', 'Please login to book rides.', 'warning');
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
//       if (Array.isArray(first) && first.length === 2) return { latitude: first[1], longitude: first[0] };
//     }
//     return parseSuggestedPoint(ride?.suggestedPickup);
//   }, [ride]);

//   const driverEnd = useMemo(() => {
//     const coords = ride?.routeCoordinates;
//     if (Array.isArray(coords) && coords.length > 0) {
//       const last = coords[coords.length - 1];
//       if (Array.isArray(last) && last.length === 2) return { latitude: last[1], longitude: last[0] };
//     }
//     return parseSuggestedPoint(ride?.suggestedDrop);
//   }, [ride]);

//   const intersectionPickup = useMemo(() => parseSuggestedPoint(ride?.suggestedPickup), [ride]);
//   const intersectionDrop = useMemo(() => parseSuggestedPoint(ride?.suggestedDrop), [ride]);

//   const userPickup = useMemo(() => {
//     if (!searchData?.fromCoords) return null;
//     const c = searchData.fromCoords;
//     if (Array.isArray(c) && c.length === 2) return { latitude: c[1], longitude: c[0] };
//     return null;
//   }, [searchData]);

//   const userDrop = useMemo(() => {
//     if (!searchData?.toCoords) return null;
//     const c = searchData.toCoords;
//     if (Array.isArray(c) && c.length === 2) return { latitude: c[1], longitude: c[0] };
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
//         } catch (e) { console.log('fitToCoordinates error:', e); }
//       }, 500);
//     }
//   }, [mapReady, allMarkerCoords]);

//   useEffect(() => {
//     if (mapReady && allMarkerCoords.length >= 2) fitMapToMarkers();
//   }, [mapReady, allMarkerCoords, fitMapToMarkers]);

//   const vehicleName = driverProfile?.vehicle 
//     ? [driverProfile.vehicle.model].filter(Boolean).join(' ')
//     : [ride?.vehicle?.model].filter(Boolean).join(' ') || 'Vehicle details unavailable';
  
//   const vehicleRegNumber = driverProfile?.vehicle?.registration_number || ride?.vehicle?.registration_number || null;
//   const vehicleColor = driverProfile?.vehicle?.color || ride?.vehicle?.color || 'Not specified';

//   const totalPrice = Number(ride?.price || 0) * seatsRequested;

//   const handleProfileImagePress = () => {
//     if (profilePhotoUrl) {
//       setSelectedProfile({ visible: true, imageUrl: profilePhotoUrl, driverName: driverProfile?.full_name || ride?.driverName || 'Driver' });
//     } else {
//       showCustomAlert('No Photo', 'Driver has not uploaded a profile picture', 'warning');
//     }
//   };

//   const mapHeight = animatedDrawer.interpolate({ inputRange: [0, 1], outputRange: [height - SAFE_TOP - COLLAPSED_HEIGHT, height * 0.32] });
//   const drawerHeight = animatedDrawer.interpolate({ inputRange: [0, 1], outputRange: [COLLAPSED_HEIGHT, EXPANDED_HEIGHT] });

//   const toggleDrawer = () => {
//     const nextExpanded = !drawerExpanded;
//     setDrawerExpanded(nextExpanded);
//     Animated.timing(animatedDrawer, { toValue: nextExpanded ? 1 : 0, duration: 260, useNativeDriver: false }).start();
//   };

//   const panResponder = useRef(PanResponder.create({
//     onMoveShouldSetPanResponder: (_, gestureState) => Math.abs(gestureState.dy) > 5,
//     onPanResponderMove: (_, gestureState) => {
//       const dragRange = EXPANDED_HEIGHT - COLLAPSED_HEIGHT;
//       const progress = drawerExpanded ? 1 - (gestureState.dy / dragRange) : gestureState.dy / dragRange;
//       animatedDrawer.setValue(Math.max(0, Math.min(1, progress)));
//     },
//     onPanResponderRelease: (_, gestureState) => {
//       const dragRange = EXPANDED_HEIGHT - COLLAPSED_HEIGHT;
//       const threshold = dragRange * 0.2;
//       if (drawerExpanded) {
//         if (gestureState.dy > threshold) {
//           setDrawerExpanded(false);
//           Animated.timing(animatedDrawer, { toValue: 0, duration: 200, useNativeDriver: false }).start();
//         } else {
//           setDrawerExpanded(true);
//           Animated.timing(animatedDrawer, { toValue: 1, duration: 200, useNativeDriver: false }).start();
//         }
//       } else {
//         if (gestureState.dy < -threshold) {
//           setDrawerExpanded(true);
//           Animated.timing(animatedDrawer, { toValue: 1, duration: 200, useNativeDriver: false }).start();
//         } else {
//           setDrawerExpanded(false);
//           Animated.timing(animatedDrawer, { toValue: 0, duration: 200, useNativeDriver: false }).start();
//         }
//       }
//     },
//   })).current;

//   // Request seat modification (send to driver)
//   const handleRequestModification = async (newSeatCount) => {
//     if (!user?.phone_number || !userBooking) return;
    
//     if (modificationsLocked) {
//       showCustomAlert(
//         'Modifications Locked',
//         `Modifications are locked within 15 minutes of departure. Please contact driver directly.`,
//         'warning'
//       );
//       return;
//     }
    
//     if (rideStarted) {
//       showCustomAlert('Cannot Modify', 'Cannot modify seats after ride has started.', 'warning');
//       return;
//     }
    
//     if (rideAutoCancelled || rideCancelled) {
//       showCustomAlert('Ride Cancelled', 'This ride has been cancelled.', 'warning');
//       return;
//     }
    
//     if (newSeatCount < 1) {
//       showCustomAlert('Invalid Seats', 'You must book at least 1 seat.', 'warning');
//       return;
//     }
    
//     const maxSeats = totalRideSeats - otherBookedSeats;
//     if (newSeatCount > maxSeats) {
//       showCustomAlert('Not Enough Seats', `Only ${maxSeats} seat(s) available for modification.`, 'warning');
//       return;
//     }
    
//     if (newSeatCount === userBooking.seats_requested) {
//       showCustomAlert('No Change', 'Seat count is already set to this value.', 'info');
//       return;
//     }
    
//     setModifyingSeats(true);
//     try {
//       const response = await axios.post(`${API_BASE_URL}/booking/${userBooking.id}/request-modification`, {
//         requested_seats: newSeatCount
//       });
      
//       if (response.data && response.data.success) {
//         showCustomAlert(
//           'Request Sent 📨',
//           `Your request to change from ${userBooking.seats_requested} to ${newSeatCount} seat(s) has been sent to the driver.`,
//           'info'
//         );
        
//         setHasPendingModification(true);
//         setPendingModificationDetails({
//           current_seats: userBooking.seats_requested,
//           requested_seats: newSeatCount
//         });
//         setPendingModificationSeats(newSeatCount);
//         setSeatsRequested(newSeatCount);
//       } else {
//         throw new Error(response.data?.message || 'Failed to send modification request');
//       }
      
//     } catch (error) {
//       console.error('Modification request error:', error);
//       const errorMsg = error.response?.data?.message || error.response?.data?.detail || error.message || 'Failed to send modification request';
//       showCustomAlert('Error', errorMsg, 'error');
//     } finally {
//       setModifyingSeats(false);
//     }
//   };
  
//   // Cancel pending modification request
//   const handleCancelModificationRequest = async () => {
//     if (!userBooking?.id) return;
    
//     setModifyingSeats(true);
//     try {
//       const response = await axios.delete(`${API_BASE_URL}/booking/${userBooking.id}/cancel-modification-request`);
      
//       if (response.data && response.data.success) {
//         showCustomAlert('Request Cancelled', 'Your seat modification request has been cancelled.', 'success');
//         setHasPendingModification(false);
//         setPendingModificationDetails(null);
//         setPendingModificationSeats(null);
//       } else {
//         throw new Error(response.data?.message || 'Failed to cancel modification request');
//       }
      
//     } catch (error) {
//       console.error('Cancel modification error:', error);
//       const errorMsg = error.response?.data?.message || error.response?.data?.detail || error.message || 'Failed to cancel modification request';
//       showCustomAlert('Error', errorMsg, 'error');
//     } finally {
//       setModifyingSeats(false);
//     }
//   };

//   // Cancel booking
//   const handleCancelBooking = async () => {
//     if (!user?.phone_number || !userBooking) return;
    
//     if (modificationsLocked) {
//       showCustomAlert('Cannot Cancel', 'Cancellation is locked within 15 minutes of departure.', 'warning');
//       setShowCancelModal(false);
//       return;
//     }
    
//     if (rideStarted) {
//       showCustomAlert('Cannot Cancel', 'Cannot cancel after ride has started.', 'warning');
//       setShowCancelModal(false);
//       return;
//     }

//     setCancelLoading(true);
//     try {
//       const response = await axios.put(`${API_BASE_URL}/booking/${userBooking.id}/cancel`);
      
//       if (response.data) {
//         showCustomAlert('Success', response.data.message || 'Booking cancelled successfully', 'success');
//         setUserBooking(null);
//         setSeatsRequested(1);
//         setHasPendingModification(false);
//         fetchRideDetails();
        
//         setTimeout(() => navigation.goBack(), 1500);
//       } else {
//         throw new Error('Failed to cancel booking');
//       }
//     } catch (error) {
//       console.error('Cancel booking error:', error);
//       const errorMsg = error.response?.data?.message || error.response?.data?.detail || error.message || 'Failed to cancel booking';
//       showCustomAlert('Error', errorMsg, 'error');
//     } finally {
//       setCancelLoading(false);
//       setShowCancelModal(false);
//     }
//   };

//   // Create new booking
//   const handleCreateBooking = async () => {
//     if (!user?.phone_number) {
//       showCustomAlert('Login Required', 'Please log in to request a ride.', 'warning');
//       return;
//     }

//     if (ride?.womenOnly === true && user?.gender !== 'female') {
//       showCustomAlert('Not Available', 'This ride is for women passengers only.', 'warning');
//       return;
//     }

//     const remainingSeats = totalRideSeats - otherBookedSeats;
    
//     if (seatsRequested > remainingSeats) {
//       showCustomAlert('Not Enough Seats', `Only ${remainingSeats} seat(s) left in this ride.`, 'warning');
//       return;
//     }

//     setRequestLoading(true);
//     try {
//       const payload = {
//         ride_id: ride.id,
//         passenger_phone: user.phone_number,
//         seats_requested: seatsRequested,
//       };

//       if (searchData?.fromCoords) payload.from_coords = searchData.fromCoords;
//       if (searchData?.toCoords) payload.to_coords = searchData.toCoords;

//       const response = await axios.post(`${API_BASE_URL}/ride-bookings`, payload);

//       if (response.data) {
//         showCustomAlert(
//           'Request Sent 📨', 
//           `Your request for ${seatsRequested} seat(s) has been sent to the driver. You will be notified when they respond.`,
//           'info'
//         );
        
//         setTimeout(() => {
//           checkUserBooking();
//           fetchRideDetails();
//         }, 1000);
//       } else {
//         throw new Error('Failed to send request');
//       }
      
//     } catch (error) {
//       console.error('Booking error:', error);
//       const errorMsg = error.response?.data?.message || error.response?.data?.detail || error.message || 'Failed to send request';
//       showCustomAlert('Error', errorMsg, 'error');
//     } finally {
//       setRequestLoading(false);
//     }
//   };

//   // Handle seat change - either direct modify or send modification request
//   const handleSeatChange = async () => {
//     if (rideAutoCancelled || rideCancelled) {
//       showCustomAlert('Ride Cancelled', 'This ride is no longer available.', 'warning');
//       return;
//     }
    
//     if (rideStarted) {
//       showCustomAlert('Cannot Modify', 'Cannot modify seats after ride has started.', 'warning');
//       return;
//     }
    
//     if (userBooking) {
//       // If booking is accepted, send modification request to driver
//       if (userBooking.status === 'accepted') {
//         if (hasPendingModification) {
//           showCustomAlert(
//             'Request Pending',
//             `You already have a pending modification request to change to ${pendingModificationSeats} seat(s). Please wait for driver response.`,
//             'warning'
//           );
//           return;
//         }
//         await handleRequestModification(seatsRequested);
//       } 
//       // If booking is pending, can modify directly
//       else if (userBooking.status === 'pending') {
//         await handleDirectModify(seatsRequested);
//       }
//     } else {
//       await handleCreateBooking();
//     }
//   };
  
//   // Direct modify for pending bookings
//   const handleDirectModify = async (newSeatCount) => {
//     if (!user?.phone_number || !userBooking) return;
    
//     if (newSeatCount < 1) {
//       showCustomAlert('Invalid Seats', 'You must book at least 1 seat.', 'warning');
//       return;
//     }
    
//     const maxSeats = totalRideSeats - otherBookedSeats;
//     if (newSeatCount > maxSeats) {
//       showCustomAlert('Not Enough Seats', `Only ${maxSeats} seat(s) available.`, 'warning');
//       return;
//     }
    
//     if (newSeatCount === userBooking.seats_requested) {
//       showCustomAlert('No Change', 'Seat count is already set to this value.', 'info');
//       return;
//     }
    
//     setModifyingSeats(true);
//     try {
//       const response = await axios.put(
//         `${API_BASE_URL}/booking/${userBooking.id}/modify-seats`,
//         { new_seats: newSeatCount }
//       );
      
//       if (response.data) {
//         showCustomAlert(
//           'Booking Updated ✅',
//           `Your booking has been updated from ${userBooking.seats_requested} to ${newSeatCount} seat(s).`,
//           'success'
//         );
        
//         setUserBooking({ ...userBooking, seats_requested: newSeatCount });
//         setSeatsRequested(newSeatCount);
//         fetchRideDetails();
//         checkUserBooking();
//       }
      
//     } catch (error) {
//       console.error('Modification error:', error);
      
//       let errorMsg = 'Failed to modify booking';
//       if (error.response?.data?.detail) {
//         errorMsg = error.response.data.detail;
//       } else if (error.response?.data?.message) {
//         errorMsg = error.response.data.message;
//       } else if (error.response?.data?.error) {
//         errorMsg = error.response.data.error;
//       } else if (error.message) {
//         errorMsg = error.message;
//       }
      
//       showCustomAlert('Error', errorMsg, 'error');
//     } finally {
//       setModifyingSeats(false);
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
//       if (!myPhone) return null;
//       const response = await axios.post(`${API_BASE_URL}/api/chat/conversations`, {
//         participant_phone: receiverPhone,
//         ride_id: rideId
//       }, {
//         headers: { 'X-Phone-Number': myPhone }
//       });
//       return response.data?.success ? response.data.conversation.id : null;
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
//           user: { name: driverProfile?.full_name || ride?.driverName || 'Driver', tripInfo: `${ride.from} → ${ride.to}` },
//         });
//       } else {
//         showCustomAlert('Chat', 'Unable to start chat.', 'error');
//       }
//     } else {
//       showCustomAlert('Chat', 'Driver contact not available', 'warning');
//     }
//   };

//   // Show loading screen during initial load
//   if (loadingInitial || (loadingProfile && !driverProfile)) {
//     return (
//       <View style={styles.loaderContainer}>
//         <LottieView source={require("../assets/loading.json")} autoPlay loop style={{ width: 300, height: 300 }} />
//         <Text style={styles.loadingText}>Loading ride details...</Text>
//       </View>
//     );
//   }

//   if (!ride) {
//     return (
//       <View style={styles.centerContainer}>
//         <Text style={styles.errorText}>No ride data available</Text>
//         <TouchableOpacity onPress={() => navigation.goBack()} style={styles.fallbackBtn}>
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

//   const isBooked = !!userBooking;
//   const isAccepted = isBooked && userBooking.status === 'accepted';
//   const isPending = isBooked && userBooking.status === 'pending';
  
//   const remainingForOthers = totalRideSeats - otherBookedSeats;
//   const maxSelectable = isBooked ? totalRideSeats : remainingForOthers;
//   const currentBookedSeats = userBooking?.seats_requested || 0;
  
//   const canRequestModification = isAccepted && !modificationsLocked && !rideStarted && !rideAutoCancelled && !rideCancelled && !hasPendingModification;
//   const canCancel = (isAccepted || isPending) && !modificationsLocked && !rideStarted && !rideAutoCancelled && !rideCancelled;
  
//   // Get warning message based on ride status
//   const getRideStatusMessage = () => {
//     if (rideAutoCancelled) {
//       return { message: "This ride has been auto-cancelled as the driver did not start on time.", type: 'error', icon: 'alert-circle' };
//     }
//     if (rideCancelled) {
//       return { message: "This ride has been cancelled by the driver.", type: 'error', icon: 'close-circle' };
//     }
//     if (rideStarted) {
//       return { message: "Ride in progress! You can track the driver's location.", type: 'success', icon: 'car-sport' };
//     }
//     if (modificationsLocked && isAccepted) {
//       return { message: `Modifications locked - Departure in ${Math.abs(minutesToDeparture)} minutes`, type: 'warning', icon: 'lock-closed' };
//     }
//     if (minutesToDeparture <= 0 && minutesToDeparture > -30 && !rideStarted) {
//       return { message: `⚠️ Ride is ${Math.abs(minutesToDeparture)} minutes late. Driver must start within ${30 - Math.abs(minutesToDeparture)} minutes.`, type: 'warning', icon: 'time-outline' };
//     }
//     if (minutesToDeparture > 0 && minutesToDeparture <= 15) {
//       return { message: `Ride starts in ${minutesToDeparture} minutes`, type: 'info', icon: 'time-outline' };
//     }
//     return null;
//   };
  
//   const statusMessage = getRideStatusMessage();

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
//             <Polyline coordinates={routePath} strokeColor="#2457A6" strokeWidth={5} lineCap="round" lineJoin="round" />
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
//             <Polyline coordinates={walkToPickupPath} strokeColor="#FACC15" strokeWidth={4} strokeDasharray={[8, 6]} lineCap="round" lineJoin="round" />
//           )}

//           {walkFromDropPath.length >= 2 && (
//             <Polyline coordinates={walkFromDropPath} strokeColor="#FACC15" strokeWidth={4} strokeDasharray={[8, 6]} lineCap="round" lineJoin="round" />
//           )}
//         </MapView>

//         <TouchableOpacity style={styles.mapBackButton} onPress={() => navigation.goBack()}>
//           <Ionicons name="chevron-back" size={26} color={Colors.secondary} />
//         </TouchableOpacity>
//       </Animated.View>

//       <Animated.View style={[styles.drawer, { height: drawerHeight }]}>
//         <View style={styles.handleWrap} {...panResponder.panHandlers}>
//           <TouchableOpacity activeOpacity={0.9} onPress={toggleDrawer} style={styles.handleHitArea}>
//             <View style={styles.handleBar} />
//           </TouchableOpacity>
//         </View>

//         {!drawerExpanded ? (
//           <View style={styles.collapsedSummary}>
//             <View style={styles.collapsedTopRow}>
//               <View style={{ flex: 1 }}>
//                 <Text style={styles.collapsedDriver} numberOfLines={1}>{driverProfile?.full_name || ride?.driverName || 'Driver'}</Text>
//                 <Text style={styles.collapsedSub} numberOfLines={1}>{ride.from} → {ride.to}</Text>
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
//               refreshControl={
//                 <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[Colors.primary]} tintColor={Colors.primary} />
//               }
//             >
//               {/* Ride Status Banner */}
//               {statusMessage && (
//                 <View style={[styles.statusBanner, { backgroundColor: statusMessage.type === 'error' ? '#FEF2F2' : statusMessage.type === 'warning' ? '#FFFBEB' : '#E8F5E9' }]}>
//                   <Ionicons name={statusMessage.icon} size={20} color={statusMessage.type === 'error' ? '#DC2626' : statusMessage.type === 'warning' ? '#F59E0B' : '#10B981'} />
//                   <Text style={[styles.statusBannerText, { color: statusMessage.type === 'error' ? '#DC2626' : statusMessage.type === 'warning' ? '#92400E' : '#166534', flex: 1 }]}>
//                     {statusMessage.message}
//                   </Text>
//                 </View>
//               )}
              
//               {/* Modification Lock Warning */}
//               {modificationsLocked && isAccepted && !rideStarted && !rideAutoCancelled && (
//                 <View style={styles.modificationsLockedBanner}>
//                   <Ionicons name="lock-closed" size={16} color="#DC2626" />
//                   <Text style={styles.modificationsLockedText}>
//                     Modifications locked - Cannot change seats within 15 minutes of departure
//                   </Text>
//                 </View>
//               )}

//               <View style={styles.driverCard}>
//                 <View style={styles.driverTopRow}>
//                   <View style={styles.driverLeftWrap}>
//                     <TouchableOpacity style={styles.driverAvatar} onPress={handleProfileImagePress} activeOpacity={0.8}>
//                       {profilePhotoUrl ? (
//                         isProfilePhotoSvg ? (
//                           <View style={styles.svgAvatarContainer}><SvgCssUri uri={profilePhotoUrl} width={56} height={56} /></View>
//                         ) : (
//                           <Image source={{ uri: profilePhotoUrl }} style={styles.avatarImg} />
//                         )
//                       ) : (
//                         <Text style={styles.avatarText}>{avatarText}</Text>
//                       )}
//                     </TouchableOpacity>
//                     <View style={styles.driverMeta}>
//                       <View style={styles.driverNameRow}>
//                         <Text style={styles.driverName}>{driverProfile?.full_name || ride?.driverName || 'Driver'}</Text>
//                         {isVerified && (
//                           <View style={styles.verifiedBadge}>
//                             <Ionicons name="checkmark-circle" size={12} color="#2457A6" />
//                             <Text style={styles.verifiedBadgeText}>Verified</Text>
//                           </View>
//                         )}
//                       </View>
//                       <View style={styles.ratingRow}>
//                         <Ionicons name="star" size={13} color="#F59E0B" />
//                         <Text style={styles.ratingText}>{driverProfile?.avg_rating || ride?.rating || 4.5}</Text>
//                       </View>
//                     </View>
//                   </View>
//                   <TouchableOpacity style={styles.chatButtonCircle} onPress={startChat}>
//                     <Ionicons name="chatbubble-outline" size={20} color="#2457A6" />
//                   </TouchableOpacity>
//                 </View>
//                 <Text style={styles.driverBio}>{driverProfile?.bio || driverProfile?.about || 'Friendly driver, love meeting new people!'}</Text>
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
//                       <Text style={styles.timelinePlace}>{ride.pickupLabel || ride.from}</Text>
//                       <View style={styles.timelineMetaRow}>
//                         <Ionicons name="time-outline" size={13} color={Colors.gray} />
//                         <Text style={styles.timelineMetaText}>{ride.date} at {ride.time}</Text>
//                       </View>
//                     </View>
//                     <View style={styles.timelineItem}>
//                       <Text style={styles.timelineLabel}>Dropoff</Text>
//                       <Text style={styles.timelinePlace}>{ride.dropLabel || ride.to}</Text>
//                       <Text style={styles.timelineMetaText}>Estimated: {ride.durationText || '--'}</Text>
//                     </View>
//                   </View>
//                 </View>
//               </View>

//               <View style={styles.cardSection}>
//                 <Text style={styles.sectionTitle}>Vehicle Details</Text>
//                 <View style={styles.vehicleHeaderRow}>
//                   <View style={styles.vehicleIconCircle}><Ionicons name="car-sport-outline" size={18} color="#2457A6" /></View>
//                   <View style={styles.vehicleMeta}>
//                     <Text style={styles.vehicleTitle}>{vehicleName}</Text>
//                     <Text style={styles.vehicleSub}>{vehicleColor} • {totalRideSeats} seats total</Text>
//                     {vehicleRegNumber && (
//                       <View style={styles.vehicleRegContainer}>
//                         <Text style={styles.vehicleRegText}>Vehicle Number: {vehicleRegNumber}</Text>
//                       </View>
//                     )}
//                   </View>
//                 </View>
//               </View>

//               <View style={styles.cardSection}>
//                 <Text style={styles.sectionTitle}>Ride Preferences</Text>
//                 <View style={styles.tagRow}>
//                   {allPreferences.length > 0 ? (
//                     allPreferences.map((pref, index) => <GenericPreferenceTag key={`${pref}-${index}`} label={pref} />)
//                   ) : (
//                     <Text style={styles.emptyText}>No specific preferences added</Text>
//                   )}
//                 </View>
//               </View>

//               <View style={styles.cardSection}>
//                 <Text style={styles.sectionTitle}>Cost Breakdown</Text>
//                 <View style={styles.priceRow}>
//                   <Text style={styles.priceLabel}>Base fare (per seat)</Text>
//                   <Text style={styles.priceValue}>₹{ride.price}</Text>
//                 </View>
//                 <View style={styles.priceDivider} />
//                 <View style={styles.priceRow}>
//                   <Text style={styles.totalLabel}>Total for {seatsRequested} seat(s)</Text>
//                   <Text style={styles.totalValue}>₹{totalPrice}</Text>
//                 </View>
//                 <View style={styles.noticeBox}>
//                   <Text style={styles.noticeText}>Cost-share contribution - sharing travel costs with the driver.</Text>
//                 </View>
//               </View>

//               <View style={styles.cardSection}>
//                 <Text style={styles.sectionTitle}>{isBooked ? 'Your Booking' : 'Select Seats'}</Text>
                
//                 <View style={styles.seatInfoBox}>
//                   <Text style={styles.seatInfoText}>
//                     🚗 Total seats in vehicle: <Text style={styles.seatInfoBold}>{totalRideSeats}</Text>
//                   </Text>
//                   {otherBookedSeats > 0 && !isBooked && (
//                     <Text style={styles.seatInfoText}>
//                       👥 Other passengers booked: <Text style={styles.seatInfoBold}>{otherBookedSeats}</Text> seat(s)
//                     </Text>
//                   )}
//                   {isBooked && (
//                     <Text style={styles.seatInfoText}>
//                       ✅ You have booked: <Text style={styles.seatInfoBold}>{currentBookedSeats}</Text> seat(s)
//                     </Text>
//                   )}
//                   <Text style={styles.seatInfoText}>
//                     📍 Seats available: <Text style={styles.seatInfoBold}>{remainingForOthers}</Text> seat(s)
//                   </Text>
//                 </View>
                
//                 {/* Pending Modification Request Card */}
//                 {hasPendingModification && pendingModificationDetails && isAccepted && (
//                   <View style={styles.pendingModificationCard}>
//                     <View style={styles.pendingModificationHeader}>
//                       <Ionicons name="time-outline" size={24} color="#F59E0B" />
//                       <Text style={styles.pendingModificationTitle}>Modification Request Pending</Text>
//                     </View>
//                     <Text style={styles.pendingModificationText}>
//                       Requested to change from <Text style={styles.oldSeatCount}>{pendingModificationDetails.current_seats}</Text> 
//                       {' → '}
//                       <Text style={styles.newSeatCount}>{pendingModificationDetails.requested_seats}</Text> seat(s)
//                     </Text>
//                     <Text style={styles.pendingModificationSubtext}>
//                       Your request has been sent to the driver. You will be notified once they respond.
//                     </Text>
//                     <TouchableOpacity 
//                       style={styles.cancelRequestButton} 
//                       onPress={handleCancelModificationRequest}
//                       disabled={modifyingSeats}>
//                       <Text style={styles.cancelRequestButtonText}>
//                         {modifyingSeats ? 'Cancelling...' : 'Cancel Request'}
//                       </Text>
//                     </TouchableOpacity>
//                   </View>
//                 )}
                
//                 {isBooked && (
//                   <View style={[styles.currentBookingContainer, isAccepted && styles.confirmedBookingContainer]}>
//                     {isPending ? (
//                       <>
//                         <Ionicons name="time-outline" size={24} color="#F59E0B" />
//                         <Text style={styles.pendingBookingTitle}>
//                           ⏳ Waiting for Driver Confirmation
//                         </Text>
//                         <Text style={styles.currentBookingText}>
//                           You have requested {userBooking.seats_requested} seat(s) for this ride.
//                         </Text>
//                         <Text style={styles.currentBookingHint}>
//                           You can modify or cancel your request anytime. The driver will notify you once confirmed.
//                         </Text>
//                       </>
//                     ) : (
//                       <>
//                         <Ionicons name="checkmark-circle" size={24} color="#10B981" />
//                         <Text style={styles.confirmedBookingTitle}>
//                           ✅ Booking Confirmed!
//                         </Text>
//                         <Text style={styles.currentBookingText}>
//                           You have booked {userBooking.seats_requested} seat(s) for this ride.
//                         </Text>
//                         <Text style={styles.currentBookingHint}>
//                           {modificationsLocked 
//                             ? "Modifications are locked within 15 minutes of departure." 
//                             : "You can request a seat change anytime before the ride starts."}
//                         </Text>
//                       </>
//                     )}
//                   </View>
//                 )}
                
//                 {/* Seat Selector - Only show if ride is not cancelled/auto-cancelled and not started */}
//                 {!rideStarted && !rideAutoCancelled && !rideCancelled && (
//                   <>
//                     <View style={styles.seatSelectorRow}>
//                       <TouchableOpacity
//                         style={[styles.seatActionBtn, (seatsRequested === 1 || modifyingSeats || requestLoading) && styles.seatActionBtnDisabled]}
//                         onPress={() => setSeatsRequested(Math.max(1, seatsRequested - 1))}
//                         disabled={seatsRequested === 1 || modifyingSeats || requestLoading}
//                       >
//                         <Ionicons name="remove" size={20} color={seatsRequested === 1 ? Colors.gray : Colors.dark} />
//                       </TouchableOpacity>

//                       <View style={styles.seatCountWrap}>
//                         <Text style={styles.seatCountText}>{seatsRequested}</Text>
//                         <Text style={styles.seatAvailableText}>
//                           / {maxSelectable} {isBooked ? 'total' : 'available'}
//                         </Text>
//                       </View>

//                       <TouchableOpacity
//                         style={[styles.seatActionBtn, (seatsRequested === maxSelectable || modifyingSeats || requestLoading) && styles.seatActionBtnDisabled]}
//                         onPress={() => setSeatsRequested(Math.min(maxSelectable, seatsRequested + 1))}
//                         disabled={seatsRequested === maxSelectable || modifyingSeats || requestLoading}
//                       >
//                         <Ionicons name="add" size={20} color={seatsRequested === maxSelectable ? Colors.gray : "#2457A6"} />
//                       </TouchableOpacity>
//                     </View>
                    
//                     {isAccepted && seatsRequested !== currentBookedSeats && !hasPendingModification && (
//                       <View style={styles.priceDifferenceContainer}>
//                         <Text style={styles.priceDifferenceText}>
//                           {seatsRequested > currentBookedSeats 
//                             ? `+ ₹${ride.price * (seatsRequested - currentBookedSeats)} will be charged if approved`
//                             : `- ₹${ride.price * (currentBookedSeats - seatsRequested)} will be refunded if approved`}
//                         </Text>
//                         <Text style={styles.approvalNoteText}>* Changes require driver approval</Text>
//                       </View>
//                     )}
                    
//                     {!isBooked && (
//                       <View style={styles.seatInfoNote}>
//                         <Text style={styles.seatInfoNoteText}>💡 You can modify or cancel anytime before the ride starts.</Text>
//                       </View>
//                     )}
//                   </>
//                 )}
                
//                 {/* Cancel Booking Button */}
//                 {canCancel && (
//                   <TouchableOpacity 
//                     style={styles.cancelBookingBtn} 
//                     onPress={() => setShowCancelModal(true)} 
//                     disabled={cancelLoading}
//                   >
//                     <Text style={styles.cancelBookingBtnText}>
//                       {isPending ? 'Cancel Request' : 'Cancel Booking'}
//                     </Text>
//                   </TouchableOpacity>
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

//             {/* Bottom Action Button */}
//             {(rideStarted || rideAutoCancelled || rideCancelled) ? null : (
//               <View style={styles.bottomBar}>
//                 <View>
//                   <Text style={styles.bottomCaption}>
//                     {isAccepted && hasPendingModification ? 'Requested total' : `Total for ${seatsRequested} seat(s)`}
//                   </Text>
//                   <Text style={styles.bottomTotal}>₹{totalPrice}</Text>
//                 </View>

//                 <TouchableOpacity
//                   style={[
//                     styles.bookNowBtn, 
//                     (requestLoading || cancelLoading || modifyingSeats) && styles.bookNowBtnDisabled,
//                     isAccepted && styles.modifyBtn,
//                     (modificationsLocked && isAccepted) && styles.disabledBtn
//                   ]}
//                   onPress={handleSeatChange}
//                   disabled={requestLoading || cancelLoading || modifyingSeats || (modificationsLocked && isAccepted) || rideStarted || rideAutoCancelled || rideCancelled}
//                 >
//                   <Text style={styles.bookNowText}>
//                     {requestLoading ? 'Sending Request...' :
//                      cancelLoading ? 'Cancelling...' :
//                      modifyingSeats ? 'Sending...' :
//                      modificationsLocked && isAccepted ? 'Modifications Locked' :
//                      isAccepted ? (hasPendingModification ? 'Request Pending' : 'Request Change') :
//                      isPending ? 'Update Booking' :
//                      'Request Ride'}
//                   </Text>
//                 </TouchableOpacity>
//               </View>
//             )}
//           </>
//         )}
//       </Animated.View>

//       {/* Conflict Resolution Modal - For driver awareness */}
//       <Modal visible={conflictModalVisible} transparent={true} animationType="fade" onRequestClose={() => setConflictModalVisible(false)}>
//         <View style={styles.modalBackdrop}>
//           <View style={styles.conflictModalContent}>
//             <View style={styles.conflictModalHeader}>
//               <Ionicons name="alert-circle" size={48} color="#F59E0B" />
//               <Text style={styles.conflictModalTitle}>Multiple Requests Detected</Text>
//             </View>
            
//             <Text style={styles.conflictModalMessage}>
//               There are multiple requests for this ride. The driver needs to choose which one to accept.
//               Your request may be affected by the driver's decision.
//             </Text>
            
//             {conflictData?.modification_request && (
//               <View style={styles.conflictRequestCard}>
//                 <View style={styles.conflictRequestHeader}>
//                   <Ionicons name="swap" size={24} color="#F59E0B" />
//                   <Text style={styles.conflictRequestTitle}>Modification Request</Text>
//                 </View>
//                 <Text style={styles.conflictRequestDetails}>
//                   <Text style={{ fontWeight: 'bold' }}>Rider:</Text> {conflictData.modification_request.passenger_name}
//                 </Text>
//                 <Text style={styles.conflictRequestDetails}>
//                   <Text style={{ fontWeight: 'bold' }}>Seats:</Text> {conflictData.modification_request.current_seats} → {conflictData.modification_request.requested_seats}
//                 </Text>
//               </View>
//             )}
            
//             {conflictData?.booking_request && (
//               <View style={styles.conflictRequestCard}>
//                 <View style={styles.conflictRequestHeader}>
//                   <Ionicons name="person-add" size={24} color="#10B981" />
//                   <Text style={styles.conflictRequestTitle}>New Booking Request</Text>
//                 </View>
//                 <Text style={styles.conflictRequestDetails}>
//                   <Text style={{ fontWeight: 'bold' }}>Rider:</Text> {conflictData.booking_request.passenger_name}
//                 </Text>
//                 <Text style={styles.conflictRequestDetails}>
//                   <Text style={{ fontWeight: 'bold' }}>Seats:</Text> {conflictData.booking_request.seats_requested} seat(s)
//                 </Text>
//               </View>
//             )}
            
//             <Text style={styles.conflictModalSeatsInfo}>
//               Available seats: {conflictData?.available_seats} / {conflictData?.total_seats}
//             </Text>
            
//             <Text style={styles.conflictModalNote}>
//               The driver will choose which request to accept. If another request is chosen, yours will be automatically rejected.
//             </Text>
            
//             <TouchableOpacity 
//               style={styles.conflictModalCloseBtn} 
//               onPress={() => {
//                 setConflictModalVisible(false);
//                 onRefresh(); // Refresh to get latest status
//               }}>
//               <Text style={styles.conflictModalCloseBtnText}>I Understand</Text>
//             </TouchableOpacity>
//           </View>
//         </View>
//       </Modal>

//       {/* Cancel Booking Modal */}
//       <Modal visible={showCancelModal} transparent={true} animationType="fade" onRequestClose={() => setShowCancelModal(false)}>
//         <View style={styles.modalBackdrop}>
//           <View style={styles.confirmModalContainer}>
//             <View style={styles.confirmModalContent}>
//               <View style={styles.confirmModalHeader}>
//                 <Ionicons name="alert-circle" size={40} color="#F59E0B" />
//                 <Text style={styles.confirmModalTitle}>
//                   {isPending ? 'Cancel Request?' : 'Cancel Booking?'}
//                 </Text>
//               </View>
//               <Text style={styles.confirmModalMessage}>
//                 {isPending 
//                   ? 'Are you sure you want to cancel your ride request?'
//                   : 'Are you sure you want to cancel your booking? This action cannot be undone.'}
//               </Text>
//               <View style={styles.confirmModalButtons}>
//                 <TouchableOpacity style={[styles.confirmModalBtn, styles.confirmModalCancelBtn]} onPress={() => setShowCancelModal(false)}>
//                   <Text style={styles.confirmModalCancelBtnText}>No, Keep</Text>
//                 </TouchableOpacity>
//                 <TouchableOpacity style={[styles.confirmModalBtn, styles.confirmModalConfirmBtn]} onPress={handleCancelBooking}>
//                   <Text style={styles.confirmModalConfirmBtnText}>Yes, Cancel</Text>
//                 </TouchableOpacity>
//               </View>
//             </View>
//           </View>
//         </View>
//       </Modal>

//       <ProfileImageModal visible={selectedProfile.visible} imageUrl={selectedProfile.imageUrl} driverName={selectedProfile.driverName} onClose={() => setSelectedProfile({ visible: false, imageUrl: null, driverName: '' })} />

//       <CustomAlert visible={alertVisible} title={alertConfig.title} message={alertConfig.message} icon={alertConfig.icon} iconColor={alertConfig.iconColor} buttons={alertConfig.buttons} onBackdropPress={() => setAlertVisible(false)} />
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
//   pinIcon: { fontSize: 14, fontWeight: '800', color: 'white', textAlign: 'center', lineHeight: 18 },
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
//   statusBanner: { flexDirection: 'row', alignItems: 'center', padding: 12, borderRadius: 12, marginBottom: 14, gap: 8 },
//   statusBannerText: { fontSize: 13, fontWeight: '700' },
//   modificationsLockedBanner: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#FEF2F2', padding: 12, borderRadius: 12, marginBottom: 14, gap: 8, borderWidth: 1, borderColor: '#FEE2E2' },
//   modificationsLockedText: { fontSize: 12, color: '#DC2626', flex: 1 },
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
//   seatInfoBox: { backgroundColor: '#F0F9FF', borderRadius: 12, padding: 12, marginBottom: 16 },
//   seatInfoText: { fontSize: 13, color: Colors.dark, marginBottom: 4 },
//   seatInfoBold: { fontWeight: '800', color: Colors.primary },
//   currentBookingContainer: { backgroundColor: '#EFF6FF', borderRadius: 12, padding: 16, marginBottom: 16, alignItems: 'center' },
//   confirmedBookingContainer: { backgroundColor: '#E8F5E9' },
//   pendingBookingTitle: { fontSize: 16, fontWeight: '700', color: '#F59E0B', marginTop: 8, marginBottom: 4 },
//   confirmedBookingTitle: { fontSize: 16, fontWeight: '700', color: '#10B981', marginTop: 8, marginBottom: 4 },
//   currentBookingText: { fontSize: 14, color: Colors.dark, textAlign: 'center', marginBottom: 4 },
//   currentBookingHint: { fontSize: 12, color: Colors.gray, textAlign: 'center' },
//   pendingModificationCard: { backgroundColor: '#FFFBEB', borderRadius: 12, padding: 16, marginBottom: 16, borderWidth: 1, borderColor: '#FDE68A' },
//   pendingModificationHeader: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 12 },
//   pendingModificationTitle: { fontSize: 14, fontWeight: '700', color: '#92400E' },
//   pendingModificationText: { fontSize: 13, color: '#B45309', marginBottom: 8, textAlign: 'center' },
//   pendingModificationSubtext: { fontSize: 11, color: '#B45309', textAlign: 'center', marginBottom: 12 },
//   oldSeatCount: { textDecorationLine: 'line-through', fontWeight: '700', color: '#DC2626' },
//   newSeatCount: { fontWeight: '700', color: '#10B981' },
//   cancelRequestButton: { backgroundColor: '#FEF2F2', paddingVertical: 10, borderRadius: 8, borderWidth: 1, borderColor: '#EF4444', alignItems: 'center' },
//   cancelRequestButtonText: { color: '#EF4444', fontWeight: '600', fontSize: 14 },
//   seatInfoNote: { marginTop: 12, backgroundColor: '#FEF3C7', borderRadius: 8, padding: 10 },
//   seatInfoNoteText: { fontSize: 11, color: '#92400E', textAlign: 'center' },
//   priceDifferenceContainer: { marginTop: 12, padding: 10, backgroundColor: '#EFF6FF', borderRadius: 8, alignItems: 'center' },
//   priceDifferenceText: { fontSize: 12, color: '#2457A6', fontWeight: '600' },
//   approvalNoteText: { fontSize: 10, color: '#6B7280', marginTop: 4 },
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
//   seatSelectorRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: '#FAFAFB', borderRadius: 18, padding: 14 },
//   seatActionBtn: { width: 38, height: 38, borderRadius: 12, borderWidth: 1, borderColor: '#D6DDE7', alignItems: 'center', justifyContent: 'center', backgroundColor: 'white' },
//   seatActionBtnDisabled: { opacity: 0.5, backgroundColor: '#F5F5F5' },
//   seatCountWrap: { flexDirection: 'row', alignItems: 'baseline' },
//   seatCountText: { fontSize: 28, fontWeight: '900', color: Colors.dark },
//   seatAvailableText: { fontSize: 13, color: Colors.gray, marginLeft: 6, fontWeight: '600' },
//   cancelBookingBtn: { marginTop: 16, backgroundColor: '#FEF2F2', paddingVertical: 12, borderRadius: 12, alignItems: 'center', borderWidth: 1, borderColor: '#EF4444' },
//   cancelBookingBtnText: { color: '#EF4444', fontWeight: '700', fontSize: 14 },
//   simpleInfoLeft: { flexDirection: 'row', alignItems: 'center', gap: 8 },
//   safetyCard: { backgroundColor: '#FFF3E7', borderRadius: 18, padding: 16, marginBottom: 14 },
//   safetyTitle: { fontSize: 14, color: '#2457A6', fontWeight: '800' },
//   safetySub: { marginTop: 2, fontSize: 12, color: '#2457A6', opacity: 0.9, fontWeight: '600' },
//   bottomBar: { position: 'absolute', left: 0, right: 0, bottom: 0, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 16, paddingTop: 12, paddingBottom: Platform.OS === 'ios' ? 28 : 16, backgroundColor: 'white', borderTopWidth: 1, borderTopColor: '#ECEEF2' },
//   bottomCaption: { fontSize: 12, color: Colors.gray, fontWeight: '500' },
//   bottomTotal: { fontSize: 26, color: Colors.dark, fontWeight: '900', marginTop: 2 },
//   bookNowBtn: { backgroundColor: '#FF7A00', paddingHorizontal: 24, paddingVertical: 14, borderRadius: 22, minWidth: 128, alignItems: 'center', justifyContent: 'center' },
//   modifyBtn: { backgroundColor: '#2457A6' },
//   disabledBtn: { backgroundColor: '#9CA3AF', opacity: 0.6 },
//   bookNowBtnDisabled: { opacity: 0.7 },
//   bookNowText: { color: 'white', fontSize: 16, fontWeight: '800' },
//   loaderContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#fff' },
//   loadingText: { marginTop: 16, fontSize: 14, color: Colors.gray },
//   modalBackdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center' },
//   confirmModalContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
//   confirmModalContent: { backgroundColor: 'white', borderRadius: 24, padding: 24, width: '85%', alignItems: 'center' },
//   confirmModalHeader: { alignItems: 'center', marginBottom: 16 },
//   confirmModalTitle: { fontSize: 20, fontWeight: '800', color: Colors.dark, marginTop: 12 },
//   confirmModalMessage: { fontSize: 14, color: Colors.gray, textAlign: 'center', marginBottom: 24, lineHeight: 20 },
//   confirmModalButtons: { flexDirection: 'row', gap: 12, width: '100%' },
//   confirmModalBtn: { flex: 1, paddingVertical: 12, borderRadius: 12, alignItems: 'center' },
//   confirmModalCancelBtn: { backgroundColor: '#F3F4F6' },
//   confirmModalCancelBtnText: { color: Colors.dark, fontWeight: '700' },
//   confirmModalConfirmBtn: { backgroundColor: '#EF4444' },
//   confirmModalConfirmBtnText: { color: 'white', fontWeight: '700' },
//   imageModalContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', width: '100%' },
//   imageModalContent: { width: '90%', backgroundColor: Colors.white, borderRadius: 20, overflow: 'hidden', maxHeight: '80%' },
//   imageModalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 16, borderBottomWidth: 1, borderBottomColor: '#EEF2F7' },
//   imageModalTitle: { fontSize: 18, fontWeight: '700', color: Colors.dark },
//   fullProfileImage: { width: '100%', height: 400, backgroundColor: '#F5F5F5' },
//   modalSvgContainer: { width: '100%', height: 400, backgroundColor: '#F5F5F5', alignItems: 'center', justifyContent: 'center' },
//   noImageContainer: { width: '100%', height: 400, justifyContent: 'center', alignItems: 'center', backgroundColor: '#F5F5F5' },
//   noImageText: { fontSize: 16, color: Colors.gray },
  
//   // Conflict Modal Styles
//   conflictModalContent: { backgroundColor: "#fff", borderRadius: 24, padding: 20, width: "90%", maxHeight: "85%" },
//   conflictModalHeader: { alignItems: "center", marginBottom: 16 },
//   conflictModalTitle: { fontSize: 18, fontWeight: "700", color: Colors.dark, marginTop: 12, textAlign: "center" },
//   conflictModalMessage: { fontSize: 14, color: Colors.gray, textAlign: "center", marginBottom: 16, lineHeight: 20 },
//   conflictRequestCard: { backgroundColor: "#F9FAFB", borderRadius: 16, padding: 16, marginBottom: 12, borderWidth: 1, borderColor: "#E5E7EB" },
//   conflictRequestHeader: { flexDirection: "row", alignItems: "center", gap: 12, marginBottom: 12 },
//   conflictRequestTitle: { fontSize: 16, fontWeight: "700", color: Colors.dark },
//   conflictRequestDetails: { fontSize: 14, color: "#4B5563", marginBottom: 4 },
//   conflictModalSeatsInfo: { fontSize: 13, color: Colors.gray, textAlign: "center", marginBottom: 12, fontWeight: "600" },
//   conflictModalNote: { fontSize: 12, color: "#F59E0B", textAlign: "center", marginBottom: 16, fontStyle: "italic" },
//   conflictModalCloseBtn: { paddingVertical: 14, alignItems: "center", borderRadius: 12, backgroundColor: Colors.primary },
//   conflictModalCloseBtnText: { color: "#fff", fontWeight: "700", fontSize: 16 },
// });
import { LogBox } from 'react-native';

// Ignore accessibility warnings immediately
LogBox.ignoreLogs([
  'Accessibility: View',
  'Property accessibilityState',
  'RCTView',
  'TouchableOpacity'
]);

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
  Modal,
  ActivityIndicator,
  RefreshControl,
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
import io from 'socket.io-client';
import axios from 'axios';

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
    return { longitude: Number(point[0]), latitude: Number(point[1]) };
  }
  if (point.lng != null && point.lat != null) {
    return { longitude: Number(point.lng), latitude: Number(point.lat) };
  }
  if (point.longitude != null && point.latitude != null) {
    return { longitude: Number(point.longitude), latitude: Number(point.latitude) };
  }
  return null;
}

function parseRouteCoordinates(routeCoordinates) {
  if (!Array.isArray(routeCoordinates)) return [];
  return routeCoordinates.map((item) => {
    if (Array.isArray(item) && item.length === 2) {
      return { longitude: Number(item[0]), latitude: Number(item[1]) };
    }
    return parseSuggestedPoint(item);
  }).filter(Boolean);
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
    try { ridePrefs = JSON.parse(ridePrefs); } catch (e) { ridePrefs = null; }
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
      if (value === true) allPreferences.push(formattedKey);
    } else if (Array.isArray(value)) {
      if (value.length > 0) allPreferences.push(`${formattedKey}: ${value.join(', ')}`);
    } else if (typeof value === 'object') {
      allPreferences.push(...extractFromObject(value));
    } else if (typeof value === 'string' && value.trim()) {
      const lowerValue = value.toLowerCase();
      if (!['false', 'no', 'none', 'null', 'undefined'].includes(lowerValue)) {
        allPreferences.push(`${formattedKey}: ${value}`);
      }
    } else if (typeof value === 'number') {
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
    tagColor = '#E8F5E9'; textColor = '#2E7D32';
  } else if (lowerLabel.includes('chat') || lowerLabel.includes('talk')) {
    tagColor = '#E3F2FD'; textColor = '#1565C0';
  } else if (lowerLabel.includes('gender')) {
    tagColor = '#F3E5F5'; textColor = '#6A1B9A';
  } else if (lowerLabel.includes('language') || lowerLabel.includes('speak')) {
    tagColor = '#FFF9C4'; textColor = '#F57F17';
  } else if (lowerLabel.includes('verified')) {
    tagColor = '#E8F5E9'; textColor = '#2E7D32';
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
              <TouchableOpacity onPress={onClose}><Ionicons name="close" size={24} color={Colors.dark} /></TouchableOpacity>
            </View>
            {imageUrl && imageUrl !== 'null' && imageUrl !== 'undefined' ? (
              isSvg ? (
                <View style={styles.modalSvgContainer}><SvgCssUri uri={imageUrl} width="100%" height={400} /></View>
              ) : (
                <Image source={{ uri: imageUrl }} style={styles.fullProfileImage} resizeMode="contain" />
              )
            ) : (
              <View style={styles.noImageContainer}><Text style={styles.noImageText}>No profile picture available</Text></View>
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
  const [loadingProfile, setLoadingProfile] = useState(true);
  const [loadingInitial, setLoadingInitial] = useState(true);
  const [mapReady, setMapReady] = useState(false);
  const [userBooking, setUserBooking] = useState(null);
  const [showCancelModal, setShowCancelModal] = useState(false);
  
  // States for seat modification
  const [modifyingSeats, setModifyingSeats] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  
  // State for actual seat availability
  const [totalRideSeats, setTotalRideSeats] = useState(ride?.totalSeats || ride?.available_seats || 4);
  const [otherBookedSeats, setOtherBookedSeats] = useState(0);
  const [rideDetails, setRideDetails] = useState(null);
  
  // Modification request state - ONE TIME ONLY
  const [hasUsedModification, setHasUsedModification] = useState(false);
  const [hasPendingModification, setHasPendingModification] = useState(false);
  const [pendingModificationDetails, setPendingModificationDetails] = useState(null);
  const [pendingModificationSeats, setPendingModificationSeats] = useState(null);
  
  // Ride status states
  const [rideStarted, setRideStarted] = useState(ride?.started_at || false);
  const [rideCancelled, setRideCancelled] = useState(ride?.cancellation_reason ? true : false);
  const [rideAutoCancelled, setRideAutoCancelled] = useState(false);
  const [minutesToDeparture, setMinutesToDeparture] = useState(null);
  const [modificationsLocked, setModificationsLocked] = useState(false);
  
  // Conflict resolution states
  const [conflictModalVisible, setConflictModalVisible] = useState(false);
  const [conflictData, setConflictData] = useState(null);
  const [resolvingConflict, setResolvingConflict] = useState(false);
  
  const animatedDrawer = useRef(new Animated.Value(1)).current;
  const mapRef = useRef(null);
  const socketRef = useRef(null);
  const refreshInterval = useRef(null);
  const initialLoadTimeout = useRef(null);
  
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
    if (type === 'error') { icon = "error"; iconColor = "#EF4444"; }
    else if (type === 'warning') { icon = "warning"; iconColor = "#F59E0B"; }
    else if (type === 'info') { icon = "info"; iconColor = Colors.primary; }
    setAlertConfig({ title, message, icon, iconColor, buttons: [{ text: 'OK', onPress: () => setAlertVisible(false) }] });
    setAlertVisible(true);
  };

  // Calculate ride status and modification lock
  const calculateRideStatus = useCallback(() => {
    if (!ride?.departure_time) return;
    
    const now = new Date();
    const departureTime = new Date(ride.departure_time);
    const minutesToDep = (departureTime - now) / (1000 * 60);
    const minutesSinceDep = (now - departureTime) / (1000 * 60);
    
    setMinutesToDeparture(Math.round(minutesToDep));
    
    // Check if modifications are locked (within 15 minutes of departure)
    const isLocked = minutesToDep <= 15 && minutesToDep > -30;
    setModificationsLocked(isLocked);
    
    // Check if ride is auto-cancelled (more than 30 minutes past departure without start)
    if (minutesSinceDep > 30 && !rideStarted && !rideCancelled) {
      setRideAutoCancelled(true);
    }
  }, [ride?.departure_time, rideStarted, rideCancelled]);

  // Check for modification request - ONE TIME ONLY
  const checkModificationRequest = useCallback(async () => {
    if (!userBooking?.id) return;
    
    try {
      const response = await axios.get(`${API_BASE_URL}/booking/${userBooking.id}/modification-request?_t=${Date.now()}`);
      
      if (response.data) {
        // Check if modification was already used (approved or rejected)
        if (response.data.has_used_modification) {
          setHasUsedModification(true);
          setHasPendingModification(false);
          setPendingModificationDetails(null);
          setPendingModificationSeats(null);
        }
        // Check if there's a pending request
        else if (response.data.has_pending && response.data.request) {
          setHasPendingModification(true);
          setHasUsedModification(false);
          setPendingModificationDetails(response.data.request);
          setPendingModificationSeats(response.data.request.requested_seats);
        } 
        // Check if request was rejected
        else if (response.data.is_rejected) {
          setHasUsedModification(true); // Modification used (rejected counts as used)
          setHasPendingModification(false);
          setPendingModificationDetails(null);
          setPendingModificationSeats(null);
          // Show alert if rejected and not shown before
          if (response.data.rejection_reason && !response.data.alert_shown) {
            showCustomAlert(
              'Modification Rejected ❌',
              `Your seat change request was rejected: ${response.data.rejection_reason}`,
              'warning'
            );
          }
        }
        // Check if request was approved
        else if (response.data.is_approved) {
          setHasUsedModification(true);
          setHasPendingModification(false);
          setPendingModificationDetails(null);
          setPendingModificationSeats(null);
          // Update seat count if approved
          if (response.data.new_seats && response.data.new_seats !== userBooking.seats_requested) {
            setUserBooking({ ...userBooking, seats_requested: response.data.new_seats });
            setSeatsRequested(response.data.new_seats);
            if (!response.data.alert_shown) {
              showCustomAlert(
                'Modification Approved ✅',
                `Your seat change request has been approved! New seats: ${response.data.new_seats}`,
                'success'
              );
            }
          }
        }
        else {
          setHasPendingModification(false);
          setHasUsedModification(false);
          setPendingModificationDetails(null);
          setPendingModificationSeats(null);
        }
      } else {
        setHasPendingModification(false);
        setHasUsedModification(false);
        setPendingModificationDetails(null);
        setPendingModificationSeats(null);
      }
    } catch (error) {
      console.log('Error checking modification request:', error);
      setHasPendingModification(false);
      setHasUsedModification(false);
    }
  }, [userBooking?.id, userBooking]);

  // Fetch ride details with seat availability
  const fetchRideDetails = useCallback(async () => {
    if (!ride?.id) return;
    
    try {
      const response = await axios.get(`${API_BASE_URL}/ride/${ride.id}/passengers?_t=${Date.now()}`);
      
      if (response.data) {
        setRideDetails(response.data);
        const totalSeats = response.data.available_seats || ride.totalSeats || ride.available_seats || 4;
        setTotalRideSeats(totalSeats);
        
        // Calculate other booked seats excluding current user
        let otherBooked = 0;
        if (response.data.passengers && Array.isArray(response.data.passengers)) {
          otherBooked = response.data.passengers
            .filter(p => p.status === 'accepted' && p.passenger_phone !== user?.phone_number)
            .reduce((sum, p) => sum + (p.seats_booked || 0), 0);
        }
        setOtherBookedSeats(otherBooked);
        
        // Check if ride has started
        if (response.data.started_at) {
          setRideStarted(true);
        }
        
        // Check if ride is cancelled
        if (response.data.status === 'cancelled') {
          setRideCancelled(true);
        }
      }
    } catch (error) {
      console.log('Error fetching ride details:', error);
    }
  }, [ride?.id, ride?.totalSeats, ride?.available_seats, user?.phone_number]);

  // Check user booking using axios
  const checkUserBooking = useCallback(async () => {
    if (!user?.phone_number || !ride?.id) return;
    
    try {
      const response = await axios.get(`${API_BASE_URL}/my-rides/${user.phone_number}`);
      
      if (response.data && response.data.requested_rides) {
        const booking = response.data.requested_rides.find(
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
      }
    } catch (error) {
      console.log('Error checking user booking:', error);
    }
  }, [user?.phone_number, ride?.id]);

  // Setup auto-refresh interval
  useEffect(() => {
    if (refreshInterval.current) {
      clearInterval(refreshInterval.current);
    }
    
    refreshInterval.current = setInterval(() => {
      fetchRideDetails();
      checkUserBooking();
      if (userBooking?.id) {
        checkModificationRequest();
      }
      calculateRideStatus();
    }, 30000);
    
    return () => {
      if (refreshInterval.current) {
        clearInterval(refreshInterval.current);
      }
    };
  }, [fetchRideDetails, checkUserBooking, checkModificationRequest, calculateRideStatus, userBooking?.id]);

  // Setup socket listener for real-time updates
  const setupSocketListener = useCallback(() => {
    if (!ride?.id) return;
    
    const socket = io(API_BASE_URL, {
      transports: ['websocket'],
      reconnection: true,
      timeout: 10000,
    });
    socketRef.current = socket;
    
    socket.on('connect', () => {
      console.log('Socket connected for ride updates');
      socket.emit('join-ride-room', ride.id);
      if (user?.phone_number) {
        socket.emit('join-user-room', user.phone_number);
      }
    });
    
    socket.on('booking_accepted', (data) => {
      console.log('✅ Booking accepted:', data);
      showCustomAlert(
        'Booking Confirmed ✅',
        `Your booking for ${data.seats} seat(s) has been confirmed by the driver!`,
        'success'
      );
      checkUserBooking();
      fetchRideDetails();
    });
    
    socket.on('booking_rejected', (data) => {
      console.log('❌ Booking rejected:', data);
      showCustomAlert(
        'Booking Declined ❌',
        `Your booking request was declined by the driver.`,
        'warning'
      );
      setUserBooking(null);
      setSeatsRequested(1);
    });
    
    socket.on('modification-response', (data) => {
      console.log('📝 Modification response:', data);
      if (data.status === 'approved') {
        showCustomAlert(
          'Modification Approved ✅',
          `Your seat change request has been approved! New seats: ${data.new_seats}`,
          'success'
        );
        setHasUsedModification(true);
        setHasPendingModification(false);
        setPendingModificationDetails(null);
        setPendingModificationSeats(null);
        checkUserBooking();
        fetchRideDetails();
      } else if (data.status === 'rejected') {
        showCustomAlert(
          'Modification Rejected ❌',
          `Your seat change request was rejected: ${data.reason || 'Driver declined'}`,
          'warning'
        );
        setHasUsedModification(true); // Rejected counts as used - one time only
        setHasPendingModification(false);
        setPendingModificationDetails(null);
        setPendingModificationSeats(null);
      }
    });
    
    socket.on('ride-started', (data) => {
      console.log('🚗 Ride started:', data);
      setRideStarted(true);
      showCustomAlert(
        'Ride Started! 🚗',
        'The driver has started the ride. You can now track your journey live.',
        'info'
      );
    });
    
    socket.on('ride-auto-cancelled', (data) => {
      console.log('⚠️ Ride auto-cancelled:', data);
      setRideAutoCancelled(true);
      setUserBooking(null);
      showCustomAlert(
        'Ride Auto-Cancelled ❌',
        data.reason || 'The ride has been auto-cancelled as the driver did not start on time.',
        'error'
      );
    });
    
    socket.on('concurrent-requests-detected', (data) => {
      console.log('⚡ Concurrent requests detected:', data);
      if (data.ride_id === ride.id) {
        checkConcurrentConflict();
      }
    });
    
    return socket;
  }, [ride?.id, user?.phone_number, checkUserBooking, fetchRideDetails]);

  const checkConcurrentConflict = useCallback(async () => {
    if (!ride?.id) return;
    
    try {
      const response = await axios.get(`${API_BASE_URL}/ride/${ride.id}/concurrent-requests?_t=${Date.now()}`);
      
      if (response.data && response.data.has_concurrent_requests) {
        setConflictData(response.data);
        setConflictModalVisible(true);
      }
    } catch (error) {
      console.log('Error checking concurrent requests:', error);
    }
  }, [ride?.id]);

  useEffect(() => {
    const socket = setupSocketListener();
    return () => {
      if (socket) {
        socket.disconnect();
        socketRef.current = null;
      }
    };
  }, [setupSocketListener]);

  const loadDriverData = useCallback(async () => {
    const driverPhone = ride?.phoneNumber;
    const driverUserId = ride?.driverUserId;
    
    if (driverPhone || driverUserId) {
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
    } else {
      setLoadingProfile(false);
    }
  }, [ride?.phoneNumber, ride?.driverUserId]);

  // Initial load with timeout to prevent infinite loading
  const initialLoad = useCallback(async () => {
    setLoadingInitial(true);
    setLoadingProfile(true);
    
    initialLoadTimeout.current = setTimeout(() => {
      console.log('⚠️ Initial load timeout - forcing loading to stop');
      setLoadingInitial(false);
      setLoadingProfile(false);
    }, 5000);
    
    try {
      await Promise.all([
        loadDriverData(),
        checkUserBooking(),
        fetchRideDetails(),
        calculateRideStatus(),
      ]);
    } catch (error) {
      console.log('Initial load error:', error);
    } finally {
      clearTimeout(initialLoadTimeout.current);
      setLoadingInitial(false);
    }
  }, [loadDriverData, checkUserBooking, fetchRideDetails, calculateRideStatus]);

  // Refresh function
  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      await Promise.all([
        loadDriverData(),
        checkUserBooking(),
        fetchRideDetails(),
        checkModificationRequest(),
        calculateRideStatus(),
        checkConcurrentConflict(),
      ]);
    } catch (error) {
      console.log('Refresh error:', error);
    } finally {
      setRefreshing(false);
    }
  }, [loadDriverData, checkUserBooking, fetchRideDetails, checkModificationRequest, calculateRideStatus, checkConcurrentConflict]);

  useFocusEffect(
    useCallback(() => {
      initialLoad();
      
      return () => {
        if (initialLoadTimeout.current) {
          clearTimeout(initialLoadTimeout.current);
        }
        if (socketRef.current) {
          socketRef.current.disconnect();
          socketRef.current = null;
        }
      };
    }, [initialLoad])
  );

  // Check modification request when userBooking changes
  useEffect(() => {
    if (userBooking?.id) {
      checkModificationRequest();
    }
  }, [userBooking?.id, checkModificationRequest]);

  useEffect(() => {
    if (!isAuthenticated) {
      showCustomAlert('Login Required', 'Please login to book rides.', 'warning');
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
      if (Array.isArray(first) && first.length === 2) return { latitude: first[1], longitude: first[0] };
    }
    return parseSuggestedPoint(ride?.suggestedPickup);
  }, [ride]);

  const driverEnd = useMemo(() => {
    const coords = ride?.routeCoordinates;
    if (Array.isArray(coords) && coords.length > 0) {
      const last = coords[coords.length - 1];
      if (Array.isArray(last) && last.length === 2) return { latitude: last[1], longitude: last[0] };
    }
    return parseSuggestedPoint(ride?.suggestedDrop);
  }, [ride]);

  const intersectionPickup = useMemo(() => parseSuggestedPoint(ride?.suggestedPickup), [ride]);
  const intersectionDrop = useMemo(() => parseSuggestedPoint(ride?.suggestedDrop), [ride]);

  const userPickup = useMemo(() => {
    if (!searchData?.fromCoords) return null;
    const c = searchData.fromCoords;
    if (Array.isArray(c) && c.length === 2) return { latitude: c[1], longitude: c[0] };
    return null;
  }, [searchData]);

  const userDrop = useMemo(() => {
    if (!searchData?.toCoords) return null;
    const c = searchData.toCoords;
    if (Array.isArray(c) && c.length === 2) return { latitude: c[1], longitude: c[0] };
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
        } catch (e) { console.log('fitToCoordinates error:', e); }
      }, 500);
    }
  }, [mapReady, allMarkerCoords]);

  useEffect(() => {
    if (mapReady && allMarkerCoords.length >= 2) fitMapToMarkers();
  }, [mapReady, allMarkerCoords, fitMapToMarkers]);

  const vehicleName = driverProfile?.vehicle 
    ? [driverProfile.vehicle.model].filter(Boolean).join(' ')
    : [ride?.vehicle?.model].filter(Boolean).join(' ') || 'Vehicle details unavailable';
  
  const vehicleRegNumber = driverProfile?.vehicle?.registration_number || ride?.vehicle?.registration_number || null;
  const vehicleColor = driverProfile?.vehicle?.color || ride?.vehicle?.color || 'Not specified';

  const totalPrice = Number(ride?.price || 0) * seatsRequested;

  const handleProfileImagePress = () => {
    if (profilePhotoUrl) {
      setSelectedProfile({ visible: true, imageUrl: profilePhotoUrl, driverName: driverProfile?.full_name || ride?.driverName || 'Driver' });
    } else {
      showCustomAlert('No Photo', 'Driver has not uploaded a profile picture', 'warning');
    }
  };

  const mapHeight = animatedDrawer.interpolate({ inputRange: [0, 1], outputRange: [height - SAFE_TOP - COLLAPSED_HEIGHT, height * 0.32] });
  const drawerHeight = animatedDrawer.interpolate({ inputRange: [0, 1], outputRange: [COLLAPSED_HEIGHT, EXPANDED_HEIGHT] });

  const toggleDrawer = () => {
    const nextExpanded = !drawerExpanded;
    setDrawerExpanded(nextExpanded);
    Animated.timing(animatedDrawer, { toValue: nextExpanded ? 1 : 0, duration: 260, useNativeDriver: false }).start();
  };

  const panResponder = useRef(PanResponder.create({
    onMoveShouldSetPanResponder: (_, gestureState) => Math.abs(gestureState.dy) > 5,
    onPanResponderMove: (_, gestureState) => {
      const dragRange = EXPANDED_HEIGHT - COLLAPSED_HEIGHT;
      const progress = drawerExpanded ? 1 - (gestureState.dy / dragRange) : gestureState.dy / dragRange;
      animatedDrawer.setValue(Math.max(0, Math.min(1, progress)));
    },
    onPanResponderRelease: (_, gestureState) => {
      const dragRange = EXPANDED_HEIGHT - COLLAPSED_HEIGHT;
      const threshold = dragRange * 0.2;
      if (drawerExpanded) {
        if (gestureState.dy > threshold) {
          setDrawerExpanded(false);
          Animated.timing(animatedDrawer, { toValue: 0, duration: 200, useNativeDriver: false }).start();
        } else {
          setDrawerExpanded(true);
          Animated.timing(animatedDrawer, { toValue: 1, duration: 200, useNativeDriver: false }).start();
        }
      } else {
        if (gestureState.dy < -threshold) {
          setDrawerExpanded(true);
          Animated.timing(animatedDrawer, { toValue: 1, duration: 200, useNativeDriver: false }).start();
        } else {
          setDrawerExpanded(false);
          Animated.timing(animatedDrawer, { toValue: 0, duration: 200, useNativeDriver: false }).start();
        }
      }
    },
  })).current;

  // Request seat modification (send to driver) - ONE TIME ONLY
  const handleRequestModification = async (newSeatCount) => {
    if (!user?.phone_number || !userBooking) return;
    
    // Check if modification already used
    if (hasUsedModification) {
      showCustomAlert(
        'Modification Not Available',
        'You have already used your one-time modification for this booking.',
        'warning'
      );
      return;
    }
    
    if (modificationsLocked) {
      showCustomAlert(
        'Modifications Locked',
        `Modifications are locked within 15 minutes of departure. Please contact driver directly.`,
        'warning'
      );
      return;
    }
    
    if (rideStarted) {
      showCustomAlert('Cannot Modify', 'Cannot modify seats after ride has started.', 'warning');
      return;
    }
    
    if (rideAutoCancelled || rideCancelled) {
      showCustomAlert('Ride Cancelled', 'This ride has been cancelled.', 'warning');
      return;
    }
    
    if (newSeatCount < 1) {
      showCustomAlert('Invalid Seats', 'You must book at least 1 seat.', 'warning');
      return;
    }
    
    const maxSeats = totalRideSeats - otherBookedSeats;
    if (newSeatCount > maxSeats) {
      showCustomAlert('Not Enough Seats', `Only ${maxSeats} seat(s) available for modification.`, 'warning');
      return;
    }
    
    if (newSeatCount === userBooking.seats_requested) {
      showCustomAlert('No Change', 'Seat count is already set to this value.', 'info');
      return;
    }
    
    setModifyingSeats(true);
    try {
      const response = await axios.post(`${API_BASE_URL}/booking/${userBooking.id}/request-modification`, {
        requested_seats: newSeatCount
      });
      
      if (response.data && response.data.success) {
        showCustomAlert(
          'Request Sent 📨',
          `Your request to change from ${userBooking.seats_requested} to ${newSeatCount} seat(s) has been sent to the driver.`,
          'info'
        );
        
        setHasPendingModification(true);
        setPendingModificationDetails({
          current_seats: userBooking.seats_requested,
          requested_seats: newSeatCount
        });
        setPendingModificationSeats(newSeatCount);
      } else {
        throw new Error(response.data?.message || 'Failed to send modification request');
      }
      
    } catch (error) {
      console.error('Modification request error:', error);
      const errorMsg = error.response?.data?.message || error.response?.data?.detail || error.message || 'Failed to send modification request';
      showCustomAlert('Error', errorMsg, 'error');
    } finally {
      setModifyingSeats(false);
    }
  };
  
  // Cancel pending modification request
  const handleCancelModificationRequest = async () => {
    if (!userBooking?.id) return;
    
    setModifyingSeats(true);
    try {
      const response = await axios.delete(`${API_BASE_URL}/booking/${userBooking.id}/cancel-modification-request`);
      
      if (response.data && response.data.success) {
        showCustomAlert('Request Cancelled', 'Your seat modification request has been cancelled.', 'success');
        setHasPendingModification(false);
        setPendingModificationDetails(null);
        setPendingModificationSeats(null);
        // Modification not used since it was cancelled before approval
        setHasUsedModification(false);
      } else {
        throw new Error(response.data?.message || 'Failed to cancel modification request');
      }
      
    } catch (error) {
      console.error('Cancel modification error:', error);
      const errorMsg = error.response?.data?.message || error.response?.data?.detail || error.message || 'Failed to cancel modification request';
      showCustomAlert('Error', errorMsg, 'error');
    } finally {
      setModifyingSeats(false);
    }
  };

  // Cancel booking
  const handleCancelBooking = async () => {
    if (!user?.phone_number || !userBooking) return;
    
    if (modificationsLocked) {
      showCustomAlert('Cannot Cancel', 'Cancellation is locked within 15 minutes of departure.', 'warning');
      setShowCancelModal(false);
      return;
    }
    
    if (rideStarted) {
      showCustomAlert('Cannot Cancel', 'Cannot cancel after ride has started.', 'warning');
      setShowCancelModal(false);
      return;
    }

    setCancelLoading(true);
    try {
      const response = await axios.put(`${API_BASE_URL}/booking/${userBooking.id}/cancel`);
      
      if (response.data) {
        showCustomAlert('Success', response.data.message || 'Booking cancelled successfully', 'success');
        setUserBooking(null);
        setSeatsRequested(1);
        setHasPendingModification(false);
        setHasUsedModification(false);
        fetchRideDetails();
        
        setTimeout(() => navigation.goBack(), 1500);
      } else {
        throw new Error('Failed to cancel booking');
      }
    } catch (error) {
      console.error('Cancel booking error:', error);
      const errorMsg = error.response?.data?.message || error.response?.data?.detail || error.message || 'Failed to cancel booking';
      showCustomAlert('Error', errorMsg, 'error');
    } finally {
      setCancelLoading(false);
      setShowCancelModal(false);
    }
  };

//   // Create new booking
//   const handleCreateBooking = async () => {
//     if (!user?.phone_number) {
//       showCustomAlert('Login Required', 'Please log in to request a ride.', 'warning');
//       return;
//     }

//     if (ride?.womenOnly === true && user?.gender !== 'female') {
//       showCustomAlert('Not Available', 'This ride is for women passengers only.', 'warning');
//       return;
//     }

//     const remainingSeats = totalRideSeats - otherBookedSeats;
    
//     if (seatsRequested > remainingSeats) {
//       showCustomAlert('Not Enough Seats', `Only ${remainingSeats} seat(s) left in this ride.`, 'warning');
//       return;
//     }

//     setRequestLoading(true);
//     try {
//       const payload = {
//         ride_id: ride.id,
//         passenger_phone: user.phone_number,
//         seats_requested: seatsRequested,
//       };

//       if (searchData?.fromCoords) payload.from_coords = searchData.fromCoords;
//       if (searchData?.toCoords) payload.to_coords = searchData.toCoords;

//       const response = await axios.post(`${API_BASE_URL}/ride-bookings`, payload);

//       if (response.data) {
//         showCustomAlert(
//           'Request Sent 📨', 
//           `Your request for ${seatsRequested} seat(s) has been sent to the driver. You will be notified when they respond.`,
//           'info'
//         );
        
//         setTimeout(() => {
//           checkUserBooking();
//           fetchRideDetails();
//         }, 1000);
//       } else {
//         throw new Error('Failed to send request');
//       }
      
//     } catch (error) {
//       console.error('Booking error:', error);
//       const errorMsg = error.response?.data?.message || error.response?.data?.detail || error.message || 'Failed to send request';
//       showCustomAlert('Error', errorMsg, 'error');
//     } finally {
//       setRequestLoading(false);
//     }
//   };
// Create new booking with address fields
// const handleCreateBooking = async () => {
//   if (!user?.phone_number) {
//     showCustomAlert('Login Required', 'Please log in to request a ride.', 'warning');
//     return;
//   }

//   if (ride?.womenOnly === true && user?.gender !== 'female') {
//     showCustomAlert('Not Available', 'This ride is for women passengers only.', 'warning');
//     return;
//   }

//   const remainingSeats = totalRideSeats - otherBookedSeats;
  
//   if (seatsRequested > remainingSeats) {
//     showCustomAlert('Not Enough Seats', `Only ${remainingSeats} seat(s) left in this ride.`, 'warning');
//     return;
//   }

//   setRequestLoading(true);
//   try {
//     const payload = {
//       ride_id: ride.id,
//       passenger_phone: user.phone_number,
//       seats_requested: seatsRequested,
//     };

//     if (searchData?.fromCoords) payload.from_coords = searchData.fromCoords;
//     if (searchData?.toCoords) payload.to_coords = searchData.toCoords;
    
//     // ============================================
//     // ADD ADDRESS FIELDS TO PAYLOAD
//     // ============================================
//     if (searchData?.fromAddress) {
//       payload.pickup_address = searchData.fromAddress;
//       payload.pickup_place_name = searchData.fromPlaceName || searchData.fromAddress.split(',')[0];
//     }
    
//     if (searchData?.toAddress) {
//       payload.dropoff_address = searchData.toAddress;
//       payload.dropoff_place_name = searchData.toPlaceName || searchData.toAddress.split(',')[0];
//     }

//     const response = await axios.post(`${API_BASE_URL}/ride-bookings`, payload);

//     if (response.data) {
//       showCustomAlert(
//         'Request Sent 📨', 
//         `Your request for ${seatsRequested} seat(s) has been sent to the driver. You will be notified when they respond.`,
//         'info'
//       );
      
//       setTimeout(() => {
//         checkUserBooking();
//         fetchRideDetails();
//       }, 1000);
//     } else {
//       throw new Error('Failed to send request');
//     }
    
//   } catch (error) {
//     console.error('Booking error:', error);
//     const errorMsg = error.response?.data?.message || error.response?.data?.detail || error.message || 'Failed to send request';
//     showCustomAlert('Error', errorMsg, 'error');
//   } finally {
//     setRequestLoading(false);
//   }
// };
// Create new booking with address fields
// Custom alert with navigation callback
const showCustomAlertWithNavigation = (title, message, type = 'success', onConfirm = null) => {
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
  
  const buttons = onConfirm 
    ? [
        { 
          text: 'OK', 
          onPress: () => {
            setAlertVisible(false);
            if (onConfirm) onConfirm();
          }
        }
      ]
    : [{ 
        text: 'OK', 
        onPress: () => setAlertVisible(false) 
      }];
  
  setAlertConfig({
    title,
    message,
    icon,
    iconColor,
    buttons
  });
  setAlertVisible(true);
};
// Create new booking with address fields
const handleCreateBooking = async () => {
  if (!user?.phone_number) {
    showCustomAlertWithNavigation('Login Required', 'Please log in to request a ride.', 'warning');
    return;
  }

  if (ride?.womenOnly === true && user?.gender !== 'female') {
    showCustomAlertWithNavigation('Not Available', 'This ride is for women passengers only.', 'warning');
    return;
  }

  const remainingSeats = totalRideSeats - otherBookedSeats;
  
  if (seatsRequested > remainingSeats) {
    showCustomAlertWithNavigation('Not Enough Seats', `Only ${remainingSeats} seat(s) left in this ride.`, 'warning');
    return;
  }

  setRequestLoading(true);
  try {
    const payload = {
      ride_id: ride.id,
      passenger_phone: user.phone_number,
      seats_requested: seatsRequested,
    };

    if (searchData?.fromCoords) payload.from_coords = searchData.fromCoords;
    if (searchData?.toCoords) payload.to_coords = searchData.toCoords;
    
    if (searchData?.fromAddress) {
      payload.pickup_address = searchData.fromAddress;
      payload.pickup_place_name = searchData.fromPlaceName || searchData.fromAddress.split(',')[0];
    }
    
    if (searchData?.toAddress) {
      payload.dropoff_address = searchData.toAddress;
      payload.dropoff_place_name = searchData.toPlaceName || searchData.toAddress.split(',')[0];
    }

    const response = await axios.post(`${API_BASE_URL}/ride-bookings`, payload);

    if (response.data) {
      // Show success alert with navigation on OK
      showCustomAlertWithNavigation(
        'Request Sent 📨', 
        `Your request for ${seatsRequested} seat(s) has been sent to the driver. You will be notified when they respond.`,
        'info',
        () => {
          // Navigate to MyRides with requested tab after OK is pressed
          navigation.reset({
            index: 0,
            routes: [
              {
                name: "MyRides",
                params: { 
                  initialTab: "requested",  // Show requested rides tab
                  refresh: true,            // Trigger refresh
                  forceReload: true         // Force reload data
                },
              },
            ],
          });
        }
      );
      
      setTimeout(() => {
        checkUserBooking();
        fetchRideDetails();
      }, 1000);
    } else {
      throw new Error('Failed to send request');
    }
    
  } catch (error) {
    console.error('Booking error:', error);
    const errorMsg = error.response?.data?.message || error.response?.data?.detail || error.message || 'Failed to send request';
    showCustomAlertWithNavigation('Error', errorMsg, 'error');
  } finally {
    setRequestLoading(false);
  }
};
  // Handle seat change - either direct modify or send modification request
  const handleSeatChange = async () => {
    if (rideAutoCancelled || rideCancelled) {
      showCustomAlert('Ride Cancelled', 'This ride is no longer available.', 'warning');
      return;
    }
    
    if (rideStarted) {
      showCustomAlert('Cannot Modify', 'Cannot modify seats after ride has started.', 'warning');
      return;
    }
    
    if (userBooking) {
      // If booking is accepted, send modification request to driver (ONE TIME ONLY)
      if (userBooking.status === 'accepted') {
        if (hasUsedModification) {
          showCustomAlert(
            'Modification Not Available',
            'You have already used your one-time modification for this booking.',
            'warning'
          );
          return;
        }
        if (hasPendingModification) {
          showCustomAlert(
            'Request Pending',
            `You already have a pending modification request to change to ${pendingModificationSeats} seat(s). Please wait for driver response.`,
            'warning'
          );
          return;
        }
        await handleRequestModification(seatsRequested);
      } 
      // If booking is pending, can modify directly
      else if (userBooking.status === 'pending') {
        await handleDirectModify(seatsRequested);
      }
    } else {
      await handleCreateBooking();
    }
  };
  
  // Direct modify for pending bookings
//   const handleDirectModify = async (newSeatCount) => {
//     if (!user?.phone_number || !userBooking) return;
    
//     if (newSeatCount < 1) {
//       showCustomAlert('Invalid Seats', 'You must book at least 1 seat.', 'warning');
//       return;
//     }
    
//     const maxSeats = totalRideSeats - otherBookedSeats;
//     if (newSeatCount > maxSeats) {
//       showCustomAlert('Not Enough Seats', `Only ${maxSeats} seat(s) available.`, 'warning');
//       return;
//     }
    
//     if (newSeatCount === userBooking.seats_requested) {
//       showCustomAlert('No Change', 'Seat count is already set to this value.', 'info');
//       return;
//     }
    
//     setModifyingSeats(true);
//     try {
//       const response = await axios.put(
//         `${API_BASE_URL}/booking/${userBooking.id}/modify-seats`,
//         { new_seats: newSeatCount }
//       );
      
//       if (response.data) {
//         showCustomAlert(
//           'Booking Updated ✅',
//           `Your booking has been updated from ${userBooking.seats_requested} to ${newSeatCount} seat(s).`,
//           'success'
//         );
        
//         setUserBooking({ ...userBooking, seats_requested: newSeatCount });
//         setSeatsRequested(newSeatCount);
//         fetchRideDetails();
//         checkUserBooking();
//       }
      
//     } catch (error) {
//       console.error('Modification error:', error);
      
//       let errorMsg = 'Failed to modify booking';
//       if (error.response?.data?.detail) {
//         errorMsg = error.response.data.detail;
//       } else if (error.response?.data?.message) {
//         errorMsg = error.response.data.message;
//       } else if (error.response?.data?.error) {
//         errorMsg = error.response.data.error;
//       } else if (error.message) {
//         errorMsg = error.message;
//       }
      
//       showCustomAlert('Error', errorMsg, 'error');
//     } finally {
//       setModifyingSeats(false);
//     }
//   };
// Direct modify for pending bookings with address updates
const handleDirectModify = async (newSeatCount) => {
  if (!user?.phone_number || !userBooking) return;
  
  if (newSeatCount < 1) {
    showCustomAlert('Invalid Seats', 'You must book at least 1 seat.', 'warning');
    return;
  }
  
  const maxSeats = totalRideSeats - otherBookedSeats;
  if (newSeatCount > maxSeats) {
    showCustomAlert('Not Enough Seats', `Only ${maxSeats} seat(s) available.`, 'warning');
    return;
  }
  
  if (newSeatCount === userBooking.seats_requested) {
    showCustomAlert('No Change', 'Seat count is already set to this value.', 'info');
    return;
  }
  
  setModifyingSeats(true);
  try {
    const payload = { new_seats: newSeatCount };
    
    // Also update addresses if they changed
    if (searchData?.fromAddress && (!userBooking.pickup_address || userBooking.pickup_address !== searchData.fromAddress)) {
      payload.pickup_address = searchData.fromAddress;
      payload.pickup_place_name = searchData.fromPlaceName || searchData.fromAddress.split(',')[0];
    }
    
    if (searchData?.toAddress && (!userBooking.dropoff_address || userBooking.dropoff_address !== searchData.toAddress)) {
      payload.dropoff_address = searchData.toAddress;
      payload.dropoff_place_name = searchData.toPlaceName || searchData.toAddress.split(',')[0];
    }
    
    const response = await axios.put(
      `${API_BASE_URL}/booking/${userBooking.id}/modify-seats`,
      payload
    );
    
    if (response.data) {
      showCustomAlert(
        'Booking Updated ✅',
        `Your booking has been updated from ${userBooking.seats_requested} to ${newSeatCount} seat(s).`,
        'success'
      );
      
      setUserBooking({ ...userBooking, seats_requested: newSeatCount });
      setSeatsRequested(newSeatCount);
      fetchRideDetails();
      checkUserBooking();
    }
    
  } catch (error) {
    console.error('Modification error:', error);
    
    let errorMsg = 'Failed to modify booking';
    if (error.response?.data?.detail) {
      errorMsg = error.response.data.detail;
    } else if (error.response?.data?.message) {
      errorMsg = error.response.data.message;
    } else if (error.response?.data?.error) {
      errorMsg = error.response.data.error;
    } else if (error.message) {
      errorMsg = error.message;
    }
    
    showCustomAlert('Error', errorMsg, 'error');
  } finally {
    setModifyingSeats(false);
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
      if (!myPhone) return null;
      const response = await axios.post(`${API_BASE_URL}/api/chat/conversations`, {
        participant_phone: receiverPhone,
        ride_id: rideId
      }, {
        headers: { 'X-Phone-Number': myPhone }
      });
      return response.data?.success ? response.data.conversation.id : null;
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
          user: { name: driverProfile?.full_name || ride?.driverName || 'Driver', tripInfo: `${ride.from} → ${ride.to}` },
        });
      } else {
        showCustomAlert('Chat', 'Unable to start chat.', 'error');
      }
    } else {
      showCustomAlert('Chat', 'Driver contact not available', 'warning');
    }
  };

  // Show loading screen during initial load
  if (loadingInitial || (loadingProfile && !driverProfile)) {
    return (
      <View style={styles.loaderContainer}>
        <LottieView source={require("../assets/loading.json")} autoPlay loop style={{ width: 300, height: 300 }} />
        {/* <Text style={styles.loadingText}>Loading ride details...</Text> */}
      </View>
    );
  }

  if (!ride) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.errorText}>No ride data available</Text>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.fallbackBtn}>
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

  const isBooked = !!userBooking;
  const isAccepted = isBooked && userBooking.status === 'accepted';
  const isPending = isBooked && userBooking.status === 'pending';
  
  const remainingForOthers = totalRideSeats - otherBookedSeats;
  const maxSelectable = isBooked ? totalRideSeats : remainingForOthers;
  const currentBookedSeats = userBooking?.seats_requested || 0;
  
  const canRequestModification = isAccepted && !modificationsLocked && !rideStarted && !rideAutoCancelled && !rideCancelled && !hasUsedModification && !hasPendingModification;
  const canCancel = (isAccepted || isPending) && !modificationsLocked && !rideStarted && !rideAutoCancelled && !rideCancelled;
  
  // Get warning message based on ride status
  const getRideStatusMessage = () => {
    if (rideAutoCancelled) {
      return { message: "This ride has been auto-cancelled as the driver did not start on time.", type: 'error', icon: 'alert-circle' };
    }
    if (rideCancelled) {
      return { message: "This ride has been cancelled by the driver.", type: 'error', icon: 'close-circle' };
    }
    if (rideStarted) {
      return { message: "Ride in progress! You can track the driver's location.", type: 'success', icon: 'car-sport' };
    }
    if (modificationsLocked && isAccepted) {
      return { message: `Modifications locked - Departure in ${Math.abs(minutesToDeparture)} minutes`, type: 'warning', icon: 'lock-closed' };
    }
    if (minutesToDeparture <= 0 && minutesToDeparture > -30 && !rideStarted) {
      return { message: `⚠️ Ride is ${Math.abs(minutesToDeparture)} minutes late. Driver must start within ${30 - Math.abs(minutesToDeparture)} minutes.`, type: 'warning', icon: 'time-outline' };
    }
    if (minutesToDeparture > 0 && minutesToDeparture <= 15) {
      return { message: `Ride starts in ${minutesToDeparture} minutes`, type: 'info', icon: 'time-outline' };
    }
    return null;
  };
  
  const statusMessage = getRideStatusMessage();

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
            <Polyline coordinates={routePath} strokeColor="#2457A6" strokeWidth={5} lineCap="round" lineJoin="round" />
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
            <Polyline coordinates={walkToPickupPath} strokeColor="#FACC15" strokeWidth={4} strokeDasharray={[8, 6]} lineCap="round" lineJoin="round" />
          )}

          {walkFromDropPath.length >= 2 && (
            <Polyline coordinates={walkFromDropPath} strokeColor="#FACC15" strokeWidth={4} strokeDasharray={[8, 6]} lineCap="round" lineJoin="round" />
          )}
        </MapView>

        <TouchableOpacity style={styles.mapBackButton} onPress={() => navigation.goBack()}>
          <Ionicons name="chevron-back" size={26} color={Colors.secondary} />
        </TouchableOpacity>
      </Animated.View>

      <Animated.View style={[styles.drawer, { height: drawerHeight }]}>
        <View style={styles.handleWrap} {...panResponder.panHandlers}>
          <TouchableOpacity activeOpacity={0.9} onPress={toggleDrawer} style={styles.handleHitArea}>
            <View style={styles.handleBar} />
          </TouchableOpacity>
        </View>

        {!drawerExpanded ? (
          <View style={styles.collapsedSummary}>
            <View style={styles.collapsedTopRow}>
              <View style={{ flex: 1 }}>
                <Text style={styles.collapsedDriver} numberOfLines={1}>{driverProfile?.full_name || ride?.driverName || 'Driver'}</Text>
                <Text style={styles.collapsedSub} numberOfLines={1}>{ride.from} → {ride.to}</Text>
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
              refreshControl={
                <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[Colors.primary]} tintColor={Colors.primary} />
              }
            >
              {/* Ride Status Banner */}
              {statusMessage && (
                <View style={[styles.statusBanner, { backgroundColor: statusMessage.type === 'error' ? '#FEF2F2' : statusMessage.type === 'warning' ? '#FFFBEB' : '#E8F5E9' }]}>
                  <Ionicons name={statusMessage.icon} size={20} color={statusMessage.type === 'error' ? '#DC2626' : statusMessage.type === 'warning' ? '#F59E0B' : '#10B981'} />
                  <Text style={[styles.statusBannerText, { color: statusMessage.type === 'error' ? '#DC2626' : statusMessage.type === 'warning' ? '#92400E' : '#166534', flex: 1 }]}>
                    {statusMessage.message}
                  </Text>
                </View>
              )}
              
              {/* Modification Lock Warning */}
              {modificationsLocked && isAccepted && !rideStarted && !rideAutoCancelled && (
                <View style={styles.modificationsLockedBanner}>
                  <Ionicons name="lock-closed" size={16} color="#DC2626" />
                  <Text style={styles.modificationsLockedText}>
                    Modifications locked - Cannot change seats within 15 minutes of departure
                  </Text>
                </View>
              )}

              <View style={styles.driverCard}>
                <View style={styles.driverTopRow}>
                  <View style={styles.driverLeftWrap}>
                    <TouchableOpacity style={styles.driverAvatar} onPress={handleProfileImagePress} activeOpacity={0.8}>
                      {profilePhotoUrl ? (
                        isProfilePhotoSvg ? (
                          <View style={styles.svgAvatarContainer}><SvgCssUri uri={profilePhotoUrl} width={56} height={56} /></View>
                        ) : (
                          <Image source={{ uri: profilePhotoUrl }} style={styles.avatarImg} />
                        )
                      ) : (
                        <Text style={styles.avatarText}>{avatarText}</Text>
                      )}
                    </TouchableOpacity>
                    <View style={styles.driverMeta}>
                      <View style={styles.driverNameRow}>
                        <Text style={styles.driverName}>{driverProfile?.full_name || ride?.driverName || 'Driver'}</Text>
                        {isVerified && (
                          <View style={styles.verifiedBadge}>
                            <Ionicons name="checkmark-circle" size={12} color="#2457A6" />
                            <Text style={styles.verifiedBadgeText}>Verified</Text>
                          </View>
                        )}
                      </View>
                      <View style={styles.ratingRow}>
                        <Ionicons name="star" size={13} color="#F59E0B" />
                        <Text style={styles.ratingText}>{driverProfile?.avg_rating || ride?.rating || 4.5}</Text>
                      </View>
                    </View>
                  </View>
                  <TouchableOpacity style={styles.chatButtonCircle} onPress={startChat}>
                    <Ionicons name="chatbubble-outline" size={20} color="#2457A6" />
                  </TouchableOpacity>
                </View>
                <Text style={styles.driverBio}>{driverProfile?.bio || driverProfile?.about || 'Friendly driver, love meeting new people!'}</Text>
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
                      <Text style={styles.timelinePlace}>{ride.pickupLabel || ride.from}</Text>
                      <View style={styles.timelineMetaRow}>
                        <Ionicons name="time-outline" size={13} color={Colors.gray} />
                        <Text style={styles.timelineMetaText}>{ride.date} at {ride.time}</Text>
                      </View>
                    </View>
                    <View style={styles.timelineItem}>
                      <Text style={styles.timelineLabel}>Dropoff</Text>
                      <Text style={styles.timelinePlace}>{ride.dropLabel || ride.to}</Text>
                      <Text style={styles.timelineMetaText}>Estimated: {ride.durationText || '--'}</Text>
                    </View>
                  </View>
                </View>
              </View>

              <View style={styles.cardSection}>
                <Text style={styles.sectionTitle}>Vehicle Details</Text>
                <View style={styles.vehicleHeaderRow}>
                  <View style={styles.vehicleIconCircle}><Ionicons name="car-sport-outline" size={18} color="#2457A6" /></View>
                  <View style={styles.vehicleMeta}>
                    <Text style={styles.vehicleTitle}>{vehicleName}</Text>
                    <Text style={styles.vehicleSub}>{vehicleColor} • {totalRideSeats} seats total</Text>
                    {vehicleRegNumber && (
                      <View style={styles.vehicleRegContainer}>
                        <Text style={styles.vehicleRegText}>Vehicle Number: {vehicleRegNumber}</Text>
                      </View>
                    )}
                  </View>
                </View>
              </View>

              <View style={styles.cardSection}>
                <Text style={styles.sectionTitle}>Ride Preferences</Text>
                <View style={styles.tagRow}>
                  {allPreferences.length > 0 ? (
                    allPreferences.map((pref, index) => <GenericPreferenceTag key={`${pref}-${index}`} label={pref} />)
                  ) : (
                    <Text style={styles.emptyText}>No specific preferences added</Text>
                  )}
                </View>
              </View>

              <View style={styles.cardSection}>
                <Text style={styles.sectionTitle}>Cost Breakdown</Text>
                <View style={styles.priceRow}>
                  <Text style={styles.priceLabel}>Base fare (per seat)</Text>
                  <Text style={styles.priceValue}>₹{ride.price}</Text>
                </View>
                <View style={styles.priceDivider} />
                <View style={styles.priceRow}>
                  <Text style={styles.totalLabel}>Total for {seatsRequested} seat(s)</Text>
                  <Text style={styles.totalValue}>₹{totalPrice}</Text>
                </View>
                <View style={styles.noticeBox}>
                  <Text style={styles.noticeText}>Cost-share contribution - sharing travel costs with the driver.</Text>
                </View>
              </View>

              <View style={styles.cardSection}>
                <Text style={styles.sectionTitle}>{isBooked ? 'Your Booking' : 'Select Seats'}</Text>
                
                <View style={styles.seatInfoBox}>
                  <Text style={styles.seatInfoText}>
                    🚗 Total seats in vehicle: <Text style={styles.seatInfoBold}>{totalRideSeats}</Text>
                  </Text>
                  {otherBookedSeats > 0 && !isBooked && (
                    <Text style={styles.seatInfoText}>
                      👥 Other passengers booked: <Text style={styles.seatInfoBold}>{otherBookedSeats}</Text> seat(s)
                    </Text>
                  )}
                  {isBooked && (
                    <Text style={styles.seatInfoText}>
                      ✅ You have booked: <Text style={styles.seatInfoBold}>{currentBookedSeats}</Text> seat(s)
                    </Text>
                  )}
                  <Text style={styles.seatInfoText}>
                    📍 Seats available: <Text style={styles.seatInfoBold}>{remainingForOthers}</Text> seat(s)
                  </Text>
                </View>
                
                {/* Modification Already Used Message */}
                {hasUsedModification && isAccepted && !rideStarted && !rideAutoCancelled && !rideCancelled && (
                  <View style={styles.modificationUsedCard}>
                    <View style={styles.pendingModificationHeader}>
                      <Ionicons name="information-circle" size={24} color="#6B7280" />
                      <Text style={[styles.pendingModificationTitle, { color: "#6B7280" }]}>Modification Already Used</Text>
                    </View>
                    <Text style={styles.modificationUsedText}>
                      You have already used your one-time modification for this booking.
                    </Text>
                    <Text style={styles.modificationUsedSubtext}>
                      Further modifications are not allowed.
                    </Text>
                  </View>
                )}
                
                {/* Pending Modification Request Card */}
                {hasPendingModification && isAccepted && !rideStarted && !rideAutoCancelled && !rideCancelled && (
                  <View style={styles.pendingModificationCard}>
                    <View style={styles.pendingModificationHeader}>
                      <Ionicons name="time-outline" size={24} color="#F59E0B" />
                      <Text style={styles.pendingModificationTitle}>Modification Request Pending</Text>
                    </View>
                    <Text style={styles.pendingModificationText}>
                      Requested to change from <Text style={styles.oldSeatCount}>{pendingModificationDetails?.current_seats || currentBookedSeats}</Text> 
                      {' → '}
                      <Text style={styles.newSeatCount}>{pendingModificationDetails?.requested_seats}</Text> seat(s)
                    </Text>
                    <Text style={styles.pendingModificationSubtext}>
                      Your request has been sent to the driver. You will be notified once they respond.
                    </Text>
                    <TouchableOpacity 
                      style={styles.cancelRequestButton} 
                      onPress={handleCancelModificationRequest}
                      disabled={modifyingSeats}>
                      <Text style={styles.cancelRequestButtonText}>
                        {modifyingSeats ? 'Cancelling...' : 'Cancel Request'}
                      </Text>
                    </TouchableOpacity>
                  </View>
                )}
                
                {isBooked && (
                  <View style={[styles.currentBookingContainer, isAccepted && styles.confirmedBookingContainer]}>
                    {isPending ? (
                      <>
                        <Ionicons name="time-outline" size={24} color="#F59E0B" />
                        <Text style={styles.pendingBookingTitle}>
                          ⏳ Waiting for Driver Confirmation
                        </Text>
                        <Text style={styles.currentBookingText}>
                          You have requested {userBooking.seats_requested} seat(s) for this ride.
                        </Text>
                        <Text style={styles.currentBookingHint}>
                          You can modify or cancel your request anytime. The driver will notify you once confirmed.
                        </Text>
                      </>
                    ) : (
                      <>
                        <Ionicons name="checkmark-circle" size={24} color="#10B981" />
                        <Text style={styles.confirmedBookingTitle}>
                          ✅ Booking Confirmed!
                        </Text>
                        <Text style={styles.currentBookingText}>
                          You have booked {userBooking.seats_requested} seat(s) for this ride.
                        </Text>
                        <Text style={styles.currentBookingHint}>
                          {hasUsedModification 
                            ? "You have already used your one-time modification." 
                            : modificationsLocked 
                              ? "Modifications are locked within 15 minutes of departure." 
                              : "You can request a one-time seat change before the ride starts."}
                        </Text>
                      </>
                    )}
                  </View>
                )}
                
                {/* Seat Selector - Only show if ride is not cancelled/auto-cancelled and not started */}
                {!rideStarted && !rideAutoCancelled && !rideCancelled && (
                  <>
                    <View style={styles.seatSelectorRow}>
                      <TouchableOpacity
                        style={[styles.seatActionBtn, (seatsRequested === 1 || modifyingSeats || requestLoading) && styles.seatActionBtnDisabled]}
                        onPress={() => setSeatsRequested(Math.max(1, seatsRequested - 1))}
                        disabled={seatsRequested === 1 || modifyingSeats || requestLoading}
                      >
                        <Ionicons name="remove" size={20} color={seatsRequested === 1 ? Colors.gray : Colors.dark} />
                      </TouchableOpacity>

                      <View style={styles.seatCountWrap}>
                        <Text style={styles.seatCountText}>{seatsRequested}</Text>
                        <Text style={styles.seatAvailableText}>
                          / {maxSelectable} {isBooked ? 'total' : 'available'}
                        </Text>
                      </View>

                      <TouchableOpacity
                        style={[styles.seatActionBtn, (seatsRequested === maxSelectable || modifyingSeats || requestLoading) && styles.seatActionBtnDisabled]}
                        onPress={() => setSeatsRequested(Math.min(maxSelectable, seatsRequested + 1))}
                        disabled={seatsRequested === maxSelectable || modifyingSeats || requestLoading}
                      >
                        <Ionicons name="add" size={20} color={seatsRequested === maxSelectable ? Colors.gray : "#2457A6"} />
                      </TouchableOpacity>
                    </View>
                    
                    {isAccepted && seatsRequested !== currentBookedSeats && !hasPendingModification && !hasUsedModification && (
                      <View style={styles.priceDifferenceContainer}>
                        <Text style={styles.priceDifferenceText}>
                          {seatsRequested > currentBookedSeats 
                            ? `+ ₹${ride.price * (seatsRequested - currentBookedSeats)} will be charged if approved`
                            : `- ₹${ride.price * (currentBookedSeats - seatsRequested)} will be refunded if approved`}
                        </Text>
                        <Text style={styles.approvalNoteText}>* Changes require driver approval</Text>
                      </View>
                    )}
                    
                    {isAccepted && hasUsedModification && seatsRequested !== currentBookedSeats && (
                      <View style={[styles.priceDifferenceContainer, { backgroundColor: '#F3F4F6' }]}>
                        <Text style={[styles.priceDifferenceText, { color: '#6B7280' }]}>
                          Modification not available - One-time limit reached
                        </Text>
                      </View>
                    )}
                    
                    {!isBooked && (
                      <View style={styles.seatInfoNote}>
                        <Text style={styles.seatInfoNoteText}>💡 You can modify or cancel anytime before the ride starts.</Text>
                      </View>
                    )}
                  </>
                )}
                
                {/* Cancel Booking Button */}
                {canCancel && (
                  <TouchableOpacity 
                    style={styles.cancelBookingBtn} 
                    onPress={() => setShowCancelModal(true)} 
                    disabled={cancelLoading}
                  >
                    <Text style={styles.cancelBookingBtnText}>
                      {isPending ? 'Cancel Request' : 'Cancel Booking'}
                    </Text>
                  </TouchableOpacity>
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

            {/* Bottom Action Button */}
            {(rideStarted || rideAutoCancelled || rideCancelled) ? null : (
              <View style={styles.bottomBar}>
                <View>
                  <Text style={styles.bottomCaption}>
                    {isAccepted && hasPendingModification ? 'Requested total' : `Total for ${seatsRequested} seat(s)`}
                  </Text>
                  <Text style={styles.bottomTotal}>₹{totalPrice}</Text>
                </View>

                <TouchableOpacity
                  style={[
                    styles.bookNowBtn, 
                    (requestLoading || cancelLoading || modifyingSeats) && styles.bookNowBtnDisabled,
                    isAccepted && styles.modifyBtn,
                    (modificationsLocked && isAccepted) && styles.disabledBtn,
                    (hasUsedModification && isAccepted && seatsRequested !== currentBookedSeats) && styles.disabledBtn
                  ]}
                  onPress={handleSeatChange}
                  disabled={requestLoading || cancelLoading || modifyingSeats || (modificationsLocked && isAccepted) || rideStarted || rideAutoCancelled || rideCancelled || (hasUsedModification && isAccepted)}
                >
                  <Text style={styles.bookNowText}>
                    {requestLoading ? 'Sending Request...' :
                     cancelLoading ? 'Cancelling...' :
                     modifyingSeats ? 'Sending...' :
                     modificationsLocked && isAccepted ? 'Modifications Locked' :
                     isAccepted ? (hasPendingModification ? 'Request Pending' : (hasUsedModification ? 'Modification Used' : 'Request Change')) :
                     isPending ? 'Update Booking' :
                     'Request Ride'}
                  </Text>
                </TouchableOpacity>
              </View>
            )}
          </>
        )}
      </Animated.View>

      {/* Conflict Resolution Modal - For driver awareness */}
      <Modal visible={conflictModalVisible} transparent={true} animationType="fade" onRequestClose={() => setConflictModalVisible(false)}>
        <View style={styles.modalBackdrop}>
          <View style={styles.conflictModalContent}>
            <View style={styles.conflictModalHeader}>
              <Ionicons name="alert-circle" size={48} color="#F59E0B" />
              <Text style={styles.conflictModalTitle}>Multiple Requests Detected</Text>
            </View>
            
            <Text style={styles.conflictModalMessage}>
              There are multiple requests for this ride. The driver needs to choose which one to accept.
              Your request may be affected by the driver's decision.
            </Text>
            
            {conflictData?.modification_request && (
              <View style={styles.conflictRequestCard}>
                <View style={styles.conflictRequestHeader}>
                  <Ionicons name="swap" size={24} color="#F59E0B" />
                  <Text style={styles.conflictRequestTitle}>Modification Request</Text>
                </View>
                <Text style={styles.conflictRequestDetails}>
                  <Text style={{ fontWeight: 'bold' }}>Rider:</Text> {conflictData.modification_request.passenger_name}
                </Text>
                <Text style={styles.conflictRequestDetails}>
                  <Text style={{ fontWeight: 'bold' }}>Seats:</Text> {conflictData.modification_request.current_seats} → {conflictData.modification_request.requested_seats}
                </Text>
              </View>
            )}
            
            {conflictData?.booking_request && (
              <View style={styles.conflictRequestCard}>
                <View style={styles.conflictRequestHeader}>
                  <Ionicons name="person-add" size={24} color="#10B981" />
                  <Text style={styles.conflictRequestTitle}>New Booking Request</Text>
                </View>
                <Text style={styles.conflictRequestDetails}>
                  <Text style={{ fontWeight: 'bold' }}>Rider:</Text> {conflictData.booking_request.passenger_name}
                </Text>
                <Text style={styles.conflictRequestDetails}>
                  <Text style={{ fontWeight: 'bold' }}>Seats:</Text> {conflictData.booking_request.seats_requested} seat(s)
                </Text>
              </View>
            )}
            
            <Text style={styles.conflictModalSeatsInfo}>
              Available seats: {conflictData?.available_seats} / {conflictData?.total_seats}
            </Text>
            
            <Text style={styles.conflictModalNote}>
              The driver will choose which request to accept. If another request is chosen, yours will be automatically rejected.
            </Text>
            
            <TouchableOpacity 
              style={styles.conflictModalCloseBtn} 
              onPress={() => {
                setConflictModalVisible(false);
                onRefresh();
              }}>
              <Text style={styles.conflictModalCloseBtnText}>I Understand</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Cancel Booking Modal */}
      <Modal visible={showCancelModal} transparent={true} animationType="fade" onRequestClose={() => setShowCancelModal(false)}>
        <View style={styles.modalBackdrop}>
          <View style={styles.confirmModalContainer}>
            <View style={styles.confirmModalContent}>
              <View style={styles.confirmModalHeader}>
                <Ionicons name="alert-circle" size={40} color="#F59E0B" />
                <Text style={styles.confirmModalTitle}>
                  {isPending ? 'Cancel Request?' : 'Cancel Booking?'}
                </Text>
              </View>
              <Text style={styles.confirmModalMessage}>
                {isPending 
                  ? 'Are you sure you want to cancel your ride request?'
                  : 'Are you sure you want to cancel your booking? This action cannot be undone.'}
              </Text>
              <View style={styles.confirmModalButtons}>
                <TouchableOpacity style={[styles.confirmModalBtn, styles.confirmModalCancelBtn]} onPress={() => setShowCancelModal(false)}>
                  <Text style={styles.confirmModalCancelBtnText}>No, Keep</Text>
                </TouchableOpacity>
                <TouchableOpacity style={[styles.confirmModalBtn, styles.confirmModalConfirmBtn]} onPress={handleCancelBooking}>
                  <Text style={styles.confirmModalConfirmBtnText}>Yes, Cancel</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </View>
      </Modal>

      <ProfileImageModal visible={selectedProfile.visible} imageUrl={selectedProfile.imageUrl} driverName={selectedProfile.driverName} onClose={() => setSelectedProfile({ visible: false, imageUrl: null, driverName: '' })} />

      <CustomAlert visible={alertVisible} title={alertConfig.title} message={alertConfig.message} icon={alertConfig.icon} iconColor={alertConfig.iconColor} buttons={alertConfig.buttons} onBackdropPress={() => setAlertVisible(false)} />
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
  pinIcon: { fontSize: 14, fontWeight: '800', color: 'white', textAlign: 'center', lineHeight: 18 },
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
  statusBanner: { flexDirection: 'row', alignItems: 'center', padding: 12, borderRadius: 12, marginBottom: 14, gap: 8 },
  statusBannerText: { fontSize: 13, fontWeight: '700' },
  modificationsLockedBanner: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#FEF2F2', padding: 12, borderRadius: 12, marginBottom: 14, gap: 8, borderWidth: 1, borderColor: '#FEE2E2' },
  modificationsLockedText: { fontSize: 12, color: '#DC2626', flex: 1 },
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
  seatInfoBox: { backgroundColor: '#F0F9FF', borderRadius: 12, padding: 12, marginBottom: 16 },
  seatInfoText: { fontSize: 13, color: Colors.dark, marginBottom: 4 },
  seatInfoBold: { fontWeight: '800', color: Colors.primary },
  currentBookingContainer: { backgroundColor: '#EFF6FF', borderRadius: 12, padding: 16, marginBottom: 16, alignItems: 'center' },
  confirmedBookingContainer: { backgroundColor: '#E8F5E9' },
  pendingBookingTitle: { fontSize: 16, fontWeight: '700', color: '#F59E0B', marginTop: 8, marginBottom: 4 },
  confirmedBookingTitle: { fontSize: 16, fontWeight: '700', color: '#10B981', marginTop: 8, marginBottom: 4 },
  currentBookingText: { fontSize: 14, color: Colors.dark, textAlign: 'center', marginBottom: 4 },
  currentBookingHint: { fontSize: 12, color: Colors.gray, textAlign: 'center' },
  pendingModificationCard: { backgroundColor: '#FFFBEB', borderRadius: 12, padding: 16, marginBottom: 16, borderWidth: 1, borderColor: '#FDE68A' },
  pendingModificationHeader: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 12 },
  pendingModificationTitle: { fontSize: 14, fontWeight: '700', color: '#92400E' },
  pendingModificationText: { fontSize: 13, color: '#B45309', marginBottom: 8, textAlign: 'center' },
  pendingModificationSubtext: { fontSize: 11, color: '#B45309', textAlign: 'center', marginBottom: 12 },
  oldSeatCount: { textDecorationLine: 'line-through', fontWeight: '700', color: '#DC2626' },
  newSeatCount: { fontWeight: '700', color: '#10B981' },
  cancelRequestButton: { backgroundColor: '#FEF2F2', paddingVertical: 10, borderRadius: 8, borderWidth: 1, borderColor: '#EF4444', alignItems: 'center' },
  cancelRequestButtonText: { color: '#EF4444', fontWeight: '600', fontSize: 14 },
  modificationUsedCard: { backgroundColor: '#F3F4F6', borderRadius: 12, padding: 16, marginBottom: 16, borderWidth: 1, borderColor: '#E5E7EB' },
  modificationUsedText: { fontSize: 13, color: '#6B7280', marginBottom: 8, textAlign: 'center' },
  modificationUsedSubtext: { fontSize: 11, color: '#9CA3AF', textAlign: 'center' },
  seatInfoNote: { marginTop: 12, backgroundColor: '#FEF3C7', borderRadius: 8, padding: 10 },
  seatInfoNoteText: { fontSize: 11, color: '#92400E', textAlign: 'center' },
  priceDifferenceContainer: { marginTop: 12, padding: 10, backgroundColor: '#EFF6FF', borderRadius: 8, alignItems: 'center' },
  priceDifferenceText: { fontSize: 12, color: '#2457A6', fontWeight: '600' },
  approvalNoteText: { fontSize: 10, color: '#6B7280', marginTop: 4 },
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
  seatSelectorRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: '#FAFAFB', borderRadius: 18, padding: 14 },
  seatActionBtn: { width: 38, height: 38, borderRadius: 12, borderWidth: 1, borderColor: '#D6DDE7', alignItems: 'center', justifyContent: 'center', backgroundColor: 'white' },
  seatActionBtnDisabled: { opacity: 0.5, backgroundColor: '#F5F5F5' },
  seatCountWrap: { flexDirection: 'row', alignItems: 'baseline' },
  seatCountText: { fontSize: 28, fontWeight: '900', color: Colors.dark },
  seatAvailableText: { fontSize: 13, color: Colors.gray, marginLeft: 6, fontWeight: '600' },
  cancelBookingBtn: { marginTop: 16, backgroundColor: '#FEF2F2', paddingVertical: 12, borderRadius: 12, alignItems: 'center', borderWidth: 1, borderColor: '#EF4444' },
  cancelBookingBtnText: { color: '#EF4444', fontWeight: '700', fontSize: 14 },
  simpleInfoLeft: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  safetyCard: { backgroundColor: '#FFF3E7', borderRadius: 18, padding: 16, marginBottom: 14 },
  safetyTitle: { fontSize: 14, color: '#2457A6', fontWeight: '800' },
  safetySub: { marginTop: 2, fontSize: 12, color: '#2457A6', opacity: 0.9, fontWeight: '600' },
  bottomBar: { position: 'absolute', left: 0, right: 0, bottom: 0, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 16, paddingTop: 12, paddingBottom: Platform.OS === 'ios' ? 28 : 16, backgroundColor: 'white', borderTopWidth: 1, borderTopColor: '#ECEEF2' },
  bottomCaption: { fontSize: 12, color: Colors.gray, fontWeight: '500' },
  bottomTotal: { fontSize: 26, color: Colors.dark, fontWeight: '900', marginTop: 2 },
  bookNowBtn: { backgroundColor: '#FF7A00', paddingHorizontal: 24, paddingVertical: 14, borderRadius: 22, minWidth: 128, alignItems: 'center', justifyContent: 'center' },
  modifyBtn: { backgroundColor: '#2457A6' },
  disabledBtn: { backgroundColor: '#9CA3AF', opacity: 0.6 },
  bookNowBtnDisabled: { opacity: 0.7 },
  bookNowText: { color: 'white', fontSize: 16, fontWeight: '800' },
  loaderContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#fff' },
  loadingText: { marginTop: 16, fontSize: 14, color: Colors.gray },
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
  
  // Conflict Modal Styles
  conflictModalContent: { backgroundColor: "#fff", borderRadius: 24, padding: 20, width: "90%", maxHeight: "85%" },
  conflictModalHeader: { alignItems: "center", marginBottom: 16 },
  conflictModalTitle: { fontSize: 18, fontWeight: "700", color: Colors.dark, marginTop: 12, textAlign: "center" },
  conflictModalMessage: { fontSize: 14, color: Colors.gray, textAlign: "center", marginBottom: 16, lineHeight: 20 },
  conflictRequestCard: { backgroundColor: "#F9FAFB", borderRadius: 16, padding: 16, marginBottom: 12, borderWidth: 1, borderColor: "#E5E7EB" },
  conflictRequestHeader: { flexDirection: "row", alignItems: "center", gap: 12, marginBottom: 12 },
  conflictRequestTitle: { fontSize: 16, fontWeight: "700", color: Colors.dark },
  conflictRequestDetails: { fontSize: 14, color: "#4B5563", marginBottom: 4 },
  conflictModalSeatsInfo: { fontSize: 13, color: Colors.gray, textAlign: "center", marginBottom: 12, fontWeight: "600" },
  conflictModalNote: { fontSize: 12, color: "#F59E0B", textAlign: "center", marginBottom: 16, fontStyle: "italic" },
  conflictModalCloseBtn: { paddingVertical: 14, alignItems: "center", borderRadius: 12, backgroundColor: Colors.primary },
  conflictModalCloseBtnText: { color: "#fff", fontWeight: "700", fontSize: 16 },
});