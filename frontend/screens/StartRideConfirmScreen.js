// // import React, { useState, useEffect } from 'react';
// // import {
// //   View,
// //   Text,
// //   StyleSheet,
// //   TouchableOpacity,
// //   SafeAreaView,
// //   StatusBar,
// //   ScrollView,
// //   Alert,
// //   ActivityIndicator,
// //   Platform,
// // } from 'react-native';
// // import { useSafeAreaInsets } from 'react-native-safe-area-context';
// // import Ionicons from '@expo/vector-icons/Ionicons';
// // import { MaterialIcons } from '@expo/vector-icons';
// // import axios from 'axios';
// // import { API_BASE_URL } from '../config/config_ip';
// // import { useAuth } from '../context/AuthContext';
// // import { Colors, Typography } from '../constants/Colors';

// // export default function StartRideConfirmScreen({ route, navigation }) {
// //   const { rideId, ride } = route.params || {};
// //   const { user } = useAuth();
// //   const insets = useSafeAreaInsets();
// //   const [loading, setLoading] = useState(false);
// //   const [rideDetails, setRideDetails] = useState(ride || null);
// //   const [passengers, setPassengers] = useState([]);

// //   useEffect(() => {
// //     fetchRideDetails();
// //   }, []);

// //   const fetchRideDetails = async () => {
// //     try {
// //       const res = await axios.get(`${API_BASE_URL}/ride/${rideId}/passengers`);
// //       setRideDetails(res.data);
// //       setPassengers(res.data.passengers || []);
// //     } catch (error) {
// //       console.error('Error fetching ride details:', error);
// //     }
// //   };

// //   const handleStartRide = async () => {
// //     if (passengers.length === 0) {
// //       Alert.alert(
// //         'No Passengers',
// //         'This ride has no confirmed passengers. Do you still want to start?',
// //         [
// //           { text: 'Cancel', style: 'cancel' },
// //           { text: 'Start Ride', onPress: confirmStartRide },
// //         ]
// //       );
// //       return;
// //     }

// //     confirmStartRide();
// //   };

// //   const confirmStartRide = async () => {
// //     setLoading(true);
// //     try {
// //       const response = await axios.post(`${API_BASE_URL}/ride/${rideId}/start`);
      
// //       if (response.data.session_id) {
// //         navigation.replace('OngoingRideDriverScreen', {
// //           rideId: rideId,
// //           sessionId: response.data.session_id,
// //         });
// //       } else {
// //         Alert.alert('Success', 'Ride started successfully!');
// //         navigation.navigate('DriverHomeScreen');
// //       }
// //     } catch (error) {
// //       let errorMessage = 'Could not start the ride. Please try again.';
      
// //       if (error.response?.data?.detail) {
// //         errorMessage = error.response.data.detail;
// //       }
      
// //       Alert.alert('Cannot Start Ride', errorMessage);
// //     } finally {
// //       setLoading(false);
// //     }
// //   };

// //   const formatDateTime = (dateTimeStr) => {
// //     if (!dateTimeStr) return { date: 'N/A', time: 'N/A' };
// //     const date = new Date(dateTimeStr);
// //     return {
// //       date: date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' }),
// //       time: date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true }),
// //     };
// //   };

// //   const { date, time } = formatDateTime(rideDetails?.departure_time);

// //   if (!rideDetails) {
// //     return (
// //       <SafeAreaView style={styles.container} edges={['top']}>
// //         <StatusBar barStyle="dark-content" backgroundColor={Colors.white} />
// //         <View style={styles.loadingContainer}>
// //           <ActivityIndicator size="large" color={Colors.primary} />
// //           <Text style={styles.loadingText}>Loading ride details...</Text>
// //         </View>
// //       </SafeAreaView>
// //     );
// //   }

// //   return (
// //     <SafeAreaView style={styles.container} edges={['top']}>
// //       <StatusBar barStyle="dark-content" backgroundColor={Colors.white} />
      
// //       {/* Header - Same style as OngoingRideDriverScreen */}
// //       <View style={[styles.header, { paddingTop: insets.top > 0 ? insets.top : 12 }]}>
// //         <TouchableOpacity style={styles.modernBackButton} onPress={() => navigation.goBack()}>
// //           <MaterialIcons name="arrow-back-ios" size={28} color={Colors.secondary || Colors.primary} />
// //         </TouchableOpacity>
        
// //         <Text style={styles.headerTitle}>Start Your Ride</Text>
        
// //         <TouchableOpacity 
// //           style={styles.infoButton}
// //           onPress={() => {
// //             Alert.alert(
// //               "Start Ride",
// //               "Once you start the ride, you'll be able to mark passengers as boarded and track the journey."
// //             );
// //           }}
// //         >
// //           <Ionicons name="information-circle-outline" size={26} color={Colors.secondary || Colors.primary} />
// //         </TouchableOpacity>
// //       </View>

// //       <ScrollView 
// //         contentContainerStyle={[styles.content, { paddingBottom: insets.bottom > 0 ? insets.bottom + 80 : 100 }]}
// //         showsVerticalScrollIndicator={false}
// //       >
// //         {/* Route Details */}
// //         <View style={styles.card}>
// //           <Text style={styles.cardTitle}>Route Details</Text>
          
// //           <View style={styles.routeItem}>
// //             <View style={styles.routeDotContainer}>
// //               <View style={[styles.routeDot, { backgroundColor: '#10B981' }]} />
// //               <View style={styles.routeLine} />
// //               <View style={[styles.routeDot, { backgroundColor: '#EF4444' }]} />
// //             </View>
// //             <View style={styles.routeTextContainer}>
// //               <Text style={styles.routeLocation}>{rideDetails.origin?.split(',')[0] || 'Pickup Location'}</Text>
// //               <Text style={styles.routeLocation}>{rideDetails.destination?.split(',')[0] || 'Drop-off Location'}</Text>
// //             </View>
// //           </View>

// //           <View style={styles.infoRow}>
// //             <Ionicons name="calendar-outline" size={18} color="#6B7280" />
// //             <Text style={styles.infoText}>{date}</Text>
// //             <Ionicons name="time-outline" size={18} color="#6B7280" style={{ marginLeft: 16 }} />
// //             <Text style={styles.infoText}>{time}</Text>
// //           </View>
// //         </View>

// //         {/* Ride Information */}
// //         <View style={styles.card}>
// //           <Text style={styles.cardTitle}>Ride Information</Text>
          
// //           <View style={styles.infoGrid}>
// //             <View style={styles.infoGridItem}>
// //               <Ionicons name="people-outline" size={20} color={Colors.primary} />
// //               <Text style={styles.infoGridLabel}>Passengers</Text>
// //               <Text style={styles.infoGridValue}>
// //                 {passengers.length} / {rideDetails.available_seats || 0}
// //               </Text>
// //             </View>
// //             <View style={styles.infoGridItem}>
// //               <Ionicons name="car-outline" size={20} color={Colors.primary} />
// //               <Text style={styles.infoGridLabel}>Duration</Text>
// //               <Text style={styles.infoGridValue}>{rideDetails.duration_text || 'N/A'}</Text>
// //             </View>
// //           </View>
// //         </View>

// //         {/* Passengers List */}
// //         {passengers.length > 0 && (
// //           <View style={styles.card}>
// //             <Text style={styles.cardTitle}>Passengers to Pick Up</Text>
// //             {passengers.map((passenger, index) => (
// //               <View key={passenger.booking_id} style={styles.passengerItem}>
// //                 <View style={styles.passengerAvatar}>
// //                   <Text style={styles.passengerInitial}>
// //                     {(passenger.passenger_name || 'P').charAt(0).toUpperCase()}
// //                   </Text>
// //                 </View>
// //                 <View style={styles.passengerInfo}>
// //                   <Text style={styles.passengerName}>{passenger.passenger_name}</Text>
// //                   <Text style={styles.passengerPhone}>{passenger.passenger_phone}</Text>
// //                   <Text style={styles.passengerSeats}>{passenger.seats_booked} seat(s) booked</Text>
// //                 </View>
// //               </View>
// //             ))}
// //           </View>
// //         )}

// //         {/* Important Notes */}
// //         <View style={styles.warningCard}>
// //           <Ionicons name="information-circle-outline" size={20} color="#F59E0B" />
// //           <Text style={styles.warningText}>
// //             Once you start the ride, you'll be able to mark passengers as boarded and track the journey.
// //           </Text>
// //         </View>

// //         <View style={styles.warningCard}>
// //           <Ionicons name="time-outline" size={20} color="#DC2626" />
// //           <Text style={[styles.warningText, { color: '#DC2626' }]}>
// //             You have 30 minutes after departure time to start the ride. After that, the ride will be auto-cancelled.
// //           </Text>
// //         </View>
// //       </ScrollView>

// //       {/* Start Button with bottom safe area */}
// //       <View style={[styles.footer, { paddingBottom: insets.bottom > 0 ? insets.bottom : 12 }]}>
// //         <TouchableOpacity
// //           style={[styles.startButton, loading && styles.startButtonDisabled]}
// //           onPress={handleStartRide}
// //           disabled={loading}
// //           activeOpacity={0.8}
// //         >
// //           {loading ? (
// //             <ActivityIndicator size="small" color="#fff" />
// //           ) : (
// //             <>
// //               <Ionicons name="car-sport-outline" size={22} color="#fff" style={styles.startIcon} />
// //               <Text style={styles.startButtonText}>Start Ride</Text>
// //               <Ionicons name="arrow-forward-outline" size={22} color="#fff" style={styles.startIcon} />
// //             </>
// //           )}
// //         </TouchableOpacity>
// //       </View>
// //     </SafeAreaView>
// //   );
// // }

// // const styles = StyleSheet.create({
// //   container: { 
// //     flex: 1, 
// //     backgroundColor: Colors.white || '#F9FAFB' 
// //   },
// //   loadingContainer: { 
// //     flex: 1, 
// //     justifyContent: 'center', 
// //     alignItems: 'center' 
// //   },
// //   loadingText: { 
// //     marginTop: 12, 
// //     fontSize: 14, 
// //     color: '#6B7280' 
// //   },
  
// //   // Header Styles - Same as OngoingRideDriverScreen
// //   header: {
// //     flexDirection: 'row',
// //     alignItems: 'center',
// //     paddingHorizontal: 16,
// //     paddingBottom: 12,
// //     borderBottomWidth: 0.5,
// //     borderBottomColor: '#F3F4F6',
// //     backgroundColor: Colors.white || '#fff',
// //   },
// //   modernBackButton: {
// //     width: 44,
// //     height: 44,
// //     borderRadius: 22,
// //     justifyContent: 'center',
// //     alignItems: 'center',
// //   },
// //   headerTitle: {
// //     ...Typography.h2,
// //     fontSize: 28,
// //     fontWeight: '700',
// //     color: Colors.primary || '#184080',
// //     flex: 1,
// //     textAlign: 'center',
// //   },
// //   infoButton: {
// //     width: 44,
// //     height: 44,
// //     borderRadius: 22,
// //     justifyContent: 'center',
// //     alignItems: 'center',
// //   },
  
// //   content: { 
// //     padding: 16,
// //   },
// //   card: {
// //     backgroundColor: Colors.white,
// //     borderRadius: 16,
// //     padding: 16,
// //     marginBottom: 16,
// //     borderWidth: 1,
// //     borderColor: '#E5E7EB',
// //   },
// //   cardTitle: { 
// //     fontSize: 16, 
// //     fontWeight: '700', 
// //     color: '#111827', 
// //     marginBottom: 12 
// //   },
// //   routeItem: { 
// //     flexDirection: 'row', 
// //     marginBottom: 16 
// //   },
// //   routeDotContainer: { 
// //     alignItems: 'center', 
// //     marginRight: 12, 
// //     width: 20 
// //   },
// //   routeDot: { 
// //     width: 10, 
// //     height: 10, 
// //     borderRadius: 5 
// //   },
// //   routeLine: { 
// //     width: 2, 
// //     height: 30, 
// //     backgroundColor: '#E5E7EB', 
// //     marginVertical: 4 
// //   },
// //   routeTextContainer: { 
// //     flex: 1, 
// //     justifyContent: 'space-between' 
// //   },
// //   routeLocation: { 
// //     fontSize: 15, 
// //     fontWeight: '600', 
// //     color: '#111827', 
// //     marginBottom: 16 
// //   },
// //   infoRow: { 
// //     flexDirection: 'row', 
// //     alignItems: 'center', 
// //     paddingTop: 12, 
// //     borderTopWidth: 0.5, 
// //     borderTopColor: '#E5E7EB' 
// //   },
// //   infoText: { 
// //     fontSize: 14, 
// //     color: '#6B7280', 
// //     marginLeft: 6 
// //   },
// //   infoGrid: { 
// //     flexDirection: 'row', 
// //     gap: 16 
// //   },
// //   infoGridItem: { 
// //     flex: 1, 
// //     alignItems: 'center', 
// //     backgroundColor: '#F9FAFB', 
// //     borderRadius: 12, 
// //     padding: 12 
// //   },
// //   infoGridLabel: { 
// //     fontSize: 12, 
// //     color: '#6B7280', 
// //     marginTop: 6 
// //   },
// //   infoGridValue: { 
// //     fontSize: 14, 
// //     fontWeight: '700', 
// //     color: '#111827', 
// //     marginTop: 2 
// //   },
// //   passengerItem: { 
// //     flexDirection: 'row', 
// //     alignItems: 'center', 
// //     marginBottom: 12, 
// //     paddingVertical: 8 
// //   },
// //   passengerAvatar: {
// //     width: 48,
// //     height: 48,
// //     borderRadius: 24,
// //     backgroundColor: '#E8EEF9',
// //     alignItems: 'center',
// //     justifyContent: 'center',
// //     marginRight: 12,
// //   },
// //   passengerInitial: { 
// //     fontSize: 18, 
// //     fontWeight: '700', 
// //     color: Colors.primary 
// //   },
// //   passengerInfo: { 
// //     flex: 1 
// //   },
// //   passengerName: { 
// //     fontSize: 15, 
// //     fontWeight: '600', 
// //     color: '#111827' 
// //   },
// //   passengerPhone: { 
// //     fontSize: 12, 
// //     color: '#6B7280', 
// //     marginTop: 2 
// //   },
// //   passengerSeats: { 
// //     fontSize: 12, 
// //     color: Colors.primary, 
// //     marginTop: 2 
// //   },
// //   warningCard: {
// //     flexDirection: 'row',
// //     alignItems: 'center',
// //     backgroundColor: '#FFFBEB',
// //     borderRadius: 12,
// //     padding: 12,
// //     marginBottom: 12,
// //     gap: 8,
// //     borderWidth: 1,
// //     borderColor: '#FDE68A',
// //   },
// //   warningText: { 
// //     flex: 1, 
// //     fontSize: 12, 
// //     color: '#92400E', 
// //     lineHeight: 16 
// //   },
// //   footer: {
// //     position: 'absolute',
// //     bottom: 0,
// //     left: 0,
// //     right: 0,
// //     paddingHorizontal: 16,
// //     paddingVertical: 12,
// //     backgroundColor: Colors.white,
// //     borderTopWidth: 0.5,
// //     borderTopColor: '#E5E7EB',
// //   },
// //   startButton: {
// //     backgroundColor: Colors.primary,
// //     borderRadius: 30,
// //     paddingVertical: 16,
// //     flexDirection: 'row',
// //     alignItems: 'center',
// //     justifyContent: 'center',
// //     gap: 12,
// //   },
// //   startButtonDisabled: { 
// //     opacity: 0.6 
// //   },
// //   startIcon: { 
// //     opacity: 0.9 
// //   },
// //   startButtonText: { 
// //     color: Colors.white, 
// //     fontSize: 16, 
// //     fontWeight: '700', 
// //     letterSpacing: 1 
// //   },
// // });
// import React, { useState, useEffect, useCallback } from 'react';
// import {
//   View,
//   Text,
//   StyleSheet,
//   TouchableOpacity,
//   SafeAreaView,
//   StatusBar,
//   ScrollView,
//   Alert,
//   ActivityIndicator,
//   Platform,
//   Image,  
//   RefreshControl,
// } from 'react-native';
// import { useSafeAreaInsets } from 'react-native-safe-area-context';
// import Ionicons from '@expo/vector-icons/Ionicons';
// import { MaterialIcons } from '@expo/vector-icons';
// import axios from 'axios';
// import { API_BASE_URL } from '../config/config_ip';
// import { useAuth } from '../context/AuthContext';
// import { Colors, Typography } from '../constants/Colors';

// export default function StartRideConfirmScreen({ route, navigation }) {
//   const { rideId, ride } = route.params || {};
//   const { user } = useAuth();
//   const insets = useSafeAreaInsets();
//   const [loading, setLoading] = useState(false);
//   const [refreshing, setRefreshing] = useState(false);
//   const [rideDetails, setRideDetails] = useState(ride || null);
//   const [passengers, setPassengers] = useState([]);
//   const [timeStatus, setTimeStatus] = useState({
//     canStart: false,
//     minutesToDeparture: 0,
//     minutesSinceDeparture: 0,
//     isLate: false,
//     statusMessage: '',
//     statusColor: '#F59E0B',
//   });

//   useEffect(() => {
//     fetchRideDetails();
//     startTimeChecker();
    
//     return () => {
//       // Cleanup if needed
//     };
//   }, []);

//   const fetchRideDetails = async () => {
//     try {
//       const res = await axios.get(`${API_BASE_URL}/ride/${rideId}/passengers`);
//       setRideDetails(res.data);
//       setPassengers(res.data.passengers || []);
//       checkStartTime(res.data.departure_time);
//     } catch (error) {
//       console.error('Error fetching ride details:', error);
//     }
//   };

//   const onRefresh = async () => {
//     setRefreshing(true);
//     await fetchRideDetails();
//     setRefreshing(false);
//   };

//   const checkStartTime = (departureTimeStr) => {
//     if (!departureTimeStr) return;
    
//     const now = new Date();
//     const departureTime = new Date(departureTimeStr);
//     const minutesToDeparture = (departureTime - now) / (1000 * 60);
//     const minutesSinceDeparture = (now - departureTime) / (1000 * 60);
    
//     let canStart = false;
//     let statusMessage = '';
//     let statusColor = '#F59E0B';
//     let isLate = false;
    
//     if (minutesSinceDeparture > 30) {
//       canStart = false;
//       statusMessage = '❌ Ride has expired. You cannot start this ride anymore.';
//       statusColor = '#DC2626';
//     } else if (minutesSinceDeparture > 0 && minutesSinceDeparture <= 30) {
//       canStart = true;
//       isLate = true;
//       statusMessage = `⚠️ Ride is ${Math.floor(minutesSinceDeparture)} minutes late. Start before auto-cancellation in ${30 - Math.floor(minutesSinceDeparture)} minutes.`;
//       statusColor = '#F59E0B';
//     } else if (minutesToDeparture <= 15 && minutesToDeparture > 0) {
//       canStart = true;
//       statusMessage = `✅ Ready to start! You can start the ride in ${Math.floor(minutesToDeparture)} minutes.`;
//       statusColor = '#10B981';
//     } else if (minutesToDeparture <= 0 && minutesToDeparture > -15) {
//       canStart = true;
//       statusMessage = `✅ Ready to start! You can start the ride now.`;
//       statusColor = '#10B981';
//     } else if (minutesToDeparture > 15) {
//       canStart = false;
//       statusMessage = `⏰ Too early to start. You can start the ride ${Math.floor(minutesToDeparture)} minutes before departure.`;
//       statusColor = '#6B7280';
//     } else {
//       canStart = true;
//       statusMessage = `✅ Ready to start!`;
//       statusColor = '#10B981';
//     }
    
//     setTimeStatus({
//       canStart,
//       minutesToDeparture: Math.abs(Math.floor(minutesToDeparture)),
//       minutesSinceDeparture: Math.floor(minutesSinceDeparture),
//       isLate,
//       statusMessage,
//       statusColor,
//     });
//   };

//   const startTimeChecker = () => {
//     const interval = setInterval(() => {
//       if (rideDetails?.departure_time) {
//         checkStartTime(rideDetails.departure_time);
//       }
//     }, 60000); // Check every minute
    
//     return () => clearInterval(interval);
//   };

//   const handleStartRide = async () => {
//     if (!timeStatus.canStart) {
//       Alert.alert(
//         'Cannot Start Ride',
//         timeStatus.statusMessage || 'Ride cannot be started at this time.',
//         [{ text: 'OK' }]
//       );
//       return;
//     }

//     if (passengers.length === 0) {
//       Alert.alert(
//         'No Passengers',
//         'This ride has no confirmed passengers. Do you still want to start?',
//         [
//           { text: 'Cancel', style: 'cancel' },
//           { text: 'Start Ride', onPress: confirmStartRide },
//         ]
//       );
//       return;
//     }

//     confirmStartRide();
//   };

//   const confirmStartRide = async () => {
//     setLoading(true);
//     try {
//       const response = await axios.post(`${API_BASE_URL}/ride/${rideId}/start`);
      
//       if (response.data.session_id) {
//         // Navigate to ongoing ride screen
//         navigation.replace('OngoingRideDriverScreen', {
//           rideId: rideId,
//           sessionId: response.data.session_id,
//         });
//       } else {
//         Alert.alert('Success', 'Ride started successfully!');
//         navigation.navigate('MyRides', { refresh: true, tab: 'posted' });
//       }
//     } catch (error) {
//       let errorMessage = 'Could not start the ride. Please try again.';
      
//       if (error.response?.data?.detail) {
//         errorMessage = error.response.data.detail;
//       }
      
//       Alert.alert('Cannot Start Ride', errorMessage);
//     } finally {
//       setLoading(false);
//     }
//   };

//   const formatDateTime = (dateTimeStr) => {
//     if (!dateTimeStr) return { date: 'N/A', time: 'N/A' };
//     const date = new Date(dateTimeStr);
//     return {
//       date: date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' }),
//       time: date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true }),
//     };
//   };

//   const getPassengerStatus = (passenger) => {
//     // Check if passenger has a pending modification request
//     if (passenger.modification_request && passenger.modification_request.status === 'pending') {
//       return {
//         text: `Request: ${passenger.modification_request.current_seats} → ${passenger.modification_request.requested_seats} seats`,
//         color: '#F59E0B',
//         icon: 'swap',
//       };
//     }
//     return null;
//   };

//   const { date, time } = formatDateTime(rideDetails?.departure_time);
//   const totalBookedSeats = passengers.reduce((sum, p) => sum + (p.seats_booked || 0), 0);
//   const availableSeats = (rideDetails?.available_seats || 0) - totalBookedSeats;

//   if (!rideDetails) {
//     return (
//       <SafeAreaView style={styles.container} edges={['top']}>
//         <StatusBar barStyle="dark-content" backgroundColor={Colors.white} />
//         <View style={styles.loadingContainer}>
//           <ActivityIndicator size="large" color={Colors.primary} />
//           <Text style={styles.loadingText}>Loading ride details...</Text>
//         </View>
//       </SafeAreaView>
//     );
//   }

//   return (
//     <SafeAreaView style={styles.container} edges={['top']}>
//       <StatusBar barStyle="dark-content" backgroundColor={Colors.white} />
      
//       {/* Header */}
//       <View style={[styles.header, { paddingTop: insets.top > 0 ? insets.top : 12 }]}>
//         <TouchableOpacity style={styles.modernBackButton} onPress={() => navigation.goBack()}>
//           <MaterialIcons name="arrow-back-ios" size={28} color={Colors.secondary || Colors.primary} />
//         </TouchableOpacity>
        
//         <Text style={styles.headerTitle}>Start Your Ride</Text>
        
//         <TouchableOpacity 
//           style={styles.infoButton}
//           onPress={() => {
//             Alert.alert(
//               "Start Ride",
//               "Once you start the ride, you'll be able to:\n\n• Mark passengers as boarded\n• Track the journey live\n• Share your live location with passengers\n• Get SOS support\n\nNote: You have 30 minutes after departure time to start the ride."
//             );
//           }}
//         >
//           <Ionicons name="information-circle-outline" size={26} color={Colors.secondary || Colors.primary} />
//         </TouchableOpacity>
//       </View>

//       <ScrollView 
//         contentContainerStyle={[styles.content, { paddingBottom: insets.bottom > 0 ? insets.bottom + 80 : 100 }]}
//         showsVerticalScrollIndicator={false}
//         refreshControl={
//           <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[Colors.primary]} />
//         }
//       >
//         {/* Time Status Card */}
//         <View style={[styles.statusCard, { backgroundColor: timeStatus.statusColor + '10', borderColor: timeStatus.statusColor + '30' }]}>
//           <View style={styles.statusRow}>
//             {timeStatus.isLate ? (
//               <Ionicons name="time-outline" size={24} color={timeStatus.statusColor} />
//             ) : timeStatus.canStart ? (
//               <Ionicons name="checkmark-circle" size={24} color={timeStatus.statusColor} />
//             ) : (
//               <Ionicons name="lock-closed" size={24} color={timeStatus.statusColor} />
//             )}
//             <Text style={[styles.statusText, { color: timeStatus.statusColor }]}>
//               {timeStatus.statusMessage}
//             </Text>
//           </View>
//         </View>

//         {/* Route Details */}
//         <View style={styles.card}>
//           <Text style={styles.cardTitle}>Route Details</Text>
          
//           <View style={styles.routeItem}>
//             <View style={styles.routeDotContainer}>
//               <View style={[styles.routeDot, { backgroundColor: '#10B981' }]} />
//               <View style={styles.routeLine} />
//               <View style={[styles.routeDot, { backgroundColor: '#EF4444' }]} />
//             </View>
//             <View style={styles.routeTextContainer}>
//               <Text style={styles.routeLocation}>{rideDetails.origin?.split(',')[0] || 'Pickup Location'}</Text>
//               <Text style={styles.routeLocation}>{rideDetails.destination?.split(',')[0] || 'Drop-off Location'}</Text>
//             </View>
//           </View>

//           <View style={styles.infoRow}>
//             <Ionicons name="calendar-outline" size={18} color="#6B7280" />
//             <Text style={styles.infoText}>{date}</Text>
//             <Ionicons name="time-outline" size={18} color="#6B7280" style={{ marginLeft: 16 }} />
//             <Text style={styles.infoText}>{time}</Text>
//           </View>

//           <View style={styles.infoRow}>
//             <Ionicons name="map-outline" size={18} color="#6B7280" />
//             <Text style={styles.infoText}>Distance: {rideDetails.distance_km || 'N/A'} km</Text>
//             <Ionicons name="hourglass-outline" size={18} color="#6B7280" style={{ marginLeft: 16 }} />
//             <Text style={styles.infoText}>Duration: {rideDetails.duration_text || 'N/A'}</Text>
//           </View>
//         </View>

//         {/* Ride Information */}
//         <View style={styles.card}>
//   <Text style={styles.cardTitle}>Ride Information</Text>
  
//   <View style={styles.infoGrid}>
//     <View style={styles.infoGridItem}>
//       <Ionicons name="people-outline" size={20} color={Colors.primary} />
//       <Text style={styles.infoGridLabel}>Passengers</Text>
//       <Text style={styles.infoGridValue}>
//         {totalBookedSeats} / {rideDetails?.available_seats || 0}
//       </Text>
//       {/* <Text style={styles.infoGridSubtext}>
//         ({passengers.length} person{passengers.length !== 1 ? 's' : ''} booked)
//       </Text> */}
//     </View>
//     <View style={styles.infoGridItem}>
//       <Ionicons name="car-outline" size={20} color={Colors.primary} />
//       <Text style={styles.infoGridLabel}>Available Seats</Text>
//       <Text style={styles.infoGridValue}>{availableSeats}</Text>
//     </View>
//     <View style={styles.infoGridItem}>
//       <Ionicons name="wallet-outline" size={20} color={Colors.primary} />
//       <Text style={styles.infoGridLabel}>Price/Seat</Text>
//       <Text style={styles.infoGridValue}>₹{rideDetails.price_per_seat}</Text>
//     </View>
//   </View>
// </View>

//         {/* Passengers List */}
//         {passengers.length > 0 && (
//           <View style={styles.card}>
//             {/* <Text style={styles.cardTitle}>Confirmed Passengers ({passengers.length})</Text> */}
//             {passengers.map((passenger, index) => {
//               const passengerStatus = getPassengerStatus(passenger);
//               return (
//                 <View key={passenger.booking_id} style={[styles.passengerItem, index === passengers.length - 1 && styles.lastPassengerItem]}>
//                   <View style={styles.passengerAvatar}>
//                     {passenger.profile_picture ? (
//                       <Image 
//                         source={{ uri: buildImageUrl(passenger.profile_picture) }} 
//                         style={styles.passengerAvatarImage}
//                       />
//                     ) : (
//                       <Text style={styles.passengerInitial}>
//                         {(passenger.passenger_name || 'P').charAt(0).toUpperCase()}
//                       </Text>
//                     )}
//                   </View>
//                   <View style={styles.passengerInfo}>
//                     <Text style={styles.passengerName}>{passenger.passenger_name || 'Passenger'}</Text>
//                     <Text style={styles.passengerPhone}>{passenger.passenger_phone}</Text>
//                     <Text style={styles.passengerSeats}>
//                       <Ionicons name="person" size={12} color={Colors.primary} /> {passenger.seats_booked} seat(s)
//                     </Text>
//                     {passengerStatus && (
//                       <View style={styles.modificationBadge}>
//                         <Ionicons name={passengerStatus.icon} size={10} color={passengerStatus.color} />
//                         <Text style={[styles.modificationBadgeText, { color: passengerStatus.color }]}>
//                           {passengerStatus.text}
//                         </Text>
//                       </View>
//                     )}
//                   </View>
//                 </View>
//               );
//             })}
//           </View>
//         )}

//         {/* No Passengers Message */}
//         {passengers.length === 0 && (
//           <View style={styles.card}>
//             <View style={styles.noPassengersContainer}>
//               <Ionicons name="people-outline" size={48} color="#D1D5DB" />
//               <Text style={styles.noPassengersText}>No confirmed passengers yet</Text>
//               <Text style={styles.noPassengersSubtext}>
//                 You can still start the ride. Passengers may join during the journey.
//               </Text>
//             </View>
//           </View>
//         )}

//         {/* Important Notes */}
//         <View style={styles.warningCard}>
//           <Ionicons name="information-circle-outline" size={20} color="#F59E0B" />
//           <Text style={styles.warningText}>
//             Once you start the ride, you'll be able to:
//           </Text>
//         </View>

//         <View style={styles.tipList}>
//           <View style={styles.tipItem}>
//             <Ionicons name="checkmark-circle" size={16} color="#10B981" />
//             <Text style={styles.tipText}>Mark passengers as boarded</Text>
//           </View>
//           <View style={styles.tipItem}>
//             <Ionicons name="checkmark-circle" size={16} color="#10B981" />
//             <Text style={styles.tipText}>Track the journey live</Text>
//           </View>
//           <View style={styles.tipItem}>
//             <Ionicons name="checkmark-circle" size={16} color="#10B981" />
//             <Text style={styles.tipText}>Share your live location with passengers</Text>
//           </View>
//           <View style={styles.tipItem}>
//             <Ionicons name="checkmark-circle" size={16} color="#10B981" />
//             <Text style={styles.tipText}>Get SOS support in emergencies</Text>
//           </View>
//         </View>

//         <View style={styles.warningCard}>
//           <Ionicons name="time-outline" size={20} color="#DC2626" />
//           <Text style={[styles.warningText, { color: '#DC2626' }]}>
//             You have 30 minutes after departure time to start the ride. After that, the ride will be auto-cancelled.
//           </Text>
//         </View>

//         {timeStatus.isLate && (
//           <View style={styles.lateWarningCard}>
//             <Ionicons name="alert-circle" size={20} color="#DC2626" />
//             <Text style={styles.lateWarningText}>
//               Your ride is late! Please start as soon as possible to avoid auto-cancellation in {30 - timeStatus.minutesSinceDeparture} minutes.
//             </Text>
//           </View>
//         )}
//       </ScrollView>

//       {/* Start Button with bottom safe area */}
//       <View style={[styles.footer, { paddingBottom: insets.bottom > 0 ? insets.bottom : 12 }]}>
//         <TouchableOpacity
//           style={[
//             styles.startButton, 
//             loading && styles.startButtonDisabled,
//             !timeStatus.canStart && styles.startButtonDisabled
//           ]}
//           onPress={handleStartRide}
//           disabled={loading || !timeStatus.canStart}
//           activeOpacity={0.8}
//         >
//           {loading ? (
//             <ActivityIndicator size="small" color="#fff" />
//           ) : (
//             <>
//               <Ionicons name="car-sport-outline" size={22} color="#fff" style={styles.startIcon} />
//               <Text style={styles.startButtonText}>
//                 {timeStatus.isLate ? 'Start Ride (Late)' : 'Start Ride'}
//               </Text>
//               <Ionicons name="arrow-forward-outline" size={22} color="#fff" style={styles.startIcon} />
//             </>
//           )}
//         </TouchableOpacity>
        
//         {!timeStatus.canStart && !loading && (
//           <Text style={styles.disabledHint}>
//             {timeStatus.minutesToDeparture > 15 
//               ? `You can start ${timeStatus.minutesToDeparture - 15} minutes before departure`
//               : timeStatus.minutesSinceDeparture > 30 
//               ? 'This ride has expired'
//               : 'Please wait until you can start the ride'}
//           </Text>
//         )}
//       </View>
//     </SafeAreaView>
//   );
// }

// // Helper function for image URL
// const buildImageUrl = (url) => {
//   if (!url) return null;
//   if (url.startsWith('http://') || url.startsWith('https://')) return url;
//   return `${API_BASE_URL}${url.startsWith('/') ? url : `/${url}`}`;
// };

// const styles = StyleSheet.create({
//   container: { 
//     flex: 1, 
//     backgroundColor: Colors.white || '#F9FAFB' 
//   },
//   loadingContainer: { 
//     flex: 1, 
//     justifyContent: 'center', 
//     alignItems: 'center' 
//   },
//   loadingText: { 
//     marginTop: 12, 
//     fontSize: 14, 
//     color: '#6B7280' 
//   },
  
//   // Header Styles
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
//     ...Typography.h2,
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
  
//   content: { 
//     padding: 16,
//   },
  
//   // Status Card
//   statusCard: {
//     borderRadius: 16,
//     padding: 16,
//     marginBottom: 16,
//     borderWidth: 1,
//   },
//   statusRow: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     gap: 12,
//   },
//   statusText: {
//     flex: 1,
//     fontSize: 14,
//     fontWeight: '600',
//     lineHeight: 20,
//   },
  
//   card: {
//     backgroundColor: Colors.white,
//     borderRadius: 16,
//     padding: 16,
//     marginBottom: 16,
//     borderWidth: 1,
//     borderColor: '#E5E7EB',
//     shadowColor: '#000',
//     shadowOffset: { width: 0, height: 2 },
//     shadowOpacity: 0.05,
//     shadowRadius: 8,
//     elevation: 2,
//   },
//   cardTitle: { 
//     fontSize: 16, 
//     fontWeight: '700', 
//     color: '#111827', 
//     marginBottom: 12 
//   },
  
//   routeItem: { 
//     flexDirection: 'row', 
//     marginBottom: 16 
//   },
//   routeDotContainer: { 
//     alignItems: 'center', 
//     marginRight: 12, 
//     width: 20 
//   },
//   routeDot: { 
//     width: 10, 
//     height: 10, 
//     borderRadius: 5 
//   },
//   routeLine: { 
//     width: 2, 
//     height: 30, 
//     backgroundColor: '#E5E7EB', 
//     marginVertical: 4 
//   },
//   routeTextContainer: { 
//     flex: 1, 
//     justifyContent: 'space-between' 
//   },
//   routeLocation: { 
//     fontSize: 15, 
//     fontWeight: '600', 
//     color: '#111827', 
//     marginBottom: 16 
//   },
//   infoRow: { 
//     flexDirection: 'row', 
//     alignItems: 'center', 
//     paddingTop: 12, 
//     borderTopWidth: 0.5, 
//     borderTopColor: '#E5E7EB',
//     flexWrap: 'wrap',
//     gap: 6,
//   },
//   infoText: { 
//     fontSize: 14, 
//     color: '#6B7280', 
//     marginLeft: 6 
//   },
  
//   infoGrid: { 
//     flexDirection: 'row', 
//     gap: 12,
//     flexWrap: 'wrap',
//   },
//   infoGridItem: { 
//     flex: 1,
//     minWidth: 100,
//     alignItems: 'center', 
//     backgroundColor: '#F9FAFB', 
//     borderRadius: 12, 
//     padding: 12 
//   },
//   infoGridLabel: { 
//     fontSize: 12, 
//     color: '#6B7280', 
//     marginTop: 6 
//   },
//   infoGridValue: { 
//     fontSize: 14, 
//     fontWeight: '700', 
//     color: '#111827', 
//     marginTop: 2 
//   },
  
//   passengerItem: { 
//     flexDirection: 'row', 
//     alignItems: 'center', 
//     marginBottom: 12, 
//     paddingVertical: 8,
//     borderBottomWidth: 0.5,
//     borderBottomColor: '#E5E7EB',
//   },
//   lastPassengerItem: {
//     borderBottomWidth: 0,
//     marginBottom: 0,
//   },
//   passengerAvatar: {
//     width: 48,
//     height: 48,
//     borderRadius: 24,
//     backgroundColor: '#E8EEF9',
//     alignItems: 'center',
//     justifyContent: 'center',
//     marginRight: 12,
//     overflow: 'hidden',
//   },
//   passengerAvatarImage: {
//     width: 48,
//     height: 48,
//     borderRadius: 24,
//   },
//   passengerInitial: { 
//     fontSize: 18, 
//     fontWeight: '700', 
//     color: Colors.primary 
//   },
//   passengerInfo: { 
//     flex: 1 
//   },
//   passengerName: { 
//     fontSize: 15, 
//     fontWeight: '600', 
//     color: '#111827' 
//   },
//   passengerPhone: { 
//     fontSize: 12, 
//     color: '#6B7280', 
//     marginTop: 2 
//   },
//   passengerSeats: { 
//     fontSize: 12, 
//     color: Colors.primary, 
//     marginTop: 2,
//     flexDirection: 'row',
//     alignItems: 'center',
//   },
//   modificationBadge: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     backgroundColor: '#FFFBEB',
//     paddingHorizontal: 8,
//     paddingVertical: 4,
//     borderRadius: 12,
//     marginTop: 6,
//     gap: 4,
//     alignSelf: 'flex-start',
//   },
//   modificationBadgeText: {
//     fontSize: 10,
//     fontWeight: '500',
//   },
  
//   noPassengersContainer: {
//     alignItems: 'center',
//     paddingVertical: 20,
//     gap: 8,
//   },
//   noPassengersText: {
//     fontSize: 14,
//     fontWeight: '600',
//     color: '#6B7280',
//   },
//   noPassengersSubtext: {
//     fontSize: 12,
//     color: '#9CA3AF',
//     textAlign: 'center',
//   },
  
//   warningCard: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     backgroundColor: '#FFFBEB',
//     borderRadius: 12,
//     padding: 12,
//     marginBottom: 12,
//     gap: 8,
//     borderWidth: 1,
//     borderColor: '#FDE68A',
//   },
//   warningText: { 
//     flex: 1, 
//     fontSize: 12, 
//     color: '#92400E', 
//     lineHeight: 16,
//     fontWeight: '500',
//   },
  
//   tipList: {
//     backgroundColor: '#F0FDF4',
//     borderRadius: 12,
//     padding: 12,
//     marginBottom: 12,
//     gap: 8,
//   },
//   tipItem: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     gap: 8,
//   },
//   tipText: {
//     fontSize: 12,
//     color: '#166534',
//   },
  
//   lateWarningCard: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     backgroundColor: '#FEF2F2',
//     borderRadius: 12,
//     padding: 12,
//     marginBottom: 12,
//     gap: 8,
//     borderWidth: 1,
//     borderColor: '#FEE2E2',
//   },
//   lateWarningText: {
//     flex: 1,
//     fontSize: 12,
//     color: '#DC2626',
//     fontWeight: '600',
//   },
  
//   footer: {
//     position: 'absolute',
//     bottom: 0,
//     left: 0,
//     right: 0,
//     paddingHorizontal: 16,
//     paddingVertical: 12,
//     backgroundColor: Colors.white,
//     borderTopWidth: 0.5,
//     borderTopColor: '#E5E7EB',
//   },
//   startButton: {
//     backgroundColor: Colors.primary,
//     borderRadius: 30,
//     paddingVertical: 16,
//     flexDirection: 'row',
//     alignItems: 'center',
//     justifyContent: 'center',
//     gap: 12,
//   },
//   startButtonDisabled: { 
//     opacity: 0.5 
//   },
//   startIcon: { 
//     opacity: 0.9 
//   },
//   startButtonText: { 
//     color: Colors.white, 
//     fontSize: 16, 
//     fontWeight: '700', 
//     letterSpacing: 1 
//   },
//   disabledHint: {
//     textAlign: 'center',
//     fontSize: 11,
//     color: '#6B7280',
//     marginTop: 8,
//   },
// });
import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  ScrollView,
  Alert,
  ActivityIndicator,
  Platform,
  Image,  
  RefreshControl,
  Animated,
  PanResponder,
  Dimensions,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Ionicons from '@expo/vector-icons/Ionicons';
import { MaterialIcons } from '@expo/vector-icons';
import axios from 'axios';
import { API_BASE_URL } from '../config/config_ip';
import { useAuth } from '../context/AuthContext';
import { Colors, Typography } from '../constants/Colors';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const SLIDER_WIDTH = SCREEN_WIDTH - 48; // 24 padding on each side
const SLIDER_BUTTON_SIZE = 56;

export default function StartRideConfirmScreen({ route, navigation }) {
  const { rideId, ride } = route.params || {};
  const { user } = useAuth();
  const insets = useSafeAreaInsets();
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [rideDetails, setRideDetails] = useState(ride || null);
  const [passengers, setPassengers] = useState([]);
  const [timeStatus, setTimeStatus] = useState({
    canStart: false,
    minutesToDeparture: 0,
    minutesSinceDeparture: 0,
    isLate: false,
    statusMessage: '',
    statusColor: '#F59E0B',
  });

  // Slider animation values
  const pan = useRef(new Animated.ValueXY()).current;
  const sliderContainerWidth = useRef(SLIDER_WIDTH);
  const [isDragging, setIsDragging] = useState(false);
  const [sliderCompleted, setSliderCompleted] = useState(false);
  const sliderThreshold = SLIDER_WIDTH - SLIDER_BUTTON_SIZE - 10;

  // PanResponder for slide to start
  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      onPanResponderGrant: () => {
        if (timeStatus.canStart && !loading) {
          setIsDragging(true);
        }
      },
      onPanResponderMove: (e, gestureState) => {
        if (timeStatus.canStart && !loading && !sliderCompleted) {
          let newX = gestureState.dx;
          newX = Math.max(0, Math.min(newX, sliderThreshold));
          pan.setValue({ x: newX, y: 0 });
        }
      },
      onPanResponderRelease: (e, gestureState) => {
        if (timeStatus.canStart && !loading && !sliderCompleted) {
          if (gestureState.dx >= sliderThreshold) {
            // Slider completed - trigger start ride
            setSliderCompleted(true);
            pan.setValue({ x: sliderThreshold, y: 0 });
            handleStartRide();
          } else {
            // Reset slider position
            Animated.spring(pan, {
              toValue: { x: 0, y: 0 },
              useNativeDriver: false,
              friction: 5,
              tension: 40,
            }).start();
          }
          setIsDragging(false);
        }
      },
    })
  ).current;

  // Reset slider when canStart changes
  useEffect(() => {
    if (!timeStatus.canStart && sliderCompleted) {
      setSliderCompleted(false);
      pan.setValue({ x: 0, y: 0 });
    }
  }, [timeStatus.canStart]);

  useEffect(() => {
    fetchRideDetails();
    startTimeChecker();
    
    return () => {
      // Cleanup if needed
    };
  }, []);

  const fetchRideDetails = async () => {
    try {
      const res = await axios.get(`${API_BASE_URL}/ride/${rideId}/passengers`);
      setRideDetails(res.data);
      setPassengers(res.data.passengers || []);
      checkStartTime(res.data.departure_time);
    } catch (error) {
      console.error('Error fetching ride details:', error);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchRideDetails();
    setRefreshing(false);
  };

  const checkStartTime = (departureTimeStr) => {
    if (!departureTimeStr) return;
    
    const now = new Date();
    const departureTime = new Date(departureTimeStr);
    const minutesToDeparture = (departureTime - now) / (1000 * 60);
    const minutesSinceDeparture = (now - departureTime) / (1000 * 60);
    const hoursSinceDeparture = (now - departureTime) / (1000 * 60 * 60);
    
    let canStart = false;
    let statusMessage = '';
    let statusColor = '#F59E0B';
    let isLate = false;
    
    // Auto-cancellation after 2 hours (120 minutes)
    if (hoursSinceDeparture > 2) {
      canStart = false;
      statusMessage = '❌ Ride has expired. Auto-cancelled after 2 hours.';
      statusColor = '#DC2626';
    } else if (minutesSinceDeparture > 0 && minutesSinceDeparture <= 120) {
      canStart = true;
      isLate = true;
      const remainingMinutes = Math.floor(120 - minutesSinceDeparture);
      statusMessage = `⚠️ Ride is ${Math.floor(minutesSinceDeparture)} minutes late. Start before auto-cancellation in ${remainingMinutes} minutes.`;
      statusColor = '#F59E0B';
    } else if (minutesToDeparture <= 15 && minutesToDeparture > 0) {
      // Can start 15 minutes before departure
      canStart = true;
      statusMessage = `✅ Ready to start! You can start the ride now (${Math.floor(minutesToDeparture)} minutes before departure).`;
      statusColor = '#10B981';
    } else if (minutesToDeparture <= 0 && minutesToDeparture > -15) {
      canStart = true;
      statusMessage = `✅ Ready to start! You can start the ride now.`;
      statusColor = '#10B981';
    } else if (minutesToDeparture > 15) {
      canStart = false;
      const minutesUntilStart = Math.floor(minutesToDeparture - 15);
      statusMessage = `⏰ You can start the ride 15 minutes before departure (in ${minutesUntilStart} minutes).`;
      statusColor = '#6B7280';
    } else {
      canStart = true;
      statusMessage = `✅ Ready to start!`;
      statusColor = '#10B981';
    }
    
    setTimeStatus({
      canStart,
      minutesToDeparture: Math.abs(Math.floor(minutesToDeparture)),
      minutesSinceDeparture: Math.floor(minutesSinceDeparture),
      hoursSinceDeparture: Math.floor(hoursSinceDeparture),
      isLate,
      statusMessage,
      statusColor,
    });
  };

  const startTimeChecker = () => {
    const interval = setInterval(() => {
      if (rideDetails?.departure_time) {
        checkStartTime(rideDetails.departure_time);
      }
    }, 60000); // Check every minute
    
    return () => clearInterval(interval);
  };

  const handleStartRide = async () => {
    if (!timeStatus.canStart) {
      Alert.alert(
        'Cannot Start Ride',
        timeStatus.statusMessage || 'Ride cannot be started at this time.',
        [{ text: 'OK' }]
      );
      return;
    }

    if (passengers.length === 0) {
      Alert.alert(
        'No Passengers',
        'This ride has no confirmed passengers. Do you still want to start?',
        [
          { text: 'Cancel', style: 'cancel', onPress: resetSlider },
          { text: 'Start Ride', onPress: confirmStartRide },
        ]
      );
      return;
    }

    confirmStartRide();
  };

  const resetSlider = () => {
    setSliderCompleted(false);
    pan.setValue({ x: 0, y: 0 });
  };

  const confirmStartRide = async () => {
    setLoading(true);
    try {
      const response = await axios.post(`${API_BASE_URL}/ride/${rideId}/start`);
      
      if (response.data.session_id) {
        // Navigate to ongoing ride screen
        navigation.replace('OngoingRideDriverScreen', {
          rideId: rideId,
          sessionId: response.data.session_id,
        });
      } else {
        Alert.alert('Success', 'Ride started successfully!');
        navigation.navigate('MyRides', { refresh: true, tab: 'posted' });
      }
    } catch (error) {
      let errorMessage = 'Could not start the ride. Please try again.';
      
      if (error.response?.data?.detail) {
        errorMessage = error.response.data.detail;
      }
      
      Alert.alert('Cannot Start Ride', errorMessage);
      resetSlider();
    } finally {
      setLoading(false);
    }
  };

  const formatDateTime = (dateTimeStr) => {
    if (!dateTimeStr) return { date: 'N/A', time: 'N/A' };
    const date = new Date(dateTimeStr);
    return {
      date: date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' }),
      time: date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true }),
    };
  };

  const getPassengerStatus = (passenger) => {
    // Check if passenger has a pending modification request
    if (passenger.modification_request && passenger.modification_request.status === 'pending') {
      return {
        text: `Request: ${passenger.modification_request.current_seats} → ${passenger.modification_request.requested_seats} seats`,
        color: '#F59E0B',
        icon: 'swap',
      };
    }
    // Check if modification was approved
    if (passenger.modification_request && passenger.modification_request.status === 'approved') {
      return {
        text: `Seats updated: ${passenger.modification_request.current_seats} → ${passenger.modification_request.requested_seats} seats`,
        color: '#10B981',
        icon: 'checkmark-circle',
      };
    }
    return null;
  };

  // Get driver status display
  const getDriverStatusInfo = () => {
    if (!rideDetails) return null;
    
    const now = new Date();
    const departureTime = new Date(rideDetails.departure_time);
    const hoursSinceDeparture = (now - departureTime) / (1000 * 60 * 60);
    const minutesSinceDeparture = (now - departureTime) / (1000 * 60);
    const minutesToDeparture = (departureTime - now) / (1000 * 60);
    
    if (rideDetails.status === "completed") {
      return { text: "Completed", color: "#6B7280", icon: "checkmark-done-circle" };
    }
    
    if (rideDetails.cancellation_reason) {
      if (rideDetails.cancellation_reason.includes("Auto-cancelled") || hoursSinceDeparture > 2) {
        return { text: "Auto-cancelled", color: "#9CA3AF", icon: "timer-off" };
      }
      return { text: "Cancelled", color: "#DC2626", icon: "close-circle" };
    }
    
    if (rideDetails.started_at) {
      return { text: "Ongoing", color: "#10B981", icon: "car-sport" };
    }
    
    if (minutesSinceDeparture > 0 && minutesSinceDeparture <= 120) {
      const remainingMinutes = Math.floor(120 - minutesSinceDeparture);
      return { text: `Late (${Math.floor(minutesSinceDeparture)} min) - ${remainingMinutes} min left`, color: "#EF4444", icon: "alert-circle" };
    }
    
    if (minutesToDeparture <= 15 && minutesToDeparture > 0) {
      return { text: `Ready to start (${Math.floor(minutesToDeparture)} min early)`, color: "#10B981", icon: "checkmark-circle" };
    }
    
    if (minutesToDeparture <= 60 && minutesToDeparture > 15) {
      return { text: `Starts in ${Math.floor(minutesToDeparture)} min`, color: "#F59E0B", icon: "time-outline" };
    }
    
    if (minutesToDeparture > 60) {
      const hours = Math.floor(minutesToDeparture / 60);
      const mins = Math.round(minutesToDeparture % 60);
      const timeText = hours > 0 ? `${hours}h ${mins > 0 ? `${mins}m` : ''}` : `${mins}m`;
      return { text: `Starts in ${timeText}`, color: "#2457A6", icon: "calendar-outline" };
    }
    
    return { text: "Active", color: "#10B981", icon: "checkmark-circle" };
  };

  const { date, time } = formatDateTime(rideDetails?.departure_time);
  const totalBookedSeats = passengers.reduce((sum, p) => {
    // Use approved modification seats if available
    if (p.modification_request && p.modification_request.status === 'approved') {
      return sum + (p.modification_request.requested_seats || 0);
    }
    return sum + (p.seats_booked || 0);
  }, 0);
  const availableSeats = (rideDetails?.available_seats || 0) - totalBookedSeats;
  const driverStatusInfo = getDriverStatusInfo();
  const canStartNow = timeStatus.canStart;

  // Calculate slider progress percentage
  const sliderProgress = pan.x.interpolate({
    inputRange: [0, sliderThreshold],
    outputRange: ['0%', '100%'],
    extrapolate: 'clamp',
  });

  if (!rideDetails) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <StatusBar barStyle="dark-content" backgroundColor={Colors.white} />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={Colors.primary} />
          <Text style={styles.loadingText}>Loading ride details...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <StatusBar barStyle="dark-content" backgroundColor={Colors.white} />
      
      {/* Header */}
      <View style={[styles.header, { paddingTop: insets.top > 0 ? insets.top : 12 }]}>
        <TouchableOpacity style={styles.modernBackButton} onPress={() => navigation.goBack()}>
          <MaterialIcons name="arrow-back-ios" size={28} color={Colors.secondary || Colors.primary} />
        </TouchableOpacity>
        
        <Text style={styles.headerTitle}>Start Your Ride</Text>
        
        <TouchableOpacity 
          style={styles.infoButton}
          onPress={() => {
            Alert.alert(
              "Start Ride",
              "Once you start the ride, you'll be able to:\n\n• Mark passengers as boarded\n• Track the journey live\n• Share your live location with passengers\n• Get SOS support\n\nNote: You can start the ride 15 minutes before departure time. You have 2 hours after departure time to start the ride. After that, the ride will be auto-cancelled."
            );
          }}
        >
          <Ionicons name="information-circle-outline" size={26} color={Colors.secondary || Colors.primary} />
        </TouchableOpacity>
      </View>

      <ScrollView 
        contentContainerStyle={[styles.content, { paddingBottom: insets.bottom > 0 ? insets.bottom + 100 : 120 }]}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[Colors.primary]} />
        }
      >
        {/* Driver Status Card */}
        <View style={[styles.driverStatusCard, { backgroundColor: driverStatusInfo.color + '10', borderColor: driverStatusInfo.color + '30' }]}>
          <View style={styles.driverStatusRow}>
            <Ionicons name={driverStatusInfo.icon} size={28} color={driverStatusInfo.color} />
            <View style={styles.driverStatusTextContainer}>
              <Text style={styles.driverStatusLabel}>Driver Status</Text>
              <Text style={[styles.driverStatusValue, { color: driverStatusInfo.color }]}>
                {driverStatusInfo.text}
              </Text>
            </View>
          </View>
        </View>

        {/* Time Status Card */}
        <View style={[styles.statusCard, { backgroundColor: timeStatus.statusColor + '10', borderColor: timeStatus.statusColor + '30' }]}>
          <View style={styles.statusRow}>
            {timeStatus.isLate ? (
              <Ionicons name="time-outline" size={24} color={timeStatus.statusColor} />
            ) : timeStatus.canStart ? (
              <Ionicons name="checkmark-circle" size={24} color={timeStatus.statusColor} />
            ) : (
              <Ionicons name="lock-closed" size={24} color={timeStatus.statusColor} />
            )}
            <Text style={[styles.statusText, { color: timeStatus.statusColor }]}>
              {timeStatus.statusMessage}
            </Text>
          </View>
        </View>

        {/* Auto-cancel Warning */}
        <View style={styles.warningCard}>
          <Ionicons name="time-outline" size={20} color="#DC2626" />
          <Text style={[styles.warningText, { color: '#DC2626' }]}>
            You can start 15 minutes before departure. You have 2 hours after departure time to start the ride. After that, the ride will be auto-cancelled.
          </Text>
        </View>

        {timeStatus.isLate && (
          <View style={styles.lateWarningCard}>
            <Ionicons name="alert-circle" size={20} color="#DC2626" />
            <Text style={styles.lateWarningText}>
              Your ride is late! Please start as soon as possible to avoid auto-cancellation in {120 - timeStatus.minutesSinceDeparture} minutes.
            </Text>
          </View>
        )}

        {/* Route Details */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Route Details</Text>
          
          <View style={styles.routeItem}>
            <View style={styles.routeDotContainer}>
              <View style={[styles.routeDot, { backgroundColor: '#10B981' }]} />
              <View style={styles.routeLine} />
              <View style={[styles.routeDot, { backgroundColor: '#EF4444' }]} />
            </View>
            <View style={styles.routeTextContainer}>
              <Text style={styles.routeLocation}>{rideDetails.origin?.split(',')[0] || 'Pickup Location'}</Text>
              <Text style={styles.routeLocation}>{rideDetails.destination?.split(',')[0] || 'Drop-off Location'}</Text>
            </View>
          </View>

          <View style={styles.infoRow}>
            <Ionicons name="calendar-outline" size={18} color="#6B7280" />
            <Text style={styles.infoText}>{date}</Text>
            <Ionicons name="time-outline" size={18} color="#6B7280" style={{ marginLeft: 16 }} />
            <Text style={styles.infoText}>{time}</Text>
          </View>

          <View style={styles.infoRow}>
            <Ionicons name="map-outline" size={18} color="#6B7280" />
            <Text style={styles.infoText}>Distance: {rideDetails.distance_km || 'N/A'} km</Text>
            <Ionicons name="hourglass-outline" size={18} color="#6B7280" style={{ marginLeft: 16 }} />
            <Text style={styles.infoText}>Duration: {rideDetails.duration_text || 'N/A'}</Text>
          </View>
        </View>

        {/* Ride Information */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Ride Information</Text>
          
          <View style={styles.infoGrid}>
            <View style={styles.infoGridItem}>
              <Ionicons name="people-outline" size={20} color={Colors.primary} />
              <Text style={styles.infoGridLabel}>Passengers</Text>
              <Text style={styles.infoGridValue}>
                {totalBookedSeats} / {rideDetails?.available_seats || 0}
              </Text>
            </View>
            <View style={styles.infoGridItem}>
              <Ionicons name="car-outline" size={20} color={Colors.primary} />
              <Text style={styles.infoGridLabel}>Available Seats</Text>
              <Text style={styles.infoGridValue}>{availableSeats}</Text>
            </View>
            <View style={styles.infoGridItem}>
              <Ionicons name="wallet-outline" size={20} color={Colors.primary} />
              <Text style={styles.infoGridLabel}>Price/Seat</Text>
              <Text style={styles.infoGridValue}>₹{rideDetails.price_per_seat}</Text>
            </View>
          </View>
        </View>

        {/* Passengers List */}
        {passengers.length > 0 && (
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Confirmed Passengers ({passengers.length})</Text>
            {passengers.map((passenger, index) => {
              const passengerStatus = getPassengerStatus(passenger);
              const actualSeats = passenger.modification_request?.status === 'approved' 
                ? passenger.modification_request.requested_seats 
                : passenger.seats_booked;
              
              return (
                <View key={passenger.booking_id} style={[styles.passengerItem, index === passengers.length - 1 && styles.lastPassengerItem]}>
                  <View style={styles.passengerAvatar}>
                    {passenger.profile_picture ? (
                      <Image 
                        source={{ uri: buildImageUrl(passenger.profile_picture) }} 
                        style={styles.passengerAvatarImage}
                      />
                    ) : (
                      <Text style={styles.passengerInitial}>
                        {(passenger.passenger_name || 'P').charAt(0).toUpperCase()}
                      </Text>
                    )}
                  </View>
                  <View style={styles.passengerInfo}>
                    <Text style={styles.passengerName}>{passenger.passenger_name || 'Passenger'}</Text>
                    <Text style={styles.passengerPhone}>{passenger.passenger_phone}</Text>
                    <Text style={styles.passengerSeats}>
                      <Ionicons name="person" size={12} color={Colors.primary} /> {actualSeats} seat(s)
                      {passenger.modification_request?.status === 'approved' && 
                        ` (Updated from ${passenger.modification_request.current_seats})`}
                    </Text>
                    
                    {/* Pickup Location */}
                    {passenger.pickup_address && (
                      <View style={styles.passengerLocation}>
                        <Ionicons name="location" size={10} color="#10B981" />
                        <Text style={styles.passengerLocationText} numberOfLines={1}>
                          Pickup: {passenger.pickup_address}
                        </Text>
                      </View>
                    )}
                    
                    {/* Dropoff Location */}
                    {passenger.dropoff_address && (
                      <View style={styles.passengerLocation}>
                        <Ionicons name="flag" size={10} color="#EF4444" />
                        <Text style={styles.passengerLocationText} numberOfLines={1}>
                          Dropoff: {passenger.dropoff_address}
                        </Text>
                      </View>
                    )}
                    
                    {passengerStatus && (
                      <View style={[styles.modificationBadge, passengerStatus.color === '#10B981' && styles.modificationApprovedBadge]}>
                        <Ionicons name={passengerStatus.icon} size={10} color={passengerStatus.color} />
                        <Text style={[styles.modificationBadgeText, { color: passengerStatus.color }]}>
                          {passengerStatus.text}
                        </Text>
                      </View>
                    )}
                  </View>
                </View>
              );
            })}
          </View>
        )}

        {/* No Passengers Message */}
        {passengers.length === 0 && (
          <View style={styles.card}>
            <View style={styles.noPassengersContainer}>
              <Ionicons name="people-outline" size={48} color="#D1D5DB" />
              <Text style={styles.noPassengersText}>No confirmed passengers yet</Text>
              <Text style={styles.noPassengersSubtext}>
                You can still start the ride. Passengers may join during the journey.
              </Text>
            </View>
          </View>
        )}

        {/* Important Notes */}
        <View style={styles.tipCard}>
          <Text style={styles.tipCardTitle}>Once you start the ride, you'll be able to:</Text>
          <View style={styles.tipList}>
            <View style={styles.tipItem}>
              <Ionicons name="checkmark-circle" size={16} color="#10B981" />
              <Text style={styles.tipText}>Mark passengers as boarded</Text>
            </View>
            <View style={styles.tipItem}>
              <Ionicons name="checkmark-circle" size={16} color="#10B981" />
              <Text style={styles.tipText}>Track the journey live</Text>
            </View>
            <View style={styles.tipItem}>
              <Ionicons name="checkmark-circle" size={16} color="#10B981" />
              <Text style={styles.tipText}>Share your live location with passengers</Text>
            </View>
            <View style={styles.tipItem}>
              <Ionicons name="checkmark-circle" size={16} color="#10B981" />
              <Text style={styles.tipText}>Get SOS support in emergencies</Text>
            </View>
          </View>
        </View>
      </ScrollView>

      {/* Slide to Start Button with bottom safe area */}
      <View style={[styles.footer, { paddingBottom: insets.bottom > 0 ? insets.bottom : 12 }]}>
        {canStartNow ? (
          <View style={styles.sliderContainer}>
            <Animated.View 
              style={[
                styles.sliderTrack,
                { width: SLIDER_WIDTH }
              ]}
            >
              {/* Progress fill */}
              <Animated.View 
                style={[
                  styles.sliderProgressFill,
                  { width: sliderProgress }
                ]} 
              />
              
              {/* Slider Button */}
              <Animated.View
                {...panResponder.panHandlers}
                style={[
                  styles.sliderButton,
                  {
                    transform: [{ translateX: pan.x }],
                  },
                  loading && styles.sliderButtonDisabled
                ]}
              >
                {loading ? (
                  <ActivityIndicator size="small" color={Colors.primary} />
                ) : (
                  <Ionicons name="arrow-forward" size={28} color={Colors.primary} />
                )}
              </Animated.View>
              
              {/* Slider Text */}
              <Text style={styles.sliderText}>
                {loading ? 'Starting ride...' : 'Slide to start ride'}
              </Text>
            </Animated.View>
          </View>
        ) : (
          <TouchableOpacity
            style={[
              styles.startButton, 
              styles.startButtonDisabled
            ]}
            activeOpacity={0.8}
            disabled={true}
          >
            <Ionicons name="lock-closed" size={22} color="#fff" style={styles.startIcon} />
            <Text style={styles.startButtonText}>
              {timeStatus.minutesToDeparture > 15 
                ? `Available in ${timeStatus.minutesToDeparture - 15} min`
                : timeStatus.hoursSinceDeparture > 2 
                ? 'Ride Expired'
                : 'Cannot Start Yet'}
            </Text>
          </TouchableOpacity>
        )}
        
        {!canStartNow && !loading && timeStatus.minutesToDeparture > 15 && (
          <Text style={styles.disabledHint}>
            You can start the ride 15 minutes before departure time (in {timeStatus.minutesToDeparture - 15} minutes)
          </Text>
        )}
        
        {!canStartNow && !loading && timeStatus.hoursSinceDeparture > 2 && (
          <Text style={[styles.disabledHint, { color: '#DC2626' }]}>
            This ride has expired (auto-cancelled after 2 hours)
          </Text>
        )}
      </View>
    </SafeAreaView>
  );
}

// Helper function for image URL
const buildImageUrl = (url) => {
  if (!url) return null;
  if (url.startsWith('http://') || url.startsWith('https://')) return url;
  return `${API_BASE_URL}${url.startsWith('/') ? url : `/${url}`}`;
};

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: Colors.white || '#F9FAFB' 
  },
  loadingContainer: { 
    flex: 1, 
    justifyContent: 'center', 
    alignItems: 'center' 
  },
  loadingText: { 
    marginTop: 12, 
    fontSize: 14, 
    color: '#6B7280' 
  },
  
  // Header Styles
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingBottom: 12,
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
    ...Typography.h2,
    fontSize: 28,
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
  
  content: { 
    padding: 16,
  },
  
  // Driver Status Card
  driverStatusCard: {
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
  },
  driverStatusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  driverStatusTextContainer: {
    flex: 1,
  },
  driverStatusLabel: {
    fontSize: 12,
    color: '#6B7280',
    marginBottom: 2,
  },
  driverStatusValue: {
    fontSize: 16,
    fontWeight: '700',
  },
  
  // Status Card
  statusCard: {
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  statusText: {
    flex: 1,
    fontSize: 14,
    fontWeight: '600',
    lineHeight: 20,
  },
  
  card: {
    backgroundColor: Colors.white,
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  cardTitle: { 
    fontSize: 16, 
    fontWeight: '700', 
    color: '#111827', 
    marginBottom: 12 
  },
  
  routeItem: { 
    flexDirection: 'row', 
    marginBottom: 16 
  },
  routeDotContainer: { 
    alignItems: 'center', 
    marginRight: 12, 
    width: 20 
  },
  routeDot: { 
    width: 10, 
    height: 10, 
    borderRadius: 5 
  },
  routeLine: { 
    width: 2, 
    height: 30, 
    backgroundColor: '#E5E7EB', 
    marginVertical: 4 
  },
  routeTextContainer: { 
    flex: 1, 
    justifyContent: 'space-between' 
  },
  routeLocation: { 
    fontSize: 15, 
    fontWeight: '600', 
    color: '#111827', 
    marginBottom: 16 
  },
  infoRow: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    paddingTop: 12, 
    borderTopWidth: 0.5, 
    borderTopColor: '#E5E7EB',
    flexWrap: 'wrap',
    gap: 6,
  },
  infoText: { 
    fontSize: 14, 
    color: '#6B7280', 
    marginLeft: 6 
  },
  
  infoGrid: { 
    flexDirection: 'row', 
    gap: 12,
    flexWrap: 'wrap',
  },
  infoGridItem: { 
    flex: 1,
    minWidth: 100,
    alignItems: 'center', 
    backgroundColor: '#F9FAFB', 
    borderRadius: 12, 
    padding: 12 
  },
  infoGridLabel: { 
    fontSize: 12, 
    color: '#6B7280', 
    marginTop: 6 
  },
  infoGridValue: { 
    fontSize: 14, 
    fontWeight: '700', 
    color: '#111827', 
    marginTop: 2 
  },
  
  passengerItem: { 
    flexDirection: 'row', 
    alignItems: 'flex-start', 
    marginBottom: 12, 
    paddingVertical: 8,
    borderBottomWidth: 0.5,
    borderBottomColor: '#E5E7EB',
  },
  lastPassengerItem: {
    borderBottomWidth: 0,
    marginBottom: 0,
  },
  passengerAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#E8EEF9',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
    overflow: 'hidden',
  },
  passengerAvatarImage: {
    width: 48,
    height: 48,
    borderRadius: 24,
  },
  passengerInitial: { 
    fontSize: 18, 
    fontWeight: '700', 
    color: Colors.primary 
  },
  passengerInfo: { 
    flex: 1 
  },
  passengerName: { 
    fontSize: 15, 
    fontWeight: '600', 
    color: '#111827' 
  },
  passengerPhone: { 
    fontSize: 12, 
    color: '#6B7280', 
    marginTop: 2 
  },
  passengerSeats: { 
    fontSize: 12, 
    color: Colors.primary, 
    marginTop: 2,
    flexDirection: 'row',
    alignItems: 'center',
  },
  passengerLocation: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 3,
  },
  passengerLocationText: {
    fontSize: 10,
    color: '#6B7280',
    flex: 1,
  },
  modificationBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFBEB',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginTop: 6,
    gap: 4,
    alignSelf: 'flex-start',
  },
  modificationApprovedBadge: {
    backgroundColor: '#E8F5E9',
  },
  modificationBadgeText: {
    fontSize: 10,
    fontWeight: '500',
  },
  
  noPassengersContainer: {
    alignItems: 'center',
    paddingVertical: 20,
    gap: 8,
  },
  noPassengersText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6B7280',
  },
  noPassengersSubtext: {
    fontSize: 12,
    color: '#9CA3AF',
    textAlign: 'center',
  },
  
  warningCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEF2F2',
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
    gap: 8,
    borderWidth: 1,
    borderColor: '#FEE2E2',
  },
  warningText: { 
    flex: 1, 
    fontSize: 12, 
    lineHeight: 16,
    fontWeight: '500',
  },
  
  tipCard: {
    backgroundColor: '#F0FDF4',
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
  },
  tipCardTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: '#166534',
    marginBottom: 8,
  },
  tipList: {
    gap: 6,
  },
  tipItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  tipText: {
    fontSize: 12,
    color: '#166534',
  },
  
  lateWarningCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEF2F2',
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
    gap: 8,
    borderWidth: 1,
    borderColor: '#FEE2E2',
  },
  lateWarningText: {
    flex: 1,
    fontSize: 12,
    color: '#DC2626',
    fontWeight: '600',
  },
  
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: Colors.white,
    borderTopWidth: 0.5,
    borderTopColor: '#E5E7EB',
  },
  
  // Slider Styles
  sliderContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  sliderTrack: {
    height: 56,
    backgroundColor: '#E5E7EB',
    borderRadius: 28,
    justifyContent: 'center',
    overflow: 'hidden',
    position: 'relative',
  },
  sliderProgressFill: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    backgroundColor: Colors.primary,
    borderRadius: 28,
  },
  sliderButton: {
    position: 'absolute',
    left: 4,
    top: 4,
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: Colors.white,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
    zIndex: 10,
  },
  sliderButtonDisabled: {
    opacity: 0.7,
  },
  sliderText: {
    position: 'absolute',
    left: 0,
    right: 0,
    textAlign: 'center',
    fontSize: 16,
    fontWeight: '600',
    color: '#6B7280',
    letterSpacing: 0.5,
  },
  
  startButton: {
    backgroundColor: Colors.primary,
    borderRadius: 30,
    paddingVertical: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
  },
  startButtonDisabled: { 
    opacity: 0.5 
  },
  startIcon: { 
    opacity: 0.9 
  },
  startButtonText: { 
    color: Colors.white, 
    fontSize: 16, 
    fontWeight: '700', 
    letterSpacing: 1 
  },
  disabledHint: {
    textAlign: 'center',
    fontSize: 11,
    color: '#6B7280',
    marginTop: 8,
  },
});