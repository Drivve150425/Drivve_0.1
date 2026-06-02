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
  Linking
} from 'react-native';
import MapView, { Marker, Polyline, PROVIDER_GOOGLE } from 'react-native-maps';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import LottieView from "lottie-react-native";
import { SvgCssUri } from 'react-native-svg/css';
import { Colors } from '../constants/Colors';
import { useAuth } from '../context/AuthContext';
import { API_BASE_URL } from '../config/config_ip';
import CustomAlert from '../components/CustomAlert';
import { useFocusEffect } from '@react-navigation/native';
import io from 'socket.io-client';

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

export default function ViewRoutePostedScreen({ navigation, route }) {
  const { user } = useAuth();
  const { ride } = route.params || {};

  const [drawerExpanded, setDrawerExpanded] = useState(true);
  const [driverProfile, setDriverProfile] = useState(null);
  const [isVerified, setIsVerified] = useState(false);
  const [loadingProfile, setLoadingProfile] = useState(false);
  const [mapReady, setMapReady] = useState(false);
  const [rideBookings, setRideBookings] = useState([]);
  const [expandedBookings, setExpandedBookings] = useState({});
  const [loadingBookings, setLoadingBookings] = useState(false);
  const [showNavigationAlert, setShowNavigationAlert] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);
  const [liveSession, setLiveSession] = useState(null);
  const [checkingLiveSession, setCheckingLiveSession] = useState(false);
  
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

  const showCustomAlert = (title, message, type = 'success') => {
    let icon = "check-circle";
    let iconColor = "#10B981";
    if (type === 'error') { icon = "error"; iconColor = "#EF4444"; }
    else if (type === 'warning') { icon = "warning"; iconColor = "#F59E0B"; }
    else if (type === 'info') { icon = "info"; iconColor = Colors.primary; }
    setAlertConfig({ title, message, icon, iconColor, buttons: [{ text: 'OK', onPress: () => setAlertVisible(false) }] });
    setAlertVisible(true);
  };

  const shouldShowNavigation = useCallback(() => {
    if (!ride?.departure_time) return false;
    const now = new Date();
    const departureTime = new Date(ride.departure_time);
    const minutesDiff = (departureTime - now) / (1000 * 60);
    return minutesDiff <= 15 && minutesDiff > 0;
  }, [ride?.departure_time]);

  const getRideStatus = useCallback(() => {
    if (!ride?.departure_time) return 'unknown';
    const now = new Date();
    const departureTime = new Date(ride.departure_time);
    const minutesDiff = (departureTime - now) / (1000 * 60);
    if (now >= departureTime) return 'completed';
    if (minutesDiff <= 15 && minutesDiff > 0) return 'starting-soon';
    return 'upcoming';
  }, [ride?.departure_time]);

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
            console.log('Socket connected');
            socket.emit('join-live-session', data.session.session_id);
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
  }, [ride?.id]);

  const toggleBookingExpand = (bookingId) => {
    setExpandedBookings(prev => ({ ...prev, [bookingId]: !prev[bookingId] }));
  };

  const fetchRideBookings = useCallback(async () => {
    if (!ride?.id) return;
    setLoadingBookings(true);
    try {
      const response = await fetch(`${API_BASE_URL}/ride/${ride.id}/passengers?_t=${Date.now()}`);
      const data = await response.json();
      setRideBookings(data.passengers || []);
    } catch (error) {
      console.log('Error fetching ride bookings:', error);
      setRideBookings([]);
    } finally {
      setLoadingBookings(false);
    }
  }, [ride?.id]);

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
      fetchRideBookings();
      checkLiveSession();
      setRefreshKey(prev => prev + 1);
      return () => {
        if (socketRef.current) {
          socketRef.current.disconnect();
          socketRef.current = null;
        }
      };
    }, [loadDriverData, fetchRideBookings, checkLiveSession])
  );

  useEffect(() => {
    if (shouldShowNavigation() && !showNavigationAlert) {
      setShowNavigationAlert(true);
      showCustomAlert('Navigation Available', 'Your ride starts in less than 15 minutes. Would you like to open navigation?', 'info');
    }
  }, [shouldShowNavigation()]);

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
      if (first && typeof first === 'object' && first.latitude && first.longitude) return { latitude: first.latitude, longitude: first.longitude };
    }
    return parseSuggestedPoint(ride?.suggestedPickup);
  }, [ride]);

  const driverEnd = useMemo(() => {
    const coords = ride?.routeCoordinates;
    if (Array.isArray(coords) && coords.length > 0) {
      const last = coords[coords.length - 1];
      if (Array.isArray(last) && last.length === 2) return { latitude: last[1], longitude: last[0] };
      if (last && typeof last === 'object' && last.latitude && last.longitude) return { latitude: last.latitude, longitude: last.longitude };
    }
    return parseSuggestedPoint(ride?.suggestedDrop);
  }, [ride]);

  const intersectionPickup = useMemo(() => parseSuggestedPoint(ride?.suggestedPickup), [ride]);
  const intersectionDrop = useMemo(() => parseSuggestedPoint(ride?.suggestedDrop), [ride]);

  const routePath = useMemo(() => {
    const fullRoute = parseRouteCoordinates(ride?.routeCoordinates);
    if (fullRoute.length >= 2) return fullRoute;
    if (intersectionPickup && intersectionDrop) return [intersectionPickup, intersectionDrop];
    if (driverStart && driverEnd) return [driverStart, driverEnd];
    return [];
  }, [ride, intersectionPickup, intersectionDrop, driverStart, driverEnd]);

  const allMarkerCoords = useMemo(() => {
    const coords = [];
    if (driverStart) coords.push(driverStart);
    if (driverEnd) coords.push(driverEnd);
    if (intersectionPickup) coords.push(intersectionPickup);
    if (intersectionDrop) coords.push(intersectionDrop);
    return coords;
  }, [driverStart, driverEnd, intersectionPickup, intersectionDrop]);

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

  const getVehicleDetails = useCallback(() => {
    let model = 'Not specified';
    let make = '';
    let year = '';
    let color = 'Not specified';
    let registrationNumber = null;
    let seats = ride?.seatsAvailable || ride?.available_seats || 4;
    
    if (ride?.vehicle) {
      model = ride.vehicle.model || model;
      make = ride.vehicle.make || make;
      year = ride.vehicle.year || year;
      color = ride.vehicle.color || color;
      registrationNumber = ride.vehicle.registration_number || ride.vehicle.reg_number || null;
      seats = ride.vehicle.seats || seats;
    }
    if (driverProfile?.vehicle) {
      model = driverProfile.vehicle.model || model;
      make = driverProfile.vehicle.make || make;
      year = driverProfile.vehicle.year || year;
      color = driverProfile.vehicle.color || color;
      registrationNumber = driverProfile.vehicle.registration_number || registrationNumber;
      seats = driverProfile.vehicle.seats || seats;
    }
    if (ride?.vehicleModel) model = ride.vehicleModel;
    if (ride?.vehicleMake) make = ride.vehicleMake;
    if (ride?.vehicleYear) year = ride.vehicleYear;
    if (ride?.vehicleColor) color = ride.vehicleColor;
    if (ride?.vehicleRegNumber) registrationNumber = ride.vehicleRegNumber;
    
    let vehicleName = model;
    if (make && make !== 'Not specified' && make !== model) vehicleName = `${make} ${model}`;
    if (year && year !== 'Not specified') vehicleName = `${vehicleName} (${year})`;
    
    return { name: vehicleName && vehicleName !== 'Not specified' ? vehicleName.trim() : 'Vehicle details unavailable', color, seats, registrationNumber };
  }, [ride, driverProfile]);

  const vehicleDetails = getVehicleDetails();

  const handleProfileImagePress = () => {
    if (profilePhotoUrl) {
      setSelectedProfile({ visible: true, imageUrl: profilePhotoUrl, driverName: driverProfile?.full_name || ride?.driverName || 'Driver' });
    } else {
      showCustomAlert('No Photo', 'Driver has not uploaded a profile picture', 'warning');
    }
  };

  const openNavigation = () => {
    const pickupLat = intersectionPickup?.latitude || driverStart?.latitude;
    const pickupLng = intersectionPickup?.longitude || driverStart?.longitude;
    if (pickupLat && pickupLng) {
      const url = Platform.select({
        ios: `maps://app?daddr=${pickupLat},${pickupLng}`,
        android: `google.navigation:q=${pickupLat},${pickupLng}`
      });
      Linking.openURL(url).catch(() => showCustomAlert('Error', 'Unable to open navigation', 'error'));
    } else {
      showCustomAlert('Location Error', 'Pickup location not available', 'warning');
    }
  };

  const startLiveTracking = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/ride/${ride.id}/start-live-session`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });
      const data = await response.json();
      if (data.success) {
        setLiveSession(data.session);
        navigation.navigate('OngoingRideDriverScreen', { rideId: ride.id, sessionId: data.session.session_id });
      } else {
        showCustomAlert('Error', data.message || 'Failed to start live tracking', 'error');
      }
    } catch (error) {
      console.log('Error starting live session:', error);
      showCustomAlert('Error', 'Failed to start live tracking', 'error');
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

  const viewDriverProfile = () => {
    const driverPhone = ride?.phoneNumber;
    const driverUserId = ride?.driverUserId;
    if (driverPhone || driverUserId) {
      navigation.navigate('ViewProfileScreen', {
        userId: driverUserId || null,
        phoneNumber: driverPhone || null,
        driverName: driverProfile?.full_name || ride?.driverName || 'Driver',
        profilePicture: profilePhotoUrl,
        vehicleNumber: vehicleDetails.registrationNumber,
        vehicleModel: vehicleDetails.name,
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

  const startChat = async (receiverPhone, receiverName) => {
    if (receiverPhone) {
      const conversationId = await getOrCreateConversation(receiverPhone, ride.id);
      if (conversationId) {
        navigation.navigate('ChatScreen', {
          receiverPhone: receiverPhone,
          conversationId,
          user: { name: receiverName, tripInfo: `${ride.from || 'Pickup'} → ${ride.to || 'Drop'}` },
        });
      } else {
        showCustomAlert('Chat', 'Unable to start chat. Please try again.', 'error');
      }
    } else {
      showCustomAlert('Chat', 'Contact not available', 'warning');
    }
  };

  const viewPassengerProfile = (passengerPhone, passengerName, profilePicture) => {
    navigation.navigate('ViewProfileScreen', {
      phoneNumber: passengerPhone,
      driverName: passengerName,
      profilePicture: profilePicture,
    });
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

  const rideStatus = getRideStatus();
  const showNavButton = shouldShowNavigation();
  const canStartLiveTracking = rideStatus === 'starting-soon' || rideStatus === 'upcoming';

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

  const totalBookedSeats = rideBookings.reduce((sum, b) => sum + (b.seats_booked || 0), 0);
  const availableSeats = (ride?.seatsAvailable || ride?.remaining_seats || 0) - totalBookedSeats;

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
                  <Ionicons name="flag" size={16} color="white" />
                </View>
                <View style={[styles.pinPointer, { borderTopColor: '#16A34A' }]} />
                <View style={styles.pinLabelBubbleGreen}>
                  <Text style={styles.pinLabelTextGreen}>Start Point</Text>
                  <Text style={styles.pinLabelSubtext}>{ride.from || 'Pickup Location'}</Text>
                </View>
              </View>
            </Marker>
          )}

          {driverEnd && (
            <Marker coordinate={driverEnd} anchor={{ x: 0.5, y: 1 }}>
              <View style={styles.markerWrapper}>
                <View style={[styles.pinBubble, { backgroundColor: '#DC2626' }]}>
                  <Ionicons name="flag" size={16} color="white" />
                </View>
                <View style={[styles.pinPointer, { borderTopColor: '#DC2626' }]} />
                <View style={styles.pinLabelBubbleRed}>
                  <Text style={styles.pinLabelTextRed}>End Point</Text>
                  <Text style={styles.pinLabelSubtextRed}>{ride.to || 'Drop Location'}</Text>
                </View>
              </View>
            </Marker>
          )}

          {intersectionPickup && (
            <Marker coordinate={intersectionPickup} anchor={{ x: 0.5, y: 1 }}>
              <View style={styles.markerWrapper}>
                <View style={[styles.pinBubble, { backgroundColor: '#FACC15' }]}>
                  <Ionicons name="hand-right" size={14} color="#713F12" />
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
                  <Ionicons name="exit" size={14} color="#713F12" />
                </View>
                <View style={[styles.pinPointer, { borderTopColor: '#FACC15' }]} />
                <View style={styles.pinLabelBubbleYellow}>
                  <Text style={styles.pinLabelTextYellow}>Exit Here</Text>
                </View>
              </View>
            </Marker>
          )}
        </MapView>

        <TouchableOpacity style={styles.mapBackButton} onPress={() => navigation.goBack()}>
          <Ionicons name="chevron-back" size={26} color={Colors.secondary} />
        </TouchableOpacity>

        {!liveSession && canStartLiveTracking && (
          <TouchableOpacity style={styles.liveTrackingButton} onPress={startLiveTracking}>
            <Ionicons name="radio-outline" size={20} color="#fff" />
            <Text style={styles.liveTrackingButtonText}>Start Live Tracking</Text>
          </TouchableOpacity>
        )}

        {liveSession && (
          <TouchableOpacity style={[styles.liveTrackingButton, styles.liveTrackingActiveButton]} onPress={() => navigation.navigate('OngoingRideDriverScreen', { rideId: ride.id, sessionId: liveSession.session_id })}>
            <View style={styles.liveDot} />
            <Text style={styles.liveTrackingButtonText}>Live: Track Ride</Text>
          </TouchableOpacity>
        )}

        {showNavButton && (
          <TouchableOpacity style={styles.navigationButton} onPress={openNavigation}>
            <Ionicons name="navigate" size={20} color="#fff" />
            <Text style={styles.navigationButtonText}>Navigate to Pickup</Text>
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
            {rideStatus === 'starting-soon' && (
              <View style={styles.startingSoonBanner}>
                <Ionicons name="timer-outline" size={20} color="#2457A6" />
                <Text style={styles.startingSoonText}>Ride starting soon! Navigation available</Text>
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
                <View style={styles.vehicleIconCircle}><Ionicons name="car-sport-outline" size={24} color="#2457A6" /></View>
                <View style={styles.vehicleMeta}>
                  <Text style={styles.vehicleTitle}>{vehicleDetails.name}</Text>
                  <View style={styles.vehicleDetailsGrid}>
                    <View style={styles.vehicleDetailItem}>
                      <Ionicons name="color-palette-outline" size={16} color={Colors.gray} />
                      <Text style={styles.vehicleDetailText}>{vehicleDetails.color}</Text>
                    </View>
                    <View style={styles.vehicleDetailItem}>
                      <Ionicons name="people-outline" size={16} color={Colors.gray} />
                      <Text style={styles.vehicleDetailText}>{vehicleDetails.seats} Seats</Text>
                    </View>
                    {vehicleDetails.registrationNumber && (
                      <View style={styles.vehicleDetailItem}>
                        <Ionicons name="document-text-outline" size={16} color={Colors.gray} />
                        <Text style={styles.vehicleDetailText}>Reg No: {vehicleDetails.registrationNumber}</Text>
                      </View>
                    )}
                  </View>
                </View>
              </View>
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
              <Text style={styles.sectionTitle}>Seat Information</Text>
              <View style={styles.seatsRow}>
                <View style={styles.seatItem}>
                  <Ionicons name="people-outline" size={24} color={Colors.primary} />
                  <Text style={styles.seatLabel}>Total Seats</Text>
                  <Text style={styles.seatValue}>{ride?.totalSeats || ride?.available_seats || 4}</Text>
                </View>
                <View style={styles.seatItem}>
                  <Ionicons name="person-add-outline" size={24} color={Colors.success} />
                  <Text style={styles.seatLabel}>Booked</Text>
                  <Text style={styles.seatValue}>{totalBookedSeats}</Text>
                </View>
                <View style={styles.seatItem}>
                  <Ionicons name="person-outline" size={24} color={Colors.warning} />
                  <Text style={styles.seatLabel}>Available</Text>
                  <Text style={styles.seatValue}>{availableSeats}</Text>
                </View>
              </View>
            </View>

            <View style={styles.cardSection}>
              <Text style={styles.sectionTitle}>Booked Riders {loadingBookings ? '...' : `(${rideBookings.length})`}</Text>
              {loadingBookings ? (
                <View style={styles.loadingBookingsContainer}>
                  <ActivityIndicator size="small" color={Colors.primary} />
                  <Text style={styles.loadingBookingsText}>Loading bookings...</Text>
                </View>
              ) : rideBookings.length === 0 ? (
                <View style={styles.noBookingsContainer}>
                  <Ionicons name="people-outline" size={48} color={Colors.gray} />
                  <Text style={styles.noBookingsTitle}>No Bookings Yet</Text>
                  <Text style={styles.noBookingsText}>When passengers book your ride, they'll appear here</Text>
                </View>
              ) : (
                rideBookings.map((booking) => {
                  const isExpanded = expandedBookings[booking.booking_id];
                  return (
                    <View key={booking.booking_id} style={styles.bookingCard}>
                      <TouchableOpacity style={styles.bookingHeaderRow} onPress={() => toggleBookingExpand(booking.booking_id)} activeOpacity={0.7}>
                        <View style={styles.bookingHeaderInfo}>
                          <View style={styles.bookingAvatarContainer}>
                            {booking.profile_picture ? (
                              <Image source={{ uri: buildImageUrl(booking.profile_picture) }} style={styles.bookingAvatar} />
                            ) : (
                              <View style={styles.bookingAvatarPlaceholder}>
                                <Text style={styles.bookingAvatarText}>{getDriverInitials(booking.passenger_name)}</Text>
                              </View>
                            )}
                          </View>
                          <View>
                            <Text style={styles.bookingName}>{booking.passenger_name}</Text>
                            <Text style={styles.bookingSeatsBooked}>{booking.seats_booked} seat{booking.seats_booked > 1 ? 's' : ''} booked</Text>
                          </View>
                        </View>
                        <View style={styles.bookingHeaderRight}>
                          <View style={[styles.bookingStatusDot, { backgroundColor: booking.status === 'accepted' ? Colors.success : '#f1c40f' }]} />
                          <Text style={styles.bookingStatus}>{booking.status === 'accepted' ? 'Confirmed' : 'Pending'}</Text>
                          <Ionicons name={isExpanded ? "chevron-up" : "chevron-down"} size={18} color={Colors.gray} />
                        </View>
                      </TouchableOpacity>
                      {isExpanded && (
                        <View style={styles.bookingExpandedContent}>
                          <View style={styles.bookingDetailRow}>
                            <Ionicons name="call-outline" size={14} color={Colors.gray} />
                            <Text style={styles.bookingDetailText}>{booking.passenger_phone}</Text>
                          </View>
                          <View style={styles.bookingActionRow}>
                            <TouchableOpacity style={styles.chatWithRiderBtn} onPress={() => startChat(booking.passenger_phone, booking.passenger_name)}>
                              <Ionicons name="chatbubble-outline" size={16} color={Colors.primary} />
                              <Text style={styles.chatWithRiderText}>Chat</Text>
                            </TouchableOpacity>
                            <TouchableOpacity style={styles.viewRiderProfileBtn} onPress={() => viewPassengerProfile(booking.passenger_phone, booking.passenger_name, booking.profile_picture)}>
                              <Ionicons name="person-outline" size={16} color={Colors.primary} />
                              <Text style={styles.viewRiderProfileText}>View Profile</Text>
                            </TouchableOpacity>
                          </View>
                        </View>
                      )}
                    </View>
                  );
                })
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
  navigationButton: { position: 'absolute', bottom: 20, left: 20, right: 20, backgroundColor: '#2457A6', flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 14, borderRadius: 12, gap: 8, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.25, shadowRadius: 4, elevation: 5 },
  navigationButtonText: { color: '#fff', fontWeight: '700', fontSize: 14 },
  liveTrackingButton: { position: 'absolute', bottom: 20, left: 20, right: 20, backgroundColor: '#10B981', flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 14, borderRadius: 12, gap: 8, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.25, shadowRadius: 4, elevation: 5 },
  liveTrackingActiveButton: { backgroundColor: '#DC2626' },
  liveTrackingButtonText: { color: '#fff', fontWeight: '700', fontSize: 14 },
  liveDot: { width: 10, height: 10, borderRadius: 5, backgroundColor: '#fff', marginRight: 6 },
  markerWrapper: { alignItems: 'center' },
  pinBubble: { width: 32, height: 32, borderRadius: 16, borderWidth: 3, borderColor: 'white', alignItems: 'center', justifyContent: 'center', shadowColor: '#000', shadowOffset: { width: 0, height: 3 }, shadowOpacity: 0.25, shadowRadius: 4, elevation: 5 },
  pinPointer: { width: 0, height: 0, backgroundColor: 'transparent', borderStyle: 'solid', borderLeftWidth: 7, borderRightWidth: 7, borderTopWidth: 10, borderLeftColor: 'transparent', borderRightColor: 'transparent', marginTop: -2 },
  pinLabelBubbleGreen: { backgroundColor: 'rgba(22, 163, 74, 0.95)', borderRadius: 8, paddingHorizontal: 10, paddingVertical: 4, marginTop: 4, alignItems: 'center' },
  pinLabelTextGreen: { color: 'white', fontSize: 10, fontWeight: '700' },
  pinLabelSubtext: { color: 'rgba(255,255,255,0.9)', fontSize: 8, marginTop: 2 },
  pinLabelBubbleRed: { backgroundColor: 'rgba(220, 38, 38, 0.95)', borderRadius: 8, paddingHorizontal: 10, paddingVertical: 4, marginTop: 4, alignItems: 'center' },
  pinLabelTextRed: { color: 'white', fontSize: 10, fontWeight: '700' },
  pinLabelSubtextRed: { color: 'rgba(255,255,255,0.9)', fontSize: 8, marginTop: 2 },
  pinLabelBubbleYellow: { backgroundColor: 'rgba(113, 63, 18, 0.95)', borderRadius: 8, paddingHorizontal: 8, paddingVertical: 3, marginTop: 4 },
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
  startingSoonBanner: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#EAF1FF', borderRadius: 12, padding: 12, marginBottom: 14, gap: 8 },
  startingSoonText: { fontSize: 13, fontWeight: '600', color: '#2457A6', flex: 1 },
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
  driverBio: { marginTop: 12, fontSize: 14, lineHeight: 20, color: Colors.gray },
  profileOutlineBtn: { marginTop: 14, borderWidth: 1, borderColor: '#2457A6', borderRadius: 16, paddingVertical: 12, alignItems: 'center' },
  profileOutlineBtnText: { color: '#2457A6', fontWeight: '700', fontSize: 14 },
  cardSection: { backgroundColor: 'white', borderRadius: 20, padding: 16, marginBottom: 14, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 8, elevation: 2 },
  sectionTitle: { fontSize: 16, fontWeight: '800', color: Colors.dark, marginBottom: 14 },
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
  vehicleHeaderRow: { flexDirection: 'row', alignItems: 'flex-start' },
  vehicleIconCircle: { width: 50, height: 50, borderRadius: 25, backgroundColor: '#EAF1FF', alignItems: 'center', justifyContent: 'center', marginRight: 14 },
  vehicleMeta: { flex: 1 },
  vehicleTitle: { fontSize: 16, fontWeight: '800', color: Colors.dark, marginBottom: 8 },
  vehicleDetailsGrid: { gap: 6 },
  vehicleDetailItem: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  vehicleDetailText: { fontSize: 13, color: Colors.gray, fontWeight: '500' },
  tagRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 14 },
  preferenceTag: { paddingHorizontal: 12, paddingVertical: 8, borderRadius: 999, backgroundColor: '#FFF3E8' },
  preferenceTagText: { fontSize: 12, color: '#C65D00', fontWeight: '700' },
  emptyText: { fontSize: 13, color: Colors.gray, fontWeight: '600' },
  seatsRow: { flexDirection: 'row', justifyContent: 'space-around', marginTop: 8 },
  seatItem: { alignItems: 'center', gap: 8 },
  seatLabel: { fontSize: 12, color: Colors.gray, fontWeight: '600' },
  seatValue: { fontSize: 22, fontWeight: '800', color: Colors.dark },
  loadingBookingsContainer: { alignItems: 'center', padding: 20, gap: 10 },
  loadingBookingsText: { fontSize: 12, color: Colors.gray },
  noBookingsContainer: { alignItems: 'center', padding: 30, gap: 12 },
  noBookingsTitle: { fontSize: 16, fontWeight: '700', color: Colors.dark, marginTop: 8 },
  noBookingsText: { fontSize: 13, color: Colors.gray, textAlign: 'center' },
  bookingCard: { backgroundColor: '#F9FAFB', borderRadius: 12, padding: 12, marginBottom: 10, borderWidth: 1, borderColor: '#E5E7EB' },
  bookingHeaderRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  bookingHeaderInfo: { flexDirection: 'row', alignItems: 'center', flex: 1 },
  bookingAvatarContainer: { width: 44, height: 44, borderRadius: 22, backgroundColor: '#E5E7EB', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', marginRight: 12 },
  bookingAvatar: { width: 44, height: 44, borderRadius: 22 },
  bookingAvatarPlaceholder: { width: 44, height: 44, borderRadius: 22, backgroundColor: '#E5E7EB', alignItems: 'center', justifyContent: 'center' },
  bookingAvatarText: { fontSize: 16, fontWeight: '700', color: Colors.primary },
  bookingName: { fontSize: 14, fontWeight: '600', color: Colors.dark },
  bookingSeatsBooked: { fontSize: 11, color: Colors.gray, marginTop: 2 },
  bookingHeaderRight: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  bookingStatusDot: { width: 8, height: 8, borderRadius: 4 },
  bookingStatus: { fontSize: 11, fontWeight: '600', color: Colors.gray },
  bookingExpandedContent: { marginTop: 12, paddingTop: 12, borderTopWidth: 1, borderTopColor: '#E5E7EB' },
  bookingDetailRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 12 },
  bookingDetailText: { fontSize: 12, color: Colors.gray, flex: 1 },
  bookingActionRow: { flexDirection: 'row', gap: 10, marginTop: 8 },
  chatWithRiderBtn: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, paddingVertical: 10, borderRadius: 8, borderWidth: 1, borderColor: Colors.primary, backgroundColor: '#fff' },
  chatWithRiderText: { fontSize: 12, fontWeight: '600', color: Colors.primary },
  viewRiderProfileBtn: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, paddingVertical: 10, borderRadius: 8, borderWidth: 1, borderColor: Colors.primary, backgroundColor: '#fff' },
  viewRiderProfileText: { fontSize: 12, fontWeight: '600', color: Colors.primary },
  simpleInfoLeft: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  safetyCard: { backgroundColor: '#FFF3E7', borderRadius: 18, padding: 16, marginBottom: 14 },
  safetyTitle: { fontSize: 14, color: '#2457A6', fontWeight: '800' },
  safetySub: { marginTop: 2, fontSize: 12, color: '#2457A6', opacity: 0.9, fontWeight: '600' },
  loaderContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#fff' },
  modalBackdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center' },
  imageModalContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', width: '100%' },
  imageModalContent: { width: '90%', backgroundColor: Colors.white, borderRadius: 20, overflow: 'hidden', maxHeight: '80%' },
  imageModalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 16, borderBottomWidth: 1, borderBottomColor: '#EEF2F7' },
  imageModalTitle: { fontSize: 18, fontWeight: '700', color: Colors.dark },
  fullProfileImage: { width: '100%', height: 400, backgroundColor: '#F5F5F5' },
  modalSvgContainer: { width: '100%', height: 400, backgroundColor: '#F5F5F5', alignItems: 'center', justifyContent: 'center' },
  noImageContainer: { width: '100%', height: 400, justifyContent: 'center', alignItems: 'center', backgroundColor: '#F5F5F5' },
  noImageText: { fontSize: 16, color: Colors.gray },
});