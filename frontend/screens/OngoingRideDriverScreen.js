// import React, { useCallback, useEffect, useState, useRef } from 'react';
// import {
//   View,
//   Text,
//   StyleSheet,
//   TouchableOpacity,
//   StatusBar,
//   ScrollView,
//   RefreshControl,
//   ActivityIndicator,
//   Image,
//   TextInput,
//   Modal,
//   Alert,
//   Clipboard,
//   Share,
//   Linking,
//   Dimensions,
//   FlatList,
//   Platform,
// } from 'react-native';
// import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
// import Ionicons from '@expo/vector-icons/Ionicons';
// import { MaterialIcons } from '@expo/vector-icons';
// import axios from 'axios';
// import * as Location from 'expo-location';
// import { API_BASE_URL } from "../config/config_ip";
// import { useAuth } from '../context/AuthContext';
// import { Colors, Typography } from '../constants/Colors';
// import EmergencyContactService from '../services/emergencycontact_ds';
// import CustomAlert from '../components/CustomAlert';
// import io from 'socket.io-client';
// import QRCode from 'react-native-qrcode-svg';
// import * as Sharing from 'expo-sharing';
// import * as FileSystem from 'expo-file-system';

// const { width } = Dimensions.get('window');

// const buildImageUrl = (url) => {
//   if (!url) return null;
//   if (url.startsWith('http://') || url.startsWith('https://')) return url;
//   return `${API_BASE_URL}${url.startsWith('/') ? url : `/${url}`}`;
// };

// const getInitials = (name) => {
//   if (!name) return '?';
//   const parts = name.trim().split(' ').filter(Boolean);
//   if (parts.length > 1) return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
//   return parts[0].slice(0, 2).toUpperCase();
// };

// export default function OngoingRideDriverScreen({ route, navigation }) {
//   const { rideId, sessionId: initialSessionId } = route.params || {};
//   const { user } = useAuth();
//   const insets = useSafeAreaInsets();

//   const [session, setSession] = useState(null);
//   const [loading, setLoading] = useState(true);
//   const [refreshing, setRefreshing] = useState(false);
//   const [ratingModalVisible, setRatingModalVisible] = useState(false);
//   const [selectedRider, setSelectedRider] = useState(null);
//   const [rating, setRating] = useState(0);
//   const [feedback, setFeedback] = useState('');
//   const [qrModalVisible, setQrModalVisible] = useState(false);
//   const [showCompleteConfirm, setShowCompleteConfirm] = useState(false);
//   const [showForceCompleteConfirm, setShowForceCompleteConfirm] = useState(false);
//   const [elapsedTime, setElapsedTime] = useState(0);
//   const timerRef = useRef(null);
//   const [sessionStartTime, setSessionStartTime] = useState(null);
//   const [socketConnected, setSocketConnected] = useState(false);
//   const locationIntervalRef = useRef(null);
//   const socketRef = useRef(null);
//   const reconnectAttempts = useRef(0);
//   const qrCodeRef = useRef(null);
//   const qrCodeModalRef = useRef(null);
  
//   // Ride Completion States
//   const [rideCompleted, setRideCompleted] = useState(false);
//   const [totalEarnings, setTotalEarnings] = useState(0);
//   const [showCompletionSummary, setShowCompletionSummary] = useState(false);
//   const [allRidersRated, setAllRidersRated] = useState(false);
//   const [unratedRiders, setUnratedRiders] = useState([]);
  
//   // SOS Contact List States
//   const [sosModalVisible, setSosModalVisible] = useState(false);
//   const [personalContacts, setPersonalContacts] = useState([]);
//   const [loadingContacts, setLoadingContacts] = useState(false);
//   const [sosSending, setSosSending] = useState(false);
  
//   // Custom Alert states
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
    
//     if (type === 'error') {
//       icon = "error";
//       iconColor = "#EF4444";
//     } else if (type === 'warning') {
//       icon = "warning";
//       iconColor = "#F59E0B";
//     } else if (type === 'info') {
//       icon = "info";
//       iconColor = Colors.primary || "#184080";
//     }
    
//     setAlertConfig({
//       title,
//       message,
//       icon,
//       iconColor,
//       buttons: [{ text: 'OK', onPress: () => setAlertVisible(false) }]
//     });
//     setAlertVisible(true);
//   };

//   const formatElapsedTime = (seconds) => {
//     const hours = Math.floor(seconds / 3600);
//     const minutes = Math.floor((seconds % 3600) / 60);
//     const secs = seconds % 60;
    
//     if (hours > 0) {
//       return `${hours}h ${minutes}m ${secs}s`;
//     } else if (minutes > 0) {
//       return `${minutes}m ${secs}s`;
//     }
//     return `${secs}s`;
//   };

//   const formatDateTime = (dateTimeStr) => {
//     if (!dateTimeStr) return { date: 'N/A', time: 'N/A' };
//     const date = new Date(dateTimeStr);
//     return {
//       date: date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' }),
//       time: date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true }),
//     };
//   };

//   const connectSocket = useCallback(async () => {
//     if (!session?.session_id) return;
    
//     if (socketRef.current && socketRef.current.connected) {
//       return;
//     }
    
//     try {
//       const socket = io(API_BASE_URL, {
//         transports: ['websocket'],
//         reconnection: true,
//         reconnectionAttempts: 10,
//         reconnectionDelay: 1000,
//         timeout: 10000,
//         forceNew: true,
//         path: '/socket.io',
//         auth: {
//           token: user?.phone_number || null,
//           userType: 'driver'
//         }
//       });
      
//       socketRef.current = socket;
      
//       socket.on('connect', () => {
//         console.log('✅ Socket connected for driver');
//         setSocketConnected(true);
//         reconnectAttempts.current = 0;
//         socket.emit('join-ride-room', session.session_id);
//         if (user?.phone_number) {
//           socket.emit('join-user-room', user.phone_number);
//         }
//       });
      
//       socket.on('connect_error', (error) => {
//         console.log('❌ Socket connection error:', error.message);
//         setSocketConnected(false);
        
//         if (error.message.includes('rejected')) {
//           setTimeout(() => {
//             if (socketRef.current) {
//               socketRef.current.io.opts.transports = ['polling', 'websocket'];
//               socketRef.current.connect();
//             }
//           }, 2000);
//         }
//       });
      
//       socket.on('rider-boarded', (data) => {
//         console.log('Rider boarded event:', data);
//         fetchSession();
//         showCustomAlert('Rider Boarded', `${data.rider_name || 'A rider'} has boarded the ride`, 'success');
//       });
      
//       socket.on('rider-dropped-off', (data) => {
//         console.log('Rider dropped off event:', data);
//         fetchSession();
//         showCustomAlert('Rider Dropped Off', `${data.rider_name || 'A rider'} has been dropped off`, 'success');
//       });
      
//       socket.on('emergency-alert', (data) => {
//         console.log('Emergency alert received:', data);
//         showCustomAlert('Emergency Alert', data.message || 'Emergency alert triggered', 'warning');
//       });
      
//     } catch (error) {
//       console.log('Socket connection error:', error);
//     }
//   }, [session?.session_id, user?.phone_number]);

//   const startLocationTracking = useCallback(async () => {
//     try {
//       const { status } = await Location.requestForegroundPermissionsAsync();
//       if (status !== 'granted') {
//         console.log('Location permission denied');
//         return;
//       }

//       if (locationIntervalRef.current) {
//         clearInterval(locationIntervalRef.current);
//       }

//       locationIntervalRef.current = setInterval(async () => {
//         try {
//           const location = await Location.getCurrentPositionAsync({
//             accuracy: Location.Accuracy.High,
//           });
          
//           const { latitude, longitude } = location.coords;
          
//           await axios.post(`${API_BASE_URL}/ride-sessions/${session?.session_id}/location`, {
//             lat: latitude,
//             lng: longitude,
//           });
          
//           if (socketRef.current && socketConnected) {
//             socketRef.current.emit('driver-location-update', {
//               session_id: session?.session_id,
//               latitude,
//               longitude,
//             });
//           }
          
//           console.log('📍 Location sent:', { latitude, longitude });
//         } catch (error) {
//           console.log('Error sending location:', error);
//         }
//       }, 5000);
//     } catch (error) {
//       console.log('Error starting location tracking:', error);
//     }
//   }, [session?.session_id, socketConnected]);

//   const fetchSession = useCallback(async () => {
//     try {
//       console.log('Fetching session for ride:', rideId, 'driver:', user?.phone_number);
      
//       const res = await axios.get(`${API_BASE_URL}/ride-sessions/driver/${rideId}`, {
//         params: { driver_phone: user?.phone_number },
//       });
      
//       console.log('Session response:', res.data);
//       setSession(res.data);
      
//       // Calculate total earnings from completed ride
//       if (res.data.completed_at && res.data.riders) {
//         const earnings = res.data.riders
//           .filter(rider => rider.status === 'completed' || rider.status === 'dropped_off')
//           .reduce((sum, rider) => sum + (rider.price_paid || rider.seats_booked * (res.data.price_per_seat || 0)), 0);
//         setTotalEarnings(earnings);
//         setRideCompleted(true);
        
//         // Check if all riders are rated
//         const unrated = res.data.riders.filter(
//           rider => (rider.status === 'completed' || rider.status === 'dropped_off') && !rider.driver_rating
//         );
//         setUnratedRiders(unrated);
//         setAllRidersRated(unrated.length === 0);
//       }
      
//       if (res.data.current_phase !== 'boarding' && res.data.current_phase !== 'completed') {
//         if (res.data.started_at && !res.data.completed_at) {
//           const startTime = new Date(res.data.started_at).getTime();
//           setSessionStartTime(startTime);
          
//           if (timerRef.current) clearInterval(timerRef.current);
//           timerRef.current = setInterval(() => {
//             const now = new Date().getTime();
//             const elapsed = Math.floor((now - startTime) / 1000);
//             setElapsedTime(elapsed);
//           }, 1000);
//         }
//       }
      
//     } catch (error) {
//       console.log('Driver session fetch error:', error?.response?.data || error.message);
      
//       if (error?.response?.status === 404) {
//         try {
//           const liveRes = await axios.get(`${API_BASE_URL}/ride/${rideId}/live-session`);
          
//           if (liveRes.data.success && liveRes.data.session) {
//             console.log('Found live session:', liveRes.data.session);
//             setSession({
//               session_id: liveRes.data.session.session_id,
//               status: 'driver_started',
//               current_phase: 'boarding',
//               ride_id: rideId,
//               riders: [],
//               boarded_count: 0,
//               dropped_count: 0,
//               total_riders: 0,
//               qr_code_token: liveRes.data.session.qr_code_token || 'N/A',
//               ride_origin: '',
//               ride_destination: '',
//               sos_active: false,
//               emergency_stop_active: false,
//               started_at: new Date().toISOString(),
//             });
//           } else {
//             console.log('No live session found');
//             setSession(null);
//           }
//         } catch (liveError) {
//           console.log('No live session found yet:', liveError);
//           setSession(null);
//         }
//       } else {
//         setSession(null);
//       }
//     } finally {
//       setLoading(false);
//       setRefreshing(false);
//     }
//   }, [rideId, user?.phone_number]);

//   const loadPersonalEmergencyContacts = async () => {
//     if (!user?.phone_number) return [];
    
//     try {
//       const res = await EmergencyContactService.getContacts(user.phone_number);
//       const personalContactsList = res.user || [];
//       setPersonalContacts(personalContactsList);
//       return personalContactsList;
//     } catch (error) {
//       console.error("Error loading personal emergency contacts:", error);
//       return [];
//     }
//   };

//   useEffect(() => {
//     fetchSession();
//     const timer = setInterval(fetchSession, 5000);
//     return () => {
//       clearInterval(timer);
//       if (timerRef.current) clearInterval(timerRef.current);
//       if (locationIntervalRef.current) clearInterval(locationIntervalRef.current);
//       if (socketRef.current) socketRef.current.disconnect();
//     };
//   }, [fetchSession]);

//   useEffect(() => {
//     if (session && session.session_id && session.current_phase !== 'completed' && !session.completed_at) {
//       startLocationTracking();
//       connectSocket();
//     }
//   }, [session, startLocationTracking, connectSocket]);

//   const onRefresh = () => {
//     setRefreshing(true);
//     fetchSession();
//   };

//   const handleDropOff = async (bookingId) => {
//     try {
//       await axios.post(`${API_BASE_URL}/ride-sessions/${session.session_id}/rider-dropped-off`, {
//         booking_id: bookingId,
//         driver_phone: user?.phone_number,
//       });
//       fetchSession();
//       showCustomAlert('Success', 'Rider dropped off successfully', 'success');
//     } catch (error) {
//       showCustomAlert('Error', error?.response?.data?.detail || 'Could not drop off rider', 'error');
//     }
//   };

//   const handleCompleteRide = async () => {
//     try {
//       const response = await axios.post(`${API_BASE_URL}/ride-sessions/${session.session_id}/complete`, {
//         driver_phone: user?.phone_number,
//       });
      
//       // Calculate total earnings from response
//       const earnings = response.data.total_earnings || 
//         session?.riders?.filter(r => r.status === 'dropped_off' || r.status === 'completed')
//           .reduce((sum, rider) => sum + (rider.price_paid || 0), 0) || 0;
      
//       setTotalEarnings(earnings);
//       setRideCompleted(true);
      
//       // Check for unrated riders
//       const unrated = session?.riders?.filter(
//         rider => (rider.status === 'dropped_off' || rider.status === 'completed') && !rider.driver_rating
//       ) || [];
//       setUnratedRiders(unrated);
//       setAllRidersRated(unrated.length === 0);
      
//       showCustomAlert('Ride Completed!', `Ride completed successfully! Total earnings: ₹${earnings}`, 'success');
      
//       if (timerRef.current) {
//         clearInterval(timerRef.current);
//       }
      
//       // Show completion summary
//       setShowCompletionSummary(true);
      
//     } catch (error) {
//       showCustomAlert('Error', error?.response?.data?.detail || 'Could not complete ride', 'error');
//     }
//   };

//   const handleForceCompleteRide = async () => {
//     try {
//       const response = await axios.post(`${API_BASE_URL}/ride-sessions/${session.session_id}/complete-force`, {
//         driver_phone: user?.phone_number,
//       });
      
//       if (response.data) {
//         const earnings = response.data.total_earnings || 0;
//         setTotalEarnings(earnings);
//         setRideCompleted(true);
        
//         const unrated = session?.riders?.filter(
//           rider => (rider.status === 'dropped_off' || rider.status === 'completed') && !rider.driver_rating
//         ) || [];
//         setUnratedRiders(unrated);
//         setAllRidersRated(unrated.length === 0);
        
//         showCustomAlert(
//           'Ride Completed', 
//           `Ride completed successfully! ${response.data.completed_riders} rider(s) were automatically marked as completed. Total earnings: ₹${earnings}`,
//           'success'
//         );
        
//         if (timerRef.current) {
//           clearInterval(timerRef.current);
//         }
        
//         setShowCompletionSummary(true);
//       }
//     } catch (error) {
//       showCustomAlert('Error', error?.response?.data?.detail || 'Could not complete ride', 'error');
//     }
//   };

//   const navigateToDestination = (destination, riderName = null) => {
//     if (destination) {
//       const encodedDest = encodeURIComponent(destination);
//       const url = Platform.select({
//         ios: `maps://?q=${encodedDest}`,
//         android: `https://www.google.com/maps/search/?api=1&query=${encodedDest}`,
//       });
      
//       Linking.canOpenURL(url).then(supported => {
//         if (supported) {
//           Linking.openURL(url);
//         } else {
//           Linking.openURL(`https://www.google.com/maps/search/?api=1&query=${encodedDest}`);
//         }
//       }).catch(() => {
//         showCustomAlert('Error', 'Could not open maps', 'error');
//       });
//     } else {
//       showCustomAlert('Info', 'Destination information not available', 'info');
//     }
//   };

//   const sendWhatsAppMessage = async (phoneNumber, message) => {
//     try {
//       let formattedPhone = phoneNumber.replace(/[^0-9]/g, '');
//       if (formattedPhone.length === 10) {
//         formattedPhone = `91${formattedPhone}`;
//       }
      
//       const url = `whatsapp://send?phone=${formattedPhone}&text=${encodeURIComponent(message)}`;
      
//       const supported = await Linking.canOpenURL(url);
//       if (supported) {
//         await Linking.openURL(url);
//       } else {
//         Linking.openURL(`sms:${phoneNumber}?body=${encodeURIComponent(message)}`);
//       }
//     } catch (error) {
//       console.error('Error sending WhatsApp message:', error);
//       Linking.openURL(`sms:${phoneNumber}?body=${encodeURIComponent(message)}`);
//     }
//   };

//   const handleSOS = async () => {
//     setLoadingContacts(true);
//     setSosModalVisible(true);
    
//     try {
//       const contacts = await loadPersonalEmergencyContacts();
//       if (contacts.length === 0) {
//         showCustomAlert(
//           'No Emergency Contacts',
//           'Please add personal emergency contacts in your profile settings before using SOS.',
//           'warning'
//         );
//         setSosModalVisible(false);
//       }
//     } catch (error) {
//       console.error('Error loading contacts:', error);
//     } finally {
//       setLoadingContacts(false);
//     }
//   };

//   const sendSOSMessage = async (contact) => {
//     const sosMessage = `🚨 *EMERGENCY SOS ALERT* 🚨

// I need immediate help!

// 📍 *Current Status:* Emergency during active ride
// 👤 *Driver:* ${user?.full_name || user?.phone_number || 'Unknown'}
// 🚗 *Ride ID:* ${rideId}
// 📍 *Origin:* ${session?.ride_origin || 'Unknown'}
// 🎯 *Destination:* ${session?.ride_destination || 'Unknown'}
// ⏰ *Time:* ${new Date().toLocaleString()}

// Please contact me immediately!

// ⚠️ This is an automated emergency alert.`;
    
//     await sendWhatsAppMessage(contact.contact_number, sosMessage);
//   };

//   const sendSOSToContact = async (contact) => {
//     setSosSending(true);
    
//     try {
//       await axios.post(`${API_BASE_URL}/ride-sessions/${session.session_id}/sos`, {
//         note: `SOS triggered by driver for contact: ${contact.contact_name} (${contact.contact_number})`,
//         contact_notified: contact.contact_number
//       });
      
//       await sendSOSMessage(contact);
      
//       showCustomAlert(
//         'SOS Sent',
//         `Emergency alert sent to ${contact.contact_name} via WhatsApp. Help is on the way.`,
//         'success'
//       );
      
//       setSosModalVisible(false);
      
//       setTimeout(() => {
//         Alert.alert(
//           'Call Contact?',
//           `Would you like to call ${contact.contact_name} now?`,
//           [
//             { text: 'No', style: 'cancel' },
//             { text: 'Call', onPress: () => Linking.openURL(`tel:${contact.contact_number}`) }
//           ]
//         );
//       }, 1000);
      
//     } catch (error) {
//       console.error('Error sending SOS:', error);
//       showCustomAlert(
//         'SOS Failed',
//         'Could not send SOS alert. Please try again or call emergency services directly.',
//         'error'
//       );
//     } finally {
//       setSosSending(false);
//     }
//   };

//   const sendSOSToAll = async () => {
//     setSosSending(true);
    
//     try {
//       const contacts = personalContacts;
//       if (contacts.length === 0) return;
      
//       let successCount = 0;
      
//       for (const contact of contacts) {
//         try {
//           await axios.post(`${API_BASE_URL}/ride-sessions/${session.session_id}/sos`, {
//             note: `SOS triggered by driver for contact: ${contact.contact_name} (${contact.contact_number})`,
//             contact_notified: contact.contact_number
//           });
          
//           await sendSOSMessage(contact);
//           successCount++;
//         } catch (err) {
//           console.error(`Failed to send SOS to ${contact.contact_name}:`, err);
//         }
//       }
      
//       showCustomAlert(
//         'SOS Sent',
//         `Emergency alert sent to ${successCount} of ${contacts.length} contacts.`,
//         successCount > 0 ? 'success' : 'error'
//       );
      
//       setSosModalVisible(false);
      
//     } catch (error) {
//       console.error('Error sending SOS to all:', error);
//       showCustomAlert('SOS Failed', 'Could not send SOS alerts', 'error');
//     } finally {
//       setSosSending(false);
//     }
//   };

//   const handleEmergencyStop = async () => {
//     Alert.alert(
//       'Emergency Stop',
//       'This will stop the ride and notify all passengers. Are you sure?',
//       [
//         { text: 'Cancel', style: 'cancel' },
//         {
//           text: 'Emergency Stop',
//           style: 'destructive',
//           onPress: async () => {
//             try {
//               await axios.post(`${API_BASE_URL}/ride-sessions/${session.session_id}/emergency-stop`, {
//                 note: 'Emergency stop triggered by driver',
//               });
//               fetchSession();
//               showCustomAlert('Emergency Stop', 'Emergency stop has been activated', 'warning');
//             } catch (error) {
//               showCustomAlert('Error', 'Could not trigger emergency stop', 'error');
//             }
//           },
//         },
//       ]
//     );
//   };

//   const openRateModal = (rider) => {
//     setSelectedRider(rider);
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
    
//     try {
//       await axios.post(`${API_BASE_URL}/ride-sessions/${session.session_id}/rate-rider`, {
//         booking_id: selectedRider.booking_id,
//         rating,
//         feedback,
//       });
      
//       setRatingModalVisible(false);
//       await fetchSession();
      
//       // Update unrated riders list
//       const updatedSession = session;
//       if (updatedSession?.riders) {
//         const updatedRiders = updatedSession.riders.map(r => 
//           r.booking_id === selectedRider.booking_id ? { ...r, driver_rating: rating } : r
//         );
//         const unrated = updatedRiders.filter(
//           rider => (rider.status === 'completed' || rider.status === 'dropped_off') && !rider.driver_rating
//         );
//         setUnratedRiders(unrated);
//         setAllRidersRated(unrated.length === 0);
//       }
      
//       showCustomAlert('Success', 'Thank you for rating this rider!', 'success');
//     } catch (error) {
//       showCustomAlert('Error', error?.response?.data?.detail || 'Could not submit rider rating', 'error');
//     }
//   };

//   const copyQRToken = () => {
//     if (session?.qr_code_token) {
//       Clipboard.setString(session.qr_code_token);
//       showCustomAlert('Copied', 'QR token copied to clipboard', 'success');
//     }
//   };

//   const shareQRCode = async () => {
//     if (!session?.qr_code_token) {
//       showCustomAlert('Error', 'QR code not available', 'error');
//       return;
//     }

//     try {
//       const qrRef = qrCodeRef.current || qrCodeModalRef.current;
      
//       if (qrRef) {
//         qrRef.toDataURL(async (dataURL) => {
//           try {
//             await Share.share({
//               title: 'Boarding QR Code',
//               message: `🚗 *Boarding QR Code for Ride #${rideId}* 🚗\n\nShow this QR code to the driver to board:\n\nToken: ${session.qr_code_token}\n\n⚠️ Keep this code private and only share with your driver.`,
//               url: dataURL,
//             });
//           } catch (error) {
//             console.error('Error sharing QR code image:', error);
//             await Share.share({
//               message: `🚗 *Boarding QR Code for Ride #${rideId}* 🚗\n\nPlease show this code to the driver to board:\n\n*${session.qr_code_token}*\n\n⚠️ Keep this code private and only share with your driver.`,
//               title: 'Share Boarding Code',
//             });
//           }
//         });
//       } else {
//         await Share.share({
//           message: `🚗 *Boarding QR Code for Ride #${rideId}* 🚗\n\nPlease show this code to the driver to board:\n\n*${session.qr_code_token}*\n\n⚠️ Keep this code private and only share with your driver.`,
//           title: 'Share Boarding Code',
//         });
//       }
//     } catch (error) {
//       console.error('Error sharing QR code:', error);
//       showCustomAlert('Error', 'Could not share QR code', 'error');
//     }
//   };

//   const shareQRToken = () => {
//     if (session?.qr_code_token) {
//       Share.share({
//         message: `🚗 *Boarding Code for Ride #${rideId}* 🚗\n\nPlease show this code to the driver to board:\n\n*${session.qr_code_token}*\n\n⚠️ Keep this code private and only share with your driver.`,
//         title: 'Share Boarding Code',
//       });
//     }
//   };

//   const callRider = (phoneNumber) => {
//     Linking.openURL(`tel:${phoneNumber}`);
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

//   const renderSOSContact = ({ item }) => (
//     <TouchableOpacity 
//       style={styles.sosContactCard}
//       onPress={() => {
//         Alert.alert(
//           'Send SOS via WhatsApp',
//           `Send emergency alert to ${item.contact_name}?`,
//           [
//             { text: 'Cancel', style: 'cancel' },
//             { 
//               text: 'Send SOS via WhatsApp', 
//               onPress: () => sendSOSToContact(item),
//               style: 'destructive'
//             }
//           ]
//         );
//       }}
//     >
//       <View style={styles.sosContactAvatar}>
//         <Text style={styles.sosContactAvatarText}>
//           {item.contact_name?.charAt(0).toUpperCase() || '?'}
//         </Text>
//       </View>
//       <View style={styles.sosContactInfo}>
//         <Text style={styles.sosContactName}>{item.contact_name}</Text>
//         <Text style={styles.sosContactPhone}>{item.contact_number}</Text>
//         <View style={styles.whatsappBadge}>
//           <Ionicons name="logo-whatsapp" size={12} color="#25D366" />
//           <Text style={styles.whatsappBadgeText}>WhatsApp</Text>
//         </View>
//       </View>
//       <Ionicons name="logo-whatsapp" size={32} color="#25D366" />
//     </TouchableOpacity>
//   );

//   const renderRiderAvatar = (rider) => {
//     if (rider.rider_photo) {
//       const imageUrl = buildImageUrl(rider.rider_photo);
//       return (
//         <Image 
//           source={{ uri: imageUrl }} 
//           style={styles.avatar} 
//           resizeMode="cover"
//           onError={() => console.log('Failed to load rider image')}
//         />
//       );
//     } else {
//       return (
//         <View style={[styles.avatar, styles.avatarFallback]}>
//           <Text style={styles.avatarText}>
//             {getInitials(rider.rider_name || 'Rider')}
//           </Text>
//         </View>
//       );
//     }
//   };

//   const handleBack = () => {
//     navigation.goBack();
//   };

//   const handleGoToMyRides = () => {
//     navigation.replace('MyRides', { 
//       refresh: true, 
//       tab: 'posted',
//       forceReload: true
//     });
//   };

//   const CompletionSummaryModal = () => (
//     <Modal visible={showCompletionSummary} transparent animationType="slide">
//       <View style={styles.completionModalBackdrop}>
//         <View style={styles.completionModalCard}>
//           <View style={styles.completionHeader}>
//             <Ionicons name="checkmark-circle" size={60} color="#10B981" />
//             <Text style={styles.completionTitle}>Ride Completed!</Text>
//             <Text style={styles.completionSubtitle}>
//               Your ride has been successfully completed
//             </Text>
//           </View>

//           {/* Earnings Section */}
//           <View style={styles.earningsSection}>
//             <Text style={styles.earningsLabel}>Total Earnings from this Ride</Text>
//             <Text style={styles.earningsAmount}>₹{totalEarnings}</Text>
//             <View style={styles.earningsBreakdown}>
//               <Text style={styles.earningsBreakdownText}>
//                 Based on {session?.riders?.filter(r => r.status === 'completed' || r.status === 'dropped_off').length || 0} rider(s)
//               </Text>
//             </View>
//           </View>

//           {/* Rating Section */}
//           <View style={styles.ratingSummarySection}>
//             <Text style={styles.ratingSummaryTitle}>Rate Your Riders</Text>
//             <Text style={styles.ratingSummarySubtitle}>
//               {allRidersRated 
//                 ? "✓ All riders have been rated! Thank you for your feedback." 
//                 : `${unratedRiders.length} rider(s) remaining to rate`}
//             </Text>
            
//             {unratedRiders.length > 0 && (
//               <ScrollView style={styles.unratedRidersList} showsVerticalScrollIndicator={false}>
//                 {unratedRiders.map((rider) => (
//                   <View key={rider.booking_id} style={styles.unratedRiderItem}>
//                     <View style={styles.unratedRiderInfo}>
//                       {renderRiderAvatar(rider)}
//                       <View>
//                         <Text style={styles.unratedRiderName}>{rider.rider_name || 'Rider'}</Text>
//                         <Text style={styles.unratedRiderSeats}>
//                           {rider.seats_booked || 1} seat(s) • ₹{rider.price_paid || 0}
//                         </Text>
//                       </View>
//                     </View>
//                     <TouchableOpacity 
//                       style={styles.rateNowButton}
//                       onPress={() => {
//                         setShowCompletionSummary(false);
//                         openRateModal(rider);
//                       }}>
//                       <Text style={styles.rateNowButtonText}>Rate Now</Text>
//                     </TouchableOpacity>
//                   </View>
//                 ))}
//               </ScrollView>
//             )}
//           </View>

//           <View style={styles.completionActions}>
//             {!allRidersRated && (
//               <TouchableOpacity 
//                 style={styles.rateLaterButton}
//                 onPress={() => {
//                   setShowCompletionSummary(false);
//                   showCustomAlert('Rate Later', 'You can rate your riders from the My Rides section', 'info');
//                 }}>
//                 <Text style={styles.rateLaterButtonText}>Rate Later</Text>
//               </TouchableOpacity>
//             )}
//             <TouchableOpacity 
//               style={[styles.viewRidesButton, allRidersRated && styles.viewRidesButtonFull]}
//               onPress={handleGoToMyRides}>
//               <Ionicons name="car-sport-outline" size={20} color="#fff" />
//               <Text style={styles.viewRidesButtonText}>View My Rides</Text>
//             </TouchableOpacity>
//           </View>
//         </View>
//       </View>
//     </Modal>
//   );

//   if (loading) {
//     return (
//       <SafeAreaView style={styles.centered} edges={['top']}>
//         <StatusBar backgroundColor={Colors.white} barStyle="dark-content" />
//         <ActivityIndicator size="large" color="#184080" />
//         <Text style={styles.loadingText}>Loading ride session...</Text>
//       </SafeAreaView>
//     );
//   }

//   if (!session) {
//     return (
//       <SafeAreaView style={styles.container} edges={['top']}>
//         <StatusBar backgroundColor={Colors.white} barStyle="dark-content" />
        
//         <View style={[styles.header, { paddingTop: insets.top > 0 ? insets.top : 12 }]}>
//           <TouchableOpacity style={styles.modernBackButton} onPress={handleBack}>
//             <MaterialIcons name="arrow-back-ios" size={28} color={Colors.secondary || "#184080"} />
//           </TouchableOpacity>
//           <Text style={styles.headerTitle}>Ride Session</Text>
//           <View style={styles.headerSpacer} />
//         </View>
        
//         <View style={styles.noSessionContainer}>
//           <Ionicons name="car-sport-outline" size={80} color="#D1D5DB" />
//           <Text style={styles.noSessionTitle}>No Active Session</Text>
//           <Text style={styles.noSessionText}>
//             The ride session hasn't been started yet.{'\n'}
//             Please start the ride from the ride details screen.
//           </Text>
//           <TouchableOpacity 
//             style={styles.backButton}
//             onPress={() => navigation.goBack()}
//           >
//             <Text style={styles.backButtonText}>Go Back</Text>
//           </TouchableOpacity>
//         </View>
//       </SafeAreaView>
//     );
//   }

//   const allRidersProcessed = session?.riders?.every(
//     rider => rider.status === 'dropped_off' || rider.status === 'completed'
//   );

//   const allRidersCompleted = session?.riders?.every(
//     rider => rider.status === 'completed'
//   );

//   const boardingPhase = session?.current_phase === 'boarding';
//   const enRoutePhase = session?.current_phase === 'en_route';
//   const hasRiders = session?.riders && session.riders.length > 0;
//   const isRideCompleted = rideCompleted || session?.completed_at;

//   const progressCount = boardingPhase 
//     ? `${session?.boarded_count || 0}/${session?.total_riders || 0}`
//     : `${session?.dropped_count || 0}/${session?.total_riders || 0}`;

//   const progressTitle = boardingPhase ? 'Riders Boarded' : 'Riders Dropped Off';
  
//   const progressPercentage = session?.total_riders 
//     ? ((boardingPhase ? session.boarded_count : session.dropped_count) / session.total_riders) * 100
//     : 0;

//   const showTimer = enRoutePhase && sessionStartTime && !isRideCompleted;
//   const { date: departureDate, time: departureTime } = formatDateTime(session?.departure_time || session?.ride_departure_time);

//   return (
//     <SafeAreaView style={styles.container} edges={['top']}>
//       <StatusBar backgroundColor={Colors.white} barStyle="dark-content" />
      
//       <View style={[styles.header]}>
//         <TouchableOpacity style={styles.modernBackButton} onPress={handleBack}>
//           <MaterialIcons name="arrow-back-ios" size={28} color={Colors.secondary || "#184080"} />
//         </TouchableOpacity>
        
//         <Text style={styles.headerTitle}>
//           {isRideCompleted ? 'Ride Completed' : 'Ride in Progress'}
//         </Text>
        
//         {!isRideCompleted && (
//           <TouchableOpacity 
//             style={styles.infoButton}
//             onPress={handleSOS}
//           >
//             <Ionicons name="shield-outline" size={26} color={Colors.secondary || "#184080"} />
//           </TouchableOpacity>
//         )}
//       </View>

//       {!isRideCompleted ? (
//         <ScrollView
//           style={{ flex: 1 }}
//           contentContainerStyle={{ padding: 16, paddingBottom: 30 }}
//           refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
//           showsVerticalScrollIndicator={false}
//         >
//           {showTimer && (
//             <View style={styles.timerMapRow}>
//               <View style={styles.timerCard}>
//                 <Ionicons name="time-outline" size={20} color="#184080" />
//                 <Text style={styles.timerLabel}>Elapsed Time</Text>
//                 <Text style={styles.timerValue}>{formatElapsedTime(elapsedTime)}</Text>
//               </View>
              
//               <TouchableOpacity style={styles.mapCard} onPress={() => navigateToDestination(session?.ride_destination)}>
//                 <Ionicons name="navigate-outline" size={20} color="#fff" />
//                 <Text style={styles.mapCardText}>Navigate to Destination</Text>
//               </TouchableOpacity>
//             </View>
//           )}

//           <View style={styles.rideInfoCard}>
//             <View style={styles.rideInfoRow}>
//               <View style={styles.rideInfoItem}>
//                 <Ionicons name="calendar-outline" size={16} color="#6B7280" />
//                 <Text style={styles.rideInfoLabel}>Departure</Text>
//                 <Text style={styles.rideInfoValue}>{departureDate}</Text>
//                 <Text style={styles.rideInfoSubValue}>{departureTime}</Text>
//               </View>
//               <View style={styles.rideInfoDivider} />
//               <View style={styles.rideInfoItem}>
//                 <Ionicons name="people-outline" size={16} color="#6B7280" />
//                 <Text style={styles.rideInfoLabel}>Riders</Text>
//                 <Text style={styles.rideInfoValue}>{session?.boarded_count || 0}/{session?.total_riders || 0}</Text>
//                 <Text style={styles.rideInfoSubValue}>Boarded</Text>
//               </View>
//             </View>
//           </View>

//           <View style={styles.progressCard}>
//             <Text style={styles.progressTitle}>{progressTitle}</Text>
//             <Text style={styles.progressCount}>{progressCount}</Text>
//             <View style={styles.progressBarBg}>
//               <View
//                 style={[
//                   styles.progressBarFill,
//                   { width: `${progressPercentage}%` },
//                 ]}
//               />
//             </View>
//           </View>

//           {/* QR Code Section - Riders must scan this to board */}
//           {boardingPhase && (
//             <View style={styles.card}>
//               <View style={styles.cardHeaderRow}>
//                 <Text style={styles.cardTitle}>Boarding QR Code</Text>
//                 <TouchableOpacity onPress={() => setQrModalVisible(true)}>
//                   <Ionicons name="qr-code-outline" size={24} color="#184080" />
//                 </TouchableOpacity>
//               </View>
//               <Text style={styles.cardSub}>Ask riders to scan this QR code with their app to board</Text>
//               <View style={styles.qrBox}>
//                 <View collapsable={false}>
//                   <QRCode
//                     value={session?.qr_code_token || 'N/A'}
//                     size={120}
//                     color="#000000"
//                     backgroundColor="#FFFFFF"
//                     getRef={(ref) => (qrCodeRef.current = ref)}
//                   />
//                 </View>
//                 <Text style={styles.qrToken}>{session?.qr_code_token || 'N/A'}</Text>
//                 <View style={styles.qrActions}>
//                   <TouchableOpacity style={styles.qrActionBtn} onPress={copyQRToken}>
//                     <Ionicons name="copy-outline" size={18} color="#184080" />
//                     <Text style={styles.qrActionText}>Copy Token</Text>
//                   </TouchableOpacity>
//                   <TouchableOpacity style={styles.qrActionBtn} onPress={shareQRCode}>
//                     <Ionicons name="share-outline" size={18} color="#184080" />
//                     <Text style={styles.qrActionText}>Share Code</Text>
//                   </TouchableOpacity>
//                 </View>
//               </View>
//               <View style={styles.boardingInstructionCard}>
//                 <Ionicons name="information-circle-outline" size={20} color="#184080" />
//                 <Text style={styles.boardingInstructionText}>
//                   Riders must scan this QR code using their app to board the ride. You cannot manually mark them as boarded.
//                 </Text>
//               </View>
//             </View>
//           )}

//           <View style={styles.card}>
//             <Text style={styles.cardTitle}>
//               {boardingPhase ? 'Riders to Pick Up' : 'Passengers On Board'}
//             </Text>

//             {!hasRiders ? (
//               <View style={styles.noRidersContainer}>
//                 <Ionicons name="people-outline" size={48} color="#D1D5DB" />
//                 <Text style={styles.noRidersText}>No riders for this ride</Text>
//               </View>
//             ) : (
//               session?.riders?.map((rider) => {
//                 const isBoarded = ['boarded', 'dropped_off', 'completed'].includes(rider.status);
//                 const isDropped = ['dropped_off', 'completed'].includes(rider.status);
//                 const isCompleted = rider.status === 'completed';
//                 const isRated = !!rider.driver_rating;
                
//                 let statusText = 'Pending';
//                 let statusColor = '#1D4ED8';
//                 let statusBg = '#EFF6FF';
//                 let statusIcon = 'time-outline';
                
//                 if (isCompleted) {
//                   statusText = 'Completed';
//                   statusColor = '#6B7280';
//                   statusBg = '#F3F4F6';
//                   statusIcon = 'checkmark-circle-outline';
//                 } else if (isDropped) {
//                   statusText = 'Dropped Off';
//                   statusColor = '#9333EA';
//                   statusBg = '#F3E8FF';
//                   statusIcon = 'flag-outline';
//                 } else if (isBoarded) {
//                   statusText = 'On Board';
//                   statusColor = '#16A34A';
//                   statusBg = '#DCFCE7';
//                   statusIcon = 'checkmark-circle-outline';
//                 }

//                 const navigateLocation = boardingPhase && !isBoarded 
//                   ? rider.pickup_location 
//                   : (!boardingPhase && !isDropped && !isCompleted ? rider.dropoff_location : null);

//                 const boardedAt = rider.boarded_at ? new Date(rider.boarded_at).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true }) : null;
//                 const droppedAt = rider.dropped_off_at ? new Date(rider.dropped_off_at).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true }) : null;

//                 return (
//                   <View key={rider.id || rider.booking_id} style={styles.riderCard}>
//                     <View style={styles.riderTop}>
//                       <View style={styles.riderInfo}>
//                         {renderRiderAvatar(rider)}
//                         <View style={{ flex: 1 }}>
//                           <Text style={styles.riderName}>{rider.rider_name || 'Rider'}</Text>
//                           <Text style={styles.riderPhone}>{rider.rider_phone}</Text>
//                           <Text style={styles.riderLocationLabel}>
//                             {boardingPhase ? 'Pickup Location' : 'Drop-off Location'}
//                           </Text>
//                           <Text style={styles.riderLocation} numberOfLines={2}>
//                             {boardingPhase ? rider.pickup_location : rider.dropoff_location}
//                           </Text>
//                           {boardedAt && !boardingPhase && (
//                             <Text style={styles.timingText}>✓ Boarded at: {boardedAt}</Text>
//                           )}
//                           {droppedAt && (
//                             <Text style={styles.timingText}>✓ Dropped at: {droppedAt}</Text>
//                           )}
//                           {isRated && (
//                             <View style={styles.ratedBadge}>
//                               <Ionicons name="star" size={12} color="#F59E0B" />
//                               <Text style={styles.ratedBadgeText}>Rated {rider.driver_rating}/5</Text>
//                             </View>
//                           )}
//                         </View>
//                       </View>

//                       <View style={[styles.statusPill, { backgroundColor: statusBg }]}>
//                         <Ionicons name={statusIcon} size={12} color={statusColor} style={{ marginRight: 4 }} />
//                         <Text style={[styles.statusPillText, { color: statusColor }]}>
//                           {statusText}
//                         </Text>
//                       </View>
//                     </View>

//                     {!isCompleted && (
//                       <View style={styles.riderActions}>
//                         <TouchableOpacity 
//                           style={[styles.callBtn, styles.flexButton]} 
//                           onPress={() => callRider(rider.rider_phone)}
//                         >
//                           <Ionicons name="call-outline" size={18} color="#184080" />
//                           <Text style={styles.callBtnText}>Call</Text>
//                         </TouchableOpacity>

//                         {navigateLocation && (
//                           <TouchableOpacity 
//                             style={[styles.navigateBtn, styles.flexButton]} 
//                             onPress={() => navigateToDestination(navigateLocation, rider.rider_name)}
//                           >
//                             <Ionicons name="navigate-outline" size={18} color="#fff" />
//                             <Text style={styles.navigateBtnText}>
//                               {boardingPhase && !isBoarded ? 'Navigate' : 'Navigate'}
//                             </Text>
//                           </TouchableOpacity>
//                         )}

//                         {/* Drop off button - Only shown after rider has boarded */}
//                         {!boardingPhase && !isDropped && isBoarded && (
//                           <TouchableOpacity 
//                             style={[styles.dropBtn, styles.flexButton]} 
//                             onPress={() => handleDropOff(rider.booking_id)}
//                           >
//                             <Ionicons name="flag-outline" size={18} color="#fff" />
//                             <Text style={styles.dropBtnText}>Drop Off</Text>
//                           </TouchableOpacity>
//                         )}

//                         {/* Rate button - Only shown after drop off and not rated yet */}
//                         {isDropped && !isCompleted && !isRated && (
//                           <TouchableOpacity style={[styles.rateBtn, styles.flexButton]} onPress={() => openRateModal(rider)}>
//                             <Ionicons name="star-outline" size={16} color="#D97706" />
//                             <Text style={styles.rateBtnText}>Rate</Text>
//                           </TouchableOpacity>
//                         )}

//                         {/* Show pending message for riders not boarded yet */}
//                         {boardingPhase && !isBoarded && (
//                           <View style={styles.pendingMessage}>
//                             <Ionicons name="qr-code-outline" size={16} color="#F59E0B" />
//                             <Text style={styles.pendingMessageText}>Waiting for scan</Text>
//                           </View>
//                         )}
//                       </View>
//                     )}
//                   </View>
//                 );
//               })
//             )}
//           </View>

//           <View style={styles.card}>
//             <Text style={styles.cardTitle}>Trip Information</Text>
//             <View style={styles.tripInfoRow}>
//               <View style={styles.tripInfoItem}>
//                 <Ionicons name="location-outline" size={18} color="#184080" />
//                 <Text style={styles.tripInfoLabel}>From</Text>
//                 <Text style={styles.tripInfoValue}>{session?.ride_origin?.split(',')[0] || 'Pickup'}</Text>
//                 {session?.ride_origin && (
//                   <TouchableOpacity 
//                     style={styles.smallNavigateBtn} 
//                     onPress={() => navigateToDestination(session?.ride_origin)}
//                   >
//                     <Ionicons name="navigate-outline" size={14} color="#184080" />
//                     <Text style={styles.smallNavigateText}>Navigate</Text>
//                   </TouchableOpacity>
//                 )}
//               </View>
//               <View style={styles.tripInfoItem}>
//                 <Ionicons name="flag-outline" size={18} color="#184080" />
//                 <Text style={styles.tripInfoLabel}>To</Text>
//                 <Text style={styles.tripInfoValue}>{session?.ride_destination?.split(',')[0] || 'Destination'}</Text>
//                 {session?.ride_destination && (
//                   <TouchableOpacity 
//                     style={styles.smallNavigateBtn} 
//                     onPress={() => navigateToDestination(session?.ride_destination)}
//                   >
//                     <Ionicons name="navigate-outline" size={14} color="#184080" />
//                     <Text style={styles.smallNavigateText}>Navigate</Text>
//                   </TouchableOpacity>
//                 )}
//               </View>
//             </View>
//           </View>

//           {allRidersProcessed && session?.total_riders > 0 && !allRidersCompleted && !isRideCompleted && (
//             <TouchableOpacity
//               style={styles.completeRideBtn}
//               onPress={() => setShowCompleteConfirm(true)}
//             >
//               <Ionicons name="checkmark-done-outline" size={20} color="#fff" />
//               <Text style={styles.completeRideText}>Complete Ride</Text>
//             </TouchableOpacity>
//           )}

//           {!allRidersProcessed && session?.total_riders > 0 && !allRidersCompleted && !isRideCompleted && (
//             <TouchableOpacity
//               style={styles.forceCompleteBtn}
//               onPress={() => setShowForceCompleteConfirm(true)}
//             >
//               <Ionicons name="flag-outline" size={20} color="#fff" />
//               <Text style={styles.forceCompleteText}>Force Complete Ride</Text>
//             </TouchableOpacity>
//           )}
//         </ScrollView>
//       ) : (
//         // Ride Completed View - Show Completion Summary
//         <ScrollView
//           style={{ flex: 1 }}
//           contentContainerStyle={{ padding: 16, paddingBottom: 30 }}
//           showsVerticalScrollIndicator={false}
//         >
//           {/* Completion Header */}
//           <View style={styles.completedHeaderCard}>
//             <Ionicons name="checkmark-circle" size={60} color="#10B981" />
//             <Text style={styles.completedTitle}>Ride Completed!</Text>
//             <Text style={styles.completedSubtitle}>
//               Great job! This ride has been successfully completed.
//             </Text>
//           </View>

//           {/* Earnings Card */}
//           <View style={styles.earningsCard}>
//             <Text style={styles.earningsCardLabel}>Total Earnings</Text>
//             <Text style={styles.earningsCardAmount}>₹{totalEarnings}</Text>
//             <View style={styles.earningsDivider} />
//             <View style={styles.earningsBreakdownCard}>
//               <Text style={styles.earningsBreakdownTitle}>Breakdown</Text>
//               {session?.riders?.filter(r => r.status === 'completed' || r.status === 'dropped_off').map((rider, index) => (
//                 <View key={index} style={styles.earningsRow}>
//                   <Text style={styles.earningsRowName}>{rider.rider_name || 'Rider'}</Text>
//                   <Text style={styles.earningsRowAmount}>₹{rider.price_paid || rider.seats_booked * (session.price_per_seat || 0)}</Text>
//                 </View>
//               ))}
//             </View>
//           </View>

//           {/* Rating Section */}
//           <View style={styles.ratingCard}>
//             <Text style={styles.ratingCardTitle}>Rate Your Riders</Text>
//             <Text style={styles.ratingCardSubtitle}>
//               {allRidersRated 
//                 ? "✓ All riders have been rated! Thank you for your feedback." 
//                 : `${unratedRiders.length} rider(s) remaining to rate`}
//             </Text>
            
//             {unratedRiders.length > 0 && (
//               <View style={styles.unratedRidersContainer}>
//                 {unratedRiders.map((rider) => (
//                   <View key={rider.booking_id} style={styles.completionRiderItem}>
//                     <View style={styles.completionRiderInfo}>
//                       {renderRiderAvatar(rider)}
//                       <View>
//                         <Text style={styles.completionRiderName}>{rider.rider_name || 'Rider'}</Text>
//                         <Text style={styles.completionRiderDetails}>
//                           {rider.seats_booked || 1} seat(s) • ₹{rider.price_paid || 0}
//                         </Text>
//                       </View>
//                     </View>
//                     <TouchableOpacity 
//                       style={styles.completionRateButton}
//                       onPress={() => openRateModal(rider)}>
//                       <Text style={styles.completionRateButtonText}>Rate Now</Text>
//                     </TouchableOpacity>
//                   </View>
//                 ))}
//               </View>
//             )}
//           </View>

//           {/* Action Buttons */}
//           <View style={styles.completionActionButtons}>
//             {!allRidersRated && (
//               <TouchableOpacity 
//                 style={styles.laterButton}
//                 onPress={handleGoToMyRides}>
//                 <Text style={styles.laterButtonText}>Rate Later</Text>
//               </TouchableOpacity>
//             )}
//             <TouchableOpacity 
//               style={[styles.viewRidesButton, allRidersRated && styles.viewRidesButtonFull]}
//               onPress={handleGoToMyRides}>
//               <Ionicons name="car-sport-outline" size={20} color="#fff" />
//               <Text style={styles.viewRidesButtonText}>View My Rides</Text>
//             </TouchableOpacity>
//           </View>
//         </ScrollView>
//       )}

//       <Modal visible={sosModalVisible} animationType="slide" transparent>
//         <View style={styles.sosModalBackdrop}>
//           <View style={[styles.sosModalCard, { paddingBottom: insets.bottom > 0 ? insets.bottom : 20 }]}>
//             <View style={styles.sosModalHeader}>
//               <Text style={styles.sosModalTitle}>Emergency SOS</Text>
//               <TouchableOpacity onPress={() => setSosModalVisible(false)}>
//                 <Ionicons name="close" size={24} color="#6B7280" />
//               </TouchableOpacity>
//             </View>
            
//             <Text style={styles.sosModalSubtitle}>
//               Select who to notify in this emergency (WhatsApp message will be sent)
//             </Text>
            
//             {loadingContacts ? (
//               <View style={styles.sosLoadingContainer}>
//                 <ActivityIndicator size="large" color="#E11D48" />
//                 <Text style={styles.sosLoadingText}>Loading contacts...</Text>
//               </View>
//             ) : personalContacts.length === 0 ? (
//               <View style={styles.sosEmptyContainer}>
//                 <Ionicons name="call-outline" size={60} color="#D1D5DB" />
//                 <Text style={styles.sosEmptyText}>No personal emergency contacts found</Text>
//                 <Text style={styles.sosEmptySubtext}>
//                   Please add personal emergency contacts in your profile settings
//                 </Text>
//                 <TouchableOpacity 
//                   style={styles.sosAddContactBtn}
//                   onPress={() => {
//                     setSosModalVisible(false);
//                     navigation.navigate('EmergencyContactsScreen');
//                   }}
//                 >
//                   <Text style={styles.sosAddContactBtnText}>Add Contacts</Text>
//                 </TouchableOpacity>
//               </View>
//             ) : (
//               <>
//                 <FlatList
//                   data={personalContacts}
//                   keyExtractor={(item) => item.id?.toString() || item.contact_number}
//                   renderItem={renderSOSContact}
//                   contentContainerStyle={styles.sosContactList}
//                   showsVerticalScrollIndicator={false}
//                 />
                
//                 {personalContacts.length > 1 && (
//                   <TouchableOpacity 
//                     style={styles.sosAllButton}
//                     onPress={sendSOSToAll}
//                     disabled={sosSending}
//                   >
//                     {sosSending ? (
//                       <ActivityIndicator size="small" color="#fff" />
//                     ) : (
//                       <>
//                         <Ionicons name="notifications" size={20} color="#fff" />
//                         <Text style={styles.sosAllButtonText}>Notify All Contacts</Text>
//                       </>
//                     )}
//                   </TouchableOpacity>
//                 )}
//               </>
//             )}
//           </View>
//         </View>
//       </Modal>

//       <Modal visible={showCompleteConfirm} transparent animationType="fade">
//         <View style={styles.modalBackdrop}>
//           <View style={styles.modalCard}>
//             <Ionicons name="checkmark-circle-outline" size={48} color="#10B981" />
//             <Text style={styles.modalTitle}>Complete Ride?</Text>
//             <Text style={styles.modalSub}>
//               Are you sure you want to complete this ride? All riders have been dropped off.
//             </Text>
//             <View style={styles.modalActions}>
//               <TouchableOpacity style={styles.cancelBtn} onPress={() => setShowCompleteConfirm(false)}>
//                 <Text style={styles.cancelBtnText}>Cancel</Text>
//               </TouchableOpacity>
//               <TouchableOpacity style={styles.confirmBtn} onPress={handleCompleteRide}>
//                 <Text style={styles.confirmBtnText}>Complete</Text>
//               </TouchableOpacity>
//             </View>
//           </View>
//         </View>
//       </Modal>

//       <Modal visible={showForceCompleteConfirm} transparent animationType="fade">
//         <View style={styles.modalBackdrop}>
//           <View style={styles.modalCard}>
//             <Ionicons name="alert-circle-outline" size={48} color="#DC2626" />
//             <Text style={[styles.modalTitle, { color: '#DC2626' }]}>Force Complete Ride?</Text>
//             <Text style={styles.modalSub}>
//               Any riders not marked as dropped off will be automatically completed.
//               This action cannot be undone.
//             </Text>
//             <View style={styles.modalActions}>
//               <TouchableOpacity style={styles.cancelBtn} onPress={() => setShowForceCompleteConfirm(false)}>
//                 <Text style={styles.cancelBtnText}>Cancel</Text>
//               </TouchableOpacity>
//               <TouchableOpacity style={[styles.confirmBtn, { backgroundColor: '#DC2626' }]} onPress={handleForceCompleteRide}>
//                 <Text style={styles.confirmBtnText}>Force Complete</Text>
//               </TouchableOpacity>
//             </View>
//           </View>
//         </View>
//       </Modal>

//       <Modal visible={qrModalVisible} transparent animationType="fade">
//         <View style={styles.qrModalBackdrop}>
//           <View style={styles.qrModalCard}>
//             <TouchableOpacity style={styles.qrCloseBtn} onPress={() => setQrModalVisible(false)}>
//               <Ionicons name="close" size={24} color="#111827" />
//             </TouchableOpacity>
//             <Text style={styles.qrModalTitle}>Boarding QR Code</Text>
//             <View style={styles.qrModalBox}>
//               <QRCode
//                 value={session?.qr_code_token || 'N/A'}
//                 size={200}
//                 color="#000000"
//                 backgroundColor="#FFFFFF"
//                 getRef={(ref) => (qrCodeModalRef.current = ref)}
//               />
//               <Text style={styles.qrModalToken}>{session?.qr_code_token || 'N/A'}</Text>
//             </View>
//             <Text style={styles.qrModalText}>
//               Ask riders to scan this QR code with their app to board the ride
//             </Text>
//             <TouchableOpacity style={styles.copyTokenBtn} onPress={shareQRCode}>
//               <Ionicons name="share-outline" size={20} color="#fff" />
//               <Text style={styles.copyTokenBtnText}>Share QR Code</Text>
//             </TouchableOpacity>
//           </View>
//         </View>
//       </Modal>

//       <Modal visible={ratingModalVisible} transparent animationType="fade">
//         <View style={styles.modalBackdrop}>
//           <View style={styles.modalCard}>
//             <Text style={styles.modalTitle}>Rate Your Rider</Text>
//             <Text style={styles.modalSub}>
//               How was your ride with {selectedRider?.rider_name || 'this rider'}?
//             </Text>

//             {renderStars()}

//             <TextInput
//               value={feedback}
//               onChangeText={setFeedback}
//               placeholder="Share your feedback (optional)"
//               multiline
//               style={styles.feedbackInput}
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
//                 <Text style={styles.submitBtnText}>Submit</Text>
//               </TouchableOpacity>
//             </View>
//           </View>
//         </View>
//       </Modal>

//       {/* Completion Summary Modal */}
//       <CompletionSummaryModal />

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

// const styles = StyleSheet.create({
//   container: { 
//     flex: 1, 
//     backgroundColor: Colors.white || '#F4F7FB' 
//   },
//   centered: { 
//     flex: 1, 
//     justifyContent: 'center', 
//     alignItems: 'center', 
//     backgroundColor: Colors.white || '#fff' 
//   },
//   loadingText: { 
//     marginTop: 12, 
//     fontSize: 14, 
//     color: '#6B7280' 
//   },
  
//   header: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     paddingHorizontal: 16,
//     paddingBottom: 12,
//     borderBottomWidth: 0.5,
//     borderBottomColor: '#F3F4F6',
//     backgroundColor: Colors.white || '#fff',
//   },
//   modernBackButton: {
//     width: 44,
//     height: 44,
//     borderRadius: 22,
//     justifyContent: 'center',
//     alignItems: 'center',
//   },
//   headerTitle: {
//     fontSize: 28,
//     fontWeight: '700',
//     color: Colors.primary || '#184080',
//     flex: 1,
//     textAlign: 'center',
//   },
//   infoButton: {
//     width: 44,
//     height: 44,
//     borderRadius: 22,
//     justifyContent: 'center',
//     alignItems: 'center',
//   },
//   headerSpacer: {
//     width: 44,
//   },
  
//   rideInfoCard: {
//     backgroundColor: '#fff',
//     borderRadius: 16,
//     padding: 16,
//     marginBottom: 14,
//     borderWidth: 1,
//     borderColor: '#E7ECF4',
//   },
//   rideInfoRow: {
//     flexDirection: 'row',
//     alignItems: 'center',
//   },
//   rideInfoItem: {
//     flex: 1,
//     alignItems: 'center',
//   },
//   rideInfoLabel: {
//     fontSize: 11,
//     color: '#6B7280',
//     marginTop: 4,
//   },
//   rideInfoValue: {
//     fontSize: 16,
//     fontWeight: '700',
//     color: '#184080',
//     marginTop: 2,
//   },
//   rideInfoSubValue: {
//     fontSize: 12,
//     color: '#6B7280',
//     marginTop: 2,
//   },
//   rideInfoDivider: {
//     width: 1,
//     height: 40,
//     backgroundColor: '#E5E7EB',
//   },
  
//   timerMapRow: {
//     flexDirection: 'row',
//     gap: 12,
//     marginBottom: 14,
//   },
//   timerCard: {
//     flex: 1,
//     backgroundColor: '#F0F7FF',
//     borderRadius: 16,
//     padding: 14,
//     alignItems: 'center',
//     borderWidth: 1,
//     borderColor: '#E0ECFF',
//   },
//   timerLabel: {
//     fontSize: 12,
//     color: '#6B7280',
//     marginTop: 4,
//   },
//   timerValue: {
//     fontSize: 18,
//     fontWeight: '700',
//     color: '#184080',
//     marginTop: 2,
//   },
//   mapCard: {
//     flex: 1,
//     backgroundColor: '#184080',
//     borderRadius: 16,
//     padding: 14,
//     alignItems: 'center',
//     justifyContent: 'center',
//     flexDirection: 'row',
//     gap: 8,
//   },
//   mapCardText: {
//     fontSize: 13,
//     fontWeight: '600',
//     color: '#fff',
//   },
  
//   progressCard: {
//     backgroundColor: '#2E5AAC',
//     borderRadius: 18,
//     padding: 16,
//     marginBottom: 14,
//   },
//   progressTitle: { 
//     color: '#DCE8FF', 
//     fontSize: 13, 
//     marginBottom: 4 
//   },
//   progressCount: { 
//     color: '#fff', 
//     fontSize: 18, 
//     fontWeight: '700', 
//     marginBottom: 12 
//   },
//   progressBarBg: { 
//     height: 10, 
//     borderRadius: 10, 
//     backgroundColor: 'rgba(255,255,255,0.2)' 
//   },
//   progressBarFill: { 
//     height: 10, 
//     borderRadius: 10, 
//     backgroundColor: '#FF8A00' 
//   },
  
//   card: {
//     backgroundColor: '#fff',
//     borderRadius: 18,
//     padding: 16,
//     marginBottom: 14,
//     borderWidth: 1,
//     borderColor: '#E7ECF4',
//   },
//   cardHeaderRow: {
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//     alignItems: 'center',
//     marginBottom: 4,
//   },
//   cardTitle: { 
//     color: '#1C2746', 
//     fontSize: 16, 
//     fontWeight: '700' 
//   },
//   cardSub: { 
//     color: '#7A8599', 
//     fontSize: 13, 
//     marginTop: 4, 
//     marginBottom: 12 
//   },
  
//   qrBox: { 
//     alignItems: 'center', 
//     justifyContent: 'center', 
//     backgroundColor: '#F8FAFC', 
//     borderRadius: 16, 
//     padding: 20,
//   },
//   qrToken: { 
//     marginTop: 12, 
//     fontSize: 14, 
//     color: '#667085', 
//     textAlign: 'center', 
//     fontFamily: 'monospace' 
//   },
//   qrActions: {
//     flexDirection: 'row',
//     marginTop: 12,
//     gap: 16,
//   },
//   qrActionBtn: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     gap: 6,
//     paddingHorizontal: 12,
//     paddingVertical: 6,
//     backgroundColor: '#E8EEF9',
//     borderRadius: 8,
//   },
//   qrActionText: { 
//     color: '#184080', 
//     fontSize: 12, 
//     fontWeight: '500' 
//   },
  
//   boardingInstructionCard: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     backgroundColor: '#EFF6FF',
//     borderRadius: 12,
//     padding: 12,
//     marginTop: 16,
//     gap: 10,
//   },
//   boardingInstructionText: {
//     flex: 1,
//     fontSize: 12,
//     color: '#184080',
//     lineHeight: 18,
//   },
  
//   riderCard: { 
//     borderWidth: 1, 
//     borderColor: '#E5E7EB', 
//     borderRadius: 16, 
//     padding: 14, 
//     marginTop: 12,
//   },
//   riderTop: { 
//     flexDirection: 'row', 
//     justifyContent: 'space-between', 
//     alignItems: 'flex-start', 
//     gap: 10,
//   },
//   riderInfo: { 
//     flexDirection: 'row', 
//     flex: 1 
//   },
//   avatar: { 
//     width: 52, 
//     height: 52, 
//     borderRadius: 26, 
//     marginRight: 12 
//   },
//   avatarFallback: { 
//     backgroundColor: '#E8EEF9', 
//     justifyContent: 'center', 
//     alignItems: 'center' 
//   },
//   avatarText: { 
//     color: '#184080', 
//     fontWeight: '700', 
//     fontSize: 18 
//   },
//   riderName: { 
//     color: '#132238', 
//     fontSize: 15, 
//     fontWeight: '700' 
//   },
//   riderPhone: { 
//     color: '#667085', 
//     fontSize: 13, 
//     marginTop: 2 
//   },
//   riderLocationLabel: { 
//     color: '#667085', 
//     fontSize: 11, 
//     marginTop: 8 
//   },
//   riderLocation: { 
//     color: '#111827', 
//     fontSize: 13, 
//     fontWeight: '500', 
//     marginTop: 2 
//   },
//   timingText: {
//     fontSize: 11,
//     color: '#10B981',
//     marginTop: 4,
//   },
//   ratedBadge: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     marginTop: 4,
//     gap: 4,
//   },
//   ratedBadgeText: {
//     fontSize: 10,
//     color: '#F59E0B',
//     fontWeight: '500',
//   },
//   statusPill: { 
//     flexDirection: 'row',
//     alignItems: 'center',
//     paddingHorizontal: 10, 
//     paddingVertical: 6, 
//     borderRadius: 999 
//   },
//   statusPillText: { 
//     fontSize: 12, 
//     fontWeight: '700' 
//   },
//   riderActions: {
//     flexDirection: 'row',
//     marginTop: 14,
//     gap: 10,
//     flexWrap: 'wrap',
//     alignItems: 'center',
//   },
//   flexButton: {
//     flex: 1,
//     minWidth: 100,
//   },
//   callBtn: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     justifyContent: 'center',
//     gap: 6,
//     paddingHorizontal: 14,
//     paddingVertical: 10,
//     borderRadius: 10,
//     borderWidth: 1,
//     borderColor: '#184080',
//     backgroundColor: '#fff',
//   },
//   callBtnText: { 
//     color: '#184080', 
//     fontWeight: '600', 
//     fontSize: 13 
//   },
//   navigateBtn: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     justifyContent: 'center',
//     gap: 6,
//     paddingHorizontal: 14,
//     paddingVertical: 10,
//     borderRadius: 10,
//     backgroundColor: '#10B981',
//   },
//   navigateBtnText: {
//     color: '#fff',
//     fontWeight: '600',
//     fontSize: 13,
//   },
//   dropBtn: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     justifyContent: 'center',
//     gap: 6,
//     backgroundColor: '#7C3AED',
//     borderRadius: 10,
//     paddingVertical: 10,
//   },
//   dropBtnText: { 
//     color: '#fff', 
//     fontWeight: '700', 
//     fontSize: 13 
//   },
//   rateBtn: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     justifyContent: 'center',
//     gap: 6,
//     borderWidth: 1,
//     borderColor: '#F59E0B',
//     borderRadius: 10,
//     paddingVertical: 10,
//     paddingHorizontal: 14,
//   },
//   rateBtnText: { 
//     color: '#D97706', 
//     fontWeight: '700', 
//     fontSize: 13 
//   },
//   pendingMessage: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     justifyContent: 'center',
//     gap: 6,
//     paddingVertical: 10,
//     paddingHorizontal: 12,
//     backgroundColor: '#FEF3C7',
//     borderRadius: 10,
//   },
//   pendingMessageText: {
//     fontSize: 12,
//     color: '#D97706',
//     fontWeight: '500',
//   },
  
//   tripInfoRow: {
//     flexDirection: 'row',
//     marginTop: 12,
//     gap: 16,
//   },
//   tripInfoItem: {
//     flex: 1,
//     alignItems: 'center',
//     padding: 12,
//     backgroundColor: '#F8FAFC',
//     borderRadius: 12,
//     position: 'relative',
//   },
//   tripInfoLabel: { 
//     fontSize: 12, 
//     color: '#6B7280', 
//     marginTop: 4 
//   },
//   tripInfoValue: { 
//     fontSize: 14, 
//     fontWeight: '600', 
//     color: '#111827', 
//     marginTop: 2, 
//     textAlign: 'center' 
//   },
//   smallNavigateBtn: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     gap: 4,
//     marginTop: 8,
//     paddingHorizontal: 8,
//     paddingVertical: 4,
//     backgroundColor: '#E8EEF9',
//     borderRadius: 12,
//   },
//   smallNavigateText: {
//     fontSize: 10,
//     color: '#184080',
//     fontWeight: '500',
//   },
  
//   completeRideBtn: {
//     backgroundColor: '#10B981',
//     borderRadius: 16,
//     paddingVertical: 15,
//     alignItems: 'center',
//     justifyContent: 'center',
//     flexDirection: 'row',
//     gap: 8,
//     marginBottom: 12,
//   },
//   completeRideText: { 
//     color: '#fff', 
//     fontWeight: '700', 
//     fontSize: 15 
//   },
//   forceCompleteBtn: {
//     backgroundColor: '#DC2626',
//     borderRadius: 16,
//     paddingVertical: 15,
//     alignItems: 'center',
//     justifyContent: 'center',
//     flexDirection: 'row',
//     gap: 8,
//     marginBottom: 12,
//   },
//   forceCompleteText: {
//     color: '#fff',
//     fontWeight: '700',
//     fontSize: 15,
//   },
  
//   // Completed Ride Styles
//   completedHeaderCard: {
//     backgroundColor: '#fff',
//     borderRadius: 20,
//     padding: 24,
//     alignItems: 'center',
//     marginBottom: 16,
//     borderWidth: 1,
//     borderColor: '#E5E7EB',
//   },
//   completedTitle: {
//     fontSize: 24,
//     fontWeight: '700',
//     color: '#10B981',
//     marginTop: 12,
//   },
//   completedSubtitle: {
//     fontSize: 14,
//     color: '#6B7280',
//     textAlign: 'center',
//     marginTop: 8,
//   },
  
//   earningsCard: {
//     backgroundColor: '#fff',
//     borderRadius: 20,
//     padding: 20,
//     marginBottom: 16,
//     borderWidth: 1,
//     borderColor: '#E5E7EB',
//   },
//   earningsCardLabel: {
//     fontSize: 14,
//     color: '#6B7280',
//     textAlign: 'center',
//   },
//   earningsCardAmount: {
//     fontSize: 36,
//     fontWeight: '800',
//     color: '#184080',
//     textAlign: 'center',
//     marginTop: 8,
//   },
//   earningsDivider: {
//     height: 1,
//     backgroundColor: '#E5E7EB',
//     marginVertical: 16,
//   },
//   earningsBreakdownCard: {
//     backgroundColor: '#F8FAFC',
//     borderRadius: 12,
//     padding: 12,
//   },
//   earningsBreakdownTitle: {
//     fontSize: 14,
//     fontWeight: '600',
//     color: '#111827',
//     marginBottom: 12,
//   },
//   earningsRow: {
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//     paddingVertical: 6,
//   },
//   earningsRowName: {
//     fontSize: 13,
//     color: '#6B7280',
//   },
//   earningsRowAmount: {
//     fontSize: 13,
//     fontWeight: '600',
//     color: '#184080',
//   },
  
//   ratingCard: {
//     backgroundColor: '#fff',
//     borderRadius: 20,
//     padding: 20,
//     marginBottom: 16,
//     borderWidth: 1,
//     borderColor: '#E5E7EB',
//   },
//   ratingCardTitle: {
//     fontSize: 18,
//     fontWeight: '700',
//     color: '#111827',
//     marginBottom: 4,
//   },
//   ratingCardSubtitle: {
//     fontSize: 13,
//     color: '#6B7280',
//     marginBottom: 16,
//   },
//   unratedRidersContainer: {
//     marginTop: 8,
//   },
//   completionRiderItem: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     justifyContent: 'space-between',
//     paddingVertical: 12,
//     borderBottomWidth: 1,
//     borderBottomColor: '#F0F0F0',
//   },
//   completionRiderInfo: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     gap: 12,
//   },
//   completionRiderName: {
//     fontSize: 15,
//     fontWeight: '600',
//     color: '#111827',
//   },
//   completionRiderDetails: {
//     fontSize: 12,
//     color: '#6B7280',
//     marginTop: 2,
//   },
//   completionRateButton: {
//     backgroundColor: '#184080',
//     paddingHorizontal: 16,
//     paddingVertical: 8,
//     borderRadius: 20,
//   },
//   completionRateButtonText: {
//     color: '#fff',
//     fontSize: 12,
//     fontWeight: '600',
//   },
  
//   completionActionButtons: {
//     flexDirection: 'row',
//     gap: 12,
//     marginBottom: 20,
//   },
//   laterButton: {
//     flex: 1,
//     backgroundColor: '#F3F4F6',
//     borderRadius: 14,
//     paddingVertical: 14,
//     alignItems: 'center',
//   },
//   laterButtonText: {
//     color: '#6B7280',
//     fontSize: 15,
//     fontWeight: '600',
//   },
//   viewRidesButton: {
//     flex: 1,
//     backgroundColor: '#184080',
//     borderRadius: 14,
//     paddingVertical: 14,
//     alignItems: 'center',
//     justifyContent: 'center',
//     flexDirection: 'row',
//     gap: 8,
//   },
//   viewRidesButtonFull: {
//     flex: 1,
//   },
//   viewRidesButtonText: {
//     color: '#fff',
//     fontSize: 15,
//     fontWeight: '700',
//   },
  
//   // Completion Modal Styles
//   completionModalBackdrop: {
//     flex: 1,
//     backgroundColor: 'rgba(0,0,0,0.5)',
//     justifyContent: 'center',
//     alignItems: 'center',
//   },
//   completionModalCard: {
//     backgroundColor: '#fff',
//     borderRadius: 28,
//     width: width - 40,
//     maxHeight: '85%',
//     overflow: 'hidden',
//   },
//   completionHeader: {
//     alignItems: 'center',
//     padding: 24,
//     borderBottomWidth: 1,
//     borderBottomColor: '#E5E7EB',
//   },
//   completionTitle: {
//     fontSize: 24,
//     fontWeight: '800',
//     color: '#10B981',
//     marginTop: 12,
//   },
//   completionSubtitle: {
//     fontSize: 14,
//     color: '#6B7280',
//     marginTop: 4,
//   },
//   earningsSection: {
//     padding: 20,
//     borderBottomWidth: 1,
//     borderBottomColor: '#E5E7EB',
//     backgroundColor: '#F8FAFC',
//   },
//   earningsLabel: {
//     fontSize: 14,
//     color: '#6B7280',
//     textAlign: 'center',
//   },
//   earningsAmount: {
//     fontSize: 32,
//     fontWeight: '800',
//     color: '#184080',
//     textAlign: 'center',
//     marginTop: 8,
//   },
//   earningsBreakdown: {
//     marginTop: 12,
//     alignItems: 'center',
//   },
//   earningsBreakdownText: {
//     fontSize: 12,
//     color: '#6B7280',
//   },
//   ratingSummarySection: {
//     padding: 20,
//   },
//   ratingSummaryTitle: {
//     fontSize: 18,
//     fontWeight: '700',
//     color: '#111827',
//     marginBottom: 4,
//   },
//   ratingSummarySubtitle: {
//     fontSize: 13,
//     color: '#6B7280',
//     marginBottom: 16,
//   },
//   unratedRidersList: {
//     maxHeight: 200,
//   },
//   unratedRiderItem: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     justifyContent: 'space-between',
//     paddingVertical: 12,
//     borderBottomWidth: 1,
//     borderBottomColor: '#F0F0F0',
//   },
//   unratedRiderInfo: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     gap: 12,
//   },
//   unratedRiderName: {
//     fontSize: 15,
//     fontWeight: '600',
//     color: '#111827',
//   },
//   unratedRiderSeats: {
//     fontSize: 12,
//     color: '#6B7280',
//     marginTop: 2,
//   },
//   rateNowButton: {
//     backgroundColor: '#184080',
//     paddingHorizontal: 16,
//     paddingVertical: 8,
//     borderRadius: 20,
//   },
//   rateNowButtonText: {
//     color: '#fff',
//     fontSize: 12,
//     fontWeight: '600',
//   },
//   completionActions: {
//     flexDirection: 'row',
//     padding: 20,
//     gap: 12,
//     borderTopWidth: 1,
//     borderTopColor: '#E5E7EB',
//   },
//   rateLaterButton: {
//     flex: 1,
//     backgroundColor: '#F3F4F6',
//     borderRadius: 12,
//     paddingVertical: 12,
//     alignItems: 'center',
//   },
//   rateLaterButtonText: {
//     color: '#6B7280',
//     fontSize: 14,
//     fontWeight: '600',
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
//     alignItems: 'center' 
//   },
//   modalTitle: { 
//     fontSize: 22, 
//     fontWeight: '700', 
//     color: '#111827', 
//     textAlign: 'center', 
//     marginTop: 12 
//   },
//   modalSub: { 
//     fontSize: 14, 
//     color: '#6B7280', 
//     textAlign: 'center', 
//     marginTop: 8, 
//     marginBottom: 18 
//   },
//   starsRow: { 
//     flexDirection: 'row', 
//     justifyContent: 'center', 
//     marginBottom: 18 
//   },
//   feedbackInput: {
//     minHeight: 110,
//     borderWidth: 1,
//     borderColor: '#E5E7EB',
//     borderRadius: 16,
//     padding: 14,
//     textAlignVertical: 'top',
//     color: '#111827',
//     width: '100%',
//   },
//   modalActions: { 
//     flexDirection: 'row', 
//     gap: 10, 
//     marginTop: 18, 
//     width: '100%' 
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
//     fontWeight: '600' 
//   },
//   submitBtn: {
//     flex: 1,
//     backgroundColor: '#184080',
//     borderRadius: 999,
//     paddingVertical: 14,
//     alignItems: 'center',
//   },
//   submitBtnText: { 
//     color: '#fff', 
//     fontWeight: '700' 
//   },
//   cancelBtn: {
//     flex: 1,
//     borderWidth: 1,
//     borderColor: '#D1D5DB',
//     borderRadius: 999,
//     paddingVertical: 14,
//     alignItems: 'center',
//   },
//   cancelBtnText: { 
//     color: '#6B7280', 
//     fontWeight: '600' 
//   },
//   confirmBtn: {
//     flex: 1,
//     backgroundColor: '#10B981',
//     borderRadius: 999,
//     paddingVertical: 14,
//     alignItems: 'center',
//   },
//   confirmBtnText: { 
//     color: '#fff', 
//     fontWeight: '700' 
//   },
  
//   noSessionContainer: {
//     flex: 1,
//     justifyContent: 'center',
//     alignItems: 'center',
//     padding: 30,
//   },
//   noSessionTitle: {
//     fontSize: 20,
//     fontWeight: '700',
//     color: '#111827',
//     marginTop: 20,
//     marginBottom: 8,
//   },
//   noSessionText: {
//     fontSize: 14,
//     color: '#6B7280',
//     textAlign: 'center',
//     marginBottom: 30,
//     lineHeight: 20,
//   },
//   backButton: {
//     backgroundColor: '#184080',
//     paddingHorizontal: 30,
//     paddingVertical: 12,
//     borderRadius: 12,
//   },
//   backButtonText: { 
//     color: '#fff', 
//     fontWeight: '600', 
//     fontSize: 16 
//   },
  
//   noRidersContainer: {
//     alignItems: 'center',
//     paddingVertical: 40,
//   },
//   noRidersText: {
//     fontSize: 14,
//     color: '#9CA3AF',
//     marginTop: 12,
//   },
  
//   qrModalBackdrop: {
//     flex: 1,
//     backgroundColor: 'rgba(0,0,0,0.9)',
//     justifyContent: 'center',
//     alignItems: 'center',
//   },
//   qrModalCard: {
//     backgroundColor: '#fff',
//     borderRadius: 24,
//     padding: 24,
//     width: width - 40,
//     alignItems: 'center',
//   },
//   qrCloseBtn: {
//     position: 'absolute',
//     top: 16,
//     right: 16,
//     padding: 8,
//   },
//   qrModalTitle: {
//     fontSize: 20,
//     fontWeight: '700',
//     color: '#111827',
//     marginBottom: 20,
//   },
//   qrModalBox: {
//     alignItems: 'center',
//     justifyContent: 'center',
//     padding: 20,
//     backgroundColor: '#F8FAFC',
//     borderRadius: 16,
//   },
//   qrModalToken: {
//     fontSize: 16,
//     fontFamily: 'monospace',
//     color: '#667085',
//     marginTop: 16,
//   },
//   qrModalText: {
//     fontSize: 14,
//     color: '#6B7280',
//     textAlign: 'center',
//     marginTop: 20,
//     marginBottom: 20,
//   },
//   copyTokenBtn: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     gap: 8,
//     backgroundColor: '#184080',
//     paddingHorizontal: 20,
//     paddingVertical: 12,
//     borderRadius: 12,
//   },
//   copyTokenBtnText: {
//     color: '#fff',
//     fontWeight: '600',
//     fontSize: 14,
//   },
  
//   sosModalBackdrop: {
//     flex: 1,
//     backgroundColor: 'rgba(0,0,0,0.5)',
//     justifyContent: 'flex-end',
//   },
//   sosModalCard: {
//     backgroundColor: '#fff',
//     borderTopLeftRadius: 24,
//     borderTopRightRadius: 24,
//     padding: 20,
//     maxHeight: '80%',
//   },
//   sosModalHeader: {
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//     alignItems: 'center',
//     marginBottom: 8,
//   },
//   sosModalTitle: {
//     fontSize: 22,
//     fontWeight: '700',
//     color: '#E11D48',
//   },
//   sosModalSubtitle: {
//     fontSize: 14,
//     color: '#6B7280',
//     marginBottom: 20,
//   },
//   sosContactList: {
//     paddingBottom: 16,
//   },
//   sosContactCard: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     backgroundColor: '#FEF2F2',
//     borderRadius: 16,
//     padding: 14,
//     marginBottom: 12,
//     borderWidth: 1,
//     borderColor: '#FEE2E2',
//   },
//   sosContactAvatar: {
//     width: 50,
//     height: 50,
//     borderRadius: 25,
//     backgroundColor: '#E11D48',
//     justifyContent: 'center',
//     alignItems: 'center',
//     marginRight: 12,
//   },
//   sosContactAvatarText: {
//     color: '#fff',
//     fontSize: 20,
//     fontWeight: '700',
//   },
//   sosContactInfo: {
//     flex: 1,
//   },
//   sosContactName: {
//     fontSize: 16,
//     fontWeight: '600',
//     color: '#111827',
//   },
//   sosContactPhone: {
//     fontSize: 13,
//     color: '#6B7280',
//     marginTop: 2,
//   },
//   whatsappBadge: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     gap: 4,
//     marginTop: 4,
//   },
//   whatsappBadgeText: {
//     fontSize: 11,
//     color: '#25D366',
//     fontWeight: '500',
//   },
//   sosAllButton: {
//     backgroundColor: '#E11D48',
//     borderRadius: 14,
//     paddingVertical: 14,
//     flexDirection: 'row',
//     alignItems: 'center',
//     justifyContent: 'center',
//     gap: 8,
//     marginTop: 8,
//   },
//   sosAllButtonText: {
//     color: '#fff',
//     fontSize: 16,
//     fontWeight: '600',
//   },
//   sosLoadingContainer: {
//     alignItems: 'center',
//     paddingVertical: 40,
//   },
//   sosLoadingText: {
//     marginTop: 12,
//     color: '#6B7280',
//   },
//   sosEmptyContainer: {
//     alignItems: 'center',
//     paddingVertical: 40,
//   },
//   sosEmptyText: {
//     fontSize: 16,
//     fontWeight: '600',
//     color: '#111827',
//     marginTop: 16,
//   },
//   sosEmptySubtext: {
//     fontSize: 13,
//     color: '#6B7280',
//     textAlign: 'center',
//     marginTop: 8,
//     marginBottom: 20,
//   },
//   sosAddContactBtn: {
//     backgroundColor: '#184080',
//     paddingHorizontal: 20,
//     paddingVertical: 10,
//     borderRadius: 12,
//   },
//   sosAddContactBtnText: {
//     color: '#fff',
//     fontWeight: '600',
//   },
// });
// import React, { useCallback, useEffect, useState, useRef } from 'react';
// import {
//   View,
//   Text,
//   StyleSheet,
//   TouchableOpacity,
//   StatusBar,
//   ScrollView,
//   RefreshControl,
//   ActivityIndicator,
//   Image,
//   TextInput,
//   Modal,
//   Alert,
//   Clipboard,
//   Share,
//   Linking,
//   Dimensions,
//   FlatList,
//   Platform,
// } from 'react-native';
// import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
// import Ionicons from '@expo/vector-icons/Ionicons';
// import { MaterialIcons } from '@expo/vector-icons';
// import axios from 'axios';
// import * as Location from 'expo-location';
// import { API_BASE_URL } from "../config/config_ip";
// import { useAuth } from '../context/AuthContext';
// import { Colors } from '../constants/Colors';
// import EmergencyContactService from '../services/emergencycontact_ds';
// import CustomAlert from '../components/CustomAlert';
// import io from 'socket.io-client';
// import QRCode from 'react-native-qrcode-svg';

// const { width } = Dimensions.get('window');

// const buildImageUrl = (url) => {
//   if (!url) return null;
//   if (url.startsWith('http://') || url.startsWith('https://')) return url;
//   return `${API_BASE_URL}${url.startsWith('/') ? url : `/${url}`}`;
// };

// const getInitials = (name) => {
//   if (!name) return '?';
//   const parts = name.trim().split(' ').filter(Boolean);
//   if (parts.length > 1) return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
//   return parts[0].slice(0, 2).toUpperCase();
// };

// const RiderQRListModal = ({ visible, onClose, riders, sessionId, onRefresh, driverPhone }) => {
//   const [refreshingRider, setRefreshingRider] = useState(null);
//   const [ridersList, setRidersList] = useState(riders);
//   const [showAlert, setShowAlert] = useState(false);
//   const [alertConfig, setAlertConfig] = useState({ title: '', message: '', icon: 'check-circle', iconColor: '#10B981' });
  
//   useEffect(() => {
//     setRidersList(riders);
//   }, [riders]);
  
//   const showCustomAlert = (title, message, type = 'success') => {
//     let icon = "check-circle";
//     let iconColor = "#10B981";
//     if (type === 'error') {
//       icon = "error";
//       iconColor = "#EF4444";
//     } else if (type === 'warning') {
//       icon = "warning";
//       iconColor = "#F59E0B";
//     }
//     setAlertConfig({ title, message, icon, iconColor });
//     setShowAlert(true);
//   };
  
//   const refreshRiderQR = async (riderId, riderIndex) => {
//     setRefreshingRider(riderId);
//     try {
//       const response = await axios.post(
//         `${API_BASE_URL}/ride-sessions/${sessionId}/refresh-rider-qr/${riderId}`,
//         { driver_phone: driverPhone }
//       );
      
//       if (response.data.success) {
//         const updatedRiders = [...ridersList];
//         updatedRiders[riderIndex] = {
//           ...updatedRiders[riderIndex],
//           individual_qr_token: response.data.individual_qr_token,
//           qr_expires_at: response.data.qr_expires_at
//         };
//         setRidersList(updatedRiders);
//         showCustomAlert('Success', 'QR code refreshed successfully', 'success');
//         if (onRefresh) onRefresh();
//       }
//     } catch (error) {
//       showCustomAlert('Error', error?.response?.data?.detail || 'Could not refresh QR code', 'error');
//     } finally {
//       setRefreshingRider(null);
//     }
//   };
  
//   const copyQRToken = (token) => {
//     Clipboard.setString(token);
//     showCustomAlert('Copied', 'QR token copied to clipboard', 'success');
//   };
  
//   const shareQRCode = async (token, riderName) => {
//     try {
//       await Share.share({
//         message: `🚗 *Boarding QR Code for ${riderName}* 🚗\n\nPlease show this code to the driver to board:\n\n*${token}*\n\n⚠️ This code is unique to you and expires in 2 hours.`,
//         title: `Boarding Code - ${riderName}`
//       });
//     } catch (error) {
//       console.error('Error sharing QR code:', error);
//     }
//   };
  
//   const renderRiderQR = ({ item, index }) => {
//     const isPending = item.status === 'accepted' || item.status === 'reached_pickup';
//     const isBoarded = item.status === 'boarded';
//     const isCompleted = item.status === 'completed' || item.status === 'dropped_off';
    
//     if (isCompleted) return null;
    
//     return (
//       <View style={styles.riderQRCard}>
//         <View style={styles.riderQRHeader}>
//           <View style={styles.riderQRInfo}>
//             {item.rider_photo ? (
//               <Image source={{ uri: buildImageUrl(item.rider_photo) }} style={styles.riderQRAvatar} />
//             ) : (
//               <View style={[styles.riderQRAvatar, styles.riderQRAvatarFallback]}>
//                 <Text style={styles.riderQRAvatarText}>
//                   {getInitials(item.rider_name)}
//                 </Text>
//               </View>
//             )}
//             <View>
//               <Text style={styles.riderQRName}>{item.rider_name}</Text>
//               <Text style={styles.riderQRSeats}>{item.seats_booked || 1} seat(s)</Text>
//               <View style={[
//                 styles.riderQRStatusBadge,
//                 isBoarded ? styles.riderQRStatusBoarded : styles.riderQRStatusPending
//               ]}>
//                 <Text style={styles.riderQRStatusText}>
//                   {isBoarded ? '✓ Boarded' : isPending ? 'Pending Boarding' : item.status}
//                 </Text>
//               </View>
//             </View>
//           </View>
//         </View>
        
//         {isPending && item.individual_qr_token && (
//           <View style={styles.riderQRCodeContainer}>
//             <View style={styles.riderQRCodeBox}>
//               <QRCode
//                 value={item.individual_qr_token}
//                 size={160}
//                 color="#000000"
//                 backgroundColor="#FFFFFF"
//               />
//             </View>
//             <Text style={styles.riderQRToken}>{item.individual_qr_token}</Text>
//             <Text style={styles.riderQRExpiry}>
//               Expires: {item.qr_expires_at ? new Date(item.qr_expires_at).toLocaleTimeString() : '2 hours'}
//             </Text>
//             <View style={styles.riderQRActions}>
//               <TouchableOpacity 
//                 style={styles.riderQRActionBtn}
//                 onPress={() => copyQRToken(item.individual_qr_token)}
//               >
//                 <Ionicons name="copy-outline" size={18} color="#184080" />
//                 <Text style={styles.riderQRActionText}>Copy</Text>
//               </TouchableOpacity>
//               <TouchableOpacity 
//                 style={styles.riderQRActionBtn}
//                 onPress={() => shareQRCode(item.individual_qr_token, item.rider_name)}
//               >
//                 <Ionicons name="share-outline" size={18} color="#184080" />
//                 <Text style={styles.riderQRActionText}>Share</Text>
//               </TouchableOpacity>
//               <TouchableOpacity 
//                 style={[styles.riderQRActionBtn, refreshingRider === item.id && styles.riderQRActionDisabled]}
//                 onPress={() => refreshRiderQR(item.id, index)}
//                 disabled={refreshingRider === item.id}
//               >
//                 {refreshingRider === item.id ? (
//                   <ActivityIndicator size="small" color="#184080" />
//                 ) : (
//                   <>
//                     <Ionicons name="refresh-outline" size={18} color="#184080" />
//                     <Text style={styles.riderQRActionText}>Refresh</Text>
//                   </>
//                 )}
//               </TouchableOpacity>
//             </View>
//           </View>
//         )}
        
//         {isBoarded && (
//           <View style={styles.riderBoardedMessage}>
//             <Ionicons name="checkmark-circle" size={24} color="#10B981" />
//             <Text style={styles.riderBoardedText}>Rider has already boarded</Text>
//           </View>
//         )}
//       </View>
//     );
//   };
  
//   return (
//     <>
//       <Modal visible={visible} animationType="slide" transparent={false}>
//         <SafeAreaView style={styles.riderQRModalContainer}>
//           <View style={styles.riderQRModalHeader}>
//             <Text style={styles.riderQRModalTitle}>Boarding QR Codes</Text>
//             <TouchableOpacity onPress={onClose} style={styles.riderQRModalClose}>
//               <Ionicons name="close" size={28} color="#111827" />
//             </TouchableOpacity>
//           </View>
          
//           <ScrollView 
//             style={styles.riderQRModalScroll}
//             showsVerticalScrollIndicator={false}
//             contentContainerStyle={{ paddingBottom: 30 }}
//           >
//             <Text style={styles.riderQRModalSubtitle}>
//               Each rider has their own unique QR code. Show them their code to scan and board.
//             </Text>
            
//             {ridersList.filter(r => r.status !== 'completed' && r.status !== 'dropped_off').length === 0 ? (
//               <View style={styles.riderQRNoRiders}>
//                 <Ionicons name="people-outline" size={60} color="#D1D5DB" />
//                 <Text style={styles.riderQRNoRidersText}>No pending riders</Text>
//                 <Text style={styles.riderQRNoRidersSub}>All riders have been boarded or completed</Text>
//               </View>
//             ) : (
//               <FlatList
//                 data={ridersList.filter(r => r.status !== 'completed' && r.status !== 'dropped_off')}
//                 keyExtractor={(item) => item.id.toString()}
//                 renderItem={renderRiderQR}
//                 scrollEnabled={false}
//               />
//             )}
//           </ScrollView>
//         </SafeAreaView>
//       </Modal>
      
//       <CustomAlert
//         visible={showAlert}
//         title={alertConfig.title}
//         message={alertConfig.message}
//         icon={alertConfig.icon}
//         iconColor={alertConfig.iconColor}
//         buttons={[{ text: 'OK', onPress: () => setShowAlert(false) }]}
//       />
//     </>
//   );
// };

// export default function OngoingRideDriverScreen({ route, navigation }) {
//   const { rideId, sessionId: initialSessionId } = route.params || {};
//   const { user } = useAuth();
//   const insets = useSafeAreaInsets();

//   const [session, setSession] = useState(null);
//   const [loading, setLoading] = useState(true);
//   const [refreshing, setRefreshing] = useState(false);
//   const [ratingModalVisible, setRatingModalVisible] = useState(false);
//   const [selectedRider, setSelectedRider] = useState(null);
//   const [rating, setRating] = useState(0);
//   const [feedback, setFeedback] = useState('');
//   const [qrModalVisible, setQrModalVisible] = useState(false);
//   const [showCompleteConfirm, setShowCompleteConfirm] = useState(false);
//   const [showForceCompleteConfirm, setShowForceCompleteConfirm] = useState(false);
//   const [elapsedTime, setElapsedTime] = useState(0);
//   const timerRef = useRef(null);
//   const [sessionStartTime, setSessionStartTime] = useState(null);
//   const [socketConnected, setSocketConnected] = useState(false);
//   const locationIntervalRef = useRef(null);
//   const socketRef = useRef(null);
//   const [showRiderQRModal, setShowRiderQRModal] = useState(false);
//   const [ridersWithQR, setRidersWithQR] = useState([]);
//   const [rideCompleted, setRideCompleted] = useState(false);
//   const [totalEarnings, setTotalEarnings] = useState(0);
//   const [showCompletionSummary, setShowCompletionSummary] = useState(false);
//   const [allRidersRated, setAllRidersRated] = useState(false);
//   const [unratedRiders, setUnratedRiders] = useState([]);
//   const [sosModalVisible, setSosModalVisible] = useState(false);
//   const [personalContacts, setPersonalContacts] = useState([]);
//   const [loadingContacts, setLoadingContacts] = useState(false);
//   const [sosSending, setSosSending] = useState(false);
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
    
//     if (type === 'error') {
//       icon = "error";
//       iconColor = "#EF4444";
//     } else if (type === 'warning') {
//       icon = "warning";
//       iconColor = "#F59E0B";
//     } else if (type === 'info') {
//       icon = "info";
//       iconColor = Colors.primary || "#184080";
//     }
    
//     setAlertConfig({
//       title,
//       message,
//       icon,
//       iconColor,
//       buttons: [{ text: 'OK', onPress: () => setAlertVisible(false) }]
//     });
//     setAlertVisible(true);
//   };

//   const formatElapsedTime = (seconds) => {
//     const hours = Math.floor(seconds / 3600);
//     const minutes = Math.floor((seconds % 3600) / 60);
//     const secs = seconds % 60;
    
//     if (hours > 0) {
//       return `${hours}h ${minutes}m ${secs}s`;
//     } else if (minutes > 0) {
//       return `${minutes}m ${secs}s`;
//     }
//     return `${secs}s`;
//   };

//   const formatDateTime = (dateTimeStr) => {
//     if (!dateTimeStr) return { date: 'N/A', time: 'N/A' };
//     const date = new Date(dateTimeStr);
//     return {
//       date: date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' }),
//       time: date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true }),
//     };
//   };

//   const fetchRidersWithQR = async () => {
//     try {
//       const response = await axios.get(
//         `${API_BASE_URL}/ride-sessions/driver/${rideId}/riders`,
//         { params: { driver_phone: user?.phone_number } }
//       );
      
//       if (response.data) {
//         setRidersWithQR(response.data.riders || []);
//       }
//     } catch (error) {
//       console.error('Error fetching riders with QR:', error);
//     }
//   };

//   const connectSocket = useCallback(async () => {
//     if (!session?.session_id) return;
    
//     if (socketRef.current && socketRef.current.connected) {
//       return;
//     }
    
//     try {
//       const socket = io(API_BASE_URL, {
//         transports: ['websocket', 'polling'],
//         reconnection: true,
//         reconnectionAttempts: 10,
//         reconnectionDelay: 1000,
//         reconnectionDelayMax: 10000,
//         timeout: 10000,
//         forceNew: true,
//         path: '/socket.io',
//         auth: {
//           token: user?.phone_number || null,
//           userType: 'driver'
//         }
//       });
      
//       socketRef.current = socket;
      
//       socket.on('connect', () => {
//         console.log('✅ Socket connected for driver');
//         setSocketConnected(true);
//         socket.emit('join-ride-room', session.session_id);
//         if (user?.phone_number) {
//           socket.emit('join-user-room', user.phone_number);
//         }
//       });
      
//       socket.on('connect_error', (error) => {
//         console.log('❌ Socket connection error:', error.message);
//         setSocketConnected(false);
//       });
      
//       socket.on('rider-boarded', (data) => {
//         console.log('Rider boarded event:', data);
//         fetchSession();
//         fetchRidersWithQR();
//         showCustomAlert('Rider Boarded', `${data.rider_name || 'A rider'} has boarded the ride`, 'success');
//       });
      
//       socket.on('rider-dropped-off', (data) => {
//         console.log('Rider dropped off event:', data);
//         fetchSession();
//         fetchRidersWithQR();
//         showCustomAlert('Rider Dropped Off', `${data.rider_name || 'A rider'} has been dropped off`, 'success');
//       });
      
//       socket.on('emergency-alert', (data) => {
//         console.log('Emergency alert received:', data);
//         showCustomAlert('Emergency Alert', data.message || 'Emergency alert triggered', 'warning');
//       });
      
//     } catch (error) {
//       console.log('Socket connection error:', error);
//     }
//   }, [session?.session_id, user?.phone_number]);

//   const startLocationTracking = useCallback(async () => {
//     try {
//       const { status } = await Location.requestForegroundPermissionsAsync();
//       if (status !== 'granted') {
//         console.log('Location permission denied');
//         return;
//       }

//       if (locationIntervalRef.current) {
//         clearInterval(locationIntervalRef.current);
//       }

//       locationIntervalRef.current = setInterval(async () => {
//         try {
//           const location = await Location.getCurrentPositionAsync({
//             accuracy: Location.Accuracy.High,
//           });
          
//           const { latitude, longitude } = location.coords;
          
//           await axios.post(`${API_BASE_URL}/ride-sessions/${session?.session_id}/location`, {
//             lat: latitude,
//             lng: longitude,
//           });
          
//           if (socketRef.current && socketConnected) {
//             socketRef.current.emit('driver-location-update', {
//               session_id: session?.session_id,
//               latitude,
//               longitude,
//             });
//           }
          
//           console.log('📍 Location sent:', { latitude, longitude });
//         } catch (error) {
//           console.log('Error sending location:', error);
//         }
//       }, 5000);
//     } catch (error) {
//       console.log('Error starting location tracking:', error);
//     }
//   }, [session?.session_id, socketConnected]);

//   const fetchSession = useCallback(async () => {
//     try {
//       console.log('Fetching session for ride:', rideId, 'driver:', user?.phone_number);
      
//       const res = await axios.get(`${API_BASE_URL}/ride-sessions/driver/${rideId}`, {
//         params: { driver_phone: user?.phone_number },
//       });
      
//       console.log('Session response:', res.data);
//       setSession(res.data);
      
//       if (res.data.riders) {
//         const unrated = res.data.riders.filter(
//           rider => (rider.status === 'dropped_off' || rider.status === 'completed') && !rider.driver_rating
//         );
//         setUnratedRiders(unrated);
//         setAllRidersRated(unrated.length === 0);
//       }
      
//       if (res.data.completed_at) {
//         const earnings = res.data.riders
//           .filter(rider => rider.status === 'completed' || rider.status === 'dropped_off')
//           .reduce((sum, rider) => sum + (rider.price_paid || 0), 0);
//         setTotalEarnings(earnings);
//         setRideCompleted(true);
//       }
      
//       if (res.data.current_phase !== 'boarding' && res.data.current_phase !== 'completed') {
//         if (res.data.started_at && !res.data.completed_at) {
//           const startTime = new Date(res.data.started_at).getTime();
//           setSessionStartTime(startTime);
          
//           if (timerRef.current) clearInterval(timerRef.current);
//           timerRef.current = setInterval(() => {
//             const now = new Date().getTime();
//             const elapsed = Math.floor((now - startTime) / 1000);
//             setElapsedTime(elapsed);
//           }, 1000);
//         }
//       }
      
//     } catch (error) {
//       console.log('Driver session fetch error:', error?.response?.data || error.message);
      
//       if (error?.response?.status === 404) {
//         try {
//           const liveRes = await axios.get(`${API_BASE_URL}/ride/${rideId}/live-session`);
          
//           if (liveRes.data.success && liveRes.data.session) {
//             console.log('Found live session:', liveRes.data.session);
//             setSession({
//               session_id: liveRes.data.session.session_id,
//               status: 'driver_started',
//               current_phase: 'boarding',
//               ride_id: rideId,
//               riders: [],
//               boarded_count: 0,
//               dropped_count: 0,
//               total_riders: 0,
//               qr_code_token: liveRes.data.session.qr_code_token || 'N/A',
//               ride_origin: '',
//               ride_destination: '',
//               sos_active: false,
//               emergency_stop_active: false,
//               started_at: new Date().toISOString(),
//             });
//           } else {
//             console.log('No live session found');
//             setSession(null);
//           }
//         } catch (liveError) {
//           console.log('No live session found yet:', liveError);
//           setSession(null);
//         }
//       } else {
//         setSession(null);
//       }
//     } finally {
//       setLoading(false);
//       setRefreshing(false);
//     }
//   }, [rideId, user?.phone_number]);

//   const loadPersonalEmergencyContacts = async () => {
//     if (!user?.phone_number) return [];
    
//     try {
//       const res = await EmergencyContactService.getContacts(user.phone_number);
//       const personalContactsList = res.user || [];
//       setPersonalContacts(personalContactsList);
//       return personalContactsList;
//     } catch (error) {
//       console.error("Error loading personal emergency contacts:", error);
//       return [];
//     }
//   };

//   useEffect(() => {
//     fetchSession();
//     const timer = setInterval(() => {
//       fetchSession();
//       if (session?.session_id && !rideCompleted) {
//         fetchRidersWithQR();
//       }
//     }, 5000);
//     return () => {
//       clearInterval(timer);
//       if (timerRef.current) clearInterval(timerRef.current);
//       if (locationIntervalRef.current) clearInterval(locationIntervalRef.current);
//       if (socketRef.current) socketRef.current.disconnect();
//     };
//   }, [fetchSession]);

//   useEffect(() => {
//     if (session && session.session_id && session.current_phase !== 'completed' && !session.completed_at) {
//       startLocationTracking();
//       connectSocket();
//       fetchRidersWithQR();
//     }
//   }, [session, startLocationTracking, connectSocket]);

//   const onRefresh = () => {
//     setRefreshing(true);
//     fetchSession();
//     fetchRidersWithQR();
//   };

//   const handleDropOff = async (bookingId) => {
//     try {
//       await axios.post(`${API_BASE_URL}/ride-sessions/${session.session_id}/rider-dropped-off`, {
//         booking_id: bookingId,
//         driver_phone: user?.phone_number,
//       });
//       fetchSession();
//       fetchRidersWithQR();
//       showCustomAlert('Success', 'Rider dropped off successfully', 'success');
//     } catch (error) {
//       showCustomAlert('Error', error?.response?.data?.detail || 'Could not drop off rider', 'error');
//     }
//   };

// const handleCompleteRide = async () => {
//   try {
//     // First, automatically mark all remaining boarded riders as dropped off
//     const remainingRiders = session?.riders?.filter(
//       rider => rider.status === 'boarded' || rider.status === 'accepted'
//     ) || [];
    
//     if (remainingRiders.length > 0) {
//       // Show loading indicator while auto-dropping off remaining riders
//       showCustomAlert(
//         'Processing', 
//         `Automatically dropping off ${remainingRiders.length} remaining rider(s)...`, 
//         'info'
//       );
      
//       // Auto drop off each remaining rider
//       for (const rider of remainingRiders) {
//         try {
//           await axios.post(`${API_BASE_URL}/ride-sessions/${session.session_id}/rider-dropped-off`, {
//             booking_id: rider.booking_id,
//             driver_phone: user?.phone_number,
//             auto_complete: true // Flag to indicate auto-completion
//           });
//         } catch (err) {
//           console.error(`Failed to auto drop off rider ${rider.booking_id}:`, err);
//         }
//       }
      
//       // Wait a moment for the updates to process
//       await new Promise(resolve => setTimeout(resolve, 1000));
      
//       // Refresh session to get updated status
//       await fetchSession();
//     }
    
//     // Now complete the ride
//     const response = await axios.post(`${API_BASE_URL}/ride-sessions/${session.session_id}/complete`, {
//       driver_phone: user?.phone_number,
//       force_complete: true // Allow force completion even if some riders aren't dropped off
//     });
    
//     const earnings = response.data.total_earnings || 
//       session?.riders?.filter(r => r.status === 'dropped_off' || r.status === 'completed')
//         .reduce((sum, rider) => sum + (rider.price_paid || 0), 0) || 0;
    
//     setTotalEarnings(earnings);
//     setRideCompleted(true);
    
//     const unrated = session?.riders?.filter(
//       rider => (rider.status === 'dropped_off' || rider.status === 'completed') && !rider.driver_rating
//     ) || [];
//     setUnratedRiders(unrated);
//     setAllRidersRated(unrated.length === 0);
    
//     showCustomAlert('Ride Completed!', `Ride completed successfully! Total earnings: ₹${earnings}`, 'success');
    
//     if (timerRef.current) {
//       clearInterval(timerRef.current);
//     }
    
//     setShowCompletionSummary(true);
    
//   } catch (error) {
//     console.error('Complete ride error:', error);
//     showCustomAlert('Error', error?.response?.data?.detail || 'Could not complete ride', 'error');
//   }
// };

//   const handleForceCompleteRide = async () => {
//     try {
//       const response = await axios.post(`${API_BASE_URL}/ride-sessions/${session.session_id}/complete-force`, {
//         driver_phone: user?.phone_number,
//       });
      
//       if (response.data) {
//         const earnings = response.data.total_earnings || 0;
//         setTotalEarnings(earnings);
//         setRideCompleted(true);
        
//         const unrated = session?.riders?.filter(
//           rider => (rider.status === 'dropped_off' || rider.status === 'completed') && !rider.driver_rating
//         ) || [];
//         setUnratedRiders(unrated);
//         setAllRidersRated(unrated.length === 0);
        
//         showCustomAlert(
//           'Ride Completed', 
//           `Ride completed successfully! ${response.data.completed_riders} rider(s) were automatically marked as completed. Total earnings: ₹${earnings}`,
//           'success'
//         );
        
//         if (timerRef.current) {
//           clearInterval(timerRef.current);
//         }
        
//         setShowCompletionSummary(true);
//       }
//     } catch (error) {
//       showCustomAlert('Error', error?.response?.data?.detail || 'Could not complete ride', 'error');
//     }
//   };

//   const navigateToDestination = (destination, riderName = null) => {
//     if (destination) {
//       const encodedDest = encodeURIComponent(destination);
//       const url = Platform.select({
//         ios: `maps://?q=${encodedDest}`,
//         android: `https://www.google.com/maps/search/?api=1&query=${encodedDest}`,
//       });
      
//       Linking.canOpenURL(url).then(supported => {
//         if (supported) {
//           Linking.openURL(url);
//         } else {
//           Linking.openURL(`https://www.google.com/maps/search/?api=1&query=${encodedDest}`);
//         }
//       }).catch(() => {
//         showCustomAlert('Error', 'Could not open maps', 'error');
//       });
//     } else {
//       showCustomAlert('Info', 'Destination information not available', 'info');
//     }
//   };

//   const sendWhatsAppMessage = async (phoneNumber, message) => {
//     try {
//       let formattedPhone = phoneNumber.replace(/[^0-9]/g, '');
//       if (formattedPhone.length === 10) {
//         formattedPhone = `91${formattedPhone}`;
//       }
      
//       const url = `whatsapp://send?phone=${formattedPhone}&text=${encodeURIComponent(message)}`;
      
//       const supported = await Linking.canOpenURL(url);
//       if (supported) {
//         await Linking.openURL(url);
//       } else {
//         Linking.openURL(`sms:${phoneNumber}?body=${encodeURIComponent(message)}`);
//       }
//     } catch (error) {
//       console.error('Error sending WhatsApp message:', error);
//       Linking.openURL(`sms:${phoneNumber}?body=${encodeURIComponent(message)}`);
//     }
//   };

//   const handleSOS = async () => {
//     setLoadingContacts(true);
//     setSosModalVisible(true);
    
//     try {
//       const contacts = await loadPersonalEmergencyContacts();
//       if (contacts.length === 0) {
//         showCustomAlert(
//           'No Emergency Contacts',
//           'Please add personal emergency contacts in your profile settings before using SOS.',
//           'warning'
//         );
//         setSosModalVisible(false);
//       }
//     } catch (error) {
//       console.error('Error loading contacts:', error);
//     } finally {
//       setLoadingContacts(false);
//     }
//   };

//   const sendSOSMessage = async (contact) => {
//     const sosMessage = `🚨 *EMERGENCY SOS ALERT* 🚨

// I need immediate help!

// 📍 *Current Status:* Emergency during active ride
// 👤 *Driver:* ${user?.full_name || user?.phone_number || 'Unknown'}
// 🚗 *Ride ID:* ${rideId}
// 📍 *Origin:* ${session?.ride_origin || 'Unknown'}
// 🎯 *Destination:* ${session?.ride_destination || 'Unknown'}
// ⏰ *Time:* ${new Date().toLocaleString()}

// Please contact me immediately!

// ⚠️ This is an automated emergency alert.`;
    
//     await sendWhatsAppMessage(contact.contact_number, sosMessage);
//   };

//   const sendSOSToContact = async (contact) => {
//     setSosSending(true);
    
//     try {
//       await axios.post(`${API_BASE_URL}/ride-sessions/${session.session_id}/sos`, {
//         note: `SOS triggered by driver for contact: ${contact.contact_name} (${contact.contact_number})`,
//         contact_notified: contact.contact_number
//       });
      
//       await sendSOSMessage(contact);
      
//       showCustomAlert(
//         'SOS Sent',
//         `Emergency alert sent to ${contact.contact_name} via WhatsApp. Help is on the way.`,
//         'success'
//       );
      
//       setSosModalVisible(false);
      
//       setTimeout(() => {
//         Alert.alert(
//           'Call Contact?',
//           `Would you like to call ${contact.contact_name} now?`,
//           [
//             { text: 'No', style: 'cancel' },
//             { text: 'Call', onPress: () => Linking.openURL(`tel:${contact.contact_number}`) }
//           ]
//         );
//       }, 1000);
      
//     } catch (error) {
//       console.error('Error sending SOS:', error);
//       showCustomAlert(
//         'SOS Failed',
//         'Could not send SOS alert. Please try again or call emergency services directly.',
//         'error'
//       );
//     } finally {
//       setSosSending(false);
//     }
//   };

//   const sendSOSToAll = async () => {
//     setSosSending(true);
    
//     try {
//       const contacts = personalContacts;
//       if (contacts.length === 0) return;
      
//       let successCount = 0;
      
//       for (const contact of contacts) {
//         try {
//           await axios.post(`${API_BASE_URL}/ride-sessions/${session.session_id}/sos`, {
//             note: `SOS triggered by driver for contact: ${contact.contact_name} (${contact.contact_number})`,
//             contact_notified: contact.contact_number
//           });
          
//           await sendSOSMessage(contact);
//           successCount++;
//         } catch (err) {
//           console.error(`Failed to send SOS to ${contact.contact_name}:`, err);
//         }
//       }
      
//       showCustomAlert(
//         'SOS Sent',
//         `Emergency alert sent to ${successCount} of ${contacts.length} contacts.`,
//         successCount > 0 ? 'success' : 'error'
//       );
      
//       setSosModalVisible(false);
      
//     } catch (error) {
//       console.error('Error sending SOS to all:', error);
//       showCustomAlert('SOS Failed', 'Could not send SOS alerts', 'error');
//     } finally {
//       setSosSending(false);
//     }
//   };

//   const handleEmergencyStop = async () => {
//     Alert.alert(
//       'Emergency Stop',
//       'This will stop the ride and notify all passengers. Are you sure?',
//       [
//         { text: 'Cancel', style: 'cancel' },
//         {
//           text: 'Emergency Stop',
//           style: 'destructive',
//           onPress: async () => {
//             try {
//               await axios.post(`${API_BASE_URL}/ride-sessions/${session.session_id}/emergency-stop`, {
//                 note: 'Emergency stop triggered by driver',
//               });
//               fetchSession();
//               showCustomAlert('Emergency Stop', 'Emergency stop has been activated', 'warning');
//             } catch (error) {
//               showCustomAlert('Error', 'Could not trigger emergency stop', 'error');
//             }
//           },
//         },
//       ]
//     );
//   };

//   const openRateModal = (rider) => {
//     setSelectedRider(rider);
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
    
//     try {
//       await axios.post(`${API_BASE_URL}/ride-sessions/${session.session_id}/rate-rider`, {
//         booking_id: selectedRider.booking_id,
//         rating,
//         feedback,
//       });
      
//       setRatingModalVisible(false);
//       await fetchSession();
//       await fetchRidersWithQR();
      
//       const updatedSession = session;
//       if (updatedSession?.riders) {
//         const updatedRiders = updatedSession.riders.map(r => 
//           r.booking_id === selectedRider.booking_id ? { ...r, driver_rating: rating } : r
//         );
//         const unrated = updatedRiders.filter(
//           rider => (rider.status === 'completed' || rider.status === 'dropped_off') && !rider.driver_rating
//         );
//         setUnratedRiders(unrated);
//         setAllRidersRated(unrated.length === 0);
//       }
      
//       showCustomAlert('Success', 'Thank you for rating this rider!', 'success');
//     } catch (error) {
//       showCustomAlert('Error', error?.response?.data?.detail || 'Could not submit rider rating', 'error');
//     }
//   };
// // Add this function to check if there are pending riders
// const getPendingRidersCount = () => {
//   if (!session?.riders) return 0;
//   return session.riders.filter(r => r.status !== 'dropped_off' && r.status !== 'completed').length;
// };
//   const copyQRToken = () => {
//     if (session?.qr_code_token) {
//       Clipboard.setString(session.qr_code_token);
//       showCustomAlert('Copied', 'QR token copied to clipboard', 'success');
//     }
//   };

//   const shareQRCode = async () => {
//     if (!session?.qr_code_token) {
//       showCustomAlert('Error', 'QR code not available', 'error');
//       return;
//     }

//     try {
//       await Share.share({
//         message: `🚗 *Boarding QR Code for Ride #${rideId}* 🚗\n\nPlease show this code to the driver to board:\n\n*${session.qr_code_token}*\n\n⚠️ Keep this code private and only share with your driver.`,
//         title: 'Share Boarding Code',
//       });
//     } catch (error) {
//       console.error('Error sharing QR code:', error);
//       showCustomAlert('Error', 'Could not share QR code', 'error');
//     }
//   };

//   const callRider = (phoneNumber) => {
//     Linking.openURL(`tel:${phoneNumber}`);
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

//   const renderRiderAvatar = (rider) => {
//     if (rider.rider_photo) {
//       const imageUrl = buildImageUrl(rider.rider_photo);
//       return (
//         <Image 
//           source={{ uri: imageUrl }} 
//           style={styles.avatar} 
//           resizeMode="cover"
//         />
//       );
//     } else {
//       return (
//         <View style={[styles.avatar, styles.avatarFallback]}>
//           <Text style={styles.avatarText}>
//             {getInitials(rider.rider_name || 'Rider')}
//           </Text>
//         </View>
//       );
//     }
//   };

//   const handleBack = () => {
//     navigation.goBack();
//   };

//   const handleGoToMyRides = () => {
//     navigation.replace('MyRides', { 
//       refresh: true, 
//       tab: 'posted',
//       forceReload: true
//     });
//   };

//   if (loading) {
//     return (
//       <SafeAreaView style={styles.centered} edges={['top']}>
//         <StatusBar backgroundColor={Colors.white} barStyle="dark-content" />
//         <ActivityIndicator size="large" color="#184080" />
//         <Text style={styles.loadingText}>Loading ride session...</Text>
//       </SafeAreaView>
//     );
//   }

//   if (!session) {
//     return (
//       <SafeAreaView style={styles.container} edges={['top']}>
//         <StatusBar backgroundColor={Colors.white} barStyle="dark-content" />
        
//         <View style={[styles.header, { paddingTop: insets.top > 0 ? insets.top : 12 }]}>
//           <TouchableOpacity style={styles.modernBackButton} onPress={handleBack}>
//             <MaterialIcons name="arrow-back-ios" size={28} color={Colors.secondary || "#184080"} />
//           </TouchableOpacity>
//           <Text style={styles.headerTitle}>Ride Session</Text>
//           <View style={styles.headerSpacer} />
//         </View>
        
//         <View style={styles.noSessionContainer}>
//           <Ionicons name="car-sport-outline" size={80} color="#D1D5DB" />
//           <Text style={styles.noSessionTitle}>No Active Session</Text>
//           <Text style={styles.noSessionText}>
//             The ride session hasn't been started yet.{'\n'}
//             Please start the ride from the ride details screen.
//           </Text>
//           <TouchableOpacity 
//             style={styles.backButton}
//             onPress={() => navigation.goBack()}
//           >
//             <Text style={styles.backButtonText}>Go Back</Text>
//           </TouchableOpacity>
//         </View>
//       </SafeAreaView>
//     );
//   }

//   const allRidersProcessed = session?.riders?.every(
//     rider => rider.status === 'dropped_off' || rider.status === 'completed'
//   );

//   const allRidersCompleted = session?.riders?.every(
//     rider => rider.status === 'completed'
//   );

//   const boardingPhase = session?.current_phase === 'boarding';
//   const enRoutePhase = session?.current_phase === 'en_route';
//   const hasRiders = session?.riders && session.riders.length > 0;
//   const isRideCompleted = rideCompleted || session?.completed_at;

//   const progressCount = boardingPhase 
//     ? `${session?.boarded_count || 0}/${session?.total_riders || 0}`
//     : `${session?.dropped_count || 0}/${session?.total_riders || 0}`;

//   const progressTitle = boardingPhase ? 'Riders Boarded' : 'Riders Dropped Off';
  
//   const progressPercentage = session?.total_riders 
//     ? ((boardingPhase ? session.boarded_count : session.dropped_count) / session.total_riders) * 100
//     : 0;

//   const showTimer = enRoutePhase && sessionStartTime && !isRideCompleted;
//   const { date: departureDate, time: departureTime } = formatDateTime(session?.departure_time || session?.ride_departure_time);

//   return (
//     <SafeAreaView style={styles.container} edges={['top']}>
//       <StatusBar backgroundColor={Colors.white} barStyle="dark-content" />
      
//       <View style={[styles.header]}>
//         <TouchableOpacity style={styles.modernBackButton} onPress={handleBack}>
//           <MaterialIcons name="arrow-back-ios" size={28} color={Colors.secondary || "#184080"} />
//         </TouchableOpacity>
        
//         <Text style={styles.headerTitle}>
//           {isRideCompleted ? 'Ride Completed' : 'Ride in Progress'}
//         </Text>
        
//      {/* Always show Complete Ride button if ride is not completed */}
// {!isRideCompleted && (
//   <TouchableOpacity
//     style={styles.completeRideBtn}
//     onPress={() => setShowCompleteConfirm(true)}
//   >
//     <Ionicons name="checkmark-done-outline" size={20} color="#fff" />
//     <Text style={styles.completeRideText}>
//       {allRidersProcessed ? 'Complete Ride' : 'Complete Ride & Auto Drop-off'}
//     </Text>
//   </TouchableOpacity>
// )}
//       </View>

//       {!isRideCompleted ? (
//         <ScrollView
//           style={{ flex: 1 }}
//           contentContainerStyle={{ padding: 16, paddingBottom: 30 }}
//           refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
//           showsVerticalScrollIndicator={false}
//         >
//           {showTimer && (
//             <View style={styles.timerMapRow}>
//               <View style={styles.timerCard}>
//                 <Ionicons name="time-outline" size={20} color="#184080" />
//                 <Text style={styles.timerLabel}>Elapsed Time</Text>
//                 <Text style={styles.timerValue}>{formatElapsedTime(elapsedTime)}</Text>
//               </View>
              
//               <TouchableOpacity style={styles.mapCard} onPress={() => navigateToDestination(session?.ride_destination)}>
//                 <Ionicons name="navigate-outline" size={20} color="#fff" />
//                 <Text style={styles.mapCardText}>Navigate to Destination</Text>
//               </TouchableOpacity>
//             </View>
//           )}

//           <View style={styles.rideInfoCard}>
//             <View style={styles.rideInfoRow}>
//               <View style={styles.rideInfoItem}>
//                 <Ionicons name="calendar-outline" size={16} color="#6B7280" />
//                 <Text style={styles.rideInfoLabel}>Departure</Text>
//                 <Text style={styles.rideInfoValue}>{departureDate}</Text>
//                 <Text style={styles.rideInfoSubValue}>{departureTime}</Text>
//               </View>
//               <View style={styles.rideInfoDivider} />
//               <View style={styles.rideInfoItem}>
//                 <Ionicons name="people-outline" size={16} color="#6B7280" />
//                 <Text style={styles.rideInfoLabel}>Riders</Text>
//                 <Text style={styles.rideInfoValue}>{session?.boarded_count || 0}/{session?.total_riders || 0}</Text>
//                 <Text style={styles.rideInfoSubValue}>Boarded</Text>
//               </View>
//             </View>
//           </View>

//           <View style={styles.progressCard}>
//             <Text style={styles.progressTitle}>{progressTitle}</Text>
//             <Text style={styles.progressCount}>{progressCount}</Text>
//             <View style={styles.progressBarBg}>
//               <View
//                 style={[
//                   styles.progressBarFill,
//                   { width: `${progressPercentage}%` },
//                 ]}
//               />
//             </View>
//           </View>

//           {/* QR Code Section */}
//           {boardingPhase && (
//             <View style={styles.card}>
//               <View style={styles.cardHeaderRow}>
//                 <Text style={styles.cardTitle}>Individual Boarding QR Codes</Text>
//                 <TouchableOpacity onPress={() => {
//                   fetchRidersWithQR();
//                   setShowRiderQRModal(true);
//                 }}>
//                   <Ionicons name="qr-code-outline" size={24} color="#184080" />
//                 </TouchableOpacity>
//               </View>
//               <Text style={styles.cardSub}>Each rider has a unique QR code. Tap the QR icon to view all codes.</Text>
              
//               <TouchableOpacity 
//                 style={styles.viewQRCodesBtn}
//                 onPress={() => {
//                   fetchRidersWithQR();
//                   setShowRiderQRModal(true);
//                 }}
//               >
//                 <Ionicons name="qr-code" size={20} color="#fff" />
//                 <Text style={styles.viewQRCodesBtnText}>View Boarding QR Codes</Text>
//               </TouchableOpacity>
              
//               <View style={styles.boardingInstructionCard}>
//                 <Ionicons name="information-circle-outline" size={20} color="#184080" />
//                 <Text style={styles.boardingInstructionText}>
//                   Show each rider their unique QR code. They must scan their own code to board.
//                 </Text>
//               </View>
//             </View>
//           )}

//           <View style={styles.card}>
//             <Text style={styles.cardTitle}>
//               {boardingPhase ? 'Riders to Pick Up' : 'Passengers On Board'}
//             </Text>

//             {!hasRiders ? (
//               <View style={styles.noRidersContainer}>
//                 <Ionicons name="people-outline" size={48} color="#D1D5DB" />
//                 <Text style={styles.noRidersText}>No riders for this ride</Text>
//               </View>
//             ) : (
//               session?.riders?.map((rider, index) => {
//                 const isBoarded = ['boarded', 'dropped_off', 'completed'].includes(rider.status);
//                 const isDropped = ['dropped_off', 'completed'].includes(rider.status);
//                 const isCompleted = rider.status === 'completed';
//                 const isRated = !!rider.driver_rating;
                
//                 let statusText = 'Pending';
//                 let statusColor = '#1D4ED8';
//                 let statusBg = '#EFF6FF';
//                 let statusIcon = 'time-outline';
                
//                 if (isCompleted) {
//                   statusText = 'Completed';
//                   statusColor = '#6B7280';
//                   statusBg = '#F3F4F6';
//                   statusIcon = 'checkmark-circle-outline';
//                 } else if (isDropped) {
//                   statusText = 'Dropped Off';
//                   statusColor = '#9333EA';
//                   statusBg = '#F3E8FF';
//                   statusIcon = 'flag-outline';
//                 } else if (isBoarded) {
//                   statusText = 'On Board';
//                   statusColor = '#16A34A';
//                   statusBg = '#DCFCE7';
//                   statusIcon = 'checkmark-circle-outline';
//                 }

//                 const navigateLocation = boardingPhase && !isBoarded 
//                   ? rider.pickup_location 
//                   : (!boardingPhase && !isDropped && !isCompleted ? rider.dropoff_location : null);

//                 const boardedAt = rider.boarded_at ? new Date(rider.boarded_at).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true }) : null;
//                 const droppedAt = rider.dropped_off_at ? new Date(rider.dropped_off_at).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true }) : null;

//                 return (
//                   <View key={rider.id || rider.booking_id || index} style={styles.riderCard}>
//                     <View style={styles.riderTop}>
//                       <View style={styles.riderInfo}>
//                         {renderRiderAvatar(rider)}
//                         <View style={{ flex: 1 }}>
//                           <Text style={styles.riderName}>{rider.rider_name || 'Rider'}</Text>
//                           <Text style={styles.riderPhone}>{rider.rider_phone}</Text>
//                           <Text style={styles.riderLocationLabel}>
//                             {boardingPhase ? 'Pickup Location' : 'Drop-off Location'}
//                           </Text>
//                           <Text style={styles.riderLocation} numberOfLines={2}>
//                             {boardingPhase ? rider.pickup_location : rider.dropoff_location}
//                           </Text>
//                           {boardedAt && !boardingPhase && (
//                             <Text style={styles.timingText}>✓ Boarded at: {boardedAt}</Text>
//                           )}
//                           {droppedAt && (
//                             <Text style={styles.timingText}>✓ Dropped at: {droppedAt}</Text>
//                           )}
//                           {isRated && (
//                             <View style={styles.ratedBadge}>
//                               <Ionicons name="star" size={12} color="#F59E0B" />
//                               <Text style={styles.ratedBadgeText}>Rated {rider.driver_rating}/5</Text>
//                             </View>
//                           )}
//                         </View>
//                       </View>

//                       <View style={[styles.statusPill, { backgroundColor: statusBg }]}>
//                         <Ionicons name={statusIcon} size={12} color={statusColor} style={{ marginRight: 4 }} />
//                         <Text style={[styles.statusPillText, { color: statusColor }]}>
//                           {statusText}
//                         </Text>
//                       </View>
//                     </View>

//                     {!isCompleted && (
//                       <View style={styles.riderActions}>
//                         <TouchableOpacity 
//                           style={[styles.callBtn, styles.flexButton]} 
//                           onPress={() => callRider(rider.rider_phone)}
//                         >
//                           <Ionicons name="call-outline" size={18} color="#184080" />
//                           <Text style={styles.callBtnText}>Call</Text>
//                         </TouchableOpacity>

//                         {navigateLocation && (
//                           <TouchableOpacity 
//                             style={[styles.navigateBtn, styles.flexButton]} 
//                             onPress={() => navigateToDestination(navigateLocation, rider.rider_name)}
//                           >
//                             <Ionicons name="navigate-outline" size={18} color="#fff" />
//                             <Text style={styles.navigateBtnText}>
//                               {boardingPhase && !isBoarded ? 'Navigate' : 'Navigate'}
//                             </Text>
//                           </TouchableOpacity>
//                         )}

//                         {!boardingPhase && !isDropped && isBoarded && (
//                           <TouchableOpacity 
//                             style={[styles.dropBtn, styles.flexButton]} 
//                             onPress={() => handleDropOff(rider.booking_id)}
//                           >
//                             <Ionicons name="flag-outline" size={18} color="#fff" />
//                             <Text style={styles.dropBtnText}>Drop Off</Text>
//                           </TouchableOpacity>
//                         )}

//                         {isDropped && !isCompleted && !isRated && (
//                           <TouchableOpacity style={[styles.rateBtn, styles.flexButton]} onPress={() => openRateModal(rider)}>
//                             <Ionicons name="star-outline" size={16} color="#D97706" />
//                             <Text style={styles.rateBtnText}>Rate</Text>
//                           </TouchableOpacity>
//                         )}

//                         {boardingPhase && !isBoarded && (
//                           <View style={styles.pendingMessage}>
//                             <Ionicons name="qr-code-outline" size={16} color="#F59E0B" />
//                             <Text style={styles.pendingMessageText}>Waiting for scan</Text>
//                           </View>
//                         )}
//                       </View>
//                     )}
//                   </View>
//                 );
//               })
//             )}
//           </View>

//           <View style={styles.card}>
//             <Text style={styles.cardTitle}>Trip Information</Text>
//             <View style={styles.tripInfoRow}>
//               <View style={styles.tripInfoItem}>
//                 <Ionicons name="location-outline" size={18} color="#184080" />
//                 <Text style={styles.tripInfoLabel}>From</Text>
//                 <Text style={styles.tripInfoValue}>{session?.ride_origin?.split(',')[0] || 'Pickup'}</Text>
//                 {session?.ride_origin && (
//                   <TouchableOpacity 
//                     style={styles.smallNavigateBtn} 
//                     onPress={() => navigateToDestination(session?.ride_origin)}
//                   >
//                     <Ionicons name="navigate-outline" size={14} color="#184080" />
//                     <Text style={styles.smallNavigateText}>Navigate</Text>
//                   </TouchableOpacity>
//                 )}
//               </View>
//               <View style={styles.tripInfoItem}>
//                 <Ionicons name="flag-outline" size={18} color="#184080" />
//                 <Text style={styles.tripInfoLabel}>To</Text>
//                 <Text style={styles.tripInfoValue}>{session?.ride_destination?.split(',')[0] || 'Destination'}</Text>
//                 {session?.ride_destination && (
//                   <TouchableOpacity 
//                     style={styles.smallNavigateBtn} 
//                     onPress={() => navigateToDestination(session?.ride_destination)}
//                   >
//                     <Ionicons name="navigate-outline" size={14} color="#184080" />
//                     <Text style={styles.smallNavigateText}>Navigate</Text>
//                   </TouchableOpacity>
//                 )}
//               </View>
//             </View>
//           </View>

//           {allRidersProcessed && session?.total_riders > 0 && !allRidersCompleted && !isRideCompleted && (
//             <TouchableOpacity
//               style={styles.completeRideBtn}
//               onPress={() => setShowCompleteConfirm(true)}
//             >
//               <Ionicons name="checkmark-done-outline" size={20} color="#fff" />
//               <Text style={styles.completeRideText}>Complete Ride</Text>
//             </TouchableOpacity>
//           )}

//           {!allRidersProcessed && session?.total_riders > 0 && !allRidersCompleted && !isRideCompleted && (
//             <TouchableOpacity
//               style={styles.forceCompleteBtn}
//               onPress={() => setShowForceCompleteConfirm(true)}
//             >
//               <Ionicons name="flag-outline" size={20} color="#fff" />
//               <Text style={styles.forceCompleteText}>Force Complete Ride</Text>
//             </TouchableOpacity>
//           )}
//         </ScrollView>
//       ) : (
//         <ScrollView
//           style={{ flex: 1 }}
//           contentContainerStyle={{ padding: 16, paddingBottom: 30 }}
//           showsVerticalScrollIndicator={false}
//         >
//           <View style={styles.completedHeaderCard}>
//             <Ionicons name="checkmark-circle" size={60} color="#10B981" />
//             <Text style={styles.completedTitle}>Ride Completed!</Text>
//             <Text style={styles.completedSubtitle}>
//               Great job! This ride has been successfully completed.
//             </Text>
//           </View>

//           <View style={styles.earningsCard}>
//             <Text style={styles.earningsCardLabel}>Total Earnings</Text>
//             <Text style={styles.earningsCardAmount}>₹{totalEarnings}</Text>
//             <View style={styles.earningsDivider} />
//             <View style={styles.earningsBreakdownCard}>
//               <Text style={styles.earningsBreakdownTitle}>Breakdown</Text>
//               {session?.riders?.filter(r => r.status === 'completed' || r.status === 'dropped_off').map((rider, index) => (
//                 <View key={index} style={styles.earningsRow}>
//                   <Text style={styles.earningsRowName}>{rider.rider_name || 'Rider'}</Text>
//                   <Text style={styles.earningsRowAmount}>₹{rider.price_paid || 0}</Text>
//                 </View>
//               ))}
//             </View>
//           </View>

//           <View style={styles.ratingCard}>
//             <Text style={styles.ratingCardTitle}>Rate Your Riders</Text>
//             <Text style={styles.ratingCardSubtitle}>
//               {allRidersRated 
//                 ? "✓ All riders have been rated! Thank you for your feedback." 
//                 : `${unratedRiders.length} rider(s) remaining to rate`}
//             </Text>
            
//             {unratedRiders.length > 0 && (
//               <View style={styles.unratedRidersContainer}>
//                 {unratedRiders.map((rider) => (
//                   <View key={rider.booking_id} style={styles.completionRiderItem}>
//                     <View style={styles.completionRiderInfo}>
//                       {renderRiderAvatar(rider)}
//                       <View>
//                         <Text style={styles.completionRiderName}>{rider.rider_name || 'Rider'}</Text>
//                         <Text style={styles.completionRiderDetails}>
//                           {rider.seats_booked || 1} seat(s) • ₹{rider.price_paid || 0}
//                         </Text>
//                       </View>
//                     </View>
//                     <TouchableOpacity 
//                       style={styles.completionRateButton}
//                       onPress={() => openRateModal(rider)}>
//                       <Text style={styles.completionRateButtonText}>Rate Now</Text>
//                     </TouchableOpacity>
//                   </View>
//                 ))}
//               </View>
//             )}
//           </View>

//           <View style={styles.completionActionButtons}>
//             {!allRidersRated && (
//               <TouchableOpacity 
//                 style={styles.laterButton}
//                 onPress={handleGoToMyRides}>
//                 <Text style={styles.laterButtonText}>Rate Later</Text>
//               </TouchableOpacity>
//             )}
//             <TouchableOpacity 
//               style={[styles.viewRidesButton, allRidersRated && styles.viewRidesButtonFull]}
//               onPress={handleGoToMyRides}>
//               <Ionicons name="car-sport-outline" size={20} color="#fff" />
//               <Text style={styles.viewRidesButtonText}>View My Rides</Text>
//             </TouchableOpacity>
//           </View>
//         </ScrollView>
//       )}

//       <RiderQRListModal
//         visible={showRiderQRModal}
//         onClose={() => setShowRiderQRModal(false)}
//         riders={ridersWithQR}
//         sessionId={session?.session_id}
//         onRefresh={fetchRidersWithQR}
//         driverPhone={user?.phone_number}
//       />

//       <Modal visible={sosModalVisible} animationType="slide" transparent>
//         <View style={styles.sosModalBackdrop}>
//           <View style={[styles.sosModalCard, { paddingBottom: insets.bottom > 0 ? insets.bottom : 20 }]}>
//             <View style={styles.sosModalHeader}>
//               <Text style={styles.sosModalTitle}>Emergency SOS</Text>
//               <TouchableOpacity onPress={() => setSosModalVisible(false)}>
//                 <Ionicons name="close" size={24} color="#6B7280" />
//               </TouchableOpacity>
//             </View>
            
//             <Text style={styles.sosModalSubtitle}>
//               Select who to notify in this emergency (WhatsApp message will be sent)
//             </Text>
            
//             {loadingContacts ? (
//               <View style={styles.sosLoadingContainer}>
//                 <ActivityIndicator size="large" color="#E11D48" />
//                 <Text style={styles.sosLoadingText}>Loading contacts...</Text>
//               </View>
//             ) : personalContacts.length === 0 ? (
//               <View style={styles.sosEmptyContainer}>
//                 <Ionicons name="call-outline" size={60} color="#D1D5DB" />
//                 <Text style={styles.sosEmptyText}>No personal emergency contacts found</Text>
//                 <Text style={styles.sosEmptySubtext}>
//                   Please add personal emergency contacts in your profile settings
//                 </Text>
//                 <TouchableOpacity 
//                   style={styles.sosAddContactBtn}
//                   onPress={() => {
//                     setSosModalVisible(false);
//                     navigation.navigate('EmergencyContactsScreen');
//                   }}
//                 >
//                   <Text style={styles.sosAddContactBtnText}>Add Contacts</Text>
//                 </TouchableOpacity>
//               </View>
//             ) : (
//               <>
//                 <FlatList
//                   data={personalContacts}
//                   keyExtractor={(item) => item.id?.toString() || item.contact_number}
//                   renderItem={({ item }) => (
//                     <TouchableOpacity 
//                       style={styles.sosContactCard}
//                       onPress={() => {
//                         Alert.alert(
//                           'Send SOS via WhatsApp',
//                           `Send emergency alert to ${item.contact_name}?`,
//                           [
//                             { text: 'Cancel', style: 'cancel' },
//                             { 
//                               text: 'Send SOS via WhatsApp', 
//                               onPress: () => sendSOSToContact(item),
//                               style: 'destructive'
//                             }
//                           ]
//                         );
//                       }}
//                     >
//                       <View style={styles.sosContactAvatar}>
//                         <Text style={styles.sosContactAvatarText}>
//                           {item.contact_name?.charAt(0).toUpperCase() || '?'}
//                         </Text>
//                       </View>
//                       <View style={styles.sosContactInfo}>
//                         <Text style={styles.sosContactName}>{item.contact_name}</Text>
//                         <Text style={styles.sosContactPhone}>{item.contact_number}</Text>
//                         <View style={styles.whatsappBadge}>
//                           <Ionicons name="logo-whatsapp" size={12} color="#25D366" />
//                           <Text style={styles.whatsappBadgeText}>WhatsApp</Text>
//                         </View>
//                       </View>
//                       <Ionicons name="logo-whatsapp" size={32} color="#25D366" />
//                     </TouchableOpacity>
//                   )}
//                   contentContainerStyle={styles.sosContactList}
//                   showsVerticalScrollIndicator={false}
//                 />
                
//                 {personalContacts.length > 1 && (
//                   <TouchableOpacity 
//                     style={styles.sosAllButton}
//                     onPress={sendSOSToAll}
//                     disabled={sosSending}
//                   >
//                     {sosSending ? (
//                       <ActivityIndicator size="small" color="#fff" />
//                     ) : (
//                       <>
//                         <Ionicons name="notifications" size={20} color="#fff" />
//                         <Text style={styles.sosAllButtonText}>Notify All Contacts</Text>
//                       </>
//                     )}
//                   </TouchableOpacity>
//                 )}
//               </>
//             )}
//           </View>
//         </View>
//       </Modal>
// <Modal visible={showCompleteConfirm} transparent animationType="fade">
//   <View style={styles.modalBackdrop}>
//     <View style={styles.modalCard}>
//       <Ionicons name="checkmark-circle-outline" size={48} color="#10B981" />
//       <Text style={styles.modalTitle}>Complete Ride?</Text>
//       <Text style={styles.modalSub}>
//         {!allRidersProcessed 
//           ? `${session?.riders?.filter(r => r.status !== 'dropped_off' && r.status !== 'completed').length || 0} rider(s) are still not marked as dropped off. They will be automatically marked as completed.`
//           : 'Are you sure you want to complete this ride? All riders have been dropped off.'}
//       </Text>
//       <View style={styles.modalActions}>
//         <TouchableOpacity style={styles.cancelBtn} onPress={() => setShowCompleteConfirm(false)}>
//           <Text style={styles.cancelBtnText}>Cancel</Text>
//         </TouchableOpacity>
//         <TouchableOpacity style={styles.confirmBtn} onPress={handleCompleteRide}>
//           <Text style={styles.confirmBtnText}>Complete Ride</Text>
//         </TouchableOpacity>
//       </View>
//     </View>
//   </View>
// </Modal>


//       <Modal visible={showForceCompleteConfirm} transparent animationType="fade">
//         <View style={styles.modalBackdrop}>
//           <View style={styles.modalCard}>
//             <Ionicons name="alert-circle-outline" size={48} color="#DC2626" />
//             <Text style={[styles.modalTitle, { color: '#DC2626' }]}>Force Complete Ride?</Text>
//             <Text style={styles.modalSub}>
//               Any riders not marked as dropped off will be automatically completed.
//               This action cannot be undone.
//             </Text>
//             <View style={styles.modalActions}>
//               <TouchableOpacity style={styles.cancelBtn} onPress={() => setShowForceCompleteConfirm(false)}>
//                 <Text style={styles.cancelBtnText}>Cancel</Text>
//               </TouchableOpacity>
//               <TouchableOpacity style={[styles.confirmBtn, { backgroundColor: '#DC2626' }]} onPress={handleForceCompleteRide}>
//                 <Text style={styles.confirmBtnText}>Force Complete</Text>
//               </TouchableOpacity>
//             </View>
//           </View>
//         </View>
//       </Modal>

//       <Modal visible={ratingModalVisible} transparent animationType="fade">
//         <View style={styles.modalBackdrop}>
//           <View style={styles.modalCard}>
//             <Text style={styles.modalTitle}>Rate Your Rider</Text>
//             <Text style={styles.modalSub}>
//               How was your ride with {selectedRider?.rider_name || 'this rider'}?
//             </Text>

//             {renderStars()}

//             <TextInput
//               value={feedback}
//               onChangeText={setFeedback}
//               placeholder="Share your feedback (optional)"
//               multiline
//               style={styles.feedbackInput}
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
//                 <Text style={styles.submitBtnText}>Submit</Text>
//               </TouchableOpacity>
//             </View>
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

// const styles = StyleSheet.create({
//   container: { 
//     flex: 1, 
//     backgroundColor: Colors.white || '#F4F7FB' 
//   },
//   centered: { 
//     flex: 1, 
//     justifyContent: 'center', 
//     alignItems: 'center', 
//     backgroundColor: Colors.white || '#fff' 
//   },
//   loadingText: { 
//     marginTop: 12, 
//     fontSize: 14, 
//     color: '#6B7280' 
//   },
//   header: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     paddingHorizontal: 16,
//     paddingBottom: 12,
//     borderBottomWidth: 0.5,
//     borderBottomColor: '#F3F4F6',
//     backgroundColor: Colors.white || '#fff',
//   },
//   modernBackButton: {
//     width: 44,
//     height: 44,
//     borderRadius: 22,
//     justifyContent: 'center',
//     alignItems: 'center',
//   },
//   headerTitle: {
//     fontSize: 28,
//     fontWeight: '700',
//     color: Colors.primary || '#184080',
//     flex: 1,
//     textAlign: 'center',
//   },
//   infoButton: {
//     width: 44,
//     height: 44,
//     borderRadius: 22,
//     justifyContent: 'center',
//     alignItems: 'center',
//   },
//   headerSpacer: {
//     width: 44,
//   },
//   rideInfoCard: {
//     backgroundColor: '#fff',
//     borderRadius: 16,
//     padding: 16,
//     marginBottom: 14,
//     borderWidth: 1,
//     borderColor: '#E7ECF4',
//   },
//   rideInfoRow: {
//     flexDirection: 'row',
//     alignItems: 'center',
//   },
//   rideInfoItem: {
//     flex: 1,
//     alignItems: 'center',
//   },
//   rideInfoLabel: {
//     fontSize: 11,
//     color: '#6B7280',
//     marginTop: 4,
//   },
//   rideInfoValue: {
//     fontSize: 16,
//     fontWeight: '700',
//     color: '#184080',
//     marginTop: 2,
//   },
//   rideInfoSubValue: {
//     fontSize: 12,
//     color: '#6B7280',
//     marginTop: 2,
//   },
//   rideInfoDivider: {
//     width: 1,
//     height: 40,
//     backgroundColor: '#E5E7EB',
//   },
//   timerMapRow: {
//     flexDirection: 'row',
//     gap: 12,
//     marginBottom: 14,
//   },
//   timerCard: {
//     flex: 1,
//     backgroundColor: '#F0F7FF',
//     borderRadius: 16,
//     padding: 14,
//     alignItems: 'center',
//     borderWidth: 1,
//     borderColor: '#E0ECFF',
//   },
//   timerLabel: {
//     fontSize: 12,
//     color: '#6B7280',
//     marginTop: 4,
//   },
//   timerValue: {
//     fontSize: 18,
//     fontWeight: '700',
//     color: '#184080',
//     marginTop: 2,
//   },
//   mapCard: {
//     flex: 1,
//     backgroundColor: '#184080',
//     borderRadius: 16,
//     padding: 14,
//     alignItems: 'center',
//     justifyContent: 'center',
//     flexDirection: 'row',
//     gap: 8,
//   },
//   mapCardText: {
//     fontSize: 13,
//     fontWeight: '600',
//     color: '#fff',
//   },
//   progressCard: {
//     backgroundColor: '#2E5AAC',
//     borderRadius: 18,
//     padding: 16,
//     marginBottom: 14,
//   },
//   progressTitle: { 
//     color: '#DCE8FF', 
//     fontSize: 13, 
//     marginBottom: 4 
//   },
//   progressCount: { 
//     color: '#fff', 
//     fontSize: 18, 
//     fontWeight: '700', 
//     marginBottom: 12 
//   },
//   progressBarBg: { 
//     height: 10, 
//     borderRadius: 10, 
//     backgroundColor: 'rgba(255,255,255,0.2)' 
//   },
//   progressBarFill: { 
//     height: 10, 
//     borderRadius: 10, 
//     backgroundColor: '#FF8A00' 
//   },
//   card: {
//     backgroundColor: '#fff',
//     borderRadius: 18,
//     padding: 16,
//     marginBottom: 14,
//     borderWidth: 1,
//     borderColor: '#E7ECF4',
//   },
//   cardHeaderRow: {
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//     alignItems: 'center',
//     marginBottom: 4,
//   },
//   cardTitle: { 
//     color: '#1C2746', 
//     fontSize: 16, 
//     fontWeight: '700' 
//   },
//   cardSub: { 
//     color: '#7A8599', 
//     fontSize: 13, 
//     marginTop: 4, 
//     marginBottom: 12 
//   },
//   viewQRCodesBtn: {
//     backgroundColor: '#10B981',
//     borderRadius: 14,
//     paddingVertical: 14,
//     flexDirection: 'row',
//     alignItems: 'center',
//     justifyContent: 'center',
//     gap: 8,
//     marginBottom: 12,
//   },
//   viewQRCodesBtnText: {
//     color: '#fff',
//     fontSize: 15,
//     fontWeight: '600',
//   },
//   boardingInstructionCard: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     backgroundColor: '#EFF6FF',
//     borderRadius: 12,
//     padding: 12,
//     marginTop: 8,
//     gap: 10,
//   },
//   boardingInstructionText: {
//     flex: 1,
//     fontSize: 12,
//     color: '#184080',
//     lineHeight: 18,
//   },
//   riderCard: { 
//     borderWidth: 1, 
//     borderColor: '#E5E7EB', 
//     borderRadius: 16, 
//     padding: 14, 
//     marginTop: 12,
//   },
//   riderTop: { 
//     flexDirection: 'row', 
//     justifyContent: 'space-between', 
//     alignItems: 'flex-start', 
//     gap: 10,
//   },
//   riderInfo: { 
//     flexDirection: 'row', 
//     flex: 1 
//   },
//   avatar: { 
//     width: 52, 
//     height: 52, 
//     borderRadius: 26, 
//     marginRight: 12 
//   },
//   avatarFallback: { 
//     backgroundColor: '#E8EEF9', 
//     justifyContent: 'center', 
//     alignItems: 'center' 
//   },
//   avatarText: { 
//     color: '#184080', 
//     fontWeight: '700', 
//     fontSize: 18 
//   },
//   riderName: { 
//     color: '#132238', 
//     fontSize: 15, 
//     fontWeight: '700' 
//   },
//   riderPhone: { 
//     color: '#667085', 
//     fontSize: 13, 
//     marginTop: 2 
//   },
//   riderLocationLabel: { 
//     color: '#667085', 
//     fontSize: 11, 
//     marginTop: 8 
//   },
//   riderLocation: { 
//     color: '#111827', 
//     fontSize: 13, 
//     fontWeight: '500', 
//     marginTop: 2 
//   },
//   timingText: {
//     fontSize: 11,
//     color: '#10B981',
//     marginTop: 4,
//   },
//   ratedBadge: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     marginTop: 4,
//     gap: 4,
//   },
//   ratedBadgeText: {
//     fontSize: 10,
//     color: '#F59E0B',
//     fontWeight: '500',
//   },
//   statusPill: { 
//     flexDirection: 'row',
//     alignItems: 'center',
//     paddingHorizontal: 10, 
//     paddingVertical: 6, 
//     borderRadius: 999 
//   },
//   statusPillText: { 
//     fontSize: 12, 
//     fontWeight: '700' 
//   },
//   riderActions: {
//     flexDirection: 'row',
//     marginTop: 14,
//     gap: 10,
//     flexWrap: 'wrap',
//     alignItems: 'center',
//   },
//   flexButton: {
//     flex: 1,
//     minWidth: 100,
//   },
//   callBtn: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     justifyContent: 'center',
//     gap: 6,
//     paddingHorizontal: 14,
//     paddingVertical: 10,
//     borderRadius: 10,
//     borderWidth: 1,
//     borderColor: '#184080',
//     backgroundColor: '#fff',
//   },
//   callBtnText: { 
//     color: '#184080', 
//     fontWeight: '600', 
//     fontSize: 13 
//   },
//   navigateBtn: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     justifyContent: 'center',
//     gap: 6,
//     paddingHorizontal: 14,
//     paddingVertical: 10,
//     borderRadius: 10,
//     backgroundColor: '#10B981',
//   },
//   navigateBtnText: {
//     color: '#fff',
//     fontWeight: '600',
//     fontSize: 13,
//   },
//   dropBtn: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     justifyContent: 'center',
//     gap: 6,
//     backgroundColor: '#7C3AED',
//     borderRadius: 10,
//     paddingVertical: 10,
//   },
//   dropBtnText: { 
//     color: '#fff', 
//     fontWeight: '700', 
//     fontSize: 13 
//   },
//   rateBtn: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     justifyContent: 'center',
//     gap: 6,
//     borderWidth: 1,
//     borderColor: '#F59E0B',
//     borderRadius: 10,
//     paddingVertical: 10,
//     paddingHorizontal: 14,
//   },
//   rateBtnText: { 
//     color: '#D97706', 
//     fontWeight: '700', 
//     fontSize: 13 
//   },
//   pendingMessage: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     justifyContent: 'center',
//     gap: 6,
//     paddingVertical: 10,
//     paddingHorizontal: 12,
//     backgroundColor: '#FEF3C7',
//     borderRadius: 10,
//   },
//   pendingMessageText: {
//     fontSize: 12,
//     color: '#D97706',
//     fontWeight: '500',
//   },
//   tripInfoRow: {
//     flexDirection: 'row',
//     marginTop: 12,
//     gap: 16,
//   },
//   tripInfoItem: {
//     flex: 1,
//     alignItems: 'center',
//     padding: 12,
//     backgroundColor: '#F8FAFC',
//     borderRadius: 12,
//     position: 'relative',
//   },
//   tripInfoLabel: { 
//     fontSize: 12, 
//     color: '#6B7280', 
//     marginTop: 4 
//   },
//   tripInfoValue: { 
//     fontSize: 14, 
//     fontWeight: '600', 
//     color: '#111827', 
//     marginTop: 2, 
//     textAlign: 'center' 
//   },
//   smallNavigateBtn: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     gap: 4,
//     marginTop: 8,
//     paddingHorizontal: 8,
//     paddingVertical: 4,
//     backgroundColor: '#E8EEF9',
//     borderRadius: 12,
//   },
//   smallNavigateText: {
//     fontSize: 10,
//     color: '#184080',
//     fontWeight: '500',
//   },
//   completeRideBtn: {
//     backgroundColor: '#10B981',
//     borderRadius: 16,
//     paddingVertical: 15,
//     alignItems: 'center',
//     justifyContent: 'center',
//     flexDirection: 'row',
//     gap: 8,
//     marginBottom: 12,
//   },
//   completeRideText: { 
//     color: '#fff', 
//     fontWeight: '700', 
//     fontSize: 15 
//   },
//   forceCompleteBtn: {
//     backgroundColor: '#DC2626',
//     borderRadius: 16,
//     paddingVertical: 15,
//     alignItems: 'center',
//     justifyContent: 'center',
//     flexDirection: 'row',
//     gap: 8,
//     marginBottom: 12,
//   },
//   forceCompleteText: {
//     color: '#fff',
//     fontWeight: '700',
//     fontSize: 15,
//   },
//   completedHeaderCard: {
//     backgroundColor: '#fff',
//     borderRadius: 20,
//     padding: 24,
//     alignItems: 'center',
//     marginBottom: 16,
//     borderWidth: 1,
//     borderColor: '#E5E7EB',
//   },
//   completedTitle: {
//     fontSize: 24,
//     fontWeight: '700',
//     color: '#10B981',
//     marginTop: 12,
//   },
//   completedSubtitle: {
//     fontSize: 14,
//     color: '#6B7280',
//     textAlign: 'center',
//     marginTop: 8,
//   },
//   earningsCard: {
//     backgroundColor: '#fff',
//     borderRadius: 20,
//     padding: 20,
//     marginBottom: 16,
//     borderWidth: 1,
//     borderColor: '#E5E7EB',
//   },
//   earningsCardLabel: {
//     fontSize: 14,
//     color: '#6B7280',
//     textAlign: 'center',
//   },
//   earningsCardAmount: {
//     fontSize: 36,
//     fontWeight: '800',
//     color: '#184080',
//     textAlign: 'center',
//     marginTop: 8,
//   },
//   earningsDivider: {
//     height: 1,
//     backgroundColor: '#E5E7EB',
//     marginVertical: 16,
//   },
//   earningsBreakdownCard: {
//     backgroundColor: '#F8FAFC',
//     borderRadius: 12,
//     padding: 12,
//   },
//   earningsBreakdownTitle: {
//     fontSize: 14,
//     fontWeight: '600',
//     color: '#111827',
//     marginBottom: 12,
//   },
//   earningsRow: {
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//     paddingVertical: 6,
//   },
//   earningsRowName: {
//     fontSize: 13,
//     color: '#6B7280',
//   },
//   earningsRowAmount: {
//     fontSize: 13,
//     fontWeight: '600',
//     color: '#184080',
//   },
//   ratingCard: {
//     backgroundColor: '#fff',
//     borderRadius: 20,
//     padding: 20,
//     marginBottom: 16,
//     borderWidth: 1,
//     borderColor: '#E5E7EB',
//   },
//   ratingCardTitle: {
//     fontSize: 18,
//     fontWeight: '700',
//     color: '#111827',
//     marginBottom: 4,
//   },
//   ratingCardSubtitle: {
//     fontSize: 13,
//     color: '#6B7280',
//     marginBottom: 16,
//   },
//   unratedRidersContainer: {
//     marginTop: 8,
//   },
//   completionRiderItem: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     justifyContent: 'space-between',
//     paddingVertical: 12,
//     borderBottomWidth: 1,
//     borderBottomColor: '#F0F0F0',
//   },
//   completionRiderInfo: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     gap: 12,
//   },
//   completionRiderName: {
//     fontSize: 15,
//     fontWeight: '600',
//     color: '#111827',
//   },
//   completionRiderDetails: {
//     fontSize: 12,
//     color: '#6B7280',
//     marginTop: 2,
//   },
//   completionRateButton: {
//     backgroundColor: '#184080',
//     paddingHorizontal: 16,
//     paddingVertical: 8,
//     borderRadius: 20,
//   },
//   completionRateButtonText: {
//     color: '#fff',
//     fontSize: 12,
//     fontWeight: '600',
//   },
//   completionActionButtons: {
//     flexDirection: 'row',
//     gap: 12,
//     marginBottom: 20,
//   },
//   laterButton: {
//     flex: 1,
//     backgroundColor: '#F3F4F6',
//     borderRadius: 14,
//     paddingVertical: 14,
//     alignItems: 'center',
//   },
//   laterButtonText: {
//     color: '#6B7280',
//     fontSize: 15,
//     fontWeight: '600',
//   },
//   viewRidesButton: {
//     flex: 1,
//     backgroundColor: '#184080',
//     borderRadius: 14,
//     paddingVertical: 14,
//     alignItems: 'center',
//     justifyContent: 'center',
//     flexDirection: 'row',
//     gap: 8,
//   },
//   viewRidesButtonFull: {
//     flex: 1,
//   },
//   viewRidesButtonText: {
//     color: '#fff',
//     fontSize: 15,
//     fontWeight: '700',
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
//     alignItems: 'center' 
//   },
//   modalTitle: { 
//     fontSize: 22, 
//     fontWeight: '700', 
//     color: '#111827', 
//     textAlign: 'center', 
//     marginTop: 12 
//   },
//   modalSub: { 
//     fontSize: 14, 
//     color: '#6B7280', 
//     textAlign: 'center', 
//     marginTop: 8, 
//     marginBottom: 18 
//   },
//   starsRow: { 
//     flexDirection: 'row', 
//     justifyContent: 'center', 
//     marginBottom: 18 
//   },
//   feedbackInput: {
//     minHeight: 110,
//     borderWidth: 1,
//     borderColor: '#E5E7EB',
//     borderRadius: 16,
//     padding: 14,
//     textAlignVertical: 'top',
//     color: '#111827',
//     width: '100%',
//   },
//   modalActions: { 
//     flexDirection: 'row', 
//     gap: 10, 
//     marginTop: 18, 
//     width: '100%' 
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
//     fontWeight: '600' 
//   },
//   submitBtn: {
//     flex: 1,
//     backgroundColor: '#184080',
//     borderRadius: 999,
//     paddingVertical: 14,
//     alignItems: 'center',
//   },
//   submitBtnText: { 
//     color: '#fff', 
//     fontWeight: '700' 
//   },
//   cancelBtn: {
//     flex: 1,
//     borderWidth: 1,
//     borderColor: '#D1D5DB',
//     borderRadius: 999,
//     paddingVertical: 14,
//     alignItems: 'center',
//   },
//   cancelBtnText: { 
//     color: '#6B7280', 
//     fontWeight: '600' 
//   },
//   confirmBtn: {
//     flex: 1,
//     backgroundColor: '#10B981',
//     borderRadius: 999,
//     paddingVertical: 14,
//     alignItems: 'center',
//   },
//   confirmBtnText: { 
//     color: '#fff', 
//     fontWeight: '700' 
//   },
//   noSessionContainer: {
//     flex: 1,
//     justifyContent: 'center',
//     alignItems: 'center',
//     padding: 30,
//   },
//   noSessionTitle: {
//     fontSize: 20,
//     fontWeight: '700',
//     color: '#111827',
//     marginTop: 20,
//     marginBottom: 8,
//   },
//   noSessionText: {
//     fontSize: 14,
//     color: '#6B7280',
//     textAlign: 'center',
//     marginBottom: 30,
//     lineHeight: 20,
//   },
//   backButton: {
//     backgroundColor: '#184080',
//     paddingHorizontal: 30,
//     paddingVertical: 12,
//     borderRadius: 12,
//   },
//   backButtonText: { 
//     color: '#fff', 
//     fontWeight: '600', 
//     fontSize: 16 
//   },
//   noRidersContainer: {
//     alignItems: 'center',
//     paddingVertical: 40,
//   },
//   noRidersText: {
//     fontSize: 14,
//     color: '#9CA3AF',
//     marginTop: 12,
//   },
//   sosModalBackdrop: {
//     flex: 1,
//     backgroundColor: 'rgba(0,0,0,0.5)',
//     justifyContent: 'flex-end',
//   },
//   sosModalCard: {
//     backgroundColor: '#fff',
//     borderTopLeftRadius: 24,
//     borderTopRightRadius: 24,
//     padding: 20,
//     maxHeight: '80%',
//   },
//   sosModalHeader: {
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//     alignItems: 'center',
//     marginBottom: 8,
//   },
//   sosModalTitle: {
//     fontSize: 22,
//     fontWeight: '700',
//     color: '#E11D48',
//   },
//   sosModalSubtitle: {
//     fontSize: 14,
//     color: '#6B7280',
//     marginBottom: 20,
//   },
//   sosContactList: {
//     paddingBottom: 16,
//   },
//   sosContactCard: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     backgroundColor: '#FEF2F2',
//     borderRadius: 16,
//     padding: 14,
//     marginBottom: 12,
//     borderWidth: 1,
//     borderColor: '#FEE2E2',
//   },
//   sosContactAvatar: {
//     width: 50,
//     height: 50,
//     borderRadius: 25,
//     backgroundColor: '#E11D48',
//     justifyContent: 'center',
//     alignItems: 'center',
//     marginRight: 12,
//   },
//   sosContactAvatarText: {
//     color: '#fff',
//     fontSize: 20,
//     fontWeight: '700',
//   },
//   sosContactInfo: {
//     flex: 1,
//   },
//   sosContactName: {
//     fontSize: 16,
//     fontWeight: '600',
//     color: '#111827',
//   },
//   sosContactPhone: {
//     fontSize: 13,
//     color: '#6B7280',
//     marginTop: 2,
//   },
//   whatsappBadge: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     gap: 4,
//     marginTop: 4,
//   },
//   whatsappBadgeText: {
//     fontSize: 11,
//     color: '#25D366',
//     fontWeight: '500',
//   },
//   sosAllButton: {
//     backgroundColor: '#E11D48',
//     borderRadius: 14,
//     paddingVertical: 14,
//     flexDirection: 'row',
//     alignItems: 'center',
//     justifyContent: 'center',
//     gap: 8,
//     marginTop: 8,
//   },
//   sosAllButtonText: {
//     color: '#fff',
//     fontSize: 16,
//     fontWeight: '600',
//   },
//   sosLoadingContainer: {
//     alignItems: 'center',
//     paddingVertical: 40,
//   },
//   sosLoadingText: {
//     marginTop: 12,
//     color: '#6B7280',
//   },
//   sosEmptyContainer: {
//     alignItems: 'center',
//     paddingVertical: 40,
//   },
//   sosEmptyText: {
//     fontSize: 16,
//     fontWeight: '600',
//     color: '#111827',
//     marginTop: 16,
//   },
//   sosEmptySubtext: {
//     fontSize: 13,
//     color: '#6B7280',
//     textAlign: 'center',
//     marginTop: 8,
//     marginBottom: 20,
//   },
//   sosAddContactBtn: {
//     backgroundColor: '#184080',
//     paddingHorizontal: 20,
//     paddingVertical: 10,
//     borderRadius: 12,
//   },
//   sosAddContactBtnText: {
//     color: '#fff',
//     fontWeight: '600',
//   },
//   riderQRModalContainer: {
//     flex: 1,
//     backgroundColor: '#fff',
//   },
//   riderQRModalHeader: {
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//     alignItems: 'center',
//     paddingHorizontal: 16,
//     paddingTop: Platform.OS === 'ios' ? 50 : 20,
//     paddingBottom: 12,
//     borderBottomWidth: 1,
//     borderBottomColor: '#E5E7EB',
//   },
//   riderQRModalTitle: {
//     fontSize: 20,
//     fontWeight: '700',
//     color: '#111827',
//   },
//   riderQRModalClose: {
//     padding: 8,
//   },
//   riderQRModalScroll: {
//     flex: 1,
//     padding: 16,
//   },
//   riderQRModalSubtitle: {
//     fontSize: 14,
//     color: '#6B7280',
//     marginBottom: 20,
//     textAlign: 'center',
//   },
//   riderQRCard: {
//     backgroundColor: '#fff',
//     borderRadius: 16,
//     borderWidth: 1,
//     borderColor: '#E5E7EB',
//     marginBottom: 16,
//     overflow: 'hidden',
//   },
//   riderQRHeader: {
//     padding: 16,
//     borderBottomWidth: 1,
//     borderBottomColor: '#F3F4F6',
//   },
//   riderQRInfo: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     gap: 12,
//   },
//   riderQRAvatar: {
//     width: 50,
//     height: 50,
//     borderRadius: 25,
//   },
//   riderQRAvatarFallback: {
//     backgroundColor: '#E8EEF9',
//     alignItems: 'center',
//     justifyContent: 'center',
//   },
//   riderQRAvatarText: {
//     fontSize: 18,
//     fontWeight: '700',
//     color: '#184080',
//   },
//   riderQRName: {
//     fontSize: 16,
//     fontWeight: '700',
//     color: '#111827',
//   },
//   riderQRSeats: {
//     fontSize: 12,
//     color: '#6B7280',
//     marginTop: 2,
//   },
//   riderQRStatusBadge: {
//     marginTop: 4,
//     paddingHorizontal: 8,
//     paddingVertical: 2,
//     borderRadius: 12,
//     alignSelf: 'flex-start',
//   },
//   riderQRStatusPending: {
//     backgroundColor: '#FEF3C7',
//   },
//   riderQRStatusBoarded: {
//     backgroundColor: '#DCFCE7',
//   },
//   riderQRStatusText: {
//     fontSize: 10,
//     fontWeight: '600',
//     color: '#92400E',
//   },
//   riderQRCodeContainer: {
//     padding: 20,
//     alignItems: 'center',
//     backgroundColor: '#F9FAFB',
//   },
//   riderQRCodeBox: {
//     padding: 16,
//     backgroundColor: '#fff',
//     borderRadius: 16,
//     alignItems: 'center',
//     justifyContent: 'center',
//   },
//   riderQRToken: {
//     marginTop: 12,
//     fontSize: 14,
//     fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
//     color: '#6B7280',
//     textAlign: 'center',
//   },
//   riderQRExpiry: {
//     fontSize: 11,
//     color: '#EF4444',
//     marginTop: 4,
//   },
//   riderQRActions: {
//     flexDirection: 'row',
//     marginTop: 16,
//     gap: 12,
//   },
//   riderQRActionBtn: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     gap: 6,
//     paddingHorizontal: 16,
//     paddingVertical: 8,
//     backgroundColor: '#E8EEF9',
//     borderRadius: 20,
//   },
//   riderQRActionDisabled: {
//     opacity: 0.5,
//   },
//   riderQRActionText: {
//     fontSize: 13,
//     color: '#184080',
//     fontWeight: '500',
//   },
//   riderBoardedMessage: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     justifyContent: 'center',
//     gap: 8,
//     padding: 16,
//     backgroundColor: '#DCFCE7',
//   },
//   riderBoardedText: {
//     fontSize: 14,
//     fontWeight: '500',
//     color: '#166534',
//   },
//   riderQRNoRiders: {
//     alignItems: 'center',
//     paddingVertical: 60,
//   },
//   riderQRNoRidersText: {
//     fontSize: 18,
//     fontWeight: '600',
//     color: '#111827',
//     marginTop: 16,
//   },
//   riderQRNoRidersSub: {
//     fontSize: 14,
//     color: '#6B7280',
//     marginTop: 8,
//     textAlign: 'center',
//   },
//   // Update the completeRideBtn style
// completeRideBtn: {
//   backgroundColor: '#10B981',
//   borderRadius: 16,
//   paddingVertical: 15,
//   alignItems: 'center',
//   justifyContent: 'center',
//   flexDirection: 'row',
//   gap: 8,
//   marginBottom: 12,
//   marginTop: 8,
//   shadowColor: '#000',
//   shadowOffset: { width: 0, height: 2 },
//   shadowOpacity: 0.1,
//   shadowRadius: 4,
//   elevation: 3,
// },
// });
import React, { useCallback, useEffect, useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  StatusBar,
  ScrollView,
  RefreshControl,
  ActivityIndicator,
  Image,
  TextInput,
  Modal,
  Alert,
  Clipboard,
  Share,
  Linking,
  Dimensions,
  FlatList,
  Platform,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import Ionicons from '@expo/vector-icons/Ionicons';
import { MaterialIcons } from '@expo/vector-icons';
import axios from 'axios';
import * as Location from 'expo-location';
import { API_BASE_URL } from "../config/config_ip";
import { useAuth } from '../context/AuthContext';
import { Colors } from '../constants/Colors';
import EmergencyContactService from '../services/emergencycontact_ds';
import CustomAlert from '../components/CustomAlert';
import io from 'socket.io-client';
import QRCode from 'react-native-qrcode-svg';

const { width } = Dimensions.get('window');

const buildImageUrl = (url) => {
  if (!url) return null;
  if (url.startsWith('http://') || url.startsWith('https://')) return url;
  return `${API_BASE_URL}${url.startsWith('/') ? url : `/${url}`}`;
};

const getInitials = (name) => {
  if (!name) return '?';
  const parts = name.trim().split(' ').filter(Boolean);
  if (parts.length > 1) return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
  return parts[0].slice(0, 2).toUpperCase();
};

const RiderQRListModal = ({ visible, onClose, riders, sessionId, onRefresh, driverPhone }) => {
  const [refreshingRider, setRefreshingRider] = useState(null);
  const [ridersList, setRidersList] = useState(riders);
  const [showAlert, setShowAlert] = useState(false);
  const [alertConfig, setAlertConfig] = useState({ title: '', message: '', icon: 'check-circle', iconColor: '#10B981' });
  
  useEffect(() => {
    setRidersList(riders);
  }, [riders]);
  
  const showCustomAlert = (title, message, type = 'success') => {
    let icon = "check-circle";
    let iconColor = "#10B981";
    if (type === 'error') {
      icon = "error";
      iconColor = "#EF4444";
    } else if (type === 'warning') {
      icon = "warning";
      iconColor = "#F59E0B";
    }
    setAlertConfig({ title, message, icon, iconColor });
    setShowAlert(true);
  };
  
  const refreshRiderQR = async (riderId, riderIndex) => {
    setRefreshingRider(riderId);
    try {
      const response = await axios.post(
        `${API_BASE_URL}/ride-sessions/${sessionId}/refresh-rider-qr/${riderId}`,
        { driver_phone: driverPhone }
      );
      
      if (response.data.success) {
        const updatedRiders = [...ridersList];
        updatedRiders[riderIndex] = {
          ...updatedRiders[riderIndex],
          individual_qr_token: response.data.individual_qr_token,
          qr_expires_at: response.data.qr_expires_at
        };
        setRidersList(updatedRiders);
        showCustomAlert('Success', 'QR code refreshed successfully', 'success');
        if (onRefresh) onRefresh();
      }
    } catch (error) {
      showCustomAlert('Error', error?.response?.data?.detail || 'Could not refresh QR code', 'error');
    } finally {
      setRefreshingRider(null);
    }
  };
  
  const copyQRToken = (token) => {
    Clipboard.setString(token);
    showCustomAlert('Copied', 'QR token copied to clipboard', 'success');
  };
  
  const shareQRCode = async (token, riderName) => {
    try {
      await Share.share({
        message: `🚗 *Boarding QR Code for ${riderName}* 🚗\n\nPlease show this code to the driver to board:\n\n*${token}*\n\n⚠️ This code is unique to you and expires in 2 hours.`,
        title: `Boarding Code - ${riderName}`
      });
    } catch (error) {
      console.error('Error sharing QR code:', error);
    }
  };
  
  const renderRiderQR = ({ item, index }) => {
    const isPending = item.status === 'accepted' || item.status === 'reached_pickup';
    const isBoarded = item.status === 'boarded';
    const isCompleted = item.status === 'completed' || item.status === 'dropped_off';
    
    if (isCompleted) return null;
    
    return (
      <View style={styles.riderQRCard}>
        <View style={styles.riderQRHeader}>
          <View style={styles.riderQRInfo}>
            {item.rider_photo ? (
              <Image source={{ uri: buildImageUrl(item.rider_photo) }} style={styles.riderQRAvatar} />
            ) : (
              <View style={[styles.riderQRAvatar, styles.riderQRAvatarFallback]}>
                <Text style={styles.riderQRAvatarText}>
                  {getInitials(item.rider_name)}
                </Text>
              </View>
            )}
            <View>
              <Text style={styles.riderQRName}>{item.rider_name}</Text>
              <Text style={styles.riderQRSeats}>{item.seats_booked || 1} seat(s)</Text>
              <View style={[
                styles.riderQRStatusBadge,
                isBoarded ? styles.riderQRStatusBoarded : styles.riderQRStatusPending
              ]}>
                <Text style={styles.riderQRStatusText}>
                  {isBoarded ? '✓ Boarded' : isPending ? 'Pending Boarding' : item.status}
                </Text>
              </View>
            </View>
          </View>
        </View>
        
        {isPending && item.individual_qr_token && (
          <View style={styles.riderQRCodeContainer}>
            <View style={styles.riderQRCodeBox}>
              <QRCode
                value={item.individual_qr_token}
                size={160}
                color="#000000"
                backgroundColor="#FFFFFF"
              />
            </View>
            <Text style={styles.riderQRToken}>{item.individual_qr_token}</Text>
            <Text style={styles.riderQRExpiry}>
              Expires: {item.qr_expires_at ? new Date(item.qr_expires_at).toLocaleTimeString() : '2 hours'}
            </Text>
            <View style={styles.riderQRActions}>
              <TouchableOpacity 
                style={styles.riderQRActionBtn}
                onPress={() => copyQRToken(item.individual_qr_token)}
              >
                <Ionicons name="copy-outline" size={18} color="#184080" />
                <Text style={styles.riderQRActionText}>Copy</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={styles.riderQRActionBtn}
                onPress={() => shareQRCode(item.individual_qr_token, item.rider_name)}
              >
                <Ionicons name="share-outline" size={18} color="#184080" />
                <Text style={styles.riderQRActionText}>Share</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={[styles.riderQRActionBtn, refreshingRider === item.id && styles.riderQRActionDisabled]}
                onPress={() => refreshRiderQR(item.id, index)}
                disabled={refreshingRider === item.id}
              >
                {refreshingRider === item.id ? (
                  <ActivityIndicator size="small" color="#184080" />
                ) : (
                  <>
                    <Ionicons name="refresh-outline" size={18} color="#184080" />
                    <Text style={styles.riderQRActionText}>Refresh</Text>
                  </>
                )}
              </TouchableOpacity>
            </View>
          </View>
        )}
        
        {isBoarded && (
          <View style={styles.riderBoardedMessage}>
            <Ionicons name="checkmark-circle" size={24} color="#10B981" />
            <Text style={styles.riderBoardedText}>Rider has already boarded</Text>
          </View>
        )}
      </View>
    );
  };
  
  return (
    <>
      <Modal visible={visible} animationType="slide" transparent={false}>
        <SafeAreaView style={styles.riderQRModalContainer}>
          <View style={styles.riderQRModalHeader}>
            <Text style={styles.riderQRModalTitle}>Boarding QR Codes</Text>
            <TouchableOpacity onPress={onClose} style={styles.riderQRModalClose}>
              <Ionicons name="close" size={28} color="#111827" />
            </TouchableOpacity>
          </View>
          
          <ScrollView 
            style={styles.riderQRModalScroll}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ paddingBottom: 30 }}
          >
            <Text style={styles.riderQRModalSubtitle}>
              Each rider has their own unique QR code. Show them their code to scan and board.
            </Text>
            
            {ridersList.filter(r => r.status !== 'completed' && r.status !== 'dropped_off').length === 0 ? (
              <View style={styles.riderQRNoRiders}>
                <Ionicons name="people-outline" size={60} color="#D1D5DB" />
                <Text style={styles.riderQRNoRidersText}>No pending riders</Text>
                <Text style={styles.riderQRNoRidersSub}>All riders have been boarded or completed</Text>
              </View>
            ) : (
              <FlatList
                data={ridersList.filter(r => r.status !== 'completed' && r.status !== 'dropped_off')}
                keyExtractor={(item) => item.id.toString()}
                renderItem={renderRiderQR}
                scrollEnabled={false}
              />
            )}
          </ScrollView>
        </SafeAreaView>
      </Modal>
      
      <CustomAlert
        visible={showAlert}
        title={alertConfig.title}
        message={alertConfig.message}
        icon={alertConfig.icon}
        iconColor={alertConfig.iconColor}
        buttons={[{ text: 'OK', onPress: () => setShowAlert(false) }]}
      />
    </>
  );
};

export default function OngoingRideDriverScreen({ route, navigation }) {
  const { rideId, sessionId: initialSessionId } = route.params || {};
  const { user } = useAuth();
  const insets = useSafeAreaInsets();

  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [ratingModalVisible, setRatingModalVisible] = useState(false);
  const [selectedRider, setSelectedRider] = useState(null);
  const [rating, setRating] = useState(0);
  const [feedback, setFeedback] = useState('');
  const [qrModalVisible, setQrModalVisible] = useState(false);
  const [showCompleteConfirm, setShowCompleteConfirm] = useState(false);
  const [elapsedTime, setElapsedTime] = useState(0);
  const timerRef = useRef(null);
  const [sessionStartTime, setSessionStartTime] = useState(null);
  const [socketConnected, setSocketConnected] = useState(false);
  const locationIntervalRef = useRef(null);
  const socketRef = useRef(null);
  const [showRiderQRModal, setShowRiderQRModal] = useState(false);
  const [ridersWithQR, setRidersWithQR] = useState([]);
  const [rideCompleted, setRideCompleted] = useState(false);
  const [totalEarnings, setTotalEarnings] = useState(0);
  const [showCompletionSummary, setShowCompletionSummary] = useState(false);
  const [allRidersRated, setAllRidersRated] = useState(false);
  const [unratedRiders, setUnratedRiders] = useState([]);
  const [sosModalVisible, setSosModalVisible] = useState(false);
  const [personalContacts, setPersonalContacts] = useState([]);
  const [loadingContacts, setLoadingContacts] = useState(false);
  const [sosSending, setSosSending] = useState(false);
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
      iconColor = Colors.primary || "#184080";
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

  const formatElapsedTime = (seconds) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    
    if (hours > 0) {
      return `${hours}h ${minutes}m ${secs}s`;
    } else if (minutes > 0) {
      return `${minutes}m ${secs}s`;
    }
    return `${secs}s`;
  };

  const formatDateTime = (dateTimeStr) => {
    if (!dateTimeStr) return { date: 'N/A', time: 'N/A' };
    const date = new Date(dateTimeStr);
    return {
      date: date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' }),
      time: date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true }),
    };
  };

  const getPendingRidersCount = () => {
    if (!session?.riders) return 0;
    return session.riders.filter(r => r.status !== 'dropped_off' && r.status !== 'completed').length;
  };

  const fetchRidersWithQR = async () => {
    try {
      const response = await axios.get(
        `${API_BASE_URL}/ride-sessions/driver/${rideId}/riders`,
        { params: { driver_phone: user?.phone_number } }
      );
      
      if (response.data) {
        setRidersWithQR(response.data.riders || []);
      }
    } catch (error) {
      console.error('Error fetching riders with QR:', error);
    }
  };

  const connectSocket = useCallback(async () => {
    if (!session?.session_id) return;
    
    if (socketRef.current && socketRef.current.connected) {
      return;
    }
    
    try {
      const socket = io(API_BASE_URL, {
        transports: ['websocket', 'polling'],
        reconnection: true,
        reconnectionAttempts: 10,
        reconnectionDelay: 1000,
        reconnectionDelayMax: 10000,
        timeout: 10000,
        forceNew: true,
        path: '/socket.io',
        auth: {
          token: user?.phone_number || null,
          userType: 'driver'
        }
      });
      
      socketRef.current = socket;
      
      socket.on('connect', () => {
        console.log('✅ Socket connected for driver');
        setSocketConnected(true);
        socket.emit('join-ride-room', session.session_id);
        if (user?.phone_number) {
          socket.emit('join-user-room', user.phone_number);
        }
      });
      
      socket.on('connect_error', (error) => {
        console.log('❌ Socket connection error:', error.message);
        setSocketConnected(false);
      });
      
      socket.on('rider-boarded', (data) => {
        console.log('Rider boarded event:', data);
        fetchSession();
        fetchRidersWithQR();
        showCustomAlert('Rider Boarded', `${data.rider_name || 'A rider'} has boarded the ride`, 'success');
      });
      
      socket.on('rider-dropped-off', (data) => {
        console.log('Rider dropped off event:', data);
        fetchSession();
        fetchRidersWithQR();
        showCustomAlert('Rider Dropped Off', `${data.rider_name || 'A rider'} has been dropped off`, 'success');
      });
      
      socket.on('emergency-alert', (data) => {
        console.log('Emergency alert received:', data);
        showCustomAlert('Emergency Alert', data.message || 'Emergency alert triggered', 'warning');
      });
      
    } catch (error) {
      console.log('Socket connection error:', error);
    }
  }, [session?.session_id, user?.phone_number]);

  const startLocationTracking = useCallback(async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        console.log('Location permission denied');
        return;
      }

      if (locationIntervalRef.current) {
        clearInterval(locationIntervalRef.current);
      }

      locationIntervalRef.current = setInterval(async () => {
        try {
          const location = await Location.getCurrentPositionAsync({
            accuracy: Location.Accuracy.High,
          });
          
          const { latitude, longitude } = location.coords;
          
          await axios.post(`${API_BASE_URL}/ride-sessions/${session?.session_id}/location`, {
            lat: latitude,
            lng: longitude,
          });
          
          if (socketRef.current && socketConnected) {
            socketRef.current.emit('driver-location-update', {
              session_id: session?.session_id,
              latitude,
              longitude,
            });
          }
          
          console.log('📍 Location sent:', { latitude, longitude });
        } catch (error) {
          console.log('Error sending location:', error);
        }
      }, 5000);
    } catch (error) {
      console.log('Error starting location tracking:', error);
    }
  }, [session?.session_id, socketConnected]);

  const fetchSession = useCallback(async () => {
    try {
      console.log('Fetching session for ride:', rideId, 'driver:', user?.phone_number);
      
      const res = await axios.get(`${API_BASE_URL}/ride-sessions/driver/${rideId}`, {
        params: { driver_phone: user?.phone_number },
      });
      
      console.log('Session response:', res.data);
      setSession(res.data);
      
      if (res.data.riders) {
        const unrated = res.data.riders.filter(
          rider => (rider.status === 'dropped_off' || rider.status === 'completed') && !rider.driver_rating
        );
        setUnratedRiders(unrated);
        setAllRidersRated(unrated.length === 0);
      }
      
      if (res.data.completed_at) {
        const earnings = res.data.riders
          .filter(rider => rider.status === 'completed' || rider.status === 'dropped_off')
          .reduce((sum, rider) => sum + (rider.price_paid || 0), 0);
        setTotalEarnings(earnings);
        setRideCompleted(true);
      }
      
      if (res.data.current_phase !== 'boarding' && res.data.current_phase !== 'completed') {
        if (res.data.started_at && !res.data.completed_at) {
          const startTime = new Date(res.data.started_at).getTime();
          setSessionStartTime(startTime);
          
          if (timerRef.current) clearInterval(timerRef.current);
          timerRef.current = setInterval(() => {
            const now = new Date().getTime();
            const elapsed = Math.floor((now - startTime) / 1000);
            setElapsedTime(elapsed);
          }, 1000);
        }
      }
      
    } catch (error) {
      console.log('Driver session fetch error:', error?.response?.data || error.message);
      
      if (error?.response?.status === 404) {
        try {
          const liveRes = await axios.get(`${API_BASE_URL}/ride/${rideId}/live-session`);
          
          if (liveRes.data.success && liveRes.data.session) {
            console.log('Found live session:', liveRes.data.session);
            setSession({
              session_id: liveRes.data.session.session_id,
              status: 'driver_started',
              current_phase: 'boarding',
              ride_id: rideId,
              riders: [],
              boarded_count: 0,
              dropped_count: 0,
              total_riders: 0,
              qr_code_token: liveRes.data.session.qr_code_token || 'N/A',
              ride_origin: '',
              ride_destination: '',
              sos_active: false,
              emergency_stop_active: false,
              started_at: new Date().toISOString(),
            });
          } else {
            console.log('No live session found');
            setSession(null);
          }
        } catch (liveError) {
          console.log('No live session found yet:', liveError);
          setSession(null);
        }
      } else {
        setSession(null);
      }
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [rideId, user?.phone_number]);

  const loadPersonalEmergencyContacts = async () => {
    if (!user?.phone_number) return [];
    
    try {
      const res = await EmergencyContactService.getContacts(user.phone_number);
      const personalContactsList = res.user || [];
      setPersonalContacts(personalContactsList);
      return personalContactsList;
    } catch (error) {
      console.error("Error loading personal emergency contacts:", error);
      return [];
    }
  };

  useEffect(() => {
    fetchSession();
    const timer = setInterval(() => {
      fetchSession();
      if (session?.session_id && !rideCompleted) {
        fetchRidersWithQR();
      }
    }, 5000);
    return () => {
      clearInterval(timer);
      if (timerRef.current) clearInterval(timerRef.current);
      if (locationIntervalRef.current) clearInterval(locationIntervalRef.current);
      if (socketRef.current) socketRef.current.disconnect();
    };
  }, [fetchSession]);

  useEffect(() => {
    if (session && session.session_id && session.current_phase !== 'completed' && !session.completed_at) {
      startLocationTracking();
      connectSocket();
      fetchRidersWithQR();
    }
  }, [session, startLocationTracking, connectSocket]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchSession();
    fetchRidersWithQR();
  };

  const handleDropOff = async (bookingId) => {
    try {
      await axios.post(`${API_BASE_URL}/ride-sessions/${session.session_id}/rider-dropped-off`, {
        booking_id: bookingId,
        driver_phone: user?.phone_number,
      });
      fetchSession();
      fetchRidersWithQR();
      showCustomAlert('Success', 'Rider dropped off successfully', 'success');
    } catch (error) {
      showCustomAlert('Error', error?.response?.data?.detail || 'Could not drop off rider', 'error');
    }
  };

const handleCompleteRide = async () => {
  console.log('handleCompleteRide called');
  setShowCompleteConfirm(false);
  
  try {
    showCustomAlert('Processing', 'Completing ride...', 'info');
    
    // Use the force complete endpoint (but don't show "force" to user)
    const response = await axios.post(`${API_BASE_URL}/ride-sessions/${session.session_id}/complete-force`, {
      driver_phone: user?.phone_number,
    });
    
    console.log('Complete ride response:', response.data);
    
    const earnings = response.data.total_earnings || 
      session?.riders?.reduce((sum, rider) => sum + (rider.price_paid || 0), 0) || 0;
    
    setTotalEarnings(earnings);
    setRideCompleted(true);
    
    showCustomAlert('Ride Completed!', `Ride completed successfully! Total earnings: ₹${earnings}`, 'success');
    
    if (timerRef.current) {
      clearInterval(timerRef.current);
    }
    
    if (locationIntervalRef.current) {
      clearInterval(locationIntervalRef.current);
    }
    
    setShowCompletionSummary(true);
    
  } catch (error) {
    console.error('Complete ride error:', error);
    const errorMessage = error?.response?.data?.detail || 
                        error?.response?.data?.message || 
                        error?.message || 
                        'Could not complete ride';
    showCustomAlert('Error', errorMessage, 'error');
  }
};
  const navigateToDestination = (destination, riderName = null) => {
    if (destination) {
      const encodedDest = encodeURIComponent(destination);
      const url = Platform.select({
        ios: `maps://?q=${encodedDest}`,
        android: `https://www.google.com/maps/search/?api=1&query=${encodedDest}`,
      });
      
      Linking.canOpenURL(url).then(supported => {
        if (supported) {
          Linking.openURL(url);
        } else {
          Linking.openURL(`https://www.google.com/maps/search/?api=1&query=${encodedDest}`);
        }
      }).catch(() => {
        showCustomAlert('Error', 'Could not open maps', 'error');
      });
    } else {
      showCustomAlert('Info', 'Destination information not available', 'info');
    }
  };

  const sendWhatsAppMessage = async (phoneNumber, message) => {
    try {
      let formattedPhone = phoneNumber.replace(/[^0-9]/g, '');
      if (formattedPhone.length === 10) {
        formattedPhone = `91${formattedPhone}`;
      }
      
      const url = `whatsapp://send?phone=${formattedPhone}&text=${encodeURIComponent(message)}`;
      
      const supported = await Linking.canOpenURL(url);
      if (supported) {
        await Linking.openURL(url);
      } else {
        Linking.openURL(`sms:${phoneNumber}?body=${encodeURIComponent(message)}`);
      }
    } catch (error) {
      console.error('Error sending WhatsApp message:', error);
      Linking.openURL(`sms:${phoneNumber}?body=${encodeURIComponent(message)}`);
    }
  };

  const handleSOS = async () => {
    setLoadingContacts(true);
    setSosModalVisible(true);
    
    try {
      const contacts = await loadPersonalEmergencyContacts();
      if (contacts.length === 0) {
        showCustomAlert(
          'No Emergency Contacts',
          'Please add personal emergency contacts in your profile settings before using SOS.',
          'warning'
        );
        setSosModalVisible(false);
      }
    } catch (error) {
      console.error('Error loading contacts:', error);
    } finally {
      setLoadingContacts(false);
    }
  };

  const sendSOSMessage = async (contact) => {
    const sosMessage = `🚨 *EMERGENCY SOS ALERT* 🚨

I need immediate help!

📍 *Current Status:* Emergency during active ride
👤 *Driver:* ${user?.full_name || user?.phone_number || 'Unknown'}
🚗 *Ride ID:* ${rideId}
📍 *Origin:* ${session?.ride_origin || 'Unknown'}
🎯 *Destination:* ${session?.ride_destination || 'Unknown'}
⏰ *Time:* ${new Date().toLocaleString()}

Please contact me immediately!

⚠️ This is an automated emergency alert.`;
    
    await sendWhatsAppMessage(contact.contact_number, sosMessage);
  };

  const sendSOSToContact = async (contact) => {
    setSosSending(true);
    
    try {
      await axios.post(`${API_BASE_URL}/ride-sessions/${session.session_id}/sos`, {
        note: `SOS triggered by driver for contact: ${contact.contact_name} (${contact.contact_number})`,
        contact_notified: contact.contact_number
      });
      
      await sendSOSMessage(contact);
      
      showCustomAlert(
        'SOS Sent',
        `Emergency alert sent to ${contact.contact_name} via WhatsApp. Help is on the way.`,
        'success'
      );
      
      setSosModalVisible(false);
      
      setTimeout(() => {
        Alert.alert(
          'Call Contact?',
          `Would you like to call ${contact.contact_name} now?`,
          [
            { text: 'No', style: 'cancel' },
            { text: 'Call', onPress: () => Linking.openURL(`tel:${contact.contact_number}`) }
          ]
        );
      }, 1000);
      
    } catch (error) {
      console.error('Error sending SOS:', error);
      showCustomAlert(
        'SOS Failed',
        'Could not send SOS alert. Please try again or call emergency services directly.',
        'error'
      );
    } finally {
      setSosSending(false);
    }
  };

  const sendSOSToAll = async () => {
    setSosSending(true);
    
    try {
      const contacts = personalContacts;
      if (contacts.length === 0) return;
      
      let successCount = 0;
      
      for (const contact of contacts) {
        try {
          await axios.post(`${API_BASE_URL}/ride-sessions/${session.session_id}/sos`, {
            note: `SOS triggered by driver for contact: ${contact.contact_name} (${contact.contact_number})`,
            contact_notified: contact.contact_number
          });
          
          await sendSOSMessage(contact);
          successCount++;
        } catch (err) {
          console.error(`Failed to send SOS to ${contact.contact_name}:`, err);
        }
      }
      
      showCustomAlert(
        'SOS Sent',
        `Emergency alert sent to ${successCount} of ${contacts.length} contacts.`,
        successCount > 0 ? 'success' : 'error'
      );
      
      setSosModalVisible(false);
      
    } catch (error) {
      console.error('Error sending SOS to all:', error);
      showCustomAlert('SOS Failed', 'Could not send SOS alerts', 'error');
    } finally {
      setSosSending(false);
    }
  };

  const openRateModal = (rider) => {
    setSelectedRider(rider);
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
    
    try {
      await axios.post(`${API_BASE_URL}/ride-sessions/${session.session_id}/rate-rider`, {
        booking_id: selectedRider.booking_id,
        rating,
        feedback,
      });
      
      setRatingModalVisible(false);
      await fetchSession();
      await fetchRidersWithQR();
      
      const updatedSession = session;
      if (updatedSession?.riders) {
        const updatedRiders = updatedSession.riders.map(r => 
          r.booking_id === selectedRider.booking_id ? { ...r, driver_rating: rating } : r
        );
        const unrated = updatedRiders.filter(
          rider => (rider.status === 'completed' || rider.status === 'dropped_off') && !rider.driver_rating
        );
        setUnratedRiders(unrated);
        setAllRidersRated(unrated.length === 0);
      }
      
      showCustomAlert('Success', 'Thank you for rating this rider!', 'success');
    } catch (error) {
      showCustomAlert('Error', error?.response?.data?.detail || 'Could not submit rider rating', 'error');
    }
  };

  const copyQRToken = () => {
    if (session?.qr_code_token) {
      Clipboard.setString(session.qr_code_token);
      showCustomAlert('Copied', 'QR token copied to clipboard', 'success');
    }
  };

  const shareQRCode = async () => {
    if (!session?.qr_code_token) {
      showCustomAlert('Error', 'QR code not available', 'error');
      return;
    }

    try {
      await Share.share({
        message: `🚗 *Boarding QR Code for Ride #${rideId}* 🚗\n\nPlease show this code to the driver to board:\n\n*${session.qr_code_token}*\n\n⚠️ Keep this code private and only share with your driver.`,
        title: 'Share Boarding Code',
      });
    } catch (error) {
      console.error('Error sharing QR code:', error);
      showCustomAlert('Error', 'Could not share QR code', 'error');
    }
  };

  const callRider = (phoneNumber) => {
    Linking.openURL(`tel:${phoneNumber}`);
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

  const renderRiderAvatar = (rider) => {
    if (rider.rider_photo) {
      const imageUrl = buildImageUrl(rider.rider_photo);
      return (
        <Image 
          source={{ uri: imageUrl }} 
          style={styles.avatar} 
          resizeMode="cover"
        />
      );
    } else {
      return (
        <View style={[styles.avatar, styles.avatarFallback]}>
          <Text style={styles.avatarText}>
            {getInitials(rider.rider_name || 'Rider')}
          </Text>
        </View>
      );
    }
  };

  const handleBack = () => {
    navigation.goBack();
  };

  const handleGoToMyRides = () => {
    navigation.replace('MyRides', { 
      refresh: true, 
      tab: 'posted',
      forceReload: true
    });
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.centered} edges={['top']}>
        <StatusBar backgroundColor={Colors.white} barStyle="dark-content" />
        <ActivityIndicator size="large" color="#184080" />
        <Text style={styles.loadingText}>Loading ride session...</Text>
      </SafeAreaView>
    );
  }

  if (!session) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <StatusBar backgroundColor={Colors.white} barStyle="dark-content" />
        
        <View style={[styles.header, { paddingTop: insets.top > 0 ? insets.top : 12 }]}>
          <TouchableOpacity style={styles.modernBackButton} onPress={handleBack}>
            <MaterialIcons name="arrow-back-ios" size={28} color={Colors.secondary || "#184080"} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Ride Session</Text>
          <View style={styles.headerSpacer} />
        </View>
        
        <View style={styles.noSessionContainer}>
          <Ionicons name="car-sport-outline" size={80} color="#D1D5DB" />
          <Text style={styles.noSessionTitle}>No Active Session</Text>
          <Text style={styles.noSessionText}>
            The ride session hasn't been started yet.{'\n'}
            Please start the ride from the ride details screen.
          </Text>
          <TouchableOpacity 
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Text style={styles.backButtonText}>Go Back</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  const allRidersProcessed = session?.riders?.every(
    rider => rider.status === 'dropped_off' || rider.status === 'completed'
  );

  const boardingPhase = session?.current_phase === 'boarding';
  const enRoutePhase = session?.current_phase === 'en_route';
  const hasRiders = session?.riders && session.riders.length > 0;
  const isRideCompleted = rideCompleted || session?.completed_at;

  const progressCount = boardingPhase 
    ? `${session?.boarded_count || 0}/${session?.total_riders || 0}`
    : `${session?.dropped_count || 0}/${session?.total_riders || 0}`;

  const progressTitle = boardingPhase ? 'Riders Boarded' : 'Riders Dropped Off';
  
  const progressPercentage = session?.total_riders 
    ? ((boardingPhase ? session.boarded_count : session.dropped_count) / session.total_riders) * 100
    : 0;

  const showTimer = enRoutePhase && sessionStartTime && !isRideCompleted;
  const { date: departureDate, time: departureTime } = formatDateTime(session?.departure_time || session?.ride_departure_time);

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <StatusBar backgroundColor={Colors.white} barStyle="dark-content" />
      
      <View style={[styles.header]}>
        <TouchableOpacity style={styles.modernBackButton} onPress={handleBack}>
          <MaterialIcons name="arrow-back-ios" size={28} color={Colors.secondary || "#184080"} />
        </TouchableOpacity>
        
        <Text style={styles.headerTitle}>
          {isRideCompleted ? 'Ride Completed' : 'Ride in Progress'}
        </Text>
        
        {!isRideCompleted && (
          <TouchableOpacity 
            style={styles.infoButton}
            onPress={handleSOS}
          >
            <Ionicons name="shield-outline" size={26} color={Colors.secondary || "#184080"} />
          </TouchableOpacity>
        )}
      </View>

      {!isRideCompleted ? (
        <ScrollView
          style={{ flex: 1 }}
          contentContainerStyle={{ padding: 16, paddingBottom: 30 }}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
          showsVerticalScrollIndicator={false}
        >
          {showTimer && (
            <View style={styles.timerMapRow}>
              <View style={styles.timerCard}>
                <Ionicons name="time-outline" size={20} color="#184080" />
                <Text style={styles.timerLabel}>Elapsed Time</Text>
                <Text style={styles.timerValue}>{formatElapsedTime(elapsedTime)}</Text>
              </View>
              
              <TouchableOpacity style={styles.mapCard} onPress={() => navigateToDestination(session?.ride_destination)}>
                <Ionicons name="navigate-outline" size={20} color="#fff" />
                <Text style={styles.mapCardText}>Navigate to Destination</Text>
              </TouchableOpacity>
            </View>
          )}

          <View style={styles.rideInfoCard}>
            <View style={styles.rideInfoRow}>
              <View style={styles.rideInfoItem}>
                <Ionicons name="calendar-outline" size={16} color="#6B7280" />
                <Text style={styles.rideInfoLabel}>Departure</Text>
                <Text style={styles.rideInfoValue}>{departureDate}</Text>
                <Text style={styles.rideInfoSubValue}>{departureTime}</Text>
              </View>
              <View style={styles.rideInfoDivider} />
              <View style={styles.rideInfoItem}>
                <Ionicons name="people-outline" size={16} color="#6B7280" />
                <Text style={styles.rideInfoLabel}>Riders</Text>
                <Text style={styles.rideInfoValue}>{session?.boarded_count || 0}/{session?.total_riders || 0}</Text>
                <Text style={styles.rideInfoSubValue}>Boarded</Text>
              </View>
            </View>
          </View>

          <View style={styles.progressCard}>
            <Text style={styles.progressTitle}>{progressTitle}</Text>
            <Text style={styles.progressCount}>{progressCount}</Text>
            <View style={styles.progressBarBg}>
              <View
                style={[
                  styles.progressBarFill,
                  { width: `${progressPercentage}%` },
                ]}
              />
            </View>
          </View>

          {/* QR Code Section */}
          {boardingPhase && (
            <View style={styles.card}>
              <View style={styles.cardHeaderRow}>
                <Text style={styles.cardTitle}>Individual Boarding QR Codes</Text>
                <TouchableOpacity onPress={() => {
                  fetchRidersWithQR();
                  setShowRiderQRModal(true);
                }}>
                  <Ionicons name="qr-code-outline" size={24} color="#184080" />
                </TouchableOpacity>
              </View>
              <Text style={styles.cardSub}>Each rider has a unique QR code. Tap the QR icon to view all codes.</Text>
              
              <TouchableOpacity 
                style={styles.viewQRCodesBtn}
                onPress={() => {
                  fetchRidersWithQR();
                  setShowRiderQRModal(true);
                }}
              >
                <Ionicons name="qr-code" size={20} color="#fff" />
                <Text style={styles.viewQRCodesBtnText}>View Boarding QR Codes</Text>
              </TouchableOpacity>
              
              <View style={styles.boardingInstructionCard}>
                <Ionicons name="information-circle-outline" size={20} color="#184080" />
                <Text style={styles.boardingInstructionText}>
                  Show each rider their unique QR code. They must scan their own code to board.
                </Text>
              </View>
            </View>
          )}

          <View style={styles.card}>
            <Text style={styles.cardTitle}>
              {boardingPhase ? 'Riders to Pick Up' : 'Passengers On Board'}
            </Text>

            {!hasRiders ? (
              <View style={styles.noRidersContainer}>
                <Ionicons name="people-outline" size={48} color="#D1D5DB" />
                <Text style={styles.noRidersText}>No riders for this ride</Text>
              </View>
            ) : (
              session?.riders?.map((rider, index) => {
                const isBoarded = ['boarded', 'dropped_off', 'completed'].includes(rider.status);
                const isDropped = ['dropped_off', 'completed'].includes(rider.status);
                const isCompleted = rider.status === 'completed';
                const isRated = !!rider.driver_rating;
                
                let statusText = 'Pending';
                let statusColor = '#1D4ED8';
                let statusBg = '#EFF6FF';
                let statusIcon = 'time-outline';
                
                if (isCompleted) {
                  statusText = 'Completed';
                  statusColor = '#6B7280';
                  statusBg = '#F3F4F6';
                  statusIcon = 'checkmark-circle-outline';
                } else if (isDropped) {
                  statusText = 'Dropped Off';
                  statusColor = '#9333EA';
                  statusBg = '#F3E8FF';
                  statusIcon = 'flag-outline';
                } else if (isBoarded) {
                  statusText = 'On Board';
                  statusColor = '#16A34A';
                  statusBg = '#DCFCE7';
                  statusIcon = 'checkmark-circle-outline';
                }

                const navigateLocation = boardingPhase && !isBoarded 
                  ? rider.pickup_location 
                  : (!boardingPhase && !isDropped && !isCompleted ? rider.dropoff_location : null);

                const boardedAt = rider.boarded_at ? new Date(rider.boarded_at).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true }) : null;
                const droppedAt = rider.dropped_off_at ? new Date(rider.dropped_off_at).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true }) : null;

                return (
                  <View key={rider.id || rider.booking_id || index} style={styles.riderCard}>
                    <View style={styles.riderTop}>
                      <View style={styles.riderInfo}>
                        {renderRiderAvatar(rider)}
                        <View style={{ flex: 1 }}>
                          <Text style={styles.riderName}>{rider.rider_name || 'Rider'}</Text>
                          <Text style={styles.riderPhone}>{rider.rider_phone}</Text>
                          <Text style={styles.riderLocationLabel}>
                            {boardingPhase ? 'Pickup Location' : 'Drop-off Location'}
                          </Text>
                          <Text style={styles.riderLocation} numberOfLines={2}>
                            {boardingPhase ? rider.pickup_location : rider.dropoff_location}
                          </Text>
                          {boardedAt && !boardingPhase && (
                            <Text style={styles.timingText}>✓ Boarded at: {boardedAt}</Text>
                          )}
                          {droppedAt && (
                            <Text style={styles.timingText}>✓ Dropped at: {droppedAt}</Text>
                          )}
                          {isRated && (
                            <View style={styles.ratedBadge}>
                              <Ionicons name="star" size={12} color="#F59E0B" />
                              <Text style={styles.ratedBadgeText}>Rated {rider.driver_rating}/5</Text>
                            </View>
                          )}
                        </View>
                      </View>

                      <View style={[styles.statusPill, { backgroundColor: statusBg }]}>
                        <Ionicons name={statusIcon} size={12} color={statusColor} style={{ marginRight: 4 }} />
                        <Text style={[styles.statusPillText, { color: statusColor }]}>
                          {statusText}
                        </Text>
                      </View>
                    </View>

                    {!isCompleted && (
                      <View style={styles.riderActions}>
                        <TouchableOpacity 
                          style={[styles.callBtn, styles.flexButton]} 
                          onPress={() => callRider(rider.rider_phone)}
                        >
                          <Ionicons name="call-outline" size={18} color="#184080" />
                          <Text style={styles.callBtnText}>Call</Text>
                        </TouchableOpacity>

                        {navigateLocation && (
                          <TouchableOpacity 
                            style={[styles.navigateBtn, styles.flexButton]} 
                            onPress={() => navigateToDestination(navigateLocation, rider.rider_name)}
                          >
                            <Ionicons name="navigate-outline" size={18} color="#fff" />
                            <Text style={styles.navigateBtnText}>
                              {boardingPhase && !isBoarded ? 'Navigate' : 'Navigate'}
                            </Text>
                          </TouchableOpacity>
                        )}

                        {!boardingPhase && !isDropped && isBoarded && (
                          <TouchableOpacity 
                            style={[styles.dropBtn, styles.flexButton]} 
                            onPress={() => handleDropOff(rider.booking_id)}
                          >
                            <Ionicons name="flag-outline" size={18} color="#fff" />
                            <Text style={styles.dropBtnText}>Drop Off</Text>
                          </TouchableOpacity>
                        )}

                        {isDropped && !isCompleted && !isRated && (
                          <TouchableOpacity style={[styles.rateBtn, styles.flexButton]} onPress={() => openRateModal(rider)}>
                            <Ionicons name="star-outline" size={16} color="#D97706" />
                            <Text style={styles.rateBtnText}>Rate</Text>
                          </TouchableOpacity>
                        )}

                        {boardingPhase && !isBoarded && (
                          <View style={styles.pendingMessage}>
                            <Ionicons name="qr-code-outline" size={16} color="#F59E0B" />
                            <Text style={styles.pendingMessageText}>Waiting for scan</Text>
                          </View>
                        )}
                      </View>
                    )}
                  </View>
                );
              })
            )}
          </View>

          <View style={styles.card}>
            <Text style={styles.cardTitle}>Trip Information</Text>
            <View style={styles.tripInfoRow}>
              <View style={styles.tripInfoItem}>
                <Ionicons name="location-outline" size={18} color="#184080" />
                <Text style={styles.tripInfoLabel}>From</Text>
                <Text style={styles.tripInfoValue}>{session?.ride_origin?.split(',')[0] || 'Pickup'}</Text>
                {session?.ride_origin && (
                  <TouchableOpacity 
                    style={styles.smallNavigateBtn} 
                    onPress={() => navigateToDestination(session?.ride_origin)}
                  >
                    <Ionicons name="navigate-outline" size={14} color="#184080" />
                    <Text style={styles.smallNavigateText}>Navigate</Text>
                  </TouchableOpacity>
                )}
              </View>
              <View style={styles.tripInfoItem}>
                <Ionicons name="flag-outline" size={18} color="#184080" />
                <Text style={styles.tripInfoLabel}>To</Text>
                <Text style={styles.tripInfoValue}>{session?.ride_destination?.split(',')[0] || 'Destination'}</Text>
                {session?.ride_destination && (
                  <TouchableOpacity 
                    style={styles.smallNavigateBtn} 
                    onPress={() => navigateToDestination(session?.ride_destination)}
                  >
                    <Ionicons name="navigate-outline" size={14} color="#184080" />
                    <Text style={styles.smallNavigateText}>Navigate</Text>
                  </TouchableOpacity>
                )}
              </View>
            </View>
          </View>

{/* COMPLETE RIDE BUTTON - Simple and clean */}
{!isRideCompleted && session?.total_riders > 0 && (
  <TouchableOpacity
    style={styles.completeRideBtn}
    onPress={() => {
      Alert.alert(
        'Complete Ride',
        'Are you sure you want to complete this ride?',
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Complete', onPress: handleCompleteRide }
        ]
      );
    }}
  >
    <Ionicons name="checkmark-done-outline" size={20} color="#fff" />
    <Text style={styles.completeRideText}>Complete Ride</Text>
  </TouchableOpacity>
)}
        </ScrollView>
      ) : (
        <ScrollView
          style={{ flex: 1 }}
          contentContainerStyle={{ padding: 16, paddingBottom: 30 }}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.completedHeaderCard}>
            <Ionicons name="checkmark-circle" size={60} color="#10B981" />
            <Text style={styles.completedTitle}>Ride Completed!</Text>
            <Text style={styles.completedSubtitle}>
              Great job! This ride has been successfully completed.
            </Text>
          </View>

          <View style={styles.earningsCard}>
            <Text style={styles.earningsCardLabel}>Total Earnings</Text>
            <Text style={styles.earningsCardAmount}>₹{totalEarnings}</Text>
            <View style={styles.earningsDivider} />
            <View style={styles.earningsBreakdownCard}>
              <Text style={styles.earningsBreakdownTitle}>Breakdown</Text>
              {session?.riders?.filter(r => r.status === 'completed' || r.status === 'dropped_off').map((rider, index) => (
                <View key={index} style={styles.earningsRow}>
                  <Text style={styles.earningsRowName}>{rider.rider_name || 'Rider'}</Text>
                  <Text style={styles.earningsRowAmount}>₹{rider.price_paid || 0}</Text>
                </View>
              ))}
            </View>
          </View>

          <View style={styles.ratingCard}>
            <Text style={styles.ratingCardTitle}>Rate Your Riders</Text>
            <Text style={styles.ratingCardSubtitle}>
              {allRidersRated 
                ? "✓ All riders have been rated! Thank you for your feedback." 
                : `${unratedRiders.length} rider(s) remaining to rate`}
            </Text>
            
            {unratedRiders.length > 0 && (
              <View style={styles.unratedRidersContainer}>
                {unratedRiders.map((rider) => (
                  <View key={rider.booking_id} style={styles.completionRiderItem}>
                    <View style={styles.completionRiderInfo}>
                      {renderRiderAvatar(rider)}
                      <View>
                        <Text style={styles.completionRiderName}>{rider.rider_name || 'Rider'}</Text>
                        <Text style={styles.completionRiderDetails}>
                          {rider.seats_booked || 1} seat(s) • ₹{rider.price_paid || 0}
                        </Text>
                      </View>
                    </View>
                    <TouchableOpacity 
                      style={styles.completionRateButton}
                      onPress={() => openRateModal(rider)}>
                      <Text style={styles.completionRateButtonText}>Rate Now</Text>
                    </TouchableOpacity>
                  </View>
                ))}
              </View>
            )}
          </View>

          <View style={styles.completionActionButtons}>
            {!allRidersRated && (
              <TouchableOpacity 
                style={styles.laterButton}
                onPress={handleGoToMyRides}>
                <Text style={styles.laterButtonText}>Rate Later</Text>
              </TouchableOpacity>
            )}
            <TouchableOpacity 
              style={[styles.viewRidesButton, allRidersRated && styles.viewRidesButtonFull]}
              onPress={handleGoToMyRides}>
              <Ionicons name="car-sport-outline" size={20} color="#fff" />
              <Text style={styles.viewRidesButtonText}>View My Rides</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      )}

      <RiderQRListModal
        visible={showRiderQRModal}
        onClose={() => setShowRiderQRModal(false)}
        riders={ridersWithQR}
        sessionId={session?.session_id}
        onRefresh={fetchRidersWithQR}
        driverPhone={user?.phone_number}
      />

      <Modal visible={sosModalVisible} animationType="slide" transparent>
        <View style={styles.sosModalBackdrop}>
          <View style={[styles.sosModalCard, { paddingBottom: insets.bottom > 0 ? insets.bottom : 20 }]}>
            <View style={styles.sosModalHeader}>
              <Text style={styles.sosModalTitle}>Emergency SOS</Text>
              <TouchableOpacity onPress={() => setSosModalVisible(false)}>
                <Ionicons name="close" size={24} color="#6B7280" />
              </TouchableOpacity>
            </View>
            
            <Text style={styles.sosModalSubtitle}>
              Select who to notify in this emergency (WhatsApp message will be sent)
            </Text>
            
            {loadingContacts ? (
              <View style={styles.sosLoadingContainer}>
                <ActivityIndicator size="large" color="#E11D48" />
                <Text style={styles.sosLoadingText}>Loading contacts...</Text>
              </View>
            ) : personalContacts.length === 0 ? (
              <View style={styles.sosEmptyContainer}>
                <Ionicons name="call-outline" size={60} color="#D1D5DB" />
                <Text style={styles.sosEmptyText}>No personal emergency contacts found</Text>
                <Text style={styles.sosEmptySubtext}>
                  Please add personal emergency contacts in your profile settings
                </Text>
                <TouchableOpacity 
                  style={styles.sosAddContactBtn}
                  onPress={() => {
                    setSosModalVisible(false);
                    navigation.navigate('EmergencyContactsScreen');
                  }}
                >
                  <Text style={styles.sosAddContactBtnText}>Add Contacts</Text>
                </TouchableOpacity>
              </View>
            ) : (
              <>
                <FlatList
                  data={personalContacts}
                  keyExtractor={(item) => item.id?.toString() || item.contact_number}
                  renderItem={({ item }) => (
                    <TouchableOpacity 
                      style={styles.sosContactCard}
                      onPress={() => {
                        Alert.alert(
                          'Send SOS via WhatsApp',
                          `Send emergency alert to ${item.contact_name}?`,
                          [
                            { text: 'Cancel', style: 'cancel' },
                            { 
                              text: 'Send SOS via WhatsApp', 
                              onPress: () => sendSOSToContact(item),
                              style: 'destructive'
                            }
                          ]
                        );
                      }}
                    >
                      <View style={styles.sosContactAvatar}>
                        <Text style={styles.sosContactAvatarText}>
                          {item.contact_name?.charAt(0).toUpperCase() || '?'}
                        </Text>
                      </View>
                      <View style={styles.sosContactInfo}>
                        <Text style={styles.sosContactName}>{item.contact_name}</Text>
                        <Text style={styles.sosContactPhone}>{item.contact_number}</Text>
                        <View style={styles.whatsappBadge}>
                          <Ionicons name="logo-whatsapp" size={12} color="#25D366" />
                          <Text style={styles.whatsappBadgeText}>WhatsApp</Text>
                        </View>
                      </View>
                      <Ionicons name="logo-whatsapp" size={32} color="#25D366" />
                    </TouchableOpacity>
                  )}
                  contentContainerStyle={styles.sosContactList}
                  showsVerticalScrollIndicator={false}
                />
                
                {personalContacts.length > 1 && (
                  <TouchableOpacity 
                    style={styles.sosAllButton}
                    onPress={sendSOSToAll}
                    disabled={sosSending}
                  >
                    {sosSending ? (
                      <ActivityIndicator size="small" color="#fff" />
                    ) : (
                      <>
                        <Ionicons name="notifications" size={20} color="#fff" />
                        <Text style={styles.sosAllButtonText}>Notify All Contacts</Text>
                      </>
                    )}
                  </TouchableOpacity>
                )}
              </>
            )}
          </View>
        </View>
      </Modal>
<Modal visible={showCompleteConfirm} transparent animationType="fade">
  <View style={styles.modalBackdrop}>
    <View style={styles.modalCard}>
      <Ionicons name="checkmark-circle-outline" size={48} color="#10B981" />
      <Text style={styles.modalTitle}>Complete Ride?</Text>
      <Text style={styles.modalSub}>
        Are you sure you want to complete this ride?
      </Text>
      <View style={styles.modalActions}>
        <TouchableOpacity style={styles.cancelBtn} onPress={() => setShowCompleteConfirm(false)}>
          <Text style={styles.cancelBtnText}>Cancel</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.confirmBtn} onPress={handleCompleteRide}>
          <Text style={styles.confirmBtnText}>Complete</Text>
        </TouchableOpacity>
      </View>
    </View>
  </View>
</Modal>

      <Modal visible={ratingModalVisible} transparent animationType="fade">
        <View style={styles.modalBackdrop}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>Rate Your Rider</Text>
            <Text style={styles.modalSub}>
              How was your ride with {selectedRider?.rider_name || 'this rider'}?
            </Text>

            {renderStars()}

            <TextInput
              value={feedback}
              onChangeText={setFeedback}
              placeholder="Share your feedback (optional)"
              multiline
              style={styles.feedbackInput}
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
                <Text style={styles.submitBtnText}>Submit</Text>
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
  container: { 
    flex: 1, 
    backgroundColor: Colors.white || '#F4F7FB' 
  },
  centered: { 
    flex: 1, 
    justifyContent: 'center', 
    alignItems: 'center', 
    backgroundColor: Colors.white || '#fff' 
  },
  loadingText: { 
    marginTop: 12, 
    fontSize: 14, 
    color: '#6B7280' 
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingBottom: 12,
    paddingTop: 8,
    borderBottomWidth: 0.5,
    borderBottomColor: '#F3F4F6',
    backgroundColor: Colors.white || '#fff',
  },
  modernBackButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: Colors.primary || '#184080',
    flex: 1,
    textAlign: 'center',
  },
  infoButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerSpacer: {
    width: 44,
  },
  rideInfoCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: '#E7ECF4',
  },
  rideInfoRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  rideInfoItem: {
    flex: 1,
    alignItems: 'center',
  },
  rideInfoLabel: {
    fontSize: 11,
    color: '#6B7280',
    marginTop: 4,
  },
  rideInfoValue: {
    fontSize: 16,
    fontWeight: '700',
    color: '#184080',
    marginTop: 2,
  },
  rideInfoSubValue: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 2,
  },
  rideInfoDivider: {
    width: 1,
    height: 40,
    backgroundColor: '#E5E7EB',
  },
  timerMapRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 14,
  },
  timerCard: {
    flex: 1,
    backgroundColor: '#F0F7FF',
    borderRadius: 16,
    padding: 14,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E0ECFF',
  },
  timerLabel: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 4,
  },
  timerValue: {
    fontSize: 18,
    fontWeight: '700',
    color: '#184080',
    marginTop: 2,
  },
  mapCard: {
    flex: 1,
    backgroundColor: '#184080',
    borderRadius: 16,
    padding: 14,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 8,
  },
  mapCardText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#fff',
  },
  progressCard: {
    backgroundColor: '#2E5AAC',
    borderRadius: 18,
    padding: 16,
    marginBottom: 14,
  },
  progressTitle: { 
    color: '#DCE8FF', 
    fontSize: 13, 
    marginBottom: 4 
  },
  progressCount: { 
    color: '#fff', 
    fontSize: 18, 
    fontWeight: '700', 
    marginBottom: 12 
  },
  progressBarBg: { 
    height: 10, 
    borderRadius: 10, 
    backgroundColor: 'rgba(255,255,255,0.2)' 
  },
  progressBarFill: { 
    height: 10, 
    borderRadius: 10, 
    backgroundColor: '#FF8A00' 
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 18,
    padding: 16,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: '#E7ECF4',
  },
  cardHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  cardTitle: { 
    color: '#1C2746', 
    fontSize: 16, 
    fontWeight: '700' 
  },
  cardSub: { 
    color: '#7A8599', 
    fontSize: 13, 
    marginTop: 4, 
    marginBottom: 12 
  },
  viewQRCodesBtn: {
    backgroundColor: '#10B981',
    borderRadius: 14,
    paddingVertical: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginBottom: 12,
  },
  viewQRCodesBtnText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '600',
  },
  boardingInstructionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#EFF6FF',
    borderRadius: 12,
    padding: 12,
    marginTop: 8,
    gap: 10,
  },
  boardingInstructionText: {
    flex: 1,
    fontSize: 12,
    color: '#184080',
    lineHeight: 18,
  },
  riderCard: { 
    borderWidth: 1, 
    borderColor: '#E5E7EB', 
    borderRadius: 16, 
    padding: 14, 
    marginTop: 12,
  },
  riderTop: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'flex-start', 
    gap: 10,
  },
  riderInfo: { 
    flexDirection: 'row', 
    flex: 1 
  },
  avatar: { 
    width: 52, 
    height: 52, 
    borderRadius: 26, 
    marginRight: 12 
  },
  avatarFallback: { 
    backgroundColor: '#E8EEF9', 
    justifyContent: 'center', 
    alignItems: 'center' 
  },
  avatarText: { 
    color: '#184080', 
    fontWeight: '700', 
    fontSize: 18 
  },
  riderName: { 
    color: '#132238', 
    fontSize: 15, 
    fontWeight: '700' 
  },
  riderPhone: { 
    color: '#667085', 
    fontSize: 13, 
    marginTop: 2 
  },
  riderLocationLabel: { 
    color: '#667085', 
    fontSize: 11, 
    marginTop: 8 
  },
  riderLocation: { 
    color: '#111827', 
    fontSize: 13, 
    fontWeight: '500', 
    marginTop: 2 
  },
  timingText: {
    fontSize: 11,
    color: '#10B981',
    marginTop: 4,
  },
  ratedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
    gap: 4,
  },
  ratedBadgeText: {
    fontSize: 10,
    color: '#F59E0B',
    fontWeight: '500',
  },
  statusPill: { 
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10, 
    paddingVertical: 6, 
    borderRadius: 999 
  },
  statusPillText: { 
    fontSize: 12, 
    fontWeight: '700' 
  },
  riderActions: {
    flexDirection: 'row',
    marginTop: 14,
    gap: 10,
    flexWrap: 'wrap',
    alignItems: 'center',
  },
  flexButton: {
    flex: 1,
    minWidth: 100,
  },
  callBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#184080',
    backgroundColor: '#fff',
  },
  callBtnText: { 
    color: '#184080', 
    fontWeight: '600', 
    fontSize: 13 
  },
  navigateBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 10,
    backgroundColor: '#10B981',
  },
  navigateBtnText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 13,
  },
  dropBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: '#7C3AED',
    borderRadius: 10,
    paddingVertical: 10,
  },
  dropBtnText: { 
    color: '#fff', 
    fontWeight: '700', 
    fontSize: 13 
  },
  rateBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    borderWidth: 1,
    borderColor: '#F59E0B',
    borderRadius: 10,
    paddingVertical: 10,
    paddingHorizontal: 14,
  },
  rateBtnText: { 
    color: '#D97706', 
    fontWeight: '700', 
    fontSize: 13 
  },
  pendingMessage: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 10,
    paddingHorizontal: 12,
    backgroundColor: '#FEF3C7',
    borderRadius: 10,
  },
  pendingMessageText: {
    fontSize: 12,
    color: '#D97706',
    fontWeight: '500',
  },
  tripInfoRow: {
    flexDirection: 'row',
    marginTop: 12,
    gap: 16,
  },
  tripInfoItem: {
    flex: 1,
    alignItems: 'center',
    padding: 12,
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    position: 'relative',
  },
  tripInfoLabel: { 
    fontSize: 12, 
    color: '#6B7280', 
    marginTop: 4 
  },
  tripInfoValue: { 
    fontSize: 14, 
    fontWeight: '600', 
    color: '#111827', 
    marginTop: 2, 
    textAlign: 'center' 
  },
  smallNavigateBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 8,
    paddingHorizontal: 8,
    paddingVertical: 4,
    backgroundColor: '#E8EEF9',
    borderRadius: 12,
  },
  smallNavigateText: {
    fontSize: 10,
    color: '#184080',
    fontWeight: '500',
  },
  completeRideBtn: {
    backgroundColor: '#10B981',
    borderRadius: 16,
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 8,
    marginBottom: 12,
    marginTop: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  completeRideText: { 
    color: '#fff', 
    fontWeight: '700', 
    fontSize: 16 
  },
  completedHeaderCard: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 24,
    alignItems: 'center',
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  completedTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#10B981',
    marginTop: 12,
  },
  completedSubtitle: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
    marginTop: 8,
  },
  earningsCard: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 20,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  earningsCardLabel: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
  },
  earningsCardAmount: {
    fontSize: 36,
    fontWeight: '800',
    color: '#184080',
    textAlign: 'center',
    marginTop: 8,
  },
  earningsDivider: {
    height: 1,
    backgroundColor: '#E5E7EB',
    marginVertical: 16,
  },
  earningsBreakdownCard: {
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    padding: 12,
  },
  earningsBreakdownTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 12,
  },
  earningsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 6,
  },
  earningsRowName: {
    fontSize: 13,
    color: '#6B7280',
  },
  earningsRowAmount: {
    fontSize: 13,
    fontWeight: '600',
    color: '#184080',
  },
  ratingCard: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 20,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  ratingCardTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 4,
  },
  ratingCardSubtitle: {
    fontSize: 13,
    color: '#6B7280',
    marginBottom: 16,
  },
  unratedRidersContainer: {
    marginTop: 8,
  },
  completionRiderItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  completionRiderInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  completionRiderName: {
    fontSize: 15,
    fontWeight: '600',
    color: '#111827',
  },
  completionRiderDetails: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 2,
  },
  completionRateButton: {
    backgroundColor: '#184080',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  completionRateButtonText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  completionActionButtons: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 20,
  },
  laterButton: {
    flex: 1,
    backgroundColor: '#F3F4F6',
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: 'center',
  },
  laterButtonText: {
    color: '#6B7280',
    fontSize: 15,
    fontWeight: '600',
  },
  viewRidesButton: {
    flex: 1,
    backgroundColor: '#184080',
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 8,
  },
  viewRidesButtonFull: {
    flex: 1,
  },
  viewRidesButtonText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '700',
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
    alignItems: 'center' 
  },
  modalTitle: { 
    fontSize: 22, 
    fontWeight: '700', 
    color: '#111827', 
    textAlign: 'center', 
    marginTop: 12 
  },
  modalSub: { 
    fontSize: 14, 
    color: '#6B7280', 
    textAlign: 'center', 
    marginTop: 8, 
    marginBottom: 18 
  },
  starsRow: { 
    flexDirection: 'row', 
    justifyContent: 'center', 
    marginBottom: 18 
  },
  feedbackInput: {
    minHeight: 110,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 16,
    padding: 14,
    textAlignVertical: 'top',
    color: '#111827',
    width: '100%',
  },
  modalActions: { 
    flexDirection: 'row', 
    gap: 10, 
    marginTop: 18, 
    width: '100%' 
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
    fontWeight: '600' 
  },
  submitBtn: {
    flex: 1,
    backgroundColor: '#184080',
    borderRadius: 999,
    paddingVertical: 14,
    alignItems: 'center',
  },
  submitBtnText: { 
    color: '#fff', 
    fontWeight: '700' 
  },
  cancelBtn: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 999,
    paddingVertical: 14,
    alignItems: 'center',
  },
  cancelBtnText: { 
    color: '#6B7280', 
    fontWeight: '600' 
  },
  confirmBtn: {
    flex: 1,
    backgroundColor: '#10B981',
    borderRadius: 999,
    paddingVertical: 14,
    alignItems: 'center',
  },
  confirmBtnText: { 
    color: '#fff', 
    fontWeight: '700' 
  },
  noSessionContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 30,
  },
  noSessionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#111827',
    marginTop: 20,
    marginBottom: 8,
  },
  noSessionText: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
    marginBottom: 30,
    lineHeight: 20,
  },
  backButton: {
    backgroundColor: '#184080',
    paddingHorizontal: 30,
    paddingVertical: 12,
    borderRadius: 12,
  },
  backButtonText: { 
    color: '#fff', 
    fontWeight: '600', 
    fontSize: 16 
  },
  noRidersContainer: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  noRidersText: {
    fontSize: 14,
    color: '#9CA3AF',
    marginTop: 12,
  },
  sosModalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  sosModalCard: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 20,
    maxHeight: '80%',
  },
  sosModalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  sosModalTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#E11D48',
  },
  sosModalSubtitle: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 20,
  },
  sosContactList: {
    paddingBottom: 16,
  },
  sosContactCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEF2F2',
    borderRadius: 16,
    padding: 14,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#FEE2E2',
  },
  sosContactAvatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#E11D48',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  sosContactAvatarText: {
    color: '#fff',
    fontSize: 20,
    fontWeight: '700',
  },
  sosContactInfo: {
    flex: 1,
  },
  sosContactName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
  },
  sosContactPhone: {
    fontSize: 13,
    color: '#6B7280',
    marginTop: 2,
  },
  whatsappBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 4,
  },
  whatsappBadgeText: {
    fontSize: 11,
    color: '#25D366',
    fontWeight: '500',
  },
  sosAllButton: {
    backgroundColor: '#E11D48',
    borderRadius: 14,
    paddingVertical: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginTop: 8,
  },
  sosAllButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  sosLoadingContainer: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  sosLoadingText: {
    marginTop: 12,
    color: '#6B7280',
  },
  sosEmptyContainer: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  sosEmptyText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginTop: 16,
  },
  sosEmptySubtext: {
    fontSize: 13,
    color: '#6B7280',
    textAlign: 'center',
    marginTop: 8,
    marginBottom: 20,
  },
  sosAddContactBtn: {
    backgroundColor: '#184080',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 12,
  },
  sosAddContactBtnText: {
    color: '#fff',
    fontWeight: '600',
  },
  riderQRModalContainer: {
    flex: 1,
    backgroundColor: '#fff',
  },
  riderQRModalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: Platform.OS === 'ios' ? 50 : 20,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  riderQRModalTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#111827',
  },
  riderQRModalClose: {
    padding: 8,
  },
  riderQRModalScroll: {
    flex: 1,
    padding: 16,
  },
  riderQRModalSubtitle: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 20,
    textAlign: 'center',
  },
  riderQRCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    marginBottom: 16,
    overflow: 'hidden',
  },
  riderQRHeader: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  riderQRInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  riderQRAvatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
  },
  riderQRAvatarFallback: {
    backgroundColor: '#E8EEF9',
    alignItems: 'center',
    justifyContent: 'center',
  },
  riderQRAvatarText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#184080',
  },
  riderQRName: {
    fontSize: 16,
    fontWeight: '700',
    color: '#111827',
  },
  riderQRSeats: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 2,
  },
  riderQRStatusBadge: {
    marginTop: 4,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
    alignSelf: 'flex-start',
  },
  riderQRStatusPending: {
    backgroundColor: '#FEF3C7',
  },
  riderQRStatusBoarded: {
    backgroundColor: '#DCFCE7',
  },
  riderQRStatusText: {
    fontSize: 10,
    fontWeight: '600',
    color: '#92400E',
  },
  riderQRCodeContainer: {
    padding: 20,
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
  },
  riderQRCodeBox: {
    padding: 16,
    backgroundColor: '#fff',
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  riderQRToken: {
    marginTop: 12,
    fontSize: 14,
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
    color: '#6B7280',
    textAlign: 'center',
  },
  riderQRExpiry: {
    fontSize: 11,
    color: '#EF4444',
    marginTop: 4,
  },
  riderQRActions: {
    flexDirection: 'row',
    marginTop: 16,
    gap: 12,
  },
  riderQRActionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: '#E8EEF9',
    borderRadius: 20,
  },
  riderQRActionDisabled: {
    opacity: 0.5,
  },
  riderQRActionText: {
    fontSize: 13,
    color: '#184080',
    fontWeight: '500',
  },
  riderBoardedMessage: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    padding: 16,
    backgroundColor: '#DCFCE7',
  },
  riderBoardedText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#166534',
  },
  riderQRNoRiders: {
    alignItems: 'center',
    paddingVertical: 60,
  },
  riderQRNoRidersText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
    marginTop: 16,
  },
  riderQRNoRidersSub: {
    fontSize: 14,
    color: '#6B7280',
    marginTop: 8,
    textAlign: 'center',
  },
  completeRideBtn: {
  backgroundColor: '#10B981',
  borderRadius: 16,
  paddingVertical: 16,
  alignItems: 'center',
  justifyContent: 'center',
  flexDirection: 'row',
  gap: 8,
  marginBottom: 12,
  marginTop: 8,
  shadowColor: '#000',
  shadowOffset: { width: 0, height: 2 },
  shadowOpacity: 0.1,
  shadowRadius: 4,
  elevation: 3,
},
completeRideText: { 
  color: '#fff', 
  fontWeight: '700', 
  fontSize: 16 
},
});