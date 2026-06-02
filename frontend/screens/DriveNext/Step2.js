// import React, { useState, useRef, useMemo, useEffect } from 'react';
// import { View, Text, TouchableOpacity, Animated, StyleSheet } from 'react-native';
// import MapView, { Polyline, Marker, PROVIDER_GOOGLE } from 'react-native-maps';
// import { Colors } from '../../constants/Colors';
// import { Ionicons } from '@expo/vector-icons';
// import CustomAlert from '../../components/CustomAlert';

// /* =========================================
//    HELPERS
// ========================================= */

// function parseDurationToMinutes(durationStr) {
//   if (!durationStr) return 0;
//   let mins = 0;
//   const hrMatch = durationStr.match(/(\d+)\s*Hr/i);
//   const minMatch = durationStr.match(/(\d+)\s*Min/i);
//   if (hrMatch) mins += parseInt(hrMatch[1], 10) * 60;
//   if (minMatch) mins += parseInt(minMatch[1], 10);
//   return mins;
// }

// function formatDurationHHMM(durationStr) {
//   const totalMins = parseDurationToMinutes(durationStr);
//   const hrs = Math.floor(totalMins / 60);
//   const mins = totalMins % 60;
//   if (hrs > 0 && mins > 0) return `${hrs}h ${mins.toString().padStart(2, '0')}m`;
//   if (hrs > 0) return `${hrs}h`;
//   return `${mins}m`;
// }

// function getRouteLabels(routeOptions) {
//   if (!routeOptions || routeOptions.length === 0) return [];

//   const withMeta = routeOptions.map((r, idx) => ({
//     idx,
//     distance: parseFloat(r.distance) || 0,
//     durationMins: parseDurationToMinutes(r.duration),
//   }));

//   const fastestIdx = withMeta.reduce((best, cur) =>
//     cur.durationMins < best.durationMins ? cur : best
//   , withMeta[0]).idx;

//   const shortestIdx = withMeta.reduce((best, cur) =>
//     cur.distance < best.distance ? cur : best
//   , withMeta[0]).idx;

//   return routeOptions.map((_, idx) => {
//     if (routeOptions.length === 1) return 'Recommended';
//     if (idx === fastestIdx && idx === shortestIdx) return 'Fastest & Shortest';
//     if (idx === fastestIdx) return 'Fastest';
//     if (idx === shortestIdx) return 'Shortest';
//     return 'Alternative';
//   });
// }

// const LABEL_COLORS = {
//   'Fastest & Shortest': '#16A34A',
//   'Fastest': '#2563EB',
//   'Shortest': '#7C3AED',
//   'Recommended': '#2563EB',
//   'Alternative': '#6B7280',
// };

// const LABEL_ICONS = {
//   'Fastest & Shortest': 'flash',
//   'Fastest': 'flash',
//   'Shortest': 'navigate',
//   'Recommended': 'star',
//   'Alternative': 'map-outline',
// };

// /* =========================================
//    COMPONENT
// ========================================= */

// export default function Step2({
//   routeOptions,
//   selectedRouteIndex,
//   setSelectedRouteIndex,
//   onNext,
// }) {
//   const mapRef = useRef(null);

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

//   const labels = useMemo(() => getRouteLabels(routeOptions), [routeOptions]);

//   const selectedRoute = routeOptions?.[selectedRouteIndex];

//   useEffect(() => {
//     if (selectedRoute?.geometry?.length > 0 && mapRef.current) {
//       const coords = selectedRoute.geometry;
//       const lats = coords.map(c => c.latitude);
//       const lngs = coords.map(c => c.longitude);
//       const minLat = Math.min(...lats);
//       const maxLat = Math.max(...lats);
//       const minLng = Math.min(...lngs);
//       const maxLng = Math.max(...lngs);
//       const midLat = (minLat + maxLat) / 2;
//       const midLng = (minLng + maxLng) / 2;
//       const latDelta = Math.max(0.02, (maxLat - minLat) * 1.4);
//       const lngDelta = Math.max(0.02, (maxLng - minLng) * 1.4);

//       mapRef.current.animateToRegion({
//         latitude: midLat,
//         longitude: midLng,
//         latitudeDelta: latDelta,
//         longitudeDelta: lngDelta,
//       }, 500);
//     }
//   }, [selectedRouteIndex, selectedRoute]);

//   const handleNext = () => {
//     if (!selectedRoute) {
//       showCustomAlert("No Route Selected", "Please select a route to continue.", "warning");
//       return;
//     }
//     onNext();
//   };

//   if (!routeOptions || routeOptions.length === 0) {
//     return (
//       <View style={{ padding: 20, alignItems: 'center' }}>
//         <Text style={{ color: Colors.gray }}>No routes found. Please check your locations.</Text>
//       </View>
//     );
//   }

//   return (
//     <View style={styles.container}>
//       <Text style={styles.title}>Select Route</Text>

//       <View style={styles.mapWrap}>
//         <MapView
//           ref={mapRef}
//           provider={PROVIDER_GOOGLE}
//           style={styles.map}
//           initialRegion={{
//             latitude: selectedRoute.geometry[0].latitude,
//             longitude: selectedRoute.geometry[0].longitude,
//             latitudeDelta: 0.1,
//             longitudeDelta: 0.1
//           }}
//         >
//           <Polyline
//             coordinates={selectedRoute.geometry}
//             strokeWidth={5}
//             strokeColor={Colors.primary}
//           />
//           <Marker coordinate={selectedRoute.geometry[0]}>
//             <View style={[styles.markerDot, { backgroundColor: '#22C55E' }]} />
//             <View style={styles.markerLabel}>
//               <Text style={styles.markerLabelText}>Start</Text>
//             </View>
//           </Marker>
//           <Marker coordinate={selectedRoute.geometry[selectedRoute.geometry.length - 1]}>
//             <View style={[styles.markerDot, { backgroundColor: '#EF4444' }]} />
//             <View style={styles.markerLabel}>
//               <Text style={styles.markerLabelText}>End</Text>
//             </View>
//           </Marker>
//         </MapView>
//       </View>

//       <View style={styles.drawer}>
//         <Text style={styles.drawerTitle}>Route Options</Text>

//         {routeOptions.map((opt, index) => {
//           const label = labels[index] || 'Route';
//           const labelColor = LABEL_COLORS[label] || Colors.primary;
//           const iconName = LABEL_ICONS[label] || 'map-outline';
//           const isSelected = selectedRouteIndex === index;
//           const durationHHMM = formatDurationHHMM(opt.duration);

//           return (
//             <TouchableOpacity
//               key={index}
//               onPress={() => setSelectedRouteIndex(index)}
//               style={[
//                 styles.routeCard,
//                 isSelected && styles.routeCardSelected,
//               ]}
//               activeOpacity={0.85}
//             >
//               <View style={styles.routeCardLeft}>
//                 <View style={[styles.labelBadge, { backgroundColor: labelColor + '15' }]}>
//                   <Ionicons name={iconName} size={14} color={labelColor} />
//                   <Text style={[styles.labelBadgeText, { color: labelColor }]}>{label}</Text>
//                 </View>
//                 <Text style={styles.routeDistance}>{opt.distance} KM</Text>
//                 <Text style={styles.routeDuration}>{durationHHMM}</Text>
//               </View>

//               <View style={styles.routeCardRight}>
//                 {isSelected ? (
//                   <View style={styles.selectedCircle}>
//                     <Ionicons name="checkmark" size={16} color="#fff" />
//                   </View>
//                 ) : (
//                   <View style={styles.unselectedCircle} />
//                 )}
//               </View>
//             </TouchableOpacity>
//           );
//         })}
//       </View>

//       <TouchableOpacity
//         style={[styles.actionButton, { backgroundColor: Colors.primary }]}
//         onPress={handleNext}
//         activeOpacity={0.8}
//       >
//         <Text style={styles.actionButtonText}>Continue</Text>
//       </TouchableOpacity>

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

// /* =========================================
//    STYLES
// ========================================= */

// const styles = StyleSheet.create({
//   container: {
//     padding: 18,
//     backgroundColor: 'rgba(255, 255, 255, 0.95)',
//     borderRadius: 28,
//     marginBottom: 16,
//     shadowColor: '#000',
//     shadowOffset: { width: 0, height: 10 },
//     shadowOpacity: 0.15,
//     shadowRadius: 20,
//     elevation: 10,
//     borderWidth: 1,
//     borderColor: 'rgba(229, 231, 235, 0.5)',
//   },
//   title: {
//     fontSize: 20,
//     fontWeight: '700',
//     marginBottom: 12,
//     color: Colors.dark,
//   },
//   mapWrap: {
//     height: 320,
//     marginBottom: 12,
//     borderRadius: 16,
//     overflow: 'hidden',
//     borderWidth: 1,
//     borderColor: '#E5E7EB',
//   },
//   map: {
//     flex: 1,
//   },
//   markerDot: {
//     width: 14,
//     height: 14,
//     borderRadius: 7,
//     borderWidth: 2,
//     borderColor: '#fff',
//   },
//   markerLabel: {
//     backgroundColor: 'rgba(0,0,0,0.7)',
//     paddingHorizontal: 6,
//     paddingVertical: 2,
//     borderRadius: 4,
//     marginTop: 2,
//     alignSelf: 'center',
//   },
//   markerLabelText: {
//     color: '#fff',
//     fontSize: 10,
//     fontWeight: '700',
//   },
//   drawer: {
//     backgroundColor: '#fff',
//     borderRadius: 16,
//     padding: 14,
//     shadowColor: '#000',
//     shadowOffset: { width: 0, height: 2 },
//     shadowOpacity: 0.06,
//     shadowRadius: 8,
//     elevation: 2,
//     marginBottom: 4,
//   },
//   drawerTitle: {
//     fontSize: 18,
//     fontWeight: '700',
//     color: Colors.dark,
//     marginBottom: 12,
//   },
//   routeCard: {
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//     alignItems: 'center',
//     padding: 14,
//     borderRadius: 14,
//     borderWidth: 1.5,
//     borderColor: '#F3F4F6',
//     marginBottom: 10,
//     backgroundColor: '#FAFBFC',
//   },
//   routeCardSelected: {
//     borderColor: Colors.primary,
//     backgroundColor: '#EFF6FF',
//   },
//   routeCardLeft: {
//     flex: 1,
//   },
//   labelBadge: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     alignSelf: 'flex-start',
//     paddingHorizontal: 10,
//     paddingVertical: 5,
//     borderRadius: 20,
//     marginBottom: 8,
//     gap: 6,
//   },
//   labelBadgeText: {
//     fontSize: 12,
//     fontWeight: '800',
//   },
//   routeDistance: {
//     fontSize: 16,
//     fontWeight: '700',
//     color: Colors.dark,
//     marginBottom: 2,
//   },
//   routeDuration: {
//     fontSize: 13,
//     color: Colors.gray,
//     fontWeight: '600',
//   },
//   routeCardRight: {
//     marginLeft: 12,
//   },
//   selectedCircle: {
//     width: 28,
//     height: 28,
//     borderRadius: 14,
//     backgroundColor: Colors.primary,
//     alignItems: 'center',
//     justifyContent: 'center',
//   },
//   unselectedCircle: {
//     width: 28,
//     height: 28,
//     borderRadius: 14,
//     borderWidth: 2,
//     borderColor: '#D1D5DB',
//   },
//   actionButton: {
//     borderRadius: 16,
//     overflow: 'hidden',
//     marginTop: 14,
//     shadowColor: Colors.primary,
//     shadowOffset: { width: 0, height: 8 },
//     shadowOpacity: 0.3,
//     shadowRadius: 16,
//     elevation: 8,
//     paddingVertical: 14,
//     alignItems: 'center',
//     justifyContent: 'center',
//   },
//   actionButtonText: {
//     color: Colors.white,
//     fontSize: 18,
//     fontWeight: '700',
//     letterSpacing: 0.5,
//   },
// });
// Step2.js
// import React, { useState, useRef, useMemo, useEffect } from 'react';
// import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
// import MapView, { Polyline, Marker, PROVIDER_GOOGLE } from 'react-native-maps';
// import { Colors } from '../../constants/Colors';
// import { Ionicons } from '@expo/vector-icons';
// import CustomAlert from '../../components/CustomAlert';

// /* =========================================
//    HELPERS
// ========================================= */

// function parseDurationToMinutes(durationStr) {
//   if (!durationStr) return 0;
//   let mins = 0;
//   const hrMatch = durationStr.match(/(\d+)\s*Hr/i);
//   const minMatch = durationStr.match(/(\d+)\s*Min/i);
//   if (hrMatch) mins += parseInt(hrMatch[1], 10) * 60;
//   if (minMatch) mins += parseInt(minMatch[1], 10);
//   return mins;
// }

// function formatDurationHHMM(durationStr) {
//   const totalMins = parseDurationToMinutes(durationStr);
//   const hrs = Math.floor(totalMins / 60);
//   const mins = totalMins % 60;
//   if (hrs > 0 && mins > 0) return `${hrs}h ${mins.toString().padStart(2, '0')}m`;
//   if (hrs > 0) return `${hrs}h`;
//   return `${mins}m`;
// }

// function getRouteLabels(routeOptions) {
//   if (!routeOptions || routeOptions.length === 0) return [];

//   const withMeta = routeOptions.map((r, idx) => ({
//     idx,
//     distance: parseFloat(r.distance) || 0,
//     durationMins: parseDurationToMinutes(r.duration),
//   }));

//   const fastestIdx = withMeta.reduce((best, cur) =>
//     cur.durationMins < best.durationMins ? cur : best
//   , withMeta[0]).idx;

//   const shortestIdx = withMeta.reduce((best, cur) =>
//     cur.distance < best.distance ? cur : best
//   , withMeta[0]).idx;

//   return routeOptions.map((_, idx) => {
//     if (routeOptions.length === 1) return 'Recommended';
//     if (idx === fastestIdx && idx === shortestIdx) return 'Fastest & Shortest';
//     if (idx === fastestIdx) return 'Fastest';
//     if (idx === shortestIdx) return 'Shortest';
//     return 'Alternative';
//   });
// }

// const LABEL_COLORS = {
//   'Fastest & Shortest': '#16A34A',
//   'Fastest': '#2563EB',
//   'Shortest': '#7C3AED',
//   'Recommended': '#2563EB',
//   'Alternative': '#6B7280',
// };

// const LABEL_ICONS = {
//   'Fastest & Shortest': 'flash',
//   'Fastest': 'flash',
//   'Shortest': 'navigate',
//   'Recommended': 'star',
//   'Alternative': 'map-outline',
// };

// /* =========================================
//    COMPONENT
// ========================================= */

// export default function Step2({
//   routeOptions,
//   selectedRouteIndex,
//   setSelectedRouteIndex,
//   onNext,
//   isEdit = false,
//   lockedFields = [],
// }) {
//   const mapRef = useRef(null);

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

//   const labels = useMemo(() => getRouteLabels(routeOptions), [routeOptions]);

//   const selectedRoute = routeOptions?.[selectedRouteIndex];
//   const isRouteLocked = isEdit && lockedFields.includes('route');

//   useEffect(() => {
//     if (selectedRoute?.geometry?.length > 0 && mapRef.current && !isRouteLocked) {
//       const coords = selectedRoute.geometry;
//       const lats = coords.map(c => c.latitude);
//       const lngs = coords.map(c => c.longitude);
//       const minLat = Math.min(...lats);
//       const maxLat = Math.max(...lats);
//       const minLng = Math.min(...lngs);
//       const maxLng = Math.max(...lngs);
//       const midLat = (minLat + maxLat) / 2;
//       const midLng = (minLng + maxLng) / 2;
//       const latDelta = Math.max(0.02, (maxLat - minLat) * 1.4);
//       const lngDelta = Math.max(0.02, (maxLng - minLng) * 1.4);

//       mapRef.current.animateToRegion({
//         latitude: midLat,
//         longitude: midLng,
//         latitudeDelta: latDelta,
//         longitudeDelta: lngDelta,
//       }, 500);
//     }
//   }, [selectedRouteIndex, selectedRoute]);

//   const handleRouteSelect = (index) => {
//     if (isRouteLocked) {
//       showCustomAlert(
//         "Route Locked",
//         "Route cannot be changed as you have confirmed bookings.",
//         "warning"
//       );
//       return;
//     }
//     setSelectedRouteIndex(index);
//   };

//   const handleNext = () => {
//     if (!selectedRoute) {
//       showCustomAlert("No Route Selected", "Please select a route to continue.", "warning");
//       return;
//     }
//     onNext();
//   };

//   if (!routeOptions || routeOptions.length === 0) {
//     return (
//       <View style={styles.container}>
//         <Text style={styles.title}>Select Route</Text>
//         <View style={styles.noRouteContainer}>
//           <Ionicons name="map-outline" size={48} color={Colors.gray} />
//           <Text style={styles.noRouteText}>No routes found.</Text>
//           <Text style={styles.noRouteSubtext}>Please check your locations and try again.</Text>
//         </View>
//       </View>
//     );
//   }

//   return (
//     <View style={styles.container}>
//       <Text style={styles.title}>Select Route</Text>
      
//       {isRouteLocked && (
//         <View style={styles.lockedBanner}>
//           <Ionicons name="lock-closed" size={16} color={Colors.gray} />
//           <Text style={styles.lockedBannerText}>Route is locked due to confirmed bookings</Text>
//         </View>
//       )}

//       <View style={styles.mapWrap}>
//         <MapView
//           ref={mapRef}
//           provider={PROVIDER_GOOGLE}
//           style={styles.map}
//           initialRegion={{
//             latitude: selectedRoute.geometry[0].latitude,
//             longitude: selectedRoute.geometry[0].longitude,
//             latitudeDelta: 0.1,
//             longitudeDelta: 0.1
//           }}
//         >
//           <Polyline
//             coordinates={selectedRoute.geometry}
//             strokeWidth={5}
//             strokeColor={Colors.primary}
//           />
//           <Marker coordinate={selectedRoute.geometry[0]}>
//             <View style={[styles.markerDot, { backgroundColor: '#22C55E' }]} />
//             <View style={styles.markerLabel}>
//               <Text style={styles.markerLabelText}>Start</Text>
//             </View>
//           </Marker>
//           <Marker coordinate={selectedRoute.geometry[selectedRoute.geometry.length - 1]}>
//             <View style={[styles.markerDot, { backgroundColor: '#EF4444' }]} />
//             <View style={styles.markerLabel}>
//               <Text style={styles.markerLabelText}>End</Text>
//             </View>
//           </Marker>
//         </MapView>
//       </View>

//       <View style={styles.drawer}>
//         <Text style={styles.drawerTitle}>Route Options</Text>

//         {routeOptions.map((opt, index) => {
//           const label = labels[index] || 'Route';
//           const labelColor = LABEL_COLORS[label] || Colors.primary;
//           const iconName = LABEL_ICONS[label] || 'map-outline';
//           const isSelected = selectedRouteIndex === index;
//           const durationHHMM = formatDurationHHMM(opt.duration);

//           return (
//             <TouchableOpacity
//               key={index}
//               onPress={() => handleRouteSelect(index)}
//               style={[
//                 styles.routeCard,
//                 isSelected && styles.routeCardSelected,
//                 isRouteLocked && !isSelected && styles.routeCardDisabled
//               ]}
//               activeOpacity={0.85}
//             >
//               <View style={styles.routeCardLeft}>
//                 <View style={[styles.labelBadge, { backgroundColor: labelColor + '15' }]}>
//                   <Ionicons name={iconName} size={14} color={labelColor} />
//                   <Text style={[styles.labelBadgeText, { color: labelColor }]}>{label}</Text>
//                 </View>
//                 <Text style={styles.routeDistance}>{opt.distance} KM</Text>
//                 <Text style={styles.routeDuration}>{durationHHMM}</Text>
//               </View>

//               <View style={styles.routeCardRight}>
//                 {isSelected ? (
//                   <View style={styles.selectedCircle}>
//                     <Ionicons name="checkmark" size={16} color="#fff" />
//                   </View>
//                 ) : (
//                   <View style={styles.unselectedCircle} />
//                 )}
//               </View>
//             </TouchableOpacity>
//           );
//         })}
//       </View>

//       <TouchableOpacity
//         style={[styles.actionButton, { backgroundColor: Colors.primary }]}
//         onPress={handleNext}
//         activeOpacity={0.8}
//       >
//         <Text style={styles.actionButtonText}>Continue</Text>
//       </TouchableOpacity>

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
//     padding: 18,
//     backgroundColor: 'rgba(255, 255, 255, 0.95)',
//     borderRadius: 28,
//     marginBottom: 16,
//     shadowColor: '#000',
//     shadowOffset: { width: 0, height: 10 },
//     shadowOpacity: 0.15,
//     shadowRadius: 20,
//     elevation: 10,
//     borderWidth: 1,
//     borderColor: 'rgba(229, 231, 235, 0.5)',
//   },
//   title: {
//     fontSize: 20,
//     fontWeight: '700',
//     marginBottom: 12,
//     color: Colors.dark,
//   },
//   mapWrap: {
//     height: 320,
//     marginBottom: 12,
//     borderRadius: 16,
//     overflow: 'hidden',
//     borderWidth: 1,
//     borderColor: '#E5E7EB',
//   },
//   map: {
//     flex: 1,
//   },
//   markerDot: {
//     width: 14,
//     height: 14,
//     borderRadius: 7,
//     borderWidth: 2,
//     borderColor: '#fff',
//   },
//   markerLabel: {
//     backgroundColor: 'rgba(0,0,0,0.7)',
//     paddingHorizontal: 6,
//     paddingVertical: 2,
//     borderRadius: 4,
//     marginTop: 2,
//     alignSelf: 'center',
//   },
//   markerLabelText: {
//     color: '#fff',
//     fontSize: 10,
//     fontWeight: '700',
//   },
//   drawer: {
//     backgroundColor: '#fff',
//     borderRadius: 16,
//     padding: 14,
//     shadowColor: '#000',
//     shadowOffset: { width: 0, height: 2 },
//     shadowOpacity: 0.06,
//     shadowRadius: 8,
//     elevation: 2,
//     marginBottom: 4,
//   },
//   drawerTitle: {
//     fontSize: 18,
//     fontWeight: '700',
//     color: Colors.dark,
//     marginBottom: 12,
//   },
//   routeCard: {
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//     alignItems: 'center',
//     padding: 14,
//     borderRadius: 14,
//     borderWidth: 1.5,
//     borderColor: '#F3F4F6',
//     marginBottom: 10,
//     backgroundColor: '#FAFBFC',
//   },
//   routeCardSelected: {
//     borderColor: Colors.primary,
//     backgroundColor: '#EFF6FF',
//   },
//   routeCardDisabled: {
//     opacity: 0.5,
//   },
//   routeCardLeft: {
//     flex: 1,
//   },
//   labelBadge: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     alignSelf: 'flex-start',
//     paddingHorizontal: 10,
//     paddingVertical: 5,
//     borderRadius: 20,
//     marginBottom: 8,
//     gap: 6,
//   },
//   labelBadgeText: {
//     fontSize: 12,
//     fontWeight: '800',
//   },
//   routeDistance: {
//     fontSize: 16,
//     fontWeight: '700',
//     color: Colors.dark,
//     marginBottom: 2,
//   },
//   routeDuration: {
//     fontSize: 13,
//     color: Colors.gray,
//     fontWeight: '600',
//   },
//   routeCardRight: {
//     marginLeft: 12,
//   },
//   selectedCircle: {
//     width: 28,
//     height: 28,
//     borderRadius: 14,
//     backgroundColor: Colors.primary,
//     alignItems: 'center',
//     justifyContent: 'center',
//   },
//   unselectedCircle: {
//     width: 28,
//     height: 28,
//     borderRadius: 14,
//     borderWidth: 2,
//     borderColor: '#D1D5DB',
//   },
//   actionButton: {
//     borderRadius: 16,
//     overflow: 'hidden',
//     marginTop: 14,
//     shadowColor: Colors.primary,
//     shadowOffset: { width: 0, height: 8 },
//     shadowOpacity: 0.3,
//     shadowRadius: 16,
//     elevation: 8,
//     paddingVertical: 14,
//     alignItems: 'center',
//     justifyContent: 'center',
//   },
//   actionButtonText: {
//     color: Colors.white,
//     fontSize: 18,
//     fontWeight: '700',
//     letterSpacing: 0.5,
//   },
//   noRouteContainer: {
//     alignItems: 'center',
//     paddingVertical: 40,
//   },
//   noRouteText: {
//     fontSize: 16,
//     fontWeight: '600',
//     color: Colors.gray,
//     marginTop: 12,
//   },
//   noRouteSubtext: {
//     fontSize: 14,
//     color: Colors.gray,
//     marginTop: 4,
//     textAlign: 'center',
//   },
//   lockedBanner: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     backgroundColor: '#FEF3C7',
//     padding: 10,
//     borderRadius: 10,
//     marginBottom: 12,
//     gap: 8,
//   },
//   lockedBannerText: {
//     flex: 1,
//     fontSize: 12,
//     color: '#92400E',
//   },
// });
import React, { useState, useRef, useMemo, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import MapView, { Polyline, Marker, PROVIDER_GOOGLE } from 'react-native-maps';
import { Colors } from '../../constants/Colors';
import { Ionicons } from '@expo/vector-icons';
import CustomAlert from '../../components/CustomAlert';

function parseDurationToMinutes(durationStr) {
  if (!durationStr) return 0;
  let mins = 0;
  const hrMatch = durationStr.match(/(\d+)\s*Hr/i);
  const minMatch = durationStr.match(/(\d+)\s*Min/i);
  if (hrMatch) mins += parseInt(hrMatch[1], 10) * 60;
  if (minMatch) mins += parseInt(minMatch[1], 10);
  return mins;
}

function formatDurationHHMM(durationStr) {
  const totalMins = parseDurationToMinutes(durationStr);
  const hrs = Math.floor(totalMins / 60);
  const mins = totalMins % 60;
  if (hrs > 0 && mins > 0) return `${hrs}h ${mins.toString().padStart(2, '0')}m`;
  if (hrs > 0) return `${hrs}h`;
  return `${mins}m`;
}

function getRouteLabels(routeOptions) {
  if (!routeOptions || routeOptions.length === 0) return [];

  const withMeta = routeOptions.map((r, idx) => ({
    idx,
    distance: parseFloat(r.distance) || 0,
    durationMins: parseDurationToMinutes(r.duration),
  }));

  const fastestIdx = withMeta.reduce((best, cur) =>
    cur.durationMins < best.durationMins ? cur : best
  , withMeta[0]).idx;

  const shortestIdx = withMeta.reduce((best, cur) =>
    cur.distance < best.distance ? cur : best
  , withMeta[0]).idx;

  return routeOptions.map((_, idx) => {
    if (routeOptions.length === 1) return 'Recommended';
    if (idx === fastestIdx && idx === shortestIdx) return 'Fastest & Shortest';
    if (idx === fastestIdx) return 'Fastest';
    if (idx === shortestIdx) return 'Shortest';
    return 'Alternative';
  });
}

const LABEL_COLORS = {
  'Fastest & Shortest': '#16A34A',
  'Fastest': '#2563EB',
  'Shortest': '#7C3AED',
  'Recommended': '#2563EB',
  'Alternative': '#6B7280',
};

const LABEL_ICONS = {
  'Fastest & Shortest': 'flash',
  'Fastest': 'flash',
  'Shortest': 'navigate',
  'Recommended': 'star',
  'Alternative': 'map-outline',
};

export default function Step2({
  routeOptions,
  selectedRouteIndex,
  setSelectedRouteIndex,
  onNext,
  isEdit = false,
  lockedFields = [],
  loadingRoute = false,
}) {
  const mapRef = useRef(null);

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

  const labels = useMemo(() => getRouteLabels(routeOptions), [routeOptions]);

  const selectedRoute = routeOptions?.[selectedRouteIndex];
  const isRouteLocked = isEdit && lockedFields.includes('route');

  // Auto-select the first route if none selected and routes available
  useEffect(() => {
    if (routeOptions && routeOptions.length > 0 && selectedRouteIndex === 0 && !selectedRoute) {
      // Wait for map to be ready
      setTimeout(() => {
        if (mapRef.current && routeOptions[0]?.geometry?.length > 0) {
          const coords = routeOptions[0].geometry;
          const lats = coords.map(c => c.latitude);
          const lngs = coords.map(c => c.longitude);
          const minLat = Math.min(...lats);
          const maxLat = Math.max(...lats);
          const minLng = Math.min(...lngs);
          const maxLng = Math.max(...lngs);
          const midLat = (minLat + maxLat) / 2;
          const midLng = (minLng + maxLng) / 2;
          const latDelta = Math.max(0.02, (maxLat - minLat) * 1.4);
          const lngDelta = Math.max(0.02, (maxLng - minLng) * 1.4);

          mapRef.current.animateToRegion({
            latitude: midLat,
            longitude: midLng,
            latitudeDelta: latDelta,
            longitudeDelta: lngDelta,
          }, 500);
        }
      }, 100);
    }
  }, [routeOptions, selectedRouteIndex]);

  // Fit map to selected route
  useEffect(() => {
    if (selectedRoute?.geometry?.length > 0 && mapRef.current && !isRouteLocked) {
      const coords = selectedRoute.geometry;
      const lats = coords.map(c => c.latitude);
      const lngs = coords.map(c => c.longitude);
      const minLat = Math.min(...lats);
      const maxLat = Math.max(...lats);
      const minLng = Math.min(...lngs);
      const maxLng = Math.max(...lngs);
      const midLat = (minLat + maxLat) / 2;
      const midLng = (minLng + maxLng) / 2;
      const latDelta = Math.max(0.02, (maxLat - minLat) * 1.4);
      const lngDelta = Math.max(0.02, (maxLng - minLng) * 1.4);

      mapRef.current.animateToRegion({
        latitude: midLat,
        longitude: midLng,
        latitudeDelta: latDelta,
        longitudeDelta: lngDelta,
      }, 500);
    }
  }, [selectedRouteIndex, selectedRoute, isRouteLocked]);

  const handleRouteSelect = (index) => {
    if (isRouteLocked) {
      showCustomAlert(
        "Route Locked",
        "Route cannot be changed as you have confirmed bookings.\n\nTo change route, please cancel the ride and create a new one.",
        "warning"
      );
      return;
    }
    setSelectedRouteIndex(index);
  };

  const handleNext = () => {
    if (!selectedRoute) {
      showCustomAlert("No Route Selected", "Please select a route to continue.", "warning");
      return;
    }
    onNext();
  };

  // Loading state
  if (loadingRoute) {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>Select Route</Text>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={Colors.primary} />
          <Text style={styles.loadingText}>Finding best routes...</Text>
        </View>
      </View>
    );
  }

  // No routes found
  if (!routeOptions || routeOptions.length === 0) {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>Select Route</Text>
        <View style={styles.noRouteContainer}>
          <Ionicons name="map-outline" size={48} color={Colors.gray} />
          <Text style={styles.noRouteText}>No routes found.</Text>
          <Text style={styles.noRouteSubtext}>Please check your locations and try again.</Text>
        </View>
        <TouchableOpacity
          style={[styles.actionButton, { backgroundColor: Colors.primary, marginTop: 20 }]}
          onPress={() => {
            // Go back to step 1 to modify locations
            const goBackToStep1 = () => {
              // This will be handled by parent component
            };
            goBackToStep1();
          }}
          activeOpacity={0.8}
        >
          <Text style={styles.actionButtonText}>Go Back to Edit Locations</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Select Route</Text>
      
      {isRouteLocked && (
        <View style={styles.lockedBanner}>
          <Ionicons name="lock-closed" size={16} color="#92400E" />
          <Text style={styles.lockedBannerText}>🔒 Route is locked due to confirmed bookings</Text>
        </View>
      )}

      <View style={styles.mapWrap}>
        {selectedRoute?.geometry?.length > 0 ? (
          <MapView
            ref={mapRef}
            provider={PROVIDER_GOOGLE}
            style={styles.map}
            initialRegion={{
              latitude: selectedRoute.geometry[0].latitude,
              longitude: selectedRoute.geometry[0].longitude,
              latitudeDelta: 0.1,
              longitudeDelta: 0.1
            }}
          >
            <Polyline
              coordinates={selectedRoute.geometry}
              strokeWidth={5}
              strokeColor={Colors.primary}
            />
            <Marker coordinate={selectedRoute.geometry[0]}>
              <View style={[styles.markerDot, { backgroundColor: '#22C55E' }]} />
              <View style={styles.markerLabel}>
                <Text style={styles.markerLabelText}>Start</Text>
              </View>
            </Marker>
            <Marker coordinate={selectedRoute.geometry[selectedRoute.geometry.length - 1]}>
              <View style={[styles.markerDot, { backgroundColor: '#EF4444' }]} />
              <View style={styles.markerLabel}>
                <Text style={styles.markerLabelText}>End</Text>
              </View>
            </Marker>
          </MapView>
        ) : (
          <View style={styles.mapPlaceholder}>
            <Text style={styles.mapPlaceholderText}>Loading map...</Text>
          </View>
        )}
      </View>

      <View style={styles.drawer}>
        <Text style={styles.drawerTitle}>Route Options</Text>
        <Text style={styles.drawerSubtitle}>Select the best route for your journey</Text>

        {routeOptions.map((opt, index) => {
          const label = labels[index] || 'Route';
          const labelColor = LABEL_COLORS[label] || Colors.primary;
          const iconName = LABEL_ICONS[label] || 'map-outline';
          const isSelected = selectedRouteIndex === index;
          const durationHHMM = formatDurationHHMM(opt.duration);

          return (
            <TouchableOpacity
              key={index}
              onPress={() => handleRouteSelect(index)}
              style={[
                styles.routeCard,
                isSelected && styles.routeCardSelected,
                isRouteLocked && !isSelected && styles.routeCardDisabled
              ]}
              activeOpacity={0.85}
              disabled={isRouteLocked && !isSelected}
            >
              <View style={styles.routeCardLeft}>
                <View style={[styles.labelBadge, { backgroundColor: labelColor + '15' }]}>
                  <Ionicons name={iconName} size={14} color={labelColor} />
                  <Text style={[styles.labelBadgeText, { color: labelColor }]}>{label}</Text>
                </View>
                <Text style={styles.routeDistance}>{opt.distance} KM</Text>
                <Text style={styles.routeDuration}>{durationHHMM}</Text>
                {opt.price && (
                  <Text style={styles.routePrice}>₹{Math.round(opt.price / 4)}/seat est.</Text>
                )}
              </View>

              <View style={styles.routeCardRight}>
                {isSelected ? (
                  <View style={styles.selectedCircle}>
                    <Ionicons name="checkmark" size={16} color="#fff" />
                  </View>
                ) : (
                  <View style={styles.unselectedCircle} />
                )}
              </View>
            </TouchableOpacity>
          );
        })}
      </View>

      <TouchableOpacity
        style={[styles.actionButton, { backgroundColor: Colors.primary }]}
        onPress={handleNext}
        activeOpacity={0.8}
      >
        <Text style={styles.actionButtonText}>Continue</Text>
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
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 18,
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderRadius: 28,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.15,
    shadowRadius: 20,
    elevation: 10,
    borderWidth: 1,
    borderColor: 'rgba(229, 231, 235, 0.5)',
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 12,
    color: Colors.dark,
  },
  drawerSubtitle: {
    fontSize: 13,
    color: Colors.gray,
    marginBottom: 12,
  },
  mapWrap: {
    height: 320,
    marginBottom: 12,
    borderRadius: 16,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  map: {
    flex: 1,
  },
  mapPlaceholder: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F3F4F6',
  },
  mapPlaceholderText: {
    color: Colors.gray,
    fontSize: 14,
  },
  markerDot: {
    width: 14,
    height: 14,
    borderRadius: 7,
    borderWidth: 2,
    borderColor: '#fff',
  },
  markerLabel: {
    backgroundColor: 'rgba(0,0,0,0.7)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    marginTop: 2,
    alignSelf: 'center',
  },
  markerLabelText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: '700',
  },
  drawer: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 14,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
    marginBottom: 4,
  },
  drawerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.dark,
    marginBottom: 4,
  },
  routeCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 14,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: '#F3F4F6',
    marginBottom: 10,
    backgroundColor: '#FAFBFC',
  },
  routeCardSelected: {
    borderColor: Colors.primary,
    backgroundColor: '#EFF6FF',
  },
  routeCardDisabled: {
    opacity: 0.5,
    backgroundColor: '#F9FAFB',
  },
  routeCardLeft: {
    flex: 1,
  },
  labelBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 20,
    marginBottom: 8,
    gap: 6,
  },
  labelBadgeText: {
    fontSize: 12,
    fontWeight: '800',
  },
  routeDistance: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.dark,
    marginBottom: 2,
  },
  routeDuration: {
    fontSize: 13,
    color: Colors.gray,
    fontWeight: '600',
  },
  routePrice: {
    fontSize: 12,
    color: Colors.primary,
    fontWeight: '600',
    marginTop: 4,
  },
  routeCardRight: {
    marginLeft: 12,
  },
  selectedCircle: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  unselectedCircle: {
    width: 28,
    height: 28,
    borderRadius: 14,
    borderWidth: 2,
    borderColor: '#D1D5DB',
  },
  actionButton: {
    borderRadius: 16,
    overflow: 'hidden',
    marginTop: 14,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 8,
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionButtonText: {
    color: Colors.white,
    fontSize: 18,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  noRouteContainer: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  noRouteText: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.gray,
    marginTop: 12,
  },
  noRouteSubtext: {
    fontSize: 14,
    color: Colors.gray,
    marginTop: 4,
    textAlign: 'center',
  },
  lockedBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEF3C7',
    padding: 10,
    borderRadius: 10,
    marginBottom: 12,
    gap: 8,
  },
  lockedBannerText: {
    flex: 1,
    fontSize: 12,
    color: '#92400E',
    fontWeight: '600',
  },
  loadingContainer: {
    alignItems: 'center',
    paddingVertical: 60,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 14,
    color: Colors.gray,
  },
});