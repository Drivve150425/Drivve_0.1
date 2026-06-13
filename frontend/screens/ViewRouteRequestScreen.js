// // // // // import React, { useMemo, useRef, useState, useEffect, useCallback } from 'react';
// // // // // import {
// // // // //   View, Text, StyleSheet, TouchableOpacity, ScrollView, Platform,
// // // // //   StatusBar, Image, Dimensions, Animated, PanResponder, Modal,
// // // // //   LogBox, TextInput, Share, Alert
// // // // // } from 'react-native';
// // // // // import MapView, { Marker, Polyline, PROVIDER_GOOGLE } from 'react-native-maps';
// // // // // import { Ionicons } from '@expo/vector-icons';
// // // // // import LottieView from "lottie-react-native";
// // // // // import { SvgCssUri } from 'react-native-svg/css';
// // // // // import { Colors } from '../constants/Colors';
// // // // // import { useAuth } from '../context/AuthContext';
// // // // // import { API_BASE_URL } from '../config/config_ip';
// // // // // import CustomAlert from '../components/CustomAlert';
// // // // // import { useFocusEffect } from '@react-navigation/native';
// // // // // import io from 'socket.io-client';

// // // // // LogBox.ignoreLogs(['Accessibility: View', 'Property accessibilityState', 'RCTView']);

// // // // // const { height, width } = Dimensions.get('window');
// // // // // const SAFE_TOP = Platform.OS === 'ios' ? 56 : 24;
// // // // // const COLLAPSED_HEIGHT = 84;
// // // // // const EXPANDED_HEIGHT = height * 0.72;

// // // // // // ============================================
// // // // // // UTILITY FUNCTIONS
// // // // // // ============================================

// // // // // function buildImageUrl(url) {
// // // // //   if (!url) return null;
// // // // //   if (url.startsWith('http://') || url.startsWith('https://')) return url;
// // // // //   return `${API_BASE_URL}${url.startsWith('/') ? '' : '/'}${url}`;
// // // // // }

// // // // // function getDriverInitials(name) {
// // // // //   if (!name) return 'D';
// // // // //   const parts = name.trim().split(' ').filter(Boolean);
// // // // //   if (parts.length > 1) return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
// // // // //   return parts[0].slice(0, 2).toUpperCase();
// // // // // }

// // // // // function parseSuggestedPoint(point) {
// // // // //   if (!point) return null;
// // // // //   if (Array.isArray(point) && point.length === 2) {
// // // // //     return { longitude: Number(point[0]), latitude: Number(point[1]) };
// // // // //   }
// // // // //   if (point.lng != null && point.lat != null) {
// // // // //     return { longitude: Number(point.lng), latitude: Number(point.lat) };
// // // // //   }
// // // // //   if (point.longitude != null && point.latitude != null) {
// // // // //     return { longitude: Number(point.longitude), latitude: Number(point.latitude) };
// // // // //   }
// // // // //   return null;
// // // // // }

// // // // // function parseRouteCoordinates(routeCoordinates) {
// // // // //   if (!Array.isArray(routeCoordinates)) return [];
// // // // //   return routeCoordinates.map((item) => {
// // // // //     if (Array.isArray(item) && item.length === 2) {
// // // // //       return { longitude: Number(item[0]), latitude: Number(item[1]) };
// // // // //     }
// // // // //     if (item && typeof item === 'object' && item.latitude && item.longitude) {
// // // // //       return { longitude: Number(item.longitude), latitude: Number(item.latitude) };
// // // // //     }
// // // // //     return parseSuggestedPoint(item);
// // // // //   }).filter(Boolean);
// // // // // }

// // // // // function isSvgUrl(url) {
// // // // //   if (!url) return false;
// // // // //   return url.toLowerCase().includes('.svg') || url.toLowerCase().includes('.svg?');
// // // // // }

// // // // // function calculateDistance(lat1, lon1, lat2, lon2) {
// // // // //   const R = 6371000;
// // // // //   const dLat = (lat2 - lat1) * Math.PI / 180;
// // // // //   const dLon = (lon2 - lon1) * Math.PI / 180;
// // // // //   const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
// // // // //             Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
// // // // //             Math.sin(dLon/2) * Math.sin(dLon/2);
// // // // //   const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
// // // // //   return R * c;
// // // // // }

// // // // // function formatDistance(meters) {
// // // // //   if (!meters) return 'Unknown';
// // // // //   if (meters < 1000) return `${Math.round(meters)} m`;
// // // // //   return `${(meters / 1000).toFixed(1)} km`;
// // // // // }

// // // // // function formatDate(dateString) {
// // // // //   if (!dateString) return 'Date not set';
// // // // //   const date = new Date(dateString);
// // // // //   const today = new Date();
// // // // //   const tomorrow = new Date(today);
// // // // //   tomorrow.setDate(tomorrow.getDate() + 1);
// // // // //   const isToday = date.toDateString() === today.toDateString();
// // // // //   const isTomorrow = date.toDateString() === tomorrow.toDateString();
// // // // //   let dayText = "";
// // // // //   if (isToday) dayText = "Today";
// // // // //   else if (isTomorrow) dayText = "Tomorrow";
// // // // //   else dayText = date.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" });
// // // // //   const timeText = date.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit", hour12: true });
// // // // //   return `${dayText}, ${timeText}`;
// // // // // }

// // // // // function formatTimeOnly(dateString) {
// // // // //   if (!dateString) return '--:--';
// // // // //   const date = new Date(dateString);
// // // // //   return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });
// // // // // }

// // // // // function extractAllPreferences(ride, driverTravelPrefs) {
// // // // //   let ridePrefs = ride?.preferences;
// // // // //   if (ridePrefs && typeof ridePrefs === 'string') {
// // // // //     try { ridePrefs = JSON.parse(ridePrefs); } catch (e) { ridePrefs = null; }
// // // // //   }
// // // // //   if (ridePrefs && typeof ridePrefs === 'object' && Object.keys(ridePrefs).length > 0) {
// // // // //     return extractFromObject(ridePrefs);
// // // // //   }
// // // // //   if (driverTravelPrefs && typeof driverTravelPrefs === 'object' && Object.keys(driverTravelPrefs).length > 0) {
// // // // //     return extractFromObject(driverTravelPrefs);
// // // // //   }
// // // // //   return [];
// // // // // }

// // // // // function extractFromObject(prefs) {
// // // // //   const allPreferences = [];
// // // // //   Object.entries(prefs).forEach(([key, value]) => {
// // // // //     if (value === null || value === undefined) return;
// // // // //     const formattedKey = key.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
// // // // //     if (typeof value === 'boolean') {
// // // // //       if (value === true) allPreferences.push(formattedKey);
// // // // //     } else if (Array.isArray(value)) {
// // // // //       if (value.length > 0) allPreferences.push(`${formattedKey}: ${value.join(', ')}`);
// // // // //     } else if (typeof value === 'object') {
// // // // //       allPreferences.push(...extractFromObject(value));
// // // // //     } else if (typeof value === 'string' && value.trim()) {
// // // // //       const lowerValue = value.toLowerCase();
// // // // //       if (!['false', 'no', 'none', 'null', 'undefined'].includes(lowerValue)) {
// // // // //         allPreferences.push(`${formattedKey}: ${value}`);
// // // // //       }
// // // // //     } else if (typeof value === 'number') {
// // // // //       allPreferences.push(`${formattedKey}: ${value}`);
// // // // //     }
// // // // //   });
// // // // //   return [...new Set(allPreferences)];
// // // // // }

// // // // // // ============================================
// // // // // // COMPONENTS
// // // // // // ============================================

// // // // // function GenericPreferenceTag({ label }) {
// // // // //   if (!label || label.trim() === '') return null;
// // // // //   let tagColor = '#FFF3E8';
// // // // //   let textColor = '#C65D00';
// // // // //   const lowerLabel = label.toLowerCase();
// // // // //   if (lowerLabel.includes('age') || lowerLabel.includes('category')) {
// // // // //     tagColor = '#E8F5E9'; textColor = '#2E7D32';
// // // // //   } else if (lowerLabel.includes('chat') || lowerLabel.includes('talk')) {
// // // // //     tagColor = '#E3F2FD'; textColor = '#1565C0';
// // // // //   } else if (lowerLabel.includes('gender')) {
// // // // //     tagColor = '#F3E5F5'; textColor = '#6A1B9A';
// // // // //   } else if (lowerLabel.includes('language') || lowerLabel.includes('speak')) {
// // // // //     tagColor = '#FFF9C4'; textColor = '#F57F17';
// // // // //   } else if (lowerLabel.includes('verified')) {
// // // // //     tagColor = '#E8F5E9'; textColor = '#2E7D32';
// // // // //   }
// // // // //   return (
// // // // //     <View style={[styles.preferenceTag, { backgroundColor: tagColor }]}>
// // // // //       <Text style={[styles.preferenceTagText, { color: textColor }]}>{label}</Text>
// // // // //     </View>
// // // // //   );
// // // // // }

// // // // // function ProfileImageModal({ visible, imageUrl, driverName, onClose }) {
// // // // //   const [isSvg, setIsSvg] = useState(false);
// // // // //   useEffect(() => {
// // // // //     if (imageUrl) setIsSvg(imageUrl.toLowerCase().includes('.svg'));
// // // // //   }, [imageUrl]);
// // // // //   if (!visible) return null;
// // // // //   return (
// // // // //     <Modal visible={visible} transparent={true} animationType="fade" onRequestClose={onClose}>
// // // // //       <TouchableOpacity style={styles.modalBackdrop} activeOpacity={1} onPress={onClose}>
// // // // //         <View style={styles.imageModalContainer}>
// // // // //           <View style={styles.imageModalContent}>
// // // // //             <View style={styles.imageModalHeader}>
// // // // //               <Text style={styles.imageModalTitle}>{driverName}</Text>
// // // // //               <TouchableOpacity onPress={onClose}><Ionicons name="close" size={24} color={Colors.dark} /></TouchableOpacity>
// // // // //             </View>
// // // // //             {imageUrl && imageUrl !== 'null' && imageUrl !== 'undefined' ? (
// // // // //               isSvg ? (
// // // // //                 <View style={styles.modalSvgContainer}><SvgCssUri uri={imageUrl} width="100%" height={400} /></View>
// // // // //               ) : (
// // // // //                 <Image source={{ uri: imageUrl }} style={styles.fullProfileImage} resizeMode="contain" />
// // // // //               )
// // // // //             ) : (
// // // // //               <View style={styles.noImageContainer}><Text style={styles.noImageText}>No profile picture available</Text></View>
// // // // //             )}
// // // // //           </View>
// // // // //         </View>
// // // // //       </TouchableOpacity>
// // // // //     </Modal>
// // // // //   );
// // // // // }

// // // // // // ============================================
// // // // // // MAIN SCREEN COMPONENT
// // // // // // ============================================

// // // // // export default function ViewRouteRequestScreen({ navigation, route }) {
// // // // //   const { user } = useAuth();
// // // // //   const params = route.params || {};
// // // // //   const initialRide = params.ride || null;
// // // // //   const booking = params.booking || null;

// // // // //   // State for ride data - initialize directly from params
// // // // //   const [currentRide, setCurrentRide] = useState(() => {
// // // // //     if (initialRide && initialRide.id) {
// // // // //       return initialRide;
// // // // //     }
// // // // //     if (booking?.ride) {
// // // // //       return booking.ride;
// // // // //     }
// // // // //     return null;
// // // // //   });

// // // // //   const [userBooking, setUserBooking] = useState(() => {
// // // // //     if (booking && booking.id) {
// // // // //       return {
// // // // //         id: booking.id,
// // // // //         seats_requested: booking.seats_requested || 1,
// // // // //         status: booking.status || 'pending',
// // // // //         total_amount: booking.total_amount,
// // // // //         created_at: booking.created_at,
// // // // //       };
// // // // //     }
// // // // //     if (initialRide?.booking && initialRide.booking.id) {
// // // // //       return {
// // // // //         id: initialRide.booking.id,
// // // // //         seats_requested: initialRide.booking.seats_requested || 1,
// // // // //         status: initialRide.booking.status || 'pending',
// // // // //         total_amount: initialRide.booking.total_amount,
// // // // //       };
// // // // //     }
// // // // //     if (initialRide?.seatsRequested) {
// // // // //       return {
// // // // //         id: initialRide.id,
// // // // //         seats_requested: initialRide.seatsRequested,
// // // // //         status: 'accepted',
// // // // //       };
// // // // //     }
// // // // //     return null;
// // // // //   });

// // // // //   const [driverProfile, setDriverProfile] = useState(null);
// // // // //   const [isVerified, setIsVerified] = useState(false);
// // // // //   const [loadingProfile, setLoadingProfile] = useState(false);
  
// // // // //   // UI State
// // // // //   const [drawerExpanded, setDrawerExpanded] = useState(true);
// // // // //   const [mapReady, setMapReady] = useState(false);
// // // // //   const [showCancelModal, setShowCancelModal] = useState(false);
// // // // //   const [ratingModalVisible, setRatingModalVisible] = useState(false);
// // // // //   const [selectedProfile, setSelectedProfile] = useState({ visible: false, imageUrl: null, driverName: '' });
// // // // //   const [alertVisible, setAlertVisible] = useState(false);
// // // // //   const [alertConfig, setAlertConfig] = useState({ title: "", message: "", icon: "check-circle", iconColor: "#10B981", buttons: [] });
  
// // // // //   // Seat related state
// // // // //   const [seatsRequested, setSeatsRequested] = useState(() => {
// // // // //     if (booking?.seats_requested) return booking.seats_requested;
// // // // //     if (initialRide?.seatsRequested) return initialRide.seatsRequested;
// // // // //     return 1;
// // // // //   });
// // // // //   const [modifyingSeats, setModifyingSeats] = useState(false);
// // // // //   const [totalSeatsOffered, setTotalSeatsOffered] = useState(() => initialRide?.available_seats || 4);
// // // // //   const [totalBookedSeats, setTotalBookedSeats] = useState(() => booking?.seats_requested || initialRide?.seatsRequested || 0);
// // // // //   const [availableSeats, setAvailableSeats] = useState(() => (initialRide?.available_seats || 4) - (booking?.seats_requested || initialRide?.seatsRequested || 0));
// // // // //   const [otherRiders, setOtherRiders] = useState([]);
  
// // // // //   // Modification request state
// // // // //   const [seatModificationRequested, setSeatModificationRequested] = useState(false);
// // // // //   const [pendingSeatsRequest, setPendingSeatsRequest] = useState(null);
// // // // //   const [pendingRequestDetails, setPendingRequestDetails] = useState(null);
// // // // //   const [pendingModificationRequest, setPendingModificationRequest] = useState(null);
  
// // // // //   // Live tracking state
// // // // //   const [liveSession, setLiveSession] = useState(null);
// // // // //   const [driverLocation, setDriverLocation] = useState(null);
// // // // //   const [driverETA, setDriverETA] = useState(null);
// // // // //   const [driverDistance, setDriverDistance] = useState(null);
// // // // //   const [socketConnected, setSocketConnected] = useState(false);
  
// // // // //   // Rating state
// // // // //   const [rating, setRating] = useState(0);
// // // // //   const [feedback, setFeedback] = useState('');
// // // // //   const [submitting, setSubmitting] = useState(false);
// // // // //   const [hasRatedDriver, setHasRatedDriver] = useState(false);
// // // // //   const [rideCompleted, setRideCompleted] = useState(false);
// // // // //   const [completedRideDetails, setCompletedRideDetails] = useState(null);
  
// // // // //   // Cancel state
// // // // //   const [cancelLoading, setCancelLoading] = useState(false);
  
// // // // //   // Refs
// // // // //   const animatedDrawer = useRef(new Animated.Value(1)).current;
// // // // //   const mapRef = useRef(null);
// // // // //   const socketRef = useRef(null);
// // // // //   const hasShownRatingModal = useRef(false);
  
// // // // //   // Animation values
// // // // //   const mapHeight = animatedDrawer.interpolate({ inputRange: [0, 1], outputRange: [height - SAFE_TOP - COLLAPSED_HEIGHT, height * 0.32] });
// // // // //   const drawerHeight = animatedDrawer.interpolate({ inputRange: [0, 1], outputRange: [COLLAPSED_HEIGHT, EXPANDED_HEIGHT] });
  
// // // // //   const toggleDrawer = () => {
// // // // //     const nextExpanded = !drawerExpanded;
// // // // //     setDrawerExpanded(nextExpanded);
// // // // //     Animated.timing(animatedDrawer, { toValue: nextExpanded ? 1 : 0, duration: 260, useNativeDriver: false }).start();
// // // // //   };
  
// // // // //   const panResponder = useRef(PanResponder.create({
// // // // //     onMoveShouldSetPanResponder: (_, gestureState) => Math.abs(gestureState.dy) > 5,
// // // // //     onPanResponderMove: (_, gestureState) => {
// // // // //       const dragRange = EXPANDED_HEIGHT - COLLAPSED_HEIGHT;
// // // // //       const progress = drawerExpanded ? 1 - (gestureState.dy / dragRange) : gestureState.dy / dragRange;
// // // // //       animatedDrawer.setValue(Math.max(0, Math.min(1, progress)));
// // // // //     },
// // // // //     onPanResponderRelease: (_, gestureState) => {
// // // // //       const dragRange = EXPANDED_HEIGHT - COLLAPSED_HEIGHT;
// // // // //       const threshold = dragRange * 0.2;
// // // // //       if (drawerExpanded) {
// // // // //         if (gestureState.dy > threshold) {
// // // // //           setDrawerExpanded(false);
// // // // //           Animated.timing(animatedDrawer, { toValue: 0, duration: 200, useNativeDriver: false }).start();
// // // // //         } else {
// // // // //           setDrawerExpanded(true);
// // // // //           Animated.timing(animatedDrawer, { toValue: 1, duration: 200, useNativeDriver: false }).start();
// // // // //         }
// // // // //       } else {
// // // // //         if (gestureState.dy < -threshold) {
// // // // //           setDrawerExpanded(true);
// // // // //           Animated.timing(animatedDrawer, { toValue: 1, duration: 200, useNativeDriver: false }).start();
// // // // //         } else {
// // // // //           setDrawerExpanded(false);
// // // // //           Animated.timing(animatedDrawer, { toValue: 0, duration: 200, useNativeDriver: false }).start();
// // // // //         }
// // // // //       }
// // // // //     },
// // // // //   })).current;
  
// // // // //   // Helper functions
// // // // //   const showCustomAlert = (title, message, type = 'success') => {
// // // // //     let icon = "check-circle";
// // // // //     let iconColor = "#10B981";
// // // // //     if (type === 'error') { icon = "error"; iconColor = "#EF4444"; }
// // // // //     else if (type === 'warning') { icon = "warning"; iconColor = "#F59E0B"; }
// // // // //     else if (type === 'info') { icon = "info"; iconColor = Colors.primary; }
// // // // //     setAlertConfig({ title, message, icon, iconColor, buttons: [{ text: 'OK', onPress: () => setAlertVisible(false) }] });
// // // // //     setAlertVisible(true);
// // // // //   };
  
// // // // //   const getProfilePhotoUrl = () => {
// // // // //     const rawUrl = driverProfile?.profile_picture || currentRide?.profilePicture || currentRide?.driverProfilePicture;
// // // // //     if (!rawUrl) return null;
// // // // //     return buildImageUrl(rawUrl);
// // // // //   };
  
// // // // //   // Add this function to get ride ID from booking
// // // // //   const getCorrectRideId = useCallback(async () => {
// // // // //     if (!userBooking?.id) return null;
    
// // // // //     try {
// // // // //       const response = await fetch(`${API_BASE_URL}/api/v1/bookings/${userBooking.id}/ride?_t=${Date.now()}`);
// // // // //       const data = await response.json();
      
// // // // //       if (data.success && data.ride) {
// // // // //         console.log('✅ Got correct ride ID from booking API:', data.ride.id);
// // // // //         return data.ride.id;
// // // // //       }
// // // // //       return null;
// // // // //     } catch (error) {
// // // // //       console.log('Error fetching ride from booking:', error);
// // // // //       return null;
// // // // //     }
// // // // //   }, [userBooking?.id]);

// // // // //   // Fetch modification requests
// // // // //   const fetchModificationRequests = useCallback(async () => {
// // // // //     if (!userBooking?.id) return;
    
// // // // //     try {
// // // // //       const response = await fetch(`${API_BASE_URL}/booking/${userBooking.id}/modification-request?_t=${Date.now()}`);
// // // // //       const data = await response.json();
      
// // // // //       console.log('📋 Modification request response:', data);
      
// // // // //       if (data.has_pending && data.request) {
// // // // //         setPendingModificationRequest(data.request);
// // // // //         setSeatModificationRequested(true);
// // // // //         setPendingSeatsRequest(data.request.requested_seats);
// // // // //         setPendingRequestDetails(data.request);
// // // // //       } else {
// // // // //         setPendingModificationRequest(null);
// // // // //         setSeatModificationRequested(false);
// // // // //         setPendingSeatsRequest(null);
// // // // //         setPendingRequestDetails(null);
// // // // //       }
// // // // //     } catch (error) {
// // // // //       console.log('Error fetching modification request:', error);
// // // // //     }
// // // // //   }, [userBooking?.id]);
  
// // // // //   // Handle cancel modification request
// // // // //   const handleCancelModificationRequest = async () => {
// // // // //     if (!userBooking?.id) return;
    
// // // // //     setModifyingSeats(true);
// // // // //     try {
// // // // //       const response = await fetch(`${API_BASE_URL}/api/v1/modifications/booking/${userBooking.id}/cancel`, {
// // // // //         method: 'DELETE',
// // // // //         headers: { 'Content-Type': 'application/json' },
// // // // //       });
// // // // //       const data = await response.json();
      
// // // // //       if (!response.ok) throw new Error(data.detail || data.message || 'Failed to cancel modification request');
      
// // // // //       showCustomAlert('Request Cancelled', 'Your seat modification request has been cancelled.', 'success');
// // // // //       setSeatModificationRequested(false);
// // // // //       setPendingSeatsRequest(null);
// // // // //       setPendingRequestDetails(null);
// // // // //       setPendingModificationRequest(null);
// // // // //       await fetchModificationRequests();
// // // // //     } catch (error) {
// // // // //       console.error('Cancel modification error:', error);
// // // // //       showCustomAlert('Error', error.message || 'Failed to cancel modification request', 'error');
// // // // //     } finally {
// // // // //       setModifyingSeats(false);
// // // // //     }
// // // // //   };

// // // // //   // Update fetchSeatAvailability to use the correct ride ID
// // // // //   const fetchSeatAvailability = useCallback(async () => {
// // // // //     let rideId = currentRide?.id;
    
// // // // //     if (!rideId || rideId === 3 || rideId === 0) {
// // // // //       const correctId = await getCorrectRideId();
// // // // //       if (correctId) {
// // // // //         rideId = correctId;
// // // // //         setCurrentRide(prev => ({ ...prev, id: correctId }));
// // // // //       } else {
// // // // //         console.log('❌ Could not get valid ride ID');
// // // // //         return;
// // // // //       }
// // // // //     }
    
// // // // //     console.log('✅ Fetching passengers for ride ID:', rideId);
    
// // // // //     try {
// // // // //       const url = `${API_BASE_URL.replace(/\/$/, '')}/ride/${rideId}/passengers?_t=${Date.now()}`;
// // // // //       console.log('📡 Fetching from URL:', url);
      
// // // // //       const response = await fetch(url);
// // // // //       console.log('📡 Response status:', response.status);
      
// // // // //       if (response.ok) {
// // // // //         const data = await response.json();
// // // // //         console.log('📡 API Response:', JSON.stringify(data, null, 2));
        
// // // // //         const totalSeats = data.available_seats || currentRide?.available_seats || 4;
// // // // //         setTotalSeatsOffered(totalSeats);
        
// // // // //         const totalBooked = data.total_booked_seats || 0;
// // // // //         setTotalBookedSeats(totalBooked);
// // // // //         setAvailableSeats(Math.max(0, totalSeats - totalBooked));
        
// // // // //         if (data.passengers && Array.isArray(data.passengers) && user?.phone_number) {
// // // // //           const normalizePhone = (phone) => {
// // // // //             if (!phone) return '';
// // // // //             let cleaned = phone.replace(/\s/g, '').replace(/-/g, '');
// // // // //             if (cleaned.startsWith('+91')) return cleaned;
// // // // //             if (cleaned.startsWith('91') && cleaned.length === 12) return `+${cleaned}`;
// // // // //             if (cleaned.startsWith('+')) return cleaned;
// // // // //             return `+91${cleaned}`;
// // // // //           };
          
// // // // //           const currentUserPhone = normalizePhone(user.phone_number);
// // // // //           console.log('📱 Current user phone:', currentUserPhone);
          
// // // // //           const acceptedPassengers = data.passengers.filter(p => p.status === 'accepted');
// // // // //           console.log('✅ Accepted passengers count:', acceptedPassengers.length);
          
// // // // //           const otherAccepted = acceptedPassengers.filter(p => {
// // // // //             const passengerPhone = normalizePhone(p.passenger_phone);
// // // // //             return passengerPhone !== currentUserPhone;
// // // // //           });
          
// // // // //           console.log('👥 Other riders found:', otherAccepted.length);
// // // // //           console.log('👥 Other riders:', otherAccepted);
          
// // // // //           setOtherRiders(otherAccepted);
// // // // //         } else {
// // // // //           console.log('❌ No passengers array or no user phone');
// // // // //           setOtherRiders([]);
// // // // //         }
// // // // //       } else if (response.status === 404) {
// // // // //         console.log('ℹ️ Ride not found - this might be normal if no passengers yet');
// // // // //         setOtherRiders([]);
// // // // //         setTotalSeatsOffered(currentRide?.available_seats || 4);
// // // // //         setTotalBookedSeats(0);
// // // // //         setAvailableSeats(currentRide?.available_seats || 4);
// // // // //       } else {
// // // // //         console.log('❌ API response not OK:', response.status);
// // // // //         const errorText = await response.text();
// // // // //         console.log('Error response:', errorText);
// // // // //       }
// // // // //     } catch (error) {
// // // // //       console.log('❌ Error fetching seat availability:', error);
// // // // //     }
// // // // //   }, [currentRide?.id, currentRide?.available_seats, user?.phone_number, getCorrectRideId]);

// // // // //   // Update loadDriverData to use correct ride ID
// // // // //   const loadDriverData = useCallback(async () => {
// // // // //     let rideId = currentRide?.id;
// // // // //     if (!rideId || rideId === 3 || rideId === 0) {
// // // // //       const correctId = await getCorrectRideId();
// // // // //       if (correctId) {
// // // // //         rideId = correctId;
// // // // //         setCurrentRide(prev => ({ ...prev, id: correctId }));
// // // // //       }
// // // // //     }
    
// // // // //     let driverPhone = currentRide?.phoneNumber || currentRide?.driver_phone;
// // // // //     let driverUserId = currentRide?.driverUserId || currentRide?.driver_user_id;
    
// // // // //     if ((!driverPhone && !driverUserId) && userBooking?.id) {
// // // // //       try {
// // // // //         const response = await fetch(`${API_BASE_URL}/api/v1/bookings/${userBooking.id}/ride?_t=${Date.now()}`);
// // // // //         const data = await response.json();
// // // // //         if (data.success && data.ride) {
// // // // //           driverPhone = data.ride.driver_phone;
// // // // //           driverUserId = data.ride.driver_user_id;
// // // // //           setCurrentRide(prev => ({ ...prev, 
// // // // //             phoneNumber: driverPhone, 
// // // // //             driver_phone: driverPhone,
// // // // //             driverUserId: driverUserId,
// // // // //             driverName: data.ride.driver_name,
// // // // //             from: data.ride.origin,
// // // // //             to: data.ride.destination,
// // // // //             departure_time: data.ride.departure_time,
// // // // //             price: data.ride.price_per_seat,
// // // // //             available_seats: data.ride.available_seats,
// // // // //             routeCoordinates: data.ride.route_coordinates,
// // // // //           }));
// // // // //         }
// // // // //       } catch (error) {
// // // // //         console.log('Error fetching ride details:', error);
// // // // //       }
// // // // //     }
    
// // // // //     if (!driverPhone && !driverUserId) {
// // // // //       console.log('No driver contact info available');
// // // // //       return;
// // // // //     }
    
// // // // //     setLoadingProfile(true);
// // // // //     try {
// // // // //       const params = new URLSearchParams();
// // // // //       if (driverUserId) params.append('user_id', driverUserId);
// // // // //       else if (driverPhone) params.append('phone_number', driverPhone);
// // // // //       params.append('_t', Date.now());
      
// // // // //       const profileRes = await fetch(`${API_BASE_URL}/api/v1/users/profile-public?${params.toString()}`);
// // // // //       const profileData = await profileRes.json();
      
// // // // //       if (profileData?.success && profileData.user) {
// // // // //         setDriverProfile(profileData.user);
// // // // //       }
      
// // // // //       if (driverPhone) {
// // // // //         const docsRes = await fetch(`${API_BASE_URL}/api/v1/documents/user/${driverPhone}`);
// // // // //         const docsData = await docsRes.json();
// // // // //         if (docsData?.success && docsData.documents) {
// // // // //           const verifiedDocs = docsData.documents.filter(doc => {
// // // // //             const status = doc.status?.toUpperCase();
// // // // //             return status === 'APPROVED' && ['aadhar', 'dl', 'rc'].includes(doc.document_type?.toLowerCase());
// // // // //           });
// // // // //           setIsVerified(verifiedDocs.length > 0);
// // // // //         }
// // // // //       }
// // // // //     } catch (error) {
// // // // //       console.log('Error loading driver data:', error);
// // // // //     } finally {
// // // // //       setLoadingProfile(false);
// // // // //     }
// // // // //   }, [currentRide, userBooking?.id, getCorrectRideId]);

// // // // //   // Add useEffect to initialize data when component mounts
// // // // //   useEffect(() => {
// // // // //     const initializeData = async () => {
// // // // //       if (userBooking?.id) {
// // // // //         try {
// // // // //           const response = await fetch(`${API_BASE_URL}/api/v1/bookings/${userBooking.id}/ride?_t=${Date.now()}`);
// // // // //           const data = await response.json();
          
// // // // //           if (data.success && data.ride) {
// // // // //             console.log('✅ Fetched ride details from booking API:', data.ride.id);
            
// // // // //             setCurrentRide({
// // // // //               id: data.ride.id,
// // // // //               available_seats: data.ride.available_seats,
// // // // //               price: data.ride.price_per_seat,
// // // // //               from: data.ride.origin,
// // // // //               to: data.ride.destination,
// // // // //               departure_time: data.ride.departure_time,
// // // // //               phoneNumber: data.ride.driver_phone,
// // // // //               driverName: data.ride.driver_name,
// // // // //               driverUserId: data.ride.driver_user_id,
// // // // //               routeCoordinates: data.ride.route_coordinates,
// // // // //               distance_km: data.ride.distance_km,
// // // // //               duration_text: data.ride.duration_text,
// // // // //               status: data.ride.status,
// // // // //               women_only: data.ride.women_only,
// // // // //               rating: data.ride.driver_rating || 4.5,
// // // // //               origin_lat: data.ride.origin_latitude,
// // // // //               origin_lon: data.ride.origin_longitude,
// // // // //               suggestedPickup: data.ride.suggested_pickup_point,
// // // // //               suggestedDrop: data.ride.suggested_drop_point,
// // // // //             });
            
// // // // //             const totalSeats = data.ride.available_seats || 4;
// // // // //             setTotalSeatsOffered(totalSeats);
// // // // //             setTotalBookedSeats(data.ride.total_booked_seats || userBooking.seats_requested || 1);
// // // // //             setAvailableSeats(totalSeats - (data.ride.total_booked_seats || userBooking.seats_requested || 1));
            
// // // // //             await fetchPassengersForRide(data.ride.id);
// // // // //             await loadDriverProfile(data.ride.driver_phone, data.ride.driver_user_id);
// // // // //             await fetchModificationRequests();
// // // // //           }
// // // // //         } catch (error) {
// // // // //           console.log('Error initializing ride data:', error);
// // // // //         }
// // // // //       }
// // // // //     };
    
// // // // //     initializeData();
// // // // //   }, [userBooking?.id]);

// // // // //   // Helper function to fetch passengers
// // // // //   const fetchPassengersForRide = async (rideId) => {
// // // // //     if (!rideId || rideId === 3 || rideId === 0) return;
    
// // // // //     try {
// // // // //       const url = `${API_BASE_URL.replace(/\/$/, '')}/ride/${rideId}/passengers?_t=${Date.now()}`;
// // // // //       console.log('📡 Fetching passengers from:', url);
      
// // // // //       const response = await fetch(url);
      
// // // // //       if (response.ok) {
// // // // //         const data = await response.json();
// // // // //         console.log('📡 Passengers data:', data);
        
// // // // //         if (data.passengers && Array.isArray(data.passengers) && user?.phone_number) {
// // // // //           const normalizePhone = (phone) => {
// // // // //             if (!phone) return '';
// // // // //             let cleaned = phone.replace(/\s/g, '').replace(/-/g, '');
// // // // //             if (cleaned.startsWith('+91')) return cleaned;
// // // // //             if (cleaned.startsWith('91') && cleaned.length === 12) return `+${cleaned}`;
// // // // //             if (cleaned.startsWith('+')) return cleaned;
// // // // //             return `+91${cleaned}`;
// // // // //           };
          
// // // // //           const currentUserPhone = normalizePhone(user.phone_number);
// // // // //           const acceptedPassengers = data.passengers.filter(p => p.status === 'accepted');
// // // // //           const otherAccepted = acceptedPassengers.filter(p => {
// // // // //             const passengerPhone = normalizePhone(p.passenger_phone);
// // // // //             return passengerPhone !== currentUserPhone;
// // // // //           });
          
// // // // //           console.log('👥 Other riders:', otherAccepted);
// // // // //           setOtherRiders(otherAccepted);
// // // // //         }
// // // // //       } else {
// // // // //         console.log('Failed to fetch passengers, status:', response.status);
// // // // //       }
// // // // //     } catch (error) {
// // // // //       console.log('Error fetching passengers:', error);
// // // // //     }
// // // // //   };

// // // // //   // Helper function to load driver profile
// // // // //   const loadDriverProfile = async (driverPhone, driverUserId) => {
// // // // //     if (!driverPhone && !driverUserId) return;
    
// // // // //     try {
// // // // //       const params = new URLSearchParams();
// // // // //       if (driverUserId) params.append('user_id', driverUserId);
// // // // //       else if (driverPhone) params.append('phone_number', driverPhone);
// // // // //       params.append('_t', Date.now());
      
// // // // //       const profileRes = await fetch(`${API_BASE_URL}/api/v1/users/profile-public?${params.toString()}`);
// // // // //       const profileData = await profileRes.json();
      
// // // // //       if (profileData?.success && profileData.user) {
// // // // //         setDriverProfile(profileData.user);
// // // // //       }
// // // // //     } catch (error) {
// // // // //       console.log('Error loading driver profile:', error);
// // // // //     }
// // // // //   };
  
// // // // //   // Check live session
// // // // //   const checkLiveSession = useCallback(async () => {
// // // // //     const rideId = currentRide?.id;
// // // // //     if (!rideId) return;
    
// // // // //     try {
// // // // //       const response = await fetch(`${API_BASE_URL}/ride/${rideId}/live-session`);
// // // // //       const data = await response.json();
// // // // //       if (data.success && data.session) {
// // // // //         setLiveSession(data.session);
// // // // //       }
// // // // //     } catch (error) {
// // // // //       console.log('Error checking live session:', error);
// // // // //     }
// // // // //   }, [currentRide?.id]);
  
// // // // //   // Check session status
// // // // //   const checkSessionStatus = useCallback(async () => {
// // // // //     const bookingId = userBooking?.id;
// // // // //     if (!bookingId) return;
    
// // // // //     try {
// // // // //       const res = await fetch(`${API_BASE_URL}/ride-session/rider/${bookingId}/status?rider_phone=${user?.phone_number}&_t=${Date.now()}`);
// // // // //       const data = await res.json();
      
// // // // //       if (data.ride_completed) {
// // // // //         setRideCompleted(true);
// // // // //         setHasRatedDriver(data.has_rated_driver);
// // // // //       }
// // // // //     } catch (error) {
// // // // //       console.log('Error checking session status:', error);
// // // // //     }
// // // // //   }, [userBooking?.id, user?.phone_number]);
  
// // // // //   // Get ride status
// // // // //   const getRideStatus = useCallback(() => {
// // // // //     if (rideCompleted) return 'completed';
// // // // //     if (!currentRide?.departure_time) return 'unknown';
// // // // //     if (currentRide?.cancellation_reason) {
// // // // //       if (currentRide.cancellation_reason.includes("Auto-cancelled")) return 'auto-cancelled';
// // // // //       return 'cancelled';
// // // // //     }
    
// // // // //     const now = new Date();
// // // // //     const departureTime = new Date(currentRide.departure_time);
// // // // //     const minutesToDeparture = (departureTime - now) / (1000 * 60);
// // // // //     const minutesSinceDeparture = (now - departureTime) / (1000 * 60);
    
// // // // //     if (currentRide?.started_at && !rideCompleted) return 'ongoing';
// // // // //     if (currentRide?.status === 'completed' || rideCompleted) return 'completed';
// // // // //     if (minutesSinceDeparture > 30) return 'expired';
// // // // //     if (minutesToDeparture <= 0 && minutesSinceDeparture <= 30) return 'late';
// // // // //     if (minutesToDeparture <= 15) return 'upcoming-soon';
// // // // //     if (minutesToDeparture > 15) return 'upcoming';
// // // // //     return 'unknown';
// // // // //   }, [currentRide?.departure_time, currentRide?.cancellation_reason, currentRide?.started_at, currentRide?.status, rideCompleted]);
  
// // // // //   const canModifySeats = useCallback(() => {
// // // // //     if (!userBooking) return false;
// // // // //     const rideStatus = getRideStatus();
// // // // //     if (rideCompleted) return false;
// // // // //     if (currentRide?.cancellation_reason || currentRide?.started_at) return false;
// // // // //     if (userBooking.status !== "accepted") return false;
// // // // //     if (['expired', 'auto-cancelled', 'upcoming-soon', 'late'].includes(rideStatus)) return false;
// // // // //     if (seatModificationRequested) return false;
// // // // //     return true;
// // // // //   }, [userBooking, getRideStatus, currentRide, seatModificationRequested, rideCompleted]);
  
// // // // //   const canCancelBooking = useCallback(() => {
// // // // //     if (!userBooking) return false;
// // // // //     const rideStatus = getRideStatus();
// // // // //     if (rideCompleted) return false;
// // // // //     if (currentRide?.cancellation_reason || currentRide?.started_at || currentRide?.status === 'completed') return false;
// // // // //     if (['expired', 'auto-cancelled', 'upcoming-soon', 'late'].includes(rideStatus)) return false;
// // // // //     if (!["accepted", "pending"].includes(userBooking.status)) return false;
// // // // //     return true;
// // // // //   }, [userBooking, getRideStatus, currentRide, rideCompleted]);
  
// // // // //   const getRideStatusMessage = useCallback(() => {
// // // // //     const rideStatus = getRideStatus();
// // // // //     const bookingStatus = userBooking?.status;
    
// // // // //     if (rideCompleted) {
// // // // //       return { message: "Ride completed", type: 'completed', icon: 'checkmark-done-circle', color: '#6B7280' };
// // // // //     }
// // // // //     if (currentRide?.cancellation_reason) {
// // // // //       return { message: currentRide.cancellation_reason, type: 'cancelled', icon: 'alert-circle', color: '#DC2626' };
// // // // //     }
// // // // //     if (bookingStatus === "rejected") {
// // // // //       return { message: "Your booking request was rejected", type: 'rejected', icon: 'close-circle', color: '#DC2626' };
// // // // //     }
// // // // //     if (bookingStatus === "pending") {
// // // // //       return { message: `Waiting for driver confirmation (${userBooking?.seats_requested} seat(s))`, type: 'pending', icon: 'time-outline', color: '#F59E0B' };
// // // // //     }
// // // // //     if (bookingStatus === "accepted") {
// // // // //       if (rideStatus === 'ongoing') return { message: "🚗 Ride in progress!", type: 'ongoing', icon: 'car-sport', color: '#10B981' };
// // // // //       if (rideStatus === 'upcoming') return { message: `Booking confirmed! ${userBooking?.seats_requested} seat(s)`, type: 'confirmed', icon: 'checkmark-circle', color: '#10B981' };
// // // // //     }
// // // // //     return null;
// // // // //   }, [getRideStatus, userBooking, currentRide, rideCompleted]);
  
// // // // //   // Actions
// // // // //   const handleModifySeats = async () => {
// // // // //     if (!userBooking || !canModifySeats()) {
// // // // //       showCustomAlert('Cannot Modify', 'Modifications are not available at this time.', 'warning');
// // // // //       return;
// // // // //     }
    
// // // // //     const currentSeatsBooked = userBooking.seats_requested || 0;
// // // // //     const otherBookedSeats = Math.max(0, totalBookedSeats - currentSeatsBooked);
// // // // //     const maxSeatsUserCanRequest = totalSeatsOffered - otherBookedSeats;
    
// // // // //     if (maxSeatsUserCanRequest <= 0) {
// // // // //       showCustomAlert('No Seats Available', 'No additional seats are available.', 'warning');
// // // // //       return;
// // // // //     }
// // // // //     if (seatsRequested > maxSeatsUserCanRequest) {
// // // // //       showCustomAlert('Not Enough Seats', `Only ${maxSeatsUserCanRequest} seat(s) available.`, 'warning');
// // // // //       return;
// // // // //     }
// // // // //     if (seatsRequested < 1) {
// // // // //       showCustomAlert('Invalid Seats', 'Minimum 1 seat required.', 'warning');
// // // // //       return;
// // // // //     }
// // // // //     if (seatsRequested === currentSeatsBooked) {
// // // // //       showCustomAlert('No Change', 'Seat count is already set to this value.', 'info');
// // // // //       return;
// // // // //     }
    
// // // // //     setModifyingSeats(true);
// // // // //     try {
// // // // //       const response = await fetch(`${API_BASE_URL}/api/v1/modifications/request/${userBooking.id}`, {
// // // // //         method: 'POST',
// // // // //         headers: { 'Content-Type': 'application/json' },
// // // // //         body: JSON.stringify({ requested_seats: seatsRequested }),
// // // // //       });
// // // // //       const data = await response.json();
// // // // //       if (!response.ok) throw new Error(data.detail || data.message);
      
// // // // //       showCustomAlert('Request Sent', `Request to change to ${seatsRequested} seat(s) sent.`, 'info');
// // // // //       setSeatModificationRequested(true);
// // // // //       setPendingSeatsRequest(seatsRequested);
// // // // //       await fetchModificationRequests();
// // // // //     } catch (error) {
// // // // //       showCustomAlert('Error', error.message, 'error');
// // // // //     } finally {
// // // // //       setModifyingSeats(false);
// // // // //     }
// // // // //   };
  
// // // // //   const handleCancelBooking = async () => {
// // // // //     if (!userBooking || !canCancelBooking()) return;
    
// // // // //     setModifyingSeats(true);
// // // // //     setCancelLoading(true);
// // // // //     try {
// // // // //       const response = await fetch(`${API_BASE_URL}/booking/${userBooking.id}/cancel`, {
// // // // //         method: 'PUT',
// // // // //         headers: { 'Content-Type': 'application/json' },
// // // // //       });
// // // // //       const data = await response.json();
// // // // //       if (!response.ok) throw new Error(data.detail || data.message);
      
// // // // //       showCustomAlert('Success', 'Booking cancelled successfully', 'success');
// // // // //       setTimeout(() => navigation.goBack(), 1500);
// // // // //     } catch (error) {
// // // // //       showCustomAlert('Error', error.message, 'error');
// // // // //     } finally {
// // // // //       setModifyingSeats(false);
// // // // //       setCancelLoading(false);
// // // // //       setShowCancelModal(false);
// // // // //     }
// // // // //   };
  
// // // // //   const handleRateDriver = async () => {
// // // // //     if (rating === 0) {
// // // // //       showCustomAlert('Rating Required', 'Please select a rating.', 'warning');
// // // // //       return;
// // // // //     }
    
// // // // //     setSubmitting(true);
// // // // //     setTimeout(() => {
// // // // //       showCustomAlert('Thank You!', 'Your rating has been submitted', 'success');
// // // // //       setHasRatedDriver(true);
// // // // //       setRatingModalVisible(false);
// // // // //       setRating(0);
// // // // //       setFeedback('');
// // // // //       setSubmitting(false);
// // // // //     }, 1000);
// // // // //   };
  
// // // // //   const viewDriverProfile = () => {
// // // // //     const driverPhone = currentRide?.phoneNumber || currentRide?.driver_phone;
// // // // //     const driverUserId = currentRide?.driverUserId || currentRide?.driver_user_id;
// // // // //     if (driverPhone || driverUserId) {
// // // // //       navigation.navigate('ViewProfileScreen', {
// // // // //         userId: driverUserId || null,
// // // // //         phoneNumber: driverPhone || null,
// // // // //         driverName: driverProfile?.full_name || currentRide?.driverName || 'Driver',
// // // // //         profilePicture: getProfilePhotoUrl(),
// // // // //       });
// // // // //     }
// // // // //   };
  
// // // // //   const shareRideDetails = async () => {
// // // // //     const message = `🚗 *Ride Details* 🚗\n\n` +
// // // // //       `From: ${currentRide?.from || currentRide?.origin || 'Pickup'}\n` +
// // // // //       `To: ${currentRide?.to || currentRide?.destination || 'Drop'}\n` +
// // // // //       `Date: ${formatDate(currentRide?.departure_time)}\n` +
// // // // //       `Price: ₹${currentRide?.price || currentRide?.price_per_seat || 0}/seat\n` +
// // // // //       `Seats: ${userBooking?.seats_requested || 1}\n` +
// // // // //       `Total: ₹${(currentRide?.price || currentRide?.price_per_seat || 0) * (userBooking?.seats_requested || 1)}\n\n` +
// // // // //       `Driver: ${driverProfile?.full_name || currentRide?.driverName || 'Driver'}`;
    
// // // // //     await Share.share({ message, title: 'Ride Details' });
// // // // //   };
  
// // // // //   const handleProfileImagePress = () => {
// // // // //     const photoUrl = getProfilePhotoUrl();
// // // // //     if (photoUrl) {
// // // // //       setSelectedProfile({ visible: true, imageUrl: photoUrl, driverName: driverProfile?.full_name || currentRide?.driverName || 'Driver' });
// // // // //     } else {
// // // // //       showCustomAlert('No Photo', 'Driver has not uploaded a profile picture', 'warning');
// // // // //     }
// // // // //   };
  
// // // // //   const renderStars = () => (
// // // // //     <View style={styles.starsRow}>
// // // // //       {[1, 2, 3, 4, 5].map((star) => (
// // // // //         <TouchableOpacity key={star} onPress={() => setRating(star)}>
// // // // //           <Ionicons name={star <= rating ? 'star' : 'star-outline'} size={32} color={star <= rating ? '#F59E0B' : '#D1D5DB'} style={{ marginHorizontal: 4 }} />
// // // // //         </TouchableOpacity>
// // // // //       ))}
// // // // //     </View>
// // // // //   );
  
// // // // //   // Effects
// // // // //   useEffect(() => {
// // // // //     if (currentRide) {
// // // // //       loadDriverData();
// // // // //       fetchSeatAvailability();
// // // // //       checkLiveSession();
// // // // //       checkSessionStatus();
// // // // //     }
// // // // //   }, [currentRide]);
  
// // // // //   useFocusEffect(
// // // // //     useCallback(() => {
// // // // //       if (currentRide) {
// // // // //         fetchSeatAvailability();
// // // // //         checkLiveSession();
// // // // //         checkSessionStatus();
// // // // //         fetchModificationRequests();
// // // // //       }
// // // // //       hasShownRatingModal.current = false;
// // // // //       return () => {
// // // // //         if (socketRef.current) {
// // // // //           socketRef.current.disconnect();
// // // // //           socketRef.current = null;
// // // // //         }
// // // // //       };
// // // // //     }, [currentRide])
// // // // //   );
  
// // // // //   // Memoized values for map
// // // // //   const profilePhotoUrl = getProfilePhotoUrl();
// // // // //   const avatarText = getDriverInitials(driverProfile?.full_name || currentRide?.driverName || 'Driver');
// // // // //   const isProfilePhotoSvg = profilePhotoUrl?.toLowerCase().includes('.svg');
// // // // //   const allPreferences = useMemo(() => extractAllPreferences(currentRide, driverProfile?.travel_preferences), [currentRide, driverProfile]);
  
// // // // //   const driverStart = useMemo(() => {
// // // // //     const coords = currentRide?.routeCoordinates;
// // // // //     if (Array.isArray(coords) && coords.length > 0) {
// // // // //       const first = coords[0];
// // // // //       if (Array.isArray(first) && first.length === 2) return { latitude: first[1], longitude: first[0] };
// // // // //     }
// // // // //     return parseSuggestedPoint(currentRide?.suggestedPickup || currentRide?.suggested_pickup_point);
// // // // //   }, [currentRide]);
  
// // // // //   const driverEnd = useMemo(() => {
// // // // //     const coords = currentRide?.routeCoordinates;
// // // // //     if (Array.isArray(coords) && coords.length > 0) {
// // // // //       const last = coords[coords.length - 1];
// // // // //       if (Array.isArray(last) && last.length === 2) return { latitude: last[1], longitude: last[0] };
// // // // //     }
// // // // //     return parseSuggestedPoint(currentRide?.suggestedDrop || currentRide?.suggested_drop_point);
// // // // //   }, [currentRide]);
  
// // // // //   const intersectionPickup = useMemo(() => parseSuggestedPoint(currentRide?.suggestedPickup || currentRide?.suggested_pickup_point), [currentRide]);
// // // // //   const intersectionDrop = useMemo(() => parseSuggestedPoint(currentRide?.suggestedDrop || currentRide?.suggested_drop_point), [currentRide]);
  
// // // // //   const routePath = useMemo(() => {
// // // // //     const fullRoute = parseRouteCoordinates(currentRide?.routeCoordinates);
// // // // //     if (fullRoute.length >= 2) return fullRoute;
// // // // //     if (intersectionPickup && intersectionDrop) return [intersectionPickup, intersectionDrop];
// // // // //     return [];
// // // // //   }, [currentRide, intersectionPickup, intersectionDrop]);
  
// // // // //   const allMarkerCoords = useMemo(() => {
// // // // //     const coords = [];
// // // // //     if (driverStart) coords.push(driverStart);
// // // // //     if (driverEnd) coords.push(driverEnd);
// // // // //     if (intersectionPickup) coords.push(intersectionPickup);
// // // // //     if (intersectionDrop) coords.push(intersectionDrop);
// // // // //     if (driverLocation) coords.push(driverLocation);
// // // // //     return coords;
// // // // //   }, [driverStart, driverEnd, intersectionPickup, intersectionDrop, driverLocation]);
  
// // // // //   const fitMapToMarkers = useCallback(() => {
// // // // //     if (mapRef.current && mapReady && allMarkerCoords.length >= 1) {
// // // // //       setTimeout(() => {
// // // // //         try {
// // // // //           if (allMarkerCoords.length === 1) {
// // // // //             mapRef.current.animateToRegion({
// // // // //               latitude: allMarkerCoords[0].latitude,
// // // // //               longitude: allMarkerCoords[0].longitude,
// // // // //               latitudeDelta: 0.01,
// // // // //               longitudeDelta: 0.01,
// // // // //             }, 500);
// // // // //           } else {
// // // // //             mapRef.current.fitToCoordinates(allMarkerCoords, {
// // // // //               edgePadding: { top: 80, right: 50, bottom: 50, left: 50 },
// // // // //               animated: true,
// // // // //             });
// // // // //           }
// // // // //         } catch (e) { console.log('fitToCoordinates error:', e); }
// // // // //       }, 500);
// // // // //     }
// // // // //   }, [mapReady, allMarkerCoords]);
  
// // // // //   useEffect(() => {
// // // // //     if (mapReady && allMarkerCoords.length >= 1) fitMapToMarkers();
// // // // //   }, [mapReady, allMarkerCoords, fitMapToMarkers]);
  
// // // // //   const vehicleName = driverProfile?.vehicle?.model || currentRide?.vehicle?.model || 'Vehicle details unavailable';
// // // // //   const vehicleRegNumber = driverProfile?.vehicle?.registration_number || currentRide?.vehicle?.registration_number;
// // // // //   const vehicleColor = driverProfile?.vehicle?.color || currentRide?.vehicle?.color || 'Not specified';
  
// // // // //   const rideStatus = getRideStatus();
// // // // //   const modificationsAllowed = canModifySeats();
// // // // //   const cancellationsAllowed = canCancelBooking();
// // // // //   const rideStatusMessage = getRideStatusMessage();
// // // // //   const isAutoCancelled = rideStatus === 'auto-cancelled' || rideStatus === 'expired';
// // // // //   const showLiveTracking = liveSession && (rideStatus === 'ongoing' || rideStatus === 'late') && !rideCompleted;
// // // // //   const isCompleted = rideStatus === 'completed';
  
// // // // //   const otherBookedSeats = totalBookedSeats - (userBooking?.seats_requested || 0);
// // // // //   const maxUserCanRequest = totalSeatsOffered - otherBookedSeats;
// // // // //   const totalAmountPaid = (currentRide?.price || currentRide?.price_per_seat || 0) * (userBooking?.seats_requested || 1);
  
// // // // //   const initialRegion = {
// // // // //     latitude: intersectionPickup?.latitude || driverStart?.latitude || 28.6139,
// // // // //     longitude: intersectionPickup?.longitude || driverStart?.longitude || 77.2090,
// // // // //     latitudeDelta: 0.05,
// // // // //     longitudeDelta: 0.05,
// // // // //   };
  
// // // // //   if (!currentRide) {
// // // // //     return (
// // // // //       <View style={styles.loaderContainer}>
// // // // //         <Text style={{ fontSize: 16, color: Colors.gray, marginBottom: 20 }}>No ride data available</Text>
// // // // //         <TouchableOpacity onPress={() => navigation.goBack()} style={{ padding: 12, backgroundColor: Colors.primary, borderRadius: 8 }}>
// // // // //           <Text style={{ color: '#fff' }}>Go Back</Text>
// // // // //         </TouchableOpacity>
// // // // //       </View>
// // // // //     );
// // // // //   }
  
// // // // //   // Main render
// // // // //   return (
// // // // //     <View style={styles.container}>
// // // // //       <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />
      
// // // // //       <Animated.View style={[styles.mapContainer, { height: mapHeight }]}>
// // // // //         <MapView
// // // // //           ref={mapRef}
// // // // //           provider={PROVIDER_GOOGLE}
// // // // //           style={styles.map}
// // // // //           initialRegion={initialRegion}
// // // // //           onMapReady={() => setMapReady(true)}
// // // // //           showsUserLocation={true}
// // // // //           showsMyLocationButton={true}
// // // // //         >
// // // // //           {routePath.length >= 2 && <Polyline coordinates={routePath} strokeColor="#2457A6" strokeWidth={5} lineCap="round" lineJoin="round" />}
          
// // // // //           {driverStart && (
// // // // //             <Marker coordinate={driverStart} anchor={{ x: 0.5, y: 1 }}>
// // // // //               <View style={styles.markerWrapper}>
// // // // //                 <View style={[styles.pinBubble, { backgroundColor: '#16A34A' }]}><Text style={styles.pinIcon}>S</Text></View>
// // // // //                 <View style={[styles.pinPointer, { borderTopColor: '#16A34A' }]} />
// // // // //               </View>
// // // // //             </Marker>
// // // // //           )}
          
// // // // //           {driverEnd && (
// // // // //             <Marker coordinate={driverEnd} anchor={{ x: 0.5, y: 1 }}>
// // // // //               <View style={styles.markerWrapper}>
// // // // //                 <View style={[styles.pinBubble, { backgroundColor: '#DC2626' }]}><Text style={styles.pinIcon}>E</Text></View>
// // // // //                 <View style={[styles.pinPointer, { borderTopColor: '#DC2626' }]} />
// // // // //               </View>
// // // // //             </Marker>
// // // // //           )}
          
// // // // //           {intersectionPickup && (
// // // // //             <Marker coordinate={intersectionPickup} anchor={{ x: 0.5, y: 1 }}>
// // // // //               <View style={styles.markerWrapper}>
// // // // //                 <View style={[styles.pinBubble, { backgroundColor: '#FACC15' }]}><Ionicons name="hand-right" size={12} color="#713F12" /></View>
// // // // //                 <View style={[styles.pinPointer, { borderTopColor: '#FACC15' }]} />
// // // // //                 <View style={styles.pinLabelBubbleYellow}><Text style={styles.pinLabelTextYellow}>Meet Driver</Text></View>
// // // // //               </View>
// // // // //             </Marker>
// // // // //           )}
          
// // // // //           {intersectionDrop && (
// // // // //             <Marker coordinate={intersectionDrop} anchor={{ x: 0.5, y: 1 }}>
// // // // //               <View style={styles.markerWrapper}>
// // // // //                 <View style={[styles.pinBubble, { backgroundColor: '#FACC15' }]}><Ionicons name="exit" size={12} color="#713F12" /></View>
// // // // //                 <View style={[styles.pinPointer, { borderTopColor: '#FACC15' }]} />
// // // // //                 <View style={styles.pinLabelBubbleYellow}><Text style={styles.pinLabelTextYellow}>Exit Here</Text></View>
// // // // //               </View>
// // // // //             </Marker>
// // // // //           )}
// // // // //         </MapView>
        
// // // // //         <TouchableOpacity style={styles.mapBackButton} onPress={() => navigation.goBack()}>
// // // // //           <Ionicons name="chevron-back" size={26} color={Colors.secondary} />
// // // // //         </TouchableOpacity>
        
// // // // //         {showLiveTracking && (
// // // // //           <TouchableOpacity style={styles.liveTrackingButton} onPress={() => navigation.navigate('OngoingRideRiderScreen', { bookingId: userBooking?.id, sessionId: liveSession?.session_id })}>
// // // // //             <View style={styles.liveDot} />
// // // // //             <Text style={styles.liveTrackingButtonText}>Track Live Ride</Text>
// // // // //           </TouchableOpacity>
// // // // //         )}
// // // // //       </Animated.View>
      
// // // // //       <Animated.View style={[styles.drawer, { height: drawerHeight }]}>
// // // // //         <View style={styles.handleWrap} {...panResponder.panHandlers}>
// // // // //           <TouchableOpacity activeOpacity={0.9} onPress={toggleDrawer} style={styles.handleHitArea}>
// // // // //             <View style={styles.handleBar} />
// // // // //           </TouchableOpacity>
// // // // //         </View>
        
// // // // //         {!drawerExpanded ? (
// // // // //           <View style={styles.collapsedSummary}>
// // // // //             <View style={styles.collapsedTopRow}>
// // // // //               <View style={{ flex: 1 }}>
// // // // //                 <Text style={styles.collapsedDriver} numberOfLines={1}>{driverProfile?.full_name || currentRide?.driverName || 'Driver'}</Text>
// // // // //                 <Text style={styles.collapsedSub} numberOfLines={1}>{currentRide?.from || currentRide?.origin || 'Pickup'} → {currentRide?.to || currentRide?.destination || 'Drop'}</Text>
// // // // //               </View>
// // // // //               <View style={styles.collapsedPriceWrap}>
// // // // //                 <Text style={styles.collapsedPrice}>₹{currentRide?.price || currentRide?.price_per_seat || 0}</Text>
// // // // //                 <Text style={styles.collapsedPerSeat}>per seat</Text>
// // // // //               </View>
// // // // //             </View>
// // // // //           </View>
// // // // //         ) : (
// // // // //           <ScrollView style={styles.drawerScroll} contentContainerStyle={styles.drawerContent}>
// // // // //             {/* Status Banner */}
// // // // //             {rideStatusMessage && (
// // // // //               <View style={[styles.statusBanner, { backgroundColor: rideStatusMessage.color + '20' }]}>
// // // // //                 <Ionicons name={rideStatusMessage.icon} size={20} color={rideStatusMessage.color} />
// // // // //                 <Text style={[styles.statusBannerText, { color: rideStatusMessage.color, flex: 1 }]}>{rideStatusMessage.message}</Text>
// // // // //               </View>
// // // // //             )}
            
// // // // //             {/* Driver Card */}
// // // // //             <View style={styles.driverCard}>
// // // // //               <View style={styles.driverTopRow}>
// // // // //                 <View style={styles.driverLeftWrap}>
// // // // //                   <TouchableOpacity style={styles.driverAvatar} onPress={handleProfileImagePress}>
// // // // //                     {profilePhotoUrl ? (
// // // // //                       isProfilePhotoSvg ? (
// // // // //                         <View style={styles.svgAvatarContainer}><SvgCssUri uri={profilePhotoUrl} width={56} height={56} /></View>
// // // // //                       ) : (
// // // // //                         <Image source={{ uri: profilePhotoUrl }} style={styles.avatarImg} />
// // // // //                       )
// // // // //                     ) : (
// // // // //                       <View style={styles.avatarPlaceholder}>
// // // // //                         <Text style={styles.avatarText}>{avatarText}</Text>
// // // // //                       </View>
// // // // //                     )}
// // // // //                   </TouchableOpacity>
// // // // //                   <View style={styles.driverMeta}>
// // // // //                     <View style={styles.driverNameRow}>
// // // // //                       <Text style={styles.driverName}>{driverProfile?.full_name || currentRide?.driverName || 'Driver'}</Text>
// // // // //                       {isVerified && <Ionicons name="checkmark-circle" size={14} color="#2457A6" />}
// // // // //                     </View>
// // // // //                     <View style={styles.ratingRow}>
// // // // //                       <Ionicons name="star" size={13} color="#F59E0B" />
// // // // //                       <Text style={styles.ratingText}>{driverProfile?.avg_rating || currentRide?.rating || 4.5}</Text>
// // // // //                     </View>
// // // // //                   </View>
// // // // //                 </View>
// // // // //               </View>
// // // // //               <TouchableOpacity style={styles.profileOutlineBtn} onPress={viewDriverProfile}>
// // // // //                 <Text style={styles.profileOutlineBtnText}>View Full Profile</Text>
// // // // //               </TouchableOpacity>
// // // // //             </View>
            
// // // // //             {/* Trip Details Section */}
// // // // //             <View style={styles.cardSection}>
// // // // //               <Text style={styles.sectionTitle}>📍 Trip Details</Text>
              
// // // // //               <View style={styles.tripItem}>
// // // // //                 <View style={styles.tripIconContainer}>
// // // // //                   <Ionicons name="location" size={20} color="#16A34A" />
// // // // //                 </View>
// // // // //                 <View style={styles.tripDetails}>
// // // // //                   <Text style={styles.tripLabel}>From</Text>
// // // // //                   <Text style={styles.tripValue}>{currentRide?.from || currentRide?.origin || 'Pickup location'}</Text>
// // // // //                 </View>
// // // // //               </View>
              
// // // // //               <View style={styles.tripDivider} />
              
// // // // //               <View style={styles.tripItem}>
// // // // //                 <View style={styles.tripIconContainer}>
// // // // //                   <Ionicons name="flag" size={20} color="#DC2626" />
// // // // //                 </View>
// // // // //                 <View style={styles.tripDetails}>
// // // // //                   <Text style={styles.tripLabel}>To</Text>
// // // // //                   <Text style={styles.tripValue}>{currentRide?.to || currentRide?.destination || 'Drop location'}</Text>
// // // // //                 </View>
// // // // //               </View>
              
// // // // //               <View style={styles.tripMetaRow}>
// // // // //                 <View style={styles.tripMetaItem}>
// // // // //                   <Ionicons name="calendar-outline" size={16} color={Colors.gray} />
// // // // //                   <Text style={styles.tripMetaText}>{formatDate(currentRide?.departure_time)}</Text>
// // // // //                 </View>
// // // // //                 {currentRide?.distance_km && (
// // // // //                   <View style={styles.tripMetaItem}>
// // // // //                     <Ionicons name="map-outline" size={16} color={Colors.gray} />
// // // // //                     <Text style={styles.tripMetaText}>{currentRide.distance_km} km</Text>
// // // // //                   </View>
// // // // //                 )}
// // // // //                 {currentRide?.duration_text && (
// // // // //                   <View style={styles.tripMetaItem}>
// // // // //                     <Ionicons name="time-outline" size={16} color={Colors.gray} />
// // // // //                     <Text style={styles.tripMetaText}>{currentRide.duration_text}</Text>
// // // // //                   </View>
// // // // //                 )}
// // // // //               </View>
// // // // //             </View>
            
// // // // //             {/* Vehicle Details Section */}
// // // // //             <View style={styles.cardSection}>
// // // // //               <Text style={styles.sectionTitle}>🚗 Vehicle Details</Text>
// // // // //               <View style={styles.vehicleDetailRow}>
// // // // //                 <Ionicons name="car-sport-outline" size={24} color="#2457A6" />
// // // // //                 <View style={styles.vehicleDetailInfo}>
// // // // //                   <Text style={styles.vehicleDetailName}>{vehicleName}</Text>
// // // // //                   <Text style={styles.vehicleDetailColor}>Color: {vehicleColor}</Text>
// // // // //                   {vehicleRegNumber && <Text style={styles.vehicleDetailReg}>Registration: {vehicleRegNumber}</Text>}
// // // // //                   <Text style={styles.vehicleDetailSeats}>Total Seats: {totalSeatsOffered}</Text>
// // // // //                 </View>
// // // // //               </View>
// // // // //             </View>
            
// // // // //             {/* Seat Availability Section */}
// // // // //             <View style={styles.cardSection}>
// // // // //               <Text style={styles.sectionTitle}>💺 Seat Availability</Text>
// // // // //               <View style={styles.seatStatsRow}>
// // // // //                 <View style={styles.seatStat}>
// // // // //                   <Text style={styles.seatStatValue}>{totalSeatsOffered}</Text>
// // // // //                   <Text style={styles.seatStatLabel}>Total Seats</Text>
// // // // //                 </View>
// // // // //                 <View style={styles.seatStat}>
// // // // //                   <Text style={[styles.seatStatValue, { color: '#10B981' }]}>{totalBookedSeats}</Text>
// // // // //                   <Text style={styles.seatStatLabel}>Booked</Text>
// // // // //                 </View>
// // // // //                 <View style={styles.seatStat}>
// // // // //                   <Text style={[styles.seatStatValue, { color: '#F59E0B' }]}>{availableSeats}</Text>
// // // // //                   <Text style={styles.seatStatLabel}>Available</Text>
// // // // //                 </View>
// // // // //               </View>
// // // // //               <View style={styles.seatProgressContainer}>
// // // // //                 <View style={[styles.seatProgressBar, { width: `${totalSeatsOffered > 0 ? (totalBookedSeats / totalSeatsOffered) * 100 : 0}%` }]} />
// // // // //               </View>
// // // // //             </View>
            
// // // // //             {/* Ride Preferences Section */}
// // // // //             {allPreferences.length > 0 && (
// // // // //               <View style={styles.cardSection}>
// // // // //                 <Text style={styles.sectionTitle}>🎯 Ride Preferences</Text>
// // // // //                 <View style={styles.tagRow}>
// // // // //                   {allPreferences.map((pref, index) => (
// // // // //                     <GenericPreferenceTag key={`${pref}-${index}`} label={pref} />
// // // // //                   ))}
// // // // //                 </View>
// // // // //               </View>
// // // // //             )}
            
// // // // //             {/* Booking Details Section */}
// // // // //             <View style={styles.cardSection}>
// // // // //               <Text style={styles.sectionTitle}>📋 Your Booking</Text>
              
// // // // //               {userBooking ? (
// // // // //                 <>
// // // // //                   <View style={styles.bookingDetailRow}>
// // // // //                     <Text style={styles.bookingDetailLabel}>Booking ID</Text>
// // // // //                     <Text style={styles.bookingDetailValue}>#{userBooking.id}</Text>
// // // // //                   </View>
// // // // //                   <View style={styles.bookingDetailRow}>
// // // // //                     <Text style={styles.bookingDetailLabel}>Seats Booked</Text>
// // // // //                     <Text style={styles.bookingDetailValue}>{userBooking.seats_requested}</Text>
// // // // //                   </View>
// // // // //                   <View style={styles.bookingDetailRow}>
// // // // //                     <Text style={styles.bookingDetailLabel}>Price per Seat</Text>
// // // // //                     <Text style={styles.bookingDetailValue}>₹{currentRide?.price || currentRide?.price_per_seat || 0}</Text>
// // // // //                   </View>
// // // // //                   <View style={[styles.bookingDetailRow, styles.bookingTotalRow]}>
// // // // //                     <Text style={styles.bookingTotalLabel}>Total Amount</Text>
// // // // //                     <Text style={styles.bookingTotalValue}>₹{totalAmountPaid}</Text>
// // // // //                   </View>
// // // // //                   <View style={styles.bookingDetailRow}>
// // // // //                     <Text style={styles.bookingDetailLabel}>Status</Text>
// // // // //                     <View style={[styles.bookingStatusBadge, { backgroundColor: userBooking.status === 'accepted' ? '#10B98120' : userBooking.status === 'pending' ? '#F59E0B20' : '#EF444420' }]}>
// // // // //                       <Text style={[styles.bookingStatusText, { color: userBooking.status === 'accepted' ? '#10B981' : userBooking.status === 'pending' ? '#F59E0B' : '#EF4444' }]}>
// // // // //                         {userBooking.status === 'accepted' ? 'Confirmed' : userBooking.status === 'pending' ? 'Pending' : userBooking.status}
// // // // //                       </Text>
// // // // //                     </View>
// // // // //                   </View>
// // // // //                 </>
// // // // //               ) : (
// // // // //                 <Text style={styles.emptyText}>No booking information available</Text>
// // // // //               )}
              
// // // // //               {/* Pending Modification Request Section */}
// // // // //               {pendingModificationRequest && pendingModificationRequest.status === 'pending' && (
// // // // //                 <>
// // // // //                   <View style={styles.divider} />
// // // // //                   <View style={styles.pendingModificationHeader}>
// // // // //                     <Ionicons name="time-outline" size={24} color="#F59E0B" />
// // // // //                     <Text style={styles.pendingModificationTitle}>Pending Modification Request</Text>
// // // // //                   </View>
                  
// // // // //                   <View style={styles.pendingModificationDetails}>
// // // // //                     <View style={styles.modificationDetailRow}>
// // // // //                       <Text style={styles.modificationDetailLabel}>Current Seats:</Text>
// // // // //                       <Text style={styles.modificationDetailValue}>{pendingModificationRequest.current_seats || userBooking?.seats_requested}</Text>
// // // // //                     </View>
// // // // //                     <View style={styles.modificationDetailRow}>
// // // // //                       <Text style={styles.modificationDetailLabel}>Requested Seats:</Text>
// // // // //                       <Text style={[styles.modificationDetailValue, { color: '#F59E0B', fontWeight: '800' }]}>
// // // // //                         {pendingModificationRequest.requested_seats || pendingSeatsRequest}
// // // // //                       </Text>
// // // // //                     </View>
// // // // //                     <View style={styles.modificationDetailRow}>
// // // // //                       <Text style={styles.modificationDetailLabel}>Status:</Text>
// // // // //                       <View style={[styles.pendingBadge, { backgroundColor: '#FEF3C7' }]}>
// // // // //                         <Text style={[styles.pendingBadgeText, { color: '#D97706' }]}>Waiting for Driver Approval</Text>
// // // // //                       </View>
// // // // //                     </View>
// // // // //                     {pendingModificationRequest.created_at && (
// // // // //                       <Text style={styles.modificationDate}>
// // // // //                         Requested on: {new Date(pendingModificationRequest.created_at).toLocaleString()}
// // // // //                       </Text>
// // // // //                     )}
// // // // //                   </View>
                  
// // // // //                   <TouchableOpacity 
// // // // //                     style={styles.cancelModificationBtn}
// // // // //                     onPress={handleCancelModificationRequest}
// // // // //                     disabled={modifyingSeats}
// // // // //                   >
// // // // //                     <Text style={styles.cancelModificationBtnText}>
// // // // //                       {modifyingSeats ? 'Cancelling...' : 'Cancel Request'}
// // // // //                     </Text>
// // // // //                   </TouchableOpacity>
// // // // //                 </>
// // // // //               )}
              
// // // // //               {/* Modify Seats Section - Only show if no pending modification */}
// // // // //               {modificationsAllowed && userBooking?.status === "accepted" && !isAutoCancelled && totalSeatsOffered > 0 && !seatModificationRequested && (
// // // // //                 <>
// // // // //                   <View style={styles.divider} />
// // // // //                   <Text style={styles.sectionSubtitle}>Modify Seats</Text>
                  
// // // // //                   {otherBookedSeats > 0 && (
// // // // //                     <View style={styles.otherBookedInfo}>
// // // // //                       <Ionicons name="information-circle" size={14} color="#F59E0B" />
// // // // //                       <Text style={styles.otherBookedInfoText}>{otherBookedSeats} seat(s) booked by others</Text>
// // // // //                     </View>
// // // // //                   )}
                  
// // // // //                   <View style={styles.seatSelectorRow}>
// // // // //                     <TouchableOpacity style={[styles.seatActionBtn, seatsRequested === 1 && styles.seatActionBtnDisabled]} onPress={() => setSeatsRequested(Math.max(1, seatsRequested - 1))} disabled={seatsRequested === 1 || modifyingSeats}>
// // // // //                       <Ionicons name="remove" size={20} color={seatsRequested === 1 ? Colors.gray : Colors.dark} />
// // // // //                     </TouchableOpacity>
// // // // //                     <View style={styles.seatCountWrap}>
// // // // //                       <Text style={styles.seatCountText}>{seatsRequested}</Text>
// // // // //                       <Text style={styles.seatAvailableText}>/ {maxUserCanRequest} max</Text>
// // // // //                     </View>
// // // // //                     <TouchableOpacity style={[styles.seatActionBtn, seatsRequested >= maxUserCanRequest && styles.seatActionBtnDisabled]} onPress={() => setSeatsRequested(Math.min(maxUserCanRequest, seatsRequested + 1))} disabled={seatsRequested >= maxUserCanRequest || modifyingSeats}>
// // // // //                       <Ionicons name="add" size={20} color={seatsRequested >= maxUserCanRequest ? Colors.gray : "#2457A6"} />
// // // // //                     </TouchableOpacity>
// // // // //                   </View>
                  
// // // // //                   <TouchableOpacity style={[styles.updateSeatsBtn, (modifyingSeats || seatsRequested === userBooking?.seats_requested) && styles.updateSeatsBtnDisabled]} onPress={handleModifySeats} disabled={modifyingSeats || seatsRequested === userBooking?.seats_requested}>
// // // // //                     <Text style={styles.updateSeatsBtnText}>{modifyingSeats ? 'Sending...' : 'Request Seat Change'}</Text>
// // // // //                   </TouchableOpacity>
// // // // //                 </>
// // // // //               )}
              
// // // // //               {/* Cancel Booking Button */}
// // // // //               {cancellationsAllowed && userBooking?.status !== "rejected" && !isAutoCancelled && (
// // // // //                 <TouchableOpacity style={[styles.cancelBookingBtn, (modifyingSeats || cancelLoading) && styles.cancelBookingBtnDisabled]} onPress={() => setShowCancelModal(true)} disabled={modifyingSeats || cancelLoading}>
// // // // //                   <Text style={styles.cancelBookingBtnText}>{userBooking?.status === "pending" ? "Cancel Request" : "Cancel Booking"}</Text>
// // // // //                 </TouchableOpacity>
// // // // //               )}
// // // // //             </View>
            
// // // // //             {/* Other Riders Section */}
// // // // //             <View style={styles.cardSection}>
// // // // //               <Text style={styles.sectionTitle}>👥 Other Riders ({otherRiders.length})</Text>
// // // // //               {otherRiders.length === 0 ? (
// // // // //                 <View style={styles.noRidersContainer}>
// // // // //                   <Ionicons name="people-outline" size={40} color={Colors.gray} />
// // // // //                   <Text style={styles.noRidersText}>No other riders yet</Text>
// // // // //                 </View>
// // // // //               ) : (
// // // // //                 otherRiders.map((rider, index) => (
// // // // //                   <View key={rider.booking_id || index} style={styles.otherRiderItem}>
// // // // //                     <View style={styles.otherRiderAvatar}>
// // // // //                       {rider.profile_picture ? (
// // // // //                         <Image source={{ uri: buildImageUrl(rider.profile_picture) }} style={styles.otherRiderAvatarImg} />
// // // // //                       ) : (
// // // // //                         <View style={styles.otherRiderAvatarPlaceholder}>
// // // // //                           <Text style={styles.otherRiderAvatarText}>{getDriverInitials(rider.passenger_name)}</Text>
// // // // //                         </View>
// // // // //                       )}
// // // // //                     </View>
// // // // //                     <View style={styles.otherRiderInfo}>
// // // // //                       <Text style={styles.otherRiderName}>{rider.passenger_name || 'Rider'}</Text>
// // // // //                       <Text style={styles.otherRiderSeats}>{rider.seats_booked || 1} seat(s)</Text>
// // // // //                     </View>
// // // // //                   </View>
// // // // //                 ))
// // // // //               )}
// // // // //             </View>
            
// // // // //             {/* Safety Card */}
// // // // //             <View style={styles.safetyCard}>
// // // // //               <Ionicons name="shield-checkmark-outline" size={18} color="#2457A6" />
// // // // //               <View>
// // // // //                 <Text style={styles.safetyTitle}>Safety First</Text>
// // // // //                 <Text style={styles.safetySub}>Live GPS tracking & 24/7 support available</Text>
// // // // //               </View>
// // // // //             </View>
            
// // // // //             <View style={{ height: 40 }} />
// // // // //           </ScrollView>
// // // // //         )}
// // // // //       </Animated.View>
      
// // // // //       {/* Cancel Modal */}
// // // // //       <Modal visible={showCancelModal} transparent animationType="fade" onRequestClose={() => setShowCancelModal(false)}>
// // // // //         <View style={styles.modalBackdrop}>
// // // // //           <View style={styles.confirmModalContent}>
// // // // //             <Ionicons name="alert-circle" size={40} color="#F59E0B" />
// // // // //             <Text style={styles.confirmModalTitle}>{userBooking?.status === "pending" ? "Cancel Request?" : "Cancel Booking?"}</Text>
// // // // //             <Text style={styles.confirmModalMessage}>
// // // // //               {userBooking?.status === "pending" 
// // // // //                 ? "Are you sure you want to cancel your booking request?"
// // // // //                 : "Are you sure you want to cancel your booking? This cannot be undone."}
// // // // //             </Text>
// // // // //             <View style={styles.confirmModalButtons}>
// // // // //               <TouchableOpacity style={[styles.confirmModalBtn, styles.confirmModalCancelBtn]} onPress={() => setShowCancelModal(false)}>
// // // // //                 <Text style={styles.confirmModalCancelBtnText}>Keep</Text>
// // // // //               </TouchableOpacity>
// // // // //               <TouchableOpacity style={[styles.confirmModalBtn, styles.confirmModalConfirmBtn]} onPress={handleCancelBooking}>
// // // // //                 <Text style={styles.confirmModalConfirmBtnText}>Cancel</Text>
// // // // //               </TouchableOpacity>
// // // // //             </View>
// // // // //           </View>
// // // // //         </View>
// // // // //       </Modal>
      
// // // // //       {/* Rating Modal */}
// // // // //       <Modal visible={ratingModalVisible} transparent animationType="fade" onRequestClose={() => setRatingModalVisible(false)}>
// // // // //         <View style={styles.modalBackdrop}>
// // // // //           <View style={styles.modalCard}>
// // // // //             <Text style={styles.modalTitle}>Rate Your Driver</Text>
// // // // //             <Text style={styles.modalSub}>How was your ride with {driverProfile?.full_name?.split(' ')[0] || 'the driver'}?</Text>
// // // // //             {renderStars()}
// // // // //             <TextInput
// // // // //               value={feedback}
// // // // //               onChangeText={setFeedback}
// // // // //               placeholder="Share your feedback (optional)"
// // // // //               multiline
// // // // //               numberOfLines={3}
// // // // //               style={styles.feedbackInput}
// // // // //               textAlignVertical="top"
// // // // //             />
// // // // //             <View style={styles.modalActions}>
// // // // //               <TouchableOpacity style={styles.skipBtn} onPress={() => setRatingModalVisible(false)}>
// // // // //                 <Text style={styles.skipBtnText}>Cancel</Text>
// // // // //               </TouchableOpacity>
// // // // //               <TouchableOpacity style={[styles.submitBtn, (rating === 0 || submitting) && { opacity: 0.5 }]} onPress={handleRateDriver} disabled={rating === 0 || submitting}>
// // // // //                 <Text style={styles.submitBtnText}>{submitting ? 'Submitting...' : 'Submit Rating'}</Text>
// // // // //               </TouchableOpacity>
// // // // //             </View>
// // // // //           </View>
// // // // //         </View>
// // // // //       </Modal>
      
// // // // //       <ProfileImageModal visible={selectedProfile.visible} imageUrl={selectedProfile.imageUrl} driverName={selectedProfile.driverName} onClose={() => setSelectedProfile({ visible: false, imageUrl: null, driverName: '' })} />
// // // // //       <CustomAlert visible={alertVisible} title={alertConfig.title} message={alertConfig.message} icon={alertConfig.icon} iconColor={alertConfig.iconColor} buttons={alertConfig.buttons} onBackdropPress={() => setAlertVisible(false)} />
// // // // //     </View>
// // // // //   );
// // // // // }

// // // // // // ============================================
// // // // // // STYLES
// // // // // // ============================================

// // // // // const styles = StyleSheet.create({
// // // // //   container: { flex: 1, backgroundColor: '#F4F5F7' },
// // // // //   mapContainer: { width: '100%', overflow: 'hidden', backgroundColor: '#E8EEF7' },
// // // // //   map: { flex: 1, backgroundColor: '#E8EEF7' },
// // // // //   mapBackButton: { position: 'absolute', top: Platform.OS === 'ios' ? 54 : 22, left: 14, width: 42, height: 42, borderRadius: 25, backgroundColor: 'rgba(255,255,255,0.96)', alignItems: 'center', justifyContent: 'center', shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4, elevation: 3 },
// // // // //   liveTrackingButton: { position: 'absolute', bottom: 20, left: 20, right: 20, backgroundColor: '#10B981', flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 14, borderRadius: 12, gap: 8, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.25, shadowRadius: 4, elevation: 5 },
// // // // //   liveTrackingButtonText: { color: '#fff', fontWeight: '700', fontSize: 14 },
// // // // //   liveDot: { width: 10, height: 10, borderRadius: 5, backgroundColor: '#fff', marginRight: 6 },
// // // // //   markerWrapper: { alignItems: 'center' },
// // // // //   pinBubble: { width: 28, height: 28, borderRadius: 14, borderWidth: 3, borderColor: 'white', alignItems: 'center', justifyContent: 'center', shadowColor: '#000', shadowOffset: { width: 0, height: 3 }, shadowOpacity: 0.25, shadowRadius: 4, elevation: 5 },
// // // // //   pinPointer: { width: 0, height: 0, backgroundColor: 'transparent', borderStyle: 'solid', borderLeftWidth: 7, borderRightWidth: 7, borderTopWidth: 10, borderLeftColor: 'transparent', borderRightColor: 'transparent', marginTop: -2 },
// // // // //   pinIcon: { fontSize: 14, fontWeight: '800', color: 'white', textAlign: 'center', lineHeight: 18 },
// // // // //   pinLabelBubbleYellow: { backgroundColor: 'rgba(113, 63, 18, 0.9)', borderRadius: 8, paddingHorizontal: 8, paddingVertical: 3, marginTop: 4 },
// // // // //   pinLabelTextYellow: { color: '#FACC15', fontSize: 10, fontWeight: '700' },
// // // // //   drawer: { position: 'absolute', bottom: 0, left: 0, right: 0, backgroundColor: '#F4F5F7', borderTopLeftRadius: 28, borderTopRightRadius: 28, overflow: 'hidden', shadowColor: '#000', shadowOffset: { width: 0, height: -2 }, shadowOpacity: 0.1, shadowRadius: 8, elevation: 10 },
// // // // //   handleWrap: { alignItems: 'center', paddingTop: 10, paddingBottom: 8, backgroundColor: '#F4F5F7', position: 'relative' },
// // // // //   handleHitArea: { paddingHorizontal: 40, paddingVertical: 10, alignItems: 'center', justifyContent: 'center' },
// // // // //   handleBar: { width: 64, height: 6, borderRadius: 99, backgroundColor: '#CDD2D8' },
// // // // //   collapsedSummary: { paddingHorizontal: 16, paddingTop: 4, paddingBottom: 12 },
// // // // //   collapsedTopRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: 12 },
// // // // //   collapsedDriver: { fontSize: 16, fontWeight: '800', color: Colors.dark },
// // // // //   collapsedSub: { marginTop: 2, fontSize: 12, color: Colors.gray, fontWeight: '600' },
// // // // //   collapsedPriceWrap: { alignItems: 'flex-end' },
// // // // //   collapsedPrice: { fontSize: 18, fontWeight: '900', color: Colors.dark },
// // // // //   collapsedPerSeat: { fontSize: 10, color: Colors.gray, fontWeight: '600' },
// // // // //   drawerScroll: { flex: 1 },
// // // // //   drawerContent: { paddingHorizontal: 16, paddingBottom: 16 },
// // // // //   statusBanner: { flexDirection: 'row', alignItems: 'center', padding: 12, borderRadius: 12, marginBottom: 14, gap: 8 },
// // // // //   statusBannerText: { fontSize: 13, fontWeight: '700', flex: 1 },
// // // // //   driverCard: { backgroundColor: 'white', borderRadius: 20, padding: 16, marginBottom: 14, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 8, elevation: 2 },
// // // // //   driverTopRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
// // // // //   driverLeftWrap: { flexDirection: 'row', flex: 1, paddingRight: 10 },
// // // // //   driverAvatar: { width: 56, height: 56, borderRadius: 28, backgroundColor: '#E5E7EB', overflow: 'hidden', alignItems: 'center', justifyContent: 'center', marginRight: 12 },
// // // // //   avatarImg: { width: 56, height: 56, borderRadius: 28, resizeMode: 'cover' },
// // // // //   avatarText: { fontSize: 15, fontWeight: '800', color: Colors.gray },
// // // // //   avatarPlaceholder: { width: 56, height: 56, borderRadius: 28, backgroundColor: '#E5E7EB', alignItems: 'center', justifyContent: 'center' },
// // // // //   svgAvatarContainer: { width: 56, height: 56, borderRadius: 28, overflow: 'hidden', alignItems: 'center', justifyContent: 'center', backgroundColor: '#E5E7EB' },
// // // // //   driverMeta: { flex: 1 },
// // // // //   driverNameRow: { flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap', gap: 6 },
// // // // //   driverName: { fontSize: 17, fontWeight: '800', color: Colors.dark },
// // // // //   ratingRow: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 6 },
// // // // //   ratingText: { fontSize: 13, color: Colors.dark, fontWeight: '700' },
// // // // //   profileOutlineBtn: { marginTop: 14, borderWidth: 1, borderColor: '#2457A6', borderRadius: 16, paddingVertical: 12, alignItems: 'center' },
// // // // //   profileOutlineBtnText: { color: '#2457A6', fontWeight: '700', fontSize: 14 },
// // // // //   cardSection: { backgroundColor: 'white', borderRadius: 20, padding: 16, marginBottom: 14, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 8, elevation: 2 },
// // // // //   sectionTitle: { fontSize: 16, fontWeight: '800', color: Colors.dark, marginBottom: 14 },
// // // // //   sectionSubtitle: { fontSize: 14, fontWeight: '600', color: Colors.dark, marginBottom: 12, marginTop: 8 },
// // // // //   tripItem: { flexDirection: 'row', marginBottom: 16 },
// // // // //   tripIconContainer: { width: 32, height: 32, borderRadius: 16, backgroundColor: '#F0F7FF', alignItems: 'center', justifyContent: 'center', marginRight: 12 },
// // // // //   tripDetails: { flex: 1 },
// // // // //   tripLabel: { fontSize: 12, color: Colors.gray, marginBottom: 2 },
// // // // //   tripValue: { fontSize: 15, fontWeight: '600', color: Colors.dark },
// // // // //   tripDivider: { height: 1, backgroundColor: '#EEF2F7', marginVertical: 12, marginLeft: 16 },
// // // // //   tripMetaRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 16, marginTop: 8, paddingTop: 12, borderTopWidth: 1, borderTopColor: '#EEF2F7' },
// // // // //   tripMetaItem: { flexDirection: 'row', alignItems: 'center', gap: 6 },
// // // // //   tripMetaText: { fontSize: 13, color: Colors.gray },
// // // // //   vehicleDetailRow: { flexDirection: 'row', alignItems: 'center', gap: 16 },
// // // // //   vehicleDetailInfo: { flex: 1 },
// // // // //   vehicleDetailName: { fontSize: 15, fontWeight: '600', color: Colors.dark },
// // // // //   vehicleDetailColor: { fontSize: 13, color: '#6B7280', marginTop: 2 },
// // // // //   vehicleDetailReg: { fontSize: 12, color: '#9CA3AF', marginTop: 2 },
// // // // //   vehicleDetailSeats: { fontSize: 12, color: '#6B7280', marginTop: 2 },
// // // // //   seatStatsRow: { flexDirection: 'row', justifyContent: 'space-around', marginBottom: 16 },
// // // // //   seatStat: { alignItems: 'center' },
// // // // //   seatStatValue: { fontSize: 24, fontWeight: '800', color: Colors.dark },
// // // // //   seatStatLabel: { fontSize: 12, color: Colors.gray, marginTop: 4 },
// // // // //   seatProgressContainer: { height: 6, backgroundColor: '#E5E7EB', borderRadius: 3, overflow: 'hidden', marginBottom: 8 },
// // // // //   seatProgressBar: { height: '100%', backgroundColor: '#10B981', borderRadius: 3 },
// // // // //   tagRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 14 },
// // // // //   preferenceTag: { paddingHorizontal: 12, paddingVertical: 8, borderRadius: 999, backgroundColor: '#FFF3E8' },
// // // // //   preferenceTagText: { fontSize: 12, color: '#C65D00', fontWeight: '700' },
// // // // //   bookingDetailRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 8 },
// // // // //   bookingDetailLabel: { fontSize: 14, color: Colors.gray },
// // // // //   bookingDetailValue: { fontSize: 14, fontWeight: '600', color: Colors.dark },
// // // // //   bookingTotalRow: { marginTop: 8, paddingTop: 8, borderTopWidth: 1, borderTopColor: '#EEF2F7' },
// // // // //   bookingTotalLabel: { fontSize: 16, fontWeight: '700', color: Colors.dark },
// // // // //   bookingTotalValue: { fontSize: 18, fontWeight: '800', color: '#184080' },
// // // // //   bookingStatusBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20 },
// // // // //   bookingStatusText: { fontSize: 12, fontWeight: '600' },
// // // // //   divider: { height: 1, backgroundColor: '#EEF2F7', marginVertical: 16 },
// // // // //   otherBookedInfo: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFFBEB', padding: 10, borderRadius: 8, marginBottom: 12, gap: 8 },
// // // // //   otherBookedInfoText: { flex: 1, fontSize: 11, color: '#B45309' },
// // // // //   seatSelectorRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: '#FAFAFB', borderRadius: 18, padding: 14, marginBottom: 12 },
// // // // //   seatActionBtn: { width: 38, height: 38, borderRadius: 12, borderWidth: 1, borderColor: '#D6DDE7', alignItems: 'center', justifyContent: 'center', backgroundColor: 'white' },
// // // // //   seatActionBtnDisabled: { opacity: 0.5, backgroundColor: '#F5F5F5' },
// // // // //   seatCountWrap: { flexDirection: 'row', alignItems: 'baseline' },
// // // // //   seatCountText: { fontSize: 28, fontWeight: '900', color: Colors.dark },
// // // // //   seatAvailableText: { fontSize: 13, color: Colors.gray, marginLeft: 6, fontWeight: '600' },
// // // // //   updateSeatsBtn: { backgroundColor: Colors.primary, paddingVertical: 12, borderRadius: 12, alignItems: 'center', marginTop: 8 },
// // // // //   updateSeatsBtnDisabled: { opacity: 0.6 },
// // // // //   updateSeatsBtnText: { color: '#fff', fontWeight: '700', fontSize: 14 },
// // // // //   cancelBookingBtn: { marginTop: 12, backgroundColor: '#FEF2F2', paddingVertical: 12, borderRadius: 12, alignItems: 'center', borderWidth: 1, borderColor: '#EF4444' },
// // // // //   cancelBookingBtnText: { color: '#EF4444', fontWeight: '700', fontSize: 14 },
// // // // //   cancelBookingBtnDisabled: { opacity: 0.6 },
// // // // //   noRidersContainer: { alignItems: 'center', padding: 30, gap: 10 },
// // // // //   noRidersText: { fontSize: 14, fontWeight: '600', color: Colors.gray },
// // // // //   otherRiderItem: { flexDirection: 'row', alignItems: 'center', paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: '#EEF2F7' },
// // // // //   otherRiderAvatar: { width: 44, height: 44, borderRadius: 22, backgroundColor: '#E5E7EB', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', marginRight: 12 },
// // // // //   otherRiderAvatarImg: { width: 44, height: 44, borderRadius: 22, resizeMode: 'cover' },
// // // // //   otherRiderAvatarPlaceholder: { width: 44, height: 44, borderRadius: 22, backgroundColor: '#E5E7EB', alignItems: 'center', justifyContent: 'center' },
// // // // //   otherRiderAvatarText: { fontSize: 16, fontWeight: '700', color: Colors.primary },
// // // // //   otherRiderInfo: { flex: 1 },
// // // // //   otherRiderName: { fontSize: 15, fontWeight: '600', color: Colors.dark, marginBottom: 2 },
// // // // //   otherRiderSeats: { fontSize: 12, color: Colors.gray },
// // // // //   safetyCard: { backgroundColor: '#FFF3E7', borderRadius: 18, padding: 16, marginBottom: 14, flexDirection: 'row', alignItems: 'center', gap: 12 },
// // // // //   safetyTitle: { fontSize: 14, color: '#2457A6', fontWeight: '800' },
// // // // //   safetySub: { marginTop: 2, fontSize: 12, color: '#2457A6', opacity: 0.9, fontWeight: '600' },
// // // // //   loaderContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#fff' },
// // // // //   modalBackdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center' },
// // // // //   confirmModalContent: { backgroundColor: 'white', borderRadius: 24, padding: 24, width: '85%', alignItems: 'center' },
// // // // //   confirmModalTitle: { fontSize: 20, fontWeight: '800', color: Colors.dark, marginTop: 12 },
// // // // //   confirmModalMessage: { fontSize: 14, color: Colors.gray, textAlign: 'center', marginBottom: 24, lineHeight: 20 },
// // // // //   confirmModalButtons: { flexDirection: 'row', gap: 12, width: '100%' },
// // // // //   confirmModalBtn: { flex: 1, paddingVertical: 12, borderRadius: 12, alignItems: 'center' },
// // // // //   confirmModalCancelBtn: { backgroundColor: '#F3F4F6' },
// // // // //   confirmModalCancelBtnText: { color: Colors.dark, fontWeight: '600' },
// // // // //   confirmModalConfirmBtn: { backgroundColor: '#EF4444' },
// // // // //   confirmModalConfirmBtnText: { color: '#fff', fontWeight: '600' },
// // // // //   modalCard: { backgroundColor: '#fff', borderRadius: 24, padding: 20, alignItems: 'center', width: width - 40 },
// // // // //   modalTitle: { fontSize: 22, fontWeight: '700', color: '#111827', textAlign: 'center', marginTop: 12 },
// // // // //   modalSub: { fontSize: 14, color: '#6B7280', textAlign: 'center', marginTop: 8, marginBottom: 18 },
// // // // //   starsRow: { flexDirection: 'row', justifyContent: 'center', marginBottom: 18 },
// // // // //   feedbackInput: { minHeight: 100, borderWidth: 1, borderColor: '#E5E7EB', borderRadius: 16, padding: 14, color: '#111827', fontSize: 14, width: '100%' },
// // // // //   modalActions: { flexDirection: 'row', gap: 10, marginTop: 18, width: '100%' },
// // // // //   skipBtn: { flex: 1, borderWidth: 1, borderColor: '#D1D5DB', borderRadius: 999, paddingVertical: 14, alignItems: 'center' },
// // // // //   skipBtnText: { color: '#6B7280', fontWeight: '600' },
// // // // //   submitBtn: { flex: 1, backgroundColor: Colors.primary, borderRadius: 999, paddingVertical: 14, alignItems: 'center' },
// // // // //   submitBtnText: { color: '#fff', fontWeight: '700' },
// // // // //   imageModalContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', width: '100%' },
// // // // //   imageModalContent: { width: '90%', backgroundColor: Colors.white, borderRadius: 20, overflow: 'hidden', maxHeight: '80%' },
// // // // //   imageModalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 16, borderBottomWidth: 1, borderBottomColor: '#EEF2F7' },
// // // // //   imageModalTitle: { fontSize: 18, fontWeight: '700', color: Colors.dark },
// // // // //   fullProfileImage: { width: '100%', height: 400, backgroundColor: '#F5F5F5', resizeMode: 'contain' },
// // // // //   modalSvgContainer: { width: '100%', height: 400, backgroundColor: '#F5F5F5', alignItems: 'center', justifyContent: 'center' },
// // // // //   noImageContainer: { width: '100%', height: 400, justifyContent: 'center', alignItems: 'center', backgroundColor: '#F5F5F5' },
// // // // //   noImageText: { fontSize: 16, color: Colors.gray },
// // // // //   emptyText: { fontSize: 13, color: Colors.gray, fontWeight: '600' },
  
// // // // //   // Pending Modification Styles
// // // // //   pendingModificationHeader: {
// // // // //     flexDirection: 'row',
// // // // //     alignItems: 'center',
// // // // //     gap: 12,
// // // // //     marginBottom: 16,
// // // // //     paddingBottom: 12,
// // // // //     borderBottomWidth: 1,
// // // // //     borderBottomColor: '#FDE68A',
// // // // //   },
// // // // //   pendingModificationTitle: {
// // // // //     fontSize: 18,
// // // // //     fontWeight: '700',
// // // // //     color: '#92400E',
// // // // //     flex: 1,
// // // // //   },
// // // // //   pendingModificationDetails: {
// // // // //     backgroundColor: '#FFFBEB',
// // // // //     borderRadius: 12,
// // // // //     padding: 14,
// // // // //     marginBottom: 16,
// // // // //     borderWidth: 1,
// // // // //     borderColor: '#FDE68A',
// // // // //   },
// // // // //   modificationDetailRow: {
// // // // //     flexDirection: 'row',
// // // // //     justifyContent: 'space-between',
// // // // //     alignItems: 'center',
// // // // //     paddingVertical: 8,
// // // // //   },
// // // // //   modificationDetailLabel: {
// // // // //     fontSize: 14,
// // // // //     color: '#6B7280',
// // // // //   },
// // // // //   modificationDetailValue: {
// // // // //     fontSize: 16,
// // // // //     fontWeight: '600',
// // // // //     color: '#111827',
// // // // //   },
// // // // //   pendingBadge: {
// // // // //     paddingHorizontal: 10,
// // // // //     paddingVertical: 4,
// // // // //     borderRadius: 20,
// // // // //   },
// // // // //   pendingBadgeText: {
// // // // //     fontSize: 12,
// // // // //     fontWeight: '600',
// // // // //   },
// // // // //   modificationDate: {
// // // // //     fontSize: 11,
// // // // //     color: '#9CA3AF',
// // // // //     marginTop: 8,
// // // // //     textAlign: 'center',
// // // // //   },
// // // // //   cancelModificationBtn: {
// // // // //     backgroundColor: '#FEF2F2',
// // // // //     paddingVertical: 12,
// // // // //     borderRadius: 12,
// // // // //     alignItems: 'center',
// // // // //     borderWidth: 1,
// // // // //     borderColor: '#EF4444',
// // // // //   },
// // // // //   cancelModificationBtnText: {
// // // // //     color: '#EF4444',
// // // // //     fontWeight: '600',
// // // // //     fontSize: 14,
// // // // //   },
// // // // // });
// // // // // import React, { useMemo, useRef, useState, useEffect, useCallback } from 'react';
// // // // // import {
// // // // //   View, Text, StyleSheet, TouchableOpacity, ScrollView, Platform,
// // // // //   StatusBar, Image, Dimensions, Animated, PanResponder, Modal,
// // // // //   LogBox, TextInput, Share, Alert
// // // // // } from 'react-native';
// // // // // import MapView, { Marker, Polyline, PROVIDER_GOOGLE } from 'react-native-maps';
// // // // // import { Ionicons } from '@expo/vector-icons';
// // // // // import LottieView from "lottie-react-native";
// // // // // import { SvgCssUri } from 'react-native-svg/css';
// // // // // import { Colors } from '../constants/Colors';
// // // // // import { useAuth } from '../context/AuthContext';
// // // // // import { API_BASE_URL } from '../config/config_ip';
// // // // // import CustomAlert from '../components/CustomAlert';
// // // // // import { useFocusEffect } from '@react-navigation/native';
// // // // // import io from 'socket.io-client';
// // // // // import ChatService from '../services/ChatService';

// // // // // LogBox.ignoreLogs(['Accessibility: View', 'Property accessibilityState', 'RCTView']);

// // // // // const { height, width } = Dimensions.get('window');
// // // // // const SAFE_TOP = Platform.OS === 'ios' ? 56 : 24;
// // // // // const COLLAPSED_HEIGHT = 84;
// // // // // const EXPANDED_HEIGHT = height * 0.72;

// // // // // // ============================================
// // // // // // UTILITY FUNCTIONS
// // // // // // ============================================

// // // // // function buildImageUrl(url) {
// // // // //   if (!url) return null;
// // // // //   if (url.startsWith('http://') || url.startsWith('https://')) return url;
// // // // //   return `${API_BASE_URL}${url.startsWith('/') ? '' : '/'}${url}`;
// // // // // }

// // // // // function getDriverInitials(name) {
// // // // //   if (!name) return 'D';
// // // // //   const parts = name.trim().split(' ').filter(Boolean);
// // // // //   if (parts.length > 1) return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
// // // // //   return parts[0].slice(0, 2).toUpperCase();
// // // // // }

// // // // // function parseSuggestedPoint(point) {
// // // // //   if (!point) return null;
// // // // //   if (Array.isArray(point) && point.length === 2) {
// // // // //     return { longitude: Number(point[0]), latitude: Number(point[1]) };
// // // // //   }
// // // // //   if (point.lng != null && point.lat != null) {
// // // // //     return { longitude: Number(point.lng), latitude: Number(point.lat) };
// // // // //   }
// // // // //   if (point.longitude != null && point.latitude != null) {
// // // // //     return { longitude: Number(point.longitude), latitude: Number(point.latitude) };
// // // // //   }
// // // // //   return null;
// // // // // }

// // // // // function parseRouteCoordinates(routeCoordinates) {
// // // // //   if (!Array.isArray(routeCoordinates)) return [];
// // // // //   return routeCoordinates.map((item) => {
// // // // //     if (Array.isArray(item) && item.length === 2) {
// // // // //       return { longitude: Number(item[0]), latitude: Number(item[1]) };
// // // // //     }
// // // // //     if (item && typeof item === 'object' && item.latitude && item.longitude) {
// // // // //       return { longitude: Number(item.longitude), latitude: Number(item.latitude) };
// // // // //     }
// // // // //     return parseSuggestedPoint(item);
// // // // //   }).filter(Boolean);
// // // // // }

// // // // // function isSvgUrl(url) {
// // // // //   if (!url) return false;
// // // // //   return url.toLowerCase().includes('.svg') || url.toLowerCase().includes('.svg?');
// // // // // }

// // // // // function calculateDistance(lat1, lon1, lat2, lon2) {
// // // // //   const R = 6371000;
// // // // //   const dLat = (lat2 - lat1) * Math.PI / 180;
// // // // //   const dLon = (lon2 - lon1) * Math.PI / 180;
// // // // //   const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
// // // // //             Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
// // // // //             Math.sin(dLon/2) * Math.sin(dLon/2);
// // // // //   const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
// // // // //   return R * c;
// // // // // }

// // // // // function formatDistance(meters) {
// // // // //   if (!meters) return 'Unknown';
// // // // //   if (meters < 1000) return `${Math.round(meters)} m`;
// // // // //   return `${(meters / 1000).toFixed(1)} km`;
// // // // // }

// // // // // function formatDate(dateString) {
// // // // //   if (!dateString) return 'Date not set';
// // // // //   const date = new Date(dateString);
// // // // //   const today = new Date();
// // // // //   const tomorrow = new Date(today);
// // // // //   tomorrow.setDate(tomorrow.getDate() + 1);
// // // // //   const isToday = date.toDateString() === today.toDateString();
// // // // //   const isTomorrow = date.toDateString() === tomorrow.toDateString();
// // // // //   let dayText = "";
// // // // //   if (isToday) dayText = "Today";
// // // // //   else if (isTomorrow) dayText = "Tomorrow";
// // // // //   else dayText = date.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" });
// // // // //   const timeText = date.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit", hour12: true });
// // // // //   return `${dayText}, ${timeText}`;
// // // // // }

// // // // // function formatTimeOnly(dateString) {
// // // // //   if (!dateString) return '--:--';
// // // // //   const date = new Date(dateString);
// // // // //   return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });
// // // // // }

// // // // // function extractAllPreferences(ride, driverTravelPrefs) {
// // // // //   let ridePrefs = ride?.preferences;
// // // // //   if (ridePrefs && typeof ridePrefs === 'string') {
// // // // //     try { ridePrefs = JSON.parse(ridePrefs); } catch (e) { ridePrefs = null; }
// // // // //   }
// // // // //   if (ridePrefs && typeof ridePrefs === 'object' && Object.keys(ridePrefs).length > 0) {
// // // // //     return extractFromObject(ridePrefs);
// // // // //   }
// // // // //   if (driverTravelPrefs && typeof driverTravelPrefs === 'object' && Object.keys(driverTravelPrefs).length > 0) {
// // // // //     return extractFromObject(driverTravelPrefs);
// // // // //   }
// // // // //   return [];
// // // // // }

// // // // // function extractFromObject(prefs) {
// // // // //   const allPreferences = [];
// // // // //   Object.entries(prefs).forEach(([key, value]) => {
// // // // //     if (value === null || value === undefined) return;
// // // // //     const formattedKey = key.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
// // // // //     if (typeof value === 'boolean') {
// // // // //       if (value === true) allPreferences.push(formattedKey);
// // // // //     } else if (Array.isArray(value)) {
// // // // //       if (value.length > 0) allPreferences.push(`${formattedKey}: ${value.join(', ')}`);
// // // // //     } else if (typeof value === 'object') {
// // // // //       allPreferences.push(...extractFromObject(value));
// // // // //     } else if (typeof value === 'string' && value.trim()) {
// // // // //       const lowerValue = value.toLowerCase();
// // // // //       if (!['false', 'no', 'none', 'null', 'undefined'].includes(lowerValue)) {
// // // // //         allPreferences.push(`${formattedKey}: ${value}`);
// // // // //       }
// // // // //     } else if (typeof value === 'number') {
// // // // //       allPreferences.push(`${formattedKey}: ${value}`);
// // // // //     }
// // // // //   });
// // // // //   return [...new Set(allPreferences)];
// // // // // }

// // // // // // ============================================
// // // // // // COMPONENTS
// // // // // // ============================================

// // // // // function GenericPreferenceTag({ label }) {
// // // // //   if (!label || label.trim() === '') return null;
// // // // //   let tagColor = '#FFF3E8';
// // // // //   let textColor = '#C65D00';
// // // // //   const lowerLabel = label.toLowerCase();
// // // // //   if (lowerLabel.includes('age') || lowerLabel.includes('category')) {
// // // // //     tagColor = '#E8F5E9'; textColor = '#2E7D32';
// // // // //   } else if (lowerLabel.includes('chat') || lowerLabel.includes('talk')) {
// // // // //     tagColor = '#E3F2FD'; textColor = '#1565C0';
// // // // //   } else if (lowerLabel.includes('gender')) {
// // // // //     tagColor = '#F3E5F5'; textColor = '#6A1B9A';
// // // // //   } else if (lowerLabel.includes('language') || lowerLabel.includes('speak')) {
// // // // //     tagColor = '#FFF9C4'; textColor = '#F57F17';
// // // // //   } else if (lowerLabel.includes('verified')) {
// // // // //     tagColor = '#E8F5E9'; textColor = '#2E7D32';
// // // // //   }
// // // // //   return (
// // // // //     <View style={[styles.preferenceTag, { backgroundColor: tagColor }]}>
// // // // //       <Text style={[styles.preferenceTagText, { color: textColor }]}>{label}</Text>
// // // // //     </View>
// // // // //   );
// // // // // }

// // // // // function ProfileImageModal({ visible, imageUrl, driverName, onClose }) {
// // // // //   const [isSvg, setIsSvg] = useState(false);
// // // // //   useEffect(() => {
// // // // //     if (imageUrl) setIsSvg(imageUrl.toLowerCase().includes('.svg'));
// // // // //   }, [imageUrl]);
// // // // //   if (!visible) return null;
// // // // //   return (
// // // // //     <Modal visible={visible} transparent={true} animationType="fade" onRequestClose={onClose}>
// // // // //       <TouchableOpacity style={styles.modalBackdrop} activeOpacity={1} onPress={onClose}>
// // // // //         <View style={styles.imageModalContainer}>
// // // // //           <View style={styles.imageModalContent}>
// // // // //             <View style={styles.imageModalHeader}>
// // // // //               <Text style={styles.imageModalTitle}>{driverName}</Text>
// // // // //               <TouchableOpacity onPress={onClose}><Ionicons name="close" size={24} color={Colors.dark} /></TouchableOpacity>
// // // // //             </View>
// // // // //             {imageUrl && imageUrl !== 'null' && imageUrl !== 'undefined' ? (
// // // // //               isSvg ? (
// // // // //                 <View style={styles.modalSvgContainer}><SvgCssUri uri={imageUrl} width="100%" height={400} /></View>
// // // // //               ) : (
// // // // //                 <Image source={{ uri: imageUrl }} style={styles.fullProfileImage} resizeMode="contain" />
// // // // //               )
// // // // //             ) : (
// // // // //               <View style={styles.noImageContainer}><Text style={styles.noImageText}>No profile picture available</Text></View>
// // // // //             )}
// // // // //           </View>
// // // // //         </View>
// // // // //       </TouchableOpacity>
// // // // //     </Modal>
// // // // //   );
// // // // // }

// // // // // // Rating Stars Component
// // // // // function RatingStars({ rating, size = 16, onPress }) {
// // // // //   return (
// // // // //     <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
// // // // //       {[1, 2, 3, 4, 5].map((star) => (
// // // // //         <TouchableOpacity key={star} onPress={() => onPress?.(star)} disabled={!onPress}>
// // // // //           <Ionicons 
// // // // //             name={star <= rating ? 'star' : 'star-outline'} 
// // // // //             size={size} 
// // // // //             color={star <= rating ? '#F59E0B' : '#D1D5DB'} 
// // // // //           />
// // // // //         </TouchableOpacity>
// // // // //       ))}
// // // // //     </View>
// // // // //   );
// // // // // }

// // // // // // ============================================
// // // // // // MAIN SCREEN COMPONENT
// // // // // // ============================================

// // // // // export default function ViewRouteRequestScreen({ navigation, route }) {
// // // // //   const { user } = useAuth();
// // // // //   const params = route.params || {};
// // // // //   const initialRide = params.ride || null;
// // // // //   const booking = params.booking || null;

// // // // //   // State for ride data - initialize directly from params
// // // // //   const [currentRide, setCurrentRide] = useState(() => {
// // // // //     if (initialRide && initialRide.id) {
// // // // //       return initialRide;
// // // // //     }
// // // // //     if (booking?.ride) {
// // // // //       return booking.ride;
// // // // //     }
// // // // //     return null;
// // // // //   });

// // // // //   const [userBooking, setUserBooking] = useState(() => {
// // // // //   if (booking && booking.id) {
// // // // //     // Make sure id is a number
// // // // //     return {
// // // // //       id: Number(booking.id),
// // // // //       seats_requested: Number(booking.seats_requested) || 1,
// // // // //       status: booking.status || 'pending',
// // // // //       total_amount: Number(booking.total_amount) || null,
// // // // //       created_at: booking.created_at,
// // // // //     };
// // // // //   }
// // // // //   if (initialRide?.booking && initialRide.booking.id) {
// // // // //     return {
// // // // //       id: Number(initialRide.booking.id),
// // // // //       seats_requested: Number(initialRide.booking.seats_requested) || 1,
// // // // //       status: initialRide.booking.status || 'pending',
// // // // //       total_amount: Number(initialRide.booking.total_amount) || null,
// // // // //     };
// // // // //   }
// // // // //   if (initialRide?.seatsRequested) {
// // // // //     return {
// // // // //       id: Number(initialRide.id),
// // // // //       seats_requested: Number(initialRide.seatsRequested),
// // // // //       status: 'accepted',
// // // // //     };
// // // // //   }
// // // // //   return null;
// // // // // });
// // // // // // In your initializeData function

// // // // //   const [driverProfile, setDriverProfile] = useState(null);
// // // // //   const [isVerified, setIsVerified] = useState(false);
// // // // //   const [loadingProfile, setLoadingProfile] = useState(false);
  
// // // // //   // UI State
// // // // //   const [drawerExpanded, setDrawerExpanded] = useState(true);
// // // // //   const [mapReady, setMapReady] = useState(false);
// // // // //   const [showCancelModal, setShowCancelModal] = useState(false);
// // // // //   const [ratingModalVisible, setRatingModalVisible] = useState(false);
// // // // //   const [selectedProfile, setSelectedProfile] = useState({ visible: false, imageUrl: null, driverName: '' });
// // // // //   const [alertVisible, setAlertVisible] = useState(false);
// // // // //   const [alertConfig, setAlertConfig] = useState({ title: "", message: "", icon: "check-circle", iconColor: "#10B981", buttons: [] });
  
// // // // //   // Seat related state
// // // // //   const [seatsRequested, setSeatsRequested] = useState(() => {
// // // // //     if (booking?.seats_requested) return booking.seats_requested;
// // // // //     if (initialRide?.seatsRequested) return initialRide.seatsRequested;
// // // // //     return 1;
// // // // //   });
// // // // //   const [modifyingSeats, setModifyingSeats] = useState(false);
// // // // //   const [totalSeatsOffered, setTotalSeatsOffered] = useState(() => initialRide?.available_seats || 4);
// // // // //   const [totalBookedSeats, setTotalBookedSeats] = useState(() => booking?.seats_requested || initialRide?.seatsRequested || 0);
// // // // //   const [availableSeats, setAvailableSeats] = useState(() => (initialRide?.available_seats || 4) - (booking?.seats_requested || initialRide?.seatsRequested || 0));
// // // // //   const [otherRiders, setOtherRiders] = useState([]);
  
// // // // //   // Modification request state
// // // // //   const [seatModificationRequested, setSeatModificationRequested] = useState(false);
// // // // //   const [pendingSeatsRequest, setPendingSeatsRequest] = useState(null);
// // // // //   const [pendingRequestDetails, setPendingRequestDetails] = useState(null);
// // // // //   const [pendingModificationRequest, setPendingModificationRequest] = useState(null);
  
// // // // //   // Live tracking state
// // // // //   const [liveSession, setLiveSession] = useState(null);
// // // // //   const [driverLocation, setDriverLocation] = useState(null);
// // // // //   const [driverETA, setDriverETA] = useState(null);
// // // // //   const [driverDistance, setDriverDistance] = useState(null);
// // // // //   const [socketConnected, setSocketConnected] = useState(false);
  
// // // // //   // Rating state
// // // // //   const [rating, setRating] = useState(0);
// // // // //   const [feedback, setFeedback] = useState('');
// // // // //   const [submitting, setSubmitting] = useState(false);
// // // // //   const [hasRatedDriver, setHasRatedDriver] = useState(false);
// // // // //   const [rideCompleted, setRideCompleted] = useState(false);
// // // // //   const [completedRideDetails, setCompletedRideDetails] = useState(null);
  
// // // // //   // Driver's rating and feedback for this ride
// // // // //   const [driverRating, setDriverRating] = useState(null);
// // // // //   const [driverFeedbackText, setDriverFeedbackText] = useState('');
// // // // //   const [showDriverRating, setShowDriverRating] = useState(false);
  
// // // // //   // Cancel state
// // // // //   const [cancelLoading, setCancelLoading] = useState(false);
  
// // // // //   // Refs
// // // // //   const animatedDrawer = useRef(new Animated.Value(1)).current;
// // // // //   const mapRef = useRef(null);
// // // // //   const socketRef = useRef(null);
// // // // //   const hasShownRatingModal = useRef(false);
  
// // // // //   // Animation values
// // // // //   const mapHeight = animatedDrawer.interpolate({ inputRange: [0, 1], outputRange: [height - SAFE_TOP - COLLAPSED_HEIGHT, height * 0.32] });
// // // // //   const drawerHeight = animatedDrawer.interpolate({ inputRange: [0, 1], outputRange: [COLLAPSED_HEIGHT, EXPANDED_HEIGHT] });
  
// // // // //   const toggleDrawer = () => {
// // // // //     const nextExpanded = !drawerExpanded;
// // // // //     setDrawerExpanded(nextExpanded);
// // // // //     Animated.timing(animatedDrawer, { toValue: nextExpanded ? 1 : 0, duration: 260, useNativeDriver: false }).start();
// // // // //   };
  
// // // // //   const panResponder = useRef(PanResponder.create({
// // // // //     onMoveShouldSetPanResponder: (_, gestureState) => Math.abs(gestureState.dy) > 5,
// // // // //     onPanResponderMove: (_, gestureState) => {
// // // // //       const dragRange = EXPANDED_HEIGHT - COLLAPSED_HEIGHT;
// // // // //       const progress = drawerExpanded ? 1 - (gestureState.dy / dragRange) : gestureState.dy / dragRange;
// // // // //       animatedDrawer.setValue(Math.max(0, Math.min(1, progress)));
// // // // //     },
// // // // //     onPanResponderRelease: (_, gestureState) => {
// // // // //       const dragRange = EXPANDED_HEIGHT - COLLAPSED_HEIGHT;
// // // // //       const threshold = dragRange * 0.2;
// // // // //       if (drawerExpanded) {
// // // // //         if (gestureState.dy > threshold) {
// // // // //           setDrawerExpanded(false);
// // // // //           Animated.timing(animatedDrawer, { toValue: 0, duration: 200, useNativeDriver: false }).start();
// // // // //         } else {
// // // // //           setDrawerExpanded(true);
// // // // //           Animated.timing(animatedDrawer, { toValue: 1, duration: 200, useNativeDriver: false }).start();
// // // // //         }
// // // // //       } else {
// // // // //         if (gestureState.dy < -threshold) {
// // // // //           setDrawerExpanded(true);
// // // // //           Animated.timing(animatedDrawer, { toValue: 1, duration: 200, useNativeDriver: false }).start();
// // // // //         } else {
// // // // //           setDrawerExpanded(false);
// // // // //           Animated.timing(animatedDrawer, { toValue: 0, duration: 200, useNativeDriver: false }).start();
// // // // //         }
// // // // //       }
// // // // //     },
// // // // //   })).current;
  
// // // // //   // Helper functions
// // // // //   const showCustomAlert = (title, message, type = 'success') => {
// // // // //     let icon = "check-circle";
// // // // //     let iconColor = "#10B981";
// // // // //     if (type === 'error') { icon = "error"; iconColor = "#EF4444"; }
// // // // //     else if (type === 'warning') { icon = "warning"; iconColor = "#F59E0B"; }
// // // // //     else if (type === 'info') { icon = "info"; iconColor = Colors.primary; }
// // // // //     setAlertConfig({ title, message, icon, iconColor, buttons: [{ text: 'OK', onPress: () => setAlertVisible(false) }] });
// // // // //     setAlertVisible(true);
// // // // //   };
  
// // // // //   const getProfilePhotoUrl = () => {
// // // // //     const rawUrl = driverProfile?.profile_picture || currentRide?.profilePicture || currentRide?.driverProfilePicture;
// // // // //     if (!rawUrl) return null;
// // // // //     return buildImageUrl(rawUrl);
// // // // //   };
  
// // // // //   // Get driver phone number for chat
// // // // //   const getDriverPhoneNumber = () => {
// // // // //     return currentRide?.phoneNumber || currentRide?.driver_phone;
// // // // //   };
  
// // // // //   // Handle chat with driver
// // // // //   const handleChatWithDriver = async () => {
// // // // //     const driverPhone = getDriverPhoneNumber();
// // // // //     const driverName = driverProfile?.full_name || currentRide?.driverName || 'Driver';
    
// // // // //     if (!driverPhone) {
// // // // //       showCustomAlert('Error', 'Driver contact information not available', 'error');
// // // // //       return;
// // // // //     }
    
// // // // //     try {
// // // // //       // Get or create conversation with driver
// // // // //       const result = await ChatService.getOrCreateConversation(
// // // // //         user?.phone_number,
// // // // //         driverPhone,
// // // // //         currentRide?.id
// // // // //       );
      
// // // // //       if (result.success && result.conversationId) {
// // // // //         navigation.navigate('ChatScreen', {
// // // // //           conversationId: result.conversationId,
// // // // //           user: {
// // // // //             name: driverName,
// // // // //             phone_number: driverPhone,
// // // // //             profile_picture: getProfilePhotoUrl(),
// // // // //           },
// // // // //           rideId: currentRide?.id,
// // // // //         });
// // // // //       } else {
// // // // //         showCustomAlert('Error', 'Could not start chat. Please try again.', 'error');
// // // // //       }
// // // // //     } catch (error) {
// // // // //       console.error('Chat error:', error);
// // // // //       showCustomAlert('Error', 'Could not start chat', 'error');
// // // // //     }
// // // // //   };
  
// // // // // const fetchDriverRatingForRide = useCallback(async () => {
// // // // //   if (!userBooking?.id) return;
  
// // // // //   // Ensure booking ID is a number
// // // // //   const bookingId = Number(userBooking.id);
// // // // //   if (isNaN(bookingId)) {
// // // // //     console.log('Invalid booking ID for fetching rating');
// // // // //     return;
// // // // //   }
  
// // // // //   try {
// // // // //     console.log('Fetching driver rating for booking:', bookingId);
// // // // //     const response = await fetch(`${API_BASE_URL}/api/v1/ride-feedback/driver/${bookingId}?_t=${Date.now()}`);
// // // // //     const data = await response.json();
    
// // // // //     console.log('Driver rating response:', data);
    
// // // // //     if (data.success && data.feedback) {
// // // // //       setDriverRating(data.feedback.rating);
// // // // //       setDriverFeedbackText(data.feedback.comment || '');
// // // // //       setShowDriverRating(true);
// // // // //     } else {
// // // // //       setShowDriverRating(false);
// // // // //     }
// // // // //   } catch (error) {
// // // // //     console.log('Error fetching driver rating:', error);
// // // // //     setShowDriverRating(false);
// // // // //   }
// // // // // }, [userBooking?.id]);
// // // // // // Submit rating for driver - FIXED VERSION
// // // // // // Submit rating for driver - COMPLETE WORKING VERSION
// // // // // // Submit rating for driver - FIXED VERSION
// // // // // const handleRateDriver = async () => {
// // // // //   if (rating === 0) {
// // // // //     showCustomAlert('Rating Required', 'Please select a rating.', 'warning');
// // // // //     return;
// // // // //   }
  
// // // // //   if (!userBooking?.id) {
// // // // //     showCustomAlert('Error', 'Booking information not found.', 'error');
// // // // //     return;
// // // // //   }
  
// // // // //   setSubmitting(true);
// // // // //   try {
// // // // //     // DEBUG: Log what userBooking actually is
// // // // //     console.log('🔍 userBooking object:', JSON.stringify(userBooking, null, 2));
// // // // //     console.log('🔍 userBooking.id type:', typeof userBooking.id);
// // // // //     console.log('🔍 userBooking.id value:', userBooking.id);
    
// // // // //     // Make sure we're sending a plain number, not an object
// // // // //     const bookingId = Number(userBooking.id);
    
// // // // //     if (isNaN(bookingId)) {
// // // // //       console.error('❌ Invalid booking ID:', userBooking.id);
// // // // //       showCustomAlert('Error', 'Invalid booking ID. Please try again.', 'error');
// // // // //       setSubmitting(false);
// // // // //       return;
// // // // //     }
    
// // // // //     const requestBody = {
// // // // //       ride_booking_id: bookingId,
// // // // //       rating: Number(rating),
// // // // //       comment: feedback || '',
// // // // //     };
    
// // // // //     console.log('📤 Submitting rating:', JSON.stringify(requestBody, null, 2));
    
// // // // //     const response = await fetch(`${API_BASE_URL}/api/v1/ride-feedback`, {
// // // // //       method: 'POST',
// // // // //       headers: { 
// // // // //         'Content-Type': 'application/json',
// // // // //         'Accept': 'application/json',
// // // // //         'X-Phone-Number': user?.phone_number,
// // // // //       },
// // // // //       body: JSON.stringify(requestBody),
// // // // //     });
    
// // // // //     const data = await response.json();
// // // // //     console.log('📥 Response status:', response.status);
// // // // //     console.log('📥 Response data:', data);
    
// // // // //     if (response.ok && data.success) {
// // // // //       showCustomAlert('Thank You!', 'Your rating has been submitted successfully!', 'success');
// // // // //       setHasRatedDriver(true);
// // // // //       setRatingModalVisible(false);
// // // // //       setRating(0);
// // // // //       setFeedback('');
      
// // // // //       setTimeout(() => {
// // // // //         fetchDriverRatingForRide();
// // // // //         checkSessionStatus();
// // // // //       }, 500);
// // // // //     } else {
// // // // //       let errorMessage = 'Failed to submit rating.';
      
// // // // //       if (data.detail) {
// // // // //         if (typeof data.detail === 'string') {
// // // // //           errorMessage = data.detail;
// // // // //         } else if (Array.isArray(data.detail)) {
// // // // //           errorMessage = data.detail.map(err => {
// // // // //             if (err.msg) return err.msg;
// // // // //             if (err.message) return err.message;
// // // // //             return JSON.stringify(err);
// // // // //           }).join(', ');
// // // // //         }
// // // // //       } else if (data.message) {
// // // // //         errorMessage = data.message;
// // // // //       }
      
// // // // //       showCustomAlert('Error', errorMessage, 'error');
// // // // //     }
// // // // //   } catch (error) {
// // // // //     console.error('Rating error:', error);
// // // // //     showCustomAlert('Error', 'Network error. Please check your connection.', 'error');
// // // // //   } finally {
// // // // //     setSubmitting(false);
// // // // //   }
// // // // // };
// // // // //   // Add this function to get ride ID from booking
// // // // //   const getCorrectRideId = useCallback(async () => {
// // // // //     if (!userBooking?.id) return null;
    
// // // // //     try {
// // // // //       const response = await fetch(`${API_BASE_URL}/api/v1/bookings/${userBooking.id}/ride?_t=${Date.now()}`);
// // // // //       const data = await response.json();
      
// // // // //       if (data.success && data.ride) {
// // // // //         console.log('✅ Got correct ride ID from booking API:', data.ride.id);
// // // // //         return data.ride.id;
// // // // //       }
// // // // //       return null;
// // // // //     } catch (error) {
// // // // //       console.log('Error fetching ride from booking:', error);
// // // // //       return null;
// // // // //     }
// // // // //   }, [userBooking?.id]);

// // // // //   // Fetch modification requests
// // // // //   const fetchModificationRequests = useCallback(async () => {
// // // // //     if (!userBooking?.id) return;
    
// // // // //     try {
// // // // //       const response = await fetch(`${API_BASE_URL}/booking/${userBooking.id}/modification-request?_t=${Date.now()}`);
// // // // //       const data = await response.json();
      
// // // // //       console.log('📋 Modification request response:', data);
      
// // // // //       if (data.has_pending && data.request) {
// // // // //         setPendingModificationRequest(data.request);
// // // // //         setSeatModificationRequested(true);
// // // // //         setPendingSeatsRequest(data.request.requested_seats);
// // // // //         setPendingRequestDetails(data.request);
// // // // //       } else {
// // // // //         setPendingModificationRequest(null);
// // // // //         setSeatModificationRequested(false);
// // // // //         setPendingSeatsRequest(null);
// // // // //         setPendingRequestDetails(null);
// // // // //       }
// // // // //     } catch (error) {
// // // // //       console.log('Error fetching modification request:', error);
// // // // //     }
// // // // //   }, [userBooking?.id]);
  
// // // // //   // Handle cancel modification request
// // // // //   const handleCancelModificationRequest = async () => {
// // // // //     if (!userBooking?.id) return;
    
// // // // //     setModifyingSeats(true);
// // // // //     try {
// // // // //       const response = await fetch(`${API_BASE_URL}/api/v1/modifications/booking/${userBooking.id}/cancel`, {
// // // // //         method: 'DELETE',
// // // // //         headers: { 'Content-Type': 'application/json' },
// // // // //       });
// // // // //       const data = await response.json();
      
// // // // //       if (!response.ok) throw new Error(data.detail || data.message || 'Failed to cancel modification request');
      
// // // // //       showCustomAlert('Request Cancelled', 'Your seat modification request has been cancelled.', 'success');
// // // // //       setSeatModificationRequested(false);
// // // // //       setPendingSeatsRequest(null);
// // // // //       setPendingRequestDetails(null);
// // // // //       setPendingModificationRequest(null);
// // // // //       await fetchModificationRequests();
// // // // //     } catch (error) {
// // // // //       console.error('Cancel modification error:', error);
// // // // //       showCustomAlert('Error', error.message || 'Failed to cancel modification request', 'error');
// // // // //     } finally {
// // // // //       setModifyingSeats(false);
// // // // //     }
// // // // //   };

// // // // //   // Update fetchSeatAvailability to use the correct ride ID
// // // // //   const fetchSeatAvailability = useCallback(async () => {
// // // // //     let rideId = currentRide?.id;
    
// // // // //     if (!rideId || rideId === 3 || rideId === 0) {
// // // // //       const correctId = await getCorrectRideId();
// // // // //       if (correctId) {
// // // // //         rideId = correctId;
// // // // //         setCurrentRide(prev => ({ ...prev, id: correctId }));
// // // // //       } else {
// // // // //         console.log('❌ Could not get valid ride ID');
// // // // //         return;
// // // // //       }
// // // // //     }
    
// // // // //     console.log('✅ Fetching passengers for ride ID:', rideId);
    
// // // // //     try {
// // // // //       const url = `${API_BASE_URL.replace(/\/$/, '')}/ride/${rideId}/passengers?_t=${Date.now()}`;
// // // // //       console.log('📡 Fetching from URL:', url);
      
// // // // //       const response = await fetch(url);
// // // // //       console.log('📡 Response status:', response.status);
      
// // // // //       if (response.ok) {
// // // // //         const data = await response.json();
// // // // //         console.log('📡 API Response:', JSON.stringify(data, null, 2));
        
// // // // //         const totalSeats = data.available_seats || currentRide?.available_seats || 4;
// // // // //         setTotalSeatsOffered(totalSeats);
        
// // // // //         const totalBooked = data.total_booked_seats || 0;
// // // // //         setTotalBookedSeats(totalBooked);
// // // // //         setAvailableSeats(Math.max(0, totalSeats - totalBooked));
        
// // // // //         if (data.passengers && Array.isArray(data.passengers) && user?.phone_number) {
// // // // //           const normalizePhone = (phone) => {
// // // // //             if (!phone) return '';
// // // // //             let cleaned = phone.replace(/\s/g, '').replace(/-/g, '');
// // // // //             if (cleaned.startsWith('+91')) return cleaned;
// // // // //             if (cleaned.startsWith('91') && cleaned.length === 12) return `+${cleaned}`;
// // // // //             if (cleaned.startsWith('+')) return cleaned;
// // // // //             return `+91${cleaned}`;
// // // // //           };
          
// // // // //           const currentUserPhone = normalizePhone(user.phone_number);
// // // // //           console.log('📱 Current user phone:', currentUserPhone);
          
// // // // //           const acceptedPassengers = data.passengers.filter(p => p.status === 'accepted');
// // // // //           console.log('✅ Accepted passengers count:', acceptedPassengers.length);
          
// // // // //           const otherAccepted = acceptedPassengers.filter(p => {
// // // // //             const passengerPhone = normalizePhone(p.passenger_phone);
// // // // //             return passengerPhone !== currentUserPhone;
// // // // //           });
          
// // // // //           console.log('👥 Other riders found:', otherAccepted.length);
// // // // //           console.log('👥 Other riders:', otherAccepted);
          
// // // // //           setOtherRiders(otherAccepted);
// // // // //         } else {
// // // // //           console.log('❌ No passengers array or no user phone');
// // // // //           setOtherRiders([]);
// // // // //         }
// // // // //       } else if (response.status === 404) {
// // // // //         console.log('ℹ️ Ride not found - this might be normal if no passengers yet');
// // // // //         setOtherRiders([]);
// // // // //         setTotalSeatsOffered(currentRide?.available_seats || 4);
// // // // //         setTotalBookedSeats(0);
// // // // //         setAvailableSeats(currentRide?.available_seats || 4);
// // // // //       } else {
// // // // //         console.log('❌ API response not OK:', response.status);
// // // // //         const errorText = await response.text();
// // // // //         console.log('Error response:', errorText);
// // // // //       }
// // // // //     } catch (error) {
// // // // //       console.log('❌ Error fetching seat availability:', error);
// // // // //     }
// // // // //   }, [currentRide?.id, currentRide?.available_seats, user?.phone_number, getCorrectRideId]);

// // // // //   // Update loadDriverData to use correct ride ID
// // // // //   const loadDriverData = useCallback(async () => {
// // // // //     let rideId = currentRide?.id;
// // // // //     if (!rideId || rideId === 3 || rideId === 0) {
// // // // //       const correctId = await getCorrectRideId();
// // // // //       if (correctId) {
// // // // //         rideId = correctId;
// // // // //         setCurrentRide(prev => ({ ...prev, id: correctId }));
// // // // //       }
// // // // //     }
    
// // // // //     let driverPhone = currentRide?.phoneNumber || currentRide?.driver_phone;
// // // // //     let driverUserId = currentRide?.driverUserId || currentRide?.driver_user_id;
    
// // // // //     if ((!driverPhone && !driverUserId) && userBooking?.id) {
// // // // //       try {
// // // // //         const response = await fetch(`${API_BASE_URL}/api/v1/bookings/${userBooking.id}/ride?_t=${Date.now()}`);
// // // // //         const data = await response.json();
// // // // //         if (data.success && data.ride) {
// // // // //           driverPhone = data.ride.driver_phone;
// // // // //           driverUserId = data.ride.driver_user_id;
// // // // //           setCurrentRide(prev => ({ ...prev, 
// // // // //             phoneNumber: driverPhone, 
// // // // //             driver_phone: driverPhone,
// // // // //             driverUserId: driverUserId,
// // // // //             driverName: data.ride.driver_name,
// // // // //             from: data.ride.origin,
// // // // //             to: data.ride.destination,
// // // // //             departure_time: data.ride.departure_time,
// // // // //             price: data.ride.price_per_seat,
// // // // //             available_seats: data.ride.available_seats,
// // // // //             routeCoordinates: data.ride.route_coordinates,
// // // // //           }));
// // // // //         }
// // // // //       } catch (error) {
// // // // //         console.log('Error fetching ride details:', error);
// // // // //       }
// // // // //     }
    
// // // // //     if (!driverPhone && !driverUserId) {
// // // // //       console.log('No driver contact info available');
// // // // //       return;
// // // // //     }
    
// // // // //     setLoadingProfile(true);
// // // // //     try {
// // // // //       const params = new URLSearchParams();
// // // // //       if (driverUserId) params.append('user_id', driverUserId);
// // // // //       else if (driverPhone) params.append('phone_number', driverPhone);
// // // // //       params.append('_t', Date.now());
      
// // // // //       const profileRes = await fetch(`${API_BASE_URL}/api/v1/users/profile-public?${params.toString()}`);
// // // // //       const profileData = await profileRes.json();
      
// // // // //       if (profileData?.success && profileData.user) {
// // // // //         setDriverProfile(profileData.user);
// // // // //       }
      
// // // // //       if (driverPhone) {
// // // // //         const docsRes = await fetch(`${API_BASE_URL}/api/v1/documents/user/${driverPhone}`);
// // // // //         const docsData = await docsRes.json();
// // // // //         if (docsData?.success && docsData.documents) {
// // // // //           const verifiedDocs = docsData.documents.filter(doc => {
// // // // //             const status = doc.status?.toUpperCase();
// // // // //             return status === 'APPROVED' && ['aadhar', 'dl', 'rc'].includes(doc.document_type?.toLowerCase());
// // // // //           });
// // // // //           setIsVerified(verifiedDocs.length > 0);
// // // // //         }
// // // // //       }
// // // // //     } catch (error) {
// // // // //       console.log('Error loading driver data:', error);
// // // // //     } finally {
// // // // //       setLoadingProfile(false);
// // // // //     }
// // // // //   }, [currentRide, userBooking?.id, getCorrectRideId]);
// // // // // console.log('📤 DEBUG - userBooking.id value:', userBooking.id);
// // // // // console.log('📤 DEBUG - userBooking.id type:', typeof userBooking.id);
// // // // // console.log('📤 DEBUG - Full userBooking:', JSON.stringify(userBooking, null, 2));
// // // // //   // Add useEffect to initialize data when component mounts
// // // // //   useEffect(() => {
// // // // //     const initializeData = async () => {
// // // // //       if (userBooking?.id) {
// // // // //         try {
// // // // //           const response = await fetch(`${API_BASE_URL}/api/v1/bookings/${userBooking.id}/ride?_t=${Date.now()}`);
// // // // //           const data = await response.json();
          
// // // // //           if (data.success && data.ride) {
// // // // //             console.log('✅ Fetched ride details from booking API:', data.ride.id);
            
// // // // //             setCurrentRide({
// // // // //               id: data.ride.id,
// // // // //               available_seats: data.ride.available_seats,
// // // // //               price: data.ride.price_per_seat,
// // // // //               from: data.ride.origin,
// // // // //               to: data.ride.destination,
// // // // //               departure_time: data.ride.departure_time,
// // // // //               phoneNumber: data.ride.driver_phone,
// // // // //               driverName: data.ride.driver_name,
// // // // //               driverUserId: data.ride.driver_user_id,
// // // // //               routeCoordinates: data.ride.route_coordinates,
// // // // //               distance_km: data.ride.distance_km,
// // // // //               duration_text: data.ride.duration_text,
// // // // //               status: data.ride.status,
// // // // //               women_only: data.ride.women_only,
// // // // //               rating: data.ride.driver_rating || 4.5,
// // // // //               origin_lat: data.ride.origin_latitude,
// // // // //               origin_lon: data.ride.origin_longitude,
// // // // //               suggestedPickup: data.ride.suggested_pickup_point,
// // // // //               suggestedDrop: data.ride.suggested_drop_point,
// // // // //             });
            
// // // // //             const totalSeats = data.ride.available_seats || 4;
// // // // //             setTotalSeatsOffered(totalSeats);
// // // // //             setTotalBookedSeats(data.ride.total_booked_seats || userBooking.seats_requested || 1);
// // // // //             setAvailableSeats(totalSeats - (data.ride.total_booked_seats || userBooking.seats_requested || 1));
// // // // //               // In initializeData function, when setting userBooking
// // // // // setUserBooking({
// // // // //   id: Number(data.booking.id),  // Ensure it's a number
// // // // //   seats_requested: Number(data.booking.seats_requested) || 1,
// // // // //   status: data.booking.status,
// // // // //   total_amount: Number(data.booking.total_amount) || null,
// // // // //   created_at: data.booking.created_at,
// // // // // });
// // // // //             await fetchPassengersForRide(data.ride.id);
// // // // //             await loadDriverProfile(data.ride.driver_phone, data.ride.driver_user_id);
// // // // //             await fetchModificationRequests();
// // // // //             await fetchDriverRatingForRide();
// // // // //           }
// // // // //         } catch (error) {
// // // // //           console.log('Error initializing ride data:', error);
// // // // //         }
// // // // //       }
// // // // //     };
    
// // // // //     initializeData();
// // // // //   }, [userBooking?.id]);

// // // // //   // Helper function to fetch passengers
// // // // //   const fetchPassengersForRide = async (rideId) => {
// // // // //     if (!rideId || rideId === 3 || rideId === 0) return;
    
// // // // //     try {
// // // // //       const url = `${API_BASE_URL.replace(/\/$/, '')}/ride/${rideId}/passengers?_t=${Date.now()}`;
// // // // //       console.log('📡 Fetching passengers from:', url);
      
// // // // //       const response = await fetch(url);
      
// // // // //       if (response.ok) {
// // // // //         const data = await response.json();
// // // // //         console.log('📡 Passengers data:', data);
        
// // // // //         if (data.passengers && Array.isArray(data.passengers) && user?.phone_number) {
// // // // //           const normalizePhone = (phone) => {
// // // // //             if (!phone) return '';
// // // // //             let cleaned = phone.replace(/\s/g, '').replace(/-/g, '');
// // // // //             if (cleaned.startsWith('+91')) return cleaned;
// // // // //             if (cleaned.startsWith('91') && cleaned.length === 12) return `+${cleaned}`;
// // // // //             if (cleaned.startsWith('+')) return cleaned;
// // // // //             return `+91${cleaned}`;
// // // // //           };
          
// // // // //           const currentUserPhone = normalizePhone(user.phone_number);
// // // // //           const acceptedPassengers = data.passengers.filter(p => p.status === 'accepted');
// // // // //           const otherAccepted = acceptedPassengers.filter(p => {
// // // // //             const passengerPhone = normalizePhone(p.passenger_phone);
// // // // //             return passengerPhone !== currentUserPhone;
// // // // //           });
          
// // // // //           console.log('👥 Other riders:', otherAccepted);
// // // // //           setOtherRiders(otherAccepted);
// // // // //         }
// // // // //       } else {
// // // // //         console.log('Failed to fetch passengers, status:', response.status);
// // // // //       }
// // // // //     } catch (error) {
// // // // //       console.log('Error fetching passengers:', error);
// // // // //     }
// // // // //   };

// // // // //   // Helper function to load driver profile
// // // // //   const loadDriverProfile = async (driverPhone, driverUserId) => {
// // // // //     if (!driverPhone && !driverUserId) return;
    
// // // // //     try {
// // // // //       const params = new URLSearchParams();
// // // // //       if (driverUserId) params.append('user_id', driverUserId);
// // // // //       else if (driverPhone) params.append('phone_number', driverPhone);
// // // // //       params.append('_t', Date.now());
      
// // // // //       const profileRes = await fetch(`${API_BASE_URL}/api/v1/users/profile-public?${params.toString()}`);
// // // // //       const profileData = await profileRes.json();
      
// // // // //       if (profileData?.success && profileData.user) {
// // // // //         setDriverProfile(profileData.user);
// // // // //       }
// // // // //     } catch (error) {
// // // // //       console.log('Error loading driver profile:', error);
// // // // //     }
// // // // //   };
  
// // // // //   // Check live session
// // // // //   const checkLiveSession = useCallback(async () => {
// // // // //     const rideId = currentRide?.id;
// // // // //     if (!rideId) return;
    
// // // // //     try {
// // // // //       const response = await fetch(`${API_BASE_URL}/ride/${rideId}/live-session`);
// // // // //       const data = await response.json();
// // // // //       if (data.success && data.session) {
// // // // //         setLiveSession(data.session);
// // // // //       }
// // // // //     } catch (error) {
// // // // //       console.log('Error checking live session:', error);
// // // // //     }
// // // // //   }, [currentRide?.id]);
  
// // // // //   const checkSessionStatus = useCallback(async () => {
// // // // //   const bookingId = userBooking?.id;
// // // // //   if (!bookingId) return;
  
// // // // //   try {
// // // // //     // Use the correct endpoint from your backend
// // // // //     const res = await fetch(`${API_BASE_URL}/ride-sessions/rider/session-status/${bookingId}?rider_phone=${user?.phone_number}&_t=${Date.now()}`);
// // // // //     const data = await res.json();
    
// // // // //     console.log('🔍 Session Status Response:', data);
    
// // // // //     // Check if the response has the expected fields
// // // // //     if (data.success && data.ride_completed) {
// // // // //       setRideCompleted(true);
// // // // //       setHasRatedDriver(data.has_rated_driver);
      
// // // // //       if (data.has_rated_driver === false && !hasShownRatingModal.current) {
// // // // //         hasShownRatingModal.current = true;
// // // // //         setTimeout(() => setRatingModalVisible(true), 1000);
// // // // //       }
// // // // //     }
// // // // //   } catch (error) {
// // // // //     console.log('Error checking session status:', error);
// // // // //   }
// // // // // }, [userBooking?.id, user?.phone_number]);
// // // // //   // Get ride status
// // // // //   const getRideStatus = useCallback(() => {
// // // // //     if (rideCompleted) return 'completed';
// // // // //     if (!currentRide?.departure_time) return 'unknown';
// // // // //     if (currentRide?.cancellation_reason) {
// // // // //       if (currentRide.cancellation_reason.includes("Auto-cancelled")) return 'auto-cancelled';
// // // // //       return 'cancelled';
// // // // //     }
    
// // // // //     const now = new Date();
// // // // //     const departureTime = new Date(currentRide.departure_time);
// // // // //     const minutesToDeparture = (departureTime - now) / (1000 * 60);
// // // // //     const minutesSinceDeparture = (now - departureTime) / (1000 * 60);
    
// // // // //     if (currentRide?.started_at && !rideCompleted) return 'ongoing';
// // // // //     if (currentRide?.status === 'completed' || rideCompleted) return 'completed';
// // // // //     if (minutesSinceDeparture > 30) return 'expired';
// // // // //     if (minutesToDeparture <= 0 && minutesSinceDeparture <= 30) return 'late';
// // // // //     if (minutesToDeparture <= 15) return 'upcoming-soon';
// // // // //     if (minutesToDeparture > 15) return 'upcoming';
// // // // //     return 'unknown';
// // // // //   }, [currentRide?.departure_time, currentRide?.cancellation_reason, currentRide?.started_at, currentRide?.status, rideCompleted]);
  
// // // // //   const canModifySeats = useCallback(() => {
// // // // //     if (!userBooking) return false;
// // // // //     const rideStatus = getRideStatus();
// // // // //     if (rideCompleted) return false;
// // // // //     if (currentRide?.cancellation_reason || currentRide?.started_at) return false;
// // // // //     if (userBooking.status !== "accepted") return false;
// // // // //     if (['expired', 'auto-cancelled', 'upcoming-soon', 'late'].includes(rideStatus)) return false;
// // // // //     if (seatModificationRequested) return false;
// // // // //     return true;
// // // // //   }, [userBooking, getRideStatus, currentRide, seatModificationRequested, rideCompleted]);
  
// // // // //   const canCancelBooking = useCallback(() => {
// // // // //     if (!userBooking) return false;
// // // // //     const rideStatus = getRideStatus();
// // // // //     if (rideCompleted) return false;
// // // // //     if (currentRide?.cancellation_reason || currentRide?.started_at || currentRide?.status === 'completed') return false;
// // // // //     if (['expired', 'auto-cancelled', 'upcoming-soon', 'late'].includes(rideStatus)) return false;
// // // // //     if (!["accepted", "pending"].includes(userBooking.status)) return false;
// // // // //     return true;
// // // // //   }, [userBooking, getRideStatus, currentRide, rideCompleted]);
  
// // // // //   const getRideStatusMessage = useCallback(() => {
// // // // //     const rideStatus = getRideStatus();
// // // // //     const bookingStatus = userBooking?.status;
    
// // // // //     if (rideCompleted) {
// // // // //       return { message: "Ride completed", type: 'completed', icon: 'checkmark-done-circle', color: '#6B7280' };
// // // // //     }
// // // // //     if (currentRide?.cancellation_reason) {
// // // // //       return { message: currentRide.cancellation_reason, type: 'cancelled', icon: 'alert-circle', color: '#DC2626' };
// // // // //     }
// // // // //     if (bookingStatus === "rejected") {
// // // // //       return { message: "Your booking request was rejected", type: 'rejected', icon: 'close-circle', color: '#DC2626' };
// // // // //     }
// // // // //     if (bookingStatus === "pending") {
// // // // //       return { message: `Waiting for driver confirmation (${userBooking?.seats_requested} seat(s))`, type: 'pending', icon: 'time-outline', color: '#F59E0B' };
// // // // //     }
// // // // //     if (bookingStatus === "accepted") {
// // // // //       if (rideStatus === 'ongoing') return { message: "🚗 Ride in progress!", type: 'ongoing', icon: 'car-sport', color: '#10B981' };
// // // // //       if (rideStatus === 'upcoming') return { message: `Booking confirmed! ${userBooking?.seats_requested} seat(s)`, type: 'confirmed', icon: 'checkmark-circle', color: '#10B981' };
// // // // //     }
// // // // //     return null;
// // // // //   }, [getRideStatus, userBooking, currentRide, rideCompleted]);
  
// // // // //   // Actions
// // // // //   const handleModifySeats = async () => {
// // // // //     if (!userBooking || !canModifySeats()) {
// // // // //       showCustomAlert('Cannot Modify', 'Modifications are not available at this time.', 'warning');
// // // // //       return;
// // // // //     }
    
// // // // //     const currentSeatsBooked = userBooking.seats_requested || 0;
// // // // //     const otherBookedSeats = Math.max(0, totalBookedSeats - currentSeatsBooked);
// // // // //     const maxSeatsUserCanRequest = totalSeatsOffered - otherBookedSeats;
    
// // // // //     if (maxSeatsUserCanRequest <= 0) {
// // // // //       showCustomAlert('No Seats Available', 'No additional seats are available.', 'warning');
// // // // //       return;
// // // // //     }
// // // // //     if (seatsRequested > maxSeatsUserCanRequest) {
// // // // //       showCustomAlert('Not Enough Seats', `Only ${maxSeatsUserCanRequest} seat(s) available.`, 'warning');
// // // // //       return;
// // // // //     }
// // // // //     if (seatsRequested < 1) {
// // // // //       showCustomAlert('Invalid Seats', 'Minimum 1 seat required.', 'warning');
// // // // //       return;
// // // // //     }
// // // // //     if (seatsRequested === currentSeatsBooked) {
// // // // //       showCustomAlert('No Change', 'Seat count is already set to this value.', 'info');
// // // // //       return;
// // // // //     }
    
// // // // //     setModifyingSeats(true);
// // // // //     try {
// // // // //       const response = await fetch(`${API_BASE_URL}/api/v1/modifications/request/${userBooking.id}`, {
// // // // //         method: 'POST',
// // // // //         headers: { 'Content-Type': 'application/json' },
// // // // //         body: JSON.stringify({ requested_seats: seatsRequested }),
// // // // //       });
// // // // //       const data = await response.json();
// // // // //       if (!response.ok) throw new Error(data.detail || data.message);
      
// // // // //       showCustomAlert('Request Sent', `Request to change to ${seatsRequested} seat(s) sent.`, 'info');
// // // // //       setSeatModificationRequested(true);
// // // // //       setPendingSeatsRequest(seatsRequested);
// // // // //       await fetchModificationRequests();
// // // // //     } catch (error) {
// // // // //       showCustomAlert('Error', error.message, 'error');
// // // // //     } finally {
// // // // //       setModifyingSeats(false);
// // // // //     }
// // // // //   };
  
// // // // //   const handleCancelBooking = async () => {
// // // // //     if (!userBooking || !canCancelBooking()) return;
    
// // // // //     setModifyingSeats(true);
// // // // //     setCancelLoading(true);
// // // // //     try {
// // // // //       const response = await fetch(`${API_BASE_URL}/booking/${userBooking.id}/cancel`, {
// // // // //         method: 'PUT',
// // // // //         headers: { 'Content-Type': 'application/json' },
// // // // //       });
// // // // //       const data = await response.json();
// // // // //       if (!response.ok) throw new Error(data.detail || data.message);
      
// // // // //       showCustomAlert('Success', 'Booking cancelled successfully', 'success');
// // // // //       setTimeout(() => navigation.goBack(), 1500);
// // // // //     } catch (error) {
// // // // //       showCustomAlert('Error', error.message, 'error');
// // // // //     } finally {
// // // // //       setModifyingSeats(false);
// // // // //       setCancelLoading(false);
// // // // //       setShowCancelModal(false);
// // // // //     }
// // // // //   };
  
// // // // //   const viewDriverProfile = () => {
// // // // //     const driverPhone = currentRide?.phoneNumber || currentRide?.driver_phone;
// // // // //     const driverUserId = currentRide?.driverUserId || currentRide?.driver_user_id;
// // // // //     if (driverPhone || driverUserId) {
// // // // //       navigation.navigate('ViewProfileScreen', {
// // // // //         userId: driverUserId || null,
// // // // //         phoneNumber: driverPhone || null,
// // // // //         driverName: driverProfile?.full_name || currentRide?.driverName || 'Driver',
// // // // //         profilePicture: getProfilePhotoUrl(),
// // // // //       });
// // // // //     }
// // // // //   };
  
// // // // //   const shareRideDetails = async () => {
// // // // //     const message = `🚗 *Ride Details* 🚗\n\n` +
// // // // //       `From: ${currentRide?.from || currentRide?.origin || 'Pickup'}\n` +
// // // // //       `To: ${currentRide?.to || currentRide?.destination || 'Drop'}\n` +
// // // // //       `Date: ${formatDate(currentRide?.departure_time)}\n` +
// // // // //       `Price: ₹${currentRide?.price || currentRide?.price_per_seat || 0}/seat\n` +
// // // // //       `Seats: ${userBooking?.seats_requested || 1}\n` +
// // // // //       `Total: ₹${(currentRide?.price || currentRide?.price_per_seat || 0) * (userBooking?.seats_requested || 1)}\n\n` +
// // // // //       `Driver: ${driverProfile?.full_name || currentRide?.driverName || 'Driver'}`;
    
// // // // //     await Share.share({ message, title: 'Ride Details' });
// // // // //   };
  
// // // // //   const handleProfileImagePress = () => {
// // // // //     const photoUrl = getProfilePhotoUrl();
// // // // //     if (photoUrl) {
// // // // //       setSelectedProfile({ visible: true, imageUrl: photoUrl, driverName: driverProfile?.full_name || currentRide?.driverName || 'Driver' });
// // // // //     } else {
// // // // //       showCustomAlert('No Photo', 'Driver has not uploaded a profile picture', 'warning');
// // // // //     }
// // // // //   };
  
// // // // //   // Effects
// // // // //   useEffect(() => {
// // // // //     if (currentRide) {
// // // // //       loadDriverData();
// // // // //       fetchSeatAvailability();
// // // // //       checkLiveSession();
// // // // //       checkSessionStatus();
// // // // //     }
// // // // //   }, [currentRide]);
  
// // // // //   useFocusEffect(
// // // // //     useCallback(() => {
// // // // //       if (currentRide) {
// // // // //         fetchSeatAvailability();
// // // // //         checkLiveSession();
// // // // //         checkSessionStatus();
// // // // //         fetchModificationRequests();
// // // // //         fetchDriverRatingForRide();
// // // // //       }
// // // // //       hasShownRatingModal.current = false;
// // // // //       return () => {
// // // // //         if (socketRef.current) {
// // // // //           socketRef.current.disconnect();
// // // // //           socketRef.current = null;
// // // // //         }
// // // // //       };
// // // // //     }, [currentRide])
// // // // //   );
  
// // // // //   // Memoized values for map
// // // // //   const profilePhotoUrl = getProfilePhotoUrl();
// // // // //   const avatarText = getDriverInitials(driverProfile?.full_name || currentRide?.driverName || 'Driver');
// // // // //   const isProfilePhotoSvg = profilePhotoUrl?.toLowerCase().includes('.svg');
// // // // //   const allPreferences = useMemo(() => extractAllPreferences(currentRide, driverProfile?.travel_preferences), [currentRide, driverProfile]);
  
// // // // //   const driverStart = useMemo(() => {
// // // // //     const coords = currentRide?.routeCoordinates;
// // // // //     if (Array.isArray(coords) && coords.length > 0) {
// // // // //       const first = coords[0];
// // // // //       if (Array.isArray(first) && first.length === 2) return { latitude: first[1], longitude: first[0] };
// // // // //     }
// // // // //     return parseSuggestedPoint(currentRide?.suggestedPickup || currentRide?.suggested_pickup_point);
// // // // //   }, [currentRide]);
  
// // // // //   const driverEnd = useMemo(() => {
// // // // //     const coords = currentRide?.routeCoordinates;
// // // // //     if (Array.isArray(coords) && coords.length > 0) {
// // // // //       const last = coords[coords.length - 1];
// // // // //       if (Array.isArray(last) && last.length === 2) return { latitude: last[1], longitude: last[0] };
// // // // //     }
// // // // //     return parseSuggestedPoint(currentRide?.suggestedDrop || currentRide?.suggested_drop_point);
// // // // //   }, [currentRide]);
  
// // // // //   const intersectionPickup = useMemo(() => parseSuggestedPoint(currentRide?.suggestedPickup || currentRide?.suggested_pickup_point), [currentRide]);
// // // // //   const intersectionDrop = useMemo(() => parseSuggestedPoint(currentRide?.suggestedDrop || currentRide?.suggested_drop_point), [currentRide]);
  
// // // // //   const routePath = useMemo(() => {
// // // // //     const fullRoute = parseRouteCoordinates(currentRide?.routeCoordinates);
// // // // //     if (fullRoute.length >= 2) return fullRoute;
// // // // //     if (intersectionPickup && intersectionDrop) return [intersectionPickup, intersectionDrop];
// // // // //     return [];
// // // // //   }, [currentRide, intersectionPickup, intersectionDrop]);
  
// // // // //   const allMarkerCoords = useMemo(() => {
// // // // //     const coords = [];
// // // // //     if (driverStart) coords.push(driverStart);
// // // // //     if (driverEnd) coords.push(driverEnd);
// // // // //     if (intersectionPickup) coords.push(intersectionPickup);
// // // // //     if (intersectionDrop) coords.push(intersectionDrop);
// // // // //     if (driverLocation) coords.push(driverLocation);
// // // // //     return coords;
// // // // //   }, [driverStart, driverEnd, intersectionPickup, intersectionDrop, driverLocation]);
  
// // // // //   const fitMapToMarkers = useCallback(() => {
// // // // //     if (mapRef.current && mapReady && allMarkerCoords.length >= 1) {
// // // // //       setTimeout(() => {
// // // // //         try {
// // // // //           if (allMarkerCoords.length === 1) {
// // // // //             mapRef.current.animateToRegion({
// // // // //               latitude: allMarkerCoords[0].latitude,
// // // // //               longitude: allMarkerCoords[0].longitude,
// // // // //               latitudeDelta: 0.01,
// // // // //               longitudeDelta: 0.01,
// // // // //             }, 500);
// // // // //           } else {
// // // // //             mapRef.current.fitToCoordinates(allMarkerCoords, {
// // // // //               edgePadding: { top: 80, right: 50, bottom: 50, left: 50 },
// // // // //               animated: true,
// // // // //             });
// // // // //           }
// // // // //         } catch (e) { console.log('fitToCoordinates error:', e); }
// // // // //       }, 500);
// // // // //     }
// // // // //   }, [mapReady, allMarkerCoords]);
  
// // // // //   useEffect(() => {
// // // // //     if (mapReady && allMarkerCoords.length >= 1) fitMapToMarkers();
// // // // //   }, [mapReady, allMarkerCoords, fitMapToMarkers]);
  
// // // // //   const vehicleName = driverProfile?.vehicle?.model || currentRide?.vehicle?.model || 'Vehicle details unavailable';
// // // // //   const vehicleRegNumber = driverProfile?.vehicle?.registration_number || currentRide?.vehicle?.registration_number;
// // // // //   const vehicleColor = driverProfile?.vehicle?.color || currentRide?.vehicle?.color || 'Not specified';
  
// // // // //   const rideStatus = getRideStatus();
// // // // //   const modificationsAllowed = canModifySeats();
// // // // //   const cancellationsAllowed = canCancelBooking();
// // // // //   const rideStatusMessage = getRideStatusMessage();
// // // // //   const isAutoCancelled = rideStatus === 'auto-cancelled' || rideStatus === 'expired';
// // // // //   const showLiveTracking = userBooking?.id && !rideCompleted && userBooking?.status === 'accepted';
// // // // //   // const showLiveTracking = liveSession && (rideStatus === 'ongoing' || rideStatus === 'late') && !rideCompleted;
// // // // //   const isCompleted = rideStatus === 'completed';
  
// // // // //   const otherBookedSeats = totalBookedSeats - (userBooking?.seats_requested || 0);
// // // // //   const maxUserCanRequest = totalSeatsOffered - otherBookedSeats;
// // // // //   const totalAmountPaid = (currentRide?.price || currentRide?.price_per_seat || 0) * (userBooking?.seats_requested || 1);
  
// // // // //   const initialRegion = {
// // // // //     latitude: intersectionPickup?.latitude || driverStart?.latitude || 28.6139,
// // // // //     longitude: intersectionPickup?.longitude || driverStart?.longitude || 77.2090,
// // // // //     latitudeDelta: 0.05,
// // // // //     longitudeDelta: 0.05,
// // // // //   };
  
// // // // //   if (!currentRide) {
// // // // //     return (
// // // // //       <View style={styles.loaderContainer}>
// // // // //         <Text style={{ fontSize: 16, color: Colors.gray, marginBottom: 20 }}>No ride data available</Text>
// // // // //         <TouchableOpacity onPress={() => navigation.goBack()} style={{ padding: 12, backgroundColor: Colors.primary, borderRadius: 8 }}>
// // // // //           <Text style={{ color: '#fff' }}>Go Back</Text>
// // // // //         </TouchableOpacity>
// // // // //       </View>
// // // // //     );
// // // // //   }
  
// // // // //   // Main render
// // // // //   return (
// // // // //     <View style={styles.container}>
// // // // //       <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />
      
// // // // //       <Animated.View style={[styles.mapContainer, { height: mapHeight }]}>
// // // // //         <MapView
// // // // //           ref={mapRef}
// // // // //           provider={PROVIDER_GOOGLE}
// // // // //           style={styles.map}
// // // // //           initialRegion={initialRegion}
// // // // //           onMapReady={() => setMapReady(true)}
// // // // //           showsUserLocation={true}
// // // // //           showsMyLocationButton={true}
// // // // //         >
// // // // //           {routePath.length >= 2 && <Polyline coordinates={routePath} strokeColor="#2457A6" strokeWidth={5} lineCap="round" lineJoin="round" />}
          
// // // // //           {driverStart && (
// // // // //             <Marker coordinate={driverStart} anchor={{ x: 0.5, y: 1 }}>
// // // // //               <View style={styles.markerWrapper}>
// // // // //                 <View style={[styles.pinBubble, { backgroundColor: '#16A34A' }]}><Text style={styles.pinIcon}>S</Text></View>
// // // // //                 <View style={[styles.pinPointer, { borderTopColor: '#16A34A' }]} />
// // // // //               </View>
// // // // //             </Marker>
// // // // //           )}
          
// // // // //           {driverEnd && (
// // // // //             <Marker coordinate={driverEnd} anchor={{ x: 0.5, y: 1 }}>
// // // // //               <View style={styles.markerWrapper}>
// // // // //                 <View style={[styles.pinBubble, { backgroundColor: '#DC2626' }]}><Text style={styles.pinIcon}>E</Text></View>
// // // // //                 <View style={[styles.pinPointer, { borderTopColor: '#DC2626' }]} />
// // // // //               </View>
// // // // //             </Marker>
// // // // //           )}
          
// // // // //           {intersectionPickup && (
// // // // //             <Marker coordinate={intersectionPickup} anchor={{ x: 0.5, y: 1 }}>
// // // // //               <View style={styles.markerWrapper}>
// // // // //                 <View style={[styles.pinBubble, { backgroundColor: '#FACC15' }]}><Ionicons name="hand-right" size={12} color="#713F12" /></View>
// // // // //                 <View style={[styles.pinPointer, { borderTopColor: '#FACC15' }]} />
// // // // //                 <View style={styles.pinLabelBubbleYellow}><Text style={styles.pinLabelTextYellow}>Meet Driver</Text></View>
// // // // //               </View>
// // // // //             </Marker>
// // // // //           )}
          
// // // // //           {intersectionDrop && (
// // // // //             <Marker coordinate={intersectionDrop} anchor={{ x: 0.5, y: 1 }}>
// // // // //               <View style={styles.markerWrapper}>
// // // // //                 <View style={[styles.pinBubble, { backgroundColor: '#FACC15' }]}><Ionicons name="exit" size={12} color="#713F12" /></View>
// // // // //                 <View style={[styles.pinPointer, { borderTopColor: '#FACC15' }]} />
// // // // //                 <View style={styles.pinLabelBubbleYellow}><Text style={styles.pinLabelTextYellow}>Exit Here</Text></View>
// // // // //               </View>
// // // // //             </Marker>
// // // // //           )}
// // // // //         </MapView>
        
// // // // //         <TouchableOpacity style={styles.mapBackButton} onPress={() => navigation.goBack()}>
// // // // //           <Ionicons name="chevron-back" size={26} color={Colors.secondary} />
// // // // //         </TouchableOpacity>
        
// // // // // {showLiveTracking && (
// // // // //   <TouchableOpacity 
// // // // //     style={styles.liveTrackingButton} 
// // // // //     onPress={() => navigation.navigate('OngoingRideRiderScreen', { 
// // // // //       bookingId: userBooking?.id, 
// // // // //       sessionId: liveSession?.session_id || null 
// // // // //     })}
// // // // //   >
// // // // //     <View style={styles.liveDot} />
// // // // //     <Text style={styles.liveTrackingButtonText}>Track Live Ride</Text>
// // // // //   </TouchableOpacity>
// // // // // )}
// // // // //       </Animated.View>
      
// // // // //       <Animated.View style={[styles.drawer, { height: drawerHeight }]}>
// // // // //         <View style={styles.handleWrap} {...panResponder.panHandlers}>
// // // // //           <TouchableOpacity activeOpacity={0.9} onPress={toggleDrawer} style={styles.handleHitArea}>
// // // // //             <View style={styles.handleBar} />
// // // // //           </TouchableOpacity>
// // // // //         </View>
        
// // // // //         {!drawerExpanded ? (
// // // // //           <View style={styles.collapsedSummary}>
// // // // //             <View style={styles.collapsedTopRow}>
// // // // //               <View style={{ flex: 1 }}>
// // // // //                 <Text style={styles.collapsedDriver} numberOfLines={1}>{driverProfile?.full_name || currentRide?.driverName || 'Driver'}</Text>
// // // // //                 <Text style={styles.collapsedSub} numberOfLines={1}>{currentRide?.from || currentRide?.origin || 'Pickup'} → {currentRide?.to || currentRide?.destination || 'Drop'}</Text>
// // // // //               </View>
// // // // //               <View style={styles.collapsedPriceWrap}>
// // // // //                 <Text style={styles.collapsedPrice}>₹{currentRide?.price || currentRide?.price_per_seat || 0}</Text>
// // // // //                 <Text style={styles.collapsedPerSeat}>per seat</Text>
// // // // //               </View>
// // // // //             </View>
// // // // //           </View>
// // // // //         ) : (
// // // // //           <ScrollView style={styles.drawerScroll} contentContainerStyle={styles.drawerContent}>
// // // // //             {/* Status Banner */}
// // // // //             {rideStatusMessage && (
// // // // //               <View style={[styles.statusBanner, { backgroundColor: rideStatusMessage.color + '20' }]}>
// // // // //                 <Ionicons name={rideStatusMessage.icon} size={20} color={rideStatusMessage.color} />
// // // // //                 <Text style={[styles.statusBannerText, { color: rideStatusMessage.color, flex: 1 }]}>{rideStatusMessage.message}</Text>
// // // // //               </View>
// // // // //             )}
            
// // // // //             {/* Driver Card with Chat Button */}
// // // // //             <View style={styles.driverCard}>
// // // // //               <View style={styles.driverTopRow}>
// // // // //                 <View style={styles.driverLeftWrap}>
// // // // //                   <TouchableOpacity style={styles.driverAvatar} onPress={handleProfileImagePress}>
// // // // //                     {profilePhotoUrl ? (
// // // // //                       isProfilePhotoSvg ? (
// // // // //                         <View style={styles.svgAvatarContainer}><SvgCssUri uri={profilePhotoUrl} width={56} height={56} /></View>
// // // // //                       ) : (
// // // // //                         <Image source={{ uri: profilePhotoUrl }} style={styles.avatarImg} />
// // // // //                       )
// // // // //                     ) : (
// // // // //                       <View style={styles.avatarPlaceholder}>
// // // // //                         <Text style={styles.avatarText}>{avatarText}</Text>
// // // // //                       </View>
// // // // //                     )}
// // // // //                   </TouchableOpacity>
// // // // //                   <View style={styles.driverMeta}>
// // // // //                     <View style={styles.driverNameRow}>
// // // // //                       <Text style={styles.driverName}>{driverProfile?.full_name || currentRide?.driverName || 'Driver'}</Text>
// // // // //                       {isVerified && <Ionicons name="checkmark-circle" size={14} color="#2457A6" />}
// // // // //                     </View>
// // // // //                     <View style={styles.ratingRow}>
// // // // //                       <Ionicons name="star" size={13} color="#F59E0B" />
// // // // //                       <Text style={styles.ratingText}>{driverProfile?.avg_rating || currentRide?.rating || 4.5}</Text>
// // // // //                     </View>
// // // // //                   </View>
// // // // //                 </View>
// // // // //                 {/* Chat Button */}
// // // // //                 <TouchableOpacity style={styles.chatButton} onPress={handleChatWithDriver}>
// // // // //                   <Ionicons name="chatbubble-ellipses" size={22} color="#2457A6" />
// // // // //                 </TouchableOpacity>
// // // // //               </View>
              
// // // // //               {/* Action Buttons Row */}
// // // // //               <View style={styles.actionButtonsRow}>
// // // // //                 <TouchableOpacity style={styles.profileOutlineBtn} onPress={viewDriverProfile}>
// // // // //                   <Text style={styles.profileOutlineBtnText}>View Full Profile</Text>
// // // // //                 </TouchableOpacity>
// // // // //                 <TouchableOpacity style={styles.shareOutlineBtn} onPress={shareRideDetails}>
// // // // //                   <Ionicons name="share-outline" size={18} color="#2457A6" />
// // // // //                   <Text style={styles.shareOutlineBtnText}>Share</Text>
// // // // //                 </TouchableOpacity>
// // // // //               </View>
// // // // //             </View>
            
// // // // //             {/* Driver's Rating for This Ride */}
// // // // //             {showDriverRating && driverRating && (
// // // // //               <View style={styles.driverRatingCard}>
// // // // //                 <View style={styles.driverRatingHeader}>
// // // // //                   <Ionicons name="star" size={18} color="#F59E0B" />
// // // // //                   <Text style={styles.driverRatingTitle}>Driver's Rating for this Ride</Text>
// // // // //                 </View>
// // // // //                 <View style={styles.driverRatingContent}>
// // // // //                   <RatingStars rating={driverRating} size={20} />
// // // // //                   {driverFeedbackText ? (
// // // // //                     <Text style={styles.driverFeedbackText}>"{driverFeedbackText}"</Text>
// // // // //                   ) : (
// // // // //                     <Text style={styles.driverFeedbackPlaceholder}>No feedback provided</Text>
// // // // //                   )}
// // // // //                 </View>
// // // // //               </View>
// // // // //             )}
            
// // // // //             {/* Trip Details Section */}
// // // // //             <View style={styles.cardSection}>
// // // // //               <Text style={styles.sectionTitle}>📍 Trip Details</Text>
              
// // // // //               <View style={styles.tripItem}>
// // // // //                 <View style={styles.tripIconContainer}>
// // // // //                   <Ionicons name="location" size={20} color="#16A34A" />
// // // // //                 </View>
// // // // //                 <View style={styles.tripDetails}>
// // // // //                   <Text style={styles.tripLabel}>From</Text>
// // // // //                   <Text style={styles.tripValue}>{currentRide?.from || currentRide?.origin || 'Pickup location'}</Text>
// // // // //                 </View>
// // // // //               </View>
              
// // // // //               <View style={styles.tripDivider} />
              
// // // // //               <View style={styles.tripItem}>
// // // // //                 <View style={styles.tripIconContainer}>
// // // // //                   <Ionicons name="flag" size={20} color="#DC2626" />
// // // // //                 </View>
// // // // //                 <View style={styles.tripDetails}>
// // // // //                   <Text style={styles.tripLabel}>To</Text>
// // // // //                   <Text style={styles.tripValue}>{currentRide?.to || currentRide?.destination || 'Drop location'}</Text>
// // // // //                 </View>
// // // // //               </View>
              
// // // // //               <View style={styles.tripMetaRow}>
// // // // //                 <View style={styles.tripMetaItem}>
// // // // //                   <Ionicons name="calendar-outline" size={16} color={Colors.gray} />
// // // // //                   <Text style={styles.tripMetaText}>{formatDate(currentRide?.departure_time)}</Text>
// // // // //                 </View>
// // // // //                 {currentRide?.distance_km && (
// // // // //                   <View style={styles.tripMetaItem}>
// // // // //                     <Ionicons name="map-outline" size={16} color={Colors.gray} />
// // // // //                     <Text style={styles.tripMetaText}>{currentRide.distance_km} km</Text>
// // // // //                   </View>
// // // // //                 )}
// // // // //                 {currentRide?.duration_text && (
// // // // //                   <View style={styles.tripMetaItem}>
// // // // //                     <Ionicons name="time-outline" size={16} color={Colors.gray} />
// // // // //                     <Text style={styles.tripMetaText}>{currentRide.duration_text}</Text>
// // // // //                   </View>
// // // // //                 )}
// // // // //               </View>
// // // // //             </View>
            
// // // // //             {/* Vehicle Details Section */}
// // // // //             <View style={styles.cardSection}>
// // // // //               <Text style={styles.sectionTitle}>🚗 Vehicle Details</Text>
// // // // //               <View style={styles.vehicleDetailRow}>
// // // // //                 <Ionicons name="car-sport-outline" size={24} color="#2457A6" />
// // // // //                 <View style={styles.vehicleDetailInfo}>
// // // // //                   <Text style={styles.vehicleDetailName}>{vehicleName}</Text>
// // // // //                   <Text style={styles.vehicleDetailColor}>Color: {vehicleColor}</Text>
// // // // //                   {vehicleRegNumber && <Text style={styles.vehicleDetailReg}>Registration: {vehicleRegNumber}</Text>}
// // // // //                   <Text style={styles.vehicleDetailSeats}>Total Seats: {totalSeatsOffered}</Text>
// // // // //                 </View>
// // // // //               </View>
// // // // //             </View>
            
// // // // //             {/* Seat Availability Section */}
// // // // //             <View style={styles.cardSection}>
// // // // //               <Text style={styles.sectionTitle}>💺 Seat Availability</Text>
// // // // //               <View style={styles.seatStatsRow}>
// // // // //                 <View style={styles.seatStat}>
// // // // //                   <Text style={styles.seatStatValue}>{totalSeatsOffered}</Text>
// // // // //                   <Text style={styles.seatStatLabel}>Total Seats</Text>
// // // // //                 </View>
// // // // //                 <View style={styles.seatStat}>
// // // // //                   <Text style={[styles.seatStatValue, { color: '#10B981' }]}>{totalBookedSeats}</Text>
// // // // //                   <Text style={styles.seatStatLabel}>Booked</Text>
// // // // //                 </View>
// // // // //                 <View style={styles.seatStat}>
// // // // //                   <Text style={[styles.seatStatValue, { color: '#F59E0B' }]}>{availableSeats}</Text>
// // // // //                   <Text style={styles.seatStatLabel}>Available</Text>
// // // // //                 </View>
// // // // //               </View>
// // // // //               <View style={styles.seatProgressContainer}>
// // // // //                 <View style={[styles.seatProgressBar, { width: `${totalSeatsOffered > 0 ? (totalBookedSeats / totalSeatsOffered) * 100 : 0}%` }]} />
// // // // //               </View>
// // // // //             </View>
            
// // // // //             {/* Ride Preferences Section */}
// // // // //             {allPreferences.length > 0 && (
// // // // //               <View style={styles.cardSection}>
// // // // //                 <Text style={styles.sectionTitle}>🎯 Ride Preferences</Text>
// // // // //                 <View style={styles.tagRow}>
// // // // //                   {allPreferences.map((pref, index) => (
// // // // //                     <GenericPreferenceTag key={`${pref}-${index}`} label={pref} />
// // // // //                   ))}
// // // // //                 </View>
// // // // //               </View>
// // // // //             )}
            
// // // // //             {/* Booking Details Section */}
// // // // //             <View style={styles.cardSection}>
// // // // //               <Text style={styles.sectionTitle}>📋 Your Booking</Text>
              
// // // // //               {userBooking ? (
// // // // //                 <>
// // // // //                   <View style={styles.bookingDetailRow}>
// // // // //                     <Text style={styles.bookingDetailLabel}>Booking ID</Text>
// // // // //                     <Text style={styles.bookingDetailValue}>#{userBooking.id}</Text>
// // // // //                   </View>
// // // // //                   <View style={styles.bookingDetailRow}>
// // // // //                     <Text style={styles.bookingDetailLabel}>Seats Booked</Text>
// // // // //                     <Text style={styles.bookingDetailValue}>{userBooking.seats_requested}</Text>
// // // // //                   </View>
// // // // //                   <View style={styles.bookingDetailRow}>
// // // // //                     <Text style={styles.bookingDetailLabel}>Price per Seat</Text>
// // // // //                     <Text style={styles.bookingDetailValue}>₹{currentRide?.price || currentRide?.price_per_seat || 0}</Text>
// // // // //                   </View>
// // // // //                   <View style={[styles.bookingDetailRow, styles.bookingTotalRow]}>
// // // // //                     <Text style={styles.bookingTotalLabel}>Total Amount</Text>
// // // // //                     <Text style={styles.bookingTotalValue}>₹{totalAmountPaid}</Text>
// // // // //                   </View>
// // // // //                   <View style={styles.bookingDetailRow}>
// // // // //                     <Text style={styles.bookingDetailLabel}>Status</Text>
// // // // //                     <View style={[styles.bookingStatusBadge, { backgroundColor: userBooking.status === 'accepted' ? '#10B98120' : userBooking.status === 'pending' ? '#F59E0B20' : '#EF444420' }]}>
// // // // //                       <Text style={[styles.bookingStatusText, { color: userBooking.status === 'accepted' ? '#10B981' : userBooking.status === 'pending' ? '#F59E0B' : '#EF4444' }]}>
// // // // //                         {userBooking.status === 'accepted' ? 'Confirmed' : userBooking.status === 'pending' ? 'Pending' : userBooking.status}
// // // // //                       </Text>
// // // // //                     </View>
// // // // //                   </View>
// // // // //                 </>
// // // // //               ) : (
// // // // //                 <Text style={styles.emptyText}>No booking information available</Text>
// // // // //               )}
              
// // // // //               {/* Pending Modification Request Section */}
// // // // //               {pendingModificationRequest && pendingModificationRequest.status === 'pending' && (
// // // // //                 <>
// // // // //                   <View style={styles.divider} />
// // // // //                   <View style={styles.pendingModificationHeader}>
// // // // //                     <Ionicons name="time-outline" size={24} color="#F59E0B" />
// // // // //                     <Text style={styles.pendingModificationTitle}>Pending Modification Request</Text>
// // // // //                   </View>
                  
// // // // //                   <View style={styles.pendingModificationDetails}>
// // // // //                     <View style={styles.modificationDetailRow}>
// // // // //                       <Text style={styles.modificationDetailLabel}>Current Seats:</Text>
// // // // //                       <Text style={styles.modificationDetailValue}>{pendingModificationRequest.current_seats || userBooking?.seats_requested}</Text>
// // // // //                     </View>
// // // // //                     <View style={styles.modificationDetailRow}>
// // // // //                       <Text style={styles.modificationDetailLabel}>Requested Seats:</Text>
// // // // //                       <Text style={[styles.modificationDetailValue, { color: '#F59E0B', fontWeight: '800' }]}>
// // // // //                         {pendingModificationRequest.requested_seats || pendingSeatsRequest}
// // // // //                       </Text>
// // // // //                     </View>
// // // // //                     <View style={styles.modificationDetailRow}>
// // // // //                       <Text style={styles.modificationDetailLabel}>Status:</Text>
// // // // //                       <View style={[styles.pendingBadge, { backgroundColor: '#FEF3C7' }]}>
// // // // //                         <Text style={[styles.pendingBadgeText, { color: '#D97706' }]}>Waiting for Driver Approval</Text>
// // // // //                       </View>
// // // // //                     </View>
// // // // //                     {pendingModificationRequest.created_at && (
// // // // //                       <Text style={styles.modificationDate}>
// // // // //                         Requested on: {new Date(pendingModificationRequest.created_at).toLocaleString()}
// // // // //                       </Text>
// // // // //                     )}
// // // // //                   </View>
                  
// // // // //                   <TouchableOpacity 
// // // // //                     style={styles.cancelModificationBtn}
// // // // //                     onPress={handleCancelModificationRequest}
// // // // //                     disabled={modifyingSeats}
// // // // //                   >
// // // // //                     <Text style={styles.cancelModificationBtnText}>
// // // // //                       {modifyingSeats ? 'Cancelling...' : 'Cancel Request'}
// // // // //                     </Text>
// // // // //                   </TouchableOpacity>
// // // // //                 </>
// // // // //               )}
              
// // // // //               {/* Modify Seats Section - Only show if no pending modification */}
// // // // //               {modificationsAllowed && userBooking?.status === "accepted" && !isAutoCancelled && totalSeatsOffered > 0 && !seatModificationRequested && (
// // // // //                 <>
// // // // //                   <View style={styles.divider} />
// // // // //                   <Text style={styles.sectionSubtitle}>Modify Seats</Text>
                  
// // // // //                   {otherBookedSeats > 0 && (
// // // // //                     <View style={styles.otherBookedInfo}>
// // // // //                       <Ionicons name="information-circle" size={14} color="#F59E0B" />
// // // // //                       <Text style={styles.otherBookedInfoText}>{otherBookedSeats} seat(s) booked by others</Text>
// // // // //                     </View>
// // // // //                   )}
                  
// // // // //                   <View style={styles.seatSelectorRow}>
// // // // //                     <TouchableOpacity style={[styles.seatActionBtn, seatsRequested === 1 && styles.seatActionBtnDisabled]} onPress={() => setSeatsRequested(Math.max(1, seatsRequested - 1))} disabled={seatsRequested === 1 || modifyingSeats}>
// // // // //                       <Ionicons name="remove" size={20} color={seatsRequested === 1 ? Colors.gray : Colors.dark} />
// // // // //                     </TouchableOpacity>
// // // // //                     <View style={styles.seatCountWrap}>
// // // // //                       <Text style={styles.seatCountText}>{seatsRequested}</Text>
// // // // //                       <Text style={styles.seatAvailableText}>/ {maxUserCanRequest} max</Text>
// // // // //                     </View>
// // // // //                     <TouchableOpacity style={[styles.seatActionBtn, seatsRequested >= maxUserCanRequest && styles.seatActionBtnDisabled]} onPress={() => setSeatsRequested(Math.min(maxUserCanRequest, seatsRequested + 1))} disabled={seatsRequested >= maxUserCanRequest || modifyingSeats}>
// // // // //                       <Ionicons name="add" size={20} color={seatsRequested >= maxUserCanRequest ? Colors.gray : "#2457A6"} />
// // // // //                     </TouchableOpacity>
// // // // //                   </View>
                  
// // // // //                   <TouchableOpacity style={[styles.updateSeatsBtn, (modifyingSeats || seatsRequested === userBooking?.seats_requested) && styles.updateSeatsBtnDisabled]} onPress={handleModifySeats} disabled={modifyingSeats || seatsRequested === userBooking?.seats_requested}>
// // // // //                     <Text style={styles.updateSeatsBtnText}>{modifyingSeats ? 'Sending...' : 'Request Seat Change'}</Text>
// // // // //                   </TouchableOpacity>
// // // // //                 </>
// // // // //               )}
              
// // // // //               {/* Cancel Booking Button */}
// // // // //               {cancellationsAllowed && userBooking?.status !== "rejected" && !isAutoCancelled && (
// // // // //                 <TouchableOpacity style={[styles.cancelBookingBtn, (modifyingSeats || cancelLoading) && styles.cancelBookingBtnDisabled]} onPress={() => setShowCancelModal(true)} disabled={modifyingSeats || cancelLoading}>
// // // // //                   <Text style={styles.cancelBookingBtnText}>{userBooking?.status === "pending" ? "Cancel Request" : "Cancel Booking"}</Text>
// // // // //                 </TouchableOpacity>
// // // // //               )}
// // // // //             </View>
            
// // // // //             {/* Other Riders Section */}
// // // // //             <View style={styles.cardSection}>
// // // // //               <Text style={styles.sectionTitle}>👥 Other Riders ({otherRiders.length})</Text>
// // // // //               {otherRiders.length === 0 ? (
// // // // //                 <View style={styles.noRidersContainer}>
// // // // //                   <Ionicons name="people-outline" size={40} color={Colors.gray} />
// // // // //                   <Text style={styles.noRidersText}>No other riders yet</Text>
// // // // //                 </View>
// // // // //               ) : (
// // // // //                 otherRiders.map((rider, index) => (
// // // // //                   <View key={rider.booking_id || index} style={styles.otherRiderItem}>
// // // // //                     <View style={styles.otherRiderAvatar}>
// // // // //                       {rider.profile_picture ? (
// // // // //                         <Image source={{ uri: buildImageUrl(rider.profile_picture) }} style={styles.otherRiderAvatarImg} />
// // // // //                       ) : (
// // // // //                         <View style={styles.otherRiderAvatarPlaceholder}>
// // // // //                           <Text style={styles.otherRiderAvatarText}>{getDriverInitials(rider.passenger_name)}</Text>
// // // // //                         </View>
// // // // //                       )}
// // // // //                     </View>
// // // // //                     <View style={styles.otherRiderInfo}>
// // // // //                       <Text style={styles.otherRiderName}>{rider.passenger_name || 'Rider'}</Text>
// // // // //                       <Text style={styles.otherRiderSeats}>{rider.seats_booked || 1} seat(s)</Text>
// // // // //                     </View>
// // // // //                   </View>
// // // // //                 ))
// // // // //               )}
// // // // //             </View>
            
// // // // //             {/* Safety Card */}
// // // // //             <View style={styles.safetyCard}>
// // // // //               <Ionicons name="shield-checkmark-outline" size={18} color="#2457A6" />
// // // // //               <View>
// // // // //                 <Text style={styles.safetyTitle}>Safety First</Text>
// // // // //                 <Text style={styles.safetySub}>Live GPS tracking & 24/7 support available</Text>
// // // // //               </View>
// // // // //             </View>
            
// // // // //             <View style={{ height: 40 }} />
// // // // //           </ScrollView>
// // // // //         )}
// // // // //       </Animated.View>
      
// // // // //       {/* Cancel Modal */}
// // // // //       <Modal visible={showCancelModal} transparent animationType="fade" onRequestClose={() => setShowCancelModal(false)}>
// // // // //         <View style={styles.modalBackdrop}>
// // // // //           <View style={styles.confirmModalContent}>
// // // // //             <Ionicons name="alert-circle" size={40} color="#F59E0B" />
// // // // //             <Text style={styles.confirmModalTitle}>{userBooking?.status === "pending" ? "Cancel Request?" : "Cancel Booking?"}</Text>
// // // // //             <Text style={styles.confirmModalMessage}>
// // // // //               {userBooking?.status === "pending" 
// // // // //                 ? "Are you sure you want to cancel your booking request?"
// // // // //                 : "Are you sure you want to cancel your booking? This cannot be undone."}
// // // // //             </Text>
// // // // //             <View style={styles.confirmModalButtons}>
// // // // //               <TouchableOpacity style={[styles.confirmModalBtn, styles.confirmModalCancelBtn]} onPress={() => setShowCancelModal(false)}>
// // // // //                 <Text style={styles.confirmModalCancelBtnText}>Keep</Text>
// // // // //               </TouchableOpacity>
// // // // //               <TouchableOpacity style={[styles.confirmModalBtn, styles.confirmModalConfirmBtn]} onPress={handleCancelBooking}>
// // // // //                 <Text style={styles.confirmModalConfirmBtnText}>Cancel</Text>
// // // // //               </TouchableOpacity>
// // // // //             </View>
// // // // //           </View>
// // // // //         </View>
// // // // //       </Modal>
      
// // // // //       {/* Rating Modal */}
// // // // //       <Modal visible={ratingModalVisible} transparent animationType="fade" onRequestClose={() => setRatingModalVisible(false)}>
// // // // //         <View style={styles.modalBackdrop}>
// // // // //           <View style={styles.modalCard}>
// // // // //             <Text style={styles.modalTitle}>Rate Your Driver</Text>
// // // // //             <Text style={styles.modalSub}>How was your ride with {driverProfile?.full_name?.split(' ')[0] || 'the driver'}?</Text>
// // // // //             <RatingStars rating={rating} size={32} onPress={setRating} />
// // // // //             <TextInput
// // // // //               value={feedback}
// // // // //               onChangeText={setFeedback}
// // // // //               placeholder="Share your feedback (optional)"
// // // // //               multiline
// // // // //               numberOfLines={3}
// // // // //               style={styles.feedbackInput}
// // // // //               textAlignVertical="top"
// // // // //             />
// // // // //             <View style={styles.modalActions}>
// // // // //               <TouchableOpacity style={styles.skipBtn} onPress={() => setRatingModalVisible(false)}>
// // // // //                 <Text style={styles.skipBtnText}>Cancel</Text>
// // // // //               </TouchableOpacity>
// // // // //               <TouchableOpacity style={[styles.submitBtn, (rating === 0 || submitting) && { opacity: 0.5 }]} onPress={handleRateDriver} disabled={rating === 0 || submitting}>
// // // // //                 <Text style={styles.submitBtnText}>{submitting ? 'Submitting...' : 'Submit Rating'}</Text>
// // // // //               </TouchableOpacity>
// // // // //             </View>
// // // // //           </View>
// // // // //         </View>
// // // // //       </Modal>
      
// // // // //       <ProfileImageModal visible={selectedProfile.visible} imageUrl={selectedProfile.imageUrl} driverName={selectedProfile.driverName} onClose={() => setSelectedProfile({ visible: false, imageUrl: null, driverName: '' })} />
// // // // //       <CustomAlert visible={alertVisible} title={alertConfig.title} message={alertConfig.message} icon={alertConfig.icon} iconColor={alertConfig.iconColor} buttons={alertConfig.buttons} onBackdropPress={() => setAlertVisible(false)} />
// // // // //     </View>
// // // // //   );
// // // // // }

// // // // // // ============================================
// // // // // // STYLES (Add new styles to existing ones)
// // // // // // ============================================

// // // // // const styles = StyleSheet.create({
// // // // //   // ... (keep all your existing styles)
// // // // //   container: { flex: 1, backgroundColor: '#F4F5F7' },
// // // // //   mapContainer: { width: '100%', overflow: 'hidden', backgroundColor: '#E8EEF7' },
// // // // //   map: { flex: 1, backgroundColor: '#E8EEF7' },
// // // // //   mapBackButton: { position: 'absolute', top: Platform.OS === 'ios' ? 54 : 22, left: 14, width: 42, height: 42, borderRadius: 25, backgroundColor: 'rgba(255,255,255,0.96)', alignItems: 'center', justifyContent: 'center', shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4, elevation: 3 },
// // // // //   liveTrackingButton: { position: 'absolute', bottom: 20, left: 20, right: 20, backgroundColor: '#10B981', flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 14, borderRadius: 12, gap: 8, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.25, shadowRadius: 4, elevation: 5 },
// // // // //   liveTrackingButtonText: { color: '#fff', fontWeight: '700', fontSize: 14 },
// // // // //   liveDot: { width: 10, height: 10, borderRadius: 5, backgroundColor: '#fff', marginRight: 6 },
// // // // //   markerWrapper: { alignItems: 'center' },
// // // // //   pinBubble: { width: 28, height: 28, borderRadius: 14, borderWidth: 3, borderColor: 'white', alignItems: 'center', justifyContent: 'center', shadowColor: '#000', shadowOffset: { width: 0, height: 3 }, shadowOpacity: 0.25, shadowRadius: 4, elevation: 5 },
// // // // //   pinPointer: { width: 0, height: 0, backgroundColor: 'transparent', borderStyle: 'solid', borderLeftWidth: 7, borderRightWidth: 7, borderTopWidth: 10, borderLeftColor: 'transparent', borderRightColor: 'transparent', marginTop: -2 },
// // // // //   pinIcon: { fontSize: 14, fontWeight: '800', color: 'white', textAlign: 'center', lineHeight: 18 },
// // // // //   pinLabelBubbleYellow: { backgroundColor: 'rgba(113, 63, 18, 0.9)', borderRadius: 8, paddingHorizontal: 8, paddingVertical: 3, marginTop: 4 },
// // // // //   pinLabelTextYellow: { color: '#FACC15', fontSize: 10, fontWeight: '700' },
// // // // //   drawer: { position: 'absolute', bottom: 0, left: 0, right: 0, backgroundColor: '#F4F5F7', borderTopLeftRadius: 28, borderTopRightRadius: 28, overflow: 'hidden', shadowColor: '#000', shadowOffset: { width: 0, height: -2 }, shadowOpacity: 0.1, shadowRadius: 8, elevation: 10 },
// // // // //   handleWrap: { alignItems: 'center', paddingTop: 10, paddingBottom: 8, backgroundColor: '#F4F5F7', position: 'relative' },
// // // // //   handleHitArea: { paddingHorizontal: 40, paddingVertical: 10, alignItems: 'center', justifyContent: 'center' },
// // // // //   handleBar: { width: 64, height: 6, borderRadius: 99, backgroundColor: '#CDD2D8' },
// // // // //   collapsedSummary: { paddingHorizontal: 16, paddingTop: 4, paddingBottom: 12 },
// // // // //   collapsedTopRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: 12 },
// // // // //   collapsedDriver: { fontSize: 16, fontWeight: '800', color: Colors.dark },
// // // // //   collapsedSub: { marginTop: 2, fontSize: 12, color: Colors.gray, fontWeight: '600' },
// // // // //   collapsedPriceWrap: { alignItems: 'flex-end' },
// // // // //   collapsedPrice: { fontSize: 18, fontWeight: '900', color: Colors.dark },
// // // // //   collapsedPerSeat: { fontSize: 10, color: Colors.gray, fontWeight: '600' },
// // // // //   drawerScroll: { flex: 1 },
// // // // //   drawerContent: { paddingHorizontal: 16, paddingBottom: 16 },
// // // // //   statusBanner: { flexDirection: 'row', alignItems: 'center', padding: 12, borderRadius: 12, marginBottom: 14, gap: 8 },
// // // // //   statusBannerText: { fontSize: 13, fontWeight: '700', flex: 1 },
// // // // //   driverCard: { backgroundColor: 'white', borderRadius: 20, padding: 16, marginBottom: 14, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 8, elevation: 2 },
// // // // //   driverTopRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
// // // // //   driverLeftWrap: { flexDirection: 'row', flex: 1, paddingRight: 10 },
// // // // //   driverAvatar: { width: 56, height: 56, borderRadius: 28, backgroundColor: '#E5E7EB', overflow: 'hidden', alignItems: 'center', justifyContent: 'center', marginRight: 12 },
// // // // //   avatarImg: { width: 56, height: 56, borderRadius: 28, resizeMode: 'cover' },
// // // // //   avatarText: { fontSize: 15, fontWeight: '800', color: Colors.gray },
// // // // //   avatarPlaceholder: { width: 56, height: 56, borderRadius: 28, backgroundColor: '#E5E7EB', alignItems: 'center', justifyContent: 'center' },
// // // // //   svgAvatarContainer: { width: 56, height: 56, borderRadius: 28, overflow: 'hidden', alignItems: 'center', justifyContent: 'center', backgroundColor: '#E5E7EB' },
// // // // //   driverMeta: { flex: 1 },
// // // // //   driverNameRow: { flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap', gap: 6 },
// // // // //   driverName: { fontSize: 17, fontWeight: '800', color: Colors.dark },
// // // // //   ratingRow: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 6 },
// // // // //   ratingText: { fontSize: 13, color: Colors.dark, fontWeight: '700' },
// // // // //   chatButton: { width: 44, height: 44, borderRadius: 22, backgroundColor: '#E8F0FE', alignItems: 'center', justifyContent: 'center' },
// // // // //   actionButtonsRow: { flexDirection: 'row', gap: 12, marginTop: 14 },
// // // // //   profileOutlineBtn: { flex: 2, borderWidth: 1, borderColor: '#2457A6', borderRadius: 16, paddingVertical: 12, alignItems: 'center' },
// // // // //   profileOutlineBtnText: { color: '#2457A6', fontWeight: '700', fontSize: 14 },
// // // // //   shareOutlineBtn: { flex: 1, borderWidth: 1, borderColor: '#2457A6', borderRadius: 16, paddingVertical: 12, alignItems: 'center', flexDirection: 'row', justifyContent: 'center', gap: 6 },
// // // // //   shareOutlineBtnText: { color: '#2457A6', fontWeight: '700', fontSize: 14 },
// // // // //   driverRatingCard: { backgroundColor: '#FFFBEB', borderRadius: 16, padding: 14, marginBottom: 14, borderWidth: 1, borderColor: '#FDE68A' },
// // // // //   driverRatingHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 10 },
// // // // //   driverRatingTitle: { fontSize: 13, fontWeight: '600', color: '#92400E' },
// // // // //   driverRatingContent: { alignItems: 'center', gap: 8 },
// // // // //   driverFeedbackText: { fontSize: 13, color: '#78350F', fontStyle: 'italic', textAlign: 'center' },
// // // // //   driverFeedbackPlaceholder: { fontSize: 12, color: '#B45309', opacity: 0.7, fontStyle: 'italic' },
// // // // //   cardSection: { backgroundColor: 'white', borderRadius: 20, padding: 16, marginBottom: 14, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 8, elevation: 2 },
// // // // //   sectionTitle: { fontSize: 16, fontWeight: '800', color: Colors.dark, marginBottom: 14 },
// // // // //   sectionSubtitle: { fontSize: 14, fontWeight: '600', color: Colors.dark, marginBottom: 12, marginTop: 8 },
// // // // //   tripItem: { flexDirection: 'row', marginBottom: 16 },
// // // // //   tripIconContainer: { width: 32, height: 32, borderRadius: 16, backgroundColor: '#F0F7FF', alignItems: 'center', justifyContent: 'center', marginRight: 12 },
// // // // //   tripDetails: { flex: 1 },
// // // // //   tripLabel: { fontSize: 12, color: Colors.gray, marginBottom: 2 },
// // // // //   tripValue: { fontSize: 15, fontWeight: '600', color: Colors.dark },
// // // // //   tripDivider: { height: 1, backgroundColor: '#EEF2F7', marginVertical: 12, marginLeft: 16 },
// // // // //   tripMetaRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 16, marginTop: 8, paddingTop: 12, borderTopWidth: 1, borderTopColor: '#EEF2F7' },
// // // // //   tripMetaItem: { flexDirection: 'row', alignItems: 'center', gap: 6 },
// // // // //   tripMetaText: { fontSize: 13, color: Colors.gray },
// // // // //   vehicleDetailRow: { flexDirection: 'row', alignItems: 'center', gap: 16 },
// // // // //   vehicleDetailInfo: { flex: 1 },
// // // // //   vehicleDetailName: { fontSize: 15, fontWeight: '600', color: Colors.dark },
// // // // //   vehicleDetailColor: { fontSize: 13, color: '#6B7280', marginTop: 2 },
// // // // //   vehicleDetailReg: { fontSize: 12, color: '#9CA3AF', marginTop: 2 },
// // // // //   vehicleDetailSeats: { fontSize: 12, color: '#6B7280', marginTop: 2 },
// // // // //   seatStatsRow: { flexDirection: 'row', justifyContent: 'space-around', marginBottom: 16 },
// // // // //   seatStat: { alignItems: 'center' },
// // // // //   seatStatValue: { fontSize: 24, fontWeight: '800', color: Colors.dark },
// // // // //   seatStatLabel: { fontSize: 12, color: Colors.gray, marginTop: 4 },
// // // // //   seatProgressContainer: { height: 6, backgroundColor: '#E5E7EB', borderRadius: 3, overflow: 'hidden', marginBottom: 8 },
// // // // //   seatProgressBar: { height: '100%', backgroundColor: '#10B981', borderRadius: 3 },
// // // // //   tagRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 14 },
// // // // //   preferenceTag: { paddingHorizontal: 12, paddingVertical: 8, borderRadius: 999, backgroundColor: '#FFF3E8' },
// // // // //   preferenceTagText: { fontSize: 12, color: '#C65D00', fontWeight: '700' },
// // // // //   bookingDetailRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 8 },
// // // // //   bookingDetailLabel: { fontSize: 14, color: Colors.gray },
// // // // //   bookingDetailValue: { fontSize: 14, fontWeight: '600', color: Colors.dark },
// // // // //   bookingTotalRow: { marginTop: 8, paddingTop: 8, borderTopWidth: 1, borderTopColor: '#EEF2F7' },
// // // // //   bookingTotalLabel: { fontSize: 16, fontWeight: '700', color: Colors.dark },
// // // // //   bookingTotalValue: { fontSize: 18, fontWeight: '800', color: '#184080' },
// // // // //   bookingStatusBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20 },
// // // // //   bookingStatusText: { fontSize: 12, fontWeight: '600' },
// // // // //   divider: { height: 1, backgroundColor: '#EEF2F7', marginVertical: 16 },
// // // // //   otherBookedInfo: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFFBEB', padding: 10, borderRadius: 8, marginBottom: 12, gap: 8 },
// // // // //   otherBookedInfoText: { flex: 1, fontSize: 11, color: '#B45309' },
// // // // //   seatSelectorRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: '#FAFAFB', borderRadius: 18, padding: 14, marginBottom: 12 },
// // // // //   seatActionBtn: { width: 38, height: 38, borderRadius: 12, borderWidth: 1, borderColor: '#D6DDE7', alignItems: 'center', justifyContent: 'center', backgroundColor: 'white' },
// // // // //   seatActionBtnDisabled: { opacity: 0.5, backgroundColor: '#F5F5F5' },
// // // // //   seatCountWrap: { flexDirection: 'row', alignItems: 'baseline' },
// // // // //   seatCountText: { fontSize: 28, fontWeight: '900', color: Colors.dark },
// // // // //   seatAvailableText: { fontSize: 13, color: Colors.gray, marginLeft: 6, fontWeight: '600' },
// // // // //   updateSeatsBtn: { backgroundColor: Colors.primary, paddingVertical: 12, borderRadius: 12, alignItems: 'center', marginTop: 8 },
// // // // //   updateSeatsBtnDisabled: { opacity: 0.6 },
// // // // //   updateSeatsBtnText: { color: '#fff', fontWeight: '700', fontSize: 14 },
// // // // //   cancelBookingBtn: { marginTop: 12, backgroundColor: '#FEF2F2', paddingVertical: 12, borderRadius: 12, alignItems: 'center', borderWidth: 1, borderColor: '#EF4444' },
// // // // //   cancelBookingBtnText: { color: '#EF4444', fontWeight: '700', fontSize: 14 },
// // // // //   cancelBookingBtnDisabled: { opacity: 0.6 },
// // // // //   noRidersContainer: { alignItems: 'center', padding: 30, gap: 10 },
// // // // //   noRidersText: { fontSize: 14, fontWeight: '600', color: Colors.gray },
// // // // //   otherRiderItem: { flexDirection: 'row', alignItems: 'center', paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: '#EEF2F7' },
// // // // //   otherRiderAvatar: { width: 44, height: 44, borderRadius: 22, backgroundColor: '#E5E7EB', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', marginRight: 12 },
// // // // //   otherRiderAvatarImg: { width: 44, height: 44, borderRadius: 22, resizeMode: 'cover' },
// // // // //   otherRiderAvatarPlaceholder: { width: 44, height: 44, borderRadius: 22, backgroundColor: '#E5E7EB', alignItems: 'center', justifyContent: 'center' },
// // // // //   otherRiderAvatarText: { fontSize: 16, fontWeight: '700', color: Colors.primary },
// // // // //   otherRiderInfo: { flex: 1 },
// // // // //   otherRiderName: { fontSize: 15, fontWeight: '600', color: Colors.dark, marginBottom: 2 },
// // // // //   otherRiderSeats: { fontSize: 12, color: Colors.gray },
// // // // //   safetyCard: { backgroundColor: '#FFF3E7', borderRadius: 18, padding: 16, marginBottom: 14, flexDirection: 'row', alignItems: 'center', gap: 12 },
// // // // //   safetyTitle: { fontSize: 14, color: '#2457A6', fontWeight: '800' },
// // // // //   safetySub: { marginTop: 2, fontSize: 12, color: '#2457A6', opacity: 0.9, fontWeight: '600' },
// // // // //   loaderContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#fff' },
// // // // //   modalBackdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center' },
// // // // //   confirmModalContent: { backgroundColor: 'white', borderRadius: 24, padding: 24, width: '85%', alignItems: 'center' },
// // // // //   confirmModalTitle: { fontSize: 20, fontWeight: '800', color: Colors.dark, marginTop: 12 },
// // // // //   confirmModalMessage: { fontSize: 14, color: Colors.gray, textAlign: 'center', marginBottom: 24, lineHeight: 20 },
// // // // //   confirmModalButtons: { flexDirection: 'row', gap: 12, width: '100%' },
// // // // //   confirmModalBtn: { flex: 1, paddingVertical: 12, borderRadius: 12, alignItems: 'center' },
// // // // //   confirmModalCancelBtn: { backgroundColor: '#F3F4F6' },
// // // // //   confirmModalCancelBtnText: { color: Colors.dark, fontWeight: '600' },
// // // // //   confirmModalConfirmBtn: { backgroundColor: '#EF4444' },
// // // // //   confirmModalConfirmBtnText: { color: '#fff', fontWeight: '600' },
// // // // //   modalCard: { backgroundColor: '#fff', borderRadius: 24, padding: 20, alignItems: 'center', width: width - 40 },
// // // // //   modalTitle: { fontSize: 22, fontWeight: '700', color: '#111827', textAlign: 'center', marginTop: 12 },
// // // // //   modalSub: { fontSize: 14, color: '#6B7280', textAlign: 'center', marginTop: 8, marginBottom: 18 },
// // // // //   starsRow: { flexDirection: 'row', justifyContent: 'center', marginBottom: 18 },
// // // // //   feedbackInput: { minHeight: 100, borderWidth: 1, borderColor: '#E5E7EB', borderRadius: 16, padding: 14, color: '#111827', fontSize: 14, width: '100%' },
// // // // //   modalActions: { flexDirection: 'row', gap: 10, marginTop: 18, width: '100%' },
// // // // //   skipBtn: { flex: 1, borderWidth: 1, borderColor: '#D1D5DB', borderRadius: 999, paddingVertical: 14, alignItems: 'center' },
// // // // //   skipBtnText: { color: '#6B7280', fontWeight: '600' },
// // // // //   submitBtn: { flex: 1, backgroundColor: Colors.primary, borderRadius: 999, paddingVertical: 14, alignItems: 'center' },
// // // // //   submitBtnText: { color: '#fff', fontWeight: '700' },
// // // // //   imageModalContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', width: '100%' },
// // // // //   imageModalContent: { width: '90%', backgroundColor: Colors.white, borderRadius: 20, overflow: 'hidden', maxHeight: '80%' },
// // // // //   imageModalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 16, borderBottomWidth: 1, borderBottomColor: '#EEF2F7' },
// // // // //   imageModalTitle: { fontSize: 18, fontWeight: '700', color: Colors.dark },
// // // // //   fullProfileImage: { width: '100%', height: 400, backgroundColor: '#F5F5F5', resizeMode: 'contain' },
// // // // //   modalSvgContainer: { width: '100%', height: 400, backgroundColor: '#F5F5F5', alignItems: 'center', justifyContent: 'center' },
// // // // //   noImageContainer: { width: '100%', height: 400, justifyContent: 'center', alignItems: 'center', backgroundColor: '#F5F5F5' },
// // // // //   noImageText: { fontSize: 16, color: Colors.gray },
// // // // //   emptyText: { fontSize: 13, color: Colors.gray, fontWeight: '600' },
  
// // // // //   // Pending Modification Styles
// // // // //   pendingModificationHeader: {
// // // // //     flexDirection: 'row',
// // // // //     alignItems: 'center',
// // // // //     gap: 12,
// // // // //     marginBottom: 16,
// // // // //     paddingBottom: 12,
// // // // //     borderBottomWidth: 1,
// // // // //     borderBottomColor: '#FDE68A',
// // // // //   },
// // // // //   pendingModificationTitle: {
// // // // //     fontSize: 18,
// // // // //     fontWeight: '700',
// // // // //     color: '#92400E',
// // // // //     flex: 1,
// // // // //   },
// // // // //   pendingModificationDetails: {
// // // // //     backgroundColor: '#FFFBEB',
// // // // //     borderRadius: 12,
// // // // //     padding: 14,
// // // // //     marginBottom: 16,
// // // // //     borderWidth: 1,
// // // // //     borderColor: '#FDE68A',
// // // // //   },
// // // // //   modificationDetailRow: {
// // // // //     flexDirection: 'row',
// // // // //     justifyContent: 'space-between',
// // // // //     alignItems: 'center',
// // // // //     paddingVertical: 8,
// // // // //   },
// // // // //   modificationDetailLabel: {
// // // // //     fontSize: 14,
// // // // //     color: '#6B7280',
// // // // //   },
// // // // //   modificationDetailValue: {
// // // // //     fontSize: 16,
// // // // //     fontWeight: '600',
// // // // //     color: '#111827',
// // // // //   },
// // // // //   pendingBadge: {
// // // // //     paddingHorizontal: 10,
// // // // //     paddingVertical: 4,
// // // // //     borderRadius: 20,
// // // // //   },
// // // // //   pendingBadgeText: {
// // // // //     fontSize: 12,
// // // // //     fontWeight: '600',
// // // // //   },
// // // // //   modificationDate: {
// // // // //     fontSize: 11,
// // // // //     color: '#9CA3AF',
// // // // //     marginTop: 8,
// // // // //     textAlign: 'center',
// // // // //   },
// // // // //   cancelModificationBtn: {
// // // // //     backgroundColor: '#FEF2F2',
// // // // //     paddingVertical: 12,
// // // // //     borderRadius: 12,
// // // // //     alignItems: 'center',
// // // // //     borderWidth: 1,
// // // // //     borderColor: '#EF4444',
// // // // //   },
// // // // //   cancelModificationBtnText: {
// // // // //     color: '#EF4444',
// // // // //     fontWeight: '600',
// // // // //     fontSize: 14,
// // // // //   },
// // // // // });
// // // // import React, { useMemo, useRef, useState, useEffect, useCallback } from 'react';
// // // // import {
// // // //   View, Text, StyleSheet, TouchableOpacity, ScrollView, Platform,
// // // //   StatusBar, Image, Dimensions, Animated, PanResponder, Modal,
// // // //   LogBox, TextInput, Share, Alert
// // // // } from 'react-native';
// // // // import MapView, { Marker, Polyline, PROVIDER_GOOGLE } from 'react-native-maps';
// // // // import { Ionicons } from '@expo/vector-icons';
// // // // import LottieView from "lottie-react-native";
// // // // import { SvgCssUri } from 'react-native-svg/css';
// // // // import { Colors } from '../constants/Colors';
// // // // import { useAuth } from '../context/AuthContext';
// // // // import { API_BASE_URL } from '../config/config_ip';
// // // // import CustomAlert from '../components/CustomAlert';
// // // // import { useFocusEffect } from '@react-navigation/native';
// // // // import io from 'socket.io-client';
// // // // import ChatService from '../services/ChatService';

// // // // LogBox.ignoreLogs(['Accessibility: View', 'Property accessibilityState', 'RCTView']);

// // // // const { height, width } = Dimensions.get('window');
// // // // const SAFE_TOP = Platform.OS === 'ios' ? 56 : 24;
// // // // const COLLAPSED_HEIGHT = 84;
// // // // const EXPANDED_HEIGHT = height * 0.72;

// // // // // ============================================
// // // // // UTILITY FUNCTIONS
// // // // // ============================================

// // // // function buildImageUrl(url) {
// // // //   if (!url) return null;
// // // //   if (url.startsWith('http://') || url.startsWith('https://')) return url;
// // // //   return `${API_BASE_URL}${url.startsWith('/') ? '' : '/'}${url}`;
// // // // }

// // // // function getDriverInitials(name) {
// // // //   if (!name) return 'D';
// // // //   const parts = name.trim().split(' ').filter(Boolean);
// // // //   if (parts.length > 1) return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
// // // //   return parts[0].slice(0, 2).toUpperCase();
// // // // }

// // // // function parseSuggestedPoint(point) {
// // // //   if (!point) return null;
// // // //   if (Array.isArray(point) && point.length === 2) {
// // // //     return { longitude: Number(point[0]), latitude: Number(point[1]) };
// // // //   }
// // // //   if (point.lng != null && point.lat != null) {
// // // //     return { longitude: Number(point.lng), latitude: Number(point.lat) };
// // // //   }
// // // //   if (point.longitude != null && point.latitude != null) {
// // // //     return { longitude: Number(point.longitude), latitude: Number(point.latitude) };
// // // //   }
// // // //   return null;
// // // // }

// // // // function parseRouteCoordinates(routeCoordinates) {
// // // //   if (!Array.isArray(routeCoordinates)) return [];
// // // //   return routeCoordinates.map((item) => {
// // // //     if (Array.isArray(item) && item.length === 2) {
// // // //       return { longitude: Number(item[0]), latitude: Number(item[1]) };
// // // //     }
// // // //     if (item && typeof item === 'object' && item.latitude && item.longitude) {
// // // //       return { longitude: Number(item.longitude), latitude: Number(item.latitude) };
// // // //     }
// // // //     return parseSuggestedPoint(item);
// // // //   }).filter(Boolean);
// // // // }

// // // // function isSvgUrl(url) {
// // // //   if (!url) return false;
// // // //   return url.toLowerCase().includes('.svg') || url.toLowerCase().includes('.svg?');
// // // // }

// // // // function calculateDistance(lat1, lon1, lat2, lon2) {
// // // //   const R = 6371000;
// // // //   const dLat = (lat2 - lat1) * Math.PI / 180;
// // // //   const dLon = (lon2 - lon1) * Math.PI / 180;
// // // //   const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
// // // //             Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
// // // //             Math.sin(dLon/2) * Math.sin(dLon/2);
// // // //   const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
// // // //   return R * c;
// // // // }

// // // // function formatDistance(meters) {
// // // //   if (!meters) return 'Unknown';
// // // //   if (meters < 1000) return `${Math.round(meters)} m`;
// // // //   return `${(meters / 1000).toFixed(1)} km`;
// // // // }

// // // // function formatDate(dateString) {
// // // //   if (!dateString) return 'Date not set';
// // // //   const date = new Date(dateString);
// // // //   const today = new Date();
// // // //   const tomorrow = new Date(today);
// // // //   tomorrow.setDate(tomorrow.getDate() + 1);
// // // //   const isToday = date.toDateString() === today.toDateString();
// // // //   const isTomorrow = date.toDateString() === tomorrow.toDateString();
// // // //   let dayText = "";
// // // //   if (isToday) dayText = "Today";
// // // //   else if (isTomorrow) dayText = "Tomorrow";
// // // //   else dayText = date.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" });
// // // //   const timeText = date.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit", hour12: true });
// // // //   return `${dayText}, ${timeText}`;
// // // // }

// // // // function formatTimeOnly(dateString) {
// // // //   if (!dateString) return '--:--';
// // // //   const date = new Date(dateString);
// // // //   return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });
// // // // }

// // // // function extractAllPreferences(ride, driverTravelPrefs) {
// // // //   let ridePrefs = ride?.preferences;
// // // //   if (ridePrefs && typeof ridePrefs === 'string') {
// // // //     try { ridePrefs = JSON.parse(ridePrefs); } catch (e) { ridePrefs = null; }
// // // //   }
// // // //   if (ridePrefs && typeof ridePrefs === 'object' && Object.keys(ridePrefs).length > 0) {
// // // //     return extractFromObject(ridePrefs);
// // // //   }
// // // //   if (driverTravelPrefs && typeof driverTravelPrefs === 'object' && Object.keys(driverTravelPrefs).length > 0) {
// // // //     return extractFromObject(driverTravelPrefs);
// // // //   }
// // // //   return [];
// // // // }

// // // // function extractFromObject(prefs) {
// // // //   const allPreferences = [];
// // // //   Object.entries(prefs).forEach(([key, value]) => {
// // // //     if (value === null || value === undefined) return;
// // // //     const formattedKey = key.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
// // // //     if (typeof value === 'boolean') {
// // // //       if (value === true) allPreferences.push(formattedKey);
// // // //     } else if (Array.isArray(value)) {
// // // //       if (value.length > 0) allPreferences.push(`${formattedKey}: ${value.join(', ')}`);
// // // //     } else if (typeof value === 'object') {
// // // //       allPreferences.push(...extractFromObject(value));
// // // //     } else if (typeof value === 'string' && value.trim()) {
// // // //       const lowerValue = value.toLowerCase();
// // // //       if (!['false', 'no', 'none', 'null', 'undefined'].includes(lowerValue)) {
// // // //         allPreferences.push(`${formattedKey}: ${value}`);
// // // //       }
// // // //     } else if (typeof value === 'number') {
// // // //       allPreferences.push(`${formattedKey}: ${value}`);
// // // //     }
// // // //   });
// // // //   return [...new Set(allPreferences)];
// // // // }

// // // // // ============================================
// // // // // COMPONENTS
// // // // // ============================================

// // // // function GenericPreferenceTag({ label }) {
// // // //   if (!label || label.trim() === '') return null;
// // // //   let tagColor = '#FFF3E8';
// // // //   let textColor = '#C65D00';
// // // //   const lowerLabel = label.toLowerCase();
// // // //   if (lowerLabel.includes('age') || lowerLabel.includes('category')) {
// // // //     tagColor = '#E8F5E9'; textColor = '#2E7D32';
// // // //   } else if (lowerLabel.includes('chat') || lowerLabel.includes('talk')) {
// // // //     tagColor = '#E3F2FD'; textColor = '#1565C0';
// // // //   } else if (lowerLabel.includes('gender')) {
// // // //     tagColor = '#F3E5F5'; textColor = '#6A1B9A';
// // // //   } else if (lowerLabel.includes('language') || lowerLabel.includes('speak')) {
// // // //     tagColor = '#FFF9C4'; textColor = '#F57F17';
// // // //   } else if (lowerLabel.includes('verified')) {
// // // //     tagColor = '#E8F5E9'; textColor = '#2E7D32';
// // // //   }
// // // //   return (
// // // //     <View style={[styles.preferenceTag, { backgroundColor: tagColor }]}>
// // // //       <Text style={[styles.preferenceTagText, { color: textColor }]}>{label}</Text>
// // // //     </View>
// // // //   );
// // // // }

// // // // function ProfileImageModal({ visible, imageUrl, driverName, onClose }) {
// // // //   const [isSvg, setIsSvg] = useState(false);
// // // //   useEffect(() => {
// // // //     if (imageUrl) setIsSvg(imageUrl.toLowerCase().includes('.svg'));
// // // //   }, [imageUrl]);
// // // //   if (!visible) return null;
// // // //   return (
// // // //     <Modal visible={visible} transparent={true} animationType="fade" onRequestClose={onClose}>
// // // //       <TouchableOpacity style={styles.modalBackdrop} activeOpacity={1} onPress={onClose}>
// // // //         <View style={styles.imageModalContainer}>
// // // //           <View style={styles.imageModalContent}>
// // // //             <View style={styles.imageModalHeader}>
// // // //               <Text style={styles.imageModalTitle}>{driverName}</Text>
// // // //               <TouchableOpacity onPress={onClose}><Ionicons name="close" size={24} color={Colors.dark} /></TouchableOpacity>
// // // //             </View>
// // // //             {imageUrl && imageUrl !== 'null' && imageUrl !== 'undefined' ? (
// // // //               isSvg ? (
// // // //                 <View style={styles.modalSvgContainer}><SvgCssUri uri={imageUrl} width="100%" height={400} /></View>
// // // //               ) : (
// // // //                 <Image source={{ uri: imageUrl }} style={styles.fullProfileImage} resizeMode="contain" />
// // // //               )
// // // //             ) : (
// // // //               <View style={styles.noImageContainer}><Text style={styles.noImageText}>No profile picture available</Text></View>
// // // //             )}
// // // //           </View>
// // // //         </View>
// // // //       </TouchableOpacity>
// // // //     </Modal>
// // // //   );
// // // // }

// // // // // Rating Stars Component
// // // // function RatingStars({ rating, size = 16, onPress }) {
// // // //   return (
// // // //     <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
// // // //       {[1, 2, 3, 4, 5].map((star) => (
// // // //         <TouchableOpacity key={star} onPress={() => onPress?.(star)} disabled={!onPress}>
// // // //           <Ionicons 
// // // //             name={star <= rating ? 'star' : 'star-outline'} 
// // // //             size={size} 
// // // //             color={star <= rating ? '#F59E0B' : '#D1D5DB'} 
// // // //           />
// // // //         </TouchableOpacity>
// // // //       ))}
// // // //     </View>
// // // //   );
// // // // }

// // // // // ============================================
// // // // // MAIN SCREEN COMPONENT
// // // // // ============================================

// // // // export default function ViewRouteRequestScreen({ navigation, route }) {
// // // //   const { user } = useAuth();
// // // //   const params = route.params || {};
// // // //   const initialRide = params.ride || null;
// // // //   const booking = params.booking || null;

// // // //   // State for ride data - initialize directly from params
// // // //   const [currentRide, setCurrentRide] = useState(() => {
// // // //     if (initialRide && initialRide.id) {
// // // //       return initialRide;
// // // //     }
// // // //     if (booking?.ride) {
// // // //       return booking.ride;
// // // //     }
// // // //     return null;
// // // //   });

// // // //   const [userBooking, setUserBooking] = useState(() => {
// // // //     if (booking && booking.id) {
// // // //       return {
// // // //         id: Number(booking.id),
// // // //         seats_requested: Number(booking.seats_requested) || 1,
// // // //         status: booking.status || 'pending',
// // // //         total_amount: Number(booking.total_amount) || null,
// // // //         created_at: booking.created_at,
// // // //       };
// // // //     }
// // // //     if (initialRide?.booking && initialRide.booking.id) {
// // // //       return {
// // // //         id: Number(initialRide.booking.id),
// // // //         seats_requested: Number(initialRide.booking.seats_requested) || 1,
// // // //         status: initialRide.booking.status || 'pending',
// // // //         total_amount: Number(initialRide.booking.total_amount) || null,
// // // //       };
// // // //     }
// // // //     if (initialRide?.seatsRequested) {
// // // //       return {
// // // //         id: Number(initialRide.id),
// // // //         seats_requested: Number(initialRide.seatsRequested),
// // // //         status: 'accepted',
// // // //       };
// // // //     }
// // // //     return null;
// // // //   });

// // // //   const [driverProfile, setDriverProfile] = useState(null);
// // // //   const [isVerified, setIsVerified] = useState(false);
// // // //   const [loadingProfile, setLoadingProfile] = useState(false);
  
// // // //   // UI State
// // // //   const [drawerExpanded, setDrawerExpanded] = useState(true);
// // // //   const [mapReady, setMapReady] = useState(false);
// // // //   const [showCancelModal, setShowCancelModal] = useState(false);
// // // //   const [ratingModalVisible, setRatingModalVisible] = useState(false);
// // // //   const [selectedProfile, setSelectedProfile] = useState({ visible: false, imageUrl: null, driverName: '' });
// // // //   const [alertVisible, setAlertVisible] = useState(false);
// // // //   const [alertConfig, setAlertConfig] = useState({ title: "", message: "", icon: "check-circle", iconColor: "#10B981", buttons: [] });
  
// // // //   // Seat related state
// // // //   const [seatsRequested, setSeatsRequested] = useState(() => {
// // // //     if (booking?.seats_requested) return booking.seats_requested;
// // // //     if (initialRide?.seatsRequested) return initialRide.seatsRequested;
// // // //     return 1;
// // // //   });
// // // //   const [modifyingSeats, setModifyingSeats] = useState(false);
// // // //   const [totalSeatsOffered, setTotalSeatsOffered] = useState(() => initialRide?.available_seats || 4);
// // // //   const [totalBookedSeats, setTotalBookedSeats] = useState(() => booking?.seats_requested || initialRide?.seatsRequested || 0);
// // // //   const [availableSeats, setAvailableSeats] = useState(() => (initialRide?.available_seats || 4) - (booking?.seats_requested || initialRide?.seatsRequested || 0));
// // // //   const [otherRiders, setOtherRiders] = useState([]);
  
// // // //   // Modification request state
// // // //   const [seatModificationRequested, setSeatModificationRequested] = useState(false);
// // // //   const [pendingSeatsRequest, setPendingSeatsRequest] = useState(null);
// // // //   const [pendingRequestDetails, setPendingRequestDetails] = useState(null);
// // // //   const [pendingModificationRequest, setPendingModificationRequest] = useState(null);
  
// // // //   // Live tracking state
// // // //   const [liveSession, setLiveSession] = useState(null);
// // // //   const [driverLocation, setDriverLocation] = useState(null);
// // // //   const [driverETA, setDriverETA] = useState(null);
// // // //   const [driverDistance, setDriverDistance] = useState(null);
// // // //   const [socketConnected, setSocketConnected] = useState(false);
  
// // // //   // Rating state
// // // //   const [rating, setRating] = useState(0);
// // // //   const [feedback, setFeedback] = useState('');
// // // //   const [submitting, setSubmitting] = useState(false);
// // // //   const [hasRatedDriver, setHasRatedDriver] = useState(false);
// // // //   const [rideCompleted, setRideCompleted] = useState(false);
// // // //   const [completedRideDetails, setCompletedRideDetails] = useState(null);
  
// // // //   // Driver's rating and feedback for this ride
// // // //   const [driverRating, setDriverRating] = useState(null);
// // // //   const [driverFeedbackText, setDriverFeedbackText] = useState('');
// // // //   const [showDriverRating, setShowDriverRating] = useState(false);
  
// // // //   // Cancel state
// // // //   const [cancelLoading, setCancelLoading] = useState(false);
  
// // // //   // Refs
// // // //   const animatedDrawer = useRef(new Animated.Value(1)).current;
// // // //   const mapRef = useRef(null);
// // // //   const socketRef = useRef(null);
// // // //   const hasShownRatingModal = useRef(false);
  
// // // //   // Animation values
// // // //   const mapHeight = animatedDrawer.interpolate({ inputRange: [0, 1], outputRange: [height - SAFE_TOP - COLLAPSED_HEIGHT, height * 0.32] });
// // // //   const drawerHeight = animatedDrawer.interpolate({ inputRange: [0, 1], outputRange: [COLLAPSED_HEIGHT, EXPANDED_HEIGHT] });
  
// // // //   const toggleDrawer = () => {
// // // //     const nextExpanded = !drawerExpanded;
// // // //     setDrawerExpanded(nextExpanded);
// // // //     Animated.timing(animatedDrawer, { toValue: nextExpanded ? 1 : 0, duration: 260, useNativeDriver: false }).start();
// // // //   };
  
// // // //   const panResponder = useRef(PanResponder.create({
// // // //     onMoveShouldSetPanResponder: (_, gestureState) => Math.abs(gestureState.dy) > 5,
// // // //     onPanResponderMove: (_, gestureState) => {
// // // //       const dragRange = EXPANDED_HEIGHT - COLLAPSED_HEIGHT;
// // // //       const progress = drawerExpanded ? 1 - (gestureState.dy / dragRange) : gestureState.dy / dragRange;
// // // //       animatedDrawer.setValue(Math.max(0, Math.min(1, progress)));
// // // //     },
// // // //     onPanResponderRelease: (_, gestureState) => {
// // // //       const dragRange = EXPANDED_HEIGHT - COLLAPSED_HEIGHT;
// // // //       const threshold = dragRange * 0.2;
// // // //       if (drawerExpanded) {
// // // //         if (gestureState.dy > threshold) {
// // // //           setDrawerExpanded(false);
// // // //           Animated.timing(animatedDrawer, { toValue: 0, duration: 200, useNativeDriver: false }).start();
// // // //         } else {
// // // //           setDrawerExpanded(true);
// // // //           Animated.timing(animatedDrawer, { toValue: 1, duration: 200, useNativeDriver: false }).start();
// // // //         }
// // // //       } else {
// // // //         if (gestureState.dy < -threshold) {
// // // //           setDrawerExpanded(true);
// // // //           Animated.timing(animatedDrawer, { toValue: 1, duration: 200, useNativeDriver: false }).start();
// // // //         } else {
// // // //           setDrawerExpanded(false);
// // // //           Animated.timing(animatedDrawer, { toValue: 0, duration: 200, useNativeDriver: false }).start();
// // // //         }
// // // //       }
// // // //     },
// // // //   })).current;
  
// // // //   // Helper functions
// // // //   const showCustomAlert = (title, message, type = 'success') => {
// // // //     let icon = "check-circle";
// // // //     let iconColor = "#10B981";
// // // //     if (type === 'error') { icon = "error"; iconColor = "#EF4444"; }
// // // //     else if (type === 'warning') { icon = "warning"; iconColor = "#F59E0B"; }
// // // //     else if (type === 'info') { icon = "info"; iconColor = Colors.primary; }
// // // //     setAlertConfig({ title, message, icon, iconColor, buttons: [{ text: 'OK', onPress: () => setAlertVisible(false) }] });
// // // //     setAlertVisible(true);
// // // //   };
  
// // // //   const getProfilePhotoUrl = () => {
// // // //     const rawUrl = driverProfile?.profile_picture || currentRide?.profilePicture || currentRide?.driverProfilePicture;
// // // //     if (!rawUrl) return null;
// // // //     return buildImageUrl(rawUrl);
// // // //   };
  
// // // //   // Get driver phone number for chat
// // // //   const getDriverPhoneNumber = () => {
// // // //     return currentRide?.phoneNumber || currentRide?.driver_phone;
// // // //   };
  
// // // //   // Handle chat with driver
// // // //   const handleChatWithDriver = async () => {
// // // //     const driverPhone = getDriverPhoneNumber();
// // // //     const driverName = driverProfile?.full_name || currentRide?.driverName || 'Driver';
    
// // // //     if (!driverPhone) {
// // // //       showCustomAlert('Error', 'Driver contact information not available', 'error');
// // // //       return;
// // // //     }
    
// // // //     try {
// // // //       const result = await ChatService.getOrCreateConversation(
// // // //         user?.phone_number,
// // // //         driverPhone,
// // // //         currentRide?.id
// // // //       );
      
// // // //       if (result.success && result.conversationId) {
// // // //         navigation.navigate('ChatScreen', {
// // // //           conversationId: result.conversationId,
// // // //           user: {
// // // //             name: driverName,
// // // //             phone_number: driverPhone,
// // // //             profile_picture: getProfilePhotoUrl(),
// // // //           },
// // // //           rideId: currentRide?.id,
// // // //         });
// // // //       } else {
// // // //         showCustomAlert('Error', 'Could not start chat. Please try again.', 'error');
// // // //       }
// // // //     } catch (error) {
// // // //       console.error('Chat error:', error);
// // // //       showCustomAlert('Error', 'Could not start chat', 'error');
// // // //     }
// // // //   };
  
// // // //   // Get ride status for passenger view (similar to MyRides logic)
// // // //   const getPassengerRideStatusInfo = useCallback(() => {
// // // //     const ride = currentRide;
    
// // // //     // Ride completed
// // // //     if (ride?.status === "completed" || rideCompleted) {
// // // //       return { text: "Completed", color: "#6B7280", icon: "checkmark-done", type: "completed" };
// // // //     }
    
// // // //     // Ride cancelled
// // // //     if (ride?.cancellation_reason) {
// // // //       if (ride.cancellation_reason.includes("Auto-cancelled")) {
// // // //         return { text: "Auto-cancelled", color: "#DC2626", icon: "alert-circle", type: "auto-cancelled" };
// // // //       }
// // // //       return { text: "Cancelled", color: "#DC2626", icon: "close-circle", type: "cancelled" };
// // // //     }
    
// // // //     // Ride ongoing (driver has started)
// // // //     if (ride?.started_at && ride.status !== "completed") {
// // // //       return { text: "Ongoing", color: "#10B981", icon: "car-sport", type: "ongoing" };
// // // //     }
    
// // // //     const now = new Date();
// // // //     const departureTime = new Date(ride?.departure_time);
// // // //     const minutesToDeparture = (departureTime - now) / (1000 * 60);
// // // //     const minutesSinceDeparture = (now - departureTime) / (1000 * 60);
    
// // // //     // Driver is late (departure time passed but ride not started)
// // // //     if (minutesSinceDeparture > 0 && minutesSinceDeparture <= 30 && !ride?.started_at) {
// // // //       return { text: "Driver is late - Starting soon", color: "#EF4444", icon: "alert-circle", type: "driver-late" };
// // // //     }
    
// // // //     // Start soon (within 15 minutes before departure)
// // // //     if (minutesToDeparture <= 15 && minutesToDeparture > 0 && !ride?.started_at) {
// // // //       return { text: "Starting Soon", color: "#F59E0B", icon: "time-outline", type: "start-soon" };
// // // //     }
    
// // // //     // Upcoming
// // // //     if (minutesToDeparture > 15) {
// // // //       if (userBooking?.status === "accepted") {
// // // //         return { text: "Upcoming", color: "#2457A6", icon: "calendar-outline", type: "upcoming" };
// // // //       }
// // // //     }
    
// // // //     // Default based on booking status
// // // //     if (userBooking?.status === "accepted") {
// // // //       return { text: "Accepted", color: "#10B981", icon: "checkmark-circle", type: "accepted" };
// // // //     }
// // // //     if (userBooking?.status === "pending") {
// // // //       return { text: "Pending", color: "#F59E0B", icon: "time", type: "pending" };
// // // //     }
// // // //     if (userBooking?.status === "rejected") {
// // // //       return { text: "Rejected", color: "#DC2626", icon: "close-circle", type: "rejected" };
// // // //     }
    
// // // //     return { text: ride?.status || "Unknown", color: Colors.gray, icon: "ellipse", type: "unknown" };
// // // //   }, [currentRide, rideCompleted, userBooking?.status]);
  
// // // //   const fetchDriverRatingForRide = useCallback(async () => {
// // // //     if (!userBooking?.id) return;
    
// // // //     const bookingId = Number(userBooking.id);
// // // //     if (isNaN(bookingId)) {
// // // //       console.log('Invalid booking ID for fetching rating');
// // // //       return;
// // // //     }
    
// // // //     try {
// // // //       console.log('Fetching driver rating for booking:', bookingId);
// // // //       const response = await fetch(`${API_BASE_URL}/api/v1/ride-feedback/driver/${bookingId}?_t=${Date.now()}`);
// // // //       const data = await response.json();
      
// // // //       console.log('Driver rating response:', data);
      
// // // //       if (data.success && data.feedback) {
// // // //         setDriverRating(data.feedback.rating);
// // // //         setDriverFeedbackText(data.feedback.comment || '');
// // // //         setShowDriverRating(true);
// // // //       } else {
// // // //         setShowDriverRating(false);
// // // //       }
// // // //     } catch (error) {
// // // //       console.log('Error fetching driver rating:', error);
// // // //       setShowDriverRating(false);
// // // //     }
// // // //   }, [userBooking?.id]);

// // // //   const handleRateDriver = async () => {
// // // //     if (rating === 0) {
// // // //       showCustomAlert('Rating Required', 'Please select a rating.', 'warning');
// // // //       return;
// // // //     }
    
// // // //     if (!userBooking?.id) {
// // // //       showCustomAlert('Error', 'Booking information not found.', 'error');
// // // //       return;
// // // //     }
    
// // // //     setSubmitting(true);
// // // //     try {
// // // //       const bookingId = Number(userBooking.id);
      
// // // //       if (isNaN(bookingId)) {
// // // //         console.error('Invalid booking ID:', userBooking.id);
// // // //         showCustomAlert('Error', 'Invalid booking ID. Please try again.', 'error');
// // // //         setSubmitting(false);
// // // //         return;
// // // //       }
      
// // // //       const requestBody = {
// // // //         ride_booking_id: bookingId,
// // // //         rating: Number(rating),
// // // //         comment: feedback || '',
// // // //       };
      
// // // //       console.log('Submitting rating:', requestBody);
      
// // // //       const response = await fetch(`${API_BASE_URL}/api/v1/ride-feedback`, {
// // // //         method: 'POST',
// // // //         headers: { 
// // // //           'Content-Type': 'application/json',
// // // //           'Accept': 'application/json',
// // // //           'X-Phone-Number': user?.phone_number,
// // // //         },
// // // //         body: JSON.stringify(requestBody),
// // // //       });
      
// // // //       const data = await response.json();
      
// // // //       if (response.ok && data.success) {
// // // //         showCustomAlert('Thank You!', 'Your rating has been submitted successfully!', 'success');
// // // //         setHasRatedDriver(true);
// // // //         setRatingModalVisible(false);
// // // //         setRating(0);
// // // //         setFeedback('');
        
// // // //         setTimeout(() => {
// // // //           fetchDriverRatingForRide();
// // // //           checkSessionStatus();
// // // //         }, 500);
// // // //       } else {
// // // //         let errorMessage = 'Failed to submit rating.';
// // // //         if (data.detail) {
// // // //           if (typeof data.detail === 'string') {
// // // //             errorMessage = data.detail;
// // // //           } else if (Array.isArray(data.detail)) {
// // // //             errorMessage = data.detail.map(err => err.msg || err.message).join(', ');
// // // //           }
// // // //         } else if (data.message) {
// // // //           errorMessage = data.message;
// // // //         }
// // // //         showCustomAlert('Error', errorMessage, 'error');
// // // //       }
// // // //     } catch (error) {
// // // //       console.error('Rating error:', error);
// // // //       showCustomAlert('Error', 'Network error. Please check your connection.', 'error');
// // // //     } finally {
// // // //       setSubmitting(false);
// // // //     }
// // // //   };
  
// // // //   const getCorrectRideId = useCallback(async () => {
// // // //     if (!userBooking?.id) return null;
    
// // // //     try {
// // // //       const response = await fetch(`${API_BASE_URL}/api/v1/bookings/${userBooking.id}/ride?_t=${Date.now()}`);
// // // //       const data = await response.json();
      
// // // //       if (data.success && data.ride) {
// // // //         console.log('Got correct ride ID from booking API:', data.ride.id);
// // // //         return data.ride.id;
// // // //       }
// // // //       return null;
// // // //     } catch (error) {
// // // //       console.log('Error fetching ride from booking:', error);
// // // //       return null;
// // // //     }
// // // //   }, [userBooking?.id]);

// // // //   const fetchModificationRequests = useCallback(async () => {
// // // //     if (!userBooking?.id) return;
    
// // // //     try {
// // // //       const response = await fetch(`${API_BASE_URL}/booking/${userBooking.id}/modification-request?_t=${Date.now()}`);
// // // //       const data = await response.json();
      
// // // //       console.log('Modification request response:', data);
      
// // // //       if (data.has_pending && data.request) {
// // // //         setPendingModificationRequest(data.request);
// // // //         setSeatModificationRequested(true);
// // // //         setPendingSeatsRequest(data.request.requested_seats);
// // // //         setPendingRequestDetails(data.request);
// // // //       } else {
// // // //         setPendingModificationRequest(null);
// // // //         setSeatModificationRequested(false);
// // // //         setPendingSeatsRequest(null);
// // // //         setPendingRequestDetails(null);
// // // //       }
// // // //     } catch (error) {
// // // //       console.log('Error fetching modification request:', error);
// // // //     }
// // // //   }, [userBooking?.id]);
  
// // // //   const handleCancelModificationRequest = async () => {
// // // //     if (!userBooking?.id) return;
    
// // // //     setModifyingSeats(true);
// // // //     try {
// // // //       const response = await fetch(`${API_BASE_URL}/api/v1/modifications/booking/${userBooking.id}/cancel`, {
// // // //         method: 'DELETE',
// // // //         headers: { 'Content-Type': 'application/json' },
// // // //       });
// // // //       const data = await response.json();
      
// // // //       if (!response.ok) throw new Error(data.detail || data.message || 'Failed to cancel modification request');
      
// // // //       showCustomAlert('Request Cancelled', 'Your seat modification request has been cancelled.', 'success');
// // // //       setSeatModificationRequested(false);
// // // //       setPendingSeatsRequest(null);
// // // //       setPendingRequestDetails(null);
// // // //       setPendingModificationRequest(null);
// // // //       await fetchModificationRequests();
// // // //     } catch (error) {
// // // //       console.error('Cancel modification error:', error);
// // // //       showCustomAlert('Error', error.message || 'Failed to cancel modification request', 'error');
// // // //     } finally {
// // // //       setModifyingSeats(false);
// // // //     }
// // // //   };

// // // //   const fetchSeatAvailability = useCallback(async () => {
// // // //     let rideId = currentRide?.id;
    
// // // //     if (!rideId || rideId === 3 || rideId === 0) {
// // // //       const correctId = await getCorrectRideId();
// // // //       if (correctId) {
// // // //         rideId = correctId;
// // // //         setCurrentRide(prev => ({ ...prev, id: correctId }));
// // // //       } else {
// // // //         console.log('Could not get valid ride ID');
// // // //         return;
// // // //       }
// // // //     }
    
// // // //     console.log('Fetching passengers for ride ID:', rideId);
    
// // // //     try {
// // // //       const url = `${API_BASE_URL.replace(/\/$/, '')}/ride/${rideId}/passengers?_t=${Date.now()}`;
// // // //       const response = await fetch(url);
      
// // // //       if (response.ok) {
// // // //         const data = await response.json();
        
// // // //         const totalSeats = data.available_seats || currentRide?.available_seats || 4;
// // // //         setTotalSeatsOffered(totalSeats);
        
// // // //         const totalBooked = data.total_booked_seats || 0;
// // // //         setTotalBookedSeats(totalBooked);
// // // //         setAvailableSeats(Math.max(0, totalSeats - totalBooked));
        
// // // //         if (data.passengers && Array.isArray(data.passengers) && user?.phone_number) {
// // // //           const normalizePhone = (phone) => {
// // // //             if (!phone) return '';
// // // //             let cleaned = phone.replace(/\s/g, '').replace(/-/g, '');
// // // //             if (cleaned.startsWith('+91')) return cleaned;
// // // //             if (cleaned.startsWith('91') && cleaned.length === 12) return `+${cleaned}`;
// // // //             if (cleaned.startsWith('+')) return cleaned;
// // // //             return `+91${cleaned}`;
// // // //           };
          
// // // //           const currentUserPhone = normalizePhone(user.phone_number);
// // // //           const acceptedPassengers = data.passengers.filter(p => p.status === 'accepted');
// // // //           const otherAccepted = acceptedPassengers.filter(p => {
// // // //             const passengerPhone = normalizePhone(p.passenger_phone);
// // // //             return passengerPhone !== currentUserPhone;
// // // //           });
          
// // // //           setOtherRiders(otherAccepted);
// // // //         } else {
// // // //           setOtherRiders([]);
// // // //         }
// // // //       } else if (response.status === 404) {
// // // //         console.log('Ride not found - this might be normal if no passengers yet');
// // // //         setOtherRiders([]);
// // // //         setTotalSeatsOffered(currentRide?.available_seats || 4);
// // // //         setTotalBookedSeats(0);
// // // //         setAvailableSeats(currentRide?.available_seats || 4);
// // // //       }
// // // //     } catch (error) {
// // // //       console.log('Error fetching seat availability:', error);
// // // //     }
// // // //   }, [currentRide?.id, currentRide?.available_seats, user?.phone_number, getCorrectRideId]);

// // // //   const loadDriverData = useCallback(async () => {
// // // //     let rideId = currentRide?.id;
// // // //     if (!rideId || rideId === 3 || rideId === 0) {
// // // //       const correctId = await getCorrectRideId();
// // // //       if (correctId) {
// // // //         rideId = correctId;
// // // //         setCurrentRide(prev => ({ ...prev, id: correctId }));
// // // //       }
// // // //     }
    
// // // //     let driverPhone = currentRide?.phoneNumber || currentRide?.driver_phone;
// // // //     let driverUserId = currentRide?.driverUserId || currentRide?.driver_user_id;
    
// // // //     if ((!driverPhone && !driverUserId) && userBooking?.id) {
// // // //       try {
// // // //         const response = await fetch(`${API_BASE_URL}/api/v1/bookings/${userBooking.id}/ride?_t=${Date.now()}`);
// // // //         const data = await response.json();
// // // //         if (data.success && data.ride) {
// // // //           driverPhone = data.ride.driver_phone;
// // // //           driverUserId = data.ride.driver_user_id;
// // // //           setCurrentRide(prev => ({ ...prev, 
// // // //             phoneNumber: driverPhone, 
// // // //             driver_phone: driverPhone,
// // // //             driverUserId: driverUserId,
// // // //             driverName: data.ride.driver_name,
// // // //             from: data.ride.origin,
// // // //             to: data.ride.destination,
// // // //             departure_time: data.ride.departure_time,
// // // //             price: data.ride.price_per_seat,
// // // //             available_seats: data.ride.available_seats,
// // // //             routeCoordinates: data.ride.route_coordinates,
// // // //           }));
// // // //         }
// // // //       } catch (error) {
// // // //         console.log('Error fetching ride details:', error);
// // // //       }
// // // //     }
    
// // // //     if (!driverPhone && !driverUserId) {
// // // //       console.log('No driver contact info available');
// // // //       return;
// // // //     }
    
// // // //     setLoadingProfile(true);
// // // //     try {
// // // //       const params = new URLSearchParams();
// // // //       if (driverUserId) params.append('user_id', driverUserId);
// // // //       else if (driverPhone) params.append('phone_number', driverPhone);
// // // //       params.append('_t', Date.now());
      
// // // //       const profileRes = await fetch(`${API_BASE_URL}/api/v1/users/profile-public?${params.toString()}`);
// // // //       const profileData = await profileRes.json();
      
// // // //       if (profileData?.success && profileData.user) {
// // // //         setDriverProfile(profileData.user);
// // // //       }
      
// // // //       if (driverPhone) {
// // // //         const docsRes = await fetch(`${API_BASE_URL}/api/v1/documents/user/${driverPhone}`);
// // // //         const docsData = await docsRes.json();
// // // //         if (docsData?.success && docsData.documents) {
// // // //           const verifiedDocs = docsData.documents.filter(doc => {
// // // //             const status = doc.status?.toUpperCase();
// // // //             return status === 'APPROVED' && ['aadhar', 'dl', 'rc'].includes(doc.document_type?.toLowerCase());
// // // //           });
// // // //           setIsVerified(verifiedDocs.length > 0);
// // // //         }
// // // //       }
// // // //     } catch (error) {
// // // //       console.log('Error loading driver data:', error);
// // // //     } finally {
// // // //       setLoadingProfile(false);
// // // //     }
// // // //   }, [currentRide, userBooking?.id, getCorrectRideId]);

// // // //   // Check live session and setup socket for live tracking
// // // //   const checkLiveSession = useCallback(async () => {
// // // //     const rideId = currentRide?.id;
// // // //     if (!rideId) return;
    
// // // //     try {
// // // //       const response = await fetch(`${API_BASE_URL}/ride/${rideId}/live-session`);
// // // //       const data = await response.json();
// // // //       if (data.success && data.session) {
// // // //         setLiveSession(data.session);
        
// // // //         // Setup socket connection for live tracking if ride is ongoing or started
// // // //         if (data.session.status === 'active' && currentRide?.started_at) {
// // // //           setupSocketConnection(data.session.session_id);
// // // //         }
// // // //       }
// // // //     } catch (error) {
// // // //       console.log('Error checking live session:', error);
// // // //     }
// // // //   }, [currentRide?.id, currentRide?.started_at]);
  
// // // //   // Setup socket for live driver tracking
// // // //   const setupSocketConnection = useCallback((sessionId) => {
// // // //     if (socketRef.current) {
// // // //       socketRef.current.disconnect();
// // // //     }
    
// // // //     const socket = io(API_BASE_URL, {
// // // //       transports: ['websocket'],
// // // //       reconnection: true,
// // // //     });
    
// // // //     socketRef.current = socket;
    
// // // //     socket.on('connect', () => {
// // // //       console.log('Socket connected for live tracking');
// // // //       socket.emit('join-session', sessionId);
// // // //       setSocketConnected(true);
// // // //     });
    
// // // //     socket.on('driver-location-update', (data) => {
// // // //       if (data.latitude && data.longitude) {
// // // //         setDriverLocation({
// // // //           latitude: data.latitude,
// // // //           longitude: data.longitude,
// // // //         });
// // // //         if (data.eta) setDriverETA(data.eta);
// // // //         if (data.distance) setDriverDistance(data.distance);
// // // //       }
// // // //     });
    
// // // //     socket.on('ride-started', (data) => {
// // // //       console.log('Ride started event:', data);
// // // //       setCurrentRide(prev => ({ ...prev, started_at: new Date().toISOString() }));
// // // //     });
    
// // // //     socket.on('ride-completed', (data) => {
// // // //       console.log('Ride completed event:', data);
// // // //       setRideCompleted(true);
// // // //       setCurrentRide(prev => ({ ...prev, status: 'completed' }));
// // // //     });
    
// // // //     return () => {
// // // //       if (socketRef.current) {
// // // //         socketRef.current.disconnect();
// // // //         socketRef.current = null;
// // // //       }
// // // //     };
// // // //   }, []);
  
// // // //   const checkSessionStatus = useCallback(async () => {
// // // //     const bookingId = userBooking?.id;
// // // //     if (!bookingId) return;
    
// // // //     try {
// // // //       const res = await fetch(`${API_BASE_URL}/ride-sessions/rider/session-status/${bookingId}?rider_phone=${user?.phone_number}&_t=${Date.now()}`);
// // // //       const data = await res.json();
      
// // // //       console.log('Session Status Response:', data);
      
// // // //       if (data.success && data.ride_completed) {
// // // //         setRideCompleted(true);
// // // //         setHasRatedDriver(data.has_rated_driver);
        
// // // //         if (data.has_rated_driver === false && !hasShownRatingModal.current) {
// // // //           hasShownRatingModal.current = true;
// // // //           setTimeout(() => setRatingModalVisible(true), 1000);
// // // //         }
// // // //       }
// // // //     } catch (error) {
// // // //       console.log('Error checking session status:', error);
// // // //     }
// // // //   }, [userBooking?.id, user?.phone_number]);
  
// // // //   const canModifySeats = useCallback(() => {
// // // //     if (!userBooking) return false;
// // // //     const statusInfo = getPassengerRideStatusInfo();
// // // //     if (rideCompleted) return false;
// // // //     if (currentRide?.cancellation_reason || currentRide?.started_at) return false;
// // // //     if (userBooking.status !== "accepted") return false;
// // // //     if (['expired', 'auto-cancelled', 'driver-late', 'start-soon', 'ongoing'].includes(statusInfo.type)) return false;
// // // //     if (seatModificationRequested) return false;
// // // //     return true;
// // // //   }, [userBooking, getPassengerRideStatusInfo, currentRide, seatModificationRequested, rideCompleted]);
  
// // // //   const canCancelBooking = useCallback(() => {
// // // //     if (!userBooking) return false;
// // // //     const statusInfo = getPassengerRideStatusInfo();
// // // //     if (rideCompleted) return false;
// // // //     if (currentRide?.cancellation_reason || currentRide?.started_at || currentRide?.status === 'completed') return false;
// // // //     if (['expired', 'auto-cancelled', 'ongoing'].includes(statusInfo.type)) return false;
// // // //     if (!["accepted", "pending"].includes(userBooking.status)) return false;
// // // //     return true;
// // // //   }, [userBooking, getPassengerRideStatusInfo, currentRide, rideCompleted]);
  
// // // //   // Actions
// // // //   const handleModifySeats = async () => {
// // // //     if (!userBooking || !canModifySeats()) {
// // // //       showCustomAlert('Cannot Modify', 'Modifications are not available at this time.', 'warning');
// // // //       return;
// // // //     }
    
// // // //     const currentSeatsBooked = userBooking.seats_requested || 0;
// // // //     const otherBookedSeats = Math.max(0, totalBookedSeats - currentSeatsBooked);
// // // //     const maxSeatsUserCanRequest = totalSeatsOffered - otherBookedSeats;
    
// // // //     if (maxSeatsUserCanRequest <= 0) {
// // // //       showCustomAlert('No Seats Available', 'No additional seats are available.', 'warning');
// // // //       return;
// // // //     }
// // // //     if (seatsRequested > maxSeatsUserCanRequest) {
// // // //       showCustomAlert('Not Enough Seats', `Only ${maxSeatsUserCanRequest} seat(s) available.`, 'warning');
// // // //       return;
// // // //     }
// // // //     if (seatsRequested < 1) {
// // // //       showCustomAlert('Invalid Seats', 'Minimum 1 seat required.', 'warning');
// // // //       return;
// // // //     }
// // // //     if (seatsRequested === currentSeatsBooked) {
// // // //       showCustomAlert('No Change', 'Seat count is already set to this value.', 'info');
// // // //       return;
// // // //     }
    
// // // //     setModifyingSeats(true);
// // // //     try {
// // // //       const response = await fetch(`${API_BASE_URL}/api/v1/modifications/request/${userBooking.id}`, {
// // // //         method: 'POST',
// // // //         headers: { 'Content-Type': 'application/json' },
// // // //         body: JSON.stringify({ requested_seats: seatsRequested }),
// // // //       });
// // // //       const data = await response.json();
// // // //       if (!response.ok) throw new Error(data.detail || data.message);
      
// // // //       showCustomAlert('Request Sent', `Request to change to ${seatsRequested} seat(s) sent.`, 'info');
// // // //       setSeatModificationRequested(true);
// // // //       setPendingSeatsRequest(seatsRequested);
// // // //       await fetchModificationRequests();
// // // //     } catch (error) {
// // // //       showCustomAlert('Error', error.message, 'error');
// // // //     } finally {
// // // //       setModifyingSeats(false);
// // // //     }
// // // //   };
  
// // // //   const handleCancelBooking = async () => {
// // // //     if (!userBooking || !canCancelBooking()) return;
    
// // // //     setModifyingSeats(true);
// // // //     setCancelLoading(true);
// // // //     try {
// // // //       const response = await fetch(`${API_BASE_URL}/booking/${userBooking.id}/cancel`, {
// // // //         method: 'PUT',
// // // //         headers: { 'Content-Type': 'application/json' },
// // // //       });
// // // //       const data = await response.json();
// // // //       if (!response.ok) throw new Error(data.detail || data.message);
      
// // // //       showCustomAlert('Success', 'Booking cancelled successfully', 'success');
// // // //       setTimeout(() => navigation.goBack(), 1500);
// // // //     } catch (error) {
// // // //       showCustomAlert('Error', error.message, 'error');
// // // //     } finally {
// // // //       setModifyingSeats(false);
// // // //       setCancelLoading(false);
// // // //       setShowCancelModal(false);
// // // //     }
// // // //   };
  
// // // //   const viewDriverProfile = () => {
// // // //     const driverPhone = currentRide?.phoneNumber || currentRide?.driver_phone;
// // // //     const driverUserId = currentRide?.driverUserId || currentRide?.driver_user_id;
// // // //     if (driverPhone || driverUserId) {
// // // //       navigation.navigate('ViewProfileScreen', {
// // // //         userId: driverUserId || null,
// // // //         phoneNumber: driverPhone || null,
// // // //         driverName: driverProfile?.full_name || currentRide?.driverName || 'Driver',
// // // //         profilePicture: getProfilePhotoUrl(),
// // // //       });
// // // //     }
// // // //   };
  
// // // //   const shareRideDetails = async () => {
// // // //     const message = `🚗 *Ride Details* 🚗\n\n` +
// // // //       `From: ${currentRide?.from || currentRide?.origin || 'Pickup'}\n` +
// // // //       `To: ${currentRide?.to || currentRide?.destination || 'Drop'}\n` +
// // // //       `Date: ${formatDate(currentRide?.departure_time)}\n` +
// // // //       `Price: ₹${currentRide?.price || currentRide?.price_per_seat || 0}/seat\n` +
// // // //       `Seats: ${userBooking?.seats_requested || 1}\n` +
// // // //       `Total: ₹${(currentRide?.price || currentRide?.price_per_seat || 0) * (userBooking?.seats_requested || 1)}\n\n` +
// // // //       `Driver: ${driverProfile?.full_name || currentRide?.driverName || 'Driver'}`;
    
// // // //     await Share.share({ message, title: 'Ride Details' });
// // // //   };
  
// // // //   const handleProfileImagePress = () => {
// // // //     const photoUrl = getProfilePhotoUrl();
// // // //     if (photoUrl) {
// // // //       setSelectedProfile({ visible: true, imageUrl: photoUrl, driverName: driverProfile?.full_name || currentRide?.driverName || 'Driver' });
// // // //     } else {
// // // //       showCustomAlert('No Photo', 'Driver has not uploaded a profile picture', 'warning');
// // // //     }
// // // //   };
  
// // // //   // Initialize data on component mount
// // // //   useEffect(() => {
// // // //     const initializeData = async () => {
// // // //       if (userBooking?.id) {
// // // //         try {
// // // //           const response = await fetch(`${API_BASE_URL}/api/v1/bookings/${userBooking.id}/ride?_t=${Date.now()}`);
// // // //           const data = await response.json();
          
// // // //           if (data.success && data.ride) {
// // // //             console.log('Fetched ride details from booking API:', data.ride.id);
            
// // // //             setCurrentRide({
// // // //               id: data.ride.id,
// // // //               available_seats: data.ride.available_seats,
// // // //               price: data.ride.price_per_seat,
// // // //               from: data.ride.origin,
// // // //               to: data.ride.destination,
// // // //               departure_time: data.ride.departure_time,
// // // //               phoneNumber: data.ride.driver_phone,
// // // //               driverName: data.ride.driver_name,
// // // //               driverUserId: data.ride.driver_user_id,
// // // //               routeCoordinates: data.ride.route_coordinates,
// // // //               distance_km: data.ride.distance_km,
// // // //               duration_text: data.ride.duration_text,
// // // //               status: data.ride.status,
// // // //               women_only: data.ride.women_only,
// // // //               rating: data.ride.driver_rating || 4.5,
// // // //               origin_lat: data.ride.origin_latitude,
// // // //               origin_lon: data.ride.origin_longitude,
// // // //               suggestedPickup: data.ride.suggested_pickup_point,
// // // //               suggestedDrop: data.ride.suggested_drop_point,
// // // //               started_at: data.ride.started_at,
// // // //               completed_at: data.ride.completed_at,
// // // //             });
            
// // // //             const totalSeats = data.ride.available_seats || 4;
// // // //             setTotalSeatsOffered(totalSeats);
// // // //             setTotalBookedSeats(data.ride.total_booked_seats || userBooking.seats_requested || 1);
// // // //             setAvailableSeats(totalSeats - (data.ride.total_booked_seats || userBooking.seats_requested || 1));
            
// // // //             setUserBooking({
// // // //               id: Number(data.booking.id),
// // // //               seats_requested: Number(data.booking.seats_requested) || 1,
// // // //               status: data.booking.status,
// // // //               total_amount: Number(data.booking.total_amount) || null,
// // // //               created_at: data.booking.created_at,
// // // //             });
            
// // // //             await fetchSeatAvailability();
// // // //             await loadDriverData();
// // // //             await fetchModificationRequests();
// // // //             await fetchDriverRatingForRide();
// // // //             await checkLiveSession();
// // // //             await checkSessionStatus();
// // // //           }
// // // //         } catch (error) {
// // // //           console.log('Error initializing ride data:', error);
// // // //         }
// // // //       }
// // // //     };
    
// // // //     initializeData();
// // // //   }, [userBooking?.id]);
  
// // // //   useEffect(() => {
// // // //     if (currentRide) {
// // // //       loadDriverData();
// // // //       fetchSeatAvailability();
// // // //       checkLiveSession();
// // // //       checkSessionStatus();
// // // //     }
// // // //   }, [currentRide]);
  
// // // //   useFocusEffect(
// // // //     useCallback(() => {
// // // //       if (currentRide) {
// // // //         fetchSeatAvailability();
// // // //         checkLiveSession();
// // // //         checkSessionStatus();
// // // //         fetchModificationRequests();
// // // //         fetchDriverRatingForRide();
// // // //       }
// // // //       hasShownRatingModal.current = false;
// // // //       return () => {
// // // //         if (socketRef.current) {
// // // //           socketRef.current.disconnect();
// // // //           socketRef.current = null;
// // // //         }
// // // //       };
// // // //     }, [currentRide])
// // // //   );
  
// // // //   // Memoized values for map
// // // //   const profilePhotoUrl = getProfilePhotoUrl();
// // // //   const avatarText = getDriverInitials(driverProfile?.full_name || currentRide?.driverName || 'Driver');
// // // //   const isProfilePhotoSvg = profilePhotoUrl?.toLowerCase().includes('.svg');
// // // //   const allPreferences = useMemo(() => extractAllPreferences(currentRide, driverProfile?.travel_preferences), [currentRide, driverProfile]);
  
// // // //   const driverStart = useMemo(() => {
// // // //     const coords = currentRide?.routeCoordinates;
// // // //     if (Array.isArray(coords) && coords.length > 0) {
// // // //       const first = coords[0];
// // // //       if (Array.isArray(first) && first.length === 2) return { latitude: first[1], longitude: first[0] };
// // // //     }
// // // //     return parseSuggestedPoint(currentRide?.suggestedPickup || currentRide?.suggested_pickup_point);
// // // //   }, [currentRide]);
  
// // // //   const driverEnd = useMemo(() => {
// // // //     const coords = currentRide?.routeCoordinates;
// // // //     if (Array.isArray(coords) && coords.length > 0) {
// // // //       const last = coords[coords.length - 1];
// // // //       if (Array.isArray(last) && last.length === 2) return { latitude: last[1], longitude: last[0] };
// // // //     }
// // // //     return parseSuggestedPoint(currentRide?.suggestedDrop || currentRide?.suggested_drop_point);
// // // //   }, [currentRide]);
  
// // // //   const intersectionPickup = useMemo(() => parseSuggestedPoint(currentRide?.suggestedPickup || currentRide?.suggested_pickup_point), [currentRide]);
// // // //   const intersectionDrop = useMemo(() => parseSuggestedPoint(currentRide?.suggestedDrop || currentRide?.suggested_drop_point), [currentRide]);
  
// // // //   const routePath = useMemo(() => {
// // // //     const fullRoute = parseRouteCoordinates(currentRide?.routeCoordinates);
// // // //     if (fullRoute.length >= 2) return fullRoute;
// // // //     if (intersectionPickup && intersectionDrop) return [intersectionPickup, intersectionDrop];
// // // //     return [];
// // // //   }, [currentRide, intersectionPickup, intersectionDrop]);
  
// // // //   const allMarkerCoords = useMemo(() => {
// // // //     const coords = [];
// // // //     if (driverStart) coords.push(driverStart);
// // // //     if (driverEnd) coords.push(driverEnd);
// // // //     if (intersectionPickup) coords.push(intersectionPickup);
// // // //     if (intersectionDrop) coords.push(intersectionDrop);
// // // //     if (driverLocation) coords.push(driverLocation);
// // // //     return coords;
// // // //   }, [driverStart, driverEnd, intersectionPickup, intersectionDrop, driverLocation]);
  
// // // //   const fitMapToMarkers = useCallback(() => {
// // // //     if (mapRef.current && mapReady && allMarkerCoords.length >= 1) {
// // // //       setTimeout(() => {
// // // //         try {
// // // //           if (allMarkerCoords.length === 1) {
// // // //             mapRef.current.animateToRegion({
// // // //               latitude: allMarkerCoords[0].latitude,
// // // //               longitude: allMarkerCoords[0].longitude,
// // // //               latitudeDelta: 0.01,
// // // //               longitudeDelta: 0.01,
// // // //             }, 500);
// // // //           } else {
// // // //             mapRef.current.fitToCoordinates(allMarkerCoords, {
// // // //               edgePadding: { top: 80, right: 50, bottom: 50, left: 50 },
// // // //               animated: true,
// // // //             });
// // // //           }
// // // //         } catch (e) { console.log('fitToCoordinates error:', e); }
// // // //       }, 500);
// // // //     }
// // // //   }, [mapReady, allMarkerCoords]);
  
// // // //   useEffect(() => {
// // // //     if (mapReady && allMarkerCoords.length >= 1) fitMapToMarkers();
// // // //   }, [mapReady, allMarkerCoords, fitMapToMarkers]);
  
// // // //   const vehicleName = driverProfile?.vehicle?.model || currentRide?.vehicle?.model || 'Vehicle details unavailable';
// // // //   const vehicleRegNumber = driverProfile?.vehicle?.registration_number || currentRide?.vehicle?.registration_number;
// // // //   const vehicleColor = driverProfile?.vehicle?.color || currentRide?.vehicle?.color || 'Not specified';
  
// // // //   const rideStatusInfo = getPassengerRideStatusInfo();
// // // //   const modificationsAllowed = canModifySeats();
// // // //   const cancellationsAllowed = canCancelBooking();
// // // //   const isAutoCancelled = rideStatusInfo.type === 'auto-cancelled';
// // // //   const showLiveTracking = (rideStatusInfo.type === 'ongoing' || rideStatusInfo.type === 'driver-late') && !rideCompleted && userBooking?.status === 'accepted';
// // // //   const isCompleted = rideStatusInfo.type === 'completed';
  
// // // //   const otherBookedSeats = totalBookedSeats - (userBooking?.seats_requested || 0);
// // // //   const maxUserCanRequest = totalSeatsOffered - otherBookedSeats;
// // // //   const totalAmountPaid = (currentRide?.price || currentRide?.price_per_seat || 0) * (userBooking?.seats_requested || 1);
  
// // // //   const initialRegion = {
// // // //     latitude: driverLocation?.latitude || intersectionPickup?.latitude || driverStart?.latitude || 28.6139,
// // // //     longitude: driverLocation?.longitude || intersectionPickup?.longitude || driverStart?.longitude || 77.2090,
// // // //     latitudeDelta: 0.02,
// // // //     longitudeDelta: 0.02,
// // // //   };
  
// // // //   if (!currentRide) {
// // // //     return (
// // // //       <View style={styles.loaderContainer}>
// // // //         <Text style={{ fontSize: 16, color: Colors.gray, marginBottom: 20 }}>No ride data available</Text>
// // // //         <TouchableOpacity onPress={() => navigation.goBack()} style={{ padding: 12, backgroundColor: Colors.primary, borderRadius: 8 }}>
// // // //           <Text style={{ color: '#fff' }}>Go Back</Text>
// // // //         </TouchableOpacity>
// // // //       </View>
// // // //     );
// // // //   }
  
// // // //   // Main render
// // // //   return (
// // // //     <View style={styles.container}>
// // // //       <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />
      
// // // //       <Animated.View style={[styles.mapContainer, { height: mapHeight }]}>
// // // //         <MapView
// // // //           ref={mapRef}
// // // //           provider={PROVIDER_GOOGLE}
// // // //           style={styles.map}
// // // //           initialRegion={initialRegion}
// // // //           onMapReady={() => setMapReady(true)}
// // // //           showsUserLocation={true}
// // // //           showsMyLocationButton={true}
// // // //         >
// // // //           {routePath.length >= 2 && <Polyline coordinates={routePath} strokeColor="#2457A6" strokeWidth={5} lineCap="round" lineJoin="round" />}
          
// // // //           {driverStart && (
// // // //             <Marker coordinate={driverStart} anchor={{ x: 0.5, y: 1 }}>
// // // //               <View style={styles.markerWrapper}>
// // // //                 <View style={[styles.pinBubble, { backgroundColor: '#16A34A' }]}><Text style={styles.pinIcon}>S</Text></View>
// // // //                 <View style={[styles.pinPointer, { borderTopColor: '#16A34A' }]} />
// // // //               </View>
// // // //             </Marker>
// // // //           )}
          
// // // //           {driverEnd && (
// // // //             <Marker coordinate={driverEnd} anchor={{ x: 0.5, y: 1 }}>
// // // //               <View style={styles.markerWrapper}>
// // // //                 <View style={[styles.pinBubble, { backgroundColor: '#DC2626' }]}><Text style={styles.pinIcon}>E</Text></View>
// // // //                 <View style={[styles.pinPointer, { borderTopColor: '#DC2626' }]} />
// // // //               </View>
// // // //             </Marker>
// // // //           )}
          
// // // //           {intersectionPickup && (
// // // //             <Marker coordinate={intersectionPickup} anchor={{ x: 0.5, y: 1 }}>
// // // //               <View style={styles.markerWrapper}>
// // // //                 <View style={[styles.pinBubble, { backgroundColor: '#FACC15' }]}><Ionicons name="hand-right" size={12} color="#713F12" /></View>
// // // //                 <View style={[styles.pinPointer, { borderTopColor: '#FACC15' }]} />
// // // //                 <View style={styles.pinLabelBubbleYellow}><Text style={styles.pinLabelTextYellow}>Meet Driver</Text></View>
// // // //               </View>
// // // //             </Marker>
// // // //           )}
          
// // // //           {intersectionDrop && (
// // // //             <Marker coordinate={intersectionDrop} anchor={{ x: 0.5, y: 1 }}>
// // // //               <View style={styles.markerWrapper}>
// // // //                 <View style={[styles.pinBubble, { backgroundColor: '#FACC15' }]}><Ionicons name="exit" size={12} color="#713F12" /></View>
// // // //                 <View style={[styles.pinPointer, { borderTopColor: '#FACC15' }]} />
// // // //                 <View style={styles.pinLabelBubbleYellow}><Text style={styles.pinLabelTextYellow}>Exit Here</Text></View>
// // // //               </View>
// // // //             </Marker>
// // // //           )}
          
// // // //           {/* Driver Live Location Marker */}
// // // //           {driverLocation && (rideStatusInfo.type === 'ongoing' || rideStatusInfo.type === 'driver-late') && (
// // // //             <Marker coordinate={driverLocation} anchor={{ x: 0.5, y: 0.5 }}>
// // // //               <View style={styles.driverLiveMarker}>
// // // //                 <View style={styles.driverLiveDot} />
// // // //                 <View style={styles.driverLiveRing} />
// // // //               </View>
// // // //             </Marker>
// // // //           )}
// // // //         </MapView>
        
// // // //         <TouchableOpacity style={styles.mapBackButton} onPress={() => navigation.goBack()}>
// // // //           <Ionicons name="chevron-back" size={26} color={Colors.secondary} />
// // // //         </TouchableOpacity>
        
// // // //         {/* Live Tracking Button - Shows when ride is ongoing or driver is late */}
// // // //         {showLiveTracking && (
// // // //           <TouchableOpacity 
// // // //             style={styles.liveTrackingButton} 
// // // //             onPress={() => navigation.navigate('OngoingRideRiderScreen', { 
// // // //               bookingId: userBooking?.id, 
// // // //               sessionId: liveSession?.session_id || null 
// // // //             })}
// // // //           >
// // // //             <View style={styles.liveDot} />
// // // //             <Text style={styles.liveTrackingButtonText}>Track Live Ride</Text>
// // // //             {driverDistance && (
// // // //               <Text style={styles.liveDistanceText}>{formatDistance(driverDistance)} away</Text>
// // // //             )}
// // // //           </TouchableOpacity>
// // // //         )}
// // // //       </Animated.View>
      
// // // //       <Animated.View style={[styles.drawer, { height: drawerHeight }]}>
// // // //         <View style={styles.handleWrap} {...panResponder.panHandlers}>
// // // //           <TouchableOpacity activeOpacity={0.9} onPress={toggleDrawer} style={styles.handleHitArea}>
// // // //             <View style={styles.handleBar} />
// // // //           </TouchableOpacity>
// // // //         </View>
        
// // // //         {!drawerExpanded ? (
// // // //           <View style={styles.collapsedSummary}>
// // // //             <View style={styles.collapsedTopRow}>
// // // //               <View style={{ flex: 1 }}>
// // // //                 <View style={styles.collapsedStatusRow}>
// // // //                   <View style={[styles.collapsedStatusBadge, { backgroundColor: rideStatusInfo.color + '20' }]}>
// // // //                     <Ionicons name={rideStatusInfo.icon} size={10} color={rideStatusInfo.color} />
// // // //                     <Text style={[styles.collapsedStatusText, { color: rideStatusInfo.color }]}>{rideStatusInfo.text}</Text>
// // // //                   </View>
// // // //                 </View>
// // // //                 <Text style={styles.collapsedDriver} numberOfLines={1}>{driverProfile?.full_name || currentRide?.driverName || 'Driver'}</Text>
// // // //                 <Text style={styles.collapsedSub} numberOfLines={1}>{currentRide?.from || currentRide?.origin || 'Pickup'} → {currentRide?.to || currentRide?.destination || 'Drop'}</Text>
// // // //               </View>
// // // //               <View style={styles.collapsedPriceWrap}>
// // // //                 <Text style={styles.collapsedPrice}>₹{currentRide?.price || currentRide?.price_per_seat || 0}</Text>
// // // //                 <Text style={styles.collapsedPerSeat}>per seat</Text>
// // // //               </View>
// // // //             </View>
// // // //           </View>
// // // //         ) : (
// // // //           <ScrollView style={styles.drawerScroll} contentContainerStyle={styles.drawerContent}>
// // // //             {/* Ride Status Banner - Shows proper status like MyRides */}
// // // //             <View style={[styles.statusBanner, { backgroundColor: rideStatusInfo.color + '20' }]}>
// // // //               <Ionicons name={rideStatusInfo.icon} size={22} color={rideStatusInfo.color} />
// // // //               <View style={styles.statusBannerTextContainer}>
// // // //                 <Text style={[styles.statusBannerTitle, { color: rideStatusInfo.color }]}>{rideStatusInfo.text}</Text>
// // // //                 {rideStatusInfo.type === 'driver-late' && (
// // // //                   <Text style={styles.statusBannerSubtitle}>The driver is running late. The ride should start soon.</Text>
// // // //                 )}
// // // //                 {rideStatusInfo.type === 'start-soon' && (
// // // //                   <Text style={styles.statusBannerSubtitle}>Be ready at your pickup location!</Text>
// // // //                 )}
// // // //                 {rideStatusInfo.type === 'ongoing' && (
// // // //                   <Text style={styles.statusBannerSubtitle}>Your ride is in progress. Track the driver's location.</Text>
// // // //                 )}
// // // //                 {rideStatusInfo.type === 'completed' && (
// // // //                   <Text style={styles.statusBannerSubtitle}>Thank you for riding with us!</Text>
// // // //                 )}
// // // //               </View>
// // // //             </View>
            
// // // //             {/* Driver Card with Chat Button */}
// // // //             <View style={styles.driverCard}>
// // // //               <View style={styles.driverTopRow}>
// // // //                 <View style={styles.driverLeftWrap}>
// // // //                   <TouchableOpacity style={styles.driverAvatar} onPress={handleProfileImagePress}>
// // // //                     {profilePhotoUrl ? (
// // // //                       isProfilePhotoSvg ? (
// // // //                         <View style={styles.svgAvatarContainer}><SvgCssUri uri={profilePhotoUrl} width={56} height={56} /></View>
// // // //                       ) : (
// // // //                         <Image source={{ uri: profilePhotoUrl }} style={styles.avatarImg} />
// // // //                       )
// // // //                     ) : (
// // // //                       <View style={styles.avatarPlaceholder}>
// // // //                         <Text style={styles.avatarText}>{avatarText}</Text>
// // // //                       </View>
// // // //                     )}
// // // //                   </TouchableOpacity>
// // // //                   <View style={styles.driverMeta}>
// // // //                     <View style={styles.driverNameRow}>
// // // //                       <Text style={styles.driverName}>{driverProfile?.full_name || currentRide?.driverName || 'Driver'}</Text>
// // // //                       {isVerified && <Ionicons name="checkmark-circle" size={14} color="#2457A6" />}
// // // //                     </View>
// // // //                     <View style={styles.ratingRow}>
// // // //                       <Ionicons name="star" size={13} color="#F59E0B" />
// // // //                       <Text style={styles.ratingText}>{driverProfile?.avg_rating || currentRide?.rating || 4.5}</Text>
// // // //                     </View>
// // // //                   </View>
// // // //                 </View>
// // // //                 {/* Chat Button */}
// // // //                 <TouchableOpacity style={styles.chatButton} onPress={handleChatWithDriver}>
// // // //                   <Ionicons name="chatbubble-ellipses" size={22} color="#2457A6" />
// // // //                 </TouchableOpacity>
// // // //               </View>
              
// // // //               {/* Action Buttons Row */}
// // // //               <View style={styles.actionButtonsRow}>
// // // //                 <TouchableOpacity style={styles.profileOutlineBtn} onPress={viewDriverProfile}>
// // // //                   <Text style={styles.profileOutlineBtnText}>View Full Profile</Text>
// // // //                 </TouchableOpacity>
// // // //                 <TouchableOpacity style={styles.shareOutlineBtn} onPress={shareRideDetails}>
// // // //                   <Ionicons name="share-outline" size={18} color="#2457A6" />
// // // //                   <Text style={styles.shareOutlineBtnText}>Share</Text>
// // // //                 </TouchableOpacity>
// // // //               </View>
// // // //             </View>
            
// // // //             {/* Driver's Rating for This Ride */}
// // // //             {showDriverRating && driverRating && (
// // // //               <View style={styles.driverRatingCard}>
// // // //                 <View style={styles.driverRatingHeader}>
// // // //                   <Ionicons name="star" size={18} color="#F59E0B" />
// // // //                   <Text style={styles.driverRatingTitle}>Driver's Rating for this Ride</Text>
// // // //                 </View>
// // // //                 <View style={styles.driverRatingContent}>
// // // //                   <RatingStars rating={driverRating} size={20} />
// // // //                   {driverFeedbackText ? (
// // // //                     <Text style={styles.driverFeedbackText}>"{driverFeedbackText}"</Text>
// // // //                   ) : (
// // // //                     <Text style={styles.driverFeedbackPlaceholder}>No feedback provided</Text>
// // // //                   )}
// // // //                 </View>
// // // //               </View>
// // // //             )}
            
// // // //             {/* Trip Details Section */}
// // // //             <View style={styles.cardSection}>
// // // //               <Text style={styles.sectionTitle}>📍 Trip Details</Text>
              
// // // //               <View style={styles.tripItem}>
// // // //                 <View style={styles.tripIconContainer}>
// // // //                   <Ionicons name="location" size={20} color="#16A34A" />
// // // //                 </View>
// // // //                 <View style={styles.tripDetails}>
// // // //                   <Text style={styles.tripLabel}>From</Text>
// // // //                   <Text style={styles.tripValue}>{currentRide?.from || currentRide?.origin || 'Pickup location'}</Text>
// // // //                 </View>
// // // //               </View>
              
// // // //               <View style={styles.tripDivider} />
              
// // // //               <View style={styles.tripItem}>
// // // //                 <View style={styles.tripIconContainer}>
// // // //                   <Ionicons name="flag" size={20} color="#DC2626" />
// // // //                 </View>
// // // //                 <View style={styles.tripDetails}>
// // // //                   <Text style={styles.tripLabel}>To</Text>
// // // //                   <Text style={styles.tripValue}>{currentRide?.to || currentRide?.destination || 'Drop location'}</Text>
// // // //                 </View>
// // // //               </View>
              
// // // //               <View style={styles.tripMetaRow}>
// // // //                 <View style={styles.tripMetaItem}>
// // // //                   <Ionicons name="calendar-outline" size={16} color={Colors.gray} />
// // // //                   <Text style={styles.tripMetaText}>{formatDate(currentRide?.departure_time)}</Text>
// // // //                 </View>
// // // //                 {currentRide?.distance_km && (
// // // //                   <View style={styles.tripMetaItem}>
// // // //                     <Ionicons name="map-outline" size={16} color={Colors.gray} />
// // // //                     <Text style={styles.tripMetaText}>{currentRide.distance_km} km</Text>
// // // //                   </View>
// // // //                 )}
// // // //                 {currentRide?.duration_text && (
// // // //                   <View style={styles.tripMetaItem}>
// // // //                     <Ionicons name="time-outline" size={16} color={Colors.gray} />
// // // //                     <Text style={styles.tripMetaText}>{currentRide.duration_text}</Text>
// // // //                   </View>
// // // //                 )}
// // // //               </View>
// // // //             </View>
            
// // // //             {/* Vehicle Details Section */}
// // // //             <View style={styles.cardSection}>
// // // //               <Text style={styles.sectionTitle}>🚗 Vehicle Details</Text>
// // // //               <View style={styles.vehicleDetailRow}>
// // // //                 <Ionicons name="car-sport-outline" size={24} color="#2457A6" />
// // // //                 <View style={styles.vehicleDetailInfo}>
// // // //                   <Text style={styles.vehicleDetailName}>{vehicleName}</Text>
// // // //                   <Text style={styles.vehicleDetailColor}>Color: {vehicleColor}</Text>
// // // //                   {vehicleRegNumber && <Text style={styles.vehicleDetailReg}>Registration: {vehicleRegNumber}</Text>}
// // // //                   <Text style={styles.vehicleDetailSeats}>Total Seats: {totalSeatsOffered}</Text>
// // // //                 </View>
// // // //               </View>
// // // //             </View>
            
// // // //             {/* Seat Availability Section */}
// // // //             <View style={styles.cardSection}>
// // // //               <Text style={styles.sectionTitle}>💺 Seat Availability</Text>
// // // //               <View style={styles.seatStatsRow}>
// // // //                 <View style={styles.seatStat}>
// // // //                   <Text style={styles.seatStatValue}>{totalSeatsOffered}</Text>
// // // //                   <Text style={styles.seatStatLabel}>Total Seats</Text>
// // // //                 </View>
// // // //                 <View style={styles.seatStat}>
// // // //                   <Text style={[styles.seatStatValue, { color: '#10B981' }]}>{totalBookedSeats}</Text>
// // // //                   <Text style={styles.seatStatLabel}>Booked</Text>
// // // //                 </View>
// // // //                 <View style={styles.seatStat}>
// // // //                   <Text style={[styles.seatStatValue, { color: '#F59E0B' }]}>{availableSeats}</Text>
// // // //                   <Text style={styles.seatStatLabel}>Available</Text>
// // // //                 </View>
// // // //               </View>
// // // //               <View style={styles.seatProgressContainer}>
// // // //                 <View style={[styles.seatProgressBar, { width: `${totalSeatsOffered > 0 ? (totalBookedSeats / totalSeatsOffered) * 100 : 0}%` }]} />
// // // //               </View>
// // // //             </View>
            
// // // //             {/* Ride Preferences Section */}
// // // //             {allPreferences.length > 0 && (
// // // //               <View style={styles.cardSection}>
// // // //                 <Text style={styles.sectionTitle}>🎯 Ride Preferences</Text>
// // // //                 <View style={styles.tagRow}>
// // // //                   {allPreferences.map((pref, index) => (
// // // //                     <GenericPreferenceTag key={`${pref}-${index}`} label={pref} />
// // // //                   ))}
// // // //                 </View>
// // // //               </View>
// // // //             )}
            
// // // //             {/* Booking Details Section */}
// // // //             <View style={styles.cardSection}>
// // // //               <Text style={styles.sectionTitle}>📋 Your Booking</Text>
              
// // // //               {userBooking ? (
// // // //                 <>
// // // //                   <View style={styles.bookingDetailRow}>
// // // //                     <Text style={styles.bookingDetailLabel}>Booking ID</Text>
// // // //                     <Text style={styles.bookingDetailValue}>#{userBooking.id}</Text>
// // // //                   </View>
// // // //                   <View style={styles.bookingDetailRow}>
// // // //                     <Text style={styles.bookingDetailLabel}>Seats Booked</Text>
// // // //                     <Text style={styles.bookingDetailValue}>{userBooking.seats_requested}</Text>
// // // //                   </View>
// // // //                   <View style={styles.bookingDetailRow}>
// // // //                     <Text style={styles.bookingDetailLabel}>Price per Seat</Text>
// // // //                     <Text style={styles.bookingDetailValue}>₹{currentRide?.price || currentRide?.price_per_seat || 0}</Text>
// // // //                   </View>
// // // //                   <View style={[styles.bookingDetailRow, styles.bookingTotalRow]}>
// // // //                     <Text style={styles.bookingTotalLabel}>Total Amount</Text>
// // // //                     <Text style={styles.bookingTotalValue}>₹{totalAmountPaid}</Text>
// // // //                   </View>
// // // //                   <View style={styles.bookingDetailRow}>
// // // //                     <Text style={styles.bookingDetailLabel}>Status</Text>
// // // //                     <View style={[styles.bookingStatusBadge, { backgroundColor: userBooking.status === 'accepted' ? '#10B98120' : userBooking.status === 'pending' ? '#F59E0B20' : '#EF444420' }]}>
// // // //                       <Text style={[styles.bookingStatusText, { color: userBooking.status === 'accepted' ? '#10B981' : userBooking.status === 'pending' ? '#F59E0B' : '#EF4444' }]}>
// // // //                         {userBooking.status === 'accepted' ? 'Confirmed' : userBooking.status === 'pending' ? 'Pending' : userBooking.status}
// // // //                       </Text>
// // // //                     </View>
// // // //                   </View>
// // // //                 </>
// // // //               ) : (
// // // //                 <Text style={styles.emptyText}>No booking information available</Text>
// // // //               )}
              
// // // //               {/* Pending Modification Request Section */}
// // // //               {pendingModificationRequest && pendingModificationRequest.status === 'pending' && (
// // // //                 <>
// // // //                   <View style={styles.divider} />
// // // //                   <View style={styles.pendingModificationHeader}>
// // // //                     <Ionicons name="time-outline" size={24} color="#F59E0B" />
// // // //                     <Text style={styles.pendingModificationTitle}>Pending Modification Request</Text>
// // // //                   </View>
                  
// // // //                   <View style={styles.pendingModificationDetails}>
// // // //                     <View style={styles.modificationDetailRow}>
// // // //                       <Text style={styles.modificationDetailLabel}>Current Seats:</Text>
// // // //                       <Text style={styles.modificationDetailValue}>{pendingModificationRequest.current_seats || userBooking?.seats_requested}</Text>
// // // //                     </View>
// // // //                     <View style={styles.modificationDetailRow}>
// // // //                       <Text style={styles.modificationDetailLabel}>Requested Seats:</Text>
// // // //                       <Text style={[styles.modificationDetailValue, { color: '#F59E0B', fontWeight: '800' }]}>
// // // //                         {pendingModificationRequest.requested_seats || pendingSeatsRequest}
// // // //                       </Text>
// // // //                     </View>
// // // //                     <View style={styles.modificationDetailRow}>
// // // //                       <Text style={styles.modificationDetailLabel}>Status:</Text>
// // // //                       <View style={[styles.pendingBadge, { backgroundColor: '#FEF3C7' }]}>
// // // //                         <Text style={[styles.pendingBadgeText, { color: '#D97706' }]}>Waiting for Driver Approval</Text>
// // // //                       </View>
// // // //                     </View>
// // // //                     {pendingModificationRequest.created_at && (
// // // //                       <Text style={styles.modificationDate}>
// // // //                         Requested on: {new Date(pendingModificationRequest.created_at).toLocaleString()}
// // // //                       </Text>
// // // //                     )}
// // // //                   </View>
                  
// // // //                   <TouchableOpacity 
// // // //                     style={styles.cancelModificationBtn}
// // // //                     onPress={handleCancelModificationRequest}
// // // //                     disabled={modifyingSeats}
// // // //                   >
// // // //                     <Text style={styles.cancelModificationBtnText}>
// // // //                       {modifyingSeats ? 'Cancelling...' : 'Cancel Request'}
// // // //                     </Text>
// // // //                   </TouchableOpacity>
// // // //                 </>
// // // //               )}
              
// // // //               {/* Modify Seats Section - Only show if no pending modification and not ongoing/completed */}
// // // //               {modificationsAllowed && userBooking?.status === "accepted" && !isAutoCancelled && totalSeatsOffered > 0 && !seatModificationRequested && rideStatusInfo.type !== 'ongoing' && rideStatusInfo.type !== 'completed' && (
// // // //                 <>
// // // //                   <View style={styles.divider} />
// // // //                   <Text style={styles.sectionSubtitle}>Modify Seats</Text>
                  
// // // //                   {otherBookedSeats > 0 && (
// // // //                     <View style={styles.otherBookedInfo}>
// // // //                       <Ionicons name="information-circle" size={14} color="#F59E0B" />
// // // //                       <Text style={styles.otherBookedInfoText}>{otherBookedSeats} seat(s) booked by others</Text>
// // // //                     </View>
// // // //                   )}
                  
// // // //                   <View style={styles.seatSelectorRow}>
// // // //                     <TouchableOpacity style={[styles.seatActionBtn, seatsRequested === 1 && styles.seatActionBtnDisabled]} onPress={() => setSeatsRequested(Math.max(1, seatsRequested - 1))} disabled={seatsRequested === 1 || modifyingSeats}>
// // // //                       <Ionicons name="remove" size={20} color={seatsRequested === 1 ? Colors.gray : Colors.dark} />
// // // //                     </TouchableOpacity>
// // // //                     <View style={styles.seatCountWrap}>
// // // //                       <Text style={styles.seatCountText}>{seatsRequested}</Text>
// // // //                       <Text style={styles.seatAvailableText}>/ {maxUserCanRequest} max</Text>
// // // //                     </View>
// // // //                     <TouchableOpacity style={[styles.seatActionBtn, seatsRequested >= maxUserCanRequest && styles.seatActionBtnDisabled]} onPress={() => setSeatsRequested(Math.min(maxUserCanRequest, seatsRequested + 1))} disabled={seatsRequested >= maxUserCanRequest || modifyingSeats}>
// // // //                       <Ionicons name="add" size={20} color={seatsRequested >= maxUserCanRequest ? Colors.gray : "#2457A6"} />
// // // //                     </TouchableOpacity>
// // // //                   </View>
                  
// // // //                   <TouchableOpacity style={[styles.updateSeatsBtn, (modifyingSeats || seatsRequested === userBooking?.seats_requested) && styles.updateSeatsBtnDisabled]} onPress={handleModifySeats} disabled={modifyingSeats || seatsRequested === userBooking?.seats_requested}>
// // // //                     <Text style={styles.updateSeatsBtnText}>{modifyingSeats ? 'Sending...' : 'Request Seat Change'}</Text>
// // // //                   </TouchableOpacity>
// // // //                 </>
// // // //               )}
              
// // // //               {/* Cancel Booking Button - Only show if not ongoing/completed */}
// // // //               {cancellationsAllowed && userBooking?.status !== "rejected" && !isAutoCancelled && rideStatusInfo.type !== 'ongoing' && rideStatusInfo.type !== 'completed' && (
// // // //                 <TouchableOpacity style={[styles.cancelBookingBtn, (modifyingSeats || cancelLoading) && styles.cancelBookingBtnDisabled]} onPress={() => setShowCancelModal(true)} disabled={modifyingSeats || cancelLoading}>
// // // //                   <Text style={styles.cancelBookingBtnText}>{userBooking?.status === "pending" ? "Cancel Request" : "Cancel Booking"}</Text>
// // // //                 </TouchableOpacity>
// // // //               )}
// // // //             </View>
            
// // // //             {/* Other Riders Section */}
// // // //             <View style={styles.cardSection}>
// // // //               <Text style={styles.sectionTitle}>👥 Other Riders ({otherRiders.length})</Text>
// // // //               {otherRiders.length === 0 ? (
// // // //                 <View style={styles.noRidersContainer}>
// // // //                   <Ionicons name="people-outline" size={40} color={Colors.gray} />
// // // //                   <Text style={styles.noRidersText}>No other riders yet</Text>
// // // //                 </View>
// // // //               ) : (
// // // //                 otherRiders.map((rider, index) => (
// // // //                   <View key={rider.booking_id || index} style={styles.otherRiderItem}>
// // // //                     <View style={styles.otherRiderAvatar}>
// // // //                       {rider.profile_picture ? (
// // // //                         <Image source={{ uri: buildImageUrl(rider.profile_picture) }} style={styles.otherRiderAvatarImg} />
// // // //                       ) : (
// // // //                         <View style={styles.otherRiderAvatarPlaceholder}>
// // // //                           <Text style={styles.otherRiderAvatarText}>{getDriverInitials(rider.passenger_name)}</Text>
// // // //                         </View>
// // // //                       )}
// // // //                     </View>
// // // //                     <View style={styles.otherRiderInfo}>
// // // //                       <Text style={styles.otherRiderName}>{rider.passenger_name || 'Rider'}</Text>
// // // //                       <Text style={styles.otherRiderSeats}>{rider.seats_booked || 1} seat(s)</Text>
// // // //                     </View>
// // // //                   </View>
// // // //                 ))
// // // //               )}
// // // //             </View>
            
// // // //             {/* Safety Card */}
// // // //             <View style={styles.safetyCard}>
// // // //               <Ionicons name="shield-checkmark-outline" size={18} color="#2457A6" />
// // // //               <View>
// // // //                 <Text style={styles.safetyTitle}>Safety First</Text>
// // // //                 <Text style={styles.safetySub}>Live GPS tracking & 24/7 support available</Text>
// // // //               </View>
// // // //             </View>
            
// // // //             <View style={{ height: 40 }} />
// // // //           </ScrollView>
// // // //         )}
// // // //       </Animated.View>
      
// // // //       {/* Cancel Modal */}
// // // //       <Modal visible={showCancelModal} transparent animationType="fade" onRequestClose={() => setShowCancelModal(false)}>
// // // //         <View style={styles.modalBackdrop}>
// // // //           <View style={styles.confirmModalContent}>
// // // //             <Ionicons name="alert-circle" size={40} color="#F59E0B" />
// // // //             <Text style={styles.confirmModalTitle}>{userBooking?.status === "pending" ? "Cancel Request?" : "Cancel Booking?"}</Text>
// // // //             <Text style={styles.confirmModalMessage}>
// // // //               {userBooking?.status === "pending" 
// // // //                 ? "Are you sure you want to cancel your booking request?"
// // // //                 : "Are you sure you want to cancel your booking? This cannot be undone."}
// // // //             </Text>
// // // //             <View style={styles.confirmModalButtons}>
// // // //               <TouchableOpacity style={[styles.confirmModalBtn, styles.confirmModalCancelBtn]} onPress={() => setShowCancelModal(false)}>
// // // //                 <Text style={styles.confirmModalCancelBtnText}>Keep</Text>
// // // //               </TouchableOpacity>
// // // //               <TouchableOpacity style={[styles.confirmModalBtn, styles.confirmModalConfirmBtn]} onPress={handleCancelBooking}>
// // // //                 <Text style={styles.confirmModalConfirmBtnText}>Cancel</Text>
// // // //               </TouchableOpacity>
// // // //             </View>
// // // //           </View>
// // // //         </View>
// // // //       </Modal>
      
// // // //       {/* Rating Modal */}
// // // //       <Modal visible={ratingModalVisible} transparent animationType="fade" onRequestClose={() => setRatingModalVisible(false)}>
// // // //         <View style={styles.modalBackdrop}>
// // // //           <View style={styles.modalCard}>
// // // //             <Text style={styles.modalTitle}>Rate Your Driver</Text>
// // // //             <Text style={styles.modalSub}>How was your ride with {driverProfile?.full_name?.split(' ')[0] || 'the driver'}?</Text>
// // // //             <RatingStars rating={rating} size={32} onPress={setRating} />
// // // //             <TextInput
// // // //               value={feedback}
// // // //               onChangeText={setFeedback}
// // // //               placeholder="Share your feedback (optional)"
// // // //               multiline
// // // //               numberOfLines={3}
// // // //               style={styles.feedbackInput}
// // // //               textAlignVertical="top"
// // // //             />
// // // //             <View style={styles.modalActions}>
// // // //               <TouchableOpacity style={styles.skipBtn} onPress={() => setRatingModalVisible(false)}>
// // // //                 <Text style={styles.skipBtnText}>Cancel</Text>
// // // //               </TouchableOpacity>
// // // //               <TouchableOpacity style={[styles.submitBtn, (rating === 0 || submitting) && { opacity: 0.5 }]} onPress={handleRateDriver} disabled={rating === 0 || submitting}>
// // // //                 <Text style={styles.submitBtnText}>{submitting ? 'Submitting...' : 'Submit Rating'}</Text>
// // // //               </TouchableOpacity>
// // // //             </View>
// // // //           </View>
// // // //         </View>
// // // //       </Modal>
      
// // // //       <ProfileImageModal visible={selectedProfile.visible} imageUrl={selectedProfile.imageUrl} driverName={selectedProfile.driverName} onClose={() => setSelectedProfile({ visible: false, imageUrl: null, driverName: '' })} />
// // // //       <CustomAlert visible={alertVisible} title={alertConfig.title} message={alertConfig.message} icon={alertConfig.icon} iconColor={alertConfig.iconColor} buttons={alertConfig.buttons} onBackdropPress={() => setAlertVisible(false)} />
// // // //     </View>
// // // //   );
// // // // }

// // // // // ============================================
// // // // // STYLES
// // // // // ============================================

// // // // const styles = StyleSheet.create({
// // // //   container: { flex: 1, backgroundColor: '#F4F5F7' },
// // // //   mapContainer: { width: '100%', overflow: 'hidden', backgroundColor: '#E8EEF7' },
// // // //   map: { flex: 1, backgroundColor: '#E8EEF7' },
// // // //   mapBackButton: { position: 'absolute', top: Platform.OS === 'ios' ? 54 : 22, left: 14, width: 42, height: 42, borderRadius: 25, backgroundColor: 'rgba(255,255,255,0.96)', alignItems: 'center', justifyContent: 'center', shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4, elevation: 3 },
// // // //   liveTrackingButton: { position: 'absolute', bottom: 20, left: 20, right: 20, backgroundColor: '#10B981', flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 14, borderRadius: 12, gap: 8, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.25, shadowRadius: 4, elevation: 5 },
// // // //   liveTrackingButtonText: { color: '#fff', fontWeight: '700', fontSize: 14 },
// // // //   liveDistanceText: { color: '#fff', fontWeight: '600', fontSize: 12, backgroundColor: 'rgba(255,255,255,0.2)', paddingHorizontal: 8, paddingVertical: 2, borderRadius: 12, marginLeft: 4 },
// // // //   liveDot: { width: 10, height: 10, borderRadius: 5, backgroundColor: '#fff', marginRight: 6 },
// // // //   driverLiveMarker: { alignItems: 'center', justifyContent: 'center' },
// // // //   driverLiveDot: { width: 16, height: 16, borderRadius: 8, backgroundColor: '#2457A6', borderWidth: 3, borderColor: '#fff' },
// // // //   driverLiveRing: { position: 'absolute', width: 32, height: 32, borderRadius: 16, backgroundColor: 'rgba(36,87,166,0.2)', borderWidth: 1, borderColor: '#2457A6' },
// // // //   markerWrapper: { alignItems: 'center' },
// // // //   pinBubble: { width: 28, height: 28, borderRadius: 14, borderWidth: 3, borderColor: 'white', alignItems: 'center', justifyContent: 'center', shadowColor: '#000', shadowOffset: { width: 0, height: 3 }, shadowOpacity: 0.25, shadowRadius: 4, elevation: 5 },
// // // //   pinPointer: { width: 0, height: 0, backgroundColor: 'transparent', borderStyle: 'solid', borderLeftWidth: 7, borderRightWidth: 7, borderTopWidth: 10, borderLeftColor: 'transparent', borderRightColor: 'transparent', marginTop: -2 },
// // // //   pinIcon: { fontSize: 14, fontWeight: '800', color: 'white', textAlign: 'center', lineHeight: 18 },
// // // //   pinLabelBubbleYellow: { backgroundColor: 'rgba(113, 63, 18, 0.9)', borderRadius: 8, paddingHorizontal: 8, paddingVertical: 3, marginTop: 4 },
// // // //   pinLabelTextYellow: { color: '#FACC15', fontSize: 10, fontWeight: '700' },
// // // //   drawer: { position: 'absolute', bottom: 0, left: 0, right: 0, backgroundColor: '#F4F5F7', borderTopLeftRadius: 28, borderTopRightRadius: 28, overflow: 'hidden', shadowColor: '#000', shadowOffset: { width: 0, height: -2 }, shadowOpacity: 0.1, shadowRadius: 8, elevation: 10 },
// // // //   handleWrap: { alignItems: 'center', paddingTop: 10, paddingBottom: 8, backgroundColor: '#F4F5F7', position: 'relative' },
// // // //   handleHitArea: { paddingHorizontal: 40, paddingVertical: 10, alignItems: 'center', justifyContent: 'center' },
// // // //   handleBar: { width: 64, height: 6, borderRadius: 99, backgroundColor: '#CDD2D8' },
// // // //   collapsedSummary: { paddingHorizontal: 16, paddingTop: 4, paddingBottom: 12 },
// // // //   collapsedTopRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12 },
// // // //   collapsedStatusRow: { marginBottom: 6 },
// // // //   collapsedStatusBadge: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 8, paddingVertical: 3, borderRadius: 12, gap: 4, alignSelf: 'flex-start' },
// // // //   collapsedStatusText: { fontSize: 10, fontWeight: '600' },
// // // //   collapsedDriver: { fontSize: 16, fontWeight: '800', color: Colors.dark },
// // // //   collapsedSub: { marginTop: 2, fontSize: 12, color: Colors.gray, fontWeight: '600' },
// // // //   collapsedPriceWrap: { alignItems: 'flex-end' },
// // // //   collapsedPrice: { fontSize: 18, fontWeight: '900', color: Colors.dark },
// // // //   collapsedPerSeat: { fontSize: 10, color: Colors.gray, fontWeight: '600' },
// // // //   drawerScroll: { flex: 1 },
// // // //   drawerContent: { paddingHorizontal: 16, paddingBottom: 16 },
// // // //   statusBanner: { flexDirection: 'row', alignItems: 'flex-start', padding: 14, borderRadius: 16, marginBottom: 14, gap: 12 },
// // // //   statusBannerTextContainer: { flex: 1 },
// // // //   statusBannerTitle: { fontSize: 16, fontWeight: '800' },
// // // //   statusBannerSubtitle: { fontSize: 12, color: '#6B7280', marginTop: 4 },
// // // //   driverCard: { backgroundColor: 'white', borderRadius: 20, padding: 16, marginBottom: 14, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 8, elevation: 2 },
// // // //   driverTopRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
// // // //   driverLeftWrap: { flexDirection: 'row', flex: 1, paddingRight: 10 },
// // // //   driverAvatar: { width: 56, height: 56, borderRadius: 28, backgroundColor: '#E5E7EB', overflow: 'hidden', alignItems: 'center', justifyContent: 'center', marginRight: 12 },
// // // //   avatarImg: { width: 56, height: 56, borderRadius: 28, resizeMode: 'cover' },
// // // //   avatarText: { fontSize: 15, fontWeight: '800', color: Colors.gray },
// // // //   avatarPlaceholder: { width: 56, height: 56, borderRadius: 28, backgroundColor: '#E5E7EB', alignItems: 'center', justifyContent: 'center' },
// // // //   svgAvatarContainer: { width: 56, height: 56, borderRadius: 28, overflow: 'hidden', alignItems: 'center', justifyContent: 'center', backgroundColor: '#E5E7EB' },
// // // //   driverMeta: { flex: 1 },
// // // //   driverNameRow: { flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap', gap: 6 },
// // // //   driverName: { fontSize: 17, fontWeight: '800', color: Colors.dark },
// // // //   ratingRow: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 6 },
// // // //   ratingText: { fontSize: 13, color: Colors.dark, fontWeight: '700' },
// // // //   chatButton: { width: 44, height: 44, borderRadius: 22, backgroundColor: '#E8F0FE', alignItems: 'center', justifyContent: 'center' },
// // // //   actionButtonsRow: { flexDirection: 'row', gap: 12, marginTop: 14 },
// // // //   profileOutlineBtn: { flex: 2, borderWidth: 1, borderColor: '#2457A6', borderRadius: 16, paddingVertical: 12, alignItems: 'center' },
// // // //   profileOutlineBtnText: { color: '#2457A6', fontWeight: '700', fontSize: 14 },
// // // //   shareOutlineBtn: { flex: 1, borderWidth: 1, borderColor: '#2457A6', borderRadius: 16, paddingVertical: 12, alignItems: 'center', flexDirection: 'row', justifyContent: 'center', gap: 6 },
// // // //   shareOutlineBtnText: { color: '#2457A6', fontWeight: '700', fontSize: 14 },
// // // //   driverRatingCard: { backgroundColor: '#FFFBEB', borderRadius: 16, padding: 14, marginBottom: 14, borderWidth: 1, borderColor: '#FDE68A' },
// // // //   driverRatingHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 10 },
// // // //   driverRatingTitle: { fontSize: 13, fontWeight: '600', color: '#92400E' },
// // // //   driverRatingContent: { alignItems: 'center', gap: 8 },
// // // //   driverFeedbackText: { fontSize: 13, color: '#78350F', fontStyle: 'italic', textAlign: 'center' },
// // // //   driverFeedbackPlaceholder: { fontSize: 12, color: '#B45309', opacity: 0.7, fontStyle: 'italic' },
// // // //   cardSection: { backgroundColor: 'white', borderRadius: 20, padding: 16, marginBottom: 14, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 8, elevation: 2 },
// // // //   sectionTitle: { fontSize: 16, fontWeight: '800', color: Colors.dark, marginBottom: 14 },
// // // //   sectionSubtitle: { fontSize: 14, fontWeight: '600', color: Colors.dark, marginBottom: 12, marginTop: 8 },
// // // //   tripItem: { flexDirection: 'row', marginBottom: 16 },
// // // //   tripIconContainer: { width: 32, height: 32, borderRadius: 16, backgroundColor: '#F0F7FF', alignItems: 'center', justifyContent: 'center', marginRight: 12 },
// // // //   tripDetails: { flex: 1 },
// // // //   tripLabel: { fontSize: 12, color: Colors.gray, marginBottom: 2 },
// // // //   tripValue: { fontSize: 15, fontWeight: '600', color: Colors.dark },
// // // //   tripDivider: { height: 1, backgroundColor: '#EEF2F7', marginVertical: 12, marginLeft: 16 },
// // // //   tripMetaRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 16, marginTop: 8, paddingTop: 12, borderTopWidth: 1, borderTopColor: '#EEF2F7' },
// // // //   tripMetaItem: { flexDirection: 'row', alignItems: 'center', gap: 6 },
// // // //   tripMetaText: { fontSize: 13, color: Colors.gray },
// // // //   vehicleDetailRow: { flexDirection: 'row', alignItems: 'center', gap: 16 },
// // // //   vehicleDetailInfo: { flex: 1 },
// // // //   vehicleDetailName: { fontSize: 15, fontWeight: '600', color: Colors.dark },
// // // //   vehicleDetailColor: { fontSize: 13, color: '#6B7280', marginTop: 2 },
// // // //   vehicleDetailReg: { fontSize: 12, color: '#9CA3AF', marginTop: 2 },
// // // //   vehicleDetailSeats: { fontSize: 12, color: '#6B7280', marginTop: 2 },
// // // //   seatStatsRow: { flexDirection: 'row', justifyContent: 'space-around', marginBottom: 16 },
// // // //   seatStat: { alignItems: 'center' },
// // // //   seatStatValue: { fontSize: 24, fontWeight: '800', color: Colors.dark },
// // // //   seatStatLabel: { fontSize: 12, color: Colors.gray, marginTop: 4 },
// // // //   seatProgressContainer: { height: 6, backgroundColor: '#E5E7EB', borderRadius: 3, overflow: 'hidden', marginBottom: 8 },
// // // //   seatProgressBar: { height: '100%', backgroundColor: '#10B981', borderRadius: 3 },
// // // //   tagRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 14 },
// // // //   preferenceTag: { paddingHorizontal: 12, paddingVertical: 8, borderRadius: 999, backgroundColor: '#FFF3E8' },
// // // //   preferenceTagText: { fontSize: 12, color: '#C65D00', fontWeight: '700' },
// // // //   bookingDetailRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 8 },
// // // //   bookingDetailLabel: { fontSize: 14, color: Colors.gray },
// // // //   bookingDetailValue: { fontSize: 14, fontWeight: '600', color: Colors.dark },
// // // //   bookingTotalRow: { marginTop: 8, paddingTop: 8, borderTopWidth: 1, borderTopColor: '#EEF2F7' },
// // // //   bookingTotalLabel: { fontSize: 16, fontWeight: '700', color: Colors.dark },
// // // //   bookingTotalValue: { fontSize: 18, fontWeight: '800', color: '#184080' },
// // // //   bookingStatusBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20 },
// // // //   bookingStatusText: { fontSize: 12, fontWeight: '600' },
// // // //   divider: { height: 1, backgroundColor: '#EEF2F7', marginVertical: 16 },
// // // //   otherBookedInfo: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFFBEB', padding: 10, borderRadius: 8, marginBottom: 12, gap: 8 },
// // // //   otherBookedInfoText: { flex: 1, fontSize: 11, color: '#B45309' },
// // // //   seatSelectorRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: '#FAFAFB', borderRadius: 18, padding: 14, marginBottom: 12 },
// // // //   seatActionBtn: { width: 38, height: 38, borderRadius: 12, borderWidth: 1, borderColor: '#D6DDE7', alignItems: 'center', justifyContent: 'center', backgroundColor: 'white' },
// // // //   seatActionBtnDisabled: { opacity: 0.5, backgroundColor: '#F5F5F5' },
// // // //   seatCountWrap: { flexDirection: 'row', alignItems: 'baseline' },
// // // //   seatCountText: { fontSize: 28, fontWeight: '900', color: Colors.dark },
// // // //   seatAvailableText: { fontSize: 13, color: Colors.gray, marginLeft: 6, fontWeight: '600' },
// // // //   updateSeatsBtn: { backgroundColor: Colors.primary, paddingVertical: 12, borderRadius: 12, alignItems: 'center', marginTop: 8 },
// // // //   updateSeatsBtnDisabled: { opacity: 0.6 },
// // // //   updateSeatsBtnText: { color: '#fff', fontWeight: '700', fontSize: 14 },
// // // //   cancelBookingBtn: { marginTop: 12, backgroundColor: '#FEF2F2', paddingVertical: 12, borderRadius: 12, alignItems: 'center', borderWidth: 1, borderColor: '#EF4444' },
// // // //   cancelBookingBtnText: { color: '#EF4444', fontWeight: '700', fontSize: 14 },
// // // //   cancelBookingBtnDisabled: { opacity: 0.6 },
// // // //   noRidersContainer: { alignItems: 'center', padding: 30, gap: 10 },
// // // //   noRidersText: { fontSize: 14, fontWeight: '600', color: Colors.gray },
// // // //   otherRiderItem: { flexDirection: 'row', alignItems: 'center', paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: '#EEF2F7' },
// // // //   otherRiderAvatar: { width: 44, height: 44, borderRadius: 22, backgroundColor: '#E5E7EB', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', marginRight: 12 },
// // // //   otherRiderAvatarImg: { width: 44, height: 44, borderRadius: 22, resizeMode: 'cover' },
// // // //   otherRiderAvatarPlaceholder: { width: 44, height: 44, borderRadius: 22, backgroundColor: '#E5E7EB', alignItems: 'center', justifyContent: 'center' },
// // // //   otherRiderAvatarText: { fontSize: 16, fontWeight: '700', color: Colors.primary },
// // // //   otherRiderInfo: { flex: 1 },
// // // //   otherRiderName: { fontSize: 15, fontWeight: '600', color: Colors.dark, marginBottom: 2 },
// // // //   otherRiderSeats: { fontSize: 12, color: Colors.gray },
// // // //   safetyCard: { backgroundColor: '#FFF3E7', borderRadius: 18, padding: 16, marginBottom: 14, flexDirection: 'row', alignItems: 'center', gap: 12 },
// // // //   safetyTitle: { fontSize: 14, color: '#2457A6', fontWeight: '800' },
// // // //   safetySub: { marginTop: 2, fontSize: 12, color: '#2457A6', opacity: 0.9, fontWeight: '600' },
// // // //   loaderContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#fff' },
// // // //   modalBackdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center' },
// // // //   confirmModalContent: { backgroundColor: 'white', borderRadius: 24, padding: 24, width: '85%', alignItems: 'center' },
// // // //   confirmModalTitle: { fontSize: 20, fontWeight: '800', color: Colors.dark, marginTop: 12 },
// // // //   confirmModalMessage: { fontSize: 14, color: Colors.gray, textAlign: 'center', marginBottom: 24, lineHeight: 20 },
// // // //   confirmModalButtons: { flexDirection: 'row', gap: 12, width: '100%' },
// // // //   confirmModalBtn: { flex: 1, paddingVertical: 12, borderRadius: 12, alignItems: 'center' },
// // // //   confirmModalCancelBtn: { backgroundColor: '#F3F4F6' },
// // // //   confirmModalCancelBtnText: { color: Colors.dark, fontWeight: '600' },
// // // //   confirmModalConfirmBtn: { backgroundColor: '#EF4444' },
// // // //   confirmModalConfirmBtnText: { color: '#fff', fontWeight: '600' },
// // // //   modalCard: { backgroundColor: '#fff', borderRadius: 24, padding: 20, alignItems: 'center', width: width - 40 },
// // // //   modalTitle: { fontSize: 22, fontWeight: '700', color: '#111827', textAlign: 'center', marginTop: 12 },
// // // //   modalSub: { fontSize: 14, color: '#6B7280', textAlign: 'center', marginTop: 8, marginBottom: 18 },
// // // //   starsRow: { flexDirection: 'row', justifyContent: 'center', marginBottom: 18 },
// // // //   feedbackInput: { minHeight: 100, borderWidth: 1, borderColor: '#E5E7EB', borderRadius: 16, padding: 14, color: '#111827', fontSize: 14, width: '100%' },
// // // //   modalActions: { flexDirection: 'row', gap: 10, marginTop: 18, width: '100%' },
// // // //   skipBtn: { flex: 1, borderWidth: 1, borderColor: '#D1D5DB', borderRadius: 999, paddingVertical: 14, alignItems: 'center' },
// // // //   skipBtnText: { color: '#6B7280', fontWeight: '600' },
// // // //   submitBtn: { flex: 1, backgroundColor: Colors.primary, borderRadius: 999, paddingVertical: 14, alignItems: 'center' },
// // // //   submitBtnText: { color: '#fff', fontWeight: '700' },
// // // //   imageModalContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', width: '100%' },
// // // //   imageModalContent: { width: '90%', backgroundColor: Colors.white, borderRadius: 20, overflow: 'hidden', maxHeight: '80%' },
// // // //   imageModalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 16, borderBottomWidth: 1, borderBottomColor: '#EEF2F7' },
// // // //   imageModalTitle: { fontSize: 18, fontWeight: '700', color: Colors.dark },
// // // //   fullProfileImage: { width: '100%', height: 400, backgroundColor: '#F5F5F5', resizeMode: 'contain' },
// // // //   modalSvgContainer: { width: '100%', height: 400, backgroundColor: '#F5F5F5', alignItems: 'center', justifyContent: 'center' },
// // // //   noImageContainer: { width: '100%', height: 400, justifyContent: 'center', alignItems: 'center', backgroundColor: '#F5F5F5' },
// // // //   noImageText: { fontSize: 16, color: Colors.gray },
// // // //   emptyText: { fontSize: 13, color: Colors.gray, fontWeight: '600' },
  
// // // //   // Pending Modification Styles
// // // //   pendingModificationHeader: {
// // // //     flexDirection: 'row',
// // // //     alignItems: 'center',
// // // //     gap: 12,
// // // //     marginBottom: 16,
// // // //     paddingBottom: 12,
// // // //     borderBottomWidth: 1,
// // // //     borderBottomColor: '#FDE68A',
// // // //   },
// // // //   pendingModificationTitle: {
// // // //     fontSize: 18,
// // // //     fontWeight: '700',
// // // //     color: '#92400E',
// // // //     flex: 1,
// // // //   },
// // // //   pendingModificationDetails: {
// // // //     backgroundColor: '#FFFBEB',
// // // //     borderRadius: 12,
// // // //     padding: 14,
// // // //     marginBottom: 16,
// // // //     borderWidth: 1,
// // // //     borderColor: '#FDE68A',
// // // //   },
// // // //   modificationDetailRow: {
// // // //     flexDirection: 'row',
// // // //     justifyContent: 'space-between',
// // // //     alignItems: 'center',
// // // //     paddingVertical: 8,
// // // //   },
// // // //   modificationDetailLabel: {
// // // //     fontSize: 14,
// // // //     color: '#6B7280',
// // // //   },
// // // //   modificationDetailValue: {
// // // //     fontSize: 16,
// // // //     fontWeight: '600',
// // // //     color: '#111827',
// // // //   },
// // // //   pendingBadge: {
// // // //     paddingHorizontal: 10,
// // // //     paddingVertical: 4,
// // // //     borderRadius: 20,
// // // //   },
// // // //   pendingBadgeText: {
// // // //     fontSize: 12,
// // // //     fontWeight: '600',
// // // //   },
// // // //   modificationDate: {
// // // //     fontSize: 11,
// // // //     color: '#9CA3AF',
// // // //     marginTop: 8,
// // // //     textAlign: 'center',
// // // //   },
// // // //   cancelModificationBtn: {
// // // //     backgroundColor: '#FEF2F2',
// // // //     paddingVertical: 12,
// // // //     borderRadius: 12,
// // // //     alignItems: 'center',
// // // //     borderWidth: 1,
// // // //     borderColor: '#EF4444',
// // // //   },
// // // //   cancelModificationBtnText: {
// // // //     color: '#EF4444',
// // // //     fontWeight: '600',
// // // //     fontSize: 14,
// // // //   },
// // // // });
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
// // //   LogBox,
// // //   TextInput,
// // //   Share,
// // //   Alert,
// // //   ActivityIndicator,
// // //   RefreshControl,
// // // } from 'react-native';
// // // import MapView, { Marker, Polyline, PROVIDER_GOOGLE } from 'react-native-maps';
// // // import { Ionicons } from '@expo/vector-icons';
// // // import LottieView from "lottie-react-native";
// // // import { SvgCssUri } from 'react-native-svg/css';
// // // import { Colors } from '../constants/Colors';
// // // import { useAuth } from '../context/AuthContext';
// // // import { API_BASE_URL } from '../config/config_ip';
// // // import CustomAlert from '../components/CustomAlert';
// // // import { useFocusEffect } from '@react-navigation/native';
// // // import io from 'socket.io-client';
// // // import ChatService from '../services/ChatService';

// // // LogBox.ignoreLogs(['Accessibility: View', 'Property accessibilityState', 'RCTView']);

// // // const { height, width } = Dimensions.get('window');
// // // const SAFE_TOP = Platform.OS === 'ios' ? 56 : 24;
// // // const COLLAPSED_HEIGHT = 84;
// // // const EXPANDED_HEIGHT = height * 0.72;

// // // // ============================================
// // // // UTILITY FUNCTIONS
// // // // ============================================

// // // function buildImageUrl(url) {
// // //   if (!url) return null;
// // //   if (url.startsWith('http://') || url.startsWith('https://')) return url;
// // //   return `${API_BASE_URL}${url.startsWith('/') ? '' : '/'}${url}`;
// // // }

// // // function getDriverInitials(name) {
// // //   if (!name) return 'D';
// // //   const parts = name.trim().split(' ').filter(Boolean);
// // //   if (parts.length > 1) return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
// // //   return parts[0].slice(0, 2).toUpperCase();
// // // }

// // // function parseSuggestedPoint(point) {
// // //   if (!point) return null;
// // //   if (Array.isArray(point) && point.length === 2) {
// // //     return { longitude: Number(point[0]), latitude: Number(point[1]) };
// // //   }
// // //   if (point.lng != null && point.lat != null) {
// // //     return { longitude: Number(point.lng), latitude: Number(point.lat) };
// // //   }
// // //   if (point.longitude != null && point.latitude != null) {
// // //     return { longitude: Number(point.longitude), latitude: Number(point.latitude) };
// // //   }
// // //   return null;
// // // }

// // // function parseRouteCoordinates(routeCoordinates) {
// // //   if (!Array.isArray(routeCoordinates)) return [];
// // //   return routeCoordinates.map((item) => {
// // //     if (Array.isArray(item) && item.length === 2) {
// // //       return { longitude: Number(item[0]), latitude: Number(item[1]) };
// // //     }
// // //     if (item && typeof item === 'object' && item.latitude && item.longitude) {
// // //       return { longitude: Number(item.longitude), latitude: Number(item.latitude) };
// // //     }
// // //     return parseSuggestedPoint(item);
// // //   }).filter(Boolean);
// // // }

// // // function isSvgUrl(url) {
// // //   if (!url) return false;
// // //   return url.toLowerCase().includes('.svg') || url.toLowerCase().includes('.svg?');
// // // }

// // // function formatDate(dateString) {
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
// // //   const timeText = date.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit", hour12: true });
// // //   return `${dayText}, ${timeText}`;
// // // }

// // // function extractAllPreferences(ride, driverTravelPrefs) {
// // //   let ridePrefs = ride?.preferences;
// // //   if (ridePrefs && typeof ridePrefs === 'string') {
// // //     try { ridePrefs = JSON.parse(ridePrefs); } catch (e) { ridePrefs = null; }
// // //   }
// // //   if (ridePrefs && typeof ridePrefs === 'object' && Object.keys(ridePrefs).length > 0) {
// // //     return extractFromObject(ridePrefs);
// // //   }
// // //   if (driverTravelPrefs && typeof driverTravelPrefs === 'object' && Object.keys(driverTravelPrefs).length > 0) {
// // //     return extractFromObject(driverTravelPrefs);
// // //   }
// // //   return [];
// // // }

// // // function extractFromObject(prefs) {
// // //   const allPreferences = [];
// // //   Object.entries(prefs).forEach(([key, value]) => {
// // //     if (value === null || value === undefined) return;
// // //     const formattedKey = key.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
// // //     if (typeof value === 'boolean') {
// // //       if (value === true) allPreferences.push(formattedKey);
// // //     } else if (Array.isArray(value)) {
// // //       if (value.length > 0) allPreferences.push(`${formattedKey}: ${value.join(', ')}`);
// // //     } else if (typeof value === 'object') {
// // //       allPreferences.push(...extractFromObject(value));
// // //     } else if (typeof value === 'string' && value.trim()) {
// // //       const lowerValue = value.toLowerCase();
// // //       if (!['false', 'no', 'none', 'null', 'undefined'].includes(lowerValue)) {
// // //         allPreferences.push(`${formattedKey}: ${value}`);
// // //       }
// // //     } else if (typeof value === 'number') {
// // //       allPreferences.push(`${formattedKey}: ${value}`);
// // //     }
// // //   });
// // //   return [...new Set(allPreferences)];
// // // }

// // // // ============================================
// // // // COMPONENTS
// // // // ============================================

// // // function GenericPreferenceTag({ label }) {
// // //   if (!label || label.trim() === '') return null;
// // //   let tagColor = '#FFF3E8';
// // //   let textColor = '#C65D00';
// // //   const lowerLabel = label.toLowerCase();
// // //   if (lowerLabel.includes('age') || lowerLabel.includes('category')) {
// // //     tagColor = '#E8F5E9'; textColor = '#2E7D32';
// // //   } else if (lowerLabel.includes('chat') || lowerLabel.includes('talk')) {
// // //     tagColor = '#E3F2FD'; textColor = '#1565C0';
// // //   } else if (lowerLabel.includes('gender')) {
// // //     tagColor = '#F3E5F5'; textColor = '#6A1B9A';
// // //   } else if (lowerLabel.includes('language') || lowerLabel.includes('speak')) {
// // //     tagColor = '#FFF9C4'; textColor = '#F57F17';
// // //   } else if (lowerLabel.includes('verified')) {
// // //     tagColor = '#E8F5E9'; textColor = '#2E7D32';
// // //   }
// // //   return (
// // //     <View style={[styles.preferenceTag, { backgroundColor: tagColor }]}>
// // //       <Text style={[styles.preferenceTagText, { color: textColor }]}>{label}</Text>
// // //     </View>
// // //   );
// // // }

// // // function ProfileImageModal({ visible, imageUrl, driverName, onClose }) {
// // //   const [isSvg, setIsSvg] = useState(false);
// // //   useEffect(() => {
// // //     if (imageUrl) setIsSvg(imageUrl.toLowerCase().includes('.svg'));
// // //   }, [imageUrl]);
// // //   if (!visible) return null;
// // //   return (
// // //     <Modal visible={visible} transparent={true} animationType="fade" onRequestClose={onClose}>
// // //       <TouchableOpacity style={styles.modalBackdrop} activeOpacity={1} onPress={onClose}>
// // //         <View style={styles.imageModalContainer}>
// // //           <View style={styles.imageModalContent}>
// // //             <View style={styles.imageModalHeader}>
// // //               <Text style={styles.imageModalTitle}>{driverName}</Text>
// // //               <TouchableOpacity onPress={onClose}><Ionicons name="close" size={24} color={Colors.dark} /></TouchableOpacity>
// // //             </View>
// // //             {imageUrl && imageUrl !== 'null' && imageUrl !== 'undefined' ? (
// // //               isSvg ? (
// // //                 <View style={styles.modalSvgContainer}><SvgCssUri uri={imageUrl} width="100%" height={400} /></View>
// // //               ) : (
// // //                 <Image source={{ uri: imageUrl }} style={styles.fullProfileImage} resizeMode="contain" />
// // //               )
// // //             ) : (
// // //               <View style={styles.noImageContainer}><Text style={styles.noImageText}>No profile picture available</Text></View>
// // //             )}
// // //           </View>
// // //         </View>
// // //       </TouchableOpacity>
// // //     </Modal>
// // //   );
// // // }

// // // // Rating Stars Component
// // // function RatingStars({ rating, size = 16, onPress }) {
// // //   return (
// // //     <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
// // //       {[1, 2, 3, 4, 5].map((star) => (
// // //         <TouchableOpacity key={star} onPress={() => onPress?.(star)} disabled={!onPress}>
// // //           <Ionicons 
// // //             name={star <= rating ? 'star' : 'star-outline'} 
// // //             size={size} 
// // //             color={star <= rating ? '#F59E0B' : '#D1D5DB'} 
// // //           />
// // //         </TouchableOpacity>
// // //       ))}
// // //     </View>
// // //   );
// // // }

// // // // ============================================
// // // // MAIN SCREEN COMPONENT
// // // // ============================================

// // // export default function ViewRouteRequestScreen({ navigation, route }) {
// // //   const { user } = useAuth();
// // //   const params = route.params || {};
// // //   const initialRide = params.ride || null;
// // //   const booking = params.booking || null;

// // //   // State for ride data
// // //   const [currentRide, setCurrentRide] = useState(() => {
// // //     if (initialRide && initialRide.id) {
// // //       return initialRide;
// // //     }
// // //     if (booking?.ride) {
// // //       return booking.ride;
// // //     }
// // //     return null;
// // //   });

// // //   const [userBooking, setUserBooking] = useState(() => {
// // //     if (booking && booking.id) {
// // //       return {
// // //         id: Number(booking.id),
// // //         seats_requested: Number(booking.seats_requested) || 1,
// // //         status: booking.status || 'pending',
// // //         total_amount: Number(booking.total_amount) || null,
// // //         created_at: booking.created_at,
// // //       };
// // //     }
// // //     if (initialRide?.booking && initialRide.booking.id) {
// // //       return {
// // //         id: Number(initialRide.booking.id),
// // //         seats_requested: Number(initialRide.booking.seats_requested) || 1,
// // //         status: initialRide.booking.status || 'pending',
// // //         total_amount: Number(initialRide.booking.total_amount) || null,
// // //       };
// // //     }
// // //     if (initialRide?.seatsRequested) {
// // //       return {
// // //         id: Number(initialRide.id),
// // //         seats_requested: Number(initialRide.seatsRequested),
// // //         status: 'accepted',
// // //       };
// // //     }
// // //     return null;
// // //   });

// // //   const [driverProfile, setDriverProfile] = useState(null);
// // //   const [isVerified, setIsVerified] = useState(false);
// // //   const [loadingProfile, setLoadingProfile] = useState(false);
  
// // //   // UI State
// // //   const [drawerExpanded, setDrawerExpanded] = useState(true);
// // //   const [mapReady, setMapReady] = useState(false);
// // //   const [showCancelModal, setShowCancelModal] = useState(false);
// // //   const [ratingModalVisible, setRatingModalVisible] = useState(false);
// // //   const [selectedProfile, setSelectedProfile] = useState({ visible: false, imageUrl: null, driverName: '' });
// // //   const [alertVisible, setAlertVisible] = useState(false);
// // //   const [alertConfig, setAlertConfig] = useState({ title: "", message: "", icon: "check-circle", iconColor: "#10B981", buttons: [] });
// // //   const [refreshing, setRefreshing] = useState(false);
  
// // //   // Seat related state
// // //   const [seatsRequested, setSeatsRequested] = useState(() => {
// // //     if (booking?.seats_requested) return booking.seats_requested;
// // //     if (initialRide?.seatsRequested) return initialRide.seatsRequested;
// // //     return 1;
// // //   });
// // //   const [modifyingSeats, setModifyingSeats] = useState(false);
// // //   const [totalSeatsOffered, setTotalSeatsOffered] = useState(() => initialRide?.available_seats || 4);
// // //   const [totalBookedSeats, setTotalBookedSeats] = useState(() => booking?.seats_requested || initialRide?.seatsRequested || 0);
// // //   const [availableSeats, setAvailableSeats] = useState(() => (initialRide?.available_seats || 4) - (booking?.seats_requested || initialRide?.seatsRequested || 0));
// // //   const [otherRiders, setOtherRiders] = useState([]);
  
// // //   // Modification request state
// // //   const [seatModificationRequested, setSeatModificationRequested] = useState(false);
// // //   const [pendingSeatsRequest, setPendingSeatsRequest] = useState(null);
// // //   const [pendingRequestDetails, setPendingRequestDetails] = useState(null);
// // //   const [pendingModificationRequest, setPendingModificationRequest] = useState(null);
  
// // //   // Live tracking state
// // //   const [liveSession, setLiveSession] = useState(null);
// // //   const [driverLocation, setDriverLocation] = useState(null);
// // //   const [socketConnected, setSocketConnected] = useState(false);
  
// // //   // Rating state
// // //   const [rating, setRating] = useState(0);
// // //   const [feedback, setFeedback] = useState('');
// // //   const [submitting, setSubmitting] = useState(false);
// // //   const [hasRatedDriver, setHasRatedDriver] = useState(false);
// // //   const [rideCompleted, setRideCompleted] = useState(false);
  
// // //   // Driver's rating and feedback for this ride
// // //   const [driverRating, setDriverRating] = useState(null);
// // //   const [driverFeedbackText, setDriverFeedbackText] = useState('');
// // //   const [showDriverRating, setShowDriverRating] = useState(false);
  
// // //   // Cancel state
// // //   const [cancelLoading, setCancelLoading] = useState(false);
  
// // //   // Refs
// // //   const animatedDrawer = useRef(new Animated.Value(1)).current;
// // //   const mapRef = useRef(null);
// // //   const socketRef = useRef(null);
// // //   const hasShownRatingModal = useRef(false);
  
// // //   // Animation values
// // //   const mapHeight = animatedDrawer.interpolate({ inputRange: [0, 1], outputRange: [height - SAFE_TOP - COLLAPSED_HEIGHT, height * 0.32] });
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
  
// // //   // Helper functions
// // //   const showCustomAlert = (title, message, type = 'success') => {
// // //     let icon = "check-circle";
// // //     let iconColor = "#10B981";
// // //     if (type === 'error') { icon = "error"; iconColor = "#EF4444"; }
// // //     else if (type === 'warning') { icon = "warning"; iconColor = "#F59E0B"; }
// // //     else if (type === 'info') { icon = "info"; iconColor = Colors.primary; }
// // //     setAlertConfig({ title, message, icon, iconColor, buttons: [{ text: 'OK', onPress: () => setAlertVisible(false) }] });
// // //     setAlertVisible(true);
// // //   };
  
// // //   const getProfilePhotoUrl = () => {
// // //     const rawUrl = driverProfile?.profile_picture || currentRide?.profilePicture || currentRide?.driverProfilePicture;
// // //     if (!rawUrl) return null;
// // //     return buildImageUrl(rawUrl);
// // //   };
  
// // //   // Get driver phone number for chat
// // //   const getDriverPhoneNumber = () => {
// // //     return currentRide?.phoneNumber || currentRide?.driver_phone;
// // //   };
  
// // //   // Handle chat with driver
// // //   const handleChatWithDriver = async () => {
// // //     const driverPhone = getDriverPhoneNumber();
// // //     const driverName = driverProfile?.full_name || currentRide?.driverName || 'Driver';
    
// // //     if (!driverPhone) {
// // //       showCustomAlert('Error', 'Driver contact information not available', 'error');
// // //       return;
// // //     }
    
// // //     try {
// // //       const result = await ChatService.getOrCreateConversation(
// // //         user?.phone_number,
// // //         driverPhone,
// // //         currentRide?.id
// // //       );
      
// // //       if (result.success && result.conversationId) {
// // //         navigation.navigate('ChatScreen', {
// // //           conversationId: result.conversationId,
// // //           user: {
// // //             name: driverName,
// // //             phone_number: driverPhone,
// // //             profile_picture: getProfilePhotoUrl(),
// // //           },
// // //           rideId: currentRide?.id,
// // //         });
// // //       } else {
// // //         showCustomAlert('Error', 'Could not start chat. Please try again.', 'error');
// // //       }
// // //     } catch (error) {
// // //       console.error('Chat error:', error);
// // //       showCustomAlert('Error', 'Could not start chat', 'error');
// // //     }
// // //   };
  
// // //   // Get ride status for passenger view
// // //   const getPassengerRideStatusInfo = useCallback(() => {
// // //     const ride = currentRide;
    
// // //     // Ride completed
// // //     if (ride?.status === "completed" || rideCompleted) {
// // //       return { text: "Completed", color: "#6B7280", icon: "checkmark-done", type: "completed" };
// // //     }
    
// // //     // Ride cancelled
// // //     if (ride?.cancellation_reason) {
// // //       if (ride.cancellation_reason.includes("Auto-cancelled")) {
// // //         return { text: "Auto-cancelled", color: "#DC2626", icon: "alert-circle", type: "auto-cancelled" };
// // //       }
// // //       return { text: "Cancelled", color: "#DC2626", icon: "close-circle", type: "cancelled" };
// // //     }
    
// // //     // Ride ongoing (driver has started)
// // //     if (ride?.started_at && ride.status !== "completed") {
// // //       return { text: "Ongoing", color: "#10B981", icon: "car-sport", type: "ongoing" };
// // //     }
    
// // //     const now = new Date();
// // //     const departureTime = new Date(ride?.departure_time);
// // //     const minutesToDeparture = (departureTime - now) / (1000 * 60);
// // //     const minutesSinceDeparture = (now - departureTime) / (1000 * 60);
    
// // //     // Driver is late (departure time passed but ride not started)
// // //     if (minutesSinceDeparture > 0 && minutesSinceDeparture <= 30 && !ride?.started_at) {
// // //       return { text: "Driver is late - Starting soon", color: "#EF4444", icon: "alert-circle", type: "driver-late" };
// // //     }
    
// // //     // Start soon (within 15 minutes before departure)
// // //     if (minutesToDeparture <= 15 && minutesToDeparture > 0 && !ride?.started_at) {
// // //       return { text: "Starting Soon", color: "#F59E0B", icon: "time-outline", type: "start-soon" };
// // //     }
    
// // //     // Upcoming
// // //     if (minutesToDeparture > 15) {
// // //       if (userBooking?.status === "accepted") {
// // //         return { text: "Upcoming", color: "#2457A6", icon: "calendar-outline", type: "upcoming" };
// // //       }
// // //     }
    
// // //     // Default based on booking status
// // //     if (userBooking?.status === "accepted") {
// // //       return { text: "Accepted", color: "#10B981", icon: "checkmark-circle", type: "accepted" };
// // //     }
// // //     if (userBooking?.status === "pending") {
// // //       return { text: "Pending", color: "#F59E0B", icon: "time", type: "pending" };
// // //     }
// // //     if (userBooking?.status === "rejected") {
// // //       return { text: "Rejected", color: "#DC2626", icon: "close-circle", type: "rejected" };
// // //     }
    
// // //     return { text: ride?.status || "Unknown", color: Colors.gray, icon: "ellipse", type: "unknown" };
// // //   }, [currentRide, rideCompleted, userBooking?.status]);
  
// // //   const fetchDriverRatingForRide = useCallback(async () => {
// // //     if (!userBooking?.id) return;
    
// // //     const bookingId = Number(userBooking.id);
// // //     if (isNaN(bookingId)) {
// // //       console.log('Invalid booking ID for fetching rating');
// // //       return;
// // //     }
    
// // //     try {
// // //       console.log('Fetching driver rating for booking:', bookingId);
// // //       const response = await fetch(`${API_BASE_URL}/api/v1/ride-feedback/driver/${bookingId}?_t=${Date.now()}`);
// // //       const data = await response.json();
      
// // //       console.log('Driver rating response:', data);
      
// // //       if (data.success && data.feedback) {
// // //         setDriverRating(data.feedback.rating);
// // //         setDriverFeedbackText(data.feedback.comment || '');
// // //         setShowDriverRating(true);
// // //       } else {
// // //         setShowDriverRating(false);
// // //       }
// // //     } catch (error) {
// // //       console.log('Error fetching driver rating:', error);
// // //       setShowDriverRating(false);
// // //     }
// // //   }, [userBooking?.id]);

// // //   const handleRateDriver = async () => {
// // //     if (rating === 0) {
// // //       showCustomAlert('Rating Required', 'Please select a rating.', 'warning');
// // //       return;
// // //     }
    
// // //     if (!userBooking?.id) {
// // //       showCustomAlert('Error', 'Booking information not found.', 'error');
// // //       return;
// // //     }
    
// // //     setSubmitting(true);
// // //     try {
// // //       const bookingId = Number(userBooking.id);
      
// // //       if (isNaN(bookingId)) {
// // //         console.error('Invalid booking ID:', userBooking.id);
// // //         showCustomAlert('Error', 'Invalid booking ID. Please try again.', 'error');
// // //         setSubmitting(false);
// // //         return;
// // //       }
      
// // //       const requestBody = {
// // //         ride_booking_id: bookingId,
// // //         rating: Number(rating),
// // //         comment: feedback || '',
// // //       };
      
// // //       console.log('Submitting rating:', requestBody);
      
// // //       const response = await fetch(`${API_BASE_URL}/api/v1/ride-feedback`, {
// // //         method: 'POST',
// // //         headers: { 
// // //           'Content-Type': 'application/json',
// // //           'Accept': 'application/json',
// // //           'X-Phone-Number': user?.phone_number,
// // //         },
// // //         body: JSON.stringify(requestBody),
// // //       });
      
// // //       const data = await response.json();
      
// // //       if (response.ok && data.success) {
// // //         showCustomAlert('Thank You!', 'Your rating has been submitted successfully!', 'success');
// // //         setHasRatedDriver(true);
// // //         setRatingModalVisible(false);
// // //         setRating(0);
// // //         setFeedback('');
        
// // //         setTimeout(() => {
// // //           fetchDriverRatingForRide();
// // //           checkSessionStatus();
// // //         }, 500);
// // //       } else {
// // //         let errorMessage = 'Failed to submit rating.';
// // //         if (data.detail) {
// // //           if (typeof data.detail === 'string') {
// // //             errorMessage = data.detail;
// // //           } else if (Array.isArray(data.detail)) {
// // //             errorMessage = data.detail.map(err => err.msg || err.message).join(', ');
// // //           }
// // //         } else if (data.message) {
// // //           errorMessage = data.message;
// // //         }
// // //         showCustomAlert('Error', errorMessage, 'error');
// // //       }
// // //     } catch (error) {
// // //       console.error('Rating error:', error);
// // //       showCustomAlert('Error', 'Network error. Please check your connection.', 'error');
// // //     } finally {
// // //       setSubmitting(false);
// // //     }
// // //   };
  
// // //   const getCorrectRideId = useCallback(async () => {
// // //     if (!userBooking?.id) return null;
    
// // //     try {
// // //       const response = await fetch(`${API_BASE_URL}/api/v1/bookings/${userBooking.id}/ride?_t=${Date.now()}`);
// // //       const data = await response.json();
      
// // //       if (data.success && data.ride) {
// // //         console.log('Got correct ride ID from booking API:', data.ride.id);
// // //         return data.ride.id;
// // //       }
// // //       return null;
// // //     } catch (error) {
// // //       console.log('Error fetching ride from booking:', error);
// // //       return null;
// // //     }
// // //   }, [userBooking?.id]);

// // //   const fetchModificationRequests = useCallback(async () => {
// // //     if (!userBooking?.id) return;
    
// // //     try {
// // //       const response = await fetch(`${API_BASE_URL}/booking/${userBooking.id}/modification-request?_t=${Date.now()}`);
// // //       const data = await response.json();
      
// // //       console.log('Modification request response:', data);
      
// // //       if (data.has_pending && data.request) {
// // //         setPendingModificationRequest(data.request);
// // //         setSeatModificationRequested(true);
// // //         setPendingSeatsRequest(data.request.requested_seats);
// // //         setPendingRequestDetails(data.request);
// // //       } else {
// // //         setPendingModificationRequest(null);
// // //         setSeatModificationRequested(false);
// // //         setPendingSeatsRequest(null);
// // //         setPendingRequestDetails(null);
// // //       }
// // //     } catch (error) {
// // //       console.log('Error fetching modification request:', error);
// // //     }
// // //   }, [userBooking?.id]);
  
// // //   const handleCancelModificationRequest = async () => {
// // //     if (!userBooking?.id) return;
    
// // //     setModifyingSeats(true);
// // //     try {
// // //       const response = await fetch(`${API_BASE_URL}/api/v1/modifications/booking/${userBooking.id}/cancel`, {
// // //         method: 'DELETE',
// // //         headers: { 'Content-Type': 'application/json' },
// // //       });
// // //       const data = await response.json();
      
// // //       if (!response.ok) throw new Error(data.detail || data.message || 'Failed to cancel modification request');
      
// // //       showCustomAlert('Request Cancelled', 'Your seat modification request has been cancelled.', 'success');
// // //       setSeatModificationRequested(false);
// // //       setPendingSeatsRequest(null);
// // //       setPendingRequestDetails(null);
// // //       setPendingModificationRequest(null);
// // //       await fetchModificationRequests();
// // //     } catch (error) {
// // //       console.error('Cancel modification error:', error);
// // //       showCustomAlert('Error', error.message || 'Failed to cancel modification request', 'error');
// // //     } finally {
// // //       setModifyingSeats(false);
// // //     }
// // //   };

// // //   const fetchSeatAvailability = useCallback(async () => {
// // //     let rideId = currentRide?.id;
    
// // //     if (!rideId || rideId === 3 || rideId === 0) {
// // //       const correctId = await getCorrectRideId();
// // //       if (correctId) {
// // //         rideId = correctId;
// // //         setCurrentRide(prev => ({ ...prev, id: correctId }));
// // //       } else {
// // //         console.log('Could not get valid ride ID');
// // //         return;
// // //       }
// // //     }
    
// // //     console.log('Fetching passengers for ride ID:', rideId);
    
// // //     try {
// // //       const url = `${API_BASE_URL.replace(/\/$/, '')}/ride/${rideId}/passengers?_t=${Date.now()}`;
// // //       const response = await fetch(url);
      
// // //       if (response.ok) {
// // //         const data = await response.json();
        
// // //         const totalSeats = data.available_seats || currentRide?.available_seats || 4;
// // //         setTotalSeatsOffered(totalSeats);
        
// // //         const totalBooked = data.total_booked_seats || 0;
// // //         setTotalBookedSeats(totalBooked);
// // //         setAvailableSeats(Math.max(0, totalSeats - totalBooked));
        
// // //         if (data.passengers && Array.isArray(data.passengers) && user?.phone_number) {
// // //           const normalizePhone = (phone) => {
// // //             if (!phone) return '';
// // //             let cleaned = phone.replace(/\s/g, '').replace(/-/g, '');
// // //             if (cleaned.startsWith('+91')) return cleaned;
// // //             if (cleaned.startsWith('91') && cleaned.length === 12) return `+${cleaned}`;
// // //             if (cleaned.startsWith('+')) return cleaned;
// // //             return `+91${cleaned}`;
// // //           };
          
// // //           const currentUserPhone = normalizePhone(user.phone_number);
// // //           const acceptedPassengers = data.passengers.filter(p => p.status === 'accepted');
// // //           const otherAccepted = acceptedPassengers.filter(p => {
// // //             const passengerPhone = normalizePhone(p.passenger_phone);
// // //             return passengerPhone !== currentUserPhone;
// // //           });
          
// // //           setOtherRiders(otherAccepted);
// // //         } else {
// // //           setOtherRiders([]);
// // //         }
// // //       } else if (response.status === 404) {
// // //         console.log('Ride not found - this might be normal if no passengers yet');
// // //         setOtherRiders([]);
// // //         setTotalSeatsOffered(currentRide?.available_seats || 4);
// // //         setTotalBookedSeats(0);
// // //         setAvailableSeats(currentRide?.available_seats || 4);
// // //       }
// // //     } catch (error) {
// // //       console.log('Error fetching seat availability:', error);
// // //     }
// // //   }, [currentRide?.id, currentRide?.available_seats, user?.phone_number, getCorrectRideId]);

// // //   const loadDriverData = useCallback(async () => {
// // //     let rideId = currentRide?.id;
// // //     if (!rideId || rideId === 3 || rideId === 0) {
// // //       const correctId = await getCorrectRideId();
// // //       if (correctId) {
// // //         rideId = correctId;
// // //         setCurrentRide(prev => ({ ...prev, id: correctId }));
// // //       }
// // //     }
    
// // //     let driverPhone = currentRide?.phoneNumber || currentRide?.driver_phone;
// // //     let driverUserId = currentRide?.driverUserId || currentRide?.driver_user_id;
    
// // //     if ((!driverPhone && !driverUserId) && userBooking?.id) {
// // //       try {
// // //         const response = await fetch(`${API_BASE_URL}/api/v1/bookings/${userBooking.id}/ride?_t=${Date.now()}`);
// // //         const data = await response.json();
// // //         if (data.success && data.ride) {
// // //           driverPhone = data.ride.driver_phone;
// // //           driverUserId = data.ride.driver_user_id;
// // //           setCurrentRide(prev => ({ ...prev, 
// // //             phoneNumber: driverPhone, 
// // //             driver_phone: driverPhone,
// // //             driverUserId: driverUserId,
// // //             driverName: data.ride.driver_name,
// // //             from: data.ride.origin,
// // //             to: data.ride.destination,
// // //             departure_time: data.ride.departure_time,
// // //             price: data.ride.price_per_seat,
// // //             available_seats: data.ride.available_seats,
// // //             routeCoordinates: data.ride.route_coordinates,
// // //           }));
// // //         }
// // //       } catch (error) {
// // //         console.log('Error fetching ride details:', error);
// // //       }
// // //     }
    
// // //     if (!driverPhone && !driverUserId) {
// // //       console.log('No driver contact info available');
// // //       return;
// // //     }
    
// // //     setLoadingProfile(true);
// // //     try {
// // //       const params = new URLSearchParams();
// // //       if (driverUserId) params.append('user_id', driverUserId);
// // //       else if (driverPhone) params.append('phone_number', driverPhone);
// // //       params.append('_t', Date.now());
      
// // //       const profileRes = await fetch(`${API_BASE_URL}/api/v1/users/profile-public?${params.toString()}`);
// // //       const profileData = await profileRes.json();
      
// // //       if (profileData?.success && profileData.user) {
// // //         setDriverProfile(profileData.user);
// // //       }
      
// // //       if (driverPhone) {
// // //         const docsRes = await fetch(`${API_BASE_URL}/api/v1/documents/user/${driverPhone}`);
// // //         const docsData = await docsRes.json();
// // //         if (docsData?.success && docsData.documents) {
// // //           const verifiedDocs = docsData.documents.filter(doc => {
// // //             const status = doc.status?.toUpperCase();
// // //             return status === 'APPROVED' && ['aadhar', 'dl', 'rc'].includes(doc.document_type?.toLowerCase());
// // //           });
// // //           setIsVerified(verifiedDocs.length > 0);
// // //         }
// // //       }
// // //     } catch (error) {
// // //       console.log('Error loading driver data:', error);
// // //     } finally {
// // //       setLoadingProfile(false);
// // //     }
// // //   }, [currentRide, userBooking?.id, getCorrectRideId]);

// // //   // Check live session
// // //   const checkLiveSession = useCallback(async () => {
// // //     const rideId = currentRide?.id;
// // //     if (!rideId) return;
    
// // //     try {
// // //       const response = await fetch(`${API_BASE_URL}/ride/${rideId}/live-session`);
// // //       const data = await response.json();
// // //       if (data.success && data.session) {
// // //         setLiveSession(data.session);
        
// // //         // Setup socket connection for live tracking if ride is ongoing
// // //         if (data.session.status === 'active' && currentRide?.started_at) {
// // //           setupSocketConnection(data.session.session_id);
// // //         }
// // //       }
// // //     } catch (error) {
// // //       console.log('Error checking live session:', error);
// // //     }
// // //   }, [currentRide?.id, currentRide?.started_at]);
  
// // //   // Setup socket for live driver tracking
// // //   const setupSocketConnection = useCallback((sessionId) => {
// // //     if (socketRef.current) {
// // //       socketRef.current.disconnect();
// // //     }
    
// // //     const socket = io(API_BASE_URL, {
// // //       transports: ['websocket'],
// // //       reconnection: true,
// // //     });
    
// // //     socketRef.current = socket;
    
// // //     socket.on('connect', () => {
// // //       console.log('Socket connected for live tracking');
// // //       socket.emit('join-session', sessionId);
// // //       setSocketConnected(true);
// // //     });
    
// // //     socket.on('driver-location-update', (data) => {
// // //       if (data.latitude && data.longitude) {
// // //         setDriverLocation({
// // //           latitude: data.latitude,
// // //           longitude: data.longitude,
// // //         });
// // //       }
// // //     });
    
// // //     socket.on('ride-started', (data) => {
// // //       console.log('Ride started event:', data);
// // //       setCurrentRide(prev => ({ ...prev, started_at: new Date().toISOString() }));
// // //       showCustomAlert('Ride Started', 'The driver has started the ride!', 'success');
// // //     });
    
// // //     socket.on('ride-completed', (data) => {
// // //       console.log('Ride completed event:', data);
// // //       setRideCompleted(true);
// // //       setCurrentRide(prev => ({ ...prev, status: 'completed' }));
// // //       showCustomAlert('Ride Completed', 'Thank you for riding with us! Please rate your experience.', 'success');
// // //     });
    
// // //     return () => {
// // //       if (socketRef.current) {
// // //         socketRef.current.disconnect();
// // //         socketRef.current = null;
// // //       }
// // //     };
// // //   }, []);
  
// // //   const checkSessionStatus = useCallback(async () => {
// // //     const bookingId = userBooking?.id;
// // //     if (!bookingId) return;
    
// // //     try {
// // //       const res = await fetch(`${API_BASE_URL}/ride-sessions/rider/session-status/${bookingId}?rider_phone=${user?.phone_number}&_t=${Date.now()}`);
// // //       const data = await res.json();
      
// // //       console.log('Session Status Response:', data);
      
// // //       if (data.success && data.ride_completed) {
// // //         setRideCompleted(true);
// // //         setHasRatedDriver(data.has_rated_driver);
        
// // //         if (data.has_rated_driver === false && !hasShownRatingModal.current) {
// // //           hasShownRatingModal.current = true;
// // //           setTimeout(() => setRatingModalVisible(true), 1000);
// // //         }
// // //       }
      
// // //       // Update driver location if available
// // //       if (data.driver_location_lat && data.driver_location_lng) {
// // //         setDriverLocation({
// // //           latitude: data.driver_location_lat,
// // //           longitude: data.driver_location_lng,
// // //         });
// // //       }
// // //     } catch (error) {
// // //       console.log('Error checking session status:', error);
// // //     }
// // //   }, [userBooking?.id, user?.phone_number]);
  
// // //   // Get driver's pickup and dropoff points
// // //   const driverPickup = useMemo(() => {
// // //     if (currentRide?.suggestedPickup || currentRide?.suggested_pickup_point) {
// // //       return parseSuggestedPoint(currentRide.suggestedPickup || currentRide.suggested_pickup_point);
// // //     }
// // //     if (currentRide?.pickup_lat && currentRide?.pickup_lng) {
// // //       return { latitude: currentRide.pickup_lat, longitude: currentRide.pickup_lng };
// // //     }
// // //     return null;
// // //   }, [currentRide]);
  
// // //   const driverDropoff = useMemo(() => {
// // //     if (currentRide?.suggestedDrop || currentRide?.suggested_drop_point) {
// // //       return parseSuggestedPoint(currentRide.suggestedDrop || currentRide.suggested_drop_point);
// // //     }
// // //     if (currentRide?.dropoff_lat && currentRide?.dropoff_lng) {
// // //       return { latitude: currentRide.dropoff_lat, longitude: currentRide.dropoff_lng };
// // //     }
// // //     return null;
// // //   }, [currentRide]);
  
// // //   const canModifySeats = useCallback(() => {
// // //     if (!userBooking) return false;
// // //     const statusInfo = getPassengerRideStatusInfo();
// // //     if (rideCompleted) return false;
// // //     if (currentRide?.cancellation_reason || currentRide?.started_at) return false;
// // //     if (userBooking.status !== "accepted") return false;
// // //     if (['expired', 'auto-cancelled', 'driver-late', 'start-soon', 'ongoing'].includes(statusInfo.type)) return false;
// // //     if (seatModificationRequested) return false;
// // //     return true;
// // //   }, [userBooking, getPassengerRideStatusInfo, currentRide, seatModificationRequested, rideCompleted]);
  
// // //   const canCancelBooking = useCallback(() => {
// // //     if (!userBooking) return false;
// // //     const statusInfo = getPassengerRideStatusInfo();
// // //     if (rideCompleted) return false;
// // //     if (currentRide?.cancellation_reason || currentRide?.started_at || currentRide?.status === 'completed') return false;
// // //     if (['expired', 'auto-cancelled', 'ongoing'].includes(statusInfo.type)) return false;
// // //     if (!["accepted", "pending"].includes(userBooking.status)) return false;
// // //     return true;
// // //   }, [userBooking, getPassengerRideStatusInfo, currentRide, rideCompleted]);
  
// // //   // Actions
// // //   const handleModifySeats = async () => {
// // //     if (!userBooking || !canModifySeats()) {
// // //       showCustomAlert('Cannot Modify', 'Modifications are not available at this time.', 'warning');
// // //       return;
// // //     }
    
// // //     const currentSeatsBooked = userBooking.seats_requested || 0;
// // //     const otherBookedSeats = Math.max(0, totalBookedSeats - currentSeatsBooked);
// // //     const maxSeatsUserCanRequest = totalSeatsOffered - otherBookedSeats;
    
// // //     if (maxSeatsUserCanRequest <= 0) {
// // //       showCustomAlert('No Seats Available', 'No additional seats are available.', 'warning');
// // //       return;
// // //     }
// // //     if (seatsRequested > maxSeatsUserCanRequest) {
// // //       showCustomAlert('Not Enough Seats', `Only ${maxSeatsUserCanRequest} seat(s) available.`, 'warning');
// // //       return;
// // //     }
// // //     if (seatsRequested < 1) {
// // //       showCustomAlert('Invalid Seats', 'Minimum 1 seat required.', 'warning');
// // //       return;
// // //     }
// // //     if (seatsRequested === currentSeatsBooked) {
// // //       showCustomAlert('No Change', 'Seat count is already set to this value.', 'info');
// // //       return;
// // //     }
    
// // //     setModifyingSeats(true);
// // //     try {
// // //       const response = await fetch(`${API_BASE_URL}/api/v1/modifications/request/${userBooking.id}`, {
// // //         method: 'POST',
// // //         headers: { 'Content-Type': 'application/json' },
// // //         body: JSON.stringify({ requested_seats: seatsRequested }),
// // //       });
// // //       const data = await response.json();
// // //       if (!response.ok) throw new Error(data.detail || data.message);
      
// // //       showCustomAlert('Request Sent', `Request to change to ${seatsRequested} seat(s) sent.`, 'info');
// // //       setSeatModificationRequested(true);
// // //       setPendingSeatsRequest(seatsRequested);
// // //       await fetchModificationRequests();
// // //     } catch (error) {
// // //       showCustomAlert('Error', error.message, 'error');
// // //     } finally {
// // //       setModifyingSeats(false);
// // //     }
// // //   };
  
// // //   const handleCancelBooking = async () => {
// // //     if (!userBooking || !canCancelBooking()) return;
    
// // //     setModifyingSeats(true);
// // //     setCancelLoading(true);
// // //     try {
// // //       const response = await fetch(`${API_BASE_URL}/booking/${userBooking.id}/cancel`, {
// // //         method: 'PUT',
// // //         headers: { 'Content-Type': 'application/json' },
// // //       });
// // //       const data = await response.json();
// // //       if (!response.ok) throw new Error(data.detail || data.message);
      
// // //       showCustomAlert('Success', 'Booking cancelled successfully', 'success');
// // //       setTimeout(() => navigation.goBack(), 1500);
// // //     } catch (error) {
// // //       showCustomAlert('Error', error.message, 'error');
// // //     } finally {
// // //       setModifyingSeats(false);
// // //       setCancelLoading(false);
// // //       setShowCancelModal(false);
// // //     }
// // //   };
  
// // //   const viewDriverProfile = () => {
// // //     const driverPhone = currentRide?.phoneNumber || currentRide?.driver_phone;
// // //     const driverUserId = currentRide?.driverUserId || currentRide?.driver_user_id;
// // //     if (driverPhone || driverUserId) {
// // //       navigation.navigate('ViewProfileScreen', {
// // //         userId: driverUserId || null,
// // //         phoneNumber: driverPhone || null,
// // //         driverName: driverProfile?.full_name || currentRide?.driverName || 'Driver',
// // //         profilePicture: getProfilePhotoUrl(),
// // //       });
// // //     }
// // //   };
  
// // //   const shareRideDetails = async () => {
// // //     const message = `🚗 *Ride Details* 🚗\n\n` +
// // //       `From: ${currentRide?.from || currentRide?.origin || 'Pickup'}\n` +
// // //       `To: ${currentRide?.to || currentRide?.destination || 'Drop'}\n` +
// // //       `Date: ${formatDate(currentRide?.departure_time)}\n` +
// // //       `Price: ₹${currentRide?.price || currentRide?.price_per_seat || 0}/seat\n` +
// // //       `Seats: ${userBooking?.seats_requested || 1}\n` +
// // //       `Total: ₹${(currentRide?.price || currentRide?.price_per_seat || 0) * (userBooking?.seats_requested || 1)}\n\n` +
// // //       `Driver: ${driverProfile?.full_name || currentRide?.driverName || 'Driver'}`;
    
// // //     await Share.share({ message, title: 'Ride Details' });
// // //   };
  
// // //   const handleProfileImagePress = () => {
// // //     const photoUrl = getProfilePhotoUrl();
// // //     if (photoUrl) {
// // //       setSelectedProfile({ visible: true, imageUrl: photoUrl, driverName: driverProfile?.full_name || currentRide?.driverName || 'Driver' });
// // //     } else {
// // //       showCustomAlert('No Photo', 'Driver has not uploaded a profile picture', 'warning');
// // //     }
// // //   };
  
// // //   const onRefresh = () => {
// // //     setRefreshing(true);
// // //     Promise.all([
// // //       fetchSeatAvailability(),
// // //       loadDriverData(),
// // //       fetchModificationRequests(),
// // //       fetchDriverRatingForRide(),
// // //       checkLiveSession(),
// // //       checkSessionStatus()
// // //     ]).finally(() => setRefreshing(false));
// // //   };
  
// // //   // Initialize data on component mount
// // //   useEffect(() => {
// // //     const initializeData = async () => {
// // //       if (userBooking?.id) {
// // //         try {
// // //           const response = await fetch(`${API_BASE_URL}/api/v1/bookings/${userBooking.id}/ride?_t=${Date.now()}`);
// // //           const data = await response.json();
          
// // //           if (data.success && data.ride) {
// // //             console.log('Fetched ride details from booking API:', data.ride.id);
            
// // //             setCurrentRide({
// // //               id: data.ride.id,
// // //               available_seats: data.ride.available_seats,
// // //               price: data.ride.price_per_seat,
// // //               from: data.ride.origin,
// // //               to: data.ride.destination,
// // //               departure_time: data.ride.departure_time,
// // //               phoneNumber: data.ride.driver_phone,
// // //               driverName: data.ride.driver_name,
// // //               driverUserId: data.ride.driver_user_id,
// // //               routeCoordinates: data.ride.route_coordinates,
// // //               distance_km: data.ride.distance_km,
// // //               duration_text: data.ride.duration_text,
// // //               status: data.ride.status,
// // //               women_only: data.ride.women_only,
// // //               rating: data.ride.driver_rating || 4.5,
// // //               origin_lat: data.ride.origin_latitude,
// // //               origin_lon: data.ride.origin_longitude,
// // //               suggestedPickup: data.ride.suggested_pickup_point,
// // //               suggestedDrop: data.ride.suggested_drop_point,
// // //               started_at: data.ride.started_at,
// // //               completed_at: data.ride.completed_at,
// // //             });
            
// // //             const totalSeats = data.ride.available_seats || 4;
// // //             setTotalSeatsOffered(totalSeats);
// // //             setTotalBookedSeats(data.ride.total_booked_seats || userBooking.seats_requested || 1);
// // //             setAvailableSeats(totalSeats - (data.ride.total_booked_seats || userBooking.seats_requested || 1));
            
// // //             setUserBooking({
// // //               id: Number(data.booking.id),
// // //               seats_requested: Number(data.booking.seats_requested) || 1,
// // //               status: data.booking.status,
// // //               total_amount: Number(data.booking.total_amount) || null,
// // //               created_at: data.booking.created_at,
// // //             });
            
// // //             await Promise.all([
// // //               fetchSeatAvailability(),
// // //               loadDriverData(),
// // //               fetchModificationRequests(),
// // //               fetchDriverRatingForRide(),
// // //               checkLiveSession(),
// // //               checkSessionStatus()
// // //             ]);
// // //           }
// // //         } catch (error) {
// // //           console.log('Error initializing ride data:', error);
// // //         }
// // //       }
// // //     };
    
// // //     initializeData();
// // //   }, [userBooking?.id]);
  
// // //   useEffect(() => {
// // //     if (currentRide) {
// // //       loadDriverData();
// // //       fetchSeatAvailability();
// // //       checkLiveSession();
// // //       checkSessionStatus();
// // //     }
// // //   }, [currentRide]);
  
// // //   useFocusEffect(
// // //     useCallback(() => {
// // //       if (currentRide) {
// // //         fetchSeatAvailability();
// // //         checkLiveSession();
// // //         checkSessionStatus();
// // //         fetchModificationRequests();
// // //         fetchDriverRatingForRide();
// // //       }
// // //       hasShownRatingModal.current = false;
// // //       return () => {
// // //         if (socketRef.current) {
// // //           socketRef.current.disconnect();
// // //           socketRef.current = null;
// // //         }
// // //       };
// // //     }, [currentRide])
// // //   );
  
// // //   // Memoized values for map
// // //   const profilePhotoUrl = getProfilePhotoUrl();
// // //   const avatarText = getDriverInitials(driverProfile?.full_name || currentRide?.driverName || 'Driver');
// // //   const isProfilePhotoSvg = profilePhotoUrl?.toLowerCase().includes('.svg');
// // //   const allPreferences = useMemo(() => extractAllPreferences(currentRide, driverProfile?.travel_preferences), [currentRide, driverProfile]);
  
// // //   const driverStart = useMemo(() => {
// // //     const coords = currentRide?.routeCoordinates;
// // //     if (Array.isArray(coords) && coords.length > 0) {
// // //       const first = coords[0];
// // //       if (Array.isArray(first) && first.length === 2) return { latitude: first[1], longitude: first[0] };
// // //     }
// // //     return driverPickup || parseSuggestedPoint(currentRide?.suggestedPickup || currentRide?.suggested_pickup_point);
// // //   }, [currentRide, driverPickup]);
  
// // //   const driverEnd = useMemo(() => {
// // //     const coords = currentRide?.routeCoordinates;
// // //     if (Array.isArray(coords) && coords.length > 0) {
// // //       const last = coords[coords.length - 1];
// // //       if (Array.isArray(last) && last.length === 2) return { latitude: last[1], longitude: last[0] };
// // //     }
// // //     return driverDropoff || parseSuggestedPoint(currentRide?.suggestedDrop || currentRide?.suggested_drop_point);
// // //   }, [currentRide, driverDropoff]);
  
// // //   const routePath = useMemo(() => {
// // //     const fullRoute = parseRouteCoordinates(currentRide?.routeCoordinates);
// // //     if (fullRoute.length >= 2) return fullRoute;
// // //     if (driverStart && driverEnd) return [driverStart, driverEnd];
// // //     return [];
// // //   }, [currentRide, driverStart, driverEnd]);
  
// // //   const allMarkerCoords = useMemo(() => {
// // //     const coords = [];
// // //     if (driverStart) coords.push(driverStart);
// // //     if (driverEnd) coords.push(driverEnd);
// // //     if (driverLocation) coords.push(driverLocation);
// // //     return coords;
// // //   }, [driverStart, driverEnd, driverLocation]);
  
// // //   const fitMapToMarkers = useCallback(() => {
// // //     if (mapRef.current && mapReady && allMarkerCoords.length >= 1) {
// // //       setTimeout(() => {
// // //         try {
// // //           if (allMarkerCoords.length === 1) {
// // //             mapRef.current.animateToRegion({
// // //               latitude: allMarkerCoords[0].latitude,
// // //               longitude: allMarkerCoords[0].longitude,
// // //               latitudeDelta: 0.01,
// // //               longitudeDelta: 0.01,
// // //             }, 500);
// // //           } else {
// // //             mapRef.current.fitToCoordinates(allMarkerCoords, {
// // //               edgePadding: { top: 80, right: 50, bottom: 200, left: 50 },
// // //               animated: true,
// // //             });
// // //           }
// // //         } catch (e) { console.log('fitToCoordinates error:', e); }
// // //       }, 500);
// // //     }
// // //   }, [mapReady, allMarkerCoords]);
  
// // //   useEffect(() => {
// // //     if (mapReady && allMarkerCoords.length >= 1) fitMapToMarkers();
// // //   }, [mapReady, allMarkerCoords, fitMapToMarkers]);
  
// // //   const vehicleName = driverProfile?.vehicle?.model || currentRide?.vehicle?.model || 'Vehicle details unavailable';
// // //   const vehicleRegNumber = driverProfile?.vehicle?.registration_number || currentRide?.vehicle?.registration_number;
// // //   const vehicleColor = driverProfile?.vehicle?.color || currentRide?.vehicle?.color || 'Not specified';
  
// // //   const rideStatusInfo = getPassengerRideStatusInfo();
// // //   const modificationsAllowed = canModifySeats();
// // //   const cancellationsAllowed = canCancelBooking();
// // //   const isAutoCancelled = rideStatusInfo.type === 'auto-cancelled';
// // //   const isCompleted = rideStatusInfo.type === 'completed';
  
// // //   const otherBookedSeats = totalBookedSeats - (userBooking?.seats_requested || 0);
// // //   const maxUserCanRequest = totalSeatsOffered - otherBookedSeats;
// // //   const totalAmountPaid = (currentRide?.price || currentRide?.price_per_seat || 0) * (userBooking?.seats_requested || 1);
  
// // //   const initialRegion = {
// // //     latitude: driverLocation?.latitude || driverStart?.latitude || 28.6139,
// // //     longitude: driverLocation?.longitude || driverStart?.longitude || 77.2090,
// // //     latitudeDelta: 0.02,
// // //     longitudeDelta: 0.02,
// // //   };
  
// // //   if (!currentRide) {
// // //     return (
// // //       <View style={styles.loaderContainer}>
// // //         <Text style={{ fontSize: 16, color: Colors.gray, marginBottom: 20 }}>No ride data available</Text>
// // //         <TouchableOpacity onPress={() => navigation.goBack()} style={{ padding: 12, backgroundColor: Colors.primary, borderRadius: 8 }}>
// // //           <Text style={{ color: '#fff' }}>Go Back</Text>
// // //         </TouchableOpacity>
// // //       </View>
// // //     );
// // //   }
  
// // //   // Main render - NO TRACK RIDE BUTTON
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
// // //           showsUserLocation={true}
// // //           showsMyLocationButton={true}
// // //         >
// // //           {/* Route Path */}
// // //           {routePath.length >= 2 && (
// // //             <Polyline 
// // //               coordinates={routePath} 
// // //               strokeColor="#2457A6" 
// // //               strokeWidth={5} 
// // //               lineCap="round" 
// // //               lineJoin="round" 
// // //             />
// // //           )}
          
// // //           {/* Driver Start Marker */}
// // //           {driverStart && (
// // //             <Marker coordinate={driverStart} anchor={{ x: 0.5, y: 1 }}>
// // //               <View style={styles.markerWrapper}>
// // //                 <View style={[styles.pinBubble, { backgroundColor: '#16A34A' }]}>
// // //                   <Text style={styles.pinIcon}>S</Text>
// // //                 </View>
// // //                 <View style={[styles.pinPointer, { borderTopColor: '#16A34A' }]} />
// // //               </View>
// // //             </Marker>
// // //           )}
          
// // //           {/* Driver End Marker */}
// // //           {driverEnd && (
// // //             <Marker coordinate={driverEnd} anchor={{ x: 0.5, y: 1 }}>
// // //               <View style={styles.markerWrapper}>
// // //                 <View style={[styles.pinBubble, { backgroundColor: '#DC2626' }]}>
// // //                   <Text style={styles.pinIcon}>E</Text>
// // //                 </View>
// // //                 <View style={[styles.pinPointer, { borderTopColor: '#DC2626' }]} />
// // //               </View>
// // //             </Marker>
// // //           )}
          
// // //           {/* Driver Live Location Marker - Only show when ongoing */}
// // //           {driverLocation && rideStatusInfo.type === 'ongoing' && (
// // //             <Marker coordinate={driverLocation} anchor={{ x: 0.5, y: 0.5 }}>
// // //               <View style={styles.driverLiveMarker}>
// // //                 <View style={styles.driverLiveDot} />
// // //                 <View style={styles.driverLiveRing} />
// // //               </View>
// // //             </Marker>
// // //           )}
// // //         </MapView>
        
// // //         <TouchableOpacity style={styles.mapBackButton} onPress={() => navigation.goBack()}>
// // //           <Ionicons name="chevron-back" size={26} color={Colors.secondary} />
// // //         </TouchableOpacity>
        
// // //         {/* NO TRACK RIDE BUTTON - Removed as requested */}
// // //       </Animated.View>
      
// // //       <Animated.View style={[styles.drawer, { height: drawerHeight }]}>
// // //         <View style={styles.handleWrap} {...panResponder.panHandlers}>
// // //           <TouchableOpacity activeOpacity={0.9} onPress={toggleDrawer} style={styles.handleHitArea}>
// // //             <View style={styles.handleBar} />
// // //           </TouchableOpacity>
// // //         </View>
        
// // //         {!drawerExpanded ? (
// // //           <View style={styles.collapsedSummary}>
// // //             <View style={styles.collapsedTopRow}>
// // //               <View style={{ flex: 1 }}>
// // //                 <View style={styles.collapsedStatusRow}>
// // //                   <View style={[styles.collapsedStatusBadge, { backgroundColor: rideStatusInfo.color + '20' }]}>
// // //                     <Ionicons name={rideStatusInfo.icon} size={10} color={rideStatusInfo.color} />
// // //                     <Text style={[styles.collapsedStatusText, { color: rideStatusInfo.color }]}>{rideStatusInfo.text}</Text>
// // //                   </View>
// // //                 </View>
// // //                 <Text style={styles.collapsedDriver} numberOfLines={1}>{driverProfile?.full_name || currentRide?.driverName || 'Driver'}</Text>
// // //                 <Text style={styles.collapsedSub} numberOfLines={1}>{currentRide?.from || currentRide?.origin || 'Pickup'} → {currentRide?.to || currentRide?.destination || 'Drop'}</Text>
// // //               </View>
// // //               <View style={styles.collapsedPriceWrap}>
// // //                 <Text style={styles.collapsedPrice}>₹{currentRide?.price || currentRide?.price_per_seat || 0}</Text>
// // //                 <Text style={styles.collapsedPerSeat}>per seat</Text>
// // //               </View>
// // //             </View>
// // //           </View>
// // //         ) : (
// // //           <ScrollView 
// // //             style={styles.drawerScroll} 
// // //             contentContainerStyle={styles.drawerContent}
// // //             refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
// // //             showsVerticalScrollIndicator={false}
// // //           >
// // //             {/* Ride Status Banner */}
// // //             <View style={[styles.statusBanner, { backgroundColor: rideStatusInfo.color + '20' }]}>
// // //               <Ionicons name={rideStatusInfo.icon} size={22} color={rideStatusInfo.color} />
// // //               <View style={styles.statusBannerTextContainer}>
// // //                 <Text style={[styles.statusBannerTitle, { color: rideStatusInfo.color }]}>{rideStatusInfo.text}</Text>
// // //                 {rideStatusInfo.type === 'driver-late' && (
// // //                   <Text style={styles.statusBannerSubtitle}>The driver is running late. The ride should start soon.</Text>
// // //                 )}
// // //                 {rideStatusInfo.type === 'start-soon' && (
// // //                   <Text style={styles.statusBannerSubtitle}>Be ready at your pickup location!</Text>
// // //                 )}
// // //                 {rideStatusInfo.type === 'ongoing' && (
// // //                   <Text style={styles.statusBannerSubtitle}>Your ride is in progress.</Text>
// // //                 )}
// // //                 {rideStatusInfo.type === 'completed' && (
// // //                   <Text style={styles.statusBannerSubtitle}>Thank you for riding with us!</Text>
// // //                 )}
// // //               </View>
// // //             </View>
            
// // //             {/* Driver Card with Chat Button */}
// // //             <View style={styles.driverCard}>
// // //               <View style={styles.driverTopRow}>
// // //                 <View style={styles.driverLeftWrap}>
// // //                   <TouchableOpacity style={styles.driverAvatar} onPress={handleProfileImagePress}>
// // //                     {profilePhotoUrl ? (
// // //                       isProfilePhotoSvg ? (
// // //                         <View style={styles.svgAvatarContainer}><SvgCssUri uri={profilePhotoUrl} width={56} height={56} /></View>
// // //                       ) : (
// // //                         <Image source={{ uri: profilePhotoUrl }} style={styles.avatarImg} />
// // //                       )
// // //                     ) : (
// // //                       <View style={styles.avatarPlaceholder}>
// // //                         <Text style={styles.avatarText}>{avatarText}</Text>
// // //                       </View>
// // //                     )}
// // //                   </TouchableOpacity>
// // //                   <View style={styles.driverMeta}>
// // //                     <View style={styles.driverNameRow}>
// // //                       <Text style={styles.driverName}>{driverProfile?.full_name || currentRide?.driverName || 'Driver'}</Text>
// // //                       {isVerified && <Ionicons name="checkmark-circle" size={14} color="#2457A6" />}
// // //                     </View>
// // //                     <View style={styles.ratingRow}>
// // //                       <Ionicons name="star" size={13} color="#F59E0B" />
// // //                       <Text style={styles.ratingText}>{driverProfile?.avg_rating || currentRide?.rating || 4.5}</Text>
// // //                     </View>
// // //                   </View>
// // //                 </View>
// // //                 {/* Chat Button */}
// // //                 <TouchableOpacity style={styles.chatButton} onPress={handleChatWithDriver}>
// // //                   <Ionicons name="chatbubble-ellipses" size={22} color="#2457A6" />
// // //                 </TouchableOpacity>
// // //               </View>
              
// // //               {/* Action Buttons Row */}
// // //               <View style={styles.actionButtonsRow}>
// // //                 <TouchableOpacity style={styles.profileOutlineBtn} onPress={viewDriverProfile}>
// // //                   <Text style={styles.profileOutlineBtnText}>View Full Profile</Text>
// // //                 </TouchableOpacity>
// // //                 <TouchableOpacity style={styles.shareOutlineBtn} onPress={shareRideDetails}>
// // //                   <Ionicons name="share-outline" size={18} color="#2457A6" />
// // //                   <Text style={styles.shareOutlineBtnText}>Share</Text>
// // //                 </TouchableOpacity>
// // //               </View>
// // //             </View>
            
// // //             {/* Driver's Rating for This Ride */}
// // //             {showDriverRating && driverRating && (
// // //               <View style={styles.driverRatingCard}>
// // //                 <View style={styles.driverRatingHeader}>
// // //                   <Ionicons name="star" size={18} color="#F59E0B" />
// // //                   <Text style={styles.driverRatingTitle}>Driver's Rating for this Ride</Text>
// // //                 </View>
// // //                 <View style={styles.driverRatingContent}>
// // //                   <RatingStars rating={driverRating} size={20} />
// // //                   {driverFeedbackText ? (
// // //                     <Text style={styles.driverFeedbackText}>"{driverFeedbackText}"</Text>
// // //                   ) : (
// // //                     <Text style={styles.driverFeedbackPlaceholder}>No feedback provided</Text>
// // //                   )}
// // //                 </View>
// // //               </View>
// // //             )}
            
// // //             {/* Trip Details Section */}
// // //             <View style={styles.cardSection}>
// // //               <Text style={styles.sectionTitle}>📍 Trip Details</Text>
              
// // //               <View style={styles.tripItem}>
// // //                 <View style={styles.tripIconContainer}>
// // //                   <Ionicons name="location" size={20} color="#16A34A" />
// // //                 </View>
// // //                 <View style={styles.tripDetails}>
// // //                   <Text style={styles.tripLabel}>From</Text>
// // //                   <Text style={styles.tripValue}>{currentRide?.from || currentRide?.origin || 'Pickup location'}</Text>
// // //                 </View>
// // //               </View>
              
// // //               <View style={styles.tripDivider} />
              
// // //               <View style={styles.tripItem}>
// // //                 <View style={styles.tripIconContainer}>
// // //                   <Ionicons name="flag" size={20} color="#DC2626" />
// // //                 </View>
// // //                 <View style={styles.tripDetails}>
// // //                   <Text style={styles.tripLabel}>To</Text>
// // //                   <Text style={styles.tripValue}>{currentRide?.to || currentRide?.destination || 'Drop location'}</Text>
// // //                 </View>
// // //               </View>
              
// // //               <View style={styles.tripMetaRow}>
// // //                 <View style={styles.tripMetaItem}>
// // //                   <Ionicons name="calendar-outline" size={16} color={Colors.gray} />
// // //                   <Text style={styles.tripMetaText}>{formatDate(currentRide?.departure_time)}</Text>
// // //                 </View>
// // //                 {currentRide?.distance_km && (
// // //                   <View style={styles.tripMetaItem}>
// // //                     <Ionicons name="map-outline" size={16} color={Colors.gray} />
// // //                     <Text style={styles.tripMetaText}>{currentRide.distance_km} km</Text>
// // //                   </View>
// // //                 )}
// // //                 {currentRide?.duration_text && (
// // //                   <View style={styles.tripMetaItem}>
// // //                     <Ionicons name="time-outline" size={16} color={Colors.gray} />
// // //                     <Text style={styles.tripMetaText}>{currentRide.duration_text}</Text>
// // //                   </View>
// // //                 )}
// // //               </View>
// // //             </View>
            
// // //             {/* Vehicle Details Section */}
// // //             <View style={styles.cardSection}>
// // //               <Text style={styles.sectionTitle}>🚗 Vehicle Details</Text>
// // //               <View style={styles.vehicleDetailRow}>
// // //                 <Ionicons name="car-sport-outline" size={24} color="#2457A6" />
// // //                 <View style={styles.vehicleDetailInfo}>
// // //                   <Text style={styles.vehicleDetailName}>{vehicleName}</Text>
// // //                   <Text style={styles.vehicleDetailColor}>Color: {vehicleColor}</Text>
// // //                   {vehicleRegNumber && <Text style={styles.vehicleDetailReg}>Registration: {vehicleRegNumber}</Text>}
// // //                   <Text style={styles.vehicleDetailSeats}>Total Seats: {totalSeatsOffered}</Text>
// // //                 </View>
// // //               </View>
// // //             </View>
            
// // //             {/* Seat Availability Section */}
// // //             <View style={styles.cardSection}>
// // //               <Text style={styles.sectionTitle}>💺 Seat Availability</Text>
// // //               <View style={styles.seatStatsRow}>
// // //                 <View style={styles.seatStat}>
// // //                   <Text style={styles.seatStatValue}>{totalSeatsOffered}</Text>
// // //                   <Text style={styles.seatStatLabel}>Total Seats</Text>
// // //                 </View>
// // //                 <View style={styles.seatStat}>
// // //                   <Text style={[styles.seatStatValue, { color: '#10B981' }]}>{totalBookedSeats}</Text>
// // //                   <Text style={styles.seatStatLabel}>Booked</Text>
// // //                 </View>
// // //                 <View style={styles.seatStat}>
// // //                   <Text style={[styles.seatStatValue, { color: '#F59E0B' }]}>{availableSeats}</Text>
// // //                   <Text style={styles.seatStatLabel}>Available</Text>
// // //                 </View>
// // //               </View>
// // //               <View style={styles.seatProgressContainer}>
// // //                 <View style={[styles.seatProgressBar, { width: `${totalSeatsOffered > 0 ? (totalBookedSeats / totalSeatsOffered) * 100 : 0}%` }]} />
// // //               </View>
// // //             </View>
            
// // //             {/* Ride Preferences Section */}
// // //             {allPreferences.length > 0 && (
// // //               <View style={styles.cardSection}>
// // //                 <Text style={styles.sectionTitle}>🎯 Ride Preferences</Text>
// // //                 <View style={styles.tagRow}>
// // //                   {allPreferences.map((pref, index) => (
// // //                     <GenericPreferenceTag key={`${pref}-${index}`} label={pref} />
// // //                   ))}
// // //                 </View>
// // //               </View>
// // //             )}
            
// // //             {/* Booking Details Section */}
// // //             <View style={styles.cardSection}>
// // //               <Text style={styles.sectionTitle}>📋 Your Booking</Text>
              
// // //               {userBooking ? (
// // //                 <>
// // //                   <View style={styles.bookingDetailRow}>
// // //                     <Text style={styles.bookingDetailLabel}>Booking ID</Text>
// // //                     <Text style={styles.bookingDetailValue}>#{userBooking.id}</Text>
// // //                   </View>
// // //                   <View style={styles.bookingDetailRow}>
// // //                     <Text style={styles.bookingDetailLabel}>Seats Booked</Text>
// // //                     <Text style={styles.bookingDetailValue}>{userBooking.seats_requested}</Text>
// // //                   </View>
// // //                   <View style={styles.bookingDetailRow}>
// // //                     <Text style={styles.bookingDetailLabel}>Price per Seat</Text>
// // //                     <Text style={styles.bookingDetailValue}>₹{currentRide?.price || currentRide?.price_per_seat || 0}</Text>
// // //                   </View>
// // //                   <View style={[styles.bookingDetailRow, styles.bookingTotalRow]}>
// // //                     <Text style={styles.bookingTotalLabel}>Total Amount</Text>
// // //                     <Text style={styles.bookingTotalValue}>₹{totalAmountPaid}</Text>
// // //                   </View>
// // //                   <View style={styles.bookingDetailRow}>
// // //                     <Text style={styles.bookingDetailLabel}>Status</Text>
// // //                     <View style={[styles.bookingStatusBadge, { backgroundColor: userBooking.status === 'accepted' ? '#10B98120' : userBooking.status === 'pending' ? '#F59E0B20' : '#EF444420' }]}>
// // //                       <Text style={[styles.bookingStatusText, { color: userBooking.status === 'accepted' ? '#10B981' : userBooking.status === 'pending' ? '#F59E0B' : '#EF4444' }]}>
// // //                         {userBooking.status === 'accepted' ? 'Confirmed' : userBooking.status === 'pending' ? 'Pending' : userBooking.status}
// // //                       </Text>
// // //                     </View>
// // //                   </View>
// // //                 </>
// // //               ) : (
// // //                 <Text style={styles.emptyText}>No booking information available</Text>
// // //               )}
              
// // //               {/* Pending Modification Request Section */}
// // //               {pendingModificationRequest && pendingModificationRequest.status === 'pending' && (
// // //                 <>
// // //                   <View style={styles.divider} />
// // //                   <View style={styles.pendingModificationHeader}>
// // //                     <Ionicons name="time-outline" size={24} color="#F59E0B" />
// // //                     <Text style={styles.pendingModificationTitle}>Pending Modification Request</Text>
// // //                   </View>
                  
// // //                   <View style={styles.pendingModificationDetails}>
// // //                     <View style={styles.modificationDetailRow}>
// // //                       <Text style={styles.modificationDetailLabel}>Current Seats:</Text>
// // //                       <Text style={styles.modificationDetailValue}>{pendingModificationRequest.current_seats || userBooking?.seats_requested}</Text>
// // //                     </View>
// // //                     <View style={styles.modificationDetailRow}>
// // //                       <Text style={styles.modificationDetailLabel}>Requested Seats:</Text>
// // //                       <Text style={[styles.modificationDetailValue, { color: '#F59E0B', fontWeight: '800' }]}>
// // //                         {pendingModificationRequest.requested_seats || pendingSeatsRequest}
// // //                       </Text>
// // //                     </View>
// // //                     <View style={styles.modificationDetailRow}>
// // //                       <Text style={styles.modificationDetailLabel}>Status:</Text>
// // //                       <View style={[styles.pendingBadge, { backgroundColor: '#FEF3C7' }]}>
// // //                         <Text style={[styles.pendingBadgeText, { color: '#D97706' }]}>Waiting for Driver Approval</Text>
// // //                       </View>
// // //                     </View>
// // //                     {pendingModificationRequest.created_at && (
// // //                       <Text style={styles.modificationDate}>
// // //                         Requested on: {new Date(pendingModificationRequest.created_at).toLocaleString()}
// // //                       </Text>
// // //                     )}
// // //                   </View>
                  
// // //                   <TouchableOpacity 
// // //                     style={styles.cancelModificationBtn}
// // //                     onPress={handleCancelModificationRequest}
// // //                     disabled={modifyingSeats}
// // //                   >
// // //                     <Text style={styles.cancelModificationBtnText}>
// // //                       {modifyingSeats ? 'Cancelling...' : 'Cancel Request'}
// // //                     </Text>
// // //                   </TouchableOpacity>
// // //                 </>
// // //               )}
              
// // //               {/* Modify Seats Section */}
// // //               {modificationsAllowed && userBooking?.status === "accepted" && !isAutoCancelled && totalSeatsOffered > 0 && !seatModificationRequested && rideStatusInfo.type !== 'ongoing' && rideStatusInfo.type !== 'completed' && (
// // //                 <>
// // //                   <View style={styles.divider} />
// // //                   <Text style={styles.sectionSubtitle}>Modify Seats</Text>
                  
// // //                   {otherBookedSeats > 0 && (
// // //                     <View style={styles.otherBookedInfo}>
// // //                       <Ionicons name="information-circle" size={14} color="#F59E0B" />
// // //                       <Text style={styles.otherBookedInfoText}>{otherBookedSeats} seat(s) booked by others</Text>
// // //                     </View>
// // //                   )}
                  
// // //                   <View style={styles.seatSelectorRow}>
// // //                     <TouchableOpacity style={[styles.seatActionBtn, seatsRequested === 1 && styles.seatActionBtnDisabled]} onPress={() => setSeatsRequested(Math.max(1, seatsRequested - 1))} disabled={seatsRequested === 1 || modifyingSeats}>
// // //                       <Ionicons name="remove" size={20} color={seatsRequested === 1 ? Colors.gray : Colors.dark} />
// // //                     </TouchableOpacity>
// // //                     <View style={styles.seatCountWrap}>
// // //                       <Text style={styles.seatCountText}>{seatsRequested}</Text>
// // //                       <Text style={styles.seatAvailableText}>/ {maxUserCanRequest} max</Text>
// // //                     </View>
// // //                     <TouchableOpacity style={[styles.seatActionBtn, seatsRequested >= maxUserCanRequest && styles.seatActionBtnDisabled]} onPress={() => setSeatsRequested(Math.min(maxUserCanRequest, seatsRequested + 1))} disabled={seatsRequested >= maxUserCanRequest || modifyingSeats}>
// // //                       <Ionicons name="add" size={20} color={seatsRequested >= maxUserCanRequest ? Colors.gray : "#2457A6"} />
// // //                     </TouchableOpacity>
// // //                   </View>
                  
// // //                   <TouchableOpacity style={[styles.updateSeatsBtn, (modifyingSeats || seatsRequested === userBooking?.seats_requested) && styles.updateSeatsBtnDisabled]} onPress={handleModifySeats} disabled={modifyingSeats || seatsRequested === userBooking?.seats_requested}>
// // //                     <Text style={styles.updateSeatsBtnText}>{modifyingSeats ? 'Sending...' : 'Request Seat Change'}</Text>
// // //                   </TouchableOpacity>
// // //                 </>
// // //               )}
              
// // //               {/* Cancel Booking Button */}
// // //               {cancellationsAllowed && userBooking?.status !== "rejected" && !isAutoCancelled && rideStatusInfo.type !== 'ongoing' && rideStatusInfo.type !== 'completed' && (
// // //                 <TouchableOpacity style={[styles.cancelBookingBtn, (modifyingSeats || cancelLoading) && styles.cancelBookingBtnDisabled]} onPress={() => setShowCancelModal(true)} disabled={modifyingSeats || cancelLoading}>
// // //                   <Text style={styles.cancelBookingBtnText}>{userBooking?.status === "pending" ? "Cancel Request" : "Cancel Booking"}</Text>
// // //                 </TouchableOpacity>
// // //               )}
// // //             </View>
            
// // //             {/* Other Riders Section */}
// // //             <View style={styles.cardSection}>
// // //               <Text style={styles.sectionTitle}>👥 Other Riders ({otherRiders.length})</Text>
// // //               {otherRiders.length === 0 ? (
// // //                 <View style={styles.noRidersContainer}>
// // //                   <Ionicons name="people-outline" size={40} color={Colors.gray} />
// // //                   <Text style={styles.noRidersText}>No other riders yet</Text>
// // //                 </View>
// // //               ) : (
// // //                 otherRiders.map((rider, index) => (
// // //                   <View key={rider.booking_id || index} style={styles.otherRiderItem}>
// // //                     <View style={styles.otherRiderAvatar}>
// // //                       {rider.profile_picture ? (
// // //                         <Image source={{ uri: buildImageUrl(rider.profile_picture) }} style={styles.otherRiderAvatarImg} />
// // //                       ) : (
// // //                         <View style={styles.otherRiderAvatarPlaceholder}>
// // //                           <Text style={styles.otherRiderAvatarText}>{getDriverInitials(rider.passenger_name)}</Text>
// // //                         </View>
// // //                       )}
// // //                     </View>
// // //                     <View style={styles.otherRiderInfo}>
// // //                       <Text style={styles.otherRiderName}>{rider.passenger_name || 'Rider'}</Text>
// // //                       <Text style={styles.otherRiderSeats}>{rider.seats_booked || 1} seat(s)</Text>
// // //                     </View>
// // //                   </View>
// // //                 ))
// // //               )}
// // //             </View>
            
// // //             {/* Safety Card */}
// // //             <View style={styles.safetyCard}>
// // //               <Ionicons name="shield-checkmark-outline" size={18} color="#2457A6" />
// // //               <View>
// // //                 <Text style={styles.safetyTitle}>Safety First</Text>
// // //                 <Text style={styles.safetySub}>Live GPS tracking & 24/7 support available</Text>
// // //               </View>
// // //             </View>
            
// // //             <View style={{ height: 40 }} />
// // //           </ScrollView>
// // //         )}
// // //       </Animated.View>
      
// // //       {/* Cancel Modal */}
// // //       <Modal visible={showCancelModal} transparent animationType="fade" onRequestClose={() => setShowCancelModal(false)}>
// // //         <View style={styles.modalBackdrop}>
// // //           <View style={styles.confirmModalContent}>
// // //             <Ionicons name="alert-circle" size={40} color="#F59E0B" />
// // //             <Text style={styles.confirmModalTitle}>{userBooking?.status === "pending" ? "Cancel Request?" : "Cancel Booking?"}</Text>
// // //             <Text style={styles.confirmModalMessage}>
// // //               {userBooking?.status === "pending" 
// // //                 ? "Are you sure you want to cancel your booking request?"
// // //                 : "Are you sure you want to cancel your booking? This cannot be undone."}
// // //             </Text>
// // //             <View style={styles.confirmModalButtons}>
// // //               <TouchableOpacity style={[styles.confirmModalBtn, styles.confirmModalCancelBtn]} onPress={() => setShowCancelModal(false)}>
// // //                 <Text style={styles.confirmModalCancelBtnText}>Keep</Text>
// // //               </TouchableOpacity>
// // //               <TouchableOpacity style={[styles.confirmModalBtn, styles.confirmModalConfirmBtn]} onPress={handleCancelBooking}>
// // //                 <Text style={styles.confirmModalConfirmBtnText}>Cancel</Text>
// // //               </TouchableOpacity>
// // //             </View>
// // //           </View>
// // //         </View>
// // //       </Modal>
      
// // //       {/* Rating Modal */}
// // //       <Modal visible={ratingModalVisible} transparent animationType="fade" onRequestClose={() => setRatingModalVisible(false)}>
// // //         <View style={styles.modalBackdrop}>
// // //           <View style={styles.modalCard}>
// // //             <Text style={styles.modalTitle}>Rate Your Driver</Text>
// // //             <Text style={styles.modalSub}>How was your ride with {driverProfile?.full_name?.split(' ')[0] || 'the driver'}?</Text>
// // //             <RatingStars rating={rating} size={32} onPress={setRating} />
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
// // //               <TouchableOpacity style={[styles.submitBtn, (rating === 0 || submitting) && { opacity: 0.5 }]} onPress={handleRateDriver} disabled={rating === 0 || submitting}>
// // //                 <Text style={styles.submitBtnText}>{submitting ? 'Submitting...' : 'Submit Rating'}</Text>
// // //               </TouchableOpacity>
// // //             </View>
// // //           </View>
// // //         </View>
// // //       </Modal>
      
// // //       <ProfileImageModal visible={selectedProfile.visible} imageUrl={selectedProfile.imageUrl} driverName={selectedProfile.driverName} onClose={() => setSelectedProfile({ visible: false, imageUrl: null, driverName: '' })} />
// // //       <CustomAlert visible={alertVisible} title={alertConfig.title} message={alertConfig.message} icon={alertConfig.icon} iconColor={alertConfig.iconColor} buttons={alertConfig.buttons} onBackdropPress={() => setAlertVisible(false)} />
// // //     </View>
// // //   );
// // // }

// // // // ============================================
// // // // STYLES (Keep existing styles)
// // // // ============================================

// // // const styles = StyleSheet.create({
// // //   container: { flex: 1, backgroundColor: '#F4F5F7' },
// // //   mapContainer: { width: '100%', overflow: 'hidden', backgroundColor: '#E8EEF7' },
// // //   map: { flex: 1, backgroundColor: '#E8EEF7' },
// // //   mapBackButton: { position: 'absolute', top: Platform.OS === 'ios' ? 54 : 22, left: 14, width: 42, height: 42, borderRadius: 25, backgroundColor: 'rgba(255,255,255,0.96)', alignItems: 'center', justifyContent: 'center', shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4, elevation: 3 },
// // //   driverLiveMarker: { alignItems: 'center', justifyContent: 'center' },
// // //   driverLiveDot: { width: 16, height: 16, borderRadius: 8, backgroundColor: '#2457A6', borderWidth: 3, borderColor: '#fff' },
// // //   driverLiveRing: { position: 'absolute', width: 32, height: 32, borderRadius: 16, backgroundColor: 'rgba(36,87,166,0.2)', borderWidth: 1, borderColor: '#2457A6' },
// // //   markerWrapper: { alignItems: 'center' },
// // //   pinBubble: { width: 28, height: 28, borderRadius: 14, borderWidth: 3, borderColor: 'white', alignItems: 'center', justifyContent: 'center', shadowColor: '#000', shadowOffset: { width: 0, height: 3 }, shadowOpacity: 0.25, shadowRadius: 4, elevation: 5 },
// // //   pinPointer: { width: 0, height: 0, backgroundColor: 'transparent', borderStyle: 'solid', borderLeftWidth: 7, borderRightWidth: 7, borderTopWidth: 10, borderLeftColor: 'transparent', borderRightColor: 'transparent', marginTop: -2 },
// // //   pinIcon: { fontSize: 14, fontWeight: '800', color: 'white', textAlign: 'center', lineHeight: 18 },
// // //   drawer: { position: 'absolute', bottom: 0, left: 0, right: 0, backgroundColor: '#F4F5F7', borderTopLeftRadius: 28, borderTopRightRadius: 28, overflow: 'hidden', shadowColor: '#000', shadowOffset: { width: 0, height: -2 }, shadowOpacity: 0.1, shadowRadius: 8, elevation: 10 },
// // //   handleWrap: { alignItems: 'center', paddingTop: 10, paddingBottom: 8, backgroundColor: '#F4F5F7', position: 'relative' },
// // //   handleHitArea: { paddingHorizontal: 40, paddingVertical: 10, alignItems: 'center', justifyContent: 'center' },
// // //   handleBar: { width: 64, height: 6, borderRadius: 99, backgroundColor: '#CDD2D8' },
// // //   collapsedSummary: { paddingHorizontal: 16, paddingTop: 4, paddingBottom: 12 },
// // //   collapsedTopRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12 },
// // //   collapsedStatusRow: { marginBottom: 6 },
// // //   collapsedStatusBadge: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 8, paddingVertical: 3, borderRadius: 12, gap: 4, alignSelf: 'flex-start' },
// // //   collapsedStatusText: { fontSize: 10, fontWeight: '600' },
// // //   collapsedDriver: { fontSize: 16, fontWeight: '800', color: Colors.dark },
// // //   collapsedSub: { marginTop: 2, fontSize: 12, color: Colors.gray, fontWeight: '600' },
// // //   collapsedPriceWrap: { alignItems: 'flex-end' },
// // //   collapsedPrice: { fontSize: 18, fontWeight: '900', color: Colors.dark },
// // //   collapsedPerSeat: { fontSize: 10, color: Colors.gray, fontWeight: '600' },
// // //   drawerScroll: { flex: 1 },
// // //   drawerContent: { paddingHorizontal: 16, paddingBottom: 16 },
// // //   statusBanner: { flexDirection: 'row', alignItems: 'flex-start', padding: 14, borderRadius: 16, marginBottom: 14, gap: 12 },
// // //   statusBannerTextContainer: { flex: 1 },
// // //   statusBannerTitle: { fontSize: 16, fontWeight: '800' },
// // //   statusBannerSubtitle: { fontSize: 12, color: '#6B7280', marginTop: 4 },
// // //   driverCard: { backgroundColor: 'white', borderRadius: 20, padding: 16, marginBottom: 14, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 8, elevation: 2 },
// // //   driverTopRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
// // //   driverLeftWrap: { flexDirection: 'row', flex: 1, paddingRight: 10 },
// // //   driverAvatar: { width: 56, height: 56, borderRadius: 28, backgroundColor: '#E5E7EB', overflow: 'hidden', alignItems: 'center', justifyContent: 'center', marginRight: 12 },
// // //   avatarImg: { width: 56, height: 56, borderRadius: 28, resizeMode: 'cover' },
// // //   avatarText: { fontSize: 15, fontWeight: '800', color: Colors.gray },
// // //   avatarPlaceholder: { width: 56, height: 56, borderRadius: 28, backgroundColor: '#E5E7EB', alignItems: 'center', justifyContent: 'center' },
// // //   svgAvatarContainer: { width: 56, height: 56, borderRadius: 28, overflow: 'hidden', alignItems: 'center', justifyContent: 'center', backgroundColor: '#E5E7EB' },
// // //   driverMeta: { flex: 1 },
// // //   driverNameRow: { flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap', gap: 6 },
// // //   driverName: { fontSize: 17, fontWeight: '800', color: Colors.dark },
// // //   ratingRow: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 6 },
// // //   ratingText: { fontSize: 13, color: Colors.dark, fontWeight: '700' },
// // //   chatButton: { width: 44, height: 44, borderRadius: 22, backgroundColor: '#E8F0FE', alignItems: 'center', justifyContent: 'center' },
// // //   actionButtonsRow: { flexDirection: 'row', gap: 12, marginTop: 14 },
// // //   profileOutlineBtn: { flex: 2, borderWidth: 1, borderColor: '#2457A6', borderRadius: 16, paddingVertical: 12, alignItems: 'center' },
// // //   profileOutlineBtnText: { color: '#2457A6', fontWeight: '700', fontSize: 14 },
// // //   shareOutlineBtn: { flex: 1, borderWidth: 1, borderColor: '#2457A6', borderRadius: 16, paddingVertical: 12, alignItems: 'center', flexDirection: 'row', justifyContent: 'center', gap: 6 },
// // //   shareOutlineBtnText: { color: '#2457A6', fontWeight: '700', fontSize: 14 },
// // //   driverRatingCard: { backgroundColor: '#FFFBEB', borderRadius: 16, padding: 14, marginBottom: 14, borderWidth: 1, borderColor: '#FDE68A' },
// // //   driverRatingHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 10 },
// // //   driverRatingTitle: { fontSize: 13, fontWeight: '600', color: '#92400E' },
// // //   driverRatingContent: { alignItems: 'center', gap: 8 },
// // //   driverFeedbackText: { fontSize: 13, color: '#78350F', fontStyle: 'italic', textAlign: 'center' },
// // //   driverFeedbackPlaceholder: { fontSize: 12, color: '#B45309', opacity: 0.7, fontStyle: 'italic' },
// // //   cardSection: { backgroundColor: 'white', borderRadius: 20, padding: 16, marginBottom: 14, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 8, elevation: 2 },
// // //   sectionTitle: { fontSize: 16, fontWeight: '800', color: Colors.dark, marginBottom: 14 },
// // //   sectionSubtitle: { fontSize: 14, fontWeight: '600', color: Colors.dark, marginBottom: 12, marginTop: 8 },
// // //   tripItem: { flexDirection: 'row', marginBottom: 16 },
// // //   tripIconContainer: { width: 32, height: 32, borderRadius: 16, backgroundColor: '#F0F7FF', alignItems: 'center', justifyContent: 'center', marginRight: 12 },
// // //   tripDetails: { flex: 1 },
// // //   tripLabel: { fontSize: 12, color: Colors.gray, marginBottom: 2 },
// // //   tripValue: { fontSize: 15, fontWeight: '600', color: Colors.dark },
// // //   tripDivider: { height: 1, backgroundColor: '#EEF2F7', marginVertical: 12, marginLeft: 16 },
// // //   tripMetaRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 16, marginTop: 8, paddingTop: 12, borderTopWidth: 1, borderTopColor: '#EEF2F7' },
// // //   tripMetaItem: { flexDirection: 'row', alignItems: 'center', gap: 6 },
// // //   tripMetaText: { fontSize: 13, color: Colors.gray },
// // //   vehicleDetailRow: { flexDirection: 'row', alignItems: 'center', gap: 16 },
// // //   vehicleDetailInfo: { flex: 1 },
// // //   vehicleDetailName: { fontSize: 15, fontWeight: '600', color: Colors.dark },
// // //   vehicleDetailColor: { fontSize: 13, color: '#6B7280', marginTop: 2 },
// // //   vehicleDetailReg: { fontSize: 12, color: '#9CA3AF', marginTop: 2 },
// // //   vehicleDetailSeats: { fontSize: 12, color: '#6B7280', marginTop: 2 },
// // //   seatStatsRow: { flexDirection: 'row', justifyContent: 'space-around', marginBottom: 16 },
// // //   seatStat: { alignItems: 'center' },
// // //   seatStatValue: { fontSize: 24, fontWeight: '800', color: Colors.dark },
// // //   seatStatLabel: { fontSize: 12, color: Colors.gray, marginTop: 4 },
// // //   seatProgressContainer: { height: 6, backgroundColor: '#E5E7EB', borderRadius: 3, overflow: 'hidden', marginBottom: 8 },
// // //   seatProgressBar: { height: '100%', backgroundColor: '#10B981', borderRadius: 3 },
// // //   tagRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 14 },
// // //   preferenceTag: { paddingHorizontal: 12, paddingVertical: 8, borderRadius: 999, backgroundColor: '#FFF3E8' },
// // //   preferenceTagText: { fontSize: 12, color: '#C65D00', fontWeight: '700' },
// // //   bookingDetailRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 8 },
// // //   bookingDetailLabel: { fontSize: 14, color: Colors.gray },
// // //   bookingDetailValue: { fontSize: 14, fontWeight: '600', color: Colors.dark },
// // //   bookingTotalRow: { marginTop: 8, paddingTop: 8, borderTopWidth: 1, borderTopColor: '#EEF2F7' },
// // //   bookingTotalLabel: { fontSize: 16, fontWeight: '700', color: Colors.dark },
// // //   bookingTotalValue: { fontSize: 18, fontWeight: '800', color: '#184080' },
// // //   bookingStatusBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20 },
// // //   bookingStatusText: { fontSize: 12, fontWeight: '600' },
// // //   divider: { height: 1, backgroundColor: '#EEF2F7', marginVertical: 16 },
// // //   otherBookedInfo: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFFBEB', padding: 10, borderRadius: 8, marginBottom: 12, gap: 8 },
// // //   otherBookedInfoText: { flex: 1, fontSize: 11, color: '#B45309' },
// // //   seatSelectorRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: '#FAFAFB', borderRadius: 18, padding: 14, marginBottom: 12 },
// // //   seatActionBtn: { width: 38, height: 38, borderRadius: 12, borderWidth: 1, borderColor: '#D6DDE7', alignItems: 'center', justifyContent: 'center', backgroundColor: 'white' },
// // //   seatActionBtnDisabled: { opacity: 0.5, backgroundColor: '#F5F5F5' },
// // //   seatCountWrap: { flexDirection: 'row', alignItems: 'baseline' },
// // //   seatCountText: { fontSize: 28, fontWeight: '900', color: Colors.dark },
// // //   seatAvailableText: { fontSize: 13, color: Colors.gray, marginLeft: 6, fontWeight: '600' },
// // //   updateSeatsBtn: { backgroundColor: Colors.primary, paddingVertical: 12, borderRadius: 12, alignItems: 'center', marginTop: 8 },
// // //   updateSeatsBtnDisabled: { opacity: 0.6 },
// // //   updateSeatsBtnText: { color: '#fff', fontWeight: '700', fontSize: 14 },
// // //   cancelBookingBtn: { marginTop: 12, backgroundColor: '#FEF2F2', paddingVertical: 12, borderRadius: 12, alignItems: 'center', borderWidth: 1, borderColor: '#EF4444' },
// // //   cancelBookingBtnText: { color: '#EF4444', fontWeight: '700', fontSize: 14 },
// // //   cancelBookingBtnDisabled: { opacity: 0.6 },
// // //   noRidersContainer: { alignItems: 'center', padding: 30, gap: 10 },
// // //   noRidersText: { fontSize: 14, fontWeight: '600', color: Colors.gray },
// // //   otherRiderItem: { flexDirection: 'row', alignItems: 'center', paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: '#EEF2F7' },
// // //   otherRiderAvatar: { width: 44, height: 44, borderRadius: 22, backgroundColor: '#E5E7EB', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', marginRight: 12 },
// // //   otherRiderAvatarImg: { width: 44, height: 44, borderRadius: 22, resizeMode: 'cover' },
// // //   otherRiderAvatarPlaceholder: { width: 44, height: 44, borderRadius: 22, backgroundColor: '#E5E7EB', alignItems: 'center', justifyContent: 'center' },
// // //   otherRiderAvatarText: { fontSize: 16, fontWeight: '700', color: Colors.primary },
// // //   otherRiderInfo: { flex: 1 },
// // //   otherRiderName: { fontSize: 15, fontWeight: '600', color: Colors.dark, marginBottom: 2 },
// // //   otherRiderSeats: { fontSize: 12, color: Colors.gray },
// // //   safetyCard: { backgroundColor: '#FFF3E7', borderRadius: 18, padding: 16, marginBottom: 14, flexDirection: 'row', alignItems: 'center', gap: 12 },
// // //   safetyTitle: { fontSize: 14, color: '#2457A6', fontWeight: '800' },
// // //   safetySub: { marginTop: 2, fontSize: 12, color: '#2457A6', opacity: 0.9, fontWeight: '600' },
// // //   loaderContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#fff' },
// // //   modalBackdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center' },
// // //   confirmModalContent: { backgroundColor: 'white', borderRadius: 24, padding: 24, width: '85%', alignItems: 'center' },
// // //   confirmModalTitle: { fontSize: 20, fontWeight: '800', color: Colors.dark, marginTop: 12 },
// // //   confirmModalMessage: { fontSize: 14, color: Colors.gray, textAlign: 'center', marginBottom: 24, lineHeight: 20 },
// // //   confirmModalButtons: { flexDirection: 'row', gap: 12, width: '100%' },
// // //   confirmModalBtn: { flex: 1, paddingVertical: 12, borderRadius: 12, alignItems: 'center' },
// // //   confirmModalCancelBtn: { backgroundColor: '#F3F4F6' },
// // //   confirmModalCancelBtnText: { color: Colors.dark, fontWeight: '600' },
// // //   confirmModalConfirmBtn: { backgroundColor: '#EF4444' },
// // //   confirmModalConfirmBtnText: { color: '#fff', fontWeight: '600' },
// // //   modalCard: { backgroundColor: '#fff', borderRadius: 24, padding: 20, alignItems: 'center', width: width - 40 },
// // //   modalTitle: { fontSize: 22, fontWeight: '700', color: '#111827', textAlign: 'center', marginTop: 12 },
// // //   modalSub: { fontSize: 14, color: '#6B7280', textAlign: 'center', marginTop: 8, marginBottom: 18 },
// // //   starsRow: { flexDirection: 'row', justifyContent: 'center', marginBottom: 18 },
// // //   feedbackInput: { minHeight: 100, borderWidth: 1, borderColor: '#E5E7EB', borderRadius: 16, padding: 14, color: '#111827', fontSize: 14, width: '100%' },
// // //   modalActions: { flexDirection: 'row', gap: 10, marginTop: 18, width: '100%' },
// // //   skipBtn: { flex: 1, borderWidth: 1, borderColor: '#D1D5DB', borderRadius: 999, paddingVertical: 14, alignItems: 'center' },
// // //   skipBtnText: { color: '#6B7280', fontWeight: '600' },
// // //   submitBtn: { flex: 1, backgroundColor: Colors.primary, borderRadius: 999, paddingVertical: 14, alignItems: 'center' },
// // //   submitBtnText: { color: '#fff', fontWeight: '700' },
// // //   imageModalContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', width: '100%' },
// // //   imageModalContent: { width: '90%', backgroundColor: Colors.white, borderRadius: 20, overflow: 'hidden', maxHeight: '80%' },
// // //   imageModalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 16, borderBottomWidth: 1, borderBottomColor: '#EEF2F7' },
// // //   imageModalTitle: { fontSize: 18, fontWeight: '700', color: Colors.dark },
// // //   fullProfileImage: { width: '100%', height: 400, backgroundColor: '#F5F5F5', resizeMode: 'contain' },
// // //   modalSvgContainer: { width: '100%', height: 400, backgroundColor: '#F5F5F5', alignItems: 'center', justifyContent: 'center' },
// // //   noImageContainer: { width: '100%', height: 400, justifyContent: 'center', alignItems: 'center', backgroundColor: '#F5F5F5' },
// // //   noImageText: { fontSize: 16, color: Colors.gray },
// // //   emptyText: { fontSize: 13, color: Colors.gray, fontWeight: '600' },
// // //   pendingModificationHeader: {
// // //     flexDirection: 'row',
// // //     alignItems: 'center',
// // //     gap: 12,
// // //     marginBottom: 16,
// // //     paddingBottom: 12,
// // //     borderBottomWidth: 1,
// // //     borderBottomColor: '#FDE68A',
// // //   },
// // //   pendingModificationTitle: {
// // //     fontSize: 18,
// // //     fontWeight: '700',
// // //     color: '#92400E',
// // //     flex: 1,
// // //   },
// // //   pendingModificationDetails: {
// // //     backgroundColor: '#FFFBEB',
// // //     borderRadius: 12,
// // //     padding: 14,
// // //     marginBottom: 16,
// // //     borderWidth: 1,
// // //     borderColor: '#FDE68A',
// // //   },
// // //   modificationDetailRow: {
// // //     flexDirection: 'row',
// // //     justifyContent: 'space-between',
// // //     alignItems: 'center',
// // //     paddingVertical: 8,
// // //   },
// // //   modificationDetailLabel: {
// // //     fontSize: 14,
// // //     color: '#6B7280',
// // //   },
// // //   modificationDetailValue: {
// // //     fontSize: 16,
// // //     fontWeight: '600',
// // //     color: '#111827',
// // //   },
// // //   pendingBadge: {
// // //     paddingHorizontal: 10,
// // //     paddingVertical: 4,
// // //     borderRadius: 20,
// // //   },
// // //   pendingBadgeText: {
// // //     fontSize: 12,
// // //     fontWeight: '600',
// // //   },
// // //   modificationDate: {
// // //     fontSize: 11,
// // //     color: '#9CA3AF',
// // //     marginTop: 8,
// // //     textAlign: 'center',
// // //   },
// // //   cancelModificationBtn: {
// // //     backgroundColor: '#FEF2F2',
// // //     paddingVertical: 12,
// // //     borderRadius: 12,
// // //     alignItems: 'center',
// // //     borderWidth: 1,
// // //     borderColor: '#EF4444',
// // //   },
// // //   cancelModificationBtnText: {
// // //     color: '#EF4444',
// // //     fontWeight: '600',
// // //     fontSize: 14,
// // //   },
// // // });
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
// //   LogBox,
// //   TextInput,
// //   Share,
// //   Alert,
// //   ActivityIndicator,
// //   RefreshControl,
// //   Linking,
// // } from 'react-native';
// // import MapView, { Marker, Polyline, PROVIDER_GOOGLE, Circle } from 'react-native-maps';
// // import { Ionicons } from '@expo/vector-icons';
// // import LottieView from "lottie-react-native";
// // import { SvgCssUri } from 'react-native-svg/css';
// // import { Colors } from '../constants/Colors';
// // import { useAuth } from '../context/AuthContext';
// // import { API_BASE_URL, GMAP_API_KEY } from '../config/config_ip';
// // import CustomAlert from '../components/CustomAlert';
// // import { useFocusEffect } from '@react-navigation/native';
// // import io from 'socket.io-client';
// // import ChatService from '../services/ChatService';

// // LogBox.ignoreLogs(['Accessibility: View', 'Property accessibilityState', 'RCTView']);

// // const { height, width } = Dimensions.get('window');
// // const SAFE_TOP = Platform.OS === 'ios' ? 56 : 24;
// // const COLLAPSED_HEIGHT = 84;
// // const EXPANDED_HEIGHT = height * 0.72;

// // // ============================================
// // // UTILITY FUNCTIONS
// // // ============================================

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
// //     if (item && typeof item === 'object' && item.latitude && item.longitude) {
// //       return { longitude: Number(item.longitude), latitude: Number(item.latitude) };
// //     }
// //     return parseSuggestedPoint(item);
// //   }).filter(Boolean);
// // }

// // function isSvgUrl(url) {
// //   if (!url) return false;
// //   return url.toLowerCase().includes('.svg') || url.toLowerCase().includes('.svg?');
// // }

// // function formatDate(dateString) {
// //   if (!dateString) return 'Date not set';
// //   const date = new Date(dateString);
// //   const today = new Date();
// //   const tomorrow = new Date(today);
// //   tomorrow.setDate(tomorrow.getDate() + 1);
// //   const isToday = date.toDateString() === today.toDateString();
// //   const isTomorrow = date.toDateString() === tomorrow.toDateString();
// //   let dayText = "";
// //   if (isToday) dayText = "Today";
// //   else if (isTomorrow) dayText = "Tomorrow";
// //   else dayText = date.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" });
// //   const timeText = date.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit", hour12: true });
// //   return `${dayText}, ${timeText}`;
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

// // // Calculate distance between two coordinates (in km)
// // function calculateDistance(lat1, lon1, lat2, lon2) {
// //   const R = 6371;
// //   const dLat = (lat2 - lat1) * Math.PI / 180;
// //   const dLon = (lon2 - lon1) * Math.PI / 180;
// //   const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
// //             Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
// //             Math.sin(dLon/2) * Math.sin(dLon/2);
// //   const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
// //   return R * c;
// // }

// // // Calculate estimated travel time between points (in minutes)
// // function calculateTravelTime(distanceKm, avgSpeedKmh = 40) {
// //   const timeHours = distanceKm / avgSpeedKmh;
// //   return Math.round(timeHours * 60);
// // }

// // // Format duration display
// // function formatDuration(minutes) {
// //   if (minutes < 60) return `${minutes} min`;
// //   const hours = Math.floor(minutes / 60);
// //   const mins = minutes % 60;
// //   return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`;
// // }

// // // Get rider's pickup location details
// // function getRiderPickupLocation(booking, currentRide) {
// //   if (booking?.pickup_address) return booking.pickup_address;
// //   if (booking?.intersection_pickup_lat && booking?.intersection_pickup_lon) {
// //     const walkDist = booking.pickup_walk_distance_m;
// //     if (walkDist && walkDist > 0) return `Meet point (${walkDist}m walk)`;
// //     return "Meet point on driver's route";
// //   }
// //   if (booking?.pickup_lat && booking?.pickup_lon) return "Your custom pickup location";
// //   if (currentRide?.suggestedPickup || currentRide?.suggested_pickup_point) return "Driver's suggested pickup point";
// //   return currentRide?.origin || "Pickup location";
// // }

// // function getRiderDropoffLocation(booking, currentRide) {
// //   if (booking?.dropoff_address) return booking.dropoff_address;
// //   if (booking?.intersection_drop_lat && booking?.intersection_drop_lon) {
// //     const walkDist = booking.drop_walk_distance_m;
// //     if (walkDist && walkDist > 0) return `Drop point (${walkDist}m walk)`;
// //     return "Drop point on driver's route";
// //   }
// //   if (booking?.drop_lat && booking?.drop_lon) return "Your custom dropoff location";
// //   if (currentRide?.suggestedDrop || currentRide?.suggested_drop_point) return "Driver's suggested drop point";
// //   return currentRide?.destination || "Drop location";
// // }

// // // ============================================
// // // COMPONENTS
// // // ============================================

// // function PreferenceTag({ label, isActive = true }) {
// //   if (!label || label.trim() === '') return null;
  
// //   let activeColor = '#E8F5E9';
// //   let activeTextColor = '#2E7D32';
// //   let inactiveColor = '#F3F4F6';
// //   let inactiveTextColor = '#9CA3AF';
  
// //   const lowerLabel = label.toLowerCase();
// //   if (lowerLabel.includes('age') || lowerLabel.includes('category')) {
// //     activeColor = '#E8F5E9'; activeTextColor = '#2E7D32';
// //   } else if (lowerLabel.includes('chat') || lowerLabel.includes('talk')) {
// //     activeColor = '#E3F2FD'; activeTextColor = '#1565C0';
// //   } else if (lowerLabel.includes('gender')) {
// //     activeColor = '#F3E5F5'; activeTextColor = '#6A1B9A';
// //   } else if (lowerLabel.includes('language') || lowerLabel.includes('speak')) {
// //     activeColor = '#FFF9C4'; activeTextColor = '#F57F17';
// //   }
  
// //   const isBooleanPref = ['women only', 'music', 'chat friendly', 'pets allowed', 'luggage space'].some(
// //     pref => lowerLabel.includes(pref)
// //   );
  
// //   if (isBooleanPref) {
// //     return (
// //       <View style={[styles.preferenceTag, { backgroundColor: isActive ? activeColor : inactiveColor }]}>
// //         <Text style={[styles.preferenceTagText, { color: isActive ? activeTextColor : inactiveTextColor }]}>
// //           {label}
// //         </Text>
// //       </View>
// //     );
// //   }
  
// //   return (
// //     <View style={[styles.preferenceTag, { backgroundColor: '#F3F4F6' }]}>
// //       <Text style={[styles.preferenceTagText, { color: '#6B7280' }]}>{label}</Text>
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

// // function RatingStars({ rating, size = 16, onPress }) {
// //   return (
// //     <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
// //       {[1, 2, 3, 4, 5].map((star) => (
// //         <TouchableOpacity key={star} onPress={() => onPress?.(star)} disabled={!onPress}>
// //           <Ionicons 
// //             name={star <= rating ? 'star' : 'star-outline'} 
// //             size={size} 
// //             color={star <= rating ? '#F59E0B' : '#D1D5DB'} 
// //           />
// //         </TouchableOpacity>
// //       ))}
// //     </View>
// //   );
// // }

// // // ============================================
// // // MAIN SCREEN COMPONENT
// // // ============================================

// // export default function ViewRouteRequestScreen({ navigation, route }) {
// //   const { user } = useAuth();
// //   const params = route.params || {};
// //   const initialRide = params.ride || null;
// //   const booking = params.booking || null;

// //   // State for ride data
// //   const [currentRide, setCurrentRide] = useState(() => {
// //     if (initialRide && initialRide.id) {
// //       return initialRide;
// //     }
// //     if (booking?.ride) {
// //       return booking.ride;
// //     }
// //     return null;
// //   });

// //   const [userBooking, setUserBooking] = useState(() => {
// //     if (booking && booking.id) {
// //       return {
// //         id: Number(booking.id),
// //         seats_requested: Number(booking.seats_requested) || 1,
// //         status: booking.status || 'pending',
// //         total_amount: Number(booking.total_amount) || null,
// //         created_at: booking.created_at,
// //         pickup_address: booking.pickup_address,
// //         dropoff_address: booking.dropoff_address,
// //         intersection_pickup_lat: booking.intersection_pickup_lat,
// //         intersection_pickup_lon: booking.intersection_pickup_lon,
// //         pickup_lat: booking.pickup_lat,
// //         pickup_lon: booking.pickup_lon,
// //         drop_lat: booking.drop_lat,
// //         drop_lon: booking.drop_lon,
// //         pickup_walk_distance_m: booking.pickup_walk_distance_m,
// //         drop_walk_distance_m: booking.drop_walk_distance_m,
// //         modification_request: booking.modification_request,
// //       };
// //     }
// //     if (initialRide?.booking && initialRide.booking.id) {
// //       return {
// //         id: Number(initialRide.booking.id),
// //         seats_requested: Number(initialRide.booking.seats_requested) || 1,
// //         status: initialRide.booking.status || 'pending',
// //         total_amount: Number(initialRide.booking.total_amount) || null,
// //       };
// //     }
// //     if (initialRide?.seatsRequested) {
// //       return {
// //         id: Number(initialRide.id),
// //         seats_requested: Number(initialRide.seatsRequested),
// //         status: 'accepted',
// //       };
// //     }
// //     return null;
// //   });

// //   const [driverProfile, setDriverProfile] = useState(null);
// //   const [isVerified, setIsVerified] = useState(false);
// //   const [loadingProfile, setLoadingProfile] = useState(false);
// //   const [addressCache, setAddressCache] = useState({});
  
// //   // UI State
// //   const [drawerExpanded, setDrawerExpanded] = useState(true);
// //   const [mapReady, setMapReady] = useState(false);
// //   const [showCancelModal, setShowCancelModal] = useState(false);
// //   const [ratingModalVisible, setRatingModalVisible] = useState(false);
// //   const [selectedProfile, setSelectedProfile] = useState({ visible: false, imageUrl: null, driverName: '' });
// //   const [alertVisible, setAlertVisible] = useState(false);
// //   const [alertConfig, setAlertConfig] = useState({ title: "", message: "", icon: "check-circle", iconColor: "#10B981", buttons: [] });
// //   const [refreshing, setRefreshing] = useState(false);
// //   const [timelineExpanded, setTimelineExpanded] = useState(true);
// //   const [selectedStopIndex, setSelectedStopIndex] = useState(null);
  
// //   // Seat related state
// //   const [seatsRequested, setSeatsRequested] = useState(() => {
// //     if (booking?.seats_requested) return booking.seats_requested;
// //     if (initialRide?.seatsRequested) return initialRide.seatsRequested;
// //     return 1;
// //   });
// //   const [modifyingSeats, setModifyingSeats] = useState(false);
// //   const [totalSeatsOffered, setTotalSeatsOffered] = useState(() => initialRide?.available_seats || 4);
// //   const [totalBookedSeats, setTotalBookedSeats] = useState(() => booking?.seats_requested || initialRide?.seatsRequested || 0);
// //   const [availableSeats, setAvailableSeats] = useState(() => (initialRide?.available_seats || 4) - (booking?.seats_requested || initialRide?.seatsRequested || 0));
// //   const [otherRiders, setOtherRiders] = useState([]);
  
// //   // Modification request state
// //   const [seatModificationRequested, setSeatModificationRequested] = useState(false);
// //   const [pendingSeatsRequest, setPendingSeatsRequest] = useState(null);
// //   const [pendingRequestDetails, setPendingRequestDetails] = useState(null);
// //   const [pendingModificationRequest, setPendingModificationRequest] = useState(null);
  
// //   // Live tracking state
// //   const [liveSession, setLiveSession] = useState(null);
// //   const [driverLocation, setDriverLocation] = useState(null);
// //   const [socketConnected, setSocketConnected] = useState(false);
  
// //   // Rating state
// //   const [rating, setRating] = useState(0);
// //   const [feedback, setFeedback] = useState('');
// //   const [submitting, setSubmitting] = useState(false);
// //   const [hasRatedDriver, setHasRatedDriver] = useState(false);
// //   const [rideCompleted, setRideCompleted] = useState(false);
  
// //   // Driver's rating and feedback for this ride
// //   const [driverRating, setDriverRating] = useState(null);
// //   const [driverFeedbackText, setDriverFeedbackText] = useState('');
// //   const [showDriverRating, setShowDriverRating] = useState(false);
  
// //   // Cancel state
// //   const [cancelLoading, setCancelLoading] = useState(false);
  
// //   // Refs
// //   const animatedDrawer = useRef(new Animated.Value(1)).current;
// //   const mapRef = useRef(null);
// //   const socketRef = useRef(null);
// //   const hasShownRatingModal = useRef(false);
  
// //   // Animation values
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
  
// //   // Helper functions
// //   const showCustomAlert = (title, message, type = 'success') => {
// //     let icon = "check-circle";
// //     let iconColor = "#10B981";
// //     if (type === 'error') { icon = "error"; iconColor = "#EF4444"; }
// //     else if (type === 'warning') { icon = "warning"; iconColor = "#F59E0B"; }
// //     else if (type === 'info') { icon = "info"; iconColor = Colors.primary; }
// //     setAlertConfig({ title, message, icon, iconColor, buttons: [{ text: 'OK', onPress: () => setAlertVisible(false) }] });
// //     setAlertVisible(true);
// //   };
  
// //   const getProfilePhotoUrl = () => {
// //     const rawUrl = driverProfile?.profile_picture || currentRide?.profilePicture || currentRide?.driverProfilePicture;
// //     if (!rawUrl) return null;
// //     return buildImageUrl(rawUrl);
// //   };
  
// //   const getDriverPhoneNumber = () => {
// //     return currentRide?.phoneNumber || currentRide?.driver_phone;
// //   };
  
// //   const handleChatWithDriver = async () => {
// //     const driverPhone = getDriverPhoneNumber();
// //     const driverName = driverProfile?.full_name || currentRide?.driverName || 'Driver';
    
// //     if (!driverPhone) {
// //       showCustomAlert('Error', 'Driver contact information not available', 'error');
// //       return;
// //     }
    
// //     try {
// //       const result = await ChatService.getOrCreateConversation(
// //         user?.phone_number,
// //         driverPhone,
// //         currentRide?.id
// //       );
      
// //       if (result.success && result.conversationId) {
// //         navigation.navigate('ChatScreen', {
// //           conversationId: result.conversationId,
// //           user: {
// //             name: driverName,
// //             phone_number: driverPhone,
// //             profile_picture: getProfilePhotoUrl(),
// //           },
// //           rideId: currentRide?.id,
// //         });
// //       } else {
// //         showCustomAlert('Error', 'Could not start chat. Please try again.', 'error');
// //       }
// //     } catch (error) {
// //       console.error('Chat error:', error);
// //       showCustomAlert('Error', 'Could not start chat', 'error');
// //     }
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
  
// //   // Get ride status for passenger view (with reason)
// //   const getPassengerRideStatusInfo = useCallback(() => {
// //     const ride = currentRide;
// //     const now = new Date();
// //     const departureTime = new Date(ride?.departure_time);
// //     const hoursSinceDeparture = (now - departureTime) / (1000 * 60 * 60);
// //     const minutesSinceDeparture = (now - departureTime) / (1000 * 60);
// //     const minutesToDeparture = (departureTime - now) / (1000 * 60);
    
// //     // Check for modification rejected - booking cancelled
// //     if (userBooking?.modification_request?.status === "rejected") {
// //       return { 
// //         text: "Booking Cancelled", 
// //         color: "#DC2626", 
// //         icon: "close-circle", 
// //         type: "modification-rejected",
// //         reason: userBooking.modification_request.rejection_reason || "Your modification request was rejected and booking cancelled"
// //       };
// //     }
    
// //     // Ride completed
// //     if (ride?.status === "completed" || rideCompleted) {
// //       return { text: "Completed", color: "#6B7280", icon: "checkmark-done", type: "completed", reason: null };
// //     }
    
// //     // Ride cancelled
// //     if (ride?.cancellation_reason) {
// //       if (ride.cancellation_reason.includes("Auto-cancelled")) {
// //         return { text: "Auto-cancelled", color: "#9CA3AF", icon: "timer-off", type: "auto-cancelled", reason: ride.cancellation_reason };
// //       }
// //       return { text: "Cancelled", color: "#DC2626", icon: "close-circle", type: "cancelled", reason: ride.cancellation_reason };
// //     }
    
// //     // Auto-cancelled (2 hours past departure with no start)
// //     if (hoursSinceDeparture > 2 && !ride?.started_at && !rideCompleted) {
// //       return { text: "Auto-cancelled", color: "#9CA3AF", icon: "timer-off", type: "auto-cancelled", reason: "Ride auto-cancelled as it was not started within 2 hours of departure time" };
// //     }
    
// //     // Ride ongoing (driver has started)
// //     if (ride?.started_at && ride.status !== "completed") {
// //       return { text: "Ongoing", color: "#10B981", icon: "car-sport", type: "ongoing", reason: null };
// //     }
    
// //     // Driver is late (departure time passed but ride not started, up to 2 hours)
// //     if (minutesSinceDeparture > 0 && minutesSinceDeparture <= 120 && !ride?.started_at) {
// //       return { text: `Driver Late - ${Math.round(minutesSinceDeparture)} min`, color: "#EF4444", icon: "alert-circle", type: "driver-late", reason: `Driver is ${Math.round(minutesSinceDeparture)} minutes late. The ride should start soon.` };
// //     }
    
// //     // Start soon (within 15 minutes before departure)
// //     if (minutesToDeparture <= 15 && minutesToDeparture > 0 && !ride?.started_at) {
// //       return { text: `Starting in ${Math.round(minutesToDeparture)} min`, color: "#10B981", icon: "time-outline", type: "start-soon", reason: `Ride starts in ${Math.round(minutesToDeparture)} minutes. Be ready at your pickup location!` };
// //     }
    
// //     // Upcoming (more than 15 minutes before departure)
// //     if (minutesToDeparture > 15) {
// //       if (userBooking?.status === "accepted") {
// //         const hours = Math.floor(minutesToDeparture / 60);
// //         const mins = Math.round(minutesToDeparture % 60);
// //         const timeText = hours > 0 ? `${hours}h ${mins > 0 ? `${mins}m` : ''}` : `${mins}m`;
// //         return { text: `Upcoming - ${timeText}`, color: "#2457A6", icon: "calendar-outline", type: "upcoming", reason: `Ride departs in ${timeText}` };
// //       }
// //     }
    
// //     // Default based on booking status
// //     if (userBooking?.status === "accepted") {
// //       return { text: "Confirmed", color: "#10B981", icon: "checkmark-circle", type: "accepted", reason: "Your booking is confirmed" };
// //     }
// //     if (userBooking?.status === "pending") {
// //       return { text: "Requested", color: "#F59E0B", icon: "time", type: "pending", reason: "Waiting for driver to accept your request" };
// //     }
// //     if (userBooking?.status === "rejected") {
// //       return { text: "Rejected", color: "#DC2626", icon: "close-circle", type: "rejected", reason: "Your booking request was declined by the driver" };
// //     }
    
// //     return { text: ride?.status || "Unknown", color: Colors.gray, icon: "ellipse", type: "unknown", reason: null };
// //   }, [currentRide, rideCompleted, userBooking?.status, userBooking?.modification_request]);
  
// //   const fetchDriverRatingForRide = useCallback(async () => {
// //     if (!userBooking?.id) return;
// //     const bookingId = Number(userBooking.id);
// //     if (isNaN(bookingId)) return;
// //     try {
// //       const response = await fetch(`${API_BASE_URL}/api/v1/ride-feedback/driver/${bookingId}?_t=${Date.now()}`);
// //       const data = await response.json();
// //       if (data.success && data.feedback) {
// //         setDriverRating(data.feedback.rating);
// //         setDriverFeedbackText(data.feedback.comment || '');
// //         setShowDriverRating(true);
// //       } else {
// //         setShowDriverRating(false);
// //       }
// //     } catch (error) {
// //       console.log('Error fetching driver rating:', error);
// //       setShowDriverRating(false);
// //     }
// //   }, [userBooking?.id]);

// //   const handleRateDriver = async () => {
// //     if (rating === 0) {
// //       showCustomAlert('Rating Required', 'Please select a rating.', 'warning');
// //       return;
// //     }
// //     if (!userBooking?.id) {
// //       showCustomAlert('Error', 'Booking information not found.', 'error');
// //       return;
// //     }
// //     setSubmitting(true);
// //     try {
// //       const bookingId = Number(userBooking.id);
// //       const requestBody = {
// //         ride_booking_id: bookingId,
// //         rating: Number(rating),
// //         comment: feedback || '',
// //       };
// //       const response = await fetch(`${API_BASE_URL}/api/v1/ride-feedback`, {
// //         method: 'POST',
// //         headers: { 
// //           'Content-Type': 'application/json',
// //           'Accept': 'application/json',
// //           'X-Phone-Number': user?.phone_number,
// //         },
// //         body: JSON.stringify(requestBody),
// //       });
// //       const data = await response.json();
// //       if (response.ok && data.success) {
// //         showCustomAlert('Thank You!', 'Your rating has been submitted successfully!', 'success');
// //         setHasRatedDriver(true);
// //         setRatingModalVisible(false);
// //         setRating(0);
// //         setFeedback('');
// //         setTimeout(() => {
// //           fetchDriverRatingForRide();
// //           checkSessionStatus();
// //         }, 500);
// //       } else {
// //         showCustomAlert('Error', 'Failed to submit rating.', 'error');
// //       }
// //     } catch (error) {
// //       console.error('Rating error:', error);
// //       showCustomAlert('Error', 'Network error. Please check your connection.', 'error');
// //     } finally {
// //       setSubmitting(false);
// //     }
// //   };
  
// //   const getCorrectRideId = useCallback(async () => {
// //     if (!userBooking?.id) return null;
// //     try {
// //       const response = await fetch(`${API_BASE_URL}/api/v1/bookings/${userBooking.id}/ride?_t=${Date.now()}`);
// //       const data = await response.json();
// //       if (data.success && data.ride) return data.ride.id;
// //       return null;
// //     } catch (error) {
// //       console.log('Error fetching ride from booking:', error);
// //       return null;
// //     }
// //   }, [userBooking?.id]);

// //   const fetchModificationRequests = useCallback(async () => {
// //     if (!userBooking?.id) return;
// //     try {
// //       const response = await fetch(`${API_BASE_URL}/booking/${userBooking.id}/modification-request?_t=${Date.now()}`);
// //       const data = await response.json();
// //       if (data.has_pending && data.request) {
// //         setPendingModificationRequest(data.request);
// //         setSeatModificationRequested(true);
// //         setPendingSeatsRequest(data.request.requested_seats);
// //         setPendingRequestDetails(data.request);
// //       } else {
// //         setPendingModificationRequest(null);
// //         setSeatModificationRequested(false);
// //         setPendingSeatsRequest(null);
// //         setPendingRequestDetails(null);
// //       }
// //     } catch (error) {
// //       console.log('Error fetching modification request:', error);
// //     }
// //   }, [userBooking?.id]);
  
// //   const handleCancelModificationRequest = async () => {
// //     if (!userBooking?.id) return;
// //     setModifyingSeats(true);
// //     try {
// //       const response = await fetch(`${API_BASE_URL}/api/v1/modifications/booking/${userBooking.id}/cancel`, {
// //         method: 'DELETE',
// //         headers: { 'Content-Type': 'application/json' },
// //       });
// //       const data = await response.json();
// //       if (!response.ok) throw new Error(data.detail || data.message || 'Failed to cancel modification request');
// //       showCustomAlert('Request Cancelled', 'Your seat modification request has been cancelled.', 'success');
// //       setSeatModificationRequested(false);
// //       setPendingSeatsRequest(null);
// //       setPendingRequestDetails(null);
// //       setPendingModificationRequest(null);
// //       await fetchModificationRequests();
// //     } catch (error) {
// //       console.error('Cancel modification error:', error);
// //       showCustomAlert('Error', error.message || 'Failed to cancel modification request', 'error');
// //     } finally {
// //       setModifyingSeats(false);
// //     }
// //   };

// //   const fetchSeatAvailability = useCallback(async () => {
// //     let rideId = currentRide?.id;
// //     if (!rideId || rideId === 3 || rideId === 0) {
// //       const correctId = await getCorrectRideId();
// //       if (correctId) {
// //         rideId = correctId;
// //         setCurrentRide(prev => ({ ...prev, id: correctId }));
// //       } else {
// //         return;
// //       }
// //     }
// //     try {
// //       const url = `${API_BASE_URL.replace(/\/$/, '')}/ride/${rideId}/passengers?_t=${Date.now()}`;
// //       const response = await fetch(url);
// //       if (response.ok) {
// //         const data = await response.json();
// //         const totalSeats = data.available_seats || currentRide?.available_seats || 4;
// //         setTotalSeatsOffered(totalSeats);
// //         const totalBooked = data.total_booked_seats || 0;
// //         setTotalBookedSeats(totalBooked);
// //         setAvailableSeats(Math.max(0, totalSeats - totalBooked));
// //         if (data.passengers && Array.isArray(data.passengers) && user?.phone_number) {
// //           const normalizePhone = (phone) => {
// //             if (!phone) return '';
// //             let cleaned = phone.replace(/\s/g, '').replace(/-/g, '');
// //             if (cleaned.startsWith('+91')) return cleaned;
// //             if (cleaned.startsWith('91') && cleaned.length === 12) return `+${cleaned}`;
// //             if (cleaned.startsWith('+')) return cleaned;
// //             return `+91${cleaned}`;
// //           };
// //           const currentUserPhone = normalizePhone(user.phone_number);
// //           const acceptedPassengers = data.passengers.filter(p => p.status === 'accepted');
// //           const otherAccepted = acceptedPassengers.filter(p => {
// //             const passengerPhone = normalizePhone(p.passenger_phone);
// //             return passengerPhone !== currentUserPhone;
// //           });
// //           setOtherRiders(otherAccepted);
// //         } else {
// //           setOtherRiders([]);
// //         }
// //       }
// //     } catch (error) {
// //       console.log('Error fetching seat availability:', error);
// //     }
// //   }, [currentRide?.id, currentRide?.available_seats, user?.phone_number, getCorrectRideId]);

// //   const loadDriverData = useCallback(async () => {
// //     let rideId = currentRide?.id;
// //     if (!rideId || rideId === 3 || rideId === 0) {
// //       const correctId = await getCorrectRideId();
// //       if (correctId) {
// //         rideId = correctId;
// //         setCurrentRide(prev => ({ ...prev, id: correctId }));
// //       }
// //     }
// //     let driverPhone = currentRide?.phoneNumber || currentRide?.driver_phone;
// //     let driverUserId = currentRide?.driverUserId || currentRide?.driver_user_id;
// //     if ((!driverPhone && !driverUserId) && userBooking?.id) {
// //       try {
// //         const response = await fetch(`${API_BASE_URL}/api/v1/bookings/${userBooking.id}/ride?_t=${Date.now()}`);
// //         const data = await response.json();
// //         if (data.success && data.ride) {
// //           driverPhone = data.ride.driver_phone;
// //           driverUserId = data.ride.driver_user_id;
// //           setCurrentRide(prev => ({ ...prev, 
// //             phoneNumber: driverPhone, 
// //             driver_phone: driverPhone,
// //             driverUserId: driverUserId,
// //             driverName: data.ride.driver_name,
// //             from: data.ride.origin,
// //             to: data.ride.destination,
// //             departure_time: data.ride.departure_time,
// //             price: data.ride.price_per_seat,
// //             available_seats: data.ride.available_seats,
// //             routeCoordinates: data.ride.route_coordinates,
// //           }));
// //         }
// //       } catch (error) {
// //         console.log('Error fetching ride details:', error);
// //       }
// //     }
// //     if (!driverPhone && !driverUserId) return;
// //     setLoadingProfile(true);
// //     try {
// //       const params = new URLSearchParams();
// //       if (driverUserId) params.append('user_id', driverUserId);
// //       else if (driverPhone) params.append('phone_number', driverPhone);
// //       params.append('_t', Date.now());
// //       const profileRes = await fetch(`${API_BASE_URL}/api/v1/users/profile-public?${params.toString()}`);
// //       const profileData = await profileRes.json();
// //       if (profileData?.success && profileData.user) {
// //         setDriverProfile(profileData.user);
// //       }
// //       if (driverPhone) {
// //         const docsRes = await fetch(`${API_BASE_URL}/api/v1/documents/user/${driverPhone}`);
// //         const docsData = await docsRes.json();
// //         if (docsData?.success && docsData.documents) {
// //           const verifiedDocs = docsData.documents.filter(doc => {
// //             const status = doc.status?.toUpperCase();
// //             return status === 'APPROVED' && ['aadhar', 'dl', 'rc'].includes(doc.document_type?.toLowerCase());
// //           });
// //           setIsVerified(verifiedDocs.length > 0);
// //         }
// //       }
// //     } catch (error) {
// //       console.log('Error loading driver data:', error);
// //     } finally {
// //       setLoadingProfile(false);
// //     }
// //   }, [currentRide, userBooking?.id, getCorrectRideId]);

// //   const checkLiveSession = useCallback(async () => {
// //     const rideId = currentRide?.id;
// //     if (!rideId) return;
// //     try {
// //       const response = await fetch(`${API_BASE_URL}/ride/${rideId}/live-session`);
// //       const data = await response.json();
// //       if (data.success && data.session) {
// //         setLiveSession(data.session);
// //         if (data.session.status === 'active' && currentRide?.started_at) {
// //           setupSocketConnection(data.session.session_id);
// //         }
// //       }
// //     } catch (error) {
// //       console.log('Error checking live session:', error);
// //     }
// //   }, [currentRide?.id, currentRide?.started_at]);
  
// //   const setupSocketConnection = useCallback((sessionId) => {
// //     if (socketRef.current) socketRef.current.disconnect();
// //     const socket = io(API_BASE_URL, { transports: ['websocket'], reconnection: true });
// //     socketRef.current = socket;
// //     socket.on('connect', () => {
// //       console.log('Socket connected for live tracking');
// //       socket.emit('join-session', sessionId);
// //       setSocketConnected(true);
// //     });
// //     socket.on('driver-location-update', (data) => {
// //       if (data.latitude && data.longitude) {
// //         setDriverLocation({ latitude: data.latitude, longitude: data.longitude });
// //       }
// //     });
// //     socket.on('ride-started', (data) => {
// //       console.log('Ride started event:', data);
// //       setCurrentRide(prev => ({ ...prev, started_at: new Date().toISOString() }));
// //       showCustomAlert('Ride Started', 'The driver has started the ride!', 'success');
// //     });
// //     socket.on('ride-completed', (data) => {
// //       console.log('Ride completed event:', data);
// //       setRideCompleted(true);
// //       setCurrentRide(prev => ({ ...prev, status: 'completed' }));
// //       showCustomAlert('Ride Completed', 'Thank you for riding with us! Please rate your experience.', 'success');
// //     });
// //     return () => {
// //       if (socketRef.current) socketRef.current.disconnect();
// //     };
// //   }, []);
  
// //   const checkSessionStatus = useCallback(async () => {
// //     const bookingId = userBooking?.id;
// //     if (!bookingId) return;
// //     try {
// //       const res = await fetch(`${API_BASE_URL}/ride-sessions/rider/session-status/${bookingId}?rider_phone=${user?.phone_number}&_t=${Date.now()}`);
// //       const data = await res.json();
// //       if (data.success && data.ride_completed) {
// //         setRideCompleted(true);
// //         setHasRatedDriver(data.has_rated_driver);
// //         if (data.has_rated_driver === false && !hasShownRatingModal.current) {
// //           hasShownRatingModal.current = true;
// //           setTimeout(() => setRatingModalVisible(true), 1000);
// //         }
// //       }
// //       if (data.driver_location_lat && data.driver_location_lng) {
// //         setDriverLocation({ latitude: data.driver_location_lat, longitude: data.driver_location_lng });
// //       }
// //     } catch (error) {
// //       console.log('Error checking session status:', error);
// //     }
// //   }, [userBooking?.id, user?.phone_number]);
  
// //   // Get driver's pickup and dropoff points
// //   const driverPickup = useMemo(() => {
// //     if (currentRide?.suggestedPickup || currentRide?.suggested_pickup_point) {
// //       return parseSuggestedPoint(currentRide.suggestedPickup || currentRide.suggested_pickup_point);
// //     }
// //     if (currentRide?.pickup_lat && currentRide?.pickup_lng) {
// //       return { latitude: currentRide.pickup_lat, longitude: currentRide.pickup_lng };
// //     }
// //     if (currentRide?.origin_lat && currentRide?.origin_lon) {
// //       return { latitude: currentRide.origin_lat, longitude: currentRide.origin_lon };
// //     }
// //     return null;
// //   }, [currentRide]);
  
// //   const driverDropoff = useMemo(() => {
// //     if (currentRide?.suggestedDrop || currentRide?.suggested_drop_point) {
// //       return parseSuggestedPoint(currentRide.suggestedDrop || currentRide.suggested_drop_point);
// //     }
// //     if (currentRide?.dropoff_lat && currentRide?.dropoff_lng) {
// //       return { latitude: currentRide.dropoff_lat, longitude: currentRide.dropoff_lng };
// //     }
// //     if (currentRide?.destination_lat && currentRide?.destination_lon) {
// //       return { latitude: currentRide.destination_lat, longitude: currentRide.destination_lon };
// //     }
// //     return null;
// //   }, [currentRide]);
  
// //   // Get rider's own pickup and dropoff points
// //   const riderPickup = useMemo(() => {
// //     if (userBooking?.pickup_lat && userBooking?.pickup_lon) {
// //       return { latitude: userBooking.pickup_lat, longitude: userBooking.pickup_lon };
// //     }
// //     if (userBooking?.intersection_pickup_lat && userBooking?.intersection_pickup_lon) {
// //       return { latitude: userBooking.intersection_pickup_lat, longitude: userBooking.intersection_pickup_lon };
// //     }
// //     return driverPickup;
// //   }, [userBooking, driverPickup]);
  
// //   const riderDropoff = useMemo(() => {
// //     if (userBooking?.drop_lat && userBooking?.drop_lon) {
// //       return { latitude: userBooking.drop_lat, longitude: userBooking.drop_lon };
// //     }
// //     if (userBooking?.intersection_drop_lat && userBooking?.intersection_drop_lon) {
// //       return { latitude: userBooking.intersection_drop_lat, longitude: userBooking.intersection_drop_lon };
// //     }
// //     return driverDropoff;
// //   }, [userBooking, driverDropoff]);
  
// //   // Get driver start and end for route
// //   const driverStart = useMemo(() => {
// //     const coords = currentRide?.routeCoordinates;
// //     if (Array.isArray(coords) && coords.length > 0) {
// //       const first = coords[0];
// //       if (Array.isArray(first) && first.length === 2) return { latitude: first[1], longitude: first[0] };
// //       if (first && typeof first === 'object' && first.latitude && first.longitude) return { latitude: first.latitude, longitude: first.longitude };
// //     }
// //     return driverPickup;
// //   }, [currentRide, driverPickup]);
  
// //   const driverEnd = useMemo(() => {
// //     const coords = currentRide?.routeCoordinates;
// //     if (Array.isArray(coords) && coords.length > 0) {
// //       const last = coords[coords.length - 1];
// //       if (Array.isArray(last) && last.length === 2) return { latitude: last[1], longitude: last[0] };
// //       if (last && typeof last === 'object' && last.latitude && last.longitude) return { latitude: last.latitude, longitude: last.longitude };
// //     }
// //     return driverDropoff;
// //   }, [currentRide, driverDropoff]);
  
// //   const routePath = useMemo(() => {
// //     const fullRoute = parseRouteCoordinates(currentRide?.routeCoordinates);
// //     if (fullRoute.length >= 2) return fullRoute;
// //     if (driverStart && driverEnd) return [driverStart, driverEnd];
// //     return [];
// //   }, [currentRide, driverStart, driverEnd]);
  
// //   // Create enhanced trip timeline for rider
// //   const tripTimeline = useMemo(() => {
// //     const items = [];
// //     let cumulativeDistance = 0;
// //     let cumulativeDuration = 0;
    
// //     // Start point
// //     if (driverStart?.latitude && driverStart?.longitude) {
// //       items.push({
// //         id: 'start',
// //         type: 'start',
// //         title: 'Trip Start',
// //         address: currentRide?.origin || 'Starting point',
// //         coordinates: driverStart,
// //         order: 0,
// //         icon: '🚗',
// //         color: '#2457A6',
// //         isDriverPoint: true,
// //       });
// //     }
    
// //     // Rider pickup point
// //     if (riderPickup?.latitude && riderPickup?.longitude) {
// //       const distanceToPrevious = items.length > 0 ? calculateDistance(
// //         items[items.length - 1].coordinates.latitude,
// //         items[items.length - 1].coordinates.longitude,
// //         riderPickup.latitude,
// //         riderPickup.longitude
// //       ) : 0;
// //       cumulativeDistance += distanceToPrevious;
// //       cumulativeDuration += calculateTravelTime(distanceToPrevious);
      
// //       items.push({
// //         id: 'pickup',
// //         type: 'pickup',
// //         title: 'Your Pickup',
// //         address: getRiderPickupLocation(userBooking, currentRide),
// //         coordinates: riderPickup,
// //         order: 1,
// //         icon: '📍',
// //         color: '#10B981',
// //         walkDistance: userBooking?.pickup_walk_distance_m,
// //         walkDuration: userBooking?.pickup_walk_distance_m ? Math.round(userBooking.pickup_walk_distance_m / 80) : null,
// //         distanceToNext: distanceToPrevious.toFixed(1),
// //         durationToNext: calculateTravelTime(distanceToPrevious),
// //         cumulativeDistance: cumulativeDistance.toFixed(1),
// //         cumulativeDuration: cumulativeDuration,
// //       });
// //     }
    
// //     // Rider dropoff point
// //     if (riderDropoff?.latitude && riderDropoff?.longitude) {
// //       const distanceToPrevious = items.length > 0 ? calculateDistance(
// //         items[items.length - 1].coordinates.latitude,
// //         items[items.length - 1].coordinates.longitude,
// //         riderDropoff.latitude,
// //         riderDropoff.longitude
// //       ) : 0;
// //       cumulativeDistance += distanceToPrevious;
// //       cumulativeDuration += calculateTravelTime(distanceToPrevious);
      
// //       items.push({
// //         id: 'dropoff',
// //         type: 'dropoff',
// //         title: 'Your Dropoff',
// //         address: getRiderDropoffLocation(userBooking, currentRide),
// //         coordinates: riderDropoff,
// //         order: 2,
// //         icon: '🏁',
// //         color: '#F59E0B',
// //         walkDistance: userBooking?.drop_walk_distance_m,
// //         walkDuration: userBooking?.drop_walk_distance_m ? Math.round(userBooking.drop_walk_distance_m / 80) : null,
// //         distanceToNext: distanceToPrevious.toFixed(1),
// //         durationToNext: calculateTravelTime(distanceToPrevious),
// //         cumulativeDistance: cumulativeDistance.toFixed(1),
// //         cumulativeDuration: cumulativeDuration,
// //       });
// //     }
    
// //     // End point
// //     if (driverEnd?.latitude && driverEnd?.longitude && 
// //         (!riderDropoff || (Math.abs(driverEnd.latitude - riderDropoff.latitude) > 0.001 || Math.abs(driverEnd.longitude - riderDropoff.longitude) > 0.001))) {
// //       const distanceToPrevious = items.length > 0 ? calculateDistance(
// //         items[items.length - 1].coordinates.latitude,
// //         items[items.length - 1].coordinates.longitude,
// //         driverEnd.latitude,
// //         driverEnd.longitude
// //       ) : 0;
// //       cumulativeDistance += distanceToPrevious;
// //       cumulativeDuration += calculateTravelTime(distanceToPrevious);
      
// //       items.push({
// //         id: 'end',
// //         type: 'end',
// //         title: 'Trip End',
// //         address: currentRide?.destination || 'Destination',
// //         coordinates: driverEnd,
// //         order: 3,
// //         icon: '🏁',
// //         color: '#DC2626',
// //         isDriverPoint: true,
// //         distanceToNext: distanceToPrevious.toFixed(1),
// //         durationToNext: calculateTravelTime(distanceToPrevious),
// //         cumulativeDistance: cumulativeDistance.toFixed(1),
// //         cumulativeDuration: cumulativeDuration,
// //       });
// //     }
    
// //     // Add total trip info to first item
// //     if (items.length > 0) {
// //       items[0].totalDistance = cumulativeDistance.toFixed(1);
// //       items[0].totalDuration = cumulativeDuration;
// //     }
    
// //     return items;
// //   }, [driverStart, driverEnd, riderPickup, riderDropoff, currentRide, userBooking]);
  
// //   // Create walking paths
// //   const walkingPaths = useMemo(() => {
// //     const paths = [];
    
// //     // Pickup walking path
// //     if (userBooking?.pickup_lat && userBooking?.pickup_lon && 
// //         userBooking?.intersection_pickup_lat && userBooking?.intersection_pickup_lon) {
// //       const distance = calculateDistance(
// //         userBooking.intersection_pickup_lat, userBooking.intersection_pickup_lon,
// //         userBooking.pickup_lat, userBooking.pickup_lon
// //       );
// //       if (distance > 0.05) {
// //         paths.push({
// //           id: 'walking-pickup',
// //           coordinates: [
// //             { latitude: userBooking.intersection_pickup_lat, longitude: userBooking.intersection_pickup_lon },
// //             { latitude: userBooking.pickup_lat, longitude: userBooking.pickup_lon }
// //           ],
// //           color: '#10B981',
// //           lineDash: [5, 5],
// //           walkDistance: userBooking.pickup_walk_distance_m,
// //         });
// //       }
// //     }
    
// //     // Dropoff walking path
// //     if (userBooking?.drop_lat && userBooking?.drop_lon && 
// //         userBooking?.intersection_drop_lat && userBooking?.intersection_drop_lon) {
// //       const distance = calculateDistance(
// //         userBooking.intersection_drop_lat, userBooking.intersection_drop_lon,
// //         userBooking.drop_lat, userBooking.drop_lon
// //       );
// //       if (distance > 0.05) {
// //         paths.push({
// //           id: 'walking-dropoff',
// //           coordinates: [
// //             { latitude: userBooking.intersection_drop_lat, longitude: userBooking.intersection_drop_lon },
// //             { latitude: userBooking.drop_lat, longitude: userBooking.drop_lon }
// //           ],
// //           color: '#F59E0B',
// //           lineDash: [5, 5],
// //           walkDistance: userBooking.drop_walk_distance_m,
// //         });
// //       }
// //     }
    
// //     return paths;
// //   }, [userBooking]);
  
// //   // Create all map markers
// //   const allMapMarkers = useMemo(() => {
// //     const markers = [];
    
// //     // Driver start
// //     if (driverStart?.latitude && driverStart?.longitude) {
// //       markers.push({
// //         id: 'driver-start',
// //         type: 'driver-start',
// //         coordinate: driverStart,
// //         title: 'Trip Start',
// //         address: currentRide?.origin || 'Starting point',
// //         icon: 'flag',
// //         color: '#2457A6',
// //       });
// //     }
    
// //     // Rider pickup
// //     if (riderPickup?.latitude && riderPickup?.longitude) {
// //       markers.push({
// //         id: 'rider-pickup',
// //         type: 'pickup',
// //         coordinate: riderPickup,
// //         title: 'Your Pickup Point',
// //         address: getRiderPickupLocation(userBooking, currentRide),
// //         icon: 'person-walking',
// //         color: '#10B981',
// //         walkDistance: userBooking?.pickup_walk_distance_m,
// //       });
// //     }
    
// //     // Rider dropoff
// //     if (riderDropoff?.latitude && riderDropoff?.longitude) {
// //       markers.push({
// //         id: 'rider-dropoff',
// //         type: 'dropoff',
// //         coordinate: riderDropoff,
// //         title: 'Your Dropoff Point',
// //         address: getRiderDropoffLocation(userBooking, currentRide),
// //         icon: 'flag',
// //         color: '#F59E0B',
// //         walkDistance: userBooking?.drop_walk_distance_m,
// //       });
// //     }
    
// //     // Driver end
// //     if (driverEnd?.latitude && driverEnd?.longitude) {
// //       markers.push({
// //         id: 'driver-end',
// //         type: 'driver-end',
// //         coordinate: driverEnd,
// //         title: 'Trip End',
// //         address: currentRide?.destination || 'Destination',
// //         icon: 'flag',
// //         color: '#DC2626',
// //       });
// //     }
    
// //     // Driver live location
// //     if (driverLocation && getPassengerRideStatusInfo().type === 'ongoing') {
// //       markers.push({
// //         id: 'driver-live',
// //         type: 'driver-live',
// //         coordinate: driverLocation,
// //         title: 'Driver Current Location',
// //         icon: 'car-sport',
// //         color: '#2457A6',
// //       });
// //     }
    
// //     return markers;
// //   }, [driverStart, driverEnd, riderPickup, riderDropoff, driverLocation, currentRide, userBooking, getPassengerRideStatusInfo]);
  
// //   const allMarkerCoords = useMemo(() => {
// //     const coords = allMapMarkers.map(m => m.coordinate).filter(c => c?.latitude && c?.longitude);
// //     walkingPaths.forEach(path => {
// //       path.coordinates.forEach(coord => coords.push(coord));
// //     });
// //     return coords;
// //   }, [allMapMarkers, walkingPaths]);
  
// //   const fitMapToMarkers = useCallback(() => {
// //     if (mapRef.current && mapReady && allMarkerCoords.length >= 1) {
// //       setTimeout(() => {
// //         try {
// //           mapRef.current.fitToCoordinates(allMarkerCoords, {
// //             edgePadding: { top: 80, right: 50, bottom: 200, left: 50 },
// //             animated: true,
// //           });
// //         } catch (e) { console.log('fitToCoordinates error:', e); }
// //       }, 500);
// //     }
// //   }, [mapReady, allMarkerCoords]);
  
// //   useEffect(() => {
// //     if (mapReady && allMarkerCoords.length >= 1) fitMapToMarkers();
// //   }, [mapReady, allMarkerCoords, fitMapToMarkers]);
  
// //   const canModifySeats = useCallback(() => {
// //     if (!userBooking) return false;
// //     const statusInfo = getPassengerRideStatusInfo();
// //     if (rideCompleted) return false;
// //     if (currentRide?.cancellation_reason || currentRide?.started_at) return false;
// //     if (userBooking.status !== "accepted") return false;
// //     if (['expired', 'auto-cancelled', 'driver-late', 'start-soon', 'ongoing', 'modification-rejected'].includes(statusInfo.type)) return false;
// //     if (seatModificationRequested) return false;
// //     return true;
// //   }, [userBooking, getPassengerRideStatusInfo, currentRide, seatModificationRequested, rideCompleted]);
  
// //   const canCancelBooking = useCallback(() => {
// //     if (!userBooking) return false;
// //     const statusInfo = getPassengerRideStatusInfo();
// //     if (rideCompleted) return false;
// //     if (currentRide?.cancellation_reason || currentRide?.started_at || currentRide?.status === 'completed') return false;
// //     if (['expired', 'auto-cancelled', 'ongoing', 'modification-rejected'].includes(statusInfo.type)) return false;
// //     if (!["accepted", "pending"].includes(userBooking.status)) return false;
// //     return true;
// //   }, [userBooking, getPassengerRideStatusInfo, currentRide, rideCompleted]);
  
// //   const handleModifySeats = async () => {
// //     if (!userBooking || !canModifySeats()) {
// //       showCustomAlert('Cannot Modify', 'Modifications are not available at this time.', 'warning');
// //       return;
// //     }
// //     const currentSeatsBooked = userBooking.seats_requested || 0;
// //     const otherBookedSeats = Math.max(0, totalBookedSeats - currentSeatsBooked);
// //     const maxSeatsUserCanRequest = totalSeatsOffered - otherBookedSeats;
// //     if (maxSeatsUserCanRequest <= 0) {
// //       showCustomAlert('No Seats Available', 'No additional seats are available.', 'warning');
// //       return;
// //     }
// //     if (seatsRequested > maxSeatsUserCanRequest) {
// //       showCustomAlert('Not Enough Seats', `Only ${maxSeatsUserCanRequest} seat(s) available.`, 'warning');
// //       return;
// //     }
// //     if (seatsRequested < 1) {
// //       showCustomAlert('Invalid Seats', 'Minimum 1 seat required.', 'warning');
// //       return;
// //     }
// //     if (seatsRequested === currentSeatsBooked) {
// //       showCustomAlert('No Change', 'Seat count is already set to this value.', 'info');
// //       return;
// //     }
// //     setModifyingSeats(true);
// //     try {
// //       const response = await fetch(`${API_BASE_URL}/api/v1/modifications/request/${userBooking.id}`, {
// //         method: 'POST',
// //         headers: { 'Content-Type': 'application/json' },
// //         body: JSON.stringify({ requested_seats: seatsRequested }),
// //       });
// //       const data = await response.json();
// //       if (!response.ok) throw new Error(data.detail || data.message);
// //       showCustomAlert('Request Sent', `Request to change to ${seatsRequested} seat(s) sent.`, 'info');
// //       setSeatModificationRequested(true);
// //       setPendingSeatsRequest(seatsRequested);
// //       await fetchModificationRequests();
// //     } catch (error) {
// //       showCustomAlert('Error', error.message, 'error');
// //     } finally {
// //       setModifyingSeats(false);
// //     }
// //   };
  
// //   const handleCancelBooking = async () => {
// //     if (!userBooking || !canCancelBooking()) return;
// //     setModifyingSeats(true);
// //     setCancelLoading(true);
// //     try {
// //       const response = await fetch(`${API_BASE_URL}/booking/${userBooking.id}/cancel`, {
// //         method: 'PUT',
// //         headers: { 'Content-Type': 'application/json' },
// //       });
// //       const data = await response.json();
// //       if (!response.ok) throw new Error(data.detail || data.message);
// //       showCustomAlert('Success', 'Booking cancelled successfully', 'success');
// //       setTimeout(() => navigation.goBack(), 1500);
// //     } catch (error) {
// //       showCustomAlert('Error', error.message, 'error');
// //     } finally {
// //       setModifyingSeats(false);
// //       setCancelLoading(false);
// //       setShowCancelModal(false);
// //     }
// //   };
  
// //   const viewDriverProfile = () => {
// //     const driverPhone = currentRide?.phoneNumber || currentRide?.driver_phone;
// //     const driverUserId = currentRide?.driverUserId || currentRide?.driver_user_id;
// //     if (driverPhone || driverUserId) {
// //       navigation.navigate('ViewProfileScreen', {
// //         userId: driverUserId || null,
// //         phoneNumber: driverPhone || null,
// //         driverName: driverProfile?.full_name || currentRide?.driverName || 'Driver',
// //         profilePicture: getProfilePhotoUrl(),
// //       });
// //     }
// //   };
  
// //   const shareRideDetails = async () => {
// //     const message = `🚗 *Ride Details* 🚗\n\n` +
// //       `From: ${currentRide?.from || currentRide?.origin || 'Pickup'}\n` +
// //       `To: ${currentRide?.to || currentRide?.destination || 'Drop'}\n` +
// //       `Date: ${formatDate(currentRide?.departure_time)}\n` +
// //       `Price: ₹${currentRide?.price || currentRide?.price_per_seat || 0}/seat\n` +
// //       `Seats: ${userBooking?.seats_requested || 1}\n` +
// //       `Total: ₹${(currentRide?.price || currentRide?.price_per_seat || 0) * (userBooking?.seats_requested || 1)}\n\n` +
// //       `Driver: ${driverProfile?.full_name || currentRide?.driverName || 'Driver'}`;
// //     await Share.share({ message, title: 'Ride Details' });
// //   };
  
// //   const handleProfileImagePress = () => {
// //     const photoUrl = getProfilePhotoUrl();
// //     if (photoUrl) {
// //       setSelectedProfile({ visible: true, imageUrl: photoUrl, driverName: driverProfile?.full_name || currentRide?.driverName || 'Driver' });
// //     } else {
// //       showCustomAlert('No Photo', 'Driver has not uploaded a profile picture', 'warning');
// //     }
// //   };
  
// //   const onRefresh = () => {
// //     setRefreshing(true);
// //     Promise.all([
// //       fetchSeatAvailability(),
// //       loadDriverData(),
// //       fetchModificationRequests(),
// //       fetchDriverRatingForRide(),
// //       checkLiveSession(),
// //       checkSessionStatus()
// //     ]).finally(() => setRefreshing(false));
// //   };
  
// //   // Render timeline item
// //   const renderTimelineItem = (item, index) => {
// //     const isLast = index === tripTimeline.length - 1;
// //     const hasWalking = item.walkDistance && item.walkDistance > 0;
// //     const isRiderPoint = item.type === 'pickup' || item.type === 'dropoff';
    
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
// //             {item.order && (
// //               <View style={styles.segmentBadge}>
// //                 <Text style={styles.segmentBadgeText}>Stop {item.order}</Text>
// //               </View>
// //             )}
// //           </View>
          
// //           <Text style={styles.timelineItemTitle}>{item.title}</Text>
          
// //           {isRiderPoint && item.walkDistance && item.walkDistance > 0 && (
// //             <View style={[styles.walkingChip, { backgroundColor: item.color + '15' }]}>
// //               <Ionicons name="walk" size={14} color={item.color} />
// //               <Text style={[styles.walkingChipText, { color: item.color }]}>
// //                 Walk {item.walkDistance}m • ~{item.walkDuration} min
// //               </Text>
// //             </View>
// //           )}
          
// //           <Text style={styles.timelineItemAddress} numberOfLines={2}>
// //             {item.address}
// //           </Text>
          
// //           {item.distanceToNext && item.durationToNext && (
// //             <View style={styles.routeInfo}>
// //               <View style={styles.routeInfoItem}>
// //                 <Ionicons name="navigate-outline" size={12} color="#2457A6" />
// //                 <Text style={styles.routeInfoText}>Next: {item.distanceToNext} km</Text>
// //               </View>
// //               <View style={styles.routeInfoItem}>
// //                 <Ionicons name="time-outline" size={12} color="#F59E0B" />
// //                 <Text style={styles.routeInfoText}>~{formatDuration(item.durationToNext)}</Text>
// //               </View>
// //             </View>
// //           )}
          
// //           {item.cumulativeDistance && (
// //             <View style={styles.cumulativeInfo}>
// //               <Ionicons name="flag-outline" size={12} color="#10B981" />
// //               <Text style={styles.cumulativeInfoText}>
// //                 Total: {item.cumulativeDistance} km • {formatDuration(item.cumulativeDuration)}
// //               </Text>
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
  
// //   // Render map marker
// //   const renderMapMarker = (marker) => {
// //     let size = 36;
// //     switch (marker.type) {
// //       case 'driver-start': size = 42; break;
// //       case 'driver-end': size = 42; break;
// //       case 'driver-live': size = 40; break;
// //       default: size = 38;
// //     }
    
// //     const iconName = marker.icon;
    
// //     return (
// //       <Marker 
// //         key={marker.id} 
// //         coordinate={marker.coordinate} 
// //         title={marker.title} 
// //         description={marker.address}
// //       >
// //         <View style={[styles.mapCustomMarker, { backgroundColor: marker.color, width: size, height: size, borderRadius: size / 2 }]}>
// //           <Ionicons name={iconName} size={size * 0.45} color="#fff" />
// //           {marker.walkDistance && marker.walkDistance > 0 && (
// //             <View style={[styles.mapWalkBadge, { backgroundColor: marker.color }]}>
// //               <Ionicons name="walk" size={10} color="#fff" />
// //               <Text style={styles.mapWalkBadgeText}>{marker.walkDistance}m</Text>
// //             </View>
// //           )}
// //           {marker.type === 'driver-live' && (
// //             <View style={styles.liveRing}>
// //               <View style={styles.liveRingInner} />
// //             </View>
// //           )}
// //         </View>
// //       </Marker>
// //     );
// //   };
  
// //   // Initialize data on component mount
// //   useEffect(() => {
// //     const initializeData = async () => {
// //       if (userBooking?.id) {
// //         try {
// //           const response = await fetch(`${API_BASE_URL}/api/v1/bookings/${userBooking.id}/ride?_t=${Date.now()}`);
// //           const data = await response.json();
// //           if (data.success && data.ride) {
// //             setCurrentRide({
// //               id: data.ride.id,
// //               available_seats: data.ride.available_seats,
// //               price: data.ride.price_per_seat,
// //               from: data.ride.origin,
// //               to: data.ride.destination,
// //               departure_time: data.ride.departure_time,
// //               phoneNumber: data.ride.driver_phone,
// //               driverName: data.ride.driver_name,
// //               driverUserId: data.ride.driver_user_id,
// //               routeCoordinates: data.ride.route_coordinates,
// //               distance_km: data.ride.distance_km,
// //               duration_text: data.ride.duration_text,
// //               status: data.ride.status,
// //               women_only: data.ride.women_only,
// //               rating: data.ride.driver_rating || 4.5,
// //               origin_lat: data.ride.origin_latitude,
// //               origin_lon: data.ride.origin_longitude,
// //               suggestedPickup: data.ride.suggested_pickup_point,
// //               suggestedDrop: data.ride.suggested_drop_point,
// //               started_at: data.ride.started_at,
// //               completed_at: data.ride.completed_at,
// //             });
// //             const totalSeats = data.ride.available_seats || 4;
// //             setTotalSeatsOffered(totalSeats);
// //             setTotalBookedSeats(data.ride.total_booked_seats || userBooking.seats_requested || 1);
// //             setAvailableSeats(totalSeats - (data.ride.total_booked_seats || userBooking.seats_requested || 1));
// //             setUserBooking(prev => ({
// //               ...prev,
// //               id: Number(data.booking.id),
// //               seats_requested: Number(data.booking.seats_requested) || 1,
// //               status: data.booking.status,
// //               total_amount: Number(data.booking.total_amount) || null,
// //               created_at: data.booking.created_at,
// //               pickup_address: data.booking.pickup_address,
// //               dropoff_address: data.booking.dropoff_address,
// //               intersection_pickup_lat: data.booking.intersection_pickup_lat,
// //               intersection_pickup_lon: data.booking.intersection_pickup_lon,
// //               pickup_lat: data.booking.pickup_lat,
// //               pickup_lon: data.booking.pickup_lon,
// //               drop_lat: data.booking.drop_lat,
// //               drop_lon: data.booking.drop_lon,
// //               pickup_walk_distance_m: data.booking.pickup_walk_distance_m,
// //               drop_walk_distance_m: data.booking.drop_walk_distance_m,
// //             }));
// //             await Promise.all([
// //               fetchSeatAvailability(),
// //               loadDriverData(),
// //               fetchModificationRequests(),
// //               fetchDriverRatingForRide(),
// //               checkLiveSession(),
// //               checkSessionStatus()
// //             ]);
// //           }
// //         } catch (error) {
// //           console.log('Error initializing ride data:', error);
// //         }
// //       }
// //     };
// //     initializeData();
// //   }, [userBooking?.id]);
  
// //   useEffect(() => {
// //     if (currentRide) {
// //       loadDriverData();
// //       fetchSeatAvailability();
// //       checkLiveSession();
// //       checkSessionStatus();
// //     }
// //   }, [currentRide]);
  
// //   useFocusEffect(
// //     useCallback(() => {
// //       if (currentRide) {
// //         fetchSeatAvailability();
// //         checkLiveSession();
// //         checkSessionStatus();
// //         fetchModificationRequests();
// //         fetchDriverRatingForRide();
// //       }
// //       hasShownRatingModal.current = false;
// //       return () => {
// //         if (socketRef.current) {
// //           socketRef.current.disconnect();
// //           socketRef.current = null;
// //         }
// //       };
// //     }, [currentRide])
// //   );
  
// //   const profilePhotoUrl = getProfilePhotoUrl();
// //   const avatarText = getDriverInitials(driverProfile?.full_name || currentRide?.driverName || 'Driver');
// //   const isProfilePhotoSvg = profilePhotoUrl?.toLowerCase().includes('.svg');
// //   const allPreferences = useMemo(() => extractAllPreferences(currentRide, driverProfile?.travel_preferences), [currentRide, driverProfile]);
  
// //   const vehicleName = driverProfile?.vehicle?.model || currentRide?.vehicle?.model || 'Vehicle details unavailable';
// //   const vehicleRegNumber = driverProfile?.vehicle?.registration_number || currentRide?.vehicle?.registration_number;
// //   const vehicleColor = driverProfile?.vehicle?.color || currentRide?.vehicle?.color || 'Not specified';
  
// //   const rideStatusInfo = getPassengerRideStatusInfo();
// //   const modificationsAllowed = canModifySeats();
// //   const cancellationsAllowed = canCancelBooking();
// //   const isAutoCancelled = rideStatusInfo.type === 'auto-cancelled';
// //   const isCompleted = rideStatusInfo.type === 'completed';
// //   const isModificationRejected = rideStatusInfo.type === 'modification-rejected';
  
// //   const otherBookedSeats = totalBookedSeats - (userBooking?.seats_requested || 0);
// //   const maxUserCanRequest = totalSeatsOffered - otherBookedSeats;
// //   const totalAmountPaid = (currentRide?.price || currentRide?.price_per_seat || 0) * (userBooking?.seats_requested || 1);
// //   const riderPickupAddress = getRiderPickupLocation(userBooking, currentRide);
// //   const riderDropoffAddress = getRiderDropoffLocation(userBooking, currentRide);
// //   const walkDistances = {
// //     pickupWalk: userBooking?.pickup_walk_distance_m || 0,
// //     dropWalk: userBooking?.drop_walk_distance_m || 0
// //   };
  
// //   const initialRegion = {
// //     latitude: driverLocation?.latitude || driverStart?.latitude || riderPickup?.latitude || 28.6139,
// //     longitude: driverLocation?.longitude || driverStart?.longitude || riderPickup?.longitude || 77.2090,
// //     latitudeDelta: 0.02,
// //     longitudeDelta: 0.02,
// //   };
  
// //   if (!currentRide) {
// //     return (
// //       <View style={styles.loaderContainer}>
// //         <Text style={{ fontSize: 16, color: Colors.gray, marginBottom: 20 }}>No ride data available</Text>
// //         <TouchableOpacity onPress={() => navigation.goBack()} style={{ padding: 12, backgroundColor: Colors.primary, borderRadius: 8 }}>
// //           <Text style={{ color: '#fff' }}>Go Back</Text>
// //         </TouchableOpacity>
// //       </View>
// //     );
// //   }
  
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
// //           showsUserLocation={true}
// //           showsMyLocationButton={true}
// //         >
// //           {/* Main route path */}
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
          
// //           {/* Walking paths */}
// //           {walkingPaths.map(path => (
// //             <Polyline
// //               key={path.id}
// //               coordinates={path.coordinates}
// //               strokeColor={path.color}
// //               strokeWidth={3}
// //               lineDashPattern={path.lineDash}
// //               lineCap="round"
// //               lineJoin="round"
// //             />
// //           ))}
          
// //           {/* Proximity circles */}
// //           {userBooking?.pickup_walk_distance_m > 0 && riderPickup && (
// //             <Circle
// //               center={riderPickup}
// //               radius={userBooking.pickup_walk_distance_m}
// //               strokeColor="rgba(16, 185, 129, 0.3)"
// //               fillColor="rgba(16, 185, 129, 0.1)"
// //               strokeWidth={1}
// //             />
// //           )}
          
// //           {/* All markers */}
// //           {allMapMarkers.map(marker => renderMapMarker(marker))}
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
// //             <View style={[styles.legendDot, { backgroundColor: '#10B981' }]} />
// //             <Text style={styles.legendText}>Your Pickup</Text>
// //           </View>
// //           <View style={styles.legendItem}>
// //             <View style={[styles.legendDot, { backgroundColor: '#F59E0B' }]} />
// //             <Text style={styles.legendText}>Your Dropoff</Text>
// //           </View>
// //           <View style={styles.legendItem}>
// //             <View style={[styles.legendDot, { backgroundColor: '#2457A6' }]} />
// //             <Text style={styles.legendText}>Driver Location</Text>
// //           </View>
// //         </View>
        
// //         {/* Map Controls */}
// //         <View style={styles.mapControls}>
// //           <TouchableOpacity style={styles.mapControlButton} onPress={() => fitMapToMarkers()}>
// //             <Ionicons name="map-outline" size={20} color="#2457A6" />
// //           </TouchableOpacity>
// //         </View>
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
// //                 <View style={styles.collapsedStatusRow}>
// //                   <View style={[styles.collapsedStatusBadge, { backgroundColor: rideStatusInfo.color + '20' }]}>
// //                     <Ionicons name={rideStatusInfo.icon} size={10} color={rideStatusInfo.color} />
// //                     <Text style={[styles.collapsedStatusText, { color: rideStatusInfo.color }]}>{rideStatusInfo.text}</Text>
// //                   </View>
// //                 </View>
// //                 <Text style={styles.collapsedDriver} numberOfLines={1}>{driverProfile?.full_name || currentRide?.driverName || 'Driver'}</Text>
// //                 <Text style={styles.collapsedSub} numberOfLines={1}>{currentRide?.from || currentRide?.origin || 'Pickup'} → {currentRide?.to || currentRide?.destination || 'Drop'}</Text>
// //               </View>
// //               <View style={styles.collapsedPriceWrap}>
// //                 <Text style={styles.collapsedPrice}>₹{currentRide?.price || currentRide?.price_per_seat || 0}</Text>
// //                 <Text style={styles.collapsedPerSeat}>per seat</Text>
// //               </View>
// //             </View>
// //             {tripTimeline.length > 0 && tripTimeline[0]?.totalDistance && (
// //               <View style={styles.collapsedTripInfo}>
// //                 <Text style={styles.collapsedTripText}>
// //                   📍 {tripTimeline.length} stops • {tripTimeline[0].totalDistance} km • {formatDuration(tripTimeline[0].totalDuration)}
// //                 </Text>
// //               </View>
// //             )}
// //           </View>
// //         ) : (
// //           <ScrollView 
// //             style={styles.drawerScroll} 
// //             contentContainerStyle={styles.drawerContent}
// //             refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
// //             showsVerticalScrollIndicator={false}
// //           >
// //             {/* Ride Status Banner with Reason */}
// //             <View style={[styles.statusBanner, { backgroundColor: rideStatusInfo.color + '20' }]}>
// //               <Ionicons name={rideStatusInfo.icon} size={22} color={rideStatusInfo.color} />
// //               <View style={styles.statusBannerTextContainer}>
// //                 <Text style={[styles.statusBannerTitle, { color: rideStatusInfo.color }]}>{rideStatusInfo.text}</Text>
// //                 {rideStatusInfo.reason && (
// //                   <Text style={styles.statusBannerSubtitle}>{rideStatusInfo.reason}</Text>
// //                 )}
// //                 {rideStatusInfo.type === 'driver-late' && !rideStatusInfo.reason && (
// //                   <Text style={styles.statusBannerSubtitle}>The driver is running late. The ride should start soon.</Text>
// //                 )}
// //                 {rideStatusInfo.type === 'start-soon' && !rideStatusInfo.reason && (
// //                   <Text style={styles.statusBannerSubtitle}>Be ready at your pickup location!</Text>
// //                 )}
// //                 {rideStatusInfo.type === 'ongoing' && (
// //                   <Text style={styles.statusBannerSubtitle}>Your ride is in progress.</Text>
// //                 )}
// //                 {rideStatusInfo.type === 'completed' && (
// //                   <Text style={styles.statusBannerSubtitle}>Thank you for riding with us!</Text>
// //                 )}
// //               </View>
// //             </View>
            
// //             {/* Modification Rejected Banner */}
// //             {isModificationRejected && userBooking?.modification_request && (
// //               <View style={styles.modificationRejectedBanner}>
// //                 <Ionicons name="close-circle" size={24} color="#DC2626" />
// //                 <View style={{ flex: 1 }}>
// //                   <Text style={styles.modificationRejectedTitle}>Booking Cancelled</Text>
// //                   <Text style={styles.modificationRejectedText}>
// //                     Your request to change from {userBooking.modification_request.current_seats} to {userBooking.modification_request.requested_seats} seats was rejected.
// //                   </Text>
// //                   {userBooking.modification_request.rejection_reason && (
// //                     <Text style={styles.modificationRejectedReason}>
// //                       Reason: {userBooking.modification_request.rejection_reason}
// //                     </Text>
// //                   )}
// //                   <Text style={styles.modificationRejectedNote}>
// //                     Your original booking has been cancelled and seats have been released.
// //                   </Text>
// //                 </View>
// //               </View>
// //             )}
            
// //             {/* Driver Card */}
// //             <View style={styles.driverCard}>
// //               <View style={styles.driverTopRow}>
// //                 <View style={styles.driverLeftWrap}>
// //                   <TouchableOpacity style={styles.driverAvatar} onPress={handleProfileImagePress}>
// //                     {profilePhotoUrl ? (
// //                       isProfilePhotoSvg ? (
// //                         <View style={styles.svgAvatarContainer}><SvgCssUri uri={profilePhotoUrl} width={56} height={56} /></View>
// //                       ) : (
// //                         <Image source={{ uri: profilePhotoUrl }} style={styles.avatarImg} />
// //                       )
// //                     ) : (
// //                       <View style={styles.avatarPlaceholder}>
// //                         <Text style={styles.avatarText}>{avatarText}</Text>
// //                       </View>
// //                     )}
// //                   </TouchableOpacity>
// //                   <View style={styles.driverMeta}>
// //                     <View style={styles.driverNameRow}>
// //                       <Text style={styles.driverName}>{driverProfile?.full_name || currentRide?.driverName || 'Driver'}</Text>
// //                       {isVerified && <Ionicons name="checkmark-circle" size={14} color="#2457A6" />}
// //                     </View>
// //                     <View style={styles.ratingRow}>
// //                       <Ionicons name="star" size={13} color="#F59E0B" />
// //                       <Text style={styles.ratingText}>{driverProfile?.avg_rating || currentRide?.rating || 4.5}</Text>
// //                     </View>
// //                   </View>
// //                 </View>
// //                 {!isModificationRejected && (
// //                   <TouchableOpacity style={styles.chatButton} onPress={handleChatWithDriver}>
// //                     <Ionicons name="chatbubble-ellipses" size={22} color="#2457A6" />
// //                   </TouchableOpacity>
// //                 )}
// //               </View>
              
// //               {!isModificationRejected && (
// //                 <View style={styles.actionButtonsRow}>
// //                   <TouchableOpacity style={styles.profileOutlineBtn} onPress={viewDriverProfile}>
// //                     <Text style={styles.profileOutlineBtnText}>View Full Profile</Text>
// //                   </TouchableOpacity>
// //                   <TouchableOpacity style={styles.shareOutlineBtn} onPress={shareRideDetails}>
// //                     <Ionicons name="share-outline" size={18} color="#2457A6" />
// //                     <Text style={styles.shareOutlineBtnText}>Share</Text>
// //                   </TouchableOpacity>
// //                 </View>
// //               )}
// //             </View>
            
// //             {/* Driver's Rating for This Ride */}
// //             {showDriverRating && driverRating && !isModificationRejected && (
// //               <View style={styles.driverRatingCard}>
// //                 <View style={styles.driverRatingHeader}>
// //                   <Ionicons name="star" size={18} color="#F59E0B" />
// //                   <Text style={styles.driverRatingTitle}>Driver's Rating for this Ride</Text>
// //                 </View>
// //                 <View style={styles.driverRatingContent}>
// //                   <RatingStars rating={driverRating} size={20} />
// //                   {driverFeedbackText ? (
// //                     <Text style={styles.driverFeedbackText}>"{driverFeedbackText}"</Text>
// //                   ) : (
// //                     <Text style={styles.driverFeedbackPlaceholder}>No feedback provided</Text>
// //                   )}
// //                 </View>
// //               </View>
// //             )}
            
// //             {/* Trip Timeline Section */}
// //             {tripTimeline.length > 0 && (
// //               <View style={styles.cardSection}>
// //                 <TouchableOpacity 
// //                   style={styles.timelineHeader} 
// //                   onPress={() => setTimelineExpanded(!timelineExpanded)}
// //                 >
// //                   <View style={styles.timelineHeaderLeft}>
// //                     <Ionicons name="map-outline" size={20} color="#2457A6" />
// //                     <Text style={styles.sectionTitle}>Your Trip Timeline</Text>
// //                     <Text style={styles.timelineStopCount}>({tripTimeline.length} stops)</Text>
// //                   </View>
// //                   <Ionicons 
// //                     name={timelineExpanded ? "chevron-up" : "chevron-down"} 
// //                     size={20} 
// //                     color={Colors.gray} 
// //                   />
// //                 </TouchableOpacity>
                
// //                 {timelineExpanded && (
// //                   <View style={styles.timelineContainer}>
// //                     {tripTimeline.map((item, index) => renderTimelineItem(item, index))}
// //                   </View>
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
// //                   <Text style={styles.tripOverviewValue}>{riderPickupAddress}</Text>
// //                   {walkDistances.pickupWalk > 0 && (
// //                     <Text style={styles.walkDistanceText}>🚶 {walkDistances.pickupWalk}m walk to pickup</Text>
// //                   )}
// //                 </View>
// //                 <View style={styles.tripOverviewArrow}>
// //                   <Ionicons name="arrow-down-outline" size={16} color="#2457A6" />
// //                 </View>
// //                 <View style={styles.tripOverviewItem}>
// //                   <Text style={styles.tripOverviewLabel}>To</Text>
// //                   <Text style={styles.tripOverviewValue}>{riderDropoffAddress}</Text>
// //                   {walkDistances.dropWalk > 0 && (
// //                     <Text style={styles.walkDistanceText}>🚶 {walkDistances.dropWalk}m walk from dropoff</Text>
// //                   )}
// //                 </View>
// //               </View>
// //               <View style={styles.tripOverviewStats}>
// //                 <View style={styles.tripOverviewStat}>
// //                   <Ionicons name="calendar-outline" size={16} color="#6B7280" />
// //                   <Text style={styles.tripOverviewStatText}>{formatDate(currentRide?.departure_time)}</Text>
// //                 </View>
// //                 {currentRide?.distance_km && (
// //                   <View style={styles.tripOverviewStat}>
// //                     <Ionicons name="map-outline" size={16} color="#6B7280" />
// //                     <Text style={styles.tripOverviewStatText}>{currentRide.distance_km} km</Text>
// //                   </View>
// //                 )}
// //                 {currentRide?.duration_text && (
// //                   <View style={styles.tripOverviewStat}>
// //                     <Ionicons name="time-outline" size={16} color="#6B7280" />
// //                     <Text style={styles.tripOverviewStatText}>{currentRide.duration_text}</Text>
// //                   </View>
// //                 )}
// //               </View>
// //             </View>
            
// //             {/* Vehicle Details */}
// //             <View style={styles.cardSection}>
// //               <Text style={styles.sectionTitle}>🚗 Vehicle Details</Text>
// //               <View style={styles.vehicleDetailRow}>
// //                 <Ionicons name="car-sport-outline" size={24} color="#2457A6" />
// //                 <View style={styles.vehicleDetailInfo}>
// //                   <Text style={styles.vehicleDetailName}>{vehicleName}</Text>
// //                   <Text style={styles.vehicleDetailColor}>Color: {vehicleColor}</Text>
// //                   {vehicleRegNumber && <Text style={styles.vehicleDetailReg}>Registration: {vehicleRegNumber}</Text>}
// //                   <Text style={styles.vehicleDetailSeats}>Total Seats: {totalSeatsOffered}</Text>
// //                 </View>
// //               </View>
// //             </View>
            
// //             {/* Seat Availability */}
// //             <View style={styles.cardSection}>
// //               <Text style={styles.sectionTitle}>💺 Seat Availability</Text>
// //               <View style={styles.seatStatsRow}>
// //                 <View style={styles.seatStat}>
// //                   <Text style={styles.seatStatValue}>{totalSeatsOffered}</Text>
// //                   <Text style={styles.seatStatLabel}>Total Seats</Text>
// //                 </View>
// //                 <View style={styles.seatStat}>
// //                   <Text style={[styles.seatStatValue, { color: '#10B981' }]}>{totalBookedSeats}</Text>
// //                   <Text style={styles.seatStatLabel}>Booked</Text>
// //                 </View>
// //                 <View style={styles.seatStat}>
// //                   <Text style={[styles.seatStatValue, { color: '#F59E0B' }]}>{availableSeats}</Text>
// //                   <Text style={styles.seatStatLabel}>Available</Text>
// //                 </View>
// //               </View>
// //               <View style={styles.seatProgressContainer}>
// //                 <View style={[styles.seatProgressBar, { width: `${totalSeatsOffered > 0 ? (totalBookedSeats / totalSeatsOffered) * 100 : 0}%` }]} />
// //               </View>
// //             </View>
            
// //             {/* Ride Preferences */}
// //             {allPreferences.length > 0 && (
// //               <View style={styles.cardSection}>
// //                 <Text style={styles.sectionTitle}>🎯 Ride Preferences</Text>
// //                 <View style={styles.tagRow}>
// //                   {allPreferences.map((pref, index) => {
// //                     const isActive = !pref.includes(':') && 
// //                       !pref.toLowerCase().includes('not') &&
// //                       !pref.toLowerCase().includes('no');
// //                     return (
// //                       <PreferenceTag key={`${pref}-${index}`} label={pref} isActive={isActive} />
// //                     );
// //                   })}
// //                 </View>
// //               </View>
// //             )}
            
// //             {/* Booking Details */}
// //             <View style={styles.cardSection}>
// //               <Text style={styles.sectionTitle}>📋 Your Booking</Text>
              
// //               {userBooking ? (
// //                 <>
// //                   <View style={styles.bookingDetailRow}>
// //                     <Text style={styles.bookingDetailLabel}>Booking ID</Text>
// //                     <Text style={styles.bookingDetailValue}>#{userBooking.id}</Text>
// //                   </View>
// //                   <View style={styles.bookingDetailRow}>
// //                     <Text style={styles.bookingDetailLabel}>Seats Booked</Text>
// //                     <Text style={[styles.bookingDetailValue, isModificationRejected && styles.strikethroughText]}>
// //                       {userBooking.seats_requested}
// //                     </Text>
// //                   </View>
// //                   <View style={styles.bookingDetailRow}>
// //                     <Text style={styles.bookingDetailLabel}>Price per Seat</Text>
// //                     <Text style={[styles.bookingDetailValue, isModificationRejected && styles.strikethroughText]}>
// //                       ₹{currentRide?.price || currentRide?.price_per_seat || 0}
// //                     </Text>
// //                   </View>
// //                   <View style={[styles.bookingDetailRow, styles.bookingTotalRow]}>
// //                     <Text style={styles.bookingTotalLabel}>Total Amount</Text>
// //                     <Text style={[styles.bookingTotalValue, isModificationRejected && styles.strikethroughText]}>
// //                       ₹{totalAmountPaid}
// //                     </Text>
// //                   </View>
// //                   <View style={styles.bookingDetailRow}>
// //                     <Text style={styles.bookingDetailLabel}>Status</Text>
// //                     <View style={[styles.bookingStatusBadge, { backgroundColor: isModificationRejected ? '#FEE2E2' : (userBooking.status === 'accepted' ? '#10B98120' : userBooking.status === 'pending' ? '#F59E0B20' : '#EF444420') }]}>
// //                       <Text style={[styles.bookingStatusText, { color: isModificationRejected ? '#DC2626' : (userBooking.status === 'accepted' ? '#10B981' : userBooking.status === 'pending' ? '#F59E0B' : '#EF4444') }]}>
// //                         {isModificationRejected ? 'Booking Cancelled' : (userBooking.status === 'accepted' ? 'Confirmed' : userBooking.status === 'pending' ? 'Pending' : userBooking.status)}
// //                       </Text>
// //                     </View>
// //                   </View>
// //                 </>
// //               ) : (
// //                 <Text style={styles.emptyText}>No booking information available</Text>
// //               )}
              
// //               {/* Pending Modification Request */}
// //               {pendingModificationRequest && pendingModificationRequest.status === 'pending' && !isModificationRejected && (
// //                 <>
// //                   <View style={styles.divider} />
// //                   <View style={styles.pendingModificationHeader}>
// //                     <Ionicons name="time-outline" size={24} color="#F59E0B" />
// //                     <Text style={styles.pendingModificationTitle}>Pending Modification Request</Text>
// //                   </View>
// //                   <View style={styles.pendingModificationDetails}>
// //                     <View style={styles.modificationDetailRow}>
// //                       <Text style={styles.modificationDetailLabel}>Current Seats:</Text>
// //                       <Text style={styles.modificationDetailValue}>{pendingModificationRequest.current_seats || userBooking?.seats_requested}</Text>
// //                     </View>
// //                     <View style={styles.modificationDetailRow}>
// //                       <Text style={styles.modificationDetailLabel}>Requested Seats:</Text>
// //                       <Text style={[styles.modificationDetailValue, { color: '#F59E0B', fontWeight: '800' }]}>
// //                         {pendingModificationRequest.requested_seats || pendingSeatsRequest}
// //                       </Text>
// //                     </View>
// //                     <View style={styles.modificationDetailRow}>
// //                       <Text style={styles.modificationDetailLabel}>Status:</Text>
// //                       <View style={[styles.pendingBadge, { backgroundColor: '#FEF3C7' }]}>
// //                         <Text style={[styles.pendingBadgeText, { color: '#D97706' }]}>Waiting for Driver Approval</Text>
// //                       </View>
// //                     </View>
// //                     {pendingModificationRequest.created_at && (
// //                       <Text style={styles.modificationDate}>
// //                         Requested on: {new Date(pendingModificationRequest.created_at).toLocaleString()}
// //                       </Text>
// //                     )}
// //                   </View>
// //                   <TouchableOpacity 
// //                     style={styles.cancelModificationBtn}
// //                     onPress={handleCancelModificationRequest}
// //                     disabled={modifyingSeats}
// //                   >
// //                     <Text style={styles.cancelModificationBtnText}>
// //                       {modifyingSeats ? 'Cancelling...' : 'Cancel Request'}
// //                     </Text>
// //                   </TouchableOpacity>
// //                 </>
// //               )}
              
// //               {/* Modify Seats */}
// //               {modificationsAllowed && userBooking?.status === "accepted" && !isAutoCancelled && totalSeatsOffered > 0 && !seatModificationRequested && rideStatusInfo.type !== 'ongoing' && rideStatusInfo.type !== 'completed' && !isModificationRejected && (
// //                 <>
// //                   <View style={styles.divider} />
// //                   <Text style={styles.sectionSubtitle}>Modify Seats</Text>
// //                   {otherBookedSeats > 0 && (
// //                     <View style={styles.otherBookedInfo}>
// //                       <Ionicons name="information-circle" size={14} color="#F59E0B" />
// //                       <Text style={styles.otherBookedInfoText}>{otherBookedSeats} seat(s) booked by others</Text>
// //                     </View>
// //                   )}
// //                   <View style={styles.seatSelectorRow}>
// //                     <TouchableOpacity style={[styles.seatActionBtn, seatsRequested === 1 && styles.seatActionBtnDisabled]} onPress={() => setSeatsRequested(Math.max(1, seatsRequested - 1))} disabled={seatsRequested === 1 || modifyingSeats}>
// //                       <Ionicons name="remove" size={20} color={seatsRequested === 1 ? Colors.gray : Colors.dark} />
// //                     </TouchableOpacity>
// //                     <View style={styles.seatCountWrap}>
// //                       <Text style={styles.seatCountText}>{seatsRequested}</Text>
// //                       <Text style={styles.seatAvailableText}>/ {maxUserCanRequest} max</Text>
// //                     </View>
// //                     <TouchableOpacity style={[styles.seatActionBtn, seatsRequested >= maxUserCanRequest && styles.seatActionBtnDisabled]} onPress={() => setSeatsRequested(Math.min(maxUserCanRequest, seatsRequested + 1))} disabled={seatsRequested >= maxUserCanRequest || modifyingSeats}>
// //                       <Ionicons name="add" size={20} color={seatsRequested >= maxUserCanRequest ? Colors.gray : "#2457A6"} />
// //                     </TouchableOpacity>
// //                   </View>
// //                   <TouchableOpacity style={[styles.updateSeatsBtn, (modifyingSeats || seatsRequested === userBooking?.seats_requested) && styles.updateSeatsBtnDisabled]} onPress={handleModifySeats} disabled={modifyingSeats || seatsRequested === userBooking?.seats_requested}>
// //                     <Text style={styles.updateSeatsBtnText}>{modifyingSeats ? 'Sending...' : 'Request Seat Change'}</Text>
// //                   </TouchableOpacity>
// //                 </>
// //               )}
              
// //               {/* Cancel Booking */}
// //               {cancellationsAllowed && userBooking?.status !== "rejected" && !isAutoCancelled && rideStatusInfo.type !== 'ongoing' && rideStatusInfo.type !== 'completed' && !isModificationRejected && (
// //                 <TouchableOpacity style={[styles.cancelBookingBtn, (modifyingSeats || cancelLoading) && styles.cancelBookingBtnDisabled]} onPress={() => setShowCancelModal(true)} disabled={modifyingSeats || cancelLoading}>
// //                   <Text style={styles.cancelBookingBtnText}>{userBooking?.status === "pending" ? "Cancel Request" : "Cancel Booking"}</Text>
// //                 </TouchableOpacity>
// //               )}
// //             </View>
            
// //             {/* Other Riders */}
// //             <View style={styles.cardSection}>
// //               <Text style={styles.sectionTitle}>👥 Other Riders ({otherRiders.length})</Text>
// //               {otherRiders.length === 0 ? (
// //                 <View style={styles.noRidersContainer}>
// //                   <Ionicons name="people-outline" size={40} color={Colors.gray} />
// //                   <Text style={styles.noRidersText}>No other riders yet</Text>
// //                 </View>
// //               ) : (
// //                 otherRiders.map((rider, index) => (
// //                   <View key={rider.booking_id || index} style={styles.otherRiderItem}>
// //                     <View style={styles.otherRiderAvatar}>
// //                       {rider.profile_picture ? (
// //                         <Image source={{ uri: buildImageUrl(rider.profile_picture) }} style={styles.otherRiderAvatarImg} />
// //                       ) : (
// //                         <View style={styles.otherRiderAvatarPlaceholder}>
// //                           <Text style={styles.otherRiderAvatarText}>{getDriverInitials(rider.passenger_name)}</Text>
// //                         </View>
// //                       )}
// //                     </View>
// //                     <View style={styles.otherRiderInfo}>
// //                       <Text style={styles.otherRiderName}>{rider.passenger_name || 'Rider'}</Text>
// //                       <Text style={styles.otherRiderSeats}>{rider.seats_booked || 1} seat(s)</Text>
// //                     </View>
// //                   </View>
// //                 ))
// //               )}
// //             </View>
            
// //             {/* Safety Card */}
// //             <View style={styles.safetyCard}>
// //               <Ionicons name="shield-checkmark-outline" size={18} color="#2457A6" />
// //               <View>
// //                 <Text style={styles.safetyTitle}>Safety First</Text>
// //                 <Text style={styles.safetySub}>Live GPS tracking & 24/7 support available</Text>
// //               </View>
// //             </View>
            
// //             <View style={{ height: 40 }} />
// //           </ScrollView>
// //         )}
// //       </Animated.View>
      
// //       {/* Cancel Modal */}
// //       <Modal visible={showCancelModal} transparent animationType="fade" onRequestClose={() => setShowCancelModal(false)}>
// //         <View style={styles.modalBackdrop}>
// //           <View style={styles.confirmModalContent}>
// //             <Ionicons name="alert-circle" size={40} color="#F59E0B" />
// //             <Text style={styles.confirmModalTitle}>{userBooking?.status === "pending" ? "Cancel Request?" : "Cancel Booking?"}</Text>
// //             <Text style={styles.confirmModalMessage}>
// //               {userBooking?.status === "pending" 
// //                 ? "Are you sure you want to cancel your booking request?"
// //                 : "Are you sure you want to cancel your booking? This cannot be undone."}
// //             </Text>
// //             <View style={styles.confirmModalButtons}>
// //               <TouchableOpacity style={[styles.confirmModalBtn, styles.confirmModalCancelBtn]} onPress={() => setShowCancelModal(false)}>
// //                 <Text style={styles.confirmModalCancelBtnText}>Keep</Text>
// //               </TouchableOpacity>
// //               <TouchableOpacity style={[styles.confirmModalBtn, styles.confirmModalConfirmBtn]} onPress={handleCancelBooking}>
// //                 <Text style={styles.confirmModalConfirmBtnText}>Cancel</Text>
// //               </TouchableOpacity>
// //             </View>
// //           </View>
// //         </View>
// //       </Modal>
      
// //       {/* Rating Modal */}
// //       <Modal visible={ratingModalVisible} transparent animationType="fade" onRequestClose={() => setRatingModalVisible(false)}>
// //         <View style={styles.modalBackdrop}>
// //           <View style={styles.modalCard}>
// //             <Text style={styles.modalTitle}>Rate Your Driver</Text>
// //             <Text style={styles.modalSub}>How was your ride with {driverProfile?.full_name?.split(' ')[0] || 'the driver'}?</Text>
// //             <RatingStars rating={rating} size={32} onPress={setRating} />
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
// //               <TouchableOpacity style={[styles.submitBtn, (rating === 0 || submitting) && { opacity: 0.5 }]} onPress={handleRateDriver} disabled={rating === 0 || submitting}>
// //                 <Text style={styles.submitBtnText}>{submitting ? 'Submitting...' : 'Submit Rating'}</Text>
// //               </TouchableOpacity>
// //             </View>
// //           </View>
// //         </View>
// //       </Modal>
      
// //       <ProfileImageModal visible={selectedProfile.visible} imageUrl={selectedProfile.imageUrl} driverName={selectedProfile.driverName} onClose={() => setSelectedProfile({ visible: false, imageUrl: null, driverName: '' })} />
// //       <CustomAlert visible={alertVisible} title={alertConfig.title} message={alertConfig.message} icon={alertConfig.icon} iconColor={alertConfig.iconColor} buttons={alertConfig.buttons} onBackdropPress={() => setAlertVisible(false)} />
// //     </View>
// //   );
// // }

// // // ============================================
// // // STYLES
// // // ============================================

// // const styles = StyleSheet.create({
// //   container: { flex: 1, backgroundColor: '#F4F5F7' },
// //   mapContainer: { width: '100%', overflow: 'hidden', backgroundColor: '#E8EEF7', position: 'relative' },
// //   map: { flex: 1, backgroundColor: '#E8EEF7' },
// //   mapBackButton: { position: 'absolute', top: Platform.OS === 'ios' ? 54 : 22, left: 14, width: 42, height: 42, borderRadius: 25, backgroundColor: 'rgba(255,255,255,0.96)', alignItems: 'center', justifyContent: 'center', shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4, elevation: 3 },
  
// //   // Map Legend
// //   mapLegend: { position: 'absolute', bottom: 10, right: 10, backgroundColor: 'rgba(255,255,255,0.95)', borderRadius: 12, padding: 10, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4, elevation: 3, minWidth: 120 },
// //   legendTitle: { marginBottom: 6, paddingBottom: 4, borderBottomWidth: 1, borderBottomColor: '#E5E7EB' },
// //   legendTitleText: { fontSize: 11, fontWeight: '700', color: '#333' },
// //   legendItem: { flexDirection: 'row', alignItems: 'center', marginBottom: 4 },
// //   legendColor: { width: 16, height: 4, borderRadius: 2, marginRight: 6 },
// //   legendDot: { width: 10, height: 10, borderRadius: 5, marginRight: 8 },
// //   legendText: { fontSize: 10, color: '#555' },
// //   mapControls: { position: 'absolute', bottom: 10, left: 10 },
// //   mapControlButton: { backgroundColor: 'rgba(255,255,255,0.95)', width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center', shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4, elevation: 3 },
// //   mapCustomMarker: { alignItems: 'center', justifyContent: 'center', borderWidth: 2, borderColor: '#fff', shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.25, shadowRadius: 4, elevation: 5, position: 'relative' },
// //   mapWalkBadge: { position: 'absolute', bottom: -8, left: '50%', transform: [{ translateX: -15 }], flexDirection: 'row', alignItems: 'center', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 10, gap: 2 },
// //   mapWalkBadgeText: { fontSize: 8, color: '#fff', fontWeight: 'bold' },
// //   liveRing: { position: 'absolute', width: 50, height: 50, borderRadius: 25, backgroundColor: 'rgba(36,87,166,0.2)', borderWidth: 1, borderColor: '#2457A6', top: -5, left: -5 },
// //   liveRingInner: { width: '100%', height: '100%', borderRadius: 25, backgroundColor: 'transparent' },
  
// //   // Drawer
// //   drawer: { position: 'absolute', bottom: 0, left: 0, right: 0, backgroundColor: '#F4F5F7', borderTopLeftRadius: 28, borderTopRightRadius: 28, overflow: 'hidden', shadowColor: '#000', shadowOffset: { width: 0, height: -2 }, shadowOpacity: 0.1, shadowRadius: 8, elevation: 10 },
// //   handleWrap: { alignItems: 'center', paddingTop: 10, paddingBottom: 8, backgroundColor: '#F4F5F7', position: 'relative' },
// //   handleHitArea: { paddingHorizontal: 40, paddingVertical: 10, alignItems: 'center', justifyContent: 'center' },
// //   handleBar: { width: 64, height: 6, borderRadius: 99, backgroundColor: '#CDD2D8' },
// //   collapsedSummary: { paddingHorizontal: 16, paddingTop: 4, paddingBottom: 12 },
// //   collapsedTopRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12 },
// //   collapsedStatusRow: { marginBottom: 6 },
// //   collapsedStatusBadge: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 8, paddingVertical: 3, borderRadius: 12, gap: 4, alignSelf: 'flex-start' },
// //   collapsedStatusText: { fontSize: 10, fontWeight: '600' },
// //   collapsedDriver: { fontSize: 16, fontWeight: '800', color: Colors.dark },
// //   collapsedSub: { marginTop: 2, fontSize: 12, color: Colors.gray, fontWeight: '600' },
// //   collapsedPriceWrap: { alignItems: 'flex-end' },
// //   collapsedPrice: { fontSize: 18, fontWeight: '900', color: Colors.dark },
// //   collapsedPerSeat: { fontSize: 10, color: Colors.gray, fontWeight: '600' },
// //   collapsedTripInfo: { marginTop: 6, paddingTop: 6, borderTopWidth: 1, borderTopColor: '#EEF2F7' },
// //   collapsedTripText: { fontSize: 11, color: '#6B7280' },
// //   drawerScroll: { flex: 1 },
// //   drawerContent: { paddingHorizontal: 16, paddingBottom: 16 },
  
// //   // Status Banner
// //   statusBanner: { flexDirection: 'row', alignItems: 'flex-start', padding: 14, borderRadius: 16, marginBottom: 14, gap: 12 },
// //   statusBannerTextContainer: { flex: 1 },
// //   statusBannerTitle: { fontSize: 16, fontWeight: '800' },
// //   statusBannerSubtitle: { fontSize: 12, color: '#6B7280', marginTop: 4 },
  
// //   // Modification Rejected Banner
// //   modificationRejectedBanner: { flexDirection: 'row', alignItems: 'flex-start', backgroundColor: '#FEF2F2', padding: 14, borderRadius: 16, marginBottom: 14, gap: 12, borderWidth: 1, borderColor: '#FEE2E2' },
// //   modificationRejectedTitle: { fontSize: 14, fontWeight: '700', color: '#DC2626', marginBottom: 4 },
// //   modificationRejectedText: { fontSize: 12, color: '#991B1B', marginBottom: 2 },
// //   modificationRejectedReason: { fontSize: 11, color: '#DC2626', fontStyle: 'italic', marginTop: 4 },
// //   modificationRejectedNote: { fontSize: 11, color: '#6B7280', marginTop: 6 },
  
// //   // Driver Card
// //   driverCard: { backgroundColor: 'white', borderRadius: 20, padding: 16, marginBottom: 14, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 8, elevation: 2 },
// //   driverTopRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
// //   driverLeftWrap: { flexDirection: 'row', flex: 1, paddingRight: 10 },
// //   driverAvatar: { width: 56, height: 56, borderRadius: 28, backgroundColor: '#E5E7EB', overflow: 'hidden', alignItems: 'center', justifyContent: 'center', marginRight: 12 },
// //   avatarImg: { width: 56, height: 56, borderRadius: 28, resizeMode: 'cover' },
// //   avatarText: { fontSize: 15, fontWeight: '800', color: Colors.gray },
// //   avatarPlaceholder: { width: 56, height: 56, borderRadius: 28, backgroundColor: '#E5E7EB', alignItems: 'center', justifyContent: 'center' },
// //   svgAvatarContainer: { width: 56, height: 56, borderRadius: 28, overflow: 'hidden', alignItems: 'center', justifyContent: 'center', backgroundColor: '#E5E7EB' },
// //   driverMeta: { flex: 1 },
// //   driverNameRow: { flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap', gap: 6 },
// //   driverName: { fontSize: 17, fontWeight: '800', color: Colors.dark },
// //   ratingRow: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 6 },
// //   ratingText: { fontSize: 13, color: Colors.dark, fontWeight: '700' },
// //   chatButton: { width: 44, height: 44, borderRadius: 22, backgroundColor: '#E8F0FE', alignItems: 'center', justifyContent: 'center' },
// //   actionButtonsRow: { flexDirection: 'row', gap: 12, marginTop: 14 },
// //   profileOutlineBtn: { flex: 2, borderWidth: 1, borderColor: '#2457A6', borderRadius: 16, paddingVertical: 12, alignItems: 'center' },
// //   profileOutlineBtnText: { color: '#2457A6', fontWeight: '700', fontSize: 14 },
// //   shareOutlineBtn: { flex: 1, borderWidth: 1, borderColor: '#2457A6', borderRadius: 16, paddingVertical: 12, alignItems: 'center', flexDirection: 'row', justifyContent: 'center', gap: 6 },
// //   shareOutlineBtnText: { color: '#2457A6', fontWeight: '700', fontSize: 14 },
  
// //   // Driver Rating Card
// //   driverRatingCard: { backgroundColor: '#FFFBEB', borderRadius: 16, padding: 14, marginBottom: 14, borderWidth: 1, borderColor: '#FDE68A' },
// //   driverRatingHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 10 },
// //   driverRatingTitle: { fontSize: 13, fontWeight: '600', color: '#92400E' },
// //   driverRatingContent: { alignItems: 'center', gap: 8 },
// //   driverFeedbackText: { fontSize: 13, color: '#78350F', fontStyle: 'italic', textAlign: 'center' },
// //   driverFeedbackPlaceholder: { fontSize: 12, color: '#B45309', opacity: 0.7, fontStyle: 'italic' },
  
// //   // Card Sections
// //   cardSection: { backgroundColor: 'white', borderRadius: 20, padding: 16, marginBottom: 14, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 8, elevation: 2 },
// //   sectionTitle: { fontSize: 16, fontWeight: '800', color: Colors.dark, marginBottom: 0 },
// //   sectionSubtitle: { fontSize: 14, fontWeight: '600', color: Colors.dark, marginBottom: 12, marginTop: 8 },
  
// //   // Trip Timeline
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
// //   timelineItemAddress: { fontSize: 12, color: '#6B7280', marginBottom: 8, lineHeight: 16 },
// //   walkingChip: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 10, paddingVertical: 5, borderRadius: 16, alignSelf: 'flex-start', marginBottom: 8 },
// //   walkingChipText: { fontSize: 11, fontWeight: '500' },
// //   routeInfo: { flexDirection: 'row', flexWrap: 'wrap', gap: 12, marginBottom: 8, paddingTop: 6, borderTopWidth: 1, borderTopColor: '#F0F0F0' },
// //   routeInfoItem: { flexDirection: 'row', alignItems: 'center', gap: 4 },
// //   routeInfoText: { fontSize: 11, color: '#6B7280' },
// //   cumulativeInfo: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 10 },
// //   cumulativeInfoText: { fontSize: 11, color: '#10B981', fontWeight: '500' },
// //   navigateButton: { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: '#EAF1FF', paddingHorizontal: 12, paddingVertical: 8, borderRadius: 20, alignSelf: 'flex-start' },
// //   navigateButtonText: { fontSize: 12, color: '#2457A6', fontWeight: '600' },
  
// //   // Trip Overview
// //   tripOverviewCard: { backgroundColor: '#EAF1FF', borderRadius: 20, padding: 16, marginBottom: 14 },
// //   tripOverviewHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 12 },
// //   tripOverviewTitle: { fontSize: 16, fontWeight: '800', color: '#2457A6' },
// //   tripOverviewDetails: { marginBottom: 12 },
// //   tripOverviewItem: { marginBottom: 8 },
// //   tripOverviewLabel: { fontSize: 11, color: '#6B7280', marginBottom: 2 },
// //   tripOverviewValue: { fontSize: 14, fontWeight: '600', color: Colors.dark },
// //   walkDistanceText: { fontSize: 11, color: '#6B7280', marginTop: 2 },
// //   tripOverviewArrow: { alignItems: 'center', marginVertical: 4 },
// //   tripOverviewStats: { flexDirection: 'row', flexWrap: 'wrap', gap: 12, paddingTop: 12, borderTopWidth: 1, borderTopColor: '#CDD9F0' },
// //   tripOverviewStat: { flexDirection: 'row', alignItems: 'center', gap: 4 },
// //   tripOverviewStatText: { fontSize: 12, color: '#6B7280' },
  
// //   // Vehicle Details
// //   vehicleDetailRow: { flexDirection: 'row', alignItems: 'center', gap: 16 },
// //   vehicleDetailInfo: { flex: 1 },
// //   vehicleDetailName: { fontSize: 15, fontWeight: '600', color: Colors.dark },
// //   vehicleDetailColor: { fontSize: 13, color: '#6B7280', marginTop: 2 },
// //   vehicleDetailReg: { fontSize: 12, color: '#9CA3AF', marginTop: 2 },
// //   vehicleDetailSeats: { fontSize: 12, color: '#6B7280', marginTop: 2 },
  
// //   // Seat Stats
// //   seatStatsRow: { flexDirection: 'row', justifyContent: 'space-around', marginBottom: 16 },
// //   seatStat: { alignItems: 'center' },
// //   seatStatValue: { fontSize: 24, fontWeight: '800', color: Colors.dark },
// //   seatStatLabel: { fontSize: 12, color: Colors.gray, marginTop: 4 },
// //   seatProgressContainer: { height: 6, backgroundColor: '#E5E7EB', borderRadius: 3, overflow: 'hidden', marginBottom: 8 },
// //   seatProgressBar: { height: '100%', backgroundColor: '#10B981', borderRadius: 3 },
  
// //   // Preferences
// //   tagRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 14 },
// //   preferenceTag: { paddingHorizontal: 12, paddingVertical: 8, borderRadius: 999 },
// //   preferenceTagText: { fontSize: 12, fontWeight: '700' },
  
// //   // Booking Details
// //   bookingDetailRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 8 },
// //   bookingDetailLabel: { fontSize: 14, color: Colors.gray },
// //   bookingDetailValue: { fontSize: 14, fontWeight: '600', color: Colors.dark },
// //   bookingTotalRow: { marginTop: 8, paddingTop: 8, borderTopWidth: 1, borderTopColor: '#EEF2F7' },
// //   bookingTotalLabel: { fontSize: 16, fontWeight: '700', color: Colors.dark },
// //   bookingTotalValue: { fontSize: 18, fontWeight: '800', color: '#184080' },
// //   bookingStatusBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20 },
// //   bookingStatusText: { fontSize: 12, fontWeight: '600' },
// //   strikethroughText: { textDecorationLine: 'line-through', color: '#9CA3AF' },
// //   divider: { height: 1, backgroundColor: '#EEF2F7', marginVertical: 16 },
// //   otherBookedInfo: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFFBEB', padding: 10, borderRadius: 8, marginBottom: 12, gap: 8 },
// //   otherBookedInfoText: { flex: 1, fontSize: 11, color: '#B45309' },
// //   seatSelectorRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: '#FAFAFB', borderRadius: 18, padding: 14, marginBottom: 12 },
// //   seatActionBtn: { width: 38, height: 38, borderRadius: 12, borderWidth: 1, borderColor: '#D6DDE7', alignItems: 'center', justifyContent: 'center', backgroundColor: 'white' },
// //   seatActionBtnDisabled: { opacity: 0.5, backgroundColor: '#F5F5F5' },
// //   seatCountWrap: { flexDirection: 'row', alignItems: 'baseline' },
// //   seatCountText: { fontSize: 28, fontWeight: '900', color: Colors.dark },
// //   seatAvailableText: { fontSize: 13, color: Colors.gray, marginLeft: 6, fontWeight: '600' },
// //   updateSeatsBtn: { backgroundColor: Colors.primary, paddingVertical: 12, borderRadius: 12, alignItems: 'center', marginTop: 8 },
// //   updateSeatsBtnDisabled: { opacity: 0.6 },
// //   updateSeatsBtnText: { color: '#fff', fontWeight: '700', fontSize: 14 },
// //   cancelBookingBtn: { marginTop: 12, backgroundColor: '#FEF2F2', paddingVertical: 12, borderRadius: 12, alignItems: 'center', borderWidth: 1, borderColor: '#EF4444' },
// //   cancelBookingBtnText: { color: '#EF4444', fontWeight: '700', fontSize: 14 },
// //   cancelBookingBtnDisabled: { opacity: 0.6 },
  
// //   // Other Riders
// //   noRidersContainer: { alignItems: 'center', padding: 30, gap: 10 },
// //   noRidersText: { fontSize: 14, fontWeight: '600', color: Colors.gray },
// //   otherRiderItem: { flexDirection: 'row', alignItems: 'center', paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: '#EEF2F7' },
// //   otherRiderAvatar: { width: 44, height: 44, borderRadius: 22, backgroundColor: '#E5E7EB', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', marginRight: 12 },
// //   otherRiderAvatarImg: { width: 44, height: 44, borderRadius: 22, resizeMode: 'cover' },
// //   otherRiderAvatarPlaceholder: { width: 44, height: 44, borderRadius: 22, backgroundColor: '#E5E7EB', alignItems: 'center', justifyContent: 'center' },
// //   otherRiderAvatarText: { fontSize: 16, fontWeight: '700', color: Colors.primary },
// //   otherRiderInfo: { flex: 1 },
// //   otherRiderName: { fontSize: 15, fontWeight: '600', color: Colors.dark, marginBottom: 2 },
// //   otherRiderSeats: { fontSize: 12, color: Colors.gray },
  
// //   // Safety Card
// //   safetyCard: { backgroundColor: '#FFF3E7', borderRadius: 18, padding: 16, marginBottom: 14, flexDirection: 'row', alignItems: 'center', gap: 12 },
// //   safetyTitle: { fontSize: 14, color: '#2457A6', fontWeight: '800' },
// //   safetySub: { marginTop: 2, fontSize: 12, color: '#2457A6', opacity: 0.9, fontWeight: '600' },
  
// //   // Loader
// //   loaderContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#fff' },
  
// //   // Modals
// //   modalBackdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center' },
// //   confirmModalContent: { backgroundColor: 'white', borderRadius: 24, padding: 24, width: '85%', alignItems: 'center' },
// //   confirmModalTitle: { fontSize: 20, fontWeight: '800', color: Colors.dark, marginTop: 12 },
// //   confirmModalMessage: { fontSize: 14, color: Colors.gray, textAlign: 'center', marginBottom: 24, lineHeight: 20 },
// //   confirmModalButtons: { flexDirection: 'row', gap: 12, width: '100%' },
// //   confirmModalBtn: { flex: 1, paddingVertical: 12, borderRadius: 12, alignItems: 'center' },
// //   confirmModalCancelBtn: { backgroundColor: '#F3F4F6' },
// //   confirmModalCancelBtnText: { color: Colors.dark, fontWeight: '600' },
// //   confirmModalConfirmBtn: { backgroundColor: '#EF4444' },
// //   confirmModalConfirmBtnText: { color: '#fff', fontWeight: '600' },
// //   modalCard: { backgroundColor: '#fff', borderRadius: 24, padding: 20, alignItems: 'center', width: width - 40 },
// //   modalTitle: { fontSize: 22, fontWeight: '700', color: '#111827', textAlign: 'center', marginTop: 12 },
// //   modalSub: { fontSize: 14, color: '#6B7280', textAlign: 'center', marginTop: 8, marginBottom: 18 },
// //   feedbackInput: { minHeight: 100, borderWidth: 1, borderColor: '#E5E7EB', borderRadius: 16, padding: 14, color: '#111827', fontSize: 14, width: '100%' },
// //   modalActions: { flexDirection: 'row', gap: 10, marginTop: 18, width: '100%' },
// //   skipBtn: { flex: 1, borderWidth: 1, borderColor: '#D1D5DB', borderRadius: 999, paddingVertical: 14, alignItems: 'center' },
// //   skipBtnText: { color: '#6B7280', fontWeight: '600' },
// //   submitBtn: { flex: 1, backgroundColor: Colors.primary, borderRadius: 999, paddingVertical: 14, alignItems: 'center' },
// //   submitBtnText: { color: '#fff', fontWeight: '700' },
  
// //   // Image Modal
// //   imageModalContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', width: '100%' },
// //   imageModalContent: { width: '90%', backgroundColor: Colors.white, borderRadius: 20, overflow: 'hidden', maxHeight: '80%' },
// //   imageModalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 16, borderBottomWidth: 1, borderBottomColor: '#EEF2F7' },
// //   imageModalTitle: { fontSize: 18, fontWeight: '700', color: Colors.dark },
// //   fullProfileImage: { width: '100%', height: 400, backgroundColor: '#F5F5F5', resizeMode: 'contain' },
// //   modalSvgContainer: { width: '100%', height: 400, backgroundColor: '#F5F5F5', alignItems: 'center', justifyContent: 'center' },
// //   noImageContainer: { width: '100%', height: 400, justifyContent: 'center', alignItems: 'center', backgroundColor: '#F5F5F5' },
// //   noImageText: { fontSize: 16, color: Colors.gray },
// //   emptyText: { fontSize: 13, color: Colors.gray, fontWeight: '600' },
  
// //   // Pending Modification
// //   pendingModificationHeader: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 16, paddingBottom: 12, borderBottomWidth: 1, borderBottomColor: '#FDE68A' },
// //   pendingModificationTitle: { fontSize: 18, fontWeight: '700', color: '#92400E', flex: 1 },
// //   pendingModificationDetails: { backgroundColor: '#FFFBEB', borderRadius: 12, padding: 14, marginBottom: 16, borderWidth: 1, borderColor: '#FDE68A' },
// //   modificationDetailRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 8 },
// //   modificationDetailLabel: { fontSize: 14, color: '#6B7280' },
// //   modificationDetailValue: { fontSize: 16, fontWeight: '600', color: '#111827' },
// //   pendingBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20 },
// //   pendingBadgeText: { fontSize: 12, fontWeight: '600' },
// //   modificationDate: { fontSize: 11, color: '#9CA3AF', marginTop: 8, textAlign: 'center' },
// //   cancelModificationBtn: { backgroundColor: '#FEF2F2', paddingVertical: 12, borderRadius: 12, alignItems: 'center', borderWidth: 1, borderColor: '#EF4444' },
// //   cancelModificationBtnText: { color: '#EF4444', fontWeight: '600', fontSize: 14 },
// // });
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
//   LogBox,
//   TextInput,
//   Share,
//   Alert,
//   ActivityIndicator,
//   RefreshControl,
//   Linking,
// } from 'react-native';
// import MapView, { Marker, Polyline, PROVIDER_GOOGLE, Circle } from 'react-native-maps';
// import { Ionicons } from '@expo/vector-icons';
// import LottieView from "lottie-react-native";
// import { SvgCssUri } from 'react-native-svg/css';
// import { Colors } from '../constants/Colors';
// import { useAuth } from '../context/AuthContext';
// import { API_BASE_URL, GMAP_API_KEY } from '../config/config_ip';
// import CustomAlert from '../components/CustomAlert';
// import { useFocusEffect } from '@react-navigation/native';
// import io from 'socket.io-client';
// import ChatService from '../services/ChatService';

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

// // Calculate distance between two coordinates (in km)
// function calculateDistance(lat1, lon1, lat2, lon2) {
//   const R = 6371;
//   const dLat = (lat2 - lat1) * Math.PI / 180;
//   const dLon = (lon2 - lon1) * Math.PI / 180;
//   const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
//             Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
//             Math.sin(dLon/2) * Math.sin(dLon/2);
//   const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
//   return R * c;
// }

// // Calculate estimated travel time between points (in minutes)
// function calculateTravelTime(distanceKm, avgSpeedKmh = 40) {
//   const timeHours = distanceKm / avgSpeedKmh;
//   return Math.round(timeHours * 60);
// }

// // Format duration display
// function formatDuration(minutes) {
//   if (minutes < 60) return `${minutes} min`;
//   const hours = Math.floor(minutes / 60);
//   const mins = minutes % 60;
//   return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`;
// }

// // Get rider's pickup location details
// function getRiderPickupLocation(booking, currentRide) {
//   if (booking?.pickup_address) return booking.pickup_address;
//   if (booking?.intersection_pickup_lat && booking?.intersection_pickup_lon) {
//     const walkDist = booking.pickup_walk_distance_m;
//     if (walkDist && walkDist > 0) return `Meet point (${walkDist}m walk)`;
//     return "Meet point on driver's route";
//   }
//   if (booking?.pickup_lat && booking?.pickup_lon) return "Your custom pickup location";
//   if (currentRide?.suggestedPickup || currentRide?.suggested_pickup_point) return "Driver's suggested pickup point";
//   return currentRide?.origin || "Pickup location";
// }

// function getRiderDropoffLocation(booking, currentRide) {
//   if (booking?.dropoff_address) return booking.dropoff_address;
//   if (booking?.intersection_drop_lat && booking?.intersection_drop_lon) {
//     const walkDist = booking.drop_walk_distance_m;
//     if (walkDist && walkDist > 0) return `Drop point (${walkDist}m walk)`;
//     return "Drop point on driver's route";
//   }
//   if (booking?.drop_lat && booking?.drop_lon) return "Your custom dropoff location";
//   if (currentRide?.suggestedDrop || currentRide?.suggested_drop_point) return "Driver's suggested drop point";
//   return currentRide?.destination || "Drop location";
// }

// // ============================================
// // COMPONENTS
// // ============================================

// function PreferenceTag({ label, isActive = true }) {
//   if (!label || label.trim() === '') return null;
  
//   let activeColor = '#E8F5E9';
//   let activeTextColor = '#2E7D32';
//   let inactiveColor = '#F3F4F6';
//   let inactiveTextColor = '#9CA3AF';
  
//   const lowerLabel = label.toLowerCase();
//   if (lowerLabel.includes('age') || lowerLabel.includes('category')) {
//     activeColor = '#E8F5E9'; activeTextColor = '#2E7D32';
//   } else if (lowerLabel.includes('chat') || lowerLabel.includes('talk')) {
//     activeColor = '#E3F2FD'; activeTextColor = '#1565C0';
//   } else if (lowerLabel.includes('gender')) {
//     activeColor = '#F3E5F5'; activeTextColor = '#6A1B9A';
//   } else if (lowerLabel.includes('language') || lowerLabel.includes('speak')) {
//     activeColor = '#FFF9C4'; activeTextColor = '#F57F17';
//   }
  
//   const isBooleanPref = ['women only', 'music', 'chat friendly', 'pets allowed', 'luggage space'].some(
//     pref => lowerLabel.includes(pref)
//   );
  
//   if (isBooleanPref) {
//     return (
//       <View style={[styles.preferenceTag, { backgroundColor: isActive ? activeColor : inactiveColor }]}>
//         <Text style={[styles.preferenceTagText, { color: isActive ? activeTextColor : inactiveTextColor }]}>
//           {label}
//         </Text>
//       </View>
//     );
//   }
  
//   return (
//     <View style={[styles.preferenceTag, { backgroundColor: '#F3F4F6' }]}>
//       <Text style={[styles.preferenceTagText, { color: '#6B7280' }]}>{label}</Text>
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

// function RatingStars({ rating, size = 16, onPress }) {
//   return (
//     <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
//       {[1, 2, 3, 4, 5].map((star) => (
//         <TouchableOpacity key={star} onPress={() => onPress?.(star)} disabled={!onPress}>
//           <Ionicons 
//             name={star <= rating ? 'star' : 'star-outline'} 
//             size={size} 
//             color={star <= rating ? '#F59E0B' : '#D1D5DB'} 
//           />
//         </TouchableOpacity>
//       ))}
//     </View>
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

//   // State for ride data
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
//         id: Number(booking.id),
//         seats_requested: Number(booking.seats_requested) || 1,
//         status: booking.status || 'pending',
//         total_amount: Number(booking.total_amount) || null,
//         created_at: booking.created_at,
//         pickup_address: booking.pickup_address,
//         dropoff_address: booking.dropoff_address,
//         intersection_pickup_lat: booking.intersection_pickup_lat,
//         intersection_pickup_lon: booking.intersection_pickup_lon,
//         pickup_lat: booking.pickup_lat,
//         pickup_lon: booking.pickup_lon,
//         drop_lat: booking.drop_lat,
//         drop_lon: booking.drop_lon,
//         pickup_walk_distance_m: booking.pickup_walk_distance_m,
//         drop_walk_distance_m: booking.drop_walk_distance_m,
//         modification_request: booking.modification_request,
//       };
//     }
//     if (initialRide?.booking && initialRide.booking.id) {
//       return {
//         id: Number(initialRide.booking.id),
//         seats_requested: Number(initialRide.booking.seats_requested) || 1,
//         status: initialRide.booking.status || 'pending',
//         total_amount: Number(initialRide.booking.total_amount) || null,
//       };
//     }
//     if (initialRide?.seatsRequested) {
//       return {
//         id: Number(initialRide.id),
//         seats_requested: Number(initialRide.seatsRequested),
//         status: 'accepted',
//       };
//     }
//     return null;
//   });

//   const [driverProfile, setDriverProfile] = useState(null);
//   const [isVerified, setIsVerified] = useState(false);
//   const [loadingProfile, setLoadingProfile] = useState(false);
//   const [addressCache, setAddressCache] = useState({});
  
//   // UI State
//   const [drawerExpanded, setDrawerExpanded] = useState(true);
//   const [mapReady, setMapReady] = useState(false);
//   const [showCancelModal, setShowCancelModal] = useState(false);
//   const [ratingModalVisible, setRatingModalVisible] = useState(false);
//   const [selectedProfile, setSelectedProfile] = useState({ visible: false, imageUrl: null, driverName: '' });
//   const [alertVisible, setAlertVisible] = useState(false);
//   const [alertConfig, setAlertConfig] = useState({ title: "", message: "", icon: "check-circle", iconColor: "#10B981", buttons: [] });
//   const [refreshing, setRefreshing] = useState(false);
//   const [timelineExpanded, setTimelineExpanded] = useState(true);
//   const [selectedStopIndex, setSelectedStopIndex] = useState(null);
  
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
//   const [modificationStatus, setModificationStatus] = useState(null); // 'none', 'pending', 'approved', 'rejected'
  
//   // Live tracking state
//   const [liveSession, setLiveSession] = useState(null);
//   const [driverLocation, setDriverLocation] = useState(null);
//   const [socketConnected, setSocketConnected] = useState(false);
  
//   // Rating state
//   const [rating, setRating] = useState(0);
//   const [feedback, setFeedback] = useState('');
//   const [submitting, setSubmitting] = useState(false);
//   const [hasRatedDriver, setHasRatedDriver] = useState(false);
//   const [rideCompleted, setRideCompleted] = useState(false);
  
//   // Driver's rating and feedback for this ride
//   const [driverRating, setDriverRating] = useState(null);
//   const [driverFeedbackText, setDriverFeedbackText] = useState('');
//   const [showDriverRating, setShowDriverRating] = useState(false);
  
//   // Cancel state
//   const [cancelLoading, setCancelLoading] = useState(false);
  
//   // Modify Seats Modal
//   const [modifySeatsModalVisible, setModifySeatsModalVisible] = useState(false);
//   const [modifySeatsValue, setModifySeatsValue] = useState(1);
//   const [maxModifySeats, setMaxModifySeats] = useState(1);
  
//   // Refs
//   const animatedDrawer = useRef(new Animated.Value(1)).current;
//   const mapRef = useRef(null);
//   const socketRef = useRef(null);
//   const hasShownRatingModal = useRef(false);
  
//   // Animation values
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
  
//   const getDriverPhoneNumber = () => {
//     return currentRide?.phoneNumber || currentRide?.driver_phone;
//   };
  
//   const handleChatWithDriver = async () => {
//     const driverPhone = getDriverPhoneNumber();
//     const driverName = driverProfile?.full_name || currentRide?.driverName || 'Driver';
    
//     if (!driverPhone) {
//       showCustomAlert('Error', 'Driver contact information not available', 'error');
//       return;
//     }
    
//     try {
//       const result = await ChatService.getOrCreateConversation(
//         user?.phone_number,
//         driverPhone,
//         currentRide?.id
//       );
      
//       if (result.success && result.conversationId) {
//         navigation.navigate('ChatScreen', {
//           conversationId: result.conversationId,
//           user: {
//             name: driverName,
//             phone_number: driverPhone,
//             profile_picture: getProfilePhotoUrl(),
//           },
//           rideId: currentRide?.id,
//         });
//       } else {
//         showCustomAlert('Error', 'Could not start chat. Please try again.', 'error');
//       }
//     } catch (error) {
//       console.error('Chat error:', error);
//       showCustomAlert('Error', 'Could not start chat', 'error');
//     }
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
  
//   // Get ride status for passenger view (with reason)
//   const getPassengerRideStatusInfo = useCallback(() => {
//     const ride = currentRide;
//     const now = new Date();
//     const departureTime = new Date(ride?.departure_time);
//     const hoursSinceDeparture = (now - departureTime) / (1000 * 60 * 60);
//     const minutesSinceDeparture = (now - departureTime) / (1000 * 60);
//     const minutesToDeparture = (departureTime - now) / (1000 * 60);
    
//     // Check for modification status first
//     if (modificationStatus === 'pending') {
//       return { 
//         text: "Modification Pending", 
//         color: "#F59E0B", 
//         icon: "swap", 
//         type: "modification-pending",
//         reason: "Waiting for driver to approve your seat change request"
//       };
//     }
    
//     if (modificationStatus === 'approved') {
//       return { 
//         text: "Modification Approved", 
//         color: "#10B981", 
//         icon: "checkmark-circle", 
//         type: "modification-approved",
//         reason: "Your seat change request has been approved!"
//       };
//     }
    
//     if (modificationStatus === 'rejected') {
//       return { 
//         text: "Booking Cancelled", 
//         color: "#DC2626", 
//         icon: "close-circle", 
//         type: "modification-rejected",
//         reason: "Your modification request was rejected and booking cancelled"
//       };
//     }
    
//     // Check for modification rejected from booking object
//     if (userBooking?.modification_request?.status === "rejected") {
//       return { 
//         text: "Booking Cancelled", 
//         color: "#DC2626", 
//         icon: "close-circle", 
//         type: "modification-rejected",
//         reason: userBooking.modification_request.rejection_reason || "Your modification request was rejected and booking cancelled"
//       };
//     }
    
//     // Ride completed
//     if (ride?.status === "completed" || rideCompleted) {
//       return { text: "Completed", color: "#6B7280", icon: "checkmark-done", type: "completed", reason: null };
//     }
    
//     // Ride cancelled
//     if (ride?.cancellation_reason) {
//       if (ride.cancellation_reason.includes("Auto-cancelled")) {
//         return { text: "Auto-cancelled", color: "#9CA3AF", icon: "timer-off", type: "auto-cancelled", reason: ride.cancellation_reason };
//       }
//       return { text: "Cancelled", color: "#DC2626", icon: "close-circle", type: "cancelled", reason: ride.cancellation_reason };
//     }
    
//     // Auto-cancelled (2 hours past departure with no start)
//     if (hoursSinceDeparture > 2 && !ride?.started_at && !rideCompleted) {
//       return { text: "Auto-cancelled", color: "#9CA3AF", icon: "timer-off", type: "auto-cancelled", reason: "Ride auto-cancelled as it was not started within 2 hours of departure time" };
//     }
    
//     // Ride ongoing (driver has started)
//     if (ride?.started_at && ride.status !== "completed") {
//       return { text: "Ongoing", color: "#10B981", icon: "car-sport", type: "ongoing", reason: null };
//     }
    
//     // Driver is late (departure time passed but ride not started, up to 2 hours)
//     if (minutesSinceDeparture > 0 && minutesSinceDeparture <= 120 && !ride?.started_at) {
//       return { text: `Driver Late - ${Math.round(minutesSinceDeparture)} min`, color: "#EF4444", icon: "alert-circle", type: "driver-late", reason: `Driver is ${Math.round(minutesSinceDeparture)} minutes late. The ride should start soon.` };
//     }
    
//     // Start soon (within 15 minutes before departure)
//     if (minutesToDeparture <= 15 && minutesToDeparture > 0 && !ride?.started_at) {
//       return { text: `Starting in ${Math.round(minutesToDeparture)} min`, color: "#10B981", icon: "time-outline", type: "start-soon", reason: `Ride starts in ${Math.round(minutesToDeparture)} minutes. Be ready at your pickup location!` };
//     }
    
//     // Upcoming (more than 15 minutes before departure)
//     if (minutesToDeparture > 15) {
//       if (userBooking?.status === "accepted") {
//         const hours = Math.floor(minutesToDeparture / 60);
//         const mins = Math.round(minutesToDeparture % 60);
//         const timeText = hours > 0 ? `${hours}h ${mins > 0 ? `${mins}m` : ''}` : `${mins}m`;
//         return { text: `Upcoming - ${timeText}`, color: "#2457A6", icon: "calendar-outline", type: "upcoming", reason: `Ride departs in ${timeText}` };
//       }
//     }
    
//     // Default based on booking status
//     if (userBooking?.status === "accepted") {
//       return { text: "Confirmed", color: "#10B981", icon: "checkmark-circle", type: "accepted", reason: "Your booking is confirmed" };
//     }
//     if (userBooking?.status === "pending") {
//       return { text: "Requested", color: "#F59E0B", icon: "time", type: "pending", reason: "Waiting for driver to accept your request" };
//     }
//     if (userBooking?.status === "rejected") {
//       return { text: "Rejected", color: "#DC2626", icon: "close-circle", type: "rejected", reason: "Your booking request was declined by the driver" };
//     }
    
//     return { text: ride?.status || "Unknown", color: Colors.gray, icon: "ellipse", type: "unknown", reason: null };
//   }, [currentRide, rideCompleted, userBooking?.status, userBooking?.modification_request, modificationStatus]);
  
//   const fetchDriverRatingForRide = useCallback(async () => {
//     if (!userBooking?.id) return;
//     const bookingId = Number(userBooking.id);
//     if (isNaN(bookingId)) return;
//     try {
//       const response = await fetch(`${API_BASE_URL}/api/v1/ride-feedback/driver/${bookingId}?_t=${Date.now()}`);
//       const data = await response.json();
//       if (data.success && data.feedback) {
//         setDriverRating(data.feedback.rating);
//         setDriverFeedbackText(data.feedback.comment || '');
//         setShowDriverRating(true);
//       } else {
//         setShowDriverRating(false);
//       }
//     } catch (error) {
//       console.log('Error fetching driver rating:', error);
//       setShowDriverRating(false);
//     }
//   }, [userBooking?.id]);

//   const handleRateDriver = async () => {
//     if (rating === 0) {
//       showCustomAlert('Rating Required', 'Please select a rating.', 'warning');
//       return;
//     }
//     if (!userBooking?.id) {
//       showCustomAlert('Error', 'Booking information not found.', 'error');
//       return;
//     }
//     setSubmitting(true);
//     try {
//       const bookingId = Number(userBooking.id);
//       const requestBody = {
//         ride_booking_id: bookingId,
//         rating: Number(rating),
//         comment: feedback || '',
//       };
//       const response = await fetch(`${API_BASE_URL}/api/v1/ride-feedback`, {
//         method: 'POST',
//         headers: { 
//           'Content-Type': 'application/json',
//           'Accept': 'application/json',
//           'X-Phone-Number': user?.phone_number,
//         },
//         body: JSON.stringify(requestBody),
//       });
//       const data = await response.json();
//       if (response.ok && data.success) {
//         showCustomAlert('Thank You!', 'Your rating has been submitted successfully!', 'success');
//         setHasRatedDriver(true);
//         setRatingModalVisible(false);
//         setRating(0);
//         setFeedback('');
//         setTimeout(() => {
//           fetchDriverRatingForRide();
//           checkSessionStatus();
//         }, 500);
//       } else {
//         showCustomAlert('Error', 'Failed to submit rating.', 'error');
//       }
//     } catch (error) {
//       console.error('Rating error:', error);
//       showCustomAlert('Error', 'Network error. Please check your connection.', 'error');
//     } finally {
//       setSubmitting(false);
//     }
//   };
  
//   const getCorrectRideId = useCallback(async () => {
//     if (!userBooking?.id) return null;
//     try {
//       const response = await fetch(`${API_BASE_URL}/api/v1/bookings/${userBooking.id}/ride?_t=${Date.now()}`);
//       const data = await response.json();
//       if (data.success && data.ride) return data.ride.id;
//       return null;
//     } catch (error) {
//       console.log('Error fetching ride from booking:', error);
//       return null;
//     }
//   }, [userBooking?.id]);

//   const fetchModificationRequests = useCallback(async () => {
//     if (!userBooking?.id) return;
//     try {
//       const response = await fetch(`${API_BASE_URL}/booking/${userBooking.id}/modification-request?_t=${Date.now()}`);
//       const data = await response.json();
//       if (data.has_pending && data.request) {
//         setPendingModificationRequest(data.request);
//         setSeatModificationRequested(true);
//         setPendingSeatsRequest(data.request.requested_seats);
//         setPendingRequestDetails(data.request);
//         setModificationStatus('pending');
//       } else if (data.has_approved && data.request) {
//         setModificationStatus('approved');
//         setSeatModificationRequested(true);
//         // Update seats requested to the approved value
//         if (data.request.requested_seats !== (userBooking?.seats_requested || 1)) {
//           setUserBooking(prev => ({ ...prev, seats_requested: data.request.requested_seats }));
//           setSeatsRequested(data.request.requested_seats);
//         }
//       } else if (data.has_rejected && data.request) {
//         setModificationStatus('rejected');
//       } else {
//         setPendingModificationRequest(null);
//         setSeatModificationRequested(false);
//         setPendingSeatsRequest(null);
//         setPendingRequestDetails(null);
//         setModificationStatus(null);
//       }
//     } catch (error) {
//       console.log('Error fetching modification request:', error);
//     }
//   }, [userBooking?.id, userBooking?.seats_requested]);
  
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
//       setModificationStatus(null);
//       await fetchModificationRequests();
//       await fetchSeatAvailability();
//     } catch (error) {
//       console.error('Cancel modification error:', error);
//       showCustomAlert('Error', error.message || 'Failed to cancel modification request', 'error');
//     } finally {
//       setModifyingSeats(false);
//     }
//   };

//   const checkModificationAvailability = async (bookingId) => {
//     try {
//       const response = await fetch(`${API_BASE_URL}/booking/${bookingId}/modification-available?_t=${Date.now()}`);
//       const data = await response.json();
//       return data;
//     } catch (error) {
//       console.log('Error checking modification availability:', error);
//       return { available: false, reason: 'Could not check availability' };
//     }
//   };

//   const openModifySeatsModal = async () => {
//     // Check if modification is already pending
//     if (modificationStatus === 'pending') {
//       showCustomAlert('Modification Pending', 'You already have a pending modification request. Please wait for driver approval.', 'warning');
//       return;
//     }
    
//     // Check if modification was already used (approved)
//     if (modificationStatus === 'approved') {
//       showCustomAlert('Modification Already Used', 'You have already used your one-time modification for this booking.', 'info');
//       return;
//     }
    
//     // Check if modification was rejected
//     if (modificationStatus === 'rejected') {
//       showCustomAlert('Booking Cancelled', 'Your booking was cancelled due to modification rejection.', 'warning');
//       return;
//     }
    
//     // Check if modification is available
//     const availability = await checkModificationAvailability(userBooking?.id);
//     if (!availability.available) {
//       showCustomAlert('Cannot Modify', availability.reason || 'Modification is not available for this ride at this time.', 'warning');
//       return;
//     }
    
//     // Calculate max seats
//     const otherBookedSeats = availability.other_booked_seats || 0;
//     const totalSeatsOffered = availability.total_seats || 4;
//     const maxSeats = totalSeatsOffered - otherBookedSeats;
    
//     setMaxModifySeats(maxSeats);
//     setModifySeatsValue(userBooking?.seats_requested || 1);
//     setModifySeatsModalVisible(true);
//   };

//   const submitModifySeatsRequest = async () => {
//     if (!userBooking?.id) return;
    
//     const currentSeats = userBooking.seats_requested || 1;
    
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
    
//     setModifyingSeats(true);
//     try {
//       const response = await fetch(`${API_BASE_URL}/api/v1/modifications/request/${userBooking.id}`, {
//         method: 'POST',
//         headers: { 'Content-Type': 'application/json' },
//         body: JSON.stringify({ requested_seats: modifySeatsValue }),
//       });
//       const data = await response.json();
      
//       if (!response.ok) throw new Error(data.detail || data.message || 'Failed to send modification request');
      
//       showCustomAlert('Request Sent', `Request to change to ${modifySeatsValue} seat(s) sent to driver.`, 'success');
//       setModifySeatsModalVisible(false);
//       setModificationStatus('pending');
//       await fetchModificationRequests();
//       onRefresh();
//     } catch (error) {
//       console.error('Modification request error:', error);
//       showCustomAlert('Error', error.message || 'Failed to send modification request.', 'error');
//     } finally {
//       setModifyingSeats(false);
//     }
//   };

//   const fetchSeatAvailability = useCallback(async () => {
//     let rideId = currentRide?.id;
//     if (!rideId || rideId === 3 || rideId === 0) {
//       const correctId = await getCorrectRideId();
//       if (correctId) {
//         rideId = correctId;
//         setCurrentRide(prev => ({ ...prev, id: correctId }));
//       } else {
//         return;
//       }
//     }
//     try {
//       const url = `${API_BASE_URL.replace(/\/$/, '')}/ride/${rideId}/passengers?_t=${Date.now()}`;
//       const response = await fetch(url);
//       if (response.ok) {
//         const data = await response.json();
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
//           const acceptedPassengers = data.passengers.filter(p => p.status === 'accepted');
//           const otherAccepted = acceptedPassengers.filter(p => {
//             const passengerPhone = normalizePhone(p.passenger_phone);
//             return passengerPhone !== currentUserPhone;
//           });
//           setOtherRiders(otherAccepted);
//         } else {
//           setOtherRiders([]);
//         }
//       }
//     } catch (error) {
//       console.log('Error fetching seat availability:', error);
//     }
//   }, [currentRide?.id, currentRide?.available_seats, user?.phone_number, getCorrectRideId]);

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
//     if (!driverPhone && !driverUserId) return;
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

//   const checkLiveSession = useCallback(async () => {
//     const rideId = currentRide?.id;
//     if (!rideId) return;
//     try {
//       const response = await fetch(`${API_BASE_URL}/ride/${rideId}/live-session`);
//       const data = await response.json();
//       if (data.success && data.session) {
//         setLiveSession(data.session);
//         if (data.session.status === 'active' && currentRide?.started_at) {
//           setupSocketConnection(data.session.session_id);
//         }
//       }
//     } catch (error) {
//       console.log('Error checking live session:', error);
//     }
//   }, [currentRide?.id, currentRide?.started_at]);
  
//   const setupSocketConnection = useCallback((sessionId) => {
//     if (socketRef.current) socketRef.current.disconnect();
//     const socket = io(API_BASE_URL, { transports: ['websocket'], reconnection: true });
//     socketRef.current = socket;
//     socket.on('connect', () => {
//       console.log('Socket connected for live tracking');
//       socket.emit('join-session', sessionId);
//       setSocketConnected(true);
//     });
//     socket.on('driver-location-update', (data) => {
//       if (data.latitude && data.longitude) {
//         setDriverLocation({ latitude: data.latitude, longitude: data.longitude });
//       }
//     });
//     socket.on('ride-started', (data) => {
//       console.log('Ride started event:', data);
//       setCurrentRide(prev => ({ ...prev, started_at: new Date().toISOString() }));
//       showCustomAlert('Ride Started', 'The driver has started the ride!', 'success');
//     });
//     socket.on('ride-completed', (data) => {
//       console.log('Ride completed event:', data);
//       setRideCompleted(true);
//       setCurrentRide(prev => ({ ...prev, status: 'completed' }));
//       showCustomAlert('Ride Completed', 'Thank you for riding with us! Please rate your experience.', 'success');
//     });
//     return () => {
//       if (socketRef.current) socketRef.current.disconnect();
//     };
//   }, []);
  
//   const checkSessionStatus = useCallback(async () => {
//     const bookingId = userBooking?.id;
//     if (!bookingId) return;
//     try {
//       const res = await fetch(`${API_BASE_URL}/ride-sessions/rider/session-status/${bookingId}?rider_phone=${user?.phone_number}&_t=${Date.now()}`);
//       const data = await res.json();
//       if (data.success && data.ride_completed) {
//         setRideCompleted(true);
//         setHasRatedDriver(data.has_rated_driver);
//         if (data.has_rated_driver === false && !hasShownRatingModal.current) {
//           hasShownRatingModal.current = true;
//           setTimeout(() => setRatingModalVisible(true), 1000);
//         }
//       }
//       if (data.driver_location_lat && data.driver_location_lng) {
//         setDriverLocation({ latitude: data.driver_location_lat, longitude: data.driver_location_lng });
//       }
//     } catch (error) {
//       console.log('Error checking session status:', error);
//     }
//   }, [userBooking?.id, user?.phone_number]);
  
//   // Get driver's pickup and dropoff points
//   const driverPickup = useMemo(() => {
//     if (currentRide?.suggestedPickup || currentRide?.suggested_pickup_point) {
//       return parseSuggestedPoint(currentRide.suggestedPickup || currentRide.suggested_pickup_point);
//     }
//     if (currentRide?.pickup_lat && currentRide?.pickup_lng) {
//       return { latitude: currentRide.pickup_lat, longitude: currentRide.pickup_lng };
//     }
//     if (currentRide?.origin_lat && currentRide?.origin_lon) {
//       return { latitude: currentRide.origin_lat, longitude: currentRide.origin_lon };
//     }
//     return null;
//   }, [currentRide]);
  
//   const driverDropoff = useMemo(() => {
//     if (currentRide?.suggestedDrop || currentRide?.suggested_drop_point) {
//       return parseSuggestedPoint(currentRide.suggestedDrop || currentRide.suggested_drop_point);
//     }
//     if (currentRide?.dropoff_lat && currentRide?.dropoff_lng) {
//       return { latitude: currentRide.dropoff_lat, longitude: currentRide.dropoff_lng };
//     }
//     if (currentRide?.destination_lat && currentRide?.destination_lon) {
//       return { latitude: currentRide.destination_lat, longitude: currentRide.destination_lon };
//     }
//     return null;
//   }, [currentRide]);
  
//   // Get rider's own pickup and dropoff points
//   const riderPickup = useMemo(() => {
//     if (userBooking?.pickup_lat && userBooking?.pickup_lon) {
//       return { latitude: userBooking.pickup_lat, longitude: userBooking.pickup_lon };
//     }
//     if (userBooking?.intersection_pickup_lat && userBooking?.intersection_pickup_lon) {
//       return { latitude: userBooking.intersection_pickup_lat, longitude: userBooking.intersection_pickup_lon };
//     }
//     return driverPickup;
//   }, [userBooking, driverPickup]);
  
//   const riderDropoff = useMemo(() => {
//     if (userBooking?.drop_lat && userBooking?.drop_lon) {
//       return { latitude: userBooking.drop_lat, longitude: userBooking.drop_lon };
//     }
//     if (userBooking?.intersection_drop_lat && userBooking?.intersection_drop_lon) {
//       return { latitude: userBooking.intersection_drop_lat, longitude: userBooking.intersection_drop_lon };
//     }
//     return driverDropoff;
//   }, [userBooking, driverDropoff]);
  
//   // Get driver start and end for route
//   const driverStart = useMemo(() => {
//     const coords = currentRide?.routeCoordinates;
//     if (Array.isArray(coords) && coords.length > 0) {
//       const first = coords[0];
//       if (Array.isArray(first) && first.length === 2) return { latitude: first[1], longitude: first[0] };
//       if (first && typeof first === 'object' && first.latitude && first.longitude) return { latitude: first.latitude, longitude: first.longitude };
//     }
//     return driverPickup;
//   }, [currentRide, driverPickup]);
  
//   const driverEnd = useMemo(() => {
//     const coords = currentRide?.routeCoordinates;
//     if (Array.isArray(coords) && coords.length > 0) {
//       const last = coords[coords.length - 1];
//       if (Array.isArray(last) && last.length === 2) return { latitude: last[1], longitude: last[0] };
//       if (last && typeof last === 'object' && last.latitude && last.longitude) return { latitude: last.latitude, longitude: last.longitude };
//     }
//     return driverDropoff;
//   }, [currentRide, driverDropoff]);
  
//   const routePath = useMemo(() => {
//     const fullRoute = parseRouteCoordinates(currentRide?.routeCoordinates);
//     if (fullRoute.length >= 2) return fullRoute;
//     if (driverStart && driverEnd) return [driverStart, driverEnd];
//     return [];
//   }, [currentRide, driverStart, driverEnd]);
  
//   // Create enhanced trip timeline for rider
//   const tripTimeline = useMemo(() => {
//     const items = [];
//     let cumulativeDistance = 0;
//     let cumulativeDuration = 0;
    
//     // Start point
//     if (driverStart?.latitude && driverStart?.longitude) {
//       items.push({
//         id: 'start',
//         type: 'start',
//         title: 'Trip Start',
//         address: currentRide?.origin || 'Starting point',
//         coordinates: driverStart,
//         order: 0,
//         icon: '🚗',
//         color: '#2457A6',
//         isDriverPoint: true,
//       });
//     }
    
//     // Rider pickup point
//     if (riderPickup?.latitude && riderPickup?.longitude) {
//       const distanceToPrevious = items.length > 0 ? calculateDistance(
//         items[items.length - 1].coordinates.latitude,
//         items[items.length - 1].coordinates.longitude,
//         riderPickup.latitude,
//         riderPickup.longitude
//       ) : 0;
//       cumulativeDistance += distanceToPrevious;
//       cumulativeDuration += calculateTravelTime(distanceToPrevious);
      
//       items.push({
//         id: 'pickup',
//         type: 'pickup',
//         title: 'Your Pickup',
//         address: getRiderPickupLocation(userBooking, currentRide),
//         coordinates: riderPickup,
//         order: 1,
//         icon: '📍',
//         color: '#10B981',
//         walkDistance: userBooking?.pickup_walk_distance_m,
//         walkDuration: userBooking?.pickup_walk_distance_m ? Math.round(userBooking.pickup_walk_distance_m / 80) : null,
//         distanceToNext: distanceToPrevious.toFixed(1),
//         durationToNext: calculateTravelTime(distanceToPrevious),
//         cumulativeDistance: cumulativeDistance.toFixed(1),
//         cumulativeDuration: cumulativeDuration,
//       });
//     }
    
//     // Rider dropoff point
//     if (riderDropoff?.latitude && riderDropoff?.longitude) {
//       const distanceToPrevious = items.length > 0 ? calculateDistance(
//         items[items.length - 1].coordinates.latitude,
//         items[items.length - 1].coordinates.longitude,
//         riderDropoff.latitude,
//         riderDropoff.longitude
//       ) : 0;
//       cumulativeDistance += distanceToPrevious;
//       cumulativeDuration += calculateTravelTime(distanceToPrevious);
      
//       items.push({
//         id: 'dropoff',
//         type: 'dropoff',
//         title: 'Your Dropoff',
//         address: getRiderDropoffLocation(userBooking, currentRide),
//         coordinates: riderDropoff,
//         order: 2,
//         icon: '🏁',
//         color: '#F59E0B',
//         walkDistance: userBooking?.drop_walk_distance_m,
//         walkDuration: userBooking?.drop_walk_distance_m ? Math.round(userBooking.drop_walk_distance_m / 80) : null,
//         distanceToNext: distanceToPrevious.toFixed(1),
//         durationToNext: calculateTravelTime(distanceToPrevious),
//         cumulativeDistance: cumulativeDistance.toFixed(1),
//         cumulativeDuration: cumulativeDuration,
//       });
//     }
    
//     // End point
//     if (driverEnd?.latitude && driverEnd?.longitude && 
//         (!riderDropoff || (Math.abs(driverEnd.latitude - riderDropoff.latitude) > 0.001 || Math.abs(driverEnd.longitude - riderDropoff.longitude) > 0.001))) {
//       const distanceToPrevious = items.length > 0 ? calculateDistance(
//         items[items.length - 1].coordinates.latitude,
//         items[items.length - 1].coordinates.longitude,
//         driverEnd.latitude,
//         driverEnd.longitude
//       ) : 0;
//       cumulativeDistance += distanceToPrevious;
//       cumulativeDuration += calculateTravelTime(distanceToPrevious);
      
//       items.push({
//         id: 'end',
//         type: 'end',
//         title: 'Trip End',
//         address: currentRide?.destination || 'Destination',
//         coordinates: driverEnd,
//         order: 3,
//         icon: '🏁',
//         color: '#DC2626',
//         isDriverPoint: true,
//         distanceToNext: distanceToPrevious.toFixed(1),
//         durationToNext: calculateTravelTime(distanceToPrevious),
//         cumulativeDistance: cumulativeDistance.toFixed(1),
//         cumulativeDuration: cumulativeDuration,
//       });
//     }
    
//     // Add total trip info to first item
//     if (items.length > 0) {
//       items[0].totalDistance = cumulativeDistance.toFixed(1);
//       items[0].totalDuration = cumulativeDuration;
//     }
    
//     return items;
//   }, [driverStart, driverEnd, riderPickup, riderDropoff, currentRide, userBooking]);
  
//   // Create walking paths
//   const walkingPaths = useMemo(() => {
//     const paths = [];
    
//     // Pickup walking path
//     if (userBooking?.pickup_lat && userBooking?.pickup_lon && 
//         userBooking?.intersection_pickup_lat && userBooking?.intersection_pickup_lon) {
//       const distance = calculateDistance(
//         userBooking.intersection_pickup_lat, userBooking.intersection_pickup_lon,
//         userBooking.pickup_lat, userBooking.pickup_lon
//       );
//       if (distance > 0.05) {
//         paths.push({
//           id: 'walking-pickup',
//           coordinates: [
//             { latitude: userBooking.intersection_pickup_lat, longitude: userBooking.intersection_pickup_lon },
//             { latitude: userBooking.pickup_lat, longitude: userBooking.pickup_lon }
//           ],
//           color: '#10B981',
//           lineDash: [5, 5],
//           walkDistance: userBooking.pickup_walk_distance_m,
//         });
//       }
//     }
    
//     // Dropoff walking path
//     if (userBooking?.drop_lat && userBooking?.drop_lon && 
//         userBooking?.intersection_drop_lat && userBooking?.intersection_drop_lon) {
//       const distance = calculateDistance(
//         userBooking.intersection_drop_lat, userBooking.intersection_drop_lon,
//         userBooking.drop_lat, userBooking.drop_lon
//       );
//       if (distance > 0.05) {
//         paths.push({
//           id: 'walking-dropoff',
//           coordinates: [
//             { latitude: userBooking.intersection_drop_lat, longitude: userBooking.intersection_drop_lon },
//             { latitude: userBooking.drop_lat, longitude: userBooking.drop_lon }
//           ],
//           color: '#F59E0B',
//           lineDash: [5, 5],
//           walkDistance: userBooking.drop_walk_distance_m,
//         });
//       }
//     }
    
//     return paths;
//   }, [userBooking]);
  
//   // Create all map markers
//   const allMapMarkers = useMemo(() => {
//     const markers = [];
    
//     // Driver start
//     if (driverStart?.latitude && driverStart?.longitude) {
//       markers.push({
//         id: 'driver-start',
//         type: 'driver-start',
//         coordinate: driverStart,
//         title: 'Trip Start',
//         address: currentRide?.origin || 'Starting point',
//         icon: 'flag',
//         color: '#2457A6',
//       });
//     }
    
//     // Rider pickup
//     if (riderPickup?.latitude && riderPickup?.longitude) {
//       markers.push({
//         id: 'rider-pickup',
//         type: 'pickup',
//         coordinate: riderPickup,
//         title: 'Your Pickup Point',
//         address: getRiderPickupLocation(userBooking, currentRide),
//         icon: 'person-walking',
//         color: '#10B981',
//         walkDistance: userBooking?.pickup_walk_distance_m,
//       });
//     }
    
//     // Rider dropoff
//     if (riderDropoff?.latitude && riderDropoff?.longitude) {
//       markers.push({
//         id: 'rider-dropoff',
//         type: 'dropoff',
//         coordinate: riderDropoff,
//         title: 'Your Dropoff Point',
//         address: getRiderDropoffLocation(userBooking, currentRide),
//         icon: 'flag',
//         color: '#F59E0B',
//         walkDistance: userBooking?.drop_walk_distance_m,
//       });
//     }
    
//     // Driver end
//     if (driverEnd?.latitude && driverEnd?.longitude) {
//       markers.push({
//         id: 'driver-end',
//         type: 'driver-end',
//         coordinate: driverEnd,
//         title: 'Trip End',
//         address: currentRide?.destination || 'Destination',
//         icon: 'flag',
//         color: '#DC2626',
//       });
//     }
    
//     // Driver live location
//     if (driverLocation && getPassengerRideStatusInfo().type === 'ongoing') {
//       markers.push({
//         id: 'driver-live',
//         type: 'driver-live',
//         coordinate: driverLocation,
//         title: 'Driver Current Location',
//         icon: 'car-sport',
//         color: '#2457A6',
//       });
//     }
    
//     return markers;
//   }, [driverStart, driverEnd, riderPickup, riderDropoff, driverLocation, currentRide, userBooking, getPassengerRideStatusInfo]);
  
//   const allMarkerCoords = useMemo(() => {
//     const coords = allMapMarkers.map(m => m.coordinate).filter(c => c?.latitude && c?.longitude);
//     walkingPaths.forEach(path => {
//       path.coordinates.forEach(coord => coords.push(coord));
//     });
//     return coords;
//   }, [allMapMarkers, walkingPaths]);
  
//   const fitMapToMarkers = useCallback(() => {
//     if (mapRef.current && mapReady && allMarkerCoords.length >= 1) {
//       setTimeout(() => {
//         try {
//           mapRef.current.fitToCoordinates(allMarkerCoords, {
//             edgePadding: { top: 80, right: 50, bottom: 200, left: 50 },
//             animated: true,
//           });
//         } catch (e) { console.log('fitToCoordinates error:', e); }
//       }, 500);
//     }
//   }, [mapReady, allMarkerCoords]);
  
//   useEffect(() => {
//     if (mapReady && allMarkerCoords.length >= 1) fitMapToMarkers();
//   }, [mapReady, allMarkerCoords, fitMapToMarkers]);
  
//   const canModifySeats = useCallback(() => {
//     if (!userBooking) return false;
//     const statusInfo = getPassengerRideStatusInfo();
//     if (rideCompleted) return false;
//     if (currentRide?.cancellation_reason || currentRide?.started_at) return false;
//     if (userBooking.status !== "accepted") return false;
//     if (['expired', 'auto-cancelled', 'driver-late', 'start-soon', 'ongoing', 'modification-rejected', 'modification-pending', 'modification-approved'].includes(statusInfo.type)) return false;
//     if (modificationStatus === 'pending') return false;
//     if (modificationStatus === 'approved') return false;
//     if (modificationStatus === 'rejected') return false;
//     return true;
//   }, [userBooking, getPassengerRideStatusInfo, currentRide, rideCompleted, modificationStatus]);
  
//   const canCancelBooking = useCallback(() => {
//     if (!userBooking) return false;
//     const statusInfo = getPassengerRideStatusInfo();
//     if (rideCompleted) return false;
//     if (currentRide?.cancellation_reason || currentRide?.started_at || currentRide?.status === 'completed') return false;
//     if (['expired', 'auto-cancelled', 'ongoing', 'modification-rejected'].includes(statusInfo.type)) return false;
//     if (modificationStatus === 'pending') return true; // Can cancel pending modification
//     if (!["accepted", "pending"].includes(userBooking.status)) return false;
//     return true;
//   }, [userBooking, getPassengerRideStatusInfo, currentRide, rideCompleted, modificationStatus]);
  
//   const handleCancelBooking = async () => {
//     if (!userBooking || !canCancelBooking()) return;
    
//     // If there's a pending modification, ask user if they want to cancel just the modification or the whole booking
//     if (modificationStatus === 'pending') {
//       showCustomAlert('Pending Modification', 'You have a pending modification request. Do you want to cancel just the modification request or the entire booking?', 'info');
//       // For now, we'll just cancel the modification
//       await handleCancelModificationRequest();
//       return;
//     }
    
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
  
//   const onRefresh = () => {
//     setRefreshing(true);
//     Promise.all([
//       fetchSeatAvailability(),
//       loadDriverData(),
//       fetchModificationRequests(),
//       fetchDriverRatingForRide(),
//       checkLiveSession(),
//       checkSessionStatus()
//     ]).finally(() => setRefreshing(false));
//   };
  
//   // Render timeline item
//   const renderTimelineItem = (item, index) => {
//     const isLast = index === tripTimeline.length - 1;
//     const hasWalking = item.walkDistance && item.walkDistance > 0;
//     const isRiderPoint = item.type === 'pickup' || item.type === 'dropoff';
    
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
//             {item.order && (
//               <View style={styles.segmentBadge}>
//                 <Text style={styles.segmentBadgeText}>Stop {item.order}</Text>
//               </View>
//             )}
//           </View>
          
//           <Text style={styles.timelineItemTitle}>{item.title}</Text>
          
//           {isRiderPoint && item.walkDistance && item.walkDistance > 0 && (
//             <View style={[styles.walkingChip, { backgroundColor: item.color + '15' }]}>
//               <Ionicons name="walk" size={14} color={item.color} />
//               <Text style={[styles.walkingChipText, { color: item.color }]}>
//                 Walk {item.walkDistance}m • ~{item.walkDuration} min
//               </Text>
//             </View>
//           )}
          
//           <Text style={styles.timelineItemAddress} numberOfLines={2}>
//             {item.address}
//           </Text>
          
//           {item.distanceToNext && item.durationToNext && (
//             <View style={styles.routeInfo}>
//               <View style={styles.routeInfoItem}>
//                 <Ionicons name="navigate-outline" size={12} color="#2457A6" />
//                 <Text style={styles.routeInfoText}>Next: {item.distanceToNext} km</Text>
//               </View>
//               <View style={styles.routeInfoItem}>
//                 <Ionicons name="time-outline" size={12} color="#F59E0B" />
//                 <Text style={styles.routeInfoText}>~{formatDuration(item.durationToNext)}</Text>
//               </View>
//             </View>
//           )}
          
//           {item.cumulativeDistance && (
//             <View style={styles.cumulativeInfo}>
//               <Ionicons name="flag-outline" size={12} color="#10B981" />
//               <Text style={styles.cumulativeInfoText}>
//                 Total: {item.cumulativeDistance} km • {formatDuration(item.cumulativeDuration)}
//               </Text>
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
  
//   // Render map marker
//   const renderMapMarker = (marker) => {
//     let size = 36;
//     switch (marker.type) {
//       case 'driver-start': size = 42; break;
//       case 'driver-end': size = 42; break;
//       case 'driver-live': size = 40; break;
//       default: size = 38;
//     }
    
//     const iconName = marker.icon;
    
//     return (
//       <Marker 
//         key={marker.id} 
//         coordinate={marker.coordinate} 
//         title={marker.title} 
//         description={marker.address}
//       >
//         <View style={[styles.mapCustomMarker, { backgroundColor: marker.color, width: size, height: size, borderRadius: size / 2 }]}>
//           <Ionicons name={iconName} size={size * 0.45} color="#fff" />
//           {marker.walkDistance && marker.walkDistance > 0 && (
//             <View style={[styles.mapWalkBadge, { backgroundColor: marker.color }]}>
//               <Ionicons name="walk" size={10} color="#fff" />
//               <Text style={styles.mapWalkBadgeText}>{marker.walkDistance}m</Text>
//             </View>
//           )}
//           {marker.type === 'driver-live' && (
//             <View style={styles.liveRing}>
//               <View style={styles.liveRingInner} />
//             </View>
//           )}
//         </View>
//       </Marker>
//     );
//   };
  
//   // Initialize data on component mount
//   useEffect(() => {
//     const initializeData = async () => {
//       if (userBooking?.id) {
//         try {
//           const response = await fetch(`${API_BASE_URL}/api/v1/bookings/${userBooking.id}/ride?_t=${Date.now()}`);
//           const data = await response.json();
//           if (data.success && data.ride) {
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
//               started_at: data.ride.started_at,
//               completed_at: data.ride.completed_at,
//             });
//             const totalSeats = data.ride.available_seats || 4;
//             setTotalSeatsOffered(totalSeats);
//             setTotalBookedSeats(data.ride.total_booked_seats || userBooking.seats_requested || 1);
//             setAvailableSeats(totalSeats - (data.ride.total_booked_seats || userBooking.seats_requested || 1));
//             setUserBooking(prev => ({
//               ...prev,
//               id: Number(data.booking.id),
//               seats_requested: Number(data.booking.seats_requested) || 1,
//               status: data.booking.status,
//               total_amount: Number(data.booking.total_amount) || null,
//               created_at: data.booking.created_at,
//               pickup_address: data.booking.pickup_address,
//               dropoff_address: data.booking.dropoff_address,
//               intersection_pickup_lat: data.booking.intersection_pickup_lat,
//               intersection_pickup_lon: data.booking.intersection_pickup_lon,
//               pickup_lat: data.booking.pickup_lat,
//               pickup_lon: data.booking.pickup_lon,
//               drop_lat: data.booking.drop_lat,
//               drop_lon: data.booking.drop_lon,
//               pickup_walk_distance_m: data.booking.pickup_walk_distance_m,
//               drop_walk_distance_m: data.booking.drop_walk_distance_m,
//             }));
//             await Promise.all([
//               fetchSeatAvailability(),
//               loadDriverData(),
//               fetchModificationRequests(),
//               fetchDriverRatingForRide(),
//               checkLiveSession(),
//               checkSessionStatus()
//             ]);
//           }
//         } catch (error) {
//           console.log('Error initializing ride data:', error);
//         }
//       }
//     };
//     initializeData();
//   }, [userBooking?.id]);
  
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
//         fetchDriverRatingForRide();
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
  
//   const profilePhotoUrl = getProfilePhotoUrl();
//   const avatarText = getDriverInitials(driverProfile?.full_name || currentRide?.driverName || 'Driver');
//   const isProfilePhotoSvg = profilePhotoUrl?.toLowerCase().includes('.svg');
//   const allPreferences = useMemo(() => extractAllPreferences(currentRide, driverProfile?.travel_preferences), [currentRide, driverProfile]);
  
//   const vehicleName = driverProfile?.vehicle?.model || currentRide?.vehicle?.model || 'Vehicle details unavailable';
//   const vehicleRegNumber = driverProfile?.vehicle?.registration_number || currentRide?.vehicle?.registration_number;
//   const vehicleColor = driverProfile?.vehicle?.color || currentRide?.vehicle?.color || 'Not specified';
  
//   const rideStatusInfo = getPassengerRideStatusInfo();
//   const modificationsAllowed = canModifySeats();
//   const cancellationsAllowed = canCancelBooking();
//   const isAutoCancelled = rideStatusInfo.type === 'auto-cancelled';
//   const isCompleted = rideStatusInfo.type === 'completed';
//   const isModificationRejected = rideStatusInfo.type === 'modification-rejected';
//   const isModificationPending = rideStatusInfo.type === 'modification-pending';
//   const isModificationApproved = rideStatusInfo.type === 'modification-approved';
  
//   const otherBookedSeats = totalBookedSeats - (userBooking?.seats_requested || 0);
//   const maxUserCanRequest = totalSeatsOffered - otherBookedSeats;
//   const totalAmountPaid = (currentRide?.price || currentRide?.price_per_seat || 0) * (userBooking?.seats_requested || 1);
//   const riderPickupAddress = getRiderPickupLocation(userBooking, currentRide);
//   const riderDropoffAddress = getRiderDropoffLocation(userBooking, currentRide);
//   const walkDistances = {
//     pickupWalk: userBooking?.pickup_walk_distance_m || 0,
//     dropWalk: userBooking?.drop_walk_distance_m || 0
//   };
  
//   const initialRegion = {
//     latitude: driverLocation?.latitude || driverStart?.latitude || riderPickup?.latitude || 28.6139,
//     longitude: driverLocation?.longitude || driverStart?.longitude || riderPickup?.longitude || 77.2090,
//     latitudeDelta: 0.02,
//     longitudeDelta: 0.02,
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
//           {/* Main route path */}
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
          
//           {/* Walking paths */}
//           {walkingPaths.map(path => (
//             <Polyline
//               key={path.id}
//               coordinates={path.coordinates}
//               strokeColor={path.color}
//               strokeWidth={3}
//               lineDashPattern={path.lineDash}
//               lineCap="round"
//               lineJoin="round"
//             />
//           ))}
          
//           {/* Proximity circles */}
//           {userBooking?.pickup_walk_distance_m > 0 && riderPickup && (
//             <Circle
//               center={riderPickup}
//               radius={userBooking.pickup_walk_distance_m}
//               strokeColor="rgba(16, 185, 129, 0.3)"
//               fillColor="rgba(16, 185, 129, 0.1)"
//               strokeWidth={1}
//             />
//           )}
          
//           {/* All markers */}
//           {allMapMarkers.map(marker => renderMapMarker(marker))}
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
//             <View style={[styles.legendDot, { backgroundColor: '#10B981' }]} />
//             <Text style={styles.legendText}>Your Pickup</Text>
//           </View>
//           <View style={styles.legendItem}>
//             <View style={[styles.legendDot, { backgroundColor: '#F59E0B' }]} />
//             <Text style={styles.legendText}>Your Dropoff</Text>
//           </View>
//           <View style={styles.legendItem}>
//             <View style={[styles.legendDot, { backgroundColor: '#2457A6' }]} />
//             <Text style={styles.legendText}>Driver Location</Text>
//           </View>
//         </View>
        
//         {/* Map Controls */}
//         <View style={styles.mapControls}>
//           <TouchableOpacity style={styles.mapControlButton} onPress={() => fitMapToMarkers()}>
//             <Ionicons name="map-outline" size={20} color="#2457A6" />
//           </TouchableOpacity>
//         </View>
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
//                 <View style={styles.collapsedStatusRow}>
//                   <View style={[styles.collapsedStatusBadge, { backgroundColor: rideStatusInfo.color + '20' }]}>
//                     <Ionicons name={rideStatusInfo.icon} size={10} color={rideStatusInfo.color} />
//                     <Text style={[styles.collapsedStatusText, { color: rideStatusInfo.color }]}>{rideStatusInfo.text}</Text>
//                   </View>
//                 </View>
//                 <Text style={styles.collapsedDriver} numberOfLines={1}>{driverProfile?.full_name || currentRide?.driverName || 'Driver'}</Text>
//                 <Text style={styles.collapsedSub} numberOfLines={1}>{currentRide?.from || currentRide?.origin || 'Pickup'} → {currentRide?.to || currentRide?.destination || 'Drop'}</Text>
//               </View>
//               <View style={styles.collapsedPriceWrap}>
//                 <Text style={styles.collapsedPrice}>₹{currentRide?.price || currentRide?.price_per_seat || 0}</Text>
//                 <Text style={styles.collapsedPerSeat}>per seat</Text>
//               </View>
//             </View>
//             {tripTimeline.length > 0 && tripTimeline[0]?.totalDistance && (
//               <View style={styles.collapsedTripInfo}>
//                 <Text style={styles.collapsedTripText}>
//                   📍 {tripTimeline.length} stops • {tripTimeline[0].totalDistance} km • {formatDuration(tripTimeline[0].totalDuration)}
//                 </Text>
//               </View>
//             )}
//           </View>
//         ) : (
//           <ScrollView 
//             style={styles.drawerScroll} 
//             contentContainerStyle={styles.drawerContent}
//             refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
//             showsVerticalScrollIndicator={false}
//           >
//             {/* Ride Status Banner with Reason */}
//             <View style={[styles.statusBanner, { backgroundColor: rideStatusInfo.color + '20' }]}>
//               <Ionicons name={rideStatusInfo.icon} size={22} color={rideStatusInfo.color} />
//               <View style={styles.statusBannerTextContainer}>
//                 <Text style={[styles.statusBannerTitle, { color: rideStatusInfo.color }]}>{rideStatusInfo.text}</Text>
//                 {rideStatusInfo.reason && (
//                   <Text style={styles.statusBannerSubtitle}>{rideStatusInfo.reason}</Text>
//                 )}
//                 {rideStatusInfo.type === 'driver-late' && !rideStatusInfo.reason && (
//                   <Text style={styles.statusBannerSubtitle}>The driver is running late. The ride should start soon.</Text>
//                 )}
//                 {rideStatusInfo.type === 'start-soon' && !rideStatusInfo.reason && (
//                   <Text style={styles.statusBannerSubtitle}>Be ready at your pickup location!</Text>
//                 )}
//                 {rideStatusInfo.type === 'ongoing' && (
//                   <Text style={styles.statusBannerSubtitle}>Your ride is in progress.</Text>
//                 )}
//                 {rideStatusInfo.type === 'completed' && (
//                   <Text style={styles.statusBannerSubtitle}>Thank you for riding with us!</Text>
//                 )}
//               </View>
//             </View>
            
//             {/* Modification Status Banner */}
//             {isModificationPending && (
//               <View style={styles.modificationPendingCard}>
//                 <View style={styles.modificationPendingHeader}>
//                   <Ionicons name="swap" size={24} color="#F59E0B" />
//                   <Text style={styles.modificationPendingTitle}>Modification Request Pending</Text>
//                 </View>
//                 <View style={styles.modificationPendingDetails}>
//                   <Text style={styles.modificationPendingText}>
//                     You requested to change from <Text style={{ fontWeight: 'bold' }}>{userBooking?.seats_requested}</Text> to <Text style={{ fontWeight: 'bold' }}>{pendingModificationRequest?.requested_seats || pendingSeatsRequest}</Text> seats
//                   </Text>
//                   <Text style={styles.modificationPendingSubtext}>
//                     Waiting for driver's approval
//                   </Text>
//                 </View>
//               </View>
//             )}

//             {isModificationApproved && (
//               <View style={styles.modificationApprovedCard}>
//                 <View style={styles.modificationPendingHeader}>
//                   <Ionicons name="checkmark-circle" size={24} color="#10B981" />
//                   <Text style={[styles.modificationPendingTitle, { color: "#10B981" }]}>Modification Approved!</Text>
//                 </View>
//                 <View style={styles.modificationPendingDetails}>
//                   <Text style={styles.modificationPendingText}>
//                     Your seats have been changed to {userBooking?.seats_requested} seats
//                   </Text>
//                   <Text style={styles.modificationPendingSubtext}>
//                     ✓ You have used your one-time modification
//                   </Text>
//                 </View>
//               </View>
//             )}

//             {isModificationRejected && userBooking?.modification_request && (
//               <View style={styles.modificationRejectedBanner}>
//                 <Ionicons name="close-circle" size={24} color="#DC2626" />
//                 <View style={{ flex: 1 }}>
//                   <Text style={styles.modificationRejectedTitle}>Booking Cancelled</Text>
//                   <Text style={styles.modificationRejectedText}>
//                     Your request to change from {userBooking.modification_request.current_seats} to {userBooking.modification_request.requested_seats} seats was rejected.
//                   </Text>
//                   {userBooking.modification_request.rejection_reason && (
//                     <Text style={styles.modificationRejectedReason}>
//                       Reason: {userBooking.modification_request.rejection_reason}
//                     </Text>
//                   )}
//                   <Text style={styles.modificationRejectedNote}>
//                     Your original booking has been cancelled and seats have been released.
//                   </Text>
//                 </View>
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
//                 {!isModificationRejected && (
//                   <TouchableOpacity style={styles.chatButton} onPress={handleChatWithDriver}>
//                     <Ionicons name="chatbubble-ellipses" size={22} color="#2457A6" />
//                   </TouchableOpacity>
//                 )}
//               </View>
              
//               {!isModificationRejected && (
//                 <View style={styles.actionButtonsRow}>
//                   <TouchableOpacity style={styles.profileOutlineBtn} onPress={viewDriverProfile}>
//                     <Text style={styles.profileOutlineBtnText}>View Full Profile</Text>
//                   </TouchableOpacity>
//                   <TouchableOpacity style={styles.shareOutlineBtn} onPress={shareRideDetails}>
//                     <Ionicons name="share-outline" size={18} color="#2457A6" />
//                     <Text style={styles.shareOutlineBtnText}>Share</Text>
//                   </TouchableOpacity>
//                 </View>
//               )}
//             </View>
            
//             {/* Driver's Rating for This Ride */}
//             {showDriverRating && driverRating && !isModificationRejected && (
//               <View style={styles.driverRatingCard}>
//                 <View style={styles.driverRatingHeader}>
//                   <Ionicons name="star" size={18} color="#F59E0B" />
//                   <Text style={styles.driverRatingTitle}>Driver's Rating for this Ride</Text>
//                 </View>
//                 <View style={styles.driverRatingContent}>
//                   <RatingStars rating={driverRating} size={20} />
//                   {driverFeedbackText ? (
//                     <Text style={styles.driverFeedbackText}>"{driverFeedbackText}"</Text>
//                   ) : (
//                     <Text style={styles.driverFeedbackPlaceholder}>No feedback provided</Text>
//                   )}
//                 </View>
//               </View>
//             )}
            
//             {/* Trip Timeline Section */}
//             {tripTimeline.length > 0 && (
//               <View style={styles.cardSection}>
//                 <TouchableOpacity 
//                   style={styles.timelineHeader} 
//                   onPress={() => setTimelineExpanded(!timelineExpanded)}
//                 >
//                   <View style={styles.timelineHeaderLeft}>
//                     <Ionicons name="map-outline" size={20} color="#2457A6" />
//                     <Text style={styles.sectionTitle}>Your Trip Timeline</Text>
//                     <Text style={styles.timelineStopCount}>({tripTimeline.length} stops)</Text>
//                   </View>
//                   <Ionicons 
//                     name={timelineExpanded ? "chevron-up" : "chevron-down"} 
//                     size={20} 
//                     color={Colors.gray} 
//                   />
//                 </TouchableOpacity>
                
//                 {timelineExpanded && (
//                   <View style={styles.timelineContainer}>
//                     {tripTimeline.map((item, index) => renderTimelineItem(item, index))}
//                   </View>
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
//                   <Text style={styles.tripOverviewValue}>{riderPickupAddress}</Text>
//                   {walkDistances.pickupWalk > 0 && (
//                     <Text style={styles.walkDistanceText}>🚶 {walkDistances.pickupWalk}m walk to pickup</Text>
//                   )}
//                 </View>
//                 <View style={styles.tripOverviewArrow}>
//                   <Ionicons name="arrow-down-outline" size={16} color="#2457A6" />
//                 </View>
//                 <View style={styles.tripOverviewItem}>
//                   <Text style={styles.tripOverviewLabel}>To</Text>
//                   <Text style={styles.tripOverviewValue}>{riderDropoffAddress}</Text>
//                   {walkDistances.dropWalk > 0 && (
//                     <Text style={styles.walkDistanceText}>🚶 {walkDistances.dropWalk}m walk from dropoff</Text>
//                   )}
//                 </View>
//               </View>
//               <View style={styles.tripOverviewStats}>
//                 <View style={styles.tripOverviewStat}>
//                   <Ionicons name="calendar-outline" size={16} color="#6B7280" />
//                   <Text style={styles.tripOverviewStatText}>{formatDate(currentRide?.departure_time)}</Text>
//                 </View>
//                 {currentRide?.distance_km && (
//                   <View style={styles.tripOverviewStat}>
//                     <Ionicons name="map-outline" size={16} color="#6B7280" />
//                     <Text style={styles.tripOverviewStatText}>{currentRide.distance_km} km</Text>
//                   </View>
//                 )}
//                 {currentRide?.duration_text && (
//                   <View style={styles.tripOverviewStat}>
//                     <Ionicons name="time-outline" size={16} color="#6B7280" />
//                     <Text style={styles.tripOverviewStatText}>{currentRide.duration_text}</Text>
//                   </View>
//                 )}
//               </View>
//             </View>
            
//             {/* Vehicle Details */}
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
            
//             {/* Seat Availability */}
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
            
//             {/* Ride Preferences */}
//             {allPreferences.length > 0 && (
//               <View style={styles.cardSection}>
//                 <Text style={styles.sectionTitle}>🎯 Ride Preferences</Text>
//                 <View style={styles.tagRow}>
//                   {allPreferences.map((pref, index) => {
//                     const isActive = !pref.includes(':') && 
//                       !pref.toLowerCase().includes('not') &&
//                       !pref.toLowerCase().includes('no');
//                     return (
//                       <PreferenceTag key={`${pref}-${index}`} label={pref} isActive={isActive} />
//                     );
//                   })}
//                 </View>
//               </View>
//             )}
            
//             {/* Booking Details */}
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
//                     <Text style={[styles.bookingDetailValue, isModificationRejected && styles.strikethroughText]}>
//                       {userBooking.seats_requested}
//                       {isModificationApproved && " (Updated)"}
//                     </Text>
//                   </View>
//                   <View style={styles.bookingDetailRow}>
//                     <Text style={styles.bookingDetailLabel}>Price per Seat</Text>
//                     <Text style={[styles.bookingDetailValue, isModificationRejected && styles.strikethroughText]}>
//                       ₹{currentRide?.price || currentRide?.price_per_seat || 0}
//                     </Text>
//                   </View>
//                   <View style={[styles.bookingDetailRow, styles.bookingTotalRow]}>
//                     <Text style={styles.bookingTotalLabel}>Total Amount</Text>
//                     <Text style={[styles.bookingTotalValue, isModificationRejected && styles.strikethroughText]}>
//                       ₹{totalAmountPaid}
//                     </Text>
//                   </View>
//                   <View style={styles.bookingDetailRow}>
//                     <Text style={styles.bookingDetailLabel}>Status</Text>
//                     <View style={[styles.bookingStatusBadge, { backgroundColor: isModificationRejected ? '#FEE2E2' : (userBooking.status === 'accepted' ? '#10B98120' : userBooking.status === 'pending' ? '#F59E0B20' : '#EF444420') }]}>
//                       <Text style={[styles.bookingStatusText, { color: isModificationRejected ? '#DC2626' : (userBooking.status === 'accepted' ? '#10B981' : userBooking.status === 'pending' ? '#F59E0B' : '#EF4444') }]}>
//                         {isModificationRejected ? 'Booking Cancelled' : (isModificationApproved ? 'Modified' : (userBooking.status === 'accepted' ? 'Confirmed' : userBooking.status === 'pending' ? 'Pending' : userBooking.status))}
//                       </Text>
//                     </View>
//                   </View>
//                 </>
//               ) : (
//                 <Text style={styles.emptyText}>No booking information available</Text>
//               )}
              
//               {/* Modify Seats Button - One Time Only */}
//               {modificationsAllowed && userBooking?.status === "accepted" && !isAutoCancelled && totalSeatsOffered > 0 && !isModificationRejected && !isModificationPending && !isModificationApproved && rideStatusInfo.type !== 'ongoing' && rideStatusInfo.type !== 'completed' && (
//                 <>
//                   <View style={styles.divider} />
//                   <Text style={styles.sectionSubtitle}>Modify Seats (One-time)</Text>
//                   {otherBookedSeats > 0 && (
//                     <View style={styles.otherBookedInfo}>
//                       <Ionicons name="information-circle" size={14} color="#F59E0B" />
//                       <Text style={styles.otherBookedInfoText}>{otherBookedSeats} seat(s) booked by others</Text>
//                     </View>
//                   )}
//                   <TouchableOpacity 
//                     style={styles.modifySeatsMainBtn}
//                     onPress={openModifySeatsModal}
//                     disabled={modifyingSeats}>
//                     <Ionicons name="swap" size={18} color={Colors.primary} />
//                     <Text style={styles.modifySeatsMainBtnText}>
//                       {modifyingSeats ? 'Processing...' : 'Request Seat Change'}
//                     </Text>
//                   </TouchableOpacity>
//                   <Text style={styles.modifySeatsNoteText}>
//                     ⚠️ One-time modification only. Request needs driver approval.
//                   </Text>
//                 </>
//               )}
              
//               {/* Cancel Modification Button */}
//               {isModificationPending && (
//                 <TouchableOpacity 
//                   style={styles.cancelModificationMainBtn}
//                   onPress={handleCancelModificationRequest}
//                   disabled={modifyingSeats}>
//                   <Ionicons name="close-circle-outline" size={18} color="#DC2626" />
//                   <Text style={styles.cancelModificationMainBtnText}>
//                     {modifyingSeats ? 'Cancelling...' : 'Cancel Modification Request'}
//                   </Text>
//                 </TouchableOpacity>
//               )}
              
//               {/* Cancel Booking */}
//               {cancellationsAllowed && userBooking?.status !== "rejected" && !isAutoCancelled && rideStatusInfo.type !== 'ongoing' && rideStatusInfo.type !== 'completed' && !isModificationRejected && !isModificationPending && (
//                 <TouchableOpacity style={[styles.cancelBookingMainBtn, (modifyingSeats || cancelLoading) && styles.cancelBookingMainBtnDisabled]} onPress={() => setShowCancelModal(true)} disabled={modifyingSeats || cancelLoading}>
//                   <Text style={styles.cancelBookingMainBtnText}>{userBooking?.status === "pending" ? "Cancel Request" : "Cancel Booking"}</Text>
//                 </TouchableOpacity>
//               )}
//             </View>
            
//             {/* Other Riders */}
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
//             <RatingStars rating={rating} size={32} onPress={setRating} />
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
//                 Current seats: {userBooking?.seats_requested || 1}
//               </Text>
//             </View>
            
//             <View style={styles.modifySeatsActions}>
//               <TouchableOpacity 
//                 style={styles.modifySeatsCancelBtn} 
//                 onPress={() => setModifySeatsModalVisible(false)}>
//                 <Text style={styles.modifySeatsCancelBtnText}>Cancel</Text>
//               </TouchableOpacity>
//               <TouchableOpacity 
//                 style={[styles.modifySeatsSubmitBtn, modifyingSeats && styles.modifySeatsSubmitBtnDisabled]} 
//                 onPress={submitModifySeatsRequest}
//                 disabled={modifyingSeats}>
//                 <Text style={styles.modifySeatsSubmitBtnText}>
//                   {modifyingSeats ? 'Sending...' : 'Send Request'}
//                 </Text>
//               </TouchableOpacity>
//             </View>
            
//             <Text style={styles.modifySeatsNote}>
//               ⚠️ Note: This request needs driver approval. If rejected, your booking will be cancelled.
//             </Text>
//           </View>
//         </View>
//       </Modal>
      
//       <ProfileImageModal visible={selectedProfile.visible} imageUrl={selectedProfile.imageUrl} driverName={selectedProfile.driverName} onClose={() => setSelectedProfile({ visible: false, imageUrl: null, driverName: '' })} />
//       <CustomAlert visible={alertVisible} title={alertConfig.title} message={alertConfig.message} icon={alertConfig.icon} iconColor={alertConfig.iconColor} buttons={alertConfig.buttons} onBackdropPress={() => setAlertVisible(false)} />
//     </View>
//   );
// }

// // ============================================
// // STYLES (Same as previous response - keeping for completeness)
// // ============================================

// const styles = StyleSheet.create({
//   container: { flex: 1, backgroundColor: '#F4F5F7' },
//   mapContainer: { width: '100%', overflow: 'hidden', backgroundColor: '#E8EEF7', position: 'relative' },
//   map: { flex: 1, backgroundColor: '#E8EEF7' },
//   mapBackButton: { position: 'absolute', top: Platform.OS === 'ios' ? 54 : 22, left: 14, width: 42, height: 42, borderRadius: 25, backgroundColor: 'rgba(255,255,255,0.96)', alignItems: 'center', justifyContent: 'center', shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4, elevation: 3 },
  
//   // Map Legend
//   mapLegend: { position: 'absolute', bottom: 10, right: 10, backgroundColor: 'rgba(255,255,255,0.95)', borderRadius: 12, padding: 10, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4, elevation: 3, minWidth: 120 },
//   legendTitle: { marginBottom: 6, paddingBottom: 4, borderBottomWidth: 1, borderBottomColor: '#E5E7EB' },
//   legendTitleText: { fontSize: 11, fontWeight: '700', color: '#333' },
//   legendItem: { flexDirection: 'row', alignItems: 'center', marginBottom: 4 },
//   legendColor: { width: 16, height: 4, borderRadius: 2, marginRight: 6 },
//   legendDot: { width: 10, height: 10, borderRadius: 5, marginRight: 8 },
//   legendText: { fontSize: 10, color: '#555' },
//   mapControls: { position: 'absolute', bottom: 10, left: 10 },
//   mapControlButton: { backgroundColor: 'rgba(255,255,255,0.95)', width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center', shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4, elevation: 3 },
//   mapCustomMarker: { alignItems: 'center', justifyContent: 'center', borderWidth: 2, borderColor: '#fff', shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.25, shadowRadius: 4, elevation: 5, position: 'relative' },
//   mapWalkBadge: { position: 'absolute', bottom: -8, left: '50%', transform: [{ translateX: -15 }], flexDirection: 'row', alignItems: 'center', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 10, gap: 2 },
//   mapWalkBadgeText: { fontSize: 8, color: '#fff', fontWeight: 'bold' },
//   liveRing: { position: 'absolute', width: 50, height: 50, borderRadius: 25, backgroundColor: 'rgba(36,87,166,0.2)', borderWidth: 1, borderColor: '#2457A6', top: -5, left: -5 },
//   liveRingInner: { width: '100%', height: '100%', borderRadius: 25, backgroundColor: 'transparent' },
  
//   // Drawer
//   drawer: { position: 'absolute', bottom: 0, left: 0, right: 0, backgroundColor: '#F4F5F7', borderTopLeftRadius: 28, borderTopRightRadius: 28, overflow: 'hidden', shadowColor: '#000', shadowOffset: { width: 0, height: -2 }, shadowOpacity: 0.1, shadowRadius: 8, elevation: 10 },
//   handleWrap: { alignItems: 'center', paddingTop: 10, paddingBottom: 8, backgroundColor: '#F4F5F7', position: 'relative' },
//   handleHitArea: { paddingHorizontal: 40, paddingVertical: 10, alignItems: 'center', justifyContent: 'center' },
//   handleBar: { width: 64, height: 6, borderRadius: 99, backgroundColor: '#CDD2D8' },
//   collapsedSummary: { paddingHorizontal: 16, paddingTop: 4, paddingBottom: 12 },
//   collapsedTopRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12 },
//   collapsedStatusRow: { marginBottom: 6 },
//   collapsedStatusBadge: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 8, paddingVertical: 3, borderRadius: 12, gap: 4, alignSelf: 'flex-start' },
//   collapsedStatusText: { fontSize: 10, fontWeight: '600' },
//   collapsedDriver: { fontSize: 16, fontWeight: '800', color: Colors.dark },
//   collapsedSub: { marginTop: 2, fontSize: 12, color: Colors.gray, fontWeight: '600' },
//   collapsedPriceWrap: { alignItems: 'flex-end' },
//   collapsedPrice: { fontSize: 18, fontWeight: '900', color: Colors.dark },
//   collapsedPerSeat: { fontSize: 10, color: Colors.gray, fontWeight: '600' },
//   collapsedTripInfo: { marginTop: 6, paddingTop: 6, borderTopWidth: 1, borderTopColor: '#EEF2F7' },
//   collapsedTripText: { fontSize: 11, color: '#6B7280' },
//   drawerScroll: { flex: 1 },
//   drawerContent: { paddingHorizontal: 16, paddingBottom: 16 },
  
//   // Status Banner
//   statusBanner: { flexDirection: 'row', alignItems: 'flex-start', padding: 14, borderRadius: 16, marginBottom: 14, gap: 12 },
//   statusBannerTextContainer: { flex: 1 },
//   statusBannerTitle: { fontSize: 16, fontWeight: '800' },
//   statusBannerSubtitle: { fontSize: 12, color: '#6B7280', marginTop: 4 },
  
//   // Modification Cards
//   modificationPendingCard: { backgroundColor: '#FFFBEB', borderRadius: 12, padding: 12, marginBottom: 12, borderWidth: 1, borderColor: '#FDE68A' },
//   modificationPendingHeader: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 8 },
//   modificationPendingTitle: { fontSize: 14, fontWeight: '700', color: '#92400E' },
//   modificationPendingDetails: { paddingLeft: 34 },
//   modificationPendingText: { fontSize: 13, color: '#78350F', marginBottom: 4 },
//   modificationPendingSubtext: { fontSize: 11, color: '#B45309' },
//   modificationApprovedCard: { backgroundColor: '#E8F5E9', borderRadius: 12, padding: 12, marginBottom: 12, borderWidth: 1, borderColor: '#C8E6C9' },
//   modificationRejectedBanner: { flexDirection: 'row', alignItems: 'flex-start', backgroundColor: '#FEF2F2', padding: 14, borderRadius: 16, marginBottom: 14, gap: 12, borderWidth: 1, borderColor: '#FEE2E2' },
//   modificationRejectedTitle: { fontSize: 14, fontWeight: '700', color: '#DC2626', marginBottom: 4 },
//   modificationRejectedText: { fontSize: 12, color: '#991B1B', marginBottom: 2 },
//   modificationRejectedReason: { fontSize: 11, color: '#DC2626', fontStyle: 'italic', marginTop: 4 },
//   modificationRejectedNote: { fontSize: 11, color: '#6B7280', marginTop: 6 },
  
//   // Driver Card
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
//   chatButton: { width: 44, height: 44, borderRadius: 22, backgroundColor: '#E8F0FE', alignItems: 'center', justifyContent: 'center' },
//   actionButtonsRow: { flexDirection: 'row', gap: 12, marginTop: 14 },
//   profileOutlineBtn: { flex: 2, borderWidth: 1, borderColor: '#2457A6', borderRadius: 16, paddingVertical: 12, alignItems: 'center' },
//   profileOutlineBtnText: { color: '#2457A6', fontWeight: '700', fontSize: 14 },
//   shareOutlineBtn: { flex: 1, borderWidth: 1, borderColor: '#2457A6', borderRadius: 16, paddingVertical: 12, alignItems: 'center', flexDirection: 'row', justifyContent: 'center', gap: 6 },
//   shareOutlineBtnText: { color: '#2457A6', fontWeight: '700', fontSize: 14 },
  
//   // Driver Rating Card
//   driverRatingCard: { backgroundColor: '#FFFBEB', borderRadius: 16, padding: 14, marginBottom: 14, borderWidth: 1, borderColor: '#FDE68A' },
//   driverRatingHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 10 },
//   driverRatingTitle: { fontSize: 13, fontWeight: '600', color: '#92400E' },
//   driverRatingContent: { alignItems: 'center', gap: 8 },
//   driverFeedbackText: { fontSize: 13, color: '#78350F', fontStyle: 'italic', textAlign: 'center' },
//   driverFeedbackPlaceholder: { fontSize: 12, color: '#B45309', opacity: 0.7, fontStyle: 'italic' },
  
//   // Card Sections
//   cardSection: { backgroundColor: 'white', borderRadius: 20, padding: 16, marginBottom: 14, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 8, elevation: 2 },
//   sectionTitle: { fontSize: 16, fontWeight: '800', color: Colors.dark, marginBottom: 0 },
//   sectionSubtitle: { fontSize: 14, fontWeight: '600', color: Colors.dark, marginBottom: 12, marginTop: 8 },
  
//   // Trip Timeline
//   timelineHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
//   timelineHeaderLeft: { flexDirection: 'row', alignItems: 'center', gap: 8, flex: 1 },
//   timelineStopCount: { fontSize: 12, color: Colors.gray, fontWeight: '500', marginLeft: 4 },
//   timelineContainer: { marginTop: 16 },
//   timelineItemCard: { flexDirection: 'row', marginBottom: 20 },
//   timelineItemLeft: { width: 40, alignItems: 'center', position: 'relative' },
//   timelineItemDot: { width: 32, height: 32, borderRadius: 16, alignItems: 'center', justifyContent: 'center', borderWidth: 2, borderColor: '#fff', shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.1, shadowRadius: 2, elevation: 2 },
//   timelineItemIcon: { fontSize: 16 },
//   timelineItemLine: { width: 2, flex: 1, marginVertical: 4 },
//   timelineItemRight: { flex: 1, paddingLeft: 12, paddingBottom: 8 },
//   timelineItemHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 },
//   timelineItemType: { fontSize: 11, fontWeight: '700', color: '#6B7280', letterSpacing: 0.5 },
//   segmentBadge: { backgroundColor: '#F3F4F6', paddingHorizontal: 8, paddingVertical: 2, borderRadius: 10 },
//   segmentBadgeText: { fontSize: 10, color: '#6B7280', fontWeight: '500' },
//   timelineItemTitle: { fontSize: 15, fontWeight: '700', color: Colors.dark, marginBottom: 6 },
//   timelineItemAddress: { fontSize: 12, color: '#6B7280', marginBottom: 8, lineHeight: 16 },
//   walkingChip: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 10, paddingVertical: 5, borderRadius: 16, alignSelf: 'flex-start', marginBottom: 8 },
//   walkingChipText: { fontSize: 11, fontWeight: '500' },
//   routeInfo: { flexDirection: 'row', flexWrap: 'wrap', gap: 12, marginBottom: 8, paddingTop: 6, borderTopWidth: 1, borderTopColor: '#F0F0F0' },
//   routeInfoItem: { flexDirection: 'row', alignItems: 'center', gap: 4 },
//   routeInfoText: { fontSize: 11, color: '#6B7280' },
//   cumulativeInfo: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 10 },
//   cumulativeInfoText: { fontSize: 11, color: '#10B981', fontWeight: '500' },
//   navigateButton: { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: '#EAF1FF', paddingHorizontal: 12, paddingVertical: 8, borderRadius: 20, alignSelf: 'flex-start' },
//   navigateButtonText: { fontSize: 12, color: '#2457A6', fontWeight: '600' },
  
//   // Trip Overview
//   tripOverviewCard: { backgroundColor: '#EAF1FF', borderRadius: 20, padding: 16, marginBottom: 14 },
//   tripOverviewHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 12 },
//   tripOverviewTitle: { fontSize: 16, fontWeight: '800', color: '#2457A6' },
//   tripOverviewDetails: { marginBottom: 12 },
//   tripOverviewItem: { marginBottom: 8 },
//   tripOverviewLabel: { fontSize: 11, color: '#6B7280', marginBottom: 2 },
//   tripOverviewValue: { fontSize: 14, fontWeight: '600', color: Colors.dark },
//   walkDistanceText: { fontSize: 11, color: '#6B7280', marginTop: 2 },
//   tripOverviewArrow: { alignItems: 'center', marginVertical: 4 },
//   tripOverviewStats: { flexDirection: 'row', flexWrap: 'wrap', gap: 12, paddingTop: 12, borderTopWidth: 1, borderTopColor: '#CDD9F0' },
//   tripOverviewStat: { flexDirection: 'row', alignItems: 'center', gap: 4 },
//   tripOverviewStatText: { fontSize: 12, color: '#6B7280' },
  
//   // Vehicle Details
//   vehicleDetailRow: { flexDirection: 'row', alignItems: 'center', gap: 16 },
//   vehicleDetailInfo: { flex: 1 },
//   vehicleDetailName: { fontSize: 15, fontWeight: '600', color: Colors.dark },
//   vehicleDetailColor: { fontSize: 13, color: '#6B7280', marginTop: 2 },
//   vehicleDetailReg: { fontSize: 12, color: '#9CA3AF', marginTop: 2 },
//   vehicleDetailSeats: { fontSize: 12, color: '#6B7280', marginTop: 2 },
  
//   // Seat Stats
//   seatStatsRow: { flexDirection: 'row', justifyContent: 'space-around', marginBottom: 16 },
//   seatStat: { alignItems: 'center' },
//   seatStatValue: { fontSize: 24, fontWeight: '800', color: Colors.dark },
//   seatStatLabel: { fontSize: 12, color: Colors.gray, marginTop: 4 },
//   seatProgressContainer: { height: 6, backgroundColor: '#E5E7EB', borderRadius: 3, overflow: 'hidden', marginBottom: 8 },
//   seatProgressBar: { height: '100%', backgroundColor: '#10B981', borderRadius: 3 },
  
//   // Preferences
//   tagRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 14 },
//   preferenceTag: { paddingHorizontal: 12, paddingVertical: 8, borderRadius: 999 },
//   preferenceTagText: { fontSize: 12, fontWeight: '700' },
  
//   // Booking Details
//   bookingDetailRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 8 },
//   bookingDetailLabel: { fontSize: 14, color: Colors.gray },
//   bookingDetailValue: { fontSize: 14, fontWeight: '600', color: Colors.dark },
//   bookingTotalRow: { marginTop: 8, paddingTop: 8, borderTopWidth: 1, borderTopColor: '#EEF2F7' },
//   bookingTotalLabel: { fontSize: 16, fontWeight: '700', color: Colors.dark },
//   bookingTotalValue: { fontSize: 18, fontWeight: '800', color: '#184080' },
//   bookingStatusBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20 },
//   bookingStatusText: { fontSize: 12, fontWeight: '600' },
//   strikethroughText: { textDecorationLine: 'line-through', color: '#9CA3AF' },
//   divider: { height: 1, backgroundColor: '#EEF2F7', marginVertical: 16 },
//   otherBookedInfo: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFFBEB', padding: 10, borderRadius: 8, marginBottom: 12, gap: 8 },
//   otherBookedInfoText: { flex: 1, fontSize: 11, color: '#B45309' },
  
//   // Modify Seats - One Time
//   modifySeatsMainBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', backgroundColor: '#EEF6FF', borderWidth: 1, borderColor: Colors.primary, borderRadius: 12, paddingVertical: 12, gap: 8, marginTop: 12 },
//   modifySeatsMainBtnText: { fontSize: 14, fontWeight: '600', color: Colors.primary },
//   modifySeatsNoteText: { fontSize: 10, color: '#9CA3AF', textAlign: 'center', marginTop: 8 },
  
//   cancelModificationMainBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', backgroundColor: '#FEF2F2', borderWidth: 1, borderColor: '#EF4444', borderRadius: 12, paddingVertical: 12, gap: 8, marginTop: 12 },
//   cancelModificationMainBtnText: { fontSize: 14, fontWeight: '600', color: '#EF4444' },
  
//   cancelBookingMainBtn: { marginTop: 12, backgroundColor: '#FEF2F2', paddingVertical: 12, borderRadius: 12, alignItems: 'center', borderWidth: 1, borderColor: '#EF4444' },
//   cancelBookingMainBtnText: { color: '#EF4444', fontWeight: '700', fontSize: 14 },
//   cancelBookingMainBtnDisabled: { opacity: 0.6 },
  
//   // Other Riders
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
  
//   // Safety Card
//   safetyCard: { backgroundColor: '#FFF3E7', borderRadius: 18, padding: 16, marginBottom: 14, flexDirection: 'row', alignItems: 'center', gap: 12 },
//   safetyTitle: { fontSize: 14, color: '#2457A6', fontWeight: '800' },
//   safetySub: { marginTop: 2, fontSize: 12, color: '#2457A6', opacity: 0.9, fontWeight: '600' },
  
//   // Loader
//   loaderContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#fff' },
  
//   // Modals
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
//   feedbackInput: { minHeight: 100, borderWidth: 1, borderColor: '#E5E7EB', borderRadius: 16, padding: 14, color: '#111827', fontSize: 14, width: '100%' },
//   modalActions: { flexDirection: 'row', gap: 10, marginTop: 18, width: '100%' },
//   skipBtn: { flex: 1, borderWidth: 1, borderColor: '#D1D5DB', borderRadius: 999, paddingVertical: 14, alignItems: 'center' },
//   skipBtnText: { color: '#6B7280', fontWeight: '600' },
//   submitBtn: { flex: 1, backgroundColor: Colors.primary, borderRadius: 999, paddingVertical: 14, alignItems: 'center' },
//   submitBtnText: { color: '#fff', fontWeight: '700' },
  
//   // Modify Seats Modal
//   modifySeatsModalContent: { backgroundColor: '#fff', borderRadius: 24, padding: 20, width: '90%', maxWidth: 400 },
//   modifySeatsModalHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 },
//   modifySeatsModalTitle: { fontSize: 20, fontWeight: '700', color: Colors.dark, flex: 1, marginLeft: 12 },
//   modifySeatsModalSubtitle: { fontSize: 14, color: '#6B7280', marginBottom: 24, textAlign: 'center' },
//   modifySeatsSeatSelector: { marginBottom: 20 },
//   modifySeatsLabel: { fontSize: 14, fontWeight: '600', color: Colors.dark, marginBottom: 12 },
//   modifySeatsControls: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 30 },
//   modifySeatsActionBtn: { width: 48, height: 48, borderRadius: 24, backgroundColor: '#F3F4F6', alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: '#E5E7EB' },
//   modifySeatsActionBtnDisabled: { opacity: 0.5 },
//   modifySeatsCountWrap: { alignItems: 'center' },
//   modifySeatsCount: { fontSize: 36, fontWeight: '800', color: Colors.primary },
//   modifySeatsMax: { fontSize: 12, color: '#6B7280', marginTop: 4 },
//   modifySeatsInfo: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#FEF3C7', padding: 12, borderRadius: 12, marginBottom: 20, gap: 8 },
//   modifySeatsInfoText: { fontSize: 13, color: '#92400E', flex: 1 },
//   modifySeatsActions: { flexDirection: 'row', gap: 12, marginBottom: 16 },
//   modifySeatsCancelBtn: { flex: 1, paddingVertical: 12, borderRadius: 12, borderWidth: 1, borderColor: '#D1D5DB', alignItems: 'center' },
//   modifySeatsCancelBtnText: { fontSize: 15, fontWeight: '600', color: '#6B7280' },
//   modifySeatsSubmitBtn: { flex: 1, paddingVertical: 12, borderRadius: 12, backgroundColor: Colors.primary, alignItems: 'center' },
//   modifySeatsSubmitBtnDisabled: { opacity: 0.6 },
//   modifySeatsSubmitBtnText: { fontSize: 15, fontWeight: '700', color: '#fff' },
//   modifySeatsNote: { fontSize: 11, color: '#9CA3AF', textAlign: 'center', fontStyle: 'italic' },
  
//   // Image Modal
//   imageModalContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', width: '100%' },
//   imageModalContent: { width: '90%', backgroundColor: Colors.white, borderRadius: 20, overflow: 'hidden', maxHeight: '80%' },
//   imageModalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 16, borderBottomWidth: 1, borderBottomColor: '#EEF2F7' },
//   imageModalTitle: { fontSize: 18, fontWeight: '700', color: Colors.dark },
//   fullProfileImage: { width: '100%', height: 400, backgroundColor: '#F5F5F5', resizeMode: 'contain' },
//   modalSvgContainer: { width: '100%', height: 400, backgroundColor: '#F5F5F5', alignItems: 'center', justifyContent: 'center' },
//   noImageContainer: { width: '100%', height: 400, justifyContent: 'center', alignItems: 'center', backgroundColor: '#F5F5F5' },
//   noImageText: { fontSize: 16, color: Colors.gray },
//   emptyText: { fontSize: 13, color: Colors.gray, fontWeight: '600' },
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
  LogBox,
  TextInput,
  Share,
  Alert,
  ActivityIndicator,
  RefreshControl,
  Linking,
} from 'react-native';
import MapView, { Marker, Polyline, PROVIDER_GOOGLE, Circle } from 'react-native-maps';
import { Ionicons } from '@expo/vector-icons';
import LottieView from "lottie-react-native";
import { SvgCssUri } from 'react-native-svg/css';
import { Colors } from '../constants/Colors';
import { useAuth } from '../context/AuthContext';
import { API_BASE_URL, GMAP_API_KEY } from '../config/config_ip';
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

function calculateDistance(lat1, lon1, lat2, lon2) {
  const R = 6371;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
            Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
            Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c;
}

function calculateTravelTime(distanceKm, avgSpeedKmh = 40) {
  const timeHours = distanceKm / avgSpeedKmh;
  return Math.round(timeHours * 60);
}

function formatDuration(minutes) {
  if (minutes < 60) return `${minutes} min`;
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`;
}

// Google Maps Geocoding Function
const getAddressFromCoordsGoogle = async (lat, lng) => {
  if (!lat || !lng) return null;
  try {
    const url = `https://maps.googleapis.com/maps/api/geocode/json?latlng=${lat},${lng}&key=${GMAP_API_KEY}&language=en`;
    const response = await fetch(url);
    const data = await response.json();
    if (data.status === 'OK' && data.results && data.results[0]) {
      return data.results[0].formatted_address;
    }
    return `${lat.toFixed(4)}, ${lng.toFixed(4)}`;
  } catch (error) {
    console.log('Geocoding error:', error);
    return `${lat.toFixed(4)}, ${lng.toFixed(4)}`;
  }
};

// ============================================
// COMPONENTS
// ============================================

function PreferenceTag({ label, isActive = true }) {
  if (!label || label.trim() === '') return null;
  
  let activeColor = '#E8F5E9';
  let activeTextColor = '#2E7D32';
  let inactiveColor = '#F3F4F6';
  let inactiveTextColor = '#9CA3AF';
  
  const lowerLabel = label.toLowerCase();
  if (lowerLabel.includes('age') || lowerLabel.includes('category')) {
    activeColor = '#E8F5E9'; activeTextColor = '#2E7D32';
  } else if (lowerLabel.includes('chat') || lowerLabel.includes('talk')) {
    activeColor = '#E3F2FD'; activeTextColor = '#1565C0';
  } else if (lowerLabel.includes('gender')) {
    activeColor = '#F3E5F5'; activeTextColor = '#6A1B9A';
  } else if (lowerLabel.includes('language') || lowerLabel.includes('speak')) {
    activeColor = '#FFF9C4'; activeTextColor = '#F57F17';
  }
  
  const isBooleanPref = ['women only', 'music', 'chat friendly', 'pets allowed', 'luggage space'].some(
    pref => lowerLabel.includes(pref)
  );
  
  if (isBooleanPref) {
    return (
      <View style={[styles.preferenceTag, { backgroundColor: isActive ? activeColor : inactiveColor }]}>
        <Text style={[styles.preferenceTagText, { color: isActive ? activeTextColor : inactiveTextColor }]}>
          {label}
        </Text>
      </View>
    );
  }
  
  return (
    <View style={[styles.preferenceTag, { backgroundColor: '#F3F4F6' }]}>
      <Text style={[styles.preferenceTagText, { color: '#6B7280' }]}>{label}</Text>
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

  // State for ride data
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
      return {
        id: Number(booking.id),
        seats_requested: Number(booking.seats_requested) || 1,
        status: booking.status || 'pending',
        total_amount: Number(booking.total_amount) || null,
        created_at: booking.created_at,
        pickup_address: booking.pickup_address,
        dropoff_address: booking.dropoff_address,
        intersection_pickup_lat: booking.intersection_pickup_lat,
        intersection_pickup_lon: booking.intersection_pickup_lon,
        pickup_lat: booking.pickup_lat,
        pickup_lon: booking.pickup_lon,
        drop_lat: booking.drop_lat,
        drop_lon: booking.drop_lon,
        pickup_walk_distance_m: booking.pickup_walk_distance_m,
        drop_walk_distance_m: booking.drop_walk_distance_m,
        modification_request: booking.modification_request,
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
  const [selectedBookingForModification, setSelectedBookingForModification] = useState(null);
  const [driverProfile, setDriverProfile] = useState(null);
  const [isVerified, setIsVerified] = useState(false);
  const [loadingProfile, setLoadingProfile] = useState(false);
  
  // Address states for geocoding
  const [addressCache, setAddressCache] = useState({});
  const [loadingAddresses, setLoadingAddresses] = useState(false);
  const [riderPickupAddress, setRiderPickupAddress] = useState(null);
  const [riderDropoffAddress, setRiderDropoffAddress] = useState(null);
  const [driverStartAddress, setDriverStartAddress] = useState(null);
  const [driverEndAddress, setDriverEndAddress] = useState(null);
  
  // UI State
  const [drawerExpanded, setDrawerExpanded] = useState(true);
  const [mapReady, setMapReady] = useState(false);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [ratingModalVisible, setRatingModalVisible] = useState(false);
  const [selectedProfile, setSelectedProfile] = useState({ visible: false, imageUrl: null, driverName: '' });
  const [alertVisible, setAlertVisible] = useState(false);
  const [alertConfig, setAlertConfig] = useState({ title: "", message: "", icon: "check-circle", iconColor: "#10B981", buttons: [] });
  const [refreshing, setRefreshing] = useState(false);
  const [timelineExpanded, setTimelineExpanded] = useState(true);
  const [selectedStopIndex, setSelectedStopIndex] = useState(null);
  
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
  const [modificationStatus, setModificationStatus] = useState(null);
  
  // Live tracking state
  const [liveSession, setLiveSession] = useState(null);
  const [driverLocation, setDriverLocation] = useState(null);
  const [socketConnected, setSocketConnected] = useState(false);
  
  // Rating state
  const [rating, setRating] = useState(0);
  const [feedback, setFeedback] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [hasRatedDriver, setHasRatedDriver] = useState(false);
  const [rideCompleted, setRideCompleted] = useState(false);
  
  // Driver's rating and feedback for this ride
  const [driverRating, setDriverRating] = useState(null);
  const [driverFeedbackText, setDriverFeedbackText] = useState('');
  const [showDriverRating, setShowDriverRating] = useState(false);
  
  // Cancel state
  const [cancelLoading, setCancelLoading] = useState(false);
  
  // Modify Seats Modal
  const [modifySeatsModalVisible, setModifySeatsModalVisible] = useState(false);
  const [modifySeatsValue, setModifySeatsValue] = useState(1);
  const [maxModifySeats, setMaxModifySeats] = useState(1);
  
  // Refs
  const animatedDrawer = useRef(new Animated.Value(1)).current;
  const mapRef = useRef(null);
  const socketRef = useRef(null);
  const hasShownRatingModal = useRef(false);
  
  // Animation values
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
  
  const getDriverPhoneNumber = () => {
    return currentRide?.phoneNumber || currentRide?.driver_phone;
  };
  // Replace your existing fetchAllAddresses function with this:
const fetchAllAddresses = useCallback(async () => {
  const coordinatesToFetch = [];
  
  // ✅ PRIORITY: Use saved addresses from booking first
  // Rider pickup address - use saved first
  if (userBooking?.pickup_address && userBooking.pickup_address !== 'null' && userBooking.pickup_address !== 'undefined') {
    let addressText = userBooking.pickup_address;
    if (userBooking.pickup_place_name && userBooking.pickup_place_name !== 'null') {
      addressText = `${addressText}\n📍 Landmark: ${userBooking.pickup_place_name}`;
    }
    const walkDist = userBooking?.pickup_walk_distance_m;
    if (walkDist && walkDist > 0) {
      addressText = `${addressText} (${walkDist}m walk to meeting point)`;
    }
    setRiderPickupAddress(addressText);
  } else if (userBooking?.pickup_place_name && userBooking.pickup_place_name !== 'null') {
    setRiderPickupAddress(`${userBooking.pickup_place_name} (Pickup point)`);
  }
  
  // Rider dropoff address - use saved first
  if (userBooking?.dropoff_address && userBooking.dropoff_address !== 'null' && userBooking.dropoff_address !== 'undefined') {
    let addressText = userBooking.dropoff_address;
    if (userBooking.dropoff_place_name && userBooking.dropoff_place_name !== 'null') {
      addressText = `${addressText}\n📍 Landmark: ${userBooking.dropoff_place_name}`;
    }
    const walkDist = userBooking?.drop_walk_distance_m;
    if (walkDist && walkDist > 0) {
      addressText = `${addressText} (${walkDist}m walk from meeting point)`;
    }
    setRiderDropoffAddress(addressText);
  } else if (userBooking?.dropoff_place_name && userBooking.dropoff_place_name !== 'null') {
    setRiderDropoffAddress(`${userBooking.dropoff_place_name} (Dropoff point)`);
  }
  
  // Driver start address - for reference only
  if (driverStartCoords?.latitude && driverStartCoords?.longitude) {
    const key = `${driverStartCoords.latitude},${driverStartCoords.longitude}`;
    if (!addressCache[key] && !coordinatesToFetch.find(c => c.key === key)) {
      coordinatesToFetch.push({ key, lat: driverStartCoords.latitude, lng: driverStartCoords.longitude, type: 'driver-start' });
    }
  }
  
  // Driver end address - for reference only
  if (driverEndCoords?.latitude && driverEndCoords?.longitude) {
    const key = `${driverEndCoords.latitude},${driverEndCoords.longitude}`;
    if (!addressCache[key] && !coordinatesToFetch.find(c => c.key === key)) {
      coordinatesToFetch.push({ key, lat: driverEndCoords.latitude, lng: driverEndCoords.longitude, type: 'driver-end' });
    }
  }
  
  // Only fetch coordinates for driver start/end if needed
  if (coordinatesToFetch.length > 0) {
    setLoadingAddresses(true);
    
    const batchSize = 5;
    for (let i = 0; i < coordinatesToFetch.length; i += batchSize) {
      const batch = coordinatesToFetch.slice(i, i + batchSize);
      await Promise.all(batch.map(async (coord) => {
        const address = await getAddressFromCoordsGoogle(coord.lat, coord.lng);
        setAddressCache(prev => ({ ...prev, [coord.key]: address }));
      }));
      
      if (i + batchSize < coordinatesToFetch.length) {
        await new Promise(resolve => setTimeout(resolve, 200));
      }
    }
    
    // Update driver addresses if needed
    if (driverStartCoords?.latitude && driverStartCoords?.longitude) {
      const key = `${driverStartCoords.latitude},${driverStartCoords.longitude}`;
      if (addressCache[key]) {
        setDriverStartAddress(addressCache[key]);
      } else if (currentRide?.origin && currentRide.origin !== 'null') {
        setDriverStartAddress(currentRide.origin);
      }
    }
    
    if (driverEndCoords?.latitude && driverEndCoords?.longitude) {
      const key = `${driverEndCoords.latitude},${driverEndCoords.longitude}`;
      if (addressCache[key]) {
        setDriverEndAddress(addressCache[key]);
      } else if (currentRide?.destination && currentRide.destination !== 'null') {
        setDriverEndAddress(currentRide.destination);
      }
    }
    
    setLoadingAddresses(false);
  }
}, [userBooking, currentRide, driverStartCoords, driverEndCoords, addressCache]);
  // Fetch all addresses using geocoding
//   const fetchAllAddresses = useCallback(async () => {
//     const coordinatesToFetch = [];
    
//     // Driver start address
//     if (driverStartCoords?.latitude && driverStartCoords?.longitude) {
//       const key = `${driverStartCoords.latitude},${driverStartCoords.longitude}`;
//       if (!addressCache[key] && !coordinatesToFetch.find(c => c.key === key)) {
//         coordinatesToFetch.push({ key, lat: driverStartCoords.latitude, lng: driverStartCoords.longitude, type: 'driver-start' });
//       }
//     }
    
//     // Rider pickup address
//     let pickupLat = null, pickupLng = null;
//     if (userBooking?.intersection_pickup_lat && userBooking?.intersection_pickup_lon) {
//       pickupLat = userBooking.intersection_pickup_lat;
//       pickupLng = userBooking.intersection_pickup_lon;
//     } else if (userBooking?.pickup_lat && userBooking?.pickup_lon) {
//       pickupLat = userBooking.pickup_lat;
//       pickupLng = userBooking.pickup_lon;
//     }
//     if (pickupLat && pickupLng) {
//       const key = `${pickupLat},${pickupLng}`;
//       if (!addressCache[key] && !coordinatesToFetch.find(c => c.key === key)) {
//         coordinatesToFetch.push({ key, lat: pickupLat, lng: pickupLng, type: 'rider-pickup' });
//       }
//     }
    
//     // Rider dropoff address
//     let dropLat = null, dropLng = null;
//     if (userBooking?.intersection_drop_lat && userBooking?.intersection_drop_lon) {
//       dropLat = userBooking.intersection_drop_lat;
//       dropLng = userBooking.intersection_drop_lon;
//     } else if (userBooking?.drop_lat && userBooking?.drop_lon) {
//       dropLat = userBooking.drop_lat;
//       dropLng = userBooking.drop_lon;
//     }
//     if (dropLat && dropLng) {
//       const key = `${dropLat},${dropLng}`;
//       if (!addressCache[key] && !coordinatesToFetch.find(c => c.key === key)) {
//         coordinatesToFetch.push({ key, lat: dropLat, lng: dropLng, type: 'rider-dropoff' });
//       }
//     }
    
//     // Driver end address
//     if (driverEndCoords?.latitude && driverEndCoords?.longitude) {
//       const key = `${driverEndCoords.latitude},${driverEndCoords.longitude}`;
//       if (!addressCache[key] && !coordinatesToFetch.find(c => c.key === key)) {
//         coordinatesToFetch.push({ key, lat: driverEndCoords.latitude, lng: driverEndCoords.longitude, type: 'driver-end' });
//       }
//     }
    
//     if (coordinatesToFetch.length === 0) return;
    
//     setLoadingAddresses(true);
    
//     const batchSize = 5;
//     for (let i = 0; i < coordinatesToFetch.length; i += batchSize) {
//       const batch = coordinatesToFetch.slice(i, i + batchSize);
//       await Promise.all(batch.map(async (coord) => {
//         const address = await getAddressFromCoordsGoogle(coord.lat, coord.lng);
//         setAddressCache(prev => ({ ...prev, [coord.key]: address }));
//       }));
      
//       if (i + batchSize < coordinatesToFetch.length) {
//         await new Promise(resolve => setTimeout(resolve, 200));
//       }
//     }
    
//     // Update state addresses
//     if (driverStartCoords?.latitude && driverStartCoords?.longitude) {
//       const key = `${driverStartCoords.latitude},${driverStartCoords.longitude}`;
//       if (addressCache[key]) {
//         setDriverStartAddress(addressCache[key]);
//       } else if (currentRide?.origin && currentRide.origin !== 'null') {
//         setDriverStartAddress(currentRide.origin);
//       }
//     }
    
//     if (driverEndCoords?.latitude && driverEndCoords?.longitude) {
//       const key = `${driverEndCoords.latitude},${driverEndCoords.longitude}`;
//       if (addressCache[key]) {
//         setDriverEndAddress(addressCache[key]);
//       } else if (currentRide?.destination && currentRide.destination !== 'null') {
//         setDriverEndAddress(currentRide.destination);
//       }
//     }
    
//     // Set rider addresses
//     let pickupAddressText = null;
//     let dropoffAddressText = null;
    
//     if (pickupLat && pickupLng) {
//       const pickupKey = `${pickupLat},${pickupLng}`;
//       if (addressCache[pickupKey]) {
//         pickupAddressText = addressCache[pickupKey];
//         const walkDist = userBooking?.pickup_walk_distance_m;
//         if (walkDist && walkDist > 0) {
//           pickupAddressText = `${pickupAddressText} (${walkDist}m walk)`;
//         }
//       } else if (userBooking?.pickup_address && userBooking.pickup_address !== 'null') {
//         pickupAddressText = userBooking.pickup_address;
//       } else if (currentRide?.origin && currentRide.origin !== 'null') {
//         pickupAddressText = currentRide.origin;
//       } else {
//         pickupAddressText = `${pickupLat.toFixed(6)}, ${pickupLng.toFixed(6)}`;
//       }
//     } else if (userBooking?.pickup_address && userBooking.pickup_address !== 'null') {
//       pickupAddressText = userBooking.pickup_address;
//     } else if (currentRide?.origin && currentRide.origin !== 'null') {
//       pickupAddressText = currentRide.origin;
//     }
//     setRiderPickupAddress(pickupAddressText || 'Pickup location not specified');
    
//     if (dropLat && dropLng) {
//       const dropKey = `${dropLat},${dropLng}`;
//       if (addressCache[dropKey]) {
//         dropoffAddressText = addressCache[dropKey];
//         const walkDist = userBooking?.drop_walk_distance_m;
//         if (walkDist && walkDist > 0) {
//           dropoffAddressText = `${dropoffAddressText} (${walkDist}m walk)`;
//         }
//       } else if (userBooking?.dropoff_address && userBooking.dropoff_address !== 'null') {
//         dropoffAddressText = userBooking.dropoff_address;
//       } else if (currentRide?.destination && currentRide.destination !== 'null') {
//         dropoffAddressText = currentRide.destination;
//       } else {
//         dropoffAddressText = `${dropLat.toFixed(6)}, ${dropLng.toFixed(6)}`;
//       }
//     } else if (userBooking?.dropoff_address && userBooking.dropoff_address !== 'null') {
//       dropoffAddressText = userBooking.dropoff_address;
//     } else if (currentRide?.destination && currentRide.destination !== 'null') {
//       dropoffAddressText = currentRide.destination;
//     }
//     setRiderDropoffAddress(dropoffAddressText || 'Dropoff location not specified');
    
//     setLoadingAddresses(false);
//   }, [userBooking, currentRide, driverStartCoords, driverEndCoords, addressCache]);
  
  const handleChatWithDriver = async () => {
    const driverPhone = getDriverPhoneNumber();
    const driverName = driverProfile?.full_name || currentRide?.driverName || 'Driver';
    
    if (!driverPhone) {
      showCustomAlert('Error', 'Driver contact information not available', 'error');
      return;
    }
    
    try {
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
const handleNavigateToLocation = (latitude, longitude, title, address = null) => {
  console.log('📍 Navigating to:', { latitude, longitude, title, address });
  
  let navigationUrl;
  
  // PRIORITY 1: Use saved address if available (better for navigation)
  if (address && address !== 'null' && address !== 'undefined' && address.trim() !== '') {
    const encodedAddress = encodeURIComponent(address);
    
    if (Platform.OS === 'ios') {
      // iOS Apple Maps
      navigationUrl = `maps://0,0?q=${encodedAddress}`;
    } else {
      // Android Google Maps
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
    // Fallback to coordinates if address navigation fails
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
  
  // Get ride status for passenger view
  const getPassengerRideStatusInfo = useCallback(() => {
    const ride = currentRide;
    const now = new Date();
    const departureTime = new Date(ride?.departure_time);
    const hoursSinceDeparture = (now - departureTime) / (1000 * 60 * 60);
    const minutesSinceDeparture = (now - departureTime) / (1000 * 60);
    const minutesToDeparture = (departureTime - now) / (1000 * 60);
    
    const hasRideStarted = ride?.started_at || ride?.status === 'ongoing';
    
    if (modificationStatus === 'pending') {
      return { 
        text: "Modification Pending", 
        color: "#F59E0B", 
        icon: "swap", 
        type: "modification-pending",
        reason: "Waiting for driver to approve your seat change request",
        hasStarted: hasRideStarted
      };
    }
    
    if (modificationStatus === 'approved') {
      return { 
        text: "Modification Approved", 
        color: "#10B981", 
        icon: "checkmark-circle", 
        type: "modification-approved",
        reason: "Your seat change request has been approved!",
        hasStarted: hasRideStarted
      };
    }
    
    if (modificationStatus === 'rejected') {
      return { 
        text: "Booking Cancelled", 
        color: "#DC2626", 
        icon: "close-circle", 
        type: "modification-rejected",
        reason: "Your modification request was rejected and booking cancelled",
        hasStarted: hasRideStarted
      };
    }
    
    if (userBooking?.modification_request?.status === "rejected") {
      return { 
        text: "Booking Cancelled", 
        color: "#DC2626", 
        icon: "close-circle", 
        type: "modification-rejected",
        reason: userBooking.modification_request.rejection_reason || "Your modification request was rejected and booking cancelled",
        hasStarted: hasRideStarted
      };
    }
    
    if (ride?.status === "completed" || rideCompleted) {
      return { text: "Completed", color: "#6B7280", icon: "checkmark-done", type: "completed", reason: null, hasStarted: true };
    }
    
    if (ride?.cancellation_reason) {
      if (ride.cancellation_reason.includes("Auto-cancelled")) {
        return { text: "Auto-cancelled", color: "#9CA3AF", icon: "timer-off", type: "auto-cancelled", reason: ride.cancellation_reason, hasStarted: false };
      }
      return { text: "Cancelled", color: "#DC2626", icon: "close-circle", type: "cancelled", reason: ride.cancellation_reason, hasStarted: false };
    }
    
    if (hoursSinceDeparture > 2 && !ride?.started_at && !rideCompleted) {
      return { text: "Auto-cancelled", color: "#9CA3AF", icon: "timer-off", type: "auto-cancelled", reason: "Ride auto-cancelled as it was not started within 2 hours of departure time", hasStarted: false };
    }
    
    if (ride?.started_at && ride.status !== "completed") {
      return { text: "Ongoing", color: "#10B981", icon: "car-sport", type: "ongoing", reason: null, hasStarted: true };
    }
    
    if (minutesSinceDeparture > 0 && minutesSinceDeparture <= 120 && !ride?.started_at) {
      return { text: `Driver Late - ${Math.round(minutesSinceDeparture)} min`, color: "#EF4444", icon: "alert-circle", type: "driver-late", reason: `Driver is ${Math.round(minutesSinceDeparture)} minutes late.`, hasStarted: false };
    }
    
    if (minutesToDeparture <= 15 && minutesToDeparture > 0 && !ride?.started_at) {
      return { text: `Starting in ${Math.round(minutesToDeparture)} min`, color: "#10B981", icon: "time-outline", type: "start-soon", reason: `Ride starts in ${Math.round(minutesToDeparture)} minutes.`, hasStarted: false };
    }
    
    if (minutesToDeparture > 15) {
      if (userBooking?.status === "accepted") {
        const hours = Math.floor(minutesToDeparture / 60);
        const mins = Math.round(minutesToDeparture % 60);
        const timeText = hours > 0 ? `${hours}h ${mins > 0 ? `${mins}m` : ''}` : `${mins}m`;
        return { text: `Upcoming - ${timeText}`, color: "#2457A6", icon: "calendar-outline", type: "upcoming", reason: `Ride departs in ${timeText}`, hasStarted: false };
      }
    }
    
    if (userBooking?.status === "accepted") {
      return { text: "Confirmed", color: "#10B981", icon: "checkmark-circle", type: "accepted", reason: "Your booking is confirmed", hasStarted: false };
    }
    if (userBooking?.status === "pending") {
      return { text: "Requested", color: "#F59E0B", icon: "time", type: "pending", reason: "Waiting for driver to accept your request", hasStarted: false };
    }
    if (userBooking?.status === "rejected") {
      return { text: "Rejected", color: "#DC2626", icon: "close-circle", type: "rejected", reason: "Your booking request was declined by the driver", hasStarted: false };
    }
    
    return { text: ride?.status || "Unknown", color: Colors.gray, icon: "ellipse", type: "unknown", reason: null, hasStarted: false };
  }, [currentRide, rideCompleted, userBooking?.status, userBooking?.modification_request, modificationStatus]);
  
  const fetchDriverRatingForRide = useCallback(async () => {
    if (!userBooking?.id) return;
    const bookingId = Number(userBooking.id);
    if (isNaN(bookingId)) return;
    try {
      const response = await fetch(`${API_BASE_URL}/api/v1/ride-feedback/driver/${bookingId}?_t=${Date.now()}`);
      const data = await response.json();
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
      const bookingId = Number(userBooking.id);
      const requestBody = {
        ride_booking_id: bookingId,
        rating: Number(rating),
        comment: feedback || '',
      };
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
        showCustomAlert('Error', 'Failed to submit rating.', 'error');
      }
    } catch (error) {
      console.error('Rating error:', error);
      showCustomAlert('Error', 'Network error. Please check your connection.', 'error');
    } finally {
      setSubmitting(false);
    }
  };
  
  const getCorrectRideId = useCallback(async () => {
    if (!userBooking?.id) return null;
    try {
      const response = await fetch(`${API_BASE_URL}/api/v1/bookings/${userBooking.id}/ride?_t=${Date.now()}`);
      const data = await response.json();
      if (data.success && data.ride) return data.ride.id;
      return null;
    } catch (error) {
      console.log('Error fetching ride from booking:', error);
      return null;
    }
  }, [userBooking?.id]);

  const fetchModificationRequests = useCallback(async () => {
    if (!userBooking?.id) return;
    try {
      const response = await fetch(`${API_BASE_URL}/booking/${userBooking.id}/modification-request?_t=${Date.now()}`);
      const data = await response.json();
      if (data.has_pending && data.request) {
        setPendingModificationRequest(data.request);
        setSeatModificationRequested(true);
        setPendingSeatsRequest(data.request.requested_seats);
        setPendingRequestDetails(data.request);
        setModificationStatus('pending');
      } else if (data.has_approved && data.request) {
        setModificationStatus('approved');
        setSeatModificationRequested(true);
        if (data.request.requested_seats !== (userBooking?.seats_requested || 1)) {
          setUserBooking(prev => ({ ...prev, seats_requested: data.request.requested_seats }));
          setSeatsRequested(data.request.requested_seats);
        }
      } else if (data.has_rejected && data.request) {
        setModificationStatus('rejected');
      } else {
        setPendingModificationRequest(null);
        setSeatModificationRequested(false);
        setPendingSeatsRequest(null);
        setPendingRequestDetails(null);
        setModificationStatus(null);
      }
    } catch (error) {
      console.log('Error fetching modification request:', error);
    }
  }, [userBooking?.id, userBooking?.seats_requested]);
  
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
      setModificationStatus(null);
      await fetchModificationRequests();
      await fetchSeatAvailability();
    } catch (error) {
      console.error('Cancel modification error:', error);
      showCustomAlert('Error', error.message || 'Failed to cancel modification request', 'error');
    } finally {
      setModifyingSeats(false);
    }
  };

  const checkModificationAvailability = async (bookingId) => {
    try {
      const response = await fetch(`${API_BASE_URL}/booking/${bookingId}/modification-available?_t=${Date.now()}`);
      const data = await response.json();
      return data;
    } catch (error) {
      console.log('Error checking modification availability:', error);
      return { available: false, reason: 'Could not check availability' };
    }
  };

const openModifySeatsModal = async () => {
  // Check if ride has already started
  const rideStatus = getPassengerRideStatusInfo();
  
  if (rideStatus.hasStarted === true) {
    showCustomAlert('Cannot Modify', 'You cannot modify seats after the ride has started.', 'warning');
    return;
  }
  
  // Check if modification is already pending
  if (modificationStatus === 'pending') {
    showCustomAlert('Modification Pending', 'You already have a pending modification request. Please wait for driver approval.', 'warning');
    return;
  }
  
  // Check if modification was already used (approved)
  if (modificationStatus === 'approved') {
    showCustomAlert('Modification Already Used', 'You have already used your one-time modification for this booking.', 'info');
    return;
  }
  
  // Check if modification was rejected
  if (modificationStatus === 'rejected') {
    showCustomAlert('Booking Cancelled', 'Your booking was cancelled due to modification rejection.', 'warning');
    return;
  }
  
  // Get fresh seat availability from the ride
  try {
    // Fetch current ride details with seat information
    const rideId = currentRide?.id;
    if (!rideId) {
      showCustomAlert('Error', 'Ride information not available.', 'error');
      return;
    }
    
    const availabilityResponse = await fetch(`${API_BASE_URL}/ride/${rideId}/seat-availability?_t=${Date.now()}`);
    const availabilityData = await availabilityResponse.json();
    
    console.log('📊 Seat Availability Response:', availabilityData);
    
    // Calculate available seats correctly
    // total_seats = total seats in vehicle
    // booked_seats = total seats already booked (including user's current seats)
    // available_for_new = total_seats - booked_seats (seats available for new bookings)
    
    const totalSeats = availabilityData.total_seats || currentRide?.available_seats || 4;
    const currentlyBookedSeats = availabilityData.booked_seats || totalBookedSeats || 0;
    const availableForNew = Math.max(0, totalSeats - currentlyBookedSeats);
    
    // For modification, user can request up to: their current seats + available_for_new
    const currentUserSeats = userBooking?.seats_requested || 1;
    const maxSeatsAllowed = currentUserSeats + availableForNew;
    
    // But cannot exceed total vehicle capacity
    const maxSeats = Math.min(maxSeatsAllowed, totalSeats);
    
    console.log(`📊 Seat Calculation:
      Total Seats: ${totalSeats}
      Currently Booked (including you): ${currentlyBookedSeats}
      Your Current Seats: ${currentUserSeats}
      Available for New Bookings: ${availableForNew}
      Max Seats You Can Request: ${maxSeats}
    `);
    
    if (maxSeats <= currentUserSeats) {
      showCustomAlert('No Additional Seats', `Only ${availableForNew} additional seat(s) available. You cannot increase your seat count at this time.`, 'warning');
      return;
    }
    
    setMaxModifySeats(maxSeats);
    setModifySeatsValue(currentUserSeats);
    
    // Store availability info for display in modal
    setSelectedBookingForModification({
      ...userBooking,
      total_seats: totalSeats,
      booked_seats: currentlyBookedSeats,
      available_seats: availableForNew,
      current_seats: currentUserSeats,
    });
    
    setModifySeatsModalVisible(true);
    
  } catch (error) {
    console.error('Error checking seat availability:', error);
    showCustomAlert('Error', 'Could not check seat availability. Please try again.', 'error');
  }
};

const submitModifySeatsRequest = async () => {
  if (!userBooking?.id) return;
  
  const currentSeats = userBooking.seats_requested || 1;
  
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
  
  setModifyingSeats(true);
  try {
    const response = await fetch(`${API_BASE_URL}/api/v1/modifications/request/${userBooking.id}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ requested_seats: modifySeatsValue }),
    });
    const data = await response.json();
    
    if (!response.ok) throw new Error(data.detail || data.message || 'Failed to send modification request');
    
    showCustomAlert('Request Sent', `Request to change to ${modifySeatsValue} seat(s) sent to driver.`, 'success');
    setModifySeatsModalVisible(false);
    setModificationStatus('pending');
    await fetchModificationRequests();
    onRefresh();
  } catch (error) {
    console.error('Modification request error:', error);
    showCustomAlert('Error', error.message || 'Failed to send modification request.', 'error');
  } finally {
    setModifyingSeats(false);
  }
};

  const fetchSeatAvailability = useCallback(async () => {
    let rideId = currentRide?.id;
    if (!rideId || rideId === 3 || rideId === 0) {
      const correctId = await getCorrectRideId();
      if (correctId) {
        rideId = correctId;
        setCurrentRide(prev => ({ ...prev, id: correctId }));
      } else {
        return;
      }
    }
    try {
      const url = `${API_BASE_URL.replace(/\/$/, '')}/ride/${rideId}/passengers?_t=${Date.now()}`;
      const response = await fetch(url);
      if (response.ok) {
        const data = await response.json();
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
          const acceptedPassengers = data.passengers.filter(p => p.status === 'accepted');
          const otherAccepted = acceptedPassengers.filter(p => {
            const passengerPhone = normalizePhone(p.passenger_phone);
            return passengerPhone !== currentUserPhone;
          });
          setOtherRiders(otherAccepted);
        } else {
          setOtherRiders([]);
        }
      }
    } catch (error) {
      console.log('Error fetching seat availability:', error);
    }
  }, [currentRide?.id, currentRide?.available_seats, user?.phone_number, getCorrectRideId]);

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
            origin_lat: data.ride.origin_latitude,
            origin_lon: data.ride.origin_longitude,
            destination_lat: data.ride.destination_latitude,
            destination_lon: data.ride.destination_longitude,
          }));
        }
      } catch (error) {
        console.log('Error fetching ride details:', error);
      }
    }
    if (!driverPhone && !driverUserId) return;
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

  const checkLiveSession = useCallback(async () => {
    const rideId = currentRide?.id;
    if (!rideId) return;
    try {
      const response = await fetch(`${API_BASE_URL}/ride/${rideId}/live-session`);
      const data = await response.json();
      if (data.success && data.session) {
        setLiveSession(data.session);
        if (data.session.status === 'active' && currentRide?.started_at) {
          setupSocketConnection(data.session.session_id);
        }
      }
    } catch (error) {
      console.log('Error checking live session:', error);
    }
  }, [currentRide?.id, currentRide?.started_at]);
  
  const setupSocketConnection = useCallback((sessionId) => {
    if (socketRef.current) socketRef.current.disconnect();
    const socket = io(API_BASE_URL, { transports: ['websocket'], reconnection: true });
    socketRef.current = socket;
    socket.on('connect', () => {
      console.log('Socket connected for live tracking');
      socket.emit('join-session', sessionId);
      setSocketConnected(true);
    });
    socket.on('driver-location-update', (data) => {
      if (data.latitude && data.longitude) {
        setDriverLocation({ latitude: data.latitude, longitude: data.longitude });
      }
    });
    socket.on('ride-started', (data) => {
      console.log('Ride started event:', data);
      setCurrentRide(prev => ({ ...prev, started_at: new Date().toISOString() }));
      showCustomAlert('Ride Started', 'The driver has started the ride!', 'success');
    });
    socket.on('ride-completed', (data) => {
      console.log('Ride completed event:', data);
      setRideCompleted(true);
      setCurrentRide(prev => ({ ...prev, status: 'completed' }));
      showCustomAlert('Ride Completed', 'Thank you for riding with us! Please rate your experience.', 'success');
    });
    return () => {
      if (socketRef.current) socketRef.current.disconnect();
    };
  }, []);
  
  const checkSessionStatus = useCallback(async () => {
    const bookingId = userBooking?.id;
    if (!bookingId) return;
    try {
      const res = await fetch(`${API_BASE_URL}/ride-sessions/rider/session-status/${bookingId}?rider_phone=${user?.phone_number}&_t=${Date.now()}`);
      const data = await res.json();
      if (data.success && data.ride_completed) {
        setRideCompleted(true);
        setHasRatedDriver(data.has_rated_driver);
        if (data.has_rated_driver === false && !hasShownRatingModal.current) {
          hasShownRatingModal.current = true;
          setTimeout(() => setRatingModalVisible(true), 1000);
        }
      }
      if (data.driver_location_lat && data.driver_location_lng) {
        setDriverLocation({ latitude: data.driver_location_lat, longitude: data.driver_location_lng });
      }
    } catch (error) {
      console.log('Error checking session status:', error);
    }
  }, [userBooking?.id, user?.phone_number]);
  
  // Get coordinates
  const driverStartCoords = useMemo(() => {
    const coords = currentRide?.routeCoordinates;
    if (Array.isArray(coords) && coords.length > 0) {
      const first = coords[0];
      if (Array.isArray(first) && first.length === 2) return { latitude: first[1], longitude: first[0] };
      if (first && typeof first === 'object' && first.latitude && first.longitude) return { latitude: first.latitude, longitude: first.longitude };
    }
    if (currentRide?.origin_lat && currentRide?.origin_lon) {
      return { latitude: currentRide.origin_lat, longitude: currentRide.origin_lon };
    }
    return null;
  }, [currentRide]);
  
  const driverEndCoords = useMemo(() => {
    const coords = currentRide?.routeCoordinates;
    if (Array.isArray(coords) && coords.length > 0) {
      const last = coords[coords.length - 1];
      if (Array.isArray(last) && last.length === 2) return { latitude: last[1], longitude: last[0] };
      if (last && typeof last === 'object' && last.latitude && last.longitude) return { latitude: last.latitude, longitude: last.longitude };
    }
    if (currentRide?.destination_lat && currentRide?.destination_lon) {
      return { latitude: currentRide.destination_lat, longitude: currentRide.destination_lon };
    }
    return null;
  }, [currentRide]);
  
  // Get rider's pickup and dropoff points
  const riderPickupCoords = useMemo(() => {
    if (userBooking?.intersection_pickup_lat && userBooking?.intersection_pickup_lon) {
      return { latitude: userBooking.intersection_pickup_lat, longitude: userBooking.intersection_pickup_lon };
    }
    if (userBooking?.pickup_lat && userBooking?.pickup_lon) {
      return { latitude: userBooking.pickup_lat, longitude: userBooking.pickup_lon };
    }
    return driverStartCoords;
  }, [userBooking, driverStartCoords]);
  
  const riderDropoffCoords = useMemo(() => {
    if (userBooking?.intersection_drop_lat && userBooking?.intersection_drop_lon) {
      return { latitude: userBooking.intersection_drop_lat, longitude: userBooking.intersection_drop_lon };
    }
    if (userBooking?.drop_lat && userBooking?.drop_lon) {
      return { latitude: userBooking.drop_lat, longitude: userBooking.drop_lon };
    }
    return driverEndCoords;
  }, [userBooking, driverEndCoords]);
  
  const routePath = useMemo(() => {
    const fullRoute = parseRouteCoordinates(currentRide?.routeCoordinates);
    if (fullRoute.length >= 2) return fullRoute;
    if (driverStartCoords && driverEndCoords) return [driverStartCoords, driverEndCoords];
    return [];
  }, [currentRide, driverStartCoords, driverEndCoords]);
  const tripTimeline = useMemo(() => {
  const items = [];
  let cumulativeDistance = 0;
  let cumulativeDuration = 0;
  
  // Driver Start point
  if (driverStartCoords?.latitude && driverStartCoords?.longitude) {
    items.push({
      id: 'start',
      type: 'start',
      title: 'Driver\'s Trip Start',
      address: driverStartAddress || currentRide?.origin || 'Starting point',
      coordinates: driverStartCoords,
      order: 0,
      icon: '🚗',
      color: '#2457A6',
      isDriverPoint: true,
    });
  }
  
  // Rider pickup point - Use saved address
  if (riderPickupCoords?.latitude && riderPickupCoords?.longitude) {
    const distanceToPrevious = items.length > 0 ? calculateDistance(
      items[items.length - 1].coordinates.latitude,
      items[items.length - 1].coordinates.longitude,
      riderPickupCoords.latitude,
      riderPickupCoords.longitude
    ) : 0;
    cumulativeDistance += distanceToPrevious;
    cumulativeDuration += calculateTravelTime(distanceToPrevious);
    
    // Build display address from saved data
    let displayAddress = riderPickupAddress || 'Pickup location';
    if (userBooking?.pickup_place_name && userBooking.pickup_place_name !== 'null') {
      displayAddress = userBooking.pickup_address ? `${userBooking.pickup_address}\n📍 Landmark: ${userBooking.pickup_place_name}` : `📍 Landmark: ${userBooking.pickup_place_name}`;
    } else if (userBooking?.pickup_address) {
      displayAddress = userBooking.pickup_address;
    }
    
    items.push({
      id: 'pickup',
      type: 'pickup',
      title: 'Your Pickup Point',
      address: displayAddress,
      coordinates: riderPickupCoords,
      order: 1,
      icon: '📍',
      color: '#10B981',
      walkDistance: userBooking?.pickup_walk_distance_m,
      walkDuration: userBooking?.pickup_walk_distance_m ? Math.round(userBooking.pickup_walk_distance_m / 80) : null,
      distanceToNext: distanceToPrevious.toFixed(1),
      durationToNext: calculateTravelTime(distanceToPrevious),
      cumulativeDistance: cumulativeDistance.toFixed(1),
      cumulativeDuration: cumulativeDuration,
    });
  }
  
  // Rider dropoff point - Use saved address
  if (riderDropoffCoords?.latitude && riderDropoffCoords?.longitude) {
    const distanceToPrevious = items.length > 0 ? calculateDistance(
      items[items.length - 1].coordinates.latitude,
      items[items.length - 1].coordinates.longitude,
      riderDropoffCoords.latitude,
      riderDropoffCoords.longitude
    ) : 0;
    cumulativeDistance += distanceToPrevious;
    cumulativeDuration += calculateTravelTime(distanceToPrevious);
    
    // Build display address from saved data
    let displayAddress = riderDropoffAddress || 'Dropoff location';
    if (userBooking?.dropoff_place_name && userBooking.dropoff_place_name !== 'null') {
      displayAddress = userBooking.dropoff_address ? `${userBooking.dropoff_address}\n📍 Landmark: ${userBooking.dropoff_place_name}` : `📍 Landmark: ${userBooking.dropoff_place_name}`;
    } else if (userBooking?.dropoff_address) {
      displayAddress = userBooking.dropoff_address;
    }
    
    items.push({
      id: 'dropoff',
      type: 'dropoff',
      title: 'Your Dropoff Point',
      address: displayAddress,
      coordinates: riderDropoffCoords,
      order: 2,
      icon: '🏁',
      color: '#F59E0B',
      walkDistance: userBooking?.drop_walk_distance_m,
      walkDuration: userBooking?.drop_walk_distance_m ? Math.round(userBooking.drop_walk_distance_m / 80) : null,
      distanceToNext: distanceToPrevious.toFixed(1),
      durationToNext: calculateTravelTime(distanceToPrevious),
      cumulativeDistance: cumulativeDistance.toFixed(1),
      cumulativeDuration: cumulativeDuration,
    });
  }
  
  // Driver End point
  if (driverEndCoords?.latitude && driverEndCoords?.longitude && 
      (!riderDropoffCoords || (Math.abs(driverEndCoords.latitude - riderDropoffCoords.latitude) > 0.001 || Math.abs(driverEndCoords.longitude - riderDropoffCoords.longitude) > 0.001))) {
    const distanceToPrevious = items.length > 0 ? calculateDistance(
      items[items.length - 1].coordinates.latitude,
      items[items.length - 1].coordinates.longitude,
      driverEndCoords.latitude,
      driverEndCoords.longitude
    ) : 0;
    cumulativeDistance += distanceToPrevious;
    cumulativeDuration += calculateTravelTime(distanceToPrevious);
    
    items.push({
      id: 'end',
      type: 'end',
      title: 'Driver\'s Trip End',
      address: driverEndAddress || currentRide?.destination || 'Destination',
      coordinates: driverEndCoords,
      order: 3,
      icon: '🏁',
      color: '#DC2626',
      isDriverPoint: true,
      distanceToNext: distanceToPrevious.toFixed(1),
      durationToNext: calculateTravelTime(distanceToPrevious),
      cumulativeDistance: cumulativeDistance.toFixed(1),
      cumulativeDuration: cumulativeDuration,
    });
  }
  
  if (items.length > 0 && items[0]) {
    items[0].totalDistance = cumulativeDistance.toFixed(1);
    items[0].totalDuration = cumulativeDuration;
  }
  
  return items;
}, [driverStartCoords, driverEndCoords, riderPickupCoords, riderDropoffCoords, currentRide, userBooking, driverStartAddress, driverEndAddress, riderPickupAddress, riderDropoffAddress]);
//   // Create enhanced trip timeline with actual addresses
//   const tripTimeline = useMemo(() => {
//     const items = [];
//     let cumulativeDistance = 0;
//     let cumulativeDuration = 0;
    
//     // Driver Start point
//     if (driverStartCoords?.latitude && driverStartCoords?.longitude) {
//       items.push({
//         id: 'start',
//         type: 'start',
//         title: 'Driver\'s Trip Start',
//         address: driverStartAddress || currentRide?.origin || 'Starting point',
//         coordinates: driverStartCoords,
//         order: 0,
//         icon: '🚗',
//         color: '#2457A6',
//         isDriverPoint: true,
//       });
//     }
    
//     // Rider pickup point
//     if (riderPickupCoords?.latitude && riderPickupCoords?.longitude) {
//       const distanceToPrevious = items.length > 0 ? calculateDistance(
//         items[items.length - 1].coordinates.latitude,
//         items[items.length - 1].coordinates.longitude,
//         riderPickupCoords.latitude,
//         riderPickupCoords.longitude
//       ) : 0;
//       cumulativeDistance += distanceToPrevious;
//       cumulativeDuration += calculateTravelTime(distanceToPrevious);
      
//       items.push({
//         id: 'pickup',
//         type: 'pickup',
//         title: 'Your Pickup Point',
//         address: riderPickupAddress || 'Pickup location',
//         coordinates: riderPickupCoords,
//         order: 1,
//         icon: '📍',
//         color: '#10B981',
//         walkDistance: userBooking?.pickup_walk_distance_m,
//         walkDuration: userBooking?.pickup_walk_distance_m ? Math.round(userBooking.pickup_walk_distance_m / 80) : null,
//         distanceToNext: distanceToPrevious.toFixed(1),
//         durationToNext: calculateTravelTime(distanceToPrevious),
//         cumulativeDistance: cumulativeDistance.toFixed(1),
//         cumulativeDuration: cumulativeDuration,
//       });
//     }
    
//     // Rider dropoff point
//     if (riderDropoffCoords?.latitude && riderDropoffCoords?.longitude) {
//       const distanceToPrevious = items.length > 0 ? calculateDistance(
//         items[items.length - 1].coordinates.latitude,
//         items[items.length - 1].coordinates.longitude,
//         riderDropoffCoords.latitude,
//         riderDropoffCoords.longitude
//       ) : 0;
//       cumulativeDistance += distanceToPrevious;
//       cumulativeDuration += calculateTravelTime(distanceToPrevious);
      
//       items.push({
//         id: 'dropoff',
//         type: 'dropoff',
//         title: 'Your Dropoff Point',
//         address: riderDropoffAddress || 'Dropoff location',
//         coordinates: riderDropoffCoords,
//         order: 2,
//         icon: '🏁',
//         color: '#F59E0B',
//         walkDistance: userBooking?.drop_walk_distance_m,
//         walkDuration: userBooking?.drop_walk_distance_m ? Math.round(userBooking.drop_walk_distance_m / 80) : null,
//         distanceToNext: distanceToPrevious.toFixed(1),
//         durationToNext: calculateTravelTime(distanceToPrevious),
//         cumulativeDistance: cumulativeDistance.toFixed(1),
//         cumulativeDuration: cumulativeDuration,
//       });
//     }
    
//     // Driver End point
//     if (driverEndCoords?.latitude && driverEndCoords?.longitude && 
//         (!riderDropoffCoords || (Math.abs(driverEndCoords.latitude - riderDropoffCoords.latitude) > 0.001 || Math.abs(driverEndCoords.longitude - riderDropoffCoords.longitude) > 0.001))) {
//       const distanceToPrevious = items.length > 0 ? calculateDistance(
//         items[items.length - 1].coordinates.latitude,
//         items[items.length - 1].coordinates.longitude,
//         driverEndCoords.latitude,
//         driverEndCoords.longitude
//       ) : 0;
//       cumulativeDistance += distanceToPrevious;
//       cumulativeDuration += calculateTravelTime(distanceToPrevious);
      
//       items.push({
//         id: 'end',
//         type: 'end',
//         title: 'Driver\'s Trip End',
//         address: driverEndAddress || currentRide?.destination || 'Destination',
//         coordinates: driverEndCoords,
//         order: 3,
//         icon: '🏁',
//         color: '#DC2626',
//         isDriverPoint: true,
//         distanceToNext: distanceToPrevious.toFixed(1),
//         durationToNext: calculateTravelTime(distanceToPrevious),
//         cumulativeDistance: cumulativeDistance.toFixed(1),
//         cumulativeDuration: cumulativeDuration,
//       });
//     }
    
//     if (items.length > 0) {
//       items[0].totalDistance = cumulativeDistance.toFixed(1);
//       items[0].totalDuration = cumulativeDuration;
//     }
    
//     return items;
//   }, [driverStartCoords, driverEndCoords, riderPickupCoords, riderDropoffCoords, currentRide, userBooking, driverStartAddress, driverEndAddress, riderPickupAddress, riderDropoffAddress]);
  
  // Create walking paths
  const walkingPaths = useMemo(() => {
    const paths = [];
    
    if (userBooking?.pickup_lat && userBooking?.pickup_lon && 
        userBooking?.intersection_pickup_lat && userBooking?.intersection_pickup_lon) {
      const distance = calculateDistance(
        userBooking.intersection_pickup_lat, userBooking.intersection_pickup_lon,
        userBooking.pickup_lat, userBooking.pickup_lon
      );
      if (distance > 0.05) {
        paths.push({
          id: 'walking-pickup',
          coordinates: [
            { latitude: userBooking.intersection_pickup_lat, longitude: userBooking.intersection_pickup_lon },
            { latitude: userBooking.pickup_lat, longitude: userBooking.pickup_lon }
          ],
          color: '#10B981',
          lineDash: [5, 5],
          walkDistance: userBooking.pickup_walk_distance_m,
        });
      }
    }
    
    if (userBooking?.drop_lat && userBooking?.drop_lon && 
        userBooking?.intersection_drop_lat && userBooking?.intersection_drop_lon) {
      const distance = calculateDistance(
        userBooking.intersection_drop_lat, userBooking.intersection_drop_lon,
        userBooking.drop_lat, userBooking.drop_lon
      );
      if (distance > 0.05) {
        paths.push({
          id: 'walking-dropoff',
          coordinates: [
            { latitude: userBooking.intersection_drop_lat, longitude: userBooking.intersection_drop_lon },
            { latitude: userBooking.drop_lat, longitude: userBooking.drop_lon }
          ],
          color: '#F59E0B',
          lineDash: [5, 5],
          walkDistance: userBooking.drop_walk_distance_m,
        });
      }
    }
    
    return paths;
  }, [userBooking]);
  const allMapMarkers = useMemo(() => {
  const markers = [];
  
  if (driverStartCoords?.latitude && driverStartCoords?.longitude) {
    markers.push({
      id: 'driver-start',
      type: 'driver-start',
      coordinate: driverStartCoords,
      title: 'Driver\'s Trip Start',
      address: driverStartAddress || currentRide?.origin || 'Starting point',
      icon: 'flag',
      color: '#2457A6',
    });
  }
  
  if (riderPickupCoords?.latitude && riderPickupCoords?.longitude) {
    // Use saved address for marker description
    let markerAddress = riderPickupAddress || 'Pickup location';
    if (userBooking?.pickup_place_name) {
      markerAddress = `${userBooking.pickup_address || ''} (${userBooking.pickup_place_name})`;
    }
    markers.push({
      id: 'rider-pickup',
      type: 'pickup',
      coordinate: riderPickupCoords,
      title: 'Your Pickup Point',
      address: markerAddress,
      icon: 'person-walking',
      color: '#10B981',
      walkDistance: userBooking?.pickup_walk_distance_m,
    });
  }
  
  if (riderDropoffCoords?.latitude && riderDropoffCoords?.longitude) {
    // Use saved address for marker description
    let markerAddress = riderDropoffAddress || 'Dropoff location';
    if (userBooking?.dropoff_place_name) {
      markerAddress = `${userBooking.dropoff_address || ''} (${userBooking.dropoff_place_name})`;
    }
    markers.push({
      id: 'rider-dropoff',
      type: 'dropoff',
      coordinate: riderDropoffCoords,
      title: 'Your Dropoff Point',
      address: markerAddress,
      icon: 'flag',
      color: '#F59E0B',
      walkDistance: userBooking?.drop_walk_distance_m,
    });
  }
  
  if (driverEndCoords?.latitude && driverEndCoords?.longitude) {
    markers.push({
      id: 'driver-end',
      type: 'driver-end',
      coordinate: driverEndCoords,
      title: 'Driver\'s Trip End',
      address: driverEndAddress || currentRide?.destination || 'Destination',
      icon: 'flag',
      color: '#DC2626',
    });
  }
  
  if (driverLocation && getPassengerRideStatusInfo().type === 'ongoing') {
    markers.push({
      id: 'driver-live',
      type: 'driver-live',
      coordinate: driverLocation,
      title: 'Driver Current Location',
      icon: 'car-sport',
      color: '#2457A6',
    });
  }
  
  return markers;
}, [driverStartCoords, driverEndCoords, riderPickupCoords, riderDropoffCoords, driverLocation, currentRide, userBooking, getPassengerRideStatusInfo, driverStartAddress, driverEndAddress, riderPickupAddress, riderDropoffAddress]);
//   // Create all map markers with actual addresses
//   const allMapMarkers = useMemo(() => {
//     const markers = [];
    
//     if (driverStartCoords?.latitude && driverStartCoords?.longitude) {
//       markers.push({
//         id: 'driver-start',
//         type: 'driver-start',
//         coordinate: driverStartCoords,
//         title: 'Driver\'s Trip Start',
//         address: driverStartAddress || currentRide?.origin || 'Starting point',
//         icon: 'flag',
//         color: '#2457A6',
//       });
//     }
    
//     if (riderPickupCoords?.latitude && riderPickupCoords?.longitude) {
//       markers.push({
//         id: 'rider-pickup',
//         type: 'pickup',
//         coordinate: riderPickupCoords,
//         title: 'Your Pickup Point',
//         address: riderPickupAddress || 'Pickup location',
//         icon: 'person-walking',
//         color: '#10B981',
//         walkDistance: userBooking?.pickup_walk_distance_m,
//       });
//     }
    
//     if (riderDropoffCoords?.latitude && riderDropoffCoords?.longitude) {
//       markers.push({
//         id: 'rider-dropoff',
//         type: 'dropoff',
//         coordinate: riderDropoffCoords,
//         title: 'Your Dropoff Point',
//         address: riderDropoffAddress || 'Dropoff location',
//         icon: 'flag',
//         color: '#F59E0B',
//         walkDistance: userBooking?.drop_walk_distance_m,
//       });
//     }
    
//     if (driverEndCoords?.latitude && driverEndCoords?.longitude) {
//       markers.push({
//         id: 'driver-end',
//         type: 'driver-end',
//         coordinate: driverEndCoords,
//         title: 'Driver\'s Trip End',
//         address: driverEndAddress || currentRide?.destination || 'Destination',
//         icon: 'flag',
//         color: '#DC2626',
//       });
//     }
    
//     if (driverLocation && getPassengerRideStatusInfo().type === 'ongoing') {
//       markers.push({
//         id: 'driver-live',
//         type: 'driver-live',
//         coordinate: driverLocation,
//         title: 'Driver Current Location',
//         icon: 'car-sport',
//         color: '#2457A6',
//       });
//     }
    
//     return markers;
//   }, [driverStartCoords, driverEndCoords, riderPickupCoords, riderDropoffCoords, driverLocation, currentRide, userBooking, getPassengerRideStatusInfo, driverStartAddress, driverEndAddress, riderPickupAddress, riderDropoffAddress]);
  
  const allMarkerCoords = useMemo(() => {
    const coords = allMapMarkers.map(m => m.coordinate).filter(c => c?.latitude && c?.longitude);
    walkingPaths.forEach(path => {
      path.coordinates.forEach(coord => coords.push(coord));
    });
    return coords;
  }, [allMapMarkers, walkingPaths]);
  
  const fitMapToMarkers = useCallback(() => {
    if (mapRef.current && mapReady && allMarkerCoords.length >= 1) {
      setTimeout(() => {
        try {
          mapRef.current.fitToCoordinates(allMarkerCoords, {
            edgePadding: { top: 80, right: 50, bottom: 200, left: 50 },
            animated: true,
          });
        } catch (e) { console.log('fitToCoordinates error:', e); }
      }, 500);
    }
  }, [mapReady, allMarkerCoords]);
  
  useEffect(() => {
    if (mapReady && allMarkerCoords.length >= 1) fitMapToMarkers();
  }, [mapReady, allMarkerCoords, fitMapToMarkers]);
  
  const canModifySeats = useCallback(() => {
    if (!userBooking) return false;
    const statusInfo = getPassengerRideStatusInfo();
    
    if (statusInfo.hasStarted === true) return false;
    if (rideCompleted) return false;
    if (currentRide?.cancellation_reason) return false;
    if (userBooking.status !== "accepted") return false;
    if (['expired', 'auto-cancelled', 'driver-late', 'start-soon', 'ongoing', 'modification-rejected', 'modification-pending', 'modification-approved'].includes(statusInfo.type)) return false;
    if (modificationStatus === 'pending') return false;
    if (modificationStatus === 'approved') return false;
    if (modificationStatus === 'rejected') return false;
    return true;
  }, [userBooking, getPassengerRideStatusInfo, currentRide, rideCompleted, modificationStatus]);
  
  const canCancelBooking = useCallback(() => {
    if (!userBooking) return false;
    const statusInfo = getPassengerRideStatusInfo();
    if (rideCompleted) return false;
    if (currentRide?.cancellation_reason || currentRide?.started_at || currentRide?.status === 'completed') return false;
    if (['expired', 'auto-cancelled', 'ongoing', 'modification-rejected'].includes(statusInfo.type)) return false;
    if (modificationStatus === 'pending') return true;
    if (!["accepted", "pending"].includes(userBooking.status)) return false;
    return true;
  }, [userBooking, getPassengerRideStatusInfo, currentRide, rideCompleted, modificationStatus]);
  
  const handleCancelBooking = async () => {
    if (!userBooking || !canCancelBooking()) return;
    
    if (modificationStatus === 'pending') {
      showCustomAlert('Pending Modification', 'You have a pending modification request. Do you want to cancel just the modification request or the entire booking?', 'info');
      await handleCancelModificationRequest();
      return;
    }
    
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
      `From: ${riderPickupAddress || currentRide?.from || currentRide?.origin || 'Pickup'}\n` +
      `To: ${riderDropoffAddress || currentRide?.to || currentRide?.destination || 'Drop'}\n` +
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
  
  const onRefresh = () => {
    setRefreshing(true);
    Promise.all([
      fetchSeatAvailability(),
      loadDriverData(),
      fetchModificationRequests(),
      fetchDriverRatingForRide(),
      checkLiveSession(),
      checkSessionStatus(),
      fetchAllAddresses()
    ]).finally(() => setRefreshing(false));
  };
  
 // Render timeline item
const renderTimelineItem = (item, index) => {
  const isLast = index === tripTimeline.length - 1;
  const hasWalking = item.walkDistance && item.walkDistance > 0;
  const isRiderPoint = item.type === 'pickup' || item.type === 'dropoff';
  
  // Get the actual saved address for this point
  let navigationAddress = null;
  if (item.type === 'pickup') {
    navigationAddress = userBooking?.pickup_address || userBooking?.pickup_place_name || item.address;
  } else if (item.type === 'dropoff') {
    navigationAddress = userBooking?.dropoff_address || userBooking?.dropoff_place_name || item.address;
  } else {
    navigationAddress = item.address;
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
          {item.order && (
            <View style={styles.segmentBadge}>
              <Text style={styles.segmentBadgeText}>Stop {item.order}</Text>
            </View>
          )}
        </View>
        
        <Text style={styles.timelineItemTitle}>{item.title}</Text>
        
        {isRiderPoint && item.walkDistance && item.walkDistance > 0 && (
          <View style={[styles.walkingChip, { backgroundColor: item.color + '15' }]}>
            <Ionicons name="walk" size={14} color={item.color} />
            <Text style={[styles.walkingChipText, { color: item.color }]}>
              Walk {item.walkDistance}m • ~{item.walkDuration} min
            </Text>
          </View>
        )}
        
        <Text style={styles.timelineItemAddress} numberOfLines={3}>
          {item.address}
        </Text>
        
        {item.distanceToNext && item.durationToNext && (
          <View style={styles.routeInfo}>
            <View style={styles.routeInfoItem}>
              <Ionicons name="navigate-outline" size={12} color="#2457A6" />
              <Text style={styles.routeInfoText}>Next: {item.distanceToNext} km</Text>
            </View>
            <View style={styles.routeInfoItem}>
              <Ionicons name="time-outline" size={12} color="#F59E0B" />
              <Text style={styles.routeInfoText}>~{formatDuration(item.durationToNext)}</Text>
            </View>
          </View>
        )}
        
        {item.cumulativeDistance && (
          <View style={styles.cumulativeInfo}>
            <Ionicons name="flag-outline" size={12} color="#10B981" />
            <Text style={styles.cumulativeInfoText}>
              Total: {item.cumulativeDistance} km • {formatDuration(item.cumulativeDuration)}
            </Text>
          </View>
        )}
        
        <TouchableOpacity 
          style={styles.navigateButton}
          onPress={() => handleNavigateToLocation(
            item.coordinates.latitude,
            item.coordinates.longitude,
            item.title,
            navigationAddress  // Pass the actual saved address
          )}
        >
          <Ionicons name="navigate-circle" size={16} color="#2457A6" />
          <Text style={styles.navigateButtonText}>Navigate to this stop</Text>
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );
};
  
 // Render map marker
const renderMapMarker = (marker) => {
  let size = 36;
  switch (marker.type) {
    case 'driver-start': size = 42; break;
    case 'driver-end': size = 42; break;
    case 'driver-live': size = 40; break;
    default: size = 38;
  }
  
  let iconName = marker.icon;
  if (iconName === 'flag') iconName = 'flag-outline';
  if (iconName === 'person-walking') iconName = 'walk-outline';
  if (iconName === 'car-sport') iconName = 'car-sport-outline';
  
  // Get the saved address for the marker
  let navigationAddress = null;
  if (marker.type === 'pickup') {
    navigationAddress = userBooking?.pickup_address || userBooking?.pickup_place_name || marker.address;
  } else if (marker.type === 'dropoff') {
    navigationAddress = userBooking?.dropoff_address || userBooking?.dropoff_place_name || marker.address;
  } else {
    navigationAddress = marker.address;
  }
  
  return (
    <Marker 
      key={marker.id} 
      coordinate={marker.coordinate} 
      title={marker.title} 
      description={marker.address}
      onPress={() => {
        handleNavigateToLocation(
          marker.coordinate.latitude,
          marker.coordinate.longitude,
          marker.title,
          navigationAddress  // Pass the saved address
        );
      }}
    >
      <View style={[styles.mapCustomMarker, { backgroundColor: marker.color, width: size, height: size, borderRadius: size / 2 }]}>
        <Ionicons name={iconName} size={size * 0.45} color="#fff" />
        {marker.walkDistance && marker.walkDistance > 0 && (
          <View style={[styles.mapWalkBadge, { backgroundColor: marker.color }]}>
            <Ionicons name="walk" size={10} color="#fff" />
            <Text style={styles.mapWalkBadgeText}>{marker.walkDistance}m</Text>
          </View>
        )}
        {marker.type === 'driver-live' && (
          <View style={styles.liveRing}>
            <View style={styles.liveRingInner} />
          </View>
        )}
      </View>
    </Marker>
  );
};
  // Initialize data on component mount
  useEffect(() => {
    const initializeData = async () => {
      if (userBooking?.id) {
        try {
          const response = await fetch(`${API_BASE_URL}/api/v1/bookings/${userBooking.id}/ride?_t=${Date.now()}`);
          const data = await response.json();
          if (data.success && data.ride) {
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
              destination_lat: data.ride.destination_latitude,
              destination_lon: data.ride.destination_longitude,
              suggestedPickup: data.ride.suggested_pickup_point,
              suggestedDrop: data.ride.suggested_drop_point,
              started_at: data.ride.started_at,
              completed_at: data.ride.completed_at,
            });
            const totalSeats = data.ride.available_seats || 4;
            setTotalSeatsOffered(totalSeats);
            setTotalBookedSeats(data.ride.total_booked_seats || userBooking.seats_requested || 1);
            setAvailableSeats(totalSeats - (data.ride.total_booked_seats || userBooking.seats_requested || 1));
            setUserBooking(prev => ({
              ...prev,
              id: Number(data.booking.id),
              seats_requested: Number(data.booking.seats_requested) || 1,
              status: data.booking.status,
              total_amount: Number(data.booking.total_amount) || null,
              created_at: data.booking.created_at,
              pickup_address: data.booking.pickup_address,
              dropoff_address: data.booking.dropoff_address,
              intersection_pickup_lat: data.booking.intersection_pickup_lat,
              intersection_pickup_lon: data.booking.intersection_pickup_lon,
              pickup_lat: data.booking.pickup_lat,
              pickup_lon: data.booking.pickup_lon,
              drop_lat: data.booking.drop_lat,
              drop_lon: data.booking.drop_lon,
              pickup_walk_distance_m: data.booking.pickup_walk_distance_m,
              drop_walk_distance_m: data.booking.drop_walk_distance_m,
            }));
            await Promise.all([
              fetchSeatAvailability(),
              loadDriverData(),
              fetchModificationRequests(),
              fetchDriverRatingForRide(),
              checkLiveSession(),
              checkSessionStatus(),
              fetchAllAddresses()
            ]);
          }
        } catch (error) {
          console.log('Error initializing ride data:', error);
        }
      }
    };
    initializeData();
  }, [userBooking?.id]);
  
  useEffect(() => {
    if (currentRide) {
      loadDriverData();
      fetchSeatAvailability();
      checkLiveSession();
      checkSessionStatus();
      fetchAllAddresses();
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
        fetchAllAddresses();
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
  
  const profilePhotoUrl = getProfilePhotoUrl();
  const avatarText = getDriverInitials(driverProfile?.full_name || currentRide?.driverName || 'Driver');
  const isProfilePhotoSvg = profilePhotoUrl?.toLowerCase().includes('.svg');
  const allPreferences = useMemo(() => extractAllPreferences(currentRide, driverProfile?.travel_preferences), [currentRide, driverProfile]);
  
  const vehicleName = driverProfile?.vehicle?.model || currentRide?.vehicle?.model || 'Vehicle details unavailable';
  const vehicleRegNumber = driverProfile?.vehicle?.registration_number || currentRide?.vehicle?.registration_number;
  const vehicleColor = driverProfile?.vehicle?.color || currentRide?.vehicle?.color || 'Not specified';
  
  const rideStatusInfo = getPassengerRideStatusInfo();
  const modificationsAllowed = canModifySeats();
  const cancellationsAllowed = canCancelBooking();
  const isAutoCancelled = rideStatusInfo.type === 'auto-cancelled';
  const isCompleted = rideStatusInfo.type === 'completed';
  const isModificationRejected = rideStatusInfo.type === 'modification-rejected';
  const isModificationPending = rideStatusInfo.type === 'modification-pending';
  const isModificationApproved = rideStatusInfo.type === 'modification-approved';
  
  const otherBookedSeats = totalBookedSeats - (userBooking?.seats_requested || 0);
  const totalAmountPaid = (currentRide?.price || currentRide?.price_per_seat || 0) * (userBooking?.seats_requested || 1);
  const walkDistances = {
    pickupWalk: userBooking?.pickup_walk_distance_m || 0,
    dropWalk: userBooking?.drop_walk_distance_m || 0
  };
  
  const initialRegion = {
    latitude: driverLocation?.latitude || driverStartCoords?.latitude || riderPickupCoords?.latitude || 28.6139,
    longitude: driverLocation?.longitude || driverStartCoords?.longitude || riderPickupCoords?.longitude || 77.2090,
    latitudeDelta: 0.02,
    longitudeDelta: 0.02,
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
          {/* Main route path */}
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
          
          {/* Walking paths */}
          {walkingPaths.map(path => (
            <Polyline
              key={path.id}
              coordinates={path.coordinates}
              strokeColor={path.color}
              strokeWidth={3}
              lineDashPattern={path.lineDash}
              lineCap="round"
              lineJoin="round"
            />
          ))}
          
          {/* Proximity circles */}
          {userBooking?.pickup_walk_distance_m > 0 && riderPickupCoords && (
            <Circle
              center={riderPickupCoords}
              radius={userBooking.pickup_walk_distance_m}
              strokeColor="rgba(16, 185, 129, 0.3)"
              fillColor="rgba(16, 185, 129, 0.1)"
              strokeWidth={1}
            />
          )}
          
          {/* All markers */}
          {allMapMarkers.map(marker => renderMapMarker(marker))}
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
            <View style={[styles.legendDot, { backgroundColor: '#10B981' }]} />
            <Text style={styles.legendText}>Your Pickup</Text>
          </View>
          <View style={styles.legendItem}>
            <View style={[styles.legendDot, { backgroundColor: '#F59E0B' }]} />
            <Text style={styles.legendText}>Your Dropoff</Text>
          </View>
          <View style={styles.legendItem}>
            <View style={[styles.legendDot, { backgroundColor: '#2457A6' }]} />
            <Text style={styles.legendText}>Driver Location</Text>
          </View>
        </View>
        
        {/* Map Controls */}
        <View style={styles.mapControls}>
          <TouchableOpacity style={styles.mapControlButton} onPress={() => fitMapToMarkers()}>
            <Ionicons name="map-outline" size={20} color="#2457A6" />
          </TouchableOpacity>
        </View>
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
                <View style={styles.collapsedStatusRow}>
                  <View style={[styles.collapsedStatusBadge, { backgroundColor: rideStatusInfo.color + '20' }]}>
                    <Ionicons name={rideStatusInfo.icon} size={10} color={rideStatusInfo.color} />
                    <Text style={[styles.collapsedStatusText, { color: rideStatusInfo.color }]}>{rideStatusInfo.text}</Text>
                  </View>
                </View>
                <Text style={styles.collapsedDriver} numberOfLines={1}>{driverProfile?.full_name || currentRide?.driverName || 'Driver'}</Text>
                <Text style={styles.collapsedSub} numberOfLines={2}>
                  {loadingAddresses ? 'Loading pickup address...' : (riderPickupAddress || 'Pickup location')} → {loadingAddresses ? 'Loading dropoff address...' : (riderDropoffAddress || 'Dropoff location')}
                </Text>
              </View>
              <View style={styles.collapsedPriceWrap}>
                <Text style={styles.collapsedPrice}>₹{currentRide?.price || currentRide?.price_per_seat || 0}</Text>
                <Text style={styles.collapsedPerSeat}>per seat</Text>
              </View>
            </View>
            {tripTimeline.length > 0 && tripTimeline[0]?.totalDistance && (
              <View style={styles.collapsedTripInfo}>
                <Text style={styles.collapsedTripText}>
                  📍 {tripTimeline.length} stops • {tripTimeline[0].totalDistance} km • {formatDuration(tripTimeline[0].totalDuration)}
                </Text>
              </View>
            )}
          </View>
        ) : (
          <ScrollView 
            style={styles.drawerScroll} 
            contentContainerStyle={styles.drawerContent}
            refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
            showsVerticalScrollIndicator={false}
          >
            {/* Ride Status Banner */}
            <View style={[styles.statusBanner, { backgroundColor: rideStatusInfo.color + '20' }]}>
              <Ionicons name={rideStatusInfo.icon} size={22} color={rideStatusInfo.color} />
              <View style={styles.statusBannerTextContainer}>
                <Text style={[styles.statusBannerTitle, { color: rideStatusInfo.color }]}>{rideStatusInfo.text}</Text>
                {rideStatusInfo.reason && (
                  <Text style={styles.statusBannerSubtitle}>{rideStatusInfo.reason}</Text>
                )}
              </View>
            </View>
            
            {/* Loading Addresses Indicator */}
            {loadingAddresses && (
              <View style={styles.loadingAddressesContainer}>
                <ActivityIndicator size="small" color={Colors.primary} />
                <Text style={styles.loadingAddressesText}>Loading actual addresses...</Text>
              </View>
            )}
            
            {/* Modification Status Cards */}
            {isModificationPending && (
              <View style={styles.modificationPendingCard}>
                <View style={styles.modificationPendingHeader}>
                  <Ionicons name="swap" size={24} color="#F59E0B" />
                  <Text style={styles.modificationPendingTitle}>Modification Request Pending</Text>
                </View>
                <View style={styles.modificationPendingDetails}>
                  <Text style={styles.modificationPendingText}>
                    You requested to change from <Text style={{ fontWeight: 'bold' }}>{userBooking?.seats_requested}</Text> to <Text style={{ fontWeight: 'bold' }}>{pendingModificationRequest?.requested_seats || pendingSeatsRequest}</Text> seats
                  </Text>
                  <Text style={styles.modificationPendingSubtext}>
                    Waiting for driver's approval
                  </Text>
                </View>
              </View>
            )}

            {isModificationApproved && (
              <View style={styles.modificationApprovedCard}>
                <View style={styles.modificationPendingHeader}>
                  <Ionicons name="checkmark-circle" size={24} color="#10B981" />
                  <Text style={[styles.modificationPendingTitle, { color: "#10B981" }]}>Modification Approved!</Text>
                </View>
                <View style={styles.modificationPendingDetails}>
                  <Text style={styles.modificationPendingText}>
                    Your seats have been changed to {userBooking?.seats_requested} seats
                  </Text>
                  <Text style={styles.modificationPendingSubtext}>
                    ✓ You have used your one-time modification
                  </Text>
                </View>
              </View>
            )}

            {isModificationRejected && userBooking?.modification_request && (
              <View style={styles.modificationRejectedBanner}>
                <Ionicons name="close-circle" size={24} color="#DC2626" />
                <View style={{ flex: 1 }}>
                  <Text style={styles.modificationRejectedTitle}>Booking Cancelled</Text>
                  <Text style={styles.modificationRejectedText}>
                    Your request to change from {userBooking.modification_request.current_seats} to {userBooking.modification_request.requested_seats} seats was rejected.
                  </Text>
                  {userBooking.modification_request.rejection_reason && (
                    <Text style={styles.modificationRejectedReason}>
                      Reason: {userBooking.modification_request.rejection_reason}
                    </Text>
                  )}
                  <Text style={styles.modificationRejectedNote}>
                    Your original booking has been cancelled and seats have been released.
                  </Text>
                </View>
              </View>
            )}
            
            {/* Driver Card */}
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
                {!isModificationRejected && (
                  <TouchableOpacity style={styles.chatButton} onPress={handleChatWithDriver}>
                    <Ionicons name="chatbubble-ellipses" size={22} color="#2457A6" />
                  </TouchableOpacity>
                )}
              </View>
              
              {!isModificationRejected && (
                <View style={styles.actionButtonsRow}>
                  <TouchableOpacity style={styles.profileOutlineBtn} onPress={viewDriverProfile}>
                    <Text style={styles.profileOutlineBtnText}>View Full Profile</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.shareOutlineBtn} onPress={shareRideDetails}>
                    <Ionicons name="share-outline" size={18} color="#2457A6" />
                    <Text style={styles.shareOutlineBtnText}>Share</Text>
                  </TouchableOpacity>
                </View>
              )}
            </View>
            
            {/* Driver's Rating */}
            {showDriverRating && driverRating && !isModificationRejected && (
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
            
            {/* Trip Timeline Section with Actual Addresses */}
            {tripTimeline.length > 0 && (
              <View style={styles.cardSection}>
                <TouchableOpacity 
                  style={styles.timelineHeader} 
                  onPress={() => setTimelineExpanded(!timelineExpanded)}
                >
                  <View style={styles.timelineHeaderLeft}>
                    <Ionicons name="map-outline" size={20} color="#2457A6" />
                    <Text style={styles.sectionTitle}>Your Trip Timeline</Text>
                    <Text style={styles.timelineStopCount}>({tripTimeline.length} stops)</Text>
                  </View>
                  <Ionicons 
                    name={timelineExpanded ? "chevron-up" : "chevron-down"} 
                    size={20} 
                    color={Colors.gray} 
                  />
                </TouchableOpacity>
                
                {timelineExpanded && (
                  <View style={styles.timelineContainer}>
                    {tripTimeline.map((item, index) => renderTimelineItem(item, index))}
                  </View>
                )}
              </View>
            )}
            
            {/* Trip Overview Card with Actual Addresses */}
            <View style={styles.tripOverviewCard}>
              <View style={styles.tripOverviewHeader}>
                <Ionicons name="information-circle-outline" size={24} color="#2457A6" />
                <Text style={styles.tripOverviewTitle}>Trip Overview</Text>
              </View>
              <View style={styles.tripOverviewDetails}>
                <View style={styles.tripOverviewItem}>
                  <Text style={styles.tripOverviewLabel}>Pickup From</Text>
                  <Text style={styles.tripOverviewValue}>
                    {loadingAddresses ? 'Loading address...' : (riderPickupAddress || 'Pickup location not specified')}
                  </Text>
                  {walkDistances.pickupWalk > 0 && (
                    <Text style={styles.walkDistanceText}>🚶 {walkDistances.pickupWalk}m walk to pickup</Text>
                  )}
                </View>
                <View style={styles.tripOverviewArrow}>
                  <Ionicons name="arrow-down-outline" size={16} color="#2457A6" />
                </View>
                <View style={styles.tripOverviewItem}>
                  <Text style={styles.tripOverviewLabel}>Dropoff To</Text>
                  <Text style={styles.tripOverviewValue}>
                    {loadingAddresses ? 'Loading address...' : (riderDropoffAddress || 'Dropoff location not specified')}
                  </Text>
                  {walkDistances.dropWalk > 0 && (
                    <Text style={styles.walkDistanceText}>🚶 {walkDistances.dropWalk}m walk from dropoff</Text>
                  )}
                </View>
              </View>
              <View style={styles.tripOverviewStats}>
                <View style={styles.tripOverviewStat}>
                  <Ionicons name="calendar-outline" size={16} color="#6B7280" />
                  <Text style={styles.tripOverviewStatText}>{formatDate(currentRide?.departure_time)}</Text>
                </View>
                {currentRide?.distance_km && (
                  <View style={styles.tripOverviewStat}>
                    <Ionicons name="map-outline" size={16} color="#6B7280" />
                    <Text style={styles.tripOverviewStatText}>{currentRide.distance_km} km</Text>
                  </View>
                )}
                {currentRide?.duration_text && (
                  <View style={styles.tripOverviewStat}>
                    <Ionicons name="time-outline" size={16} color="#6B7280" />
                    <Text style={styles.tripOverviewStatText}>{currentRide.duration_text}</Text>
                  </View>
                )}
              </View>
            </View>
            
            {/* Vehicle Details */}
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
            
            {/* Seat Availability */}
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
            
            {/* Ride Preferences */}
            {allPreferences.length > 0 && (
              <View style={styles.cardSection}>
                <Text style={styles.sectionTitle}>🎯 Ride Preferences</Text>
                <View style={styles.tagRow}>
                  {allPreferences.map((pref, index) => {
                    const isActive = !pref.includes(':') && 
                      !pref.toLowerCase().includes('not') &&
                      !pref.toLowerCase().includes('no');
                    return (
                      <PreferenceTag key={`${pref}-${index}`} label={pref} isActive={isActive} />
                    );
                  })}
                </View>
              </View>
            )}
            
            {/* Booking Details */}
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
                    <Text style={[styles.bookingDetailValue, isModificationRejected && styles.strikethroughText]}>
                      {userBooking.seats_requested}
                      {isModificationApproved && " (Updated)"}
                    </Text>
                  </View>
                  <View style={styles.bookingDetailRow}>
                    <Text style={styles.bookingDetailLabel}>Price per Seat</Text>
                    <Text style={[styles.bookingDetailValue, isModificationRejected && styles.strikethroughText]}>
                      ₹{currentRide?.price || currentRide?.price_per_seat || 0}
                    </Text>
                  </View>
                  <View style={[styles.bookingDetailRow, styles.bookingTotalRow]}>
                    <Text style={styles.bookingTotalLabel}>Total Amount</Text>
                    <Text style={[styles.bookingTotalValue, isModificationRejected && styles.strikethroughText]}>
                      ₹{totalAmountPaid}
                    </Text>
                  </View>
                  <View style={styles.bookingDetailRow}>
                    <Text style={styles.bookingDetailLabel}>Status</Text>
                    <View style={[styles.bookingStatusBadge, { backgroundColor: isModificationRejected ? '#FEE2E2' : (userBooking.status === 'accepted' ? '#10B98120' : userBooking.status === 'pending' ? '#F59E0B20' : '#EF444420') }]}>
                      <Text style={[styles.bookingStatusText, { color: isModificationRejected ? '#DC2626' : (userBooking.status === 'accepted' ? '#10B981' : userBooking.status === 'pending' ? '#F59E0B' : '#EF4444') }]}>
                        {isModificationRejected ? 'Booking Cancelled' : (isModificationApproved ? 'Modified' : (userBooking.status === 'accepted' ? 'Confirmed' : userBooking.status === 'pending' ? 'Pending' : userBooking.status))}
                      </Text>
                    </View>
                  </View>
                </>
              ) : (
                <Text style={styles.emptyText}>No booking information available</Text>
              )}
              
              {/* Modify Seats Button */}
              {modificationsAllowed && userBooking?.status === "accepted" && !isAutoCancelled && totalSeatsOffered > 0 && !isModificationRejected && !isModificationPending && !isModificationApproved && rideStatusInfo.type !== 'ongoing' && rideStatusInfo.type !== 'completed' && rideStatusInfo.hasStarted !== true && (
                <>
                  <View style={styles.divider} />
                  <Text style={styles.sectionSubtitle}>Modify Seats (One-time)</Text>
                  <View style={styles.otherBookedInfo}>
                    <Ionicons name="information-circle" size={14} color="#F59E0B" />
                    <Text style={styles.otherBookedInfoText}>{otherBookedSeats} seat(s) booked by others</Text>
                  </View>
                  <View style={styles.availableSeatsInfo}>
                    <Ionicons name="information-circle" size={14} color="#10B981" />
                    <Text style={styles.availableSeatsInfoText}>
                      {availableSeats} seat(s) currently available for modification
                    </Text>
                  </View>
                  <TouchableOpacity 
                    style={styles.modifySeatsMainBtn}
                    onPress={openModifySeatsModal}
                    disabled={modifyingSeats}>
                    <Ionicons name="swap" size={18} color={Colors.primary} />
                    <Text style={styles.modifySeatsMainBtnText}>
                      {modifyingSeats ? 'Processing...' : 'Request Seat Change'}
                    </Text>
                  </TouchableOpacity>
                  <Text style={styles.modifySeatsNoteText}>
                    ⚠️ One-time modification only. Request needs driver approval. Only available before ride starts.
                  </Text>
                </>
              )}
              
              {/* Cancel Modification Button */}
              {isModificationPending && (
                <TouchableOpacity 
                  style={styles.cancelModificationMainBtn}
                  onPress={handleCancelModificationRequest}
                  disabled={modifyingSeats}>
                  <Ionicons name="close-circle-outline" size={18} color="#DC2626" />
                  <Text style={styles.cancelModificationMainBtnText}>
                    {modifyingSeats ? 'Cancelling...' : 'Cancel Modification Request'}
                  </Text>
                </TouchableOpacity>
              )}
              
              {/* Cancel Booking */}
              {cancellationsAllowed && userBooking?.status !== "rejected" && !isAutoCancelled && rideStatusInfo.type !== 'ongoing' && rideStatusInfo.type !== 'completed' && !isModificationRejected && !isModificationPending && (
                <TouchableOpacity style={[styles.cancelBookingMainBtn, (modifyingSeats || cancelLoading) && styles.cancelBookingMainBtnDisabled]} onPress={() => setShowCancelModal(true)} disabled={modifyingSeats || cancelLoading}>
                  <Text style={styles.cancelBookingMainBtnText}>{userBooking?.status === "pending" ? "Cancel Request" : "Cancel Booking"}</Text>
                </TouchableOpacity>
              )}
            </View>
            
            {/* Other Riders */}
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
      
      {/* Modify Seats Modal */}
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
      
      {/* Seat Availability Card */}
      {selectedBookingForModification && (
        <View style={styles.modifySeatsAvailabilityCard}>
          <Text style={styles.modifySeatsAvailabilityTitle}>🚗 Current Seat Availability</Text>
          
          <View style={styles.modifySeatsAvailabilityRow}>
            <Ionicons name="car-outline" size={16} color="#6B7280" />
            <Text style={styles.modifySeatsAvailabilityText}>
              Total seats in vehicle: <Text style={{ fontWeight: 'bold', color: Colors.primary }}>
                {selectedBookingForModification.total_seats || totalSeatsOffered || 4}
              </Text>
            </Text>
          </View>
          
          <View style={styles.modifySeatsAvailabilityRow}>
            <Ionicons name="people-outline" size={16} color="#6B7280" />
            <Text style={styles.modifySeatsAvailabilityText}>
              Currently booked (including you): <Text style={{ fontWeight: 'bold', color: '#F59E0B' }}>
                {selectedBookingForModification.booked_seats || totalBookedSeats || 0}
              </Text>
            </Text>
          </View>
          
          <View style={styles.modifySeatsAvailabilityRow}>
            <Ionicons name="checkmark-circle" size={16} color="#10B981" />
            <Text style={styles.modifySeatsAvailabilityText}>
              Available for new bookings: <Text style={{ fontWeight: 'bold', color: '#10B981' }}>
                {selectedBookingForModification.available_seats || availableSeats || 0}
              </Text>
            </Text>
          </View>
          
          <View style={styles.modifySeatsAvailabilityDivider} />
          
          <View style={styles.modifySeatsAvailabilityRow}>
            <Ionicons name="swap" size={16} color={Colors.primary} />
            <Text style={styles.modifySeatsAvailabilityText}>
              Your current seats: <Text style={{ fontWeight: 'bold', color: Colors.primary }}>
                {selectedBookingForModification.current_seats || userBooking?.seats_requested || 1}
              </Text>
            </Text>
          </View>
          
          <View style={styles.modifySeatsAvailabilityRow}>
            <Ionicons name="information-circle" size={16} color="#F59E0B" />
            <Text style={[styles.modifySeatsAvailabilityText, { color: '#F59E0B' }]}>
              You can request up to <Text style={{ fontWeight: 'bold' }}>{maxModifySeats}</Text> seats total
              {selectedBookingForModification.available_seats > 0 && 
                ` (your current ${selectedBookingForModification.current_seats} + ${selectedBookingForModification.available_seats} available)`}
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
            disabled={modifySeatsValue <= 1}>
            <Ionicons name="remove" size={24} color={modifySeatsValue <= 1 ? Colors.gray : Colors.primary} />
          </TouchableOpacity>
          <View style={styles.modifySeatsCountWrap}>
            <Text style={styles.modifySeatsCount}>{modifySeatsValue}</Text>
            <Text style={styles.modifySeatsMax}>/ {maxModifySeats} max</Text>
          </View>
          <TouchableOpacity 
            style={[styles.modifySeatsActionBtn, modifySeatsValue >= maxModifySeats && styles.modifySeatsActionBtnDisabled]}
            onPress={() => setModifySeatsValue(Math.min(maxModifySeats, modifySeatsValue + 1))}
            disabled={modifySeatsValue >= maxModifySeats}>
            <Ionicons name="add" size={24} color={modifySeatsValue >= maxModifySeats ? Colors.gray : Colors.primary} />
          </TouchableOpacity>
        </View>
      </View>
      
      {modifySeatsValue !== (userBooking?.seats_requested || 1) && (
        <View style={styles.modifySeatsChangeSummary}>
          <Ionicons name="information-circle" size={16} color="#10B981" />
          <Text style={styles.modifySeatsChangeSummaryText}>
            {modifySeatsValue > (userBooking?.seats_requested || 1) 
              ? `+${modifySeatsValue - (userBooking?.seats_requested || 1)} more seat(s) will be added`
              : `${(userBooking?.seats_requested || 1) - modifySeatsValue} fewer seat(s) will be removed`}
          </Text>
        </View>
      )}
      
      <View style={styles.modifySeatsActions}>
        <TouchableOpacity 
          style={styles.modifySeatsCancelBtn} 
          onPress={() => setModifySeatsModalVisible(false)}>
          <Text style={styles.modifySeatsCancelBtnText}>Cancel</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={[styles.modifySeatsSubmitBtn, modifyingSeats && styles.modifySeatsSubmitBtnDisabled]} 
          onPress={submitModifySeatsRequest}
          disabled={modifyingSeats}>
          <Text style={styles.modifySeatsSubmitBtnText}>
            {modifyingSeats ? 'Sending...' : 'Send Request'}
          </Text>
        </TouchableOpacity>
      </View>
      
      <Text style={styles.modifySeatsNote}>
        ⚠️ Note: This request needs driver approval. If rejected, your booking will be cancelled.
      </Text>
    </View>
  </View>
</Modal>
      
      <ProfileImageModal visible={selectedProfile.visible} imageUrl={selectedProfile.imageUrl} driverName={selectedProfile.driverName} onClose={() => setSelectedProfile({ visible: false, imageUrl: null, driverName: '' })} />
      <CustomAlert visible={alertVisible} title={alertConfig.title} message={alertConfig.message} icon={alertConfig.icon} iconColor={alertConfig.iconColor} buttons={alertConfig.buttons} onBackdropPress={() => setAlertVisible(false)} />
    </View>
  );
}

// ============================================
// STYLES
// ============================================

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
  mapCustomMarker: { alignItems: 'center', justifyContent: 'center', borderWidth: 2, borderColor: '#fff', shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.25, shadowRadius: 4, elevation: 5, position: 'relative' },
  mapWalkBadge: { position: 'absolute', bottom: -8, left: '50%', transform: [{ translateX: -15 }], flexDirection: 'row', alignItems: 'center', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 10, gap: 2 },
  mapWalkBadgeText: { fontSize: 8, color: '#fff', fontWeight: 'bold' },
  liveRing: { position: 'absolute', width: 50, height: 50, borderRadius: 25, backgroundColor: 'rgba(36,87,166,0.2)', borderWidth: 1, borderColor: '#2457A6', top: -5, left: -5 },
  liveRingInner: { width: '100%', height: '100%', borderRadius: 25, backgroundColor: 'transparent' },
  
  drawer: { position: 'absolute', bottom: 0, left: 0, right: 0, backgroundColor: '#F4F5F7', borderTopLeftRadius: 28, borderTopRightRadius: 28, overflow: 'hidden', shadowColor: '#000', shadowOffset: { width: 0, height: -2 }, shadowOpacity: 0.1, shadowRadius: 8, elevation: 10 },
  handleWrap: { alignItems: 'center', paddingTop: 10, paddingBottom: 8, backgroundColor: '#F4F5F7', position: 'relative' },
  handleHitArea: { paddingHorizontal: 40, paddingVertical: 10, alignItems: 'center', justifyContent: 'center' },
  handleBar: { width: 64, height: 6, borderRadius: 99, backgroundColor: '#CDD2D8' },
  collapsedSummary: { paddingHorizontal: 16, paddingTop: 4, paddingBottom: 12 },
  collapsedTopRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12 },
  collapsedStatusRow: { marginBottom: 6 },
  collapsedStatusBadge: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 8, paddingVertical: 3, borderRadius: 12, gap: 4, alignSelf: 'flex-start' },
  collapsedStatusText: { fontSize: 10, fontWeight: '600' },
  collapsedDriver: { fontSize: 16, fontWeight: '800', color: Colors.dark },
  collapsedSub: { marginTop: 2, fontSize: 12, color: Colors.gray, fontWeight: '600' },
  collapsedPriceWrap: { alignItems: 'flex-end' },
  collapsedPrice: { fontSize: 18, fontWeight: '900', color: Colors.dark },
  collapsedPerSeat: { fontSize: 10, color: Colors.gray, fontWeight: '600' },
  collapsedTripInfo: { marginTop: 6, paddingTop: 6, borderTopWidth: 1, borderTopColor: '#EEF2F7' },
  collapsedTripText: { fontSize: 11, color: '#6B7280' },
  drawerScroll: { flex: 1 },
  drawerContent: { paddingHorizontal: 16, paddingBottom: 16 },
  
  loadingAddressesContainer: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', backgroundColor: '#EAF1FF', padding: 10, borderRadius: 12, marginBottom: 14, gap: 10 },
  loadingAddressesText: { fontSize: 12, color: '#2457A6', fontWeight: '500' },
  
  statusBanner: { flexDirection: 'row', alignItems: 'flex-start', padding: 14, borderRadius: 16, marginBottom: 14, gap: 12 },
  statusBannerTextContainer: { flex: 1 },
  statusBannerTitle: { fontSize: 16, fontWeight: '800' },
  statusBannerSubtitle: { fontSize: 12, color: '#6B7280', marginTop: 4 },
  
  modificationPendingCard: { backgroundColor: '#FFFBEB', borderRadius: 12, padding: 12, marginBottom: 12, borderWidth: 1, borderColor: '#FDE68A' },
  modificationPendingHeader: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 8 },
  modificationPendingTitle: { fontSize: 14, fontWeight: '700', color: '#92400E' },
  modificationPendingDetails: { paddingLeft: 34 },
  modificationPendingText: { fontSize: 13, color: '#78350F', marginBottom: 4 },
  modificationPendingSubtext: { fontSize: 11, color: '#B45309' },
  modificationApprovedCard: { backgroundColor: '#E8F5E9', borderRadius: 12, padding: 12, marginBottom: 12, borderWidth: 1, borderColor: '#C8E6C9' },
  modificationRejectedBanner: { flexDirection: 'row', alignItems: 'flex-start', backgroundColor: '#FEF2F2', padding: 14, borderRadius: 16, marginBottom: 14, gap: 12, borderWidth: 1, borderColor: '#FEE2E2' },
  modificationRejectedTitle: { fontSize: 14, fontWeight: '700', color: '#DC2626', marginBottom: 4 },
  modificationRejectedText: { fontSize: 12, color: '#991B1B', marginBottom: 2 },
  modificationRejectedReason: { fontSize: 11, color: '#DC2626', fontStyle: 'italic', marginTop: 4 },
  modificationRejectedNote: { fontSize: 11, color: '#6B7280', marginTop: 6 },
  
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
  sectionTitle: { fontSize: 16, fontWeight: '800', color: Colors.dark, marginBottom: 0 },
  sectionSubtitle: { fontSize: 14, fontWeight: '600', color: Colors.dark, marginBottom: 12, marginTop: 8 },
  
  timelineHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  timelineHeaderLeft: { flexDirection: 'row', alignItems: 'center', gap: 8, flex: 1 },
  timelineStopCount: { fontSize: 12, color: Colors.gray, fontWeight: '500', marginLeft: 4 },
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
  timelineItemTitle: { fontSize: 15, fontWeight: '700', color: Colors.dark, marginBottom: 6 },
  timelineItemAddress: { fontSize: 12, color: '#6B7280', marginBottom: 8, lineHeight: 16 },
  walkingChip: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 10, paddingVertical: 5, borderRadius: 16, alignSelf: 'flex-start', marginBottom: 8 },
  walkingChipText: { fontSize: 11, fontWeight: '500' },
  routeInfo: { flexDirection: 'row', flexWrap: 'wrap', gap: 12, marginBottom: 8, paddingTop: 6, borderTopWidth: 1, borderTopColor: '#F0F0F0' },
  routeInfoItem: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  routeInfoText: { fontSize: 11, color: '#6B7280' },
  cumulativeInfo: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 10 },
  cumulativeInfoText: { fontSize: 11, color: '#10B981', fontWeight: '500' },
  navigateButton: { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: '#EAF1FF', paddingHorizontal: 12, paddingVertical: 8, borderRadius: 20, alignSelf: 'flex-start' },
  navigateButtonText: { fontSize: 12, color: '#2457A6', fontWeight: '600' },
  
  tripOverviewCard: { backgroundColor: '#EAF1FF', borderRadius: 20, padding: 16, marginBottom: 14 },
  tripOverviewHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 12 },
  tripOverviewTitle: { fontSize: 16, fontWeight: '800', color: '#2457A6' },
  tripOverviewDetails: { marginBottom: 12 },
  tripOverviewItem: { marginBottom: 8 },
  tripOverviewLabel: { fontSize: 11, color: '#6B7280', marginBottom: 2 },
  tripOverviewValue: { fontSize: 14, fontWeight: '600', color: Colors.dark },
  walkDistanceText: { fontSize: 11, color: '#6B7280', marginTop: 2 },
  tripOverviewArrow: { alignItems: 'center', marginVertical: 4 },
  tripOverviewStats: { flexDirection: 'row', flexWrap: 'wrap', gap: 12, paddingTop: 12, borderTopWidth: 1, borderTopColor: '#CDD9F0' },
  tripOverviewStat: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  tripOverviewStatText: { fontSize: 12, color: '#6B7280' },
  
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
  preferenceTag: { paddingHorizontal: 12, paddingVertical: 8, borderRadius: 999 },
  preferenceTagText: { fontSize: 12, fontWeight: '700' },
  
  bookingDetailRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 8 },
  bookingDetailLabel: { fontSize: 14, color: Colors.gray },
  bookingDetailValue: { fontSize: 14, fontWeight: '600', color: Colors.dark },
  bookingTotalRow: { marginTop: 8, paddingTop: 8, borderTopWidth: 1, borderTopColor: '#EEF2F7' },
  bookingTotalLabel: { fontSize: 16, fontWeight: '700', color: Colors.dark },
  bookingTotalValue: { fontSize: 18, fontWeight: '800', color: '#184080' },
  bookingStatusBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20 },
  bookingStatusText: { fontSize: 12, fontWeight: '600' },
  strikethroughText: { textDecorationLine: 'line-through', color: '#9CA3AF' },
  divider: { height: 1, backgroundColor: '#EEF2F7', marginVertical: 16 },
  otherBookedInfo: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFFBEB', padding: 10, borderRadius: 8, marginBottom: 12, gap: 8 },
  otherBookedInfoText: { flex: 1, fontSize: 11, color: '#B45309' },
  availableSeatsInfo: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#E8F5E9', padding: 10, borderRadius: 8, marginBottom: 12, gap: 8 },
  availableSeatsInfoText: { flex: 1, fontSize: 11, color: '#2E7D32' },
  
  modifySeatsMainBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', backgroundColor: '#EEF6FF', borderWidth: 1, borderColor: Colors.primary, borderRadius: 12, paddingVertical: 12, gap: 8, marginTop: 12 },
  modifySeatsMainBtnText: { fontSize: 14, fontWeight: '600', color: Colors.primary },
  modifySeatsNoteText: { fontSize: 10, color: '#9CA3AF', textAlign: 'center', marginTop: 8 },
  
  cancelModificationMainBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', backgroundColor: '#FEF2F2', borderWidth: 1, borderColor: '#EF4444', borderRadius: 12, paddingVertical: 12, gap: 8, marginTop: 12 },
  cancelModificationMainBtnText: { fontSize: 14, fontWeight: '600', color: '#EF4444' },
  
  cancelBookingMainBtn: { marginTop: 12, backgroundColor: '#FEF2F2', paddingVertical: 12, borderRadius: 12, alignItems: 'center', borderWidth: 1, borderColor: '#EF4444' },
  cancelBookingMainBtnText: { color: '#EF4444', fontWeight: '700', fontSize: 14 },
  cancelBookingMainBtnDisabled: { opacity: 0.6 },
  
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
  feedbackInput: { minHeight: 100, borderWidth: 1, borderColor: '#E5E7EB', borderRadius: 16, padding: 14, color: '#111827', fontSize: 14, width: '100%' },
  modalActions: { flexDirection: 'row', gap: 10, marginTop: 18, width: '100%' },
  skipBtn: { flex: 1, borderWidth: 1, borderColor: '#D1D5DB', borderRadius: 999, paddingVertical: 14, alignItems: 'center' },
  skipBtnText: { color: '#6B7280', fontWeight: '600' },
  submitBtn: { flex: 1, backgroundColor: Colors.primary, borderRadius: 999, paddingVertical: 14, alignItems: 'center' },
  submitBtnText: { color: '#fff', fontWeight: '700' },
  
  modifySeatsModalContent: { backgroundColor: '#fff', borderRadius: 24, padding: 20, width: '90%', maxWidth: 400 },
  modifySeatsModalHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 },
  modifySeatsModalTitle: { fontSize: 20, fontWeight: '700', color: Colors.dark, flex: 1, marginLeft: 12 },
  modifySeatsModalSubtitle: { fontSize: 14, color: '#6B7280', marginBottom: 24, textAlign: 'center' },
  modifySeatsSeatSelector: { marginBottom: 20 },
  modifySeatsLabel: { fontSize: 14, fontWeight: '600', color: Colors.dark, marginBottom: 12 },
  modifySeatsControls: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 30 },
  modifySeatsActionBtn: { width: 48, height: 48, borderRadius: 24, backgroundColor: '#F3F4F6', alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: '#E5E7EB' },
  modifySeatsActionBtnDisabled: { opacity: 0.5 },
  modifySeatsCountWrap: { alignItems: 'center' },
  modifySeatsCount: { fontSize: 36, fontWeight: '800', color: Colors.primary },
  modifySeatsMax: { fontSize: 12, color: '#6B7280', marginTop: 4 },
  modifySeatsInfo: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#FEF3C7', padding: 12, borderRadius: 12, marginBottom: 20, gap: 8 },
  modifySeatsInfoText: { fontSize: 13, color: '#92400E', flex: 1 },
  modifySeatsActions: { flexDirection: 'row', gap: 12, marginBottom: 16 },
  modifySeatsCancelBtn: { flex: 1, paddingVertical: 12, borderRadius: 12, borderWidth: 1, borderColor: '#D1D5DB', alignItems: 'center' },
  modifySeatsCancelBtnText: { fontSize: 15, fontWeight: '600', color: '#6B7280' },
  modifySeatsSubmitBtn: { flex: 1, paddingVertical: 12, borderRadius: 12, backgroundColor: Colors.primary, alignItems: 'center' },
  modifySeatsSubmitBtnDisabled: { opacity: 0.6 },
  modifySeatsSubmitBtnText: { fontSize: 15, fontWeight: '700', color: '#fff' },
  modifySeatsNote: { fontSize: 11, color: '#9CA3AF', textAlign: 'center', fontStyle: 'italic' },
  
  imageModalContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', width: '100%' },
  imageModalContent: { width: '90%', backgroundColor: Colors.white, borderRadius: 20, overflow: 'hidden', maxHeight: '80%' },
  imageModalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 16, borderBottomWidth: 1, borderBottomColor: '#EEF2F7' },
  imageModalTitle: { fontSize: 18, fontWeight: '700', color: Colors.dark },
  fullProfileImage: { width: '100%', height: 400, backgroundColor: '#F5F5F5', resizeMode: 'contain' },
  modalSvgContainer: { width: '100%', height: 400, backgroundColor: '#F5F5F5', alignItems: 'center', justifyContent: 'center' },
  noImageContainer: { width: '100%', height: 400, justifyContent: 'center', alignItems: 'center', backgroundColor: '#F5F5F5' },
  noImageText: { fontSize: 16, color: Colors.gray },
  emptyText: { fontSize: 13, color: Colors.gray, fontWeight: '600' },
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
});