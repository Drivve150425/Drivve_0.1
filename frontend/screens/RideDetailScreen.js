import React, { useMemo, useRef, useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Platform,
  StatusBar,
  Image,
  Dimensions,
  Animated,
  PanResponder,
} from 'react-native';
import MapView, { Marker, Polyline, PROVIDER_GOOGLE } from 'react-native-maps';
import { Ionicons } from '@expo/vector-icons';
import LottieView from "lottie-react-native";
import { Colors } from '../constants/Colors';
import { useAuth } from '../context/AuthContext';
import { API_BASE_URL } from '../config/config_ip';
import CustomAlert from '../components/CustomAlert';

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

function extractPreferenceBadges(ride) {
  const prefs =
    ride?.preferences ||
    ride?.ridePreferences ||
    ride?.matchingPreferences ||
    {};

  const badges = [];

  Object.entries(prefs || {}).forEach(([key, value]) => {
    if (value === true) {
      badges.push(
        key.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())
      );
      return;
    }

    if (typeof value === 'string' && value.trim()) {
      const val = value.trim();

      if (key === 'smoking_policy' && val.toLowerCase().includes('no')) {
        badges.push('No Smoking');
      } else if (
        key === 'same_gender_after_9pm' &&
        ['true', 'yes'].includes(val.toLowerCase())
      ) {
        badges.push('Same Gender Night');
      } else if (
        key === 'verified_profiles_only' &&
        ['true', 'yes'].includes(val.toLowerCase())
      ) {
        badges.push('Verified Only');
      } else {
        badges.push(val);
      }
    }
  });

  return [...new Set(badges)].slice(0, 4);
}

export default function RideDetailScreen({ navigation, route }) {
  const { user, isAuthenticated } = useAuth();
  const { ride, searchData } = route.params || {};

  const [seatsRequested, setSeatsRequested] = useState(1);
  const [requestLoading, setRequestLoading] = useState(false);
  const [drawerExpanded, setDrawerExpanded] = useState(true);
  const animatedDrawer = useRef(new Animated.Value(1)).current;
  const mapRef = useRef(null);

  // Custom Alert states
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
        { text: 'Login', onPress: () => {
          setAlertVisible(false);
          onConfirm();
        }, style: 'destructive' }
      ]
    });
    setAlertVisible(true);
  };

  useEffect(() => {
    if (!isAuthenticated) {
      showConfirmationAlert(
        'Login Required',
        'Please login to book rides or chat with drivers.',
        () => navigation.navigate('Login')
      );
      navigation.goBack();
    }
  }, [isAuthenticated, navigation]);

  const profilePhotoUrl = buildImageUrl(
    ride?.profilePicture || ride?.profilepicture
  );
  const avatarText = getDriverInitials(ride?.driverName || 'Driver');
  const preferenceBadges = extractPreferenceBadges(ride);

  // Driver route points
  const driverStart = useMemo(() => {
    const coords = ride?.route_coordinates || ride?.routeCoordinates;
    if (Array.isArray(coords) && coords.length > 0) {
      const first = coords[0];
      if (Array.isArray(first) && first.length === 2) {
        return { latitude: first[1], longitude: first[0] };
      }
    }
    return parseSuggestedPoint(ride?.origin_coords || ride?.from_coords);
  }, [ride]);

  const driverEnd = useMemo(() => {
    const coords = ride?.route_coordinates || ride?.routeCoordinates;
    if (Array.isArray(coords) && coords.length > 0) {
      const last = coords[coords.length - 1];
      if (Array.isArray(last) && last.length === 2) {
        return { latitude: last[1], longitude: last[0] };
      }
    }
    return parseSuggestedPoint(ride?.destination_coords || ride?.to_coords);
  }, [ride]);

  // Intersection points from search-rides response
  const intersectionPickup = useMemo(
    () => parseSuggestedPoint(ride?.suggestedPickup),
    [ride]
  );
  const intersectionDrop = useMemo(
    () => parseSuggestedPoint(ride?.suggestedDrop),
    [ride]
  );

  // Rider's original pickup/drop from searchData
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
    const fullRoute = parseRouteCoordinates(
      ride?.route_coordinates || ride?.routeCoordinates
    );
    if (fullRoute.length >= 2) return fullRoute;
    if (intersectionPickup && intersectionDrop) return [intersectionPickup, intersectionDrop];
    return [];
  }, [ride, intersectionPickup, intersectionDrop]);

  // Walking route polylines (yellow)
  const walkToPickupPath = useMemo(() => {
    if (userPickup && intersectionPickup) return [userPickup, intersectionPickup];
    return [];
  }, [userPickup, intersectionPickup]);

  const walkFromDropPath = useMemo(() => {
    if (userDrop && intersectionDrop) return [intersectionDrop, userDrop];
    return [];
  }, [userDrop, intersectionDrop]);

  // All visible points for camera fitting
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

  // Fit map to show all markers when they change
  useEffect(() => {
    if (mapRef.current && allMarkerCoords.length >= 2) {
      setTimeout(() => {
        try {
          mapRef.current.fitToCoordinates(allMarkerCoords, {
            edgePadding: { top: 60, right: 40, bottom: 40, left: 40 },
            animated: true,
          });
        } catch (e) {
          console.log('fitToCoordinates error:', e);
        }
      }, 300);
    }
  }, [allMarkerCoords]);

  const vehicleName =
    [ride?.vehicle?.make, ride?.vehicle?.model].filter(Boolean).join(' ') ||
    'Vehicle details unavailable';

  const totalPrice = Number(ride?.price || 0) * seatsRequested;

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

  // PanResponder for swipe up/down on drawer handle
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

  const handleRequestJoin = async () => {
    if (!user?.phone_number) {
      showCustomAlert('Login Required', 'Please log in to request a ride.', 'warning');
      return;
    }

    setRequestLoading(true);
    try {
      const payload = {
        ride_id: ride.id,
        passenger_phone: user.phone_number,
        seats_requested: seatsRequested,
      };

      // Include rider's original coords so backend can store intersection points
      if (searchData?.fromCoords && Array.isArray(searchData.fromCoords)) {
        payload.from_coords = searchData.fromCoords;
      }
      if (searchData?.toCoords && Array.isArray(searchData.toCoords)) {
        payload.to_coords = searchData.toCoords;
      }

      const response = await fetch(`${API_BASE_URL}/ride-bookings`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
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
        console.error('Booking error response:', raw);
        throw new Error(data.detail || data.message || `Server error (${response.status})`);
      }

      showCustomAlert('Success', data.message || 'Ride request sent successfully', 'success');
      setTimeout(() => navigation.goBack(), 1500);
    } catch (error) {
      showCustomAlert('Error', error.message || 'Failed to send request', 'error');
    } finally {
      setRequestLoading(false);
    }
  };

  const viewDriverProfile = () => {
    if (ride?.driverUserId || ride?.phoneNumber) {
      navigation.navigate('ViewProfileScreen', {
        userId: ride.driverUserId || null,
        phoneNumber: ride.phoneNumber || null,
        driverName: ride.driverName || 'Driver',
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
      console.error('Failed to create conversation:', data);
      return null;
    } catch (error) {
      console.error('getOrCreateConversation error:', error);
      return null;
    }
  };

  const startChat = async () => {
    const driverPhone = ride?.phoneNumber || ride?.driverPhone || ride?.driverUserId;
    if (driverPhone) {
      const conversationId = await getOrCreateConversation(driverPhone, ride.id);
      if (conversationId) {
        navigation.navigate('ChatScreen', {
          receiverPhone: driverPhone,
          conversationId,
          user: {
            name: ride.driverName || 'Driver',
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
if (requestLoading) {
  return (
    <View style={styles.loaderContainer}>
      <LottieView
        source={require("../assets/loading.json")}
        autoPlay
        loop
        style={{ width: 300, height: 300 }}
      />
      {/* <Text style={styles.loaderText}>Booking your ride...</Text> */}
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

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />

      <Animated.View style={[styles.mapContainer, { height: mapHeight }]}>
        <MapView
          ref={mapRef}
          provider={PROVIDER_GOOGLE}
          style={styles.map}
          initialRegion={{
            latitude: intersectionPickup?.latitude || intersectionDrop?.latitude || driverStart?.latitude || 28.6139,
            longitude: intersectionPickup?.longitude || intersectionDrop?.longitude || driverStart?.longitude || 77.2090,
            latitudeDelta: 0.12,
            longitudeDelta: 0.12,
          }}
          showsUserLocation
          showsMyLocationButton
        >
          {/* Driver route (blue) */}
          {routePath.length >= 2 ? (
            <Polyline
              coordinates={routePath}
              strokeColor="#2457A6"
              strokeWidth={5}
              lineCap="round"
              lineJoin="round"
            />
          ) : null}

          {/* Driver start point */}
          {driverStart ? (
            <Marker coordinate={driverStart} anchor={{ x: 0.5, y: 1 }}>
              <View style={styles.markerWrapper}>
                <View style={[styles.pinBubble, { backgroundColor: '#16A34A' }]}>
                  <Text style={styles.pinIcon}>S</Text>
                </View>
                <View style={[styles.pinPointer, { borderTopColor: '#16A34A' }]} />
              </View>
            </Marker>
          ) : null}

          {/* Driver end point */}
          {driverEnd ? (
            <Marker coordinate={driverEnd} anchor={{ x: 0.5, y: 1 }}>
              <View style={styles.markerWrapper}>
                <View style={[styles.pinBubble, { backgroundColor: '#DC2626' }]}>
                  <Text style={styles.pinIcon}>E</Text>
                </View>
                <View style={[styles.pinPointer, { borderTopColor: '#DC2626' }]} />
              </View>
            </Marker>
          ) : null}

          {/* User's original pickup point */}
          {userPickup ? (
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
          ) : null}

          {/* User's original drop point */}
          {userDrop ? (
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
          ) : null}

          {/* Intersection pickup point */}
          {intersectionPickup ? (
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
          ) : null}

          {/* Intersection drop point */}
          {intersectionDrop ? (
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
          ) : null}

          {/* Walking route to pickup (yellow dashed) */}
          {walkToPickupPath.length >= 2 ? (
            <Polyline
              coordinates={walkToPickupPath}
              strokeColor="#FACC15"
              strokeWidth={4}
              lineDashPattern={[8, 6]}
              lineCap="round"
              lineJoin="round"
            />
          ) : null}

          {/* Walking route from drop (yellow dashed) */}
          {walkFromDropPath.length >= 2 ? (
            <Polyline
              coordinates={walkFromDropPath}
              strokeColor="#FACC15"
              strokeWidth={4}
              lineDashPattern={[8, 6]}
              lineCap="round"
              lineJoin="round"
            />
          ) : null}
        </MapView>

        <TouchableOpacity
          style={styles.mapBackButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="chevron-back" size={26} color={Colors.secondary} />
        </TouchableOpacity>
      </Animated.View>

      <Animated.View style={[styles.drawer, { height: drawerHeight }]}>
        <View
          style={styles.handleWrap}
          {...panResponder.panHandlers}
        >
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
                  {ride.driverName || 'Driver'}
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
                    <View style={styles.driverAvatar}>
                      {profilePhotoUrl ? (
                        <Image source={{ uri: profilePhotoUrl }} style={styles.avatarImg} />
                      ) : (
                        <Text style={styles.avatarText}>{avatarText}</Text>
                      )}
                    </View>

                    <View style={styles.driverMeta}>
                      <View style={styles.driverNameRow}>
                        <Text style={styles.driverName}>{ride.driverName || 'Driver'}</Text>
                        {ride.profileCompleted ? (
                          <View style={styles.verifiedBadge}>
                            <Ionicons
                              name="checkmark-circle"
                              size={12}
                              color="#2457A6"
                            />
                            <Text style={styles.verifiedBadgeText}>Verified</Text>
                          </View>
                        ) : null}
                      </View>

                      <View style={styles.ratingRow}>
                        <Ionicons name="star" size={13} color="#F59E0B" />
                        <Text style={styles.ratingText}>{ride.rating ?? 4.5}</Text>
                        <Text style={styles.tripCountText}></Text>
                      </View>
                    </View>
                  </View>

                  <TouchableOpacity
                    style={styles.chatButtonCircle}
                    onPress={startChat}
                  >
                    <Ionicons
                      name="chatbubble-outline"
                      size={20}
                      color="#2457A6"
                    />
                  </TouchableOpacity>
                </View>

                <Text style={styles.driverBio}>
                  Friendly driver, love meeting new people!
                </Text>

                <TouchableOpacity
                  style={styles.profileOutlineBtn}
                  onPress={viewDriverProfile}
                >
                  <Text style={styles.profileOutlineBtnText}>
                    View Full Profile
                  </Text>
                </TouchableOpacity>
              </View>

              <View style={styles.cardSection}>
                <Text style={styles.sectionTitle}>Trip Details</Text>

                <View style={styles.tripTimelineWrap}>
                  <View style={styles.timelineRail}>
                    <View
                      style={[styles.timelineDot, { backgroundColor: '#2457A6' }]}
                    />
                    <View style={styles.timelineLine} />
                    <View
                      style={[styles.timelineDot, { backgroundColor: '#FF7A00' }]}
                    />
                  </View>

                  <View style={styles.timelineContent}>
                    <View style={styles.timelineItem}>
                      <Text style={styles.timelineLabel}>Pickup</Text>
                      <Text style={styles.timelinePlace}>
                        {ride.pickupLabel || ride.from || 'Pickup point'}
                      </Text>
                      <View style={styles.timelineMetaRow}>
                        <Ionicons
                          name="time-outline"
                          size={13}
                          color={Colors.gray}
                        />
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
                    <Ionicons
                      name="car-sport-outline"
                      size={18}
                      color="#2457A6"
                    />
                  </View>

                  <View style={styles.vehicleMeta}>
                    <Text style={styles.vehicleTitle}>{vehicleName}</Text>
                    <Text style={styles.vehicleSub}>
                      {ride.vehicle?.color || 'Sedan'}
                    </Text>
                  </View>
                </View>

                <View style={styles.tagRow}>
                  <View style={styles.featureTag}>
                    <Text style={styles.featureTagText}>AC</Text>
                  </View>
                  <View style={styles.featureTag}>
                    <Text style={styles.featureTagText}>Music</Text>
                  </View>
                  <View style={styles.featureTag}>
                    <Text style={styles.featureTagText}>Luggage Space</Text>
                  </View>
                </View>
              </View>

              <View style={styles.cardSection}>
                <Text style={styles.sectionTitle}>Ride Preferences</Text>
                <View style={styles.tagRow}>
                  {preferenceBadges.length > 0 ? (
                    preferenceBadges.map((badge) => (
                      <View key={badge} style={styles.preferenceTag}>
                        <Text style={styles.preferenceTagText}>{badge}</Text>
                      </View>
                    ))
                  ) : (
                    <Text style={styles.emptyText}>
                      No extra ride preferences added
                    </Text>
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
                    <Text style={styles.noticeBold}>
                      Cost-share contribution:
                    </Text>{' '}
                    This is not a commercial fare. You're sharing the travel costs
                    with the driver.
                  </Text>
                </View>
              </View>

              <View style={styles.cardSection}>
                <Text style={styles.sectionTitle}>Select Seats</Text>
                <View style={styles.seatSelectorRow}>
                  <TouchableOpacity
                    style={styles.seatActionBtn}
                    onPress={() =>
                      setSeatsRequested(Math.max(1, seatsRequested - 1))
                    }
                    disabled={seatsRequested === 1 || requestLoading}
                  >
                    <Ionicons name="remove" size={20} color={Colors.gray} />
                  </TouchableOpacity>

                  <View style={styles.seatCountWrap}>
                    <Text style={styles.seatCountText}>{seatsRequested}</Text>
                    <Text style={styles.seatAvailableText}>
                      / {ride.seatsAvailable} available
                    </Text>
                  </View>

                  <TouchableOpacity
                    style={styles.seatActionBtn}
                    onPress={() =>
                      setSeatsRequested(
                        Math.min(ride.seatsAvailable || 1, seatsRequested + 1)
                      )
                    }
                    disabled={seatsRequested === ride.seatsAvailable || requestLoading}
                  >
                    <Ionicons name="add" size={20} color="#2457A6" />
                  </TouchableOpacity>
                </View>
              </View>

              <View style={styles.safetyCard}>
                <View style={styles.simpleInfoLeft}>
                  <Ionicons
                    name="shield-checkmark-outline"
                    size={18}
                    color="#2457A6"
                  />
                  <View>
                    <Text style={styles.safetyTitle}>Safety First</Text>
                    <Text style={styles.safetySub}>
                      Live GPS tracking & 24/7 support
                    </Text>
                  </View>
                </View>
              </View>

              <View style={{ height: 110 }} />
            </ScrollView>

            <View style={styles.bottomBar}>
              <View>
                <Text style={styles.bottomCaption}>
                  Total for {seatsRequested} seat(s)
                </Text>
                <Text style={styles.bottomTotal}>₹{totalPrice}</Text>
              </View>

 <TouchableOpacity
  style={[
    styles.bookNowBtn,
    requestLoading && styles.bookNowBtnDisabled,
  ]}
  onPress={handleRequestJoin}
  disabled={requestLoading}
>
  <Text style={styles.bookNowText}>Book Now</Text>
</TouchableOpacity>
            </View>
          </>
        )}
      </Animated.View>

      {/* Custom Alert */}
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
  container: {
    flex: 1,
    backgroundColor: '#F4F5F7',
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  errorText: {
    fontSize: 18,
    color: Colors.gray,
    marginBottom: 16,
    textAlign: 'center',
  },
  fallbackBtn: {
    backgroundColor: Colors.primary,
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 12,
  },
  fallbackBtnText: {
    color: 'white',
    fontWeight: '700',
  },
  mapContainer: {
    width: '100%',
    overflow: 'hidden',
    backgroundColor: '#E8EEF7',
  },
  map: {
    flex: 1,
    backgroundColor: '#E8EEF7',
  },
  mapBackButton: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 54 : 22,
    left: 14,
    width: 42,
    height: 42,
    borderRadius: 25,
    backgroundColor: 'rgba(255,255,255,0.96)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  markerWrapper: {
    alignItems: 'center',
  },
  pinBubble: {
    width: 28,
    height: 28,
    borderRadius: 14,
    borderWidth: 3,
    borderColor: 'white',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  pinPointer: {
    width: 0,
    height: 0,
    backgroundColor: 'transparent',
    borderStyle: 'solid',
    borderLeftWidth: 7,
    borderRightWidth: 7,
    borderTopWidth: 10,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    marginTop: -2,
  },
  pinIcon: {
    fontSize: 11,
    fontWeight: '800',
    color: 'white',
    textAlign: 'center',
    lineHeight: 18,
  },
  pinLabelBubble: {
    backgroundColor: 'rgba(0,0,0,0.75)',
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 3,
    marginTop: 4,
  },
  pinLabelText: {
    color: 'white',
    fontSize: 10,
    fontWeight: '700',
  },
  pinLabelBubbleYellow: {
    backgroundColor: 'rgba(113, 63, 18, 0.9)',
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 3,
    marginTop: 4,
  },
  pinLabelTextYellow: {
    color: '#FACC15',
    fontSize: 10,
    fontWeight: '700',
  },
  drawer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#F4F5F7',
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    overflow: 'hidden',
  },
  handleWrap: {
    alignItems: 'center',
    paddingTop: 10,
    paddingBottom: 8,
    backgroundColor: '#F4F5F7',
  },
  handleHitArea: {
    paddingHorizontal: 40,
    paddingVertical: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  handleBar: {
    width: 64,
    height: 6,
    borderRadius: 99,
    backgroundColor: '#CDD2D8',
  },
  collapsedSummary: {
    paddingHorizontal: 16,
    paddingTop: 4,
    paddingBottom: 12,
  },
  collapsedTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 12,
  },
  collapsedDriver: {
    fontSize: 16,
    fontWeight: '800',
    color: Colors.dark,
  },
  collapsedSub: {
    marginTop: 2,
    fontSize: 12,
    color: Colors.gray,
    fontWeight: '600',
  },
  collapsedPriceWrap: {
    alignItems: 'flex-end',
  },
  collapsedPrice: {
    fontSize: 18,
    fontWeight: '900',
    color: Colors.dark,
  },
  collapsedPerSeat: {
    fontSize: 10,
    color: Colors.gray,
    fontWeight: '600',
  },
  drawerScroll: {
    flex: 1,
  },
  drawerContent: {
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  driverCard: {
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 16,
    marginBottom: 14,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  driverTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  driverLeftWrap: {
    flexDirection: 'row',
    flex: 1,
    paddingRight: 10,
  },
  driverAvatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#E5E7EB',
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  avatarImg: {
    width: 56,
    height: 56,
  },
  avatarText: {
    fontSize: 15,
    fontWeight: '800',
    color: Colors.gray,
  },
  driverMeta: {
    flex: 1,
  },
  driverNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 6,
  },
  driverName: {
    fontSize: 17,
    fontWeight: '800',
    color: Colors.dark,
  },
  verifiedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  verifiedBadgeText: {
    fontSize: 11,
    color: '#2457A6',
    fontWeight: '700',
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 6,
  },
  ratingText: {
    fontSize: 13,
    color: Colors.dark,
    fontWeight: '700',
  },
  tripCountText: {
    fontSize: 12,
    color: Colors.gray,
    fontWeight: '600',
  },
  chatButtonCircle: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: '#EAF1FF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  driverBio: {
    marginTop: 12,
    fontSize: 14,
    lineHeight: 20,
    color: Colors.gray,
  },
  profileOutlineBtn: {
    marginTop: 14,
    borderWidth: 1,
    borderColor: '#2457A6',
    borderRadius: 16,
    paddingVertical: 12,
    alignItems: 'center',
  },
  profileOutlineBtnText: {
    color: '#2457A6',
    fontWeight: '700',
    fontSize: 14,
  },
  cardSection: {
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 16,
    marginBottom: 14,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: Colors.dark,
    marginBottom: 14,
  },
  tripTimelineWrap: {
    flexDirection: 'row',
  },
  timelineRail: {
    width: 18,
    alignItems: 'center',
    marginTop: 4,
  },
  timelineDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  timelineLine: {
    width: 2,
    flex: 1,
    backgroundColor: '#D8DCE3',
    marginVertical: 6,
  },
  timelineContent: {
    flex: 1,
    paddingLeft: 8,
  },
  timelineItem: {
    marginBottom: 14,
  },
  timelineLabel: {
    fontSize: 12,
    color: Colors.gray,
    fontWeight: '700',
  },
  timelinePlace: {
    fontSize: 15,
    color: Colors.dark,
    fontWeight: '700',
    marginTop: 4,
  },
  timelineMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 6,
  },
  timelineMetaText: {
    fontSize: 12,
    color: Colors.gray,
    fontWeight: '600',
  },
  vehicleHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  vehicleIconCircle: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: '#EAF1FF',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  vehicleMeta: {
    flex: 1,
  },
  vehicleTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: Colors.dark,
  },
  vehicleSub: {
    marginTop: 3,
    fontSize: 12,
    color: Colors.gray,
    fontWeight: '600',
  },
  tagRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 14,
  },
  featureTag: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 999,
    backgroundColor: '#F4EFE8',
  },
  featureTagText: {
    fontSize: 12,
    color: Colors.dark,
    fontWeight: '600',
  },
  preferenceTag: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 999,
    backgroundColor: '#FFF3E8',
  },
  preferenceTagText: {
    fontSize: 12,
    color: '#C65D00',
    fontWeight: '700',
  },
  emptyText: {
    fontSize: 13,
    color: Colors.gray,
    fontWeight: '600',
  },
  priceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  priceLabel: {
    fontSize: 14,
    color: Colors.gray,
    fontWeight: '500',
  },
  priceValue: {
    fontSize: 14,
    color: Colors.dark,
    fontWeight: '700',
  },
  priceDivider: {
    height: 1,
    backgroundColor: '#ECEEF2',
    marginVertical: 8,
  },
  totalLabel: {
    fontSize: 15,
    color: Colors.dark,
    fontWeight: '800',
  },
  totalValue: {
    fontSize: 15,
    color: '#2457A6',
    fontWeight: '800',
  },
  noticeBox: {
    marginTop: 12,
    backgroundColor: '#FFF2E9',
    borderRadius: 14,
    padding: 12,
  },
  noticeText: {
    fontSize: 12.5,
    color: Colors.dark,
    lineHeight: 18,
  },
  noticeBold: {
    fontWeight: '800',
  },
  seatSelectorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FAFAFB',
    borderRadius: 18,
    padding: 14,
  },
  seatActionBtn: {
    width: 38,
    height: 38,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#D6DDE7',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'white',
  },
  seatCountWrap: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  seatCountText: {
    fontSize: 28,
    fontWeight: '900',
    color: Colors.dark,
  },
  seatAvailableText: {
    fontSize: 13,
    color: Colors.gray,
    marginLeft: 6,
    fontWeight: '600',
  },
  simpleInfoCard: {
    backgroundColor: 'white',
    borderRadius: 18,
    padding: 16,
    marginBottom: 14,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  simpleInfoLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  simpleInfoText: {
    fontSize: 14,
    color: Colors.dark,
    fontWeight: '700',
  },
  safetyCard: {
    backgroundColor: '#FFF3E7',
    borderRadius: 18,
    padding: 16,
    marginBottom: 14,
  },
  safetyTitle: {
    fontSize: 14,
    color: '#2457A6',
    fontWeight: '800',
  },
  safetySub: {
    marginTop: 2,
    fontSize: 12,
    color: '#2457A6',
    opacity: 0.9,
    fontWeight: '600',
  },
  bottomBar: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: Platform.OS === 'ios' ? 28 : 16,
    backgroundColor: 'white',
    borderTopWidth: 1,
    borderTopColor: '#ECEEF2',
  },
  bottomCaption: {
    fontSize: 12,
    color: Colors.gray,
    fontWeight: '500',
  },
  bottomTotal: {
    fontSize: 26,
    color: Colors.dark,
    fontWeight: '900',
    marginTop: 2,
  },
  bookNowBtn: {
    backgroundColor: '#FF7A00',
    paddingHorizontal: 24,
    paddingVertical: 14,
    borderRadius: 22,
    minWidth: 128,
    alignItems: 'center',
    justifyContent: 'center',
  },
  bookNowBtnDisabled: {
    opacity: 0.7,
  },
  bookNowText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '800',
  },
  loaderContainer: {
  flex: 1,
  justifyContent: "center",
  alignItems: "center",
  backgroundColor: "#fff",
},

loaderText: {
  marginTop: 16,
  fontSize: 16,
  color: "#2457A6",
  fontWeight: "600",
},
});