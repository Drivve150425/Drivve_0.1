import React, { useEffect, useState, useRef, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  StatusBar,
  ActivityIndicator,
  RefreshControl,
  Animated,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons, MaterialIcons } from "@expo/vector-icons";
import { useFocusEffect } from "@react-navigation/native";
import axios from "axios";

import { useAuth } from "../context/AuthContext";
import { Colors, Typography } from "../constants/Colors";
import { FontFamily } from "../constants/Fonts";

const BASE_URL = process.env.EXPO_PUBLIC_API_URL || "http://192.168.1.2:8000";

export default function MyRides({ route, navigation }) {
  const { user } = useAuth();
  const phoneNumber = user?.phone_number;

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
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 500,
        useNativeDriver: true,
      }),
    ]).start();
  }, [phoneNumber]);

  useFocusEffect(
    useCallback(() => {
      if (phoneNumber) {
        fetchMyRides();
      }
    }, [phoneNumber])
  );

  useEffect(() => {
    if (route?.params?.initialTab) {
      setActiveTab(route.params.initialTab);
    }
  }, [route?.params?.initialTab]);

  const fetchMyRides = async () => {
    if (!phoneNumber) {
      setLoading(false);
      return;
    }

    try {
      const res = await axios.get(`${BASE_URL}/my-rides/${phoneNumber}`);
      setPostedRides(Array.isArray(res.data.posted_rides) ? res.data.posted_rides : []);
      setRequestedRides(Array.isArray(res.data.requested_rides) ? res.data.requested_rides : []);
    } catch (error) {
      console.log("Error fetching rides:", error);
      Alert.alert("Error", "Could not load your rides.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    fetchMyRides();
  };

  const showUpcomingFeature = (featureName) => {
    Alert.alert("Upcoming feature", `${featureName} will be available soon.`);
  };

  const handleEditRide = () => {
    showUpcomingFeature("Edit ride");
  };

  const handleStartRide = () => {
    showUpcomingFeature("Start ride");
  };

  const handleBookingAction = async (bookingId, action) => {
    const actionLabel = action === "accept" ? "Accept" : "Reject";

    Alert.alert(
      `${actionLabel} Request`,
      `Are you sure you want to ${action} this booking request?`,
      [
        { text: "No", style: "cancel" },
        {
          text: "Yes",
          onPress: async () => {
            try {
              await axios.put(`${BASE_URL}/booking/${bookingId}/${action}`);
              Alert.alert("Success", `Booking ${action}ed successfully.`);
              fetchMyRides();
            } catch (err) {
              Alert.alert("Error", "Could not update booking.");
            }
          },
        },
      ]
    );
  };

  const cancelRide = async (rideId) => {
    Alert.alert(
      "Cancel Ride",
      "Are you sure you want to cancel this ride?",
      [
        { text: "No", style: "cancel" },
        {
          text: "Yes",
          style: "destructive",
          onPress: async () => {
            try {
              await axios.put(`${BASE_URL}/ride/${rideId}/cancel`);
              Alert.alert("Success", "Ride cancelled successfully.");
              fetchMyRides();
            } catch (err) {
              Alert.alert("Error", "Could not cancel ride.");
            }
          },
        },
      ]
    );
  };

  const cancelBooking = async (bookingId) => {
    Alert.alert(
      "Cancel Booking",
      "Are you sure you want to cancel this booking?",
      [
        { text: "No", style: "cancel" },
        {
          text: "Yes",
          style: "destructive",
          onPress: async () => {
            try {
              await axios.put(`${BASE_URL}/booking/${bookingId}/cancel`);
              Alert.alert("Success", "Booking cancelled successfully.");
              fetchMyRides();
            } catch (err) {
              Alert.alert("Error", "Could not cancel booking.");
            }
          },
        },
      ]
    );
  };

  const getFilteredRides = () => {
    let rides = [...postedRides];
    const now = new Date();

    if (rideFilter !== "all") {
      rides = rides.filter((ride) => {
        const rideTime = new Date(ride.departure_time);

        if (rideFilter === "upcoming") {
          return rideTime > now && ride.status !== "cancelled";
        }

        if (rideFilter === "completed") {
          return rideTime < now && ride.status !== "cancelled";
        }

        if (rideFilter === "cancelled") {
          return ride.status === "cancelled";
        }

        return true;
      });
    }

    rides.sort((a, b) => {
      const aPending = Array.isArray(a.bookings)
        ? a.bookings.some((bk) => bk.status === "pending")
        : false;
      const bPending = Array.isArray(b.bookings)
        ? b.bookings.some((bk) => bk.status === "pending")
        : false;

      if (aPending !== bPending) {
        return aPending ? -1 : 1;
      }

      const timeA = new Date(a.departure_time);
      const timeB = new Date(b.departure_time);

      if (rideFilter === "upcoming") return timeA - timeB;
      if (rideFilter === "completed" || rideFilter === "cancelled") return timeB - timeA;

      const aIsUpcoming = timeA > now && a.status !== "cancelled";
      const bIsUpcoming = timeB > now && b.status !== "cancelled";

      if (aIsUpcoming === bIsUpcoming) {
        return aIsUpcoming ? timeA - timeB : timeB - timeA;
      }

      return aIsUpcoming ? -1 : 1;
    });

    return rides;
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "accepted":
      case "active":
        return Colors.success;
      case "pending":
        return "#f1c40f";
      case "rejected":
      case "cancelled":
        return Colors.error;
      case "completed":
        return Colors.blue;
      case "full":
        return "#8e44ad";
      default:
        return Colors.gray;
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case "active":
      case "accepted":
        return "checkmark-circle";
      case "completed":
        return "checkmark-done";
      case "cancelled":
      case "rejected":
        return "close-circle";
      case "pending":
        return "time";
      default:
        return "ellipse";
    }
  };

  const handleTabPress = (tab) => {
    Animated.sequence([
      Animated.timing(tabScaleAnim, {
        toValue: 0.95,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(tabScaleAnim, {
        toValue: 1,
        duration: 100,
        useNativeDriver: true,
      }),
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
    if (isToday) {
      dayText = "Today";
    } else if (isTomorrow) {
      dayText = "Tomorrow";
    } else {
      dayText = date.toLocaleDateString("en-US", {
        weekday: "short",
        month: "short",
        day: "numeric",
      });
    }

    const timeText = date.toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });

    return { dayText, timeText };
  };

  const getRequestedStatusText = (status) => {
    switch (status) {
      case "pending":
        return "Waiting for confirmation";
      case "accepted":
        return "Approved by driver";
      case "rejected":
        return "Request rejected";
      case "cancelled":
        return "Booking cancelled";
      default:
        return status;
    }
  };

  const renderPostedRideCard = (ride) => {
    const hasPendingBookings = Array.isArray(ride.bookings)
      ? ride.bookings.some((booking) => booking.status === "pending")
      : false;

    return (
      <View
        key={ride.id}
        style={[
          styles.card,
          targetRideId === ride.id && styles.highlightRideCard,
        ]}
      >
        <View style={styles.cardHeader}>
          <View style={styles.routeContainer}>
            <View style={styles.locationDot}>
              <View style={[styles.dot, { backgroundColor: Colors.success }]} />
              <View style={styles.line} />
              <View style={[styles.dot, { backgroundColor: Colors.secondary }]} />
            </View>

            <View style={styles.routeTextContainer}>
              <Text style={styles.routeOrigin} numberOfLines={1}>
                {ride.origin?.split(",")[0] || "Origin"}
              </Text>
              <Text style={styles.routeDestination} numberOfLines={1}>
                {ride.destination?.split(",")[0] || "Destination"}
              </Text>
            </View>
          </View>

          <View
            style={[
              styles.statusBadge,
              { backgroundColor: getStatusColor(ride.status) },
            ]}
          >
            <Ionicons
              name={getStatusIcon(ride.status)}
              size={12}
              color={Colors.white}
              style={styles.statusIcon}
            />
            <Text style={styles.statusText}>
              {ride.status?.charAt(0).toUpperCase() + ride.status?.slice(1)}
            </Text>
          </View>
        </View>

        <View style={styles.cardDetails}>
          <View style={styles.detailItem}>
            <Ionicons
              name="calendar-outline"
              size={16}
              color={Colors.gray}
            />
            <Text style={styles.detailText}>
              {formatDate(ride.departure_time).dayText}
            </Text>
            <Text style={styles.detailTextSecondary}>
              {formatDate(ride.departure_time).timeText}
            </Text>
          </View>

          <View style={styles.detailDivider} />

          <View style={styles.detailItem}>
            <Ionicons
              name="person-outline"
              size={16}
              color={Colors.gray}
            />
            <Text style={styles.detailText}>
              {ride.available_seats} seat{ride.available_seats > 1 ? "s" : ""}
            </Text>
          </View>

          <View style={styles.detailDivider} />

          <View style={styles.detailItem}>
            <Ionicons
              name="wallet-outline"
              size={16}
              color={Colors.gray}
            />
            <Text style={styles.detailTextPrice}>₹{ride.price_per_seat}</Text>
            <Text style={styles.detailTextSecondary}>/seat</Text>
          </View>
        </View>

        {ride.status !== "cancelled" && ride.status !== "completed" && (
          <View style={styles.driverActionWrapper}>
            <TouchableOpacity
              style={styles.startRideBtn}
              onPress={() => handleStartRide(ride)}
              activeOpacity={0.85}
            >
              <Text style={styles.startRideBtnText}>Start Ride</Text>
            </TouchableOpacity>

            <View style={styles.secondaryActionsRow}>
              <TouchableOpacity
                style={styles.secondaryBtn}
                onPress={() => handleEditRide(ride)}
                activeOpacity={0.85}
              >
                <Text style={styles.secondaryBtnText}>Edit Details</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.secondaryBtn}
                onPress={() => cancelRide(ride.id)}
                activeOpacity={0.85}
              >
                <Text style={styles.secondaryBtnText}>Cancel</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        {Array.isArray(ride.bookings) && ride.bookings.length > 0 && (
          <View style={styles.bookingsSection}>
            <View style={styles.bookingSectionHeader}>
              <Text style={styles.bookingsTitle}>
                Rider Requests ({ride.bookings.length})
              </Text>
              {hasPendingBookings && (
                <View style={styles.pendingChip}>
                  <Text style={styles.pendingChipText}>Action needed</Text>
                </View>
              )}
            </View>

            {ride.bookings.map((booking) => (
              <View
                key={booking.id}
                style={[
                  styles.bookingCard,
                  targetBookingId === booking.id && styles.highlightBookingCard,
                ]}
              >
                <View style={styles.bookingHeader}>
                  <View style={styles.bookingInfo}>
                    <View style={styles.avatarContainer}>
                      <Ionicons
                        name="person"
                        size={20}
                        color={Colors.primary}
                      />
                    </View>

                    <View style={{ flex: 1 }}>
                      <Text style={styles.bookingPhone}>
                        {booking.passenger_name || booking.passenger_phone || "Rider"}
                      </Text>
                      <Text style={styles.bookingSeats}>
                        {booking.seats_requested} seat
                        {booking.seats_requested > 1 ? "s" : ""}
                      </Text>
                    </View>
                  </View>

                  <View
                    style={[
                      styles.bookingStatusBadge,
                      {
                        backgroundColor:
                          getStatusColor(booking.status) + "20",
                      },
                    ]}
                  >
                    <Text
                      style={[
                        styles.bookingStatusText,
                        { color: getStatusColor(booking.status) },
                      ]}
                    >
                      {booking.status?.charAt(0).toUpperCase() +
                        booking.status?.slice(1)}
                    </Text>
                  </View>
                </View>

                {booking.status === "pending" && (
                  <View style={styles.actionRow}>
                    <TouchableOpacity
                      style={[styles.actionBtn, styles.acceptBtn]}
                      onPress={() => handleBookingAction(booking.id, "accept")}
                      activeOpacity={0.8}
                    >
                      <Ionicons
                        name="checkmark"
                        size={16}
                        color={Colors.white}
                      />
                      <Text style={styles.btnText}>Approve</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={[styles.actionBtn, styles.rejectBtn]}
                      onPress={() => handleBookingAction(booking.id, "reject")}
                      activeOpacity={0.8}
                    >
                      <Ionicons
                        name="close"
                        size={16}
                        color={Colors.white}
                      />
                      <Text style={styles.btnText}>Reject</Text>
                    </TouchableOpacity>
                  </View>
                )}
              </View>
            ))}
          </View>
        )}
      </View>
    );
  };

  const renderRequestedRideCard = (booking) => {
    const isAccepted = booking.status === "accepted";
    const isPending = booking.status === "pending";
    const isClosed = booking.status === "cancelled" || booking.status === "rejected";

    return (
      <View key={booking.id} style={styles.card}>
        <View style={styles.cardHeader}>
          <View style={styles.bookingIdContainer}>
            <Ionicons
              name="car-outline"
              size={20}
              color={Colors.primary}
            />
            <Text style={styles.bookingIdText}>
              Ride #{booking.ride_id}
            </Text>
          </View>

          <View
            style={[
              styles.statusBadge,
              { backgroundColor: getStatusColor(booking.status) },
            ]}
          >
            <Ionicons
              name={getStatusIcon(booking.status)}
              size={12}
              color={Colors.white}
              style={styles.statusIcon}
            />
            <Text style={styles.statusText}>
              {booking.status?.charAt(0).toUpperCase() + booking.status?.slice(1)}
            </Text>
          </View>
        </View>

        {(booking.origin || booking.destination) && (
          <View style={styles.requestRouteBlock}>
            <View style={styles.locationDot}>
              <View style={[styles.dot, { backgroundColor: Colors.success }]} />
              <View style={styles.line} />
              <View style={[styles.dot, { backgroundColor: Colors.secondary }]} />
            </View>

            <View style={styles.routeTextContainer}>
              <Text style={styles.routeOrigin} numberOfLines={1}>
                {booking.origin?.split(",")[0] || "Origin"}
              </Text>
              <Text style={styles.routeDestination} numberOfLines={1}>
                {booking.destination?.split(",")[0] || "Destination"}
              </Text>
            </View>
          </View>
        )}

        <View style={styles.requestDetails}>
          <View style={styles.detailItem}>
            <Ionicons
              name="time-outline"
              size={16}
              color={Colors.gray}
            />
            <Text style={styles.detailText}>
              {isPending ? "Requested" : "Status"}
            </Text>
            <Text style={styles.detailTextSecondary}>
              {isPending
                ? formatDate(booking.created_at).dayText
                : getRequestedStatusText(booking.status)}
            </Text>
          </View>

          <View style={styles.detailDivider} />

          <View style={styles.detailItem}>
            <Ionicons
              name="calendar-outline"
              size={16}
              color={Colors.gray}
            />
            <Text style={styles.detailText}>Travel Date</Text>
            <Text style={styles.detailTextSecondary}>
              {booking.departure_time
                ? formatDate(booking.departure_time).dayText
                : "-"}
            </Text>
          </View>
        </View>

        {isPending && (
          <View style={styles.waitingBox}>
            <Ionicons name="time-outline" size={16} color="#B45309" />
            <Text style={styles.waitingText}>Waiting for driver confirmation</Text>
          </View>
        )}

        {isAccepted && (
          <View style={styles.driverActionWrapper}>
            <TouchableOpacity
              style={styles.startRideBtn}
              onPress={() => showUpcomingFeature("Contact / ride action")}
              activeOpacity={0.85}
            >
              <Text style={styles.startRideBtnText}>Confirmed Ride</Text>
            </TouchableOpacity>

            <View style={styles.secondaryActionsRow}>
              <TouchableOpacity
                style={styles.secondaryBtn}
                onPress={() => showUpcomingFeature("Edit booking")}
                activeOpacity={0.85}
              >
                <Text style={styles.secondaryBtnText}>Edit Details</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.secondaryBtn}
                onPress={() => cancelBooking(booking.id)}
                activeOpacity={0.85}
              >
                <Text style={styles.secondaryBtnText}>Cancel</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        {!isClosed && !isAccepted && (
          <TouchableOpacity
            style={styles.cancelRideBtn}
            onPress={() => cancelBooking(booking.id)}
            activeOpacity={0.7}
          >
            <Ionicons
              name="trash-outline"
              size={16}
              color={Colors.error}
            />
            <Text style={styles.cancelBtnText}>Cancel Booking</Text>
          </TouchableOpacity>
        )}
      </View>
    );
  };

  if (loading) {
    return (
      <View style={styles.loader}>
        <ActivityIndicator size="large" color={Colors.primary} />
        <Text style={styles.loadingText}>Loading your rides...</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar backgroundColor={Colors.white} barStyle="dark-content" />

      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backBtn}
          onPress={() => navigation.goBack()}
        >
          <MaterialIcons
            name="arrow-back-ios"
            size={26}
            color={Colors.orange1}
          />
        </TouchableOpacity>

        <Text style={styles.headerTitle}>My Rides</Text>

        <TouchableOpacity onPress={onRefresh} style={styles.refreshBtn}>
          <Ionicons name="refresh" size={22} color={Colors.orange1} />
        </TouchableOpacity>
      </View>

      <View style={styles.tabContainer}>
        <TouchableOpacity
          style={[
            styles.tabButton,
            activeTab === "posted" && styles.activeTab,
          ]}
          onPress={() => handleTabPress("posted")}
          activeOpacity={0.8}
        >
          <Ionicons
            name="car-sport-outline"
            size={18}
            color={activeTab === "posted" ? Colors.white : Colors.gray}
            style={styles.tabIcon}
          />
          <Text
            style={[
              styles.tabText,
              activeTab === "posted" && styles.activeTabText,
            ]}
          >
            Posted
          </Text>
          <View
            style={[
              styles.tabBadge,
              activeTab === "posted" && styles.activeTabBadge,
            ]}
          >
            <Text
              style={[
                styles.tabBadgeText,
                activeTab === "posted" && styles.activeTabBadgeText,
              ]}
            >
              {postedRides.length}
            </Text>
          </View>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.tabButton,
            activeTab === "requested" && styles.activeTab,
          ]}
          onPress={() => handleTabPress("requested")}
          activeOpacity={0.8}
        >
          <Ionicons
            name="person-outline"
            size={18}
            color={activeTab === "requested" ? Colors.white : Colors.gray}
            style={styles.tabIcon}
          />
          <Text
            style={[
              styles.tabText,
              activeTab === "requested" && styles.activeTabText,
            ]}
          >
            Requested
          </Text>
          <View
            style={[
              styles.tabBadge,
              activeTab === "requested" && styles.activeTabBadge,
            ]}
          >
            <Text
              style={[
                styles.tabBadgeText,
                activeTab === "requested" && styles.activeTabBadgeText,
              ]}
            >
              {requestedRides.length}
            </Text>
          </View>
        </TouchableOpacity>
      </View>

      {activeTab === "posted" && (
        <View style={styles.stickyFilterContainer}>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.filterRow}
          >
            {[
              { key: "all", label: "All", icon: "apps" },
              { key: "upcoming", label: "Upcoming", icon: "time" },
              { key: "completed", label: "Completed", icon: "checkmark-circle" },
              { key: "cancelled", label: "Cancelled", icon: "close-circle" },
            ].map((filter) => (
              <TouchableOpacity
                key={filter.key}
                style={[
                  styles.filterChip,
                  rideFilter === filter.key && styles.activeChip,
                ]}
                onPress={() => setRideFilter(filter.key)}
                activeOpacity={0.7}
              >
                <Ionicons
                  name={filter.icon}
                  size={14}
                  color={rideFilter === filter.key ? Colors.white : Colors.gray}
                  style={styles.filterIcon}
                />
                <Text
                  style={[
                    styles.chipText,
                    rideFilter === filter.key && styles.activeChipText,
                  ]}
                >
                  {filter.label}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      )}

      <ScrollView
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
      >
        {activeTab === "posted" && (
          <>
            {getFilteredRides().length === 0 ? (
              <View style={styles.emptyState}>
                <Ionicons name="car-sport-outline" size={64} color={Colors.gray} />
                <Text style={styles.emptyTitle}>No rides found</Text>
                <Text style={styles.emptySubtitle}>
                  {rideFilter !== "all"
                    ? `You don't have any ${rideFilter} rides`
                    : "Post a ride to get started"}
                </Text>
              </View>
            ) : (
              getFilteredRides().map(renderPostedRideCard)
            )}
          </>
        )}

        {activeTab === "requested" && (
          <>
            {requestedRides.length === 0 ? (
              <View style={styles.emptyState}>
                <Ionicons
                  name="document-text-outline"
                  size={64}
                  color={Colors.gray}
                />
                <Text style={styles.emptyTitle}>No requests yet</Text>
                <Text style={styles.emptySubtitle}>
                  Your booking requests will appear here
                </Text>
              </View>
            ) : (
              requestedRides.map(renderRequestedRideCard)
            )}
          </>
        )}

        <View style={styles.bottomSpacer} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.white,
  },

  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 0.5,
    borderBottomColor: "#E5E7EB",
  },
  backBtn: {
    width: 44,
    height: 44,
    justifyContent: "center",
  },
  headerTitle: {
    ...Typography.h2,
    fontSize: 26,
    fontWeight: "700",
    color: Colors.primary,
    flex: 1,
    textAlign: "center",
  },
  refreshBtn: {
    width: 44,
    height: 44,
    justifyContent: "center",
    alignItems: "center",
  },

  tabContainer: {
    flexDirection: "row",
    backgroundColor: Colors.white,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 0.5,
    borderBottomColor: "#E5E7EB",
  },
  tabButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 10,
    borderRadius: 12,
    backgroundColor: "#F9FAFB",
    marginHorizontal: 4,
  },
  activeTab: {
    backgroundColor: Colors.primary,
  },
  tabIcon: {
    marginRight: 6,
  },
  tabText: {
    ...Typography.button,
    color: Colors.gray,
    fontSize: 14,
    fontWeight: "600",
  },
  activeTabText: {
    color: Colors.white,
  },
  tabBadge: {
    backgroundColor: Colors.gray,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
    marginLeft: 6,
  },
  activeTabBadge: {
    backgroundColor: "rgba(255,255,255,0.3)",
  },
  tabBadgeText: {
    fontSize: 12,
    fontWeight: "700",
    color: Colors.white,
  },
  activeTabBadgeText: {
    color: Colors.white,
  },

  list: {
    padding: 16,
    paddingBottom: 40,
  },

  stickyFilterContainer: {
    backgroundColor: Colors.white,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 0.5,
    borderBottomColor: "#E5E7EB",
  },
  filterRow: {
    flexDirection: "row",
    paddingVertical: 4,
  },
  filterChip: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: "#F9FAFB",
    marginRight: 8,
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  activeChip: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  filterIcon: {
    marginRight: 6,
  },
  chipText: {
    ...Typography.label,
    fontSize: 13,
    fontWeight: "600",
    color: Colors.gray,
  },
  activeChipText: {
    color: Colors.white,
  },

  card: {
    padding: 14,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    backgroundColor: "#F9FAFB",
    marginBottom: 12,
  },
  highlightRideCard: {
    borderWidth: 2,
    borderColor: Colors.primary,
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 12,
  },
  routeContainer: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
  },
  requestRouteBlock: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
    backgroundColor: Colors.white,
    borderRadius: 12,
    padding: 12,
  },
  locationDot: {
    width: 20,
    alignItems: "center",
    marginRight: 12,
  },
  dot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  line: {
    width: 2,
    height: 20,
    backgroundColor: "#E5E7EB",
  },
  routeTextContainer: {
    flex: 1,
  },
  routeOrigin: {
    fontSize: 15,
    fontWeight: "700",
    color: Colors.dark,
    marginBottom: 4,
    fontFamily: FontFamily.secondary.semiBold,
  },
  routeDestination: {
    fontSize: 14,
    color: Colors.gray,
    fontFamily: FontFamily.secondary.regular,
  },

  statusBadge: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 20,
  },
  statusIcon: {
    marginRight: 4,
  },
  statusText: {
    color: Colors.white,
    fontSize: 12,
    fontWeight: "600",
  },

  cardDetails: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.white,
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
  },
  requestDetails: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.white,
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
  },
  detailItem: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    flexWrap: "wrap",
  },
  detailText: {
    fontSize: 13,
    fontWeight: "600",
    color: Colors.dark,
    marginLeft: 6,
    fontFamily: FontFamily.secondary.medium,
  },
  detailTextSecondary: {
    fontSize: 12,
    color: Colors.gray,
    marginLeft: 4,
    fontFamily: FontFamily.secondary.regular,
  },
  detailTextPrice: {
    fontSize: 14,
    fontWeight: "700",
    color: Colors.primary,
    marginLeft: 4,
    fontFamily: FontFamily.secondary.bold,
  },
  detailDivider: {
    width: 1,
    height: 24,
    backgroundColor: Colors.gray,
    opacity: 0.3,
    marginHorizontal: 8,
  },

  driverActionWrapper: {
    marginBottom: 8,
  },
  startRideBtn: {
    backgroundColor: Colors.primary,
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 10,
  },
  startRideBtnText: {
    color: Colors.white,
    fontSize: 15,
    fontWeight: "700",
    fontFamily: FontFamily.secondary.semiBold,
  },
  secondaryActionsRow: {
    flexDirection: "row",
    gap: 10,
  },
  secondaryBtn: {
    flex: 1,
    borderWidth: 1,
    borderColor: "#D1D5DB",
    backgroundColor: Colors.white,
    borderRadius: 14,
    paddingVertical: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  secondaryBtnText: {
    color: Colors.dark,
    fontSize: 14,
    fontWeight: "600",
    fontFamily: FontFamily.secondary.medium,
  },

  bookingsSection: {
    borderTopWidth: 1,
    borderTopColor: "#E5E7EB",
    paddingTop: 12,
    marginTop: 6,
  },
  bookingSectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },
  bookingsTitle: {
    fontSize: 14,
    fontWeight: "700",
    color: Colors.dark,
    fontFamily: FontFamily.secondary.semiBold,
  },
  pendingChip: {
    backgroundColor: "#FEF3C7",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  pendingChipText: {
    color: "#92400E",
    fontSize: 11,
    fontWeight: "700",
  },
  bookingCard: {
    backgroundColor: Colors.white,
    borderRadius: 12,
    padding: 12,
    marginBottom: 8,
  },
  highlightBookingCard: {
    borderWidth: 2,
    borderColor: Colors.primary,
    backgroundColor: "#FFF7ED",
  },
  bookingHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  bookingInfo: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  avatarContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#F9FAFB",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 10,
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  bookingPhone: {
    fontSize: 15,
    fontWeight: "600",
    color: Colors.dark,
    fontFamily: FontFamily.secondary.semiBold,
  },
  bookingSeats: {
    fontSize: 12,
    color: Colors.gray,
    fontFamily: FontFamily.secondary.regular,
  },
  bookingStatusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  bookingStatusText: {
    fontSize: 12,
    fontWeight: "600",
  },

  actionRow: {
    flexDirection: "row",
    marginTop: 12,
  },
  actionBtn: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 10,
    borderRadius: 10,
    marginHorizontal: 4,
  },
  acceptBtn: {
    backgroundColor: Colors.success,
  },
  rejectBtn: {
    backgroundColor: Colors.error,
  },
  btnText: {
    color: Colors.white,
    fontWeight: "600",
    marginLeft: 6,
    fontSize: 14,
  },

  waitingBox: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFBEB",
    borderWidth: 1,
    borderColor: "#FDE68A",
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 12,
    marginBottom: 10,
  },
  waitingText: {
    marginLeft: 8,
    color: "#92400E",
    fontSize: 13,
    fontWeight: "600",
  },

  cancelRideBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 10,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: Colors.error,
    marginTop: 8,
  },
  cancelBtnText: {
    color: Colors.error,
    fontWeight: "600",
    marginLeft: 6,
    fontSize: 14,
  },

  bookingIdContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  bookingIdText: {
    fontSize: 15,
    fontWeight: "600",
    color: Colors.dark,
    marginLeft: 8,
    fontFamily: FontFamily.secondary.semiBold,
  },

  emptyState: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 60,
    paddingHorizontal: 20,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: Colors.primary,
    marginTop: 16,
    fontFamily: FontFamily.secondary.bold,
  },
  emptySubtitle: {
    fontSize: 14,
    color: Colors.gray,
    marginTop: 8,
    textAlign: "center",
    fontFamily: FontFamily.secondary.regular,
  },

  loader: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: Colors.white,
  },
  loadingText: {
    fontSize: 14,
    color: Colors.gray,
    marginTop: 12,
    fontFamily: FontFamily.secondary.regular,
  },

  bottomSpacer: {
    height: 30,
  },
});