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
  UIManager
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons, MaterialIcons } from "@expo/vector-icons";
import { useFocusEffect } from "@react-navigation/native";
import axios from "axios";
import LottieView from "lottie-react-native";
import { SvgCssUri } from 'react-native-svg/css';

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
  return `${API_BASE_URL}${url.startsWith('/') ? '' : '/'}${url}`;
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

  useEffect(() => {
    if (!phoneNumber) return;
    fetchMyRides();
    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 1, duration: 500, useNativeDriver: true }),
      Animated.timing(slideAnim, { toValue: 0, duration: 500, useNativeDriver: true }),
    ]).start();
  }, [phoneNumber]);

  useFocusEffect(
    useCallback(() => {
      if (phoneNumber) fetchMyRides();
    }, [phoneNumber])
  );

  useEffect(() => {
    if (route?.params?.initialTab) setActiveTab(route.params.initialTab);
  }, [route?.params?.initialTab]);

  const fetchMyRides = async () => {
    if (!phoneNumber) {
      setLoading(false);
      return;
    }
    try {
      const res = await axios.get(`${API_BASE_URL}/my-rides/${phoneNumber}`);
      setPostedRides(Array.isArray(res.data.posted_rides) ? res.data.posted_rides : []);
      setRequestedRides(Array.isArray(res.data.requested_rides) ? res.data.requested_rides : []);
    } catch (error) {
      console.log("Error fetching rides:", error);
      showCustomAlert("Error", "Could not load your rides.", "error");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    fetchMyRides();
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
      phoneNumber: ride.driver_phone,
      driverUserId: ride.driver_user_id,
      available_seats: ride.available_seats,
      remaining_seats: ride.remaining_seats,
      totalSeats: ride.available_seats,
      booked_seats: ride.total_booked_seats || (ride.available_seats - (ride.remaining_seats || ride.available_seats)),
      routeCoordinates: ride.route_coordinates,
      suggestedPickup: ride.suggested_pickup,
      suggestedDrop: ride.suggested_drop,
      profilePicture: ride.driver_photo,
      rating: ride.driver_rating || 4.5,
      vehicle: ride.vehicle,
      preferences: ride.preferences,
      women_only: ride.women_only,
      bookings: ride.bookings,
      status: ride.status,
      cancellation_reason: ride.cancellation_reason,
      duration_text: ride.duration_text,
      distance_km: ride.distance_km,
      date: ride.date,
      time: ride.time,
      from: ride.origin,
      to: ride.destination,
      pickupLabel: ride.pickupLabel,
      dropLabel: ride.dropLabel,
      isVerified: ride.isVerified,
      seatsRequested: ride.seats_requested,
    };
    
    const isOwnRide = user?.phone_number === ride.phoneNumber;
    
    if (isOwnRide) {
      navigation.navigate('ViewRoutePostedScreen', { ride: rideData });
    } else {
      navigation.navigate('ViewRouteRequestScreen', { ride: rideData, booking: booking });
    }
  };

  const handleEditRide = (ride) => {
    if (!ride || !phoneNumber) {
      showCustomAlert("Error", "Cannot edit ride. Please refresh and try again.", "error");
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
    };
    navigation.navigate('DriveNext', { rideData, isEdit: true, rideId: ride.id, phoneNumber });
  };

  const canStartRide = (ride) => {
    const now = new Date();
    const departureTime = new Date(ride.departure_time);
    const timeDiffMinutes = (departureTime - now) / (1000 * 60);
    return timeDiffMinutes <= 20 && timeDiffMinutes > -60 && ride.status === "active" && !ride.cancellation_reason;
  };

  const handleStartRide = (ride) => {
    if (!canStartRide(ride)) {
      const departureTime = new Date(ride.departure_time);
      const now = new Date();
      const timeDiffMinutes = (departureTime - now) / (1000 * 60);
      if (timeDiffMinutes > 20) {
        showCustomAlert("Cannot Start Ride", "You can start the ride only 20 minutes before departure time.", "warning");
      } else if (timeDiffMinutes < -60) {
        showCustomAlert("Ride Expired", "This ride has already passed. Cannot start now.", "warning");
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
    const actionLabel = action === "accept" ? "Accept" : "Reject";
    showConfirmationAlert(`${actionLabel} Request`, `Are you sure you want to ${action} this booking request?`, async () => {
      try {
        await axios.put(`${API_BASE_URL}/booking/${bookingId}/${action}`);
        showCustomAlert("Success", `Booking ${action}ed successfully.`, "success");
        fetchMyRides();
      } catch (err) {
        showCustomAlert("Error", "Could not update booking.", "error");
      }
    });
  };

  const cancelRide = async (rideId) => {
    showConfirmationAlert("Cancel Ride", "Are you sure you want to cancel this ride?", async () => {
      try {
        await axios.put(`${API_BASE_URL}/ride/${rideId}/cancel`);
        showCustomAlert("Success", "Ride cancelled successfully.", "success");
        fetchMyRides();
      } catch (err) {
        showCustomAlert("Error", "Could not cancel ride.", "error");
      }
    });
  };

  const cancelBooking = async (bookingId) => {
    showConfirmationAlert("Cancel Booking", "Are you sure you want to cancel this booking?", async () => {
      try {
        await axios.put(`${API_BASE_URL}/booking/${bookingId}/cancel`);
        showCustomAlert("Success", "Booking cancelled successfully.", "success");
        fetchMyRides();
      } catch (err) {
        showCustomAlert("Error", "Could not cancel booking.", "error");
      }
    });
  };

  const getSortedPostedRides = () => {
    let rides = [...postedRides];
    const now = new Date();
    if (rideFilter !== "all") {
      rides = rides.filter((ride) => {
        const rideTime = new Date(ride.departure_time);
        if (rideFilter === "upcoming") return rideTime > now && ride.status !== "cancelled";
        if (rideFilter === "completed") return rideTime < now && ride.status !== "cancelled";
        if (rideFilter === "cancelled") return ride.status === "cancelled";
        return true;
      });
    }
    rides.sort((a, b) => {
      const aTime = new Date(a.departure_time);
      const bTime = new Date(b.departure_time);
      const aIsActive = a.status === "active" && !a.cancellation_reason && aTime > now;
      const bIsActive = b.status === "active" && !b.cancellation_reason && bTime > now;
      const aIsCancelled = a.status === "cancelled" || a.cancellation_reason;
      const bIsCancelled = b.status === "cancelled" || b.cancellation_reason;
      if (aIsActive && !bIsActive) return -1;
      if (!aIsActive && bIsActive) return 1;
      if (aIsCancelled && !bIsCancelled) return 1;
      if (!aIsCancelled && bIsCancelled) return -1;
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
      const aIsActive = a.status === "accepted" && aTime > now;
      const bIsActive = b.status === "accepted" && bTime > now;
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

  const getStatusColor = (status, cancellationReason, isPast) => {
    if (isPast && status === "accepted") return "#9CA3AF";
    if (status === "cancelled") {
      if (cancellationReason && cancellationReason.includes("Auto-cancelled")) return "#9CA3AF";
      return Colors.error;
    }
    switch (status) {
      case "accepted": case "active": return Colors.success;
      case "pending": return "#f1c40f";
      case "rejected": return Colors.error;
      case "completed": return Colors.blue;
      case "full": return "#8e44ad";
      default: return Colors.gray;
    }
  };

  const getStatusIcon = (status, cancellationReason, isPast) => {
    if (isPast && status === "accepted") return "time-outline";
    if (status === "cancelled") {
      if (cancellationReason && cancellationReason.includes("Auto-cancelled")) return "timer-off";
      return "close-circle";
    }
    switch (status) {
      case "active": case "accepted": return "checkmark-circle";
      case "completed": return "checkmark-done";
      case "rejected": return "close-circle";
      case "pending": return "time";
      default: return "ellipse";
    }
  };

  const getStatusText = (status, cancellationReason, isPast) => {
    if (isPast && status === "accepted") return "Ride Completed";
    if (status === "cancelled") {
      if (cancellationReason && cancellationReason.includes("Auto-cancelled")) return "Auto-cancelled";
      return "Cancelled";
    }
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
    return ride.status === "cancelled" || ride.status === "completed" || (ride.cancellation_reason && ride.cancellation_reason.includes("Auto-cancelled"));
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

  const getRequestedStatusText = (status, isPast) => {
    if (isPast && status === "accepted") return "Ride completed";
    switch (status) {
      case "pending": return "Waiting for confirmation";
      case "accepted": return "Approved by driver";
      case "rejected": return "Request rejected";
      case "cancelled": return "Booking cancelled";
      default: return status;
    }
  };

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
        <Image source={{ uri: url }} style={[styles.avatarImage, { width: size, height: size, borderRadius: size / 2 }, style]} resizeMode="cover" />
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
    const isExpanded = expandedPostedRides[ride.id];
    const isDisabled = isRideDisabled(ride);
    const isAutoCancelled = ride.cancellation_reason && ride.cancellation_reason.includes("Auto-cancelled");
    const totalBooked = ride.total_booked_seats || 0;
    const startRideEnabled = canStartRide(ride);
    const departureTime = new Date(ride.departure_time);
    const now = new Date();
    const timeUntilDeparture = Math.max(0, Math.floor((departureTime - now) / (1000 * 60)));

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
            <View style={[styles.statusBadge, { backgroundColor: getStatusColor(ride.status, ride.cancellation_reason, false) }]}>
              <Ionicons name={getStatusIcon(ride.status, ride.cancellation_reason, false)} size={12} color={Colors.white} style={styles.statusIcon} />
              <Text style={styles.statusText}>{getStatusText(ride.status, ride.cancellation_reason, false)}</Text>
            </View>
            <Ionicons name={isExpanded ? "chevron-up" : "chevron-down"} size={20} color={Colors.gray} style={styles.expandIcon} />
          </View>
        </TouchableOpacity>

        {isExpanded && (
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

            {!isAutoCancelled && timeUntilDeparture > 0 && timeUntilDeparture <= 20 && (
              <View style={styles.startRideHintContainer}>
                <Ionicons name="time-outline" size={14} color={Colors.success} />
                <Text style={styles.startRideHintText}>Start ride available in {timeUntilDeparture} minutes</Text>
              </View>
            )}

            {totalBooked > 0 && (
              <View style={styles.bookedSeatsInfo}>
                <Text style={styles.bookedSeatsInfoText}>📍 {totalBooked} seat{totalBooked !== 1 ? 's' : ''} already booked</Text>
              </View>
            )}

            <TouchableOpacity style={styles.viewRouteBtn} onPress={() => handleViewRideDetails(ride)}>
              <Ionicons name="map-outline" size={16} color={Colors.primary} />
              <Text style={styles.viewRouteBtnText}>View Route Details</Text>
            </TouchableOpacity>

            {!isDisabled && (
              <View style={styles.driverActionWrapper}>
                <TouchableOpacity style={[styles.startRideBtn, !startRideEnabled && styles.startRideBtnDisabled]} onPress={() => handleStartRide(ride)} activeOpacity={0.85} disabled={!startRideEnabled}>
                  <Text style={styles.startRideBtnText}>{ride?.live_session?.session_id ? 'Open Ongoing Ride' : (startRideEnabled ? 'Start Ride' : `Start in ${timeUntilDeparture}m`)}</Text>
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

            {Array.isArray(ride.bookings) && ride.bookings.length > 0 && (
              <View style={styles.bookingsSection}>
                <View style={styles.bookingSectionHeader}>
                  <Text style={styles.bookingsTitle}>Rider Requests ({ride.bookings.length})</Text>
                  {hasPendingBookings && <View style={styles.pendingChip}><Text style={styles.pendingChipText}>Action needed</Text></View>}
                </View>
                {ride.bookings.map((booking) => (
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
                        </View>
                        <TouchableOpacity style={styles.chatButton} onPress={() => navigation.navigate('ChatScreen', {
                          receiverPhone: booking.passenger_phone,
                          conversationId: `chat-${ride.id}-${booking.id}`,
                          user: { name: booking.passenger_name || `Rider ${booking.passenger_phone?.slice(-4) || ''}`, tripInfo: `${ride.origin || 'Origin'} → ${ride.destination || 'Destination'}`, phone: booking.passenger_phone }
                        })}>
                          <Ionicons name="chatbubbles" size={24} color={Colors.primary} />
                        </TouchableOpacity>
                      </View>
                      <View style={[styles.bookingStatusBadge, { backgroundColor: getStatusColor(booking.status, booking.cancellation_reason, false) + "20" }]}>
                        <Text style={[styles.bookingStatusText, { color: getStatusColor(booking.status, booking.cancellation_reason, false) }]}>
                          {getStatusText(booking.status, booking.cancellation_reason, false)}
                        </Text>
                      </View>
                    </View>
                    {booking.status === "pending" && !isDisabled && (
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
                ))}
              </View>
            )}
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
    const isDisabled = isClosed || isAutoCancelled || isPast;

    const getPastRideMessage = () => {
      if (isPast && isAccepted) return "This ride has been completed. Thank you for riding with us!";
      if (isPast && isPending) return "This ride request has expired as the ride time has passed.";
      return null;
    };

    return (
      <View key={booking.id} style={[styles.card, targetBookingId === booking.id && styles.highlightBookingCard]}>
        <TouchableOpacity style={styles.cardHeader} onPress={() => toggleRequestedRideExpand(booking.id)} activeOpacity={0.7}>
          <View style={styles.bookingIdContainer}>
            <Ionicons name="car-outline" size={20} color={Colors.primary} />
            <Text style={styles.bookingIdText}>Ride #{booking.ride_id}</Text>
          </View>
          <View style={styles.cardHeaderRight}>
            <View style={[styles.statusBadge, { backgroundColor: getStatusColor(booking.status, booking.cancellation_reason, isPast) }]}>
              <Ionicons name={getStatusIcon(booking.status, booking.cancellation_reason, isPast)} size={12} color={Colors.white} style={styles.statusIcon} />
              <Text style={styles.statusText}>{getStatusText(booking.status, booking.cancellation_reason, isPast)}</Text>
            </View>
            <Ionicons name={isExpanded ? "chevron-up" : "chevron-down"} size={20} color={Colors.gray} style={styles.expandIcon} />
          </View>
        </TouchableOpacity>

        {isExpanded && (
          <View>
            {isAutoCancelled && (
              <View style={styles.cancellationReasonContainer}>
                <Ionicons name="information-circle" size={14} color="#DC2626" />
                <Text style={styles.cancellationReasonText}>{booking.cancellation_reason}</Text>
              </View>
            )}

            {getPastRideMessage() && (
              <View style={styles.pastRideContainer}>
                <Ionicons name="time-outline" size={16} color="#6B7280" />
                <Text style={styles.pastRideText}>{getPastRideMessage()}</Text>
              </View>
            )}

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

            {(booking.origin || booking.destination) && (
              <View style={styles.requestRouteBlock}>
                <View style={styles.locationDot}>
                  <View style={[styles.dot, { backgroundColor: Colors.success }]} />
                  <View style={styles.line} />
                  <View style={[styles.dot, { backgroundColor: Colors.secondary }]} />
                </View>
                <View style={styles.routeTextContainer}>
                  <Text style={styles.routeOrigin} numberOfLines={1}>{booking.origin?.split(",")[0] || "Origin"}</Text>
                  <Text style={styles.routeDestination} numberOfLines={1}>{booking.destination?.split(",")[0] || "Destination"}</Text>
                </View>
              </View>
            )}

            <View style={styles.requestDetails}>
              <View style={styles.detailItem}>
                <Ionicons name="time-outline" size={16} color={Colors.gray} />
                <Text style={styles.detailText}>{isPast ? "Ride Date" : (isPending ? "Requested" : "Status")}</Text>
                <Text style={styles.detailTextSecondary}>
                  {isPast ? formatDate(booking.departure_time).dayText : (isPending ? formatDate(booking.created_at).dayText : getRequestedStatusText(booking.status, isPast))}
                </Text>
              </View>
              <View style={styles.detailDivider} />
              <View style={styles.detailItem}>
                <Ionicons name="calendar-outline" size={16} color={Colors.gray} />
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

            <TouchableOpacity style={styles.viewRouteBtn} onPress={() => handleViewRideDetails(booking, booking)}>
              <Ionicons name="map-outline" size={16} color={Colors.primary} />
              <Text style={styles.viewRouteBtnText}>View Route Details</Text>
            </TouchableOpacity>

            {isPending && !isDisabled && !isPast && (
              <View style={styles.waitingBox}>
                <Ionicons name="time-outline" size={16} color="#B45309" />
                <Text style={styles.waitingText}>Waiting for driver confirmation</Text>
              </View>
            )}

            {isAccepted && !booking?.live_session?.session_id && !isDisabled && !isPast && (
              <View style={styles.waitingBox}>
                <Ionicons name="time-outline" size={16} color="#16A34A" />
                <Text style={[styles.waitingText, { color: '#166534' }]}>Driver will start the ride soon</Text>
              </View>
            )}

            {isAccepted && booking?.live_session?.session_id && !isDisabled && !isPast && (
              <>
                <View style={[styles.waitingBox, { backgroundColor: '#ECFDF3', borderColor: '#86EFAC' }]}>
                  <Ionicons name="car-outline" size={16} color="#15803D" />
                  <Text style={[styles.waitingText, { color: '#166534' }]}>🚗 Driver has started the ride!</Text>
                </View>
                <TouchableOpacity style={styles.startRideBtn} onPress={() => navigation.navigate('OngoingRideRiderScreen', { bookingId: booking.id, sessionId: booking?.live_session?.session_id })} activeOpacity={0.85}>
                  <Text style={styles.startRideBtnText}>Track Ride</Text>
                </TouchableOpacity>
              </>
            )}

            {!isClosed && !isAccepted && !isDisabled && !isPast && (
              <TouchableOpacity style={styles.cancelRideBtn} onPress={() => cancelBooking(booking.id)} activeOpacity={0.7}>
                <Ionicons name="trash-outline" size={16} color={Colors.error} />
                <Text style={styles.cancelBtnText}>Cancel Booking</Text>
              </TouchableOpacity>
            )}

            {isAutoCancelled && (
              <View style={styles.disabledRideMessage}>
                <Text style={styles.disabledRideText}>This ride has been auto-cancelled</Text>
              </View>
            )}

            {isPast && isAccepted && !booking?.live_session?.session_id && (
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

  if (loading) {
    return (
      <View style={styles.loader}>
        <LottieView source={require("../assets/loading.json")} autoPlay loop style={{ width: 300, height: 300 }} />
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

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.list} refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[Colors.primary]} tintColor={Colors.primary} />}>
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

      <CustomAlert visible={alertVisible} title={alertConfig.title} message={alertConfig.message} icon={alertConfig.icon} iconColor={alertConfig.iconColor} buttons={alertConfig.buttons} onBackdropPress={() => setAlertVisible(false)} />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
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
  requestRouteBlock: { flexDirection: "row", alignItems: "center", marginBottom: 12, backgroundColor: Colors.white, borderRadius: 12, padding: 12 },
  locationDot: { width: 20, alignItems: "center", marginRight: 12 },
  dot: { width: 10, height: 10, borderRadius: 5 },
  line: { width: 2, height: 20, backgroundColor: "#E5E7EB" },
  routeTextContainer: { flex: 1 },
  routeOrigin: { fontSize: 15, fontWeight: "700", color: Colors.dark, marginBottom: 4, fontFamily: FontFamily.secondary.semiBold },
  routeDestination: { fontSize: 14, color: Colors.gray, fontFamily: FontFamily.secondary.regular },
  statusBadge: { flexDirection: "row", alignItems: "center", paddingHorizontal: 10, paddingVertical: 5, borderRadius: 20 },
  statusIcon: { marginRight: 4 },
  statusText: { color: Colors.white, fontSize: 12, fontWeight: "600" },
  cancellationReasonContainer: { flexDirection: "row", alignItems: "center", backgroundColor: "#FEF2F2", borderRadius: 8, padding: 8, marginBottom: 12, gap: 6, borderWidth: 1, borderColor: "#FEE2E2" },
  cancellationReasonText: { flex: 1, fontSize: 11, color: "#DC2626", fontFamily: FontFamily.secondary.regular },
  pastRideContainer: { flexDirection: "row", alignItems: "center", backgroundColor: "#F3F4F6", borderRadius: 8, padding: 12, marginBottom: 12, gap: 8 },
  pastRideText: { flex: 1, fontSize: 12, color: "#6B7280", fontFamily: FontFamily.secondary.regular },
  completedRideMessage: { flexDirection: "row", alignItems: "center", backgroundColor: "#E8F5E9", borderRadius: 8, padding: 12, marginBottom: 12, gap: 8 },
  completedRideText: { flex: 1, fontSize: 12, color: "#2E7D32", fontWeight: "600", fontFamily: FontFamily.secondary.medium },
  cardDetails: { flexDirection: "row", alignItems: "center", backgroundColor: Colors.white, borderRadius: 12, padding: 12, marginBottom: 12 },
  requestDetails: { flexDirection: "row", alignItems: "center", backgroundColor: Colors.white, borderRadius: 12, padding: 12, marginBottom: 12 },
  detailItem: { flex: 1, flexDirection: "row", alignItems: "center", flexWrap: "wrap" },
  detailText: { fontSize: 13, fontWeight: "600", color: Colors.dark, marginLeft: 6, fontFamily: FontFamily.secondary.medium },
  detailTextSecondary: { fontSize: 12, color: Colors.gray, marginLeft: 4, fontFamily: FontFamily.secondary.regular },
  detailTextPrice: { fontSize: 14, fontWeight: "700", color: Colors.primary, marginLeft: 4, fontFamily: FontFamily.secondary.bold },
  detailDivider: { width: 1, height: 24, backgroundColor: Colors.gray, opacity: 0.3, marginHorizontal: 8 },
  bookedSeatsInfo: { backgroundColor: "#EFF6FF", borderRadius: 8, padding: 8, marginBottom: 12, alignItems: "center" },
  bookedSeatsInfoText: { fontSize: 12, color: Colors.primary, fontWeight: "600" },
  startRideHintContainer: { flexDirection: "row", alignItems: "center", justifyContent: "center", backgroundColor: "#E8F5E9", borderRadius: 8, padding: 6, marginBottom: 10, gap: 6 },
  startRideHintText: { fontSize: 11, color: "#2E7D32", fontWeight: "500" },
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
  waitingBox: { flexDirection: "row", alignItems: "center", backgroundColor: "#FFFBEB", borderWidth: 1, borderColor: "#FDE68A", borderRadius: 12, paddingVertical: 12, paddingHorizontal: 12, marginBottom: 10 },
  waitingText: { marginLeft: 8, color: "#92400E", fontSize: 13, fontWeight: "600" },
  cancelRideBtn: { flexDirection: "row", alignItems: "center", justifyContent: "center", paddingVertical: 10, borderRadius: 10, borderWidth: 1, borderColor: Colors.error, marginTop: 8 },
  cancelBtnText: { color: Colors.error, fontWeight: "600", marginLeft: 6, fontSize: 14 },
  bookingIdContainer: { flexDirection: "row", alignItems: "center" },
  bookingIdText: { fontSize: 15, fontWeight: "600", color: Colors.dark, marginLeft: 8, fontFamily: FontFamily.secondary.semiBold },
  driverProfileRow: { flexDirection: "row", alignItems: "center", backgroundColor: Colors.white, borderRadius: 12, padding: 12, marginBottom: 12 },
  driverInfo: { flex: 1, marginLeft: 12 },
  driverName: { fontSize: 16, fontWeight: "700", color: Colors.dark, fontFamily: FontFamily.secondary.semiBold },
  driverRatingContainer: { flexDirection: "row", alignItems: "center", marginTop: 4, gap: 4 },
  driverRating: { fontSize: 12, color: Colors.gray, fontFamily: FontFamily.secondary.regular },
  disabledRideMessage: { backgroundColor: "#F3F4F6", borderRadius: 8, padding: 10, alignItems: "center", marginTop: 8 },
  disabledRideText: { fontSize: 12, color: Colors.gray, fontFamily: FontFamily.secondary.regular },
  emptyState: { alignItems: "center", justifyContent: "center", paddingVertical: 60, paddingHorizontal: 20 },
  emptyTitle: { fontSize: 20, fontWeight: "700", color: Colors.primary, marginTop: 16, fontFamily: FontFamily.secondary.bold },
  emptySubtitle: { fontSize: 14, color: Colors.gray, marginTop: 8, textAlign: "center", fontFamily: FontFamily.secondary.regular },
  loader: { flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: Colors.white },
  bottomSpacer: { height: 30 },
});