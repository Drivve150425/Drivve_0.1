// import React, { useMemo, useRef, useState, useEffect, useCallback } from 'react';
// import {
//   View, Text, StyleSheet, TouchableOpacity, ScrollView, Platform,
//   StatusBar, Image, Dimensions, Animated, PanResponder, Modal,
//   LogBox, TextInput, Share, Alert
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

// LogBox.ignoreLogs(['Accessibility: View', 'Property accessibilityState', 'RCTView']);

// const { height, width } = Dimensions.get('window');
// const SAFE_TOP = Platform.OS === 'ios' ? 56 : 24;
// const COLLAPSED_HEIGHT = 84;
// const EXPANDED_HEIGHT = height * 0.72;

// // ============================================
// // UTILITY FUNCTIONS
// // ============================================

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
//     if (item && typeof item === 'object' && item.latitude && item.longitude) {
//       return { longitude: Number(item.longitude), latitude: Number(item.latitude) };
//     }
//     return parseSuggestedPoint(item);
//   }).filter(Boolean);
// }

// function isSvgUrl(url) {
//   if (!url) return false;
//   return url.toLowerCase().includes('.svg') || url.toLowerCase().includes('.svg?');
// }

// function calculateDistance(lat1, lon1, lat2, lon2) {
//   const R = 6371000;
//   const dLat = (lat2 - lat1) * Math.PI / 180;
//   const dLon = (lon2 - lon1) * Math.PI / 180;
//   const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
//             Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
//             Math.sin(dLon/2) * Math.sin(dLon/2);
//   const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
//   return R * c;
// }

// function formatDistance(meters) {
//   if (!meters) return 'Unknown';
//   if (meters < 1000) return `${Math.round(meters)} m`;
//   return `${(meters / 1000).toFixed(1)} km`;
// }

// function formatDate(dateString) {
//   if (!dateString) return 'Date not set';
//   const date = new Date(dateString);
//   const today = new Date();
//   const tomorrow = new Date(today);
//   tomorrow.setDate(tomorrow.getDate() + 1);
//   const isToday = date.toDateString() === today.toDateString();
//   const isTomorrow = date.toDateString() === tomorrow.toDateString();
//   let dayText = "";
//   if (isToday) dayText = "Today";
//   else if (isTomorrow) dayText = "Tomorrow";
//   else dayText = date.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" });
//   const timeText = date.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit", hour12: true });
//   return `${dayText}, ${timeText}`;
// }

// function formatTimeOnly(dateString) {
//   if (!dateString) return '--:--';
//   const date = new Date(dateString);
//   return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });
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

// // ============================================
// // COMPONENTS
// // ============================================

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

// // ============================================
// // MAIN SCREEN COMPONENT
// // ============================================

// export default function ViewRouteRequestScreen({ navigation, route }) {
//   const { user } = useAuth();
//   const params = route.params || {};
//   const initialRide = params.ride || null;
//   const booking = params.booking || null;

//   // State for ride data - initialize directly from params
//   const [currentRide, setCurrentRide] = useState(() => {
//     if (initialRide && initialRide.id) {
//       return initialRide;
//     }
//     if (booking?.ride) {
//       return booking.ride;
//     }
//     return null;
//   });

//   const [userBooking, setUserBooking] = useState(() => {
//     if (booking && booking.id) {
//       return {
//         id: booking.id,
//         seats_requested: booking.seats_requested || 1,
//         status: booking.status || 'pending',
//         total_amount: booking.total_amount,
//         created_at: booking.created_at,
//       };
//     }
//     if (initialRide?.booking && initialRide.booking.id) {
//       return {
//         id: initialRide.booking.id,
//         seats_requested: initialRide.booking.seats_requested || 1,
//         status: initialRide.booking.status || 'pending',
//         total_amount: initialRide.booking.total_amount,
//       };
//     }
//     if (initialRide?.seatsRequested) {
//       return {
//         id: initialRide.id,
//         seats_requested: initialRide.seatsRequested,
//         status: 'accepted',
//       };
//     }
//     return null;
//   });

//   const [driverProfile, setDriverProfile] = useState(null);
//   const [isVerified, setIsVerified] = useState(false);
//   const [loadingProfile, setLoadingProfile] = useState(false);
  
//   // UI State
//   const [drawerExpanded, setDrawerExpanded] = useState(true);
//   const [mapReady, setMapReady] = useState(false);
//   const [showCancelModal, setShowCancelModal] = useState(false);
//   const [ratingModalVisible, setRatingModalVisible] = useState(false);
//   const [selectedProfile, setSelectedProfile] = useState({ visible: false, imageUrl: null, driverName: '' });
//   const [alertVisible, setAlertVisible] = useState(false);
//   const [alertConfig, setAlertConfig] = useState({ title: "", message: "", icon: "check-circle", iconColor: "#10B981", buttons: [] });
  
//   // Seat related state
//   const [seatsRequested, setSeatsRequested] = useState(() => {
//     if (booking?.seats_requested) return booking.seats_requested;
//     if (initialRide?.seatsRequested) return initialRide.seatsRequested;
//     return 1;
//   });
//   const [modifyingSeats, setModifyingSeats] = useState(false);
//   const [totalSeatsOffered, setTotalSeatsOffered] = useState(() => initialRide?.available_seats || 4);
//   const [totalBookedSeats, setTotalBookedSeats] = useState(() => booking?.seats_requested || initialRide?.seatsRequested || 0);
//   const [availableSeats, setAvailableSeats] = useState(() => (initialRide?.available_seats || 4) - (booking?.seats_requested || initialRide?.seatsRequested || 0));
//   const [otherRiders, setOtherRiders] = useState([]);
  
//   // Modification request state
//   const [seatModificationRequested, setSeatModificationRequested] = useState(false);
//   const [pendingSeatsRequest, setPendingSeatsRequest] = useState(null);
//   const [pendingRequestDetails, setPendingRequestDetails] = useState(null);
//   const [pendingModificationRequest, setPendingModificationRequest] = useState(null);
  
//   // Live tracking state
//   const [liveSession, setLiveSession] = useState(null);
//   const [driverLocation, setDriverLocation] = useState(null);
//   const [driverETA, setDriverETA] = useState(null);
//   const [driverDistance, setDriverDistance] = useState(null);
//   const [socketConnected, setSocketConnected] = useState(false);
  
//   // Rating state
//   const [rating, setRating] = useState(0);
//   const [feedback, setFeedback] = useState('');
//   const [submitting, setSubmitting] = useState(false);
//   const [hasRatedDriver, setHasRatedDriver] = useState(false);
//   const [rideCompleted, setRideCompleted] = useState(false);
//   const [completedRideDetails, setCompletedRideDetails] = useState(null);
  
//   // Cancel state
//   const [cancelLoading, setCancelLoading] = useState(false);
  
//   // Refs
//   const animatedDrawer = useRef(new Animated.Value(1)).current;
//   const mapRef = useRef(null);
//   const socketRef = useRef(null);
//   const hasShownRatingModal = useRef(false);
  
//   // Animation values
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
  
//   // Helper functions
//   const showCustomAlert = (title, message, type = 'success') => {
//     let icon = "check-circle";
//     let iconColor = "#10B981";
//     if (type === 'error') { icon = "error"; iconColor = "#EF4444"; }
//     else if (type === 'warning') { icon = "warning"; iconColor = "#F59E0B"; }
//     else if (type === 'info') { icon = "info"; iconColor = Colors.primary; }
//     setAlertConfig({ title, message, icon, iconColor, buttons: [{ text: 'OK', onPress: () => setAlertVisible(false) }] });
//     setAlertVisible(true);
//   };
  
//   const getProfilePhotoUrl = () => {
//     const rawUrl = driverProfile?.profile_picture || currentRide?.profilePicture || currentRide?.driverProfilePicture;
//     if (!rawUrl) return null;
//     return buildImageUrl(rawUrl);
//   };
  
//   // Add this function to get ride ID from booking
//   const getCorrectRideId = useCallback(async () => {
//     if (!userBooking?.id) return null;
    
//     try {
//       const response = await fetch(`${API_BASE_URL}/api/v1/bookings/${userBooking.id}/ride?_t=${Date.now()}`);
//       const data = await response.json();
      
//       if (data.success && data.ride) {
//         console.log('✅ Got correct ride ID from booking API:', data.ride.id);
//         return data.ride.id;
//       }
//       return null;
//     } catch (error) {
//       console.log('Error fetching ride from booking:', error);
//       return null;
//     }
//   }, [userBooking?.id]);

//   // Fetch modification requests
//   const fetchModificationRequests = useCallback(async () => {
//     if (!userBooking?.id) return;
    
//     try {
//       const response = await fetch(`${API_BASE_URL}/booking/${userBooking.id}/modification-request?_t=${Date.now()}`);
//       const data = await response.json();
      
//       console.log('📋 Modification request response:', data);
      
//       if (data.has_pending && data.request) {
//         setPendingModificationRequest(data.request);
//         setSeatModificationRequested(true);
//         setPendingSeatsRequest(data.request.requested_seats);
//         setPendingRequestDetails(data.request);
//       } else {
//         setPendingModificationRequest(null);
//         setSeatModificationRequested(false);
//         setPendingSeatsRequest(null);
//         setPendingRequestDetails(null);
//       }
//     } catch (error) {
//       console.log('Error fetching modification request:', error);
//     }
//   }, [userBooking?.id]);
  
//   // Handle cancel modification request
//   const handleCancelModificationRequest = async () => {
//     if (!userBooking?.id) return;
    
//     setModifyingSeats(true);
//     try {
//       const response = await fetch(`${API_BASE_URL}/api/v1/modifications/booking/${userBooking.id}/cancel`, {
//         method: 'DELETE',
//         headers: { 'Content-Type': 'application/json' },
//       });
//       const data = await response.json();
      
//       if (!response.ok) throw new Error(data.detail || data.message || 'Failed to cancel modification request');
      
//       showCustomAlert('Request Cancelled', 'Your seat modification request has been cancelled.', 'success');
//       setSeatModificationRequested(false);
//       setPendingSeatsRequest(null);
//       setPendingRequestDetails(null);
//       setPendingModificationRequest(null);
//       await fetchModificationRequests();
//     } catch (error) {
//       console.error('Cancel modification error:', error);
//       showCustomAlert('Error', error.message || 'Failed to cancel modification request', 'error');
//     } finally {
//       setModifyingSeats(false);
//     }
//   };

//   // Update fetchSeatAvailability to use the correct ride ID
//   const fetchSeatAvailability = useCallback(async () => {
//     let rideId = currentRide?.id;
    
//     if (!rideId || rideId === 3 || rideId === 0) {
//       const correctId = await getCorrectRideId();
//       if (correctId) {
//         rideId = correctId;
//         setCurrentRide(prev => ({ ...prev, id: correctId }));
//       } else {
//         console.log('❌ Could not get valid ride ID');
//         return;
//       }
//     }
    
//     console.log('✅ Fetching passengers for ride ID:', rideId);
    
//     try {
//       const url = `${API_BASE_URL.replace(/\/$/, '')}/ride/${rideId}/passengers?_t=${Date.now()}`;
//       console.log('📡 Fetching from URL:', url);
      
//       const response = await fetch(url);
//       console.log('📡 Response status:', response.status);
      
//       if (response.ok) {
//         const data = await response.json();
//         console.log('📡 API Response:', JSON.stringify(data, null, 2));
        
//         const totalSeats = data.available_seats || currentRide?.available_seats || 4;
//         setTotalSeatsOffered(totalSeats);
        
//         const totalBooked = data.total_booked_seats || 0;
//         setTotalBookedSeats(totalBooked);
//         setAvailableSeats(Math.max(0, totalSeats - totalBooked));
        
//         if (data.passengers && Array.isArray(data.passengers) && user?.phone_number) {
//           const normalizePhone = (phone) => {
//             if (!phone) return '';
//             let cleaned = phone.replace(/\s/g, '').replace(/-/g, '');
//             if (cleaned.startsWith('+91')) return cleaned;
//             if (cleaned.startsWith('91') && cleaned.length === 12) return `+${cleaned}`;
//             if (cleaned.startsWith('+')) return cleaned;
//             return `+91${cleaned}`;
//           };
          
//           const currentUserPhone = normalizePhone(user.phone_number);
//           console.log('📱 Current user phone:', currentUserPhone);
          
//           const acceptedPassengers = data.passengers.filter(p => p.status === 'accepted');
//           console.log('✅ Accepted passengers count:', acceptedPassengers.length);
          
//           const otherAccepted = acceptedPassengers.filter(p => {
//             const passengerPhone = normalizePhone(p.passenger_phone);
//             return passengerPhone !== currentUserPhone;
//           });
          
//           console.log('👥 Other riders found:', otherAccepted.length);
//           console.log('👥 Other riders:', otherAccepted);
          
//           setOtherRiders(otherAccepted);
//         } else {
//           console.log('❌ No passengers array or no user phone');
//           setOtherRiders([]);
//         }
//       } else if (response.status === 404) {
//         console.log('ℹ️ Ride not found - this might be normal if no passengers yet');
//         setOtherRiders([]);
//         setTotalSeatsOffered(currentRide?.available_seats || 4);
//         setTotalBookedSeats(0);
//         setAvailableSeats(currentRide?.available_seats || 4);
//       } else {
//         console.log('❌ API response not OK:', response.status);
//         const errorText = await response.text();
//         console.log('Error response:', errorText);
//       }
//     } catch (error) {
//       console.log('❌ Error fetching seat availability:', error);
//     }
//   }, [currentRide?.id, currentRide?.available_seats, user?.phone_number, getCorrectRideId]);

//   // Update loadDriverData to use correct ride ID
//   const loadDriverData = useCallback(async () => {
//     let rideId = currentRide?.id;
//     if (!rideId || rideId === 3 || rideId === 0) {
//       const correctId = await getCorrectRideId();
//       if (correctId) {
//         rideId = correctId;
//         setCurrentRide(prev => ({ ...prev, id: correctId }));
//       }
//     }
    
//     let driverPhone = currentRide?.phoneNumber || currentRide?.driver_phone;
//     let driverUserId = currentRide?.driverUserId || currentRide?.driver_user_id;
    
//     if ((!driverPhone && !driverUserId) && userBooking?.id) {
//       try {
//         const response = await fetch(`${API_BASE_URL}/api/v1/bookings/${userBooking.id}/ride?_t=${Date.now()}`);
//         const data = await response.json();
//         if (data.success && data.ride) {
//           driverPhone = data.ride.driver_phone;
//           driverUserId = data.ride.driver_user_id;
//           setCurrentRide(prev => ({ ...prev, 
//             phoneNumber: driverPhone, 
//             driver_phone: driverPhone,
//             driverUserId: driverUserId,
//             driverName: data.ride.driver_name,
//             from: data.ride.origin,
//             to: data.ride.destination,
//             departure_time: data.ride.departure_time,
//             price: data.ride.price_per_seat,
//             available_seats: data.ride.available_seats,
//             routeCoordinates: data.ride.route_coordinates,
//           }));
//         }
//       } catch (error) {
//         console.log('Error fetching ride details:', error);
//       }
//     }
    
//     if (!driverPhone && !driverUserId) {
//       console.log('No driver contact info available');
//       return;
//     }
    
//     setLoadingProfile(true);
//     try {
//       const params = new URLSearchParams();
//       if (driverUserId) params.append('user_id', driverUserId);
//       else if (driverPhone) params.append('phone_number', driverPhone);
//       params.append('_t', Date.now());
      
//       const profileRes = await fetch(`${API_BASE_URL}/api/v1/users/profile-public?${params.toString()}`);
//       const profileData = await profileRes.json();
      
//       if (profileData?.success && profileData.user) {
//         setDriverProfile(profileData.user);
//       }
      
//       if (driverPhone) {
//         const docsRes = await fetch(`${API_BASE_URL}/api/v1/documents/user/${driverPhone}`);
//         const docsData = await docsRes.json();
//         if (docsData?.success && docsData.documents) {
//           const verifiedDocs = docsData.documents.filter(doc => {
//             const status = doc.status?.toUpperCase();
//             return status === 'APPROVED' && ['aadhar', 'dl', 'rc'].includes(doc.document_type?.toLowerCase());
//           });
//           setIsVerified(verifiedDocs.length > 0);
//         }
//       }
//     } catch (error) {
//       console.log('Error loading driver data:', error);
//     } finally {
//       setLoadingProfile(false);
//     }
//   }, [currentRide, userBooking?.id, getCorrectRideId]);

//   // Add useEffect to initialize data when component mounts
//   useEffect(() => {
//     const initializeData = async () => {
//       if (userBooking?.id) {
//         try {
//           const response = await fetch(`${API_BASE_URL}/api/v1/bookings/${userBooking.id}/ride?_t=${Date.now()}`);
//           const data = await response.json();
          
//           if (data.success && data.ride) {
//             console.log('✅ Fetched ride details from booking API:', data.ride.id);
            
//             setCurrentRide({
//               id: data.ride.id,
//               available_seats: data.ride.available_seats,
//               price: data.ride.price_per_seat,
//               from: data.ride.origin,
//               to: data.ride.destination,
//               departure_time: data.ride.departure_time,
//               phoneNumber: data.ride.driver_phone,
//               driverName: data.ride.driver_name,
//               driverUserId: data.ride.driver_user_id,
//               routeCoordinates: data.ride.route_coordinates,
//               distance_km: data.ride.distance_km,
//               duration_text: data.ride.duration_text,
//               status: data.ride.status,
//               women_only: data.ride.women_only,
//               rating: data.ride.driver_rating || 4.5,
//               origin_lat: data.ride.origin_latitude,
//               origin_lon: data.ride.origin_longitude,
//               suggestedPickup: data.ride.suggested_pickup_point,
//               suggestedDrop: data.ride.suggested_drop_point,
//             });
            
//             const totalSeats = data.ride.available_seats || 4;
//             setTotalSeatsOffered(totalSeats);
//             setTotalBookedSeats(data.ride.total_booked_seats || userBooking.seats_requested || 1);
//             setAvailableSeats(totalSeats - (data.ride.total_booked_seats || userBooking.seats_requested || 1));
            
//             await fetchPassengersForRide(data.ride.id);
//             await loadDriverProfile(data.ride.driver_phone, data.ride.driver_user_id);
//             await fetchModificationRequests();
//           }
//         } catch (error) {
//           console.log('Error initializing ride data:', error);
//         }
//       }
//     };
    
//     initializeData();
//   }, [userBooking?.id]);

//   // Helper function to fetch passengers
//   const fetchPassengersForRide = async (rideId) => {
//     if (!rideId || rideId === 3 || rideId === 0) return;
    
//     try {
//       const url = `${API_BASE_URL.replace(/\/$/, '')}/ride/${rideId}/passengers?_t=${Date.now()}`;
//       console.log('📡 Fetching passengers from:', url);
      
//       const response = await fetch(url);
      
//       if (response.ok) {
//         const data = await response.json();
//         console.log('📡 Passengers data:', data);
        
//         if (data.passengers && Array.isArray(data.passengers) && user?.phone_number) {
//           const normalizePhone = (phone) => {
//             if (!phone) return '';
//             let cleaned = phone.replace(/\s/g, '').replace(/-/g, '');
//             if (cleaned.startsWith('+91')) return cleaned;
//             if (cleaned.startsWith('91') && cleaned.length === 12) return `+${cleaned}`;
//             if (cleaned.startsWith('+')) return cleaned;
//             return `+91${cleaned}`;
//           };
          
//           const currentUserPhone = normalizePhone(user.phone_number);
//           const acceptedPassengers = data.passengers.filter(p => p.status === 'accepted');
//           const otherAccepted = acceptedPassengers.filter(p => {
//             const passengerPhone = normalizePhone(p.passenger_phone);
//             return passengerPhone !== currentUserPhone;
//           });
          
//           console.log('👥 Other riders:', otherAccepted);
//           setOtherRiders(otherAccepted);
//         }
//       } else {
//         console.log('Failed to fetch passengers, status:', response.status);
//       }
//     } catch (error) {
//       console.log('Error fetching passengers:', error);
//     }
//   };

//   // Helper function to load driver profile
//   const loadDriverProfile = async (driverPhone, driverUserId) => {
//     if (!driverPhone && !driverUserId) return;
    
//     try {
//       const params = new URLSearchParams();
//       if (driverUserId) params.append('user_id', driverUserId);
//       else if (driverPhone) params.append('phone_number', driverPhone);
//       params.append('_t', Date.now());
      
//       const profileRes = await fetch(`${API_BASE_URL}/api/v1/users/profile-public?${params.toString()}`);
//       const profileData = await profileRes.json();
      
//       if (profileData?.success && profileData.user) {
//         setDriverProfile(profileData.user);
//       }
//     } catch (error) {
//       console.log('Error loading driver profile:', error);
//     }
//   };
  
//   // Check live session
//   const checkLiveSession = useCallback(async () => {
//     const rideId = currentRide?.id;
//     if (!rideId) return;
    
//     try {
//       const response = await fetch(`${API_BASE_URL}/ride/${rideId}/live-session`);
//       const data = await response.json();
//       if (data.success && data.session) {
//         setLiveSession(data.session);
//       }
//     } catch (error) {
//       console.log('Error checking live session:', error);
//     }
//   }, [currentRide?.id]);
  
//   // Check session status
//   const checkSessionStatus = useCallback(async () => {
//     const bookingId = userBooking?.id;
//     if (!bookingId) return;
    
//     try {
//       const res = await fetch(`${API_BASE_URL}/ride-session/rider/${bookingId}/status?rider_phone=${user?.phone_number}&_t=${Date.now()}`);
//       const data = await res.json();
      
//       if (data.ride_completed) {
//         setRideCompleted(true);
//         setHasRatedDriver(data.has_rated_driver);
//       }
//     } catch (error) {
//       console.log('Error checking session status:', error);
//     }
//   }, [userBooking?.id, user?.phone_number]);
  
//   // Get ride status
//   const getRideStatus = useCallback(() => {
//     if (rideCompleted) return 'completed';
//     if (!currentRide?.departure_time) return 'unknown';
//     if (currentRide?.cancellation_reason) {
//       if (currentRide.cancellation_reason.includes("Auto-cancelled")) return 'auto-cancelled';
//       return 'cancelled';
//     }
    
//     const now = new Date();
//     const departureTime = new Date(currentRide.departure_time);
//     const minutesToDeparture = (departureTime - now) / (1000 * 60);
//     const minutesSinceDeparture = (now - departureTime) / (1000 * 60);
    
//     if (currentRide?.started_at && !rideCompleted) return 'ongoing';
//     if (currentRide?.status === 'completed' || rideCompleted) return 'completed';
//     if (minutesSinceDeparture > 30) return 'expired';
//     if (minutesToDeparture <= 0 && minutesSinceDeparture <= 30) return 'late';
//     if (minutesToDeparture <= 15) return 'upcoming-soon';
//     if (minutesToDeparture > 15) return 'upcoming';
//     return 'unknown';
//   }, [currentRide?.departure_time, currentRide?.cancellation_reason, currentRide?.started_at, currentRide?.status, rideCompleted]);
  
//   const canModifySeats = useCallback(() => {
//     if (!userBooking) return false;
//     const rideStatus = getRideStatus();
//     if (rideCompleted) return false;
//     if (currentRide?.cancellation_reason || currentRide?.started_at) return false;
//     if (userBooking.status !== "accepted") return false;
//     if (['expired', 'auto-cancelled', 'upcoming-soon', 'late'].includes(rideStatus)) return false;
//     if (seatModificationRequested) return false;
//     return true;
//   }, [userBooking, getRideStatus, currentRide, seatModificationRequested, rideCompleted]);
  
//   const canCancelBooking = useCallback(() => {
//     if (!userBooking) return false;
//     const rideStatus = getRideStatus();
//     if (rideCompleted) return false;
//     if (currentRide?.cancellation_reason || currentRide?.started_at || currentRide?.status === 'completed') return false;
//     if (['expired', 'auto-cancelled', 'upcoming-soon', 'late'].includes(rideStatus)) return false;
//     if (!["accepted", "pending"].includes(userBooking.status)) return false;
//     return true;
//   }, [userBooking, getRideStatus, currentRide, rideCompleted]);
  
//   const getRideStatusMessage = useCallback(() => {
//     const rideStatus = getRideStatus();
//     const bookingStatus = userBooking?.status;
    
//     if (rideCompleted) {
//       return { message: "Ride completed", type: 'completed', icon: 'checkmark-done-circle', color: '#6B7280' };
//     }
//     if (currentRide?.cancellation_reason) {
//       return { message: currentRide.cancellation_reason, type: 'cancelled', icon: 'alert-circle', color: '#DC2626' };
//     }
//     if (bookingStatus === "rejected") {
//       return { message: "Your booking request was rejected", type: 'rejected', icon: 'close-circle', color: '#DC2626' };
//     }
//     if (bookingStatus === "pending") {
//       return { message: `Waiting for driver confirmation (${userBooking?.seats_requested} seat(s))`, type: 'pending', icon: 'time-outline', color: '#F59E0B' };
//     }
//     if (bookingStatus === "accepted") {
//       if (rideStatus === 'ongoing') return { message: "🚗 Ride in progress!", type: 'ongoing', icon: 'car-sport', color: '#10B981' };
//       if (rideStatus === 'upcoming') return { message: `Booking confirmed! ${userBooking?.seats_requested} seat(s)`, type: 'confirmed', icon: 'checkmark-circle', color: '#10B981' };
//     }
//     return null;
//   }, [getRideStatus, userBooking, currentRide, rideCompleted]);
  
//   // Actions
//   const handleModifySeats = async () => {
//     if (!userBooking || !canModifySeats()) {
//       showCustomAlert('Cannot Modify', 'Modifications are not available at this time.', 'warning');
//       return;
//     }
    
//     const currentSeatsBooked = userBooking.seats_requested || 0;
//     const otherBookedSeats = Math.max(0, totalBookedSeats - currentSeatsBooked);
//     const maxSeatsUserCanRequest = totalSeatsOffered - otherBookedSeats;
    
//     if (maxSeatsUserCanRequest <= 0) {
//       showCustomAlert('No Seats Available', 'No additional seats are available.', 'warning');
//       return;
//     }
//     if (seatsRequested > maxSeatsUserCanRequest) {
//       showCustomAlert('Not Enough Seats', `Only ${maxSeatsUserCanRequest} seat(s) available.`, 'warning');
//       return;
//     }
//     if (seatsRequested < 1) {
//       showCustomAlert('Invalid Seats', 'Minimum 1 seat required.', 'warning');
//       return;
//     }
//     if (seatsRequested === currentSeatsBooked) {
//       showCustomAlert('No Change', 'Seat count is already set to this value.', 'info');
//       return;
//     }
    
//     setModifyingSeats(true);
//     try {
//       const response = await fetch(`${API_BASE_URL}/api/v1/modifications/request/${userBooking.id}`, {
//         method: 'POST',
//         headers: { 'Content-Type': 'application/json' },
//         body: JSON.stringify({ requested_seats: seatsRequested }),
//       });
//       const data = await response.json();
//       if (!response.ok) throw new Error(data.detail || data.message);
      
//       showCustomAlert('Request Sent', `Request to change to ${seatsRequested} seat(s) sent.`, 'info');
//       setSeatModificationRequested(true);
//       setPendingSeatsRequest(seatsRequested);
//       await fetchModificationRequests();
//     } catch (error) {
//       showCustomAlert('Error', error.message, 'error');
//     } finally {
//       setModifyingSeats(false);
//     }
//   };
  
//   const handleCancelBooking = async () => {
//     if (!userBooking || !canCancelBooking()) return;
    
//     setModifyingSeats(true);
//     setCancelLoading(true);
//     try {
//       const response = await fetch(`${API_BASE_URL}/booking/${userBooking.id}/cancel`, {
//         method: 'PUT',
//         headers: { 'Content-Type': 'application/json' },
//       });
//       const data = await response.json();
//       if (!response.ok) throw new Error(data.detail || data.message);
      
//       showCustomAlert('Success', 'Booking cancelled successfully', 'success');
//       setTimeout(() => navigation.goBack(), 1500);
//     } catch (error) {
//       showCustomAlert('Error', error.message, 'error');
//     } finally {
//       setModifyingSeats(false);
//       setCancelLoading(false);
//       setShowCancelModal(false);
//     }
//   };
  
//   const handleRateDriver = async () => {
//     if (rating === 0) {
//       showCustomAlert('Rating Required', 'Please select a rating.', 'warning');
//       return;
//     }
    
//     setSubmitting(true);
//     setTimeout(() => {
//       showCustomAlert('Thank You!', 'Your rating has been submitted', 'success');
//       setHasRatedDriver(true);
//       setRatingModalVisible(false);
//       setRating(0);
//       setFeedback('');
//       setSubmitting(false);
//     }, 1000);
//   };
  
//   const viewDriverProfile = () => {
//     const driverPhone = currentRide?.phoneNumber || currentRide?.driver_phone;
//     const driverUserId = currentRide?.driverUserId || currentRide?.driver_user_id;
//     if (driverPhone || driverUserId) {
//       navigation.navigate('ViewProfileScreen', {
//         userId: driverUserId || null,
//         phoneNumber: driverPhone || null,
//         driverName: driverProfile?.full_name || currentRide?.driverName || 'Driver',
//         profilePicture: getProfilePhotoUrl(),
//       });
//     }
//   };
  
//   const shareRideDetails = async () => {
//     const message = `🚗 *Ride Details* 🚗\n\n` +
//       `From: ${currentRide?.from || currentRide?.origin || 'Pickup'}\n` +
//       `To: ${currentRide?.to || currentRide?.destination || 'Drop'}\n` +
//       `Date: ${formatDate(currentRide?.departure_time)}\n` +
//       `Price: ₹${currentRide?.price || currentRide?.price_per_seat || 0}/seat\n` +
//       `Seats: ${userBooking?.seats_requested || 1}\n` +
//       `Total: ₹${(currentRide?.price || currentRide?.price_per_seat || 0) * (userBooking?.seats_requested || 1)}\n\n` +
//       `Driver: ${driverProfile?.full_name || currentRide?.driverName || 'Driver'}`;
    
//     await Share.share({ message, title: 'Ride Details' });
//   };
  
//   const handleProfileImagePress = () => {
//     const photoUrl = getProfilePhotoUrl();
//     if (photoUrl) {
//       setSelectedProfile({ visible: true, imageUrl: photoUrl, driverName: driverProfile?.full_name || currentRide?.driverName || 'Driver' });
//     } else {
//       showCustomAlert('No Photo', 'Driver has not uploaded a profile picture', 'warning');
//     }
//   };
  
//   const renderStars = () => (
//     <View style={styles.starsRow}>
//       {[1, 2, 3, 4, 5].map((star) => (
//         <TouchableOpacity key={star} onPress={() => setRating(star)}>
//           <Ionicons name={star <= rating ? 'star' : 'star-outline'} size={32} color={star <= rating ? '#F59E0B' : '#D1D5DB'} style={{ marginHorizontal: 4 }} />
//         </TouchableOpacity>
//       ))}
//     </View>
//   );
  
//   // Effects
//   useEffect(() => {
//     if (currentRide) {
//       loadDriverData();
//       fetchSeatAvailability();
//       checkLiveSession();
//       checkSessionStatus();
//     }
//   }, [currentRide]);
  
//   useFocusEffect(
//     useCallback(() => {
//       if (currentRide) {
//         fetchSeatAvailability();
//         checkLiveSession();
//         checkSessionStatus();
//         fetchModificationRequests();
//       }
//       hasShownRatingModal.current = false;
//       return () => {
//         if (socketRef.current) {
//           socketRef.current.disconnect();
//           socketRef.current = null;
//         }
//       };
//     }, [currentRide])
//   );
  
//   // Memoized values for map
//   const profilePhotoUrl = getProfilePhotoUrl();
//   const avatarText = getDriverInitials(driverProfile?.full_name || currentRide?.driverName || 'Driver');
//   const isProfilePhotoSvg = profilePhotoUrl?.toLowerCase().includes('.svg');
//   const allPreferences = useMemo(() => extractAllPreferences(currentRide, driverProfile?.travel_preferences), [currentRide, driverProfile]);
  
//   const driverStart = useMemo(() => {
//     const coords = currentRide?.routeCoordinates;
//     if (Array.isArray(coords) && coords.length > 0) {
//       const first = coords[0];
//       if (Array.isArray(first) && first.length === 2) return { latitude: first[1], longitude: first[0] };
//     }
//     return parseSuggestedPoint(currentRide?.suggestedPickup || currentRide?.suggested_pickup_point);
//   }, [currentRide]);
  
//   const driverEnd = useMemo(() => {
//     const coords = currentRide?.routeCoordinates;
//     if (Array.isArray(coords) && coords.length > 0) {
//       const last = coords[coords.length - 1];
//       if (Array.isArray(last) && last.length === 2) return { latitude: last[1], longitude: last[0] };
//     }
//     return parseSuggestedPoint(currentRide?.suggestedDrop || currentRide?.suggested_drop_point);
//   }, [currentRide]);
  
//   const intersectionPickup = useMemo(() => parseSuggestedPoint(currentRide?.suggestedPickup || currentRide?.suggested_pickup_point), [currentRide]);
//   const intersectionDrop = useMemo(() => parseSuggestedPoint(currentRide?.suggestedDrop || currentRide?.suggested_drop_point), [currentRide]);
  
//   const routePath = useMemo(() => {
//     const fullRoute = parseRouteCoordinates(currentRide?.routeCoordinates);
//     if (fullRoute.length >= 2) return fullRoute;
//     if (intersectionPickup && intersectionDrop) return [intersectionPickup, intersectionDrop];
//     return [];
//   }, [currentRide, intersectionPickup, intersectionDrop]);
  
//   const allMarkerCoords = useMemo(() => {
//     const coords = [];
//     if (driverStart) coords.push(driverStart);
//     if (driverEnd) coords.push(driverEnd);
//     if (intersectionPickup) coords.push(intersectionPickup);
//     if (intersectionDrop) coords.push(intersectionDrop);
//     if (driverLocation) coords.push(driverLocation);
//     return coords;
//   }, [driverStart, driverEnd, intersectionPickup, intersectionDrop, driverLocation]);
  
//   const fitMapToMarkers = useCallback(() => {
//     if (mapRef.current && mapReady && allMarkerCoords.length >= 1) {
//       setTimeout(() => {
//         try {
//           if (allMarkerCoords.length === 1) {
//             mapRef.current.animateToRegion({
//               latitude: allMarkerCoords[0].latitude,
//               longitude: allMarkerCoords[0].longitude,
//               latitudeDelta: 0.01,
//               longitudeDelta: 0.01,
//             }, 500);
//           } else {
//             mapRef.current.fitToCoordinates(allMarkerCoords, {
//               edgePadding: { top: 80, right: 50, bottom: 50, left: 50 },
//               animated: true,
//             });
//           }
//         } catch (e) { console.log('fitToCoordinates error:', e); }
//       }, 500);
//     }
//   }, [mapReady, allMarkerCoords]);
  
//   useEffect(() => {
//     if (mapReady && allMarkerCoords.length >= 1) fitMapToMarkers();
//   }, [mapReady, allMarkerCoords, fitMapToMarkers]);
  
//   const vehicleName = driverProfile?.vehicle?.model || currentRide?.vehicle?.model || 'Vehicle details unavailable';
//   const vehicleRegNumber = driverProfile?.vehicle?.registration_number || currentRide?.vehicle?.registration_number;
//   const vehicleColor = driverProfile?.vehicle?.color || currentRide?.vehicle?.color || 'Not specified';
  
//   const rideStatus = getRideStatus();
//   const modificationsAllowed = canModifySeats();
//   const cancellationsAllowed = canCancelBooking();
//   const rideStatusMessage = getRideStatusMessage();
//   const isAutoCancelled = rideStatus === 'auto-cancelled' || rideStatus === 'expired';
//   const showLiveTracking = liveSession && (rideStatus === 'ongoing' || rideStatus === 'late') && !rideCompleted;
//   const isCompleted = rideStatus === 'completed';
  
//   const otherBookedSeats = totalBookedSeats - (userBooking?.seats_requested || 0);
//   const maxUserCanRequest = totalSeatsOffered - otherBookedSeats;
//   const totalAmountPaid = (currentRide?.price || currentRide?.price_per_seat || 0) * (userBooking?.seats_requested || 1);
  
//   const initialRegion = {
//     latitude: intersectionPickup?.latitude || driverStart?.latitude || 28.6139,
//     longitude: intersectionPickup?.longitude || driverStart?.longitude || 77.2090,
//     latitudeDelta: 0.05,
//     longitudeDelta: 0.05,
//   };
  
//   if (!currentRide) {
//     return (
//       <View style={styles.loaderContainer}>
//         <Text style={{ fontSize: 16, color: Colors.gray, marginBottom: 20 }}>No ride data available</Text>
//         <TouchableOpacity onPress={() => navigation.goBack()} style={{ padding: 12, backgroundColor: Colors.primary, borderRadius: 8 }}>
//           <Text style={{ color: '#fff' }}>Go Back</Text>
//         </TouchableOpacity>
//       </View>
//     );
//   }
  
//   // Main render
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
//           showsUserLocation={true}
//           showsMyLocationButton={true}
//         >
//           {routePath.length >= 2 && <Polyline coordinates={routePath} strokeColor="#2457A6" strokeWidth={5} lineCap="round" lineJoin="round" />}
          
//           {driverStart && (
//             <Marker coordinate={driverStart} anchor={{ x: 0.5, y: 1 }}>
//               <View style={styles.markerWrapper}>
//                 <View style={[styles.pinBubble, { backgroundColor: '#16A34A' }]}><Text style={styles.pinIcon}>S</Text></View>
//                 <View style={[styles.pinPointer, { borderTopColor: '#16A34A' }]} />
//               </View>
//             </Marker>
//           )}
          
//           {driverEnd && (
//             <Marker coordinate={driverEnd} anchor={{ x: 0.5, y: 1 }}>
//               <View style={styles.markerWrapper}>
//                 <View style={[styles.pinBubble, { backgroundColor: '#DC2626' }]}><Text style={styles.pinIcon}>E</Text></View>
//                 <View style={[styles.pinPointer, { borderTopColor: '#DC2626' }]} />
//               </View>
//             </Marker>
//           )}
          
//           {intersectionPickup && (
//             <Marker coordinate={intersectionPickup} anchor={{ x: 0.5, y: 1 }}>
//               <View style={styles.markerWrapper}>
//                 <View style={[styles.pinBubble, { backgroundColor: '#FACC15' }]}><Ionicons name="hand-right" size={12} color="#713F12" /></View>
//                 <View style={[styles.pinPointer, { borderTopColor: '#FACC15' }]} />
//                 <View style={styles.pinLabelBubbleYellow}><Text style={styles.pinLabelTextYellow}>Meet Driver</Text></View>
//               </View>
//             </Marker>
//           )}
          
//           {intersectionDrop && (
//             <Marker coordinate={intersectionDrop} anchor={{ x: 0.5, y: 1 }}>
//               <View style={styles.markerWrapper}>
//                 <View style={[styles.pinBubble, { backgroundColor: '#FACC15' }]}><Ionicons name="exit" size={12} color="#713F12" /></View>
//                 <View style={[styles.pinPointer, { borderTopColor: '#FACC15' }]} />
//                 <View style={styles.pinLabelBubbleYellow}><Text style={styles.pinLabelTextYellow}>Exit Here</Text></View>
//               </View>
//             </Marker>
//           )}
//         </MapView>
        
//         <TouchableOpacity style={styles.mapBackButton} onPress={() => navigation.goBack()}>
//           <Ionicons name="chevron-back" size={26} color={Colors.secondary} />
//         </TouchableOpacity>
        
//         {showLiveTracking && (
//           <TouchableOpacity style={styles.liveTrackingButton} onPress={() => navigation.navigate('OngoingRideRiderScreen', { bookingId: userBooking?.id, sessionId: liveSession?.session_id })}>
//             <View style={styles.liveDot} />
//             <Text style={styles.liveTrackingButtonText}>Track Live Ride</Text>
//           </TouchableOpacity>
//         )}
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
//                 <Text style={styles.collapsedDriver} numberOfLines={1}>{driverProfile?.full_name || currentRide?.driverName || 'Driver'}</Text>
//                 <Text style={styles.collapsedSub} numberOfLines={1}>{currentRide?.from || currentRide?.origin || 'Pickup'} → {currentRide?.to || currentRide?.destination || 'Drop'}</Text>
//               </View>
//               <View style={styles.collapsedPriceWrap}>
//                 <Text style={styles.collapsedPrice}>₹{currentRide?.price || currentRide?.price_per_seat || 0}</Text>
//                 <Text style={styles.collapsedPerSeat}>per seat</Text>
//               </View>
//             </View>
//           </View>
//         ) : (
//           <ScrollView style={styles.drawerScroll} contentContainerStyle={styles.drawerContent}>
//             {/* Status Banner */}
//             {rideStatusMessage && (
//               <View style={[styles.statusBanner, { backgroundColor: rideStatusMessage.color + '20' }]}>
//                 <Ionicons name={rideStatusMessage.icon} size={20} color={rideStatusMessage.color} />
//                 <Text style={[styles.statusBannerText, { color: rideStatusMessage.color, flex: 1 }]}>{rideStatusMessage.message}</Text>
//               </View>
//             )}
            
//             {/* Driver Card */}
//             <View style={styles.driverCard}>
//               <View style={styles.driverTopRow}>
//                 <View style={styles.driverLeftWrap}>
//                   <TouchableOpacity style={styles.driverAvatar} onPress={handleProfileImagePress}>
//                     {profilePhotoUrl ? (
//                       isProfilePhotoSvg ? (
//                         <View style={styles.svgAvatarContainer}><SvgCssUri uri={profilePhotoUrl} width={56} height={56} /></View>
//                       ) : (
//                         <Image source={{ uri: profilePhotoUrl }} style={styles.avatarImg} />
//                       )
//                     ) : (
//                       <View style={styles.avatarPlaceholder}>
//                         <Text style={styles.avatarText}>{avatarText}</Text>
//                       </View>
//                     )}
//                   </TouchableOpacity>
//                   <View style={styles.driverMeta}>
//                     <View style={styles.driverNameRow}>
//                       <Text style={styles.driverName}>{driverProfile?.full_name || currentRide?.driverName || 'Driver'}</Text>
//                       {isVerified && <Ionicons name="checkmark-circle" size={14} color="#2457A6" />}
//                     </View>
//                     <View style={styles.ratingRow}>
//                       <Ionicons name="star" size={13} color="#F59E0B" />
//                       <Text style={styles.ratingText}>{driverProfile?.avg_rating || currentRide?.rating || 4.5}</Text>
//                     </View>
//                   </View>
//                 </View>
//               </View>
//               <TouchableOpacity style={styles.profileOutlineBtn} onPress={viewDriverProfile}>
//                 <Text style={styles.profileOutlineBtnText}>View Full Profile</Text>
//               </TouchableOpacity>
//             </View>
            
//             {/* Trip Details Section */}
//             <View style={styles.cardSection}>
//               <Text style={styles.sectionTitle}>📍 Trip Details</Text>
              
//               <View style={styles.tripItem}>
//                 <View style={styles.tripIconContainer}>
//                   <Ionicons name="location" size={20} color="#16A34A" />
//                 </View>
//                 <View style={styles.tripDetails}>
//                   <Text style={styles.tripLabel}>From</Text>
//                   <Text style={styles.tripValue}>{currentRide?.from || currentRide?.origin || 'Pickup location'}</Text>
//                 </View>
//               </View>
              
//               <View style={styles.tripDivider} />
              
//               <View style={styles.tripItem}>
//                 <View style={styles.tripIconContainer}>
//                   <Ionicons name="flag" size={20} color="#DC2626" />
//                 </View>
//                 <View style={styles.tripDetails}>
//                   <Text style={styles.tripLabel}>To</Text>
//                   <Text style={styles.tripValue}>{currentRide?.to || currentRide?.destination || 'Drop location'}</Text>
//                 </View>
//               </View>
              
//               <View style={styles.tripMetaRow}>
//                 <View style={styles.tripMetaItem}>
//                   <Ionicons name="calendar-outline" size={16} color={Colors.gray} />
//                   <Text style={styles.tripMetaText}>{formatDate(currentRide?.departure_time)}</Text>
//                 </View>
//                 {currentRide?.distance_km && (
//                   <View style={styles.tripMetaItem}>
//                     <Ionicons name="map-outline" size={16} color={Colors.gray} />
//                     <Text style={styles.tripMetaText}>{currentRide.distance_km} km</Text>
//                   </View>
//                 )}
//                 {currentRide?.duration_text && (
//                   <View style={styles.tripMetaItem}>
//                     <Ionicons name="time-outline" size={16} color={Colors.gray} />
//                     <Text style={styles.tripMetaText}>{currentRide.duration_text}</Text>
//                   </View>
//                 )}
//               </View>
//             </View>
            
//             {/* Vehicle Details Section */}
//             <View style={styles.cardSection}>
//               <Text style={styles.sectionTitle}>🚗 Vehicle Details</Text>
//               <View style={styles.vehicleDetailRow}>
//                 <Ionicons name="car-sport-outline" size={24} color="#2457A6" />
//                 <View style={styles.vehicleDetailInfo}>
//                   <Text style={styles.vehicleDetailName}>{vehicleName}</Text>
//                   <Text style={styles.vehicleDetailColor}>Color: {vehicleColor}</Text>
//                   {vehicleRegNumber && <Text style={styles.vehicleDetailReg}>Registration: {vehicleRegNumber}</Text>}
//                   <Text style={styles.vehicleDetailSeats}>Total Seats: {totalSeatsOffered}</Text>
//                 </View>
//               </View>
//             </View>
            
//             {/* Seat Availability Section */}
//             <View style={styles.cardSection}>
//               <Text style={styles.sectionTitle}>💺 Seat Availability</Text>
//               <View style={styles.seatStatsRow}>
//                 <View style={styles.seatStat}>
//                   <Text style={styles.seatStatValue}>{totalSeatsOffered}</Text>
//                   <Text style={styles.seatStatLabel}>Total Seats</Text>
//                 </View>
//                 <View style={styles.seatStat}>
//                   <Text style={[styles.seatStatValue, { color: '#10B981' }]}>{totalBookedSeats}</Text>
//                   <Text style={styles.seatStatLabel}>Booked</Text>
//                 </View>
//                 <View style={styles.seatStat}>
//                   <Text style={[styles.seatStatValue, { color: '#F59E0B' }]}>{availableSeats}</Text>
//                   <Text style={styles.seatStatLabel}>Available</Text>
//                 </View>
//               </View>
//               <View style={styles.seatProgressContainer}>
//                 <View style={[styles.seatProgressBar, { width: `${totalSeatsOffered > 0 ? (totalBookedSeats / totalSeatsOffered) * 100 : 0}%` }]} />
//               </View>
//             </View>
            
//             {/* Ride Preferences Section */}
//             {allPreferences.length > 0 && (
//               <View style={styles.cardSection}>
//                 <Text style={styles.sectionTitle}>🎯 Ride Preferences</Text>
//                 <View style={styles.tagRow}>
//                   {allPreferences.map((pref, index) => (
//                     <GenericPreferenceTag key={`${pref}-${index}`} label={pref} />
//                   ))}
//                 </View>
//               </View>
//             )}
            
//             {/* Booking Details Section */}
//             <View style={styles.cardSection}>
//               <Text style={styles.sectionTitle}>📋 Your Booking</Text>
              
//               {userBooking ? (
//                 <>
//                   <View style={styles.bookingDetailRow}>
//                     <Text style={styles.bookingDetailLabel}>Booking ID</Text>
//                     <Text style={styles.bookingDetailValue}>#{userBooking.id}</Text>
//                   </View>
//                   <View style={styles.bookingDetailRow}>
//                     <Text style={styles.bookingDetailLabel}>Seats Booked</Text>
//                     <Text style={styles.bookingDetailValue}>{userBooking.seats_requested}</Text>
//                   </View>
//                   <View style={styles.bookingDetailRow}>
//                     <Text style={styles.bookingDetailLabel}>Price per Seat</Text>
//                     <Text style={styles.bookingDetailValue}>₹{currentRide?.price || currentRide?.price_per_seat || 0}</Text>
//                   </View>
//                   <View style={[styles.bookingDetailRow, styles.bookingTotalRow]}>
//                     <Text style={styles.bookingTotalLabel}>Total Amount</Text>
//                     <Text style={styles.bookingTotalValue}>₹{totalAmountPaid}</Text>
//                   </View>
//                   <View style={styles.bookingDetailRow}>
//                     <Text style={styles.bookingDetailLabel}>Status</Text>
//                     <View style={[styles.bookingStatusBadge, { backgroundColor: userBooking.status === 'accepted' ? '#10B98120' : userBooking.status === 'pending' ? '#F59E0B20' : '#EF444420' }]}>
//                       <Text style={[styles.bookingStatusText, { color: userBooking.status === 'accepted' ? '#10B981' : userBooking.status === 'pending' ? '#F59E0B' : '#EF4444' }]}>
//                         {userBooking.status === 'accepted' ? 'Confirmed' : userBooking.status === 'pending' ? 'Pending' : userBooking.status}
//                       </Text>
//                     </View>
//                   </View>
//                 </>
//               ) : (
//                 <Text style={styles.emptyText}>No booking information available</Text>
//               )}
              
//               {/* Pending Modification Request Section */}
//               {pendingModificationRequest && pendingModificationRequest.status === 'pending' && (
//                 <>
//                   <View style={styles.divider} />
//                   <View style={styles.pendingModificationHeader}>
//                     <Ionicons name="time-outline" size={24} color="#F59E0B" />
//                     <Text style={styles.pendingModificationTitle}>Pending Modification Request</Text>
//                   </View>
                  
//                   <View style={styles.pendingModificationDetails}>
//                     <View style={styles.modificationDetailRow}>
//                       <Text style={styles.modificationDetailLabel}>Current Seats:</Text>
//                       <Text style={styles.modificationDetailValue}>{pendingModificationRequest.current_seats || userBooking?.seats_requested}</Text>
//                     </View>
//                     <View style={styles.modificationDetailRow}>
//                       <Text style={styles.modificationDetailLabel}>Requested Seats:</Text>
//                       <Text style={[styles.modificationDetailValue, { color: '#F59E0B', fontWeight: '800' }]}>
//                         {pendingModificationRequest.requested_seats || pendingSeatsRequest}
//                       </Text>
//                     </View>
//                     <View style={styles.modificationDetailRow}>
//                       <Text style={styles.modificationDetailLabel}>Status:</Text>
//                       <View style={[styles.pendingBadge, { backgroundColor: '#FEF3C7' }]}>
//                         <Text style={[styles.pendingBadgeText, { color: '#D97706' }]}>Waiting for Driver Approval</Text>
//                       </View>
//                     </View>
//                     {pendingModificationRequest.created_at && (
//                       <Text style={styles.modificationDate}>
//                         Requested on: {new Date(pendingModificationRequest.created_at).toLocaleString()}
//                       </Text>
//                     )}
//                   </View>
                  
//                   <TouchableOpacity 
//                     style={styles.cancelModificationBtn}
//                     onPress={handleCancelModificationRequest}
//                     disabled={modifyingSeats}
//                   >
//                     <Text style={styles.cancelModificationBtnText}>
//                       {modifyingSeats ? 'Cancelling...' : 'Cancel Request'}
//                     </Text>
//                   </TouchableOpacity>
//                 </>
//               )}
              
//               {/* Modify Seats Section - Only show if no pending modification */}
//               {modificationsAllowed && userBooking?.status === "accepted" && !isAutoCancelled && totalSeatsOffered > 0 && !seatModificationRequested && (
//                 <>
//                   <View style={styles.divider} />
//                   <Text style={styles.sectionSubtitle}>Modify Seats</Text>
                  
//                   {otherBookedSeats > 0 && (
//                     <View style={styles.otherBookedInfo}>
//                       <Ionicons name="information-circle" size={14} color="#F59E0B" />
//                       <Text style={styles.otherBookedInfoText}>{otherBookedSeats} seat(s) booked by others</Text>
//                     </View>
//                   )}
                  
//                   <View style={styles.seatSelectorRow}>
//                     <TouchableOpacity style={[styles.seatActionBtn, seatsRequested === 1 && styles.seatActionBtnDisabled]} onPress={() => setSeatsRequested(Math.max(1, seatsRequested - 1))} disabled={seatsRequested === 1 || modifyingSeats}>
//                       <Ionicons name="remove" size={20} color={seatsRequested === 1 ? Colors.gray : Colors.dark} />
//                     </TouchableOpacity>
//                     <View style={styles.seatCountWrap}>
//                       <Text style={styles.seatCountText}>{seatsRequested}</Text>
//                       <Text style={styles.seatAvailableText}>/ {maxUserCanRequest} max</Text>
//                     </View>
//                     <TouchableOpacity style={[styles.seatActionBtn, seatsRequested >= maxUserCanRequest && styles.seatActionBtnDisabled]} onPress={() => setSeatsRequested(Math.min(maxUserCanRequest, seatsRequested + 1))} disabled={seatsRequested >= maxUserCanRequest || modifyingSeats}>
//                       <Ionicons name="add" size={20} color={seatsRequested >= maxUserCanRequest ? Colors.gray : "#2457A6"} />
//                     </TouchableOpacity>
//                   </View>
                  
//                   <TouchableOpacity style={[styles.updateSeatsBtn, (modifyingSeats || seatsRequested === userBooking?.seats_requested) && styles.updateSeatsBtnDisabled]} onPress={handleModifySeats} disabled={modifyingSeats || seatsRequested === userBooking?.seats_requested}>
//                     <Text style={styles.updateSeatsBtnText}>{modifyingSeats ? 'Sending...' : 'Request Seat Change'}</Text>
//                   </TouchableOpacity>
//                 </>
//               )}
              
//               {/* Cancel Booking Button */}
//               {cancellationsAllowed && userBooking?.status !== "rejected" && !isAutoCancelled && (
//                 <TouchableOpacity style={[styles.cancelBookingBtn, (modifyingSeats || cancelLoading) && styles.cancelBookingBtnDisabled]} onPress={() => setShowCancelModal(true)} disabled={modifyingSeats || cancelLoading}>
//                   <Text style={styles.cancelBookingBtnText}>{userBooking?.status === "pending" ? "Cancel Request" : "Cancel Booking"}</Text>
//                 </TouchableOpacity>
//               )}
//             </View>
            
//             {/* Other Riders Section */}
//             <View style={styles.cardSection}>
//               <Text style={styles.sectionTitle}>👥 Other Riders ({otherRiders.length})</Text>
//               {otherRiders.length === 0 ? (
//                 <View style={styles.noRidersContainer}>
//                   <Ionicons name="people-outline" size={40} color={Colors.gray} />
//                   <Text style={styles.noRidersText}>No other riders yet</Text>
//                 </View>
//               ) : (
//                 otherRiders.map((rider, index) => (
//                   <View key={rider.booking_id || index} style={styles.otherRiderItem}>
//                     <View style={styles.otherRiderAvatar}>
//                       {rider.profile_picture ? (
//                         <Image source={{ uri: buildImageUrl(rider.profile_picture) }} style={styles.otherRiderAvatarImg} />
//                       ) : (
//                         <View style={styles.otherRiderAvatarPlaceholder}>
//                           <Text style={styles.otherRiderAvatarText}>{getDriverInitials(rider.passenger_name)}</Text>
//                         </View>
//                       )}
//                     </View>
//                     <View style={styles.otherRiderInfo}>
//                       <Text style={styles.otherRiderName}>{rider.passenger_name || 'Rider'}</Text>
//                       <Text style={styles.otherRiderSeats}>{rider.seats_booked || 1} seat(s)</Text>
//                     </View>
//                   </View>
//                 ))
//               )}
//             </View>
            
//             {/* Safety Card */}
//             <View style={styles.safetyCard}>
//               <Ionicons name="shield-checkmark-outline" size={18} color="#2457A6" />
//               <View>
//                 <Text style={styles.safetyTitle}>Safety First</Text>
//                 <Text style={styles.safetySub}>Live GPS tracking & 24/7 support available</Text>
//               </View>
//             </View>
            
//             <View style={{ height: 40 }} />
//           </ScrollView>
//         )}
//       </Animated.View>
      
//       {/* Cancel Modal */}
//       <Modal visible={showCancelModal} transparent animationType="fade" onRequestClose={() => setShowCancelModal(false)}>
//         <View style={styles.modalBackdrop}>
//           <View style={styles.confirmModalContent}>
//             <Ionicons name="alert-circle" size={40} color="#F59E0B" />
//             <Text style={styles.confirmModalTitle}>{userBooking?.status === "pending" ? "Cancel Request?" : "Cancel Booking?"}</Text>
//             <Text style={styles.confirmModalMessage}>
//               {userBooking?.status === "pending" 
//                 ? "Are you sure you want to cancel your booking request?"
//                 : "Are you sure you want to cancel your booking? This cannot be undone."}
//             </Text>
//             <View style={styles.confirmModalButtons}>
//               <TouchableOpacity style={[styles.confirmModalBtn, styles.confirmModalCancelBtn]} onPress={() => setShowCancelModal(false)}>
//                 <Text style={styles.confirmModalCancelBtnText}>Keep</Text>
//               </TouchableOpacity>
//               <TouchableOpacity style={[styles.confirmModalBtn, styles.confirmModalConfirmBtn]} onPress={handleCancelBooking}>
//                 <Text style={styles.confirmModalConfirmBtnText}>Cancel</Text>
//               </TouchableOpacity>
//             </View>
//           </View>
//         </View>
//       </Modal>
      
//       {/* Rating Modal */}
//       <Modal visible={ratingModalVisible} transparent animationType="fade" onRequestClose={() => setRatingModalVisible(false)}>
//         <View style={styles.modalBackdrop}>
//           <View style={styles.modalCard}>
//             <Text style={styles.modalTitle}>Rate Your Driver</Text>
//             <Text style={styles.modalSub}>How was your ride with {driverProfile?.full_name?.split(' ')[0] || 'the driver'}?</Text>
//             {renderStars()}
//             <TextInput
//               value={feedback}
//               onChangeText={setFeedback}
//               placeholder="Share your feedback (optional)"
//               multiline
//               numberOfLines={3}
//               style={styles.feedbackInput}
//               textAlignVertical="top"
//             />
//             <View style={styles.modalActions}>
//               <TouchableOpacity style={styles.skipBtn} onPress={() => setRatingModalVisible(false)}>
//                 <Text style={styles.skipBtnText}>Cancel</Text>
//               </TouchableOpacity>
//               <TouchableOpacity style={[styles.submitBtn, (rating === 0 || submitting) && { opacity: 0.5 }]} onPress={handleRateDriver} disabled={rating === 0 || submitting}>
//                 <Text style={styles.submitBtnText}>{submitting ? 'Submitting...' : 'Submit Rating'}</Text>
//               </TouchableOpacity>
//             </View>
//           </View>
//         </View>
//       </Modal>
      
//       <ProfileImageModal visible={selectedProfile.visible} imageUrl={selectedProfile.imageUrl} driverName={selectedProfile.driverName} onClose={() => setSelectedProfile({ visible: false, imageUrl: null, driverName: '' })} />
//       <CustomAlert visible={alertVisible} title={alertConfig.title} message={alertConfig.message} icon={alertConfig.icon} iconColor={alertConfig.iconColor} buttons={alertConfig.buttons} onBackdropPress={() => setAlertVisible(false)} />
//     </View>
//   );
// }

// // ============================================
// // STYLES
// // ============================================

// const styles = StyleSheet.create({
//   container: { flex: 1, backgroundColor: '#F4F5F7' },
//   mapContainer: { width: '100%', overflow: 'hidden', backgroundColor: '#E8EEF7' },
//   map: { flex: 1, backgroundColor: '#E8EEF7' },
//   mapBackButton: { position: 'absolute', top: Platform.OS === 'ios' ? 54 : 22, left: 14, width: 42, height: 42, borderRadius: 25, backgroundColor: 'rgba(255,255,255,0.96)', alignItems: 'center', justifyContent: 'center', shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4, elevation: 3 },
//   liveTrackingButton: { position: 'absolute', bottom: 20, left: 20, right: 20, backgroundColor: '#10B981', flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 14, borderRadius: 12, gap: 8, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.25, shadowRadius: 4, elevation: 5 },
//   liveTrackingButtonText: { color: '#fff', fontWeight: '700', fontSize: 14 },
//   liveDot: { width: 10, height: 10, borderRadius: 5, backgroundColor: '#fff', marginRight: 6 },
//   markerWrapper: { alignItems: 'center' },
//   pinBubble: { width: 28, height: 28, borderRadius: 14, borderWidth: 3, borderColor: 'white', alignItems: 'center', justifyContent: 'center', shadowColor: '#000', shadowOffset: { width: 0, height: 3 }, shadowOpacity: 0.25, shadowRadius: 4, elevation: 5 },
//   pinPointer: { width: 0, height: 0, backgroundColor: 'transparent', borderStyle: 'solid', borderLeftWidth: 7, borderRightWidth: 7, borderTopWidth: 10, borderLeftColor: 'transparent', borderRightColor: 'transparent', marginTop: -2 },
//   pinIcon: { fontSize: 14, fontWeight: '800', color: 'white', textAlign: 'center', lineHeight: 18 },
//   pinLabelBubbleYellow: { backgroundColor: 'rgba(113, 63, 18, 0.9)', borderRadius: 8, paddingHorizontal: 8, paddingVertical: 3, marginTop: 4 },
//   pinLabelTextYellow: { color: '#FACC15', fontSize: 10, fontWeight: '700' },
//   drawer: { position: 'absolute', bottom: 0, left: 0, right: 0, backgroundColor: '#F4F5F7', borderTopLeftRadius: 28, borderTopRightRadius: 28, overflow: 'hidden', shadowColor: '#000', shadowOffset: { width: 0, height: -2 }, shadowOpacity: 0.1, shadowRadius: 8, elevation: 10 },
//   handleWrap: { alignItems: 'center', paddingTop: 10, paddingBottom: 8, backgroundColor: '#F4F5F7', position: 'relative' },
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
//   statusBannerText: { fontSize: 13, fontWeight: '700', flex: 1 },
//   driverCard: { backgroundColor: 'white', borderRadius: 20, padding: 16, marginBottom: 14, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 8, elevation: 2 },
//   driverTopRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
//   driverLeftWrap: { flexDirection: 'row', flex: 1, paddingRight: 10 },
//   driverAvatar: { width: 56, height: 56, borderRadius: 28, backgroundColor: '#E5E7EB', overflow: 'hidden', alignItems: 'center', justifyContent: 'center', marginRight: 12 },
//   avatarImg: { width: 56, height: 56, borderRadius: 28, resizeMode: 'cover' },
//   avatarText: { fontSize: 15, fontWeight: '800', color: Colors.gray },
//   avatarPlaceholder: { width: 56, height: 56, borderRadius: 28, backgroundColor: '#E5E7EB', alignItems: 'center', justifyContent: 'center' },
//   svgAvatarContainer: { width: 56, height: 56, borderRadius: 28, overflow: 'hidden', alignItems: 'center', justifyContent: 'center', backgroundColor: '#E5E7EB' },
//   driverMeta: { flex: 1 },
//   driverNameRow: { flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap', gap: 6 },
//   driverName: { fontSize: 17, fontWeight: '800', color: Colors.dark },
//   ratingRow: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 6 },
//   ratingText: { fontSize: 13, color: Colors.dark, fontWeight: '700' },
//   profileOutlineBtn: { marginTop: 14, borderWidth: 1, borderColor: '#2457A6', borderRadius: 16, paddingVertical: 12, alignItems: 'center' },
//   profileOutlineBtnText: { color: '#2457A6', fontWeight: '700', fontSize: 14 },
//   cardSection: { backgroundColor: 'white', borderRadius: 20, padding: 16, marginBottom: 14, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 8, elevation: 2 },
//   sectionTitle: { fontSize: 16, fontWeight: '800', color: Colors.dark, marginBottom: 14 },
//   sectionSubtitle: { fontSize: 14, fontWeight: '600', color: Colors.dark, marginBottom: 12, marginTop: 8 },
//   tripItem: { flexDirection: 'row', marginBottom: 16 },
//   tripIconContainer: { width: 32, height: 32, borderRadius: 16, backgroundColor: '#F0F7FF', alignItems: 'center', justifyContent: 'center', marginRight: 12 },
//   tripDetails: { flex: 1 },
//   tripLabel: { fontSize: 12, color: Colors.gray, marginBottom: 2 },
//   tripValue: { fontSize: 15, fontWeight: '600', color: Colors.dark },
//   tripDivider: { height: 1, backgroundColor: '#EEF2F7', marginVertical: 12, marginLeft: 16 },
//   tripMetaRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 16, marginTop: 8, paddingTop: 12, borderTopWidth: 1, borderTopColor: '#EEF2F7' },
//   tripMetaItem: { flexDirection: 'row', alignItems: 'center', gap: 6 },
//   tripMetaText: { fontSize: 13, color: Colors.gray },
//   vehicleDetailRow: { flexDirection: 'row', alignItems: 'center', gap: 16 },
//   vehicleDetailInfo: { flex: 1 },
//   vehicleDetailName: { fontSize: 15, fontWeight: '600', color: Colors.dark },
//   vehicleDetailColor: { fontSize: 13, color: '#6B7280', marginTop: 2 },
//   vehicleDetailReg: { fontSize: 12, color: '#9CA3AF', marginTop: 2 },
//   vehicleDetailSeats: { fontSize: 12, color: '#6B7280', marginTop: 2 },
//   seatStatsRow: { flexDirection: 'row', justifyContent: 'space-around', marginBottom: 16 },
//   seatStat: { alignItems: 'center' },
//   seatStatValue: { fontSize: 24, fontWeight: '800', color: Colors.dark },
//   seatStatLabel: { fontSize: 12, color: Colors.gray, marginTop: 4 },
//   seatProgressContainer: { height: 6, backgroundColor: '#E5E7EB', borderRadius: 3, overflow: 'hidden', marginBottom: 8 },
//   seatProgressBar: { height: '100%', backgroundColor: '#10B981', borderRadius: 3 },
//   tagRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 14 },
//   preferenceTag: { paddingHorizontal: 12, paddingVertical: 8, borderRadius: 999, backgroundColor: '#FFF3E8' },
//   preferenceTagText: { fontSize: 12, color: '#C65D00', fontWeight: '700' },
//   bookingDetailRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 8 },
//   bookingDetailLabel: { fontSize: 14, color: Colors.gray },
//   bookingDetailValue: { fontSize: 14, fontWeight: '600', color: Colors.dark },
//   bookingTotalRow: { marginTop: 8, paddingTop: 8, borderTopWidth: 1, borderTopColor: '#EEF2F7' },
//   bookingTotalLabel: { fontSize: 16, fontWeight: '700', color: Colors.dark },
//   bookingTotalValue: { fontSize: 18, fontWeight: '800', color: '#184080' },
//   bookingStatusBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20 },
//   bookingStatusText: { fontSize: 12, fontWeight: '600' },
//   divider: { height: 1, backgroundColor: '#EEF2F7', marginVertical: 16 },
//   otherBookedInfo: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFFBEB', padding: 10, borderRadius: 8, marginBottom: 12, gap: 8 },
//   otherBookedInfoText: { flex: 1, fontSize: 11, color: '#B45309' },
//   seatSelectorRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: '#FAFAFB', borderRadius: 18, padding: 14, marginBottom: 12 },
//   seatActionBtn: { width: 38, height: 38, borderRadius: 12, borderWidth: 1, borderColor: '#D6DDE7', alignItems: 'center', justifyContent: 'center', backgroundColor: 'white' },
//   seatActionBtnDisabled: { opacity: 0.5, backgroundColor: '#F5F5F5' },
//   seatCountWrap: { flexDirection: 'row', alignItems: 'baseline' },
//   seatCountText: { fontSize: 28, fontWeight: '900', color: Colors.dark },
//   seatAvailableText: { fontSize: 13, color: Colors.gray, marginLeft: 6, fontWeight: '600' },
//   updateSeatsBtn: { backgroundColor: Colors.primary, paddingVertical: 12, borderRadius: 12, alignItems: 'center', marginTop: 8 },
//   updateSeatsBtnDisabled: { opacity: 0.6 },
//   updateSeatsBtnText: { color: '#fff', fontWeight: '700', fontSize: 14 },
//   cancelBookingBtn: { marginTop: 12, backgroundColor: '#FEF2F2', paddingVertical: 12, borderRadius: 12, alignItems: 'center', borderWidth: 1, borderColor: '#EF4444' },
//   cancelBookingBtnText: { color: '#EF4444', fontWeight: '700', fontSize: 14 },
//   cancelBookingBtnDisabled: { opacity: 0.6 },
//   noRidersContainer: { alignItems: 'center', padding: 30, gap: 10 },
//   noRidersText: { fontSize: 14, fontWeight: '600', color: Colors.gray },
//   otherRiderItem: { flexDirection: 'row', alignItems: 'center', paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: '#EEF2F7' },
//   otherRiderAvatar: { width: 44, height: 44, borderRadius: 22, backgroundColor: '#E5E7EB', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', marginRight: 12 },
//   otherRiderAvatarImg: { width: 44, height: 44, borderRadius: 22, resizeMode: 'cover' },
//   otherRiderAvatarPlaceholder: { width: 44, height: 44, borderRadius: 22, backgroundColor: '#E5E7EB', alignItems: 'center', justifyContent: 'center' },
//   otherRiderAvatarText: { fontSize: 16, fontWeight: '700', color: Colors.primary },
//   otherRiderInfo: { flex: 1 },
//   otherRiderName: { fontSize: 15, fontWeight: '600', color: Colors.dark, marginBottom: 2 },
//   otherRiderSeats: { fontSize: 12, color: Colors.gray },
//   safetyCard: { backgroundColor: '#FFF3E7', borderRadius: 18, padding: 16, marginBottom: 14, flexDirection: 'row', alignItems: 'center', gap: 12 },
//   safetyTitle: { fontSize: 14, color: '#2457A6', fontWeight: '800' },
//   safetySub: { marginTop: 2, fontSize: 12, color: '#2457A6', opacity: 0.9, fontWeight: '600' },
//   loaderContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#fff' },
//   modalBackdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center' },
//   confirmModalContent: { backgroundColor: 'white', borderRadius: 24, padding: 24, width: '85%', alignItems: 'center' },
//   confirmModalTitle: { fontSize: 20, fontWeight: '800', color: Colors.dark, marginTop: 12 },
//   confirmModalMessage: { fontSize: 14, color: Colors.gray, textAlign: 'center', marginBottom: 24, lineHeight: 20 },
//   confirmModalButtons: { flexDirection: 'row', gap: 12, width: '100%' },
//   confirmModalBtn: { flex: 1, paddingVertical: 12, borderRadius: 12, alignItems: 'center' },
//   confirmModalCancelBtn: { backgroundColor: '#F3F4F6' },
//   confirmModalCancelBtnText: { color: Colors.dark, fontWeight: '600' },
//   confirmModalConfirmBtn: { backgroundColor: '#EF4444' },
//   confirmModalConfirmBtnText: { color: '#fff', fontWeight: '600' },
//   modalCard: { backgroundColor: '#fff', borderRadius: 24, padding: 20, alignItems: 'center', width: width - 40 },
//   modalTitle: { fontSize: 22, fontWeight: '700', color: '#111827', textAlign: 'center', marginTop: 12 },
//   modalSub: { fontSize: 14, color: '#6B7280', textAlign: 'center', marginTop: 8, marginBottom: 18 },
//   starsRow: { flexDirection: 'row', justifyContent: 'center', marginBottom: 18 },
//   feedbackInput: { minHeight: 100, borderWidth: 1, borderColor: '#E5E7EB', borderRadius: 16, padding: 14, color: '#111827', fontSize: 14, width: '100%' },
//   modalActions: { flexDirection: 'row', gap: 10, marginTop: 18, width: '100%' },
//   skipBtn: { flex: 1, borderWidth: 1, borderColor: '#D1D5DB', borderRadius: 999, paddingVertical: 14, alignItems: 'center' },
//   skipBtnText: { color: '#6B7280', fontWeight: '600' },
//   submitBtn: { flex: 1, backgroundColor: Colors.primary, borderRadius: 999, paddingVertical: 14, alignItems: 'center' },
//   submitBtnText: { color: '#fff', fontWeight: '700' },
//   imageModalContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', width: '100%' },
//   imageModalContent: { width: '90%', backgroundColor: Colors.white, borderRadius: 20, overflow: 'hidden', maxHeight: '80%' },
//   imageModalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 16, borderBottomWidth: 1, borderBottomColor: '#EEF2F7' },
//   imageModalTitle: { fontSize: 18, fontWeight: '700', color: Colors.dark },
//   fullProfileImage: { width: '100%', height: 400, backgroundColor: '#F5F5F5', resizeMode: 'contain' },
//   modalSvgContainer: { width: '100%', height: 400, backgroundColor: '#F5F5F5', alignItems: 'center', justifyContent: 'center' },
//   noImageContainer: { width: '100%', height: 400, justifyContent: 'center', alignItems: 'center', backgroundColor: '#F5F5F5' },
//   noImageText: { fontSize: 16, color: Colors.gray },
//   emptyText: { fontSize: 13, color: Colors.gray, fontWeight: '600' },
  
//   // Pending Modification Styles
//   pendingModificationHeader: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     gap: 12,
//     marginBottom: 16,
//     paddingBottom: 12,
//     borderBottomWidth: 1,
//     borderBottomColor: '#FDE68A',
//   },
//   pendingModificationTitle: {
//     fontSize: 18,
//     fontWeight: '700',
//     color: '#92400E',
//     flex: 1,
//   },
//   pendingModificationDetails: {
//     backgroundColor: '#FFFBEB',
//     borderRadius: 12,
//     padding: 14,
//     marginBottom: 16,
//     borderWidth: 1,
//     borderColor: '#FDE68A',
//   },
//   modificationDetailRow: {
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//     alignItems: 'center',
//     paddingVertical: 8,
//   },
//   modificationDetailLabel: {
//     fontSize: 14,
//     color: '#6B7280',
//   },
//   modificationDetailValue: {
//     fontSize: 16,
//     fontWeight: '600',
//     color: '#111827',
//   },
//   pendingBadge: {
//     paddingHorizontal: 10,
//     paddingVertical: 4,
//     borderRadius: 20,
//   },
//   pendingBadgeText: {
//     fontSize: 12,
//     fontWeight: '600',
//   },
//   modificationDate: {
//     fontSize: 11,
//     color: '#9CA3AF',
//     marginTop: 8,
//     textAlign: 'center',
//   },
//   cancelModificationBtn: {
//     backgroundColor: '#FEF2F2',
//     paddingVertical: 12,
//     borderRadius: 12,
//     alignItems: 'center',
//     borderWidth: 1,
//     borderColor: '#EF4444',
//   },
//   cancelModificationBtnText: {
//     color: '#EF4444',
//     fontWeight: '600',
//     fontSize: 14,
//   },
// });
import React, { useMemo, useRef, useState, useEffect, useCallback } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, ScrollView, Platform,
  StatusBar, Image, Dimensions, Animated, PanResponder, Modal,
  LogBox, TextInput, Share, Alert
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
import ChatService from '../services/ChatService';

LogBox.ignoreLogs(['Accessibility: View', 'Property accessibilityState', 'RCTView']);

const { height, width } = Dimensions.get('window');
const SAFE_TOP = Platform.OS === 'ios' ? 56 : 24;
const COLLAPSED_HEIGHT = 84;
const EXPANDED_HEIGHT = height * 0.72;

// ============================================
// UTILITY FUNCTIONS
// ============================================

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
    if (item && typeof item === 'object' && item.latitude && item.longitude) {
      return { longitude: Number(item.longitude), latitude: Number(item.latitude) };
    }
    return parseSuggestedPoint(item);
  }).filter(Boolean);
}

function isSvgUrl(url) {
  if (!url) return false;
  return url.toLowerCase().includes('.svg') || url.toLowerCase().includes('.svg?');
}

function calculateDistance(lat1, lon1, lat2, lon2) {
  const R = 6371000;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
            Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
            Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c;
}

function formatDistance(meters) {
  if (!meters) return 'Unknown';
  if (meters < 1000) return `${Math.round(meters)} m`;
  return `${(meters / 1000).toFixed(1)} km`;
}

function formatDate(dateString) {
  if (!dateString) return 'Date not set';
  const date = new Date(dateString);
  const today = new Date();
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);
  const isToday = date.toDateString() === today.toDateString();
  const isTomorrow = date.toDateString() === tomorrow.toDateString();
  let dayText = "";
  if (isToday) dayText = "Today";
  else if (isTomorrow) dayText = "Tomorrow";
  else dayText = date.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" });
  const timeText = date.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit", hour12: true });
  return `${dayText}, ${timeText}`;
}

function formatTimeOnly(dateString) {
  if (!dateString) return '--:--';
  const date = new Date(dateString);
  return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });
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

// ============================================
// COMPONENTS
// ============================================

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

// Rating Stars Component
function RatingStars({ rating, size = 16, onPress }) {
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
      {[1, 2, 3, 4, 5].map((star) => (
        <TouchableOpacity key={star} onPress={() => onPress?.(star)} disabled={!onPress}>
          <Ionicons 
            name={star <= rating ? 'star' : 'star-outline'} 
            size={size} 
            color={star <= rating ? '#F59E0B' : '#D1D5DB'} 
          />
        </TouchableOpacity>
      ))}
    </View>
  );
}

// ============================================
// MAIN SCREEN COMPONENT
// ============================================

export default function ViewRouteRequestScreen({ navigation, route }) {
  const { user } = useAuth();
  const params = route.params || {};
  const initialRide = params.ride || null;
  const booking = params.booking || null;

  // State for ride data - initialize directly from params
  const [currentRide, setCurrentRide] = useState(() => {
    if (initialRide && initialRide.id) {
      return initialRide;
    }
    if (booking?.ride) {
      return booking.ride;
    }
    return null;
  });

  const [userBooking, setUserBooking] = useState(() => {
  if (booking && booking.id) {
    // Make sure id is a number
    return {
      id: Number(booking.id),
      seats_requested: Number(booking.seats_requested) || 1,
      status: booking.status || 'pending',
      total_amount: Number(booking.total_amount) || null,
      created_at: booking.created_at,
    };
  }
  if (initialRide?.booking && initialRide.booking.id) {
    return {
      id: Number(initialRide.booking.id),
      seats_requested: Number(initialRide.booking.seats_requested) || 1,
      status: initialRide.booking.status || 'pending',
      total_amount: Number(initialRide.booking.total_amount) || null,
    };
  }
  if (initialRide?.seatsRequested) {
    return {
      id: Number(initialRide.id),
      seats_requested: Number(initialRide.seatsRequested),
      status: 'accepted',
    };
  }
  return null;
});
// In your initializeData function

  const [driverProfile, setDriverProfile] = useState(null);
  const [isVerified, setIsVerified] = useState(false);
  const [loadingProfile, setLoadingProfile] = useState(false);
  
  // UI State
  const [drawerExpanded, setDrawerExpanded] = useState(true);
  const [mapReady, setMapReady] = useState(false);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [ratingModalVisible, setRatingModalVisible] = useState(false);
  const [selectedProfile, setSelectedProfile] = useState({ visible: false, imageUrl: null, driverName: '' });
  const [alertVisible, setAlertVisible] = useState(false);
  const [alertConfig, setAlertConfig] = useState({ title: "", message: "", icon: "check-circle", iconColor: "#10B981", buttons: [] });
  
  // Seat related state
  const [seatsRequested, setSeatsRequested] = useState(() => {
    if (booking?.seats_requested) return booking.seats_requested;
    if (initialRide?.seatsRequested) return initialRide.seatsRequested;
    return 1;
  });
  const [modifyingSeats, setModifyingSeats] = useState(false);
  const [totalSeatsOffered, setTotalSeatsOffered] = useState(() => initialRide?.available_seats || 4);
  const [totalBookedSeats, setTotalBookedSeats] = useState(() => booking?.seats_requested || initialRide?.seatsRequested || 0);
  const [availableSeats, setAvailableSeats] = useState(() => (initialRide?.available_seats || 4) - (booking?.seats_requested || initialRide?.seatsRequested || 0));
  const [otherRiders, setOtherRiders] = useState([]);
  
  // Modification request state
  const [seatModificationRequested, setSeatModificationRequested] = useState(false);
  const [pendingSeatsRequest, setPendingSeatsRequest] = useState(null);
  const [pendingRequestDetails, setPendingRequestDetails] = useState(null);
  const [pendingModificationRequest, setPendingModificationRequest] = useState(null);
  
  // Live tracking state
  const [liveSession, setLiveSession] = useState(null);
  const [driverLocation, setDriverLocation] = useState(null);
  const [driverETA, setDriverETA] = useState(null);
  const [driverDistance, setDriverDistance] = useState(null);
  const [socketConnected, setSocketConnected] = useState(false);
  
  // Rating state
  const [rating, setRating] = useState(0);
  const [feedback, setFeedback] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [hasRatedDriver, setHasRatedDriver] = useState(false);
  const [rideCompleted, setRideCompleted] = useState(false);
  const [completedRideDetails, setCompletedRideDetails] = useState(null);
  
  // Driver's rating and feedback for this ride
  const [driverRating, setDriverRating] = useState(null);
  const [driverFeedbackText, setDriverFeedbackText] = useState('');
  const [showDriverRating, setShowDriverRating] = useState(false);
  
  // Cancel state
  const [cancelLoading, setCancelLoading] = useState(false);
  
  // Refs
  const animatedDrawer = useRef(new Animated.Value(1)).current;
  const mapRef = useRef(null);
  const socketRef = useRef(null);
  const hasShownRatingModal = useRef(false);
  
  // Animation values
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
  
  // Helper functions
  const showCustomAlert = (title, message, type = 'success') => {
    let icon = "check-circle";
    let iconColor = "#10B981";
    if (type === 'error') { icon = "error"; iconColor = "#EF4444"; }
    else if (type === 'warning') { icon = "warning"; iconColor = "#F59E0B"; }
    else if (type === 'info') { icon = "info"; iconColor = Colors.primary; }
    setAlertConfig({ title, message, icon, iconColor, buttons: [{ text: 'OK', onPress: () => setAlertVisible(false) }] });
    setAlertVisible(true);
  };
  
  const getProfilePhotoUrl = () => {
    const rawUrl = driverProfile?.profile_picture || currentRide?.profilePicture || currentRide?.driverProfilePicture;
    if (!rawUrl) return null;
    return buildImageUrl(rawUrl);
  };
  
  // Get driver phone number for chat
  const getDriverPhoneNumber = () => {
    return currentRide?.phoneNumber || currentRide?.driver_phone;
  };
  
  // Handle chat with driver
  const handleChatWithDriver = async () => {
    const driverPhone = getDriverPhoneNumber();
    const driverName = driverProfile?.full_name || currentRide?.driverName || 'Driver';
    
    if (!driverPhone) {
      showCustomAlert('Error', 'Driver contact information not available', 'error');
      return;
    }
    
    try {
      // Get or create conversation with driver
      const result = await ChatService.getOrCreateConversation(
        user?.phone_number,
        driverPhone,
        currentRide?.id
      );
      
      if (result.success && result.conversationId) {
        navigation.navigate('ChatScreen', {
          conversationId: result.conversationId,
          user: {
            name: driverName,
            phone_number: driverPhone,
            profile_picture: getProfilePhotoUrl(),
          },
          rideId: currentRide?.id,
        });
      } else {
        showCustomAlert('Error', 'Could not start chat. Please try again.', 'error');
      }
    } catch (error) {
      console.error('Chat error:', error);
      showCustomAlert('Error', 'Could not start chat', 'error');
    }
  };
  
const fetchDriverRatingForRide = useCallback(async () => {
  if (!userBooking?.id) return;
  
  // Ensure booking ID is a number
  const bookingId = Number(userBooking.id);
  if (isNaN(bookingId)) {
    console.log('Invalid booking ID for fetching rating');
    return;
  }
  
  try {
    console.log('Fetching driver rating for booking:', bookingId);
    const response = await fetch(`${API_BASE_URL}/api/v1/ride-feedback/driver/${bookingId}?_t=${Date.now()}`);
    const data = await response.json();
    
    console.log('Driver rating response:', data);
    
    if (data.success && data.feedback) {
      setDriverRating(data.feedback.rating);
      setDriverFeedbackText(data.feedback.comment || '');
      setShowDriverRating(true);
    } else {
      setShowDriverRating(false);
    }
  } catch (error) {
    console.log('Error fetching driver rating:', error);
    setShowDriverRating(false);
  }
}, [userBooking?.id]);
// Submit rating for driver - FIXED VERSION
// Submit rating for driver - COMPLETE WORKING VERSION
// Submit rating for driver - FIXED VERSION
const handleRateDriver = async () => {
  if (rating === 0) {
    showCustomAlert('Rating Required', 'Please select a rating.', 'warning');
    return;
  }
  
  if (!userBooking?.id) {
    showCustomAlert('Error', 'Booking information not found.', 'error');
    return;
  }
  
  setSubmitting(true);
  try {
    // DEBUG: Log what userBooking actually is
    console.log('🔍 userBooking object:', JSON.stringify(userBooking, null, 2));
    console.log('🔍 userBooking.id type:', typeof userBooking.id);
    console.log('🔍 userBooking.id value:', userBooking.id);
    
    // Make sure we're sending a plain number, not an object
    const bookingId = Number(userBooking.id);
    
    if (isNaN(bookingId)) {
      console.error('❌ Invalid booking ID:', userBooking.id);
      showCustomAlert('Error', 'Invalid booking ID. Please try again.', 'error');
      setSubmitting(false);
      return;
    }
    
    const requestBody = {
      ride_booking_id: bookingId,
      rating: Number(rating),
      comment: feedback || '',
    };
    
    console.log('📤 Submitting rating:', JSON.stringify(requestBody, null, 2));
    
    const response = await fetch(`${API_BASE_URL}/api/v1/ride-feedback`, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'X-Phone-Number': user?.phone_number,
      },
      body: JSON.stringify(requestBody),
    });
    
    const data = await response.json();
    console.log('📥 Response status:', response.status);
    console.log('📥 Response data:', data);
    
    if (response.ok && data.success) {
      showCustomAlert('Thank You!', 'Your rating has been submitted successfully!', 'success');
      setHasRatedDriver(true);
      setRatingModalVisible(false);
      setRating(0);
      setFeedback('');
      
      setTimeout(() => {
        fetchDriverRatingForRide();
        checkSessionStatus();
      }, 500);
    } else {
      let errorMessage = 'Failed to submit rating.';
      
      if (data.detail) {
        if (typeof data.detail === 'string') {
          errorMessage = data.detail;
        } else if (Array.isArray(data.detail)) {
          errorMessage = data.detail.map(err => {
            if (err.msg) return err.msg;
            if (err.message) return err.message;
            return JSON.stringify(err);
          }).join(', ');
        }
      } else if (data.message) {
        errorMessage = data.message;
      }
      
      showCustomAlert('Error', errorMessage, 'error');
    }
  } catch (error) {
    console.error('Rating error:', error);
    showCustomAlert('Error', 'Network error. Please check your connection.', 'error');
  } finally {
    setSubmitting(false);
  }
};
  // Add this function to get ride ID from booking
  const getCorrectRideId = useCallback(async () => {
    if (!userBooking?.id) return null;
    
    try {
      const response = await fetch(`${API_BASE_URL}/api/v1/bookings/${userBooking.id}/ride?_t=${Date.now()}`);
      const data = await response.json();
      
      if (data.success && data.ride) {
        console.log('✅ Got correct ride ID from booking API:', data.ride.id);
        return data.ride.id;
      }
      return null;
    } catch (error) {
      console.log('Error fetching ride from booking:', error);
      return null;
    }
  }, [userBooking?.id]);

  // Fetch modification requests
  const fetchModificationRequests = useCallback(async () => {
    if (!userBooking?.id) return;
    
    try {
      const response = await fetch(`${API_BASE_URL}/booking/${userBooking.id}/modification-request?_t=${Date.now()}`);
      const data = await response.json();
      
      console.log('📋 Modification request response:', data);
      
      if (data.has_pending && data.request) {
        setPendingModificationRequest(data.request);
        setSeatModificationRequested(true);
        setPendingSeatsRequest(data.request.requested_seats);
        setPendingRequestDetails(data.request);
      } else {
        setPendingModificationRequest(null);
        setSeatModificationRequested(false);
        setPendingSeatsRequest(null);
        setPendingRequestDetails(null);
      }
    } catch (error) {
      console.log('Error fetching modification request:', error);
    }
  }, [userBooking?.id]);
  
  // Handle cancel modification request
  const handleCancelModificationRequest = async () => {
    if (!userBooking?.id) return;
    
    setModifyingSeats(true);
    try {
      const response = await fetch(`${API_BASE_URL}/api/v1/modifications/booking/${userBooking.id}/cancel`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
      });
      const data = await response.json();
      
      if (!response.ok) throw new Error(data.detail || data.message || 'Failed to cancel modification request');
      
      showCustomAlert('Request Cancelled', 'Your seat modification request has been cancelled.', 'success');
      setSeatModificationRequested(false);
      setPendingSeatsRequest(null);
      setPendingRequestDetails(null);
      setPendingModificationRequest(null);
      await fetchModificationRequests();
    } catch (error) {
      console.error('Cancel modification error:', error);
      showCustomAlert('Error', error.message || 'Failed to cancel modification request', 'error');
    } finally {
      setModifyingSeats(false);
    }
  };

  // Update fetchSeatAvailability to use the correct ride ID
  const fetchSeatAvailability = useCallback(async () => {
    let rideId = currentRide?.id;
    
    if (!rideId || rideId === 3 || rideId === 0) {
      const correctId = await getCorrectRideId();
      if (correctId) {
        rideId = correctId;
        setCurrentRide(prev => ({ ...prev, id: correctId }));
      } else {
        console.log('❌ Could not get valid ride ID');
        return;
      }
    }
    
    console.log('✅ Fetching passengers for ride ID:', rideId);
    
    try {
      const url = `${API_BASE_URL.replace(/\/$/, '')}/ride/${rideId}/passengers?_t=${Date.now()}`;
      console.log('📡 Fetching from URL:', url);
      
      const response = await fetch(url);
      console.log('📡 Response status:', response.status);
      
      if (response.ok) {
        const data = await response.json();
        console.log('📡 API Response:', JSON.stringify(data, null, 2));
        
        const totalSeats = data.available_seats || currentRide?.available_seats || 4;
        setTotalSeatsOffered(totalSeats);
        
        const totalBooked = data.total_booked_seats || 0;
        setTotalBookedSeats(totalBooked);
        setAvailableSeats(Math.max(0, totalSeats - totalBooked));
        
        if (data.passengers && Array.isArray(data.passengers) && user?.phone_number) {
          const normalizePhone = (phone) => {
            if (!phone) return '';
            let cleaned = phone.replace(/\s/g, '').replace(/-/g, '');
            if (cleaned.startsWith('+91')) return cleaned;
            if (cleaned.startsWith('91') && cleaned.length === 12) return `+${cleaned}`;
            if (cleaned.startsWith('+')) return cleaned;
            return `+91${cleaned}`;
          };
          
          const currentUserPhone = normalizePhone(user.phone_number);
          console.log('📱 Current user phone:', currentUserPhone);
          
          const acceptedPassengers = data.passengers.filter(p => p.status === 'accepted');
          console.log('✅ Accepted passengers count:', acceptedPassengers.length);
          
          const otherAccepted = acceptedPassengers.filter(p => {
            const passengerPhone = normalizePhone(p.passenger_phone);
            return passengerPhone !== currentUserPhone;
          });
          
          console.log('👥 Other riders found:', otherAccepted.length);
          console.log('👥 Other riders:', otherAccepted);
          
          setOtherRiders(otherAccepted);
        } else {
          console.log('❌ No passengers array or no user phone');
          setOtherRiders([]);
        }
      } else if (response.status === 404) {
        console.log('ℹ️ Ride not found - this might be normal if no passengers yet');
        setOtherRiders([]);
        setTotalSeatsOffered(currentRide?.available_seats || 4);
        setTotalBookedSeats(0);
        setAvailableSeats(currentRide?.available_seats || 4);
      } else {
        console.log('❌ API response not OK:', response.status);
        const errorText = await response.text();
        console.log('Error response:', errorText);
      }
    } catch (error) {
      console.log('❌ Error fetching seat availability:', error);
    }
  }, [currentRide?.id, currentRide?.available_seats, user?.phone_number, getCorrectRideId]);

  // Update loadDriverData to use correct ride ID
  const loadDriverData = useCallback(async () => {
    let rideId = currentRide?.id;
    if (!rideId || rideId === 3 || rideId === 0) {
      const correctId = await getCorrectRideId();
      if (correctId) {
        rideId = correctId;
        setCurrentRide(prev => ({ ...prev, id: correctId }));
      }
    }
    
    let driverPhone = currentRide?.phoneNumber || currentRide?.driver_phone;
    let driverUserId = currentRide?.driverUserId || currentRide?.driver_user_id;
    
    if ((!driverPhone && !driverUserId) && userBooking?.id) {
      try {
        const response = await fetch(`${API_BASE_URL}/api/v1/bookings/${userBooking.id}/ride?_t=${Date.now()}`);
        const data = await response.json();
        if (data.success && data.ride) {
          driverPhone = data.ride.driver_phone;
          driverUserId = data.ride.driver_user_id;
          setCurrentRide(prev => ({ ...prev, 
            phoneNumber: driverPhone, 
            driver_phone: driverPhone,
            driverUserId: driverUserId,
            driverName: data.ride.driver_name,
            from: data.ride.origin,
            to: data.ride.destination,
            departure_time: data.ride.departure_time,
            price: data.ride.price_per_seat,
            available_seats: data.ride.available_seats,
            routeCoordinates: data.ride.route_coordinates,
          }));
        }
      } catch (error) {
        console.log('Error fetching ride details:', error);
      }
    }
    
    if (!driverPhone && !driverUserId) {
      console.log('No driver contact info available');
      return;
    }
    
    setLoadingProfile(true);
    try {
      const params = new URLSearchParams();
      if (driverUserId) params.append('user_id', driverUserId);
      else if (driverPhone) params.append('phone_number', driverPhone);
      params.append('_t', Date.now());
      
      const profileRes = await fetch(`${API_BASE_URL}/api/v1/users/profile-public?${params.toString()}`);
      const profileData = await profileRes.json();
      
      if (profileData?.success && profileData.user) {
        setDriverProfile(profileData.user);
      }
      
      if (driverPhone) {
        const docsRes = await fetch(`${API_BASE_URL}/api/v1/documents/user/${driverPhone}`);
        const docsData = await docsRes.json();
        if (docsData?.success && docsData.documents) {
          const verifiedDocs = docsData.documents.filter(doc => {
            const status = doc.status?.toUpperCase();
            return status === 'APPROVED' && ['aadhar', 'dl', 'rc'].includes(doc.document_type?.toLowerCase());
          });
          setIsVerified(verifiedDocs.length > 0);
        }
      }
    } catch (error) {
      console.log('Error loading driver data:', error);
    } finally {
      setLoadingProfile(false);
    }
  }, [currentRide, userBooking?.id, getCorrectRideId]);
console.log('📤 DEBUG - userBooking.id value:', userBooking.id);
console.log('📤 DEBUG - userBooking.id type:', typeof userBooking.id);
console.log('📤 DEBUG - Full userBooking:', JSON.stringify(userBooking, null, 2));
  // Add useEffect to initialize data when component mounts
  useEffect(() => {
    const initializeData = async () => {
      if (userBooking?.id) {
        try {
          const response = await fetch(`${API_BASE_URL}/api/v1/bookings/${userBooking.id}/ride?_t=${Date.now()}`);
          const data = await response.json();
          
          if (data.success && data.ride) {
            console.log('✅ Fetched ride details from booking API:', data.ride.id);
            
            setCurrentRide({
              id: data.ride.id,
              available_seats: data.ride.available_seats,
              price: data.ride.price_per_seat,
              from: data.ride.origin,
              to: data.ride.destination,
              departure_time: data.ride.departure_time,
              phoneNumber: data.ride.driver_phone,
              driverName: data.ride.driver_name,
              driverUserId: data.ride.driver_user_id,
              routeCoordinates: data.ride.route_coordinates,
              distance_km: data.ride.distance_km,
              duration_text: data.ride.duration_text,
              status: data.ride.status,
              women_only: data.ride.women_only,
              rating: data.ride.driver_rating || 4.5,
              origin_lat: data.ride.origin_latitude,
              origin_lon: data.ride.origin_longitude,
              suggestedPickup: data.ride.suggested_pickup_point,
              suggestedDrop: data.ride.suggested_drop_point,
            });
            
            const totalSeats = data.ride.available_seats || 4;
            setTotalSeatsOffered(totalSeats);
            setTotalBookedSeats(data.ride.total_booked_seats || userBooking.seats_requested || 1);
            setAvailableSeats(totalSeats - (data.ride.total_booked_seats || userBooking.seats_requested || 1));
              // In initializeData function, when setting userBooking
setUserBooking({
  id: Number(data.booking.id),  // Ensure it's a number
  seats_requested: Number(data.booking.seats_requested) || 1,
  status: data.booking.status,
  total_amount: Number(data.booking.total_amount) || null,
  created_at: data.booking.created_at,
});
            await fetchPassengersForRide(data.ride.id);
            await loadDriverProfile(data.ride.driver_phone, data.ride.driver_user_id);
            await fetchModificationRequests();
            await fetchDriverRatingForRide();
          }
        } catch (error) {
          console.log('Error initializing ride data:', error);
        }
      }
    };
    
    initializeData();
  }, [userBooking?.id]);

  // Helper function to fetch passengers
  const fetchPassengersForRide = async (rideId) => {
    if (!rideId || rideId === 3 || rideId === 0) return;
    
    try {
      const url = `${API_BASE_URL.replace(/\/$/, '')}/ride/${rideId}/passengers?_t=${Date.now()}`;
      console.log('📡 Fetching passengers from:', url);
      
      const response = await fetch(url);
      
      if (response.ok) {
        const data = await response.json();
        console.log('📡 Passengers data:', data);
        
        if (data.passengers && Array.isArray(data.passengers) && user?.phone_number) {
          const normalizePhone = (phone) => {
            if (!phone) return '';
            let cleaned = phone.replace(/\s/g, '').replace(/-/g, '');
            if (cleaned.startsWith('+91')) return cleaned;
            if (cleaned.startsWith('91') && cleaned.length === 12) return `+${cleaned}`;
            if (cleaned.startsWith('+')) return cleaned;
            return `+91${cleaned}`;
          };
          
          const currentUserPhone = normalizePhone(user.phone_number);
          const acceptedPassengers = data.passengers.filter(p => p.status === 'accepted');
          const otherAccepted = acceptedPassengers.filter(p => {
            const passengerPhone = normalizePhone(p.passenger_phone);
            return passengerPhone !== currentUserPhone;
          });
          
          console.log('👥 Other riders:', otherAccepted);
          setOtherRiders(otherAccepted);
        }
      } else {
        console.log('Failed to fetch passengers, status:', response.status);
      }
    } catch (error) {
      console.log('Error fetching passengers:', error);
    }
  };

  // Helper function to load driver profile
  const loadDriverProfile = async (driverPhone, driverUserId) => {
    if (!driverPhone && !driverUserId) return;
    
    try {
      const params = new URLSearchParams();
      if (driverUserId) params.append('user_id', driverUserId);
      else if (driverPhone) params.append('phone_number', driverPhone);
      params.append('_t', Date.now());
      
      const profileRes = await fetch(`${API_BASE_URL}/api/v1/users/profile-public?${params.toString()}`);
      const profileData = await profileRes.json();
      
      if (profileData?.success && profileData.user) {
        setDriverProfile(profileData.user);
      }
    } catch (error) {
      console.log('Error loading driver profile:', error);
    }
  };
  
  // Check live session
  const checkLiveSession = useCallback(async () => {
    const rideId = currentRide?.id;
    if (!rideId) return;
    
    try {
      const response = await fetch(`${API_BASE_URL}/ride/${rideId}/live-session`);
      const data = await response.json();
      if (data.success && data.session) {
        setLiveSession(data.session);
      }
    } catch (error) {
      console.log('Error checking live session:', error);
    }
  }, [currentRide?.id]);
  
  const checkSessionStatus = useCallback(async () => {
  const bookingId = userBooking?.id;
  if (!bookingId) return;
  
  try {
    // Use the correct endpoint from your backend
    const res = await fetch(`${API_BASE_URL}/ride-sessions/rider/session-status/${bookingId}?rider_phone=${user?.phone_number}&_t=${Date.now()}`);
    const data = await res.json();
    
    console.log('🔍 Session Status Response:', data);
    
    // Check if the response has the expected fields
    if (data.success && data.ride_completed) {
      setRideCompleted(true);
      setHasRatedDriver(data.has_rated_driver);
      
      if (data.has_rated_driver === false && !hasShownRatingModal.current) {
        hasShownRatingModal.current = true;
        setTimeout(() => setRatingModalVisible(true), 1000);
      }
    }
  } catch (error) {
    console.log('Error checking session status:', error);
  }
}, [userBooking?.id, user?.phone_number]);
  // Get ride status
  const getRideStatus = useCallback(() => {
    if (rideCompleted) return 'completed';
    if (!currentRide?.departure_time) return 'unknown';
    if (currentRide?.cancellation_reason) {
      if (currentRide.cancellation_reason.includes("Auto-cancelled")) return 'auto-cancelled';
      return 'cancelled';
    }
    
    const now = new Date();
    const departureTime = new Date(currentRide.departure_time);
    const minutesToDeparture = (departureTime - now) / (1000 * 60);
    const minutesSinceDeparture = (now - departureTime) / (1000 * 60);
    
    if (currentRide?.started_at && !rideCompleted) return 'ongoing';
    if (currentRide?.status === 'completed' || rideCompleted) return 'completed';
    if (minutesSinceDeparture > 30) return 'expired';
    if (minutesToDeparture <= 0 && minutesSinceDeparture <= 30) return 'late';
    if (minutesToDeparture <= 15) return 'upcoming-soon';
    if (minutesToDeparture > 15) return 'upcoming';
    return 'unknown';
  }, [currentRide?.departure_time, currentRide?.cancellation_reason, currentRide?.started_at, currentRide?.status, rideCompleted]);
  
  const canModifySeats = useCallback(() => {
    if (!userBooking) return false;
    const rideStatus = getRideStatus();
    if (rideCompleted) return false;
    if (currentRide?.cancellation_reason || currentRide?.started_at) return false;
    if (userBooking.status !== "accepted") return false;
    if (['expired', 'auto-cancelled', 'upcoming-soon', 'late'].includes(rideStatus)) return false;
    if (seatModificationRequested) return false;
    return true;
  }, [userBooking, getRideStatus, currentRide, seatModificationRequested, rideCompleted]);
  
  const canCancelBooking = useCallback(() => {
    if (!userBooking) return false;
    const rideStatus = getRideStatus();
    if (rideCompleted) return false;
    if (currentRide?.cancellation_reason || currentRide?.started_at || currentRide?.status === 'completed') return false;
    if (['expired', 'auto-cancelled', 'upcoming-soon', 'late'].includes(rideStatus)) return false;
    if (!["accepted", "pending"].includes(userBooking.status)) return false;
    return true;
  }, [userBooking, getRideStatus, currentRide, rideCompleted]);
  
  const getRideStatusMessage = useCallback(() => {
    const rideStatus = getRideStatus();
    const bookingStatus = userBooking?.status;
    
    if (rideCompleted) {
      return { message: "Ride completed", type: 'completed', icon: 'checkmark-done-circle', color: '#6B7280' };
    }
    if (currentRide?.cancellation_reason) {
      return { message: currentRide.cancellation_reason, type: 'cancelled', icon: 'alert-circle', color: '#DC2626' };
    }
    if (bookingStatus === "rejected") {
      return { message: "Your booking request was rejected", type: 'rejected', icon: 'close-circle', color: '#DC2626' };
    }
    if (bookingStatus === "pending") {
      return { message: `Waiting for driver confirmation (${userBooking?.seats_requested} seat(s))`, type: 'pending', icon: 'time-outline', color: '#F59E0B' };
    }
    if (bookingStatus === "accepted") {
      if (rideStatus === 'ongoing') return { message: "🚗 Ride in progress!", type: 'ongoing', icon: 'car-sport', color: '#10B981' };
      if (rideStatus === 'upcoming') return { message: `Booking confirmed! ${userBooking?.seats_requested} seat(s)`, type: 'confirmed', icon: 'checkmark-circle', color: '#10B981' };
    }
    return null;
  }, [getRideStatus, userBooking, currentRide, rideCompleted]);
  
  // Actions
  const handleModifySeats = async () => {
    if (!userBooking || !canModifySeats()) {
      showCustomAlert('Cannot Modify', 'Modifications are not available at this time.', 'warning');
      return;
    }
    
    const currentSeatsBooked = userBooking.seats_requested || 0;
    const otherBookedSeats = Math.max(0, totalBookedSeats - currentSeatsBooked);
    const maxSeatsUserCanRequest = totalSeatsOffered - otherBookedSeats;
    
    if (maxSeatsUserCanRequest <= 0) {
      showCustomAlert('No Seats Available', 'No additional seats are available.', 'warning');
      return;
    }
    if (seatsRequested > maxSeatsUserCanRequest) {
      showCustomAlert('Not Enough Seats', `Only ${maxSeatsUserCanRequest} seat(s) available.`, 'warning');
      return;
    }
    if (seatsRequested < 1) {
      showCustomAlert('Invalid Seats', 'Minimum 1 seat required.', 'warning');
      return;
    }
    if (seatsRequested === currentSeatsBooked) {
      showCustomAlert('No Change', 'Seat count is already set to this value.', 'info');
      return;
    }
    
    setModifyingSeats(true);
    try {
      const response = await fetch(`${API_BASE_URL}/api/v1/modifications/request/${userBooking.id}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ requested_seats: seatsRequested }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.detail || data.message);
      
      showCustomAlert('Request Sent', `Request to change to ${seatsRequested} seat(s) sent.`, 'info');
      setSeatModificationRequested(true);
      setPendingSeatsRequest(seatsRequested);
      await fetchModificationRequests();
    } catch (error) {
      showCustomAlert('Error', error.message, 'error');
    } finally {
      setModifyingSeats(false);
    }
  };
  
  const handleCancelBooking = async () => {
    if (!userBooking || !canCancelBooking()) return;
    
    setModifyingSeats(true);
    setCancelLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/booking/${userBooking.id}/cancel`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.detail || data.message);
      
      showCustomAlert('Success', 'Booking cancelled successfully', 'success');
      setTimeout(() => navigation.goBack(), 1500);
    } catch (error) {
      showCustomAlert('Error', error.message, 'error');
    } finally {
      setModifyingSeats(false);
      setCancelLoading(false);
      setShowCancelModal(false);
    }
  };
  
  const viewDriverProfile = () => {
    const driverPhone = currentRide?.phoneNumber || currentRide?.driver_phone;
    const driverUserId = currentRide?.driverUserId || currentRide?.driver_user_id;
    if (driverPhone || driverUserId) {
      navigation.navigate('ViewProfileScreen', {
        userId: driverUserId || null,
        phoneNumber: driverPhone || null,
        driverName: driverProfile?.full_name || currentRide?.driverName || 'Driver',
        profilePicture: getProfilePhotoUrl(),
      });
    }
  };
  
  const shareRideDetails = async () => {
    const message = `🚗 *Ride Details* 🚗\n\n` +
      `From: ${currentRide?.from || currentRide?.origin || 'Pickup'}\n` +
      `To: ${currentRide?.to || currentRide?.destination || 'Drop'}\n` +
      `Date: ${formatDate(currentRide?.departure_time)}\n` +
      `Price: ₹${currentRide?.price || currentRide?.price_per_seat || 0}/seat\n` +
      `Seats: ${userBooking?.seats_requested || 1}\n` +
      `Total: ₹${(currentRide?.price || currentRide?.price_per_seat || 0) * (userBooking?.seats_requested || 1)}\n\n` +
      `Driver: ${driverProfile?.full_name || currentRide?.driverName || 'Driver'}`;
    
    await Share.share({ message, title: 'Ride Details' });
  };
  
  const handleProfileImagePress = () => {
    const photoUrl = getProfilePhotoUrl();
    if (photoUrl) {
      setSelectedProfile({ visible: true, imageUrl: photoUrl, driverName: driverProfile?.full_name || currentRide?.driverName || 'Driver' });
    } else {
      showCustomAlert('No Photo', 'Driver has not uploaded a profile picture', 'warning');
    }
  };
  
  // Effects
  useEffect(() => {
    if (currentRide) {
      loadDriverData();
      fetchSeatAvailability();
      checkLiveSession();
      checkSessionStatus();
    }
  }, [currentRide]);
  
  useFocusEffect(
    useCallback(() => {
      if (currentRide) {
        fetchSeatAvailability();
        checkLiveSession();
        checkSessionStatus();
        fetchModificationRequests();
        fetchDriverRatingForRide();
      }
      hasShownRatingModal.current = false;
      return () => {
        if (socketRef.current) {
          socketRef.current.disconnect();
          socketRef.current = null;
        }
      };
    }, [currentRide])
  );
  
  // Memoized values for map
  const profilePhotoUrl = getProfilePhotoUrl();
  const avatarText = getDriverInitials(driverProfile?.full_name || currentRide?.driverName || 'Driver');
  const isProfilePhotoSvg = profilePhotoUrl?.toLowerCase().includes('.svg');
  const allPreferences = useMemo(() => extractAllPreferences(currentRide, driverProfile?.travel_preferences), [currentRide, driverProfile]);
  
  const driverStart = useMemo(() => {
    const coords = currentRide?.routeCoordinates;
    if (Array.isArray(coords) && coords.length > 0) {
      const first = coords[0];
      if (Array.isArray(first) && first.length === 2) return { latitude: first[1], longitude: first[0] };
    }
    return parseSuggestedPoint(currentRide?.suggestedPickup || currentRide?.suggested_pickup_point);
  }, [currentRide]);
  
  const driverEnd = useMemo(() => {
    const coords = currentRide?.routeCoordinates;
    if (Array.isArray(coords) && coords.length > 0) {
      const last = coords[coords.length - 1];
      if (Array.isArray(last) && last.length === 2) return { latitude: last[1], longitude: last[0] };
    }
    return parseSuggestedPoint(currentRide?.suggestedDrop || currentRide?.suggested_drop_point);
  }, [currentRide]);
  
  const intersectionPickup = useMemo(() => parseSuggestedPoint(currentRide?.suggestedPickup || currentRide?.suggested_pickup_point), [currentRide]);
  const intersectionDrop = useMemo(() => parseSuggestedPoint(currentRide?.suggestedDrop || currentRide?.suggested_drop_point), [currentRide]);
  
  const routePath = useMemo(() => {
    const fullRoute = parseRouteCoordinates(currentRide?.routeCoordinates);
    if (fullRoute.length >= 2) return fullRoute;
    if (intersectionPickup && intersectionDrop) return [intersectionPickup, intersectionDrop];
    return [];
  }, [currentRide, intersectionPickup, intersectionDrop]);
  
  const allMarkerCoords = useMemo(() => {
    const coords = [];
    if (driverStart) coords.push(driverStart);
    if (driverEnd) coords.push(driverEnd);
    if (intersectionPickup) coords.push(intersectionPickup);
    if (intersectionDrop) coords.push(intersectionDrop);
    if (driverLocation) coords.push(driverLocation);
    return coords;
  }, [driverStart, driverEnd, intersectionPickup, intersectionDrop, driverLocation]);
  
  const fitMapToMarkers = useCallback(() => {
    if (mapRef.current && mapReady && allMarkerCoords.length >= 1) {
      setTimeout(() => {
        try {
          if (allMarkerCoords.length === 1) {
            mapRef.current.animateToRegion({
              latitude: allMarkerCoords[0].latitude,
              longitude: allMarkerCoords[0].longitude,
              latitudeDelta: 0.01,
              longitudeDelta: 0.01,
            }, 500);
          } else {
            mapRef.current.fitToCoordinates(allMarkerCoords, {
              edgePadding: { top: 80, right: 50, bottom: 50, left: 50 },
              animated: true,
            });
          }
        } catch (e) { console.log('fitToCoordinates error:', e); }
      }, 500);
    }
  }, [mapReady, allMarkerCoords]);
  
  useEffect(() => {
    if (mapReady && allMarkerCoords.length >= 1) fitMapToMarkers();
  }, [mapReady, allMarkerCoords, fitMapToMarkers]);
  
  const vehicleName = driverProfile?.vehicle?.model || currentRide?.vehicle?.model || 'Vehicle details unavailable';
  const vehicleRegNumber = driverProfile?.vehicle?.registration_number || currentRide?.vehicle?.registration_number;
  const vehicleColor = driverProfile?.vehicle?.color || currentRide?.vehicle?.color || 'Not specified';
  
  const rideStatus = getRideStatus();
  const modificationsAllowed = canModifySeats();
  const cancellationsAllowed = canCancelBooking();
  const rideStatusMessage = getRideStatusMessage();
  const isAutoCancelled = rideStatus === 'auto-cancelled' || rideStatus === 'expired';
  const showLiveTracking = liveSession && !rideCompleted;
  // const showLiveTracking = liveSession && (rideStatus === 'ongoing' || rideStatus === 'late') && !rideCompleted;
  const isCompleted = rideStatus === 'completed';
  
  const otherBookedSeats = totalBookedSeats - (userBooking?.seats_requested || 0);
  const maxUserCanRequest = totalSeatsOffered - otherBookedSeats;
  const totalAmountPaid = (currentRide?.price || currentRide?.price_per_seat || 0) * (userBooking?.seats_requested || 1);
  
  const initialRegion = {
    latitude: intersectionPickup?.latitude || driverStart?.latitude || 28.6139,
    longitude: intersectionPickup?.longitude || driverStart?.longitude || 77.2090,
    latitudeDelta: 0.05,
    longitudeDelta: 0.05,
  };
  
  if (!currentRide) {
    return (
      <View style={styles.loaderContainer}>
        <Text style={{ fontSize: 16, color: Colors.gray, marginBottom: 20 }}>No ride data available</Text>
        <TouchableOpacity onPress={() => navigation.goBack()} style={{ padding: 12, backgroundColor: Colors.primary, borderRadius: 8 }}>
          <Text style={{ color: '#fff' }}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }
  
  // Main render
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
          showsUserLocation={true}
          showsMyLocationButton={true}
        >
          {routePath.length >= 2 && <Polyline coordinates={routePath} strokeColor="#2457A6" strokeWidth={5} lineCap="round" lineJoin="round" />}
          
          {driverStart && (
            <Marker coordinate={driverStart} anchor={{ x: 0.5, y: 1 }}>
              <View style={styles.markerWrapper}>
                <View style={[styles.pinBubble, { backgroundColor: '#16A34A' }]}><Text style={styles.pinIcon}>S</Text></View>
                <View style={[styles.pinPointer, { borderTopColor: '#16A34A' }]} />
              </View>
            </Marker>
          )}
          
          {driverEnd && (
            <Marker coordinate={driverEnd} anchor={{ x: 0.5, y: 1 }}>
              <View style={styles.markerWrapper}>
                <View style={[styles.pinBubble, { backgroundColor: '#DC2626' }]}><Text style={styles.pinIcon}>E</Text></View>
                <View style={[styles.pinPointer, { borderTopColor: '#DC2626' }]} />
              </View>
            </Marker>
          )}
          
          {intersectionPickup && (
            <Marker coordinate={intersectionPickup} anchor={{ x: 0.5, y: 1 }}>
              <View style={styles.markerWrapper}>
                <View style={[styles.pinBubble, { backgroundColor: '#FACC15' }]}><Ionicons name="hand-right" size={12} color="#713F12" /></View>
                <View style={[styles.pinPointer, { borderTopColor: '#FACC15' }]} />
                <View style={styles.pinLabelBubbleYellow}><Text style={styles.pinLabelTextYellow}>Meet Driver</Text></View>
              </View>
            </Marker>
          )}
          
          {intersectionDrop && (
            <Marker coordinate={intersectionDrop} anchor={{ x: 0.5, y: 1 }}>
              <View style={styles.markerWrapper}>
                <View style={[styles.pinBubble, { backgroundColor: '#FACC15' }]}><Ionicons name="exit" size={12} color="#713F12" /></View>
                <View style={[styles.pinPointer, { borderTopColor: '#FACC15' }]} />
                <View style={styles.pinLabelBubbleYellow}><Text style={styles.pinLabelTextYellow}>Exit Here</Text></View>
              </View>
            </Marker>
          )}
        </MapView>
        
        <TouchableOpacity style={styles.mapBackButton} onPress={() => navigation.goBack()}>
          <Ionicons name="chevron-back" size={26} color={Colors.secondary} />
        </TouchableOpacity>
        
          {showLiveTracking && (
  <TouchableOpacity style={styles.liveTrackingButton} onPress={() => navigation.navigate('OngoingRideRiderScreen', { bookingId: userBooking?.id, sessionId: liveSession?.session_id })}>
    <View style={styles.liveDot} />
    <Text style={styles.liveTrackingButtonText}>Track Live Ride</Text>
  </TouchableOpacity>
)}
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
                <Text style={styles.collapsedDriver} numberOfLines={1}>{driverProfile?.full_name || currentRide?.driverName || 'Driver'}</Text>
                <Text style={styles.collapsedSub} numberOfLines={1}>{currentRide?.from || currentRide?.origin || 'Pickup'} → {currentRide?.to || currentRide?.destination || 'Drop'}</Text>
              </View>
              <View style={styles.collapsedPriceWrap}>
                <Text style={styles.collapsedPrice}>₹{currentRide?.price || currentRide?.price_per_seat || 0}</Text>
                <Text style={styles.collapsedPerSeat}>per seat</Text>
              </View>
            </View>
          </View>
        ) : (
          <ScrollView style={styles.drawerScroll} contentContainerStyle={styles.drawerContent}>
            {/* Status Banner */}
            {rideStatusMessage && (
              <View style={[styles.statusBanner, { backgroundColor: rideStatusMessage.color + '20' }]}>
                <Ionicons name={rideStatusMessage.icon} size={20} color={rideStatusMessage.color} />
                <Text style={[styles.statusBannerText, { color: rideStatusMessage.color, flex: 1 }]}>{rideStatusMessage.message}</Text>
              </View>
            )}
            
            {/* Driver Card with Chat Button */}
            <View style={styles.driverCard}>
              <View style={styles.driverTopRow}>
                <View style={styles.driverLeftWrap}>
                  <TouchableOpacity style={styles.driverAvatar} onPress={handleProfileImagePress}>
                    {profilePhotoUrl ? (
                      isProfilePhotoSvg ? (
                        <View style={styles.svgAvatarContainer}><SvgCssUri uri={profilePhotoUrl} width={56} height={56} /></View>
                      ) : (
                        <Image source={{ uri: profilePhotoUrl }} style={styles.avatarImg} />
                      )
                    ) : (
                      <View style={styles.avatarPlaceholder}>
                        <Text style={styles.avatarText}>{avatarText}</Text>
                      </View>
                    )}
                  </TouchableOpacity>
                  <View style={styles.driverMeta}>
                    <View style={styles.driverNameRow}>
                      <Text style={styles.driverName}>{driverProfile?.full_name || currentRide?.driverName || 'Driver'}</Text>
                      {isVerified && <Ionicons name="checkmark-circle" size={14} color="#2457A6" />}
                    </View>
                    <View style={styles.ratingRow}>
                      <Ionicons name="star" size={13} color="#F59E0B" />
                      <Text style={styles.ratingText}>{driverProfile?.avg_rating || currentRide?.rating || 4.5}</Text>
                    </View>
                  </View>
                </View>
                {/* Chat Button */}
                <TouchableOpacity style={styles.chatButton} onPress={handleChatWithDriver}>
                  <Ionicons name="chatbubble-ellipses" size={22} color="#2457A6" />
                </TouchableOpacity>
              </View>
              
              {/* Action Buttons Row */}
              <View style={styles.actionButtonsRow}>
                <TouchableOpacity style={styles.profileOutlineBtn} onPress={viewDriverProfile}>
                  <Text style={styles.profileOutlineBtnText}>View Full Profile</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.shareOutlineBtn} onPress={shareRideDetails}>
                  <Ionicons name="share-outline" size={18} color="#2457A6" />
                  <Text style={styles.shareOutlineBtnText}>Share</Text>
                </TouchableOpacity>
              </View>
            </View>
            
            {/* Driver's Rating for This Ride */}
            {showDriverRating && driverRating && (
              <View style={styles.driverRatingCard}>
                <View style={styles.driverRatingHeader}>
                  <Ionicons name="star" size={18} color="#F59E0B" />
                  <Text style={styles.driverRatingTitle}>Driver's Rating for this Ride</Text>
                </View>
                <View style={styles.driverRatingContent}>
                  <RatingStars rating={driverRating} size={20} />
                  {driverFeedbackText ? (
                    <Text style={styles.driverFeedbackText}>"{driverFeedbackText}"</Text>
                  ) : (
                    <Text style={styles.driverFeedbackPlaceholder}>No feedback provided</Text>
                  )}
                </View>
              </View>
            )}
            
            {/* Trip Details Section */}
            <View style={styles.cardSection}>
              <Text style={styles.sectionTitle}>📍 Trip Details</Text>
              
              <View style={styles.tripItem}>
                <View style={styles.tripIconContainer}>
                  <Ionicons name="location" size={20} color="#16A34A" />
                </View>
                <View style={styles.tripDetails}>
                  <Text style={styles.tripLabel}>From</Text>
                  <Text style={styles.tripValue}>{currentRide?.from || currentRide?.origin || 'Pickup location'}</Text>
                </View>
              </View>
              
              <View style={styles.tripDivider} />
              
              <View style={styles.tripItem}>
                <View style={styles.tripIconContainer}>
                  <Ionicons name="flag" size={20} color="#DC2626" />
                </View>
                <View style={styles.tripDetails}>
                  <Text style={styles.tripLabel}>To</Text>
                  <Text style={styles.tripValue}>{currentRide?.to || currentRide?.destination || 'Drop location'}</Text>
                </View>
              </View>
              
              <View style={styles.tripMetaRow}>
                <View style={styles.tripMetaItem}>
                  <Ionicons name="calendar-outline" size={16} color={Colors.gray} />
                  <Text style={styles.tripMetaText}>{formatDate(currentRide?.departure_time)}</Text>
                </View>
                {currentRide?.distance_km && (
                  <View style={styles.tripMetaItem}>
                    <Ionicons name="map-outline" size={16} color={Colors.gray} />
                    <Text style={styles.tripMetaText}>{currentRide.distance_km} km</Text>
                  </View>
                )}
                {currentRide?.duration_text && (
                  <View style={styles.tripMetaItem}>
                    <Ionicons name="time-outline" size={16} color={Colors.gray} />
                    <Text style={styles.tripMetaText}>{currentRide.duration_text}</Text>
                  </View>
                )}
              </View>
            </View>
            
            {/* Vehicle Details Section */}
            <View style={styles.cardSection}>
              <Text style={styles.sectionTitle}>🚗 Vehicle Details</Text>
              <View style={styles.vehicleDetailRow}>
                <Ionicons name="car-sport-outline" size={24} color="#2457A6" />
                <View style={styles.vehicleDetailInfo}>
                  <Text style={styles.vehicleDetailName}>{vehicleName}</Text>
                  <Text style={styles.vehicleDetailColor}>Color: {vehicleColor}</Text>
                  {vehicleRegNumber && <Text style={styles.vehicleDetailReg}>Registration: {vehicleRegNumber}</Text>}
                  <Text style={styles.vehicleDetailSeats}>Total Seats: {totalSeatsOffered}</Text>
                </View>
              </View>
            </View>
            
            {/* Seat Availability Section */}
            <View style={styles.cardSection}>
              <Text style={styles.sectionTitle}>💺 Seat Availability</Text>
              <View style={styles.seatStatsRow}>
                <View style={styles.seatStat}>
                  <Text style={styles.seatStatValue}>{totalSeatsOffered}</Text>
                  <Text style={styles.seatStatLabel}>Total Seats</Text>
                </View>
                <View style={styles.seatStat}>
                  <Text style={[styles.seatStatValue, { color: '#10B981' }]}>{totalBookedSeats}</Text>
                  <Text style={styles.seatStatLabel}>Booked</Text>
                </View>
                <View style={styles.seatStat}>
                  <Text style={[styles.seatStatValue, { color: '#F59E0B' }]}>{availableSeats}</Text>
                  <Text style={styles.seatStatLabel}>Available</Text>
                </View>
              </View>
              <View style={styles.seatProgressContainer}>
                <View style={[styles.seatProgressBar, { width: `${totalSeatsOffered > 0 ? (totalBookedSeats / totalSeatsOffered) * 100 : 0}%` }]} />
              </View>
            </View>
            
            {/* Ride Preferences Section */}
            {allPreferences.length > 0 && (
              <View style={styles.cardSection}>
                <Text style={styles.sectionTitle}>🎯 Ride Preferences</Text>
                <View style={styles.tagRow}>
                  {allPreferences.map((pref, index) => (
                    <GenericPreferenceTag key={`${pref}-${index}`} label={pref} />
                  ))}
                </View>
              </View>
            )}
            
            {/* Booking Details Section */}
            <View style={styles.cardSection}>
              <Text style={styles.sectionTitle}>📋 Your Booking</Text>
              
              {userBooking ? (
                <>
                  <View style={styles.bookingDetailRow}>
                    <Text style={styles.bookingDetailLabel}>Booking ID</Text>
                    <Text style={styles.bookingDetailValue}>#{userBooking.id}</Text>
                  </View>
                  <View style={styles.bookingDetailRow}>
                    <Text style={styles.bookingDetailLabel}>Seats Booked</Text>
                    <Text style={styles.bookingDetailValue}>{userBooking.seats_requested}</Text>
                  </View>
                  <View style={styles.bookingDetailRow}>
                    <Text style={styles.bookingDetailLabel}>Price per Seat</Text>
                    <Text style={styles.bookingDetailValue}>₹{currentRide?.price || currentRide?.price_per_seat || 0}</Text>
                  </View>
                  <View style={[styles.bookingDetailRow, styles.bookingTotalRow]}>
                    <Text style={styles.bookingTotalLabel}>Total Amount</Text>
                    <Text style={styles.bookingTotalValue}>₹{totalAmountPaid}</Text>
                  </View>
                  <View style={styles.bookingDetailRow}>
                    <Text style={styles.bookingDetailLabel}>Status</Text>
                    <View style={[styles.bookingStatusBadge, { backgroundColor: userBooking.status === 'accepted' ? '#10B98120' : userBooking.status === 'pending' ? '#F59E0B20' : '#EF444420' }]}>
                      <Text style={[styles.bookingStatusText, { color: userBooking.status === 'accepted' ? '#10B981' : userBooking.status === 'pending' ? '#F59E0B' : '#EF4444' }]}>
                        {userBooking.status === 'accepted' ? 'Confirmed' : userBooking.status === 'pending' ? 'Pending' : userBooking.status}
                      </Text>
                    </View>
                  </View>
                </>
              ) : (
                <Text style={styles.emptyText}>No booking information available</Text>
              )}
              
              {/* Pending Modification Request Section */}
              {pendingModificationRequest && pendingModificationRequest.status === 'pending' && (
                <>
                  <View style={styles.divider} />
                  <View style={styles.pendingModificationHeader}>
                    <Ionicons name="time-outline" size={24} color="#F59E0B" />
                    <Text style={styles.pendingModificationTitle}>Pending Modification Request</Text>
                  </View>
                  
                  <View style={styles.pendingModificationDetails}>
                    <View style={styles.modificationDetailRow}>
                      <Text style={styles.modificationDetailLabel}>Current Seats:</Text>
                      <Text style={styles.modificationDetailValue}>{pendingModificationRequest.current_seats || userBooking?.seats_requested}</Text>
                    </View>
                    <View style={styles.modificationDetailRow}>
                      <Text style={styles.modificationDetailLabel}>Requested Seats:</Text>
                      <Text style={[styles.modificationDetailValue, { color: '#F59E0B', fontWeight: '800' }]}>
                        {pendingModificationRequest.requested_seats || pendingSeatsRequest}
                      </Text>
                    </View>
                    <View style={styles.modificationDetailRow}>
                      <Text style={styles.modificationDetailLabel}>Status:</Text>
                      <View style={[styles.pendingBadge, { backgroundColor: '#FEF3C7' }]}>
                        <Text style={[styles.pendingBadgeText, { color: '#D97706' }]}>Waiting for Driver Approval</Text>
                      </View>
                    </View>
                    {pendingModificationRequest.created_at && (
                      <Text style={styles.modificationDate}>
                        Requested on: {new Date(pendingModificationRequest.created_at).toLocaleString()}
                      </Text>
                    )}
                  </View>
                  
                  <TouchableOpacity 
                    style={styles.cancelModificationBtn}
                    onPress={handleCancelModificationRequest}
                    disabled={modifyingSeats}
                  >
                    <Text style={styles.cancelModificationBtnText}>
                      {modifyingSeats ? 'Cancelling...' : 'Cancel Request'}
                    </Text>
                  </TouchableOpacity>
                </>
              )}
              
              {/* Modify Seats Section - Only show if no pending modification */}
              {modificationsAllowed && userBooking?.status === "accepted" && !isAutoCancelled && totalSeatsOffered > 0 && !seatModificationRequested && (
                <>
                  <View style={styles.divider} />
                  <Text style={styles.sectionSubtitle}>Modify Seats</Text>
                  
                  {otherBookedSeats > 0 && (
                    <View style={styles.otherBookedInfo}>
                      <Ionicons name="information-circle" size={14} color="#F59E0B" />
                      <Text style={styles.otherBookedInfoText}>{otherBookedSeats} seat(s) booked by others</Text>
                    </View>
                  )}
                  
                  <View style={styles.seatSelectorRow}>
                    <TouchableOpacity style={[styles.seatActionBtn, seatsRequested === 1 && styles.seatActionBtnDisabled]} onPress={() => setSeatsRequested(Math.max(1, seatsRequested - 1))} disabled={seatsRequested === 1 || modifyingSeats}>
                      <Ionicons name="remove" size={20} color={seatsRequested === 1 ? Colors.gray : Colors.dark} />
                    </TouchableOpacity>
                    <View style={styles.seatCountWrap}>
                      <Text style={styles.seatCountText}>{seatsRequested}</Text>
                      <Text style={styles.seatAvailableText}>/ {maxUserCanRequest} max</Text>
                    </View>
                    <TouchableOpacity style={[styles.seatActionBtn, seatsRequested >= maxUserCanRequest && styles.seatActionBtnDisabled]} onPress={() => setSeatsRequested(Math.min(maxUserCanRequest, seatsRequested + 1))} disabled={seatsRequested >= maxUserCanRequest || modifyingSeats}>
                      <Ionicons name="add" size={20} color={seatsRequested >= maxUserCanRequest ? Colors.gray : "#2457A6"} />
                    </TouchableOpacity>
                  </View>
                  
                  <TouchableOpacity style={[styles.updateSeatsBtn, (modifyingSeats || seatsRequested === userBooking?.seats_requested) && styles.updateSeatsBtnDisabled]} onPress={handleModifySeats} disabled={modifyingSeats || seatsRequested === userBooking?.seats_requested}>
                    <Text style={styles.updateSeatsBtnText}>{modifyingSeats ? 'Sending...' : 'Request Seat Change'}</Text>
                  </TouchableOpacity>
                </>
              )}
              
              {/* Cancel Booking Button */}
              {cancellationsAllowed && userBooking?.status !== "rejected" && !isAutoCancelled && (
                <TouchableOpacity style={[styles.cancelBookingBtn, (modifyingSeats || cancelLoading) && styles.cancelBookingBtnDisabled]} onPress={() => setShowCancelModal(true)} disabled={modifyingSeats || cancelLoading}>
                  <Text style={styles.cancelBookingBtnText}>{userBooking?.status === "pending" ? "Cancel Request" : "Cancel Booking"}</Text>
                </TouchableOpacity>
              )}
            </View>
            
            {/* Other Riders Section */}
            <View style={styles.cardSection}>
              <Text style={styles.sectionTitle}>👥 Other Riders ({otherRiders.length})</Text>
              {otherRiders.length === 0 ? (
                <View style={styles.noRidersContainer}>
                  <Ionicons name="people-outline" size={40} color={Colors.gray} />
                  <Text style={styles.noRidersText}>No other riders yet</Text>
                </View>
              ) : (
                otherRiders.map((rider, index) => (
                  <View key={rider.booking_id || index} style={styles.otherRiderItem}>
                    <View style={styles.otherRiderAvatar}>
                      {rider.profile_picture ? (
                        <Image source={{ uri: buildImageUrl(rider.profile_picture) }} style={styles.otherRiderAvatarImg} />
                      ) : (
                        <View style={styles.otherRiderAvatarPlaceholder}>
                          <Text style={styles.otherRiderAvatarText}>{getDriverInitials(rider.passenger_name)}</Text>
                        </View>
                      )}
                    </View>
                    <View style={styles.otherRiderInfo}>
                      <Text style={styles.otherRiderName}>{rider.passenger_name || 'Rider'}</Text>
                      <Text style={styles.otherRiderSeats}>{rider.seats_booked || 1} seat(s)</Text>
                    </View>
                  </View>
                ))
              )}
            </View>
            
            {/* Safety Card */}
            <View style={styles.safetyCard}>
              <Ionicons name="shield-checkmark-outline" size={18} color="#2457A6" />
              <View>
                <Text style={styles.safetyTitle}>Safety First</Text>
                <Text style={styles.safetySub}>Live GPS tracking & 24/7 support available</Text>
              </View>
            </View>
            
            <View style={{ height: 40 }} />
          </ScrollView>
        )}
      </Animated.View>
      
      {/* Cancel Modal */}
      <Modal visible={showCancelModal} transparent animationType="fade" onRequestClose={() => setShowCancelModal(false)}>
        <View style={styles.modalBackdrop}>
          <View style={styles.confirmModalContent}>
            <Ionicons name="alert-circle" size={40} color="#F59E0B" />
            <Text style={styles.confirmModalTitle}>{userBooking?.status === "pending" ? "Cancel Request?" : "Cancel Booking?"}</Text>
            <Text style={styles.confirmModalMessage}>
              {userBooking?.status === "pending" 
                ? "Are you sure you want to cancel your booking request?"
                : "Are you sure you want to cancel your booking? This cannot be undone."}
            </Text>
            <View style={styles.confirmModalButtons}>
              <TouchableOpacity style={[styles.confirmModalBtn, styles.confirmModalCancelBtn]} onPress={() => setShowCancelModal(false)}>
                <Text style={styles.confirmModalCancelBtnText}>Keep</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.confirmModalBtn, styles.confirmModalConfirmBtn]} onPress={handleCancelBooking}>
                <Text style={styles.confirmModalConfirmBtnText}>Cancel</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
      
      {/* Rating Modal */}
      <Modal visible={ratingModalVisible} transparent animationType="fade" onRequestClose={() => setRatingModalVisible(false)}>
        <View style={styles.modalBackdrop}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>Rate Your Driver</Text>
            <Text style={styles.modalSub}>How was your ride with {driverProfile?.full_name?.split(' ')[0] || 'the driver'}?</Text>
            <RatingStars rating={rating} size={32} onPress={setRating} />
            <TextInput
              value={feedback}
              onChangeText={setFeedback}
              placeholder="Share your feedback (optional)"
              multiline
              numberOfLines={3}
              style={styles.feedbackInput}
              textAlignVertical="top"
            />
            <View style={styles.modalActions}>
              <TouchableOpacity style={styles.skipBtn} onPress={() => setRatingModalVisible(false)}>
                <Text style={styles.skipBtnText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.submitBtn, (rating === 0 || submitting) && { opacity: 0.5 }]} onPress={handleRateDriver} disabled={rating === 0 || submitting}>
                <Text style={styles.submitBtnText}>{submitting ? 'Submitting...' : 'Submit Rating'}</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
      
      <ProfileImageModal visible={selectedProfile.visible} imageUrl={selectedProfile.imageUrl} driverName={selectedProfile.driverName} onClose={() => setSelectedProfile({ visible: false, imageUrl: null, driverName: '' })} />
      <CustomAlert visible={alertVisible} title={alertConfig.title} message={alertConfig.message} icon={alertConfig.icon} iconColor={alertConfig.iconColor} buttons={alertConfig.buttons} onBackdropPress={() => setAlertVisible(false)} />
    </View>
  );
}

// ============================================
// STYLES (Add new styles to existing ones)
// ============================================

const styles = StyleSheet.create({
  // ... (keep all your existing styles)
  container: { flex: 1, backgroundColor: '#F4F5F7' },
  mapContainer: { width: '100%', overflow: 'hidden', backgroundColor: '#E8EEF7' },
  map: { flex: 1, backgroundColor: '#E8EEF7' },
  mapBackButton: { position: 'absolute', top: Platform.OS === 'ios' ? 54 : 22, left: 14, width: 42, height: 42, borderRadius: 25, backgroundColor: 'rgba(255,255,255,0.96)', alignItems: 'center', justifyContent: 'center', shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4, elevation: 3 },
  liveTrackingButton: { position: 'absolute', bottom: 20, left: 20, right: 20, backgroundColor: '#10B981', flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 14, borderRadius: 12, gap: 8, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.25, shadowRadius: 4, elevation: 5 },
  liveTrackingButtonText: { color: '#fff', fontWeight: '700', fontSize: 14 },
  liveDot: { width: 10, height: 10, borderRadius: 5, backgroundColor: '#fff', marginRight: 6 },
  markerWrapper: { alignItems: 'center' },
  pinBubble: { width: 28, height: 28, borderRadius: 14, borderWidth: 3, borderColor: 'white', alignItems: 'center', justifyContent: 'center', shadowColor: '#000', shadowOffset: { width: 0, height: 3 }, shadowOpacity: 0.25, shadowRadius: 4, elevation: 5 },
  pinPointer: { width: 0, height: 0, backgroundColor: 'transparent', borderStyle: 'solid', borderLeftWidth: 7, borderRightWidth: 7, borderTopWidth: 10, borderLeftColor: 'transparent', borderRightColor: 'transparent', marginTop: -2 },
  pinIcon: { fontSize: 14, fontWeight: '800', color: 'white', textAlign: 'center', lineHeight: 18 },
  pinLabelBubbleYellow: { backgroundColor: 'rgba(113, 63, 18, 0.9)', borderRadius: 8, paddingHorizontal: 8, paddingVertical: 3, marginTop: 4 },
  pinLabelTextYellow: { color: '#FACC15', fontSize: 10, fontWeight: '700' },
  drawer: { position: 'absolute', bottom: 0, left: 0, right: 0, backgroundColor: '#F4F5F7', borderTopLeftRadius: 28, borderTopRightRadius: 28, overflow: 'hidden', shadowColor: '#000', shadowOffset: { width: 0, height: -2 }, shadowOpacity: 0.1, shadowRadius: 8, elevation: 10 },
  handleWrap: { alignItems: 'center', paddingTop: 10, paddingBottom: 8, backgroundColor: '#F4F5F7', position: 'relative' },
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
  statusBannerText: { fontSize: 13, fontWeight: '700', flex: 1 },
  driverCard: { backgroundColor: 'white', borderRadius: 20, padding: 16, marginBottom: 14, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 8, elevation: 2 },
  driverTopRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  driverLeftWrap: { flexDirection: 'row', flex: 1, paddingRight: 10 },
  driverAvatar: { width: 56, height: 56, borderRadius: 28, backgroundColor: '#E5E7EB', overflow: 'hidden', alignItems: 'center', justifyContent: 'center', marginRight: 12 },
  avatarImg: { width: 56, height: 56, borderRadius: 28, resizeMode: 'cover' },
  avatarText: { fontSize: 15, fontWeight: '800', color: Colors.gray },
  avatarPlaceholder: { width: 56, height: 56, borderRadius: 28, backgroundColor: '#E5E7EB', alignItems: 'center', justifyContent: 'center' },
  svgAvatarContainer: { width: 56, height: 56, borderRadius: 28, overflow: 'hidden', alignItems: 'center', justifyContent: 'center', backgroundColor: '#E5E7EB' },
  driverMeta: { flex: 1 },
  driverNameRow: { flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap', gap: 6 },
  driverName: { fontSize: 17, fontWeight: '800', color: Colors.dark },
  ratingRow: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 6 },
  ratingText: { fontSize: 13, color: Colors.dark, fontWeight: '700' },
  chatButton: { width: 44, height: 44, borderRadius: 22, backgroundColor: '#E8F0FE', alignItems: 'center', justifyContent: 'center' },
  actionButtonsRow: { flexDirection: 'row', gap: 12, marginTop: 14 },
  profileOutlineBtn: { flex: 2, borderWidth: 1, borderColor: '#2457A6', borderRadius: 16, paddingVertical: 12, alignItems: 'center' },
  profileOutlineBtnText: { color: '#2457A6', fontWeight: '700', fontSize: 14 },
  shareOutlineBtn: { flex: 1, borderWidth: 1, borderColor: '#2457A6', borderRadius: 16, paddingVertical: 12, alignItems: 'center', flexDirection: 'row', justifyContent: 'center', gap: 6 },
  shareOutlineBtnText: { color: '#2457A6', fontWeight: '700', fontSize: 14 },
  driverRatingCard: { backgroundColor: '#FFFBEB', borderRadius: 16, padding: 14, marginBottom: 14, borderWidth: 1, borderColor: '#FDE68A' },
  driverRatingHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 10 },
  driverRatingTitle: { fontSize: 13, fontWeight: '600', color: '#92400E' },
  driverRatingContent: { alignItems: 'center', gap: 8 },
  driverFeedbackText: { fontSize: 13, color: '#78350F', fontStyle: 'italic', textAlign: 'center' },
  driverFeedbackPlaceholder: { fontSize: 12, color: '#B45309', opacity: 0.7, fontStyle: 'italic' },
  cardSection: { backgroundColor: 'white', borderRadius: 20, padding: 16, marginBottom: 14, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 8, elevation: 2 },
  sectionTitle: { fontSize: 16, fontWeight: '800', color: Colors.dark, marginBottom: 14 },
  sectionSubtitle: { fontSize: 14, fontWeight: '600', color: Colors.dark, marginBottom: 12, marginTop: 8 },
  tripItem: { flexDirection: 'row', marginBottom: 16 },
  tripIconContainer: { width: 32, height: 32, borderRadius: 16, backgroundColor: '#F0F7FF', alignItems: 'center', justifyContent: 'center', marginRight: 12 },
  tripDetails: { flex: 1 },
  tripLabel: { fontSize: 12, color: Colors.gray, marginBottom: 2 },
  tripValue: { fontSize: 15, fontWeight: '600', color: Colors.dark },
  tripDivider: { height: 1, backgroundColor: '#EEF2F7', marginVertical: 12, marginLeft: 16 },
  tripMetaRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 16, marginTop: 8, paddingTop: 12, borderTopWidth: 1, borderTopColor: '#EEF2F7' },
  tripMetaItem: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  tripMetaText: { fontSize: 13, color: Colors.gray },
  vehicleDetailRow: { flexDirection: 'row', alignItems: 'center', gap: 16 },
  vehicleDetailInfo: { flex: 1 },
  vehicleDetailName: { fontSize: 15, fontWeight: '600', color: Colors.dark },
  vehicleDetailColor: { fontSize: 13, color: '#6B7280', marginTop: 2 },
  vehicleDetailReg: { fontSize: 12, color: '#9CA3AF', marginTop: 2 },
  vehicleDetailSeats: { fontSize: 12, color: '#6B7280', marginTop: 2 },
  seatStatsRow: { flexDirection: 'row', justifyContent: 'space-around', marginBottom: 16 },
  seatStat: { alignItems: 'center' },
  seatStatValue: { fontSize: 24, fontWeight: '800', color: Colors.dark },
  seatStatLabel: { fontSize: 12, color: Colors.gray, marginTop: 4 },
  seatProgressContainer: { height: 6, backgroundColor: '#E5E7EB', borderRadius: 3, overflow: 'hidden', marginBottom: 8 },
  seatProgressBar: { height: '100%', backgroundColor: '#10B981', borderRadius: 3 },
  tagRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 14 },
  preferenceTag: { paddingHorizontal: 12, paddingVertical: 8, borderRadius: 999, backgroundColor: '#FFF3E8' },
  preferenceTagText: { fontSize: 12, color: '#C65D00', fontWeight: '700' },
  bookingDetailRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 8 },
  bookingDetailLabel: { fontSize: 14, color: Colors.gray },
  bookingDetailValue: { fontSize: 14, fontWeight: '600', color: Colors.dark },
  bookingTotalRow: { marginTop: 8, paddingTop: 8, borderTopWidth: 1, borderTopColor: '#EEF2F7' },
  bookingTotalLabel: { fontSize: 16, fontWeight: '700', color: Colors.dark },
  bookingTotalValue: { fontSize: 18, fontWeight: '800', color: '#184080' },
  bookingStatusBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20 },
  bookingStatusText: { fontSize: 12, fontWeight: '600' },
  divider: { height: 1, backgroundColor: '#EEF2F7', marginVertical: 16 },
  otherBookedInfo: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFFBEB', padding: 10, borderRadius: 8, marginBottom: 12, gap: 8 },
  otherBookedInfoText: { flex: 1, fontSize: 11, color: '#B45309' },
  seatSelectorRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: '#FAFAFB', borderRadius: 18, padding: 14, marginBottom: 12 },
  seatActionBtn: { width: 38, height: 38, borderRadius: 12, borderWidth: 1, borderColor: '#D6DDE7', alignItems: 'center', justifyContent: 'center', backgroundColor: 'white' },
  seatActionBtnDisabled: { opacity: 0.5, backgroundColor: '#F5F5F5' },
  seatCountWrap: { flexDirection: 'row', alignItems: 'baseline' },
  seatCountText: { fontSize: 28, fontWeight: '900', color: Colors.dark },
  seatAvailableText: { fontSize: 13, color: Colors.gray, marginLeft: 6, fontWeight: '600' },
  updateSeatsBtn: { backgroundColor: Colors.primary, paddingVertical: 12, borderRadius: 12, alignItems: 'center', marginTop: 8 },
  updateSeatsBtnDisabled: { opacity: 0.6 },
  updateSeatsBtnText: { color: '#fff', fontWeight: '700', fontSize: 14 },
  cancelBookingBtn: { marginTop: 12, backgroundColor: '#FEF2F2', paddingVertical: 12, borderRadius: 12, alignItems: 'center', borderWidth: 1, borderColor: '#EF4444' },
  cancelBookingBtnText: { color: '#EF4444', fontWeight: '700', fontSize: 14 },
  cancelBookingBtnDisabled: { opacity: 0.6 },
  noRidersContainer: { alignItems: 'center', padding: 30, gap: 10 },
  noRidersText: { fontSize: 14, fontWeight: '600', color: Colors.gray },
  otherRiderItem: { flexDirection: 'row', alignItems: 'center', paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: '#EEF2F7' },
  otherRiderAvatar: { width: 44, height: 44, borderRadius: 22, backgroundColor: '#E5E7EB', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', marginRight: 12 },
  otherRiderAvatarImg: { width: 44, height: 44, borderRadius: 22, resizeMode: 'cover' },
  otherRiderAvatarPlaceholder: { width: 44, height: 44, borderRadius: 22, backgroundColor: '#E5E7EB', alignItems: 'center', justifyContent: 'center' },
  otherRiderAvatarText: { fontSize: 16, fontWeight: '700', color: Colors.primary },
  otherRiderInfo: { flex: 1 },
  otherRiderName: { fontSize: 15, fontWeight: '600', color: Colors.dark, marginBottom: 2 },
  otherRiderSeats: { fontSize: 12, color: Colors.gray },
  safetyCard: { backgroundColor: '#FFF3E7', borderRadius: 18, padding: 16, marginBottom: 14, flexDirection: 'row', alignItems: 'center', gap: 12 },
  safetyTitle: { fontSize: 14, color: '#2457A6', fontWeight: '800' },
  safetySub: { marginTop: 2, fontSize: 12, color: '#2457A6', opacity: 0.9, fontWeight: '600' },
  loaderContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#fff' },
  modalBackdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center' },
  confirmModalContent: { backgroundColor: 'white', borderRadius: 24, padding: 24, width: '85%', alignItems: 'center' },
  confirmModalTitle: { fontSize: 20, fontWeight: '800', color: Colors.dark, marginTop: 12 },
  confirmModalMessage: { fontSize: 14, color: Colors.gray, textAlign: 'center', marginBottom: 24, lineHeight: 20 },
  confirmModalButtons: { flexDirection: 'row', gap: 12, width: '100%' },
  confirmModalBtn: { flex: 1, paddingVertical: 12, borderRadius: 12, alignItems: 'center' },
  confirmModalCancelBtn: { backgroundColor: '#F3F4F6' },
  confirmModalCancelBtnText: { color: Colors.dark, fontWeight: '600' },
  confirmModalConfirmBtn: { backgroundColor: '#EF4444' },
  confirmModalConfirmBtnText: { color: '#fff', fontWeight: '600' },
  modalCard: { backgroundColor: '#fff', borderRadius: 24, padding: 20, alignItems: 'center', width: width - 40 },
  modalTitle: { fontSize: 22, fontWeight: '700', color: '#111827', textAlign: 'center', marginTop: 12 },
  modalSub: { fontSize: 14, color: '#6B7280', textAlign: 'center', marginTop: 8, marginBottom: 18 },
  starsRow: { flexDirection: 'row', justifyContent: 'center', marginBottom: 18 },
  feedbackInput: { minHeight: 100, borderWidth: 1, borderColor: '#E5E7EB', borderRadius: 16, padding: 14, color: '#111827', fontSize: 14, width: '100%' },
  modalActions: { flexDirection: 'row', gap: 10, marginTop: 18, width: '100%' },
  skipBtn: { flex: 1, borderWidth: 1, borderColor: '#D1D5DB', borderRadius: 999, paddingVertical: 14, alignItems: 'center' },
  skipBtnText: { color: '#6B7280', fontWeight: '600' },
  submitBtn: { flex: 1, backgroundColor: Colors.primary, borderRadius: 999, paddingVertical: 14, alignItems: 'center' },
  submitBtnText: { color: '#fff', fontWeight: '700' },
  imageModalContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', width: '100%' },
  imageModalContent: { width: '90%', backgroundColor: Colors.white, borderRadius: 20, overflow: 'hidden', maxHeight: '80%' },
  imageModalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 16, borderBottomWidth: 1, borderBottomColor: '#EEF2F7' },
  imageModalTitle: { fontSize: 18, fontWeight: '700', color: Colors.dark },
  fullProfileImage: { width: '100%', height: 400, backgroundColor: '#F5F5F5', resizeMode: 'contain' },
  modalSvgContainer: { width: '100%', height: 400, backgroundColor: '#F5F5F5', alignItems: 'center', justifyContent: 'center' },
  noImageContainer: { width: '100%', height: 400, justifyContent: 'center', alignItems: 'center', backgroundColor: '#F5F5F5' },
  noImageText: { fontSize: 16, color: Colors.gray },
  emptyText: { fontSize: 13, color: Colors.gray, fontWeight: '600' },
  
  // Pending Modification Styles
  pendingModificationHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#FDE68A',
  },
  pendingModificationTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#92400E',
    flex: 1,
  },
  pendingModificationDetails: {
    backgroundColor: '#FFFBEB',
    borderRadius: 12,
    padding: 14,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#FDE68A',
  },
  modificationDetailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
  },
  modificationDetailLabel: {
    fontSize: 14,
    color: '#6B7280',
  },
  modificationDetailValue: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
  },
  pendingBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
  },
  pendingBadgeText: {
    fontSize: 12,
    fontWeight: '600',
  },
  modificationDate: {
    fontSize: 11,
    color: '#9CA3AF',
    marginTop: 8,
    textAlign: 'center',
  },
  cancelModificationBtn: {
    backgroundColor: '#FEF2F2',
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#EF4444',
  },
  cancelModificationBtnText: {
    color: '#EF4444',
    fontWeight: '600',
    fontSize: 14,
  },
});
