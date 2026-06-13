// // // import React, { useMemo, useRef, useState, useEffect, useCallback } from 'react';
// // // import {
// // //   View,
// // //   Text,
// // //   StyleSheet,
// // //   TouchableOpacity,
// // //   ScrollView,
// // //   Platform,
// // //   StatusBar,
// // //   Image,
// // //   Dimensions,
// // //   Animated,
// // //   PanResponder,
// // //   Modal,
// // //   ActivityIndicator,
// // //   LogBox,
// // //   TextInput,
// // //   Alert,
// // //   Linking
// // // } from 'react-native';
// // // import MapView, { Marker, Polyline, PROVIDER_GOOGLE, Circle } from 'react-native-maps';
// // // import { Ionicons } from '@expo/vector-icons';
// // // import { SvgCssUri } from 'react-native-svg/css';
// // // import { Colors } from '../constants/Colors';
// // // import { useAuth } from '../context/AuthContext';
// // // import { API_BASE_URL, GMAP_API_KEY } from '../config/config_ip';
// // // import CustomAlert from '../components/CustomAlert';
// // // import { useFocusEffect } from '@react-navigation/native';
// // // import io from 'socket.io-client';

// // // LogBox.ignoreLogs([
// // //   'Accessibility: View',
// // //   'Property accessibilityState',
// // //   'RCTView',
// // // ]);

// // // const { height, width } = Dimensions.get('window');
// // // const SAFE_TOP = Platform.OS === 'ios' ? 56 : 24;
// // // const COLLAPSED_HEIGHT = 84;
// // // const EXPANDED_HEIGHT = height * 0.72;

// // // function buildImageUrl(url) {
// // //   if (!url) return null;
// // //   if (url.startsWith('http://') || url.startsWith('https://')) return url;
// // //   return `${API_BASE_URL}${url.startsWith('/') ? '' : '/'}${url}`;
// // // }

// // // function getInitials(name) {
// // //   if (!name) return 'D';
// // //   const parts = name.trim().split(' ').filter(Boolean);
// // //   if (parts.length > 1) return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
// // //   return parts[0].slice(0, 2).toUpperCase();
// // // }

// // // function isSvgUrl(url) {
// // //   if (!url) return false;
// // //   return url.toLowerCase().includes('.svg') || url.toLowerCase().includes('.svg?');
// // // }

// // // function parseRouteCoordinates(routeCoordinates) {
// // //   if (!routeCoordinates) return [];
// // //   if (!Array.isArray(routeCoordinates)) return [];
// // //   if (routeCoordinates.length === 0) return [];
  
// // //   return routeCoordinates.map((item) => {
// // //     if (Array.isArray(item) && item.length === 2) {
// // //       const lng = Number(item[0]);
// // //       const lat = Number(item[1]);
// // //       if (!isNaN(lng) && !isNaN(lat)) {
// // //         return { longitude: lng, latitude: lat };
// // //       }
// // //     }
// // //     if (item && typeof item === 'object') {
// // //       const lng = Number(item.longitude || item.lng);
// // //       const lat = Number(item.latitude || item.lat);
// // //       if (!isNaN(lng) && !isNaN(lat)) {
// // //         return { longitude: lng, latitude: lat };
// // //       }
// // //     }
// // //     return null;
// // //   }).filter(Boolean);
// // // }

// // // function ProfileImageModal({ visible, imageUrl, name, onClose }) {
// // //   const [imageError, setImageError] = useState(false);
// // //   const isSvg = imageUrl ? isSvgUrl(imageUrl) : false;
  
// // //   useEffect(() => {
// // //     if (visible) {
// // //       setImageError(false);
// // //     }
// // //   }, [visible, imageUrl]);
  
// // //   if (!visible) return null;
  
// // //   return (
// // //     <Modal visible={visible} transparent={true} animationType="fade" onRequestClose={onClose}>
// // //       <TouchableOpacity style={styles.modalBackdrop} activeOpacity={1} onPress={onClose}>
// // //         <View style={styles.imageModalContainer}>
// // //           <View style={styles.imageModalContent}>
// // //             <View style={styles.imageModalHeader}>
// // //               <Text style={styles.imageModalTitle}>{name || 'Profile'}</Text>
// // //               <TouchableOpacity onPress={onClose}>
// // //                 <Ionicons name="close" size={24} color={Colors.dark} />
// // //               </TouchableOpacity>
// // //             </View>
// // //             {imageUrl && !imageError ? (
// // //               isSvg ? (
// // //                 <View style={styles.modalSvgContainer}>
// // //                   <SvgCssUri uri={imageUrl} width="100%" height={400} />
// // //                 </View>
// // //               ) : (
// // //                 <Image 
// // //                   source={{ uri: imageUrl }} 
// // //                   style={styles.fullProfileImage} 
// // //                   resizeMode="contain"
// // //                   onError={() => setImageError(true)}
// // //                 />
// // //               )
// // //             ) : (
// // //               <View style={styles.noImageContainer}>
// // //                 <Ionicons name="person-circle-outline" size={80} color={Colors.gray} />
// // //                 <Text style={styles.noImageText}>No profile picture available</Text>
// // //               </View>
// // //             )}
// // //           </View>
// // //         </View>
// // //       </TouchableOpacity>
// // //     </Modal>
// // //   );
// // // }

// // // export default function ViewRoutePostedScreen({ navigation, route }) {
// // //   const { user } = useAuth();
// // //   const { ride } = route.params || {};

// // //   const [drawerExpanded, setDrawerExpanded] = useState(true);
// // //   const [mapReady, setMapReady] = useState(false);
// // //   const [bookings, setBookings] = useState([]);
// // //   const [loadingBookings, setLoadingBookings] = useState(false);
// // //   const [pendingModifications, setPendingModifications] = useState([]);
// // //   const [refreshKey, setRefreshKey] = useState(0);
// // //   const [pollingInterval, setPollingInterval] = useState(null);
// // //   const [modifyingRequest, setModifyingRequest] = useState(false);
// // //   const [ratingModalVisible, setRatingModalVisible] = useState(false);
// // //   const [selectedRider, setSelectedRider] = useState(null);
// // //   const [rating, setRating] = useState(0);
// // //   const [feedback, setFeedback] = useState('');
// // //   const [currentSessionId, setCurrentSessionId] = useState(null);
// // //   const [conflictModalVisible, setConflictModalVisible] = useState(false);
// // //   const [conflictData, setConflictData] = useState(null);
// // //   const [resolvingConflict, setResolvingConflict] = useState(false);
// // //   const [totalEarnings, setTotalEarnings] = useState(0);
// // //   const [showCompletionBanner, setShowCompletionBanner] = useState(false);
// // //   const [timelineExpanded, setTimelineExpanded] = useState(false);
// // //   const [selectedStopIndex, setSelectedStopIndex] = useState(null);
  
// // //   // Address geocoding states
// // //   const [addressCache, setAddressCache] = useState({});
// // //   const [loadingAddresses, setLoadingAddresses] = useState(false);
// // //   const [addressFetchProgress, setAddressFetchProgress] = useState({ current: 0, total: 0 });
  
// // //   const animatedDrawer = useRef(new Animated.Value(1)).current;
// // //   const mapRef = useRef(null);
// // //   const socketRef = useRef(null);
// // //   const scrollViewRef = useRef(null);
  
// // //   const [selectedProfile, setSelectedProfile] = useState({
// // //     visible: false,
// // //     imageUrl: null,
// // //     name: '',
// // //   });
  
// // // const formatDate = (dateString) => {
// // //   if (!dateString) return 'Date not set';
// // //   const date = new Date(dateString);
// // //   const today = new Date();
// // //   const tomorrow = new Date(today);
// // //   tomorrow.setDate(tomorrow.getDate() + 1);
// // //   const isToday = date.toDateString() === today.toDateString();
// // //   const isTomorrow = date.toDateString() === tomorrow.toDateString();
// // //   let dayText = "";
// // //   if (isToday) dayText = "Today";
// // //   else if (isTomorrow) dayText = "Tomorrow";
// // //   else dayText = date.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" });
// // //   const timeText = date.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", hour12: false });
// // //   return `${dayText}, ${timeText}`;
// // // };
// // //   const [alertVisible, setAlertVisible] = useState(false);
// // //   const [alertConfig, setAlertConfig] = useState({
// // //     title: "",
// // //     message: "",
// // //     icon: "check-circle",
// // //     iconColor: "#10B981",
// // //     buttons: []
// // //   });

// // //   const showCustomAlert = (title, message, type = 'success') => {
// // //     let icon = "check-circle";
// // //     let iconColor = "#10B981";
// // //     if (type === 'error') { icon = "error"; iconColor = "#EF4444"; }
// // //     else if (type === 'warning') { icon = "warning"; iconColor = "#F59E0B"; }
// // //     else if (type === 'info') { icon = "info"; iconColor = Colors.primary; }
// // //     setAlertConfig({ title, message, icon, iconColor, buttons: [{ text: 'OK', onPress: () => setAlertVisible(false) }] });
// // //     setAlertVisible(true);
// // //   };

// // //   const showConfirmationAlert = (title, message, onConfirm) => {
// // //     setAlertConfig({
// // //       title,
// // //       message,
// // //       icon: "warning",
// // //       iconColor: "#F59E0B",
// // //       buttons: [
// // //         { text: 'Cancel', onPress: () => setAlertVisible(false), style: 'cancel' },
// // //         { text: 'Confirm', onPress: () => { setAlertVisible(false); onConfirm(); }, style: 'destructive' }
// // //       ]
// // //     });
// // //     setAlertVisible(true);
// // //   };
// // // // Add these helper functions to calculate actual booked seats
// // // const getActualBookedSeats = useCallback(() => {
// // //   if (!bookings || !Array.isArray(bookings)) return 0;
  
// // //   // Only count active bookings (accepted and not cancelled)
// // //   const activeBookings = bookings.filter(bookingItem => {
// // //     // Skip if booking is cancelled
// // //     if (bookingItem.status === 'cancelled') return false;
    
// // //     // Skip if booking is rejected
// // //     if (bookingItem.status === 'rejected') return false;
    
// // //     // For modification requests that were rejected, the original booking remains active
// // //     // Only count accepted bookings
// // //     return bookingItem.status === 'accepted';
// // //   });
  
// // //   // Sum up seats from active bookings
// // //   const totalBooked = activeBookings.reduce((sum, bookingItem) => {
// // //     return sum + (bookingItem.seats_booked || bookingItem.seats_requested || 0);
// // //   }, 0);
  
// // //   return totalBooked;
// // // }, [bookings]);

// // // const getActualAvailableSeats = useCallback(() => {
// // //   const totalSeats = ride?.available_seats || 0;
// // //   const bookedSeats = getActualBookedSeats();
// // //   return Math.max(0, totalSeats - bookedSeats);
// // // }, [ride?.available_seats, getActualBookedSeats]);
// // //   const fetchBookings = useCallback(async () => {
// // //     if (!ride?.id) return;
// // //     setLoadingBookings(true);
// // //     try {
// // //       const response = await fetch(`${API_BASE_URL}/ride/${ride.id}/passengers?_t=${Date.now()}`);
// // //       const data = await response.json();
      
// // //       if (data.passengers && Array.isArray(data.passengers)) {
// // //         const processedPassengers = data.passengers.map(passenger => ({
// // //           ...passenger,
// // //           driver_rating_given: passenger.driver_rating_given === true || passenger.driver_rating_given === 1,
// // //           driver_rating: passenger.driver_rating || 0,
// // //           driver_feedback: passenger.driver_feedback || '',
// // //         }));
        
// // //         setBookings(processedPassengers);
        
// // //         if (ride?.status === "completed" || ride?.completed_at) {
// // //           const earnings = processedPassengers
// // //             .filter(p => p.status === 'accepted')
// // //             .reduce((sum, p) => sum + (p.total_amount || p.seats_booked * (ride?.price_per_seat || 0)), 0);
// // //           setTotalEarnings(earnings);
// // //         }
// // //       } else {
// // //         setBookings([]);
// // //       }
// // //     } catch (error) {
// // //       console.log('Error fetching bookings:', error);
// // //       setBookings([]);
// // //     } finally {
// // //       setLoadingBookings(false);
// // //     }
// // //   }, [ride?.id, ride?.status, ride?.price_per_seat]);

// // //   // Google Maps Geocoding Function
// // //   const getAddressFromCoordsGoogle = async (lat, lng) => {
// // //     const cacheKey = `${lat},${lng}`;
    
// // //     if (addressCache[cacheKey]) {
// // //       return addressCache[cacheKey];
// // //     }
    
// // //     try {
// // //       const url = `https://maps.googleapis.com/maps/api/geocode/json?latlng=${lat},${lng}&key=${GMAP_API_KEY}&language=en`;
// // //       const response = await fetch(url);
// // //       const data = await response.json();
      
// // //       if (data.status === 'OK' && data.results && data.results[0]) {
// // //         const formattedAddress = data.results[0].formatted_address;
// // //         setAddressCache(prev => ({ ...prev, [cacheKey]: formattedAddress }));
// // //         return formattedAddress;
// // //       } else {
// // //         return `${lat.toFixed(4)}, ${lng.toFixed(4)}`;
// // //       }
// // //     } catch (error) {
// // //       console.log('Geocoding error:', error);
// // //       return `${lat.toFixed(4)}, ${lng.toFixed(4)}`;
// // //     }
// // //   };

// // //   // Fetch addresses for all bookings
// // //   const fetchAllAddresses = useCallback(async () => {
// // //     const confirmedBookings = bookings.filter(b => b.status === 'accepted');
// // //     if (confirmedBookings.length === 0) return;
    
// // //     const coordinatesToFetch = [];
    
// // //     confirmedBookings.forEach(booking => {
// // //       const pickupLat = booking.intersection_pickup_lat || booking.pickup_lat;
// // //       const pickupLon = booking.intersection_pickup_lon || booking.pickup_lon;
// // //       if (pickupLat && pickupLon) {
// // //         const key = `${pickupLat},${pickupLon}`;
// // //         if (!addressCache[key] && !coordinatesToFetch.find(c => c.key === key)) {
// // //           coordinatesToFetch.push({ key, lat: pickupLat, lng: pickupLon, type: 'pickup', bookingId: booking.booking_id, riderName: booking.passenger_name });
// // //         }
// // //       }
      
// // //       const dropLat = booking.intersection_drop_lat || booking.drop_lat;
// // //       const dropLon = booking.intersection_drop_lon || booking.drop_lon;
// // //       if (dropLat && dropLon) {
// // //         const key = `${dropLat},${dropLon}`;
// // //         if (!addressCache[key] && !coordinatesToFetch.find(c => c.key === key)) {
// // //           coordinatesToFetch.push({ key, lat: dropLat, lng: dropLon, type: 'dropoff', bookingId: booking.booking_id, riderName: booking.passenger_name });
// // //         }
// // //       }
// // //     });
    
// // //     if (coordinatesToFetch.length === 0) return;
    
// // //     setLoadingAddresses(true);
// // //     setAddressFetchProgress({ current: 0, total: coordinatesToFetch.length });
    
// // //     const batchSize = 5;
// // //     for (let i = 0; i < coordinatesToFetch.length; i += batchSize) {
// // //       const batch = coordinatesToFetch.slice(i, i + batchSize);
// // //       await Promise.all(batch.map(async (coord) => {
// // //         const address = await getAddressFromCoordsGoogle(coord.lat, coord.lng);
// // //         setAddressFetchProgress(prev => ({ ...prev, current: prev.current + 1 }));
// // //         return address;
// // //       }));
      
// // //       if (i + batchSize < coordinatesToFetch.length) {
// // //         await new Promise(resolve => setTimeout(resolve, 200));
// // //       }
// // //     }
    
// // //     setLoadingAddresses(false);
// // //   }, [bookings, addressCache]);

// // //   useEffect(() => {
// // //     if (bookings.length > 0) {
// // //       fetchAllAddresses();
// // //     }
// // //   }, [bookings, fetchAllAddresses]);

// // //   const fetchPendingModifications = useCallback(async () => {
// // //     if (!ride?.id) return;
// // //     try {
// // //       const response = await fetch(`${API_BASE_URL}/ride/${ride.id}/pending-modifications?_t=${Date.now()}`);
// // //       const data = await response.json();
      
// // //       if (data.pending_requests && Array.isArray(data.pending_requests)) {
// // //         const latestPerBooking = new Map();
        
// // //         data.pending_requests.forEach(request => {
// // //           const bookingId = request.booking_id;
// // //           const existing = latestPerBooking.get(bookingId);
          
// // //           if (!existing || new Date(request.created_at) > new Date(existing.created_at)) {
// // //             latestPerBooking.set(bookingId, request);
// // //           }
// // //         });
        
// // //         const uniqueRequests = Array.from(latestPerBooking.values());
// // //         setPendingModifications(uniqueRequests);
        
// // //         if (uniqueRequests.length > 0 && !drawerExpanded) {
// // //           setDrawerExpanded(true);
// // //         }
// // //       } else {
// // //         setPendingModifications([]);
// // //       }
// // //     } catch (error) {
// // //       console.log('Error fetching pending modifications:', error);
// // //       setPendingModifications([]);
// // //     }
// // //   }, [ride?.id, drawerExpanded]);

// // //   const checkForConcurrentRequests = useCallback(async () => {
// // //     if (!ride?.id) return;
// // //     try {
// // //       const response = await fetch(`${API_BASE_URL}/ride/${ride.id}/concurrent-requests?_t=${Date.now()}`);
// // //       const data = await response.json();
      
// // //       if (data.has_concurrent_requests) {
// // //         setConflictData(data);
// // //         setConflictModalVisible(true);
// // //       }
// // //     } catch (error) {
// // //       console.log('Error checking concurrent requests:', error);
// // //     }
// // //   }, [ride?.id]);

// // //   const resolveConcurrentRequest = async (choice, modificationRequestId, bookingId) => {
// // //     if (!conflictData) return;
    
// // //     setResolvingConflict(true);
// // //     try {
// // //       const response = await fetch(`${API_BASE_URL}/ride/${conflictData.ride.id}/resolve-concurrent-requests`, {
// // //         method: 'POST',
// // //         headers: { 'Content-Type': 'application/json' },
// // //         body: JSON.stringify({
// // //           choice: choice,
// // //           modification_request_id: modificationRequestId,
// // //           booking_id: bookingId,
// // //           driver_phone: user?.phone_number
// // //         })
// // //       });
      
// // //       const data = await response.json();
      
// // //       if (data.success) {
// // //         showCustomAlert('Success', data.message, 'success');
// // //         setConflictModalVisible(false);
// // //         fetchBookings();
// // //         fetchPendingModifications();
// // //       } else {
// // //         showCustomAlert('Error', data.message || 'Failed to process request', 'error');
// // //         fetchBookings();
// // //         fetchPendingModifications();
// // //       }
// // //     } catch (error) {
// // //       console.error('Resolve concurrent request error:', error);
// // //       showCustomAlert('Error', 'Failed to resolve concurrent requests', 'error');
// // //       fetchBookings();
// // //       fetchPendingModifications();
// // //     } finally {
// // //       setResolvingConflict(false);
// // //     }
// // //   };

// // //   const areModificationsLocked = () => {
// // //     const now = new Date();
// // //     const departureTime = new Date(ride?.departure_time);
// // //     const minutesToDeparture = (departureTime - now) / (1000 * 60);
// // //     return minutesToDeparture <= 15 && minutesToDeparture > -30 && !ride?.started_at;
// // //   };

// // //   // Enhanced ride status display with proper cancellation reasons
// // //   const getRideStatusDisplay = () => {
// // //     const now = new Date();
// // //     const departureTime = new Date(ride?.departure_time);
// // //     const minutesToDeparture = (departureTime - now) / (1000 * 60);
// // //     const minutesSinceDeparture = (now - departureTime) / (1000 * 60);
// // //     const hoursSinceDeparture = (now - departureTime) / (1000 * 60 * 60);
    
// // //     // Check for cancellation first
// // //     if (ride?.cancellation_reason) {
// // //       if (ride.cancellation_reason.includes("Auto-cancelled") || ride.cancellation_reason.includes("auto-cancel")) {
// // //         return { 
// // //           text: "Auto-cancelled", 
// // //           color: "#9CA3AF", 
// // //           icon: "timer-off", 
// // //           type: "auto-cancelled",
// // //           reason: ride.cancellation_reason || "Ride was automatically cancelled as it was not started within 2 hours of departure time."
// // //         };
// // //       }
// // //       return { 
// // //         text: "Cancelled", 
// // //         color: "#DC2626", 
// // //         icon: "close-circle", 
// // //         type: "cancelled",
// // //         reason: ride.cancellation_reason
// // //       };
// // //     }
    
// // //     // Check for auto-cancel after 2 hours past departure
// // //     if (hoursSinceDeparture > 2 && !ride?.started_at && ride?.status !== "completed") {
// // //       return { 
// // //         text: "Auto-cancelled", 
// // //         color: "#9CA3AF", 
// // //         icon: "timer-off", 
// // //         type: "auto-cancelled",
// // //         reason: "Ride auto-cancelled as it was not started within 2 hours of departure time."
// // //       };
// // //     }
    
// // //     if (ride?.status === "completed" || ride?.completed_at) {
// // //       return { text: "Completed", color: "#6B7280", icon: "checkmark-done", type: "completed" };
// // //     }
    
// // //     if (ride?.started_at && ride?.status !== "completed") {
// // //       return { text: "Ongoing", color: "#10B981", icon: "car-sport", type: "ongoing" };
// // //     }
    
// // //     if (minutesSinceDeparture > 0 && minutesSinceDeparture <= 120) {
// // //       return { text: "Late - Start Now", color: "#EF4444", icon: "alert-circle", type: "late" };
// // //     }
    
// // //     if (minutesToDeparture <= 60 && minutesToDeparture > 15) {
// // //       return { text: "Start Soon", color: "#F59E0B", icon: "time-outline", type: "start-soon" };
// // //     }
    
// // //     if (minutesToDeparture <= 15 && minutesToDeparture > 0) {
// // //       return { text: "Active", color: "#10B981", icon: "checkmark-circle", type: "active" };
// // //     }
    
// // //     if (minutesToDeparture > 60) {
// // //       return { text: "Upcoming", color: "#2457A6", icon: "calendar-outline", type: "upcoming" };
// // //     }
    
// // //     return { text: "Upcoming", color: "#2457A6", icon: "calendar-outline", type: "upcoming" };
// // //   };

// // //   // Socket connection setup
// // //   useEffect(() => {
// // //     if (!ride?.id) return;
    
// // //     const socket = io(API_BASE_URL, {
// // //       transports: ['websocket', 'polling'],
// // //       reconnection: true,
// // //       reconnectionAttempts: 10,
// // //       reconnectionDelay: 1000,
// // //       timeout: 10000,
// // //       path: '/socket.io'
// // //     });
    
// // //     socketRef.current = socket;
    
// // //     socket.on('connect', () => {
// // //       console.log('Socket connected for driver ride updates');
// // //       socket.emit('join-ride-room', ride.id);
      
// // //       if (user?.phone_number) {
// // //         socket.emit('join-user-room', user.phone_number);
// // //       }
// // //     });
    
// // //     socket.on('connect_error', (error) => {
// // //       console.log('Socket connection error:', error.message);
// // //     });
    
// // //     socket.on('disconnect', (reason) => {
// // //       console.log('Socket disconnected:', reason);
// // //       if (reason === 'io server disconnect') {
// // //         setTimeout(() => {
// // //           if (socketRef.current) {
// // //             socketRef.current.connect();
// // //           }
// // //         }, 1000);
// // //       }
// // //     });
    
// // //     socket.on('reconnect', () => {
// // //       console.log('Socket reconnected');
// // //       if (ride?.id) {
// // //         socket.emit('join-ride-room', ride.id);
// // //       }
// // //     });
    
// // //     socket.on('new-modification-request', (data) => {
// // //       console.log('New modification request received:', data);
// // //       if (data.ride_id === ride.id) {
// // //         showCustomAlert('New Modification Request', `${data.passenger_name} wants to change from ${data.current_seats} to ${data.requested_seats} seat(s)`, 'info');
// // //         fetchPendingModifications();
// // //         fetchBookings();
// // //         checkForConcurrentRequests();
// // //       }
// // //     });
    
// // //     socket.on('modification-response', (data) => {
// // //       console.log('Modification response received:', data);
// // //       if (data.ride_id === ride.id) {
// // //         if (data.action === 'approved') {
// // //           showCustomAlert('Modification Approved', `You approved seat change for ${data.passenger_name || 'passenger'}`, 'success');
// // //         } else {
// // //           showCustomAlert('Modification Rejected', `You rejected seat change request`, 'warning');
// // //         }
// // //         fetchPendingModifications();
// // //         fetchBookings();
// // //       }
// // //     });
    
// // //     socket.on('booking-update', (data) => {
// // //       console.log('Booking update received:', data);
// // //       if (data.ride_id === ride.id) {
// // //         fetchBookings();
// // //         checkForConcurrentRequests();
// // //       }
// // //     });
    
// // //     socket.on('rider-reached-pickup', (data) => {
// // //       console.log('Rider reached pickup:', data);
// // //       showCustomAlert('Rider Arrived', `${data.rider_name || 'A rider'} has reached the pickup location`, 'info');
// // //     });
    
// // //     socket.on('rider-boarded', (data) => {
// // //       console.log('Rider boarded:', data);
// // //       showCustomAlert('Rider Boarded', `${data.rider_name || 'A rider'} has boarded the vehicle`, 'success');
// // //       fetchBookings();
// // //     });
    
// // //     socket.on('rider-dropped-off', (data) => {
// // //       console.log('Rider dropped off:', data);
// // //       showCustomAlert('Rider Dropped Off', `${data.rider_name || 'A rider'} has been dropped off`, 'info');
// // //       fetchBookings();
// // //     });
    
// // //     socket.on('concurrent-requests-detected', (data) => {
// // //       console.log('Concurrent requests detected:', data);
// // //       if (data.ride_id === ride.id) {
// // //         checkForConcurrentRequests();
// // //       }
// // //     });
    
// // //     socket.on('ride-completed', (data) => {
// // //       console.log('Ride completed event:', data);
// // //       if (data.ride_id === ride.id) {
// // //         setShowCompletionBanner(true);
// // //         showCustomAlert('Ride Completed', 'This ride has been successfully completed!', 'success');
// // //         fetchBookings();
// // //         setTimeout(() => {
// // //           setShowCompletionBanner(false);
// // //         }, 5000);
// // //       }
// // //     });
    
// // //     socket.on('ride-auto-cancelled', (data) => {
// // //       console.log('Ride auto-cancelled event:', data);
// // //       if (data.ride_id === ride.id) {
// // //         const reason = data.reason || "Ride was auto-cancelled as it was not started within 2 hours of departure time.";
// // //         showCustomAlert('Ride Auto-Cancelled', reason, 'warning');
// // //         fetchBookings();
// // //         // Refresh the ride data
// // //         setRefreshKey(prev => prev + 1);
// // //       }
// // //     });
    
// // //     const interval = setInterval(() => {
// // //       fetchPendingModifications();
// // //     }, 10000);
    
// // //     setPollingInterval(interval);
    
// // //     return () => {
// // //       if (interval) clearInterval(interval);
// // //       if (socketRef.current) {
// // //         socketRef.current.emit('leave-ride-room', ride.id);
// // //         socketRef.current.disconnect();
// // //         socketRef.current = null;
// // //       }
// // //     };
// // //   }, [ride?.id, user?.phone_number, checkForConcurrentRequests, fetchPendingModifications]);

// // //   useFocusEffect(
// // //     useCallback(() => {
// // //       fetchBookings();
// // //       fetchPendingModifications();
// // //       checkForConcurrentRequests();
// // //       setRefreshKey(prev => prev + 1);
// // //       return () => {};
// // //     }, [fetchBookings, fetchPendingModifications, checkForConcurrentRequests])
// // //   );

// // //   const handleBookingAction = async (bookingId, action) => {
// // //     showConfirmationAlert(`${action === "accept" ? "Accept" : "Reject"} Request`, `Are you sure you want to ${action} this booking request?`, async () => {
// // //       try {
// // //         const response = await fetch(`${API_BASE_URL}/booking/${bookingId}/${action}`, {
// // //           method: 'PUT',
// // //           headers: { 'Content-Type': 'application/json' },
// // //         });
// // //         const data = await response.json();
        
// // //         if (!response.ok) throw new Error(data.detail || `Failed to ${action} booking`);
        
// // //         showCustomAlert('Success', `Booking ${action}ed successfully`, 'success');
// // //         fetchBookings();
        
// // //         if (socketRef.current) {
// // //           socketRef.current.emit('booking-status-changed', {
// // //             ride_id: ride.id,
// // //             booking_id: bookingId,
// // //             status: action
// // //           });
// // //         }
// // //       } catch (error) {
// // //         showCustomAlert('Error', error.message, 'error');
// // //       }
// // //     });
// // //   };

// // //   const handleModificationAction = async (requestId, action, requestedSeats, currentSeats, bookingId, passengerName) => {
// // //     const actionText = action === 'approve' ? 'approve' : 'reject';
// // //     showConfirmationAlert(`${action === 'approve' ? 'Approve' : 'Reject'} Modification`, 
// // //       `Are you sure you want to ${actionText} the seat change request from ${currentSeats} to ${requestedSeats} seats for ${passengerName}?`, 
// // //       async () => {
// // //         try {
// // //           const url = `${API_BASE_URL}/api/v1/modifications/${requestId}/${action}`;
// // //           const response = await fetch(url, { method: 'PUT' });
// // //           const data = await response.json();
          
// // //           if (!response.ok) throw new Error(data.detail || `Failed to ${action} modification`);
          
// // //           showCustomAlert('Success', `Modification request ${actionText}d successfully`, 'success');
// // //           fetchPendingModifications();
// // //           fetchBookings();
// // //           checkForConcurrentRequests();
          
// // //           if (socketRef.current) {
// // //             socketRef.current.emit('modification-response', {
// // //               ride_id: ride.id,
// // //               request_id: requestId,
// // //               action: action,
// // //               booking_id: bookingId
// // //             });
// // //           }
// // //         } catch (error) {
// // //           showCustomAlert('Error', error.message, 'error');
// // //         }
// // //       });
// // //   };

// // //   const handleRateRider = async (booking, sessionId) => {
// // //     let effectiveSessionId = sessionId || ride?.live_session?.session_id;
    
// // //     if (!effectiveSessionId) {
// // //       try {
// // //         const response = await fetch(`${API_BASE_URL}/booking/${booking.booking_id}/session`);
// // //         const data = await response.json();
        
// // //         if (data.session_id) {
// // //           effectiveSessionId = data.session_id;
// // //         }
// // //       } catch (error) {
// // //         console.log('Error fetching session from booking:', error);
// // //       }
// // //     }
    
// // //     if (!effectiveSessionId) {
// // //       showCustomAlert('Error', 'Cannot rate rider: No session found for this ride', 'error');
// // //       return;
// // //     }
    
// // //     setSelectedRider(booking);
// // //     setCurrentSessionId(effectiveSessionId);
// // //     setRating(0);
// // //     setFeedback('');
// // //     setRatingModalVisible(true);
// // //   };

// // //   const submitRiderRating = async () => {
// // //     if (!selectedRider) return;
// // //     if (rating === 0) {
// // //       showCustomAlert('Rating Required', 'Please select a rating before submitting', 'warning');
// // //       return;
// // //     }
    
// // //     setModifyingRequest(true);
// // //     try {
// // //       const sessionId = currentSessionId;
// // //       if (!sessionId) {
// // //         throw new Error('No session ID found');
// // //       }
      
// // //       const requestBody = {
// // //         booking_id: selectedRider.booking_id,
// // //         rating: rating,
// // //         feedback: typeof feedback === 'string' ? feedback : String(feedback || ''),
// // //       };
      
// // //       const response = await fetch(`${API_BASE_URL}/ride-sessions/${sessionId}/rate-rider`, {
// // //         method: 'POST',
// // //         headers: { 'Content-Type': 'application/json' },
// // //         body: JSON.stringify(requestBody),
// // //       });
      
// // //       const data = await response.json();
      
// // //       if (!response.ok) {
// // //         if (response.status === 400 && data.detail?.includes('already')) {
// // //           showCustomAlert('Already Rated', 'You have already rated this rider', 'info');
// // //           setRatingModalVisible(false);
// // //           setSelectedRider(null);
// // //           setCurrentSessionId(null);
// // //           setRating(0);
// // //           setFeedback('');
// // //           await fetchBookings();
// // //           return;
// // //         }
// // //         throw new Error(data.detail || 'Failed to submit rating');
// // //       }
      
// // //       setRatingModalVisible(false);
// // //       setRating(0);
// // //       setFeedback('');
// // //       setSelectedRider(null);
// // //       setCurrentSessionId(null);
      
// // //       showCustomAlert('Rating Submitted', `You rated ${selectedRider.passenger_name || 'the rider'} ${rating} stars!`, 'success');
// // //       await fetchBookings();
      
// // //     } catch (error) {
// // //       console.error('Rating error:', error);
// // //       showCustomAlert('Error', error.message || 'Could not submit rating', 'error');
// // //     } finally {
// // //       setModifyingRequest(false);
// // //     }
// // //   };

// // //   const renderStars = () => (
// // //     <View style={styles.starsRow}>
// // //       {[1, 2, 3, 4, 5].map((star) => (
// // //         <TouchableOpacity key={star} onPress={() => setRating(star)}>
// // //           <Ionicons
// // //             name={star <= rating ? 'star' : 'star-outline'}
// // //             size={32}
// // //             color={star <= rating ? '#F59E0B' : '#D1D5DB'}
// // //             style={{ marginHorizontal: 4 }}
// // //           />
// // //         </TouchableOpacity>
// // //       ))}
// // //     </View>
// // //   );

// // //   // Get driver start coordinates
// // //   const driverStart = useMemo(() => {
// // //     if (ride?.origin_lat && ride?.origin_lon) {
// // //       return { latitude: Number(ride.origin_lat), longitude: Number(ride.origin_lon) };
// // //     }
// // //     if (ride?.origin_coords && Array.isArray(ride.origin_coords) && ride.origin_coords.length === 2) {
// // //       return { longitude: Number(ride.origin_coords[0]), latitude: Number(ride.origin_coords[1]) };
// // //     }
// // //     const routeCoords = parseRouteCoordinates(ride?.routeCoordinates);
// // //     if (routeCoords.length > 0) return routeCoords[0];
// // //     return null;
// // //   }, [ride]);

// // //   // Get driver end coordinates
// // //   const driverEnd = useMemo(() => {
// // //     if (ride?.destination_lat && ride?.destination_lon) {
// // //       return { latitude: Number(ride.destination_lat), longitude: Number(ride.destination_lon) };
// // //     }
// // //     if (ride?.destination_coords && Array.isArray(ride.destination_coords) && ride.destination_coords.length === 2) {
// // //       return { longitude: Number(ride.destination_coords[0]), latitude: Number(ride.destination_coords[1]) };
// // //     }
// // //     const routeCoords = parseRouteCoordinates(ride?.routeCoordinates);
// // //     if (routeCoords.length > 0) return routeCoords[routeCoords.length - 1];
// // //     return null;
// // //   }, [ride]);

// // // const formatDateTime = (dateString) => {
// // //   if (!dateString) return '';
// // //   const date = new Date(dateString);
// // //   if (isNaN(date.getTime())) return '';
// // //   return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false });
// // // };

// // //   const routePath = useMemo(() => {
// // //     const fullRoute = parseRouteCoordinates(ride?.routeCoordinates);
// // //     if (fullRoute.length >= 2) return fullRoute;
// // //     if (driverStart && driverEnd) return [driverStart, driverEnd];
// // //     return [];
// // //   }, [ride, driverStart, driverEnd]);

// // //   // Calculate distance between two coordinates (in km)
// // //   const calculateDistance = (lat1, lon1, lat2, lon2) => {
// // //     const R = 6371;
// // //     const dLat = (lat2 - lat1) * Math.PI / 180;
// // //     const dLon = (lon2 - lon1) * Math.PI / 180;
// // //     const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
// // //               Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
// // //               Math.sin(dLon/2) * Math.sin(dLon/2);
// // //     const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
// // //     return R * c;
// // //   };

// // //   // Calculate estimated travel time between points (in minutes)
// // //   const calculateTravelTime = (distanceKm, avgSpeedKmh = 40) => {
// // //     const timeHours = distanceKm / avgSpeedKmh;
// // //     const timeMinutes = Math.round(timeHours * 60);
// // //     return timeMinutes;
// // //   };

// // //   // Format duration display
// // //   const formatDuration = (minutes) => {
// // //     if (minutes < 60) return `${minutes} min`;
// // //     const hours = Math.floor(minutes / 60);
// // //     const mins = minutes % 60;
// // //     return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`;
// // //   };

// // //   // Get all map markers with enhanced visual features
// // //   const getAllMapMarkers = useMemo(() => {
// // //     const markers = [];
// // //     const confirmedBookings = bookings.filter(b => b.status === 'accepted');
    
// // //     // Driver start point
// // //     if (driverStart?.latitude && driverStart?.longitude) {
// // //       markers.push({
// // //         id: 'driver-start',
// // //         type: 'start',
// // //         coordinate: driverStart,
// // //         title: '🚗 Trip Start',
// // //         address: ride?.origin || 'Starting point',
// // //         time: formatDateTime(ride?.departure_time),
// // //         icon: 'flag',
// // //         order: 0,
// // //         walkDistance: null,
// // //         description: `Departure: ${formatDate(ride?.departure_time)}`
// // //       });
// // //     }
    
// // //     // Add rider pickup points
// // //     confirmedBookings.forEach((booking, idx) => {
// // //       const pickupLat = booking.intersection_pickup_lat || booking.pickup_lat;
// // //       const pickupLon = booking.intersection_pickup_lon || booking.pickup_lon;
// // //       if (pickupLat && pickupLon) {
// // //         markers.push({
// // //           id: `pickup-${booking.booking_id}`,
// // //           type: 'pickup',
// // //           coordinate: { latitude: Number(pickupLat), longitude: Number(pickupLon) },
// // //           title: `📍 Pickup: ${booking.passenger_name || 'Rider'}`,
// // //           address: booking.origin || 'Pickup location',
// // //           walkDistance: booking.pickup_walk_distance_m,
// // //           walkDuration: booking.pickup_walk_distance_m ? Math.round(booking.pickup_walk_distance_m / 80) : null,
// // //           riderName: booking.passenger_name,
// // //           seats: booking.seats_booked,
// // //           icon: 'person-add',
// // //           order: markers.length,
// // //           description: `${booking.seats_booked} seat(s) • ${booking.pickup_walk_distance_m ? `${booking.pickup_walk_distance_m}m walk` : 'Direct pickup'}`
// // //         });
// // //       }
// // //     });
    
// // //     // Add rider dropoff points
// // //     confirmedBookings.forEach((booking, idx) => {
// // //       const dropLat = booking.intersection_drop_lat || booking.drop_lat;
// // //       const dropLon = booking.intersection_drop_lon || booking.drop_lon;
// // //       if (dropLat && dropLon) {
// // //         markers.push({
// // //           id: `dropoff-${booking.booking_id}`,
// // //           type: 'dropoff',
// // //           coordinate: { latitude: Number(dropLat), longitude: Number(dropLon) },
// // //           title: `🏁 Dropoff: ${booking.passenger_name || 'Rider'}`,
// // //           address: booking.destination || 'Dropoff location',
// // //           walkDistance: booking.drop_walk_distance_m,
// // //           walkDuration: booking.drop_walk_distance_m ? Math.round(booking.drop_walk_distance_m / 80) : null,
// // //           riderName: booking.passenger_name,
// // //           seats: booking.seats_booked,
// // //           icon: 'flag',
// // //           order: markers.length,
// // //           description: `${booking.drop_walk_distance_m ? `${booking.drop_walk_distance_m}m walk to destination` : 'Direct dropoff'}`
// // //         });
// // //       }
// // //     });
    
// // //     // Driver end point
// // //     if (driverEnd?.latitude && driverEnd?.longitude) {
// // //       markers.push({
// // //         id: 'driver-end',
// // //         type: 'end',
// // //         coordinate: driverEnd,
// // //         title: '🏁 Trip End',
// // //         address: ride?.destination || 'Destination',
// // //         time: formatDateTime(ride?.expected_end_time || ride?.departure_time),
// // //         icon: 'flag',
// // //         order: markers.length,
// // //         walkDistance: null,
// // //         description: 'Final destination'
// // //       });
// // //     }
    
// // //     return markers.sort((a, b) => a.order - b.order);
// // //   }, [bookings, driverStart, driverEnd, ride]);

// // //   // Get walking path lines for pickup/dropoff
// // //   const walkingPaths = useMemo(() => {
// // //     const paths = [];
// // //     const confirmedBookings = bookings.filter(b => b.status === 'accepted');
    
// // //     confirmedBookings.forEach(booking => {
// // //       // Pickup walking path
// // //       const pickupLat = booking.intersection_pickup_lat || booking.pickup_lat;
// // //       const pickupLon = booking.intersection_pickup_lon || booking.pickup_lon;
// // //       const pickupAddressLat = booking.pickup_lat;
// // //       const pickupAddressLon = booking.pickup_lon;
      
// // //       if (pickupLat && pickupLon && pickupAddressLat && pickupAddressLon) {
// // //         const distance = calculateDistance(
// // //           pickupLat, pickupLon, pickupAddressLat, pickupAddressLon
// // //         );
// // //         if (distance > 0.05) {
// // //           paths.push({
// // //             id: `walking-pickup-${booking.booking_id}`,
// // //             coordinates: [
// // //               { latitude: Number(pickupLat), longitude: Number(pickupLon) },
// // //               { latitude: Number(pickupAddressLat), longitude: Number(pickupAddressLon) }
// // //             ],
// // //             color: '#10B981',
// // //             lineDash: [5, 5],
// // //             walkDistance: booking.pickup_walk_distance_m,
// // //             type: 'pickup'
// // //           });
// // //         }
// // //       }
      
// // //       // Dropoff walking path
// // //       const dropLat = booking.intersection_drop_lat || booking.drop_lat;
// // //       const dropLon = booking.intersection_drop_lon || booking.drop_lon;
// // //       const dropAddressLat = booking.drop_lat;
// // //       const dropAddressLon = booking.drop_lon;
      
// // //       if (dropLat && dropLon && dropAddressLat && dropAddressLon) {
// // //         const distance = calculateDistance(
// // //           dropLat, dropLon, dropAddressLat, dropAddressLon
// // //         );
// // //         if (distance > 0.05) {
// // //           paths.push({
// // //             id: `walking-dropoff-${booking.booking_id}`,
// // //             coordinates: [
// // //               { latitude: Number(dropLat), longitude: Number(dropLon) },
// // //               { latitude: Number(dropAddressLat), longitude: Number(dropAddressLon) }
// // //             ],
// // //             color: '#F59E0B',
// // //             lineDash: [5, 5],
// // //             walkDistance: booking.drop_walk_distance_m,
// // //             type: 'dropoff'
// // //           });
// // //         }
// // //       }
// // //     });
    
// // //     return paths;
// // //   }, [bookings]);

// // //   // Enhanced trip timeline with all details
// // //   const sortedTripTimeline = useMemo(() => {
// // //     const items = [];
// // //     const confirmedBookings = bookings.filter(b => b.status === 'accepted');
    
// // //     // Create all potential points with coordinates
// // //     const allPoints = [];
// // //     let cumulativeDistance = 0;
// // //     let cumulativeDuration = 0;
    
// // //     // Start point
// // //     if (driverStart?.latitude && driverStart?.longitude) {
// // //       allPoints.push({
// // //         id: 'start',
// // //         type: 'start',
// // //         title: 'Trip Start',
// // //         address: ride?.origin || 'Starting point',
// // //         actualAddress: ride?.origin || 'Starting point',
// // //         time: formatDateTime(ride?.departure_time),
// // //         fullDateTime: ride?.departure_time,
// // //         coordinates: driverStart,
// // //         order: 0,
// // //         icon: '🚗',
// // //         color: '#2457A6'
// // //       });
// // //     }
    
// // //     // Add all pickup and dropoff points
// // //     confirmedBookings.forEach(booking => {
// // //       const pickupLat = booking.intersection_pickup_lat || booking.pickup_lat;
// // //       const pickupLon = booking.intersection_pickup_lon || booking.pickup_lon;
// // //       const pickupCacheKey = `${pickupLat},${pickupLon}`;
// // //       const pickupAddress = addressCache[pickupCacheKey];
      
// // //       if (pickupLat && pickupLon) {
// // //         allPoints.push({
// // //           id: `pickup-${booking.booking_id}`,
// // //           type: 'pickup',
// // //           title: `Pickup: ${booking.passenger_name || 'Rider'}`,
// // //           address: booking.origin || 'Pickup location',
// // //           actualAddress: pickupAddress || (booking.origin ? booking.origin : `Location loading...`),
// // //           time: formatDateTime(booking.pickup_time || ride?.departure_time),
// // //           walkDistance: booking.pickup_walk_distance_m,
// // //           walkDuration: booking.pickup_walk_distance_m ? Math.round(booking.pickup_walk_distance_m / 80) : null,
// // //           riderName: booking.passenger_name,
// // //           seats: booking.seats_booked,
// // //           coordinates: { latitude: Number(pickupLat), longitude: Number(pickupLon) },
// // //           icon: '📍',
// // //           color: '#10B981'
// // //         });
// // //       }
      
// // //       const dropLat = booking.intersection_drop_lat || booking.drop_lat;
// // //       const dropLon = booking.intersection_drop_lon || booking.drop_lon;
// // //       const dropCacheKey = `${dropLat},${dropLon}`;
// // //       const dropAddress = addressCache[dropCacheKey];
      
// // //       if (dropLat && dropLon) {
// // //         allPoints.push({
// // //           id: `dropoff-${booking.booking_id}`,
// // //           type: 'dropoff',
// // //           title: `Dropoff: ${booking.passenger_name || 'Rider'}`,
// // //           address: booking.destination || 'Dropoff location',
// // //           actualAddress: dropAddress || (booking.destination ? booking.destination : `Location loading...`),
// // //           time: formatDateTime(booking.dropoff_time || ride?.expected_end_time),
// // //           walkDistance: booking.drop_walk_distance_m,
// // //           walkDuration: booking.drop_walk_distance_m ? Math.round(booking.drop_walk_distance_m / 80) : null,
// // //           riderName: booking.passenger_name,
// // //           seats: booking.seats_booked,
// // //           coordinates: { latitude: Number(dropLat), longitude: Number(dropLon) },
// // //           icon: '🏁',
// // //           color: '#F59E0B'
// // //         });
// // //       }
// // //     });
    
// // //     // End point
// // //     if (driverEnd?.latitude && driverEnd?.longitude) {
// // //       allPoints.push({
// // //         id: 'end',
// // //         type: 'end',
// // //         title: 'Trip End',
// // //         address: ride?.destination || 'Destination',
// // //         actualAddress: ride?.destination || 'Destination',
// // //         time: formatDateTime(ride?.expected_end_time || ride?.departure_time),
// // //         coordinates: driverEnd,
// // //         icon: '🏁',
// // //         color: '#DC2626'
// // //       });
// // //     }
    
// // //     // Sort points based on route order
// // //     const routeCoords = routePath;
// // //     const sortedPoints = [];
    
// // //     if (routeCoords.length > 0) {
// // //       const pointsWithDistance = allPoints.map(point => {
// // //         let minDistance = Infinity;
// // //         let indexOnRoute = -1;
        
// // //         routeCoords.forEach((coord, idx) => {
// // //           const distance = calculateDistance(
// // //             point.coordinates.latitude,
// // //             point.coordinates.longitude,
// // //             coord.latitude,
// // //             coord.longitude
// // //           );
// // //           if (distance < minDistance) {
// // //             minDistance = distance;
// // //             indexOnRoute = idx;
// // //           }
// // //         });
        
// // //         return { ...point, routeIndex: indexOnRoute, distanceToRoute: minDistance };
// // //       });
      
// // //       pointsWithDistance.sort((a, b) => a.routeIndex - b.routeIndex);
// // //       sortedPoints.push(...pointsWithDistance);
// // //     } else {
// // //       sortedPoints.push(...allPoints);
// // //     }
    
// // //     // Calculate cumulative distances and durations
// // //     for (let i = 0; i < sortedPoints.length - 1; i++) {
// // //       const current = sortedPoints[i];
// // //       const next = sortedPoints[i + 1];
// // //       if (current.coordinates && next.coordinates) {
// // //         const distance = calculateDistance(
// // //           current.coordinates.latitude,
// // //           current.coordinates.longitude,
// // //           next.coordinates.latitude,
// // //           next.coordinates.longitude
// // //         );
// // //         const duration = calculateTravelTime(distance);
        
// // //         cumulativeDistance += distance;
// // //         cumulativeDuration += duration;
        
// // //         sortedPoints[i].distanceToNext = distance.toFixed(1);
// // //         sortedPoints[i].durationToNext = duration;
// // //         sortedPoints[i].cumulativeDistance = cumulativeDistance.toFixed(1);
// // //         sortedPoints[i].cumulativeDuration = cumulativeDuration;
// // //         sortedPoints[i].segmentNumber = i + 1;
// // //       }
// // //     }
    
// // //     // Add total trip summary
// // //     if (sortedPoints.length > 0 && sortedPoints[0]) {
// // //       sortedPoints[0].totalDistance = cumulativeDistance.toFixed(1);
// // //       sortedPoints[0].totalDuration = cumulativeDuration;
// // //     }
    
// // //     return sortedPoints;
// // //   }, [bookings, driverStart, driverEnd, ride, routePath, addressCache]);

// // //   const allMarkerCoords = useMemo(() => {
// // //     const coords = getAllMapMarkers.map(m => m.coordinate).filter(c => c?.latitude && c?.longitude);
// // //     walkingPaths.forEach(path => {
// // //       path.coordinates.forEach(coord => {
// // //         coords.push(coord);
// // //       });
// // //     });
// // //     return coords;
// // //   }, [getAllMapMarkers, walkingPaths]);

// // //   const fitMapToMarkers = useCallback(() => {
// // //     if (mapRef.current && mapReady && allMarkerCoords.length >= 1) {
// // //       setTimeout(() => {
// // //         try {
// // //           mapRef.current.fitToCoordinates(allMarkerCoords, {
// // //             edgePadding: { top: 80, right: 50, bottom: 50, left: 50 },
// // //             animated: true,
// // //           });
// // //         } catch (e) { console.log('fitToCoordinates error:', e); }
// // //       }, 500);
// // //     }
// // //   }, [mapReady, allMarkerCoords]);

// // //   useEffect(() => {
// // //     if (mapReady && allMarkerCoords.length >= 1) fitMapToMarkers();
// // //   }, [mapReady, allMarkerCoords, fitMapToMarkers]);

// // //   const getVehicleName = () => {
// // //     if (ride?.vehicle) {
// // //       const parts = [];
// // //       if (ride.vehicle.make) parts.push(ride.vehicle.make);
// // //       if (ride.vehicle.model) parts.push(ride.vehicle.model);
// // //       if (parts.length > 0) return parts.join(' ');
// // //     }
// // //     return 'Vehicle details unavailable';
// // //   };
  
// // //   const vehicleName = getVehicleName();
// // //   const vehicleRegNumber = ride?.vehicle?.registration_number || null;
  
// // //   const totalSeatsOffered = ride?.available_seats ?? 0;
  
// // //   let bookedSeatsCount = bookings
// // //     .filter(b => b.status === 'accepted')
// // //     .reduce((sum, b) => sum + (b.seats_booked || 0), 0);
  
// // //   const availableSeatsCount = Math.max(0, totalSeatsOffered - bookedSeatsCount);

// // //   const mapHeight = animatedDrawer.interpolate({ inputRange: [0, 1], outputRange: [height - SAFE_TOP - COLLAPSED_HEIGHT, height * 0.35] });
// // //   const drawerHeight = animatedDrawer.interpolate({ inputRange: [0, 1], outputRange: [COLLAPSED_HEIGHT, EXPANDED_HEIGHT] });

// // //   const toggleDrawer = () => {
// // //     const nextExpanded = !drawerExpanded;
// // //     setDrawerExpanded(nextExpanded);
// // //     Animated.timing(animatedDrawer, { toValue: nextExpanded ? 1 : 0, duration: 260, useNativeDriver: false }).start();
// // //   };

// // //   const panResponder = useRef(PanResponder.create({
// // //     onMoveShouldSetPanResponder: (_, gestureState) => Math.abs(gestureState.dy) > 5,
// // //     onPanResponderMove: (_, gestureState) => {
// // //       const dragRange = EXPANDED_HEIGHT - COLLAPSED_HEIGHT;
// // //       const progress = drawerExpanded ? 1 - (gestureState.dy / dragRange) : gestureState.dy / dragRange;
// // //       animatedDrawer.setValue(Math.max(0, Math.min(1, progress)));
// // //     },
// // //     onPanResponderRelease: (_, gestureState) => {
// // //       const dragRange = EXPANDED_HEIGHT - COLLAPSED_HEIGHT;
// // //       const threshold = dragRange * 0.2;
// // //       if (drawerExpanded) {
// // //         if (gestureState.dy > threshold) {
// // //           setDrawerExpanded(false);
// // //           Animated.timing(animatedDrawer, { toValue: 0, duration: 200, useNativeDriver: false }).start();
// // //         } else {
// // //           setDrawerExpanded(true);
// // //           Animated.timing(animatedDrawer, { toValue: 1, duration: 200, useNativeDriver: false }).start();
// // //         }
// // //       } else {
// // //         if (gestureState.dy < -threshold) {
// // //           setDrawerExpanded(true);
// // //           Animated.timing(animatedDrawer, { toValue: 1, duration: 200, useNativeDriver: false }).start();
// // //         } else {
// // //           setDrawerExpanded(false);
// // //           Animated.timing(animatedDrawer, { toValue: 0, duration: 200, useNativeDriver: false }).start();
// // //         }
// // //       }
// // //     },
// // //   })).current;

// // //   const getStatusColor = (status) => {
// // //     switch (status) {
// // //       case 'accepted': return '#10B981';
// // //       case 'pending': return '#F59E0B';
// // //       case 'rejected': return '#EF4444';
// // //       case 'cancelled': return '#6B7280';
// // //       default: return Colors.gray;
// // //     }
// // //   };

// // //   const getStatusText = (status) => {
// // //     switch (status) {
// // //       case 'accepted': return 'Confirmed';
// // //       case 'pending': return 'Pending';
// // //       case 'rejected': return 'Rejected';
// // //       case 'cancelled': return 'Cancelled';
// // //       default: return status;
// // //     }
// // //   };

// // //   const handleChatWithPassenger = (passengerPhone, passengerName, passengerPhoto) => {
// // //     navigation.navigate('ChatScreen', {
// // //       receiverPhone: passengerPhone,
// // //       conversationId: `chat-${ride?.id}-${passengerPhone}`,
// // //       rideId: ride?.id,
// // //       user: {
// // //         name: passengerName,
// // //         tripInfo: `${ride?.origin || 'Pickup'} → ${ride?.destination || 'Drop'}`,
// // //         phone: passengerPhone,
// // //         profile_picture: passengerPhoto
// // //       }
// // //     });
// // //   };

// // //   const handleStartRide = () => {
// // //     navigation.navigate('StartRideConfirmScreen', { rideId: ride?.id, ride });
// // //   };

// // //   const handleEditRide = () => {
// // //     if (!ride?.id) {
// // //       showCustomAlert("Error", "Cannot edit ride: Ride ID missing", "error");
// // //       return;
// // //     }
    
// // //     if (!user?.phone_number) {
// // //       showCustomAlert("Error", "Please login to edit ride", "error");
// // //       return;
// // //     }
    
// // //     if (ride?.started_at) {
// // //       showCustomAlert("Cannot Edit", "Ride has already started. Cannot edit.", "warning");
// // //       return;
// // //     }
    
// // //     if (ride?.cancellation_reason) {
// // //       showCustomAlert("Cannot Edit", "Cancelled ride cannot be edited.", "warning");
// // //       return;
// // //     }
    
// // //     const rideData = {
// // //       from: ride?.origin || '',
// // //       to: ride?.destination || '',
// // //       dateTime: ride?.departure_time ? new Date(ride.departure_time) : new Date(),
// // //       seatsAvailable: ride?.available_seats || 1,
// // //       pricePerSeat: (ride?.price_per_seat || 0).toString(),
// // //       vehicleId: ride?.vehicle_id || null,
// // //       originCoords: ride?.origin_coords,
// // //       destinationCoords: ride?.destination_coords,
// // //       routeCoordinates: ride?.route_coordinates,
// // //       distanceKm: ride?.distance_km,
// // //       durationText: ride?.duration_text,
// // //       totalPrice: ride?.total_estimated_price,
// // //       preferences: ride?.preferences,
// // //       womenOnly: ride?.women_only,
// // //     };
    
// // //     navigation.navigate('DriveNext', { 
// // //       rideData, 
// // //       isEdit: true, 
// // //       rideId: ride.id, 
// // //       phoneNumber: user?.phone_number 
// // //     });
// // //   };

// // //   const handleCancelRide = () => {
// // //     showConfirmationAlert("Cancel Ride", "Are you sure you want to cancel this ride?", async () => {
// // //       try {
// // //         const response = await fetch(`${API_BASE_URL}/ride/${ride?.id}/cancel`, { method: 'PUT' });
// // //         if (!response.ok) throw new Error('Failed to cancel ride');
// // //         showCustomAlert("Success", "Ride cancelled successfully.", "success");
// // //         setTimeout(() => navigation.goBack(), 1500);
// // //       } catch (err) {
// // //         showCustomAlert("Error", "Could not cancel ride.", "error");
// // //       }
// // //     });
// // //   };

// // //   const handleNavigateToLocation = (latitude, longitude, title) => {
// // //     const url = Platform.select({
// // //       ios: `maps:0,0?q=${latitude},${longitude}`,
// // //       android: `geo:0,0?q=${latitude},${longitude}(${encodeURIComponent(title)})`
// // //     });
// // //     Linking.openURL(url).catch(err => {
// // //       showCustomAlert("Error", "Could not open maps", "error");
// // //     });
// // //   };

// // //   const focusOnStop = (coordinates) => {
// // //     if (mapRef.current && coordinates) {
// // //       mapRef.current.animateToRegion({
// // //         latitude: coordinates.latitude,
// // //         longitude: coordinates.longitude,
// // //         latitudeDelta: 0.01,
// // //         longitudeDelta: 0.01,
// // //       }, 500);
// // //     }
// // //   };

// // //   const initialRegion = {
// // //     latitude: driverStart?.latitude || 28.6139,
// // //     longitude: driverStart?.longitude || 77.2090,
// // //     latitudeDelta: 0.05,
// // //     longitudeDelta: 0.05,
// // //   };

// // //   const confirmedBookings = bookings.filter(b => b.status === 'accepted');
// // //   const pendingBookings = bookings.filter(b => b.status === 'pending');
// // //   const rideStatus = getRideStatusDisplay();
// // //   const showStartRide = !ride?.started_at && !ride?.cancellation_reason && ride?.status !== 'completed' && rideStatus.type !== 'auto-cancelled';
// // //   const pendingMods = pendingModifications.filter(m => m.status === 'pending' || m.status === undefined);
// // //   const showLiveSession = ride?.live_session?.session_id && ride?.started_at && ride?.status !== 'completed';
// // //   const isCompleted = ride?.status === 'completed' || ride?.completed_at;
// // //   const isOngoing = ride?.started_at && !isCompleted;
// // //   const unratedRiders = confirmedBookings.filter(b => !b.driver_rating_given && b.driver_rating_given !== true);
// // //   const needsRating = isCompleted && unratedRiders.length > 0;
// // //   const showRatingSection = isCompleted && confirmedBookings.length > 0;

// // //   // Render walking path
// // //   const renderWalkingPath = (path) => {
// // //     return (
// // //       <Polyline
// // //         key={path.id}
// // //         coordinates={path.coordinates}
// // //         strokeColor={path.color}
// // //         strokeWidth={3}
// // //         lineDashPattern={path.lineDash}
// // //         lineCap="round"
// // //         lineJoin="round"
// // //       />
// // //     );
// // //   };

// // //   // Render marker on map
// // //   const renderMarker = (marker) => {
// // //     let color, size = 36;
// // //     switch (marker.type) {
// // //       case 'start': color = '#2457A6'; size = 42; break;
// // //       case 'end': color = '#DC2626'; size = 42; break;
// // //       case 'pickup': color = '#10B981'; size = 38; break;
// // //       case 'dropoff': color = '#F59E0B'; size = 38; break;
// // //       default: color = '#6B7280'; size = 32;
// // //     }
    
// // //     const iconName = marker.type === 'pickup' ? 'person-add' : (marker.type === 'dropoff' ? 'flag' : 'location');
    
// // //     return (
// // //       <Marker 
// // //         key={marker.id} 
// // //         coordinate={marker.coordinate} 
// // //         title={marker.title} 
// // //         description={marker.description || marker.address}
// // //       >
// // //         <View style={[styles.customMarker, { backgroundColor: color, width: size, height: size, borderRadius: size / 2 }]}>
// // //           <Ionicons name={iconName} size={size * 0.45} color="#fff" />
// // //           {marker.type === 'pickup' && marker.seats && (
// // //             <View style={styles.markerBadge}>
// // //               <Text style={styles.markerBadgeText}>{marker.seats}</Text>
// // //             </View>
// // //           )}
// // //           {marker.walkDistance && marker.walkDistance > 0 && (
// // //             <View style={[styles.walkBadge, { backgroundColor: marker.type === 'pickup' ? '#10B981' : '#F59E0B' }]}>
// // //               <Ionicons name="walk" size={10} color="#fff" />
// // //               <Text style={styles.walkBadgeText}>{marker.walkDistance}m</Text>
// // //             </View>
// // //           )}
// // //         </View>
// // //       </Marker>
// // //     );
// // //   };

// // //   // Render enhanced trip timeline item
// // //   const renderTimelineItem = (item, index) => {
// // //     const isLast = index === sortedTripTimeline.length - 1;
// // //     const hasWalking = item.walkDistance && item.walkDistance > 0;
    
// // //     return (
// // //       <TouchableOpacity 
// // //         key={item.id} 
// // //         style={styles.timelineItemCard}
// // //         onPress={() => focusOnStop(item.coordinates)}
// // //         activeOpacity={0.7}
// // //       >
// // //         <View style={styles.timelineItemLeft}>
// // //           <View style={[styles.timelineItemDot, { backgroundColor: item.color }]}>
// // //             <Text style={styles.timelineItemIcon}>{item.icon}</Text>
// // //           </View>
// // //           {!isLast && <View style={[styles.timelineItemLine, { backgroundColor: item.color + '40' }]} />}
// // //         </View>
        
// // //         <View style={styles.timelineItemRight}>
// // //           <View style={styles.timelineItemHeader}>
// // //             <Text style={styles.timelineItemType}>{item.type.toUpperCase()}</Text>
// // //             {item.segmentNumber && (
// // //               <View style={styles.segmentBadge}>
// // //                 <Text style={styles.segmentBadgeText}>Stop {item.segmentNumber}</Text>
// // //               </View>
// // //             )}
// // //           </View>
          
// // //           <Text style={styles.timelineItemTitle}>{item.title}</Text>
          
// // //           <View style={styles.timelineItemDetails}>
// // //             {item.riderName && (
// // //               <View style={styles.detailChip}>
// // //                 <Ionicons name="person-outline" size={12} color="#6B7280" />
// // //                 <Text style={styles.detailChipText}>{item.riderName}</Text>
// // //               </View>
// // //             )}
// // //             {item.seats && (
// // //               <View style={styles.detailChip}>
// // //                 <Ionicons name="people-outline" size={12} color="#6B7280" />
// // //                 <Text style={styles.detailChipText}>{item.seats} seat{item.seats > 1 ? 's' : ''}</Text>
// // //               </View>
// // //             )}
// // //             {item.time && (
// // //               <View style={styles.detailChip}>
// // //                 <Ionicons name="time-outline" size={12} color="#6B7280" />
// // //                 <Text style={styles.detailChipText}>{item.time}</Text>
// // //               </View>
// // //             )}
// // //           </View>
          
// // //           <Text style={styles.timelineItemAddress} numberOfLines={2}>
// // //             {item.actualAddress || item.address}
// // //           </Text>
          
// // //           {hasWalking && (
// // //             <View style={[styles.walkingChip, { backgroundColor: item.color + '15' }]}>
// // //               <Ionicons name="walk" size={14} color={item.color} />
// // //               <Text style={[styles.walkingChipText, { color: item.color }]}>
// // //                 Walk {item.walkDistance}m • ~{item.walkDuration} min
// // //               </Text>
// // //             </View>
// // //           )}
          
// // //           {item.distanceToNext && (
// // //             <View style={styles.routeInfo}>
// // //               <View style={styles.routeInfoItem}>
// // //                 <Ionicons name="navigate-outline" size={12} color="#2457A6" />
// // //                 <Text style={styles.routeInfoText}>Next: {item.distanceToNext} km</Text>
// // //               </View>
// // //               <View style={styles.routeInfoItem}>
// // //                 <Ionicons name="time-outline" size={12} color="#F59E0B" />
// // //                 <Text style={styles.routeInfoText}>~{formatDuration(item.durationToNext)}</Text>
// // //               </View>
// // //               {item.cumulativeDistance && (
// // //                 <View style={styles.routeInfoItem}>
// // //                   <Ionicons name="flag-outline" size={12} color="#10B981" />
// // //                   <Text style={styles.routeInfoText}>Total: {item.cumulativeDistance} km</Text>
// // //                 </View>
// // //               )}
// // //             </View>
// // //           )}
          
// // //           <TouchableOpacity 
// // //             style={styles.navigateButton}
// // //             onPress={() => handleNavigateToLocation(
// // //               item.coordinates.latitude,
// // //               item.coordinates.longitude,
// // //               item.title
// // //             )}
// // //           >
// // //             <Ionicons name="navigate-circle" size={16} color="#2457A6" />
// // //             <Text style={styles.navigateButtonText}>Navigate to this stop</Text>
// // //           </TouchableOpacity>
// // //         </View>
// // //       </TouchableOpacity>
// // //     );
// // //   };

// // //   return (
// // //     <View style={styles.container}>
// // //       <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />

// // //       <Animated.View style={[styles.mapContainer, { height: mapHeight }]}>
// // //         <MapView
// // //           ref={mapRef}
// // //           provider={PROVIDER_GOOGLE}
// // //           style={styles.map}
// // //           initialRegion={initialRegion}
// // //           onMapReady={() => setMapReady(true)}
// // //           showsUserLocation={false}
// // //           showsMyLocationButton={false}
// // //           zoomEnabled={true}
// // //           zoomControlEnabled={true}
// // //         >
// // //           {/* Main route polyline with gradient effect */}
// // //           {routePath.length >= 2 && (
// // //             <>
// // //               <Polyline 
// // //                 coordinates={routePath} 
// // //                 strokeColor="#2457A6" 
// // //                 strokeWidth={6} 
// // //                 lineCap="round" 
// // //                 lineJoin="round"
// // //               />
// // //               <Polyline 
// // //                 coordinates={routePath} 
// // //                 strokeColor="#4A7DFF" 
// // //                 strokeWidth={3} 
// // //                 lineCap="round" 
// // //                 lineJoin="round"
// // //                 lineDashPattern={[0]}
// // //               />
// // //             </>
// // //           )}
          
// // //           {/* Walking paths for pickup and dropoff */}
// // //           {walkingPaths.map(path => renderWalkingPath(path))}
          
// // //           {/* Proximity circles for pickup points */}
// // //           {getAllMapMarkers.filter(m => m.type === 'pickup' && m.walkDistance).map(marker => (
// // //             <Circle
// // //               key={`circle-${marker.id}`}
// // //               center={marker.coordinate}
// // //               radius={marker.walkDistance}
// // //               strokeColor="rgba(16, 185, 129, 0.3)"
// // //               fillColor="rgba(16, 185, 129, 0.1)"
// // //               strokeWidth={1}
// // //             />
// // //           ))}
          
// // //           {/* All markers */}
// // //           {getAllMapMarkers.map(marker => renderMarker(marker))}
// // //         </MapView>

// // //         <TouchableOpacity style={styles.mapBackButton} onPress={() => navigation.goBack()}>
// // //           <Ionicons name="chevron-back" size={26} color={Colors.secondary} />
// // //         </TouchableOpacity>
        
// // //         {/* Map Legend */}
// // //         <View style={styles.mapLegend}>
// // //           <View style={styles.legendTitle}>
// // //             <Text style={styles.legendTitleText}>Map Legend</Text>
// // //           </View>
// // //           <View style={styles.legendItem}>
// // //             <View style={[styles.legendColor, { backgroundColor: '#2457A6', width: 20 }]} />
// // //             <Text style={styles.legendText}>Main Route</Text>
// // //           </View>
// // //           <View style={styles.legendItem}>
// // //             <View style={[styles.legendColor, { backgroundColor: '#10B981', borderStyle: 'dashed', borderWidth: 1, borderColor: '#10B981' }]} />
// // //             <Text style={styles.legendText}>Walking (Pickup)</Text>
// // //           </View>
// // //           <View style={styles.legendItem}>
// // //             <View style={[styles.legendColor, { backgroundColor: '#F59E0B', borderStyle: 'dashed', borderWidth: 1, borderColor: '#F59E0B' }]} />
// // //             <Text style={styles.legendText}>Walking (Dropoff)</Text>
// // //           </View>
// // //           <View style={styles.legendItem}>
// // //             <View style={[styles.legendDot, { backgroundColor: '#10B981' }]} />
// // //             <Text style={styles.legendText}>Pickup Point</Text>
// // //           </View>
// // //           <View style={styles.legendItem}>
// // //             <View style={[styles.legendDot, { backgroundColor: '#F59E0B' }]} />
// // //             <Text style={styles.legendText}>Dropoff Point</Text>
// // //           </View>
// // //         </View>
        
// // //         {/* Map Controls */}
// // //         <View style={styles.mapControls}>
// // //           <TouchableOpacity 
// // //             style={styles.mapControlButton} 
// // //             onPress={() => fitMapToMarkers()}
// // //           >
// // //             <Ionicons name="map-outline" size={20} color="#2457A6" />
// // //           </TouchableOpacity>
// // //         </View>
// // //       </Animated.View>

// // //       <Animated.View style={[styles.drawer, { height: drawerHeight }]}>
// // //         <View style={styles.handleWrap} {...panResponder.panHandlers}>
// // //           <TouchableOpacity activeOpacity={0.9} onPress={toggleDrawer} style={styles.handleHitArea}>
// // //             <View style={styles.handleBar} />
// // //           </TouchableOpacity>
// // //           {!drawerExpanded && pendingMods.length > 0 && (
// // //             <View style={styles.pendingNotificationBadge}>
// // //               <Text style={styles.pendingNotificationText}>{pendingMods.length}</Text>
// // //             </View>
// // //           )}
// // //         </View>

// // //         {!drawerExpanded ? (
// // //           <View style={styles.collapsedSummary}>
// // //             <View style={styles.collapsedTopRow}>
// // //               <View style={{ flex: 1 }}>
// // //                 <Text style={styles.collapsedDriver} numberOfLines={1}>{ride?.driverName || 'Driver'}</Text>
// // //                 <Text style={styles.collapsedSub} numberOfLines={1}>{ride?.origin || 'Pickup'} → {ride?.destination || 'Drop'}</Text>
// // //               </View>
// // //               <View style={styles.collapsedPriceWrap}>
// // //                 <Text style={styles.collapsedPrice}>₹{ride?.price_per_seat}</Text>
// // //                 <Text style={styles.collapsedPerSeat}>per seat</Text>
// // //               </View>
// // //             </View>
// // //             {sortedTripTimeline.length > 0 && sortedTripTimeline[0]?.totalDistance && (
// // //               <View style={styles.collapsedTripInfo}>
// // //                 <Text style={styles.collapsedTripText}>
// // //                   📍 {sortedTripTimeline.length} stops • {sortedTripTimeline[0].totalDistance} km • {formatDuration(sortedTripTimeline[0].totalDuration)}
// // //                 </Text>
// // //               </View>
// // //             )}
// // //           </View>
// // //         ) : (
// // //           <ScrollView ref={scrollViewRef} style={styles.drawerScroll} contentContainerStyle={styles.drawerContent} showsVerticalScrollIndicator={false}>
            
// // //             {/* Status Banner with Detailed Reason for Auto-cancel */}
// // //             <View style={[styles.statusBanner, { backgroundColor: rideStatus.color + '20' }]}>
// // //               <Ionicons name={rideStatus.icon} size={20} color={rideStatus.color} />
// // //               <View style={{ flex: 1 }}>
// // //                 <Text style={[styles.statusBannerText, { color: rideStatus.color }]}>{rideStatus.text}</Text>
// // //                 {rideStatus.reason && (
// // //                   <Text style={[styles.statusBannerReason, { color: rideStatus.color }]}>{rideStatus.reason}</Text>
// // //                 )}
// // //               </View>
// // //             </View>

// // //             {/* Auto-cancellation Detailed Banner */}
// // //             {/* {rideStatus.type === 'auto-cancelled' && (
// // //               <View style={styles.autoCancelDetailsBanner}>
// // //                 <View style={styles.autoCancelHeader}>
// // //                   <Ionicons name="timer-off" size={24} color="#9CA3AF" />
// // //                   <Text style={styles.autoCancelTitle}>Ride Auto-Cancelled</Text>
// // //                 </View>
// // //                 <Text style={styles.autoCancelMessage}>
// // //                   {rideStatus.reason || "This ride was automatically cancelled as it was not started within 2 hours of the scheduled departure time."}
// // //                 </Text>
// // //                 <View style={styles.autoCancelFooter}>
// // //                   <Ionicons name="information-circle" size={14} color="#9CA3AF" />
// // //                   <Text style={styles.autoCancelFooterText}>
// // //                     Departure was at {formatDate(ride?.departure_time)}
// // //                   </Text>
// // //                 </View>
// // //               </View>
// // //             )} */}

// // //             {/* Cancellation Banner with Reason */}
// // //             {rideStatus.type === 'cancelled' && ride?.cancellation_reason && (
// // //               <View style={styles.cancellationDetailedBanner}>
// // //                 <View style={styles.cancellationHeader}>
// // //                   <Ionicons name="close-circle" size={24} color="#DC2626" />
// // //                   <Text style={styles.cancellationTitle}>Ride Cancelled</Text>
// // //                 </View>
// // //                 <Text style={styles.cancellationMessage}>{ride.cancellation_reason}</Text>
// // //                 {ride.cancelled_by && (
// // //                   <Text style={styles.cancelledByText}>
// // //                     Cancelled by: {ride.cancelled_by === user?.phone_number ? 'You' : 'Driver'}
// // //                   </Text>
// // //                 )}
// // //               </View>
// // //             )}

// // //             {/* Trip Overview Card */}
// // //             <View style={styles.tripOverviewCard}>
// // //               <View style={styles.tripOverviewHeader}>
// // //                 <Ionicons name="information-circle-outline" size={24} color="#2457A6" />
// // //                 <Text style={styles.tripOverviewTitle}>Trip Overview</Text>
// // //               </View>
// // //               <View style={styles.tripOverviewDetails}>
// // //                 <View style={styles.tripOverviewItem}>
// // //                   <Text style={styles.tripOverviewLabel}>From</Text>
// // //                   <Text style={styles.tripOverviewValue}>{ride?.origin || 'Starting point'}</Text>
// // //                 </View>
// // //                 <View style={styles.tripOverviewArrow}>
// // //                   <Ionicons name="arrow-down-outline" size={16} color="#2457A6" />
// // //                 </View>
// // //                 <View style={styles.tripOverviewItem}>
// // //                   <Text style={styles.tripOverviewLabel}>To</Text>
// // //                   <Text style={styles.tripOverviewValue}>{ride?.destination || 'Destination'}</Text>
// // //                 </View>
// // //               </View>
// // //               <View style={styles.tripOverviewStats}>
// // //                 <View style={styles.tripOverviewStat}>
// // //                   <Ionicons name="calendar-outline" size={16} color="#6B7280" />
// // //                   <Text style={styles.tripOverviewStatText}>{formatDate(ride?.departure_time)}</Text>
// // //                 </View>
// // //                 {sortedTripTimeline[0]?.totalDistance && (
// // //                   <View style={styles.tripOverviewStat}>
// // //                     <Ionicons name="map-outline" size={16} color="#6B7280" />
// // //                     <Text style={styles.tripOverviewStatText}>{sortedTripTimeline[0].totalDistance} km total</Text>
// // //                   </View>
// // //                 )}
// // //                 {sortedTripTimeline[0]?.totalDuration && (
// // //                   <View style={styles.tripOverviewStat}>
// // //                     <Ionicons name="time-outline" size={16} color="#6B7280" />
// // //                     <Text style={styles.tripOverviewStatText}>{formatDuration(sortedTripTimeline[0].totalDuration)} est.</Text>
// // //                   </View>
// // //                 )}
// // //               </View>
// // //             </View>
// // // {/* Total Earnings Banner - Show when ride is completed */}
// // // {isCompleted && totalEarnings > 0 && (
// // //   <View style={styles.earningsBanner}>
// // //     <View style={styles.earningsBannerLeft}>
// // //       <View style={styles.earningsIconContainer}>
// // //         <Ionicons name="cash-outline" size={28} color="#10B981" />
// // //       </View>
// // //       <View>
// // //         <Text style={styles.earningsLabel}>Total Earnings</Text>
// // //         <Text style={styles.earningsSubLabel}>From confirmed bookings</Text>
// // //       </View>
// // //     </View>
// // //     <View style={styles.earningsAmountContainer}>
// // //       <Text style={styles.earningsCurrency}>₹</Text>
// // //       <Text style={styles.earningsAmount}>{totalEarnings}</Text>
// // //     </View>
// // //   </View>
// // // )}

// // // {/* Earnings Breakdown - Show when ride is completed */}
// // // {isCompleted && confirmedBookings.length > 0 && (
// // //   <View style={styles.earningsBreakdownCard}>
// // //     <Text style={styles.earningsBreakdownTitle}>Earnings Breakdown</Text>
// // //     {confirmedBookings.map((booking, index) => (
// // //       <View key={booking.booking_id} style={styles.earningsRow}>
// // //         <View style={styles.earningsRowLeft}>
// // //           <View style={styles.earningsRowAvatar}>
// // //             <Text style={styles.earningsRowInitials}>
// // //               {getInitials(booking.passenger_name)}
// // //             </Text>
// // //           </View>
// // //           <View>
// // //             <Text style={styles.earningsRowName}>{booking.passenger_name || 'Rider'}</Text>
// // //             <Text style={styles.earningsRowSeats}>{booking.seats_booked} seat(s)</Text>
// // //           </View>
// // //         </View>
// // //         <Text style={styles.earningsRowAmount}>
// // //           ₹{booking.total_amount || booking.seats_booked * (ride?.price_per_seat || 0)}
// // //         </Text>
// // //       </View>
// // //     ))}
// // //     <View style={styles.earningsDivider} />
// // //     <View style={styles.earningsTotalRow}>
// // //       <Text style={styles.earningsTotalLabel}>Total</Text>
// // //       <Text style={styles.earningsTotalAmount}>₹{totalEarnings}</Text>
// // //     </View>
// // //   </View>
// // // )} 
// // //             {/* Enhanced Trip Timeline Section */}
// // //             <View style={styles.cardSection}>
// // //               <TouchableOpacity 
// // //                 style={styles.timelineHeader} 
// // //                 onPress={() => setTimelineExpanded(!timelineExpanded)}
// // //               >
// // //                 <View style={styles.timelineHeaderLeft}>
// // //                   <Ionicons name="map-outline" size={20} color="#2457A6" />
// // //                   <Text style={styles.sectionTitle}>Trip Timeline</Text>
// // //                   <Text style={styles.timelineStopCount}>({sortedTripTimeline.length} stops)</Text>
// // //                 </View>
// // //                 <Ionicons 
// // //                   name={timelineExpanded ? "chevron-up" : "chevron-down"} 
// // //                   size={20} 
// // //                   color={Colors.gray} 
// // //                 />
// // //               </TouchableOpacity>
              
// // //               {timelineExpanded && (
// // //                 <View style={styles.timelineContainer}>
// // //                   {sortedTripTimeline.map((item, index) => renderTimelineItem(item, index))}
// // //                 </View>
// // //               )}
// // //             </View>

// // //             {/* Vehicle Details */}
// // //             <View style={styles.cardSection}>
// // //               <Text style={styles.sectionTitle}>Vehicle Details</Text>
// // //               <View style={styles.vehicleHeaderRow}>
// // //                 <View style={styles.vehicleIconCircle}><Ionicons name="car-sport-outline" size={24} color="#2457A6" /></View>
// // //                 <View style={styles.vehicleMeta}>
// // //                   <Text style={styles.vehicleTitle}>{vehicleName}</Text>
// // //                   {vehicleRegNumber && (
// // //                     <View style={styles.vehicleRegContainer}>
// // //                       <Ionicons name="clipboard-outline" size={12} color="#6B7280" />
// // //                       <Text style={styles.vehicleRegText}>Reg: {vehicleRegNumber}</Text>
// // //                     </View>
// // //                   )}
// // //                 </View>
// // //               </View>
// // //             </View>

// // //             {/* Seat Information */}
// // //            {/* Seat Information - Updated with accurate available seats */}
// // // <View style={styles.cardSection}>
// // //   <Text style={styles.sectionTitle}>Seat Information</Text>
// // //   <View style={styles.seatInfoContainer}>
// // //     <View style={styles.seatInfoItem}>
// // //       <View style={[styles.seatIconCircle, { backgroundColor: '#EAF1FF' }]}>
// // //         <Ionicons name="car-sport-outline" size={24} color="#2457A6" />
// // //       </View>
// // //       <Text style={styles.seatInfoLabel}>Total</Text>
// // //       <Text style={styles.seatInfoValue}>{totalSeatsOffered}</Text>
// // //     </View>
// // //     <View style={styles.seatDivider} />
// // //     <View style={styles.seatInfoItem}>
// // //       <View style={[styles.seatIconCircle, { backgroundColor: '#E8F5E9' }]}>
// // //         <Ionicons name="people" size={24} color="#10B981" />
// // //       </View>
// // //       <Text style={styles.seatInfoLabel}>Booked</Text>
// // //       <Text style={[styles.seatInfoValue, { color: '#10B981' }]}>{getActualBookedSeats()}</Text>
// // //     </View>
// // //     <View style={styles.seatDivider} />
// // //     <View style={styles.seatInfoItem}>
// // //       <View style={[styles.seatIconCircle, { backgroundColor: '#FFF3E0' }]}>
// // //         <Ionicons name="person-add" size={24} color="#F59E0B" />
// // //       </View>
// // //       <Text style={styles.seatInfoLabel}>Available</Text>
// // //       <Text style={[styles.seatInfoValue, { color: getActualAvailableSeats() > 0 ? '#F59E0B' : '#DC2626' }]}>
// // //         {getActualAvailableSeats()}
// // //       </Text>
// // //     </View>
// // //   </View>
// // //   <View style={styles.progressBarContainer}>
// // //     <View style={[styles.progressBar, { width: `${totalSeatsOffered > 0 ? (getActualBookedSeats() / totalSeatsOffered) * 100 : 0}%` }]} />
// // //   </View>
// // //   <Text style={styles.progressText}>
// // //     {getActualBookedSeats()} out of {totalSeatsOffered} seats booked
// // //     {getActualAvailableSeats() > 0 && ` • ${getActualAvailableSeats()} seats available`}
// // //   </Text>
// // // </View>

// // //   {/* Confirmed Bookings - Always show if there are confirmed bookings */}
// // // {confirmedBookings.length > 0 && (
// // //   <View style={styles.cardSection}>
// // //     <View style={styles.sectionHeaderWithStatus}>
// // //       <Text style={styles.sectionTitle}>Bookings ✅ ({confirmedBookings.length})</Text>
// // //       {(rideStatus.type === 'auto-cancelled' || rideStatus.type === 'cancelled') && (
// // //         <View style={styles.cancelledBadgeSmall}>
// // //           <Text style={styles.cancelledBadgeSmallText}>Ride Cancelled</Text>
// // //         </View>
// // //       )}
// // //     </View>
    
// // //     {/* In the confirmed bookings mapping, add modification status display */}
// // // {confirmedBookings.map((booking) => {
// // //   const profilePicUrl = booking.profile_picture ? buildImageUrl(booking.profile_picture) : null;
// // //   const isSvg = profilePicUrl ? isSvgUrl(profilePicUrl) : false;
  
// // //   // Check if this booking has a pending or rejected modification
// // //   const hasPendingModification = pendingModifications.some(
// // //     pm => pm.booking_id === booking.booking_id && pm.status === 'pending'
// // //   );
// // //   const hasRejectedModification = pendingModifications.some(
// // //     pm => pm.booking_id === booking.booking_id && pm.status === 'rejected'
// // //   );
  
// // //   // Determine rider-specific status
// // //   const isRideCancelled = rideStatus.type === 'auto-cancelled' || rideStatus.type === 'cancelled';
// // //   const isBookingRejected = booking.status === 'rejected';
// // //   const isBookingCancelled = booking.status === 'cancelled';
// // //   const showRiderStatus = isRideCancelled || isBookingRejected || isBookingCancelled;
  
// // //   // Don't show location info if ride is cancelled
// // //   const showLocationInfo = !isRideCancelled && !isBookingRejected && !isBookingCancelled;
  
// // //   return (
// // //     <View key={booking.booking_id} style={[
// // //       styles.bookingItem, 
// // //       (isRideCancelled || isBookingRejected || isBookingCancelled) && styles.disabledBookingItem
// // //     ]}>
// // //       {/* Avatar section */}
// // //       <TouchableOpacity 
// // //         style={styles.passengerAvatar} 
// // //         onPress={() => profilePicUrl && setSelectedProfile({ visible: true, imageUrl: profilePicUrl, name: booking.passenger_name })}
// // //         disabled={showRiderStatus}
// // //       >
// // //         {profilePicUrl && !isSvg ? 
// // //           <Image source={{ uri: profilePicUrl }} style={styles.avatarImage} /> : 
// // //           profilePicUrl && isSvg ? 
// // //             <View style={styles.avatarImageSvg}>
// // //               <SvgCssUri uri={profilePicUrl} width={44} height={44} />
// // //             </View> : 
// // //             <View style={styles.avatarPlaceholder}>
// // //               <Text style={styles.avatarPlaceholderText}>{getInitials(booking.passenger_name)}</Text>
// // //             </View>
// // //         }
// // //       </TouchableOpacity>
      
// // //       <View style={styles.bookingInfo}>
// // //         <Text style={styles.passengerName}>{booking.passenger_name || 'Passenger'}</Text>
        
// // //         {/* Show modification status */}
// // //         {hasPendingModification && !showRiderStatus && (
// // //           <View style={styles.modificationStatusBadge}>
// // //             <Ionicons name="swap" size={12} color="#F59E0B" />
// // //             <Text style={[styles.modificationStatusText, { color: '#F59E0B' }]}>
// // //               Modification Request Pending
// // //             </Text>
// // //           </View>
// // //         )}
        
// // //         {hasRejectedModification && !showRiderStatus && (
// // //           <View style={[styles.modificationStatusBadge, { backgroundColor: '#FEF2F2' }]}>
// // //             <Ionicons name="close-circle" size={12} color="#DC2626" />
// // //             <Text style={[styles.modificationStatusText, { color: '#DC2626' }]}>
// // //               Modification Request Rejected - Original Booking Active
// // //             </Text>
// // //           </View>
// // //         )}
        
// // //         <Text style={styles.bookingSeats}>
// // //           <Ionicons name="people-outline" size={12} color={Colors.gray} /> 
// // //           {booking.seats_booked} seat{booking.seats_booked > 1 ? 's' : ''}
// // //         </Text>
        
// // //         {/* Show rider-specific cancellation/rejection status */}
// // //         {showRiderStatus && (
// // //           <View style={styles.riderStatusContainer}>
// // //             <View style={[
// // //               styles.riderStatusBadge, 
// // //               { backgroundColor: isBookingRejected ? '#FEE2E2' : '#F3F4F6' }
// // //             ]}>
// // //               <Ionicons 
// // //                 name={isBookingRejected ? "close-circle" : (isBookingCancelled ? "alert-circle" : "warning")} 
// // //                 size={12} 
// // //                 color={isBookingRejected ? "#DC2626" : (isBookingCancelled ? "#F59E0B" : "#9CA3AF")} 
// // //               />
// // //               <Text style={[
// // //                 styles.riderStatusText,
// // //                 { color: isBookingRejected ? "#DC2626" : (isBookingCancelled ? "#F59E0B" : "#6B7280") }
// // //               ]}>
// // //                 {isBookingRejected ? "Booking Rejected" : 
// // //                  isBookingCancelled ? "Booking Cancelled" : 
// // //                  "Ride Cancelled"}
// // //               </Text>
// // //             </View>
// // //           </View>
// // //         )}
        
// // //         {/* Show walking distance info - only if ride is active */}
// // //         {showLocationInfo && booking.pickup_walk_distance_m > 0 && (
// // //           <Text style={styles.walkingInfoText}>
// // //             <Ionicons name="walk" size={10} color="#10B981" /> Pickup: {booking.pickup_walk_distance_m}m walk
// // //           </Text>
// // //         )}
        
// // //         {showLocationInfo && booking.drop_walk_distance_m > 0 && (
// // //           <Text style={styles.walkingInfoText}>
// // //             <Ionicons name="walk" size={10} color="#F59E0B" /> Dropoff: {booking.drop_walk_distance_m}m walk
// // //           </Text>
// // //         )}
// // //       </View>
      
// // //       <View style={styles.bookingActions}>
// // //         <View style={[styles.bookingStatusBadge, { backgroundColor: getStatusColor(booking.status) + '20' }]}>
// // //           <Text style={[styles.bookingStatusText, { color: getStatusColor(booking.status) }]}>
// // //             {getStatusText(booking.status)}
// // //           </Text>
// // //         </View>
        
// // //         {/* Only show chat button if ride is active and not cancelled */}
// // //         {!showRiderStatus && rideStatus.type !== 'auto-cancelled' && rideStatus.type !== 'cancelled' && (
// // //           <TouchableOpacity 
// // //             style={styles.chatButton} 
// // //             onPress={() => handleChatWithPassenger(booking.passenger_phone, booking.passenger_name, booking.profile_picture)}
// // //           >
// // //             <Ionicons name="chatbubble-ellipses" size={22} color={Colors.primary} />
// // //           </TouchableOpacity>
// // //         )}
// // //       </View>
// // //     </View>
// // //   );
// // // })}
    
// // //     {/* Show cancellation note for cancelled rides */}
// // //     {(rideStatus.type === 'auto-cancelled' || rideStatus.type === 'cancelled') && (
// // //       <View style={styles.cancelledNoteContainer}>
// // //         <Ionicons name="information-circle" size={14} color="#9CA3AF" />
// // //         <Text style={styles.cancelledNoteText}>
// // //           These bookings were cancelled due to ride cancellation.
// // //         </Text>
// // //       </View>
// // //     )}
// // //   </View>
// // // )}
// // //             {/* Action Buttons - Hide for auto-cancelled rides */}
// // //             {!isOngoing && !isCompleted && showStartRide && rideStatus.type !== 'auto-cancelled' && rideStatus.type !== 'cancelled' && (
// // //               <>
// // //                 <View style={styles.actionButtonsRow}>
// // //                   <TouchableOpacity style={styles.editButton} onPress={handleEditRide}>
// // //                     <Ionicons name="create-outline" size={18} color={Colors.primary} />
// // //                     <Text style={styles.editButtonText}>Edit Ride</Text>
// // //                   </TouchableOpacity>
// // //                   <TouchableOpacity style={styles.cancelButton} onPress={handleCancelRide}>
// // //                     <Ionicons name="close-circle-outline" size={18} color="#DC2626" />
// // //                     <Text style={styles.cancelButtonText}>Cancel Ride</Text>
// // //                   </TouchableOpacity>
// // //                 </View>
// // //                 <TouchableOpacity style={styles.startRideButton} onPress={handleStartRide}>
// // //                   <Ionicons name="car-sport" size={20} color="#fff" />
// // //                   <Text style={styles.startRideButtonText}>Start Ride Now</Text>
// // //                 </TouchableOpacity>
// // //               </>
// // //             )}

// // //             {/* Ongoing Ride Button */}
// // //             {showLiveSession && (
// // //               <TouchableOpacity style={styles.liveSessionButton} onPress={() => navigation.navigate('OngoingRideDriverScreen', { rideId: ride?.id, sessionId: ride?.live_session?.session_id })}>
// // //                 <Ionicons name="navigate-circle" size={20} color="#fff" />
// // //                 <Text style={styles.liveSessionButtonText}>Continue Ongoing Ride</Text>
// // //               </TouchableOpacity>
// // //             )}

// // //             {/* Pending Bookings - Hide for auto-cancelled rides */}
// // //             {pendingBookings.length > 0 && !areModificationsLocked() && rideStatus.type !== 'auto-cancelled' && rideStatus.type !== 'cancelled' && (
// // //               <View style={styles.cardSection}>
// // //                 <Text style={[styles.sectionTitle, { color: '#F59E0B' }]}>Pending Requests ⏳ ({pendingBookings.length})</Text>
// // //                 {pendingBookings.map((booking) => {
// // //                   const profilePicUrl = booking.profile_picture ? buildImageUrl(booking.profile_picture) : null;
// // //                   const isSvg = profilePicUrl ? isSvgUrl(profilePicUrl) : false;
// // //                   return (
// // //                     <View key={booking.booking_id} style={styles.bookingItem}>
// // //                       <TouchableOpacity style={styles.passengerAvatar} onPress={() => profilePicUrl && setSelectedProfile({ visible: true, imageUrl: profilePicUrl, name: booking.passenger_name })}>
// // //                         {profilePicUrl && !isSvg ? <Image source={{ uri: profilePicUrl }} style={styles.avatarImage} /> : profilePicUrl && isSvg ? <View style={styles.avatarImageSvg}><SvgCssUri uri={profilePicUrl} width={44} height={44} /></View> : <View style={styles.avatarPlaceholder}><Text style={styles.avatarPlaceholderText}>{getInitials(booking.passenger_name)}</Text></View>}
// // //                       </TouchableOpacity>
// // //                       <View style={styles.bookingInfo}>
// // //                         <Text style={styles.passengerName}>{booking.passenger_name || 'Passenger'}</Text>
// // //                         <Text style={styles.bookingSeats}><Ionicons name="people-outline" size={12} color={Colors.gray} /> {booking.seats_booked} seat{booking.seats_booked > 1 ? 's' : ''}</Text>
// // //                       </View>
// // //                       <View style={styles.pendingActions}>
// // //                         <TouchableOpacity style={[styles.actionSmallBtn, styles.acceptBtn]} onPress={() => handleBookingAction(booking.booking_id, 'accept')}>
// // //                           <Ionicons name="checkmark" size={16} color="#fff" />
// // //                         </TouchableOpacity>
// // //                         <TouchableOpacity style={[styles.actionSmallBtn, styles.rejectBtn]} onPress={() => handleBookingAction(booking.booking_id, 'reject')}>
// // //                           <Ionicons name="close" size={16} color="#fff" />
// // //                         </TouchableOpacity>
// // //                       </View>
// // //                     </View>
// // //                   );
// // //                 })}
// // //               </View>
// // //             )}

// // //             <View style={styles.safetyCard}>
// // //               <View style={styles.simpleInfoLeft}>
// // //                 <Ionicons name="shield-checkmark-outline" size={20} color="#2457A6" />
// // //                 <View>
// // //                   <Text style={styles.safetyTitle}>Safety First</Text>
// // //                   <Text style={styles.safetySub}>Live GPS tracking & 24/7 support</Text>
// // //                 </View>
// // //               </View>
// // //             </View>
// // //             <View style={{ height: 110 }} />
// // //           </ScrollView>
// // //         )}
// // //       </Animated.View>

// // //       {/* Conflict Resolution Modal */}
// // //       <Modal visible={conflictModalVisible} transparent animationType="fade">
// // //         <View style={styles.modalBackdrop}>
// // //           <View style={styles.conflictModalContent}>
// // //             <View style={styles.conflictModalHeader}>
// // //               <Ionicons name="alert-circle" size={48} color="#F59E0B" />
// // //               <Text style={styles.conflictModalTitle}>Driver's Choice Required</Text>
// // //             </View>
// // //             <Text style={styles.conflictModalMessage}>There are two requests for this ride. Please choose which one to accept.</Text>
// // //             {conflictData?.modification_request && (
// // //               <View style={styles.conflictRequestCard}>
// // //                 <View style={styles.conflictRequestHeader}>
// // //                   <Ionicons name="swap" size={24} color="#F59E0B" />
// // //                   <Text style={styles.conflictRequestTitle}>Modification Request</Text>
// // //                 </View>
// // //                 <Text style={styles.conflictRequestDetails}>
// // //                   <Text style={{ fontWeight: 'bold' }}>Rider:</Text> {conflictData.modification_request.passenger_name}
// // //                 </Text>
// // //                 <Text style={styles.conflictRequestDetails}>
// // //                   <Text style={{ fontWeight: 'bold' }}>Seats:</Text> {conflictData.modification_request.current_seats} → {conflictData.modification_request.requested_seats}
// // //                 </Text>
// // //               </View>
// // //             )}
// // //             {conflictData?.booking_request && (
// // //               <View style={styles.conflictRequestCard}>
// // //                 <View style={styles.conflictRequestHeader}>
// // //                   <Ionicons name="person-add" size={24} color="#10B981" />
// // //                   <Text style={styles.conflictRequestTitle}>New Booking Request</Text>
// // //                 </View>
// // //                 <Text style={styles.conflictRequestDetails}>
// // //                   <Text style={{ fontWeight: 'bold' }}>Rider:</Text> {conflictData.booking_request.passenger_name}
// // //                 </Text>
// // //                 <Text style={styles.conflictRequestDetails}>
// // //                   <Text style={{ fontWeight: 'bold' }}>Seats:</Text> {conflictData.booking_request.seats_requested} seat(s)
// // //                 </Text>
// // //               </View>
// // //             )}
// // //             <Text style={styles.conflictModalSeatsInfo}>
// // //               Available seats: {conflictData?.available_seats} / {conflictData?.total_seats}
// // //             </Text>
// // //             <View style={styles.conflictModalButtons}>
// // //               {conflictData?.modification_request && (
// // //                 <TouchableOpacity 
// // //                   style={[styles.conflictModalBtn, styles.approveModBtn]} 
// // //                   onPress={() => resolveConcurrentRequest('modification', conflictData.modification_request.id, null)} 
// // //                   disabled={resolvingConflict}
// // //                 >
// // //                   <Text style={styles.conflictModalBtnText}>
// // //                     {resolvingConflict ? 'Processing...' : 'Accept Modification'}
// // //                   </Text>
// // //                 </TouchableOpacity>
// // //               )}
// // //               {conflictData?.booking_request && (
// // //                 <TouchableOpacity 
// // //                   style={[styles.conflictModalBtn, styles.acceptBtn]} 
// // //                   onPress={() => resolveConcurrentRequest('booking', null, conflictData.booking_request.id)} 
// // //                   disabled={resolvingConflict}
// // //                 >
// // //                   <Text style={styles.conflictModalBtnText}>
// // //                     {resolvingConflict ? 'Processing...' : 'Accept Booking'}
// // //                   </Text>
// // //                 </TouchableOpacity>
// // //               )}
// // //             </View>
// // //             <TouchableOpacity style={styles.conflictModalCloseBtn} onPress={() => setConflictModalVisible(false)}>
// // //               <Text style={styles.conflictModalCloseBtnText}>Close</Text>
// // //             </TouchableOpacity>
// // //           </View>
// // //         </View>
// // //       </Modal>

// // //       {/* Rating Modal */}
// // //       <Modal visible={ratingModalVisible} transparent animationType="fade">
// // //         <View style={styles.modalBackdrop}>
// // //           <View style={styles.modalCard}>
// // //             <Text style={styles.modalTitle}>Rate Your Rider</Text>
// // //             <Text style={styles.modalSub}>How was your ride with {selectedRider?.passenger_name || 'this rider'}?</Text>
// // //             {renderStars()}
// // //             <TextInput 
// // //               value={feedback} 
// // //               onChangeText={setFeedback} 
// // //               placeholder="Share your feedback (optional)" 
// // //               multiline 
// // //               numberOfLines={3} 
// // //               style={styles.feedbackInput} 
// // //               textAlignVertical="top" 
// // //             />
// // //             <View style={styles.modalActions}>
// // //               <TouchableOpacity style={styles.skipBtn} onPress={() => setRatingModalVisible(false)}>
// // //                 <Text style={styles.skipBtnText}>Cancel</Text>
// // //               </TouchableOpacity>
// // //               <TouchableOpacity 
// // //                 style={[styles.submitBtn, rating === 0 && { opacity: 0.5 }]} 
// // //                 onPress={submitRiderRating} 
// // //                 disabled={rating === 0}
// // //               >
// // //                 <Text style={styles.submitBtnText}>Submit Rating</Text>
// // //               </TouchableOpacity>
// // //             </View>
// // //           </View>
// // //         </View>
// // //       </Modal>

// // //       <ProfileImageModal 
// // //         visible={selectedProfile.visible} 
// // //         imageUrl={selectedProfile.imageUrl} 
// // //         name={selectedProfile.name} 
// // //         onClose={() => setSelectedProfile({ visible: false, imageUrl: null, name: '' })} 
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
// // //     </View>
// // //   );
// // // }

// // // // Enhanced Styles with new banners for auto-cancellation
// // // const styles = StyleSheet.create({
// // //   container: { flex: 1, backgroundColor: '#F4F5F7' },
// // //   mapContainer: { width: '100%', overflow: 'hidden', backgroundColor: '#E8EEF7', position: 'relative' },
// // //   map: { flex: 1, backgroundColor: '#E8EEF7' },
// // //   mapBackButton: { position: 'absolute', top: Platform.OS === 'ios' ? 54 : 22, left: 14, width: 42, height: 42, borderRadius: 25, backgroundColor: 'rgba(255,255,255,0.96)', alignItems: 'center', justifyContent: 'center', shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4, elevation: 3 },
// // //   mapLegend: { position: 'absolute', bottom: 10, right: 10, backgroundColor: 'rgba(255,255,255,0.95)', borderRadius: 12, padding: 10, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4, elevation: 3, minWidth: 120 },
// // //   legendTitle: { marginBottom: 6, paddingBottom: 4, borderBottomWidth: 1, borderBottomColor: '#E5E7EB' },
// // //   legendTitleText: { fontSize: 11, fontWeight: '700', color: '#333' },
// // //   legendItem: { flexDirection: 'row', alignItems: 'center', marginBottom: 4 },
// // //   legendColor: { width: 16, height: 4, borderRadius: 2, marginRight: 6 },
// // //   legendDot: { width: 10, height: 10, borderRadius: 5, marginRight: 8 },
// // //   legendText: { fontSize: 10, color: '#555' },
// // //   mapControls: { position: 'absolute', bottom: 10, left: 10 },
// // //   mapControlButton: { backgroundColor: 'rgba(255,255,255,0.95)', width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center', shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4, elevation: 3 },
// // //   customMarker: { alignItems: 'center', justifyContent: 'center', borderWidth: 2, borderColor: '#fff', shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.25, shadowRadius: 4, elevation: 5, position: 'relative' },
// // //   markerBadge: { position: 'absolute', top: -5, right: -5, backgroundColor: '#fff', borderRadius: 10, minWidth: 18, height: 18, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: '#10B981' },
// // //   markerBadgeText: { fontSize: 10, fontWeight: 'bold', color: '#10B981' },
// // //   walkBadge: { position: 'absolute', bottom: -8, left: '50%', transform: [{ translateX: -15 }], flexDirection: 'row', alignItems: 'center', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 10, gap: 2 },
// // //   walkBadgeText: { fontSize: 8, color: '#fff', fontWeight: 'bold' },
// // //   drawer: { position: 'absolute', bottom: 0, left: 0, right: 0, backgroundColor: '#F4F5F7', borderTopLeftRadius: 28, borderTopRightRadius: 28, overflow: 'hidden', shadowColor: '#000', shadowOffset: { width: 0, height: -2 }, shadowOpacity: 0.1, shadowRadius: 8, elevation: 10 },
// // //   handleWrap: { alignItems: 'center', paddingTop: 10, paddingBottom: 8, backgroundColor: '#F4F5F7', position: 'relative' },
// // //   handleHitArea: { paddingHorizontal: 40, paddingVertical: 10, alignItems: 'center', justifyContent: 'center' },
// // //   handleBar: { width: 64, height: 6, borderRadius: 99, backgroundColor: '#CDD2D8' },
// // //   pendingNotificationBadge: { position: 'absolute', right: 20, top: 8, backgroundColor: '#F59E0B', borderRadius: 12, paddingHorizontal: 8, paddingVertical: 2 },
// // //   pendingNotificationText: { color: '#fff', fontSize: 12, fontWeight: 'bold' },
// // //   collapsedSummary: { paddingHorizontal: 16, paddingTop: 4, paddingBottom: 12 },
// // //   collapsedTopRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: 12 },
// // //   collapsedDriver: { fontSize: 16, fontWeight: '800', color: Colors.dark },
// // //   collapsedSub: { marginTop: 2, fontSize: 12, color: Colors.gray, fontWeight: '600' },
// // //   collapsedPriceWrap: { alignItems: 'flex-end' },
// // //   collapsedPrice: { fontSize: 18, fontWeight: '900', color: Colors.dark },
// // //   collapsedPerSeat: { fontSize: 10, color: Colors.gray, fontWeight: '600' },
// // //   collapsedTripInfo: { marginTop: 6, paddingTop: 6, borderTopWidth: 1, borderTopColor: '#EEF2F7' },
// // //   collapsedTripText: { fontSize: 11, color: '#6B7280' },
// // //   drawerScroll: { flex: 1 },
// // //   drawerContent: { paddingHorizontal: 16, paddingBottom: 16 },
// // //   statusBanner: { flexDirection: 'row', alignItems: 'flex-start', padding: 12, borderRadius: 12, marginBottom: 14, gap: 8 },
// // //   statusBannerText: { fontSize: 13, fontWeight: '700', flex: 1 },
// // //   statusBannerReason: { fontSize: 11, marginTop: 4, opacity: 0.8 },
// // //   // Auto-cancel detailed banner
// // //   autoCancelDetailsBanner: { backgroundColor: '#F3F4F6', borderRadius: 16, padding: 16, marginBottom: 14, borderWidth: 1, borderColor: '#E5E7EB' },
// // //   autoCancelHeader: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 12 },
// // //   autoCancelTitle: { fontSize: 16, fontWeight: '700', color: '#6B7280' },
// // //   autoCancelMessage: { fontSize: 13, color: '#4B5563', lineHeight: 18, marginBottom: 12 },
// // //   autoCancelFooter: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingTop: 10, borderTopWidth: 1, borderTopColor: '#E5E7EB' },
// // //   autoCancelFooterText: { fontSize: 11, color: '#9CA3AF' },
// // //   // Cancellation detailed banner
// // //   cancellationDetailedBanner: { backgroundColor: '#FEF2F2', borderRadius: 16, padding: 16, marginBottom: 14, borderWidth: 1, borderColor: '#FEE2E2' },
// // //   cancellationHeader: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 12 },
// // //   cancellationTitle: { fontSize: 16, fontWeight: '700', color: '#DC2626' },
// // //   cancellationMessage: { fontSize: 13, color: '#7F1D1D', lineHeight: 18, marginBottom: 8 },
// // //   cancelledByText: { fontSize: 11, color: '#9CA3AF', fontStyle: 'italic' },
// // //   tripOverviewCard: { backgroundColor: '#EAF1FF', borderRadius: 20, padding: 16, marginBottom: 14 },
// // //   tripOverviewHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 12 },
// // //   tripOverviewTitle: { fontSize: 16, fontWeight: '800', color: '#2457A6' },
// // //   tripOverviewDetails: { marginBottom: 12 },
// // //   tripOverviewItem: { marginBottom: 8 },
// // //   tripOverviewLabel: { fontSize: 11, color: '#6B7280', marginBottom: 2 },
// // //   tripOverviewValue: { fontSize: 14, fontWeight: '600', color: Colors.dark },
// // //   tripOverviewArrow: { alignItems: 'center', marginVertical: 4 },
// // //   tripOverviewStats: { flexDirection: 'row', flexWrap: 'wrap', gap: 12, paddingTop: 12, borderTopWidth: 1, borderTopColor: '#CDD9F0' },
// // //   tripOverviewStat: { flexDirection: 'row', alignItems: 'center', gap: 4 },
// // //   tripOverviewStatText: { fontSize: 12, color: '#6B7280' },
// // //   cardSection: { backgroundColor: 'white', borderRadius: 20, padding: 16, marginBottom: 14, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 8, elevation: 2 },
// // //   sectionTitle: { fontSize: 16, fontWeight: '800', color: Colors.dark, marginBottom: 0 },
// // //   timelineHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
// // //   timelineHeaderLeft: { flexDirection: 'row', alignItems: 'center', gap: 8, flex: 1 },
// // //   timelineStopCount: { fontSize: 12, color: Colors.gray, fontWeight: '500', marginLeft: 4 },
// // //   timelineContainer: { marginTop: 16 },
// // //   timelineItemCard: { flexDirection: 'row', marginBottom: 20 },
// // //   timelineItemLeft: { width: 40, alignItems: 'center', position: 'relative' },
// // //   timelineItemDot: { width: 32, height: 32, borderRadius: 16, alignItems: 'center', justifyContent: 'center', borderWidth: 2, borderColor: '#fff', shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.1, shadowRadius: 2, elevation: 2 },
// // //   timelineItemIcon: { fontSize: 16 },
// // //   timelineItemLine: { width: 2, flex: 1, marginVertical: 4 },
// // //   timelineItemRight: { flex: 1, paddingLeft: 12, paddingBottom: 8 },
// // //   timelineItemHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 },
// // //   timelineItemType: { fontSize: 11, fontWeight: '700', color: '#6B7280', letterSpacing: 0.5 },
// // //   segmentBadge: { backgroundColor: '#F3F4F6', paddingHorizontal: 8, paddingVertical: 2, borderRadius: 10 },
// // //   segmentBadgeText: { fontSize: 10, color: '#6B7280', fontWeight: '500' },
// // //   timelineItemTitle: { fontSize: 15, fontWeight: '700', color: Colors.dark, marginBottom: 6 },
// // //   timelineItemDetails: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 6 },
// // //   detailChip: { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: '#F3F4F6', paddingHorizontal: 8, paddingVertical: 3, borderRadius: 12 },
// // //   detailChipText: { fontSize: 11, color: '#6B7280' },
// // //   timelineItemAddress: { fontSize: 12, color: '#6B7280', marginBottom: 8, lineHeight: 16 },
// // //   walkingChip: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 10, paddingVertical: 5, borderRadius: 16, alignSelf: 'flex-start', marginBottom: 8 },
// // //   walkingChipText: { fontSize: 11, fontWeight: '500' },
// // //   routeInfo: { flexDirection: 'row', flexWrap: 'wrap', gap: 12, marginBottom: 10, paddingTop: 6, borderTopWidth: 1, borderTopColor: '#F0F0F0' },
// // //   routeInfoItem: { flexDirection: 'row', alignItems: 'center', gap: 4 },
// // //   routeInfoText: { fontSize: 11, color: '#6B7280' },
// // //   navigateButton: { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: '#EAF1FF', paddingHorizontal: 12, paddingVertical: 8, borderRadius: 20, alignSelf: 'flex-start' },
// // //   navigateButtonText: { fontSize: 12, color: '#2457A6', fontWeight: '600' },
// // //   vehicleHeaderRow: { flexDirection: 'row', alignItems: 'center' },
// // //   vehicleIconCircle: { width: 48, height: 48, borderRadius: 24, backgroundColor: '#EAF1FF', alignItems: 'center', justifyContent: 'center', marginRight: 12 },
// // //   vehicleMeta: { flex: 1 },
// // //   vehicleTitle: { fontSize: 16, fontWeight: '800', color: Colors.dark },
// // //   vehicleRegContainer: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 6, paddingTop: 6, borderTopWidth: 1, borderTopColor: '#F0F0F0' },
// // //   vehicleRegText: { fontSize: 11, color: '#6B7280', fontWeight: '500' },
// // //   seatInfoContainer: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
// // //   seatInfoItem: { flex: 1, alignItems: 'center' },
// // //   seatIconCircle: { width: 48, height: 48, borderRadius: 24, alignItems: 'center', justifyContent: 'center', marginBottom: 8 },
// // //   seatInfoLabel: { fontSize: 11, color: Colors.gray, textAlign: 'center' },
// // //   seatInfoValue: { fontSize: 18, fontWeight: '800', color: Colors.dark, marginTop: 2 },
// // //   seatDivider: { width: 1, height: 50, backgroundColor: '#E5E7EB' },
// // //   progressBarContainer: { height: 6, backgroundColor: '#E5E7EB', borderRadius: 3, overflow: 'hidden', marginBottom: 8 },
// // //   progressBar: { height: '100%', backgroundColor: '#10B981', borderRadius: 3 },
// // //   progressText: { fontSize: 12, color: Colors.gray, textAlign: 'center' },
// // //   startRideButton: { backgroundColor: '#10B981', borderRadius: 14, paddingVertical: 14, alignItems: 'center', justifyContent: 'center', flexDirection: 'row', gap: 8, marginBottom: 12 },
// // //   startRideButtonText: { color: '#fff', fontSize: 16, fontWeight: '700' },
// // //   liveSessionButton: { backgroundColor: Colors.primary, borderRadius: 14, paddingVertical: 14, alignItems: 'center', justifyContent: 'center', flexDirection: 'row', gap: 8, marginBottom: 12 },
// // //   liveSessionButtonText: { color: '#fff', fontSize: 16, fontWeight: '700' },
// // //   actionButtonsRow: { flexDirection: 'row', gap: 10, marginBottom: 14 },
// // //   editButton: { flex: 1, borderWidth: 1, borderColor: Colors.primary, borderRadius: 14, paddingVertical: 12, alignItems: 'center', justifyContent: 'center', flexDirection: 'row', gap: 6, backgroundColor: '#fff' },
// // //   editButtonText: { color: Colors.primary, fontSize: 14, fontWeight: '600' },
// // //   cancelButton: { flex: 1, borderWidth: 1, borderColor: '#DC2626', borderRadius: 14, paddingVertical: 12, alignItems: 'center', justifyContent: 'center', flexDirection: 'row', gap: 6, backgroundColor: '#fff' },
// // //   cancelButtonText: { color: '#DC2626', fontSize: 14, fontWeight: '600' },
// // //   refreshButton: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', backgroundColor: '#EAF1FF', paddingVertical: 12, borderRadius: 12, marginBottom: 14, gap: 8 },
// // //   refreshButtonText: { color: '#2457A6', fontSize: 14, fontWeight: '600' },
// // //   bookingItem: { flexDirection: 'row', alignItems: 'center', paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: '#EEF2F7' },
// // //   passengerAvatar: { width: 44, height: 44, borderRadius: 22, overflow: 'hidden', marginRight: 12 },
// // //   avatarImage: { width: 44, height: 44, borderRadius: 22, resizeMode: 'cover' },
// // //   avatarImageSvg: { width: 44, height: 44, borderRadius: 22, overflow: 'hidden', alignItems: 'center', justifyContent: 'center', backgroundColor: '#E5E7EB' },
// // //   avatarPlaceholder: { width: 44, height: 44, borderRadius: 22, backgroundColor: '#E5E7EB', alignItems: 'center', justifyContent: 'center' },
// // //   avatarPlaceholderText: { fontSize: 16, fontWeight: '700', color: Colors.primary },
// // //   bookingInfo: { flex: 1 },
// // //   passengerName: { fontSize: 15, fontWeight: '600', color: Colors.dark },
// // //   bookingSeats: { fontSize: 12, color: Colors.gray, marginTop: 2, flexDirection: 'row', alignItems: 'center' },
// // //   walkingInfoText: { fontSize: 10, color: '#6B7280', marginTop: 2, flexDirection: 'row', alignItems: 'center' },
// // //   bookingStatusBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12 },
// // //   bookingStatusText: { fontSize: 11, fontWeight: '600' },
// // //   bookingActions: { flexDirection: 'row', alignItems: 'center', gap: 12 },
// // //   chatButton: { padding: 8, backgroundColor: '#EFF6FF', borderRadius: 20, alignItems: 'center', justifyContent: 'center' },
// // //   pendingActions: { flexDirection: 'row', gap: 8 },
// // //   actionSmallBtn: { width: 36, height: 36, borderRadius: 18, alignItems: 'center', justifyContent: 'center' },
// // //   acceptBtn: { backgroundColor: '#10B981' },
// // //   rejectBtn: { backgroundColor: '#EF4444' },
// // //   simpleInfoLeft: { flexDirection: 'row', alignItems: 'center', gap: 12 },
// // //   safetyCard: { backgroundColor: '#FFF3E7', borderRadius: 18, padding: 16, marginBottom: 14 },
// // //   safetyTitle: { fontSize: 14, color: '#2457A6', fontWeight: '800' },
// // //   safetySub: { marginTop: 2, fontSize: 12, color: '#2457A6', opacity: 0.9, fontWeight: '600' },
// // //   modalBackdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center' },
// // //   modalCard: { backgroundColor: '#fff', borderRadius: 24, padding: 20, alignItems: 'center', width: width - 40 },
// // //   modalTitle: { fontSize: 22, fontWeight: '700', color: '#111827', textAlign: 'center', marginTop: 12 },
// // //   modalSub: { fontSize: 14, color: '#6B7280', textAlign: 'center', marginTop: 8, marginBottom: 18 },
// // //   starsRow: { flexDirection: 'row', justifyContent: 'center', marginBottom: 18 },
// // //   feedbackInput: { minHeight: 100, borderWidth: 1, borderColor: '#E5E7EB', borderRadius: 16, padding: 14, color: '#111827', fontSize: 14, width: '100%', textAlignVertical: 'top' },
// // //   modalActions: { flexDirection: 'row', gap: 10, marginTop: 18, width: '100%' },
// // //   skipBtn: { flex: 1, borderWidth: 1, borderColor: '#D1D5DB', borderRadius: 999, paddingVertical: 14, alignItems: 'center' },
// // //   skipBtnText: { color: '#6B7280', fontWeight: '600' },
// // //   submitBtn: { flex: 1, backgroundColor: Colors.primary, borderRadius: 999, paddingVertical: 14, alignItems: 'center' },
// // //   submitBtnText: { color: '#fff', fontWeight: '700' },
// // //   imageModalContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', width: '100%' },
// // //   imageModalContent: { width: '90%', backgroundColor: Colors.white, borderRadius: 20, overflow: 'hidden', maxHeight: '80%' },
// // //   imageModalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 16, borderBottomWidth: 1, borderBottomColor: '#EEF2F7' },
// // //   imageModalTitle: { fontSize: 18, fontWeight: '700', color: Colors.dark },
// // //   fullProfileImage: { width: '100%', height: 400, backgroundColor: '#F5F5F5' },
// // //   modalSvgContainer: { width: '100%', height: 400, backgroundColor: '#F5F5F5', alignItems: 'center', justifyContent: 'center' },
// // //   noImageContainer: { width: '100%', height: 400, justifyContent: 'center', alignItems: 'center', backgroundColor: '#F5F5F5' },
// // //   noImageText: { fontSize: 16, color: Colors.gray },
// // //   conflictModalContent: { backgroundColor: "#fff", borderRadius: 24, padding: 20, width: "90%", maxHeight: "85%" },
// // //   conflictModalHeader: { alignItems: "center", marginBottom: 16 },
// // //   conflictModalTitle: { fontSize: 20, fontWeight: "700", color: Colors.dark, marginTop: 12, textAlign: "center" },
// // //   conflictModalMessage: { fontSize: 14, color: Colors.gray, textAlign: "center", marginBottom: 20, lineHeight: 20 },
// // //   conflictRequestCard: { backgroundColor: "#F9FAFB", borderRadius: 16, padding: 16, marginBottom: 12, borderWidth: 1, borderColor: "#E5E7EB" },
// // //   conflictRequestHeader: { flexDirection: "row", alignItems: "center", gap: 12, marginBottom: 12 },
// // //   conflictRequestTitle: { fontSize: 16, fontWeight: "700", color: Colors.dark },
// // //   conflictRequestDetails: { fontSize: 14, color: "#4B5563", marginBottom: 4 },
// // //   conflictModalSeatsInfo: { fontSize: 13, color: Colors.gray, textAlign: "center", marginBottom: 20, fontWeight: "600" },
// // //   conflictModalButtons: { flexDirection: "row", gap: 12, marginBottom: 12 },
// // //   conflictModalBtn: { flex: 1, paddingVertical: 14, borderRadius: 12, alignItems: "center" },
// // //   conflictModalBtnText: { color: "#fff", fontWeight: "700", fontSize: 14 },
// // //   conflictModalCloseBtn: { paddingVertical: 12, alignItems: "center", borderRadius: 12, backgroundColor: "#F3F4F6" },
// // //   conflictModalCloseBtnText: { color: Colors.dark, fontWeight: "600" },
// // //   approveModBtn: { backgroundColor: "#F59E0B" },
// // //   sectionHeaderWithStatus: {
// // //   flexDirection: 'row',
// // //   justifyContent: 'space-between',
// // //   alignItems: 'center',
// // //   marginBottom: 12,
// // // },
// // // cancelledBadgeSmall: {
// // //   backgroundColor: '#F3F4F6',
// // //   paddingHorizontal: 10,
// // //   paddingVertical: 4,
// // //   borderRadius: 12,
// // // },
// // // cancelledBadgeSmallText: {
// // //   fontSize: 11,
// // //   color: '#6B7280',
// // //   fontWeight: '600',
// // // },
// // // disabledBookingItem: {
// // //   opacity: 0.7,
// // //   backgroundColor: '#F9FAFB',
// // // },
// // // locationInfoText: {
// // //   fontSize: 10,
// // //   color: '#6B7280',
// // //   marginTop: 2,
// // //   flexDirection: 'row',
// // //   alignItems: 'center',
// // // },
// // // cancelledNoteContainer: {
// // //   flexDirection: 'row',
// // //   alignItems: 'center',
// // //   backgroundColor: '#F3F4F6',
// // //   padding: 10,
// // //   borderRadius: 8,
// // //   marginTop: 12,
// // //   gap: 8,
// // // },
// // // cancelledNoteText: {
// // //   fontSize: 11,
// // //   color: '#6B7280',
// // //   flex: 1,
// // // },
// // // // Add these styles to your existing StyleSheet
// // // riderStatusContainer: {
// // //   marginTop: 6,
// // //   marginBottom: 4,
// // // },
// // // riderStatusBadge: {
// // //   flexDirection: 'row',
// // //   alignItems: 'center',
// // //   paddingHorizontal: 8,
// // //   paddingVertical: 4,
// // //   borderRadius: 12,
// // //   alignSelf: 'flex-start',
// // //   gap: 4,
// // // },
// // // riderStatusText: {
// // //   fontSize: 11,
// // //   fontWeight: '600',
// // // },
// // // locationInfoText: {
// // //   fontSize: 10,
// // //   color: '#6B7280',
// // //   marginTop: 2,
// // // },
// // // cancelledNoteContainer: {
// // //   flexDirection: 'row',
// // //   alignItems: 'center',
// // //   backgroundColor: '#F3F4F6',
// // //   padding: 10,
// // //   borderRadius: 8,
// // //   marginTop: 12,
// // //   gap: 8,
// // // },
// // // cancelledNoteText: {
// // //   fontSize: 11,
// // //   color: '#6B7280',
// // //   flex: 1,
// // // },
// // // sectionHeaderWithStatus: {
// // //   flexDirection: 'row',
// // //   justifyContent: 'space-between',
// // //   alignItems: 'center',
// // //   marginBottom: 12,
// // // },
// // // cancelledBadgeSmall: {
// // //   backgroundColor: '#F3F4F6',
// // //   paddingHorizontal: 10,
// // //   paddingVertical: 4,
// // //   borderRadius: 12,
// // // },
// // // cancelledBadgeSmallText: {
// // //   fontSize: 11,
// // //   color: '#6B7280',
// // //   fontWeight: '600',
// // // },
// // // disabledBookingItem: {
// // //   opacity: 0.7,
// // //   backgroundColor: '#F9FAFB',
// // // },
// // // // Earnings Banner Styles
// // // earningsBanner: {
// // //   flexDirection: 'row',
// // //   justifyContent: 'space-between',
// // //   alignItems: 'center',
// // //   backgroundColor: '#E8F5E9',
// // //   borderRadius: 16,
// // //   padding: 16,
// // //   marginBottom: 14,
// // //   borderWidth: 1,
// // //   borderColor: '#C8E6C9',
// // // },
// // // earningsBannerLeft: {
// // //   flexDirection: 'row',
// // //   alignItems: 'center',
// // //   gap: 12,
// // // },
// // // earningsIconContainer: {
// // //   width: 48,
// // //   height: 48,
// // //   borderRadius: 24,
// // //   backgroundColor: '#10B981',
// // //   alignItems: 'center',
// // //   justifyContent: 'center',
// // // },
// // // earningsLabel: {
// // //   fontSize: 14,
// // //   color: '#2E7D32',
// // //   fontWeight: '600',
// // //   marginBottom: 2,
// // // },
// // // earningsSubLabel: {
// // //   fontSize: 11,
// // //   color: '#66BB6A',
// // // },
// // // earningsAmountContainer: {
// // //   flexDirection: 'row',
// // //   alignItems: 'baseline',
// // // },
// // // earningsCurrency: {
// // //   fontSize: 18,
// // //   color: '#10B981',
// // //   fontWeight: '700',
// // //   marginRight: 2,
// // // },
// // // earningsAmount: {
// // //   fontSize: 28,
// // //   color: '#10B981',
// // //   fontWeight: '800',
// // // },
// // // // Earnings Breakdown Card
// // // earningsBreakdownCard: {
// // //   backgroundColor: 'white',
// // //   borderRadius: 20,
// // //   padding: 16,
// // //   marginBottom: 14,
// // //   shadowColor: '#000',
// // //   shadowOffset: { width: 0, height: 2 },
// // //   shadowOpacity: 0.05,
// // //   shadowRadius: 8,
// // //   elevation: 2,
// // // },
// // // earningsBreakdownTitle: {
// // //   fontSize: 16,
// // //   fontWeight: '800',
// // //   color: Colors.dark,
// // //   marginBottom: 14,
// // // },
// // // earningsRow: {
// // //   flexDirection: 'row',
// // //   justifyContent: 'space-between',
// // //   alignItems: 'center',
// // //   paddingVertical: 10,
// // //   borderBottomWidth: 1,
// // //   borderBottomColor: '#F0F0F0',
// // // },
// // // earningsRowLeft: {
// // //   flexDirection: 'row',
// // //   alignItems: 'center',
// // //   gap: 12,
// // // },
// // // earningsRowAvatar: {
// // //   width: 36,
// // //   height: 36,
// // //   borderRadius: 18,
// // //   backgroundColor: '#EAF1FF',
// // //   alignItems: 'center',
// // //   justifyContent: 'center',
// // // },
// // // earningsRowInitials: {
// // //   fontSize: 14,
// // //   fontWeight: '700',
// // //   color: '#2457A6',
// // // },
// // // earningsRowName: {
// // //   fontSize: 14,
// // //   fontWeight: '600',
// // //   color: Colors.dark,
// // // },
// // // earningsRowSeats: {
// // //   fontSize: 11,
// // //   color: Colors.gray,
// // //   marginTop: 2,
// // // },
// // // earningsRowAmount: {
// // //   fontSize: 16,
// // //   fontWeight: '700',
// // //   color: '#10B981',
// // // },
// // // earningsDivider: {
// // //   height: 1,
// // //   backgroundColor: '#E5E7EB',
// // //   marginVertical: 12,
// // // },
// // // earningsTotalRow: {
// // //   flexDirection: 'row',
// // //   justifyContent: 'space-between',
// // //   alignItems: 'center',
// // //   paddingTop: 4,
// // // },
// // // earningsTotalLabel: {
// // //   fontSize: 16,
// // //   fontWeight: '700',
// // //   color: Colors.dark,
// // // },
// // // earningsTotalAmount: {
// // //   fontSize: 20,
// // //   fontWeight: '800',
// // //   color: '#10B981',
// // // },
// // // modificationStatusBadge: {
// // //   flexDirection: 'row',
// // //   alignItems: 'center',
// // //   paddingHorizontal: 8,
// // //   paddingVertical: 4,
// // //   borderRadius: 12,
// // //   backgroundColor: '#FEF3C7',
// // //   alignSelf: 'flex-start',
// // //   gap: 6,
// // //   marginTop: 4,
// // //   marginBottom: 4,
// // // },
// // // modificationStatusText: {
// // //   fontSize: 10,
// // //   fontWeight: '600',
// // // },
// // // });
// // // import React, { useMemo, useRef, useState, useEffect, useCallback } from 'react';
// // // import {
// // //   View,
// // //   Text,
// // //   StyleSheet,
// // //   TouchableOpacity,
// // //   ScrollView,
// // //   Platform,
// // //   StatusBar,
// // //   Image,
// // //   Dimensions,
// // //   Animated,
// // //   PanResponder,
// // //   Modal,
// // //   ActivityIndicator,
// // //   LogBox,
// // //   TextInput,
// // //   Alert,
// // //   Linking
// // // } from 'react-native';
// // // import MapView, { Marker, Polyline, PROVIDER_GOOGLE, Circle } from 'react-native-maps';
// // // import { Ionicons } from '@expo/vector-icons';
// // // import { SvgCssUri } from 'react-native-svg/css';
// // // import { Colors } from '../constants/Colors';
// // // import { useAuth } from '../context/AuthContext';
// // // import { API_BASE_URL, GMAP_API_KEY } from '../config/config_ip';
// // // import CustomAlert from '../components/CustomAlert';
// // // import { useFocusEffect } from '@react-navigation/native';
// // // import io from 'socket.io-client';

// // // LogBox.ignoreLogs([
// // //   'Accessibility: View',
// // //   'Property accessibilityState',
// // //   'RCTView',
// // // ]);

// // // const { height, width } = Dimensions.get('window');
// // // const SAFE_TOP = Platform.OS === 'ios' ? 56 : 24;
// // // const COLLAPSED_HEIGHT = 84;
// // // const EXPANDED_HEIGHT = height * 0.72;

// // // function buildImageUrl(url) {
// // //   if (!url) return null;
// // //   if (url.startsWith('http://') || url.startsWith('https://')) return url;
// // //   return `${API_BASE_URL}${url.startsWith('/') ? '' : '/'}${url}`;
// // // }

// // // function getInitials(name) {
// // //   if (!name) return 'D';
// // //   const parts = name.trim().split(' ').filter(Boolean);
// // //   if (parts.length > 1) return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
// // //   return parts[0].slice(0, 2).toUpperCase();
// // // }

// // // function isSvgUrl(url) {
// // //   if (!url) return false;
// // //   return url.toLowerCase().includes('.svg') || url.toLowerCase().includes('.svg?');
// // // }

// // // function parseRouteCoordinates(routeCoordinates) {
// // //   if (!routeCoordinates) return [];
// // //   if (!Array.isArray(routeCoordinates)) return [];
// // //   if (routeCoordinates.length === 0) return [];
  
// // //   return routeCoordinates.map((item) => {
// // //     if (Array.isArray(item) && item.length === 2) {
// // //       const lng = Number(item[0]);
// // //       const lat = Number(item[1]);
// // //       if (!isNaN(lng) && !isNaN(lat)) {
// // //         return { longitude: lng, latitude: lat };
// // //       }
// // //     }
// // //     if (item && typeof item === 'object') {
// // //       const lng = Number(item.longitude || item.lng);
// // //       const lat = Number(item.latitude || item.lat);
// // //       if (!isNaN(lng) && !isNaN(lat)) {
// // //         return { longitude: lng, latitude: lat };
// // //       }
// // //     }
// // //     return null;
// // //   }).filter(Boolean);
// // // }

// // // function ProfileImageModal({ visible, imageUrl, name, onClose }) {
// // //   const [imageError, setImageError] = useState(false);
// // //   const isSvg = imageUrl ? isSvgUrl(imageUrl) : false;
  
// // //   useEffect(() => {
// // //     if (visible) {
// // //       setImageError(false);
// // //     }
// // //   }, [visible, imageUrl]);
  
// // //   if (!visible) return null;
  
// // //   return (
// // //     <Modal visible={visible} transparent={true} animationType="fade" onRequestClose={onClose}>
// // //       <TouchableOpacity style={styles.modalBackdrop} activeOpacity={1} onPress={onClose}>
// // //         <View style={styles.imageModalContainer}>
// // //           <View style={styles.imageModalContent}>
// // //             <View style={styles.imageModalHeader}>
// // //               <Text style={styles.imageModalTitle}>{name || 'Profile'}</Text>
// // //               <TouchableOpacity onPress={onClose}>
// // //                 <Ionicons name="close" size={24} color={Colors.dark} />
// // //               </TouchableOpacity>
// // //             </View>
// // //             {imageUrl && !imageError ? (
// // //               isSvg ? (
// // //                 <View style={styles.modalSvgContainer}>
// // //                   <SvgCssUri uri={imageUrl} width="100%" height={400} />
// // //                 </View>
// // //               ) : (
// // //                 <Image 
// // //                   source={{ uri: imageUrl }} 
// // //                   style={styles.fullProfileImage} 
// // //                   resizeMode="contain"
// // //                   onError={() => setImageError(true)}
// // //                 />
// // //               )
// // //             ) : (
// // //               <View style={styles.noImageContainer}>
// // //                 <Ionicons name="person-circle-outline" size={80} color={Colors.gray} />
// // //                 <Text style={styles.noImageText}>No profile picture available</Text>
// // //               </View>
// // //             )}
// // //           </View>
// // //         </View>
// // //       </TouchableOpacity>
// // //     </Modal>
// // //   );
// // // }

// // // export default function ViewRoutePostedScreen({ navigation, route }) {
// // //   const { user } = useAuth();
// // //   const { ride } = route.params || {};
// // // const prevBookedSeatsRef = useRef(0);

// // //   const [drawerExpanded, setDrawerExpanded] = useState(true);
// // //   const [mapReady, setMapReady] = useState(false);
// // //   const [bookings, setBookings] = useState([]);
// // //   const [loadingBookings, setLoadingBookings] = useState(false);
// // //   const [pendingModifications, setPendingModifications] = useState([]);
// // //   const [refreshKey, setRefreshKey] = useState(0);
// // //   const [pollingInterval, setPollingInterval] = useState(null);
// // //   const [modifyingRequest, setModifyingRequest] = useState(false);
// // //   const [ratingModalVisible, setRatingModalVisible] = useState(false);
// // //   const [selectedRider, setSelectedRider] = useState(null);
// // //   const [rating, setRating] = useState(0);
// // //   const [feedback, setFeedback] = useState('');
// // //   const [currentSessionId, setCurrentSessionId] = useState(null);
// // //   const [conflictModalVisible, setConflictModalVisible] = useState(false);
// // //   const [conflictData, setConflictData] = useState(null);
// // //   const [resolvingConflict, setResolvingConflict] = useState(false);
// // //   const [totalEarnings, setTotalEarnings] = useState(0);
// // //   const [showCompletionBanner, setShowCompletionBanner] = useState(false);
// // //   const [timelineExpanded, setTimelineExpanded] = useState(false);
// // //   const [selectedStopIndex, setSelectedStopIndex] = useState(null);
  
// // //   // Address geocoding states
// // //   const [addressCache, setAddressCache] = useState({});
// // //   const [loadingAddresses, setLoadingAddresses] = useState(false);
// // //   const [addressFetchProgress, setAddressFetchProgress] = useState({ current: 0, total: 0 });
  
// // //   const animatedDrawer = useRef(new Animated.Value(1)).current;
// // //   const mapRef = useRef(null);
// // //   const socketRef = useRef(null);
// // //   const scrollViewRef = useRef(null);
  
// // //   const [selectedProfile, setSelectedProfile] = useState({
// // //     visible: false,
// // //     imageUrl: null,
// // //     name: '',
// // //   });
  
// // //   const formatDate = (dateString) => {
// // //     if (!dateString) return 'Date not set';
// // //     const date = new Date(dateString);
// // //     const today = new Date();
// // //     const tomorrow = new Date(today);
// // //     tomorrow.setDate(tomorrow.getDate() + 1);
// // //     const isToday = date.toDateString() === today.toDateString();
// // //     const isTomorrow = date.toDateString() === tomorrow.toDateString();
// // //     let dayText = "";
// // //     if (isToday) dayText = "Today";
// // //     else if (isTomorrow) dayText = "Tomorrow";
// // //     else dayText = date.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" });
// // //     const timeText = date.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", hour12: false });
// // //     return `${dayText}, ${timeText}`;
// // //   };
  
// // //   const [alertVisible, setAlertVisible] = useState(false);
// // //   const [alertConfig, setAlertConfig] = useState({
// // //     title: "",
// // //     message: "",
// // //     icon: "check-circle",
// // //     iconColor: "#10B981",
// // //     buttons: []
// // //   });

// // //   const showCustomAlert = (title, message, type = 'success') => {
// // //     let icon = "check-circle";
// // //     let iconColor = "#10B981";
// // //     if (type === 'error') { icon = "error"; iconColor = "#EF4444"; }
// // //     else if (type === 'warning') { icon = "warning"; iconColor = "#F59E0B"; }
// // //     else if (type === 'info') { icon = "info"; iconColor = Colors.primary; }
// // //     setAlertConfig({ title, message, icon, iconColor, buttons: [{ text: 'OK', onPress: () => setAlertVisible(false) }] });
// // //     setAlertVisible(true);
// // //   };

// // //   const showConfirmationAlert = (title, message, onConfirm) => {
// // //     setAlertConfig({
// // //       title,
// // //       message,
// // //       icon: "warning",
// // //       iconColor: "#F59E0B",
// // //       buttons: [
// // //         { text: 'Cancel', onPress: () => setAlertVisible(false), style: 'cancel' },
// // //         { text: 'Confirm', onPress: () => { setAlertVisible(false); onConfirm(); }, style: 'destructive' }
// // //       ]
// // //     });
// // //     setAlertVisible(true);
// // //   };
// // // const getActualBookedSeats = useCallback(() => {
// // //   if (!bookings || !Array.isArray(bookings)) return 0;
  
// // //   console.log('📊 Calculating seats - Total bookings:', bookings.length);
// // //   bookings.forEach(b => {
// // //     console.log(`  Booking ${b.booking_id}: status=${b.status}, mod_status=${b.modification_request?.status}, seats=${b.seats_booked}`);
// // //   });
  
// // //   // Create a Set of booking IDs that have REJECTED modifications from pendingModifications
// // //   const rejectedBookingIds = new Set();
// // //   const approvedBookingIds = new Set();
  
// // //   pendingModifications.forEach(mod => {
// // //     if (mod.status === 'rejected') {
// // //       rejectedBookingIds.add(mod.booking_id);
// // //       console.log(`❌ PendingMods: Rejected modification for booking ${mod.booking_id}`);
// // //     }
// // //     if (mod.status === 'approved') {
// // //       approvedBookingIds.add(mod.booking_id);
// // //       console.log(`✅ PendingMods: Approved modification for booking ${mod.booking_id}`);
// // //     }
// // //   });
  
// // //   const activeBookings = bookings.filter(bookingItem => {
// // //     // Skip if booking is cancelled (IMPORTANT)
// // //     if (bookingItem.status === 'cancelled') {
// // //       console.log(`  ❌ Excluding booking ${bookingItem.booking_id} - status is cancelled`);
// // //       return false;
// // //     }
    
// // //     // Skip if booking is rejected
// // //     if (bookingItem.status === 'rejected') {
// // //       console.log(`  ❌ Excluding booking ${bookingItem.booking_id} - status is rejected`);
// // //       return false;
// // //     }
    
// // //     // Skip if this booking has a rejected modification in pendingModifications
// // //     if (rejectedBookingIds.has(bookingItem.booking_id)) {
// // //       console.log(`  ❌ Excluding booking ${bookingItem.booking_id} - rejected modification in pendingMods`);
// // //       return false;
// // //     }
    
// // //     // Also check if modification_request in booking says rejected
// // //     if (bookingItem.modification_request?.status === 'rejected') {
// // //       console.log(`  ❌ Excluding booking ${bookingItem.booking_id} - rejected modification in booking object`);
// // //       return false;
// // //     }
    
// // //     return bookingItem.status === 'accepted';
// // //   });
  
// // //   const totalBooked = activeBookings.reduce((sum, bookingItem) => {
// // //     // If modification was approved
// // //     if (approvedBookingIds.has(bookingItem.booking_id) || 
// // //         bookingItem.modification_request?.status === 'approved') {
// // //       const modRequest = pendingModifications.find(m => m.booking_id === bookingItem.booking_id);
// // //       const newSeats = modRequest?.requested_seats || bookingItem.modification_request?.requested_seats || 0;
// // //       console.log(`  ✅ Booking ${bookingItem.booking_id}: approved mod, seats=${newSeats}`);
// // //       return sum + newSeats;
// // //     }
// // //     console.log(`  ✅ Booking ${bookingItem.booking_id}: normal, seats=${bookingItem.seats_booked}`);
// // //     return sum + (bookingItem.seats_booked || bookingItem.seats_requested || 0);
// // //   }, 0);
  
// // //   console.log(`📊 Total booked seats: ${totalBooked}, Active bookings: ${activeBookings.length}`);
  
// // //   return totalBooked;
// // // }, [bookings, pendingModifications]);
// // // const getActualAvailableSeats = useCallback(() => {
// // //   const totalSeats = ride?.available_seats || 0;
// // //   const bookedSeats = getActualBookedSeats();
// // //   return Math.max(0, totalSeats - bookedSeats);
// // // }, [ride?.available_seats, getActualBookedSeats]);

// // // const fetchBookings = useCallback(async () => {
// // //   if (!ride?.id) return;
// // //   setLoadingBookings(true);
// // //   try {
// // //     const response = await fetch(`${API_BASE_URL}/ride/${ride.id}/passengers?_t=${Date.now()}`);
// // //     const data = await response.json();
// // //         console.log('🔍 RAW API Response:', JSON.stringify(data, null, 2));

// // //     if (data.passengers && Array.isArray(data.passengers)) {
// // //       const processedPassengers = data.passengers.map(passenger => ({
// // //         ...passenger,
// // //         driver_rating_given: passenger.driver_rating_given === true || passenger.driver_rating_given === 1,
// // //         driver_rating: passenger.driver_rating || 0,
// // //         driver_feedback: passenger.driver_feedback || '',
// // //         modification_request: passenger.modification_request || null,
// // //       }));
      
// // //       // Debug: Log any rejected modifications
// // //       const rejectedMods = processedPassengers.filter(p => p.modification_request?.status === 'rejected');
// // //       if (rejectedMods.length > 0) {
// // //         console.log('🔴 Found rejected modifications:', rejectedMods.map(r => ({
// // //           id: r.booking_id,
// // //           name: r.passenger_name,
// // //           status: r.modification_request?.status,
// // //           seats: r.seats_booked
// // //         })));
// // //       }
      
// // //       // Only update if data actually changed
// // //       setBookings(prev => {
// // //         if (JSON.stringify(prev) === JSON.stringify(processedPassengers)) {
// // //           return prev;
// // //         }
// // //         return processedPassengers;
// // //       });
      
// // //       // Calculate earnings only from actually accepted bookings (excluding rejected modifications)
// // //       const activeAcceptedBookings = processedPassengers.filter(p => 
// // //         p.status === 'accepted' && 
// // //         p.modification_request?.status !== 'rejected'
// // //       );
      
// // //       if (ride?.status === "completed" || ride?.completed_at) {
// // //         const earnings = activeAcceptedBookings
// // //           .reduce((sum, p) => {
// // //             let seatCount = p.seats_booked || p.seats_requested || 0;
// // //             if (p.modification_request?.status === 'approved') {
// // //               seatCount = p.modification_request.requested_seats || seatCount;
// // //             }
// // //             return sum + (p.total_amount || seatCount * (ride?.price_per_seat || 0));
// // //           }, 0);
// // //         setTotalEarnings(earnings);
// // //       }
// // //     } else {
// // //       setBookings([]);
// // //     }
// // //   } catch (error) {
// // //     console.log('Error fetching bookings:', error);
// // //     setBookings([]);
// // //   } finally {
// // //     setLoadingBookings(false);
// // //   }
// // // }, [ride?.id, ride?.status, ride?.price_per_seat]);
// // //   // Google Maps Geocoding Function
// // //   const getAddressFromCoordsGoogle = async (lat, lng) => {
// // //     const cacheKey = `${lat},${lng}`;
    
// // //     if (addressCache[cacheKey]) {
// // //       return addressCache[cacheKey];
// // //     }
    
// // //     try {
// // //       const url = `https://maps.googleapis.com/maps/api/geocode/json?latlng=${lat},${lng}&key=${GMAP_API_KEY}&language=en`;
// // //       const response = await fetch(url);
// // //       const data = await response.json();
      
// // //       if (data.status === 'OK' && data.results && data.results[0]) {
// // //         const formattedAddress = data.results[0].formatted_address;
// // //         setAddressCache(prev => ({ ...prev, [cacheKey]: formattedAddress }));
// // //         return formattedAddress;
// // //       } else {
// // //         return `${lat.toFixed(4)}, ${lng.toFixed(4)}`;
// // //       }
// // //     } catch (error) {
// // //       console.log('Geocoding error:', error);
// // //       return `${lat.toFixed(4)}, ${lng.toFixed(4)}`;
// // //     }
// // //   };

// // //   // Fetch addresses for all bookings
// // //   const fetchAllAddresses = useCallback(async () => {
// // //     const confirmedBookings = bookings.filter(b => b.status === 'accepted');
// // //     if (confirmedBookings.length === 0) return;
    
// // //     const coordinatesToFetch = [];
    
// // //     confirmedBookings.forEach(booking => {
// // //       const pickupLat = booking.intersection_pickup_lat || booking.pickup_lat;
// // //       const pickupLon = booking.intersection_pickup_lon || booking.pickup_lon;
// // //       if (pickupLat && pickupLon) {
// // //         const key = `${pickupLat},${pickupLon}`;
// // //         if (!addressCache[key] && !coordinatesToFetch.find(c => c.key === key)) {
// // //           coordinatesToFetch.push({ key, lat: pickupLat, lng: pickupLon, type: 'pickup', bookingId: booking.booking_id, riderName: booking.passenger_name });
// // //         }
// // //       }
      
// // //       const dropLat = booking.intersection_drop_lat || booking.drop_lat;
// // //       const dropLon = booking.intersection_drop_lon || booking.drop_lon;
// // //       if (dropLat && dropLon) {
// // //         const key = `${dropLat},${dropLon}`;
// // //         if (!addressCache[key] && !coordinatesToFetch.find(c => c.key === key)) {
// // //           coordinatesToFetch.push({ key, lat: dropLat, lng: dropLon, type: 'dropoff', bookingId: booking.booking_id, riderName: booking.passenger_name });
// // //         }
// // //       }
// // //     });
    
// // //     if (coordinatesToFetch.length === 0) return;
    
// // //     setLoadingAddresses(true);
// // //     setAddressFetchProgress({ current: 0, total: coordinatesToFetch.length });
    
// // //     const batchSize = 5;
// // //     for (let i = 0; i < coordinatesToFetch.length; i += batchSize) {
// // //       const batch = coordinatesToFetch.slice(i, i + batchSize);
// // //       await Promise.all(batch.map(async (coord) => {
// // //         const address = await getAddressFromCoordsGoogle(coord.lat, coord.lng);
// // //         setAddressFetchProgress(prev => ({ ...prev, current: prev.current + 1 }));
// // //         return address;
// // //       }));
      
// // //       if (i + batchSize < coordinatesToFetch.length) {
// // //         await new Promise(resolve => setTimeout(resolve, 200));
// // //       }
// // //     }
    
// // //     setLoadingAddresses(false);
// // //   }, [bookings, addressCache]);

// // // useEffect(() => {
// // //   if (bookings.length > 0) {
// // //         fetchModificationStatusForAllBookings();

// // //     fetchAllAddresses();
// // //   }
// // // }, [bookings.length]); 
// // //   const fetchPendingModifications = useCallback(async () => {
// // //     if (!ride?.id) return;
// // //     try {
// // //       const response = await fetch(`${API_BASE_URL}/ride/${ride.id}/pending-modifications?_t=${Date.now()}`);
// // //       const data = await response.json();
      
// // //       if (data.pending_requests && Array.isArray(data.pending_requests)) {
// // //         const latestPerBooking = new Map();
        
// // //         data.pending_requests.forEach(request => {
// // //           const bookingId = request.booking_id;
// // //           const existing = latestPerBooking.get(bookingId);
          
// // //           if (!existing || new Date(request.created_at) > new Date(existing.created_at)) {
// // //             latestPerBooking.set(bookingId, request);
// // //           }
// // //         });
        
// // //         const uniqueRequests = Array.from(latestPerBooking.values());
// // //         setPendingModifications(uniqueRequests);
        
// // //         if (uniqueRequests.length > 0 && !drawerExpanded) {
// // //           setDrawerExpanded(true);
// // //         }
// // //       } else {
// // //         setPendingModifications([]);
// // //       }
// // //     } catch (error) {
// // //       console.log('Error fetching pending modifications:', error);
// // //       setPendingModifications([]);
// // //     }
// // //   }, [ride?.id, drawerExpanded]);
// // // // Add this function after your fetchBookings function
// // // const fetchModificationStatusForAllBookings = useCallback(async () => {
// // //   if (!bookings.length) return;
  
// // //   console.log('🔍 Fetching modification status for all bookings...');
// // //   const updatedBookings = [...bookings];
// // //   let hasChanges = false;
// // //   const rejectedBookingIds = [];
  
// // //   for (let i = 0; i < updatedBookings.length; i++) {
// // //     const booking = updatedBookings[i];
// // //     try {
// // //       const response = await fetch(`${API_BASE_URL}/booking/${booking.booking_id}/modification-request?_t=${Date.now()}`);
// // //       const data = await response.json();
      
// // //       if (data.request && data.request.id) {
// // //         console.log(`📝 Booking ${booking.booking_id}: modification status = ${data.request.status}`);
        
// // //         if (data.request.status === 'rejected') {
// // //           rejectedBookingIds.push(booking.booking_id);
// // //           console.log(`❌ Booking ${booking.booking_id} has REJECTED modification`);
          
// // //           // Mark this booking as cancelled
// // //           updatedBookings[i] = {
// // //             ...booking,
// // //             modification_request: data.request,
// // //             status: 'cancelled' // Mark as cancelled so it won't count in seats
// // //           };
// // //           hasChanges = true;
// // //         } else if (data.request.status === 'approved') {
// // //           updatedBookings[i] = {
// // //             ...booking,
// // //             modification_request: data.request,
// // //             seats_booked: data.request.requested_seats // Update seat count
// // //           };
// // //           hasChanges = true;
// // //         } else {
// // //           updatedBookings[i] = {
// // //             ...booking,
// // //             modification_request: data.request
// // //           };
// // //           hasChanges = true;
// // //         }
// // //       }
// // //     } catch (error) {
// // //       console.log(`Error fetching modification for booking ${booking.booking_id}:`, error);
// // //     }
// // //   }
  
// // //   if (hasChanges) {
// // //     console.log('✅ Updating bookings with modification status. Rejected bookings:', rejectedBookingIds);
// // //     setBookings(updatedBookings);
// // //   }
// // // }, [bookings]);
// // //   const checkForConcurrentRequests = useCallback(async () => {
// // //     if (!ride?.id) return;
// // //     try {
// // //       const response = await fetch(`${API_BASE_URL}/ride/${ride.id}/concurrent-requests?_t=${Date.now()}`);
// // //       const data = await response.json();
      
// // //       if (data.has_concurrent_requests) {
// // //         setConflictData(data);
// // //         setConflictModalVisible(true);
// // //       }
// // //     } catch (error) {
// // //       console.log('Error checking concurrent requests:', error);
// // //     }
// // //   }, [ride?.id]);

// // //   const resolveConcurrentRequest = async (choice, modificationRequestId, bookingId) => {
// // //     if (!conflictData) return;
    
// // //     setResolvingConflict(true);
// // //     try {
// // //       const response = await fetch(`${API_BASE_URL}/ride/${conflictData.ride.id}/resolve-concurrent-requests`, {
// // //         method: 'POST',
// // //         headers: { 'Content-Type': 'application/json' },
// // //         body: JSON.stringify({
// // //           choice: choice,
// // //           modification_request_id: modificationRequestId,
// // //           booking_id: bookingId,
// // //           driver_phone: user?.phone_number
// // //         })
// // //       });
      
// // //       const data = await response.json();
      
// // //       if (data.success) {
// // //         showCustomAlert('Success', data.message, 'success');
// // //         setConflictModalVisible(false);
// // //         fetchBookings();
// // //         fetchPendingModifications();
// // //       } else {
// // //         showCustomAlert('Error', data.message || 'Failed to process request', 'error');
// // //         fetchBookings();
// // //         fetchPendingModifications();
// // //       }
// // //     } catch (error) {
// // //       console.error('Resolve concurrent request error:', error);
// // //       showCustomAlert('Error', 'Failed to resolve concurrent requests', 'error');
// // //       fetchBookings();
// // //       fetchPendingModifications();
// // //     } finally {
// // //       setResolvingConflict(false);
// // //     }
// // //   };

// // //   const areModificationsLocked = () => {
// // //     const now = new Date();
// // //     const departureTime = new Date(ride?.departure_time);
// // //     const minutesToDeparture = (departureTime - now) / (1000 * 60);
// // //     return minutesToDeparture <= 15 && minutesToDeparture > -30 && !ride?.started_at;
// // //   };

// // //   // Enhanced ride status display with proper cancellation reasons
// // //   const getRideStatusDisplay = () => {
// // //     const now = new Date();
// // //     const departureTime = new Date(ride?.departure_time);
// // //     const minutesToDeparture = (departureTime - now) / (1000 * 60);
// // //     const minutesSinceDeparture = (now - departureTime) / (1000 * 60);
// // //     const hoursSinceDeparture = (now - departureTime) / (1000 * 60 * 60);
    
// // //     // Check for cancellation first
// // //     if (ride?.cancellation_reason) {
// // //       if (ride.cancellation_reason.includes("Auto-cancelled") || ride.cancellation_reason.includes("auto-cancel")) {
// // //         return { 
// // //           text: "Auto-cancelled", 
// // //           color: "#9CA3AF", 
// // //           icon: "timer-off", 
// // //           type: "auto-cancelled",
// // //           reason: ride.cancellation_reason || "Ride was automatically cancelled as it was not started within 2 hours of departure time."
// // //         };
// // //       }
// // //       return { 
// // //         text: "Cancelled", 
// // //         color: "#DC2626", 
// // //         icon: "close-circle", 
// // //         type: "cancelled",
// // //         reason: ride.cancellation_reason
// // //       };
// // //     }
    
// // //     // Check for auto-cancel after 2 hours past departure
// // //     if (hoursSinceDeparture > 2 && !ride?.started_at && ride?.status !== "completed") {
// // //       return { 
// // //         text: "Auto-cancelled", 
// // //         color: "#9CA3AF", 
// // //         icon: "timer-off", 
// // //         type: "auto-cancelled",
// // //         reason: "Ride auto-cancelled as it was not started within 2 hours of departure time."
// // //       };
// // //     }
    
// // //     if (ride?.status === "completed" || ride?.completed_at) {
// // //       return { text: "Completed", color: "#6B7280", icon: "checkmark-done", type: "completed" };
// // //     }
    
// // //     if (ride?.started_at && ride?.status !== "completed") {
// // //       return { text: "Ongoing", color: "#10B981", icon: "car-sport", type: "ongoing" };
// // //     }
    
// // //     if (minutesSinceDeparture > 0 && minutesSinceDeparture <= 120) {
// // //       return { text: "Late - Start Now", color: "#EF4444", icon: "alert-circle", type: "late" };
// // //     }
    
// // //     if (minutesToDeparture <= 60 && minutesToDeparture > 15) {
// // //       return { text: "Start Soon", color: "#F59E0B", icon: "time-outline", type: "start-soon" };
// // //     }
    
// // //     if (minutesToDeparture <= 15 && minutesToDeparture > 0) {
// // //       return { text: "Active", color: "#10B981", icon: "checkmark-circle", type: "active" };
// // //     }
    
// // //     if (minutesToDeparture > 60) {
// // //       return { text: "Upcoming", color: "#2457A6", icon: "calendar-outline", type: "upcoming" };
// // //     }
    
// // //     return { text: "Upcoming", color: "#2457A6", icon: "calendar-outline", type: "upcoming" };
// // //   };

// // //   // Socket connection setup
// // //   useEffect(() => {
// // //     if (!ride?.id) return;
    
// // //     const socket = io(API_BASE_URL, {
// // //       transports: ['websocket', 'polling'],
// // //       reconnection: true,
// // //       reconnectionAttempts: 10,
// // //       reconnectionDelay: 1000,
// // //       timeout: 10000,
// // //       path: '/socket.io'
// // //     });
    
// // //     socketRef.current = socket;
    
// // //     socket.on('connect', () => {
// // //       console.log('Socket connected for driver ride updates');
// // //       socket.emit('join-ride-room', ride.id);
      
// // //       if (user?.phone_number) {
// // //         socket.emit('join-user-room', user.phone_number);
// // //       }
// // //     });
    
// // //     socket.on('connect_error', (error) => {
// // //       console.log('Socket connection error:', error.message);
// // //     });
    
// // //     socket.on('disconnect', (reason) => {
// // //       console.log('Socket disconnected:', reason);
// // //       if (reason === 'io server disconnect') {
// // //         setTimeout(() => {
// // //           if (socketRef.current) {
// // //             socketRef.current.connect();
// // //           }
// // //         }, 1000);
// // //       }
// // //     });
    
// // //     socket.on('reconnect', () => {
// // //       console.log('Socket reconnected');
// // //       if (ride?.id) {
// // //         socket.emit('join-ride-room', ride.id);
// // //       }
// // //     });
    
// // //     socket.on('new-modification-request', (data) => {
// // //       console.log('New modification request received:', data);
// // //       if (data.ride_id === ride.id) {
// // //         showCustomAlert('New Modification Request', `${data.passenger_name} wants to change from ${data.current_seats} to ${data.requested_seats} seat(s)`, 'info');
// // //         fetchPendingModifications();
// // //         fetchBookings();
// // //         checkForConcurrentRequests();
// // //       }
// // //     });
    
// // //   /// Add this inside your socket.on listeners
// // // socket.on('modification-rejected', (data) => {
// // //   console.log('Modification rejected event received:', data);
// // //   if (data.ride_id === ride.id) {
// // //     // Immediately update pendingModifications state
// // //     setPendingModifications(prev => 
// // //       prev.map(mod => 
// // //         mod.id === data.request_id 
// // //           ? { ...mod, status: 'rejected' }
// // //           : mod
// // //       )
// // //     );
    
// // //     showCustomAlert('Modification Rejected', 
// // //       `The modification request for ${data.passenger_name || 'a passenger'} was rejected. The original booking has been cancelled and seats are now available.`, 
// // //       'warning');
    
// // //     // Force refresh all data
// // //     fetchBookings();
// // //     fetchPendingModifications();
// // //     checkForConcurrentRequests();
// // //   }
// // // });

// // // // Update the existing modification-response listener
// // // socket.on('modification-response', (data) => {
// // //   console.log('Modification response received:', data);
// // //   if (data.ride_id === ride.id) {
// // //     // Immediately update pendingModifications state
// // //     setPendingModifications(prev => 
// // //       prev.map(mod => 
// // //         mod.id === data.request_id 
// // //           ? { ...mod, status: data.action === 'approved' ? 'approved' : 'rejected' }
// // //           : mod
// // //       )
// // //     );
    
// // //     if (data.action === 'approved') {
// // //       showCustomAlert('Modification Approved', `You approved seat change for ${data.passenger_name || 'passenger'}`, 'success');
// // //     } else {
// // //       showCustomAlert('Modification Rejected', 
// // //         `You rejected the seat change request. The original booking has been CANCELLED and seats released.`, 
// // //         'warning');
// // //     }
    
// // //     // Force immediate refresh
// // //     fetchPendingModifications();
// // //     fetchBookings();
// // //     checkForConcurrentRequests();
// // //   }
// // // });
// // //     socket.on('booking-update', (data) => {
// // //       console.log('Booking update received:', data);
// // //       if (data.ride_id === ride.id) {
// // //         fetchBookings();
// // //         checkForConcurrentRequests();
// // //       }
// // //     });
    
// // //     socket.on('rider-reached-pickup', (data) => {
// // //       console.log('Rider reached pickup:', data);
// // //       showCustomAlert('Rider Arrived', `${data.rider_name || 'A rider'} has reached the pickup location`, 'info');
// // //     });
    
// // //     socket.on('rider-boarded', (data) => {
// // //       console.log('Rider boarded:', data);
// // //       showCustomAlert('Rider Boarded', `${data.rider_name || 'A rider'} has boarded the vehicle`, 'success');
// // //       fetchBookings();
// // //     });
    
// // //     socket.on('rider-dropped-off', (data) => {
// // //       console.log('Rider dropped off:', data);
// // //       showCustomAlert('Rider Dropped Off', `${data.rider_name || 'A rider'} has been dropped off`, 'info');
// // //       fetchBookings();
// // //     });
    
// // //     socket.on('concurrent-requests-detected', (data) => {
// // //       console.log('Concurrent requests detected:', data);
// // //       if (data.ride_id === ride.id) {
// // //         checkForConcurrentRequests();
// // //       }
// // //     });
    
// // //     socket.on('ride-completed', (data) => {
// // //       console.log('Ride completed event:', data);
// // //       if (data.ride_id === ride.id) {
// // //         setShowCompletionBanner(true);
// // //         showCustomAlert('Ride Completed', 'This ride has been successfully completed!', 'success');
// // //         fetchBookings();
// // //         setTimeout(() => {
// // //           setShowCompletionBanner(false);
// // //         }, 5000);
// // //       }
// // //     });
    
// // //     socket.on('ride-auto-cancelled', (data) => {
// // //       console.log('Ride auto-cancelled event:', data);
// // //       if (data.ride_id === ride.id) {
// // //         const reason = data.reason || "Ride was auto-cancelled as it was not started within 2 hours of departure time.";
// // //         showCustomAlert('Ride Auto-Cancelled', reason, 'warning');
// // //         fetchBookings();
// // //         setRefreshKey(prev => prev + 1);
// // //       }
// // //     });
    
// // //     const interval = setInterval(() => {
// // //       fetchPendingModifications();
// // //     }, 10000);
    
// // //     setPollingInterval(interval);
    
// // //     return () => {
// // //       if (interval) clearInterval(interval);
// // //       if (socketRef.current) {
// // //         socketRef.current.emit('leave-ride-room', ride.id);
// // //         socketRef.current.disconnect();
// // //         socketRef.current = null;
// // //       }
// // //     };
// // //   }, [ride?.id, user?.phone_number, checkForConcurrentRequests, fetchPendingModifications]);

// // //   useFocusEffect(
// // //     useCallback(() => {
// // //       fetchBookings();
// // //       fetchPendingModifications();
// // //       checkForConcurrentRequests();
// // //       setRefreshKey(prev => prev + 1);
// // //       return () => {};
// // //     }, [fetchBookings, fetchPendingModifications, checkForConcurrentRequests])
// // //   );

// // //   const handleBookingAction = async (bookingId, action) => {
// // //     showConfirmationAlert(`${action === "accept" ? "Accept" : "Reject"} Request`, `Are you sure you want to ${action} this booking request?`, async () => {
// // //       try {
// // //         const response = await fetch(`${API_BASE_URL}/booking/${bookingId}/${action}`, {
// // //           method: 'PUT',
// // //           headers: { 'Content-Type': 'application/json' },
// // //         });
// // //         const data = await response.json();
        
// // //         if (!response.ok) throw new Error(data.detail || `Failed to ${action} booking`);
        
// // //         showCustomAlert('Success', `Booking ${action}ed successfully`, 'success');
// // //         fetchBookings();
        
// // //         if (socketRef.current) {
// // //           socketRef.current.emit('booking-status-changed', {
// // //             ride_id: ride.id,
// // //             booking_id: bookingId,
// // //             status: action
// // //           });
// // //         }
// // //       } catch (error) {
// // //         showCustomAlert('Error', error.message, 'error');
// // //       }
// // //     });
// // //   };
// // // const handleModificationAction = async (requestId, action, requestedSeats, currentSeats, bookingId, passengerName) => {
// // //   const actionText = action === 'approve' ? 'approve' : 'reject';
// // //   const message = action === 'approve' 
// // //     ? `Are you sure you want to approve the seat change request from ${currentSeats} to ${requestedSeats} seats for ${passengerName}?`
// // //     : `⚠️ WARNING: Rejecting this modification will CANCEL the original booking of ${currentSeats} seat(s) for ${passengerName}. The seats will be released. Are you sure?`;
  
// // //   showConfirmationAlert(`${action === 'approve' ? 'Approve' : 'Reject'} Modification`, message, async () => {
// // //     try {
// // //       const url = `${API_BASE_URL}/api/v1/modifications/${requestId}/${action}`;
// // //       const response = await fetch(url, { method: 'PUT' });
// // //       const data = await response.json();
      
// // //       if (!response.ok) throw new Error(data.detail || `Failed to ${action} modification`);
      
// // //       // IMMEDIATELY update local state - THIS IS THE KEY FIX
// // //       if (action === 'reject') {
// // //         // Remove the booking from seat count by marking it as cancelled
// // //         setBookings(prevBookings => 
// // //           prevBookings.map(booking => 
// // //             booking.booking_id === bookingId 
// // //               ? { 
// // //                   ...booking, 
// // //                   status: 'cancelled',  // Mark as cancelled
// // //                   modification_request: {
// // //                     ...booking.modification_request,
// // //                     status: 'rejected',
// // //                     rejection_reason: data.rejection_reason || 'Modification request rejected'
// // //                   }
// // //                 }
// // //               : booking
// // //           )
// // //         );
        
// // //         // Also update pendingModifications
// // //         setPendingModifications(prev => 
// // //           prev.map(mod => 
// // //             mod.id === requestId 
// // //               ? { ...mod, status: 'rejected' }
// // //               : mod
// // //           ).filter(mod => mod.booking_id !== bookingId) // Optionally remove rejected ones
// // //         );
        
// // //         showCustomAlert('Modification Rejected', 
// // //           `The modification request was rejected. The original booking for ${currentSeats} seat(s) has been CANCELLED and ${currentSeats} seat(s) are now available.`, 
// // //           'warning');
// // //       } else {
// // //         // Update approved modification seat count
// // //         setBookings(prevBookings => 
// // //           prevBookings.map(booking => 
// // //             booking.booking_id === bookingId 
// // //               ? { 
// // //                   ...booking, 
// // //                   seats_booked: requestedSeats,
// // //                   modification_request: {
// // //                     ...booking.modification_request,
// // //                     status: 'approved',
// // //                     requested_seats: requestedSeats
// // //                   }
// // //                 }
// // //               : booking
// // //           )
// // //         );
        
// // //         setPendingModifications(prev => 
// // //           prev.map(mod => 
// // //             mod.id === requestId 
// // //               ? { ...mod, status: 'approved' }
// // //               : mod
// // //           )
// // //         );
        
// // //         showCustomAlert('Success', 
// // //           `Modification request approved successfully. Seats updated from ${currentSeats} to ${requestedSeats}.`, 
// // //           'success');
// // //       }
      
// // //       // Then fetch fresh data from server to ensure consistency
// // //       setTimeout(() => {
// // //         fetchBookings();
// // //         fetchPendingModifications();
// // //         checkForConcurrentRequests();
// // //       }, 500);
      
// // //       if (socketRef.current) {
// // //         socketRef.current.emit('modification-response', {
// // //           ride_id: ride.id,
// // //           request_id: requestId,
// // //           action: action,
// // //           booking_id: bookingId
// // //         });
// // //       }
      
// // //       // Force a re-render
// // //       setRefreshKey(prev => prev + 1);
      
// // //     } catch (error) {
// // //       console.error('Modification action error:', error);
// // //       showCustomAlert('Error', error.message, 'error');
// // //     }
// // //   });
// // // };

// // //   const handleRateRider = async (booking, sessionId) => {
// // //     let effectiveSessionId = sessionId || ride?.live_session?.session_id;
    
// // //     if (!effectiveSessionId) {
// // //       try {
// // //         const response = await fetch(`${API_BASE_URL}/booking/${booking.booking_id}/session`);
// // //         const data = await response.json();
        
// // //         if (data.session_id) {
// // //           effectiveSessionId = data.session_id;
// // //         }
// // //       } catch (error) {
// // //         console.log('Error fetching session from booking:', error);
// // //       }
// // //     }
    
// // //     if (!effectiveSessionId) {
// // //       showCustomAlert('Error', 'Cannot rate rider: No session found for this ride', 'error');
// // //       return;
// // //     }
    
// // //     setSelectedRider(booking);
// // //     setCurrentSessionId(effectiveSessionId);
// // //     setRating(0);
// // //     setFeedback('');
// // //     setRatingModalVisible(true);
// // //   };

// // //   const submitRiderRating = async () => {
// // //     if (!selectedRider) return;
// // //     if (rating === 0) {
// // //       showCustomAlert('Rating Required', 'Please select a rating before submitting', 'warning');
// // //       return;
// // //     }
    
// // //     setModifyingRequest(true);
// // //     try {
// // //       const sessionId = currentSessionId;
// // //       if (!sessionId) {
// // //         throw new Error('No session ID found');
// // //       }
      
// // //       const requestBody = {
// // //         booking_id: selectedRider.booking_id,
// // //         rating: rating,
// // //         feedback: typeof feedback === 'string' ? feedback : String(feedback || ''),
// // //       };
      
// // //       const response = await fetch(`${API_BASE_URL}/ride-sessions/${sessionId}/rate-rider`, {
// // //         method: 'POST',
// // //         headers: { 'Content-Type': 'application/json' },
// // //         body: JSON.stringify(requestBody),
// // //       });
      
// // //       const data = await response.json();
      
// // //       if (!response.ok) {
// // //         if (response.status === 400 && data.detail?.includes('already')) {
// // //           showCustomAlert('Already Rated', 'You have already rated this rider', 'info');
// // //           setRatingModalVisible(false);
// // //           setSelectedRider(null);
// // //           setCurrentSessionId(null);
// // //           setRating(0);
// // //           setFeedback('');
// // //           await fetchBookings();
// // //           return;
// // //         }
// // //         throw new Error(data.detail || 'Failed to submit rating');
// // //       }
      
// // //       setRatingModalVisible(false);
// // //       setRating(0);
// // //       setFeedback('');
// // //       setSelectedRider(null);
// // //       setCurrentSessionId(null);
      
// // //       showCustomAlert('Rating Submitted', `You rated ${selectedRider.passenger_name || 'the rider'} ${rating} stars!`, 'success');
// // //       await fetchBookings();
      
// // //     } catch (error) {
// // //       console.error('Rating error:', error);
// // //       showCustomAlert('Error', error.message || 'Could not submit rating', 'error');
// // //     } finally {
// // //       setModifyingRequest(false);
// // //     }
// // //   };

// // //   const renderStars = () => (
// // //     <View style={styles.starsRow}>
// // //       {[1, 2, 3, 4, 5].map((star) => (
// // //         <TouchableOpacity key={star} onPress={() => setRating(star)}>
// // //           <Ionicons
// // //             name={star <= rating ? 'star' : 'star-outline'}
// // //             size={32}
// // //             color={star <= rating ? '#F59E0B' : '#D1D5DB'}
// // //             style={{ marginHorizontal: 4 }}
// // //           />
// // //         </TouchableOpacity>
// // //       ))}
// // //     </View>
// // //   );

// // //   // Get driver start coordinates
// // //   const driverStart = useMemo(() => {
// // //     if (ride?.origin_lat && ride?.origin_lon) {
// // //       return { latitude: Number(ride.origin_lat), longitude: Number(ride.origin_lon) };
// // //     }
// // //     if (ride?.origin_coords && Array.isArray(ride.origin_coords) && ride.origin_coords.length === 2) {
// // //       return { longitude: Number(ride.origin_coords[0]), latitude: Number(ride.origin_coords[1]) };
// // //     }
// // //     const routeCoords = parseRouteCoordinates(ride?.routeCoordinates);
// // //     if (routeCoords.length > 0) return routeCoords[0];
// // //     return null;
// // //   }, [ride]);

// // //   // Get driver end coordinates
// // //   const driverEnd = useMemo(() => {
// // //     if (ride?.destination_lat && ride?.destination_lon) {
// // //       return { latitude: Number(ride.destination_lat), longitude: Number(ride.destination_lon) };
// // //     }
// // //     if (ride?.destination_coords && Array.isArray(ride.destination_coords) && ride.destination_coords.length === 2) {
// // //       return { longitude: Number(ride.destination_coords[0]), latitude: Number(ride.destination_coords[1]) };
// // //     }
// // //     const routeCoords = parseRouteCoordinates(ride?.routeCoordinates);
// // //     if (routeCoords.length > 0) return routeCoords[routeCoords.length - 1];
// // //     return null;
// // //   }, [ride]);

// // //   const formatDateTime = (dateString) => {
// // //     if (!dateString) return '';
// // //     const date = new Date(dateString);
// // //     if (isNaN(date.getTime())) return '';
// // //     return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false });
// // //   };

// // //   const routePath = useMemo(() => {
// // //     const fullRoute = parseRouteCoordinates(ride?.routeCoordinates);
// // //     if (fullRoute.length >= 2) return fullRoute;
// // //     if (driverStart && driverEnd) return [driverStart, driverEnd];
// // //     return [];
// // //   }, [ride, driverStart, driverEnd]);

// // //   // Calculate distance between two coordinates (in km)
// // //   const calculateDistance = (lat1, lon1, lat2, lon2) => {
// // //     const R = 6371;
// // //     const dLat = (lat2 - lat1) * Math.PI / 180;
// // //     const dLon = (lon2 - lon1) * Math.PI / 180;
// // //     const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
// // //               Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
// // //               Math.sin(dLon/2) * Math.sin(dLon/2);
// // //     const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
// // //     return R * c;
// // //   };

// // //   // Calculate estimated travel time between points (in minutes)
// // //   const calculateTravelTime = (distanceKm, avgSpeedKmh = 40) => {
// // //     const timeHours = distanceKm / avgSpeedKmh;
// // //     const timeMinutes = Math.round(timeHours * 60);
// // //     return timeMinutes;
// // //   };

// // //   // Format duration display
// // //   const formatDuration = (minutes) => {
// // //     if (minutes < 60) return `${minutes} min`;
// // //     const hours = Math.floor(minutes / 60);
// // //     const mins = minutes % 60;
// // //     return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`;
// // //   };

// // //   // Get all map markers - ONLY for accepted bookings (not cancelled/rejected)
// // //   const getAllMapMarkers = useMemo(() => {
// // //     const markers = [];
// // //     // Only include accepted bookings (not cancelled or rejected)
// // //     const confirmedBookings = bookings.filter(b => b.status === 'accepted');
    
// // //     // Driver start point
// // //     if (driverStart?.latitude && driverStart?.longitude) {
// // //       markers.push({
// // //         id: 'driver-start',
// // //         type: 'start',
// // //         coordinate: driverStart,
// // //         title: '🚗 Trip Start',
// // //         address: ride?.origin || 'Starting point',
// // //         time: formatDateTime(ride?.departure_time),
// // //         icon: 'flag',
// // //         order: 0,
// // //         walkDistance: null,
// // //         description: `Departure: ${formatDate(ride?.departure_time)}`
// // //       });
// // //     }
    
// // //     // Add rider pickup points
// // //     confirmedBookings.forEach((booking, idx) => {
// // //       const pickupLat = booking.intersection_pickup_lat || booking.pickup_lat;
// // //       const pickupLon = booking.intersection_pickup_lon || booking.pickup_lon;
// // //       if (pickupLat && pickupLon) {
// // //         markers.push({
// // //           id: `pickup-${booking.booking_id}`,
// // //           type: 'pickup',
// // //           coordinate: { latitude: Number(pickupLat), longitude: Number(pickupLon) },
// // //           title: `📍 Pickup: ${booking.passenger_name || 'Rider'}`,
// // //           address: booking.origin || 'Pickup location',
// // //           walkDistance: booking.pickup_walk_distance_m,
// // //           walkDuration: booking.pickup_walk_distance_m ? Math.round(booking.pickup_walk_distance_m / 80) : null,
// // //           riderName: booking.passenger_name,
// // //           seats: booking.seats_booked,
// // //           icon: 'person-add',
// // //           order: markers.length,
// // //           description: `${booking.seats_booked} seat(s) • ${booking.pickup_walk_distance_m ? `${booking.pickup_walk_distance_m}m walk` : 'Direct pickup'}`
// // //         });
// // //       }
// // //     });
    
// // //     // Add rider dropoff points
// // //     confirmedBookings.forEach((booking, idx) => {
// // //       const dropLat = booking.intersection_drop_lat || booking.drop_lat;
// // //       const dropLon = booking.intersection_drop_lon || booking.drop_lon;
// // //       if (dropLat && dropLon) {
// // //         markers.push({
// // //           id: `dropoff-${booking.booking_id}`,
// // //           type: 'dropoff',
// // //           coordinate: { latitude: Number(dropLat), longitude: Number(dropLon) },
// // //           title: `🏁 Dropoff: ${booking.passenger_name || 'Rider'}`,
// // //           address: booking.destination || 'Dropoff location',
// // //           walkDistance: booking.drop_walk_distance_m,
// // //           walkDuration: booking.drop_walk_distance_m ? Math.round(booking.drop_walk_distance_m / 80) : null,
// // //           riderName: booking.passenger_name,
// // //           seats: booking.seats_booked,
// // //           icon: 'flag',
// // //           order: markers.length,
// // //           description: `${booking.drop_walk_distance_m ? `${booking.drop_walk_distance_m}m walk to destination` : 'Direct dropoff'}`
// // //         });
// // //       }
// // //     });
    
// // //     // Driver end point
// // //     if (driverEnd?.latitude && driverEnd?.longitude) {
// // //       markers.push({
// // //         id: 'driver-end',
// // //         type: 'end',
// // //         coordinate: driverEnd,
// // //         title: '🏁 Trip End',
// // //         address: ride?.destination || 'Destination',
// // //         time: formatDateTime(ride?.expected_end_time || ride?.departure_time),
// // //         icon: 'flag',
// // //         order: markers.length,
// // //         walkDistance: null,
// // //         description: 'Final destination'
// // //       });
// // //     }
    
// // //     return markers.sort((a, b) => a.order - b.order);
// // //   }, [bookings, driverStart, driverEnd, ride]);

// // //   // Get walking path lines - ONLY for accepted bookings
// // //   const walkingPaths = useMemo(() => {
// // //     const paths = [];
// // //     const confirmedBookings = bookings.filter(b => b.status === 'accepted');
    
// // //     confirmedBookings.forEach(booking => {
// // //       // Pickup walking path
// // //       const pickupLat = booking.intersection_pickup_lat || booking.pickup_lat;
// // //       const pickupLon = booking.intersection_pickup_lon || booking.pickup_lon;
// // //       const pickupAddressLat = booking.pickup_lat;
// // //       const pickupAddressLon = booking.pickup_lon;
      
// // //       if (pickupLat && pickupLon && pickupAddressLat && pickupAddressLon) {
// // //         const distance = calculateDistance(
// // //           pickupLat, pickupLon, pickupAddressLat, pickupAddressLon
// // //         );
// // //         if (distance > 0.05) {
// // //           paths.push({
// // //             id: `walking-pickup-${booking.booking_id}`,
// // //             coordinates: [
// // //               { latitude: Number(pickupLat), longitude: Number(pickupLon) },
// // //               { latitude: Number(pickupAddressLat), longitude: Number(pickupAddressLon) }
// // //             ],
// // //             color: '#10B981',
// // //             lineDash: [5, 5],
// // //             walkDistance: booking.pickup_walk_distance_m,
// // //             type: 'pickup'
// // //           });
// // //         }
// // //       }
      
// // //       // Dropoff walking path
// // //       const dropLat = booking.intersection_drop_lat || booking.drop_lat;
// // //       const dropLon = booking.intersection_drop_lon || booking.drop_lon;
// // //       const dropAddressLat = booking.drop_lat;
// // //       const dropAddressLon = booking.drop_lon;
      
// // //       if (dropLat && dropLon && dropAddressLat && dropAddressLon) {
// // //         const distance = calculateDistance(
// // //           dropLat, dropLon, dropAddressLat, dropAddressLon
// // //         );
// // //         if (distance > 0.05) {
// // //           paths.push({
// // //             id: `walking-dropoff-${booking.booking_id}`,
// // //             coordinates: [
// // //               { latitude: Number(dropLat), longitude: Number(dropLon) },
// // //               { latitude: Number(dropAddressLat), longitude: Number(dropAddressLon) }
// // //             ],
// // //             color: '#F59E0B',
// // //             lineDash: [5, 5],
// // //             walkDistance: booking.drop_walk_distance_m,
// // //             type: 'dropoff'
// // //           });
// // //         }
// // //       }
// // //     });
    
// // //     return paths;
// // //   }, [bookings]);

// // //   // Enhanced trip timeline - ONLY for accepted bookings
// // //   const sortedTripTimeline = useMemo(() => {
// // //     const items = [];
// // //     const confirmedBookings = bookings.filter(b => b.status === 'accepted');
    
// // //     // Create all potential points with coordinates
// // //     const allPoints = [];
// // //     let cumulativeDistance = 0;
// // //     let cumulativeDuration = 0;
    
// // //     // Start point
// // //     if (driverStart?.latitude && driverStart?.longitude) {
// // //       allPoints.push({
// // //         id: 'start',
// // //         type: 'start',
// // //         title: 'Trip Start',
// // //         address: ride?.origin || 'Starting point',
// // //         actualAddress: ride?.origin || 'Starting point',
// // //         time: formatDateTime(ride?.departure_time),
// // //         fullDateTime: ride?.departure_time,
// // //         coordinates: driverStart,
// // //         order: 0,
// // //         icon: '🚗',
// // //         color: '#2457A6'
// // //       });
// // //     }
    
// // //     // Add all pickup and dropoff points
// // //     confirmedBookings.forEach(booking => {
// // //       const pickupLat = booking.intersection_pickup_lat || booking.pickup_lat;
// // //       const pickupLon = booking.intersection_pickup_lon || booking.pickup_lon;
// // //       const pickupCacheKey = `${pickupLat},${pickupLon}`;
// // //       const pickupAddress = addressCache[pickupCacheKey];
      
// // //       if (pickupLat && pickupLon) {
// // //         allPoints.push({
// // //           id: `pickup-${booking.booking_id}`,
// // //           type: 'pickup',
// // //           title: `Pickup: ${booking.passenger_name || 'Rider'}`,
// // //           address: booking.origin || 'Pickup location',
// // //           actualAddress: pickupAddress || (booking.origin ? booking.origin : `Location loading...`),
// // //           time: formatDateTime(booking.pickup_time || ride?.departure_time),
// // //           walkDistance: booking.pickup_walk_distance_m,
// // //           walkDuration: booking.pickup_walk_distance_m ? Math.round(booking.pickup_walk_distance_m / 80) : null,
// // //           riderName: booking.passenger_name,
// // //           seats: booking.seats_booked,
// // //           coordinates: { latitude: Number(pickupLat), longitude: Number(pickupLon) },
// // //           icon: '📍',
// // //           color: '#10B981'
// // //         });
// // //       }
      
// // //       const dropLat = booking.intersection_drop_lat || booking.drop_lat;
// // //       const dropLon = booking.intersection_drop_lon || booking.drop_lon;
// // //       const dropCacheKey = `${dropLat},${dropLon}`;
// // //       const dropAddress = addressCache[dropCacheKey];
      
// // //       if (dropLat && dropLon) {
// // //         allPoints.push({
// // //           id: `dropoff-${booking.booking_id}`,
// // //           type: 'dropoff',
// // //           title: `Dropoff: ${booking.passenger_name || 'Rider'}`,
// // //           address: booking.destination || 'Dropoff location',
// // //           actualAddress: dropAddress || (booking.destination ? booking.destination : `Location loading...`),
// // //           time: formatDateTime(booking.dropoff_time || ride?.expected_end_time),
// // //           walkDistance: booking.drop_walk_distance_m,
// // //           walkDuration: booking.drop_walk_distance_m ? Math.round(booking.drop_walk_distance_m / 80) : null,
// // //           riderName: booking.passenger_name,
// // //           seats: booking.seats_booked,
// // //           coordinates: { latitude: Number(dropLat), longitude: Number(dropLon) },
// // //           icon: '🏁',
// // //           color: '#F59E0B'
// // //         });
// // //       }
// // //     });
    
// // //     // End point
// // //     if (driverEnd?.latitude && driverEnd?.longitude) {
// // //       allPoints.push({
// // //         id: 'end',
// // //         type: 'end',
// // //         title: 'Trip End',
// // //         address: ride?.destination || 'Destination',
// // //         actualAddress: ride?.destination || 'Destination',
// // //         time: formatDateTime(ride?.expected_end_time || ride?.departure_time),
// // //         coordinates: driverEnd,
// // //         icon: '🏁',
// // //         color: '#DC2626'
// // //       });
// // //     }
    
// // //     // Sort points based on route order
// // //     const routeCoords = routePath;
// // //     const sortedPoints = [];
    
// // //     if (routeCoords.length > 0) {
// // //       const pointsWithDistance = allPoints.map(point => {
// // //         let minDistance = Infinity;
// // //         let indexOnRoute = -1;
        
// // //         routeCoords.forEach((coord, idx) => {
// // //           const distance = calculateDistance(
// // //             point.coordinates.latitude,
// // //             point.coordinates.longitude,
// // //             coord.latitude,
// // //             coord.longitude
// // //           );
// // //           if (distance < minDistance) {
// // //             minDistance = distance;
// // //             indexOnRoute = idx;
// // //           }
// // //         });
        
// // //         return { ...point, routeIndex: indexOnRoute, distanceToRoute: minDistance };
// // //       });
      
// // //       pointsWithDistance.sort((a, b) => a.routeIndex - b.routeIndex);
// // //       sortedPoints.push(...pointsWithDistance);
// // //     } else {
// // //       sortedPoints.push(...allPoints);
// // //     }
    
// // //     // Calculate cumulative distances and durations
// // //     for (let i = 0; i < sortedPoints.length - 1; i++) {
// // //       const current = sortedPoints[i];
// // //       const next = sortedPoints[i + 1];
// // //       if (current.coordinates && next.coordinates) {
// // //         const distance = calculateDistance(
// // //           current.coordinates.latitude,
// // //           current.coordinates.longitude,
// // //           next.coordinates.latitude,
// // //           next.coordinates.longitude
// // //         );
// // //         const duration = calculateTravelTime(distance);
        
// // //         cumulativeDistance += distance;
// // //         cumulativeDuration += duration;
        
// // //         sortedPoints[i].distanceToNext = distance.toFixed(1);
// // //         sortedPoints[i].durationToNext = duration;
// // //         sortedPoints[i].cumulativeDistance = cumulativeDistance.toFixed(1);
// // //         sortedPoints[i].cumulativeDuration = cumulativeDuration;
// // //         sortedPoints[i].segmentNumber = i + 1;
// // //       }
// // //     }
    
// // //     // Add total trip summary
// // //     if (sortedPoints.length > 0 && sortedPoints[0]) {
// // //       sortedPoints[0].totalDistance = cumulativeDistance.toFixed(1);
// // //       sortedPoints[0].totalDuration = cumulativeDuration;
// // //     }
    
// // //     return sortedPoints;
// // //   }, [bookings, driverStart, driverEnd, ride, routePath, addressCache]);

// // //   const allMarkerCoords = useMemo(() => {
// // //     const coords = getAllMapMarkers.map(m => m.coordinate).filter(c => c?.latitude && c?.longitude);
// // //     walkingPaths.forEach(path => {
// // //       path.coordinates.forEach(coord => {
// // //         coords.push(coord);
// // //       });
// // //     });
// // //     return coords;
// // //   }, [getAllMapMarkers, walkingPaths]);

// // //   const fitMapToMarkers = useCallback(() => {
// // //     if (mapRef.current && mapReady && allMarkerCoords.length >= 1) {
// // //       setTimeout(() => {
// // //         try {
// // //           mapRef.current.fitToCoordinates(allMarkerCoords, {
// // //             edgePadding: { top: 80, right: 50, bottom: 50, left: 50 },
// // //             animated: true,
// // //           });
// // //         } catch (e) { console.log('fitToCoordinates error:', e); }
// // //       }, 500);
// // //     }
// // //   }, [mapReady, allMarkerCoords]);

// // //   useEffect(() => {
// // //     if (mapReady && allMarkerCoords.length >= 1) fitMapToMarkers();
// // //   }, [mapReady, allMarkerCoords, fitMapToMarkers]);

// // //   const getVehicleName = () => {
// // //     if (ride?.vehicle) {
// // //       const parts = [];
// // //       if (ride.vehicle.make) parts.push(ride.vehicle.make);
// // //       if (ride.vehicle.model) parts.push(ride.vehicle.model);
// // //       if (parts.length > 0) return parts.join(' ');
// // //     }
// // //     return 'Vehicle details unavailable';
// // //   };
  
// // //   const vehicleName = getVehicleName();
// // //   const vehicleRegNumber = ride?.vehicle?.registration_number || null;
  
// // //   const totalSeatsOffered = ride?.available_seats ?? 0;

// // //   const mapHeight = animatedDrawer.interpolate({ inputRange: [0, 1], outputRange: [height - SAFE_TOP - COLLAPSED_HEIGHT, height * 0.35] });
// // //   const drawerHeight = animatedDrawer.interpolate({ inputRange: [0, 1], outputRange: [COLLAPSED_HEIGHT, EXPANDED_HEIGHT] });

// // //   const toggleDrawer = () => {
// // //     const nextExpanded = !drawerExpanded;
// // //     setDrawerExpanded(nextExpanded);
// // //     Animated.timing(animatedDrawer, { toValue: nextExpanded ? 1 : 0, duration: 260, useNativeDriver: false }).start();
// // //   };

// // //   const panResponder = useRef(PanResponder.create({
// // //     onMoveShouldSetPanResponder: (_, gestureState) => Math.abs(gestureState.dy) > 5,
// // //     onPanResponderMove: (_, gestureState) => {
// // //       const dragRange = EXPANDED_HEIGHT - COLLAPSED_HEIGHT;
// // //       const progress = drawerExpanded ? 1 - (gestureState.dy / dragRange) : gestureState.dy / dragRange;
// // //       animatedDrawer.setValue(Math.max(0, Math.min(1, progress)));
// // //     },
// // //     onPanResponderRelease: (_, gestureState) => {
// // //       const dragRange = EXPANDED_HEIGHT - COLLAPSED_HEIGHT;
// // //       const threshold = dragRange * 0.2;
// // //       if (drawerExpanded) {
// // //         if (gestureState.dy > threshold) {
// // //           setDrawerExpanded(false);
// // //           Animated.timing(animatedDrawer, { toValue: 0, duration: 200, useNativeDriver: false }).start();
// // //         } else {
// // //           setDrawerExpanded(true);
// // //           Animated.timing(animatedDrawer, { toValue: 1, duration: 200, useNativeDriver: false }).start();
// // //         }
// // //       } else {
// // //         if (gestureState.dy < -threshold) {
// // //           setDrawerExpanded(true);
// // //           Animated.timing(animatedDrawer, { toValue: 1, duration: 200, useNativeDriver: false }).start();
// // //         } else {
// // //           setDrawerExpanded(false);
// // //           Animated.timing(animatedDrawer, { toValue: 0, duration: 200, useNativeDriver: false }).start();
// // //         }
// // //       }
// // //     },
// // //   })).current;

// // //   const getStatusColor = (status) => {
// // //     switch (status) {
// // //       case 'accepted': return '#10B981';
// // //       case 'pending': return '#F59E0B';
// // //       case 'rejected': return '#EF4444';
// // //       case 'cancelled': return '#6B7280';
// // //       default: return Colors.gray;
// // //     }
// // //   };

// // //   const getStatusText = (status) => {
// // //     switch (status) {
// // //       case 'accepted': return 'Confirmed';
// // //       case 'pending': return 'Pending';
// // //       case 'rejected': return 'Rejected';
// // //       case 'cancelled': return 'Cancelled';
// // //       default: return status;
// // //     }
// // //   };

// // //   const handleChatWithPassenger = (passengerPhone, passengerName, passengerPhoto) => {
// // //     navigation.navigate('ChatScreen', {
// // //       receiverPhone: passengerPhone,
// // //       conversationId: `chat-${ride?.id}-${passengerPhone}`,
// // //       rideId: ride?.id,
// // //       user: {
// // //         name: passengerName,
// // //         tripInfo: `${ride?.origin || 'Pickup'} → ${ride?.destination || 'Drop'}`,
// // //         phone: passengerPhone,
// // //         profile_picture: passengerPhoto
// // //       }
// // //     });
// // //   };

// // //   const handleStartRide = () => {
// // //     navigation.navigate('StartRideConfirmScreen', { rideId: ride?.id, ride });
// // //   };

// // //   const handleEditRide = () => {
// // //     if (!ride?.id) {
// // //       showCustomAlert("Error", "Cannot edit ride: Ride ID missing", "error");
// // //       return;
// // //     }
    
// // //     if (!user?.phone_number) {
// // //       showCustomAlert("Error", "Please login to edit ride", "error");
// // //       return;
// // //     }
    
// // //     if (ride?.started_at) {
// // //       showCustomAlert("Cannot Edit", "Ride has already started. Cannot edit.", "warning");
// // //       return;
// // //     }
    
// // //     if (ride?.cancellation_reason) {
// // //       showCustomAlert("Cannot Edit", "Cancelled ride cannot be edited.", "warning");
// // //       return;
// // //     }
    
// // //     const rideData = {
// // //       from: ride?.origin || '',
// // //       to: ride?.destination || '',
// // //       dateTime: ride?.departure_time ? new Date(ride.departure_time) : new Date(),
// // //       seatsAvailable: ride?.available_seats || 1,
// // //       pricePerSeat: (ride?.price_per_seat || 0).toString(),
// // //       vehicleId: ride?.vehicle_id || null,
// // //       originCoords: ride?.origin_coords,
// // //       destinationCoords: ride?.destination_coords,
// // //       routeCoordinates: ride?.route_coordinates,
// // //       distanceKm: ride?.distance_km,
// // //       durationText: ride?.duration_text,
// // //       totalPrice: ride?.total_estimated_price,
// // //       preferences: ride?.preferences,
// // //       womenOnly: ride?.women_only,
// // //     };
    
// // //     navigation.navigate('DriveNext', { 
// // //       rideData, 
// // //       isEdit: true, 
// // //       rideId: ride.id, 
// // //       phoneNumber: user?.phone_number 
// // //     });
// // //   };

// // //   const handleCancelRide = () => {
// // //     showConfirmationAlert("Cancel Ride", "Are you sure you want to cancel this ride?", async () => {
// // //       try {
// // //         const response = await fetch(`${API_BASE_URL}/ride/${ride?.id}/cancel`, { method: 'PUT' });
// // //         if (!response.ok) throw new Error('Failed to cancel ride');
// // //         showCustomAlert("Success", "Ride cancelled successfully.", "success");
// // //         setTimeout(() => navigation.goBack(), 1500);
// // //       } catch (err) {
// // //         showCustomAlert("Error", "Could not cancel ride.", "error");
// // //       }
// // //     });
// // //   };

// // //   const handleNavigateToLocation = (latitude, longitude, title) => {
// // //     const url = Platform.select({
// // //       ios: `maps:0,0?q=${latitude},${longitude}`,
// // //       android: `geo:0,0?q=${latitude},${longitude}(${encodeURIComponent(title)})`
// // //     });
// // //     Linking.openURL(url).catch(err => {
// // //       showCustomAlert("Error", "Could not open maps", "error");
// // //     });
// // //   };

// // //   const focusOnStop = (coordinates) => {
// // //     if (mapRef.current && coordinates) {
// // //       mapRef.current.animateToRegion({
// // //         latitude: coordinates.latitude,
// // //         longitude: coordinates.longitude,
// // //         latitudeDelta: 0.01,
// // //         longitudeDelta: 0.01,
// // //       }, 500);
// // //     }
// // //   };

// // //   const initialRegion = {
// // //     latitude: driverStart?.latitude || 28.6139,
// // //     longitude: driverStart?.longitude || 77.2090,
// // //     latitudeDelta: 0.05,
// // //     longitudeDelta: 0.05,
// // //   };

// // //   const confirmedBookings = bookings.filter(b => b.status === 'accepted');
// // //   const pendingBookings = bookings.filter(b => b.status === 'pending');
// // //   const rideStatus = getRideStatusDisplay();
// // //   const showStartRide = !ride?.started_at && !ride?.cancellation_reason && ride?.status !== 'completed' && rideStatus.type !== 'auto-cancelled';
// // //   const pendingMods = pendingModifications.filter(m => m.status === 'pending' || m.status === undefined);
// // //   const showLiveSession = ride?.live_session?.session_id && ride?.started_at && ride?.status !== 'completed';
// // //   const isCompleted = ride?.status === 'completed' || ride?.completed_at;
// // //   const isOngoing = ride?.started_at && !isCompleted;
// // //   const unratedRiders = confirmedBookings.filter(b => !b.driver_rating_given && b.driver_rating_given !== true);
// // //   const needsRating = isCompleted && unratedRiders.length > 0;
// // //   const showRatingSection = isCompleted && confirmedBookings.length > 0;

// // //   // Render walking path
// // //   const renderWalkingPath = (path) => {
// // //     return (
// // //       <Polyline
// // //         key={path.id}
// // //         coordinates={path.coordinates}
// // //         strokeColor={path.color}
// // //         strokeWidth={3}
// // //         lineDashPattern={path.lineDash}
// // //         lineCap="round"
// // //         lineJoin="round"
// // //       />
// // //     );
// // //   };

// // //   // Render marker on map
// // //   const renderMarker = (marker) => {
// // //     let color, size = 36;
// // //     switch (marker.type) {
// // //       case 'start': color = '#2457A6'; size = 42; break;
// // //       case 'end': color = '#DC2626'; size = 42; break;
// // //       case 'pickup': color = '#10B981'; size = 38; break;
// // //       case 'dropoff': color = '#F59E0B'; size = 38; break;
// // //       default: color = '#6B7280'; size = 32;
// // //     }
    
// // //     const iconName = marker.type === 'pickup' ? 'person-add' : (marker.type === 'dropoff' ? 'flag' : 'location');
    
// // //     return (
// // //       <Marker 
// // //         key={marker.id} 
// // //         coordinate={marker.coordinate} 
// // //         title={marker.title} 
// // //         description={marker.description || marker.address}
// // //       >
// // //         <View style={[styles.customMarker, { backgroundColor: color, width: size, height: size, borderRadius: size / 2 }]}>
// // //           <Ionicons name={iconName} size={size * 0.45} color="#fff" />
// // //           {marker.type === 'pickup' && marker.seats && (
// // //             <View style={styles.markerBadge}>
// // //               <Text style={styles.markerBadgeText}>{marker.seats}</Text>
// // //             </View>
// // //           )}
// // //           {marker.walkDistance && marker.walkDistance > 0 && (
// // //             <View style={[styles.walkBadge, { backgroundColor: marker.type === 'pickup' ? '#10B981' : '#F59E0B' }]}>
// // //               <Ionicons name="walk" size={10} color="#fff" />
// // //               <Text style={styles.walkBadgeText}>{marker.walkDistance}m</Text>
// // //             </View>
// // //           )}
// // //         </View>
// // //       </Marker>
// // //     );
// // //   };

// // //   // Render enhanced trip timeline item
// // //   const renderTimelineItem = (item, index) => {
// // //     const isLast = index === sortedTripTimeline.length - 1;
// // //     const hasWalking = item.walkDistance && item.walkDistance > 0;
    
// // //     return (
// // //       <TouchableOpacity 
// // //         key={item.id} 
// // //         style={styles.timelineItemCard}
// // //         onPress={() => focusOnStop(item.coordinates)}
// // //         activeOpacity={0.7}
// // //       >
// // //         <View style={styles.timelineItemLeft}>
// // //           <View style={[styles.timelineItemDot, { backgroundColor: item.color }]}>
// // //             <Text style={styles.timelineItemIcon}>{item.icon}</Text>
// // //           </View>
// // //           {!isLast && <View style={[styles.timelineItemLine, { backgroundColor: item.color + '40' }]} />}
// // //         </View>
        
// // //         <View style={styles.timelineItemRight}>
// // //           <View style={styles.timelineItemHeader}>
// // //             <Text style={styles.timelineItemType}>{item.type.toUpperCase()}</Text>
// // //             {item.segmentNumber && (
// // //               <View style={styles.segmentBadge}>
// // //                 <Text style={styles.segmentBadgeText}>Stop {item.segmentNumber}</Text>
// // //               </View>
// // //             )}
// // //           </View>
          
// // //           <Text style={styles.timelineItemTitle}>{item.title}</Text>
          
// // //           <View style={styles.timelineItemDetails}>
// // //             {item.riderName && (
// // //               <View style={styles.detailChip}>
// // //                 <Ionicons name="person-outline" size={12} color="#6B7280" />
// // //                 <Text style={styles.detailChipText}>{item.riderName}</Text>
// // //               </View>
// // //             )}
// // //             {item.seats && (
// // //               <View style={styles.detailChip}>
// // //                 <Ionicons name="people-outline" size={12} color="#6B7280" />
// // //                 <Text style={styles.detailChipText}>{item.seats} seat{item.seats > 1 ? 's' : ''}</Text>
// // //               </View>
// // //             )}
// // //             {item.time && (
// // //               <View style={styles.detailChip}>
// // //                 <Ionicons name="time-outline" size={12} color="#6B7280" />
// // //                 <Text style={styles.detailChipText}>{item.time}</Text>
// // //               </View>
// // //             )}
// // //           </View>
          
// // //           <Text style={styles.timelineItemAddress} numberOfLines={2}>
// // //             {item.actualAddress || item.address}
// // //           </Text>
          
// // //           {hasWalking && (
// // //             <View style={[styles.walkingChip, { backgroundColor: item.color + '15' }]}>
// // //               <Ionicons name="walk" size={14} color={item.color} />
// // //               <Text style={[styles.walkingChipText, { color: item.color }]}>
// // //                 Walk {item.walkDistance}m • ~{item.walkDuration} min
// // //               </Text>
// // //             </View>
// // //           )}
          
// // //           {item.distanceToNext && (
// // //             <View style={styles.routeInfo}>
// // //               <View style={styles.routeInfoItem}>
// // //                 <Ionicons name="navigate-outline" size={12} color="#2457A6" />
// // //                 <Text style={styles.routeInfoText}>Next: {item.distanceToNext} km</Text>
// // //               </View>
// // //               <View style={styles.routeInfoItem}>
// // //                 <Ionicons name="time-outline" size={12} color="#F59E0B" />
// // //                 <Text style={styles.routeInfoText}>~{formatDuration(item.durationToNext)}</Text>
// // //               </View>
// // //               {item.cumulativeDistance && (
// // //                 <View style={styles.routeInfoItem}>
// // //                   <Ionicons name="flag-outline" size={12} color="#10B981" />
// // //                   <Text style={styles.routeInfoText}>Total: {item.cumulativeDistance} km</Text>
// // //                 </View>
// // //               )}
// // //             </View>
// // //           )}
          
// // //           <TouchableOpacity 
// // //             style={styles.navigateButton}
// // //             onPress={() => handleNavigateToLocation(
// // //               item.coordinates.latitude,
// // //               item.coordinates.longitude,
// // //               item.title
// // //             )}
// // //           >
// // //             <Ionicons name="navigate-circle" size={16} color="#2457A6" />
// // //             <Text style={styles.navigateButtonText}>Navigate to this stop</Text>
// // //           </TouchableOpacity>
// // //         </View>
// // //       </TouchableOpacity>
// // //     );
// // //   };

// // //   return (
// // //     <View style={styles.container}>
// // //       <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />

// // //       <Animated.View style={[styles.mapContainer, { height: mapHeight }]}>
// // //         <MapView
// // //           ref={mapRef}
// // //           provider={PROVIDER_GOOGLE}
// // //           style={styles.map}
// // //           initialRegion={initialRegion}
// // //           onMapReady={() => setMapReady(true)}
// // //           showsUserLocation={false}
// // //           showsMyLocationButton={false}
// // //           zoomEnabled={true}
// // //           zoomControlEnabled={true}
// // //         >
// // //           {/* Main route polyline */}
// // //           {routePath.length >= 2 && (
// // //             <>
// // //               <Polyline 
// // //                 coordinates={routePath} 
// // //                 strokeColor="#2457A6" 
// // //                 strokeWidth={6} 
// // //                 lineCap="round" 
// // //                 lineJoin="round"
// // //               />
// // //               <Polyline 
// // //                 coordinates={routePath} 
// // //                 strokeColor="#4A7DFF" 
// // //                 strokeWidth={3} 
// // //                 lineCap="round" 
// // //                 lineJoin="round"
// // //                 lineDashPattern={[0]}
// // //               />
// // //             </>
// // //           )}
          
// // //           {/* Walking paths for pickup and dropoff */}
// // //           {walkingPaths.map(path => renderWalkingPath(path))}
          
// // //           {/* Proximity circles for pickup points */}
// // //           {getAllMapMarkers.filter(m => m.type === 'pickup' && m.walkDistance).map(marker => (
// // //             <Circle
// // //               key={`circle-${marker.id}`}
// // //               center={marker.coordinate}
// // //               radius={marker.walkDistance}
// // //               strokeColor="rgba(16, 185, 129, 0.3)"
// // //               fillColor="rgba(16, 185, 129, 0.1)"
// // //               strokeWidth={1}
// // //             />
// // //           ))}
          
// // //           {/* All markers */}
// // //           {getAllMapMarkers.map(marker => renderMarker(marker))}
// // //         </MapView>

// // //         <TouchableOpacity style={styles.mapBackButton} onPress={() => navigation.goBack()}>
// // //           <Ionicons name="chevron-back" size={26} color={Colors.secondary} />
// // //         </TouchableOpacity>
        
// // //         {/* Map Legend */}
// // //         <View style={styles.mapLegend}>
// // //           <View style={styles.legendTitle}>
// // //             <Text style={styles.legendTitleText}>Map Legend</Text>
// // //           </View>
// // //           <View style={styles.legendItem}>
// // //             <View style={[styles.legendColor, { backgroundColor: '#2457A6', width: 20 }]} />
// // //             <Text style={styles.legendText}>Main Route</Text>
// // //           </View>
// // //           <View style={styles.legendItem}>
// // //             <View style={[styles.legendColor, { backgroundColor: '#10B981', borderStyle: 'dashed', borderWidth: 1, borderColor: '#10B981' }]} />
// // //             <Text style={styles.legendText}>Walking (Pickup)</Text>
// // //           </View>
// // //           <View style={styles.legendItem}>
// // //             <View style={[styles.legendColor, { backgroundColor: '#F59E0B', borderStyle: 'dashed', borderWidth: 1, borderColor: '#F59E0B' }]} />
// // //             <Text style={styles.legendText}>Walking (Dropoff)</Text>
// // //           </View>
// // //           <View style={styles.legendItem}>
// // //             <View style={[styles.legendDot, { backgroundColor: '#10B981' }]} />
// // //             <Text style={styles.legendText}>Pickup Point</Text>
// // //           </View>
// // //           <View style={styles.legendItem}>
// // //             <View style={[styles.legendDot, { backgroundColor: '#F59E0B' }]} />
// // //             <Text style={styles.legendText}>Dropoff Point</Text>
// // //           </View>
// // //         </View>
        
// // //         {/* Map Controls */}
// // //         <View style={styles.mapControls}>
// // //           <TouchableOpacity 
// // //             style={styles.mapControlButton} 
// // //             onPress={() => fitMapToMarkers()}
// // //           >
// // //             <Ionicons name="map-outline" size={20} color="#2457A6" />
// // //           </TouchableOpacity>
// // //         </View>
// // //       </Animated.View>

// // //       <Animated.View style={[styles.drawer, { height: drawerHeight }]}>
// // //         <View style={styles.handleWrap} {...panResponder.panHandlers}>
// // //           <TouchableOpacity activeOpacity={0.9} onPress={toggleDrawer} style={styles.handleHitArea}>
// // //             <View style={styles.handleBar} />
// // //           </TouchableOpacity>
// // //           {!drawerExpanded && pendingMods.length > 0 && (
// // //             <View style={styles.pendingNotificationBadge}>
// // //               <Text style={styles.pendingNotificationText}>{pendingMods.length}</Text>
// // //             </View>
// // //           )}
// // //         </View>

// // //         {!drawerExpanded ? (
// // //           <View style={styles.collapsedSummary}>
// // //             <View style={styles.collapsedTopRow}>
// // //               <View style={{ flex: 1 }}>
// // //                 <Text style={styles.collapsedDriver} numberOfLines={1}>{ride?.driverName || 'Driver'}</Text>
// // //                 <Text style={styles.collapsedSub} numberOfLines={1}>{ride?.origin || 'Pickup'} → {ride?.destination || 'Drop'}</Text>
// // //               </View>
// // //               <View style={styles.collapsedPriceWrap}>
// // //                 <Text style={styles.collapsedPrice}>₹{ride?.price_per_seat}</Text>
// // //                 <Text style={styles.collapsedPerSeat}>per seat</Text>
// // //               </View>
// // //             </View>
// // //             {sortedTripTimeline.length > 0 && sortedTripTimeline[0]?.totalDistance && (
// // //               <View style={styles.collapsedTripInfo}>
// // //                 <Text style={styles.collapsedTripText}>
// // //                   📍 {sortedTripTimeline.length} stops • {sortedTripTimeline[0].totalDistance} km • {formatDuration(sortedTripTimeline[0].totalDuration)}
// // //                 </Text>
// // //               </View>
// // //             )}
// // //           </View>
// // //         ) : (
// // //           <ScrollView ref={scrollViewRef} style={styles.drawerScroll} contentContainerStyle={styles.drawerContent} showsVerticalScrollIndicator={false}>
            
// // //             {/* Status Banner */}
// // //             <View style={[styles.statusBanner, { backgroundColor: rideStatus.color + '20' }]}>
// // //               <Ionicons name={rideStatus.icon} size={20} color={rideStatus.color} />
// // //               <View style={{ flex: 1 }}>
// // //                 <Text style={[styles.statusBannerText, { color: rideStatus.color }]}>{rideStatus.text}</Text>
// // //                 {rideStatus.reason && (
// // //                   <Text style={[styles.statusBannerReason, { color: rideStatus.color }]}>{rideStatus.reason}</Text>
// // //                 )}
// // //               </View>
// // //             </View>

// // //             {/* Cancellation Banner with Reason */}
// // //             {rideStatus.type === 'cancelled' && ride?.cancellation_reason && (
// // //               <View style={styles.cancellationDetailedBanner}>
// // //                 <View style={styles.cancellationHeader}>
// // //                   <Ionicons name="close-circle" size={24} color="#DC2626" />
// // //                   <Text style={styles.cancellationTitle}>Ride Cancelled</Text>
// // //                 </View>
// // //                 <Text style={styles.cancellationMessage}>{ride.cancellation_reason}</Text>
// // //                 {ride.cancelled_by && (
// // //                   <Text style={styles.cancelledByText}>
// // //                     Cancelled by: {ride.cancelled_by === user?.phone_number ? 'You' : 'Driver'}
// // //                   </Text>
// // //                 )}
// // //               </View>
// // //             )}

// // //             {/* Trip Overview Card */}
// // //             <View style={styles.tripOverviewCard}>
// // //               <View style={styles.tripOverviewHeader}>
// // //                 <Ionicons name="information-circle-outline" size={24} color="#2457A6" />
// // //                 <Text style={styles.tripOverviewTitle}>Trip Overview</Text>
// // //               </View>
// // //               <View style={styles.tripOverviewDetails}>
// // //                 <View style={styles.tripOverviewItem}>
// // //                   <Text style={styles.tripOverviewLabel}>From</Text>
// // //                   <Text style={styles.tripOverviewValue}>{ride?.origin || 'Starting point'}</Text>
// // //                 </View>
// // //                 <View style={styles.tripOverviewArrow}>
// // //                   <Ionicons name="arrow-down-outline" size={16} color="#2457A6" />
// // //                 </View>
// // //                 <View style={styles.tripOverviewItem}>
// // //                   <Text style={styles.tripOverviewLabel}>To</Text>
// // //                   <Text style={styles.tripOverviewValue}>{ride?.destination || 'Destination'}</Text>
// // //                 </View>
// // //               </View>
// // //               <View style={styles.tripOverviewStats}>
// // //                 <View style={styles.tripOverviewStat}>
// // //                   <Ionicons name="calendar-outline" size={16} color="#6B7280" />
// // //                   <Text style={styles.tripOverviewStatText}>{formatDate(ride?.departure_time)}</Text>
// // //                 </View>
// // //                 {sortedTripTimeline[0]?.totalDistance && (
// // //                   <View style={styles.tripOverviewStat}>
// // //                     <Ionicons name="map-outline" size={16} color="#6B7280" />
// // //                     <Text style={styles.tripOverviewStatText}>{sortedTripTimeline[0].totalDistance} km total</Text>
// // //                   </View>
// // //                 )}
// // //                 {sortedTripTimeline[0]?.totalDuration && (
// // //                   <View style={styles.tripOverviewStat}>
// // //                     <Ionicons name="time-outline" size={16} color="#6B7280" />
// // //                     <Text style={styles.tripOverviewStatText}>{formatDuration(sortedTripTimeline[0].totalDuration)} est.</Text>
// // //                   </View>
// // //                 )}
// // //               </View>
// // //             </View>

// // //             {/* Total Earnings Banner */}
// // //             {isCompleted && totalEarnings > 0 && (
// // //               <View style={styles.earningsBanner}>
// // //                 <View style={styles.earningsBannerLeft}>
// // //                   <View style={styles.earningsIconContainer}>
// // //                     <Ionicons name="cash-outline" size={28} color="#10B981" />
// // //                   </View>
// // //                   <View>
// // //                     <Text style={styles.earningsLabel}>Total Earnings</Text>
// // //                     <Text style={styles.earningsSubLabel}>From confirmed bookings</Text>
// // //                   </View>
// // //                 </View>
// // //                 <View style={styles.earningsAmountContainer}>
// // //                   <Text style={styles.earningsCurrency}>₹</Text>
// // //                   <Text style={styles.earningsAmount}>{totalEarnings}</Text>
// // //                 </View>
// // //               </View>
// // //             )}

// // //             {/* Earnings Breakdown */}
// // //             {isCompleted && confirmedBookings.length > 0 && (
// // //               <View style={styles.earningsBreakdownCard}>
// // //                 <Text style={styles.earningsBreakdownTitle}>Earnings Breakdown</Text>
// // //                 {confirmedBookings.map((booking) => (
// // //                   <View key={booking.booking_id} style={styles.earningsRow}>
// // //                     <View style={styles.earningsRowLeft}>
// // //                       <View style={styles.earningsRowAvatar}>
// // //                         <Text style={styles.earningsRowInitials}>
// // //                           {getInitials(booking.passenger_name)}
// // //                         </Text>
// // //                       </View>
// // //                       <View>
// // //                         <Text style={styles.earningsRowName}>{booking.passenger_name || 'Rider'}</Text>
// // //                         <Text style={styles.earningsRowSeats}>{booking.seats_booked} seat(s)</Text>
// // //                       </View>
// // //                     </View>
// // //                     <Text style={styles.earningsRowAmount}>
// // //                       ₹{booking.total_amount || booking.seats_booked * (ride?.price_per_seat || 0)}
// // //                     </Text>
// // //                   </View>
// // //                 ))}
// // //                 <View style={styles.earningsDivider} />
// // //                 <View style={styles.earningsTotalRow}>
// // //                   <Text style={styles.earningsTotalLabel}>Total</Text>
// // //                   <Text style={styles.earningsTotalAmount}>₹{totalEarnings}</Text>
// // //                 </View>
// // //               </View>
// // //             )}

// // //             {/* Enhanced Trip Timeline Section - Only shows active bookings */}
// // //             {sortedTripTimeline.length > 0 && (
// // //               <View style={styles.cardSection}>
// // //                 <TouchableOpacity 
// // //                   style={styles.timelineHeader} 
// // //                   onPress={() => setTimelineExpanded(!timelineExpanded)}
// // //                 >
// // //                   <View style={styles.timelineHeaderLeft}>
// // //                     <Ionicons name="map-outline" size={20} color="#2457A6" />
// // //                     <Text style={styles.sectionTitle}>Trip Details</Text>
// // //                     {/* <Text style={styles.timelineStopCount}>({sortedTripTimeline.length} stops)</Text> */}
// // //                   </View>
// // //                   <Ionicons 
// // //                     name={timelineExpanded ? "chevron-up" : "chevron-down"} 
// // //                     size={20} 
// // //                     color={Colors.gray} 
// // //                   />
// // //                 </TouchableOpacity>
                
// // //                 {timelineExpanded && (
// // //                   <View style={styles.timelineContainer}>
// // //                     {sortedTripTimeline.map((item, index) => renderTimelineItem(item, index))}
// // //                   </View>
// // //                 )}
// // //               </View>
// // //             )}

// // //             {/* Vehicle Details */}
// // //             <View style={styles.cardSection}>
// // //               <Text style={styles.sectionTitle}>Vehicle Details</Text>
// // //               <View style={styles.vehicleHeaderRow}>
// // //                 <View style={styles.vehicleIconCircle}><Ionicons name="car-sport-outline" size={24} color="#2457A6" /></View>
// // //                 <View style={styles.vehicleMeta}>
// // //                   <Text style={styles.vehicleTitle}>{vehicleName}</Text>
// // //                   {vehicleRegNumber && (
// // //                     <View style={styles.vehicleRegContainer}>
// // //                       <Ionicons name="clipboard-outline" size={12} color="#6B7280" />
// // //                       <Text style={styles.vehicleRegText}>Reg: {vehicleRegNumber}</Text>
// // //                     </View>
// // //                   )}
// // //                 </View>
// // //               </View>
// // //             </View>

// // //             {/* Seat Information - Updated with accurate available seats */}
// // //           {/* Seat Information - Updated with accurate available seats */}
// // // <View style={styles.cardSection}>
// // //   <Text style={styles.sectionTitle}>Seat Information</Text>
  
// // //   {/* Show warning if there are cancelled bookings due to modification rejection */}
// // //   {bookings.some(b => b.modification_request?.status === 'rejected') && (
// // //     <View style={styles.rejectedModificationWarning}>
// // //       <Ionicons name="warning-outline" size={16} color="#DC2626" />
// // //       <Text style={styles.rejectedModificationWarningText}>
// // //         ⚠️ Some bookings were cancelled due to modification rejection. Seats have been released.
// // //       </Text>
// // //     </View>
// // //   )}
  
// // //   <View style={styles.seatInfoContainer}>
// // //     <View style={styles.seatInfoItem}>
// // //       <View style={[styles.seatIconCircle, { backgroundColor: '#EAF1FF' }]}>
// // //         <Ionicons name="car-sport-outline" size={24} color="#2457A6" />
// // //       </View>
// // //       <Text style={styles.seatInfoLabel}>Total</Text>
// // //       <Text style={styles.seatInfoValue}>{totalSeatsOffered}</Text>
// // //     </View>
// // //     <View style={styles.seatDivider} />
// // //     <View style={styles.seatInfoItem}>
// // //       <View style={[styles.seatIconCircle, { backgroundColor: '#E8F5E9' }]}>
// // //         <Ionicons name="people" size={24} color="#10B981" />
// // //       </View>
// // //       <Text style={styles.seatInfoLabel}>Booked</Text>
// // //       <Text style={[styles.seatInfoValue, { color: '#10B981' }]}>{getActualBookedSeats()}</Text>
// // //     </View>
// // //     <View style={styles.seatDivider} />
// // //     <View style={styles.seatInfoItem}>
// // //       <View style={[styles.seatIconCircle, { backgroundColor: '#FFF3E0' }]}>
// // //         <Ionicons name="person-add" size={24} color="#F59E0B" />
// // //       </View>
// // //       <Text style={styles.seatInfoLabel}>Available</Text>
// // //       <Text style={[styles.seatInfoValue, { color: getActualAvailableSeats() > 0 ? '#F59E0B' : '#DC2626' }]}>
// // //         {getActualAvailableSeats()}
// // //       </Text>
// // //     </View>
// // //   </View>
// // //   <View style={styles.progressBarContainer}>
// // //     <View style={[styles.progressBar, { width: `${totalSeatsOffered > 0 ? (getActualBookedSeats() / totalSeatsOffered) * 100 : 0}%` }]} />
// // //   </View>
// // //   <Text style={styles.progressText}>
// // //     {getActualBookedSeats()} out of {totalSeatsOffered} seats booked
// // //     {getActualAvailableSeats() > 0 && ` • ${getActualAvailableSeats()} seats available`}
// // //   </Text>
  
// // //   {/* Show seat release message if modification was rejected */}
// // //   {getActualAvailableSeats() > 0 && bookings.some(b => b.modification_request?.status === 'rejected') && (
// // //     <Text style={styles.seatReleaseMessage}>
// // //       ✨ {getActualAvailableSeats()} seat(s) are now available for new bookings
// // //     </Text>
// // //   )}
// // // </View>

// // //             {/* Confirmed Bookings - Only shows accepted bookings */}
// // //             {confirmedBookings.length > 0 && (
// // //               <View style={styles.cardSection}>
// // //                 <View style={styles.sectionHeaderWithStatus}>
// // //                   <Text style={styles.sectionTitle}>Bookings ✅ ({confirmedBookings.length})</Text>
// // //                   {(rideStatus.type === 'auto-cancelled' || rideStatus.type === 'cancelled') && (
// // //                     <View style={styles.cancelledBadgeSmall}>
// // //                       <Text style={styles.cancelledBadgeSmallText}>Ride Cancelled</Text>
// // //                     </View>
// // //                   )}
// // //                 </View>
                
// // //              {confirmedBookings.map((booking) => {
// // //   const profilePicUrl = booking.profile_picture ? buildImageUrl(booking.profile_picture) : null;
// // //   const isSvg = profilePicUrl ? isSvgUrl(profilePicUrl) : false;
  
// // //   // Check modification status from the booking object itself
// // //   const hasApprovedModification = booking.modification_request?.status === 'approved';
// // //   const hasPendingModification = booking.modification_request?.status === 'pending';
// // //   const hasRejectedModification = booking.modification_request?.status === 'rejected';
  
// // //   // Also check from pendingModifications array for backward compatibility
// // //   const hasPendingFromArray = pendingModifications.some(
// // //     pm => pm.booking_id === booking.booking_id && pm.status === 'pending'
// // //   );
// // //   const hasRejectedFromArray = pendingModifications.some(
// // //     pm => pm.booking_id === booking.booking_id && pm.status === 'rejected'
// // //   );
  
// // //   // Combine both sources
// // //   const isPendingModification = hasPendingModification || hasPendingFromArray;
// // //   const isRejectedModification = hasRejectedModification || hasRejectedFromArray;
// // //   const isApprovedModification = hasApprovedModification;
  
// // //   // Determine effective seat count
// // //   let effectiveSeatCount = booking.seats_booked || booking.seats_requested || 0;
// // //   let originalSeatCount = effectiveSeatCount;
  
// // //   if (isApprovedModification) {
// // //     effectiveSeatCount = booking.modification_request?.requested_seats || effectiveSeatCount;
// // //   }
  
// // //   // Determine rider-specific status
// // //   const isRideCancelled = rideStatus.type === 'auto-cancelled' || rideStatus.type === 'cancelled';
// // //   const isBookingRejected = booking.status === 'rejected';
// // //   const isBookingCancelled = booking.status === 'cancelled';
// // //   const isModificationRejectedBooking = isRejectedModification;
  
// // //   const showRiderStatus = isRideCancelled || isBookingRejected || isBookingCancelled || isModificationRejectedBooking;
  
// // //   // Don't show location info if ride is cancelled
// // //   const showLocationInfo = !isRideCancelled && !isBookingRejected && !isBookingCancelled && !isModificationRejectedBooking;
  
// // //   return (
// // //     <View key={booking.booking_id} style={[
// // //       styles.bookingItem, 
// // //       (showRiderStatus) && styles.disabledBookingItem
// // //     ]}>
// // //       <TouchableOpacity 
// // //         style={styles.passengerAvatar} 
// // //         onPress={() => profilePicUrl && setSelectedProfile({ visible: true, imageUrl: profilePicUrl, name: booking.passenger_name })}
// // //         disabled={showRiderStatus}
// // //       >
// // //         {profilePicUrl && !isSvg ? 
// // //           <Image source={{ uri: profilePicUrl }} style={styles.avatarImage} /> : 
// // //           profilePicUrl && isSvg ? 
// // //             <View style={styles.avatarImageSvg}>
// // //               <SvgCssUri uri={profilePicUrl} width={44} height={44} />
// // //             </View> : 
// // //             <View style={styles.avatarPlaceholder}>
// // //               <Text style={styles.avatarPlaceholderText}>{getInitials(booking.passenger_name)}</Text>
// // //             </View>
// // //         }
// // //       </TouchableOpacity>
      
// // //       <View style={styles.bookingInfo}>
// // //         <Text style={styles.passengerName}>{booking.passenger_name || 'Passenger'}</Text>
        
// // //         {/* Show modification status badges */}
// // //         {isPendingModification && !showRiderStatus && (
// // //           <View style={styles.modificationStatusBadge}>
// // //             <Ionicons name="swap" size={12} color="#F59E0B" />
// // //             <Text style={[styles.modificationStatusText, { color: '#F59E0B' }]}>
// // //               Modification Request Pending
// // //             </Text>
// // //           </View>
// // //         )}
        
// // //         {isApprovedModification && !showRiderStatus && (
// // //           <View style={[styles.modificationStatusBadge, { backgroundColor: '#E8F5E9' }]}>
// // //             <Ionicons name="checkmark-circle" size={12} color="#10B981" />
// // //             <Text style={[styles.modificationStatusText, { color: '#2E7D32' }]}>
// // //               ✅ Seat Updated: {originalSeatCount} → {effectiveSeatCount} seats
// // //             </Text>
// // //           </View>
// // //         )}
        
// // //         {isRejectedModification && (
// // //           <View style={[styles.modificationStatusBadge, { backgroundColor: '#FEF2F2' }]}>
// // //             <Ionicons name="close-circle" size={12} color="#DC2626" />
// // //             <Text style={[styles.modificationStatusText, { color: '#DC2626' }]}>
// // //               ❌ Booking Cancelled (Modification Rejected)
// // //             </Text>
// // //           </View>
// // //         )}
        
// // //         {/* Display seat count with strikethrough for rejected modifications */}
// // //         <Text style={[
// // //           styles.bookingSeats,
// // //           isRejectedModification && styles.strikethroughText
// // //         ]}>
// // //           <Ionicons name="people-outline" size={12} color={Colors.gray} /> 
// // //           {isApprovedModification 
// // //             ? `${effectiveSeatCount} seats (was ${originalSeatCount})`
// // //             : `${effectiveSeatCount} seat${effectiveSeatCount > 1 ? 's' : ''}`
// // //           }
// // //           {isRejectedModification && " - CANCELLED"}
// // //         </Text>
        
// // //         {/* Show rejection reason if available */}
// // //         {isRejectedModification && booking.modification_request?.rejection_reason && (
// // //           <Text style={styles.rejectionReasonText}>
// // //             Reason: {booking.modification_request.rejection_reason}
// // //           </Text>
// // //         )}
        
// // //         {/* Show walking distance info - only if ride is active and booking not cancelled */}
// // //         {showLocationInfo && booking.pickup_walk_distance_m > 0 && (
// // //           <Text style={styles.walkingInfoText}>
// // //             <Ionicons name="walk" size={10} color="#10B981" /> Pickup: {booking.pickup_walk_distance_m}m walk
// // //           </Text>
// // //         )}
        
// // //         {showLocationInfo && booking.drop_walk_distance_m > 0 && (
// // //           <Text style={styles.walkingInfoText}>
// // //             <Ionicons name="walk" size={10} color="#F59E0B" /> Dropoff: {booking.drop_walk_distance_m}m walk
// // //           </Text>
// // //         )}
        
// // //         {/* Show cancellation note for modification rejected */}
// // //         {isRejectedModification && (
// // //           <Text style={styles.cancelledNoteText}>
// // //             ⚠️ This booking was cancelled because the modification request was rejected. {booking.modification_request?.requested_seats || 'Requested'} seats were not available.
// // //           </Text>
// // //         )}
// // //       </View>
      
// // //       <View style={styles.bookingActions}>
// // //         <View style={[
// // //           styles.bookingStatusBadge, 
// // //           { backgroundColor: isRejectedModification ? '#FEE2E2' : (getStatusColor(booking.status) + '20') }
// // //         ]}>
// // //           <Text style={[
// // //             styles.bookingStatusText, 
// // //             { color: isRejectedModification ? '#DC2626' : getStatusColor(booking.status) }
// // //           ]}>
// // //             {isRejectedModification ? 'Cancelled' : getStatusText(booking.status)}
// // //           </Text>
// // //         </View>
        
// // //         {/* Only show chat button if ride is active, not cancelled, and booking not cancelled */}
// // //         {!showRiderStatus && rideStatus.type !== 'auto-cancelled' && rideStatus.type !== 'cancelled' && (
// // //           <TouchableOpacity 
// // //             style={styles.chatButton} 
// // //             onPress={() => handleChatWithPassenger(booking.passenger_phone, booking.passenger_name, booking.profile_picture)}
// // //           >
// // //             <Ionicons name="chatbubble-ellipses" size={22} color={Colors.primary} />
// // //           </TouchableOpacity>
// // //         )}
// // //       </View>
// // //     </View>
// // //   );
// // // })}
                
// // //                 {/* Show cancellation note for cancelled rides */}
// // //                 {(rideStatus.type === 'auto-cancelled' || rideStatus.type === 'cancelled') && (
// // //                   <View style={styles.cancelledNoteContainer}>
// // //                     <Ionicons name="information-circle" size={14} color="#9CA3AF" />
// // //                     <Text style={styles.cancelledNoteText}>
// // //                       These bookings were cancelled due to ride cancellation.
// // //                     </Text>
// // //                   </View>
// // //                 )}
// // //               </View>
// // //             )}

// // //             {/* Pending Modification Requests Section */}
// // //             {pendingMods.length > 0 && !areModificationsLocked() && rideStatus.type !== 'auto-cancelled' && rideStatus.type !== 'cancelled' && (
// // //               <View style={styles.cardSection}>
// // //                 <Text style={[styles.sectionTitle, { color: '#F59E0B' }]}>Modification Requests ⏳ ({pendingMods.length})</Text>
// // //                 {pendingMods.map((modRequest) => {
// // //                   const booking = bookings.find(b => b.booking_id === modRequest.booking_id);
// // //                   if (!booking) return null;
                  
// // //                   return (
// // //                     <View key={modRequest.id} style={styles.modificationRequestItem}>
// // //                       <View style={styles.modificationRequestHeader}>
// // //                         <Ionicons name="swap" size={20} color="#F59E0B" />
// // //                         <Text style={styles.modificationRequestTitle}>Seat Change Request</Text>
// // //                       </View>
// // //                       <Text style={styles.modificationRequestRider}>Rider: {booking.passenger_name || 'Passenger'}</Text>
// // //                       <View style={styles.modificationSeatChange}>
// // //                         <Text style={styles.currentSeats}>{modRequest.current_seats} seats</Text>
// // //                         <Ionicons name="arrow-forward" size={16} color="#F59E0B" />
// // //                         <Text style={styles.requestedSeats}>{modRequest.requested_seats} seats</Text>
// // //                       </View>
// // //                       <View style={styles.modificationActions}>
// // //                         <TouchableOpacity 
// // //                           style={[styles.modActionBtn, styles.approveModBtn]} 
// // //                           onPress={() => handleModificationAction(modRequest.id, 'approve', modRequest.requested_seats, modRequest.current_seats, booking.booking_id, booking.passenger_name)}
// // //                         >
// // //                           <Ionicons name="checkmark" size={16} color="#fff" />
// // //                           <Text style={styles.modActionBtnText}>Approve</Text>
// // //                         </TouchableOpacity>
// // //                         <TouchableOpacity 
// // //                           style={[styles.modActionBtn, styles.rejectModBtn]} 
// // //                           onPress={() => handleModificationAction(modRequest.id, 'reject', modRequest.requested_seats, modRequest.current_seats, booking.booking_id, booking.passenger_name)}
// // //                         >
// // //                           <Ionicons name="close" size={16} color="#fff" />
// // //                           <Text style={styles.modActionBtnText}>Reject & Cancel Booking</Text>
// // //                         </TouchableOpacity>
// // //                       </View>
// // //                       <Text style={styles.modificationWarning}>
// // //                         ⚠️ Rejecting will cancel the original {modRequest.current_seats} seat booking
// // //                       </Text>
// // //                     </View>
// // //                   );
// // //                 })}
// // //               </View>
// // //             )}

// // //             {/* Pending Bookings */}
// // //             {pendingBookings.length > 0 && !areModificationsLocked() && rideStatus.type !== 'auto-cancelled' && rideStatus.type !== 'cancelled' && (
// // //               <View style={styles.cardSection}>
// // //                 <Text style={[styles.sectionTitle, { color: '#F59E0B' }]}>Pending Requests ⏳ ({pendingBookings.length})</Text>
// // //                 {pendingBookings.map((booking) => {
// // //                   const profilePicUrl = booking.profile_picture ? buildImageUrl(booking.profile_picture) : null;
// // //                   const isSvg = profilePicUrl ? isSvgUrl(profilePicUrl) : false;
// // //                   return (
// // //                     <View key={booking.booking_id} style={styles.bookingItem}>
// // //                       <TouchableOpacity style={styles.passengerAvatar} onPress={() => profilePicUrl && setSelectedProfile({ visible: true, imageUrl: profilePicUrl, name: booking.passenger_name })}>
// // //                         {profilePicUrl && !isSvg ? <Image source={{ uri: profilePicUrl }} style={styles.avatarImage} /> : profilePicUrl && isSvg ? <View style={styles.avatarImageSvg}><SvgCssUri uri={profilePicUrl} width={44} height={44} /></View> : <View style={styles.avatarPlaceholder}><Text style={styles.avatarPlaceholderText}>{getInitials(booking.passenger_name)}</Text></View>}
// // //                       </TouchableOpacity>
// // //                       <View style={styles.bookingInfo}>
// // //                         <Text style={styles.passengerName}>{booking.passenger_name || 'Passenger'}</Text>
// // //                         <Text style={styles.bookingSeats}><Ionicons name="people-outline" size={12} color={Colors.gray} /> {booking.seats_booked} seat{booking.seats_booked > 1 ? 's' : ''}</Text>
// // //                       </View>
// // //                       <View style={styles.pendingActions}>
// // //                         <TouchableOpacity style={[styles.actionSmallBtn, styles.acceptBtn]} onPress={() => handleBookingAction(booking.booking_id, 'accept')}>
// // //                           <Ionicons name="checkmark" size={16} color="#fff" />
// // //                         </TouchableOpacity>
// // //                         <TouchableOpacity style={[styles.actionSmallBtn, styles.rejectBtn]} onPress={() => handleBookingAction(booking.booking_id, 'reject')}>
// // //                           <Ionicons name="close" size={16} color="#fff" />
// // //                         </TouchableOpacity>
// // //                       </View>
// // //                     </View>
// // //                   );
// // //                 })}
// // //               </View>
// // //             )}

// // //             {/* Action Buttons */}
// // //             {!isOngoing && !isCompleted && showStartRide && rideStatus.type !== 'auto-cancelled' && rideStatus.type !== 'cancelled' && (
// // //               <>
// // //                 <View style={styles.actionButtonsRow}>
// // //                   <TouchableOpacity style={styles.editButton} onPress={handleEditRide}>
// // //                     <Ionicons name="create-outline" size={18} color={Colors.primary} />
// // //                     <Text style={styles.editButtonText}>Edit Ride</Text>
// // //                   </TouchableOpacity>
// // //                   <TouchableOpacity style={styles.cancelButton} onPress={handleCancelRide}>
// // //                     <Ionicons name="close-circle-outline" size={18} color="#DC2626" />
// // //                     <Text style={styles.cancelButtonText}>Cancel Ride</Text>
// // //                   </TouchableOpacity>
// // //                 </View>
// // //                 <TouchableOpacity style={styles.startRideButton} onPress={handleStartRide}>
// // //                   <Ionicons name="car-sport" size={20} color="#fff" />
// // //                   <Text style={styles.startRideButtonText}>Start Ride Now</Text>
// // //                 </TouchableOpacity>
// // //               </>
// // //             )}

// // //             {/* Ongoing Ride Button */}
// // //             {showLiveSession && (
// // //               <TouchableOpacity style={styles.liveSessionButton} onPress={() => navigation.navigate('OngoingRideDriverScreen', { rideId: ride?.id, sessionId: ride?.live_session?.session_id })}>
// // //                 <Ionicons name="navigate-circle" size={20} color="#fff" />
// // //                 <Text style={styles.liveSessionButtonText}>Continue Ongoing Ride</Text>
// // //               </TouchableOpacity>
// // //             )}

// // //             <View style={styles.safetyCard}>
// // //               <View style={styles.simpleInfoLeft}>
// // //                 <Ionicons name="shield-checkmark-outline" size={20} color="#2457A6" />
// // //                 <View>
// // //                   <Text style={styles.safetyTitle}>Safety First</Text>
// // //                   <Text style={styles.safetySub}>Live GPS tracking & 24/7 support</Text>
// // //                 </View>
// // //               </View>
// // //             </View>
// // //             <View style={{ height: 110 }} />
// // //           </ScrollView>
// // //         )}
// // //       </Animated.View>

// // //       {/* Conflict Resolution Modal */}
// // //       <Modal visible={conflictModalVisible} transparent animationType="fade">
// // //         <View style={styles.modalBackdrop}>
// // //           <View style={styles.conflictModalContent}>
// // //             <View style={styles.conflictModalHeader}>
// // //               <Ionicons name="alert-circle" size={48} color="#F59E0B" />
// // //               <Text style={styles.conflictModalTitle}>Driver's Choice Required</Text>
// // //             </View>
// // //             <Text style={styles.conflictModalMessage}>There are two requests for this ride. Please choose which one to accept.</Text>
// // //             {conflictData?.modification_request && (
// // //               <View style={styles.conflictRequestCard}>
// // //                 <View style={styles.conflictRequestHeader}>
// // //                   <Ionicons name="swap" size={24} color="#F59E0B" />
// // //                   <Text style={styles.conflictRequestTitle}>Modification Request</Text>
// // //                 </View>
// // //                 <Text style={styles.conflictRequestDetails}>
// // //                   <Text style={{ fontWeight: 'bold' }}>Rider:</Text> {conflictData.modification_request.passenger_name}
// // //                 </Text>
// // //                 <Text style={styles.conflictRequestDetails}>
// // //                   <Text style={{ fontWeight: 'bold' }}>Seats:</Text> {conflictData.modification_request.current_seats} → {conflictData.modification_request.requested_seats}
// // //                 </Text>
// // //               </View>
// // //             )}
// // //             {conflictData?.booking_request && (
// // //               <View style={styles.conflictRequestCard}>
// // //                 <View style={styles.conflictRequestHeader}>
// // //                   <Ionicons name="person-add" size={24} color="#10B981" />
// // //                   <Text style={styles.conflictRequestTitle}>New Booking Request</Text>
// // //                 </View>
// // //                 <Text style={styles.conflictRequestDetails}>
// // //                   <Text style={{ fontWeight: 'bold' }}>Rider:</Text> {conflictData.booking_request.passenger_name}
// // //                 </Text>
// // //                 <Text style={styles.conflictRequestDetails}>
// // //                   <Text style={{ fontWeight: 'bold' }}>Seats:</Text> {conflictData.booking_request.seats_requested} seat(s)
// // //                 </Text>
// // //               </View>
// // //             )}
// // //             <Text style={styles.conflictModalSeatsInfo}>
// // //               Available seats: {conflictData?.available_seats} / {conflictData?.total_seats}
// // //             </Text>
// // //             <View style={styles.conflictModalButtons}>
// // //               {conflictData?.modification_request && (
// // //                 <TouchableOpacity 
// // //                   style={[styles.conflictModalBtn, styles.approveModBtn]} 
// // //                   onPress={() => resolveConcurrentRequest('modification', conflictData.modification_request.id, null)} 
// // //                   disabled={resolvingConflict}
// // //                 >
// // //                   <Text style={styles.conflictModalBtnText}>
// // //                     {resolvingConflict ? 'Processing...' : 'Accept Modification'}
// // //                   </Text>
// // //                 </TouchableOpacity>
// // //               )}
// // //               {conflictData?.booking_request && (
// // //                 <TouchableOpacity 
// // //                   style={[styles.conflictModalBtn, styles.acceptBtn]} 
// // //                   onPress={() => resolveConcurrentRequest('booking', null, conflictData.booking_request.id)} 
// // //                   disabled={resolvingConflict}
// // //                 >
// // //                   <Text style={styles.conflictModalBtnText}>
// // //                     {resolvingConflict ? 'Processing...' : 'Accept Booking'}
// // //                   </Text>
// // //                 </TouchableOpacity>
// // //               )}
// // //             </View>
// // //             <TouchableOpacity style={styles.conflictModalCloseBtn} onPress={() => setConflictModalVisible(false)}>
// // //               <Text style={styles.conflictModalCloseBtnText}>Close</Text>
// // //             </TouchableOpacity>
// // //           </View>
// // //         </View>
// // //       </Modal>

// // //       {/* Rating Modal */}
// // //       <Modal visible={ratingModalVisible} transparent animationType="fade">
// // //         <View style={styles.modalBackdrop}>
// // //           <View style={styles.modalCard}>
// // //             <Text style={styles.modalTitle}>Rate Your Rider</Text>
// // //             <Text style={styles.modalSub}>How was your ride with {selectedRider?.passenger_name || 'this rider'}?</Text>
// // //             {renderStars()}
// // //             <TextInput 
// // //               value={feedback} 
// // //               onChangeText={setFeedback} 
// // //               placeholder="Share your feedback (optional)" 
// // //               multiline 
// // //               numberOfLines={3} 
// // //               style={styles.feedbackInput} 
// // //               textAlignVertical="top" 
// // //             />
// // //             <View style={styles.modalActions}>
// // //               <TouchableOpacity style={styles.skipBtn} onPress={() => setRatingModalVisible(false)}>
// // //                 <Text style={styles.skipBtnText}>Cancel</Text>
// // //               </TouchableOpacity>
// // //               <TouchableOpacity 
// // //                 style={[styles.submitBtn, rating === 0 && { opacity: 0.5 }]} 
// // //                 onPress={submitRiderRating} 
// // //                 disabled={rating === 0}
// // //               >
// // //                 <Text style={styles.submitBtnText}>Submit Rating</Text>
// // //               </TouchableOpacity>
// // //             </View>
// // //           </View>
// // //         </View>
// // //       </Modal>

// // //       <ProfileImageModal 
// // //         visible={selectedProfile.visible} 
// // //         imageUrl={selectedProfile.imageUrl} 
// // //         name={selectedProfile.name} 
// // //         onClose={() => setSelectedProfile({ visible: false, imageUrl: null, name: '' })} 
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
// // //     </View>
// // //   );
// // // }
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
// //   LogBox,
// //   TextInput,
// //   Alert,
// //   Linking
// // } from 'react-native';
// // import MapView, { Marker, Polyline, PROVIDER_GOOGLE, Circle } from 'react-native-maps';
// // import { Ionicons } from '@expo/vector-icons';
// // import { SvgCssUri } from 'react-native-svg/css';
// // import { Colors } from '../constants/Colors';
// // import { useAuth } from '../context/AuthContext';
// // import { API_BASE_URL, GMAP_API_KEY } from '../config/config_ip';
// // import CustomAlert from '../components/CustomAlert';
// // import { useFocusEffect } from '@react-navigation/native';
// // import io from 'socket.io-client';

// // LogBox.ignoreLogs([
// //   'Accessibility: View',
// //   'Property accessibilityState',
// //   'RCTView',
// // ]);

// // const { height, width } = Dimensions.get('window');
// // const SAFE_TOP = Platform.OS === 'ios' ? 56 : 24;
// // const COLLAPSED_HEIGHT = 84;
// // const EXPANDED_HEIGHT = height * 0.72;

// // function buildImageUrl(url) {
// //   if (!url) return null;
// //   if (url.startsWith('http://') || url.startsWith('https://')) return url;
// //   return `${API_BASE_URL}${url.startsWith('/') ? '' : '/'}${url}`;
// // }

// // function getInitials(name) {
// //   if (!name) return 'D';
// //   const parts = name.trim().split(' ').filter(Boolean);
// //   if (parts.length > 1) return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
// //   return parts[0].slice(0, 2).toUpperCase();
// // }

// // function isSvgUrl(url) {
// //   if (!url) return false;
// //   return url.toLowerCase().includes('.svg') || url.toLowerCase().includes('.svg?');
// // }

// // function parseRouteCoordinates(routeCoordinates) {
// //   if (!routeCoordinates) return [];
// //   if (!Array.isArray(routeCoordinates)) return [];
// //   if (routeCoordinates.length === 0) return [];
  
// //   return routeCoordinates.map((item) => {
// //     if (Array.isArray(item) && item.length === 2) {
// //       const lng = Number(item[0]);
// //       const lat = Number(item[1]);
// //       if (!isNaN(lng) && !isNaN(lat)) {
// //         return { longitude: lng, latitude: lat };
// //       }
// //     }
// //     if (item && typeof item === 'object') {
// //       const lng = Number(item.longitude || item.lng);
// //       const lat = Number(item.latitude || item.lat);
// //       if (!isNaN(lng) && !isNaN(lat)) {
// //         return { longitude: lng, latitude: lat };
// //       }
// //     }
// //     return null;
// //   }).filter(Boolean);
// // }

// // function ProfileImageModal({ visible, imageUrl, name, onClose }) {
// //   const [imageError, setImageError] = useState(false);
// //   const isSvg = imageUrl ? isSvgUrl(imageUrl) : false;
  
// //   useEffect(() => {
// //     if (visible) {
// //       setImageError(false);
// //     }
// //   }, [visible, imageUrl]);
  
// //   if (!visible) return null;
  
// //   return (
// //     <Modal visible={visible} transparent={true} animationType="fade" onRequestClose={onClose}>
// //       <TouchableOpacity style={styles.modalBackdrop} activeOpacity={1} onPress={onClose}>
// //         <View style={styles.imageModalContainer}>
// //           <View style={styles.imageModalContent}>
// //             <View style={styles.imageModalHeader}>
// //               <Text style={styles.imageModalTitle}>{name || 'Profile'}</Text>
// //               <TouchableOpacity onPress={onClose}>
// //                 <Ionicons name="close" size={24} color={Colors.dark} />
// //               </TouchableOpacity>
// //             </View>
// //             {imageUrl && !imageError ? (
// //               isSvg ? (
// //                 <View style={styles.modalSvgContainer}>
// //                   <SvgCssUri uri={imageUrl} width="100%" height={400} />
// //                 </View>
// //               ) : (
// //                 <Image 
// //                   source={{ uri: imageUrl }} 
// //                   style={styles.fullProfileImage} 
// //                   resizeMode="contain"
// //                   onError={() => setImageError(true)}
// //                 />
// //               )
// //             ) : (
// //               <View style={styles.noImageContainer}>
// //                 <Ionicons name="person-circle-outline" size={80} color={Colors.gray} />
// //                 <Text style={styles.noImageText}>No profile picture available</Text>
// //               </View>
// //             )}
// //           </View>
// //         </View>
// //       </TouchableOpacity>
// //     </Modal>
// //   );
// // }

// // export default function ViewRoutePostedScreen({ navigation, route }) {
// //   const { user } = useAuth();
// //   const { ride } = route.params || {};
// //   const prevBookedSeatsRef = useRef(0);

// //   const [drawerExpanded, setDrawerExpanded] = useState(true);
// //   const [mapReady, setMapReady] = useState(false);
// //   const [bookings, setBookings] = useState([]);
// //   const [loadingBookings, setLoadingBookings] = useState(false);
// //   const [pendingModifications, setPendingModifications] = useState([]);
// //   const [refreshKey, setRefreshKey] = useState(0);
// //   const [pollingInterval, setPollingInterval] = useState(null);
// //   const [modifyingRequest, setModifyingRequest] = useState(false);
// //   const [ratingModalVisible, setRatingModalVisible] = useState(false);
// //   const [selectedRider, setSelectedRider] = useState(null);
// //   const [rating, setRating] = useState(0);
// //   const [feedback, setFeedback] = useState('');
// //   const [currentSessionId, setCurrentSessionId] = useState(null);
// //   const [conflictModalVisible, setConflictModalVisible] = useState(false);
// //   const [conflictData, setConflictData] = useState(null);
// //   const [resolvingConflict, setResolvingConflict] = useState(false);
// //   const [totalEarnings, setTotalEarnings] = useState(0);
// //   const [showCompletionBanner, setShowCompletionBanner] = useState(false);
// //   const [timelineExpanded, setTimelineExpanded] = useState(false);
// //   const [selectedStopIndex, setSelectedStopIndex] = useState(null);
  
// //   // Address geocoding states
// //   const [addressCache, setAddressCache] = useState({});
// //   const [loadingAddresses, setLoadingAddresses] = useState(false);
// //   const [addressFetchProgress, setAddressFetchProgress] = useState({ current: 0, total: 0 });
  
// //   const animatedDrawer = useRef(new Animated.Value(1)).current;
// //   const mapRef = useRef(null);
// //   const socketRef = useRef(null);
// //   const scrollViewRef = useRef(null);
  
// //   const [selectedProfile, setSelectedProfile] = useState({
// //     visible: false,
// //     imageUrl: null,
// //     name: '',
// //   });
  
// //   const formatDate = (dateString) => {
// //     if (!dateString) return 'Date not set';
// //     const date = new Date(dateString);
// //     const today = new Date();
// //     const tomorrow = new Date(today);
// //     tomorrow.setDate(tomorrow.getDate() + 1);
// //     const isToday = date.toDateString() === today.toDateString();
// //     const isTomorrow = date.toDateString() === tomorrow.toDateString();
// //     let dayText = "";
// //     if (isToday) dayText = "Today";
// //     else if (isTomorrow) dayText = "Tomorrow";
// //     else dayText = date.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" });
// //     const timeText = date.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", hour12: false });
// //     return `${dayText}, ${timeText}`;
// //   };
  
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

// //   const showConfirmationAlert = (title, message, onConfirm) => {
// //     setAlertConfig({
// //       title,
// //       message,
// //       icon: "warning",
// //       iconColor: "#F59E0B",
// //       buttons: [
// //         { text: 'Cancel', onPress: () => setAlertVisible(false), style: 'cancel' },
// //         { text: 'Confirm', onPress: () => { setAlertVisible(false); onConfirm(); }, style: 'destructive' }
// //       ]
// //     });
// //     setAlertVisible(true);
// //   };
// // const getActualBookedSeats = useCallback(() => {
// //   if (!bookings || !Array.isArray(bookings)) return 0;
  
// //   // Create a Set of booking IDs that have REJECTED modifications
// //   const rejectedBookingIds = new Set();
// //   const approvedBookingIds = new Set();
  
// //   pendingModifications.forEach(mod => {
// //     if (mod.status === 'rejected') {
// //       rejectedBookingIds.add(mod.booking_id);
// //       console.log(`❌ Rejected modification for booking ${mod.booking_id}`);
// //     }
// //     if (mod.status === 'approved') {
// //       approvedBookingIds.add(mod.booking_id);
// //       console.log(`✅ Approved modification for booking ${mod.booking_id}`);
// //     }
// //   });
  
// //   let totalBooked = 0;
  
// //   bookings.forEach(bookingItem => {
// //     // CRITICAL: Skip if booking is cancelled (comes from API)
// //     if (bookingItem.status === 'cancelled') {
// //       console.log(`  ❌ Excluding booking ${bookingItem.booking_id} - status is CANCELLED`);
// //       return;
// //     }
    
// //     // CRITICAL: Skip if booking is rejected
// //     if (bookingItem.status === 'rejected') {
// //       console.log(`  ❌ Excluding booking ${bookingItem.booking_id} - status is REJECTED`);
// //       return;
// //     }
    
// //     // CRITICAL: Skip if this booking has a rejected modification in pendingModifications
// //     if (rejectedBookingIds.has(bookingItem.booking_id)) {
// //       console.log(`  ❌ Excluding booking ${bookingItem.booking_id} - rejected in pendingMods`);
// //       return;
// //     }
    
// //     // CRITICAL: Also check if modification_request in booking says rejected
// //     if (bookingItem.modification_request?.status === 'rejected') {
// //       console.log(`  ❌ Excluding booking ${bookingItem.booking_id} - rejected modification in booking object`);
// //       return;
// //     }
    
// //     // Only count accepted bookings
// //     if (bookingItem.status === 'accepted') {
// //       let seatCount = bookingItem.seats_booked || bookingItem.seats_requested || 0;
      
// //       // If modification was approved, use the new seat count
// //       if (approvedBookingIds.has(bookingItem.booking_id) || 
// //           bookingItem.modification_request?.status === 'approved') {
// //         const modRequest = pendingModifications.find(m => m.booking_id === bookingItem.booking_id);
// //         const newSeats = modRequest?.requested_seats || bookingItem.modification_request?.requested_seats;
// //         if (newSeats) {
// //           seatCount = newSeats;
// //           console.log(`  ✅ Booking ${bookingItem.booking_id}: approved mod, seats=${seatCount} (was ${bookingItem.seats_booked})`);
// //         } else {
// //           console.log(`  ✅ Booking ${bookingItem.booking_id}: accepted, seats=${seatCount}`);
// //         }
// //       } else {
// //         console.log(`  ✅ Booking ${bookingItem.booking_id}: accepted, seats=${seatCount}`);
// //       }
// //       totalBooked += seatCount;
// //     }
// //   });
  
// //   console.log(`📊 Total booked seats: ${totalBooked}`);
// //   return totalBooked;
// // }, [bookings, pendingModifications]);
// //   const getActualAvailableSeats = useCallback(() => {
// //     const totalSeats = ride?.available_seats || 0;
// //     const bookedSeats = getActualBookedSeats();
// //     return Math.max(0, totalSeats - bookedSeats);
// //   }, [ride?.available_seats, getActualBookedSeats]);

// //   const fetchBookings = useCallback(async () => {
// //     if (!ride?.id) return;
// //     setLoadingBookings(true);
// //     try {
// //       const response = await fetch(`${API_BASE_URL}/ride/${ride.id}/passengers?_t=${Date.now()}`);
// //       const data = await response.json();
// //       console.log('🔍 RAW API Response:', JSON.stringify(data, null, 2));

// //       if (data.passengers && Array.isArray(data.passengers)) {
// //         const processedPassengers = data.passengers.map(passenger => ({
// //           ...passenger,
// //           driver_rating_given: passenger.driver_rating_given === true || passenger.driver_rating_given === 1,
// //           driver_rating: passenger.driver_rating || 0,
// //           driver_feedback: passenger.driver_feedback || '',
// //           modification_request: passenger.modification_request || null,
// //         }));
        
// //         // Debug: Log any rejected modifications
// //         const rejectedMods = processedPassengers.filter(p => p.modification_request?.status === 'rejected');
// //         if (rejectedMods.length > 0) {
// //           console.log('🔴 Found rejected modifications:', rejectedMods.map(r => ({
// //             id: r.booking_id,
// //             name: r.passenger_name,
// //             status: r.modification_request?.status,
// //             seats: r.seats_booked
// //           })));
// //         }
        
// //         setBookings(processedPassengers);
        
// //         // Calculate earnings only from actually accepted bookings
// //         const activeAcceptedBookings = processedPassengers.filter(p => 
// //           p.status === 'accepted' && 
// //           p.modification_request?.status !== 'rejected'
// //         );
        
// //         if (ride?.status === "completed" || ride?.completed_at) {
// //           const earnings = activeAcceptedBookings
// //             .reduce((sum, p) => {
// //               let seatCount = p.seats_booked || p.seats_requested || 0;
// //               if (p.modification_request?.status === 'approved') {
// //                 seatCount = p.modification_request.requested_seats || seatCount;
// //               }
// //               return sum + (p.total_amount || seatCount * (ride?.price_per_seat || 0));
// //             }, 0);
// //           setTotalEarnings(earnings);
// //         }
// //       } else {
// //         setBookings([]);
// //       }
// //     } catch (error) {
// //       console.log('Error fetching bookings:', error);
// //       setBookings([]);
// //     } finally {
// //       setLoadingBookings(false);
// //     }
// //   }, [ride?.id, ride?.status, ride?.price_per_seat]);

// //   // Google Maps Geocoding Function
// //   const getAddressFromCoordsGoogle = async (lat, lng) => {
// //     const cacheKey = `${lat},${lng}`;
    
// //     if (addressCache[cacheKey]) {
// //       return addressCache[cacheKey];
// //     }
    
// //     try {
// //       const url = `https://maps.googleapis.com/maps/api/geocode/json?latlng=${lat},${lng}&key=${GMAP_API_KEY}&language=en`;
// //       const response = await fetch(url);
// //       const data = await response.json();
      
// //       if (data.status === 'OK' && data.results && data.results[0]) {
// //         const formattedAddress = data.results[0].formatted_address;
// //         setAddressCache(prev => ({ ...prev, [cacheKey]: formattedAddress }));
// //         return formattedAddress;
// //       } else {
// //         return `${lat.toFixed(4)}, ${lng.toFixed(4)}`;
// //       }
// //     } catch (error) {
// //       console.log('Geocoding error:', error);
// //       return `${lat.toFixed(4)}, ${lng.toFixed(4)}`;
// //     }
// //   };

// //   // Fetch addresses for all bookings
// //   const fetchAllAddresses = useCallback(async () => {
// //     const confirmedBookings = bookings.filter(b => b.status === 'accepted');
// //     if (confirmedBookings.length === 0) return;
    
// //     const coordinatesToFetch = [];
    
// //     confirmedBookings.forEach(booking => {
// //       const pickupLat = booking.intersection_pickup_lat || booking.pickup_lat;
// //       const pickupLon = booking.intersection_pickup_lon || booking.pickup_lon;
// //       if (pickupLat && pickupLon) {
// //         const key = `${pickupLat},${pickupLon}`;
// //         if (!addressCache[key] && !coordinatesToFetch.find(c => c.key === key)) {
// //           coordinatesToFetch.push({ key, lat: pickupLat, lng: pickupLon, type: 'pickup', bookingId: booking.booking_id, riderName: booking.passenger_name });
// //         }
// //       }
      
// //       const dropLat = booking.intersection_drop_lat || booking.drop_lat;
// //       const dropLon = booking.intersection_drop_lon || booking.drop_lon;
// //       if (dropLat && dropLon) {
// //         const key = `${dropLat},${dropLon}`;
// //         if (!addressCache[key] && !coordinatesToFetch.find(c => c.key === key)) {
// //           coordinatesToFetch.push({ key, lat: dropLat, lng: dropLon, type: 'dropoff', bookingId: booking.booking_id, riderName: booking.passenger_name });
// //         }
// //       }
// //     });
    
// //     if (coordinatesToFetch.length === 0) return;
    
// //     setLoadingAddresses(true);
// //     setAddressFetchProgress({ current: 0, total: coordinatesToFetch.length });
    
// //     const batchSize = 5;
// //     for (let i = 0; i < coordinatesToFetch.length; i += batchSize) {
// //       const batch = coordinatesToFetch.slice(i, i + batchSize);
// //       await Promise.all(batch.map(async (coord) => {
// //         const address = await getAddressFromCoordsGoogle(coord.lat, coord.lng);
// //         setAddressFetchProgress(prev => ({ ...prev, current: prev.current + 1 }));
// //         return address;
// //       }));
      
// //       if (i + batchSize < coordinatesToFetch.length) {
// //         await new Promise(resolve => setTimeout(resolve, 200));
// //       }
// //     }
    
// //     setLoadingAddresses(false);
// //   }, [bookings, addressCache]);

// // // Add this function after your fetchBookings function
// // const checkModificationStatusDirectly = useCallback(async (bookingId) => {
// //   try {
// //     console.log(`🔍 Directly checking modification for booking ${bookingId}...`);
// //     const response = await fetch(`${API_BASE_URL}/booking/${bookingId}/modification-request?_t=${Date.now()}`);
// //     const data = await response.json();
// //     console.log(`📝 Direct API response for booking ${bookingId}:`, data);
// //     return data;
// //   } catch (error) {
// //     console.log(`Error checking modification for booking ${bookingId}:`, error);
// //     return null;
// //   }
// // }, []);
// // const fetchModificationStatusForAllBookings = useCallback(async () => {
// //   if (!bookings.length) {
// //     console.log('No bookings to check modification status for');
// //     return;
// //   }
  
// //   console.log('🔍 Fetching modification status for all bookings...');
// //   console.log('Bookings to check:', bookings.map(b => ({ id: b.booking_id, status: b.status })));
  
// //   const updatedBookings = [...bookings];
// //   let hasChanges = false;
  
// //   for (let i = 0; i < updatedBookings.length; i++) {
// //     const booking = updatedBookings[i];
// //     try {
// //       const response = await fetch(`${API_BASE_URL}/booking/${booking.booking_id}/modification-request?_t=${Date.now()}`);
// //       const data = await response.json();
      
// //       console.log(`📝 Booking ${booking.booking_id} API response:`, JSON.stringify(data, null, 2));
      
// //       if (data.request && data.request.id) {
// //         console.log(`📝 Booking ${booking.booking_id}: modification status = ${data.request.status}`);
        
// //         if (data.request.status === 'rejected') {
// //           console.log(`❌❌❌ Booking ${booking.booking_id} has REJECTED modification - CANCELLING!`);
// //           updatedBookings[i] = {
// //             ...booking,
// //             modification_request: data.request,
// //             status: 'cancelled',
// //             seats_booked: 0
// //           };
// //           hasChanges = true;
// //         } else if (data.request.status === 'approved') {
// //           console.log(`✅ Booking ${booking.booking_id} has APPROVED modification`);
// //           updatedBookings[i] = {
// //             ...booking,
// //             modification_request: data.request,
// //             seats_booked: data.request.requested_seats
// //           };
// //           hasChanges = true;
// //         } else if (data.request.status === 'pending') {
// //           console.log(`⏳ Booking ${booking.booking_id} has PENDING modification`);
// //           updatedBookings[i] = {
// //             ...booking,
// //             modification_request: data.request
// //           };
// //           hasChanges = true;
// //         }
// //       } else {
// //         console.log(`📝 Booking ${booking.booking_id}: No modification request found`);
// //       }
// //     } catch (error) {
// //       console.log(`Error fetching modification for booking ${booking.booking_id}:`, error);
// //     }
// //   }
  
// //   if (hasChanges) {
// //     console.log('✅ Updating bookings with modification status');
// //     setBookings(updatedBookings);
// //   } else {
// //     console.log('No changes to bookings from modification status check');
// //   }
// // }, [bookings]);
// //   useEffect(() => {
// //     if (bookings.length > 0) {
// //       fetchModificationStatusForAllBookings();
// //       fetchAllAddresses();
// //     }
// //   }, [bookings.length]);

// //   const fetchPendingModifications = useCallback(async () => {
// //     if (!ride?.id) return;
// //     try {
// //       const response = await fetch(`${API_BASE_URL}/ride/${ride.id}/pending-modifications?_t=${Date.now()}`);
// //       const data = await response.json();
      
// //       if (data.pending_requests && Array.isArray(data.pending_requests)) {
// //         const latestPerBooking = new Map();
        
// //         data.pending_requests.forEach(request => {
// //           const bookingId = request.booking_id;
// //           const existing = latestPerBooking.get(bookingId);
          
// //           if (!existing || new Date(request.created_at) > new Date(existing.created_at)) {
// //             latestPerBooking.set(bookingId, request);
// //           }
// //         });
        
// //         const uniqueRequests = Array.from(latestPerBooking.values());
// //         setPendingModifications(uniqueRequests);
        
// //         if (uniqueRequests.length > 0 && !drawerExpanded) {
// //           setDrawerExpanded(true);
// //         }
// //       } else {
// //         setPendingModifications([]);
// //       }
// //     } catch (error) {
// //       console.log('Error fetching pending modifications:', error);
// //       setPendingModifications([]);
// //     }
// //   }, [ride?.id, drawerExpanded]);

// //   const checkForConcurrentRequests = useCallback(async () => {
// //     if (!ride?.id) return;
// //     try {
// //       const response = await fetch(`${API_BASE_URL}/ride/${ride.id}/concurrent-requests?_t=${Date.now()}`);
// //       const data = await response.json();
      
// //       if (data.has_concurrent_requests) {
// //         setConflictData(data);
// //         setConflictModalVisible(true);
// //       }
// //     } catch (error) {
// //       console.log('Error checking concurrent requests:', error);
// //     }
// //   }, [ride?.id]);

// //   const resolveConcurrentRequest = async (choice, modificationRequestId, bookingId) => {
// //     if (!conflictData) return;
    
// //     setResolvingConflict(true);
// //     try {
// //       const response = await fetch(`${API_BASE_URL}/ride/${conflictData.ride.id}/resolve-concurrent-requests`, {
// //         method: 'POST',
// //         headers: { 'Content-Type': 'application/json' },
// //         body: JSON.stringify({
// //           choice: choice,
// //           modification_request_id: modificationRequestId,
// //           booking_id: bookingId,
// //           driver_phone: user?.phone_number
// //         })
// //       });
      
// //       const data = await response.json();
      
// //       if (data.success) {
// //         showCustomAlert('Success', data.message, 'success');
// //         setConflictModalVisible(false);
// //         fetchBookings();
// //         fetchPendingModifications();
// //       } else {
// //         showCustomAlert('Error', data.message || 'Failed to process request', 'error');
// //         fetchBookings();
// //         fetchPendingModifications();
// //       }
// //     } catch (error) {
// //       console.error('Resolve concurrent request error:', error);
// //       showCustomAlert('Error', 'Failed to resolve concurrent requests', 'error');
// //       fetchBookings();
// //       fetchPendingModifications();
// //     } finally {
// //       setResolvingConflict(false);
// //     }
// //   };

// //   const areModificationsLocked = () => {
// //     const now = new Date();
// //     const departureTime = new Date(ride?.departure_time);
// //     const minutesToDeparture = (departureTime - now) / (1000 * 60);
// //     return minutesToDeparture <= 15 && minutesToDeparture > -30 && !ride?.started_at;
// //   };

// //   // Enhanced ride status display with proper cancellation reasons
// //   const getRideStatusDisplay = () => {
// //     const now = new Date();
// //     const departureTime = new Date(ride?.departure_time);
// //     const minutesToDeparture = (departureTime - now) / (1000 * 60);
// //     const minutesSinceDeparture = (now - departureTime) / (1000 * 60);
// //     const hoursSinceDeparture = (now - departureTime) / (1000 * 60 * 60);
    
// //     // Check for cancellation first
// //     if (ride?.cancellation_reason) {
// //       if (ride.cancellation_reason.includes("Auto-cancelled") || ride.cancellation_reason.includes("auto-cancel")) {
// //         return { 
// //           text: "Auto-cancelled", 
// //           color: "#9CA3AF", 
// //           icon: "timer-off", 
// //           type: "auto-cancelled",
// //           reason: ride.cancellation_reason || "Ride was automatically cancelled as it was not started within 2 hours of departure time."
// //         };
// //       }
// //       return { 
// //         text: "Cancelled", 
// //         color: "#DC2626", 
// //         icon: "close-circle", 
// //         type: "cancelled",
// //         reason: ride.cancellation_reason
// //       };
// //     }
    
// //     // Check for auto-cancel after 2 hours past departure
// //     if (hoursSinceDeparture > 2 && !ride?.started_at && ride?.status !== "completed") {
// //       return { 
// //         text: "Auto-cancelled", 
// //         color: "#9CA3AF", 
// //         icon: "timer-off", 
// //         type: "auto-cancelled",
// //         reason: "Ride auto-cancelled as it was not started within 2 hours of departure time."
// //       };
// //     }
    
// //     if (ride?.status === "completed" || ride?.completed_at) {
// //       return { text: "Completed", color: "#6B7280", icon: "checkmark-done", type: "completed" };
// //     }
    
// //     if (ride?.started_at && ride?.status !== "completed") {
// //       return { text: "Ongoing", color: "#10B981", icon: "car-sport", type: "ongoing" };
// //     }
    
// //     if (minutesSinceDeparture > 0 && minutesSinceDeparture <= 120) {
// //       return { text: "Late - Start Now", color: "#EF4444", icon: "alert-circle", type: "late" };
// //     }
    
// //     if (minutesToDeparture <= 60 && minutesToDeparture > 15) {
// //       return { text: "Start Soon", color: "#F59E0B", icon: "time-outline", type: "start-soon" };
// //     }
    
// //     if (minutesToDeparture <= 15 && minutesToDeparture > 0) {
// //       return { text: "Active", color: "#10B981", icon: "checkmark-circle", type: "active" };
// //     }
    
// //     if (minutesToDeparture > 60) {
// //       return { text: "Upcoming", color: "#2457A6", icon: "calendar-outline", type: "upcoming" };
// //     }
    
// //     return { text: "Upcoming", color: "#2457A6", icon: "calendar-outline", type: "upcoming" };
// //   };

// //   // Socket connection setup
// //   useEffect(() => {
// //     if (!ride?.id) return;
    
// //     const socket = io(API_BASE_URL, {
// //       transports: ['websocket', 'polling'],
// //       reconnection: true,
// //       reconnectionAttempts: 10,
// //       reconnectionDelay: 1000,
// //       timeout: 10000,
// //       path: '/socket.io'
// //     });
    
// //     socketRef.current = socket;
    
// //     socket.on('connect', () => {
// //       console.log('Socket connected for driver ride updates');
// //       socket.emit('join-ride-room', ride.id);
      
// //       if (user?.phone_number) {
// //         socket.emit('join-user-room', user.phone_number);
// //       }
// //     });
    
// //     socket.on('connect_error', (error) => {
// //       console.log('Socket connection error:', error.message);
// //     });
// //     socket.on('seats-released', (data) => {
// //   console.log('Seats released event received:', data);
// //   if (data.ride_id === ride.id) {
// //     showCustomAlert('Seats Available', data.message || `${data.seats_released} seat(s) are now available for this ride.`, 'info');
// //     // Force refresh to update seat count
// //     fetchBookings();
// //     fetchPendingModifications();
// //     setRefreshKey(prev => prev + 1);
// //   }
// // });
// //     socket.on('disconnect', (reason) => {
// //       console.log('Socket disconnected:', reason);
// //       if (reason === 'io server disconnect') {
// //         setTimeout(() => {
// //           if (socketRef.current) {
// //             socketRef.current.connect();
// //           }
// //         }, 1000);
// //       }
// //     });
    
// //     socket.on('reconnect', () => {
// //       console.log('Socket reconnected');
// //       if (ride?.id) {
// //         socket.emit('join-ride-room', ride.id);
// //       }
// //     });
    
// //     socket.on('new-modification-request', (data) => {
// //       console.log('New modification request received:', data);
// //       if (data.ride_id === ride.id) {
// //         showCustomAlert('New Modification Request', `${data.passenger_name} wants to change from ${data.current_seats} to ${data.requested_seats} seat(s)`, 'info');
// //         fetchPendingModifications();
// //         fetchBookings();
// //         checkForConcurrentRequests();
// //       }
// //     });
    
// //     socket.on('modification-rejected', (data) => {
// //       console.log('Modification rejected event received:', data);
// //       if (data.ride_id === ride.id) {
// //         setPendingModifications(prev => 
// //           prev.map(mod => 
// //             mod.id === data.request_id 
// //               ? { ...mod, status: 'rejected' }
// //               : mod
// //           )
// //         );
        
// //         showCustomAlert('Modification Rejected', 
// //           `The modification request for ${data.passenger_name || 'a passenger'} was rejected. The original booking has been cancelled and seats are now available.`, 
// //           'warning');
        
// //         fetchBookings();
// //         fetchPendingModifications();
// //         checkForConcurrentRequests();
// //       }
// //     });

// //     socket.on('modification-response', (data) => {
// //       console.log('Modification response received:', data);
// //       if (data.ride_id === ride.id) {
// //         setPendingModifications(prev => 
// //           prev.map(mod => 
// //             mod.id === data.request_id 
// //               ? { ...mod, status: data.action === 'approved' ? 'approved' : 'rejected' }
// //               : mod
// //           )
// //         );
        
// //         if (data.action === 'approved') {
// //           showCustomAlert('Modification Approved', `You approved seat change for ${data.passenger_name || 'passenger'}`, 'success');
// //         } else {
// //           showCustomAlert('Modification Rejected', 
// //             `You rejected the seat change request. The original booking has been CANCELLED and seats released.`, 
// //             'warning');
// //         }
        
// //         fetchPendingModifications();
// //         fetchBookings();
// //         checkForConcurrentRequests();
// //       }
// //     });
    
// //     socket.on('booking-update', (data) => {
// //       console.log('Booking update received:', data);
// //       if (data.ride_id === ride.id) {
// //         fetchBookings();
// //         checkForConcurrentRequests();
// //       }
// //     });
    
// //     socket.on('rider-reached-pickup', (data) => {
// //       console.log('Rider reached pickup:', data);
// //       showCustomAlert('Rider Arrived', `${data.rider_name || 'A rider'} has reached the pickup location`, 'info');
// //     });
    
// //     socket.on('rider-boarded', (data) => {
// //       console.log('Rider boarded:', data);
// //       showCustomAlert('Rider Boarded', `${data.rider_name || 'A rider'} has boarded the vehicle`, 'success');
// //       fetchBookings();
// //     });
    
// //     socket.on('rider-dropped-off', (data) => {
// //       console.log('Rider dropped off:', data);
// //       showCustomAlert('Rider Dropped Off', `${data.rider_name || 'A rider'} has been dropped off`, 'info');
// //       fetchBookings();
// //     });
    
// //     socket.on('concurrent-requests-detected', (data) => {
// //       console.log('Concurrent requests detected:', data);
// //       if (data.ride_id === ride.id) {
// //         checkForConcurrentRequests();
// //       }
// //     });
    
// //     socket.on('ride-completed', (data) => {
// //       console.log('Ride completed event:', data);
// //       if (data.ride_id === ride.id) {
// //         setShowCompletionBanner(true);
// //         showCustomAlert('Ride Completed', 'This ride has been successfully completed!', 'success');
// //         fetchBookings();
// //         setTimeout(() => {
// //           setShowCompletionBanner(false);
// //         }, 5000);
// //       }
// //     });
    
// //     socket.on('ride-auto-cancelled', (data) => {
// //       console.log('Ride auto-cancelled event:', data);
// //       if (data.ride_id === ride.id) {
// //         const reason = data.reason || "Ride was auto-cancelled as it was not started within 2 hours of departure time.";
// //         showCustomAlert('Ride Auto-Cancelled', reason, 'warning');
// //         fetchBookings();
// //         setRefreshKey(prev => prev + 1);
// //       }
// //     });
    
// //     const interval = setInterval(() => {
// //       fetchPendingModifications();
// //     }, 10000);
    
// //     setPollingInterval(interval);
    
// //     return () => {
// //       if (interval) clearInterval(interval);
// //       if (socketRef.current) {
// //         socketRef.current.emit('leave-ride-room', ride.id);
// //         socketRef.current.disconnect();
// //         socketRef.current = null;
// //       }
// //     };
// //   }, [ride?.id, user?.phone_number, checkForConcurrentRequests, fetchPendingModifications]);

// //   useFocusEffect(
// //     useCallback(() => {
// //       fetchBookings();
// //       fetchPendingModifications();
// //       checkForConcurrentRequests();
// //       setRefreshKey(prev => prev + 1);
// //       return () => {};
// //     }, [fetchBookings, fetchPendingModifications, checkForConcurrentRequests])
// //   );

// //   const handleBookingAction = async (bookingId, action) => {
// //     showConfirmationAlert(`${action === "accept" ? "Accept" : "Reject"} Request`, `Are you sure you want to ${action} this booking request?`, async () => {
// //       try {
// //         const response = await fetch(`${API_BASE_URL}/booking/${bookingId}/${action}`, {
// //           method: 'PUT',
// //           headers: { 'Content-Type': 'application/json' },
// //         });
// //         const data = await response.json();
        
// //         if (!response.ok) throw new Error(data.detail || `Failed to ${action} booking`);
        
// //         showCustomAlert('Success', `Booking ${action}ed successfully`, 'success');
// //         fetchBookings();
        
// //         if (socketRef.current) {
// //           socketRef.current.emit('booking-status-changed', {
// //             ride_id: ride.id,
// //             booking_id: bookingId,
// //             status: action
// //           });
// //         }
// //       } catch (error) {
// //         showCustomAlert('Error', error.message, 'error');
// //       }
// //     });
// //   };
// // const handleModificationAction = async (requestId, action, requestedSeats, currentSeats, bookingId, passengerName) => {
// //   const actionText = action === 'approve' ? 'approve' : 'reject';
// //   const message = action === 'approve' 
// //     ? `Are you sure you want to approve the seat change request from ${currentSeats} to ${requestedSeats} seats for ${passengerName}?`
// //     : `⚠️ WARNING: Rejecting this modification will CANCEL the original booking of ${currentSeats} seat(s) for ${passengerName}. The seats will be released. Are you sure?`;
  
// //   showConfirmationAlert(`${action === 'approve' ? 'Approve' : 'Reject'} Modification`, message, async () => {
// //     try {
// //       const url = `${API_BASE_URL}/api/v1/modifications/${requestId}/${action}`;
// //       const response = await fetch(url, { method: 'PUT' });
// //       const data = await response.json();
      
// //       if (!response.ok) throw new Error(data.detail || `Failed to ${action} modification`);
      
// //       // CRITICAL: Update pendingModifications state to mark as rejected
// //       setPendingModifications(prev => 
// //         prev.map(mod => 
// //           mod.id === requestId 
// //             ? { ...mod, status: action === 'approve' ? 'approved' : 'rejected' }
// //             : mod
// //         )
// //       );
      
// //       if (action === 'reject') {
// //         // CRITICAL: Update bookings - mark as cancelled so it won't count toward seats
// //         setBookings(prevBookings => 
// //           prevBookings.map(booking => 
// //             booking.booking_id === bookingId 
// //               ? { 
// //                   ...booking, 
// //                   status: 'cancelled',  // Mark as cancelled
// //                   seats_booked: 0,
// //                   modification_request: {
// //                     status: 'rejected',
// //                     current_seats: currentSeats,
// //                     requested_seats: requestedSeats,
// //                     rejection_reason: data.rejection_reason || 'Modification request rejected'
// //                   }
// //                 }
// //               : booking
// //           )
// //         );
        
// //         showCustomAlert('Modification Rejected', 
// //           `The modification request was rejected. The original booking for ${currentSeats} seat(s) has been CANCELLED and ${currentSeats} seat(s) are now available.`, 
// //           'warning');
// //       } else {
// //         // Update approved modification seat count
// //         setBookings(prevBookings => 
// //           prevBookings.map(booking => 
// //             booking.booking_id === bookingId 
// //               ? { 
// //                   ...booking, 
// //                   seats_booked: requestedSeats,
// //                   modification_request: {
// //                     ...booking.modification_request,
// //                     status: 'approved',
// //                     requested_seats: requestedSeats
// //                   }
// //                 }
// //               : booking
// //           )
// //         );
        
// //         showCustomAlert('Success', 
// //           `Modification request approved successfully. Seats updated from ${currentSeats} to ${requestedSeats}.`, 
// //           'success');
// //       }
      
// //       // Force immediate refresh
// //       setRefreshKey(prev => prev + 1);
      
// //       // Then refresh from server
// //       setTimeout(() => {
// //         fetchBookings();
// //         fetchPendingModifications();
// //         checkForConcurrentRequests();
// //       }, 500);
      
// //       if (socketRef.current) {
// //         socketRef.current.emit('modification-response', {
// //           ride_id: ride.id,
// //           request_id: requestId,
// //           action: action,
// //           booking_id: bookingId
// //         });
// //       }
      
// //     } catch (error) {
// //       console.error('Modification action error:', error);
// //       showCustomAlert('Error', error.message, 'error');
// //     }
// //   });
// // };
// //   const handleRateRider = async (booking, sessionId) => {
// //     let effectiveSessionId = sessionId || ride?.live_session?.session_id;
    
// //     if (!effectiveSessionId) {
// //       try {
// //         const response = await fetch(`${API_BASE_URL}/booking/${booking.booking_id}/session`);
// //         const data = await response.json();
        
// //         if (data.session_id) {
// //           effectiveSessionId = data.session_id;
// //         }
// //       } catch (error) {
// //         console.log('Error fetching session from booking:', error);
// //       }
// //     }
    
// //     if (!effectiveSessionId) {
// //       showCustomAlert('Error', 'Cannot rate rider: No session found for this ride', 'error');
// //       return;
// //     }
    
// //     setSelectedRider(booking);
// //     setCurrentSessionId(effectiveSessionId);
// //     setRating(0);
// //     setFeedback('');
// //     setRatingModalVisible(true);
// //   };

// //   const submitRiderRating = async () => {
// //     if (!selectedRider) return;
// //     if (rating === 0) {
// //       showCustomAlert('Rating Required', 'Please select a rating before submitting', 'warning');
// //       return;
// //     }
    
// //     setModifyingRequest(true);
// //     try {
// //       const sessionId = currentSessionId;
// //       if (!sessionId) {
// //         throw new Error('No session ID found');
// //       }
      
// //       const requestBody = {
// //         booking_id: selectedRider.booking_id,
// //         rating: rating,
// //         feedback: typeof feedback === 'string' ? feedback : String(feedback || ''),
// //       };
      
// //       const response = await fetch(`${API_BASE_URL}/ride-sessions/${sessionId}/rate-rider`, {
// //         method: 'POST',
// //         headers: { 'Content-Type': 'application/json' },
// //         body: JSON.stringify(requestBody),
// //       });
      
// //       const data = await response.json();
      
// //       if (!response.ok) {
// //         if (response.status === 400 && data.detail?.includes('already')) {
// //           showCustomAlert('Already Rated', 'You have already rated this rider', 'info');
// //           setRatingModalVisible(false);
// //           setSelectedRider(null);
// //           setCurrentSessionId(null);
// //           setRating(0);
// //           setFeedback('');
// //           await fetchBookings();
// //           return;
// //         }
// //         throw new Error(data.detail || 'Failed to submit rating');
// //       }
      
// //       setRatingModalVisible(false);
// //       setRating(0);
// //       setFeedback('');
// //       setSelectedRider(null);
// //       setCurrentSessionId(null);
      
// //       showCustomAlert('Rating Submitted', `You rated ${selectedRider.passenger_name || 'the rider'} ${rating} stars!`, 'success');
// //       await fetchBookings();
      
// //     } catch (error) {
// //       console.error('Rating error:', error);
// //       showCustomAlert('Error', error.message || 'Could not submit rating', 'error');
// //     } finally {
// //       setModifyingRequest(false);
// //     }
// //   };

// //   const renderStars = () => (
// //     <View style={styles.starsRow}>
// //       {[1, 2, 3, 4, 5].map((star) => (
// //         <TouchableOpacity key={star} onPress={() => setRating(star)}>
// //           <Ionicons
// //             name={star <= rating ? 'star' : 'star-outline'}
// //             size={32}
// //             color={star <= rating ? '#F59E0B' : '#D1D5DB'}
// //             style={{ marginHorizontal: 4 }}
// //           />
// //         </TouchableOpacity>
// //       ))}
// //     </View>
// //   );

// //   // Get driver start coordinates
// //   const driverStart = useMemo(() => {
// //     if (ride?.origin_lat && ride?.origin_lon) {
// //       return { latitude: Number(ride.origin_lat), longitude: Number(ride.origin_lon) };
// //     }
// //     if (ride?.origin_coords && Array.isArray(ride.origin_coords) && ride.origin_coords.length === 2) {
// //       return { longitude: Number(ride.origin_coords[0]), latitude: Number(ride.origin_coords[1]) };
// //     }
// //     const routeCoords = parseRouteCoordinates(ride?.routeCoordinates);
// //     if (routeCoords.length > 0) return routeCoords[0];
// //     return null;
// //   }, [ride]);

// //   // Get driver end coordinates
// //   const driverEnd = useMemo(() => {
// //     if (ride?.destination_lat && ride?.destination_lon) {
// //       return { latitude: Number(ride.destination_lat), longitude: Number(ride.destination_lon) };
// //     }
// //     if (ride?.destination_coords && Array.isArray(ride.destination_coords) && ride.destination_coords.length === 2) {
// //       return { longitude: Number(ride.destination_coords[0]), latitude: Number(ride.destination_coords[1]) };
// //     }
// //     const routeCoords = parseRouteCoordinates(ride?.routeCoordinates);
// //     if (routeCoords.length > 0) return routeCoords[routeCoords.length - 1];
// //     return null;
// //   }, [ride]);

// //   const formatDateTime = (dateString) => {
// //     if (!dateString) return '';
// //     const date = new Date(dateString);
// //     if (isNaN(date.getTime())) return '';
// //     return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false });
// //   };

// //   const routePath = useMemo(() => {
// //     const fullRoute = parseRouteCoordinates(ride?.routeCoordinates);
// //     if (fullRoute.length >= 2) return fullRoute;
// //     if (driverStart && driverEnd) return [driverStart, driverEnd];
// //     return [];
// //   }, [ride, driverStart, driverEnd]);

// //   // Calculate distance between two coordinates (in km)
// //   const calculateDistance = (lat1, lon1, lat2, lon2) => {
// //     const R = 6371;
// //     const dLat = (lat2 - lat1) * Math.PI / 180;
// //     const dLon = (lon2 - lon1) * Math.PI / 180;
// //     const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
// //               Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
// //               Math.sin(dLon/2) * Math.sin(dLon/2);
// //     const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
// //     return R * c;
// //   };

// //   // Calculate estimated travel time between points (in minutes)
// //   const calculateTravelTime = (distanceKm, avgSpeedKmh = 40) => {
// //     const timeHours = distanceKm / avgSpeedKmh;
// //     const timeMinutes = Math.round(timeHours * 60);
// //     return timeMinutes;
// //   };

// //   // Format duration display
// //   const formatDuration = (minutes) => {
// //     if (minutes < 60) return `${minutes} min`;
// //     const hours = Math.floor(minutes / 60);
// //     const mins = minutes % 60;
// //     return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`;
// //   };

// //   // Get all map markers - ONLY for accepted bookings (not cancelled/rejected)
// //   const getAllMapMarkers = useMemo(() => {
// //     const markers = [];
// //     // Only include accepted bookings (not cancelled or rejected)
// //     const confirmedBookings = bookings.filter(b => b.status === 'accepted');
    
// //     // Driver start point
// //     if (driverStart?.latitude && driverStart?.longitude) {
// //       markers.push({
// //         id: 'driver-start',
// //         type: 'start',
// //         coordinate: driverStart,
// //         title: '🚗 Trip Start',
// //         address: ride?.origin || 'Starting point',
// //         time: formatDateTime(ride?.departure_time),
// //         icon: 'flag',
// //         order: 0,
// //         walkDistance: null,
// //         description: `Departure: ${formatDate(ride?.departure_time)}`
// //       });
// //     }
    
// //     // Add rider pickup points
// //     confirmedBookings.forEach((booking) => {
// //       const pickupLat = booking.intersection_pickup_lat || booking.pickup_lat;
// //       const pickupLon = booking.intersection_pickup_lon || booking.pickup_lon;
// //       if (pickupLat && pickupLon) {
// //         markers.push({
// //           id: `pickup-${booking.booking_id}`,
// //           type: 'pickup',
// //           coordinate: { latitude: Number(pickupLat), longitude: Number(pickupLon) },
// //           title: `📍 Pickup: ${booking.passenger_name || 'Rider'}`,
// //           address: booking.origin || 'Pickup location',
// //           walkDistance: booking.pickup_walk_distance_m,
// //           walkDuration: booking.pickup_walk_distance_m ? Math.round(booking.pickup_walk_distance_m / 80) : null,
// //           riderName: booking.passenger_name,
// //           seats: booking.seats_booked,
// //           icon: 'person-add',
// //           order: markers.length,
// //           description: `${booking.seats_booked} seat(s) • ${booking.pickup_walk_distance_m ? `${booking.pickup_walk_distance_m}m walk` : 'Direct pickup'}`
// //         });
// //       }
// //     });
    
// //     // Add rider dropoff points
// //     confirmedBookings.forEach((booking) => {
// //       const dropLat = booking.intersection_drop_lat || booking.drop_lat;
// //       const dropLon = booking.intersection_drop_lon || booking.drop_lon;
// //       if (dropLat && dropLon) {
// //         markers.push({
// //           id: `dropoff-${booking.booking_id}`,
// //           type: 'dropoff',
// //           coordinate: { latitude: Number(dropLat), longitude: Number(dropLon) },
// //           title: `🏁 Dropoff: ${booking.passenger_name || 'Rider'}`,
// //           address: booking.destination || 'Dropoff location',
// //           walkDistance: booking.drop_walk_distance_m,
// //           walkDuration: booking.drop_walk_distance_m ? Math.round(booking.drop_walk_distance_m / 80) : null,
// //           riderName: booking.passenger_name,
// //           seats: booking.seats_booked,
// //           icon: 'flag',
// //           order: markers.length,
// //           description: `${booking.drop_walk_distance_m ? `${booking.drop_walk_distance_m}m walk to destination` : 'Direct dropoff'}`
// //         });
// //       }
// //     });
    
// //     // Driver end point
// //     if (driverEnd?.latitude && driverEnd?.longitude) {
// //       markers.push({
// //         id: 'driver-end',
// //         type: 'end',
// //         coordinate: driverEnd,
// //         title: '🏁 Trip End',
// //         address: ride?.destination || 'Destination',
// //         time: formatDateTime(ride?.expected_end_time || ride?.departure_time),
// //         icon: 'flag',
// //         order: markers.length,
// //         walkDistance: null,
// //         description: 'Final destination'
// //       });
// //     }
    
// //     return markers.sort((a, b) => a.order - b.order);
// //   }, [bookings, driverStart, driverEnd, ride]);

// //   // Get walking path lines - ONLY for accepted bookings
// //   const walkingPaths = useMemo(() => {
// //     const paths = [];
// //     const confirmedBookings = bookings.filter(b => b.status === 'accepted');
    
// //     confirmedBookings.forEach(booking => {
// //       // Pickup walking path
// //       const pickupLat = booking.intersection_pickup_lat || booking.pickup_lat;
// //       const pickupLon = booking.intersection_pickup_lon || booking.pickup_lon;
// //       const pickupAddressLat = booking.pickup_lat;
// //       const pickupAddressLon = booking.pickup_lon;
      
// //       if (pickupLat && pickupLon && pickupAddressLat && pickupAddressLon) {
// //         const distance = calculateDistance(
// //           pickupLat, pickupLon, pickupAddressLat, pickupAddressLon
// //         );
// //         if (distance > 0.05) {
// //           paths.push({
// //             id: `walking-pickup-${booking.booking_id}`,
// //             coordinates: [
// //               { latitude: Number(pickupLat), longitude: Number(pickupLon) },
// //               { latitude: Number(pickupAddressLat), longitude: Number(pickupAddressLon) }
// //             ],
// //             color: '#10B981',
// //             lineDash: [5, 5],
// //             walkDistance: booking.pickup_walk_distance_m,
// //             type: 'pickup'
// //           });
// //         }
// //       }
      
// //       // Dropoff walking path
// //       const dropLat = booking.intersection_drop_lat || booking.drop_lat;
// //       const dropLon = booking.intersection_drop_lon || booking.drop_lon;
// //       const dropAddressLat = booking.drop_lat;
// //       const dropAddressLon = booking.drop_lon;
      
// //       if (dropLat && dropLon && dropAddressLat && dropAddressLon) {
// //         const distance = calculateDistance(
// //           dropLat, dropLon, dropAddressLat, dropAddressLon
// //         );
// //         if (distance > 0.05) {
// //           paths.push({
// //             id: `walking-dropoff-${booking.booking_id}`,
// //             coordinates: [
// //               { latitude: Number(dropLat), longitude: Number(dropLon) },
// //               { latitude: Number(dropAddressLat), longitude: Number(dropAddressLon) }
// //             ],
// //             color: '#F59E0B',
// //             lineDash: [5, 5],
// //             walkDistance: booking.drop_walk_distance_m,
// //             type: 'dropoff'
// //           });
// //         }
// //       }
// //     });
    
// //     return paths;
// //   }, [bookings]);

// //   // Enhanced trip timeline - ONLY for accepted bookings
// //   const sortedTripTimeline = useMemo(() => {
// //     const items = [];
// //     const confirmedBookings = bookings.filter(b => b.status === 'accepted');
    
// //     // Create all potential points with coordinates
// //     const allPoints = [];
// //     let cumulativeDistance = 0;
// //     let cumulativeDuration = 0;
    
// //     // Start point
// //     if (driverStart?.latitude && driverStart?.longitude) {
// //       allPoints.push({
// //         id: 'start',
// //         type: 'start',
// //         title: 'Trip Start',
// //         address: ride?.origin || 'Starting point',
// //         actualAddress: ride?.origin || 'Starting point',
// //         time: formatDateTime(ride?.departure_time),
// //         fullDateTime: ride?.departure_time,
// //         coordinates: driverStart,
// //         order: 0,
// //         icon: '🚗',
// //         color: '#2457A6'
// //       });
// //     }
    
// //     // Add all pickup and dropoff points
// //     confirmedBookings.forEach(booking => {
// //       const pickupLat = booking.intersection_pickup_lat || booking.pickup_lat;
// //       const pickupLon = booking.intersection_pickup_lon || booking.pickup_lon;
// //       const pickupCacheKey = `${pickupLat},${pickupLon}`;
// //       const pickupAddress = addressCache[pickupCacheKey];
      
// //       if (pickupLat && pickupLon) {
// //         allPoints.push({
// //           id: `pickup-${booking.booking_id}`,
// //           type: 'pickup',
// //           title: `Pickup: ${booking.passenger_name || 'Rider'}`,
// //           address: booking.origin || 'Pickup location',
// //           actualAddress: pickupAddress || (booking.origin ? booking.origin : `Location loading...`),
// //           time: formatDateTime(booking.pickup_time || ride?.departure_time),
// //           walkDistance: booking.pickup_walk_distance_m,
// //           walkDuration: booking.pickup_walk_distance_m ? Math.round(booking.pickup_walk_distance_m / 80) : null,
// //           riderName: booking.passenger_name,
// //           seats: booking.seats_booked,
// //           coordinates: { latitude: Number(pickupLat), longitude: Number(pickupLon) },
// //           icon: '📍',
// //           color: '#10B981'
// //         });
// //       }
      
// //       const dropLat = booking.intersection_drop_lat || booking.drop_lat;
// //       const dropLon = booking.intersection_drop_lon || booking.drop_lon;
// //       const dropCacheKey = `${dropLat},${dropLon}`;
// //       const dropAddress = addressCache[dropCacheKey];
      
// //       if (dropLat && dropLon) {
// //         allPoints.push({
// //           id: `dropoff-${booking.booking_id}`,
// //           type: 'dropoff',
// //           title: `Dropoff: ${booking.passenger_name || 'Rider'}`,
// //           address: booking.destination || 'Dropoff location',
// //           actualAddress: dropAddress || (booking.destination ? booking.destination : `Location loading...`),
// //           time: formatDateTime(booking.dropoff_time || ride?.expected_end_time),
// //           walkDistance: booking.drop_walk_distance_m,
// //           walkDuration: booking.drop_walk_distance_m ? Math.round(booking.drop_walk_distance_m / 80) : null,
// //           riderName: booking.passenger_name,
// //           seats: booking.seats_booked,
// //           coordinates: { latitude: Number(dropLat), longitude: Number(dropLon) },
// //           icon: '🏁',
// //           color: '#F59E0B'
// //         });
// //       }
// //     });
    
// //     // End point
// //     if (driverEnd?.latitude && driverEnd?.longitude) {
// //       allPoints.push({
// //         id: 'end',
// //         type: 'end',
// //         title: 'Trip End',
// //         address: ride?.destination || 'Destination',
// //         actualAddress: ride?.destination || 'Destination',
// //         time: formatDateTime(ride?.expected_end_time || ride?.departure_time),
// //         coordinates: driverEnd,
// //         icon: '🏁',
// //         color: '#DC2626'
// //       });
// //     }
    
// //     // Sort points based on route order
// //     const routeCoords = routePath;
// //     const sortedPoints = [];
    
// //     if (routeCoords.length > 0) {
// //       const pointsWithDistance = allPoints.map(point => {
// //         let minDistance = Infinity;
// //         let indexOnRoute = -1;
        
// //         routeCoords.forEach((coord, idx) => {
// //           const distance = calculateDistance(
// //             point.coordinates.latitude,
// //             point.coordinates.longitude,
// //             coord.latitude,
// //             coord.longitude
// //           );
// //           if (distance < minDistance) {
// //             minDistance = distance;
// //             indexOnRoute = idx;
// //           }
// //         });
        
// //         return { ...point, routeIndex: indexOnRoute, distanceToRoute: minDistance };
// //       });
      
// //       pointsWithDistance.sort((a, b) => a.routeIndex - b.routeIndex);
// //       sortedPoints.push(...pointsWithDistance);
// //     } else {
// //       sortedPoints.push(...allPoints);
// //     }
    
// //     // Calculate cumulative distances and durations
// //     for (let i = 0; i < sortedPoints.length - 1; i++) {
// //       const current = sortedPoints[i];
// //       const next = sortedPoints[i + 1];
// //       if (current.coordinates && next.coordinates) {
// //         const distance = calculateDistance(
// //           current.coordinates.latitude,
// //           current.coordinates.longitude,
// //           next.coordinates.latitude,
// //           next.coordinates.longitude
// //         );
// //         const duration = calculateTravelTime(distance);
        
// //         cumulativeDistance += distance;
// //         cumulativeDuration += duration;
        
// //         sortedPoints[i].distanceToNext = distance.toFixed(1);
// //         sortedPoints[i].durationToNext = duration;
// //         sortedPoints[i].cumulativeDistance = cumulativeDistance.toFixed(1);
// //         sortedPoints[i].cumulativeDuration = cumulativeDuration;
// //         sortedPoints[i].segmentNumber = i + 1;
// //       }
// //     }
    
// //     // Add total trip summary
// //     if (sortedPoints.length > 0 && sortedPoints[0]) {
// //       sortedPoints[0].totalDistance = cumulativeDistance.toFixed(1);
// //       sortedPoints[0].totalDuration = cumulativeDuration;
// //     }
    
// //     return sortedPoints;
// //   }, [bookings, driverStart, driverEnd, ride, routePath, addressCache]);

// //   const allMarkerCoords = useMemo(() => {
// //     const coords = getAllMapMarkers.map(m => m.coordinate).filter(c => c?.latitude && c?.longitude);
// //     walkingPaths.forEach(path => {
// //       path.coordinates.forEach(coord => {
// //         coords.push(coord);
// //       });
// //     });
// //     return coords;
// //   }, [getAllMapMarkers, walkingPaths]);

// //   const fitMapToMarkers = useCallback(() => {
// //     if (mapRef.current && mapReady && allMarkerCoords.length >= 1) {
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
// //     if (mapReady && allMarkerCoords.length >= 1) fitMapToMarkers();
// //   }, [mapReady, allMarkerCoords, fitMapToMarkers]);

// //   const getVehicleName = () => {
// //     if (ride?.vehicle) {
// //       const parts = [];
// //       if (ride.vehicle.make) parts.push(ride.vehicle.make);
// //       if (ride.vehicle.model) parts.push(ride.vehicle.model);
// //       if (parts.length > 0) return parts.join(' ');
// //     }
// //     return 'Vehicle details unavailable';
// //   };
  
// //   const vehicleName = getVehicleName();
// //   const vehicleRegNumber = ride?.vehicle?.registration_number || null;
  
// //   const totalSeatsOffered = ride?.available_seats ?? 0;

// //   const mapHeight = animatedDrawer.interpolate({ inputRange: [0, 1], outputRange: [height - SAFE_TOP - COLLAPSED_HEIGHT, height * 0.35] });
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

// //   const getStatusColor = (status) => {
// //     switch (status) {
// //       case 'accepted': return '#10B981';
// //       case 'pending': return '#F59E0B';
// //       case 'rejected': return '#EF4444';
// //       case 'cancelled': return '#6B7280';
// //       default: return Colors.gray;
// //     }
// //   };

// //   const getStatusText = (status) => {
// //     switch (status) {
// //       case 'accepted': return 'Confirmed';
// //       case 'pending': return 'Pending';
// //       case 'rejected': return 'Rejected';
// //       case 'cancelled': return 'Cancelled';
// //       default: return status;
// //     }
// //   };

// //   const handleChatWithPassenger = (passengerPhone, passengerName, passengerPhoto) => {
// //     navigation.navigate('ChatScreen', {
// //       receiverPhone: passengerPhone,
// //       conversationId: `chat-${ride?.id}-${passengerPhone}`,
// //       rideId: ride?.id,
// //       user: {
// //         name: passengerName,
// //         tripInfo: `${ride?.origin || 'Pickup'} → ${ride?.destination || 'Drop'}`,
// //         phone: passengerPhone,
// //         profile_picture: passengerPhoto
// //       }
// //     });
// //   };

// //   const handleStartRide = () => {
// //     navigation.navigate('StartRideConfirmScreen', { rideId: ride?.id, ride });
// //   };

// //   const handleEditRide = () => {
// //     if (!ride?.id) {
// //       showCustomAlert("Error", "Cannot edit ride: Ride ID missing", "error");
// //       return;
// //     }
    
// //     if (!user?.phone_number) {
// //       showCustomAlert("Error", "Please login to edit ride", "error");
// //       return;
// //     }
    
// //     if (ride?.started_at) {
// //       showCustomAlert("Cannot Edit", "Ride has already started. Cannot edit.", "warning");
// //       return;
// //     }
    
// //     if (ride?.cancellation_reason) {
// //       showCustomAlert("Cannot Edit", "Cancelled ride cannot be edited.", "warning");
// //       return;
// //     }
    
// //     const rideData = {
// //       from: ride?.origin || '',
// //       to: ride?.destination || '',
// //       dateTime: ride?.departure_time ? new Date(ride.departure_time) : new Date(),
// //       seatsAvailable: ride?.available_seats || 1,
// //       pricePerSeat: (ride?.price_per_seat || 0).toString(),
// //       vehicleId: ride?.vehicle_id || null,
// //       originCoords: ride?.origin_coords,
// //       destinationCoords: ride?.destination_coords,
// //       routeCoordinates: ride?.route_coordinates,
// //       distanceKm: ride?.distance_km,
// //       durationText: ride?.duration_text,
// //       totalPrice: ride?.total_estimated_price,
// //       preferences: ride?.preferences,
// //       womenOnly: ride?.women_only,
// //     };
    
// //     navigation.navigate('DriveNext', { 
// //       rideData, 
// //       isEdit: true, 
// //       rideId: ride.id, 
// //       phoneNumber: user?.phone_number 
// //     });
// //   };

// //   const handleCancelRide = () => {
// //     showConfirmationAlert("Cancel Ride", "Are you sure you want to cancel this ride?", async () => {
// //       try {
// //         const response = await fetch(`${API_BASE_URL}/ride/${ride?.id}/cancel`, { method: 'PUT' });
// //         if (!response.ok) throw new Error('Failed to cancel ride');
// //         showCustomAlert("Success", "Ride cancelled successfully.", "success");
// //         setTimeout(() => navigation.goBack(), 1500);
// //       } catch (err) {
// //         showCustomAlert("Error", "Could not cancel ride.", "error");
// //       }
// //     });
// //   };

// //   const handleNavigateToLocation = (latitude, longitude, title) => {
// //     const url = Platform.select({
// //       ios: `maps:0,0?q=${latitude},${longitude}`,
// //       android: `geo:0,0?q=${latitude},${longitude}(${encodeURIComponent(title)})`
// //     });
// //     Linking.openURL(url).catch(err => {
// //       showCustomAlert("Error", "Could not open maps", "error");
// //     });
// //   };

// //   const focusOnStop = (coordinates) => {
// //     if (mapRef.current && coordinates) {
// //       mapRef.current.animateToRegion({
// //         latitude: coordinates.latitude,
// //         longitude: coordinates.longitude,
// //         latitudeDelta: 0.01,
// //         longitudeDelta: 0.01,
// //       }, 500);
// //     }
// //   };

// //   const initialRegion = {
// //     latitude: driverStart?.latitude || 28.6139,
// //     longitude: driverStart?.longitude || 77.2090,
// //     latitudeDelta: 0.05,
// //     longitudeDelta: 0.05,
// //   };

// //   const confirmedBookings = bookings.filter(b => b.status === 'accepted');
// //   const pendingBookings = bookings.filter(b => b.status === 'pending');
// //   const rideStatus = getRideStatusDisplay();
// //   const showStartRide = !ride?.started_at && !ride?.cancellation_reason && ride?.status !== 'completed' && rideStatus.type !== 'auto-cancelled';
// //   const pendingMods = pendingModifications.filter(m => m.status === 'pending' || m.status === undefined);
// //   const showLiveSession = ride?.live_session?.session_id && ride?.started_at && ride?.status !== 'completed';
// //   const isCompleted = ride?.status === 'completed' || ride?.completed_at;
// //   const isOngoing = ride?.started_at && !isCompleted;
// //   const unratedRiders = confirmedBookings.filter(b => !b.driver_rating_given && b.driver_rating_given !== true);
// //   const needsRating = isCompleted && unratedRiders.length > 0;
// //   const showRatingSection = isCompleted && confirmedBookings.length > 0;

// //   // Render walking path
// //   const renderWalkingPath = (path) => {
// //     return (
// //       <Polyline
// //         key={path.id}
// //         coordinates={path.coordinates}
// //         strokeColor={path.color}
// //         strokeWidth={3}
// //         lineDashPattern={path.lineDash}
// //         lineCap="round"
// //         lineJoin="round"
// //       />
// //     );
// //   };

// //   // Render marker on map
// //   const renderMarker = (marker) => {
// //     let color, size = 36;
// //     switch (marker.type) {
// //       case 'start': color = '#2457A6'; size = 42; break;
// //       case 'end': color = '#DC2626'; size = 42; break;
// //       case 'pickup': color = '#10B981'; size = 38; break;
// //       case 'dropoff': color = '#F59E0B'; size = 38; break;
// //       default: color = '#6B7280'; size = 32;
// //     }
    
// //     const iconName = marker.type === 'pickup' ? 'person-add' : (marker.type === 'dropoff' ? 'flag' : 'location');
    
// //     return (
// //       <Marker 
// //         key={marker.id} 
// //         coordinate={marker.coordinate} 
// //         title={marker.title} 
// //         description={marker.description || marker.address}
// //       >
// //         <View style={[styles.customMarker, { backgroundColor: color, width: size, height: size, borderRadius: size / 2 }]}>
// //           <Ionicons name={iconName} size={size * 0.45} color="#fff" />
// //           {marker.type === 'pickup' && marker.seats && (
// //             <View style={styles.markerBadge}>
// //               <Text style={styles.markerBadgeText}>{marker.seats}</Text>
// //             </View>
// //           )}
// //           {marker.walkDistance && marker.walkDistance > 0 && (
// //             <View style={[styles.walkBadge, { backgroundColor: marker.type === 'pickup' ? '#10B981' : '#F59E0B' }]}>
// //               <Ionicons name="walk" size={10} color="#fff" />
// //               <Text style={styles.walkBadgeText}>{marker.walkDistance}m</Text>
// //             </View>
// //           )}
// //         </View>
// //       </Marker>
// //     );
// //   };

// //   // Render enhanced trip timeline item
// //   const renderTimelineItem = (item, index) => {
// //     const isLast = index === sortedTripTimeline.length - 1;
// //     const hasWalking = item.walkDistance && item.walkDistance > 0;
    
// //     return (
// //       <TouchableOpacity 
// //         key={item.id} 
// //         style={styles.timelineItemCard}
// //         onPress={() => focusOnStop(item.coordinates)}
// //         activeOpacity={0.7}
// //       >
// //         <View style={styles.timelineItemLeft}>
// //           <View style={[styles.timelineItemDot, { backgroundColor: item.color }]}>
// //             <Text style={styles.timelineItemIcon}>{item.icon}</Text>
// //           </View>
// //           {!isLast && <View style={[styles.timelineItemLine, { backgroundColor: item.color + '40' }]} />}
// //         </View>
        
// //         <View style={styles.timelineItemRight}>
// //           <View style={styles.timelineItemHeader}>
// //             <Text style={styles.timelineItemType}>{item.type.toUpperCase()}</Text>
// //             {item.segmentNumber && (
// //               <View style={styles.segmentBadge}>
// //                 <Text style={styles.segmentBadgeText}>Stop {item.segmentNumber}</Text>
// //               </View>
// //             )}
// //           </View>
          
// //           <Text style={styles.timelineItemTitle}>{item.title}</Text>
          
// //           <View style={styles.timelineItemDetails}>
// //             {item.riderName && (
// //               <View style={styles.detailChip}>
// //                 <Ionicons name="person-outline" size={12} color="#6B7280" />
// //                 <Text style={styles.detailChipText}>{item.riderName}</Text>
// //               </View>
// //             )}
// //             {item.seats && (
// //               <View style={styles.detailChip}>
// //                 <Ionicons name="people-outline" size={12} color="#6B7280" />
// //                 <Text style={styles.detailChipText}>{item.seats} seat{item.seats > 1 ? 's' : ''}</Text>
// //               </View>
// //             )}
// //             {item.time && (
// //               <View style={styles.detailChip}>
// //                 <Ionicons name="time-outline" size={12} color="#6B7280" />
// //                 <Text style={styles.detailChipText}>{item.time}</Text>
// //               </View>
// //             )}
// //           </View>
          
// //           <Text style={styles.timelineItemAddress} numberOfLines={2}>
// //             {item.actualAddress || item.address}
// //           </Text>
          
// //           {hasWalking && (
// //             <View style={[styles.walkingChip, { backgroundColor: item.color + '15' }]}>
// //               <Ionicons name="walk" size={14} color={item.color} />
// //               <Text style={[styles.walkingChipText, { color: item.color }]}>
// //                 Walk {item.walkDistance}m • ~{item.walkDuration} min
// //               </Text>
// //             </View>
// //           )}
          
// //           {item.distanceToNext && (
// //             <View style={styles.routeInfo}>
// //               <View style={styles.routeInfoItem}>
// //                 <Ionicons name="navigate-outline" size={12} color="#2457A6" />
// //                 <Text style={styles.routeInfoText}>Next: {item.distanceToNext} km</Text>
// //               </View>
// //               <View style={styles.routeInfoItem}>
// //                 <Ionicons name="time-outline" size={12} color="#F59E0B" />
// //                 <Text style={styles.routeInfoText}>~{formatDuration(item.durationToNext)}</Text>
// //               </View>
// //               {item.cumulativeDistance && (
// //                 <View style={styles.routeInfoItem}>
// //                   <Ionicons name="flag-outline" size={12} color="#10B981" />
// //                   <Text style={styles.routeInfoText}>Total: {item.cumulativeDistance} km</Text>
// //                 </View>
// //               )}
// //             </View>
// //           )}
          
// //           <TouchableOpacity 
// //             style={styles.navigateButton}
// //             onPress={() => handleNavigateToLocation(
// //               item.coordinates.latitude,
// //               item.coordinates.longitude,
// //               item.title
// //             )}
// //           >
// //             <Ionicons name="navigate-circle" size={16} color="#2457A6" />
// //             <Text style={styles.navigateButtonText}>Navigate to this stop</Text>
// //           </TouchableOpacity>
// //         </View>
// //       </TouchableOpacity>
// //     );
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
// //           {/* Main route polyline */}
// //           {routePath.length >= 2 && (
// //             <>
// //               <Polyline 
// //                 coordinates={routePath} 
// //                 strokeColor="#2457A6" 
// //                 strokeWidth={6} 
// //                 lineCap="round" 
// //                 lineJoin="round"
// //               />
// //               <Polyline 
// //                 coordinates={routePath} 
// //                 strokeColor="#4A7DFF" 
// //                 strokeWidth={3} 
// //                 lineCap="round" 
// //                 lineJoin="round"
// //                 lineDashPattern={[0]}
// //               />
// //             </>
// //           )}
          
// //           {/* Walking paths for pickup and dropoff */}
// //           {walkingPaths.map(path => renderWalkingPath(path))}
          
// //           {/* Proximity circles for pickup points */}
// //           {getAllMapMarkers.filter(m => m.type === 'pickup' && m.walkDistance).map(marker => (
// //             <Circle
// //               key={`circle-${marker.id}`}
// //               center={marker.coordinate}
// //               radius={marker.walkDistance}
// //               strokeColor="rgba(16, 185, 129, 0.3)"
// //               fillColor="rgba(16, 185, 129, 0.1)"
// //               strokeWidth={1}
// //             />
// //           ))}
          
// //           {/* All markers */}
// //           {getAllMapMarkers.map(marker => renderMarker(marker))}
// //         </MapView>

// //         <TouchableOpacity style={styles.mapBackButton} onPress={() => navigation.goBack()}>
// //           <Ionicons name="chevron-back" size={26} color={Colors.secondary} />
// //         </TouchableOpacity>
        
// //         {/* Map Legend */}
// //         <View style={styles.mapLegend}>
// //           <View style={styles.legendTitle}>
// //             <Text style={styles.legendTitleText}>Map Legend</Text>
// //           </View>
// //           <View style={styles.legendItem}>
// //             <View style={[styles.legendColor, { backgroundColor: '#2457A6', width: 20 }]} />
// //             <Text style={styles.legendText}>Main Route</Text>
// //           </View>
// //           <View style={styles.legendItem}>
// //             <View style={[styles.legendColor, { backgroundColor: '#10B981', borderStyle: 'dashed', borderWidth: 1, borderColor: '#10B981' }]} />
// //             <Text style={styles.legendText}>Walking (Pickup)</Text>
// //           </View>
// //           <View style={styles.legendItem}>
// //             <View style={[styles.legendColor, { backgroundColor: '#F59E0B', borderStyle: 'dashed', borderWidth: 1, borderColor: '#F59E0B' }]} />
// //             <Text style={styles.legendText}>Walking (Dropoff)</Text>
// //           </View>
// //           <View style={styles.legendItem}>
// //             <View style={[styles.legendDot, { backgroundColor: '#10B981' }]} />
// //             <Text style={styles.legendText}>Pickup Point</Text>
// //           </View>
// //           <View style={styles.legendItem}>
// //             <View style={[styles.legendDot, { backgroundColor: '#F59E0B' }]} />
// //             <Text style={styles.legendText}>Dropoff Point</Text>
// //           </View>
// //         </View>
        
// //         {/* Map Controls */}
// //         <View style={styles.mapControls}>
// //           <TouchableOpacity 
// //             style={styles.mapControlButton} 
// //             onPress={() => fitMapToMarkers()}
// //           >
// //             <Ionicons name="map-outline" size={20} color="#2457A6" />
// //           </TouchableOpacity>
// //         </View>
// //       </Animated.View>

// //       <Animated.View style={[styles.drawer, { height: drawerHeight }]}>
// //         <View style={styles.handleWrap} {...panResponder.panHandlers}>
// //           <TouchableOpacity activeOpacity={0.9} onPress={toggleDrawer} style={styles.handleHitArea}>
// //             <View style={styles.handleBar} />
// //           </TouchableOpacity>
// //           {!drawerExpanded && pendingMods.length > 0 && (
// //             <View style={styles.pendingNotificationBadge}>
// //               <Text style={styles.pendingNotificationText}>{pendingMods.length}</Text>
// //             </View>
// //           )}
// //         </View>

// //         {!drawerExpanded ? (
// //           <View style={styles.collapsedSummary}>
// //             <View style={styles.collapsedTopRow}>
// //               <View style={{ flex: 1 }}>
// //                 <Text style={styles.collapsedDriver} numberOfLines={1}>{ride?.driverName || 'Driver'}</Text>
// //                 <Text style={styles.collapsedSub} numberOfLines={1}>{ride?.origin || 'Pickup'} → {ride?.destination || 'Drop'}</Text>
// //               </View>
// //               <View style={styles.collapsedPriceWrap}>
// //                 <Text style={styles.collapsedPrice}>₹{ride?.price_per_seat}</Text>
// //                 <Text style={styles.collapsedPerSeat}>per seat</Text>
// //               </View>
// //             </View>
// //             {sortedTripTimeline.length > 0 && sortedTripTimeline[0]?.totalDistance && (
// //               <View style={styles.collapsedTripInfo}>
// //                 <Text style={styles.collapsedTripText}>
// //                   📍 {sortedTripTimeline.length} stops • {sortedTripTimeline[0].totalDistance} km • {formatDuration(sortedTripTimeline[0].totalDuration)}
// //                 </Text>
// //               </View>
// //             )}
// //           </View>
// //         ) : (
// //           <ScrollView ref={scrollViewRef} style={styles.drawerScroll} contentContainerStyle={styles.drawerContent} showsVerticalScrollIndicator={false}>
            
// //             {/* Status Banner */}
// //             <View style={[styles.statusBanner, { backgroundColor: rideStatus.color + '20' }]}>
// //               <Ionicons name={rideStatus.icon} size={20} color={rideStatus.color} />
// //               <View style={{ flex: 1 }}>
// //                 <Text style={[styles.statusBannerText, { color: rideStatus.color }]}>{rideStatus.text}</Text>
// //                 {rideStatus.reason && (
// //                   <Text style={[styles.statusBannerReason, { color: rideStatus.color }]}>{rideStatus.reason}</Text>
// //                 )}
// //               </View>
// //             </View>

// //             {/* Cancellation Banner with Reason */}
// //             {rideStatus.type === 'cancelled' && ride?.cancellation_reason && (
// //               <View style={styles.cancellationDetailedBanner}>
// //                 <View style={styles.cancellationHeader}>
// //                   <Ionicons name="close-circle" size={24} color="#DC2626" />
// //                   <Text style={styles.cancellationTitle}>Ride Cancelled</Text>
// //                 </View>
// //                 <Text style={styles.cancellationMessage}>{ride.cancellation_reason}</Text>
// //                 {ride.cancelled_by && (
// //                   <Text style={styles.cancelledByText}>
// //                     Cancelled by: {ride.cancelled_by === user?.phone_number ? 'You' : 'Driver'}
// //                   </Text>
// //                 )}
// //               </View>
// //             )}

// //             {/* Trip Overview Card */}
// //             <View style={styles.tripOverviewCard}>
// //               <View style={styles.tripOverviewHeader}>
// //                 <Ionicons name="information-circle-outline" size={24} color="#2457A6" />
// //                 <Text style={styles.tripOverviewTitle}>Trip Overview</Text>
// //               </View>
// //               <View style={styles.tripOverviewDetails}>
// //                 <View style={styles.tripOverviewItem}>
// //                   <Text style={styles.tripOverviewLabel}>From</Text>
// //                   <Text style={styles.tripOverviewValue}>{ride?.origin || 'Starting point'}</Text>
// //                 </View>
// //                 <View style={styles.tripOverviewArrow}>
// //                   <Ionicons name="arrow-down-outline" size={16} color="#2457A6" />
// //                 </View>
// //                 <View style={styles.tripOverviewItem}>
// //                   <Text style={styles.tripOverviewLabel}>To</Text>
// //                   <Text style={styles.tripOverviewValue}>{ride?.destination || 'Destination'}</Text>
// //                 </View>
// //               </View>
// //               <View style={styles.tripOverviewStats}>
// //                 <View style={styles.tripOverviewStat}>
// //                   <Ionicons name="calendar-outline" size={16} color="#6B7280" />
// //                   <Text style={styles.tripOverviewStatText}>{formatDate(ride?.departure_time)}</Text>
// //                 </View>
// //                 {sortedTripTimeline[0]?.totalDistance && (
// //                   <View style={styles.tripOverviewStat}>
// //                     <Ionicons name="map-outline" size={16} color="#6B7280" />
// //                     <Text style={styles.tripOverviewStatText}>{sortedTripTimeline[0].totalDistance} km total</Text>
// //                   </View>
// //                 )}
// //                 {sortedTripTimeline[0]?.totalDuration && (
// //                   <View style={styles.tripOverviewStat}>
// //                     <Ionicons name="time-outline" size={16} color="#6B7280" />
// //                     <Text style={styles.tripOverviewStatText}>{formatDuration(sortedTripTimeline[0].totalDuration)} est.</Text>
// //                   </View>
// //                 )}
// //               </View>
// //             </View>

// //             {/* Total Earnings Banner */}
// //             {isCompleted && totalEarnings > 0 && (
// //               <View style={styles.earningsBanner}>
// //                 <View style={styles.earningsBannerLeft}>
// //                   <View style={styles.earningsIconContainer}>
// //                     <Ionicons name="cash-outline" size={28} color="#10B981" />
// //                   </View>
// //                   <View>
// //                     <Text style={styles.earningsLabel}>Total Earnings</Text>
// //                     <Text style={styles.earningsSubLabel}>From confirmed bookings</Text>
// //                   </View>
// //                 </View>
// //                 <View style={styles.earningsAmountContainer}>
// //                   <Text style={styles.earningsCurrency}>₹</Text>
// //                   <Text style={styles.earningsAmount}>{totalEarnings}</Text>
// //                 </View>
// //               </View>
// //             )}

// //             {/* Earnings Breakdown */}
// //             {isCompleted && confirmedBookings.length > 0 && (
// //               <View style={styles.earningsBreakdownCard}>
// //                 <Text style={styles.earningsBreakdownTitle}>Earnings Breakdown</Text>
// //                 {confirmedBookings.map((booking) => (
// //                   <View key={booking.booking_id} style={styles.earningsRow}>
// //                     <View style={styles.earningsRowLeft}>
// //                       <View style={styles.earningsRowAvatar}>
// //                         <Text style={styles.earningsRowInitials}>
// //                           {getInitials(booking.passenger_name)}
// //                         </Text>
// //                       </View>
// //                       <View>
// //                         <Text style={styles.earningsRowName}>{booking.passenger_name || 'Rider'}</Text>
// //                         <Text style={styles.earningsRowSeats}>{booking.seats_booked} seat(s)</Text>
// //                       </View>
// //                     </View>
// //                     <Text style={styles.earningsRowAmount}>
// //                       ₹{booking.total_amount || booking.seats_booked * (ride?.price_per_seat || 0)}
// //                     </Text>
// //                   </View>
// //                 ))}
// //                 <View style={styles.earningsDivider} />
// //                 <View style={styles.earningsTotalRow}>
// //                   <Text style={styles.earningsTotalLabel}>Total</Text>
// //                   <Text style={styles.earningsTotalAmount}>₹{totalEarnings}</Text>
// //                 </View>
// //               </View>
// //             )}

// //             {/* Enhanced Trip Timeline Section - Only shows active bookings */}
// //             {sortedTripTimeline.length > 0 && (
// //               <View style={styles.cardSection}>
// //                 <TouchableOpacity 
// //                   style={styles.timelineHeader} 
// //                   onPress={() => setTimelineExpanded(!timelineExpanded)}
// //                 >
// //                   <View style={styles.timelineHeaderLeft}>
// //                     <Ionicons name="map-outline" size={20} color="#2457A6" />
// //                     <Text style={styles.sectionTitle}>Trip Details</Text>
// //                   </View>
// //                   <Ionicons 
// //                     name={timelineExpanded ? "chevron-up" : "chevron-down"} 
// //                     size={20} 
// //                     color={Colors.gray} 
// //                   />
// //                 </TouchableOpacity>
                
// //                 {timelineExpanded && (
// //                   <View style={styles.timelineContainer}>
// //                     {sortedTripTimeline.map((item, index) => renderTimelineItem(item, index))}
// //                   </View>
// //                 )}
// //               </View>
// //             )}

// //             {/* Vehicle Details */}
// //             <View style={styles.cardSection}>
// //               <Text style={styles.sectionTitle}>Vehicle Details</Text>
// //               <View style={styles.vehicleHeaderRow}>
// //                 <View style={styles.vehicleIconCircle}><Ionicons name="car-sport-outline" size={24} color="#2457A6" /></View>
// //                 <View style={styles.vehicleMeta}>
// //                   <Text style={styles.vehicleTitle}>{vehicleName}</Text>
// //                   {vehicleRegNumber && (
// //                     <View style={styles.vehicleRegContainer}>
// //                       <Ionicons name="clipboard-outline" size={12} color="#6B7280" />
// //                       <Text style={styles.vehicleRegText}>Reg: {vehicleRegNumber}</Text>
// //                     </View>
// //                   )}
// //                 </View>
// //               </View>
// //             </View>

// //             {/* Seat Information */}
// //             <View style={styles.cardSection}>
// //               <Text style={styles.sectionTitle}>Seat Information</Text>
              
// //               {/* Show warning if there are cancelled bookings due to modification rejection */}
// //               {bookings.some(b => b.modification_request?.status === 'rejected') && (
// //                 <View style={styles.rejectedModificationWarning}>
// //                   <Ionicons name="warning-outline" size={16} color="#DC2626" />
// //                   <Text style={styles.rejectedModificationWarningText}>
// //                     ⚠️ Some bookings were cancelled due to modification rejection. Seats have been released.
// //                   </Text>
// //                 </View>
// //               )}
              
// //               <View style={styles.seatInfoContainer}>
// //                 <View style={styles.seatInfoItem}>
// //                   <View style={[styles.seatIconCircle, { backgroundColor: '#EAF1FF' }]}>
// //                     <Ionicons name="car-sport-outline" size={24} color="#2457A6" />
// //                   </View>
// //                   <Text style={styles.seatInfoLabel}>Total</Text>
// //                   <Text style={styles.seatInfoValue}>{totalSeatsOffered}</Text>
// //                 </View>
// //                 <View style={styles.seatDivider} />
// //                 <View style={styles.seatInfoItem}>
// //                   <View style={[styles.seatIconCircle, { backgroundColor: '#E8F5E9' }]}>
// //                     <Ionicons name="people" size={24} color="#10B981" />
// //                   </View>
// //                   <Text style={styles.seatInfoLabel}>Booked</Text>
// //                   <Text style={[styles.seatInfoValue, { color: '#10B981' }]}>{getActualBookedSeats()}</Text>
// //                 </View>
// //                 <View style={styles.seatDivider} />
// //                 <View style={styles.seatInfoItem}>
// //                   <View style={[styles.seatIconCircle, { backgroundColor: '#FFF3E0' }]}>
// //                     <Ionicons name="person-add" size={24} color="#F59E0B" />
// //                   </View>
// //                   <Text style={styles.seatInfoLabel}>Available</Text>
// //                   <Text style={[styles.seatInfoValue, { color: getActualAvailableSeats() > 0 ? '#F59E0B' : '#DC2626' }]}>
// //                     {getActualAvailableSeats()}
// //                   </Text>
// //                 </View>
// //               </View>
// //               <View style={styles.progressBarContainer}>
// //                 <View style={[styles.progressBar, { width: `${totalSeatsOffered > 0 ? (getActualBookedSeats() / totalSeatsOffered) * 100 : 0}%` }]} />
// //               </View>
// //               <Text style={styles.progressText}>
// //                 {getActualBookedSeats()} out of {totalSeatsOffered} seats booked
// //                 {getActualAvailableSeats() > 0 && ` • ${getActualAvailableSeats()} seats available`}
// //               </Text>
              
// //               {/* Show seat release message if modification was rejected */}
// //               {getActualAvailableSeats() > 0 && bookings.some(b => b.modification_request?.status === 'rejected') && (
// //                 <Text style={styles.seatReleaseMessage}>
// //                   ✨ {getActualAvailableSeats()} seat(s) are now available for new bookings
// //                 </Text>
// //               )}
// //             </View>

// //             {/* Confirmed Bookings - Only shows accepted bookings */}
// //             {confirmedBookings.length > 0 && (
// //               <View style={styles.cardSection}>
// //                 <View style={styles.sectionHeaderWithStatus}>
// //                   <Text style={styles.sectionTitle}>Bookings ✅ ({confirmedBookings.length})</Text>
// //                   {(rideStatus.type === 'auto-cancelled' || rideStatus.type === 'cancelled') && (
// //                     <View style={styles.cancelledBadgeSmall}>
// //                       <Text style={styles.cancelledBadgeSmallText}>Ride Cancelled</Text>
// //                     </View>
// //                   )}
// //                 </View>
                
// //                 {confirmedBookings.map((booking) => {
// //                   const profilePicUrl = booking.profile_picture ? buildImageUrl(booking.profile_picture) : null;
// //                   const isSvg = profilePicUrl ? isSvgUrl(profilePicUrl) : false;
                  
// //                   // Check modification status from the booking object itself
// //                   const hasApprovedModification = booking.modification_request?.status === 'approved';
// //                   const hasPendingModification = booking.modification_request?.status === 'pending';
// //                   const hasRejectedModification = booking.modification_request?.status === 'rejected';
                  
// //                   // Also check from pendingModifications array for backward compatibility
// //                   const hasPendingFromArray = pendingModifications.some(
// //                     pm => pm.booking_id === booking.booking_id && pm.status === 'pending'
// //                   );
// //                   const hasRejectedFromArray = pendingModifications.some(
// //                     pm => pm.booking_id === booking.booking_id && pm.status === 'rejected'
// //                   );
                  
// //                   // Combine both sources
// //                   const isPendingModification = hasPendingModification || hasPendingFromArray;
// //                   const isRejectedModification = hasRejectedModification || hasRejectedFromArray;
// //                   const isApprovedModification = hasApprovedModification;
                  
// //                   // Determine effective seat count
// //                   let effectiveSeatCount = booking.seats_booked || booking.seats_requested || 0;
// //                   let originalSeatCount = effectiveSeatCount;
                  
// //                   if (isApprovedModification) {
// //                     effectiveSeatCount = booking.modification_request?.requested_seats || effectiveSeatCount;
// //                   }
                  
// //                   // Determine rider-specific status
// //                   const isRideCancelled = rideStatus.type === 'auto-cancelled' || rideStatus.type === 'cancelled';
// //                   const isBookingRejected = booking.status === 'rejected';
// //                   const isBookingCancelled = booking.status === 'cancelled';
// //                   const isModificationRejectedBooking = isRejectedModification;
                  
// //                   const showRiderStatus = isRideCancelled || isBookingRejected || isBookingCancelled || isModificationRejectedBooking;
                  
// //                   // Don't show location info if ride is cancelled
// //                   const showLocationInfo = !isRideCancelled && !isBookingRejected && !isBookingCancelled && !isModificationRejectedBooking;
                  
// //                   return (
// //                     <View key={booking.booking_id} style={[
// //                       styles.bookingItem, 
// //                       (showRiderStatus) && styles.disabledBookingItem
// //                     ]}>
// //                       <TouchableOpacity 
// //                         style={styles.passengerAvatar} 
// //                         onPress={() => profilePicUrl && setSelectedProfile({ visible: true, imageUrl: profilePicUrl, name: booking.passenger_name })}
// //                         disabled={showRiderStatus}
// //                       >
// //                         {profilePicUrl && !isSvg ? 
// //                           <Image source={{ uri: profilePicUrl }} style={styles.avatarImage} /> : 
// //                           profilePicUrl && isSvg ? 
// //                             <View style={styles.avatarImageSvg}>
// //                               <SvgCssUri uri={profilePicUrl} width={44} height={44} />
// //                             </View> : 
// //                             <View style={styles.avatarPlaceholder}>
// //                               <Text style={styles.avatarPlaceholderText}>{getInitials(booking.passenger_name)}</Text>
// //                             </View>
// //                         }
// //                       </TouchableOpacity>
                      
// //                       <View style={styles.bookingInfo}>
// //                         <Text style={styles.passengerName}>{booking.passenger_name || 'Passenger'}</Text>
                        
// //                         {/* Show modification status badges */}
// //                         {isPendingModification && !showRiderStatus && (
// //                           <View style={styles.modificationStatusBadge}>
// //                             <Ionicons name="swap" size={12} color="#F59E0B" />
// //                             <Text style={[styles.modificationStatusText, { color: '#F59E0B' }]}>
// //                               Modification Request Pending
// //                             </Text>
// //                           </View>
// //                         )}
                        
// //                         {isApprovedModification && !showRiderStatus && (
// //                           <View style={[styles.modificationStatusBadge, { backgroundColor: '#E8F5E9' }]}>
// //                             <Ionicons name="checkmark-circle" size={12} color="#10B981" />
// //                             <Text style={[styles.modificationStatusText, { color: '#2E7D32' }]}>
// //                               ✅ Seat Updated: {originalSeatCount} → {effectiveSeatCount} seats
// //                             </Text>
// //                           </View>
// //                         )}
                        
// //                         {isRejectedModification && (
// //                           <View style={[styles.modificationStatusBadge, { backgroundColor: '#FEF2F2' }]}>
// //                             <Ionicons name="close-circle" size={12} color="#DC2626" />
// //                             <Text style={[styles.modificationStatusText, { color: '#DC2626' }]}>
// //                               ❌ Booking Cancelled (Modification Rejected)
// //                             </Text>
// //                           </View>
// //                         )}
                        
// //                         {/* Display seat count with strikethrough for rejected modifications */}
// //                         <Text style={[
// //                           styles.bookingSeats,
// //                           isRejectedModification && styles.strikethroughText
// //                         ]}>
// //                           <Ionicons name="people-outline" size={12} color={Colors.gray} /> 
// //                           {isApprovedModification 
// //                             ? `${effectiveSeatCount} seats (was ${originalSeatCount})`
// //                             : `${effectiveSeatCount} seat${effectiveSeatCount > 1 ? 's' : ''}`
// //                           }
// //                           {isRejectedModification && " - CANCELLED"}
// //                         </Text>
                        
// //                         {/* Show rejection reason if available */}
// //                         {isRejectedModification && booking.modification_request?.rejection_reason && (
// //                           <Text style={styles.rejectionReasonText}>
// //                             Reason: {booking.modification_request.rejection_reason}
// //                           </Text>
// //                         )}
                        
// //                         {/* Show walking distance info - only if ride is active and booking not cancelled */}
// //                         {showLocationInfo && booking.pickup_walk_distance_m > 0 && (
// //                           <Text style={styles.walkingInfoText}>
// //                             <Ionicons name="walk" size={10} color="#10B981" /> Pickup: {booking.pickup_walk_distance_m}m walk
// //                           </Text>
// //                         )}
                        
// //                         {showLocationInfo && booking.drop_walk_distance_m > 0 && (
// //                           <Text style={styles.walkingInfoText}>
// //                             <Ionicons name="walk" size={10} color="#F59E0B" /> Dropoff: {booking.drop_walk_distance_m}m walk
// //                           </Text>
// //                         )}
                        
// //                         {/* Show cancellation note for modification rejected */}
// //                         {isRejectedModification && (
// //                           <Text style={styles.cancelledNoteText}>
// //                             ⚠️ This booking was cancelled because the modification request was rejected. {booking.modification_request?.requested_seats || 'Requested'} seats were not available.
// //                           </Text>
// //                         )}
// //                       </View>
                      
// //                       <View style={styles.bookingActions}>
// //                         <View style={[
// //                           styles.bookingStatusBadge, 
// //                           { backgroundColor: isRejectedModification ? '#FEE2E2' : (getStatusColor(booking.status) + '20') }
// //                         ]}>
// //                           <Text style={[
// //                             styles.bookingStatusText, 
// //                             { color: isRejectedModification ? '#DC2626' : getStatusColor(booking.status) }
// //                           ]}>
// //                             {isRejectedModification ? 'Cancelled' : getStatusText(booking.status)}
// //                           </Text>
// //                         </View>
                        
// //                         {/* Only show chat button if ride is active, not cancelled, and booking not cancelled */}
// //                         {!showRiderStatus && rideStatus.type !== 'auto-cancelled' && rideStatus.type !== 'cancelled' && (
// //                           <TouchableOpacity 
// //                             style={styles.chatButton} 
// //                             onPress={() => handleChatWithPassenger(booking.passenger_phone, booking.passenger_name, booking.profile_picture)}
// //                           >
// //                             <Ionicons name="chatbubble-ellipses" size={22} color={Colors.primary} />
// //                           </TouchableOpacity>
// //                         )}
// //                       </View>
// //                     </View>
// //                   );
// //                 })}
                
// //                 {/* Show cancellation note for cancelled rides */}
// //                 {(rideStatus.type === 'auto-cancelled' || rideStatus.type === 'cancelled') && (
// //                   <View style={styles.cancelledNoteContainer}>
// //                     <Ionicons name="information-circle" size={14} color="#9CA3AF" />
// //                     <Text style={styles.cancelledNoteText}>
// //                       These bookings were cancelled due to ride cancellation.
// //                     </Text>
// //                   </View>
// //                 )}
// //               </View>
// //             )}

// //             {/* Pending Modification Requests Section */}
// //             {pendingMods.length > 0 && !areModificationsLocked() && rideStatus.type !== 'auto-cancelled' && rideStatus.type !== 'cancelled' && (
// //               <View style={styles.cardSection}>
// //                 <Text style={[styles.sectionTitle, { color: '#F59E0B' }]}>Modification Requests ⏳ ({pendingMods.length})</Text>
// //                 {pendingMods.map((modRequest) => {
// //                   const booking = bookings.find(b => b.booking_id === modRequest.booking_id);
// //                   if (!booking) return null;
                  
// //                   return (
// //                     <View key={modRequest.id} style={styles.modificationRequestItem}>
// //                       <View style={styles.modificationRequestHeader}>
// //                         <Ionicons name="swap" size={20} color="#F59E0B" />
// //                         <Text style={styles.modificationRequestTitle}>Seat Change Request</Text>
// //                       </View>
// //                       <Text style={styles.modificationRequestRider}>Rider: {booking.passenger_name || 'Passenger'}</Text>
// //                       <View style={styles.modificationSeatChange}>
// //                         <Text style={styles.currentSeats}>{modRequest.current_seats} seats</Text>
// //                         <Ionicons name="arrow-forward" size={16} color="#F59E0B" />
// //                         <Text style={styles.requestedSeats}>{modRequest.requested_seats} seats</Text>
// //                       </View>
// //                       <View style={styles.modificationActions}>
// //                         <TouchableOpacity 
// //                           style={[styles.modActionBtn, styles.approveModBtn]} 
// //                           onPress={() => handleModificationAction(modRequest.id, 'approve', modRequest.requested_seats, modRequest.current_seats, booking.booking_id, booking.passenger_name)}
// //                         >
// //                           <Ionicons name="checkmark" size={16} color="#fff" />
// //                           <Text style={styles.modActionBtnText}>Approve</Text>
// //                         </TouchableOpacity>
// //                         <TouchableOpacity 
// //                           style={[styles.modActionBtn, styles.rejectModBtn]} 
// //                           onPress={() => handleModificationAction(modRequest.id, 'reject', modRequest.requested_seats, modRequest.current_seats, booking.booking_id, booking.passenger_name)}
// //                         >
// //                           <Ionicons name="close" size={16} color="#fff" />
// //                           <Text style={styles.modActionBtnText}>Reject & Cancel Booking</Text>
// //                         </TouchableOpacity>
// //                       </View>
// //                       <Text style={styles.modificationWarning}>
// //                         ⚠️ Rejecting will cancel the original {modRequest.current_seats} seat booking
// //                       </Text>
// //                     </View>
// //                   );
// //                 })}
// //               </View>
// //             )}

// //             {/* Pending Bookings */}
// //             {pendingBookings.length > 0 && !areModificationsLocked() && rideStatus.type !== 'auto-cancelled' && rideStatus.type !== 'cancelled' && (
// //               <View style={styles.cardSection}>
// //                 <Text style={[styles.sectionTitle, { color: '#F59E0B' }]}>Pending Requests ⏳ ({pendingBookings.length})</Text>
// //                 {pendingBookings.map((booking) => {
// //                   const profilePicUrl = booking.profile_picture ? buildImageUrl(booking.profile_picture) : null;
// //                   const isSvg = profilePicUrl ? isSvgUrl(profilePicUrl) : false;
// //                   return (
// //                     <View key={booking.booking_id} style={styles.bookingItem}>
// //                       <TouchableOpacity style={styles.passengerAvatar} onPress={() => profilePicUrl && setSelectedProfile({ visible: true, imageUrl: profilePicUrl, name: booking.passenger_name })}>
// //                         {profilePicUrl && !isSvg ? <Image source={{ uri: profilePicUrl }} style={styles.avatarImage} /> : profilePicUrl && isSvg ? <View style={styles.avatarImageSvg}><SvgCssUri uri={profilePicUrl} width={44} height={44} /></View> : <View style={styles.avatarPlaceholder}><Text style={styles.avatarPlaceholderText}>{getInitials(booking.passenger_name)}</Text></View>}
// //                       </TouchableOpacity>
// //                       <View style={styles.bookingInfo}>
// //                         <Text style={styles.passengerName}>{booking.passenger_name || 'Passenger'}</Text>
// //                         <Text style={styles.bookingSeats}><Ionicons name="people-outline" size={12} color={Colors.gray} /> {booking.seats_booked} seat{booking.seats_booked > 1 ? 's' : ''}</Text>
// //                       </View>
// //                       <View style={styles.pendingActions}>
// //                         <TouchableOpacity style={[styles.actionSmallBtn, styles.acceptBtn]} onPress={() => handleBookingAction(booking.booking_id, 'accept')}>
// //                           <Ionicons name="checkmark" size={16} color="#fff" />
// //                         </TouchableOpacity>
// //                         <TouchableOpacity style={[styles.actionSmallBtn, styles.rejectBtn]} onPress={() => handleBookingAction(booking.booking_id, 'reject')}>
// //                           <Ionicons name="close" size={16} color="#fff" />
// //                         </TouchableOpacity>
// //                       </View>
// //                     </View>
// //                   );
// //                 })}
// //               </View>
// //             )}

// //             {/* Action Buttons */}
// //             {!isOngoing && !isCompleted && showStartRide && rideStatus.type !== 'auto-cancelled' && rideStatus.type !== 'cancelled' && (
// //               <>
// //                 <View style={styles.actionButtonsRow}>
// //                   <TouchableOpacity style={styles.editButton} onPress={handleEditRide}>
// //                     <Ionicons name="create-outline" size={18} color={Colors.primary} />
// //                     <Text style={styles.editButtonText}>Edit Ride</Text>
// //                   </TouchableOpacity>
// //                   <TouchableOpacity style={styles.cancelButton} onPress={handleCancelRide}>
// //                     <Ionicons name="close-circle-outline" size={18} color="#DC2626" />
// //                     <Text style={styles.cancelButtonText}>Cancel Ride</Text>
// //                   </TouchableOpacity>
// //                 </View>
// //                 <TouchableOpacity style={styles.startRideButton} onPress={handleStartRide}>
// //                   <Ionicons name="car-sport" size={20} color="#fff" />
// //                   <Text style={styles.startRideButtonText}>Start Ride Now</Text>
// //                 </TouchableOpacity>
// //               </>
// //             )}

// //             {/* Ongoing Ride Button */}
// //             {showLiveSession && (
// //               <TouchableOpacity style={styles.liveSessionButton} onPress={() => navigation.navigate('OngoingRideDriverScreen', { rideId: ride?.id, sessionId: ride?.live_session?.session_id })}>
// //                 <Ionicons name="navigate-circle" size={20} color="#fff" />
// //                 <Text style={styles.liveSessionButtonText}>Continue Ongoing Ride</Text>
// //               </TouchableOpacity>
// //             )}

// //             <View style={styles.safetyCard}>
// //               <View style={styles.simpleInfoLeft}>
// //                 <Ionicons name="shield-checkmark-outline" size={20} color="#2457A6" />
// //                 <View>
// //                   <Text style={styles.safetyTitle}>Safety First</Text>
// //                   <Text style={styles.safetySub}>Live GPS tracking & 24/7 support</Text>
// //                 </View>
// //               </View>
// //             </View>
// //             <View style={{ height: 110 }} />
// //           </ScrollView>
// //         )}
// //       </Animated.View>

// //       {/* Conflict Resolution Modal */}
// //       <Modal visible={conflictModalVisible} transparent animationType="fade">
// //         <View style={styles.modalBackdrop}>
// //           <View style={styles.conflictModalContent}>
// //             <View style={styles.conflictModalHeader}>
// //               <Ionicons name="alert-circle" size={48} color="#F59E0B" />
// //               <Text style={styles.conflictModalTitle}>Driver's Choice Required</Text>
// //             </View>
// //             <Text style={styles.conflictModalMessage}>There are two requests for this ride. Please choose which one to accept.</Text>
// //             {conflictData?.modification_request && (
// //               <View style={styles.conflictRequestCard}>
// //                 <View style={styles.conflictRequestHeader}>
// //                   <Ionicons name="swap" size={24} color="#F59E0B" />
// //                   <Text style={styles.conflictRequestTitle}>Modification Request</Text>
// //                 </View>
// //                 <Text style={styles.conflictRequestDetails}>
// //                   <Text style={{ fontWeight: 'bold' }}>Rider:</Text> {conflictData.modification_request.passenger_name}
// //                 </Text>
// //                 <Text style={styles.conflictRequestDetails}>
// //                   <Text style={{ fontWeight: 'bold' }}>Seats:</Text> {conflictData.modification_request.current_seats} → {conflictData.modification_request.requested_seats}
// //                 </Text>
// //               </View>
// //             )}
// //             {conflictData?.booking_request && (
// //               <View style={styles.conflictRequestCard}>
// //                 <View style={styles.conflictRequestHeader}>
// //                   <Ionicons name="person-add" size={24} color="#10B981" />
// //                   <Text style={styles.conflictRequestTitle}>New Booking Request</Text>
// //                 </View>
// //                 <Text style={styles.conflictRequestDetails}>
// //                   <Text style={{ fontWeight: 'bold' }}>Rider:</Text> {conflictData.booking_request.passenger_name}
// //                 </Text>
// //                 <Text style={styles.conflictRequestDetails}>
// //                   <Text style={{ fontWeight: 'bold' }}>Seats:</Text> {conflictData.booking_request.seats_requested} seat(s)
// //                 </Text>
// //               </View>
// //             )}
// //             <Text style={styles.conflictModalSeatsInfo}>
// //               Available seats: {conflictData?.available_seats} / {conflictData?.total_seats}
// //             </Text>
// //             <View style={styles.conflictModalButtons}>
// //               {conflictData?.modification_request && (
// //                 <TouchableOpacity 
// //                   style={[styles.conflictModalBtn, styles.approveModBtn]} 
// //                   onPress={() => resolveConcurrentRequest('modification', conflictData.modification_request.id, null)} 
// //                   disabled={resolvingConflict}
// //                 >
// //                   <Text style={styles.conflictModalBtnText}>
// //                     {resolvingConflict ? 'Processing...' : 'Accept Modification'}
// //                   </Text>
// //                 </TouchableOpacity>
// //               )}
// //               {conflictData?.booking_request && (
// //                 <TouchableOpacity 
// //                   style={[styles.conflictModalBtn, styles.acceptBtn]} 
// //                   onPress={() => resolveConcurrentRequest('booking', null, conflictData.booking_request.id)} 
// //                   disabled={resolvingConflict}
// //                 >
// //                   <Text style={styles.conflictModalBtnText}>
// //                     {resolvingConflict ? 'Processing...' : 'Accept Booking'}
// //                   </Text>
// //                 </TouchableOpacity>
// //               )}
// //             </View>
// //             <TouchableOpacity style={styles.conflictModalCloseBtn} onPress={() => setConflictModalVisible(false)}>
// //               <Text style={styles.conflictModalCloseBtnText}>Close</Text>
// //             </TouchableOpacity>
// //           </View>
// //         </View>
// //       </Modal>

// //       {/* Rating Modal */}
// //       <Modal visible={ratingModalVisible} transparent animationType="fade">
// //         <View style={styles.modalBackdrop}>
// //           <View style={styles.modalCard}>
// //             <Text style={styles.modalTitle}>Rate Your Rider</Text>
// //             <Text style={styles.modalSub}>How was your ride with {selectedRider?.passenger_name || 'this rider'}?</Text>
// //             {renderStars()}
// //             <TextInput 
// //               value={feedback} 
// //               onChangeText={setFeedback} 
// //               placeholder="Share your feedback (optional)" 
// //               multiline 
// //               numberOfLines={3} 
// //               style={styles.feedbackInput} 
// //               textAlignVertical="top" 
// //             />
// //             <View style={styles.modalActions}>
// //               <TouchableOpacity style={styles.skipBtn} onPress={() => setRatingModalVisible(false)}>
// //                 <Text style={styles.skipBtnText}>Cancel</Text>
// //               </TouchableOpacity>
// //               <TouchableOpacity 
// //                 style={[styles.submitBtn, rating === 0 && { opacity: 0.5 }]} 
// //                 onPress={submitRiderRating} 
// //                 disabled={rating === 0}
// //               >
// //                 <Text style={styles.submitBtnText}>Submit Rating</Text>
// //               </TouchableOpacity>
// //             </View>
// //           </View>
// //         </View>
// //       </Modal>

// //       <ProfileImageModal 
// //         visible={selectedProfile.visible} 
// //         imageUrl={selectedProfile.imageUrl} 
// //         name={selectedProfile.name} 
// //         onClose={() => setSelectedProfile({ visible: false, imageUrl: null, name: '' })} 
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


// // // Styles remain the same as your existing styles...
// // const styles = StyleSheet.create({
// //   // ... (keep all your existing styles)
// //   container: { flex: 1, backgroundColor: '#F4F5F7' },
// //   mapContainer: { width: '100%', overflow: 'hidden', backgroundColor: '#E8EEF7', position: 'relative' },
// //   map: { flex: 1, backgroundColor: '#E8EEF7' },
// //   mapBackButton: { position: 'absolute', top: Platform.OS === 'ios' ? 54 : 22, left: 14, width: 42, height: 42, borderRadius: 25, backgroundColor: 'rgba(255,255,255,0.96)', alignItems: 'center', justifyContent: 'center', shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4, elevation: 3 },
// //   mapLegend: { position: 'absolute', bottom: 10, right: 10, backgroundColor: 'rgba(255,255,255,0.95)', borderRadius: 12, padding: 10, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4, elevation: 3, minWidth: 120 },
// //   legendTitle: { marginBottom: 6, paddingBottom: 4, borderBottomWidth: 1, borderBottomColor: '#E5E7EB' },
// //   legendTitleText: { fontSize: 11, fontWeight: '700', color: '#333' },
// //   legendItem: { flexDirection: 'row', alignItems: 'center', marginBottom: 4 },
// //   legendColor: { width: 16, height: 4, borderRadius: 2, marginRight: 6 },
// //   legendDot: { width: 10, height: 10, borderRadius: 5, marginRight: 8 },
// //   legendText: { fontSize: 10, color: '#555' },
// //   mapControls: { position: 'absolute', bottom: 10, left: 10 },
// //   mapControlButton: { backgroundColor: 'rgba(255,255,255,0.95)', width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center', shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4, elevation: 3 },
// //   customMarker: { alignItems: 'center', justifyContent: 'center', borderWidth: 2, borderColor: '#fff', shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.25, shadowRadius: 4, elevation: 5, position: 'relative' },
// //   markerBadge: { position: 'absolute', top: -5, right: -5, backgroundColor: '#fff', borderRadius: 10, minWidth: 18, height: 18, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: '#10B981' },
// //   markerBadgeText: { fontSize: 10, fontWeight: 'bold', color: '#10B981' },
// //   walkBadge: { position: 'absolute', bottom: -8, left: '50%', transform: [{ translateX: -15 }], flexDirection: 'row', alignItems: 'center', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 10, gap: 2 },
// //   walkBadgeText: { fontSize: 8, color: '#fff', fontWeight: 'bold' },
// //   drawer: { position: 'absolute', bottom: 0, left: 0, right: 0, backgroundColor: '#F4F5F7', borderTopLeftRadius: 28, borderTopRightRadius: 28, overflow: 'hidden', shadowColor: '#000', shadowOffset: { width: 0, height: -2 }, shadowOpacity: 0.1, shadowRadius: 8, elevation: 10 },
// //   handleWrap: { alignItems: 'center', paddingTop: 10, paddingBottom: 8, backgroundColor: '#F4F5F7', position: 'relative' },
// //   handleHitArea: { paddingHorizontal: 40, paddingVertical: 10, alignItems: 'center', justifyContent: 'center' },
// //   handleBar: { width: 64, height: 6, borderRadius: 99, backgroundColor: '#CDD2D8' },
// //   pendingNotificationBadge: { position: 'absolute', right: 20, top: 8, backgroundColor: '#F59E0B', borderRadius: 12, paddingHorizontal: 8, paddingVertical: 2 },
// //   pendingNotificationText: { color: '#fff', fontSize: 12, fontWeight: 'bold' },
// //   collapsedSummary: { paddingHorizontal: 16, paddingTop: 4, paddingBottom: 12 },
// //   collapsedTopRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: 12 },
// //   collapsedDriver: { fontSize: 16, fontWeight: '800', color: Colors.dark },
// //   collapsedSub: { marginTop: 2, fontSize: 12, color: Colors.gray, fontWeight: '600' },
// //   collapsedPriceWrap: { alignItems: 'flex-end' },
// //   collapsedPrice: { fontSize: 18, fontWeight: '900', color: Colors.dark },
// //   collapsedPerSeat: { fontSize: 10, color: Colors.gray, fontWeight: '600' },
// //   collapsedTripInfo: { marginTop: 6, paddingTop: 6, borderTopWidth: 1, borderTopColor: '#EEF2F7' },
// //   collapsedTripText: { fontSize: 11, color: '#6B7280' },
// //   drawerScroll: { flex: 1 },
// //   drawerContent: { paddingHorizontal: 16, paddingBottom: 16 },
// //   statusBanner: { flexDirection: 'row', alignItems: 'flex-start', padding: 12, borderRadius: 12, marginBottom: 14, gap: 8 },
// //   statusBannerText: { fontSize: 13, fontWeight: '700', flex: 1 },
// //   statusBannerReason: { fontSize: 11, marginTop: 4, opacity: 0.8 },
// //   cancellationDetailedBanner: { backgroundColor: '#FEF2F2', borderRadius: 16, padding: 16, marginBottom: 14, borderWidth: 1, borderColor: '#FEE2E2' },
// //   cancellationHeader: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 12 },
// //   cancellationTitle: { fontSize: 16, fontWeight: '700', color: '#DC2626' },
// //   cancellationMessage: { fontSize: 13, color: '#7F1D1D', lineHeight: 18, marginBottom: 8 },
// //   cancelledByText: { fontSize: 11, color: '#9CA3AF', fontStyle: 'italic' },
// //   tripOverviewCard: { backgroundColor: '#EAF1FF', borderRadius: 20, padding: 16, marginBottom: 14 },
// //   tripOverviewHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 12 },
// //   tripOverviewTitle: { fontSize: 16, fontWeight: '800', color: '#2457A6' },
// //   tripOverviewDetails: { marginBottom: 12 },
// //   tripOverviewItem: { marginBottom: 8 },
// //   tripOverviewLabel: { fontSize: 11, color: '#6B7280', marginBottom: 2 },
// //   tripOverviewValue: { fontSize: 14, fontWeight: '600', color: Colors.dark },
// //   tripOverviewArrow: { alignItems: 'center', marginVertical: 4 },
// //   tripOverviewStats: { flexDirection: 'row', flexWrap: 'wrap', gap: 12, paddingTop: 12, borderTopWidth: 1, borderTopColor: '#CDD9F0' },
// //   tripOverviewStat: { flexDirection: 'row', alignItems: 'center', gap: 4 },
// //   tripOverviewStatText: { fontSize: 12, color: '#6B7280' },
// //   cardSection: { backgroundColor: 'white', borderRadius: 20, padding: 16, marginBottom: 14, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 8, elevation: 2 },
// //   sectionTitle: { fontSize: 16, fontWeight: '800', color: Colors.dark, marginBottom: 0 },
// //   timelineHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
// //   timelineHeaderLeft: { flexDirection: 'row', alignItems: 'center', gap: 8, flex: 1 },
// //   timelineStopCount: { fontSize: 12, color: Colors.gray, fontWeight: '500', marginLeft: 4 },
// //   timelineContainer: { marginTop: 16 },
// //   timelineItemCard: { flexDirection: 'row', marginBottom: 20 },
// //   timelineItemLeft: { width: 40, alignItems: 'center', position: 'relative' },
// //   timelineItemDot: { width: 32, height: 32, borderRadius: 16, alignItems: 'center', justifyContent: 'center', borderWidth: 2, borderColor: '#fff', shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.1, shadowRadius: 2, elevation: 2 },
// //   timelineItemIcon: { fontSize: 16 },
// //   timelineItemLine: { width: 2, flex: 1, marginVertical: 4 },
// //   timelineItemRight: { flex: 1, paddingLeft: 12, paddingBottom: 8 },
// //   timelineItemHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 },
// //   timelineItemType: { fontSize: 11, fontWeight: '700', color: '#6B7280', letterSpacing: 0.5 },
// //   segmentBadge: { backgroundColor: '#F3F4F6', paddingHorizontal: 8, paddingVertical: 2, borderRadius: 10 },
// //   segmentBadgeText: { fontSize: 10, color: '#6B7280', fontWeight: '500' },
// //   timelineItemTitle: { fontSize: 15, fontWeight: '700', color: Colors.dark, marginBottom: 6 },
// //   timelineItemDetails: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 6 },
// //   detailChip: { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: '#F3F4F6', paddingHorizontal: 8, paddingVertical: 3, borderRadius: 12 },
// //   detailChipText: { fontSize: 11, color: '#6B7280' },
// //   timelineItemAddress: { fontSize: 12, color: '#6B7280', marginBottom: 8, lineHeight: 16 },
// //   walkingChip: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 10, paddingVertical: 5, borderRadius: 16, alignSelf: 'flex-start', marginBottom: 8 },
// //   walkingChipText: { fontSize: 11, fontWeight: '500' },
// //   routeInfo: { flexDirection: 'row', flexWrap: 'wrap', gap: 12, marginBottom: 10, paddingTop: 6, borderTopWidth: 1, borderTopColor: '#F0F0F0' },
// //   routeInfoItem: { flexDirection: 'row', alignItems: 'center', gap: 4 },
// //   routeInfoText: { fontSize: 11, color: '#6B7280' },
// //   navigateButton: { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: '#EAF1FF', paddingHorizontal: 12, paddingVertical: 8, borderRadius: 20, alignSelf: 'flex-start' },
// //   navigateButtonText: { fontSize: 12, color: '#2457A6', fontWeight: '600' },
// //   vehicleHeaderRow: { flexDirection: 'row', alignItems: 'center' },
// //   vehicleIconCircle: { width: 48, height: 48, borderRadius: 24, backgroundColor: '#EAF1FF', alignItems: 'center', justifyContent: 'center', marginRight: 12 },
// //   vehicleMeta: { flex: 1 },
// //   vehicleTitle: { fontSize: 16, fontWeight: '800', color: Colors.dark },
// //   vehicleRegContainer: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 6, paddingTop: 6, borderTopWidth: 1, borderTopColor: '#F0F0F0' },
// //   vehicleRegText: { fontSize: 11, color: '#6B7280', fontWeight: '500' },
// //   seatInfoContainer: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
// //   seatInfoItem: { flex: 1, alignItems: 'center' },
// //   seatIconCircle: { width: 48, height: 48, borderRadius: 24, alignItems: 'center', justifyContent: 'center', marginBottom: 8 },
// //   seatInfoLabel: { fontSize: 11, color: Colors.gray, textAlign: 'center' },
// //   seatInfoValue: { fontSize: 18, fontWeight: '800', color: Colors.dark, marginTop: 2 },
// //   seatDivider: { width: 1, height: 50, backgroundColor: '#E5E7EB' },
// //   progressBarContainer: { height: 6, backgroundColor: '#E5E7EB', borderRadius: 3, overflow: 'hidden', marginBottom: 8 },
// //   progressBar: { height: '100%', backgroundColor: '#10B981', borderRadius: 3 },
// //   progressText: { fontSize: 12, color: Colors.gray, textAlign: 'center' },
// //   startRideButton: { backgroundColor: '#10B981', borderRadius: 14, paddingVertical: 14, alignItems: 'center', justifyContent: 'center', flexDirection: 'row', gap: 8, marginBottom: 12 },
// //   startRideButtonText: { color: '#fff', fontSize: 16, fontWeight: '700' },
// //   liveSessionButton: { backgroundColor: Colors.primary, borderRadius: 14, paddingVertical: 14, alignItems: 'center', justifyContent: 'center', flexDirection: 'row', gap: 8, marginBottom: 12 },
// //   liveSessionButtonText: { color: '#fff', fontSize: 16, fontWeight: '700' },
// //   actionButtonsRow: { flexDirection: 'row', gap: 10, marginBottom: 14 },
// //   editButton: { flex: 1, borderWidth: 1, borderColor: Colors.primary, borderRadius: 14, paddingVertical: 12, alignItems: 'center', justifyContent: 'center', flexDirection: 'row', gap: 6, backgroundColor: '#fff' },
// //   editButtonText: { color: Colors.primary, fontSize: 14, fontWeight: '600' },
// //   cancelButton: { flex: 1, borderWidth: 1, borderColor: '#DC2626', borderRadius: 14, paddingVertical: 12, alignItems: 'center', justifyContent: 'center', flexDirection: 'row', gap: 6, backgroundColor: '#fff' },
// //   cancelButtonText: { color: '#DC2626', fontSize: 14, fontWeight: '600' },
// //   bookingItem: { flexDirection: 'row', alignItems: 'center', paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: '#EEF2F7' },
// //   passengerAvatar: { width: 44, height: 44, borderRadius: 22, overflow: 'hidden', marginRight: 12 },
// //   avatarImage: { width: 44, height: 44, borderRadius: 22, resizeMode: 'cover' },
// //   avatarImageSvg: { width: 44, height: 44, borderRadius: 22, overflow: 'hidden', alignItems: 'center', justifyContent: 'center', backgroundColor: '#E5E7EB' },
// //   avatarPlaceholder: { width: 44, height: 44, borderRadius: 22, backgroundColor: '#E5E7EB', alignItems: 'center', justifyContent: 'center' },
// //   avatarPlaceholderText: { fontSize: 16, fontWeight: '700', color: Colors.primary },
// //   bookingInfo: { flex: 1 },
// //   passengerName: { fontSize: 15, fontWeight: '600', color: Colors.dark },
// //   bookingSeats: { fontSize: 12, color: Colors.gray, marginTop: 2, flexDirection: 'row', alignItems: 'center' },
// //   walkingInfoText: { fontSize: 10, color: '#6B7280', marginTop: 2, flexDirection: 'row', alignItems: 'center' },
// //   bookingStatusBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12 },
// //   bookingStatusText: { fontSize: 11, fontWeight: '600' },
// //   bookingActions: { flexDirection: 'row', alignItems: 'center', gap: 12 },
// //   chatButton: { padding: 8, backgroundColor: '#EFF6FF', borderRadius: 20, alignItems: 'center', justifyContent: 'center' },
// //   pendingActions: { flexDirection: 'row', gap: 8 },
// //   actionSmallBtn: { width: 36, height: 36, borderRadius: 18, alignItems: 'center', justifyContent: 'center' },
// //   acceptBtn: { backgroundColor: '#10B981' },
// //   rejectBtn: { backgroundColor: '#EF4444' },
// //   simpleInfoLeft: { flexDirection: 'row', alignItems: 'center', gap: 12 },
// //   safetyCard: { backgroundColor: '#FFF3E7', borderRadius: 18, padding: 16, marginBottom: 14 },
// //   safetyTitle: { fontSize: 14, color: '#2457A6', fontWeight: '800' },
// //   safetySub: { marginTop: 2, fontSize: 12, color: '#2457A6', opacity: 0.9, fontWeight: '600' },
// //   modalBackdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center' },
// //   modalCard: { backgroundColor: '#fff', borderRadius: 24, padding: 20, alignItems: 'center', width: width - 40 },
// //   modalTitle: { fontSize: 22, fontWeight: '700', color: '#111827', textAlign: 'center', marginTop: 12 },
// //   modalSub: { fontSize: 14, color: '#6B7280', textAlign: 'center', marginTop: 8, marginBottom: 18 },
// //   starsRow: { flexDirection: 'row', justifyContent: 'center', marginBottom: 18 },
// //   feedbackInput: { minHeight: 100, borderWidth: 1, borderColor: '#E5E7EB', borderRadius: 16, padding: 14, color: '#111827', fontSize: 14, width: '100%', textAlignVertical: 'top' },
// //   modalActions: { flexDirection: 'row', gap: 10, marginTop: 18, width: '100%' },
// //   skipBtn: { flex: 1, borderWidth: 1, borderColor: '#D1D5DB', borderRadius: 999, paddingVertical: 14, alignItems: 'center' },
// //   skipBtnText: { color: '#6B7280', fontWeight: '600' },
// //   submitBtn: { flex: 1, backgroundColor: Colors.primary, borderRadius: 999, paddingVertical: 14, alignItems: 'center' },
// //   submitBtnText: { color: '#fff', fontWeight: '700' },
// //   imageModalContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', width: '100%' },
// //   imageModalContent: { width: '90%', backgroundColor: Colors.white, borderRadius: 20, overflow: 'hidden', maxHeight: '80%' },
// //   imageModalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 16, borderBottomWidth: 1, borderBottomColor: '#EEF2F7' },
// //   imageModalTitle: { fontSize: 18, fontWeight: '700', color: Colors.dark },
// //   fullProfileImage: { width: '100%', height: 400, backgroundColor: '#F5F5F5' },
// //   modalSvgContainer: { width: '100%', height: 400, backgroundColor: '#F5F5F5', alignItems: 'center', justifyContent: 'center' },
// //   noImageContainer: { width: '100%', height: 400, justifyContent: 'center', alignItems: 'center', backgroundColor: '#F5F5F5' },
// //   noImageText: { fontSize: 16, color: Colors.gray },
// //   conflictModalContent: { backgroundColor: "#fff", borderRadius: 24, padding: 20, width: "90%", maxHeight: "85%" },
// //   conflictModalHeader: { alignItems: "center", marginBottom: 16 },
// //   conflictModalTitle: { fontSize: 20, fontWeight: "700", color: Colors.dark, marginTop: 12, textAlign: "center" },
// //   conflictModalMessage: { fontSize: 14, color: Colors.gray, textAlign: "center", marginBottom: 20, lineHeight: 20 },
// //   conflictRequestCard: { backgroundColor: "#F9FAFB", borderRadius: 16, padding: 16, marginBottom: 12, borderWidth: 1, borderColor: "#E5E7EB" },
// //   conflictRequestHeader: { flexDirection: "row", alignItems: "center", gap: 12, marginBottom: 12 },
// //   conflictRequestTitle: { fontSize: 16, fontWeight: "700", color: Colors.dark },
// //   conflictRequestDetails: { fontSize: 14, color: "#4B5563", marginBottom: 4 },
// //   conflictModalSeatsInfo: { fontSize: 13, color: Colors.gray, textAlign: "center", marginBottom: 20, fontWeight: "600" },
// //   conflictModalButtons: { flexDirection: "row", gap: 12, marginBottom: 12 },
// //   conflictModalBtn: { flex: 1, paddingVertical: 14, borderRadius: 12, alignItems: "center" },
// //   conflictModalBtnText: { color: "#fff", fontWeight: "700", fontSize: 14 },
// //   conflictModalCloseBtn: { paddingVertical: 12, alignItems: "center", borderRadius: 12, backgroundColor: "#F3F4F6" },
// //   conflictModalCloseBtnText: { color: Colors.dark, fontWeight: "600" },
// //   approveModBtn: { backgroundColor: "#F59E0B" },
// //   sectionHeaderWithStatus: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
// //   cancelledBadgeSmall: { backgroundColor: '#F3F4F6', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12 },
// //   cancelledBadgeSmallText: { fontSize: 11, color: '#6B7280', fontWeight: '600' },
// //   disabledBookingItem: { opacity: 0.7, backgroundColor: '#F9FAFB' },
// //   cancelledNoteContainer: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#F3F4F6', padding: 10, borderRadius: 8, marginTop: 12, gap: 8 },
// //   cancelledNoteText: { fontSize: 11, color: '#6B7280', flex: 1 },
// //   earningsBanner: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#E8F5E9', borderRadius: 16, padding: 16, marginBottom: 14, borderWidth: 1, borderColor: '#C8E6C9' },
// //   earningsBannerLeft: { flexDirection: 'row', alignItems: 'center', gap: 12 },
// //   earningsIconContainer: { width: 48, height: 48, borderRadius: 24, backgroundColor: '#10B981', alignItems: 'center', justifyContent: 'center' },
// //   earningsLabel: { fontSize: 14, color: '#2E7D32', fontWeight: '600', marginBottom: 2 },
// //   earningsSubLabel: { fontSize: 11, color: '#66BB6A' },
// //   earningsAmountContainer: { flexDirection: 'row', alignItems: 'baseline' },
// //   earningsCurrency: { fontSize: 18, color: '#10B981', fontWeight: '700', marginRight: 2 },
// //   earningsAmount: { fontSize: 28, color: '#10B981', fontWeight: '800' },
// //   earningsBreakdownCard: { backgroundColor: 'white', borderRadius: 20, padding: 16, marginBottom: 14, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 8, elevation: 2 },
// //   earningsBreakdownTitle: { fontSize: 16, fontWeight: '800', color: Colors.dark, marginBottom: 14 },
// //   earningsRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: '#F0F0F0' },
// //   earningsRowLeft: { flexDirection: 'row', alignItems: 'center', gap: 12 },
// //   earningsRowAvatar: { width: 36, height: 36, borderRadius: 18, backgroundColor: '#EAF1FF', alignItems: 'center', justifyContent: 'center' },
// //   earningsRowInitials: { fontSize: 14, fontWeight: '700', color: '#2457A6' },
// //   earningsRowName: { fontSize: 14, fontWeight: '600', color: Colors.dark },
// //   earningsRowSeats: { fontSize: 11, color: Colors.gray, marginTop: 2 },
// //   earningsRowAmount: { fontSize: 16, fontWeight: '700', color: '#10B981' },
// //   earningsDivider: { height: 1, backgroundColor: '#E5E7EB', marginVertical: 12 },
// //   earningsTotalRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingTop: 4 },
// //   earningsTotalLabel: { fontSize: 16, fontWeight: '700', color: Colors.dark },
// //   earningsTotalAmount: { fontSize: 20, fontWeight: '800', color: '#10B981' },
// //   modificationStatusBadge: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 12, backgroundColor: '#FEF3C7', alignSelf: 'flex-start', gap: 6, marginTop: 4, marginBottom: 4 },
// //   modificationStatusText: { fontSize: 10, fontWeight: '600' },
// //   modificationRequestItem: { backgroundColor: '#FEF3C7', borderRadius: 16, padding: 14, marginBottom: 12, borderWidth: 1, borderColor: '#FDE68A' },
// //   modificationRequestHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 10 },
// //   modificationRequestTitle: { fontSize: 14, fontWeight: '700', color: '#92400E' },
// //   modificationRequestRider: { fontSize: 13, color: '#78350F', marginBottom: 8 },
// //   modificationSeatChange: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 12 },
// //   currentSeats: { fontSize: 14, color: '#DC2626', textDecorationLine: 'line-through' },
// //   requestedSeats: { fontSize: 14, color: '#10B981', fontWeight: 'bold' },
// //   modificationActions: { flexDirection: 'row', gap: 10, marginBottom: 8 },
// //   modActionBtn: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 10, borderRadius: 10, gap: 6 },
// //   modActionBtnText: { color: '#fff', fontSize: 13, fontWeight: '600' },
// //   modificationWarning: { fontSize: 10, color: '#DC2626', fontStyle: 'italic' },
// //   strikethroughText: {
// //     textDecorationLine: 'line-through',
// //     color: '#DC2626',
// //   },
// //   rejectionReasonText: {
// //     fontSize: 10,
// //     color: '#DC2626',
// //     fontStyle: 'italic',
// //     marginTop: 2,
// //   },
// //   rejectedModificationWarning: {
// //     flexDirection: 'row',
// //     alignItems: 'center',
// //     backgroundColor: '#FEF2F2',
// //     padding: 10,
// //     borderRadius: 8,
// //     marginBottom: 12,
// //     gap: 8,
// //   },
// //   rejectedModificationWarningText: {
// //     fontSize: 11,
// //     color: '#DC2626',
// //     flex: 1,
// //   },
// //   seatReleaseMessage: {
// //     fontSize: 11,
// //     color: '#10B981',
// //     textAlign: 'center',
// //     marginTop: 8,
// //     fontWeight: '500',
// //   },
// //   });
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
//   LogBox,
//   TextInput,
//   Alert,
//   Linking
// } from 'react-native';
// import MapView, { Marker, Polyline, PROVIDER_GOOGLE, Circle } from 'react-native-maps';
// import { Ionicons } from '@expo/vector-icons';
// import { SvgCssUri } from 'react-native-svg/css';
// import { Colors } from '../constants/Colors';
// import { useAuth } from '../context/AuthContext';
// import { API_BASE_URL, GMAP_API_KEY } from '../config/config_ip';
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

// function getInitials(name) {
//   if (!name) return 'D';
//   const parts = name.trim().split(' ').filter(Boolean);
//   if (parts.length > 1) return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
//   return parts[0].slice(0, 2).toUpperCase();
// }

// function isSvgUrl(url) {
//   if (!url) return false;
//   return url.toLowerCase().includes('.svg') || url.toLowerCase().includes('.svg?');
// }

// function parseRouteCoordinates(routeCoordinates) {
//   if (!routeCoordinates) return [];
//   if (!Array.isArray(routeCoordinates)) return [];
//   if (routeCoordinates.length === 0) return [];
  
//   return routeCoordinates.map((item) => {
//     if (Array.isArray(item) && item.length === 2) {
//       const lng = Number(item[0]);
//       const lat = Number(item[1]);
//       if (!isNaN(lng) && !isNaN(lat)) {
//         return { longitude: lng, latitude: lat };
//       }
//     }
//     if (item && typeof item === 'object') {
//       const lng = Number(item.longitude || item.lng);
//       const lat = Number(item.latitude || item.lat);
//       if (!isNaN(lng) && !isNaN(lat)) {
//         return { longitude: lng, latitude: lat };
//       }
//     }
//     return null;
//   }).filter(Boolean);
// }

// function ProfileImageModal({ visible, imageUrl, name, onClose }) {
//   const [imageError, setImageError] = useState(false);
//   const isSvg = imageUrl ? isSvgUrl(imageUrl) : false;
  
//   useEffect(() => {
//     if (visible) {
//       setImageError(false);
//     }
//   }, [visible, imageUrl]);
  
//   if (!visible) return null;
  
//   return (
//     <Modal visible={visible} transparent={true} animationType="fade" onRequestClose={onClose}>
//       <TouchableOpacity style={styles.modalBackdrop} activeOpacity={1} onPress={onClose}>
//         <View style={styles.imageModalContainer}>
//           <View style={styles.imageModalContent}>
//             <View style={styles.imageModalHeader}>
//               <Text style={styles.imageModalTitle}>{name || 'Profile'}</Text>
//               <TouchableOpacity onPress={onClose}>
//                 <Ionicons name="close" size={24} color={Colors.dark} />
//               </TouchableOpacity>
//             </View>
//             {imageUrl && !imageError ? (
//               isSvg ? (
//                 <View style={styles.modalSvgContainer}>
//                   <SvgCssUri uri={imageUrl} width="100%" height={400} />
//                 </View>
//               ) : (
//                 <Image 
//                   source={{ uri: imageUrl }} 
//                   style={styles.fullProfileImage} 
//                   resizeMode="contain"
//                   onError={() => setImageError(true)}
//                 />
//               )
//             ) : (
//               <View style={styles.noImageContainer}>
//                 <Ionicons name="person-circle-outline" size={80} color={Colors.gray} />
//                 <Text style={styles.noImageText}>No profile picture available</Text>
//               </View>
//             )}
//           </View>
//         </View>
//       </TouchableOpacity>
//     </Modal>
//   );
// }

// export default function ViewRoutePostedScreen({ navigation, route }) {
//   const { user } = useAuth();
//   const { ride } = route.params || {};
//   const prevBookedSeatsRef = useRef(0);

//   const [drawerExpanded, setDrawerExpanded] = useState(true);
//   const [mapReady, setMapReady] = useState(false);
//   const [bookings, setBookings] = useState([]);
//   const [loadingBookings, setLoadingBookings] = useState(false);
//   const [pendingModifications, setPendingModifications] = useState([]);
//   const [refreshKey, setRefreshKey] = useState(0);
//   const [pollingInterval, setPollingInterval] = useState(null);
//   const [modifyingRequest, setModifyingRequest] = useState(false);
//   const [ratingModalVisible, setRatingModalVisible] = useState(false);
//   const [selectedRider, setSelectedRider] = useState(null);
//   const [rating, setRating] = useState(0);
//   const [feedback, setFeedback] = useState('');
//   const [currentSessionId, setCurrentSessionId] = useState(null);
//   const [conflictModalVisible, setConflictModalVisible] = useState(false);
//   const [conflictData, setConflictData] = useState(null);
//   const [resolvingConflict, setResolvingConflict] = useState(false);
//   const [totalEarnings, setTotalEarnings] = useState(0);
//   const [showCompletionBanner, setShowCompletionBanner] = useState(false);
//   const [timelineExpanded, setTimelineExpanded] = useState(false);
//   const [selectedStopIndex, setSelectedStopIndex] = useState(null);
  
//   // Address geocoding states
//   const [addressCache, setAddressCache] = useState({});
//   const [loadingAddresses, setLoadingAddresses] = useState(false);
//   const [addressFetchProgress, setAddressFetchProgress] = useState({ current: 0, total: 0 });
  
//   const animatedDrawer = useRef(new Animated.Value(1)).current;
//   const mapRef = useRef(null);
//   const socketRef = useRef(null);
//   const scrollViewRef = useRef(null);
  
//   const [selectedProfile, setSelectedProfile] = useState({
//     visible: false,
//     imageUrl: null,
//     name: '',
//   });
  
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
//     const timeText = date.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", hour12: false });
//     return `${dayText}, ${timeText}`;
//   };
  
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

//   const showConfirmationAlert = (title, message, onConfirm) => {
//     setAlertConfig({
//       title,
//       message,
//       icon: "warning",
//       iconColor: "#F59E0B",
//       buttons: [
//         { text: 'Cancel', onPress: () => setAlertVisible(false), style: 'cancel' },
//         { text: 'Confirm', onPress: () => { setAlertVisible(false); onConfirm(); }, style: 'destructive' }
//       ]
//     });
//     setAlertVisible(true);
//   };

//   // CRITICAL FIX: Function to calculate actual booked seats excluding rejected modifications
//   const getActualBookedSeats = useCallback(() => {
//     if (!bookings || !Array.isArray(bookings)) return 0;
    
//     // Track bookings that have rejected modifications
//     const rejectedBookingIds = new Set();
    
//     // First, check pendingModifications for rejected ones
//     pendingModifications.forEach(mod => {
//       if (mod.status === 'rejected') {
//         rejectedBookingIds.add(mod.booking_id);
//         console.log(`❌ Rejected modification for booking ${mod.booking_id} - will be excluded`);
//       }
//     });
    
//     let totalBooked = 0;
    
//     bookings.forEach(bookingItem => {
//       // Skip cancelled bookings
//       if (bookingItem.status === 'cancelled') {
//         console.log(`  ❌ Excluding booking ${bookingItem.booking_id} - status is CANCELLED`);
//         return;
//       }
      
//       // Skip rejected bookings
//       if (bookingItem.status === 'rejected') {
//         console.log(`  ❌ Excluding booking ${bookingItem.booking_id} - status is REJECTED`);
//         return;
//       }
      
//       // CRITICAL: Skip if this booking has a rejected modification
//       if (rejectedBookingIds.has(bookingItem.booking_id)) {
//         console.log(`  ❌ Excluding booking ${bookingItem.booking_id} - rejected modification exists`);
//         return;
//       }
      
//       // Also check modification_request in booking object
//       if (bookingItem.modification_request?.status === 'rejected') {
//         console.log(`  ❌ Excluding booking ${bookingItem.booking_id} - rejected modification in booking object`);
//         return;
//       }
      
//       // Only count accepted bookings
//       if (bookingItem.status === 'accepted') {
//         let seatCount = bookingItem.seats_booked || bookingItem.seats_requested || 0;
        
//         // If modification was approved, use the new seat count
//         if (bookingItem.modification_request?.status === 'approved') {
//           seatCount = bookingItem.modification_request.requested_seats || seatCount;
//           console.log(`  ✅ Booking ${bookingItem.booking_id}: approved modification, seats=${seatCount}`);
//         } else {
//           console.log(`  ✅ Booking ${bookingItem.booking_id}: accepted, seats=${seatCount}`);
//         }
//         totalBooked += seatCount;
//       }
//     });
    
//     console.log(`📊 Total booked seats: ${totalBooked}`);
//     return totalBooked;
//   }, [bookings, pendingModifications]);

//   const getActualAvailableSeats = useCallback(() => {
//     const totalSeats = ride?.available_seats || 0;
//     const bookedSeats = getActualBookedSeats();
//     return Math.max(0, totalSeats - bookedSeats);
//   }, [ride?.available_seats, getActualBookedSeats]);

//   const fetchBookings = useCallback(async () => {
//     if (!ride?.id) return;
//     setLoadingBookings(true);
//     try {
//       const response = await fetch(`${API_BASE_URL}/ride/${ride.id}/passengers?_t=${Date.now()}`);
//       const data = await response.json();
//       console.log('🔍 RAW API Response:', JSON.stringify(data, null, 2));

//       if (data.passengers && Array.isArray(data.passengers)) {
//         const processedPassengers = data.passengers.map(passenger => ({
//           ...passenger,
//           driver_rating_given: passenger.driver_rating_given === true || passenger.driver_rating_given === 1,
//           driver_rating: passenger.driver_rating || 0,
//           driver_feedback: passenger.driver_feedback || '',
//           modification_request: passenger.modification_request || null,
//         }));
        
//         // Log any rejected modifications
//         const rejectedMods = processedPassengers.filter(p => p.modification_request?.status === 'rejected');
//         if (rejectedMods.length > 0) {
//           console.log('🔴 Found rejected modifications:', rejectedMods.map(r => ({
//             id: r.booking_id,
//             name: r.passenger_name,
//             status: r.modification_request?.status,
//             seats: r.seats_booked
//           })));
//         }
        
//         setBookings(processedPassengers);
        
//         // Calculate earnings only from actually accepted bookings
//         const activeAcceptedBookings = processedPassengers.filter(p => 
//           p.status === 'accepted' && 
//           p.modification_request?.status !== 'rejected'
//         );
        
//         if (ride?.status === "completed" || ride?.completed_at) {
//           const earnings = activeAcceptedBookings
//             .reduce((sum, p) => {
//               let seatCount = p.seats_booked || p.seats_requested || 0;
//               if (p.modification_request?.status === 'approved') {
//                 seatCount = p.modification_request.requested_seats || seatCount;
//               }
//               return sum + (p.total_amount || seatCount * (ride?.price_per_seat || 0));
//             }, 0);
//           setTotalEarnings(earnings);
//         }
//       } else {
//         setBookings([]);
//       }
//     } catch (error) {
//       console.log('Error fetching bookings:', error);
//       setBookings([]);
//     } finally {
//       setLoadingBookings(false);
//     }
//   }, [ride?.id, ride?.status, ride?.price_per_seat]);

//   // Google Maps Geocoding Function
//   const getAddressFromCoordsGoogle = async (lat, lng) => {
//     const cacheKey = `${lat},${lng}`;
    
//     if (addressCache[cacheKey]) {
//       return addressCache[cacheKey];
//     }
    
//     try {
//       const url = `https://maps.googleapis.com/maps/api/geocode/json?latlng=${lat},${lng}&key=${GMAP_API_KEY}&language=en`;
//       const response = await fetch(url);
//       const data = await response.json();
      
//       if (data.status === 'OK' && data.results && data.results[0]) {
//         const formattedAddress = data.results[0].formatted_address;
//         setAddressCache(prev => ({ ...prev, [cacheKey]: formattedAddress }));
//         return formattedAddress;
//       } else {
//         return `${lat.toFixed(4)}, ${lng.toFixed(4)}`;
//       }
//     } catch (error) {
//       console.log('Geocoding error:', error);
//       return `${lat.toFixed(4)}, ${lng.toFixed(4)}`;
//     }
//   };

//   // Fetch addresses for all bookings
//   const fetchAllAddresses = useCallback(async () => {
//     const confirmedBookings = bookings.filter(b => b.status === 'accepted' && b.modification_request?.status !== 'rejected');
//     if (confirmedBookings.length === 0) return;
    
//     const coordinatesToFetch = [];
    
//     confirmedBookings.forEach(booking => {
//       const pickupLat = booking.intersection_pickup_lat || booking.pickup_lat;
//       const pickupLon = booking.intersection_pickup_lon || booking.pickup_lon;
//       if (pickupLat && pickupLon) {
//         const key = `${pickupLat},${pickupLon}`;
//         if (!addressCache[key] && !coordinatesToFetch.find(c => c.key === key)) {
//           coordinatesToFetch.push({ key, lat: pickupLat, lng: pickupLon, type: 'pickup', bookingId: booking.booking_id, riderName: booking.passenger_name });
//         }
//       }
      
//       const dropLat = booking.intersection_drop_lat || booking.drop_lat;
//       const dropLon = booking.intersection_drop_lon || booking.drop_lon;
//       if (dropLat && dropLon) {
//         const key = `${dropLat},${dropLon}`;
//         if (!addressCache[key] && !coordinatesToFetch.find(c => c.key === key)) {
//           coordinatesToFetch.push({ key, lat: dropLat, lng: dropLon, type: 'dropoff', bookingId: booking.booking_id, riderName: booking.passenger_name });
//         }
//       }
//     });
    
//     if (coordinatesToFetch.length === 0) return;
    
//     setLoadingAddresses(true);
//     setAddressFetchProgress({ current: 0, total: coordinatesToFetch.length });
    
//     const batchSize = 5;
//     for (let i = 0; i < coordinatesToFetch.length; i += batchSize) {
//       const batch = coordinatesToFetch.slice(i, i + batchSize);
//       await Promise.all(batch.map(async (coord) => {
//         const address = await getAddressFromCoordsGoogle(coord.lat, coord.lng);
//         setAddressFetchProgress(prev => ({ ...prev, current: prev.current + 1 }));
//         return address;
//       }));
      
//       if (i + batchSize < coordinatesToFetch.length) {
//         await new Promise(resolve => setTimeout(resolve, 200));
//       }
//     }
    
//     setLoadingAddresses(false);
//   }, [bookings, addressCache]);

//   // Direct check for modification status
//   const checkModificationStatusDirectly = useCallback(async (bookingId) => {
//     try {
//       console.log(`🔍 Directly checking modification for booking ${bookingId}...`);
//       const response = await fetch(`${API_BASE_URL}/booking/${bookingId}/modification-request?_t=${Date.now()}`);
//       const data = await response.json();
//       console.log(`📝 Direct API response for booking ${bookingId}:`, data);
//       return data;
//     } catch (error) {
//       console.log(`Error checking modification for booking ${bookingId}:`, error);
//       return null;
//     }
//   }, []);

//   const fetchModificationStatusForAllBookings = useCallback(async () => {
//     if (!bookings.length) {
//       console.log('No bookings to check modification status for');
//       return;
//     }
    
//     console.log('🔍 Fetching modification status for all bookings...');
    
//     const updatedBookings = [...bookings];
//     let hasChanges = false;
    
//     for (let i = 0; i < updatedBookings.length; i++) {
//       const booking = updatedBookings[i];
//       try {
//         const response = await fetch(`${API_BASE_URL}/booking/${booking.booking_id}/modification-request?_t=${Date.now()}`);
//         const data = await response.json();
        
//         console.log(`📝 Booking ${booking.booking_id} API response:`, JSON.stringify(data, null, 2));
        
//         if (data.request && data.request.id) {
//           console.log(`📝 Booking ${booking.booking_id}: modification status = ${data.request.status}`);
          
//           if (data.request.status === 'rejected') {
//             console.log(`❌❌❌ Booking ${booking.booking_id} has REJECTED modification - MARKING AS CANCELLED!`);
//             updatedBookings[i] = {
//               ...booking,
//               modification_request: data.request,
//               status: 'cancelled',
//               seats_booked: 0
//             };
//             hasChanges = true;
//           } else if (data.request.status === 'approved') {
//             console.log(`✅ Booking ${booking.booking_id} has APPROVED modification`);
//             updatedBookings[i] = {
//               ...booking,
//               modification_request: data.request,
//               seats_booked: data.request.requested_seats
//             };
//             hasChanges = true;
//           } else if (data.request.status === 'pending') {
//             console.log(`⏳ Booking ${booking.booking_id} has PENDING modification`);
//             updatedBookings[i] = {
//               ...booking,
//               modification_request: data.request
//             };
//             hasChanges = true;
//           }
//         } else {
//           console.log(`📝 Booking ${booking.booking_id}: No modification request found`);
//         }
//       } catch (error) {
//         console.log(`Error fetching modification for booking ${booking.booking_id}:`, error);
//       }
//     }
    
//     if (hasChanges) {
//       console.log('✅ Updating bookings with modification status');
//       setBookings(updatedBookings);
//       // Force re-calculation of available seats
//       setRefreshKey(prev => prev + 1);
//     } else {
//       console.log('No changes to bookings from modification status check');
//     }
//   }, [bookings]);

//   useEffect(() => {
//     if (bookings.length > 0) {
//       fetchModificationStatusForAllBookings();
//       fetchAllAddresses();
//     }
//   }, [bookings.length]);

//   const fetchPendingModifications = useCallback(async () => {
//     if (!ride?.id) return;
//     try {
//       const response = await fetch(`${API_BASE_URL}/ride/${ride.id}/pending-modifications?_t=${Date.now()}`);
//       const data = await response.json();
      
//       if (data.pending_requests && Array.isArray(data.pending_requests)) {
//         const latestPerBooking = new Map();
        
//         data.pending_requests.forEach(request => {
//           const bookingId = request.booking_id;
//           const existing = latestPerBooking.get(bookingId);
          
//           if (!existing || new Date(request.created_at) > new Date(existing.created_at)) {
//             latestPerBooking.set(bookingId, request);
//           }
//         });
        
//         const uniqueRequests = Array.from(latestPerBooking.values());
        
//         // Check if any requests changed status
//         const hasChanges = uniqueRequests.length !== pendingModifications.length ||
//           uniqueRequests.some(newReq => {
//             const oldReq = pendingModifications.find(r => r.id === newReq.id);
//             return oldReq && oldReq.status !== newReq.status;
//           });
        
//         if (hasChanges) {
//           console.log('📝 Pending modifications changed, updating...');
//           setPendingModifications(uniqueRequests);
          
//           // If any modifications were rejected, refresh bookings
//           const rejectedMods = uniqueRequests.filter(r => r.status === 'rejected');
//           if (rejectedMods.length > 0) {
//             console.log('🔴 Found rejected modifications in pending list, refreshing bookings...');
//             fetchBookings();
//           }
//         }
        
//         if (uniqueRequests.length > 0 && !drawerExpanded) {
//           setDrawerExpanded(true);
//         }
//       } else {
//         setPendingModifications([]);
//       }
//     } catch (error) {
//       console.log('Error fetching pending modifications:', error);
//       setPendingModifications([]);
//     }
//   }, [ride?.id, drawerExpanded, pendingModifications, fetchBookings]);

//   const checkForConcurrentRequests = useCallback(async () => {
//     if (!ride?.id) return;
//     try {
//       const response = await fetch(`${API_BASE_URL}/ride/${ride.id}/concurrent-requests?_t=${Date.now()}`);
//       const data = await response.json();
      
//       if (data.has_concurrent_requests) {
//         setConflictData(data);
//         setConflictModalVisible(true);
//       }
//     } catch (error) {
//       console.log('Error checking concurrent requests:', error);
//     }
//   }, [ride?.id]);

//   const resolveConcurrentRequest = async (choice, modificationRequestId, bookingId) => {
//     if (!conflictData) return;
    
//     setResolvingConflict(true);
//     try {
//       const response = await fetch(`${API_BASE_URL}/ride/${conflictData.ride.id}/resolve-concurrent-requests`, {
//         method: 'POST',
//         headers: { 'Content-Type': 'application/json' },
//         body: JSON.stringify({
//           choice: choice,
//           modification_request_id: modificationRequestId,
//           booking_id: bookingId,
//           driver_phone: user?.phone_number
//         })
//       });
      
//       const data = await response.json();
      
//       if (data.success) {
//         showCustomAlert('Success', data.message, 'success');
//         setConflictModalVisible(false);
//         fetchBookings();
//         fetchPendingModifications();
//       } else {
//         showCustomAlert('Error', data.message || 'Failed to process request', 'error');
//         fetchBookings();
//         fetchPendingModifications();
//       }
//     } catch (error) {
//       console.error('Resolve concurrent request error:', error);
//       showCustomAlert('Error', 'Failed to resolve concurrent requests', 'error');
//       fetchBookings();
//       fetchPendingModifications();
//     } finally {
//       setResolvingConflict(false);
//     }
//   };

//   const areModificationsLocked = () => {
//     const now = new Date();
//     const departureTime = new Date(ride?.departure_time);
//     const minutesToDeparture = (departureTime - now) / (1000 * 60);
//     return minutesToDeparture <= 15 && minutesToDeparture > -30 && !ride?.started_at;
//   };

//   // Enhanced ride status display with proper cancellation reasons
//   const getRideStatusDisplay = () => {
//     const now = new Date();
//     const departureTime = new Date(ride?.departure_time);
//     const minutesToDeparture = (departureTime - now) / (1000 * 60);
//     const minutesSinceDeparture = (now - departureTime) / (1000 * 60);
//     const hoursSinceDeparture = (now - departureTime) / (1000 * 60 * 60);
    
//     // Check for cancellation first
//     if (ride?.cancellation_reason) {
//       if (ride.cancellation_reason.includes("Auto-cancelled") || ride.cancellation_reason.includes("auto-cancel")) {
//         return { 
//           text: "Auto-cancelled", 
//           color: "#9CA3AF", 
//           icon: "timer-off", 
//           type: "auto-cancelled",
//           reason: ride.cancellation_reason || "Ride was automatically cancelled as it was not started within 2 hours of departure time."
//         };
//       }
//       return { 
//         text: "Cancelled", 
//         color: "#DC2626", 
//         icon: "close-circle", 
//         type: "cancelled",
//         reason: ride.cancellation_reason
//       };
//     }
    
//     // Check for auto-cancel after 2 hours past departure
//     if (hoursSinceDeparture > 2 && !ride?.started_at && ride?.status !== "completed") {
//       return { 
//         text: "Auto-cancelled", 
//         color: "#9CA3AF", 
//         icon: "timer-off", 
//         type: "auto-cancelled",
//         reason: "Ride auto-cancelled as it was not started within 2 hours of departure time."
//       };
//     }
    
//     if (ride?.status === "completed" || ride?.completed_at) {
//       return { text: "Completed", color: "#6B7280", icon: "checkmark-done", type: "completed" };
//     }
    
//     if (ride?.started_at && ride?.status !== "completed") {
//       return { text: "Ongoing", color: "#10B981", icon: "car-sport", type: "ongoing" };
//     }
    
//     if (minutesSinceDeparture > 0 && minutesSinceDeparture <= 120) {
//       return { text: "Late - Start Now", color: "#EF4444", icon: "alert-circle", type: "late" };
//     }
    
//     if (minutesToDeparture <= 60 && minutesToDeparture > 15) {
//       return { text: "Start Soon", color: "#F59E0B", icon: "time-outline", type: "start-soon" };
//     }
    
//     if (minutesToDeparture <= 15 && minutesToDeparture > 0) {
//       return { text: "Active", color: "#10B981", icon: "checkmark-circle", type: "active" };
//     }
    
//     if (minutesToDeparture > 60) {
//       return { text: "Upcoming", color: "#2457A6", icon: "calendar-outline", type: "upcoming" };
//     }
    
//     return { text: "Upcoming", color: "#2457A6", icon: "calendar-outline", type: "upcoming" };
//   };

//   // Socket connection setup
//   useEffect(() => {
//     if (!ride?.id) return;
    
//     const socket = io(API_BASE_URL, {
//       transports: ['websocket', 'polling'],
//       reconnection: true,
//       reconnectionAttempts: 10,
//       reconnectionDelay: 1000,
//       timeout: 10000,
//       path: '/socket.io'
//     });
    
//     socketRef.current = socket;
    
//     socket.on('connect', () => {
//       console.log('Socket connected for driver ride updates');
//       socket.emit('join-ride-room', ride.id);
      
//       if (user?.phone_number) {
//         socket.emit('join-user-room', user.phone_number);
//       }
//     });
    
//     socket.on('connect_error', (error) => {
//       console.log('Socket connection error:', error.message);
//     });
    
//     socket.on('seats-released', (data) => {
//       console.log('Seats released event received:', data);
//       if (data.ride_id === ride.id) {
//         showCustomAlert('Seats Available', data.message || `${data.seats_released} seat(s) are now available for this ride.`, 'info');
//         fetchBookings();
//         fetchPendingModifications();
//         setRefreshKey(prev => prev + 1);
//       }
//     });
    
//     socket.on('disconnect', (reason) => {
//       console.log('Socket disconnected:', reason);
//       if (reason === 'io server disconnect') {
//         setTimeout(() => {
//           if (socketRef.current) {
//             socketRef.current.connect();
//           }
//         }, 1000);
//       }
//     });
    
//     socket.on('reconnect', () => {
//       console.log('Socket reconnected');
//       if (ride?.id) {
//         socket.emit('join-ride-room', ride.id);
//       }
//     });
    
//     socket.on('new-modification-request', (data) => {
//       console.log('New modification request received:', data);
//       if (data.ride_id === ride.id) {
//         showCustomAlert('New Modification Request', `${data.passenger_name} wants to change from ${data.current_seats} to ${data.requested_seats} seat(s)`, 'info');
//         fetchPendingModifications();
//         fetchBookings();
//         checkForConcurrentRequests();
//       }
//     });
    
//     socket.on('modification-rejected', (data) => {
//       console.log('Modification rejected event received:', data);
//       if (data.ride_id === ride.id) {
//         setPendingModifications(prev => 
//           prev.map(mod => 
//             mod.id === data.request_id 
//               ? { ...mod, status: 'rejected' }
//               : mod
//           )
//         );
        
//         showCustomAlert('Modification Rejected', 
//           `The modification request for ${data.passenger_name || 'a passenger'} was rejected. The original booking has been cancelled and seats are now available.`, 
//           'warning');
        
//         fetchBookings();
//         fetchPendingModifications();
//         checkForConcurrentRequests();
//       }
//     });

//     socket.on('modification-response', (data) => {
//       console.log('Modification response received:', data);
//       if (data.ride_id === ride.id) {
//         setPendingModifications(prev => 
//           prev.map(mod => 
//             mod.id === data.request_id 
//               ? { ...mod, status: data.action === 'approved' ? 'approved' : 'rejected' }
//               : mod
//           )
//         );
        
//         if (data.action === 'approved') {
//           showCustomAlert('Modification Approved', `You approved seat change for ${data.passenger_name || 'passenger'}`, 'success');
//         } else {
//           showCustomAlert('Modification Rejected', 
//             `You rejected the seat change request. The original booking has been CANCELLED and seats released.`, 
//             'warning');
//         }
        
//         fetchPendingModifications();
//         fetchBookings();
//         checkForConcurrentRequests();
//       }
//     });
    
//     socket.on('booking-update', (data) => {
//       console.log('Booking update received:', data);
//       if (data.ride_id === ride.id) {
//         fetchBookings();
//         checkForConcurrentRequests();
//       }
//     });
    
//     socket.on('rider-reached-pickup', (data) => {
//       console.log('Rider reached pickup:', data);
//       showCustomAlert('Rider Arrived', `${data.rider_name || 'A rider'} has reached the pickup location`, 'info');
//     });
    
//     socket.on('rider-boarded', (data) => {
//       console.log('Rider boarded:', data);
//       showCustomAlert('Rider Boarded', `${data.rider_name || 'A rider'} has boarded the vehicle`, 'success');
//       fetchBookings();
//     });
    
//     socket.on('rider-dropped-off', (data) => {
//       console.log('Rider dropped off:', data);
//       showCustomAlert('Rider Dropped Off', `${data.rider_name || 'A rider'} has been dropped off`, 'info');
//       fetchBookings();
//     });
    
//     socket.on('concurrent-requests-detected', (data) => {
//       console.log('Concurrent requests detected:', data);
//       if (data.ride_id === ride.id) {
//         checkForConcurrentRequests();
//       }
//     });
    
//     socket.on('ride-completed', (data) => {
//       console.log('Ride completed event:', data);
//       if (data.ride_id === ride.id) {
//         setShowCompletionBanner(true);
//         showCustomAlert('Ride Completed', 'This ride has been successfully completed!', 'success');
//         fetchBookings();
//         setTimeout(() => {
//           setShowCompletionBanner(false);
//         }, 5000);
//       }
//     });
    
//     socket.on('ride-auto-cancelled', (data) => {
//       console.log('Ride auto-cancelled event:', data);
//       if (data.ride_id === ride.id) {
//         const reason = data.reason || "Ride was auto-cancelled as it was not started within 2 hours of departure time.";
//         showCustomAlert('Ride Auto-Cancelled', reason, 'warning');
//         fetchBookings();
//         setRefreshKey(prev => prev + 1);
//       }
//     });
    
//     const interval = setInterval(() => {
//       fetchPendingModifications();
//     }, 10000);
    
//     setPollingInterval(interval);
    
//     return () => {
//       if (interval) clearInterval(interval);
//       if (socketRef.current) {
//         socketRef.current.emit('leave-ride-room', ride.id);
//         socketRef.current.disconnect();
//         socketRef.current = null;
//       }
//     };
//   }, [ride?.id, user?.phone_number, checkForConcurrentRequests, fetchPendingModifications, fetchBookings]);

//   useFocusEffect(
//     useCallback(() => {
//       fetchBookings();
//       fetchPendingModifications();
//       checkForConcurrentRequests();
//       setRefreshKey(prev => prev + 1);
//       return () => {};
//     }, [fetchBookings, fetchPendingModifications, checkForConcurrentRequests])
//   );

//   const handleBookingAction = async (bookingId, action) => {
//     showConfirmationAlert(`${action === "accept" ? "Accept" : "Reject"} Request`, `Are you sure you want to ${action} this booking request?`, async () => {
//       try {
//         const response = await fetch(`${API_BASE_URL}/booking/${bookingId}/${action}`, {
//           method: 'PUT',
//           headers: { 'Content-Type': 'application/json' },
//         });
//         const data = await response.json();
        
//         if (!response.ok) throw new Error(data.detail || `Failed to ${action} booking`);
        
//         showCustomAlert('Success', `Booking ${action}ed successfully`, 'success');
//         fetchBookings();
        
//         if (socketRef.current) {
//           socketRef.current.emit('booking-status-changed', {
//             ride_id: ride.id,
//             booking_id: bookingId,
//             status: action
//           });
//         }
//       } catch (error) {
//         showCustomAlert('Error', error.message, 'error');
//       }
//     });
//   };

//   // CRITICAL FIX: Handle modification action with proper cancellation
//   const handleModificationAction = async (requestId, action, requestedSeats, currentSeats, bookingId, passengerName) => {
//     const actionText = action === 'approve' ? 'approve' : 'reject';
//     const message = action === 'approve' 
//       ? `Are you sure you want to approve the seat change request from ${currentSeats} to ${requestedSeats} seats for ${passengerName}?`
//       : `⚠️ WARNING: Rejecting this modification will CANCEL the original booking of ${currentSeats} seat(s) for ${passengerName}. The seats will be released. Are you sure?`;
    
//     showConfirmationAlert(`${action === 'approve' ? 'Approve' : 'Reject'} Modification`, message, async () => {
//       try {
//         const url = `${API_BASE_URL}/api/v1/modifications/${requestId}/${action}`;
//         const response = await fetch(url, { method: 'PUT' });
//         const data = await response.json();
        
//         if (!response.ok) throw new Error(data.detail || `Failed to ${action} modification`);
        
//         // Update pendingModifications state
//         setPendingModifications(prev => 
//           prev.map(mod => 
//             mod.id === requestId 
//               ? { ...mod, status: action === 'approve' ? 'approved' : 'rejected' }
//               : mod
//           )
//         );
        
//         if (action === 'reject') {
//           // CRITICAL: Update bookings - mark as cancelled
//           setBookings(prevBookings => 
//             prevBookings.map(booking => 
//               booking.booking_id === bookingId 
//                 ? { 
//                     ...booking, 
//                     status: 'cancelled',
//                     seats_booked: 0,
//                     modification_request: {
//                       status: 'rejected',
//                       current_seats: currentSeats,
//                       requested_seats: requestedSeats,
//                       rejection_reason: data.rejection_reason || 'Modification request rejected'
//                     }
//                   }
//                 : booking
//             )
//           );
          
//           showCustomAlert('Modification Rejected', 
//             `The modification request was rejected. The original booking for ${currentSeats} seat(s) has been CANCELLED and ${currentSeats} seat(s) are now available.`, 
//             'warning');
//         } else {
//           // Update approved modification seat count
//           setBookings(prevBookings => 
//             prevBookings.map(booking => 
//               booking.booking_id === bookingId 
//                 ? { 
//                     ...booking, 
//                     seats_booked: requestedSeats,
//                     modification_request: {
//                       ...booking.modification_request,
//                       status: 'approved',
//                       requested_seats: requestedSeats
//                     }
//                   }
//                 : booking
//             )
//           );
          
//           showCustomAlert('Success', 
//             `Modification request approved successfully. Seats updated from ${currentSeats} to ${requestedSeats}.`, 
//             'success');
//         }
        
//         // Force immediate refresh
//         setRefreshKey(prev => prev + 1);
        
//         // Then refresh from server
//         setTimeout(() => {
//           fetchBookings();
//           fetchPendingModifications();
//           checkForConcurrentRequests();
//         }, 500);
        
//         if (socketRef.current) {
//           socketRef.current.emit('modification-response', {
//             ride_id: ride.id,
//             request_id: requestId,
//             action: action,
//             booking_id: bookingId
//           });
//         }
        
//       } catch (error) {
//         console.error('Modification action error:', error);
//         showCustomAlert('Error', error.message, 'error');
//       }
//     });
//   };

//   const handleRateRider = async (booking, sessionId) => {
//     let effectiveSessionId = sessionId || ride?.live_session?.session_id;
    
//     if (!effectiveSessionId) {
//       try {
//         const response = await fetch(`${API_BASE_URL}/booking/${booking.booking_id}/session`);
//         const data = await response.json();
        
//         if (data.session_id) {
//           effectiveSessionId = data.session_id;
//         }
//       } catch (error) {
//         console.log('Error fetching session from booking:', error);
//       }
//     }
    
//     if (!effectiveSessionId) {
//       showCustomAlert('Error', 'Cannot rate rider: No session found for this ride', 'error');
//       return;
//     }
    
//     setSelectedRider(booking);
//     setCurrentSessionId(effectiveSessionId);
//     setRating(0);
//     setFeedback('');
//     setRatingModalVisible(true);
//   };

//   const submitRiderRating = async () => {
//     if (!selectedRider) return;
//     if (rating === 0) {
//       showCustomAlert('Rating Required', 'Please select a rating before submitting', 'warning');
//       return;
//     }
    
//     setModifyingRequest(true);
//     try {
//       const sessionId = currentSessionId;
//       if (!sessionId) {
//         throw new Error('No session ID found');
//       }
      
//       const requestBody = {
//         booking_id: selectedRider.booking_id,
//         rating: rating,
//         feedback: typeof feedback === 'string' ? feedback : String(feedback || ''),
//       };
      
//       const response = await fetch(`${API_BASE_URL}/ride-sessions/${sessionId}/rate-rider`, {
//         method: 'POST',
//         headers: { 'Content-Type': 'application/json' },
//         body: JSON.stringify(requestBody),
//       });
      
//       const data = await response.json();
      
//       if (!response.ok) {
//         if (response.status === 400 && data.detail?.includes('already')) {
//           showCustomAlert('Already Rated', 'You have already rated this rider', 'info');
//           setRatingModalVisible(false);
//           setSelectedRider(null);
//           setCurrentSessionId(null);
//           setRating(0);
//           setFeedback('');
//           await fetchBookings();
//           return;
//         }
//         throw new Error(data.detail || 'Failed to submit rating');
//       }
      
//       setRatingModalVisible(false);
//       setRating(0);
//       setFeedback('');
//       setSelectedRider(null);
//       setCurrentSessionId(null);
      
//       showCustomAlert('Rating Submitted', `You rated ${selectedRider.passenger_name || 'the rider'} ${rating} stars!`, 'success');
//       await fetchBookings();
      
//     } catch (error) {
//       console.error('Rating error:', error);
//       showCustomAlert('Error', error.message || 'Could not submit rating', 'error');
//     } finally {
//       setModifyingRequest(false);
//     }
//   };

//   const renderStars = () => (
//     <View style={styles.starsRow}>
//       {[1, 2, 3, 4, 5].map((star) => (
//         <TouchableOpacity key={star} onPress={() => setRating(star)}>
//           <Ionicons
//             name={star <= rating ? 'star' : 'star-outline'}
//             size={32}
//             color={star <= rating ? '#F59E0B' : '#D1D5DB'}
//             style={{ marginHorizontal: 4 }}
//           />
//         </TouchableOpacity>
//       ))}
//     </View>
//   );

//   // Get driver start coordinates
//   const driverStart = useMemo(() => {
//     if (ride?.origin_lat && ride?.origin_lon) {
//       return { latitude: Number(ride.origin_lat), longitude: Number(ride.origin_lon) };
//     }
//     if (ride?.origin_coords && Array.isArray(ride.origin_coords) && ride.origin_coords.length === 2) {
//       return { longitude: Number(ride.origin_coords[0]), latitude: Number(ride.origin_coords[1]) };
//     }
//     const routeCoords = parseRouteCoordinates(ride?.routeCoordinates);
//     if (routeCoords.length > 0) return routeCoords[0];
//     return null;
//   }, [ride]);

//   // Get driver end coordinates
//   const driverEnd = useMemo(() => {
//     if (ride?.destination_lat && ride?.destination_lon) {
//       return { latitude: Number(ride.destination_lat), longitude: Number(ride.destination_lon) };
//     }
//     if (ride?.destination_coords && Array.isArray(ride.destination_coords) && ride.destination_coords.length === 2) {
//       return { longitude: Number(ride.destination_coords[0]), latitude: Number(ride.destination_coords[1]) };
//     }
//     const routeCoords = parseRouteCoordinates(ride?.routeCoordinates);
//     if (routeCoords.length > 0) return routeCoords[routeCoords.length - 1];
//     return null;
//   }, [ride]);

//   const formatDateTime = (dateString) => {
//     if (!dateString) return '';
//     const date = new Date(dateString);
//     if (isNaN(date.getTime())) return '';
//     return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false });
//   };

//   const routePath = useMemo(() => {
//     const fullRoute = parseRouteCoordinates(ride?.routeCoordinates);
//     if (fullRoute.length >= 2) return fullRoute;
//     if (driverStart && driverEnd) return [driverStart, driverEnd];
//     return [];
//   }, [ride, driverStart, driverEnd]);

//   // Calculate distance between two coordinates (in km)
//   const calculateDistance = (lat1, lon1, lat2, lon2) => {
//     const R = 6371;
//     const dLat = (lat2 - lat1) * Math.PI / 180;
//     const dLon = (lon2 - lon1) * Math.PI / 180;
//     const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
//               Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
//               Math.sin(dLon/2) * Math.sin(dLon/2);
//     const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
//     return R * c;
//   };

//   // Calculate estimated travel time between points (in minutes)
//   const calculateTravelTime = (distanceKm, avgSpeedKmh = 40) => {
//     const timeHours = distanceKm / avgSpeedKmh;
//     const timeMinutes = Math.round(timeHours * 60);
//     return timeMinutes;
//   };

//   // Format duration display
//   const formatDuration = (minutes) => {
//     if (minutes < 60) return `${minutes} min`;
//     const hours = Math.floor(minutes / 60);
//     const mins = minutes % 60;
//     return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`;
//   };

//   // Get all map markers - ONLY for accepted bookings (not cancelled/rejected)
//   const getAllMapMarkers = useMemo(() => {
//     const markers = [];
//     // Only include accepted bookings that are not cancelled due to rejected modifications
//     const confirmedBookings = bookings.filter(b => 
//       b.status === 'accepted' && 
//       b.modification_request?.status !== 'rejected'
//     );
    
//     // Driver start point
//     if (driverStart?.latitude && driverStart?.longitude) {
//       markers.push({
//         id: 'driver-start',
//         type: 'start',
//         coordinate: driverStart,
//         title: '🚗 Trip Start',
//         address: ride?.origin || 'Starting point',
//         time: formatDateTime(ride?.departure_time),
//         icon: 'flag',
//         order: 0,
//         walkDistance: null,
//         description: `Departure: ${formatDate(ride?.departure_time)}`
//       });
//     }
    
//     // Add rider pickup points
//     confirmedBookings.forEach((booking) => {
//       const pickupLat = booking.intersection_pickup_lat || booking.pickup_lat;
//       const pickupLon = booking.intersection_pickup_lon || booking.pickup_lon;
//       if (pickupLat && pickupLon) {
//         markers.push({
//           id: `pickup-${booking.booking_id}`,
//           type: 'pickup',
//           coordinate: { latitude: Number(pickupLat), longitude: Number(pickupLon) },
//           title: `📍 Pickup: ${booking.passenger_name || 'Rider'}`,
//           address: booking.origin || 'Pickup location',
//           walkDistance: booking.pickup_walk_distance_m,
//           walkDuration: booking.pickup_walk_distance_m ? Math.round(booking.pickup_walk_distance_m / 80) : null,
//           riderName: booking.passenger_name,
//           seats: booking.seats_booked,
//           icon: 'person-add',
//           order: markers.length,
//           description: `${booking.seats_booked} seat(s) • ${booking.pickup_walk_distance_m ? `${booking.pickup_walk_distance_m}m walk` : 'Direct pickup'}`
//         });
//       }
//     });
    
//     // Add rider dropoff points
//     confirmedBookings.forEach((booking) => {
//       const dropLat = booking.intersection_drop_lat || booking.drop_lat;
//       const dropLon = booking.intersection_drop_lon || booking.drop_lon;
//       if (dropLat && dropLon) {
//         markers.push({
//           id: `dropoff-${booking.booking_id}`,
//           type: 'dropoff',
//           coordinate: { latitude: Number(dropLat), longitude: Number(dropLon) },
//           title: `🏁 Dropoff: ${booking.passenger_name || 'Rider'}`,
//           address: booking.destination || 'Dropoff location',
//           walkDistance: booking.drop_walk_distance_m,
//           walkDuration: booking.drop_walk_distance_m ? Math.round(booking.drop_walk_distance_m / 80) : null,
//           riderName: booking.passenger_name,
//           seats: booking.seats_booked,
//           icon: 'flag',
//           order: markers.length,
//           description: `${booking.drop_walk_distance_m ? `${booking.drop_walk_distance_m}m walk to destination` : 'Direct dropoff'}`
//         });
//       }
//     });
    
//     // Driver end point
//     if (driverEnd?.latitude && driverEnd?.longitude) {
//       markers.push({
//         id: 'driver-end',
//         type: 'end',
//         coordinate: driverEnd,
//         title: '🏁 Trip End',
//         address: ride?.destination || 'Destination',
//         time: formatDateTime(ride?.expected_end_time || ride?.departure_time),
//         icon: 'flag',
//         order: markers.length,
//         walkDistance: null,
//         description: 'Final destination'
//       });
//     }
    
//     return markers.sort((a, b) => a.order - b.order);
//   }, [bookings, driverStart, driverEnd, ride]);

//   // Get walking path lines - ONLY for accepted bookings
//   const walkingPaths = useMemo(() => {
//     const paths = [];
//     const confirmedBookings = bookings.filter(b => 
//       b.status === 'accepted' && 
//       b.modification_request?.status !== 'rejected'
//     );
    
//     confirmedBookings.forEach(booking => {
//       // Pickup walking path
//       const pickupLat = booking.intersection_pickup_lat || booking.pickup_lat;
//       const pickupLon = booking.intersection_pickup_lon || booking.pickup_lon;
//       const pickupAddressLat = booking.pickup_lat;
//       const pickupAddressLon = booking.pickup_lon;
      
//       if (pickupLat && pickupLon && pickupAddressLat && pickupAddressLon) {
//         const distance = calculateDistance(
//           pickupLat, pickupLon, pickupAddressLat, pickupAddressLon
//         );
//         if (distance > 0.05) {
//           paths.push({
//             id: `walking-pickup-${booking.booking_id}`,
//             coordinates: [
//               { latitude: Number(pickupLat), longitude: Number(pickupLon) },
//               { latitude: Number(pickupAddressLat), longitude: Number(pickupAddressLon) }
//             ],
//             color: '#10B981',
//             lineDash: [5, 5],
//             walkDistance: booking.pickup_walk_distance_m,
//             type: 'pickup'
//           });
//         }
//       }
      
//       // Dropoff walking path
//       const dropLat = booking.intersection_drop_lat || booking.drop_lat;
//       const dropLon = booking.intersection_drop_lon || booking.drop_lon;
//       const dropAddressLat = booking.drop_lat;
//       const dropAddressLon = booking.drop_lon;
      
//       if (dropLat && dropLon && dropAddressLat && dropAddressLon) {
//         const distance = calculateDistance(
//           dropLat, dropLon, dropAddressLat, dropAddressLon
//         );
//         if (distance > 0.05) {
//           paths.push({
//             id: `walking-dropoff-${booking.booking_id}`,
//             coordinates: [
//               { latitude: Number(dropLat), longitude: Number(dropLon) },
//               { latitude: Number(dropAddressLat), longitude: Number(dropAddressLon) }
//             ],
//             color: '#F59E0B',
//             lineDash: [5, 5],
//             walkDistance: booking.drop_walk_distance_m,
//             type: 'dropoff'
//           });
//         }
//       }
//     });
    
//     return paths;
//   }, [bookings]);

//   // Enhanced trip timeline - ONLY for accepted bookings
//   const sortedTripTimeline = useMemo(() => {
//     const items = [];
//     const confirmedBookings = bookings.filter(b => 
//       b.status === 'accepted' && 
//       b.modification_request?.status !== 'rejected'
//     );
    
//     // Create all potential points with coordinates
//     const allPoints = [];
//     let cumulativeDistance = 0;
//     let cumulativeDuration = 0;
    
//     // Start point
//     if (driverStart?.latitude && driverStart?.longitude) {
//       allPoints.push({
//         id: 'start',
//         type: 'start',
//         title: 'Trip Start',
//         address: ride?.origin || 'Starting point',
//         actualAddress: ride?.origin || 'Starting point',
//         time: formatDateTime(ride?.departure_time),
//         fullDateTime: ride?.departure_time,
//         coordinates: driverStart,
//         order: 0,
//         icon: '🚗',
//         color: '#2457A6'
//       });
//     }
    
//     // Add all pickup and dropoff points
//     confirmedBookings.forEach(booking => {
//       const pickupLat = booking.intersection_pickup_lat || booking.pickup_lat;
//       const pickupLon = booking.intersection_pickup_lon || booking.pickup_lon;
//       const pickupCacheKey = `${pickupLat},${pickupLon}`;
//       const pickupAddress = addressCache[pickupCacheKey];
      
//       if (pickupLat && pickupLon) {
//         allPoints.push({
//           id: `pickup-${booking.booking_id}`,
//           type: 'pickup',
//           title: `Pickup: ${booking.passenger_name || 'Rider'}`,
//           address: booking.origin || 'Pickup location',
//           actualAddress: pickupAddress || (booking.origin ? booking.origin : `Location loading...`),
//           time: formatDateTime(booking.pickup_time || ride?.departure_time),
//           walkDistance: booking.pickup_walk_distance_m,
//           walkDuration: booking.pickup_walk_distance_m ? Math.round(booking.pickup_walk_distance_m / 80) : null,
//           riderName: booking.passenger_name,
//           seats: booking.seats_booked,
//           coordinates: { latitude: Number(pickupLat), longitude: Number(pickupLon) },
//           icon: '📍',
//           color: '#10B981'
//         });
//       }
      
//       const dropLat = booking.intersection_drop_lat || booking.drop_lat;
//       const dropLon = booking.intersection_drop_lon || booking.drop_lon;
//       const dropCacheKey = `${dropLat},${dropLon}`;
//       const dropAddress = addressCache[dropCacheKey];
      
//       if (dropLat && dropLon) {
//         allPoints.push({
//           id: `dropoff-${booking.booking_id}`,
//           type: 'dropoff',
//           title: `Dropoff: ${booking.passenger_name || 'Rider'}`,
//           address: booking.destination || 'Dropoff location',
//           actualAddress: dropAddress || (booking.destination ? booking.destination : `Location loading...`),
//           time: formatDateTime(booking.dropoff_time || ride?.expected_end_time),
//           walkDistance: booking.drop_walk_distance_m,
//           walkDuration: booking.drop_walk_distance_m ? Math.round(booking.drop_walk_distance_m / 80) : null,
//           riderName: booking.passenger_name,
//           seats: booking.seats_booked,
//           coordinates: { latitude: Number(dropLat), longitude: Number(dropLon) },
//           icon: '🏁',
//           color: '#F59E0B'
//         });
//       }
//     });
    
//     // End point
//     if (driverEnd?.latitude && driverEnd?.longitude) {
//       allPoints.push({
//         id: 'end',
//         type: 'end',
//         title: 'Trip End',
//         address: ride?.destination || 'Destination',
//         actualAddress: ride?.destination || 'Destination',
//         time: formatDateTime(ride?.expected_end_time || ride?.departure_time),
//         coordinates: driverEnd,
//         icon: '🏁',
//         color: '#DC2626'
//       });
//     }
    
//     // Sort points based on route order
//     const routeCoords = routePath;
//     const sortedPoints = [];
    
//     if (routeCoords.length > 0) {
//       const pointsWithDistance = allPoints.map(point => {
//         let minDistance = Infinity;
//         let indexOnRoute = -1;
        
//         routeCoords.forEach((coord, idx) => {
//           const distance = calculateDistance(
//             point.coordinates.latitude,
//             point.coordinates.longitude,
//             coord.latitude,
//             coord.longitude
//           );
//           if (distance < minDistance) {
//             minDistance = distance;
//             indexOnRoute = idx;
//           }
//         });
        
//         return { ...point, routeIndex: indexOnRoute, distanceToRoute: minDistance };
//       });
      
//       pointsWithDistance.sort((a, b) => a.routeIndex - b.routeIndex);
//       sortedPoints.push(...pointsWithDistance);
//     } else {
//       sortedPoints.push(...allPoints);
//     }
    
//     // Calculate cumulative distances and durations
//     for (let i = 0; i < sortedPoints.length - 1; i++) {
//       const current = sortedPoints[i];
//       const next = sortedPoints[i + 1];
//       if (current.coordinates && next.coordinates) {
//         const distance = calculateDistance(
//           current.coordinates.latitude,
//           current.coordinates.longitude,
//           next.coordinates.latitude,
//           next.coordinates.longitude
//         );
//         const duration = calculateTravelTime(distance);
        
//         cumulativeDistance += distance;
//         cumulativeDuration += duration;
        
//         sortedPoints[i].distanceToNext = distance.toFixed(1);
//         sortedPoints[i].durationToNext = duration;
//         sortedPoints[i].cumulativeDistance = cumulativeDistance.toFixed(1);
//         sortedPoints[i].cumulativeDuration = cumulativeDuration;
//         sortedPoints[i].segmentNumber = i + 1;
//       }
//     }
    
//     // Add total trip summary
//     if (sortedPoints.length > 0 && sortedPoints[0]) {
//       sortedPoints[0].totalDistance = cumulativeDistance.toFixed(1);
//       sortedPoints[0].totalDuration = cumulativeDuration;
//     }
    
//     return sortedPoints;
//   }, [bookings, driverStart, driverEnd, ride, routePath, addressCache]);

//   const allMarkerCoords = useMemo(() => {
//     const coords = getAllMapMarkers.map(m => m.coordinate).filter(c => c?.latitude && c?.longitude);
//     walkingPaths.forEach(path => {
//       path.coordinates.forEach(coord => {
//         coords.push(coord);
//       });
//     });
//     return coords;
//   }, [getAllMapMarkers, walkingPaths]);

//   const fitMapToMarkers = useCallback(() => {
//     if (mapRef.current && mapReady && allMarkerCoords.length >= 1) {
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
//     if (mapReady && allMarkerCoords.length >= 1) fitMapToMarkers();
//   }, [mapReady, allMarkerCoords, fitMapToMarkers]);

//   const getVehicleName = () => {
//     if (ride?.vehicle) {
//       const parts = [];
//       if (ride.vehicle.make) parts.push(ride.vehicle.make);
//       if (ride.vehicle.model) parts.push(ride.vehicle.model);
//       if (parts.length > 0) return parts.join(' ');
//     }
//     return 'Vehicle details unavailable';
//   };
  
//   const vehicleName = getVehicleName();
//   const vehicleRegNumber = ride?.vehicle?.registration_number || null;
  
//   const totalSeatsOffered = ride?.available_seats ?? 0;

//   const mapHeight = animatedDrawer.interpolate({ inputRange: [0, 1], outputRange: [height - SAFE_TOP - COLLAPSED_HEIGHT, height * 0.35] });
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

//   const getStatusColor = (status) => {
//     switch (status) {
//       case 'accepted': return '#10B981';
//       case 'pending': return '#F59E0B';
//       case 'rejected': return '#EF4444';
//       case 'cancelled': return '#6B7280';
//       default: return Colors.gray;
//     }
//   };

//   const getStatusText = (status) => {
//     switch (status) {
//       case 'accepted': return 'Confirmed';
//       case 'pending': return 'Pending';
//       case 'rejected': return 'Rejected';
//       case 'cancelled': return 'Cancelled';
//       default: return status;
//     }
//   };

//   const handleChatWithPassenger = (passengerPhone, passengerName, passengerPhoto) => {
//     navigation.navigate('ChatScreen', {
//       receiverPhone: passengerPhone,
//       conversationId: `chat-${ride?.id}-${passengerPhone}`,
//       rideId: ride?.id,
//       user: {
//         name: passengerName,
//         tripInfo: `${ride?.origin || 'Pickup'} → ${ride?.destination || 'Drop'}`,
//         phone: passengerPhone,
//         profile_picture: passengerPhoto
//       }
//     });
//   };

//   const handleStartRide = () => {
//     navigation.navigate('StartRideConfirmScreen', { rideId: ride?.id, ride });
//   };

//   const handleEditRide = () => {
//     if (!ride?.id) {
//       showCustomAlert("Error", "Cannot edit ride: Ride ID missing", "error");
//       return;
//     }
    
//     if (!user?.phone_number) {
//       showCustomAlert("Error", "Please login to edit ride", "error");
//       return;
//     }
    
//     if (ride?.started_at) {
//       showCustomAlert("Cannot Edit", "Ride has already started. Cannot edit.", "warning");
//       return;
//     }
    
//     if (ride?.cancellation_reason) {
//       showCustomAlert("Cannot Edit", "Cancelled ride cannot be edited.", "warning");
//       return;
//     }
    
//     const rideData = {
//       from: ride?.origin || '',
//       to: ride?.destination || '',
//       dateTime: ride?.departure_time ? new Date(ride.departure_time) : new Date(),
//       seatsAvailable: ride?.available_seats || 1,
//       pricePerSeat: (ride?.price_per_seat || 0).toString(),
//       vehicleId: ride?.vehicle_id || null,
//       originCoords: ride?.origin_coords,
//       destinationCoords: ride?.destination_coords,
//       routeCoordinates: ride?.route_coordinates,
//       distanceKm: ride?.distance_km,
//       durationText: ride?.duration_text,
//       totalPrice: ride?.total_estimated_price,
//       preferences: ride?.preferences,
//       womenOnly: ride?.women_only,
//     };
    
//     navigation.navigate('DriveNext', { 
//       rideData, 
//       isEdit: true, 
//       rideId: ride.id, 
//       phoneNumber: user?.phone_number 
//     });
//   };

//   const handleCancelRide = () => {
//     showConfirmationAlert("Cancel Ride", "Are you sure you want to cancel this ride?", async () => {
//       try {
//         const response = await fetch(`${API_BASE_URL}/ride/${ride?.id}/cancel`, { method: 'PUT' });
//         if (!response.ok) throw new Error('Failed to cancel ride');
//         showCustomAlert("Success", "Ride cancelled successfully.", "success");
//         setTimeout(() => navigation.goBack(), 1500);
//       } catch (err) {
//         showCustomAlert("Error", "Could not cancel ride.", "error");
//       }
//     });
//   };

//   const handleNavigateToLocation = (latitude, longitude, title) => {
//     const url = Platform.select({
//       ios: `maps:0,0?q=${latitude},${longitude}`,
//       android: `geo:0,0?q=${latitude},${longitude}(${encodeURIComponent(title)})`
//     });
//     Linking.openURL(url).catch(err => {
//       showCustomAlert("Error", "Could not open maps", "error");
//     });
//   };

//   const focusOnStop = (coordinates) => {
//     if (mapRef.current && coordinates) {
//       mapRef.current.animateToRegion({
//         latitude: coordinates.latitude,
//         longitude: coordinates.longitude,
//         latitudeDelta: 0.01,
//         longitudeDelta: 0.01,
//       }, 500);
//     }
//   };

//   const initialRegion = {
//     latitude: driverStart?.latitude || 28.6139,
//     longitude: driverStart?.longitude || 77.2090,
//     latitudeDelta: 0.05,
//     longitudeDelta: 0.05,
//   };

//   const confirmedBookings = bookings.filter(b => 
//     b.status === 'accepted' && 
//     b.modification_request?.status !== 'rejected'
//   );
//   const pendingBookings = bookings.filter(b => b.status === 'pending');
//   const rideStatus = getRideStatusDisplay();
//   const showStartRide = !ride?.started_at && !ride?.cancellation_reason && ride?.status !== 'completed' && rideStatus.type !== 'auto-cancelled';
//   const pendingMods = pendingModifications.filter(m => m.status === 'pending' || m.status === undefined);
//   const showLiveSession = ride?.live_session?.session_id && ride?.started_at && ride?.status !== 'completed';
//   const isCompleted = ride?.status === 'completed' || ride?.completed_at;
//   const isOngoing = ride?.started_at && !isCompleted;
//   const unratedRiders = confirmedBookings.filter(b => !b.driver_rating_given && b.driver_rating_given !== true);
//   const needsRating = isCompleted && unratedRiders.length > 0;
//   const showRatingSection = isCompleted && confirmedBookings.length > 0;

//   // Render walking path
//   const renderWalkingPath = (path) => {
//     return (
//       <Polyline
//         key={path.id}
//         coordinates={path.coordinates}
//         strokeColor={path.color}
//         strokeWidth={3}
//         lineDashPattern={path.lineDash}
//         lineCap="round"
//         lineJoin="round"
//       />
//     );
//   };

//   // Render marker on map
//   const renderMarker = (marker) => {
//     let color, size = 36;
//     switch (marker.type) {
//       case 'start': color = '#2457A6'; size = 42; break;
//       case 'end': color = '#DC2626'; size = 42; break;
//       case 'pickup': color = '#10B981'; size = 38; break;
//       case 'dropoff': color = '#F59E0B'; size = 38; break;
//       default: color = '#6B7280'; size = 32;
//     }
    
//     const iconName = marker.type === 'pickup' ? 'person-add' : (marker.type === 'dropoff' ? 'flag' : 'location');
    
//     return (
//       <Marker 
//         key={marker.id} 
//         coordinate={marker.coordinate} 
//         title={marker.title} 
//         description={marker.description || marker.address}
//       >
//         <View style={[styles.customMarker, { backgroundColor: color, width: size, height: size, borderRadius: size / 2 }]}>
//           <Ionicons name={iconName} size={size * 0.45} color="#fff" />
//           {marker.type === 'pickup' && marker.seats && (
//             <View style={styles.markerBadge}>
//               <Text style={styles.markerBadgeText}>{marker.seats}</Text>
//             </View>
//           )}
//           {marker.walkDistance && marker.walkDistance > 0 && (
//             <View style={[styles.walkBadge, { backgroundColor: marker.type === 'pickup' ? '#10B981' : '#F59E0B' }]}>
//               <Ionicons name="walk" size={10} color="#fff" />
//               <Text style={styles.walkBadgeText}>{marker.walkDistance}m</Text>
//             </View>
//           )}
//         </View>
//       </Marker>
//     );
//   };

//   // Render enhanced trip timeline item
//   const renderTimelineItem = (item, index) => {
//     const isLast = index === sortedTripTimeline.length - 1;
//     const hasWalking = item.walkDistance && item.walkDistance > 0;
    
//     return (
//       <TouchableOpacity 
//         key={item.id} 
//         style={styles.timelineItemCard}
//         onPress={() => focusOnStop(item.coordinates)}
//         activeOpacity={0.7}
//       >
//         <View style={styles.timelineItemLeft}>
//           <View style={[styles.timelineItemDot, { backgroundColor: item.color }]}>
//             <Text style={styles.timelineItemIcon}>{item.icon}</Text>
//           </View>
//           {!isLast && <View style={[styles.timelineItemLine, { backgroundColor: item.color + '40' }]} />}
//         </View>
        
//         <View style={styles.timelineItemRight}>
//           <View style={styles.timelineItemHeader}>
//             <Text style={styles.timelineItemType}>{item.type.toUpperCase()}</Text>
//             {item.segmentNumber && (
//               <View style={styles.segmentBadge}>
//                 <Text style={styles.segmentBadgeText}>Stop {item.segmentNumber}</Text>
//               </View>
//             )}
//           </View>
          
//           <Text style={styles.timelineItemTitle}>{item.title}</Text>
          
//           <View style={styles.timelineItemDetails}>
//             {item.riderName && (
//               <View style={styles.detailChip}>
//                 <Ionicons name="person-outline" size={12} color="#6B7280" />
//                 <Text style={styles.detailChipText}>{item.riderName}</Text>
//               </View>
//             )}
//             {item.seats && (
//               <View style={styles.detailChip}>
//                 <Ionicons name="people-outline" size={12} color="#6B7280" />
//                 <Text style={styles.detailChipText}>{item.seats} seat{item.seats > 1 ? 's' : ''}</Text>
//               </View>
//             )}
//             {item.time && (
//               <View style={styles.detailChip}>
//                 <Ionicons name="time-outline" size={12} color="#6B7280" />
//                 <Text style={styles.detailChipText}>{item.time}</Text>
//               </View>
//             )}
//           </View>
          
//           <Text style={styles.timelineItemAddress} numberOfLines={2}>
//             {item.actualAddress || item.address}
//           </Text>
          
//           {hasWalking && (
//             <View style={[styles.walkingChip, { backgroundColor: item.color + '15' }]}>
//               <Ionicons name="walk" size={14} color={item.color} />
//               <Text style={[styles.walkingChipText, { color: item.color }]}>
//                 Walk {item.walkDistance}m • ~{item.walkDuration} min
//               </Text>
//             </View>
//           )}
          
//           {item.distanceToNext && (
//             <View style={styles.routeInfo}>
//               <View style={styles.routeInfoItem}>
//                 <Ionicons name="navigate-outline" size={12} color="#2457A6" />
//                 <Text style={styles.routeInfoText}>Next: {item.distanceToNext} km</Text>
//               </View>
//               <View style={styles.routeInfoItem}>
//                 <Ionicons name="time-outline" size={12} color="#F59E0B" />
//                 <Text style={styles.routeInfoText}>~{formatDuration(item.durationToNext)}</Text>
//               </View>
//               {item.cumulativeDistance && (
//                 <View style={styles.routeInfoItem}>
//                   <Ionicons name="flag-outline" size={12} color="#10B981" />
//                   <Text style={styles.routeInfoText}>Total: {item.cumulativeDistance} km</Text>
//                 </View>
//               )}
//             </View>
//           )}
          
//           <TouchableOpacity 
//             style={styles.navigateButton}
//             onPress={() => handleNavigateToLocation(
//               item.coordinates.latitude,
//               item.coordinates.longitude,
//               item.title
//             )}
//           >
//             <Ionicons name="navigate-circle" size={16} color="#2457A6" />
//             <Text style={styles.navigateButtonText}>Navigate to this stop</Text>
//           </TouchableOpacity>
//         </View>
//       </TouchableOpacity>
//     );
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
//           {/* Main route polyline */}
//           {routePath.length >= 2 && (
//             <>
//               <Polyline 
//                 coordinates={routePath} 
//                 strokeColor="#2457A6" 
//                 strokeWidth={6} 
//                 lineCap="round" 
//                 lineJoin="round"
//               />
//               <Polyline 
//                 coordinates={routePath} 
//                 strokeColor="#4A7DFF" 
//                 strokeWidth={3} 
//                 lineCap="round" 
//                 lineJoin="round"
//                 lineDashPattern={[0]}
//               />
//             </>
//           )}
          
//           {/* Walking paths for pickup and dropoff */}
//           {walkingPaths.map(path => renderWalkingPath(path))}
          
//           {/* Proximity circles for pickup points */}
//           {getAllMapMarkers.filter(m => m.type === 'pickup' && m.walkDistance).map(marker => (
//             <Circle
//               key={`circle-${marker.id}`}
//               center={marker.coordinate}
//               radius={marker.walkDistance}
//               strokeColor="rgba(16, 185, 129, 0.3)"
//               fillColor="rgba(16, 185, 129, 0.1)"
//               strokeWidth={1}
//             />
//           ))}
          
//           {/* All markers */}
//           {getAllMapMarkers.map(marker => renderMarker(marker))}
//         </MapView>

//         <TouchableOpacity style={styles.mapBackButton} onPress={() => navigation.goBack()}>
//           <Ionicons name="chevron-back" size={26} color={Colors.secondary} />
//         </TouchableOpacity>
        
//         {/* Map Legend */}
//         <View style={styles.mapLegend}>
//           <View style={styles.legendTitle}>
//             <Text style={styles.legendTitleText}>Map Legend</Text>
//           </View>
//           <View style={styles.legendItem}>
//             <View style={[styles.legendColor, { backgroundColor: '#2457A6', width: 20 }]} />
//             <Text style={styles.legendText}>Main Route</Text>
//           </View>
//           <View style={styles.legendItem}>
//             <View style={[styles.legendColor, { backgroundColor: '#10B981', borderStyle: 'dashed', borderWidth: 1, borderColor: '#10B981' }]} />
//             <Text style={styles.legendText}>Walking (Pickup)</Text>
//           </View>
//           <View style={styles.legendItem}>
//             <View style={[styles.legendColor, { backgroundColor: '#F59E0B', borderStyle: 'dashed', borderWidth: 1, borderColor: '#F59E0B' }]} />
//             <Text style={styles.legendText}>Walking (Dropoff)</Text>
//           </View>
//           <View style={styles.legendItem}>
//             <View style={[styles.legendDot, { backgroundColor: '#10B981' }]} />
//             <Text style={styles.legendText}>Pickup Point</Text>
//           </View>
//           <View style={styles.legendItem}>
//             <View style={[styles.legendDot, { backgroundColor: '#F59E0B' }]} />
//             <Text style={styles.legendText}>Dropoff Point</Text>
//           </View>
//         </View>
        
//         {/* Map Controls */}
//         <View style={styles.mapControls}>
//           <TouchableOpacity 
//             style={styles.mapControlButton} 
//             onPress={() => fitMapToMarkers()}
//           >
//             <Ionicons name="map-outline" size={20} color="#2457A6" />
//           </TouchableOpacity>
//         </View>
//       </Animated.View>

//       <Animated.View style={[styles.drawer, { height: drawerHeight }]}>
//         <View style={styles.handleWrap} {...panResponder.panHandlers}>
//           <TouchableOpacity activeOpacity={0.9} onPress={toggleDrawer} style={styles.handleHitArea}>
//             <View style={styles.handleBar} />
//           </TouchableOpacity>
//           {!drawerExpanded && pendingMods.length > 0 && (
//             <View style={styles.pendingNotificationBadge}>
//               <Text style={styles.pendingNotificationText}>{pendingMods.length}</Text>
//             </View>
//           )}
//         </View>

//         {!drawerExpanded ? (
//           <View style={styles.collapsedSummary}>
//             <View style={styles.collapsedTopRow}>
//               <View style={{ flex: 1 }}>
//                 <Text style={styles.collapsedDriver} numberOfLines={1}>{ride?.driverName || 'Driver'}</Text>
//                 <Text style={styles.collapsedSub} numberOfLines={1}>{ride?.origin || 'Pickup'} → {ride?.destination || 'Drop'}</Text>
//               </View>
//               <View style={styles.collapsedPriceWrap}>
//                 <Text style={styles.collapsedPrice}>₹{ride?.price_per_seat}</Text>
//                 <Text style={styles.collapsedPerSeat}>per seat</Text>
//               </View>
//             </View>
//             {sortedTripTimeline.length > 0 && sortedTripTimeline[0]?.totalDistance && (
//               <View style={styles.collapsedTripInfo}>
//                 <Text style={styles.collapsedTripText}>
//                   📍 {sortedTripTimeline.length} stops • {sortedTripTimeline[0].totalDistance} km • {formatDuration(sortedTripTimeline[0].totalDuration)}
//                 </Text>
//               </View>
//             )}
//           </View>
//         ) : (
//           <ScrollView ref={scrollViewRef} style={styles.drawerScroll} contentContainerStyle={styles.drawerContent} showsVerticalScrollIndicator={false}>
            
//             {/* Status Banner */}
//             <View style={[styles.statusBanner, { backgroundColor: rideStatus.color + '20' }]}>
//               <Ionicons name={rideStatus.icon} size={20} color={rideStatus.color} />
//               <View style={{ flex: 1 }}>
//                 <Text style={[styles.statusBannerText, { color: rideStatus.color }]}>{rideStatus.text}</Text>
//                 {rideStatus.reason && (
//                   <Text style={[styles.statusBannerReason, { color: rideStatus.color }]}>{rideStatus.reason}</Text>
//                 )}
//               </View>
//             </View>

//             {/* Cancellation Banner with Reason */}
//             {rideStatus.type === 'cancelled' && ride?.cancellation_reason && (
//               <View style={styles.cancellationDetailedBanner}>
//                 <View style={styles.cancellationHeader}>
//                   <Ionicons name="close-circle" size={24} color="#DC2626" />
//                   <Text style={styles.cancellationTitle}>Ride Cancelled</Text>
//                 </View>
//                 <Text style={styles.cancellationMessage}>{ride.cancellation_reason}</Text>
//                 {ride.cancelled_by && (
//                   <Text style={styles.cancelledByText}>
//                     Cancelled by: {ride.cancelled_by === user?.phone_number ? 'You' : 'Driver'}
//                   </Text>
//                 )}
//               </View>
//             )}

//             {/* Trip Overview Card */}
//             <View style={styles.tripOverviewCard}>
//               <View style={styles.tripOverviewHeader}>
//                 <Ionicons name="information-circle-outline" size={24} color="#2457A6" />
//                 <Text style={styles.tripOverviewTitle}>Trip Overview</Text>
//               </View>
//               <View style={styles.tripOverviewDetails}>
//                 <View style={styles.tripOverviewItem}>
//                   <Text style={styles.tripOverviewLabel}>From</Text>
//                   <Text style={styles.tripOverviewValue}>{ride?.origin || 'Starting point'}</Text>
//                 </View>
//                 <View style={styles.tripOverviewArrow}>
//                   <Ionicons name="arrow-down-outline" size={16} color="#2457A6" />
//                 </View>
//                 <View style={styles.tripOverviewItem}>
//                   <Text style={styles.tripOverviewLabel}>To</Text>
//                   <Text style={styles.tripOverviewValue}>{ride?.destination || 'Destination'}</Text>
//                 </View>
//               </View>
//               <View style={styles.tripOverviewStats}>
//                 <View style={styles.tripOverviewStat}>
//                   <Ionicons name="calendar-outline" size={16} color="#6B7280" />
//                   <Text style={styles.tripOverviewStatText}>{formatDate(ride?.departure_time)}</Text>
//                 </View>
//                 {sortedTripTimeline[0]?.totalDistance && (
//                   <View style={styles.tripOverviewStat}>
//                     <Ionicons name="map-outline" size={16} color="#6B7280" />
//                     <Text style={styles.tripOverviewStatText}>{sortedTripTimeline[0].totalDistance} km total</Text>
//                   </View>
//                 )}
//                 {sortedTripTimeline[0]?.totalDuration && (
//                   <View style={styles.tripOverviewStat}>
//                     <Ionicons name="time-outline" size={16} color="#6B7280" />
//                     <Text style={styles.tripOverviewStatText}>{formatDuration(sortedTripTimeline[0].totalDuration)} est.</Text>
//                   </View>
//                 )}
//               </View>
//             </View>

//             {/* Total Earnings Banner */}
//             {isCompleted && totalEarnings > 0 && (
//               <View style={styles.earningsBanner}>
//                 <View style={styles.earningsBannerLeft}>
//                   <View style={styles.earningsIconContainer}>
//                     <Ionicons name="cash-outline" size={28} color="#10B981" />
//                   </View>
//                   <View>
//                     <Text style={styles.earningsLabel}>Total Earnings</Text>
//                     <Text style={styles.earningsSubLabel}>From confirmed bookings</Text>
//                   </View>
//                 </View>
//                 <View style={styles.earningsAmountContainer}>
//                   <Text style={styles.earningsCurrency}>₹</Text>
//                   <Text style={styles.earningsAmount}>{totalEarnings}</Text>
//                 </View>
//               </View>
//             )}

//             {/* Earnings Breakdown */}
//             {isCompleted && confirmedBookings.length > 0 && (
//               <View style={styles.earningsBreakdownCard}>
//                 <Text style={styles.earningsBreakdownTitle}>Earnings Breakdown</Text>
//                 {confirmedBookings.map((booking) => (
//                   <View key={booking.booking_id} style={styles.earningsRow}>
//                     <View style={styles.earningsRowLeft}>
//                       <View style={styles.earningsRowAvatar}>
//                         <Text style={styles.earningsRowInitials}>
//                           {getInitials(booking.passenger_name)}
//                         </Text>
//                       </View>
//                       <View>
//                         <Text style={styles.earningsRowName}>{booking.passenger_name || 'Rider'}</Text>
//                         <Text style={styles.earningsRowSeats}>{booking.seats_booked} seat(s)</Text>
//                       </View>
//                     </View>
//                     <Text style={styles.earningsRowAmount}>
//                       ₹{booking.total_amount || booking.seats_booked * (ride?.price_per_seat || 0)}
//                     </Text>
//                   </View>
//                 ))}
//                 <View style={styles.earningsDivider} />
//                 <View style={styles.earningsTotalRow}>
//                   <Text style={styles.earningsTotalLabel}>Total</Text>
//                   <Text style={styles.earningsTotalAmount}>₹{totalEarnings}</Text>
//                 </View>
//               </View>
//             )}

//             {/* Enhanced Trip Timeline Section - Only shows active bookings */}
//             {sortedTripTimeline.length > 0 && (
//               <View style={styles.cardSection}>
//                 <TouchableOpacity 
//                   style={styles.timelineHeader} 
//                   onPress={() => setTimelineExpanded(!timelineExpanded)}
//                 >
//                   <View style={styles.timelineHeaderLeft}>
//                     <Ionicons name="map-outline" size={20} color="#2457A6" />
//                     <Text style={styles.sectionTitle}>Trip Details</Text>
//                   </View>
//                   <Ionicons 
//                     name={timelineExpanded ? "chevron-up" : "chevron-down"} 
//                     size={20} 
//                     color={Colors.gray} 
//                   />
//                 </TouchableOpacity>
                
//                 {timelineExpanded && (
//                   <View style={styles.timelineContainer}>
//                     {sortedTripTimeline.map((item, index) => renderTimelineItem(item, index))}
//                   </View>
//                 )}
//               </View>
//             )}

//             {/* Vehicle Details */}
//             <View style={styles.cardSection}>
//               <Text style={styles.sectionTitle}>Vehicle Details</Text>
//               <View style={styles.vehicleHeaderRow}>
//                 <View style={styles.vehicleIconCircle}><Ionicons name="car-sport-outline" size={24} color="#2457A6" /></View>
//                 <View style={styles.vehicleMeta}>
//                   <Text style={styles.vehicleTitle}>{vehicleName}</Text>
//                   {vehicleRegNumber && (
//                     <View style={styles.vehicleRegContainer}>
//                       <Ionicons name="clipboard-outline" size={12} color="#6B7280" />
//                       <Text style={styles.vehicleRegText}>Reg: {vehicleRegNumber}</Text>
//                     </View>
//                   )}
//                 </View>
//               </View>
//             </View>

//             {/* Seat Information */}
//             <View style={styles.cardSection}>
//               <Text style={styles.sectionTitle}>Seat Information</Text>
              
//               {/* Show warning if there are cancelled bookings due to modification rejection */}
//               {bookings.some(b => b.modification_request?.status === 'rejected') && (
//                 <View style={styles.rejectedModificationWarning}>
//                   <Ionicons name="warning-outline" size={16} color="#DC2626" />
//                   <Text style={styles.rejectedModificationWarningText}>
//                     ⚠️ Some bookings were cancelled due to modification rejection. Seats have been released.
//                   </Text>
//                 </View>
//               )}
              
//               <View style={styles.seatInfoContainer}>
//                 <View style={styles.seatInfoItem}>
//                   <View style={[styles.seatIconCircle, { backgroundColor: '#EAF1FF' }]}>
//                     <Ionicons name="car-sport-outline" size={24} color="#2457A6" />
//                   </View>
//                   <Text style={styles.seatInfoLabel}>Total</Text>
//                   <Text style={styles.seatInfoValue}>{totalSeatsOffered}</Text>
//                 </View>
//                 <View style={styles.seatDivider} />
//                 <View style={styles.seatInfoItem}>
//                   <View style={[styles.seatIconCircle, { backgroundColor: '#E8F5E9' }]}>
//                     <Ionicons name="people" size={24} color="#10B981" />
//                   </View>
//                   <Text style={styles.seatInfoLabel}>Booked</Text>
//                   <Text style={[styles.seatInfoValue, { color: '#10B981' }]}>{getActualBookedSeats()}</Text>
//                 </View>
//                 <View style={styles.seatDivider} />
//                 <View style={styles.seatInfoItem}>
//                   <View style={[styles.seatIconCircle, { backgroundColor: '#FFF3E0' }]}>
//                     <Ionicons name="person-add" size={24} color="#F59E0B" />
//                   </View>
//                   <Text style={styles.seatInfoLabel}>Available</Text>
//                   <Text style={[styles.seatInfoValue, { color: getActualAvailableSeats() > 0 ? '#F59E0B' : '#DC2626' }]}>
//                     {getActualAvailableSeats()}
//                   </Text>
//                 </View>
//               </View>
//               <View style={styles.progressBarContainer}>
//                 <View style={[styles.progressBar, { width: `${totalSeatsOffered > 0 ? (getActualBookedSeats() / totalSeatsOffered) * 100 : 0}%` }]} />
//               </View>
//               <Text style={styles.progressText}>
//                 {getActualBookedSeats()} out of {totalSeatsOffered} seats booked
//                 {getActualAvailableSeats() > 0 && ` • ${getActualAvailableSeats()} seats available`}
//               </Text>
              
//               {/* Show seat release message if modification was rejected */}
//               {getActualAvailableSeats() > 0 && bookings.some(b => b.modification_request?.status === 'rejected') && (
//                 <Text style={styles.seatReleaseMessage}>
//                   ✨ {getActualAvailableSeats()} seat(s) are now available for new bookings
//                 </Text>
//               )}
//             </View>

//             {/* Confirmed Bookings - Only shows accepted bookings */}
//             {confirmedBookings.length > 0 && (
//               <View style={styles.cardSection}>
//                 <View style={styles.sectionHeaderWithStatus}>
//                   <Text style={styles.sectionTitle}>Bookings ✅ ({confirmedBookings.length})</Text>
//                   {(rideStatus.type === 'auto-cancelled' || rideStatus.type === 'cancelled') && (
//                     <View style={styles.cancelledBadgeSmall}>
//                       <Text style={styles.cancelledBadgeSmallText}>Ride Cancelled</Text>
//                     </View>
//                   )}
//                 </View>
                
//                 {confirmedBookings.map((booking) => {
//                   const profilePicUrl = booking.profile_picture ? buildImageUrl(booking.profile_picture) : null;
//                   const isSvg = profilePicUrl ? isSvgUrl(profilePicUrl) : false;
                  
//                   // Check modification status from the booking object itself
//                   const hasApprovedModification = booking.modification_request?.status === 'approved';
//                   const hasPendingModification = booking.modification_request?.status === 'pending';
//                   const hasRejectedModification = booking.modification_request?.status === 'rejected';
                  
//                   // Also check from pendingModifications array for backward compatibility
//                   const hasPendingFromArray = pendingModifications.some(
//                     pm => pm.booking_id === booking.booking_id && pm.status === 'pending'
//                   );
//                   const hasRejectedFromArray = pendingModifications.some(
//                     pm => pm.booking_id === booking.booking_id && pm.status === 'rejected'
//                   );
                  
//                   // Combine both sources
//                   const isPendingModification = hasPendingModification || hasPendingFromArray;
//                   const isRejectedModification = hasRejectedModification || hasRejectedFromArray;
//                   const isApprovedModification = hasApprovedModification;
                  
//                   // Determine effective seat count
//                   let effectiveSeatCount = booking.seats_booked || booking.seats_requested || 0;
//                   let originalSeatCount = effectiveSeatCount;
                  
//                   if (isApprovedModification) {
//                     effectiveSeatCount = booking.modification_request?.requested_seats || effectiveSeatCount;
//                   }
                  
//                   // Determine rider-specific status
//                   const isRideCancelled = rideStatus.type === 'auto-cancelled' || rideStatus.type === 'cancelled';
//                   const isBookingRejected = booking.status === 'rejected';
//                   const isBookingCancelled = booking.status === 'cancelled';
//                   const isModificationRejectedBooking = isRejectedModification;
                  
//                   const showRiderStatus = isRideCancelled || isBookingRejected || isBookingCancelled || isModificationRejectedBooking;
                  
//                   // Don't show location info if ride is cancelled
//                   const showLocationInfo = !isRideCancelled && !isBookingRejected && !isBookingCancelled && !isModificationRejectedBooking;
                  
//                   return (
//                     <View key={booking.booking_id} style={[
//                       styles.bookingItem, 
//                       (showRiderStatus) && styles.disabledBookingItem
//                     ]}>
//                       <TouchableOpacity 
//                         style={styles.passengerAvatar} 
//                         onPress={() => profilePicUrl && setSelectedProfile({ visible: true, imageUrl: profilePicUrl, name: booking.passenger_name })}
//                         disabled={showRiderStatus}
//                       >
//                         {profilePicUrl && !isSvg ? 
//                           <Image source={{ uri: profilePicUrl }} style={styles.avatarImage} /> : 
//                           profilePicUrl && isSvg ? 
//                             <View style={styles.avatarImageSvg}>
//                               <SvgCssUri uri={profilePicUrl} width={44} height={44} />
//                             </View> : 
//                             <View style={styles.avatarPlaceholder}>
//                               <Text style={styles.avatarPlaceholderText}>{getInitials(booking.passenger_name)}</Text>
//                             </View>
//                         }
//                       </TouchableOpacity>
                      
//                       <View style={styles.bookingInfo}>
//                         <Text style={styles.passengerName}>{booking.passenger_name || 'Passenger'}</Text>
                        
//                         {/* Show modification status badges */}
//                         {isPendingModification && !showRiderStatus && (
//                           <View style={styles.modificationStatusBadge}>
//                             <Ionicons name="swap" size={12} color="#F59E0B" />
//                             <Text style={[styles.modificationStatusText, { color: '#F59E0B' }]}>
//                               Modification Request Pending
//                             </Text>
//                           </View>
//                         )}
                        
//                         {isApprovedModification && !showRiderStatus && (
//                           <View style={[styles.modificationStatusBadge, { backgroundColor: '#E8F5E9' }]}>
//                             <Ionicons name="checkmark-circle" size={12} color="#10B981" />
//                             <Text style={[styles.modificationStatusText, { color: '#2E7D32' }]}>
//                               ✅ Seat Updated: {originalSeatCount} → {effectiveSeatCount} seats
//                             </Text>
//                           </View>
//                         )}
                        
//                         {isRejectedModification && (
//                           <View style={[styles.modificationStatusBadge, { backgroundColor: '#FEF2F2' }]}>
//                             <Ionicons name="close-circle" size={12} color="#DC2626" />
//                             <Text style={[styles.modificationStatusText, { color: '#DC2626' }]}>
//                               ❌ Booking Cancelled (Modification Rejected)
//                             </Text>
//                           </View>
//                         )}
                        
//                         {/* Display seat count with strikethrough for rejected modifications */}
//                         <Text style={[
//                           styles.bookingSeats,
//                           isRejectedModification && styles.strikethroughText
//                         ]}>
//                           <Ionicons name="people-outline" size={12} color={Colors.gray} /> 
//                           {isApprovedModification 
//                             ? `${effectiveSeatCount} seats (was ${originalSeatCount})`
//                             : `${effectiveSeatCount} seat${effectiveSeatCount > 1 ? 's' : ''}`
//                           }
//                           {isRejectedModification && " - CANCELLED"}
//                         </Text>
                        
//                         {/* Show rejection reason if available */}
//                         {isRejectedModification && booking.modification_request?.rejection_reason && (
//                           <Text style={styles.rejectionReasonText}>
//                             Reason: {booking.modification_request.rejection_reason}
//                           </Text>
//                         )}
                        
//                         {/* Show walking distance info - only if ride is active and booking not cancelled */}
//                         {showLocationInfo && booking.pickup_walk_distance_m > 0 && (
//                           <Text style={styles.walkingInfoText}>
//                             <Ionicons name="walk" size={10} color="#10B981" /> Pickup: {booking.pickup_walk_distance_m}m walk
//                           </Text>
//                         )}
                        
//                         {showLocationInfo && booking.drop_walk_distance_m > 0 && (
//                           <Text style={styles.walkingInfoText}>
//                             <Ionicons name="walk" size={10} color="#F59E0B" /> Dropoff: {booking.drop_walk_distance_m}m walk
//                           </Text>
//                         )}
                        
//                         {/* Show cancellation note for modification rejected */}
//                         {isRejectedModification && (
//                           <Text style={styles.cancelledNoteText}>
//                             ⚠️ This booking was cancelled because the modification request was rejected. {booking.modification_request?.requested_seats || 'Requested'} seats were not available.
//                           </Text>
//                         )}
//                       </View>
                      
//                       <View style={styles.bookingActions}>
//                         <View style={[
//                           styles.bookingStatusBadge, 
//                           { backgroundColor: isRejectedModification ? '#FEE2E2' : (getStatusColor(booking.status) + '20') }
//                         ]}>
//                           <Text style={[
//                             styles.bookingStatusText, 
//                             { color: isRejectedModification ? '#DC2626' : getStatusColor(booking.status) }
//                           ]}>
//                             {isRejectedModification ? 'Cancelled' : getStatusText(booking.status)}
//                           </Text>
//                         </View>
                        
//                         {/* Only show chat button if ride is active, not cancelled, and booking not cancelled */}
//                         {!showRiderStatus && rideStatus.type !== 'auto-cancelled' && rideStatus.type !== 'cancelled' && (
//                           <TouchableOpacity 
//                             style={styles.chatButton} 
//                             onPress={() => handleChatWithPassenger(booking.passenger_phone, booking.passenger_name, booking.profile_picture)}
//                           >
//                             <Ionicons name="chatbubble-ellipses" size={22} color={Colors.primary} />
//                           </TouchableOpacity>
//                         )}
//                       </View>
//                     </View>
//                   );
//                 })}
                
//                 {/* Show cancellation note for cancelled rides */}
//                 {(rideStatus.type === 'auto-cancelled' || rideStatus.type === 'cancelled') && (
//                   <View style={styles.cancelledNoteContainer}>
//                     <Ionicons name="information-circle" size={14} color="#9CA3AF" />
//                     <Text style={styles.cancelledNoteText}>
//                       These bookings were cancelled due to ride cancellation.
//                     </Text>
//                   </View>
//                 )}
//               </View>
//             )}

//             {/* Pending Modification Requests Section */}
//             {pendingMods.length > 0 && !areModificationsLocked() && rideStatus.type !== 'auto-cancelled' && rideStatus.type !== 'cancelled' && (
//               <View style={styles.cardSection}>
//                 <Text style={[styles.sectionTitle, { color: '#F59E0B' }]}>Modification Requests ⏳ ({pendingMods.length})</Text>
//                 {pendingMods.map((modRequest) => {
//                   const booking = bookings.find(b => b.booking_id === modRequest.booking_id);
//                   if (!booking) return null;
                  
//                   return (
//                     <View key={modRequest.id} style={styles.modificationRequestItem}>
//                       <View style={styles.modificationRequestHeader}>
//                         <Ionicons name="swap" size={20} color="#F59E0B" />
//                         <Text style={styles.modificationRequestTitle}>Seat Change Request</Text>
//                       </View>
//                       <Text style={styles.modificationRequestRider}>Rider: {booking.passenger_name || 'Passenger'}</Text>
//                       <View style={styles.modificationSeatChange}>
//                         <Text style={styles.currentSeats}>{modRequest.current_seats} seats</Text>
//                         <Ionicons name="arrow-forward" size={16} color="#F59E0B" />
//                         <Text style={styles.requestedSeats}>{modRequest.requested_seats} seats</Text>
//                       </View>
//                       <View style={styles.modificationActions}>
//                         <TouchableOpacity 
//                           style={[styles.modActionBtn, styles.approveModBtn]} 
//                           onPress={() => handleModificationAction(modRequest.id, 'approve', modRequest.requested_seats, modRequest.current_seats, booking.booking_id, booking.passenger_name)}
//                         >
//                           <Ionicons name="checkmark" size={16} color="#fff" />
//                           <Text style={styles.modActionBtnText}>Approve</Text>
//                         </TouchableOpacity>
//                         <TouchableOpacity 
//                           style={[styles.modActionBtn, styles.rejectModBtn]} 
//                           onPress={() => handleModificationAction(modRequest.id, 'reject', modRequest.requested_seats, modRequest.current_seats, booking.booking_id, booking.passenger_name)}
//                         >
//                           <Ionicons name="close" size={16} color="#fff" />
//                           <Text style={styles.modActionBtnText}>Reject & Cancel Booking</Text>
//                         </TouchableOpacity>
//                       </View>
//                       <Text style={styles.modificationWarning}>
//                         ⚠️ Rejecting will cancel the original {modRequest.current_seats} seat booking
//                       </Text>
//                     </View>
//                   );
//                 })}
//               </View>
//             )}

//             {/* Pending Bookings */}
//             {pendingBookings.length > 0 && !areModificationsLocked() && rideStatus.type !== 'auto-cancelled' && rideStatus.type !== 'cancelled' && (
//               <View style={styles.cardSection}>
//                 <Text style={[styles.sectionTitle, { color: '#F59E0B' }]}>Pending Requests ⏳ ({pendingBookings.length})</Text>
//                 {pendingBookings.map((booking) => {
//                   const profilePicUrl = booking.profile_picture ? buildImageUrl(booking.profile_picture) : null;
//                   const isSvg = profilePicUrl ? isSvgUrl(profilePicUrl) : false;
//                   return (
//                     <View key={booking.booking_id} style={styles.bookingItem}>
//                       <TouchableOpacity style={styles.passengerAvatar} onPress={() => profilePicUrl && setSelectedProfile({ visible: true, imageUrl: profilePicUrl, name: booking.passenger_name })}>
//                         {profilePicUrl && !isSvg ? <Image source={{ uri: profilePicUrl }} style={styles.avatarImage} /> : profilePicUrl && isSvg ? <View style={styles.avatarImageSvg}><SvgCssUri uri={profilePicUrl} width={44} height={44} /></View> : <View style={styles.avatarPlaceholder}><Text style={styles.avatarPlaceholderText}>{getInitials(booking.passenger_name)}</Text></View>}
//                       </TouchableOpacity>
//                       <View style={styles.bookingInfo}>
//                         <Text style={styles.passengerName}>{booking.passenger_name || 'Passenger'}</Text>
//                         <Text style={styles.bookingSeats}><Ionicons name="people-outline" size={12} color={Colors.gray} /> {booking.seats_booked} seat{booking.seats_booked > 1 ? 's' : ''}</Text>
//                       </View>
//                       <View style={styles.pendingActions}>
//                         <TouchableOpacity style={[styles.actionSmallBtn, styles.acceptBtn]} onPress={() => handleBookingAction(booking.booking_id, 'accept')}>
//                           <Ionicons name="checkmark" size={16} color="#fff" />
//                         </TouchableOpacity>
//                         <TouchableOpacity style={[styles.actionSmallBtn, styles.rejectBtn]} onPress={() => handleBookingAction(booking.booking_id, 'reject')}>
//                           <Ionicons name="close" size={16} color="#fff" />
//                         </TouchableOpacity>
//                       </View>
//                     </View>
//                   );
//                 })}
//               </View>
//             )}

//             {/* Action Buttons */}
//             {!isOngoing && !isCompleted && showStartRide && rideStatus.type !== 'auto-cancelled' && rideStatus.type !== 'cancelled' && (
//               <>
//                 <View style={styles.actionButtonsRow}>
//                   <TouchableOpacity style={styles.editButton} onPress={handleEditRide}>
//                     <Ionicons name="create-outline" size={18} color={Colors.primary} />
//                     <Text style={styles.editButtonText}>Edit Ride</Text>
//                   </TouchableOpacity>
//                   <TouchableOpacity style={styles.cancelButton} onPress={handleCancelRide}>
//                     <Ionicons name="close-circle-outline" size={18} color="#DC2626" />
//                     <Text style={styles.cancelButtonText}>Cancel Ride</Text>
//                   </TouchableOpacity>
//                 </View>
//                 <TouchableOpacity style={styles.startRideButton} onPress={handleStartRide}>
//                   <Ionicons name="car-sport" size={20} color="#fff" />
//                   <Text style={styles.startRideButtonText}>Start Ride Now</Text>
//                 </TouchableOpacity>
//               </>
//             )}

//             {/* Ongoing Ride Button */}
//             {showLiveSession && (
//               <TouchableOpacity style={styles.liveSessionButton} onPress={() => navigation.navigate('OngoingRideDriverScreen', { rideId: ride?.id, sessionId: ride?.live_session?.session_id })}>
//                 <Ionicons name="navigate-circle" size={20} color="#fff" />
//                 <Text style={styles.liveSessionButtonText}>Continue Ongoing Ride</Text>
//               </TouchableOpacity>
//             )}

//             <View style={styles.safetyCard}>
//               <View style={styles.simpleInfoLeft}>
//                 <Ionicons name="shield-checkmark-outline" size={20} color="#2457A6" />
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

//       {/* Conflict Resolution Modal */}
//       <Modal visible={conflictModalVisible} transparent animationType="fade">
//         <View style={styles.modalBackdrop}>
//           <View style={styles.conflictModalContent}>
//             <View style={styles.conflictModalHeader}>
//               <Ionicons name="alert-circle" size={48} color="#F59E0B" />
//               <Text style={styles.conflictModalTitle}>Driver's Choice Required</Text>
//             </View>
//             <Text style={styles.conflictModalMessage}>There are two requests for this ride. Please choose which one to accept.</Text>
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
//             <View style={styles.conflictModalButtons}>
//               {conflictData?.modification_request && (
//                 <TouchableOpacity 
//                   style={[styles.conflictModalBtn, styles.approveModBtn]} 
//                   onPress={() => resolveConcurrentRequest('modification', conflictData.modification_request.id, null)} 
//                   disabled={resolvingConflict}
//                 >
//                   <Text style={styles.conflictModalBtnText}>
//                     {resolvingConflict ? 'Processing...' : 'Accept Modification'}
//                   </Text>
//                 </TouchableOpacity>
//               )}
//               {conflictData?.booking_request && (
//                 <TouchableOpacity 
//                   style={[styles.conflictModalBtn, styles.acceptBtn]} 
//                   onPress={() => resolveConcurrentRequest('booking', null, conflictData.booking_request.id)} 
//                   disabled={resolvingConflict}
//                 >
//                   <Text style={styles.conflictModalBtnText}>
//                     {resolvingConflict ? 'Processing...' : 'Accept Booking'}
//                   </Text>
//                 </TouchableOpacity>
//               )}
//             </View>
//             <TouchableOpacity style={styles.conflictModalCloseBtn} onPress={() => setConflictModalVisible(false)}>
//               <Text style={styles.conflictModalCloseBtnText}>Close</Text>
//             </TouchableOpacity>
//           </View>
//         </View>
//       </Modal>

//       {/* Rating Modal */}
//       <Modal visible={ratingModalVisible} transparent animationType="fade">
//         <View style={styles.modalBackdrop}>
//           <View style={styles.modalCard}>
//             <Text style={styles.modalTitle}>Rate Your Rider</Text>
//             <Text style={styles.modalSub}>How was your ride with {selectedRider?.passenger_name || 'this rider'}?</Text>
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
//               <TouchableOpacity 
//                 style={[styles.submitBtn, rating === 0 && { opacity: 0.5 }]} 
//                 onPress={submitRiderRating} 
//                 disabled={rating === 0}
//               >
//                 <Text style={styles.submitBtnText}>Submit Rating</Text>
//               </TouchableOpacity>
//             </View>
//           </View>
//         </View>
//       </Modal>

//       <ProfileImageModal 
//         visible={selectedProfile.visible} 
//         imageUrl={selectedProfile.imageUrl} 
//         name={selectedProfile.name} 
//         onClose={() => setSelectedProfile({ visible: false, imageUrl: null, name: '' })} 
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
  LogBox,
  TextInput,
  Alert,
  Linking
} from 'react-native';
import MapView, { Marker, Polyline, PROVIDER_GOOGLE, Circle } from 'react-native-maps';
import { Ionicons } from '@expo/vector-icons';
import { SvgCssUri } from 'react-native-svg/css';
import { Colors } from '../constants/Colors';
import { useAuth } from '../context/AuthContext';
import { API_BASE_URL, GMAP_API_KEY } from '../config/config_ip';
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

function getInitials(name) {
  if (!name) return 'D';
  const parts = name.trim().split(' ').filter(Boolean);
  if (parts.length > 1) return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
  return parts[0].slice(0, 2).toUpperCase();
}

function isSvgUrl(url) {
  if (!url) return false;
  return url.toLowerCase().includes('.svg') || url.toLowerCase().includes('.svg?');
}

function parseRouteCoordinates(routeCoordinates) {
  if (!routeCoordinates) return [];
  if (!Array.isArray(routeCoordinates)) return [];
  if (routeCoordinates.length === 0) return [];
  
  return routeCoordinates.map((item) => {
    if (Array.isArray(item) && item.length === 2) {
      const lng = Number(item[0]);
      const lat = Number(item[1]);
      if (!isNaN(lng) && !isNaN(lat)) {
        return { longitude: lng, latitude: lat };
      }
    }
    if (item && typeof item === 'object') {
      const lng = Number(item.longitude || item.lng);
      const lat = Number(item.latitude || item.lat);
      if (!isNaN(lng) && !isNaN(lat)) {
        return { longitude: lng, latitude: lat };
      }
    }
    return null;
  }).filter(Boolean);
}

function ProfileImageModal({ visible, imageUrl, name, onClose }) {
  const [imageError, setImageError] = useState(false);
  const isSvg = imageUrl ? isSvgUrl(imageUrl) : false;
  
  useEffect(() => {
    if (visible) {
      setImageError(false);
    }
  }, [visible, imageUrl]);
  
  if (!visible) return null;
  
  return (
    <Modal visible={visible} transparent={true} animationType="fade" onRequestClose={onClose}>
      <TouchableOpacity style={styles.modalBackdrop} activeOpacity={1} onPress={onClose}>
        <View style={styles.imageModalContainer}>
          <View style={styles.imageModalContent}>
            <View style={styles.imageModalHeader}>
              <Text style={styles.imageModalTitle}>{name || 'Profile'}</Text>
              <TouchableOpacity onPress={onClose}>
                <Ionicons name="close" size={24} color={Colors.dark} />
              </TouchableOpacity>
            </View>
            {imageUrl && !imageError ? (
              isSvg ? (
                <View style={styles.modalSvgContainer}>
                  <SvgCssUri uri={imageUrl} width="100%" height={400} />
                </View>
              ) : (
                <Image 
                  source={{ uri: imageUrl }} 
                  style={styles.fullProfileImage} 
                  resizeMode="contain"
                  onError={() => setImageError(true)}
                />
              )
            ) : (
              <View style={styles.noImageContainer}>
                <Ionicons name="person-circle-outline" size={80} color={Colors.gray} />
                <Text style={styles.noImageText}>No profile picture available</Text>
              </View>
            )}
          </View>
        </View>
      </TouchableOpacity>
    </Modal>
  );
}

export default function ViewRoutePostedScreen({ navigation, route }) {
  const { user } = useAuth();
  const { ride } = route.params || {};
  const prevBookedSeatsRef = useRef(0);

  const [drawerExpanded, setDrawerExpanded] = useState(true);
  const [mapReady, setMapReady] = useState(false);
  const [bookings, setBookings] = useState([]);
  const [loadingBookings, setLoadingBookings] = useState(false);
  const [pendingModifications, setPendingModifications] = useState([]);
  const [refreshKey, setRefreshKey] = useState(0);
  const [pollingInterval, setPollingInterval] = useState(null);
  const [modifyingRequest, setModifyingRequest] = useState(false);
  const [ratingModalVisible, setRatingModalVisible] = useState(false);
  const [selectedRider, setSelectedRider] = useState(null);
  const [rating, setRating] = useState(0);
  const [feedback, setFeedback] = useState('');
  const [currentSessionId, setCurrentSessionId] = useState(null);
  const [conflictModalVisible, setConflictModalVisible] = useState(false);
  const [conflictData, setConflictData] = useState(null);
  const [resolvingConflict, setResolvingConflict] = useState(false);
  const [totalEarnings, setTotalEarnings] = useState(0);
  const [showCompletionBanner, setShowCompletionBanner] = useState(false);
  const [timelineExpanded, setTimelineExpanded] = useState(false);
  const [selectedStopIndex, setSelectedStopIndex] = useState(null);
  
  // Address geocoding states
  const [addressCache, setAddressCache] = useState({});
  const [loadingAddresses, setLoadingAddresses] = useState(false);
  const [addressFetchProgress, setAddressFetchProgress] = useState({ current: 0, total: 0 });
  
  const animatedDrawer = useRef(new Animated.Value(1)).current;
  const mapRef = useRef(null);
  const socketRef = useRef(null);
  const scrollViewRef = useRef(null);
  
  const [selectedProfile, setSelectedProfile] = useState({
    visible: false,
    imageUrl: null,
    name: '',
  });
  
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
    const timeText = date.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", hour12: false });
    return `${dayText}, ${timeText}`;
  };
  
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

  const showConfirmationAlert = (title, message, onConfirm) => {
    setAlertConfig({
      title,
      message,
      icon: "warning",
      iconColor: "#F59E0B",
      buttons: [
        { text: 'Cancel', onPress: () => setAlertVisible(false), style: 'cancel' },
        { text: 'Confirm', onPress: () => { setAlertVisible(false); onConfirm(); }, style: 'destructive' }
      ]
    });
    setAlertVisible(true);
  };

  // Helper function to check if a booking is cancelled due to modification rejection
  const isBookingCancelledDueToRejection = useCallback((booking) => {
    // Check if booking status is already cancelled
    if (booking.status === 'cancelled') {
      console.log(`🔴 Booking ${booking.booking_id} - status is cancelled`);
      return true;
    }
    
    // Check if booking has rejected modification in its own object
    if (booking.modification_request?.status === 'rejected') {
      console.log(`🔴 Booking ${booking.booking_id} - rejected modification in booking object`);
      return true;
    }
    
    // Check pendingModifications for rejected status
    const hasRejectedMod = pendingModifications.some(
      mod => mod.booking_id === booking.booking_id && mod.status === 'rejected'
    );
    if (hasRejectedMod) {
      console.log(`🔴 Booking ${booking.booking_id} - rejected modification in pendingModifications`);
      return true;
    }
    
    return false;
  }, [pendingModifications]);

 const getActualBookedSeats = useCallback(() => {
  if (!bookings || !Array.isArray(bookings)) return 0;
  
  // Only count bookings that are accepted AND don't have rejected modifications
  const activeBookings = bookings.filter(booking => {
    // Must be accepted
    if (booking.status !== 'accepted') return false;
    
    // Exclude if modification was rejected
    if (booking.modification_request?.status === 'rejected') return false;
    
    // Exclude if pendingModifications has rejected for this booking
    if (pendingModifications.some(mod => mod.booking_id === booking.booking_id && mod.status === 'rejected')) return false;
    
    return true;
  });
  
  const totalBooked = activeBookings.reduce((sum, booking) => {
    return sum + (booking.seats_booked || booking.seats_requested || 0);
  }, 0);
  
  console.log(`📊 Total booked seats: ${totalBooked}`);
  return totalBooked;
}, [bookings, pendingModifications]);

const getActualAvailableSeats = useCallback(() => {
  const totalSeats = ride?.available_seats || 0;
  const bookedSeats = getActualBookedSeats();
  const available = totalSeats - bookedSeats;
  console.log(`📊 Available seats: ${totalSeats} - ${bookedSeats} = ${available}`);
  return Math.max(0, available);
}, [ride?.available_seats, getActualBookedSeats]);

  const confirmedBookings = useMemo(() => {
    return bookings.filter(b => {
      // Must be accepted
      if (b.status !== 'accepted') return false;
      
      // CRITICAL: Check for rejected modification in ANY form
      const hasRejectedMod = 
        b.modification_request?.status === 'rejected' ||
        pendingModifications.some(mod => mod.booking_id === b.booking_id && mod.status === 'rejected');
      
      if (hasRejectedMod) {
        console.log(`❌ Excluding booking ${b.booking_id} from confirmed - has rejected mod`);
        return false;
      }
      
      // Also check if status is cancelled
      if (b.status === 'cancelled') {
        console.log(`❌ Excluding booking ${b.booking_id} from confirmed - status is cancelled`);
        return false;
      }
      
      return true;
    });
  }, [bookings, pendingModifications]);

  // Google Maps Geocoding Function
  const getAddressFromCoordsGoogle = async (lat, lng) => {
    const cacheKey = `${lat},${lng}`;
    
    if (addressCache[cacheKey]) {
      return addressCache[cacheKey];
    }
    
    try {
      const url = `https://maps.googleapis.com/maps/api/geocode/json?latlng=${lat},${lng}&key=${GMAP_API_KEY}&language=en`;
      const response = await fetch(url);
      const data = await response.json();
      
      if (data.status === 'OK' && data.results && data.results[0]) {
        const formattedAddress = data.results[0].formatted_address;
        setAddressCache(prev => ({ ...prev, [cacheKey]: formattedAddress }));
        return formattedAddress;
      } else {
        return `${lat.toFixed(4)}, ${lng.toFixed(4)}`;
      }
    } catch (error) {
      console.log('Geocoding error:', error);
      return `${lat.toFixed(4)}, ${lng.toFixed(4)}`;
    }
  };

  // Fetch addresses for all bookings
  const fetchAllAddresses = useCallback(async () => {
    const activeBookings = bookings.filter(b => 
      b.status === 'accepted' && 
      b.modification_request?.status !== 'rejected' &&
      !pendingModifications.some(mod => mod.booking_id === b.booking_id && mod.status === 'rejected')
    );
    if (activeBookings.length === 0) return;
    
    const coordinatesToFetch = [];
    
    activeBookings.forEach(booking => {
      const pickupLat = booking.intersection_pickup_lat || booking.pickup_lat;
      const pickupLon = booking.intersection_pickup_lon || booking.pickup_lon;
      if (pickupLat && pickupLon) {
        const key = `${pickupLat},${pickupLon}`;
        if (!addressCache[key] && !coordinatesToFetch.find(c => c.key === key)) {
          coordinatesToFetch.push({ key, lat: pickupLat, lng: pickupLon, type: 'pickup', bookingId: booking.booking_id, riderName: booking.passenger_name });
        }
      }
      
      const dropLat = booking.intersection_drop_lat || booking.drop_lat;
      const dropLon = booking.intersection_drop_lon || booking.drop_lon;
      if (dropLat && dropLon) {
        const key = `${dropLat},${dropLon}`;
        if (!addressCache[key] && !coordinatesToFetch.find(c => c.key === key)) {
          coordinatesToFetch.push({ key, lat: dropLat, lng: dropLon, type: 'dropoff', bookingId: booking.booking_id, riderName: booking.passenger_name });
        }
      }
    });
    
    if (coordinatesToFetch.length === 0) return;
    
    setLoadingAddresses(true);
    setAddressFetchProgress({ current: 0, total: coordinatesToFetch.length });
    
    const batchSize = 5;
    for (let i = 0; i < coordinatesToFetch.length; i += batchSize) {
      const batch = coordinatesToFetch.slice(i, i + batchSize);
      await Promise.all(batch.map(async (coord) => {
        const address = await getAddressFromCoordsGoogle(coord.lat, coord.lng);
        setAddressFetchProgress(prev => ({ ...prev, current: prev.current + 1 }));
        return address;
      }));
      
      if (i + batchSize < coordinatesToFetch.length) {
        await new Promise(resolve => setTimeout(resolve, 200));
      }
    }
    
    setLoadingAddresses(false);
  }, [bookings, addressCache, pendingModifications]);





  const checkForConcurrentRequests = useCallback(async () => {
    if (!ride?.id) return;
    try {
      const response = await fetch(`${API_BASE_URL}/ride/${ride.id}/concurrent-requests?_t=${Date.now()}`);
      const data = await response.json();
      
      if (data.has_concurrent_requests) {
        setConflictData(data);
        setConflictModalVisible(true);
      }
    } catch (error) {
      console.log('Error checking concurrent requests:', error);
    }
  }, [ride?.id]);

  const resolveConcurrentRequest = async (choice, modificationRequestId, bookingId) => {
    if (!conflictData) return;
    
    setResolvingConflict(true);
    try {
      const response = await fetch(`${API_BASE_URL}/ride/${conflictData.ride.id}/resolve-concurrent-requests`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          choice: choice,
          modification_request_id: modificationRequestId,
          booking_id: bookingId,
          driver_phone: user?.phone_number
        })
      });
      
      const data = await response.json();
      
      if (data.success) {
        showCustomAlert('Success', data.message, 'success');
        setConflictModalVisible(false);
        fetchBookings();
        fetchPendingModifications();
      } else {
        showCustomAlert('Error', data.message || 'Failed to process request', 'error');
        fetchBookings();
        fetchPendingModifications();
      }
    } catch (error) {
      console.error('Resolve concurrent request error:', error);
      showCustomAlert('Error', 'Failed to resolve concurrent requests', 'error');
      fetchBookings();
      fetchPendingModifications();
    } finally {
      setResolvingConflict(false);
    }
  };


  const areModificationsLocked = () => {
    const now = new Date();
    const departureTime = new Date(ride?.departure_time);
    const minutesToDeparture = (departureTime - now) / (1000 * 60);
    return minutesToDeparture <= 15 && minutesToDeparture > -30 && !ride?.started_at;
  };

  // Enhanced ride status display with proper cancellation reasons
  const getRideStatusDisplay = () => {
    const now = new Date();
    const departureTime = new Date(ride?.departure_time);
    const minutesToDeparture = (departureTime - now) / (1000 * 60);
    const minutesSinceDeparture = (now - departureTime) / (1000 * 60);
    const hoursSinceDeparture = (now - departureTime) / (1000 * 60 * 60);
    
    if (ride?.cancellation_reason) {
      if (ride.cancellation_reason.includes("Auto-cancelled") || ride.cancellation_reason.includes("auto-cancel")) {
        return { 
          text: "Auto-cancelled", 
          color: "#9CA3AF", 
          icon: "timer-off", 
          type: "auto-cancelled",
          reason: ride.cancellation_reason || "Ride was automatically cancelled as it was not started within 2 hours of departure time."
        };
      }
      return { 
        text: "Cancelled", 
        color: "#DC2626", 
        icon: "close-circle", 
        type: "cancelled",
        reason: ride.cancellation_reason
      };
    }
    
    if (hoursSinceDeparture > 2 && !ride?.started_at && ride?.status !== "completed") {
      return { 
        text: "Auto-cancelled", 
        color: "#9CA3AF", 
        icon: "timer-off", 
        type: "auto-cancelled",
        reason: "Ride auto-cancelled as it was not started within 2 hours of departure time."
      };
    }
    
    if (ride?.status === "completed" || ride?.completed_at) {
      return { text: "Completed", color: "#6B7280", icon: "checkmark-done", type: "completed" };
    }
    
    if (ride?.started_at && ride?.status !== "completed") {
      return { text: "Ongoing", color: "#10B981", icon: "car-sport", type: "ongoing" };
    }
    
    if (minutesSinceDeparture > 0 && minutesSinceDeparture <= 120) {
      return { text: "Late - Start Now", color: "#EF4444", icon: "alert-circle", type: "late" };
    }
    
    if (minutesToDeparture <= 60 && minutesToDeparture > 15) {
      return { text: "Start Soon", color: "#F59E0B", icon: "time-outline", type: "start-soon" };
    }
    
    if (minutesToDeparture <= 15 && minutesToDeparture > 0) {
      return { text: "Active", color: "#10B981", icon: "checkmark-circle", type: "active" };
    }
    
    if (minutesToDeparture > 60) {
      return { text: "Upcoming", color: "#2457A6", icon: "calendar-outline", type: "upcoming" };
    }
    
    return { text: "Upcoming", color: "#2457A6", icon: "calendar-outline", type: "upcoming" };
  };
const fetchBookings = useCallback(async () => {
  if (!ride?.id) return;
  setLoadingBookings(true);
  try {
    const timestamp = Date.now();
    const response = await fetch(`${API_BASE_URL}/ride/${ride.id}/passengers?_t=${timestamp}&_refresh=true`);
    const data = await response.json();
    console.log('🔍 RAW API Response:', JSON.stringify(data, null, 2));

    if (data.passengers && Array.isArray(data.passengers)) {
      let processedPassengers = data.passengers.map(passenger => {
        // Check if this passenger has a rejected modification
        const hasRejectedMod = passenger.modification_request?.status === 'rejected';
        
        // If modification is rejected, mark booking as cancelled in local state
        if (hasRejectedMod) {
          console.log(`🔴 Booking ${passenger.booking_id} has rejected mod - forcing status to cancelled`);
          return {
            ...passenger,
            status: 'cancelled',
            seats_booked: 0,
            driver_rating_given: passenger.driver_rating_given === true || passenger.driver_rating_given === 1,
            driver_rating: passenger.driver_rating || 0,
            driver_feedback: passenger.driver_feedback || '',
            // ✅ Include address fields
            pickup_address: passenger.pickup_address || '',
            dropoff_address: passenger.dropoff_address || '',
            pickup_place_name: passenger.pickup_place_name || '',
            dropoff_place_name: passenger.dropoff_place_name || '',
            modification_request: {
              ...passenger.modification_request,
              status: 'rejected'
            },
          };
        }
        
        return {
          ...passenger,
          driver_rating_given: passenger.driver_rating_given === true || passenger.driver_rating_given === 1,
          driver_rating: passenger.driver_rating || 0,
          driver_feedback: passenger.driver_feedback || '',
          modification_request: passenger.modification_request || null,
          // ✅ ADD THESE ADDRESS FIELDS
          pickup_address: passenger.pickup_address || '',
          dropoff_address: passenger.dropoff_address || '',
          pickup_place_name: passenger.pickup_place_name || '',
          dropoff_place_name: passenger.dropoff_place_name || '',
        };
      });
      
      setBookings(processedPassengers);
    }
  } catch (error) {
    console.log('Error fetching bookings:', error);
  } finally {
    setLoadingBookings(false);
  }
}, [ride?.id]);
// Replace your fetchRejectedModifications with this:
const fetchRejectedModifications = useCallback(async () => {
  if (!ride?.id) return;
  try {
    const response = await fetch(`${API_BASE_URL}/ride/${ride.id}/rejected-modifications?_t=${Date.now()}`);
    const data = await response.json();
    
    if (data.rejected_requests && Array.isArray(data.rejected_requests)) {
      console.log('🔴 Found rejected modifications:', data.rejected_requests);
      
      // Update pendingModifications with rejected ones too
      setPendingModifications(prev => {
        const existingIds = new Set(prev.map(m => m.id));
        const newRejected = data.rejected_requests.filter(r => !existingIds.has(r.id));
        return [...prev, ...newRejected];
      });
      
      // Use functional update to avoid dependency on bookings
      setBookings(prevBookings => 
        prevBookings.map(booking => {
          const hasRejected = data.rejected_requests.some(r => r.booking_id === booking.booking_id);
          if (hasRejected && booking.status === 'accepted') {
            console.log(`🔴 FORCE cancelling booking ${booking.booking_id} due to rejected modification`);
            return { 
              ...booking, 
              status: 'cancelled',
              seats_booked: 0,
              modification_request: { ...booking.modification_request, status: 'rejected' }
            };
          }
          return booking;
        })
      );
    }
  } catch (error) {
    console.log('Error fetching rejected modifications:', error);
  }
}, [ride?.id]); // Only depends on ride.id

// Replace your fetchPendingModifications with this:
const fetchPendingModifications = useCallback(async () => {
  if (!ride?.id) return;
  try {
    const response = await fetch(`${API_BASE_URL}/ride/${ride.id}/pending-modifications?_t=${Date.now()}`);
    const data = await response.json();
    
    if (data.pending_requests && Array.isArray(data.pending_requests)) {
      const latestPerBooking = new Map();
      
      data.pending_requests.forEach(request => {
        const bookingId = request.booking_id;
        const existing = latestPerBooking.get(bookingId);
        
        if (!existing || new Date(request.created_at) > new Date(existing.created_at)) {
          latestPerBooking.set(bookingId, request);
        }
      });
      
      const uniqueRequests = Array.from(latestPerBooking.values());
      
      // Log any rejected requests found
      const rejectedRequests = uniqueRequests.filter(r => r.status === 'rejected');
      if (rejectedRequests.length > 0) {
        console.log('🔴 Found rejected requests in API:', rejectedRequests);
      }
      
      // Use functional update to compare with previous state
      setPendingModifications(prev => {
        // Check if there are actual changes
        const hasChanges = uniqueRequests.length !== prev.length ||
          uniqueRequests.some(newReq => {
            const oldReq = prev.find(r => r.id === newReq.id);
            return oldReq && oldReq.status !== newReq.status;
          }) ||
          uniqueRequests.some(newReq => !prev.find(r => r.id === newReq.id));
        
        if (hasChanges) {
          console.log('📝 Pending modifications changed, updating...');
          return uniqueRequests;
        }
        return prev; // Return same reference if no changes
      });
      
      if (uniqueRequests.length > 0 && !drawerExpanded) {
        setDrawerExpanded(true);
      }
    } else {
      setPendingModifications([]);
    }
  } catch (error) {
    console.log('Error fetching pending modifications:', error);
  }
}, [ride?.id, drawerExpanded]); // Remove pendingModifications and fetchBookings dependencies

// Replace your useFocusEffect with this:
useFocusEffect(
  useCallback(() => {
    // Use a flag to prevent multiple simultaneous calls
    let isMounted = true;
    
    const fetchAllData = async () => {
      if (!isMounted) return;
      await fetchBookings();
      if (!isMounted) return;
      await fetchPendingModifications();
      if (!isMounted) return;
      await fetchRejectedModifications();
      if (!isMounted) return;
      await checkForConcurrentRequests();
      if (!isMounted) return;
      setRefreshKey(prev => prev + 1);
    };
    
    fetchAllData();
    
    return () => {
      isMounted = false;
    };
  }, [fetchBookings, fetchPendingModifications, fetchRejectedModifications, checkForConcurrentRequests])
);

useEffect(() => {
  if (!ride?.id) return;
  
  let isMounted = true;
  let reconnectTimer = null;
  
  const socket = io(API_BASE_URL, {
    transports: ['websocket', 'polling'],
    reconnection: true,
    reconnectionAttempts: 10,
    reconnectionDelay: 1000,
    timeout: 10000,
    path: '/socket.io'
  });
  
  socketRef.current = socket;
  
  socket.on('connect', () => {
    if (!isMounted) return;
    console.log('Socket connected for driver ride updates');
    socket.emit('join-ride-room', ride.id);
    
    if (user?.phone_number) {
      socket.emit('join-user-room', user.phone_number);
    }
  });
  
  socket.on('connect_error', (error) => {
    console.log('Socket connection error:', error.message);
  });
  
  socket.on('seats-released', (data) => {
    if (!isMounted) return;
    console.log('Seats released event received:', data);
    if (data.ride_id === ride.id) {
      showCustomAlert('Seats Available', data.message || `${data.seats_released} seat(s) are now available for this ride.`, 'info');
      // Use setTimeout to prevent state updates during render
      setTimeout(() => {
        if (isMounted) {
          fetchBookings();
          fetchPendingModifications();
          setRefreshKey(prev => prev + 1);
        }
      }, 0);
    }
  });
  
  socket.on('disconnect', (reason) => {
    console.log('Socket disconnected:', reason);
    if (reason === 'io server disconnect') {
      reconnectTimer = setTimeout(() => {
        if (socketRef.current && isMounted) {
          socketRef.current.connect();
        }
      }, 1000);
    }
  });
  
  socket.on('reconnect', () => {
    if (!isMounted) return;
    console.log('Socket reconnected');
    if (ride?.id) {
      socket.emit('join-ride-room', ride.id);
    }
  });
  
  socket.on('new-modification-request', (data) => {
    if (!isMounted) return;
    console.log('New modification request received:', data);
    if (data.ride_id === ride.id) {
      showCustomAlert('New Modification Request', `${data.passenger_name} wants to change from ${data.current_seats} to ${data.requested_seats} seat(s)`, 'info');
      setTimeout(() => {
        if (isMounted) {
          fetchPendingModifications();
          fetchBookings();
          checkForConcurrentRequests();
        }
      }, 0);
    }
  });
  
  socket.on('modification-rejected', (data) => {
    if (!isMounted) return;
    console.log('Modification rejected event received:', data);
    if (data.ride_id === ride.id) {
      setPendingModifications(prev => 
        prev.map(mod => 
          mod.id === data.request_id 
            ? { ...mod, status: 'rejected' }
            : mod
        )
      );
      
      showCustomAlert('Modification Rejected', 
        `The modification request for ${data.passenger_name || 'a passenger'} was rejected. The original booking has been cancelled and seats are now available.`, 
        'warning');
      
      setTimeout(() => {
        if (isMounted) {
          fetchBookings();
          fetchPendingModifications();
          checkForConcurrentRequests();
        }
      }, 0);
    }
  });

  socket.on('modification-response', (data) => {
    if (!isMounted) return;
    console.log('Modification response received:', data);
    if (data.ride_id === ride.id) {
      setPendingModifications(prev => 
        prev.map(mod => 
          mod.id === data.request_id 
            ? { ...mod, status: data.action === 'approved' ? 'approved' : 'rejected' }
            : mod
        )
      );
      
      if (data.action === 'approved') {
        showCustomAlert('Modification Approved', `You approved seat change for ${data.passenger_name || 'passenger'}`, 'success');
      } else {
        showCustomAlert('Modification Rejected', 
          `You rejected the seat change request. The original booking has been CANCELLED and seats released.`, 
          'warning');
      }
      
      setTimeout(() => {
        if (isMounted) {
          fetchPendingModifications();
          fetchBookings();
          checkForConcurrentRequests();
        }
      }, 0);
    }
  });
  
  socket.on('booking-update', (data) => {
    if (!isMounted) return;
    console.log('Booking update received:', data);
    if (data.ride_id === ride.id) {
      setTimeout(() => {
        if (isMounted) {
          fetchBookings();
          checkForConcurrentRequests();
        }
      }, 0);
    }
  });
  
  socket.on('rider-reached-pickup', (data) => {
    if (!isMounted) return;
    console.log('Rider reached pickup:', data);
    showCustomAlert('Rider Arrived', `${data.rider_name || 'A rider'} has reached the pickup location`, 'info');
  });
  
  socket.on('rider-boarded', (data) => {
    if (!isMounted) return;
    console.log('Rider boarded:', data);
    showCustomAlert('Rider Boarded', `${data.rider_name || 'A rider'} has boarded the vehicle`, 'success');
    setTimeout(() => {
      if (isMounted) {
        fetchBookings();
      }
    }, 0);
  });
  
  socket.on('rider-dropped-off', (data) => {
    if (!isMounted) return;
    console.log('Rider dropped off:', data);
    showCustomAlert('Rider Dropped Off', `${data.rider_name || 'A rider'} has been dropped off`, 'info');
    setTimeout(() => {
      if (isMounted) {
        fetchBookings();
      }
    }, 0);
  });
  
  socket.on('concurrent-requests-detected', (data) => {
    if (!isMounted) return;
    console.log('Concurrent requests detected:', data);
    if (data.ride_id === ride.id) {
      setTimeout(() => {
        if (isMounted) {
          checkForConcurrentRequests();
        }
      }, 0);
    }
  });
  
  socket.on('ride-completed', (data) => {
    if (!isMounted) return;
    console.log('Ride completed event:', data);
    if (data.ride_id === ride.id) {
      setShowCompletionBanner(true);
      showCustomAlert('Ride Completed', 'This ride has been successfully completed!', 'success');
      setTimeout(() => {
        if (isMounted) {
          fetchBookings();
          setShowCompletionBanner(false);
        }
      }, 5000);
    }
  });
  
  socket.on('ride-auto-cancelled', (data) => {
    if (!isMounted) return;
    console.log('Ride auto-cancelled event:', data);
    if (data.ride_id === ride.id) {
      const reason = data.reason || "Ride was auto-cancelled as it was not started within 2 hours of departure time.";
      showCustomAlert('Ride Auto-Cancelled', reason, 'warning');
      setTimeout(() => {
        if (isMounted) {
          fetchBookings();
          setRefreshKey(prev => prev + 1);
        }
      }, 0);
    }
  });
  
  const interval = setInterval(() => {
    if (isMounted) {
      fetchPendingModifications();
    }
  }, 10000);
  
  setPollingInterval(interval);
  
  return () => {
    isMounted = false;
    if (reconnectTimer) {
      clearTimeout(reconnectTimer);
    }
    if (interval) {
      clearInterval(interval);
    }
    if (socketRef.current) {
      socketRef.current.emit('leave-ride-room', ride.id);
      socketRef.current.disconnect();
      socketRef.current = null;
    }
  };
}, [ride?.id, user?.phone_number]); // Removed dependencies that cause infinite loops
// Also fix the modification action handler to prevent loops:
// const handleModificationAction = async (requestId, action, requestedSeats, currentSeats, bookingId, passengerName) => {
//   const message = action === 'approve' 
//     ? `Are you sure you want to approve the seat change request from ${currentSeats} to ${requestedSeats} seats for ${passengerName}?`
//     : `⚠️ WARNING: Rejecting this modification will CANCEL the original booking of ${currentSeats} seat(s) for ${passengerName}. The seats will be released immediately. Are you sure?`;
  
//   showConfirmationAlert(`${action === 'approve' ? 'Approve' : 'Reject'} Modification`, message, async () => {
//     setModifyingRequest(true);
//     try {
//       const url = `${API_BASE_URL}/modification-request/${requestId}/${action}`;
//       console.log(`🔍 Calling API: ${url}`);
      
//       const response = await fetch(url, { method: 'PUT' });
//       const data = await response.json();
      
//       console.log(`📡 API Response:`, data);
      
//       if (!response.ok) throw new Error(data.detail || `Failed to ${action} modification`);
      
//       if (action === 'reject') {
//         console.log(`🔴 REJECTING modification for booking ${bookingId}`);
        
//         // Update pendingModifications using functional update
//         setPendingModifications(prev => 
//           prev.map(mod => 
//             mod.id === requestId 
//               ? { ...mod, status: 'rejected' }
//               : mod
//           )
//         );
        
//         // Cancel the booking locally using functional update
//         setBookings(prevBookings => 
//           prevBookings.map(booking => 
//             booking.booking_id === bookingId 
//               ? { 
//                   ...booking, 
//                   status: 'cancelled',
//                   seats_booked: 0,
//                   modification_request: {
//                     ...booking.modification_request,
//                     status: 'rejected',
//                     current_seats: currentSeats,
//                     requested_seats: requestedSeats,
//                     rejection_reason: data.rejection_reason || 'Modification request rejected by driver'
//                   }
//                 }
//               : booking
//           )
//         );
        
//         showCustomAlert('Booking Cancelled', 
//           `The modification request was REJECTED. The original booking for ${currentSeats} seat(s) has been CANCELLED and ${currentSeats} seat(s) are now available.`, 
//           'warning');
        
//         // Refresh data after a delay
//         setTimeout(() => {
//           fetchBookings();
//           fetchPendingModifications();
//         }, 500);
        
//       } else {
//         // Handle approval
//         setPendingModifications(prev => 
//           prev.map(mod => 
//             mod.id === requestId 
//               ? { ...mod, status: 'approved' }
//               : mod
//           )
//         );
        
//         setBookings(prevBookings => 
//           prevBookings.map(booking => 
//             booking.booking_id === bookingId 
//               ? { 
//                   ...booking, 
//                   seats_booked: requestedSeats,
//                   modification_request: {
//                     ...booking.modification_request,
//                     status: 'approved',
//                     requested_seats: requestedSeats
//                   }
//                 }
//               : booking
//           )
//         );
        
//         showCustomAlert('Success', 
//           `Modification request approved successfully. Seats updated from ${currentSeats} to ${requestedSeats}.`, 
//           'success');
//       }
      
//       if (socketRef.current) {
//         socketRef.current.emit('modification-response', {
//           ride_id: ride.id,
//           request_id: requestId,
//           action: action,
//           booking_id: bookingId
//         });
//       }
      
//     } catch (error) {
//       console.error('Modification action error:', error);
//       showCustomAlert('Error', error.message, 'error');
//     } finally {
//       setModifyingRequest(false);
//     }
//   });
// };
const handleModificationAction = async (requestId, action, requestedSeats, currentSeats, bookingId, passengerName) => {
  const message = action === 'approve' 
    ? `Are you sure you want to approve the seat change request from ${currentSeats} to ${requestedSeats} seats for ${passengerName}?`
    : `⚠️ WARNING: Rejecting this modification will CANCEL the original booking of ${currentSeats} seat(s) for ${passengerName}. The seats will be released immediately. Are you sure?`;
  
  showConfirmationAlert(`${action === 'approve' ? 'Approve' : 'Reject'} Modification`, message, async () => {
    setModifyingRequest(true);
    try {
      // Make sure we send the booking_id when rejecting
      const url = `${API_BASE_URL}/modification-request/${requestId}/${action}`;
      console.log(`🔍 Calling API: ${url}`);
      
      // For reject action, include the booking_id and current_seats in the request body
      const requestBody = action === 'reject' ? {
        booking_id: bookingId,
        current_seats: currentSeats,
        release_seats: true
      } : {};
      
      const response = await fetch(url, { 
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: action === 'reject' ? JSON.stringify(requestBody) : undefined
      });
      const data = await response.json();
      
      console.log(`📡 API Response:`, data);
      
      if (!response.ok) throw new Error(data.detail || `Failed to ${action} modification`);
      
      if (action === 'reject') {
        console.log(`🔴 REJECTING modification for booking ${bookingId}`);
        
        // CRITICAL: Immediately update local state to show seats are released
        const releasedSeats = currentSeats;
        
        // Update pendingModifications
        setPendingModifications(prev => 
          prev.map(mod => 
            mod.id === requestId 
              ? { ...mod, status: 'rejected' }
              : mod
          )
        );
        
        // Cancel the booking locally
        setBookings(prevBookings => {
          const updatedBookings = prevBookings.map(booking => {
            if (booking.booking_id === bookingId) {
              console.log(`❌ Cancelling booking ${bookingId} - releasing ${currentSeats} seats`);
              return { 
                ...booking, 
                status: 'cancelled',
                seats_booked: 0,
                modification_request: {
                  ...booking.modification_request,
                  status: 'rejected',
                  current_seats: currentSeats,
                  requested_seats: requestedSeats,
                  rejection_reason: data.rejection_reason || 'Modification request rejected by driver'
                }
              };
            }
            return booking;
          });
          
          // Log the new seat counts
          const newBookedSeats = updatedBookings
            .filter(b => b.status === 'accepted')
            .reduce((sum, b) => sum + (b.seats_booked || 0), 0);
          console.log(`📊 New total booked seats after cancellation: ${newBookedSeats}`);
          console.log(`📊 Seats released: ${releasedSeats}`);
          
          return updatedBookings;
        });
        
        // Update the ride's available seats in local state
        if (ride?.id) {
          setAvailableRides(prevRides => 
            prevRides.map(rideItem => {
              if (rideItem.id === ride.id) {
                const newAvailableSeats = (rideItem.seatsAvailable || 0) + releasedSeats;
                console.log(`🔄 Updating ride available seats: ${rideItem.seatsAvailable} -> ${newAvailableSeats}`);
                return { ...rideItem, seatsAvailable: newAvailableSeats };
              }
              return rideItem;
            })
          );
        }
        
        showCustomAlert('Booking Cancelled', 
          `The modification request was REJECTED. The original booking for ${currentSeats} seat(s) has been CANCELLED and ${currentSeats} seat(s) are now available.`, 
          'warning');
        
        // Force refresh ALL data to ensure seat counts are accurate
        setTimeout(() => {
          console.log('🔄 Refreshing all data after rejection...');
          fetchBookings();
          fetchPendingModifications();
          fetchRejectedModifications();
          
          // Also refresh the ride data to update available seats
          if (ride?.id) {
            fetch(`${API_BASE_URL}/ride/${ride.id}`)
              .then(res => res.json())
              .then(data => {
                if (data.ride) {
                  console.log(`📊 Updated ride from API - available seats: ${data.ride.available_seats}`);
                  // Force update the ride data in parent component if needed
                  if (onRideUpdate) {
                    onRideUpdate(data.ride);
                  }
                }
              })
              .catch(err => console.log('Error refreshing ride:', err));
          }
        }, 500);
        
      } else {
        // Handle approval
        setPendingModifications(prev => 
          prev.map(mod => 
            mod.id === requestId 
              ? { ...mod, status: 'approved' }
              : mod
          )
        );
        
        setBookings(prevBookings => 
          prevBookings.map(booking => 
            booking.booking_id === bookingId 
              ? { 
                  ...booking, 
                  seats_booked: requestedSeats,
                  modification_request: {
                    ...booking.modification_request,
                    status: 'approved',
                    requested_seats: requestedSeats
                  }
                }
              : booking
          )
        );
        
        showCustomAlert('Success', 
          `Modification request approved successfully. Seats updated from ${currentSeats} to ${requestedSeats}.`, 
          'success');
      }
      
      // Emit socket event to notify all clients
      if (socketRef.current) {
        socketRef.current.emit('modification-response', {
          ride_id: ride.id,
          request_id: requestId,
          action: action,
          booking_id: bookingId,
          seats_released: action === 'reject' ? currentSeats : 0,
          new_available_seats: action === 'reject' ? (ride?.available_seats || 0) + currentSeats : ride?.available_seats
        });
        
        // Also emit a specific seats-released event for passengers
        if (action === 'reject') {
          socketRef.current.emit('seats-released', {
            ride_id: ride.id,
            seats_released: currentSeats,
            new_available_seats: (ride?.available_seats || 0) + currentSeats,
            message: `${currentSeats} seat(s) are now available for booking!`
          });
        }
      }
      
    } catch (error) {
      console.error('Modification action error:', error);
      showCustomAlert('Error', error.message, 'error');
    } finally {
      setModifyingRequest(false);
    }
  });
};
  // Debug useEffect
  useEffect(() => {
    console.log('🔄 Bookings state updated:', bookings.map(b => ({
      id: b.booking_id,
      name: b.passenger_name,
      status: b.status,
      seats: b.seats_booked,
      modStatus: b.modification_request?.status
    })));
    console.log('🔄 PendingModifications state:', pendingModifications);
    console.log('🔄 ConfirmedBookings count:', confirmedBookings.length);
    console.log('🔄 Actual booked seats:', getActualBookedSeats());
  }, [bookings, pendingModifications, confirmedBookings, getActualBookedSeats]);

  const handleBookingAction = async (bookingId, action) => {
    showConfirmationAlert(`${action === "accept" ? "Accept" : "Reject"} Request`, `Are you sure you want to ${action} this booking request?`, async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/booking/${bookingId}/${action}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
        });
        const data = await response.json();
        
        if (!response.ok) throw new Error(data.detail || `Failed to ${action} booking`);
        
        showCustomAlert('Success', `Booking ${action}ed successfully`, 'success');
        fetchBookings();
        
        if (socketRef.current) {
          socketRef.current.emit('booking-status-changed', {
            ride_id: ride.id,
            booking_id: bookingId,
            status: action
          });
        }
      } catch (error) {
        showCustomAlert('Error', error.message, 'error');
      }
    });
  };

  const handleRateRider = async (booking, sessionId) => {
    let effectiveSessionId = sessionId || ride?.live_session?.session_id;
    
    if (!effectiveSessionId) {
      try {
        const response = await fetch(`${API_BASE_URL}/booking/${booking.booking_id}/session`);
        const data = await response.json();
        
        if (data.session_id) {
          effectiveSessionId = data.session_id;
        }
      } catch (error) {
        console.log('Error fetching session from booking:', error);
      }
    }
    
    if (!effectiveSessionId) {
      showCustomAlert('Error', 'Cannot rate rider: No session found for this ride', 'error');
      return;
    }
    
    setSelectedRider(booking);
    setCurrentSessionId(effectiveSessionId);
    setRating(0);
    setFeedback('');
    setRatingModalVisible(true);
  };

  const submitRiderRating = async () => {
    if (!selectedRider) return;
    if (rating === 0) {
      showCustomAlert('Rating Required', 'Please select a rating before submitting', 'warning');
      return;
    }
    
    setModifyingRequest(true);
    try {
      const sessionId = currentSessionId;
      if (!sessionId) {
        throw new Error('No session ID found');
      }
      
      const requestBody = {
        booking_id: selectedRider.booking_id,
        rating: rating,
        feedback: typeof feedback === 'string' ? feedback : String(feedback || ''),
      };
      
      const response = await fetch(`${API_BASE_URL}/ride-sessions/${sessionId}/rate-rider`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestBody),
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        if (response.status === 400 && data.detail?.includes('already')) {
          showCustomAlert('Already Rated', 'You have already rated this rider', 'info');
          setRatingModalVisible(false);
          setSelectedRider(null);
          setCurrentSessionId(null);
          setRating(0);
          setFeedback('');
          await fetchBookings();
          return;
        }
        throw new Error(data.detail || 'Failed to submit rating');
      }
      
      setRatingModalVisible(false);
      setRating(0);
      setFeedback('');
      setSelectedRider(null);
      setCurrentSessionId(null);
      
      showCustomAlert('Rating Submitted', `You rated ${selectedRider.passenger_name || 'the rider'} ${rating} stars!`, 'success');
      await fetchBookings();
      
    } catch (error) {
      console.error('Rating error:', error);
      showCustomAlert('Error', error.message || 'Could not submit rating', 'error');
    } finally {
      setModifyingRequest(false);
    }
  };

  const renderStars = () => (
    <View style={styles.starsRow}>
      {[1, 2, 3, 4, 5].map((star) => (
        <TouchableOpacity key={star} onPress={() => setRating(star)}>
          <Ionicons
            name={star <= rating ? 'star' : 'star-outline'}
            size={32}
            color={star <= rating ? '#F59E0B' : '#D1D5DB'}
            style={{ marginHorizontal: 4 }}
          />
        </TouchableOpacity>
      ))}
    </View>
  );

  // Get driver start coordinates
  const driverStart = useMemo(() => {
    if (ride?.origin_lat && ride?.origin_lon) {
      return { latitude: Number(ride.origin_lat), longitude: Number(ride.origin_lon) };
    }
    if (ride?.origin_coords && Array.isArray(ride.origin_coords) && ride.origin_coords.length === 2) {
      return { longitude: Number(ride.origin_coords[0]), latitude: Number(ride.origin_coords[1]) };
    }
    const routeCoords = parseRouteCoordinates(ride?.routeCoordinates);
    if (routeCoords.length > 0) return routeCoords[0];
    return null;
  }, [ride]);

  // Get driver end coordinates
  const driverEnd = useMemo(() => {
    if (ride?.destination_lat && ride?.destination_lon) {
      return { latitude: Number(ride.destination_lat), longitude: Number(ride.destination_lon) };
    }
    if (ride?.destination_coords && Array.isArray(ride.destination_coords) && ride.destination_coords.length === 2) {
      return { longitude: Number(ride.destination_coords[0]), latitude: Number(ride.destination_coords[1]) };
    }
    const routeCoords = parseRouteCoordinates(ride?.routeCoordinates);
    if (routeCoords.length > 0) return routeCoords[routeCoords.length - 1];
    return null;
  }, [ride]);

  const formatDateTime = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return '';
    return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false });
  };

  const routePath = useMemo(() => {
    const fullRoute = parseRouteCoordinates(ride?.routeCoordinates);
    if (fullRoute.length >= 2) return fullRoute;
    if (driverStart && driverEnd) return [driverStart, driverEnd];
    return [];
  }, [ride, driverStart, driverEnd]);

  // Calculate distance between two coordinates (in km)
  const calculateDistance = (lat1, lon1, lat2, lon2) => {
    const R = 6371;
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
              Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
              Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
  };

  // Calculate estimated travel time between points (in minutes)
  const calculateTravelTime = (distanceKm, avgSpeedKmh = 40) => {
    const timeHours = distanceKm / avgSpeedKmh;
    const timeMinutes = Math.round(timeHours * 60);
    return timeMinutes;
  };

  // Format duration display
  const formatDuration = (minutes) => {
    if (minutes < 60) return `${minutes} min`;
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`;
  };

  // Get all map markers - ONLY for active accepted bookings (not cancelled)
 const getAllMapMarkers = useMemo(() => {
    const markers = [];
    // Only include active bookings that are accepted and not rejected
    const activeBookings = bookings.filter(b => 
      b.status === 'accepted' && 
      b.modification_request?.status !== 'rejected' &&
      !pendingModifications.some(mod => mod.booking_id === b.booking_id && mod.status === 'rejected')
    );
    
    // Driver start point
    if (driverStart?.latitude && driverStart?.longitude) {
      markers.push({
        id: 'driver-start',
        type: 'start',
        coordinate: driverStart,
        title: '🚗 Trip Start',
        address: ride?.origin || 'Starting point',
        time: formatDateTime(ride?.departure_time),
        icon: 'flag',
        order: 0,
        walkDistance: null,
        description: `Departure: ${formatDate(ride?.departure_time)}`
      });
    }
    
    // Add rider pickup points
    activeBookings.forEach((booking) => {
      const pickupLat = booking.intersection_pickup_lat || booking.pickup_lat;
      const pickupLon = booking.intersection_pickup_lon || booking.pickup_lon;
      if (pickupLat && pickupLon) {
        // ✅ Use saved address from booking
        const savedPickupAddress = booking.pickup_address || booking.pickup_place_name || '';
        const displayAddress = savedPickupAddress || booking.origin || 'Pickup location';
        
        markers.push({
          id: `pickup-${booking.booking_id}`,
          type: 'pickup',
          coordinate: { latitude: Number(pickupLat), longitude: Number(pickupLon) },
          title: `📍 Pickup: ${booking.passenger_name || 'Rider'}`,
          address: displayAddress,
          walkDistance: booking.pickup_walk_distance_m,
          walkDuration: booking.pickup_walk_distance_m ? Math.round(booking.pickup_walk_distance_m / 80) : null,
          riderName: booking.passenger_name,
          seats: booking.seats_booked,
          icon: 'person-add',
          order: markers.length,
          description: `${booking.seats_booked} seat(s) • ${booking.pickup_walk_distance_m ? `${booking.pickup_walk_distance_m}m walk` : 'Direct pickup'}`
        });
      }
    });
    
    // Add rider dropoff points
    activeBookings.forEach((booking) => {
      const dropLat = booking.intersection_drop_lat || booking.drop_lat;
      const dropLon = booking.intersection_drop_lon || booking.drop_lon;
      if (dropLat && dropLon) {
        // ✅ Use saved address from booking
        const savedDropoffAddress = booking.dropoff_address || booking.dropoff_place_name || '';
        const displayAddress = savedDropoffAddress || booking.destination || 'Dropoff location';
        
        markers.push({
          id: `dropoff-${booking.booking_id}`,
          type: 'dropoff',
          coordinate: { latitude: Number(dropLat), longitude: Number(dropLon) },
          title: `🏁 Dropoff: ${booking.passenger_name || 'Rider'}`,
          address: displayAddress,
          walkDistance: booking.drop_walk_distance_m,
          walkDuration: booking.drop_walk_distance_m ? Math.round(booking.drop_walk_distance_m / 80) : null,
          riderName: booking.passenger_name,
          seats: booking.seats_booked,
          icon: 'flag',
          order: markers.length,
          description: `${booking.drop_walk_distance_m ? `${booking.drop_walk_distance_m}m walk to destination` : 'Direct dropoff'}`
        });
      }
    });
    
    // Driver end point
    if (driverEnd?.latitude && driverEnd?.longitude) {
      markers.push({
        id: 'driver-end',
        type: 'end',
        coordinate: driverEnd,
        title: '🏁 Trip End',
        address: ride?.destination || 'Destination',
        time: formatDateTime(ride?.expected_end_time || ride?.departure_time),
        icon: 'flag',
        order: markers.length,
        walkDistance: null,
        description: 'Final destination'
      });
    }
    
    return markers.sort((a, b) => a.order - b.order);
  }, [bookings, driverStart, driverEnd, ride, pendingModifications]);
  // Get walking path lines - ONLY for active accepted bookings
  const walkingPaths = useMemo(() => {
    const paths = [];
    const activeBookings = bookings.filter(b => 
      b.status === 'accepted' && 
      b.modification_request?.status !== 'rejected' &&
      !pendingModifications.some(mod => mod.booking_id === b.booking_id && mod.status === 'rejected')
    );
    
    activeBookings.forEach(booking => {
      // Pickup walking path
      const pickupLat = booking.intersection_pickup_lat || booking.pickup_lat;
      const pickupLon = booking.intersection_pickup_lon || booking.pickup_lon;
      const pickupAddressLat = booking.pickup_lat;
      const pickupAddressLon = booking.pickup_lon;
      
      if (pickupLat && pickupLon && pickupAddressLat && pickupAddressLon) {
        const distance = calculateDistance(
          pickupLat, pickupLon, pickupAddressLat, pickupAddressLon
        );
        if (distance > 0.05) {
          paths.push({
            id: `walking-pickup-${booking.booking_id}`,
            coordinates: [
              { latitude: Number(pickupLat), longitude: Number(pickupLon) },
              { latitude: Number(pickupAddressLat), longitude: Number(pickupAddressLon) }
            ],
            color: '#10B981',
            lineDash: [5, 5],
            walkDistance: booking.pickup_walk_distance_m,
            type: 'pickup'
          });
        }
      }
      
      // Dropoff walking path
      const dropLat = booking.intersection_drop_lat || booking.drop_lat;
      const dropLon = booking.intersection_drop_lon || booking.drop_lon;
      const dropAddressLat = booking.drop_lat;
      const dropAddressLon = booking.drop_lon;
      
      if (dropLat && dropLon && dropAddressLat && dropAddressLon) {
        const distance = calculateDistance(
          dropLat, dropLon, dropAddressLat, dropAddressLon
        );
        if (distance > 0.05) {
          paths.push({
            id: `walking-dropoff-${booking.booking_id}`,
            coordinates: [
              { latitude: Number(dropLat), longitude: Number(dropLon) },
              { latitude: Number(dropAddressLat), longitude: Number(dropAddressLon) }
            ],
            color: '#F59E0B',
            lineDash: [5, 5],
            walkDistance: booking.drop_walk_distance_m,
            type: 'dropoff'
          });
        }
      }
    });
    
    return paths;
  }, [bookings, pendingModifications]);

  // Enhanced trip timeline - ONLY for active accepted bookings
  const sortedTripTimeline = useMemo(() => {
    const allPoints = [];
    let cumulativeDistance = 0;
    let cumulativeDuration = 0;
    
    const activeBookings = bookings.filter(b => 
      b.status === 'accepted' && 
      b.modification_request?.status !== 'rejected' &&
      !pendingModifications.some(mod => mod.booking_id === b.booking_id && mod.status === 'rejected')
    );
    
    // Start point
    if (driverStart?.latitude && driverStart?.longitude) {
      allPoints.push({
        id: 'start',
        type: 'start',
        title: 'Trip Start',
        address: ride?.origin || 'Starting point',
        actualAddress: ride?.origin || 'Starting point',
        time: formatDateTime(ride?.departure_time),
        fullDateTime: ride?.departure_time,
        coordinates: driverStart,
        order: 0,
        icon: '🚗',
        color: '#2457A6'
      });
    }
    
    // Add all pickup and dropoff points from active bookings
    activeBookings.forEach(booking => {
      const pickupLat = booking.intersection_pickup_lat || booking.pickup_lat;
      const pickupLon = booking.intersection_pickup_lon || booking.pickup_lon;
      const pickupCacheKey = `${pickupLat},${pickupLon}`;
      const pickupAddress = addressCache[pickupCacheKey];
      
if (pickupLat && pickupLon) {
  // ✅ Use saved address from booking instead of geocoding
  const savedPickupAddress = booking.pickup_address || booking.pickup_place_name || '';
  const displayAddress = savedPickupAddress || (booking.origin ? booking.origin : `📍 Loading address...`);
  
  allPoints.push({
    id: `pickup-${booking.booking_id}`,
    type: 'pickup',
    title: `Pickup: ${booking.passenger_name || 'Rider'}`,
    address: booking.origin || 'Pickup location',
    actualAddress: displayAddress,
    time: formatDateTime(booking.pickup_time || ride?.departure_time),
    walkDistance: booking.pickup_walk_distance_m,
    walkDuration: booking.pickup_walk_distance_m ? Math.round(booking.pickup_walk_distance_m / 80) : null,
    riderName: booking.passenger_name,
    seats: booking.seats_booked,
    coordinates: { latitude: Number(pickupLat), longitude: Number(pickupLon) },
    icon: '📍',
    color: '#10B981'
  });
}
      
      const dropLat = booking.intersection_drop_lat || booking.drop_lat;
      const dropLon = booking.intersection_drop_lon || booking.drop_lon;
      const dropCacheKey = `${dropLat},${dropLon}`;
      const dropAddress = addressCache[dropCacheKey];
      
     if (dropLat && dropLon) {
  // ✅ Use saved address from booking instead of geocoding
  const savedDropoffAddress = booking.dropoff_address || booking.dropoff_place_name || '';
  const displayAddress = savedDropoffAddress || (booking.destination ? booking.destination : `📍 Loading address...`);
  
  allPoints.push({
    id: `dropoff-${booking.booking_id}`,
    type: 'dropoff',
    title: `Dropoff: ${booking.passenger_name || 'Rider'}`,
    address: booking.destination || 'Dropoff location',
    actualAddress: displayAddress,
    time: formatDateTime(booking.dropoff_time || ride?.expected_end_time),
    walkDistance: booking.drop_walk_distance_m,
    walkDuration: booking.drop_walk_distance_m ? Math.round(booking.drop_walk_distance_m / 80) : null,
    riderName: booking.passenger_name,
    seats: booking.seats_booked,
    coordinates: { latitude: Number(dropLat), longitude: Number(dropLon) },
    icon: '🏁',
    color: '#F59E0B'
  });
}
    });
    
    // End point
    if (driverEnd?.latitude && driverEnd?.longitude) {
      allPoints.push({
        id: 'end',
        type: 'end',
        title: 'Trip End',
        address: ride?.destination || 'Destination',
        actualAddress: ride?.destination || 'Destination',
        time: formatDateTime(ride?.expected_end_time || ride?.departure_time),
        coordinates: driverEnd,
        icon: '🏁',
        color: '#DC2626'
      });
    }
    
    // Sort points based on route order
    const routeCoords = routePath;
    const sortedPoints = [];
    
    if (routeCoords.length > 0) {
      const pointsWithDistance = allPoints.map(point => {
        let minDistance = Infinity;
        let indexOnRoute = -1;
        
        routeCoords.forEach((coord, idx) => {
          const distance = calculateDistance(
            point.coordinates.latitude,
            point.coordinates.longitude,
            coord.latitude,
            coord.longitude
          );
          if (distance < minDistance) {
            minDistance = distance;
            indexOnRoute = idx;
          }
        });
        
        return { ...point, routeIndex: indexOnRoute, distanceToRoute: minDistance };
      });
      
      pointsWithDistance.sort((a, b) => a.routeIndex - b.routeIndex);
      sortedPoints.push(...pointsWithDistance);
    } else {
      sortedPoints.push(...allPoints);
    }
    
    // Calculate cumulative distances and durations
    for (let i = 0; i < sortedPoints.length - 1; i++) {
      const current = sortedPoints[i];
      const next = sortedPoints[i + 1];
      if (current.coordinates && next.coordinates) {
        const distance = calculateDistance(
          current.coordinates.latitude,
          current.coordinates.longitude,
          next.coordinates.latitude,
          next.coordinates.longitude
        );
        const duration = calculateTravelTime(distance);
        
        cumulativeDistance += distance;
        cumulativeDuration += duration;
        
        sortedPoints[i].distanceToNext = distance.toFixed(1);
        sortedPoints[i].durationToNext = duration;
        sortedPoints[i].cumulativeDistance = cumulativeDistance.toFixed(1);
        sortedPoints[i].cumulativeDuration = cumulativeDuration;
        sortedPoints[i].segmentNumber = i + 1;
      }
    }
    
    // Add total trip summary
    if (sortedPoints.length > 0 && sortedPoints[0]) {
      sortedPoints[0].totalDistance = cumulativeDistance.toFixed(1);
      sortedPoints[0].totalDuration = cumulativeDuration;
    }
    
    return sortedPoints;
  }, [bookings, driverStart, driverEnd, ride, routePath, addressCache, pendingModifications]);

  const allMarkerCoords = useMemo(() => {
    const coords = getAllMapMarkers.map(m => m.coordinate).filter(c => c?.latitude && c?.longitude);
    walkingPaths.forEach(path => {
      path.coordinates.forEach(coord => {
        coords.push(coord);
      });
    });
    return coords;
  }, [getAllMapMarkers, walkingPaths]);

  const fitMapToMarkers = useCallback(() => {
    if (mapRef.current && mapReady && allMarkerCoords.length >= 1) {
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
    if (mapReady && allMarkerCoords.length >= 1) fitMapToMarkers();
  }, [mapReady, allMarkerCoords, fitMapToMarkers]);

  const getVehicleName = () => {
    if (ride?.vehicle) {
      const parts = [];
      if (ride.vehicle.make) parts.push(ride.vehicle.make);
      if (ride.vehicle.model) parts.push(ride.vehicle.model);
      if (parts.length > 0) return parts.join(' ');
    }
    return 'Vehicle details unavailable';
  };
  
  const vehicleName = getVehicleName();
  const vehicleRegNumber = ride?.vehicle?.registration_number || null;
  
  const totalSeatsOffered = ride?.available_seats ?? 0;

  const mapHeight = animatedDrawer.interpolate({ inputRange: [0, 1], outputRange: [height - SAFE_TOP - COLLAPSED_HEIGHT, height * 0.35] });
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

  const getStatusColor = (status) => {
    switch (status) {
      case 'accepted': return '#10B981';
      case 'pending': return '#F59E0B';
      case 'rejected': return '#EF4444';
      case 'cancelled': return '#6B7280';
      default: return Colors.gray;
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'accepted': return 'Confirmed';
      case 'pending': return 'Pending';
      case 'rejected': return 'Rejected';
      case 'cancelled': return 'Cancelled';
      default: return status;
    }
  };

  const handleChatWithPassenger = (passengerPhone, passengerName, passengerPhoto) => {
    navigation.navigate('ChatScreen', {
      receiverPhone: passengerPhone,
      conversationId: `chat-${ride?.id}-${passengerPhone}`,
      rideId: ride?.id,
      user: {
        name: passengerName,
        tripInfo: `${ride?.origin || 'Pickup'} → ${ride?.destination || 'Drop'}`,
        phone: passengerPhone,
        profile_picture: passengerPhoto
      }
    });
  };

  const handleStartRide = () => {
    navigation.navigate('StartRideConfirmScreen', { rideId: ride?.id, ride });
  };

  const handleEditRide = () => {
    if (!ride?.id) {
      showCustomAlert("Error", "Cannot edit ride: Ride ID missing", "error");
      return;
    }
    
    if (!user?.phone_number) {
      showCustomAlert("Error", "Please login to edit ride", "error");
      return;
    }
    
    if (ride?.started_at) {
      showCustomAlert("Cannot Edit", "Ride has already started. Cannot edit.", "warning");
      return;
    }
    
    if (ride?.cancellation_reason) {
      showCustomAlert("Cannot Edit", "Cancelled ride cannot be edited.", "warning");
      return;
    }
    
    const rideData = {
      from: ride?.origin || '',
      to: ride?.destination || '',
      dateTime: ride?.departure_time ? new Date(ride.departure_time) : new Date(),
      seatsAvailable: ride?.available_seats || 1,
      pricePerSeat: (ride?.price_per_seat || 0).toString(),
      vehicleId: ride?.vehicle_id || null,
      originCoords: ride?.origin_coords,
      destinationCoords: ride?.destination_coords,
      routeCoordinates: ride?.route_coordinates,
      distanceKm: ride?.distance_km,
      durationText: ride?.duration_text,
      totalPrice: ride?.total_estimated_price,
      preferences: ride?.preferences,
      womenOnly: ride?.women_only,
    };
    
    navigation.navigate('DriveNext', { 
      rideData, 
      isEdit: true, 
      rideId: ride.id, 
      phoneNumber: user?.phone_number 
    });
  };

  const handleCancelRide = () => {
    showConfirmationAlert("Cancel Ride", "Are you sure you want to cancel this ride?", async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/ride/${ride?.id}/cancel`, { method: 'PUT' });
        if (!response.ok) throw new Error('Failed to cancel ride');
        showCustomAlert("Success", "Ride cancelled successfully.", "success");
        setTimeout(() => navigation.goBack(), 1500);
      } catch (err) {
        showCustomAlert("Error", "Could not cancel ride.", "error");
      }
    });
  };
const handleNavigateToLocation = (latitude, longitude, title, address = null) => {
  let navigationUrl;
  
  // PRIORITY 1: Use saved address if available
  if (address && address !== 'null' && address !== 'undefined' && address.trim() !== '') {
    const encodedAddress = encodeURIComponent(address);
    if (Platform.OS === 'ios') {
      navigationUrl = `maps://0,0?q=${encodedAddress}`;
    } else {
      navigationUrl = `geo:0,0?q=${encodedAddress}`;
    }
    console.log('🗺️ Using address for navigation:', address);
  } 
  // PRIORITY 2: Use coordinates as fallback
  else if (latitude && longitude) {
    if (Platform.OS === 'ios') {
      navigationUrl = `maps://0,0?q=${latitude},${longitude}`;
    } else {
      navigationUrl = `geo:0,0?q=${latitude},${longitude}(${encodeURIComponent(title)})`;
    }
    console.log('🗺️ Using coordinates for navigation:', latitude, longitude);
  } 
  else {
    showCustomAlert("Error", "No location available for navigation", "error");
    return;
  }
  
  Linking.openURL(navigationUrl).catch(err => {
    console.log('Navigation error:', err);
    if (address && latitude && longitude) {
      const fallbackUrl = Platform.select({
        ios: `maps://0,0?q=${latitude},${longitude}`,
        android: `geo:0,0?q=${latitude},${longitude}(${encodeURIComponent(title)})`
      });
      Linking.openURL(fallbackUrl).catch(() => {
        showCustomAlert("Error", "Could not open maps. Please try again.", "error");
      });
    } else {
      showCustomAlert("Error", "Could not open maps. Please try again.", "error");
    }
  });
};
//   const handleNavigateToLocation = (latitude, longitude, title) => {
//     const url = Platform.select({
//       ios: `maps:0,0?q=${latitude},${longitude}`,
//       android: `geo:0,0?q=${latitude},${longitude}(${encodeURIComponent(title)})`
//     });
//     Linking.openURL(url).catch(err => {
//       showCustomAlert("Error", "Could not open maps", "error");
//     });
//   };

  const focusOnStop = (coordinates) => {
    if (mapRef.current && coordinates) {
      mapRef.current.animateToRegion({
        latitude: coordinates.latitude,
        longitude: coordinates.longitude,
        latitudeDelta: 0.01,
        longitudeDelta: 0.01,
      }, 500);
    }
  };

  const initialRegion = {
    latitude: driverStart?.latitude || 28.6139,
    longitude: driverStart?.longitude || 77.2090,
    latitudeDelta: 0.05,
    longitudeDelta: 0.05,
  };

  const pendingBookings = bookings.filter(b => b.status === 'pending');
  const rideStatus = getRideStatusDisplay();
  const showStartRide = !ride?.started_at && !ride?.cancellation_reason && ride?.status !== 'completed' && rideStatus.type !== 'auto-cancelled';
  const pendingMods = pendingModifications.filter(m => m.status === 'pending' || m.status === undefined);
  const showLiveSession = ride?.live_session?.session_id && ride?.started_at && ride?.status !== 'completed';
  const isCompleted = ride?.status === 'completed' || ride?.completed_at;
  const isOngoing = ride?.started_at && !isCompleted;
  const unratedRiders = confirmedBookings.filter(b => !b.driver_rating_given && b.driver_rating_given !== true);
  const needsRating = isCompleted && unratedRiders.length > 0;
  const showRatingSection = isCompleted && confirmedBookings.length > 0;

  // Render walking path
  const renderWalkingPath = (path) => {
    return (
      <Polyline
        key={path.id}
        coordinates={path.coordinates}
        strokeColor={path.color}
        strokeWidth={3}
        lineDashPattern={path.lineDash}
        lineCap="round"
        lineJoin="round"
      />
    );
  };
  // Render marker on map
const renderMarker = (marker) => {
  let color, size = 36;
  switch (marker.type) {
    case 'start': color = '#2457A6'; size = 42; break;
    case 'end': color = '#DC2626'; size = 42; break;
    case 'pickup': color = '#10B981'; size = 38; break;
    case 'dropoff': color = '#F59E0B'; size = 38; break;
    default: color = '#6B7280'; size = 32;
  }
  
  const iconName = marker.type === 'pickup' ? 'person-add' : (marker.type === 'dropoff' ? 'flag' : 'location');
  
  // Get saved address for navigation
  let navigationAddress = null;
  if (marker.type === 'pickup') {
    const booking = bookings.find(b => b.booking_id === marker.id?.split('-')[1]);
    navigationAddress = booking?.pickup_address || booking?.pickup_place_name || marker.address;
  } else if (marker.type === 'dropoff') {
    const booking = bookings.find(b => b.booking_id === marker.id?.split('-')[1]);
    navigationAddress = booking?.dropoff_address || booking?.dropoff_place_name || marker.address;
  }
  
  return (
    <Marker 
      key={marker.id} 
      coordinate={marker.coordinate} 
      title={marker.title} 
      description={marker.description || marker.address}
      onPress={() => {
        handleNavigateToLocation(
          marker.coordinate.latitude,
          marker.coordinate.longitude,
          marker.title,
          navigationAddress
        );
      }}
    >
      <View style={[styles.customMarker, { backgroundColor: color, width: size, height: size, borderRadius: size / 2 }]}>
        <Ionicons name={iconName} size={size * 0.45} color="#fff" />
        {marker.type === 'pickup' && marker.seats && (
          <View style={styles.markerBadge}>
            <Text style={styles.markerBadgeText}>{marker.seats}</Text>
          </View>
        )}
        {marker.walkDistance && marker.walkDistance > 0 && (
          <View style={[styles.walkBadge, { backgroundColor: marker.type === 'pickup' ? '#10B981' : '#F59E0B' }]}>
            <Ionicons name="walk" size={10} color="#fff" />
            <Text style={styles.walkBadgeText}>{marker.walkDistance}m</Text>
          </View>
        )}
      </View>
    </Marker>
  );
};

//   // Render marker on map
//   const renderMarker = (marker) => {
//     let color, size = 36;
//     switch (marker.type) {
//       case 'start': color = '#2457A6'; size = 42; break;
//       case 'end': color = '#DC2626'; size = 42; break;
//       case 'pickup': color = '#10B981'; size = 38; break;
//       case 'dropoff': color = '#F59E0B'; size = 38; break;
//       default: color = '#6B7280'; size = 32;
//     }
    
//     const iconName = marker.type === 'pickup' ? 'person-add' : (marker.type === 'dropoff' ? 'flag' : 'location');
    
//     return (
//       <Marker 
//         key={marker.id} 
//         coordinate={marker.coordinate} 
//         title={marker.title} 
//         description={marker.description || marker.address}
//       >
//         <View style={[styles.customMarker, { backgroundColor: color, width: size, height: size, borderRadius: size / 2 }]}>
//           <Ionicons name={iconName} size={size * 0.45} color="#fff" />
//           {marker.type === 'pickup' && marker.seats && (
//             <View style={styles.markerBadge}>
//               <Text style={styles.markerBadgeText}>{marker.seats}</Text>
//             </View>
//           )}
//           {marker.walkDistance && marker.walkDistance > 0 && (
//             <View style={[styles.walkBadge, { backgroundColor: marker.type === 'pickup' ? '#10B981' : '#F59E0B' }]}>
//               <Ionicons name="walk" size={10} color="#fff" />
//               <Text style={styles.walkBadgeText}>{marker.walkDistance}m</Text>
//             </View>
//           )}
//         </View>
//       </Marker>
//     );
//   };

//   // Render enhanced trip timeline item
//   const renderTimelineItem = (item, index) => {
//     const isLast = index === sortedTripTimeline.length - 1;
//     const hasWalking = item.walkDistance && item.walkDistance > 0;
    
//     return (
//       <TouchableOpacity 
//         key={item.id} 
//         style={styles.timelineItemCard}
//         onPress={() => focusOnStop(item.coordinates)}
//         activeOpacity={0.7}
//       >
//         <View style={styles.timelineItemLeft}>
//           <View style={[styles.timelineItemDot, { backgroundColor: item.color }]}>
//             <Text style={styles.timelineItemIcon}>{item.icon}</Text>
//           </View>
//           {!isLast && <View style={[styles.timelineItemLine, { backgroundColor: item.color + '40' }]} />}
//         </View>
        
//         <View style={styles.timelineItemRight}>
//           <View style={styles.timelineItemHeader}>
//             <Text style={styles.timelineItemType}>{item.type.toUpperCase()}</Text>
//             {item.segmentNumber && (
//               <View style={styles.segmentBadge}>
//                 <Text style={styles.segmentBadgeText}>Stop {item.segmentNumber}</Text>
//               </View>
//             )}
//           </View>
          
//           <Text style={styles.timelineItemTitle}>{item.title}</Text>
          
//           <View style={styles.timelineItemDetails}>
//             {item.riderName && (
//               <View style={styles.detailChip}>
//                 <Ionicons name="person-outline" size={12} color="#6B7280" />
//                 <Text style={styles.detailChipText}>{item.riderName}</Text>
//               </View>
//             )}
//             {item.seats && (
//               <View style={styles.detailChip}>
//                 <Ionicons name="people-outline" size={12} color="#6B7280" />
//                 <Text style={styles.detailChipText}>{item.seats} seat{item.seats > 1 ? 's' : ''}</Text>
//               </View>
//             )}
//             {item.time && (
//               <View style={styles.detailChip}>
//                 <Ionicons name="time-outline" size={12} color="#6B7280" />
//                 <Text style={styles.detailChipText}>{item.time}</Text>
//               </View>
//             )}
//           </View>
          
//           <Text style={styles.timelineItemAddress} numberOfLines={2}>
//             {item.actualAddress || item.address}
//           </Text>
          
//           {hasWalking && (
//             <View style={[styles.walkingChip, { backgroundColor: item.color + '15' }]}>
//               <Ionicons name="walk" size={14} color={item.color} />
//               <Text style={[styles.walkingChipText, { color: item.color }]}>
//                 Walk {item.walkDistance}m • ~{item.walkDuration} min
//               </Text>
//             </View>
//           )}
          
//           {item.distanceToNext && (
//             <View style={styles.routeInfo}>
//               <View style={styles.routeInfoItem}>
//                 <Ionicons name="navigate-outline" size={12} color="#2457A6" />
//                 <Text style={styles.routeInfoText}>Next: {item.distanceToNext} km</Text>
//               </View>
//               <View style={styles.routeInfoItem}>
//                 <Ionicons name="time-outline" size={12} color="#F59E0B" />
//                 <Text style={styles.routeInfoText}>~{formatDuration(item.durationToNext)}</Text>
//               </View>
//               {item.cumulativeDistance && (
//                 <View style={styles.routeInfoItem}>
//                   <Ionicons name="flag-outline" size={12} color="#10B981" />
//                   <Text style={styles.routeInfoText}>Total: {item.cumulativeDistance} km</Text>
//                 </View>
//               )}
//             </View>
//           )}
          
//           <TouchableOpacity 
//             style={styles.navigateButton}
//             onPress={() => handleNavigateToLocation(
//               item.coordinates.latitude,
//               item.coordinates.longitude,
//               item.title
//             )}
//           >
//             <Ionicons name="navigate-circle" size={16} color="#2457A6" />
//             <Text style={styles.navigateButtonText}>Navigate to this stop</Text>
//           </TouchableOpacity>
//         </View>
//       </TouchableOpacity>
//     );
//   };
// Render enhanced trip timeline item
const renderTimelineItem = (item, index) => {
  const isLast = index === sortedTripTimeline.length - 1;
  const hasWalking = item.walkDistance && item.walkDistance > 0;
  
  // Get the actual saved address for navigation
  let navigationAddress = null;
  if (item.type === 'pickup') {
    // Find the booking for this item to get saved address
    const booking = bookings.find(b => b.booking_id === item.id?.split('-')[1]);
    if (booking) {
      navigationAddress = booking.pickup_address || booking.pickup_place_name || item.actualAddress || item.address;
    } else {
      navigationAddress = item.actualAddress || item.address;
    }
  } else if (item.type === 'dropoff') {
    const booking = bookings.find(b => b.booking_id === item.id?.split('-')[1]);
    if (booking) {
      navigationAddress = booking.dropoff_address || booking.dropoff_place_name || item.actualAddress || item.address;
    } else {
      navigationAddress = item.actualAddress || item.address;
    }
  } else {
    navigationAddress = item.actualAddress || item.address;
  }
  
  return (
    <TouchableOpacity 
      key={item.id} 
      style={styles.timelineItemCard}
      onPress={() => focusOnStop(item.coordinates)}
      activeOpacity={0.7}
    >
      <View style={styles.timelineItemLeft}>
        <View style={[styles.timelineItemDot, { backgroundColor: item.color }]}>
          <Text style={styles.timelineItemIcon}>{item.icon}</Text>
        </View>
        {!isLast && <View style={[styles.timelineItemLine, { backgroundColor: item.color + '40' }]} />}
      </View>
      
      <View style={styles.timelineItemRight}>
        <View style={styles.timelineItemHeader}>
          <Text style={styles.timelineItemType}>{item.type.toUpperCase()}</Text>
          {item.segmentNumber && (
            <View style={styles.segmentBadge}>
              <Text style={styles.segmentBadgeText}>Stop {item.segmentNumber}</Text>
            </View>
          )}
        </View>
        
        <Text style={styles.timelineItemTitle}>{item.title}</Text>
        
        <View style={styles.timelineItemDetails}>
          {item.riderName && (
            <View style={styles.detailChip}>
              <Ionicons name="person-outline" size={12} color="#6B7280" />
              <Text style={styles.detailChipText}>{item.riderName}</Text>
            </View>
          )}
          {item.seats && (
            <View style={styles.detailChip}>
              <Ionicons name="people-outline" size={12} color="#6B7280" />
              <Text style={styles.detailChipText}>{item.seats} seat{item.seats > 1 ? 's' : ''}</Text>
            </View>
          )}
          {item.time && (
            <View style={styles.detailChip}>
              <Ionicons name="time-outline" size={12} color="#6B7280" />
              <Text style={styles.detailChipText}>{item.time}</Text>
            </View>
          )}
        </View>
        
        <Text style={styles.timelineItemAddress} numberOfLines={2}>
          {item.actualAddress || item.address}
        </Text>
        
        {hasWalking && (
          <View style={[styles.walkingChip, { backgroundColor: item.color + '15' }]}>
            <Ionicons name="walk" size={14} color={item.color} />
            <Text style={[styles.walkingChipText, { color: item.color }]}>
              Walk {item.walkDistance}m • ~{item.walkDuration} min
            </Text>
          </View>
        )}
        
        {item.distanceToNext && (
          <View style={styles.routeInfo}>
            <View style={styles.routeInfoItem}>
              <Ionicons name="navigate-outline" size={12} color="#2457A6" />
              <Text style={styles.routeInfoText}>Next: {item.distanceToNext} km</Text>
            </View>
            <View style={styles.routeInfoItem}>
              <Ionicons name="time-outline" size={12} color="#F59E0B" />
              <Text style={styles.routeInfoText}>~{formatDuration(item.durationToNext)}</Text>
            </View>
            {item.cumulativeDistance && (
              <View style={styles.routeInfoItem}>
                <Ionicons name="flag-outline" size={12} color="#10B981" />
                <Text style={styles.routeInfoText}>Total: {item.cumulativeDistance} km</Text>
              </View>
            )}
          </View>
        )}
        
        <TouchableOpacity 
          style={styles.navigateButton}
          onPress={() => handleNavigateToLocation(
            item.coordinates.latitude,
            item.coordinates.longitude,
            item.title,
            navigationAddress  // Pass the saved address
          )}
        >
          <Ionicons name="navigate-circle" size={16} color="#2457A6" />
          <Text style={styles.navigateButtonText}>Navigate to this stop</Text>
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );
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
          {/* Main route polyline */}
          {routePath.length >= 2 && (
            <>
              <Polyline 
                coordinates={routePath} 
                strokeColor="#2457A6" 
                strokeWidth={6} 
                lineCap="round" 
                lineJoin="round"
              />
              <Polyline 
                coordinates={routePath} 
                strokeColor="#4A7DFF" 
                strokeWidth={3} 
                lineCap="round" 
                lineJoin="round"
                lineDashPattern={[0]}
              />
            </>
          )}
          
          {/* Walking paths for pickup and dropoff */}
          {walkingPaths.map(path => renderWalkingPath(path))}
          
          {/* Proximity circles for pickup points */}
          {getAllMapMarkers.filter(m => m.type === 'pickup' && m.walkDistance).map(marker => (
            <Circle
              key={`circle-${marker.id}`}
              center={marker.coordinate}
              radius={marker.walkDistance}
              strokeColor="rgba(16, 185, 129, 0.3)"
              fillColor="rgba(16, 185, 129, 0.1)"
              strokeWidth={1}
            />
          ))}
          
          {/* All markers */}
          {getAllMapMarkers.map(marker => renderMarker(marker))}
        </MapView>

        <TouchableOpacity style={styles.mapBackButton} onPress={() => navigation.goBack()}>
          <Ionicons name="chevron-back" size={26} color={Colors.secondary} />
        </TouchableOpacity>
        
        {/* Map Legend */}
        <View style={styles.mapLegend}>
          <View style={styles.legendTitle}>
            <Text style={styles.legendTitleText}>Map Legend</Text>
          </View>
          <View style={styles.legendItem}>
            <View style={[styles.legendColor, { backgroundColor: '#2457A6', width: 20 }]} />
            <Text style={styles.legendText}>Main Route</Text>
          </View>
          <View style={styles.legendItem}>
            <View style={[styles.legendColor, { backgroundColor: '#10B981', borderStyle: 'dashed', borderWidth: 1, borderColor: '#10B981' }]} />
            <Text style={styles.legendText}>Walking (Pickup)</Text>
          </View>
          <View style={styles.legendItem}>
            <View style={[styles.legendColor, { backgroundColor: '#F59E0B', borderStyle: 'dashed', borderWidth: 1, borderColor: '#F59E0B' }]} />
            <Text style={styles.legendText}>Walking (Dropoff)</Text>
          </View>
          <View style={styles.legendItem}>
            <View style={[styles.legendDot, { backgroundColor: '#10B981' }]} />
            <Text style={styles.legendText}>Pickup Point</Text>
          </View>
          <View style={styles.legendItem}>
            <View style={[styles.legendDot, { backgroundColor: '#F59E0B' }]} />
            <Text style={styles.legendText}>Dropoff Point</Text>
          </View>
        </View>
        
        {/* Map Controls */}
        <View style={styles.mapControls}>
          <TouchableOpacity 
            style={styles.mapControlButton} 
            onPress={() => fitMapToMarkers()}
          >
            <Ionicons name="map-outline" size={20} color="#2457A6" />
          </TouchableOpacity>
        </View>
      </Animated.View>

      <Animated.View style={[styles.drawer, { height: drawerHeight }]}>
        <View style={styles.handleWrap} {...panResponder.panHandlers}>
          <TouchableOpacity activeOpacity={0.9} onPress={toggleDrawer} style={styles.handleHitArea}>
            <View style={styles.handleBar} />
          </TouchableOpacity>
          {!drawerExpanded && pendingMods.length > 0 && (
            <View style={styles.pendingNotificationBadge}>
              <Text style={styles.pendingNotificationText}>{pendingMods.length}</Text>
            </View>
          )}
        </View>

        {!drawerExpanded ? (
          <View style={styles.collapsedSummary}>
            <View style={styles.collapsedTopRow}>
              <View style={{ flex: 1 }}>
                <Text style={styles.collapsedDriver} numberOfLines={1}>{ride?.driverName || 'Driver'}</Text>
                <Text style={styles.collapsedSub} numberOfLines={1}>{ride?.origin || 'Pickup'} → {ride?.destination || 'Drop'}</Text>
              </View>
              <View style={styles.collapsedPriceWrap}>
                <Text style={styles.collapsedPrice}>₹{ride?.price_per_seat}</Text>
                <Text style={styles.collapsedPerSeat}>per seat</Text>
              </View>
            </View>
            {sortedTripTimeline.length > 0 && sortedTripTimeline[0]?.totalDistance && (
              <View style={styles.collapsedTripInfo}>
                <Text style={styles.collapsedTripText}>
                  📍 {sortedTripTimeline.length} stops • {sortedTripTimeline[0].totalDistance} km • {formatDuration(sortedTripTimeline[0].totalDuration)}
                </Text>
              </View>
            )}
          </View>
        ) : (
          <ScrollView ref={scrollViewRef} style={styles.drawerScroll} contentContainerStyle={styles.drawerContent} showsVerticalScrollIndicator={false}>
            
            {/* Status Banner */}
            <View style={[styles.statusBanner, { backgroundColor: rideStatus.color + '20' }]}>
              <Ionicons name={rideStatus.icon} size={20} color={rideStatus.color} />
              <View style={{ flex: 1 }}>
                <Text style={[styles.statusBannerText, { color: rideStatus.color }]}>{rideStatus.text}</Text>
                {rideStatus.reason && (
                  <Text style={[styles.statusBannerReason, { color: rideStatus.color }]}>{rideStatus.reason}</Text>
                )}
              </View>
            </View>

            {/* Cancellation Banner with Reason */}
            {rideStatus.type === 'cancelled' && ride?.cancellation_reason && (
              <View style={styles.cancellationDetailedBanner}>
                <View style={styles.cancellationHeader}>
                  <Ionicons name="close-circle" size={24} color="#DC2626" />
                  <Text style={styles.cancellationTitle}>Ride Cancelled</Text>
                </View>
                <Text style={styles.cancellationMessage}>{ride.cancellation_reason}</Text>
                {ride.cancelled_by && (
                  <Text style={styles.cancelledByText}>
                    Cancelled by: {ride.cancelled_by === user?.phone_number ? 'You' : 'Driver'}
                  </Text>
                )}
              </View>
            )}

            {/* Trip Overview Card */}
            <View style={styles.tripOverviewCard}>
              <View style={styles.tripOverviewHeader}>
                <Ionicons name="information-circle-outline" size={24} color="#2457A6" />
                <Text style={styles.tripOverviewTitle}>Trip Overview</Text>
              </View>
              <View style={styles.tripOverviewDetails}>
                <View style={styles.tripOverviewItem}>
                  <Text style={styles.tripOverviewLabel}>From</Text>
                  <Text style={styles.tripOverviewValue}>{ride?.origin || 'Starting point'}</Text>
                </View>
                <View style={styles.tripOverviewArrow}>
                  <Ionicons name="arrow-down-outline" size={16} color="#2457A6" />
                </View>
                <View style={styles.tripOverviewItem}>
                  <Text style={styles.tripOverviewLabel}>To</Text>
                  <Text style={styles.tripOverviewValue}>{ride?.destination || 'Destination'}</Text>
                </View>
              </View>
              <View style={styles.tripOverviewStats}>
                <View style={styles.tripOverviewStat}>
                  <Ionicons name="calendar-outline" size={16} color="#6B7280" />
                  <Text style={styles.tripOverviewStatText}>{formatDate(ride?.departure_time)}</Text>
                </View>
                {sortedTripTimeline[0]?.totalDistance && (
                  <View style={styles.tripOverviewStat}>
                    <Ionicons name="map-outline" size={16} color="#6B7280" />
                    <Text style={styles.tripOverviewStatText}>{sortedTripTimeline[0].totalDistance} km total</Text>
                  </View>
                )}
                {sortedTripTimeline[0]?.totalDuration && (
                  <View style={styles.tripOverviewStat}>
                    <Ionicons name="time-outline" size={16} color="#6B7280" />
                    <Text style={styles.tripOverviewStatText}>{formatDuration(sortedTripTimeline[0].totalDuration)} est.</Text>
                  </View>
                )}
              </View>
            </View>

            {/* Total Earnings Banner */}
            {isCompleted && totalEarnings > 0 && (
              <View style={styles.earningsBanner}>
                <View style={styles.earningsBannerLeft}>
                  <View style={styles.earningsIconContainer}>
                    <Ionicons name="cash-outline" size={28} color="#10B981" />
                  </View>
                  <View>
                    <Text style={styles.earningsLabel}>Total Earnings</Text>
                    <Text style={styles.earningsSubLabel}>From confirmed bookings</Text>
                  </View>
                </View>
                <View style={styles.earningsAmountContainer}>
                  <Text style={styles.earningsCurrency}>₹</Text>
                  <Text style={styles.earningsAmount}>{totalEarnings}</Text>
                </View>
              </View>
            )}

            {/* Earnings Breakdown */}
            {isCompleted && confirmedBookings.length > 0 && (
              <View style={styles.earningsBreakdownCard}>
                <Text style={styles.earningsBreakdownTitle}>Earnings Breakdown</Text>
                {confirmedBookings.map((booking) => (
                  <View key={booking.booking_id} style={styles.earningsRow}>
                    <View style={styles.earningsRowLeft}>
                      <View style={styles.earningsRowAvatar}>
                        <Text style={styles.earningsRowInitials}>
                          {getInitials(booking.passenger_name)}
                        </Text>
                      </View>
                      <View>
                        <Text style={styles.earningsRowName}>{booking.passenger_name || 'Rider'}</Text>
                        <Text style={styles.earningsRowSeats}>{booking.seats_booked} seat(s)</Text>
                      </View>
                    </View>
                    <Text style={styles.earningsRowAmount}>
                      ₹{booking.total_amount || booking.seats_booked * (ride?.price_per_seat || 0)}
                    </Text>
                  </View>
                ))}
                <View style={styles.earningsDivider} />
                <View style={styles.earningsTotalRow}>
                  <Text style={styles.earningsTotalLabel}>Total</Text>
                  <Text style={styles.earningsTotalAmount}>₹{totalEarnings}</Text>
                </View>
              </View>
            )}

            {/* Enhanced Trip Timeline Section - Only shows active bookings */}
            {sortedTripTimeline.length > 0 && (
              <View style={styles.cardSection}>
                <TouchableOpacity 
                  style={styles.timelineHeader} 
                  onPress={() => setTimelineExpanded(!timelineExpanded)}
                >
                  <View style={styles.timelineHeaderLeft}>
                    <Ionicons name="map-outline" size={20} color="#2457A6" />
                    <Text style={styles.sectionTitle}>Trip Details</Text>
                  </View>
                  <Ionicons 
                    name={timelineExpanded ? "chevron-up" : "chevron-down"} 
                    size={20} 
                    color={Colors.gray} 
                  />
                </TouchableOpacity>
                
                {timelineExpanded && (
                  <View style={styles.timelineContainer}>
                    {sortedTripTimeline.map((item, index) => renderTimelineItem(item, index))}
                  </View>
                )}
              </View>
            )}

            {/* Vehicle Details */}
            <View style={styles.cardSection}>
              <Text style={styles.sectionTitle}>Vehicle Details</Text>
              <View style={styles.vehicleHeaderRow}>
                <View style={styles.vehicleIconCircle}><Ionicons name="car-sport-outline" size={24} color="#2457A6" /></View>
                <View style={styles.vehicleMeta}>
                  <Text style={styles.vehicleTitle}>{vehicleName}</Text>
                  {vehicleRegNumber && (
                    <View style={styles.vehicleRegContainer}>
                      <Ionicons name="clipboard-outline" size={12} color="#6B7280" />
                      <Text style={styles.vehicleRegText}>Reg: {vehicleRegNumber}</Text>
                    </View>
                  )}
                </View>
              </View>
            </View>

            {/* Seat Information */}
            <View style={styles.cardSection}>
              <Text style={styles.sectionTitle}>Seat Information</Text>
              
              {/* Show warning if there are cancelled bookings due to modification rejection */}
              {bookings.some(b => 
                b.modification_request?.status === 'rejected' || 
                pendingModifications.some(mod => mod.booking_id === b.booking_id && mod.status === 'rejected')
              ) && (
                <View style={styles.rejectedModificationWarning}>
                  <Ionicons name="warning-outline" size={16} color="#DC2626" />
                  <Text style={styles.rejectedModificationWarningText}>
                    ⚠️ Some bookings were cancelled due to modification rejection. Seats have been released.
                  </Text>
                </View>
              )}
              
              <View style={styles.seatInfoContainer}>
                <View style={styles.seatInfoItem}>
                  <View style={[styles.seatIconCircle, { backgroundColor: '#EAF1FF' }]}>
                    <Ionicons name="car-sport-outline" size={24} color="#2457A6" />
                  </View>
                  <Text style={styles.seatInfoLabel}>Total</Text>
                  <Text style={styles.seatInfoValue}>{totalSeatsOffered}</Text>
                </View>
                <View style={styles.seatDivider} />
                <View style={styles.seatInfoItem}>
                  <View style={[styles.seatIconCircle, { backgroundColor: '#E8F5E9' }]}>
                    <Ionicons name="people" size={24} color="#10B981" />
                  </View>
                  <Text style={styles.seatInfoLabel}>Booked</Text>
                  <Text style={[styles.seatInfoValue, { color: '#10B981' }]}>{getActualBookedSeats()}</Text>
                </View>
                <View style={styles.seatDivider} />
                <View style={styles.seatInfoItem}>
                  <View style={[styles.seatIconCircle, { backgroundColor: '#FFF3E0' }]}>
                    <Ionicons name="person-add" size={24} color="#F59E0B" />
                  </View>
                  <Text style={styles.seatInfoLabel}>Available</Text>
                  <Text style={[styles.seatInfoValue, { color: getActualAvailableSeats() > 0 ? '#F59E0B' : '#DC2626' }]}>
                    {getActualAvailableSeats()}
                  </Text>
                </View>
              </View>
              <View style={styles.progressBarContainer}>
                <View style={[styles.progressBar, { width: `${totalSeatsOffered > 0 ? (getActualBookedSeats() / totalSeatsOffered) * 100 : 0}%` }]} />
              </View>
              <Text style={styles.progressText}>
                {getActualBookedSeats()} out of {totalSeatsOffered} seats booked
                {getActualAvailableSeats() > 0 && ` • ${getActualAvailableSeats()} seats available`}
              </Text>
              
              {/* Show seat release message if modification was rejected */}
              {getActualAvailableSeats() > 0 && (bookings.some(b => b.modification_request?.status === 'rejected') || pendingModifications.some(mod => mod.status === 'rejected')) && (
                <Text style={styles.seatReleaseMessage}>
                  ✨ {getActualAvailableSeats()} seat(s) are now available for new bookings
                </Text>
              )}
            </View>

            {/* Confirmed Bookings - Only shows active accepted bookings */}
            {confirmedBookings.length > 0 && (
              <View style={styles.cardSection}>
                <View style={styles.sectionHeaderWithStatus}>
                  <Text style={styles.sectionTitle}>Bookings ✅ ({confirmedBookings.length})</Text>
                  {(rideStatus.type === 'auto-cancelled' || rideStatus.type === 'cancelled') && (
                    <View style={styles.cancelledBadgeSmall}>
                      <Text style={styles.cancelledBadgeSmallText}>Ride Cancelled</Text>
                    </View>
                  )}
                </View>
                
                {confirmedBookings.map((booking) => {
                  const profilePicUrl = booking.profile_picture ? buildImageUrl(booking.profile_picture) : null;
                  const isSvg = profilePicUrl ? isSvgUrl(profilePicUrl) : false;
                  
                  // Check modification status
                  const hasApprovedModification = booking.modification_request?.status === 'approved';
                  const hasPendingModification = booking.modification_request?.status === 'pending';
                  
                  // Also check from pendingModifications array
                  const hasPendingFromArray = pendingModifications.some(
                    pm => pm.booking_id === booking.booking_id && pm.status === 'pending'
                  );
                  
                  const isPendingModification = hasPendingModification || hasPendingFromArray;
                  const isApprovedModification = hasApprovedModification;
                  
                  // Determine effective seat count
                  let effectiveSeatCount = booking.seats_booked || booking.seats_requested || 0;
                  let originalSeatCount = effectiveSeatCount;
                  
                  if (isApprovedModification) {
                    effectiveSeatCount = booking.modification_request?.requested_seats || effectiveSeatCount;
                  }
                  
                  const isRideCancelled = rideStatus.type === 'auto-cancelled' || rideStatus.type === 'cancelled';
                  const showLocationInfo = !isRideCancelled;
                  
                  return (
                    <View key={booking.booking_id} style={styles.bookingItem}>
                      <TouchableOpacity 
                        style={styles.passengerAvatar} 
                        onPress={() => profilePicUrl && setSelectedProfile({ visible: true, imageUrl: profilePicUrl, name: booking.passenger_name })}
                      >
                        {profilePicUrl && !isSvg ? 
                          <Image source={{ uri: profilePicUrl }} style={styles.avatarImage} /> : 
                          profilePicUrl && isSvg ? 
                            <View style={styles.avatarImageSvg}>
                              <SvgCssUri uri={profilePicUrl} width={44} height={44} />
                            </View> : 
                            <View style={styles.avatarPlaceholder}>
                              <Text style={styles.avatarPlaceholderText}>{getInitials(booking.passenger_name)}</Text>
                            </View>
                        }
                      </TouchableOpacity>
                      
                      <View style={styles.bookingInfo}>
                        <Text style={styles.passengerName}>{booking.passenger_name || 'Passenger'}</Text>
                        
                        {isPendingModification && (
                          <View style={styles.modificationStatusBadge}>
                            <Ionicons name="swap" size={12} color="#F59E0B" />
                            <Text style={[styles.modificationStatusText, { color: '#F59E0B' }]}>
                              Modification Request Pending
                            </Text>
                          </View>
                        )}
                        
                        {isApprovedModification && (
                          <View style={[styles.modificationStatusBadge, { backgroundColor: '#E8F5E9' }]}>
                            <Ionicons name="checkmark-circle" size={12} color="#10B981" />
                            <Text style={[styles.modificationStatusText, { color: '#2E7D32' }]}>
                              ✅ Seat Updated: {originalSeatCount} → {effectiveSeatCount} seats
                            </Text>
                          </View>
                        )}
                        
                        <Text style={styles.bookingSeats}>
                          <Ionicons name="people-outline" size={12} color={Colors.gray} /> 
                          {isApprovedModification 
                            ? `${effectiveSeatCount} seats (was ${originalSeatCount})`
                            : `${effectiveSeatCount} seat${effectiveSeatCount > 1 ? 's' : ''}`
                          }
                        </Text>
                        
                        {showLocationInfo && booking.pickup_walk_distance_m > 0 && (
                          <Text style={styles.walkingInfoText}>
                            <Ionicons name="walk" size={10} color="#10B981" /> Pickup: {booking.pickup_walk_distance_m}m walk
                          </Text>
                        )}
                        
                        {showLocationInfo && booking.drop_walk_distance_m > 0 && (
                          <Text style={styles.walkingInfoText}>
                            <Ionicons name="walk" size={10} color="#F59E0B" /> Dropoff: {booking.drop_walk_distance_m}m walk
                          </Text>
                        )}
                      </View>
                      
                      <View style={styles.bookingActions}>
                        <View style={[styles.bookingStatusBadge, { backgroundColor: getStatusColor(booking.status) + '20' }]}>
                          <Text style={[styles.bookingStatusText, { color: getStatusColor(booking.status) }]}>
                            {getStatusText(booking.status)}
                          </Text>
                        </View>
                        
                        {!isRideCancelled && (
                          <TouchableOpacity 
                            style={styles.chatButton} 
                            onPress={() => handleChatWithPassenger(booking.passenger_phone, booking.passenger_name, booking.profile_picture)}
                          >
                            <Ionicons name="chatbubble-ellipses" size={22} color={Colors.primary} />
                          </TouchableOpacity>
                        )}
                      </View>
                    </View>
                  );
                })}
              </View>
            )}

            {/* Pending Modification Requests Section */}
            {pendingMods.length > 0 && !areModificationsLocked() && rideStatus.type !== 'auto-cancelled' && rideStatus.type !== 'cancelled' && (
              <View style={styles.cardSection}>
                <Text style={[styles.sectionTitle, { color: '#F59E0B' }]}>Modification Requests ⏳ ({pendingMods.length})</Text>
                {pendingMods.map((modRequest) => {
                  const booking = bookings.find(b => b.booking_id === modRequest.booking_id);
                  if (!booking) return null;
                  
                  return (
                    <View key={modRequest.id} style={styles.modificationRequestItem}>
                      <View style={styles.modificationRequestHeader}>
                        <Ionicons name="swap" size={20} color="#F59E0B" />
                        <Text style={styles.modificationRequestTitle}>Seat Change Request</Text>
                      </View>
                      <Text style={styles.modificationRequestRider}>Rider: {booking.passenger_name || 'Passenger'}</Text>
                      <View style={styles.modificationSeatChange}>
                        <Text style={styles.currentSeats}>{modRequest.current_seats} seats</Text>
                        <Ionicons name="arrow-forward" size={16} color="#F59E0B" />
                        <Text style={styles.requestedSeats}>{modRequest.requested_seats} seats</Text>
                      </View>
                      <View style={styles.modificationActions}>
                        <TouchableOpacity 
                          style={[styles.modActionBtn, styles.approveModBtn]} 
                          onPress={() => handleModificationAction(modRequest.id, 'approve', modRequest.requested_seats, modRequest.current_seats, booking.booking_id, booking.passenger_name)}
                        >
                          <Ionicons name="checkmark" size={16} color="#fff" />
                          <Text style={styles.modActionBtnText}>Approve</Text>
                        </TouchableOpacity>
                        <TouchableOpacity 
                          style={[styles.modActionBtn, styles.rejectModBtn]} 
                          onPress={() => handleModificationAction(modRequest.id, 'reject', modRequest.requested_seats, modRequest.current_seats, booking.booking_id, booking.passenger_name)}
                        >
                          <Ionicons name="close" size={16} color="#fff" />
                          <Text style={styles.modActionBtnText}>Reject & Cancel Booking</Text>
                        </TouchableOpacity>
                      </View>
                      <Text style={styles.modificationWarning}>
                        ⚠️ Rejecting will cancel the original {modRequest.current_seats} seat booking
                      </Text>
                    </View>
                  );
                })}
              </View>
            )}

            {/* Pending Bookings */}
            {pendingBookings.length > 0 && !areModificationsLocked() && rideStatus.type !== 'auto-cancelled' && rideStatus.type !== 'cancelled' && (
              <View style={styles.cardSection}>
                <Text style={[styles.sectionTitle, { color: '#F59E0B' }]}>Pending Requests ⏳ ({pendingBookings.length})</Text>
                {pendingBookings.map((booking) => {
                  const profilePicUrl = booking.profile_picture ? buildImageUrl(booking.profile_picture) : null;
                  const isSvg = profilePicUrl ? isSvgUrl(profilePicUrl) : false;
                  return (
                    <View key={booking.booking_id} style={styles.bookingItem}>
                      <TouchableOpacity style={styles.passengerAvatar} onPress={() => profilePicUrl && setSelectedProfile({ visible: true, imageUrl: profilePicUrl, name: booking.passenger_name })}>
                        {profilePicUrl && !isSvg ? <Image source={{ uri: profilePicUrl }} style={styles.avatarImage} /> : profilePicUrl && isSvg ? <View style={styles.avatarImageSvg}><SvgCssUri uri={profilePicUrl} width={44} height={44} /></View> : <View style={styles.avatarPlaceholder}><Text style={styles.avatarPlaceholderText}>{getInitials(booking.passenger_name)}</Text></View>}
                      </TouchableOpacity>
                      <View style={styles.bookingInfo}>
                        <Text style={styles.passengerName}>{booking.passenger_name || 'Passenger'}</Text>
                        <Text style={styles.bookingSeats}><Ionicons name="people-outline" size={12} color={Colors.gray} /> {booking.seats_booked} seat{booking.seats_booked > 1 ? 's' : ''}</Text>
                      </View>
                      <View style={styles.pendingActions}>
                        <TouchableOpacity style={[styles.actionSmallBtn, styles.acceptBtn]} onPress={() => handleBookingAction(booking.booking_id, 'accept')}>
                          <Ionicons name="checkmark" size={16} color="#fff" />
                        </TouchableOpacity>
                        <TouchableOpacity style={[styles.actionSmallBtn, styles.rejectBtn]} onPress={() => handleBookingAction(booking.booking_id, 'reject')}>
                          <Ionicons name="close" size={16} color="#fff" />
                        </TouchableOpacity>
                      </View>
                    </View>
                  );
                })}
              </View>
            )}

            {/* Action Buttons */}
            {!isOngoing && !isCompleted && showStartRide && rideStatus.type !== 'auto-cancelled' && rideStatus.type !== 'cancelled' && (
              <>
                <View style={styles.actionButtonsRow}>
                  <TouchableOpacity style={styles.editButton} onPress={handleEditRide}>
                    <Ionicons name="create-outline" size={18} color={Colors.primary} />
                    <Text style={styles.editButtonText}>Edit Ride</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.cancelButton} onPress={handleCancelRide}>
                    <Ionicons name="close-circle-outline" size={18} color="#DC2626" />
                    <Text style={styles.cancelButtonText}>Cancel Ride</Text>
                  </TouchableOpacity>
                </View>
                <TouchableOpacity style={styles.startRideButton} onPress={handleStartRide}>
                  <Ionicons name="car-sport" size={20} color="#fff" />
                  <Text style={styles.startRideButtonText}>Start Ride Now</Text>
                </TouchableOpacity>
              </>
            )}

            {/* Ongoing Ride Button */}
            {showLiveSession && (
              <TouchableOpacity style={styles.liveSessionButton} onPress={() => navigation.navigate('OngoingRideDriverScreen', { rideId: ride?.id, sessionId: ride?.live_session?.session_id })}>
                <Ionicons name="navigate-circle" size={20} color="#fff" />
                <Text style={styles.liveSessionButtonText}>Continue Ongoing Ride</Text>
              </TouchableOpacity>
            )}

            <View style={styles.safetyCard}>
              <View style={styles.simpleInfoLeft}>
                <Ionicons name="shield-checkmark-outline" size={20} color="#2457A6" />
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

      {/* Conflict Resolution Modal */}
      <Modal visible={conflictModalVisible} transparent animationType="fade">
        <View style={styles.modalBackdrop}>
          <View style={styles.conflictModalContent}>
            <View style={styles.conflictModalHeader}>
              <Ionicons name="alert-circle" size={48} color="#F59E0B" />
              <Text style={styles.conflictModalTitle}>Driver's Choice Required</Text>
            </View>
            <Text style={styles.conflictModalMessage}>There are two requests for this ride. Please choose which one to accept.</Text>
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
            <View style={styles.conflictModalButtons}>
              {conflictData?.modification_request && (
                <TouchableOpacity 
                  style={[styles.conflictModalBtn, styles.approveModBtn]} 
                  onPress={() => resolveConcurrentRequest('modification', conflictData.modification_request.id, null)} 
                  disabled={resolvingConflict}
                >
                  <Text style={styles.conflictModalBtnText}>
                    {resolvingConflict ? 'Processing...' : 'Accept Modification'}
                  </Text>
                </TouchableOpacity>
              )}
              {conflictData?.booking_request && (
                <TouchableOpacity 
                  style={[styles.conflictModalBtn, styles.acceptBtn]} 
                  onPress={() => resolveConcurrentRequest('booking', null, conflictData.booking_request.id)} 
                  disabled={resolvingConflict}
                >
                  <Text style={styles.conflictModalBtnText}>
                    {resolvingConflict ? 'Processing...' : 'Accept Booking'}
                  </Text>
                </TouchableOpacity>
              )}
            </View>
            <TouchableOpacity style={styles.conflictModalCloseBtn} onPress={() => setConflictModalVisible(false)}>
              <Text style={styles.conflictModalCloseBtnText}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Rating Modal */}
      <Modal visible={ratingModalVisible} transparent animationType="fade">
        <View style={styles.modalBackdrop}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>Rate Your Rider</Text>
            <Text style={styles.modalSub}>How was your ride with {selectedRider?.passenger_name || 'this rider'}?</Text>
            {renderStars()}
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
              <TouchableOpacity 
                style={[styles.submitBtn, rating === 0 && { opacity: 0.5 }]} 
                onPress={submitRiderRating} 
                disabled={rating === 0}
              >
                <Text style={styles.submitBtnText}>Submit Rating</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      <ProfileImageModal 
        visible={selectedProfile.visible} 
        imageUrl={selectedProfile.imageUrl} 
        name={selectedProfile.name} 
        onClose={() => setSelectedProfile({ visible: false, imageUrl: null, name: '' })} 
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

// Styles
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F4F5F7' },
  mapContainer: { width: '100%', overflow: 'hidden', backgroundColor: '#E8EEF7', position: 'relative' },
  map: { flex: 1, backgroundColor: '#E8EEF7' },
  mapBackButton: { position: 'absolute', top: Platform.OS === 'ios' ? 54 : 22, left: 14, width: 42, height: 42, borderRadius: 25, backgroundColor: 'rgba(255,255,255,0.96)', alignItems: 'center', justifyContent: 'center', shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4, elevation: 3 },
  mapLegend: { position: 'absolute', bottom: 10, right: 10, backgroundColor: 'rgba(255,255,255,0.95)', borderRadius: 12, padding: 10, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4, elevation: 3, minWidth: 120 },
  legendTitle: { marginBottom: 6, paddingBottom: 4, borderBottomWidth: 1, borderBottomColor: '#E5E7EB' },
  legendTitleText: { fontSize: 11, fontWeight: '700', color: '#333' },
  legendItem: { flexDirection: 'row', alignItems: 'center', marginBottom: 4 },
  legendColor: { width: 16, height: 4, borderRadius: 2, marginRight: 6 },
  legendDot: { width: 10, height: 10, borderRadius: 5, marginRight: 8 },
  legendText: { fontSize: 10, color: '#555' },
  mapControls: { position: 'absolute', bottom: 10, left: 10 },
  mapControlButton: { backgroundColor: 'rgba(255,255,255,0.95)', width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center', shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4, elevation: 3 },
  customMarker: { alignItems: 'center', justifyContent: 'center', borderWidth: 2, borderColor: '#fff', shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.25, shadowRadius: 4, elevation: 5, position: 'relative' },
  markerBadge: { position: 'absolute', top: -5, right: -5, backgroundColor: '#fff', borderRadius: 10, minWidth: 18, height: 18, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: '#10B981' },
  markerBadgeText: { fontSize: 10, fontWeight: 'bold', color: '#10B981' },
  walkBadge: { position: 'absolute', bottom: -8, left: '50%', transform: [{ translateX: -15 }], flexDirection: 'row', alignItems: 'center', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 10, gap: 2 },
  walkBadgeText: { fontSize: 8, color: '#fff', fontWeight: 'bold' },
  drawer: { position: 'absolute', bottom: 0, left: 0, right: 0, backgroundColor: '#F4F5F7', borderTopLeftRadius: 28, borderTopRightRadius: 28, overflow: 'hidden', shadowColor: '#000', shadowOffset: { width: 0, height: -2 }, shadowOpacity: 0.1, shadowRadius: 8, elevation: 10 },
  handleWrap: { alignItems: 'center', paddingTop: 10, paddingBottom: 8, backgroundColor: '#F4F5F7', position: 'relative' },
  handleHitArea: { paddingHorizontal: 40, paddingVertical: 10, alignItems: 'center', justifyContent: 'center' },
  handleBar: { width: 64, height: 6, borderRadius: 99, backgroundColor: '#CDD2D8' },
  pendingNotificationBadge: { position: 'absolute', right: 20, top: 8, backgroundColor: '#F59E0B', borderRadius: 12, paddingHorizontal: 8, paddingVertical: 2 },
  pendingNotificationText: { color: '#fff', fontSize: 12, fontWeight: 'bold' },
  collapsedSummary: { paddingHorizontal: 16, paddingTop: 4, paddingBottom: 12 },
  collapsedTopRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: 12 },
  collapsedDriver: { fontSize: 16, fontWeight: '800', color: '#111827' },
  collapsedSub: { marginTop: 2, fontSize: 12, color: '#6B7280', fontWeight: '600' },
  collapsedPriceWrap: { alignItems: 'flex-end' },
  collapsedPrice: { fontSize: 18, fontWeight: '900', color: '#111827' },
  collapsedPerSeat: { fontSize: 10, color: '#6B7280', fontWeight: '600' },
  collapsedTripInfo: { marginTop: 6, paddingTop: 6, borderTopWidth: 1, borderTopColor: '#EEF2F7' },
  collapsedTripText: { fontSize: 11, color: '#6B7280' },
  drawerScroll: { flex: 1 },
  drawerContent: { paddingHorizontal: 16, paddingBottom: 16 },
  statusBanner: { flexDirection: 'row', alignItems: 'flex-start', padding: 12, borderRadius: 12, marginBottom: 14, gap: 8 },
  statusBannerText: { fontSize: 13, fontWeight: '700', flex: 1 },
  statusBannerReason: { fontSize: 11, marginTop: 4, opacity: 0.8 },
  cancellationDetailedBanner: { backgroundColor: '#FEF2F2', borderRadius: 16, padding: 16, marginBottom: 14, borderWidth: 1, borderColor: '#FEE2E2' },
  cancellationHeader: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 12 },
  cancellationTitle: { fontSize: 16, fontWeight: '700', color: '#DC2626' },
  cancellationMessage: { fontSize: 13, color: '#7F1D1D', lineHeight: 18, marginBottom: 8 },
  cancelledByText: { fontSize: 11, color: '#9CA3AF', fontStyle: 'italic' },
  tripOverviewCard: { backgroundColor: '#EAF1FF', borderRadius: 20, padding: 16, marginBottom: 14 },
  tripOverviewHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 12 },
  tripOverviewTitle: { fontSize: 16, fontWeight: '800', color: '#2457A6' },
  tripOverviewDetails: { marginBottom: 12 },
  tripOverviewItem: { marginBottom: 8 },
  tripOverviewLabel: { fontSize: 11, color: '#6B7280', marginBottom: 2 },
  tripOverviewValue: { fontSize: 14, fontWeight: '600', color: '#111827' },
  tripOverviewArrow: { alignItems: 'center', marginVertical: 4 },
  tripOverviewStats: { flexDirection: 'row', flexWrap: 'wrap', gap: 12, paddingTop: 12, borderTopWidth: 1, borderTopColor: '#CDD9F0' },
  tripOverviewStat: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  tripOverviewStatText: { fontSize: 12, color: '#6B7280' },
  cardSection: { backgroundColor: 'white', borderRadius: 20, padding: 16, marginBottom: 14, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 8, elevation: 2 },
  sectionTitle: { fontSize: 16, fontWeight: '800', color: '#111827', marginBottom: 0 },
  timelineHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  timelineHeaderLeft: { flexDirection: 'row', alignItems: 'center', gap: 8, flex: 1 },
  timelineStopCount: { fontSize: 12, color: '#6B7280', fontWeight: '500', marginLeft: 4 },
  timelineContainer: { marginTop: 16 },
  timelineItemCard: { flexDirection: 'row', marginBottom: 20 },
  timelineItemLeft: { width: 40, alignItems: 'center', position: 'relative' },
  timelineItemDot: { width: 32, height: 32, borderRadius: 16, alignItems: 'center', justifyContent: 'center', borderWidth: 2, borderColor: '#fff', shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.1, shadowRadius: 2, elevation: 2 },
  timelineItemIcon: { fontSize: 16 },
  timelineItemLine: { width: 2, flex: 1, marginVertical: 4 },
  timelineItemRight: { flex: 1, paddingLeft: 12, paddingBottom: 8 },
  timelineItemHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 },
  timelineItemType: { fontSize: 11, fontWeight: '700', color: '#6B7280', letterSpacing: 0.5 },
  segmentBadge: { backgroundColor: '#F3F4F6', paddingHorizontal: 8, paddingVertical: 2, borderRadius: 10 },
  segmentBadgeText: { fontSize: 10, color: '#6B7280', fontWeight: '500' },
  timelineItemTitle: { fontSize: 15, fontWeight: '700', color: '#111827', marginBottom: 6 },
  timelineItemDetails: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 6 },
  detailChip: { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: '#F3F4F6', paddingHorizontal: 8, paddingVertical: 3, borderRadius: 12 },
  detailChipText: { fontSize: 11, color: '#6B7280' },
  timelineItemAddress: { fontSize: 12, color: '#6B7280', marginBottom: 8, lineHeight: 16 },
  walkingChip: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 10, paddingVertical: 5, borderRadius: 16, alignSelf: 'flex-start', marginBottom: 8 },
  walkingChipText: { fontSize: 11, fontWeight: '500' },
  routeInfo: { flexDirection: 'row', flexWrap: 'wrap', gap: 12, marginBottom: 10, paddingTop: 6, borderTopWidth: 1, borderTopColor: '#F0F0F0' },
  routeInfoItem: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  routeInfoText: { fontSize: 11, color: '#6B7280' },
  navigateButton: { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: '#EAF1FF', paddingHorizontal: 12, paddingVertical: 8, borderRadius: 20, alignSelf: 'flex-start' },
  navigateButtonText: { fontSize: 12, color: '#2457A6', fontWeight: '600' },
  vehicleHeaderRow: { flexDirection: 'row', alignItems: 'center' },
  vehicleIconCircle: { width: 48, height: 48, borderRadius: 24, backgroundColor: '#EAF1FF', alignItems: 'center', justifyContent: 'center', marginRight: 12 },
  vehicleMeta: { flex: 1 },
  vehicleTitle: { fontSize: 16, fontWeight: '800', color: '#111827' },
  vehicleRegContainer: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 6, paddingTop: 6, borderTopWidth: 1, borderTopColor: '#F0F0F0' },
  vehicleRegText: { fontSize: 11, color: '#6B7280', fontWeight: '500' },
  seatInfoContainer: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  seatInfoItem: { flex: 1, alignItems: 'center' },
  seatIconCircle: { width: 48, height: 48, borderRadius: 24, alignItems: 'center', justifyContent: 'center', marginBottom: 8 },
  seatInfoLabel: { fontSize: 11, color: '#6B7280', textAlign: 'center' },
  seatInfoValue: { fontSize: 18, fontWeight: '800', color: '#111827', marginTop: 2 },
  seatDivider: { width: 1, height: 50, backgroundColor: '#E5E7EB' },
  progressBarContainer: { height: 6, backgroundColor: '#E5E7EB', borderRadius: 3, overflow: 'hidden', marginBottom: 8 },
  progressBar: { height: '100%', backgroundColor: '#10B981', borderRadius: 3 },
  progressText: { fontSize: 12, color: '#6B7280', textAlign: 'center' },
  startRideButton: { backgroundColor: '#10B981', borderRadius: 14, paddingVertical: 14, alignItems: 'center', justifyContent: 'center', flexDirection: 'row', gap: 8, marginBottom: 12 },
  startRideButtonText: { color: '#fff', fontSize: 16, fontWeight: '700' },
  liveSessionButton: { backgroundColor: '#2457A6', borderRadius: 14, paddingVertical: 14, alignItems: 'center', justifyContent: 'center', flexDirection: 'row', gap: 8, marginBottom: 12 },
  liveSessionButtonText: { color: '#fff', fontSize: 16, fontWeight: '700' },
  actionButtonsRow: { flexDirection: 'row', gap: 10, marginBottom: 14 },
  editButton: { flex: 1, borderWidth: 1, borderColor: '#2457A6', borderRadius: 14, paddingVertical: 12, alignItems: 'center', justifyContent: 'center', flexDirection: 'row', gap: 6, backgroundColor: '#fff' },
  editButtonText: { color: '#2457A6', fontSize: 14, fontWeight: '600' },
  cancelButton: { flex: 1, borderWidth: 1, borderColor: '#DC2626', borderRadius: 14, paddingVertical: 12, alignItems: 'center', justifyContent: 'center', flexDirection: 'row', gap: 6, backgroundColor: '#fff' },
  cancelButtonText: { color: '#DC2626', fontSize: 14, fontWeight: '600' },
  bookingItem: { flexDirection: 'row', alignItems: 'center', paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: '#EEF2F7' },
  passengerAvatar: { width: 44, height: 44, borderRadius: 22, overflow: 'hidden', marginRight: 12 },
  avatarImage: { width: 44, height: 44, borderRadius: 22, resizeMode: 'cover' },
  avatarImageSvg: { width: 44, height: 44, borderRadius: 22, overflow: 'hidden', alignItems: 'center', justifyContent: 'center', backgroundColor: '#E5E7EB' },
  avatarPlaceholder: { width: 44, height: 44, borderRadius: 22, backgroundColor: '#E5E7EB', alignItems: 'center', justifyContent: 'center' },
  avatarPlaceholderText: { fontSize: 16, fontWeight: '700', color: '#2457A6' },
  bookingInfo: { flex: 1 },
  passengerName: { fontSize: 15, fontWeight: '600', color: '#111827' },
  bookingSeats: { fontSize: 12, color: '#6B7280', marginTop: 2, flexDirection: 'row', alignItems: 'center' },
  walkingInfoText: { fontSize: 10, color: '#6B7280', marginTop: 2, flexDirection: 'row', alignItems: 'center' },
  bookingStatusBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12 },
  bookingStatusText: { fontSize: 11, fontWeight: '600' },
  bookingActions: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  chatButton: { padding: 8, backgroundColor: '#EFF6FF', borderRadius: 20, alignItems: 'center', justifyContent: 'center' },
  pendingActions: { flexDirection: 'row', gap: 8 },
  actionSmallBtn: { width: 36, height: 36, borderRadius: 18, alignItems: 'center', justifyContent: 'center' },
  acceptBtn: { backgroundColor: '#10B981' },
  rejectBtn: { backgroundColor: '#EF4444' },
  simpleInfoLeft: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  safetyCard: { backgroundColor: '#FFF3E7', borderRadius: 18, padding: 16, marginBottom: 14 },
  safetyTitle: { fontSize: 14, color: '#2457A6', fontWeight: '800' },
  safetySub: { marginTop: 2, fontSize: 12, color: '#2457A6', opacity: 0.9, fontWeight: '600' },
  modalBackdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center' },
  modalCard: { backgroundColor: '#fff', borderRadius: 24, padding: 20, alignItems: 'center', width: width - 40 },
  modalTitle: { fontSize: 22, fontWeight: '700', color: '#111827', textAlign: 'center', marginTop: 12 },
  modalSub: { fontSize: 14, color: '#6B7280', textAlign: 'center', marginTop: 8, marginBottom: 18 },
  starsRow: { flexDirection: 'row', justifyContent: 'center', marginBottom: 18 },
  feedbackInput: { minHeight: 100, borderWidth: 1, borderColor: '#E5E7EB', borderRadius: 16, padding: 14, color: '#111827', fontSize: 14, width: '100%', textAlignVertical: 'top' },
  modalActions: { flexDirection: 'row', gap: 10, marginTop: 18, width: '100%' },
  skipBtn: { flex: 1, borderWidth: 1, borderColor: '#D1D5DB', borderRadius: 999, paddingVertical: 14, alignItems: 'center' },
  skipBtnText: { color: '#6B7280', fontWeight: '600' },
  submitBtn: { flex: 1, backgroundColor: '#2457A6', borderRadius: 999, paddingVertical: 14, alignItems: 'center' },
  submitBtnText: { color: '#fff', fontWeight: '700' },
  imageModalContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', width: '100%' },
  imageModalContent: { width: '90%', backgroundColor: '#fff', borderRadius: 20, overflow: 'hidden', maxHeight: '80%' },
  imageModalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 16, borderBottomWidth: 1, borderBottomColor: '#EEF2F7' },
  imageModalTitle: { fontSize: 18, fontWeight: '700', color: '#111827' },
  fullProfileImage: { width: '100%', height: 400, backgroundColor: '#F5F5F5' },
  modalSvgContainer: { width: '100%', height: 400, backgroundColor: '#F5F5F5', alignItems: 'center', justifyContent: 'center' },
  noImageContainer: { width: '100%', height: 400, justifyContent: 'center', alignItems: 'center', backgroundColor: '#F5F5F5' },
  noImageText: { fontSize: 16, color: '#6B7280' },
  conflictModalContent: { backgroundColor: "#fff", borderRadius: 24, padding: 20, width: "90%", maxHeight: "85%" },
  conflictModalHeader: { alignItems: "center", marginBottom: 16 },
  conflictModalTitle: { fontSize: 20, fontWeight: "700", color: "#111827", marginTop: 12, textAlign: "center" },
  conflictModalMessage: { fontSize: 14, color: "#6B7280", textAlign: "center", marginBottom: 20, lineHeight: 20 },
  conflictRequestCard: { backgroundColor: "#F9FAFB", borderRadius: 16, padding: 16, marginBottom: 12, borderWidth: 1, borderColor: "#E5E7EB" },
  conflictRequestHeader: { flexDirection: "row", alignItems: "center", gap: 12, marginBottom: 12 },
  conflictRequestTitle: { fontSize: 16, fontWeight: "700", color: "#111827" },
  conflictRequestDetails: { fontSize: 14, color: "#4B5563", marginBottom: 4 },
  conflictModalSeatsInfo: { fontSize: 13, color: "#6B7280", textAlign: "center", marginBottom: 20, fontWeight: "600" },
  conflictModalButtons: { flexDirection: "row", gap: 12, marginBottom: 12 },
  conflictModalBtn: { flex: 1, paddingVertical: 14, borderRadius: 12, alignItems: "center" },
  conflictModalBtnText: { color: "#fff", fontWeight: "700", fontSize: 14 },
  conflictModalCloseBtn: { paddingVertical: 12, alignItems: "center", borderRadius: 12, backgroundColor: "#F3F4F6" },
  conflictModalCloseBtnText: { color: "#111827", fontWeight: "600" },
  approveModBtn: { backgroundColor: "#F59E0B" },
  sectionHeaderWithStatus: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  cancelledBadgeSmall: { backgroundColor: '#F3F4F6', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12 },
  cancelledBadgeSmallText: { fontSize: 11, color: '#6B7280', fontWeight: '600' },
  disabledBookingItem: { opacity: 0.7, backgroundColor: '#F9FAFB' },
  cancelledNoteContainer: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#F3F4F6', padding: 10, borderRadius: 8, marginTop: 12, gap: 8 },
  cancelledNoteText: { fontSize: 11, color: '#6B7280', flex: 1 },
  earningsBanner: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#E8F5E9', borderRadius: 16, padding: 16, marginBottom: 14, borderWidth: 1, borderColor: '#C8E6C9' },
  earningsBannerLeft: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  earningsIconContainer: { width: 48, height: 48, borderRadius: 24, backgroundColor: '#10B981', alignItems: 'center', justifyContent: 'center' },
  earningsLabel: { fontSize: 14, color: '#2E7D32', fontWeight: '600', marginBottom: 2 },
  earningsSubLabel: { fontSize: 11, color: '#66BB6A' },
  earningsAmountContainer: { flexDirection: 'row', alignItems: 'baseline' },
  earningsCurrency: { fontSize: 18, color: '#10B981', fontWeight: '700', marginRight: 2 },
  earningsAmount: { fontSize: 28, color: '#10B981', fontWeight: '800' },
  earningsBreakdownCard: { backgroundColor: 'white', borderRadius: 20, padding: 16, marginBottom: 14, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 8, elevation: 2 },
  earningsBreakdownTitle: { fontSize: 16, fontWeight: '800', color: '#111827', marginBottom: 14 },
  earningsRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: '#F0F0F0' },
  earningsRowLeft: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  earningsRowAvatar: { width: 36, height: 36, borderRadius: 18, backgroundColor: '#EAF1FF', alignItems: 'center', justifyContent: 'center' },
  earningsRowInitials: { fontSize: 14, fontWeight: '700', color: '#2457A6' },
  earningsRowName: { fontSize: 14, fontWeight: '600', color: '#111827' },
  earningsRowSeats: { fontSize: 11, color: '#6B7280', marginTop: 2 },
  earningsRowAmount: { fontSize: 16, fontWeight: '700', color: '#10B981' },
  earningsDivider: { height: 1, backgroundColor: '#E5E7EB', marginVertical: 12 },
  earningsTotalRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingTop: 4 },
  earningsTotalLabel: { fontSize: 16, fontWeight: '700', color: '#111827' },
  earningsTotalAmount: { fontSize: 20, fontWeight: '800', color: '#10B981' },
  modificationStatusBadge: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 12, backgroundColor: '#FEF3C7', alignSelf: 'flex-start', gap: 6, marginTop: 4, marginBottom: 4 },
  modificationStatusText: { fontSize: 10, fontWeight: '600' },
  modificationRequestItem: { backgroundColor: '#FEF3C7', borderRadius: 16, padding: 14, marginBottom: 12, borderWidth: 1, borderColor: '#FDE68A' },
  modificationRequestHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 10 },
  modificationRequestTitle: { fontSize: 14, fontWeight: '700', color: '#92400E' },
  modificationRequestRider: { fontSize: 13, color: '#78350F', marginBottom: 8 },
  modificationSeatChange: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 12 },
  currentSeats: { fontSize: 14, color: '#DC2626', textDecorationLine: 'line-through' },
  requestedSeats: { fontSize: 14, color: '#10B981', fontWeight: 'bold' },
  modificationActions: { flexDirection: 'row', gap: 10, marginBottom: 8 },
  modActionBtn: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 10, borderRadius: 10, gap: 6 },
  modActionBtnText: { color: '#fff', fontSize: 13, fontWeight: '600' },
  rejectModBtn: { backgroundColor: '#EF4444' },
  modificationWarning: { fontSize: 10, color: '#DC2626', fontStyle: 'italic' },
  strikethroughText: { textDecorationLine: 'line-through', color: '#DC2626' },
  rejectionReasonText: { fontSize: 10, color: '#DC2626', fontStyle: 'italic', marginTop: 2 },
  rejectedModificationWarning: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#FEF2F2', padding: 10, borderRadius: 8, marginBottom: 12, gap: 8 },
  rejectedModificationWarningText: { fontSize: 11, color: '#DC2626', flex: 1 },
  seatReleaseMessage: { fontSize: 11, color: '#10B981', textAlign: 'center', marginTop: 8, fontWeight: '500' },
});
