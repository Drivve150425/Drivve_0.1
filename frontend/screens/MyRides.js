// // import React, { useEffect, useState, useRef, useCallback } from "react";
// // import {
// //   View,
// //   Text,
// //   StyleSheet,
// //   TouchableOpacity,
// //   ScrollView,
// //   StatusBar,
// //   RefreshControl,
// //   Animated,
// //   Image,
// //   LayoutAnimation,
// //   Platform,
// //   UIManager,
// //   ActivityIndicator,
// //   Modal,
// //   TextInput,
// //   Alert,
// //   Linking
// // } from "react-native";
// // import { SafeAreaView } from "react-native-safe-area-context";
// // import { Ionicons, MaterialIcons } from "@expo/vector-icons";
// // import { useFocusEffect } from "@react-navigation/native";
// // import axios from "axios";
// // import LottieView from "lottie-react-native";
// // import { SvgCssUri } from 'react-native-svg/css';
// // import io from 'socket.io-client';

// // import { useAuth } from "../context/AuthContext";
// // import { Colors, Typography } from "../constants/Colors";
// // import { FontFamily } from "../constants/Fonts";
// // import CustomAlert from '../components/CustomAlert';

// // import { API_BASE_URL, GMAP_API_KEY } from "../config/config_ip";

// // if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
// //   UIManager.setLayoutAnimationEnabledExperimental(true);
// // }

// // const buildImageUrl = (url) => {
// //   if (!url) return null;
// //   if (url.startsWith('http://') || url.startsWith('https://')) return url;
// //   if (url.includes('?')) {
// //     return `${API_BASE_URL}${url.startsWith('/') ? '' : '/'}${url}&_t=${Date.now()}`;
// //   }
// //   return `${API_BASE_URL}${url.startsWith('/') ? '' : '/'}${url}?_t=${Date.now()}`;
// // };

// // const getInitials = (name) => {
// //   if (!name) return '?';
// //   const parts = name.trim().split(' ').filter(Boolean);
// //   if (parts.length > 1) return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
// //   return parts[0].slice(0, 2).toUpperCase();
// // };

// // const isSvgImage = (url) => {
// //   if (!url) return false;
// //   return url.toLowerCase().includes('.svg');
// // };

// // export default function MyRides({ route, navigation }) {
// //   const { user, isAuthenticated, isGuest } = useAuth();
// //   const phoneNumber = user?.phone_number;
// //   // Add this to your renderRequestedRideCard where you show ride details
// //   const [alertVisible, setAlertVisible] = useState(false);
// //   const [alertConfig, setAlertConfig] = useState({
// //     title: "",
// //     message: "",
// //     icon: "check-circle",
// //     iconColor: "#10B981",
// //     buttons: []
// //   });

// //   const [expandedPostedRides, setExpandedPostedRides] = useState({});
// //   const [expandedRequestedRides, setExpandedRequestedRides] = useState({});
// //   const [forceRefresh, setForceRefresh] = useState(false);
// //   const [addressCache, setAddressCache] = useState({});
// //   const [loadingAddresses, setLoadingAddresses] = useState(false);
// //   const [ratingModalVisible, setRatingModalVisible] = useState(false);
// //   const [selectedRider, setSelectedRider] = useState(null);
// //   const [rating, setRating] = useState(0);
// //   const [feedback, setFeedback] = useState('');
// //   const [currentSessionId, setCurrentSessionId] = useState(null);
// //   const [ratingType, setRatingType] = useState('rider');

// //   const [conflictModalVisible, setConflictModalVisible] = useState(false);
// //   const [conflictData, setConflictData] = useState(null);
// //   const [resolvingConflict, setResolvingConflict] = useState(false);

// //   const socketRef = useRef(null);

// //   const showCustomAlert = (title, message, type = 'success') => {
// //     let icon = "check-circle";
// //     let iconColor = "#10B981";
// //     if (type === 'error') { icon = "error"; iconColor = "#EF4444"; }
// //     else if (type === 'warning') { icon = "warning"; iconColor = "#F59E0B"; }
// //     else if (type === 'info') { icon = "info"; iconColor = Colors.primary; }
// //     setAlertConfig({ title, message, icon, iconColor, buttons: [{ text: 'OK', onPress: () => setAlertVisible(false) }] });
// //     setAlertVisible(true);
// //   };

// //   const getAddressFromCoordsGoogle = async (lat, lng) => {
// //     if (!lat || !lng) return null;
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

// //   useEffect(() => {
// //     if (!isAuthenticated || isGuest) {
// //       showConfirmationAlert('Login Required', 'Please complete login/profile to view rides.', () => navigation.navigate('Login'));
// //       navigation.goBack();
// //     }
// //   }, [isAuthenticated, isGuest]);

// //   useEffect(() => {
// //     if (!phoneNumber) return;

// //     const socket = io(API_BASE_URL, {
// //       transports: ['websocket'],
// //       reconnection: true,
// //       reconnectionAttempts: 10,
// //       reconnectionDelay: 1000,
// //     });

// //     socketRef.current = socket;

// //     socket.on('connect', () => {
// //       console.log('Socket connected for ride updates');
// //       socket.emit('join-user-room', phoneNumber);
// //     });

// //     socket.on('ride-cancelled', (data) => {
// //       console.log('Ride cancelled event received:', data);
// //       showCustomAlert('Ride Cancelled', data.message || 'A ride you were associated with has been cancelled.', 'warning');
// //       onRefresh();
// //     });

// //     socket.on('booking-cancelled', (data) => {
// //       console.log('Booking cancelled:', data);
// //       showCustomAlert('Booking Cancelled', data.message || 'Your booking has been cancelled.', 'warning');
// //       onRefresh();
// //     });

// //     socket.on('modification-cancelled', (data) => {
// //       console.log('Modification cancelled:', data);
// //       showCustomAlert('Modification Request Cancelled', data.message || 'Your modification request has been cancelled.', 'info');
// //       onRefresh();
// //     });

// //     socket.on('ride-completed-by-driver', (data) => {
// //       console.log('Ride completed by driver:', data);
// //       showCustomAlert('Ride Completed', 'The driver has completed the ride. You can now rate your experience.', 'success');
// //       onRefresh();
// //     });

// //     socket.on('ride-started-by-driver', (data) => {
// //       console.log('Ride started by driver:', data);
// //       showCustomAlert('Ride Started', 'The driver has started the ride. You can now track your journey.', 'success');
// //       onRefresh();
// //     });

// //     socket.on('concurrent-requests-detected', (data) => {
// //       console.log('Concurrent requests detected:', data);
// //       if (data.ride_id) {
// //         checkForConcurrentRequests(data.ride_id);
// //       }
// //     });

// //     return () => {
// //       if (socketRef.current) {
// //         socketRef.current.disconnect();
// //       }
// //     };
// //   }, [phoneNumber]);

// //   const initialTab = route?.params?.initialTab || "posted";
// //   const targetBookingId = route?.params?.bookingId || null;
// //   const targetRideId = route?.params?.rideId || null;

// //   const [postedRides, setPostedRides] = useState([]);
// //   const [requestedRides, setRequestedRides] = useState([]);
// //   const [loading, setLoading] = useState(true);
// //   const [refreshing, setRefreshing] = useState(false);
// //   const [activeTab, setActiveTab] = useState(initialTab);
// //   const [postedFilter, setPostedFilter] = useState("all");
// //   const [requestedFilter, setRequestedFilter] = useState("all");
  
// //   const fadeAnim = useRef(new Animated.Value(0)).current;
// //   const slideAnim = useRef(new Animated.Value(50)).current;
// //   const tabScaleAnim = useRef(new Animated.Value(1)).current;
// //   const scrollViewRef = useRef(null);
// //   const [showFilterModal, setShowFilterModal] = useState(false);
// //   const [tempFilter, setTempFilter] = useState("all");

// //   const fetchMyRides = async (forceClearCache = false) => {
// //     if (!phoneNumber) {
// //       setLoading(false);
// //       return;
// //     }
    
// //     setLoading(true);
    
// //     try {
// //       const timestamp = forceClearCache ? `?_t=${Date.now()}` : '';
// //       const url = `${API_BASE_URL}/my-rides/${phoneNumber}${timestamp}`;
// //       console.log('Fetching rides from:', url);
      
// //       const res = await axios.get(url);
      
// //       console.log('Rides fetched:', {
// //         posted: res.data.posted_rides?.length || 0,
// //         requested: res.data.requested_rides?.length || 0
// //       });
      
// //       setPostedRides(res.data.posted_rides || []);
// //       setRequestedRides(res.data.requested_rides || []);
      
// //     } catch (error) {
// //       console.error("Error fetching rides:", error);
// //       if (error.response) {
// //         showCustomAlert("Error", `Server error: ${error.response.status}`, "error");
// //       } else {
// //         showCustomAlert("Error", "Could not load your rides.", "error");
// //       }
// //     } finally {
// //       setLoading(false);
// //       setForceRefresh(false);
// //     }
// //   };

// //   const onRefresh = () => {
// //     setRefreshing(true);
// //     fetchMyRides(true);
// //     setTimeout(() => setRefreshing(false), 1000);
// //   };

// //   useFocusEffect(
// //     useCallback(() => {
// //       if (phoneNumber) {
// //         const shouldRefresh = route.params?.refresh || route.params?.forceReload;
// //         const targetTab = route.params?.tab;
        
// //         if (targetTab) {
// //           setActiveTab(targetTab);
// //         }
        
// //         if (shouldRefresh) {
// //           fetchMyRides(true);
// //           navigation.setParams({ refresh: false, forceReload: false, tab: undefined });
// //         } else {
// //           fetchMyRides();
// //         }
// //       }
// //     }, [phoneNumber, route.params?.refresh, route.params?.forceReload, route.params?.tab])
// //   );

// //   useEffect(() => {
// //     if (!phoneNumber) return;
// //     fetchMyRides();
// //     Animated.parallel([
// //       Animated.timing(fadeAnim, { toValue: 1, duration: 500, useNativeDriver: true }),
// //       Animated.timing(slideAnim, { toValue: 0, duration: 500, useNativeDriver: true }),
// //     ]).start();
// //   }, [phoneNumber]);

// //   useEffect(() => {
// //     if (route?.params?.initialTab) setActiveTab(route.params.initialTab);
// //   }, [route?.params?.initialTab]);

// //   const checkForConcurrentRequests = async (rideId) => {
// //     try {
// //       const response = await axios.get(`${API_BASE_URL}/ride/${rideId}/concurrent-requests?_t=${Date.now()}`);
// //       const data = response.data;
      
// //       if (data.has_concurrent_requests) {
// //         setConflictData(data);
// //         setConflictModalVisible(true);
// //       }
// //     } catch (error) {
// //       console.log('Error checking concurrent requests:', error);
// //     }
// //   };

// //   const resolveConcurrentRequest = async (choice, modificationRequestId, bookingId) => {
// //     if (!conflictData) return;
    
// //     setResolvingConflict(true);
// //     try {
// //       const response = await axios.post(`${API_BASE_URL}/ride/${conflictData.ride.id}/resolve-concurrent-requests`, {
// //         choice: choice,
// //         modification_request_id: modificationRequestId,
// //         booking_id: bookingId,
// //         driver_phone: phoneNumber
// //       });
      
// //       const data = response.data;
      
// //       if (data.success) {
// //         showCustomAlert('Success', data.message, 'success');
// //         setConflictModalVisible(false);
// //         onRefresh();
// //       } else {
// //         showCustomAlert('Error', data.message || 'Failed to process request', 'error');
// //         onRefresh();
// //       }
// //     } catch (error) {
// //       console.error('Resolve concurrent request error:', error);
// //       showCustomAlert('Error', error.response?.data?.detail || 'Failed to resolve concurrent requests', 'error');
// //       onRefresh();
// //     } finally {
// //       setResolvingConflict(false);
// //     }
// //   };

// //   const togglePostedRideExpand = (rideId) => {
// //     LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
// //     setExpandedPostedRides(prev => ({ ...prev, [rideId]: !prev[rideId] }));
// //   };

// //   const toggleRequestedRideExpand = (rideId) => {
// //     LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
// //     setExpandedRequestedRides(prev => ({ ...prev, [rideId]: !prev[rideId] }));
// //   };

// //   const handleViewProfile = (userId, phoneNumber, name, profilePicture) => {
// //     navigation.navigate('ViewProfileScreen', {
// //       userId: userId,
// //       phoneNumber: phoneNumber,
// //       driverName: name,
// //       profilePicture: profilePicture,
// //     });
// //   };

// //   const handleViewRideDetails = (ride, booking = null) => {
// //     const rideData = {
// //       id: ride.id || ride.ride_id,
// //       custom_ride_id: ride.custom_ride_id,
// //       origin: ride.origin,
// //       destination: ride.destination,
// //       origin_address: ride.origin_address,
// //       destination_address: ride.destination_address,
// //       departure_time: ride.departure_time,
// //       price: ride.price_per_seat,
// //       driverName: ride.driver_name,
// //       phoneNumber: ride.driver_phone || ride.phone_number,
// //       driverUserId: ride.driver_user_id,
// //       seatsAvailable: ride.available_seats || ride.remaining_seats,
// //       totalSeats: ride.available_seats || 4,
// //       available_seats: ride.available_seats || ride.totalSeats || ride.total_seats || 0,
// //       booked_seats: ride.total_booked_seats || 0,
// //       routeCoordinates: ride.route_coordinates || [],
// //       suggestedPickup: ride.suggested_pickup || null,
// //       suggestedDrop: ride.suggested_drop || null,
// //       profilePicture: ride.driver_photo || ride.driver_profile_picture,
// //       rating: ride.driver_rating || 4.5,
// //       vehicle: ride.vehicle,
// //       preferences: ride.preferences,
// //       women_only: ride.women_only,
// //       bookings: ride.bookings,
// //       status: ride.status,
// //       cancellation_reason: ride.cancellation_reason,
// //       duration_text: ride.duration_text,
// //       distance_km: ride.distance_km,
// //       from: ride.origin,
// //       to: ride.destination,
// //       seatsRequested: ride.seats_requested,
// //       price_per_seat: ride.price_per_seat,
// //       origin_coords: ride.origin_coords || null,
// //       destination_coords: ride.destination_coords || null,
// //       started_at: ride.started_at,
// //       completed_at: ride.completed_at,
// //     };
    
// //     const isOwnRide = user?.phone_number === ride.phone_number;
    
// //     if (isOwnRide) {
// //       navigation.navigate('ViewRoutePostedScreen', { ride: rideData });
// //     } else {
// //       const bookingData = booking ? {
// //         id: booking.id,
// //         custom_booking_id: booking.custom_booking_id,
// //         seats_requested: booking.seats_requested || booking.seats_booked,
// //         status: booking.status,
// //         total_amount: booking.total_amount,
// //         created_at: booking.created_at,
// //         passenger_phone: booking.passenger_phone,
// //         pickup_address: booking.pickup_address,
// //         dropoff_address: booking.dropoff_address,
// //       } : null;
      
// //       navigation.navigate('ViewRouteRequestScreen', { 
// //         ride: rideData, 
// //         booking: bookingData 
// //       });
// //     }
// //   };

// //   const handleEditRide = (ride) => {
// //     if (!ride || !phoneNumber) {
// //       showCustomAlert("Error", "Cannot edit ride. Please refresh and try again.", "error");
// //       return;
// //     }
    
// //     if (ride.started_at) {
// //       showCustomAlert("Cannot Edit", "Ride has already started. Cannot edit.", "warning");
// //       return;
// //     }
    
// //     if (ride.cancellation_reason) {
// //       showCustomAlert("Cannot Edit", "Cancelled ride cannot be edited.", "warning");
// //       return;
// //     }
    
// //     if (ride.status === "completed") {
// //       showCustomAlert("Cannot Edit", "Completed ride cannot be edited.", "warning");
// //       return;
// //     }
    
// //     const now = new Date();
// //     const departureTime = new Date(ride.departure_time);
// //     const minutesToDeparture = (departureTime - now) / (1000 * 60);
    
// //     if (minutesToDeparture <= 15 && minutesToDeparture > 0) {
// //       showCustomAlert("Cannot Edit", "Cannot edit ride within 15 minutes of departure time.", "warning");
// //       return;
// //     }
    
// //     const rideData = {
// //       from: ride.origin || '',
// //       to: ride.destination || '',
// //       dateTime: ride.departure_time ? new Date(ride.departure_time) : new Date(),
// //       seatsAvailable: ride.available_seats || 1,
// //       pricePerSeat: (ride.price_per_seat || 0).toString(),
// //       vehicleId: ride.vehicle_id || null,
// //       originCoords: ride.origin_coords,
// //       destinationCoords: ride.destination_coords,
// //       routeCoordinates: ride.route_coordinates,
// //       distanceKm: ride.distance_km,
// //       durationText: ride.duration_text,
// //       totalPrice: ride.total_estimated_price,
// //       preferences: ride.preferences,
// //       womenOnly: ride.women_only,
// //     };
    
// //     navigation.navigate('DriveNext', { 
// //       rideData, 
// //       isEdit: true, 
// //       rideId: ride.id, 
// //       phoneNumber: phoneNumber 
// //     });
// //   };

// //   const canStartRide = (ride) => {
// //     if (ride.status === "completed") return false;
// //     if (ride.cancellation_reason) return false;
// //     if (ride.started_at) return false;
// //     if (ride.status !== "active" && ride.status !== "full") return false;
    
// //     const now = new Date();
// //     const departureTime = new Date(ride.departure_time);
// //     const minutesToDeparture = (departureTime - now) / (1000 * 60);
// //     const minutesSinceDeparture = (now - departureTime) / (1000 * 60);
    
// //     if (minutesSinceDeparture > 30) return false;
// //     return minutesToDeparture <= 15 || minutesSinceDeparture >= 0;
// //   };

// //   const getRideStatusInfo = (ride) => {
// //     const now = new Date();
// //     const departureTime = new Date(ride.departure_time);
// //     const hoursSinceDeparture = (now - departureTime) / (1000 * 60 * 60);
// //     const minutesSinceDeparture = (now - departureTime) / (1000 * 60);
// //     const minutesToDeparture = (departureTime - now) / (1000 * 60);
    
// //     if (ride.status === "completed" || ride.completed_at) {
// //       return { text: "Completed", color: "#6B7280", icon: "checkmark-done", type: "completed" };
// //     }
    
// //     if (ride.cancellation_reason && !ride.cancellation_reason.includes("Auto-cancelled")) {
// //       return { text: "Cancelled", color: "#DC2626", icon: "close-circle", type: "cancelled" };
// //     }
    
// //     if (ride.cancellation_reason?.includes("Auto-cancelled") || (hoursSinceDeparture > 2 && !ride.started_at && !ride.completed_at)) {
// //       return { text: "Auto-cancelled", color: "#9CA3AF", icon: "timer-off", type: "auto-cancelled" };
// //     }
    
// //     if (ride.started_at && !ride.completed_at && ride.status !== "completed") {
// //       return { text: "Ongoing", color: "#10B981", icon: "car-sport", type: "ongoing" };
// //     }
    
// //     if (minutesSinceDeparture > 0 && minutesSinceDeparture <= 120 && !ride.started_at && !ride.completed_at) {
// //       return { text: `Late - ${Math.abs(Math.round(minutesSinceDeparture))} min`, color: "#EF4444", icon: "alert-circle", type: "late" };
// //     }
    
// //     if (minutesToDeparture <= 15 && minutesToDeparture > 0 && !ride.started_at && !ride.completed_at) {
// //       return { text: `Starting in ${Math.round(minutesToDeparture)} min`, color: "#10B981", icon: "checkmark-circle", type: "active" };
// //     }
    
// //     if (minutesToDeparture <= 60 && minutesToDeparture > 15 && !ride.started_at && !ride.completed_at) {
// //       return { text: `Starts in ${Math.round(minutesToDeparture)} min`, color: "#F59E0B", icon: "time-outline", type: "start-soon" };
// //     }
    
// //     if (minutesToDeparture > 60 && !ride.started_at && !ride.completed_at) {
// //       const hours = Math.floor(minutesToDeparture / 60);
// //       const mins = Math.round(minutesToDeparture % 60);
// //       const timeText = hours > 0 ? `${hours}h ${mins > 0 ? `${mins}m` : ''}` : `${mins}m`;
// //       return { text: `Starts in ${timeText}`, color: "#2457A6", icon: "calendar-outline", type: "upcoming" };
// //     }
    
// //     return { text: "Active", color: "#10B981", icon: "checkmark-circle", type: "active" };
// //   };

// //   const getPassengerRideStatusInfo = (booking) => {
// //     const ride = booking;
// //     const now = new Date();
// //     const departureTime = new Date(ride.departure_time);
// //     const hoursSinceDeparture = (now - departureTime) / (1000 * 60 * 60);
// //     const minutesToDeparture = (departureTime - now) / (1000 * 60);
// //     const minutesSinceDeparture = (now - departureTime) / (1000 * 60);
    
// //     // Check for modification rejected status - booking is cancelled
// //     if (booking.modification_request && booking.modification_request.status === "rejected") {
// //       return { text: "Booking Cancelled", color: "#DC2626", icon: "close-circle", type: "modification-rejected", showTrackButton: false };
// //     }
    
// //     if (ride.ride_status === "completed" || ride.completed_at) {
// //       return { text: "Completed", color: "#6B7280", icon: "checkmark-done", type: "completed", showTrackButton: false };
// //     }
    
// //     if (ride.ride_cancelled || ride.cancellation_reason || ride.ride_status === "cancelled") {
// //       if (hoursSinceDeparture > 2 && !ride.ride_started_at) {
// //         return { text: "Auto-cancelled", color: "#9CA3AF", icon: "timer-off", type: "auto-cancelled", showTrackButton: false };
// //       }
// //       return { text: "Ride Cancelled", color: "#DC2626", icon: "close-circle", type: "ride-cancelled", showTrackButton: false };
// //     }
    
// //     if (ride.ride_started_at && ride.ride_status !== "completed") {
// //       return { text: "Ongoing", color: "#10B981", icon: "car-sport", type: "ongoing", showTrackButton: true };
// //     }
    
// //     if (minutesToDeparture <= 60 && minutesToDeparture > 0 && ride.status === "accepted" && !ride.ride_started_at) {
// //       const mins = Math.round(minutesToDeparture);
// //       if (mins <= 15) {
// //         return { text: `Starting in ${mins} min`, color: "#10B981", icon: "checkmark-circle", type: "start-soon", showTrackButton: false };
// //       }
// //       return { text: `Starts in ${mins} min`, color: "#F59E0B", icon: "time-outline", type: "start-soon", showTrackButton: false };
// //     }
    
// //     if (minutesSinceDeparture > 0 && minutesSinceDeparture <= 120 && ride.status === "accepted" && !ride.ride_started_at) {
// //       return { text: `Driver Late - ${Math.round(minutesSinceDeparture)} min`, color: "#EF4444", icon: "alert-circle", type: "driver-late", showTrackButton: false };
// //     }
    
// //     if (ride.status === "pending") {
// //       return { text: "Requested", color: "#F59E0B", icon: "time", type: "pending", showTrackButton: false };
// //     }
    
// //     if (ride.status === "accepted" && !ride.ride_started_at && minutesToDeparture > 60) {
// //       const hours = Math.floor(minutesToDeparture / 60);
// //       const mins = Math.round(minutesToDeparture % 60);
// //       const timeText = hours > 0 ? `${hours}h ${mins > 0 ? `${mins}m` : ''}` : `${mins}m`;
// //       return { text: `Accepted - ${timeText}`, color: "#10B981", icon: "checkmark-circle", type: "accepted", showTrackButton: false };
// //     }
    
// //     if (ride.status === "rejected") {
// //       return { text: "Rejected", color: "#DC2626", icon: "close-circle", type: "rejected", showTrackButton: false };
// //     }
    
// //     return { text: ride.status || "Unknown", color: Colors.gray, icon: "ellipse", type: "unknown", showTrackButton: false };
// //   };

// //   const handleStartRide = async (ride) => {
// //     if (ride.status === "completed") {
// //       showCustomAlert("Cannot Start", "This ride has already been completed.", "warning");
// //       return;
// //     }
    
// //     const statusInfo = getRideStatusInfo(ride);
    
// //     if (statusInfo.type !== 'active' && statusInfo.type !== 'late') {
// //       const now = new Date();
// //       const departureTime = new Date(ride.departure_time);
// //       const minutesToDeparture = Math.ceil((departureTime - now) / (1000 * 60));
// //       const minutesSinceDeparture = Math.ceil((now - departureTime) / (1000 * 60));
      
// //       if (ride.status === "completed") {
// //         showCustomAlert("Ride Completed", "This ride has already been completed.", "info");
// //       } else if (minutesSinceDeparture > 120) {
// //         showCustomAlert("Ride Expired", "This ride has been auto-cancelled as it was not started within 2 hours of departure time.", "error");
// //       } else if (minutesToDeparture > 15) {
// //         showCustomAlert("Cannot Start Ride", `You can start the ride only 15 minutes before departure time. ${minutesToDeparture} minutes remaining.`, "warning");
// //       } else if (minutesSinceDeparture > 0 && minutesSinceDeparture <= 120) {
// //         showCustomAlert("Late Start", `Ride is ${minutesSinceDeparture} minutes late. You can still start the ride.`, "warning");
// //       } else {
// //         showCustomAlert("Cannot Start Ride", "Ride cannot be started at this time.", "warning");
// //       }
// //       return;
// //     }
    
// //     const liveSession = ride?.live_session;
// //     if (liveSession?.session_id) {
// //       navigation.navigate('OngoingRideDriverScreen', { rideId: ride.id, sessionId: liveSession.session_id });
// //       return;
// //     }
    
// //     navigation.navigate('StartRideConfirmScreen', { rideId: ride.id, ride });
// //   };

// //   const handleTrackRide = (booking) => {
// //     navigation.navigate('OngoingRideRiderScreen', { 
// //       bookingId: booking.id, 
// //       sessionId: booking.live_session?.session_id || null 
// //     });
// //   };

// //   const handleBookingAction = async (bookingId, action) => {
// //     showConfirmationAlert(`${action === "accept" ? "Accept" : "Reject"} Request`, `Are you sure you want to ${action} this booking request?`, async () => {
// //       try {
// //         await axios.put(`${API_BASE_URL}/booking/${bookingId}/${action}`);
// //         showCustomAlert("Success", `Booking ${action}ed successfully.`, "success");
// //         onRefresh();
// //       } catch (err) {
// //         showCustomAlert("Error", "Could not update booking.", "error");
// //       }
// //     });
// //   };

// //   const cancelRide = async (rideId) => {
// //     const ride = postedRides.find(r => r.id === rideId);
    
// //     if (ride?.status === "completed") {
// //       showCustomAlert("Cannot Cancel", "Completed rides cannot be cancelled.", "warning");
// //       return;
// //     }
    
// //     const acceptedBookings = ride?.bookings?.filter(b => b.status === "accepted")?.length || 0;
// //     const pendingBookings = ride?.bookings?.filter(b => b.status === "pending")?.length || 0;
// //     const pendingModifications = ride?.bookings?.filter(b => b.modification_request?.status === "pending")?.length || 0;
    
// //     let message = "Are you sure you want to cancel this ride?\n\n";
// //     if (acceptedBookings > 0) {
// //       message += `⚠️ This will cancel ${acceptedBookings} confirmed booking(s)\n`;
// //     }
// //     if (pendingBookings > 0) {
// //       message += `⚠️ This will reject ${pendingBookings} pending request(s)\n`;
// //     }
// //     if (pendingModifications > 0) {
// //       message += `⚠️ This will cancel ${pendingModifications} modification request(s)\n`;
// //     }
// //     message += "\nThis action cannot be undone.";
    
// //     showConfirmationAlert("Cancel Ride", message, async () => {
// //       try {
// //         const response = await axios.put(`${API_BASE_URL}/ride/${rideId}/cancel`);
        
// //         if (response.data) {
// //           const { affected_passengers, cancelled_modifications, cancelled_pending_bookings } = response.data;
          
// //           let successMessage = "Ride cancelled successfully.";
// //           if (affected_passengers > 0) {
// //             successMessage += `\n✅ ${affected_passengers} confirmed booking(s) cancelled.`;
// //           }
// //           if (cancelled_pending_bookings > 0) {
// //             successMessage += `\n📝 ${cancelled_pending_bookings} pending request(s) rejected.`;
// //           }
// //           if (cancelled_modifications > 0) {
// //             successMessage += `\n🔄 ${cancelled_modifications} modification request(s) cancelled.`;
// //           }
          
// //           showCustomAlert("Success", successMessage, "success");
// //           onRefresh();
// //         }
// //       } catch (err) {
// //         const errorMessage = err.response?.data?.detail || err.response?.data?.message || err.message || "Could not cancel ride.";
// //         showCustomAlert("Error", `Failed to cancel ride: ${errorMessage}`, "error");
// //       }
// //     });
// //   };

// //   const getCancellationStatusDisplay = (item) => {
// //     if (item.cancellation_reason) {
// //       if (item.cancellation_reason.includes("Auto-cancelled") || item.cancellation_reason.includes("auto-cancel")) {
// //         return {
// //           text: "Auto-cancelled",
// //           color: "#9CA3AF",
// //           icon: "timer-off",
// //           message: item.cancellation_reason
// //         };
// //       }
// //       return {
// //         text: "Cancelled",
// //         color: "#DC2626",
// //         icon: "close-circle",
// //         message: item.cancellation_reason
// //       };
// //     }
// //     return null;
// //   };

// //   const cancelBooking = async (bookingId) => {
// //     showConfirmationAlert("Cancel Booking", "Are you sure you want to cancel this booking?", async () => {
// //       try {
// //         await axios.put(`${API_BASE_URL}/booking/${bookingId}/cancel`);
// //         showCustomAlert("Success", "Booking cancelled successfully.", "success");
// //         onRefresh();
// //       } catch (err) {
// //         showCustomAlert("Error", "Could not cancel booking.", "error");
// //       }
// //     });
// //   };

// //   const handleModificationAction = async (requestId, action, bookingId) => {
// //     showConfirmationAlert(`${action === "approve" ? "Approve" : "Reject"} Modification`, `Are you sure you want to ${action} this seat modification request?`, async () => {
// //       try {
// //         await axios.put(`${API_BASE_URL}/api/v1/modifications/${requestId}/${action}`);
// //         showCustomAlert("Success", `Modification request ${action}d successfully.`, "success");
// //         onRefresh();
// //       } catch (err) {
// //         showCustomAlert("Error", "Could not process modification request.", "error");
// //       }
// //     });
// //   };

// //   const handleCancelModificationRequest = async (requestId, bookingId) => {
// //     showConfirmationAlert("Cancel Modification Request", "Are you sure you want to cancel your seat modification request?", async () => {
// //       try {
// //         const response = await axios.delete(`${API_BASE_URL}/api/v1/modifications/${requestId}/cancel`);
// //         showCustomAlert("Success", "Modification request cancelled successfully.", "success");
// //         onRefresh();
// //       } catch (err) {
// //         showCustomAlert("Error", err.response?.data?.detail || "Could not cancel modification request.", "error");
// //       }
// //     });
// //   };

// //   const openRateRiderModal = (rider, sessionId) => {
// //     setSelectedRider(rider);
// //     setCurrentSessionId(sessionId);
// //     setRatingType('rider');
// //     setRating(0);
// //     setFeedback('');
// //     setRatingModalVisible(true);
// //   };

// //   const openRateDriverModal = (booking, sessionId) => {
// //     setSelectedRider({
// //       booking_id: booking.id,
// //       rider_name: booking.driver_name,
// //       rider_phone: booking.driver_phone,
// //       rider_photo: booking.driver_photo
// //     });
// //     setCurrentSessionId(sessionId);
// //     setRatingType('driver');
// //     setRating(0);
// //     setFeedback('');
// //     setRatingModalVisible(true);
// //   };

// //   const submitRating = async () => {
// //     if (!selectedRider) return;
// //     if (rating === 0) {
// //       showCustomAlert('Rating Required', 'Please select a rating before submitting', 'warning');
// //       return;
// //     }
    
// //     try {
// //       const endpoint = ratingType === 'rider' 
// //         ? `${API_BASE_URL}/ride-sessions/${currentSessionId}/rate-rider`
// //         : `${API_BASE_URL}/ride-sessions/${currentSessionId}/rate-driver-once`;
      
// //       const response = await axios.post(endpoint, {
// //         booking_id: selectedRider.booking_id,
// //         rating,
// //         feedback,
// //       });
      
// //       if (response.data.already_rated) {
// //         showCustomAlert('Already Rated', response.data.message, 'info');
// //       } else {
// //         showCustomAlert('Success', `Thank you for rating this ${ratingType === 'rider' ? 'rider' : 'driver'}!`, 'success');
// //       }
      
// //       setRatingModalVisible(false);
// //       onRefresh();
// //     } catch (error) {
// //       showCustomAlert('Error', error?.response?.data?.detail || 'Could not submit rating', 'error');
// //     }
// //   };

// //   const isRidePast = (departureTime) => {
// //     const now = new Date();
// //     const departure = new Date(departureTime);
// //     return departure < now;
// //   };

// //   const renderDateHeader = (ride, previousRide) => {
// //     if (!previousRide) return true;
    
// //     const currentDate = new Date(ride.departure_time);
// //     const previousDate = new Date(previousRide.departure_time);
    
// //     currentDate.setHours(0, 0, 0, 0);
// //     previousDate.setHours(0, 0, 0, 0);
    
// //     return currentDate.getTime() !== previousDate.getTime();
// //   };

// //   const getDateHeaderTitle = (date) => {
// //     const today = new Date();
// //     today.setHours(0, 0, 0, 0);
// //     const tomorrow = new Date(today);
// //     tomorrow.setDate(tomorrow.getDate() + 1);
// //     const rideDate = new Date(date);
// //     rideDate.setHours(0, 0, 0, 0);
    
// //     if (rideDate.getTime() === today.getTime()) return "Today";
// //     if (rideDate.getTime() === tomorrow.getTime()) return "Tomorrow";
// //     if (rideDate > tomorrow) return "Upcoming Rides";
// //     return "Past Rides";
// //   };

// //   const getSortedPostedRides = () => {
// //     let rides = [...postedRides];
// //     const now = new Date();
// //     const today = new Date();
// //     today.setHours(0, 0, 0, 0);
// //     const tomorrow = new Date(today);
// //     tomorrow.setDate(tomorrow.getDate() + 1);
    
// //     rides = rides.map(ride => {
// //       const departureTime = new Date(ride.departure_time);
// //       const hoursSinceDeparture = (now - departureTime) / (1000 * 60 * 60);
      
// //       if (hoursSinceDeparture > 2 && !ride.started_at && !ride.completed_at && !ride.cancellation_reason) {
// //         ride.auto_cancelled = true;
// //       }
// //       return ride;
// //     });
    
// //     if (postedFilter !== "all") {
// //       rides = rides.filter((ride) => {
// //         const rideTime = new Date(ride.departure_time);
// //         const hoursSinceDeparture = (now - rideTime) / (1000 * 60 * 60);
// //         const isAutoCancelled = (hoursSinceDeparture > 2 && !ride.started_at && !ride.completed_at && !ride.cancellation_reason);
        
// //         if (postedFilter === "completed") {
// //           return ride.status === "completed" || ride.completed_at;
// //         }
// //         if (postedFilter === "cancelled") {
// //           return ride.cancellation_reason && !ride.cancellation_reason.includes("Auto-cancelled");
// //         }
// //         if (postedFilter === "autocancelled") {
// //           return isAutoCancelled || (ride.cancellation_reason && ride.cancellation_reason.includes("Auto-cancelled"));
// //         }
// //         if (postedFilter === "past") {
// //           return (ride.status === "completed" || ride.completed_at || ride.cancellation_reason || isAutoCancelled);
// //         }
// //         return true;
// //       });
// //     }
    
// //     const getDateCategory = (rideDate, ride) => {
// //       const rideDateOnly = new Date(rideDate);
// //       rideDateOnly.setHours(0, 0, 0, 0);
// //       const hoursSinceDeparture = (now - rideDateOnly) / (1000 * 60 * 60);
      
// //       if (postedFilter === "all") {
// //         if ((ride.status === "completed" || ride.completed_at || ride.cancellation_reason) && hoursSinceDeparture > 24) {
// //           return 'archived';
// //         }
// //       }
// //       if (postedFilter === "past") {
// //         return 'past';
// //       }
// //       if (rideDateOnly < today) return 'past';
// //       if (rideDateOnly.getTime() === today.getTime()) return 'today';
// //       if (rideDateOnly.getTime() === tomorrow.getTime()) return 'tomorrow';
// //       return 'future';
// //     };
    
// //     const getPriority = (ride) => {
// //       if (ride.started_at && !ride.completed_at && ride.status !== "completed") {
// //         return 0;
// //       }
// //       return 1;
// //     };
    
// //     rides.sort((a, b) => {
// //       const priorityA = getPriority(a);
// //       const priorityB = getPriority(b);
      
// //       if (priorityA !== priorityB) {
// //         return priorityA - priorityB;
// //       }
      
// //       const dateA = new Date(a.departure_time);
// //       const dateB = new Date(b.departure_time);
// //       const categoryA = getDateCategory(dateA, a);
// //       const categoryB = getDateCategory(dateB, b);
      
// //       let categoryOrder = {};
// //       if (postedFilter === "past") {
// //         categoryOrder = { 'past': 0 };
// //       } else {
// //         categoryOrder = { 'today': 0, 'tomorrow': 1, 'future': 2, 'past': 3, 'archived': 4 };
// //       }
      
// //       if (categoryOrder[categoryA] !== categoryOrder[categoryB]) {
// //         return categoryOrder[categoryA] - categoryOrder[categoryB];
// //       }
      
// //       const aTime = dateA.getTime();
// //       const bTime = dateB.getTime();
      
// //       if (categoryA === 'past' || categoryA === 'archived' || postedFilter === "past") {
// //         return bTime - aTime;
// //       } else {
// //         return aTime - bTime;
// //       }
// //     });
    
// //     if (postedFilter === "all") {
// //       rides = rides.filter(ride => getDateCategory(new Date(ride.departure_time), ride) !== 'archived');
// //     }
    
// //     return rides;
// //   };

// //   const getSortedRequestedRides = () => {
// //     let rides = [...requestedRides];
// //     const now = new Date();
// //     const today = new Date();
// //     today.setHours(0, 0, 0, 0);
// //     const tomorrow = new Date(today);
// //     tomorrow.setDate(tomorrow.getDate() + 1);
    
// //     rides = rides.map(ride => {
// //       const departureTime = new Date(ride.departure_time);
// //       const hoursSinceDeparture = (now - departureTime) / (1000 * 60 * 60);
      
// //       if (hoursSinceDeparture > 2 && !ride.ride_started_at && ride.ride_status !== "completed" && !ride.cancellation_reason) {
// //         ride.auto_cancelled = true;
// //       }
// //       return ride;
// //     });
    
// //     if (requestedFilter !== "all") {
// //       rides = rides.filter((ride) => {
// //         const rideTime = new Date(ride.departure_time);
// //         const hoursSinceDeparture = (now - rideTime) / (1000 * 60 * 60);
// //         const isAutoCancelled = (hoursSinceDeparture > 2 && !ride.ride_started_at && ride.ride_status !== "completed" && !ride.cancellation_reason);
        
// //         if (requestedFilter === "completed") {
// //           return ride.ride_status === "completed" || ride.completed_at;
// //         }
// //         if (requestedFilter === "cancelled") {
// //           return ride.ride_cancelled || ride.cancellation_reason || ride.ride_status === "cancelled";
// //         }
// //         if (requestedFilter === "autocancelled") {
// //           return isAutoCancelled || (ride.cancellation_reason && ride.cancellation_reason.includes("Auto-cancelled"));
// //         }
// //         if (requestedFilter === "rejected") {
// //           return ride.status === "rejected";
// //         }
// //         if (requestedFilter === "past") {
// //           const isPastRide = ride.ride_status === "completed" || 
// //                             ride.completed_at || 
// //                             ride.ride_cancelled || 
// //                             ride.cancellation_reason || 
// //                             ride.ride_status === "cancelled" ||
// //                             ride.status === "rejected" ||
// //                             isAutoCancelled;
// //           return isPastRide;
// //         }
// //         return true;
// //       });
// //     }
    
// //     if (requestedFilter === "all") {
// //       rides = rides.filter((ride) => {
// //         const departureTime = new Date(ride.departure_time);
// //         const hoursSinceDeparture = (now - departureTime) / (1000 * 60 * 60);
        
// //         const isCompletedAndOld = (ride.ride_status === "completed" || ride.completed_at) && hoursSinceDeparture > 24;
// //         const isCancelledAndOld = (ride.ride_cancelled || ride.cancellation_reason || ride.ride_status === "cancelled" || ride.auto_cancelled) && hoursSinceDeparture > 24;
        
// //         return !isCompletedAndOld && !isCancelledAndOld;
// //       });
// //     }
    
// //     const getDateCategory = (rideDate) => {
// //       const rideDateOnly = new Date(rideDate);
// //       rideDateOnly.setHours(0, 0, 0, 0);
      
// //       if (rideDateOnly < today) return 'past';
// //       if (rideDateOnly.getTime() === today.getTime()) return 'today';
// //       if (rideDateOnly.getTime() === tomorrow.getTime()) return 'tomorrow';
// //       return 'future';
// //     };
    
// //     const getPriority = (ride) => {
// //       if (ride.ride_started_at && ride.ride_status !== "completed") {
// //         return 0;
// //       }
// //       return 1;
// //     };
    
// //     rides.sort((a, b) => {
// //       const priorityA = getPriority(a);
// //       const priorityB = getPriority(b);
      
// //       if (priorityA !== priorityB) {
// //         return priorityA - priorityB;
// //       }
      
// //       const dateA = new Date(a.departure_time);
// //       const dateB = new Date(b.departure_time);
// //       const categoryA = getDateCategory(dateA);
// //       const categoryB = getDateCategory(dateB);
      
// //       const categoryOrder = { 'today': 0, 'tomorrow': 1, 'future': 2, 'past': 3 };
      
// //       if (categoryOrder[categoryA] !== categoryOrder[categoryB]) {
// //         return categoryOrder[categoryA] - categoryOrder[categoryB];
// //       }
      
// //       const aTime = dateA.getTime();
// //       const bTime = dateB.getTime();
      
// //       if (categoryA === 'past') {
// //         return bTime - aTime;
// //       } else {
// //         return aTime - bTime;
// //       }
// //     });
    
// //     return rides;
// //   };

// //   const getStatusColor = (status, cancellationReason, isPast, ride = null) => {
// //     if (ride?.status === "completed") return "#6B7280";
// //     if (ride?.started_at && status === "accepted" && ride?.status !== "completed") return "#10B981";
// //     if (cancellationReason && cancellationReason.includes("Auto-cancelled")) return "#9CA3AF";
// //     if (status === "cancelled" || cancellationReason) return "#DC2626";
// //     if (isPast && status === "accepted") return "#9CA3AF";
// //     switch (status) {
// //       case "accepted": case "active": return "#10B981";
// //       case "pending": return "#F59E0B";
// //       case "rejected": return "#DC2626";
// //       case "completed": return "#6B7280";
// //       default: return Colors.gray;
// //     }
// //   };

// //   const getStatusIcon = (status, cancellationReason, isPast, ride = null) => {
// //     if (ride?.status === "completed") return "checkmark-done";
// //     if (ride?.started_at && status === "accepted" && ride?.status !== "completed") return "car-sport";
// //     if (cancellationReason && cancellationReason.includes("Auto-cancelled")) return "timer-off";
// //     if (status === "cancelled" || cancellationReason) return "close-circle";
// //     if (isPast && status === "accepted") return "time-outline";
// //     switch (status) {
// //       case "active": case "accepted": return ride?.started_at && ride?.status !== "completed" ? "car-sport" : "checkmark-circle";
// //       case "completed": return "checkmark-done";
// //       case "rejected": return "close-circle";
// //       case "pending": return "time";
// //       default: return "ellipse";
// //     }
// //   };

// //   const getStatusText = (status, cancellationReason, isPast, ride = null) => {
// //     if (ride?.status === "completed") return "Completed";
// //     if (ride?.started_at && status === "accepted" && ride?.status !== "completed") return "Ride Ongoing";
// //     if (cancellationReason && cancellationReason.includes("Auto-cancelled")) return "Auto-cancelled";
// //     if (status === "cancelled" || cancellationReason) return "Cancelled";
// //     if (isPast && status === "accepted") return "Ride Completed";
// //     if (status === "full") return "Full";
// //     if (status === "active") return "Active";
// //     if (status === "accepted") return "Accepted";
// //     if (status === "pending") return "Pending";
// //     if (status === "rejected") return "Rejected";
// //     if (status === "completed") return "Completed";
// //     if (isPast) return "Expired";
// //     return status?.charAt(0).toUpperCase() + status?.slice(1) || "Unknown";
// //   };

// //   const isRideDisabled = (ride) => {
// //     const now = new Date();
// //     const departureTime = new Date(ride.departure_time);
// //     const hoursSinceDeparture = (now - departureTime) / (1000 * 60 * 60);
    
// //     return ride.status === "cancelled" || 
// //            ride.status === "completed" || 
// //            ride.cancellation_reason || 
// //            (hoursSinceDeparture > 2 && !ride.started_at);
// //   };

// //   const handleTabPress = (tab) => {
// //     Animated.sequence([
// //       Animated.timing(tabScaleAnim, { toValue: 0.95, duration: 100, useNativeDriver: true }),
// //       Animated.timing(tabScaleAnim, { toValue: 1, duration: 100, useNativeDriver: true }),
// //     ]).start();
// //     setActiveTab(tab);
// //   };

// //   const handleFilterPress = () => {
// //     setTempFilter(activeTab === "posted" ? postedFilter : requestedFilter);
// //     setShowFilterModal(true);
// //   };

// //   const applyFilter = () => {
// //     if (activeTab === "posted") {
// //       setPostedFilter(tempFilter);
// //     } else {
// //       setRequestedFilter(tempFilter);
// //     }
// //     setShowFilterModal(false);
// //   };

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
// //     return { dayText, timeText };
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

// //   const renderProfileImage = (imageUrl, name, size = 48, style = {}) => {
// //     const url = buildImageUrl(imageUrl);
// //     const isSvg = isSvgImage(url);
// //     if (url && isSvg) {
// //       return (
// //         <View style={[styles.avatarContainer, { width: size, height: size, borderRadius: size / 2 }, style]}>
// //           <SvgCssUri uri={url} width={size} height={size} />
// //         </View>
// //       );
// //     } else if (url) {
// //       return (
// //         <Image 
// //           source={{ uri: url }} 
// //           style={[styles.avatarImage, { width: size, height: size, borderRadius: size / 2 }, style]} 
// //           resizeMode="cover" 
// //         />
// //       );
// //     } else {
// //       return (
// //         <View style={[styles.avatarPlaceholder, { width: size, height: size, borderRadius: size / 2 }, style]}>
// //           <Text style={[styles.avatarPlaceholderText, { fontSize: size / 2.5 }]}>{getInitials(name)}</Text>
// //         </View>
// //       );
// //     }
// //   };

// //   const getRiderPickupLocation = (booking) => {
// //     if (booking.pickup_address) {
// //       return `📍 ${booking.pickup_address}`;
// //     }
    
// //     if (booking.intersection_pickup_lat && booking.intersection_pickup_lon) {
// //       const walkDist = booking.pickup_walk_distance_m;
// //       const address = addressCache[`${booking.intersection_pickup_lat},${booking.intersection_pickup_lon}`];
// //       if (address) {
// //         if (walkDist && walkDist > 0) {
// //           return `🚩 ${address} (${walkDist}m walk from your location)`;
// //         }
// //         return `🚩 ${address}`;
// //       }
// //       if (walkDist && walkDist > 0) {
// //         return `🚩 Meet point (${walkDist}m walk from your location)`;
// //       }
// //       return "🚩 Meet point on driver's route";
// //     }
    
// //     if (booking.pickup_lat && booking.pickup_lon) {
// //       const address = addressCache[`${booking.pickup_lat},${booking.pickup_lon}`];
// //       if (address) {
// //         return `📍 ${address}`;
// //       }
// //       return `📍 Your pickup location`;
// //     }
    
// //     if (booking.origin && booking.origin !== 'null' && booking.origin !== 'undefined') {
// //       return `📍 ${booking.origin.split(',')[0]}`;
// //     }
    
// //     return "📍 Pickup location not specified";
// //   };

// //   const getRiderDropoffLocation = (booking) => {
// //     if (booking.dropoff_address) {
// //       return `📍 ${booking.dropoff_address}`;
// //     }
    
// //     if (booking.intersection_drop_lat && booking.intersection_drop_lon) {
// //       const walkDist = booking.drop_walk_distance_m;
// //       const address = addressCache[`${booking.intersection_drop_lat},${booking.intersection_drop_lon}`];
// //       if (address) {
// //         if (walkDist && walkDist > 0) {
// //           return `🏁 ${address} (${walkDist}m walk to destination)`;
// //         }
// //         return `🏁 ${address}`;
// //       }
// //       if (walkDist && walkDist > 0) {
// //         return `🏁 Drop point (${walkDist}m walk to destination)`;
// //       }
// //       return "🏁 Drop point on driver's route";
// //     }
    
// //     if (booking.drop_lat && booking.drop_lon) {
// //       const address = addressCache[`${booking.drop_lat},${booking.drop_lon}`];
// //       if (address) {
// //         return `📍 ${address}`;
// //       }
// //       return `📍 Your dropoff location`;
// //     }
    
// //     if (booking.destination && booking.destination !== 'null' && booking.destination !== 'undefined') {
// //       return `📍 ${booking.destination.split(',')[0]}`;
// //     }
    
// //     return "📍 Dropoff location not specified";
// //   };

// //   // Fetch addresses for all bookings
// //   useEffect(() => {
// //     const fetchAllAddresses = async () => {
// //       const allCoordinates = [];
      
// //       postedRides.forEach(ride => {
// //         if (ride.bookings && Array.isArray(ride.bookings)) {
// //           ride.bookings.forEach(booking => {
// //             if (!booking.pickup_address && booking.intersection_pickup_lat && booking.intersection_pickup_lon) {
// //               const key = `${booking.intersection_pickup_lat},${booking.intersection_pickup_lon}`;
// //               if (!addressCache[key] && !allCoordinates.find(c => c.key === key)) {
// //                 allCoordinates.push({ key, lat: booking.intersection_pickup_lat, lng: booking.intersection_pickup_lon });
// //               }
// //             } else if (!booking.pickup_address && booking.pickup_lat && booking.pickup_lon) {
// //               const key = `${booking.pickup_lat},${booking.pickup_lon}`;
// //               if (!addressCache[key] && !allCoordinates.find(c => c.key === key)) {
// //                 allCoordinates.push({ key, lat: booking.pickup_lat, lng: booking.pickup_lon });
// //               }
// //             }
            
// //             if (!booking.dropoff_address && booking.intersection_drop_lat && booking.intersection_drop_lon) {
// //               const key = `${booking.intersection_drop_lat},${booking.intersection_drop_lon}`;
// //               if (!addressCache[key] && !allCoordinates.find(c => c.key === key)) {
// //                 allCoordinates.push({ key, lat: booking.intersection_drop_lat, lng: booking.intersection_drop_lon });
// //               }
// //             } else if (!booking.dropoff_address && booking.drop_lat && booking.drop_lon) {
// //               const key = `${booking.drop_lat},${booking.drop_lon}`;
// //               if (!addressCache[key] && !allCoordinates.find(c => c.key === key)) {
// //                 allCoordinates.push({ key, lat: booking.drop_lat, lng: booking.drop_lon });
// //               }
// //             }
// //           });
// //         }
// //       });
      
// //       requestedRides.forEach(booking => {
// //         if (!booking.pickup_address && booking.intersection_pickup_lat && booking.intersection_pickup_lon) {
// //           const key = `${booking.intersection_pickup_lat},${booking.intersection_pickup_lon}`;
// //           if (!addressCache[key] && !allCoordinates.find(c => c.key === key)) {
// //             allCoordinates.push({ key, lat: booking.intersection_pickup_lat, lng: booking.intersection_pickup_lon });
// //           }
// //         } else if (!booking.pickup_address && booking.pickup_lat && booking.pickup_lon) {
// //           const key = `${booking.pickup_lat},${booking.pickup_lon}`;
// //           if (!addressCache[key] && !allCoordinates.find(c => c.key === key)) {
// //             allCoordinates.push({ key, lat: booking.pickup_lat, lng: booking.pickup_lon });
// //           }
// //         }
        
// //         if (!booking.dropoff_address && booking.intersection_drop_lat && booking.intersection_drop_lon) {
// //           const key = `${booking.intersection_drop_lat},${booking.intersection_drop_lon}`;
// //           if (!addressCache[key] && !allCoordinates.find(c => c.key === key)) {
// //             allCoordinates.push({ key, lat: booking.intersection_drop_lat, lng: booking.intersection_drop_lon });
// //           }
// //         } else if (!booking.dropoff_address && booking.drop_lat && booking.drop_lon) {
// //           const key = `${booking.drop_lat},${booking.drop_lon}`;
// //           if (!addressCache[key] && !allCoordinates.find(c => c.key === key)) {
// //             allCoordinates.push({ key, lat: booking.drop_lat, lng: booking.drop_lon });
// //           }
// //         }
// //       });
      
// //       if (allCoordinates.length === 0) return;
      
// //       setLoadingAddresses(true);
      
// //       const batchSize = 5;
// //       for (let i = 0; i < allCoordinates.length; i += batchSize) {
// //         const batch = allCoordinates.slice(i, i + batchSize);
// //         await Promise.all(batch.map(async (coord) => {
// //           await getAddressFromCoordsGoogle(coord.lat, coord.lng);
// //         }));
        
// //         if (i + batchSize < allCoordinates.length) {
// //           await new Promise(resolve => setTimeout(resolve, 200));
// //         }
// //       }
      
// //       setLoadingAddresses(false);
// //     };
    
// //     if ((postedRides.length > 0 || requestedRides.length > 0) && !loadingAddresses) {
// //       fetchAllAddresses();
// //     }
// //   }, [postedRides, requestedRides]);
// // // Add this helper function inside your component
// // const getActualBookedSeats = (ride) => {
// //   if (!ride.bookings || !Array.isArray(ride.bookings)) return 0;
  
// //   // Only count active bookings (accepted and not cancelled by modification rejection)
// //   const activeBookings = ride.bookings.filter(bookingItem => {
// //     // Skip if booking is cancelled
// //     if (bookingItem.status === 'cancelled') return false;
    
// //     // Skip if modification request was rejected (this cancels the booking)
// //     if (bookingItem.modification_request?.status === 'rejected') return false;
    
// //     // Only count accepted bookings
// //     return bookingItem.status === 'accepted';
// //   });
  
// //   // Sum up seats from active bookings
// //   const totalBooked = activeBookings.reduce((sum, bookingItem) => {
// //     // If modification was approved, use the new seat count
// //     if (bookingItem.modification_request?.status === 'approved') {
// //       return sum + (bookingItem.modification_request.requested_seats || 0);
// //     }
// //     return sum + (bookingItem.seats_requested || 0);
// //   }, 0);
  
// //   return totalBooked;
// // };

// // const getActualAvailableSeats = (ride) => {
// //   const totalSeats = ride.available_seats || ride.total_seats || 0;
// //   const bookedSeats = getActualBookedSeats(ride);
// //   return Math.max(0, totalSeats - bookedSeats);
// // };
// // const renderPostedRideCard = (ride) => {
// //     const hasPendingBookings = Array.isArray(ride.bookings) ? ride.bookings.some((b) => b.status === "pending") : false;
// //     const hasPendingModifications = Array.isArray(ride.bookings) ? ride.bookings.some((b) => b.modification_request && b.modification_request.status === "pending") : false;
// //     const isExpanded = expandedPostedRides[ride.id];
// //     const isDisabled = isRideDisabled(ride);
// //     const isAutoCancelled = ride.cancellation_reason && ride.cancellation_reason.includes("Auto-cancelled") || ride.auto_cancelled;
    
// //     // Calculate actual booked seats (excluding cancelled and rejected modification bookings)
// //     const actualBookedSeats = getActualBookedSeats(ride);
// //     const actualAvailableSeats = getActualAvailableSeats(ride);
    
// //     const startRideEnabled = canStartRide(ride);
// //     const departureTime = new Date(ride.departure_time);
// //     const now = new Date();
// //     const minutesToDeparture = Math.ceil((departureTime - now) / (1000 * 60));
// //     const minutesSinceDeparture = Math.ceil((now - departureTime) / (1000 * 60));
// //     const hoursSinceDeparture = (now - departureTime) / (1000 * 60 * 60);
// //     const rideStatusInfo = getRideStatusInfo(ride);
// //     const cancellationInfo = getCancellationStatusDisplay(ride);
// //     const hasCancelledBookings = ride.bookings?.some(b => b.status === "cancelled") || false;
// //     const cancelledBookingsCount = ride.bookings?.filter(b => b.status === "cancelled")?.length || 0;
// //     const isRideCompleted = ride.status === "completed" || ride.completed_at;
    
// //     const pendingModifications = ride.bookings?.filter(b => 
// //       b.modification_request && b.modification_request.status === "pending"
// //     ) || [];
    
// //     const rejectedModifications = ride.bookings?.filter(b => 
// //       b.modification_request && b.modification_request.status === "rejected"
// //     ) || [];
    
// //     const getStartButtonText = () => {
// //       if (ride?.live_session?.session_id) return 'Open Ongoing Ride';
// //       if (minutesSinceDeparture > 0 && minutesSinceDeparture <= 120) {
// //         return `Start Ride (${minutesSinceDeparture} min late)`;
// //       }
// //       if (minutesToDeparture <= 15 && minutesToDeparture > 0) {
// //         return `Start Ride (in ${minutesToDeparture} min)`;
// //       }
// //       return 'Start Ride';
// //     };
    
// //     return (
// //       <View key={ride.id} style={[styles.card, targetRideId === ride.id && styles.highlightRideCard]}>
// //         <TouchableOpacity style={styles.cardHeader} onPress={() => togglePostedRideExpand(ride.id)} activeOpacity={0.7}>
// //           <View style={styles.routeContainer}>
// //             <View style={styles.locationDot}>
// //               <View style={[styles.dot, { backgroundColor: Colors.success }]} />
// //               <View style={styles.line} />
// //               <View style={[styles.dot, { backgroundColor: Colors.secondary }]} />
// //             </View>
// //             <View style={styles.routeTextContainer}>
// //               <Text style={styles.routeOrigin} numberOfLines={1}>{ride.origin?.split(",")[0] || "Origin"}</Text>
// //               <Text style={styles.routeDestination} numberOfLines={1}>{ride.destination?.split(",")[0] || "Destination"}</Text>
// //             </View>
// //           </View>
// //           <View style={styles.cardHeaderRight}>
// //             <View style={[styles.statusBadge, { backgroundColor: rideStatusInfo.color }]}>
// //               <Ionicons name={rideStatusInfo.icon} size={12} color={Colors.white} style={styles.statusIcon} />
// //               <Text style={styles.statusText}>{rideStatusInfo.text}</Text>
// //             </View>
// //             {cancellationInfo && (
// //               <View style={[styles.cancelledBadge, { backgroundColor: cancellationInfo.color }]}>
// //                 <Ionicons name={cancellationInfo.icon} size={10} color="#fff" />
// //                 <Text style={styles.cancelledBadgeText}>CANCELLED</Text>
// //               </View>
// //             )}
// //             {pendingModifications.length > 0 && !cancellationInfo && (
// //               <View style={styles.pendingModificationBadge}>
// //                 <Ionicons name="swap" size={10} color="#fff" />
// //                 <Text style={styles.pendingModificationBadgeText}>{pendingModifications.length}</Text>
// //               </View>
// //             )}
// //             {rejectedModifications.length > 0 && !cancellationInfo && (
// //               <View style={[styles.pendingModificationBadge, { backgroundColor: "#DC2626" }]}>
// //                 <Ionicons name="close" size={10} color="#fff" />
// //                 <Text style={styles.pendingModificationBadgeText}>{rejectedModifications.length}</Text>
// //               </View>
// //             )}
// //             <Ionicons name={isExpanded ? "chevron-up" : "chevron-down"} size={20} color={Colors.gray} style={styles.expandIcon} />
// //           </View>
// //         </TouchableOpacity>

// //         {isExpanded && pendingModifications.length > 0 && !cancellationInfo && (
// //           <View style={styles.pendingModificationsSection}>
// //             <View style={styles.pendingModificationsHeader}>
// //               <Ionicons name="swap" size={18} color="#F59E0B" />
// //               <Text style={styles.pendingModificationsTitle}>Pending Modification Requests ({pendingModifications.length})</Text>
// //             </View>
// //             {pendingModifications.map((modificationItem) => (
// //               <View key={modificationItem.id} style={styles.pendingModificationCard}>
// //                 <View style={styles.pendingModificationContent}>
// //                   <View style={styles.pendingModificationAvatar}>
// //                     {renderProfileImage(modificationItem.passenger_photo, modificationItem.passenger_name || "Rider", 40)}
// //                   </View>
// //                   <View style={styles.pendingModificationInfo}>
// //                     <Text style={styles.pendingModificationPassengerName}>{modificationItem.passenger_name || "Rider"}</Text>
// //                     <View style={styles.pendingModificationSeatChange}>
// //                       <Text style={styles.oldSeatCount}>{modificationItem.modification_request.current_seats} seats</Text>
// //                       <Ionicons name="arrow-forward" size={12} color="#F59E0B" />
// //                       <Text style={styles.newSeatCount}>{modificationItem.modification_request.requested_seats} seats</Text>
// //                     </View>
// //                     <Text style={styles.pendingModificationTime}>
// //                       Requested: {new Date(modificationItem.modification_request.created_at).toLocaleString()}
// //                     </Text>
// //                   </View>
// //                 </View>
// //                 <View style={styles.pendingModificationActions}>
// //                   <TouchableOpacity 
// //                     style={[styles.modActionBtn, styles.approveModBtn]} 
// //                     onPress={() => handleModificationAction(modificationItem.modification_request.id, 'approve', modificationItem.id)}>
// //                     <Ionicons name="checkmark" size={16} color="#fff" />
// //                     <Text style={styles.modActionBtnText}>Approve</Text>
// //                   </TouchableOpacity>
// //                   <TouchableOpacity 
// //                     style={[styles.modActionBtn, styles.rejectModBtn]} 
// //                     onPress={() => handleModificationAction(modificationItem.modification_request.id, 'reject', modificationItem.id)}>
// //                     <Ionicons name="close" size={16} color="#fff" />
// //                     <Text style={styles.modActionBtnText}>Reject</Text>
// //                   </TouchableOpacity>
// //                 </View>
// //               </View>
// //             ))}
// //           </View>
// //         )}

// //         {isExpanded && rejectedModifications.length > 0 && !cancellationInfo && (
// //           <View style={[styles.pendingModificationsSection, { backgroundColor: '#FEF2F2', borderColor: '#FEE2E2' }]}>
// //             <View style={styles.pendingModificationsHeader}>
// //               <Ionicons name="close-circle" size={18} color="#DC2626" />
// //               <Text style={[styles.pendingModificationsTitle, { color: '#DC2626' }]}>Rejected Modification Requests - Bookings Cancelled</Text>
// //             </View>
// //             {rejectedModifications.map((rejectedItem) => (
// //               <View key={rejectedItem.id} style={[styles.pendingModificationCard, { backgroundColor: '#FFF5F5', borderColor: '#FEE2E2' }]}>
// //                 <View style={styles.pendingModificationContent}>
// //                   <View style={styles.pendingModificationAvatar}>
// //                     {renderProfileImage(rejectedItem.passenger_photo, rejectedItem.passenger_name || "Rider", 40)}
// //                   </View>
// //                   <View style={styles.pendingModificationInfo}>
// //                     <Text style={styles.pendingModificationPassengerName}>{rejectedItem.passenger_name || "Rider"}</Text>
// //                     <View style={styles.pendingModificationSeatChange}>
// //                       <Text style={[styles.oldSeatCount, { textDecorationLine: 'line-through' }]}>{rejectedItem.modification_request.current_seats} seats</Text>
// //                       <Ionicons name="arrow-forward" size={12} color="#DC2626" />
// //                       <Text style={[styles.newSeatCount, { color: '#DC2626', textDecorationLine: 'line-through' }]}>{rejectedItem.modification_request.requested_seats} seats</Text>
// //                     </View>
// //                     <Text style={[styles.pendingModificationTime, { color: '#DC2626' }]}>
// //                       ❌ Rejected - Booking Cancelled
// //                     </Text>
// //                     <Text style={[styles.pendingModificationTime, { color: '#DC2626' }]}>
// //                       Original {rejectedItem.modification_request.current_seats} seat(s) cancelled
// //                     </Text>
// //                     {rejectedItem.modification_request.rejection_reason && (
// //                       <Text style={styles.rejectionReasonText}>Reason: {rejectedItem.modification_request.rejection_reason}</Text>
// //                     )}
// //                   </View>
// //                 </View>
// //                 <View style={styles.rejectedModificationBadge}>
// //                   <Ionicons name="warning-outline" size={14} color="#DC2626" />
// //                   <Text style={styles.rejectedModificationBadgeText}>Booking Cancelled • Seats Released</Text>
// //                 </View>
// //               </View>
// //             ))}
// //           </View>
// //         )}

// //         {cancellationInfo && (
// //           <View style={styles.cancellationBanner}>
// //             <Ionicons name={cancellationInfo.icon} size={18} color={cancellationInfo.color} />
// //             <View style={styles.cancellationBannerText}>
// //               <Text style={[styles.cancellationBannerTitle, { color: cancellationInfo.color }]}>
// //                 {cancellationInfo.text}
// //               </Text>
// //               <Text style={styles.cancellationBannerMessage}>{cancellationInfo.message}</Text>
// //             </View>
// //           </View>
// //         )}

// //         {hasCancelledBookings && (
// //           <View style={styles.cancelledBookingsSummary}>
// //             <Ionicons name="warning-outline" size={14} color="#DC2626" />
// //             <Text style={styles.cancelledBookingsText}>
// //               {cancelledBookingsCount} booking(s) were cancelled due to ride cancellation
// //             </Text>
// //           </View>
// //         )}

// //         {isExpanded && !cancellationInfo && (
// //           <View>
// //             {isAutoCancelled && (
// //               <View style={styles.cancellationReasonContainer}>
// //                 <Ionicons name="information-circle" size={14} color="#DC2626" />
// //                 <Text style={styles.cancellationReasonText}>{ride.cancellation_reason || "Ride auto-cancelled as it was not started within 2 hours of departure time."}</Text>
// //               </View>
// //             )}

// //             <View style={styles.cardDetails}>
// //               <View style={styles.detailItem}>
// //                 <Ionicons name="calendar-outline" size={16} color={Colors.gray} />
// //                 <Text style={styles.detailText}>{formatDate(ride.departure_time).dayText}</Text>
// //                 <Text style={styles.detailTextSecondary}>{formatDate(ride.departure_time).timeText}</Text>
// //               </View>
// //               <View style={styles.detailDivider} />
// //               <View style={styles.detailItem}>
// //                 <Ionicons name="people-outline" size={16} color={Colors.gray} />
// //                 <View style={{ flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap' }}>
// //                   <Text style={styles.detailText}>
// //                     {actualBookedSeats} / {ride.available_seats} seats
// //                   </Text>
// //                   {/* {actualAvailableSeats > 0 && (
// //                     <Text style={[styles.detailTextSecondary, { color: '#10B981', marginLeft: 6, fontWeight: '600' }]}>
// //                       ({actualAvailableSeats} available)
// //                     </Text>
// //                   )} */}
// //                   {/* {actualAvailableSeats === 0 && actualBookedSeats >= (ride.available_seats || 0) && (
// //                     <Text style={[styles.detailTextSecondary, { color: '#DC2626', marginLeft: 6, fontWeight: '600' }]}>
// //                       (FULL)
// //                     </Text>
// //                   )} */}
// //                 </View>
// //               </View>
// //               <View style={styles.detailDivider} />
// //               <View style={styles.detailItem}>
// //                 <Ionicons name="wallet-outline" size={16} color={Colors.gray} />
// //                 <Text style={styles.detailTextPrice}>₹{ride.price_per_seat}</Text>
// //                 <Text style={styles.detailTextSecondary}>/seat</Text>
// //               </View>
// //             </View>

// //             <TouchableOpacity style={styles.viewRouteBtn} onPress={() => handleViewRideDetails(ride)}>
// //               <Ionicons name="map-outline" size={16} color={Colors.primary} />
// //               <Text style={styles.viewRouteBtnText}>View Route Details</Text>
// //             </TouchableOpacity>

// //             {!isRideCompleted && !isDisabled && !ride.started_at && hoursSinceDeparture <= 2 && ride.status !== "completed" && rideStatusInfo.type !== 'auto-cancelled' && (
// //               <View style={styles.driverActionWrapper}>
// //                 <TouchableOpacity 
// //                   style={[styles.startRideBtn, (!startRideEnabled && rideStatusInfo.type !== 'late') && styles.startRideBtnDisabled]} 
// //                   onPress={() => handleStartRide(ride)} 
// //                   activeOpacity={0.85} 
// //                   disabled={!startRideEnabled && rideStatusInfo.type !== 'late'}>
// //                   <Text style={styles.startRideBtnText}>
// //                     {getStartButtonText()}
// //                   </Text>
// //                 </TouchableOpacity>
// //                 <View style={styles.secondaryActionsRow}>
// //                   <TouchableOpacity style={styles.secondaryBtn} onPress={() => handleEditRide(ride)} activeOpacity={0.85}>
// //                     <Text style={styles.secondaryBtnText}>Edit Details</Text>
// //                   </TouchableOpacity>
// //                   <TouchableOpacity style={styles.secondaryBtn} onPress={() => cancelRide(ride.id)} activeOpacity={0.85}>
// //                     <Text style={styles.secondaryBtnText}>Cancel</Text>
// //                   </TouchableOpacity>
// //                 </View>
// //               </View>
// //             )}

// //             {ride.started_at && !isRideCompleted && (
// //               <TouchableOpacity style={[styles.startRideBtn, { backgroundColor: "#10B981" }]} onPress={() => navigation.navigate('OngoingRideDriverScreen', { rideId: ride.id, sessionId: ride.live_session?.session_id })}>
// //                 <Text style={styles.startRideBtnText}>Continue Ride</Text>
// //               </TouchableOpacity>
// //             )}

// //             {isRideCompleted && ride.live_session?.session_id && (
// //               <View style={styles.rateRidersSection}>
// //                 <Text style={styles.rateSectionTitle}>Rate Your Riders</Text>
// //                 {ride.bookings?.filter(rateItem => rateItem.status === "accepted" && rateItem.modification_request?.status !== "rejected").map((rateItem) => (
// //                   <View key={rateItem.id} style={styles.rateRiderItem}>
// //                     <View style={styles.rateRiderInfo}>
// //                       {renderProfileImage(rateItem.passenger_photo, rateItem.passenger_name, 40)}
// //                       <View>
// //                         <Text style={styles.rateRiderName}>{rateItem.passenger_name}</Text>
// //                         <Text style={styles.rateRiderSeats}>
// //                           {rateItem.modification_request?.status === "approved" 
// //                             ? rateItem.modification_request.requested_seats 
// //                             : rateItem.seats_requested} seats
// //                         </Text>
// //                       </View>
// //                     </View>
// //                     {rateItem.driver_rating ? (
// //                       <View style={styles.alreadyRatedBadge}>
// //                         <Ionicons name="star" size={14} color="#F59E0B" />
// //                         <Text style={styles.alreadyRatedText}>Rated {rateItem.driver_rating}/5</Text>
// //                       </View>
// //                     ) : (
// //                       <TouchableOpacity 
// //                         style={styles.rateRiderBtn}
// //                         onPress={() => openRateRiderModal(rateItem, ride.live_session.session_id)}>
// //                         <Text style={styles.rateRiderBtnText}>Rate</Text>
// //                       </TouchableOpacity>
// //                     )}
// //                   </View>
// //                 ))}
// //               </View>
// //             )}

// //             {Array.isArray(ride.bookings) && ride.bookings.length > 0 && !isRideCompleted && !isAutoCancelled && (
// //               <View style={styles.bookingsSection}>
// //                 <View style={styles.bookingSectionHeader}>
// //                   <Text style={styles.bookingsTitle}>Rider Requests ({ride.bookings.length})</Text>
// //                   <View style={{ flexDirection: 'row', gap: 8, alignItems: 'center' }}>
// //                     {(hasPendingBookings || hasPendingModifications) && (
// //                       <View style={styles.pendingChip}>
// //                         <Text style={styles.pendingChipText}>Action needed</Text>
// //                       </View>
// //                     )}
// //                     {actualAvailableSeats > 0 && (
// //                       <View style={[styles.pendingChip, { backgroundColor: '#E8F5E9' }]}>
// //                         <Text style={[styles.pendingChipText, { color: '#2E7D32' }]}>
// //                           {actualAvailableSeats} seats available
// //                         </Text>
// //                       </View>
// //                     )}
// //                   </View>
// //                 </View>
// //                 {ride.bookings.map((bookingItem) => {
// //                   const bookingCancellationInfo = getCancellationStatusDisplay(bookingItem);
// //                   const hasModificationRequest = bookingItem.modification_request && bookingItem.modification_request.status === "pending";
// //                   const isModificationRejected = bookingItem.modification_request && bookingItem.modification_request.status === "rejected";
// //                   const isModificationApproved = bookingItem.modification_request && bookingItem.modification_request.status === "approved";
// //                   const riderPickupLocation = getRiderPickupLocation(bookingItem);
// //                   const riderDropoffLocation = getRiderDropoffLocation(bookingItem);
                  
// //                   const bookingStatus = isModificationRejected ? "cancelled" : bookingItem.status;
// //                   const bookingStatusText = isModificationRejected ? "Booking Cancelled" : getStatusText(bookingItem.status, bookingItem.cancellation_reason, false, ride);
// //                   const bookingStatusColor = isModificationRejected ? "#DC2626" : getStatusColor(bookingItem.status, bookingItem.cancellation_reason, false, ride);
                  
// //                   // Calculate actual seat count for this booking (considering approved modifications)
// //                   const actualSeats = isModificationApproved 
// //                     ? bookingItem.modification_request.requested_seats 
// //                     : bookingItem.seats_requested;
                  
// //                   return (
// //                     <View key={bookingItem.id} style={[styles.bookingCard, targetBookingId === bookingItem.id && styles.highlightBookingCard, isModificationRejected && { opacity: 0.7, backgroundColor: '#FEF2F2' }]}>
// //                       <View style={styles.bookingHeader}>
// //                         <View style={styles.bookingInfo}>
// //                           <TouchableOpacity onPress={() => handleViewProfile(null, bookingItem.passenger_phone, bookingItem.passenger_name || "Rider", bookingItem.passenger_photo)} activeOpacity={0.8}>
// //                             {renderProfileImage(bookingItem.passenger_photo, bookingItem.passenger_name || "Rider", 40)}
// //                           </TouchableOpacity>
// //                           <View style={styles.bookingInfoText}>
// //                             <TouchableOpacity onPress={() => handleViewProfile(null, bookingItem.passenger_phone, bookingItem.passenger_name || "Rider", bookingItem.passenger_photo)}>
// //                               <Text style={styles.bookingPhone}>{bookingItem.passenger_name || bookingItem.passenger_phone || "Rider"}</Text>
// //                             </TouchableOpacity>
// //                             <Text style={[styles.bookingSeats, (isModificationRejected || isModificationApproved) && { fontWeight: '500' }, isModificationRejected && { textDecorationLine: 'line-through', color: '#DC2626' }]}>
// //                               {actualSeats} seat{actualSeats > 1 ? "s" : ""}
// //                               {isModificationApproved && " (Updated)"}
// //                               {isModificationRejected && " (Cancelled)"}
// //                             </Text>
                            
// //                             <View style={styles.riderMiniLocation}>
// //                               <Ionicons name="location" size={12} color={isModificationRejected ? "#DC2626" : "#10B981"} />
// //                               <Text style={[styles.riderMiniLocationText, isModificationRejected && { color: '#DC2626' }]} numberOfLines={2}>
// //                                 Pickup: {riderPickupLocation}
// //                               </Text>
// //                             </View>

// //                             <View style={styles.riderMiniLocation}>
// //                               <Ionicons name="flag" size={12} color={isModificationRejected ? "#DC2626" : "#DC2626"} />
// //                               <Text style={[styles.riderMiniLocationText, isModificationRejected && { color: '#DC2626' }]} numberOfLines={2}>
// //                                 Dropoff: {riderDropoffLocation}
// //                               </Text>
// //                             </View>
                            
// //                             {(bookingItem.pickup_walk_distance_m > 0 || bookingItem.drop_walk_distance_m > 0) && !isModificationRejected && (
// //                               <View style={styles.riderWalkInfo}>
// //                                 <Ionicons name="walk" size={10} color="#6B7280" />
// //                                 <Text style={styles.riderWalkInfoText}>
// //                                   {bookingItem.pickup_walk_distance_m > 0 && `${bookingItem.pickup_walk_distance_m}m walk to pickup`}
// //                                   {bookingItem.pickup_walk_distance_m > 0 && bookingItem.drop_walk_distance_m > 0 && ' • '}
// //                                   {bookingItem.drop_walk_distance_m > 0 && `${bookingItem.drop_walk_distance_m}m walk from dropoff`}
// //                                 </Text>
// //                               </View>
// //                             )}
                            
// //                             {hasModificationRequest && (
// //                               <View style={styles.modificationBadge}>
// //                                 <Ionicons name="swap" size={10} color="#F59E0B" />
// //                                 <Text style={styles.modificationBadgeText}>
// //                                   Modification: {bookingItem.modification_request.current_seats} → {bookingItem.modification_request.requested_seats} seats
// //                                 </Text>
// //                               </View>
// //                             )}
                            
// //                             {isModificationApproved && (
// //                               <View style={[styles.modificationBadge, { backgroundColor: '#E8F5E9' }]}>
// //                                 <Ionicons name="checkmark-circle" size={10} color="#10B981" />
// //                                 <Text style={[styles.modificationBadgeText, { color: '#2E7D32' }]}>
// //                                   Modification Approved: {bookingItem.modification_request.current_seats} → {bookingItem.modification_request.requested_seats} seats
// //                                 </Text>
// //                               </View>
// //                             )}
                            
// //                             {isModificationRejected && (
// //                               <View style={[styles.modificationBadge, { backgroundColor: '#FEE2E2' }]}>
// //                                 <Ionicons name="close-circle" size={10} color="#DC2626" />
// //                                 <Text style={[styles.modificationBadgeText, { color: '#DC2626' }]}>
// //                                   Modification Rejected - Booking Cancelled
// //                                 </Text>
// //                               </View>
// //                             )}
// //                           </View>
// //                           {!isModificationRejected && (
// //                             <TouchableOpacity style={styles.chatButton} onPress={() => navigation.navigate('ChatScreen', {
// //                               receiverPhone: bookingItem.passenger_phone,
// //                               conversationId: `chat-${ride.id}-${bookingItem.id}`,
// //                               rideId: ride.id,
// //                               user: { 
// //                                 name: bookingItem.passenger_name || `Rider ${bookingItem.passenger_phone?.slice(-4) || ''}`, 
// //                                 tripInfo: `${ride.origin || 'Origin'} → ${ride.destination || 'Destination'}`, 
// //                                 phone: bookingItem.passenger_phone,
// //                                 profile_picture: bookingItem.passenger_photo
// //                               }
// //                             })}>
// //                               <Ionicons name="chatbubbles" size={24} color={Colors.primary} />
// //                             </TouchableOpacity>
// //                           )}
// //                         </View>
// //                         <View style={[styles.bookingStatusBadge, { 
// //                           backgroundColor: bookingStatus === "cancelled" ? "#FEE2E2" : bookingStatusColor + "20" 
// //                         }]}>
// //                           <Text style={[styles.bookingStatusText, { 
// //                             color: bookingStatus === "cancelled" ? "#DC2626" : bookingStatusColor 
// //                           }]}>
// //                             {bookingStatusText}
// //                           </Text>
// //                         </View>
// //                       </View>
                      
// //                       {bookingCancellationInfo && (
// //                         <View style={styles.bookingCancellationReason}>
// //                           <Ionicons name="information-circle" size={12} color="#DC2626" />
// //                           <Text style={styles.bookingCancellationReasonText}>{bookingCancellationInfo.message}</Text>
// //                         </View>
// //                       )}
                      
// //                       {bookingItem.modification_request && bookingItem.modification_request.status === "pending" && !isDisabled && !ride.started_at && hoursSinceDeparture <= 2 && (
// //                         <View style={styles.modificationActions}>
// //                           <TouchableOpacity 
// //                             style={[styles.modActionBtn, styles.approveModBtn]} 
// //                             onPress={() => handleModificationAction(bookingItem.modification_request.id, 'approve', bookingItem.id)}>
// //                             <Ionicons name="checkmark" size={16} color="#fff" />
// //                             <Text style={styles.modActionBtnText}>Approve</Text>
// //                           </TouchableOpacity>
// //                           <TouchableOpacity 
// //                             style={[styles.modActionBtn, styles.rejectModBtn]} 
// //                             onPress={() => handleModificationAction(bookingItem.modification_request.id, 'reject', bookingItem.id)}>
// //                             <Ionicons name="close" size={16} color="#fff" />
// //                             <Text style={styles.modActionBtnText}>Reject</Text>
// //                           </TouchableOpacity>
// //                         </View>
// //                       )}
                      
// //                       {bookingItem.status === "pending" && !isDisabled && !ride.started_at && hoursSinceDeparture <= 2 && !isModificationRejected && (
// //                         <View style={styles.actionRow}>
// //                           <TouchableOpacity style={[styles.actionBtn, styles.acceptBtn]} onPress={() => handleBookingAction(bookingItem.id, "accept")} activeOpacity={0.8}>
// //                             <Ionicons name="checkmark" size={16} color={Colors.white} /><Text style={styles.btnText}>Approve</Text>
// //                           </TouchableOpacity>
// //                           <TouchableOpacity style={[styles.actionBtn, styles.rejectBtn]} onPress={() => handleBookingAction(bookingItem.id, "reject")} activeOpacity={0.8}>
// //                             <Ionicons name="close" size={16} color={Colors.white} /><Text style={styles.btnText}>Reject</Text>
// //                           </TouchableOpacity>
// //                         </View>
// //                       )}
// //                     </View>
// //                   );
// //                 })}
// //               </View>
// //             )}
// //           </View>
// //         )}

// //         {cancellationInfo && isExpanded && (
// //           <View style={styles.cancelledRideInfo}>
// //             <Text style={styles.cancelledRideInfoTitle}>Ride Cancelled</Text>
// //             <Text style={styles.cancelledRideInfoText}>
// //               This ride has been cancelled. All associated bookings and modification requests have been cancelled.
// //             </Text>
// //           </View>
// //         )}
// //       </View>
// //     );
// //   };
// // const checkModificationAvailability = async (bookingId) => {
// //   try {
// //     const response = await axios.get(`${API_BASE_URL}/booking/${bookingId}/modification-available`);
// //     return response.data;
// //   } catch (error) {
// //     console.log('Error checking modification availability:', error);
// //     return { available: false, reason: 'Could not check availability' };
// //   }
// // };
// // const renderRequestedRideCard = (booking) => {
// //     const isExpanded = expandedRequestedRides[booking.id];
// //     const isAccepted = booking.status === "accepted";
// //     const isPending = booking.status === "pending";
// //     const isClosed = booking.status === "cancelled" || booking.status === "rejected";
// //     const isAutoCancelled = booking.cancellation_reason && booking.cancellation_reason.includes("Auto-cancelled") || booking.auto_cancelled;
// //     const isPast = isRidePast(booking.departure_time);
// //     const rideHasStarted = booking.ride_started_at || booking.started_at;
// //     const rideCancelled = booking.ride_status === "cancelled" || booking.cancellation_reason;
// //     const cancellationInfo = getCancellationStatusDisplay(booking);
// //     const isRideCompleted = booking.ride_status === "completed";
// //     const isRideOngoing = booking.ride_started_at && !isRideCompleted;
    
// //     const modificationRequest = booking.modification_request;
    
// //     // CRITICAL: Determine the current active seat count
// //     let effectiveCurrentSeats = booking.seats_requested;
// //     let hasAppliedModification = false;
    
// //     // Check if there's an approved modification that has been applied
// //     if (modificationRequest && modificationRequest.status === "approved") {
// //         effectiveCurrentSeats = modificationRequest.requested_seats;
// //         hasAppliedModification = true;
// //     }
    
// //     // Check for pending modification
// //     const hasModificationPending = modificationRequest && modificationRequest.status === "pending";
// //     const hasModificationApproved = modificationRequest && modificationRequest.status === "approved" && !hasModificationPending;
// //     const hasModificationRejected = modificationRequest && modificationRequest.status === "rejected" && !hasModificationPending;
    
// //     // For display
// //     const displayHasModificationPending = hasModificationPending;
// //     const displayHasModificationApproved = hasModificationApproved && !hasModificationPending;
// //     const displayHasModificationRejected = hasModificationRejected && !hasModificationPending;
    
// //     // Check if user can request modification (ONE TIME ONLY)
// //     const hasUsedModification = modificationRequest && modificationRequest.id !== null;
// //     const canRequestModification = !hasUsedModification && 
// //                                    !rideCancelled && 
// //                                    !isRideCompleted && 
// //                                    !rideHasStarted && 
// //                                    booking.status === "accepted";
    
// //     const passengerStatusInfo = getPassengerRideStatusInfo(booking);
    
// //     let displayStatus = { ...passengerStatusInfo };
    
// //     // Show modification status (priority: Pending > Rejected > Approved)
// //     if (displayHasModificationPending && !rideCancelled && !isRideCompleted) {
// //       displayStatus = {
// //         text: "Modification Pending",
// //         color: "#F59E0B",
// //         icon: "swap",
// //         type: "modification-pending",
// //         showTrackButton: false
// //       };
// //     } else if (displayHasModificationApproved && !rideCancelled && !isRideCompleted) {
// //       displayStatus = {
// //         text: "Modification Approved",
// //         color: "#10B981",
// //         icon: "checkmark-circle",
// //         type: "modification-approved",
// //         showTrackButton: false
// //       };
// //     } else if (displayHasModificationRejected && !rideCancelled && !isRideCompleted) {
// //       displayStatus = {
// //         text: "Booking Cancelled",
// //         color: "#DC2626",
// //         icon: "close-circle",
// //         type: "modification-rejected",
// //         showTrackButton: false
// //       };
// //     }
    
// //     const riderPickupLocation = getRiderPickupLocation(booking);
// //     const riderDropoffLocation = getRiderDropoffLocation(booking);
    
// //     // Calculate effective seats for display
// //     let effectiveDisplaySeats;
// //     let seatDisplayText = "";
    
// //     if (displayHasModificationPending) {
// //       effectiveDisplaySeats = modificationRequest.requested_seats;
// //       seatDisplayText = ` (Pending: ${effectiveCurrentSeats} → ${modificationRequest.requested_seats})`;
// //     } else if (displayHasModificationApproved) {
// //       effectiveDisplaySeats = effectiveCurrentSeats;
// //       seatDisplayText = " (Updated)";
// //     } else if (displayHasModificationRejected) {
// //       effectiveDisplaySeats = booking.seats_requested;
// //       seatDisplayText = " (Booking Cancelled)";
// //     } else {
// //       effectiveDisplaySeats = effectiveCurrentSeats;
// //       seatDisplayText = "";
// //     }
    
// //     return (
// //       <View key={booking.id} style={[styles.card, targetBookingId === booking.id && styles.highlightBookingCard, displayHasModificationRejected && { opacity: 0.7, backgroundColor: '#FEF2F2' }]}>
// //         <TouchableOpacity style={styles.cardHeader} onPress={() => toggleRequestedRideExpand(booking.id)} activeOpacity={0.7}>
// //           <View style={styles.routeContainer}>
// //             <View style={styles.locationDot}>
// //               <View style={[styles.dot, { backgroundColor: Colors.success }]} />
// //               <View style={styles.line} />
// //               <View style={[styles.dot, { backgroundColor: Colors.secondary }]} />
// //             </View>
// //             <View style={styles.routeTextContainer}>
// //               <Text style={styles.routeOrigin} numberOfLines={1}>
// //                 {booking.origin?.split(",")[0] || "Pickup point"}
// //               </Text>
// //               <Text style={styles.routeDestination} numberOfLines={1}>
// //                 {booking.destination?.split(",")[0] || "Drop point"}
// //               </Text>
// //             </View>
// //           </View>
// //           <View style={styles.cardHeaderRight}>
// //             <View style={[styles.statusBadge, { backgroundColor: displayStatus.color }]}>
// //               <Ionicons name={displayStatus.icon} size={12} color={Colors.white} style={styles.statusIcon} />
// //               <Text style={styles.statusText}>{displayStatus.text}</Text>
// //             </View>
// //             <Ionicons name={isExpanded ? "chevron-up" : "chevron-down"} size={20} color={Colors.gray} style={styles.expandIcon} />
// //           </View>
// //         </TouchableOpacity>

// //         {/* MODIFICATION STATUS CARDS */}
// //         {displayHasModificationPending && !rideCancelled && !isRideCompleted && (
// //           <View style={styles.modificationPendingCard}>
// //             <View style={styles.modificationPendingHeader}>
// //               <Ionicons name="swap" size={24} color="#F59E0B" />
// //               <Text style={styles.modificationPendingTitle}>Modification Request Pending</Text>
// //             </View>
// //             <View style={styles.modificationPendingDetails}>
// //               <Text style={styles.modificationPendingText}>
// //                 You requested to change from <Text style={{ fontWeight: 'bold' }}>{effectiveCurrentSeats}</Text> to <Text style={{ fontWeight: 'bold' }}>{modificationRequest.requested_seats}</Text> seats
// //               </Text>
// //               <Text style={styles.modificationPendingSubtext}>
// //                 Waiting for driver's approval
// //               </Text>
// //             </View>
// //           </View>
// //         )}

// //         {displayHasModificationApproved && !hasModificationPending && !rideCancelled && !isRideCompleted && (
// //           <View style={styles.modificationApprovedCard}>
// //             <View style={styles.modificationPendingHeader}>
// //               <Ionicons name="checkmark-circle" size={24} color="#10B981" />
// //               <Text style={[styles.modificationPendingTitle, { color: "#10B981" }]}>Modification Approved!</Text>
// //             </View>
// //             <View style={styles.modificationPendingDetails}>
// //               <Text style={styles.modificationPendingText}>
// //                 Your seats have been changed to {effectiveCurrentSeats} seats
// //               </Text>
// //               <Text style={styles.modificationPendingSubtext}>
// //                 ✓ You have used your one-time modification
// //               </Text>
// //             </View>
// //           </View>
// //         )}

// //         {displayHasModificationRejected && !hasModificationPending && !rideCancelled && !isRideCompleted && (
// //           <View style={styles.modificationRejectedCard}>
// //             <View style={styles.modificationPendingHeader}>
// //               <Ionicons name="close-circle" size={24} color="#DC2626" />
// //               <Text style={[styles.modificationPendingTitle, { color: "#DC2626" }]}>Modification Rejected - Booking Cancelled</Text>
// //             </View>
// //             <View style={styles.modificationPendingDetails}>
// //               <Text style={styles.modificationRejectedText}>
// //                 Your request to change from {modificationRequest.current_seats} to {modificationRequest.requested_seats} seats was rejected.
// //               </Text>
// //               <Text style={styles.modificationRejectedSubtext}>
// //                 ❌ Your original booking for {modificationRequest.current_seats} seat(s) has been CANCELLED.
// //               </Text>
// //               <Text style={styles.modificationRejectedSubtext}>
// //                 ⚠️ You cannot request another modification as one-time limit is reached.
// //               </Text>
// //               {modificationRequest.rejection_reason && (
// //                 <Text style={styles.modificationRejectionReason}>
// //                   Reason: {modificationRequest.rejection_reason}
// //                 </Text>
// //               )}
// //             </View>
// //           </View>
// //         )}

// //         {/* ONE-TIME MODIFICATION USED MESSAGE - For completed modifications without pending/approved/rejected status */}
// //         {hasUsedModification && !hasModificationPending && !hasModificationApproved && !hasModificationRejected && !rideCancelled && !isRideCompleted && (
// //           <View style={styles.modificationUsedCard}>
// //             <View style={styles.modificationPendingHeader}>
// //               <Ionicons name="information-circle" size={24} color="#9CA3AF" />
// //               <Text style={[styles.modificationPendingTitle, { color: "#6B7280" }]}>Modification Already Used</Text>
// //             </View>
// //             <View style={styles.modificationPendingDetails}>
// //               <Text style={styles.modificationUsedText}>
// //                 You have already used your one-time modification for this booking.
// //               </Text>
// //               <Text style={styles.modificationUsedSubtext}>
// //                 Further modifications are not allowed.
// //               </Text>
// //             </View>
// //           </View>
// //         )}

// //         {/* OTHER STATUS BANNERS */}
// //         {(passengerStatusInfo.type === 'auto-cancelled' || isAutoCancelled) && !hasModificationPending && (
// //           <View style={styles.autoCancelledBanner}>
// //             <Ionicons name="timer-off" size={20} color="#9CA3AF" />
// //             <Text style={styles.autoCancelledText}>This request has been auto-cancelled</Text>
// //           </View>
// //         )}

// //         {passengerStatusInfo.type === 'pending' && !isAutoCancelled && !rideCancelled && !hasModificationPending && (
// //           <View style={styles.pendingRequestBanner}>
// //             <Ionicons name="time-outline" size={20} color="#F59E0B" />
// //             <View>
// //               <Text style={styles.pendingRequestTitle}>Waiting for driver response</Text>
// //               <Text style={styles.pendingRequestSubtext}>Driver has been notified of your request</Text>
// //             </View>
// //           </View>
// //         )}

// //         {passengerStatusInfo.type === 'rejected' && !hasModificationRejected && (
// //           <View style={styles.rejectedRequestBanner}>
// //             <Ionicons name="close-circle" size={20} color="#DC2626" />
// //             <Text style={styles.rejectedRequestText}>Your request was declined by the driver</Text>
// //           </View>
// //         )}

// //         {passengerStatusInfo.type === 'driver-late' && !rideHasStarted && !isRideCompleted && !hasModificationPending && (
// //           <View style={styles.lateDriverWarning}>
// //             <Ionicons name="alert-circle" size={20} color="#EF4444" />
// //             <Text style={styles.lateDriverWarningText}>Driver is running late. The ride should start soon.</Text>
// //           </View>
// //         )}

// //         {passengerStatusInfo.type === 'start-soon' && !rideHasStarted && !isRideCompleted && !hasModificationPending && (
// //           <View style={styles.startSoonWarning}>
// //             <Ionicons name="time-outline" size={20} color="#F59E0B" />
// //             <Text style={styles.startSoonWarningText}>Ride starting soon! Be ready at your pickup location.</Text>
// //           </View>
// //         )}

// //         {passengerStatusInfo.type === 'ride-cancelled' && (
// //           <View style={styles.cancelledRideBanner}>
// //             <Ionicons name="alert-circle" size={16} color="#DC2626" />
// //             <Text style={styles.cancelledRideText}>
// //               This ride has been cancelled by the driver. Your booking has been cancelled.
// //             </Text>
// //           </View>
// //         )}

// //         {passengerStatusInfo.type === 'completed' && (
// //           <View style={styles.completedRideBanner}>
// //             <Ionicons name="checkmark-circle" size={16} color="#10B981" />
// //             <Text style={styles.completedRideBannerText}>
// //               This ride has been completed successfully.
// //             </Text>
// //           </View>
// //         )}

// //         {isExpanded && (
// //           <View>
// //             <TouchableOpacity style={styles.driverProfileRow} onPress={() => handleViewProfile(booking.driver_user_id, booking.driver_phone, booking.driver_name || "Driver", booking.driver_photo)} activeOpacity={0.8}>
// //               {renderProfileImage(booking.driver_photo, booking.driver_name || "Driver", 50)}
// //               <View style={styles.driverInfo}>
// //                 <Text style={styles.driverName}>{booking.driver_name || "Driver"}</Text>
// //                 <View style={styles.driverRatingContainer}>
// //                   <Ionicons name="star" size={12} color="#F59E0B" />
// //                   <Text style={styles.driverRating}>{booking.driver_rating || 4.5}</Text>
// //                 </View>
// //               </View>
// //               <Ionicons name="chevron-forward" size={20} color={Colors.gray} />
// //             </TouchableOpacity>

// //             <View style={styles.requestDetails}>
// //               <View style={styles.detailItem}>
// //                 <Ionicons name="time-outline" size={16} color={Colors.gray} />
// //                 <Text style={styles.detailText}>Travel Date</Text>
// //                 <Text style={styles.detailTextSecondary}>
// //                   {booking.departure_time ? `${formatDate(booking.departure_time).dayText}, ${formatDate(booking.departure_time).timeText}` : "-"}
// //                 </Text>
// //               </View>
// //               <View style={styles.detailDivider} />
// //               <View style={styles.detailItem}>
// //                 <Ionicons name="people-outline" size={16} color={displayHasModificationRejected ? "#DC2626" : Colors.gray} />
// //                 <Text style={[styles.detailText, displayHasModificationRejected && { color: '#DC2626', textDecorationLine: 'line-through' }]}>
// //                   {effectiveDisplaySeats} seat{effectiveDisplaySeats > 1 ? "s" : ""}
// //                   {seatDisplayText}
// //                 </Text>
// //               </View>
// //             </View>

// //             <View style={[styles.riderLocationsCard, displayHasModificationRejected && { opacity: 0.6, backgroundColor: '#FEF2F2' }]}>
// //               <Text style={styles.riderLocationsTitle}>📍 Your Trip Details</Text>
              
// //               <View style={styles.riderLocationItem}>
// //                 <View style={[styles.riderLocationIcon, { backgroundColor: displayHasModificationRejected ? '#FEE2E2' : '#E8F5E9' }]}>
// //                   <Ionicons name="location" size={18} color={displayHasModificationRejected ? "#DC2626" : "#10B981"} />
// //                 </View>
// //                 <View style={styles.riderLocationContent}>
// //                   <Text style={styles.riderLocationLabel}>Pickup Point</Text>
// //                   <Text style={[styles.riderLocationValue, displayHasModificationRejected && { color: '#DC2626', textDecorationLine: 'line-through' }]} numberOfLines={2}>
// //                     {riderPickupLocation}
// //                   </Text>
// //                 </View>
// //               </View>
              
// //               <View style={styles.riderLocationDivider} />
              
// //               <View style={styles.riderLocationItem}>
// //                 <View style={[styles.riderLocationIcon, { backgroundColor: displayHasModificationRejected ? '#FEE2E2' : '#FEF2F2' }]}>
// //                   <Ionicons name="flag" size={18} color={displayHasModificationRejected ? "#DC2626" : "#DC2626"} />
// //                 </View>
// //                 <View style={styles.riderLocationContent}>
// //                   <Text style={styles.riderLocationLabel}>Dropoff Point</Text>
// //                   <Text style={[styles.riderLocationValue, displayHasModificationRejected && { color: '#DC2626', textDecorationLine: 'line-through' }]} numberOfLines={2}>
// //                     {riderDropoffLocation}
// //                   </Text>
// //                 </View>
// //               </View>
// //             </View>

// //             {/* Modification Detail Card - Show only if modification request exists */}
// //             {modificationRequest && !displayHasModificationPending && !rideCancelled && !isRideCompleted && (
// //               <View style={styles.modificationDetailCard}>
// //                 <Text style={styles.modificationDetailTitle}>Modification Request Details</Text>
// //                 <View style={styles.modificationDetailRow}>
// //                   <Text style={styles.modificationDetailLabel}>Status:</Text>
// //                   <Text style={[styles.modificationDetailValue, { 
// //                     color: displayHasModificationApproved ? "#10B981" : (displayHasModificationRejected ? "#DC2626" : "#F59E0B"),
// //                     fontWeight: 'bold' 
// //                   }]}>
// //                     {modificationRequest.status.toUpperCase()}
// //                   </Text>
// //                 </View>
// //                 <View style={styles.modificationDetailRow}>
// //                   <Text style={styles.modificationDetailLabel}>Current Seats:</Text>
// //                   <Text style={styles.modificationDetailValue}>
// //                     {displayHasModificationApproved ? effectiveCurrentSeats : modificationRequest.current_seats} seats
// //                   </Text>
// //                 </View>
// //                 <View style={styles.modificationDetailRow}>
// //                   <Text style={styles.modificationDetailLabel}>Requested Seats:</Text>
// //                   <Text style={[styles.modificationDetailValue, displayHasModificationRejected && { textDecorationLine: 'line-through', color: '#DC2626' }]}>
// //                     {modificationRequest.requested_seats} seats
// //                   </Text>
// //                 </View>
// //                 {modificationRequest.approved_at && displayHasModificationApproved && (
// //                   <Text style={styles.modificationDetailDate}>
// //                     Approved: {new Date(modificationRequest.approved_at).toLocaleString()}
// //                   </Text>
// //                 )}
// //                 {modificationRequest.created_at && (
// //                   <Text style={styles.modificationDetailDate}>
// //                     Requested: {new Date(modificationRequest.created_at).toLocaleString()}
// //                   </Text>
// //                 )}
// //                 {modificationRequest.rejection_reason && (
// //                   <Text style={styles.modificationDetailReason}>
// //                     Rejection Reason: {modificationRequest.rejection_reason}
// //                   </Text>
// //                 )}
// //                 {displayHasModificationApproved && (
// //                   <Text style={[styles.modificationDetailDate, { color: '#10B981', marginTop: 6 }]}>
// //                     ✓ One-time modification used
// //                   </Text>
// //                 )}
// //               </View>
// //             )}

// //             <TouchableOpacity style={[styles.viewRouteBtn, displayHasModificationRejected && { opacity: 0.5 }]} onPress={() => handleViewRideDetails(booking, booking)} disabled={displayHasModificationRejected}>
// //               <Ionicons name="map-outline" size={16} color={displayHasModificationRejected ? Colors.gray : Colors.primary} />
// //               <Text style={[styles.viewRouteBtnText, displayHasModificationRejected && { color: Colors.gray }]}>
// //                 View Route Details
// //               </Text>
// //             </TouchableOpacity>

// //             {/* MODIFY SEATS BUTTON - ONE TIME ONLY */}
// //             {canRequestModification && !hasModificationPending && !hasModificationApproved && !hasModificationRejected && !displayHasModificationRejected && (
// //               <TouchableOpacity 
// //                 style={styles.modifySeatsBtn}
// //                 onPress={() => {
// //                   setSelectedBookingForModification(booking);
// //                   setModifySeatsModalVisible(true);
// //                 }}>
// //                 <Ionicons name="swap" size={16} color={Colors.primary} />
// //                 <Text style={styles.modifySeatsBtnText}>Modify Seats (One-time)</Text>
// //               </TouchableOpacity>
// //             )}

// //             {/* SHOW DISABLED MESSAGE IF MODIFICATION WAS ALREADY USED */}
// //             {hasUsedModification && !hasModificationPending && !hasModificationRejected && !hasModificationApproved && canRequestModification === false && booking.status === "accepted" && !rideCancelled && !isRideCompleted && (
// //               <View style={styles.modificationDisabledContainer}>
// //                 <Ionicons name="lock-closed" size={16} color="#9CA3AF" />
// //                 <Text style={styles.modificationDisabledText}>
// //                   Modification not available - You have already used your one-time modification
// //                 </Text>
// //               </View>
// //             )}

// //             {passengerStatusInfo.type === 'ongoing' && booking?.live_session?.session_id && !displayHasModificationRejected && (
// //               <TouchableOpacity 
// //                 style={styles.trackRideBtn}
// //                 onPress={() => handleTrackRide(booking)}>
// //                 <Ionicons name="navigate-circle" size={20} color="#fff" />
// //                 <Text style={styles.trackRideBtnText}>Track Live Ride</Text>
// //               </TouchableOpacity>
// //             )}

// //             {isRideCompleted && !booking.driver_rating_given && booking.live_session?.session_id && !displayHasModificationRejected && (
// //               <TouchableOpacity 
// //                 style={styles.rateDriverBtn}
// //                 onPress={() => openRateDriverModal(booking, booking.live_session.session_id)}>
// //                 <Ionicons name="star-outline" size={18} color="#fff" />
// //                 <Text style={styles.rateDriverBtnText}>Rate Driver</Text>
// //               </TouchableOpacity>
// //             )}

// //             {isRideCompleted && booking.driver_rating_given && !displayHasModificationRejected && (
// //               <View style={styles.alreadyRatedContainer}>
// //                 <Ionicons name="star" size={16} color="#F59E0B" />
// //                 <Text style={styles.alreadyRatedText}>You rated this driver {booking.driver_rating}/5</Text>
// //               </View>
// //             )}

// //             {hasModificationPending && !rideCancelled && !isRideCompleted && (
// //               <TouchableOpacity 
// //                 style={styles.cancelModificationBtn}
// //                 onPress={() => handleCancelModificationRequest(modificationRequest.id, booking.id)}>
// //                 <Ionicons name="close-circle-outline" size={18} color="#DC2626" />
// //                 <Text style={styles.cancelModificationBtnText}>Cancel Modification Request</Text>
// //               </TouchableOpacity>
// //             )}
            
// //             {!displayHasModificationRejected && !isRideCompleted && !rideCancelled && booking.status !== "rejected" && booking.status !== "cancelled" && !isAutoCancelled && !hasModificationPending && (
// //               <TouchableOpacity 
// //                 style={styles.cancelBookingBtn}
// //                 onPress={() => cancelBooking(booking.id)}>
// //                 <Text style={styles.cancelBookingBtnText}>
// //                   {booking.status === "pending" ? "Cancel Request" : "Cancel Booking"}
// //                 </Text>
// //               </TouchableOpacity>
// //             )}
// //           </View>
// //         )}
// //       </View>
// //     );
// //   };

// //   if (loading && !refreshing) {
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

// //   const sortedPostedRides = getSortedPostedRides();
// //   const sortedRequestedRides = getSortedRequestedRides();

// //   return (
// //     <SafeAreaView style={styles.container}>
// //       <StatusBar backgroundColor={Colors.white} barStyle="dark-content" />
// //       <View style={styles.header}>
// //         <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
// //           <MaterialIcons name="arrow-back-ios" size={26} color={Colors.orange1} />
// //         </TouchableOpacity>
// //         <Text style={styles.headerTitle}>My Rides</Text>
// //         <TouchableOpacity onPress={handleFilterPress} style={styles.filterIconBtn}>
// //           <Ionicons name="filter" size={22} color={Colors.orange1} />
// //         </TouchableOpacity>
// //       </View>

// //       <View style={styles.tabContainer}>
// //         <TouchableOpacity style={[styles.tabButton, activeTab === "posted" && styles.activeTab]} onPress={() => handleTabPress("posted")} activeOpacity={0.8}>
// //           <Ionicons name="car-sport-outline" size={18} color={activeTab === "posted" ? Colors.white : Colors.gray} style={styles.tabIcon} />
// //           <Text style={[styles.tabText, activeTab === "posted" && styles.activeTabText]}>Posted</Text>
// //           <View style={[styles.tabBadge, activeTab === "posted" && styles.activeTabBadge]}>
// //             <Text style={[styles.tabBadgeText, activeTab === "posted" && styles.activeTabBadgeText]}>{postedRides.length}</Text>
// //           </View>
// //         </TouchableOpacity>
// //         <TouchableOpacity style={[styles.tabButton, activeTab === "requested" && styles.activeTab]} onPress={() => handleTabPress("requested")} activeOpacity={0.8}>
// //           <Ionicons name="person-outline" size={18} color={activeTab === "requested" ? Colors.white : Colors.gray} style={styles.tabIcon} />
// //           <Text style={[styles.tabText, activeTab === "requested" && styles.activeTabText]}>Requested</Text>
// //           <View style={[styles.tabBadge, activeTab === "requested" && styles.activeTabBadge]}>
// //             <Text style={[styles.tabBadgeText, activeTab === "requested" && styles.activeTabBadgeText]}>{requestedRides.length}</Text>
// //           </View>
// //         </TouchableOpacity>
// //       </View>

// //       <ScrollView 
// //         ref={scrollViewRef}
// //         showsVerticalScrollIndicator={false} 
// //         contentContainerStyle={styles.list} 
// //         refreshControl={
// //           <RefreshControl 
// //             refreshing={refreshing} 
// //             onRefresh={onRefresh} 
// //             colors={[Colors.primary]} 
// //             tintColor={Colors.primary} 
// //           />
// //         }
// //         scrollEventThrottle={400}>
        
// //         {activeTab === "posted" && (sortedPostedRides.length === 0 ? (
// //           <View style={styles.emptyState}>
// //             <Ionicons name="car-sport-outline" size={64} color={Colors.gray} />
// //             <Text style={styles.emptyTitle}>No rides found</Text>
// //             <Text style={styles.emptySubtitle}>
// //               {postedFilter === "all" ? "You don't have any active rides" : 
// //                postedFilter === "past" ? "No past rides found" :
// //                `You don't have any ${postedFilter} rides`}
// //             </Text>
// //             {postedFilter === "all" && (
// //               <TouchableOpacity 
// //                 style={styles.viewPastRidesBtn}
// //                 onPress={() => {
// //                   setPostedFilter("past");
// //                   setShowFilterModal(false);
// //                 }}>
// //                 <Text style={styles.viewPastRidesBtnText}>View Past Rides</Text>
// //               </TouchableOpacity>
// //             )}
// //           </View>
// //         ) : (
// //           sortedPostedRides.map((ride, index) => {
// //             const previousRide = index > 0 ? sortedPostedRides[index - 1] : null;
// //             const showDateHeader = renderDateHeader(ride, previousRide);
// //             const dateHeaderTitle = getDateHeaderTitle(ride.departure_time);
            
// //             return (
// //               <View key={ride.id}>
// //                 {showDateHeader && (
// //                   <View style={styles.dateSectionHeader}>
// //                     <Text style={styles.dateSectionHeaderText}>{dateHeaderTitle}</Text>
// //                     <View style={styles.dateSectionHeaderLine} />
// //                   </View>
// //                 )}
// //                 {renderPostedRideCard(ride)}
// //               </View>
// //             );
// //           })
// //         ))}

// //         {activeTab === "requested" && (sortedRequestedRides.length === 0 ? (
// //           <View style={styles.emptyState}>
// //             <Ionicons name="document-text-outline" size={64} color={Colors.gray} />
// //             <Text style={styles.emptyTitle}>No requests yet</Text>
// //             <Text style={styles.emptySubtitle}>{requestedFilter !== "all" ? `You don't have any ${requestedFilter} requests` : "Your booking requests will appear here"}</Text>
// //           </View>
// //         ) : (
// //           sortedRequestedRides.map((booking, index) => {
// //             const previousBooking = index > 0 ? sortedRequestedRides[index - 1] : null;
// //             const showDateHeader = renderDateHeader(booking, previousBooking);
// //             const dateHeaderTitle = getDateHeaderTitle(booking.departure_time);
            
// //             return (
// //               <View key={booking.id}>
// //                 {showDateHeader && (
// //                   <View style={styles.dateSectionHeader}>
// //                     <Text style={styles.dateSectionHeaderText}>{dateHeaderTitle}</Text>
// //                     <View style={styles.dateSectionHeaderLine} />
// //                   </View>
// //                 )}
// //                 {renderRequestedRideCard(booking)}
// //               </View>
// //             );
// //           })
// //         ))}
        
// //         <View style={styles.bottomSpacer} />
// //       </ScrollView>

// //       {/* Filter Modal */}
// //       <Modal visible={showFilterModal} transparent animationType="fade">
// //         <View style={styles.modalBackdrop}>
// //           <View style={styles.filterModalContent}>
// //             <View style={styles.filterModalHeader}>
// //               <Text style={styles.filterModalTitle}>Filter {activeTab === "posted" ? "Posted" : "Requested"} Rides</Text>
// //               <TouchableOpacity onPress={() => setShowFilterModal(false)}>
// //                 <Ionicons name="close" size={24} color={Colors.gray} />
// //               </TouchableOpacity>
// //             </View>
            
// //             <ScrollView style={styles.filterOptionsList} showsVerticalScrollIndicator={false}>
// //               {activeTab === "posted" ? (
// //                 <>
// //                   <TouchableOpacity 
// //                     style={[styles.filterOption, tempFilter === "all" && styles.filterOptionActive]} 
// //                     onPress={() => setTempFilter("all")}>
// //                     <View style={styles.filterOptionLeft}>
// //                       <Ionicons name="apps" size={20} color={tempFilter === "all" ? Colors.primary : Colors.gray} />
// //                       <Text style={[styles.filterOptionText, tempFilter === "all" && styles.filterOptionTextActive]}>All Active Rides</Text>
// //                     </View>
// //                     {tempFilter === "all" && <Ionicons name="checkmark-circle" size={22} color={Colors.primary} />}
// //                   </TouchableOpacity>
                  
// //                   <TouchableOpacity 
// //                     style={[styles.filterOption, tempFilter === "completed" && styles.filterOptionActive]} 
// //                     onPress={() => setTempFilter("completed")}>
// //                     <View style={styles.filterOptionLeft}>
// //                       <Ionicons name="checkmark-done-circle" size={20} color={tempFilter === "completed" ? Colors.primary : Colors.gray} />
// //                       <Text style={[styles.filterOptionText, tempFilter === "completed" && styles.filterOptionTextActive]}>Completed</Text>
// //                     </View>
// //                     {tempFilter === "completed" && <Ionicons name="checkmark-circle" size={22} color={Colors.primary} />}
// //                   </TouchableOpacity>
                  
// //                   <TouchableOpacity 
// //                     style={[styles.filterOption, tempFilter === "cancelled" && styles.filterOptionActive]} 
// //                     onPress={() => setTempFilter("cancelled")}>
// //                     <View style={styles.filterOptionLeft}>
// //                       <Ionicons name="close-circle" size={20} color={tempFilter === "cancelled" ? Colors.primary : Colors.gray} />
// //                       <Text style={[styles.filterOptionText, tempFilter === "cancelled" && styles.filterOptionTextActive]}>Cancelled</Text>
// //                     </View>
// //                     {tempFilter === "cancelled" && <Ionicons name="checkmark-circle" size={22} color={Colors.primary} />}
// //                   </TouchableOpacity>
                  
// //                   <TouchableOpacity 
// //                     style={[styles.filterOption, tempFilter === "autocancelled" && styles.filterOptionActive]} 
// //                     onPress={() => setTempFilter("autocancelled")}>
// //                     <View style={styles.filterOptionLeft}>
// //                       <Ionicons name="timer-off" size={20} color={tempFilter === "autocancelled" ? Colors.primary : Colors.gray} />
// //                       <Text style={[styles.filterOptionText, tempFilter === "autocancelled" && styles.filterOptionTextActive]}>Auto-cancelled</Text>
// //                     </View>
// //                     {tempFilter === "autocancelled" && <Ionicons name="checkmark-circle" size={22} color={Colors.primary} />}
// //                   </TouchableOpacity>
                  
// //                   <TouchableOpacity 
// //                     style={[styles.filterOption, tempFilter === "past" && styles.filterOptionActive]} 
// //                     onPress={() => setTempFilter("past")}>
// //                     <View style={styles.filterOptionLeft}>
// //                       <Ionicons name="calendar" size={20} color={tempFilter === "past" ? Colors.primary : Colors.gray} />
// //                       <Text style={[styles.filterOptionText, tempFilter === "past" && styles.filterOptionTextActive]}>Past Rides</Text>
// //                     </View>
// //                     {tempFilter === "past" && <Ionicons name="checkmark-circle" size={22} color={Colors.primary} />}
// //                   </TouchableOpacity>
// //                 </>
// //               ) : (
// //                 <>
// //                   <TouchableOpacity 
// //                     style={[styles.filterOption, tempFilter === "all" && styles.filterOptionActive]} 
// //                     onPress={() => setTempFilter("all")}>
// //                     <View style={styles.filterOptionLeft}>
// //                       <Ionicons name="apps" size={20} color={tempFilter === "all" ? Colors.primary : Colors.gray} />
// //                       <Text style={[styles.filterOptionText, tempFilter === "all" && styles.filterOptionTextActive]}>All Active Rides</Text>
// //                     </View>
// //                     {tempFilter === "all" && <Ionicons name="checkmark-circle" size={22} color={Colors.primary} />}
// //                   </TouchableOpacity>
                  
// //                   <TouchableOpacity 
// //                     style={[styles.filterOption, tempFilter === "completed" && styles.filterOptionActive]} 
// //                     onPress={() => setTempFilter("completed")}>
// //                     <View style={styles.filterOptionLeft}>
// //                       <Ionicons name="checkmark-done-circle" size={20} color={tempFilter === "completed" ? Colors.primary : Colors.gray} />
// //                       <Text style={[styles.filterOptionText, tempFilter === "completed" && styles.filterOptionTextActive]}>Completed</Text>
// //                     </View>
// //                     {tempFilter === "completed" && <Ionicons name="checkmark-circle" size={22} color={Colors.primary} />}
// //                   </TouchableOpacity>
                  
// //                   <TouchableOpacity 
// //                     style={[styles.filterOption, tempFilter === "cancelled" && styles.filterOptionActive]} 
// //                     onPress={() => setTempFilter("cancelled")}>
// //                     <View style={styles.filterOptionLeft}>
// //                       <Ionicons name="close-circle" size={20} color={tempFilter === "cancelled" ? Colors.primary : Colors.gray} />
// //                       <Text style={[styles.filterOptionText, tempFilter === "cancelled" && styles.filterOptionTextActive]}>Cancelled</Text>
// //                     </View>
// //                     {tempFilter === "cancelled" && <Ionicons name="checkmark-circle" size={22} color={Colors.primary} />}
// //                   </TouchableOpacity>
                  
// //                   <TouchableOpacity 
// //                     style={[styles.filterOption, tempFilter === "autocancelled" && styles.filterOptionActive]} 
// //                     onPress={() => setTempFilter("autocancelled")}>
// //                     <View style={styles.filterOptionLeft}>
// //                       <Ionicons name="timer-off" size={20} color={tempFilter === "autocancelled" ? Colors.primary : Colors.gray} />
// //                       <Text style={[styles.filterOptionText, tempFilter === "autocancelled" && styles.filterOptionTextActive]}>Auto-cancelled</Text>
// //                     </View>
// //                     {tempFilter === "autocancelled" && <Ionicons name="checkmark-circle" size={22} color={Colors.primary} />}
// //                   </TouchableOpacity>
                  
// //                   <TouchableOpacity 
// //                     style={[styles.filterOption, tempFilter === "past" && styles.filterOptionActive]} 
// //                     onPress={() => setTempFilter("past")}>
// //                     <View style={styles.filterOptionLeft}>
// //                       <Ionicons name="calendar" size={20} color={tempFilter === "past" ? Colors.primary : Colors.gray} />
// //                       <Text style={[styles.filterOptionText, tempFilter === "past" && styles.filterOptionTextActive]}>Past Rides</Text>
// //                     </View>
// //                     {tempFilter === "past" && <Ionicons name="checkmark-circle" size={22} color={Colors.primary} />}
// //                   </TouchableOpacity>
                  
// //                   <TouchableOpacity 
// //                     style={[styles.filterOption, tempFilter === "rejected" && styles.filterOptionActive]} 
// //                     onPress={() => setTempFilter("rejected")}>
// //                     <View style={styles.filterOptionLeft}>
// //                       <Ionicons name="ban" size={20} color={tempFilter === "rejected" ? Colors.primary : Colors.gray} />
// //                       <Text style={[styles.filterOptionText, tempFilter === "rejected" && styles.filterOptionTextActive]}>Rejected</Text>
// //                     </View>
// //                     {tempFilter === "rejected" && <Ionicons name="checkmark-circle" size={22} color={Colors.primary} />}
// //                   </TouchableOpacity>
// //                 </>
// //               )}
// //             </ScrollView>
            
// //             <View style={styles.filterModalActions}>
// //               <TouchableOpacity style={styles.filterCancelBtn} onPress={() => setShowFilterModal(false)}>
// //                 <Text style={styles.filterCancelBtnText}>Cancel</Text>
// //               </TouchableOpacity>
// //               <TouchableOpacity style={styles.filterApplyBtn} onPress={applyFilter}>
// //                 <Text style={styles.filterApplyBtnText}>Apply</Text>
// //               </TouchableOpacity>
// //             </View>
// //           </View>
// //         </View>
// //       </Modal>

// //       {/* Conflict Resolution Modal */}
// //       <Modal visible={conflictModalVisible} transparent animationType="fade">
// //         <View style={styles.modalBackdrop}>
// //           <View style={styles.conflictModalContent}>
// //             <View style={styles.conflictModalHeader}>
// //               <Ionicons name="alert-circle" size={48} color="#F59E0B" />
// //               <Text style={styles.conflictModalTitle}>Driver's Choice Required</Text>
// //             </View>
            
// //             <Text style={styles.conflictModalMessage}>
// //               There are two requests for this ride. Please choose which one to accept.
// //             </Text>
            
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
// //                 <Text style={styles.conflictRequestNote}>
// //                   {conflictData.modification_request.requested_seats > conflictData.modification_request.current_seats 
// //                     ? `+${conflictData.modification_request.requested_seats - conflictData.modification_request.current_seats} more seat(s)` 
// //                     : `${conflictData.modification_request.current_seats - conflictData.modification_request.requested_seats} fewer seat(s)`}
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
// //                   disabled={resolvingConflict}>
// //                   <Text style={styles.conflictModalBtnText}>
// //                     {resolvingConflict ? 'Processing...' : 'Accept Modification'}
// //                   </Text>
// //                 </TouchableOpacity>
// //               )}
// //               {conflictData?.booking_request && (
// //                 <TouchableOpacity 
// //                   style={[styles.conflictModalBtn, styles.acceptBtn]} 
// //                   onPress={() => resolveConcurrentRequest('booking', null, conflictData.booking_request.id)}
// //                   disabled={resolvingConflict}>
// //                   <Text style={styles.conflictModalBtnText}>
// //                     {resolvingConflict ? 'Processing...' : 'Accept Booking'}
// //                   </Text>
// //                 </TouchableOpacity>
// //               )}
// //             </View>
            
// //             <TouchableOpacity 
// //               style={styles.conflictModalCloseBtn} 
// //               onPress={() => setConflictModalVisible(false)}>
// //               <Text style={styles.conflictModalCloseBtnText}>Close</Text>
// //             </TouchableOpacity>
// //           </View>
// //         </View>
// //       </Modal>

// //       {/* Rating Modal */}
// //       <Modal visible={ratingModalVisible} transparent animationType="fade">
// //         <View style={styles.modalBackdrop}>
// //           <View style={styles.modalCard}>
// //             <Text style={styles.modalTitle}>
// //               Rate Your {ratingType === 'rider' ? 'Rider' : 'Driver'}
// //             </Text>
// //             <Text style={styles.modalSub}>
// //               How was your experience with {selectedRider?.rider_name || 'this person'}?
// //             </Text>

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
// //                 onPress={submitRating} 
// //                 disabled={rating === 0}
// //               >
// //                 <Text style={styles.submitBtnText}>Submit Rating</Text>
// //               </TouchableOpacity>
// //             </View>
// //           </View>
// //         </View>
// //       </Modal>

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
// //   container: { flex: 1, backgroundColor: Colors.white },
// //   header: { flexDirection: "row", alignItems: "center", paddingHorizontal: 16, paddingVertical: 14, borderBottomWidth: 0.5, borderBottomColor: "#E5E7EB" },
// //   backBtn: { width: 44, height: 44, justifyContent: "center" },
// //   headerTitle: { ...Typography.h2, fontSize: 26, fontWeight: "700", color: Colors.primary, flex: 1, textAlign: "center" },
// //   filterIconBtn: { width: 44, height: 44, justifyContent: "center", alignItems: "center" },
// //   tabContainer: { flexDirection: "row", backgroundColor: Colors.white, paddingHorizontal: 16, paddingVertical: 12, borderBottomWidth: 0.5, borderBottomColor: "#E5E7EB" },
// //   tabButton: { flex: 1, flexDirection: "row", alignItems: "center", justifyContent: "center", paddingVertical: 10, borderRadius: 12, backgroundColor: "#F9FAFB", marginHorizontal: 4 },
// //   activeTab: { backgroundColor: Colors.primary },
// //   tabIcon: { marginRight: 6 },
// //   tabText: { ...Typography.button, color: Colors.gray, fontSize: 14, fontWeight: "600" },
// //   activeTabText: { color: Colors.white },
// //   tabBadge: { backgroundColor: Colors.gray, paddingHorizontal: 8, paddingVertical: 2, borderRadius: 10, marginLeft: 6 },
// //   activeTabBadge: { backgroundColor: "rgba(255,255,255,0.3)" },
// //   tabBadgeText: { fontSize: 12, fontWeight: "700", color: Colors.white },
// //   activeTabBadgeText: { color: Colors.white },
// //   list: { padding: 16, paddingBottom: 40 },
// //   card: { padding: 14, borderRadius: 16, borderWidth: 1, borderColor: "#E5E7EB", backgroundColor: "#F9FAFB", marginBottom: 12 },
// //   highlightRideCard: { borderWidth: 2, borderColor: Colors.primary },
// //   highlightBookingCard: { borderWidth: 2, borderColor: Colors.primary, backgroundColor: "#FFF7ED" },
// //   cardHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 12 },
// //   cardHeaderRight: { flexDirection: "row", alignItems: "center", gap: 8 },
// //   expandIcon: { marginLeft: 8 },
// //   routeContainer: { flex: 1, flexDirection: "row", alignItems: "center" },
// //   locationDot: { width: 20, alignItems: "center", marginRight: 12 },
// //   dot: { width: 10, height: 10, borderRadius: 5 },
// //   line: { width: 2, height: 20, backgroundColor: "#E5E7EB" },
// //   routeTextContainer: { flex: 1 },
// //   routeOrigin: { fontSize: 15, fontWeight: "700", color: Colors.dark, marginBottom: 4, fontFamily: FontFamily.secondary.semiBold },
// //   routeDestination: { fontSize: 14, color: Colors.gray, fontFamily: FontFamily.secondary.regular },
// //   statusBadge: { flexDirection: "row", alignItems: "center", paddingHorizontal: 10, paddingVertical: 5, borderRadius: 20 },
// //   statusIcon: { marginRight: 4 },
// //   statusText: { color: Colors.white, fontSize: 12, fontWeight: "600" },
// //   cardDetails: { flexDirection: "row", alignItems: "center", backgroundColor: Colors.white, borderRadius: 12, padding: 12, marginBottom: 12 },
// //   detailItem: { flex: 1, flexDirection: "row", alignItems: "center", flexWrap: "wrap" },
// //   detailText: { fontSize: 13, fontWeight: "600", color: Colors.dark, marginLeft: 6, fontFamily: FontFamily.secondary.medium },
// //   detailTextSecondary: { fontSize: 12, color: Colors.gray, marginLeft: 4, fontFamily: FontFamily.secondary.regular },
// //   detailTextPrice: { fontSize: 14, fontWeight: "700", color: Colors.primary, marginLeft: 4, fontFamily: FontFamily.secondary.bold },
// //   detailDivider: { width: 1, height: 24, backgroundColor: Colors.gray, opacity: 0.3, marginHorizontal: 8 },
// //   viewRouteBtn: { flexDirection: "row", alignItems: "center", justifyContent: "center", paddingVertical: 10, marginBottom: 12, backgroundColor: "#EEF6FF", borderRadius: 12, gap: 6 },
// //   viewRouteBtnText: { fontSize: 13, fontWeight: "600", color: Colors.primary },
// //   driverActionWrapper: { marginBottom: 8 },
// //   startRideBtn: { backgroundColor: Colors.primary, borderRadius: 14, paddingVertical: 14, alignItems: "center", justifyContent: "center", marginBottom: 10 },
// //   startRideBtnDisabled: { backgroundColor: Colors.gray, opacity: 0.6 },
// //   startRideBtnText: { color: Colors.white, fontSize: 15, fontWeight: "700", fontFamily: FontFamily.secondary.semiBold },
// //   secondaryActionsRow: { flexDirection: "row", gap: 10 },
// //   secondaryBtn: { flex: 1, borderWidth: 1, borderColor: "#D1D5DB", backgroundColor: Colors.white, borderRadius: 14, paddingVertical: 12, alignItems: "center", justifyContent: "center" },
// //   secondaryBtnText: { color: Colors.dark, fontSize: 14, fontWeight: "600", fontFamily: FontFamily.secondary.medium },
// //   bookingsSection: { borderTopWidth: 1, borderTopColor: "#E5E7EB", paddingTop: 12, marginTop: 6 },
// //   bookingSectionHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 10 },
// //   bookingsTitle: { fontSize: 14, fontWeight: "700", color: Colors.dark, fontFamily: FontFamily.secondary.semiBold },
// //   pendingChip: { backgroundColor: "#FEF3C7", paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12 },
// //   pendingChipText: { color: "#92400E", fontSize: 11, fontWeight: "700" },
// //   bookingCard: { backgroundColor: Colors.white, borderRadius: 12, padding: 12, marginBottom: 8 },
// //   bookingHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 8 },
// //   bookingInfo: { flexDirection: "row", alignItems: "center", flex: 1 },
// //   avatarContainer: { overflow: "hidden", backgroundColor: "#F9FAFB", borderWidth: 1, borderColor: "#E5E7EB", alignItems: "center", justifyContent: "center" },
// //   avatarImage: { resizeMode: "cover" },
// //   avatarPlaceholder: { backgroundColor: "#F3F4F6", alignItems: "center", justifyContent: "center" },
// //   avatarPlaceholderText: { fontWeight: "700", color: Colors.primary },
// //   bookingInfoText: { flex: 1, marginLeft: 12 },
// //   bookingPhone: { fontSize: 15, fontWeight: "600", color: Colors.dark, fontFamily: FontFamily.secondary.semiBold },
// //   bookingSeats: { fontSize: 12, color: Colors.gray, fontFamily: FontFamily.secondary.regular, marginTop: 2 },
// //   chatButton: { paddingHorizontal: 8, paddingVertical: 8 },
// //   bookingStatusBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12 },
// //   bookingStatusText: { fontSize: 12, fontWeight: "600" },
// //   actionRow: { flexDirection: "row", marginTop: 12 },
// //   actionBtn: { flex: 1, flexDirection: "row", alignItems: "center", justifyContent: "center", paddingVertical: 10, borderRadius: 10, marginHorizontal: 4 },
// //   acceptBtn: { backgroundColor: Colors.success },
// //   rejectBtn: { backgroundColor: Colors.error },
// //   btnText: { color: Colors.white, fontWeight: "600", marginLeft: 6, fontSize: 14 },
// //   modificationBadge: { flexDirection: "row", alignItems: "center", backgroundColor: "#FEF3C7", paddingHorizontal: 6, paddingVertical: 2, borderRadius: 8, marginTop: 4, gap: 4 },
// //   modificationBadgeText: { fontSize: 10, color: "#92400E", fontWeight: "500" },
// //   modificationActions: { flexDirection: "row", marginTop: 10, gap: 8 },
// //   modActionBtn: { flex: 1, flexDirection: "row", alignItems: "center", justifyContent: "center", paddingVertical: 8, borderRadius: 8, gap: 6 },
// //   approveModBtn: { backgroundColor: "#10B981" },
// //   rejectModBtn: { backgroundColor: "#EF4444" },
// //   modActionBtnText: { color: "#fff", fontSize: 13, fontWeight: "600" },
// //   rateRidersSection: { marginTop: 8, paddingTop: 12, borderTopWidth: 1, borderTopColor: "#E5E7EB" },
// //   rateSectionTitle: { fontSize: 14, fontWeight: "700", color: Colors.dark, marginBottom: 10, fontFamily: FontFamily.secondary.semiBold },
// //   rateRiderItem: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: "#F0F0F0" },
// //   rateRiderInfo: { flexDirection: "row", alignItems: "center", gap: 12 },
// //   rateRiderName: { fontSize: 14, fontWeight: "600", color: Colors.dark },
// //   rateRiderSeats: { fontSize: 11, color: Colors.gray, marginTop: 2 },
// //   rateRiderBtn: { backgroundColor: Colors.primary, paddingHorizontal: 16, paddingVertical: 6, borderRadius: 20 },
// //   rateRiderBtnText: { color: "#fff", fontSize: 12, fontWeight: "600" },
// //   alreadyRatedBadge: { flexDirection: "row", alignItems: "center", gap: 4, backgroundColor: "#F3F4F6", paddingHorizontal: 10, paddingVertical: 6, borderRadius: 20 },
// //   alreadyRatedText: { fontSize: 11, color: Colors.gray, fontWeight: "500" },
// //   rateDriverBtn: { backgroundColor: Colors.primary, borderRadius: 14, paddingVertical: 12, alignItems: "center", justifyContent: "center", marginTop: 8, flexDirection: "row", gap: 8 },
// //   rateDriverBtnText: { color: "#fff", fontSize: 14, fontWeight: "600" },
// //   driverProfileRow: { flexDirection: "row", alignItems: "center", backgroundColor: Colors.white, borderRadius: 12, padding: 12, marginBottom: 12 },
// //   driverInfo: { flex: 1, marginLeft: 12 },
// //   driverName: { fontSize: 16, fontWeight: "700", color: Colors.dark, fontFamily: FontFamily.secondary.semiBold },
// //   driverRatingContainer: { flexDirection: "row", alignItems: "center", marginTop: 4, gap: 4 },
// //   driverRating: { fontSize: 12, color: Colors.gray, fontFamily: FontFamily.secondary.regular },
// //   requestDetails: { flexDirection: "row", alignItems: "center", backgroundColor: Colors.white, borderRadius: 12, padding: 12, marginBottom: 12 },
// //   emptyState: { alignItems: "center", justifyContent: "center", paddingVertical: 60, paddingHorizontal: 20 },
// //   emptyTitle: { fontSize: 20, fontWeight: "700", color: Colors.primary, marginTop: 16, fontFamily: FontFamily.secondary.bold },
// //   emptySubtitle: { fontSize: 14, color: Colors.gray, marginTop: 8, textAlign: "center", fontFamily: FontFamily.secondary.regular },
// //   bottomSpacer: { height: 30 },
// //   loaderContainer: { flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: Colors.white },
// //   cancellationReasonContainer: { flexDirection: "row", alignItems: "center", backgroundColor: "#FEF2F2", padding: 8, borderRadius: 8, marginBottom: 10, gap: 6 },
// //   cancellationReasonText: { fontSize: 11, color: "#DC2626", flex: 1 },
// //   cancelledBadge: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 12, marginLeft: 6, gap: 4 },
// //   cancelledBadgeText: { color: '#fff', fontSize: 10, fontWeight: '700' },
// //   cancellationBanner: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#FEF2F2', padding: 12, borderRadius: 12, marginBottom: 12, gap: 12, borderWidth: 1, borderColor: '#FEE2E2' },
// //   cancellationBannerText: { flex: 1 },
// //   cancellationBannerTitle: { fontSize: 14, fontWeight: '700', marginBottom: 2 },
// //   cancellationBannerMessage: { fontSize: 12, color: '#6B7280' },
// //   cancelledBookingsSummary: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#FEF2F2', padding: 8, borderRadius: 8, marginBottom: 12, gap: 6 },
// //   cancelledBookingsText: { fontSize: 11, color: '#DC2626', flex: 1 },
// //   cancelledRideInfo: { backgroundColor: '#F9FAFB', padding: 16, borderRadius: 12, alignItems: 'center', marginTop: 8 },
// //   cancelledRideInfoTitle: { fontSize: 16, fontWeight: '700', color: '#DC2626', marginBottom: 8 },
// //   cancelledRideInfoText: { fontSize: 13, color: '#6B7280', textAlign: 'center' },
// //   cancelledRideBanner: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#FEF2F2', padding: 10, borderRadius: 8, marginBottom: 12, gap: 8, borderWidth: 1, borderColor: '#FEE2E2' },
// //   cancelledRideText: { fontSize: 12, color: '#DC2626', flex: 1, fontWeight: '500' },
// //   bookingCancellationReason: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#FEF2F2', padding: 6, borderRadius: 6, marginTop: 6, gap: 4 },
// //   bookingCancellationReasonText: { fontSize: 10, color: '#DC2626', flex: 1 },
// //   modalBackdrop: { flex: 1, backgroundColor: "rgba(17,24,39,0.45)", justifyContent: "center", alignItems: "center", padding: 20 },
// //   modalCard: { backgroundColor: "#fff", borderRadius: 24, padding: 20, alignItems: "center", width: "90%" },
// //   modalTitle: { fontSize: 22, fontWeight: "700", color: "#111827", textAlign: "center", marginTop: 12 },
// //   modalSub: { fontSize: 14, color: "#6B7280", textAlign: "center", marginTop: 8, marginBottom: 18 },
// //   starsRow: { flexDirection: "row", justifyContent: "center", marginBottom: 18 },
// //   feedbackInput: { minHeight: 100, borderWidth: 1, borderColor: "#E5E7EB", borderRadius: 16, padding: 14, color: "#111827", fontSize: 14, width: "100%", textAlignVertical: "top" },
// //   modalActions: { flexDirection: "row", gap: 10, marginTop: 18, width: "100%" },
// //   skipBtn: { flex: 1, borderWidth: 1, borderColor: "#D1D5DB", borderRadius: 999, paddingVertical: 14, alignItems: "center" },
// //   skipBtnText: { color: "#6B7280", fontWeight: "600" },
// //   submitBtn: { flex: 1, backgroundColor: Colors.primary, borderRadius: 999, paddingVertical: 14, alignItems: "center" },
// //   submitBtnText: { color: "#fff", fontWeight: "700" },
// //   modificationStatusBadge: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 12, marginLeft: 6, gap: 4 },
// //   modificationStatusText: { color: '#fff', fontSize: 10, fontWeight: '700' },
// //   modificationRequestBanner: { marginTop: 8, marginBottom: 8, padding: 12, borderRadius: 12, borderWidth: 1, borderColor: '#FEF3C7' },
// //   modificationRequestBannerContent: { flexDirection: 'row', alignItems: 'center', gap: 12 },
// //   modificationRequestBannerText: { flex: 1 },
// //   modificationRequestBannerTitle: { fontSize: 14, fontWeight: '700', marginBottom: 2 },
// //   modificationRequestBannerSubtitle: { fontSize: 12, color: '#6B7280' },
// //   modificationDetailCard: { backgroundColor: '#F9FAFB', borderRadius: 12, padding: 12, marginBottom: 12, borderWidth: 1, borderColor: '#E5E7EB' },
// //   modificationDetailTitle: { fontSize: 13, fontWeight: '600', color: '#374151', marginBottom: 8 },
// //   modificationDetailStatus: { fontWeight: '700', marginLeft: 4 },
// //   modificationDetailRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 4 },
// //   modificationDetailLabel: { fontSize: 12, color: '#6B7280' },
// //   modificationDetailValue: { fontSize: 12, fontWeight: '600', color: '#374151' },
// //   modificationDetailDate: { fontSize: 10, color: '#9CA3AF', marginTop: 6 },
// //   modificationDetailReason: { fontSize: 11, color: '#DC2626', marginTop: 6, fontStyle: 'italic' },
// //   conflictModalContent: { backgroundColor: "#fff", borderRadius: 24, padding: 20, width: "90%", maxHeight: "85%" },
// //   conflictModalHeader: { alignItems: "center", marginBottom: 16 },
// //   conflictModalTitle: { fontSize: 20, fontWeight: "700", color: Colors.dark, marginTop: 12, textAlign: "center" },
// //   conflictModalMessage: { fontSize: 14, color: Colors.gray, textAlign: "center", marginBottom: 20, lineHeight: 20 },
// //   conflictRequestCard: { backgroundColor: "#F9FAFB", borderRadius: 16, padding: 16, marginBottom: 12, borderWidth: 1, borderColor: "#E5E7EB" },
// //   conflictRequestHeader: { flexDirection: "row", alignItems: "center", gap: 12, marginBottom: 12 },
// //   conflictRequestTitle: { fontSize: 16, fontWeight: "700", color: Colors.dark },
// //   conflictRequestDetails: { fontSize: 14, color: "#4B5563", marginBottom: 4 },
// //   conflictRequestNote: { fontSize: 12, color: "#F59E0B", marginTop: 6, fontStyle: "italic" },
// //   conflictModalSeatsInfo: { fontSize: 13, color: Colors.gray, textAlign: "center", marginBottom: 20, fontWeight: "600" },
// //   conflictModalButtons: { flexDirection: "row", gap: 12, marginBottom: 12 },
// //   conflictModalBtn: { flex: 1, paddingVertical: 14, borderRadius: 12, alignItems: "center" },
// //   conflictModalBtnText: { color: "#fff", fontWeight: "700", fontSize: 14 },
// //   conflictModalCloseBtn: { paddingVertical: 12, alignItems: "center", borderRadius: 12, backgroundColor: "#F3F4F6" },
// //   conflictModalCloseBtnText: { color: Colors.dark, fontWeight: "600" },
// //   pendingModificationBadge: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#F59E0B', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 12, marginLeft: 6, gap: 4 },
// //   pendingModificationBadgeText: { color: '#fff', fontSize: 10, fontWeight: '700' },
// //   pendingModificationsSection: { backgroundColor: '#FFFBEB', borderRadius: 12, padding: 12, marginBottom: 12, borderWidth: 1, borderColor: '#FDE68A' },
// //   pendingModificationsHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 12 },
// //   pendingModificationsTitle: { fontSize: 14, fontWeight: '700', color: '#92400E' },
// //   pendingModificationCard: { backgroundColor: '#fff', borderRadius: 12, padding: 12, marginBottom: 8, borderWidth: 1, borderColor: '#FDE68A' },
// //   pendingModificationContent: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
// //   pendingModificationAvatar: { marginRight: 12 },
// //   pendingModificationInfo: { flex: 1 },
// //   pendingModificationPassengerName: { fontSize: 14, fontWeight: '600', color: Colors.dark, marginBottom: 4 },
// //   pendingModificationSeatChange: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 4 },
// //   oldSeatCount: { fontSize: 12, color: '#DC2626', textDecorationLine: 'line-through' },
// //   newSeatCount: { fontSize: 12, color: '#10B981', fontWeight: 'bold' },
// //   pendingModificationTime: { fontSize: 10, color: '#B45309', opacity: 0.7 },
// //   pendingModificationActions: { flexDirection: 'row', gap: 8 },
// //   modificationApprovedBanner: { marginTop: 8, marginBottom: 8, padding: 12, borderRadius: 12, borderWidth: 1, borderColor: '#10B981' },
// //   modificationRejectedBanner: { marginTop: 8, marginBottom: 8, padding: 12, borderRadius: 12, borderWidth: 1, borderColor: '#DC2626' },
// //   modificationRejectionReason: { fontSize: 11, color: '#DC2626', marginTop: 4, fontStyle: 'italic' },
// //   cancelModificationBtn: { marginTop: 12, backgroundColor: '#FEF2F2', paddingVertical: 10, borderRadius: 8, borderWidth: 1, borderColor: '#EF4444', alignItems: 'center', flexDirection: 'row', justifyContent: 'center', gap: 6 },
// //   cancelModificationBtnText: { color: '#EF4444', fontWeight: '600', fontSize: 13 },
// //   completedRideBanner: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#E8F5E9', padding: 10, borderRadius: 8, marginBottom: 12, gap: 8, borderWidth: 1, borderColor: '#C8E6C9' },
// //   completedRideBannerText: { fontSize: 12, color: '#2E7D32', flex: 1, fontWeight: '500' },
// //   completedRideDetailsCard: { backgroundColor: '#F8FAFC', borderRadius: 12, padding: 12, marginBottom: 12, borderWidth: 1, borderColor: '#E5E7EB' },
// //   completedDetailsTitle: { fontSize: 13, fontWeight: '700', color: Colors.dark, marginBottom: 8 },
// //   completedDetailsRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 4 },
// //   completedDetailsLabel: { fontSize: 12, color: '#6B7280' },
// //   completedDetailsValue: { fontSize: 12, fontWeight: '600', color: '#184080' },
// //   modificationStatusMessageCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFFBEB', paddingHorizontal: 10, paddingVertical: 8, borderRadius: 8, marginTop: 8, marginBottom: 4, gap: 8, borderWidth: 1, borderColor: '#FDE68A' },
// //   modificationStatusMessageText: { fontSize: 12, color: '#B45309', fontWeight: '500', flex: 1 },
// //   lateDriverWarning: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#FEF2F2', paddingHorizontal: 12, paddingVertical: 10, borderRadius: 10, marginTop: 8, marginBottom: 8, gap: 10, borderWidth: 1, borderColor: '#FEE2E2' },
// //   lateDriverWarningText: { fontSize: 13, color: '#DC2626', fontWeight: '500', flex: 1 },
// //   startSoonWarning: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#FEF3C7', paddingHorizontal: 12, paddingVertical: 10, borderRadius: 10, marginTop: 8, marginBottom: 8, gap: 10, borderWidth: 1, borderColor: '#FDE68A' },
// //   startSoonWarningText: { fontSize: 13, color: '#92400E', fontWeight: '500', flex: 1 },
// //   alreadyRatedContainer: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, backgroundColor: '#F3F4F6', paddingVertical: 12, borderRadius: 14, marginTop: 8 },
// //   trackRideBtn: { backgroundColor: "#10B981", borderRadius: 14, paddingVertical: 14, alignItems: "center", justifyContent: "center", flexDirection: "row", gap: 8, marginTop: 8, marginBottom: 8, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4, elevation: 3 },
// //   trackRideBtnText: { color: "#fff", fontSize: 15, fontWeight: "700" },
// //   riderLocationsCard: { backgroundColor: '#F8FAFC', borderRadius: 12, padding: 12, marginBottom: 12, borderWidth: 1, borderColor: '#E5E7EB' },
// //   riderLocationsTitle: { fontSize: 13, fontWeight: '700', color: Colors.dark, marginBottom: 10 },
// //   riderLocationItem: { flexDirection: 'row', alignItems: 'flex-start', gap: 10 },
// //   riderLocationIcon: { width: 28, height: 28, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
// //   riderLocationContent: { flex: 1 },
// //   riderLocationLabel: { fontSize: 11, color: Colors.gray, marginBottom: 2 },
// //   riderLocationValue: { fontSize: 13, fontWeight: '500', color: Colors.dark },
// //   riderLocationDivider: { height: 1, backgroundColor: '#E5E7EB', marginVertical: 10, marginLeft: 38 },
// //   riderMiniLocation: { flexDirection: 'row', alignItems: 'flex-start', gap: 4, marginTop: 4 },
// //   riderMiniLocationText: { fontSize: 11, color: '#6B7280', flex: 1, lineHeight: 16 },
// //   riderExpandedDetails: { marginTop: 12, paddingTop: 12, borderTopWidth: 1, borderTopColor: '#EEF2F7' },
// //   riderLocationDetailCard: { backgroundColor: '#F9FAFB', borderRadius: 10, padding: 12, marginBottom: 10 },
// //   riderLocationDetailHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 8 },
// //   riderLocationDetailTitle: { fontSize: 13, fontWeight: '600', color: Colors.dark },
// //   riderLocationDetailText: { fontSize: 13, color: '#374151', marginLeft: 24, lineHeight: 18 },
// //   riderLocationWalkDistance: { fontSize: 10, color: '#6B7280', marginTop: 4, fontStyle: 'italic' },
// //   cancelBookingBtn: { marginTop: 12, backgroundColor: '#FEF2F2', paddingVertical: 12, borderRadius: 12, alignItems: 'center', borderWidth: 1, borderColor: '#EF4444' },
// //   cancelBookingBtnText: { color: '#EF4444', fontWeight: '700', fontSize: 14 },
// //   autoCancelledBanner: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#F3F4F6', padding: 10, borderRadius: 8, marginBottom: 10, gap: 8 },
// //   autoCancelledText: { fontSize: 12, color: '#6B7280', flex: 1 },
// //   pendingRequestBanner: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#FEF3C7', padding: 12, borderRadius: 10, marginBottom: 12, gap: 12, borderWidth: 1, borderColor: '#FDE68A' },
// //   pendingRequestTitle: { fontSize: 14, fontWeight: '600', color: '#92400E' },
// //   pendingRequestSubtext: { fontSize: 12, color: '#B45309', marginTop: 2 },
// //   rejectedRequestBanner: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#FEF2F2', padding: 10, borderRadius: 8, marginBottom: 10, gap: 8, borderWidth: 1, borderColor: '#FEE2E2' },
// //   rejectedRequestText: { fontSize: 12, color: '#DC2626', flex: 1 },
// //   filterModalContent: { backgroundColor: "#fff", borderRadius: 28, padding: 0, width: "100%", maxWidth: 340, maxHeight: "80%", overflow: "hidden", shadowColor: "#000", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.25, shadowRadius: 4, elevation: 5 },
// //   filterModalHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", paddingHorizontal: 20, paddingVertical: 16, borderBottomWidth: 1, borderBottomColor: "#E5E7EB", backgroundColor: "#fff" },
// //   filterModalTitle: { fontSize: 18, fontWeight: "700", color: Colors.dark },
// //   filterOptionsList: { maxHeight: 400, paddingHorizontal: 8 },
// //   filterOption: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", paddingVertical: 14, paddingHorizontal: 12, borderRadius: 12, marginVertical: 4 },
// //   filterOptionLeft: { flexDirection: "row", alignItems: "center", gap: 12 },
// //   filterOptionActive: { backgroundColor: "#EEF6FF" },
// //   filterOptionText: { fontSize: 15, color: Colors.dark, fontWeight: "500" },
// //   filterOptionTextActive: { color: Colors.primary, fontWeight: "600" },
// //   filterModalActions: { flexDirection: "row", gap: 12, padding: 16, borderTopWidth: 1, borderTopColor: "#E5E7EB", backgroundColor: "#fff" },
// //   filterCancelBtn: { flex: 1, paddingVertical: 12, borderRadius: 12, borderWidth: 1, borderColor: "#D1D5DB", alignItems: "center", backgroundColor: "#fff" },
// //   filterCancelBtnText: { color: Colors.gray, fontWeight: "600", fontSize: 15 },
// //   filterApplyBtn: { flex: 1, paddingVertical: 12, borderRadius: 12, backgroundColor: Colors.primary, alignItems: "center", shadowColor: Colors.primary, shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.2, shadowRadius: 4, elevation: 3 },
// //   filterApplyBtnText: { color: "#fff", fontWeight: "700", fontSize: 15 },
// //   riderWalkInfo: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 3 },
// //   riderWalkInfoText: { fontSize: 10, color: '#9CA3AF' },
// //   navigateLocationBtnSmall: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 6, paddingVertical: 4, paddingHorizontal: 8, backgroundColor: '#F3F4F6', borderRadius: 12, alignSelf: 'flex-start' },
// //   navigateLocationBtnSmallText: { fontSize: 10, color: '#6B7280', fontWeight: '500' },
// //   riderLocationDetailCoords: { fontSize: 10, color: '#9CA3AF', marginTop: 4 },
// //   dateSectionHeader: { flexDirection: 'row', alignItems: 'center', marginTop: 8, marginBottom: 12, paddingHorizontal: 4 },
// //   dateSectionHeaderText: { fontSize: 16, fontWeight: '700', color: Colors.primary, backgroundColor: Colors.white, paddingRight: 12, fontFamily: FontFamily.secondary.bold },
// //   dateSectionHeaderLine: { flex: 1, height: 1, backgroundColor: '#E5E7EB' },
// //   viewPastRidesBtn: { backgroundColor: "#EEF6FF", paddingHorizontal: 20, paddingVertical: 10, borderRadius: 20, marginTop: 16 },
// //   viewPastRidesBtnText: { color: Colors.primary, fontWeight: "600", fontSize: 14 },
  
// //   // Modification styles for Requested Rides
// //   modificationPendingCard: {
// //     backgroundColor: '#FFFBEB',
// //     borderRadius: 12,
// //     padding: 12,
// //     marginBottom: 12,
// //     borderWidth: 1,
// //     borderColor: '#FDE68A',
// //   },
// //   modificationPendingHeader: {
// //     flexDirection: 'row',
// //     alignItems: 'center',
// //     gap: 10,
// //     marginBottom: 8,
// //   },
// //   modificationPendingTitle: {
// //     fontSize: 14,
// //     fontWeight: '700',
// //     color: '#92400E',
// //   },
// //   modificationPendingDetails: {
// //     paddingLeft: 34,
// //   },
// //   modificationPendingText: {
// //     fontSize: 13,
// //     color: '#78350F',
// //     marginBottom: 4,
// //   },
// //   modificationPendingSubtext: {
// //     fontSize: 11,
// //     color: '#B45309',
// //   },
// //   modificationApprovedCard: {
// //     backgroundColor: '#E8F5E9',
// //     borderRadius: 12,
// //     padding: 12,
// //     marginBottom: 12,
// //     borderWidth: 1,
// //     borderColor: '#C8E6C9',
// //   },
// //   modificationRejectedCard: {
// //     backgroundColor: '#FEF2F2',
// //     borderRadius: 12,
// //     padding: 12,
// //     marginBottom: 12,
// //     borderWidth: 1,
// //     borderColor: '#FEE2E2',
// //   },
// //   modificationRejectedText: {
// //     fontSize: 13,
// //     color: '#991B1B',
// //     marginBottom: 4,
// //   },
// //   modificationRejectedSubtext: {
// //     fontSize: 11,
// //     color: '#DC2626',
// //   },
// //   modificationCancelledNotice: {
// //     flexDirection: 'row',
// //     alignItems: 'center',
// //     gap: 8,
// //     marginTop: 10,
// //     paddingTop: 8,
// //     borderTopWidth: 1,
// //     borderTopColor: '#FEE2E2',
// //   },
// //   modificationCancelledNoticeText: {
// //     fontSize: 12,
// //     color: '#DC2626',
// //     fontWeight: '500',
// //     flex: 1,
// //   },
// //    timeWarningBadge: {
// //     flexDirection: 'row',
// //     alignItems: 'center',
// //     backgroundColor: '#F59E0B',
// //     paddingHorizontal: 8,
// //     paddingVertical: 4,
// //     borderRadius: 12,
// //     gap: 4,
// //   },
// //   timeWarningBadgeText: {
// //     color: '#fff',
// //     fontSize: 10,
// //     fontWeight: '600',
// //   },
  
// //   // If you want a different style for upcoming (>24 hours)
// //   upcomingBadge: {
// //     flexDirection: 'row',
// //     alignItems: 'center',
// //     backgroundColor: '#2457A6',
// //     paddingHorizontal: 8,
// //     paddingVertical: 4,
// //     borderRadius: 12,
// //     gap: 4,
// //   },
// //   upcomingBadgeText: {
// //     color: '#fff',
// //     fontSize: 10,
// //     fontWeight: '600',
// //   },
// //   timeWarningBadge: {
// //   flexDirection: 'row',
// //   alignItems: 'center',
// //   paddingHorizontal: 8,
// //   paddingVertical: 4,
// //   borderRadius: 12,
// //   gap: 4,
// //   marginLeft: 6,
// // },
// // timeWarningBadgeText: {
// //   color: '#fff',
// //   fontSize: 10,
// //   fontWeight: '600',
// // },
// //  rejectionReasonText: {
// //     fontSize: 11,
// //     color: '#DC2626',
// //     marginTop: 4,
// //     fontStyle: 'italic',
// //   },
// //   rejectedModificationBadge: {
// //     flexDirection: 'row',
// //     alignItems: 'center',
// //     justifyContent: 'center',
// //     backgroundColor: '#FEF2F2',
// //     paddingVertical: 8,
// //     paddingHorizontal: 12,
// //     borderRadius: 8,
// //     marginTop: 8,
// //     gap: 6,
// //     borderWidth: 1,
// //     borderColor: '#FEE2E2',
// //   },
// //   rejectedModificationBadgeText: {
// //     fontSize: 12,
// //     color: '#DC2626',
// //     fontWeight: '600',
// //   },
// //     rejectionReasonText: {
// //     fontSize: 11,
// //     color: '#DC2626',
// //     marginTop: 4,
// //     fontStyle: 'italic',
// //   },
// //   rejectedModificationBadge: {
// //     flexDirection: 'row',
// //     alignItems: 'center',
// //     justifyContent: 'center',
// //     backgroundColor: '#FEF2F2',
// //     paddingVertical: 8,
// //     paddingHorizontal: 12,
// //     borderRadius: 8,
// //     marginTop: 8,
// //     gap: 6,
// //     borderWidth: 1,
// //     borderColor: '#FEE2E2',
// //   },
// //   rejectedModificationBadgeText: {
// //     fontSize: 12,
// //     color: '#DC2626',
// //     fontWeight: '600',
// //   },
// //   modifySeatsBtn: {
// //   flexDirection: 'row',
// //   alignItems: 'center',
// //   justifyContent: 'center',
// //   paddingVertical: 12,
// //   borderRadius: 12,
// //   borderWidth: 1,
// //   borderColor: Colors.primary,
// //   backgroundColor: '#EEF6FF',
// //   marginTop: 8,
// //   gap: 8,
// // },
// // modifySeatsBtnText: {
// //   fontSize: 14,
// //   fontWeight: '600',
// //   color: Colors.primary,
// // },
// // modificationUsedCard: {
// //   backgroundColor: '#F3F4F6',
// //   borderRadius: 12,
// //   padding: 12,
// //   marginBottom: 12,
// //   borderWidth: 1,
// //   borderColor: '#E5E7EB',
// // },
// // modificationUsedText: {
// //   fontSize: 13,
// //   color: '#6B7280',
// //   marginBottom: 4,
// // },
// // modificationUsedSubtext: {
// //   fontSize: 11,
// //   color: '#9CA3AF',
// // },
// // modificationDisabledContainer: {
// //   flexDirection: 'row',
// //   alignItems: 'center',
// //   backgroundColor: '#F3F4F6',
// //   padding: 12,
// //   borderRadius: 10,
// //   marginTop: 8,
// //   gap: 10,
// // },
// // modificationDisabledText: {
// //   fontSize: 12,
// //   color: '#6B7280',
// //   flex: 1,
// // },
// // });
// import React, { useEffect, useState, useRef, useCallback } from "react";
// import {
//   View,
//   Text,
//   StyleSheet,
//   TouchableOpacity,
//   ScrollView,
//   StatusBar,
//   RefreshControl,
//   Animated,
//   Image,
//   LayoutAnimation,
//   Platform,
//   UIManager,
//   ActivityIndicator,
//   Modal,
//   TextInput,
//   Alert,
//   Linking
// } from "react-native";
// import { SafeAreaView } from "react-native-safe-area-context";
// import { Ionicons, MaterialIcons } from "@expo/vector-icons";
// import { useFocusEffect } from "@react-navigation/native";
// import axios from "axios";
// import LottieView from "lottie-react-native";
// import { SvgCssUri } from 'react-native-svg/css';
// import io from 'socket.io-client';

// import { useAuth } from "../context/AuthContext";
// import { Colors, Typography } from "../constants/Colors";
// import { FontFamily } from "../constants/Fonts";
// import CustomAlert from '../components/CustomAlert';

// import { API_BASE_URL, GMAP_API_KEY } from "../config/config_ip";

// if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
//   UIManager.setLayoutAnimationEnabledExperimental(true);
// }

// const buildImageUrl = (url) => {
//   if (!url) return null;
//   if (url.startsWith('http://') || url.startsWith('https://')) return url;
//   if (url.includes('?')) {
//     return `${API_BASE_URL}${url.startsWith('/') ? '' : '/'}${url}&_t=${Date.now()}`;
//   }
//   return `${API_BASE_URL}${url.startsWith('/') ? '' : '/'}${url}?_t=${Date.now()}`;
// };

// const getInitials = (name) => {
//   if (!name) return '?';
//   const parts = name.trim().split(' ').filter(Boolean);
//   if (parts.length > 1) return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
//   return parts[0].slice(0, 2).toUpperCase();
// };

// const isSvgImage = (url) => {
//   if (!url) return false;
//   return url.toLowerCase().includes('.svg');
// };

// export default function MyRides({ route, navigation }) {
//   const { user, isAuthenticated, isGuest } = useAuth();
//   const phoneNumber = user?.phone_number;
  
//   const [alertVisible, setAlertVisible] = useState(false);
//   const [alertConfig, setAlertConfig] = useState({
//     title: "",
//     message: "",
//     icon: "check-circle",
//     iconColor: "#10B981",
//     buttons: []
//   });

//   const [expandedPostedRides, setExpandedPostedRides] = useState({});
//   const [expandedRequestedRides, setExpandedRequestedRides] = useState({});
//   const [forceRefresh, setForceRefresh] = useState(false);
//   const [addressCache, setAddressCache] = useState({});
//   const [loadingAddresses, setLoadingAddresses] = useState(false);
//   const [ratingModalVisible, setRatingModalVisible] = useState(false);
//   const [selectedRider, setSelectedRider] = useState(null);
//   const [rating, setRating] = useState(0);
//   const [feedback, setFeedback] = useState('');
//   const [currentSessionId, setCurrentSessionId] = useState(null);
//   const [ratingType, setRatingType] = useState('rider');
//   const [selectedBookingForModification, setSelectedBookingForModification] = useState(null);
//   const [modifySeatsModalVisible, setModifySeatsModalVisible] = useState(false);
//   const [modifySeatsValue, setModifySeatsValue] = useState(1);
//   const [modifySeatsLoading, setModifySeatsLoading] = useState(false);
//   const [maxModifySeats, setMaxModifySeats] = useState(1);

//   const [conflictModalVisible, setConflictModalVisible] = useState(false);
//   const [conflictData, setConflictData] = useState(null);
//   const [resolvingConflict, setResolvingConflict] = useState(false);

//   const socketRef = useRef(null);

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

//   const getAddressFromCoordsGoogle = async (lat, lng) => {
//     if (!lat || !lng) return null;
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

//   useEffect(() => {
//     if (!isAuthenticated || isGuest) {
//       showConfirmationAlert('Login Required', 'Please complete login/profile to view rides.', () => navigation.navigate('Login'));
//       navigation.goBack();
//     }
//   }, [isAuthenticated, isGuest]);

//   useEffect(() => {
//     if (!phoneNumber) return;

//     const socket = io(API_BASE_URL, {
//       transports: ['websocket'],
//       reconnection: true,
//       reconnectionAttempts: 10,
//       reconnectionDelay: 1000,
//     });

//     socketRef.current = socket;

//     socket.on('connect', () => {
//       console.log('Socket connected for ride updates');
//       socket.emit('join-user-room', phoneNumber);
//     });

//     socket.on('ride-cancelled', (data) => {
//       console.log('Ride cancelled event received:', data);
//       showCustomAlert('Ride Cancelled', data.message || 'A ride you were associated with has been cancelled.', 'warning');
//       onRefresh();
//     });

//     socket.on('booking-cancelled', (data) => {
//       console.log('Booking cancelled:', data);
//       showCustomAlert('Booking Cancelled', data.message || 'Your booking has been cancelled.', 'warning');
//       onRefresh();
//     });

//     socket.on('modification-cancelled', (data) => {
//       console.log('Modification cancelled:', data);
//       showCustomAlert('Modification Request Cancelled', data.message || 'Your modification request has been cancelled.', 'info');
//       onRefresh();
//     });

//     socket.on('ride-completed-by-driver', (data) => {
//       console.log('Ride completed by driver:', data);
//       showCustomAlert('Ride Completed', 'The driver has completed the ride. You can now rate your experience.', 'success');
//       onRefresh();
//     });

//     socket.on('ride-started-by-driver', (data) => {
//       console.log('Ride started by driver:', data);
//       showCustomAlert('Ride Started', 'The driver has started the ride. You can now track your journey.', 'success');
//       onRefresh();
//     });

//     socket.on('concurrent-requests-detected', (data) => {
//       console.log('Concurrent requests detected:', data);
//       if (data.ride_id) {
//         checkForConcurrentRequests(data.ride_id);
//       }
//     });

//     return () => {
//       if (socketRef.current) {
//         socketRef.current.disconnect();
//       }
//     };
//   }, [phoneNumber]);

//   const initialTab = route?.params?.initialTab || "posted";
//   const targetBookingId = route?.params?.bookingId || null;
//   const targetRideId = route?.params?.rideId || null;

//   const [postedRides, setPostedRides] = useState([]);
//   const [requestedRides, setRequestedRides] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [refreshing, setRefreshing] = useState(false);
//   const [activeTab, setActiveTab] = useState(initialTab);
//   const [postedFilter, setPostedFilter] = useState("all");
//   const [requestedFilter, setRequestedFilter] = useState("all");
  
//   const fadeAnim = useRef(new Animated.Value(0)).current;
//   const slideAnim = useRef(new Animated.Value(50)).current;
//   const tabScaleAnim = useRef(new Animated.Value(1)).current;
//   const scrollViewRef = useRef(null);
//   const [showFilterModal, setShowFilterModal] = useState(false);
//   const [tempFilter, setTempFilter] = useState("all");

//   const fetchMyRides = async (forceClearCache = false) => {
//     if (!phoneNumber) {
//       setLoading(false);
//       return;
//     }
    
//     setLoading(true);
    
//     try {
//       const timestamp = forceClearCache ? `?_t=${Date.now()}` : '';
//       const url = `${API_BASE_URL}/my-rides/${phoneNumber}${timestamp}`;
//       console.log('Fetching rides from:', url);
      
//       const res = await axios.get(url);
      
//       console.log('Rides fetched:', {
//         posted: res.data.posted_rides?.length || 0,
//         requested: res.data.requested_rides?.length || 0
//       });
      
//       setPostedRides(res.data.posted_rides || []);
//       setRequestedRides(res.data.requested_rides || []);
      
//     } catch (error) {
//       console.error("Error fetching rides:", error);
//       if (error.response) {
//         showCustomAlert("Error", `Server error: ${error.response.status}`, "error");
//       } else {
//         showCustomAlert("Error", "Could not load your rides.", "error");
//       }
//     } finally {
//       setLoading(false);
//       setForceRefresh(false);
//     }
//   };

//   const onRefresh = () => {
//     setRefreshing(true);
//     fetchMyRides(true);
//     setTimeout(() => setRefreshing(false), 1000);
//   };

//   useFocusEffect(
//     useCallback(() => {
//       if (phoneNumber) {
//         const shouldRefresh = route.params?.refresh || route.params?.forceReload;
//         const targetTab = route.params?.tab;
        
//         if (targetTab) {
//           setActiveTab(targetTab);
//         }
        
//         if (shouldRefresh) {
//           fetchMyRides(true);
//           navigation.setParams({ refresh: false, forceReload: false, tab: undefined });
//         } else {
//           fetchMyRides();
//         }
//       }
//     }, [phoneNumber, route.params?.refresh, route.params?.forceReload, route.params?.tab])
//   );

//   useEffect(() => {
//     if (!phoneNumber) return;
//     fetchMyRides();
//     Animated.parallel([
//       Animated.timing(fadeAnim, { toValue: 1, duration: 500, useNativeDriver: true }),
//       Animated.timing(slideAnim, { toValue: 0, duration: 500, useNativeDriver: true }),
//     ]).start();
//   }, [phoneNumber]);

//   useEffect(() => {
//     if (route?.params?.initialTab) setActiveTab(route.params.initialTab);
//   }, [route?.params?.initialTab]);

//   const checkForConcurrentRequests = async (rideId) => {
//     try {
//       const response = await axios.get(`${API_BASE_URL}/ride/${rideId}/concurrent-requests?_t=${Date.now()}`);
//       const data = response.data;
      
//       if (data.has_concurrent_requests) {
//         setConflictData(data);
//         setConflictModalVisible(true);
//       }
//     } catch (error) {
//       console.log('Error checking concurrent requests:', error);
//     }
//   };

//   const resolveConcurrentRequest = async (choice, modificationRequestId, bookingId) => {
//     if (!conflictData) return;
    
//     setResolvingConflict(true);
//     try {
//       const response = await axios.post(`${API_BASE_URL}/ride/${conflictData.ride.id}/resolve-concurrent-requests`, {
//         choice: choice,
//         modification_request_id: modificationRequestId,
//         booking_id: bookingId,
//         driver_phone: phoneNumber
//       });
      
//       const data = response.data;
      
//       if (data.success) {
//         showCustomAlert('Success', data.message, 'success');
//         setConflictModalVisible(false);
//         onRefresh();
//       } else {
//         showCustomAlert('Error', data.message || 'Failed to process request', 'error');
//         onRefresh();
//       }
//     } catch (error) {
//       console.error('Resolve concurrent request error:', error);
//       showCustomAlert('Error', error.response?.data?.detail || 'Failed to resolve concurrent requests', 'error');
//       onRefresh();
//     } finally {
//       setResolvingConflict(false);
//     }
//   };

//   const togglePostedRideExpand = (rideId) => {
//     LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
//     setExpandedPostedRides(prev => ({ ...prev, [rideId]: !prev[rideId] }));
//   };

//   const toggleRequestedRideExpand = (rideId) => {
//     LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
//     setExpandedRequestedRides(prev => ({ ...prev, [rideId]: !prev[rideId] }));
//   };

//   const handleViewProfile = (userId, phoneNumber, name, profilePicture) => {
//     navigation.navigate('ViewProfileScreen', {
//       userId: userId,
//       phoneNumber: phoneNumber,
//       driverName: name,
//       profilePicture: profilePicture,
//     });
//   };

//   const handleViewRideDetails = (ride, booking = null) => {
//     const rideData = {
//       id: ride.id || ride.ride_id,
//       custom_ride_id: ride.custom_ride_id,
//       origin: ride.origin,
//       destination: ride.destination,
//       origin_address: ride.origin_address,
//       destination_address: ride.destination_address,
//       departure_time: ride.departure_time,
//       price: ride.price_per_seat,
//       driverName: ride.driver_name,
//       phoneNumber: ride.driver_phone || ride.phone_number,
//       driverUserId: ride.driver_user_id,
//       seatsAvailable: ride.available_seats || ride.remaining_seats,
//       totalSeats: ride.available_seats || 4,
//       available_seats: ride.available_seats || ride.totalSeats || ride.total_seats || 0,
//       booked_seats: ride.total_booked_seats || 0,
//       routeCoordinates: ride.route_coordinates || [],
//       suggestedPickup: ride.suggested_pickup || null,
//       suggestedDrop: ride.suggested_drop || null,
//       profilePicture: ride.driver_photo || ride.driver_profile_picture,
//       rating: ride.driver_rating || 4.5,
//       vehicle: ride.vehicle,
//       preferences: ride.preferences,
//       women_only: ride.women_only,
//       bookings: ride.bookings,
//       status: ride.status,
//       cancellation_reason: ride.cancellation_reason,
//       duration_text: ride.duration_text,
//       distance_km: ride.distance_km,
//       from: ride.origin,
//       to: ride.destination,
//       seatsRequested: ride.seats_requested,
//       price_per_seat: ride.price_per_seat,
//       origin_coords: ride.origin_coords || null,
//       destination_coords: ride.destination_coords || null,
//       started_at: ride.started_at,
//       completed_at: ride.completed_at,
//     };
    
//     const isOwnRide = user?.phone_number === ride.phone_number;
    
//     if (isOwnRide) {
//       navigation.navigate('ViewRoutePostedScreen', { ride: rideData });
//     } else {
//       const bookingData = booking ? {
//         id: booking.id,
//         custom_booking_id: booking.custom_booking_id,
//         seats_requested: booking.seats_requested || booking.seats_booked,
//         status: booking.status,
//         total_amount: booking.total_amount,
//         created_at: booking.created_at,
//         passenger_phone: booking.passenger_phone,
//         pickup_address: booking.pickup_address,
//         dropoff_address: booking.dropoff_address,
//       } : null;
      
//       navigation.navigate('ViewRouteRequestScreen', { 
//         ride: rideData, 
//         booking: bookingData 
//       });
//     }
//   };

//   const handleEditRide = (ride) => {
//     if (!ride || !phoneNumber) {
//       showCustomAlert("Error", "Cannot edit ride. Please refresh and try again.", "error");
//       return;
//     }
    
//     if (ride.started_at) {
//       showCustomAlert("Cannot Edit", "Ride has already started. Cannot edit.", "warning");
//       return;
//     }
    
//     if (ride.cancellation_reason) {
//       showCustomAlert("Cannot Edit", "Cancelled ride cannot be edited.", "warning");
//       return;
//     }
    
//     if (ride.status === "completed") {
//       showCustomAlert("Cannot Edit", "Completed ride cannot be edited.", "warning");
//       return;
//     }
    
//     const now = new Date();
//     const departureTime = new Date(ride.departure_time);
//     const minutesToDeparture = (departureTime - now) / (1000 * 60);
    
//     if (minutesToDeparture <= 15 && minutesToDeparture > 0) {
//       showCustomAlert("Cannot Edit", "Cannot edit ride within 15 minutes of departure time.", "warning");
//       return;
//     }
    
//     const rideData = {
//       from: ride.origin || '',
//       to: ride.destination || '',
//       dateTime: ride.departure_time ? new Date(ride.departure_time) : new Date(),
//       seatsAvailable: ride.available_seats || 1,
//       pricePerSeat: (ride.price_per_seat || 0).toString(),
//       vehicleId: ride.vehicle_id || null,
//       originCoords: ride.origin_coords,
//       destinationCoords: ride.destination_coords,
//       routeCoordinates: ride.route_coordinates,
//       distanceKm: ride.distance_km,
//       durationText: ride.duration_text,
//       totalPrice: ride.total_estimated_price,
//       preferences: ride.preferences,
//       womenOnly: ride.women_only,
//     };
    
//     navigation.navigate('DriveNext', { 
//       rideData, 
//       isEdit: true, 
//       rideId: ride.id, 
//       phoneNumber: phoneNumber 
//     });
//   };

//   const canStartRide = (ride) => {
//     if (ride.status === "completed") return false;
//     if (ride.cancellation_reason) return false;
//     if (ride.started_at) return false;
//     if (ride.status !== "active" && ride.status !== "full") return false;
    
//     const now = new Date();
//     const departureTime = new Date(ride.departure_time);
//     const minutesToDeparture = (departureTime - now) / (1000 * 60);
//     const minutesSinceDeparture = (now - departureTime) / (1000 * 60);
    
//     if (minutesSinceDeparture > 30) return false;
//     return minutesToDeparture <= 15 || minutesSinceDeparture >= 0;
//   };

//   const getRideStatusInfo = (ride) => {
//     const now = new Date();
//     const departureTime = new Date(ride.departure_time);
//     const hoursSinceDeparture = (now - departureTime) / (1000 * 60 * 60);
//     const minutesSinceDeparture = (now - departureTime) / (1000 * 60);
//     const minutesToDeparture = (departureTime - now) / (1000 * 60);
    
//     if (ride.status === "completed" || ride.completed_at) {
//       return { text: "Completed", color: "#6B7280", icon: "checkmark-done", type: "completed" };
//     }
    
//     if (ride.cancellation_reason && !ride.cancellation_reason.includes("Auto-cancelled")) {
//       return { text: "Cancelled", color: "#DC2626", icon: "close-circle", type: "cancelled" };
//     }
    
//     if (ride.cancellation_reason?.includes("Auto-cancelled") || (hoursSinceDeparture > 2 && !ride.started_at && !ride.completed_at)) {
//       return { text: "Auto-cancelled", color: "#9CA3AF", icon: "timer-off", type: "auto-cancelled" };
//     }
    
//     if (ride.started_at && !ride.completed_at && ride.status !== "completed") {
//       return { text: "Ongoing", color: "#10B981", icon: "car-sport", type: "ongoing" };
//     }
    
//     if (minutesSinceDeparture > 0 && minutesSinceDeparture <= 120 && !ride.started_at && !ride.completed_at) {
//       return { text: `Late - ${Math.abs(Math.round(minutesSinceDeparture))} min`, color: "#EF4444", icon: "alert-circle", type: "late" };
//     }
    
//     if (minutesToDeparture <= 15 && minutesToDeparture > 0 && !ride.started_at && !ride.completed_at) {
//       return { text: `Starting in ${Math.round(minutesToDeparture)} min`, color: "#10B981", icon: "checkmark-circle", type: "active" };
//     }
    
//     if (minutesToDeparture <= 60 && minutesToDeparture > 15 && !ride.started_at && !ride.completed_at) {
//       return { text: `Starts in ${Math.round(minutesToDeparture)} min`, color: "#F59E0B", icon: "time-outline", type: "start-soon" };
//     }
    
//     if (minutesToDeparture > 60 && !ride.started_at && !ride.completed_at) {
//       const hours = Math.floor(minutesToDeparture / 60);
//       const mins = Math.round(minutesToDeparture % 60);
//       const timeText = hours > 0 ? `${hours}h ${mins > 0 ? `${mins}m` : ''}` : `${mins}m`;
//       return { text: `Starts in ${timeText}`, color: "#2457A6", icon: "calendar-outline", type: "upcoming" };
//     }
    
//     return { text: "Active", color: "#10B981", icon: "checkmark-circle", type: "active" };
//   };

//   const getPassengerRideStatusInfo = (booking) => {
//     const ride = booking;
//     const now = new Date();
//     const departureTime = new Date(ride.departure_time);
//     const hoursSinceDeparture = (now - departureTime) / (1000 * 60 * 60);
//     const minutesToDeparture = (departureTime - now) / (1000 * 60);
//     const minutesSinceDeparture = (now - departureTime) / (1000 * 60);
    
//     if (booking.modification_request && booking.modification_request.status === "rejected") {
//       return { text: "Booking Cancelled", color: "#DC2626", icon: "close-circle", type: "modification-rejected", showTrackButton: false };
//     }
    
//     if (ride.ride_status === "completed" || ride.completed_at) {
//       return { text: "Completed", color: "#6B7280", icon: "checkmark-done", type: "completed", showTrackButton: false };
//     }
    
//     if (ride.ride_cancelled || ride.cancellation_reason || ride.ride_status === "cancelled") {
//       if (hoursSinceDeparture > 2 && !ride.ride_started_at) {
//         return { text: "Auto-cancelled", color: "#9CA3AF", icon: "timer-off", type: "auto-cancelled", showTrackButton: false };
//       }
//       return { text: "Ride Cancelled", color: "#DC2626", icon: "close-circle", type: "ride-cancelled", showTrackButton: false };
//     }
    
//     if (ride.ride_started_at && ride.ride_status !== "completed") {
//       return { text: "Ongoing", color: "#10B981", icon: "car-sport", type: "ongoing", showTrackButton: true };
//     }
    
//     if (minutesToDeparture <= 60 && minutesToDeparture > 0 && ride.status === "accepted" && !ride.ride_started_at) {
//       const mins = Math.round(minutesToDeparture);
//       if (mins <= 15) {
//         return { text: `Starting in ${mins} min`, color: "#10B981", icon: "checkmark-circle", type: "start-soon", showTrackButton: false };
//       }
//       return { text: `Starts in ${mins} min`, color: "#F59E0B", icon: "time-outline", type: "start-soon", showTrackButton: false };
//     }
    
//     if (minutesSinceDeparture > 0 && minutesSinceDeparture <= 120 && ride.status === "accepted" && !ride.ride_started_at) {
//       return { text: `Driver Late - ${Math.round(minutesSinceDeparture)} min`, color: "#EF4444", icon: "alert-circle", type: "driver-late", showTrackButton: false };
//     }
    
//     if (ride.status === "pending") {
//       return { text: "Requested", color: "#F59E0B", icon: "time", type: "pending", showTrackButton: false };
//     }
    
//     if (ride.status === "accepted" && !ride.ride_started_at && minutesToDeparture > 60) {
//       const hours = Math.floor(minutesToDeparture / 60);
//       const mins = Math.round(minutesToDeparture % 60);
//       const timeText = hours > 0 ? `${hours}h ${mins > 0 ? `${mins}m` : ''}` : `${mins}m`;
//       return { text: `Accepted - ${timeText}`, color: "#10B981", icon: "checkmark-circle", type: "accepted", showTrackButton: false };
//     }
    
//     if (ride.status === "rejected") {
//       return { text: "Rejected", color: "#DC2626", icon: "close-circle", type: "rejected", showTrackButton: false };
//     }
    
//     return { text: ride.status || "Unknown", color: Colors.gray, icon: "ellipse", type: "unknown", showTrackButton: false };
//   };

//   const handleStartRide = async (ride) => {
//     if (ride.status === "completed") {
//       showCustomAlert("Cannot Start", "This ride has already been completed.", "warning");
//       return;
//     }
    
//     const statusInfo = getRideStatusInfo(ride);
    
//     if (statusInfo.type !== 'active' && statusInfo.type !== 'late') {
//       const now = new Date();
//       const departureTime = new Date(ride.departure_time);
//       const minutesToDeparture = Math.ceil((departureTime - now) / (1000 * 60));
//       const minutesSinceDeparture = Math.ceil((now - departureTime) / (1000 * 60));
      
//       if (ride.status === "completed") {
//         showCustomAlert("Ride Completed", "This ride has already been completed.", "info");
//       } else if (minutesSinceDeparture > 120) {
//         showCustomAlert("Ride Expired", "This ride has been auto-cancelled as it was not started within 2 hours of departure time.", "error");
//       } else if (minutesToDeparture > 15) {
//         showCustomAlert("Cannot Start Ride", `You can start the ride only 15 minutes before departure time. ${minutesToDeparture} minutes remaining.`, "warning");
//       } else if (minutesSinceDeparture > 0 && minutesSinceDeparture <= 120) {
//         showCustomAlert("Late Start", `Ride is ${minutesSinceDeparture} minutes late. You can still start the ride.`, "warning");
//       } else {
//         showCustomAlert("Cannot Start Ride", "Ride cannot be started at this time.", "warning");
//       }
//       return;
//     }
    
//     const liveSession = ride?.live_session;
//     if (liveSession?.session_id) {
//       navigation.navigate('OngoingRideDriverScreen', { rideId: ride.id, sessionId: liveSession.session_id });
//       return;
//     }
    
//     navigation.navigate('StartRideConfirmScreen', { rideId: ride.id, ride });
//   };

//   const handleTrackRide = (booking) => {
//     navigation.navigate('OngoingRideRiderScreen', { 
//       bookingId: booking.id, 
//       sessionId: booking.live_session?.session_id || null 
//     });
//   };

//   const handleBookingAction = async (bookingId, action) => {
//     showConfirmationAlert(`${action === "accept" ? "Accept" : "Reject"} Request`, `Are you sure you want to ${action} this booking request?`, async () => {
//       try {
//         await axios.put(`${API_BASE_URL}/booking/${bookingId}/${action}`);
//         showCustomAlert("Success", `Booking ${action}ed successfully.`, "success");
//         onRefresh();
//       } catch (err) {
//         showCustomAlert("Error", "Could not update booking.", "error");
//       }
//     });
//   };

//   const cancelRide = async (rideId) => {
//     const ride = postedRides.find(r => r.id === rideId);
    
//     if (ride?.status === "completed") {
//       showCustomAlert("Cannot Cancel", "Completed rides cannot be cancelled.", "warning");
//       return;
//     }
    
//     const acceptedBookings = ride?.bookings?.filter(b => b.status === "accepted")?.length || 0;
//     const pendingBookings = ride?.bookings?.filter(b => b.status === "pending")?.length || 0;
//     const pendingModifications = ride?.bookings?.filter(b => b.modification_request?.status === "pending")?.length || 0;
    
//     let message = "Are you sure you want to cancel this ride?\n\n";
//     if (acceptedBookings > 0) {
//       message += `⚠️ This will cancel ${acceptedBookings} confirmed booking(s)\n`;
//     }
//     if (pendingBookings > 0) {
//       message += `⚠️ This will reject ${pendingBookings} pending request(s)\n`;
//     }
//     if (pendingModifications > 0) {
//       message += `⚠️ This will cancel ${pendingModifications} modification request(s)\n`;
//     }
//     message += "\nThis action cannot be undone.";
    
//     showConfirmationAlert("Cancel Ride", message, async () => {
//       try {
//         const response = await axios.put(`${API_BASE_URL}/ride/${rideId}/cancel`);
        
//         if (response.data) {
//           const { affected_passengers, cancelled_modifications, cancelled_pending_bookings } = response.data;
          
//           let successMessage = "Ride cancelled successfully.";
//           if (affected_passengers > 0) {
//             successMessage += `\n✅ ${affected_passengers} confirmed booking(s) cancelled.`;
//           }
//           if (cancelled_pending_bookings > 0) {
//             successMessage += `\n📝 ${cancelled_pending_bookings} pending request(s) rejected.`;
//           }
//           if (cancelled_modifications > 0) {
//             successMessage += `\n🔄 ${cancelled_modifications} modification request(s) cancelled.`;
//           }
          
//           showCustomAlert("Success", successMessage, "success");
//           onRefresh();
//         }
//       } catch (err) {
//         const errorMessage = err.response?.data?.detail || err.response?.data?.message || err.message || "Could not cancel ride.";
//         showCustomAlert("Error", `Failed to cancel ride: ${errorMessage}`, "error");
//       }
//     });
//   };

//   const getCancellationStatusDisplay = (item) => {
//     if (item.cancellation_reason) {
//       if (item.cancellation_reason.includes("Auto-cancelled") || item.cancellation_reason.includes("auto-cancel")) {
//         return {
//           text: "Auto-cancelled",
//           color: "#9CA3AF",
//           icon: "timer-off",
//           message: item.cancellation_reason
//         };
//       }
//       return {
//         text: "Cancelled",
//         color: "#DC2626",
//         icon: "close-circle",
//         message: item.cancellation_reason
//       };
//     }
//     return null;
//   };

//   const cancelBooking = async (bookingId) => {
//     showConfirmationAlert("Cancel Booking", "Are you sure you want to cancel this booking?", async () => {
//       try {
//         await axios.put(`${API_BASE_URL}/booking/${bookingId}/cancel`);
//         showCustomAlert("Success", "Booking cancelled successfully.", "success");
//         onRefresh();
//       } catch (err) {
//         showCustomAlert("Error", "Could not cancel booking.", "error");
//       }
//     });
//   };

//   const handleModificationAction = async (requestId, action, bookingId) => {
//     showConfirmationAlert(`${action === "approve" ? "Approve" : "Reject"} Modification`, `Are you sure you want to ${action} this seat modification request?`, async () => {
//       try {
//         await axios.put(`${API_BASE_URL}/api/v1/modifications/${requestId}/${action}`);
//         showCustomAlert("Success", `Modification request ${action}d successfully.`, "success");
//         onRefresh();
//       } catch (err) {
//         showCustomAlert("Error", "Could not process modification request.", "error");
//       }
//     });
//   };

//   const handleCancelModificationRequest = async (requestId, bookingId) => {
//     showConfirmationAlert("Cancel Modification Request", "Are you sure you want to cancel your seat modification request?", async () => {
//       try {
//         const response = await axios.delete(`${API_BASE_URL}/api/v1/modifications/${requestId}/cancel`);
//         showCustomAlert("Success", "Modification request cancelled successfully.", "success");
//         onRefresh();
//       } catch (err) {
//         showCustomAlert("Error", err.response?.data?.detail || "Could not cancel modification request.", "error");
//       }
//     });
//   };

//   const openRateRiderModal = (rider, sessionId) => {
//     setSelectedRider(rider);
//     setCurrentSessionId(sessionId);
//     setRatingType('rider');
//     setRating(0);
//     setFeedback('');
//     setRatingModalVisible(true);
//   };

//   const openRateDriverModal = (booking, sessionId) => {
//     setSelectedRider({
//       booking_id: booking.id,
//       rider_name: booking.driver_name,
//       rider_phone: booking.driver_phone,
//       rider_photo: booking.driver_photo
//     });
//     setCurrentSessionId(sessionId);
//     setRatingType('driver');
//     setRating(0);
//     setFeedback('');
//     setRatingModalVisible(true);
//   };

//   const submitRating = async () => {
//     if (!selectedRider) return;
//     if (rating === 0) {
//       showCustomAlert('Rating Required', 'Please select a rating before submitting', 'warning');
//       return;
//     }
    
//     try {
//       const endpoint = ratingType === 'rider' 
//         ? `${API_BASE_URL}/ride-sessions/${currentSessionId}/rate-rider`
//         : `${API_BASE_URL}/ride-sessions/${currentSessionId}/rate-driver-once`;
      
//       const response = await axios.post(endpoint, {
//         booking_id: selectedRider.booking_id,
//         rating,
//         feedback,
//       });
      
//       if (response.data.already_rated) {
//         showCustomAlert('Already Rated', response.data.message, 'info');
//       } else {
//         showCustomAlert('Success', `Thank you for rating this ${ratingType === 'rider' ? 'rider' : 'driver'}!`, 'success');
//       }
      
//       setRatingModalVisible(false);
//       onRefresh();
//     } catch (error) {
//       showCustomAlert('Error', error?.response?.data?.detail || 'Could not submit rating', 'error');
//     }
//   };

//   const isRidePast = (departureTime) => {
//     const now = new Date();
//     const departure = new Date(departureTime);
//     return departure < now;
//   };

//   const renderDateHeader = (ride, previousRide) => {
//     if (!previousRide) return true;
    
//     const currentDate = new Date(ride.departure_time);
//     const previousDate = new Date(previousRide.departure_time);
    
//     currentDate.setHours(0, 0, 0, 0);
//     previousDate.setHours(0, 0, 0, 0);
    
//     return currentDate.getTime() !== previousDate.getTime();
//   };

//   const getDateHeaderTitle = (date) => {
//     const today = new Date();
//     today.setHours(0, 0, 0, 0);
//     const tomorrow = new Date(today);
//     tomorrow.setDate(tomorrow.getDate() + 1);
//     const rideDate = new Date(date);
//     rideDate.setHours(0, 0, 0, 0);
    
//     if (rideDate.getTime() === today.getTime()) return "Today";
//     if (rideDate.getTime() === tomorrow.getTime()) return "Tomorrow";
//     if (rideDate > tomorrow) return "Upcoming Rides";
//     return "Past Rides";
//   };

//   const getSortedPostedRides = () => {
//     let rides = [...postedRides];
//     const now = new Date();
//     const today = new Date();
//     today.setHours(0, 0, 0, 0);
//     const tomorrow = new Date(today);
//     tomorrow.setDate(tomorrow.getDate() + 1);
    
//     rides = rides.map(ride => {
//       const departureTime = new Date(ride.departure_time);
//       const hoursSinceDeparture = (now - departureTime) / (1000 * 60 * 60);
      
//       if (hoursSinceDeparture > 2 && !ride.started_at && !ride.completed_at && !ride.cancellation_reason) {
//         ride.auto_cancelled = true;
//       }
//       return ride;
//     });
    
//     if (postedFilter !== "all") {
//       rides = rides.filter((ride) => {
//         const rideTime = new Date(ride.departure_time);
//         const hoursSinceDeparture = (now - rideTime) / (1000 * 60 * 60);
//         const isAutoCancelled = (hoursSinceDeparture > 2 && !ride.started_at && !ride.completed_at && !ride.cancellation_reason);
        
//         if (postedFilter === "completed") {
//           return ride.status === "completed" || ride.completed_at;
//         }
//         if (postedFilter === "cancelled") {
//           return ride.cancellation_reason && !ride.cancellation_reason.includes("Auto-cancelled");
//         }
//         if (postedFilter === "autocancelled") {
//           return isAutoCancelled || (ride.cancellation_reason && ride.cancellation_reason.includes("Auto-cancelled"));
//         }
//         if (postedFilter === "past") {
//           return (ride.status === "completed" || ride.completed_at || ride.cancellation_reason || isAutoCancelled);
//         }
//         return true;
//       });
//     }
    
//     const getDateCategory = (rideDate, ride) => {
//       const rideDateOnly = new Date(rideDate);
//       rideDateOnly.setHours(0, 0, 0, 0);
//       const hoursSinceDeparture = (now - rideDateOnly) / (1000 * 60 * 60);
      
//       if (postedFilter === "all") {
//         if ((ride.status === "completed" || ride.completed_at || ride.cancellation_reason) && hoursSinceDeparture > 24) {
//           return 'archived';
//         }
//       }
//       if (postedFilter === "past") {
//         return 'past';
//       }
//       if (rideDateOnly < today) return 'past';
//       if (rideDateOnly.getTime() === today.getTime()) return 'today';
//       if (rideDateOnly.getTime() === tomorrow.getTime()) return 'tomorrow';
//       return 'future';
//     };
    
//     const getPriority = (ride) => {
//       if (ride.started_at && !ride.completed_at && ride.status !== "completed") {
//         return 0;
//       }
//       return 1;
//     };
    
//     rides.sort((a, b) => {
//       const priorityA = getPriority(a);
//       const priorityB = getPriority(b);
      
//       if (priorityA !== priorityB) {
//         return priorityA - priorityB;
//       }
      
//       const dateA = new Date(a.departure_time);
//       const dateB = new Date(b.departure_time);
//       const categoryA = getDateCategory(dateA, a);
//       const categoryB = getDateCategory(dateB, b);
      
//       let categoryOrder = {};
//       if (postedFilter === "past") {
//         categoryOrder = { 'past': 0 };
//       } else {
//         categoryOrder = { 'today': 0, 'tomorrow': 1, 'future': 2, 'past': 3, 'archived': 4 };
//       }
      
//       if (categoryOrder[categoryA] !== categoryOrder[categoryB]) {
//         return categoryOrder[categoryA] - categoryOrder[categoryB];
//       }
      
//       const aTime = dateA.getTime();
//       const bTime = dateB.getTime();
      
//       if (categoryA === 'past' || categoryA === 'archived' || postedFilter === "past") {
//         return bTime - aTime;
//       } else {
//         return aTime - bTime;
//       }
//     });
    
//     if (postedFilter === "all") {
//       rides = rides.filter(ride => getDateCategory(new Date(ride.departure_time), ride) !== 'archived');
//     }
    
//     return rides;
//   };

//   const getSortedRequestedRides = () => {
//     let rides = [...requestedRides];
//     const now = new Date();
//     const today = new Date();
//     today.setHours(0, 0, 0, 0);
//     const tomorrow = new Date(today);
//     tomorrow.setDate(tomorrow.getDate() + 1);
    
//     rides = rides.map(ride => {
//       const departureTime = new Date(ride.departure_time);
//       const hoursSinceDeparture = (now - departureTime) / (1000 * 60 * 60);
      
//       if (hoursSinceDeparture > 2 && !ride.ride_started_at && ride.ride_status !== "completed" && !ride.cancellation_reason) {
//         ride.auto_cancelled = true;
//       }
//       return ride;
//     });
    
//     if (requestedFilter !== "all") {
//       rides = rides.filter((ride) => {
//         const rideTime = new Date(ride.departure_time);
//         const hoursSinceDeparture = (now - rideTime) / (1000 * 60 * 60);
//         const isAutoCancelled = (hoursSinceDeparture > 2 && !ride.ride_started_at && ride.ride_status !== "completed" && !ride.cancellation_reason);
        
//         if (requestedFilter === "completed") {
//           return ride.ride_status === "completed" || ride.completed_at;
//         }
//         if (requestedFilter === "cancelled") {
//           return ride.ride_cancelled || ride.cancellation_reason || ride.ride_status === "cancelled";
//         }
//         if (requestedFilter === "autocancelled") {
//           return isAutoCancelled || (ride.cancellation_reason && ride.cancellation_reason.includes("Auto-cancelled"));
//         }
//         if (requestedFilter === "rejected") {
//           return ride.status === "rejected";
//         }
//         if (requestedFilter === "past") {
//           const isPastRide = ride.ride_status === "completed" || 
//                             ride.completed_at || 
//                             ride.ride_cancelled || 
//                             ride.cancellation_reason || 
//                             ride.ride_status === "cancelled" ||
//                             ride.status === "rejected" ||
//                             isAutoCancelled;
//           return isPastRide;
//         }
//         return true;
//       });
//     }
    
//     if (requestedFilter === "all") {
//       rides = rides.filter((ride) => {
//         const departureTime = new Date(ride.departure_time);
//         const hoursSinceDeparture = (now - departureTime) / (1000 * 60 * 60);
        
//         const isCompletedAndOld = (ride.ride_status === "completed" || ride.completed_at) && hoursSinceDeparture > 24;
//         const isCancelledAndOld = (ride.ride_cancelled || ride.cancellation_reason || ride.ride_status === "cancelled" || ride.auto_cancelled) && hoursSinceDeparture > 24;
        
//         return !isCompletedAndOld && !isCancelledAndOld;
//       });
//     }
    
//     const getDateCategory = (rideDate) => {
//       const rideDateOnly = new Date(rideDate);
//       rideDateOnly.setHours(0, 0, 0, 0);
      
//       if (rideDateOnly < today) return 'past';
//       if (rideDateOnly.getTime() === today.getTime()) return 'today';
//       if (rideDateOnly.getTime() === tomorrow.getTime()) return 'tomorrow';
//       return 'future';
//     };
    
//     const getPriority = (ride) => {
//       if (ride.ride_started_at && ride.ride_status !== "completed") {
//         return 0;
//       }
//       return 1;
//     };
    
//     rides.sort((a, b) => {
//       const priorityA = getPriority(a);
//       const priorityB = getPriority(b);
      
//       if (priorityA !== priorityB) {
//         return priorityA - priorityB;
//       }
      
//       const dateA = new Date(a.departure_time);
//       const dateB = new Date(b.departure_time);
//       const categoryA = getDateCategory(dateA);
//       const categoryB = getDateCategory(dateB);
      
//       const categoryOrder = { 'today': 0, 'tomorrow': 1, 'future': 2, 'past': 3 };
      
//       if (categoryOrder[categoryA] !== categoryOrder[categoryB]) {
//         return categoryOrder[categoryA] - categoryOrder[categoryB];
//       }
      
//       const aTime = dateA.getTime();
//       const bTime = dateB.getTime();
      
//       if (categoryA === 'past') {
//         return bTime - aTime;
//       } else {
//         return aTime - bTime;
//       }
//     });
    
//     return rides;
//   };

//   const getStatusColor = (status, cancellationReason, isPast, ride = null) => {
//     if (ride?.status === "completed") return "#6B7280";
//     if (ride?.started_at && status === "accepted" && ride?.status !== "completed") return "#10B981";
//     if (cancellationReason && cancellationReason.includes("Auto-cancelled")) return "#9CA3AF";
//     if (status === "cancelled" || cancellationReason) return "#DC2626";
//     if (isPast && status === "accepted") return "#9CA3AF";
//     switch (status) {
//       case "accepted": case "active": return "#10B981";
//       case "pending": return "#F59E0B";
//       case "rejected": return "#DC2626";
//       case "completed": return "#6B7280";
//       default: return Colors.gray;
//     }
//   };

//   const getStatusIcon = (status, cancellationReason, isPast, ride = null) => {
//     if (ride?.status === "completed") return "checkmark-done";
//     if (ride?.started_at && status === "accepted" && ride?.status !== "completed") return "car-sport";
//     if (cancellationReason && cancellationReason.includes("Auto-cancelled")) return "timer-off";
//     if (status === "cancelled" || cancellationReason) return "close-circle";
//     if (isPast && status === "accepted") return "time-outline";
//     switch (status) {
//       case "active": case "accepted": return ride?.started_at && ride?.status !== "completed" ? "car-sport" : "checkmark-circle";
//       case "completed": return "checkmark-done";
//       case "rejected": return "close-circle";
//       case "pending": return "time";
//       default: return "ellipse";
//     }
//   };

//   const getStatusText = (status, cancellationReason, isPast, ride = null) => {
//     if (ride?.status === "completed") return "Completed";
//     if (ride?.started_at && status === "accepted" && ride?.status !== "completed") return "Ride Ongoing";
//     if (cancellationReason && cancellationReason.includes("Auto-cancelled")) return "Auto-cancelled";
//     if (status === "cancelled" || cancellationReason) return "Cancelled";
//     if (isPast && status === "accepted") return "Ride Completed";
//     if (status === "full") return "Full";
//     if (status === "active") return "Active";
//     if (status === "accepted") return "Accepted";
//     if (status === "pending") return "Pending";
//     if (status === "rejected") return "Rejected";
//     if (status === "completed") return "Completed";
//     if (isPast) return "Expired";
//     return status?.charAt(0).toUpperCase() + status?.slice(1) || "Unknown";
//   };

//   const isRideDisabled = (ride) => {
//     const now = new Date();
//     const departureTime = new Date(ride.departure_time);
//     const hoursSinceDeparture = (now - departureTime) / (1000 * 60 * 60);
    
//     return ride.status === "cancelled" || 
//            ride.status === "completed" || 
//            ride.cancellation_reason || 
//            (hoursSinceDeparture > 2 && !ride.started_at);
//   };

//   const handleTabPress = (tab) => {
//     Animated.sequence([
//       Animated.timing(tabScaleAnim, { toValue: 0.95, duration: 100, useNativeDriver: true }),
//       Animated.timing(tabScaleAnim, { toValue: 1, duration: 100, useNativeDriver: true }),
//     ]).start();
//     setActiveTab(tab);
//   };

//   const handleFilterPress = () => {
//     setTempFilter(activeTab === "posted" ? postedFilter : requestedFilter);
//     setShowFilterModal(true);
//   };

//   const applyFilter = () => {
//     if (activeTab === "posted") {
//       setPostedFilter(tempFilter);
//     } else {
//       setRequestedFilter(tempFilter);
//     }
//     setShowFilterModal(false);
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
//     const timeText = date.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", hour12: false });
//     return { dayText, timeText };
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

//   const renderProfileImage = (imageUrl, name, size = 48, style = {}) => {
//     const url = buildImageUrl(imageUrl);
//     const isSvg = isSvgImage(url);
//     if (url && isSvg) {
//       return (
//         <View style={[styles.avatarContainer, { width: size, height: size, borderRadius: size / 2 }, style]}>
//           <SvgCssUri uri={url} width={size} height={size} />
//         </View>
//       );
//     } else if (url) {
//       return (
//         <Image 
//           source={{ uri: url }} 
//           style={[styles.avatarImage, { width: size, height: size, borderRadius: size / 2 }, style]} 
//           resizeMode="cover" 
//         />
//       );
//     } else {
//       return (
//         <View style={[styles.avatarPlaceholder, { width: size, height: size, borderRadius: size / 2 }, style]}>
//           <Text style={[styles.avatarPlaceholderText, { fontSize: size / 2.5 }]}>{getInitials(name)}</Text>
//         </View>
//       );
//     }
//   };

//   const getRiderPickupLocation = (booking) => {
//     if (booking.pickup_address) {
//       return `📍 ${booking.pickup_address}`;
//     }
    
//     if (booking.intersection_pickup_lat && booking.intersection_pickup_lon) {
//       const walkDist = booking.pickup_walk_distance_m;
//       const address = addressCache[`${booking.intersection_pickup_lat},${booking.intersection_pickup_lon}`];
//       if (address) {
//         if (walkDist && walkDist > 0) {
//           return `🚩 ${address} (${walkDist}m walk from your location)`;
//         }
//         return `🚩 ${address}`;
//       }
//       if (walkDist && walkDist > 0) {
//         return `🚩 Meet point (${walkDist}m walk from your location)`;
//       }
//       return "🚩 Meet point on driver's route";
//     }
    
//     if (booking.pickup_lat && booking.pickup_lon) {
//       const address = addressCache[`${booking.pickup_lat},${booking.pickup_lon}`];
//       if (address) {
//         return `📍 ${address}`;
//       }
//       return `📍 Your pickup location`;
//     }
    
//     if (booking.origin && booking.origin !== 'null' && booking.origin !== 'undefined') {
//       return `📍 ${booking.origin.split(',')[0]}`;
//     }
    
//     return "📍 Pickup location not specified";
//   };

//   const getRiderDropoffLocation = (booking) => {
//     if (booking.dropoff_address) {
//       return `📍 ${booking.dropoff_address}`;
//     }
    
//     if (booking.intersection_drop_lat && booking.intersection_drop_lon) {
//       const walkDist = booking.drop_walk_distance_m;
//       const address = addressCache[`${booking.intersection_drop_lat},${booking.intersection_drop_lon}`];
//       if (address) {
//         if (walkDist && walkDist > 0) {
//           return `🏁 ${address} (${walkDist}m walk to destination)`;
//         }
//         return `🏁 ${address}`;
//       }
//       if (walkDist && walkDist > 0) {
//         return `🏁 Drop point (${walkDist}m walk to destination)`;
//       }
//       return "🏁 Drop point on driver's route";
//     }
    
//     if (booking.drop_lat && booking.drop_lon) {
//       const address = addressCache[`${booking.drop_lat},${booking.drop_lon}`];
//       if (address) {
//         return `📍 ${address}`;
//       }
//       return `📍 Your dropoff location`;
//     }
    
//     if (booking.destination && booking.destination !== 'null' && booking.destination !== 'undefined') {
//       return `📍 ${booking.destination.split(',')[0]}`;
//     }
    
//     return "📍 Dropoff location not specified";
//   };

//   // Fetch addresses for all bookings
//   useEffect(() => {
//     const fetchAllAddresses = async () => {
//       const allCoordinates = [];
      
//       postedRides.forEach(ride => {
//         if (ride.bookings && Array.isArray(ride.bookings)) {
//           ride.bookings.forEach(booking => {
//             if (!booking.pickup_address && booking.intersection_pickup_lat && booking.intersection_pickup_lon) {
//               const key = `${booking.intersection_pickup_lat},${booking.intersection_pickup_lon}`;
//               if (!addressCache[key] && !allCoordinates.find(c => c.key === key)) {
//                 allCoordinates.push({ key, lat: booking.intersection_pickup_lat, lng: booking.intersection_pickup_lon });
//               }
//             } else if (!booking.pickup_address && booking.pickup_lat && booking.pickup_lon) {
//               const key = `${booking.pickup_lat},${booking.pickup_lon}`;
//               if (!addressCache[key] && !allCoordinates.find(c => c.key === key)) {
//                 allCoordinates.push({ key, lat: booking.pickup_lat, lng: booking.pickup_lon });
//               }
//             }
            
//             if (!booking.dropoff_address && booking.intersection_drop_lat && booking.intersection_drop_lon) {
//               const key = `${booking.intersection_drop_lat},${booking.intersection_drop_lon}`;
//               if (!addressCache[key] && !allCoordinates.find(c => c.key === key)) {
//                 allCoordinates.push({ key, lat: booking.intersection_drop_lat, lng: booking.intersection_drop_lon });
//               }
//             } else if (!booking.dropoff_address && booking.drop_lat && booking.drop_lon) {
//               const key = `${booking.drop_lat},${booking.drop_lon}`;
//               if (!addressCache[key] && !allCoordinates.find(c => c.key === key)) {
//                 allCoordinates.push({ key, lat: booking.drop_lat, lng: booking.drop_lon });
//               }
//             }
//           });
//         }
//       });
      
//       requestedRides.forEach(booking => {
//         if (!booking.pickup_address && booking.intersection_pickup_lat && booking.intersection_pickup_lon) {
//           const key = `${booking.intersection_pickup_lat},${booking.intersection_pickup_lon}`;
//           if (!addressCache[key] && !allCoordinates.find(c => c.key === key)) {
//             allCoordinates.push({ key, lat: booking.intersection_pickup_lat, lng: booking.intersection_pickup_lon });
//           }
//         } else if (!booking.pickup_address && booking.pickup_lat && booking.pickup_lon) {
//           const key = `${booking.pickup_lat},${booking.pickup_lon}`;
//           if (!addressCache[key] && !allCoordinates.find(c => c.key === key)) {
//             allCoordinates.push({ key, lat: booking.pickup_lat, lng: booking.pickup_lon });
//           }
//         }
        
//         if (!booking.dropoff_address && booking.intersection_drop_lat && booking.intersection_drop_lon) {
//           const key = `${booking.intersection_drop_lat},${booking.intersection_drop_lon}`;
//           if (!addressCache[key] && !allCoordinates.find(c => c.key === key)) {
//             allCoordinates.push({ key, lat: booking.intersection_drop_lat, lng: booking.intersection_drop_lon });
//           }
//         } else if (!booking.dropoff_address && booking.drop_lat && booking.drop_lon) {
//           const key = `${booking.drop_lat},${booking.drop_lon}`;
//           if (!addressCache[key] && !allCoordinates.find(c => c.key === key)) {
//             allCoordinates.push({ key, lat: booking.drop_lat, lng: booking.drop_lon });
//           }
//         }
//       });
      
//       if (allCoordinates.length === 0) return;
      
//       setLoadingAddresses(true);
      
//       const batchSize = 5;
//       for (let i = 0; i < allCoordinates.length; i += batchSize) {
//         const batch = allCoordinates.slice(i, i + batchSize);
//         await Promise.all(batch.map(async (coord) => {
//           await getAddressFromCoordsGoogle(coord.lat, coord.lng);
//         }));
        
//         if (i + batchSize < allCoordinates.length) {
//           await new Promise(resolve => setTimeout(resolve, 200));
//         }
//       }
      
//       setLoadingAddresses(false);
//     };
    
//     if ((postedRides.length > 0 || requestedRides.length > 0) && !loadingAddresses) {
//       fetchAllAddresses();
//     }
//   }, [postedRides, requestedRides]);

//   const getActualBookedSeats = (ride) => {
//     if (!ride.bookings || !Array.isArray(ride.bookings)) return 0;
    
//     const activeBookings = ride.bookings.filter(bookingItem => {
//       if (bookingItem.status === 'cancelled') return false;
//       if (bookingItem.modification_request?.status === 'rejected') return false;
//       return bookingItem.status === 'accepted';
//     });
    
//     const totalBooked = activeBookings.reduce((sum, bookingItem) => {
//       if (bookingItem.modification_request?.status === 'approved') {
//         return sum + (bookingItem.modification_request.requested_seats || 0);
//       }
//       return sum + (bookingItem.seats_requested || 0);
//     }, 0);
    
//     return totalBooked;
//   };

//   const getActualAvailableSeats = (ride) => {
//     const totalSeats = ride.available_seats || ride.total_seats || 0;
//     const bookedSeats = getActualBookedSeats(ride);
//     return Math.max(0, totalSeats - bookedSeats);
//   };

//   const checkModificationAvailability = async (bookingId) => {
//     try {
//       const response = await axios.get(`${API_BASE_URL}/booking/${bookingId}/modification-available`);
//       return response.data;
//     } catch (error) {
//       console.log('Error checking modification availability:', error);
//       return { available: false, reason: 'Could not check availability' };
//     }
//   };

//   // Handle modify seats from requested rides
//   const openModifySeatsModal = async (booking) => {
//     // Check if modification is already pending
//     if (booking.modification_request && booking.modification_request.status === 'pending') {
//       showCustomAlert('Modification Pending', 'You already have a pending modification request. Please wait for driver approval.', 'warning');
//       return;
//     }
    
//     // Check if modification was already used
//     if (booking.modification_request && booking.modification_request.id !== null) {
//       showCustomAlert('Modification Already Used', 'You have already used your one-time modification for this booking.', 'info');
//       return;
//     }
    
//     // Check if modification is available
//     const availability = await checkModificationAvailability(booking.id);
//     if (!availability.available) {
//       showCustomAlert('Cannot Modify', availability.reason || 'Modification is not available for this ride at this time.', 'warning');
//       return;
//     }
    
//     // Calculate max seats
//     const otherBookedSeats = availability.other_booked_seats || 0;
//     const totalSeatsOffered = availability.total_seats || 4;
//     const maxSeats = totalSeatsOffered - otherBookedSeats;
    
//     setSelectedBookingForModification(booking);
//     setModifySeatsValue(booking.seats_requested || 1);
//     setMaxModifySeats(maxSeats);
//     setModifySeatsModalVisible(true);
//   };

//   const submitModifySeatsRequest = async () => {
//     if (!selectedBookingForModification) return;
    
//     const currentSeats = selectedBookingForModification.seats_requested || 1;
    
//     if (modifySeatsValue === currentSeats) {
//       showCustomAlert('No Change', 'Seat count is already set to this value.', 'info');
//       setModifySeatsModalVisible(false);
//       return;
//     }
    
//     if (modifySeatsValue < 1) {
//       showCustomAlert('Invalid Seats', 'Minimum 1 seat required.', 'warning');
//       return;
//     }
    
//     if (modifySeatsValue > maxModifySeats) {
//       showCustomAlert('Not Enough Seats', `Only ${maxModifySeats} seat(s) available.`, 'warning');
//       return;
//     }
    
//     setModifySeatsLoading(true);
//     try {
//       const response = await axios.post(`${API_BASE_URL}/api/v1/modifications/request/${selectedBookingForModification.id}`, {
//         requested_seats: modifySeatsValue
//       });
      
//       if (response.data.success) {
//         showCustomAlert('Request Sent', `Request to change to ${modifySeatsValue} seat(s) sent to driver.`, 'info');
//         setModifySeatsModalVisible(false);
//         onRefresh();
//       } else {
//         showCustomAlert('Error', response.data.message || 'Failed to send modification request.', 'error');
//       }
//     } catch (error) {
//       console.error('Modification request error:', error);
//       const errorMsg = error.response?.data?.detail || error.message || 'Failed to send modification request.';
//       showCustomAlert('Error', errorMsg, 'error');
//     } finally {
//       setModifySeatsLoading(false);
//     }
//   };

//   const renderPostedRideCard = (ride) => {
//     const hasPendingBookings = Array.isArray(ride.bookings) ? ride.bookings.some((b) => b.status === "pending") : false;
//     const hasPendingModifications = Array.isArray(ride.bookings) ? ride.bookings.some((b) => b.modification_request && b.modification_request.status === "pending") : false;
//     const isExpanded = expandedPostedRides[ride.id];
//     const isDisabled = isRideDisabled(ride);
//     const isAutoCancelled = ride.cancellation_reason && ride.cancellation_reason.includes("Auto-cancelled") || ride.auto_cancelled;
    
//     const actualBookedSeats = getActualBookedSeats(ride);
//     const actualAvailableSeats = getActualAvailableSeats(ride);
    
//     const startRideEnabled = canStartRide(ride);
//     const departureTime = new Date(ride.departure_time);
//     const now = new Date();
//     const minutesToDeparture = Math.ceil((departureTime - now) / (1000 * 60));
//     const minutesSinceDeparture = Math.ceil((now - departureTime) / (1000 * 60));
//     const hoursSinceDeparture = (now - departureTime) / (1000 * 60 * 60);
//     const rideStatusInfo = getRideStatusInfo(ride);
//     const cancellationInfo = getCancellationStatusDisplay(ride);
//     const hasCancelledBookings = ride.bookings?.some(b => b.status === "cancelled") || false;
//     const cancelledBookingsCount = ride.bookings?.filter(b => b.status === "cancelled")?.length || 0;
//     const isRideCompleted = ride.status === "completed" || ride.completed_at;
    
//     const pendingModifications = ride.bookings?.filter(b => 
//       b.modification_request && b.modification_request.status === "pending"
//     ) || [];
    
//     const rejectedModifications = ride.bookings?.filter(b => 
//       b.modification_request && b.modification_request.status === "rejected"
//     ) || [];
    
//     const getStartButtonText = () => {
//       if (ride?.live_session?.session_id) return 'Open Ongoing Ride';
//       if (minutesSinceDeparture > 0 && minutesSinceDeparture <= 120) {
//         return `Start Ride (${minutesSinceDeparture} min late)`;
//       }
//       if (minutesToDeparture <= 15 && minutesToDeparture > 0) {
//         return `Start Ride (in ${minutesToDeparture} min)`;
//       }
//       return 'Start Ride';
//     };
    
//     return (
//       <View key={ride.id} style={[styles.card, targetRideId === ride.id && styles.highlightRideCard]}>
//         <TouchableOpacity style={styles.cardHeader} onPress={() => togglePostedRideExpand(ride.id)} activeOpacity={0.7}>
//           <View style={styles.routeContainer}>
//             <View style={styles.locationDot}>
//               <View style={[styles.dot, { backgroundColor: Colors.success }]} />
//               <View style={styles.line} />
//               <View style={[styles.dot, { backgroundColor: Colors.secondary }]} />
//             </View>
//             <View style={styles.routeTextContainer}>
//               <Text style={styles.routeOrigin} numberOfLines={1}>{ride.origin?.split(",")[0] || "Origin"}</Text>
//               <Text style={styles.routeDestination} numberOfLines={1}>{ride.destination?.split(",")[0] || "Destination"}</Text>
//             </View>
//           </View>
//           <View style={styles.cardHeaderRight}>
//             <View style={[styles.statusBadge, { backgroundColor: rideStatusInfo.color }]}>
//               <Ionicons name={rideStatusInfo.icon} size={12} color={Colors.white} style={styles.statusIcon} />
//               <Text style={styles.statusText}>{rideStatusInfo.text}</Text>
//             </View>
//             {cancellationInfo && (
//               <View style={[styles.cancelledBadge, { backgroundColor: cancellationInfo.color }]}>
//                 <Ionicons name={cancellationInfo.icon} size={10} color="#fff" />
//                 <Text style={styles.cancelledBadgeText}>CANCELLED</Text>
//               </View>
//             )}
//             {pendingModifications.length > 0 && !cancellationInfo && (
//               <View style={styles.pendingModificationBadge}>
//                 <Ionicons name="swap" size={10} color="#fff" />
//                 <Text style={styles.pendingModificationBadgeText}>{pendingModifications.length}</Text>
//               </View>
//             )}
//             {rejectedModifications.length > 0 && !cancellationInfo && (
//               <View style={[styles.pendingModificationBadge, { backgroundColor: "#DC2626" }]}>
//                 <Ionicons name="close" size={10} color="#fff" />
//                 <Text style={styles.pendingModificationBadgeText}>{rejectedModifications.length}</Text>
//               </View>
//             )}
//             <Ionicons name={isExpanded ? "chevron-up" : "chevron-down"} size={20} color={Colors.gray} style={styles.expandIcon} />
//           </View>
//         </TouchableOpacity>

//         {isExpanded && pendingModifications.length > 0 && !cancellationInfo && (
//           <View style={styles.pendingModificationsSection}>
//             <View style={styles.pendingModificationsHeader}>
//               <Ionicons name="swap" size={18} color="#F59E0B" />
//               <Text style={styles.pendingModificationsTitle}>Pending Modification Requests ({pendingModifications.length})</Text>
//             </View>
//             {pendingModifications.map((modificationItem) => (
//               <View key={modificationItem.id} style={styles.pendingModificationCard}>
//                 <View style={styles.pendingModificationContent}>
//                   <View style={styles.pendingModificationAvatar}>
//                     {renderProfileImage(modificationItem.passenger_photo, modificationItem.passenger_name || "Rider", 40)}
//                   </View>
//                   <View style={styles.pendingModificationInfo}>
//                     <Text style={styles.pendingModificationPassengerName}>{modificationItem.passenger_name || "Rider"}</Text>
//                     <View style={styles.pendingModificationSeatChange}>
//                       <Text style={styles.oldSeatCount}>{modificationItem.modification_request.current_seats} seats</Text>
//                       <Ionicons name="arrow-forward" size={12} color="#F59E0B" />
//                       <Text style={styles.newSeatCount}>{modificationItem.modification_request.requested_seats} seats</Text>
//                     </View>
//                     <Text style={styles.pendingModificationTime}>
//                       Requested: {new Date(modificationItem.modification_request.created_at).toLocaleString()}
//                     </Text>
//                   </View>
//                 </View>
//                 <View style={styles.pendingModificationActions}>
//                   <TouchableOpacity 
//                     style={[styles.modActionBtn, styles.approveModBtn]} 
//                     onPress={() => handleModificationAction(modificationItem.modification_request.id, 'approve', modificationItem.id)}>
//                     <Ionicons name="checkmark" size={16} color="#fff" />
//                     <Text style={styles.modActionBtnText}>Approve</Text>
//                   </TouchableOpacity>
//                   <TouchableOpacity 
//                     style={[styles.modActionBtn, styles.rejectModBtn]} 
//                     onPress={() => handleModificationAction(modificationItem.modification_request.id, 'reject', modificationItem.id)}>
//                     <Ionicons name="close" size={16} color="#fff" />
//                     <Text style={styles.modActionBtnText}>Reject</Text>
//                   </TouchableOpacity>
//                 </View>
//               </View>
//             ))}
//           </View>
//         )}

//         {isExpanded && rejectedModifications.length > 0 && !cancellationInfo && (
//           <View style={[styles.pendingModificationsSection, { backgroundColor: '#FEF2F2', borderColor: '#FEE2E2' }]}>
//             <View style={styles.pendingModificationsHeader}>
//               <Ionicons name="close-circle" size={18} color="#DC2626" />
//               <Text style={[styles.pendingModificationsTitle, { color: '#DC2626' }]}>Rejected Modification Requests - Bookings Cancelled</Text>
//             </View>
//             {rejectedModifications.map((rejectedItem) => (
//               <View key={rejectedItem.id} style={[styles.pendingModificationCard, { backgroundColor: '#FFF5F5', borderColor: '#FEE2E2' }]}>
//                 <View style={styles.pendingModificationContent}>
//                   <View style={styles.pendingModificationAvatar}>
//                     {renderProfileImage(rejectedItem.passenger_photo, rejectedItem.passenger_name || "Rider", 40)}
//                   </View>
//                   <View style={styles.pendingModificationInfo}>
//                     <Text style={styles.pendingModificationPassengerName}>{rejectedItem.passenger_name || "Rider"}</Text>
//                     <View style={styles.pendingModificationSeatChange}>
//                       <Text style={[styles.oldSeatCount, { textDecorationLine: 'line-through' }]}>{rejectedItem.modification_request.current_seats} seats</Text>
//                       <Ionicons name="arrow-forward" size={12} color="#DC2626" />
//                       <Text style={[styles.newSeatCount, { color: '#DC2626', textDecorationLine: 'line-through' }]}>{rejectedItem.modification_request.requested_seats} seats</Text>
//                     </View>
//                     <Text style={[styles.pendingModificationTime, { color: '#DC2626' }]}>
//                       ❌ Rejected - Booking Cancelled
//                     </Text>
//                     <Text style={[styles.pendingModificationTime, { color: '#DC2626' }]}>
//                       Original {rejectedItem.modification_request.current_seats} seat(s) cancelled
//                     </Text>
//                     {rejectedItem.modification_request.rejection_reason && (
//                       <Text style={styles.rejectionReasonText}>Reason: {rejectedItem.modification_request.rejection_reason}</Text>
//                     )}
//                   </View>
//                 </View>
//                 <View style={styles.rejectedModificationBadge}>
//                   <Ionicons name="warning-outline" size={14} color="#DC2626" />
//                   <Text style={styles.rejectedModificationBadgeText}>Booking Cancelled • Seats Released</Text>
//                 </View>
//               </View>
//             ))}
//           </View>
//         )}

//         {cancellationInfo && (
//           <View style={styles.cancellationBanner}>
//             <Ionicons name={cancellationInfo.icon} size={18} color={cancellationInfo.color} />
//             <View style={styles.cancellationBannerText}>
//               <Text style={[styles.cancellationBannerTitle, { color: cancellationInfo.color }]}>
//                 {cancellationInfo.text}
//               </Text>
//               <Text style={styles.cancellationBannerMessage}>{cancellationInfo.message}</Text>
//             </View>
//           </View>
//         )}

//         {hasCancelledBookings && (
//           <View style={styles.cancelledBookingsSummary}>
//             <Ionicons name="warning-outline" size={14} color="#DC2626" />
//             <Text style={styles.cancelledBookingsText}>
//               {cancelledBookingsCount} booking(s) were cancelled due to ride cancellation
//             </Text>
//           </View>
//         )}

//         {isExpanded && !cancellationInfo && (
//           <View>
//             {isAutoCancelled && (
//               <View style={styles.cancellationReasonContainer}>
//                 <Ionicons name="information-circle" size={14} color="#DC2626" />
//                 <Text style={styles.cancellationReasonText}>{ride.cancellation_reason || "Ride auto-cancelled as it was not started within 2 hours of departure time."}</Text>
//               </View>
//             )}

//             <View style={styles.cardDetails}>
//               <View style={styles.detailItem}>
//                 <Ionicons name="calendar-outline" size={16} color={Colors.gray} />
//                 <Text style={styles.detailText}>{formatDate(ride.departure_time).dayText}</Text>
//                 <Text style={styles.detailTextSecondary}>{formatDate(ride.departure_time).timeText}</Text>
//               </View>
//               <View style={styles.detailDivider} />
//               <View style={styles.detailItem}>
//                 <Ionicons name="people-outline" size={16} color={Colors.gray} />
//                 <View style={{ flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap' }}>
//                   <Text style={styles.detailText}>
//                     {actualBookedSeats} / {ride.available_seats} seats
//                   </Text>
//                 </View>
//               </View>
//               <View style={styles.detailDivider} />
//               <View style={styles.detailItem}>
//                 <Ionicons name="wallet-outline" size={16} color={Colors.gray} />
//                 <Text style={styles.detailTextPrice}>₹{ride.price_per_seat}</Text>
//                 <Text style={styles.detailTextSecondary}>/seat</Text>
//               </View>
//             </View>

//             <TouchableOpacity style={styles.viewRouteBtn} onPress={() => handleViewRideDetails(ride)}>
//               <Ionicons name="map-outline" size={16} color={Colors.primary} />
//               <Text style={styles.viewRouteBtnText}>View Route Details</Text>
//             </TouchableOpacity>

//             {!isRideCompleted && !isDisabled && !ride.started_at && hoursSinceDeparture <= 2 && ride.status !== "completed" && rideStatusInfo.type !== 'auto-cancelled' && (
//               <View style={styles.driverActionWrapper}>
//                 <TouchableOpacity 
//                   style={[styles.startRideBtn, (!startRideEnabled && rideStatusInfo.type !== 'late') && styles.startRideBtnDisabled]} 
//                   onPress={() => handleStartRide(ride)} 
//                   activeOpacity={0.85} 
//                   disabled={!startRideEnabled && rideStatusInfo.type !== 'late'}>
//                   <Text style={styles.startRideBtnText}>
//                     {getStartButtonText()}
//                   </Text>
//                 </TouchableOpacity>
//                 <View style={styles.secondaryActionsRow}>
//                   <TouchableOpacity style={styles.secondaryBtn} onPress={() => handleEditRide(ride)} activeOpacity={0.85}>
//                     <Text style={styles.secondaryBtnText}>Edit Details</Text>
//                   </TouchableOpacity>
//                   <TouchableOpacity style={styles.secondaryBtn} onPress={() => cancelRide(ride.id)} activeOpacity={0.85}>
//                     <Text style={styles.secondaryBtnText}>Cancel</Text>
//                   </TouchableOpacity>
//                 </View>
//               </View>
//             )}

//             {ride.started_at && !isRideCompleted && (
//               <TouchableOpacity style={[styles.startRideBtn, { backgroundColor: "#10B981" }]} onPress={() => navigation.navigate('OngoingRideDriverScreen', { rideId: ride.id, sessionId: ride.live_session?.session_id })}>
//                 <Text style={styles.startRideBtnText}>Continue Ride</Text>
//               </TouchableOpacity>
//             )}

//             {isRideCompleted && ride.live_session?.session_id && (
//               <View style={styles.rateRidersSection}>
//                 <Text style={styles.rateSectionTitle}>Rate Your Riders</Text>
//                 {ride.bookings?.filter(rateItem => rateItem.status === "accepted" && rateItem.modification_request?.status !== "rejected").map((rateItem) => (
//                   <View key={rateItem.id} style={styles.rateRiderItem}>
//                     <View style={styles.rateRiderInfo}>
//                       {renderProfileImage(rateItem.passenger_photo, rateItem.passenger_name, 40)}
//                       <View>
//                         <Text style={styles.rateRiderName}>{rateItem.passenger_name}</Text>
//                         <Text style={styles.rateRiderSeats}>
//                           {rateItem.modification_request?.status === "approved" 
//                             ? rateItem.modification_request.requested_seats 
//                             : rateItem.seats_requested} seats
//                         </Text>
//                       </View>
//                     </View>
//                     {rateItem.driver_rating ? (
//                       <View style={styles.alreadyRatedBadge}>
//                         <Ionicons name="star" size={14} color="#F59E0B" />
//                         <Text style={styles.alreadyRatedText}>Rated {rateItem.driver_rating}/5</Text>
//                       </View>
//                     ) : (
//                       <TouchableOpacity 
//                         style={styles.rateRiderBtn}
//                         onPress={() => openRateRiderModal(rateItem, ride.live_session.session_id)}>
//                         <Text style={styles.rateRiderBtnText}>Rate</Text>
//                       </TouchableOpacity>
//                     )}
//                   </View>
//                 ))}
//               </View>
//             )}

//             {Array.isArray(ride.bookings) && ride.bookings.length > 0 && !isRideCompleted && !isAutoCancelled && (
//               <View style={styles.bookingsSection}>
//                 <View style={styles.bookingSectionHeader}>
//                   <Text style={styles.bookingsTitle}>Rider Requests ({ride.bookings.length})</Text>
//                   <View style={{ flexDirection: 'row', gap: 8, alignItems: 'center' }}>
//                     {(hasPendingBookings || hasPendingModifications) && (
//                       <View style={styles.pendingChip}>
//                         <Text style={styles.pendingChipText}>Action needed</Text>
//                       </View>
//                     )}
//                     {actualAvailableSeats > 0 && (
//                       <View style={[styles.pendingChip, { backgroundColor: '#E8F5E9' }]}>
//                         <Text style={[styles.pendingChipText, { color: '#2E7D32' }]}>
//                           {actualAvailableSeats} seats available
//                         </Text>
//                       </View>
//                     )}
//                   </View>
//                 </View>
//                 {ride.bookings.map((bookingItem) => {
//                   const bookingCancellationInfo = getCancellationStatusDisplay(bookingItem);
//                   const hasModificationRequest = bookingItem.modification_request && bookingItem.modification_request.status === "pending";
//                   const isModificationRejected = bookingItem.modification_request && bookingItem.modification_request.status === "rejected";
//                   const isModificationApproved = bookingItem.modification_request && bookingItem.modification_request.status === "approved";
//                   const riderPickupLocation = getRiderPickupLocation(bookingItem);
//                   const riderDropoffLocation = getRiderDropoffLocation(bookingItem);
                  
//                   const bookingStatus = isModificationRejected ? "cancelled" : bookingItem.status;
//                   const bookingStatusText = isModificationRejected ? "Booking Cancelled" : getStatusText(bookingItem.status, bookingItem.cancellation_reason, false, ride);
//                   const bookingStatusColor = isModificationRejected ? "#DC2626" : getStatusColor(bookingItem.status, bookingItem.cancellation_reason, false, ride);
                  
//                   const actualSeats = isModificationApproved 
//                     ? bookingItem.modification_request.requested_seats 
//                     : bookingItem.seats_requested;
                  
//                   return (
//                     <View key={bookingItem.id} style={[styles.bookingCard, targetBookingId === bookingItem.id && styles.highlightBookingCard, isModificationRejected && { opacity: 0.7, backgroundColor: '#FEF2F2' }]}>
//                       <View style={styles.bookingHeader}>
//                         <View style={styles.bookingInfo}>
//                           <TouchableOpacity onPress={() => handleViewProfile(null, bookingItem.passenger_phone, bookingItem.passenger_name || "Rider", bookingItem.passenger_photo)} activeOpacity={0.8}>
//                             {renderProfileImage(bookingItem.passenger_photo, bookingItem.passenger_name || "Rider", 40)}
//                           </TouchableOpacity>
//                           <View style={styles.bookingInfoText}>
//                             <TouchableOpacity onPress={() => handleViewProfile(null, bookingItem.passenger_phone, bookingItem.passenger_name || "Rider", bookingItem.passenger_photo)}>
//                               <Text style={styles.bookingPhone}>{bookingItem.passenger_name || bookingItem.passenger_phone || "Rider"}</Text>
//                             </TouchableOpacity>
//                             <Text style={[styles.bookingSeats, (isModificationRejected || isModificationApproved) && { fontWeight: '500' }, isModificationRejected && { textDecorationLine: 'line-through', color: '#DC2626' }]}>
//                               {actualSeats} seat{actualSeats > 1 ? "s" : ""}
//                               {isModificationApproved && " (Updated)"}
//                               {isModificationRejected && " (Cancelled)"}
//                             </Text>
                            
//                             <View style={styles.riderMiniLocation}>
//                               <Ionicons name="location" size={12} color={isModificationRejected ? "#DC2626" : "#10B981"} />
//                               <Text style={[styles.riderMiniLocationText, isModificationRejected && { color: '#DC2626' }]} numberOfLines={2}>
//                                 Pickup: {riderPickupLocation}
//                               </Text>
//                             </View>

//                             <View style={styles.riderMiniLocation}>
//                               <Ionicons name="flag" size={12} color={isModificationRejected ? "#DC2626" : "#DC2626"} />
//                               <Text style={[styles.riderMiniLocationText, isModificationRejected && { color: '#DC2626' }]} numberOfLines={2}>
//                                 Dropoff: {riderDropoffLocation}
//                               </Text>
//                             </View>
                            
//                             {(bookingItem.pickup_walk_distance_m > 0 || bookingItem.drop_walk_distance_m > 0) && !isModificationRejected && (
//                               <View style={styles.riderWalkInfo}>
//                                 <Ionicons name="walk" size={10} color="#6B7280" />
//                                 <Text style={styles.riderWalkInfoText}>
//                                   {bookingItem.pickup_walk_distance_m > 0 && `${bookingItem.pickup_walk_distance_m}m walk to pickup`}
//                                   {bookingItem.pickup_walk_distance_m > 0 && bookingItem.drop_walk_distance_m > 0 && ' • '}
//                                   {bookingItem.drop_walk_distance_m > 0 && `${bookingItem.drop_walk_distance_m}m walk from dropoff`}
//                                 </Text>
//                               </View>
//                             )}
                            
//                             {hasModificationRequest && (
//                               <View style={styles.modificationBadge}>
//                                 <Ionicons name="swap" size={10} color="#F59E0B" />
//                                 <Text style={styles.modificationBadgeText}>
//                                   Modification: {bookingItem.modification_request.current_seats} → {bookingItem.modification_request.requested_seats} seats
//                                 </Text>
//                               </View>
//                             )}
                            
//                             {isModificationApproved && (
//                               <View style={[styles.modificationBadge, { backgroundColor: '#E8F5E9' }]}>
//                                 <Ionicons name="checkmark-circle" size={10} color="#10B981" />
//                                 <Text style={[styles.modificationBadgeText, { color: '#2E7D32' }]}>
//                                   Modification Approved: {bookingItem.modification_request.current_seats} → {bookingItem.modification_request.requested_seats} seats
//                                 </Text>
//                               </View>
//                             )}
                            
//                             {isModificationRejected && (
//                               <View style={[styles.modificationBadge, { backgroundColor: '#FEE2E2' }]}>
//                                 <Ionicons name="close-circle" size={10} color="#DC2626" />
//                                 <Text style={[styles.modificationBadgeText, { color: '#DC2626' }]}>
//                                   Modification Rejected - Booking Cancelled
//                                 </Text>
//                               </View>
//                             )}
//                           </View>
//                           {!isModificationRejected && (
//                             <TouchableOpacity style={styles.chatButton} onPress={() => navigation.navigate('ChatScreen', {
//                               receiverPhone: bookingItem.passenger_phone,
//                               conversationId: `chat-${ride.id}-${bookingItem.id}`,
//                               rideId: ride.id,
//                               user: { 
//                                 name: bookingItem.passenger_name || `Rider ${bookingItem.passenger_phone?.slice(-4) || ''}`, 
//                                 tripInfo: `${ride.origin || 'Origin'} → ${ride.destination || 'Destination'}`, 
//                                 phone: bookingItem.passenger_phone,
//                                 profile_picture: bookingItem.passenger_photo
//                               }
//                             })}>
//                               <Ionicons name="chatbubbles" size={24} color={Colors.primary} />
//                             </TouchableOpacity>
//                           )}
//                         </View>
//                         <View style={[styles.bookingStatusBadge, { 
//                           backgroundColor: bookingStatus === "cancelled" ? "#FEE2E2" : bookingStatusColor + "20" 
//                         }]}>
//                           <Text style={[styles.bookingStatusText, { 
//                             color: bookingStatus === "cancelled" ? "#DC2626" : bookingStatusColor 
//                           }]}>
//                             {bookingStatusText}
//                           </Text>
//                         </View>
//                       </View>
                      
//                       {bookingCancellationInfo && (
//                         <View style={styles.bookingCancellationReason}>
//                           <Ionicons name="information-circle" size={12} color="#DC2626" />
//                           <Text style={styles.bookingCancellationReasonText}>{bookingCancellationInfo.message}</Text>
//                         </View>
//                       )}
                      
//                       {bookingItem.modification_request && bookingItem.modification_request.status === "pending" && !isDisabled && !ride.started_at && hoursSinceDeparture <= 2 && (
//                         <View style={styles.modificationActions}>
//                           <TouchableOpacity 
//                             style={[styles.modActionBtn, styles.approveModBtn]} 
//                             onPress={() => handleModificationAction(bookingItem.modification_request.id, 'approve', bookingItem.id)}>
//                             <Ionicons name="checkmark" size={16} color="#fff" />
//                             <Text style={styles.modActionBtnText}>Approve</Text>
//                           </TouchableOpacity>
//                           <TouchableOpacity 
//                             style={[styles.modActionBtn, styles.rejectModBtn]} 
//                             onPress={() => handleModificationAction(bookingItem.modification_request.id, 'reject', bookingItem.id)}>
//                             <Ionicons name="close" size={16} color="#fff" />
//                             <Text style={styles.modActionBtnText}>Reject</Text>
//                           </TouchableOpacity>
//                         </View>
//                       )}
                      
//                       {bookingItem.status === "pending" && !isDisabled && !ride.started_at && hoursSinceDeparture <= 2 && !isModificationRejected && (
//                         <View style={styles.actionRow}>
//                           <TouchableOpacity style={[styles.actionBtn, styles.acceptBtn]} onPress={() => handleBookingAction(bookingItem.id, "accept")} activeOpacity={0.8}>
//                             <Ionicons name="checkmark" size={16} color={Colors.white} /><Text style={styles.btnText}>Approve</Text>
//                           </TouchableOpacity>
//                           <TouchableOpacity style={[styles.actionBtn, styles.rejectBtn]} onPress={() => handleBookingAction(bookingItem.id, "reject")} activeOpacity={0.8}>
//                             <Ionicons name="close" size={16} color={Colors.white} /><Text style={styles.btnText}>Reject</Text>
//                           </TouchableOpacity>
//                         </View>
//                       )}
//                     </View>
//                   );
//                 })}
//               </View>
//             )}
//           </View>
//         )}

//         {cancellationInfo && isExpanded && (
//           <View style={styles.cancelledRideInfo}>
//             <Text style={styles.cancelledRideInfoTitle}>Ride Cancelled</Text>
//             <Text style={styles.cancelledRideInfoText}>
//               This ride has been cancelled. All associated bookings and modification requests have been cancelled.
//             </Text>
//           </View>
//         )}
//       </View>
//     );
//   };

//   const renderRequestedRideCard = (booking) => {
//     const isExpanded = expandedRequestedRides[booking.id];
//     const isAccepted = booking.status === "accepted";
//     const isPending = booking.status === "pending";
//     const isClosed = booking.status === "cancelled" || booking.status === "rejected";
//     const isAutoCancelled = booking.cancellation_reason && booking.cancellation_reason.includes("Auto-cancelled") || booking.auto_cancelled;
//     const isPast = isRidePast(booking.departure_time);
//     const rideHasStarted = booking.ride_started_at || booking.started_at;
//     const rideCancelled = booking.ride_status === "cancelled" || booking.cancellation_reason;
//     const cancellationInfo = getCancellationStatusDisplay(booking);
//     const isRideCompleted = booking.ride_status === "completed";
//     const isRideOngoing = booking.ride_started_at && !isRideCompleted;
    
//     const modificationRequest = booking.modification_request;
    
//     let effectiveCurrentSeats = booking.seats_requested;
//     let hasAppliedModification = false;
    
//     if (modificationRequest && modificationRequest.status === "approved") {
//         effectiveCurrentSeats = modificationRequest.requested_seats;
//         hasAppliedModification = true;
//     }
    
//     const hasModificationPending = modificationRequest && modificationRequest.status === "pending";
//     const hasModificationApproved = modificationRequest && modificationRequest.status === "approved" && !hasModificationPending;
//     const hasModificationRejected = modificationRequest && modificationRequest.status === "rejected" && !hasModificationPending;
    
//     const displayHasModificationPending = hasModificationPending;
//     const displayHasModificationApproved = hasModificationApproved && !hasModificationPending;
//     const displayHasModificationRejected = hasModificationRejected && !hasModificationPending;
    
//     const hasUsedModification = modificationRequest && modificationRequest.id !== null;
//     const canRequestModification = !hasUsedModification && 
//                                    !rideCancelled && 
//                                    !isRideCompleted && 
//                                    !rideHasStarted && 
//                                    booking.status === "accepted";
    
//     const passengerStatusInfo = getPassengerRideStatusInfo(booking);
    
//     let displayStatus = { ...passengerStatusInfo };
    
//     if (displayHasModificationPending && !rideCancelled && !isRideCompleted) {
//       displayStatus = {
//         text: "Modification Pending",
//         color: "#F59E0B",
//         icon: "swap",
//         type: "modification-pending",
//         showTrackButton: false
//       };
//     } else if (displayHasModificationApproved && !rideCancelled && !isRideCompleted) {
//       displayStatus = {
//         text: "Modification Approved",
//         color: "#10B981",
//         icon: "checkmark-circle",
//         type: "modification-approved",
//         showTrackButton: false
//       };
//     } else if (displayHasModificationRejected && !rideCancelled && !isRideCompleted) {
//       displayStatus = {
//         text: "Booking Cancelled",
//         color: "#DC2626",
//         icon: "close-circle",
//         type: "modification-rejected",
//         showTrackButton: false
//       };
//     }
    
//     const riderPickupLocation = getRiderPickupLocation(booking);
//     const riderDropoffLocation = getRiderDropoffLocation(booking);
    
//     let effectiveDisplaySeats;
//     let seatDisplayText = "";
    
//     if (displayHasModificationPending) {
//       effectiveDisplaySeats = modificationRequest.requested_seats;
//       seatDisplayText = ` (Pending: ${effectiveCurrentSeats} → ${modificationRequest.requested_seats})`;
//     } else if (displayHasModificationApproved) {
//       effectiveDisplaySeats = effectiveCurrentSeats;
//       seatDisplayText = " (Updated)";
//     } else if (displayHasModificationRejected) {
//       effectiveDisplaySeats = booking.seats_requested;
//       seatDisplayText = " (Booking Cancelled)";
//     } else {
//       effectiveDisplaySeats = effectiveCurrentSeats;
//       seatDisplayText = "";
//     }
    
//     return (
//       <View key={booking.id} style={[styles.card, targetBookingId === booking.id && styles.highlightBookingCard, displayHasModificationRejected && { opacity: 0.7, backgroundColor: '#FEF2F2' }]}>
//         <TouchableOpacity style={styles.cardHeader} onPress={() => toggleRequestedRideExpand(booking.id)} activeOpacity={0.7}>
//           <View style={styles.routeContainer}>
//             <View style={styles.locationDot}>
//               <View style={[styles.dot, { backgroundColor: Colors.success }]} />
//               <View style={styles.line} />
//               <View style={[styles.dot, { backgroundColor: Colors.secondary }]} />
//             </View>
//             <View style={styles.routeTextContainer}>
//               <Text style={styles.routeOrigin} numberOfLines={1}>
//                 {booking.origin?.split(",")[0] || "Pickup point"}
//               </Text>
//               <Text style={styles.routeDestination} numberOfLines={1}>
//                 {booking.destination?.split(",")[0] || "Drop point"}
//               </Text>
//             </View>
//           </View>
//           <View style={styles.cardHeaderRight}>
//             <View style={[styles.statusBadge, { backgroundColor: displayStatus.color }]}>
//               <Ionicons name={displayStatus.icon} size={12} color={Colors.white} style={styles.statusIcon} />
//               <Text style={styles.statusText}>{displayStatus.text}</Text>
//             </View>
//             <Ionicons name={isExpanded ? "chevron-up" : "chevron-down"} size={20} color={Colors.gray} style={styles.expandIcon} />
//           </View>
//         </TouchableOpacity>

//         {displayHasModificationPending && !rideCancelled && !isRideCompleted && (
//           <View style={styles.modificationPendingCard}>
//             <View style={styles.modificationPendingHeader}>
//               <Ionicons name="swap" size={24} color="#F59E0B" />
//               <Text style={styles.modificationPendingTitle}>Modification Request Pending</Text>
//             </View>
//             <View style={styles.modificationPendingDetails}>
//               <Text style={styles.modificationPendingText}>
//                 You requested to change from <Text style={{ fontWeight: 'bold' }}>{effectiveCurrentSeats}</Text> to <Text style={{ fontWeight: 'bold' }}>{modificationRequest.requested_seats}</Text> seats
//               </Text>
//               <Text style={styles.modificationPendingSubtext}>
//                 Waiting for driver's approval
//               </Text>
//             </View>
//           </View>
//         )}

//         {displayHasModificationApproved && !hasModificationPending && !rideCancelled && !isRideCompleted && (
//           <View style={styles.modificationApprovedCard}>
//             <View style={styles.modificationPendingHeader}>
//               <Ionicons name="checkmark-circle" size={24} color="#10B981" />
//               <Text style={[styles.modificationPendingTitle, { color: "#10B981" }]}>Modification Approved!</Text>
//             </View>
//             <View style={styles.modificationPendingDetails}>
//               <Text style={styles.modificationPendingText}>
//                 Your seats have been changed to {effectiveCurrentSeats} seats
//               </Text>
//               <Text style={styles.modificationPendingSubtext}>
//                 ✓ You have used your one-time modification
//               </Text>
//             </View>
//           </View>
//         )}

//         {displayHasModificationRejected && !hasModificationPending && !rideCancelled && !isRideCompleted && (
//           <View style={styles.modificationRejectedCard}>
//             <View style={styles.modificationPendingHeader}>
//               <Ionicons name="close-circle" size={24} color="#DC2626" />
//               <Text style={[styles.modificationPendingTitle, { color: "#DC2626" }]}>Modification Rejected - Booking Cancelled</Text>
//             </View>
//             <View style={styles.modificationPendingDetails}>
//               <Text style={styles.modificationRejectedText}>
//                 Your request to change from {modificationRequest.current_seats} to {modificationRequest.requested_seats} seats was rejected.
//               </Text>
//               <Text style={styles.modificationRejectedSubtext}>
//                 ❌ Your original booking for {modificationRequest.current_seats} seat(s) has been CANCELLED.
//               </Text>
//               <Text style={styles.modificationRejectedSubtext}>
//                 ⚠️ You cannot request another modification as one-time limit is reached.
//               </Text>
//               {modificationRequest.rejection_reason && (
//                 <Text style={styles.modificationRejectionReason}>
//                   Reason: {modificationRequest.rejection_reason}
//                 </Text>
//               )}
//             </View>
//           </View>
//         )}

//         {hasUsedModification && !hasModificationPending && !hasModificationApproved && !hasModificationRejected && !rideCancelled && !isRideCompleted && (
//           <View style={styles.modificationUsedCard}>
//             <View style={styles.modificationPendingHeader}>
//               <Ionicons name="information-circle" size={24} color="#9CA3AF" />
//               <Text style={[styles.modificationPendingTitle, { color: "#6B7280" }]}>Modification Already Used</Text>
//             </View>
//             <View style={styles.modificationPendingDetails}>
//               <Text style={styles.modificationUsedText}>
//                 You have already used your one-time modification for this booking.
//               </Text>
//               <Text style={styles.modificationUsedSubtext}>
//                 Further modifications are not allowed.
//               </Text>
//             </View>
//           </View>
//         )}

//         {(passengerStatusInfo.type === 'auto-cancelled' || isAutoCancelled) && !hasModificationPending && (
//           <View style={styles.autoCancelledBanner}>
//             <Ionicons name="timer-off" size={20} color="#9CA3AF" />
//             <Text style={styles.autoCancelledText}>This request has been auto-cancelled</Text>
//           </View>
//         )}

//         {passengerStatusInfo.type === 'pending' && !isAutoCancelled && !rideCancelled && !hasModificationPending && (
//           <View style={styles.pendingRequestBanner}>
//             <Ionicons name="time-outline" size={20} color="#F59E0B" />
//             <View>
//               <Text style={styles.pendingRequestTitle}>Waiting for driver response</Text>
//               <Text style={styles.pendingRequestSubtext}>Driver has been notified of your request</Text>
//             </View>
//           </View>
//         )}

//         {passengerStatusInfo.type === 'rejected' && !hasModificationRejected && (
//           <View style={styles.rejectedRequestBanner}>
//             <Ionicons name="close-circle" size={20} color="#DC2626" />
//             <Text style={styles.rejectedRequestText}>Your request was declined by the driver</Text>
//           </View>
//         )}

//         {passengerStatusInfo.type === 'driver-late' && !rideHasStarted && !isRideCompleted && !hasModificationPending && (
//           <View style={styles.lateDriverWarning}>
//             <Ionicons name="alert-circle" size={20} color="#EF4444" />
//             <Text style={styles.lateDriverWarningText}>Driver is running late. The ride should start soon.</Text>
//           </View>
//         )}

//         {passengerStatusInfo.type === 'start-soon' && !rideHasStarted && !isRideCompleted && !hasModificationPending && (
//           <View style={styles.startSoonWarning}>
//             <Ionicons name="time-outline" size={20} color="#F59E0B" />
//             <Text style={styles.startSoonWarningText}>Ride starting soon! Be ready at your pickup location.</Text>
//           </View>
//         )}

//         {passengerStatusInfo.type === 'ride-cancelled' && (
//           <View style={styles.cancelledRideBanner}>
//             <Ionicons name="alert-circle" size={16} color="#DC2626" />
//             <Text style={styles.cancelledRideText}>
//               This ride has been cancelled by the driver. Your booking has been cancelled.
//             </Text>
//           </View>
//         )}

//         {passengerStatusInfo.type === 'completed' && (
//           <View style={styles.completedRideBanner}>
//             <Ionicons name="checkmark-circle" size={16} color="#10B981" />
//             <Text style={styles.completedRideBannerText}>
//               This ride has been completed successfully.
//             </Text>
//           </View>
//         )}

//         {isExpanded && (
//           <View>
//             <TouchableOpacity style={styles.driverProfileRow} onPress={() => handleViewProfile(booking.driver_user_id, booking.driver_phone, booking.driver_name || "Driver", booking.driver_photo)} activeOpacity={0.8}>
//               {renderProfileImage(booking.driver_photo, booking.driver_name || "Driver", 50)}
//               <View style={styles.driverInfo}>
//                 <Text style={styles.driverName}>{booking.driver_name || "Driver"}</Text>
//                 <View style={styles.driverRatingContainer}>
//                   <Ionicons name="star" size={12} color="#F59E0B" />
//                   <Text style={styles.driverRating}>{booking.driver_rating || 4.5}</Text>
//                 </View>
//               </View>
//               <Ionicons name="chevron-forward" size={20} color={Colors.gray} />
//             </TouchableOpacity>

//             <View style={styles.requestDetails}>
//               <View style={styles.detailItem}>
//                 <Ionicons name="time-outline" size={16} color={Colors.gray} />
//                 <Text style={styles.detailText}>Travel Date</Text>
//                 <Text style={styles.detailTextSecondary}>
//                   {booking.departure_time ? `${formatDate(booking.departure_time).dayText}, ${formatDate(booking.departure_time).timeText}` : "-"}
//                 </Text>
//               </View>
//               <View style={styles.detailDivider} />
//               <View style={styles.detailItem}>
//                 <Ionicons name="people-outline" size={16} color={displayHasModificationRejected ? "#DC2626" : Colors.gray} />
//                 <Text style={[styles.detailText, displayHasModificationRejected && { color: '#DC2626', textDecorationLine: 'line-through' }]}>
//                   {effectiveDisplaySeats} seat{effectiveDisplaySeats > 1 ? "s" : ""}
//                   {seatDisplayText}
//                 </Text>
//               </View>
//             </View>

//             <View style={[styles.riderLocationsCard, displayHasModificationRejected && { opacity: 0.6, backgroundColor: '#FEF2F2' }]}>
//               <Text style={styles.riderLocationsTitle}>📍 Your Trip Details</Text>
              
//               <View style={styles.riderLocationItem}>
//                 <View style={[styles.riderLocationIcon, { backgroundColor: displayHasModificationRejected ? '#FEE2E2' : '#E8F5E9' }]}>
//                   <Ionicons name="location" size={18} color={displayHasModificationRejected ? "#DC2626" : "#10B981"} />
//                 </View>
//                 <View style={styles.riderLocationContent}>
//                   <Text style={styles.riderLocationLabel}>Pickup Point</Text>
//                   <Text style={[styles.riderLocationValue, displayHasModificationRejected && { color: '#DC2626', textDecorationLine: 'line-through' }]} numberOfLines={2}>
//                     {riderPickupLocation}
//                   </Text>
//                 </View>
//               </View>
              
//               <View style={styles.riderLocationDivider} />
              
//               <View style={styles.riderLocationItem}>
//                 <View style={[styles.riderLocationIcon, { backgroundColor: displayHasModificationRejected ? '#FEE2E2' : '#FEF2F2' }]}>
//                   <Ionicons name="flag" size={18} color={displayHasModificationRejected ? "#DC2626" : "#DC2626"} />
//                 </View>
//                 <View style={styles.riderLocationContent}>
//                   <Text style={styles.riderLocationLabel}>Dropoff Point</Text>
//                   <Text style={[styles.riderLocationValue, displayHasModificationRejected && { color: '#DC2626', textDecorationLine: 'line-through' }]} numberOfLines={2}>
//                     {riderDropoffLocation}
//                   </Text>
//                 </View>
//               </View>
//             </View>

//             {modificationRequest && !displayHasModificationPending && !rideCancelled && !isRideCompleted && (
//               <View style={styles.modificationDetailCard}>
//                 <Text style={styles.modificationDetailTitle}>Modification Request Details</Text>
//                 <View style={styles.modificationDetailRow}>
//                   <Text style={styles.modificationDetailLabel}>Status:</Text>
//                   <Text style={[styles.modificationDetailValue, { 
//                     color: displayHasModificationApproved ? "#10B981" : (displayHasModificationRejected ? "#DC2626" : "#F59E0B"),
//                     fontWeight: 'bold' 
//                   }]}>
//                     {modificationRequest.status.toUpperCase()}
//                   </Text>
//                 </View>
//                 <View style={styles.modificationDetailRow}>
//                   <Text style={styles.modificationDetailLabel}>Current Seats:</Text>
//                   <Text style={styles.modificationDetailValue}>
//                     {displayHasModificationApproved ? effectiveCurrentSeats : modificationRequest.current_seats} seats
//                   </Text>
//                 </View>
//                 <View style={styles.modificationDetailRow}>
//                   <Text style={styles.modificationDetailLabel}>Requested Seats:</Text>
//                   <Text style={[styles.modificationDetailValue, displayHasModificationRejected && { textDecorationLine: 'line-through', color: '#DC2626' }]}>
//                     {modificationRequest.requested_seats} seats
//                   </Text>
//                 </View>
//                 {modificationRequest.approved_at && displayHasModificationApproved && (
//                   <Text style={styles.modificationDetailDate}>
//                     Approved: {new Date(modificationRequest.approved_at).toLocaleString()}
//                   </Text>
//                 )}
//                 {modificationRequest.created_at && (
//                   <Text style={styles.modificationDetailDate}>
//                     Requested: {new Date(modificationRequest.created_at).toLocaleString()}
//                   </Text>
//                 )}
//                 {modificationRequest.rejection_reason && (
//                   <Text style={styles.modificationDetailReason}>
//                     Rejection Reason: {modificationRequest.rejection_reason}
//                   </Text>
//                 )}
//                 {displayHasModificationApproved && (
//                   <Text style={[styles.modificationDetailDate, { color: '#10B981', marginTop: 6 }]}>
//                     ✓ One-time modification used
//                   </Text>
//                 )}
//               </View>
//             )}

//             <TouchableOpacity style={[styles.viewRouteBtn, displayHasModificationRejected && { opacity: 0.5 }]} onPress={() => handleViewRideDetails(booking, booking)} disabled={displayHasModificationRejected}>
//               <Ionicons name="map-outline" size={16} color={displayHasModificationRejected ? Colors.gray : Colors.primary} />
//               <Text style={[styles.viewRouteBtnText, displayHasModificationRejected && { color: Colors.gray }]}>
//                 View Route Details
//               </Text>
//             </TouchableOpacity>

//             {/* MODIFY SEATS BUTTON - ONE TIME ONLY */}
//             {canRequestModification && !hasModificationPending && !hasModificationApproved && !hasModificationRejected && !displayHasModificationRejected && (
//               <TouchableOpacity 
//                 style={styles.modifySeatsBtn}
//                 onPress={() => openModifySeatsModal(booking)}>
//                 <Ionicons name="swap" size={16} color={Colors.primary} />
//                 <Text style={styles.modifySeatsBtnText}>Modify Seats (One-time)</Text>
//               </TouchableOpacity>
//             )}

//             {/* SHOW DISABLED MESSAGE IF MODIFICATION WAS ALREADY USED */}
//             {hasUsedModification && !hasModificationPending && !hasModificationRejected && !hasModificationApproved && canRequestModification === false && booking.status === "accepted" && !rideCancelled && !isRideCompleted && (
//               <View style={styles.modificationDisabledContainer}>
//                 <Ionicons name="lock-closed" size={16} color="#9CA3AF" />
//                 <Text style={styles.modificationDisabledText}>
//                   Modification not available - You have already used your one-time modification
//                 </Text>
//               </View>
//             )}

//             {passengerStatusInfo.type === 'ongoing' && booking?.live_session?.session_id && !displayHasModificationRejected && (
//               <TouchableOpacity 
//                 style={styles.trackRideBtn}
//                 onPress={() => handleTrackRide(booking)}>
//                 <Ionicons name="navigate-circle" size={20} color="#fff" />
//                 <Text style={styles.trackRideBtnText}>Track Live Ride</Text>
//               </TouchableOpacity>
//             )}

//             {isRideCompleted && !booking.driver_rating_given && booking.live_session?.session_id && !displayHasModificationRejected && (
//               <TouchableOpacity 
//                 style={styles.rateDriverBtn}
//                 onPress={() => openRateDriverModal(booking, booking.live_session.session_id)}>
//                 <Ionicons name="star-outline" size={18} color="#fff" />
//                 <Text style={styles.rateDriverBtnText}>Rate Driver</Text>
//               </TouchableOpacity>
//             )}

//             {isRideCompleted && booking.driver_rating_given && !displayHasModificationRejected && (
//               <View style={styles.alreadyRatedContainer}>
//                 <Ionicons name="star" size={16} color="#F59E0B" />
//                 <Text style={styles.alreadyRatedText}>You rated this driver {booking.driver_rating}/5</Text>
//               </View>
//             )}

//             {hasModificationPending && !rideCancelled && !isRideCompleted && (
//               <TouchableOpacity 
//                 style={styles.cancelModificationBtn}
//                 onPress={() => handleCancelModificationRequest(modificationRequest.id, booking.id)}>
//                 <Ionicons name="close-circle-outline" size={18} color="#DC2626" />
//                 <Text style={styles.cancelModificationBtnText}>Cancel Modification Request</Text>
//               </TouchableOpacity>
//             )}
            
//             {!displayHasModificationRejected && !isRideCompleted && !rideCancelled && booking.status !== "rejected" && booking.status !== "cancelled" && !isAutoCancelled && !hasModificationPending && (
//               <TouchableOpacity 
//                 style={styles.cancelBookingBtn}
//                 onPress={() => cancelBooking(booking.id)}>
//                 <Text style={styles.cancelBookingBtnText}>
//                   {booking.status === "pending" ? "Cancel Request" : "Cancel Booking"}
//                 </Text>
//               </TouchableOpacity>
//             )}
//           </View>
//         )}
//       </View>
//     );
//   };

//   if (loading && !refreshing) {
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

//   const sortedPostedRides = getSortedPostedRides();
//   const sortedRequestedRides = getSortedRequestedRides();

//   return (
//     <SafeAreaView style={styles.container}>
//       <StatusBar backgroundColor={Colors.white} barStyle="dark-content" />
//       <View style={styles.header}>
//         <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
//           <MaterialIcons name="arrow-back-ios" size={26} color={Colors.orange1} />
//         </TouchableOpacity>
//         <Text style={styles.headerTitle}>My Rides</Text>
//         <TouchableOpacity onPress={handleFilterPress} style={styles.filterIconBtn}>
//           <Ionicons name="filter" size={22} color={Colors.orange1} />
//         </TouchableOpacity>
//       </View>

//       <View style={styles.tabContainer}>
//         <TouchableOpacity style={[styles.tabButton, activeTab === "posted" && styles.activeTab]} onPress={() => handleTabPress("posted")} activeOpacity={0.8}>
//           <Ionicons name="car-sport-outline" size={18} color={activeTab === "posted" ? Colors.white : Colors.gray} style={styles.tabIcon} />
//           <Text style={[styles.tabText, activeTab === "posted" && styles.activeTabText]}>Posted</Text>
//           <View style={[styles.tabBadge, activeTab === "posted" && styles.activeTabBadge]}>
//             <Text style={[styles.tabBadgeText, activeTab === "posted" && styles.activeTabBadgeText]}>{postedRides.length}</Text>
//           </View>
//         </TouchableOpacity>
//         <TouchableOpacity style={[styles.tabButton, activeTab === "requested" && styles.activeTab]} onPress={() => handleTabPress("requested")} activeOpacity={0.8}>
//           <Ionicons name="person-outline" size={18} color={activeTab === "requested" ? Colors.white : Colors.gray} style={styles.tabIcon} />
//           <Text style={[styles.tabText, activeTab === "requested" && styles.activeTabText]}>Requested</Text>
//           <View style={[styles.tabBadge, activeTab === "requested" && styles.activeTabBadge]}>
//             <Text style={[styles.tabBadgeText, activeTab === "requested" && styles.activeTabBadgeText]}>{requestedRides.length}</Text>
//           </View>
//         </TouchableOpacity>
//       </View>

//       <ScrollView 
//         ref={scrollViewRef}
//         showsVerticalScrollIndicator={false} 
//         contentContainerStyle={styles.list} 
//         refreshControl={
//           <RefreshControl 
//             refreshing={refreshing} 
//             onRefresh={onRefresh} 
//             colors={[Colors.primary]} 
//             tintColor={Colors.primary} 
//           />
//         }
//         scrollEventThrottle={400}>
        
//         {activeTab === "posted" && (sortedPostedRides.length === 0 ? (
//           <View style={styles.emptyState}>
//             <Ionicons name="car-sport-outline" size={64} color={Colors.gray} />
//             <Text style={styles.emptyTitle}>No rides found</Text>
//             <Text style={styles.emptySubtitle}>
//               {postedFilter === "all" ? "You don't have any active rides" : 
//                postedFilter === "past" ? "No past rides found" :
//                `You don't have any ${postedFilter} rides`}
//             </Text>
//             {postedFilter === "all" && (
//               <TouchableOpacity 
//                 style={styles.viewPastRidesBtn}
//                 onPress={() => {
//                   setPostedFilter("past");
//                   setShowFilterModal(false);
//                 }}>
//                 <Text style={styles.viewPastRidesBtnText}>View Past Rides</Text>
//               </TouchableOpacity>
//             )}
//           </View>
//         ) : (
//           sortedPostedRides.map((ride, index) => {
//             const previousRide = index > 0 ? sortedPostedRides[index - 1] : null;
//             const showDateHeader = renderDateHeader(ride, previousRide);
//             const dateHeaderTitle = getDateHeaderTitle(ride.departure_time);
            
//             return (
//               <View key={ride.id}>
//                 {showDateHeader && (
//                   <View style={styles.dateSectionHeader}>
//                     <Text style={styles.dateSectionHeaderText}>{dateHeaderTitle}</Text>
//                     <View style={styles.dateSectionHeaderLine} />
//                   </View>
//                 )}
//                 {renderPostedRideCard(ride)}
//               </View>
//             );
//           })
//         ))}

//         {activeTab === "requested" && (sortedRequestedRides.length === 0 ? (
//           <View style={styles.emptyState}>
//             <Ionicons name="document-text-outline" size={64} color={Colors.gray} />
//             <Text style={styles.emptyTitle}>No requests yet</Text>
//             <Text style={styles.emptySubtitle}>{requestedFilter !== "all" ? `You don't have any ${requestedFilter} requests` : "Your booking requests will appear here"}</Text>
//           </View>
//         ) : (
//           sortedRequestedRides.map((booking, index) => {
//             const previousBooking = index > 0 ? sortedRequestedRides[index - 1] : null;
//             const showDateHeader = renderDateHeader(booking, previousBooking);
//             const dateHeaderTitle = getDateHeaderTitle(booking.departure_time);
            
//             return (
//               <View key={booking.id}>
//                 {showDateHeader && (
//                   <View style={styles.dateSectionHeader}>
//                     <Text style={styles.dateSectionHeaderText}>{dateHeaderTitle}</Text>
//                     <View style={styles.dateSectionHeaderLine} />
//                   </View>
//                 )}
//                 {renderRequestedRideCard(booking)}
//               </View>
//             );
//           })
//         ))}
        
//         <View style={styles.bottomSpacer} />
//       </ScrollView>

//       {/* Filter Modal */}
//       <Modal visible={showFilterModal} transparent animationType="fade">
//         <View style={styles.modalBackdrop}>
//           <View style={styles.filterModalContent}>
//             <View style={styles.filterModalHeader}>
//               <Text style={styles.filterModalTitle}>Filter {activeTab === "posted" ? "Posted" : "Requested"} Rides</Text>
//               <TouchableOpacity onPress={() => setShowFilterModal(false)}>
//                 <Ionicons name="close" size={24} color={Colors.gray} />
//               </TouchableOpacity>
//             </View>
            
//             <ScrollView style={styles.filterOptionsList} showsVerticalScrollIndicator={false}>
//               {activeTab === "posted" ? (
//                 <>
//                   <TouchableOpacity 
//                     style={[styles.filterOption, tempFilter === "all" && styles.filterOptionActive]} 
//                     onPress={() => setTempFilter("all")}>
//                     <View style={styles.filterOptionLeft}>
//                       <Ionicons name="apps" size={20} color={tempFilter === "all" ? Colors.primary : Colors.gray} />
//                       <Text style={[styles.filterOptionText, tempFilter === "all" && styles.filterOptionTextActive]}>All Active Rides</Text>
//                     </View>
//                     {tempFilter === "all" && <Ionicons name="checkmark-circle" size={22} color={Colors.primary} />}
//                   </TouchableOpacity>
                  
//                   <TouchableOpacity 
//                     style={[styles.filterOption, tempFilter === "completed" && styles.filterOptionActive]} 
//                     onPress={() => setTempFilter("completed")}>
//                     <View style={styles.filterOptionLeft}>
//                       <Ionicons name="checkmark-done-circle" size={20} color={tempFilter === "completed" ? Colors.primary : Colors.gray} />
//                       <Text style={[styles.filterOptionText, tempFilter === "completed" && styles.filterOptionTextActive]}>Completed</Text>
//                     </View>
//                     {tempFilter === "completed" && <Ionicons name="checkmark-circle" size={22} color={Colors.primary} />}
//                   </TouchableOpacity>
                  
//                   <TouchableOpacity 
//                     style={[styles.filterOption, tempFilter === "cancelled" && styles.filterOptionActive]} 
//                     onPress={() => setTempFilter("cancelled")}>
//                     <View style={styles.filterOptionLeft}>
//                       <Ionicons name="close-circle" size={20} color={tempFilter === "cancelled" ? Colors.primary : Colors.gray} />
//                       <Text style={[styles.filterOptionText, tempFilter === "cancelled" && styles.filterOptionTextActive]}>Cancelled</Text>
//                     </View>
//                     {tempFilter === "cancelled" && <Ionicons name="checkmark-circle" size={22} color={Colors.primary} />}
//                   </TouchableOpacity>
                  
//                   <TouchableOpacity 
//                     style={[styles.filterOption, tempFilter === "autocancelled" && styles.filterOptionActive]} 
//                     onPress={() => setTempFilter("autocancelled")}>
//                     <View style={styles.filterOptionLeft}>
//                       <Ionicons name="timer-off" size={20} color={tempFilter === "autocancelled" ? Colors.primary : Colors.gray} />
//                       <Text style={[styles.filterOptionText, tempFilter === "autocancelled" && styles.filterOptionTextActive]}>Auto-cancelled</Text>
//                     </View>
//                     {tempFilter === "autocancelled" && <Ionicons name="checkmark-circle" size={22} color={Colors.primary} />}
//                   </TouchableOpacity>
                  
//                   <TouchableOpacity 
//                     style={[styles.filterOption, tempFilter === "past" && styles.filterOptionActive]} 
//                     onPress={() => setTempFilter("past")}>
//                     <View style={styles.filterOptionLeft}>
//                       <Ionicons name="calendar" size={20} color={tempFilter === "past" ? Colors.primary : Colors.gray} />
//                       <Text style={[styles.filterOptionText, tempFilter === "past" && styles.filterOptionTextActive]}>Past Rides</Text>
//                     </View>
//                     {tempFilter === "past" && <Ionicons name="checkmark-circle" size={22} color={Colors.primary} />}
//                   </TouchableOpacity>
//                 </>
//               ) : (
//                 <>
//                   <TouchableOpacity 
//                     style={[styles.filterOption, tempFilter === "all" && styles.filterOptionActive]} 
//                     onPress={() => setTempFilter("all")}>
//                     <View style={styles.filterOptionLeft}>
//                       <Ionicons name="apps" size={20} color={tempFilter === "all" ? Colors.primary : Colors.gray} />
//                       <Text style={[styles.filterOptionText, tempFilter === "all" && styles.filterOptionTextActive]}>All Active Rides</Text>
//                     </View>
//                     {tempFilter === "all" && <Ionicons name="checkmark-circle" size={22} color={Colors.primary} />}
//                   </TouchableOpacity>
                  
//                   <TouchableOpacity 
//                     style={[styles.filterOption, tempFilter === "completed" && styles.filterOptionActive]} 
//                     onPress={() => setTempFilter("completed")}>
//                     <View style={styles.filterOptionLeft}>
//                       <Ionicons name="checkmark-done-circle" size={20} color={tempFilter === "completed" ? Colors.primary : Colors.gray} />
//                       <Text style={[styles.filterOptionText, tempFilter === "completed" && styles.filterOptionTextActive]}>Completed</Text>
//                     </View>
//                     {tempFilter === "completed" && <Ionicons name="checkmark-circle" size={22} color={Colors.primary} />}
//                   </TouchableOpacity>
                  
//                   <TouchableOpacity 
//                     style={[styles.filterOption, tempFilter === "cancelled" && styles.filterOptionActive]} 
//                     onPress={() => setTempFilter("cancelled")}>
//                     <View style={styles.filterOptionLeft}>
//                       <Ionicons name="close-circle" size={20} color={tempFilter === "cancelled" ? Colors.primary : Colors.gray} />
//                       <Text style={[styles.filterOptionText, tempFilter === "cancelled" && styles.filterOptionTextActive]}>Cancelled</Text>
//                     </View>
//                     {tempFilter === "cancelled" && <Ionicons name="checkmark-circle" size={22} color={Colors.primary} />}
//                   </TouchableOpacity>
                  
//                   <TouchableOpacity 
//                     style={[styles.filterOption, tempFilter === "autocancelled" && styles.filterOptionActive]} 
//                     onPress={() => setTempFilter("autocancelled")}>
//                     <View style={styles.filterOptionLeft}>
//                       <Ionicons name="timer-off" size={20} color={tempFilter === "autocancelled" ? Colors.primary : Colors.gray} />
//                       <Text style={[styles.filterOptionText, tempFilter === "autocancelled" && styles.filterOptionTextActive]}>Auto-cancelled</Text>
//                     </View>
//                     {tempFilter === "autocancelled" && <Ionicons name="checkmark-circle" size={22} color={Colors.primary} />}
//                   </TouchableOpacity>
                  
//                   <TouchableOpacity 
//                     style={[styles.filterOption, tempFilter === "past" && styles.filterOptionActive]} 
//                     onPress={() => setTempFilter("past")}>
//                     <View style={styles.filterOptionLeft}>
//                       <Ionicons name="calendar" size={20} color={tempFilter === "past" ? Colors.primary : Colors.gray} />
//                       <Text style={[styles.filterOptionText, tempFilter === "past" && styles.filterOptionTextActive]}>Past Rides</Text>
//                     </View>
//                     {tempFilter === "past" && <Ionicons name="checkmark-circle" size={22} color={Colors.primary} />}
//                   </TouchableOpacity>
                  
//                   <TouchableOpacity 
//                     style={[styles.filterOption, tempFilter === "rejected" && styles.filterOptionActive]} 
//                     onPress={() => setTempFilter("rejected")}>
//                     <View style={styles.filterOptionLeft}>
//                       <Ionicons name="ban" size={20} color={tempFilter === "rejected" ? Colors.primary : Colors.gray} />
//                       <Text style={[styles.filterOptionText, tempFilter === "rejected" && styles.filterOptionTextActive]}>Rejected</Text>
//                     </View>
//                     {tempFilter === "rejected" && <Ionicons name="checkmark-circle" size={22} color={Colors.primary} />}
//                   </TouchableOpacity>
//                 </>
//               )}
//             </ScrollView>
            
//             <View style={styles.filterModalActions}>
//               <TouchableOpacity style={styles.filterCancelBtn} onPress={() => setShowFilterModal(false)}>
//                 <Text style={styles.filterCancelBtnText}>Cancel</Text>
//               </TouchableOpacity>
//               <TouchableOpacity style={styles.filterApplyBtn} onPress={applyFilter}>
//                 <Text style={styles.filterApplyBtnText}>Apply</Text>
//               </TouchableOpacity>
//             </View>
//           </View>
//         </View>
//       </Modal>

//       {/* Conflict Resolution Modal */}
//       <Modal visible={conflictModalVisible} transparent animationType="fade">
//         <View style={styles.modalBackdrop}>
//           <View style={styles.conflictModalContent}>
//             <View style={styles.conflictModalHeader}>
//               <Ionicons name="alert-circle" size={48} color="#F59E0B" />
//               <Text style={styles.conflictModalTitle}>Driver's Choice Required</Text>
//             </View>
            
//             <Text style={styles.conflictModalMessage}>
//               There are two requests for this ride. Please choose which one to accept.
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
//                 <Text style={styles.conflictRequestNote}>
//                   {conflictData.modification_request.requested_seats > conflictData.modification_request.current_seats 
//                     ? `+${conflictData.modification_request.requested_seats - conflictData.modification_request.current_seats} more seat(s)` 
//                     : `${conflictData.modification_request.current_seats - conflictData.modification_request.requested_seats} fewer seat(s)`}
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
//                   disabled={resolvingConflict}>
//                   <Text style={styles.conflictModalBtnText}>
//                     {resolvingConflict ? 'Processing...' : 'Accept Modification'}
//                   </Text>
//                 </TouchableOpacity>
//               )}
//               {conflictData?.booking_request && (
//                 <TouchableOpacity 
//                   style={[styles.conflictModalBtn, styles.acceptBtn]} 
//                   onPress={() => resolveConcurrentRequest('booking', null, conflictData.booking_request.id)}
//                   disabled={resolvingConflict}>
//                   <Text style={styles.conflictModalBtnText}>
//                     {resolvingConflict ? 'Processing...' : 'Accept Booking'}
//                   </Text>
//                 </TouchableOpacity>
//               )}
//             </View>
            
//             <TouchableOpacity 
//               style={styles.conflictModalCloseBtn} 
//               onPress={() => setConflictModalVisible(false)}>
//               <Text style={styles.conflictModalCloseBtnText}>Close</Text>
//             </TouchableOpacity>
//           </View>
//         </View>
//       </Modal>

//       {/* Rating Modal */}
//       <Modal visible={ratingModalVisible} transparent animationType="fade">
//         <View style={styles.modalBackdrop}>
//           <View style={styles.modalCard}>
//             <Text style={styles.modalTitle}>
//               Rate Your {ratingType === 'rider' ? 'Rider' : 'Driver'}
//             </Text>
//             <Text style={styles.modalSub}>
//               How was your experience with {selectedRider?.rider_name || 'this person'}?
//             </Text>

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
//                 onPress={submitRating} 
//                 disabled={rating === 0}
//               >
//                 <Text style={styles.submitBtnText}>Submit Rating</Text>
//               </TouchableOpacity>
//             </View>
//           </View>
//         </View>
//       </Modal>

//       {/* Modify Seats Modal */}
//       <Modal visible={modifySeatsModalVisible} transparent animationType="fade" onRequestClose={() => setModifySeatsModalVisible(false)}>
//         <View style={styles.modalBackdrop}>
//           <View style={styles.modifySeatsModalContent}>
//             <View style={styles.modifySeatsModalHeader}>
//               <Ionicons name="swap" size={24} color={Colors.primary} />
//               <Text style={styles.modifySeatsModalTitle}>Modify Seat Request</Text>
//               <TouchableOpacity onPress={() => setModifySeatsModalVisible(false)}>
//                 <Ionicons name="close" size={24} color={Colors.gray} />
//               </TouchableOpacity>
//             </View>
            
//             <Text style={styles.modifySeatsModalSubtitle}>
//               You can request to change your seat count only once per booking.
//             </Text>
            
//             <View style={styles.modifySeatsSeatSelector}>
//               <Text style={styles.modifySeatsLabel}>Select number of seats:</Text>
//               <View style={styles.modifySeatsControls}>
//                 <TouchableOpacity 
//                   style={[styles.modifySeatsActionBtn, modifySeatsValue <= 1 && styles.modifySeatsActionBtnDisabled]}
//                   onPress={() => setModifySeatsValue(Math.max(1, modifySeatsValue - 1))}
//                   disabled={modifySeatsValue <= 1}>
//                   <Ionicons name="remove" size={24} color={modifySeatsValue <= 1 ? Colors.gray : Colors.primary} />
//                 </TouchableOpacity>
//                 <View style={styles.modifySeatsCountWrap}>
//                   <Text style={styles.modifySeatsCount}>{modifySeatsValue}</Text>
//                   <Text style={styles.modifySeatsMax}>/ {maxModifySeats} max</Text>
//                 </View>
//                 <TouchableOpacity 
//                   style={[styles.modifySeatsActionBtn, modifySeatsValue >= maxModifySeats && styles.modifySeatsActionBtnDisabled]}
//                   onPress={() => setModifySeatsValue(Math.min(maxModifySeats, modifySeatsValue + 1))}
//                   disabled={modifySeatsValue >= maxModifySeats}>
//                   <Ionicons name="add" size={24} color={modifySeatsValue >= maxModifySeats ? Colors.gray : Colors.primary} />
//                 </TouchableOpacity>
//               </View>
//             </View>
            
//             <View style={styles.modifySeatsInfo}>
//               <Ionicons name="information-circle" size={16} color="#F59E0B" />
//               <Text style={styles.modifySeatsInfoText}>
//                 Current seats: {selectedBookingForModification?.seats_requested || 1}
//               </Text>
//             </View>
            
//             <View style={styles.modifySeatsActions}>
//               <TouchableOpacity 
//                 style={[styles.modifySeatsCancelBtn]} 
//                 onPress={() => setModifySeatsModalVisible(false)}>
//                 <Text style={styles.modifySeatsCancelBtnText}>Cancel</Text>
//               </TouchableOpacity>
//               <TouchableOpacity 
//                 style={[styles.modifySeatsSubmitBtn, modifySeatsLoading && styles.modifySeatsSubmitBtnDisabled]} 
//                 onPress={submitModifySeatsRequest}
//                 disabled={modifySeatsLoading}>
//                 <Text style={styles.modifySeatsSubmitBtnText}>
//                   {modifySeatsLoading ? 'Sending...' : 'Send Request'}
//                 </Text>
//               </TouchableOpacity>
//             </View>
            
//             <Text style={styles.modifySeatsNote}>
//               ⚠️ Note: This request needs driver approval. If rejected, your booking will be cancelled.
//             </Text>
//           </View>
//         </View>
//       </Modal>

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

// // Styles remain the same as provided in the original code...
// const styles = StyleSheet.create({
//   container: { flex: 1, backgroundColor: Colors.white },
//   header: { flexDirection: "row", alignItems: "center", paddingHorizontal: 16, paddingVertical: 14, borderBottomWidth: 0.5, borderBottomColor: "#E5E7EB" },
//   backBtn: { width: 44, height: 44, justifyContent: "center" },
//   headerTitle: { ...Typography.h2, fontSize: 26, fontWeight: "700", color: Colors.primary, flex: 1, textAlign: "center" },
//   filterIconBtn: { width: 44, height: 44, justifyContent: "center", alignItems: "center" },
//   tabContainer: { flexDirection: "row", backgroundColor: Colors.white, paddingHorizontal: 16, paddingVertical: 12, borderBottomWidth: 0.5, borderBottomColor: "#E5E7EB" },
//   tabButton: { flex: 1, flexDirection: "row", alignItems: "center", justifyContent: "center", paddingVertical: 10, borderRadius: 12, backgroundColor: "#F9FAFB", marginHorizontal: 4 },
//   activeTab: { backgroundColor: Colors.primary },
//   tabIcon: { marginRight: 6 },
//   tabText: { ...Typography.button, color: Colors.gray, fontSize: 14, fontWeight: "600" },
//   activeTabText: { color: Colors.white },
//   tabBadge: { backgroundColor: Colors.gray, paddingHorizontal: 8, paddingVertical: 2, borderRadius: 10, marginLeft: 6 },
//   activeTabBadge: { backgroundColor: "rgba(255,255,255,0.3)" },
//   tabBadgeText: { fontSize: 12, fontWeight: "700", color: Colors.white },
//   activeTabBadgeText: { color: Colors.white },
//   list: { padding: 16, paddingBottom: 40 },
//   card: { padding: 14, borderRadius: 16, borderWidth: 1, borderColor: "#E5E7EB", backgroundColor: "#F9FAFB", marginBottom: 12 },
//   highlightRideCard: { borderWidth: 2, borderColor: Colors.primary },
//   highlightBookingCard: { borderWidth: 2, borderColor: Colors.primary, backgroundColor: "#FFF7ED" },
//   cardHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 12 },
//   cardHeaderRight: { flexDirection: "row", alignItems: "center", gap: 8 },
//   expandIcon: { marginLeft: 8 },
//   routeContainer: { flex: 1, flexDirection: "row", alignItems: "center" },
//   locationDot: { width: 20, alignItems: "center", marginRight: 12 },
//   dot: { width: 10, height: 10, borderRadius: 5 },
//   line: { width: 2, height: 20, backgroundColor: "#E5E7EB" },
//   routeTextContainer: { flex: 1 },
//   routeOrigin: { fontSize: 15, fontWeight: "700", color: Colors.dark, marginBottom: 4, fontFamily: FontFamily.secondary.semiBold },
//   routeDestination: { fontSize: 14, color: Colors.gray, fontFamily: FontFamily.secondary.regular },
//   statusBadge: { flexDirection: "row", alignItems: "center", paddingHorizontal: 10, paddingVertical: 5, borderRadius: 20 },
//   statusIcon: { marginRight: 4 },
//   statusText: { color: Colors.white, fontSize: 12, fontWeight: "600" },
//   cardDetails: { flexDirection: "row", alignItems: "center", backgroundColor: Colors.white, borderRadius: 12, padding: 12, marginBottom: 12 },
//   detailItem: { flex: 1, flexDirection: "row", alignItems: "center", flexWrap: "wrap" },
//   detailText: { fontSize: 13, fontWeight: "600", color: Colors.dark, marginLeft: 6, fontFamily: FontFamily.secondary.medium },
//   detailTextSecondary: { fontSize: 12, color: Colors.gray, marginLeft: 4, fontFamily: FontFamily.secondary.regular },
//   detailTextPrice: { fontSize: 14, fontWeight: "700", color: Colors.primary, marginLeft: 4, fontFamily: FontFamily.secondary.bold },
//   detailDivider: { width: 1, height: 24, backgroundColor: Colors.gray, opacity: 0.3, marginHorizontal: 8 },
//   viewRouteBtn: { flexDirection: "row", alignItems: "center", justifyContent: "center", paddingVertical: 10, marginBottom: 12, backgroundColor: "#EEF6FF", borderRadius: 12, gap: 6 },
//   viewRouteBtnText: { fontSize: 13, fontWeight: "600", color: Colors.primary },
//   driverActionWrapper: { marginBottom: 8 },
//   startRideBtn: { backgroundColor: Colors.primary, borderRadius: 14, paddingVertical: 14, alignItems: "center", justifyContent: "center", marginBottom: 10 },
//   startRideBtnDisabled: { backgroundColor: Colors.gray, opacity: 0.6 },
//   startRideBtnText: { color: Colors.white, fontSize: 15, fontWeight: "700", fontFamily: FontFamily.secondary.semiBold },
//   secondaryActionsRow: { flexDirection: "row", gap: 10 },
//   secondaryBtn: { flex: 1, borderWidth: 1, borderColor: "#D1D5DB", backgroundColor: Colors.white, borderRadius: 14, paddingVertical: 12, alignItems: "center", justifyContent: "center" },
//   secondaryBtnText: { color: Colors.dark, fontSize: 14, fontWeight: "600", fontFamily: FontFamily.secondary.medium },
//   bookingsSection: { borderTopWidth: 1, borderTopColor: "#E5E7EB", paddingTop: 12, marginTop: 6 },
//   bookingSectionHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 10 },
//   bookingsTitle: { fontSize: 14, fontWeight: "700", color: Colors.dark, fontFamily: FontFamily.secondary.semiBold },
//   pendingChip: { backgroundColor: "#FEF3C7", paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12 },
//   pendingChipText: { color: "#92400E", fontSize: 11, fontWeight: "700" },
//   bookingCard: { backgroundColor: Colors.white, borderRadius: 12, padding: 12, marginBottom: 8 },
//   bookingHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 8 },
//   bookingInfo: { flexDirection: "row", alignItems: "center", flex: 1 },
//   avatarContainer: { overflow: "hidden", backgroundColor: "#F9FAFB", borderWidth: 1, borderColor: "#E5E7EB", alignItems: "center", justifyContent: "center" },
//   avatarImage: { resizeMode: "cover" },
//   avatarPlaceholder: { backgroundColor: "#F3F4F6", alignItems: "center", justifyContent: "center" },
//   avatarPlaceholderText: { fontWeight: "700", color: Colors.primary },
//   bookingInfoText: { flex: 1, marginLeft: 12 },
//   bookingPhone: { fontSize: 15, fontWeight: "600", color: Colors.dark, fontFamily: FontFamily.secondary.semiBold },
//   bookingSeats: { fontSize: 12, color: Colors.gray, fontFamily: FontFamily.secondary.regular, marginTop: 2 },
//   chatButton: { paddingHorizontal: 8, paddingVertical: 8 },
//   bookingStatusBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12 },
//   bookingStatusText: { fontSize: 12, fontWeight: "600" },
//   actionRow: { flexDirection: "row", marginTop: 12 },
//   actionBtn: { flex: 1, flexDirection: "row", alignItems: "center", justifyContent: "center", paddingVertical: 10, borderRadius: 10, marginHorizontal: 4 },
//   acceptBtn: { backgroundColor: Colors.success },
//   rejectBtn: { backgroundColor: Colors.error },
//   btnText: { color: Colors.white, fontWeight: "600", marginLeft: 6, fontSize: 14 },
//   modificationBadge: { flexDirection: "row", alignItems: "center", backgroundColor: "#FEF3C7", paddingHorizontal: 6, paddingVertical: 2, borderRadius: 8, marginTop: 4, gap: 4 },
//   modificationBadgeText: { fontSize: 10, color: "#92400E", fontWeight: "500" },
//   modificationActions: { flexDirection: "row", marginTop: 10, gap: 8 },
//   modActionBtn: { flex: 1, flexDirection: "row", alignItems: "center", justifyContent: "center", paddingVertical: 8, borderRadius: 8, gap: 6 },
//   approveModBtn: { backgroundColor: "#10B981" },
//   rejectModBtn: { backgroundColor: "#EF4444" },
//   modActionBtnText: { color: "#fff", fontSize: 13, fontWeight: "600" },
//   rateRidersSection: { marginTop: 8, paddingTop: 12, borderTopWidth: 1, borderTopColor: "#E5E7EB" },
//   rateSectionTitle: { fontSize: 14, fontWeight: "700", color: Colors.dark, marginBottom: 10, fontFamily: FontFamily.secondary.semiBold },
//   rateRiderItem: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: "#F0F0F0" },
//   rateRiderInfo: { flexDirection: "row", alignItems: "center", gap: 12 },
//   rateRiderName: { fontSize: 14, fontWeight: "600", color: Colors.dark },
//   rateRiderSeats: { fontSize: 11, color: Colors.gray, marginTop: 2 },
//   rateRiderBtn: { backgroundColor: Colors.primary, paddingHorizontal: 16, paddingVertical: 6, borderRadius: 20 },
//   rateRiderBtnText: { color: "#fff", fontSize: 12, fontWeight: "600" },
//   alreadyRatedBadge: { flexDirection: "row", alignItems: "center", gap: 4, backgroundColor: "#F3F4F6", paddingHorizontal: 10, paddingVertical: 6, borderRadius: 20 },
//   alreadyRatedText: { fontSize: 11, color: Colors.gray, fontWeight: "500" },
//   rateDriverBtn: { backgroundColor: Colors.primary, borderRadius: 14, paddingVertical: 12, alignItems: "center", justifyContent: "center", marginTop: 8, flexDirection: "row", gap: 8 },
//   rateDriverBtnText: { color: "#fff", fontSize: 14, fontWeight: "600" },
//   driverProfileRow: { flexDirection: "row", alignItems: "center", backgroundColor: Colors.white, borderRadius: 12, padding: 12, marginBottom: 12 },
//   driverInfo: { flex: 1, marginLeft: 12 },
//   driverName: { fontSize: 16, fontWeight: "700", color: Colors.dark, fontFamily: FontFamily.secondary.semiBold },
//   driverRatingContainer: { flexDirection: "row", alignItems: "center", marginTop: 4, gap: 4 },
//   driverRating: { fontSize: 12, color: Colors.gray, fontFamily: FontFamily.secondary.regular },
//   requestDetails: { flexDirection: "row", alignItems: "center", backgroundColor: Colors.white, borderRadius: 12, padding: 12, marginBottom: 12 },
//   emptyState: { alignItems: "center", justifyContent: "center", paddingVertical: 60, paddingHorizontal: 20 },
//   emptyTitle: { fontSize: 20, fontWeight: "700", color: Colors.primary, marginTop: 16, fontFamily: FontFamily.secondary.bold },
//   emptySubtitle: { fontSize: 14, color: Colors.gray, marginTop: 8, textAlign: "center", fontFamily: FontFamily.secondary.regular },
//   bottomSpacer: { height: 30 },
//   loaderContainer: { flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: Colors.white },
//   cancellationReasonContainer: { flexDirection: "row", alignItems: "center", backgroundColor: "#FEF2F2", padding: 8, borderRadius: 8, marginBottom: 10, gap: 6 },
//   cancellationReasonText: { fontSize: 11, color: "#DC2626", flex: 1 },
//   cancelledBadge: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 12, marginLeft: 6, gap: 4 },
//   cancelledBadgeText: { color: '#fff', fontSize: 10, fontWeight: '700' },
//   cancellationBanner: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#FEF2F2', padding: 12, borderRadius: 12, marginBottom: 12, gap: 12, borderWidth: 1, borderColor: '#FEE2E2' },
//   cancellationBannerText: { flex: 1 },
//   cancellationBannerTitle: { fontSize: 14, fontWeight: '700', marginBottom: 2 },
//   cancellationBannerMessage: { fontSize: 12, color: '#6B7280' },
//   cancelledBookingsSummary: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#FEF2F2', padding: 8, borderRadius: 8, marginBottom: 12, gap: 6 },
//   cancelledBookingsText: { fontSize: 11, color: '#DC2626', flex: 1 },
//   cancelledRideInfo: { backgroundColor: '#F9FAFB', padding: 16, borderRadius: 12, alignItems: 'center', marginTop: 8 },
//   cancelledRideInfoTitle: { fontSize: 16, fontWeight: '700', color: '#DC2626', marginBottom: 8 },
//   cancelledRideInfoText: { fontSize: 13, color: '#6B7280', textAlign: 'center' },
//   cancelledRideBanner: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#FEF2F2', padding: 10, borderRadius: 8, marginBottom: 12, gap: 8, borderWidth: 1, borderColor: '#FEE2E2' },
//   cancelledRideText: { fontSize: 12, color: '#DC2626', flex: 1, fontWeight: '500' },
//   bookingCancellationReason: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#FEF2F2', padding: 6, borderRadius: 6, marginTop: 6, gap: 4 },
//   bookingCancellationReasonText: { fontSize: 10, color: '#DC2626', flex: 1 },
//   modalBackdrop: { flex: 1, backgroundColor: "rgba(17,24,39,0.45)", justifyContent: "center", alignItems: "center", padding: 20 },
//   modalCard: { backgroundColor: "#fff", borderRadius: 24, padding: 20, alignItems: "center", width: "90%" },
//   modalTitle: { fontSize: 22, fontWeight: "700", color: "#111827", textAlign: "center", marginTop: 12 },
//   modalSub: { fontSize: 14, color: "#6B7280", textAlign: "center", marginTop: 8, marginBottom: 18 },
//   starsRow: { flexDirection: "row", justifyContent: "center", marginBottom: 18 },
//   feedbackInput: { minHeight: 100, borderWidth: 1, borderColor: "#E5E7EB", borderRadius: 16, padding: 14, color: "#111827", fontSize: 14, width: "100%", textAlignVertical: "top" },
//   modalActions: { flexDirection: "row", gap: 10, marginTop: 18, width: "100%" },
//   skipBtn: { flex: 1, borderWidth: 1, borderColor: "#D1D5DB", borderRadius: 999, paddingVertical: 14, alignItems: "center" },
//   skipBtnText: { color: "#6B7280", fontWeight: "600" },
//   submitBtn: { flex: 1, backgroundColor: Colors.primary, borderRadius: 999, paddingVertical: 14, alignItems: "center" },
//   submitBtnText: { color: "#fff", fontWeight: "700" },
//   modificationStatusBadge: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 12, marginLeft: 6, gap: 4 },
//   modificationStatusText: { color: '#fff', fontSize: 10, fontWeight: '700' },
//   modificationRequestBanner: { marginTop: 8, marginBottom: 8, padding: 12, borderRadius: 12, borderWidth: 1, borderColor: '#FEF3C7' },
//   modificationRequestBannerContent: { flexDirection: 'row', alignItems: 'center', gap: 12 },
//   modificationRequestBannerText: { flex: 1 },
//   modificationRequestBannerTitle: { fontSize: 14, fontWeight: '700', marginBottom: 2 },
//   modificationRequestBannerSubtitle: { fontSize: 12, color: '#6B7280' },
//   modificationDetailCard: { backgroundColor: '#F9FAFB', borderRadius: 12, padding: 12, marginBottom: 12, borderWidth: 1, borderColor: '#E5E7EB' },
//   modificationDetailTitle: { fontSize: 13, fontWeight: '600', color: '#374151', marginBottom: 8 },
//   modificationDetailStatus: { fontWeight: '700', marginLeft: 4 },
//   modificationDetailRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 4 },
//   modificationDetailLabel: { fontSize: 12, color: '#6B7280' },
//   modificationDetailValue: { fontSize: 12, fontWeight: '600', color: '#374151' },
//   modificationDetailDate: { fontSize: 10, color: '#9CA3AF', marginTop: 6 },
//   modificationDetailReason: { fontSize: 11, color: '#DC2626', marginTop: 6, fontStyle: 'italic' },
//   conflictModalContent: { backgroundColor: "#fff", borderRadius: 24, padding: 20, width: "90%", maxHeight: "85%" },
//   conflictModalHeader: { alignItems: "center", marginBottom: 16 },
//   conflictModalTitle: { fontSize: 20, fontWeight: "700", color: Colors.dark, marginTop: 12, textAlign: "center" },
//   conflictModalMessage: { fontSize: 14, color: Colors.gray, textAlign: "center", marginBottom: 20, lineHeight: 20 },
//   conflictRequestCard: { backgroundColor: "#F9FAFB", borderRadius: 16, padding: 16, marginBottom: 12, borderWidth: 1, borderColor: "#E5E7EB" },
//   conflictRequestHeader: { flexDirection: "row", alignItems: "center", gap: 12, marginBottom: 12 },
//   conflictRequestTitle: { fontSize: 16, fontWeight: "700", color: Colors.dark },
//   conflictRequestDetails: { fontSize: 14, color: "#4B5563", marginBottom: 4 },
//   conflictRequestNote: { fontSize: 12, color: "#F59E0B", marginTop: 6, fontStyle: "italic" },
//   conflictModalSeatsInfo: { fontSize: 13, color: Colors.gray, textAlign: "center", marginBottom: 20, fontWeight: "600" },
//   conflictModalButtons: { flexDirection: "row", gap: 12, marginBottom: 12 },
//   conflictModalBtn: { flex: 1, paddingVertical: 14, borderRadius: 12, alignItems: "center" },
//   conflictModalBtnText: { color: "#fff", fontWeight: "700", fontSize: 14 },
//   conflictModalCloseBtn: { paddingVertical: 12, alignItems: "center", borderRadius: 12, backgroundColor: "#F3F4F6" },
//   conflictModalCloseBtnText: { color: Colors.dark, fontWeight: "600" },
//   pendingModificationBadge: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#F59E0B', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 12, marginLeft: 6, gap: 4 },
//   pendingModificationBadgeText: { color: '#fff', fontSize: 10, fontWeight: '700' },
//   pendingModificationsSection: { backgroundColor: '#FFFBEB', borderRadius: 12, padding: 12, marginBottom: 12, borderWidth: 1, borderColor: '#FDE68A' },
//   pendingModificationsHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 12 },
//   pendingModificationsTitle: { fontSize: 14, fontWeight: '700', color: '#92400E' },
//   pendingModificationCard: { backgroundColor: '#fff', borderRadius: 12, padding: 12, marginBottom: 8, borderWidth: 1, borderColor: '#FDE68A' },
//   pendingModificationContent: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
//   pendingModificationAvatar: { marginRight: 12 },
//   pendingModificationInfo: { flex: 1 },
//   pendingModificationPassengerName: { fontSize: 14, fontWeight: '600', color: Colors.dark, marginBottom: 4 },
//   pendingModificationSeatChange: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 4 },
//   oldSeatCount: { fontSize: 12, color: '#DC2626', textDecorationLine: 'line-through' },
//   newSeatCount: { fontSize: 12, color: '#10B981', fontWeight: 'bold' },
//   pendingModificationTime: { fontSize: 10, color: '#B45309', opacity: 0.7 },
//   pendingModificationActions: { flexDirection: 'row', gap: 8 },
//   modificationApprovedBanner: { marginTop: 8, marginBottom: 8, padding: 12, borderRadius: 12, borderWidth: 1, borderColor: '#10B981' },
//   modificationRejectedBanner: { marginTop: 8, marginBottom: 8, padding: 12, borderRadius: 12, borderWidth: 1, borderColor: '#DC2626' },
//   modificationRejectionReason: { fontSize: 11, color: '#DC2626', marginTop: 4, fontStyle: 'italic' },
//   cancelModificationBtn: { marginTop: 12, backgroundColor: '#FEF2F2', paddingVertical: 10, borderRadius: 8, borderWidth: 1, borderColor: '#EF4444', alignItems: 'center', flexDirection: 'row', justifyContent: 'center', gap: 6 },
//   cancelModificationBtnText: { color: '#EF4444', fontWeight: '600', fontSize: 13 },
//   completedRideBanner: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#E8F5E9', padding: 10, borderRadius: 8, marginBottom: 12, gap: 8, borderWidth: 1, borderColor: '#C8E6C9' },
//   completedRideBannerText: { fontSize: 12, color: '#2E7D32', flex: 1, fontWeight: '500' },
//   completedRideDetailsCard: { backgroundColor: '#F8FAFC', borderRadius: 12, padding: 12, marginBottom: 12, borderWidth: 1, borderColor: '#E5E7EB' },
//   completedDetailsTitle: { fontSize: 13, fontWeight: '700', color: Colors.dark, marginBottom: 8 },
//   completedDetailsRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 4 },
//   completedDetailsLabel: { fontSize: 12, color: '#6B7280' },
//   completedDetailsValue: { fontSize: 12, fontWeight: '600', color: '#184080' },
//   modificationStatusMessageCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFFBEB', paddingHorizontal: 10, paddingVertical: 8, borderRadius: 8, marginTop: 8, marginBottom: 4, gap: 8, borderWidth: 1, borderColor: '#FDE68A' },
//   modificationStatusMessageText: { fontSize: 12, color: '#B45309', fontWeight: '500', flex: 1 },
//   lateDriverWarning: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#FEF2F2', paddingHorizontal: 12, paddingVertical: 10, borderRadius: 10, marginTop: 8, marginBottom: 8, gap: 10, borderWidth: 1, borderColor: '#FEE2E2' },
//   lateDriverWarningText: { fontSize: 13, color: '#DC2626', fontWeight: '500', flex: 1 },
//   startSoonWarning: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#FEF3C7', paddingHorizontal: 12, paddingVertical: 10, borderRadius: 10, marginTop: 8, marginBottom: 8, gap: 10, borderWidth: 1, borderColor: '#FDE68A' },
//   startSoonWarningText: { fontSize: 13, color: '#92400E', fontWeight: '500', flex: 1 },
//   alreadyRatedContainer: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, backgroundColor: '#F3F4F6', paddingVertical: 12, borderRadius: 14, marginTop: 8 },
//   trackRideBtn: { backgroundColor: "#10B981", borderRadius: 14, paddingVertical: 14, alignItems: "center", justifyContent: "center", flexDirection: "row", gap: 8, marginTop: 8, marginBottom: 8, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4, elevation: 3 },
//   trackRideBtnText: { color: "#fff", fontSize: 15, fontWeight: "700" },
//   riderLocationsCard: { backgroundColor: '#F8FAFC', borderRadius: 12, padding: 12, marginBottom: 12, borderWidth: 1, borderColor: '#E5E7EB' },
//   riderLocationsTitle: { fontSize: 13, fontWeight: '700', color: Colors.dark, marginBottom: 10 },
//   riderLocationItem: { flexDirection: 'row', alignItems: 'flex-start', gap: 10 },
//   riderLocationIcon: { width: 28, height: 28, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
//   riderLocationContent: { flex: 1 },
//   riderLocationLabel: { fontSize: 11, color: Colors.gray, marginBottom: 2 },
//   riderLocationValue: { fontSize: 13, fontWeight: '500', color: Colors.dark },
//   riderLocationDivider: { height: 1, backgroundColor: '#E5E7EB', marginVertical: 10, marginLeft: 38 },
//   riderMiniLocation: { flexDirection: 'row', alignItems: 'flex-start', gap: 4, marginTop: 4 },
//   riderMiniLocationText: { fontSize: 11, color: '#6B7280', flex: 1, lineHeight: 16 },
//   riderExpandedDetails: { marginTop: 12, paddingTop: 12, borderTopWidth: 1, borderTopColor: '#EEF2F7' },
//   riderLocationDetailCard: { backgroundColor: '#F9FAFB', borderRadius: 10, padding: 12, marginBottom: 10 },
//   riderLocationDetailHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 8 },
//   riderLocationDetailTitle: { fontSize: 13, fontWeight: '600', color: Colors.dark },
//   riderLocationDetailText: { fontSize: 13, color: '#374151', marginLeft: 24, lineHeight: 18 },
//   riderLocationWalkDistance: { fontSize: 10, color: '#6B7280', marginTop: 4, fontStyle: 'italic' },
//   cancelBookingBtn: { marginTop: 12, backgroundColor: '#FEF2F2', paddingVertical: 12, borderRadius: 12, alignItems: 'center', borderWidth: 1, borderColor: '#EF4444' },
//   cancelBookingBtnText: { color: '#EF4444', fontWeight: '700', fontSize: 14 },
//   autoCancelledBanner: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#F3F4F6', padding: 10, borderRadius: 8, marginBottom: 10, gap: 8 },
//   autoCancelledText: { fontSize: 12, color: '#6B7280', flex: 1 },
//   pendingRequestBanner: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#FEF3C7', padding: 12, borderRadius: 10, marginBottom: 12, gap: 12, borderWidth: 1, borderColor: '#FDE68A' },
//   pendingRequestTitle: { fontSize: 14, fontWeight: '600', color: '#92400E' },
//   pendingRequestSubtext: { fontSize: 12, color: '#B45309', marginTop: 2 },
//   rejectedRequestBanner: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#FEF2F2', padding: 10, borderRadius: 8, marginBottom: 10, gap: 8, borderWidth: 1, borderColor: '#FEE2E2' },
//   rejectedRequestText: { fontSize: 12, color: '#DC2626', flex: 1 },
//   filterModalContent: { backgroundColor: "#fff", borderRadius: 28, padding: 0, width: "100%", maxWidth: 340, maxHeight: "80%", overflow: "hidden", shadowColor: "#000", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.25, shadowRadius: 4, elevation: 5 },
//   filterModalHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", paddingHorizontal: 20, paddingVertical: 16, borderBottomWidth: 1, borderBottomColor: "#E5E7EB", backgroundColor: "#fff" },
//   filterModalTitle: { fontSize: 18, fontWeight: "700", color: Colors.dark },
//   filterOptionsList: { maxHeight: 400, paddingHorizontal: 8 },
//   filterOption: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", paddingVertical: 14, paddingHorizontal: 12, borderRadius: 12, marginVertical: 4 },
//   filterOptionLeft: { flexDirection: "row", alignItems: "center", gap: 12 },
//   filterOptionActive: { backgroundColor: "#EEF6FF" },
//   filterOptionText: { fontSize: 15, color: Colors.dark, fontWeight: "500" },
//   filterOptionTextActive: { color: Colors.primary, fontWeight: "600" },
//   filterModalActions: { flexDirection: "row", gap: 12, padding: 16, borderTopWidth: 1, borderTopColor: "#E5E7EB", backgroundColor: "#fff" },
//   filterCancelBtn: { flex: 1, paddingVertical: 12, borderRadius: 12, borderWidth: 1, borderColor: "#D1D5DB", alignItems: "center", backgroundColor: "#fff" },
//   filterCancelBtnText: { color: Colors.gray, fontWeight: "600", fontSize: 15 },
//   filterApplyBtn: { flex: 1, paddingVertical: 12, borderRadius: 12, backgroundColor: Colors.primary, alignItems: "center", shadowColor: Colors.primary, shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.2, shadowRadius: 4, elevation: 3 },
//   filterApplyBtnText: { color: "#fff", fontWeight: "700", fontSize: 15 },
//   riderWalkInfo: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 3 },
//   riderWalkInfoText: { fontSize: 10, color: '#9CA3AF' },
//   navigateLocationBtnSmall: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 6, paddingVertical: 4, paddingHorizontal: 8, backgroundColor: '#F3F4F6', borderRadius: 12, alignSelf: 'flex-start' },
//   navigateLocationBtnSmallText: { fontSize: 10, color: '#6B7280', fontWeight: '500' },
//   riderLocationDetailCoords: { fontSize: 10, color: '#9CA3AF', marginTop: 4 },
//   dateSectionHeader: { flexDirection: 'row', alignItems: 'center', marginTop: 8, marginBottom: 12, paddingHorizontal: 4 },
//   dateSectionHeaderText: { fontSize: 16, fontWeight: '700', color: Colors.primary, backgroundColor: Colors.white, paddingRight: 12, fontFamily: FontFamily.secondary.bold },
//   dateSectionHeaderLine: { flex: 1, height: 1, backgroundColor: '#E5E7EB' },
//   viewPastRidesBtn: { backgroundColor: "#EEF6FF", paddingHorizontal: 20, paddingVertical: 10, borderRadius: 20, marginTop: 16 },
//   viewPastRidesBtnText: { color: Colors.primary, fontWeight: "600", fontSize: 14 },
  
//   // Modification styles for Requested Rides
//   modificationPendingCard: {
//     backgroundColor: '#FFFBEB',
//     borderRadius: 12,
//     padding: 12,
//     marginBottom: 12,
//     borderWidth: 1,
//     borderColor: '#FDE68A',
//   },
//   modificationPendingHeader: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     gap: 10,
//     marginBottom: 8,
//   },
//   modificationPendingTitle: {
//     fontSize: 14,
//     fontWeight: '700',
//     color: '#92400E',
//   },
//   modificationPendingDetails: {
//     paddingLeft: 34,
//   },
//   modificationPendingText: {
//     fontSize: 13,
//     color: '#78350F',
//     marginBottom: 4,
//   },
//   modificationPendingSubtext: {
//     fontSize: 11,
//     color: '#B45309',
//   },
//   modificationApprovedCard: {
//     backgroundColor: '#E8F5E9',
//     borderRadius: 12,
//     padding: 12,
//     marginBottom: 12,
//     borderWidth: 1,
//     borderColor: '#C8E6C9',
//   },
//   modificationRejectedCard: {
//     backgroundColor: '#FEF2F2',
//     borderRadius: 12,
//     padding: 12,
//     marginBottom: 12,
//     borderWidth: 1,
//     borderColor: '#FEE2E2',
//   },
//   modificationRejectedText: {
//     fontSize: 13,
//     color: '#991B1B',
//     marginBottom: 4,
//   },
//   modificationRejectedSubtext: {
//     fontSize: 11,
//     color: '#DC2626',
//   },
//   modificationCancelledNotice: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     gap: 8,
//     marginTop: 10,
//     paddingTop: 8,
//     borderTopWidth: 1,
//     borderTopColor: '#FEE2E2',
//   },
//   modificationCancelledNoticeText: {
//     fontSize: 12,
//     color: '#DC2626',
//     fontWeight: '500',
//     flex: 1,
//   },
//   timeWarningBadge: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     backgroundColor: '#F59E0B',
//     paddingHorizontal: 8,
//     paddingVertical: 4,
//     borderRadius: 12,
//     gap: 4,
//   },
//   timeWarningBadgeText: {
//     color: '#fff',
//     fontSize: 10,
//     fontWeight: '600',
//   },
//   upcomingBadge: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     backgroundColor: '#2457A6',
//     paddingHorizontal: 8,
//     paddingVertical: 4,
//     borderRadius: 12,
//     gap: 4,
//   },
//   upcomingBadgeText: {
//     color: '#fff',
//     fontSize: 10,
//     fontWeight: '600',
//   },
//   rejectionReasonText: {
//     fontSize: 11,
//     color: '#DC2626',
//     marginTop: 4,
//     fontStyle: 'italic',
//   },
//   rejectedModificationBadge: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     justifyContent: 'center',
//     backgroundColor: '#FEF2F2',
//     paddingVertical: 8,
//     paddingHorizontal: 12,
//     borderRadius: 8,
//     marginTop: 8,
//     gap: 6,
//     borderWidth: 1,
//     borderColor: '#FEE2E2',
//   },
//   rejectedModificationBadgeText: {
//     fontSize: 12,
//     color: '#DC2626',
//     fontWeight: '600',
//   },
//   modifySeatsBtn: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     justifyContent: 'center',
//     paddingVertical: 12,
//     borderRadius: 12,
//     borderWidth: 1,
//     borderColor: Colors.primary,
//     backgroundColor: '#EEF6FF',
//     marginTop: 8,
//     gap: 8,
//   },
//   modifySeatsBtnText: {
//     fontSize: 14,
//     fontWeight: '600',
//     color: Colors.primary,
//   },
//   modificationUsedCard: {
//     backgroundColor: '#F3F4F6',
//     borderRadius: 12,
//     padding: 12,
//     marginBottom: 12,
//     borderWidth: 1,
//     borderColor: '#E5E7EB',
//   },
//   modificationUsedText: {
//     fontSize: 13,
//     color: '#6B7280',
//     marginBottom: 4,
//   },
//   modificationUsedSubtext: {
//     fontSize: 11,
//     color: '#9CA3AF',
//   },
//   modificationDisabledContainer: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     backgroundColor: '#F3F4F6',
//     padding: 12,
//     borderRadius: 10,
//     marginTop: 8,
//     gap: 10,
//   },
//   modificationDisabledText: {
//     fontSize: 12,
//     color: '#6B7280',
//     flex: 1,
//   },
//   // Modify Seats Modal Styles
//   modifySeatsModalContent: {
//     backgroundColor: '#fff',
//     borderRadius: 24,
//     padding: 20,
//     width: '90%',
//     maxWidth: 400,
//   },
//   modifySeatsModalHeader: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     justifyContent: 'space-between',
//     marginBottom: 16,
//   },
//   modifySeatsModalTitle: {
//     fontSize: 20,
//     fontWeight: '700',
//     color: Colors.dark,
//     flex: 1,
//     marginLeft: 12,
//   },
//   modifySeatsModalSubtitle: {
//     fontSize: 14,
//     color: '#6B7280',
//     marginBottom: 24,
//     textAlign: 'center',
//   },
//   modifySeatsSeatSelector: {
//     marginBottom: 20,
//   },
//   modifySeatsLabel: {
//     fontSize: 14,
//     fontWeight: '600',
//     color: Colors.dark,
//     marginBottom: 12,
//   },
//   modifySeatsControls: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     justifyContent: 'center',
//     gap: 30,
//   },
//   modifySeatsActionBtn: {
//     width: 48,
//     height: 48,
//     borderRadius: 24,
//     backgroundColor: '#F3F4F6',
//     alignItems: 'center',
//     justifyContent: 'center',
//     borderWidth: 1,
//     borderColor: '#E5E7EB',
//   },
//   modifySeatsActionBtnDisabled: {
//     opacity: 0.5,
//   },
//   modifySeatsCountWrap: {
//     alignItems: 'center',
//   },
//   modifySeatsCount: {
//     fontSize: 36,
//     fontWeight: '800',
//     color: Colors.primary,
//   },
//   modifySeatsMax: {
//     fontSize: 12,
//     color: '#6B7280',
//     marginTop: 4,
//   },
//   modifySeatsInfo: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     backgroundColor: '#FEF3C7',
//     padding: 12,
//     borderRadius: 12,
//     marginBottom: 20,
//     gap: 8,
//   },
//   modifySeatsInfoText: {
//     fontSize: 13,
//     color: '#92400E',
//     flex: 1,
//   },
//   modifySeatsActions: {
//     flexDirection: 'row',
//     gap: 12,
//     marginBottom: 16,
//   },
//   modifySeatsCancelBtn: {
//     flex: 1,
//     paddingVertical: 12,
//     borderRadius: 12,
//     borderWidth: 1,
//     borderColor: '#D1D5DB',
//     alignItems: 'center',
//   },
//   modifySeatsCancelBtnText: {
//     fontSize: 15,
//     fontWeight: '600',
//     color: '#6B7280',
//   },
//   modifySeatsSubmitBtn: {
//     flex: 1,
//     paddingVertical: 12,
//     borderRadius: 12,
//     backgroundColor: Colors.primary,
//     alignItems: 'center',
//   },
//   modifySeatsSubmitBtnDisabled: {
//     opacity: 0.6,
//   },
//   modifySeatsSubmitBtnText: {
//     fontSize: 15,
//     fontWeight: '700',
//     color: '#fff',
//   },
//   modifySeatsNote: {
//     fontSize: 11,
//     color: '#9CA3AF',
//     textAlign: 'center',
//     fontStyle: 'italic',
//   },
// });
import React, { useEffect, useState, useRef, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  StatusBar,
  RefreshControl,
  Animated,
  Image,
  LayoutAnimation,
  Platform,
  UIManager,
  ActivityIndicator,
  Modal,
  TextInput,
  Alert,
  Linking
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons, MaterialIcons } from "@expo/vector-icons";
import { useFocusEffect } from "@react-navigation/native";
import axios from "axios";
import LottieView from "lottie-react-native";
import { SvgCssUri } from 'react-native-svg/css';
import io from 'socket.io-client';

import { useAuth } from "../context/AuthContext";
import { Colors, Typography } from "../constants/Colors";
import { FontFamily } from "../constants/Fonts";
import CustomAlert from '../components/CustomAlert';

import { API_BASE_URL, GMAP_API_KEY } from "../config/config_ip";

if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

const buildImageUrl = (url) => {
  if (!url) return null;
  if (url.startsWith('http://') || url.startsWith('https://')) return url;
  if (url.includes('?')) {
    return `${API_BASE_URL}${url.startsWith('/') ? '' : '/'}${url}&_t=${Date.now()}`;
  }
  return `${API_BASE_URL}${url.startsWith('/') ? '' : '/'}${url}?_t=${Date.now()}`;
};

const getInitials = (name) => {
  if (!name) return '?';
  const parts = name.trim().split(' ').filter(Boolean);
  if (parts.length > 1) return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
  return parts[0].slice(0, 2).toUpperCase();
};

const isSvgImage = (url) => {
  if (!url) return false;
  return url.toLowerCase().includes('.svg');
};

export default function MyRides({ route, navigation }) {
  const { user, isAuthenticated, isGuest } = useAuth();
  const phoneNumber = user?.phone_number;
  
  const [alertVisible, setAlertVisible] = useState(false);
  const [alertConfig, setAlertConfig] = useState({
    title: "",
    message: "",
    icon: "check-circle",
    iconColor: "#10B981",
    buttons: []
  });

  const [expandedPostedRides, setExpandedPostedRides] = useState({});
  const [expandedRequestedRides, setExpandedRequestedRides] = useState({});
  const [forceRefresh, setForceRefresh] = useState(false);
  const [addressCache, setAddressCache] = useState({});
  const [loadingAddresses, setLoadingAddresses] = useState(false);
  const [ratingModalVisible, setRatingModalVisible] = useState(false);
  const [selectedRider, setSelectedRider] = useState(null);
  const [rating, setRating] = useState(0);
  const [feedback, setFeedback] = useState('');
  const [currentSessionId, setCurrentSessionId] = useState(null);
  const [ratingType, setRatingType] = useState('rider');
  const [selectedBookingForModification, setSelectedBookingForModification] = useState(null);
  const [modifySeatsModalVisible, setModifySeatsModalVisible] = useState(false);
  const [modifySeatsValue, setModifySeatsValue] = useState(1);
  const [modifySeatsLoading, setModifySeatsLoading] = useState(false);
  const [maxModifySeats, setMaxModifySeats] = useState(1);

  const [conflictModalVisible, setConflictModalVisible] = useState(false);
  const [conflictData, setConflictData] = useState(null);
  const [resolvingConflict, setResolvingConflict] = useState(false);

  const socketRef = useRef(null);

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

  const getAddressFromCoordsGoogle = async (lat, lng) => {
    if (!lat || !lng) return null;
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

  useEffect(() => {
    if (!isAuthenticated || isGuest) {
      showConfirmationAlert('Login Required', 'Please complete login/profile to view rides.', () => navigation.navigate('Login'));
      navigation.goBack();
    }
  }, [isAuthenticated, isGuest]);

  useEffect(() => {
    if (!phoneNumber) return;

    const socket = io(API_BASE_URL, {
      transports: ['websocket'],
      reconnection: true,
      reconnectionAttempts: 10,
      reconnectionDelay: 1000,
    });

    socketRef.current = socket;

    socket.on('connect', () => {
      console.log('Socket connected for ride updates');
      socket.emit('join-user-room', phoneNumber);
    });

    socket.on('ride-cancelled', (data) => {
      console.log('Ride cancelled event received:', data);
      showCustomAlert('Ride Cancelled', data.message || 'A ride you were associated with has been cancelled.', 'warning');
      onRefresh();
    });

    socket.on('booking-cancelled', (data) => {
      console.log('Booking cancelled:', data);
      showCustomAlert('Booking Cancelled', data.message || 'Your booking has been cancelled.', 'warning');
      onRefresh();
    });

    socket.on('modification-cancelled', (data) => {
      console.log('Modification cancelled:', data);
      showCustomAlert('Modification Request Cancelled', data.message || 'Your modification request has been cancelled.', 'info');
      onRefresh();
    });

    socket.on('ride-completed-by-driver', (data) => {
      console.log('Ride completed by driver:', data);
      showCustomAlert('Ride Completed', 'The driver has completed the ride. You can now rate your experience.', 'success');
      onRefresh();
    });

    socket.on('ride-started-by-driver', (data) => {
      console.log('Ride started by driver:', data);
      showCustomAlert('Ride Started', 'The driver has started the ride. You can now track your journey.', 'success');
      onRefresh();
    });

    socket.on('concurrent-requests-detected', (data) => {
      console.log('Concurrent requests detected:', data);
      if (data.ride_id) {
        checkForConcurrentRequests(data.ride_id);
      }
    });

    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
      }
    };
  }, [phoneNumber]);

  const initialTab = route?.params?.initialTab || "posted";
  const targetBookingId = route?.params?.bookingId || null;
  const targetRideId = route?.params?.rideId || null;

  const [postedRides, setPostedRides] = useState([]);
  const [requestedRides, setRequestedRides] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState(initialTab);
  const [postedFilter, setPostedFilter] = useState("all");
  const [requestedFilter, setRequestedFilter] = useState("all");
  
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;
  const tabScaleAnim = useRef(new Animated.Value(1)).current;
  const scrollViewRef = useRef(null);
  const [showFilterModal, setShowFilterModal] = useState(false);
  const [tempFilter, setTempFilter] = useState("all");

  const fetchMyRides = async (forceClearCache = false) => {
    if (!phoneNumber) {
      setLoading(false);
      return;
    }
    
    setLoading(true);
    
    try {
      const timestamp = forceClearCache ? `?_t=${Date.now()}` : '';
      const url = `${API_BASE_URL}/my-rides/${phoneNumber}${timestamp}`;
      console.log('Fetching rides from:', url);
      
      const res = await axios.get(url);
      
      console.log('Rides fetched:', {
        posted: res.data.posted_rides?.length || 0,
        requested: res.data.requested_rides?.length || 0
      });
      
      setPostedRides(res.data.posted_rides || []);
      setRequestedRides(res.data.requested_rides || []);
      
    } catch (error) {
      console.error("Error fetching rides:", error);
      if (error.response) {
        showCustomAlert("Error", `Server error: ${error.response.status}`, "error");
      } else {
        showCustomAlert("Error", "Could not load your rides.", "error");
      }
    } finally {
      setLoading(false);
      setForceRefresh(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    fetchMyRides(true);
    setTimeout(() => setRefreshing(false), 1000);
  };

  useFocusEffect(
    useCallback(() => {
      if (phoneNumber) {
        const shouldRefresh = route.params?.refresh || route.params?.forceReload;
        const targetTab = route.params?.tab;
        
        if (targetTab) {
          setActiveTab(targetTab);
        }
        
        if (shouldRefresh) {
          fetchMyRides(true);
          navigation.setParams({ refresh: false, forceReload: false, tab: undefined });
        } else {
          fetchMyRides();
        }
      }
    }, [phoneNumber, route.params?.refresh, route.params?.forceReload, route.params?.tab])
  );

  useEffect(() => {
    if (!phoneNumber) return;
    fetchMyRides();
    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 1, duration: 500, useNativeDriver: true }),
      Animated.timing(slideAnim, { toValue: 0, duration: 500, useNativeDriver: true }),
    ]).start();
  }, [phoneNumber]);

  useEffect(() => {
    if (route?.params?.initialTab) setActiveTab(route.params.initialTab);
  }, [route?.params?.initialTab]);

  const checkForConcurrentRequests = async (rideId) => {
    try {
      const response = await axios.get(`${API_BASE_URL}/ride/${rideId}/concurrent-requests?_t=${Date.now()}`);
      const data = response.data;
      
      if (data.has_concurrent_requests) {
        setConflictData(data);
        setConflictModalVisible(true);
      }
    } catch (error) {
      console.log('Error checking concurrent requests:', error);
    }
  };

  const resolveConcurrentRequest = async (choice, modificationRequestId, bookingId) => {
    if (!conflictData) return;
    
    setResolvingConflict(true);
    try {
      const response = await axios.post(`${API_BASE_URL}/ride/${conflictData.ride.id}/resolve-concurrent-requests`, {
        choice: choice,
        modification_request_id: modificationRequestId,
        booking_id: bookingId,
        driver_phone: phoneNumber
      });
      
      const data = response.data;
      
      if (data.success) {
        showCustomAlert('Success', data.message, 'success');
        setConflictModalVisible(false);
        onRefresh();
      } else {
        showCustomAlert('Error', data.message || 'Failed to process request', 'error');
        onRefresh();
      }
    } catch (error) {
      console.error('Resolve concurrent request error:', error);
      showCustomAlert('Error', error.response?.data?.detail || 'Failed to resolve concurrent requests', 'error');
      onRefresh();
    } finally {
      setResolvingConflict(false);
    }
  };

  const togglePostedRideExpand = (rideId) => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setExpandedPostedRides(prev => ({ ...prev, [rideId]: !prev[rideId] }));
  };

  const toggleRequestedRideExpand = (rideId) => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setExpandedRequestedRides(prev => ({ ...prev, [rideId]: !prev[rideId] }));
  };

  const handleViewProfile = (userId, phoneNumber, name, profilePicture) => {
    navigation.navigate('ViewProfileScreen', {
      userId: userId,
      phoneNumber: phoneNumber,
      driverName: name,
      profilePicture: profilePicture,
    });
  };

  const handleViewRideDetails = (ride, booking = null) => {
    const rideData = {
      id: ride.id || ride.ride_id,
      custom_ride_id: ride.custom_ride_id,
      origin: ride.origin,
      destination: ride.destination,
      origin_address: ride.origin_address,
      destination_address: ride.destination_address,
      departure_time: ride.departure_time,
      price: ride.price_per_seat,
      driverName: ride.driver_name,
      phoneNumber: ride.driver_phone || ride.phone_number,
      driverUserId: ride.driver_user_id,
      seatsAvailable: ride.available_seats || ride.remaining_seats,
      totalSeats: ride.available_seats || 4,
      available_seats: ride.available_seats || ride.totalSeats || ride.total_seats || 0,
      booked_seats: ride.total_booked_seats || 0,
      routeCoordinates: ride.route_coordinates || [],
      suggestedPickup: ride.suggested_pickup || null,
      suggestedDrop: ride.suggested_drop || null,
      profilePicture: ride.driver_photo || ride.driver_profile_picture,
      rating: ride.driver_rating || 4.5,
      vehicle: ride.vehicle,
      preferences: ride.preferences,
      women_only: ride.women_only,
      bookings: ride.bookings,
      status: ride.status,
      cancellation_reason: ride.cancellation_reason,
      duration_text: ride.duration_text,
      distance_km: ride.distance_km,
      from: ride.origin,
      to: ride.destination,
      seatsRequested: ride.seats_requested,
      price_per_seat: ride.price_per_seat,
      origin_coords: ride.origin_coords || null,
      destination_coords: ride.destination_coords || null,
      started_at: ride.started_at,
      completed_at: ride.completed_at,
    };
    
    const isOwnRide = user?.phone_number === ride.phone_number;
    
    if (isOwnRide) {
      navigation.navigate('ViewRoutePostedScreen', { ride: rideData });
    } else {
      const bookingData = booking ? {
        id: booking.id,
        custom_booking_id: booking.custom_booking_id,
        seats_requested: booking.seats_requested || booking.seats_booked,
        status: booking.status,
        total_amount: booking.total_amount,
        created_at: booking.created_at,
        passenger_phone: booking.passenger_phone,
        pickup_address: booking.pickup_address,
        dropoff_address: booking.dropoff_address,
      } : null;
      
      navigation.navigate('ViewRouteRequestScreen', { 
        ride: rideData, 
        booking: bookingData 
      });
    }
  };

  const handleEditRide = (ride) => {
    if (!ride || !phoneNumber) {
      showCustomAlert("Error", "Cannot edit ride. Please refresh and try again.", "error");
      return;
    }
    
    if (ride.started_at) {
      showCustomAlert("Cannot Edit", "Ride has already started. Cannot edit.", "warning");
      return;
    }
    
    if (ride.cancellation_reason) {
      showCustomAlert("Cannot Edit", "Cancelled ride cannot be edited.", "warning");
      return;
    }
    
    if (ride.status === "completed") {
      showCustomAlert("Cannot Edit", "Completed ride cannot be edited.", "warning");
      return;
    }
    
    const now = new Date();
    const departureTime = new Date(ride.departure_time);
    const minutesToDeparture = (departureTime - now) / (1000 * 60);
    
    if (minutesToDeparture <= 15 && minutesToDeparture > 0) {
      showCustomAlert("Cannot Edit", "Cannot edit ride within 15 minutes of departure time.", "warning");
      return;
    }
    
    const rideData = {
      from: ride.origin || '',
      to: ride.destination || '',
      dateTime: ride.departure_time ? new Date(ride.departure_time) : new Date(),
      seatsAvailable: ride.available_seats || 1,
      pricePerSeat: (ride.price_per_seat || 0).toString(),
      vehicleId: ride.vehicle_id || null,
      originCoords: ride.origin_coords,
      destinationCoords: ride.destination_coords,
      routeCoordinates: ride.route_coordinates,
      distanceKm: ride.distance_km,
      durationText: ride.duration_text,
      totalPrice: ride.total_estimated_price,
      preferences: ride.preferences,
      womenOnly: ride.women_only,
    };
    
    navigation.navigate('DriveNext', { 
      rideData, 
      isEdit: true, 
      rideId: ride.id, 
      phoneNumber: phoneNumber 
    });
  };

  const canStartRide = (ride) => {
    if (ride.status === "completed") return false;
    if (ride.cancellation_reason) return false;
    if (ride.started_at) return false;
    if (ride.status !== "active" && ride.status !== "full") return false;
    
    const now = new Date();
    const departureTime = new Date(ride.departure_time);
    const minutesToDeparture = (departureTime - now) / (1000 * 60);
    const minutesSinceDeparture = (now - departureTime) / (1000 * 60);
    
    if (minutesSinceDeparture > 30) return false;
    return minutesToDeparture <= 15 || minutesSinceDeparture >= 0;
  };

  const getRideStatusInfo = (ride) => {
    const now = new Date();
    const departureTime = new Date(ride.departure_time);
    const hoursSinceDeparture = (now - departureTime) / (1000 * 60 * 60);
    const minutesSinceDeparture = (now - departureTime) / (1000 * 60);
    const minutesToDeparture = (departureTime - now) / (1000 * 60);
    
    if (ride.status === "completed" || ride.completed_at) {
      return { text: "Completed", color: "#6B7280", icon: "checkmark-done", type: "completed" };
    }
    
    if (ride.cancellation_reason && !ride.cancellation_reason.includes("Auto-cancelled")) {
      return { text: "Cancelled", color: "#DC2626", icon: "close-circle", type: "cancelled" };
    }
    
    if (ride.cancellation_reason?.includes("Auto-cancelled") || (hoursSinceDeparture > 2 && !ride.started_at && !ride.completed_at)) {
      return { text: "Auto-cancelled", color: "#9CA3AF", icon: "timer-off", type: "auto-cancelled" };
    }
    
    if (ride.started_at && !ride.completed_at && ride.status !== "completed") {
      return { text: "Ongoing", color: "#10B981", icon: "car-sport", type: "ongoing" };
    }
    
    if (minutesSinceDeparture > 0 && minutesSinceDeparture <= 120 && !ride.started_at && !ride.completed_at) {
      return { text: `Late - ${Math.abs(Math.round(minutesSinceDeparture))} min`, color: "#EF4444", icon: "alert-circle", type: "late" };
    }
    
    if (minutesToDeparture <= 15 && minutesToDeparture > 0 && !ride.started_at && !ride.completed_at) {
      return { text: `Starting in ${Math.round(minutesToDeparture)} min`, color: "#10B981", icon: "checkmark-circle", type: "active" };
    }
    
    if (minutesToDeparture <= 60 && minutesToDeparture > 15 && !ride.started_at && !ride.completed_at) {
      return { text: `Starts in ${Math.round(minutesToDeparture)} min`, color: "#F59E0B", icon: "time-outline", type: "start-soon" };
    }
    
    if (minutesToDeparture > 60 && !ride.started_at && !ride.completed_at) {
      const hours = Math.floor(minutesToDeparture / 60);
      const mins = Math.round(minutesToDeparture % 60);
      const timeText = hours > 0 ? `${hours}h ${mins > 0 ? `${mins}m` : ''}` : `${mins}m`;
      return { text: `Starts in ${timeText}`, color: "#2457A6", icon: "calendar-outline", type: "upcoming" };
    }
    
    return { text: "Active", color: "#10B981", icon: "checkmark-circle", type: "active" };
  };
const getPassengerRideStatusInfo = (booking) => {
    const ride = booking;
    const now = new Date();
    const departureTime = new Date(ride.departure_time);
    const hoursSinceDeparture = (now - departureTime) / (1000 * 60 * 60);
    const minutesToDeparture = (departureTime - now) / (1000 * 60);
    const minutesSinceDeparture = (now - departureTime) / (1000 * 60);
    
    // ✅ CRITICAL FIX: Check for cancelled/rejected status FIRST
    // This prevents cancelled rides from showing as "ongoing"
    
    // Check if booking itself is cancelled or rejected
    if (booking.status === "cancelled") {
        return { 
            text: "Cancelled", 
            color: "#DC2626", 
            icon: "close-circle", 
            type: "cancelled", 
            showTrackButton: false 
        };
    }
    
    if (booking.status === "rejected") {
        return { 
            text: "Rejected", 
            color: "#DC2626", 
            icon: "close-circle", 
            type: "rejected", 
            showTrackButton: false 
        };
    }
    
    // Check for modification rejected (booking cancelled)
    if (booking.modification_request && booking.modification_request.status === "rejected") {
        return { 
            text: "Booking Cancelled", 
            color: "#DC2626", 
            icon: "close-circle", 
            type: "modification-rejected", 
            showTrackButton: false 
        };
    }
    
    // ✅ Check for ride cancellation
    if (ride.ride_cancelled || ride.cancellation_reason || ride.ride_status === "cancelled") {
        if (hoursSinceDeparture > 2 && !ride.ride_started_at && !ride.started_at) {
            return { 
                text: "Auto-cancelled", 
                color: "#9CA3AF", 
                icon: "timer-off", 
                type: "auto-cancelled", 
                showTrackButton: false 
            };
        }
        return { 
            text: "Ride Cancelled", 
            color: "#DC2626", 
            icon: "close-circle", 
            type: "ride-cancelled", 
            showTrackButton: false 
        };
    }
    
    // ✅ Check for completed rides
    if (ride.ride_status === "completed" || ride.completed_at) {
        return { 
            text: "Completed", 
            color: "#6B7280", 
            icon: "checkmark-done", 
            type: "completed", 
            showTrackButton: false 
        };
    }
    
    // ✅ Check for ongoing ride - ONLY if booking is active/accepted AND not cancelled
    const hasRideStarted = ride.ride_started_at || ride.started_at || ride.ride_started || ride.has_started;
    const isBookingActive = booking.status === "accepted";
    
    // Make sure booking is active and ride has started, but ride is not completed
    if (hasRideStarted && ride.ride_status !== "completed" && ride.status !== "completed" && isBookingActive) {
        console.log('🚗 Ride is ONGOING for booking:', booking.id);
        return { 
            text: "Ride Ongoing 🚗", 
            color: "#10B981", 
            icon: "car-sport", 
            type: "ongoing", 
            showTrackButton: true,
            hasStarted: true
        };
    }
    
    // Check for driver late (only if booking is accepted and ride hasn't started)
    if (minutesSinceDeparture > 0 && minutesSinceDeparture <= 120 && booking.status === "accepted" && !hasRideStarted) {
        const lateMinutes = Math.round(minutesSinceDeparture);
        return { 
            text: `Driver Late - ${lateMinutes} min`, 
            color: "#EF4444", 
            icon: "alert-circle", 
            type: "driver-late", 
            showTrackButton: false,
            message: `The driver is ${lateMinutes} minutes late. We apologize for the inconvenience.`
        };
    }
    
    // Check for start soon (within 60 minutes)
    if (minutesToDeparture <= 60 && minutesToDeparture > 0 && booking.status === "accepted" && !hasRideStarted) {
        const mins = Math.round(minutesToDeparture);
        if (mins <= 15) {
            return { 
                text: `Starting in ${mins} min`, 
                color: "#10B981", 
                icon: "checkmark-circle", 
                type: "start-soon", 
                showTrackButton: false 
            };
        }
        return { 
            text: `Starts in ${mins} min`, 
            color: "#F59E0B", 
            icon: "time-outline", 
            type: "start-soon", 
            showTrackButton: false 
        };
    }
    
    // Check for pending status
    if (booking.status === "pending") {
        return { 
            text: "Requested", 
            color: "#F59E0B", 
            icon: "time", 
            type: "pending", 
            showTrackButton: false 
        };
    }
    
    // Check for accepted with future departure (>60 minutes)
    if (booking.status === "accepted" && !hasRideStarted && minutesToDeparture > 60) {
        const hours = Math.floor(minutesToDeparture / 60);
        const mins = Math.round(minutesToDeparture % 60);
        const timeText = hours > 0 ? `${hours}h ${mins > 0 ? `${mins}m` : ''}` : `${mins}m`;
        return { 
            text: `Accepted - ${timeText}`, 
            color: "#10B981", 
            icon: "checkmark-circle", 
            type: "accepted", 
            showTrackButton: false 
        };
    }
    
    // Default fallback
    return { 
        text: booking.status || "Unknown", 
        color: Colors.gray, 
        icon: "ellipse", 
        type: "unknown", 
        showTrackButton: false 
    };
};
  // const getPassengerRideStatusInfo = (booking) => {
  //   const ride = booking;
  //   const now = new Date();
  //   const departureTime = new Date(ride.departure_time);
  //   const hoursSinceDeparture = (now - departureTime) / (1000 * 60 * 60);
  //   const minutesToDeparture = (departureTime - now) / (1000 * 60);
  //   const minutesSinceDeparture = (now - departureTime) / (1000 * 60);
    
  //   if (booking.modification_request && booking.modification_request.status === "rejected") {
  //     return { text: "Booking Cancelled", color: "#DC2626", icon: "close-circle", type: "modification-rejected", showTrackButton: false };
  //   }
    
  //   if (ride.ride_status === "completed" || ride.completed_at) {
  //     return { text: "Completed", color: "#6B7280", icon: "checkmark-done", type: "completed", showTrackButton: false };
  //   }
    
  //   if (ride.ride_cancelled || ride.cancellation_reason || ride.ride_status === "cancelled") {
  //     if (hoursSinceDeparture > 2 && !ride.ride_started_at) {
  //       return { text: "Auto-cancelled", color: "#9CA3AF", icon: "timer-off", type: "auto-cancelled", showTrackButton: false };
  //     }
  //     return { text: "Ride Cancelled", color: "#DC2626", icon: "close-circle", type: "ride-cancelled", showTrackButton: false };
  //   }
    
  //   if (ride.ride_started_at && ride.ride_status !== "completed") {
  //     return { text: "Ongoing", color: "#10B981", icon: "car-sport", type: "ongoing", showTrackButton: true };
  //   }
    
  //   if (minutesToDeparture <= 60 && minutesToDeparture > 0 && ride.status === "accepted" && !ride.ride_started_at) {
  //     const mins = Math.round(minutesToDeparture);
  //     if (mins <= 15) {
  //       return { text: `Starting in ${mins} min`, color: "#10B981", icon: "checkmark-circle", type: "start-soon", showTrackButton: false };
  //     }
  //     return { text: `Starts in ${mins} min`, color: "#F59E0B", icon: "time-outline", type: "start-soon", showTrackButton: false };
  //   }
    
  //   if (minutesSinceDeparture > 0 && minutesSinceDeparture <= 120 && ride.status === "accepted" && !ride.ride_started_at) {
  //     return { text: `Driver Late - ${Math.round(minutesSinceDeparture)} min`, color: "#EF4444", icon: "alert-circle", type: "driver-late", showTrackButton: false };
  //   }
    
  //   if (ride.status === "pending") {
  //     return { text: "Requested", color: "#F59E0B", icon: "time", type: "pending", showTrackButton: false };
  //   }
    
  //   if (ride.status === "accepted" && !ride.ride_started_at && minutesToDeparture > 60) {
  //     const hours = Math.floor(minutesToDeparture / 60);
  //     const mins = Math.round(minutesToDeparture % 60);
  //     const timeText = hours > 0 ? `${hours}h ${mins > 0 ? `${mins}m` : ''}` : `${mins}m`;
  //     return { text: `Accepted - ${timeText}`, color: "#10B981", icon: "checkmark-circle", type: "accepted", showTrackButton: false };
  //   }
    
  //   if (ride.status === "rejected") {
  //     return { text: "Rejected", color: "#DC2626", icon: "close-circle", type: "rejected", showTrackButton: false };
  //   }
    
  //   return { text: ride.status || "Unknown", color: Colors.gray, icon: "ellipse", type: "unknown", showTrackButton: false };
  // };
// const getPassengerRideStatusInfo = (booking) => {
//     const ride = booking;
//     const now = new Date();
//     const departureTime = new Date(ride.departure_time);
//     const hoursSinceDeparture = (now - departureTime) / (1000 * 60 * 60);
//     const minutesToDeparture = (departureTime - now) / (1000 * 60);
//     const minutesSinceDeparture = (now - departureTime) / (1000 * 60);
    
//     // ✅ CRITICAL: Check for ongoing ride first - multiple sources
//     const hasRideStarted = ride.ride_started_at || ride.started_at || ride.ride_started || ride.has_started;
    
//     if (hasRideStarted && ride.ride_status !== "completed" && ride.status !== "completed") {
//         console.log('🚗 Ride is ONGOING for booking:', booking.id);
//         return { 
//             text: "Ongoing", 
//             color: "#10B981", 
//             icon: "car-sport", 
//             type: "ongoing", 
//             showTrackButton: true,
//             hasStarted: true
//         };
//     }
    
//     if (booking.modification_request && booking.modification_request.status === "rejected") {
//         return { text: "Booking Cancelled", color: "#DC2626", icon: "close-circle", type: "modification-rejected", showTrackButton: false };
//     }
    
//     if (ride.ride_status === "completed" || ride.completed_at) {
//         return { text: "Completed", color: "#6B7280", icon: "checkmark-done", type: "completed", showTrackButton: false };
//     }
    
//     if (ride.ride_cancelled || ride.cancellation_reason || ride.ride_status === "cancelled") {
//         if (hoursSinceDeparture > 2 && !hasRideStarted) {
//             return { text: "Auto-cancelled", color: "#9CA3AF", icon: "timer-off", type: "auto-cancelled", showTrackButton: false };
//         }
//         return { text: "Ride Cancelled", color: "#DC2626", icon: "close-circle", type: "ride-cancelled", showTrackButton: false };
//     }
    
//     if (minutesToDeparture <= 60 && minutesToDeparture > 0 && ride.status === "accepted" && !hasRideStarted) {
//         const mins = Math.round(minutesToDeparture);
//         if (mins <= 15) {
//             return { text: `Starting in ${mins} min`, color: "#10B981", icon: "checkmark-circle", type: "start-soon", showTrackButton: false };
//         }
//         return { text: `Starts in ${mins} min`, color: "#F59E0B", icon: "time-outline", type: "start-soon", showTrackButton: false };
//     }
    
//     if (minutesSinceDeparture > 0 && minutesSinceDeparture <= 120 && ride.status === "accepted" && !hasRideStarted) {
//         return { text: `Driver Late - ${Math.round(minutesSinceDeparture)} min`, color: "#EF4444", icon: "alert-circle", type: "driver-late", showTrackButton: false };
//     }
    
//     if (ride.status === "pending") {
//         return { text: "Requested", color: "#F59E0B", icon: "time", type: "pending", showTrackButton: false };
//     }
    
//     if (ride.status === "accepted" && !hasRideStarted && minutesToDeparture > 60) {
//         const hours = Math.floor(minutesToDeparture / 60);
//         const mins = Math.round(minutesToDeparture % 60);
//         const timeText = hours > 0 ? `${hours}h ${mins > 0 ? `${mins}m` : ''}` : `${mins}m`;
//         return { text: `Accepted - ${timeText}`, color: "#10B981", icon: "checkmark-circle", type: "accepted", showTrackButton: false };
//     }
    
//     if (ride.status === "rejected") {
//         return { text: "Rejected", color: "#DC2626", icon: "close-circle", type: "rejected", showTrackButton: false };
//     }
    
//     return { text: ride.status || "Unknown", color: Colors.gray, icon: "ellipse", type: "unknown", showTrackButton: false };
// };
// const getPassengerRideStatusInfo = (booking) => {
//     const ride = booking;
//     const now = new Date();
//     const departureTime = new Date(ride.departure_time);
//     const hoursSinceDeparture = (now - departureTime) / (1000 * 60 * 60);
//     const minutesToDeparture = (departureTime - now) / (1000 * 60);
//     const minutesSinceDeparture = (now - departureTime) / (1000 * 60);
    
//     // ✅ CRITICAL FIX: Check for cancelled/rejected status FIRST
//     // This prevents cancelled rides from showing as "ongoing"
//     if (ride.status === "cancelled") {
//         return { 
//             text: "Cancelled", 
//             color: "#DC2626", 
//             icon: "close-circle", 
//             type: "cancelled", 
//             showTrackButton: false 
//         };
//     }
    
//     if (ride.status === "rejected") {
//         return { 
//             text: "Rejected", 
//             color: "#DC2626", 
//             icon: "close-circle", 
//             type: "rejected", 
//             showTrackButton: false 
//         };
//     }
    
//     // Check for modification rejected (booking cancelled)
//     if (booking.modification_request && booking.modification_request.status === "rejected") {
//         return { 
//             text: "Booking Cancelled", 
//             color: "#DC2626", 
//             icon: "close-circle", 
//             type: "modification-rejected", 
//             showTrackButton: false 
//         };
//     }
    
//     // ✅ Check for ride cancellation
//     if (ride.ride_cancelled || ride.cancellation_reason || ride.ride_status === "cancelled") {
//         if (hoursSinceDeparture > 2 && !ride.ride_started_at && !ride.started_at) {
//             return { 
//                 text: "Auto-cancelled", 
//                 color: "#9CA3AF", 
//                 icon: "timer-off", 
//                 type: "auto-cancelled", 
//                 showTrackButton: false 
//             };
//         }
//         return { 
//             text: "Ride Cancelled", 
//             color: "#DC2626", 
//             icon: "close-circle", 
//             type: "ride-cancelled", 
//             showTrackButton: false 
//         };
//     }
    
//     // ✅ Check for completed rides
//     if (ride.ride_status === "completed" || ride.completed_at) {
//         return { 
//             text: "Completed", 
//             color: "#6B7280", 
//             icon: "checkmark-done", 
//             type: "completed", 
//             showTrackButton: false 
//         };
//     }
    
//     // ✅ Check for ongoing ride - ONLY if booking is active/accepted
//     const hasRideStarted = ride.ride_started_at || ride.started_at || ride.ride_started || ride.has_started;
//     const isBookingActive = ride.status === "accepted";
    
//     if (hasRideStarted && ride.ride_status !== "completed" && ride.status !== "completed" && isBookingActive) {
//         console.log('🚗 Ride is ONGOING for booking:', booking.id);
//         return { 
//             text: "Ongoing", 
//             color: "#10B981", 
//             icon: "car-sport", 
//             type: "ongoing", 
//             showTrackButton: true,
//             hasStarted: true
//         };
//     }
    
//     // Check for driver late (only if booking is accepted and ride hasn't started)
//     if (minutesSinceDeparture > 0 && minutesSinceDeparture <= 120 && ride.status === "accepted" && !hasRideStarted) {
//         const lateMinutes = Math.round(minutesSinceDeparture);
//         return { 
//             text: `Driver Late - ${lateMinutes} min`, 
//             color: "#EF4444", 
//             icon: "alert-circle", 
//             type: "driver-late", 
//             showTrackButton: false,
//             message: `The driver is ${lateMinutes} minutes late. We apologize for the inconvenience.`
//         };
//     }
    
//     // Check for start soon (within 60 minutes)
//     if (minutesToDeparture <= 60 && minutesToDeparture > 0 && ride.status === "accepted" && !hasRideStarted) {
//         const mins = Math.round(minutesToDeparture);
//         if (mins <= 15) {
//             return { 
//                 text: `Starting in ${mins} min`, 
//                 color: "#10B981", 
//                 icon: "checkmark-circle", 
//                 type: "start-soon", 
//                 showTrackButton: false 
//             };
//         }
//         return { 
//             text: `Starts in ${mins} min`, 
//             color: "#F59E0B", 
//             icon: "time-outline", 
//             type: "start-soon", 
//             showTrackButton: false 
//         };
//     }
    
//     // Check for pending status
//     if (ride.status === "pending") {
//         return { 
//             text: "Requested", 
//             color: "#F59E0B", 
//             icon: "time", 
//             type: "pending", 
//             showTrackButton: false 
//         };
//     }
    
//     // Check for accepted with future departure (>60 minutes)
//     if (ride.status === "accepted" && !hasRideStarted && minutesToDeparture > 60) {
//         const hours = Math.floor(minutesToDeparture / 60);
//         const mins = Math.round(minutesToDeparture % 60);
//         const timeText = hours > 0 ? `${hours}h ${mins > 0 ? `${mins}m` : ''}` : `${mins}m`;
//         return { 
//             text: `Accepted - ${timeText}`, 
//             color: "#10B981", 
//             icon: "checkmark-circle", 
//             type: "accepted", 
//             showTrackButton: false 
//         };
//     }
    
//     // Default fallback
//     return { 
//         text: ride.status || "Unknown", 
//         color: Colors.gray, 
//         icon: "ellipse", 
//         type: "unknown", 
//         showTrackButton: false 
//     };
// };
  const handleStartRide = async (ride) => {
    if (ride.status === "completed") {
      showCustomAlert("Cannot Start", "This ride has already been completed.", "warning");
      return;
    }
    
    const statusInfo = getRideStatusInfo(ride);
    
    if (statusInfo.type !== 'active' && statusInfo.type !== 'late') {
      const now = new Date();
      const departureTime = new Date(ride.departure_time);
      const minutesToDeparture = Math.ceil((departureTime - now) / (1000 * 60));
      const minutesSinceDeparture = Math.ceil((now - departureTime) / (1000 * 60));
      
      if (ride.status === "completed") {
        showCustomAlert("Ride Completed", "This ride has already been completed.", "info");
      } else if (minutesSinceDeparture > 120) {
        showCustomAlert("Ride Expired", "This ride has been auto-cancelled as it was not started within 2 hours of departure time.", "error");
      } else if (minutesToDeparture > 15) {
        showCustomAlert("Cannot Start Ride", `You can start the ride only 15 minutes before departure time. ${minutesToDeparture} minutes remaining.`, "warning");
      } else if (minutesSinceDeparture > 0 && minutesSinceDeparture <= 120) {
        showCustomAlert("Late Start", `Ride is ${minutesSinceDeparture} minutes late. You can still start the ride.`, "warning");
      } else {
        showCustomAlert("Cannot Start Ride", "Ride cannot be started at this time.", "warning");
      }
      return;
    }
    
    const liveSession = ride?.live_session;
    if (liveSession?.session_id) {
      navigation.navigate('OngoingRideDriverScreen', { rideId: ride.id, sessionId: liveSession.session_id });
      return;
    }
    
    navigation.navigate('StartRideConfirmScreen', { rideId: ride.id, ride });
  };

  const handleTrackRide = (booking) => {
    navigation.navigate('OngoingRideRiderScreen', { 
      bookingId: booking.id, 
      sessionId: booking.live_session?.session_id || null 
    });
  };

  const handleBookingAction = async (bookingId, action) => {
    showConfirmationAlert(`${action === "accept" ? "Accept" : "Reject"} Request`, `Are you sure you want to ${action} this booking request?`, async () => {
      try {
        await axios.put(`${API_BASE_URL}/booking/${bookingId}/${action}`);
        showCustomAlert("Success", `Booking ${action}ed successfully.`, "success");
        onRefresh();
      } catch (err) {
        showCustomAlert("Error", "Could not update booking.", "error");
      }
    });
  };

  const cancelRide = async (rideId) => {
    const ride = postedRides.find(r => r.id === rideId);
    
    if (ride?.status === "completed") {
      showCustomAlert("Cannot Cancel", "Completed rides cannot be cancelled.", "warning");
      return;
    }
    
    const acceptedBookings = ride?.bookings?.filter(b => b.status === "accepted")?.length || 0;
    const pendingBookings = ride?.bookings?.filter(b => b.status === "pending")?.length || 0;
    const pendingModifications = ride?.bookings?.filter(b => b.modification_request?.status === "pending")?.length || 0;
    
    let message = "Are you sure you want to cancel this ride?\n\n";
    if (acceptedBookings > 0) {
      message += `⚠️ This will cancel ${acceptedBookings} confirmed booking(s)\n`;
    }
    if (pendingBookings > 0) {
      message += `⚠️ This will reject ${pendingBookings} pending request(s)\n`;
    }
    if (pendingModifications > 0) {
      message += `⚠️ This will cancel ${pendingModifications} modification request(s)\n`;
    }
    message += "\nThis action cannot be undone.";
    
    showConfirmationAlert("Cancel Ride", message, async () => {
      try {
        const response = await axios.put(`${API_BASE_URL}/ride/${rideId}/cancel`);
        
        if (response.data) {
          const { affected_passengers, cancelled_modifications, cancelled_pending_bookings } = response.data;
          
          let successMessage = "Ride cancelled successfully.";
          if (affected_passengers > 0) {
            successMessage += `\n✅ ${affected_passengers} confirmed booking(s) cancelled.`;
          }
          if (cancelled_pending_bookings > 0) {
            successMessage += `\n📝 ${cancelled_pending_bookings} pending request(s) rejected.`;
          }
          if (cancelled_modifications > 0) {
            successMessage += `\n🔄 ${cancelled_modifications} modification request(s) cancelled.`;
          }
          
          showCustomAlert("Success", successMessage, "success");
          onRefresh();
        }
      } catch (err) {
        const errorMessage = err.response?.data?.detail || err.response?.data?.message || err.message || "Could not cancel ride.";
        showCustomAlert("Error", `Failed to cancel ride: ${errorMessage}`, "error");
      }
    });
  };

  const getCancellationStatusDisplay = (item) => {
    if (item.cancellation_reason) {
      if (item.cancellation_reason.includes("Auto-cancelled") || item.cancellation_reason.includes("auto-cancel")) {
        return {
          text: "Auto-cancelled",
          color: "#9CA3AF",
          icon: "timer-off",
          message: item.cancellation_reason
        };
      }
      return {
        text: "Cancelled",
        color: "#DC2626",
        icon: "close-circle",
        message: item.cancellation_reason
      };
    }
    return null;
  };
const cancelBooking = async (bookingId) => {
  showConfirmationAlert("Cancel Booking", "Are you sure you want to cancel this booking?", async () => {
    try {
      const response = await axios.put(`${API_BASE_URL}/booking/${bookingId}/cancel`);
      // Force refresh to ensure UI updates
      showCustomAlert("Success", "Booking cancelled successfully.", "success");
      // Add a small delay to ensure backend processes the cancellation
      setTimeout(() => {
        onRefresh();
      }, 500);
    } catch (err) {
      showCustomAlert("Error", "Could not cancel booking.", "error");
    }
  });
};
  // const cancelBooking = async (bookingId) => {
  //   showConfirmationAlert("Cancel Booking", "Are you sure you want to cancel this booking?", async () => {
  //     try {
  //       await axios.put(`${API_BASE_URL}/booking/${bookingId}/cancel`);
  //       showCustomAlert("Success", "Booking cancelled successfully.", "success");
  //       onRefresh();
  //     } catch (err) {
  //       showCustomAlert("Error", "Could not cancel booking.", "error");
  //     }
  //   });
  // };

  const handleModificationAction = async (requestId, action, bookingId) => {
    showConfirmationAlert(`${action === "approve" ? "Approve" : "Reject"} Modification`, `Are you sure you want to ${action} this seat modification request?`, async () => {
      try {
        await axios.put(`${API_BASE_URL}/api/v1/modifications/${requestId}/${action}`);
        showCustomAlert("Success", `Modification request ${action}d successfully.`, "success");
        onRefresh();
      } catch (err) {
        showCustomAlert("Error", "Could not process modification request.", "error");
      }
    });
  };

  const handleCancelModificationRequest = async (requestId, bookingId) => {
    showConfirmationAlert("Cancel Modification Request", "Are you sure you want to cancel your seat modification request?", async () => {
      try {
        const response = await axios.delete(`${API_BASE_URL}/api/v1/modifications/${requestId}/cancel`);
        showCustomAlert("Success", "Modification request cancelled successfully.", "success");
        onRefresh();
      } catch (err) {
        showCustomAlert("Error", err.response?.data?.detail || "Could not cancel modification request.", "error");
      }
    });
  };

  const openRateRiderModal = (rider, sessionId) => {
    setSelectedRider(rider);
    setCurrentSessionId(sessionId);
    setRatingType('rider');
    setRating(0);
    setFeedback('');
    setRatingModalVisible(true);
  };

  const openRateDriverModal = (booking, sessionId) => {
    setSelectedRider({
      booking_id: booking.id,
      rider_name: booking.driver_name,
      rider_phone: booking.driver_phone,
      rider_photo: booking.driver_photo
    });
    setCurrentSessionId(sessionId);
    setRatingType('driver');
    setRating(0);
    setFeedback('');
    setRatingModalVisible(true);
  };

  const submitRating = async () => {
    if (!selectedRider) return;
    if (rating === 0) {
      showCustomAlert('Rating Required', 'Please select a rating before submitting', 'warning');
      return;
    }
    
    try {
      const endpoint = ratingType === 'rider' 
        ? `${API_BASE_URL}/ride-sessions/${currentSessionId}/rate-rider`
        : `${API_BASE_URL}/ride-sessions/${currentSessionId}/rate-driver-once`;
      
      const response = await axios.post(endpoint, {
        booking_id: selectedRider.booking_id,
        rating,
        feedback,
      });
      
      if (response.data.already_rated) {
        showCustomAlert('Already Rated', response.data.message, 'info');
      } else {
        showCustomAlert('Success', `Thank you for rating this ${ratingType === 'rider' ? 'rider' : 'driver'}!`, 'success');
      }
      
      setRatingModalVisible(false);
      onRefresh();
    } catch (error) {
      showCustomAlert('Error', error?.response?.data?.detail || 'Could not submit rating', 'error');
    }
  };

  const isRidePast = (departureTime) => {
    const now = new Date();
    const departure = new Date(departureTime);
    return departure < now;
  };

  const renderDateHeader = (ride, previousRide) => {
    if (!previousRide) return true;
    
    const currentDate = new Date(ride.departure_time);
    const previousDate = new Date(previousRide.departure_time);
    
    currentDate.setHours(0, 0, 0, 0);
    previousDate.setHours(0, 0, 0, 0);
    
    return currentDate.getTime() !== previousDate.getTime();
  };

  const getDateHeaderTitle = (date) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    const rideDate = new Date(date);
    rideDate.setHours(0, 0, 0, 0);
    
    if (rideDate.getTime() === today.getTime()) return "Today";
    if (rideDate.getTime() === tomorrow.getTime()) return "Tomorrow";
    if (rideDate > tomorrow) return "Upcoming Rides";
    return "Past Rides";
  };

  const getSortedPostedRides = () => {
    let rides = [...postedRides];
    const now = new Date();
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    rides = rides.map(ride => {
      const departureTime = new Date(ride.departure_time);
      const hoursSinceDeparture = (now - departureTime) / (1000 * 60 * 60);
      
      if (hoursSinceDeparture > 2 && !ride.started_at && !ride.completed_at && !ride.cancellation_reason) {
        ride.auto_cancelled = true;
      }
      return ride;
    });
    
    if (postedFilter !== "all") {
      rides = rides.filter((ride) => {
        const rideTime = new Date(ride.departure_time);
        const hoursSinceDeparture = (now - rideTime) / (1000 * 60 * 60);
        const isAutoCancelled = (hoursSinceDeparture > 2 && !ride.started_at && !ride.completed_at && !ride.cancellation_reason);
        
        if (postedFilter === "completed") {
          return ride.status === "completed" || ride.completed_at;
        }
        if (postedFilter === "cancelled") {
          return ride.cancellation_reason && !ride.cancellation_reason.includes("Auto-cancelled");
        }
        if (postedFilter === "autocancelled") {
          return isAutoCancelled || (ride.cancellation_reason && ride.cancellation_reason.includes("Auto-cancelled"));
        }
        if (postedFilter === "past") {
          return (ride.status === "completed" || ride.completed_at || ride.cancellation_reason || isAutoCancelled);
        }
        return true;
      });
    }
    
    const getDateCategory = (rideDate, ride) => {
      const rideDateOnly = new Date(rideDate);
      rideDateOnly.setHours(0, 0, 0, 0);
      const hoursSinceDeparture = (now - rideDateOnly) / (1000 * 60 * 60);
      
      if (postedFilter === "all") {
        if ((ride.status === "completed" || ride.completed_at || ride.cancellation_reason) && hoursSinceDeparture > 24) {
          return 'archived';
        }
      }
      if (postedFilter === "past") {
        return 'past';
      }
      if (rideDateOnly < today) return 'past';
      if (rideDateOnly.getTime() === today.getTime()) return 'today';
      if (rideDateOnly.getTime() === tomorrow.getTime()) return 'tomorrow';
      return 'future';
    };
    
    const getPriority = (ride) => {
      if (ride.started_at && !ride.completed_at && ride.status !== "completed") {
        return 0;
      }
      return 1;
    };
    
    rides.sort((a, b) => {
      const priorityA = getPriority(a);
      const priorityB = getPriority(b);
      
      if (priorityA !== priorityB) {
        return priorityA - priorityB;
      }
      
      const dateA = new Date(a.departure_time);
      const dateB = new Date(b.departure_time);
      const categoryA = getDateCategory(dateA, a);
      const categoryB = getDateCategory(dateB, b);
      
      let categoryOrder = {};
      if (postedFilter === "past") {
        categoryOrder = { 'past': 0 };
      } else {
        categoryOrder = { 'today': 0, 'tomorrow': 1, 'future': 2, 'past': 3, 'archived': 4 };
      }
      
      if (categoryOrder[categoryA] !== categoryOrder[categoryB]) {
        return categoryOrder[categoryA] - categoryOrder[categoryB];
      }
      
      const aTime = dateA.getTime();
      const bTime = dateB.getTime();
      
      if (categoryA === 'past' || categoryA === 'archived' || postedFilter === "past") {
        return bTime - aTime;
      } else {
        return aTime - bTime;
      }
    });
    
    if (postedFilter === "all") {
      rides = rides.filter(ride => getDateCategory(new Date(ride.departure_time), ride) !== 'archived');
    }
    
    return rides;
  };

  const getSortedRequestedRides = () => {
    let rides = [...requestedRides];
    const now = new Date();
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    rides = rides.map(ride => {
      const departureTime = new Date(ride.departure_time);
      const hoursSinceDeparture = (now - departureTime) / (1000 * 60 * 60);
      
      if (hoursSinceDeparture > 2 && !ride.ride_started_at && ride.ride_status !== "completed" && !ride.cancellation_reason) {
        ride.auto_cancelled = true;
      }
      return ride;
    });
    
    if (requestedFilter !== "all") {
      rides = rides.filter((ride) => {
        const rideTime = new Date(ride.departure_time);
        const hoursSinceDeparture = (now - rideTime) / (1000 * 60 * 60);
        const isAutoCancelled = (hoursSinceDeparture > 2 && !ride.ride_started_at && ride.ride_status !== "completed" && !ride.cancellation_reason);
        
        if (requestedFilter === "completed") {
          return ride.ride_status === "completed" || ride.completed_at;
        }
        if (requestedFilter === "cancelled") {
          return ride.ride_cancelled || ride.cancellation_reason || ride.ride_status === "cancelled";
        }
         if (ride.status === "cancelled" || ride.status === "rejected") {
      return requestedFilter === "cancelled" || requestedFilter === "past" || requestedFilter === "all";
    }
        if (requestedFilter === "autocancelled") {
          return isAutoCancelled || (ride.cancellation_reason && ride.cancellation_reason.includes("Auto-cancelled"));
        }
        if (requestedFilter === "rejected") {
          return ride.status === "rejected";
        }
        if (requestedFilter === "past") {
          const isPastRide = ride.ride_status === "completed" || 
                            ride.completed_at || 
                            ride.ride_cancelled || 
                            ride.cancellation_reason || 
                            ride.ride_status === "cancelled" ||
                            ride.status === "rejected" ||
                            isAutoCancelled;
          return isPastRide;
        }
        return true;
      });
    }
    
    if (requestedFilter === "all") {
      rides = rides.filter((ride) => {
        const departureTime = new Date(ride.departure_time);
        const hoursSinceDeparture = (now - departureTime) / (1000 * 60 * 60);
        
        const isCompletedAndOld = (ride.ride_status === "completed" || ride.completed_at) && hoursSinceDeparture > 24;
        const isCancelledAndOld = (ride.ride_cancelled || ride.cancellation_reason || ride.ride_status === "cancelled" || ride.auto_cancelled) && hoursSinceDeparture > 24;
        
        return !isCompletedAndOld && !isCancelledAndOld;
      });
    }
    
    const getDateCategory = (rideDate) => {
      const rideDateOnly = new Date(rideDate);
      rideDateOnly.setHours(0, 0, 0, 0);
      
      if (rideDateOnly < today) return 'past';
      if (rideDateOnly.getTime() === today.getTime()) return 'today';
      if (rideDateOnly.getTime() === tomorrow.getTime()) return 'tomorrow';
      return 'future';
    };
    
    const getPriority = (ride) => {
      if (ride.ride_started_at && ride.ride_status !== "completed") {
        return 0;
      }
      return 1;
    };
    
    rides.sort((a, b) => {
      const priorityA = getPriority(a);
      const priorityB = getPriority(b);
      
      if (priorityA !== priorityB) {
        return priorityA - priorityB;
      }
      
      const dateA = new Date(a.departure_time);
      const dateB = new Date(b.departure_time);
      const categoryA = getDateCategory(dateA);
      const categoryB = getDateCategory(dateB);
      
      const categoryOrder = { 'today': 0, 'tomorrow': 1, 'future': 2, 'past': 3 };
      
      if (categoryOrder[categoryA] !== categoryOrder[categoryB]) {
        return categoryOrder[categoryA] - categoryOrder[categoryB];
      }
      
      const aTime = dateA.getTime();
      const bTime = dateB.getTime();
      
      if (categoryA === 'past') {
        return bTime - aTime;
      } else {
        return aTime - bTime;
      }
    });
    
    return rides;
  };

  const getStatusColor = (status, cancellationReason, isPast, ride = null) => {
    if (ride?.status === "completed") return "#6B7280";
    if (ride?.started_at && status === "accepted" && ride?.status !== "completed") return "#10B981";
    if (cancellationReason && cancellationReason.includes("Auto-cancelled")) return "#9CA3AF";
    if (status === "cancelled" || cancellationReason) return "#DC2626";
    if (isPast && status === "accepted") return "#9CA3AF";
    switch (status) {
      case "accepted": case "active": return "#10B981";
      case "pending": return "#F59E0B";
      case "rejected": return "#DC2626";
      case "completed": return "#6B7280";
      default: return Colors.gray;
    }
  };

  const getStatusIcon = (status, cancellationReason, isPast, ride = null) => {
    if (ride?.status === "completed") return "checkmark-done";
    if (ride?.started_at && status === "accepted" && ride?.status !== "completed") return "car-sport";
    if (cancellationReason && cancellationReason.includes("Auto-cancelled")) return "timer-off";
    if (status === "cancelled" || cancellationReason) return "close-circle";
    if (isPast && status === "accepted") return "time-outline";
    switch (status) {
      case "active": case "accepted": return ride?.started_at && ride?.status !== "completed" ? "car-sport" : "checkmark-circle";
      case "completed": return "checkmark-done";
      case "rejected": return "close-circle";
      case "pending": return "time";
      default: return "ellipse";
    }
  };

  const getStatusText = (status, cancellationReason, isPast, ride = null) => {
    if (ride?.status === "completed") return "Completed";
    if (ride?.started_at && status === "accepted" && ride?.status !== "completed") return "Ride Ongoing";
    if (cancellationReason && cancellationReason.includes("Auto-cancelled")) return "Auto-cancelled";
    if (status === "cancelled" || cancellationReason) return "Cancelled";
    if (isPast && status === "accepted") return "Ride Completed";
    if (status === "full") return "Full";
    if (status === "active") return "Active";
    if (status === "accepted") return "Accepted";
    if (status === "pending") return "Pending";
    if (status === "rejected") return "Rejected";
    if (status === "completed") return "Completed";
    if (isPast) return "Expired";
    return status?.charAt(0).toUpperCase() + status?.slice(1) || "Unknown";
  };

  const isRideDisabled = (ride) => {
    const now = new Date();
    const departureTime = new Date(ride.departure_time);
    const hoursSinceDeparture = (now - departureTime) / (1000 * 60 * 60);
    
    return ride.status === "cancelled" || 
           ride.status === "completed" || 
           ride.cancellation_reason || 
           (hoursSinceDeparture > 2 && !ride.started_at);
  };

  const handleTabPress = (tab) => {
    Animated.sequence([
      Animated.timing(tabScaleAnim, { toValue: 0.95, duration: 100, useNativeDriver: true }),
      Animated.timing(tabScaleAnim, { toValue: 1, duration: 100, useNativeDriver: true }),
    ]).start();
    setActiveTab(tab);
  };

  const handleFilterPress = () => {
    setTempFilter(activeTab === "posted" ? postedFilter : requestedFilter);
    setShowFilterModal(true);
  };

  const applyFilter = () => {
    if (activeTab === "posted") {
      setPostedFilter(tempFilter);
    } else {
      setRequestedFilter(tempFilter);
    }
    setShowFilterModal(false);
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
    const timeText = date.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", hour12: false });
    return { dayText, timeText };
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

  const renderProfileImage = (imageUrl, name, size = 48, style = {}) => {
    const url = buildImageUrl(imageUrl);
    const isSvg = isSvgImage(url);
    if (url && isSvg) {
      return (
        <View style={[styles.avatarContainer, { width: size, height: size, borderRadius: size / 2 }, style]}>
          <SvgCssUri uri={url} width={size} height={size} />
        </View>
      );
    } else if (url) {
      return (
        <Image 
          source={{ uri: url }} 
          style={[styles.avatarImage, { width: size, height: size, borderRadius: size / 2 }, style]} 
          resizeMode="cover" 
        />
      );
    } else {
      return (
        <View style={[styles.avatarPlaceholder, { width: size, height: size, borderRadius: size / 2 }, style]}>
          <Text style={[styles.avatarPlaceholderText, { fontSize: size / 2.5 }]}>{getInitials(name)}</Text>
        </View>
      );
    }
  };

const getRiderPickupLocation = (booking) => {
  // ✅ PRIORITY 1: Use saved pickup_address from booking (already in DB)
  if (booking.pickup_address && booking.pickup_address !== 'null' && booking.pickup_address !== 'undefined') {
    // If there's a place name, show it as landmark
    if (booking.pickup_place_name && booking.pickup_place_name !== 'null' && booking.pickup_place_name !== 'undefined') {
      return `${booking.pickup_address}\n📍 Landmark: ${booking.pickup_place_name}`;
    }
    // Show full address
    return booking.pickup_address;
  }
  
  // ✅ PRIORITY 2: Use pickup_place_name
  if (booking.pickup_place_name && booking.pickup_place_name !== 'null' && booking.pickup_place_name !== 'undefined') {
    return booking.pickup_place_name;
  }
  
  // ✅ FALLBACK: Use intersection point from route
  if (booking.intersection_pickup_lat && booking.intersection_pickup_lon) {
    const walkDist = booking.pickup_walk_distance_m;
    const address = addressCache[`${booking.intersection_pickup_lat},${booking.intersection_pickup_lon}`];
    if (address) {
      if (walkDist && walkDist > 0) {
        return `🚩 ${address} (${walkDist}m walk from your location)`;
      }
      return `🚩 ${address}`;
    }
    if (walkDist && walkDist > 0) {
      return `🚩 Meet point (${walkDist}m walk from your location)`;
    }
    return "🚩 Meet point on driver's route";
  }
  
  // ✅ FALLBACK: Use original pickup coordinates
  if (booking.pickup_lat && booking.pickup_lon) {
    const address = addressCache[`${booking.pickup_lat},${booking.pickup_lon}`];
    if (address) {
      return `📍 ${address}`;
    }
    return "📍 Your pickup location";
  }
  
  // ✅ LAST FALLBACK: Use origin
  if (booking.origin && booking.origin !== 'null' && booking.origin !== 'undefined') {
    return `📍 ${booking.origin.split(',')[0]}`;
  }
  
  return "📍 Pickup location not specified";
};

const getRiderDropoffLocation = (booking) => {
  // ✅ PRIORITY 1: Use saved dropoff_address from booking (already in DB)
  if (booking.dropoff_address && booking.dropoff_address !== 'null' && booking.dropoff_address !== 'undefined') {
    // If there's a place name, show it as landmark
    if (booking.dropoff_place_name && booking.dropoff_place_name !== 'null' && booking.dropoff_place_name !== 'undefined') {
      return `${booking.dropoff_address}\n📍 Landmark: ${booking.dropoff_place_name}`;
    }
    // Show full address
    return booking.dropoff_address;
  }
  
  // ✅ PRIORITY 2: Use dropoff_place_name
  if (booking.dropoff_place_name && booking.dropoff_place_name !== 'null' && booking.dropoff_place_name !== 'undefined') {
    return booking.dropoff_place_name;
  }
  
  // ✅ FALLBACK: Use intersection point from route
  if (booking.intersection_drop_lat && booking.intersection_drop_lon) {
    const walkDist = booking.drop_walk_distance_m;
    const address = addressCache[`${booking.intersection_drop_lat},${booking.intersection_drop_lon}`];
    if (address) {
      if (walkDist && walkDist > 0) {
        return `🏁 ${address} (${walkDist}m walk to destination)`;
      }
      return `🏁 ${address}`;
    }
    if (walkDist && walkDist > 0) {
      return `🏁 Drop point (${walkDist}m walk to destination)`;
    }
    return "🏁 Drop point on driver's route";
  }
  
  // ✅ FALLBACK: Use original dropoff coordinates
  if (booking.drop_lat && booking.drop_lon) {
    const address = addressCache[`${booking.drop_lat},${booking.drop_lon}`];
    if (address) {
      return `📍 ${address}`;
    }
    return "📍 Your dropoff location";
  }
  
  // ✅ LAST FALLBACK: Use destination
  if (booking.destination && booking.destination !== 'null' && booking.destination !== 'undefined') {
    return `📍 ${booking.destination.split(',')[0]}`;
  }
  
  return "📍 Dropoff location not specified";
};

  // Fetch addresses for all bookings
  useEffect(() => {
    const fetchAllAddresses = async () => {
      const allCoordinates = [];
      
      postedRides.forEach(ride => {
        if (ride.bookings && Array.isArray(ride.bookings)) {
          ride.bookings.forEach(booking => {
            if (!booking.pickup_address && booking.intersection_pickup_lat && booking.intersection_pickup_lon) {
              const key = `${booking.intersection_pickup_lat},${booking.intersection_pickup_lon}`;
              if (!addressCache[key] && !allCoordinates.find(c => c.key === key)) {
                allCoordinates.push({ key, lat: booking.intersection_pickup_lat, lng: booking.intersection_pickup_lon });
              }
            } else if (!booking.pickup_address && booking.pickup_lat && booking.pickup_lon) {
              const key = `${booking.pickup_lat},${booking.pickup_lon}`;
              if (!addressCache[key] && !allCoordinates.find(c => c.key === key)) {
                allCoordinates.push({ key, lat: booking.pickup_lat, lng: booking.pickup_lon });
              }
            }
            
            if (!booking.dropoff_address && booking.intersection_drop_lat && booking.intersection_drop_lon) {
              const key = `${booking.intersection_drop_lat},${booking.intersection_drop_lon}`;
              if (!addressCache[key] && !allCoordinates.find(c => c.key === key)) {
                allCoordinates.push({ key, lat: booking.intersection_drop_lat, lng: booking.intersection_drop_lon });
              }
            } else if (!booking.dropoff_address && booking.drop_lat && booking.drop_lon) {
              const key = `${booking.drop_lat},${booking.drop_lon}`;
              if (!addressCache[key] && !allCoordinates.find(c => c.key === key)) {
                allCoordinates.push({ key, lat: booking.drop_lat, lng: booking.drop_lon });
              }
            }
          });
        }
      });
      
      requestedRides.forEach(booking => {
        if (!booking.pickup_address && booking.intersection_pickup_lat && booking.intersection_pickup_lon) {
          const key = `${booking.intersection_pickup_lat},${booking.intersection_pickup_lon}`;
          if (!addressCache[key] && !allCoordinates.find(c => c.key === key)) {
            allCoordinates.push({ key, lat: booking.intersection_pickup_lat, lng: booking.intersection_pickup_lon });
          }
        } else if (!booking.pickup_address && booking.pickup_lat && booking.pickup_lon) {
          const key = `${booking.pickup_lat},${booking.pickup_lon}`;
          if (!addressCache[key] && !allCoordinates.find(c => c.key === key)) {
            allCoordinates.push({ key, lat: booking.pickup_lat, lng: booking.pickup_lon });
          }
        }
        
        if (!booking.dropoff_address && booking.intersection_drop_lat && booking.intersection_drop_lon) {
          const key = `${booking.intersection_drop_lat},${booking.intersection_drop_lon}`;
          if (!addressCache[key] && !allCoordinates.find(c => c.key === key)) {
            allCoordinates.push({ key, lat: booking.intersection_drop_lat, lng: booking.intersection_drop_lon });
          }
        } else if (!booking.dropoff_address && booking.drop_lat && booking.drop_lon) {
          const key = `${booking.drop_lat},${booking.drop_lon}`;
          if (!addressCache[key] && !allCoordinates.find(c => c.key === key)) {
            allCoordinates.push({ key, lat: booking.drop_lat, lng: booking.drop_lon });
          }
        }
      });
      
      if (allCoordinates.length === 0) return;
      
      setLoadingAddresses(true);
      
      const batchSize = 5;
      for (let i = 0; i < allCoordinates.length; i += batchSize) {
        const batch = allCoordinates.slice(i, i + batchSize);
        await Promise.all(batch.map(async (coord) => {
          await getAddressFromCoordsGoogle(coord.lat, coord.lng);
        }));
        
        if (i + batchSize < allCoordinates.length) {
          await new Promise(resolve => setTimeout(resolve, 200));
        }
      }
      
      setLoadingAddresses(false);
    };
    
    if ((postedRides.length > 0 || requestedRides.length > 0) && !loadingAddresses) {
      fetchAllAddresses();
    }
  }, [postedRides, requestedRides]);

  const getActualBookedSeats = (ride) => {
    if (!ride.bookings || !Array.isArray(ride.bookings)) return 0;
    
    const activeBookings = ride.bookings.filter(bookingItem => {
      if (bookingItem.status === 'cancelled') return false;
      if (bookingItem.modification_request?.status === 'rejected') return false;
      return bookingItem.status === 'accepted';
    });
    
    const totalBooked = activeBookings.reduce((sum, bookingItem) => {
      if (bookingItem.modification_request?.status === 'approved') {
        return sum + (bookingItem.modification_request.requested_seats || 0);
      }
      return sum + (bookingItem.seats_requested || 0);
    }, 0);
    
    return totalBooked;
  };

  const getActualAvailableSeats = (ride) => {
    const totalSeats = ride.available_seats || ride.total_seats || 0;
    const bookedSeats = getActualBookedSeats(ride);
    return Math.max(0, totalSeats - bookedSeats);
  };

  const checkModificationAvailability = async (bookingId) => {
    try {
      const response = await axios.get(`${API_BASE_URL}/booking/${bookingId}/modification-available`);
      return response.data;
    } catch (error) {
      console.log('Error checking modification availability:', error);
      return { available: false, reason: 'Could not check availability' };
    }
  };
const checkSeatAvailability = async (bookingId) => {
  try {
    const response = await axios.get(`${API_BASE_URL}/booking/${bookingId}/seat-availability`);
    // Make sure we're getting the correct data structure
    const data = response.data;
    return {
      available: data.available || false,
      total_seats: data.total_seats || data.ride_total_seats || 0,
      booked_seats: data.booked_seats || data.current_bookings || 0,
      available_seats: data.available_seats || (data.total_seats - data.booked_seats) || 0,
      reason: data.reason || null
    };
  } catch (error) {
    console.log('Error checking seat availability:', error);
    return { 
      available: false, 
      total_seats: 0, 
      booked_seats: 0, 
      available_seats: 0,
      reason: 'Could not check availability' 
    };
  }
};

  const openModifySeatsModal = async (booking) => {
  // Check if ride has already started
  if (booking.ride_started_at || booking.started_at) {
    showCustomAlert('Ride Started', 'Cannot modify seats after the ride has started.', 'warning');
    return;
  }
  
  // Check if modification is already pending
  if (booking.modification_request && booking.modification_request.status === 'pending') {
    showCustomAlert('Modification Pending', 'You already have a pending modification request. Please wait for driver approval.', 'warning');
    return;
  }
  
  // Check if modification was already used
  if (booking.modification_request && booking.modification_request.id !== null) {
    showCustomAlert('Modification Already Used', 'You have already used your one-time modification for this booking.', 'info');
    return;
  }
  
  // Check modification availability including seat availability
  const availability = await checkModificationAvailability(booking.id);
  if (!availability.available) {
    showCustomAlert('Cannot Modify', availability.reason || 'Modification is not available for this ride at this time.', 'warning');
    return;
  }
  
  // Get current seat availability from the ride
  const seatAvailability = await checkSeatAvailability(booking.id);
  
  // Debug log to see what's coming from API
  console.log('Seat availability response:', seatAvailability);
  
  // Calculate available seats correctly
  // The available seats should be total seats minus currently booked seats
  // But also consider that the user already has seats booked
  const totalSeats = seatAvailability.total_seats || booking.available_seats || 4;
  const currentlyBooked = seatAvailability.booked_seats || 0;
  const actualAvailableSeats = totalSeats - currentlyBooked;
  
  // Maximum seats the user can request = currently available seats + their current seats
  // Because they can either keep their seats, request fewer, or request up to what's available
  const currentUserSeats = booking.seats_requested || 1;
  const maxSeatsAllowed = actualAvailableSeats + currentUserSeats;
  
  // Ensure max seats doesn't exceed total vehicle capacity
  const maxSeats = Math.min(maxSeatsAllowed, totalSeats);
  
  console.log(`Total: ${totalSeats}, Booked: ${currentlyBooked}, Available: ${actualAvailableSeats}, Current User Seats: ${currentUserSeats}, Max: ${maxSeats}`);
  
  setSelectedBookingForModification({
    ...booking,
    ride_total_seats: totalSeats,
    ride_booked_seats: currentlyBooked,
    ride_available_seats: actualAvailableSeats,
    current_seats: currentUserSeats
  });
  setModifySeatsValue(currentUserSeats);
  setMaxModifySeats(maxSeats);
  setModifySeatsModalVisible(true);
};

  const submitModifySeatsRequest = async () => {
    if (!selectedBookingForModification) return;
    
    // Double check if ride has started
    if (selectedBookingForModification.ride_started_at || selectedBookingForModification.started_at) {
      showCustomAlert('Ride Started', 'Cannot modify seats after the ride has started.', 'warning');
      setModifySeatsModalVisible(false);
      return;
    }
    
    const currentSeats = selectedBookingForModification.seats_requested || 1;
    
    if (modifySeatsValue === currentSeats) {
      showCustomAlert('No Change', 'Seat count is already set to this value.', 'info');
      setModifySeatsModalVisible(false);
      return;
    }
    
    if (modifySeatsValue < 1) {
      showCustomAlert('Invalid Seats', 'Minimum 1 seat required.', 'warning');
      return;
    }
    
    if (modifySeatsValue > maxModifySeats) {
      showCustomAlert('Not Enough Seats', `Only ${maxModifySeats} seat(s) available.`, 'warning');
      return;
    }
    
    setModifySeatsLoading(true);
    try {
      const response = await axios.post(`${API_BASE_URL}/api/v1/modifications/request/${selectedBookingForModification.id}`, {
        requested_seats: modifySeatsValue
      });
      
      if (response.data.success) {
        showCustomAlert('Request Sent', `Request to change to ${modifySeatsValue} seat(s) sent to driver.`, 'info');
        setModifySeatsModalVisible(false);
        onRefresh();
      } else {
        showCustomAlert('Error', response.data.message || 'Failed to send modification request.', 'error');
      }
    } catch (error) {
      console.error('Modification request error:', error);
      const errorMsg = error.response?.data?.detail || error.message || 'Failed to send modification request.';
      showCustomAlert('Error', errorMsg, 'error');
    } finally {
      setModifySeatsLoading(false);
    }
  };

  const renderPostedRideCard = (ride) => {
    const hasPendingBookings = Array.isArray(ride.bookings) ? ride.bookings.some((b) => b.status === "pending") : false;
    const hasPendingModifications = Array.isArray(ride.bookings) ? ride.bookings.some((b) => b.modification_request && b.modification_request.status === "pending") : false;
    const isExpanded = expandedPostedRides[ride.id];
    const isDisabled = isRideDisabled(ride);
    const isAutoCancelled = ride.cancellation_reason && ride.cancellation_reason.includes("Auto-cancelled") || ride.auto_cancelled;
    
    const actualBookedSeats = getActualBookedSeats(ride);
    const actualAvailableSeats = getActualAvailableSeats(ride);
    
    const startRideEnabled = canStartRide(ride);
    const departureTime = new Date(ride.departure_time);
    const now = new Date();
    const minutesToDeparture = Math.ceil((departureTime - now) / (1000 * 60));
    const minutesSinceDeparture = Math.ceil((now - departureTime) / (1000 * 60));
    const hoursSinceDeparture = (now - departureTime) / (1000 * 60 * 60);
    const rideStatusInfo = getRideStatusInfo(ride);
    const cancellationInfo = getCancellationStatusDisplay(ride);
    const hasCancelledBookings = ride.bookings?.some(b => b.status === "cancelled") || false;
    const cancelledBookingsCount = ride.bookings?.filter(b => b.status === "cancelled")?.length || 0;
    const isRideCompleted = ride.status === "completed" || ride.completed_at;
    
    const pendingModifications = ride.bookings?.filter(b => 
      b.modification_request && b.modification_request.status === "pending"
    ) || [];
    
    const rejectedModifications = ride.bookings?.filter(b => 
      b.modification_request && b.modification_request.status === "rejected"
    ) || [];
    
    const getStartButtonText = () => {
      if (ride?.live_session?.session_id) return 'Open Ongoing Ride';
      if (minutesSinceDeparture > 0 && minutesSinceDeparture <= 120) {
        return `Start Ride (${minutesSinceDeparture} min late)`;
      }
      if (minutesToDeparture <= 15 && minutesToDeparture > 0) {
        return `Start Ride (in ${minutesToDeparture} min)`;
      }
      return 'Start Ride';
    };
    
    return (
      <View key={ride.id} style={[styles.card, targetRideId === ride.id && styles.highlightRideCard]}>
        <TouchableOpacity style={styles.cardHeader} onPress={() => togglePostedRideExpand(ride.id)} activeOpacity={0.7}>
          <View style={styles.routeContainer}>
            <View style={styles.locationDot}>
              <View style={[styles.dot, { backgroundColor: Colors.success }]} />
              <View style={styles.line} />
              <View style={[styles.dot, { backgroundColor: Colors.secondary }]} />
            </View>
            <View style={styles.routeTextContainer}>
              <Text style={styles.routeOrigin} numberOfLines={1}>{ride.origin?.split(",")[0] || "Origin"}</Text>
              <Text style={styles.routeDestination} numberOfLines={1}>{ride.destination?.split(",")[0] || "Destination"}</Text>
            </View>
          </View>
          <View style={styles.cardHeaderRight}>
            <View style={[styles.statusBadge, { backgroundColor: rideStatusInfo.color }]}>
              <Ionicons name={rideStatusInfo.icon} size={12} color={Colors.white} style={styles.statusIcon} />
              <Text style={styles.statusText}>{rideStatusInfo.text}</Text>
            </View>
            {cancellationInfo && (
              <View style={[styles.cancelledBadge, { backgroundColor: cancellationInfo.color }]}>
                <Ionicons name={cancellationInfo.icon} size={10} color="#fff" />
                <Text style={styles.cancelledBadgeText}>CANCELLED</Text>
              </View>
            )}
            {pendingModifications.length > 0 && !cancellationInfo && (
              <View style={styles.pendingModificationBadge}>
                <Ionicons name="swap" size={10} color="#fff" />
                <Text style={styles.pendingModificationBadgeText}>{pendingModifications.length}</Text>
              </View>
            )}
            {rejectedModifications.length > 0 && !cancellationInfo && (
              <View style={[styles.pendingModificationBadge, { backgroundColor: "#DC2626" }]}>
                <Ionicons name="close" size={10} color="#fff" />
                <Text style={styles.pendingModificationBadgeText}>{rejectedModifications.length}</Text>
              </View>
            )}
            <Ionicons name={isExpanded ? "chevron-up" : "chevron-down"} size={20} color={Colors.gray} style={styles.expandIcon} />
          </View>
        </TouchableOpacity>

        {isExpanded && pendingModifications.length > 0 && !cancellationInfo && (
          <View style={styles.pendingModificationsSection}>
            <View style={styles.pendingModificationsHeader}>
              <Ionicons name="swap" size={18} color="#F59E0B" />
              <Text style={styles.pendingModificationsTitle}>Pending Modification Requests ({pendingModifications.length})</Text>
            </View>
            {pendingModifications.map((modificationItem) => (
              <View key={modificationItem.id} style={styles.pendingModificationCard}>
                <View style={styles.pendingModificationContent}>
                  <View style={styles.pendingModificationAvatar}>
                    {renderProfileImage(modificationItem.passenger_photo, modificationItem.passenger_name || "Rider", 40)}
                  </View>
                  <View style={styles.pendingModificationInfo}>
                    <Text style={styles.pendingModificationPassengerName}>{modificationItem.passenger_name || "Rider"}</Text>
                    <View style={styles.pendingModificationSeatChange}>
                      <Text style={styles.oldSeatCount}>{modificationItem.modification_request.current_seats} seats</Text>
                      <Ionicons name="arrow-forward" size={12} color="#F59E0B" />
                      <Text style={styles.newSeatCount}>{modificationItem.modification_request.requested_seats} seats</Text>
                    </View>
                    <Text style={styles.pendingModificationTime}>
                      Requested: {new Date(modificationItem.modification_request.created_at).toLocaleString()}
                    </Text>
                  </View>
                </View>
                <View style={styles.pendingModificationActions}>
                  <TouchableOpacity 
                    style={[styles.modActionBtn, styles.approveModBtn]} 
                    onPress={() => handleModificationAction(modificationItem.modification_request.id, 'approve', modificationItem.id)}>
                    <Ionicons name="checkmark" size={16} color="#fff" />
                    <Text style={styles.modActionBtnText}>Approve</Text>
                  </TouchableOpacity>
                  <TouchableOpacity 
                    style={[styles.modActionBtn, styles.rejectModBtn]} 
                    onPress={() => handleModificationAction(modificationItem.modification_request.id, 'reject', modificationItem.id)}>
                    <Ionicons name="close" size={16} color="#fff" />
                    <Text style={styles.modActionBtnText}>Reject</Text>
                  </TouchableOpacity>
                </View>
              </View>
            ))}
          </View>
        )}

        {isExpanded && rejectedModifications.length > 0 && !cancellationInfo && (
          <View style={[styles.pendingModificationsSection, { backgroundColor: '#FEF2F2', borderColor: '#FEE2E2' }]}>
            <View style={styles.pendingModificationsHeader}>
              <Ionicons name="close-circle" size={18} color="#DC2626" />
              <Text style={[styles.pendingModificationsTitle, { color: '#DC2626' }]}>Rejected Modification Requests - Bookings Cancelled</Text>
            </View>
            {rejectedModifications.map((rejectedItem) => (
              <View key={rejectedItem.id} style={[styles.pendingModificationCard, { backgroundColor: '#FFF5F5', borderColor: '#FEE2E2' }]}>
                <View style={styles.pendingModificationContent}>
                  <View style={styles.pendingModificationAvatar}>
                    {renderProfileImage(rejectedItem.passenger_photo, rejectedItem.passenger_name || "Rider", 40)}
                  </View>
                  <View style={styles.pendingModificationInfo}>
                    <Text style={styles.pendingModificationPassengerName}>{rejectedItem.passenger_name || "Rider"}</Text>
                    <View style={styles.pendingModificationSeatChange}>
                      <Text style={[styles.oldSeatCount, { textDecorationLine: 'line-through' }]}>{rejectedItem.modification_request.current_seats} seats</Text>
                      <Ionicons name="arrow-forward" size={12} color="#DC2626" />
                      <Text style={[styles.newSeatCount, { color: '#DC2626', textDecorationLine: 'line-through' }]}>{rejectedItem.modification_request.requested_seats} seats</Text>
                    </View>
                    <Text style={[styles.pendingModificationTime, { color: '#DC2626' }]}>
                      ❌ Rejected - Booking Cancelled
                    </Text>
                    <Text style={[styles.pendingModificationTime, { color: '#DC2626' }]}>
                      Original {rejectedItem.modification_request.current_seats} seat(s) cancelled
                    </Text>
                    {rejectedItem.modification_request.rejection_reason && (
                      <Text style={styles.rejectionReasonText}>Reason: {rejectedItem.modification_request.rejection_reason}</Text>
                    )}
                  </View>
                </View>
                <View style={styles.rejectedModificationBadge}>
                  <Ionicons name="warning-outline" size={14} color="#DC2626" />
                  <Text style={styles.rejectedModificationBadgeText}>Booking Cancelled • Seats Released</Text>
                </View>
              </View>
            ))}
          </View>
        )}

        {cancellationInfo && (
          <View style={styles.cancellationBanner}>
            <Ionicons name={cancellationInfo.icon} size={18} color={cancellationInfo.color} />
            <View style={styles.cancellationBannerText}>
              <Text style={[styles.cancellationBannerTitle, { color: cancellationInfo.color }]}>
                {cancellationInfo.text}
              </Text>
              <Text style={styles.cancellationBannerMessage}>{cancellationInfo.message}</Text>
            </View>
          </View>
        )}

        {hasCancelledBookings && (
          <View style={styles.cancelledBookingsSummary}>
            <Ionicons name="warning-outline" size={14} color="#DC2626" />
            <Text style={styles.cancelledBookingsText}>
              {cancelledBookingsCount} booking(s) were cancelled due to ride cancellation
            </Text>
          </View>
        )}

        {isExpanded && !cancellationInfo && (
          <View>
            {isAutoCancelled && (
              <View style={styles.cancellationReasonContainer}>
                <Ionicons name="information-circle" size={14} color="#DC2626" />
                <Text style={styles.cancellationReasonText}>{ride.cancellation_reason || "Ride auto-cancelled as it was not started within 2 hours of departure time."}</Text>
              </View>
            )}

            <View style={styles.cardDetails}>
              <View style={styles.detailItem}>
                <Ionicons name="calendar-outline" size={16} color={Colors.gray} />
                <Text style={styles.detailText}>{formatDate(ride.departure_time).dayText}</Text>
                <Text style={styles.detailTextSecondary}>{formatDate(ride.departure_time).timeText}</Text>
              </View>
              <View style={styles.detailDivider} />
              <View style={styles.detailItem}>
                <Ionicons name="people-outline" size={16} color={Colors.gray} />
                <View style={{ flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap' }}>
                  <Text style={styles.detailText}>
                    {actualBookedSeats} / {ride.available_seats} seats
                  </Text>
                </View>
              </View>
              <View style={styles.detailDivider} />
              <View style={styles.detailItem}>
                <Ionicons name="wallet-outline" size={16} color={Colors.gray} />
                <Text style={styles.detailTextPrice}>₹{ride.price_per_seat}</Text>
                <Text style={styles.detailTextSecondary}>/seat</Text>
              </View>
            </View>

            <TouchableOpacity style={styles.viewRouteBtn} onPress={() => handleViewRideDetails(ride)}>
              <Ionicons name="map-outline" size={16} color={Colors.primary} />
              <Text style={styles.viewRouteBtnText}>View Route Details</Text>
            </TouchableOpacity>

            {!isRideCompleted && !isDisabled && !ride.started_at && hoursSinceDeparture <= 2 && ride.status !== "completed" && rideStatusInfo.type !== 'auto-cancelled' && (
              <View style={styles.driverActionWrapper}>
                <TouchableOpacity 
                  style={[styles.startRideBtn, (!startRideEnabled && rideStatusInfo.type !== 'late') && styles.startRideBtnDisabled]} 
                  onPress={() => handleStartRide(ride)} 
                  activeOpacity={0.85} 
                  disabled={!startRideEnabled && rideStatusInfo.type !== 'late'}>
                  <Text style={styles.startRideBtnText}>
                    {getStartButtonText()}
                  </Text>
                </TouchableOpacity>
                <View style={styles.secondaryActionsRow}>
                  <TouchableOpacity style={styles.secondaryBtn} onPress={() => handleEditRide(ride)} activeOpacity={0.85}>
                    <Text style={styles.secondaryBtnText}>Edit Details</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.secondaryBtn} onPress={() => cancelRide(ride.id)} activeOpacity={0.85}>
                    <Text style={styles.secondaryBtnText}>Cancel</Text>
                  </TouchableOpacity>
                </View>
              </View>
            )}

            {ride.started_at && !isRideCompleted && (
              <TouchableOpacity style={[styles.startRideBtn, { backgroundColor: "#10B981" }]} onPress={() => navigation.navigate('OngoingRideDriverScreen', { rideId: ride.id, sessionId: ride.live_session?.session_id })}>
                <Text style={styles.startRideBtnText}>Continue Ride</Text>
              </TouchableOpacity>
            )}

            {isRideCompleted && ride.live_session?.session_id && (
              <View style={styles.rateRidersSection}>
                <Text style={styles.rateSectionTitle}>Rate Your Riders</Text>
                {ride.bookings?.filter(rateItem => rateItem.status === "accepted" && rateItem.modification_request?.status !== "rejected").map((rateItem) => (
                  <View key={rateItem.id} style={styles.rateRiderItem}>
                    <View style={styles.rateRiderInfo}>
                      {renderProfileImage(rateItem.passenger_photo, rateItem.passenger_name, 40)}
                      <View>
                        <Text style={styles.rateRiderName}>{rateItem.passenger_name}</Text>
                        <Text style={styles.rateRiderSeats}>
                          {rateItem.modification_request?.status === "approved" 
                            ? rateItem.modification_request.requested_seats 
                            : rateItem.seats_requested} seats
                        </Text>
                      </View>
                    </View>
                    {rateItem.driver_rating ? (
                      <View style={styles.alreadyRatedBadge}>
                        <Ionicons name="star" size={14} color="#F59E0B" />
                        <Text style={styles.alreadyRatedText}>Rated {rateItem.driver_rating}/5</Text>
                      </View>
                    ) : (
                      <TouchableOpacity 
                        style={styles.rateRiderBtn}
                        onPress={() => openRateRiderModal(rateItem, ride.live_session.session_id)}>
                        <Text style={styles.rateRiderBtnText}>Rate</Text>
                      </TouchableOpacity>
                    )}
                  </View>
                ))}
              </View>
            )}

            {Array.isArray(ride.bookings) && ride.bookings.length > 0 && !isRideCompleted && !isAutoCancelled && (
              <View style={styles.bookingsSection}>
                <View style={styles.bookingSectionHeader}>
                  <Text style={styles.bookingsTitle}>Rider Requests ({ride.bookings.length})</Text>
                  <View style={{ flexDirection: 'row', gap: 8, alignItems: 'center' }}>
                    {(hasPendingBookings || hasPendingModifications) && (
                      <View style={styles.pendingChip}>
                        <Text style={styles.pendingChipText}>Action needed</Text>
                      </View>
                    )}
                    {actualAvailableSeats > 0 && (
                      <View style={[styles.pendingChip, { backgroundColor: '#E8F5E9' }]}>
                        <Text style={[styles.pendingChipText, { color: '#2E7D32' }]}>
                          {actualAvailableSeats} seats available
                        </Text>
                      </View>
                    )}
                  </View>
                </View>
                {ride.bookings.map((bookingItem) => {
                  const bookingCancellationInfo = getCancellationStatusDisplay(bookingItem);
                  const hasModificationRequest = bookingItem.modification_request && bookingItem.modification_request.status === "pending";
                  const isModificationRejected = bookingItem.modification_request && bookingItem.modification_request.status === "rejected";
                  const isModificationApproved = bookingItem.modification_request && bookingItem.modification_request.status === "approved";
                  const riderPickupLocation = getRiderPickupLocation(bookingItem);
                  const riderDropoffLocation = getRiderDropoffLocation(bookingItem);
                  
                  const bookingStatus = isModificationRejected ? "cancelled" : bookingItem.status;
                  const bookingStatusText = isModificationRejected ? "Booking Cancelled" : getStatusText(bookingItem.status, bookingItem.cancellation_reason, false, ride);
                  const bookingStatusColor = isModificationRejected ? "#DC2626" : getStatusColor(bookingItem.status, bookingItem.cancellation_reason, false, ride);
                  
                  const actualSeats = isModificationApproved 
                    ? bookingItem.modification_request.requested_seats 
                    : bookingItem.seats_requested;
                  
                  return (
                    <View key={bookingItem.id} style={[styles.bookingCard, targetBookingId === bookingItem.id && styles.highlightBookingCard, isModificationRejected && { opacity: 0.7, backgroundColor: '#FEF2F2' }]}>
                      <View style={styles.bookingHeader}>
                        <View style={styles.bookingInfo}>
                          <TouchableOpacity onPress={() => handleViewProfile(null, bookingItem.passenger_phone, bookingItem.passenger_name || "Rider", bookingItem.passenger_photo)} activeOpacity={0.8}>
                            {renderProfileImage(bookingItem.passenger_photo, bookingItem.passenger_name || "Rider", 40)}
                          </TouchableOpacity>
                          <View style={styles.bookingInfoText}>
                            <TouchableOpacity onPress={() => handleViewProfile(null, bookingItem.passenger_phone, bookingItem.passenger_name || "Rider", bookingItem.passenger_photo)}>
                              <Text style={styles.bookingPhone}>{bookingItem.passenger_name || bookingItem.passenger_phone || "Rider"}</Text>
                            </TouchableOpacity>
                            <Text style={[styles.bookingSeats, (isModificationRejected || isModificationApproved) && { fontWeight: '500' }, isModificationRejected && { textDecorationLine: 'line-through', color: '#DC2626' }]}>
                              {actualSeats} seat{actualSeats > 1 ? "s" : ""}
                              {isModificationApproved && " (Updated)"}
                              {isModificationRejected && " (Cancelled)"}
                            </Text>
                            
                            <View style={styles.riderMiniLocation}>
                              <Ionicons name="location" size={12} color={isModificationRejected ? "#DC2626" : "#10B981"} />
                              <Text style={[styles.riderMiniLocationText, isModificationRejected && { color: '#DC2626' }]} numberOfLines={2}>
                                Pickup: {riderPickupLocation}
                              </Text>
                            </View>

                            <View style={styles.riderMiniLocation}>
                              <Ionicons name="flag" size={12} color={isModificationRejected ? "#DC2626" : "#DC2626"} />
                              <Text style={[styles.riderMiniLocationText, isModificationRejected && { color: '#DC2626' }]} numberOfLines={2}>
                                Dropoff: {riderDropoffLocation}
                              </Text>
                            </View>
                            
                            {(bookingItem.pickup_walk_distance_m > 0 || bookingItem.drop_walk_distance_m > 0) && !isModificationRejected && (
                              <View style={styles.riderWalkInfo}>
                                <Ionicons name="walk" size={10} color="#6B7280" />
                                <Text style={styles.riderWalkInfoText}>
                                  {bookingItem.pickup_walk_distance_m > 0 && `${bookingItem.pickup_walk_distance_m}m walk to pickup`}
                                  {bookingItem.pickup_walk_distance_m > 0 && bookingItem.drop_walk_distance_m > 0 && ' • '}
                                  {bookingItem.drop_walk_distance_m > 0 && `${bookingItem.drop_walk_distance_m}m walk from dropoff`}
                                </Text>
                              </View>
                            )}
                            
                            {hasModificationRequest && (
                              <View style={styles.modificationBadge}>
                                <Ionicons name="swap" size={10} color="#F59E0B" />
                                <Text style={styles.modificationBadgeText}>
                                  Modification: {bookingItem.modification_request.current_seats} → {bookingItem.modification_request.requested_seats} seats
                                </Text>
                              </View>
                            )}
                            
                            {isModificationApproved && (
                              <View style={[styles.modificationBadge, { backgroundColor: '#E8F5E9' }]}>
                                <Ionicons name="checkmark-circle" size={10} color="#10B981" />
                                <Text style={[styles.modificationBadgeText, { color: '#2E7D32' }]}>
                                  Modification Approved: {bookingItem.modification_request.current_seats} → {bookingItem.modification_request.requested_seats} seats
                                </Text>
                              </View>
                            )}
                            
                            {isModificationRejected && (
                              <View style={[styles.modificationBadge, { backgroundColor: '#FEE2E2' }]}>
                                <Ionicons name="close-circle" size={10} color="#DC2626" />
                                <Text style={[styles.modificationBadgeText, { color: '#DC2626' }]}>
                                  Modification Rejected - Booking Cancelled
                                </Text>
                              </View>
                            )}
                          </View>
                          {!isModificationRejected && (
                            <TouchableOpacity style={styles.chatButton} onPress={() => navigation.navigate('ChatScreen', {
                              receiverPhone: bookingItem.passenger_phone,
                              conversationId: `chat-${ride.id}-${bookingItem.id}`,
                              rideId: ride.id,
                              user: { 
                                name: bookingItem.passenger_name || `Rider ${bookingItem.passenger_phone?.slice(-4) || ''}`, 
                                tripInfo: `${ride.origin || 'Origin'} → ${ride.destination || 'Destination'}`, 
                                phone: bookingItem.passenger_phone,
                                profile_picture: bookingItem.passenger_photo
                              }
                            })}>
                              <Ionicons name="chatbubbles" size={24} color={Colors.primary} />
                            </TouchableOpacity>
                          )}
                        </View>
                        <View style={[styles.bookingStatusBadge, { 
                          backgroundColor: bookingStatus === "cancelled" ? "#FEE2E2" : bookingStatusColor + "20" 
                        }]}>
                          <Text style={[styles.bookingStatusText, { 
                            color: bookingStatus === "cancelled" ? "#DC2626" : bookingStatusColor 
                          }]}>
                            {bookingStatusText}
                          </Text>
                        </View>
                      </View>
                      
                      {bookingCancellationInfo && (
                        <View style={styles.bookingCancellationReason}>
                          <Ionicons name="information-circle" size={12} color="#DC2626" />
                          <Text style={styles.bookingCancellationReasonText}>{bookingCancellationInfo.message}</Text>
                        </View>
                      )}
                      
                      {bookingItem.modification_request && bookingItem.modification_request.status === "pending" && !isDisabled && !ride.started_at && hoursSinceDeparture <= 2 && (
                        <View style={styles.modificationActions}>
                          <TouchableOpacity 
                            style={[styles.modActionBtn, styles.approveModBtn]} 
                            onPress={() => handleModificationAction(bookingItem.modification_request.id, 'approve', bookingItem.id)}>
                            <Ionicons name="checkmark" size={16} color="#fff" />
                            <Text style={styles.modActionBtnText}>Approve</Text>
                          </TouchableOpacity>
                          <TouchableOpacity 
                            style={[styles.modActionBtn, styles.rejectModBtn]} 
                            onPress={() => handleModificationAction(bookingItem.modification_request.id, 'reject', bookingItem.id)}>
                            <Ionicons name="close" size={16} color="#fff" />
                            <Text style={styles.modActionBtnText}>Reject</Text>
                          </TouchableOpacity>
                        </View>
                      )}
                      
                      {bookingItem.status === "pending" && !isDisabled && !ride.started_at && hoursSinceDeparture <= 2 && !isModificationRejected && (
                        <View style={styles.actionRow}>
                          <TouchableOpacity style={[styles.actionBtn, styles.acceptBtn]} onPress={() => handleBookingAction(bookingItem.id, "accept")} activeOpacity={0.8}>
                            <Ionicons name="checkmark" size={16} color={Colors.white} /><Text style={styles.btnText}>Approve</Text>
                          </TouchableOpacity>
                          <TouchableOpacity style={[styles.actionBtn, styles.rejectBtn]} onPress={() => handleBookingAction(bookingItem.id, "reject")} activeOpacity={0.8}>
                            <Ionicons name="close" size={16} color={Colors.white} /><Text style={styles.btnText}>Reject</Text>
                          </TouchableOpacity>
                        </View>
                      )}
                    </View>
                  );
                })}
              </View>
            )}
          </View>
        )}

        {cancellationInfo && isExpanded && (
          <View style={styles.cancelledRideInfo}>
            <Text style={styles.cancelledRideInfoTitle}>Ride Cancelled</Text>
            <Text style={styles.cancelledRideInfoText}>
              This ride has been cancelled. All associated bookings and modification requests have been cancelled.
            </Text>
          </View>
        )}
      </View>
    );
  };
  const renderRequestedRideCard = (booking) => {
    const isExpanded = expandedRequestedRides[booking.id];
    const isAccepted = booking.status === "accepted";
    const isPending = booking.status === "pending";
    const isClosed = booking.status === "cancelled" || booking.status === "rejected";
    const isAutoCancelled = booking.cancellation_reason && booking.cancellation_reason.includes("Auto-cancelled") || booking.auto_cancelled;
    const isPast = isRidePast(booking.departure_time);
    const rideHasStarted = booking.ride_started_at || booking.started_at;
    const rideCancelled = booking.ride_status === "cancelled" || booking.cancellation_reason;
    const cancellationInfo = getCancellationStatusDisplay(booking);
    const isRideCompleted = booking.ride_status === "completed";
    // Update this line to check multiple possible field names
   const isRideOngoing = !rideCancelled && 
                          !isRideCompleted && 
                          booking.status !== "cancelled" && 
                          booking.status !== "rejected" &&
                          (booking.ride_started_at || booking.started_at || booking.ride_started || booking.has_started);
        
    const modificationRequest = booking.modification_request;
    
    let effectiveCurrentSeats = booking.seats_requested;
    let hasAppliedModification = false;
    
    if (modificationRequest && modificationRequest.status === "approved") {
        effectiveCurrentSeats = modificationRequest.requested_seats;
        hasAppliedModification = true;
    }
    
    const hasModificationPending = modificationRequest && modificationRequest.status === "pending";
    const hasModificationApproved = modificationRequest && modificationRequest.status === "approved" && !hasModificationPending;
    const hasModificationRejected = modificationRequest && modificationRequest.status === "rejected" && !hasModificationPending;
    
    const displayHasModificationPending = hasModificationPending;
    const displayHasModificationApproved = hasModificationApproved && !hasModificationPending;
    const displayHasModificationRejected = hasModificationRejected && !hasModificationPending;
    
    const hasUsedModification = modificationRequest && modificationRequest.id !== null;
    const canRequestModification = !hasUsedModification && 
                                   !rideCancelled && 
                                   !isRideCompleted && 
                                   !rideHasStarted && 
                                   booking.status === "accepted";
    
    const passengerStatusInfo = getPassengerRideStatusInfo(booking);
    
    let displayStatus = { ...passengerStatusInfo };
    
    // Check for ongoing ride status first
    if (isRideOngoing) {
        displayStatus = {
            text: "Ride Ongoing 🚗",
            color: "#10B981",
            icon: "car-sport",
            type: "ongoing",
            showTrackButton: true,
            message: "The driver has started the ride. Track your journey live!"
        };
    } 
    // Check for driver late status
    else if (passengerStatusInfo.type === 'driver-late') {
        const minutesLate = Math.abs(Math.round((new Date() - new Date(booking.departure_time)) / (1000 * 60)));
        displayStatus = {
            text: `Driver Late - ${minutesLate} min`,
            color: "#EF4444",
            icon: "alert-circle",
            type: "driver-late",
            showTrackButton: false,
            message: `The driver is ${minutesLate} minutes late. We apologize for the inconvenience.`
        };
    }
    else if (displayHasModificationPending && !rideCancelled && !isRideCompleted) {
      displayStatus = {
        text: "Modification Pending",
        color: "#F59E0B",
        icon: "swap",
        type: "modification-pending",
        showTrackButton: false
      };
    } else if (displayHasModificationApproved && !rideCancelled && !isRideCompleted) {
      displayStatus = {
        text: "Modification Approved",
        color: "#10B981",
        icon: "checkmark-circle",
        type: "modification-approved",
        showTrackButton: false
      };
    } else if (displayHasModificationRejected && !rideCancelled && !isRideCompleted) {
      displayStatus = {
        text: "Booking Cancelled",
        color: "#DC2626",
        icon: "close-circle",
        type: "modification-rejected",
        showTrackButton: false
      };
    }
    
    const riderPickupLocation = getRiderPickupLocation(booking);
    const riderDropoffLocation = getRiderDropoffLocation(booking);
    
    let effectiveDisplaySeats;
    let seatDisplayText = "";
    
    if (displayHasModificationPending) {
      effectiveDisplaySeats = modificationRequest.requested_seats;
      seatDisplayText = ` (Pending: ${effectiveCurrentSeats} → ${modificationRequest.requested_seats})`;
    } else if (displayHasModificationApproved) {
      effectiveDisplaySeats = effectiveCurrentSeats;
      seatDisplayText = " (Updated)";
    } else if (displayHasModificationRejected) {
      effectiveDisplaySeats = booking.seats_requested;
      seatDisplayText = " (Booking Cancelled)";
    } else {
      effectiveDisplaySeats = effectiveCurrentSeats;
      seatDisplayText = "";
    }
    
    // Calculate minutes late for display
    const minutesLate = Math.abs(Math.round((new Date() - new Date(booking.departure_time)) / (1000 * 60)));
    
    return (
      <View key={booking.id} style={[styles.card, targetBookingId === booking.id && styles.highlightBookingCard, displayHasModificationRejected && { opacity: 0.7, backgroundColor: '#FEF2F2' }]}>
        <TouchableOpacity style={styles.cardHeader} onPress={() => toggleRequestedRideExpand(booking.id)} activeOpacity={0.7}>
          <View style={styles.routeContainer}>
            <View style={styles.locationDot}>
              <View style={[styles.dot, { backgroundColor: Colors.success }]} />
              <View style={styles.line} />
              <View style={[styles.dot, { backgroundColor: Colors.secondary }]} />
            </View>
            <View style={styles.routeTextContainer}>
              <Text style={styles.routeOrigin} numberOfLines={1}>
                {booking.origin?.split(",")[0] || "Pickup point"}
              </Text>
              <Text style={styles.routeDestination} numberOfLines={1}>
                {booking.destination?.split(",")[0] || "Drop point"}
              </Text>
            </View>
          </View>
          <View style={styles.cardHeaderRight}>
            <View style={[styles.statusBadge, { backgroundColor: displayStatus.color }]}>
              <Ionicons name={displayStatus.icon} size={12} color={Colors.white} style={styles.statusIcon} />
              <Text style={styles.statusText}>{displayStatus.text}</Text>
            </View>
            <Ionicons name={isExpanded ? "chevron-up" : "chevron-down"} size={20} color={Colors.gray} style={styles.expandIcon} />
          </View>
        </TouchableOpacity>

        {/* Ongoing Ride Banner - Show when driver has started the ride
        {isRideOngoing && (
          <View style={styles.ongoingRideBanner}>
            <View style={styles.ongoingRideHeader}>
              <Ionicons name="car-sport" size={24} color="#10B981" />
              <Text style={styles.ongoingRideTitle}>Ride in Progress 🚗</Text>
            </View>
            <Text style={styles.ongoingRideMessage}>
              The driver has started the ride. You can track your journey live on the map.
            </Text>
            <TouchableOpacity 
              style={styles.trackLiveRideBtn}
              onPress={() => handleTrackRide(booking)}
            >
              <Ionicons name="navigate-circle" size={20} color="#fff" />
              <Text style={styles.trackLiveRideBtnText}>Track Live Ride</Text>
            </TouchableOpacity>
          </View>
        )} */}

        {/* Driver Late Banner - Show when driver is late */}
        {passengerStatusInfo.type === 'driver-late' && !isRideOngoing && !isRideCompleted && (
          <View style={styles.driverLateBanner}>
            <View style={styles.driverLateHeader}>
              <Ionicons name="alert-circle" size={24} color="#EF4444" />
              <Text style={styles.driverLateTitle}>Driver is Running Late</Text>
            </View>
            <Text style={styles.driverLateMessage}>
              The driver is {minutesLate} minutes late. We apologize for the inconvenience. 
              Please wait a few more minutes.
            </Text>
            <Text style={styles.driverLateSubMessage}>
              You can contact the driver through chat for updates.
            </Text>
            <TouchableOpacity 
              style={styles.contactDriverBtn}
              onPress={() => {
                const driverPhone = booking.driver_phone;
                const driverName = booking.driver_name || 'Driver';
                navigation.navigate('ChatScreen', {
                  receiverPhone: driverPhone,
                  conversationId: `chat-${booking.ride_id}-${booking.id}`,
                  rideId: booking.ride_id,
                  user: { name: driverName, phone: driverPhone }
                });
              }}
            >
              <Ionicons name="chatbubble-ellipses" size={18} color="#2457A6" />
              <Text style={styles.contactDriverBtnText}>Contact Driver</Text>
            </TouchableOpacity>
          </View>
        )}

        {displayHasModificationPending && !rideCancelled && !isRideCompleted && !isRideOngoing && (
          <View style={styles.modificationPendingCard}>
            <View style={styles.modificationPendingHeader}>
              <Ionicons name="swap" size={24} color="#F59E0B" />
              <Text style={styles.modificationPendingTitle}>Modification Request Pending</Text>
            </View>
            <View style={styles.modificationPendingDetails}>
              <Text style={styles.modificationPendingText}>
                You requested to change from <Text style={{ fontWeight: 'bold' }}>{effectiveCurrentSeats}</Text> to <Text style={{ fontWeight: 'bold' }}>{modificationRequest.requested_seats}</Text> seats
              </Text>
              <Text style={styles.modificationPendingSubtext}>
                Waiting for driver's approval
              </Text>
            </View>
          </View>
        )}

        {displayHasModificationApproved && !hasModificationPending && !rideCancelled && !isRideCompleted && !isRideOngoing && (
          <View style={styles.modificationApprovedCard}>
            <View style={styles.modificationPendingHeader}>
              <Ionicons name="checkmark-circle" size={24} color="#10B981" />
              <Text style={[styles.modificationPendingTitle, { color: "#10B981" }]}>Modification Approved!</Text>
            </View>
            <View style={styles.modificationPendingDetails}>
              <Text style={styles.modificationPendingText}>
                Your seats have been changed to {effectiveCurrentSeats} seats
              </Text>
              <Text style={styles.modificationPendingSubtext}>
                ✓ You have used your one-time modification
              </Text>
            </View>
          </View>
        )}

        {displayHasModificationRejected && !hasModificationPending && !rideCancelled && !isRideCompleted && !isRideOngoing && (
          <View style={styles.modificationRejectedCard}>
            <View style={styles.modificationPendingHeader}>
              <Ionicons name="close-circle" size={24} color="#DC2626" />
              <Text style={[styles.modificationPendingTitle, { color: "#DC2626" }]}>Modification Rejected - Booking Cancelled</Text>
            </View>
            <View style={styles.modificationPendingDetails}>
              <Text style={styles.modificationRejectedText}>
                Your request to change from {modificationRequest.current_seats} to {modificationRequest.requested_seats} seats was rejected.
              </Text>
              <Text style={styles.modificationRejectedSubtext}>
                ❌ Your original booking for {modificationRequest.current_seats} seat(s) has been CANCELLED.
              </Text>
              <Text style={styles.modificationRejectedSubtext}>
                ⚠️ You cannot request another modification as one-time limit is reached.
              </Text>
              {modificationRequest.rejection_reason && (
                <Text style={styles.modificationRejectionReason}>
                  Reason: {modificationRequest.rejection_reason}
                </Text>
              )}
            </View>
          </View>
        )}

        {hasUsedModification && !hasModificationPending && !hasModificationApproved && !hasModificationRejected && !rideCancelled && !isRideCompleted && !isRideOngoing && (
          <View style={styles.modificationUsedCard}>
            <View style={styles.modificationPendingHeader}>
              <Ionicons name="information-circle" size={24} color="#9CA3AF" />
              <Text style={[styles.modificationPendingTitle, { color: "#6B7280" }]}>Modification Already Used</Text>
            </View>
            <View style={styles.modificationPendingDetails}>
              <Text style={styles.modificationUsedText}>
                You have already used your one-time modification for this booking.
              </Text>
              <Text style={styles.modificationUsedSubtext}>
                Further modifications are not allowed.
              </Text>
            </View>
          </View>
        )}

        {(passengerStatusInfo.type === 'auto-cancelled' || isAutoCancelled) && !hasModificationPending && (
          <View style={styles.autoCancelledBanner}>
            <Ionicons name="timer-off" size={20} color="#9CA3AF" />
            <Text style={styles.autoCancelledText}>This request has been auto-cancelled</Text>
          </View>
        )}

        {passengerStatusInfo.type === 'pending' && !isAutoCancelled && !rideCancelled && !hasModificationPending && !isRideOngoing && (
          <View style={styles.pendingRequestBanner}>
            <Ionicons name="time-outline" size={20} color="#F59E0B" />
            <View>
              <Text style={styles.pendingRequestTitle}>Waiting for driver response</Text>
              <Text style={styles.pendingRequestSubtext}>Driver has been notified of your request</Text>
            </View>
          </View>
        )}

        {passengerStatusInfo.type === 'rejected' && !hasModificationRejected && (
          <View style={styles.rejectedRequestBanner}>
            <Ionicons name="close-circle" size={20} color="#DC2626" />
            <Text style={styles.rejectedRequestText}>Your request was declined by the driver</Text>
          </View>
        )}

        {passengerStatusInfo.type === 'start-soon' && !rideHasStarted && !isRideCompleted && !hasModificationPending && !isRideOngoing && (
          <View style={styles.startSoonWarning}>
            <Ionicons name="time-outline" size={20} color="#F59E0B" />
            <Text style={styles.startSoonWarningText}>Ride starting soon! Be ready at your pickup location.</Text>
          </View>
        )}

        {passengerStatusInfo.type === 'ride-cancelled' && (
          <View style={styles.cancelledRideBanner}>
            <Ionicons name="alert-circle" size={16} color="#DC2626" />
            <Text style={styles.cancelledRideText}>
              This ride has been cancelled by the driver. Your booking has been cancelled.
            </Text>
          </View>
        )}

        {passengerStatusInfo.type === 'completed' && (
          <View style={styles.completedRideBanner}>
            <Ionicons name="checkmark-circle" size={16} color="#10B981" />
            <Text style={styles.completedRideBannerText}>
              This ride has been completed successfully.
            </Text>
          </View>
        )}

        {isExpanded && (
          <View>
            <TouchableOpacity style={styles.driverProfileRow} onPress={() => handleViewProfile(booking.driver_user_id, booking.driver_phone, booking.driver_name || "Driver", booking.driver_photo)} activeOpacity={0.8}>
              {renderProfileImage(booking.driver_photo, booking.driver_name || "Driver", 50)}
              <View style={styles.driverInfo}>
                <Text style={styles.driverName}>{booking.driver_name || "Driver"}</Text>
                <View style={styles.driverRatingContainer}>
                  <Ionicons name="star" size={12} color="#F59E0B" />
                  <Text style={styles.driverRating}>{booking.driver_rating || 4.5}</Text>
                </View>
              </View>
              <Ionicons name="chevron-forward" size={20} color={Colors.gray} />
            </TouchableOpacity>

            <View style={styles.requestDetails}>
              <View style={styles.detailItem}>
                <Ionicons name="time-outline" size={16} color={Colors.gray} />
                <Text style={styles.detailText}>Travel Date</Text>
                <Text style={styles.detailTextSecondary}>
                  {booking.departure_time ? `${formatDate(booking.departure_time).dayText}, ${formatDate(booking.departure_time).timeText}` : "-"}
                </Text>
              </View>
              <View style={styles.detailDivider} />
              <View style={styles.detailItem}>
                <Ionicons name="people-outline" size={16} color={displayHasModificationRejected ? "#DC2626" : Colors.gray} />
                <Text style={[styles.detailText, displayHasModificationRejected && { color: '#DC2626', textDecorationLine: 'line-through' }]}>
                  {effectiveDisplaySeats} seat{effectiveDisplaySeats > 1 ? "s" : ""}
                  {seatDisplayText}
                </Text>
              </View>
            </View>

            {/* ACTUAL ADDRESSES CARD - Shows saved pickup and dropoff addresses */}
            {(booking.pickup_address || booking.dropoff_address || booking.pickup_place_name || booking.dropoff_place_name) && (
              <View style={styles.actualAddressesCard}>
                <View style={styles.actualAddressesHeader}>
                  <Ionicons name="location-outline" size={18} color="#2457A6" />
                  <Text style={styles.actualAddressesTitle}>📍 Your Saved Locations</Text>
                </View>
                
                {/* Pickup Address */}
                {booking.pickup_address && (
                  <View style={styles.actualAddressItem}>
                    <View style={[styles.actualAddressIcon, { backgroundColor: '#E8F5E9' }]}>
                      <Ionicons name="location" size={18} color="#10B981" />
                    </View>
                    <View style={styles.actualAddressContent}>
                      <Text style={styles.actualAddressLabel}>Pickup Address</Text>
                      <Text style={styles.actualAddressValue}>{booking.pickup_address}</Text>
                      {booking.pickup_place_name && (
                        <View style={styles.actualAddressPlaceRow}>
                          <Ionicons name="bookmark-outline" size={12} color="#6B7280" />
                          <Text style={styles.actualAddressPlace}>Landmark: {booking.pickup_place_name}</Text>
                        </View>
                      )}
                    </View>
                  </View>
                )}
                
                {/* Dropoff Address */}
                {booking.dropoff_address && (
                  <View style={styles.actualAddressItem}>
                    <View style={[styles.actualAddressIcon, { backgroundColor: '#FEF2F2' }]}>
                      <Ionicons name="flag" size={18} color="#DC2626" />
                    </View>
                    <View style={styles.actualAddressContent}>
                      <Text style={styles.actualAddressLabel}>Dropoff Address</Text>
                      <Text style={styles.actualAddressValue}>{booking.dropoff_address}</Text>
                      {booking.dropoff_place_name && (
                        <View style={styles.actualAddressPlaceRow}>
                          <Ionicons name="bookmark-outline" size={12} color="#6B7280" />
                          <Text style={styles.actualAddressPlace}>Landmark: {booking.dropoff_place_name}</Text>
                        </View>
                      )}
                    </View>
                  </View>
                )}
                
                {/* Show if only place names available (no full address) */}
                {!booking.pickup_address && booking.pickup_place_name && (
                  <View style={styles.actualAddressItem}>
                    <View style={[styles.actualAddressIcon, { backgroundColor: '#E8F5E9' }]}>
                      <Ionicons name="location" size={18} color="#10B981" />
                    </View>
                    <View style={styles.actualAddressContent}>
                      <Text style={styles.actualAddressLabel}>Pickup Location</Text>
                      <Text style={styles.actualAddressValue}>{booking.pickup_place_name}</Text>
                    </View>
                  </View>
                )}
                
                {!booking.dropoff_address && booking.dropoff_place_name && (
                  <View style={styles.actualAddressItem}>
                    <View style={[styles.actualAddressIcon, { backgroundColor: '#FEF2F2' }]}>
                      <Ionicons name="flag" size={18} color="#DC2626" />
                    </View>
                    <View style={styles.actualAddressContent}>
                      <Text style={styles.actualAddressLabel}>Dropoff Location</Text>
                      <Text style={styles.actualAddressValue}>{booking.dropoff_place_name}</Text>
                    </View>
                  </View>
                )}
              </View>
            )}

            <View style={[styles.riderLocationsCard, displayHasModificationRejected && { opacity: 0.6, backgroundColor: '#FEF2F2' }]}>
              <Text style={styles.riderLocationsTitle}>🚗 Meeting Points with Driver</Text>
              
              <View style={styles.riderLocationItem}>
                <View style={[styles.riderLocationIcon, { backgroundColor: displayHasModificationRejected ? '#FEE2E2' : '#E8F5E9' }]}>
                  <Ionicons name="location" size={18} color={displayHasModificationRejected ? "#DC2626" : "#10B981"} />
                </View>
                <View style={styles.riderLocationContent}>
                  <Text style={styles.riderLocationLabel}>Pickup Meeting Point</Text>
                  <Text style={[styles.riderLocationValue, displayHasModificationRejected && { color: '#DC2626', textDecorationLine: 'line-through' }]} numberOfLines={2}>
                    {riderPickupLocation}
                  </Text>
                  {booking.pickup_walk_distance_m > 0 && (
                    <Text style={styles.riderLocationWalkInfo}>
                      🚶 Walk {booking.pickup_walk_distance_m}m to meeting point
                    </Text>
                  )}
                </View>
              </View>
              
              <View style={styles.riderLocationDivider} />
              
              <View style={styles.riderLocationItem}>
                <View style={[styles.riderLocationIcon, { backgroundColor: displayHasModificationRejected ? '#FEE2E2' : '#FEF2F2' }]}>
                  <Ionicons name="flag" size={18} color={displayHasModificationRejected ? "#DC2626" : "#DC2626"} />
                </View>
                <View style={styles.riderLocationContent}>
                  <Text style={styles.riderLocationLabel}>Dropoff Meeting Point</Text>
                  <Text style={[styles.riderLocationValue, displayHasModificationRejected && { color: '#DC2626', textDecorationLine: 'line-through' }]} numberOfLines={2}>
                    {riderDropoffLocation}
                  </Text>
                  {booking.drop_walk_distance_m > 0 && (
                    <Text style={styles.riderLocationWalkInfo}>
                      🚶 Walk {booking.drop_walk_distance_m}m from meeting point
                    </Text>
                  )}
                </View>
              </View>
            </View>

            {modificationRequest && !displayHasModificationPending && !rideCancelled && !isRideCompleted && (
              <View style={styles.modificationDetailCard}>
                <Text style={styles.modificationDetailTitle}>Modification Request Details</Text>
                <View style={styles.modificationDetailRow}>
                  <Text style={styles.modificationDetailLabel}>Status:</Text>
                  <Text style={[styles.modificationDetailValue, { 
                    color: displayHasModificationApproved ? "#10B981" : (displayHasModificationRejected ? "#DC2626" : "#F59E0B"),
                    fontWeight: 'bold' 
                  }]}>
                    {modificationRequest.status.toUpperCase()}
                  </Text>
                </View>
                <View style={styles.modificationDetailRow}>
                  <Text style={styles.modificationDetailLabel}>Current Seats:</Text>
                  <Text style={styles.modificationDetailValue}>
                    {displayHasModificationApproved ? effectiveCurrentSeats : modificationRequest.current_seats} seats
                  </Text>
                </View>
                <View style={styles.modificationDetailRow}>
                  <Text style={styles.modificationDetailLabel}>Requested Seats:</Text>
                  <Text style={[styles.modificationDetailValue, displayHasModificationRejected && { textDecorationLine: 'line-through', color: '#DC2626' }]}>
                    {modificationRequest.requested_seats} seats
                  </Text>
                </View>
                {modificationRequest.approved_at && displayHasModificationApproved && (
                  <Text style={styles.modificationDetailDate}>
                    Approved: {new Date(modificationRequest.approved_at).toLocaleString()}
                  </Text>
                )}
                {modificationRequest.created_at && (
                  <Text style={styles.modificationDetailDate}>
                    Requested: {new Date(modificationRequest.created_at).toLocaleString()}
                  </Text>
                )}
                {modificationRequest.rejection_reason && (
                  <Text style={styles.modificationDetailReason}>
                    Rejection Reason: {modificationRequest.rejection_reason}
                  </Text>
                )}
                {displayHasModificationApproved && (
                  <Text style={[styles.modificationDetailDate, { color: '#10B981', marginTop: 6 }]}>
                    ✓ One-time modification used
                  </Text>
                )}
              </View>
            )}

            <TouchableOpacity style={[styles.viewRouteBtn, displayHasModificationRejected && { opacity: 0.5 }]} onPress={() => handleViewRideDetails(booking, booking)} disabled={displayHasModificationRejected}>
              <Ionicons name="map-outline" size={16} color={displayHasModificationRejected ? Colors.gray : Colors.primary} />
              <Text style={[styles.viewRouteBtnText, displayHasModificationRejected && { color: Colors.gray }]}>
                View Route Details
              </Text>
            </TouchableOpacity>

            {canRequestModification && !hasModificationPending && !hasModificationApproved && !hasModificationRejected && !displayHasModificationRejected && !isRideOngoing && (
              <TouchableOpacity 
                style={styles.modifySeatsBtn}
                onPress={() => openModifySeatsModal(booking)}>
                <Ionicons name="swap" size={16} color={Colors.primary} />
                <Text style={styles.modifySeatsBtnText}>Modify Seats (One-time)</Text>
              </TouchableOpacity>
            )}

            {hasUsedModification && !hasModificationPending && !hasModificationRejected && !hasModificationApproved && canRequestModification === false && booking.status === "accepted" && !rideCancelled && !isRideCompleted && !isRideOngoing && (
              <View style={styles.modificationDisabledContainer}>
                <Ionicons name="lock-closed" size={16} color="#9CA3AF" />
                <Text style={styles.modificationDisabledText}>
                  Modification not available - You have already used your one-time modification
                </Text>
              </View>
            )}

            {passengerStatusInfo.type === 'ongoing' && booking?.live_session?.session_id && !displayHasModificationRejected && (
              <TouchableOpacity 
                style={styles.trackRideBtn}
                onPress={() => handleTrackRide(booking)}>
                <Ionicons name="navigate-circle" size={20} color="#fff" />
                <Text style={styles.trackRideBtnText}>Track Live Ride</Text>
              </TouchableOpacity>
            )}

            {isRideCompleted && !booking.driver_rating_given && booking.live_session?.session_id && !displayHasModificationRejected && (
              <TouchableOpacity 
                style={styles.rateDriverBtn}
                onPress={() => openRateDriverModal(booking, booking.live_session.session_id)}>
                <Ionicons name="star-outline" size={18} color="#fff" />
                <Text style={styles.rateDriverBtnText}>Rate Driver</Text>
              </TouchableOpacity>
            )}

            {isRideCompleted && booking.driver_rating_given && !displayHasModificationRejected && (
              <View style={styles.alreadyRatedContainer}>
                <Ionicons name="star" size={16} color="#F59E0B" />
                <Text style={styles.alreadyRatedText}>You rated this driver {booking.driver_rating}/5</Text>
              </View>
            )}

            {hasModificationPending && !rideCancelled && !isRideCompleted && (
              <TouchableOpacity 
                style={styles.cancelModificationBtn}
                onPress={() => handleCancelModificationRequest(modificationRequest.id, booking.id)}>
                <Ionicons name="close-circle-outline" size={18} color="#DC2626" />
                <Text style={styles.cancelModificationBtnText}>Cancel Modification Request</Text>
              </TouchableOpacity>
            )}
            {!displayHasModificationRejected && !isRideCompleted && !rideCancelled && 
 booking.status !== "rejected" && booking.status !== "cancelled" && 
 !isAutoCancelled && !hasModificationPending && !isRideOngoing && (
  <TouchableOpacity 
    style={styles.cancelBookingBtn}
    onPress={() => cancelBooking(booking.id)}>
    <Text style={styles.cancelBookingBtnText}>
      {booking.status === "pending" ? "Cancel Request" : "Cancel Booking"}
    </Text>
  </TouchableOpacity>
)}
            {/* {!displayHasModificationRejected && !isRideCompleted && !rideCancelled && booking.status !== "rejected" && booking.status !== "cancelled" && !isAutoCancelled && !hasModificationPending && !isRideOngoing && (
              <TouchableOpacity 
                style={styles.cancelBookingBtn}
                onPress={() => cancelBooking(booking.id)}>
                <Text style={styles.cancelBookingBtnText}>
                  {booking.status === "pending" ? "Cancel Request" : "Cancel Booking"}
                </Text>
              </TouchableOpacity>
            )} */}
          </View>
        )}
      </View>
    );
  };
// const renderRequestedRideCard = (booking) => {
//     const isExpanded = expandedRequestedRides[booking.id];
//     const isAccepted = booking.status === "accepted";
//     const isPending = booking.status === "pending";
//     const isClosed = booking.status === "cancelled" || booking.status === "rejected";
//     const isAutoCancelled = booking.cancellation_reason && booking.cancellation_reason.includes("Auto-cancelled") || booking.auto_cancelled;
//     const isPast = isRidePast(booking.departure_time);
//     const rideHasStarted = booking.ride_started_at || booking.started_at;
//     const rideCancelled = booking.ride_status === "cancelled" || booking.cancellation_reason;
//     const cancellationInfo = getCancellationStatusDisplay(booking);
//     const isRideCompleted = booking.ride_status === "completed";
//     const isRideOngoing = booking.ride_started_at && !isRideCompleted;
    
//     const modificationRequest = booking.modification_request;
    
//     let effectiveCurrentSeats = booking.seats_requested;
//     let hasAppliedModification = false;
    
//     if (modificationRequest && modificationRequest.status === "approved") {
//         effectiveCurrentSeats = modificationRequest.requested_seats;
//         hasAppliedModification = true;
//     }
    
//     const hasModificationPending = modificationRequest && modificationRequest.status === "pending";
//     const hasModificationApproved = modificationRequest && modificationRequest.status === "approved" && !hasModificationPending;
//     const hasModificationRejected = modificationRequest && modificationRequest.status === "rejected" && !hasModificationPending;
    
//     const displayHasModificationPending = hasModificationPending;
//     const displayHasModificationApproved = hasModificationApproved && !hasModificationPending;
//     const displayHasModificationRejected = hasModificationRejected && !hasModificationPending;
    
//     const hasUsedModification = modificationRequest && modificationRequest.id !== null;
//     const canRequestModification = !hasUsedModification && 
//                                    !rideCancelled && 
//                                    !isRideCompleted && 
//                                    !rideHasStarted && 
//                                    booking.status === "accepted";
    
//     const passengerStatusInfo = getPassengerRideStatusInfo(booking);
    
//     let displayStatus = { ...passengerStatusInfo };
    
//     if (displayHasModificationPending && !rideCancelled && !isRideCompleted) {
//       displayStatus = {
//         text: "Modification Pending",
//         color: "#F59E0B",
//         icon: "swap",
//         type: "modification-pending",
//         showTrackButton: false
//       };
//     } else if (displayHasModificationApproved && !rideCancelled && !isRideCompleted) {
//       displayStatus = {
//         text: "Modification Approved",
//         color: "#10B981",
//         icon: "checkmark-circle",
//         type: "modification-approved",
//         showTrackButton: false
//       };
//     } else if (displayHasModificationRejected && !rideCancelled && !isRideCompleted) {
//       displayStatus = {
//         text: "Booking Cancelled",
//         color: "#DC2626",
//         icon: "close-circle",
//         type: "modification-rejected",
//         showTrackButton: false
//       };
//     }
    
//     const riderPickupLocation = getRiderPickupLocation(booking);
//     const riderDropoffLocation = getRiderDropoffLocation(booking);
    
//     let effectiveDisplaySeats;
//     let seatDisplayText = "";
    
//     if (displayHasModificationPending) {
//       effectiveDisplaySeats = modificationRequest.requested_seats;
//       seatDisplayText = ` (Pending: ${effectiveCurrentSeats} → ${modificationRequest.requested_seats})`;
//     } else if (displayHasModificationApproved) {
//       effectiveDisplaySeats = effectiveCurrentSeats;
//       seatDisplayText = " (Updated)";
//     } else if (displayHasModificationRejected) {
//       effectiveDisplaySeats = booking.seats_requested;
//       seatDisplayText = " (Booking Cancelled)";
//     } else {
//       effectiveDisplaySeats = effectiveCurrentSeats;
//       seatDisplayText = "";
//     }
    
//     return (
//       <View key={booking.id} style={[styles.card, targetBookingId === booking.id && styles.highlightBookingCard, displayHasModificationRejected && { opacity: 0.7, backgroundColor: '#FEF2F2' }]}>
//         <TouchableOpacity style={styles.cardHeader} onPress={() => toggleRequestedRideExpand(booking.id)} activeOpacity={0.7}>
//           <View style={styles.routeContainer}>
//             <View style={styles.locationDot}>
//               <View style={[styles.dot, { backgroundColor: Colors.success }]} />
//               <View style={styles.line} />
//               <View style={[styles.dot, { backgroundColor: Colors.secondary }]} />
//             </View>
//             <View style={styles.routeTextContainer}>
//               <Text style={styles.routeOrigin} numberOfLines={1}>
//                 {booking.origin?.split(",")[0] || "Pickup point"}
//               </Text>
//               <Text style={styles.routeDestination} numberOfLines={1}>
//                 {booking.destination?.split(",")[0] || "Drop point"}
//               </Text>
//             </View>
//           </View>
//           <View style={styles.cardHeaderRight}>
//             <View style={[styles.statusBadge, { backgroundColor: displayStatus.color }]}>
//               <Ionicons name={displayStatus.icon} size={12} color={Colors.white} style={styles.statusIcon} />
//               <Text style={styles.statusText}>{displayStatus.text}</Text>
//             </View>
//             <Ionicons name={isExpanded ? "chevron-up" : "chevron-down"} size={20} color={Colors.gray} style={styles.expandIcon} />
//           </View>
//         </TouchableOpacity>

//         {displayHasModificationPending && !rideCancelled && !isRideCompleted && (
//           <View style={styles.modificationPendingCard}>
//             <View style={styles.modificationPendingHeader}>
//               <Ionicons name="swap" size={24} color="#F59E0B" />
//               <Text style={styles.modificationPendingTitle}>Modification Request Pending</Text>
//             </View>
//             <View style={styles.modificationPendingDetails}>
//               <Text style={styles.modificationPendingText}>
//                 You requested to change from <Text style={{ fontWeight: 'bold' }}>{effectiveCurrentSeats}</Text> to <Text style={{ fontWeight: 'bold' }}>{modificationRequest.requested_seats}</Text> seats
//               </Text>
//               <Text style={styles.modificationPendingSubtext}>
//                 Waiting for driver's approval
//               </Text>
//             </View>
//           </View>
//         )}

//         {displayHasModificationApproved && !hasModificationPending && !rideCancelled && !isRideCompleted && (
//           <View style={styles.modificationApprovedCard}>
//             <View style={styles.modificationPendingHeader}>
//               <Ionicons name="checkmark-circle" size={24} color="#10B981" />
//               <Text style={[styles.modificationPendingTitle, { color: "#10B981" }]}>Modification Approved!</Text>
//             </View>
//             <View style={styles.modificationPendingDetails}>
//               <Text style={styles.modificationPendingText}>
//                 Your seats have been changed to {effectiveCurrentSeats} seats
//               </Text>
//               <Text style={styles.modificationPendingSubtext}>
//                 ✓ You have used your one-time modification
//               </Text>
//             </View>
//           </View>
//         )}

//         {displayHasModificationRejected && !hasModificationPending && !rideCancelled && !isRideCompleted && (
//           <View style={styles.modificationRejectedCard}>
//             <View style={styles.modificationPendingHeader}>
//               <Ionicons name="close-circle" size={24} color="#DC2626" />
//               <Text style={[styles.modificationPendingTitle, { color: "#DC2626" }]}>Modification Rejected - Booking Cancelled</Text>
//             </View>
//             <View style={styles.modificationPendingDetails}>
//               <Text style={styles.modificationRejectedText}>
//                 Your request to change from {modificationRequest.current_seats} to {modificationRequest.requested_seats} seats was rejected.
//               </Text>
//               <Text style={styles.modificationRejectedSubtext}>
//                 ❌ Your original booking for {modificationRequest.current_seats} seat(s) has been CANCELLED.
//               </Text>
//               <Text style={styles.modificationRejectedSubtext}>
//                 ⚠️ You cannot request another modification as one-time limit is reached.
//               </Text>
//               {modificationRequest.rejection_reason && (
//                 <Text style={styles.modificationRejectionReason}>
//                   Reason: {modificationRequest.rejection_reason}
//                 </Text>
//               )}
//             </View>
//           </View>
//         )}

//         {hasUsedModification && !hasModificationPending && !hasModificationApproved && !hasModificationRejected && !rideCancelled && !isRideCompleted && (
//           <View style={styles.modificationUsedCard}>
//             <View style={styles.modificationPendingHeader}>
//               <Ionicons name="information-circle" size={24} color="#9CA3AF" />
//               <Text style={[styles.modificationPendingTitle, { color: "#6B7280" }]}>Modification Already Used</Text>
//             </View>
//             <View style={styles.modificationPendingDetails}>
//               <Text style={styles.modificationUsedText}>
//                 You have already used your one-time modification for this booking.
//               </Text>
//               <Text style={styles.modificationUsedSubtext}>
//                 Further modifications are not allowed.
//               </Text>
//             </View>
//           </View>
//         )}

//         {(passengerStatusInfo.type === 'auto-cancelled' || isAutoCancelled) && !hasModificationPending && (
//           <View style={styles.autoCancelledBanner}>
//             <Ionicons name="timer-off" size={20} color="#9CA3AF" />
//             <Text style={styles.autoCancelledText}>This request has been auto-cancelled</Text>
//           </View>
//         )}

//         {passengerStatusInfo.type === 'pending' && !isAutoCancelled && !rideCancelled && !hasModificationPending && (
//           <View style={styles.pendingRequestBanner}>
//             <Ionicons name="time-outline" size={20} color="#F59E0B" />
//             <View>
//               <Text style={styles.pendingRequestTitle}>Waiting for driver response</Text>
//               <Text style={styles.pendingRequestSubtext}>Driver has been notified of your request</Text>
//             </View>
//           </View>
//         )}

//         {passengerStatusInfo.type === 'rejected' && !hasModificationRejected && (
//           <View style={styles.rejectedRequestBanner}>
//             <Ionicons name="close-circle" size={20} color="#DC2626" />
//             <Text style={styles.rejectedRequestText}>Your request was declined by the driver</Text>
//           </View>
//         )}

//         {passengerStatusInfo.type === 'driver-late' && !rideHasStarted && !isRideCompleted && !hasModificationPending && (
//           <View style={styles.lateDriverWarning}>
//             <Ionicons name="alert-circle" size={20} color="#EF4444" />
//             <Text style={styles.lateDriverWarningText}>Driver is running late. The ride should start soon.</Text>
//           </View>
//         )}

//         {passengerStatusInfo.type === 'start-soon' && !rideHasStarted && !isRideCompleted && !hasModificationPending && (
//           <View style={styles.startSoonWarning}>
//             <Ionicons name="time-outline" size={20} color="#F59E0B" />
//             <Text style={styles.startSoonWarningText}>Ride starting soon! Be ready at your pickup location.</Text>
//           </View>
//         )}

//         {passengerStatusInfo.type === 'ride-cancelled' && (
//           <View style={styles.cancelledRideBanner}>
//             <Ionicons name="alert-circle" size={16} color="#DC2626" />
//             <Text style={styles.cancelledRideText}>
//               This ride has been cancelled by the driver. Your booking has been cancelled.
//             </Text>
//           </View>
//         )}

//         {passengerStatusInfo.type === 'completed' && (
//           <View style={styles.completedRideBanner}>
//             <Ionicons name="checkmark-circle" size={16} color="#10B981" />
//             <Text style={styles.completedRideBannerText}>
//               This ride has been completed successfully.
//             </Text>
//           </View>
//         )}

//         {isExpanded && (
//           <View>
//             <TouchableOpacity style={styles.driverProfileRow} onPress={() => handleViewProfile(booking.driver_user_id, booking.driver_phone, booking.driver_name || "Driver", booking.driver_photo)} activeOpacity={0.8}>
//               {renderProfileImage(booking.driver_photo, booking.driver_name || "Driver", 50)}
//               <View style={styles.driverInfo}>
//                 <Text style={styles.driverName}>{booking.driver_name || "Driver"}</Text>
//                 <View style={styles.driverRatingContainer}>
//                   <Ionicons name="star" size={12} color="#F59E0B" />
//                   <Text style={styles.driverRating}>{booking.driver_rating || 4.5}</Text>
//                 </View>
//               </View>
//               <Ionicons name="chevron-forward" size={20} color={Colors.gray} />
//             </TouchableOpacity>

//             <View style={styles.requestDetails}>
//               <View style={styles.detailItem}>
//                 <Ionicons name="time-outline" size={16} color={Colors.gray} />
//                 <Text style={styles.detailText}>Travel Date</Text>
//                 <Text style={styles.detailTextSecondary}>
//                   {booking.departure_time ? `${formatDate(booking.departure_time).dayText}, ${formatDate(booking.departure_time).timeText}` : "-"}
//                 </Text>
//               </View>
//               <View style={styles.detailDivider} />
//               <View style={styles.detailItem}>
//                 <Ionicons name="people-outline" size={16} color={displayHasModificationRejected ? "#DC2626" : Colors.gray} />
//                 <Text style={[styles.detailText, displayHasModificationRejected && { color: '#DC2626', textDecorationLine: 'line-through' }]}>
//                   {effectiveDisplaySeats} seat{effectiveDisplaySeats > 1 ? "s" : ""}
//                   {seatDisplayText}
//                 </Text>
//               </View>
//             </View>

//             {/* ✅ NEW: ACTUAL ADDRESSES CARD - Shows saved pickup and dropoff addresses */}
//             {(booking.pickup_address || booking.dropoff_address || booking.pickup_place_name || booking.dropoff_place_name) && (
//               <View style={styles.actualAddressesCard}>
//                 <View style={styles.actualAddressesHeader}>
//                   <Ionicons name="location-outline" size={18} color="#2457A6" />
//                   <Text style={styles.actualAddressesTitle}>📍 Your Saved Locations</Text>
//                 </View>
                
//                 {/* Pickup Address */}
//                 {booking.pickup_address && (
//                   <View style={styles.actualAddressItem}>
//                     <View style={[styles.actualAddressIcon, { backgroundColor: '#E8F5E9' }]}>
//                       <Ionicons name="location" size={18} color="#10B981" />
//                     </View>
//                     <View style={styles.actualAddressContent}>
//                       <Text style={styles.actualAddressLabel}>Pickup Address</Text>
//                       <Text style={styles.actualAddressValue}>{booking.pickup_address}</Text>
//                       {booking.pickup_place_name && (
//                         <View style={styles.actualAddressPlaceRow}>
//                           <Ionicons name="bookmark-outline" size={12} color="#6B7280" />
//                           <Text style={styles.actualAddressPlace}>Landmark: {booking.pickup_place_name}</Text>
//                         </View>
//                       )}
//                     </View>
//                   </View>
//                 )}
                
//                 {/* Dropoff Address */}
//                 {booking.dropoff_address && (
//                   <View style={styles.actualAddressItem}>
//                     <View style={[styles.actualAddressIcon, { backgroundColor: '#FEF2F2' }]}>
//                       <Ionicons name="flag" size={18} color="#DC2626" />
//                     </View>
//                     <View style={styles.actualAddressContent}>
//                       <Text style={styles.actualAddressLabel}>Dropoff Address</Text>
//                       <Text style={styles.actualAddressValue}>{booking.dropoff_address}</Text>
//                       {booking.dropoff_place_name && (
//                         <View style={styles.actualAddressPlaceRow}>
//                           <Ionicons name="bookmark-outline" size={12} color="#6B7280" />
//                           <Text style={styles.actualAddressPlace}>Landmark: {booking.dropoff_place_name}</Text>
//                         </View>
//                       )}
//                     </View>
//                   </View>
//                 )}
                
//                 {/* Show if only place names available (no full address) */}
//                 {!booking.pickup_address && booking.pickup_place_name && (
//                   <View style={styles.actualAddressItem}>
//                     <View style={[styles.actualAddressIcon, { backgroundColor: '#E8F5E9' }]}>
//                       <Ionicons name="location" size={18} color="#10B981" />
//                     </View>
//                     <View style={styles.actualAddressContent}>
//                       <Text style={styles.actualAddressLabel}>Pickup Location</Text>
//                       <Text style={styles.actualAddressValue}>{booking.pickup_place_name}</Text>
//                     </View>
//                   </View>
//                 )}
                
//                 {!booking.dropoff_address && booking.dropoff_place_name && (
//                   <View style={styles.actualAddressItem}>
//                     <View style={[styles.actualAddressIcon, { backgroundColor: '#FEF2F2' }]}>
//                       <Ionicons name="flag" size={18} color="#DC2626" />
//                     </View>
//                     <View style={styles.actualAddressContent}>
//                       <Text style={styles.actualAddressLabel}>Dropoff Location</Text>
//                       <Text style={styles.actualAddressValue}>{booking.dropoff_place_name}</Text>
//                     </View>
//                   </View>
//                 )}
//               </View>
//             )}

//             <View style={[styles.riderLocationsCard, displayHasModificationRejected && { opacity: 0.6, backgroundColor: '#FEF2F2' }]}>
//               <Text style={styles.riderLocationsTitle}>🚗 Meeting Points with Driver</Text>
              
//               <View style={styles.riderLocationItem}>
//                 <View style={[styles.riderLocationIcon, { backgroundColor: displayHasModificationRejected ? '#FEE2E2' : '#E8F5E9' }]}>
//                   <Ionicons name="location" size={18} color={displayHasModificationRejected ? "#DC2626" : "#10B981"} />
//                 </View>
//                 <View style={styles.riderLocationContent}>
//                   <Text style={styles.riderLocationLabel}>Pickup Meeting Point</Text>
//                   <Text style={[styles.riderLocationValue, displayHasModificationRejected && { color: '#DC2626', textDecorationLine: 'line-through' }]} numberOfLines={2}>
//                     {riderPickupLocation}
//                   </Text>
//                   {booking.pickup_walk_distance_m > 0 && (
//                     <Text style={styles.riderLocationWalkInfo}>
//                       🚶 Walk {booking.pickup_walk_distance_m}m to meeting point
//                     </Text>
//                   )}
//                 </View>
//               </View>
              
//               <View style={styles.riderLocationDivider} />
              
//               <View style={styles.riderLocationItem}>
//                 <View style={[styles.riderLocationIcon, { backgroundColor: displayHasModificationRejected ? '#FEE2E2' : '#FEF2F2' }]}>
//                   <Ionicons name="flag" size={18} color={displayHasModificationRejected ? "#DC2626" : "#DC2626"} />
//                 </View>
//                 <View style={styles.riderLocationContent}>
//                   <Text style={styles.riderLocationLabel}>Dropoff Meeting Point</Text>
//                   <Text style={[styles.riderLocationValue, displayHasModificationRejected && { color: '#DC2626', textDecorationLine: 'line-through' }]} numberOfLines={2}>
//                     {riderDropoffLocation}
//                   </Text>
//                   {booking.drop_walk_distance_m > 0 && (
//                     <Text style={styles.riderLocationWalkInfo}>
//                       🚶 Walk {booking.drop_walk_distance_m}m from meeting point
//                     </Text>
//                   )}
//                 </View>
//               </View>
//             </View>

//             {modificationRequest && !displayHasModificationPending && !rideCancelled && !isRideCompleted && (
//               <View style={styles.modificationDetailCard}>
//                 <Text style={styles.modificationDetailTitle}>Modification Request Details</Text>
//                 <View style={styles.modificationDetailRow}>
//                   <Text style={styles.modificationDetailLabel}>Status:</Text>
//                   <Text style={[styles.modificationDetailValue, { 
//                     color: displayHasModificationApproved ? "#10B981" : (displayHasModificationRejected ? "#DC2626" : "#F59E0B"),
//                     fontWeight: 'bold' 
//                   }]}>
//                     {modificationRequest.status.toUpperCase()}
//                   </Text>
//                 </View>
//                 <View style={styles.modificationDetailRow}>
//                   <Text style={styles.modificationDetailLabel}>Current Seats:</Text>
//                   <Text style={styles.modificationDetailValue}>
//                     {displayHasModificationApproved ? effectiveCurrentSeats : modificationRequest.current_seats} seats
//                   </Text>
//                 </View>
//                 <View style={styles.modificationDetailRow}>
//                   <Text style={styles.modificationDetailLabel}>Requested Seats:</Text>
//                   <Text style={[styles.modificationDetailValue, displayHasModificationRejected && { textDecorationLine: 'line-through', color: '#DC2626' }]}>
//                     {modificationRequest.requested_seats} seats
//                   </Text>
//                 </View>
//                 {modificationRequest.approved_at && displayHasModificationApproved && (
//                   <Text style={styles.modificationDetailDate}>
//                     Approved: {new Date(modificationRequest.approved_at).toLocaleString()}
//                   </Text>
//                 )}
//                 {modificationRequest.created_at && (
//                   <Text style={styles.modificationDetailDate}>
//                     Requested: {new Date(modificationRequest.created_at).toLocaleString()}
//                   </Text>
//                 )}
//                 {modificationRequest.rejection_reason && (
//                   <Text style={styles.modificationDetailReason}>
//                     Rejection Reason: {modificationRequest.rejection_reason}
//                   </Text>
//                 )}
//                 {displayHasModificationApproved && (
//                   <Text style={[styles.modificationDetailDate, { color: '#10B981', marginTop: 6 }]}>
//                     ✓ One-time modification used
//                   </Text>
//                 )}
//               </View>
//             )}

//             <TouchableOpacity style={[styles.viewRouteBtn, displayHasModificationRejected && { opacity: 0.5 }]} onPress={() => handleViewRideDetails(booking, booking)} disabled={displayHasModificationRejected}>
//               <Ionicons name="map-outline" size={16} color={displayHasModificationRejected ? Colors.gray : Colors.primary} />
//               <Text style={[styles.viewRouteBtnText, displayHasModificationRejected && { color: Colors.gray }]}>
//                 View Route Details
//               </Text>
//             </TouchableOpacity>

//             {canRequestModification && !hasModificationPending && !hasModificationApproved && !hasModificationRejected && !displayHasModificationRejected && (
//               <TouchableOpacity 
//                 style={styles.modifySeatsBtn}
//                 onPress={() => openModifySeatsModal(booking)}>
//                 <Ionicons name="swap" size={16} color={Colors.primary} />
//                 <Text style={styles.modifySeatsBtnText}>Modify Seats (One-time)</Text>
//               </TouchableOpacity>
//             )}

//             {hasUsedModification && !hasModificationPending && !hasModificationRejected && !hasModificationApproved && canRequestModification === false && booking.status === "accepted" && !rideCancelled && !isRideCompleted && (
//               <View style={styles.modificationDisabledContainer}>
//                 <Ionicons name="lock-closed" size={16} color="#9CA3AF" />
//                 <Text style={styles.modificationDisabledText}>
//                   Modification not available - You have already used your one-time modification
//                 </Text>
//               </View>
//             )}

//             {passengerStatusInfo.type === 'ongoing' && booking?.live_session?.session_id && !displayHasModificationRejected && (
//               <TouchableOpacity 
//                 style={styles.trackRideBtn}
//                 onPress={() => handleTrackRide(booking)}>
//                 <Ionicons name="navigate-circle" size={20} color="#fff" />
//                 <Text style={styles.trackRideBtnText}>Track Live Ride</Text>
//               </TouchableOpacity>
//             )}

//             {isRideCompleted && !booking.driver_rating_given && booking.live_session?.session_id && !displayHasModificationRejected && (
//               <TouchableOpacity 
//                 style={styles.rateDriverBtn}
//                 onPress={() => openRateDriverModal(booking, booking.live_session.session_id)}>
//                 <Ionicons name="star-outline" size={18} color="#fff" />
//                 <Text style={styles.rateDriverBtnText}>Rate Driver</Text>
//               </TouchableOpacity>
//             )}

//             {isRideCompleted && booking.driver_rating_given && !displayHasModificationRejected && (
//               <View style={styles.alreadyRatedContainer}>
//                 <Ionicons name="star" size={16} color="#F59E0B" />
//                 <Text style={styles.alreadyRatedText}>You rated this driver {booking.driver_rating}/5</Text>
//               </View>
//             )}

//             {hasModificationPending && !rideCancelled && !isRideCompleted && (
//               <TouchableOpacity 
//                 style={styles.cancelModificationBtn}
//                 onPress={() => handleCancelModificationRequest(modificationRequest.id, booking.id)}>
//                 <Ionicons name="close-circle-outline" size={18} color="#DC2626" />
//                 <Text style={styles.cancelModificationBtnText}>Cancel Modification Request</Text>
//               </TouchableOpacity>
//             )}
            
//             {!displayHasModificationRejected && !isRideCompleted && !rideCancelled && booking.status !== "rejected" && booking.status !== "cancelled" && !isAutoCancelled && !hasModificationPending && (
//               <TouchableOpacity 
//                 style={styles.cancelBookingBtn}
//                 onPress={() => cancelBooking(booking.id)}>
//                 <Text style={styles.cancelBookingBtnText}>
//                   {booking.status === "pending" ? "Cancel Request" : "Cancel Booking"}
//                 </Text>
//               </TouchableOpacity>
//             )}
//           </View>
//         )}
//       </View>
//     );
//   };
  // const renderRequestedRideCard = (booking) => {
  //   const isExpanded = expandedRequestedRides[booking.id];
  //   const isAccepted = booking.status === "accepted";
  //   const isPending = booking.status === "pending";
  //   const isClosed = booking.status === "cancelled" || booking.status === "rejected";
  //   const isAutoCancelled = booking.cancellation_reason && booking.cancellation_reason.includes("Auto-cancelled") || booking.auto_cancelled;
  //   const isPast = isRidePast(booking.departure_time);
  //   const rideHasStarted = booking.ride_started_at || booking.started_at;
  //   const rideCancelled = booking.ride_status === "cancelled" || booking.cancellation_reason;
  //   const cancellationInfo = getCancellationStatusDisplay(booking);
  //   const isRideCompleted = booking.ride_status === "completed";
  //   const isRideOngoing = booking.ride_started_at && !isRideCompleted;
    
  //   const modificationRequest = booking.modification_request;
    
  //   let effectiveCurrentSeats = booking.seats_requested;
  //   let hasAppliedModification = false;
    
  //   if (modificationRequest && modificationRequest.status === "approved") {
  //       effectiveCurrentSeats = modificationRequest.requested_seats;
  //       hasAppliedModification = true;
  //   }
    
  //   const hasModificationPending = modificationRequest && modificationRequest.status === "pending";
  //   const hasModificationApproved = modificationRequest && modificationRequest.status === "approved" && !hasModificationPending;
  //   const hasModificationRejected = modificationRequest && modificationRequest.status === "rejected" && !hasModificationPending;
    
  //   const displayHasModificationPending = hasModificationPending;
  //   const displayHasModificationApproved = hasModificationApproved && !hasModificationPending;
  //   const displayHasModificationRejected = hasModificationRejected && !hasModificationPending;
    
  //   const hasUsedModification = modificationRequest && modificationRequest.id !== null;
  //   const canRequestModification = !hasUsedModification && 
  //                                  !rideCancelled && 
  //                                  !isRideCompleted && 
  //                                  !rideHasStarted && 
  //                                  booking.status === "accepted";
    
  //   const passengerStatusInfo = getPassengerRideStatusInfo(booking);
    
  //   let displayStatus = { ...passengerStatusInfo };
    
  //   if (displayHasModificationPending && !rideCancelled && !isRideCompleted) {
  //     displayStatus = {
  //       text: "Modification Pending",
  //       color: "#F59E0B",
  //       icon: "swap",
  //       type: "modification-pending",
  //       showTrackButton: false
  //     };
  //   } else if (displayHasModificationApproved && !rideCancelled && !isRideCompleted) {
  //     displayStatus = {
  //       text: "Modification Approved",
  //       color: "#10B981",
  //       icon: "checkmark-circle",
  //       type: "modification-approved",
  //       showTrackButton: false
  //     };
  //   } else if (displayHasModificationRejected && !rideCancelled && !isRideCompleted) {
  //     displayStatus = {
  //       text: "Booking Cancelled",
  //       color: "#DC2626",
  //       icon: "close-circle",
  //       type: "modification-rejected",
  //       showTrackButton: false
  //     };
  //   }
    
  //   const riderPickupLocation = getRiderPickupLocation(booking);
  //   const riderDropoffLocation = getRiderDropoffLocation(booking);
    
  //   let effectiveDisplaySeats;
  //   let seatDisplayText = "";
    
  //   if (displayHasModificationPending) {
  //     effectiveDisplaySeats = modificationRequest.requested_seats;
  //     seatDisplayText = ` (Pending: ${effectiveCurrentSeats} → ${modificationRequest.requested_seats})`;
  //   } else if (displayHasModificationApproved) {
  //     effectiveDisplaySeats = effectiveCurrentSeats;
  //     seatDisplayText = " (Updated)";
  //   } else if (displayHasModificationRejected) {
  //     effectiveDisplaySeats = booking.seats_requested;
  //     seatDisplayText = " (Booking Cancelled)";
  //   } else {
  //     effectiveDisplaySeats = effectiveCurrentSeats;
  //     seatDisplayText = "";
  //   }
    
  //   return (
  //     <View key={booking.id} style={[styles.card, targetBookingId === booking.id && styles.highlightBookingCard, displayHasModificationRejected && { opacity: 0.7, backgroundColor: '#FEF2F2' }]}>
  //       <TouchableOpacity style={styles.cardHeader} onPress={() => toggleRequestedRideExpand(booking.id)} activeOpacity={0.7}>
  //         <View style={styles.routeContainer}>
  //           <View style={styles.locationDot}>
  //             <View style={[styles.dot, { backgroundColor: Colors.success }]} />
  //             <View style={styles.line} />
  //             <View style={[styles.dot, { backgroundColor: Colors.secondary }]} />
  //           </View>
  //           <View style={styles.routeTextContainer}>
  //             <Text style={styles.routeOrigin} numberOfLines={1}>
  //               {booking.origin?.split(",")[0] || "Pickup point"}
  //             </Text>
  //             <Text style={styles.routeDestination} numberOfLines={1}>
  //               {booking.destination?.split(",")[0] || "Drop point"}
  //             </Text>
  //           </View>
  //         </View>
  //         <View style={styles.cardHeaderRight}>
  //           <View style={[styles.statusBadge, { backgroundColor: displayStatus.color }]}>
  //             <Ionicons name={displayStatus.icon} size={12} color={Colors.white} style={styles.statusIcon} />
  //             <Text style={styles.statusText}>{displayStatus.text}</Text>
  //           </View>
  //           <Ionicons name={isExpanded ? "chevron-up" : "chevron-down"} size={20} color={Colors.gray} style={styles.expandIcon} />
  //         </View>
  //       </TouchableOpacity>

  //       {displayHasModificationPending && !rideCancelled && !isRideCompleted && (
  //         <View style={styles.modificationPendingCard}>
  //           <View style={styles.modificationPendingHeader}>
  //             <Ionicons name="swap" size={24} color="#F59E0B" />
  //             <Text style={styles.modificationPendingTitle}>Modification Request Pending</Text>
  //           </View>
  //           <View style={styles.modificationPendingDetails}>
  //             <Text style={styles.modificationPendingText}>
  //               You requested to change from <Text style={{ fontWeight: 'bold' }}>{effectiveCurrentSeats}</Text> to <Text style={{ fontWeight: 'bold' }}>{modificationRequest.requested_seats}</Text> seats
  //             </Text>
  //             <Text style={styles.modificationPendingSubtext}>
  //               Waiting for driver's approval
  //             </Text>
  //           </View>
  //         </View>
  //       )}

  //       {displayHasModificationApproved && !hasModificationPending && !rideCancelled && !isRideCompleted && (
  //         <View style={styles.modificationApprovedCard}>
  //           <View style={styles.modificationPendingHeader}>
  //             <Ionicons name="checkmark-circle" size={24} color="#10B981" />
  //             <Text style={[styles.modificationPendingTitle, { color: "#10B981" }]}>Modification Approved!</Text>
  //           </View>
  //           <View style={styles.modificationPendingDetails}>
  //             <Text style={styles.modificationPendingText}>
  //               Your seats have been changed to {effectiveCurrentSeats} seats
  //             </Text>
  //             <Text style={styles.modificationPendingSubtext}>
  //               ✓ You have used your one-time modification
  //             </Text>
  //           </View>
  //         </View>
  //       )}

  //       {displayHasModificationRejected && !hasModificationPending && !rideCancelled && !isRideCompleted && (
  //         <View style={styles.modificationRejectedCard}>
  //           <View style={styles.modificationPendingHeader}>
  //             <Ionicons name="close-circle" size={24} color="#DC2626" />
  //             <Text style={[styles.modificationPendingTitle, { color: "#DC2626" }]}>Modification Rejected - Booking Cancelled</Text>
  //           </View>
  //           <View style={styles.modificationPendingDetails}>
  //             <Text style={styles.modificationRejectedText}>
  //               Your request to change from {modificationRequest.current_seats} to {modificationRequest.requested_seats} seats was rejected.
  //             </Text>
  //             <Text style={styles.modificationRejectedSubtext}>
  //               ❌ Your original booking for {modificationRequest.current_seats} seat(s) has been CANCELLED.
  //             </Text>
  //             <Text style={styles.modificationRejectedSubtext}>
  //               ⚠️ You cannot request another modification as one-time limit is reached.
  //             </Text>
  //             {modificationRequest.rejection_reason && (
  //               <Text style={styles.modificationRejectionReason}>
  //                 Reason: {modificationRequest.rejection_reason}
  //               </Text>
  //             )}
  //           </View>
  //         </View>
  //       )}

  //       {hasUsedModification && !hasModificationPending && !hasModificationApproved && !hasModificationRejected && !rideCancelled && !isRideCompleted && (
  //         <View style={styles.modificationUsedCard}>
  //           <View style={styles.modificationPendingHeader}>
  //             <Ionicons name="information-circle" size={24} color="#9CA3AF" />
  //             <Text style={[styles.modificationPendingTitle, { color: "#6B7280" }]}>Modification Already Used</Text>
  //           </View>
  //           <View style={styles.modificationPendingDetails}>
  //             <Text style={styles.modificationUsedText}>
  //               You have already used your one-time modification for this booking.
  //             </Text>
  //             <Text style={styles.modificationUsedSubtext}>
  //               Further modifications are not allowed.
  //             </Text>
  //           </View>
  //         </View>
  //       )}

  //       {(passengerStatusInfo.type === 'auto-cancelled' || isAutoCancelled) && !hasModificationPending && (
  //         <View style={styles.autoCancelledBanner}>
  //           <Ionicons name="timer-off" size={20} color="#9CA3AF" />
  //           <Text style={styles.autoCancelledText}>This request has been auto-cancelled</Text>
  //         </View>
  //       )}

  //       {passengerStatusInfo.type === 'pending' && !isAutoCancelled && !rideCancelled && !hasModificationPending && (
  //         <View style={styles.pendingRequestBanner}>
  //           <Ionicons name="time-outline" size={20} color="#F59E0B" />
  //           <View>
  //             <Text style={styles.pendingRequestTitle}>Waiting for driver response</Text>
  //             <Text style={styles.pendingRequestSubtext}>Driver has been notified of your request</Text>
  //           </View>
  //         </View>
  //       )}

  //       {passengerStatusInfo.type === 'rejected' && !hasModificationRejected && (
  //         <View style={styles.rejectedRequestBanner}>
  //           <Ionicons name="close-circle" size={20} color="#DC2626" />
  //           <Text style={styles.rejectedRequestText}>Your request was declined by the driver</Text>
  //         </View>
  //       )}

  //       {passengerStatusInfo.type === 'driver-late' && !rideHasStarted && !isRideCompleted && !hasModificationPending && (
  //         <View style={styles.lateDriverWarning}>
  //           <Ionicons name="alert-circle" size={20} color="#EF4444" />
  //           <Text style={styles.lateDriverWarningText}>Driver is running late. The ride should start soon.</Text>
  //         </View>
  //       )}

  //       {passengerStatusInfo.type === 'start-soon' && !rideHasStarted && !isRideCompleted && !hasModificationPending && (
  //         <View style={styles.startSoonWarning}>
  //           <Ionicons name="time-outline" size={20} color="#F59E0B" />
  //           <Text style={styles.startSoonWarningText}>Ride starting soon! Be ready at your pickup location.</Text>
  //         </View>
  //       )}

  //       {passengerStatusInfo.type === 'ride-cancelled' && (
  //         <View style={styles.cancelledRideBanner}>
  //           <Ionicons name="alert-circle" size={16} color="#DC2626" />
  //           <Text style={styles.cancelledRideText}>
  //             This ride has been cancelled by the driver. Your booking has been cancelled.
  //           </Text>
  //         </View>
  //       )}

  //       {passengerStatusInfo.type === 'completed' && (
  //         <View style={styles.completedRideBanner}>
  //           <Ionicons name="checkmark-circle" size={16} color="#10B981" />
  //           <Text style={styles.completedRideBannerText}>
  //             This ride has been completed successfully.
  //           </Text>
  //         </View>
  //       )}

  //       {isExpanded && (
  //         <View>
  //           <TouchableOpacity style={styles.driverProfileRow} onPress={() => handleViewProfile(booking.driver_user_id, booking.driver_phone, booking.driver_name || "Driver", booking.driver_photo)} activeOpacity={0.8}>
  //             {renderProfileImage(booking.driver_photo, booking.driver_name || "Driver", 50)}
  //             <View style={styles.driverInfo}>
  //               <Text style={styles.driverName}>{booking.driver_name || "Driver"}</Text>
  //               <View style={styles.driverRatingContainer}>
  //                 <Ionicons name="star" size={12} color="#F59E0B" />
  //                 <Text style={styles.driverRating}>{booking.driver_rating || 4.5}</Text>
  //               </View>
  //             </View>
  //             <Ionicons name="chevron-forward" size={20} color={Colors.gray} />
  //           </TouchableOpacity>

  //           <View style={styles.requestDetails}>
  //             <View style={styles.detailItem}>
  //               <Ionicons name="time-outline" size={16} color={Colors.gray} />
  //               <Text style={styles.detailText}>Travel Date</Text>
  //               <Text style={styles.detailTextSecondary}>
  //                 {booking.departure_time ? `${formatDate(booking.departure_time).dayText}, ${formatDate(booking.departure_time).timeText}` : "-"}
  //               </Text>
  //             </View>
  //             <View style={styles.detailDivider} />
  //             <View style={styles.detailItem}>
  //               <Ionicons name="people-outline" size={16} color={displayHasModificationRejected ? "#DC2626" : Colors.gray} />
  //               <Text style={[styles.detailText, displayHasModificationRejected && { color: '#DC2626', textDecorationLine: 'line-through' }]}>
  //                 {effectiveDisplaySeats} seat{effectiveDisplaySeats > 1 ? "s" : ""}
  //                 {seatDisplayText}
  //               </Text>
  //             </View>
  //           </View>

  //           <View style={[styles.riderLocationsCard, displayHasModificationRejected && { opacity: 0.6, backgroundColor: '#FEF2F2' }]}>
  //             <Text style={styles.riderLocationsTitle}>📍 Your Trip Details</Text>
              
  //             <View style={styles.riderLocationItem}>
  //               <View style={[styles.riderLocationIcon, { backgroundColor: displayHasModificationRejected ? '#FEE2E2' : '#E8F5E9' }]}>
  //                 <Ionicons name="location" size={18} color={displayHasModificationRejected ? "#DC2626" : "#10B981"} />
  //               </View>
  //               <View style={styles.riderLocationContent}>
  //                 <Text style={styles.riderLocationLabel}>Pickup Point</Text>
  //                 <Text style={[styles.riderLocationValue, displayHasModificationRejected && { color: '#DC2626', textDecorationLine: 'line-through' }]} numberOfLines={2}>
  //                   {riderPickupLocation}
  //                 </Text>
  //               </View>
  //             </View>
              
  //             <View style={styles.riderLocationDivider} />
              
  //             <View style={styles.riderLocationItem}>
  //               <View style={[styles.riderLocationIcon, { backgroundColor: displayHasModificationRejected ? '#FEE2E2' : '#FEF2F2' }]}>
  //                 <Ionicons name="flag" size={18} color={displayHasModificationRejected ? "#DC2626" : "#DC2626"} />
  //               </View>
  //               <View style={styles.riderLocationContent}>
  //                 <Text style={styles.riderLocationLabel}>Dropoff Point</Text>
  //                 <Text style={[styles.riderLocationValue, displayHasModificationRejected && { color: '#DC2626', textDecorationLine: 'line-through' }]} numberOfLines={2}>
  //                   {riderDropoffLocation}
  //                 </Text>
  //               </View>
  //             </View>
  //           </View>

  //           {modificationRequest && !displayHasModificationPending && !rideCancelled && !isRideCompleted && (
  //             <View style={styles.modificationDetailCard}>
  //               <Text style={styles.modificationDetailTitle}>Modification Request Details</Text>
  //               <View style={styles.modificationDetailRow}>
  //                 <Text style={styles.modificationDetailLabel}>Status:</Text>
  //                 <Text style={[styles.modificationDetailValue, { 
  //                   color: displayHasModificationApproved ? "#10B981" : (displayHasModificationRejected ? "#DC2626" : "#F59E0B"),
  //                   fontWeight: 'bold' 
  //                 }]}>
  //                   {modificationRequest.status.toUpperCase()}
  //                 </Text>
  //               </View>
  //               <View style={styles.modificationDetailRow}>
  //                 <Text style={styles.modificationDetailLabel}>Current Seats:</Text>
  //                 <Text style={styles.modificationDetailValue}>
  //                   {displayHasModificationApproved ? effectiveCurrentSeats : modificationRequest.current_seats} seats
  //                 </Text>
  //               </View>
  //               <View style={styles.modificationDetailRow}>
  //                 <Text style={styles.modificationDetailLabel}>Requested Seats:</Text>
  //                 <Text style={[styles.modificationDetailValue, displayHasModificationRejected && { textDecorationLine: 'line-through', color: '#DC2626' }]}>
  //                   {modificationRequest.requested_seats} seats
  //                 </Text>
  //               </View>
  //               {modificationRequest.approved_at && displayHasModificationApproved && (
  //                 <Text style={styles.modificationDetailDate}>
  //                   Approved: {new Date(modificationRequest.approved_at).toLocaleString()}
  //                 </Text>
  //               )}
  //               {modificationRequest.created_at && (
  //                 <Text style={styles.modificationDetailDate}>
  //                   Requested: {new Date(modificationRequest.created_at).toLocaleString()}
  //                 </Text>
  //               )}
  //               {modificationRequest.rejection_reason && (
  //                 <Text style={styles.modificationDetailReason}>
  //                   Rejection Reason: {modificationRequest.rejection_reason}
  //                 </Text>
  //               )}
  //               {displayHasModificationApproved && (
  //                 <Text style={[styles.modificationDetailDate, { color: '#10B981', marginTop: 6 }]}>
  //                   ✓ One-time modification used
  //                 </Text>
  //               )}
  //             </View>
  //           )}

  //           <TouchableOpacity style={[styles.viewRouteBtn, displayHasModificationRejected && { opacity: 0.5 }]} onPress={() => handleViewRideDetails(booking, booking)} disabled={displayHasModificationRejected}>
  //             <Ionicons name="map-outline" size={16} color={displayHasModificationRejected ? Colors.gray : Colors.primary} />
  //             <Text style={[styles.viewRouteBtnText, displayHasModificationRejected && { color: Colors.gray }]}>
  //               View Route Details
  //             </Text>
  //           </TouchableOpacity>

  //           {canRequestModification && !hasModificationPending && !hasModificationApproved && !hasModificationRejected && !displayHasModificationRejected && (
  //             <TouchableOpacity 
  //               style={styles.modifySeatsBtn}
  //               onPress={() => openModifySeatsModal(booking)}>
  //               <Ionicons name="swap" size={16} color={Colors.primary} />
  //               <Text style={styles.modifySeatsBtnText}>Modify Seats (One-time)</Text>
  //             </TouchableOpacity>
  //           )}

  //           {hasUsedModification && !hasModificationPending && !hasModificationRejected && !hasModificationApproved && canRequestModification === false && booking.status === "accepted" && !rideCancelled && !isRideCompleted && (
  //             <View style={styles.modificationDisabledContainer}>
  //               <Ionicons name="lock-closed" size={16} color="#9CA3AF" />
  //               <Text style={styles.modificationDisabledText}>
  //                 Modification not available - You have already used your one-time modification
  //               </Text>
  //             </View>
  //           )}

  //           {passengerStatusInfo.type === 'ongoing' && booking?.live_session?.session_id && !displayHasModificationRejected && (
  //             <TouchableOpacity 
  //               style={styles.trackRideBtn}
  //               onPress={() => handleTrackRide(booking)}>
  //               <Ionicons name="navigate-circle" size={20} color="#fff" />
  //               <Text style={styles.trackRideBtnText}>Track Live Ride</Text>
  //             </TouchableOpacity>
  //           )}

  //           {isRideCompleted && !booking.driver_rating_given && booking.live_session?.session_id && !displayHasModificationRejected && (
  //             <TouchableOpacity 
  //               style={styles.rateDriverBtn}
  //               onPress={() => openRateDriverModal(booking, booking.live_session.session_id)}>
  //               <Ionicons name="star-outline" size={18} color="#fff" />
  //               <Text style={styles.rateDriverBtnText}>Rate Driver</Text>
  //             </TouchableOpacity>
  //           )}

  //           {isRideCompleted && booking.driver_rating_given && !displayHasModificationRejected && (
  //             <View style={styles.alreadyRatedContainer}>
  //               <Ionicons name="star" size={16} color="#F59E0B" />
  //               <Text style={styles.alreadyRatedText}>You rated this driver {booking.driver_rating}/5</Text>
  //             </View>
  //           )}

  //           {hasModificationPending && !rideCancelled && !isRideCompleted && (
  //             <TouchableOpacity 
  //               style={styles.cancelModificationBtn}
  //               onPress={() => handleCancelModificationRequest(modificationRequest.id, booking.id)}>
  //               <Ionicons name="close-circle-outline" size={18} color="#DC2626" />
  //               <Text style={styles.cancelModificationBtnText}>Cancel Modification Request</Text>
  //             </TouchableOpacity>
  //           )}
            
  //           {!displayHasModificationRejected && !isRideCompleted && !rideCancelled && booking.status !== "rejected" && booking.status !== "cancelled" && !isAutoCancelled && !hasModificationPending && (
  //             <TouchableOpacity 
  //               style={styles.cancelBookingBtn}
  //               onPress={() => cancelBooking(booking.id)}>
  //               <Text style={styles.cancelBookingBtnText}>
  //                 {booking.status === "pending" ? "Cancel Request" : "Cancel Booking"}
  //               </Text>
  //             </TouchableOpacity>
  //           )}
  //         </View>
  //       )}
  //     </View>
  //   );
  // };

  if (loading && !refreshing) {
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

  const sortedPostedRides = getSortedPostedRides();
  const sortedRequestedRides = getSortedRequestedRides();

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar backgroundColor={Colors.white} barStyle="dark-content" />
      {/* <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <MaterialIcons name="arrow-back-ios" size={26} color={Colors.orange1} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>My Rides</Text>
        <TouchableOpacity onPress={handleFilterPress} style={styles.filterIconBtn}>
          <Ionicons name="filter" size={22} color={Colors.orange1} />
        </TouchableOpacity>
      </View> */}
// Find the back button in your MyRides component (around line where header is rendered)
<View style={styles.header}>
  <TouchableOpacity style={styles.backBtn} onPress={() => {
    // Check if there's a previous screen to go back to
    if (navigation.canGoBack()) {
      navigation.goBack();
    } else {
      // If no screen to go back to, navigate to Home
      navigation.reset({
        index: 0,
        routes: [{ name: "Home" }],
      });
    }
  }}>
    <MaterialIcons name="arrow-back-ios" size={26} color={Colors.orange1} />
  </TouchableOpacity>
  <Text style={styles.headerTitle}>My Rides</Text>
  <TouchableOpacity onPress={handleFilterPress} style={styles.filterIconBtn}>
    <Ionicons name="filter" size={22} color={Colors.orange1} />
  </TouchableOpacity>
</View>
      <View style={styles.tabContainer}>
        <TouchableOpacity style={[styles.tabButton, activeTab === "posted" && styles.activeTab]} onPress={() => handleTabPress("posted")} activeOpacity={0.8}>
          <Ionicons name="car-sport-outline" size={18} color={activeTab === "posted" ? Colors.white : Colors.gray} style={styles.tabIcon} />
          <Text style={[styles.tabText, activeTab === "posted" && styles.activeTabText]}>Posted</Text>
          <View style={[styles.tabBadge, activeTab === "posted" && styles.activeTabBadge]}>
            <Text style={[styles.tabBadgeText, activeTab === "posted" && styles.activeTabBadgeText]}>{postedRides.length}</Text>
          </View>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.tabButton, activeTab === "requested" && styles.activeTab]} onPress={() => handleTabPress("requested")} activeOpacity={0.8}>
          <Ionicons name="person-outline" size={18} color={activeTab === "requested" ? Colors.white : Colors.gray} style={styles.tabIcon} />
          <Text style={[styles.tabText, activeTab === "requested" && styles.activeTabText]}>Requested</Text>
          <View style={[styles.tabBadge, activeTab === "requested" && styles.activeTabBadge]}>
            <Text style={[styles.tabBadgeText, activeTab === "requested" && styles.activeTabBadgeText]}>{requestedRides.length}</Text>
          </View>
        </TouchableOpacity>
      </View>

      <ScrollView 
        ref={scrollViewRef}
        showsVerticalScrollIndicator={false} 
        contentContainerStyle={styles.list} 
        refreshControl={
          <RefreshControl 
            refreshing={refreshing} 
            onRefresh={onRefresh} 
            colors={[Colors.primary]} 
            tintColor={Colors.primary} 
          />
        }
        scrollEventThrottle={400}>
        
        {activeTab === "posted" && (sortedPostedRides.length === 0 ? (
          <View style={styles.emptyState}>
            <Ionicons name="car-sport-outline" size={64} color={Colors.gray} />
            <Text style={styles.emptyTitle}>No rides found</Text>
            <Text style={styles.emptySubtitle}>
              {postedFilter === "all" ? "You don't have any active rides" : 
               postedFilter === "past" ? "No past rides found" :
               `You don't have any ${postedFilter} rides`}
            </Text>
            {postedFilter === "all" && (
              <TouchableOpacity 
                style={styles.viewPastRidesBtn}
                onPress={() => {
                  setPostedFilter("past");
                  setShowFilterModal(false);
                }}>
                <Text style={styles.viewPastRidesBtnText}>View Past Rides</Text>
              </TouchableOpacity>
            )}
          </View>
        ) : (
          sortedPostedRides.map((ride, index) => {
            const previousRide = index > 0 ? sortedPostedRides[index - 1] : null;
            const showDateHeader = renderDateHeader(ride, previousRide);
            const dateHeaderTitle = getDateHeaderTitle(ride.departure_time);
            
            return (
              <View key={ride.id}>
                {showDateHeader && (
                  <View style={styles.dateSectionHeader}>
                    <Text style={styles.dateSectionHeaderText}>{dateHeaderTitle}</Text>
                    <View style={styles.dateSectionHeaderLine} />
                  </View>
                )}
                {renderPostedRideCard(ride)}
              </View>
            );
          })
        ))}

        {activeTab === "requested" && (sortedRequestedRides.length === 0 ? (
          <View style={styles.emptyState}>
            <Ionicons name="document-text-outline" size={64} color={Colors.gray} />
            <Text style={styles.emptyTitle}>No requests yet</Text>
            <Text style={styles.emptySubtitle}>{requestedFilter !== "all" ? `You don't have any ${requestedFilter} requests` : "Your booking requests will appear here"}</Text>
          </View>
        ) : (
          sortedRequestedRides.map((booking, index) => {
            const previousBooking = index > 0 ? sortedRequestedRides[index - 1] : null;
            const showDateHeader = renderDateHeader(booking, previousBooking);
            const dateHeaderTitle = getDateHeaderTitle(booking.departure_time);
            
            return (
              <View key={booking.id}>
                {showDateHeader && (
                  <View style={styles.dateSectionHeader}>
                    <Text style={styles.dateSectionHeaderText}>{dateHeaderTitle}</Text>
                    <View style={styles.dateSectionHeaderLine} />
                  </View>
                )}
                {renderRequestedRideCard(booking)}
              </View>
            );
          })
        ))}
        
        <View style={styles.bottomSpacer} />
      </ScrollView>

      {/* Filter Modal */}
      <Modal visible={showFilterModal} transparent animationType="fade">
        <View style={styles.modalBackdrop}>
          <View style={styles.filterModalContent}>
            <View style={styles.filterModalHeader}>
              <Text style={styles.filterModalTitle}>Filter {activeTab === "posted" ? "Posted" : "Requested"} Rides</Text>
              <TouchableOpacity onPress={() => setShowFilterModal(false)}>
                <Ionicons name="close" size={24} color={Colors.gray} />
              </TouchableOpacity>
            </View>
            
            <ScrollView style={styles.filterOptionsList} showsVerticalScrollIndicator={false}>
              {activeTab === "posted" ? (
                <>
                  <TouchableOpacity 
                    style={[styles.filterOption, tempFilter === "all" && styles.filterOptionActive]} 
                    onPress={() => setTempFilter("all")}>
                    <View style={styles.filterOptionLeft}>
                      <Ionicons name="apps" size={20} color={tempFilter === "all" ? Colors.primary : Colors.gray} />
                      <Text style={[styles.filterOptionText, tempFilter === "all" && styles.filterOptionTextActive]}>All Active Rides</Text>
                    </View>
                    {tempFilter === "all" && <Ionicons name="checkmark-circle" size={22} color={Colors.primary} />}
                  </TouchableOpacity>
                  
                  <TouchableOpacity 
                    style={[styles.filterOption, tempFilter === "completed" && styles.filterOptionActive]} 
                    onPress={() => setTempFilter("completed")}>
                    <View style={styles.filterOptionLeft}>
                      <Ionicons name="checkmark-done-circle" size={20} color={tempFilter === "completed" ? Colors.primary : Colors.gray} />
                      <Text style={[styles.filterOptionText, tempFilter === "completed" && styles.filterOptionTextActive]}>Completed</Text>
                    </View>
                    {tempFilter === "completed" && <Ionicons name="checkmark-circle" size={22} color={Colors.primary} />}
                  </TouchableOpacity>
                  
                  <TouchableOpacity 
                    style={[styles.filterOption, tempFilter === "cancelled" && styles.filterOptionActive]} 
                    onPress={() => setTempFilter("cancelled")}>
                    <View style={styles.filterOptionLeft}>
                      <Ionicons name="close-circle" size={20} color={tempFilter === "cancelled" ? Colors.primary : Colors.gray} />
                      <Text style={[styles.filterOptionText, tempFilter === "cancelled" && styles.filterOptionTextActive]}>Cancelled</Text>
                    </View>
                    {tempFilter === "cancelled" && <Ionicons name="checkmark-circle" size={22} color={Colors.primary} />}
                  </TouchableOpacity>
                  
                  <TouchableOpacity 
                    style={[styles.filterOption, tempFilter === "autocancelled" && styles.filterOptionActive]} 
                    onPress={() => setTempFilter("autocancelled")}>
                    <View style={styles.filterOptionLeft}>
                      <Ionicons name="timer-off" size={20} color={tempFilter === "autocancelled" ? Colors.primary : Colors.gray} />
                      <Text style={[styles.filterOptionText, tempFilter === "autocancelled" && styles.filterOptionTextActive]}>Auto-cancelled</Text>
                    </View>
                    {tempFilter === "autocancelled" && <Ionicons name="checkmark-circle" size={22} color={Colors.primary} />}
                  </TouchableOpacity>
                  
                  <TouchableOpacity 
                    style={[styles.filterOption, tempFilter === "past" && styles.filterOptionActive]} 
                    onPress={() => setTempFilter("past")}>
                    <View style={styles.filterOptionLeft}>
                      <Ionicons name="calendar" size={20} color={tempFilter === "past" ? Colors.primary : Colors.gray} />
                      <Text style={[styles.filterOptionText, tempFilter === "past" && styles.filterOptionTextActive]}>Past Rides</Text>
                    </View>
                    {tempFilter === "past" && <Ionicons name="checkmark-circle" size={22} color={Colors.primary} />}
                  </TouchableOpacity>
                </>
              ) : (
                <>
                  <TouchableOpacity 
                    style={[styles.filterOption, tempFilter === "all" && styles.filterOptionActive]} 
                    onPress={() => setTempFilter("all")}>
                    <View style={styles.filterOptionLeft}>
                      <Ionicons name="apps" size={20} color={tempFilter === "all" ? Colors.primary : Colors.gray} />
                      <Text style={[styles.filterOptionText, tempFilter === "all" && styles.filterOptionTextActive]}>All Active Rides</Text>
                    </View>
                    {tempFilter === "all" && <Ionicons name="checkmark-circle" size={22} color={Colors.primary} />}
                  </TouchableOpacity>
                  
                  <TouchableOpacity 
                    style={[styles.filterOption, tempFilter === "completed" && styles.filterOptionActive]} 
                    onPress={() => setTempFilter("completed")}>
                    <View style={styles.filterOptionLeft}>
                      <Ionicons name="checkmark-done-circle" size={20} color={tempFilter === "completed" ? Colors.primary : Colors.gray} />
                      <Text style={[styles.filterOptionText, tempFilter === "completed" && styles.filterOptionTextActive]}>Completed</Text>
                    </View>
                    {tempFilter === "completed" && <Ionicons name="checkmark-circle" size={22} color={Colors.primary} />}
                  </TouchableOpacity>
                  
                  <TouchableOpacity 
                    style={[styles.filterOption, tempFilter === "cancelled" && styles.filterOptionActive]} 
                    onPress={() => setTempFilter("cancelled")}>
                    <View style={styles.filterOptionLeft}>
                      <Ionicons name="close-circle" size={20} color={tempFilter === "cancelled" ? Colors.primary : Colors.gray} />
                      <Text style={[styles.filterOptionText, tempFilter === "cancelled" && styles.filterOptionTextActive]}>Cancelled</Text>
                    </View>
                    {tempFilter === "cancelled" && <Ionicons name="checkmark-circle" size={22} color={Colors.primary} />}
                  </TouchableOpacity>
                  
                  <TouchableOpacity 
                    style={[styles.filterOption, tempFilter === "autocancelled" && styles.filterOptionActive]} 
                    onPress={() => setTempFilter("autocancelled")}>
                    <View style={styles.filterOptionLeft}>
                      <Ionicons name="timer-off" size={20} color={tempFilter === "autocancelled" ? Colors.primary : Colors.gray} />
                      <Text style={[styles.filterOptionText, tempFilter === "autocancelled" && styles.filterOptionTextActive]}>Auto-cancelled</Text>
                    </View>
                    {tempFilter === "autocancelled" && <Ionicons name="checkmark-circle" size={22} color={Colors.primary} />}
                  </TouchableOpacity>
                  
                  <TouchableOpacity 
                    style={[styles.filterOption, tempFilter === "past" && styles.filterOptionActive]} 
                    onPress={() => setTempFilter("past")}>
                    <View style={styles.filterOptionLeft}>
                      <Ionicons name="calendar" size={20} color={tempFilter === "past" ? Colors.primary : Colors.gray} />
                      <Text style={[styles.filterOptionText, tempFilter === "past" && styles.filterOptionTextActive]}>Past Rides</Text>
                    </View>
                    {tempFilter === "past" && <Ionicons name="checkmark-circle" size={22} color={Colors.primary} />}
                  </TouchableOpacity>
                  
                  <TouchableOpacity 
                    style={[styles.filterOption, tempFilter === "rejected" && styles.filterOptionActive]} 
                    onPress={() => setTempFilter("rejected")}>
                    <View style={styles.filterOptionLeft}>
                      <Ionicons name="ban" size={20} color={tempFilter === "rejected" ? Colors.primary : Colors.gray} />
                      <Text style={[styles.filterOptionText, tempFilter === "rejected" && styles.filterOptionTextActive]}>Rejected</Text>
                    </View>
                    {tempFilter === "rejected" && <Ionicons name="checkmark-circle" size={22} color={Colors.primary} />}
                  </TouchableOpacity>
                </>
              )}
            </ScrollView>
            
            <View style={styles.filterModalActions}>
              <TouchableOpacity style={styles.filterCancelBtn} onPress={() => setShowFilterModal(false)}>
                <Text style={styles.filterCancelBtnText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.filterApplyBtn} onPress={applyFilter}>
                <Text style={styles.filterApplyBtnText}>Apply</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Conflict Resolution Modal */}
      <Modal visible={conflictModalVisible} transparent animationType="fade">
        <View style={styles.modalBackdrop}>
          <View style={styles.conflictModalContent}>
            <View style={styles.conflictModalHeader}>
              <Ionicons name="alert-circle" size={48} color="#F59E0B" />
              <Text style={styles.conflictModalTitle}>Driver's Choice Required</Text>
            </View>
            
            <Text style={styles.conflictModalMessage}>
              There are two requests for this ride. Please choose which one to accept.
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
                <Text style={styles.conflictRequestNote}>
                  {conflictData.modification_request.requested_seats > conflictData.modification_request.current_seats 
                    ? `+${conflictData.modification_request.requested_seats - conflictData.modification_request.current_seats} more seat(s)` 
                    : `${conflictData.modification_request.current_seats - conflictData.modification_request.requested_seats} fewer seat(s)`}
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
                  disabled={resolvingConflict}>
                  <Text style={styles.conflictModalBtnText}>
                    {resolvingConflict ? 'Processing...' : 'Accept Modification'}
                  </Text>
                </TouchableOpacity>
              )}
              {conflictData?.booking_request && (
                <TouchableOpacity 
                  style={[styles.conflictModalBtn, styles.acceptBtn]} 
                  onPress={() => resolveConcurrentRequest('booking', null, conflictData.booking_request.id)}
                  disabled={resolvingConflict}>
                  <Text style={styles.conflictModalBtnText}>
                    {resolvingConflict ? 'Processing...' : 'Accept Booking'}
                  </Text>
                </TouchableOpacity>
              )}
            </View>
            
            <TouchableOpacity 
              style={styles.conflictModalCloseBtn} 
              onPress={() => setConflictModalVisible(false)}>
              <Text style={styles.conflictModalCloseBtnText}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Rating Modal */}
      <Modal visible={ratingModalVisible} transparent animationType="fade">
        <View style={styles.modalBackdrop}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>
              Rate Your {ratingType === 'rider' ? 'Rider' : 'Driver'}
            </Text>
            <Text style={styles.modalSub}>
              How was your experience with {selectedRider?.rider_name || 'this person'}?
            </Text>

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
                onPress={submitRating} 
                disabled={rating === 0}
              >
                <Text style={styles.submitBtnText}>Submit Rating</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Modify Seats Modal */}
      <Modal visible={modifySeatsModalVisible} transparent animationType="fade" onRequestClose={() => setModifySeatsModalVisible(false)}>
        <View style={styles.modalBackdrop}>
          <View style={styles.modifySeatsModalContent}>
            <View style={styles.modifySeatsModalHeader}>
              <Ionicons name="swap" size={24} color={Colors.primary} />
              <Text style={styles.modifySeatsModalTitle}>Modify Seat Request</Text>
              <TouchableOpacity onPress={() => setModifySeatsModalVisible(false)}>
                <Ionicons name="close" size={24} color={Colors.gray} />
              </TouchableOpacity>
            </View>
            
            <Text style={styles.modifySeatsModalSubtitle}>
              You can request to change your seat count only once per booking.
            </Text>
            
            {selectedBookingForModification?.ride_started_at && (
              <View style={styles.modifySeatsOngoingWarning}>
                <Ionicons name="car-sport" size={20} color="#DC2626" />
                <Text style={styles.modifySeatsOngoingWarningText}>
                  Ride has already started! Seat modification is not available.
                </Text>
              </View>
            )}
            
            {selectedBookingForModification && !selectedBookingForModification.ride_started_at && (
              <View style={styles.modifySeatsAvailabilityCard}>
                <Text style={styles.modifySeatsAvailabilityTitle}>
                  🚗 Driver's Vehicle Details
                </Text>
                <View style={styles.modifySeatsAvailabilityRow}>
                  <Ionicons name="car-outline" size={16} color="#6B7280" />
                  <Text style={styles.modifySeatsAvailabilityText}>
                    Total seats offered: <Text style={{ fontWeight: 'bold', color: Colors.primary }}>
                      {selectedBookingForModification.ride_total_seats || selectedBookingForModification.available_seats || 4}
                    </Text> seats
                  </Text>
                </View>
                <View style={styles.modifySeatsAvailabilityRow}>
                  <Ionicons name="people-outline" size={16} color="#6B7280" />
                  <Text style={styles.modifySeatsAvailabilityText}>
                    Currently booked: <Text style={{ fontWeight: 'bold', color: '#F59E0B' }}>
                      {selectedBookingForModification.ride_booked_seats || 0}
                    </Text> seats
                  </Text>
                </View>
                <View style={styles.modifySeatsAvailabilityRow}>
                  <Ionicons name="checkmark-circle" size={16} color="#10B981" />
                  <Text style={styles.modifySeatsAvailabilityText}>
                    Currently available: <Text style={{ fontWeight: 'bold', color: '#10B981' }}>
                      {selectedBookingForModification.ride_available_seats || 0}
                    </Text> seats
                  </Text>
                </View>
                <View style={styles.modifySeatsAvailabilityDivider} />
                <View style={styles.modifySeatsAvailabilityRow}>
                  <Ionicons name="swap" size={16} color={Colors.primary} />
                  <Text style={styles.modifySeatsAvailabilityText}>
                    Your current seats: <Text style={{ fontWeight: 'bold', color: Colors.primary }}>
                      {selectedBookingForModification.seats_requested || 1}
                    </Text> seats
                  </Text>
                </View>
              </View>
            )}
            
            <View style={styles.modifySeatsSeatSelector}>
              <Text style={styles.modifySeatsLabel}>Select number of seats:</Text>
              <View style={styles.modifySeatsControls}>
                <TouchableOpacity 
                  style={[styles.modifySeatsActionBtn, modifySeatsValue <= 1 && styles.modifySeatsActionBtnDisabled]}
                  onPress={() => setModifySeatsValue(Math.max(1, modifySeatsValue - 1))}
                  disabled={modifySeatsValue <= 1 || selectedBookingForModification?.ride_started_at}>
                  <Ionicons name="remove" size={24} color={modifySeatsValue <= 1 || selectedBookingForModification?.ride_started_at ? Colors.gray : Colors.primary} />
                </TouchableOpacity>
                <View style={styles.modifySeatsCountWrap}>
                  <Text style={styles.modifySeatsCount}>{modifySeatsValue}</Text>
                  <Text style={styles.modifySeatsMax}>/ {maxModifySeats} max available</Text>
                </View>
                <TouchableOpacity 
                  style={[styles.modifySeatsActionBtn, modifySeatsValue >= maxModifySeats && styles.modifySeatsActionBtnDisabled]}
                  onPress={() => setModifySeatsValue(Math.min(maxModifySeats, modifySeatsValue + 1))}
                  disabled={modifySeatsValue >= maxModifySeats || selectedBookingForModification?.ride_started_at}>
                  <Ionicons name="add" size={24} color={modifySeatsValue >= maxModifySeats || selectedBookingForModification?.ride_started_at ? Colors.gray : Colors.primary} />
                </TouchableOpacity>
              </View>
            </View>
            
            {selectedBookingForModification && modifySeatsValue !== (selectedBookingForModification.seats_requested || 1) && (
              <View style={styles.modifySeatsChangeSummary}>
                <Ionicons name="information-circle" size={16} color="#10B981" />
                <Text style={styles.modifySeatsChangeSummaryText}>
                  {modifySeatsValue > (selectedBookingForModification.seats_requested || 1) 
                    ? `+${modifySeatsValue - (selectedBookingForModification.seats_requested || 1)} more seat(s) will be added`
                    : `${(selectedBookingForModification.seats_requested || 1) - modifySeatsValue} fewer seat(s) will be removed`}
                </Text>
              </View>
            )}
            
            <View style={styles.modifySeatsInfo}>
              <Ionicons name="information-circle" size={16} color="#F59E0B" />
              <Text style={styles.modifySeatsInfoText}>
                Current seats: {selectedBookingForModification?.seats_requested || 1}
              </Text>
            </View>
            
            <View style={styles.modifySeatsActions}>
              <TouchableOpacity 
                style={[styles.modifySeatsCancelBtn]} 
                onPress={() => setModifySeatsModalVisible(false)}>
                <Text style={styles.modifySeatsCancelBtnText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={[styles.modifySeatsSubmitBtn, (modifySeatsLoading || selectedBookingForModification?.ride_started_at) && styles.modifySeatsSubmitBtnDisabled]} 
                onPress={submitModifySeatsRequest}
                disabled={modifySeatsLoading || selectedBookingForModification?.ride_started_at}>
                <Text style={styles.modifySeatsSubmitBtnText}>
                  {modifySeatsLoading ? 'Sending...' : 'Send Request'}
                </Text>
              </TouchableOpacity>
            </View>
            
            <Text style={styles.modifySeatsNote}>
              ⚠️ Note: This request needs driver approval. If rejected, your booking will be cancelled.
            </Text>
            
            {selectedBookingForModification?.ride_started_at && (
              <Text style={[styles.modifySeatsNote, { color: '#DC2626', marginTop: 8 }]}>
                🚫 Modifications are disabled because the ride has already started.
              </Text>
            )}
          </View>
        </View>
      </Modal>

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
  container: { flex: 1, backgroundColor: Colors.white },
  header: { flexDirection: "row", alignItems: "center", paddingHorizontal: 16, paddingVertical: 14, borderBottomWidth: 0.5, borderBottomColor: "#E5E7EB" },
  backBtn: { width: 44, height: 44, justifyContent: "center" },
  headerTitle: { ...Typography.h2, fontSize: 26, fontWeight: "700", color: Colors.primary, flex: 1, textAlign: "center" },
  filterIconBtn: { width: 44, height: 44, justifyContent: "center", alignItems: "center" },
  tabContainer: { flexDirection: "row", backgroundColor: Colors.white, paddingHorizontal: 16, paddingVertical: 12, borderBottomWidth: 0.5, borderBottomColor: "#E5E7EB" },
  tabButton: { flex: 1, flexDirection: "row", alignItems: "center", justifyContent: "center", paddingVertical: 10, borderRadius: 12, backgroundColor: "#F9FAFB", marginHorizontal: 4 },
  activeTab: { backgroundColor: Colors.primary },
  tabIcon: { marginRight: 6 },
  tabText: { ...Typography.button, color: Colors.gray, fontSize: 14, fontWeight: "600" },
  activeTabText: { color: Colors.white },
  tabBadge: { backgroundColor: Colors.gray, paddingHorizontal: 8, paddingVertical: 2, borderRadius: 10, marginLeft: 6 },
  activeTabBadge: { backgroundColor: "rgba(255,255,255,0.3)" },
  tabBadgeText: { fontSize: 12, fontWeight: "700", color: Colors.white },
  activeTabBadgeText: { color: Colors.white },
  list: { padding: 16, paddingBottom: 40 },
  card: { padding: 14, borderRadius: 16, borderWidth: 1, borderColor: "#E5E7EB", backgroundColor: "#F9FAFB", marginBottom: 12 },
  highlightRideCard: { borderWidth: 2, borderColor: Colors.primary },
  highlightBookingCard: { borderWidth: 2, borderColor: Colors.primary, backgroundColor: "#FFF7ED" },
  cardHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 12 },
  cardHeaderRight: { flexDirection: "row", alignItems: "center", gap: 8 },
  expandIcon: { marginLeft: 8 },
  routeContainer: { flex: 1, flexDirection: "row", alignItems: "center" },
  locationDot: { width: 20, alignItems: "center", marginRight: 12 },
  dot: { width: 10, height: 10, borderRadius: 5 },
  line: { width: 2, height: 20, backgroundColor: "#E5E7EB" },
  routeTextContainer: { flex: 1 },
  routeOrigin: { fontSize: 15, fontWeight: "700", color: Colors.dark, marginBottom: 4, fontFamily: FontFamily.secondary.semiBold },
  routeDestination: { fontSize: 14, color: Colors.gray, fontFamily: FontFamily.secondary.regular },
  statusBadge: { flexDirection: "row", alignItems: "center", paddingHorizontal: 10, paddingVertical: 5, borderRadius: 20 },
  statusIcon: { marginRight: 4 },
  statusText: { color: Colors.white, fontSize: 12, fontWeight: "600" },
  cardDetails: { flexDirection: "row", alignItems: "center", backgroundColor: Colors.white, borderRadius: 12, padding: 12, marginBottom: 12 },
  detailItem: { flex: 1, flexDirection: "row", alignItems: "center", flexWrap: "wrap" },
  detailText: { fontSize: 13, fontWeight: "600", color: Colors.dark, marginLeft: 6, fontFamily: FontFamily.secondary.medium },
  detailTextSecondary: { fontSize: 12, color: Colors.gray, marginLeft: 4, fontFamily: FontFamily.secondary.regular },
  detailTextPrice: { fontSize: 14, fontWeight: "700", color: Colors.primary, marginLeft: 4, fontFamily: FontFamily.secondary.bold },
  detailDivider: { width: 1, height: 24, backgroundColor: Colors.gray, opacity: 0.3, marginHorizontal: 8 },
  viewRouteBtn: { flexDirection: "row", alignItems: "center", justifyContent: "center", paddingVertical: 10, marginBottom: 12, backgroundColor: "#EEF6FF", borderRadius: 12, gap: 6 },
  viewRouteBtnText: { fontSize: 13, fontWeight: "600", color: Colors.primary },
  driverActionWrapper: { marginBottom: 8 },
  startRideBtn: { backgroundColor: Colors.primary, borderRadius: 14, paddingVertical: 14, alignItems: "center", justifyContent: "center", marginBottom: 10 },
  startRideBtnDisabled: { backgroundColor: Colors.gray, opacity: 0.6 },
  startRideBtnText: { color: Colors.white, fontSize: 15, fontWeight: "700", fontFamily: FontFamily.secondary.semiBold },
  secondaryActionsRow: { flexDirection: "row", gap: 10 },
  secondaryBtn: { flex: 1, borderWidth: 1, borderColor: "#D1D5DB", backgroundColor: Colors.white, borderRadius: 14, paddingVertical: 12, alignItems: "center", justifyContent: "center" },
  secondaryBtnText: { color: Colors.dark, fontSize: 14, fontWeight: "600", fontFamily: FontFamily.secondary.medium },
  bookingsSection: { borderTopWidth: 1, borderTopColor: "#E5E7EB", paddingTop: 12, marginTop: 6 },
  bookingSectionHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 10 },
  bookingsTitle: { fontSize: 14, fontWeight: "700", color: Colors.dark, fontFamily: FontFamily.secondary.semiBold },
  pendingChip: { backgroundColor: "#FEF3C7", paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12 },
  pendingChipText: { color: "#92400E", fontSize: 11, fontWeight: "700" },
  bookingCard: { backgroundColor: Colors.white, borderRadius: 12, padding: 12, marginBottom: 8 },
  bookingHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 8 },
  bookingInfo: { flexDirection: "row", alignItems: "center", flex: 1 },
  avatarContainer: { overflow: "hidden", backgroundColor: "#F9FAFB", borderWidth: 1, borderColor: "#E5E7EB", alignItems: "center", justifyContent: "center" },
  avatarImage: { resizeMode: "cover" },
  avatarPlaceholder: { backgroundColor: "#F3F4F6", alignItems: "center", justifyContent: "center" },
  avatarPlaceholderText: { fontWeight: "700", color: Colors.primary },
  bookingInfoText: { flex: 1, marginLeft: 12 },
  bookingPhone: { fontSize: 15, fontWeight: "600", color: Colors.dark, fontFamily: FontFamily.secondary.semiBold },
  bookingSeats: { fontSize: 12, color: Colors.gray, fontFamily: FontFamily.secondary.regular, marginTop: 2 },
  chatButton: { paddingHorizontal: 8, paddingVertical: 8 },
  bookingStatusBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12 },
  bookingStatusText: { fontSize: 12, fontWeight: "600" },
  actionRow: { flexDirection: "row", marginTop: 12 },
  actionBtn: { flex: 1, flexDirection: "row", alignItems: "center", justifyContent: "center", paddingVertical: 10, borderRadius: 10, marginHorizontal: 4 },
  acceptBtn: { backgroundColor: Colors.success },
  rejectBtn: { backgroundColor: Colors.error },
  btnText: { color: Colors.white, fontWeight: "600", marginLeft: 6, fontSize: 14 },
  modificationBadge: { flexDirection: "row", alignItems: "center", backgroundColor: "#FEF3C7", paddingHorizontal: 6, paddingVertical: 2, borderRadius: 8, marginTop: 4, gap: 4 },
  modificationBadgeText: { fontSize: 10, color: "#92400E", fontWeight: "500" },
  modificationActions: { flexDirection: "row", marginTop: 10, gap: 8 },
  modActionBtn: { flex: 1, flexDirection: "row", alignItems: "center", justifyContent: "center", paddingVertical: 8, borderRadius: 8, gap: 6 },
  approveModBtn: { backgroundColor: "#10B981" },
  rejectModBtn: { backgroundColor: "#EF4444" },
  modActionBtnText: { color: "#fff", fontSize: 13, fontWeight: "600" },
  rateRidersSection: { marginTop: 8, paddingTop: 12, borderTopWidth: 1, borderTopColor: "#E5E7EB" },
  rateSectionTitle: { fontSize: 14, fontWeight: "700", color: Colors.dark, marginBottom: 10, fontFamily: FontFamily.secondary.semiBold },
  rateRiderItem: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: "#F0F0F0" },
  rateRiderInfo: { flexDirection: "row", alignItems: "center", gap: 12 },
  rateRiderName: { fontSize: 14, fontWeight: "600", color: Colors.dark },
  rateRiderSeats: { fontSize: 11, color: Colors.gray, marginTop: 2 },
  rateRiderBtn: { backgroundColor: Colors.primary, paddingHorizontal: 16, paddingVertical: 6, borderRadius: 20 },
  rateRiderBtnText: { color: "#fff", fontSize: 12, fontWeight: "600" },
  alreadyRatedBadge: { flexDirection: "row", alignItems: "center", gap: 4, backgroundColor: "#F3F4F6", paddingHorizontal: 10, paddingVertical: 6, borderRadius: 20 },
  alreadyRatedText: { fontSize: 11, color: Colors.gray, fontWeight: "500" },
  rateDriverBtn: { backgroundColor: Colors.primary, borderRadius: 14, paddingVertical: 12, alignItems: "center", justifyContent: "center", marginTop: 8, flexDirection: "row", gap: 8 },
  rateDriverBtnText: { color: "#fff", fontSize: 14, fontWeight: "600" },
  driverProfileRow: { flexDirection: "row", alignItems: "center", backgroundColor: Colors.white, borderRadius: 12, padding: 12, marginBottom: 12 },
  driverInfo: { flex: 1, marginLeft: 12 },
  driverName: { fontSize: 16, fontWeight: "700", color: Colors.dark, fontFamily: FontFamily.secondary.semiBold },
  driverRatingContainer: { flexDirection: "row", alignItems: "center", marginTop: 4, gap: 4 },
  driverRating: { fontSize: 12, color: Colors.gray, fontFamily: FontFamily.secondary.regular },
  requestDetails: { flexDirection: "row", alignItems: "center", backgroundColor: Colors.white, borderRadius: 12, padding: 12, marginBottom: 12 },
  emptyState: { alignItems: "center", justifyContent: "center", paddingVertical: 60, paddingHorizontal: 20 },
  emptyTitle: { fontSize: 20, fontWeight: "700", color: Colors.primary, marginTop: 16, fontFamily: FontFamily.secondary.bold },
  emptySubtitle: { fontSize: 14, color: Colors.gray, marginTop: 8, textAlign: "center", fontFamily: FontFamily.secondary.regular },
  bottomSpacer: { height: 30 },
  loaderContainer: { flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: Colors.white },
  cancellationReasonContainer: { flexDirection: "row", alignItems: "center", backgroundColor: "#FEF2F2", padding: 8, borderRadius: 8, marginBottom: 10, gap: 6 },
  cancellationReasonText: { fontSize: 11, color: "#DC2626", flex: 1 },
  cancelledBadge: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 12, marginLeft: 6, gap: 4 },
  cancelledBadgeText: { color: '#fff', fontSize: 10, fontWeight: '700' },
  cancellationBanner: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#FEF2F2', padding: 12, borderRadius: 12, marginBottom: 12, gap: 12, borderWidth: 1, borderColor: '#FEE2E2' },
  cancellationBannerText: { flex: 1 },
  cancellationBannerTitle: { fontSize: 14, fontWeight: '700', marginBottom: 2 },
  cancellationBannerMessage: { fontSize: 12, color: '#6B7280' },
  cancelledBookingsSummary: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#FEF2F2', padding: 8, borderRadius: 8, marginBottom: 12, gap: 6 },
  cancelledBookingsText: { fontSize: 11, color: '#DC2626', flex: 1 },
  cancelledRideInfo: { backgroundColor: '#F9FAFB', padding: 16, borderRadius: 12, alignItems: 'center', marginTop: 8 },
  cancelledRideInfoTitle: { fontSize: 16, fontWeight: '700', color: '#DC2626', marginBottom: 8 },
  cancelledRideInfoText: { fontSize: 13, color: '#6B7280', textAlign: 'center' },
  cancelledRideBanner: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#FEF2F2', padding: 10, borderRadius: 8, marginBottom: 12, gap: 8, borderWidth: 1, borderColor: '#FEE2E2' },
  cancelledRideText: { fontSize: 12, color: '#DC2626', flex: 1, fontWeight: '500' },
  bookingCancellationReason: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#FEF2F2', padding: 6, borderRadius: 6, marginTop: 6, gap: 4 },
  bookingCancellationReasonText: { fontSize: 10, color: '#DC2626', flex: 1 },
  modalBackdrop: { flex: 1, backgroundColor: "rgba(17,24,39,0.45)", justifyContent: "center", alignItems: "center", padding: 20 },
  modalCard: { backgroundColor: "#fff", borderRadius: 24, padding: 20, alignItems: "center", width: "90%" },
  modalTitle: { fontSize: 22, fontWeight: "700", color: "#111827", textAlign: "center", marginTop: 12 },
  modalSub: { fontSize: 14, color: "#6B7280", textAlign: "center", marginTop: 8, marginBottom: 18 },
  starsRow: { flexDirection: "row", justifyContent: "center", marginBottom: 18 },
  feedbackInput: { minHeight: 100, borderWidth: 1, borderColor: "#E5E7EB", borderRadius: 16, padding: 14, color: "#111827", fontSize: 14, width: "100%", textAlignVertical: "top" },
  modalActions: { flexDirection: "row", gap: 10, marginTop: 18, width: "100%" },
  skipBtn: { flex: 1, borderWidth: 1, borderColor: "#D1D5DB", borderRadius: 999, paddingVertical: 14, alignItems: "center" },
  skipBtnText: { color: "#6B7280", fontWeight: "600" },
  submitBtn: { flex: 1, backgroundColor: Colors.primary, borderRadius: 999, paddingVertical: 14, alignItems: "center" },
  submitBtnText: { color: "#fff", fontWeight: "700" },
  modificationStatusBadge: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 12, marginLeft: 6, gap: 4 },
  modificationStatusText: { color: '#fff', fontSize: 10, fontWeight: '700' },
  modificationRequestBanner: { marginTop: 8, marginBottom: 8, padding: 12, borderRadius: 12, borderWidth: 1, borderColor: '#FEF3C7' },
  modificationRequestBannerContent: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  modificationRequestBannerText: { flex: 1 },
  modificationRequestBannerTitle: { fontSize: 14, fontWeight: '700', marginBottom: 2 },
  modificationRequestBannerSubtitle: { fontSize: 12, color: '#6B7280' },
  modificationDetailCard: { backgroundColor: '#F9FAFB', borderRadius: 12, padding: 12, marginBottom: 12, borderWidth: 1, borderColor: '#E5E7EB' },
  modificationDetailTitle: { fontSize: 13, fontWeight: '600', color: '#374151', marginBottom: 8 },
  modificationDetailStatus: { fontWeight: '700', marginLeft: 4 },
  modificationDetailRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 4 },
  modificationDetailLabel: { fontSize: 12, color: '#6B7280' },
  modificationDetailValue: { fontSize: 12, fontWeight: '600', color: '#374151' },
  modificationDetailDate: { fontSize: 10, color: '#9CA3AF', marginTop: 6 },
  modificationDetailReason: { fontSize: 11, color: '#DC2626', marginTop: 6, fontStyle: 'italic' },
  conflictModalContent: { backgroundColor: "#fff", borderRadius: 24, padding: 20, width: "90%", maxHeight: "85%" },
  conflictModalHeader: { alignItems: "center", marginBottom: 16 },
  conflictModalTitle: { fontSize: 20, fontWeight: "700", color: Colors.dark, marginTop: 12, textAlign: "center" },
  conflictModalMessage: { fontSize: 14, color: Colors.gray, textAlign: "center", marginBottom: 20, lineHeight: 20 },
  conflictRequestCard: { backgroundColor: "#F9FAFB", borderRadius: 16, padding: 16, marginBottom: 12, borderWidth: 1, borderColor: "#E5E7EB" },
  conflictRequestHeader: { flexDirection: "row", alignItems: "center", gap: 12, marginBottom: 12 },
  conflictRequestTitle: { fontSize: 16, fontWeight: "700", color: Colors.dark },
  conflictRequestDetails: { fontSize: 14, color: "#4B5563", marginBottom: 4 },
  conflictRequestNote: { fontSize: 12, color: "#F59E0B", marginTop: 6, fontStyle: "italic" },
  conflictModalSeatsInfo: { fontSize: 13, color: Colors.gray, textAlign: "center", marginBottom: 20, fontWeight: "600" },
  conflictModalButtons: { flexDirection: "row", gap: 12, marginBottom: 12 },
  conflictModalBtn: { flex: 1, paddingVertical: 14, borderRadius: 12, alignItems: "center" },
  conflictModalBtnText: { color: "#fff", fontWeight: "700", fontSize: 14 },
  conflictModalCloseBtn: { paddingVertical: 12, alignItems: "center", borderRadius: 12, backgroundColor: "#F3F4F6" },
  conflictModalCloseBtnText: { color: Colors.dark, fontWeight: "600" },
  pendingModificationBadge: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#F59E0B', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 12, marginLeft: 6, gap: 4 },
  pendingModificationBadgeText: { color: '#fff', fontSize: 10, fontWeight: '700' },
  pendingModificationsSection: { backgroundColor: '#FFFBEB', borderRadius: 12, padding: 12, marginBottom: 12, borderWidth: 1, borderColor: '#FDE68A' },
  pendingModificationsHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 12 },
  pendingModificationsTitle: { fontSize: 14, fontWeight: '700', color: '#92400E' },
  pendingModificationCard: { backgroundColor: '#fff', borderRadius: 12, padding: 12, marginBottom: 8, borderWidth: 1, borderColor: '#FDE68A' },
  pendingModificationContent: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
  pendingModificationAvatar: { marginRight: 12 },
  pendingModificationInfo: { flex: 1 },
  pendingModificationPassengerName: { fontSize: 14, fontWeight: '600', color: Colors.dark, marginBottom: 4 },
  pendingModificationSeatChange: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 4 },
  oldSeatCount: { fontSize: 12, color: '#DC2626', textDecorationLine: 'line-through' },
  newSeatCount: { fontSize: 12, color: '#10B981', fontWeight: 'bold' },
  pendingModificationTime: { fontSize: 10, color: '#B45309', opacity: 0.7 },
  pendingModificationActions: { flexDirection: 'row', gap: 8 },
  modificationApprovedBanner: { marginTop: 8, marginBottom: 8, padding: 12, borderRadius: 12, borderWidth: 1, borderColor: '#10B981' },
  modificationRejectedBanner: { marginTop: 8, marginBottom: 8, padding: 12, borderRadius: 12, borderWidth: 1, borderColor: '#DC2626' },
  modificationRejectionReason: { fontSize: 11, color: '#DC2626', marginTop: 4, fontStyle: 'italic' },
  cancelModificationBtn: { marginTop: 12, backgroundColor: '#FEF2F2', paddingVertical: 10, borderRadius: 8, borderWidth: 1, borderColor: '#EF4444', alignItems: 'center', flexDirection: 'row', justifyContent: 'center', gap: 6 },
  cancelModificationBtnText: { color: '#EF4444', fontWeight: '600', fontSize: 13 },
  completedRideBanner: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#E8F5E9', padding: 10, borderRadius: 8, marginBottom: 12, gap: 8, borderWidth: 1, borderColor: '#C8E6C9' },
  completedRideBannerText: { fontSize: 12, color: '#2E7D32', flex: 1, fontWeight: '500' },
  completedRideDetailsCard: { backgroundColor: '#F8FAFC', borderRadius: 12, padding: 12, marginBottom: 12, borderWidth: 1, borderColor: '#E5E7EB' },
  completedDetailsTitle: { fontSize: 13, fontWeight: '700', color: Colors.dark, marginBottom: 8 },
  completedDetailsRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 4 },
  completedDetailsLabel: { fontSize: 12, color: '#6B7280' },
  completedDetailsValue: { fontSize: 12, fontWeight: '600', color: '#184080' },
  modificationStatusMessageCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFFBEB', paddingHorizontal: 10, paddingVertical: 8, borderRadius: 8, marginTop: 8, marginBottom: 4, gap: 8, borderWidth: 1, borderColor: '#FDE68A' },
  modificationStatusMessageText: { fontSize: 12, color: '#B45309', fontWeight: '500', flex: 1 },
  lateDriverWarning: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#FEF2F2', paddingHorizontal: 12, paddingVertical: 10, borderRadius: 10, marginTop: 8, marginBottom: 8, gap: 10, borderWidth: 1, borderColor: '#FEE2E2' },
  lateDriverWarningText: { fontSize: 13, color: '#DC2626', fontWeight: '500', flex: 1 },
  startSoonWarning: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#FEF3C7', paddingHorizontal: 12, paddingVertical: 10, borderRadius: 10, marginTop: 8, marginBottom: 8, gap: 10, borderWidth: 1, borderColor: '#FDE68A' },
  startSoonWarningText: { fontSize: 13, color: '#92400E', fontWeight: '500', flex: 1 },
  alreadyRatedContainer: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, backgroundColor: '#F3F4F6', paddingVertical: 12, borderRadius: 14, marginTop: 8 },
  trackRideBtn: { backgroundColor: "#10B981", borderRadius: 14, paddingVertical: 14, alignItems: "center", justifyContent: "center", flexDirection: "row", gap: 8, marginTop: 8, marginBottom: 8, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4, elevation: 3 },
  trackRideBtnText: { color: "#fff", fontSize: 15, fontWeight: "700" },
  riderLocationsCard: { backgroundColor: '#F8FAFC', borderRadius: 12, padding: 12, marginBottom: 12, borderWidth: 1, borderColor: '#E5E7EB' },
  riderLocationsTitle: { fontSize: 13, fontWeight: '700', color: Colors.dark, marginBottom: 10 },
  riderLocationItem: { flexDirection: 'row', alignItems: 'flex-start', gap: 10 },
  riderLocationIcon: { width: 28, height: 28, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
  riderLocationContent: { flex: 1 },
  riderLocationLabel: { fontSize: 11, color: Colors.gray, marginBottom: 2 },
  riderLocationValue: { fontSize: 13, fontWeight: '500', color: Colors.dark },
  riderLocationDivider: { height: 1, backgroundColor: '#E5E7EB', marginVertical: 10, marginLeft: 38 },
  riderMiniLocation: { flexDirection: 'row', alignItems: 'flex-start', gap: 4, marginTop: 4 },
  riderMiniLocationText: { fontSize: 11, color: '#6B7280', flex: 1, lineHeight: 16 },
  riderExpandedDetails: { marginTop: 12, paddingTop: 12, borderTopWidth: 1, borderTopColor: '#EEF2F7' },
  riderLocationDetailCard: { backgroundColor: '#F9FAFB', borderRadius: 10, padding: 12, marginBottom: 10 },
  riderLocationDetailHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 8 },
  riderLocationDetailTitle: { fontSize: 13, fontWeight: '600', color: Colors.dark },
  riderLocationDetailText: { fontSize: 13, color: '#374151', marginLeft: 24, lineHeight: 18 },
  riderLocationWalkDistance: { fontSize: 10, color: '#6B7280', marginTop: 4, fontStyle: 'italic' },
  cancelBookingBtn: { marginTop: 12, backgroundColor: '#FEF2F2', paddingVertical: 12, borderRadius: 12, alignItems: 'center', borderWidth: 1, borderColor: '#EF4444' },
  cancelBookingBtnText: { color: '#EF4444', fontWeight: '700', fontSize: 14 },
  autoCancelledBanner: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#F3F4F6', padding: 10, borderRadius: 8, marginBottom: 10, gap: 8 },
  autoCancelledText: { fontSize: 12, color: '#6B7280', flex: 1 },
  pendingRequestBanner: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#FEF3C7', padding: 12, borderRadius: 10, marginBottom: 12, gap: 12, borderWidth: 1, borderColor: '#FDE68A' },
  pendingRequestTitle: { fontSize: 14, fontWeight: '600', color: '#92400E' },
  pendingRequestSubtext: { fontSize: 12, color: '#B45309', marginTop: 2 },
  rejectedRequestBanner: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#FEF2F2', padding: 10, borderRadius: 8, marginBottom: 10, gap: 8, borderWidth: 1, borderColor: '#FEE2E2' },
  rejectedRequestText: { fontSize: 12, color: '#DC2626', flex: 1 },
  filterModalContent: { backgroundColor: "#fff", borderRadius: 28, padding: 0, width: "100%", maxWidth: 340, maxHeight: "80%", overflow: "hidden", shadowColor: "#000", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.25, shadowRadius: 4, elevation: 5 },
  filterModalHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", paddingHorizontal: 20, paddingVertical: 16, borderBottomWidth: 1, borderBottomColor: "#E5E7EB", backgroundColor: "#fff" },
  filterModalTitle: { fontSize: 18, fontWeight: "700", color: Colors.dark },
  filterOptionsList: { maxHeight: 400, paddingHorizontal: 8 },
  filterOption: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", paddingVertical: 14, paddingHorizontal: 12, borderRadius: 12, marginVertical: 4 },
  filterOptionLeft: { flexDirection: "row", alignItems: "center", gap: 12 },
  filterOptionActive: { backgroundColor: "#EEF6FF" },
  filterOptionText: { fontSize: 15, color: Colors.dark, fontWeight: "500" },
  filterOptionTextActive: { color: Colors.primary, fontWeight: "600" },
  filterModalActions: { flexDirection: "row", gap: 12, padding: 16, borderTopWidth: 1, borderTopColor: "#E5E7EB", backgroundColor: "#fff" },
  filterCancelBtn: { flex: 1, paddingVertical: 12, borderRadius: 12, borderWidth: 1, borderColor: "#D1D5DB", alignItems: "center", backgroundColor: "#fff" },
  filterCancelBtnText: { color: Colors.gray, fontWeight: "600", fontSize: 15 },
  filterApplyBtn: { flex: 1, paddingVertical: 12, borderRadius: 12, backgroundColor: Colors.primary, alignItems: "center", shadowColor: Colors.primary, shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.2, shadowRadius: 4, elevation: 3 },
  filterApplyBtnText: { color: "#fff", fontWeight: "700", fontSize: 15 },
  riderWalkInfo: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 3 },
  riderWalkInfoText: { fontSize: 10, color: '#9CA3AF' },
  navigateLocationBtnSmall: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 6, paddingVertical: 4, paddingHorizontal: 8, backgroundColor: '#F3F4F6', borderRadius: 12, alignSelf: 'flex-start' },
  navigateLocationBtnSmallText: { fontSize: 10, color: '#6B7280', fontWeight: '500' },
  riderLocationDetailCoords: { fontSize: 10, color: '#9CA3AF', marginTop: 4 },
  dateSectionHeader: { flexDirection: 'row', alignItems: 'center', marginTop: 8, marginBottom: 12, paddingHorizontal: 4 },
  dateSectionHeaderText: { fontSize: 16, fontWeight: '700', color: Colors.primary, backgroundColor: Colors.white, paddingRight: 12, fontFamily: FontFamily.secondary.bold },
  dateSectionHeaderLine: { flex: 1, height: 1, backgroundColor: '#E5E7EB' },
  viewPastRidesBtn: { backgroundColor: "#EEF6FF", paddingHorizontal: 20, paddingVertical: 10, borderRadius: 20, marginTop: 16 },
  viewPastRidesBtnText: { color: Colors.primary, fontWeight: "600", fontSize: 14 },
  
  // Modification styles for Requested Rides
  modificationPendingCard: {
    backgroundColor: '#FFFBEB',
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#FDE68A',
  },
  modificationPendingHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 8,
  },
  modificationPendingTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#92400E',
  },
  modificationPendingDetails: {
    paddingLeft: 34,
  },
  modificationPendingText: {
    fontSize: 13,
    color: '#78350F',
    marginBottom: 4,
  },
  modificationPendingSubtext: {
    fontSize: 11,
    color: '#B45309',
  },
  modificationApprovedCard: {
    backgroundColor: '#E8F5E9',
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#C8E6C9',
  },
  modificationRejectedCard: {
    backgroundColor: '#FEF2F2',
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#FEE2E2',
  },
  modificationRejectedText: {
    fontSize: 13,
    color: '#991B1B',
    marginBottom: 4,
  },
  modificationRejectedSubtext: {
    fontSize: 11,
    color: '#DC2626',
  },
  modificationCancelledNotice: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 10,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#FEE2E2',
  },
  modificationCancelledNoticeText: {
    fontSize: 12,
    color: '#DC2626',
    fontWeight: '500',
    flex: 1,
  },
  timeWarningBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F59E0B',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 4,
  },
  timeWarningBadgeText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: '600',
  },
  upcomingBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#2457A6',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 4,
  },
  upcomingBadgeText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: '600',
  },
  rejectionReasonText: {
    fontSize: 11,
    color: '#DC2626',
    marginTop: 4,
    fontStyle: 'italic',
  },
  rejectedModificationBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FEF2F2',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    marginTop: 8,
    gap: 6,
    borderWidth: 1,
    borderColor: '#FEE2E2',
  },
  rejectedModificationBadgeText: {
    fontSize: 12,
    color: '#DC2626',
    fontWeight: '600',
  },
  modifySeatsBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.primary,
    backgroundColor: '#EEF6FF',
    marginTop: 8,
    gap: 8,
  },
  modifySeatsBtnText: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.primary,
  },
  modificationUsedCard: {
    backgroundColor: '#F3F4F6',
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  modificationUsedText: {
    fontSize: 13,
    color: '#6B7280',
    marginBottom: 4,
  },
  modificationUsedSubtext: {
    fontSize: 11,
    color: '#9CA3AF',
  },
  modificationDisabledContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F3F4F6',
    padding: 12,
    borderRadius: 10,
    marginTop: 8,
    gap: 10,
  },
  modificationDisabledText: {
    fontSize: 12,
    color: '#6B7280',
    flex: 1,
  },
  // Modify Seats Modal Styles
  modifySeatsModalContent: {
    backgroundColor: '#fff',
    borderRadius: 24,
    padding: 20,
    width: '90%',
    maxWidth: 400,
  },
  modifySeatsModalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  modifySeatsModalTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: Colors.dark,
    flex: 1,
    marginLeft: 12,
  },
  modifySeatsModalSubtitle: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 24,
    textAlign: 'center',
  },
  modifySeatsOngoingWarning: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEF2F2',
    padding: 12,
    borderRadius: 12,
    marginBottom: 20,
    gap: 10,
    borderWidth: 1,
    borderColor: '#FEE2E2',
  },
  modifySeatsOngoingWarningText: {
    fontSize: 13,
    color: '#DC2626',
    fontWeight: '500',
    flex: 1,
  },
  modifySeatsAvailabilityCard: {
    backgroundColor: '#F8FAFC',
    borderRadius: 16,
    padding: 16,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  modifySeatsAvailabilityTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.dark,
    marginBottom: 12,
    fontFamily: FontFamily.secondary.semiBold,
  },
  modifySeatsAvailabilityRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingVertical: 6,
  },
  modifySeatsAvailabilityText: {
    fontSize: 13,
    color: '#4B5563',
    flex: 1,
  },
  modifySeatsAvailabilityDivider: {
    height: 1,
    backgroundColor: '#E5E7EB',
    marginVertical: 10,
  },
  modifySeatsSeatSelector: {
    marginBottom: 20,
  },
  modifySeatsLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.dark,
    marginBottom: 12,
  },
  modifySeatsControls: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 30,
  },
  modifySeatsActionBtn: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  modifySeatsActionBtnDisabled: {
    opacity: 0.5,
  },
  modifySeatsCountWrap: {
    alignItems: 'center',
  },
  modifySeatsCount: {
    fontSize: 36,
    fontWeight: '800',
    color: Colors.primary,
  },
  modifySeatsMax: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 4,
  },
  modifySeatsChangeSummary: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E8F5E9',
    padding: 10,
    borderRadius: 10,
    marginBottom: 16,
    gap: 8,
  },
  modifySeatsChangeSummaryText: {
    fontSize: 12,
    color: '#2E7D32',
    fontWeight: '500',
    flex: 1,
  },
  modifySeatsInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEF3C7',
    padding: 12,
    borderRadius: 12,
    marginBottom: 20,
    gap: 8,
  },
  modifySeatsInfoText: {
    fontSize: 13,
    color: '#92400E',
    flex: 1,
  },
  modifySeatsActions: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16,
  },
  modifySeatsCancelBtn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#D1D5DB',
    alignItems: 'center',
  },
  modifySeatsCancelBtnText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#6B7280',
  },
  modifySeatsSubmitBtn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 12,
    backgroundColor: Colors.primary,
    alignItems: 'center',
  },
  modifySeatsSubmitBtnDisabled: {
    opacity: 0.6,
  },
  modifySeatsSubmitBtnText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#fff',
  },
  modifySeatsNote: {
    fontSize: 11,
    color: '#9CA3AF',
    textAlign: 'center',
    fontStyle: 'italic',
  },// Actual Addresses Card Styles
actualAddressesCard: {
  backgroundColor: '#F0F9FF',
  borderRadius: 12,
  padding: 14,
  marginBottom: 14,
  borderWidth: 1,
  borderColor: '#E1F0FF',
},
actualAddressesHeader: {
  flexDirection: 'row',
  alignItems: 'center',
  gap: 8,
  marginBottom: 12,
  paddingBottom: 8,
  borderBottomWidth: 1,
  borderBottomColor: '#E1F0FF',
},
actualAddressesTitle: {
  fontSize: 14,
  fontWeight: '700',
  color: '#2457A6',
},
actualAddressItem: {
  flexDirection: 'row',
  marginBottom: 12,
  gap: 12,
},
actualAddressIcon: {
  width: 36,
  height: 36,
  borderRadius: 18,
  alignItems: 'center',
  justifyContent: 'center',
},
actualAddressContent: {
  flex: 1,
},
actualAddressLabel: {
  fontSize: 11,
  color: '#6B7280',
  marginBottom: 2,
},
actualAddressValue: {
  fontSize: 13,
  color: '#111827',
  fontWeight: '500',
  lineHeight: 18,
},
actualAddressPlaceRow: {
  flexDirection: 'row',
  alignItems: 'center',
  gap: 4,
  marginTop: 2,
},
actualAddressPlace: {
  fontSize: 11,
  color: '#6B7280',
},
riderLocationWalkInfo: {
  fontSize: 10,
  color: '#6B7280',
  marginTop: 4,
  fontStyle: 'italic',
},
ongoingRideBanner: {
  backgroundColor: '#E8F5E9',
  borderRadius: 12,
  padding: 14,
  marginBottom: 12,
  borderWidth: 1,
  borderColor: '#C8E6C9',
},
ongoingRideHeader: {
  flexDirection: 'row',
  alignItems: 'center',
  gap: 10,
  marginBottom: 8,
},
ongoingRideTitle: {
  fontSize: 16,
  fontWeight: '700',
  color: '#2E7D32',
},
ongoingRideMessage: {
  fontSize: 13,
  color: '#1B5E20',
  marginBottom: 12,
},
trackLiveRideBtn: {
  backgroundColor: '#10B981',
  borderRadius: 10,
  paddingVertical: 10,
  alignItems: 'center',
  justifyContent: 'center',
  flexDirection: 'row',
  gap: 8,
},
trackLiveRideBtnText: {
  color: '#fff',
  fontSize: 14,
  fontWeight: '600',
},
driverLateBanner: {
  backgroundColor: '#FEF2F2',
  borderRadius: 12,
  padding: 14,
  marginBottom: 12,
  borderWidth: 1,
  borderColor: '#FEE2E2',
},
driverLateHeader: {
  flexDirection: 'row',
  alignItems: 'center',
  gap: 10,
  marginBottom: 8,
},
driverLateTitle: {
  fontSize: 16,
  fontWeight: '700',
  color: '#DC2626',
},
driverLateMessage: {
  fontSize: 13,
  color: '#991B1B',
  marginBottom: 6,
},
driverLateSubMessage: {
  fontSize: 11,
  color: '#7F1D1D',
  marginBottom: 12,
},
contactDriverBtn: {
  backgroundColor: '#EEF6FF',
  borderRadius: 8,
  paddingVertical: 8,
  alignItems: 'center',
  justifyContent: 'center',
  flexDirection: 'row',
  gap: 6,
},
contactDriverBtnText: {
  color: '#2457A6',
  fontSize: 13,
  fontWeight: '600',
},
});