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
  Alert
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

import { API_BASE_URL } from "../config/config_ip";

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
  
  const [ratingModalVisible, setRatingModalVisible] = useState(false);
  const [selectedRider, setSelectedRider] = useState(null);
  const [rating, setRating] = useState(0);
  const [feedback, setFeedback] = useState('');
  const [currentSessionId, setCurrentSessionId] = useState(null);
  const [ratingType, setRatingType] = useState('rider');

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
  const [rideFilter, setRideFilter] = useState("all");
  
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;
  const tabScaleAnim = useRef(new Animated.Value(1)).current;
  const scrollViewRef = useRef(null);

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
        
        console.log('MyRides focused:', { shouldRefresh, targetTab, params: route.params });
        
        if (targetTab) {
          setActiveTab(targetTab);
        }
        
        if (shouldRefresh) {
          console.log('Force refreshing MyRides');
          setForceRefresh(true);
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
    origin: ride.origin,
    destination: ride.destination,
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
      seats_requested: booking.seats_requested || booking.seats_booked,
      status: booking.status,
      total_amount: booking.total_amount,
      created_at: booking.created_at,
      passenger_phone: booking.passenger_phone,
    } : null;
    
    navigation.navigate('ViewRouteRequestScreen', { 
      ride: rideData, 
      booking: bookingData 
    });
  }
};
  // const handleViewRideDetails = (ride, booking = null) => {
  //   const rideData = {
  //     id: ride.id || ride.ride_id,
  //     origin: ride.origin,
  //     destination: ride.destination,
  //     departure_time: ride.departure_time,
  //     price: ride.price_per_seat,
  //     driverName: ride.driver_name,
  //     phoneNumber: ride.driver_phone || ride.phone_number,
  //     driverUserId: ride.driver_user_id,
  //     seatsAvailable: ride.available_seats || ride.remaining_seats,
  //     totalSeats: ride.available_seats || 4,
  //     available_seats: ride.available_seats || ride.totalSeats || ride.total_seats || 0,
  //     booked_seats: ride.total_booked_seats || 0,
  //     routeCoordinates: ride.route_coordinates || [],
  //     suggestedPickup: ride.suggested_pickup || null,
  //     suggestedDrop: ride.suggested_drop || null,
  //     profilePicture: ride.driver_photo || ride.driver_profile_picture,
  //     rating: ride.driver_rating || 4.5,
  //     vehicle: ride.vehicle,
  //     preferences: ride.preferences,
  //     women_only: ride.women_only,
  //     bookings: ride.bookings,
  //     status: ride.status,
  //     cancellation_reason: ride.cancellation_reason,
  //     duration_text: ride.duration_text,
  //     distance_km: ride.distance_km,
  //     from: ride.origin,
  //     to: ride.destination,
  //     seatsRequested: ride.seats_requested,
  //     price_per_seat: ride.price_per_seat,
  //     origin_coords: ride.origin_coords || null,
  //     destination_coords: ride.destination_coords || null,
  //     started_at: ride.started_at,
  //     completed_at: ride.completed_at,
  //   };
    
  //   const isOwnRide = user?.phone_number === ride.phone_number;
    
  //   if (isOwnRide) {
  //     navigation.navigate('ViewRoutePostedScreen', { ride: rideData });
  //   } else {
  //     const bookingData = booking ? {
  //       id: booking.id,
  //       seats_requested: booking.seats_requested || booking.seats_booked,
  //       status: booking.status,
  //       total_amount: booking.total_amount,
  //       created_at: booking.created_at,
  //       passenger_phone: booking.passenger_phone,
  //     } : null;
      
  //     navigation.navigate('ViewRouteRequestScreen', { 
  //       ride: rideData, 
  //       booking: bookingData 
  //     });
  //   }
  // };
// In ViewRouteRequestScreen component, update the useEffect that loads data:
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
    
    console.log('Editing ride:', ride.id);
    
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
    if (ride.status === "completed") {
      return { text: "Completed", color: "#6B7280", icon: "checkmark-done", type: "completed" };
    }
    
    if (ride.cancellation_reason) {
      if (ride.cancellation_reason.includes("Auto-cancelled") || ride.cancellation_reason.includes("was not started")) {
        return { text: "Auto-cancelled", color: "#DC2626", icon: "alert-circle", type: "auto-cancelled" };
      }
      return { text: "Cancelled", color: "#DC2626", icon: "close-circle", type: "cancelled" };
    }
    
    if (ride.started_at && ride.status !== "completed") {
      return { text: "Ongoing", color: "#10B981", icon: "car-sport", type: "ongoing" };
    }
    
    const now = new Date();
    const departureTime = new Date(ride.departure_time);
    const minutesToDeparture = (departureTime - now) / (1000 * 60);
    const minutesSinceDeparture = (now - departureTime) / (1000 * 60);
    
    if (minutesSinceDeparture > 30 && !ride.started_at) {
      return { text: "Expired", color: "#DC2626", icon: "time-outline", type: "expired" };
    }
    
    if (minutesToDeparture <= 15 && minutesSinceDeparture <= 30) {
      if (minutesSinceDeparture > 0) {
        return { text: "Start Now (Late)", color: "#F59E0B", icon: "time-outline", type: "ready" };
      }
      return { text: "Start Soon", color: "#F59E0B", icon: "time-outline", type: "ready" };
    }
    
    if (minutesToDeparture > 15) {
      return { text: "Upcoming", color: "#2457A6", icon: "calendar-outline", type: "upcoming" };
    }
    
    return { text: "Active", color: "#10B981", icon: "checkmark-circle", type: "active" };
  };

  const handleStartRide = async (ride) => {
    if (ride.status === "completed") {
      showCustomAlert("Cannot Start", "This ride has already been completed.", "warning");
      return;
    }
    
    const statusInfo = getRideStatusInfo(ride);
    
    if (statusInfo.type !== 'ready') {
      const now = new Date();
      const departureTime = new Date(ride.departure_time);
      const minutesToDeparture = Math.ceil((departureTime - now) / (1000 * 60));
      const minutesSinceDeparture = Math.ceil((now - departureTime) / (1000 * 60));
      
      if (ride.status === "completed") {
        showCustomAlert("Ride Completed", "This ride has already been completed.", "info");
      } else if (minutesSinceDeparture > 30) {
        showCustomAlert("Ride Expired", "This ride has been auto-cancelled as it was not started within 30 minutes of departure time.", "error");
      } else if (minutesToDeparture > 15) {
        showCustomAlert("Cannot Start Ride", `You can start the ride only 15 minutes before departure time. ${minutesToDeparture} minutes remaining.`, "warning");
      } else if (minutesSinceDeparture > 0 && minutesSinceDeparture <= 30) {
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
        console.log('Attempting to cancel ride:', rideId);
        
        const response = await axios.put(`${API_BASE_URL}/ride/${rideId}/cancel`);
        
        console.log('Cancel response:', response.data);
        
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
          
          if (navigation.canGoBack() && route.params?.rideId === rideId) {
            setTimeout(() => navigation.goBack(), 2000);
          }
        }
      } catch (err) {
        console.error("Cancel ride error details:", {
          message: err.message,
          status: err.response?.status,
          statusText: err.response?.statusText,
          data: err.response?.data,
        });
        
        const errorMessage = err.response?.data?.detail || err.response?.data?.message || err.message || "Could not cancel ride.";
        showCustomAlert("Error", `Failed to cancel ride: ${errorMessage}`, "error");
      }
    });
  };

  const getCancellationStatusDisplay = (item) => {
    if (item.cancellation_reason) {
      if (item.cancellation_reason.includes("Auto-cancelled")) {
        return {
          text: "Auto-cancelled",
          color: "#9CA3AF",
          icon: "timer-off",
          message: item.cancellation_reason
        };
      }
      if (item.cancellation_reason.includes("driver")) {
        return {
          text: "Cancelled by Driver",
          color: "#DC2626",
          icon: "close-circle",
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
        await axios.put(`${API_BASE_URL}/booking/${bookingId}/cancel`);
        showCustomAlert("Success", "Booking cancelled successfully.", "success");
        onRefresh();
      } catch (err) {
        showCustomAlert("Error", "Could not cancel booking.", "error");
      }
    });
  };

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

  const getSortedPostedRides = () => {
    let rides = [...postedRides];
    const now = new Date();
    
    if (rideFilter !== "all") {
      rides = rides.filter((ride) => {
        const rideTime = new Date(ride.departure_time);
        const minutesSinceDeparture = (now - rideTime) / (1000 * 60);
        
        if (rideFilter === "upcoming") {
          return rideTime > now && 
                 ride.status !== "cancelled" && 
                 ride.status !== "completed" &&
                 !ride.cancellation_reason && 
                 !ride.started_at;
        }
        if (rideFilter === "completed") {
          return ride.status === "completed";
        }
        if (rideFilter === "cancelled") {
          return ride.status === "cancelled" || ride.cancellation_reason;
        }
        return true;
      });
    }
    
    const getPriority = (ride) => {
      const rideTime = new Date(ride.departure_time);
      const minutesToDeparture = (rideTime - now) / (1000 * 60);
      const minutesSinceDeparture = (now - rideTime) / (1000 * 60);
      
      if (ride.status === "completed") {
        return 4;
      }
      
      if (ride.started_at && !ride.cancellation_reason && ride.status !== "completed") {
        return 0;
      }
      
      if (!ride.started_at && !ride.cancellation_reason && ride.status !== "cancelled" && ride.status !== "completed") {
        if (minutesToDeparture <= 15 && minutesToDeparture > -30) {
          return 1;
        }
      }
      
      if (!ride.started_at && !ride.cancellation_reason && ride.status !== "cancelled" && ride.status !== "completed") {
        if (minutesToDeparture > 15) {
          return 2;
        }
      }
      
      if ((minutesSinceDeparture > 30 && !ride.started_at) || 
          (minutesSinceDeparture > 0 && !ride.started_at && rideTime < now)) {
        return 3;
      }
      
      if (ride.status === "cancelled" || ride.cancellation_reason) {
        return 5;
      }
      
      return 6;
    };
    
    rides.sort((a, b) => {
      const priorityA = getPriority(a);
      const priorityB = getPriority(b);
      
      if (priorityA !== priorityB) {
        return priorityA - priorityB;
      }
      
      const aTime = new Date(a.departure_time);
      const bTime = new Date(b.departure_time);
      
      if (priorityA === 3 || priorityA === 4) {
        return bTime - aTime;
      }
      
      return aTime - bTime;
    });
    
    return rides;
  };

  const getSortedRequestedRides = () => {
    let rides = [...requestedRides];
    const now = new Date();
    rides.sort((a, b) => {
      const aTime = new Date(a.departure_time);
      const bTime = new Date(b.departure_time);
      const aIsActive = a.status === "accepted" && aTime > now && !a.cancellation_reason;
      const bIsActive = b.status === "accepted" && bTime > now && !b.cancellation_reason;
      const aIsPending = a.status === "pending";
      const bIsPending = b.status === "pending";
      const aIsCancelled = a.status === "cancelled" || a.status === "rejected";
      const bIsCancelled = b.status === "cancelled" || b.status === "rejected";
      const aIsPast = aTime < now;
      const bIsPast = bTime < now;
      if (aIsActive && !bIsActive) return -1;
      if (!aIsActive && bIsActive) return 1;
      if (aIsPending && !bIsPending && !aIsActive) return -1;
      if (!aIsPending && bIsPending && !bIsActive) return 1;
      if (aIsCancelled && !bIsCancelled) return 1;
      if (!aIsCancelled && bIsCancelled) return -1;
      if (aIsPast && !bIsPast) return 1;
      if (!aIsPast && bIsPast) return -1;
      return aTime - bTime;
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
    const minutesSinceDeparture = (now - departureTime) / (1000 * 60);
    
    return ride.status === "cancelled" || 
           ride.status === "completed" || 
           ride.cancellation_reason || 
           (minutesSinceDeparture > 30 && !ride.started_at);
  };

  const isRidePast = (departureTime) => {
    const now = new Date();
    const departure = new Date(departureTime);
    return departure < now;
  };

  const handleTabPress = (tab) => {
    Animated.sequence([
      Animated.timing(tabScaleAnim, { toValue: 0.95, duration: 100, useNativeDriver: true }),
      Animated.timing(tabScaleAnim, { toValue: 1, duration: 100, useNativeDriver: true }),
    ]).start();
    setActiveTab(tab);
    if (tab !== "posted") setRideFilter("all");
  };

  const formatDate = (dateString) => {
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
          onError={() => console.log('Failed to load image')}
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

  const renderPostedRideCard = (ride) => {
    const hasPendingBookings = Array.isArray(ride.bookings) ? ride.bookings.some((booking) => booking.status === "pending") : false;
    const hasPendingModifications = Array.isArray(ride.bookings) ? ride.bookings.some((booking) => booking.modification_request && booking.modification_request.status === "pending") : false;
    const isExpanded = expandedPostedRides[ride.id];
    const isDisabled = isRideDisabled(ride);
    const isAutoCancelled = ride.cancellation_reason && ride.cancellation_reason.includes("Auto-cancelled");
    const totalBooked = ride.total_booked_seats || 0;
    const startRideEnabled = canStartRide(ride);
    const departureTime = new Date(ride.departure_time);
    const now = new Date();
    const minutesToDeparture = Math.ceil((departureTime - now) / (1000 * 60));
    const minutesSinceDeparture = Math.ceil((now - departureTime) / (1000 * 60));
    const rideStatusInfo = getRideStatusInfo(ride);
    const cancellationInfo = getCancellationStatusDisplay(ride);
    const hasCancelledBookings = ride.bookings?.some(b => b.status === "cancelled") || false;
    const cancelledBookingsCount = ride.bookings?.filter(b => b.status === "cancelled")?.length || 0;
    const isRideCompleted = ride.status === "completed" || ride.completed_at;
    
    const pendingModifications = ride.bookings?.filter(b => 
      b.modification_request && b.modification_request.status === "pending"
    ) || [];
    
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
            <Ionicons name={isExpanded ? "chevron-up" : "chevron-down"} size={20} color={Colors.gray} style={styles.expandIcon} />
          </View>
        </TouchableOpacity>

        {isExpanded && pendingModifications.length > 0 && !cancellationInfo && (
          <View style={styles.pendingModificationsSection}>
            <View style={styles.pendingModificationsHeader}>
              <Ionicons name="swap" size={18} color="#F59E0B" />
              <Text style={styles.pendingModificationsTitle}>Pending Modification Requests ({pendingModifications.length})</Text>
            </View>
            {pendingModifications.map((booking) => (
              <View key={booking.id} style={styles.pendingModificationCard}>
                <View style={styles.pendingModificationContent}>
                  <View style={styles.pendingModificationAvatar}>
                    {renderProfileImage(booking.passenger_photo, booking.passenger_name || "Rider", 40)}
                  </View>
                  <View style={styles.pendingModificationInfo}>
                    <Text style={styles.pendingModificationPassengerName}>{booking.passenger_name || "Rider"}</Text>
                    <View style={styles.pendingModificationSeatChange}>
                      <Text style={styles.oldSeatCount}>{booking.modification_request.current_seats} seats</Text>
                      <Ionicons name="arrow-forward" size={12} color="#F59E0B" />
                      <Text style={styles.newSeatCount}>{booking.modification_request.requested_seats} seats</Text>
                    </View>
                    <Text style={styles.pendingModificationTime}>
                      Requested: {new Date(booking.modification_request.created_at).toLocaleString()}
                    </Text>
                  </View>
                </View>
                <View style={styles.pendingModificationActions}>
                  <TouchableOpacity 
                    style={[styles.modActionBtn, styles.approveModBtn]} 
                    onPress={() => handleModificationAction(booking.modification_request.id, 'approve', booking.id)}>
                    <Ionicons name="checkmark" size={16} color="#fff" />
                    <Text style={styles.modActionBtnText}>Approve</Text>
                  </TouchableOpacity>
                  <TouchableOpacity 
                    style={[styles.modActionBtn, styles.rejectModBtn]} 
                    onPress={() => handleModificationAction(booking.modification_request.id, 'reject', booking.id)}>
                    <Ionicons name="close" size={16} color="#fff" />
                    <Text style={styles.modActionBtnText}>Reject</Text>
                  </TouchableOpacity>
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
                <Text style={styles.cancellationReasonText}>{ride.cancellation_reason}</Text>
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
                <Text style={styles.detailText}>{ride.remaining_seats} / {ride.available_seats} seats left</Text>
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

            {!isRideCompleted && !isDisabled && !ride.started_at && minutesSinceDeparture <= 30 && ride.status !== "completed" && (
              <View style={styles.driverActionWrapper}>
                <TouchableOpacity 
                  style={[styles.startRideBtn, !startRideEnabled && styles.startRideBtnDisabled]} 
                  onPress={() => handleStartRide(ride)} 
                  activeOpacity={0.85} 
                  disabled={!startRideEnabled}>
                  <Text style={styles.startRideBtnText}>
                    {ride?.live_session?.session_id ? 'Open Ongoing Ride' : 
                     (startRideEnabled ? (minutesToDeparture <= 0 ? 'Start Ride (Late)' : 'Start Ride') : 
                      (minutesToDeparture > 15 ? `Start in ${minutesToDeparture}m` : 'Start Disabled'))}
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
                {ride.bookings?.filter(b => b.status === "accepted").map((booking) => (
                  <View key={booking.id} style={styles.rateRiderItem}>
                    <View style={styles.rateRiderInfo}>
                      {renderProfileImage(booking.passenger_photo, booking.passenger_name, 40)}
                      <View>
                        <Text style={styles.rateRiderName}>{booking.passenger_name}</Text>
                        <Text style={styles.rateRiderSeats}>{booking.seats_requested} seats</Text>
                      </View>
                    </View>
                    {booking.driver_rating ? (
                      <View style={styles.alreadyRatedBadge}>
                        <Ionicons name="star" size={14} color="#F59E0B" />
                        <Text style={styles.alreadyRatedText}>Rated {booking.driver_rating}/5</Text>
                      </View>
                    ) : (
                      <TouchableOpacity 
                        style={styles.rateRiderBtn}
                        onPress={() => openRateRiderModal(booking, ride.live_session.session_id)}>
                        <Text style={styles.rateRiderBtnText}>Rate</Text>
                      </TouchableOpacity>
                    )}
                  </View>
                ))}
              </View>
            )}

            {Array.isArray(ride.bookings) && ride.bookings.length > 0 && !isRideCompleted && (
              <View style={styles.bookingsSection}>
                <View style={styles.bookingSectionHeader}>
                  <Text style={styles.bookingsTitle}>Rider Requests ({ride.bookings.length})</Text>
                  {(hasPendingBookings || hasPendingModifications) && <View style={styles.pendingChip}><Text style={styles.pendingChipText}>Action needed</Text></View>}
                </View>
                {ride.bookings.map((booking) => {
                  const bookingCancellationInfo = getCancellationStatusDisplay(booking);
                  const hasModificationRequest = booking.modification_request && booking.modification_request.status === "pending";
                  
                  return (
                    <View key={booking.id} style={[styles.bookingCard, targetBookingId === booking.id && styles.highlightBookingCard]}>
                      <View style={styles.bookingHeader}>
                        <View style={styles.bookingInfo}>
                          <TouchableOpacity onPress={() => handleViewProfile(null, booking.passenger_phone, booking.passenger_name || "Rider", booking.passenger_photo)} activeOpacity={0.8}>
                            {renderProfileImage(booking.passenger_photo, booking.passenger_name || "Rider", 40)}
                          </TouchableOpacity>
                          <View style={styles.bookingInfoText}>
                            <TouchableOpacity onPress={() => handleViewProfile(null, booking.passenger_phone, booking.passenger_name || "Rider", booking.passenger_photo)}>
                              <Text style={styles.bookingPhone}>{booking.passenger_name || booking.passenger_phone || "Rider"}</Text>
                            </TouchableOpacity>
                            <Text style={styles.bookingSeats}>{booking.seats_requested} seat{booking.seats_requested > 1 ? "s" : ""}</Text>
                            {hasModificationRequest && (
                              <View style={styles.modificationBadge}>
                                <Ionicons name="swap" size={10} color="#F59E0B" />
                                <Text style={styles.modificationBadgeText}>
                                  Modification: {booking.modification_request.current_seats} → {booking.modification_request.requested_seats} seats
                                </Text>
                              </View>
                            )}
                          </View>
                          <TouchableOpacity style={styles.chatButton} onPress={() => navigation.navigate('ChatScreen', {
                            receiverPhone: booking.passenger_phone,
                            conversationId: `chat-${ride.id}-${booking.id}`,
                            rideId: ride.id,
                            user: { 
                              name: booking.passenger_name || `Rider ${booking.passenger_phone?.slice(-4) || ''}`, 
                              tripInfo: `${ride.origin || 'Origin'} → ${ride.destination || 'Destination'}`, 
                              phone: booking.passenger_phone,
                              profile_picture: booking.passenger_photo
                            }
                          })}>
                            <Ionicons name="chatbubbles" size={24} color={Colors.primary} />
                          </TouchableOpacity>
                        </View>
                        <View style={[styles.bookingStatusBadge, { 
                          backgroundColor: booking.status === "cancelled" ? "#FEE2E2" : getStatusColor(booking.status, booking.cancellation_reason, false, ride) + "20" 
                        }]}>
                          <Text style={[styles.bookingStatusText, { 
                            color: booking.status === "cancelled" ? "#DC2626" : getStatusColor(booking.status, booking.cancellation_reason, false, ride) 
                          }]}>
                            {booking.status === "cancelled" ? "Cancelled" : getStatusText(booking.status, booking.cancellation_reason, false, ride)}
                          </Text>
                        </View>
                      </View>
                      
                      {bookingCancellationInfo && (
                        <View style={styles.bookingCancellationReason}>
                          <Ionicons name="information-circle" size={12} color="#DC2626" />
                          <Text style={styles.bookingCancellationReasonText}>{bookingCancellationInfo.message}</Text>
                        </View>
                      )}
                      
                      {booking.modification_request && booking.modification_request.status === "pending" && !isDisabled && !ride.started_at && minutesSinceDeparture <= 30 && (
                        <View style={styles.modificationActions}>
                          <TouchableOpacity 
                            style={[styles.modActionBtn, styles.approveModBtn]} 
                            onPress={() => handleModificationAction(booking.modification_request.id, 'approve', booking.id)}>
                            <Ionicons name="checkmark" size={16} color="#fff" />
                            <Text style={styles.modActionBtnText}>Approve</Text>
                          </TouchableOpacity>
                          <TouchableOpacity 
                            style={[styles.modActionBtn, styles.rejectModBtn]} 
                            onPress={() => handleModificationAction(booking.modification_request.id, 'reject', booking.id)}>
                            <Ionicons name="close" size={16} color="#fff" />
                            <Text style={styles.modActionBtnText}>Reject</Text>
                          </TouchableOpacity>
                        </View>
                      )}
                      
                      {booking.status === "pending" && !isDisabled && !ride.started_at && minutesSinceDeparture <= 30 && (
                        <View style={styles.actionRow}>
                          <TouchableOpacity style={[styles.actionBtn, styles.acceptBtn]} onPress={() => handleBookingAction(booking.id, "accept")} activeOpacity={0.8}>
                            <Ionicons name="checkmark" size={16} color={Colors.white} /><Text style={styles.btnText}>Approve</Text>
                          </TouchableOpacity>
                          <TouchableOpacity style={[styles.actionBtn, styles.rejectBtn]} onPress={() => handleBookingAction(booking.id, "reject")} activeOpacity={0.8}>
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
    const isAutoCancelled = booking.cancellation_reason && booking.cancellation_reason.includes("Auto-cancelled");
    const isPast = isRidePast(booking.departure_time);
    const rideHasStarted = booking.ride_started_at || booking.started_at;
    const isDisabled = isClosed || isAutoCancelled || (isPast && !rideHasStarted);
    const needsDriverRating = isAccepted && isPast && !booking.driver_rating_given && booking.live_session?.session_id;
    const rideCancelled = booking.ride_status === "cancelled" || booking.cancellation_reason;
    const cancellationInfo = getCancellationStatusDisplay(booking);
    const isRideCompleted = booking.ride_status === "completed";
    const isRideOngoing = booking.ride_started_at && !isRideCompleted;
    
    const hasModificationRequest = booking.modification_request && booking.modification_request.status === "pending";
    const isModificationApproved = booking.modification_request && booking.modification_request.status === "approved";
    const isModificationRejected = booking.modification_request && booking.modification_request.status === "rejected";
    
    const getModificationStatus = () => {
      if (!booking.modification_request) return null;
      const status = booking.modification_request.status;
      if (rideCancelled) return "Cancelled (Ride Cancelled)";
      if (status === "pending") return "Pending Approval";
      if (status === "approved") return "Approved ✓";
      if (status === "rejected") return "Rejected ✗";
      if (status === "cancelled") return "Cancelled";
      return null;
    };
    
    const getModificationStatusColor = () => {
      if (!booking.modification_request) return null;
      const status = booking.modification_request.status;
      if (rideCancelled) return "#6B7280";
      if (status === "pending") return "#F59E0B";
      if (status === "approved") return "#10B981";
      if (status === "rejected") return "#DC2626";
      if (status === "cancelled") return "#6B7280";
      return null;
    };
    
    let statusText = "";
    let statusColor = "";
    let statusIcon = "";
    
    if (isRideCompleted) {
      statusText = "Completed";
      statusColor = "#6B7280";
      statusIcon = "checkmark-done";
    } else if (rideCancelled) {
      statusText = "Cancelled";
      statusColor = "#DC2626";
      statusIcon = "close-circle";
    } else if (booking.status === "accepted") {
      if (isRideOngoing) {
        statusText = "Ride Ongoing";
        statusColor = "#10B981";
        statusIcon = "car-sport";
      } else if (isPast) {
        statusText = "Ride Completed";
        statusColor = "#6B7280";
        statusIcon = "checkmark-done";
      } else {
        statusText = "Accepted";
        statusColor = "#10B981";
        statusIcon = "checkmark-circle";
      }
    } else if (booking.status === "pending") {
      statusText = "Pending";
      statusColor = "#F59E0B";
      statusIcon = "time";
    } else if (booking.status === "rejected") {
      statusText = "Rejected";
      statusColor = "#DC2626";
      statusIcon = "close-circle";
    } else {
      statusText = booking.status || "Unknown";
      statusColor = Colors.gray;
      statusIcon = "ellipse";
    }
    
    return (
      <View key={booking.id} style={[styles.card, targetBookingId === booking.id && styles.highlightBookingCard]}>
        <TouchableOpacity style={styles.cardHeader} onPress={() => toggleRequestedRideExpand(booking.id)} activeOpacity={0.7}>
          <View style={styles.routeContainer}>
            <View style={styles.locationDot}>
              <View style={[styles.dot, { backgroundColor: Colors.success }]} />
              <View style={styles.line} />
              <View style={[styles.dot, { backgroundColor: Colors.secondary }]} />
            </View>
            <View style={styles.routeTextContainer}>
              <Text style={styles.routeOrigin} numberOfLines={1}>
                {booking.origin?.split(",")[0] || booking.pickupLabel || "Pickup point"}
              </Text>
              <Text style={styles.routeDestination} numberOfLines={1}>
                {booking.destination?.split(",")[0] || booking.dropLabel || "Drop point"}
              </Text>
            </View>
          </View>
          <View style={styles.cardHeaderRight}>
            <View style={[styles.statusBadge, { backgroundColor: statusColor }]}>
              <Ionicons name={statusIcon} size={12} color={Colors.white} style={styles.statusIcon} />
              <Text style={styles.statusText}>{statusText}</Text>
            </View>
            {hasModificationRequest && !rideCancelled && !isRideCompleted && (
              <View style={[styles.modificationStatusBadge, { backgroundColor: getModificationStatusColor() }]}>
                <Ionicons name="swap" size={10} color="#fff" />
                <Text style={styles.modificationStatusText}>Modification Pending</Text>
              </View>
            )}
            {isModificationApproved && (
              <View style={[styles.modificationStatusBadge, { backgroundColor: "#10B981" }]}>
                <Ionicons name="checkmark" size={10} color="#fff" />
                <Text style={styles.modificationStatusText}>Modification Approved</Text>
              </View>
            )}
            {isModificationRejected && (
              <View style={[styles.modificationStatusBadge, { backgroundColor: "#DC2626" }]}>
                <Ionicons name="close" size={10} color="#fff" />
                <Text style={styles.modificationStatusText}>Modification Rejected</Text>
              </View>
            )}
            <Ionicons name={isExpanded ? "chevron-up" : "chevron-down"} size={20} color={Colors.gray} style={styles.expandIcon} />
          </View>
        </TouchableOpacity>

        {/* Modification Status Message on Card (Collapsed View) */}
        {hasModificationRequest && !rideCancelled && !isRideCompleted && !isExpanded && (
          <View style={styles.modificationStatusMessageCard}>
            <Ionicons name="swap" size={14} color="#F59E0B" />
            <Text style={styles.modificationStatusMessageText}>
              You have a pending modification request
            </Text>
          </View>
        )}

        {isModificationRejected && !rideCancelled && !isRideCompleted && !isExpanded && (
          <View style={[styles.modificationStatusMessageCard, { backgroundColor: '#FEF2F2', borderColor: '#FEE2E2' }]}>
            <Ionicons name="close-circle" size={14} color="#DC2626" />
            <Text style={[styles.modificationStatusMessageText, { color: '#DC2626' }]}>
              Driver has rejected your seat modification request
            </Text>
          </View>
        )}

        {isModificationApproved && !rideCancelled && !isRideCompleted && !isExpanded && (
          <View style={[styles.modificationStatusMessageCard, { backgroundColor: '#E8F5E9', borderColor: '#C8E6C9' }]}>
            <Ionicons name="checkmark-circle" size={14} color="#10B981" />
            <Text style={[styles.modificationStatusMessageText, { color: '#10B981' }]}>
              Your seat modification has been approved!
            </Text>
          </View>
        )}

        {rideCancelled && (
          <View style={styles.cancelledRideBanner}>
            <Ionicons name="alert-circle" size={16} color="#DC2626" />
            <Text style={styles.cancelledRideText}>
              This ride has been cancelled. Your booking has been cancelled.
            </Text>
          </View>
        )}

        {isRideCompleted && (
          <View style={styles.completedRideBanner}>
            <Ionicons name="checkmark-circle" size={16} color="#10B981" />
            <Text style={styles.completedRideBannerText}>
              This ride has been completed successfully.
            </Text>
          </View>
        )}

        {hasModificationRequest && !rideCancelled && !isRideCompleted && isExpanded && (
          <View style={[styles.modificationRequestBanner, { backgroundColor: getModificationStatusColor() + '15' }]}>
            <View style={styles.modificationRequestBannerContent}>
              <Ionicons name="swap" size={20} color={getModificationStatusColor()} />
              <View style={styles.modificationRequestBannerText}>
                <Text style={[styles.modificationRequestBannerTitle, { color: getModificationStatusColor() }]}>
                  Seat Modification Request {getModificationStatus()}
                </Text>
                <Text style={styles.modificationRequestBannerSubtitle}>
                  Changing from {booking.modification_request.current_seats} seat{booking.modification_request.current_seats > 1 ? 's' : ''} 
                  to {booking.modification_request.requested_seats} seat{booking.modification_request.requested_seats > 1 ? 's' : ''}
                </Text>
              </View>
            </View>
          </View>
        )}

        {isModificationApproved && !rideCancelled && !isRideCompleted && isExpanded && (
          <View style={[styles.modificationApprovedBanner, { backgroundColor: '#10B98115' }]}>
            <View style={styles.modificationRequestBannerContent}>
              <Ionicons name="checkmark-circle" size={20} color="#10B981" />
              <View style={styles.modificationRequestBannerText}>
                <Text style={[styles.modificationRequestBannerTitle, { color: '#10B981' }]}>
                  Modification Approved!
                </Text>
                <Text style={styles.modificationRequestBannerSubtitle}>
                  Your seats have been changed from {booking.modification_request.current_seats} to {booking.modification_request.requested_seats} seats
                </Text>
              </View>
            </View>
          </View>
        )}

        {isModificationRejected && !rideCancelled && !isRideCompleted && isExpanded && (
          <View style={[styles.modificationRejectedBanner, { backgroundColor: '#DC262615' }]}>
            <View style={styles.modificationRequestBannerContent}>
              <Ionicons name="close-circle" size={20} color="#DC2626" />
              <View style={styles.modificationRequestBannerText}>
                <Text style={[styles.modificationRequestBannerTitle, { color: '#DC2626' }]}>
                  Modification Rejected
                </Text>
                <Text style={styles.modificationRequestBannerSubtitle}>
                  Your request to change from {booking.modification_request.current_seats} to {booking.modification_request.requested_seats} seats was not approved
                </Text>
                {booking.modification_request.rejection_reason && (
                  <Text style={styles.modificationRejectionReason}>
                    Reason: {booking.modification_request.rejection_reason}
                  </Text>
                )}
              </View>
            </View>
          </View>
        )}

        {cancellationInfo && (
          <View style={styles.bookingCancellationReason}>
            <Ionicons name="information-circle" size={12} color="#DC2626" />
            <Text style={styles.bookingCancellationReasonText}>{cancellationInfo.message}</Text>
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
                <Ionicons name="people-outline" size={16} color={Colors.gray} />
                <Text style={styles.detailText}>{booking.seats_requested} seat{booking.seats_requested > 1 ? "s" : ""} requested</Text>
              </View>
            </View>

            {isRideCompleted && booking.completed_details && (
              <View style={styles.completedRideDetailsCard}>
                <Text style={styles.completedDetailsTitle}>Ride Summary</Text>
                <View style={styles.completedDetailsRow}>
                  <Text style={styles.completedDetailsLabel}>Completed on:</Text>
                  <Text style={styles.completedDetailsValue}>
                    {new Date(booking.completed_details.completed_at).toLocaleDateString()}
                  </Text>
                </View>
                <View style={styles.completedDetailsRow}>
                  <Text style={styles.completedDetailsLabel}>Total paid:</Text>
                  <Text style={styles.completedDetailsValue}>₹{booking.completed_details.total_amount || 0}</Text>
                </View>
                {booking.completed_details.ride_duration_minutes && (
                  <View style={styles.completedDetailsRow}>
                    <Text style={styles.completedDetailsLabel}>Trip duration:</Text>
                    <Text style={styles.completedDetailsValue}>{booking.completed_details.ride_duration_minutes} minutes</Text>
                  </View>
                )}
              </View>
            )}

            {booking.modification_request && !rideCancelled && !isRideCompleted && (
              <View style={styles.modificationDetailCard}>
                <Text style={styles.modificationDetailTitle}>Modification Request Status: 
                  <Text style={[styles.modificationDetailStatus, { color: getModificationStatusColor() }]}>
                    {" "}{booking.modification_request.status.toUpperCase()}
                  </Text>
                </Text>
                <View style={styles.modificationDetailRow}>
                  <Text style={styles.modificationDetailLabel}>Current Seats:</Text>
                  <Text style={styles.modificationDetailValue}>{booking.modification_request.current_seats}</Text>
                </View>
                <View style={styles.modificationDetailRow}>
                  <Text style={styles.modificationDetailLabel}>Requested Seats:</Text>
                  <Text style={styles.modificationDetailValue}>{booking.modification_request.requested_seats}</Text>
                </View>
                {booking.modification_request.created_at && (
                  <Text style={styles.modificationDetailDate}>
                    Requested: {new Date(booking.modification_request.created_at).toLocaleString()}
                  </Text>
                )}
                {booking.modification_request.resolved_at && (
                  <Text style={styles.modificationDetailDate}>
                    Resolved: {new Date(booking.modification_request.resolved_at).toLocaleString()}
                  </Text>
                )}
                {booking.modification_request.rejection_reason && (
                  <Text style={styles.modificationDetailReason}>
                    Rejection Reason: {booking.modification_request.rejection_reason}
                  </Text>
                )}
              </View>
            )}

            <TouchableOpacity style={styles.viewRouteBtn} onPress={() => handleViewRideDetails(booking, booking)}>
              <Ionicons name="map-outline" size={16} color={Colors.primary} />
              <Text style={styles.viewRouteBtnText}>
                {isRideCompleted ? "View Ride Summary" : "View Route Details"}
              </Text>
            </TouchableOpacity>

            {isAccepted && booking?.live_session?.session_id && !isDisabled && !isPast && !rideCancelled && !isRideCompleted && (
              <TouchableOpacity style={styles.startRideBtn} onPress={() => navigation.navigate('OngoingRideRiderScreen', { bookingId: booking.id, sessionId: booking?.live_session?.session_id })} activeOpacity={0.85}>
                <Text style={styles.startRideBtnText}>Track Ride</Text>
              </TouchableOpacity>
            )}

            {isRideCompleted && !booking.driver_rating_given && booking.live_session?.session_id && (
              <TouchableOpacity 
                style={styles.rateDriverBtn}
                onPress={() => openRateDriverModal(booking, booking.live_session.session_id)}>
                <Ionicons name="star-outline" size={18} color="#fff" />
                <Text style={styles.rateDriverBtnText}>Rate Driver</Text>
              </TouchableOpacity>
            )}

            {isRideCompleted && booking.driver_rating_given && (
              <View style={styles.alreadyRatedContainer}>
                <Ionicons name="star" size={16} color="#F59E0B" />
                <Text style={styles.alreadyRatedText}>You rated this driver {booking.driver_rating}/5</Text>
              </View>
            )}

            {hasModificationRequest && !rideCancelled && !isRideCompleted && (
              <TouchableOpacity 
                style={styles.cancelModificationBtn}
                onPress={() => handleCancelModificationRequest(booking.modification_request.id, booking.id)}>
                <Ionicons name="close-circle-outline" size={18} color="#DC2626" />
                <Text style={styles.cancelModificationBtnText}>Cancel Modification Request</Text>
              </TouchableOpacity>
            )}

            {isPast && isAccepted && !booking?.live_session?.session_id && !rideHasStarted && !rideCancelled && !isRideCompleted && (
              <View style={styles.completedRideMessage}>
                <Ionicons name="checkmark-circle" size={16} color="#10B981" />
                <Text style={styles.completedRideText}>Ride completed successfully</Text>
              </View>
            )}
          </View>
        )}
      </View>
    );
  };

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
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <MaterialIcons name="arrow-back-ios" size={26} color={Colors.orange1} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>My Rides</Text>
        <TouchableOpacity onPress={onRefresh} style={styles.refreshBtn}>
          <Ionicons name="refresh" size={22} color={Colors.orange1} />
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

      {activeTab === "posted" && (
        <View style={styles.stickyFilterContainer}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterRow}>
            {[{ key: "all", label: "All", icon: "apps" }, { key: "upcoming", label: "Upcoming", icon: "time" }, { key: "completed", label: "Completed", icon: "checkmark-circle" }, { key: "cancelled", label: "Cancelled", icon: "close-circle" }].map((filter) => (
              <TouchableOpacity key={filter.key} style={[styles.filterChip, rideFilter === filter.key && styles.activeChip]} onPress={() => setRideFilter(filter.key)} activeOpacity={0.7}>
                <Ionicons name={filter.icon} size={14} color={rideFilter === filter.key ? Colors.white : Colors.gray} style={styles.filterIcon} />
                <Text style={[styles.chipText, rideFilter === filter.key && styles.activeChipText]}>{filter.label}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      )}

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
            <Text style={styles.emptySubtitle}>{rideFilter !== "all" ? `You don't have any ${rideFilter} rides` : "Post a ride to get started"}</Text>
          </View>
        ) : (sortedPostedRides.map(renderPostedRideCard)))}

        {activeTab === "requested" && (sortedRequestedRides.length === 0 ? (
          <View style={styles.emptyState}>
            <Ionicons name="document-text-outline" size={64} color={Colors.gray} />
            <Text style={styles.emptyTitle}>No requests yet</Text>
            <Text style={styles.emptySubtitle}>Your booking requests will appear here</Text>
          </View>
        ) : (sortedRequestedRides.map(renderRequestedRideCard)))}
        
        <View style={styles.bottomSpacer} />
      </ScrollView>

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
  // ... (keep all existing styles from your original file)
  container: { flex: 1, backgroundColor: Colors.white },
  header: { flexDirection: "row", alignItems: "center", paddingHorizontal: 16, paddingVertical: 14, borderBottomWidth: 0.5, borderBottomColor: "#E5E7EB" },
  backBtn: { width: 44, height: 44, justifyContent: "center" },
  headerTitle: { ...Typography.h2, fontSize: 26, fontWeight: "700", color: Colors.primary, flex: 1, textAlign: "center" },
  refreshBtn: { width: 44, height: 44, justifyContent: "center", alignItems: "center" },
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
  stickyFilterContainer: { backgroundColor: Colors.white, paddingHorizontal: 16, paddingVertical: 12, borderBottomWidth: 0.5, borderBottomColor: "#E5E7EB" },
  filterRow: { flexDirection: "row", paddingVertical: 4 },
  filterChip: { flexDirection: "row", alignItems: "center", paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20, backgroundColor: "#F9FAFB", marginRight: 8, borderWidth: 1, borderColor: "#E5E7EB" },
  activeChip: { backgroundColor: Colors.primary, borderColor: Colors.primary },
  filterIcon: { marginRight: 6 },
  chipText: { ...Typography.label, fontSize: 13, fontWeight: "600", color: Colors.gray },
  activeChipText: { color: Colors.white },
  card: { padding: 14, borderRadius: 16, borderWidth: 1, borderColor: "#E5E7EB", backgroundColor: "#F9FAFB", marginBottom: 12 },
  highlightRideCard: { borderWidth: 2, borderColor: Colors.primary },
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
  highlightBookingCard: { borderWidth: 2, borderColor: Colors.primary, backgroundColor: "#FFF7ED" },
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
  completedRideMessage: { flexDirection: "row", alignItems: "center", justifyContent: "center", backgroundColor: "#E8F5E9", borderRadius: 8, padding: 10, marginTop: 8, gap: 8 },
  completedRideText: { fontSize: 12, color: "#2E7D32", fontWeight: "600", fontFamily: FontFamily.secondary.medium },
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
  modalBackdrop: { flex: 1, backgroundColor: "rgba(17,24,39,0.45)", justifyContent: "center", padding: 20 },
  modalCard: { backgroundColor: "#fff", borderRadius: 24, padding: 20, alignItems: "center" },
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
  pendingModificationBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F59E0B',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginLeft: 6,
    gap: 4,
  },
  pendingModificationBadgeText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: '700',
  },
  pendingModificationsSection: {
    backgroundColor: '#FFFBEB',
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#FDE68A',
  },
  pendingModificationsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  pendingModificationsTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#92400E',
  },
  pendingModificationCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 12,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#FDE68A',
  },
  pendingModificationContent: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  pendingModificationAvatar: {
    marginRight: 12,
  },
  pendingModificationInfo: {
    flex: 1,
  },
  pendingModificationPassengerName: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.dark,
    marginBottom: 4,
  },
  pendingModificationSeatChange: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 4,
  },
  oldSeatCount: {
    fontSize: 12,
    color: '#DC2626',
    textDecorationLine: 'line-through',
  },
  newSeatCount: {
    fontSize: 12,
    color: '#10B981',
    fontWeight: 'bold',
  },
  pendingModificationTime: {
    fontSize: 10,
    color: '#B45309',
    opacity: 0.7,
  },
  pendingModificationActions: {
    flexDirection: 'row',
    gap: 8,
  },
  modificationApprovedBanner: {
    marginTop: 8,
    marginBottom: 8,
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#10B981',
  },
  modificationRejectedBanner: {
    marginTop: 8,
    marginBottom: 8,
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#DC2626',
  },
  modificationRejectionReason: {
    fontSize: 11,
    color: '#DC2626',
    marginTop: 4,
    fontStyle: 'italic',
  },
  cancelModificationBtn: {
    marginTop: 12,
    backgroundColor: '#FEF2F2',
    paddingVertical: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#EF4444',
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 6,
  },
  cancelModificationBtnText: {
    color: '#EF4444',
    fontWeight: '600',
    fontSize: 13,
  },
  completedRideBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E8F5E9',
    padding: 10,
    borderRadius: 8,
    marginBottom: 12,
    gap: 8,
    borderWidth: 1,
    borderColor: '#C8E6C9',
  },
  completedRideBannerText: {
    fontSize: 12,
    color: '#2E7D32',
    flex: 1,
    fontWeight: '500',
  },
  completedRideDetailsCard: {
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  completedDetailsTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.dark,
    marginBottom: 8,
  },
  completedDetailsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 4,
  },
  completedDetailsLabel: {
    fontSize: 12,
    color: '#6B7280',
  },
  completedDetailsValue: {
    fontSize: 12,
    fontWeight: '600',
    color: '#184080',
  },
  // New styles for modification status messages on card
  modificationStatusMessageCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFBEB',
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderRadius: 8,
    marginTop: 8,
    marginBottom: 4,
    gap: 8,
    borderWidth: 1,
    borderColor: '#FDE68A',
  },
  modificationStatusMessageText: {
    fontSize: 12,
    color: '#B45309',
    fontWeight: '500',
    flex: 1,
  },
});