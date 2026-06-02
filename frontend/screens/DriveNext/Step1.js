// import React, { useState, useRef, useEffect } from 'react';
// import {
//   View,
//   Text,
//   StyleSheet,
//   TouchableOpacity,
//   Platform,
//   Modal,
// } from 'react-native';
// import { Colors } from '../../constants/Colors';
// import { Ionicons, MaterialIcons } from '@expo/vector-icons';
// import DateTimePicker from '@react-native-community/datetimepicker';
// import { useAuth } from '../../context/AuthContext';
// import CustomAlert from '../../components/CustomAlert';

// export default function Step1({ 
//   from, 
//   to, 
//   setFrom, 
//   setTo, 
//   setFromCoords, 
//   setToCoords, 
//   dateTime, 
//   setDateTime, 
//   onNext, 
//   navigation, 
//   route, 
//   phoneNumber: phoneNumberProp, 
//   fromCoords, 
//   toCoords, 
//   setRouteOptions,
//   setSelectedRouteIndex,
// }) {

//   const [selectedDate, setSelectedDate] = useState(dateTime);
//   const [loading, setLoading] = useState(false);
  
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
//       iconColor = Colors.primary;
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

//   useEffect(() => {
//     // Auto-set coords if provided (edit mode)
//     if (fromCoords && Array.isArray(fromCoords) && fromCoords.length === 2) {
//       setFromCoords({ latitude: fromCoords[1], longitude: fromCoords[0] });
//     }
//     if (toCoords && Array.isArray(toCoords) && toCoords.length === 2) {
//       setToCoords({ latitude: toCoords[1], longitude: toCoords[0] });
//     }
//   }, [fromCoords, toCoords]);
  
//   const [showDatePicker, setShowDatePicker] = useState(false);
//   const [showTimePicker, setShowTimePicker] = useState(false);
//   const { firstName, lastName, userId, userData, isNewUser } = route?.params || {};

//   // ✅ Get authenticated user from AuthContext
//   const { user } = useAuth();

//   // ✅ Get phone number from props, AuthContext, route params, or navigation state
//   const phoneNumber = phoneNumberProp || 
//     route?.params?.phoneNumber || 
//     user?.phone_number || 
//     user?.phoneNumber || 
//     user?.phone || 
//     navigation?.getState()?.routes?.find(r => r.params?.phoneNumber)?.params?.phoneNumber ||
//     null;

//   // Format date and time
//   const formatDateTime = () => {
//     const today = new Date();
//     const isToday = selectedDate.toDateString() === today.toDateString();
    
//     const timeString = selectedDate.toLocaleTimeString('en-IN', {
//       hour: 'numeric',
//       minute: '2-digit',
//       hour12: true,
//       timeZone: 'Asia/Calcutta',
//     });

//     if (isToday) {
//       return `Today, ${timeString}`;
//     } else {
//       const dateString = selectedDate.toLocaleDateString('en-IN', {
//         weekday: 'short',
//         month: 'short',
//         day: 'numeric'
//       });
//       return `${dateString}, ${timeString}`;
//     }
//   };

//   const showDateTimePicker = () => {
//     setShowDatePicker(true);
//   };

//   const onDateChange = (event, selectedDate) => {
//     if (Platform.OS === 'android') {
//       setShowDatePicker(false);
//       setShowTimePicker(true);
//     }
//     if (selectedDate) {
//       setSelectedDate(selectedDate);
//       setDateTime(selectedDate);
//     }
//   };

//   const onTimeChange = (event, selectedTime) => {
//     setShowTimePicker(false);
//     if (selectedTime) {
//       const newDateTime = new Date(selectedDate);
//       newDateTime.setHours(selectedTime.getHours());
//       newDateTime.setMinutes(selectedTime.getMinutes());
//       setSelectedDate(newDateTime);
//       setDateTime(newDateTime);
//     }
//   };

//   // ✅ Handle location selection from LocationSearchScreen
//   const handleLocationSelect = (location, type) => {
//     console.log(`📍 Location selected for ${type}:`, location);
    
//     if (type === 'from') {
//       setFrom(location.label);
//       setFromCoords({
//         latitude: location.latitude || location.coords?.latitude || location.coordinates[1],
//         longitude: location.longitude || location.coords?.longitude || location.coordinates[0]
//       });
//     } else {
//       setTo(location.label);
//       setToCoords({
//         latitude: location.latitude || location.coords?.latitude || location.coordinates[1],
//         longitude: location.longitude || location.coords?.longitude || location.coordinates[0]
//       });
//     }
    
//     // Reset route data when location changes
//     setRouteOptions([]);
//     setSelectedRouteIndex(0);
//   };

//   const handleNext = () => {
//     if (!from || !to) {
//       showCustomAlert('Required Fields', 'Please enter both pickup and destination locations', 'warning');
//       return;
//     }
    
//     const sameLocation = fromCoords && toCoords &&
//       Math.abs(fromCoords.latitude - toCoords.latitude) < 0.0001 &&
//       Math.abs(fromCoords.longitude - toCoords.longitude) < 0.0001;

//     if (sameLocation) {
//       showCustomAlert(
//         'Invalid Route',
//         'Pickup and destination locations cannot be the same.',
//         'warning'
//       );
//       return;
//     }

//     const DriveData = {
//       from,
//       to,
//       dateTime: selectedDate,
//       userId: userId,
//       fromCoords,
//       toCoords,
//     };
//     console.log('🚗 Drive data:', DriveData);

//     onNext();
//   };

//   return (
//     <View style={styles.container}>
//       <View style={styles.titleSection}>
//         <Text style={styles.title}>Route Details</Text>
//         <Text style={styles.sectionTitle}>Where are you going?</Text>
//       </View>

//       {/* From Location */}
//       <TouchableOpacity
//         style={styles.locationContainer}
//         onPress={() => 
//           navigation.navigate('LocationSearch', { 
//             type: 'from',
//             currentFromLocation: fromCoords ? { 
//               coordinates: [fromCoords.longitude, fromCoords.latitude], 
//               label: from 
//             } : null,
//             currentToLocation: toCoords ? { 
//               coordinates: [toCoords.longitude, toCoords.latitude], 
//               label: to 
//             } : null,
//             onSelect: (location) => handleLocationSelect(location, 'from')
//           })
//         }
//       >
//         <Ionicons name="location-sharp" size={20} color={Colors.success} style={styles.inputIcon} />
//         <Text style={styles.locationInput}>
//           {from || 'From'}
//         </Text>
//       </TouchableOpacity>

//       {/* To Location */}
//       <TouchableOpacity
//         style={styles.locationContainer}
//         onPress={() => 
//           navigation.navigate('LocationSearch', { 
//             type: 'to',
//             currentFromLocation: fromCoords ? { 
//               coordinates: [fromCoords.longitude, fromCoords.latitude], 
//               label: from 
//             } : null,
//             currentToLocation: toCoords ? { 
//               coordinates: [toCoords.longitude, toCoords.latitude], 
//               label: to 
//             } : null,
//             onSelect: (location) => handleLocationSelect(location, 'to')
//           })
//         }
//       >
//         <Ionicons name="location-sharp" size={20} color={Colors.secondary} style={styles.inputIcon} />
//         <Text style={styles.locationInput}>
//           {to || 'To'}
//         </Text>
//       </TouchableOpacity>

//       {/* Date/Time Section */}
//       <View style={styles.whenSection}>
//         <Text style={styles.sectionTitle}>When?</Text>
//         <TouchableOpacity style={styles.timeInput} onPress={showDateTimePicker}>
//           <Text style={styles.timeText}>{formatDateTime()}</Text>
//           <Ionicons name="calendar" size={20} color={Colors.secondary} />
//         </TouchableOpacity>
//       </View>

//       {/* Continue Button */}
//       <TouchableOpacity
//         style={[styles.actionButton, { backgroundColor: Colors.primary }]}
//         onPress={handleNext}
//         disabled={loading}
//       >
//         <Text style={styles.actionButtonText}>Continue</Text>
//       </TouchableOpacity>

//       {/* Date/Time Pickers */}
//       {showDatePicker && (
//         <DateTimePicker
//           value={selectedDate}
//           mode="date"
//           display={Platform.OS === 'ios' ? 'spinner' : 'default'}
//           onChange={onDateChange}
//           minimumDate={new Date()}
//         />
//       )}

//       {showTimePicker && (
//         <DateTimePicker
//           value={selectedDate}
//           mode="time"
//           display={Platform.OS === 'ios' ? 'spinner' : 'default'}
//           onChange={onTimeChange}
//         />
//       )}

//       {Platform.OS === 'ios' && showDatePicker && (
//         <Modal transparent={true} visible={showDatePicker} animationType="slide">
//           <View style={styles.iosPickerContainer}>
//             <View style={styles.iosPickerContent}>
//               <View style={styles.iosPickerHeader}>
//                 <TouchableOpacity onPress={() => setShowDatePicker(false)}>
//                   <Text style={[styles.iosPickerButton, {color: Colors.gray}]}>Cancel</Text>
//                 </TouchableOpacity>
//                 <TouchableOpacity onPress={() => setShowDatePicker(false)}>
//                   <Text style={[styles.iosPickerButton, {color: Colors.primary}]}>Done</Text>
//                 </TouchableOpacity>
//               </View>
//               <DateTimePicker
//                 value={selectedDate}
//                 mode="datetime"
//                 display="spinner"
//                 onChange={onDateChange}
//                 minimumDate={new Date()}
//                 textColor={Colors.dark}
//               />
//             </View>
//           </View>
//         </Modal>
//       )}

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
//     </View>
//   );
// }

// const styles = StyleSheet.create({ 
//   container: {
//     backgroundColor: 'rgba(255, 255, 255, 0.95)',
//     padding: 18,
//     marginBottom: 16,
//     borderRadius: 28,
//     flex: 1,
//     shadowColor: '#000',
//     shadowOffset: { width: 0, height: 10 },
//     shadowOpacity: 0.15,
//     shadowRadius: 20,
//     elevation: 10,
//     borderWidth: 1,
//     borderColor: 'rgba(229, 231, 235, 0.5)',
//   },
//   titleSection: {
//     marginBottom: 2,
//   },
//   title: {
//     fontSize: 20,
//     fontWeight: '700',
//     color: Colors.dark,
//     marginBottom: 18,
//   },
//   sectionTitle: {
//     fontSize: 18,
//     fontWeight: '600',
//     color: Colors.dark,
//     marginBottom: 12,
//   },
//   inputIcon: {
//     marginRight: -10,
//     marginLeft: 10,
//   },
//   locationContainer: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     borderWidth: 1.5,
//     borderColor: '#E5E7EB',
//     borderRadius: 14,
//     backgroundColor: '#F9FAFB',
//     marginBottom: 12,
//   },
//   locationInput: {
//     flex: 1,
//     fontSize: 16,
//     color: Colors.dark,
//     fontWeight: '500',
//     paddingHorizontal: 16,
//     paddingVertical: 15,
//   },
//   whenSection: {
//     marginBottom: 2,
//   },
//   timeInput: {
//     borderWidth: 1.5,
//     borderColor: '#E5E7EB',
//     borderRadius: 14,
//     paddingHorizontal: 16,
//     paddingVertical: 15,
//     fontSize: 16,
//     color: Colors.dark,
//     fontWeight: '500',
//     marginBottom: 12,
//     backgroundColor: '#F9FAFB',
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//     alignItems: 'center',
//   },
//   timeText: {
//     flex: 1,
//     fontSize: 16,
//     color: Colors.dark,
//     fontWeight: '500',
//   },
//   iosPickerContainer: {
//     flex: 1,
//     backgroundColor: 'rgba(0,0,0,0.5)',
//     justifyContent: 'flex-end',
//   },
//   iosPickerContent: {
//     backgroundColor: Colors.white,
//     borderTopLeftRadius: 20,
//     borderTopRightRadius: 20,
//   },
//   iosPickerHeader: {
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//     paddingHorizontal: 20,
//     paddingVertical: 15,
//     borderBottomWidth: 1,
//     borderBottomColor: '#e0e0e0',
//   },
//   iosPickerButton: {
//     fontSize: 16,
//     fontWeight: '600',
//   },
//   actionButton: {
//     borderRadius: 16,
//     overflow: 'hidden',
//     marginTop: 15,
//     shadowColor: Colors.primary,
//     shadowOffset: { width: 0, height: 8 },
//     shadowOpacity: 0.3,
//     shadowRadius: 16,
//     elevation: 8,
//     paddingVertical: 13,
//     alignItems: 'center',
//     justifyContent: 'center',
//     flexDirection: 'row',
//   },
//   actionButtonText: {
//     color: Colors.white,
//     fontSize: 18,
//     fontWeight: '700',
//     letterSpacing: 0.5,
//   },
// });
// Step1.js
// import React, { useState, useRef, useEffect } from 'react';
// import {
//   View,
//   Text,
//   StyleSheet,
//   TouchableOpacity,
//   Platform,
//   Modal,
//   Alert,
// } from 'react-native';
// import { Colors } from '../../constants/Colors';
// import { Ionicons, MaterialIcons } from '@expo/vector-icons';
// import DateTimePicker from '@react-native-community/datetimepicker';
// import { useAuth } from '../../context/AuthContext';
// import CustomAlert from '../../components/CustomAlert';

// export default function Step1({ 
//   from, 
//   to, 
//   setFrom, 
//   setTo, 
//   setFromCoords, 
//   setToCoords, 
//   dateTime, 
//   setDateTime, 
//   onNext, 
//   navigation, 
//   route, 
//   phoneNumber: phoneNumberProp, 
//   fromCoords, 
//   toCoords, 
//   setRouteOptions,
//   setSelectedRouteIndex,
//   isEdit = false,
//   lockedFields = [],
//   validateDateTime: externalValidateDateTime,
// }) {

//   const [selectedDate, setSelectedDate] = useState(dateTime);
//   const [loading, setLoading] = useState(false);
  
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
//       iconColor = Colors.primary;
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

//   // Validate time (minimum 30 minutes from now)
//   const validateSelectedTime = (selectedDateTime) => {
//     const now = new Date();
//     const minTime = new Date(now.getTime() + 30 * 60000); // 30 minutes from now
    
//     if (selectedDateTime < now) {
//       showCustomAlert(
//         "Invalid Time",
//         `Cannot select past date and time. Please select a future time.`,
//         "warning"
//       );
//       return false;
//     }
    
//     if (selectedDateTime < minTime) {
//       const minutesDiff = Math.ceil((minTime - selectedDateTime) / 60000);
//       showCustomAlert(
//         "Time Too Soon",
//         `Departure time must be at least 30 minutes from now.\n\nPlease select a time after ${minTime.toLocaleTimeString()}.`,
//         "warning"
//       );
//       return false;
//     }
//     return true;
//   };

//   useEffect(() => {
//     // Auto-set coords if provided (edit mode)
//     if (fromCoords && Array.isArray(fromCoords) && fromCoords.length === 2) {
//       setFromCoords({ latitude: fromCoords[1], longitude: fromCoords[0] });
//     }
//     if (toCoords && Array.isArray(toCoords) && toCoords.length === 2) {
//       setToCoords({ latitude: toCoords[1], longitude: toCoords[0] });
//     }
//   }, [fromCoords, toCoords]);
  
//   const [showDatePicker, setShowDatePicker] = useState(false);
//   const [showTimePicker, setShowTimePicker] = useState(false);
//   const { firstName, lastName, userId, userData, isNewUser } = route?.params || {};

//   // Get authenticated user from AuthContext
//   const { user } = useAuth();

//   // Get phone number from props, AuthContext, route params, or navigation state
//   const phoneNumber = phoneNumberProp || 
//     route?.params?.phoneNumber || 
//     user?.phone_number || 
//     user?.phoneNumber || 
//     user?.phone || 
//     navigation?.getState()?.routes?.find(r => r.params?.phoneNumber)?.params?.phoneNumber ||
//     null;

//   // Format date and time
//   const formatDateTime = () => {
//     const today = new Date();
//     const isToday = selectedDate.toDateString() === today.toDateString();
    
//     const timeString = selectedDate.toLocaleTimeString('en-IN', {
//       hour: 'numeric',
//       minute: '2-digit',
//       hour12: true,
//       timeZone: 'Asia/Calcutta',
//     });

//     if (isToday) {
//       return `Today, ${timeString}`;
//     } else {
//       const dateString = selectedDate.toLocaleDateString('en-IN', {
//         weekday: 'short',
//         month: 'short',
//         day: 'numeric'
//       });
//       return `${dateString}, ${timeString}`;
//     }
//   };

//   const showDateTimePicker = () => {
//     // Check if time field is locked in edit mode
//     if (isEdit && lockedFields.includes('time')) {
//       showCustomAlert(
//         "Time Locked",
//         "Cannot change departure time as you have confirmed bookings. You can only adjust by ±10 minutes.",
//         "warning"
//       );
//       return;
//     }
//     setShowDatePicker(true);
//   };

//   const onDateChange = (event, selectedDateValue) => {
//     if (Platform.OS === 'android') {
//       setShowDatePicker(false);
//       setShowTimePicker(true);
//     }
//     if (selectedDateValue) {
//       // Preserve current time
//       const newDateTime = new Date(selectedDateValue);
//       newDateTime.setHours(selectedDate.getHours());
//       newDateTime.setMinutes(selectedDate.getMinutes());
      
//       if (validateSelectedTime(newDateTime)) {
//         setSelectedDate(newDateTime);
//         setDateTime(newDateTime);
//       } else {
//         // Reset to valid time (30 minutes from now)
//         const validTime = new Date(Date.now() + 30 * 60000);
//         setSelectedDate(validTime);
//         setDateTime(validTime);
//       }
//     }
//   };

//   const onTimeChange = (event, selectedTime) => {
//     setShowTimePicker(false);
//     if (selectedTime) {
//       const newDateTime = new Date(selectedDate);
//       newDateTime.setHours(selectedTime.getHours());
//       newDateTime.setMinutes(selectedTime.getMinutes());
      
//       // For edit mode, check if time change is within allowed limit (±10 minutes)
//       if (isEdit && lockedFields.includes('time')) {
//         const originalTime = new Date(dateTime);
//         const timeDiffMinutes = Math.abs(newDateTime - originalTime) / 60000;
        
//         if (timeDiffMinutes > 10) {
//           showCustomAlert(
//             "Time Change Limited",
//             "You can only adjust departure time by up to 10 minutes when you have confirmed bookings.",
//             "warning"
//           );
//           return;
//         }
//       }
      
//       if (validateSelectedTime(newDateTime)) {
//         setSelectedDate(newDateTime);
//         setDateTime(newDateTime);
//       }
//     }
//   };

//   // Handle location selection from LocationSearchScreen
//   const handleLocationSelect = (location, type) => {
//     console.log(`📍 Location selected for ${type}:`, location);
    
//     if (type === 'from') {
//       setFrom(location.label);
//       setFromCoords({
//         latitude: location.latitude || location.coords?.latitude || location.coordinates[1],
//         longitude: location.longitude || location.coords?.longitude || location.coordinates[0]
//       });
//     } else {
//       setTo(location.label);
//       setToCoords({
//         latitude: location.latitude || location.coords?.latitude || location.coordinates[1],
//         longitude: location.longitude || location.coords?.longitude || location.coordinates[0]
//       });
//     }
    
//     // Reset route data when location changes
//     setRouteOptions([]);
//     setSelectedRouteIndex(0);
//   };

//   // Validate distance between locations (minimum 3km, maximum 300km)
//   const calculateDistance = (lat1, lon1, lat2, lon2) => {
//     const R = 6371; // Earth's radius in km
//     const dLat = (lat2 - lat1) * Math.PI / 180;
//     const dLon = (lon2 - lon1) * Math.PI / 180;
//     const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
//               Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
//               Math.sin(dLon/2) * Math.sin(dLon/2);
//     const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
//     return R * c;
//   };

//   const handleNext = () => {
//     if (!from || !to) {
//       showCustomAlert('Required Fields', 'Please enter both pickup and destination locations', 'warning');
//       return;
//     }
    
//     const sameLocation = fromCoords && toCoords &&
//       Math.abs(fromCoords.latitude - toCoords.latitude) < 0.0001 &&
//       Math.abs(fromCoords.longitude - toCoords.longitude) < 0.0001;

//     if (sameLocation) {
//       showCustomAlert(
//         'Invalid Route',
//         'Pickup and destination locations cannot be the same.',
//         'warning'
//       );
//       return;
//     }

//     // Validate distance
//     if (fromCoords && toCoords) {
//       const distance = calculateDistance(
//         fromCoords.latitude, fromCoords.longitude,
//         toCoords.latitude, toCoords.longitude
//       );
      
//       const MIN_DISTANCE_KM = 3;
//       const MAX_DISTANCE_KM = 300;
      
//       if (distance < MIN_DISTANCE_KM) {
//         showCustomAlert(
//           'Distance Too Short',
//           `Pickup and destination are too close (${distance.toFixed(1)} km). Minimum distance is ${MIN_DISTANCE_KM} km for a ride.`,
//           'warning'
//         );
//         return;
//       }
      
//       if (distance > MAX_DISTANCE_KM) {
//         showCustomAlert(
//           'Distance Too Far',
//           `Distance is too far (${distance.toFixed(1)} km). Maximum allowed is ${MAX_DISTANCE_KM} km for daily commutes.`,
//           'warning'
//         );
//         return;
//       }
//     }

//     // Validate time
//     if (!validateSelectedTime(selectedDate)) {
//       return;
//     }

//     const DriveData = {
//       from,
//       to,
//       dateTime: selectedDate,
//       userId: userId,
//       fromCoords,
//       toCoords,
//     };
//     console.log('🚗 Drive data:', DriveData);

//     onNext();
//   };

//   return (
//     <View style={styles.container}>
//       <View style={styles.titleSection}>
//         <Text style={styles.title}>Route Details</Text>
//         <Text style={styles.sectionTitle}>Where are you going?</Text>
//       </View>

//       {/* From Location */}
//       <TouchableOpacity
//         style={[styles.locationContainer, isEdit && lockedFields.includes('origin') && styles.lockedField]}
//         onPress={() => {
//           if (isEdit && lockedFields.includes('origin')) {
//             showCustomAlert('Location Locked', 'Origin cannot be changed as you have confirmed bookings.', 'warning');
//             return;
//           }
//           navigation.navigate('LocationSearch', { 
//             type: 'from',
//             currentFromLocation: fromCoords ? { 
//               coordinates: [fromCoords.longitude, fromCoords.latitude], 
//               label: from 
//             } : null,
//             currentToLocation: toCoords ? { 
//               coordinates: [toCoords.longitude, toCoords.latitude], 
//               label: to 
//             } : null,
//             onSelect: (location) => handleLocationSelect(location, 'from')
//           });
//         }}
//       >
//         <Ionicons name="location-sharp" size={20} color={Colors.success} style={styles.inputIcon} />
//         <Text style={[styles.locationInput, isEdit && lockedFields.includes('origin') && styles.lockedText]}>
//           {from || 'From'}
//         </Text>
//         {isEdit && lockedFields.includes('origin') && (
//           <MaterialIcons name="lock" size={16} color={Colors.gray} style={styles.lockIcon} />
//         )}
//       </TouchableOpacity>

//       {/* To Location */}
//       <TouchableOpacity
//         style={[styles.locationContainer, isEdit && lockedFields.includes('destination') && styles.lockedField]}
//         onPress={() => {
//           if (isEdit && lockedFields.includes('destination')) {
//             showCustomAlert('Location Locked', 'Destination cannot be changed as you have confirmed bookings.', 'warning');
//             return;
//           }
//           navigation.navigate('LocationSearch', { 
//             type: 'to',
//             currentFromLocation: fromCoords ? { 
//               coordinates: [fromCoords.longitude, fromCoords.latitude], 
//               label: from 
//             } : null,
//             currentToLocation: toCoords ? { 
//               coordinates: [toCoords.longitude, toCoords.latitude], 
//               label: to 
//             } : null,
//             onSelect: (location) => handleLocationSelect(location, 'to')
//           });
//         }}
//       >
//         <Ionicons name="location-sharp" size={20} color={Colors.secondary} style={styles.inputIcon} />
//         <Text style={[styles.locationInput, isEdit && lockedFields.includes('destination') && styles.lockedText]}>
//           {to || 'To'}
//         </Text>
//         {isEdit && lockedFields.includes('destination') && (
//           <MaterialIcons name="lock" size={16} color={Colors.gray} style={styles.lockIcon} />
//         )}
//       </TouchableOpacity>

//       {/* Date/Time Section */}
//       <View style={styles.whenSection}>
//         <Text style={styles.sectionTitle}>When?</Text>
//         <TouchableOpacity style={[styles.timeInput, isEdit && lockedFields.includes('time') && styles.lockedField]} onPress={showDateTimePicker}>
//           <Text style={[styles.timeText, isEdit && lockedFields.includes('time') && styles.lockedText]}>
//             {formatDateTime()}
//           </Text>
//           <Ionicons name="calendar" size={20} color={Colors.secondary} />
//         </TouchableOpacity>
//         {isEdit && lockedFields.includes('time') && (
//           <Text style={styles.lockedHint}>Time adjustment limited to ±10 minutes</Text>
//         )}
//       </View>

//       {/* Continue Button */}
//       <TouchableOpacity
//         style={[styles.actionButton, { backgroundColor: Colors.primary }]}
//         onPress={handleNext}
//         disabled={loading}
//       >
//         <Text style={styles.actionButtonText}>Continue</Text>
//       </TouchableOpacity>

//       {/* Date/Time Pickers */}
//       {showDatePicker && (
//         <DateTimePicker
//           value={selectedDate}
//           mode="date"
//           display={Platform.OS === 'ios' ? 'spinner' : 'default'}
//           onChange={onDateChange}
//           minimumDate={new Date()}
//         />
//       )}

//       {showTimePicker && (
//         <DateTimePicker
//           value={selectedDate}
//           mode="time"
//           display={Platform.OS === 'ios' ? 'spinner' : 'default'}
//           onChange={onTimeChange}
//         />
//       )}

//       {Platform.OS === 'ios' && showDatePicker && (
//         <Modal transparent={true} visible={showDatePicker} animationType="slide">
//           <View style={styles.iosPickerContainer}>
//             <View style={styles.iosPickerContent}>
//               <View style={styles.iosPickerHeader}>
//                 <TouchableOpacity onPress={() => setShowDatePicker(false)}>
//                   <Text style={[styles.iosPickerButton, {color: Colors.gray}]}>Cancel</Text>
//                 </TouchableOpacity>
//                 <TouchableOpacity onPress={() => setShowDatePicker(false)}>
//                   <Text style={[styles.iosPickerButton, {color: Colors.primary}]}>Done</Text>
//                 </TouchableOpacity>
//               </View>
//               <DateTimePicker
//                 value={selectedDate}
//                 mode="datetime"
//                 display="spinner"
//                 onChange={onDateChange}
//                 minimumDate={new Date()}
//                 textColor={Colors.dark}
//               />
//             </View>
//           </View>
//         </Modal>
//       )}

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
//     </View>
//   );
// }

// const styles = StyleSheet.create({ 
//   container: {
//     backgroundColor: 'rgba(255, 255, 255, 0.95)',
//     padding: 18,
//     marginBottom: 16,
//     borderRadius: 28,
//     flex: 1,
//     shadowColor: '#000',
//     shadowOffset: { width: 0, height: 10 },
//     shadowOpacity: 0.15,
//     shadowRadius: 20,
//     elevation: 10,
//     borderWidth: 1,
//     borderColor: 'rgba(229, 231, 235, 0.5)',
//   },
//   titleSection: {
//     marginBottom: 2,
//   },
//   title: {
//     fontSize: 20,
//     fontWeight: '700',
//     color: Colors.dark,
//     marginBottom: 18,
//   },
//   sectionTitle: {
//     fontSize: 18,
//     fontWeight: '600',
//     color: Colors.dark,
//     marginBottom: 12,
//   },
//   inputIcon: {
//     marginRight: -10,
//     marginLeft: 10,
//   },
//   locationContainer: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     borderWidth: 1.5,
//     borderColor: '#E5E7EB',
//     borderRadius: 14,
//     backgroundColor: '#F9FAFB',
//     marginBottom: 12,
//   },
//   locationInput: {
//     flex: 1,
//     fontSize: 16,
//     color: Colors.dark,
//     fontWeight: '500',
//     paddingHorizontal: 16,
//     paddingVertical: 15,
//   },
//   whenSection: {
//     marginBottom: 2,
//   },
//   timeInput: {
//     borderWidth: 1.5,
//     borderColor: '#E5E7EB',
//     borderRadius: 14,
//     paddingHorizontal: 16,
//     paddingVertical: 15,
//     fontSize: 16,
//     color: Colors.dark,
//     fontWeight: '500',
//     marginBottom: 12,
//     backgroundColor: '#F9FAFB',
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//     alignItems: 'center',
//   },
//   timeText: {
//     flex: 1,
//     fontSize: 16,
//     color: Colors.dark,
//     fontWeight: '500',
//   },
//   iosPickerContainer: {
//     flex: 1,
//     backgroundColor: 'rgba(0,0,0,0.5)',
//     justifyContent: 'flex-end',
//   },
//   iosPickerContent: {
//     backgroundColor: Colors.white,
//     borderTopLeftRadius: 20,
//     borderTopRightRadius: 20,
//   },
//   iosPickerHeader: {
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//     paddingHorizontal: 20,
//     paddingVertical: 15,
//     borderBottomWidth: 1,
//     borderBottomColor: '#e0e0e0',
//   },
//   iosPickerButton: {
//     fontSize: 16,
//     fontWeight: '600',
//   },
//   actionButton: {
//     borderRadius: 16,
//     overflow: 'hidden',
//     marginTop: 15,
//     shadowColor: Colors.primary,
//     shadowOffset: { width: 0, height: 8 },
//     shadowOpacity: 0.3,
//     shadowRadius: 16,
//     elevation: 8,
//     paddingVertical: 13,
//     alignItems: 'center',
//     justifyContent: 'center',
//     flexDirection: 'row',
//   },
//   actionButtonText: {
//     color: Colors.white,
//     fontSize: 18,
//     fontWeight: '700',
//     letterSpacing: 0.5,
//   },
//   lockedField: {
//     backgroundColor: '#F3F4F6',
//     borderColor: '#D1D5DB',
//   },
//   lockedText: {
//     color: Colors.gray,
//   },
//   lockIcon: {
//     marginRight: 12,
//   },
//   lockedHint: {
//     fontSize: 11,
//     color: Colors.primary,
//     marginTop: -8,
//     marginBottom: 8,
//     marginLeft: 4,
//   },
// });
import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Platform,
  Modal,
} from 'react-native';
import { Colors } from '../../constants/Colors';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';
import CustomAlert from '../../components/CustomAlert';

export default function Step1({ 
  from, 
  to, 
  setFrom, 
  setTo, 
  setFromCoords, 
  setToCoords, 
  dateTime, 
  setDateTime, 
  onNext, 
  navigation, 
  route, 
  phoneNumber: phoneNumberProp, 
  fromCoords, 
  toCoords, 
  setRouteOptions,
  setSelectedRouteIndex,
  isEdit = false,
  lockedFields = [],
  validateDateTime: externalValidateDateTime,
}) {

  const [selectedDate, setSelectedDate] = useState(dateTime);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);
  
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

  const validateSelectedTime = (selectedDateTime) => {
    const now = new Date();
    const minTime = new Date(now.getTime() + 30 * 60000);
    
    if (selectedDateTime < now) {
      showCustomAlert(
        "Invalid Time",
        "Cannot select past date and time. Please select a future time.",
        "warning"
      );
      return false;
    }
    
    if (selectedDateTime < minTime) {
      showCustomAlert(
        "Time Too Soon",
        `Departure time must be at least 30 minutes from now.\n\nPlease select a time after ${minTime.toLocaleTimeString()}.`,
        "warning"
      );
      return false;
    }
    return true;
  };

  useEffect(() => {
    if (fromCoords && typeof fromCoords === 'object' && fromCoords.latitude && fromCoords.longitude) {
      setFromCoords({ latitude: fromCoords.latitude, longitude: fromCoords.longitude });
    }
    if (toCoords && typeof toCoords === 'object' && toCoords.latitude && toCoords.longitude) {
      setToCoords({ latitude: toCoords.latitude, longitude: toCoords.longitude });
    }
  }, []);

  const formatDateTime = () => {
    const today = new Date();
    const isToday = selectedDate.toDateString() === today.toDateString();
    
    const timeString = selectedDate.toLocaleTimeString('en-IN', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    });

    if (isToday) {
      return `Today, ${timeString}`;
    } else {
      const dateString = selectedDate.toLocaleDateString('en-IN', {
        weekday: 'short',
        month: 'short',
        day: 'numeric'
      });
      return `${dateString}, ${timeString}`;
    }
  };

  const showDateTimePicker = () => {
    if (isEdit && lockedFields.includes('time')) {
      showCustomAlert(
        "Time Locked",
        "Cannot change departure time as you have confirmed bookings. You can only adjust by ±10 minutes through the ride management screen.",
        "warning"
      );
      return;
    }
    setShowDatePicker(true);
  };

  const onDateChange = (event, selectedDateValue) => {
    if (Platform.OS === 'android') {
      setShowDatePicker(false);
      if (selectedDateValue) {
        setShowTimePicker(true);
        setSelectedDate(selectedDateValue);
      }
    } else if (Platform.OS === 'ios') {
      if (selectedDateValue) {
        const newDateTime = new Date(selectedDateValue);
        if (validateSelectedTime(newDateTime)) {
          setSelectedDate(newDateTime);
          setDateTime(newDateTime);
        }
      }
    }
  };

  const onTimeChange = (event, selectedTime) => {
    setShowTimePicker(false);
    if (selectedTime) {
      const newDateTime = new Date(selectedDate);
      newDateTime.setHours(selectedTime.getHours());
      newDateTime.setMinutes(selectedTime.getMinutes());
      
      if (isEdit && lockedFields.includes('time')) {
        const originalTime = new Date(dateTime);
        const timeDiffMinutes = Math.abs(newDateTime - originalTime) / 60000;
        
        if (timeDiffMinutes > 10) {
          showCustomAlert(
            "Time Change Limited",
            "You can only adjust departure time by up to 10 minutes when you have confirmed bookings.\n\nPlease contact passengers if you need to make significant changes.",
            "warning"
          );
          return;
        }
      }
      
      if (validateSelectedTime(newDateTime)) {
        setSelectedDate(newDateTime);
        setDateTime(newDateTime);
      }
    }
  };

  const handleLocationSelect = (location, type) => {
    console.log(`📍 Location selected for ${type}:`, location);
    
    const coords = {
      latitude: location.latitude || location.coords?.latitude || location.coordinates?.[1],
      longitude: location.longitude || location.coords?.longitude || location.coordinates?.[0]
    };
    
    if (type === 'from') {
      setFrom(location.label || location.name);
      setFromCoords(coords);
    } else {
      setTo(location.label || location.name);
      setToCoords(coords);
    }
    
    setRouteOptions([]);
    setSelectedRouteIndex(0);
  };

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

  const handleNext = () => {
    // Check if locations are selected
    if (!from || !to) {
      showCustomAlert('Required Fields', 'Please enter both pickup and destination locations', 'warning');
      return;
    }
    
    // Check if coordinates are available
    if (!fromCoords || !toCoords) {
      showCustomAlert('Missing Location Details', 'Please select locations from the map to get coordinates.', 'warning');
      return;
    }
    
    // Check if same location
    const sameLocation = Math.abs(fromCoords.latitude - toCoords.latitude) < 0.0001 &&
      Math.abs(fromCoords.longitude - toCoords.longitude) < 0.0001;

    if (sameLocation) {
      showCustomAlert(
        'Invalid Route',
        'Pickup and destination locations cannot be the same.',
        'warning'
      );
      return;
    }

    // Calculate and validate distance
    const distance = calculateDistance(
      fromCoords.latitude, fromCoords.longitude,
      toCoords.latitude, toCoords.longitude
    );
    
    const MIN_DISTANCE_KM = 3;
    const MAX_DISTANCE_KM = 300;
    
    if (distance < MIN_DISTANCE_KM) {
      showCustomAlert(
        'Distance Too Short',
        `Pickup and destination are too close (${distance.toFixed(1)} km). Minimum distance is ${MIN_DISTANCE_KM} km for a ride.`,
        'warning'
      );
      return;
    }
    
    if (distance > MAX_DISTANCE_KM) {
      showCustomAlert(
        'Distance Too Far',
        `Distance is too far (${distance.toFixed(1)} km). Maximum allowed is ${MAX_DISTANCE_KM} km for daily commutes.`,
        'warning'
      );
      return;
    }

    // Validate time
    if (!validateSelectedTime(selectedDate)) {
      return;
    }

    // All validations passed
    onNext();
  };

  const isOriginLocked = isEdit && lockedFields.includes('origin');
  const isDestinationLocked = isEdit && lockedFields.includes('destination');
  const isTimeLocked = isEdit && lockedFields.includes('time');

  return (
    <View style={styles.container}>
      <View style={styles.titleSection}>
        <Text style={styles.title}>Route Details</Text>
        <Text style={styles.sectionTitle}>Where are you going?</Text>
      </View>

      {/* From Location */}
      <TouchableOpacity
        style={[styles.locationContainer, isOriginLocked && styles.lockedField]}
        onPress={() => {
          if (isOriginLocked) {
            showCustomAlert(
              'Location Locked', 
              'Origin cannot be changed as you have confirmed bookings.\n\nTo change origin, please cancel the ride and create a new one.', 
              'warning'
            );
            return;
          }
          navigation.navigate('LocationSearch', { 
            type: 'from',
            onSelect: (location) => handleLocationSelect(location, 'from')
          });
        }}
      >
        <Ionicons name="location-sharp" size={20} color={Colors.success} style={styles.inputIcon} />
        <Text style={[styles.locationInput, isOriginLocked && styles.lockedText]}>
          {from || 'From'}
        </Text>
        {isOriginLocked && (
          <MaterialIcons name="lock" size={16} color={Colors.gray} style={styles.lockIcon} />
        )}
      </TouchableOpacity>

      {/* To Location */}
      <TouchableOpacity
        style={[styles.locationContainer, isDestinationLocked && styles.lockedField]}
        onPress={() => {
          if (isDestinationLocked) {
            showCustomAlert(
              'Location Locked', 
              'Destination cannot be changed as you have confirmed bookings.\n\nTo change destination, please cancel the ride and create a new one.', 
              'warning'
            );
            return;
          }
          navigation.navigate('LocationSearch', { 
            type: 'to',
            onSelect: (location) => handleLocationSelect(location, 'to')
          });
        }}
      >
        <Ionicons name="location-sharp" size={20} color={Colors.secondary} style={styles.inputIcon} />
        <Text style={[styles.locationInput, isDestinationLocked && styles.lockedText]}>
          {to || 'To'}
        </Text>
        {isDestinationLocked && (
          <MaterialIcons name="lock" size={16} color={Colors.gray} style={styles.lockIcon} />
        )}
      </TouchableOpacity>

      {/* Date/Time Section */}
      <View style={styles.whenSection}>
        <Text style={styles.sectionTitle}>When?</Text>
        <TouchableOpacity 
          style={[styles.timeInput, isTimeLocked && styles.lockedField]} 
          onPress={showDateTimePicker}
        >
          <Text style={[styles.timeText, isTimeLocked && styles.lockedText]}>
            {formatDateTime()}
          </Text>
          <Ionicons name="calendar" size={20} color={isTimeLocked ? Colors.gray : Colors.secondary} />
        </TouchableOpacity>
        {isTimeLocked && (
          <Text style={styles.lockedHint}>⚠️ Time adjustment limited to ±10 minutes</Text>
        )}
      </View>

      {/* Continue Button */}
      <TouchableOpacity
        style={[styles.actionButton, { backgroundColor: Colors.primary }]}
        onPress={handleNext}
      >
        <Text style={styles.actionButtonText}>Continue</Text>
      </TouchableOpacity>

      {/* Date/Time Pickers */}
      {showDatePicker && Platform.OS === 'android' && (
        <DateTimePicker
          value={selectedDate}
          mode="date"
          display="default"
          onChange={onDateChange}
          minimumDate={new Date()}
        />
      )}

      {showTimePicker && Platform.OS === 'android' && (
        <DateTimePicker
          value={selectedDate}
          mode="time"
          display="default"
          onChange={onTimeChange}
        />
      )}

      {Platform.OS === 'ios' && showDatePicker && (
        <Modal transparent={true} visible={showDatePicker} animationType="slide">
          <View style={styles.iosPickerContainer}>
            <View style={styles.iosPickerContent}>
              <View style={styles.iosPickerHeader}>
                <TouchableOpacity onPress={() => setShowDatePicker(false)}>
                  <Text style={[styles.iosPickerButton, {color: Colors.gray}]}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => setShowDatePicker(false)}>
                  <Text style={[styles.iosPickerButton, {color: Colors.primary}]}>Done</Text>
                </TouchableOpacity>
              </View>
              <DateTimePicker
                value={selectedDate}
                mode="datetime"
                display="spinner"
                onChange={onDateChange}
                minimumDate={new Date()}
                textColor={Colors.dark}
              />
            </View>
          </View>
        </Modal>
      )}

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
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    padding: 18,
    marginBottom: 16,
    borderRadius: 28,
    flex: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.15,
    shadowRadius: 20,
    elevation: 10,
    borderWidth: 1,
    borderColor: 'rgba(229, 231, 235, 0.5)',
  },
  titleSection: {
    marginBottom: 2,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: Colors.dark,
    marginBottom: 18,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.dark,
    marginBottom: 12,
  },
  inputIcon: {
    marginRight: -10,
    marginLeft: 10,
  },
  locationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: '#E5E7EB',
    borderRadius: 14,
    backgroundColor: '#F9FAFB',
    marginBottom: 12,
  },
  locationInput: {
    flex: 1,
    fontSize: 16,
    color: Colors.dark,
    fontWeight: '500',
    paddingHorizontal: 16,
    paddingVertical: 15,
  },
  whenSection: {
    marginBottom: 2,
  },
  timeInput: {
    borderWidth: 1.5,
    borderColor: '#E5E7EB',
    borderRadius: 14,
    paddingHorizontal: 16,
    paddingVertical: 15,
    fontSize: 16,
    color: Colors.dark,
    fontWeight: '500',
    marginBottom: 12,
    backgroundColor: '#F9FAFB',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  timeText: {
    flex: 1,
    fontSize: 16,
    color: Colors.dark,
    fontWeight: '500',
  },
  iosPickerContainer: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  iosPickerContent: {
    backgroundColor: Colors.white,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },
  iosPickerHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  iosPickerButton: {
    fontSize: 16,
    fontWeight: '600',
  },
  actionButton: {
    borderRadius: 16,
    overflow: 'hidden',
    marginTop: 15,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 8,
    paddingVertical: 13,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
  },
  actionButtonText: {
    color: Colors.white,
    fontSize: 18,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  lockedField: {
    backgroundColor: '#F3F4F6',
    borderColor: '#D1D5DB',
  },
  lockedText: {
    color: Colors.gray,
  },
  lockIcon: {
    marginRight: 12,
  },
  lockedHint: {
    fontSize: 11,
    color: Colors.primary,
    marginTop: -8,
    marginBottom: 8,
    marginLeft: 4,
  },
});