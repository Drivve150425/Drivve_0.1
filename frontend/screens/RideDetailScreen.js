// import React, { useMemo, useRef, useState } from 'react';
// import {
//   View,
//   Text,
//   StyleSheet,
//   TouchableOpacity,
//   ScrollView,
//   Alert,
//   ActivityIndicator,
//   Platform,
//   StatusBar,
//   Image,
//   Dimensions,
//   Animated,
// } from 'react-native';
// import MapView, { Marker, Polyline } from 'react-native-maps';
// import { Ionicons } from '@expo/vector-icons';
// import { Colors } from '../constants/Colors';
// import { useAuth } from '../context/AuthContext';
// import { API_BASE_URL } from '../config/config_ip';

// const { height } = Dimensions.get('window');
// const SAFE_TOP = Platform.OS === 'ios' ? 56 : 24;
// const COLLAPSED_HEIGHT = 128;
// const EXPANDED_HEIGHT = height * 0.72;

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

// function pointToRegionPoint(point) {
//   if (!point) return null;
//   if (point.latitude != null && point.longitude != null) {
//     return { latitude: Number(point.latitude), longitude: Number(point.longitude) };
//   }
//   if (point.lat != null && point.lng != null) {
//     return { latitude: Number(point.lat), longitude: Number(point.lng) };
//   }
//   return null;
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
//   return routeCoordinates
//     .map((item) => {
//       if (Array.isArray(item) && item.length === 2) {
//         return { longitude: Number(item[0]), latitude: Number(item[1]) };
//       }
//       return parseSuggestedPoint(item);
//     })
//     .filter(Boolean);
// }

// function extractPreferenceBadges(ride) {
//   const prefs = ride?.preferences || ride?.ridePreferences || ride?.matchingPreferences || {};
//   const badges = [];

//   Object.entries(prefs || {}).forEach(([key, value]) => {
//     if (value === true) {
//       badges.push(key.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase()));
//       return;
//     }

//     if (typeof value === 'string' && value.trim()) {
//       const val = value.trim();
//       if (key === 'smoking_policy' && val.toLowerCase().includes('no')) badges.push('No Smoking');
//       else if (key === 'same_gender_after_9pm' && ['true', 'yes'].includes(val.toLowerCase())) badges.push('Same Gender Night');
//       else if (key === 'verified_profiles_only' && ['true', 'yes'].includes(val.toLowerCase())) badges.push('Verified Only');
//       else badges.push(val);
//     }
//   });

//   return [...new Set(badges)].slice(0, 4);
// }

// export default function RideDetailScreen({ navigation, route }) {
//   const { user } = useAuth();
//   const { ride } = route.params || {};

//   const [seatsRequested, setSeatsRequested] = useState(1);
//   const [requestLoading, setRequestLoading] = useState(false);
//   const [drawerExpanded, setDrawerExpanded] = useState(true);
//   const animatedDrawer = useRef(new Animated.Value(1)).current;
//   const mapRef = useRef(null);

//   const profilePhotoUrl = buildImageUrl(ride?.profilePicture || ride?.profilepicture);
//   const avatarText = getDriverInitials(ride?.driverName || 'Driver');
//   const preferenceBadges = extractPreferenceBadges(ride);

//   const pickupPoint = useMemo(() => parseSuggestedPoint(ride?.suggestedPickup || ride?.from_coords), [ride]);
//   const dropPoint = useMemo(() => parseSuggestedPoint(ride?.suggestedDrop || ride?.to_coords), [ride]);
//   const routePath = useMemo(() => {
//     const fullRoute = parseRouteCoordinates(ride?.route_coordinates || ride?.routeCoordinates);
//     if (fullRoute.length >= 2) return fullRoute;
//     if (pickupPoint && dropPoint) return [pickupPoint, dropPoint];
//     return [];
//   }, [ride, pickupPoint, dropPoint]);

//   const vehicleName = [ride?.vehicle?.make, ride?.vehicle?.model].filter(Boolean).join(' ') || 'Vehicle details unavailable';
//   const totalPrice = Number(ride?.price || 0) * seatsRequested;

//   const mapHeight = animatedDrawer.interpolate({
//     inputRange: [0, 1],
//     outputRange: [height - SAFE_TOP - 90, height * 0.32],
//   });

//   const drawerHeight = animatedDrawer.interpolate({
//     inputRange: [0, 1],
//     outputRange: [COLLAPSED_HEIGHT, EXPANDED_HEIGHT],
//   });

//   const toggleDrawer = () => {
//     const next = !drawerExpanded;
//     setDrawerExpanded(next);
//     Animated.timing(animatedDrawer, {
//       toValue: next ? 1 : 0,
//       duration: 260,
//       useNativeDriver: false,
//     }).start();
//   };

//   const handleRequestJoin = async () => {
//     if (!user?.phone_number) {
//       Alert.alert('Login Required', 'Please log in to request a ride.');
//       return;
//     }

//     setRequestLoading(true);
//     try {
//       const response = await fetch(`${API_BASE_URL}/ride-bookings`, {
//         method: 'POST',
//         headers: { 'Content-Type': 'application/json' },
//         body: JSON.stringify({
//           ride_id: ride.id,
//           passenger_phone: user.phone_number,
//           seats_requested: seatsRequested,
//         }),
//       });

//       const raw = await response.text();
//       let data = {};
//       try {
//         data = raw ? JSON.parse(raw) : {};
//       } catch {
//         data.detail = raw;
//       }

//       if (!response.ok) throw new Error(data.detail || 'Failed to book ride');
//       Alert.alert('Success', data.message || 'Ride request sent successfully');
//       navigation.goBack();
//     } catch (error) {
//       Alert.alert('Error', error.message || 'Failed to send request');
//     } finally {
//       setRequestLoading(false);
//     }
//   };

//   const viewDriverProfile = () => {
//     if (ride?.driverUserId) {
//       navigation.navigate('ProfileDetails', { phoneNumber: ride.driverUserId });
//     } else {
//       Alert.alert('Profile', 'Driver profile not available');
//     }
//   };

//   const startChat = () => {
//     if (ride?.driverUserId) {
//       navigation.navigate('ChatScreen', {
//         receiverPhone: ride.driverUserId,
//         rideId: ride.id,
//       });
//     } else {
//       Alert.alert('Chat', 'Chat not available');
//     }
//   };

//   if (!ride) {
//     return (
//       <View style={styles.centerContainer}>
//         <Text style={styles.errorText}>No ride data available</Text>
//         <TouchableOpacity onPress={() => navigation.goBack()} style={styles.fallbackBtn}>
//           <Text style={styles.fallbackBtnText}>Go Back</Text>
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
//           style={styles.map}
//           initialRegion={{
//             latitude: pickupPoint?.latitude || dropPoint?.latitude || 28.6139,
//             longitude: pickupPoint?.longitude || dropPoint?.longitude || 77.2090,
//             latitudeDelta: 0.12,
//             longitudeDelta: 0.12,
//           }}
//           showsUserLocation
//           showsMyLocationButton
//         >
//           {pickupPoint ? (
//             <Marker coordinate={pickupPoint} title="Pickup">
//               <View style={styles.pickupMarker} />
//             </Marker>
//           ) : null}

//           {dropPoint ? (
//             <Marker coordinate={dropPoint} title="Drop">
//               <View style={styles.dropMarker} />
//             </Marker>
//           ) : null}

//           {routePath.length >= 2 ? (
//             <Polyline
//               coordinates={routePath}
//               strokeColor="#2457A6"
//               strokeWidth={5}
//               lineCap="round"
//               lineJoin="round"
//             />
//           ) : null}
//         </MapView>

//         <TouchableOpacity style={styles.mapBackButton} onPress={() => navigation.goBack()}>
//           <Ionicons name="arrow-back" size={24} color={Colors.dark} />
//         </TouchableOpacity>

//         <View style={styles.mapInfoPill}>
//           <Ionicons name="navigate-circle-outline" size={18} color="white" />
//           <Text style={styles.mapInfoText} numberOfLines={1}>
//             {ride.from || 'Pickup'} → {ride.to || 'Drop'}
//           </Text>
//         </View>
//       </Animated.View>

//       <Animated.View style={[styles.drawer, { height: drawerHeight }]}> 
//         <TouchableOpacity activeOpacity={0.9} style={styles.handleWrap} onPress={toggleDrawer}>
//           <View style={styles.handleBar} />
//         </TouchableOpacity>

//         {!drawerExpanded ? (
//           <View style={styles.collapsedSummary}>
//             <View style={styles.collapsedTopRow}>
//               <View>
//                 <Text style={styles.collapsedDriver}>{ride.driverName || 'Driver'}</Text>
//                 <Text style={styles.collapsedSub}>{ride.date} • {ride.time}</Text>
//               </View>
//               <View style={styles.collapsedPriceWrap}>
//                 <Text style={styles.collapsedPrice}>₹{ride.price}</Text>
//                 <Text style={styles.collapsedPerSeat}>per seat</Text>
//               </View>
//             </View>

//             <View style={styles.collapsedBottomRow}>
//               <View style={styles.compactBadge}>
//                 <Text style={styles.compactBadgeText}>{ride.matchPercentage || 0}% Match</Text>
//               </View>
//               <TouchableOpacity style={styles.expandBtn} onPress={toggleDrawer}>
//                 <Text style={styles.expandBtnText}>Show Details</Text>
//               </TouchableOpacity>
//             </View>
//           </View>
//         ) : (
//           <>
//             <ScrollView
//               style={styles.drawerScroll}
//               contentContainerStyle={styles.drawerContent}
//               showsVerticalScrollIndicator={false}
//             >
//               <View style={styles.driverCard}>
//                 <View style={styles.driverTopRow}>
//                   <View style={styles.driverLeftWrap}>
//                     <View style={styles.driverAvatar}>
//                       {profilePhotoUrl ? (
//                         <Image source={{ uri: profilePhotoUrl }} style={styles.avatarImg} />
//                       ) : (
//                         <Text style={styles.avatarText}>{avatarText}</Text>
//                       )}
//                     </View>

//                     <View style={styles.driverMeta}>
//                       <View style={styles.driverNameRow}>
//                         <Text style={styles.driverName}>{ride.driverName || 'Driver'}</Text>
//                         {ride.profileCompleted ? (
//                           <View style={styles.verifiedBadge}>
//                             <Ionicons name="checkmark-circle" size={12} color="#2457A6" />
//                             <Text style={styles.verifiedBadgeText}>Verified</Text>
//                           </View>
//                         ) : null}
//                       </View>

//                       <View style={styles.ratingRow}>
//                         <Ionicons name="star" size={13} color="#F59E0B" />
//                         <Text style={styles.ratingText}>{ride.rating ?? 4.5}</Text>
//                         <Text style={styles.tripCountText}>• 127 trips</Text>
//                       </View>
//                     </View>
//                   </View>

//                   <TouchableOpacity style={styles.chatButtonCircle} onPress={startChat}>
//                     <Ionicons name="chatbubble-outline" size={20} color="#2457A6" />
//                   </TouchableOpacity>
//                 </View>

//                 <Text style={styles.driverBio}>Friendly driver, love meeting new people!</Text>

//                 <TouchableOpacity style={styles.profileOutlineBtn} onPress={viewDriverProfile}>
//                   <Text style={styles.profileOutlineBtnText}>View Full Profile</Text>
//                 </TouchableOpacity>
//               </View>

//               <View style={styles.cardSection}>
//                 <Text style={styles.sectionTitle}>Trip Details</Text>

//                 <View style={styles.tripTimelineWrap}>
//                   <View style={styles.timelineRail}>
//                     <View style={[styles.timelineDot, { backgroundColor: '#2457A6' }]} />
//                     <View style={styles.timelineLine} />
//                     <View style={[styles.timelineDot, { backgroundColor: '#FF7A00' }]} />
//                   </View>

//                   <View style={styles.timelineContent}>
//                     <View style={styles.timelineItem}>
//                       <Text style={styles.timelineLabel}>Pickup</Text>
//                       <Text style={styles.timelinePlace}>{ride.pickupLabel || ride.from || 'Pickup point'}</Text>
//                       <View style={styles.timelineMetaRow}>
//                         <Ionicons name="time-outline" size={13} color={Colors.gray} />
//                         <Text style={styles.timelineMetaText}>{ride.date} at {ride.time}</Text>
//                       </View>
//                     </View>

//                     <View style={styles.timelineItem}>
//                       <Text style={styles.timelineLabel}>Dropoff</Text>
//                       <Text style={styles.timelinePlace}>{ride.dropLabel || ride.to || 'Drop point'}</Text>
//                       <Text style={styles.timelineMetaText}>Estimated: {ride.durationText || '--'}</Text>
//                     </View>
//                   </View>
//                 </View>
//               </View>

//               <View style={styles.cardSection}>
//                 <Text style={styles.sectionTitle}>Vehicle Details</Text>

//                 <View style={styles.vehicleHeaderRow}>
//                   <View style={styles.vehicleIconCircle}>
//                     <Ionicons name="car-sport-outline" size={18} color="#2457A6" />
//                   </View>

//                   <View style={styles.vehicleMeta}>
//                     <Text style={styles.vehicleTitle}>{vehicleName}</Text>
//                     <Text style={styles.vehicleSub}>{ride.vehicle?.color || 'Sedan'}</Text>
//                   </View>
//                 </View>

//                 <View style={styles.tagRow}>
//                   <View style={styles.featureTag}><Text style={styles.featureTagText}>AC</Text></View>
//                   <View style={styles.featureTag}><Text style={styles.featureTagText}>Music</Text></View>
//                   <View style={styles.featureTag}><Text style={styles.featureTagText}>Luggage Space</Text></View>
//                 </View>
//               </View>

//               <View style={styles.cardSection}>
//                 <Text style={styles.sectionTitle}>Ride Preferences</Text>
//                 <View style={styles.tagRow}>
//                   {preferenceBadges.length > 0 ? preferenceBadges.map((badge) => (
//                     <View key={badge} style={styles.preferenceTag}>
//                       <Text style={styles.preferenceTagText}>{badge}</Text>
//                     </View>
//                   )) : (
//                     <Text style={styles.emptyText}>No extra ride preferences added</Text>
//                   )}
//                 </View>
//               </View>

//               <View style={styles.cardSection}>
//                 <Text style={styles.sectionTitle}>Cost Breakdown</Text>
//                 <View style={styles.priceRow}><Text style={styles.priceLabel}>Base fare (per seat)</Text><Text style={styles.priceValue}>₹{ride.price || 0}</Text></View>
//                 <View style={styles.priceRow}><Text style={styles.priceLabel}>Platform fee</Text><Text style={styles.priceValue}>₹5</Text></View>
//                 <View style={styles.priceDivider} />
//                 <View style={styles.priceRow}><Text style={styles.totalLabel}>Total per seat</Text><Text style={styles.totalValue}>₹{ride.price || 0}</Text></View>

//                 <View style={styles.noticeBox}>
//                   <Text style={styles.noticeText}>
//                     <Text style={styles.noticeBold}>Cost-share contribution:</Text> This is not a commercial fare. You're sharing the travel costs with the driver.
//                   </Text>
//                 </View>
//               </View>

//               <View style={styles.cardSection}>
//                 <Text style={styles.sectionTitle}>Select Seats</Text>
//                 <View style={styles.seatSelectorRow}>
//                   <TouchableOpacity
//                     style={styles.seatActionBtn}
//                     onPress={() => setSeatsRequested(Math.max(1, seatsRequested - 1))}
//                     disabled={seatsRequested === 1}
//                   >
//                     <Ionicons name="remove" size={20} color={Colors.gray} />
//                   </TouchableOpacity>

//                   <View style={styles.seatCountWrap}>
//                     <Text style={styles.seatCountText}>{seatsRequested}</Text>
//                     <Text style={styles.seatAvailableText}>/ {ride.seatsAvailable} available</Text>
//                   </View>

//                   <TouchableOpacity
//                     style={styles.seatActionBtn}
//                     onPress={() => setSeatsRequested(Math.min(ride.seatsAvailable || 1, seatsRequested + 1))}
//                     disabled={seatsRequested === ride.seatsAvailable}
//                   >
//                     <Ionicons name="add" size={20} color="#2457A6" />
//                   </TouchableOpacity>
//                 </View>
//               </View>

//               <View style={styles.simpleInfoCard}>
//                 <View style={styles.simpleInfoLeft}>
//                   <Ionicons name="information-circle-outline" size={18} color="#2457A6" />
//                   <Text style={styles.simpleInfoText}>Cancellation Policy</Text>
//                 </View>
//                 <Ionicons name="add" size={18} color={Colors.gray} />
//               </View>

//               <View style={styles.safetyCard}>
//                 <View style={styles.simpleInfoLeft}>
//                   <Ionicons name="shield-checkmark-outline" size={18} color="#2457A6" />
//                   <View>
//                     <Text style={styles.safetyTitle}>Safety First</Text>
//                     <Text style={styles.safetySub}>Live GPS tracking & 24/7 support</Text>
//                   </View>
//                 </View>
//               </View>

//               <View style={{ height: 110 }} />
//             </ScrollView>

//             <View style={styles.bottomBar}>
//               <View>
//                 <Text style={styles.bottomCaption}>Total for {seatsRequested} seat(s)</Text>
//                 <Text style={styles.bottomTotal}>₹{totalPrice}</Text>
//               </View>

//               <TouchableOpacity
//                 style={[styles.bookNowBtn, requestLoading && styles.bookNowBtnDisabled]}
//                 onPress={handleRequestJoin}
//                 disabled={requestLoading}
//               >
//                 {requestLoading ? (
//                   <ActivityIndicator size="small" color="white" />
//                 ) : (
//                   <Text style={styles.bookNowText}>Book Now</Text>
//                 )}
//               </TouchableOpacity>
//             </View>
//           </>
//         )}
//       </Animated.View>
//     </View>
//   );
// }

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     backgroundColor: '#F4F5F7',
//   },
//   centerContainer: {
//     flex: 1,
//     justifyContent: 'center',
//     alignItems: 'center',
//     padding: 24,
//   },
//   errorText: {
//     fontSize: 18,
//     color: Colors.gray,
//     marginBottom: 16,
//     textAlign: 'center',
//   },
//   fallbackBtn: {
//     backgroundColor: Colors.primary,
//     paddingHorizontal: 20,
//     paddingVertical: 12,
//     borderRadius: 12,
//   },
//   fallbackBtnText: {
//     color: 'white',
//     fontWeight: '700',
//   },
//   mapContainer: {
//     width: '100%',
//   },
//   map: {
//     flex: 1,
//   },
//   mapBackButton: {
//     position: 'absolute',
//     top: Platform.OS === 'ios' ? 54 : 22,
//     left: 14,
//     width: 42,
//     height: 42,
//     borderRadius: 21,
//     backgroundColor: 'rgba(255,255,255,0.96)',
//     alignItems: 'center',
//     justifyContent: 'center',
//   },
//   mapInfoPill: {
//     position: 'absolute',
//     top: Platform.OS === 'ios' ? 58 : 26,
//     alignSelf: 'center',
//     flexDirection: 'row',
//     alignItems: 'center',
//     gap: 8,
//     backgroundColor: 'rgba(36,87,166,0.92)',
//     paddingHorizontal: 14,
//     paddingVertical: 10,
//     borderRadius: 22,
//     maxWidth: '72%',
//   },
//   mapInfoText: {
//     color: 'white',
//     fontWeight: '700',
//     fontSize: 13,
//   },
//   pickupMarker: {
//     width: 16,
//     height: 16,
//     borderRadius: 8,
//     backgroundColor: '#22C55E',
//     borderWidth: 3,
//     borderColor: 'white',
//   },
//   dropMarker: {
//     width: 16,
//     height: 16,
//     borderRadius: 8,
//     backgroundColor: '#FF7A00',
//     borderWidth: 3,
//     borderColor: 'white',
//   },
//   drawer: {
//     position: 'absolute',
//     bottom: 0,
//     left: 0,
//     right: 0,
//     backgroundColor: '#F4F5F7',
//     borderTopLeftRadius: 28,
//     borderTopRightRadius: 28,
//     overflow: 'hidden',
//   },
//   handleWrap: {
//     alignItems: 'center',
//     paddingTop: 10,
//     paddingBottom: 8,
//     backgroundColor: '#F4F5F7',
//   },
//   handleBar: {
//     width: 64,
//     height: 6,
//     borderRadius: 99,
//     backgroundColor: '#CDD2D8',
//   },
//   collapsedSummary: {
//     paddingHorizontal: 18,
//     paddingTop: 8,
//     paddingBottom: 20,
//   },
//   collapsedTopRow: {
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//     alignItems: 'flex-start',
//   },
//   collapsedDriver: {
//     fontSize: 18,
//     fontWeight: '800',
//     color: Colors.dark,
//   },
//   collapsedSub: {
//     marginTop: 4,
//     fontSize: 13,
//     color: Colors.gray,
//     fontWeight: '600',
//   },
//   collapsedPriceWrap: {
//     alignItems: 'flex-end',
//   },
//   collapsedPrice: {
//     fontSize: 20,
//     fontWeight: '900',
//     color: Colors.dark,
//   },
//   collapsedPerSeat: {
//     fontSize: 11,
//     color: Colors.gray,
//     fontWeight: '600',
//   },
//   collapsedBottomRow: {
//     marginTop: 16,
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//     alignItems: 'center',
//   },
//   compactBadge: {
//     backgroundColor: '#E8F1FF',
//     borderRadius: 999,
//     paddingHorizontal: 12,
//     paddingVertical: 8,
//   },
//   compactBadgeText: {
//     color: '#2457A6',
//     fontWeight: '800',
//     fontSize: 12,
//   },
//   expandBtn: {
//     backgroundColor: Colors.primary,
//     borderRadius: 14,
//     paddingHorizontal: 16,
//     paddingVertical: 10,
//   },
//   expandBtnText: {
//     color: 'white',
//     fontWeight: '700',
//     fontSize: 13,
//   },
//   drawerScroll: {
//     flex: 1,
//   },
//   drawerContent: {
//     paddingHorizontal: 16,
//     paddingBottom: 16,
//   },
//   driverCard: {
//     backgroundColor: 'white',
//     borderRadius: 20,
//     padding: 16,
//     marginBottom: 14,
//     shadowColor: '#000',
//     shadowOffset: { width: 0, height: 2 },
//     shadowOpacity: 0.05,
//     shadowRadius: 8,
//     elevation: 2,
//   },
//   driverTopRow: {
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//     alignItems: 'center',
//   },
//   driverLeftWrap: {
//     flexDirection: 'row',
//     flex: 1,
//     paddingRight: 10,
//   },
//   driverAvatar: {
//     width: 56,
//     height: 56,
//     borderRadius: 28,
//     backgroundColor: '#E5E7EB',
//     overflow: 'hidden',
//     alignItems: 'center',
//     justifyContent: 'center',
//     marginRight: 12,
//   },
//   avatarImg: {
//     width: 56,
//     height: 56,
//   },
//   avatarText: {
//     fontSize: 15,
//     fontWeight: '800',
//     color: Colors.gray,
//   },
//   driverMeta: {
//     flex: 1,
//   },
//   driverNameRow: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     flexWrap: 'wrap',
//     gap: 6,
//   },
//   driverName: {
//     fontSize: 17,
//     fontWeight: '800',
//     color: Colors.dark,
//   },
//   verifiedBadge: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     gap: 4,
//   },
//   verifiedBadgeText: {
//     fontSize: 11,
//     color: '#2457A6',
//     fontWeight: '700',
//   },
//   ratingRow: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     gap: 4,
//     marginTop: 6,
//   },
//   ratingText: {
//     fontSize: 13,
//     color: Colors.dark,
//     fontWeight: '700',
//   },
//   tripCountText: {
//     fontSize: 12,
//     color: Colors.gray,
//     fontWeight: '600',
//   },
//   chatButtonCircle: {
//     width: 42,
//     height: 42,
//     borderRadius: 21,
//     backgroundColor: '#EAF1FF',
//     alignItems: 'center',
//     justifyContent: 'center',
//   },
//   driverBio: {
//     marginTop: 12,
//     fontSize: 14,
//     lineHeight: 20,
//     color: Colors.gray,
//   },
//   profileOutlineBtn: {
//     marginTop: 14,
//     borderWidth: 1,
//     borderColor: '#2457A6',
//     borderRadius: 16,
//     paddingVertical: 12,
//     alignItems: 'center',
//   },
//   profileOutlineBtnText: {
//     color: '#2457A6',
//     fontWeight: '700',
//     fontSize: 14,
//   },
//   cardSection: {
//     backgroundColor: 'white',
//     borderRadius: 20,
//     padding: 16,
//     marginBottom: 14,
//     shadowColor: '#000',
//     shadowOffset: { width: 0, height: 2 },
//     shadowOpacity: 0.05,
//     shadowRadius: 8,
//     elevation: 2,
//   },
//   sectionTitle: {
//     fontSize: 16,
//     fontWeight: '800',
//     color: Colors.dark,
//     marginBottom: 14,
//   },
//   tripTimelineWrap: {
//     flexDirection: 'row',
//   },
//   timelineRail: {
//     width: 18,
//     alignItems: 'center',
//     marginTop: 4,
//   },
//   timelineDot: {
//     width: 10,
//     height: 10,
//     borderRadius: 5,
//   },
//   timelineLine: {
//     width: 2,
//     flex: 1,
//     backgroundColor: '#D8DCE3',
//     marginVertical: 6,
//   },
//   timelineContent: {
//     flex: 1,
//     paddingLeft: 8,
//   },
//   timelineItem: {
//     marginBottom: 14,
//   },
//   timelineLabel: {
//     fontSize: 12,
//     color: Colors.gray,
//     fontWeight: '700',
//   },
//   timelinePlace: {
//     fontSize: 15,
//     color: Colors.dark,
//     fontWeight: '700',
//     marginTop: 4,
//   },
//   timelineMetaRow: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     gap: 4,
//     marginTop: 6,
//   },
//   timelineMetaText: {
//     fontSize: 12,
//     color: Colors.gray,
//     fontWeight: '600',
//   },
//   vehicleHeaderRow: {
//     flexDirection: 'row',
//     alignItems: 'center',
//   },
//   vehicleIconCircle: {
//     width: 42,
//     height: 42,
//     borderRadius: 21,
//     backgroundColor: '#EAF1FF',
//     alignItems: 'center',
//     justifyContent: 'center',
//     marginRight: 12,
//   },
//   vehicleMeta: {
//     flex: 1,
//   },
//   vehicleTitle: {
//     fontSize: 15,
//     fontWeight: '800',
//     color: Colors.dark,
//   },
//   vehicleSub: {
//     marginTop: 3,
//     fontSize: 12,
//     color: Colors.gray,
//     fontWeight: '600',
//   },
//   tagRow: {
//     flexDirection: 'row',
//     flexWrap: 'wrap',
//     gap: 8,
//     marginTop: 14,
//   },
//   featureTag: {
//     paddingHorizontal: 12,
//     paddingVertical: 8,
//     borderRadius: 999,
//     backgroundColor: '#F4EFE8',
//   },
//   featureTagText: {
//     fontSize: 12,
//     color: Colors.dark,
//     fontWeight: '600',
//   },
//   preferenceTag: {
//     paddingHorizontal: 12,
//     paddingVertical: 8,
//     borderRadius: 999,
//     backgroundColor: '#FFF3E8',
//   },
//   preferenceTagText: {
//     fontSize: 12,
//     color: '#C65D00',
//     fontWeight: '700',
//   },
//   emptyText: {
//     fontSize: 13,
//     color: Colors.gray,
//     fontWeight: '600',
//   },
//   priceRow: {
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//     alignItems: 'center',
//     marginBottom: 10,
//   },
//   priceLabel: {
//     fontSize: 14,
//     color: Colors.gray,
//     fontWeight: '500',
//   },
//   priceValue: {
//     fontSize: 14,
//     color: Colors.dark,
//     fontWeight: '700',
//   },
//   priceDivider: {
//     height: 1,
//     backgroundColor: '#ECEEF2',
//     marginVertical: 8,
//   },
//   totalLabel: {
//     fontSize: 15,
//     color: Colors.dark,
//     fontWeight: '800',
//   },
//   totalValue: {
//     fontSize: 15,
//     color: '#2457A6',
//     fontWeight: '800',
//   },
//   noticeBox: {
//     marginTop: 12,
//     backgroundColor: '#FFF2E9',
//     borderRadius: 14,
//     padding: 12,
//   },
//   noticeText: {
//     fontSize: 12.5,
//     color: Colors.dark,
//     lineHeight: 18,
//   },
//   noticeBold: {
//     fontWeight: '800',
//   },
//   seatSelectorRow: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     justifyContent: 'space-between',
//     backgroundColor: '#FAFAFB',
//     borderRadius: 18,
//     padding: 14,
//   },
//   seatActionBtn: {
//     width: 38,
//     height: 38,
//     borderRadius: 12,
//     borderWidth: 1,
//     borderColor: '#D6DDE7',
//     alignItems: 'center',
//     justifyContent: 'center',
//     backgroundColor: 'white',
//   },
//   seatCountWrap: {
//     flexDirection: 'row',
//     alignItems: 'baseline',
//   },
//   seatCountText: {
//     fontSize: 28,
//     fontWeight: '900',
//     color: Colors.dark,
//   },
//   seatAvailableText: {
//     fontSize: 13,
//     color: Colors.gray,
//     marginLeft: 6,
//     fontWeight: '600',
//   },
//   simpleInfoCard: {
//     backgroundColor: 'white',
//     borderRadius: 18,
//     padding: 16,
//     marginBottom: 14,
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//     alignItems: 'center',
//   },
//   simpleInfoLeft: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     gap: 8,
//   },
//   simpleInfoText: {
//     fontSize: 14,
//     color: Colors.dark,
//     fontWeight: '700',
//   },
//   safetyCard: {
//     backgroundColor: '#FFF3E7',
//     borderRadius: 18,
//     padding: 16,
//     marginBottom: 14,
//   },
//   safetyTitle: {
//     fontSize: 14,
//     color: '#2457A6',
//     fontWeight: '800',
//   },
//   safetySub: {
//     marginTop: 2,
//     fontSize: 12,
//     color: '#2457A6',
//     opacity: 0.9,
//     fontWeight: '600',
//   },
//   bottomBar: {
//     position: 'absolute',
//     left: 0,
//     right: 0,
//     bottom: 0,
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//     alignItems: 'center',
//     paddingHorizontal: 16,
//     paddingTop: 12,
//     paddingBottom: Platform.OS === 'ios' ? 28 : 16,
//     backgroundColor: 'white',
//     borderTopWidth: 1,
//     borderTopColor: '#ECEEF2',
//   },
//   bottomCaption: {
//     fontSize: 12,
//     color: Colors.gray,
//     fontWeight: '500',
//   },
//   bottomTotal: {
//     fontSize: 26,
//     color: Colors.dark,
//     fontWeight: '900',
//     marginTop: 2,
//   },
//   bookNowBtn: {
//     backgroundColor: '#FF7A00',
//     paddingHorizontal: 24,
//     paddingVertical: 14,
//     borderRadius: 22,
//     minWidth: 128,
//     alignItems: 'center',
//     justifyContent: 'center',
//   },
//   bookNowBtnDisabled: {
//     opacity: 0.7,
//   },
//   bookNowText: {
//     color: 'white',
//     fontSize: 16,
//     fontWeight: '800',
//   },
// });
import React, { useMemo, useRef, useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
  ActivityIndicator,
  Platform,
  StatusBar,
  Image,
  Dimensions,
  Animated,
} from 'react-native';
import { WebView } from 'react-native-webview';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../constants/Colors';
import { useAuth } from '../context/AuthContext';
import { API_BASE_URL } from '../config/config_ip';

const { height } = Dimensions.get('window');
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
    return {
      longitude: Number(point[0]),
      latitude: Number(point[1]),
    };
  }

  if (point.lng != null && point.lat != null) {
    return {
      longitude: Number(point.lng),
      latitude: Number(point.lat),
    };
  }

  if (point.longitude != null && point.latitude != null) {
    return {
      longitude: Number(point.longitude),
      latitude: Number(point.latitude),
    };
  }

  return null;
}

function parseRouteCoordinates(routeCoordinates) {
  if (!Array.isArray(routeCoordinates)) return [];

  return routeCoordinates
    .map((item) => {
      if (Array.isArray(item) && item.length === 2) {
        return {
          longitude: Number(item[0]),
          latitude: Number(item[1]),
        };
      }
      return parseSuggestedPoint(item);
    })
    .filter(Boolean);
}

function extractPreferenceBadges(ride) {
  const prefs =
    ride?.preferences ||
    ride?.ridePreferences ||
    ride?.matchingPreferences ||
    {};

  const badges = [];

  Object.entries(prefs || {}).forEach(([key, value]) => {
    if (value === true) {
      badges.push(
        key.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())
      );
      return;
    }

    if (typeof value === 'string' && value.trim()) {
      const val = value.trim();

      if (key === 'smoking_policy' && val.toLowerCase().includes('no')) {
        badges.push('No Smoking');
      } else if (
        key === 'same_gender_after_9pm' &&
        ['true', 'yes'].includes(val.toLowerCase())
      ) {
        badges.push('Same Gender Night');
      } else if (
        key === 'verified_profiles_only' &&
        ['true', 'yes'].includes(val.toLowerCase())
      ) {
        badges.push('Verified Only');
      } else {
        badges.push(val);
      }
    }
  });

  return [...new Set(badges)].slice(0, 4);
}

function createMapHtml({ pickupPoint, dropPoint, routePath }) {
  const centerLat = pickupPoint?.latitude || dropPoint?.latitude || 28.6139;
  const centerLng = pickupPoint?.longitude || dropPoint?.longitude || 77.2090;

  const leafletRoute = routePath.map((p) => [p.latitude, p.longitude]);

  return `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8" />
        <meta
          name="viewport"
          content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no"
        />
        <link
          rel="stylesheet"
          href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css"
        />
        <style>
          html, body, #map {
            margin: 0;
            padding: 0;
            width: 100%;
            height: 100%;
            background: #e8f0ff;
            overflow: hidden;
          }

          .leaflet-container {
            width: 100%;
            height: 100%;
            background: #e8f0ff;
          }

          .pickup-marker {
            width: 18px;
            height: 18px;
            background: #22C55E;
            border: 3px solid white;
            border-radius: 999px;
            box-shadow: 0 2px 8px rgba(0,0,0,0.18);
          }

          .drop-marker {
            width: 18px;
            height: 18px;
            background: #FF7A00;
            border: 3px solid white;
            border-radius: 999px;
            box-shadow: 0 2px 8px rgba(0,0,0,0.18);
          }
        </style>
      </head>
      <body>
        <div id="map"></div>

        <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
        <script>
          const map = L.map('map', {
            zoomControl: false,
            attributionControl: false
          }).setView([${centerLat}, ${centerLng}], 12);

          L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            maxZoom: 19
          }).addTo(map);

          const pickupPoint = ${JSON.stringify(
            pickupPoint ? [pickupPoint.latitude, pickupPoint.longitude] : null
          )};
          const dropPoint = ${JSON.stringify(
            dropPoint ? [dropPoint.latitude, dropPoint.longitude] : null
          )};
          const routePath = ${JSON.stringify(leafletRoute)};

          const bounds = [];

          if (pickupPoint) {
            const pickupIcon = L.divIcon({
              className: '',
              html: '<div class="pickup-marker"></div>',
              iconSize: [18, 18],
              iconAnchor: [9, 9]
            });
            L.marker(pickupPoint, { icon: pickupIcon }).addTo(map);
            bounds.push(pickupPoint);
          }

          if (dropPoint) {
            const dropIcon = L.divIcon({
              className: '',
              html: '<div class="drop-marker"></div>',
              iconSize: [18, 18],
              iconAnchor: [9, 9]
            });
            L.marker(dropPoint, { icon: dropIcon }).addTo(map);
            bounds.push(dropPoint);
          }

          if (routePath && routePath.length >= 2) {
            const mainPolyline = L.polyline(routePath, {
              color: '#2457A6',
              weight: 5,
              opacity: 0.95,
              lineJoin: 'round'
            }).addTo(map);

            map.fitBounds(mainPolyline.getBounds(), { padding: [40, 40] });
          } else if (bounds.length === 2) {
            map.fitBounds(bounds, { padding: [40, 40] });
          } else if (bounds.length === 1) {
            map.setView(bounds[0], 14);
          }

          setTimeout(() => {
            map.invalidateSize();

            if (routePath && routePath.length >= 2) {
              const tempPolyline = L.polyline(routePath);
              map.fitBounds(tempPolyline.getBounds(), { padding: [40, 40] });
            } else if (bounds.length === 2) {
              map.fitBounds(bounds, { padding: [40, 40] });
            } else if (bounds.length === 1) {
              map.setView(bounds[0], 14);
            }
          }, 300);
        </script>
      </body>
    </html>
  `;
}

export default function RideDetailScreen({ navigation, route }) {
  const { user, isAuthenticated } = useAuth();
  const { ride } = route.params || {};

  useEffect(() => {
    if (!isAuthenticated) {
      Alert.alert(
        'Login Required',
        'Please login to book rides or chat with drivers.',
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Login', onPress: () => navigation.navigate('Login') },
        ]
      );
      navigation.goBack();
    }
  }, [isAuthenticated, navigation]);

  const [seatsRequested, setSeatsRequested] = useState(1);
  const [requestLoading, setRequestLoading] = useState(false);
  const [drawerExpanded, setDrawerExpanded] = useState(true);
  const animatedDrawer = useRef(new Animated.Value(1)).current;

  const profilePhotoUrl = buildImageUrl(
    ride?.profilePicture || ride?.profilepicture
  );
  const avatarText = getDriverInitials(ride?.driverName || 'Driver');
  const preferenceBadges = extractPreferenceBadges(ride);

  const pickupPoint = useMemo(
    () => parseSuggestedPoint(ride?.suggestedPickup || ride?.from_coords),
    [ride]
  );

  const dropPoint = useMemo(
    () => parseSuggestedPoint(ride?.suggestedDrop || ride?.to_coords),
    [ride]
  );

  const routePath = useMemo(() => {
    const fullRoute = parseRouteCoordinates(
      ride?.route_coordinates || ride?.routeCoordinates
    );

    if (fullRoute.length >= 2) return fullRoute;
    if (pickupPoint && dropPoint) return [pickupPoint, dropPoint];
    return [];
  }, [ride, pickupPoint, dropPoint]);

  const mapHtml = useMemo(
    () => createMapHtml({ pickupPoint, dropPoint, routePath }),
    [pickupPoint, dropPoint, routePath]
  );

  const vehicleName =
    [ride?.vehicle?.make, ride?.vehicle?.model].filter(Boolean).join(' ') ||
    'Vehicle details unavailable';

  const totalPrice = Number(ride?.price || 0) * seatsRequested;

  const mapHeight = animatedDrawer.interpolate({
    inputRange: [0, 1],
    outputRange: [height - SAFE_TOP - COLLAPSED_HEIGHT, height * 0.32],
  });

  const drawerHeight = animatedDrawer.interpolate({
    inputRange: [0, 1],
    outputRange: [COLLAPSED_HEIGHT, EXPANDED_HEIGHT],
  });

  const toggleDrawer = () => {
    const nextExpanded = !drawerExpanded;
    setDrawerExpanded(nextExpanded);

    Animated.timing(animatedDrawer, {
      toValue: nextExpanded ? 1 : 0,
      duration: 260,
      useNativeDriver: false,
    }).start();
  };

  const handleRequestJoin = async () => {
    if (!user?.phone_number) {
      Alert.alert('Login Required', 'Please log in to request a ride.');
      return;
    }

    setRequestLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/ride-bookings`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ride_id: ride.id,
          passenger_phone: user.phone_number,
          seats_requested: seatsRequested,
        }),
      });

      const raw = await response.text();
      let data = {};

      try {
        data = raw ? JSON.parse(raw) : {};
      } catch {
        data.detail = raw;
      }

      if (!response.ok) {
        throw new Error(data.detail || 'Failed to book ride');
      }

      Alert.alert('Success', data.message || 'Ride request sent successfully');
      navigation.goBack();
    } catch (error) {
      Alert.alert('Error', error.message || 'Failed to send request');
    } finally {
      setRequestLoading(false);
    }
  };

  const viewDriverProfile = () => {
    if (ride?.driverUserId) {
      navigation.navigate('ProfileDetails', {
        phoneNumber: ride.driverUserId,
      });
    } else {
      Alert.alert('Profile', 'Driver profile not available');
    }
  };

  const startChat = () => {
    if (ride?.driverUserId) {
      navigation.navigate('ChatScreen', {
        receiverPhone: ride.driverUserId,
        rideId: ride.id,
      });
    } else {
      Alert.alert('Chat', 'Chat not available');
    }
  };

  if (!ride) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.errorText}>No ride data available</Text>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.fallbackBtn}
        >
          <Text style={styles.fallbackBtnText}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />

      <Animated.View style={[styles.mapContainer, { height: mapHeight }]}>
        <WebView
          originWhitelist={['*']}
          source={{ html: mapHtml }}
          style={styles.map}
          javaScriptEnabled={true}
          domStorageEnabled={true}
          startInLoadingState={true}
          showsHorizontalScrollIndicator={false}
          showsVerticalScrollIndicator={false}
          scrollEnabled={false}
          overScrollMode="never"
          androidLayerType="hardware"
        />

        <TouchableOpacity
          style={styles.mapBackButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="chevron-back" size={26} color={Colors.secondary} />
        </TouchableOpacity>

        {/* <View style={styles.mapInfoPill}>
          <Ionicons name="navigate-circle-outline" size={18} color="white" />
          <Text style={styles.mapInfoText} numberOfLines={1}>
            {ride.from || 'Pickup'} → {ride.to || 'Drop'}
          </Text>
        </View> */}
      </Animated.View>

      <Animated.View style={[styles.drawer, { height: drawerHeight }]}>
        <TouchableOpacity
          activeOpacity={0.9}
          style={styles.handleWrap}
          onPress={toggleDrawer}
        >
          <View style={styles.handleBar} />
        </TouchableOpacity>

        {!drawerExpanded ? (
          <View style={styles.collapsedSummary}>
            <View style={styles.collapsedTopRow}>
              <View style={{ flex: 1 }}>
                <Text style={styles.collapsedDriver} numberOfLines={1}>
                  {ride.driverName || 'Driver'}
                </Text>
                <Text style={styles.collapsedSub} numberOfLines={1}>
                  {ride.from || 'Pickup'} → {ride.to || 'Drop'}
                </Text>
              </View>

              <View style={styles.collapsedPriceWrap}>
                <Text style={styles.collapsedPrice}>₹{ride.price}</Text>
                <Text style={styles.collapsedPerSeat}>per seat</Text>
              </View>
            </View>
          </View>
        ) : (
          <>
            <ScrollView
              style={styles.drawerScroll}
              contentContainerStyle={styles.drawerContent}
              showsVerticalScrollIndicator={false}
            >
              <View style={styles.driverCard}>
                <View style={styles.driverTopRow}>
                  <View style={styles.driverLeftWrap}>
                    <View style={styles.driverAvatar}>
                      {profilePhotoUrl ? (
                        <Image source={{ uri: profilePhotoUrl }} style={styles.avatarImg} />
                      ) : (
                        <Text style={styles.avatarText}>{avatarText}</Text>
                      )}
                    </View>

                    <View style={styles.driverMeta}>
                      <View style={styles.driverNameRow}>
                        <Text style={styles.driverName}>{ride.driverName || 'Driver'}</Text>
                        {ride.profileCompleted ? (
                          <View style={styles.verifiedBadge}>
                            <Ionicons
                              name="checkmark-circle"
                              size={12}
                              color="#2457A6"
                            />
                            <Text style={styles.verifiedBadgeText}>Verified</Text>
                          </View>
                        ) : null}
                      </View>

                      <View style={styles.ratingRow}>
                        <Ionicons name="star" size={13} color="#F59E0B" />
                        <Text style={styles.ratingText}>{ride.rating ?? 4.5}</Text>
                        <Text style={styles.tripCountText}></Text>
                      </View>
                    </View>
                  </View>

                  <TouchableOpacity
                    style={styles.chatButtonCircle}
                    onPress={startChat}
                  >
                    <Ionicons
                      name="chatbubble-outline"
                      size={20}
                      color="#2457A6"
                    />
                  </TouchableOpacity>
                </View>

                <Text style={styles.driverBio}>
                  Friendly driver, love meeting new people!
                </Text>

                <TouchableOpacity
                  style={styles.profileOutlineBtn}
                  onPress={viewDriverProfile}
                >
                  <Text style={styles.profileOutlineBtnText}>
                    View Full Profile
                  </Text>
                </TouchableOpacity>
              </View>

              <View style={styles.cardSection}>
                <Text style={styles.sectionTitle}>Trip Details</Text>

                <View style={styles.tripTimelineWrap}>
                  <View style={styles.timelineRail}>
                    <View
                      style={[styles.timelineDot, { backgroundColor: '#2457A6' }]}
                    />
                    <View style={styles.timelineLine} />
                    <View
                      style={[styles.timelineDot, { backgroundColor: '#FF7A00' }]}
                    />
                  </View>

                  <View style={styles.timelineContent}>
                    <View style={styles.timelineItem}>
                      <Text style={styles.timelineLabel}>Pickup</Text>
                      <Text style={styles.timelinePlace}>
                        {ride.pickupLabel || ride.from || 'Pickup point'}
                      </Text>
                      <View style={styles.timelineMetaRow}>
                        <Ionicons
                          name="time-outline"
                          size={13}
                          color={Colors.gray}
                        />
                        <Text style={styles.timelineMetaText}>
                          {ride.date} at {ride.time}
                        </Text>
                      </View>
                    </View>

                    <View style={styles.timelineItem}>
                      <Text style={styles.timelineLabel}>Dropoff</Text>
                      <Text style={styles.timelinePlace}>
                        {ride.dropLabel || ride.to || 'Drop point'}
                      </Text>
                      <Text style={styles.timelineMetaText}>
                        Estimated: {ride.durationText || '--'}
                      </Text>
                    </View>
                  </View>
                </View>
              </View>

              <View style={styles.cardSection}>
                <Text style={styles.sectionTitle}>Vehicle Details</Text>

                <View style={styles.vehicleHeaderRow}>
                  <View style={styles.vehicleIconCircle}>
                    <Ionicons
                      name="car-sport-outline"
                      size={18}
                      color="#2457A6"
                    />
                  </View>

                  <View style={styles.vehicleMeta}>
                    <Text style={styles.vehicleTitle}>{vehicleName}</Text>
                    <Text style={styles.vehicleSub}>
                      {ride.vehicle?.color || 'Sedan'}
                    </Text>
                  </View>
                </View>

                <View style={styles.tagRow}>
                  <View style={styles.featureTag}>
                    <Text style={styles.featureTagText}>AC</Text>
                  </View>
                  <View style={styles.featureTag}>
                    <Text style={styles.featureTagText}>Music</Text>
                  </View>
                  <View style={styles.featureTag}>
                    <Text style={styles.featureTagText}>Luggage Space</Text>
                  </View>
                </View>
              </View>

              <View style={styles.cardSection}>
                <Text style={styles.sectionTitle}>Ride Preferences</Text>
                <View style={styles.tagRow}>
                  {preferenceBadges.length > 0 ? (
                    preferenceBadges.map((badge) => (
                      <View key={badge} style={styles.preferenceTag}>
                        <Text style={styles.preferenceTagText}>{badge}</Text>
                      </View>
                    ))
                  ) : (
                    <Text style={styles.emptyText}>
                      No extra ride preferences added
                    </Text>
                  )}
                </View>
              </View>

              <View style={styles.cardSection}>
                <Text style={styles.sectionTitle}>Cost Breakdown</Text>

                <View style={styles.priceRow}>
                  <Text style={styles.priceLabel}>Base fare (per seat)</Text>
                  <Text style={styles.priceValue}>₹{ride.price || 0}</Text>
                </View>

                <View style={styles.priceRow}>
                  <Text style={styles.priceLabel}>Platform fee</Text>
                  <Text style={styles.priceValue}>₹0</Text>
                </View>

                <View style={styles.priceDivider} />

                <View style={styles.priceRow}>
                  <Text style={styles.totalLabel}>Total per seat</Text>
                  <Text style={styles.totalValue}>₹{ride.price || 0}</Text>
                </View>

                <View style={styles.noticeBox}>
                  <Text style={styles.noticeText}>
                    <Text style={styles.noticeBold}>
                      Cost-share contribution:
                    </Text>{' '}
                    This is not a commercial fare. You're sharing the travel costs
                    with the driver.
                  </Text>
                </View>
              </View>

              <View style={styles.cardSection}>
                <Text style={styles.sectionTitle}>Select Seats</Text>
                <View style={styles.seatSelectorRow}>
                  <TouchableOpacity
                    style={styles.seatActionBtn}
                    onPress={() =>
                      setSeatsRequested(Math.max(1, seatsRequested - 1))
                    }
                    disabled={seatsRequested === 1}
                  >
                    <Ionicons name="remove" size={20} color={Colors.gray} />
                  </TouchableOpacity>

                  <View style={styles.seatCountWrap}>
                    <Text style={styles.seatCountText}>{seatsRequested}</Text>
                    <Text style={styles.seatAvailableText}>
                      / {ride.seatsAvailable} available
                    </Text>
                  </View>

                  <TouchableOpacity
                    style={styles.seatActionBtn}
                    onPress={() =>
                      setSeatsRequested(
                        Math.min(ride.seatsAvailable || 1, seatsRequested + 1)
                      )
                    }
                    disabled={seatsRequested === ride.seatsAvailable}
                  >
                    <Ionicons name="add" size={20} color="#2457A6" />
                  </TouchableOpacity>
                </View>
              </View>
              {/*
              <View style={styles.simpleInfoCard}>
                <View style={styles.simpleInfoLeft}>
                  <Ionicons
                    name="information-circle-outline"
                    size={18}
                    color="#2457A6"
                  />
                  <Text style={styles.simpleInfoText}>Cancellation Policy</Text>
                </View>
                <Ionicons name="add" size={18} color={Colors.gray} />
              </View>
                */}
              <View style={styles.safetyCard}>
                <View style={styles.simpleInfoLeft}>
                  <Ionicons
                    name="shield-checkmark-outline"
                    size={18}
                    color="#2457A6"
                  />
                  <View>
                    <Text style={styles.safetyTitle}>Safety First</Text>
                    <Text style={styles.safetySub}>
                      Live GPS tracking & 24/7 support
                    </Text>
                  </View>
                </View>
              </View>

              <View style={{ height: 110 }} />
            </ScrollView>

            <View style={styles.bottomBar}>
              <View>
                <Text style={styles.bottomCaption}>
                  Total for {seatsRequested} seat(s)
                </Text>
                <Text style={styles.bottomTotal}>₹{totalPrice}</Text>
              </View>

              <TouchableOpacity
                style={[
                  styles.bookNowBtn,
                  requestLoading && styles.bookNowBtnDisabled,
                ]}
                onPress={handleRequestJoin}
                disabled={requestLoading}
              >
                {requestLoading ? (
                  <ActivityIndicator size="small" color="white" />
                ) : (
                  <Text style={styles.bookNowText}>Book Now</Text>
                )}
              </TouchableOpacity>
            </View>
          </>
        )}
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F4F5F7',
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  errorText: {
    fontSize: 18,
    color: Colors.gray,
    marginBottom: 16,
    textAlign: 'center',
  },
  fallbackBtn: {
    backgroundColor: Colors.primary,
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 12,
  },
  fallbackBtnText: {
    color: 'white',
    fontWeight: '700',
  },
  mapContainer: {
    width: '100%',
    overflow: 'hidden',
    backgroundColor: '#E8EEF7',
  },
  map: {
    flex: 1,
    backgroundColor: '#E8EEF7',
  },
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
  },
  mapInfoPill: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 58 : 26,
    alignSelf: 'center',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: 'rgba(36,87,166,0.92)',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 22,
    maxWidth: '72%',
  },
  mapInfoText: {
    color: 'white',
    fontWeight: '700',
    fontSize: 13,
  },
  drawer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#F4F5F7',
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    overflow: 'hidden',
  },
  handleWrap: {
    alignItems: 'center',
    paddingTop: 10,
    paddingBottom: 8,
    backgroundColor: '#F4F5F7',
  },
  handleBar: {
    width: 64,
    height: 6,
    borderRadius: 99,
    backgroundColor: '#CDD2D8',
  },
  collapsedSummary: {
    paddingHorizontal: 16,
    paddingTop: 4,
    paddingBottom: 12,
  },
  collapsedTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 12,
  },
  collapsedDriver: {
    fontSize: 16,
    fontWeight: '800',
    color: Colors.dark,
  },
  collapsedSub: {
    marginTop: 2,
    fontSize: 12,
    color: Colors.gray,
    fontWeight: '600',
  },
  collapsedPriceWrap: {
    alignItems: 'flex-end',
  },
  collapsedPrice: {
    fontSize: 18,
    fontWeight: '900',
    color: Colors.dark,
  },
  collapsedPerSeat: {
    fontSize: 10,
    color: Colors.gray,
    fontWeight: '600',
  },
  drawerScroll: {
    flex: 1,
  },
  drawerContent: {
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  driverCard: {
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 16,
    marginBottom: 14,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  driverTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  driverLeftWrap: {
    flexDirection: 'row',
    flex: 1,
    paddingRight: 10,
  },
  driverAvatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#E5E7EB',
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  avatarImg: {
    width: 56,
    height: 56,
  },
  avatarText: {
    fontSize: 15,
    fontWeight: '800',
    color: Colors.gray,
  },
  driverMeta: {
    flex: 1,
  },
  driverNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 6,
  },
  driverName: {
    fontSize: 17,
    fontWeight: '800',
    color: Colors.dark,
  },
  verifiedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  verifiedBadgeText: {
    fontSize: 11,
    color: '#2457A6',
    fontWeight: '700',
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 6,
  },
  ratingText: {
    fontSize: 13,
    color: Colors.dark,
    fontWeight: '700',
  },
  tripCountText: {
    fontSize: 12,
    color: Colors.gray,
    fontWeight: '600',
  },
  chatButtonCircle: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: '#EAF1FF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  driverBio: {
    marginTop: 12,
    fontSize: 14,
    lineHeight: 20,
    color: Colors.gray,
  },
  profileOutlineBtn: {
    marginTop: 14,
    borderWidth: 1,
    borderColor: '#2457A6',
    borderRadius: 16,
    paddingVertical: 12,
    alignItems: 'center',
  },
  profileOutlineBtnText: {
    color: '#2457A6',
    fontWeight: '700',
    fontSize: 14,
  },
  cardSection: {
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 16,
    marginBottom: 14,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: Colors.dark,
    marginBottom: 14,
  },
  tripTimelineWrap: {
    flexDirection: 'row',
  },
  timelineRail: {
    width: 18,
    alignItems: 'center',
    marginTop: 4,
  },
  timelineDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  timelineLine: {
    width: 2,
    flex: 1,
    backgroundColor: '#D8DCE3',
    marginVertical: 6,
  },
  timelineContent: {
    flex: 1,
    paddingLeft: 8,
  },
  timelineItem: {
    marginBottom: 14,
  },
  timelineLabel: {
    fontSize: 12,
    color: Colors.gray,
    fontWeight: '700',
  },
  timelinePlace: {
    fontSize: 15,
    color: Colors.dark,
    fontWeight: '700',
    marginTop: 4,
  },
  timelineMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 6,
  },
  timelineMetaText: {
    fontSize: 12,
    color: Colors.gray,
    fontWeight: '600',
  },
  vehicleHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  vehicleIconCircle: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: '#EAF1FF',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  vehicleMeta: {
    flex: 1,
  },
  vehicleTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: Colors.dark,
  },
  vehicleSub: {
    marginTop: 3,
    fontSize: 12,
    color: Colors.gray,
    fontWeight: '600',
  },
  tagRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 14,
  },
  featureTag: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 999,
    backgroundColor: '#F4EFE8',
  },
  featureTagText: {
    fontSize: 12,
    color: Colors.dark,
    fontWeight: '600',
  },
  preferenceTag: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 999,
    backgroundColor: '#FFF3E8',
  },
  preferenceTagText: {
    fontSize: 12,
    color: '#C65D00',
    fontWeight: '700',
  },
  emptyText: {
    fontSize: 13,
    color: Colors.gray,
    fontWeight: '600',
  },
  priceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  priceLabel: {
    fontSize: 14,
    color: Colors.gray,
    fontWeight: '500',
  },
  priceValue: {
    fontSize: 14,
    color: Colors.dark,
    fontWeight: '700',
  },
  priceDivider: {
    height: 1,
    backgroundColor: '#ECEEF2',
    marginVertical: 8,
  },
  totalLabel: {
    fontSize: 15,
    color: Colors.dark,
    fontWeight: '800',
  },
  totalValue: {
    fontSize: 15,
    color: '#2457A6',
    fontWeight: '800',
  },
  noticeBox: {
    marginTop: 12,
    backgroundColor: '#FFF2E9',
    borderRadius: 14,
    padding: 12,
  },
  noticeText: {
    fontSize: 12.5,
    color: Colors.dark,
    lineHeight: 18,
  },
  noticeBold: {
    fontWeight: '800',
  },
  seatSelectorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FAFAFB',
    borderRadius: 18,
    padding: 14,
  },
  seatActionBtn: {
    width: 38,
    height: 38,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#D6DDE7',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'white',
  },
  seatCountWrap: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  seatCountText: {
    fontSize: 28,
    fontWeight: '900',
    color: Colors.dark,
  },
  seatAvailableText: {
    fontSize: 13,
    color: Colors.gray,
    marginLeft: 6,
    fontWeight: '600',
  },
  simpleInfoCard: {
    backgroundColor: 'white',
    borderRadius: 18,
    padding: 16,
    marginBottom: 14,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  simpleInfoLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  simpleInfoText: {
    fontSize: 14,
    color: Colors.dark,
    fontWeight: '700',
  },
  safetyCard: {
    backgroundColor: '#FFF3E7',
    borderRadius: 18,
    padding: 16,
    marginBottom: 14,
  },
  safetyTitle: {
    fontSize: 14,
    color: '#2457A6',
    fontWeight: '800',
  },
  safetySub: {
    marginTop: 2,
    fontSize: 12,
    color: '#2457A6',
    opacity: 0.9,
    fontWeight: '600',
  },
  bottomBar: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: Platform.OS === 'ios' ? 28 : 16,
    backgroundColor: 'white',
    borderTopWidth: 1,
    borderTopColor: '#ECEEF2',
  },
  bottomCaption: {
    fontSize: 12,
    color: Colors.gray,
    fontWeight: '500',
  },
  bottomTotal: {
    fontSize: 26,
    color: Colors.dark,
    fontWeight: '900',
    marginTop: 2,
  },
  bookNowBtn: {
    backgroundColor: '#FF7A00',
    paddingHorizontal: 24,
    paddingVertical: 14,
    borderRadius: 22,
    minWidth: 128,
    alignItems: 'center',
    justifyContent: 'center',
  },
  bookNowBtnDisabled: {
    opacity: 0.7,
  },
  bookNowText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '800',
  },
});