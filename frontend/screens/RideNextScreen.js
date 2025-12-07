import React, { useState, useEffect } from 'react';
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
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../constants/Colors';

export default function RideNextScreen({ navigation, route }) {
  const { searchData, userData } = route.params || {};
  const { from, to, dateTime, seats } = searchData || {};

  const [availableRides, setAvailableRides] = useState([]);
  const [loading, setLoading] = useState(true);

  // Mock data - Replace with actual API call
  useEffect(() => {
    fetchAvailableRides();
  }, []);

  const fetchAvailableRides = async () => {
    // Simulate API call
    setTimeout(() => {
      const mockRides = [
        {
          id: '1',
          driverName: 'Aman Jain',
          rating: 4.5,
          dateTime: '07/10/2025',
          time: '01:46 Am',
          from: 'Block S 2, Upadhyay Block, Shakarpur khas, Delhi, 110092, India',
          to: 'Jal Vayu Vihar, Sector 30, Gurugram, Haryana 122022, India',
          price: 200,
          matchPercentage: 80,
          seatsAvailable: 3,
        },
        {
          id: '2',
          driverName: 'Aman Jain',
          rating: 4.5,
          dateTime: '27/07/2025',
          time: '7:30 Pm',
          from: 'Block S 2, Upadhyay Block, Shakarpur khas, Delhi, 110092, India',
          to: 'Jal Vayu Vihar, Sector 30, Gurugram, Haryana 122022, India',
          price: 200,
          matchPercentage: 80,
          seatsAvailable: 2,
        },
        {
          id: '3',
          driverName: 'Aman Jain',
          rating: 4.5,
          dateTime: '27/07/2025',
          time: '7:30 Pm',
          from: 'Block S 2, Upadhyay Block, Shakarpur khas, Delhi, 110092, India',
          to: 'Jal Vayu Vihar, Sector 30, Gurugram, Haryana 122022, India',
          price: 200,
          matchPercentage: 80,
          seatsAvailable: 1,
        },
      ];

      setAvailableRides(mockRides);
      setLoading(false);
    }, 1000);
  };

  // Handle card press to view full ride details
  const handleCardPress = (ride) => {
    // TODO: Navigate to RideDetailsScreen in future
    Alert.alert(
      'Ride Details',
      `You clicked on ${ride.driverName}'s ride. Full details screen will be available soon.`,
      [{ text: 'OK' }]
    );
    
    // Future implementation:
    // navigation.navigate('RideDetails', { rideId: ride.id, rideData: ride });
  };

  const handleRequestToJoin = (ride, event) => {
    // Stop event propagation to prevent card press
    event?.stopPropagation?.();
    
    Alert.alert(
      'Request to Join',
      `Do you want to request to join ${ride.driverName}'s ride for ₹${ride.price}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Request',
          onPress: () => {
            // TODO: Send request to backend
            Alert.alert('Success', 'Your request has been sent to the driver!');
          },
        },
      ]
    );
  };

  const renderRideCard = ({ item }) => (
    <TouchableOpacity
      style={styles.rideCard}
      onPress={() => handleCardPress(item)}
      activeOpacity={0.7}
    >
      {/* Header: Driver Info and Match */}
      <View style={styles.cardHeader}>
        <View style={styles.driverInfo}>
          <View style={styles.avatarContainer}>
            <Ionicons name="person-outline" size={22} color={Colors.gray} />
          </View>
          <View style={styles.driverDetails}>
            <Text style={styles.driverName}>{item.driverName}</Text>
            <View style={styles.ratingRow}>
              <Ionicons name="star" size={13} color="#FFA500" />
              <Text style={styles.ratingText}>{item.rating}</Text>
            </View>
          </View>
        </View>

        <View style={styles.matchBadge}>
          <Text style={styles.matchText}>{item.matchPercentage}%</Text>
          <Text style={styles.matchLabel}>match</Text>
        </View>
      </View>

      {/* Date and Time Row */}
      <View style={styles.dateTimeRow}>
        <View style={styles.dateTimeItem}>
          <Ionicons name="calendar-outline" size={15} color={Colors.gray} />
          <Text style={styles.dateTimeText}>{item.dateTime}</Text>
        </View>
        <View style={styles.dateTimeItem}>
          <Ionicons name="time-outline" size={15} color={Colors.gray} />
          <Text style={styles.dateTimeText}>{item.time}</Text>
        </View>
      </View>

      {/* Route Info */}
      <View style={styles.routeContainer}>
        <View style={styles.routeIndicator}>
          <View style={styles.orangeDot} />
          <View style={styles.routeLine} />
          <View style={styles.orangeDot} />
        </View>

        <View style={styles.routeDetails}>
          <View style={styles.locationBlock}>
            <Text style={styles.locationLabel}>From:</Text>
            <Text style={styles.locationText} numberOfLines={2}>
              {item.from}
            </Text>
          </View>

          <View style={styles.locationBlock}>
            <Text style={styles.locationLabel}>To:</Text>
            <Text style={styles.locationText} numberOfLines={2}>
              {item.to}
            </Text>
          </View>
        </View>
      </View>

      {/* Footer: Price and Action Button */}
      <View style={styles.cardFooter}>
        <View style={styles.priceContainer}>
          <Text style={styles.priceSymbol}>₹</Text>
          <Text style={styles.priceAmount}>{item.price}</Text>
        </View>

        <TouchableOpacity
          style={styles.requestButton}
          onPress={(e) => handleRequestToJoin(item, e)}
          activeOpacity={0.8}
        >
          <Text style={styles.requestButtonText}>Request to Join</Text>
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );

  if (loading) {
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

      {/* Header */}
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

      {/* Rides List */}
      {availableRides.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Ionicons name="car-outline" size={80} color={Colors.gray} />
          <Text style={styles.emptyTitle}>No Rides Found</Text>
          <Text style={styles.emptySubtitle}>
            There are no available rides for this route at the moment.
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
          keyExtractor={(item) => item.id}
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
