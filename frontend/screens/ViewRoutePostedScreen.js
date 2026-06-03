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
//   Alert
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

//   const [drawerExpanded, setDrawerExpanded] = useState(true);
//   const [mapReady, setMapReady] = useState(false);
//   const [bookings, setBookings] = useState([]);
//   const [loadingBookings, setLoadingBookings] = useState(false);
//   const [pendingModifications, setPendingModifications] = useState([]);
//   const [refreshKey, setRefreshKey] = useState(0);
//   const [pollingInterval, setPollingInterval] = useState(null);
  
//   const animatedDrawer = useRef(new Animated.Value(1)).current;
//   const mapRef = useRef(null);
//   const socketRef = useRef(null);
//   const scrollViewRef = useRef(null);
  
//   const [selectedProfile, setSelectedProfile] = useState({
//     visible: false,
//     imageUrl: null,
//     name: '',
//   });
  
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

//   const fetchBookings = useCallback(async () => {
//     if (!ride?.id) return;
//     setLoadingBookings(true);
//     try {
//       const response = await fetch(`${API_BASE_URL}/ride/${ride.id}/passengers?_t=${Date.now()}`);
//       const data = await response.json();
      
//       if (data.passengers && Array.isArray(data.passengers)) {
//         setBookings(data.passengers);
//       } else {
//         setBookings([]);
//       }
//     } catch (error) {
//       console.log('Error fetching bookings:', error);
//       setBookings([]);
//     } finally {
//       setLoadingBookings(false);
//     }
//   }, [ride?.id]);
// const fetchPendingModifications = useCallback(async () => {
//   if (!ride?.id) return;
//   try {
//     console.log('🔍 Fetching pending modifications for ride:', ride.id);
//     const response = await fetch(`${API_BASE_URL}/ride/${ride.id}/pending-modifications?_t=${Date.now()}`);
//     const data = await response.json();
    
//     console.log('📦 Pending modifications response:', JSON.stringify(data, null, 2));
    
//     if (data.pending_requests && Array.isArray(data.pending_requests)) {
//       // Add status field to each request if it's missing
//       const requestsWithStatus = data.pending_requests.map(request => ({
//         ...request,
//         status: request.status || 'pending' // Default to 'pending' if status field is missing
//       }));
      
//       setPendingModifications(requestsWithStatus);
//       console.log(`✅ Found ${requestsWithStatus.length} pending modifications`);
      
//       // Auto-expand drawer if there are pending modifications
//       if (requestsWithStatus.length > 0 && !drawerExpanded) {
//         setDrawerExpanded(true);
//       }
//     } else {
//       setPendingModifications([]);
//       console.log('❌ No pending modifications found');
//     }
//   } catch (error) {
//     console.log('Error fetching pending modifications:', error);
//     setPendingModifications([]);
//   }
// }, [ride?.id, drawerExpanded]);
//   // Setup polling to check for modifications every 10 seconds
//   useEffect(() => {
//     if (!ride?.id) return;
    
//     fetchPendingModifications();
    
//     const interval = setInterval(() => {
//       console.log('🔄 Polling for pending modifications...');
//       fetchPendingModifications();
//     }, 10000);
    
//     setPollingInterval(interval);
    
//     return () => {
//       if (interval) clearInterval(interval);
//     };
//   }, [ride?.id, fetchPendingModifications]);

//   // Setup socket connection for real-time updates
//   useEffect(() => {
//     if (!ride?.id) return;
    
//     console.log('🔌 Setting up socket connection for ride:', ride.id);
    
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
//       console.log('✅ Socket connected successfully for driver ride updates');
//       socket.emit('join-ride-room', ride.id);
//       console.log(`📡 Joined ride room: ride_${ride.id}`);
      
//       if (user?.phone_number) {
//         socket.emit('join-user-room', user.phone_number);
//         console.log(`📡 Joined user room: user_${user.phone_number}`);
//       }
//     });
    
//     socket.on('connect_error', (error) => {
//       console.log('❌ Socket connection error:', error.message);
//     });
    
//     socket.on('disconnect', (reason) => {
//       console.log('🔌 Socket disconnected:', reason);
//       if (reason === 'io server disconnect') {
//         socket.connect();
//       }
//     });
    
//     socket.on('new-modification-request', (data) => {
//       console.log('🔔 New modification request received:', data);
//       if (data.ride_id === ride.id) {
//         showCustomAlert('New Modification Request', `${data.passenger_name} wants to change from ${data.current_seats} to ${data.requested_seats} seat(s)`, 'info');
//         fetchPendingModifications();
//         fetchBookings();
//       }
//     });
    
//     socket.on('modification-response', (data) => {
//       console.log('🔔 Modification response received:', data);
//       if (data.ride_id === ride.id) {
//         if (data.action === 'approved') {
//           showCustomAlert('Modification Approved', `You approved seat change for ${data.passenger_name || 'passenger'}`, 'success');
//         } else {
//           showCustomAlert('Modification Rejected', `You rejected seat change request`, 'warning');
//         }
//         fetchPendingModifications();
//         fetchBookings();
//       }
//     });
    
//     socket.on('booking-update', (data) => {
//       console.log('🔔 Booking update received:', data);
//       if (data.ride_id === ride.id) {
//         fetchBookings();
//       }
//     });
    
//     return () => {
//       if (socketRef.current) {
//         socketRef.current.emit('leave-ride-room', ride.id);
//         socketRef.current.disconnect();
//         socketRef.current = null;
//       }
//     };
//   }, [ride?.id, user?.phone_number]);

//   useFocusEffect(
//     useCallback(() => {
//       fetchBookings();
//       fetchPendingModifications();
//       setRefreshKey(prev => prev + 1);
//       return () => {};
//     }, [fetchBookings, fetchPendingModifications])
//   );

//   const handleBookingAction = async (bookingId, action) => {
//     try {
//       const response = await fetch(`${API_BASE_URL}/booking/${bookingId}/${action}`, {
//         method: 'PUT',
//         headers: { 'Content-Type': 'application/json' },
//       });
//       const data = await response.json();
      
//       if (!response.ok) throw new Error(data.detail || `Failed to ${action} booking`);
      
//       showCustomAlert('Success', `Booking ${action}ed successfully`, 'success');
//       fetchBookings();
      
//       if (socketRef.current) {
//         socketRef.current.emit('booking-status-changed', {
//           ride_id: ride.id,
//           booking_id: bookingId,
//           status: action
//         });
//       }
//     } catch (error) {
//       showCustomAlert('Error', error.message, 'error');
//     }
//   };

//   const [modifyingRequest, setModifyingRequest] = useState(false);

//   const handleModificationAction = async (requestId, action, requestedSeats, currentSeats, bookingId) => {
//     try {
//       setModifyingRequest(true);
//       let url = `${API_BASE_URL}/modification-request/${requestId}/${action}`;
//       if (action === 'reject') {
//         url += `?rejection_reason=${encodeURIComponent('Driver declined the modification request')}`;
//       }
      
//       console.log(`📡 ${action} modification request:`, url);
      
//       const response = await fetch(url, { method: 'PUT' });
//       const data = await response.json();
      
//       if (!response.ok) throw new Error(data.detail || `Failed to ${action} modification`);
      
//       showCustomAlert('Success', `Modification request ${action}ed`, 'success');
      
//       if (action === 'approve') {
//         setBookings(prev => prev.map(b => 
//           b.booking_id === bookingId 
//             ? { ...b, seats_booked: requestedSeats }
//             : b
//         ));
        
//         if (socketRef.current) {
//           socketRef.current.emit('modification-handled', {
//             ride_id: ride.id,
//             request_id: requestId,
//             booking_id: bookingId,
//             action: 'approved',
//             new_seats: requestedSeats
//           });
//         }
//       } else {
//         if (socketRef.current) {
//           socketRef.current.emit('modification-handled', {
//             ride_id: ride.id,
//             request_id: requestId,
//             booking_id: bookingId,
//             action: 'rejected'
//           });
//         }
//       }
      
//       fetchPendingModifications();
//       fetchBookings();
//     } catch (error) {
//       console.error('Modification action error:', error);
//       showCustomAlert('Error', error.message, 'error');
//     } finally {
//       setModifyingRequest(false);
//     }
//   };

//   // Parse coordinates from routeCoordinates
//   const driverStart = useMemo(() => {
//     const routeCoords = parseRouteCoordinates(ride?.routeCoordinates);
//     if (routeCoords.length > 0) {
//       return routeCoords[0];
//     }
//     if (ride?.origin_coords && Array.isArray(ride.origin_coords) && ride.origin_coords.length === 2) {
//       return { 
//         longitude: Number(ride.origin_coords[0]), 
//         latitude: Number(ride.origin_coords[1]) 
//       };
//     }
//     return null;
//   }, [ride]);

//   const driverEnd = useMemo(() => {
//     const routeCoords = parseRouteCoordinates(ride?.routeCoordinates);
//     if (routeCoords.length > 0) {
//       return routeCoords[routeCoords.length - 1];
//     }
//     if (ride?.destination_coords && Array.isArray(ride.destination_coords) && ride.destination_coords.length === 2) {
//       return { 
//         longitude: Number(ride.destination_coords[0]), 
//         latitude: Number(ride.destination_coords[1]) 
//       };
//     }
//     return null;
//   }, [ride]);

//   const routePath = useMemo(() => {
//     const fullRoute = parseRouteCoordinates(ride?.routeCoordinates);
//     if (fullRoute.length >= 2) {
//       return fullRoute;
//     }
//     if (driverStart && driverEnd) {
//       return [driverStart, driverEnd];
//     }
//     return [];
//   }, [ride, driverStart, driverEnd]);

//   const allMarkerCoords = useMemo(() => {
//     const coords = [];
//     if (driverStart && driverStart.latitude && driverStart.longitude) coords.push(driverStart);
//     if (driverEnd && driverEnd.latitude && driverEnd.longitude) coords.push(driverEnd);
//     return coords;
//   }, [driverStart, driverEnd]);

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
//   const vehicleColor = ride?.vehicle?.color || 'Not specified';
  
//   const totalSeatsOffered = ride?.available_seats || ride?.totalSeats || 4;
  
//   let bookedSeatsCount = 0;
  
//   if (ride?.bookings && Array.isArray(ride.bookings)) {
//     bookedSeatsCount = ride.bookings
//       .filter(b => b.status === 'accepted')
//       .reduce((sum, b) => sum + (b.seats_requested || b.seats_booked || 0), 0);
//   }
  
//   if (ride?.total_booked_seats && ride.total_booked_seats > bookedSeatsCount) {
//     bookedSeatsCount = ride.total_booked_seats;
//   }
  
//   const fetchedBookedSeats = bookings
//     .filter(b => b.status === 'accepted')
//     .reduce((sum, b) => sum + (b.seats_booked || 0), 0);
  
//   if (fetchedBookedSeats > bookedSeatsCount) {
//     bookedSeatsCount = fetchedBookedSeats;
//   }
  
//   const availableSeatsCount = Math.max(0, totalSeatsOffered - bookedSeatsCount);

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

//   const handleChatWithPassenger = (passengerPhone, passengerName) => {
//     navigation.navigate('ChatScreen', {
//       receiverPhone: passengerPhone,
//       conversationId: `chat-${ride?.id}-${passengerPhone}`,
//       user: {
//         name: passengerName,
//         tripInfo: `${ride?.origin || 'Pickup'} → ${ride?.destination || 'Drop'}`,
//         phone: passengerPhone
//       }
//     });
//   };

//   useEffect(() => {
//     console.log('📍 Route Path length:', routePath.length);
//     console.log('📍 Driver Start:', driverStart);
//     console.log('📍 Driver End:', driverEnd);
//     console.log('🚗 Vehicle:', { vehicleName, vehicleColor, vehicleRegNumber });
//     console.log('💺 Seat Info:', { totalSeatsOffered, bookedSeatsCount, availableSeatsCount });
//     console.log('📋 Pending Modifications:', pendingModifications.length, pendingModifications);
//   }, [routePath, driverStart, driverEnd, vehicleName, totalSeatsOffered, bookedSeatsCount, availableSeatsCount, pendingModifications]);

//   const initialRegion = {
//     latitude: driverStart?.latitude || 28.6139,
//     longitude: driverStart?.longitude || 77.2090,
//     latitudeDelta: 0.05,
//     longitudeDelta: 0.05,
//   };

//   const confirmedBookings = bookings.filter(b => b.status === 'accepted');
//   const pendingBookings = bookings.filter(b => b.status === 'pending');
//   const pendingMods = pendingModifications.filter(m => m.status === 'pending');

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
//             <Polyline 
//               coordinates={routePath} 
//               strokeColor="#2457A6" 
//               strokeWidth={5} 
//               lineCap="round" 
//               lineJoin="round" 
//             />
//           )}

//           {driverStart && driverStart.latitude && driverStart.longitude && (
//             <Marker coordinate={driverStart} anchor={{ x: 0.5, y: 1 }}>
//               <View style={styles.markerWrapper}>
//                 <View style={[styles.pinBubble, { backgroundColor: '#16A34A' }]}>
//                   <Text style={styles.pinIcon}>S</Text>
//                 </View>
//                 <View style={[styles.pinPointer, { borderTopColor: '#16A34A' }]} />
//                 <View style={styles.pinLabelBubble}>
//                   <Text style={styles.pinLabelText}>Start Trip</Text>
//                 </View>
//               </View>
//             </Marker>
//           )}

//           {driverEnd && driverEnd.latitude && driverEnd.longitude && (
//             <Marker coordinate={driverEnd} anchor={{ x: 0.5, y: 1 }}>
//               <View style={styles.markerWrapper}>
//                 <View style={[styles.pinBubble, { backgroundColor: '#DC2626' }]}>
//                   <Text style={styles.pinIcon}>E</Text>
//                 </View>
//                 <View style={[styles.pinPointer, { borderTopColor: '#DC2626' }]} />
//                 <View style={styles.pinLabelBubble}>
//                   <Text style={styles.pinLabelText}>End Trip</Text>
//                 </View>
//               </View>
//             </Marker>
//           )}
//         </MapView>

//         <TouchableOpacity style={styles.mapBackButton} onPress={() => navigation.goBack()}>
//           <Ionicons name="chevron-back" size={26} color={Colors.secondary} />
//         </TouchableOpacity>
//       </Animated.View>

//       {/* Drawer - Pending notification badge on collapsed view */}
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
//           </View>
//         ) : (
//           <ScrollView 
//             ref={scrollViewRef}
//             style={styles.drawerScroll} 
//             contentContainerStyle={styles.drawerContent} 
//             showsVerticalScrollIndicator={false}
//           >
//             {/* Trip Details Section */}
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
//                     <Text style={styles.timelinePlace}>{ride?.origin || 'Pickup point'}</Text>
//                     <View style={styles.timelineMetaRow}>
//                       <Ionicons name="time-outline" size={13} color={Colors.gray} />
//                       <Text style={styles.timelineMetaText}>{formatDate(ride?.departure_time)}</Text>
//                     </View>
//                   </View>
//                   <View style={styles.timelineItem}>
//                     <Text style={styles.timelineLabel}>Dropoff</Text>
//                     <Text style={styles.timelinePlace}>{ride?.destination || 'Drop point'}</Text>
//                     <Text style={styles.timelineMetaText}>Estimated: {ride?.duration_text || '--'}</Text>
//                   </View>
//                 </View>
//               </View>
//             </View>

//             {/* Vehicle Details Section */}
//             <View style={styles.cardSection}>
//               <Text style={styles.sectionTitle}>Vehicle Details</Text>
//               <View style={styles.vehicleHeaderRow}>
//                 <View style={styles.vehicleIconCircle}>
//                   <Ionicons name="car-sport-outline" size={24} color="#2457A6" />
//                 </View>
//                 <View style={styles.vehicleMeta}>
//                   <Text style={styles.vehicleTitle}>{vehicleName}</Text>
//                   <Text style={styles.vehicleSub}>
//                     {vehicleColor !== 'Not specified' ? `${vehicleColor}` : ''}
//                   </Text>
//                   {vehicleRegNumber && (
//                     <View style={styles.vehicleRegContainer}>
//                       <Ionicons name="clipboard-outline" size={12} color="#6B7280" />
//                       <Text style={styles.vehicleRegText}>Reg: {vehicleRegNumber}</Text>
//                     </View>
//                   )}
//                 </View>
//               </View>
//             </View>

//             {/* Seat Occupancy Summary */}
//             <View style={styles.cardSection}>
//               <Text style={styles.sectionTitle}>Seat Information</Text>
//               <View style={styles.seatInfoContainer}>
//                 <View style={styles.seatInfoItem}>
//                   <View style={[styles.seatIconCircle, { backgroundColor: '#EAF1FF' }]}>
//                     <Ionicons name="car-sport-outline" size={24} color="#2457A6" />
//                   </View>
//                   <View style={styles.seatInfoText}>
//                     <Text style={styles.seatInfoLabel}>Total Seats Offered</Text>
//                     <Text style={styles.seatInfoValue}>{totalSeatsOffered} seats</Text>
//                   </View>
//                 </View>
                
//                 <View style={styles.seatDivider} />
                
//                 <View style={styles.seatInfoItem}>
//                   <View style={[styles.seatIconCircle, { backgroundColor: '#E8F5E9' }]}>
//                     <Ionicons name="people" size={24} color="#10B981" />
//                   </View>
//                   <View style={styles.seatInfoText}>
//                     <Text style={styles.seatInfoLabel}>Booked Seats</Text>
//                     <Text style={[styles.seatInfoValue, { color: '#10B981' }]}>{bookedSeatsCount} seats</Text>
//                   </View>
//                 </View>
                
//                 <View style={styles.seatDivider} />
                
//                 <View style={styles.seatInfoItem}>
//                   <View style={[styles.seatIconCircle, { backgroundColor: '#FFF3E0' }]}>
//                     <Ionicons name="person-add" size={24} color="#F59E0B" />
//                   </View>
//                   <View style={styles.seatInfoText}>
//                     <Text style={styles.seatInfoLabel}>Available Seats</Text>
//                     <Text style={[styles.seatInfoValue, { color: '#F59E0B' }]}>{availableSeatsCount} seats</Text>
//                   </View>
//                 </View>
//               </View>
              
//               <View style={styles.progressBarContainer}>
//                 <View 
//                   style={[
//                     styles.progressBar, 
//                     { width: `${(bookedSeatsCount / totalSeatsOffered) * 100}%` }
//                   ]} 
//                 />
//               </View>
//               <Text style={styles.progressText}>
//                 {bookedSeatsCount} out of {totalSeatsOffered} seats booked
//               </Text>
//             </View>

//             {/* PENDING MODIFICATION REQUESTS SECTION - PROMINENT */}
//             {pendingMods.length > 0 && (
//               <View style={[styles.cardSection, styles.pendingModCard]}>
//                 <View style={styles.pendingModHeader}>
//                   <Text style={[styles.sectionTitle, { color: '#F59E0B' }]}>
//                     ⏳ Pending Modification Requests ({pendingMods.length})
//                   </Text>
//                   <View style={styles.actionNeededBadge}>
//                     <Text style={styles.actionNeededText}>ACTION NEEDED</Text>
//                   </View>
//                 </View>
                
//                 {pendingMods.map((request) => (
//                   <View key={request.id} style={styles.pendingModificationCard}>
//                     <View style={styles.pendingModificationHeader}>
//                       <View style={styles.passengerAvatarSmall}>
//                         {request.passenger_photo ? (
//                           <Image source={{ uri: buildImageUrl(request.passenger_photo) }} style={styles.smallAvatar} />
//                         ) : (
//                           <View style={styles.smallAvatarPlaceholder}>
//                             <Text style={styles.smallAvatarText}>{getInitials(request.passenger_name)}</Text>
//                           </View>
//                         )}
//                       </View>
//                       <View style={styles.pendingModificationInfo}>
//                         <Text style={styles.passengerName}>{request.passenger_name}</Text>
//                         <View style={styles.seatChangeIndicator}>
//                           <Text style={styles.oldSeatText}>{request.current_seats} seats</Text>
//                           <Ionicons name="arrow-forward" size={12} color="#F59E0B" />
//                           <Text style={styles.newSeatText}>{request.requested_seats} seats</Text>
//                         </View>
//                         <Text style={styles.modificationTime}>
//                           Requested: {new Date(request.created_at).toLocaleString()}
//                         </Text>
//                       </View>
//                     </View>
//                     <View style={styles.modificationActions}>
//                       <TouchableOpacity 
//                         style={[styles.modActionBtn, styles.approveModBtn]} 
//                         onPress={() => handleModificationAction(request.id, 'approve', request.requested_seats, request.current_seats, request.booking_id)}
//                         disabled={modifyingRequest}>
//                         <Ionicons name="checkmark" size={16} color="#fff" />
//                         <Text style={styles.modActionBtnText}>Approve</Text>
//                       </TouchableOpacity>
//                       <TouchableOpacity 
//                         style={[styles.modActionBtn, styles.rejectModBtn]} 
//                         onPress={() => handleModificationAction(request.id, 'reject', request.requested_seats, request.current_seats, request.booking_id)}
//                         disabled={modifyingRequest}>
//                         <Ionicons name="close" size={16} color="#fff" />
//                         <Text style={styles.modActionBtnText}>Reject</Text>
//                       </TouchableOpacity>
//                     </View>
//                   </View>
//                 ))}
//               </View>
//             )}

//             {/* CONFIRMED BOOKINGS SECTION */}
//             {confirmedBookings.length > 0 && (
//               <View style={styles.cardSection}>
//                 <Text style={styles.sectionTitle}>Confirmed Bookings ✅ ({confirmedBookings.length})</Text>
//                 {confirmedBookings.map((booking) => {
//                   const profilePicUrl = booking.profile_picture ? buildImageUrl(booking.profile_picture) : null;
//                   const isSvg = profilePicUrl ? isSvgUrl(profilePicUrl) : false;
                  
//                   return (
//                     <View key={booking.booking_id} style={styles.bookingItem}>
//                       <TouchableOpacity 
//                         style={styles.passengerAvatar}
//                         onPress={() => {
//                           if (profilePicUrl) {
//                             setSelectedProfile({ 
//                               visible: true, 
//                               imageUrl: profilePicUrl, 
//                               name: booking.passenger_name || 'Passenger'
//                             });
//                           } else {
//                             showCustomAlert('No Photo', `${booking.passenger_name || 'Passenger'} has not uploaded a profile picture`, 'info');
//                           }
//                         }}>
//                         {profilePicUrl && !isSvg ? (
//                           <Image 
//                             source={{ uri: profilePicUrl }} 
//                             style={styles.avatarImage}
//                           />
//                         ) : profilePicUrl && isSvg ? (
//                           <View style={styles.avatarImageSvg}>
//                             <SvgCssUri uri={profilePicUrl} width={44} height={44} />
//                           </View>
//                         ) : (
//                           <View style={styles.avatarPlaceholder}>
//                             <Text style={styles.avatarPlaceholderText}>{getInitials(booking.passenger_name)}</Text>
//                           </View>
//                         )}
//                       </TouchableOpacity>
//                       <View style={styles.bookingInfo}>
//                         <Text style={styles.passengerName}>{booking.passenger_name || 'Passenger'}</Text>
//                         <Text style={styles.bookingSeats}>
//                           <Ionicons name="people-outline" size={12} color={Colors.gray} /> {booking.seats_booked} seat{booking.seats_booked > 1 ? 's' : ''}
//                         </Text>
//                       </View>
//                       <View style={styles.bookingActions}>
//                         <View style={[styles.bookingStatusBadge, { backgroundColor: getStatusColor(booking.status) + '20' }]}>
//                           <Text style={[styles.bookingStatusText, { color: getStatusColor(booking.status) }]}>
//                             {getStatusText(booking.status)}
//                           </Text>
//                         </View>
//                         <TouchableOpacity 
//                           style={styles.chatButton}
//                           onPress={() => handleChatWithPassenger(booking.passenger_phone, booking.passenger_name)}>
//                           <Ionicons name="chatbubble-ellipses" size={22} color={Colors.primary} />
//                         </TouchableOpacity>
//                       </View>
//                     </View>
//                   );
//                 })}
//               </View>
//             )}

//             {/* PENDING BOOKINGS SECTION */}
//             {pendingBookings.length > 0 && (
//               <View style={styles.cardSection}>
//                 <Text style={[styles.sectionTitle, { color: '#F59E0B' }]}>
//                   Pending Requests ⏳ ({pendingBookings.length})
//                 </Text>
//                 {pendingBookings.map((booking) => {
//                   const profilePicUrl = booking.profile_picture ? buildImageUrl(booking.profile_picture) : null;
//                   const isSvg = profilePicUrl ? isSvgUrl(profilePicUrl) : false;
                  
//                   return (
//                     <View key={booking.booking_id} style={styles.bookingItem}>
//                       <TouchableOpacity 
//                         style={styles.passengerAvatar}
//                         onPress={() => {
//                           if (profilePicUrl) {
//                             setSelectedProfile({ 
//                               visible: true, 
//                               imageUrl: profilePicUrl, 
//                               name: booking.passenger_name || 'Passenger'
//                             });
//                           }
//                         }}>
//                         {profilePicUrl && !isSvg ? (
//                           <Image source={{ uri: profilePicUrl }} style={styles.avatarImage} />
//                         ) : profilePicUrl && isSvg ? (
//                           <View style={styles.avatarImageSvg}>
//                             <SvgCssUri uri={profilePicUrl} width={44} height={44} />
//                           </View>
//                         ) : (
//                           <View style={styles.avatarPlaceholder}>
//                             <Text style={styles.avatarPlaceholderText}>{getInitials(booking.passenger_name)}</Text>
//                           </View>
//                         )}
//                       </TouchableOpacity>
//                       <View style={styles.bookingInfo}>
//                         <Text style={styles.passengerName}>{booking.passenger_name || 'Passenger'}</Text>
//                         <Text style={styles.bookingSeats}>
//                           <Ionicons name="people-outline" size={12} color={Colors.gray} /> {booking.seats_booked} seat{booking.seats_booked > 1 ? 's' : ''}
//                         </Text>
//                       </View>
//                       <View style={styles.pendingActions}>
//                         <TouchableOpacity 
//                           style={[styles.actionSmallBtn, styles.acceptBtn]} 
//                           onPress={() => handleBookingAction(booking.booking_id, 'accept')}>
//                           <Ionicons name="checkmark" size={16} color="#fff" />
//                         </TouchableOpacity>
//                         <TouchableOpacity 
//                           style={[styles.actionSmallBtn, styles.rejectBtn]} 
//                           onPress={() => handleBookingAction(booking.booking_id, 'reject')}>
//                           <Ionicons name="close" size={16} color="#fff" />
//                         </TouchableOpacity>
//                       </View>
//                     </View>
//                   );
//                 })}
//               </View>
//             )}

//             {/* No Bookings Message */}
//             {bookings.length === 0 && !loadingBookings && (
//               <View style={styles.cardSection}>
//                 <View style={styles.noBookingsContainer}>
//                   <Ionicons name="people-outline" size={48} color={Colors.gray} />
//                   <Text style={styles.noBookingsText}>No booking requests yet</Text>
//                   <Text style={styles.noBookingsSubtext}>When passengers request to join this ride, they'll appear here</Text>
//                 </View>
//               </View>
//             )}

//             {loadingBookings && (
//               <View style={styles.cardSection}>
//                 <View style={styles.loadingContainer}>
//                   <ActivityIndicator size="small" color={Colors.primary} />
//                   <Text style={styles.loadingText}>Loading bookings...</Text>
//                 </View>
//               </View>
//             )}

//             <TouchableOpacity 
//               style={styles.refreshButton}
//               onPress={() => {
//                 console.log('🔄 Manual refresh triggered');
//                 fetchPendingModifications();
//                 fetchBookings();
//                 showCustomAlert('Refreshed', 'Checking for new modification requests...', 'info');
//               }}>
//               <Ionicons name="refresh-outline" size={20} color="#2457A6" />
//               <Text style={styles.refreshButtonText}>Check for Requests</Text>
//             </TouchableOpacity>

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

// const styles = StyleSheet.create({
//   container: { flex: 1, backgroundColor: '#F4F5F7' },
//   mapContainer: { width: '100%', overflow: 'hidden', backgroundColor: '#E8EEF7' },
//   map: { flex: 1, backgroundColor: '#E8EEF7' },
//   mapBackButton: { 
//     position: 'absolute', 
//     top: Platform.OS === 'ios' ? 54 : 22, 
//     left: 14, 
//     width: 42, 
//     height: 42, 
//     borderRadius: 25, 
//     backgroundColor: 'rgba(255,255,255,0.96)', 
//     alignItems: 'center', 
//     justifyContent: 'center',
//     shadowColor: '#000',
//     shadowOffset: { width: 0, height: 2 },
//     shadowOpacity: 0.1,
//     shadowRadius: 4,
//     elevation: 3,
//   },
//   markerWrapper: { alignItems: 'center' },
//   pinBubble: { 
//     width: 32, 
//     height: 32, 
//     borderRadius: 16, 
//     borderWidth: 3, 
//     borderColor: 'white', 
//     alignItems: 'center', 
//     justifyContent: 'center', 
//     shadowColor: '#000', 
//     shadowOffset: { width: 0, height: 3 }, 
//     shadowOpacity: 0.25, 
//     shadowRadius: 4, 
//     elevation: 5 
//   },
//   pinPointer: { 
//     width: 0, 
//     height: 0, 
//     backgroundColor: 'transparent', 
//     borderStyle: 'solid', 
//     borderLeftWidth: 7, 
//     borderRightWidth: 7, 
//     borderTopWidth: 10, 
//     borderLeftColor: 'transparent', 
//     borderRightColor: 'transparent', 
//     marginTop: -2 
//   },
//   pinIcon: { fontSize: 14, fontWeight: '800', color: 'white', textAlign: 'center', lineHeight: 18 },
//   pinLabelBubble: { 
//     backgroundColor: 'rgba(0,0,0,0.75)', 
//     borderRadius: 8, 
//     paddingHorizontal: 8, 
//     paddingVertical: 3, 
//     marginTop: 4 
//   },
//   pinLabelText: { color: 'white', fontSize: 10, fontWeight: '700' },
//   pinLabelBubbleYellow: { 
//     backgroundColor: 'rgba(113, 63, 18, 0.9)', 
//     borderRadius: 8, 
//     paddingHorizontal: 8, 
//     paddingVertical: 3, 
//     marginTop: 4 
//   },
//   pinLabelTextYellow: { color: '#FACC15', fontSize: 10, fontWeight: '700' },
//   drawer: { 
//     position: 'absolute', 
//     bottom: 0, 
//     left: 0, 
//     right: 0, 
//     backgroundColor: '#F4F5F7', 
//     borderTopLeftRadius: 28, 
//     borderTopRightRadius: 28, 
//     overflow: 'hidden',
//     shadowColor: '#000',
//     shadowOffset: { width: 0, height: -2 },
//     shadowOpacity: 0.1,
//     shadowRadius: 8,
//     elevation: 10,
//   },
//   handleWrap: { alignItems: 'center', paddingTop: 10, paddingBottom: 8, backgroundColor: '#F4F5F7', position: 'relative' },
//   handleHitArea: { paddingHorizontal: 40, paddingVertical: 10, alignItems: 'center', justifyContent: 'center' },
//   handleBar: { width: 64, height: 6, borderRadius: 99, backgroundColor: '#CDD2D8' },
//   pendingNotificationBadge: {
//     position: 'absolute',
//     right: 20,
//     top: 8,
//     backgroundColor: '#F59E0B',
//     borderRadius: 12,
//     paddingHorizontal: 8,
//     paddingVertical: 2,
//   },
//   pendingNotificationText: {
//     color: '#fff',
//     fontSize: 12,
//     fontWeight: 'bold',
//   },
//   collapsedSummary: { paddingHorizontal: 16, paddingTop: 4, paddingBottom: 12 },
//   collapsedTopRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: 12 },
//   collapsedDriver: { fontSize: 16, fontWeight: '800', color: Colors.dark },
//   collapsedSub: { marginTop: 2, fontSize: 12, color: Colors.gray, fontWeight: '600' },
//   collapsedPriceWrap: { alignItems: 'flex-end' },
//   collapsedPrice: { fontSize: 18, fontWeight: '900', color: Colors.dark },
//   collapsedPerSeat: { fontSize: 10, color: Colors.gray, fontWeight: '600' },
//   drawerScroll: { flex: 1 },
//   drawerContent: { paddingHorizontal: 16, paddingBottom: 16 },
//   cardSection: { 
//     backgroundColor: 'white', 
//     borderRadius: 20, 
//     padding: 16, 
//     marginBottom: 14, 
//     shadowColor: '#000', 
//     shadowOffset: { width: 0, height: 2 }, 
//     shadowOpacity: 0.05, 
//     shadowRadius: 8, 
//     elevation: 2 
//   },
//   pendingModCard: {
//     borderWidth: 2,
//     borderColor: '#F59E0B',
//     backgroundColor: '#FFFBEB',
//   },
//   pendingModHeader: {
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//     alignItems: 'center',
//     marginBottom: 14,
//   },
//   actionNeededBadge: {
//     backgroundColor: '#F59E0B',
//     paddingHorizontal: 8,
//     paddingVertical: 4,
//     borderRadius: 12,
//   },
//   actionNeededText: {
//     color: '#fff',
//     fontSize: 12,
//     fontWeight: 'bold',
//   },
//   sectionTitle: { fontSize: 16, fontWeight: '800', color: Colors.dark, marginBottom: 14 },
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
//   vehicleIconCircle: { 
//     width: 48, 
//     height: 48, 
//     borderRadius: 24, 
//     backgroundColor: '#EAF1FF', 
//     alignItems: 'center', 
//     justifyContent: 'center', 
//     marginRight: 12 
//   },
//   vehicleMeta: { flex: 1 },
//   vehicleTitle: { fontSize: 16, fontWeight: '800', color: Colors.dark },
//   vehicleSub: { marginTop: 3, fontSize: 12, color: Colors.gray, fontWeight: '600' },
//   vehicleRegContainer: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 6, paddingTop: 6, borderTopWidth: 1, borderTopColor: '#F0F0F0' },
//   vehicleRegText: { fontSize: 11, color: '#6B7280', fontWeight: '500' },
//   seatInfoContainer: {
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//     alignItems: 'center',
//     marginBottom: 16,
//   },
//   seatInfoItem: {
//     flex: 1,
//     alignItems: 'center',
//   },
//   seatIconCircle: {
//     width: 48,
//     height: 48,
//     borderRadius: 24,
//     alignItems: 'center',
//     justifyContent: 'center',
//     marginBottom: 8,
//   },
//   seatInfoText: {
//     alignItems: 'center',
//   },
//   seatInfoLabel: {
//     fontSize: 11,
//     color: Colors.gray,
//     textAlign: 'center',
//   },
//   seatInfoValue: {
//     fontSize: 18,
//     fontWeight: '800',
//     color: Colors.dark,
//     marginTop: 2,
//   },
//   seatDivider: {
//     width: 1,
//     height: 50,
//     backgroundColor: '#E5E7EB',
//   },
//   progressBarContainer: {
//     height: 6,
//     backgroundColor: '#E5E7EB',
//     borderRadius: 3,
//     overflow: 'hidden',
//     marginBottom: 8,
//   },
//   progressBar: {
//     height: '100%',
//     backgroundColor: '#10B981',
//     borderRadius: 3,
//   },
//   progressText: {
//     fontSize: 12,
//     color: Colors.gray,
//     textAlign: 'center',
//   },
//   refreshButton: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     justifyContent: 'center',
//     backgroundColor: '#EAF1FF',
//     paddingVertical: 12,
//     borderRadius: 12,
//     marginBottom: 14,
//     gap: 8,
//   },
//   refreshButtonText: {
//     color: '#2457A6',
//     fontSize: 14,
//     fontWeight: '600',
//   },
//   pendingModificationCard: { backgroundColor: '#FFFBEB', borderRadius: 16, padding: 12, marginBottom: 12, borderWidth: 1, borderColor: '#FDE68A' },
//   pendingModificationHeader: { flexDirection: 'row', marginBottom: 12 },
//   pendingModificationInfo: { flex: 1, marginLeft: 12 },
//   passengerName: { fontSize: 14, fontWeight: '600', color: Colors.dark },
//   seatChangeIndicator: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 4 },
//   oldSeatText: { fontSize: 12, color: '#DC2626', textDecorationLine: 'line-through' },
//   newSeatText: { fontSize: 12, color: '#10B981', fontWeight: 'bold' },
//   modificationDetails: { fontSize: 12, color: '#B45309', marginTop: 2 },
//   modificationTime: { fontSize: 10, color: '#B45309', marginTop: 2, opacity: 0.7 },
//   modificationActions: { flexDirection: 'row', gap: 10 },
//   modActionBtn: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 10, borderRadius: 8, gap: 6 },
//   approveModBtn: { backgroundColor: '#10B981' },
//   rejectModBtn: { backgroundColor: '#EF4444' },
//   modActionBtnText: { color: '#fff', fontSize: 13, fontWeight: '600' },
//   bookingItem: { flexDirection: 'row', alignItems: 'center', paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: '#EEF2F7' },
//   passengerAvatar: { width: 44, height: 44, borderRadius: 22, overflow: 'hidden', marginRight: 12 },
//   passengerAvatarSmall: { width: 36, height: 36, borderRadius: 18, overflow: 'hidden' },
//   avatarImage: { width: 44, height: 44, borderRadius: 22, resizeMode: 'cover' },
//   avatarImageSvg: { width: 44, height: 44, borderRadius: 22, overflow: 'hidden', alignItems: 'center', justifyContent: 'center', backgroundColor: '#E5E7EB' },
//   avatarPlaceholder: { width: 44, height: 44, borderRadius: 22, backgroundColor: '#E5E7EB', alignItems: 'center', justifyContent: 'center' },
//   avatarPlaceholderText: { fontSize: 16, fontWeight: '700', color: Colors.primary },
//   smallAvatar: { width: 36, height: 36, borderRadius: 18 },
//   smallAvatarPlaceholder: { width: 36, height: 36, borderRadius: 18, backgroundColor: '#E5E7EB', alignItems: 'center', justifyContent: 'center' },
//   smallAvatarText: { fontSize: 14, fontWeight: '700', color: Colors.primary },
//   bookingInfo: { flex: 1 },
//   bookingSeats: { fontSize: 12, color: Colors.gray, marginTop: 2, flexDirection: 'row', alignItems: 'center' },
//   bookingStatusBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12 },
//   bookingStatusText: { fontSize: 11, fontWeight: '600' },
//   bookingActions: { flexDirection: 'row', alignItems: 'center', gap: 12 },
//   chatButton: { 
//     padding: 8, 
//     backgroundColor: '#EFF6FF', 
//     borderRadius: 20,
//     alignItems: 'center',
//     justifyContent: 'center',
//   },
//   pendingActions: { flexDirection: 'row', gap: 8 },
//   actionSmallBtn: { width: 36, height: 36, borderRadius: 18, alignItems: 'center', justifyContent: 'center' },
//   acceptBtn: { backgroundColor: '#10B981' },
//   rejectBtn: { backgroundColor: '#EF4444' },
//   noBookingsContainer: { alignItems: 'center', padding: 30, gap: 10 },
//   noBookingsText: { fontSize: 14, fontWeight: '600', color: Colors.gray },
//   noBookingsSubtext: { fontSize: 12, color: Colors.gray, textAlign: 'center' },
//   loadingContainer: { alignItems: 'center', padding: 20, gap: 10 },
//   loadingText: { fontSize: 12, color: Colors.gray },
//   simpleInfoLeft: { flexDirection: 'row', alignItems: 'center', gap: 12 },
//   safetyCard: { backgroundColor: '#FFF3E7', borderRadius: 18, padding: 16, marginBottom: 14 },
//   safetyTitle: { fontSize: 14, color: '#2457A6', fontWeight: '800' },
//   safetySub: { marginTop: 2, fontSize: 12, color: '#2457A6', opacity: 0.9, fontWeight: '600' },
//   loaderContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#fff' },
//   modalBackdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center' },
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

//   const [drawerExpanded, setDrawerExpanded] = useState(true);
//   const [mapReady, setMapReady] = useState(false);
//   const [bookings, setBookings] = useState([]);
//   const [loadingBookings, setLoadingBookings] = useState(false);
//   const [pendingModifications, setPendingModifications] = useState([]);
//   const [refreshKey, setRefreshKey] = useState(0);
//   const [pollingInterval, setPollingInterval] = useState(null);
  
//   const animatedDrawer = useRef(new Animated.Value(1)).current;
//   const mapRef = useRef(null);
//   const socketRef = useRef(null);
//   const scrollViewRef = useRef(null);
  
//   const [selectedProfile, setSelectedProfile] = useState({
//     visible: false,
//     imageUrl: null,
//     name: '',
//   });
  
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

//   const getRideStatusDisplay = () => {
//     if (ride?.cancellation_reason) {
//       if (ride.cancellation_reason.includes("Auto-cancelled") || 
//           ride.cancellation_reason.includes("was not started")) {
//         return {
//           message: "Ride Auto-cancelled - Driver did not start the ride within 30 minutes",
//           type: 'auto-cancelled',
//           icon: 'alert-circle',
//           color: '#DC2626'
//         };
//       }
//       return {
//         message: `Ride Cancelled: ${ride.cancellation_reason}`,
//         type: 'cancelled',
//         icon: 'close-circle',
//         color: '#DC2626'
//       };
//     }
    
//     if (ride?.started_at) {
//       return {
//         message: "Ride in Progress - Passengers are tracking live",
//         type: 'ongoing',
//         icon: 'car-sport',
//         color: '#10B981'
//       };
//     }
    
//     if (ride?.status === "completed") {
//       return {
//         message: "Ride Completed",
//         type: 'completed',
//         icon: 'checkmark-done-circle',
//         color: '#6B7280'
//       };
//     }
    
//     const now = new Date();
//     const departureTime = new Date(ride?.departure_time);
//     const minutesToDeparture = Math.floor((departureTime - now) / (1000 * 60));
//     const minutesSinceDeparture = Math.floor((now - departureTime) / (1000 * 60));
    
//     if (minutesSinceDeparture > 30) {
//       return {
//         message: "Ride Auto-cancelled - Start window expired (30 minutes past departure)",
//         type: 'auto-cancelled',
//         icon: 'alert-circle',
//         color: '#DC2626'
//       };
//     }
    
//     if (minutesToDeparture <= 0 && minutesSinceDeparture <= 30) {
//       return {
//         message: `⚠️ Ride is ${minutesSinceDeparture} minutes late. Start before auto-cancellation in ${30 - minutesSinceDeparture} minutes`,
//         type: 'late',
//         icon: 'time-outline',
//         color: '#F59E0B'
//       };
//     }
    
//     if (minutesToDeparture <= 15) {
//       if (minutesToDeparture <= 0) {
//         return {
//           message: `Ready to start! (${Math.abs(minutesToDeparture)} minutes late)`,
//           type: 'ready',
//           icon: 'time-outline',
//           color: '#F59E0B'
//         };
//       }
//       return {
//         message: `Ready to start in ${minutesToDeparture} minutes`,
//         type: 'ready',
//         icon: 'time-outline',
//         color: '#F59E0B'
//       };
//     }
    
//     if (minutesToDeparture > 15) {
//       return {
//         message: `Departure in ${minutesToDeparture} minutes`,
//         type: 'upcoming',
//         icon: 'calendar-outline',
//         color: '#2457A6'
//       };
//     }
    
//     return null;
//   };

//   const fetchBookings = useCallback(async () => {
//     if (!ride?.id) return;
//     setLoadingBookings(true);
//     try {
//       const response = await fetch(`${API_BASE_URL}/ride/${ride.id}/passengers?_t=${Date.now()}`);
//       const data = await response.json();
      
//       if (data.passengers && Array.isArray(data.passengers)) {
//         setBookings(data.passengers);
//       } else {
//         setBookings([]);
//       }
//     } catch (error) {
//       console.log('Error fetching bookings:', error);
//       setBookings([]);
//     } finally {
//       setLoadingBookings(false);
//     }
//   }, [ride?.id]);

//   const fetchPendingModifications = useCallback(async () => {
//     if (!ride?.id) return;
//     try {
//       console.log('🔍 Fetching pending modifications for ride:', ride.id);
//       const response = await fetch(`${API_BASE_URL}/ride/${ride.id}/pending-modifications?_t=${Date.now()}`);
//       const data = await response.json();
      
//       console.log('📦 Pending modifications response:', JSON.stringify(data, null, 2));
      
//       if (data.pending_requests && Array.isArray(data.pending_requests)) {
//         const requestsWithStatus = data.pending_requests.map(request => ({
//           ...request,
//           status: request.status || 'pending'
//         }));
        
//         setPendingModifications(requestsWithStatus);
//         console.log(`✅ Found ${requestsWithStatus.length} pending modifications`);
        
//         if (requestsWithStatus.length > 0 && !drawerExpanded) {
//           setDrawerExpanded(true);
//         }
//       } else {
//         setPendingModifications([]);
//         console.log('❌ No pending modifications found');
//       }
//     } catch (error) {
//       console.log('Error fetching pending modifications:', error);
//       setPendingModifications([]);
//     }
//   }, [ride?.id, drawerExpanded]);

//   // Check modifications lock status (within 15 minutes of departure)
//   const areModificationsLocked = () => {
//     const now = new Date();
//     const departureTime = new Date(ride?.departure_time);
//     const minutesToDeparture = (departureTime - now) / (1000 * 60);
//     return minutesToDeparture <= 15 && minutesToDeparture > -30 && !ride?.started_at;
//   };

//   // Check if ride is in late window (0-30 minutes past departure)
//   const isInLateWindow = () => {
//     const now = new Date();
//     const departureTime = new Date(ride?.departure_time);
//     const minutesSinceDeparture = (now - departureTime) / (1000 * 60);
//     return minutesSinceDeparture > 0 && minutesSinceDeparture <= 30 && !ride?.started_at;
//   };

//   // Setup polling for modifications
//   useEffect(() => {
//     if (!ride?.id) return;
    
//     fetchPendingModifications();
    
//     const interval = setInterval(() => {
//       console.log('🔄 Polling for pending modifications...');
//       fetchPendingModifications();
//     }, 10000);
    
//     setPollingInterval(interval);
    
//     return () => {
//       if (interval) clearInterval(interval);
//     };
//   }, [ride?.id, fetchPendingModifications]);

//   // Setup socket connection
//   useEffect(() => {
//     if (!ride?.id) return;
    
//     console.log('🔌 Setting up socket connection for ride:', ride.id);
    
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
//       console.log('✅ Socket connected successfully for driver ride updates');
//       socket.emit('join-ride-room', ride.id);
//       console.log(`📡 Joined ride room: ride_${ride.id}`);
      
//       if (user?.phone_number) {
//         socket.emit('join-user-room', user.phone_number);
//         console.log(`📡 Joined user room: user_${user.phone_number}`);
//       }
//     });
    
//     socket.on('connect_error', (error) => {
//       console.log('❌ Socket connection error:', error.message);
//     });
    
//     socket.on('disconnect', (reason) => {
//       console.log('🔌 Socket disconnected:', reason);
//       if (reason === 'io server disconnect') {
//         socket.connect();
//       }
//     });
    
//     socket.on('new-modification-request', (data) => {
//       console.log('🔔 New modification request received:', data);
//       if (data.ride_id === ride.id) {
//         showCustomAlert('New Modification Request', `${data.passenger_name} wants to change from ${data.current_seats} to ${data.requested_seats} seat(s)`, 'info');
//         fetchPendingModifications();
//         fetchBookings();
//       }
//     });
    
//     socket.on('modification-response', (data) => {
//       console.log('🔔 Modification response received:', data);
//       if (data.ride_id === ride.id) {
//         if (data.action === 'approved') {
//           showCustomAlert('Modification Approved', `You approved seat change for ${data.passenger_name || 'passenger'}`, 'success');
//         } else {
//           showCustomAlert('Modification Rejected', `You rejected seat change request`, 'warning');
//         }
//         fetchPendingModifications();
//         fetchBookings();
//       }
//     });
    
//     socket.on('booking-update', (data) => {
//       console.log('🔔 Booking update received:', data);
//       if (data.ride_id === ride.id) {
//         fetchBookings();
//       }
//     });
    
//     return () => {
//       if (socketRef.current) {
//         socketRef.current.emit('leave-ride-room', ride.id);
//         socketRef.current.disconnect();
//         socketRef.current = null;
//       }
//     };
//   }, [ride?.id, user?.phone_number]);

//   useFocusEffect(
//     useCallback(() => {
//       fetchBookings();
//       fetchPendingModifications();
//       setRefreshKey(prev => prev + 1);
//       return () => {};
//     }, [fetchBookings, fetchPendingModifications])
//   );

//   const handleBookingAction = async (bookingId, action) => {
//     try {
//       const response = await fetch(`${API_BASE_URL}/booking/${bookingId}/${action}`, {
//         method: 'PUT',
//         headers: { 'Content-Type': 'application/json' },
//       });
//       const data = await response.json();
      
//       if (!response.ok) throw new Error(data.detail || `Failed to ${action} booking`);
      
//       showCustomAlert('Success', `Booking ${action}ed successfully`, 'success');
//       fetchBookings();
      
//       if (socketRef.current) {
//         socketRef.current.emit('booking-status-changed', {
//           ride_id: ride.id,
//           booking_id: bookingId,
//           status: action
//         });
//       }
//     } catch (error) {
//       showCustomAlert('Error', error.message, 'error');
//     }
//   };

//   const [modifyingRequest, setModifyingRequest] = useState(false);

//   const handleModificationAction = async (requestId, action, requestedSeats, currentSeats, bookingId) => {
//     if (areModificationsLocked()) {
//       showCustomAlert('Modifications Locked', 'Cannot process modifications within 15 minutes of departure time.', 'warning');
//       return;
//     }
    
//     try {
//       setModifyingRequest(true);
//       let url = `${API_BASE_URL}/modification-request/${requestId}/${action}`;
//       if (action === 'reject') {
//         url += `?rejection_reason=${encodeURIComponent('Driver declined the modification request')}`;
//       }
      
//       console.log(`📡 ${action} modification request:`, url);
      
//       const response = await fetch(url, { method: 'PUT' });
//       const data = await response.json();
      
//       if (!response.ok) throw new Error(data.detail || `Failed to ${action} modification`);
      
//       showCustomAlert('Success', `Modification request ${action}ed`, 'success');
      
//       if (action === 'approve') {
//         setBookings(prev => prev.map(b => 
//           b.booking_id === bookingId 
//             ? { ...b, seats_booked: requestedSeats }
//             : b
//         ));
        
//         if (socketRef.current) {
//           socketRef.current.emit('modification-handled', {
//             ride_id: ride.id,
//             request_id: requestId,
//             booking_id: bookingId,
//             action: 'approved',
//             new_seats: requestedSeats
//           });
//         }
//       } else {
//         if (socketRef.current) {
//           socketRef.current.emit('modification-handled', {
//             ride_id: ride.id,
//             request_id: requestId,
//             booking_id: bookingId,
//             action: 'rejected'
//           });
//         }
//       }
      
//       fetchPendingModifications();
//       fetchBookings();
//     } catch (error) {
//       console.error('Modification action error:', error);
//       showCustomAlert('Error', error.message, 'error');
//     } finally {
//       setModifyingRequest(false);
//     }
//   };

//   // Parse coordinates
//   const driverStart = useMemo(() => {
//     const routeCoords = parseRouteCoordinates(ride?.routeCoordinates);
//     if (routeCoords.length > 0) {
//       return routeCoords[0];
//     }
//     if (ride?.origin_coords && Array.isArray(ride.origin_coords) && ride.origin_coords.length === 2) {
//       return { 
//         longitude: Number(ride.origin_coords[0]), 
//         latitude: Number(ride.origin_coords[1]) 
//       };
//     }
//     return null;
//   }, [ride]);

//   const driverEnd = useMemo(() => {
//     const routeCoords = parseRouteCoordinates(ride?.routeCoordinates);
//     if (routeCoords.length > 0) {
//       return routeCoords[routeCoords.length - 1];
//     }
//     if (ride?.destination_coords && Array.isArray(ride.destination_coords) && ride.destination_coords.length === 2) {
//       return { 
//         longitude: Number(ride.destination_coords[0]), 
//         latitude: Number(ride.destination_coords[1]) 
//       };
//     }
//     return null;
//   }, [ride]);

//   const routePath = useMemo(() => {
//     const fullRoute = parseRouteCoordinates(ride?.routeCoordinates);
//     if (fullRoute.length >= 2) {
//       return fullRoute;
//     }
//     if (driverStart && driverEnd) {
//       return [driverStart, driverEnd];
//     }
//     return [];
//   }, [ride, driverStart, driverEnd]);

//   const allMarkerCoords = useMemo(() => {
//     const coords = [];
//     if (driverStart && driverStart.latitude && driverStart.longitude) coords.push(driverStart);
//     if (driverEnd && driverEnd.latitude && driverEnd.longitude) coords.push(driverEnd);
//     return coords;
//   }, [driverStart, driverEnd]);

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
//   const vehicleColor = ride?.vehicle?.color || 'Not specified';
  
//   const totalSeatsOffered = ride?.available_seats || ride?.totalSeats || 4;
  
//   let bookedSeatsCount = 0;
  
//   if (ride?.bookings && Array.isArray(ride.bookings)) {
//     bookedSeatsCount = ride.bookings
//       .filter(b => b.status === 'accepted')
//       .reduce((sum, b) => sum + (b.seats_requested || b.seats_booked || 0), 0);
//   }
  
//   const fetchedBookedSeats = bookings
//     .filter(b => b.status === 'accepted')
//     .reduce((sum, b) => sum + (b.seats_booked || 0), 0);
  
//   if (fetchedBookedSeats > bookedSeatsCount) {
//     bookedSeatsCount = fetchedBookedSeats;
//   }
  
//   const availableSeatsCount = Math.max(0, totalSeatsOffered - bookedSeatsCount);

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

//   const handleChatWithPassenger = (passengerPhone, passengerName) => {
//     navigation.navigate('ChatScreen', {
//       receiverPhone: passengerPhone,
//       conversationId: `chat-${ride?.id}-${passengerPhone}`,
//       user: {
//         name: passengerName,
//         tripInfo: `${ride?.origin || 'Pickup'} → ${ride?.destination || 'Drop'}`,
//         phone: passengerPhone
//       }
//     });
//   };

//   const rideStatus = getRideStatusDisplay();
//   const modificationsLocked = areModificationsLocked();
//   const inLateWindow = isInLateWindow();

//   const initialRegion = {
//     latitude: driverStart?.latitude || 28.6139,
//     longitude: driverStart?.longitude || 77.2090,
//     latitudeDelta: 0.05,
//     longitudeDelta: 0.05,
//   };

//   const confirmedBookings = bookings.filter(b => b.status === 'accepted');
//   const pendingBookings = bookings.filter(b => b.status === 'pending');
//   const pendingMods = pendingModifications.filter(m => m.status === 'pending');

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
//             <Polyline 
//               coordinates={routePath} 
//               strokeColor="#2457A6" 
//               strokeWidth={5} 
//               lineCap="round" 
//               lineJoin="round" 
//             />
//           )}

//           {driverStart && driverStart.latitude && driverStart.longitude && (
//             <Marker coordinate={driverStart} anchor={{ x: 0.5, y: 1 }}>
//               <View style={styles.markerWrapper}>
//                 <View style={[styles.pinBubble, { backgroundColor: '#16A34A' }]}>
//                   <Text style={styles.pinIcon}>S</Text>
//                 </View>
//                 <View style={[styles.pinPointer, { borderTopColor: '#16A34A' }]} />
//                 <View style={styles.pinLabelBubble}>
//                   <Text style={styles.pinLabelText}>Start Trip</Text>
//                 </View>
//               </View>
//             </Marker>
//           )}

//           {driverEnd && driverEnd.latitude && driverEnd.longitude && (
//             <Marker coordinate={driverEnd} anchor={{ x: 0.5, y: 1 }}>
//               <View style={styles.markerWrapper}>
//                 <View style={[styles.pinBubble, { backgroundColor: '#DC2626' }]}>
//                   <Text style={styles.pinIcon}>E</Text>
//                 </View>
//                 <View style={[styles.pinPointer, { borderTopColor: '#DC2626' }]} />
//                 <View style={styles.pinLabelBubble}>
//                   <Text style={styles.pinLabelText}>End Trip</Text>
//                 </View>
//               </View>
//             </Marker>
//           )}
//         </MapView>

//         <TouchableOpacity style={styles.mapBackButton} onPress={() => navigation.goBack()}>
//           <Ionicons name="chevron-back" size={26} color={Colors.secondary} />
//         </TouchableOpacity>
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
//           </View>
//         ) : (
//           <ScrollView 
//             ref={scrollViewRef}
//             style={styles.drawerScroll} 
//             contentContainerStyle={styles.drawerContent} 
//             showsVerticalScrollIndicator={false}
//           >
//             {/* Ride Status Banner */}
//             {rideStatus && (
//               <View style={[styles.statusBanner, { backgroundColor: rideStatus.color + '20' }]}>
//                 <Ionicons name={rideStatus.icon} size={20} color={rideStatus.color} />
//                 <Text style={[styles.statusBannerText, { color: rideStatus.color, flex: 1 }]}>
//                   {rideStatus.message}
//                 </Text>
//               </View>
//             )}

//             {modificationsLocked && !ride?.started_at && !ride?.cancellation_reason && (
//               <View style={styles.modificationsLockedBanner}>
//                 <Ionicons name="lock-closed" size={16} color="#DC2626" />
//                 <Text style={styles.modificationsLockedBannerText}>
//                   Modifications Locked - Within 15 minutes of departure
//                 </Text>
//               </View>
//             )}

//             {inLateWindow && !ride?.started_at && !ride?.cancellation_reason && (
//               <View style={styles.lateWindowBanner}>
//                 <Ionicons name="time-outline" size={16} color="#F59E0B" />
//                 <Text style={styles.lateWindowBannerText}>
//                   ⚠️ Ride is late! Start before auto-cancellation in {30 - Math.floor((new Date() - new Date(ride?.departure_time)) / (1000 * 60))} minutes
//                 </Text>
//               </View>
//             )}

//             {/* Trip Details Section */}
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
//                     <Text style={styles.timelinePlace}>{ride?.origin || 'Pickup point'}</Text>
//                     <View style={styles.timelineMetaRow}>
//                       <Ionicons name="time-outline" size={13} color={Colors.gray} />
//                       <Text style={styles.timelineMetaText}>{formatDate(ride?.departure_time)}</Text>
//                     </View>
//                   </View>
//                   <View style={styles.timelineItem}>
//                     <Text style={styles.timelineLabel}>Dropoff</Text>
//                     <Text style={styles.timelinePlace}>{ride?.destination || 'Drop point'}</Text>
//                     <Text style={styles.timelineMetaText}>Estimated: {ride?.duration_text || '--'}</Text>
//                   </View>
//                 </View>
//               </View>
//             </View>

//             {/* Vehicle Details Section */}
//             <View style={styles.cardSection}>
//               <Text style={styles.sectionTitle}>Vehicle Details</Text>
//               <View style={styles.vehicleHeaderRow}>
//                 <View style={styles.vehicleIconCircle}>
//                   <Ionicons name="car-sport-outline" size={24} color="#2457A6" />
//                 </View>
//                 <View style={styles.vehicleMeta}>
//                   <Text style={styles.vehicleTitle}>{vehicleName}</Text>
//                   <Text style={styles.vehicleSub}>
//                     {vehicleColor !== 'Not specified' ? `${vehicleColor}` : ''}
//                   </Text>
//                   {vehicleRegNumber && (
//                     <View style={styles.vehicleRegContainer}>
//                       <Ionicons name="clipboard-outline" size={12} color="#6B7280" />
//                       <Text style={styles.vehicleRegText}>Reg: {vehicleRegNumber}</Text>
//                     </View>
//                   )}
//                 </View>
//               </View>
//             </View>

//             {/* Seat Occupancy Summary */}
//             <View style={styles.cardSection}>
//               <Text style={styles.sectionTitle}>Seat Information</Text>
//               <View style={styles.seatInfoContainer}>
//                 <View style={styles.seatInfoItem}>
//                   <View style={[styles.seatIconCircle, { backgroundColor: '#EAF1FF' }]}>
//                     <Ionicons name="car-sport-outline" size={24} color="#2457A6" />
//                   </View>
//                   <View style={styles.seatInfoText}>
//                     <Text style={styles.seatInfoLabel}>Total Seats Offered</Text>
//                     <Text style={styles.seatInfoValue}>{totalSeatsOffered} seats</Text>
//                   </View>
//                 </View>
                
//                 <View style={styles.seatDivider} />
                
//                 <View style={styles.seatInfoItem}>
//                   <View style={[styles.seatIconCircle, { backgroundColor: '#E8F5E9' }]}>
//                     <Ionicons name="people" size={24} color="#10B981" />
//                   </View>
//                   <View style={styles.seatInfoText}>
//                     <Text style={styles.seatInfoLabel}>Booked Seats</Text>
//                     <Text style={[styles.seatInfoValue, { color: '#10B981' }]}>{bookedSeatsCount} seats</Text>
//                   </View>
//                 </View>
                
//                 <View style={styles.seatDivider} />
                
//                 <View style={styles.seatInfoItem}>
//                   <View style={[styles.seatIconCircle, { backgroundColor: '#FFF3E0' }]}>
//                     <Ionicons name="person-add" size={24} color="#F59E0B" />
//                   </View>
//                   <View style={styles.seatInfoText}>
//                     <Text style={styles.seatInfoLabel}>Available Seats</Text>
//                     <Text style={[styles.seatInfoValue, { color: '#F59E0B' }]}>{availableSeatsCount} seats</Text>
//                   </View>
//                 </View>
//               </View>
              
//               <View style={styles.progressBarContainer}>
//                 <View 
//                   style={[
//                     styles.progressBar, 
//                     { width: `${(bookedSeatsCount / totalSeatsOffered) * 100}%` }
//                   ]} 
//                 />
//               </View>
//               <Text style={styles.progressText}>
//                 {bookedSeatsCount} out of {totalSeatsOffered} seats booked
//               </Text>
//             </View>

//             {/* PENDING MODIFICATION REQUESTS SECTION */}
//             {pendingMods.length > 0 && !modificationsLocked && (
//               <View style={[styles.cardSection, styles.pendingModCard]}>
//                 <View style={styles.pendingModHeader}>
//                   <Text style={[styles.sectionTitle, { color: '#F59E0B' }]}>
//                     ⏳ Pending Modification Requests ({pendingMods.length})
//                   </Text>
//                   <View style={styles.actionNeededBadge}>
//                     <Text style={styles.actionNeededText}>ACTION NEEDED</Text>
//                   </View>
//                 </View>
                
//                 {pendingMods.map((request) => (
//                   <View key={request.id} style={styles.pendingModificationCard}>
//                     <View style={styles.pendingModificationHeader}>
//                       <View style={styles.passengerAvatarSmall}>
//                         {request.passenger_photo ? (
//                           <Image source={{ uri: buildImageUrl(request.passenger_photo) }} style={styles.smallAvatar} />
//                         ) : (
//                           <View style={styles.smallAvatarPlaceholder}>
//                             <Text style={styles.smallAvatarText}>{getInitials(request.passenger_name)}</Text>
//                           </View>
//                         )}
//                       </View>
//                       <View style={styles.pendingModificationInfo}>
//                         <Text style={styles.passengerName}>{request.passenger_name}</Text>
//                         <View style={styles.seatChangeIndicator}>
//                           <Text style={styles.oldSeatText}>{request.current_seats} seats</Text>
//                           <Ionicons name="arrow-forward" size={12} color="#F59E0B" />
//                           <Text style={styles.newSeatText}>{request.requested_seats} seats</Text>
//                         </View>
//                         <Text style={styles.modificationTime}>
//                           Requested: {new Date(request.created_at).toLocaleString()}
//                         </Text>
//                       </View>
//                     </View>
//                     <View style={styles.modificationActions}>
//                       <TouchableOpacity 
//                         style={[styles.modActionBtn, styles.approveModBtn]} 
//                         onPress={() => handleModificationAction(request.id, 'approve', request.requested_seats, request.current_seats, request.booking_id)}
//                         disabled={modifyingRequest}>
//                         <Ionicons name="checkmark" size={16} color="#fff" />
//                         <Text style={styles.modActionBtnText}>Approve</Text>
//                       </TouchableOpacity>
//                       <TouchableOpacity 
//                         style={[styles.modActionBtn, styles.rejectModBtn]} 
//                         onPress={() => handleModificationAction(request.id, 'reject', request.requested_seats, request.current_seats, request.booking_id)}
//                         disabled={modifyingRequest}>
//                         <Ionicons name="close" size={16} color="#fff" />
//                         <Text style={styles.modActionBtnText}>Reject</Text>
//                       </TouchableOpacity>
//                     </View>
//                   </View>
//                 ))}
//               </View>
//             )}

//             {pendingMods.length > 0 && modificationsLocked && (
//               <View style={[styles.cardSection, styles.modificationsLockedCard]}>
//                 <View style={styles.pendingModHeader}>
//                   <Ionicons name="lock-closed" size={20} color="#DC2626" />
//                   <Text style={[styles.sectionTitle, { color: '#DC2626', marginBottom: 0 }]}>
//                     Pending Modifications ({pendingMods.length})
//                   </Text>
//                 </View>
//                 <Text style={styles.lockedModificationsText}>
//                   Modifications are locked as departure time is within 15 minutes. These requests will automatically expire.
//                 </Text>
//               </View>
//             )}

//             {/* CONFIRMED BOOKINGS SECTION */}
//             {confirmedBookings.length > 0 && (
//               <View style={styles.cardSection}>
//                 <Text style={styles.sectionTitle}>Confirmed Bookings ✅ ({confirmedBookings.length})</Text>
//                 {confirmedBookings.map((booking) => {
//                   const profilePicUrl = booking.profile_picture ? buildImageUrl(booking.profile_picture) : null;
//                   const isSvg = profilePicUrl ? isSvgUrl(profilePicUrl) : false;
                  
//                   return (
//                     <View key={booking.booking_id} style={styles.bookingItem}>
//                       <TouchableOpacity 
//                         style={styles.passengerAvatar}
//                         onPress={() => {
//                           if (profilePicUrl) {
//                             setSelectedProfile({ 
//                               visible: true, 
//                               imageUrl: profilePicUrl, 
//                               name: booking.passenger_name || 'Passenger'
//                             });
//                           } else {
//                             showCustomAlert('No Photo', `${booking.passenger_name || 'Passenger'} has not uploaded a profile picture`, 'info');
//                           }
//                         }}>
//                         {profilePicUrl && !isSvg ? (
//                           <Image 
//                             source={{ uri: profilePicUrl }} 
//                             style={styles.avatarImage}
//                           />
//                         ) : profilePicUrl && isSvg ? (
//                           <View style={styles.avatarImageSvg}>
//                             <SvgCssUri uri={profilePicUrl} width={44} height={44} />
//                           </View>
//                         ) : (
//                           <View style={styles.avatarPlaceholder}>
//                             <Text style={styles.avatarPlaceholderText}>{getInitials(booking.passenger_name)}</Text>
//                           </View>
//                         )}
//                       </TouchableOpacity>
//                       <View style={styles.bookingInfo}>
//                         <Text style={styles.passengerName}>{booking.passenger_name || 'Passenger'}</Text>
//                         <Text style={styles.bookingSeats}>
//                           <Ionicons name="people-outline" size={12} color={Colors.gray} /> {booking.seats_booked} seat{booking.seats_booked > 1 ? 's' : ''}
//                         </Text>
//                       </View>
//                       <View style={styles.bookingActions}>
//                         <View style={[styles.bookingStatusBadge, { backgroundColor: getStatusColor(booking.status) + '20' }]}>
//                           <Text style={[styles.bookingStatusText, { color: getStatusColor(booking.status) }]}>
//                             {getStatusText(booking.status)}
//                           </Text>
//                         </View>
//                         <TouchableOpacity 
//                           style={styles.chatButton}
//                           onPress={() => handleChatWithPassenger(booking.passenger_phone, booking.passenger_name)}>
//                           <Ionicons name="chatbubble-ellipses" size={22} color={Colors.primary} />
//                         </TouchableOpacity>
//                       </View>
//                     </View>
//                   );
//                 })}
//               </View>
//             )}

//             {/* PENDING BOOKINGS SECTION */}
//             {pendingBookings.length > 0 && !modificationsLocked && (
//               <View style={styles.cardSection}>
//                 <Text style={[styles.sectionTitle, { color: '#F59E0B' }]}>
//                   Pending Requests ⏳ ({pendingBookings.length})
//                 </Text>
//                 {pendingBookings.map((booking) => {
//                   const profilePicUrl = booking.profile_picture ? buildImageUrl(booking.profile_picture) : null;
//                   const isSvg = profilePicUrl ? isSvgUrl(profilePicUrl) : false;
                  
//                   return (
//                     <View key={booking.booking_id} style={styles.bookingItem}>
//                       <TouchableOpacity 
//                         style={styles.passengerAvatar}
//                         onPress={() => {
//                           if (profilePicUrl) {
//                             setSelectedProfile({ 
//                               visible: true, 
//                               imageUrl: profilePicUrl, 
//                               name: booking.passenger_name || 'Passenger'
//                             });
//                           }
//                         }}>
//                         {profilePicUrl && !isSvg ? (
//                           <Image source={{ uri: profilePicUrl }} style={styles.avatarImage} />
//                         ) : profilePicUrl && isSvg ? (
//                           <View style={styles.avatarImageSvg}>
//                             <SvgCssUri uri={profilePicUrl} width={44} height={44} />
//                           </View>
//                         ) : (
//                           <View style={styles.avatarPlaceholder}>
//                             <Text style={styles.avatarPlaceholderText}>{getInitials(booking.passenger_name)}</Text>
//                           </View>
//                         )}
//                       </TouchableOpacity>
//                       <View style={styles.bookingInfo}>
//                         <Text style={styles.passengerName}>{booking.passenger_name || 'Passenger'}</Text>
//                         <Text style={styles.bookingSeats}>
//                           <Ionicons name="people-outline" size={12} color={Colors.gray} /> {booking.seats_booked} seat{booking.seats_booked > 1 ? 's' : ''}
//                         </Text>
//                       </View>
//                       <View style={styles.pendingActions}>
//                         <TouchableOpacity 
//                           style={[styles.actionSmallBtn, styles.acceptBtn]} 
//                           onPress={() => handleBookingAction(booking.booking_id, 'accept')}>
//                           <Ionicons name="checkmark" size={16} color="#fff" />
//                         </TouchableOpacity>
//                         <TouchableOpacity 
//                           style={[styles.actionSmallBtn, styles.rejectBtn]} 
//                           onPress={() => handleBookingAction(booking.booking_id, 'reject')}>
//                           <Ionicons name="close" size={16} color="#fff" />
//                         </TouchableOpacity>
//                       </View>
//                     </View>
//                   );
//                 })}
//               </View>
//             )}

//             {pendingBookings.length > 0 && modificationsLocked && (
//               <View style={[styles.cardSection, styles.modificationsLockedCard]}>
//                 <View style={styles.pendingModHeader}>
//                   <Ionicons name="lock-closed" size={20} color="#DC2626" />
//                   <Text style={[styles.sectionTitle, { color: '#DC2626', marginBottom: 0 }]}>
//                     Pending Bookings ({pendingBookings.length})
//                   </Text>
//                 </View>
//                 <Text style={styles.lockedModificationsText}>
//                   Cannot process new bookings within 15 minutes of departure.
//                 </Text>
//               </View>
//             )}

//             {/* No Bookings Message */}
//             {bookings.length === 0 && !loadingBookings && (
//               <View style={styles.cardSection}>
//                 <View style={styles.noBookingsContainer}>
//                   <Ionicons name="people-outline" size={48} color={Colors.gray} />
//                   <Text style={styles.noBookingsText}>No booking requests yet</Text>
//                   <Text style={styles.noBookingsSubtext}>When passengers request to join this ride, they'll appear here</Text>
//                 </View>
//               </View>
//             )}

//             {loadingBookings && (
//               <View style={styles.cardSection}>
//                 <View style={styles.loadingContainer}>
//                   <ActivityIndicator size="small" color={Colors.primary} />
//                   <Text style={styles.loadingText}>Loading bookings...</Text>
//                 </View>
//               </View>
//             )}

//             <TouchableOpacity 
//               style={styles.refreshButton}
//               onPress={() => {
//                 console.log('🔄 Manual refresh triggered');
//                 fetchPendingModifications();
//                 fetchBookings();
//                 showCustomAlert('Refreshed', 'Checking for new modification requests...', 'info');
//               }}>
//               <Ionicons name="refresh-outline" size={20} color="#2457A6" />
//               <Text style={styles.refreshButtonText}>Check for Requests</Text>
//             </TouchableOpacity>

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

// const styles = StyleSheet.create({
//   container: { flex: 1, backgroundColor: '#F4F5F7' },
//   mapContainer: { width: '100%', overflow: 'hidden', backgroundColor: '#E8EEF7' },
//   map: { flex: 1, backgroundColor: '#E8EEF7' },
//   mapBackButton: { 
//     position: 'absolute', 
//     top: Platform.OS === 'ios' ? 54 : 22, 
//     left: 14, 
//     width: 42, 
//     height: 42, 
//     borderRadius: 25, 
//     backgroundColor: 'rgba(255,255,255,0.96)', 
//     alignItems: 'center', 
//     justifyContent: 'center',
//     shadowColor: '#000',
//     shadowOffset: { width: 0, height: 2 },
//     shadowOpacity: 0.1,
//     shadowRadius: 4,
//     elevation: 3,
//   },
//   markerWrapper: { alignItems: 'center' },
//   pinBubble: { 
//     width: 32, 
//     height: 32, 
//     borderRadius: 16, 
//     borderWidth: 3, 
//     borderColor: 'white', 
//     alignItems: 'center', 
//     justifyContent: 'center', 
//     shadowColor: '#000', 
//     shadowOffset: { width: 0, height: 3 }, 
//     shadowOpacity: 0.25, 
//     shadowRadius: 4, 
//     elevation: 5 
//   },
//   pinPointer: { 
//     width: 0, 
//     height: 0, 
//     backgroundColor: 'transparent', 
//     borderStyle: 'solid', 
//     borderLeftWidth: 7, 
//     borderRightWidth: 7, 
//     borderTopWidth: 10, 
//     borderLeftColor: 'transparent', 
//     borderRightColor: 'transparent', 
//     marginTop: -2 
//   },
//   pinIcon: { fontSize: 14, fontWeight: '800', color: 'white', textAlign: 'center', lineHeight: 18 },
//   pinLabelBubble: { 
//     backgroundColor: 'rgba(0,0,0,0.75)', 
//     borderRadius: 8, 
//     paddingHorizontal: 8, 
//     paddingVertical: 3, 
//     marginTop: 4 
//   },
//   pinLabelText: { color: 'white', fontSize: 10, fontWeight: '700' },
//   drawer: { 
//     position: 'absolute', 
//     bottom: 0, 
//     left: 0, 
//     right: 0, 
//     backgroundColor: '#F4F5F7', 
//     borderTopLeftRadius: 28, 
//     borderTopRightRadius: 28, 
//     overflow: 'hidden',
//     shadowColor: '#000',
//     shadowOffset: { width: 0, height: -2 },
//     shadowOpacity: 0.1,
//     shadowRadius: 8,
//     elevation: 10,
//   },
//   handleWrap: { alignItems: 'center', paddingTop: 10, paddingBottom: 8, backgroundColor: '#F4F5F7', position: 'relative' },
//   handleHitArea: { paddingHorizontal: 40, paddingVertical: 10, alignItems: 'center', justifyContent: 'center' },
//   handleBar: { width: 64, height: 6, borderRadius: 99, backgroundColor: '#CDD2D8' },
//   pendingNotificationBadge: {
//     position: 'absolute',
//     right: 20,
//     top: 8,
//     backgroundColor: '#F59E0B',
//     borderRadius: 12,
//     paddingHorizontal: 8,
//     paddingVertical: 2,
//   },
//   pendingNotificationText: {
//     color: '#fff',
//     fontSize: 12,
//     fontWeight: 'bold',
//   },
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
//   modificationsLockedBannerText: { fontSize: 12, color: '#DC2626', flex: 1, fontWeight: '600' },
//   lateWindowBanner: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFFBEB', padding: 12, borderRadius: 12, marginBottom: 14, gap: 8, borderWidth: 1, borderColor: '#FDE68A' },
//   lateWindowBannerText: { fontSize: 12, color: '#F59E0B', flex: 1, fontWeight: '600' },
//   cardSection: { 
//     backgroundColor: 'white', 
//     borderRadius: 20, 
//     padding: 16, 
//     marginBottom: 14, 
//     shadowColor: '#000', 
//     shadowOffset: { width: 0, height: 2 }, 
//     shadowOpacity: 0.05, 
//     shadowRadius: 8, 
//     elevation: 2 
//   },
//   pendingModCard: {
//     borderWidth: 2,
//     borderColor: '#F59E0B',
//     backgroundColor: '#FFFBEB',
//   },
//   modificationsLockedCard: {
//     borderWidth: 1,
//     borderColor: '#FEE2E2',
//     backgroundColor: '#FEF2F2',
//   },
//   pendingModHeader: {
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//     alignItems: 'center',
//     marginBottom: 14,
//   },
//   actionNeededBadge: {
//     backgroundColor: '#F59E0B',
//     paddingHorizontal: 8,
//     paddingVertical: 4,
//     borderRadius: 12,
//   },
//   actionNeededText: {
//     color: '#fff',
//     fontSize: 12,
//     fontWeight: 'bold',
//   },
//   sectionTitle: { fontSize: 16, fontWeight: '800', color: Colors.dark, marginBottom: 14 },
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
//   vehicleIconCircle: { 
//     width: 48, 
//     height: 48, 
//     borderRadius: 24, 
//     backgroundColor: '#EAF1FF', 
//     alignItems: 'center', 
//     justifyContent: 'center', 
//     marginRight: 12 
//   },
//   vehicleMeta: { flex: 1 },
//   vehicleTitle: { fontSize: 16, fontWeight: '800', color: Colors.dark },
//   vehicleSub: { marginTop: 3, fontSize: 12, color: Colors.gray, fontWeight: '600' },
//   vehicleRegContainer: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 6, paddingTop: 6, borderTopWidth: 1, borderTopColor: '#F0F0F0' },
//   vehicleRegText: { fontSize: 11, color: '#6B7280', fontWeight: '500' },
//   seatInfoContainer: {
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//     alignItems: 'center',
//     marginBottom: 16,
//   },
//   seatInfoItem: {
//     flex: 1,
//     alignItems: 'center',
//   },
//   seatIconCircle: {
//     width: 48,
//     height: 48,
//     borderRadius: 24,
//     alignItems: 'center',
//     justifyContent: 'center',
//     marginBottom: 8,
//   },
//   seatInfoText: {
//     alignItems: 'center',
//   },
//   seatInfoLabel: {
//     fontSize: 11,
//     color: Colors.gray,
//     textAlign: 'center',
//   },
//   seatInfoValue: {
//     fontSize: 18,
//     fontWeight: '800',
//     color: Colors.dark,
//     marginTop: 2,
//   },
//   seatDivider: {
//     width: 1,
//     height: 50,
//     backgroundColor: '#E5E7EB',
//   },
//   progressBarContainer: {
//     height: 6,
//     backgroundColor: '#E5E7EB',
//     borderRadius: 3,
//     overflow: 'hidden',
//     marginBottom: 8,
//   },
//   progressBar: {
//     height: '100%',
//     backgroundColor: '#10B981',
//     borderRadius: 3,
//   },
//   progressText: {
//     fontSize: 12,
//     color: Colors.gray,
//     textAlign: 'center',
//   },
//   refreshButton: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     justifyContent: 'center',
//     backgroundColor: '#EAF1FF',
//     paddingVertical: 12,
//     borderRadius: 12,
//     marginBottom: 14,
//     gap: 8,
//   },
//   refreshButtonText: {
//     color: '#2457A6',
//     fontSize: 14,
//     fontWeight: '600',
//   },
//   pendingModificationCard: { backgroundColor: '#FFFBEB', borderRadius: 16, padding: 12, marginBottom: 12, borderWidth: 1, borderColor: '#FDE68A' },
//   pendingModificationHeader: { flexDirection: 'row', marginBottom: 12 },
//   pendingModificationInfo: { flex: 1, marginLeft: 12 },
//   passengerName: { fontSize: 14, fontWeight: '600', color: Colors.dark },
//   seatChangeIndicator: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 4 },
//   oldSeatText: { fontSize: 12, color: '#DC2626', textDecorationLine: 'line-through' },
//   newSeatText: { fontSize: 12, color: '#10B981', fontWeight: 'bold' },
//   modificationTime: { fontSize: 10, color: '#B45309', marginTop: 2, opacity: 0.7 },
//   modificationActions: { flexDirection: 'row', gap: 10 },
//   modActionBtn: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 10, borderRadius: 8, gap: 6 },
//   approveModBtn: { backgroundColor: '#10B981' },
//   rejectModBtn: { backgroundColor: '#EF4444' },
//   modActionBtnText: { color: '#fff', fontSize: 13, fontWeight: '600' },
//   lockedModificationsText: { fontSize: 12, color: '#DC2626', textAlign: 'center', marginTop: 8 },
//   bookingItem: { flexDirection: 'row', alignItems: 'center', paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: '#EEF2F7' },
//   passengerAvatar: { width: 44, height: 44, borderRadius: 22, overflow: 'hidden', marginRight: 12 },
//   passengerAvatarSmall: { width: 36, height: 36, borderRadius: 18, overflow: 'hidden' },
//   avatarImage: { width: 44, height: 44, borderRadius: 22, resizeMode: 'cover' },
//   avatarImageSvg: { width: 44, height: 44, borderRadius: 22, overflow: 'hidden', alignItems: 'center', justifyContent: 'center', backgroundColor: '#E5E7EB' },
//   avatarPlaceholder: { width: 44, height: 44, borderRadius: 22, backgroundColor: '#E5E7EB', alignItems: 'center', justifyContent: 'center' },
//   avatarPlaceholderText: { fontSize: 16, fontWeight: '700', color: Colors.primary },
//   smallAvatar: { width: 36, height: 36, borderRadius: 18 },
//   smallAvatarPlaceholder: { width: 36, height: 36, borderRadius: 18, backgroundColor: '#E5E7EB', alignItems: 'center', justifyContent: 'center' },
//   smallAvatarText: { fontSize: 14, fontWeight: '700', color: Colors.primary },
//   bookingInfo: { flex: 1 },
//   bookingSeats: { fontSize: 12, color: Colors.gray, marginTop: 2, flexDirection: 'row', alignItems: 'center' },
//   bookingStatusBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12 },
//   bookingStatusText: { fontSize: 11, fontWeight: '600' },
//   bookingActions: { flexDirection: 'row', alignItems: 'center', gap: 12 },
//   chatButton: { 
//     padding: 8, 
//     backgroundColor: '#EFF6FF', 
//     borderRadius: 20,
//     alignItems: 'center',
//     justifyContent: 'center',
//   },
//   pendingActions: { flexDirection: 'row', gap: 8 },
//   actionSmallBtn: { width: 36, height: 36, borderRadius: 18, alignItems: 'center', justifyContent: 'center' },
//   acceptBtn: { backgroundColor: '#10B981' },
//   rejectBtn: { backgroundColor: '#EF4444' },
//   noBookingsContainer: { alignItems: 'center', padding: 30, gap: 10 },
//   noBookingsText: { fontSize: 14, fontWeight: '600', color: Colors.gray },
//   noBookingsSubtext: { fontSize: 12, color: Colors.gray, textAlign: 'center' },
//   loadingContainer: { alignItems: 'center', padding: 20, gap: 10 },
//   loadingText: { fontSize: 12, color: Colors.gray },
//   simpleInfoLeft: { flexDirection: 'row', alignItems: 'center', gap: 12 },
//   safetyCard: { backgroundColor: '#FFF3E7', borderRadius: 18, padding: 16, marginBottom: 14 },
//   safetyTitle: { fontSize: 14, color: '#2457A6', fontWeight: '800' },
//   safetySub: { marginTop: 2, fontSize: 12, color: '#2457A6', opacity: 0.9, fontWeight: '600' },
//   loaderContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#fff' },
//   modalBackdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center' },
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

  const [drawerExpanded, setDrawerExpanded] = useState(true);
  const [mapReady, setMapReady] = useState(false);
  const [bookings, setBookings] = useState([]);
  const [loadingBookings, setLoadingBookings] = useState(false);
  const [pendingModifications, setPendingModifications] = useState([]);
  const [refreshKey, setRefreshKey] = useState(0);
  const [pollingInterval, setPollingInterval] = useState(null);
  
  const animatedDrawer = useRef(new Animated.Value(1)).current;
  const mapRef = useRef(null);
  const socketRef = useRef(null);
  const scrollViewRef = useRef(null);
  
  const [selectedProfile, setSelectedProfile] = useState({
    visible: false,
    imageUrl: null,
    name: '',
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

  const getRideStatusDisplay = () => {
    if (ride?.cancellation_reason) {
      if (ride.cancellation_reason.includes("Auto-cancelled") || 
          ride.cancellation_reason.includes("was not started")) {
        return {
          message: "Ride Auto-cancelled - Driver did not start the ride within 30 minutes",
          type: 'auto-cancelled',
          icon: 'alert-circle',
          color: '#DC2626'
        };
      }
      return {
        message: `Ride Cancelled: ${ride.cancellation_reason}`,
        type: 'cancelled',
        icon: 'close-circle',
        color: '#DC2626'
      };
    }
    
    if (ride?.started_at) {
      return {
        message: "Ride in Progress - Passengers are tracking live",
        type: 'ongoing',
        icon: 'car-sport',
        color: '#10B981'
      };
    }
    
    if (ride?.status === "completed") {
      return {
        message: "Ride Completed",
        type: 'completed',
        icon: 'checkmark-done-circle',
        color: '#6B7280'
      };
    }
    
    const now = new Date();
    const departureTime = new Date(ride?.departure_time);
    const minutesToDeparture = Math.floor((departureTime - now) / (1000 * 60));
    const minutesSinceDeparture = Math.floor((now - departureTime) / (1000 * 60));
    
    if (minutesSinceDeparture > 30) {
      return {
        message: "Ride Auto-cancelled - Start window expired (30 minutes past departure)",
        type: 'auto-cancelled',
        icon: 'alert-circle',
        color: '#DC2626'
      };
    }
    
    if (minutesToDeparture <= 0 && minutesSinceDeparture <= 30) {
      return {
        message: `⚠️ Ride is ${minutesSinceDeparture} minutes late. Start before auto-cancellation in ${30 - minutesSinceDeparture} minutes`,
        type: 'late',
        icon: 'time-outline',
        color: '#F59E0B'
      };
    }
    
    if (minutesToDeparture <= 15) {
      if (minutesToDeparture <= 0) {
        return {
          message: `Ready to start! (${Math.abs(minutesToDeparture)} minutes late)`,
          type: 'ready',
          icon: 'time-outline',
          color: '#F59E0B'
        };
      }
      return {
        message: `Ready to start in ${minutesToDeparture} minutes`,
        type: 'ready',
        icon: 'time-outline',
        color: '#F59E0B'
      };
    }
    
    if (minutesToDeparture > 15) {
      return {
        message: `Departure in ${minutesToDeparture} minutes`,
        type: 'upcoming',
        icon: 'calendar-outline',
        color: '#2457A6'
      };
    }
    
    return null;
  };

  const fetchBookings = useCallback(async () => {
    if (!ride?.id) return;
    setLoadingBookings(true);
    try {
      const response = await fetch(`${API_BASE_URL}/ride/${ride.id}/passengers?_t=${Date.now()}`);
      const data = await response.json();
      
      if (data.passengers && Array.isArray(data.passengers)) {
        setBookings(data.passengers);
      } else {
        setBookings([]);
      }
    } catch (error) {
      console.log('Error fetching bookings:', error);
      setBookings([]);
    } finally {
      setLoadingBookings(false);
    }
  }, [ride?.id]);

  const fetchPendingModifications = useCallback(async () => {
    if (!ride?.id) return;
    try {
      console.log('🔍 Fetching pending modifications for ride:', ride.id);
      const response = await fetch(`${API_BASE_URL}/ride/${ride.id}/pending-modifications?_t=${Date.now()}`);
      const data = await response.json();
      
      console.log('📦 Pending modifications response:', JSON.stringify(data, null, 2));
      
      if (data.pending_requests && Array.isArray(data.pending_requests)) {
        const requestsWithStatus = data.pending_requests.map(request => ({
          ...request,
          status: request.status || 'pending'
        }));
        
        setPendingModifications(requestsWithStatus);
        console.log(`✅ Found ${requestsWithStatus.length} pending modifications`);
        
        if (requestsWithStatus.length > 0 && !drawerExpanded) {
          setDrawerExpanded(true);
        }
      } else {
        setPendingModifications([]);
        console.log('❌ No pending modifications found');
      }
    } catch (error) {
      console.log('Error fetching pending modifications:', error);
      setPendingModifications([]);
    }
  }, [ride?.id, drawerExpanded]);

  // Check modifications lock status (within 15 minutes of departure)
  const areModificationsLocked = () => {
    const now = new Date();
    const departureTime = new Date(ride?.departure_time);
    const minutesToDeparture = (departureTime - now) / (1000 * 60);
    return minutesToDeparture <= 15 && minutesToDeparture > -30 && !ride?.started_at;
  };

  // Check if ride is in late window (0-30 minutes past departure)
  const isInLateWindow = () => {
    const now = new Date();
    const departureTime = new Date(ride?.departure_time);
    const minutesSinceDeparture = (now - departureTime) / (1000 * 60);
    return minutesSinceDeparture > 0 && minutesSinceDeparture <= 30 && !ride?.started_at;
  };

  // Setup polling for modifications
  useEffect(() => {
    if (!ride?.id) return;
    
    fetchPendingModifications();
    
    const interval = setInterval(() => {
      console.log('🔄 Polling for pending modifications...');
      fetchPendingModifications();
    }, 10000);
    
    setPollingInterval(interval);
    
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [ride?.id, fetchPendingModifications]);

  // Setup socket connection
  useEffect(() => {
    if (!ride?.id) return;
    
    console.log('🔌 Setting up socket connection for ride:', ride.id);
    
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
      console.log('✅ Socket connected successfully for driver ride updates');
      socket.emit('join-ride-room', ride.id);
      console.log(`📡 Joined ride room: ride_${ride.id}`);
      
      if (user?.phone_number) {
        socket.emit('join-user-room', user.phone_number);
        console.log(`📡 Joined user room: user_${user.phone_number}`);
      }
    });
    
    socket.on('connect_error', (error) => {
      console.log('❌ Socket connection error:', error.message);
    });
    
    socket.on('disconnect', (reason) => {
      console.log('🔌 Socket disconnected:', reason);
      if (reason === 'io server disconnect') {
        socket.connect();
      }
    });
    
    socket.on('new-modification-request', (data) => {
      console.log('🔔 New modification request received:', data);
      if (data.ride_id === ride.id) {
        showCustomAlert('New Modification Request', `${data.passenger_name} wants to change from ${data.current_seats} to ${data.requested_seats} seat(s)`, 'info');
        fetchPendingModifications();
        fetchBookings();
      }
    });
    
    socket.on('modification-response', (data) => {
      console.log('🔔 Modification response received:', data);
      if (data.ride_id === ride.id) {
        if (data.action === 'approved') {
          showCustomAlert('Modification Approved', `You approved seat change for ${data.passenger_name || 'passenger'}`, 'success');
        } else {
          showCustomAlert('Modification Rejected', `You rejected seat change request`, 'warning');
        }
        fetchPendingModifications();
        fetchBookings();
      }
    });
    
    socket.on('booking-update', (data) => {
      console.log('🔔 Booking update received:', data);
      if (data.ride_id === ride.id) {
        fetchBookings();
      }
    });
    
    return () => {
      if (socketRef.current) {
        socketRef.current.emit('leave-ride-room', ride.id);
        socketRef.current.disconnect();
        socketRef.current = null;
      }
    };
  }, [ride?.id, user?.phone_number]);

  useFocusEffect(
    useCallback(() => {
      fetchBookings();
      fetchPendingModifications();
      setRefreshKey(prev => prev + 1);
      return () => {};
    }, [fetchBookings, fetchPendingModifications])
  );

  const handleBookingAction = async (bookingId, action) => {
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
  };

  const [modifyingRequest, setModifyingRequest] = useState(false);

  const handleModificationAction = async (requestId, action, requestedSeats, currentSeats, bookingId) => {
    if (areModificationsLocked()) {
      showCustomAlert('Modifications Locked', 'Cannot process modifications within 15 minutes of departure time.', 'warning');
      return;
    }
    
    try {
      setModifyingRequest(true);
      let url = `${API_BASE_URL}/modification-request/${requestId}/${action}`;
      if (action === 'reject') {
        url += `?rejection_reason=${encodeURIComponent('Driver declined the modification request')}`;
      }
      
      console.log(`📡 ${action} modification request:`, url);
      
      const response = await fetch(url, { method: 'PUT' });
      const data = await response.json();
      
      if (!response.ok) throw new Error(data.detail || `Failed to ${action} modification`);
      
      showCustomAlert('Success', `Modification request ${action}ed`, 'success');
      
      if (action === 'approve') {
        setBookings(prev => prev.map(b => 
          b.booking_id === bookingId 
            ? { ...b, seats_booked: requestedSeats }
            : b
        ));
        
        if (socketRef.current) {
          socketRef.current.emit('modification-handled', {
            ride_id: ride.id,
            request_id: requestId,
            booking_id: bookingId,
            action: 'approved',
            new_seats: requestedSeats
          });
        }
      } else {
        if (socketRef.current) {
          socketRef.current.emit('modification-handled', {
            ride_id: ride.id,
            request_id: requestId,
            booking_id: bookingId,
            action: 'rejected'
          });
        }
      }
      
      fetchPendingModifications();
      fetchBookings();
    } catch (error) {
      console.error('Modification action error:', error);
      showCustomAlert('Error', error.message, 'error');
    } finally {
      setModifyingRequest(false);
    }
  };

  // Parse coordinates
  const driverStart = useMemo(() => {
    const routeCoords = parseRouteCoordinates(ride?.routeCoordinates);
    if (routeCoords.length > 0) {
      return routeCoords[0];
    }
    if (ride?.origin_coords && Array.isArray(ride.origin_coords) && ride.origin_coords.length === 2) {
      return { 
        longitude: Number(ride.origin_coords[0]), 
        latitude: Number(ride.origin_coords[1]) 
      };
    }
    return null;
  }, [ride]);

  const driverEnd = useMemo(() => {
    const routeCoords = parseRouteCoordinates(ride?.routeCoordinates);
    if (routeCoords.length > 0) {
      return routeCoords[routeCoords.length - 1];
    }
    if (ride?.destination_coords && Array.isArray(ride.destination_coords) && ride.destination_coords.length === 2) {
      return { 
        longitude: Number(ride.destination_coords[0]), 
        latitude: Number(ride.destination_coords[1]) 
      };
    }
    return null;
  }, [ride]);

  const routePath = useMemo(() => {
    const fullRoute = parseRouteCoordinates(ride?.routeCoordinates);
    if (fullRoute.length >= 2) {
      return fullRoute;
    }
    if (driverStart && driverEnd) {
      return [driverStart, driverEnd];
    }
    return [];
  }, [ride, driverStart, driverEnd]);

  const allMarkerCoords = useMemo(() => {
    const coords = [];
    if (driverStart && driverStart.latitude && driverStart.longitude) coords.push(driverStart);
    if (driverEnd && driverEnd.latitude && driverEnd.longitude) coords.push(driverEnd);
    return coords;
  }, [driverStart, driverEnd]);

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
  const vehicleColor = ride?.vehicle?.color || 'Not specified';
  
  const totalSeatsOffered = ride?.available_seats || ride?.totalSeats || 4;
  
  let bookedSeatsCount = 0;
  
  if (ride?.bookings && Array.isArray(ride.bookings)) {
    bookedSeatsCount = ride.bookings
      .filter(b => b.status === 'accepted')
      .reduce((sum, b) => sum + (b.seats_requested || b.seats_booked || 0), 0);
  }
  
  const fetchedBookedSeats = bookings
    .filter(b => b.status === 'accepted')
    .reduce((sum, b) => sum + (b.seats_booked || 0), 0);
  
  if (fetchedBookedSeats > bookedSeatsCount) {
    bookedSeatsCount = fetchedBookedSeats;
  }
  
  const availableSeatsCount = Math.max(0, totalSeatsOffered - bookedSeatsCount);

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

  const rideStatus = getRideStatusDisplay();
  const modificationsLocked = areModificationsLocked();
  const inLateWindow = isInLateWindow();

  const initialRegion = {
    latitude: driverStart?.latitude || 28.6139,
    longitude: driverStart?.longitude || 77.2090,
    latitudeDelta: 0.05,
    longitudeDelta: 0.05,
  };

  const confirmedBookings = bookings.filter(b => b.status === 'accepted');
  const pendingBookings = bookings.filter(b => b.status === 'pending');
  const pendingMods = pendingModifications.filter(m => m.status === 'pending');

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
            <Polyline 
              coordinates={routePath} 
              strokeColor="#2457A6" 
              strokeWidth={5} 
              lineCap="round" 
              lineJoin="round" 
            />
          )}

          {driverStart && driverStart.latitude && driverStart.longitude && (
            <Marker coordinate={driverStart} anchor={{ x: 0.5, y: 1 }}>
              <View style={styles.markerWrapper}>
                <View style={[styles.pinBubble, { backgroundColor: '#16A34A' }]}>
                  <Text style={styles.pinIcon}>S</Text>
                </View>
                <View style={[styles.pinPointer, { borderTopColor: '#16A34A' }]} />
                <View style={styles.pinLabelBubble}>
                  <Text style={styles.pinLabelText}>Start Trip</Text>
                </View>
              </View>
            </Marker>
          )}

          {driverEnd && driverEnd.latitude && driverEnd.longitude && (
            <Marker coordinate={driverEnd} anchor={{ x: 0.5, y: 1 }}>
              <View style={styles.markerWrapper}>
                <View style={[styles.pinBubble, { backgroundColor: '#DC2626' }]}>
                  <Text style={styles.pinIcon}>E</Text>
                </View>
                <View style={[styles.pinPointer, { borderTopColor: '#DC2626' }]} />
                <View style={styles.pinLabelBubble}>
                  <Text style={styles.pinLabelText}>End Trip</Text>
                </View>
              </View>
            </Marker>
          )}
        </MapView>

        <TouchableOpacity style={styles.mapBackButton} onPress={() => navigation.goBack()}>
          <Ionicons name="chevron-back" size={26} color={Colors.secondary} />
        </TouchableOpacity>
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
          </View>
        ) : (
          <ScrollView 
            ref={scrollViewRef}
            style={styles.drawerScroll} 
            contentContainerStyle={styles.drawerContent} 
            showsVerticalScrollIndicator={false}
          >
            {/* Ride Status Banner */}
            {rideStatus && (
              <View style={[styles.statusBanner, { backgroundColor: rideStatus.color + '20' }]}>
                <Ionicons name={rideStatus.icon} size={20} color={rideStatus.color} />
                <Text style={[styles.statusBannerText, { color: rideStatus.color, flex: 1 }]}>
                  {rideStatus.message}
                </Text>
              </View>
            )}

            {modificationsLocked && !ride?.started_at && !ride?.cancellation_reason && (
              <View style={styles.modificationsLockedBanner}>
                <Ionicons name="lock-closed" size={16} color="#DC2626" />
                <Text style={styles.modificationsLockedBannerText}>
                  Modifications Locked - Within 15 minutes of departure
                </Text>
              </View>
            )}

            {inLateWindow && !ride?.started_at && !ride?.cancellation_reason && (
              <View style={styles.lateWindowBanner}>
                <Ionicons name="time-outline" size={16} color="#F59E0B" />
                <Text style={styles.lateWindowBannerText}>
                  ⚠️ Ride is late! Start before auto-cancellation in {30 - Math.floor((new Date() - new Date(ride?.departure_time)) / (1000 * 60))} minutes
                </Text>
              </View>
            )}

            {/* Trip Details Section */}
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
                    <Text style={styles.timelinePlace}>{ride?.origin || 'Pickup point'}</Text>
                    <View style={styles.timelineMetaRow}>
                      <Ionicons name="time-outline" size={13} color={Colors.gray} />
                      <Text style={styles.timelineMetaText}>{formatDate(ride?.departure_time)}</Text>
                    </View>
                  </View>
                  <View style={styles.timelineItem}>
                    <Text style={styles.timelineLabel}>Dropoff</Text>
                    <Text style={styles.timelinePlace}>{ride?.destination || 'Drop point'}</Text>
                    <Text style={styles.timelineMetaText}>Estimated: {ride?.duration_text || '--'}</Text>
                  </View>
                </View>
              </View>
            </View>

            {/* Vehicle Details Section */}
            <View style={styles.cardSection}>
              <Text style={styles.sectionTitle}>Vehicle Details</Text>
              <View style={styles.vehicleHeaderRow}>
                <View style={styles.vehicleIconCircle}>
                  <Ionicons name="car-sport-outline" size={24} color="#2457A6" />
                </View>
                <View style={styles.vehicleMeta}>
                  <Text style={styles.vehicleTitle}>{vehicleName}</Text>
                  <Text style={styles.vehicleSub}>
                    {vehicleColor !== 'Not specified' ? `${vehicleColor}` : ''}
                  </Text>
                  {vehicleRegNumber && (
                    <View style={styles.vehicleRegContainer}>
                      <Ionicons name="clipboard-outline" size={12} color="#6B7280" />
                      <Text style={styles.vehicleRegText}>Reg: {vehicleRegNumber}</Text>
                    </View>
                  )}
                </View>
              </View>
            </View>

            {/* Seat Occupancy Summary */}
            <View style={styles.cardSection}>
              <Text style={styles.sectionTitle}>Seat Information</Text>
              <View style={styles.seatInfoContainer}>
                <View style={styles.seatInfoItem}>
                  <View style={[styles.seatIconCircle, { backgroundColor: '#EAF1FF' }]}>
                    <Ionicons name="car-sport-outline" size={24} color="#2457A6" />
                  </View>
                  <View style={styles.seatInfoText}>
                    <Text style={styles.seatInfoLabel}>Total Seats Offered</Text>
                    <Text style={styles.seatInfoValue}>{totalSeatsOffered} seats</Text>
                  </View>
                </View>
                
                <View style={styles.seatDivider} />
                
                <View style={styles.seatInfoItem}>
                  <View style={[styles.seatIconCircle, { backgroundColor: '#E8F5E9' }]}>
                    <Ionicons name="people" size={24} color="#10B981" />
                  </View>
                  <View style={styles.seatInfoText}>
                    <Text style={styles.seatInfoLabel}>Booked Seats</Text>
                    <Text style={[styles.seatInfoValue, { color: '#10B981' }]}>{bookedSeatsCount} seats</Text>
                  </View>
                </View>
                
                <View style={styles.seatDivider} />
                
                <View style={styles.seatInfoItem}>
                  <View style={[styles.seatIconCircle, { backgroundColor: '#FFF3E0' }]}>
                    <Ionicons name="person-add" size={24} color="#F59E0B" />
                  </View>
                  <View style={styles.seatInfoText}>
                    <Text style={styles.seatInfoLabel}>Available Seats</Text>
                    <Text style={[styles.seatInfoValue, { color: '#F59E0B' }]}>{availableSeatsCount} seats</Text>
                  </View>
                </View>
              </View>
              
              <View style={styles.progressBarContainer}>
                <View 
                  style={[
                    styles.progressBar, 
                    { width: `${(bookedSeatsCount / totalSeatsOffered) * 100}%` }
                  ]} 
                />
              </View>
              <Text style={styles.progressText}>
                {bookedSeatsCount} out of {totalSeatsOffered} seats booked
              </Text>
            </View>

            {/* PENDING MODIFICATION REQUESTS SECTION */}
            {pendingMods.length > 0 && !modificationsLocked && (
              <View style={[styles.cardSection, styles.pendingModCard]}>
                <View style={styles.pendingModHeader}>
                  <Text style={[styles.sectionTitle, { color: '#F59E0B' }]}>
                    ⏳ Pending Modification Requests ({pendingMods.length})
                  </Text>
                  <View style={styles.actionNeededBadge}>
                    <Text style={styles.actionNeededText}>ACTION NEEDED</Text>
                  </View>
                </View>
                
                {pendingMods.map((request) => (
                  <View key={request.id} style={styles.pendingModificationCard}>
                    <View style={styles.pendingModificationHeader}>
                      <View style={styles.passengerAvatarSmall}>
                        {request.passenger_photo ? (
                          <Image source={{ uri: buildImageUrl(request.passenger_photo) }} style={styles.smallAvatar} />
                        ) : (
                          <View style={styles.smallAvatarPlaceholder}>
                            <Text style={styles.smallAvatarText}>{getInitials(request.passenger_name)}</Text>
                          </View>
                        )}
                      </View>
                      <View style={styles.pendingModificationInfo}>
                        <Text style={styles.passengerName}>{request.passenger_name}</Text>
                        <View style={styles.seatChangeIndicator}>
                          <Text style={styles.oldSeatText}>{request.current_seats} seats</Text>
                          <Ionicons name="arrow-forward" size={12} color="#F59E0B" />
                          <Text style={styles.newSeatText}>{request.requested_seats} seats</Text>
                        </View>
                        <Text style={styles.modificationTime}>
                          Requested: {new Date(request.created_at).toLocaleString()}
                        </Text>
                      </View>
                    </View>
                    <View style={styles.modificationActions}>
                      <TouchableOpacity 
                        style={[styles.modActionBtn, styles.approveModBtn]} 
                        onPress={() => handleModificationAction(request.id, 'approve', request.requested_seats, request.current_seats, request.booking_id)}
                        disabled={modifyingRequest}>
                        <Ionicons name="checkmark" size={16} color="#fff" />
                        <Text style={styles.modActionBtnText}>Approve</Text>
                      </TouchableOpacity>
                      <TouchableOpacity 
                        style={[styles.modActionBtn, styles.rejectModBtn]} 
                        onPress={() => handleModificationAction(request.id, 'reject', request.requested_seats, request.current_seats, request.booking_id)}
                        disabled={modifyingRequest}>
                        <Ionicons name="close" size={16} color="#fff" />
                        <Text style={styles.modActionBtnText}>Reject</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                ))}
              </View>
            )}

            {pendingMods.length > 0 && modificationsLocked && (
              <View style={[styles.cardSection, styles.modificationsLockedCard]}>
                <View style={styles.pendingModHeader}>
                  <Ionicons name="lock-closed" size={20} color="#DC2626" />
                  <Text style={[styles.sectionTitle, { color: '#DC2626', marginBottom: 0 }]}>
                    Pending Modifications ({pendingMods.length})
                  </Text>
                </View>
                <Text style={styles.lockedModificationsText}>
                  Modifications are locked as departure time is within 15 minutes. These requests will automatically expire.
                </Text>
              </View>
            )}

            {/* CONFIRMED BOOKINGS SECTION */}
            {confirmedBookings.length > 0 && (
              <View style={styles.cardSection}>
                <Text style={styles.sectionTitle}>Confirmed Bookings ✅ ({confirmedBookings.length})</Text>
                {confirmedBookings.map((booking) => {
                  const profilePicUrl = booking.profile_picture ? buildImageUrl(booking.profile_picture) : null;
                  const isSvg = profilePicUrl ? isSvgUrl(profilePicUrl) : false;
                  
                  return (
                    <View key={booking.booking_id} style={styles.bookingItem}>
                      <TouchableOpacity 
                        style={styles.passengerAvatar}
                        onPress={() => {
                          if (profilePicUrl) {
                            setSelectedProfile({ 
                              visible: true, 
                              imageUrl: profilePicUrl, 
                              name: booking.passenger_name || 'Passenger'
                            });
                          } else {
                            showCustomAlert('No Photo', `${booking.passenger_name || 'Passenger'} has not uploaded a profile picture`, 'info');
                          }
                        }}>
                        {profilePicUrl && !isSvg ? (
                          <Image 
                            source={{ uri: profilePicUrl }} 
                            style={styles.avatarImage}
                          />
                        ) : profilePicUrl && isSvg ? (
                          <View style={styles.avatarImageSvg}>
                            <SvgCssUri uri={profilePicUrl} width={44} height={44} />
                          </View>
                        ) : (
                          <View style={styles.avatarPlaceholder}>
                            <Text style={styles.avatarPlaceholderText}>{getInitials(booking.passenger_name)}</Text>
                          </View>
                        )}
                      </TouchableOpacity>
                      <View style={styles.bookingInfo}>
                        <Text style={styles.passengerName}>{booking.passenger_name || 'Passenger'}</Text>
                        <Text style={styles.bookingSeats}>
                          <Ionicons name="people-outline" size={12} color={Colors.gray} /> {booking.seats_booked} seat{booking.seats_booked > 1 ? 's' : ''}
                        </Text>
                      </View>
                      <View style={styles.bookingActions}>
                        <View style={[styles.bookingStatusBadge, { backgroundColor: getStatusColor(booking.status) + '20' }]}>
                          <Text style={[styles.bookingStatusText, { color: getStatusColor(booking.status) }]}>
                            {getStatusText(booking.status)}
                          </Text>
                        </View>
                        <TouchableOpacity 
                          style={styles.chatButton}
                          onPress={() => handleChatWithPassenger(booking.passenger_phone, booking.passenger_name, booking.profile_picture)}>
                          <Ionicons name="chatbubble-ellipses" size={22} color={Colors.primary} />
                        </TouchableOpacity>
                      </View>
                    </View>
                  );
                })}
              </View>
            )}

            {/* PENDING BOOKINGS SECTION */}
            {pendingBookings.length > 0 && !modificationsLocked && (
              <View style={styles.cardSection}>
                <Text style={[styles.sectionTitle, { color: '#F59E0B' }]}>
                  Pending Requests ⏳ ({pendingBookings.length})
                </Text>
                {pendingBookings.map((booking) => {
                  const profilePicUrl = booking.profile_picture ? buildImageUrl(booking.profile_picture) : null;
                  const isSvg = profilePicUrl ? isSvgUrl(profilePicUrl) : false;
                  
                  return (
                    <View key={booking.booking_id} style={styles.bookingItem}>
                      <TouchableOpacity 
                        style={styles.passengerAvatar}
                        onPress={() => {
                          if (profilePicUrl) {
                            setSelectedProfile({ 
                              visible: true, 
                              imageUrl: profilePicUrl, 
                              name: booking.passenger_name || 'Passenger'
                            });
                          }
                        }}>
                        {profilePicUrl && !isSvg ? (
                          <Image source={{ uri: profilePicUrl }} style={styles.avatarImage} />
                        ) : profilePicUrl && isSvg ? (
                          <View style={styles.avatarImageSvg}>
                            <SvgCssUri uri={profilePicUrl} width={44} height={44} />
                          </View>
                        ) : (
                          <View style={styles.avatarPlaceholder}>
                            <Text style={styles.avatarPlaceholderText}>{getInitials(booking.passenger_name)}</Text>
                          </View>
                        )}
                      </TouchableOpacity>
                      <View style={styles.bookingInfo}>
                        <Text style={styles.passengerName}>{booking.passenger_name || 'Passenger'}</Text>
                        <Text style={styles.bookingSeats}>
                          <Ionicons name="people-outline" size={12} color={Colors.gray} /> {booking.seats_booked} seat{booking.seats_booked > 1 ? 's' : ''}
                        </Text>
                      </View>
                      <View style={styles.pendingActions}>
                        <TouchableOpacity 
                          style={[styles.actionSmallBtn, styles.acceptBtn]} 
                          onPress={() => handleBookingAction(booking.booking_id, 'accept')}>
                          <Ionicons name="checkmark" size={16} color="#fff" />
                        </TouchableOpacity>
                        <TouchableOpacity 
                          style={[styles.actionSmallBtn, styles.rejectBtn]} 
                          onPress={() => handleBookingAction(booking.booking_id, 'reject')}>
                          <Ionicons name="close" size={16} color="#fff" />
                        </TouchableOpacity>
                      </View>
                    </View>
                  );
                })}
              </View>
            )}

            {pendingBookings.length > 0 && modificationsLocked && (
              <View style={[styles.cardSection, styles.modificationsLockedCard]}>
                <View style={styles.pendingModHeader}>
                  <Ionicons name="lock-closed" size={20} color="#DC2626" />
                  <Text style={[styles.sectionTitle, { color: '#DC2626', marginBottom: 0 }]}>
                    Pending Bookings ({pendingBookings.length})
                  </Text>
                </View>
                <Text style={styles.lockedModificationsText}>
                  Cannot process new bookings within 15 minutes of departure.
                </Text>
              </View>
            )}

            {/* No Bookings Message */}
            {bookings.length === 0 && !loadingBookings && (
              <View style={styles.cardSection}>
                <View style={styles.noBookingsContainer}>
                  <Ionicons name="people-outline" size={48} color={Colors.gray} />
                  <Text style={styles.noBookingsText}>No booking requests yet</Text>
                  <Text style={styles.noBookingsSubtext}>When passengers request to join this ride, they'll appear here</Text>
                </View>
              </View>
            )}

            {loadingBookings && (
              <View style={styles.cardSection}>
                <View style={styles.loadingContainer}>
                  <ActivityIndicator size="small" color={Colors.primary} />
                  <Text style={styles.loadingText}>Loading bookings...</Text>
                </View>
              </View>
            )}

            <TouchableOpacity 
              style={styles.refreshButton}
              onPress={() => {
                console.log('🔄 Manual refresh triggered');
                fetchPendingModifications();
                fetchBookings();
                showCustomAlert('Refreshed', 'Checking for new modification requests...', 'info');
              }}>
              <Ionicons name="refresh-outline" size={20} color="#2457A6" />
              <Text style={styles.refreshButtonText}>Check for Requests</Text>
            </TouchableOpacity>

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

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F4F5F7' },
  mapContainer: { width: '100%', overflow: 'hidden', backgroundColor: '#E8EEF7' },
  map: { flex: 1, backgroundColor: '#E8EEF7' },
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
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  markerWrapper: { alignItems: 'center' },
  pinBubble: { 
    width: 32, 
    height: 32, 
    borderRadius: 16, 
    borderWidth: 3, 
    borderColor: 'white', 
    alignItems: 'center', 
    justifyContent: 'center', 
    shadowColor: '#000', 
    shadowOffset: { width: 0, height: 3 }, 
    shadowOpacity: 0.25, 
    shadowRadius: 4, 
    elevation: 5 
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
    marginTop: -2 
  },
  pinIcon: { fontSize: 14, fontWeight: '800', color: 'white', textAlign: 'center', lineHeight: 18 },
  pinLabelBubble: { 
    backgroundColor: 'rgba(0,0,0,0.75)', 
    borderRadius: 8, 
    paddingHorizontal: 8, 
    paddingVertical: 3, 
    marginTop: 4 
  },
  pinLabelText: { color: 'white', fontSize: 10, fontWeight: '700' },
  drawer: { 
    position: 'absolute', 
    bottom: 0, 
    left: 0, 
    right: 0, 
    backgroundColor: '#F4F5F7', 
    borderTopLeftRadius: 28, 
    borderTopRightRadius: 28, 
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 10,
  },
  handleWrap: { alignItems: 'center', paddingTop: 10, paddingBottom: 8, backgroundColor: '#F4F5F7', position: 'relative' },
  handleHitArea: { paddingHorizontal: 40, paddingVertical: 10, alignItems: 'center', justifyContent: 'center' },
  handleBar: { width: 64, height: 6, borderRadius: 99, backgroundColor: '#CDD2D8' },
  pendingNotificationBadge: {
    position: 'absolute',
    right: 20,
    top: 8,
    backgroundColor: '#F59E0B',
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  pendingNotificationText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
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
  modificationsLockedBannerText: { fontSize: 12, color: '#DC2626', flex: 1, fontWeight: '600' },
  lateWindowBanner: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFFBEB', padding: 12, borderRadius: 12, marginBottom: 14, gap: 8, borderWidth: 1, borderColor: '#FDE68A' },
  lateWindowBannerText: { fontSize: 12, color: '#F59E0B', flex: 1, fontWeight: '600' },
  cardSection: { 
    backgroundColor: 'white', 
    borderRadius: 20, 
    padding: 16, 
    marginBottom: 14, 
    shadowColor: '#000', 
    shadowOffset: { width: 0, height: 2 }, 
    shadowOpacity: 0.05, 
    shadowRadius: 8, 
    elevation: 2 
  },
  pendingModCard: {
    borderWidth: 2,
    borderColor: '#F59E0B',
    backgroundColor: '#FFFBEB',
  },
  modificationsLockedCard: {
    borderWidth: 1,
    borderColor: '#FEE2E2',
    backgroundColor: '#FEF2F2',
  },
  pendingModHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
  },
  actionNeededBadge: {
    backgroundColor: '#F59E0B',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  actionNeededText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
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
  vehicleHeaderRow: { flexDirection: 'row', alignItems: 'center' },
  vehicleIconCircle: { 
    width: 48, 
    height: 48, 
    borderRadius: 24, 
    backgroundColor: '#EAF1FF', 
    alignItems: 'center', 
    justifyContent: 'center', 
    marginRight: 12 
  },
  vehicleMeta: { flex: 1 },
  vehicleTitle: { fontSize: 16, fontWeight: '800', color: Colors.dark },
  vehicleSub: { marginTop: 3, fontSize: 12, color: Colors.gray, fontWeight: '600' },
  vehicleRegContainer: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 6, paddingTop: 6, borderTopWidth: 1, borderTopColor: '#F0F0F0' },
  vehicleRegText: { fontSize: 11, color: '#6B7280', fontWeight: '500' },
  seatInfoContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  seatInfoItem: {
    flex: 1,
    alignItems: 'center',
  },
  seatIconCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  seatInfoText: {
    alignItems: 'center',
  },
  seatInfoLabel: {
    fontSize: 11,
    color: Colors.gray,
    textAlign: 'center',
  },
  seatInfoValue: {
    fontSize: 18,
    fontWeight: '800',
    color: Colors.dark,
    marginTop: 2,
  },
  seatDivider: {
    width: 1,
    height: 50,
    backgroundColor: '#E5E7EB',
  },
  progressBarContainer: {
    height: 6,
    backgroundColor: '#E5E7EB',
    borderRadius: 3,
    overflow: 'hidden',
    marginBottom: 8,
  },
  progressBar: {
    height: '100%',
    backgroundColor: '#10B981',
    borderRadius: 3,
  },
  progressText: {
    fontSize: 12,
    color: Colors.gray,
    textAlign: 'center',
  },
  refreshButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#EAF1FF',
    paddingVertical: 12,
    borderRadius: 12,
    marginBottom: 14,
    gap: 8,
  },
  refreshButtonText: {
    color: '#2457A6',
    fontSize: 14,
    fontWeight: '600',
  },
  pendingModificationCard: { backgroundColor: '#FFFBEB', borderRadius: 16, padding: 12, marginBottom: 12, borderWidth: 1, borderColor: '#FDE68A' },
  pendingModificationHeader: { flexDirection: 'row', marginBottom: 12 },
  pendingModificationInfo: { flex: 1, marginLeft: 12 },
  passengerName: { fontSize: 14, fontWeight: '600', color: Colors.dark },
  seatChangeIndicator: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 4 },
  oldSeatText: { fontSize: 12, color: '#DC2626', textDecorationLine: 'line-through' },
  newSeatText: { fontSize: 12, color: '#10B981', fontWeight: 'bold' },
  modificationTime: { fontSize: 10, color: '#B45309', marginTop: 2, opacity: 0.7 },
  modificationActions: { flexDirection: 'row', gap: 10 },
  modActionBtn: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 10, borderRadius: 8, gap: 6 },
  approveModBtn: { backgroundColor: '#10B981' },
  rejectModBtn: { backgroundColor: '#EF4444' },
  modActionBtnText: { color: '#fff', fontSize: 13, fontWeight: '600' },
  lockedModificationsText: { fontSize: 12, color: '#DC2626', textAlign: 'center', marginTop: 8 },
  bookingItem: { flexDirection: 'row', alignItems: 'center', paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: '#EEF2F7' },
  passengerAvatar: { width: 44, height: 44, borderRadius: 22, overflow: 'hidden', marginRight: 12 },
  passengerAvatarSmall: { width: 36, height: 36, borderRadius: 18, overflow: 'hidden' },
  avatarImage: { width: 44, height: 44, borderRadius: 22, resizeMode: 'cover' },
  avatarImageSvg: { width: 44, height: 44, borderRadius: 22, overflow: 'hidden', alignItems: 'center', justifyContent: 'center', backgroundColor: '#E5E7EB' },
  avatarPlaceholder: { width: 44, height: 44, borderRadius: 22, backgroundColor: '#E5E7EB', alignItems: 'center', justifyContent: 'center' },
  avatarPlaceholderText: { fontSize: 16, fontWeight: '700', color: Colors.primary },
  smallAvatar: { width: 36, height: 36, borderRadius: 18 },
  smallAvatarPlaceholder: { width: 36, height: 36, borderRadius: 18, backgroundColor: '#E5E7EB', alignItems: 'center', justifyContent: 'center' },
  smallAvatarText: { fontSize: 14, fontWeight: '700', color: Colors.primary },
  bookingInfo: { flex: 1 },
  bookingSeats: { fontSize: 12, color: Colors.gray, marginTop: 2, flexDirection: 'row', alignItems: 'center' },
  bookingStatusBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12 },
  bookingStatusText: { fontSize: 11, fontWeight: '600' },
  bookingActions: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  chatButton: { 
    padding: 8, 
    backgroundColor: '#EFF6FF', 
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pendingActions: { flexDirection: 'row', gap: 8 },
  actionSmallBtn: { width: 36, height: 36, borderRadius: 18, alignItems: 'center', justifyContent: 'center' },
  acceptBtn: { backgroundColor: '#10B981' },
  rejectBtn: { backgroundColor: '#EF4444' },
  noBookingsContainer: { alignItems: 'center', padding: 30, gap: 10 },
  noBookingsText: { fontSize: 14, fontWeight: '600', color: Colors.gray },
  noBookingsSubtext: { fontSize: 12, color: Colors.gray, textAlign: 'center' },
  loadingContainer: { alignItems: 'center', padding: 20, gap: 10 },
  loadingText: { fontSize: 12, color: Colors.gray },
  simpleInfoLeft: { flexDirection: 'row', alignItems: 'center', gap: 12 },
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