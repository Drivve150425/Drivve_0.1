// import React, { useState, useEffect, useCallback } from 'react';
// import {
//   View,
//   Text,
//   StyleSheet,
//   TouchableOpacity,
//   FlatList,
//   StatusBar,
//   Platform,
//   Alert,
//   ActivityIndicator,
// } from 'react-native';
// import { Ionicons } from '@expo/vector-icons';
// import { Colors } from '../constants/Colors';
// import { useAuth } from '../context/AuthContext';

// import { API_BASE_URL } from "../config/config_ip";
// export default function RideNextScreen({ navigation, route }) {
//   const { user, loading: authLoading } = useAuth();

//   const { searchData } = route.params || {};
//   const { from, to, fromCoords, toCoords, dateTime, seats } = searchData || {};

//   const [availableRides, setAvailableRides] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [errorMessage, setErrorMessage] = useState('');

//   const fetchAvailableRides = useCallback(async () => {
//     if (!searchData || !fromCoords || !toCoords || !dateTime) {
//       setAvailableRides([]);
//       setLoading(false);
//       return;
//     }

//     try {
//       setLoading(true);
//       setErrorMessage('');

//       const response = await fetch(`${API_BASE_URL}/search-rides`, {
//         method: 'POST',
//         headers: {
//           'Content-Type': 'application/json',
//         },
//         body: JSON.stringify({
//           from_location: from,
//           to_location: to,
//           from_coords: fromCoords,
//           to_coords: toCoords,
//           departure_time: new Date(dateTime).toISOString(),
//           seats_required: seats || 1,
//         }),
//       });

//       const rawText = await response.text();
//       let parsedData = null;

//       try {
//         parsedData = rawText ? JSON.parse(rawText) : {};
//       } catch (parseError) {
//         parsedData = { detail: rawText || 'Unexpected server response' };
//       }

//       if (!response.ok) {
//         throw new Error(parsedData?.detail || 'Failed to fetch rides');
//       }

//       setAvailableRides(Array.isArray(parsedData?.rides) ? parsedData.rides : []);
//     } catch (error) {
//       console.log('❌ search-rides error:', error);
//       setAvailableRides([]);
//       setErrorMessage(error.message || 'Failed to search rides');
//       Alert.alert('Error', error.message || 'Failed to search rides');
//     } finally {
//       setLoading(false);
//     }
//   }, [searchData, from, to, fromCoords, toCoords, dateTime, seats]);

//   useEffect(() => {
//     if (authLoading) return;
//     fetchAvailableRides();
//   }, [authLoading, fetchAvailableRides]);

//   const handleCardPress = (ride) => {
//     Alert.alert(
//       'Ride Details',
//       `You clicked on ${ride.driverName}'s ride. Full details screen will be available soon.`,
//       [{ text: 'OK' }]
//     );
//   };

//   const handleRequestToJoin = async (ride) => {
//     if (!user?.phone_number) {
//       Alert.alert('Login required', 'Please log in again to continue.');
//       return;
//     }

//     try {
//       const response = await fetch(`${API_BASE_URL}/ride-bookings`, {
//         method: 'POST',
//         headers: {
//           'Content-Type': 'application/json',
//         },
//         body: JSON.stringify({
//           ride_id: ride.id,
//           passenger_phone: user.phone_number,
//           seats_requested: seats || 1,
//         }),
//       });

//       const rawText = await response.text();
//       let parsedData = {};

//       try {
//         parsedData = rawText ? JSON.parse(rawText) : {};
//       } catch (e) {
//         parsedData = { detail: rawText || 'Unexpected server response' };
//       }

//       if (!response.ok) {
//         throw new Error(parsedData?.detail || 'Failed to send ride request');
//       }

//       Alert.alert('Success', parsedData.message || 'Your request has been sent to the driver!');
//     } catch (error) {
//       console.log('❌ ride-bookings error:', error);
//       Alert.alert('Error', error.message || 'Failed to send ride request');
//     }
//   };

//   const renderRideCard = ({ item }) => (
//     <TouchableOpacity
//       style={styles.rideCard}
//       onPress={() => handleCardPress(item)}
//       activeOpacity={0.7}
//     >
//       <View style={styles.cardHeader}>
//         <View style={styles.driverInfo}>
//           <View style={styles.avatarContainer}>
//             <Ionicons name="person-outline" size={22} color={Colors.gray} />
//           </View>

//           <View style={styles.driverDetails}>
//             <Text style={styles.driverName}>{item.driverName || 'Driver'}</Text>

//             <View style={styles.metaRow}>
//               {!!item.driverUserId && (
//                 <Text style={styles.userIdText}>{item.driverUserId}</Text>
//               )}

//               {item.profileCompleted ? (
//                 <View style={styles.verifiedBadge}>
//                   <Ionicons name="checkmark-circle" size={12} color="#16A34A" />
//                   <Text style={styles.verifiedText}>Verified</Text>
//                 </View>
//               ) : null}
//             </View>

//             <View style={styles.ratingRow}>
//               <Ionicons name="star" size={13} color="#FFA500" />
//               <Text style={styles.ratingText}>{item.rating ?? 4.5}</Text>
//             </View>
//           </View>
//         </View>

//         <View style={styles.matchBadge}>
//           <Text style={styles.matchText}>{item.matchPercentage}%</Text>
//           <Text style={styles.matchLabel}>match</Text>
//         </View>
//       </View>

//       <View style={styles.dateTimeRow}>
//         <View style={styles.dateTimeItem}>
//           <Ionicons name="calendar-outline" size={15} color={Colors.gray} />
//           <Text style={styles.dateTimeText}>{item.date}</Text>
//         </View>

//         <View style={styles.dateTimeItem}>
//           <Ionicons name="time-outline" size={15} color={Colors.gray} />
//           <Text style={styles.dateTimeText}>{item.time}</Text>
//         </View>
//       </View>

//       <View style={styles.routeContainer}>
//         <View style={styles.routeIndicator}>
//           <View style={styles.orangeDot} />
//           <View style={styles.routeLine} />
//           <View style={styles.orangeDot} />
//         </View>

//         <View style={styles.routeDetails}>
//           <View style={styles.locationBlock}>
//             <Text style={styles.locationLabel}>Pickup point</Text>
//             <Text style={styles.locationText} numberOfLines={2}>
//               {item.pickupLabel}
//             </Text>
//           </View>

//           <View style={styles.locationBlock}>
//             <Text style={styles.locationLabel}>Drop point</Text>
//             <Text style={styles.locationText} numberOfLines={2}>
//               {item.dropLabel}
//             </Text>
//           </View>
//         </View>
//       </View>

//       <View style={styles.cardFooter}>
//         <View>
//           <View style={styles.priceContainer}>
//             <Text style={styles.priceSymbol}>₹</Text>
//             <Text style={styles.priceAmount}>{item.price}</Text>
//           </View>
//           <Text style={styles.seatsText}>{item.seatsAvailable} seat(s) left</Text>
//         </View>

//         <TouchableOpacity
//           style={styles.requestButton}
//           onPress={() => handleRequestToJoin(item)}
//           activeOpacity={0.8}
//         >
//           <Text style={styles.requestButtonText}>Request to Join</Text>
//         </TouchableOpacity>
//       </View>
//     </TouchableOpacity>
//   );

//   if (authLoading || loading) {
//     return (
//       <View style={styles.loadingContainer}>
//         <ActivityIndicator size="large" color={Colors.primary} />
//         <Text style={styles.loadingText}>Finding available rides...</Text>
//       </View>
//     );
//   }

//   return (
//     <View style={styles.container}>
//       <StatusBar barStyle="dark-content" backgroundColor={Colors.white} />

//       <View style={styles.header}>
//         <TouchableOpacity
//           style={styles.backButton}
//           onPress={() => navigation.goBack()}
//         >
//           <Ionicons name="chevron-back" size={24} color={Colors.primary} />
//         </TouchableOpacity>

//         <Text style={styles.headerTitle}>Available Rides</Text>
//         <View style={{ width: 40 }} />
//       </View>

//       {availableRides.length === 0 ? (
//         <View style={styles.emptyContainer}>
//           <Ionicons name="car-outline" size={80} color={Colors.gray} />
//           <Text style={styles.emptyTitle}>No Rides Found</Text>
//           <Text style={styles.emptySubtitle}>
//             {errorMessage
//               ? errorMessage
//               : 'There are no available rides for this route at the moment.'}
//           </Text>

//           <TouchableOpacity
//             style={styles.backToHomeButton}
//             onPress={() => navigation.goBack()}
//           >
//             <Text style={styles.backToHomeText}>Search Again</Text>
//           </TouchableOpacity>
//         </View>
//       ) : (
//         <FlatList
//           data={availableRides}
//           renderItem={renderRideCard}
//           keyExtractor={(item) => String(item.id)}
//           contentContainerStyle={styles.listContent}
//           showsVerticalScrollIndicator={false}
//           ItemSeparatorComponent={() => <View style={{ height: 16 }} />}
//         />
//       )}
//     </View>
//   );
// }

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     backgroundColor: '#f5f5f5',
//   },
//   header: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     justifyContent: 'space-between',
//     paddingHorizontal: 20,
//     paddingTop: Platform.OS === 'ios' ? 60 : 40,
//     paddingBottom: 15,
//     backgroundColor: Colors.white,
//   },
//   backButton: {
//     width: 40,
//     height: 40,
//     borderRadius: 20,
//     alignItems: 'center',
//     justifyContent: 'center',
//   },
//   headerTitle: {
//     fontSize: 20,
//     fontWeight: '700',
//     color: Colors.dark,
//   },
//   loadingContainer: {
//     flex: 1,
//     justifyContent: 'center',
//     alignItems: 'center',
//     backgroundColor: '#f5f5f5',
//   },
//   loadingText: {
//     marginTop: 16,
//     fontSize: 16,
//     color: Colors.gray,
//   },
//   listContent: {
//     padding: 16,
//     paddingBottom: 30,
//   },
//   rideCard: {
//     backgroundColor: Colors.white,
//     borderRadius: 12,
//     padding: 16,
//     shadowColor: '#000',
//     shadowOffset: { width: 0, height: 1 },
//     shadowOpacity: 0.1,
//     shadowRadius: 4,
//     elevation: 2,
//   },
//   cardHeader: {
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//     alignItems: 'flex-start',
//     marginBottom: 10,
//   },
//   driverInfo: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     flex: 1,
//   },
//   avatarContainer: {
//     width: 40,
//     height: 40,
//     borderRadius: 20,
//     backgroundColor: '#f0f0f0',
//     alignItems: 'center',
//     justifyContent: 'center',
//     marginRight: 10,
//   },
//   driverDetails: {
//     flex: 1,
//   },
//   driverName: {
//     fontSize: 15,
//     fontWeight: '700',
//     color: Colors.dark,
//     marginBottom: 3,
//   },
//   metaRow: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     gap: 8,
//     marginBottom: 4,
//     flexWrap: 'wrap',
//   },
//   userIdText: {
//     fontSize: 11,
//     color: Colors.gray,
//     fontWeight: '600',
//   },
//   verifiedBadge: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     gap: 3,
//     backgroundColor: '#ECFDF3',
//     paddingHorizontal: 6,
//     paddingVertical: 2,
//     borderRadius: 10,
//   },
//   verifiedText: {
//     fontSize: 10,
//     color: '#16A34A',
//     fontWeight: '700',
//   },
//   ratingRow: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     gap: 3,
//   },
//   ratingText: {
//     fontSize: 12,
//     color: Colors.gray,
//     fontWeight: '500',
//   },
//   matchBadge: {
//     backgroundColor: '#e8f4ff',
//     paddingHorizontal: 10,
//     paddingVertical: 4,
//     borderRadius: 8,
//     alignItems: 'center',
//     minWidth: 50,
//   },
//   matchText: {
//     fontSize: 13,
//     fontWeight: '700',
//     color: Colors.primary,
//   },
//   matchLabel: {
//     fontSize: 10,
//     color: Colors.primary,
//     marginTop: 1,
//   },
//   dateTimeRow: {
//     flexDirection: 'row',
//     marginBottom: 12,
//     gap: 12,
//   },
//   dateTimeItem: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     gap: 5,
//   },
//   dateTimeText: {
//     fontSize: 12,
//     color: Colors.gray,
//     fontWeight: '500',
//   },
//   routeContainer: {
//     flexDirection: 'row',
//     marginBottom: 14,
//   },
//   routeIndicator: {
//     alignItems: 'center',
//     marginRight: 10,
//     paddingTop: 2,
//   },
//   orangeDot: {
//     width: 7,
//     height: 7,
//     borderRadius: 3.5,
//     backgroundColor: Colors.secondary,
//   },
//   routeLine: {
//     width: 1.5,
//     height: 32,
//     backgroundColor: '#e0e0e0',
//     marginVertical: 5,
//   },
//   routeDetails: {
//     flex: 1,
//   },
//   locationBlock: {
//     marginBottom: 12,
//   },
//   locationLabel: {
//     fontSize: 11,
//     color: Colors.gray,
//     marginBottom: 2,
//   },
//   locationText: {
//     fontSize: 13,
//     color: Colors.dark,
//     fontWeight: '500',
//     lineHeight: 17,
//   },
//   cardFooter: {
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//     alignItems: 'center',
//     paddingTop: 12,
//     borderTopWidth: 1,
//     borderTopColor: '#f0f0f0',
//   },
//   priceContainer: {
//     flexDirection: 'row',
//     alignItems: 'baseline',
//   },
//   priceSymbol: {
//     fontSize: 16,
//     fontWeight: '700',
//     color: Colors.secondary,
//   },
//   priceAmount: {
//     fontSize: 22,
//     fontWeight: '700',
//     color: Colors.secondary,
//   },
//   seatsText: {
//     marginTop: 4,
//     fontSize: 12,
//     color: Colors.gray,
//     fontWeight: '500',
//   },
//   requestButton: {
//     backgroundColor: Colors.primary,
//     paddingHorizontal: 18,
//     paddingVertical: 12,
//     borderRadius: 25,
//     shadowColor: Colors.primary,
//     shadowOffset: { width: 0, height: 2 },
//     shadowOpacity: 0.2,
//     shadowRadius: 3,
//     elevation: 3,
//   },
//   requestButtonText: {
//     color: Colors.white,
//     fontSize: 13,
//     fontWeight: '700',
//   },
//   emptyContainer: {
//     flex: 1,
//     justifyContent: 'center',
//     alignItems: 'center',
//     paddingHorizontal: 40,
//   },
//   emptyTitle: {
//     fontSize: 22,
//     fontWeight: '700',
//     color: Colors.dark,
//     marginTop: 20,
//     marginBottom: 8,
//   },
//   emptySubtitle: {
//     fontSize: 15,
//     color: Colors.gray,
//     textAlign: 'center',
//     lineHeight: 22,
//     marginBottom: 30,
//   },
//   backToHomeButton: {
//     backgroundColor: Colors.primary,
//     paddingHorizontal: 32,
//     paddingVertical: 14,
//     borderRadius: 12,
//   },
//   backToHomeText: {
//     color: Colors.white,
//     fontSize: 16,
//     fontWeight: '700',
//   },
// });
import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  StatusBar,
  Platform,
  Alert,
  ActivityIndicator,
  Image,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../constants/Colors';
import { useAuth } from '../context/AuthContext';
import { API_BASE_URL } from "../config/config_ip";

const IMAGE_BASE_URL = API_BASE_URL;

function buildImageUrl(url) {
  if (!url) return null;
  if (url.startsWith('http://') || url.startsWith('https://')) return url;
  return `${IMAGE_BASE_URL}${url.startsWith('/') ? '' : '/'}${url}`;
}

function getDriverInitials(name) {
  if (!name) return 'D';
  const parts = name.trim().split(' ').filter(Boolean);
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
}

export default function RideNextScreen({ navigation, route }) {
  const { user, loading: authLoading } = useAuth();
  const { searchData } = route.params || {};
  const { from, to, fromCoords, toCoords, dateTime, seats } = searchData || {};

  const [availableRides, setAvailableRides] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');

  const fetchAvailableRides = useCallback(async () => {
    if (!searchData || !fromCoords || !toCoords || !dateTime) {
      setAvailableRides([]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setErrorMessage('');

      const response = await fetch(`${API_BASE_URL}/search-rides`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          from_location: from,
          to_location: to,
          from_coords: fromCoords,
          to_coords: toCoords,
          departure_time: new Date(dateTime).toISOString(),
          seats_required: seats || 1,
        }),
      });

      const rawText = await response.text();
      let parsedData = null;

      try {
        parsedData = rawText ? JSON.parse(rawText) : {};
      } catch (parseError) {
        parsedData = { detail: rawText || 'Unexpected server response' };
      }

      if (!response.ok) {
        throw new Error(parsedData?.detail || 'Failed to fetch rides');
      }

      setAvailableRides(Array.isArray(parsedData?.rides) ? parsedData.rides : []);
    } catch (error) {
      console.log('❌ search-rides error:', error);
      setAvailableRides([]);
      setErrorMessage(error.message || 'Failed to search rides');
      Alert.alert('Error', error.message || 'Failed to search rides');
    } finally {
      setLoading(false);
    }
  }, [searchData, from, to, fromCoords, toCoords, dateTime, seats]);

  useEffect(() => {
    if (authLoading) return;
    fetchAvailableRides();
  }, [authLoading, fetchAvailableRides]);

  const handleCardPress = (ride) => {
    Alert.alert(
      'Ride Details',
      `You clicked on ${ride.driverName}'s ride. Full details screen will be available soon.`,
      [{ text: 'OK' }]
    );
  };

  const handleRequestToJoin = async (ride) => {
    if (!user?.phone_number) {
      Alert.alert('Login required', 'Please log in again to continue.');
      return;
    }

    try {
      const response = await fetch(`${API_BASE_URL}/ride-bookings`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ride_id: ride.id,
          passenger_phone: user.phone_number,
          seats_requested: seats || 1,
        }),
      });

      const rawText = await response.text();
      let parsedData = {};

      try {
        parsedData = rawText ? JSON.parse(rawText) : {};
      } catch (e) {
        parsedData = { detail: rawText || 'Unexpected server response' };
      }

      if (!response.ok) {
        throw new Error(parsedData?.detail || 'Failed to send ride request');
      }

      Alert.alert('Success', parsedData.message || 'Your request has been sent to the driver!');
    } catch (error) {
      console.log('❌ ride-bookings error:', error);
      Alert.alert('Error', error.message || 'Failed to send ride request');
    }
  };

  const renderRideCard = ({ item }) => {
    const profilePhotoUrl = buildImageUrl(item.profilePicture || item.profilepicture || item.profilePhoto);
    const avatarText = getDriverInitials(item.driverName || 'Driver');

    return (
      <TouchableOpacity
        style={styles.rideCard}
        onPress={() => handleCardPress(item)}
        activeOpacity={0.7}
      >
        <View style={styles.cardHeader}>
          <View style={styles.driverInfo}>
            <View style={styles.avatarContainer}>
              {profilePhotoUrl ? (
                <Image
                  source={{ uri: profilePhotoUrl }}
                  style={styles.avatarImage}
                  resizeMode="cover"
                />
              ) : (
                <Text style={styles.avatarFallback}>{avatarText}</Text>
              )}
            </View>

            <View style={styles.driverDetails}>
              <Text style={styles.driverName}>{item.driverName || 'Driver'}</Text>

              <View style={styles.metaRow}>
                {!!item.driverUserId && (
                  <Text style={styles.userIdText}>{item.driverUserId}</Text>
                )}

                {item.profileCompleted ? (
                  <View style={styles.verifiedBadge}>
                    <Ionicons name="checkmark-circle" size={12} color="#16A34A" />
                    <Text style={styles.verifiedText}>Verified</Text>
                  </View>
                ) : null}
              </View>

              <View style={styles.ratingRow}>
                <Ionicons name="star" size={13} color="#FFA500" />
                <Text style={styles.ratingText}>{item.rating ?? 4.5}</Text>
              </View>
            </View>
          </View>

          <View style={styles.matchBadge}>
            <Text style={styles.matchText}>{item.matchPercentage}%</Text>
            <Text style={styles.matchLabel}>match</Text>
          </View>
        </View>

        <View style={styles.dateTimeRow}>
          <View style={styles.dateTimeItem}>
            <Ionicons name="calendar-outline" size={15} color={Colors.gray} />
            <Text style={styles.dateTimeText}>{item.date}</Text>
          </View>

          <View style={styles.dateTimeItem}>
            <Ionicons name="time-outline" size={15} color={Colors.gray} />
            <Text style={styles.dateTimeText}>{item.time}</Text>
          </View>
        </View>

        <View style={styles.routeContainer}>
          <View style={styles.routeIndicator}>
            <View style={styles.orangeDot} />
            <View style={styles.routeLine} />
            <View style={styles.orangeDot} />
          </View>

          <View style={styles.routeDetails}>
            <View style={styles.locationBlock}>
              <Text style={styles.locationLabel}>Pickup point</Text>
              <Text style={styles.locationText} numberOfLines={2}>
                {item.pickupLabel}
              </Text>
            </View>

            <View style={styles.locationBlock}>
              <Text style={styles.locationLabel}>Drop point</Text>
              <Text style={styles.locationText} numberOfLines={2}>
                {item.dropLabel}
              </Text>
            </View>
          </View>
        </View>

        <View style={styles.cardFooter}>
          <View>
            <View style={styles.priceContainer}>
              <Text style={styles.priceSymbol}>₹</Text>
              <Text style={styles.priceAmount}>{item.price}</Text>
            </View>
            <Text style={styles.seatsText}>{item.seatsAvailable} seat(s) left</Text>
          </View>

          <TouchableOpacity
            style={styles.requestButton}
            onPress={() => handleRequestToJoin(item)}
            activeOpacity={0.8}
          >
            <Text style={styles.requestButtonText}>Request to Join</Text>
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
    );
  };

  if (authLoading || loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={Colors.primary} />
        <Text style={styles.loadingText}>Finding available rides...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={Colors.white} />

      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="chevron-back" size={24} color={Colors.primary} />
        </TouchableOpacity>

        <Text style={styles.headerTitle}>Available Rides</Text>
        <View style={{ width: 40 }} />
      </View>

      {availableRides.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Ionicons name="car-outline" size={80} color={Colors.gray} />
          <Text style={styles.emptyTitle}>No Rides Found</Text>
          <Text style={styles.emptySubtitle}>
            {errorMessage
              ? errorMessage
              : 'There are no available rides for this route at the moment.'}
          </Text>

          <TouchableOpacity
            style={styles.backToHomeButton}
            onPress={() => navigation.goBack()}
          >
            <Text style={styles.backToHomeText}>Search Again</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={availableRides}
          renderItem={renderRideCard}
          keyExtractor={(item) => String(item.id)}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          ItemSeparatorComponent={() => <View style={{ height: 16 }} />}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: Platform.OS === 'ios' ? 60 : 40,
    paddingBottom: 15,
    backgroundColor: Colors.white,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: Colors.dark,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: Colors.gray,
  },
  listContent: {
    padding: 16,
    paddingBottom: 30,
  },
  rideCard: {
    backgroundColor: Colors.white,
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 10,
  },
  driverInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  avatarContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#f0f0f0',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
    overflow: 'hidden',
  },
  avatarImage: {
    width: 40,
    height: 40,
  },
  avatarFallback: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.gray,
  },
  driverDetails: {
    flex: 1,
  },
  driverName: {
    fontSize: 15,
    fontWeight: '700',
    color: Colors.dark,
    marginBottom: 3,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 4,
    flexWrap: 'wrap',
  },
  userIdText: {
    fontSize: 11,
    color: Colors.gray,
    fontWeight: '600',
  },
  verifiedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    backgroundColor: '#ECFDF3',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 10,
  },
  verifiedText: {
    fontSize: 10,
    color: '#16A34A',
    fontWeight: '700',
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
  },
  ratingText: {
    fontSize: 12,
    color: Colors.gray,
    fontWeight: '500',
  },
  matchBadge: {
    backgroundColor: '#e8f4ff',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    alignItems: 'center',
    minWidth: 50,
  },
  matchText: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.primary,
  },
  matchLabel: {
    fontSize: 10,
    color: Colors.primary,
    marginTop: 1,
  },
  dateTimeRow: {
    flexDirection: 'row',
    marginBottom: 12,
    gap: 12,
  },
  dateTimeItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  dateTimeText: {
    fontSize: 12,
    color: Colors.gray,
    fontWeight: '500',
  },
  routeContainer: {
    flexDirection: 'row',
    marginBottom: 14,
  },
  routeIndicator: {
    alignItems: 'center',
    marginRight: 10,
    paddingTop: 2,
  },
  orangeDot: {
    width: 7,
    height: 7,
    borderRadius: 3.5,
    backgroundColor: Colors.secondary,
  },
  routeLine: {
    width: 1.5,
    height: 32,
    backgroundColor: '#e0e0e0',
    marginVertical: 5,
  },
  routeDetails: {
    flex: 1,
  },
  locationBlock: {
    marginBottom: 12,
  },
  locationLabel: {
    fontSize: 11,
    color: Colors.gray,
    marginBottom: 2,
  },
  locationText: {
    fontSize: 13,
    color: Colors.dark,
    fontWeight: '500',
    lineHeight: 17,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
  },
  priceContainer: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  priceSymbol: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.secondary,
  },
  priceAmount: {
    fontSize: 22,
    fontWeight: '700',
    color: Colors.secondary,
  },
  seatsText: {
    marginTop: 4,
    fontSize: 12,
    color: Colors.gray,
    fontWeight: '500',
  },
  requestButton: {
    backgroundColor: Colors.primary,
    paddingHorizontal: 18,
    paddingVertical: 12,
    borderRadius: 25,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 3,
  },
  requestButtonText: {
    color: Colors.white,
    fontSize: 13,
    fontWeight: '700',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  emptyTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: Colors.dark,
    marginTop: 20,
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 15,
    color: Colors.gray,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 30,
  },
  backToHomeButton: {
    backgroundColor: Colors.primary,
    paddingHorizontal: 32,
    paddingVertical: 14,
    borderRadius: 12,
  },
  backToHomeText: {
    color: Colors.white,
    fontSize: 16,
    fontWeight: '700',
  },
});