// import React, { useCallback, useEffect, useState, useRef } from 'react';
// import {
//   View,
//   Text,
//   StyleSheet,
//   TouchableOpacity,
//   SafeAreaView,
//   StatusBar,
//   ScrollView,
//   RefreshControl,
//   ActivityIndicator,
//   Image,
//   TextInput,
//   Modal,
//   Alert,
//   Linking,
//   Dimensions,
//   Platform,
// } from 'react-native';
// import { useSafeAreaInsets } from 'react-native-safe-area-context';
// import MapView, { Marker, Polyline, PROVIDER_GOOGLE } from 'react-native-maps';
// import { Ionicons } from '@expo/vector-icons';
// import * as Location from 'expo-location';
// import axios from 'axios';
// import { API_BASE_URL } from "../config/config_ip";
// import { useAuth } from '../context/AuthContext';
// import { Colors } from '../constants/Colors';
// import io from 'socket.io-client';
// import { CameraView, useCameraPermissions } from 'expo-camera';
// const { width, height } = Dimensions.get('window');

// const buildImageUrl = (url) => {
//   if (!url) return null;
//   if (url.startsWith('http://') || url.startsWith('https://')) return url;
//   return `${API_BASE_URL}${url.startsWith('/') ? url : `/${url}`}`;
// };

// const getInitials = (name) => {
//   if (!name) return 'D';
//   const parts = name.trim().split(' ').filter(Boolean);
//   if (parts.length > 1) return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
//   return parts[0].slice(0, 2).toUpperCase();
// };

// export default function OngoingRideRiderScreen({ route, navigation }) {
//   const { bookingId, sessionId: initialSessionId } = route.params || {};
//   const { user } = useAuth();
//   const insets = useSafeAreaInsets();

//   const [session, setSession] = useState(null);
//   const [refreshing, setRefreshing] = useState(false);
//   const [loading, setLoading] = useState(true);
//   const [driverLocation, setDriverLocation] = useState(null);
//   const [userLocation, setUserLocation] = useState(null);
//   const [driverETA, setDriverETA] = useState(null);
//   const [driverDistance, setDriverDistance] = useState(null);
//   const [arrivalTime, setArrivalTime] = useState(null);
//   const [socketConnected, setSocketConnected] = useState(false);
//   const [showQRModal, setShowQRModal] = useState(false);
//   const [qrInput, setQrInput] = useState('');
//   const [showRatingModal, setShowRatingModal] = useState(false);
//   const [rating, setRating] = useState(0);
//   const [feedback, setFeedback] = useState('');
//   const [hasReachedPickup, setHasReachedPickup] = useState(false);
//   const [hasRatedDriver, setHasRatedDriver] = useState(false);
//   const [showRouteDetailsOnly, setShowRouteDetailsOnly] = useState(false);
//   const [rideCompleted, setRideCompleted] = useState(false);
//   const [submitting, setSubmitting] = useState(false);
//   const [scannerVisible, setScannerVisible] = useState(false);
//   const [isFetching, setIsFetching] = useState(false);
//   const [lastFetchTime, setLastFetchTime] = useState(0);
//   const [scanned, setScanned] = useState(false);
  
//   const mapRef = useRef(null);
//   const socketRef = useRef(null);
//   const locationIntervalRef = useRef(null);
//   const fetchTimeoutRef = useRef(null);
//   const reconnectAttempts = useRef(0);

//   // Camera permission state
//   // const [hasCameraPermission, setHasCameraPermission] = useState(null);
// const [permission, requestPermission] = useCameraPermissions();

//   // // Request camera permission on mount
//   // useEffect(() => {
//   //   (async () => {
//   //     const { status } = await Camera.requestCameraPermissionsAsync();
//   //     setHasCameraPermission(status === 'granted');
//   //   })();
//   // }, []);

//   const calculateDistance = (lat1, lon1, lat2, lon2) => {
//     const R = 6371000;
//     const dLat = (lat2 - lat1) * Math.PI / 180;
//     const dLon = (lon2 - lon1) * Math.PI / 180;
//     const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
//               Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
//               Math.sin(dLon/2) * Math.sin(dLon/2);
//     const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
//     return R * c;
//   };

//   const formatDistance = (meters) => {
//     if (!meters) return 'Unknown';
//     if (meters < 1000) {
//       return `${Math.round(meters)} m`;
//     }
//     return `${(meters / 1000).toFixed(1)} km`;
//   };

//   const calculateArrivalTime = (distance) => {
//     const minutes = Math.ceil(distance / 500);
//     const arrivalDate = new Date();
//     arrivalDate.setMinutes(arrivalDate.getMinutes() + minutes);
//     return arrivalDate.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });
//   };

//   const requestLocationPermission = async () => {
//     try {
//       const { status } = await Location.requestForegroundPermissionsAsync();
//       if (status !== 'granted') {
//         console.log('Location permission denied');
//         return false;
//       }
//       return true;
//     } catch (error) {
//       console.log('Location permission error:', error);
//       return false;
//     }
//   };

//   const getUserLocation = async () => {
//     try {
//       const hasPermission = await requestLocationPermission();
//       if (!hasPermission) return;
      
//       const location = await Location.getCurrentPositionAsync({
//         accuracy: Location.Accuracy.High,
//       });
      
//       const newLocation = {
//         latitude: location.coords.latitude,
//         longitude: location.coords.longitude,
//       };
//       setUserLocation(newLocation);
//       return newLocation;
//     } catch (error) {
//       console.log('Error getting location:', error);
//       return null;
//     }
//   };

//   const checkSessionStatus = async () => {
//     if (!bookingId || bookingId === 3) {
//       console.log('Invalid booking ID, skipping status check');
//       return null;
//     }
    
//     try {
//       const res = await axios.get(`${API_BASE_URL}/ride-session/rider/${bookingId}/status`, {
//         params: { rider_phone: user?.phone_number }
//       });
      
//       const data = res.data;
//       console.log('Session status check:', data);
      
//       if (data.ride_completed) {
//         setRideCompleted(true);
//         setHasRatedDriver(data.has_rated_driver);
        
//         if (data.has_rated_driver) {
//           setShowRouteDetailsOnly(true);
//           setShowRatingModal(false);
//         } else if (!data.has_rated_driver) {
//           setShowRatingModal(true);
//         }
//       }
      
//       return data;
//     } catch (error) {
//       console.log('Error checking session status:', error);
//       return null;
//     }
//   };

//   const connectSocket = useCallback(async (sessionId) => {
//     if (!sessionId) return;
    
//     if (socketRef.current && socketRef.current.connected) {
//       console.log('Socket already connected');
//       return;
//     }
    
//     try {
//       if (socketRef.current) {
//         socketRef.current.disconnect();
//       }
      
//       console.log('🔌 Connecting to socket server...');
//       const socket = io(API_BASE_URL, {
//         transports: ['websocket', 'polling'],
//         reconnection: true,
//         reconnectionAttempts: 5,
//         reconnectionDelay: 2000,
//         timeout: 10000,
//         auth: {
//           token: user?.phone_number,
//           userType: 'rider'
//         }
//       });
      
//       socketRef.current = socket;
      
//       socket.on('connect', () => {
//         console.log('✅ Socket connected!');
//         setSocketConnected(true);
//         reconnectAttempts.current = 0;
//         socket.emit('join-ride-room', sessionId);
//         console.log('📡 Joined ride room:', sessionId);
        
//         if (user?.phone_number) {
//           socket.emit('join-user-room', user.phone_number);
//         }
        
//         socket.emit('get-driver-location', { session_id: sessionId });
//       });
      
//       socket.on('connect_error', (error) => {
//         console.log('❌ Socket connection error:', error.message);
//         setSocketConnected(false);
//       });
      
//       socket.on('disconnect', (reason) => {
//         console.log('🔌 Socket disconnected:', reason);
//         setSocketConnected(false);
//       });
      
//       socket.on('reconnect', () => {
//         console.log('Socket reconnected');
//         setSocketConnected(true);
//         if (sessionId) {
//           socket.emit('join-ride-room', sessionId);
//         }
//         if (user?.phone_number) {
//           socket.emit('join-user-room', user.phone_number);
//         }
//       });
      
//       socket.on('driver-location-update', (location) => {
//         console.log('📍 Driver location update received:', location);
//         const newLocation = {
//           latitude: location.latitude,
//           longitude: location.longitude,
//         };
//         setDriverLocation(newLocation);
        
//         if (session?.pickup_lat && session?.pickup_lng && session?.rider_status === 'accepted') {
//           const dist = calculateDistance(
//             location.latitude,
//             location.longitude,
//             session.pickup_lat,
//             session.pickup_lng
//           );
//           setDriverDistance(dist);
//           const etaMinutes = Math.ceil(dist / 500);
//           setDriverETA(etaMinutes);
//           setArrivalTime(calculateArrivalTime(dist));
//         }
        
//         if (mapRef.current && userLocation) {
//           const coordinates = [
//             { latitude: location.latitude, longitude: location.longitude },
//             { latitude: userLocation.latitude, longitude: userLocation.longitude },
//           ];
//           mapRef.current.fitToCoordinates(coordinates, {
//             edgePadding: { top: 100, right: 50, bottom: 200, left: 50 },
//             animated: true,
//           });
//         }
//       });
      
//       socket.on('ride-started', (data) => {
//         console.log('🚗 Ride started event:', data);
//         Alert.alert('Ride Started', 'The driver has started the ride!');
//         fetchSession();
//       });
      
//       socket.on('rider-boarded', (data) => {
//         console.log('✅ Rider boarded event:', data);
//         Alert.alert('Boarded', 'You have been boarded successfully!');
//         fetchSession();
//       });
      
//       socket.on('rider-dropped-off', (data) => {
//         console.log('🏁 Rider dropped off event:', data);
//         Alert.alert('Trip Update', 'You have been dropped off. Please confirm to complete the ride.');
//         fetchSession();
//       });
      
//       socket.on('ride-auto-cancelled', (data) => {
//         console.log('❌ Ride auto-cancelled:', data);
//         Alert.alert('Ride Cancelled', data.reason || 'The ride has been auto-cancelled.');
//         navigation.goBack();
//       });
      
//       socket.on('ride-completed', (data) => {
//         console.log('✅ Ride completed:', data);
//         setRideCompleted(true);
//         checkSessionStatus();
//       });
      
//       socket.on('ride-completed-by-driver', (data) => {
//         console.log('🚗 Ride completed by driver:', data);
//         setRideCompleted(true);
//         checkSessionStatus();
//         Alert.alert('Ride Completed', 'The driver has completed the ride. You can now rate your experience.');
//       });
      
//     } catch (error) {
//       console.log('❌ Socket connection error:', error);
//     }
//   }, [session?.pickup_lat, session?.pickup_lng, session?.rider_status, userLocation, user?.phone_number]);

// const fetchSession = useCallback(async () => {
//   if (isFetching) return;
  
//   const now = Date.now();
//   if (now - lastFetchTime < 3000) return;
  
//   if (!bookingId || bookingId === 3) {
//     console.log('Invalid booking ID:', bookingId);
//     setLoading(false);
//     return;
//   }
  
//   setIsFetching(true);
//   setLastFetchTime(now);
  
//   try {
//     console.log('📡 Fetching session for booking:', bookingId);
//     const res = await axios.get(`${API_BASE_URL}/ride-sessions/rider/${bookingId}`, {
//       params: { rider_phone: user?.phone_number },
//     });
//     console.log('✅ Rider session fetched');
    
//     const sessionData = { ...res.data };
    
//     // Extract pickup/dropoff coordinates
//     if (sessionData.pickup_lat && sessionData.pickup_lng) {
//       sessionData.pickup_coords = {
//         latitude: sessionData.pickup_lat,
//         longitude: sessionData.pickup_lng,
//       };
//     }
//     if (sessionData.dropoff_lat && sessionData.dropoff_lng) {
//       sessionData.dropoff_coords = {
//         latitude: sessionData.dropoff_lat,
//         longitude: sessionData.dropoff_lng,
//       };
//     }
    
//     // CRITICAL FIX: Fetch driver session separately to get QR token
//     if (sessionData.ride_id && sessionData.driver_phone) {
//       try {
//         console.log('📡 Fetching driver session for ride:', sessionData.ride_id);
//         const driverSessionRes = await axios.get(`${API_BASE_URL}/ride-sessions/driver/${sessionData.ride_id}`, {
//           params: { driver_phone: sessionData.driver_phone }
//         });
        
//         if (driverSessionRes.data && driverSessionRes.data.qr_code_token) {
//           sessionData.qr_code_token = driverSessionRes.data.qr_code_token;
//           console.log('✅ QR token from driver session:', sessionData.qr_code_token);
//         }
//       } catch (driverError) {
//         console.log('Could not fetch driver session:', driverError?.response?.data || driverError.message);
//       }
//     }
    
//     console.log('📱 Final session QR token:', sessionData.qr_code_token);
//     setSession(sessionData);
    
//     if (sessionData.rider_status === 'completed') {
//       setRideCompleted(true);
//       checkSessionStatus();
//     }
    
//     if (sessionData.rider_status === 'reached_pickup') {
//       setHasReachedPickup(true);
//     }
    
//     if (sessionData.session_id && 
//         (sessionData.rider_status === 'accepted' || sessionData.rider_status === 'boarded' || sessionData.rider_status === 'dropped_off') &&
//         !rideCompleted) {
//       connectSocket(sessionData.session_id);
//     }
    
//   } catch (error) {
//     console.log('❌ Rider session fetch error:', error?.response?.data || error.message);
//   } finally {
//     setIsFetching(false);
//     setLoading(false);
//     setRefreshing(false);
//   }
// }, [bookingId, user?.phone_number, connectSocket, isFetching, lastFetchTime, rideCompleted]);
//   useEffect(() => {
//     if (!bookingId || bookingId === 3) {
//       Alert.alert('Invalid Booking', 'This booking ID is invalid. Please go back and try again.');
//       setLoading(false);
//       return;
//     }
    
//     fetchSession();
//     getUserLocation();
//     checkSessionStatus();
    
//     const timer = setInterval(() => {
//       if (!socketConnected && !rideCompleted) {
//         fetchSession();
//       }
//     }, 30000);
    
//     const locationTimer = setInterval(() => {
//       getUserLocation();
//     }, 10000);
    
//     return () => {
//       clearInterval(timer);
//       clearInterval(locationTimer);
//       if (fetchTimeoutRef.current) {
//         clearTimeout(fetchTimeoutRef.current);
//       }
//       if (socketRef.current) {
//         socketRef.current.disconnect();
//       }
//     };
//   }, []);

//   const onRefresh = () => {
//     setRefreshing(true);
//     fetchSession();
//     getUserLocation();
//     checkSessionStatus();
//   };

//   const handleReachedPickup = async () => {
//     if (!session?.session_id) return;
    
//     try {
//       await axios.post(`${API_BASE_URL}/ride-sessions/${session.session_id}/rider-reached-pickup`, {
//         booking_id: bookingId,
//         rider_phone: user?.phone_number,
//       });
//       setHasReachedPickup(true);
//       fetchSession();
//       Alert.alert('Success', 'Driver notified that you have reached the pickup location');
//     } catch (error) {
//       Alert.alert('Error', error?.response?.data?.detail || 'Could not notify driver');
//     }
//   };

//   const handleMarkDroppedOff = async () => {
//     if (!session?.session_id) return;
    
//     try {
//       await axios.post(`${API_BASE_URL}/ride-sessions/${session.session_id}/rider-dropped-off`, {
//         booking_id: bookingId,
//         rider_phone: user?.phone_number,
//       });
//       fetchSession();
//       Alert.alert('Success', 'You have been marked as dropped off. Please confirm to complete the ride.');
//     } catch (error) {
//       Alert.alert('Error', error?.response?.data?.detail || 'Could not mark drop off');
//     }
//   };

//   const handleMarkCompleted = async () => {
//     if (!session?.session_id) return;
    
//     try {
//       await axios.post(`${API_BASE_URL}/ride-sessions/${session.session_id}/rider-complete`, {
//         booking_id: bookingId,
//         rider_phone: user?.phone_number,
//       });
//       fetchSession();
//       setRideCompleted(true);
//       checkSessionStatus();
//     } catch (error) {
//       Alert.alert('Error', error?.response?.data?.detail || 'Could not complete ride');
//     }
//   };

//  const handleBoardWithToken = async () => {
//   if (!qrInput.trim()) {
//     Alert.alert('Error', 'Please enter the QR token');
//     return;
//   }
  
//   console.log('📱 Manual token entered:', qrInput.trim());
//   console.log('📱 Session QR token from API:', session?.qr_code_token);
  
//   const enteredToken = qrInput.trim();
//   const expectedToken = session?.qr_code_token;
  
//   if (enteredToken !== expectedToken) {
//     Alert.alert('Invalid Code', 'The code you entered does not match the driver\'s code. Please check and try again.');
//     return;
//   }
  
//   try {
//     const response = await axios.get(`${API_BASE_URL}/ride-session/${session?.session_id}/qr-valid`, {
//       params: { qr_code_token: enteredToken }
//     });
    
//     console.log('QR validation response:', response.data);
    
//     if (response.data.valid) {
//       await axios.post(`${API_BASE_URL}/ride-sessions/${session.session_id}/rider-board`, {
//         booking_id: bookingId,
//         rider_phone: user?.phone_number,
//         qr_code_token: enteredToken,
//       });
      
//       setScannerVisible(false);
//       setShowQRModal(false);
//       setQrInput('');
//       fetchSession();
//       Alert.alert('Success', 'You have been boarded successfully!');
//     } else {
//       Alert.alert('Invalid Code', response.data.message || 'Invalid QR code');
//     }
//   } catch (error) {
//     console.error('Board error:', error);
//     Alert.alert('Error', error?.response?.data?.detail || 'Failed to board');
//   }
// };

// const handleQRCodeScanned = async ({ data }) => {
//   if (!session?.session_id) {
//     Alert.alert('Error', 'Session not found. Please refresh and try again.');
//     return;
//   }
  
//   console.log('📱 QR Code scanned:', data);
//   console.log('📱 Session QR token from API:', session?.qr_code_token);
  
//   // Compare the scanned token with the session's QR token
//   const scannedToken = data.trim();
//   const expectedToken = session?.qr_code_token;
  
//   if (scannedToken !== expectedToken) {
//     console.log('❌ Token mismatch!');
//     console.log('Scanned:', scannedToken);
//     console.log('Expected:', expectedToken);
//     Alert.alert('Invalid QR Code', 'The scanned QR code does not match the driver\'s code. Please try again.');
//     setScanned(false);
//     return;
//   }
  
//   try {
//     // First validate the QR code
//     const validationResponse = await axios.get(`${API_BASE_URL}/ride-session/${session.session_id}/qr-valid`, {
//       params: { qr_code_token: scannedToken }
//     });
    
//     console.log('QR validation response:', validationResponse.data);
    
//     if (validationResponse.data.valid) {
//       // Board the rider
//       const boardResponse = await axios.post(`${API_BASE_URL}/ride-sessions/${session.session_id}/rider-board`, {
//         booking_id: bookingId,
//         rider_phone: user?.phone_number,
//         qr_code_token: scannedToken,
//       });
      
//       console.log('Board response:', boardResponse.data);
      
//       setScannerVisible(false);
//       setScanned(false);
//       setQrInput('');
//       fetchSession();
//       Alert.alert('Success', 'You have been boarded successfully!');
//     } else {
//       Alert.alert('Invalid QR Code', validationResponse.data.message || 'The QR code is invalid or expired');
//     }
//   } catch (error) {
//     console.error('QR Code error:', error);
//     console.error('Error response:', error?.response?.data);
//     const errorMsg = error?.response?.data?.detail || error?.message || 'Failed to board. Please try again.';
//     Alert.alert('Error', errorMsg);
//   } finally {
//     setTimeout(() => {
//       setScanned(false);
//     }, 2000);
//   }
// };
//   const handleRateDriver = async () => {
//     if (!session?.session_id) return;
//     if (rating === 0) {
//       Alert.alert('Rating Required', 'Please select a rating before submitting');
//       return;
//     }
    
//     setSubmitting(true);
//     try {
//       const response = await axios.post(`${API_BASE_URL}/ride-sessions/${session.session_id}/rate-driver-once`, {
//         booking_id: bookingId,
//         rating,
//         feedback,
//       });
      
//       if (response.data.already_rated) {
//         Alert.alert('Already Rated', response.data.message);
//         setHasRatedDriver(true);
//         setShowRouteDetailsOnly(true);
//       } else {
//         Alert.alert('Thank You!', 'Your rating has been submitted');
//         setHasRatedDriver(true);
//         setShowRouteDetailsOnly(true);
//       }
      
//       setShowRatingModal(false);
//       setRating(0);
//       setFeedback('');
//       fetchSession();
//     } catch (error) {
//       Alert.alert('Error', error?.response?.data?.detail || 'Could not submit rating');
//     } finally {
//       setSubmitting(false);
//     }
//   };

//   const handleSOS = async () => {
//     Alert.alert(
//       'Emergency SOS',
//       'This will notify your emergency contacts. Are you sure?',
//       [
//         { text: 'Cancel', style: 'cancel' },
//         {
//           text: 'Trigger SOS',
//           style: 'destructive',
//           onPress: async () => {
//             try {
//               await axios.post(`${API_BASE_URL}/ride-sessions/${session.session_id}/sos`, {
//                 note: 'SOS triggered by rider',
//                 rider_phone: user?.phone_number,
//               });
//               Alert.alert('SOS Triggered', 'Your emergency contacts have been notified');
//             } catch (error) {
//               Alert.alert('Error', 'Could not trigger SOS');
//             }
//           },
//         },
//       ]
//     );
//   };

//   const handleShareTrip = async () => {
//     const message = `I'm on a ride from ${session?.pickup_location || session?.origin} to ${session?.dropoff_location || session?.destination}. Track my ride live!`;
//     try {
//       await Linking.openURL(`sms:&body=${encodeURIComponent(message)}`);
//     } catch (error) {
//       Alert.alert('Error', 'Could not share trip');
//     }
//   };

//   const handleCallDriver = () => {
//     if (session?.driver_phone) {
//       Linking.openURL(`tel:${session.driver_phone}`);
//     } else {
//       Alert.alert('Error', 'Driver phone number not available');
//     }
//   };

//   const viewRouteDetails = () => {
//     navigation.navigate('ViewRouteRequestScreen', {
//       ride: {
//         id: session?.ride_id,
//         origin: session?.origin,
//         destination: session?.destination,
//         route_coordinates: session?.route_coordinates,
//         price_per_seat: session?.price_per_seat,
//         departure_time: session?.departure_time,
//       },
//       booking: { id: bookingId }
//     });
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


// // Update your QRScannerModal component:
// const QRScannerModal = () => {
//   if (!permission) {
//     return (
//       <Modal visible={scannerVisible} animationType="slide" transparent={false}>
//         <View style={styles.scannerContainer}>
//           <View style={styles.scannerHeader}>
//             <Text style={styles.scannerTitle}>Scan Boarding QR Code</Text>
//             <TouchableOpacity onPress={() => setScannerVisible(false)} style={styles.scannerCloseBtn}>
//               <Ionicons name="close" size={28} color="#fff" />
//             </TouchableOpacity>
//           </View>
//           <View style={styles.scannerPermissionContainer}>
//             <ActivityIndicator size="large" color="#10B981" />
//             <Text style={styles.scannerPermissionText}>Loading camera...</Text>
//           </View>
//         </View>
//       </Modal>
//     );
//   }

//   if (!permission.granted) {
//     return (
//       <Modal visible={scannerVisible} animationType="slide" transparent={false}>
//         <View style={styles.scannerContainer}>
//           <View style={styles.scannerHeader}>
//             <Text style={styles.scannerTitle}>Scan Boarding QR Code</Text>
//             <TouchableOpacity onPress={() => setScannerVisible(false)} style={styles.scannerCloseBtn}>
//               <Ionicons name="close" size={28} color="#fff" />
//             </TouchableOpacity>
//           </View>
//           <View style={styles.scannerPermissionContainer}>
//             <Ionicons name="camera-off" size={60} color="#fff" />
//             <Text style={styles.scannerPermissionText}>Camera permission is required to scan QR codes</Text>
//             <TouchableOpacity 
//               style={styles.scannerGrantBtn}
//               onPress={requestPermission}>
//               <Text style={styles.scannerGrantBtnText}>Grant Permission</Text>
//             </TouchableOpacity>
//             <TouchableOpacity 
//               style={styles.scannerManualBtn}
//               onPress={() => {
//                 setScannerVisible(false);
//                 setShowQRModal(true);
//               }}>
//               <Text style={styles.scannerManualBtnText}>Enter Code Manually</Text>
//             </TouchableOpacity>
//           </View>
//         </View>
//       </Modal>
//     );
//   }

//   return (
//     <Modal visible={scannerVisible} animationType="slide" transparent={false}>
//       <View style={styles.scannerContainer}>
//         <View style={styles.scannerHeader}>
//           <Text style={styles.scannerTitle}>Scan Boarding QR Code</Text>
//           <TouchableOpacity onPress={() => {
//             setScannerVisible(false);
//             setScanned(false);
//           }} style={styles.scannerCloseBtn}>
//             <Ionicons name="close" size={28} color="#fff" />
//           </TouchableOpacity>
//         </View>
        
//         <CameraView
//   style={StyleSheet.absoluteFillObject}
//   facing="back"
//   barcodeScannerSettings={{
//     barcodeTypes: ['qr'],
//   }}
//   onBarcodeScanned={scanned ? undefined : handleQRCodeScanned}
// >
//           <View style={styles.scannerOverlay}>
//             <View style={styles.scannerFrame} />
//             <Text style={styles.scannerInstruction}>
//               Position the QR code within the frame
//             </Text>
//             <TouchableOpacity 
//               style={styles.scannerManualButton}
//               onPress={() => {
//                 setScannerVisible(false);
//                 setShowQRModal(true);
//               }}>
//               <Text style={styles.scannerManualButtonText}>Enter Code Manually</Text>
//             </TouchableOpacity>
//           </View>
//         </CameraView>
//       </View>
//     </Modal>
//   );
// };
//   // QR Code Input Modal (Fallback)
//   const QRCodeInputModal = () => (
//     <Modal visible={showQRModal} animationType="slide" transparent>
//       <View style={styles.modalBackdrop}>
//         <View style={styles.qrInputModalCard}>
//           <View style={styles.qrInputHeader}>
//             <Text style={styles.qrInputTitle}>Enter Boarding Code</Text>
//             <TouchableOpacity onPress={() => {
//               setShowQRModal(false);
//               setQrInput('');
//             }}>
//               <Ionicons name="close" size={24} color="#6B7280" />
//             </TouchableOpacity>
//           </View>
          
//           <Text style={styles.qrInputSubtitle}>
//             Please enter the QR code token shown by the driver
//           </Text>
          
//           <TextInput
//             value={qrInput}
//             onChangeText={setQrInput}
//             placeholder="Enter QR token"
//             style={styles.qrInputField}
//             autoCapitalize="none"
//             autoCorrect={false}
//           />
          
//           <TouchableOpacity 
//             style={styles.qrInputButton}
//             onPress={handleBoardWithToken}
//           >
//             <Text style={styles.qrInputButtonText}>Board Ride</Text>
//           </TouchableOpacity>
          
//           <TouchableOpacity 
//             style={styles.qrInputCancelButton}
//             onPress={() => {
//               setShowQRModal(false);
//               setQrInput('');
//             }}
//           >
//             <Text style={styles.qrInputCancelButtonText}>Cancel</Text>
//           </TouchableOpacity>
//         </View>
//       </View>
//     </Modal>
//   );

//   if (loading) {
//     return (
//       <SafeAreaView style={styles.centered}>
//         <ActivityIndicator size="large" color="#184080" />
//         <Text style={styles.loadingText}>Loading ride details...</Text>
//       </SafeAreaView>
//     );
//   }

//   if (!bookingId || bookingId === 3) {
//     return (
//       <SafeAreaView style={styles.centered}>
//         <Ionicons name="alert-circle-outline" size={60} color="#DC2626" />
//         <Text style={styles.errorTitle}>Invalid Booking</Text>
//         <Text style={styles.errorText}>This booking could not be found.</Text>
//         <TouchableOpacity style={styles.goBackBtn} onPress={() => navigation.goBack()}>
//           <Text style={styles.goBackBtnText}>Go Back</Text>
//         </TouchableOpacity>
//       </SafeAreaView>
//     );
//   }

//   const riderStatus = session?.rider_status;
//   const isWaitingForDriver = riderStatus === 'accepted';
//   const isReachedPickup = riderStatus === 'reached_pickup' || hasReachedPickup;
//   const isBoarded = riderStatus === 'boarded';
//   const isDroppedOff = riderStatus === 'dropped_off';

//   const showDriverETA = isWaitingForDriver && driverETA && !isReachedPickup;
//   const showReachedPickupButton = isWaitingForDriver && !isReachedPickup && !rideCompleted;
//   const showQRButton = isReachedPickup && !isBoarded && !rideCompleted;
//   const showDroppedOffButton = isBoarded && !isDroppedOff && !rideCompleted;
//   const showCompleteButton = isDroppedOff && !rideCompleted;

//   const initialRegion = driverLocation ? {
//     latitude: driverLocation.latitude,
//     longitude: driverLocation.longitude,
//     latitudeDelta: 0.01,
//     longitudeDelta: 0.01,
//   } : userLocation ? {
//     latitude: userLocation.latitude,
//     longitude: userLocation.longitude,
//     latitudeDelta: 0.02,
//     longitudeDelta: 0.02,
//   } : {
//     latitude: session?.pickup_lat || 28.6139,
//     longitude: session?.pickup_lng || 77.2090,
//     latitudeDelta: 0.02,
//     longitudeDelta: 0.02,
//   };

//   return (
//     <SafeAreaView style={styles.container}>
//       <StatusBar barStyle="dark-content" backgroundColor={Colors.white} />

//       <View style={[styles.header, { paddingTop: insets.top > 0 ? insets.top : 12 }]}>
//   <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
//     <Ionicons name="chevron-back" size={24} color={Colors.primary} />
//   </TouchableOpacity>
//   <Text style={styles.headerTitle}>Ride Tracker</Text>
//   <TouchableOpacity style={styles.sosButton} onPress={handleSOS}>
//     <Ionicons name="shield-outline" size={24} color="#E11D48" />
//   </TouchableOpacity>
// </View>
//       {__DEV__ && (
//         <View style={styles.debugStatus}>
//           <Text style={[styles.debugText, socketConnected ? styles.debugConnected : styles.debugDisconnected]}>
//             {socketConnected ? '● Live Tracking Active' : '○ Connecting...'}
//           </Text>
//         </View>
//       )}

//       <View style={styles.mapContainer}>
//         <MapView
//           ref={mapRef}
//           provider={PROVIDER_GOOGLE}
//           style={styles.map}
//           initialRegion={initialRegion}
//           showsUserLocation={true}
//           showsMyLocationButton={true}
//           zoomEnabled={true}
//         >
//           {driverLocation && (
//             <Marker coordinate={driverLocation} anchor={{ x: 0.5, y: 0.5 }}>
//               <View style={styles.driverMarker}>
//                 <View style={styles.driverMarkerPulse} />
//                 <Ionicons name="car-sport" size={28} color="#184080" />
//                 <View style={styles.driverMarkerDot} />
//               </View>
//             </Marker>
//           )}

//           {session?.pickup_lat && session?.pickup_lng && !isBoarded && !rideCompleted && (
//             <Marker
//               coordinate={{
//                 latitude: session.pickup_lat,
//                 longitude: session.pickup_lng,
//               }}
//               anchor={{ x: 0.5, y: 1 }}
//             >
//               <View style={styles.pickupMarker}>
//                 <View style={styles.pickupMarkerBubble}>
//                   <Ionicons name="location" size={16} color="#10B981" />
//                 </View>
//                 <View style={styles.pickupMarkerPointer} />
//                 <Text style={styles.pickupMarkerLabel}>Pickup</Text>
//               </View>
//             </Marker>
//           )}

//           {session?.dropoff_lat && session?.dropoff_lng && !isDroppedOff && !rideCompleted && (
//             <Marker
//               coordinate={{
//                 latitude: session.dropoff_lat,
//                 longitude: session.dropoff_lng,
//               }}
//               anchor={{ x: 0.5, y: 1 }}
//             >
//               <View style={styles.dropoffMarker}>
//                 <View style={styles.dropoffMarkerBubble}>
//                   <Ionicons name="flag" size={16} color="#EF4444" />
//                 </View>
//                 <View style={styles.dropoffMarkerPointer} />
//                 <Text style={styles.dropoffMarkerLabel}>Dropoff</Text>
//               </View>
//             </Marker>
//           )}
//         </MapView>
//       </View>

//       <ScrollView
//         style={styles.bottomSheet}
//         contentContainerStyle={[styles.bottomSheetContent, { paddingBottom: insets.bottom + 20 }]}
//         showsVerticalScrollIndicator={false}
//         refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
//       >
//         {showRouteDetailsOnly ? (
//           <View style={styles.completedRouteContainer}>
//             <Ionicons name="checkmark-circle" size={48} color="#10B981" />
//             <Text style={styles.completedTitle}>Ride Completed!</Text>
//             <Text style={styles.completedSubtitle}>Thank you for riding with us</Text>
            
//             <TouchableOpacity style={styles.viewRouteBtn} onPress={viewRouteDetails}>
//               <Ionicons name="map-outline" size={20} color="#fff" />
//               <Text style={styles.viewRouteBtnText}>View Route Details</Text>
//             </TouchableOpacity>
//           </View>
//         ) : (
//           <>
//             <View style={[
//               styles.statusBanner, 
//               { backgroundColor: rideCompleted ? '#F3F4F6' : isBoarded ? '#DCFCE7' : isReachedPickup ? '#DCFCE7' : '#EFF6FF' }
//             ]}>
//               <Ionicons
//                 name={rideCompleted ? 'checkmark-done-circle' : isBoarded ? 'car-sport' : isReachedPickup ? 'checkmark-circle' : 'time-outline'}
//                 size={24}
//                 color={rideCompleted ? '#6B7280' : isBoarded ? '#16A34A' : isReachedPickup ? '#10B981' : '#F59E0B'}
//               />
//               <View style={styles.statusBannerText}>
//                 <Text style={[styles.statusBannerTitle, { color: rideCompleted ? '#374151' : isBoarded ? '#166534' : isReachedPickup ? '#065A46' : '#92400E' }]}>
//                   {rideCompleted ? 'Ride Completed' : isBoarded ? 'Onboard - Ride in Progress' : isReachedPickup ? 'Ready to Board' : isWaitingForDriver ? 'Driver is on the way' : 'Waiting for driver'}
//                 </Text>
//                 <Text style={[styles.statusBannerSub, { color: rideCompleted ? '#6B7280' : isBoarded ? '#166534' : isReachedPickup ? '#065A46' : '#92400E' }]}>
//                   {rideCompleted 
//                     ? 'Rate your experience with the driver' 
//                     : isBoarded 
//                     ? `Heading to ${session?.dropoff_location || session?.destination}` 
//                     : isReachedPickup 
//                     ? 'Please enter the driver\'s boarding code to board'
//                     : driverETA ? `${driverETA} mins away • ${formatDistance(driverDistance)}` : 'Waiting for driver to start...'}
//                 </Text>
//               </View>
//             </View>

//             {showDriverETA && (
//               <View style={styles.etaCard}>
//                 <View style={styles.etaIcon}>
//                   <Ionicons name="time-outline" size={24} color="#184080" />
//                 </View>
//                 <View style={styles.etaInfo}>
//                   <Text style={styles.etaLabel}>Driver arriving in</Text>
//                   <Text style={styles.etaValue}>{driverETA} mins</Text>
//                   {arrivalTime && <Text style={styles.etaTime}>~ {arrivalTime}</Text>}
//                 </View>
//                 <View style={styles.distanceBadge}>
//                   <Text style={styles.distanceText}>{formatDistance(driverDistance)}</Text>
//                 </View>
//               </View>
//             )}

//             {session?.driver_name && !rideCompleted && (
//               <View style={styles.driverCard}>
//                 <View style={styles.driverInfo}>
//                   {session?.driver_photo ? (
//                     <Image source={{ uri: buildImageUrl(session.driver_photo) }} style={styles.driverAvatar} />
//                   ) : (
//                     <View style={[styles.driverAvatar, styles.driverAvatarFallback]}>
//                       <Text style={styles.driverAvatarText}>{getInitials(session?.driver_name)}</Text>
//                     </View>
//                   )}
//                   <View style={styles.driverDetails}>
//                     <Text style={styles.driverName}>{session?.driver_name}</Text>
//                     <View style={styles.ratingRow}>
//                       <Ionicons name="star" size={14} color="#F59E0B" />
//                       <Text style={styles.ratingText}>{session?.driver_rating || 4.9}</Text>
//                     </View>
//                     <Text style={styles.vehicleInfo}>
//                       {session?.vehicle_model || 'Vehicle'} • {session?.vehicle_color || 'White'}
//                     </Text>
//                   </View>
//                 </View>
//                 <View style={styles.driverActions}>
//                   <TouchableOpacity style={styles.callButton} onPress={handleCallDriver}>
//                     <Ionicons name="call-outline" size={20} color={Colors.primary} />
//                   </TouchableOpacity>
//                   <TouchableOpacity style={styles.chatButton} onPress={() => navigation.navigate('ChatScreen', {
//                     receiverPhone: session?.driver_phone,
//                     rideId: session?.ride_id,
//                     user: { name: session?.driver_name, phone: session?.driver_phone }
//                   })}>
//                     <Ionicons name="chatbubble-ellipses" size={20} color={Colors.primary} />
//                   </TouchableOpacity>
//                 </View>
//               </View>
//             )}

//             <View style={styles.tripCard}>
//               <Text style={styles.cardTitle}>Trip Details</Text>
              
//               <View style={styles.tripRow}>
//                 <View style={styles.tripIconCol}>
//                   <Ionicons name="ellipse" size={12} color={isReachedPickup ? '#10B981' : '#9CA3AF'} />
//                   <View style={[styles.dottedLine, isReachedPickup && { backgroundColor: '#10B981' }]} />
//                   <Ionicons name="flag" size={12} color={isDroppedOff ? '#10B981' : '#9CA3AF'} />
//                 </View>
//                 <View style={styles.tripTextCol}>
//                   <Text style={styles.tripLabel}>Pickup</Text>
//                   <Text style={[styles.tripValue, isReachedPickup && { color: '#10B981' }]}>
//                     {session?.pickup_location || session?.origin || 'Pickup location'}
//                     {isReachedPickup && ' ✓'}
//                   </Text>
//                   <Text style={[styles.tripLabel, { marginTop: 16 }]}>Drop-off</Text>
//                   <Text style={[styles.tripValue, isDroppedOff && { color: '#10B981' }]}>
//                     {session?.dropoff_location || session?.destination || 'Drop-off location'}
//                     {isDroppedOff && ' ✓'}
//                   </Text>
//                 </View>
//               </View>
//             </View>

//             <TouchableOpacity style={styles.refreshLocationBtn} onPress={() => {
//               getUserLocation();
//               fetchSession();
//             }}>
//               <Ionicons name="refresh" size={20} color="#184080" />
//               <Text style={styles.refreshLocationText}>Refresh location</Text>
//             </TouchableOpacity>

//             {showReachedPickupButton && (
//               <TouchableOpacity style={styles.reachedPickupBtn} onPress={handleReachedPickup}>
//                 <Ionicons name="location" size={20} color="#fff" />
//                 <Text style={styles.reachedPickupBtnText}>I've Reached Pickup Location</Text>
//               </TouchableOpacity>
//             )}

//             {showQRButton && (
//               <>
//                 <View style={styles.boardingInstructionCard}>
//                   <Ionicons name="information-circle-outline" size={20} color="#184080" />
//                   <Text style={styles.boardingInstructionText}>
//                     Ask the driver for the boarding QR code. You can scan the QR code or enter the token manually.
//                   </Text>
//                 </View>
                
//                 <TouchableOpacity style={styles.scanQRBtn} onPress={() => setScannerVisible(true)}>
//                   <Ionicons name="qr-code" size={20} color="#fff" />
//                   <Text style={styles.scanQRBtnText}>Scan QR Code to Board</Text>
//                 </TouchableOpacity>
                
//                 <TouchableOpacity style={styles.manualCodeBtn} onPress={() => setShowQRModal(true)}>
//                   <Ionicons name="keypad-outline" size={20} color="#184080" />
//                   <Text style={styles.manualCodeBtnText}>Enter Code Manually</Text>
//                 </TouchableOpacity>
//               </>
//             )}

//             {showDroppedOffButton && (
//               <TouchableOpacity style={styles.droppedOffBtn} onPress={handleMarkDroppedOff}>
//                 <Ionicons name="flag" size={20} color="#fff" />
//                 <Text style={styles.droppedOffBtnText}>I've Reached My Destination</Text>
//               </TouchableOpacity>
//             )}

//             {showCompleteButton && (
//               <>
//                 <View style={styles.safetyCard}>
//                   <Ionicons name="shield-checkmark" size={24} color="#10B981" />
//                   <View>
//                     <Text style={styles.safetyTitle}>Safety Confirmation Required</Text>
//                     <Text style={styles.safetyText}>For your safety, please mark the ride as completed once you have safely reached your destination.</Text>
//                   </View>
//                 </View>
//                 <TouchableOpacity style={styles.completeBtn} onPress={handleMarkCompleted}>
//                   <Text style={styles.completeBtnText}>Mark Ride as Completed</Text>
//                 </TouchableOpacity>
//               </>
//             )}

//             {!rideCompleted && (
//               <View style={styles.actionButtons}>
//                 <TouchableOpacity style={styles.shareBtn} onPress={handleShareTrip}>
//                   <Ionicons name="share-social" size={20} color={Colors.primary} />
//                   <Text style={styles.shareBtnText}>Share Trip</Text>
//                 </TouchableOpacity>
//                 <TouchableOpacity style={styles.sosActionBtn} onPress={handleSOS}>
//                   <Ionicons name="alert-circle" size={20} color="#DC2626" />
//                   <Text style={styles.sosActionBtnText}>SOS</Text>
//                 </TouchableOpacity>
//               </View>
//             )}

//             <View style={styles.safetyNote}>
//               <Ionicons name="information-circle" size={16} color="#6B7280" />
//               <Text style={styles.safetyNoteText}>Always verify the driver and vehicle before boarding.</Text>
//             </View>
//           </>
//         )}
//       </ScrollView>

//       <QRScannerModal />
//       <QRCodeInputModal />

//       <Modal visible={showRatingModal} transparent animationType="fade">
//         <View style={styles.modalBackdrop}>
//           <View style={styles.modalCard}>
//             <Text style={styles.modalTitle}>Rate Your Experience</Text>
//             <Text style={styles.modalSub}>How was your ride with {session?.driver_name}?</Text>

//             {renderStars()}

//             <TextInput
//               value={feedback}
//               onChangeText={setFeedback}
//               placeholder="Tell us about your experience..."
//               multiline
//               numberOfLines={3}
//               style={styles.feedbackInput}
//               textAlignVertical="top"
//             />

//             <View style={styles.modalActions}>
//               <TouchableOpacity style={styles.skipBtn} onPress={() => setShowRatingModal(false)}>
//                 <Text style={styles.skipBtnText}>Later</Text>
//               </TouchableOpacity>
//               <TouchableOpacity 
//                 style={[styles.submitBtn, (rating === 0 || submitting) && { opacity: 0.5 }]} 
//                 onPress={handleRateDriver} 
//                 disabled={rating === 0 || submitting}
//               >
//                 <Text style={styles.submitBtnText}>{submitting ? 'Submitting...' : 'Submit Rating'}</Text>
//               </TouchableOpacity>
//             </View>
//           </View>
//         </View>
//       </Modal>
//     </SafeAreaView>
//   );
// }

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     backgroundColor: Colors.white,
//   },
//   centered: {
//     flex: 1,
//     justifyContent: 'center',
//     alignItems: 'center',
//     backgroundColor: Colors.white,
//     padding: 20,
//   },
//   loadingText: {
//     marginTop: 12,
//     fontSize: 14,
//     color: '#6B7280',
//   },
//   errorTitle: {
//     fontSize: 20,
//     fontWeight: '700',
//     color: '#DC2626',
//     marginTop: 16,
//   },
//   errorText: {
//     fontSize: 14,
//     color: '#6B7280',
//     marginTop: 8,
//     textAlign: 'center',
//   },
//   goBackBtn: {
//     marginTop: 20,
//     backgroundColor: Colors.primary,
//     paddingHorizontal: 30,
//     paddingVertical: 12,
//     borderRadius: 12,
//   },
//   goBackBtnText: {
//     color: '#fff',
//     fontWeight: '600',
//     fontSize: 16,
//   },
//   header: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     justifyContent: 'space-between',
//     paddingHorizontal: 16,
//     paddingBottom: 12,
//     backgroundColor: Colors.white,
//     borderBottomWidth: 0.5,
//     borderBottomColor: '#F3F4F6',
//   },
//   backButton: {
//     width: 40,
//     height: 40,
//     justifyContent: 'center',
//     alignItems: 'center',
//   },
//   headerTitle: {
//     fontSize: 20,
//     fontWeight: '700',
//     color: Colors.primary,
//   },
//   sosButton: {
//     width: 40,
//     height: 40,
//     justifyContent: 'center',
//     alignItems: 'center',
//   },
//   debugStatus: {
//     paddingHorizontal: 16,
//     paddingVertical: 4,
//     backgroundColor: '#F3F4F6',
//   },
//   debugText: {
//     fontSize: 10,
//     fontWeight: '500',
//   },
//   debugConnected: {
//     color: '#10B981',
//   },
//   debugDisconnected: {
//     color: '#EF4444',
//   },
//   mapContainer: {
//     height: height * 0.45,
//     width: '100%',
//     backgroundColor: '#E8EEF7',
//   },
//   map: {
//     flex: 1,
//   },
//   driverMarker: {
//     alignItems: 'center',
//     justifyContent: 'center',
//   },
//   driverMarkerPulse: {
//     position: 'absolute',
//     width: 50,
//     height: 50,
//     borderRadius: 25,
//     backgroundColor: 'rgba(24, 64, 128, 0.2)',
//   },
//   driverMarkerDot: {
//     position: 'absolute',
//     width: 12,
//     height: 12,
//     borderRadius: 6,
//     backgroundColor: '#184080',
//   },
//   pickupMarker: {
//     alignItems: 'center',
//   },
//   pickupMarkerBubble: {
//     width: 32,
//     height: 32,
//     borderRadius: 16,
//     backgroundColor: '#10B981',
//     alignItems: 'center',
//     justifyContent: 'center',
//     borderWidth: 2,
//     borderColor: '#fff',
//   },
//   pickupMarkerPointer: {
//     width: 0,
//     height: 0,
//     borderLeftWidth: 6,
//     borderRightWidth: 6,
//     borderTopWidth: 8,
//     borderLeftColor: 'transparent',
//     borderRightColor: 'transparent',
//     borderTopColor: '#10B981',
//     marginTop: -2,
//   },
//   pickupMarkerLabel: {
//     fontSize: 11,
//     fontWeight: '600',
//     color: '#10B981',
//     marginTop: 4,
//   },
//   dropoffMarker: {
//     alignItems: 'center',
//   },
//   dropoffMarkerBubble: {
//     width: 32,
//     height: 32,
//     borderRadius: 16,
//     backgroundColor: '#EF4444',
//     alignItems: 'center',
//     justifyContent: 'center',
//     borderWidth: 2,
//     borderColor: '#fff',
//   },
//   dropoffMarkerPointer: {
//     width: 0,
//     height: 0,
//     borderLeftWidth: 6,
//     borderRightWidth: 6,
//     borderTopWidth: 8,
//     borderLeftColor: 'transparent',
//     borderRightColor: 'transparent',
//     borderTopColor: '#EF4444',
//     marginTop: -2,
//   },
//   dropoffMarkerLabel: {
//     fontSize: 11,
//     fontWeight: '600',
//     color: '#EF4444',
//     marginTop: 4,
//   },
//   bottomSheet: {
//     flex: 1,
//     backgroundColor: Colors.white,
//   },
//   bottomSheetContent: {
//     paddingHorizontal: 16,
//     paddingTop: 12,
//   },
//   statusBanner: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     padding: 16,
//     borderRadius: 16,
//     marginBottom: 16,
//     gap: 12,
//   },
//   statusBannerText: {
//     flex: 1,
//   },
//   statusBannerTitle: {
//     fontSize: 16,
//     fontWeight: '700',
//   },
//   statusBannerSub: {
//     fontSize: 13,
//     marginTop: 2,
//   },
//   etaCard: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     backgroundColor: '#F0F7FF',
//     borderRadius: 16,
//     padding: 16,
//     marginBottom: 16,
//     gap: 12,
//     borderWidth: 1,
//     borderColor: '#E0ECFF',
//   },
//   etaIcon: {
//     width: 48,
//     height: 48,
//     borderRadius: 24,
//     backgroundColor: '#E8EEF9',
//     alignItems: 'center',
//     justifyContent: 'center',
//   },
//   etaInfo: {
//     flex: 1,
//   },
//   etaLabel: {
//     fontSize: 12,
//     color: '#6B7280',
//   },
//   etaValue: {
//     fontSize: 24,
//     fontWeight: '700',
//     color: '#184080',
//   },
//   etaTime: {
//     fontSize: 12,
//     color: '#6B7280',
//     marginTop: 2,
//   },
//   distanceBadge: {
//     backgroundColor: '#E8EEF9',
//     paddingHorizontal: 12,
//     paddingVertical: 6,
//     borderRadius: 20,
//   },
//   distanceText: {
//     fontSize: 14,
//     fontWeight: '600',
//     color: '#184080',
//   },
//   driverCard: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     justifyContent: 'space-between',
//     backgroundColor: '#F9FAFB',
//     borderRadius: 16,
//     padding: 16,
//     marginBottom: 16,
//     borderWidth: 1,
//     borderColor: '#E5E7EB',
//   },
//   driverInfo: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     flex: 1,
//   },
//   driverAvatar: {
//     width: 56,
//     height: 56,
//     borderRadius: 28,
//     marginRight: 12,
//   },
//   driverAvatarFallback: {
//     backgroundColor: '#E8EEF9',
//     alignItems: 'center',
//     justifyContent: 'center',
//   },
//   driverAvatarText: {
//     fontSize: 18,
//     fontWeight: '700',
//     color: Colors.primary,
//   },
//   driverDetails: {
//     flex: 1,
//   },
//   driverName: {
//     fontSize: 16,
//     fontWeight: '700',
//     color: '#111827',
//   },
//   ratingRow: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     gap: 4,
//     marginTop: 2,
//   },
//   ratingText: {
//     fontSize: 12,
//     color: '#6B7280',
//   },
//   vehicleInfo: {
//     fontSize: 12,
//     color: '#6B7280',
//     marginTop: 2,
//   },
//   driverActions: {
//     flexDirection: 'row',
//     gap: 12,
//   },
//   callButton: {
//     width: 40,
//     height: 40,
//     borderRadius: 20,
//     backgroundColor: '#E8EEF9',
//     alignItems: 'center',
//     justifyContent: 'center',
//   },
//   chatButton: {
//     width: 40,
//     height: 40,
//     borderRadius: 20,
//     backgroundColor: '#E8EEF9',
//     alignItems: 'center',
//     justifyContent: 'center',
//   },
//   tripCard: {
//     backgroundColor: '#F9FAFB',
//     borderRadius: 16,
//     padding: 16,
//     marginBottom: 16,
//     borderWidth: 1,
//     borderColor: '#E5E7EB',
//   },
//   cardTitle: {
//     fontSize: 16,
//     fontWeight: '700',
//     color: '#111827',
//     marginBottom: 12,
//   },
//   tripRow: {
//     flexDirection: 'row',
//     marginBottom: 16,
//   },
//   tripIconCol: {
//     alignItems: 'center',
//     width: 24,
//     marginRight: 12,
//   },
//   dottedLine: {
//     width: 2,
//     height: 30,
//     backgroundColor: '#D1D5DB',
//     marginVertical: 4,
//   },
//   tripTextCol: {
//     flex: 1,
//   },
//   tripLabel: {
//     fontSize: 12,
//     color: '#6B7280',
//     marginBottom: 2,
//   },
//   tripValue: {
//     fontSize: 14,
//     fontWeight: '500',
//     color: '#111827',
//   },
//   refreshLocationBtn: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     justifyContent: 'center',
//     gap: 8,
//     backgroundColor: '#F3F4F6',
//     borderRadius: 12,
//     paddingVertical: 10,
//     marginBottom: 16,
//   },
//   refreshLocationText: {
//     fontSize: 13,
//     color: '#184080',
//     fontWeight: '500',
//   },
//   reachedPickupBtn: {
//     backgroundColor: '#10B981',
//     borderRadius: 14,
//     paddingVertical: 16,
//     flexDirection: 'row',
//     alignItems: 'center',
//     justifyContent: 'center',
//     gap: 8,
//     marginBottom: 16,
//   },
//   reachedPickupBtnText: {
//     color: '#fff',
//     fontSize: 15,
//     fontWeight: '700',
//   },
//   scanQRBtn: {
//     backgroundColor: Colors.primary,
//     borderRadius: 14,
//     paddingVertical: 16,
//     flexDirection: 'row',
//     alignItems: 'center',
//     justifyContent: 'center',
//     gap: 8,
//     marginBottom: 12,
//   },
//   scanQRBtnText: {
//     color: '#fff',
//     fontSize: 15,
//     fontWeight: '700',
//   },
//   manualCodeBtn: {
//     backgroundColor: '#F3F4F6',
//     borderRadius: 14,
//     paddingVertical: 14,
//     flexDirection: 'row',
//     alignItems: 'center',
//     justifyContent: 'center',
//     gap: 8,
//     marginBottom: 16,
//     borderWidth: 1,
//     borderColor: '#E5E7EB',
//   },
//   manualCodeBtnText: {
//     color: '#184080',
//     fontSize: 14,
//     fontWeight: '600',
//   },
//   droppedOffBtn: {
//     backgroundColor: '#10B981',
//     borderRadius: 14,
//     paddingVertical: 16,
//     flexDirection: 'row',
//     alignItems: 'center',
//     justifyContent: 'center',
//     gap: 8,
//     marginBottom: 16,
//   },
//   droppedOffBtnText: {
//     color: '#fff',
//     fontSize: 15,
//     fontWeight: '700',
//   },
//   completeBtn: {
//     backgroundColor: Colors.primary,
//     borderRadius: 14,
//     paddingVertical: 16,
//     alignItems: 'center',
//     marginBottom: 16,
//   },
//   completeBtnText: {
//     color: '#fff',
//     fontSize: 15,
//     fontWeight: '700',
//   },
//   safetyCard: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     backgroundColor: '#FEF2F2',
//     borderRadius: 14,
//     padding: 16,
//     marginBottom: 16,
//     gap: 12,
//     borderWidth: 1,
//     borderColor: '#FEE2E2',
//   },
//   safetyTitle: {
//     fontSize: 14,
//     fontWeight: '700',
//     color: '#DC2626',
//   },
//   safetyText: {
//     fontSize: 12,
//     color: '#DC2626',
//     marginTop: 2,
//   },
//   actionButtons: {
//     flexDirection: 'row',
//     gap: 12,
//     marginBottom: 16,
//   },
//   shareBtn: {
//     flex: 1,
//     flexDirection: 'row',
//     alignItems: 'center',
//     justifyContent: 'center',
//     gap: 8,
//     backgroundColor: '#F3F4F6',
//     borderRadius: 14,
//     paddingVertical: 14,
//   },
//   shareBtnText: {
//     color: Colors.primary,
//     fontWeight: '600',
//     fontSize: 14,
//   },
//   sosActionBtn: {
//     flex: 1,
//     flexDirection: 'row',
//     alignItems: 'center',
//     justifyContent: 'center',
//     gap: 8,
//     backgroundColor: '#FEF2F2',
//     borderRadius: 14,
//     paddingVertical: 14,
//   },
//   sosActionBtnText: {
//     color: '#DC2626',
//     fontWeight: '600',
//     fontSize: 14,
//   },
//   safetyNote: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     justifyContent: 'center',
//     gap: 6,
//     paddingVertical: 12,
//   },
//   safetyNoteText: {
//     fontSize: 11,
//     color: '#6B7280',
//   },
//   modalBackdrop: {
//     flex: 1,
//     backgroundColor: 'rgba(17,24,39,0.45)',
//     justifyContent: 'center',
//     padding: 20,
//   },
//   modalCard: {
//     backgroundColor: '#fff',
//     borderRadius: 24,
//     padding: 20,
//   },
//   modalTitle: {
//     fontSize: 22,
//     fontWeight: '700',
//     color: '#111827',
//     textAlign: 'center',
//   },
//   modalSub: {
//     fontSize: 14,
//     color: '#6B7280',
//     textAlign: 'center',
//     marginTop: 8,
//     marginBottom: 18,
//   },
//   starsRow: {
//     flexDirection: 'row',
//     justifyContent: 'center',
//     marginBottom: 18,
//   },
//   feedbackInput: {
//     minHeight: 100,
//     borderWidth: 1,
//     borderColor: '#E5E7EB',
//     borderRadius: 16,
//     padding: 14,
//     color: '#111827',
//     fontSize: 14,
//   },
//   modalActions: {
//     flexDirection: 'row',
//     gap: 10,
//     marginTop: 18,
//   },
//   skipBtn: {
//     flex: 1,
//     borderWidth: 1,
//     borderColor: '#D1D5DB',
//     borderRadius: 999,
//     paddingVertical: 14,
//     alignItems: 'center',
//   },
//   skipBtnText: {
//     color: '#6B7280',
//     fontWeight: '600',
//   },
//   submitBtn: {
//     flex: 1,
//     backgroundColor: Colors.primary,
//     borderRadius: 999,
//     paddingVertical: 14,
//     alignItems: 'center',
//   },
//   submitBtnText: {
//     color: '#fff',
//     fontWeight: '700',
//   },
//   completedRouteContainer: {
//     alignItems: 'center',
//     paddingVertical: 40,
//     gap: 16,
//   },
//   completedTitle: {
//     fontSize: 22,
//     fontWeight: '700',
//     color: '#10B981',
//   },
//   completedSubtitle: {
//     fontSize: 14,
//     color: '#6B7280',
//     textAlign: 'center',
//   },
//   viewRouteBtn: {
//     backgroundColor: Colors.primary,
//     borderRadius: 14,
//     paddingVertical: 14,
//     paddingHorizontal: 24,
//     flexDirection: 'row',
//     alignItems: 'center',
//     gap: 8,
//     marginTop: 16,
//   },
//   viewRouteBtnText: {
//     color: '#fff',
//     fontSize: 16,
//     fontWeight: '600',
//   },
//   boardingInstructionCard: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     backgroundColor: '#EFF6FF',
//     borderRadius: 12,
//     padding: 12,
//     marginBottom: 16,
//     gap: 10,
//   },
//   boardingInstructionText: {
//     flex: 1,
//     fontSize: 12,
//     color: '#184080',
//     lineHeight: 18,
//   },
//   // QR Scanner Styles
//   scannerContainer: {
//     flex: 1,
//     backgroundColor: '#000',
//   },
//   scannerHeader: {
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//     alignItems: 'center',
//     paddingHorizontal: 20,
//     paddingTop: Platform.OS === 'ios' ? 50 : 20,
//     paddingBottom: 12,
//     backgroundColor: '#000',
//     zIndex: 10,
//   },
//   scannerTitle: {
//     fontSize: 20,
//     fontWeight: '700',
//     color: '#fff',
//   },
//   scannerCloseBtn: {
//     padding: 8,
//   },
//   scannerOverlay: {
//     flex: 1,
//     backgroundColor: 'rgba(0,0,0,0.5)',
//     alignItems: 'center',
//     justifyContent: 'center',
//   },
//   scannerFrame: {
//     width: width * 0.7,
//     height: width * 0.7,
//     borderWidth: 2,
//     borderColor: '#10B981',
//     backgroundColor: 'transparent',
//     borderRadius: 12,
//   },
//   scannerInstruction: {
//     marginTop: 20,
//     color: '#fff',
//     fontSize: 14,
//     textAlign: 'center',
//   },
//   scannerManualButton: {
//     marginTop: 40,
//     paddingHorizontal: 20,
//     paddingVertical: 12,
//     backgroundColor: 'rgba(255,255,255,0.2)',
//     borderRadius: 12,
//   },
//   scannerManualButtonText: {
//     color: '#fff',
//     fontSize: 14,
//     fontWeight: '600',
//   },
//   scannerPermissionContainer: {
//     flex: 1,
//     alignItems: 'center',
//     justifyContent: 'center',
//     padding: 20,
//   },
//   scannerPermissionText: {
//     marginTop: 16,
//     color: '#fff',
//     fontSize: 16,
//     textAlign: 'center',
//   },
//   scannerGrantBtn: {
//     marginTop: 20,
//     backgroundColor: '#10B981',
//     paddingHorizontal: 24,
//     paddingVertical: 12,
//     borderRadius: 12,
//   },
//   scannerGrantBtnText: {
//     color: '#fff',
//     fontSize: 16,
//     fontWeight: '600',
//   },
//   scannerManualBtn: {
//     marginTop: 12,
//     backgroundColor: 'transparent',
//     paddingHorizontal: 24,
//     paddingVertical: 12,
//     borderRadius: 12,
//     borderWidth: 1,
//     borderColor: '#fff',
//   },
//   scannerManualBtnText: {
//     color: '#fff',
//     fontSize: 14,
//     fontWeight: '600',
//   },
//   qrInputModalCard: {
//     backgroundColor: '#fff',
//     borderRadius: 24,
//     padding: 20,
//     width: width - 40,
//   },
//   qrInputHeader: {
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//     alignItems: 'center',
//     marginBottom: 16,
//   },
//   qrInputTitle: {
//     fontSize: 20,
//     fontWeight: '700',
//     color: '#111827',
//   },
//   qrInputSubtitle: {
//     fontSize: 14,
//     color: '#6B7280',
//     marginBottom: 20,
//   },
//   qrInputField: {
//     borderWidth: 1,
//     borderColor: '#E5E7EB',
//     borderRadius: 12,
//     padding: 14,
//     fontSize: 16,
//     marginBottom: 20,
//     backgroundColor: '#F9FAFB',
//     fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
//   },
//   qrInputButton: {
//     backgroundColor: Colors.primary,
//     borderRadius: 12,
//     paddingVertical: 14,
//     alignItems: 'center',
//     marginBottom: 12,
//   },
//   qrInputButtonText: {
//     color: '#fff',
//     fontSize: 16,
//     fontWeight: '600',
//   },
//   qrInputCancelButton: {
//     backgroundColor: '#F3F4F6',
//     borderRadius: 12,
//     paddingVertical: 14,
//     alignItems: 'center',
//   },
//   qrInputCancelButtonText: {
//     color: '#6B7280',
//     fontSize: 16,
//     fontWeight: '600',
//   },

// });
// import React, { useCallback, useEffect, useState, useRef } from 'react';
// import {
//   View,
//   Text,
//   StyleSheet,
//   TouchableOpacity,
//   SafeAreaView,
//   StatusBar,
//   ScrollView,
//   RefreshControl,
//   ActivityIndicator,
//   Image,
//   TextInput,
//   Modal,
//   Alert,
//   Linking,
//   Dimensions,
//   Platform,
// } from 'react-native';
// import { useSafeAreaInsets } from 'react-native-safe-area-context';
// import MapView, { Marker, PROVIDER_GOOGLE } from 'react-native-maps';
// import { Ionicons } from '@expo/vector-icons';
// import * as Location from 'expo-location';
// import axios from 'axios';
// import { API_BASE_URL } from "../config/config_ip";
// import { useAuth } from '../context/AuthContext';
// import { Colors } from '../constants/Colors';
// import io from 'socket.io-client';
// import { CameraView, useCameraPermissions } from 'expo-camera';

// const { width, height } = Dimensions.get('window');

// const buildImageUrl = (url) => {
//   if (!url) return null;
//   if (url.startsWith('http://') || url.startsWith('https://')) return url;
//   return `${API_BASE_URL}${url.startsWith('/') ? url : `/${url}`}`;
// };

// const getInitials = (name) => {
//   if (!name) return 'D';
//   const parts = name.trim().split(' ').filter(Boolean);
//   if (parts.length > 1) return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
//   return parts[0].slice(0, 2).toUpperCase();
// };

// export default function OngoingRideRiderScreen({ route, navigation }) {
//   const { bookingId, sessionId: initialSessionId } = route.params || {};
//   const { user } = useAuth();
//   const insets = useSafeAreaInsets();

//   const [session, setSession] = useState(null);
//   const [refreshing, setRefreshing] = useState(false);
//   const [loading, setLoading] = useState(true);
//   const [driverLocation, setDriverLocation] = useState(null);
//   const [userLocation, setUserLocation] = useState(null);
//   const [driverETA, setDriverETA] = useState(null);
//   const [driverDistance, setDriverDistance] = useState(null);
//   const [arrivalTime, setArrivalTime] = useState(null);
//   const [socketConnected, setSocketConnected] = useState(false);
//   const [showQRModal, setShowQRModal] = useState(false);
//   const [qrInput, setQrInput] = useState('');
//   const [showRatingModal, setShowRatingModal] = useState(false);
//   const [rating, setRating] = useState(0);
//   const [feedback, setFeedback] = useState('');
//   const [hasReachedPickup, setHasReachedPickup] = useState(false);
//   const [hasRatedDriver, setHasRatedDriver] = useState(false);
//   const [showRouteDetailsOnly, setShowRouteDetailsOnly] = useState(false);
//   const [rideCompleted, setRideCompleted] = useState(false);
//   const [submitting, setSubmitting] = useState(false);
//   const [scannerVisible, setScannerVisible] = useState(false);
//   const [scanned, setScanned] = useState(false);
//   const [syncInProgress, setSyncInProgress] = useState(false);
  
//   const mapRef = useRef(null);
//   const socketRef = useRef(null);
//   const locationIntervalRef = useRef(null);
//   const syncIntervalRef = useRef(null);
  
//   const [permission, requestPermission] = useCameraPermissions();

//   const calculateDistance = (lat1, lon1, lat2, lon2) => {
//     const R = 6371000;
//     const dLat = (lat2 - lat1) * Math.PI / 180;
//     const dLon = (lon2 - lon1) * Math.PI / 180;
//     const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
//               Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
//               Math.sin(dLon/2) * Math.sin(dLon/2);
//     const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
//     return R * c;
//   };

//   const formatDistance = (meters) => {
//     if (!meters) return 'Unknown';
//     if (meters < 1000) {
//       return `${Math.round(meters)} m`;
//     }
//     return `${(meters / 1000).toFixed(1)} km`;
//   };

//   const calculateArrivalTime = (distance) => {
//     const minutes = Math.ceil(distance / 500);
//     const arrivalDate = new Date();
//     arrivalDate.setMinutes(arrivalDate.getMinutes() + minutes);
//     return arrivalDate.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });
//   };

//   const requestLocationPermission = async () => {
//     try {
//       const { status } = await Location.requestForegroundPermissionsAsync();
//       if (status !== 'granted') {
//         console.log('Location permission denied');
//         return false;
//       }
//       return true;
//     } catch (error) {
//       console.log('Location permission error:', error);
//       return false;
//     }
//   };

//   const getUserLocation = async () => {
//     try {
//       const hasPermission = await requestLocationPermission();
//       if (!hasPermission) return;
      
//       const location = await Location.getCurrentPositionAsync({
//         accuracy: Location.Accuracy.High,
//       });
      
//       const newLocation = {
//         latitude: location.coords.latitude,
//         longitude: location.coords.longitude,
//       };
//       setUserLocation(newLocation);
//       return newLocation;
//     } catch (error) {
//       console.log('Error getting location:', error);
//       return null;
//     }
//   };

//   const checkSessionStatus = async () => {
//     if (!bookingId || bookingId === 3) {
//       return null;
//     }
    
//     try {
//       const res = await axios.get(`${API_BASE_URL}/ride-sessions/rider/session-status/${bookingId}`, {
//         params: { rider_phone: user?.phone_number }
//       });
      
//       const data = res.data;
//       console.log('Session status check:', data);
      
//       if (data.ride_completed) {
//         setRideCompleted(true);
//         setHasRatedDriver(data.has_rated_driver);
        
//         if (data.has_rated_driver) {
//           setShowRouteDetailsOnly(true);
//           setShowRatingModal(false);
//         } else if (!data.has_rated_driver) {
//           setShowRatingModal(true);
//         }
//       }
      
//       return data;
//     } catch (error) {
//       console.log('Error checking session status:', error);
//       return null;
//     }
//   };

//   const syncSessionState = async () => {
//     if (!session?.session_id || syncInProgress || rideCompleted) return;
    
//     setSyncInProgress(true);
//     try {
//       const response = await axios.post(`${API_BASE_URL}/ride-sessions/${session.session_id}/sync`, {
//         driver_phone: session.driver_phone
//       });
      
//       if (response.data.success) {
//         // Update session state if needed
//         if (response.data.current_phase !== session.current_phase) {
//           setSession(prev => ({
//             ...prev,
//             current_phase: response.data.current_phase,
//             rider_status: response.data.rider_status
//           }));
//         }
        
//         // Update driver location if available
//         if (response.data.current_lat && response.data.current_lng) {
//           setDriverLocation({
//             latitude: response.data.current_lat,
//             longitude: response.data.current_lng
//           });
//         }
//       }
//     } catch (error) {
//       console.log('Sync error:', error);
//     } finally {
//       setSyncInProgress(false);
//     }
//   };

//   const connectSocket = useCallback(async (sessionId) => {
//     if (!sessionId) return;
    
//     if (socketRef.current && socketRef.current.connected) {
//       console.log('Socket already connected');
//       return;
//     }
    
//     try {
//       if (socketRef.current) {
//         socketRef.current.disconnect();
//       }
      
//       console.log('🔌 Connecting to socket server...');
//       const socket = io(API_BASE_URL, {
//         transports: ['websocket', 'polling'],
//         reconnection: true,
//         reconnectionAttempts: 10,
//         reconnectionDelay: 2000,
//         reconnectionDelayMax: 10000,
//         timeout: 10000,
//         auth: {
//           token: user?.phone_number,
//           userType: 'rider'
//         }
//       });
      
//       socketRef.current = socket;
      
//       socket.on('connect', () => {
//         console.log('✅ Socket connected!');
//         setSocketConnected(true);
//         socket.emit('join-ride-room', sessionId);
//         console.log('📡 Joined ride room:', sessionId);
        
//         if (user?.phone_number) {
//           socket.emit('join-user-room', user.phone_number);
//         }
        
//         socket.emit('get-driver-location', { session_id: sessionId });
//       });
      
//       socket.on('connect_error', (error) => {
//         console.log('❌ Socket connection error:', error.message);
//         setSocketConnected(false);
//       });
      
//       socket.on('disconnect', (reason) => {
//         console.log('🔌 Socket disconnected:', reason);
//         setSocketConnected(false);
//       });
      
//       socket.on('reconnect', () => {
//         console.log('Socket reconnected');
//         setSocketConnected(true);
//         if (sessionId) {
//           socket.emit('join-ride-room', sessionId);
//         }
//         if (user?.phone_number) {
//           socket.emit('join-user-room', user.phone_number);
//         }
//       });
      
//       socket.on('driver-location-update', (location) => {
//         console.log('📍 Driver location update received:', location);
//         const newLocation = {
//           latitude: location.latitude,
//           longitude: location.longitude,
//         };
//         setDriverLocation(newLocation);
        
//         if (session?.pickup_lat && session?.pickup_lng && session?.rider_status === 'accepted') {
//           const dist = calculateDistance(
//             location.latitude,
//             location.longitude,
//             session.pickup_lat,
//             session.pickup_lng
//           );
//           setDriverDistance(dist);
//           const etaMinutes = Math.ceil(dist / 500);
//           setDriverETA(etaMinutes);
//           setArrivalTime(calculateArrivalTime(dist));
//         }
        
//         if (mapRef.current && userLocation) {
//           const coordinates = [
//             { latitude: location.latitude, longitude: location.longitude },
//             { latitude: userLocation.latitude, longitude: userLocation.longitude },
//           ];
//           mapRef.current.fitToCoordinates(coordinates, {
//             edgePadding: { top: 100, right: 50, bottom: 200, left: 50 },
//             animated: true,
//           });
//         }
//       });
      
//       socket.on('ride-started', (data) => {
//         console.log('🚗 Ride started event:', data);
//         Alert.alert('Ride Started', 'The driver has started the ride!');
//         fetchSession();
//       });
      
//       socket.on('rider-boarded', (data) => {
//         console.log('✅ Rider boarded event:', data);
//         if (data.rider_phone === user?.phone_number) {
//           Alert.alert('Boarded', 'You have been boarded successfully!');
//           fetchSession();
//         }
//       });
      
//       socket.on('boarding-confirmed', (data) => {
//         console.log('✅ Boarding confirmed:', data);
//         Alert.alert('Boarded', 'You have been boarded successfully!');
//         fetchSession();
//       });
      
//       socket.on('rider-dropped-off', (data) => {
//         console.log('🏁 Rider dropped off event:', data);
//         if (data.rider_phone === user?.phone_number) {
//           Alert.alert('Trip Update', 'You have been dropped off. Please confirm to complete the ride.');
//           fetchSession();
//         }
//       });
      
//       socket.on('ride-auto-cancelled', (data) => {
//         console.log('❌ Ride auto-cancelled:', data);
//         Alert.alert('Ride Cancelled', data.reason || 'The ride has been auto-cancelled.');
//         navigation.goBack();
//       });
      
//       socket.on('ride-completed', (data) => {
//         console.log('✅ Ride completed:', data);
//         setRideCompleted(true);
//         checkSessionStatus();
//       });
      
//       socket.on('ride-completed-by-driver', (data) => {
//         console.log('🚗 Ride completed by driver:', data);
//         setRideCompleted(true);
//         checkSessionStatus();
//         Alert.alert('Ride Completed', 'The driver has completed the ride. You can now rate your experience.');
//       });
      
//     } catch (error) {
//       console.log('❌ Socket connection error:', error);
//     }
//   }, [session?.pickup_lat, session?.pickup_lng, session?.rider_status, userLocation, user?.phone_number]);

//   const fetchSession = useCallback(async () => {
//     if (!bookingId || bookingId === 3) {
//       console.log('Invalid booking ID:', bookingId);
//       setLoading(false);
//       return;
//     }
    
//     try {
//       console.log('📡 Fetching session for booking:', bookingId);
//       const res = await axios.get(`${API_BASE_URL}/ride-sessions/rider/session-status/${bookingId}`, {
//         params: { rider_phone: user?.phone_number },
//       });
      
//       console.log('✅ Rider session fetched:', res.data);
      
//       if (res.data.has_session === false) {
//         console.log('No active session found');
//         setLoading(false);
//         return;
//       }
      
//       const sessionData = {
//         session_id: res.data.session_id,
//         booking_id: res.data.booking_id,
//         ride_id: res.data.ride_id,
//         rider_status: res.data.rider_status,
//         session_status: res.data.session_status,
//         current_phase: res.data.current_phase,
//         has_rated_driver: res.data.has_rated_driver,
//         driver_rating: res.data.driver_rating,
//         driver_name: res.data.driver_name,
//         driver_phone: res.data.driver_phone,
//         driver_photo: res.data.driver_photo,
//         driver_rating_avg: res.data.driver_rating_avg,
//         origin: res.data.origin,
//         destination: res.data.destination,
//         pickup_lat: res.data.pickup_lat,
//         pickup_lng: res.data.pickup_lng,
//         dropoff_lat: res.data.dropoff_lat,
//         dropoff_lng: res.data.dropoff_lng,
//         route_coordinates: res.data.route_coordinates,
//       };
      
//       setSession(sessionData);
      
//       if (res.data.driver_location_lat && res.data.driver_location_lng) {
//         setDriverLocation({
//           latitude: res.data.driver_location_lat,
//           longitude: res.data.driver_location_lng
//         });
//       }
      
//       if (res.data.rider_status === 'reached_pickup') {
//         setHasReachedPickup(true);
//       }
      
//       if (res.data.ride_completed) {
//         setRideCompleted(true);
//         setHasRatedDriver(res.data.has_rated_driver);
//         if (!res.data.has_rated_driver) {
//           setShowRatingModal(true);
//         } else {
//           setShowRouteDetailsOnly(true);
//         }
//       }
      
//       if (res.data.session_id && 
//           (res.data.rider_status === 'accepted' || res.data.rider_status === 'boarded' || res.data.rider_status === 'dropped_off') &&
//           !rideCompleted) {
//         connectSocket(res.data.session_id);
//       }
      
//     } catch (error) {
//       console.log('❌ Rider session fetch error:', error?.response?.data || error.message);
//     } finally {
//       setLoading(false);
//       setRefreshing(false);
//     }
//   }, [bookingId, user?.phone_number, connectSocket, rideCompleted]);

//   useEffect(() => {
//     if (!bookingId || bookingId === 3) {
//       Alert.alert('Invalid Booking', 'This booking ID is invalid. Please go back and try again.');
//       setLoading(false);
//       return;
//     }
    
//     fetchSession();
//     getUserLocation();
//     checkSessionStatus();
    
//     // Regular polling as backup
//     const pollInterval = setInterval(() => {
//       if (!socketConnected && !rideCompleted) {
//         fetchSession();
//       }
//     }, 30000);
    
//     // Location polling
//     const locationTimer = setInterval(() => {
//       getUserLocation();
//     }, 10000);
    
//     // Session sync interval
//     syncIntervalRef.current = setInterval(() => {
//       syncSessionState();
//     }, 30000);
    
//     return () => {
//       clearInterval(pollInterval);
//       clearInterval(locationTimer);
//       if (syncIntervalRef.current) {
//         clearInterval(syncIntervalRef.current);
//       }
//       if (socketRef.current) {
//         socketRef.current.disconnect();
//       }
//     };
//   }, []);

//   const onRefresh = () => {
//     setRefreshing(true);
//     fetchSession();
//     getUserLocation();
//     checkSessionStatus();
//     syncSessionState();
//   };

//   const handleReachedPickup = async () => {
//     if (!session?.session_id) return;
    
//     try {
//       await axios.post(`${API_BASE_URL}/ride-sessions/${session.session_id}/rider-reached-pickup`, {
//         booking_id: bookingId,
//         rider_phone: user?.phone_number,
//       });
//       setHasReachedPickup(true);
//       fetchSession();
//       Alert.alert('Success', 'Driver notified that you have reached the pickup location');
//     } catch (error) {
//       Alert.alert('Error', error?.response?.data?.detail || 'Could not notify driver');
//     }
//   };

//   const handleMarkDroppedOff = async () => {
//     if (!session?.session_id) return;
    
//     try {
//       await axios.post(`${API_BASE_URL}/ride-sessions/${session.session_id}/rider-dropped-off`, {
//         booking_id: bookingId,
//         rider_phone: user?.phone_number,
//       });
//       fetchSession();
//       Alert.alert('Success', 'You have been marked as dropped off. Please confirm to complete the ride.');
//     } catch (error) {
//       Alert.alert('Error', error?.response?.data?.detail || 'Could not mark drop off');
//     }
//   };

//   const handleMarkCompleted = async () => {
//     if (!session?.session_id) return;
    
//     try {
//       await axios.post(`${API_BASE_URL}/ride-sessions/${session.session_id}/rider-complete`, {
//         booking_id: bookingId,
//         rider_phone: user?.phone_number,
//       });
//       fetchSession();
//       setRideCompleted(true);
//       setShowRatingModal(true);
//     } catch (error) {
//       Alert.alert('Error', error?.response?.data?.detail || 'Could not complete ride');
//     }
//   };

//   const handleBoardWithToken = async () => {
//     if (!qrInput.trim()) {
//       Alert.alert('Error', 'Please enter the QR token');
//       return;
//     }
    
//     setSubmitting(true);
    
//     try {
//       const response = await axios.post(`${API_BASE_URL}/ride-sessions/rider/board-by-token`, {
//         qr_code_token: qrInput.trim(),
//         rider_phone: user?.phone_number,
//         booking_id: bookingId
//       });
      
//       console.log('Board response:', response.data);
      
//       if (response.data.success) {
//         setScannerVisible(false);
//         setShowQRModal(false);
//         setQrInput('');
//         Alert.alert('Boarded Successfully!', 'You have been boarded. Enjoy your ride!');
//         await fetchSession();
//       } else {
//         Alert.alert('Boarding Failed', response.data.message || 'Could not board. Please try again.');
//       }
//     } catch (error) {
//       console.error('Board error:', error);
//       const errorMsg = error?.response?.data?.detail || 'Failed to board. Please try again.';
      
//       if (errorMsg.includes('expired')) {
//         Alert.alert('QR Code Expired', 'The QR code has expired. Please ask the driver to refresh the code.');
//       } else {
//         Alert.alert('Error', errorMsg);
//       }
//     } finally {
//       setSubmitting(false);
//     }
//   };

//   const handleQRCodeScanned = async ({ data }) => {
//     if (!session?.session_id) {
//       Alert.alert('Error', 'Session not found. Please refresh and try again.');
//       setScanned(false);
//       return;
//     }
    
//     console.log('📱 QR Code scanned:', data);
    
//     setSubmitting(true);
    
//     try {
//       const response = await axios.post(`${API_BASE_URL}/ride-sessions/rider/board-by-token`, {
//         qr_code_token: data.trim(),
//         rider_phone: user?.phone_number,
//         booking_id: bookingId
//       });
      
//       console.log('Board response:', response.data);
      
//       if (response.data.success) {
//         setScannerVisible(false);
//         setScanned(false);
//         setQrInput('');
//         Alert.alert('Boarded Successfully!', 'You have been boarded. Enjoy your ride!');
//         await fetchSession();
//       } else {
//         Alert.alert('Boarding Failed', response.data.message || 'Could not board. Please try again.');
//       }
//     } catch (error) {
//       console.error('QR Code error:', error);
//       const errorMsg = error?.response?.data?.detail || error?.message || 'Failed to board. Please try again.';
      
//       if (errorMsg.includes('expired')) {
//         Alert.alert('QR Code Expired', 'The QR code has expired. Please ask the driver to refresh the code.');
//       } else {
//         Alert.alert('Boarding Failed', errorMsg);
//       }
//     } finally {
//       setSubmitting(false);
//       setTimeout(() => {
//         setScanned(false);
//       }, 2000);
//     }
//   };

//   const handleRateDriver = async () => {
//     if (!session?.session_id) return;
//     if (rating === 0) {
//       Alert.alert('Rating Required', 'Please select a rating before submitting');
//       return;
//     }
    
//     setSubmitting(true);
//     try {
//       const response = await axios.post(`${API_BASE_URL}/ride-sessions/${session.session_id}/rate-driver-once`, {
//         booking_id: bookingId,
//         rating,
//         feedback,
//       });
      
//       if (response.data.already_rated) {
//         Alert.alert('Already Rated', response.data.message);
//         setHasRatedDriver(true);
//         setShowRouteDetailsOnly(true);
//       } else {
//         Alert.alert('Thank You!', 'Your rating has been submitted');
//         setHasRatedDriver(true);
//         setShowRouteDetailsOnly(true);
//       }
      
//       setShowRatingModal(false);
//       setRating(0);
//       setFeedback('');
//       fetchSession();
//     } catch (error) {
//       Alert.alert('Error', error?.response?.data?.detail || 'Could not submit rating');
//     } finally {
//       setSubmitting(false);
//     }
//   };

//   const handleSOS = async () => {
//     Alert.alert(
//       'Emergency SOS',
//       'This will notify your emergency contacts. Are you sure?',
//       [
//         { text: 'Cancel', style: 'cancel' },
//         {
//           text: 'Trigger SOS',
//           style: 'destructive',
//           onPress: async () => {
//             try {
//               await axios.post(`${API_BASE_URL}/ride-sessions/${session.session_id}/sos`, {
//                 note: 'SOS triggered by rider',
//                 rider_phone: user?.phone_number,
//               });
//               Alert.alert('SOS Triggered', 'Your emergency contacts have been notified');
//             } catch (error) {
//               Alert.alert('Error', 'Could not trigger SOS');
//             }
//           },
//         },
//       ]
//     );
//   };

//   const handleShareTrip = async () => {
//     const message = `I'm on a ride from ${session?.origin || 'pickup'} to ${session?.destination || 'destination'}. Track my ride live!`;
//     try {
//       await Linking.openURL(`sms:&body=${encodeURIComponent(message)}`);
//     } catch (error) {
//       Alert.alert('Error', 'Could not share trip');
//     }
//   };

//   const handleCallDriver = () => {
//     if (session?.driver_phone) {
//       Linking.openURL(`tel:${session.driver_phone}`);
//     } else {
//       Alert.alert('Error', 'Driver phone number not available');
//     }
//   };

//   const viewRouteDetails = () => {
//     navigation.navigate('ViewRouteRequestScreen', {
//       ride: {
//         id: session?.ride_id,
//         origin: session?.origin,
//         destination: session?.destination,
//         route_coordinates: session?.route_coordinates,
//       },
//       booking: { id: bookingId }
//     });
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

//   const QRScannerModal = () => {
//     if (!permission) {
//       return (
//         <Modal visible={scannerVisible} animationType="slide" transparent={false}>
//           <View style={styles.scannerContainer}>
//             <View style={styles.scannerHeader}>
//               <Text style={styles.scannerTitle}>Scan Boarding QR Code</Text>
//               <TouchableOpacity onPress={() => setScannerVisible(false)} style={styles.scannerCloseBtn}>
//                 <Ionicons name="close" size={28} color="#fff" />
//               </TouchableOpacity>
//             </View>
//             <View style={styles.scannerPermissionContainer}>
//               <ActivityIndicator size="large" color="#10B981" />
//               <Text style={styles.scannerPermissionText}>Loading camera...</Text>
//             </View>
//           </View>
//         </Modal>
//       );
//     }

//     if (!permission.granted) {
//       return (
//         <Modal visible={scannerVisible} animationType="slide" transparent={false}>
//           <View style={styles.scannerContainer}>
//             <View style={styles.scannerHeader}>
//               <Text style={styles.scannerTitle}>Scan Boarding QR Code</Text>
//               <TouchableOpacity onPress={() => setScannerVisible(false)} style={styles.scannerCloseBtn}>
//                 <Ionicons name="close" size={28} color="#fff" />
//               </TouchableOpacity>
//             </View>
//             <View style={styles.scannerPermissionContainer}>
//               <Ionicons name="camera-off" size={60} color="#fff" />
//               <Text style={styles.scannerPermissionText}>Camera permission is required to scan QR codes</Text>
//               <TouchableOpacity 
//                 style={styles.scannerGrantBtn}
//                 onPress={requestPermission}>
//                 <Text style={styles.scannerGrantBtnText}>Grant Permission</Text>
//               </TouchableOpacity>
//               <TouchableOpacity 
//                 style={styles.scannerManualBtn}
//                 onPress={() => {
//                   setScannerVisible(false);
//                   setShowQRModal(true);
//                 }}>
//                 <Text style={styles.scannerManualBtnText}>Enter Code Manually</Text>
//               </TouchableOpacity>
//             </View>
//           </View>
//         </Modal>
//       );
//     }

//     return (
//       <Modal visible={scannerVisible} animationType="slide" transparent={false}>
//         <View style={styles.scannerContainer}>
//           <View style={styles.scannerHeader}>
//             <Text style={styles.scannerTitle}>Scan Boarding QR Code</Text>
//             <TouchableOpacity onPress={() => {
//               setScannerVisible(false);
//               setScanned(false);
//             }} style={styles.scannerCloseBtn}>
//               <Ionicons name="close" size={28} color="#fff" />
//             </TouchableOpacity>
//           </View>
          
//           <CameraView
//             style={StyleSheet.absoluteFillObject}
//             facing="back"
//             barcodeScannerSettings={{
//               barcodeTypes: ['qr'],
//             }}
//             onBarcodeScanned={scanned ? undefined : handleQRCodeScanned}
//           >
//             <View style={styles.scannerOverlay}>
//               <View style={styles.scannerFrame} />
//               <Text style={styles.scannerInstruction}>
//                 Position the QR code within the frame
//               </Text>
//               <TouchableOpacity 
//                 style={styles.scannerManualButton}
//                 onPress={() => {
//                   setScannerVisible(false);
//                   setShowQRModal(true);
//                 }}>
//                 <Text style={styles.scannerManualButtonText}>Enter Code Manually</Text>
//               </TouchableOpacity>
//             </View>
//           </CameraView>
//         </View>
//       </Modal>
//     );
//   };

//   const QRCodeInputModal = () => (
//     <Modal visible={showQRModal} animationType="slide" transparent>
//       <View style={styles.modalBackdrop}>
//         <View style={styles.qrInputModalCard}>
//           <View style={styles.qrInputHeader}>
//             <Text style={styles.qrInputTitle}>Enter Boarding Code</Text>
//             <TouchableOpacity onPress={() => {
//               setShowQRModal(false);
//               setQrInput('');
//             }}>
//               <Ionicons name="close" size={24} color="#6B7280" />
//             </TouchableOpacity>
//           </View>
          
//           <Text style={styles.qrInputSubtitle}>
//             Please enter the QR code token shown by the driver
//           </Text>
          
//           <TextInput
//             value={qrInput}
//             onChangeText={setQrInput}
//             placeholder="Enter QR token"
//             style={styles.qrInputField}
//             autoCapitalize="none"
//             autoCorrect={false}
//             editable={!submitting}
//           />
          
//           <TouchableOpacity 
//             style={[styles.qrInputButton, submitting && { opacity: 0.5 }]}
//             onPress={handleBoardWithToken}
//             disabled={submitting}
//           >
//             <Text style={styles.qrInputButtonText}>
//               {submitting ? 'Boarding...' : 'Board Ride'}
//             </Text>
//           </TouchableOpacity>
          
//           <TouchableOpacity 
//             style={styles.qrInputCancelButton}
//             onPress={() => {
//               setShowQRModal(false);
//               setQrInput('');
//             }}
//           >
//             <Text style={styles.qrInputCancelButtonText}>Cancel</Text>
//           </TouchableOpacity>
//         </View>
//       </View>
//     </Modal>
//   );

//   if (loading) {
//     return (
//       <SafeAreaView style={styles.centered}>
//         <ActivityIndicator size="large" color="#184080" />
//         <Text style={styles.loadingText}>Loading ride details...</Text>
//       </SafeAreaView>
//     );
//   }

//   if (!bookingId || bookingId === 3) {
//     return (
//       <SafeAreaView style={styles.centered}>
//         <Ionicons name="alert-circle-outline" size={60} color="#DC2626" />
//         <Text style={styles.errorTitle}>Invalid Booking</Text>
//         <Text style={styles.errorText}>This booking could not be found.</Text>
//         <TouchableOpacity style={styles.goBackBtn} onPress={() => navigation.goBack()}>
//           <Text style={styles.goBackBtnText}>Go Back</Text>
//         </TouchableOpacity>
//       </SafeAreaView>
//     );
//   }

//   const riderStatus = session?.rider_status;
//   const isWaitingForDriver = riderStatus === 'accepted';
//   const isReachedPickup = riderStatus === 'reached_pickup' || hasReachedPickup;
//   const isBoarded = riderStatus === 'boarded';
//   const isDroppedOff = riderStatus === 'dropped_off';

//   const showDriverETA = isWaitingForDriver && driverETA && !isReachedPickup;
//   const showReachedPickupButton = isWaitingForDriver && !isReachedPickup && !rideCompleted;
//   const showQRButton = isReachedPickup && !isBoarded && !rideCompleted;
//   const showDroppedOffButton = isBoarded && !isDroppedOff && !rideCompleted;
//   const showCompleteButton = isDroppedOff && !rideCompleted;

//   const initialRegion = driverLocation ? {
//     latitude: driverLocation.latitude,
//     longitude: driverLocation.longitude,
//     latitudeDelta: 0.01,
//     longitudeDelta: 0.01,
//   } : userLocation ? {
//     latitude: userLocation.latitude,
//     longitude: userLocation.longitude,
//     latitudeDelta: 0.02,
//     longitudeDelta: 0.02,
//   } : {
//     latitude: session?.pickup_lat || 28.6139,
//     longitude: session?.pickup_lng || 77.2090,
//     latitudeDelta: 0.02,
//     longitudeDelta: 0.02,
//   };

//   return (
//     <SafeAreaView style={styles.container}>
//       <StatusBar barStyle="dark-content" backgroundColor={Colors.white} />

//       <View style={[styles.header, { paddingTop: insets.top > 0 ? insets.top : 12 }]}>
//         <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
//           <Ionicons name="chevron-back" size={24} color={Colors.primary} />
//         </TouchableOpacity>
//         <Text style={styles.headerTitle}>Ride Tracker</Text>
//         <TouchableOpacity style={styles.sosButton} onPress={handleSOS}>
//           <Ionicons name="shield-outline" size={24} color="#E11D48" />
//         </TouchableOpacity>
//       </View>

//       {__DEV__ && (
//         <View style={styles.debugStatus}>
//           <Text style={[styles.debugText, socketConnected ? styles.debugConnected : styles.debugDisconnected]}>
//             {socketConnected ? '● Live Tracking Active' : '○ Connecting...'}
//           </Text>
//         </View>
//       )}

//       <View style={styles.mapContainer}>
//         <MapView
//           ref={mapRef}
//           provider={PROVIDER_GOOGLE}
//           style={styles.map}
//           initialRegion={initialRegion}
//           showsUserLocation={true}
//           showsMyLocationButton={true}
//           zoomEnabled={true}
//         >
//           {driverLocation && (
//             <Marker coordinate={driverLocation} anchor={{ x: 0.5, y: 0.5 }}>
//               <View style={styles.driverMarker}>
//                 <View style={styles.driverMarkerPulse} />
//                 <Ionicons name="car-sport" size={28} color="#184080" />
//                 <View style={styles.driverMarkerDot} />
//               </View>
//             </Marker>
//           )}

//           {session?.pickup_lat && session?.pickup_lng && !isBoarded && !rideCompleted && (
//             <Marker
//               coordinate={{
//                 latitude: session.pickup_lat,
//                 longitude: session.pickup_lng,
//               }}
//               anchor={{ x: 0.5, y: 1 }}
//             >
//               <View style={styles.pickupMarker}>
//                 <View style={styles.pickupMarkerBubble}>
//                   <Ionicons name="location" size={16} color="#10B981" />
//                 </View>
//                 <View style={styles.pickupMarkerPointer} />
//                 <Text style={styles.pickupMarkerLabel}>Pickup</Text>
//               </View>
//             </Marker>
//           )}

//           {session?.dropoff_lat && session?.dropoff_lng && !isDroppedOff && !rideCompleted && (
//             <Marker
//               coordinate={{
//                 latitude: session.dropoff_lat,
//                 longitude: session.dropoff_lng,
//               }}
//               anchor={{ x: 0.5, y: 1 }}
//             >
//               <View style={styles.dropoffMarker}>
//                 <View style={styles.dropoffMarkerBubble}>
//                   <Ionicons name="flag" size={16} color="#EF4444" />
//                 </View>
//                 <View style={styles.dropoffMarkerPointer} />
//                 <Text style={styles.dropoffMarkerLabel}>Dropoff</Text>
//               </View>
//             </Marker>
//           )}
//         </MapView>
//       </View>

//       <ScrollView
//         style={styles.bottomSheet}
//         contentContainerStyle={[styles.bottomSheetContent, { paddingBottom: insets.bottom + 20 }]}
//         showsVerticalScrollIndicator={false}
//         refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
//       >
//         {showRouteDetailsOnly ? (
//           <View style={styles.completedRouteContainer}>
//             <Ionicons name="checkmark-circle" size={48} color="#10B981" />
//             <Text style={styles.completedTitle}>Ride Completed!</Text>
//             <Text style={styles.completedSubtitle}>Thank you for riding with us</Text>
            
//             <TouchableOpacity style={styles.viewRouteBtn} onPress={viewRouteDetails}>
//               <Ionicons name="map-outline" size={20} color="#fff" />
//               <Text style={styles.viewRouteBtnText}>View Route Details</Text>
//             </TouchableOpacity>
//           </View>
//         ) : (
//           <>
//             <View style={[
//               styles.statusBanner, 
//               { backgroundColor: rideCompleted ? '#F3F4F6' : isBoarded ? '#DCFCE7' : isReachedPickup ? '#DCFCE7' : '#EFF6FF' }
//             ]}>
//               <Ionicons
//                 name={rideCompleted ? 'checkmark-done-circle' : isBoarded ? 'car-sport' : isReachedPickup ? 'checkmark-circle' : 'time-outline'}
//                 size={24}
//                 color={rideCompleted ? '#6B7280' : isBoarded ? '#16A34A' : isReachedPickup ? '#10B981' : '#F59E0B'}
//               />
//               <View style={styles.statusBannerText}>
//                 <Text style={[styles.statusBannerTitle, { color: rideCompleted ? '#374151' : isBoarded ? '#166534' : isReachedPickup ? '#065A46' : '#92400E' }]}>
//                   {rideCompleted ? 'Ride Completed' : isBoarded ? 'Onboard - Ride in Progress' : isReachedPickup ? 'Ready to Board' : isWaitingForDriver ? 'Driver is on the way' : 'Waiting for driver'}
//                 </Text>
//                 <Text style={[styles.statusBannerSub, { color: rideCompleted ? '#6B7280' : isBoarded ? '#166534' : isReachedPickup ? '#065A46' : '#92400E' }]}>
//                   {rideCompleted 
//                     ? 'Rate your experience with the driver' 
//                     : isBoarded 
//                     ? `Heading to ${session?.destination || 'destination'}` 
//                     : isReachedPickup 
//                     ? 'Please enter the driver\'s boarding code to board'
//                     : driverETA ? `${driverETA} mins away • ${formatDistance(driverDistance)}` : 'Waiting for driver to start...'}
//                 </Text>
//               </View>
//             </View>

//             {showDriverETA && (
//               <View style={styles.etaCard}>
//                 <View style={styles.etaIcon}>
//                   <Ionicons name="time-outline" size={24} color="#184080" />
//                 </View>
//                 <View style={styles.etaInfo}>
//                   <Text style={styles.etaLabel}>Driver arriving in</Text>
//                   <Text style={styles.etaValue}>{driverETA} mins</Text>
//                   {arrivalTime && <Text style={styles.etaTime}>~ {arrivalTime}</Text>}
//                 </View>
//                 <View style={styles.distanceBadge}>
//                   <Text style={styles.distanceText}>{formatDistance(driverDistance)}</Text>
//                 </View>
//               </View>
//             )}

//             {session?.driver_name && !rideCompleted && (
//               <View style={styles.driverCard}>
//                 <View style={styles.driverInfo}>
//                   {session?.driver_photo ? (
//                     <Image source={{ uri: buildImageUrl(session.driver_photo) }} style={styles.driverAvatar} />
//                   ) : (
//                     <View style={[styles.driverAvatar, styles.driverAvatarFallback]}>
//                       <Text style={styles.driverAvatarText}>{getInitials(session?.driver_name)}</Text>
//                     </View>
//                   )}
//                   <View style={styles.driverDetails}>
//                     <Text style={styles.driverName}>{session?.driver_name}</Text>
//                     <View style={styles.ratingRow}>
//                       <Ionicons name="star" size={14} color="#F59E0B" />
//                       <Text style={styles.ratingText}>{session?.driver_rating_avg || 4.9}</Text>
//                     </View>
//                   </View>
//                 </View>
//                 <View style={styles.driverActions}>
//                   <TouchableOpacity style={styles.callButton} onPress={handleCallDriver}>
//                     <Ionicons name="call-outline" size={20} color={Colors.primary} />
//                   </TouchableOpacity>
//                   <TouchableOpacity style={styles.chatButton} onPress={() => navigation.navigate('ChatScreen', {
//                     receiverPhone: session?.driver_phone,
//                     rideId: session?.ride_id,
//                     user: { name: session?.driver_name, phone: session?.driver_phone }
//                   })}>
//                     <Ionicons name="chatbubble-ellipses" size={20} color={Colors.primary} />
//                   </TouchableOpacity>
//                 </View>
//               </View>
//             )}

//             <View style={styles.tripCard}>
//               <Text style={styles.cardTitle}>Trip Details</Text>
              
//               <View style={styles.tripRow}>
//                 <View style={styles.tripIconCol}>
//                   <Ionicons name="ellipse" size={12} color={isReachedPickup ? '#10B981' : '#9CA3AF'} />
//                   <View style={[styles.dottedLine, isReachedPickup && { backgroundColor: '#10B981' }]} />
//                   <Ionicons name="flag" size={12} color={isDroppedOff ? '#10B981' : '#9CA3AF'} />
//                 </View>
//                 <View style={styles.tripTextCol}>
//                   <Text style={styles.tripLabel}>Pickup</Text>
//                   <Text style={[styles.tripValue, isReachedPickup && { color: '#10B981' }]}>
//                     {session?.origin || 'Pickup location'}
//                     {isReachedPickup && ' ✓'}
//                   </Text>
//                   <Text style={[styles.tripLabel, { marginTop: 16 }]}>Drop-off</Text>
//                   <Text style={[styles.tripValue, isDroppedOff && { color: '#10B981' }]}>
//                     {session?.destination || 'Drop-off location'}
//                     {isDroppedOff && ' ✓'}
//                   </Text>
//                 </View>
//               </View>
//             </View>

//             <TouchableOpacity style={styles.refreshLocationBtn} onPress={() => {
//               getUserLocation();
//               fetchSession();
//               syncSessionState();
//             }}>
//               <Ionicons name="refresh" size={20} color="#184080" />
//               <Text style={styles.refreshLocationText}>Refresh location</Text>
//             </TouchableOpacity>

//             {showReachedPickupButton && (
//               <TouchableOpacity style={styles.reachedPickupBtn} onPress={handleReachedPickup}>
//                 <Ionicons name="location" size={20} color="#fff" />
//                 <Text style={styles.reachedPickupBtnText}>I've Reached Pickup Location</Text>
//               </TouchableOpacity>
//             )}

//             {showQRButton && (
//               <>
//                 <View style={styles.boardingInstructionCard}>
//                   <Ionicons name="information-circle-outline" size={20} color="#184080" />
//                   <Text style={styles.boardingInstructionText}>
//                     Ask the driver for your personal boarding QR code. Each rider has a unique code.
//                   </Text>
//                 </View>
                
//                 <TouchableOpacity style={styles.scanQRBtn} onPress={() => setScannerVisible(true)}>
//                   <Ionicons name="qr-code" size={20} color="#fff" />
//                   <Text style={styles.scanQRBtnText}>Scan QR Code to Board</Text>
//                 </TouchableOpacity>
                
//                 <TouchableOpacity style={styles.manualCodeBtn} onPress={() => setShowQRModal(true)}>
//                   <Ionicons name="keypad-outline" size={20} color="#184080" />
//                   <Text style={styles.manualCodeBtnText}>Enter Code Manually</Text>
//                 </TouchableOpacity>
//               </>
//             )}

//             {showDroppedOffButton && (
//               <TouchableOpacity style={styles.droppedOffBtn} onPress={handleMarkDroppedOff}>
//                 <Ionicons name="flag" size={20} color="#fff" />
//                 <Text style={styles.droppedOffBtnText}>I've Reached My Destination</Text>
//               </TouchableOpacity>
//             )}

//             {showCompleteButton && (
//               <>
//                 <View style={styles.safetyCard}>
//                   <Ionicons name="shield-checkmark" size={24} color="#10B981" />
//                   <View>
//                     <Text style={styles.safetyTitle}>Safety Confirmation Required</Text>
//                     <Text style={styles.safetyText}>For your safety, please mark the ride as completed once you have safely reached your destination.</Text>
//                   </View>
//                 </View>
//                 <TouchableOpacity style={styles.completeBtn} onPress={handleMarkCompleted}>
//                   <Text style={styles.completeBtnText}>Mark Ride as Completed</Text>
//                 </TouchableOpacity>
//               </>
//             )}

//             {!rideCompleted && (
//               <View style={styles.actionButtons}>
//                 <TouchableOpacity style={styles.shareBtn} onPress={handleShareTrip}>
//                   <Ionicons name="share-social" size={20} color={Colors.primary} />
//                   <Text style={styles.shareBtnText}>Share Trip</Text>
//                 </TouchableOpacity>
//                 <TouchableOpacity style={styles.sosActionBtn} onPress={handleSOS}>
//                   <Ionicons name="alert-circle" size={20} color="#DC2626" />
//                   <Text style={styles.sosActionBtnText}>SOS</Text>
//                 </TouchableOpacity>
//               </View>
//             )}

//             <View style={styles.safetyNote}>
//               <Ionicons name="information-circle" size={16} color="#6B7280" />
//               <Text style={styles.safetyNoteText}>Always verify the driver and vehicle before boarding.</Text>
//             </View>
//           </>
//         )}
//       </ScrollView>

//       <QRScannerModal />
//       <QRCodeInputModal />

//       <Modal visible={showRatingModal} transparent animationType="fade">
//         <View style={styles.modalBackdrop}>
//           <View style={styles.modalCard}>
//             <Text style={styles.modalTitle}>Rate Your Experience</Text>
//             <Text style={styles.modalSub}>How was your ride with {session?.driver_name}?</Text>

//             {renderStars()}

//             <TextInput
//               value={feedback}
//               onChangeText={setFeedback}
//               placeholder="Tell us about your experience..."
//               multiline
//               numberOfLines={3}
//               style={styles.feedbackInput}
//               textAlignVertical="top"
//             />

//             <View style={styles.modalActions}>
//               <TouchableOpacity style={styles.skipBtn} onPress={() => setShowRatingModal(false)}>
//                 <Text style={styles.skipBtnText}>Later</Text>
//               </TouchableOpacity>
//               <TouchableOpacity 
//                 style={[styles.submitBtn, (rating === 0 || submitting) && { opacity: 0.5 }]} 
//                 onPress={handleRateDriver} 
//                 disabled={rating === 0 || submitting}
//               >
//                 <Text style={styles.submitBtnText}>{submitting ? 'Submitting...' : 'Submit Rating'}</Text>
//               </TouchableOpacity>
//             </View>
//           </View>
//         </View>
//       </Modal>
//     </SafeAreaView>
//   );
// }

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     backgroundColor: Colors.white,
//   },
//   centered: {
//     flex: 1,
//     justifyContent: 'center',
//     alignItems: 'center',
//     backgroundColor: Colors.white,
//     padding: 20,
//   },
//   loadingText: {
//     marginTop: 12,
//     fontSize: 14,
//     color: '#6B7280',
//   },
//   errorTitle: {
//     fontSize: 20,
//     fontWeight: '700',
//     color: '#DC2626',
//     marginTop: 16,
//   },
//   errorText: {
//     fontSize: 14,
//     color: '#6B7280',
//     marginTop: 8,
//     textAlign: 'center',
//   },
//   goBackBtn: {
//     marginTop: 20,
//     backgroundColor: Colors.primary,
//     paddingHorizontal: 30,
//     paddingVertical: 12,
//     borderRadius: 12,
//   },
//   goBackBtnText: {
//     color: '#fff',
//     fontWeight: '600',
//     fontSize: 16,
//   },
//   header: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     justifyContent: 'space-between',
//     paddingHorizontal: 16,
//     paddingBottom: 12,
//     backgroundColor: Colors.white,
//     borderBottomWidth: 0.5,
//     borderBottomColor: '#F3F4F6',
//   },
//   backButton: {
//     width: 40,
//     height: 40,
//     justifyContent: 'center',
//     alignItems: 'center',
//   },
//   headerTitle: {
//     fontSize: 20,
//     fontWeight: '700',
//     color: Colors.primary,
//   },
//   sosButton: {
//     width: 40,
//     height: 40,
//     justifyContent: 'center',
//     alignItems: 'center',
//   },
//   debugStatus: {
//     paddingHorizontal: 16,
//     paddingVertical: 4,
//     backgroundColor: '#F3F4F6',
//   },
//   debugText: {
//     fontSize: 10,
//     fontWeight: '500',
//   },
//   debugConnected: {
//     color: '#10B981',
//   },
//   debugDisconnected: {
//     color: '#EF4444',
//   },
//   mapContainer: {
//     height: height * 0.45,
//     width: '100%',
//     backgroundColor: '#E8EEF7',
//   },
//   map: {
//     flex: 1,
//   },
//   driverMarker: {
//     alignItems: 'center',
//     justifyContent: 'center',
//   },
//   driverMarkerPulse: {
//     position: 'absolute',
//     width: 50,
//     height: 50,
//     borderRadius: 25,
//     backgroundColor: 'rgba(24, 64, 128, 0.2)',
//   },
//   driverMarkerDot: {
//     position: 'absolute',
//     width: 12,
//     height: 12,
//     borderRadius: 6,
//     backgroundColor: '#184080',
//   },
//   pickupMarker: {
//     alignItems: 'center',
//   },
//   pickupMarkerBubble: {
//     width: 32,
//     height: 32,
//     borderRadius: 16,
//     backgroundColor: '#10B981',
//     alignItems: 'center',
//     justifyContent: 'center',
//     borderWidth: 2,
//     borderColor: '#fff',
//   },
//   pickupMarkerPointer: {
//     width: 0,
//     height: 0,
//     borderLeftWidth: 6,
//     borderRightWidth: 6,
//     borderTopWidth: 8,
//     borderLeftColor: 'transparent',
//     borderRightColor: 'transparent',
//     borderTopColor: '#10B981',
//     marginTop: -2,
//   },
//   pickupMarkerLabel: {
//     fontSize: 11,
//     fontWeight: '600',
//     color: '#10B981',
//     marginTop: 4,
//   },
//   dropoffMarker: {
//     alignItems: 'center',
//   },
//   dropoffMarkerBubble: {
//     width: 32,
//     height: 32,
//     borderRadius: 16,
//     backgroundColor: '#EF4444',
//     alignItems: 'center',
//     justifyContent: 'center',
//     borderWidth: 2,
//     borderColor: '#fff',
//   },
//   dropoffMarkerPointer: {
//     width: 0,
//     height: 0,
//     borderLeftWidth: 6,
//     borderRightWidth: 6,
//     borderTopWidth: 8,
//     borderLeftColor: 'transparent',
//     borderRightColor: 'transparent',
//     borderTopColor: '#EF4444',
//     marginTop: -2,
//   },
//   dropoffMarkerLabel: {
//     fontSize: 11,
//     fontWeight: '600',
//     color: '#EF4444',
//     marginTop: 4,
//   },
//   bottomSheet: {
//     flex: 1,
//     backgroundColor: Colors.white,
//   },
//   bottomSheetContent: {
//     paddingHorizontal: 16,
//     paddingTop: 12,
//   },
//   statusBanner: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     padding: 16,
//     borderRadius: 16,
//     marginBottom: 16,
//     gap: 12,
//   },
//   statusBannerText: {
//     flex: 1,
//   },
//   statusBannerTitle: {
//     fontSize: 16,
//     fontWeight: '700',
//   },
//   statusBannerSub: {
//     fontSize: 13,
//     marginTop: 2,
//   },
//   etaCard: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     backgroundColor: '#F0F7FF',
//     borderRadius: 16,
//     padding: 16,
//     marginBottom: 16,
//     gap: 12,
//     borderWidth: 1,
//     borderColor: '#E0ECFF',
//   },
//   etaIcon: {
//     width: 48,
//     height: 48,
//     borderRadius: 24,
//     backgroundColor: '#E8EEF9',
//     alignItems: 'center',
//     justifyContent: 'center',
//   },
//   etaInfo: {
//     flex: 1,
//   },
//   etaLabel: {
//     fontSize: 12,
//     color: '#6B7280',
//   },
//   etaValue: {
//     fontSize: 24,
//     fontWeight: '700',
//     color: '#184080',
//   },
//   etaTime: {
//     fontSize: 12,
//     color: '#6B7280',
//     marginTop: 2,
//   },
//   distanceBadge: {
//     backgroundColor: '#E8EEF9',
//     paddingHorizontal: 12,
//     paddingVertical: 6,
//     borderRadius: 20,
//   },
//   distanceText: {
//     fontSize: 14,
//     fontWeight: '600',
//     color: '#184080',
//   },
//   driverCard: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     justifyContent: 'space-between',
//     backgroundColor: '#F9FAFB',
//     borderRadius: 16,
//     padding: 16,
//     marginBottom: 16,
//     borderWidth: 1,
//     borderColor: '#E5E7EB',
//   },
//   driverInfo: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     flex: 1,
//   },
//   driverAvatar: {
//     width: 56,
//     height: 56,
//     borderRadius: 28,
//     marginRight: 12,
//   },
//   driverAvatarFallback: {
//     backgroundColor: '#E8EEF9',
//     alignItems: 'center',
//     justifyContent: 'center',
//   },
//   driverAvatarText: {
//     fontSize: 18,
//     fontWeight: '700',
//     color: Colors.primary,
//   },
//   driverDetails: {
//     flex: 1,
//   },
//   driverName: {
//     fontSize: 16,
//     fontWeight: '700',
//     color: '#111827',
//   },
//   ratingRow: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     gap: 4,
//     marginTop: 2,
//   },
//   ratingText: {
//     fontSize: 12,
//     color: '#6B7280',
//   },
//   driverActions: {
//     flexDirection: 'row',
//     gap: 12,
//   },
//   callButton: {
//     width: 40,
//     height: 40,
//     borderRadius: 20,
//     backgroundColor: '#E8EEF9',
//     alignItems: 'center',
//     justifyContent: 'center',
//   },
//   chatButton: {
//     width: 40,
//     height: 40,
//     borderRadius: 20,
//     backgroundColor: '#E8EEF9',
//     alignItems: 'center',
//     justifyContent: 'center',
//   },
//   tripCard: {
//     backgroundColor: '#F9FAFB',
//     borderRadius: 16,
//     padding: 16,
//     marginBottom: 16,
//     borderWidth: 1,
//     borderColor: '#E5E7EB',
//   },
//   cardTitle: {
//     fontSize: 16,
//     fontWeight: '700',
//     color: '#111827',
//     marginBottom: 12,
//   },
//   tripRow: {
//     flexDirection: 'row',
//     marginBottom: 16,
//   },
//   tripIconCol: {
//     alignItems: 'center',
//     width: 24,
//     marginRight: 12,
//   },
//   dottedLine: {
//     width: 2,
//     height: 30,
//     backgroundColor: '#D1D5DB',
//     marginVertical: 4,
//   },
//   tripTextCol: {
//     flex: 1,
//   },
//   tripLabel: {
//     fontSize: 12,
//     color: '#6B7280',
//     marginBottom: 2,
//   },
//   tripValue: {
//     fontSize: 14,
//     fontWeight: '500',
//     color: '#111827',
//   },
//   refreshLocationBtn: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     justifyContent: 'center',
//     gap: 8,
//     backgroundColor: '#F3F4F6',
//     borderRadius: 12,
//     paddingVertical: 10,
//     marginBottom: 16,
//   },
//   refreshLocationText: {
//     fontSize: 13,
//     color: '#184080',
//     fontWeight: '500',
//   },
//   reachedPickupBtn: {
//     backgroundColor: '#10B981',
//     borderRadius: 14,
//     paddingVertical: 16,
//     flexDirection: 'row',
//     alignItems: 'center',
//     justifyContent: 'center',
//     gap: 8,
//     marginBottom: 16,
//   },
//   reachedPickupBtnText: {
//     color: '#fff',
//     fontSize: 15,
//     fontWeight: '700',
//   },
//   scanQRBtn: {
//     backgroundColor: Colors.primary,
//     borderRadius: 14,
//     paddingVertical: 16,
//     flexDirection: 'row',
//     alignItems: 'center',
//     justifyContent: 'center',
//     gap: 8,
//     marginBottom: 12,
//   },
//   scanQRBtnText: {
//     color: '#fff',
//     fontSize: 15,
//     fontWeight: '700',
//   },
//   manualCodeBtn: {
//     backgroundColor: '#F3F4F6',
//     borderRadius: 14,
//     paddingVertical: 14,
//     flexDirection: 'row',
//     alignItems: 'center',
//     justifyContent: 'center',
//     gap: 8,
//     marginBottom: 16,
//     borderWidth: 1,
//     borderColor: '#E5E7EB',
//   },
//   manualCodeBtnText: {
//     color: '#184080',
//     fontSize: 14,
//     fontWeight: '600',
//   },
//   droppedOffBtn: {
//     backgroundColor: '#10B981',
//     borderRadius: 14,
//     paddingVertical: 16,
//     flexDirection: 'row',
//     alignItems: 'center',
//     justifyContent: 'center',
//     gap: 8,
//     marginBottom: 16,
//   },
//   droppedOffBtnText: {
//     color: '#fff',
//     fontSize: 15,
//     fontWeight: '700',
//   },
//   completeBtn: {
//     backgroundColor: Colors.primary,
//     borderRadius: 14,
//     paddingVertical: 16,
//     alignItems: 'center',
//     marginBottom: 16,
//   },
//   completeBtnText: {
//     color: '#fff',
//     fontSize: 15,
//     fontWeight: '700',
//   },
//   safetyCard: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     backgroundColor: '#FEF2F2',
//     borderRadius: 14,
//     padding: 16,
//     marginBottom: 16,
//     gap: 12,
//     borderWidth: 1,
//     borderColor: '#FEE2E2',
//   },
//   safetyTitle: {
//     fontSize: 14,
//     fontWeight: '700',
//     color: '#DC2626',
//   },
//   safetyText: {
//     fontSize: 12,
//     color: '#DC2626',
//     marginTop: 2,
//   },
//   actionButtons: {
//     flexDirection: 'row',
//     gap: 12,
//     marginBottom: 16,
//   },
//   shareBtn: {
//     flex: 1,
//     flexDirection: 'row',
//     alignItems: 'center',
//     justifyContent: 'center',
//     gap: 8,
//     backgroundColor: '#F3F4F6',
//     borderRadius: 14,
//     paddingVertical: 14,
//   },
//   shareBtnText: {
//     color: Colors.primary,
//     fontWeight: '600',
//     fontSize: 14,
//   },
//   sosActionBtn: {
//     flex: 1,
//     flexDirection: 'row',
//     alignItems: 'center',
//     justifyContent: 'center',
//     gap: 8,
//     backgroundColor: '#FEF2F2',
//     borderRadius: 14,
//     paddingVertical: 14,
//   },
//   sosActionBtnText: {
//     color: '#DC2626',
//     fontWeight: '600',
//     fontSize: 14,
//   },
//   safetyNote: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     justifyContent: 'center',
//     gap: 6,
//     paddingVertical: 12,
//   },
//   safetyNoteText: {
//     fontSize: 11,
//     color: '#6B7280',
//   },
//   modalBackdrop: {
//     flex: 1,
//     backgroundColor: 'rgba(17,24,39,0.45)',
//     justifyContent: 'center',
//     padding: 20,
//   },
//   modalCard: {
//     backgroundColor: '#fff',
//     borderRadius: 24,
//     padding: 20,
//   },
//   modalTitle: {
//     fontSize: 22,
//     fontWeight: '700',
//     color: '#111827',
//     textAlign: 'center',
//   },
//   modalSub: {
//     fontSize: 14,
//     color: '#6B7280',
//     textAlign: 'center',
//     marginTop: 8,
//     marginBottom: 18,
//   },
//   starsRow: {
//     flexDirection: 'row',
//     justifyContent: 'center',
//     marginBottom: 18,
//   },
//   feedbackInput: {
//     minHeight: 100,
//     borderWidth: 1,
//     borderColor: '#E5E7EB',
//     borderRadius: 16,
//     padding: 14,
//     color: '#111827',
//     fontSize: 14,
//   },
//   modalActions: {
//     flexDirection: 'row',
//     gap: 10,
//     marginTop: 18,
//   },
//   skipBtn: {
//     flex: 1,
//     borderWidth: 1,
//     borderColor: '#D1D5DB',
//     borderRadius: 999,
//     paddingVertical: 14,
//     alignItems: 'center',
//   },
//   skipBtnText: {
//     color: '#6B7280',
//     fontWeight: '600',
//   },
//   submitBtn: {
//     flex: 1,
//     backgroundColor: Colors.primary,
//     borderRadius: 999,
//     paddingVertical: 14,
//     alignItems: 'center',
//   },
//   submitBtnText: {
//     color: '#fff',
//     fontWeight: '700',
//   },
//   completedRouteContainer: {
//     alignItems: 'center',
//     paddingVertical: 40,
//     gap: 16,
//   },
//   completedTitle: {
//     fontSize: 22,
//     fontWeight: '700',
//     color: '#10B981',
//   },
//   completedSubtitle: {
//     fontSize: 14,
//     color: '#6B7280',
//     textAlign: 'center',
//   },
//   viewRouteBtn: {
//     backgroundColor: Colors.primary,
//     borderRadius: 14,
//     paddingVertical: 14,
//     paddingHorizontal: 24,
//     flexDirection: 'row',
//     alignItems: 'center',
//     gap: 8,
//     marginTop: 16,
//   },
//   viewRouteBtnText: {
//     color: '#fff',
//     fontSize: 16,
//     fontWeight: '600',
//   },
//   boardingInstructionCard: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     backgroundColor: '#EFF6FF',
//     borderRadius: 12,
//     padding: 12,
//     marginBottom: 16,
//     gap: 10,
//   },
//   boardingInstructionText: {
//     flex: 1,
//     fontSize: 12,
//     color: '#184080',
//     lineHeight: 18,
//   },
//   scannerContainer: {
//     flex: 1,
//     backgroundColor: '#000',
//   },
//   scannerHeader: {
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//     alignItems: 'center',
//     paddingHorizontal: 20,
//     paddingTop: Platform.OS === 'ios' ? 50 : 20,
//     paddingBottom: 12,
//     backgroundColor: '#000',
//     zIndex: 10,
//   },
//   scannerTitle: {
//     fontSize: 20,
//     fontWeight: '700',
//     color: '#fff',
//   },
//   scannerCloseBtn: {
//     padding: 8,
//   },
//   scannerOverlay: {
//     flex: 1,
//     backgroundColor: 'rgba(0,0,0,0.5)',
//     alignItems: 'center',
//     justifyContent: 'center',
//   },
//   scannerFrame: {
//     width: width * 0.7,
//     height: width * 0.7,
//     borderWidth: 2,
//     borderColor: '#10B981',
//     backgroundColor: 'transparent',
//     borderRadius: 12,
//   },
//   scannerInstruction: {
//     marginTop: 20,
//     color: '#fff',
//     fontSize: 14,
//     textAlign: 'center',
//   },
//   scannerManualButton: {
//     marginTop: 40,
//     paddingHorizontal: 20,
//     paddingVertical: 12,
//     backgroundColor: 'rgba(255,255,255,0.2)',
//     borderRadius: 12,
//   },
//   scannerManualButtonText: {
//     color: '#fff',
//     fontSize: 14,
//     fontWeight: '600',
//   },
//   scannerPermissionContainer: {
//     flex: 1,
//     alignItems: 'center',
//     justifyContent: 'center',
//     padding: 20,
//   },
//   scannerPermissionText: {
//     marginTop: 16,
//     color: '#fff',
//     fontSize: 16,
//     textAlign: 'center',
//   },
//   scannerGrantBtn: {
//     marginTop: 20,
//     backgroundColor: '#10B981',
//     paddingHorizontal: 24,
//     paddingVertical: 12,
//     borderRadius: 12,
//   },
//   scannerGrantBtnText: {
//     color: '#fff',
//     fontSize: 16,
//     fontWeight: '600',
//   },
//   scannerManualBtn: {
//     marginTop: 12,
//     backgroundColor: 'transparent',
//     paddingHorizontal: 24,
//     paddingVertical: 12,
//     borderRadius: 12,
//     borderWidth: 1,
//     borderColor: '#fff',
//   },
//   scannerManualBtnText: {
//     color: '#fff',
//     fontSize: 14,
//     fontWeight: '600',
//   },
//   qrInputModalCard: {
//     backgroundColor: '#fff',
//     borderRadius: 24,
//     padding: 20,
//     width: width - 40,
//   },
//   qrInputHeader: {
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//     alignItems: 'center',
//     marginBottom: 16,
//   },
//   qrInputTitle: {
//     fontSize: 20,
//     fontWeight: '700',
//     color: '#111827',
//   },
//   qrInputSubtitle: {
//     fontSize: 14,
//     color: '#6B7280',
//     marginBottom: 20,
//   },
//   qrInputField: {
//     borderWidth: 1,
//     borderColor: '#E5E7EB',
//     borderRadius: 12,
//     padding: 14,
//     fontSize: 16,
//     marginBottom: 20,
//     backgroundColor: '#F9FAFB',
//     fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
//   },
//   qrInputButton: {
//     backgroundColor: Colors.primary,
//     borderRadius: 12,
//     paddingVertical: 14,
//     alignItems: 'center',
//     marginBottom: 12,
//   },
//   qrInputButtonText: {
//     color: '#fff',
//     fontSize: 16,
//     fontWeight: '600',
//   },
//   qrInputCancelButton: {
//     backgroundColor: '#F3F4F6',
//     borderRadius: 12,
//     paddingVertical: 14,
//     alignItems: 'center',
//   },
//   qrInputCancelButtonText: {
//     color: '#6B7280',
//     fontSize: 16,
//     fontWeight: '600',
//   },
// });
import React, { useCallback, useEffect, useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  ScrollView,
  RefreshControl,
  ActivityIndicator,
  Image,
  TextInput,
  Modal,
  Alert,
  Linking,
  Dimensions,
  Platform,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import MapView, { Marker, PROVIDER_GOOGLE, Polyline } from 'react-native-maps';
import { Ionicons } from '@expo/vector-icons';
import * as Location from 'expo-location';
import axios from 'axios';
import { API_BASE_URL } from "../config/config_ip";
import { useAuth } from '../context/AuthContext';
import { Colors } from '../constants/Colors';
import io from 'socket.io-client';
import { CameraView, useCameraPermissions } from 'expo-camera';

const { width, height } = Dimensions.get('window');

const buildImageUrl = (url) => {
  if (!url) return null;
  if (url.startsWith('http://') || url.startsWith('https://')) return url;
  return `${API_BASE_URL}${url.startsWith('/') ? url : `/${url}`}`;
};

const getInitials = (name) => {
  if (!name) return 'D';
  const parts = name.trim().split(' ').filter(Boolean);
  if (parts.length > 1) return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
  return parts[0].slice(0, 2).toUpperCase();
};

// Polyline decoder function
const decodePolyline = (encoded) => {
  let points = [];
  let index = 0, len = encoded.length;
  let lat = 0, lng = 0;
  
  while (index < len) {
    let b, shift = 0, result = 0;
    do {
      b = encoded.charCodeAt(index++) - 63;
      result |= (b & 0x1f) << shift;
      shift += 5;
    } while (b >= 0x20);
    let dlat = ((result & 1) ? ~(result >> 1) : (result >> 1));
    lat += dlat;
    
    shift = 0;
    result = 0;
    do {
      b = encoded.charCodeAt(index++) - 63;
      result |= (b & 0x1f) << shift;
      shift += 5;
    } while (b >= 0x20);
    let dlng = ((result & 1) ? ~(result >> 1) : (result >> 1));
    lng += dlng;
    
    points.push({
      latitude: lat / 1e5,
      longitude: lng / 1e5
    });
  }
  return points;
};

export default function OngoingRideRiderScreen({ route, navigation }) {
  const { bookingId, sessionId: initialSessionId } = route.params || {};
  const { user } = useAuth();
  const insets = useSafeAreaInsets();

  const [session, setSession] = useState(null);
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [driverLocation, setDriverLocation] = useState(null);
  const [userLocation, setUserLocation] = useState(null);
  const [driverETA, setDriverETA] = useState(null);
  const [driverDistance, setDriverDistance] = useState(null);
  const [arrivalTime, setArrivalTime] = useState(null);
  const [socketConnected, setSocketConnected] = useState(false);
  const [showQRModal, setShowQRModal] = useState(false);
  const [qrInput, setQrInput] = useState('');
  const [showRatingModal, setShowRatingModal] = useState(false);
  const [rating, setRating] = useState(0);
  const [feedback, setFeedback] = useState('');
  const [hasReachedPickup, setHasReachedPickup] = useState(false);
  const [hasRatedDriver, setHasRatedDriver] = useState(false);
  const [showRouteDetailsOnly, setShowRouteDetailsOnly] = useState(false);
  const [rideCompleted, setRideCompleted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [scannerVisible, setScannerVisible] = useState(false);
  const [scanned, setScanned] = useState(false);
  const [syncInProgress, setSyncInProgress] = useState(false);
  
  // Path tracing states
  const [driverPath, setDriverPath] = useState([]);
  const [routePolyline, setRoutePolyline] = useState([]);
  const [rideProgress, setRideProgress] = useState(0);
  
  const mapRef = useRef(null);
  const socketRef = useRef(null);
  const locationIntervalRef = useRef(null);
  const syncIntervalRef = useRef(null);
  
  const [permission, requestPermission] = useCameraPermissions();

  const calculateDistance = (lat1, lon1, lat2, lon2) => {
    const R = 6371000;
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
              Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
              Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
  };

  const formatDistance = (meters) => {
    if (!meters) return 'Unknown';
    if (meters < 1000) {
      return `${Math.round(meters)} m`;
    }
    return `${(meters / 1000).toFixed(1)} km`;
  };

  const calculateArrivalTime = (distance) => {
    const minutes = Math.ceil(distance / 500);
    const arrivalDate = new Date();
    arrivalDate.setMinutes(arrivalDate.getMinutes() + minutes);
    return arrivalDate.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });
  };

  // Fetch route polyline between pickup and dropoff
  const fetchRoutePolyline = async (originLat, originLng, destLat, destLng) => {
    try {
      // Using OpenRouteService API (free)
      const response = await axios.get(
        `https://router.project-osrm.org/route/v1/driving/${originLng},${originLat};${destLng},${destLat}?overview=full&geometries=polyline`
      );
      
      if (response.data.routes && response.data.routes[0]) {
        const points = decodePolyline(response.data.routes[0].geometry);
        setRoutePolyline(points);
        return points;
      }
    } catch (error) {
      console.log('Error fetching route:', error);
      // Fallback to provided route coordinates if available
      if (session?.route_coordinates && session.route_coordinates.length > 0) {
        setRoutePolyline(session.route_coordinates);
      }
    }
  };

  // Calculate ride progress percentage
  const calculateRideProgress = useCallback(() => {
    if (!driverLocation || !session?.pickup_lat || !session?.pickup_lng || 
        !session?.dropoff_lat || !session?.dropoff_lng || rideCompleted) {
      return 0;
    }
    
    const totalDistance = calculateDistance(
      session.pickup_lat,
      session.pickup_lng,
      session.dropoff_lat,
      session.dropoff_lng
    );
    
    const remainingDistance = calculateDistance(
      driverLocation.latitude,
      driverLocation.longitude,
      session.dropoff_lat,
      session.dropoff_lng
    );
    
    const progress = Math.max(0, Math.min(100, ((totalDistance - remainingDistance) / totalDistance) * 100));
    return progress;
  }, [driverLocation, session, rideCompleted]);

  const requestLocationPermission = async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        console.log('Location permission denied');
        return false;
      }
      return true;
    } catch (error) {
      console.log('Location permission error:', error);
      return false;
    }
  };

  const getUserLocation = async () => {
    try {
      const hasPermission = await requestLocationPermission();
      if (!hasPermission) return;
      
      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.High,
      });
      
      const newLocation = {
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
      };
      setUserLocation(newLocation);
      return newLocation;
    } catch (error) {
      console.log('Error getting location:', error);
      return null;
    }
  };

  const checkSessionStatus = async () => {
    if (!bookingId || bookingId === 3) {
      return null;
    }
    
    try {
      const res = await axios.get(`${API_BASE_URL}/ride-sessions/rider/session-status/${bookingId}`, {
        params: { rider_phone: user?.phone_number }
      });
      
      const data = res.data;
      console.log('Session status check:', data);
      
      if (data.ride_completed) {
        setRideCompleted(true);
        setHasRatedDriver(data.has_rated_driver);
        
        if (data.has_rated_driver) {
          setShowRouteDetailsOnly(true);
          setShowRatingModal(false);
        } else if (!data.has_rated_driver) {
          setShowRatingModal(true);
        }
      }
      
      return data;
    } catch (error) {
      console.log('Error checking session status:', error);
      return null;
    }
  };

  const syncSessionState = async () => {
    if (!session?.session_id || syncInProgress || rideCompleted) return;
    
    setSyncInProgress(true);
    try {
      const response = await axios.post(`${API_BASE_URL}/ride-sessions/${session.session_id}/sync`, {
        driver_phone: session.driver_phone
      });
      
      if (response.data.success) {
        if (response.data.current_phase !== session.current_phase) {
          setSession(prev => ({
            ...prev,
            current_phase: response.data.current_phase,
            rider_status: response.data.rider_status
          }));
        }
        
        if (response.data.current_lat && response.data.current_lng) {
          const newLocation = {
            latitude: response.data.current_lat,
            longitude: response.data.current_lng
          };
          setDriverLocation(newLocation);
          
          // Add to driver path if not duplicate
          setDriverPath(prevPath => {
            const lastPoint = prevPath[prevPath.length - 1];
            if (!lastPoint || 
                (Math.abs(lastPoint.latitude - newLocation.latitude) > 0.00001 ||
                 Math.abs(lastPoint.longitude - newLocation.longitude) > 0.00001)) {
              return [...prevPath, newLocation];
            }
            return prevPath;
          });
        }
      }
    } catch (error) {
      console.log('Sync error:', error);
    } finally {
      setSyncInProgress(false);
    }
  };

  const connectSocket = useCallback(async (sessionId) => {
    if (!sessionId) return;
    
    if (socketRef.current && socketRef.current.connected) {
      console.log('Socket already connected');
      return;
    }
    
    try {
      if (socketRef.current) {
        socketRef.current.disconnect();
      }
      
      console.log('🔌 Connecting to socket server...');
      const socket = io(API_BASE_URL, {
        transports: ['websocket', 'polling'],
        reconnection: true,
        reconnectionAttempts: 10,
        reconnectionDelay: 2000,
        reconnectionDelayMax: 10000,
        timeout: 10000,
        auth: {
          token: user?.phone_number,
          userType: 'rider'
        }
      });
      
      socketRef.current = socket;
      
      socket.on('connect', () => {
        console.log('✅ Socket connected!');
        setSocketConnected(true);
        socket.emit('join-ride-room', sessionId);
        console.log('📡 Joined ride room:', sessionId);
        
        if (user?.phone_number) {
          socket.emit('join-user-room', user.phone_number);
        }
        
        socket.emit('get-driver-location', { session_id: sessionId });
      });
      
      socket.on('connect_error', (error) => {
        console.log('❌ Socket connection error:', error.message);
        setSocketConnected(false);
      });
      
      socket.on('disconnect', (reason) => {
        console.log('🔌 Socket disconnected:', reason);
        setSocketConnected(false);
      });
      
      socket.on('reconnect', () => {
        console.log('Socket reconnected');
        setSocketConnected(true);
        if (sessionId) {
          socket.emit('join-ride-room', sessionId);
        }
        if (user?.phone_number) {
          socket.emit('join-user-room', user.phone_number);
        }
      });
      
      socket.on('driver-location-update', (location) => {
        console.log('📍 Driver location update received:', location);
        const newLocation = {
          latitude: location.latitude,
          longitude: location.longitude,
        };
        setDriverLocation(newLocation);
        
        // Track driver's path for live tracing
        setDriverPath(prevPath => {
          const lastPoint = prevPath[prevPath.length - 1];
          if (!lastPoint || 
              (Math.abs(lastPoint.latitude - newLocation.latitude) > 0.00001 ||
               Math.abs(lastPoint.longitude - newLocation.longitude) > 0.00001)) {
            const newPath = [...prevPath, newLocation];
            // Limit path points to prevent memory issues (keep last 1000 points)
            if (newPath.length > 1000) {
              return newPath.slice(-1000);
            }
            return newPath;
          }
          return prevPath;
        });
        
        if (session?.pickup_lat && session?.pickup_lng && session?.rider_status === 'accepted') {
          const dist = calculateDistance(
            location.latitude,
            location.longitude,
            session.pickup_lat,
            session.pickup_lng
          );
          setDriverDistance(dist);
          const etaMinutes = Math.ceil(dist / 500);
          setDriverETA(etaMinutes);
          setArrivalTime(calculateArrivalTime(dist));
        }
        
        if (mapRef.current && userLocation) {
          const coordinates = [
            { latitude: location.latitude, longitude: location.longitude },
            { latitude: userLocation.latitude, longitude: userLocation.longitude },
          ];
          mapRef.current.fitToCoordinates(coordinates, {
            edgePadding: { top: 100, right: 50, bottom: 200, left: 50 },
            animated: true,
          });
        }
      });
      
      socket.on('ride-started', (data) => {
        console.log('🚗 Ride started event:', data);
        setDriverPath([]); // Reset path for new ride
        Alert.alert('Ride Started', 'The driver has started the ride!');
        fetchSession();
      });
      
      socket.on('rider-boarded', (data) => {
        console.log('✅ Rider boarded event:', data);
        if (data.rider_phone === user?.phone_number) {
          Alert.alert('Boarded', 'You have been boarded successfully!');
          fetchSession();
        }
      });
      
      socket.on('boarding-confirmed', (data) => {
        console.log('✅ Boarding confirmed:', data);
        Alert.alert('Boarded', 'You have been boarded successfully!');
        fetchSession();
      });
      
      socket.on('rider-dropped-off', (data) => {
        console.log('🏁 Rider dropped off event:', data);
        if (data.rider_phone === user?.phone_number) {
          Alert.alert('Trip Update', 'You have been dropped off. Please confirm to complete the ride.');
          fetchSession();
        }
      });
      
      socket.on('ride-auto-cancelled', (data) => {
        console.log('❌ Ride auto-cancelled:', data);
        Alert.alert('Ride Cancelled', data.reason || 'The ride has been auto-cancelled.');
        navigation.goBack();
      });
      
      socket.on('ride-completed', (data) => {
        console.log('✅ Ride completed:', data);
        setRideCompleted(true);
        checkSessionStatus();
      });
      
      socket.on('ride-completed-by-driver', (data) => {
        console.log('🚗 Ride completed by driver:', data);
        setRideCompleted(true);
        checkSessionStatus();
        Alert.alert('Ride Completed', 'The driver has completed the ride. You can now rate your experience.');
      });
      
    } catch (error) {
      console.log('❌ Socket connection error:', error);
    }
  }, [session?.pickup_lat, session?.pickup_lng, session?.rider_status, userLocation, user?.phone_number]);

  const fetchSession = useCallback(async () => {
    if (!bookingId || bookingId === 3) {
      console.log('Invalid booking ID:', bookingId);
      setLoading(false);
      return;
    }
    
    try {
      console.log('📡 Fetching session for booking:', bookingId);
      const res = await axios.get(`${API_BASE_URL}/ride-sessions/rider/session-status/${bookingId}`, {
        params: { rider_phone: user?.phone_number },
      });
      
      console.log('✅ Rider session fetched:', res.data);
      
      if (res.data.has_session === false) {
        console.log('No active session found');
        setLoading(false);
        return;
      }
      
      const sessionData = {
        session_id: res.data.session_id,
        booking_id: res.data.booking_id,
        ride_id: res.data.ride_id,
        rider_status: res.data.rider_status,
        session_status: res.data.session_status,
        current_phase: res.data.current_phase,
        has_rated_driver: res.data.has_rated_driver,
        driver_rating: res.data.driver_rating,
        driver_name: res.data.driver_name,
        driver_phone: res.data.driver_phone,
        driver_photo: res.data.driver_photo,
        driver_rating_avg: res.data.driver_rating_avg,
        origin: res.data.origin,
        destination: res.data.destination,
        pickup_lat: res.data.pickup_lat,
        pickup_lng: res.data.pickup_lng,
        dropoff_lat: res.data.dropoff_lat,
        dropoff_lng: res.data.dropoff_lng,
        route_coordinates: res.data.route_coordinates,
      };
      
      setSession(sessionData);
      
      if (res.data.driver_location_lat && res.data.driver_location_lng) {
        const driverLoc = {
          latitude: res.data.driver_location_lat,
          longitude: res.data.driver_location_lng
        };
        setDriverLocation(driverLoc);
        setDriverPath([driverLoc]); // Initialize path with current location
      }
      
      if (res.data.rider_status === 'reached_pickup') {
        setHasReachedPickup(true);
      }
      
      if (res.data.ride_completed) {
        setRideCompleted(true);
        setHasRatedDriver(res.data.has_rated_driver);
        if (!res.data.has_rated_driver) {
          setShowRatingModal(true);
        } else {
          setShowRouteDetailsOnly(true);
        }
      }
      
      if (res.data.session_id && 
          (res.data.rider_status === 'accepted' || res.data.rider_status === 'boarded' || res.data.rider_status === 'dropped_off') &&
          !rideCompleted) {
        connectSocket(res.data.session_id);
      }
      
      // Fetch route polyline if pickup and dropoff coordinates are available
      if (sessionData.pickup_lat && sessionData.pickup_lng && 
          sessionData.dropoff_lat && sessionData.dropoff_lng) {
        fetchRoutePolyline(
          sessionData.pickup_lat,
          sessionData.pickup_lng,
          sessionData.dropoff_lat,
          sessionData.dropoff_lng
        );
      }
      
    } catch (error) {
      console.log('❌ Rider session fetch error:', error?.response?.data || error.message);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [bookingId, user?.phone_number, connectSocket, rideCompleted]);

  // Update ride progress
  useEffect(() => {
    const progress = calculateRideProgress();
    setRideProgress(progress);
  }, [calculateRideProgress]);

  useEffect(() => {
    if (!bookingId || bookingId === 3) {
      Alert.alert('Invalid Booking', 'This booking ID is invalid. Please go back and try again.');
      setLoading(false);
      return;
    }
    
    fetchSession();
    getUserLocation();
    checkSessionStatus();
    
    // Regular polling as backup
    const pollInterval = setInterval(() => {
      if (!socketConnected && !rideCompleted) {
        fetchSession();
      }
    }, 30000);
    
    // Location polling
    const locationTimer = setInterval(() => {
      getUserLocation();
    }, 10000);
    
    // Session sync interval
    syncIntervalRef.current = setInterval(() => {
      syncSessionState();
    }, 30000);
    
    return () => {
      clearInterval(pollInterval);
      clearInterval(locationTimer);
      if (syncIntervalRef.current) {
        clearInterval(syncIntervalRef.current);
      }
      if (socketRef.current) {
        socketRef.current.disconnect();
      }
    };
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    fetchSession();
    getUserLocation();
    checkSessionStatus();
    syncSessionState();
  };

  const handleReachedPickup = async () => {
    if (!session?.session_id) return;
    
    try {
      await axios.post(`${API_BASE_URL}/ride-sessions/${session.session_id}/rider-reached-pickup`, {
        booking_id: bookingId,
        rider_phone: user?.phone_number,
      });
      setHasReachedPickup(true);
      fetchSession();
      Alert.alert('Success', 'Driver notified that you have reached the pickup location');
    } catch (error) {
      Alert.alert('Error', error?.response?.data?.detail || 'Could not notify driver');
    }
  };

  const handleMarkDroppedOff = async () => {
    if (!session?.session_id) return;
    
    try {
      await axios.post(`${API_BASE_URL}/ride-sessions/${session.session_id}/rider-dropped-off`, {
        booking_id: bookingId,
        rider_phone: user?.phone_number,
      });
      fetchSession();
      Alert.alert('Success', 'You have been marked as dropped off. Please confirm to complete the ride.');
    } catch (error) {
      Alert.alert('Error', error?.response?.data?.detail || 'Could not mark drop off');
    }
  };

  const handleMarkCompleted = async () => {
    if (!session?.session_id) return;
    
    try {
      await axios.post(`${API_BASE_URL}/ride-sessions/${session.session_id}/rider-complete`, {
        booking_id: bookingId,
        rider_phone: user?.phone_number,
      });
      fetchSession();
      setRideCompleted(true);
      setShowRatingModal(true);
    } catch (error) {
      Alert.alert('Error', error?.response?.data?.detail || 'Could not complete ride');
    }
  };

  const handleBoardWithToken = async () => {
    if (!qrInput.trim()) {
      Alert.alert('Error', 'Please enter the QR token');
      return;
    }
    
    setSubmitting(true);
    
    try {
      const response = await axios.post(`${API_BASE_URL}/ride-sessions/rider/board-by-token`, {
        qr_code_token: qrInput.trim(),
        rider_phone: user?.phone_number,
        booking_id: bookingId
      });
      
      console.log('Board response:', response.data);
      
      if (response.data.success) {
        setScannerVisible(false);
        setShowQRModal(false);
        setQrInput('');
        Alert.alert('Boarded Successfully!', 'You have been boarded. Enjoy your ride!');
        await fetchSession();
      } else {
        Alert.alert('Boarding Failed', response.data.message || 'Could not board. Please try again.');
      }
    } catch (error) {
      console.error('Board error:', error);
      const errorMsg = error?.response?.data?.detail || 'Failed to board. Please try again.';
      
      if (errorMsg.includes('expired')) {
        Alert.alert('QR Code Expired', 'The QR code has expired. Please ask the driver to refresh the code.');
      } else {
        Alert.alert('Error', errorMsg);
      }
    } finally {
      setSubmitting(false);
    }
  };

  const handleQRCodeScanned = async ({ data }) => {
    if (!session?.session_id) {
      Alert.alert('Error', 'Session not found. Please refresh and try again.');
      setScanned(false);
      return;
    }
    
    console.log('📱 QR Code scanned:', data);
    
    setSubmitting(true);
    
    try {
      const response = await axios.post(`${API_BASE_URL}/ride-sessions/rider/board-by-token`, {
        qr_code_token: data.trim(),
        rider_phone: user?.phone_number,
        booking_id: bookingId
      });
      
      console.log('Board response:', response.data);
      
      if (response.data.success) {
        setScannerVisible(false);
        setScanned(false);
        setQrInput('');
        Alert.alert('Boarded Successfully!', 'You have been boarded. Enjoy your ride!');
        await fetchSession();
      } else {
        Alert.alert('Boarding Failed', response.data.message || 'Could not board. Please try again.');
      }
    } catch (error) {
      console.error('QR Code error:', error);
      const errorMsg = error?.response?.data?.detail || error?.message || 'Failed to board. Please try again.';
      
      if (errorMsg.includes('expired')) {
        Alert.alert('QR Code Expired', 'The QR code has expired. Please ask the driver to refresh the code.');
      } else {
        Alert.alert('Boarding Failed', errorMsg);
      }
    } finally {
      setSubmitting(false);
      setTimeout(() => {
        setScanned(false);
      }, 2000);
    }
  };

  const handleRateDriver = async () => {
    if (!session?.session_id) return;
    if (rating === 0) {
      Alert.alert('Rating Required', 'Please select a rating before submitting');
      return;
    }
    
    setSubmitting(true);
    try {
      const response = await axios.post(`${API_BASE_URL}/ride-sessions/${session.session_id}/rate-driver-once`, {
        booking_id: bookingId,
        rating,
        feedback,
      });
      
      if (response.data.already_rated) {
        Alert.alert('Already Rated', response.data.message);
        setHasRatedDriver(true);
        setShowRouteDetailsOnly(true);
      } else {
        Alert.alert('Thank You!', 'Your rating has been submitted');
        setHasRatedDriver(true);
        setShowRouteDetailsOnly(true);
      }
      
      setShowRatingModal(false);
      setRating(0);
      setFeedback('');
      fetchSession();
    } catch (error) {
      Alert.alert('Error', error?.response?.data?.detail || 'Could not submit rating');
    } finally {
      setSubmitting(false);
    }
  };

  const handleSOS = async () => {
    Alert.alert(
      'Emergency SOS',
      'This will notify your emergency contacts. Are you sure?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Trigger SOS',
          style: 'destructive',
          onPress: async () => {
            try {
              await axios.post(`${API_BASE_URL}/ride-sessions/${session.session_id}/sos`, {
                note: 'SOS triggered by rider',
                rider_phone: user?.phone_number,
              });
              Alert.alert('SOS Triggered', 'Your emergency contacts have been notified');
            } catch (error) {
              Alert.alert('Error', 'Could not trigger SOS');
            }
          },
        },
      ]
    );
  };

  const handleShareTrip = async () => {
    const message = `I'm on a ride from ${session?.origin || 'pickup'} to ${session?.destination || 'destination'}. Track my ride live!`;
    try {
      await Linking.openURL(`sms:&body=${encodeURIComponent(message)}`);
    } catch (error) {
      Alert.alert('Error', 'Could not share trip');
    }
  };

  const handleCallDriver = () => {
    if (session?.driver_phone) {
      Linking.openURL(`tel:${session.driver_phone}`);
    } else {
      Alert.alert('Error', 'Driver phone number not available');
    }
  };

  const viewRouteDetails = () => {
    navigation.navigate('ViewRouteRequestScreen', {
      ride: {
        id: session?.ride_id,
        origin: session?.origin,
        destination: session?.destination,
        route_coordinates: session?.route_coordinates,
      },
      booking: { id: bookingId }
    });
  };

  const centerMapOnRoute = () => {
    if (mapRef.current && routePolyline.length > 0) {
      mapRef.current.fitToCoordinates(routePolyline, {
        edgePadding: { top: 50, right: 50, bottom: 200, left: 50 },
        animated: true,
      });
    } else if (driverLocation && userLocation) {
      const coordinates = [driverLocation, userLocation];
      mapRef.current.fitToCoordinates(coordinates, {
        edgePadding: { top: 100, right: 50, bottom: 200, left: 50 },
        animated: true,
      });
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

  const RideProgressBar = () => (
    <View style={styles.progressContainer}>
      <View style={styles.progressBar}>
        <View style={[styles.progressFill, { width: `${rideProgress}%` }]} />
      </View>
      <View style={styles.progressInfo}>
        <Text style={styles.progressText}>{Math.round(rideProgress)}% completed</Text>
        {rideProgress > 0 && rideProgress < 100 && !rideCompleted && (
          <TouchableOpacity onPress={centerMapOnRoute}>
            <Ionicons name="locate" size={20} color="#184080" />
          </TouchableOpacity>
        )}
      </View>
    </View>
  );

  const QRScannerModal = () => {
    if (!permission) {
      return (
        <Modal visible={scannerVisible} animationType="slide" transparent={false}>
          <View style={styles.scannerContainer}>
            <View style={styles.scannerHeader}>
              <Text style={styles.scannerTitle}>Scan Boarding QR Code</Text>
              <TouchableOpacity onPress={() => setScannerVisible(false)} style={styles.scannerCloseBtn}>
                <Ionicons name="close" size={28} color="#fff" />
              </TouchableOpacity>
            </View>
            <View style={styles.scannerPermissionContainer}>
              <ActivityIndicator size="large" color="#10B981" />
              <Text style={styles.scannerPermissionText}>Loading camera...</Text>
            </View>
          </View>
        </Modal>
      );
    }

    if (!permission.granted) {
      return (
        <Modal visible={scannerVisible} animationType="slide" transparent={false}>
          <View style={styles.scannerContainer}>
            <View style={styles.scannerHeader}>
              <Text style={styles.scannerTitle}>Scan Boarding QR Code</Text>
              <TouchableOpacity onPress={() => setScannerVisible(false)} style={styles.scannerCloseBtn}>
                <Ionicons name="close" size={28} color="#fff" />
              </TouchableOpacity>
            </View>
            <View style={styles.scannerPermissionContainer}>
              <Ionicons name="camera-off" size={60} color="#fff" />
              <Text style={styles.scannerPermissionText}>Camera permission is required to scan QR codes</Text>
              <TouchableOpacity 
                style={styles.scannerGrantBtn}
                onPress={requestPermission}>
                <Text style={styles.scannerGrantBtnText}>Grant Permission</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={styles.scannerManualBtn}
                onPress={() => {
                  setScannerVisible(false);
                  setShowQRModal(true);
                }}>
                <Text style={styles.scannerManualBtnText}>Enter Code Manually</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
      );
    }

    return (
      <Modal visible={scannerVisible} animationType="slide" transparent={false}>
        <View style={styles.scannerContainer}>
          <View style={styles.scannerHeader}>
            <Text style={styles.scannerTitle}>Scan Boarding QR Code</Text>
            <TouchableOpacity onPress={() => {
              setScannerVisible(false);
              setScanned(false);
            }} style={styles.scannerCloseBtn}>
              <Ionicons name="close" size={28} color="#fff" />
            </TouchableOpacity>
          </View>
          
          <CameraView
            style={StyleSheet.absoluteFillObject}
            facing="back"
            barcodeScannerSettings={{
              barcodeTypes: ['qr'],
            }}
            onBarcodeScanned={scanned ? undefined : handleQRCodeScanned}
          >
            <View style={styles.scannerOverlay}>
              <View style={styles.scannerFrame} />
              <Text style={styles.scannerInstruction}>
                Position the QR code within the frame
              </Text>
              <TouchableOpacity 
                style={styles.scannerManualButton}
                onPress={() => {
                  setScannerVisible(false);
                  setShowQRModal(true);
                }}>
                <Text style={styles.scannerManualButtonText}>Enter Code Manually</Text>
              </TouchableOpacity>
            </View>
          </CameraView>
        </View>
      </Modal>
    );
  };

  const QRCodeInputModal = () => (
    <Modal visible={showQRModal} animationType="slide" transparent>
      <View style={styles.modalBackdrop}>
        <View style={styles.qrInputModalCard}>
          <View style={styles.qrInputHeader}>
            <Text style={styles.qrInputTitle}>Enter Boarding Code</Text>
            <TouchableOpacity onPress={() => {
              setShowQRModal(false);
              setQrInput('');
            }}>
              <Ionicons name="close" size={24} color="#6B7280" />
            </TouchableOpacity>
          </View>
          
          <Text style={styles.qrInputSubtitle}>
            Please enter the QR code token shown by the driver
          </Text>
          
          <TextInput
            value={qrInput}
            onChangeText={setQrInput}
            placeholder="Enter QR token"
            style={styles.qrInputField}
            autoCapitalize="none"
            autoCorrect={false}
            editable={!submitting}
          />
          
          <TouchableOpacity 
            style={[styles.qrInputButton, submitting && { opacity: 0.5 }]}
            onPress={handleBoardWithToken}
            disabled={submitting}
          >
            <Text style={styles.qrInputButtonText}>
              {submitting ? 'Boarding...' : 'Board Ride'}
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.qrInputCancelButton}
            onPress={() => {
              setShowQRModal(false);
              setQrInput('');
            }}
          >
            <Text style={styles.qrInputCancelButtonText}>Cancel</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );

  if (loading) {
    return (
      <SafeAreaView style={styles.centered}>
        <ActivityIndicator size="large" color="#184080" />
        <Text style={styles.loadingText}>Loading ride details...</Text>
      </SafeAreaView>
    );
  }

  if (!bookingId || bookingId === 3) {
    return (
      <SafeAreaView style={styles.centered}>
        <Ionicons name="alert-circle-outline" size={60} color="#DC2626" />
        <Text style={styles.errorTitle}>Invalid Booking</Text>
        <Text style={styles.errorText}>This booking could not be found.</Text>
        <TouchableOpacity style={styles.goBackBtn} onPress={() => navigation.goBack()}>
          <Text style={styles.goBackBtnText}>Go Back</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  const riderStatus = session?.rider_status;
  const isWaitingForDriver = riderStatus === 'accepted';
  const isReachedPickup = riderStatus === 'reached_pickup' || hasReachedPickup;
  const isBoarded = riderStatus === 'boarded';
  const isDroppedOff = riderStatus === 'dropped_off';

  const showDriverETA = isWaitingForDriver && driverETA && !isReachedPickup;
  const showReachedPickupButton = isWaitingForDriver && !isReachedPickup && !rideCompleted;
  const showQRButton = isReachedPickup && !isBoarded && !rideCompleted;
  const showDroppedOffButton = isBoarded && !isDroppedOff && !rideCompleted;
  const showCompleteButton = isDroppedOff && !rideCompleted;

  const initialRegion = driverLocation ? {
    latitude: driverLocation.latitude,
    longitude: driverLocation.longitude,
    latitudeDelta: 0.01,
    longitudeDelta: 0.01,
  } : userLocation ? {
    latitude: userLocation.latitude,
    longitude: userLocation.longitude,
    latitudeDelta: 0.02,
    longitudeDelta: 0.02,
  } : {
    latitude: session?.pickup_lat || 28.6139,
    longitude: session?.pickup_lng || 77.2090,
    latitudeDelta: 0.02,
    longitudeDelta: 0.02,
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={Colors.white} />

      <View style={[styles.header, { paddingTop: insets.top > 0 ? insets.top : 12 }]}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Ionicons name="chevron-back" size={24} color={Colors.primary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Ride Tracker</Text>
        <TouchableOpacity style={styles.sosButton} onPress={handleSOS}>
          <Ionicons name="shield-outline" size={24} color="#E11D48" />
        </TouchableOpacity>
      </View>

      {__DEV__ && (
        <View style={styles.debugStatus}>
          <Text style={[styles.debugText, socketConnected ? styles.debugConnected : styles.debugDisconnected]}>
            {socketConnected ? '● Live Tracking Active' : '○ Connecting...'}
          </Text>
        </View>
      )}

      <View style={styles.mapContainer}>
        <MapView
          ref={mapRef}
          provider={PROVIDER_GOOGLE}
          style={styles.map}
          initialRegion={initialRegion}
          showsUserLocation={true}
          showsMyLocationButton={true}
          zoomEnabled={true}
        >
          {/* Planned Route Polyline (Dashed line for planned route) */}
          {routePolyline.length > 0 && !rideCompleted && (
            <Polyline
              coordinates={routePolyline}
              strokeColor="#9CA3AF"
              strokeWidth={3}
              strokeColors={['#9CA3AF']}
              lineDashPattern={[5, 5]}
              lineCap="round"
              lineJoin="round"
            />
          )}
          
          {/* Driver's Traveled Path (Live tracing) */}
          {driverPath.length > 1 && !rideCompleted && (
            <>
              {/* Background glow effect */}
              <Polyline
                coordinates={driverPath}
                strokeColor="rgba(24, 64, 128, 0.2)"
                strokeWidth={8}
                lineCap="round"
                lineJoin="round"
                zIndex={0}
              />
              {/* Main path line */}
              <Polyline
                coordinates={driverPath}
                strokeColor="#184080"
                strokeWidth={4}
                lineCap="round"
                lineJoin="round"
                zIndex={1}
              />
            </>
          )}

          {driverLocation && (
            <Marker coordinate={driverLocation} anchor={{ x: 0.5, y: 0.5 }}>
              <View style={styles.driverMarker}>
                <View style={styles.driverMarkerPulse} />
                <Ionicons name="car-sport" size={28} color="#184080" />
                <View style={styles.driverMarkerDot} />
              </View>
            </Marker>
          )}

          {session?.pickup_lat && session?.pickup_lng && !isBoarded && !rideCompleted && (
            <Marker
              coordinate={{
                latitude: session.pickup_lat,
                longitude: session.pickup_lng,
              }}
              anchor={{ x: 0.5, y: 1 }}
            >
              <View style={styles.pickupMarker}>
                <View style={styles.pickupMarkerBubble}>
                  <Ionicons name="location" size={16} color="#10B981" />
                </View>
                <View style={styles.pickupMarkerPointer} />
                <Text style={styles.pickupMarkerLabel}>Pickup</Text>
              </View>
            </Marker>
          )}

          {session?.dropoff_lat && session?.dropoff_lng && !isDroppedOff && !rideCompleted && (
            <Marker
              coordinate={{
                latitude: session.dropoff_lat,
                longitude: session.dropoff_lng,
              }}
              anchor={{ x: 0.5, y: 1 }}
            >
              <View style={styles.dropoffMarker}>
                <View style={styles.dropoffMarkerBubble}>
                  <Ionicons name="flag" size={16} color="#EF4444" />
                </View>
                <View style={styles.dropoffMarkerPointer} />
                <Text style={styles.dropoffMarkerLabel}>Dropoff</Text>
              </View>
            </Marker>
          )}
        </MapView>
      </View>

      {/* Ride Progress Bar */}
      {!rideCompleted && isBoarded && rideProgress > 0 && (
        <RideProgressBar />
      )}

      <ScrollView
        style={styles.bottomSheet}
        contentContainerStyle={[styles.bottomSheetContent, { paddingBottom: insets.bottom + 20 }]}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        {showRouteDetailsOnly ? (
          <View style={styles.completedRouteContainer}>
            <Ionicons name="checkmark-circle" size={48} color="#10B981" />
            <Text style={styles.completedTitle}>Ride Completed!</Text>
            <Text style={styles.completedSubtitle}>Thank you for riding with us</Text>
            
            <TouchableOpacity style={styles.viewRouteBtn} onPress={viewRouteDetails}>
              <Ionicons name="map-outline" size={20} color="#fff" />
              <Text style={styles.viewRouteBtnText}>View Route Details</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <>
            <View style={[
              styles.statusBanner, 
              { backgroundColor: rideCompleted ? '#F3F4F6' : isBoarded ? '#DCFCE7' : isReachedPickup ? '#DCFCE7' : '#EFF6FF' }
            ]}>
              <Ionicons
                name={rideCompleted ? 'checkmark-done-circle' : isBoarded ? 'car-sport' : isReachedPickup ? 'checkmark-circle' : 'time-outline'}
                size={24}
                color={rideCompleted ? '#6B7280' : isBoarded ? '#16A34A' : isReachedPickup ? '#10B981' : '#F59E0B'}
              />
              <View style={styles.statusBannerText}>
                <Text style={[styles.statusBannerTitle, { color: rideCompleted ? '#374151' : isBoarded ? '#166534' : isReachedPickup ? '#065A46' : '#92400E' }]}>
                  {rideCompleted ? 'Ride Completed' : isBoarded ? 'Onboard - Ride in Progress' : isReachedPickup ? 'Ready to Board' : isWaitingForDriver ? 'Driver is on the way' : 'Waiting for driver'}
                </Text>
                <Text style={[styles.statusBannerSub, { color: rideCompleted ? '#6B7280' : isBoarded ? '#166534' : isReachedPickup ? '#065A46' : '#92400E' }]}>
                  {rideCompleted 
                    ? 'Rate your experience with the driver' 
                    : isBoarded 
                    ? `Heading to ${session?.destination || 'destination'}` 
                    : isReachedPickup 
                    ? 'Please enter the driver\'s boarding code to board'
                    : driverETA ? `${driverETA} mins away • ${formatDistance(driverDistance)}` : 'Waiting for driver to start...'}
                </Text>
              </View>
            </View>

            {showDriverETA && (
              <View style={styles.etaCard}>
                <View style={styles.etaIcon}>
                  <Ionicons name="time-outline" size={24} color="#184080" />
                </View>
                <View style={styles.etaInfo}>
                  <Text style={styles.etaLabel}>Driver arriving in</Text>
                  <Text style={styles.etaValue}>{driverETA} mins</Text>
                  {arrivalTime && <Text style={styles.etaTime}>~ {arrivalTime}</Text>}
                </View>
                <View style={styles.distanceBadge}>
                  <Text style={styles.distanceText}>{formatDistance(driverDistance)}</Text>
                </View>
              </View>
            )}

            {session?.driver_name && !rideCompleted && (
              <View style={styles.driverCard}>
                <View style={styles.driverInfo}>
                  {session?.driver_photo ? (
                    <Image source={{ uri: buildImageUrl(session.driver_photo) }} style={styles.driverAvatar} />
                  ) : (
                    <View style={[styles.driverAvatar, styles.driverAvatarFallback]}>
                      <Text style={styles.driverAvatarText}>{getInitials(session?.driver_name)}</Text>
                    </View>
                  )}
                  <View style={styles.driverDetails}>
                    <Text style={styles.driverName}>{session?.driver_name}</Text>
                    <View style={styles.ratingRow}>
                      <Ionicons name="star" size={14} color="#F59E0B" />
                      <Text style={styles.ratingText}>{session?.driver_rating_avg || 4.9}</Text>
                    </View>
                  </View>
                </View>
                <View style={styles.driverActions}>
                  <TouchableOpacity style={styles.callButton} onPress={handleCallDriver}>
                    <Ionicons name="call-outline" size={20} color={Colors.primary} />
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.chatButton} onPress={() => navigation.navigate('ChatScreen', {
                    receiverPhone: session?.driver_phone,
                    rideId: session?.ride_id,
                    user: { name: session?.driver_name, phone: session?.driver_phone }
                  })}>
                    <Ionicons name="chatbubble-ellipses" size={20} color={Colors.primary} />
                  </TouchableOpacity>
                </View>
              </View>
            )}

            <View style={styles.tripCard}>
              <Text style={styles.cardTitle}>Trip Details</Text>
              
              <View style={styles.tripRow}>
                <View style={styles.tripIconCol}>
                  <Ionicons name="ellipse" size={12} color={isReachedPickup ? '#10B981' : '#9CA3AF'} />
                  <View style={[styles.dottedLine, isReachedPickup && { backgroundColor: '#10B981' }]} />
                  <Ionicons name="flag" size={12} color={isDroppedOff ? '#10B981' : '#9CA3AF'} />
                </View>
                <View style={styles.tripTextCol}>
                  <Text style={styles.tripLabel}>Pickup</Text>
                  <Text style={[styles.tripValue, isReachedPickup && { color: '#10B981' }]}>
                    {session?.origin || 'Pickup location'}
                    {isReachedPickup && ' ✓'}
                  </Text>
                  <Text style={[styles.tripLabel, { marginTop: 16 }]}>Drop-off</Text>
                  <Text style={[styles.tripValue, isDroppedOff && { color: '#10B981' }]}>
                    {session?.destination || 'Drop-off location'}
                    {isDroppedOff && ' ✓'}
                  </Text>
                </View>
              </View>
            </View>

            <TouchableOpacity style={styles.refreshLocationBtn} onPress={() => {
              getUserLocation();
              fetchSession();
              syncSessionState();
            }}>
              <Ionicons name="refresh" size={20} color="#184080" />
              <Text style={styles.refreshLocationText}>Refresh location</Text>
            </TouchableOpacity>

            {showReachedPickupButton && (
              <TouchableOpacity style={styles.reachedPickupBtn} onPress={handleReachedPickup}>
                <Ionicons name="location" size={20} color="#fff" />
                <Text style={styles.reachedPickupBtnText}>I've Reached Pickup Location</Text>
              </TouchableOpacity>
            )}

            {showQRButton && (
              <>
                <View style={styles.boardingInstructionCard}>
                  <Ionicons name="information-circle-outline" size={20} color="#184080" />
                  <Text style={styles.boardingInstructionText}>
                    Ask the driver for your personal boarding QR code. Each rider has a unique code.
                  </Text>
                </View>
                
                <TouchableOpacity style={styles.scanQRBtn} onPress={() => setScannerVisible(true)}>
                  <Ionicons name="qr-code" size={20} color="#fff" />
                  <Text style={styles.scanQRBtnText}>Scan QR Code to Board</Text>
                </TouchableOpacity>
                
                <TouchableOpacity style={styles.manualCodeBtn} onPress={() => setShowQRModal(true)}>
                  <Ionicons name="keypad-outline" size={20} color="#184080" />
                  <Text style={styles.manualCodeBtnText}>Enter Code Manually</Text>
                </TouchableOpacity>
              </>
            )}

            {showDroppedOffButton && (
              <TouchableOpacity style={styles.droppedOffBtn} onPress={handleMarkDroppedOff}>
                <Ionicons name="flag" size={20} color="#fff" />
                <Text style={styles.droppedOffBtnText}>I've Reached My Destination</Text>
              </TouchableOpacity>
            )}

            {showCompleteButton && (
              <>
                <View style={styles.safetyCard}>
                  <Ionicons name="shield-checkmark" size={24} color="#10B981" />
                  <View>
                    <Text style={styles.safetyTitle}>Safety Confirmation Required</Text>
                    <Text style={styles.safetyText}>For your safety, please mark the ride as completed once you have safely reached your destination.</Text>
                  </View>
                </View>
                <TouchableOpacity style={styles.completeBtn} onPress={handleMarkCompleted}>
                  <Text style={styles.completeBtnText}>Mark Ride as Completed</Text>
                </TouchableOpacity>
              </>
            )}

            {!rideCompleted && (
              <View style={styles.actionButtons}>
                <TouchableOpacity style={styles.shareBtn} onPress={handleShareTrip}>
                  <Ionicons name="share-social" size={20} color={Colors.primary} />
                  <Text style={styles.shareBtnText}>Share Trip</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.sosActionBtn} onPress={handleSOS}>
                  <Ionicons name="alert-circle" size={20} color="#DC2626" />
                  <Text style={styles.sosActionBtnText}>SOS</Text>
                </TouchableOpacity>
              </View>
            )}

            <View style={styles.safetyNote}>
              <Ionicons name="information-circle" size={16} color="#6B7280" />
              <Text style={styles.safetyNoteText}>Always verify the driver and vehicle before boarding.</Text>
            </View>
          </>
        )}
      </ScrollView>

      <QRScannerModal />
      <QRCodeInputModal />

      <Modal visible={showRatingModal} transparent animationType="fade">
        <View style={styles.modalBackdrop}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>Rate Your Experience</Text>
            <Text style={styles.modalSub}>How was your ride with {session?.driver_name}?</Text>

            {renderStars()}

            <TextInput
              value={feedback}
              onChangeText={setFeedback}
              placeholder="Tell us about your experience..."
              multiline
              numberOfLines={3}
              style={styles.feedbackInput}
              textAlignVertical="top"
            />

            <View style={styles.modalActions}>
              <TouchableOpacity style={styles.skipBtn} onPress={() => setShowRatingModal(false)}>
                <Text style={styles.skipBtnText}>Later</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={[styles.submitBtn, (rating === 0 || submitting) && { opacity: 0.5 }]} 
                onPress={handleRateDriver} 
                disabled={rating === 0 || submitting}
              >
                <Text style={styles.submitBtnText}>{submitting ? 'Submitting...' : 'Submit Rating'}</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.white,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.white,
    padding: 20,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: '#6B7280',
  },
  errorTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#DC2626',
    marginTop: 16,
  },
  errorText: {
    fontSize: 14,
    color: '#6B7280',
    marginTop: 8,
    textAlign: 'center',
  },
  goBackBtn: {
    marginTop: 20,
    backgroundColor: Colors.primary,
    paddingHorizontal: 30,
    paddingVertical: 12,
    borderRadius: 12,
  },
  goBackBtnText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 16,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingBottom: 12,
    backgroundColor: Colors.white,
    borderBottomWidth: 0.5,
    borderBottomColor: '#F3F4F6',
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: Colors.primary,
  },
  sosButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  debugStatus: {
    paddingHorizontal: 16,
    paddingVertical: 4,
    backgroundColor: '#F3F4F6',
  },
  debugText: {
    fontSize: 10,
    fontWeight: '500',
  },
  debugConnected: {
    color: '#10B981',
  },
  debugDisconnected: {
    color: '#EF4444',
  },
  mapContainer: {
    height: height * 0.45,
    width: '100%',
    backgroundColor: '#E8EEF7',
  },
  map: {
    flex: 1,
  },
  driverMarker: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  driverMarkerPulse: {
    position: 'absolute',
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: 'rgba(24, 64, 128, 0.2)',
  },
  driverMarkerDot: {
    position: 'absolute',
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#184080',
  },
  pickupMarker: {
    alignItems: 'center',
  },
  pickupMarkerBubble: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#10B981',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#fff',
  },
  pickupMarkerPointer: {
    width: 0,
    height: 0,
    borderLeftWidth: 6,
    borderRightWidth: 6,
    borderTopWidth: 8,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    borderTopColor: '#10B981',
    marginTop: -2,
  },
  pickupMarkerLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: '#10B981',
    marginTop: 4,
  },
  dropoffMarker: {
    alignItems: 'center',
  },
  dropoffMarkerBubble: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#EF4444',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#fff',
  },
  dropoffMarkerPointer: {
    width: 0,
    height: 0,
    borderLeftWidth: 6,
    borderRightWidth: 6,
    borderTopWidth: 8,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    borderTopColor: '#EF4444',
    marginTop: -2,
  },
  dropoffMarkerLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: '#EF4444',
    marginTop: 4,
  },
  bottomSheet: {
    flex: 1,
    backgroundColor: Colors.white,
  },
  bottomSheetContent: {
    paddingHorizontal: 16,
    paddingTop: 12,
  },
  statusBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 16,
    marginBottom: 16,
    gap: 12,
  },
  statusBannerText: {
    flex: 1,
  },
  statusBannerTitle: {
    fontSize: 16,
    fontWeight: '700',
  },
  statusBannerSub: {
    fontSize: 13,
    marginTop: 2,
  },
  etaCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F0F7FF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    gap: 12,
    borderWidth: 1,
    borderColor: '#E0ECFF',
  },
  etaIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#E8EEF9',
    alignItems: 'center',
    justifyContent: 'center',
  },
  etaInfo: {
    flex: 1,
  },
  etaLabel: {
    fontSize: 12,
    color: '#6B7280',
  },
  etaValue: {
    fontSize: 24,
    fontWeight: '700',
    color: '#184080',
  },
  etaTime: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 2,
  },
  distanceBadge: {
    backgroundColor: '#E8EEF9',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  distanceText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#184080',
  },
  driverCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#F9FAFB',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  driverInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  driverAvatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    marginRight: 12,
  },
  driverAvatarFallback: {
    backgroundColor: '#E8EEF9',
    alignItems: 'center',
    justifyContent: 'center',
  },
  driverAvatarText: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.primary,
  },
  driverDetails: {
    flex: 1,
  },
  driverName: {
    fontSize: 16,
    fontWeight: '700',
    color: '#111827',
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 2,
  },
  ratingText: {
    fontSize: 12,
    color: '#6B7280',
  },
  driverActions: {
    flexDirection: 'row',
    gap: 12,
  },
  callButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#E8EEF9',
    alignItems: 'center',
    justifyContent: 'center',
  },
  chatButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#E8EEF9',
    alignItems: 'center',
    justifyContent: 'center',
  },
  tripCard: {
    backgroundColor: '#F9FAFB',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 12,
  },
  tripRow: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  tripIconCol: {
    alignItems: 'center',
    width: 24,
    marginRight: 12,
  },
  dottedLine: {
    width: 2,
    height: 30,
    backgroundColor: '#D1D5DB',
    marginVertical: 4,
  },
  tripTextCol: {
    flex: 1,
  },
  tripLabel: {
    fontSize: 12,
    color: '#6B7280',
    marginBottom: 2,
  },
  tripValue: {
    fontSize: 14,
    fontWeight: '500',
    color: '#111827',
  },
  refreshLocationBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#F3F4F6',
    borderRadius: 12,
    paddingVertical: 10,
    marginBottom: 16,
  },
  refreshLocationText: {
    fontSize: 13,
    color: '#184080',
    fontWeight: '500',
  },
  reachedPickupBtn: {
    backgroundColor: '#10B981',
    borderRadius: 14,
    paddingVertical: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginBottom: 16,
  },
  reachedPickupBtnText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '700',
  },
  scanQRBtn: {
    backgroundColor: Colors.primary,
    borderRadius: 14,
    paddingVertical: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginBottom: 12,
  },
  scanQRBtnText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '700',
  },
  manualCodeBtn: {
    backgroundColor: '#F3F4F6',
    borderRadius: 14,
    paddingVertical: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  manualCodeBtnText: {
    color: '#184080',
    fontSize: 14,
    fontWeight: '600',
  },
  droppedOffBtn: {
    backgroundColor: '#10B981',
    borderRadius: 14,
    paddingVertical: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginBottom: 16,
  },
  droppedOffBtnText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '700',
  },
  completeBtn: {
    backgroundColor: Colors.primary,
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: 'center',
    marginBottom: 16,
  },
  completeBtnText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '700',
  },
  safetyCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEF2F2',
    borderRadius: 14,
    padding: 16,
    marginBottom: 16,
    gap: 12,
    borderWidth: 1,
    borderColor: '#FEE2E2',
  },
  safetyTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#DC2626',
  },
  safetyText: {
    fontSize: 12,
    color: '#DC2626',
    marginTop: 2,
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16,
  },
  shareBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#F3F4F6',
    borderRadius: 14,
    paddingVertical: 14,
  },
  shareBtnText: {
    color: Colors.primary,
    fontWeight: '600',
    fontSize: 14,
  },
  sosActionBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#FEF2F2',
    borderRadius: 14,
    paddingVertical: 14,
  },
  sosActionBtnText: {
    color: '#DC2626',
    fontWeight: '600',
    fontSize: 14,
  },
  safetyNote: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 12,
  },
  safetyNoteText: {
    fontSize: 11,
    color: '#6B7280',
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(17,24,39,0.45)',
    justifyContent: 'center',
    padding: 20,
  },
  modalCard: {
    backgroundColor: '#fff',
    borderRadius: 24,
    padding: 20,
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#111827',
    textAlign: 'center',
  },
  modalSub: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
    marginTop: 8,
    marginBottom: 18,
  },
  starsRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 18,
  },
  feedbackInput: {
    minHeight: 100,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 16,
    padding: 14,
    color: '#111827',
    fontSize: 14,
  },
  modalActions: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 18,
  },
  skipBtn: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 999,
    paddingVertical: 14,
    alignItems: 'center',
  },
  skipBtnText: {
    color: '#6B7280',
    fontWeight: '600',
  },
  submitBtn: {
    flex: 1,
    backgroundColor: Colors.primary,
    borderRadius: 999,
    paddingVertical: 14,
    alignItems: 'center',
  },
  submitBtnText: {
    color: '#fff',
    fontWeight: '700',
  },
  completedRouteContainer: {
    alignItems: 'center',
    paddingVertical: 40,
    gap: 16,
  },
  completedTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#10B981',
  },
  completedSubtitle: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
  },
  viewRouteBtn: {
    backgroundColor: Colors.primary,
    borderRadius: 14,
    paddingVertical: 14,
    paddingHorizontal: 24,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 16,
  },
  viewRouteBtnText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  boardingInstructionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#EFF6FF',
    borderRadius: 12,
    padding: 12,
    marginBottom: 16,
    gap: 10,
  },
  boardingInstructionText: {
    flex: 1,
    fontSize: 12,
    color: '#184080',
    lineHeight: 18,
  },
  scannerContainer: {
    flex: 1,
    backgroundColor: '#000',
  },
  scannerHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: Platform.OS === 'ios' ? 50 : 20,
    paddingBottom: 12,
    backgroundColor: '#000',
    zIndex: 10,
  },
  scannerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#fff',
  },
  scannerCloseBtn: {
    padding: 8,
  },
  scannerOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  scannerFrame: {
    width: width * 0.7,
    height: width * 0.7,
    borderWidth: 2,
    borderColor: '#10B981',
    backgroundColor: 'transparent',
    borderRadius: 12,
  },
  scannerInstruction: {
    marginTop: 20,
    color: '#fff',
    fontSize: 14,
    textAlign: 'center',
  },
  scannerManualButton: {
    marginTop: 40,
    paddingHorizontal: 20,
    paddingVertical: 12,
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 12,
  },
  scannerManualButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  scannerPermissionContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  scannerPermissionText: {
    marginTop: 16,
    color: '#fff',
    fontSize: 16,
    textAlign: 'center',
  },
  scannerGrantBtn: {
    marginTop: 20,
    backgroundColor: '#10B981',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
  },
  scannerGrantBtnText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  scannerManualBtn: {
    marginTop: 12,
    backgroundColor: 'transparent',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#fff',
  },
  scannerManualBtnText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  qrInputModalCard: {
    backgroundColor: '#fff',
    borderRadius: 24,
    padding: 20,
    width: width - 40,
  },
  qrInputHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  qrInputTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#111827',
  },
  qrInputSubtitle: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 20,
  },
  qrInputField: {
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 12,
    padding: 14,
    fontSize: 16,
    marginBottom: 20,
    backgroundColor: '#F9FAFB',
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
  },
  qrInputButton: {
    backgroundColor: Colors.primary,
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
    marginBottom: 12,
  },
  qrInputButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  qrInputCancelButton: {
    backgroundColor: '#F3F4F6',
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
  },
  qrInputCancelButtonText: {
    color: '#6B7280',
    fontSize: 16,
    fontWeight: '600',
  },
  progressContainer: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  progressBar: {
    height: 4,
    backgroundColor: '#E5E7EB',
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#184080',
    borderRadius: 2,
  },
  progressInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 6,
  },
  progressText: {
    fontSize: 11,
    color: '#6B7280',
  },
});