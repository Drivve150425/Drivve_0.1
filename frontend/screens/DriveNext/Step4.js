// import React, { useEffect, useMemo, useState } from 'react';
// import {
//   View,
//   Text,
//   TouchableOpacity,
//   TextInput,
//   StyleSheet,
//   ActivityIndicator,
//   Modal,
// } from 'react-native';
// import LottieView from "lottie-react-native";
// import { Colors } from '../../constants/Colors';
// import CustomAlert from '../../components/CustomAlert';
// import Ridesuccessanimation from '../../components/Ridesuccessanimation';

// export default function Step4({
//   seatsAvailable,
//   setSeatsAvailable,
//   pricePerSeat,
//   setPricePerSeat,
//   selectedRoute,
//   vehicleId,
//   maxSeats = 4,
//   onPost,
//   isEdit = false,
//   bookedSeats = 0,
//   navigation,
//   rideDetails,
//   userData,
//   userId,
//   phoneNumber,
// }) {

//   const [posting, setPosting] = useState(false);
//   const [showSuccess, setShowSuccess] = useState(false);
//   const buttonText = isEdit ? 'Update Ride' : 'Post Ride';

//   // Custom Alert states
//   const [alertVisible, setAlertVisible] = useState(false);
//   const [alertConfig, setAlertConfig] = useState({
//     title: "",
//     message: "",
//     icon: "check-circle",
//     iconColor: "#10B981",
//     buttons: []
//   });

//   // Available seats for passengers (maxSeats - 1 for driver)
//   const passengerSeats = Math.max(1, maxSeats - 1);
  
//   // Calculate remaining seats (passenger seats - booked seats)
//   const remainingSeats = Math.max(0, passengerSeats - bookedSeats);
  
//   // Display text for max seats
//   const maxSeatsDisplay = `${passengerSeats} + 1 (Driver)`;

//   const showCustomAlert = (title, message, type = 'success', onConfirm = null) => {
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
    
//     const buttons = onConfirm 
//       ? [
//           { text: 'Cancel', onPress: () => setAlertVisible(false), style: 'cancel' },
//           { text: 'Confirm', onPress: () => {
//               setAlertVisible(false);
//               onConfirm();
//             }
//           }
//         ]
//       : [{ text: 'OK', onPress: () => setAlertVisible(false) }];
    
//     setAlertConfig({
//       title,
//       message,
//       icon,
//       iconColor,
//       buttons
//     });
//     setAlertVisible(true);
//   };

//   /* =====================================
//      SEAT VALIDATION FUNCTION
//   ===================================== */
//   const handleSeatChange = (increment) => {
//     let newValue = seatsAvailable;
    
//     if (increment) {
//       newValue = seatsAvailable + 1;
//     } else {
//       newValue = seatsAvailable - 1;
//     }
    
//     // Check minimum seats (can't go below 1)
//     if (newValue < 1) {
//       showCustomAlert(
//         "Minimum Seats Required",
//         "You must offer at least 1 seat for passengers.",
//         "warning"
//       );
//       return;
//     }
    
//     // Check if this is an edit and remaining seats are limited
//     if (isEdit && bookedSeats > 0) {
//       const maxAdditionalSeats = remainingSeats;
//       if (newValue > maxAdditionalSeats) {
//         showCustomAlert(
//           "Cannot Add More Seats",
//           `You already have ${bookedSeats} passenger(s) booked. You can only offer up to ${maxAdditionalSeats} additional seat(s).\n\nTo add more seats, please ask passengers to cancel their bookings first.`,
//           "warning"
//         );
//         return;
//       }
//     }
    
//     // Check against vehicle capacity
//     const maxPassengerSeats = maxSeats - 1;
//     if (newValue > maxPassengerSeats) {
//       showCustomAlert(
//         "Seat Limit Exceeded",
//         `You cannot offer more than ${maxPassengerSeats} passenger seats (vehicle capacity: ${maxSeats} total seats including driver).`,
//         "warning"
//       );
//       return;
//     }
    
//     setSeatsAvailable(newValue);
//   };

//   /* =====================================
//      ESTIMATED PRICE CALCULATION
//   ===================================== */

//   const estimatedPrice = useMemo(() => {
//     if (!selectedRoute?.price) return 0;
//     return selectedRoute.price / maxSeats;
//   }, [selectedRoute, maxSeats]);

//   const minAllowed = Math.floor(estimatedPrice * 0.8);
//   const maxAllowed = Math.ceil(estimatedPrice * 1.2);

//   /* =====================================
//      AUTO UPDATE PRICE WHEN SEATS CHANGE
//   ===================================== */

//   useEffect(() => {
//     if (estimatedPrice > 0) {
//       setPricePerSeat(Math.round(estimatedPrice).toString());
//     }
//   }, [estimatedPrice]);

//   /* =====================================
//      VALIDATION
//   ===================================== */

//   const numericPrice = Number(pricePerSeat);
//   const isPriceValid = numericPrice && 
//     numericPrice >= minAllowed && 
//     numericPrice <= maxAllowed;

//   // Check if post button should be disabled
//   const isPostDisabled = !isPriceValid || posting || remainingSeats === 0 || seatsAvailable === 0;

//   const handlePost = async () => {
//     const numericPrice = Number(pricePerSeat);

//     if (!numericPrice) {
//       showCustomAlert("Invalid Price", "Please enter valid price per seat.", "warning");
//       return;
//     }

//     if (numericPrice < minAllowed || numericPrice > maxAllowed) {
//       showCustomAlert(
//         "Price Out of Range",
//         `Price must be between ₹${minAllowed} and ₹${maxAllowed}`,
//         "warning"
//       );
//       return;
//     }

//     // Show confirmation alert
//     const confirmationMessage = bookedSeats > 0
//       ? `Booked Seats: ${bookedSeats}\nPrice per seat: ₹${numericPrice}`
//       : `Price per seat: ₹${numericPrice}`;

//     showCustomAlert(
//       isEdit ? "Confirm Update" : "Confirm Post Ride",
//       confirmationMessage,
//       "info",
//       async () => {
//         // Proceed with posting after confirmation
//         await postRide(numericPrice);
//       }
//     );
//   };

//   const postRide = async (numericPrice) => {
//     setPosting(true);
//     try {
//       // Call the onPost function
//       const result = await onPost({
//         seatsAvailable: seatsAvailable,
//         pricePerSeat: numericPrice,
//       });
      
//       setPosting(false);
//       // Show success animation
//       setShowSuccess(true);
      
//     } catch (error) {
//       console.error('Error posting ride:', error);
//       // Show error message only if there's an error
//       showCustomAlert(
//         "Error", 
//         error?.message || "Failed to post ride. Please try again.", 
//         "error"
//       );
//       setPosting(false);
//     }
//   };

//   const handleSuccessComplete = () => {
//     setShowSuccess(false);
    
//     // Navigate to Home screen after success
//     if (navigation) {
//       navigation.reset({
//         index: 0,
//         routes: [
//           {
//             name: "Home",
//             params: { phoneNumber, userData, userId },
//           },
//         ],
//       });
//     } else {
//       // Fallback - just go back if navigation is not available
//       navigation?.goBack();
//     }
//   };

//   /* =====================================
//      UI
//   ===================================== */

//   return (
//     <>
//       {/* Main Content */}
//       <View style={styles.container}>
//         <Text style={styles.title}>Seats & Pricing</Text>

//         {/* Seats Selector */}
//         <View style={styles.seatSection}>
//           <Text style={styles.seatLabel}>Available Seats for Passengers</Text>
//           <View style={styles.seatRow}>
//             <TouchableOpacity
//               onPress={() => handleSeatChange(false)}
//               style={[styles.seatBtn, seatsAvailable <= 1 && styles.seatBtnDisabled]}
//               disabled={posting || seatsAvailable <= 1}
//             >
//               <Text style={[styles.seatBtnText, seatsAvailable <= 1 && styles.seatBtnTextDisabled]}>-</Text>
//             </TouchableOpacity>

//             <View style={styles.seatInfo}>
//               <Text style={styles.seatCount}>{seatsAvailable}</Text>
//               {bookedSeats > 0 && (
//                 <Text style={styles.bookedSeatsText}>
//                   {bookedSeats} seats already booked
//                 </Text>
//               )}
//             </View>

//             <TouchableOpacity
//               onPress={() => handleSeatChange(true)}
//               style={[
//                 styles.seatBtn, 
//                 (seatsAvailable >= remainingSeats || seatsAvailable >= maxSeats - 1) && styles.seatBtnDisabled
//               ]}
//               disabled={posting || seatsAvailable >= remainingSeats || seatsAvailable >= maxSeats - 1}
//             >
//               <Text style={[
//                 styles.seatBtnText, 
//                 (seatsAvailable >= remainingSeats || seatsAvailable >= maxSeats - 1) && styles.seatBtnTextDisabled
//               ]}>+</Text>
//             </TouchableOpacity>
//           </View>
          
//           <View style={styles.seatDetails}>
//             <Text style={styles.maxSeatsHint}>
//               Total passenger seats: {maxSeatsDisplay}
//             </Text>
//             <Text style={styles.maxSeatsHint}>
//               Vehicle capacity: {maxSeats} seats total (including driver)
//             </Text>
//             {bookedSeats > 0 && (
//               <Text style={styles.remainingSeatsHint}>
//                 Remaining available: {remainingSeats} seats
//               </Text>
//             )}
//           </View>
//         </View>

//         {/* Estimated */}
//         <View style={{ marginTop: 18 }}>
//           <Text style={styles.estimateLabel}>
//             Estimated per seat (based on route):
//           </Text>
//           <Text style={styles.estimateValue}>
//             ₹ {Math.round(estimatedPrice)}
//           </Text>
//           <Text style={styles.rangeText}>
//             Allowed range: ₹{minAllowed} – ₹{maxAllowed}
//           </Text>
//         </View>

//         {/* Manual Input */}
//         <View style={{ marginTop: 20 }}>
//           <Text style={styles.inputLabel}>Set Custom Price per Seat (₹)</Text>
//           <TextInput
//             value={pricePerSeat}
//             onChangeText={setPricePerSeat}
//             keyboardType="numeric"
//             style={styles.input}
//             editable={!posting}
//             placeholder={`₹${Math.round(estimatedPrice)}`}
//             placeholderTextColor={Colors.gray}
//           />
//         </View>

//         {/* Post Button */}
//         <TouchableOpacity
//           style={[
//             styles.postBtn,
//             isPostDisabled && styles.postBtnDisabled
//           ]}
//           disabled={isPostDisabled}
//           onPress={handlePost}
//           activeOpacity={0.8}
//         >
//           {posting ? (
//             <View style={styles.loadingContainer}>
//               <ActivityIndicator size="small" color="#fff" />
//               <Text style={styles.postBtnText}>
//                 {isEdit ? "Updating..." : "Posting..."}
//               </Text>
//             </View>
//           ) : (
//             <Text style={styles.postBtnText}>
//               {remainingSeats === 0 ? "No Seats Available" : buttonText}
//             </Text>
//           )}
//         </TouchableOpacity>

//         {/* Custom Alert - Only for confirmation and errors */}
//         <CustomAlert
//           visible={alertVisible}
//           title={alertConfig.title}
//           message={alertConfig.message}
//           icon={alertConfig.icon}
//           iconColor={alertConfig.iconColor}
//           buttons={alertConfig.buttons}
//           onBackdropPress={() => setAlertVisible(false)}
//         />

//         {/* Success Animation for Ride Posted */}
//         <Ridesuccessanimation 
//           visible={showSuccess} 
//           onComplete={handleSuccessComplete}
//           type="ride"
//         />
//       </View>

//       {/* Full Screen Loading Modal */}
//       <Modal
//         transparent={true}
//         visible={posting}
//         animationType="fade"
//         onRequestClose={() => {}}
//       >
//         <View style={styles.fullScreenLoader}>
//           <View style={styles.loaderContent}>
//             <LottieView
//               source={require("../../assets/loading.json")}
//               autoPlay
//               loop
//               style={{ width: 300, height: 300 }}
//             />
//           </View>
//         </View>
//       </Modal>
//     </>
//   );
// }

// const styles = StyleSheet.create({
//   container: {
//     backgroundColor: 'rgba(255, 255, 255, 0.95)',
//     borderRadius: 28,
//     padding: 18,
//     marginBottom: 14,
//     shadowColor: '#000',
//     shadowOffset: { width: 0, height: 10 },
//     shadowOpacity: 0.15,
//     shadowRadius: 20,
//     elevation: 10,
//     borderWidth: 1,
//     borderColor: 'rgba(229, 231, 235, 0.5)',
//   },
//   title: {
//     fontSize: 18,
//     fontWeight: '700',
//     marginBottom: 16,
//     color: Colors.dark
//   },
//   seatSection: {
//     marginBottom: 20,
//   },
//   seatLabel: {
//     fontSize: 14,
//     fontWeight: '600',
//     color: Colors.dark,
//     marginBottom: 12,
//   },
//   seatRow: {
//     flexDirection: 'row',
//     justifyContent: 'center',
//     alignItems: 'center',
//   },
//   seatBtn: {
//     width: 50,
//     height: 50,
//     borderRadius: 14,
//     borderWidth: 1,
//     borderColor: '#e6eef8',
//     justifyContent: 'center',
//     alignItems: 'center',
//     backgroundColor: '#fff',
//   },
//   seatBtnDisabled: {
//     borderColor: '#e0e0e0',
//     backgroundColor: '#f5f5f5',
//   },
//   seatBtnText: {
//     fontSize: 22,
//     fontWeight: '700',
//     color: Colors.dark,
//   },
//   seatBtnTextDisabled: {
//     color: '#c0c0c0',
//   },
//   seatInfo: {
//     alignItems: 'center',
//     marginHorizontal: 24,
//   },
//   seatCount: {
//     fontSize: 28,
//     fontWeight: '700',
//     color: Colors.primary,
//   },
//   bookedSeatsText: {
//     fontSize: 11,
//     color: Colors.gray,
//     marginTop: 4,
//   },
//   seatDetails: {
//     alignItems: 'center',
//     marginTop: 12,
//   },
//   maxSeatsHint: {
//     fontSize: 12,
//     color: Colors.gray,
//     textAlign: 'center',
//   },
//   remainingSeatsHint: {
//     fontSize: 12,
//     color: Colors.primary,
//     textAlign: 'center',
//     marginTop: 4,
//     fontWeight: '600',
//   },
//   estimateLabel: {
//     fontSize: 14,
//     color: Colors.gray
//   },
//   estimateValue: {
//     fontSize: 22,
//     fontWeight: '700',
//     marginTop: 4,
//     color: Colors.primary
//   },
//   rangeText: {
//     fontSize: 12,
//     marginTop: 4,
//     color: Colors.gray
//   },
//   inputLabel: {
//     fontSize: 13,
//     marginBottom: 6,
//     color: Colors.gray
//   },
//   input: {
//     borderWidth: 1.5,
//     borderColor: '#E5E7EB',
//     borderRadius: 14,
//     paddingHorizontal: 16,
//     paddingVertical: 12,
//     fontSize: 16,
//     backgroundColor: '#F9FAFB',
//     color: Colors.dark,
//   },
//   postBtn: {
//     backgroundColor: Colors.primary,
//     paddingVertical: 14,
//     borderRadius: 16,
//     alignItems: 'center',
//     marginTop: 22,
//     minHeight: 52,
//     justifyContent: 'center',
//   },
//   postBtnDisabled: {
//     opacity: 0.6,
//   },
//   postBtnText: {
//     color: '#fff',
//     fontWeight: '700',
//     fontSize: 16
//   },
//   loadingContainer: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     justifyContent: 'center',
//     gap: 10,
//   },
//   fullScreenLoader: {
//     flex: 1,
//     backgroundColor: Colors.white,
//     justifyContent: 'center',
//     alignItems: 'center',
//   },
//   loaderContent: {
//     alignItems: 'center',
//     justifyContent: 'center',
//   },
//   loaderText: {
//     marginTop: 20,
//     fontSize: 18,
//     color: Colors.primary,
//     fontWeight: '600',
//     textAlign: 'center',
//   },
// });
// Step4.js
// import React, { useEffect, useMemo, useState } from 'react';
// import {
//   View,
//   Text,
//   TouchableOpacity,
//   TextInput,
//   StyleSheet,
//   ActivityIndicator,
//   Modal,
// } from 'react-native';
// import LottieView from "lottie-react-native";
// import { Colors } from '../../constants/Colors';
// import CustomAlert from '../../components/CustomAlert';
// import Ridesuccessanimation from '../../components/Ridesuccessanimation';
// import { MaterialIcons } from '@expo/vector-icons';

// export default function Step4({
//   seatsAvailable,
//   setSeatsAvailable,
//   pricePerSeat,
//   setPricePerSeat,
//   selectedRoute,
//   vehicleId,
//   maxSeats = 4,
//   onPost,
//   isEdit = false,
//   navigation,
//   rideDetails,
//   userData,
//   userId,
//   phoneNumber,
//   rideBookings = null,
//   lockedFields = [],
// }) {

//   const [posting, setPosting] = useState(false);
//   const [showSuccess, setShowSuccess] = useState(false);
//   const buttonText = isEdit ? 'Update Ride' : 'Post Ride';

//   const [alertVisible, setAlertVisible] = useState(false);
//   const [alertConfig, setAlertConfig] = useState({
//     title: "",
//     message: "",
//     icon: "check-circle",
//     iconColor: "#10B981",
//     buttons: []
//   });

//   // Calculate booked seats from confirmed bookings
//   const confirmedBookings = rideBookings?.filter(b => b.status === 'accepted') || [];
//   const totalBookedSeats = confirmedBookings.reduce((sum, booking) => sum + (booking.seats || 1), 0);
  
//   const passengerSeats = Math.max(1, maxSeats - 1);
//   const remainingSeats = Math.max(0, passengerSeats - totalBookedSeats);
//   const maxSeatsDisplay = `${passengerSeats} + 1 (Driver)`;
  
//   // Check lock status
//   const hasConfirmedBookings = confirmedBookings.length > 0;
//   const isPriceLocked = lockedFields.includes('price') && hasConfirmedBookings;
//   const isSeatsLocked = lockedFields.includes('seats') && hasConfirmedBookings;
//   const minSeatsAllowed = Math.max(1, totalBookedSeats);

//   const showCustomAlert = (title, message, type = 'success', onConfirm = null) => {
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
    
//     const buttons = onConfirm 
//       ? [
//           { text: 'Cancel', onPress: () => setAlertVisible(false), style: 'cancel' },
//           { text: 'Confirm', onPress: () => {
//               setAlertVisible(false);
//               onConfirm();
//             }
//           }
//         ]
//       : [{ text: 'OK', onPress: () => setAlertVisible(false) }];
    
//     setAlertConfig({
//       title,
//       message,
//       icon,
//       iconColor,
//       buttons
//     });
//     setAlertVisible(true);
//   };

//   /* =====================================
//      SEAT VALIDATION FUNCTION
//   ===================================== */
//   const handleSeatChange = (increment) => {
//     if (isSeatsLocked) {
//       showCustomAlert(
//         "Seats Locked",
//         `Cannot modify seats. You have ${totalBookedSeats} confirmed passenger(s). To change seat availability, please contact passengers to cancel their bookings first.`,
//         "warning"
//       );
//       return;
//     }
    
//     let newValue = seatsAvailable;
    
//     if (increment) {
//       newValue = seatsAvailable + 1;
//     } else {
//       newValue = seatsAvailable - 1;
//     }
    
//     // Check minimum seats (can't go below booked seats)
//     if (newValue < minSeatsAllowed) {
//       showCustomAlert(
//         "Minimum Seats Required",
//         `You cannot reduce seats below ${minSeatsAllowed} as you have ${totalBookedSeats} confirmed passenger(s).`,
//         "warning"
//       );
//       return;
//     }
    
//     // Check against vehicle capacity
//     const maxPassengerSeats = maxSeats - 1;
//     if (newValue > maxPassengerSeats) {
//       showCustomAlert(
//         "Seat Limit Exceeded",
//         `You cannot offer more than ${maxPassengerSeats} passenger seats (vehicle capacity: ${maxSeats} total seats including driver).`,
//         "warning"
//       );
//       return;
//     }
    
//     setSeatsAvailable(newValue);
//   };

//   /* =====================================
//      ESTIMATED PRICE CALCULATION
//   ===================================== */

//   const estimatedPrice = useMemo(() => {
//     if (!selectedRoute?.price) return 0;
//     return selectedRoute.price / maxSeats;
//   }, [selectedRoute, maxSeats]);

//   const minAllowed = Math.floor(estimatedPrice * 0.8);
//   const maxAllowed = Math.ceil(estimatedPrice * 1.2);

//   useEffect(() => {
//     if (estimatedPrice > 0 && !isPriceLocked) {
//       setPricePerSeat(Math.round(estimatedPrice).toString());
//     }
//   }, [estimatedPrice, isPriceLocked]);

//   const numericPrice = Number(pricePerSeat);
//   const isPriceValid = numericPrice && 
//     numericPrice >= minAllowed && 
//     numericPrice <= maxAllowed;

//   const isPostDisabled = (!isPriceValid && !isPriceLocked) || 
//     posting || 
//     remainingSeats === 0 || 
//     seatsAvailable === 0 ||
//     (isPriceLocked && numericPrice !== pricePerSeat);

//   const handlePost = async () => {
//     const numericPriceValue = Number(pricePerSeat);

//     if (!isPriceLocked) {
//       if (!numericPriceValue) {
//         showCustomAlert("Invalid Price", "Please enter valid price per seat.", "warning");
//         return;
//       }

//       if (numericPriceValue < minAllowed || numericPriceValue > maxAllowed) {
//         showCustomAlert(
//           "Price Out of Range",
//           `Price must be between ₹${minAllowed} and ₹${maxAllowed}`,
//           "warning"
//         );
//         return;
//       }
//     }

//     const confirmationMessage = totalBookedSeats > 0
//       ? `Booked Seats: ${totalBookedSeats}\nPrice per seat: ₹${numericPriceValue}\n\nNote: Changes will be communicated to passengers.`
//       : `Price per seat: ₹${numericPriceValue}`;

//     showCustomAlert(
//       isEdit ? "Confirm Update" : "Confirm Post Ride",
//       confirmationMessage,
//       "info",
//       async () => {
//         await postRide(numericPriceValue);
//       }
//     );
//   };

//   const postRide = async (numericPriceValue) => {
//     setPosting(true);
//     try {
//       const result = await onPost({
//         seatsAvailable: seatsAvailable,
//         pricePerSeat: numericPriceValue,
//       });
      
//       setPosting(false);
//       setShowSuccess(true);
      
//     } catch (error) {
//       console.error('Error posting ride:', error);
//       showCustomAlert(
//         "Error", 
//         error?.message || "Failed to post ride. Please try again.", 
//         "error"
//       );
//       setPosting(false);
//     }
//   };

//   const handleSuccessComplete = () => {
//     setShowSuccess(false);
    
//     if (navigation) {
//       navigation.reset({
//         index: 0,
//         routes: [
//           {
//             name: "Home",
//             params: { phoneNumber, userData, userId },
//           },
//         ],
//       });
//     } else {
//       navigation?.goBack();
//     }
//   };

//   return (
//     <>
//       <View style={styles.container}>
//         <Text style={styles.title}>Seats & Pricing</Text>

//         {/* Locked Warning Banner */}
//         {isEdit && hasConfirmedBookings && (
//           <View style={styles.lockedWarningBanner}>
//             <MaterialIcons name="lock" size={20} color="#F59E0B" />
//             <Text style={styles.lockedWarningText}>
//               This ride has {totalBookedSeats} confirmed booking(s). Major fields cannot be changed.
//             </Text>
//           </View>
//         )}

//         {/* Seats Selector */}
//         <View style={styles.seatSection}>
//           <Text style={styles.seatLabel}>Available Seats for Passengers</Text>
          
//           {totalBookedSeats > 0 && (
//             <View style={styles.bookingSummary}>
//               <Text style={styles.bookingSummaryText}>
//                 ✅ {totalBookedSeats} seat(s) already booked
//               </Text>
//               {isSeatsLocked && (
//                 <Text style={styles.lockedHint}>Seat count is locked. Cannot modify.</Text>
//               )}
//             </View>
//           )}
          
//           <View style={styles.seatRow}>
//             <TouchableOpacity
//               onPress={() => handleSeatChange(false)}
//               style={[styles.seatBtn, (seatsAvailable <= minSeatsAllowed || isSeatsLocked) && styles.seatBtnDisabled]}
//               disabled={posting || seatsAvailable <= minSeatsAllowed || isSeatsLocked}
//             >
//               <Text style={[styles.seatBtnText, (seatsAvailable <= minSeatsAllowed || isSeatsLocked) && styles.seatBtnTextDisabled]}>-</Text>
//             </TouchableOpacity>

//             <View style={styles.seatInfo}>
//               <Text style={styles.seatCount}>{seatsAvailable}</Text>
//               {totalBookedSeats > 0 && (
//                 <Text style={styles.bookedSeatsText}>
//                   {totalBookedSeats} booked
//                 </Text>
//               )}
//             </View>

//             <TouchableOpacity
//               onPress={() => handleSeatChange(true)}
//               style={[
//                 styles.seatBtn, 
//                 (seatsAvailable >= remainingSeats || seatsAvailable >= maxSeats - 1 || isSeatsLocked) && styles.seatBtnDisabled
//               ]}
//               disabled={posting || seatsAvailable >= remainingSeats || seatsAvailable >= maxSeats - 1 || isSeatsLocked}
//             >
//               <Text style={styles.seatBtnText}>+</Text>
//             </TouchableOpacity>
//           </View>
          
//           <View style={styles.seatDetails}>
//             <Text style={styles.maxSeatsHint}>
//               Total passenger seats: {maxSeatsDisplay}
//             </Text>
//             <Text style={styles.maxSeatsHint}>
//               Vehicle capacity: {maxSeats} seats total (including driver)
//             </Text>
//             {totalBookedSeats > 0 && (
//               <>
//                 <Text style={styles.remainingSeatsHint}>
//                   Remaining available: {remainingSeats} seats
//                 </Text>
//                 <Text style={styles.noteText}>
//                   Note: You cannot reduce seats below booked count ({totalBookedSeats})
//                 </Text>
//               </>
//             )}
//           </View>
//         </View>

//         {/* Estimated Price Section */}
//         <View style={{ marginTop: 18 }}>
//           <Text style={styles.estimateLabel}>
//             Estimated per seat (based on route):
//           </Text>
//           <Text style={styles.estimateValue}>
//             ₹ {Math.round(estimatedPrice)}
//           </Text>
//           <Text style={styles.rangeText}>
//             Allowed range: ₹{minAllowed} – ₹{maxAllowed}
//           </Text>
          
//           {isPriceLocked && (
//             <View style={styles.lockedPriceWarning}>
//               <MaterialIcons name="lock" size={16} color={Colors.gray} />
//               <Text style={styles.lockedPriceText}>
//                 Price is locked due to confirmed bookings
//               </Text>
//             </View>
//           )}
//         </View>

//         {/* Manual Price Input */}
//         <View style={{ marginTop: 20 }}>
//           <Text style={styles.inputLabel}>Set Custom Price per Seat (₹)</Text>
//           <TextInput
//             value={pricePerSeat}
//             onChangeText={setPricePerSeat}
//             keyboardType="numeric"
//             style={[styles.input, isPriceLocked && styles.inputDisabled]}
//             editable={!posting && !isPriceLocked}
//             placeholder={`₹${Math.round(estimatedPrice)}`}
//             placeholderTextColor={Colors.gray}
//           />
//           {isPriceLocked && (
//             <Text style={styles.disabledHint}>
//               Price cannot be changed after confirmed bookings
//             </Text>
//           )}
//         </View>

//         {/* Cancel Ride Option for Edit Mode */}
//         {isEdit && totalBookedSeats > 0 && (
//           <TouchableOpacity
//             style={styles.cancelRideButton}
//             onPress={() => {
//               showCustomAlert(
//                 "Cancel Ride",
//                 "Are you sure you want to cancel this ride? This will notify all booked passengers and may apply cancellation fees.",
//                 "warning",
//                 () => {
//                   navigation.navigate("CancelRideScreen", { rideId: rideDetails?.id });
//                 }
//               );
//             }}
//           >
//             <Text style={styles.cancelRideText}>Cancel This Ride</Text>
//           </TouchableOpacity>
//         )}

//         {/* Post/Update Button */}
//         <TouchableOpacity
//           style={[
//             styles.postBtn,
//             isPostDisabled && styles.postBtnDisabled
//           ]}
//           disabled={isPostDisabled}
//           onPress={handlePost}
//           activeOpacity={0.8}
//         >
//           {posting ? (
//             <View style={styles.loadingContainer}>
//               <ActivityIndicator size="small" color="#fff" />
//               <Text style={styles.postBtnText}>
//                 {isEdit ? "Updating..." : "Posting..."}
//               </Text>
//             </View>
//           ) : (
//             <Text style={styles.postBtnText}>
//               {remainingSeats === 0 ? "Ride Full" : buttonText}
//             </Text>
//           )}
//         </TouchableOpacity>

//         <CustomAlert
//           visible={alertVisible}
//           title={alertConfig.title}
//           message={alertConfig.message}
//           icon={alertConfig.icon}
//           iconColor={alertConfig.iconColor}
//           buttons={alertConfig.buttons}
//           onBackdropPress={() => setAlertVisible(false)}
//         />

//         <Ridesuccessanimation 
//           visible={showSuccess} 
//           onComplete={handleSuccessComplete}
//           type="ride"
//         />
//       </View>

//       {/* Full Screen Loading Modal */}
//       <Modal
//         transparent={true}
//         visible={posting}
//         animationType="fade"
//         onRequestClose={() => {}}
//       >
//         <View style={styles.fullScreenLoader}>
//           <View style={styles.loaderContent}>
//             <LottieView
//               source={require("../../assets/loading.json")}
//               autoPlay
//               loop
//               style={{ width: 300, height: 300 }}
//             />
//           </View>
//         </View>
//       </Modal>
//     </>
//   );
// }

// const styles = StyleSheet.create({
//   container: {
//     backgroundColor: 'rgba(255, 255, 255, 0.95)',
//     borderRadius: 28,
//     padding: 18,
//     marginBottom: 14,
//     shadowColor: '#000',
//     shadowOffset: { width: 0, height: 10 },
//     shadowOpacity: 0.15,
//     shadowRadius: 20,
//     elevation: 10,
//     borderWidth: 1,
//     borderColor: 'rgba(229, 231, 235, 0.5)',
//   },
//   title: {
//     fontSize: 18,
//     fontWeight: '700',
//     marginBottom: 16,
//     color: Colors.dark
//   },
//   lockedWarningBanner: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     backgroundColor: '#FEF3C7',
//     padding: 12,
//     borderRadius: 12,
//     marginBottom: 16,
//     gap: 8,
//   },
//   lockedWarningText: {
//     flex: 1,
//     fontSize: 12,
//     color: '#92400E',
//   },
//   seatSection: {
//     marginBottom: 20,
//   },
//   seatLabel: {
//     fontSize: 14,
//     fontWeight: '600',
//     color: Colors.dark,
//     marginBottom: 12,
//   },
//   bookingSummary: {
//     backgroundColor: '#EFF6FF',
//     padding: 10,
//     borderRadius: 10,
//     marginBottom: 12,
//     alignItems: 'center',
//   },
//   bookingSummaryText: {
//     fontSize: 14,
//     fontWeight: '600',
//     color: Colors.primary,
//   },
//   seatRow: {
//     flexDirection: 'row',
//     justifyContent: 'center',
//     alignItems: 'center',
//   },
//   seatBtn: {
//     width: 50,
//     height: 50,
//     borderRadius: 14,
//     borderWidth: 1,
//     borderColor: '#e6eef8',
//     justifyContent: 'center',
//     alignItems: 'center',
//     backgroundColor: '#fff',
//   },
//   seatBtnDisabled: {
//     borderColor: '#e0e0e0',
//     backgroundColor: '#f5f5f5',
//   },
//   seatBtnText: {
//     fontSize: 22,
//     fontWeight: '700',
//     color: Colors.dark,
//   },
//   seatBtnTextDisabled: {
//     color: '#c0c0c0',
//   },
//   seatInfo: {
//     alignItems: 'center',
//     marginHorizontal: 24,
//   },
//   seatCount: {
//     fontSize: 28,
//     fontWeight: '700',
//     color: Colors.primary,
//   },
//   bookedSeatsText: {
//     fontSize: 11,
//     color: Colors.gray,
//     marginTop: 4,
//   },
//   seatDetails: {
//     alignItems: 'center',
//     marginTop: 12,
//   },
//   maxSeatsHint: {
//     fontSize: 12,
//     color: Colors.gray,
//     textAlign: 'center',
//   },
//   remainingSeatsHint: {
//     fontSize: 12,
//     color: Colors.primary,
//     textAlign: 'center',
//     marginTop: 4,
//     fontWeight: '600',
//   },
//   estimateLabel: {
//     fontSize: 14,
//     color: Colors.gray
//   },
//   estimateValue: {
//     fontSize: 22,
//     fontWeight: '700',
//     marginTop: 4,
//     color: Colors.primary
//   },
//   rangeText: {
//     fontSize: 12,
//     marginTop: 4,
//     color: Colors.gray
//   },
//   inputLabel: {
//     fontSize: 13,
//     marginBottom: 6,
//     color: Colors.gray
//   },
//   input: {
//     borderWidth: 1.5,
//     borderColor: '#E5E7EB',
//     borderRadius: 14,
//     paddingHorizontal: 16,
//     paddingVertical: 12,
//     fontSize: 16,
//     backgroundColor: '#F9FAFB',
//     color: Colors.dark,
//   },
//   inputDisabled: {
//     backgroundColor: '#F3F4F6',
//     color: Colors.gray,
//   },
//   postBtn: {
//     backgroundColor: Colors.primary,
//     paddingVertical: 14,
//     borderRadius: 16,
//     alignItems: 'center',
//     marginTop: 22,
//     minHeight: 52,
//     justifyContent: 'center',
//   },
//   postBtnDisabled: {
//     opacity: 0.6,
//   },
//   postBtnText: {
//     color: '#fff',
//     fontWeight: '700',
//     fontSize: 16
//   },
//   loadingContainer: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     justifyContent: 'center',
//     gap: 10,
//   },
//   fullScreenLoader: {
//     flex: 1,
//     backgroundColor: Colors.white,
//     justifyContent: 'center',
//     alignItems: 'center',
//   },
//   loaderContent: {
//     alignItems: 'center',
//     justifyContent: 'center',
//   },
//   cancelRideButton: {
//     marginTop: 16,
//     paddingVertical: 12,
//     alignItems: 'center',
//     borderWidth: 1,
//     borderColor: '#EF4444',
//     borderRadius: 12,
//     backgroundColor: '#FEF2F2',
//   },
//   cancelRideText: {
//     color: '#EF4444',
//     fontWeight: '600',
//     fontSize: 14,
//   },
//   lockedHint: {
//     fontSize: 11,
//     color: Colors.gray,
//     marginTop: 4,
//   },
//   lockedPriceWarning: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     marginTop: 8,
//     gap: 6,
//   },
//   lockedPriceText: {
//     fontSize: 12,
//     color: Colors.gray,
//   },
//   disabledHint: {
//     fontSize: 11,
//     color: Colors.gray,
//     marginTop: 4,
//   },
//   noteText: {
//     fontSize: 11,
//     color: Colors.gray,
//     marginTop: 4,
//     fontStyle: 'italic',
//   },
// });
// import React, { useEffect, useMemo, useState } from 'react';
// import {
//   View,
//   Text,
//   TouchableOpacity,
//   TextInput,
//   StyleSheet,
//   ActivityIndicator,
//   Modal,
// } from 'react-native';
// import LottieView from "lottie-react-native";
// import { Colors } from '../../constants/Colors';
// import CustomAlert from '../../components/CustomAlert';
// import Ridesuccessanimation from '../../components/Ridesuccessanimation';
// import { MaterialIcons } from '@expo/vector-icons';

// export default function Step4({
//   seatsAvailable,
//   setSeatsAvailable,
//   pricePerSeat,
//   setPricePerSeat,
//   selectedRoute,
//   vehicleId,
//   maxSeats = 4,
//   onPost,
//   isEdit = false,
//   navigation,
//   rideDetails,
//   userData,
//   userId,
//   phoneNumber,
//   rideBookings = null,
//   lockedFields = [],
//   originalRideData = null,
// }) {

//   const [posting, setPosting] = useState(false);
//   const [showSuccess, setShowSuccess] = useState(false);
//   const buttonText = isEdit ? 'Update Ride' : 'Post Ride';

//   const [alertVisible, setAlertVisible] = useState(false);
//   const [alertConfig, setAlertConfig] = useState({
//     title: "",
//     message: "",
//     icon: "check-circle",
//     iconColor: "#10B981",
//     buttons: []
//   });

//   const confirmedBookings = rideBookings?.filter(b => b.status === 'accepted') || [];
//   const totalBookedSeats = confirmedBookings.reduce((sum, booking) => sum + (booking.seats || 1), 0);
  
//   const passengerSeats = Math.max(1, maxSeats - 1);
//   const remainingSeats = Math.max(0, passengerSeats - totalBookedSeats);
//   const maxSeatsDisplay = `${passengerSeats} + 1 (Driver)`;
  
//   const hasConfirmedBookings = confirmedBookings.length > 0;
//   const isPriceLocked = lockedFields.includes('price') && hasConfirmedBookings;
//   const isSeatsLocked = lockedFields.includes('seats') && hasConfirmedBookings;
//   const minSeatsAllowed = Math.max(1, totalBookedSeats);

//   const showCustomAlert = (title, message, type = 'success', onConfirm = null) => {
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
    
//     const buttons = onConfirm 
//       ? [
//           { text: 'Cancel', onPress: () => setAlertVisible(false), style: 'cancel' },
//           { text: 'Confirm', onPress: () => {
//               setAlertVisible(false);
//               onConfirm();
//             }
//           }
//         ]
//       : [{ text: 'OK', onPress: () => setAlertVisible(false) }];
    
//     setAlertConfig({
//       title,
//       message,
//       icon,
//       iconColor,
//       buttons
//     });
//     setAlertVisible(true);
//   };

//   const handleSeatChange = (increment) => {
//     if (isSeatsLocked) {
//       showCustomAlert(
//         "Seats Locked",
//         `Cannot modify seats. You have ${totalBookedSeats} confirmed passenger(s). To change seat availability, please contact passengers to cancel their bookings first.`,
//         "warning"
//       );
//       return;
//     }
    
//     let newValue = seatsAvailable;
    
//     if (increment) {
//       newValue = seatsAvailable + 1;
//     } else {
//       newValue = seatsAvailable - 1;
//     }
    
//     if (newValue < minSeatsAllowed) {
//       showCustomAlert(
//         "Minimum Seats Required",
//         `You cannot reduce seats below ${minSeatsAllowed} as you have ${totalBookedSeats} confirmed passenger(s).`,
//         "warning"
//       );
//       return;
//     }
    
//     const maxPassengerSeats = maxSeats - 1;
//     if (newValue > maxPassengerSeats) {
//       showCustomAlert(
//         "Seat Limit Exceeded",
//         `You cannot offer more than ${maxPassengerSeats} passenger seats (vehicle capacity: ${maxSeats} total seats including driver).`,
//         "warning"
//       );
//       return;
//     }
    
//     setSeatsAvailable(newValue);
//   };

//   const estimatedPrice = useMemo(() => {
//     if (!selectedRoute?.price) return 0;
//     return selectedRoute.price / maxSeats;
//   }, [selectedRoute, maxSeats]);

//   const minAllowed = Math.floor(estimatedPrice * 0.8);
//   const maxAllowed = Math.ceil(estimatedPrice * 1.2);

//   useEffect(() => {
//     if (estimatedPrice > 0 && !isPriceLocked && !pricePerSeat) {
//       setPricePerSeat(Math.round(estimatedPrice).toString());
//     }
//   }, [estimatedPrice, isPriceLocked]);

//   const numericPrice = Number(pricePerSeat);
//   const isPriceValid = numericPrice && 
//     numericPrice >= minAllowed && 
//     numericPrice <= maxAllowed;

//   const isPostDisabled = (!isPriceValid && !isPriceLocked) || 
//     posting || 
//     remainingSeats === 0 || 
//     seatsAvailable === 0;

// const handlePost = async () => {
//   const numericPriceValue = Number(pricePerSeat);

//   if (!isPriceLocked) {
//     if (!numericPriceValue || isNaN(numericPriceValue)) {
//       showCustomAlert("Invalid Price", "Please enter valid price per seat.", "warning");
//       return;
//     }

//     if (numericPriceValue < minAllowed || numericPriceValue > maxAllowed) {
//       showCustomAlert(
//         "Price Out of Range",
//         `Price must be between ₹${minAllowed} and ₹${maxAllowed}`,
//         "warning"
//       );
//       return;
//     }
//   }

//   const confirmationMessage = hasConfirmedBookings
//     ? `Booked Seats: ${totalBookedSeats}\nPrice per seat: ₹${numericPriceValue}\n\nNote: Changes will be communicated to passengers.`
//     : `Price per seat: ₹${numericPriceValue}`;

//   showCustomAlert(
//     isEdit ? "Confirm Update" : "Confirm Post Ride",
//     confirmationMessage,
//     "info",
//     async () => {
//       setPosting(true);
//       try {
//         // Call parent's handleSubmitRide
//         const result = await onPost({
//           seatsAvailable: seatsAvailable,
//           pricePerSeat: numericPriceValue,
//         });
        
//         // ✅ Only reach here if NO error and NO overlap
//         setPosting(false);
//         setShowSuccess(true);
        
//       } catch (error) {
//         console.log("❌ Post failed:", error);
//         // ✅ Error already shown by parent, just reset posting
//         setPosting(false);
//         // ✅ DO NOT setShowSuccess(true) here
//       }
//     }
//   );
// };

//   const handleSuccessComplete = () => {
//     setShowSuccess(false);
//     setPosting(false);
    
//     if (navigation) {
//       navigation.reset({
//         index: 0,
//         routes: [
//           {
//             name: "Home",
//             params: { phoneNumber, userData, userId },
//           },
//         ],
//       });
//     } else {
//       navigation?.goBack();
//     }
//   };

//   return (
//     <>
//       <View style={styles.container}>
//         <Text style={styles.title}>Seats & Pricing</Text>

//         {isEdit && hasConfirmedBookings && (
//           <View style={styles.lockedWarningBanner}>
//             <MaterialIcons name="lock" size={20} color="#F59E0B" />
//             <Text style={styles.lockedWarningText}>
//               This ride has {totalBookedSeats} confirmed booking(s). Major fields cannot be changed.
//             </Text>
//           </View>
//         )}

//         <View style={styles.seatSection}>
//           <Text style={styles.seatLabel}>Available Seats for Passengers</Text>
          
//           {totalBookedSeats > 0 && (
//             <View style={styles.bookingSummary}>
//               <Text style={styles.bookingSummaryText}>
//                 ✅ {totalBookedSeats} seat(s) already booked
//               </Text>
//               {isSeatsLocked && (
//                 <Text style={styles.lockedHint}>Seat count is locked. Cannot modify.</Text>
//               )}
//             </View>
//           )}
          
//           <View style={styles.seatRow}>
//             <TouchableOpacity
//               onPress={() => handleSeatChange(false)}
//               style={[styles.seatBtn, (seatsAvailable <= minSeatsAllowed || isSeatsLocked) && styles.seatBtnDisabled]}
//               disabled={posting || seatsAvailable <= minSeatsAllowed || isSeatsLocked}
//             >
//               <Text style={[styles.seatBtnText, (seatsAvailable <= minSeatsAllowed || isSeatsLocked) && styles.seatBtnTextDisabled]}>-</Text>
//             </TouchableOpacity>

//             <View style={styles.seatInfo}>
//               <Text style={styles.seatCount}>{seatsAvailable}</Text>
//               {totalBookedSeats > 0 && (
//                 <Text style={styles.bookedSeatsText}>
//                   {totalBookedSeats} booked
//                 </Text>
//               )}
//             </View>

//             <TouchableOpacity
//               onPress={() => handleSeatChange(true)}
//               style={[
//                 styles.seatBtn, 
//                 (seatsAvailable >= remainingSeats || seatsAvailable >= maxSeats - 1 || isSeatsLocked) && styles.seatBtnDisabled
//               ]}
//               disabled={posting || seatsAvailable >= remainingSeats || seatsAvailable >= maxSeats - 1 || isSeatsLocked}
//             >
//               <Text style={styles.seatBtnText}>+</Text>
//             </TouchableOpacity>
//           </View>
          
//           <View style={styles.seatDetails}>
//             <Text style={styles.maxSeatsHint}>
//               Total passenger seats: {maxSeatsDisplay}
//             </Text>
//             <Text style={styles.maxSeatsHint}>
//               Vehicle capacity: {maxSeats} seats total (including driver)
//             </Text>
//             {totalBookedSeats > 0 && (
//               <>
//                 <Text style={styles.remainingSeatsHint}>
//                   Remaining available: {remainingSeats} seats
//                 </Text>
//                 <Text style={styles.noteText}>
//                   Note: You cannot reduce seats below booked count ({totalBookedSeats})
//                 </Text>
//               </>
//             )}
//           </View>
//         </View>

//         <View style={{ marginTop: 18 }}>
//           <Text style={styles.estimateLabel}>
//             Estimated per seat (based on route):
//           </Text>
//           <Text style={styles.estimateValue}>
//             ₹ {Math.round(estimatedPrice)}
//           </Text>
//           <Text style={styles.rangeText}>
//             Allowed range: ₹{minAllowed} – ₹{maxAllowed}
//           </Text>
          
//           {isPriceLocked && (
//             <View style={styles.lockedPriceWarning}>
//               <MaterialIcons name="lock" size={16} color={Colors.gray} />
//               <Text style={styles.lockedPriceText}>
//                 Price is locked due to confirmed bookings
//               </Text>
//             </View>
//           )}
//         </View>

//         <View style={{ marginTop: 20 }}>
//           <Text style={styles.inputLabel}>Set Custom Price per Seat (₹)</Text>
//           <TextInput
//             value={pricePerSeat}
//             onChangeText={setPricePerSeat}
//             keyboardType="numeric"
//             style={[styles.input, isPriceLocked && styles.inputDisabled]}
//             editable={!posting && !isPriceLocked}
//             placeholder={`₹${Math.round(estimatedPrice)}`}
//             placeholderTextColor={Colors.gray}
//           />
//           {isPriceLocked && (
//             <Text style={styles.disabledHint}>
//               Price cannot be changed after confirmed bookings
//             </Text>
//           )}
//         </View>

//         {isEdit && hasConfirmedBookings && (
//           <TouchableOpacity
//             style={styles.cancelRideButton}
//             onPress={() => {
//               showCustomAlert(
//                 "Cancel Ride",
//                 "Are you sure you want to cancel this ride? This will notify all booked passengers and may apply cancellation fees.",
//                 "warning",
//                 () => {
//                   navigation.navigate("CancelRideScreen", { rideId: originalRideData?.id });
//                 }
//               );
//             }}
//           >
//             <Text style={styles.cancelRideText}>Cancel This Ride</Text>
//           </TouchableOpacity>
//         )}

//         <TouchableOpacity
//           style={[
//             styles.postBtn,
//             isPostDisabled && styles.postBtnDisabled
//           ]}
//           disabled={isPostDisabled}
//           onPress={handlePost}
//           activeOpacity={0.8}
//         >
//           {posting ? (
//             <View style={styles.loadingContainer}>
//               <ActivityIndicator size="small" color="#fff" />
//               <Text style={styles.postBtnText}>
//                 {isEdit ? "Processing..." : "Processing..."}
//               </Text>
//             </View>
//           ) : (
//             <Text style={styles.postBtnText}>
//               {remainingSeats === 0 ? "Ride Full" : buttonText}
//             </Text>
//           )}
//         </TouchableOpacity>

//         <CustomAlert
//           visible={alertVisible}
//           title={alertConfig.title}
//           message={alertConfig.message}
//           icon={alertConfig.icon}
//           iconColor={alertConfig.iconColor}
//           buttons={alertConfig.buttons}
//           onBackdropPress={() => setAlertVisible(false)}
//         />

//         <Ridesuccessanimation 
//           visible={showSuccess} 
//           onComplete={handleSuccessComplete}
//           type="ride"
//         />
//       </View>

//       <Modal
//         transparent={true}
//         visible={posting && !showSuccess}
//         animationType="fade"
//         onRequestClose={() => {}}
//       >
//         <View style={styles.fullScreenLoader}>
//           <View style={styles.loaderContent}>
//             <LottieView
//               source={require("../../assets/loading.json")}
//               autoPlay
//               loop
//               style={{ width: 300, height: 300 }}
//             />
//           </View>
//         </View>
//       </Modal>
//     </>
//   );
// }

// const styles = StyleSheet.create({
//   container: {
//     backgroundColor: 'rgba(255, 255, 255, 0.95)',
//     borderRadius: 28,
//     padding: 18,
//     marginBottom: 14,
//     shadowColor: '#000',
//     shadowOffset: { width: 0, height: 10 },
//     shadowOpacity: 0.15,
//     shadowRadius: 20,
//     elevation: 10,
//     borderWidth: 1,
//     borderColor: 'rgba(229, 231, 235, 0.5)',
//   },
//   title: {
//     fontSize: 18,
//     fontWeight: '700',
//     marginBottom: 16,
//     color: Colors.dark
//   },
//   lockedWarningBanner: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     backgroundColor: '#FEF3C7',
//     padding: 12,
//     borderRadius: 12,
//     marginBottom: 16,
//     gap: 8,
//   },
//   lockedWarningText: {
//     flex: 1,
//     fontSize: 12,
//     color: '#92400E',
//   },
//   seatSection: {
//     marginBottom: 20,
//   },
//   seatLabel: {
//     fontSize: 14,
//     fontWeight: '600',
//     color: Colors.dark,
//     marginBottom: 12,
//   },
//   bookingSummary: {
//     backgroundColor: '#EFF6FF',
//     padding: 10,
//     borderRadius: 10,
//     marginBottom: 12,
//     alignItems: 'center',
//   },
//   bookingSummaryText: {
//     fontSize: 14,
//     fontWeight: '600',
//     color: Colors.primary,
//   },
//   seatRow: {
//     flexDirection: 'row',
//     justifyContent: 'center',
//     alignItems: 'center',
//   },
//   seatBtn: {
//     width: 50,
//     height: 50,
//     borderRadius: 14,
//     borderWidth: 1,
//     borderColor: '#e6eef8',
//     justifyContent: 'center',
//     alignItems: 'center',
//     backgroundColor: '#fff',
//   },
//   seatBtnDisabled: {
//     borderColor: '#e0e0e0',
//     backgroundColor: '#f5f5f5',
//   },
//   seatBtnText: {
//     fontSize: 22,
//     fontWeight: '700',
//     color: Colors.dark,
//   },
//   seatBtnTextDisabled: {
//     color: '#c0c0c0',
//   },
//   seatInfo: {
//     alignItems: 'center',
//     marginHorizontal: 24,
//   },
//   seatCount: {
//     fontSize: 28,
//     fontWeight: '700',
//     color: Colors.primary,
//   },
//   bookedSeatsText: {
//     fontSize: 11,
//     color: Colors.gray,
//     marginTop: 4,
//   },
//   seatDetails: {
//     alignItems: 'center',
//     marginTop: 12,
//   },
//   maxSeatsHint: {
//     fontSize: 12,
//     color: Colors.gray,
//     textAlign: 'center',
//   },
//   remainingSeatsHint: {
//     fontSize: 12,
//     color: Colors.primary,
//     textAlign: 'center',
//     marginTop: 4,
//     fontWeight: '600',
//   },
//   estimateLabel: {
//     fontSize: 14,
//     color: Colors.gray
//   },
//   estimateValue: {
//     fontSize: 22,
//     fontWeight: '700',
//     marginTop: 4,
//     color: Colors.primary
//   },
//   rangeText: {
//     fontSize: 12,
//     marginTop: 4,
//     color: Colors.gray
//   },
//   inputLabel: {
//     fontSize: 13,
//     marginBottom: 6,
//     color: Colors.gray
//   },
//   input: {
//     borderWidth: 1.5,
//     borderColor: '#E5E7EB',
//     borderRadius: 14,
//     paddingHorizontal: 16,
//     paddingVertical: 12,
//     fontSize: 16,
//     backgroundColor: '#F9FAFB',
//     color: Colors.dark,
//   },
//   inputDisabled: {
//     backgroundColor: '#F3F4F6',
//     color: Colors.gray,
//   },
//   postBtn: {
//     backgroundColor: Colors.primary,
//     paddingVertical: 14,
//     borderRadius: 16,
//     alignItems: 'center',
//     marginTop: 22,
//     minHeight: 52,
//     justifyContent: 'center',
//   },
//   postBtnDisabled: {
//     opacity: 0.6,
//   },
//   postBtnText: {
//     color: '#fff',
//     fontWeight: '700',
//     fontSize: 16
//   },
//   loadingContainer: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     justifyContent: 'center',
//     gap: 10,
//   },
//   fullScreenLoader: {
//     flex: 1,
//     backgroundColor: Colors.white,
//     justifyContent: 'center',
//     alignItems: 'center',
//   },
//   loaderContent: {
//     alignItems: 'center',
//     justifyContent: 'center',
//   },
//   cancelRideButton: {
//     marginTop: 16,
//     paddingVertical: 12,
//     alignItems: 'center',
//     borderWidth: 1,
//     borderColor: '#EF4444',
//     borderRadius: 12,
//     backgroundColor: '#FEF2F2',
//   },
//   cancelRideText: {
//     color: '#EF4444',
//     fontWeight: '600',
//     fontSize: 14,
//   },
//   lockedHint: {
//     fontSize: 11,
//     color: Colors.gray,
//     marginTop: 4,
//   },
//   lockedPriceWarning: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     marginTop: 8,
//     gap: 6,
//   },
//   lockedPriceText: {
//     fontSize: 12,
//     color: Colors.gray,
//   },
//   disabledHint: {
//     fontSize: 11,
//     color: Colors.gray,
//     marginTop: 4,
//   },
//   noteText: {
//     fontSize: 11,
//     color: Colors.gray,
//     marginTop: 4,
//     fontStyle: 'italic',
//   },
// });
import React, { useEffect, useMemo, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  TextInput,
  StyleSheet,
  ActivityIndicator,
  Modal,
} from 'react-native';
import LottieView from "lottie-react-native";
import { Colors } from '../../constants/Colors';
import CustomAlert from '../../components/CustomAlert';
import Ridesuccessanimation from '../../components/Ridesuccessanimation';
import { MaterialIcons } from '@expo/vector-icons';

export default function Step4({
  seatsAvailable,
  setSeatsAvailable,
  pricePerSeat,
  setPricePerSeat,
  selectedRoute,
  vehicleId,
  maxSeats = 4,
  onPost,
  isEdit = false,
  navigation,
  rideDetails,
  userData,
  userId,
  phoneNumber,
  rideBookings = null,
  lockedFields = [],
  originalRideData = null,
  totalBookedSeats: propTotalBookedSeats = 0, // New prop from parent
}) {

  const [posting, setPosting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const buttonText = isEdit ? 'Update Ride' : 'Post Ride';

  const [alertVisible, setAlertVisible] = useState(false);
  const [alertConfig, setAlertConfig] = useState({
    title: "",
    message: "",
    icon: "check-circle",
    iconColor: "#10B981",
    buttons: []
  });

  // Calculate total booked seats from rideBookings or use prop
  const confirmedBookings = rideBookings?.filter(b => b.status === 'accepted') || [];
  const calculatedBookedSeats = confirmedBookings.reduce((sum, booking) => sum + (booking.seats_booked || booking.seats || 1), 0);
  const totalBookedSeats = propTotalBookedSeats || calculatedBookedSeats;
  
  const passengerSeats = Math.max(1, maxSeats - 1);
  const actualRemainingSeats = Math.max(0, seatsAvailable - totalBookedSeats);
  const maxSeatsDisplay = `${passengerSeats} + 1 (Driver)`;
  
  const hasConfirmedBookings = totalBookedSeats > 0;
  const isPriceLocked = lockedFields.includes('price') && hasConfirmedBookings;
  const isSeatsLocked = lockedFields.includes('seats') && hasConfirmedBookings;
  const minSeatsAllowed = Math.max(1, totalBookedSeats);
  
  // Check if seats can be increased (can always increase up to passengerSeats)
  const canIncreaseSeats = seatsAvailable < passengerSeats;
  // Check if seats can be decreased (cannot go below booked seats)
  const canDecreaseSeats = seatsAvailable > minSeatsAllowed;

  const showCustomAlert = (title, message, type = 'success', onConfirm = null) => {
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
    
    const buttons = onConfirm 
      ? [
          { text: 'Cancel', onPress: () => setAlertVisible(false), style: 'cancel' },
          { text: 'Confirm', onPress: () => {
              setAlertVisible(false);
              onConfirm();
            }
          }
        ]
      : [{ text: 'OK', onPress: () => setAlertVisible(false) }];
    
    setAlertConfig({
      title,
      message,
      icon,
      iconColor,
      buttons
    });
    setAlertVisible(true);
  };

  const handleSeatChange = (increment) => {
    if (isSeatsLocked) {
      showCustomAlert(
        "Seats Limited",
        `You have ${totalBookedSeats} confirmed passenger(s). You cannot reduce seats, but you can increase seats up to ${passengerSeats}.`,
        "info"
      );
      return;
    }
    
    let newValue = seatsAvailable;
    
    if (increment) {
      newValue = seatsAvailable + 1;
    } else {
      newValue = seatsAvailable - 1;
    }
    
    // Check minimum seats (cannot go below booked seats)
    if (newValue < minSeatsAllowed) {
      showCustomAlert(
        "Minimum Seats Required",
        `You cannot reduce seats below ${minSeatsAllowed} as you have ${totalBookedSeats} confirmed passenger(s).\n\nYou can only increase seats to add more capacity.`,
        "warning"
      );
      return;
    }
    
    // Check maximum seats
    const maxPassengerSeats = maxSeats - 1;
    if (newValue > maxPassengerSeats) {
      showCustomAlert(
        "Seat Limit Exceeded",
        `You cannot offer more than ${maxPassengerSeats} passenger seats (vehicle capacity: ${maxSeats} total seats including driver).`,
        "warning"
      );
      return;
    }
    
    setSeatsAvailable(newValue);
  };

  const estimatedPrice = useMemo(() => {
    if (!selectedRoute?.price) return 0;
    return selectedRoute.price / maxSeats;
  }, [selectedRoute, maxSeats]);

  const minAllowed = Math.floor(estimatedPrice * 0.8);
  const maxAllowed = Math.ceil(estimatedPrice * 1.2);

  useEffect(() => {
    if (estimatedPrice > 0 && !isPriceLocked && !pricePerSeat) {
      setPricePerSeat(Math.round(estimatedPrice).toString());
    }
  }, [estimatedPrice, isPriceLocked]);

  const numericPrice = Number(pricePerSeat);
  const isPriceValid = numericPrice && 
    numericPrice >= minAllowed && 
    numericPrice <= maxAllowed;

  const isPostDisabled = (!isPriceValid && !isPriceLocked) || 
    posting || 
    (actualRemainingSeats === 0 && !isEdit) || 
    seatsAvailable === 0;

  const handlePost = async () => {
    const numericPriceValue = Number(pricePerSeat);

    if (!isPriceLocked) {
      if (!numericPriceValue || isNaN(numericPriceValue)) {
        showCustomAlert("Invalid Price", "Please enter valid price per seat.", "warning");
        return;
      }

      if (numericPriceValue < minAllowed || numericPriceValue > maxAllowed) {
        showCustomAlert(
          "Price Out of Range",
          `Price must be between ₹${minAllowed} and ₹${maxAllowed}`,
          "warning"
        );
        return;
      }
    }

    // For edit mode with confirmed bookings, show appropriate message
    let confirmationMessage = "";
    if (hasConfirmedBookings) {
      if (seatsAvailable > totalBookedSeats) {
        confirmationMessage = `Current Booked: ${totalBookedSeats} seat(s)\nNew Total Seats: ${seatsAvailable}\nNew Available: ${seatsAvailable - totalBookedSeats} seat(s)\nPrice per seat: ₹${numericPriceValue}\n\nPassengers will be notified about additional seat availability.`;
      } else if (seatsAvailable === totalBookedSeats) {
        confirmationMessage = `Booked Seats: ${totalBookedSeats} seat(s) (Ride Full)\nPrice per seat: ₹${numericPriceValue}`;
      } else {
        confirmationMessage = `Booked Seats: ${totalBookedSeats} seat(s)\nPrice per seat: ₹${numericPriceValue}\n\nNote: Cannot reduce seats below booked count.`;
      }
    } else {
      confirmationMessage = `Seats: ${seatsAvailable}\nPrice per seat: ₹${numericPriceValue}`;
    }

    showCustomAlert(
      isEdit ? "Confirm Update" : "Confirm Post Ride",
      confirmationMessage,
      "info",
      async () => {
        setPosting(true);
        try {
          const result = await onPost({
            seatsAvailable: seatsAvailable,
            pricePerSeat: numericPriceValue,
          });
          
          setPosting(false);
          setShowSuccess(true);
          
        } catch (error) {
          console.log("❌ Post failed:", error);
          setPosting(false);
        }
      }
    );
  };

  const handleSuccessComplete = () => {
    setShowSuccess(false);
    setPosting(false);
    
    if (navigation) {
      navigation.reset({
        index: 0,
        routes: [
          {
            name: "Home",
            params: { phoneNumber, userData, userId },
          },
        ],
      });
    } else {
      navigation?.goBack();
    }
  };

  return (
    <>
      <View style={styles.container}>
        <Text style={styles.title}>Seats & Pricing</Text>

        {isEdit && hasConfirmedBookings && (
          <View style={styles.lockedWarningBanner}>
            <MaterialIcons name="lock" size={20} color="#F59E0B" />
            <Text style={styles.lockedWarningText}>
              This ride has {totalBookedSeats} confirmed booking(s).
            </Text>
          </View>
        )}

        <View style={styles.seatSection}>
          <Text style={styles.seatLabel}>Available Seats for Passengers</Text>
          
          {totalBookedSeats > 0 && (
            <View style={styles.bookingSummary}>
              <Text style={styles.bookingSummaryText}>
                ✅ {totalBookedSeats} seat(s) already booked
              </Text>
              <Text style={styles.remainingSummaryText}>
                📍 {actualRemainingSeats} seat(s) still available
              </Text>
              {isSeatsLocked && (
                <Text style={styles.lockedHint}>⚠️ You can only increase seats, not decrease</Text>
              )}
            </View>
          )}
          
          <View style={styles.seatRow}>
            <TouchableOpacity
              onPress={() => handleSeatChange(false)}
              style={[styles.seatBtn, (!canDecreaseSeats || isSeatsLocked) && styles.seatBtnDisabled]}
              disabled={posting || !canDecreaseSeats}
            >
              <Text style={[styles.seatBtnText, (!canDecreaseSeats || isSeatsLocked) && styles.seatBtnTextDisabled]}>-</Text>
            </TouchableOpacity>

            <View style={styles.seatInfo}>
              <Text style={styles.seatCount}>{seatsAvailable}</Text>
              <Text style={styles.seatSubtext}>total passenger seats</Text>
              {totalBookedSeats > 0 && (
                <Text style={styles.bookedSeatsText}>
                  {totalBookedSeats} booked, {actualRemainingSeats} left
                </Text>
              )}
            </View>

            <TouchableOpacity
              onPress={() => handleSeatChange(true)}
              style={[
                styles.seatBtn, 
                (!canIncreaseSeats) && styles.seatBtnDisabled
              ]}
              disabled={posting || !canIncreaseSeats}
            >
              <Text style={styles.seatBtnText}>+</Text>
            </TouchableOpacity>
          </View>
          
          <View style={styles.seatDetails}>
            <Text style={styles.maxSeatsHint}>
              Total passenger seats: {maxSeatsDisplay}
            </Text>
            <Text style={styles.maxSeatsHint}>
              Vehicle capacity: {maxSeats} seats total (including driver)
            </Text>
            {totalBookedSeats > 0 && (
              <>
                <Text style={styles.remainingSeatsHint}>
                  ✅ You can add {passengerSeats - seatsAvailable} more seats
                </Text>
                <Text style={styles.noteText}>
                  💡 You cannot reduce seats below {totalBookedSeats} (already booked)
                </Text>
              </>
            )}
            {!totalBookedSeats && (
              <Text style={styles.noteText}>
                💡 You can modify seat count anytime before the ride starts
              </Text>
            )}
          </View>
        </View>

        <View style={{ marginTop: 18 }}>
          <Text style={styles.estimateLabel}>
            Estimated per seat (based on route):
          </Text>
          <Text style={styles.estimateValue}>
            ₹ {Math.round(estimatedPrice)}
          </Text>
          <Text style={styles.rangeText}>
            Allowed range: ₹{minAllowed} – ₹{maxAllowed}
          </Text>
          
          {isPriceLocked && (
            <View style={styles.lockedPriceWarning}>
              <MaterialIcons name="lock" size={16} color={Colors.gray} />
              <Text style={styles.lockedPriceText}>
                Price is locked due to confirmed bookings
              </Text>
            </View>
          )}
        </View>

        <View style={{ marginTop: 20 }}>
          <Text style={styles.inputLabel}>Set Custom Price per Seat (₹)</Text>
          <TextInput
            value={pricePerSeat}
            onChangeText={setPricePerSeat}
            keyboardType="numeric"
            style={[styles.input, isPriceLocked && styles.inputDisabled]}
            editable={!posting && !isPriceLocked}
            placeholder={`₹${Math.round(estimatedPrice)}`}
            placeholderTextColor={Colors.gray}
          />
          {isPriceLocked && (
            <Text style={styles.disabledHint}>
              Price cannot be changed after confirmed bookings
            </Text>
          )}
        </View>

        {isEdit && hasConfirmedBookings && (
          <TouchableOpacity
            style={styles.cancelRideButton}
            onPress={() => {
              showCustomAlert(
                "Cancel Ride",
                "Are you sure you want to cancel this ride? This will notify all booked passengers and may apply cancellation fees.",
                "warning",
                () => {
                  navigation.navigate("CancelRideScreen", { rideId: originalRideData?.id });
                }
              );
            }}
          >
            <Text style={styles.cancelRideText}>Cancel This Ride</Text>
          </TouchableOpacity>
        )}

        <TouchableOpacity
          style={[
            styles.postBtn,
            isPostDisabled && styles.postBtnDisabled
          ]}
          disabled={isPostDisabled}
          onPress={handlePost}
          activeOpacity={0.8}
        >
          {posting ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="small" color="#fff" />
              <Text style={styles.postBtnText}>
                {isEdit ? "Updating..." : "Posting..."}
              </Text>
            </View>
          ) : (
            <Text style={styles.postBtnText}>
              {actualRemainingSeats === 0 && !isEdit ? "Ride Full" : buttonText}
            </Text>
          )}
        </TouchableOpacity>

        <CustomAlert
          visible={alertVisible}
          title={alertConfig.title}
          message={alertConfig.message}
          icon={alertConfig.icon}
          iconColor={alertConfig.iconColor}
          buttons={alertConfig.buttons}
          onBackdropPress={() => setAlertVisible(false)}
        />

        <Ridesuccessanimation 
          visible={showSuccess} 
          onComplete={handleSuccessComplete}
          type="ride"
        />
      </View>

      <Modal
        transparent={true}
        visible={posting && !showSuccess}
        animationType="fade"
        onRequestClose={() => {}}
      >
        <View style={styles.fullScreenLoader}>
          <View style={styles.loaderContent}>
            <LottieView
              source={require("../../assets/loading.json")}
              autoPlay
              loop
              style={{ width: 300, height: 300 }}
            />
          </View>
        </View>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderRadius: 28,
    padding: 18,
    marginBottom: 14,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.15,
    shadowRadius: 20,
    elevation: 10,
    borderWidth: 1,
    borderColor: 'rgba(229, 231, 235, 0.5)',
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 16,
    color: Colors.dark
  },
  lockedWarningBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEF3C7',
    padding: 12,
    borderRadius: 12,
    marginBottom: 16,
    gap: 8,
  },
  lockedWarningText: {
    flex: 1,
    fontSize: 12,
    color: '#92400E',
  },
  seatSection: {
    marginBottom: 20,
  },
  seatLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.dark,
    marginBottom: 12,
  },
  bookingSummary: {
    backgroundColor: '#EFF6FF',
    padding: 12,
    borderRadius: 10,
    marginBottom: 12,
    alignItems: 'center',
  },
  bookingSummaryText: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.primary,
  },
  remainingSummaryText: {
    fontSize: 12,
    color: Colors.success,
    fontWeight: '600',
    marginTop: 4,
  },
  seatRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  seatBtn: {
    width: 50,
    height: 50,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#e6eef8',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  seatBtnDisabled: {
    borderColor: '#e0e0e0',
    backgroundColor: '#f5f5f5',
  },
  seatBtnText: {
    fontSize: 22,
    fontWeight: '700',
    color: Colors.dark,
  },
  seatBtnTextDisabled: {
    color: '#c0c0c0',
  },
  seatInfo: {
    alignItems: 'center',
    marginHorizontal: 24,
  },
  seatCount: {
    fontSize: 28,
    fontWeight: '700',
    color: Colors.primary,
  },
  seatSubtext: {
    fontSize: 10,
    color: Colors.gray,
    marginTop: 2,
  },
  bookedSeatsText: {
    fontSize: 11,
    color: Colors.gray,
    marginTop: 4,
  },
  seatDetails: {
    alignItems: 'center',
    marginTop: 12,
  },
  maxSeatsHint: {
    fontSize: 12,
    color: Colors.gray,
    textAlign: 'center',
  },
  remainingSeatsHint: {
    fontSize: 12,
    color: Colors.success,
    textAlign: 'center',
    marginTop: 4,
    fontWeight: '600',
  },
  estimateLabel: {
    fontSize: 14,
    color: Colors.gray
  },
  estimateValue: {
    fontSize: 22,
    fontWeight: '700',
    marginTop: 4,
    color: Colors.primary
  },
  rangeText: {
    fontSize: 12,
    marginTop: 4,
    color: Colors.gray
  },
  inputLabel: {
    fontSize: 13,
    marginBottom: 6,
    color: Colors.gray
  },
  input: {
    borderWidth: 1.5,
    borderColor: '#E5E7EB',
    borderRadius: 14,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    backgroundColor: '#F9FAFB',
    color: Colors.dark,
  },
  inputDisabled: {
    backgroundColor: '#F3F4F6',
    color: Colors.gray,
  },
  postBtn: {
    backgroundColor: Colors.primary,
    paddingVertical: 14,
    borderRadius: 16,
    alignItems: 'center',
    marginTop: 22,
    minHeight: 52,
    justifyContent: 'center',
  },
  postBtnDisabled: {
    opacity: 0.6,
  },
  postBtnText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 16
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
  },
  fullScreenLoader: {
    flex: 1,
    backgroundColor: Colors.white,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loaderContent: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelRideButton: {
    marginTop: 16,
    paddingVertical: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#EF4444',
    borderRadius: 12,
    backgroundColor: '#FEF2F2',
  },
  cancelRideText: {
    color: '#EF4444',
    fontWeight: '600',
    fontSize: 14,
  },
  lockedHint: {
    fontSize: 11,
    color: Colors.primary,
    marginTop: 4,
  },
  lockedPriceWarning: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
    gap: 6,
  },
  lockedPriceText: {
    fontSize: 12,
    color: Colors.gray,
  },
  disabledHint: {
    fontSize: 11,
    color: Colors.gray,
    marginTop: 4,
  },
  noteText: {
    fontSize: 11,
    color: Colors.gray,
    marginTop: 4,
    fontStyle: 'italic',
  },
});