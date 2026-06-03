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
//   LogBox
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

// LogBox.ignoreLogs([
//   'Accessibility: View',
//   'Property accessibilityState',
//   'RCTView',
// ]);

// const { height, width } = Dimensions.get('window');
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
//     if (item && typeof item === 'object' && item.latitude && item.longitude) {
//       return { longitude: Number(item.longitude), latitude: Number(item.latitude) };
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
//     params.append('_t', Date.now());
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

// export default function ViewRouteRequestScreen({ navigation, route }) {
//   const { user } = useAuth();
//   const { ride, booking } = route.params || {};

//   console.log('🔍 ViewRouteRequestScreen received:', { hasRide: !!ride, rideId: ride?.id, hasBooking: !!booking, bookingId: booking?.id, bookingStatus: booking?.status });

//   const [drawerExpanded, setDrawerExpanded] = useState(true);
//   const [driverProfile, setDriverProfile] = useState(null);
//   const [isVerified, setIsVerified] = useState(false);
//   const [loadingProfile, setLoadingProfile] = useState(false);
//   const [mapReady, setMapReady] = useState(false);
  
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
//     if (ride?.booking && ride.booking.id) {
//       return {
//         id: ride.booking.id,
//         seats_requested: ride.booking.seats_requested || ride.booking.seats_booked || 1,
//         status: ride.booking.status || 'pending',
//         total_amount: ride.booking.total_amount,
//       };
//     }
//     if (ride?.seatsRequested) {
//       return {
//         id: ride.id,
//         seats_requested: ride.seatsRequested,
//         status: 'accepted',
//       };
//     }
//     console.log('⚠️ No booking found in params');
//     return null;
//   });
  
//   const [showCancelModal, setShowCancelModal] = useState(false);
//   const [seatsRequested, setSeatsRequested] = useState(() => {
//     if (booking?.seats_requested) return booking.seats_requested;
//     if (booking?.seats_booked) return booking.seats_booked;
//     if (ride?.seatsRequested) return ride.seatsRequested;
//     return 1;
//   });
  
//   const [modifyingSeats, setModifyingSeats] = useState(false);
//   const [refreshKey, setRefreshKey] = useState(0);
//   const [otherRiders, setOtherRiders] = useState([]);
//   const [loadingRiders, setLoadingRiders] = useState(false);
//   const [liveSession, setLiveSession] = useState(null);
//   const [driverLocation, setDriverLocation] = useState(null);
//   const [checkingLiveSession, setCheckingLiveSession] = useState(false);
//   const [seatModificationRequested, setSeatModificationRequested] = useState(false);
//   const [pendingSeatsRequest, setPendingSeatsRequest] = useState(null);
//   const [pendingRequestDetails, setPendingRequestDetails] = useState(null);
  
//   const [totalSeatsOffered, setTotalSeatsOffered] = useState(ride?.available_seats || ride?.seatsAvailable || 4);
//   const [totalBookedSeats, setTotalBookedSeats] = useState(0);
//   const [availableSeats, setAvailableSeats] = useState(0);

//   const fetchSeatAvailability = useCallback(async () => {
//     if (!ride?.id) return;
//     try {
//       const response = await fetch(`${API_BASE_URL}/ride/${ride.id}/passengers?_t=${Date.now()}`);
//       const data = await response.json();
      
//       const totalSeats = ride?.available_seats || ride?.seatsAvailable || data?.available_seats || 4;
//       setTotalSeatsOffered(totalSeats);
      
//       if (data.total_booked_seats !== undefined) {
//         setTotalBookedSeats(data.total_booked_seats);
//         const available = Math.max(0, totalSeats - data.total_booked_seats);
//         setAvailableSeats(available);
//       }
      
//       if (data.passengers && Array.isArray(data.passengers)) {
//         const acceptedPassengers = data.passengers.filter(p => p.status === 'accepted');
//         const otherAccepted = acceptedPassengers.filter(p => p.passenger_phone !== user?.phone_number);
//         setOtherRiders(otherAccepted);
//       }
//     } catch (error) {
//       console.log('Error fetching seat availability:', error);
//     }
//   }, [ride?.id, user?.phone_number]);

//   const animatedDrawer = useRef(new Animated.Value(1)).current;
//   const mapRef = useRef(null);
//   const socketRef = useRef(null);
  
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

//   useEffect(() => {
//     console.log('📊 userBooking initialized:', userBooking);
//   }, []);

//   const showCustomAlert = (title, message, type = 'success') => {
//     let icon = "check-circle";
//     let iconColor = "#10B981";
//     if (type === 'error') { icon = "error"; iconColor = "#EF4444"; }
//     else if (type === 'warning') { icon = "warning"; iconColor = "#F59E0B"; }
//     else if (type === 'info') { icon = "info"; iconColor = Colors.primary; }
//     setAlertConfig({ title, message, icon, iconColor, buttons: [{ text: 'OK', onPress: () => setAlertVisible(false) }] });
//     setAlertVisible(true);
//   };

//   const getRideStatus = useCallback(() => {
//     if (!ride?.departure_time) return 'unknown';
//     const now = new Date();
//     const departureTime = new Date(ride.departure_time);
//     const minutesDiff = (departureTime - now) / (1000 * 60);
//     if (now >= departureTime) return 'completed';
//     if (minutesDiff <= 15 && minutesDiff > 0) return 'ongoing';
//     if (minutesDiff > 15) return 'upcoming';
//     return 'unknown';
//   }, [ride?.departure_time]);

//   const canModifySeats = useCallback(() => {
//     if (!userBooking) return false;
//     const rideStatus = getRideStatus();
//     const bookingStatus = userBooking.status;
//     return bookingStatus === "accepted" && rideStatus === 'upcoming' && !ride?.cancellation_reason && !seatModificationRequested;
//   }, [userBooking, getRideStatus, ride?.cancellation_reason, seatModificationRequested]);

//   const canCancelBooking = useCallback(() => {
//     if (!userBooking) return false;
//     const rideStatus = getRideStatus();
//     const bookingStatus = userBooking.status;
//     return (bookingStatus === "accepted" || bookingStatus === "pending") && rideStatus === 'upcoming' && !ride?.cancellation_reason;
//   }, [userBooking, getRideStatus, ride?.cancellation_reason]);

//   const getRideStatusMessage = useCallback(() => {
//     const rideStatus = getRideStatus();
//     const bookingStatus = userBooking?.status;
//     if (ride?.cancellation_reason) {
//       return { message: ride.cancellation_reason, type: 'cancelled', icon: 'alert-circle', color: '#DC2626' };
//     }
//     if (bookingStatus === "rejected") {
//       return { message: "Your booking request was rejected by the driver", type: 'rejected', icon: 'close-circle', color: '#DC2626' };
//     }
//     if (bookingStatus === "pending") {
//       if (rideStatus === 'upcoming') {
//         return { message: `Waiting for driver to confirm your booking for ${userBooking?.seats_requested} seat${userBooking?.seats_requested > 1 ? 's' : ''}`, type: 'pending', icon: 'time-outline', color: '#F59E0B' };
//       } else if (rideStatus === 'ongoing' || rideStatus === 'completed') {
//         return { message: "Ride has passed without driver confirmation", type: 'expired', icon: 'alert-circle', color: '#DC2626' };
//       }
//     }
//     if (bookingStatus === "accepted") {
//       if (seatModificationRequested) {
//         return { message: `Modification request pending: Changing from ${userBooking?.seats_requested} to ${pendingSeatsRequest} seat(s). Waiting for driver approval.`, type: 'modification-pending', icon: 'time-outline', color: '#F59E0B' };
//       }
//       if (rideStatus === 'upcoming') {
//         const departureTime = new Date(ride?.departure_time);
//         const now = new Date();
//         const minutesLeft = Math.floor((departureTime - now) / (1000 * 60));
//         return { message: `Booking confirmed! ${userBooking?.seats_requested} seat${userBooking?.seats_requested > 1 ? 's' : ''} booked. Departs in ${minutesLeft} minutes`, type: 'confirmed', icon: 'checkmark-circle', color: '#10B981' };
//       } else if (rideStatus === 'ongoing') {
//         return { message: "Ride is starting soon! Please proceed to pickup point", type: 'ongoing', icon: 'car-sport', color: '#2457A6' };
//       } else if (rideStatus === 'completed') {
//         return { message: "This ride has been completed", type: 'completed', icon: 'checkmark-done-circle', color: '#6B7280' };
//       }
//     }
//     return null;
//   }, [getRideStatus, userBooking, ride, seatModificationRequested, pendingSeatsRequest]);

//   const fetchOtherRiders = useCallback(async () => {
//     if (!ride?.id) return;
//     setLoadingRiders(true);
//     try {
//       let otherPassengers = [];
      
//       try {
//         const response = await fetch(`${API_BASE_URL}/ride/${ride.id}/passengers?_t=${Date.now()}`);
//         const data = await response.json();
        
//         if (data.passengers && Array.isArray(data.passengers)) {
//           const acceptedPassengers = data.passengers.filter(p => p.status === 'accepted');
//           otherPassengers = acceptedPassengers.filter(p => p.passenger_phone !== user?.phone_number);
          
//           if (data.total_booked_seats !== undefined) {
//             setTotalBookedSeats(data.total_booked_seats);
//             const available = Math.max(0, totalSeatsOffered - data.total_booked_seats);
//             setAvailableSeats(available);
//           }
//         }
//       } catch (e) {
//         console.log('First endpoint failed:', e);
//       }
      
//       setOtherRiders(otherPassengers);
//     } catch (error) {
//       console.log('Error fetching other riders:', error);
//       setOtherRiders([]);
//     } finally {
//       setLoadingRiders(false);
//     }
//   }, [ride?.id, user?.phone_number, totalSeatsOffered]);

//   const checkForPendingModificationRequest = useCallback(async () => {
//     if (!userBooking?.id) {
//       console.log('❌ No userBooking ID, skipping modification check');
//       return;
//     }
//     try {
//       console.log(`✅ Checking modification request for booking ${userBooking.id}...`);
//       const response = await fetch(`${API_BASE_URL}/booking/${userBooking.id}/modification-request?_t=${Date.now()}`);
//       const data = await response.json();
//       console.log('📦 Modification check response:', JSON.stringify(data, null, 2));
      
//       if (data.has_pending && data.request) {
//         console.log('✅ Found pending modification request:', data.request);
//         setSeatModificationRequested(true);
//         setPendingSeatsRequest(data.request.requested_seats);
//         setPendingRequestDetails(data.request);
//       } else if (data.request && data.request.status === 'pending') {
//         console.log('✅ Found pending modification request (alternative format):', data.request);
//         setSeatModificationRequested(true);
//         setPendingSeatsRequest(data.request.requested_seats);
//         setPendingRequestDetails(data.request);
//       } else if (data.status === 'pending') {
//         console.log('✅ Found pending modification request (status field):', data);
//         setSeatModificationRequested(true);
//         setPendingSeatsRequest(data.requested_seats);
//         setPendingRequestDetails(data);
//       } else {
//         console.log('❌ No pending modification request found');
//         setSeatModificationRequested(false);
//         setPendingSeatsRequest(null);
//         setPendingRequestDetails(null);
//       }
//     } catch (error) {
//       console.log('❌ Error checking modification request:', error);
//       setSeatModificationRequested(false);
//       setPendingSeatsRequest(null);
//       setPendingRequestDetails(null);
//     }
//   }, [userBooking?.id]);

//   const checkLiveSession = useCallback(async () => {
//     if (!ride?.id) return;
//     setCheckingLiveSession(true);
//     try {
//       const response = await fetch(`${API_BASE_URL}/ride/${ride.id}/live-session`);
//       const data = await response.json();
//       if (data.success && data.session && data.session.status === 'active') {
//         setLiveSession(data.session);
//         if (!socketRef.current) {
//           const socket = io(API_BASE_URL);
//           socketRef.current = socket;
//           socket.on('connect', () => {
//             console.log('Socket connected for live tracking');
//             socket.emit('join-live-session', data.session.session_id);
//           });
//           socket.on('driver-location-update', (location) => {
//             setDriverLocation({ latitude: location.latitude, longitude: location.longitude });
//             if (mapRef.current) {
//               mapRef.current.animateToRegion({
//                 latitude: location.latitude,
//                 longitude: location.longitude,
//                 latitudeDelta: 0.01,
//                 longitudeDelta: 0.01,
//               }, 1000);
//             }
//           });
//           socket.on('modification-request-response', (data) => {
//             console.log('Received modification response:', data);
//             if (data.booking_id === userBooking?.id) {
//               if (data.status === 'approved') {
//                 showCustomAlert('Modification Approved', `Your seat modification has been approved! New seats: ${data.new_seats}`, 'success');
//                 setUserBooking({ ...userBooking, seats_requested: data.new_seats });
//                 setSeatModificationRequested(false);
//                 setPendingSeatsRequest(null);
//                 setPendingRequestDetails(null);
//                 fetchSeatAvailability();
//                 fetchOtherRiders();
//               } else if (data.status === 'rejected') {
//                 showCustomAlert('Modification Rejected', 'The driver has rejected your seat modification request.', 'warning');
//                 setSeatModificationRequested(false);
//                 setPendingSeatsRequest(null);
//                 setPendingRequestDetails(null);
//               }
//             }
//           });
//           socket.on('booking-update', () => {
//             console.log('Booking update received, refreshing data');
//             fetchOtherRiders();
//             fetchSeatAvailability();
//           });
//         }
//       } else {
//         setLiveSession(null);
//       }
//     } catch (error) {
//       console.log('Error checking live session:', error);
//       setLiveSession(null);
//     } finally {
//       setCheckingLiveSession(false);
//     }
//   }, [ride?.id, userBooking?.id, fetchSeatAvailability, fetchOtherRiders]);

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
//       fetchOtherRiders();
//       fetchSeatAvailability();
//       checkLiveSession();
//       checkForPendingModificationRequest();
//       setRefreshKey(prev => prev + 1);
//       return () => {
//         if (socketRef.current) {
//           socketRef.current.disconnect();
//           socketRef.current = null;
//         }
//       };
//     }, [loadDriverData, fetchOtherRiders, fetchSeatAvailability, checkLiveSession, checkForPendingModificationRequest])
//   );

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

//   const routePath = useMemo(() => {
//     const fullRoute = parseRouteCoordinates(ride?.routeCoordinates);
//     if (fullRoute.length >= 2) return fullRoute;
//     if (intersectionPickup && intersectionDrop) return [intersectionPickup, intersectionDrop];
//     return [];
//   }, [ride, intersectionPickup, intersectionDrop]);

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

//   const vehicleName = driverProfile?.vehicle 
//     ? [driverProfile.vehicle.model].filter(Boolean).join(' ')
//     : [ride?.vehicle?.model].filter(Boolean).join(' ') || 'Vehicle details unavailable';
//   const vehicleRegNumber = driverProfile?.vehicle?.registration_number || ride?.vehicle?.registration_number || null;
//   const vehicleColor = driverProfile?.vehicle?.color || ride?.vehicle?.color || 'Not specified';

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

//   const handleModifySeats = async () => {
//     if (!user?.phone_number || !userBooking) {
//       showCustomAlert('Error', 'Booking information not found', 'error');
//       return;
//     }
//     if (!canModifySeats()) {
//       const rideStatus = getRideStatus();
//       if (rideStatus === 'ongoing') {
//         showCustomAlert('Cannot Modify', 'Ride is about to start. Modifications are only allowed until 15 minutes before departure.', 'warning');
//       } else if (rideStatus === 'completed') {
//         showCustomAlert('Cannot Modify', 'This ride has already been completed.', 'warning');
//       } else if (userBooking?.status === "pending") {
//         showCustomAlert('Cannot Modify', 'Please wait for driver to confirm your booking before modifying seats.', 'warning');
//       } else if (seatModificationRequested) {
//         showCustomAlert('Request Pending', 'You already have a pending seat modification request. Please wait for driver approval.', 'warning');
//       } else {
//         showCustomAlert('Cannot Modify', 'Modifications are not available for this ride at this time.', 'warning');
//       }
//       return;
//     }
//     const currentSeatsBooked = userBooking.seats_requested || 0;
    
//     // Calculate seats already booked by other passengers
//     const otherBookedSeats = totalBookedSeats - currentSeatsBooked;
    
//     // Maximum seats this user can request = total seats - seats booked by others
//     const maxSeatsUserCanRequest = totalSeatsOffered - otherBookedSeats;
    
//     if (seatsRequested > maxSeatsUserCanRequest) {
//       showCustomAlert('Not Enough Seats', `Only ${maxSeatsUserCanRequest} seat(s) available. Other passengers have already booked ${otherBookedSeats} seat(s).`, 'warning');
//       return;
//     }
    
//     if (seatsRequested < 1) {
//       showCustomAlert('Invalid Seats', 'You must book at least 1 seat.', 'warning');
//       return;
//     }
    
//     if (seatsRequested === currentSeatsBooked) {
//       showCustomAlert('No Change', 'Seat count is already set to this value.', 'info');
//       return;
//     }
    
//     setModifyingSeats(true);
//     try {
//       const response = await fetch(`${API_BASE_URL}/booking/${userBooking.id}/request-modification`, {
//         method: 'POST',
//         headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
//         body: JSON.stringify({ requested_seats: seatsRequested }),
//       });
//       const data = await response.json();
      
//       if (!response.ok) throw new Error(data.detail || data.message || 'Failed to send modification request');
      
//       showCustomAlert('Request Sent', `Your request to change from ${currentSeatsBooked} to ${seatsRequested} seat(s) has been sent to the driver. You will be notified once they respond.`, 'info');
      
//       setSeatModificationRequested(true);
//       setPendingSeatsRequest(seatsRequested);
//       setPendingRequestDetails({ requested_seats: seatsRequested, current_seats: currentSeatsBooked });
      
//     } catch (error) {
//       console.error('Modification request error:', error);
//       showCustomAlert('Error', error.message || 'Failed to send modification request', 'error');
//     } finally {
//       setModifyingSeats(false);
//     }
//   };

//   const handleCancelModificationRequest = async () => {
//     if (!userBooking?.id) return;
//     setModifyingSeats(true);
//     try {
//       const response = await fetch(`${API_BASE_URL}/booking/${userBooking.id}/cancel-modification-request`, {
//         method: 'DELETE',
//         headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
//       });
//       const data = await response.json();
      
//       if (!response.ok) throw new Error(data.detail || data.message || 'Failed to cancel modification request');
      
//       showCustomAlert('Request Cancelled', 'Your seat modification request has been cancelled.', 'success');
//       setSeatModificationRequested(false);
//       setPendingSeatsRequest(null);
//       setPendingRequestDetails(null);
//     } catch (error) {
//       console.error('Cancel modification error:', error);
//       showCustomAlert('Error', error.message || 'Failed to cancel modification request', 'error');
//     } finally {
//       setModifyingSeats(false);
//     }
//   };

//   const handleCancelBooking = async () => {
//     if (!user?.phone_number || !userBooking) return;
//     if (!canCancelBooking()) {
//       const rideStatus = getRideStatus();
//       if (rideStatus === 'ongoing') {
//         showCustomAlert('Cannot Cancel', 'Ride is about to start. Cancellation is only allowed until 15 minutes before departure.', 'warning');
//       } else if (rideStatus === 'completed') {
//         showCustomAlert('Cannot Cancel', 'This ride has already been completed.', 'warning');
//       } else {
//         showCustomAlert('Cannot Cancel', 'Cancellation is not available for this ride at this time.', 'warning');
//       }
//       setShowCancelModal(false);
//       return;
//     }
//     setModifyingSeats(true);
//     try {
//       const response = await fetch(`${API_BASE_URL}/booking/${userBooking.id}/cancel`, {
//         method: 'PUT',
//         headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
//       });
//       const data = await response.json();
//       if (!response.ok) throw new Error(data.detail || data.message || 'Failed to cancel booking');
//       showCustomAlert('Success', data.message || 'Booking cancelled successfully', 'success');
//       setUserBooking(null);
//       setTimeout(() => navigation.goBack(), 1500);
//     } catch (error) {
//       console.error('Cancel booking error:', error);
//       showCustomAlert('Error', error.message || 'Failed to cancel booking', 'error');
//     } finally {
//       setModifyingSeats(false);
//       setShowCancelModal(false);
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
//         headers: { 'X-Phone-Number': myPhone, 'Content-Type': 'application/json' },
//         body: JSON.stringify({ participant_phone: receiverPhone, ride_id: rideId }),
//       });
//       const data = await response.json();
//       if (data.success) return data.conversation.id;
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
//           user: { name: driverProfile?.full_name || ride?.driverName || 'Driver', tripInfo: `${ride.from || 'Pickup'} → ${ride.to || 'Drop'}` },
//         });
//       } else {
//         showCustomAlert('Chat', 'Unable to start chat. Please try again.', 'error');
//       }
//     } else {
//       showCustomAlert('Chat', 'Driver contact not available', 'warning');
//     }
//   };

//   const trackLiveRide = () => {
//     if (liveSession) {
//       navigation.navigate('OngoingRideRiderScreen', { bookingId: userBooking?.id, sessionId: liveSession.session_id });
//     }
//   };

//   const formatDate = (dateString) => {
//     if (!dateString) return 'Date not set';
//     const date = new Date(dateString);
//     const today = new Date();
//     const tomorrow = new Date(today);
//     tomorrow.setDate(tomorrow.getDate() + 1);
//     const isToday = date.toDateString() === today.toDateString();
//     const isTomorrow = date.toDateString() === tomorrow.toDateString();
//     let dayText = "";
//     if (isToday) dayText = "Today";
//     else if (isTomorrow) dayText = "Tomorrow";
//     else dayText = date.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" });
//     const timeText = date.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit", hour12: true });
//     return `${dayText}, ${timeText}`;
//   };

//   // Calculate max available seats - total seats offered
//   const maxAvailableSeats = totalSeatsOffered;
  
//   // Calculate other booked seats
//   const currentUserSeats = userBooking?.seats_requested || 0;
//   const otherBookedSeats = totalBookedSeats - currentUserSeats;
//   const maxUserCanRequest = totalSeatsOffered - otherBookedSeats;

//   const rideStatusMessage = getRideStatusMessage();

//   console.log('🔍 Seat Info:', {
//     totalSeatsOffered,
//     totalBookedSeats,
//     currentUserSeats,
//     otherBookedSeats,
//     maxUserCanRequest,
//     seatsRequested
//   });

//   if (loadingProfile) {
//     return (
//       <View style={styles.loaderContainer}>
//         <LottieView source={require("../assets/loading.json")} autoPlay loop style={{ width: 300, height: 300 }} />
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

//           {driverLocation && (
//             <Marker coordinate={driverLocation} anchor={{ x: 0.5, y: 0.5 }}>
//               <View style={styles.driverLiveMarker}>
//                 <View style={styles.driverLiveDot} />
//                 <Ionicons name="car-sport" size={24} color="#2457A6" />
//                 <View style={styles.driverLivePulse} />
//               </View>
//             </Marker>
//           )}
//         </MapView>

//         <TouchableOpacity style={styles.mapBackButton} onPress={() => navigation.goBack()}>
//           <Ionicons name="chevron-back" size={26} color={Colors.secondary} />
//         </TouchableOpacity>

//         {liveSession && !driverLocation && (
//           <TouchableOpacity style={styles.liveTrackingButton} onPress={trackLiveRide}>
//             <View style={styles.liveDot} />
//             <Text style={styles.liveTrackingButtonText}>Driver Started Ride - Track Now</Text>
//           </TouchableOpacity>
//         )}

//         {driverLocation && (
//           <TouchableOpacity style={[styles.liveTrackingButton, styles.liveTrackingActiveButton]} onPress={trackLiveRide}>
//             <View style={styles.liveDot} />
//             <Text style={styles.liveTrackingButtonText}>Live: Track Driver Location</Text>
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
//                 <Text style={styles.collapsedDriver} numberOfLines={1}>{driverProfile?.full_name || ride?.driverName || 'Driver'}</Text>
//                 <Text style={styles.collapsedSub} numberOfLines={1}>{ride.from || 'Pickup'} → {ride.to || 'Drop'}</Text>
//               </View>
//               <View style={styles.collapsedPriceWrap}>
//                 <Text style={styles.collapsedPrice}>₹{ride.price}</Text>
//                 <Text style={styles.collapsedPerSeat}>per seat</Text>
//               </View>
//             </View>
//           </View>
//         ) : (
//           <ScrollView style={styles.drawerScroll} contentContainerStyle={styles.drawerContent} showsVerticalScrollIndicator={false}>
//             {rideStatusMessage && (
//               <View style={[styles.statusBanner, { backgroundColor: rideStatusMessage.color + '20' }]}>
//                 <Ionicons name={rideStatusMessage.icon} size={20} color={rideStatusMessage.color} />
//                 <Text style={[styles.statusBannerText, { color: rideStatusMessage.color, flex: 1 }]}>{rideStatusMessage.message}</Text>
//               </View>
//             )}

//             {(userBooking?.status === "accepted" || (userBooking?.status === "pending" && getRideStatus() === 'upcoming')) && (
//               <View style={styles.driverCard}>
//                 <View style={styles.driverTopRow}>
//                   <View style={styles.driverLeftWrap}>
//                     <TouchableOpacity style={styles.driverAvatar} onPress={handleProfileImagePress} activeOpacity={0.8}>
//                       {profilePhotoUrl ? (
//                         isProfilePhotoSvg ? (
//                           <View style={styles.svgAvatarContainer}><SvgCssUri uri={profilePhotoUrl} width={56} height={56} /></View>
//                         ) : (
//                           <Image key={`avatar-${refreshKey}`} source={{ uri: profilePhotoUrl }} style={styles.avatarImg} />
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
//             )}

//             <View style={styles.cardSection}>
//               <Text style={styles.sectionTitle}>Trip Details</Text>
//               <View style={styles.tripTimelineWrap}>
//                 <View style={styles.timelineRail}>
//                   <View style={[styles.timelineDot, { backgroundColor: '#2457A6' }]} />
//                   <View style={styles.timelineLine} />
//                   <View style={[styles.timelineDot, { backgroundColor: '#FF7A00' }]} />
//                 </View>
//                 <View style={styles.timelineContent}>
//                   <View style={styles.timelineItem}>
//                     <Text style={styles.timelineLabel}>Pickup</Text>
//                     <Text style={styles.timelinePlace}>{ride.pickupLabel || ride.from || 'Pickup point'}</Text>
//                     <View style={styles.timelineMetaRow}>
//                       <Ionicons name="time-outline" size={13} color={Colors.gray} />
//                       <Text style={styles.timelineMetaText}>{formatDate(ride.departure_time)}</Text>
//                     </View>
//                   </View>
//                   <View style={styles.timelineItem}>
//                     <Text style={styles.timelineLabel}>Dropoff</Text>
//                     <Text style={styles.timelinePlace}>{ride.dropLabel || ride.to || 'Drop point'}</Text>
//                     <Text style={styles.timelineMetaText}>Estimated: {ride.duration_text || '--'}</Text>
//                   </View>
//                 </View>
//               </View>
//             </View>

//             <View style={styles.cardSection}>
//               <Text style={styles.sectionTitle}>Vehicle Details</Text>
//               <View style={styles.vehicleHeaderRow}>
//                 <View style={styles.vehicleIconCircle}><Ionicons name="car-sport-outline" size={18} color="#2457A6" /></View>
//                 <View style={styles.vehicleMeta}>
//                   <Text style={styles.vehicleTitle}>{vehicleName}</Text>
//                   <Text style={styles.vehicleSub}>{vehicleColor} • {totalSeatsOffered} seats total</Text>
//                   {vehicleRegNumber && (
//                     <View style={styles.vehicleRegContainer}>
//                       <Text style={styles.vehicleRegText}>Vehicle Number: {vehicleRegNumber}</Text>
//                     </View>
//                   )}
//                 </View>
//               </View>
//             </View>

//             {/* Seat Availability Section */}
//             <View style={styles.cardSection}>
//               <Text style={styles.sectionTitle}>Seat Availability</Text>
//               <View style={styles.seatAvailabilityContainer}>
//                 <View style={styles.seatAvailabilityItem}>
//                   <View style={[styles.seatIconSmall, { backgroundColor: '#EAF1FF' }]}>
//                     <Ionicons name="car-sport-outline" size={20} color="#2457A6" />
//                   </View>
//                   <View>
//                     <Text style={styles.seatAvailabilityLabel}>Total Seats</Text>
//                     <Text style={styles.seatAvailabilityValue}>{totalSeatsOffered}</Text>
//                   </View>
//                 </View>
//                 <View style={styles.seatAvailabilityItem}>
//                   <View style={[styles.seatIconSmall, { backgroundColor: '#E8F5E9' }]}>
//                     <Ionicons name="people" size={20} color="#10B981" />
//                   </View>
//                   <View>
//                     <Text style={styles.seatAvailabilityLabel}>Booked</Text>
//                     <Text style={[styles.seatAvailabilityValue, { color: '#10B981' }]}>{totalBookedSeats}</Text>
//                   </View>
//                 </View>
//                 <View style={styles.seatAvailabilityItem}>
//                   <View style={[styles.seatIconSmall, { backgroundColor: '#FFF3E0' }]}>
//                     <Ionicons name="person-add" size={20} color="#F59E0B" />
//                   </View>
//                   <View>
//                     <Text style={styles.seatAvailabilityLabel}>Available</Text>
//                     <Text style={[styles.seatAvailabilityValue, { color: '#F59E0B' }]}>{availableSeats}</Text>
//                   </View>
//                 </View>
//               </View>
//               <View style={styles.seatProgressContainer}>
//                 <View style={[styles.seatProgressBar, { width: `${(totalBookedSeats / totalSeatsOffered) * 100}%` }]} />
//               </View>
//               <Text style={styles.seatProgressText}>{totalBookedSeats} of {totalSeatsOffered} seats booked</Text>
//             </View>

//             <View style={styles.cardSection}>
//               <Text style={styles.sectionTitle}>Ride Preferences</Text>
//               <View style={styles.tagRow}>
//                 {allPreferences.length > 0 ? (
//                   allPreferences.map((pref, index) => <GenericPreferenceTag key={`${pref}-${index}`} label={pref} />)
//                 ) : (
//                   <Text style={styles.emptyText}>No specific preferences added for this ride</Text>
//                 )}
//               </View>
//             </View>

//             <View style={styles.cardSection}>
//               <Text style={styles.sectionTitle}>Your Booking</Text>
              
//               {seatModificationRequested && pendingRequestDetails && (
//                 <View style={styles.pendingModificationCard}>
//                   <View style={styles.pendingModificationHeader}>
//                     <Ionicons name="time-outline" size={24} color="#F59E0B" />
//                     <Text style={styles.pendingModificationTitle}>Modification Request Pending</Text>
//                   </View>
//                   <View style={styles.pendingModificationDetails}>
//                     <Text style={styles.pendingModificationText}>
//                       Requested to change from <Text style={styles.oldSeatCount}>{pendingRequestDetails.current_seats || userBooking?.seats_requested}</Text> 
//                       {' → '}
//                       <Text style={styles.newSeatCount}>{pendingRequestDetails.requested_seats || pendingSeatsRequest}</Text> seat(s)
//                     </Text>
//                     <Text style={styles.pendingModificationSubtext}>
//                       Your request has been sent to the driver. You will be notified once they respond.
//                     </Text>
//                   </View>
//                   <TouchableOpacity 
//                     style={styles.cancelRequestButton} 
//                     onPress={handleCancelModificationRequest}
//                     disabled={modifyingSeats}>
//                     <Text style={styles.cancelRequestButtonText}>
//                       {modifyingSeats ? 'Cancelling...' : 'Cancel Request'}
//                     </Text>
//                   </TouchableOpacity>
//                 </View>
//               )}

//               {userBooking && !seatModificationRequested && (
//                 <View style={[styles.bookingInfoContainer, userBooking.status === "pending" && styles.pendingBookingContainer, userBooking.status === "rejected" && styles.rejectedBookingContainer]}>
//                   {userBooking.status === "pending" ? (
//                     <>
//                       <Ionicons name="time-outline" size={24} color="#F59E0B" />
//                       <Text style={styles.pendingBookingText}>Booking request sent for {userBooking.seats_requested} seat{userBooking.seats_requested > 1 ? 's' : ''}</Text>
//                       <Text style={styles.pendingBookingSubtext}>Waiting for driver to confirm your request</Text>
//                     </>
//                   ) : userBooking.status === "accepted" ? (
//                     <>
//                       <Ionicons name="checkmark-circle" size={24} color="#10B981" />
//                       <Text style={styles.bookingInfoText}>✓ Booking confirmed! You have booked {userBooking.seats_requested} seat{userBooking.seats_requested > 1 ? 's' : ''}</Text>
//                       <Text style={styles.bookingInfoSubtext}>Total amount: ₹{(ride?.price || 0) * userBooking.seats_requested}</Text>
//                     </>
//                   ) : userBooking.status === "rejected" ? (
//                     <>
//                       <Ionicons name="close-circle" size={24} color="#DC2626" />
//                       <Text style={styles.rejectedBookingText}>Booking request was rejected</Text>
//                       <Text style={styles.rejectedBookingSubtext}>The driver could not accept your request</Text>
//                     </>
//                   ) : null}
//                 </View>
//               )}

//               {canModifySeats() && !seatModificationRequested && (
//                 <>
//                   <Text style={styles.sectionSubtitle}>Modify Seats</Text>
                  
//                   {/* Show info about other booked seats */}
//                   {otherBookedSeats > 0 && (
//                     <View style={styles.otherBookedInfo}>
//                       <Ionicons name="information-circle" size={14} color="#F59E0B" />
//                       <Text style={styles.otherBookedInfoText}>
//                         {otherBookedSeats} seat{otherBookedSeats > 1 ? 's are' : ' is'} already booked by other passengers.
//                       </Text>
//                     </View>
//                   )}
                  
//                   <View style={styles.seatSelectorRow}>
//                     <TouchableOpacity 
//                       style={[styles.seatActionBtn, seatsRequested === 1 && styles.seatActionBtnDisabled]} 
//                       onPress={() => setSeatsRequested(Math.max(1, seatsRequested - 1))} 
//                       disabled={seatsRequested === 1 || modifyingSeats}>
//                       <Ionicons name="remove" size={20} color={seatsRequested === 1 ? Colors.gray : Colors.dark} />
//                     </TouchableOpacity>
//                     <View style={styles.seatCountWrap}>
//                       <Text style={styles.seatCountText}>{seatsRequested}</Text>
//                       <Text style={styles.seatAvailableText}>/ {maxUserCanRequest} max seats</Text>
//                     </View>
//                     <TouchableOpacity 
//                       style={[styles.seatActionBtn, seatsRequested >= maxUserCanRequest && styles.seatActionBtnDisabled]} 
//                       onPress={() => setSeatsRequested(Math.min(maxUserCanRequest, seatsRequested + 1))} 
//                       disabled={seatsRequested >= maxUserCanRequest || modifyingSeats}>
//                       <Ionicons name="add" size={20} color={seatsRequested >= maxUserCanRequest ? Colors.gray : "#2457A6"} />
//                     </TouchableOpacity>
//                   </View>
                  
//                   <TouchableOpacity 
//                     style={[styles.updateSeatsBtn, (modifyingSeats || seatsRequested === userBooking?.seats_requested) && styles.updateSeatsBtnDisabled]} 
//                     onPress={handleModifySeats} 
//                     disabled={modifyingSeats || seatsRequested === userBooking?.seats_requested}>
//                     <Text style={styles.updateSeatsBtnText}>{modifyingSeats ? 'Sending Request...' : 'Request Seat Change'}</Text>
//                   </TouchableOpacity>
                  
//                   {seatsRequested !== userBooking?.seats_requested && (
//                     <View style={styles.priceDifferenceContainer}>
//                       <Text style={styles.priceDifferenceText}>
//                         {seatsRequested > (userBooking?.seats_requested || 0) 
//                           ? `+ ₹${(ride?.price || 0) * (seatsRequested - (userBooking?.seats_requested || 0))} will be charged if approved`
//                           : `- ₹${(ride?.price || 0) * ((userBooking?.seats_requested || 0) - seatsRequested)} will be refunded if approved`}
//                       </Text>
//                       <Text style={styles.approvalNoteText}>* Changes require driver approval</Text>
//                     </View>
//                   )}
//                 </>
//               )}

//               {canCancelBooking() && !seatModificationRequested && (
//                 <TouchableOpacity style={styles.cancelBookingBtn} onPress={() => setShowCancelModal(true)} disabled={modifyingSeats}>
//                   <Text style={styles.cancelBookingBtnText}>{userBooking?.status === "pending" ? "Cancel Booking Request" : "Cancel Booking"}</Text>
//                 </TouchableOpacity>
//               )}

//               {userBooking?.status === "pending" && getRideStatus() === 'upcoming' && !canCancelBooking() && (
//                 <View style={styles.pendingRequestBox}>
//                   <Ionicons name="time-outline" size={20} color="#F59E0B" />
//                   <View style={styles.pendingRequestContent}>
//                     <Text style={styles.pendingRequestTitle}>Awaiting Confirmation</Text>
//                     <Text style={styles.pendingRequestText}>Your booking request for {userBooking.seats_requested} seat{userBooking.seats_requested > 1 ? 's' : ''} has been sent to the driver</Text>
//                   </View>
//                 </View>
//               )}

//               {ride?.cancellation_reason && (
//                 <View style={styles.cancelledBox}>
//                   <Ionicons name="alert-circle" size={20} color="#DC2626" />
//                   <Text style={styles.cancelledText}>{ride.cancellation_reason}</Text>
//                 </View>
//               )}
//             </View>

//             <View style={styles.cardSection}>
//               <Text style={styles.sectionTitle}>Other Riders {loadingRiders ? '...' : `(${otherRiders.length})`}</Text>
//               {loadingRiders ? (
//                 <View style={styles.loadingContainer}>
//                   <ActivityIndicator size="small" color={Colors.primary} />
//                   <Text style={styles.loadingText}>Loading riders...</Text>
//                 </View>
//               ) : otherRiders.length === 0 ? (
//                 <View style={styles.noRidersContainer}>
//                   <Ionicons name="people-outline" size={40} color={Colors.gray} />
//                   <Text style={styles.noRidersText}>No other riders yet</Text>
//                   <Text style={styles.noRidersSubtext}>When other passengers join this ride, they'll appear here</Text>
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
//                       <View style={styles.otherRiderDetails}>
//                         <View style={styles.otherRiderSeatBadge}>
//                           <Ionicons name="person" size={10} color="#2457A6" />
//                           <Text style={styles.otherRiderSeats}>{rider.seats_booked || 1} seat{(rider.seats_booked || 1) > 1 ? 's' : ''}</Text>
//                         </View>
//                         <View style={styles.otherRiderStatusBadge}>
//                           <View style={[styles.statusDotSmall, { backgroundColor: '#10B981' }]} />
//                           <Text style={styles.otherRiderStatus}>Confirmed</Text>
//                         </View>
//                       </View>
//                     </View>
//                   </View>
//                 ))
//               )}
//             </View>

//             <View style={styles.safetyCard}>
//               <View style={styles.simpleInfoLeft}>
//                 <Ionicons name="shield-checkmark-outline" size={18} color="#2457A6" />
//                 <View>
//                   <Text style={styles.safetyTitle}>Safety First</Text>
//                   <Text style={styles.safetySub}>Live GPS tracking & 24/7 support</Text>
//                 </View>
//               </View>
//             </View>

//             <View style={{ height: 110 }} />
//           </ScrollView>
//         )}
//       </Animated.View>

//       <Modal visible={showCancelModal} transparent={true} animationType="fade" onRequestClose={() => setShowCancelModal(false)}>
//         <View style={styles.modalBackdrop}>
//           <View style={styles.confirmModalContainer}>
//             <View style={styles.confirmModalContent}>
//               <View style={styles.confirmModalHeader}>
//                 <Ionicons name="alert-circle" size={40} color="#F59E0B" />
//                 <Text style={styles.confirmModalTitle}>{userBooking?.status === "pending" ? "Cancel Booking Request?" : "Cancel Booking?"}</Text>
//               </View>
//               <Text style={styles.confirmModalMessage}>
//                 {userBooking?.status === "pending" 
//                   ? "Are you sure you want to cancel your booking request? The driver will be notified."
//                   : "Are you sure you want to cancel your booking for this ride? This action cannot be undone."}
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
//   mapContainer: { width: '100%', overflow: 'hidden', backgroundColor: '#E8EEF7' },
//   map: { flex: 1, backgroundColor: '#E8EEF7' },
//   mapBackButton: { position: 'absolute', top: Platform.OS === 'ios' ? 54 : 22, left: 14, width: 42, height: 42, borderRadius: 25, backgroundColor: 'rgba(255,255,255,0.96)', alignItems: 'center', justifyContent: 'center' },
//   liveTrackingButton: { position: 'absolute', bottom: 20, left: 20, right: 20, backgroundColor: '#10B981', flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 14, borderRadius: 12, gap: 8, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.25, shadowRadius: 4, elevation: 5 },
//   liveTrackingActiveButton: { backgroundColor: '#DC2626' },
//   liveTrackingButtonText: { color: '#fff', fontWeight: '700', fontSize: 14 },
//   liveDot: { width: 10, height: 10, borderRadius: 5, backgroundColor: '#fff', marginRight: 6 },
//   markerWrapper: { alignItems: 'center' },
//   pinBubble: { width: 28, height: 28, borderRadius: 14, borderWidth: 3, borderColor: 'white', alignItems: 'center', justifyContent: 'center', shadowColor: '#000', shadowOffset: { width: 0, height: 3 }, shadowOpacity: 0.25, shadowRadius: 4, elevation: 5 },
//   pinPointer: { width: 0, height: 0, backgroundColor: 'transparent', borderStyle: 'solid', borderLeftWidth: 7, borderRightWidth: 7, borderTopWidth: 10, borderLeftColor: 'transparent', borderRightColor: 'transparent', marginTop: -2 },
//   pinIcon: { fontSize: 14, fontWeight: '800', color: 'white', textAlign: 'center', lineHeight: 18 },
//   pinLabelBubbleYellow: { backgroundColor: 'rgba(113, 63, 18, 0.9)', borderRadius: 8, paddingHorizontal: 8, paddingVertical: 3, marginTop: 4 },
//   pinLabelTextYellow: { color: '#FACC15', fontSize: 10, fontWeight: '700' },
//   driverLiveMarker: { alignItems: 'center', justifyContent: 'center' },
//   driverLiveDot: { position: 'absolute', width: 40, height: 40, borderRadius: 20, backgroundColor: 'rgba(36, 87, 166, 0.2)' },
//   driverLivePulse: { position: 'absolute', width: 60, height: 60, borderRadius: 30, backgroundColor: 'rgba(36, 87, 166, 0.1)' },
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
//   statusBannerText: { fontSize: 13, fontWeight: '700', flex: 1 },
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
//   sectionSubtitle: { fontSize: 14, fontWeight: '600', color: Colors.dark, marginBottom: 12, marginTop: 8 },
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
//   seatAvailabilityContainer: { flexDirection: 'row', justifyContent: 'space-around', marginBottom: 16 },
//   seatAvailabilityItem: { alignItems: 'center', gap: 8 },
//   seatIconSmall: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center' },
//   seatAvailabilityLabel: { fontSize: 12, color: Colors.gray, textAlign: 'center' },
//   seatAvailabilityValue: { fontSize: 18, fontWeight: '800', color: Colors.dark, textAlign: 'center' },
//   seatProgressContainer: { height: 6, backgroundColor: '#E5E7EB', borderRadius: 3, overflow: 'hidden', marginBottom: 8 },
//   seatProgressBar: { height: '100%', backgroundColor: '#10B981', borderRadius: 3 },
//   seatProgressText: { fontSize: 12, color: Colors.gray, textAlign: 'center' },
//   tagRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 14 },
//   preferenceTag: { paddingHorizontal: 12, paddingVertical: 8, borderRadius: 999, backgroundColor: '#FFF3E8' },
//   preferenceTagText: { fontSize: 12, color: '#C65D00', fontWeight: '700' },
//   emptyText: { fontSize: 13, color: Colors.gray, fontWeight: '600' },
//   bookingInfoContainer: { borderRadius: 12, padding: 16, marginBottom: 16, alignItems: 'center', gap: 8 },
//   pendingBookingContainer: { backgroundColor: '#FFFBEB', borderWidth: 1, borderColor: '#FDE68A' },
//   rejectedBookingContainer: { backgroundColor: '#FEF2F2', borderWidth: 1, borderColor: '#FEE2E2' },
//   bookingInfoText: { fontSize: 14, fontWeight: '600', color: '#166534', textAlign: 'center' },
//   bookingInfoSubtext: { fontSize: 12, color: Colors.gray, textAlign: 'center', marginTop: 4 },
//   pendingBookingText: { fontSize: 14, fontWeight: '600', color: '#92400E', textAlign: 'center' },
//   pendingBookingSubtext: { fontSize: 12, color: '#B45309', textAlign: 'center', marginTop: 4 },
//   rejectedBookingText: { fontSize: 14, fontWeight: '600', color: '#DC2626', textAlign: 'center' },
//   rejectedBookingSubtext: { fontSize: 12, color: '#DC2626', textAlign: 'center', marginTop: 4 },
//   otherBookedInfo: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     backgroundColor: '#FFFBEB',
//     padding: 10,
//     borderRadius: 8,
//     marginBottom: 12,
//     gap: 8,
//   },
//   otherBookedInfoText: {
//     flex: 1,
//     fontSize: 11,
//     color: '#B45309',
//   },
//   seatSelectorRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: '#FAFAFB', borderRadius: 18, padding: 14, marginBottom: 12 },
//   seatActionBtn: { width: 38, height: 38, borderRadius: 12, borderWidth: 1, borderColor: '#D6DDE7', alignItems: 'center', justifyContent: 'center', backgroundColor: 'white' },
//   seatActionBtnDisabled: { opacity: 0.5, backgroundColor: '#F5F5F5' },
//   seatCountWrap: { flexDirection: 'row', alignItems: 'baseline' },
//   seatCountText: { fontSize: 28, fontWeight: '900', color: Colors.dark },
//   seatAvailableText: { fontSize: 13, color: Colors.gray, marginLeft: 6, fontWeight: '600' },
//   updateSeatsBtn: { backgroundColor: Colors.primary, paddingVertical: 12, borderRadius: 12, alignItems: 'center', marginTop: 8 },
//   updateSeatsBtnDisabled: { opacity: 0.6 },
//   updateSeatsBtnText: { color: '#fff', fontWeight: '700', fontSize: 14 },
//   priceDifferenceContainer: { marginTop: 12, padding: 10, backgroundColor: '#EFF6FF', borderRadius: 8, alignItems: 'center' },
//   priceDifferenceText: { fontSize: 12, color: '#2457A6', fontWeight: '600' },
//   approvalNoteText: { fontSize: 10, color: '#6B7280', marginTop: 4 },
//   pendingModificationCard: { backgroundColor: '#FFFBEB', borderRadius: 16, padding: 16, marginBottom: 16, borderWidth: 1, borderColor: '#FDE68A' },
//   pendingModificationHeader: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 12 },
//   pendingModificationTitle: { fontSize: 16, fontWeight: '700', color: '#92400E' },
//   pendingModificationDetails: { marginBottom: 16 },
//   pendingModificationText: { fontSize: 14, color: '#B45309', marginBottom: 8, textAlign: 'center' },
//   pendingModificationSubtext: { fontSize: 12, color: '#B45309', textAlign: 'center' },
//   oldSeatCount: { textDecorationLine: 'line-through', fontWeight: '700', color: '#DC2626' },
//   newSeatCount: { fontWeight: '700', color: '#10B981' },
//   cancelRequestButton: { backgroundColor: '#FEF2F2', paddingVertical: 10, borderRadius: 8, borderWidth: 1, borderColor: '#EF4444', alignItems: 'center' },
//   cancelRequestButtonText: { color: '#EF4444', fontWeight: '600', fontSize: 14 },
//   cancelBookingBtn: { marginTop: 12, backgroundColor: '#FEF2F2', paddingVertical: 12, borderRadius: 12, alignItems: 'center', borderWidth: 1, borderColor: '#EF4444' },
//   cancelBookingBtnText: { color: '#EF4444', fontWeight: '700', fontSize: 14 },
//   pendingRequestBox: { flexDirection: 'row', alignItems: 'flex-start', backgroundColor: '#FFFBEB', borderWidth: 1, borderColor: '#FDE68A', borderRadius: 12, padding: 12, gap: 12, marginTop: 12 },
//   pendingRequestContent: { flex: 1 },
//   pendingRequestTitle: { fontSize: 14, fontWeight: '700', color: '#92400E', marginBottom: 4 },
//   pendingRequestText: { fontSize: 12, color: '#B45309', lineHeight: 16 },
//   cancelledBox: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#FEF2F2', borderRadius: 12, padding: 12, gap: 8, borderWidth: 1, borderColor: '#FEE2E2' },
//   cancelledText: { fontSize: 12, color: '#DC2626', flex: 1 },
//   loadingContainer: { alignItems: 'center', padding: 20, gap: 10 },
//   loadingText: { fontSize: 12, color: Colors.gray },
//   noRidersContainer: { alignItems: 'center', padding: 30, gap: 10 },
//   noRidersText: { fontSize: 14, fontWeight: '600', color: Colors.gray },
//   noRidersSubtext: { fontSize: 12, color: Colors.gray, textAlign: 'center' },
//   otherRiderItem: { flexDirection: 'row', alignItems: 'center', paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: '#EEF2F7' },
//   otherRiderAvatar: { width: 44, height: 44, borderRadius: 22, backgroundColor: '#E5E7EB', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', marginRight: 12 },
//   otherRiderAvatarImg: { width: 44, height: 44, borderRadius: 22 },
//   otherRiderAvatarPlaceholder: { width: 44, height: 44, borderRadius: 22, backgroundColor: '#E5E7EB', alignItems: 'center', justifyContent: 'center' },
//   otherRiderAvatarText: { fontSize: 16, fontWeight: '700', color: Colors.primary },
//   otherRiderInfo: { flex: 1 },
//   otherRiderName: { fontSize: 15, fontWeight: '600', color: Colors.dark, marginBottom: 4 },
//   otherRiderDetails: { flexDirection: 'row', alignItems: 'center', gap: 10 },
//   otherRiderSeatBadge: { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: '#EAF1FF', paddingHorizontal: 8, paddingVertical: 3, borderRadius: 12 },
//   otherRiderSeats: { fontSize: 11, color: '#2457A6', fontWeight: '600' },
//   otherRiderStatusBadge: { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: '#F3F4F6', paddingHorizontal: 8, paddingVertical: 3, borderRadius: 12 },
//   otherRiderStatus: { fontSize: 10, color: Colors.gray, fontWeight: '500' },
//   statusDotSmall: { width: 6, height: 6, borderRadius: 3 },
//   simpleInfoLeft: { flexDirection: 'row', alignItems: 'center', gap: 8 },
//   safetyCard: { backgroundColor: '#FFF3E7', borderRadius: 18, padding: 16, marginBottom: 14 },
//   safetyTitle: { fontSize: 14, color: '#2457A6', fontWeight: '800' },
//   safetySub: { marginTop: 2, fontSize: 12, color: '#2457A6', opacity: 0.9, fontWeight: '600' },
//   loaderContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#fff' },
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
//   Modal,
//   ActivityIndicator,
//   LogBox
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

// LogBox.ignoreLogs([
//   'Accessibility: View',
//   'Property accessibilityState',
//   'RCTView',
// ]);

// const { height, width } = Dimensions.get('window');
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
//     if (item && typeof item === 'object' && item.latitude && item.longitude) {
//       return { longitude: Number(item.longitude), latitude: Number(item.latitude) };
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
//     params.append('_t', Date.now());
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

// export default function ViewRouteRequestScreen({ navigation, route }) {
//   const { user } = useAuth();
//   const { ride, booking } = route.params || {};

//   console.log('🔍 ViewRouteRequestScreen received:', { hasRide: !!ride, rideId: ride?.id, hasBooking: !!booking, bookingId: booking?.id, bookingStatus: booking?.status });

//   const [drawerExpanded, setDrawerExpanded] = useState(true);
//   const [driverProfile, setDriverProfile] = useState(null);
//   const [isVerified, setIsVerified] = useState(false);
//   const [loadingProfile, setLoadingProfile] = useState(false);
//   const [mapReady, setMapReady] = useState(false);
  
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
//     if (ride?.booking && ride.booking.id) {
//       return {
//         id: ride.booking.id,
//         seats_requested: ride.booking.seats_requested || ride.booking.seats_booked || 1,
//         status: ride.booking.status || 'pending',
//         total_amount: ride.booking.total_amount,
//       };
//     }
//     if (ride?.seatsRequested) {
//       return {
//         id: ride.id,
//         seats_requested: ride.seatsRequested,
//         status: 'accepted',
//       };
//     }
//     console.log('⚠️ No booking found in params');
//     return null;
//   });
  
//   const [showCancelModal, setShowCancelModal] = useState(false);
//   const [seatsRequested, setSeatsRequested] = useState(() => {
//     if (booking?.seats_requested) return booking.seats_requested;
//     if (booking?.seats_booked) return booking.seats_booked;
//     if (ride?.seatsRequested) return ride.seatsRequested;
//     return 1;
//   });
  
//   const [modifyingSeats, setModifyingSeats] = useState(false);
//   const [refreshKey, setRefreshKey] = useState(0);
//   const [otherRiders, setOtherRiders] = useState([]);
//   const [loadingRiders, setLoadingRiders] = useState(false);
//   const [liveSession, setLiveSession] = useState(null);
//   const [driverLocation, setDriverLocation] = useState(null);
//   const [checkingLiveSession, setCheckingLiveSession] = useState(false);
//   const [seatModificationRequested, setSeatModificationRequested] = useState(false);
//   const [pendingSeatsRequest, setPendingSeatsRequest] = useState(null);
//   const [pendingRequestDetails, setPendingRequestDetails] = useState(null);
  
//   const [totalSeatsOffered, setTotalSeatsOffered] = useState(ride?.available_seats || ride?.seatsAvailable || 4);
//   const [totalBookedSeats, setTotalBookedSeats] = useState(0);
//   const [availableSeats, setAvailableSeats] = useState(0);

//   const fetchSeatAvailability = useCallback(async () => {
//     if (!ride?.id) return;
//     try {
//       const response = await fetch(`${API_BASE_URL}/ride/${ride.id}/passengers?_t=${Date.now()}`);
//       const data = await response.json();
      
//       const totalSeats = ride?.available_seats || ride?.seatsAvailable || data?.available_seats || 4;
//       setTotalSeatsOffered(totalSeats);
      
//       if (data.total_booked_seats !== undefined) {
//         setTotalBookedSeats(data.total_booked_seats);
//         const available = Math.max(0, totalSeats - data.total_booked_seats);
//         setAvailableSeats(available);
//       }
      
//       if (data.passengers && Array.isArray(data.passengers)) {
//         const acceptedPassengers = data.passengers.filter(p => p.status === 'accepted');
//         const otherAccepted = acceptedPassengers.filter(p => p.passenger_phone !== user?.phone_number);
//         setOtherRiders(otherAccepted);
//       }
//     } catch (error) {
//       console.log('Error fetching seat availability:', error);
//     }
//   }, [ride?.id, user?.phone_number]);

//   const animatedDrawer = useRef(new Animated.Value(1)).current;
//   const mapRef = useRef(null);
//   const socketRef = useRef(null);
  
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

//   useEffect(() => {
//     console.log('📊 userBooking initialized:', userBooking);
//   }, []);

//   const showCustomAlert = (title, message, type = 'success') => {
//     let icon = "check-circle";
//     let iconColor = "#10B981";
//     if (type === 'error') { icon = "error"; iconColor = "#EF4444"; }
//     else if (type === 'warning') { icon = "warning"; iconColor = "#F59E0B"; }
//     else if (type === 'info') { icon = "info"; iconColor = Colors.primary; }
//     setAlertConfig({ title, message, icon, iconColor, buttons: [{ text: 'OK', onPress: () => setAlertVisible(false) }] });
//     setAlertVisible(true);
//   };

//   // Get ride status based on current time
//   const getRideStatus = useCallback(() => {
//     if (!ride?.departure_time) return 'unknown';
//     if (ride?.cancellation_reason) {
//       if (ride.cancellation_reason.includes("Auto-cancelled")) return 'auto-cancelled';
//       return 'cancelled';
//     }
    
//     const now = new Date();
//     const departureTime = new Date(ride.departure_time);
//     const minutesToDeparture = (departureTime - now) / (1000 * 60);
//     const minutesSinceDeparture = (now - departureTime) / (1000 * 60);
    
//     if (ride?.started_at) return 'ongoing';
//     if (ride?.status === 'completed') return 'completed';
//     if (minutesSinceDeparture > 30) return 'expired';
//     if (minutesToDeparture <= 0 && minutesSinceDeparture <= 30) return 'late';
//     if (minutesToDeparture <= 15) return 'upcoming-soon';
//     if (minutesToDeparture > 15) return 'upcoming';
    
//     return 'unknown';
//   }, [ride?.departure_time, ride?.cancellation_reason, ride?.started_at, ride?.status]);

//   // Check if modifications are allowed (not locked)
//   const canModifySeats = useCallback(() => {
//     if (!userBooking) return false;
//     const rideStatus = getRideStatus();
//     const bookingStatus = userBooking.status;
    
//     // Cannot modify if:
//     if (ride?.cancellation_reason) return false;
//     if (ride?.started_at) return false;
//     if (bookingStatus !== "accepted") return false;
//     if (rideStatus === 'expired') return false;
//     if (rideStatus === 'auto-cancelled') return false;
//     if (seatModificationRequested) return false;
    
//     // Modifications locked within 15 minutes of departure
//     if (rideStatus === 'upcoming-soon') return false;
//     if (rideStatus === 'late') return false;
    
//     return true;
//   }, [userBooking, getRideStatus, ride, seatModificationRequested]);

//   const canCancelBooking = useCallback(() => {
//     if (!userBooking) return false;
//     const rideStatus = getRideStatus();
//     const bookingStatus = userBooking.status;
    
//     // Cannot cancel if:
//     if (ride?.cancellation_reason) return false;
//     if (ride?.started_at) return false;
//     if (rideStatus === 'expired') return false;
//     if (rideStatus === 'auto-cancelled') return false;
//     if (bookingStatus !== "accepted" && bookingStatus !== "pending") return false;
    
//     // Cancellation locked within 15 minutes of departure
//     if (rideStatus === 'upcoming-soon') return false;
//     if (rideStatus === 'late') return false;
    
//     return true;
//   }, [userBooking, getRideStatus, ride]);

//   const getRideStatusMessage = useCallback(() => {
//     const rideStatus = getRideStatus();
//     const bookingStatus = userBooking?.status;
    
//     if (ride?.cancellation_reason) {
//       if (ride.cancellation_reason.includes("Auto-cancelled")) {
//         return { 
//           message: "This ride has been auto-cancelled as the driver did not start within 30 minutes of departure time", 
//           type: 'auto-cancelled', 
//           icon: 'alert-circle', 
//           color: '#DC2626' 
//         };
//       }
//       return { 
//         message: ride.cancellation_reason, 
//         type: 'cancelled', 
//         icon: 'alert-circle', 
//         color: '#DC2626' 
//       };
//     }
    
//     if (bookingStatus === "rejected") {
//       return { 
//         message: "Your booking request was rejected by the driver", 
//         type: 'rejected', 
//         icon: 'close-circle', 
//         color: '#DC2626' 
//       };
//     }
    
//     if (bookingStatus === "pending") {
//       const now = new Date();
//       const departureTime = new Date(ride?.departure_time);
//       const minutesToDeparture = (departureTime - now) / (1000 * 60);
      
//       if (minutesToDeparture <= 15) {
//         return { 
//           message: `Booking request pending - ${Math.abs(Math.ceil(minutesToDeparture))} minutes remaining before ride starts`, 
//           type: 'pending-locked', 
//           icon: 'lock-closed', 
//           color: '#DC2626' 
//         };
//       }
//       return { 
//         message: `Waiting for driver to confirm your booking for ${userBooking?.seats_requested} seat${userBooking?.seats_requested > 1 ? 's' : ''}`, 
//         type: 'pending', 
//         icon: 'time-outline', 
//         color: '#F59E0B' 
//       };
//     }
    
//     if (bookingStatus === "accepted") {
//       if (seatModificationRequested) {
//         return { 
//           message: `Modification request pending: Changing from ${userBooking?.seats_requested} to ${pendingSeatsRequest} seat(s). Waiting for driver approval.`, 
//           type: 'modification-pending', 
//           icon: 'time-outline', 
//           color: '#F59E0B' 
//         };
//       }
      
//       if (rideStatus === 'auto-cancelled') {
//         return { 
//           message: "Ride auto-cancelled - Driver did not start on time", 
//           type: 'auto-cancelled', 
//           icon: 'alert-circle', 
//           color: '#DC2626' 
//         };
//       }
      
//       if (rideStatus === 'expired') {
//         return { 
//           message: "Ride window expired - Auto-cancellation occurred", 
//           type: 'expired', 
//           icon: 'time-outline', 
//           color: '#DC2626' 
//         };
//       }
      
//       if (rideStatus === 'ongoing') {
//         return { 
//           message: "🚗 Ride in progress! Track your driver's location live", 
//           type: 'ongoing', 
//           icon: 'car-sport', 
//           color: '#10B981' 
//         };
//       }
      
//       if (rideStatus === 'late') {
//         const now = new Date();
//         const departureTime = new Date(ride?.departure_time);
//         const minutesLate = Math.floor((now - departureTime) / (1000 * 60));
//         return { 
//           message: `⚠️ Ride is ${minutesLate} minutes late. Driver must start within ${30 - minutesLate} minutes or ride will be auto-cancelled.`, 
//           type: 'late', 
//           icon: 'time-outline', 
//           color: '#F59E0B' 
//         };
//       }
      
//       if (rideStatus === 'upcoming-soon') {
//         const now = new Date();
//         const departureTime = new Date(ride?.departure_time);
//         const minutesToDeparture = Math.ceil((departureTime - now) / (1000 * 60));
//         return { 
//           message: `Booking confirmed! Ride starts in ${minutesToDeparture} minutes. Modifications are now locked.`, 
//           type: 'confirmed-locked', 
//           icon: 'lock-closed', 
//           color: '#DC2626' 
//         };
//       }
      
//       if (rideStatus === 'upcoming') {
//         const now = new Date();
//         const departureTime = new Date(ride?.departure_time);
//         const minutesToDeparture = Math.ceil((departureTime - now) / (1000 * 60));
//         return { 
//           message: `Booking confirmed! ${userBooking?.seats_requested} seat${userBooking?.seats_requested > 1 ? 's' : ''} booked. Departs in ${minutesToDeparture} minutes`, 
//           type: 'confirmed', 
//           icon: 'checkmark-circle', 
//           color: '#10B981' 
//         };
//       }
      
//       if (rideStatus === 'completed') {
//         return { 
//           message: "This ride has been completed", 
//           type: 'completed', 
//           icon: 'checkmark-done-circle', 
//           color: '#6B7280' 
//         };
//       }
//     }
    
//     return null;
//   }, [getRideStatus, userBooking, ride, seatModificationRequested, pendingSeatsRequest]);

//   const fetchOtherRiders = useCallback(async () => {
//     if (!ride?.id) return;
//     setLoadingRiders(true);
//     try {
//       let otherPassengers = [];
      
//       try {
//         const response = await fetch(`${API_BASE_URL}/ride/${ride.id}/passengers?_t=${Date.now()}`);
//         const data = await response.json();
        
//         if (data.passengers && Array.isArray(data.passengers)) {
//           const acceptedPassengers = data.passengers.filter(p => p.status === 'accepted');
//           otherPassengers = acceptedPassengers.filter(p => p.passenger_phone !== user?.phone_number);
          
//           if (data.total_booked_seats !== undefined) {
//             setTotalBookedSeats(data.total_booked_seats);
//             const available = Math.max(0, totalSeatsOffered - data.total_booked_seats);
//             setAvailableSeats(available);
//           }
//         }
//       } catch (e) {
//         console.log('First endpoint failed:', e);
//       }
      
//       setOtherRiders(otherPassengers);
//     } catch (error) {
//       console.log('Error fetching other riders:', error);
//       setOtherRiders([]);
//     } finally {
//       setLoadingRiders(false);
//     }
//   }, [ride?.id, user?.phone_number, totalSeatsOffered]);

//   const checkForPendingModificationRequest = useCallback(async () => {
//     if (!userBooking?.id) {
//       console.log('❌ No userBooking ID, skipping modification check');
//       return;
//     }
//     try {
//       console.log(`✅ Checking modification request for booking ${userBooking.id}...`);
//       const response = await fetch(`${API_BASE_URL}/booking/${userBooking.id}/modification-request?_t=${Date.now()}`);
//       const data = await response.json();
//       console.log('📦 Modification check response:', JSON.stringify(data, null, 2));
      
//       if (data.has_pending && data.request) {
//         console.log('✅ Found pending modification request:', data.request);
//         setSeatModificationRequested(true);
//         setPendingSeatsRequest(data.request.requested_seats);
//         setPendingRequestDetails(data.request);
//       } else if (data.request && data.request.status === 'pending') {
//         console.log('✅ Found pending modification request (alternative format):', data.request);
//         setSeatModificationRequested(true);
//         setPendingSeatsRequest(data.request.requested_seats);
//         setPendingRequestDetails(data.request);
//       } else if (data.status === 'pending') {
//         console.log('✅ Found pending modification request (status field):', data);
//         setSeatModificationRequested(true);
//         setPendingSeatsRequest(data.requested_seats);
//         setPendingRequestDetails(data);
//       } else {
//         console.log('❌ No pending modification request found');
//         setSeatModificationRequested(false);
//         setPendingSeatsRequest(null);
//         setPendingRequestDetails(null);
//       }
//     } catch (error) {
//       console.log('❌ Error checking modification request:', error);
//       setSeatModificationRequested(false);
//       setPendingSeatsRequest(null);
//       setPendingRequestDetails(null);
//     }
//   }, [userBooking?.id]);

//   const checkLiveSession = useCallback(async () => {
//     if (!ride?.id) return;
//     setCheckingLiveSession(true);
//     try {
//       const response = await fetch(`${API_BASE_URL}/ride/${ride.id}/live-session`);
//       const data = await response.json();
//       if (data.success && data.session && data.session.status === 'active') {
//         setLiveSession(data.session);
//         if (!socketRef.current) {
//           const socket = io(API_BASE_URL);
//           socketRef.current = socket;
//           socket.on('connect', () => {
//             console.log('Socket connected for live tracking');
//             socket.emit('join-live-session', data.session.session_id);
//           });
//           socket.on('driver-location-update', (location) => {
//             setDriverLocation({ latitude: location.latitude, longitude: location.longitude });
//             if (mapRef.current) {
//               mapRef.current.animateToRegion({
//                 latitude: location.latitude,
//                 longitude: location.longitude,
//                 latitudeDelta: 0.01,
//                 longitudeDelta: 0.01,
//               }, 1000);
//             }
//           });
//           socket.on('modification-request-response', (data) => {
//             console.log('Received modification response:', data);
//             if (data.booking_id === userBooking?.id) {
//               if (data.status === 'approved') {
//                 showCustomAlert('Modification Approved', `Your seat modification has been approved! New seats: ${data.new_seats}`, 'success');
//                 setUserBooking({ ...userBooking, seats_requested: data.new_seats });
//                 setSeatModificationRequested(false);
//                 setPendingSeatsRequest(null);
//                 setPendingRequestDetails(null);
//                 fetchSeatAvailability();
//                 fetchOtherRiders();
//               } else if (data.status === 'rejected') {
//                 showCustomAlert('Modification Rejected', 'The driver has rejected your seat modification request.', 'warning');
//                 setSeatModificationRequested(false);
//                 setPendingSeatsRequest(null);
//                 setPendingRequestDetails(null);
//               }
//             }
//           });
//           socket.on('booking-update', () => {
//             console.log('Booking update received, refreshing data');
//             fetchOtherRiders();
//             fetchSeatAvailability();
//           });
//           socket.on('ride-started', (data) => {
//             console.log('Ride started event received:', data);
//             if (data.ride_id === ride.id) {
//               showCustomAlert('Ride Started', 'The driver has started the ride! You can now track their location.', 'info');
//               setLiveSession({ session_id: data.session_id });
//             }
//           });
//           socket.on('ride-auto-cancelled', (data) => {
//             console.log('Ride auto-cancelled event received:', data);
//             if (data.ride_id === ride.id) {
//               showCustomAlert('Ride Auto-Cancelled', data.reason || 'The ride was auto-cancelled as the driver did not start on time.', 'error');
//               navigation.goBack();
//             }
//           });
//         }
//       } else {
//         setLiveSession(null);
//       }
//     } catch (error) {
//       console.log('Error checking live session:', error);
//       setLiveSession(null);
//     } finally {
//       setCheckingLiveSession(false);
//     }
//   }, [ride?.id, userBooking?.id, fetchSeatAvailability, fetchOtherRiders]);

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
//       fetchOtherRiders();
//       fetchSeatAvailability();
//       checkLiveSession();
//       checkForPendingModificationRequest();
//       setRefreshKey(prev => prev + 1);
//       return () => {
//         if (socketRef.current) {
//           socketRef.current.disconnect();
//           socketRef.current = null;
//         }
//       };
//     }, [loadDriverData, fetchOtherRiders, fetchSeatAvailability, checkLiveSession, checkForPendingModificationRequest])
//   );

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

//   const routePath = useMemo(() => {
//     const fullRoute = parseRouteCoordinates(ride?.routeCoordinates);
//     if (fullRoute.length >= 2) return fullRoute;
//     if (intersectionPickup && intersectionDrop) return [intersectionPickup, intersectionDrop];
//     return [];
//   }, [ride, intersectionPickup, intersectionDrop]);

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

//   const vehicleName = driverProfile?.vehicle 
//     ? [driverProfile.vehicle.model].filter(Boolean).join(' ')
//     : [ride?.vehicle?.model].filter(Boolean).join(' ') || 'Vehicle details unavailable';
//   const vehicleRegNumber = driverProfile?.vehicle?.registration_number || ride?.vehicle?.registration_number || null;
//   const vehicleColor = driverProfile?.vehicle?.color || ride?.vehicle?.color || 'Not specified';

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

//   const handleModifySeats = async () => {
//     if (!user?.phone_number || !userBooking) {
//       showCustomAlert('Error', 'Booking information not found', 'error');
//       return;
//     }
//     if (!canModifySeats()) {
//       const rideStatus = getRideStatus();
//       if (rideStatus === 'ongoing') {
//         showCustomAlert('Cannot Modify', 'Ride has already started. Modifications are not allowed.', 'warning');
//       } else if (rideStatus === 'expired') {
//         showCustomAlert('Cannot Modify', 'This ride has expired.', 'warning');
//       } else if (rideStatus === 'auto-cancelled') {
//         showCustomAlert('Cannot Modify', 'This ride has been auto-cancelled.', 'warning');
//       } else if (rideStatus === 'upcoming-soon') {
//         showCustomAlert('Cannot Modify', 'Modifications are locked within 15 minutes of departure.', 'warning');
//       } else if (userBooking?.status === "pending") {
//         showCustomAlert('Cannot Modify', 'Please wait for driver to confirm your booking before modifying seats.', 'warning');
//       } else if (seatModificationRequested) {
//         showCustomAlert('Request Pending', 'You already have a pending seat modification request. Please wait for driver approval.', 'warning');
//       } else {
//         showCustomAlert('Cannot Modify', 'Modifications are not available for this ride at this time.', 'warning');
//       }
//       return;
//     }
//     const currentSeatsBooked = userBooking.seats_requested || 0;
    
//     // Calculate seats already booked by other passengers
//     const otherBookedSeats = totalBookedSeats - currentSeatsBooked;
    
//     // Maximum seats this user can request = total seats - seats booked by others
//     const maxSeatsUserCanRequest = totalSeatsOffered - otherBookedSeats;
    
//     if (seatsRequested > maxSeatsUserCanRequest) {
//       showCustomAlert('Not Enough Seats', `Only ${maxSeatsUserCanRequest} seat(s) available. Other passengers have already booked ${otherBookedSeats} seat(s).`, 'warning');
//       return;
//     }
    
//     if (seatsRequested < 1) {
//       showCustomAlert('Invalid Seats', 'You must book at least 1 seat.', 'warning');
//       return;
//     }
    
//     if (seatsRequested === currentSeatsBooked) {
//       showCustomAlert('No Change', 'Seat count is already set to this value.', 'info');
//       return;
//     }
    
//     setModifyingSeats(true);
//     try {
//       const response = await fetch(`${API_BASE_URL}/booking/${userBooking.id}/request-modification`, {
//         method: 'POST',
//         headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
//         body: JSON.stringify({ requested_seats: seatsRequested }),
//       });
//       const data = await response.json();
      
//       if (!response.ok) throw new Error(data.detail || data.message || 'Failed to send modification request');
      
//       showCustomAlert('Request Sent', `Your request to change from ${currentSeatsBooked} to ${seatsRequested} seat(s) has been sent to the driver. You will be notified once they respond.`, 'info');
      
//       setSeatModificationRequested(true);
//       setPendingSeatsRequest(seatsRequested);
//       setPendingRequestDetails({ requested_seats: seatsRequested, current_seats: currentSeatsBooked });
      
//     } catch (error) {
//       console.error('Modification request error:', error);
//       showCustomAlert('Error', error.message || 'Failed to send modification request', 'error');
//     } finally {
//       setModifyingSeats(false);
//     }
//   };

//   const handleCancelModificationRequest = async () => {
//     if (!userBooking?.id) return;
//     setModifyingSeats(true);
//     try {
//       const response = await fetch(`${API_BASE_URL}/booking/${userBooking.id}/cancel-modification-request`, {
//         method: 'DELETE',
//         headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
//       });
//       const data = await response.json();
      
//       if (!response.ok) throw new Error(data.detail || data.message || 'Failed to cancel modification request');
      
//       showCustomAlert('Request Cancelled', 'Your seat modification request has been cancelled.', 'success');
//       setSeatModificationRequested(false);
//       setPendingSeatsRequest(null);
//       setPendingRequestDetails(null);
//     } catch (error) {
//       console.error('Cancel modification error:', error);
//       showCustomAlert('Error', error.message || 'Failed to cancel modification request', 'error');
//     } finally {
//       setModifyingSeats(false);
//     }
//   };

//   const handleCancelBooking = async () => {
//     if (!user?.phone_number || !userBooking) return;
//     if (!canCancelBooking()) {
//       const rideStatus = getRideStatus();
//       if (rideStatus === 'ongoing') {
//         showCustomAlert('Cannot Cancel', 'Ride has already started. Cancellation is not allowed.', 'warning');
//       } else if (rideStatus === 'expired') {
//         showCustomAlert('Cannot Cancel', 'This ride has expired.', 'warning');
//       } else if (rideStatus === 'auto-cancelled') {
//         showCustomAlert('Cannot Cancel', 'This ride has been auto-cancelled.', 'warning');
//       } else if (rideStatus === 'upcoming-soon') {
//         showCustomAlert('Cannot Cancel', 'Cancellation is locked within 15 minutes of departure.', 'warning');
//       } else {
//         showCustomAlert('Cannot Cancel', 'Cancellation is not available for this ride at this time.', 'warning');
//       }
//       setShowCancelModal(false);
//       return;
//     }
//     setModifyingSeats(true);
//     try {
//       const response = await fetch(`${API_BASE_URL}/booking/${userBooking.id}/cancel`, {
//         method: 'PUT',
//         headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
//       });
//       const data = await response.json();
//       if (!response.ok) throw new Error(data.detail || data.message || 'Failed to cancel booking');
//       showCustomAlert('Success', data.message || 'Booking cancelled successfully', 'success');
//       setUserBooking(null);
//       setTimeout(() => navigation.goBack(), 1500);
//     } catch (error) {
//       console.error('Cancel booking error:', error);
//       showCustomAlert('Error', error.message || 'Failed to cancel booking', 'error');
//     } finally {
//       setModifyingSeats(false);
//       setShowCancelModal(false);
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
//         headers: { 'X-Phone-Number': myPhone, 'Content-Type': 'application/json' },
//         body: JSON.stringify({ participant_phone: receiverPhone, ride_id: rideId }),
//       });
//       const data = await response.json();
//       if (data.success) return data.conversation.id;
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
//           user: { name: driverProfile?.full_name || ride?.driverName || 'Driver', tripInfo: `${ride.from || 'Pickup'} → ${ride.to || 'Drop'}` },
//         });
//       } else {
//         showCustomAlert('Chat', 'Unable to start chat. Please try again.', 'error');
//       }
//     } else {
//       showCustomAlert('Chat', 'Driver contact not available', 'warning');
//     }
//   };

//   const trackLiveRide = () => {
//     if (liveSession) {
//       navigation.navigate('OngoingRideRiderScreen', { bookingId: userBooking?.id, sessionId: liveSession.session_id });
//     }
//   };

//   const formatDate = (dateString) => {
//     if (!dateString) return 'Date not set';
//     const date = new Date(dateString);
//     const today = new Date();
//     const tomorrow = new Date(today);
//     tomorrow.setDate(tomorrow.getDate() + 1);
//     const isToday = date.toDateString() === today.toDateString();
//     const isTomorrow = date.toDateString() === tomorrow.toDateString();
//     let dayText = "";
//     if (isToday) dayText = "Today";
//     else if (isTomorrow) dayText = "Tomorrow";
//     else dayText = date.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" });
//     const timeText = date.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit", hour12: true });
//     return `${dayText}, ${timeText}`;
//   };

//   // Calculate max available seats
//   const currentUserSeats = userBooking?.seats_requested || 0;
//   const otherBookedSeats = totalBookedSeats - currentUserSeats;
//   const maxUserCanRequest = totalSeatsOffered - otherBookedSeats;
  
//   const rideStatus = getRideStatus();
//   const modificationsAllowed = canModifySeats();
//   const cancellationsAllowed = canCancelBooking();
//   const rideStatusMessage = getRideStatusMessage();
//   const isModificationsLocked = rideStatus === 'upcoming-soon' || rideStatus === 'late';
//   const isAutoCancelled = rideStatus === 'auto-cancelled' || rideStatus === 'expired';

//   console.log('🔍 Seat Info:', {
//     totalSeatsOffered,
//     totalBookedSeats,
//     currentUserSeats,
//     otherBookedSeats,
//     maxUserCanRequest,
//     seatsRequested,
//     rideStatus,
//     modificationsAllowed
//   });

//   if (loadingProfile) {
//     return (
//       <View style={styles.loaderContainer}>
//         <LottieView source={require("../assets/loading.json")} autoPlay loop style={{ width: 300, height: 300 }} />
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

//           {driverLocation && (
//             <Marker coordinate={driverLocation} anchor={{ x: 0.5, y: 0.5 }}>
//               <View style={styles.driverLiveMarker}>
//                 <View style={styles.driverLiveDot} />
//                 <Ionicons name="car-sport" size={24} color="#2457A6" />
//                 <View style={styles.driverLivePulse} />
//               </View>
//             </Marker>
//           )}
//         </MapView>

//         <TouchableOpacity style={styles.mapBackButton} onPress={() => navigation.goBack()}>
//           <Ionicons name="chevron-back" size={26} color={Colors.secondary} />
//         </TouchableOpacity>

//         {liveSession && !driverLocation && (
//           <TouchableOpacity style={styles.liveTrackingButton} onPress={trackLiveRide}>
//             <View style={styles.liveDot} />
//             <Text style={styles.liveTrackingButtonText}>Driver Started Ride - Track Now</Text>
//           </TouchableOpacity>
//         )}

//         {driverLocation && (
//           <TouchableOpacity style={[styles.liveTrackingButton, styles.liveTrackingActiveButton]} onPress={trackLiveRide}>
//             <View style={styles.liveDot} />
//             <Text style={styles.liveTrackingButtonText}>Live: Track Driver Location</Text>
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
//                 <Text style={styles.collapsedDriver} numberOfLines={1}>{driverProfile?.full_name || ride?.driverName || 'Driver'}</Text>
//                 <Text style={styles.collapsedSub} numberOfLines={1}>{ride.from || 'Pickup'} → {ride.to || 'Drop'}</Text>
//               </View>
//               <View style={styles.collapsedPriceWrap}>
//                 <Text style={styles.collapsedPrice}>₹{ride.price}</Text>
//                 <Text style={styles.collapsedPerSeat}>per seat</Text>
//               </View>
//             </View>
//           </View>
//         ) : (
//           <ScrollView style={styles.drawerScroll} contentContainerStyle={styles.drawerContent} showsVerticalScrollIndicator={false}>
//             {/* Ride Status Banner */}
//             {rideStatusMessage && (
//               <View style={[styles.statusBanner, { backgroundColor: rideStatusMessage.color + '20' }]}>
//                 <Ionicons name={rideStatusMessage.icon} size={20} color={rideStatusMessage.color} />
//                 <Text style={[styles.statusBannerText, { color: rideStatusMessage.color, flex: 1 }]}>{rideStatusMessage.message}</Text>
//               </View>
//             )}

//             {/* Modifications Locked Warning */}
//             {isModificationsLocked && userBooking?.status === "accepted" && !ride?.cancellation_reason && !isAutoCancelled && (
//               <View style={styles.modificationsLockedBanner}>
//                 <Ionicons name="lock-closed" size={16} color="#DC2626" />
//                 <Text style={styles.modificationsLockedText}>
//                   Modifications and cancellations are locked within 15 minutes of departure
//                 </Text>
//               </View>
//             )}

//             {/* Auto-cancelled Warning */}
//             {isAutoCancelled && (
//               <View style={styles.autoCancelledBanner}>
//                 <Ionicons name="alert-circle" size={20} color="#DC2626" />
//                 <Text style={styles.autoCancelledText}>
//                   This ride has been auto-cancelled as the driver did not start within 30 minutes of departure time.
//                 </Text>
//               </View>
//             )}

//             {(userBooking?.status === "accepted" || (userBooking?.status === "pending" && rideStatus === 'upcoming')) && !isAutoCancelled && (
//               <View style={styles.driverCard}>
//                 <View style={styles.driverTopRow}>
//                   <View style={styles.driverLeftWrap}>
//                     <TouchableOpacity style={styles.driverAvatar} onPress={handleProfileImagePress} activeOpacity={0.8}>
//                       {profilePhotoUrl ? (
//                         isProfilePhotoSvg ? (
//                           <View style={styles.svgAvatarContainer}><SvgCssUri uri={profilePhotoUrl} width={56} height={56} /></View>
//                         ) : (
//                           <Image key={`avatar-${refreshKey}`} source={{ uri: profilePhotoUrl }} style={styles.avatarImg} />
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
//             )}

//             <View style={styles.cardSection}>
//               <Text style={styles.sectionTitle}>Trip Details</Text>
//               <View style={styles.tripTimelineWrap}>
//                 <View style={styles.timelineRail}>
//                   <View style={[styles.timelineDot, { backgroundColor: '#2457A6' }]} />
//                   <View style={styles.timelineLine} />
//                   <View style={[styles.timelineDot, { backgroundColor: '#FF7A00' }]} />
//                 </View>
//                 <View style={styles.timelineContent}>
//                   <View style={styles.timelineItem}>
//                     <Text style={styles.timelineLabel}>Pickup</Text>
//                     <Text style={styles.timelinePlace}>{ride.pickupLabel || ride.from || 'Pickup point'}</Text>
//                     <View style={styles.timelineMetaRow}>
//                       <Ionicons name="time-outline" size={13} color={Colors.gray} />
//                       <Text style={styles.timelineMetaText}>{formatDate(ride.departure_time)}</Text>
//                     </View>
//                   </View>
//                   <View style={styles.timelineItem}>
//                     <Text style={styles.timelineLabel}>Dropoff</Text>
//                     <Text style={styles.timelinePlace}>{ride.dropLabel || ride.to || 'Drop point'}</Text>
//                     <Text style={styles.timelineMetaText}>Estimated: {ride.duration_text || '--'}</Text>
//                   </View>
//                 </View>
//               </View>
//             </View>

//             <View style={styles.cardSection}>
//               <Text style={styles.sectionTitle}>Vehicle Details</Text>
//               <View style={styles.vehicleHeaderRow}>
//                 <View style={styles.vehicleIconCircle}><Ionicons name="car-sport-outline" size={18} color="#2457A6" /></View>
//                 <View style={styles.vehicleMeta}>
//                   <Text style={styles.vehicleTitle}>{vehicleName}</Text>
//                   <Text style={styles.vehicleSub}>{vehicleColor} • {totalSeatsOffered} seats total</Text>
//                   {vehicleRegNumber && (
//                     <View style={styles.vehicleRegContainer}>
//                       <Text style={styles.vehicleRegText}>Vehicle Number: {vehicleRegNumber}</Text>
//                     </View>
//                   )}
//                 </View>
//               </View>
//             </View>

//             {/* Seat Availability Section */}
//             <View style={styles.cardSection}>
//               <Text style={styles.sectionTitle}>Seat Availability</Text>
//               <View style={styles.seatAvailabilityContainer}>
//                 <View style={styles.seatAvailabilityItem}>
//                   <View style={[styles.seatIconSmall, { backgroundColor: '#EAF1FF' }]}>
//                     <Ionicons name="car-sport-outline" size={20} color="#2457A6" />
//                   </View>
//                   <View>
//                     <Text style={styles.seatAvailabilityLabel}>Total Seats</Text>
//                     <Text style={styles.seatAvailabilityValue}>{totalSeatsOffered}</Text>
//                   </View>
//                 </View>
//                 <View style={styles.seatAvailabilityItem}>
//                   <View style={[styles.seatIconSmall, { backgroundColor: '#E8F5E9' }]}>
//                     <Ionicons name="people" size={20} color="#10B981" />
//                   </View>
//                   <View>
//                     <Text style={styles.seatAvailabilityLabel}>Booked</Text>
//                     <Text style={[styles.seatAvailabilityValue, { color: '#10B981' }]}>{totalBookedSeats}</Text>
//                   </View>
//                 </View>
//                 <View style={styles.seatAvailabilityItem}>
//                   <View style={[styles.seatIconSmall, { backgroundColor: '#FFF3E0' }]}>
//                     <Ionicons name="person-add" size={20} color="#F59E0B" />
//                   </View>
//                   <View>
//                     <Text style={styles.seatAvailabilityLabel}>Available</Text>
//                     <Text style={[styles.seatAvailabilityValue, { color: '#F59E0B' }]}>{availableSeats}</Text>
//                   </View>
//                 </View>
//               </View>
//               <View style={styles.seatProgressContainer}>
//                 <View style={[styles.seatProgressBar, { width: `${(totalBookedSeats / totalSeatsOffered) * 100}%` }]} />
//               </View>
//               <Text style={styles.seatProgressText}>{totalBookedSeats} of {totalSeatsOffered} seats booked</Text>
//             </View>

//             <View style={styles.cardSection}>
//               <Text style={styles.sectionTitle}>Ride Preferences</Text>
//               <View style={styles.tagRow}>
//                 {allPreferences.length > 0 ? (
//                   allPreferences.map((pref, index) => <GenericPreferenceTag key={`${pref}-${index}`} label={pref} />)
//                 ) : (
//                   <Text style={styles.emptyText}>No specific preferences added for this ride</Text>
//                 )}
//               </View>
//             </View>

//             <View style={styles.cardSection}>
//               <Text style={styles.sectionTitle}>Your Booking</Text>
              
//               {seatModificationRequested && pendingRequestDetails && !isModificationsLocked && !isAutoCancelled && (
//                 <View style={styles.pendingModificationCard}>
//                   <View style={styles.pendingModificationHeader}>
//                     <Ionicons name="time-outline" size={24} color="#F59E0B" />
//                     <Text style={styles.pendingModificationTitle}>Modification Request Pending</Text>
//                   </View>
//                   <View style={styles.pendingModificationDetails}>
//                     <Text style={styles.pendingModificationText}>
//                       Requested to change from <Text style={styles.oldSeatCount}>{pendingRequestDetails.current_seats || userBooking?.seats_requested}</Text> 
//                       {' → '}
//                       <Text style={styles.newSeatCount}>{pendingRequestDetails.requested_seats || pendingSeatsRequest}</Text> seat(s)
//                     </Text>
//                     <Text style={styles.pendingModificationSubtext}>
//                       Your request has been sent to the driver. You will be notified once they respond.
//                     </Text>
//                   </View>
//                   <TouchableOpacity 
//                     style={styles.cancelRequestButton} 
//                     onPress={handleCancelModificationRequest}
//                     disabled={modifyingSeats}>
//                     <Text style={styles.cancelRequestButtonText}>
//                       {modifyingSeats ? 'Cancelling...' : 'Cancel Request'}
//                     </Text>
//                   </TouchableOpacity>
//                 </View>
//               )}

//               {userBooking && !seatModificationRequested && !isAutoCancelled && (
//                 <View style={[styles.bookingInfoContainer, userBooking.status === "pending" && styles.pendingBookingContainer, userBooking.status === "rejected" && styles.rejectedBookingContainer]}>
//                   {userBooking.status === "pending" ? (
//                     <>
//                       <Ionicons name="time-outline" size={24} color="#F59E0B" />
//                       <Text style={styles.pendingBookingText}>Booking request sent for {userBooking.seats_requested} seat{userBooking.seats_requested > 1 ? 's' : ''}</Text>
//                       <Text style={styles.pendingBookingSubtext}>Waiting for driver to confirm your request</Text>
//                     </>
//                   ) : userBooking.status === "accepted" ? (
//                     <>
//                       <Ionicons name="checkmark-circle" size={24} color="#10B981" />
//                       <Text style={styles.bookingInfoText}>✓ Booking confirmed! You have booked {userBooking.seats_requested} seat{userBooking.seats_requested > 1 ? 's' : ''}</Text>
//                       <Text style={styles.bookingInfoSubtext}>Total amount: ₹{(ride?.price || 0) * userBooking.seats_requested}</Text>
//                     </>
//                   ) : userBooking.status === "rejected" ? (
//                     <>
//                       <Ionicons name="close-circle" size={24} color="#DC2626" />
//                       <Text style={styles.rejectedBookingText}>Booking request was rejected</Text>
//                       <Text style={styles.rejectedBookingSubtext}>The driver could not accept your request</Text>
//                     </>
//                   ) : null}
//                 </View>
//               )}

//               {/* Modify Seats Section - Only shown if modifications allowed */}
//               {modificationsAllowed && userBooking?.status === "accepted" && !seatModificationRequested && !isAutoCancelled && (
//                 <>
//                   <Text style={styles.sectionSubtitle}>Modify Seats</Text>
                  
//                   {otherBookedSeats > 0 && (
//                     <View style={styles.otherBookedInfo}>
//                       <Ionicons name="information-circle" size={14} color="#F59E0B" />
//                       <Text style={styles.otherBookedInfoText}>
//                         {otherBookedSeats} seat{otherBookedSeats > 1 ? 's are' : ' is'} already booked by other passengers.
//                       </Text>
//                     </View>
//                   )}
                  
//                   <View style={styles.seatSelectorRow}>
//                     <TouchableOpacity 
//                       style={[styles.seatActionBtn, seatsRequested === 1 && styles.seatActionBtnDisabled]} 
//                       onPress={() => setSeatsRequested(Math.max(1, seatsRequested - 1))} 
//                       disabled={seatsRequested === 1 || modifyingSeats}>
//                       <Ionicons name="remove" size={20} color={seatsRequested === 1 ? Colors.gray : Colors.dark} />
//                     </TouchableOpacity>
//                     <View style={styles.seatCountWrap}>
//                       <Text style={styles.seatCountText}>{seatsRequested}</Text>
//                       <Text style={styles.seatAvailableText}>/ {maxUserCanRequest} max seats</Text>
//                     </View>
//                     <TouchableOpacity 
//                       style={[styles.seatActionBtn, seatsRequested >= maxUserCanRequest && styles.seatActionBtnDisabled]} 
//                       onPress={() => setSeatsRequested(Math.min(maxUserCanRequest, seatsRequested + 1))} 
//                       disabled={seatsRequested >= maxUserCanRequest || modifyingSeats}>
//                       <Ionicons name="add" size={20} color={seatsRequested >= maxUserCanRequest ? Colors.gray : "#2457A6"} />
//                     </TouchableOpacity>
//                   </View>
                  
//                   <TouchableOpacity 
//                     style={[styles.updateSeatsBtn, (modifyingSeats || seatsRequested === userBooking?.seats_requested) && styles.updateSeatsBtnDisabled]} 
//                     onPress={handleModifySeats} 
//                     disabled={modifyingSeats || seatsRequested === userBooking?.seats_requested}>
//                     <Text style={styles.updateSeatsBtnText}>{modifyingSeats ? 'Sending Request...' : 'Request Seat Change'}</Text>
//                   </TouchableOpacity>
                  
//                   {seatsRequested !== userBooking?.seats_requested && (
//                     <View style={styles.priceDifferenceContainer}>
//                       <Text style={styles.priceDifferenceText}>
//                         {seatsRequested > (userBooking?.seats_requested || 0) 
//                           ? `+ ₹${(ride?.price || 0) * (seatsRequested - (userBooking?.seats_requested || 0))} will be charged if approved`
//                           : `- ₹${(ride?.price || 0) * ((userBooking?.seats_requested || 0) - seatsRequested)} will be refunded if approved`}
//                       </Text>
//                       <Text style={styles.approvalNoteText}>* Changes require driver approval</Text>
//                     </View>
//                   )}
//                 </>
//               )}

//               {/* Cancel Booking Button */}
//               {cancellationsAllowed && userBooking?.status !== "rejected" && !isAutoCancelled && (
//                 <TouchableOpacity style={styles.cancelBookingBtn} onPress={() => setShowCancelModal(true)} disabled={modifyingSeats}>
//                   <Text style={styles.cancelBookingBtnText}>{userBooking?.status === "pending" ? "Cancel Booking Request" : "Cancel Booking"}</Text>
//                 </TouchableOpacity>
//               )}

//               {/* Pending Request Info */}
//               {userBooking?.status === "pending" && rideStatus === 'upcoming' && !cancellationsAllowed && !isAutoCancelled && (
//                 <View style={styles.pendingRequestBox}>
//                   <Ionicons name="lock-closed" size={20} color="#DC2626" />
//                   <View style={styles.pendingRequestContent}>
//                     <Text style={styles.pendingRequestTitle}>Cancellation Locked</Text>
//                     <Text style={styles.pendingRequestText}>Cannot cancel within 15 minutes of departure</Text>
//                   </View>
//                 </View>
//               )}

//               {/* Ride Cancelled Reason */}
//               {ride?.cancellation_reason && (
//                 <View style={styles.cancelledBox}>
//                   <Ionicons name="alert-circle" size={20} color="#DC2626" />
//                   <Text style={styles.cancelledText}>{ride.cancellation_reason}</Text>
//                 </View>
//               )}
//             </View>

//             {/* Other Riders Section */}
//             <View style={styles.cardSection}>
//               <Text style={styles.sectionTitle}>Other Riders {loadingRiders ? '...' : `(${otherRiders.length})`}</Text>
//               {loadingRiders ? (
//                 <View style={styles.loadingContainer}>
//                   <ActivityIndicator size="small" color={Colors.primary} />
//                   <Text style={styles.loadingText}>Loading riders...</Text>
//                 </View>
//               ) : otherRiders.length === 0 ? (
//                 <View style={styles.noRidersContainer}>
//                   <Ionicons name="people-outline" size={40} color={Colors.gray} />
//                   <Text style={styles.noRidersText}>No other riders yet</Text>
//                   <Text style={styles.noRidersSubtext}>When other passengers join this ride, they'll appear here</Text>
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
//                       <View style={styles.otherRiderDetails}>
//                         <View style={styles.otherRiderSeatBadge}>
//                           <Ionicons name="person" size={10} color="#2457A6" />
//                           <Text style={styles.otherRiderSeats}>{rider.seats_booked || 1} seat{(rider.seats_booked || 1) > 1 ? 's' : ''}</Text>
//                         </View>
//                         <View style={styles.otherRiderStatusBadge}>
//                           <View style={[styles.statusDotSmall, { backgroundColor: '#10B981' }]} />
//                           <Text style={styles.otherRiderStatus}>Confirmed</Text>
//                         </View>
//                       </View>
//                     </View>
//                   </View>
//                 ))
//               )}
//             </View>

//             <View style={styles.safetyCard}>
//               <View style={styles.simpleInfoLeft}>
//                 <Ionicons name="shield-checkmark-outline" size={18} color="#2457A6" />
//                 <View>
//                   <Text style={styles.safetyTitle}>Safety First</Text>
//                   <Text style={styles.safetySub}>Live GPS tracking & 24/7 support</Text>
//                 </View>
//               </View>
//             </View>

//             <View style={{ height: 110 }} />
//           </ScrollView>
//         )}
//       </Animated.View>

//       {/* Cancel Booking Modal */}
//       <Modal visible={showCancelModal} transparent={true} animationType="fade" onRequestClose={() => setShowCancelModal(false)}>
//         <View style={styles.modalBackdrop}>
//           <View style={styles.confirmModalContainer}>
//             <View style={styles.confirmModalContent}>
//               <View style={styles.confirmModalHeader}>
//                 <Ionicons name="alert-circle" size={40} color="#F59E0B" />
//                 <Text style={styles.confirmModalTitle}>{userBooking?.status === "pending" ? "Cancel Booking Request?" : "Cancel Booking?"}</Text>
//               </View>
//               <Text style={styles.confirmModalMessage}>
//                 {userBooking?.status === "pending" 
//                   ? "Are you sure you want to cancel your booking request? The driver will be notified."
//                   : "Are you sure you want to cancel your booking for this ride? This action cannot be undone."}
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
//   mapContainer: { width: '100%', overflow: 'hidden', backgroundColor: '#E8EEF7' },
//   map: { flex: 1, backgroundColor: '#E8EEF7' },
//   mapBackButton: { position: 'absolute', top: Platform.OS === 'ios' ? 54 : 22, left: 14, width: 42, height: 42, borderRadius: 25, backgroundColor: 'rgba(255,255,255,0.96)', alignItems: 'center', justifyContent: 'center' },
//   liveTrackingButton: { position: 'absolute', bottom: 20, left: 20, right: 20, backgroundColor: '#10B981', flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 14, borderRadius: 12, gap: 8, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.25, shadowRadius: 4, elevation: 5 },
//   liveTrackingActiveButton: { backgroundColor: '#DC2626' },
//   liveTrackingButtonText: { color: '#fff', fontWeight: '700', fontSize: 14 },
//   liveDot: { width: 10, height: 10, borderRadius: 5, backgroundColor: '#fff', marginRight: 6 },
//   markerWrapper: { alignItems: 'center' },
//   pinBubble: { width: 28, height: 28, borderRadius: 14, borderWidth: 3, borderColor: 'white', alignItems: 'center', justifyContent: 'center', shadowColor: '#000', shadowOffset: { width: 0, height: 3 }, shadowOpacity: 0.25, shadowRadius: 4, elevation: 5 },
//   pinPointer: { width: 0, height: 0, backgroundColor: 'transparent', borderStyle: 'solid', borderLeftWidth: 7, borderRightWidth: 7, borderTopWidth: 10, borderLeftColor: 'transparent', borderRightColor: 'transparent', marginTop: -2 },
//   pinIcon: { fontSize: 14, fontWeight: '800', color: 'white', textAlign: 'center', lineHeight: 18 },
//   pinLabelBubbleYellow: { backgroundColor: 'rgba(113, 63, 18, 0.9)', borderRadius: 8, paddingHorizontal: 8, paddingVertical: 3, marginTop: 4 },
//   pinLabelTextYellow: { color: '#FACC15', fontSize: 10, fontWeight: '700' },
//   driverLiveMarker: { alignItems: 'center', justifyContent: 'center' },
//   driverLiveDot: { position: 'absolute', width: 40, height: 40, borderRadius: 20, backgroundColor: 'rgba(36, 87, 166, 0.2)' },
//   driverLivePulse: { position: 'absolute', width: 60, height: 60, borderRadius: 30, backgroundColor: 'rgba(36, 87, 166, 0.1)' },
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
//   statusBannerText: { fontSize: 13, fontWeight: '700', flex: 1 },
//   modificationsLockedBanner: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#FEF2F2', padding: 12, borderRadius: 12, marginBottom: 14, gap: 8, borderWidth: 1, borderColor: '#FEE2E2' },
//   modificationsLockedText: { fontSize: 12, color: '#DC2626', flex: 1 },
//   autoCancelledBanner: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#FEF2F2', padding: 12, borderRadius: 12, marginBottom: 14, gap: 8, borderWidth: 1, borderColor: '#FEE2E2' },
//   autoCancelledText: { fontSize: 12, color: '#DC2626', flex: 1 },
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
//   sectionSubtitle: { fontSize: 14, fontWeight: '600', color: Colors.dark, marginBottom: 12, marginTop: 8 },
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
//   seatAvailabilityContainer: { flexDirection: 'row', justifyContent: 'space-around', marginBottom: 16 },
//   seatAvailabilityItem: { alignItems: 'center', gap: 8 },
//   seatIconSmall: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center' },
//   seatAvailabilityLabel: { fontSize: 12, color: Colors.gray, textAlign: 'center' },
//   seatAvailabilityValue: { fontSize: 18, fontWeight: '800', color: Colors.dark, textAlign: 'center' },
//   seatProgressContainer: { height: 6, backgroundColor: '#E5E7EB', borderRadius: 3, overflow: 'hidden', marginBottom: 8 },
//   seatProgressBar: { height: '100%', backgroundColor: '#10B981', borderRadius: 3 },
//   seatProgressText: { fontSize: 12, color: Colors.gray, textAlign: 'center' },
//   tagRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 14 },
//   preferenceTag: { paddingHorizontal: 12, paddingVertical: 8, borderRadius: 999, backgroundColor: '#FFF3E8' },
//   preferenceTagText: { fontSize: 12, color: '#C65D00', fontWeight: '700' },
//   emptyText: { fontSize: 13, color: Colors.gray, fontWeight: '600' },
//   bookingInfoContainer: { borderRadius: 12, padding: 16, marginBottom: 16, alignItems: 'center', gap: 8 },
//   pendingBookingContainer: { backgroundColor: '#FFFBEB', borderWidth: 1, borderColor: '#FDE68A' },
//   rejectedBookingContainer: { backgroundColor: '#FEF2F2', borderWidth: 1, borderColor: '#FEE2E2' },
//   bookingInfoText: { fontSize: 14, fontWeight: '600', color: '#166534', textAlign: 'center' },
//   bookingInfoSubtext: { fontSize: 12, color: Colors.gray, textAlign: 'center', marginTop: 4 },
//   pendingBookingText: { fontSize: 14, fontWeight: '600', color: '#92400E', textAlign: 'center' },
//   pendingBookingSubtext: { fontSize: 12, color: '#B45309', textAlign: 'center', marginTop: 4 },
//   rejectedBookingText: { fontSize: 14, fontWeight: '600', color: '#DC2626', textAlign: 'center' },
//   rejectedBookingSubtext: { fontSize: 12, color: '#DC2626', textAlign: 'center', marginTop: 4 },
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
//   priceDifferenceContainer: { marginTop: 12, padding: 10, backgroundColor: '#EFF6FF', borderRadius: 8, alignItems: 'center' },
//   priceDifferenceText: { fontSize: 12, color: '#2457A6', fontWeight: '600' },
//   approvalNoteText: { fontSize: 10, color: '#6B7280', marginTop: 4 },
//   pendingModificationCard: { backgroundColor: '#FFFBEB', borderRadius: 16, padding: 16, marginBottom: 16, borderWidth: 1, borderColor: '#FDE68A' },
//   pendingModificationHeader: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 12 },
//   pendingModificationTitle: { fontSize: 16, fontWeight: '700', color: '#92400E' },
//   pendingModificationDetails: { marginBottom: 16 },
//   pendingModificationText: { fontSize: 14, color: '#B45309', marginBottom: 8, textAlign: 'center' },
//   pendingModificationSubtext: { fontSize: 12, color: '#B45309', textAlign: 'center' },
//   oldSeatCount: { textDecorationLine: 'line-through', fontWeight: '700', color: '#DC2626' },
//   newSeatCount: { fontWeight: '700', color: '#10B981' },
//   cancelRequestButton: { backgroundColor: '#FEF2F2', paddingVertical: 10, borderRadius: 8, borderWidth: 1, borderColor: '#EF4444', alignItems: 'center' },
//   cancelRequestButtonText: { color: '#EF4444', fontWeight: '600', fontSize: 14 },
//   cancelBookingBtn: { marginTop: 12, backgroundColor: '#FEF2F2', paddingVertical: 12, borderRadius: 12, alignItems: 'center', borderWidth: 1, borderColor: '#EF4444' },
//   cancelBookingBtnText: { color: '#EF4444', fontWeight: '700', fontSize: 14 },
//   pendingRequestBox: { flexDirection: 'row', alignItems: 'flex-start', backgroundColor: '#FEF2F2', borderWidth: 1, borderColor: '#FEE2E2', borderRadius: 12, padding: 12, gap: 12, marginTop: 12 },
//   pendingRequestContent: { flex: 1 },
//   pendingRequestTitle: { fontSize: 14, fontWeight: '700', color: '#DC2626', marginBottom: 4 },
//   pendingRequestText: { fontSize: 12, color: '#DC2626', lineHeight: 16 },
//   cancelledBox: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#FEF2F2', borderRadius: 12, padding: 12, gap: 8, borderWidth: 1, borderColor: '#FEE2E2' },
//   cancelledText: { fontSize: 12, color: '#DC2626', flex: 1 },
//   loadingContainer: { alignItems: 'center', padding: 20, gap: 10 },
//   loadingText: { fontSize: 12, color: Colors.gray },
//   noRidersContainer: { alignItems: 'center', padding: 30, gap: 10 },
//   noRidersText: { fontSize: 14, fontWeight: '600', color: Colors.gray },
//   noRidersSubtext: { fontSize: 12, color: Colors.gray, textAlign: 'center' },
//   otherRiderItem: { flexDirection: 'row', alignItems: 'center', paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: '#EEF2F7' },
//   otherRiderAvatar: { width: 44, height: 44, borderRadius: 22, backgroundColor: '#E5E7EB', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', marginRight: 12 },
//   otherRiderAvatarImg: { width: 44, height: 44, borderRadius: 22 },
//   otherRiderAvatarPlaceholder: { width: 44, height: 44, borderRadius: 22, backgroundColor: '#E5E7EB', alignItems: 'center', justifyContent: 'center' },
//   otherRiderAvatarText: { fontSize: 16, fontWeight: '700', color: Colors.primary },
//   otherRiderInfo: { flex: 1 },
//   otherRiderName: { fontSize: 15, fontWeight: '600', color: Colors.dark, marginBottom: 4 },
//   otherRiderDetails: { flexDirection: 'row', alignItems: 'center', gap: 10 },
//   otherRiderSeatBadge: { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: '#EAF1FF', paddingHorizontal: 8, paddingVertical: 3, borderRadius: 12 },
//   otherRiderSeats: { fontSize: 11, color: '#2457A6', fontWeight: '600' },
//   otherRiderStatusBadge: { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: '#F3F4F6', paddingHorizontal: 8, paddingVertical: 3, borderRadius: 12 },
//   otherRiderStatus: { fontSize: 10, color: Colors.gray, fontWeight: '500' },
//   statusDotSmall: { width: 6, height: 6, borderRadius: 3 },
//   simpleInfoLeft: { flexDirection: 'row', alignItems: 'center', gap: 8 },
//   safetyCard: { backgroundColor: '#FFF3E7', borderRadius: 18, padding: 16, marginBottom: 14 },
//   safetyTitle: { fontSize: 14, color: '#2457A6', fontWeight: '800' },
//   safetySub: { marginTop: 2, fontSize: 12, color: '#2457A6', opacity: 0.9, fontWeight: '600' },
//   loaderContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#fff' },
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
  Modal,
  ActivityIndicator,
  LogBox
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

LogBox.ignoreLogs([
  'Accessibility: View',
  'Property accessibilityState',
  'RCTView',
]);

const { height, width } = Dimensions.get('window');
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
    params.append('_t', Date.now());
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

export default function ViewRouteRequestScreen({ navigation, route }) {
  const { user } = useAuth();
  const { ride, booking } = route.params || {};

  console.log('🔍 ViewRouteRequestScreen received:', { hasRide: !!ride, rideId: ride?.id, hasBooking: !!booking, bookingId: booking?.id, bookingStatus: booking?.status });

  const [drawerExpanded, setDrawerExpanded] = useState(true);
  const [driverProfile, setDriverProfile] = useState(null);
  const [isVerified, setIsVerified] = useState(false);
  const [loadingProfile, setLoadingProfile] = useState(false);
  const [mapReady, setMapReady] = useState(false);
  
  const [userBooking, setUserBooking] = useState(() => {
    if (booking && booking.id) {
      return {
        id: booking.id,
        seats_requested: booking.seats_requested || 1,
        status: booking.status || 'pending',
        total_amount: booking.total_amount,
        created_at: booking.created_at,
      };
    }
    if (ride?.booking && ride.booking.id) {
      return {
        id: ride.booking.id,
        seats_requested: ride.booking.seats_requested || ride.booking.seats_booked || 1,
        status: ride.booking.status || 'pending',
        total_amount: ride.booking.total_amount,
      };
    }
    if (ride?.seatsRequested) {
      return {
        id: ride.id,
        seats_requested: ride.seatsRequested,
        status: 'accepted',
      };
    }
    console.log('⚠️ No booking found in params');
    return null;
  });
  
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [seatsRequested, setSeatsRequested] = useState(() => {
    if (booking?.seats_requested) return booking.seats_requested;
    if (booking?.seats_booked) return booking.seats_booked;
    if (ride?.seatsRequested) return ride.seatsRequested;
    return 1;
  });
  
  const [modifyingSeats, setModifyingSeats] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);
  const [otherRiders, setOtherRiders] = useState([]);
  const [loadingRiders, setLoadingRiders] = useState(false);
  const [liveSession, setLiveSession] = useState(null);
  const [driverLocation, setDriverLocation] = useState(null);
  const [checkingLiveSession, setCheckingLiveSession] = useState(false);
  const [seatModificationRequested, setSeatModificationRequested] = useState(false);
  const [pendingSeatsRequest, setPendingSeatsRequest] = useState(null);
  const [pendingRequestDetails, setPendingRequestDetails] = useState(null);
  const [pendingModificationRequest, setPendingModificationRequest] = useState(null);
  
  const [totalSeatsOffered, setTotalSeatsOffered] = useState(ride?.available_seats || ride?.seatsAvailable || 4);
  const [totalBookedSeats, setTotalBookedSeats] = useState(0);
  const [availableSeats, setAvailableSeats] = useState(0);

  const fetchSeatAvailability = useCallback(async () => {
    if (!ride?.id) return;
    try {
      const response = await fetch(`${API_BASE_URL}/ride/${ride.id}/passengers?_t=${Date.now()}`);
      const data = await response.json();
      
      const totalSeats = ride?.available_seats || ride?.seatsAvailable || data?.available_seats || 4;
      setTotalSeatsOffered(totalSeats);
      
      if (data.total_booked_seats !== undefined) {
        setTotalBookedSeats(data.total_booked_seats);
        const available = Math.max(0, totalSeats - data.total_booked_seats);
        setAvailableSeats(available);
      }
      
      if (data.passengers && Array.isArray(data.passengers)) {
        const acceptedPassengers = data.passengers.filter(p => p.status === 'accepted');
        const otherAccepted = acceptedPassengers.filter(p => p.passenger_phone !== user?.phone_number);
        setOtherRiders(otherAccepted);
      }
    } catch (error) {
      console.log('Error fetching seat availability:', error);
    }
  }, [ride?.id, user?.phone_number]);

  const fetchMyModificationRequest = useCallback(async () => {
    if (!userBooking?.id) return;
    try {
      const response = await fetch(`${API_BASE_URL}/booking/${userBooking.id}/modification-request?_t=${Date.now()}`);
      const data = await response.json();
      
      if (data.has_pending && data.request && data.request.status === 'pending') {
        setPendingModificationRequest(data.request);
      } else if (data.status === 'pending') {
        setPendingModificationRequest(data);
      } else {
        setPendingModificationRequest(null);
      }
    } catch (error) {
      console.log('Error fetching modification request:', error);
    }
  }, [userBooking?.id]);

  const animatedDrawer = useRef(new Animated.Value(1)).current;
  const mapRef = useRef(null);
  const socketRef = useRef(null);
  
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

  useEffect(() => {
    console.log('📊 userBooking initialized:', userBooking);
  }, []);

  const showCustomAlert = (title, message, type = 'success') => {
    let icon = "check-circle";
    let iconColor = "#10B981";
    if (type === 'error') { icon = "error"; iconColor = "#EF4444"; }
    else if (type === 'warning') { icon = "warning"; iconColor = "#F59E0B"; }
    else if (type === 'info') { icon = "info"; iconColor = Colors.primary; }
    setAlertConfig({ title, message, icon, iconColor, buttons: [{ text: 'OK', onPress: () => setAlertVisible(false) }] });
    setAlertVisible(true);
  };

  // Get ride status based on current time
  const getRideStatus = useCallback(() => {
    if (!ride?.departure_time) return 'unknown';
    if (ride?.cancellation_reason) {
      if (ride.cancellation_reason.includes("Auto-cancelled")) return 'auto-cancelled';
      return 'cancelled';
    }
    
    const now = new Date();
    const departureTime = new Date(ride.departure_time);
    const minutesToDeparture = (departureTime - now) / (1000 * 60);
    const minutesSinceDeparture = (now - departureTime) / (1000 * 60);
    
    if (ride?.started_at) return 'ongoing';
    if (ride?.status === 'completed') return 'completed';
    if (minutesSinceDeparture > 30) return 'expired';
    if (minutesToDeparture <= 0 && minutesSinceDeparture <= 30) return 'late';
    if (minutesToDeparture <= 15) return 'upcoming-soon';
    if (minutesToDeparture > 15) return 'upcoming';
    
    return 'unknown';
  }, [ride?.departure_time, ride?.cancellation_reason, ride?.started_at, ride?.status]);

  // Check if modifications are allowed (not locked)
  const canModifySeats = useCallback(() => {
    if (!userBooking) return false;
    const rideStatus = getRideStatus();
    const bookingStatus = userBooking.status;
    
    if (ride?.cancellation_reason) return false;
    if (ride?.started_at) return false;
    if (bookingStatus !== "accepted") return false;
    if (rideStatus === 'expired') return false;
    if (rideStatus === 'auto-cancelled') return false;
    if (seatModificationRequested) return false;
    
    if (rideStatus === 'upcoming-soon') return false;
    if (rideStatus === 'late') return false;
    
    return true;
  }, [userBooking, getRideStatus, ride, seatModificationRequested]);

  const canCancelBooking = useCallback(() => {
    if (!userBooking) return false;
    const rideStatus = getRideStatus();
    const bookingStatus = userBooking.status;
    
    if (ride?.cancellation_reason) return false;
    if (ride?.started_at) return false;
    if (rideStatus === 'expired') return false;
    if (rideStatus === 'auto-cancelled') return false;
    if (bookingStatus !== "accepted" && bookingStatus !== "pending") return false;
    
    if (rideStatus === 'upcoming-soon') return false;
    if (rideStatus === 'late') return false;
    
    return true;
  }, [userBooking, getRideStatus, ride]);

  const getRideStatusMessage = useCallback(() => {
    const rideStatus = getRideStatus();
    const bookingStatus = userBooking?.status;
    
    if (ride?.cancellation_reason) {
      if (ride.cancellation_reason.includes("Auto-cancelled")) {
        return { 
          message: "This ride has been auto-cancelled as the driver did not start within 30 minutes of departure time", 
          type: 'auto-cancelled', 
          icon: 'alert-circle', 
          color: '#DC2626' 
        };
      }
      return { 
        message: ride.cancellation_reason, 
        type: 'cancelled', 
        icon: 'alert-circle', 
        color: '#DC2626' 
      };
    }
    
    if (bookingStatus === "rejected") {
      return { 
        message: "Your booking request was rejected by the driver", 
        type: 'rejected', 
        icon: 'close-circle', 
        color: '#DC2626' 
      };
    }
    
    if (bookingStatus === "pending") {
      const now = new Date();
      const departureTime = new Date(ride?.departure_time);
      const minutesToDeparture = (departureTime - now) / (1000 * 60);
      
      if (minutesToDeparture <= 15) {
        return { 
          message: `Booking request pending - ${Math.abs(Math.ceil(minutesToDeparture))} minutes remaining before ride starts`, 
          type: 'pending-locked', 
          icon: 'lock-closed', 
          color: '#DC2626' 
        };
      }
      return { 
        message: `Waiting for driver to confirm your booking for ${userBooking?.seats_requested} seat${userBooking?.seats_requested > 1 ? 's' : ''}`, 
        type: 'pending', 
        icon: 'time-outline', 
        color: '#F59E0B' 
      };
    }
    
    if (bookingStatus === "accepted") {
      if (seatModificationRequested) {
        return { 
          message: `Modification request pending: Changing from ${userBooking?.seats_requested} to ${pendingSeatsRequest} seat(s). Waiting for driver approval.`, 
          type: 'modification-pending', 
          icon: 'time-outline', 
          color: '#F59E0B' 
        };
      }
      
      if (rideStatus === 'auto-cancelled') {
        return { 
          message: "Ride auto-cancelled - Driver did not start on time", 
          type: 'auto-cancelled', 
          icon: 'alert-circle', 
          color: '#DC2626' 
        };
      }
      
      if (rideStatus === 'expired') {
        return { 
          message: "Ride window expired - Auto-cancellation occurred", 
          type: 'expired', 
          icon: 'time-outline', 
          color: '#DC2626' 
        };
      }
      
      if (rideStatus === 'ongoing') {
        return { 
          message: "🚗 Ride in progress! Track your driver's location live", 
          type: 'ongoing', 
          icon: 'car-sport', 
          color: '#10B981' 
        };
      }
      
      if (rideStatus === 'late') {
        const now = new Date();
        const departureTime = new Date(ride?.departure_time);
        const minutesLate = Math.floor((now - departureTime) / (1000 * 60));
        return { 
          message: `⚠️ Ride is ${minutesLate} minutes late. Driver must start within ${30 - minutesLate} minutes or ride will be auto-cancelled.`, 
          type: 'late', 
          icon: 'time-outline', 
          color: '#F59E0B' 
        };
      }
      
      if (rideStatus === 'upcoming-soon') {
        const now = new Date();
        const departureTime = new Date(ride?.departure_time);
        const minutesToDeparture = Math.ceil((departureTime - now) / (1000 * 60));
        return { 
          message: `Booking confirmed! Ride starts in ${minutesToDeparture} minutes. Modifications are now locked.`, 
          type: 'confirmed-locked', 
          icon: 'lock-closed', 
          color: '#DC2626' 
        };
      }
      
      if (rideStatus === 'upcoming') {
        const now = new Date();
        const departureTime = new Date(ride?.departure_time);
        const minutesToDeparture = Math.ceil((departureTime - now) / (1000 * 60));
        return { 
          message: `Booking confirmed! ${userBooking?.seats_requested} seat${userBooking?.seats_requested > 1 ? 's' : ''} booked. Departs in ${minutesToDeparture} minutes`, 
          type: 'confirmed', 
          icon: 'checkmark-circle', 
          color: '#10B981' 
        };
      }
      
      if (rideStatus === 'completed') {
        return { 
          message: "This ride has been completed", 
          type: 'completed', 
          icon: 'checkmark-done-circle', 
          color: '#6B7280' 
        };
      }
    }
    
    return null;
  }, [getRideStatus, userBooking, ride, seatModificationRequested, pendingSeatsRequest]);

  const fetchOtherRiders = useCallback(async () => {
    if (!ride?.id) return;
    setLoadingRiders(true);
    try {
      let otherPassengers = [];
      
      try {
        const response = await fetch(`${API_BASE_URL}/ride/${ride.id}/passengers?_t=${Date.now()}`);
        const data = await response.json();
        
        if (data.passengers && Array.isArray(data.passengers)) {
          const acceptedPassengers = data.passengers.filter(p => p.status === 'accepted');
          otherPassengers = acceptedPassengers.filter(p => p.passenger_phone !== user?.phone_number);
          
          if (data.total_booked_seats !== undefined) {
            setTotalBookedSeats(data.total_booked_seats);
            const available = Math.max(0, totalSeatsOffered - data.total_booked_seats);
            setAvailableSeats(available);
          }
        }
      } catch (e) {
        console.log('First endpoint failed:', e);
      }
      
      setOtherRiders(otherPassengers);
    } catch (error) {
      console.log('Error fetching other riders:', error);
      setOtherRiders([]);
    } finally {
      setLoadingRiders(false);
    }
  }, [ride?.id, user?.phone_number, totalSeatsOffered]);

  const checkForPendingModificationRequest = useCallback(async () => {
    if (!userBooking?.id) {
      console.log('❌ No userBooking ID, skipping modification check');
      return;
    }
    try {
      console.log(`✅ Checking modification request for booking ${userBooking.id}...`);
      const response = await fetch(`${API_BASE_URL}/booking/${userBooking.id}/modification-request?_t=${Date.now()}`);
      const data = await response.json();
      console.log('📦 Modification check response:', JSON.stringify(data, null, 2));
      
      if (data.has_pending && data.request) {
        console.log('✅ Found pending modification request:', data.request);
        setSeatModificationRequested(true);
        setPendingSeatsRequest(data.request.requested_seats);
        setPendingRequestDetails(data.request);
      } else if (data.request && data.request.status === 'pending') {
        console.log('✅ Found pending modification request (alternative format):', data.request);
        setSeatModificationRequested(true);
        setPendingSeatsRequest(data.request.requested_seats);
        setPendingRequestDetails(data.request);
      } else if (data.status === 'pending') {
        console.log('✅ Found pending modification request (status field):', data);
        setSeatModificationRequested(true);
        setPendingSeatsRequest(data.requested_seats);
        setPendingRequestDetails(data);
      } else {
        console.log('❌ No pending modification request found');
        setSeatModificationRequested(false);
        setPendingSeatsRequest(null);
        setPendingRequestDetails(null);
      }
    } catch (error) {
      console.log('❌ Error checking modification request:', error);
      setSeatModificationRequested(false);
      setPendingSeatsRequest(null);
      setPendingRequestDetails(null);
    }
  }, [userBooking?.id]);

  const checkLiveSession = useCallback(async () => {
    if (!ride?.id) return;
    setCheckingLiveSession(true);
    try {
      const response = await fetch(`${API_BASE_URL}/ride/${ride.id}/live-session`);
      const data = await response.json();
      if (data.success && data.session && data.session.status === 'active') {
        setLiveSession(data.session);
        if (!socketRef.current) {
          const socket = io(API_BASE_URL);
          socketRef.current = socket;
          socket.on('connect', () => {
            console.log('Socket connected for live tracking');
            socket.emit('join-live-session', data.session.session_id);
          });
          socket.on('driver-location-update', (location) => {
            setDriverLocation({ latitude: location.latitude, longitude: location.longitude });
            if (mapRef.current) {
              mapRef.current.animateToRegion({
                latitude: location.latitude,
                longitude: location.longitude,
                latitudeDelta: 0.01,
                longitudeDelta: 0.01,
              }, 1000);
            }
          });
          socket.on('modification-request-response', (data) => {
            console.log('Received modification response:', data);
            if (data.booking_id === userBooking?.id) {
              if (data.status === 'approved') {
                showCustomAlert('Modification Approved', `Your seat modification has been approved! New seats: ${data.new_seats}`, 'success');
                setUserBooking({ ...userBooking, seats_requested: data.new_seats });
                setSeatModificationRequested(false);
                setPendingSeatsRequest(null);
                setPendingRequestDetails(null);
                setPendingModificationRequest(null);
                fetchSeatAvailability();
                fetchOtherRiders();
              } else if (data.status === 'rejected') {
                showCustomAlert('Modification Rejected', 'The driver has rejected your seat modification request.', 'warning');
                setSeatModificationRequested(false);
                setPendingSeatsRequest(null);
                setPendingRequestDetails(null);
                setPendingModificationRequest(null);
              }
            }
          });
          socket.on('booking-update', () => {
            console.log('Booking update received, refreshing data');
            fetchOtherRiders();
            fetchSeatAvailability();
          });
          socket.on('ride-started', (data) => {
            console.log('Ride started event received:', data);
            if (data.ride_id === ride.id) {
              showCustomAlert('Ride Started', 'The driver has started the ride! You can now track their location.', 'info');
              setLiveSession({ session_id: data.session_id });
            }
          });
          socket.on('ride-auto-cancelled', (data) => {
            console.log('Ride auto-cancelled event received:', data);
            if (data.ride_id === ride.id) {
              showCustomAlert('Ride Auto-Cancelled', data.reason || 'The ride was auto-cancelled as the driver did not start on time.', 'error');
              navigation.goBack();
            }
          });
        }
      } else {
        setLiveSession(null);
      }
    } catch (error) {
      console.log('Error checking live session:', error);
      setLiveSession(null);
    } finally {
      setCheckingLiveSession(false);
    }
  }, [ride?.id, userBooking?.id, fetchSeatAvailability, fetchOtherRiders]);

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
      fetchOtherRiders();
      fetchSeatAvailability();
      checkLiveSession();
      checkForPendingModificationRequest();
      fetchMyModificationRequest();
      setRefreshKey(prev => prev + 1);
      return () => {
        if (socketRef.current) {
          socketRef.current.disconnect();
          socketRef.current = null;
        }
      };
    }, [loadDriverData, fetchOtherRiders, fetchSeatAvailability, checkLiveSession, checkForPendingModificationRequest, fetchMyModificationRequest])
  );

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

  const routePath = useMemo(() => {
    const fullRoute = parseRouteCoordinates(ride?.routeCoordinates);
    if (fullRoute.length >= 2) return fullRoute;
    if (intersectionPickup && intersectionDrop) return [intersectionPickup, intersectionDrop];
    return [];
  }, [ride, intersectionPickup, intersectionDrop]);

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

  const vehicleName = driverProfile?.vehicle 
    ? [driverProfile.vehicle.model].filter(Boolean).join(' ')
    : [ride?.vehicle?.model].filter(Boolean).join(' ') || 'Vehicle details unavailable';
  const vehicleRegNumber = driverProfile?.vehicle?.registration_number || ride?.vehicle?.registration_number || null;
  const vehicleColor = driverProfile?.vehicle?.color || ride?.vehicle?.color || 'Not specified';

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

  const handleModifySeats = async () => {
    if (!user?.phone_number || !userBooking) {
      showCustomAlert('Error', 'Booking information not found', 'error');
      return;
    }
    if (!canModifySeats()) {
      const rideStatus = getRideStatus();
      if (rideStatus === 'ongoing') {
        showCustomAlert('Cannot Modify', 'Ride has already started. Modifications are not allowed.', 'warning');
      } else if (rideStatus === 'expired') {
        showCustomAlert('Cannot Modify', 'This ride has expired.', 'warning');
      } else if (rideStatus === 'auto-cancelled') {
        showCustomAlert('Cannot Modify', 'This ride has been auto-cancelled.', 'warning');
      } else if (rideStatus === 'upcoming-soon') {
        showCustomAlert('Cannot Modify', 'Modifications are locked within 15 minutes of departure.', 'warning');
      } else if (userBooking?.status === "pending") {
        showCustomAlert('Cannot Modify', 'Please wait for driver to confirm your booking before modifying seats.', 'warning');
      } else if (seatModificationRequested) {
        showCustomAlert('Request Pending', 'You already have a pending seat modification request. Please wait for driver approval.', 'warning');
      } else {
        showCustomAlert('Cannot Modify', 'Modifications are not available for this ride at this time.', 'warning');
      }
      return;
    }
    const currentSeatsBooked = userBooking.seats_requested || 0;
    
    const otherBookedSeats = totalBookedSeats - currentSeatsBooked;
    const maxSeatsUserCanRequest = totalSeatsOffered - otherBookedSeats;
    
    if (seatsRequested > maxSeatsUserCanRequest) {
      showCustomAlert('Not Enough Seats', `Only ${maxSeatsUserCanRequest} seat(s) available. Other passengers have already booked ${otherBookedSeats} seat(s).`, 'warning');
      return;
    }
    
    if (seatsRequested < 1) {
      showCustomAlert('Invalid Seats', 'You must book at least 1 seat.', 'warning');
      return;
    }
    
    if (seatsRequested === currentSeatsBooked) {
      showCustomAlert('No Change', 'Seat count is already set to this value.', 'info');
      return;
    }
    
    setModifyingSeats(true);
    try {
      const response = await fetch(`${API_BASE_URL}/booking/${userBooking.id}/request-modification`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
        body: JSON.stringify({ requested_seats: seatsRequested }),
      });
      const data = await response.json();
      
      if (!response.ok) throw new Error(data.detail || data.message || 'Failed to send modification request');
      
      showCustomAlert('Request Sent', `Your request to change from ${currentSeatsBooked} to ${seatsRequested} seat(s) has been sent to the driver. You will be notified once they respond.`, 'info');
      
      setSeatModificationRequested(true);
      setPendingSeatsRequest(seatsRequested);
      setPendingRequestDetails({ requested_seats: seatsRequested, current_seats: currentSeatsBooked });
      setPendingModificationRequest({ requested_seats: seatsRequested, current_seats: currentSeatsBooked, status: 'pending' });
      
    } catch (error) {
      console.error('Modification request error:', error);
      showCustomAlert('Error', error.message || 'Failed to send modification request', 'error');
    } finally {
      setModifyingSeats(false);
    }
  };

  const handleCancelModificationRequest = async () => {
    if (!userBooking?.id) return;
    setModifyingSeats(true);
    try {
      const response = await fetch(`${API_BASE_URL}/booking/${userBooking.id}/cancel-modification-request`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
      });
      const data = await response.json();
      
      if (!response.ok) throw new Error(data.detail || data.message || 'Failed to cancel modification request');
      
      showCustomAlert('Request Cancelled', 'Your seat modification request has been cancelled.', 'success');
      setSeatModificationRequested(false);
      setPendingSeatsRequest(null);
      setPendingRequestDetails(null);
      setPendingModificationRequest(null);
    } catch (error) {
      console.error('Cancel modification error:', error);
      showCustomAlert('Error', error.message || 'Failed to cancel modification request', 'error');
    } finally {
      setModifyingSeats(false);
    }
  };

  const handleCancelBooking = async () => {
    if (!user?.phone_number || !userBooking) return;
    if (!canCancelBooking()) {
      const rideStatus = getRideStatus();
      if (rideStatus === 'ongoing') {
        showCustomAlert('Cannot Cancel', 'Ride has already started. Cancellation is not allowed.', 'warning');
      } else if (rideStatus === 'expired') {
        showCustomAlert('Cannot Cancel', 'This ride has expired.', 'warning');
      } else if (rideStatus === 'auto-cancelled') {
        showCustomAlert('Cannot Cancel', 'This ride has been auto-cancelled.', 'warning');
      } else if (rideStatus === 'upcoming-soon') {
        showCustomAlert('Cannot Cancel', 'Cancellation is locked within 15 minutes of departure.', 'warning');
      } else {
        showCustomAlert('Cannot Cancel', 'Cancellation is not available for this ride at this time.', 'warning');
      }
      setShowCancelModal(false);
      return;
    }
    setModifyingSeats(true);
    try {
      const response = await fetch(`${API_BASE_URL}/booking/${userBooking.id}/cancel`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.detail || data.message || 'Failed to cancel booking');
      showCustomAlert('Success', data.message || 'Booking cancelled successfully', 'success');
      setUserBooking(null);
      setTimeout(() => navigation.goBack(), 1500);
    } catch (error) {
      console.error('Cancel booking error:', error);
      showCustomAlert('Error', error.message || 'Failed to cancel booking', 'error');
    } finally {
      setModifyingSeats(false);
      setShowCancelModal(false);
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
        headers: { 'X-Phone-Number': myPhone, 'Content-Type': 'application/json' },
        body: JSON.stringify({ participant_phone: receiverPhone, ride_id: rideId }),
      });
      const data = await response.json();
      if (data.success) return data.conversation.id;
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
          rideId: ride.id,
          user: { 
            name: driverProfile?.full_name || ride?.driverName || 'Driver', 
            tripInfo: `${ride.from || 'Pickup'} → ${ride.to || 'Drop'}`,
            phone: driverPhone,
            profile_picture: profilePhotoUrl
          },
        });
      } else {
        showCustomAlert('Chat', 'Unable to start chat. Please try again.', 'error');
      }
    } else {
      showCustomAlert('Chat', 'Driver contact not available', 'warning');
    }
  };

  const trackLiveRide = () => {
    if (liveSession) {
      navigation.navigate('OngoingRideRiderScreen', { bookingId: userBooking?.id, sessionId: liveSession.session_id });
    }
  };

  const formatDate = (dateString) => {
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
  };

  const currentUserSeats = userBooking?.seats_requested || 0;
  const otherBookedSeats = totalBookedSeats - currentUserSeats;
  const maxUserCanRequest = totalSeatsOffered - otherBookedSeats;
  
  const rideStatus = getRideStatus();
  const modificationsAllowed = canModifySeats();
  const cancellationsAllowed = canCancelBooking();
  const rideStatusMessage = getRideStatusMessage();
  const isModificationsLocked = rideStatus === 'upcoming-soon' || rideStatus === 'late';
  const isAutoCancelled = rideStatus === 'auto-cancelled' || rideStatus === 'expired';

  console.log('🔍 Seat Info:', {
    totalSeatsOffered,
    totalBookedSeats,
    currentUserSeats,
    otherBookedSeats,
    maxUserCanRequest,
    seatsRequested,
    rideStatus,
    modificationsAllowed
  });

  if (loadingProfile) {
    return (
      <View style={styles.loaderContainer}>
        <LottieView source={require("../assets/loading.json")} autoPlay loop style={{ width: 300, height: 300 }} />
      </View>
    );
  }

  const initialRegion = {
    latitude: intersectionPickup?.latitude || driverStart?.latitude || 28.6139,
    longitude: intersectionPickup?.longitude || driverStart?.longitude || 77.2090,
    latitudeDelta: 0.05,
    longitudeDelta: 0.05,
  };

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

          {driverLocation && (
            <Marker coordinate={driverLocation} anchor={{ x: 0.5, y: 0.5 }}>
              <View style={styles.driverLiveMarker}>
                <View style={styles.driverLiveDot} />
                <Ionicons name="car-sport" size={24} color="#2457A6" />
                <View style={styles.driverLivePulse} />
              </View>
            </Marker>
          )}
        </MapView>

        <TouchableOpacity style={styles.mapBackButton} onPress={() => navigation.goBack()}>
          <Ionicons name="chevron-back" size={26} color={Colors.secondary} />
        </TouchableOpacity>

        {liveSession && !driverLocation && (
          <TouchableOpacity style={styles.liveTrackingButton} onPress={trackLiveRide}>
            <View style={styles.liveDot} />
            <Text style={styles.liveTrackingButtonText}>Driver Started Ride - Track Now</Text>
          </TouchableOpacity>
        )}

        {driverLocation && (
          <TouchableOpacity style={[styles.liveTrackingButton, styles.liveTrackingActiveButton]} onPress={trackLiveRide}>
            <View style={styles.liveDot} />
            <Text style={styles.liveTrackingButtonText}>Live: Track Driver Location</Text>
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
                <Text style={styles.collapsedDriver} numberOfLines={1}>{driverProfile?.full_name || ride?.driverName || 'Driver'}</Text>
                <Text style={styles.collapsedSub} numberOfLines={1}>{ride.from || 'Pickup'} → {ride.to || 'Drop'}</Text>
              </View>
              <View style={styles.collapsedPriceWrap}>
                <Text style={styles.collapsedPrice}>₹{ride.price}</Text>
                <Text style={styles.collapsedPerSeat}>per seat</Text>
              </View>
            </View>
          </View>
        ) : (
          <ScrollView style={styles.drawerScroll} contentContainerStyle={styles.drawerContent} showsVerticalScrollIndicator={false}>
            {/* Ride Status Banner */}
            {rideStatusMessage && (
              <View style={[styles.statusBanner, { backgroundColor: rideStatusMessage.color + '20' }]}>
                <Ionicons name={rideStatusMessage.icon} size={20} color={rideStatusMessage.color} />
                <Text style={[styles.statusBannerText, { color: rideStatusMessage.color, flex: 1 }]}>{rideStatusMessage.message}</Text>
              </View>
            )}

            {/* Pending Modification Request Banner - Rider View */}
            {pendingModificationRequest && pendingModificationRequest.status === 'pending' && (
              <View style={styles.modificationBanner}>
                <View style={styles.modificationBannerContent}>
                  <Ionicons name="time-outline" size={20} color="#F59E0B" />
                  <View style={styles.modificationBannerTextContainer}>
                    <Text style={styles.modificationBannerTitle}>Modification Request Pending</Text>
                    <Text style={styles.modificationBannerText}>
                      You requested to change from {pendingModificationRequest.current_seats} → {pendingModificationRequest.requested_seats} seat(s)
                    </Text>
                    <Text style={styles.modificationBannerSubtext}>
                      Waiting for driver to respond to your request
                    </Text>
                  </View>
                </View>
              </View>
            )}

            {/* Modifications Locked Warning */}
            {isModificationsLocked && userBooking?.status === "accepted" && !ride?.cancellation_reason && !isAutoCancelled && (
              <View style={styles.modificationsLockedBanner}>
                <Ionicons name="lock-closed" size={16} color="#DC2626" />
                <Text style={styles.modificationsLockedText}>
                  Modifications and cancellations are locked within 15 minutes of departure
                </Text>
              </View>
            )}

            {/* Auto-cancelled Warning */}
            {isAutoCancelled && (
              <View style={styles.autoCancelledBanner}>
                <Ionicons name="alert-circle" size={20} color="#DC2626" />
                <Text style={styles.autoCancelledText}>
                  This ride has been auto-cancelled as the driver did not start within 30 minutes of departure time.
                </Text>
              </View>
            )}

            {(userBooking?.status === "accepted" || (userBooking?.status === "pending" && rideStatus === 'upcoming')) && !isAutoCancelled && (
              <View style={styles.driverCard}>
                <View style={styles.driverTopRow}>
                  <View style={styles.driverLeftWrap}>
                    <TouchableOpacity style={styles.driverAvatar} onPress={handleProfileImagePress} activeOpacity={0.8}>
                      {profilePhotoUrl ? (
                        isProfilePhotoSvg ? (
                          <View style={styles.svgAvatarContainer}><SvgCssUri uri={profilePhotoUrl} width={56} height={56} /></View>
                        ) : (
                          <Image key={`avatar-${refreshKey}`} source={{ uri: profilePhotoUrl }} style={styles.avatarImg} />
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
            )}

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
                    <Text style={styles.timelinePlace}>{ride.pickupLabel || ride.from || 'Pickup point'}</Text>
                    <View style={styles.timelineMetaRow}>
                      <Ionicons name="time-outline" size={13} color={Colors.gray} />
                      <Text style={styles.timelineMetaText}>{formatDate(ride.departure_time)}</Text>
                    </View>
                  </View>
                  <View style={styles.timelineItem}>
                    <Text style={styles.timelineLabel}>Dropoff</Text>
                    <Text style={styles.timelinePlace}>{ride.dropLabel || ride.to || 'Drop point'}</Text>
                    <Text style={styles.timelineMetaText}>Estimated: {ride.duration_text || '--'}</Text>
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
                  <Text style={styles.vehicleSub}>{vehicleColor} • {totalSeatsOffered} seats total</Text>
                  {vehicleRegNumber && (
                    <View style={styles.vehicleRegContainer}>
                      <Text style={styles.vehicleRegText}>Vehicle Number: {vehicleRegNumber}</Text>
                    </View>
                  )}
                </View>
              </View>
            </View>

            {/* Seat Availability Section */}
            <View style={styles.cardSection}>
              <Text style={styles.sectionTitle}>Seat Availability</Text>
              <View style={styles.seatAvailabilityContainer}>
                <View style={styles.seatAvailabilityItem}>
                  <View style={[styles.seatIconSmall, { backgroundColor: '#EAF1FF' }]}>
                    <Ionicons name="car-sport-outline" size={20} color="#2457A6" />
                  </View>
                  <View>
                    <Text style={styles.seatAvailabilityLabel}>Total Seats</Text>
                    <Text style={styles.seatAvailabilityValue}>{totalSeatsOffered}</Text>
                  </View>
                </View>
                <View style={styles.seatAvailabilityItem}>
                  <View style={[styles.seatIconSmall, { backgroundColor: '#E8F5E9' }]}>
                    <Ionicons name="people" size={20} color="#10B981" />
                  </View>
                  <View>
                    <Text style={styles.seatAvailabilityLabel}>Booked</Text>
                    <Text style={[styles.seatAvailabilityValue, { color: '#10B981' }]}>{totalBookedSeats}</Text>
                  </View>
                </View>
                <View style={styles.seatAvailabilityItem}>
                  <View style={[styles.seatIconSmall, { backgroundColor: '#FFF3E0' }]}>
                    <Ionicons name="person-add" size={20} color="#F59E0B" />
                  </View>
                  <View>
                    <Text style={styles.seatAvailabilityLabel}>Available</Text>
                    <Text style={[styles.seatAvailabilityValue, { color: '#F59E0B' }]}>{availableSeats}</Text>
                  </View>
                </View>
              </View>
              <View style={styles.seatProgressContainer}>
                <View style={[styles.seatProgressBar, { width: `${(totalBookedSeats / totalSeatsOffered) * 100}%` }]} />
              </View>
              <Text style={styles.seatProgressText}>{totalBookedSeats} of {totalSeatsOffered} seats booked</Text>
            </View>

            <View style={styles.cardSection}>
              <Text style={styles.sectionTitle}>Ride Preferences</Text>
              <View style={styles.tagRow}>
                {allPreferences.length > 0 ? (
                  allPreferences.map((pref, index) => <GenericPreferenceTag key={`${pref}-${index}`} label={pref} />)
                ) : (
                  <Text style={styles.emptyText}>No specific preferences added for this ride</Text>
                )}
              </View>
            </View>

            <View style={styles.cardSection}>
              <Text style={styles.sectionTitle}>Your Booking</Text>
              
              {seatModificationRequested && pendingRequestDetails && !isModificationsLocked && !isAutoCancelled && (
                <View style={styles.pendingModificationCard}>
                  <View style={styles.pendingModificationHeader}>
                    <Ionicons name="time-outline" size={24} color="#F59E0B" />
                    <Text style={styles.pendingModificationTitle}>Modification Request Pending</Text>
                  </View>
                  <View style={styles.pendingModificationDetails}>
                    <Text style={styles.pendingModificationText}>
                      Requested to change from <Text style={styles.oldSeatCount}>{pendingRequestDetails.current_seats || userBooking?.seats_requested}</Text> 
                      {' → '}
                      <Text style={styles.newSeatCount}>{pendingRequestDetails.requested_seats || pendingSeatsRequest}</Text> seat(s)
                    </Text>
                    <Text style={styles.pendingModificationSubtext}>
                      Your request has been sent to the driver. You will be notified once they respond.
                    </Text>
                  </View>
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

              {userBooking && !seatModificationRequested && !isAutoCancelled && (
                <View style={[styles.bookingInfoContainer, userBooking.status === "pending" && styles.pendingBookingContainer, userBooking.status === "rejected" && styles.rejectedBookingContainer]}>
                  {userBooking.status === "pending" ? (
                    <>
                      <Ionicons name="time-outline" size={24} color="#F59E0B" />
                      <Text style={styles.pendingBookingText}>Booking request sent for {userBooking.seats_requested} seat{userBooking.seats_requested > 1 ? 's' : ''}</Text>
                      <Text style={styles.pendingBookingSubtext}>Waiting for driver to confirm your request</Text>
                    </>
                  ) : userBooking.status === "accepted" ? (
                    <>
                      <Ionicons name="checkmark-circle" size={24} color="#10B981" />
                      <Text style={styles.bookingInfoText}>✓ Booking confirmed! You have booked {userBooking.seats_requested} seat{userBooking.seats_requested > 1 ? 's' : ''}</Text>
                      <Text style={styles.bookingInfoSubtext}>Total amount: ₹{(ride?.price || 0) * userBooking.seats_requested}</Text>
                    </>
                  ) : userBooking.status === "rejected" ? (
                    <>
                      <Ionicons name="close-circle" size={24} color="#DC2626" />
                      <Text style={styles.rejectedBookingText}>Booking request was rejected</Text>
                      <Text style={styles.rejectedBookingSubtext}>The driver could not accept your request</Text>
                    </>
                  ) : null}
                </View>
              )}

              {/* Modify Seats Section */}
              {modificationsAllowed && userBooking?.status === "accepted" && !seatModificationRequested && !isAutoCancelled && (
                <>
                  <Text style={styles.sectionSubtitle}>Modify Seats</Text>
                  
                  {otherBookedSeats > 0 && (
                    <View style={styles.otherBookedInfo}>
                      <Ionicons name="information-circle" size={14} color="#F59E0B" />
                      <Text style={styles.otherBookedInfoText}>
                        {otherBookedSeats} seat{otherBookedSeats > 1 ? 's are' : ' is'} already booked by other passengers.
                      </Text>
                    </View>
                  )}
                  
                  <View style={styles.seatSelectorRow}>
                    <TouchableOpacity 
                      style={[styles.seatActionBtn, seatsRequested === 1 && styles.seatActionBtnDisabled]} 
                      onPress={() => setSeatsRequested(Math.max(1, seatsRequested - 1))} 
                      disabled={seatsRequested === 1 || modifyingSeats}>
                      <Ionicons name="remove" size={20} color={seatsRequested === 1 ? Colors.gray : Colors.dark} />
                    </TouchableOpacity>
                    <View style={styles.seatCountWrap}>
                      <Text style={styles.seatCountText}>{seatsRequested}</Text>
                      <Text style={styles.seatAvailableText}>/ {maxUserCanRequest} max seats</Text>
                    </View>
                    <TouchableOpacity 
                      style={[styles.seatActionBtn, seatsRequested >= maxUserCanRequest && styles.seatActionBtnDisabled]} 
                      onPress={() => setSeatsRequested(Math.min(maxUserCanRequest, seatsRequested + 1))} 
                      disabled={seatsRequested >= maxUserCanRequest || modifyingSeats}>
                      <Ionicons name="add" size={20} color={seatsRequested >= maxUserCanRequest ? Colors.gray : "#2457A6"} />
                    </TouchableOpacity>
                  </View>
                  
                  <TouchableOpacity 
                    style={[styles.updateSeatsBtn, (modifyingSeats || seatsRequested === userBooking?.seats_requested) && styles.updateSeatsBtnDisabled]} 
                    onPress={handleModifySeats} 
                    disabled={modifyingSeats || seatsRequested === userBooking?.seats_requested}>
                    <Text style={styles.updateSeatsBtnText}>{modifyingSeats ? 'Sending Request...' : 'Request Seat Change'}</Text>
                  </TouchableOpacity>
                  
                  {seatsRequested !== userBooking?.seats_requested && (
                    <View style={styles.priceDifferenceContainer}>
                      <Text style={styles.priceDifferenceText}>
                        {seatsRequested > (userBooking?.seats_requested || 0) 
                          ? `+ ₹${(ride?.price || 0) * (seatsRequested - (userBooking?.seats_requested || 0))} will be charged if approved`
                          : `- ₹${(ride?.price || 0) * ((userBooking?.seats_requested || 0) - seatsRequested)} will be refunded if approved`}
                      </Text>
                      <Text style={styles.approvalNoteText}>* Changes require driver approval</Text>
                    </View>
                  )}
                </>
              )}

              {/* Cancel Booking Button */}
              {cancellationsAllowed && userBooking?.status !== "rejected" && !isAutoCancelled && (
                <TouchableOpacity style={styles.cancelBookingBtn} onPress={() => setShowCancelModal(true)} disabled={modifyingSeats}>
                  <Text style={styles.cancelBookingBtnText}>{userBooking?.status === "pending" ? "Cancel Booking Request" : "Cancel Booking"}</Text>
                </TouchableOpacity>
              )}

              {/* Pending Request Info */}
              {userBooking?.status === "pending" && rideStatus === 'upcoming' && !cancellationsAllowed && !isAutoCancelled && (
                <View style={styles.pendingRequestBox}>
                  <Ionicons name="lock-closed" size={20} color="#DC2626" />
                  <View style={styles.pendingRequestContent}>
                    <Text style={styles.pendingRequestTitle}>Cancellation Locked</Text>
                    <Text style={styles.pendingRequestText}>Cannot cancel within 15 minutes of departure</Text>
                  </View>
                </View>
              )}

              {/* Ride Cancelled Reason */}
              {ride?.cancellation_reason && (
                <View style={styles.cancelledBox}>
                  <Ionicons name="alert-circle" size={20} color="#DC2626" />
                  <Text style={styles.cancelledText}>{ride.cancellation_reason}</Text>
                </View>
              )}
            </View>

            {/* Other Riders Section */}
            <View style={styles.cardSection}>
              <Text style={styles.sectionTitle}>Other Riders {loadingRiders ? '...' : `(${otherRiders.length})`}</Text>
              {loadingRiders ? (
                <View style={styles.loadingContainer}>
                  <ActivityIndicator size="small" color={Colors.primary} />
                  <Text style={styles.loadingText}>Loading riders...</Text>
                </View>
              ) : otherRiders.length === 0 ? (
                <View style={styles.noRidersContainer}>
                  <Ionicons name="people-outline" size={40} color={Colors.gray} />
                  <Text style={styles.noRidersText}>No other riders yet</Text>
                  <Text style={styles.noRidersSubtext}>When other passengers join this ride, they'll appear here</Text>
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
                      <View style={styles.otherRiderDetails}>
                        <View style={styles.otherRiderSeatBadge}>
                          <Ionicons name="person" size={10} color="#2457A6" />
                          <Text style={styles.otherRiderSeats}>{rider.seats_booked || 1} seat{(rider.seats_booked || 1) > 1 ? 's' : ''}</Text>
                        </View>
                        <View style={styles.otherRiderStatusBadge}>
                          <View style={[styles.statusDotSmall, { backgroundColor: '#10B981' }]} />
                          <Text style={styles.otherRiderStatus}>Confirmed</Text>
                        </View>
                      </View>
                    </View>
                  </View>
                ))
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
        )}
      </Animated.View>

      {/* Cancel Booking Modal */}
      <Modal visible={showCancelModal} transparent={true} animationType="fade" onRequestClose={() => setShowCancelModal(false)}>
        <View style={styles.modalBackdrop}>
          <View style={styles.confirmModalContainer}>
            <View style={styles.confirmModalContent}>
              <View style={styles.confirmModalHeader}>
                <Ionicons name="alert-circle" size={40} color="#F59E0B" />
                <Text style={styles.confirmModalTitle}>{userBooking?.status === "pending" ? "Cancel Booking Request?" : "Cancel Booking?"}</Text>
              </View>
              <Text style={styles.confirmModalMessage}>
                {userBooking?.status === "pending" 
                  ? "Are you sure you want to cancel your booking request? The driver will be notified."
                  : "Are you sure you want to cancel your booking for this ride? This action cannot be undone."}
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
  mapContainer: { width: '100%', overflow: 'hidden', backgroundColor: '#E8EEF7' },
  map: { flex: 1, backgroundColor: '#E8EEF7' },
  mapBackButton: { position: 'absolute', top: Platform.OS === 'ios' ? 54 : 22, left: 14, width: 42, height: 42, borderRadius: 25, backgroundColor: 'rgba(255,255,255,0.96)', alignItems: 'center', justifyContent: 'center' },
  liveTrackingButton: { position: 'absolute', bottom: 20, left: 20, right: 20, backgroundColor: '#10B981', flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 14, borderRadius: 12, gap: 8, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.25, shadowRadius: 4, elevation: 5 },
  liveTrackingActiveButton: { backgroundColor: '#DC2626' },
  liveTrackingButtonText: { color: '#fff', fontWeight: '700', fontSize: 14 },
  liveDot: { width: 10, height: 10, borderRadius: 5, backgroundColor: '#fff', marginRight: 6 },
  markerWrapper: { alignItems: 'center' },
  pinBubble: { width: 28, height: 28, borderRadius: 14, borderWidth: 3, borderColor: 'white', alignItems: 'center', justifyContent: 'center', shadowColor: '#000', shadowOffset: { width: 0, height: 3 }, shadowOpacity: 0.25, shadowRadius: 4, elevation: 5 },
  pinPointer: { width: 0, height: 0, backgroundColor: 'transparent', borderStyle: 'solid', borderLeftWidth: 7, borderRightWidth: 7, borderTopWidth: 10, borderLeftColor: 'transparent', borderRightColor: 'transparent', marginTop: -2 },
  pinIcon: { fontSize: 14, fontWeight: '800', color: 'white', textAlign: 'center', lineHeight: 18 },
  pinLabelBubbleYellow: { backgroundColor: 'rgba(113, 63, 18, 0.9)', borderRadius: 8, paddingHorizontal: 8, paddingVertical: 3, marginTop: 4 },
  pinLabelTextYellow: { color: '#FACC15', fontSize: 10, fontWeight: '700' },
  driverLiveMarker: { alignItems: 'center', justifyContent: 'center' },
  driverLiveDot: { position: 'absolute', width: 40, height: 40, borderRadius: 20, backgroundColor: 'rgba(36, 87, 166, 0.2)' },
  driverLivePulse: { position: 'absolute', width: 60, height: 60, borderRadius: 30, backgroundColor: 'rgba(36, 87, 166, 0.1)' },
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
  statusBannerText: { fontSize: 13, fontWeight: '700', flex: 1 },
  modificationsLockedBanner: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#FEF2F2', padding: 12, borderRadius: 12, marginBottom: 14, gap: 8, borderWidth: 1, borderColor: '#FEE2E2' },
  modificationsLockedText: { fontSize: 12, color: '#DC2626', flex: 1 },
  autoCancelledBanner: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#FEF2F2', padding: 12, borderRadius: 12, marginBottom: 14, gap: 8, borderWidth: 1, borderColor: '#FEE2E2' },
  autoCancelledText: { fontSize: 12, color: '#DC2626', flex: 1 },
  modificationBanner: { backgroundColor: '#FFFBEB', borderWidth: 1, borderColor: '#FDE68A', borderRadius: 12, marginHorizontal: 16, marginBottom: 14, padding: 12 },
  modificationBannerContent: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  modificationBannerTextContainer: { flex: 1 },
  modificationBannerTitle: { fontSize: 14, fontWeight: '700', color: '#92400E', marginBottom: 2 },
  modificationBannerText: { fontSize: 13, color: '#B45309', marginBottom: 2 },
  modificationBannerSubtext: { fontSize: 11, color: '#B45309', opacity: 0.8 },
  driverCard: { backgroundColor: 'white', borderRadius: 20, padding: 16, marginBottom: 14, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 8, elevation: 2 },
  driverTopRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  driverLeftWrap: { flexDirection: 'row', flex: 1, paddingRight: 10 },
  driverAvatar: { width: 56, height: 56, borderRadius: 28, backgroundColor: '#E5E7EB', overflow: 'hidden', alignItems: 'center', justifyContent: 'center', marginRight: 12 },
  avatarImg: { width: 56, height: 56, borderRadius: 28, resizeMode: 'cover' },
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
  sectionSubtitle: { fontSize: 14, fontWeight: '600', color: Colors.dark, marginBottom: 12, marginTop: 8 },
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
  seatAvailabilityContainer: { flexDirection: 'row', justifyContent: 'space-around', marginBottom: 16 },
  seatAvailabilityItem: { alignItems: 'center', gap: 8 },
  seatIconSmall: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center' },
  seatAvailabilityLabel: { fontSize: 12, color: Colors.gray, textAlign: 'center' },
  seatAvailabilityValue: { fontSize: 18, fontWeight: '800', color: Colors.dark, textAlign: 'center' },
  seatProgressContainer: { height: 6, backgroundColor: '#E5E7EB', borderRadius: 3, overflow: 'hidden', marginBottom: 8 },
  seatProgressBar: { height: '100%', backgroundColor: '#10B981', borderRadius: 3 },
  seatProgressText: { fontSize: 12, color: Colors.gray, textAlign: 'center' },
  tagRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 14 },
  preferenceTag: { paddingHorizontal: 12, paddingVertical: 8, borderRadius: 999, backgroundColor: '#FFF3E8' },
  preferenceTagText: { fontSize: 12, color: '#C65D00', fontWeight: '700' },
  emptyText: { fontSize: 13, color: Colors.gray, fontWeight: '600' },
  bookingInfoContainer: { borderRadius: 12, padding: 16, marginBottom: 16, alignItems: 'center', gap: 8 },
  pendingBookingContainer: { backgroundColor: '#FFFBEB', borderWidth: 1, borderColor: '#FDE68A' },
  rejectedBookingContainer: { backgroundColor: '#FEF2F2', borderWidth: 1, borderColor: '#FEE2E2' },
  bookingInfoText: { fontSize: 14, fontWeight: '600', color: '#166534', textAlign: 'center' },
  bookingInfoSubtext: { fontSize: 12, color: Colors.gray, textAlign: 'center', marginTop: 4 },
  pendingBookingText: { fontSize: 14, fontWeight: '600', color: '#92400E', textAlign: 'center' },
  pendingBookingSubtext: { fontSize: 12, color: '#B45309', textAlign: 'center', marginTop: 4 },
  rejectedBookingText: { fontSize: 14, fontWeight: '600', color: '#DC2626', textAlign: 'center' },
  rejectedBookingSubtext: { fontSize: 12, color: '#DC2626', textAlign: 'center', marginTop: 4 },
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
  priceDifferenceContainer: { marginTop: 12, padding: 10, backgroundColor: '#EFF6FF', borderRadius: 8, alignItems: 'center' },
  priceDifferenceText: { fontSize: 12, color: '#2457A6', fontWeight: '600' },
  approvalNoteText: { fontSize: 10, color: '#6B7280', marginTop: 4 },
  pendingModificationCard: { backgroundColor: '#FFFBEB', borderRadius: 16, padding: 16, marginBottom: 16, borderWidth: 1, borderColor: '#FDE68A' },
  pendingModificationHeader: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 12 },
  pendingModificationTitle: { fontSize: 16, fontWeight: '700', color: '#92400E' },
  pendingModificationDetails: { marginBottom: 16 },
  pendingModificationText: { fontSize: 14, color: '#B45309', marginBottom: 8, textAlign: 'center' },
  pendingModificationSubtext: { fontSize: 12, color: '#B45309', textAlign: 'center' },
  oldSeatCount: { textDecorationLine: 'line-through', fontWeight: '700', color: '#DC2626' },
  newSeatCount: { fontWeight: '700', color: '#10B981' },
  cancelRequestButton: { backgroundColor: '#FEF2F2', paddingVertical: 10, borderRadius: 8, borderWidth: 1, borderColor: '#EF4444', alignItems: 'center' },
  cancelRequestButtonText: { color: '#EF4444', fontWeight: '600', fontSize: 14 },
  cancelBookingBtn: { marginTop: 12, backgroundColor: '#FEF2F2', paddingVertical: 12, borderRadius: 12, alignItems: 'center', borderWidth: 1, borderColor: '#EF4444' },
  cancelBookingBtnText: { color: '#EF4444', fontWeight: '700', fontSize: 14 },
  pendingRequestBox: { flexDirection: 'row', alignItems: 'flex-start', backgroundColor: '#FEF2F2', borderWidth: 1, borderColor: '#FEE2E2', borderRadius: 12, padding: 12, gap: 12, marginTop: 12 },
  pendingRequestContent: { flex: 1 },
  pendingRequestTitle: { fontSize: 14, fontWeight: '700', color: '#DC2626', marginBottom: 4 },
  pendingRequestText: { fontSize: 12, color: '#DC2626', lineHeight: 16 },
  cancelledBox: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#FEF2F2', borderRadius: 12, padding: 12, gap: 8, borderWidth: 1, borderColor: '#FEE2E2' },
  cancelledText: { fontSize: 12, color: '#DC2626', flex: 1 },
  loadingContainer: { alignItems: 'center', padding: 20, gap: 10 },
  loadingText: { fontSize: 12, color: Colors.gray },
  noRidersContainer: { alignItems: 'center', padding: 30, gap: 10 },
  noRidersText: { fontSize: 14, fontWeight: '600', color: Colors.gray },
  noRidersSubtext: { fontSize: 12, color: Colors.gray, textAlign: 'center' },
  otherRiderItem: { flexDirection: 'row', alignItems: 'center', paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: '#EEF2F7' },
  otherRiderAvatar: { width: 44, height: 44, borderRadius: 22, backgroundColor: '#E5E7EB', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', marginRight: 12 },
  otherRiderAvatarImg: { width: 44, height: 44, borderRadius: 22, resizeMode: 'cover' },
  otherRiderAvatarPlaceholder: { width: 44, height: 44, borderRadius: 22, backgroundColor: '#E5E7EB', alignItems: 'center', justifyContent: 'center' },
  otherRiderAvatarText: { fontSize: 16, fontWeight: '700', color: Colors.primary },
  otherRiderInfo: { flex: 1 },
  otherRiderName: { fontSize: 15, fontWeight: '600', color: Colors.dark, marginBottom: 4 },
  otherRiderDetails: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  otherRiderSeatBadge: { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: '#EAF1FF', paddingHorizontal: 8, paddingVertical: 3, borderRadius: 12 },
  otherRiderSeats: { fontSize: 11, color: '#2457A6', fontWeight: '600' },
  otherRiderStatusBadge: { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: '#F3F4F6', paddingHorizontal: 8, paddingVertical: 3, borderRadius: 12 },
  otherRiderStatus: { fontSize: 10, color: Colors.gray, fontWeight: '500' },
  statusDotSmall: { width: 6, height: 6, borderRadius: 3 },
  simpleInfoLeft: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  safetyCard: { backgroundColor: '#FFF3E7', borderRadius: 18, padding: 16, marginBottom: 14 },
  safetyTitle: { fontSize: 14, color: '#2457A6', fontWeight: '800' },
  safetySub: { marginTop: 2, fontSize: 12, color: '#2457A6', opacity: 0.9, fontWeight: '600' },
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
  fullProfileImage: { width: '100%', height: 400, backgroundColor: '#F5F5F5', resizeMode: 'contain' },
  modalSvgContainer: { width: '100%', height: 400, backgroundColor: '#F5F5F5', alignItems: 'center', justifyContent: 'center' },
  noImageContainer: { width: '100%', height: 400, justifyContent: 'center', alignItems: 'center', backgroundColor: '#F5F5F5' },
  noImageText: { fontSize: 16, color: Colors.gray },
});

