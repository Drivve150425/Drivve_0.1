// import React, { useState, useEffect } from 'react';
// import {
//   View,
//   Text,
//   ScrollView,
//   TouchableOpacity,
//   Platform,
//   StyleSheet,
//   StatusBar
// } from 'react-native';
// import { SafeAreaView } from 'react-native-safe-area-context';
// import { Ionicons, MaterialIcons } from '@expo/vector-icons';
// import LottieView from "lottie-react-native";
// import { Colors, Typography } from '../../constants/Colors';
// import Step1 from './Step1';
// import Step2 from './Step2';
// import Step3 from './Step3';
// import Step4 from './Step4';
// import CustomAlert from '../../components/CustomAlert';
// import axios from 'axios';
// import { useAuth } from '../../context/AuthContext';

// import { API_BASE_URL } from "../../config/config_ip";

// export default function DriveNextScreen({ navigation, route }) {
//   // ✅ Use AuthContext for session management
//   const { user } = useAuth();

//   // ✅ Get phone from route params or AuthContext
//   const phoneFromRoute = route?.params?.phoneNumber || null;
//   const phoneFromAuth = user?.phone_number || user?.phoneNumber || user?.phone || null;
//   const phoneNumber = phoneFromRoute || phoneFromAuth || 
//     navigation?.getState()?.routes
//       ?.find(r => r.params?.phoneNumber)
//       ?.params?.phoneNumber || null;
  
//   const userId = user?.id || route?.params?.userId || null;
//   const userData = user || route?.params?.userData || null;
  
//   // Edit mode support
//   const { rideData, isEdit, rideId } = route?.params || {};
//   const { 
//     from: initFrom, 
//     to: initTo, 
//     dateTime: initDateTime, 
//     seatsAvailable: initSeatsAvailable,
//     pricePerSeat: initPricePerSeat,
//     vehicleId: initVehicleId,
//     originCoords: initOriginCoords,
//     destinationCoords: initDestinationCoords 
//   } = rideData || {};

//   const [step, setStep] = useState(1);
//   const [from, setFrom] = useState(initFrom || '');
//   const [to, setTo] = useState(initTo || '');
//   const [dateTime, setDateTime] = useState(initDateTime ? new Date(initDateTime) : new Date());
//   const [vehicleId, setVehicleId] = useState(initVehicleId || null);
//   const [maxSeats, setMaxSeats] = useState(4);

//   const [routeOptions, setRouteOptions] = useState([]);
//   const [selectedRouteIndex, setSelectedRouteIndex] = useState(0);

//   const selectedRoute = routeOptions?.[selectedRouteIndex];

//   const [prefs, setPrefs] = useState({ womenOnly: false, instantBooking: true, luggage: true, smoking: false, pets: false });

//   const [seatsAvailable, setSeatsAvailable] = useState(initSeatsAvailable || 1);
//   const [pricePerSeat, setPricePerSeat] = useState(initPricePerSeat ? initPricePerSeat.toString() : '');

//   const [fromCoords, setFromCoords] = useState(initOriginCoords || null);
//   const [toCoords, setToCoords] = useState(initDestinationCoords || null);

//   const [routeData, setRouteData] = useState(null);
//   const [loadingRoute, setLoadingRoute] = useState(false);
//   const [submitting, setSubmitting] = useState(false);
//   const [routeFetchAttempted, setRouteFetchAttempted] = useState(false);

//   // Custom Alert states
//   const [alertVisible, setAlertVisible] = useState(false);
//   const [alertConfig, setAlertConfig] = useState({
//     title: "",
//     message: "",
//     icon: "check-circle",
//     iconColor: "#10B981",
//     buttons: []
//   });

//   const showCustomAlert = (title, message, type = 'success', onConfirm = null, onCancel = null) => {
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
//       iconColor = Colors.primary;
//     }
    
//     const buttons = [];
    
//     if (onCancel) {
//       buttons.push({ 
//         text: 'Cancel', 
//         onPress: () => {
//           setAlertVisible(false);
//           if (onCancel) onCancel();
//         }, 
//         style: 'cancel' 
//       });
//     }
    
//     if (onConfirm) {
//       buttons.push({ 
//         text: 'Edit Ride', 
//         onPress: () => {
//           setAlertVisible(false);
//           if (onConfirm) onConfirm();
//         }
//       });
//     } else {
//       buttons.push({ text: 'OK', onPress: () => setAlertVisible(false) });
//     }
    
//     setAlertConfig({
//       title,
//       message,
//       icon,
//       iconColor,
//       buttons
//     });
//     setAlertVisible(true);
//   };

//   useEffect(() => {
//     if (route.params?.selectedLocation) {
//       const { selectedLocation, type } = route.params;

//       if (type === 'from') {
//         setFrom(selectedLocation.label || selectedLocation.name);
//       } else {
//         setTo(selectedLocation.label);
//       }
//     }
//   }, [route.params?.selectedLocation]);

//   useEffect(() => {
//     const fetchRoute = async () => {
//       // Check if coordinates exist
//       if (!fromCoords || !toCoords) {
//           setRouteOptions([]);
//         console.log("⛔ Missing coordinates - fromCoords:", fromCoords, "toCoords:", toCoords);
        
//         // Don't show error if this is the initial state (no coordinates selected yet)
//         if (from && to && !fromCoords && !toCoords) {
//           console.log("Locations selected but coordinates missing - need to select from map");
//         }
//         return;
//       }

//       // Prevent multiple fetch attempts
//       if (routeFetchAttempted && routeOptions.length > 0) {
//         console.log("Route already fetched, skipping...");
//         return;
//       }
//       const sameLocation =
//   Math.abs(fromCoords.latitude - toCoords.latitude) < 0.0001 &&
//   Math.abs(fromCoords.longitude - toCoords.longitude) < 0.0001;

// if (sameLocation) {
//   setRouteOptions([]);
//   return;
// }

//       try {
//         setLoadingRoute(true);
//         setRouteFetchAttempted(true);

//         // Log the request payload for debugging
//         const requestPayload = {
//           from_coords: [fromCoords.longitude, fromCoords.latitude],
//           to_coords: [toCoords.longitude, toCoords.latitude]
//         };
//         console.log("📤 Fetching route with payload:", JSON.stringify(requestPayload, null, 2));
//         console.log("🌐 API URL:", `${API_BASE_URL}/get-route`);

//         const response = await axios.post(
//           `${API_BASE_URL}/get-route`,
//           requestPayload,
//           {
//             timeout: 30000, // 30 second timeout
//             headers: {
//               'Content-Type': 'application/json',
//               'Accept': 'application/json'
//             }
//           }
//         );

//         console.log("📥 Route API response status:", response.status);
//         console.log("📥 Route API response data keys:", Object.keys(response.data));

//         const routesFromAPI = response.data.routes;

//         if (!routesFromAPI || routesFromAPI.length === 0) {
//           throw new Error("No routes found from API");
//         }

//         const formattedRoutes = routesFromAPI.map((route, index) => ({
//           id: index,
//           geometry: route.coordinates.map(coord => ({
//             latitude: coord[1],
//             longitude: coord[0]
//           })),
//           distance: route.distance_km,
//           duration: route.duration,
//           price: route.price
//         }));

//         console.log("✅ Routes formatted successfully:", formattedRoutes.length, "routes found");
//         setRouteOptions(formattedRoutes);
//         setSelectedRouteIndex(0);

//       } catch (error) {
//         console.log('❌ Route fetch error details:');
        
//         if (error.response) {
//           console.log("Response status:", error.response.status);
//           console.log("Response data:", JSON.stringify(error.response.data, null, 2));
//           console.log("Response headers:", error.response.headers);
          
//           let errorMessage = "Failed to fetch route. ";
//           if (error.response.status === 404) {
//             errorMessage += "Route API endpoint not found. Please check backend.";
//           } else if (error.response.status === 500) {
//             errorMessage += "Server error. Please try again later.";
//           } else if (error.response.data?.message) {
//             errorMessage += error.response.data.message;
//           } else {
//             errorMessage += "Please check your connection and try again.";
//           }
          
//           showCustomAlert("Route Error", errorMessage, "error");
//         } else if (error.request) {
//           console.log("No response received from server");
//           console.log("Error request:", error.request);
//           showCustomAlert("Connection Error", "Cannot connect to server. Please check your internet connection.", "error");
//         } else {
//           console.log("Error message:", error.message);
//           showCustomAlert("Error", error.message || "Failed to fetch route. Please try again.", "error");
//         }
//       } finally {
//         setLoadingRoute(false);
//       }
//     };

//     fetchRoute();
//   }, [fromCoords, toCoords]);

//   const goNext = () => setStep(s => Math.min(4, s + 1));
//   const goBack = () => { if (step > 1) setStep(s => s - 1); else navigation.goBack(); };

//   const handleSubmitRide = async ({ seatsAvailable, pricePerSeat }) => {
//     if (!phoneNumber) {
//       showCustomAlert("Missing Info", "Phone number not found. Please login again.", "warning");
//       return;
//     }

//     // Validate route coordinates
//     if (!fromCoords || !toCoords) {
//       showCustomAlert("Missing Location", "Please select both pickup and destination locations.", "warning");
//       return;
//     }

//     setSubmitting(true);
    
//     try {
//       // ✅ Check for duplicate rides (only for new rides, not edit mode)
//       if (!isEdit) {
//         console.log("🔍 Checking for duplicate rides...");
        
//         const duplicateCheckResponse = await axios.get(
//           `${API_BASE_URL}/check-duplicate-ride`,
//           {
//             params: {
//               phone_number: phoneNumber,
//               origin_lng: fromCoords.longitude,
//               origin_lat: fromCoords.latitude,
//               destination_lng: toCoords.longitude,
//               destination_lat: toCoords.latitude,
//               departure_time: new Date(dateTime).toISOString(),
//               vehicle_id: vehicleId
//             }
//           }
//         );
        
//         if (duplicateCheckResponse.data.has_duplicate) {
//           const duplicate = duplicateCheckResponse.data;
          
//           if (duplicate.status === "active" || duplicate.status === "full") {
//             let alertMessage = `${duplicate.message}\n\n`;
            
//             if (duplicate.available_seats === 0) {
//               alertMessage += `❌ This ride is already full. No seats available.\n\n`;
//               alertMessage += `You cannot post another ride for the same route and time.`;
//               showCustomAlert("Ride Full", alertMessage, "warning");
//               setSubmitting(false);
//               return;
//             } else {
//               alertMessage += `✅ ${duplicate.available_seats} seats still available.\n\n`;
//               alertMessage += `Would you like to edit your existing ride instead of creating a new one?`;
              
//               showCustomAlert(
//                 "Duplicate Ride Found", 
//                 alertMessage, 
//                 "info",
//                 () => {
//                   // Navigate to edit the existing ride
//                   setSubmitting(false);
//                   navigation.replace("DriveNextScreen", {
//                     isEdit: true,
//                     rideId: duplicate.ride_id,
//                     rideData: {
//                       from: from,
//                       to: to,
//                       dateTime: dateTime,
//                       seatsAvailable: duplicate.available_seats,
//                       pricePerSeat: pricePerSeat,
//                       vehicleId: vehicleId,
//                       originCoords: fromCoords,
//                       destinationCoords: toCoords
//                     }
//                   });
//                 },
//                 () => {
//                   // Cancel - stay on current screen
//                   setSubmitting(false);
//                 }
//               );
//               return;
//             }
//           } else if (duplicate.status === "completed") {
//             showCustomAlert(
//               "Ride Completed", 
//               `You have already completed a ride on this route.\n\nYou can post a new ride for a different time.`,
//               "info"
//             );
//             setSubmitting(false);
//             return;
//           }
//         }
//       }
      
//       // ✅ Proceed with posting/updating the ride
//       console.log("✅ No duplicate found or proceeding with edit...");
      
//       const payload = {
//         phone_number: phoneNumber,
//         origin: from,
//         destination: to,
//         departure_time: new Date(dateTime).toISOString(),
//         available_seats: seatsAvailable,
//         price_per_seat: Number(pricePerSeat),
//         vehicle_id: vehicleId,
//         origin_coords: [fromCoords.longitude, fromCoords.latitude],
//         destination_coords: [toCoords.longitude, toCoords.latitude],
//         route_coordinates: selectedRoute?.geometry.map((p) => [p.longitude, p.latitude]) || [],
//         distance_km: selectedRoute?.distance,
//         duration_text: selectedRoute?.duration,
//         total_estimated_price: selectedRoute?.price,
//         preferences: prefs,
//       };
      
//       let response;
//       if (isEdit && rideId) {
//         response = await axios.put(
//           `${API_BASE_URL}/update-ride/${rideId}`,
//           payload
//         );
//         console.log('Ride Updated:', response.data);
//         // showCustomAlert("Success", "Ride updated successfully!", "success");
//       } else {
//         response = await axios.post(
//           `${API_BASE_URL}/post-ride`,
//           payload
//         );
//         console.log('Ride Created:', response.data);
//         // showCustomAlert("Success", "Ride posted successfully!", "success");
//       }
      
//       setSubmitting(false);
      
//       // Navigate to home after success
//       setTimeout(() => {
//         navigation.reset({
//           index: 0,
//           routes: [{ name: "Home", params: { phoneNumber, userData, userId } }],
//         });
//       }, 1500);
      
//     } catch (error) {
//       console.log("STATUS:", error.response?.status);
//       console.log("DATA:", JSON.stringify(error.response?.data, null, 2));
//       console.log("MESSAGE:", error.message);
      
//       let errorMsg = error.response?.data?.detail || 
//                     error.response?.data?.message || 
//                     error.message || 
//                     `Failed to ${isEdit ? 'update' : 'post'} ride.`;
      
//       // Handle specific errors
//       if (error.response?.status === 400) {
//         if (errorMsg.includes("active ride with this vehicle")) {
//           errorMsg = "You already have an active ride with this vehicle. Please complete or cancel it before posting a new one.";
//         } else if (errorMsg.includes("No seats available")) {
//           errorMsg = "This ride is already full. Cannot add more seats.";
//         }
//       }
      
//       showCustomAlert("Error", errorMsg, "error");
//       setSubmitting(false);
//     }
//   };

//   // Show loading animation while fetching route
//   if (loadingRoute) {
//     return (
//       <SafeAreaView style={styles.container}>
//         <StatusBar backgroundColor={Colors.white} barStyle="dark-content" />
//         <View style={styles.loaderContainer}>
//           <LottieView
//             source={require("../../assets/loading.json")}
//             autoPlay
//             loop
//             style={{ width: 300, height: 300 }}
//           />
//         </View>
//       </SafeAreaView>
//     );
//   }

//   return (
//     <SafeAreaView style={styles.container}>
//       <StatusBar backgroundColor={Colors.white} barStyle="dark-content" />
      
//       {/* Header - Matching SavedAddressesScreen style */}
//       <View style={styles.header}>
//         <TouchableOpacity 
//           style={styles.backButton} 
//           onPress={goBack}
//         >
//           <MaterialIcons name="arrow-back-ios" size={24} color="#ED7117" />
//         </TouchableOpacity>
        
//         <Text style={styles.headerTitle}>
//           {isEdit ? 'Edit Ride' : 'Offer a Ride'}
//         </Text>
        
//         <View style={styles.headerSpacer} />
//       </View>

//       {/* Progress Steps */}
//       <View style={styles.progressContainer}>
//         {[1, 2, 3, 4].map((n) => (
//           <View 
//             key={n} 
//             style={[
//               styles.progressBar, 
//               { backgroundColor: n === step ? Colors.primary : '#e6eef8' }
//             ]} 
//           />
//         ))}
//       </View>

//       <ScrollView 
//         style={styles.scrollView} 
//         contentContainerStyle={styles.scrollContent}
//         showsVerticalScrollIndicator={false}
//       >
//         {step === 1 && (
//           <Step1 
//             from={from} 
//             to={to} 
//             setFrom={setFrom} 
//             setTo={setTo} 
//             setFromCoords={setFromCoords} 
//             setToCoords={setToCoords} 
//             dateTime={dateTime} 
//             setDateTime={setDateTime} 
//             onNext={goNext} 
//             navigation={navigation} 
//             route={route} 
//             phoneNumber={phoneNumber} 
//             fromCoords={fromCoords} 
//             toCoords={toCoords} 
//             setRouteOptions={setRouteOptions}
//             setSelectedRouteIndex={setSelectedRouteIndex}
//           />
//         )}
        
//         {step === 2 && (
//           <Step2 
//             routeOptions={routeOptions} 
//             selectedRouteIndex={selectedRouteIndex} 
//             setSelectedRouteIndex={setSelectedRouteIndex} 
//             onNext={goNext} 
//           />
//         )}
        
//         {step === 3 && (
//           <Step3 
//             phoneNumber={phoneNumber} 
//             navigation={navigation} 
//             vehicleId={vehicleId} 
//             setVehicleId={setVehicleId} 
//             onNext={({ preferences, vehicleId: selectedVehicleId, maxSeats: vehicleMaxSeats }) => { 
//               setPrefs(preferences || {}); 
//               setVehicleId(selectedVehicleId); 
//               setMaxSeats(vehicleMaxSeats || 4); 
//               goNext(); 
//             }} 
//           />
//         )}
        
//         {step === 4 && (
//           <Step4 
//             seatsAvailable={seatsAvailable} 
//             setSeatsAvailable={setSeatsAvailable} 
//             pricePerSeat={pricePerSeat} 
//             setPricePerSeat={setPricePerSeat} 
//             selectedRoute={selectedRoute} 
//             vehicleId={vehicleId} 
//             maxSeats={maxSeats} 
//             onPost={handleSubmitRide} 
//             isEdit={isEdit} 
//             navigation={navigation}
//             phoneNumber={phoneNumber}
//             userData={userData}
//             userId={userId}
//           />
//         )}
//       </ScrollView>

//       {/* Custom Alert */}
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
//     backgroundColor: Colors.white,
//   },
//   header: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     paddingHorizontal: 16,
//     paddingVertical: 12,
//     borderBottomWidth: 0.5,
//     borderBottomColor: '#F3F4F6',
//   },
//   backButton: {
//     width: 44,
//     height: 44,
//     justifyContent: 'center',
//   },
//   headerTitle: {
//     ...Typography.h2,
//     fontSize: 28,
//     fontWeight: '700',
//     color: Colors.primary,
//     flex: 1,
//     textAlign: 'center',
//   },
//   headerSpacer: {
//     width: 44,
//   },
//   progressContainer: {
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//     paddingHorizontal: 24,
//     paddingVertical: 12,
//   },
//   progressBar: {
//     height: 6,
//     flex: 1,
//     marginHorizontal: 6,
//     borderRadius: 4,
//   },
//   scrollView: {
//     flex: 1,
//   },
//   scrollContent: {
//     padding: 16,
//     paddingBottom: 20,
//   },
//   loaderContainer: {
//     flex: 1,
//     justifyContent: 'center',
//     alignItems: 'center',
//     backgroundColor: Colors.white,
//   },
//   loaderText: {
//     marginTop: 20,
//     fontSize: 16,
//     color: Colors.primary,
//     fontWeight: '500',
//   },
// });
// DriveNextScreen.js - Complete updated version
// import React, { useState, useEffect } from 'react';
// import {
//   View,
//   Text,
//   ScrollView,
//   TouchableOpacity,
//   Platform,
//   StyleSheet,
//   StatusBar
// } from 'react-native';
// import { SafeAreaView } from 'react-native-safe-area-context';
// import { Ionicons, MaterialIcons } from '@expo/vector-icons';
// import LottieView from "lottie-react-native";
// import { Colors, Typography } from '../../constants/Colors';
// import Step1 from './Step1';
// import Step2 from './Step2';
// import Step3 from './Step3';
// import Step4 from './Step4';
// import CustomAlert from '../../components/CustomAlert';
// import axios from 'axios';
// import { useAuth } from '../../context/AuthContext';
// import { API_BASE_URL } from "../../config/config_ip";

// export default function DriveNextScreen({ navigation, route }) {
//   const { user } = useAuth();
  
//   const phoneFromRoute = route?.params?.phoneNumber || null;
//   const phoneFromAuth = user?.phone_number || user?.phoneNumber || user?.phone || null;
//   const phoneNumber = phoneFromRoute || phoneFromAuth || 
//     navigation?.getState()?.routes
//       ?.find(r => r.params?.phoneNumber)
//       ?.params?.phoneNumber || null;
  
//   const userId = user?.id || route?.params?.userId || null;
//   const userData = user || route?.params?.userData || null;
//   const userGender = user?.gender || route?.params?.gender || null;
  
//   const { rideData, isEdit, rideId } = route?.params || {};
//   const { 
//     from: initFrom, 
//     to: initTo, 
//     dateTime: initDateTime, 
//     seatsAvailable: initSeatsAvailable,
//     pricePerSeat: initPricePerSeat,
//     vehicleId: initVehicleId,
//     originCoords: initOriginCoords,
//     destinationCoords: initDestinationCoords 
//   } = rideData || {};

//   const [step, setStep] = useState(1);
//   const [from, setFrom] = useState(initFrom || '');
//   const [to, setTo] = useState(initTo || '');
//   const [dateTime, setDateTime] = useState(initDateTime ? new Date(initDateTime) : new Date());
//   const [vehicleId, setVehicleId] = useState(initVehicleId || null);
//   const [maxSeats, setMaxSeats] = useState(4);
//   const [routeOptions, setRouteOptions] = useState([]);
//   const [selectedRouteIndex, setSelectedRouteIndex] = useState(0);
//   const selectedRoute = routeOptions?.[selectedRouteIndex];
  
//   const [prefs, setPrefs] = useState({ 
//     womenOnly: false, 
//     instantBooking: true, 
//     luggage: true, 
//     smoking: false, 
//     pets: false 
//   });
  
//   const [seatsAvailable, setSeatsAvailable] = useState(initSeatsAvailable || 1);
//   const [pricePerSeat, setPricePerSeat] = useState(initPricePerSeat ? initPricePerSeat.toString() : '');
//   const [fromCoords, setFromCoords] = useState(initOriginCoords || null);
//   const [toCoords, setToCoords] = useState(initDestinationCoords || null);
//   const [loadingRoute, setLoadingRoute] = useState(false);
//   const [submitting, setSubmitting] = useState(false);
//   const [routeFetchAttempted, setRouteFetchAttempted] = useState(false);
//   const [rideBookings, setRideBookings] = useState(null);
//   const [lockedFields, setLockedFields] = useState([]);
//   const [originalRideData, setOriginalRideData] = useState(null);

//   const [alertVisible, setAlertVisible] = useState(false);
//   const [alertConfig, setAlertConfig] = useState({
//     title: "",
//     message: "",
//     icon: "check-circle",
//     iconColor: "#10B981",
//     buttons: []
//   });

//   const showCustomAlert = (title, message, type = 'success', onConfirm = null, onCancel = null) => {
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
//       iconColor = Colors.primary;
//     }
    
//     const buttons = [];
    
//     if (onCancel) {
//       buttons.push({ 
//         text: 'Cancel', 
//         onPress: () => {
//           setAlertVisible(false);
//           if (onCancel) onCancel();
//         }, 
//         style: 'cancel' 
//       });
//     }
    
//     if (onConfirm) {
//       buttons.push({ 
//         text: 'Edit Ride', 
//         onPress: () => {
//           setAlertVisible(false);
//           if (onConfirm) onConfirm();
//         }
//       });
//     } else {
//       buttons.push({ text: 'OK', onPress: () => setAlertVisible(false) });
//     }
    
//     setAlertConfig({
//       title,
//       message,
//       icon,
//       iconColor,
//       buttons
//     });
//     setAlertVisible(true);
//   };

//   // Load ride details if in edit mode
//   useEffect(() => {
//     if (isEdit && rideId) {
//       loadRideDetails();
//     }
//   }, [isEdit, rideId]);

//   const loadRideDetails = async () => {
//     try {
//       const response = await axios.get(`${API_BASE_URL}/ride/${rideId}/details`);
//       const rideDetails = response.data;
      
//       setRideBookings(rideDetails.bookings);
//       setOriginalRideData(rideDetails);
      
//       const hasConfirmedBookings = rideDetails.bookings?.some(b => b.status === 'accepted');
      
//       if (hasConfirmedBookings) {
//         const locked = ['origin', 'destination', 'route', 'price'];
//         if (rideDetails.bookings?.length > 0) {
//           locked.push('seats');
//         }
//         setLockedFields(locked);
//       }
//     } catch (error) {
//       console.log('Error loading ride details:', error);
//     }
//   };

//   // Check overlapping rides with time buffer
//   const checkOverlappingRides = async (departureTime, estimatedDuration) => {
//     try {
//       const response = await axios.get(`${API_BASE_URL}/check-overlapping-rides`, {
//         params: {
//           phone_number: phoneNumber,
//           departure_time: departureTime,
//           duration_minutes: estimatedDuration,
//           exclude_ride_id: isEdit ? rideId : null
//         }
//       });
//       return response.data;
//     } catch (error) {
//       console.log('Error checking overlapping rides:', error);
//       return { has_overlap: false };
//     }
//   };

//   // Validate distance between locations
//   const validateDistance = (fromCoord, toCoord) => {
//     const R = 6371; // Earth's radius in km
//     const dLat = (toCoord.latitude - fromCoord.latitude) * Math.PI / 180;
//     const dLon = (toCoord.longitude - fromCoord.longitude) * Math.PI / 180;
//     const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
//               Math.cos(fromCoord.latitude * Math.PI / 180) * Math.cos(toCoord.latitude * Math.PI / 180) *
//               Math.sin(dLon/2) * Math.sin(dLon/2);
//     const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
//     const distance = R * c;
    
//     const MIN_DISTANCE_KM = 3;
//     const MAX_DISTANCE_KM = 300;
    
//     if (distance < MIN_DISTANCE_KM) {
//       return { valid: false, message: `Pickup and destination are too close (${distance.toFixed(1)} km). Minimum distance is ${MIN_DISTANCE_KM} km.` };
//     }
//     if (distance > MAX_DISTANCE_KM) {
//       return { valid: false, message: `Distance too far (${distance.toFixed(1)} km). Maximum allowed is ${MAX_DISTANCE_KM} km for daily commutes.` };
//     }
//     return { valid: true, distance };
//   };

//   // Validate time (minimum 30 minutes from now)
//   const validateDateTime = (selectedDateTime) => {
//     const now = new Date();
//     const minTime = new Date(now.getTime() + 30 * 60000);
    
//     if (selectedDateTime < minTime) {
//       return { 
//         valid: false, 
//         message: `Departure time must be at least 30 minutes from now. Please select a later time.` 
//       };
//     }
//     return { valid: true };
//   };

//   useEffect(() => {
//     if (route.params?.selectedLocation) {
//       const { selectedLocation, type } = route.params;
//       if (type === 'from') {
//         setFrom(selectedLocation.label || selectedLocation.name);
//       } else {
//         setTo(selectedLocation.label);
//       }
//     }
//   }, [route.params?.selectedLocation]);

//   // Calculate distance between coordinates for overlap check
//   const calculateDistance = (lat1, lon1, lat2, lon2) => {
//     const R = 6371;
//     const dLat = (lat2 - lat1) * Math.PI / 180;
//     const dLon = (lon2 - lon1) * Math.PI / 180;
//     const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
//               Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
//               Math.sin(dLon/2) * Math.sin(dLon/2);
//     const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
//     return R * c;
//   };

//   useEffect(() => {
//     const fetchRoute = async () => {
//       if (!fromCoords || !toCoords) {
//         setRouteOptions([]);
//         return;
//       }

//       if (routeFetchAttempted && routeOptions.length > 0) {
//         return;
//       }
      
//       const sameLocation = Math.abs(fromCoords.latitude - toCoords.latitude) < 0.0001 &&
//         Math.abs(fromCoords.longitude - toCoords.longitude) < 0.0001;

//       if (sameLocation) {
//         setRouteOptions([]);
//         return;
//       }

//       // Validate distance before fetching route
//       const distanceValidation = validateDistance(fromCoords, toCoords);
//       if (!distanceValidation.valid) {
//         showCustomAlert("Invalid Route", distanceValidation.message, "warning");
//         setRouteOptions([]);
//         return;
//       }

//       try {
//         setLoadingRoute(true);
//         setRouteFetchAttempted(true);

//         const requestPayload = {
//           from_coords: [fromCoords.longitude, fromCoords.latitude],
//           to_coords: [toCoords.longitude, toCoords.latitude]
//         };

//         const response = await axios.post(`${API_BASE_URL}/get-route`, requestPayload, {
//           timeout: 30000,
//           headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' }
//         });

//         const routesFromAPI = response.data.routes;

//         if (!routesFromAPI || routesFromAPI.length === 0) {
//           throw new Error("No routes found from API");
//         }

//         const formattedRoutes = routesFromAPI.map((route, index) => ({
//           id: index,
//           geometry: route.coordinates.map(coord => ({
//             latitude: coord[1],
//             longitude: coord[0]
//           })),
//           distance: route.distance_km,
//           duration: route.duration,
//           price: route.price,
//           duration_minutes: parseDurationToMinutes(route.duration)
//         }));

//         setRouteOptions(formattedRoutes);
//         setSelectedRouteIndex(0);

//       } catch (error) {
//         console.log('❌ Route fetch error:', error);
//         showCustomAlert("Route Error", "Failed to fetch route. Please try again.", "error");
//       } finally {
//         setLoadingRoute(false);
//       }
//     };

//     fetchRoute();
//   }, [fromCoords, toCoords]);

//   const parseDurationToMinutes = (durationStr) => {
//     if (!durationStr) return 60;
//     let mins = 0;
//     const hrMatch = durationStr.match(/(\d+)\s*Hr/i);
//     const minMatch = durationStr.match(/(\d+)\s*Min/i);
//     if (hrMatch) mins += parseInt(hrMatch[1], 10) * 60;
//     if (minMatch) mins += parseInt(minMatch[1], 10);
//     return mins || 60;
//   };

//   const goNext = () => setStep(s => Math.min(4, s + 1));
//   const goBack = () => { if (step > 1) setStep(s => s - 1); else navigation.goBack(); };

//   const handleSubmitRide = async ({ seatsAvailable, pricePerSeat }) => {
//     if (!phoneNumber) {
//       showCustomAlert("Missing Info", "Phone number not found. Please login again.", "warning");
//       return;
//     }

//     if (!fromCoords || !toCoords) {
//       showCustomAlert("Missing Location", "Please select both pickup and destination locations.", "warning");
//       return;
//     }

//     // Validate time (minimum 30 minutes from now)
//     const timeValidation = validateDateTime(dateTime);
//     if (!timeValidation.valid) {
//       showCustomAlert("Invalid Time", timeValidation.message, "warning");
//       return;
//     }

//     // Validate distance
//     const distanceValidation = validateDistance(fromCoords, toCoords);
//     if (!distanceValidation.valid) {
//       showCustomAlert("Invalid Distance", distanceValidation.message, "warning");
//       return;
//     }

//     setSubmitting(true);
    
//     try {
//       // Check for overlapping rides (only for new rides)
//       if (!isEdit && selectedRoute) {
//         const overlapCheck = await checkOverlappingRides(
//           new Date(dateTime).toISOString(),
//           selectedRoute.duration_minutes || 60
//         );
        
//         if (overlapCheck.has_overlap) {
//           const overlappingRide = overlapCheck.overlapping_ride;
//           showCustomAlert(
//             "Overlapping Ride Detected",
//             `You already have a ride from ${overlappingRide.origin} to ${overlappingRide.destination} at ${new Date(overlappingRide.departure_time).toLocaleTimeString()}.\n\nPlease wait until ${new Date(overlappingRide.expected_end_time).toLocaleTimeString()} to post another ride.`,
//             "warning"
//           );
//           setSubmitting(false);
//           return;
//         }
//       }
      
//       // For edit mode, check if major fields are being modified
//       if (isEdit && originalRideData && lockedFields.length > 0) {
//         const hasMajorChanges = (
//           from !== originalRideData.origin ||
//           to !== originalRideData.destination ||
//           Math.abs(dateTime - new Date(originalRideData.departure_time)) > 10 * 60000 ||
//           Number(pricePerSeat) !== originalRideData.price_per_seat
//         );
        
//         if (hasMajorChanges) {
//           showCustomAlert(
//             "Cannot Modify Ride",
//             `This ride has ${rideBookings?.length || 0} confirmed booking(s). Major fields (Origin, Destination, Route, Fare) cannot be changed.\n\nPlease cancel this ride and create a new one if you need major changes.`,
//             "warning"
//           );
//           setSubmitting(false);
//           return;
//         }
//       }
      
//       const payload = {
//         phone_number: phoneNumber,
//         origin: from,
//         destination: to,
//         departure_time: new Date(dateTime).toISOString(),
//         available_seats: seatsAvailable,
//         price_per_seat: Number(pricePerSeat),
//         vehicle_id: vehicleId,
//         origin_coords: [fromCoords.longitude, fromCoords.latitude],
//         destination_coords: [toCoords.longitude, toCoords.latitude],
//         route_coordinates: selectedRoute?.geometry.map((p) => [p.longitude, p.latitude]) || [],
//         distance_km: selectedRoute?.distance,
//         duration_text: selectedRoute?.duration,
//         total_estimated_price: selectedRoute?.price,
//         preferences: { ...prefs, womenOnly: prefs.womenOnly },
//         women_only: prefs.womenOnly,
//         user_gender: userGender
//       };
      
//       let response;
//       if (isEdit && rideId) {
//         response = await axios.put(`${API_BASE_URL}/update-ride/${rideId}`, payload);
        
//         // If vehicle changed and has bookings, send notification
//         if (originalRideData?.vehicle_id !== vehicleId && rideBookings?.length > 0) {
//           await axios.post(`${API_BASE_URL}/notify-passengers`, {
//             ride_id: rideId,
//             notification_type: 'vehicle_changed',
//             old_vehicle: originalRideData?.vehicle,
//             new_vehicle: vehicleId
//           });
//         }
//       } else {
//         response = await axios.post(`${API_BASE_URL}/post-ride`, payload);
//       }
      
//       setSubmitting(false);
      
//       setTimeout(() => {
//         navigation.reset({
//           index: 0,
//           routes: [{ name: "Home", params: { phoneNumber, userData, userId } }],
//         });
//       }, 1500);
      
//     } catch (error) {
//       let errorMsg = error.response?.data?.detail || error.message;
      
//       if (error.response?.status === 409) {
//         errorMsg = "Time conflict: You have an overlapping active ride. Please wait for it to complete.";
//       } else if (error.response?.status === 403) {
//         errorMsg = "Cannot modify this ride as it has confirmed bookings.";
//       }
      
//       showCustomAlert("Error", errorMsg, "error");
//       setSubmitting(false);
//     }
//   };

//   if (loadingRoute) {
//     return (
//       <SafeAreaView style={styles.container}>
//         <StatusBar backgroundColor={Colors.white} barStyle="dark-content" />
//         <View style={styles.loaderContainer}>
//           <LottieView source={require("../../assets/loading.json")} autoPlay loop style={{ width: 300, height: 300 }} />
//         </View>
//       </SafeAreaView>
//     );
//   }

//   return (
//     <SafeAreaView style={styles.container}>
//       <StatusBar backgroundColor={Colors.white} barStyle="dark-content" />
      
//       <View style={styles.header}>
//         <TouchableOpacity style={styles.backButton} onPress={goBack}>
//           <MaterialIcons name="arrow-back-ios" size={24} color="#ED7117" />
//         </TouchableOpacity>
//         <Text style={styles.headerTitle}>{isEdit ? 'Edit Ride' : 'Offer a Ride'}</Text>
//         <View style={styles.headerSpacer} />
//       </View>

//       <View style={styles.progressContainer}>
//         {[1, 2, 3, 4].map((n) => (
//           <View key={n} style={[styles.progressBar, { backgroundColor: n === step ? Colors.primary : '#e6eef8' }]} />
//         ))}
//       </View>

//       <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
//         {step === 1 && (
//           <Step1 
//             from={from} to={to} setFrom={setFrom} setTo={setTo}
//             setFromCoords={setFromCoords} setToCoords={setToCoords}
//             dateTime={dateTime} setDateTime={setDateTime}
//             onNext={goNext} navigation={navigation} route={route}
//             phoneNumber={phoneNumber} fromCoords={fromCoords} toCoords={toCoords}
//             setRouteOptions={setRouteOptions} setSelectedRouteIndex={setSelectedRouteIndex}
//             isEdit={isEdit} lockedFields={lockedFields}
//             validateDateTime={validateDateTime}
//           />
//         )}
        
//         {step === 2 && (
//           <Step2 
//             routeOptions={routeOptions} selectedRouteIndex={selectedRouteIndex}
//             setSelectedRouteIndex={setSelectedRouteIndex} onNext={goNext}
//             isEdit={isEdit} lockedFields={lockedFields}
//           />
//         )}
        
//         {step === 3 && (
//           <Step3 
//             phoneNumber={phoneNumber} navigation={navigation}
//             vehicleId={vehicleId} setVehicleId={setVehicleId}
//             onNext={({ preferences, vehicleId: selectedVehicleId, maxSeats: vehicleMaxSeats }) => { 
//               setPrefs(preferences || {}); 
//               setVehicleId(selectedVehicleId); 
//               setMaxSeats(vehicleMaxSeats || 4); 
//               goNext(); 
//             }}
//             isEdit={isEdit} lockedFields={lockedFields}
//             userGender={userGender}
//           />
//         )}
        
//         {step === 4 && (
//           <Step4 
//             seatsAvailable={seatsAvailable} setSeatsAvailable={setSeatsAvailable}
//             pricePerSeat={pricePerSeat} setPricePerSeat={setPricePerSeat}
//             selectedRoute={selectedRoute} vehicleId={vehicleId} maxSeats={maxSeats}
//             onPost={handleSubmitRide} isEdit={isEdit}
//             navigation={navigation} phoneNumber={phoneNumber}
//             userData={userData} userId={userId}
//             rideBookings={rideBookings} lockedFields={lockedFields}
//           />
//         )}
//       </ScrollView>

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
//   container: { flex: 1, backgroundColor: Colors.white },
//   header: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 12, borderBottomWidth: 0.5, borderBottomColor: '#F3F4F6' },
//   backButton: { width: 44, height: 44, justifyContent: 'center' },
//   headerTitle: { ...Typography.h2, fontSize: 28, fontWeight: '700', color: Colors.primary, flex: 1, textAlign: 'center' },
//   headerSpacer: { width: 44 },
//   progressContainer: { flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: 24, paddingVertical: 12 },
//   progressBar: { height: 6, flex: 1, marginHorizontal: 6, borderRadius: 4 },
//   scrollView: { flex: 1 },
//   scrollContent: { padding: 16, paddingBottom: 20 },
//   loaderContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: Colors.white },
// });
// import React, { useState, useEffect, useCallback } from 'react';
// import {
//   View,
//   Text,
//   ScrollView,
//   TouchableOpacity,
//   Platform,
//   StyleSheet,
//   StatusBar,
//   ActivityIndicator
// } from 'react-native';
// import { SafeAreaView } from 'react-native-safe-area-context';
// import { Ionicons, MaterialIcons } from '@expo/vector-icons';
// import LottieView from "lottie-react-native";
// import { Colors, Typography } from '../../constants/Colors';
// import Step1 from './Step1';
// import Step2 from './Step2';
// import Step3 from './Step3';
// import Step4 from './Step4';
// import CustomAlert from '../../components/CustomAlert';
// import axios from 'axios';
// import { useAuth } from '../../context/AuthContext';
// import { API_BASE_URL } from "../../config/config_ip";

// export default function DriveNextScreen({ navigation, route }) {
//   const { user } = useAuth();
  
//   const phoneFromRoute = route?.params?.phoneNumber || null;
//   const phoneFromAuth = user?.phone_number || user?.phoneNumber || user?.phone || null;
//   const phoneNumber = phoneFromRoute || phoneFromAuth || 
//     navigation?.getState()?.routes
//       ?.find(r => r.params?.phoneNumber)
//       ?.params?.phoneNumber || null;
  
//   const userId = user?.id || route?.params?.userId || null;
//   const userData = user || route?.params?.userData || null;
//   const userGender = user?.gender || route?.params?.gender || null;
  
//   const { rideData, isEdit, rideId } = route?.params || {};
//   const { 
//     from: initFrom, 
//     to: initTo, 
//     dateTime: initDateTime, 
//     seatsAvailable: initSeatsAvailable,
//     pricePerSeat: initPricePerSeat,
//     vehicleId: initVehicleId,
//     originCoords: initOriginCoords,
//     destinationCoords: initDestinationCoords 
//   } = rideData || {};

//   const [step, setStep] = useState(1);
//   const [from, setFrom] = useState(initFrom || '');
//   const [to, setTo] = useState(initTo || '');
//   const [dateTime, setDateTime] = useState(initDateTime ? new Date(initDateTime) : new Date());
//   const [vehicleId, setVehicleId] = useState(initVehicleId || null);
//   const [maxSeats, setMaxSeats] = useState(4);
//   const [routeOptions, setRouteOptions] = useState([]);
//   const [selectedRouteIndex, setSelectedRouteIndex] = useState(0);
//   const selectedRoute = routeOptions?.[selectedRouteIndex];
  
//   const [prefs, setPrefs] = useState({ 
//     womenOnly: false, 
//     instantBooking: true, 
//     luggage: true, 
//     smoking: false, 
//     pets: false 
//   });
  
//   const [seatsAvailable, setSeatsAvailable] = useState(initSeatsAvailable || 1);
//   const [pricePerSeat, setPricePerSeat] = useState(initPricePerSeat ? initPricePerSeat.toString() : '');
//   const [fromCoords, setFromCoords] = useState(initOriginCoords ? 
//     (Array.isArray(initOriginCoords) ? { latitude: initOriginCoords[1], longitude: initOriginCoords[0] } : initOriginCoords) : null);
//   const [toCoords, setToCoords] = useState(initDestinationCoords ? 
//     (Array.isArray(initDestinationCoords) ? { latitude: initDestinationCoords[1], longitude: initDestinationCoords[0] } : initDestinationCoords) : null);
//   const [loadingRoute, setLoadingRoute] = useState(false);
//   const [submitting, setSubmitting] = useState(false);
//   const [routeFetchAttempted, setRouteFetchAttempted] = useState(false);
//   const [rideBookings, setRideBookings] = useState(null);
//   const [lockedFields, setLockedFields] = useState([]);
//   const [originalRideData, setOriginalRideData] = useState(null);
//   const [loadingRideDetails, setLoadingRideDetails] = useState(false);

//   const [alertVisible, setAlertVisible] = useState(false);
//   const [alertConfig, setAlertConfig] = useState({
//     title: "",
//     message: "",
//     icon: "check-circle",
//     iconColor: "#10B981",
//     buttons: []
//   });

//   const showCustomAlert = (title, message, type = 'success', onConfirm = null, onCancel = null) => {
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
//       iconColor = Colors.primary;
//     }
    
//     const buttons = [];
    
//     if (onCancel) {
//       buttons.push({ 
//         text: 'Cancel', 
//         onPress: () => {
//           setAlertVisible(false);
//           if (onCancel) onCancel();
//         }, 
//         style: 'cancel' 
//       });
//     }
    
//     if (onConfirm) {
//       buttons.push({ 
//         text: onConfirm.text || 'Confirm', 
//         onPress: () => {
//           setAlertVisible(false);
//           if (onConfirm.onPress) onConfirm.onPress();
//         }
//       });
//     } else {
//       buttons.push({ text: 'OK', onPress: () => setAlertVisible(false) });
//     }
    
//     setAlertConfig({
//       title,
//       message,
//       icon,
//       iconColor,
//       buttons
//     });
//     setAlertVisible(true);
//   };

//   // Load ride details if in edit mode
//   useEffect(() => {
//     if (isEdit && rideId) {
//       loadRideDetails();
//     }
//   }, [isEdit, rideId]);

//   const loadRideDetails = async () => {
//     setLoadingRideDetails(true);
//     try {
//       const response = await axios.get(`${API_BASE_URL}/ride/${rideId}/details`);
//       const rideDetails = response.data;
      
//       setRideBookings(rideDetails.bookings);
//       setOriginalRideData(rideDetails);
      
//       const hasConfirmedBookings = rideDetails.bookings?.some(b => b.status === 'accepted');
      
//       if (hasConfirmedBookings) {
//         const locked = ['origin', 'destination', 'route', 'price'];
//         if (rideDetails.bookings?.length > 0) {
//           locked.push('seats');
//         }
//         setLockedFields(locked);
//       }
//     } catch (error) {
//       console.log('Error loading ride details:', error);
//     } finally {
//       setLoadingRideDetails(false);
//     }
//   };

//   // Check overlapping rides with time buffer
//   const checkOverlappingRides = async (departureTime, estimatedDuration) => {
//     try {
//       console.log('🔍 Checking overlap for:', { phoneNumber, departureTime, estimatedDuration });
      
//       const response = await axios.get(`${API_BASE_URL}/check-overlapping-rides`, {
//         params: {
//           phone_number: phoneNumber,
//           departure_time: departureTime,
//           duration_minutes: estimatedDuration,
//           exclude_ride_id: isEdit ? rideId : null
//         }
//       });
      
//       console.log('📡 Overlap response:', response.data);
//       return response.data;
//     } catch (error) {
//       console.log('❌ Error checking overlapping rides:', error);
//       return { has_overlap: false };
//     }
//   };

//   // Validate distance between locations
//   const validateDistance = (fromCoord, toCoord) => {
//     const R = 6371;
//     const dLat = (toCoord.latitude - fromCoord.latitude) * Math.PI / 180;
//     const dLon = (toCoord.longitude - fromCoord.longitude) * Math.PI / 180;
//     const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
//               Math.cos(fromCoord.latitude * Math.PI / 180) * Math.cos(toCoord.latitude * Math.PI / 180) *
//               Math.sin(dLon/2) * Math.sin(dLon/2);
//     const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
//     const distance = R * c;
    
//     const MIN_DISTANCE_KM = 3;
//     const MAX_DISTANCE_KM = 300;
    
//     if (distance < MIN_DISTANCE_KM) {
//       return { valid: false, message: `Pickup and destination are too close (${distance.toFixed(1)} km). Minimum distance is ${MIN_DISTANCE_KM} km.` };
//     }
//     if (distance > MAX_DISTANCE_KM) {
//       return { valid: false, message: `Distance too far (${distance.toFixed(1)} km). Maximum allowed is ${MAX_DISTANCE_KM} km for daily commutes.` };
//     }
//     return { valid: true, distance };
//   };

//   // Validate time (minimum 30 minutes from now)
//   const validateDateTime = (selectedDateTime) => {
//     const now = new Date();
//     const minTime = new Date(now.getTime() + 30 * 60000);
    
//     if (selectedDateTime < now) {
//       return { 
//         valid: false, 
//         message: `Cannot select past date and time. Please select a future time.` 
//       };
//     }
    
//     if (selectedDateTime < minTime) {
//       return { 
//         valid: false, 
//         message: `Departure time must be at least 30 minutes from now. Please select a later time.` 
//       };
//     }
//     return { valid: true };
//   };

//   useEffect(() => {
//     if (route.params?.selectedLocation) {
//       const { selectedLocation, type } = route.params;
//       if (type === 'from') {
//         setFrom(selectedLocation.label || selectedLocation.name);
//         setFromCoords({
//           latitude: selectedLocation.latitude || selectedLocation.coords?.latitude,
//           longitude: selectedLocation.longitude || selectedLocation.coords?.longitude
//         });
//       } else {
//         setTo(selectedLocation.label);
//         setToCoords({
//           latitude: selectedLocation.latitude || selectedLocation.coords?.latitude,
//           longitude: selectedLocation.longitude || selectedLocation.coords?.longitude
//         });
//       }
//       setRouteOptions([]);
//       setSelectedRouteIndex(0);
//     }
//   }, [route.params?.selectedLocation]);

//   const calculateDistance = (lat1, lon1, lat2, lon2) => {
//     const R = 6371;
//     const dLat = (lat2 - lat1) * Math.PI / 180;
//     const dLon = (lon2 - lon1) * Math.PI / 180;
//     const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
//               Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
//               Math.sin(dLon/2) * Math.sin(dLon/2);
//     const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
//     return R * c;
//   };

//   const parseDurationToMinutes = (durationStr) => {
//     if (!durationStr) return 60;
//     let mins = 0;
//     const hrMatch = durationStr.match(/(\d+)\s*Hr/i);
//     const minMatch = durationStr.match(/(\d+)\s*Min/i);
//     if (hrMatch) mins += parseInt(hrMatch[1], 10) * 60;
//     if (minMatch) mins += parseInt(minMatch[1], 10);
//     return mins || 60;
//   };

//   const fetchRoute = useCallback(async () => {
//     if (!fromCoords || !toCoords) {
//       setRouteOptions([]);
//       return;
//     }

//     if (routeFetchAttempted && routeOptions.length > 0) {
//       return;
//     }
    
//     const sameLocation = Math.abs(fromCoords.latitude - toCoords.latitude) < 0.0001 &&
//       Math.abs(fromCoords.longitude - toCoords.longitude) < 0.0001;

//     if (sameLocation) {
//       setRouteOptions([]);
//       return;
//     }

//     const distanceValidation = validateDistance(fromCoords, toCoords);
//     if (!distanceValidation.valid) {
//       showCustomAlert("Invalid Route", distanceValidation.message, "warning");
//       setRouteOptions([]);
//       return;
//     }

//     try {
//       setLoadingRoute(true);
//       setRouteFetchAttempted(true);

//       const requestPayload = {
//         from_coords: [fromCoords.longitude, fromCoords.latitude],
//         to_coords: [toCoords.longitude, toCoords.latitude]
//       };

//       console.log('Fetching route with payload:', requestPayload);

//       const response = await axios.post(`${API_BASE_URL}/get-route`, requestPayload, {
//         timeout: 30000,
//         headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' }
//       });

//       const routesFromAPI = response.data.routes;

//       if (!routesFromAPI || routesFromAPI.length === 0) {
//         throw new Error("No routes found from API");
//       }

//       const formattedRoutes = routesFromAPI.map((route, index) => ({
//         id: index,
//         geometry: route.coordinates.map(coord => ({
//           latitude: coord[1],
//           longitude: coord[0]
//         })),
//         distance: route.distance_km,
//         duration: route.duration,
//         price: route.price,
//         duration_minutes: parseDurationToMinutes(route.duration)
//       }));

//       setRouteOptions(formattedRoutes);
//       setSelectedRouteIndex(0);

//     } catch (error) {
//       console.log('❌ Route fetch error:', error);
//       let errorMsg = "Failed to fetch route. Please try again.";
//       if (error.response?.data?.detail) {
//         errorMsg = error.response.data.detail;
//       } else if (error.message) {
//         errorMsg = error.message;
//       }
//       showCustomAlert("Route Error", errorMsg, "error");
//       setRouteOptions([]);
//     } finally {
//       setLoadingRoute(false);
//     }
//   }, [fromCoords, toCoords, routeFetchAttempted, routeOptions.length]);

//   useEffect(() => {
//     if (fromCoords && toCoords && !loadingRoute && !routeFetchAttempted) {
//       fetchRoute();
//     }
//   }, [fromCoords, toCoords, fetchRoute, loadingRoute, routeFetchAttempted]);

//   const goNext = () => setStep(s => Math.min(4, s + 1));
//   const goBack = () => { if (step > 1) setStep(s => s - 1); else navigation.goBack(); };

// const handleSubmitRide = async ({ seatsAvailable: newSeats, pricePerSeat: newPrice }) => {
//   if (!phoneNumber) {
//     showCustomAlert("Missing Info", "Phone number not found. Please login again.", "warning");
//     throw new Error("Missing phone number");
//   }

//   if (!fromCoords || !toCoords) {
//     showCustomAlert("Missing Location", "Please select both pickup and destination locations.", "warning");
//     throw new Error("Missing location");
//   }

//   const timeValidation = validateDateTime(dateTime);
//   if (!timeValidation.valid) {
//     showCustomAlert("Invalid Time", timeValidation.message, "warning");
//     throw new Error("Invalid time");
//   }

//   const distanceValidation = validateDistance(fromCoords, toCoords);
//   if (!distanceValidation.valid) {
//     showCustomAlert("Invalid Distance", distanceValidation.message, "warning");
//     throw new Error("Invalid distance");
//   }

//   setSubmitting(true);
  
//   try {
//     // ✅ CHECK OVERLAP FIRST - BEFORE ANYTHING ELSE
//     if (!isEdit && selectedRoute) {
//       console.log("🔍 Checking for overlapping rides before posting...");
      
//       const overlapCheck = await checkOverlappingRides(
//         new Date(dateTime).toISOString(),
//         selectedRoute.duration_minutes || 60
//       );
      
//       console.log("📊 Overlap check result:", JSON.stringify(overlapCheck));
      
//       if (overlapCheck && overlapCheck.has_overlap === true) {
//         const overlappingRide = overlapCheck.overlapping_ride;
//         const endTime = overlappingRide.expected_end_time 
//           ? new Date(overlappingRide.expected_end_time).toLocaleTimeString()
//           : "later";
        
//         console.log("❌ OVERLAP DETECTED! Stopping ride post.");
        
//         setSubmitting(false);
        
//         // ❌ SHOW ALERT AND THEN GO TO HOME
//         showCustomAlert(
//           "Cannot Post Ride - Time Conflict ⚠️",
//           `You already have an active ride from "${overlappingRide.origin}" to "${overlappingRide.destination}" at ${new Date(overlappingRide.departure_time).toLocaleTimeString()}.\n\nPlease wait until ${endTime} to post another ride.\n\nThis ride was NOT posted.`,
//           "warning",
//           {
//             text: "OK",
//             onPress: () => {
//               // ✅ GO TO HOME PAGE AFTER OK
//               navigation.reset({
//                 index: 0,
//                 routes: [{ name: "Home", params: { phoneNumber, userData, userId } }],
//               });
//             }
//           }
//         );
        
//         throw new Error("OVERLAP_DETECTED");
//       }
//     }
    
//     console.log("✅ No overlap found, proceeding to post ride...");
    
//     const payload = {
//       phone_number: phoneNumber,
//       origin: from,
//       destination: to,
//       departure_time: new Date(dateTime).toISOString(),
//       available_seats: newSeats,
//       price_per_seat: Number(newPrice),
//       vehicle_id: vehicleId,
//       origin_coords: [fromCoords.longitude, fromCoords.latitude],
//       destination_coords: [toCoords.longitude, toCoords.latitude],
//       route_coordinates: selectedRoute?.geometry.map((p) => [p.longitude, p.latitude]) || [],
//       distance_km: selectedRoute?.distance,
//       duration_text: selectedRoute?.duration,
//       total_estimated_price: selectedRoute?.price,
//       preferences: { ...prefs, womenOnly: prefs.womenOnly },
//       women_only: prefs.womenOnly
//     };
    
//     let response;
//     if (isEdit && rideId) {
//       response = await axios.put(`${API_BASE_URL}/update-ride/${rideId}`, payload);
//     } else {
//       response = await axios.post(`${API_BASE_URL}/post-ride`, payload);
//     }
    
//     setSubmitting(false);
//     return response.data;
    
//   } catch (error) {
//     console.log("❌ Error in handleSubmitRide:", error);
//     setSubmitting(false);
    
//     let errorMsg = error.response?.data?.detail || error.message;
    
//     if (error.response?.status === 409) {
//       errorMsg = "⚠️ Time Conflict: You already have an overlapping active ride. Please wait for it to complete before posting another ride.\n\nThis ride was NOT posted.";
      
//       // ✅ For 409 error, also go to home after OK
//       showCustomAlert(
//         "Cannot Post Ride",
//         errorMsg,
//         "warning",
//         {
//           text: "OK",
//           onPress: () => {
//             navigation.reset({
//               index: 0,
//               routes: [{ name: "Home", params: { phoneNumber, userData, userId } }],
//             });
//           }
//         }
//       );
//     } else if (error.response?.status === 403) {
//       errorMsg = "Cannot modify this ride as it has confirmed bookings.";
//       showCustomAlert("Error", errorMsg, "error");
//     } else if (error.message !== "OVERLAP_DETECTED") {
//       showCustomAlert("Error", errorMsg, "error");
//     }
    
//     throw error;
//   }
// };

//   if (loadingRideDetails) {
//     return (
//       <SafeAreaView style={styles.container}>
//         <StatusBar backgroundColor={Colors.white} barStyle="dark-content" />
//         <View style={styles.loaderContainer}>
//           <LottieView source={require("../../assets/loading.json")} autoPlay loop style={{ width: 300, height: 300 }} />
//         </View>
//       </SafeAreaView>
//     );
//   }

//   return (
//     <SafeAreaView style={styles.container}>
//       <StatusBar backgroundColor={Colors.white} barStyle="dark-content" />
      
//       <View style={styles.header}>
//         <TouchableOpacity style={styles.backButton} onPress={goBack}>
//           <MaterialIcons name="arrow-back-ios" size={24} color="#ED7117" />
//         </TouchableOpacity>
//         <Text style={styles.headerTitle}>{isEdit ? 'Edit Ride' : 'Offer a Ride'}</Text>
//         <View style={styles.headerSpacer} />
//       </View>

//       <View style={styles.progressContainer}>
//         {[1, 2, 3, 4].map((n) => (
//           <View key={n} style={[styles.progressBar, { backgroundColor: n === step ? Colors.primary : '#e6eef8' }]} />
//         ))}
//       </View>

//       <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
//         {step === 1 && (
//           <Step1 
//             from={from} to={to} setFrom={setFrom} setTo={setTo}
//             setFromCoords={setFromCoords} setToCoords={setToCoords}
//             dateTime={dateTime} setDateTime={setDateTime}
//             onNext={goNext} navigation={navigation} route={route}
//             phoneNumber={phoneNumber} fromCoords={fromCoords} toCoords={toCoords}
//             setRouteOptions={setRouteOptions} setSelectedRouteIndex={setSelectedRouteIndex}
//             isEdit={isEdit} lockedFields={lockedFields}
//             validateDateTime={validateDateTime}
//           />
//         )}
        
//         {step === 2 && (
//           <Step2 
//             routeOptions={routeOptions} selectedRouteIndex={selectedRouteIndex}
//             setSelectedRouteIndex={setSelectedRouteIndex} onNext={goNext}
//             isEdit={isEdit} lockedFields={lockedFields}
//             loadingRoute={loadingRoute}
//           />
//         )}
        
//         {step === 3 && (
//           <Step3 
//             phoneNumber={phoneNumber} navigation={navigation}
//             vehicleId={vehicleId} setVehicleId={setVehicleId}
//             onNext={({ preferences, vehicleId: selectedVehicleId, maxSeats: vehicleMaxSeats }) => { 
//               setPrefs(preferences || {}); 
//               setVehicleId(selectedVehicleId); 
//               setMaxSeats(vehicleMaxSeats || 4); 
//               goNext(); 
//             }}
//             isEdit={isEdit} lockedFields={lockedFields}
//             userGender={userGender}
//           />
//         )}
        
//         {step === 4 && (
//           <Step4 
//             seatsAvailable={seatsAvailable} setSeatsAvailable={setSeatsAvailable}
//             pricePerSeat={pricePerSeat} setPricePerSeat={setPricePerSeat}
//             selectedRoute={selectedRoute} vehicleId={vehicleId} maxSeats={maxSeats}
//             onPost={handleSubmitRide} isEdit={isEdit}
//             navigation={navigation} phoneNumber={phoneNumber}
//             userData={userData} userId={userId}
//             rideBookings={rideBookings} lockedFields={lockedFields}
//             originalRideData={originalRideData}
//           />
//         )}
//       </ScrollView>

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
//   container: { flex: 1, backgroundColor: Colors.white },
//   header: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 12, borderBottomWidth: 0.5, borderBottomColor: '#F3F4F6' },
//   backButton: { width: 44, height: 44, justifyContent: 'center' },
//   headerTitle: { fontSize: 28, fontWeight: '700', color: Colors.primary, flex: 1, textAlign: 'center' },
//   headerSpacer: { width: 44 },
//   progressContainer: { flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: 24, paddingVertical: 12 },
//   progressBar: { height: 6, flex: 1, marginHorizontal: 6, borderRadius: 4 },
//   scrollView: { flex: 1 },
//   scrollContent: { padding: 16, paddingBottom: 20 },
//   loaderContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: Colors.white },
// });
// import React, { useState, useEffect, useCallback } from 'react';
// import {
//   View,
//   Text,
//   ScrollView,
//   TouchableOpacity,
//   Platform,
//   StyleSheet,
//   StatusBar,
//   ActivityIndicator
// } from 'react-native';
// import { SafeAreaView } from 'react-native-safe-area-context';
// import { Ionicons, MaterialIcons } from '@expo/vector-icons';
// import LottieView from "lottie-react-native";
// import { Colors, Typography } from '../../constants/Colors';
// import Step1 from './Step1';
// import Step2 from './Step2';
// import Step3 from './Step3';
// import Step4 from './Step4';
// import CustomAlert from '../../components/CustomAlert';
// import axios from 'axios';
// import { useAuth } from '../../context/AuthContext';
// import { API_BASE_URL } from "../../config/config_ip";

// export default function DriveNextScreen({ navigation, route }) {
//   const { user } = useAuth();
  
//   const phoneFromRoute = route?.params?.phoneNumber || null;
//   const phoneFromAuth = user?.phone_number || user?.phoneNumber || user?.phone || null;
//   const phoneNumber = phoneFromRoute || phoneFromAuth || 
//     navigation?.getState()?.routes
//       ?.find(r => r.params?.phoneNumber)
//       ?.params?.phoneNumber || null;
  
//   const userId = user?.id || route?.params?.userId || null;
//   const userData = user || route?.params?.userData || null;
//   const userGender = user?.gender || route?.params?.gender || null;
  
//   const { rideData, isEdit, rideId } = route?.params || {};
//   const { 
//     from: initFrom, 
//     to: initTo, 
//     dateTime: initDateTime, 
//     seatsAvailable: initSeatsAvailable,
//     pricePerSeat: initPricePerSeat,
//     vehicleId: initVehicleId,
//     originCoords: initOriginCoords,
//     destinationCoords: initDestinationCoords 
//   } = rideData || {};

//   const [step, setStep] = useState(1);
//   const [from, setFrom] = useState(initFrom || '');
//   const [to, setTo] = useState(initTo || '');
//   const [dateTime, setDateTime] = useState(initDateTime ? new Date(initDateTime) : new Date());
//   const [vehicleId, setVehicleId] = useState(initVehicleId || null);
//   const [maxSeats, setMaxSeats] = useState(4);
//   const [routeOptions, setRouteOptions] = useState([]);
//   const [selectedRouteIndex, setSelectedRouteIndex] = useState(0);
//   const selectedRoute = routeOptions?.[selectedRouteIndex];
  
//   const [prefs, setPrefs] = useState({ 
//     womenOnly: false, 
//     instantBooking: true, 
//     luggage: true, 
//     smoking: false, 
//     pets: false 
//   });
  
//   const [seatsAvailable, setSeatsAvailable] = useState(initSeatsAvailable || 1);
//   const [pricePerSeat, setPricePerSeat] = useState(initPricePerSeat ? initPricePerSeat.toString() : '');
//   const [fromCoords, setFromCoords] = useState(initOriginCoords ? 
//     (Array.isArray(initOriginCoords) ? { latitude: initOriginCoords[1], longitude: initOriginCoords[0] } : initOriginCoords) : null);
//   const [toCoords, setToCoords] = useState(initDestinationCoords ? 
//     (Array.isArray(initDestinationCoords) ? { latitude: initDestinationCoords[1], longitude: initDestinationCoords[0] } : initDestinationCoords) : null);
//   const [loadingRoute, setLoadingRoute] = useState(false);
//   const [submitting, setSubmitting] = useState(false);
//   const [routeFetchAttempted, setRouteFetchAttempted] = useState(false);
//   const [rideBookings, setRideBookings] = useState(null);
//   const [lockedFields, setLockedFields] = useState([]);
//   const [originalRideData, setOriginalRideData] = useState(null);
//   const [loadingRideDetails, setLoadingRideDetails] = useState(false);
//   const [totalBookedSeats, setTotalBookedSeats] = useState(0);

//   const [alertVisible, setAlertVisible] = useState(false);
//   const [alertConfig, setAlertConfig] = useState({
//     title: "",
//     message: "",
//     icon: "check-circle",
//     iconColor: "#10B981",
//     buttons: []
//   });

//   const showCustomAlert = (title, message, type = 'success', onConfirm = null, onCancel = null) => {
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
//       iconColor = Colors.primary;
//     }
    
//     const buttons = [];
    
//     if (onCancel) {
//       buttons.push({ 
//         text: 'Cancel', 
//         onPress: () => {
//           setAlertVisible(false);
//           if (onCancel) onCancel();
//         }, 
//         style: 'cancel' 
//       });
//     }
    
//     if (onConfirm) {
//       buttons.push({ 
//         text: onConfirm.text || 'Confirm', 
//         onPress: () => {
//           setAlertVisible(false);
//           if (onConfirm.onPress) onConfirm.onPress();
//         }
//       });
//     } else {
//       buttons.push({ text: 'OK', onPress: () => setAlertVisible(false) });
//     }
    
//     setAlertConfig({
//       title,
//       message,
//       icon,
//       iconColor,
//       buttons
//     });
//     setAlertVisible(true);
//   };

//   // Load ride details if in edit mode
//   useEffect(() => {
//     if (isEdit && rideId) {
//       loadRideDetails();
//     }
//   }, [isEdit, rideId]);

//   const loadRideDetails = async () => {
//     setLoadingRideDetails(true);
//     try {
//       const response = await axios.get(`${API_BASE_URL}/ride/${rideId}/details`);
//       const rideDetails = response.data;
      
//       setRideBookings(rideDetails.bookings);
//       setOriginalRideData(rideDetails);
//       setTotalBookedSeats(rideDetails.total_booked_seats || 0);
      
//       // Set the correct seatsAvailable from the ride data (total seats)
//       if (rideDetails.available_seats) {
//         setSeatsAvailable(rideDetails.available_seats);
//       }
      
//       const hasConfirmedBookings = rideDetails.bookings?.some(b => b.status === 'accepted');
      
//       if (hasConfirmedBookings) {
//         const locked = [];
        
//         // Lock origin and destination if there are confirmed bookings
//         if (rideDetails.bookings?.length > 0) {
//           locked.push('origin');
//           locked.push('destination');
//           locked.push('route');
//         }
        
//         // Lock price if there are confirmed bookings
//         if (rideDetails.bookings?.length > 0) {
//           locked.push('price');
//         }
        
//         // Lock seats if there are confirmed bookings (can only increase, not decrease)
//         if (rideDetails.bookings?.length > 0) {
//           locked.push('seats');
//         }
        
//         setLockedFields(locked);
//       }
//     } catch (error) {
//       console.log('Error loading ride details:', error);
//     } finally {
//       setLoadingRideDetails(false);
//     }
//   };

//   // Check driver overlapping rides
//   const checkOverlappingRides = async (departureTime, estimatedDuration) => {
//     try {
//       console.log('🔍 Checking driver overlap for:', { phoneNumber, departureTime, estimatedDuration });
      
//       const response = await axios.get(`${API_BASE_URL}/check-overlapping-rides`, {
//         params: {
//           phone_number: phoneNumber,
//           departure_time: departureTime,
//           duration_minutes: estimatedDuration,
//           exclude_ride_id: isEdit ? rideId : null
//         }
//       });
      
//       console.log('📡 Driver overlap response:', response.data);
//       return response.data;
//     } catch (error) {
//       console.log('❌ Error checking driver overlapping rides:', error);
//       return { has_overlap: false };
//     }
//   };

//   // Check passenger overlapping bookings (user has accepted booking as passenger)
//   const checkPassengerOverlap = async (departureTime, estimatedDuration) => {
//     try {
//       console.log('🔍 Checking passenger overlap for:', { phoneNumber, departureTime, estimatedDuration });
      
//       const response = await axios.get(`${API_BASE_URL}/check-passenger-overlap`, {
//         params: {
//           phone_number: phoneNumber,
//           departure_time: departureTime,
//           duration_minutes: estimatedDuration,
//         }
//       });
      
//       console.log('📡 Passenger overlap response:', response.data);
//       return response.data;
//     } catch (error) {
//       console.log('❌ Error checking passenger overlap:', error);
//       return { has_overlap: false };
//     }
//   };

//   // Validate distance between locations
//   const validateDistance = (fromCoord, toCoord) => {
//     const R = 6371;
//     const dLat = (toCoord.latitude - fromCoord.latitude) * Math.PI / 180;
//     const dLon = (toCoord.longitude - fromCoord.longitude) * Math.PI / 180;
//     const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
//               Math.cos(fromCoord.latitude * Math.PI / 180) * Math.cos(toCoord.latitude * Math.PI / 180) *
//               Math.sin(dLon/2) * Math.sin(dLon/2);
//     const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
//     const distance = R * c;
    
//     const MIN_DISTANCE_KM = 3;
//     const MAX_DISTANCE_KM = 300;
    
//     if (distance < MIN_DISTANCE_KM) {
//       return { valid: false, message: `Pickup and destination are too close (${distance.toFixed(1)} km). Minimum distance is ${MIN_DISTANCE_KM} km.` };
//     }
//     if (distance > MAX_DISTANCE_KM) {
//       return { valid: false, message: `Distance too far (${distance.toFixed(1)} km). Maximum allowed is ${MAX_DISTANCE_KM} km for daily commutes.` };
//     }
//     return { valid: true, distance };
//   };

//   // Validate time (minimum 30 minutes from now)
//   const validateDateTime = (selectedDateTime) => {
//     const now = new Date();
//     const minTime = new Date(now.getTime() + 30 * 60000);
    
//     if (selectedDateTime < now) {
//       return { 
//         valid: false, 
//         message: `Cannot select past date and time. Please select a future time.` 
//       };
//     }
    
//     if (selectedDateTime < minTime) {
//       return { 
//         valid: false, 
//         message: `Departure time must be at least 30 minutes from now. Please select a later time.` 
//       };
//     }
//     return { valid: true };
//   };

//   useEffect(() => {
//     if (route.params?.selectedLocation) {
//       const { selectedLocation, type } = route.params;
//       if (type === 'from') {
//         setFrom(selectedLocation.label || selectedLocation.name);
//         setFromCoords({
//           latitude: selectedLocation.latitude || selectedLocation.coords?.latitude,
//           longitude: selectedLocation.longitude || selectedLocation.coords?.longitude
//         });
//       } else {
//         setTo(selectedLocation.label);
//         setToCoords({
//           latitude: selectedLocation.latitude || selectedLocation.coords?.latitude,
//           longitude: selectedLocation.longitude || selectedLocation.coords?.longitude
//         });
//       }
//       setRouteOptions([]);
//       setSelectedRouteIndex(0);
//     }
//   }, [route.params?.selectedLocation]);

//   const calculateDistance = (lat1, lon1, lat2, lon2) => {
//     const R = 6371;
//     const dLat = (lat2 - lat1) * Math.PI / 180;
//     const dLon = (lon2 - lon1) * Math.PI / 180;
//     const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
//               Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
//               Math.sin(dLon/2) * Math.sin(dLon/2);
//     const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
//     return R * c;
//   };

//   const parseDurationToMinutes = (durationStr) => {
//     if (!durationStr) return 60;
//     let mins = 0;
//     const hrMatch = durationStr.match(/(\d+)\s*Hr/i);
//     const minMatch = durationStr.match(/(\d+)\s*Min/i);
//     if (hrMatch) mins += parseInt(hrMatch[1], 10) * 60;
//     if (minMatch) mins += parseInt(minMatch[1], 10);
//     return mins || 60;
//   };

//   const fetchRoute = useCallback(async () => {
//     if (!fromCoords || !toCoords) {
//       setRouteOptions([]);
//       return;
//     }

//     if (routeFetchAttempted && routeOptions.length > 0) {
//       return;
//     }
    
//     const sameLocation = Math.abs(fromCoords.latitude - toCoords.latitude) < 0.0001 &&
//       Math.abs(fromCoords.longitude - toCoords.longitude) < 0.0001;

//     if (sameLocation) {
//       setRouteOptions([]);
//       return;
//     }

//     const distanceValidation = validateDistance(fromCoords, toCoords);
//     if (!distanceValidation.valid) {
//       showCustomAlert("Invalid Route", distanceValidation.message, "warning");
//       setRouteOptions([]);
//       return;
//     }

//     try {
//       setLoadingRoute(true);
//       setRouteFetchAttempted(true);

//       const requestPayload = {
//         from_coords: [fromCoords.longitude, fromCoords.latitude],
//         to_coords: [toCoords.longitude, toCoords.latitude]
//       };

//       console.log('Fetching route with payload:', requestPayload);

//       const response = await axios.post(`${API_BASE_URL}/get-route`, requestPayload, {
//         timeout: 30000,
//         headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' }
//       });

//       const routesFromAPI = response.data.routes;

//       if (!routesFromAPI || routesFromAPI.length === 0) {
//         throw new Error("No routes found from API");
//       }

//       const formattedRoutes = routesFromAPI.map((route, index) => ({
//         id: index,
//         geometry: route.coordinates.map(coord => ({
//           latitude: coord[1],
//           longitude: coord[0]
//         })),
//         distance: route.distance_km,
//         duration: route.duration,
//         price: route.price,
//         duration_minutes: parseDurationToMinutes(route.duration)
//       }));

//       setRouteOptions(formattedRoutes);
//       setSelectedRouteIndex(0);

//     } catch (error) {
//       console.log('❌ Route fetch error:', error);
//       let errorMsg = "Failed to fetch route. Please try again.";
//       if (error.response?.data?.detail) {
//         errorMsg = error.response.data.detail;
//       } else if (error.message) {
//         errorMsg = error.message;
//       }
//       showCustomAlert("Route Error", errorMsg, "error");
//       setRouteOptions([]);
//     } finally {
//       setLoadingRoute(false);
//     }
//   }, [fromCoords, toCoords, routeFetchAttempted, routeOptions.length]);

//   useEffect(() => {
//     if (fromCoords && toCoords && !loadingRoute && !routeFetchAttempted) {
//       fetchRoute();
//     }
//   }, [fromCoords, toCoords, fetchRoute, loadingRoute, routeFetchAttempted]);

//   const goNext = () => setStep(s => Math.min(4, s + 1));
//   const goBack = () => { if (step > 1) setStep(s => s - 1); else navigation.goBack(); };

//   const handleSubmitRide = async ({ seatsAvailable: newSeats, pricePerSeat: newPrice }) => {
//     if (!phoneNumber) {
//       showCustomAlert("Missing Info", "Phone number not found. Please login again.", "warning");
//       throw new Error("Missing phone number");
//     }

//     if (!fromCoords || !toCoords) {
//       showCustomAlert("Missing Location", "Please select both pickup and destination locations.", "warning");
//       throw new Error("Missing location");
//     }

//     const timeValidation = validateDateTime(dateTime);
//     if (!timeValidation.valid) {
//       showCustomAlert("Invalid Time", timeValidation.message, "warning");
//       throw new Error("Invalid time");
//     }

//     const distanceValidation = validateDistance(fromCoords, toCoords);
//     if (!distanceValidation.valid) {
//       showCustomAlert("Invalid Distance", distanceValidation.message, "warning");
//       throw new Error("Invalid distance");
//     }

//     // For edit mode with confirmed bookings, check if trying to reduce seats below booked count
//     if (isEdit && totalBookedSeats > 0 && newSeats < totalBookedSeats) {
//       showCustomAlert(
//         "Cannot Reduce Seats",
//         `You have ${totalBookedSeats} confirmed passenger(s). You cannot reduce total seats below ${totalBookedSeats}. You can increase seats to ${newSeats} or keep at ${seatsAvailable}.`,
//         "warning"
//       );
//       throw new Error("Cannot reduce seats below booked count");
//     }

//     setSubmitting(true);
    
//     try {
//       // Only check overlaps for new rides (not for edit)
//       if (!isEdit && selectedRoute) {
//         // CHECK PASSENGER OVERLAP FIRST - User has accepted booking as passenger
//         console.log("🔍 Checking for passenger overlapping bookings before posting...");
        
//         const passengerOverlapCheck = await checkPassengerOverlap(
//           new Date(dateTime).toISOString(),
//           selectedRoute.duration_minutes || 60
//         );
        
//         console.log("📊 Passenger overlap check result:", JSON.stringify(passengerOverlapCheck));
        
//         if (passengerOverlapCheck && passengerOverlapCheck.has_overlap === true) {
//           const overlappingBooking = passengerOverlapCheck.overlapping_booking;
          
//           console.log("❌ PASSENGER OVERLAP DETECTED! Stopping ride post.");
          
//           setSubmitting(false);
          
//           showCustomAlert(
//             "Cannot Post Ride - You Have a Confirmed Booking ⚠️",
//             `You already have a confirmed booking as a passenger from "${overlappingBooking.origin}" to "${overlappingBooking.destination}" at ${new Date(overlappingBooking.departure_time).toLocaleTimeString()}.\n\nPlease complete that ride before offering another ride.\n\nThis ride was NOT posted.`,
//             "warning",
//             {
//               text: "OK",
//               onPress: () => {
//                 navigation.reset({
//                   index: 0,
//                   routes: [{ name: "Home", params: { phoneNumber, userData, userId } }],
//                 });
//               }
//             }
//           );
          
//           throw new Error("PASSENGER_OVERLAP_DETECTED");
//         }
        
//         // CHECK DRIVER OVERLAP SECOND
//         console.log("🔍 Checking for driver overlapping rides before posting...");
        
//         const driverOverlapCheck = await checkOverlappingRides(
//           new Date(dateTime).toISOString(),
//           selectedRoute.duration_minutes || 60
//         );
        
//         console.log("📊 Driver overlap check result:", JSON.stringify(driverOverlapCheck));
        
//         if (driverOverlapCheck && driverOverlapCheck.has_overlap === true) {
//           const overlappingRide = driverOverlapCheck.overlapping_ride;
//           const endTime = overlappingRide.expected_end_time 
//             ? new Date(overlappingRide.expected_end_time).toLocaleTimeString()
//             : "later";
          
//           console.log("❌ DRIVER OVERLAP DETECTED! Stopping ride post.");
          
//           setSubmitting(false);
          
//           showCustomAlert(
//             "Cannot Post Ride - You Have an Active Ride ⚠️",
//             `You already have an active ride from "${overlappingRide.origin}" to "${overlappingRide.destination}" at ${new Date(overlappingRide.departure_time).toLocaleTimeString()}.\n\nPlease wait until ${endTime} to post another ride.\n\nThis ride was NOT posted.`,
//             "warning",
//             {
//               text: "OK",
//               onPress: () => {
//                 navigation.reset({
//                   index: 0,
//                   routes: [{ name: "Home", params: { phoneNumber, userData, userId } }],
//                 });
//               }
//             }
//           );
          
//           throw new Error("DRIVER_OVERLAP_DETECTED");
//         }
//       }
      
//       console.log("✅ No overlap found, proceeding to post/update ride...");
      
//       const payload = {
//         phone_number: phoneNumber,
//         origin: from,
//         destination: to,
//         departure_time: new Date(dateTime).toISOString(),
//         available_seats: newSeats,
//         price_per_seat: Number(newPrice),
//         vehicle_id: vehicleId,
//         origin_coords: [fromCoords.longitude, fromCoords.latitude],
//         destination_coords: [toCoords.longitude, toCoords.latitude],
//         route_coordinates: selectedRoute?.geometry.map((p) => [p.longitude, p.latitude]) || [],
//         distance_km: selectedRoute?.distance,
//         duration_text: selectedRoute?.duration,
//         total_estimated_price: selectedRoute?.price,
//         preferences: { ...prefs, womenOnly: prefs.womenOnly },
//         women_only: prefs.womenOnly
//       };
      
//       let response;
//       if (isEdit && rideId) {
//         response = await axios.put(`${API_BASE_URL}/update-ride/${rideId}`, payload);
//       } else {
//         response = await axios.post(`${API_BASE_URL}/post-ride`, payload);
//       }
      
//       setSubmitting(false);
//       return response.data;
      
//     } catch (error) {
//       console.log("❌ Error in handleSubmitRide:", error);
//       setSubmitting(false);
      
//       let errorMsg = error.response?.data?.detail || error.message;
      
//       if (error.response?.status === 409) {
//         if (errorMsg.includes("confirmed booking as a passenger")) {
//           errorMsg = "⚠️ You have a confirmed booking as a passenger at this time. Please complete that ride before offering another ride.\n\nThis ride was NOT posted.";
//         } else {
//           errorMsg = "⚠️ You already have an overlapping active ride. Please wait for it to complete before posting another ride.\n\nThis ride was NOT posted.";
//         }
        
//         showCustomAlert(
//           "Cannot Post Ride",
//           errorMsg,
//           "warning",
//           {
//             text: "OK",
//             onPress: () => {
//               navigation.reset({
//                 index: 0,
//                 routes: [{ name: "Home", params: { phoneNumber, userData, userId } }],
//               });
//             }
//           }
//         );
//       } else if (error.response?.status === 400 && errorMsg.includes("Cannot reduce seats")) {
//         showCustomAlert("Cannot Reduce Seats", errorMsg, "warning");
//       } else if (error.response?.status === 403) {
//         errorMsg = "Cannot modify this ride as it has confirmed bookings.";
//         showCustomAlert("Error", errorMsg, "error");
//       } else if (error.message !== "PASSENGER_OVERLAP_DETECTED" && error.message !== "DRIVER_OVERLAP_DETECTED") {
//         showCustomAlert("Error", errorMsg, "error");
//       }
      
//       throw error;
//     }
//   };

//   if (loadingRideDetails) {
//     return (
//       <SafeAreaView style={styles.container}>
//         <StatusBar backgroundColor={Colors.white} barStyle="dark-content" />
//         <View style={styles.loaderContainer}>
//           <LottieView source={require("../../assets/loading.json")} autoPlay loop style={{ width: 300, height: 300 }} />
//         </View>
//       </SafeAreaView>
//     );
//   }

//   return (
//     <SafeAreaView style={styles.container}>
//       <StatusBar backgroundColor={Colors.white} barStyle="dark-content" />
      
//       <View style={styles.header}>
//         <TouchableOpacity style={styles.backButton} onPress={goBack}>
//           <MaterialIcons name="arrow-back-ios" size={24} color="#ED7117" />
//         </TouchableOpacity>
//         <Text style={styles.headerTitle}>{isEdit ? 'Edit Ride' : 'Offer a Ride'}</Text>
//         <View style={styles.headerSpacer} />
//       </View>

//       <View style={styles.progressContainer}>
//         {[1, 2, 3, 4].map((n) => (
//           <View key={n} style={[styles.progressBar, { backgroundColor: n === step ? Colors.primary : '#e6eef8' }]} />
//         ))}
//       </View>

//       <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
//         {step === 1 && (
//           <Step1 
//             from={from} to={to} setFrom={setFrom} setTo={setTo}
//             setFromCoords={setFromCoords} setToCoords={setToCoords}
//             dateTime={dateTime} setDateTime={setDateTime}
//             onNext={goNext} navigation={navigation} route={route}
//             phoneNumber={phoneNumber} fromCoords={fromCoords} toCoords={toCoords}
//             setRouteOptions={setRouteOptions} setSelectedRouteIndex={setSelectedRouteIndex}
//             isEdit={isEdit} lockedFields={lockedFields}
//             validateDateTime={validateDateTime}
//           />
//         )}
        
//         {step === 2 && (
//           <Step2 
//             routeOptions={routeOptions} selectedRouteIndex={selectedRouteIndex}
//             setSelectedRouteIndex={setSelectedRouteIndex} onNext={goNext}
//             isEdit={isEdit} lockedFields={lockedFields}
//             loadingRoute={loadingRoute}
//           />
//         )}
        
//         {step === 3 && (
//           <Step3 
//             phoneNumber={phoneNumber} navigation={navigation}
//             vehicleId={vehicleId} setVehicleId={setVehicleId}
//             onNext={({ preferences, vehicleId: selectedVehicleId, maxSeats: vehicleMaxSeats }) => { 
//               setPrefs(preferences || {}); 
//               setVehicleId(selectedVehicleId); 
//               setMaxSeats(vehicleMaxSeats || 4); 
//               goNext(); 
//             }}
//             isEdit={isEdit} lockedFields={lockedFields}
//             userGender={userGender}
//           />
//         )}
        
//         {step === 4 && (
//           <Step4 
//             seatsAvailable={seatsAvailable} setSeatsAvailable={setSeatsAvailable}
//             pricePerSeat={pricePerSeat} setPricePerSeat={setPricePerSeat}
//             selectedRoute={selectedRoute} vehicleId={vehicleId} maxSeats={maxSeats}
//             onPost={handleSubmitRide} isEdit={isEdit}
//             navigation={navigation} phoneNumber={phoneNumber}
//             userData={userData} userId={userId}
//             rideBookings={rideBookings} lockedFields={lockedFields}
//             originalRideData={originalRideData}
//             totalBookedSeats={totalBookedSeats}
//           />
//         )}
//       </ScrollView>

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
//   container: { flex: 1, backgroundColor: Colors.white },
//   header: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 12, borderBottomWidth: 0.5, borderBottomColor: '#F3F4F6' },
//   backButton: { width: 44, height: 44, justifyContent: 'center' },
//   headerTitle: { fontSize: 28, fontWeight: '700', color: Colors.primary, flex: 1, textAlign: 'center' },
//   headerSpacer: { width: 44 },
//   progressContainer: { flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: 24, paddingVertical: 12 },
//   progressBar: { height: 6, flex: 1, marginHorizontal: 6, borderRadius: 4 },
//   scrollView: { flex: 1 },
//   scrollContent: { padding: 16, paddingBottom: 20 },
//   loaderContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: Colors.white },
// });
import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Platform,
  StyleSheet,
  StatusBar,
  ActivityIndicator
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import LottieView from "lottie-react-native";
import { Colors, Typography } from '../../constants/Colors';
import Step1 from './Step1';
import Step2 from './Step2';
import Step3 from './Step3';
import Step4 from './Step4';
import CustomAlert from '../../components/CustomAlert';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';
import { API_BASE_URL } from "../../config/config_ip";

export default function DriveNextScreen({ navigation, route }) {
  const { user } = useAuth();
  
  const phoneFromRoute = route?.params?.phoneNumber || null;
  const phoneFromAuth = user?.phone_number || user?.phoneNumber || user?.phone || null;
  const phoneNumber = phoneFromRoute || phoneFromAuth || 
    navigation?.getState()?.routes
      ?.find(r => r.params?.phoneNumber)
      ?.params?.phoneNumber || null;
  
  const userId = user?.id || route?.params?.userId || null;
  const userData = user || route?.params?.userData || null;
  const userGender = user?.gender || route?.params?.gender || null;
  
  const { rideData, isEdit, rideId } = route?.params || {};
  const { 
    from: initFrom, 
    to: initTo, 
    dateTime: initDateTime, 
    seatsAvailable: initSeatsAvailable,
    pricePerSeat: initPricePerSeat,
    vehicleId: initVehicleId,
    originCoords: initOriginCoords,
    destinationCoords: initDestinationCoords 
  } = rideData || {};

  const [step, setStep] = useState(1);
  const [from, setFrom] = useState(initFrom || '');
  const [to, setTo] = useState(initTo || '');
  const [dateTime, setDateTime] = useState(initDateTime ? new Date(initDateTime) : new Date());
  const [vehicleId, setVehicleId] = useState(initVehicleId || null);
  const [maxSeats, setMaxSeats] = useState(4);
  const [routeOptions, setRouteOptions] = useState([]);
  const [selectedRouteIndex, setSelectedRouteIndex] = useState(0);
  const selectedRoute = routeOptions?.[selectedRouteIndex];
  
  const [prefs, setPrefs] = useState({ 
    womenOnly: false, 
    instantBooking: true, 
    luggage: true, 
    smoking: false, 
    pets: false 
  });
  
  const [seatsAvailable, setSeatsAvailable] = useState(initSeatsAvailable || 1);
  const [pricePerSeat, setPricePerSeat] = useState(initPricePerSeat ? initPricePerSeat.toString() : '');
  const [fromCoords, setFromCoords] = useState(initOriginCoords ? 
    (Array.isArray(initOriginCoords) ? { latitude: initOriginCoords[1], longitude: initOriginCoords[0] } : initOriginCoords) : null);
  const [toCoords, setToCoords] = useState(initDestinationCoords ? 
    (Array.isArray(initDestinationCoords) ? { latitude: initDestinationCoords[1], longitude: initDestinationCoords[0] } : initDestinationCoords) : null);
  const [loadingRoute, setLoadingRoute] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [routeFetchAttempted, setRouteFetchAttempted] = useState(false);
  const [rideBookings, setRideBookings] = useState(null);
  const [lockedFields, setLockedFields] = useState([]);
  const [originalRideData, setOriginalRideData] = useState(null);
  const [loadingRideDetails, setLoadingRideDetails] = useState(false);
  const [totalBookedSeats, setTotalBookedSeats] = useState(0);

  const [alertVisible, setAlertVisible] = useState(false);
  const [alertConfig, setAlertConfig] = useState({
    title: "",
    message: "",
    icon: "check-circle",
    iconColor: "#10B981",
    buttons: []
  });

  const showCustomAlert = (title, message, type = 'success', onConfirm = null, onCancel = null) => {
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
    
    const buttons = [];
    
    if (onCancel) {
      buttons.push({ 
        text: 'Cancel', 
        onPress: () => {
          setAlertVisible(false);
          if (onCancel) onCancel();
        }, 
        style: 'cancel' 
      });
    }
    
    if (onConfirm) {
      buttons.push({ 
        text: onConfirm.text || 'Confirm', 
        onPress: () => {
          setAlertVisible(false);
          if (onConfirm.onPress) onConfirm.onPress();
        }
      });
    } else {
      buttons.push({ text: 'OK', onPress: () => setAlertVisible(false) });
    }
    
    setAlertConfig({
      title,
      message,
      icon,
      iconColor,
      buttons
    });
    setAlertVisible(true);
  };

  // Load ride details if in edit mode
  useEffect(() => {
    if (isEdit && rideId) {
      loadRideDetails();
    }
  }, [isEdit, rideId]);

  const loadRideDetails = async () => {
    setLoadingRideDetails(true);
    try {
      const response = await axios.get(`${API_BASE_URL}/ride/${rideId}/details`);
      const rideDetails = response.data;
      
      setRideBookings(rideDetails.bookings);
      setOriginalRideData(rideDetails);
      setTotalBookedSeats(rideDetails.total_booked_seats || 0);
      
      if (rideDetails.available_seats) {
        setSeatsAvailable(rideDetails.available_seats);
      }
      
      const hasConfirmedBookings = rideDetails.bookings?.some(b => b.status === 'accepted');
      
      if (hasConfirmedBookings) {
        const locked = [];
        if (rideDetails.bookings?.length > 0) {
          locked.push('origin');
          locked.push('destination');
          locked.push('route');
          locked.push('price');
          locked.push('seats');
        }
        setLockedFields(locked);
      }
    } catch (error) {
      console.log('Error loading ride details:', error);
    } finally {
      setLoadingRideDetails(false);
    }
  };

  // Check driver overlapping rides
  const checkOverlappingRides = async (departureTime, estimatedDuration) => {
    try {
      console.log('🔍 Checking driver overlap for:', { phoneNumber, departureTime, estimatedDuration });
      
      const response = await axios.get(`${API_BASE_URL}/check-overlapping-rides`, {
        params: {
          phone_number: phoneNumber,
          departure_time: departureTime,
          duration_minutes: estimatedDuration,
          exclude_ride_id: isEdit ? rideId : null
        }
      });
      
      console.log('📡 Driver overlap response:', response.data);
      return response.data;
    } catch (error) {
      console.log('❌ Error checking driver overlapping rides:', error);
      return { has_overlap: false };
    }
  };

  // Check passenger overlapping bookings
  const checkPassengerOverlap = async (departureTime, estimatedDuration) => {
    try {
      console.log('🔍 Checking passenger overlap for:', { phoneNumber, departureTime, estimatedDuration });
      
      const response = await axios.get(`${API_BASE_URL}/check-passenger-overlap`, {
        params: {
          phone_number: phoneNumber,
          departure_time: departureTime,
          duration_minutes: estimatedDuration,
        }
      });
      
      console.log('📡 Passenger overlap response:', response.data);
      return response.data;
    } catch (error) {
      console.log('❌ Error checking passenger overlap:', error);
      return { has_overlap: false };
    }
  };

  // Validate distance between locations
  const validateDistance = (fromCoord, toCoord) => {
    const R = 6371;
    const dLat = (toCoord.latitude - fromCoord.latitude) * Math.PI / 180;
    const dLon = (toCoord.longitude - fromCoord.longitude) * Math.PI / 180;
    const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
              Math.cos(fromCoord.latitude * Math.PI / 180) * Math.cos(toCoord.latitude * Math.PI / 180) *
              Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    const distance = R * c;
    
    const MIN_DISTANCE_KM = 3;
    const MAX_DISTANCE_KM = 300;
    
    if (distance < MIN_DISTANCE_KM) {
      return { valid: false, message: `Pickup and destination are too close (${distance.toFixed(1)} km). Minimum distance is ${MIN_DISTANCE_KM} km.` };
    }
    if (distance > MAX_DISTANCE_KM) {
      return { valid: false, message: `Distance too far (${distance.toFixed(1)} km). Maximum allowed is ${MAX_DISTANCE_KM} km for daily commutes.` };
    }
    return { valid: true, distance };
  };

  // Validate time (minimum 30 minutes from now)
  const validateDateTime = (selectedDateTime) => {
    const now = new Date();
    const minTime = new Date(now.getTime() + 30 * 60000);
    
    if (selectedDateTime < now) {
      return { 
        valid: false, 
        message: `Cannot select past date and time. Please select a future time.` 
      };
    }
    
    if (selectedDateTime < minTime) {
      return { 
        valid: false, 
        message: `Departure time must be at least 30 minutes from now. Please select a later time.` 
      };
    }
    return { valid: true };
  };

  useEffect(() => {
    if (route.params?.selectedLocation) {
      const { selectedLocation, type } = route.params;
      if (type === 'from') {
        setFrom(selectedLocation.label || selectedLocation.name);
        setFromCoords({
          latitude: selectedLocation.latitude || selectedLocation.coords?.latitude,
          longitude: selectedLocation.longitude || selectedLocation.coords?.longitude
        });
      } else {
        setTo(selectedLocation.label);
        setToCoords({
          latitude: selectedLocation.latitude || selectedLocation.coords?.latitude,
          longitude: selectedLocation.longitude || selectedLocation.coords?.longitude
        });
      }
      resetRouteData();
    }
  }, [route.params?.selectedLocation]);

  const calculateDistance = (lat1, lon1, lat2, lon2) => {
    const R = 6371;
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
              Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
              Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
  };

  const parseDurationToMinutes = (durationStr) => {
    if (!durationStr) return 60;
    let mins = 0;
    const hrMatch = durationStr.match(/(\d+)\s*Hr/i);
    const minMatch = durationStr.match(/(\d+)\s*Min/i);
    if (hrMatch) mins += parseInt(hrMatch[1], 10) * 60;
    if (minMatch) mins += parseInt(minMatch[1], 10);
    return mins || 60;
  };

  // Reset route data function
  const resetRouteData = () => {
    console.log('🔄 Resetting route data...');
    setRouteOptions([]);
    setSelectedRouteIndex(0);
    setRouteFetchAttempted(false);
    setLoadingRoute(false);
  };

  // Handle location change from Step1
  const handleLocationChange = () => {
    console.log('📍 Location changed, resetting route data...');
    resetRouteData();
  };

  // Go back to step 1 with route data reset
  const goBackToStep1 = () => {
    setStep(1);
    resetRouteData();
  };

  // Retry fetching routes
  const retryFetchRoutes = () => {
    console.log('🔄 Retrying route fetch...');
    resetRouteData();
  };

  // Fetch route function
  const fetchRoute = useCallback(async () => {
    if (!fromCoords || !toCoords) {
      setRouteOptions([]);
      return;
    }
    
    const sameLocation = Math.abs(fromCoords.latitude - toCoords.latitude) < 0.0001 &&
      Math.abs(fromCoords.longitude - toCoords.longitude) < 0.0001;

    if (sameLocation) {
      setRouteOptions([]);
      return;
    }

    const distanceValidation = validateDistance(fromCoords, toCoords);
    if (!distanceValidation.valid) {
      showCustomAlert("Invalid Route", distanceValidation.message, "warning");
      setRouteOptions([]);
      return;
    }

    // Prevent multiple simultaneous fetches
    if (loadingRoute) {
      console.log('Already fetching route, skipping...');
      return;
    }

    try {
      setLoadingRoute(true);

      const requestPayload = {
        from_coords: [fromCoords.longitude, fromCoords.latitude],
        to_coords: [toCoords.longitude, toCoords.latitude]
      };

      console.log('Fetching route with payload:', requestPayload);

      const response = await axios.post(`${API_BASE_URL}/get-route`, requestPayload, {
        timeout: 30000,
        headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' }
      });

      const routesFromAPI = response.data.routes;

      if (!routesFromAPI || routesFromAPI.length === 0) {
        throw new Error("No routes found from API");
      }

      const formattedRoutes = routesFromAPI.map((route, index) => ({
        id: index,
        geometry: route.coordinates.map(coord => ({
          latitude: coord[1],
          longitude: coord[0]
        })),
        distance: route.distance_km,
        duration: route.duration,
        price: route.price,
        duration_minutes: parseDurationToMinutes(route.duration)
      }));

      setRouteOptions(formattedRoutes);
      setSelectedRouteIndex(0);
      setRouteFetchAttempted(true);

    } catch (error) {
      console.log('❌ Route fetch error:', error);
      let errorMsg = "Failed to fetch route. Please try again.";
      if (error.response?.data?.detail) {
        errorMsg = error.response.data.detail;
      } else if (error.message) {
        errorMsg = error.message;
      }
      showCustomAlert("Route Error", errorMsg, "error");
      setRouteOptions([]);
      setRouteFetchAttempted(false);
    } finally {
      setLoadingRoute(false);
    }
  }, [fromCoords, toCoords]);

  // Fetch route when coordinates change with debounce
  useEffect(() => {
    if (fromCoords && toCoords && !loadingRoute && !routeFetchAttempted) {
      const timer = setTimeout(() => {
        fetchRoute();
      }, 500);
      
      return () => clearTimeout(timer);
    }
  }, [fromCoords, toCoords, loadingRoute, routeFetchAttempted, fetchRoute]);

  const goNext = () => setStep(s => Math.min(4, s + 1));
  const goBack = () => { 
    if (step > 1) {
      if (step === 2) {
        resetRouteData();
      }
      setStep(s => s - 1);
    } else {
      navigation.goBack();
    }
  };

  const handleSubmitRide = async ({ seatsAvailable: newSeats, pricePerSeat: newPrice }) => {
    if (!phoneNumber) {
      showCustomAlert("Missing Info", "Phone number not found. Please login again.", "warning");
      throw new Error("Missing phone number");
    }

    if (!fromCoords || !toCoords) {
      showCustomAlert("Missing Location", "Please select both pickup and destination locations.", "warning");
      throw new Error("Missing location");
    }

    const timeValidation = validateDateTime(dateTime);
    if (!timeValidation.valid) {
      showCustomAlert("Invalid Time", timeValidation.message, "warning");
      throw new Error("Invalid time");
    }

    const distanceValidation = validateDistance(fromCoords, toCoords);
    if (!distanceValidation.valid) {
      showCustomAlert("Invalid Distance", distanceValidation.message, "warning");
      throw new Error("Invalid distance");
    }

    if (isEdit && totalBookedSeats > 0 && newSeats < totalBookedSeats) {
      showCustomAlert(
        "Cannot Reduce Seats",
        `You have ${totalBookedSeats} confirmed passenger(s). You cannot reduce total seats below ${totalBookedSeats}.`,
        "warning"
      );
      throw new Error("Cannot reduce seats below booked count");
    }

    setSubmitting(true);
    
    try {
      if (!isEdit && selectedRoute) {
        console.log("🔍 Checking for passenger overlapping bookings before posting...");
        
        const passengerOverlapCheck = await checkPassengerOverlap(
          new Date(dateTime).toISOString(),
          selectedRoute.duration_minutes || 60
        );
        
        console.log("📊 Passenger overlap check result:", JSON.stringify(passengerOverlapCheck));
        
        if (passengerOverlapCheck && passengerOverlapCheck.has_overlap === true) {
          const overlappingBooking = passengerOverlapCheck.overlapping_booking;
          
          console.log("❌ PASSENGER OVERLAP DETECTED! Stopping ride post.");
          
          setSubmitting(false);
          
          showCustomAlert(
            "Cannot Post Ride - You Have a Confirmed Booking ⚠️",
            `You already have a confirmed booking as a passenger from "${overlappingBooking.origin}" to "${overlappingBooking.destination}" at ${new Date(overlappingBooking.departure_time).toLocaleTimeString()}.\n\nPlease complete that ride before offering another ride.\n\nThis ride was NOT posted.`,
            "warning",
            {
              text: "OK",
              onPress: () => {
                navigation.reset({
                  index: 0,
                  routes: [{ name: "Home", params: { phoneNumber, userData, userId } }],
                });
              }
            }
          );
          
          throw new Error("PASSENGER_OVERLAP_DETECTED");
        }
        
        console.log("🔍 Checking for driver overlapping rides before posting...");
        
        const driverOverlapCheck = await checkOverlappingRides(
          new Date(dateTime).toISOString(),
          selectedRoute.duration_minutes || 60
        );
        
        console.log("📊 Driver overlap check result:", JSON.stringify(driverOverlapCheck));
        
        if (driverOverlapCheck && driverOverlapCheck.has_overlap === true) {
          const overlappingRide = driverOverlapCheck.overlapping_ride;
          const endTime = overlappingRide.expected_end_time 
            ? new Date(overlappingRide.expected_end_time).toLocaleTimeString()
            : "later";
          
          console.log("❌ DRIVER OVERLAP DETECTED! Stopping ride post.");
          
          setSubmitting(false);
          
          showCustomAlert(
            "Cannot Post Ride - You Have an Active Ride ⚠️",
            `You already have an active ride from "${overlappingRide.origin}" to "${overlappingRide.destination}" at ${new Date(overlappingRide.departure_time).toLocaleTimeString()}.\n\nPlease wait until ${endTime} to post another ride.\n\nThis ride was NOT posted.`,
            "warning",
            {
              text: "OK",
              onPress: () => {
                navigation.reset({
                  index: 0,
                  routes: [{ name: "Home", params: { phoneNumber, userData, userId } }],
                });
              }
            }
          );
          
          throw new Error("DRIVER_OVERLAP_DETECTED");
        }
      }
      
      console.log("✅ No overlap found, proceeding to post/update ride...");
      
      const payload = {
        phone_number: phoneNumber,
        origin: from,
        destination: to,
        departure_time: new Date(dateTime).toISOString(),
        available_seats: newSeats,
        price_per_seat: Number(newPrice),
        vehicle_id: vehicleId,
        origin_coords: [fromCoords.longitude, fromCoords.latitude],
        destination_coords: [toCoords.longitude, toCoords.latitude],
        route_coordinates: selectedRoute?.geometry.map((p) => [p.longitude, p.latitude]) || [],
        distance_km: selectedRoute?.distance,
        duration_text: selectedRoute?.duration,
        total_estimated_price: selectedRoute?.price,
        preferences: { ...prefs, womenOnly: prefs.womenOnly },
        women_only: prefs.womenOnly
      };
      
      let response;
      if (isEdit && rideId) {
        response = await axios.put(`${API_BASE_URL}/update-ride/${rideId}`, payload);
      } else {
        response = await axios.post(`${API_BASE_URL}/post-ride`, payload);
      }
      
      setSubmitting(false);
      
      // showCustomAlert(
      //   "Success", 
      //   isEdit ? "Ride updated successfully!" : "Ride posted successfully!", 
      //   "success",
      //   {
      //     text: "OK",
      //     onPress: () => {
      //       navigation.reset({
      //         index: 0,
      //         routes: [{ name: "Home", params: { phoneNumber, userData, userId } }],
      //       });
      //     }
      //   }
      // );
      
      return response.data;
      
    } catch (error) {
      console.log("❌ Error in handleSubmitRide:", error);
      setSubmitting(false);
      
      let errorMsg = error.response?.data?.detail || error.message;
      
      if (error.response?.status === 409) {
        if (errorMsg.includes("confirmed booking as a passenger")) {
          errorMsg = "⚠️ You have a confirmed booking as a passenger at this time. Please complete that ride before offering another ride.\n\nThis ride was NOT posted.";
        } else {
          errorMsg = "⚠️ You already have an overlapping active ride. Please wait for it to complete before posting another ride.\n\nThis ride was NOT posted.";
        }
        
        showCustomAlert(
          "Cannot Post Ride",
          errorMsg,
          "warning",
          {
            text: "OK",
            onPress: () => {
              navigation.reset({
                index: 0,
                routes: [{ name: "Home", params: { phoneNumber, userData, userId } }],
              });
            }
          }
        );
      } else if (error.response?.status === 400 && errorMsg.includes("Cannot reduce seats")) {
        showCustomAlert("Cannot Reduce Seats", errorMsg, "warning");
      } else if (error.response?.status === 403) {
        errorMsg = "Cannot modify this ride as it has confirmed bookings.";
        showCustomAlert("Error", errorMsg, "error");
      } else if (error.message !== "PASSENGER_OVERLAP_DETECTED" && error.message !== "DRIVER_OVERLAP_DETECTED") {
        showCustomAlert("Error", errorMsg, "error");
      }
      
      throw error;
    }
  };

  if (loadingRideDetails) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar backgroundColor={Colors.white} barStyle="dark-content" />
        <View style={styles.loaderContainer}>
          <LottieView source={require("../../assets/loading.json")} autoPlay loop style={{ width: 300, height: 300 }} />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar backgroundColor={Colors.white} barStyle="dark-content" />
      
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={goBack}>
          <MaterialIcons name="arrow-back-ios" size={24} color="#ED7117" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{isEdit ? 'Edit Ride' : 'Offer a Ride'}</Text>
        <View style={styles.headerSpacer} />
      </View>

      <View style={styles.progressContainer}>
        {[1, 2, 3, 4].map((n) => (
          <View key={n} style={[styles.progressBar, { backgroundColor: n === step ? Colors.primary : '#e6eef8' }]} />
        ))}
      </View>

      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {step === 1 && (
          <Step1 
            from={from} to={to} setFrom={setFrom} setTo={setTo}
            setFromCoords={setFromCoords} setToCoords={setToCoords}
            dateTime={dateTime} setDateTime={setDateTime}
            onNext={goNext} navigation={navigation} route={route}
            phoneNumber={phoneNumber} fromCoords={fromCoords} toCoords={toCoords}
            setRouteOptions={setRouteOptions} setSelectedRouteIndex={setSelectedRouteIndex}
            isEdit={isEdit} lockedFields={lockedFields}
            validateDateTime={validateDateTime}
            onLocationChange={handleLocationChange}
          />
        )}
        
        {step === 2 && (
          <Step2 
            routeOptions={routeOptions} selectedRouteIndex={selectedRouteIndex}
            setSelectedRouteIndex={setSelectedRouteIndex} onNext={goNext}
            isEdit={isEdit} lockedFields={lockedFields}
            loadingRoute={loadingRoute}
            goBackToStep1={goBackToStep1}
            onRetryFetch={retryFetchRoutes}
          />
        )}
        
        {step === 3 && (
          <Step3 
            phoneNumber={phoneNumber} navigation={navigation}
            vehicleId={vehicleId} setVehicleId={setVehicleId}
            onNext={({ preferences, vehicleId: selectedVehicleId, maxSeats: vehicleMaxSeats }) => { 
              setPrefs(preferences || {}); 
              setVehicleId(selectedVehicleId); 
              setMaxSeats(vehicleMaxSeats || 4); 
              goNext(); 
            }}
            isEdit={isEdit} lockedFields={lockedFields}
            userGender={userGender}
          />
        )}
        
        {step === 4 && (
          <Step4 
            seatsAvailable={seatsAvailable} setSeatsAvailable={setSeatsAvailable}
            pricePerSeat={pricePerSeat} setPricePerSeat={setPricePerSeat}
            selectedRoute={selectedRoute} vehicleId={vehicleId} maxSeats={maxSeats}
            onPost={handleSubmitRide} isEdit={isEdit}
            navigation={navigation} phoneNumber={phoneNumber}
            userData={userData} userId={userId}
            rideBookings={rideBookings} lockedFields={lockedFields}
            originalRideData={originalRideData}
            totalBookedSeats={totalBookedSeats}
          />
        )}
      </ScrollView>

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
  container: { flex: 1, backgroundColor: Colors.white },
  header: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 12, borderBottomWidth: 0.5, borderBottomColor: '#F3F4F6' },
  backButton: { width: 44, height: 44, justifyContent: 'center' },
  headerTitle: { fontSize: 28, fontWeight: '700', color: Colors.primary, flex: 1, textAlign: 'center' },
  headerSpacer: { width: 44 },
  progressContainer: { flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: 24, paddingVertical: 12 },
  progressBar: { height: 6, flex: 1, marginHorizontal: 6, borderRadius: 4 },
  scrollView: { flex: 1 },
  scrollContent: { padding: 16, paddingBottom: 20 },
  loaderContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: Colors.white },
});