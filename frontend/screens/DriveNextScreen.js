import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  TextInput,
  StatusBar,
  Platform,
  Alert,
  Modal,
  FlatList,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { Colors } from '../constants/Colors';

export default function DriveNextScreen({ navigation, route }) {
  const { rideData, userData } = route.params || {};

  // Extract ride data
  const { from, to, dateTime, seats } = rideData || {};

  // Vehicle Type options
  const vehicleTypes = [
    { label: 'Sedan', value: 'sedan' },
    { label: 'SUV', value: 'suv' },
    { label: 'Hatchback', value: 'hatchback' },
    { label: 'MUV', value: 'muv' },
    { label: 'Luxury', value: 'luxury' },
    { label: 'Compact', value: 'compact' },
  ];

  // Vehicle Numbers options
  const vehicleNumbers = [
    { label: 'DL 01 AB 1234', value: 'DL01AB1234' },
    { label: 'DL 02 CD 5678', value: 'DL02CD5678' },
    { label: 'HR 26 XY 9012', value: 'HR26XY9012' },
  ];

  // State variables
  const [vehicleType, setVehicleType] = useState('');
  const [vehicleNo, setVehicleNo] = useState('');
  const [priceRange, setPriceRange] = useState('');
  
  // Modal states
  const [showVehicleTypeModal, setShowVehicleTypeModal] = useState(false);
  const [showVehicleNoModal, setShowVehicleNoModal] = useState(false);
  const [showAddVehicleModal, setShowAddVehicleModal] = useState(false);

  // Format date and time
  const formatDate = (date) => {
    if (!date) return '';
    const d = new Date(date);
    return d.toLocaleDateString('en-GB', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  };

  const formatTime = (date) => {
    if (!date) return '';
    const d = new Date(date);
    return d.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    });
  };

  // Get display label for selected value
  const getVehicleTypeLabel = () => {
    const selected = vehicleTypes.find(item => item.value === vehicleType);
    return selected ? selected.label : '';
  };

  const getVehicleNoLabel = () => {
    const selected = vehicleNumbers.find(item => item.value === vehicleNo);
    return selected ? selected.label : '';
  };

  // Handle post ride
  const handlePostRide = () => {
    if (!vehicleType) {
      Alert.alert('Required', 'Please select vehicle type');
      return;
    }
    if (!vehicleNo) {
      Alert.alert('Required', 'Please select vehicle number');
      return;
    }
    if (!priceRange.trim()) {
      Alert.alert('Required', 'Please enter price range');
      return;
    }

    const completeRideData = {
      ...rideData,
      vehicleType,
      vehicleNo,
      priceRange,
    };

    console.log('Complete Ride Data:', completeRideData);
    
    Alert.alert(
      'Success',
      'Your ride has been posted successfully!',
      [
        {
          text: 'OK',
          onPress: () => navigation.navigate('Home'),
        },
      ]
    );
  };

  // Render Vehicle Type Modal
  const renderVehicleTypeModal = () => (
    <Modal
      visible={showVehicleTypeModal}
      transparent={true}
      animationType="slide"
      onRequestClose={() => setShowVehicleTypeModal(false)}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Select Vehicle Type</Text>
            <TouchableOpacity onPress={() => setShowVehicleTypeModal(false)}>
              <Ionicons name="close" size={28} color={Colors.dark} />
            </TouchableOpacity>
          </View>
          
          <FlatList
            data={vehicleTypes}
            keyExtractor={(item) => item.value}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={[
                  styles.modalItem,
                  vehicleType === item.value && styles.modalItemSelected
                ]}
                onPress={() => {
                  setVehicleType(item.value);
                  setShowVehicleTypeModal(false);
                }}
              >
                <Text style={[
                  styles.modalItemText,
                  vehicleType === item.value && styles.modalItemTextSelected
                ]}>
                  {item.label}
                </Text>
                {vehicleType === item.value && (
                  <Ionicons name="checkmark" size={24} color={Colors.secondary} />
                )}
              </TouchableOpacity>
            )}
          />
        </View>
      </View>
    </Modal>
  );

  // Render Vehicle Number Modal
  const renderVehicleNoModal = () => (
    <Modal
      visible={showVehicleNoModal}
      transparent={true}
      animationType="slide"
      onRequestClose={() => setShowVehicleNoModal(false)}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Select Vehicle Number</Text>
            <TouchableOpacity onPress={() => setShowVehicleNoModal(false)}>
              <Ionicons name="close" size={28} color={Colors.dark} />
            </TouchableOpacity>
          </View>
          
          <FlatList
            data={vehicleNumbers}
            keyExtractor={(item) => item.value}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={[
                  styles.modalItem,
                  vehicleNo === item.value && styles.modalItemSelected
                ]}
                onPress={() => {
                  setVehicleNo(item.value);
                  setShowVehicleNoModal(false);
                }}
              >
                <Text style={[
                  styles.modalItemText,
                  vehicleNo === item.value && styles.modalItemTextSelected
                ]}>
                  {item.label}
                </Text>
                {vehicleNo === item.value && (
                  <Ionicons name="checkmark" size={24} color={Colors.secondary} />
                )}
              </TouchableOpacity>
            )}
          />
          
          {/* Add New Vehicle Option */}
          <TouchableOpacity
            style={styles.addNewOption}
            onPress={() => {
              setShowVehicleNoModal(false);
              setShowAddVehicleModal(true);
            }}
          >
            <Ionicons name="add-circle" size={24} color={Colors.secondary} />
            <Text style={styles.addNewText}>Add New Vehicle</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={Colors.white} />
      
      {/* iOS-style Header with Back Button */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="chevron-back" size={24} color={Colors.secondary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Drive</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Summary Card */}
        <View style={styles.summaryCard}>
          <View style={styles.summaryHeader}>
            <Text style={styles.summaryTitle}>Summary</Text>
            <TouchableOpacity onPress={() => navigation.goBack()}>
              <Ionicons name="create-outline" size={24} color={Colors.secondary} />
            </TouchableOpacity>
          </View>

          {/* Route Info with Dots */}
          <View style={styles.routeContainer}>
            <View style={styles.routeIndicator}>
              <View style={styles.startDot} />
              <View style={styles.routeLine} />
              <View style={styles.endDot} />
            </View>
            
            <View style={styles.routeDetails}>
              <View style={styles.locationBlock}>
                <Text style={styles.locationLabel}>From:</Text>
                <Text style={styles.locationText} numberOfLines={2}>
                  {from || 'Not specified'}
                </Text>
              </View>
              
              <View style={styles.locationBlock}>
                <Text style={styles.locationLabel}>To:</Text>
                <Text style={styles.locationText} numberOfLines={2}>
                  {to || 'Not specified'}
                </Text>
              </View>
            </View>
          </View>

          {/* Trip Details Row */}
          <View style={styles.tripDetailsContainer}>
            <View style={styles.tripDetail}>
              <Ionicons name="calendar" size={18} color={Colors.secondary} />
              <Text style={styles.tripDetailText}>{formatDate(dateTime)}</Text>
            </View>
            
            <View style={styles.tripDetail}>
              <Ionicons name="time" size={18} color={Colors.secondary} />
              <Text style={styles.tripDetailText}>{formatTime(dateTime)}</Text>
            </View>
            
            <View style={styles.tripDetail}>
              <Ionicons name="people" size={18} color={Colors.secondary} />
              <Text style={styles.tripDetailText}>{seats} Seats</Text>
            </View>
          </View>
        </View>

        {/* Vehicle Type Section */}
        <View style={styles.formSection}>
          <Text style={styles.sectionTitle}>Vehicle Type</Text>
          <TouchableOpacity
            style={styles.dropdownTouchable}
            onPress={() => setShowVehicleTypeModal(true)}
          >
            <Text style={[
              styles.dropdownText,
              !vehicleType && styles.placeholderText
            ]}>
              {vehicleType ? getVehicleTypeLabel() : 'VehicleType'}
            </Text>
            <Ionicons name="chevron-down" size={20} color={Colors.gray} />
          </TouchableOpacity>
        </View>

        {/* Vehicle Number Section */}
        <View style={styles.formSection}>
          <Text style={styles.sectionTitle}>Vehicle No.</Text>
          <View style={styles.vehicleNumberRow}>
            <TouchableOpacity
              style={[styles.dropdownTouchable, { flex: 1 }]}
              onPress={() => setShowVehicleNoModal(true)}
            >
              <Text style={[
                styles.dropdownText,
                !vehicleNo && styles.placeholderText
              ]}>
                {vehicleNo ? getVehicleNoLabel() : 'Add New Vehicle'}
              </Text>
              <Ionicons name="chevron-down" size={20} color={Colors.gray} />
            </TouchableOpacity>
            
            <TouchableOpacity
              style={styles.addIconButton}
              onPress={() => setShowAddVehicleModal(true)}
            >
              <Ionicons name="copy-outline" size={24} color={Colors.secondary} />
            </TouchableOpacity>
          </View>
        </View>

        {/* Price Section */}
        <View style={styles.formSection}>
          <Text style={styles.sectionTitle}>Price</Text>
          <TextInput
            style={styles.priceInput}
            placeholder="Range: 200-250"
            placeholderTextColor={Colors.gray}
            textAlignVertical= 'center'
            value={priceRange}
            onChangeText={setPriceRange}
            keyboardType="default"
          />
        </View>

        {/* Post Button with Gradient */}
        <TouchableOpacity
          style={styles.postButton}
          onPress={handlePostRide}
          activeOpacity={0.8}
        >
          <LinearGradient
            colors={['#c2410c', '#ea580c', '#f97316']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.postButtonGradient}
          >
            <Text style={styles.postButtonText}>Post</Text>
          </LinearGradient>
        </TouchableOpacity>
      </ScrollView>

      {/* Modals */}
      {renderVehicleTypeModal()}
      {renderVehicleNoModal()}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
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
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 40,
  },
  summaryCard: {
    backgroundColor: Colors.white,
    borderRadius: 16,
    padding: 20,
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  summaryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  summaryTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: Colors.dark,
  },
  routeContainer: {
    flexDirection: 'row',
    marginBottom: 10,
  },
  routeIndicator: {
    alignItems: 'center',
    marginRight: 15,
    paddingTop: 5,
  },
  startDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginTop: 9,
    backgroundColor: Colors.secondary,
  },
  routeLine: {
    width: 2,
    height: 60,
    backgroundColor: '#e0e0e0',
    marginVertical: 6,
  },
  endDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: Colors.secondary,
  },
  routeDetails: {
    flex: 1,
  },
  locationBlock: {
    marginBottom: 20,
  },
  locationLabel: {
    fontSize: 15,
    color: Colors.gray,
    marginBottom: 4,
  },
  locationText: {
    fontSize: 15,
    color: Colors.dark,
    fontWeight: '500',
    lineHeight: 20,
  },
  tripDetailsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
  },
  tripDetail: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  tripDetailText: {
    fontSize: 13,
    color: Colors.dark,
    fontWeight: '500',
  },
  formSection: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: '600',
    color: Colors.dark,
    marginBottom: 10,
  },
  dropdownTouchable: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1.5,
    borderColor: Colors.gray,
    borderRadius: 15,
    backgroundColor: Colors.white,
    paddingHorizontal: 16,
    paddingVertical: 12,
    minHeight: 52,
  },
  dropdownText: {
    fontSize: 16,
    color: Colors.dark,
  },
  placeholderText: {
    color: Colors.gray,
  },
  vehicleNumberRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  addIconButton: {
    width: 52,
    height: 52,
    borderRadius: 12,
    backgroundColor: Colors.white,
    borderWidth: 1,
    borderColor: Colors.secondary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  priceInput: {
    borderWidth: 1.5,
    borderColor: Colors.gray,
    borderRadius: 15,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    backgroundColor: Colors.white,
    color: Colors.dark,
    minHeight: 52,
  },
  postButton: {
    marginTop: 20,
    borderRadius: 25,
    overflow: 'hidden',
    shadowColor: Colors.secondary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  postButtonGradient: {
    paddingVertical: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  postButtonText: {
    color: Colors.white,
    fontSize: 18,
    fontWeight: '700',
  },
  // Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: Colors.white,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingBottom: Platform.OS === 'ios' ? 40 : 20,
    maxHeight: '70%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.dark,
  },
  modalItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#f5f5f5',
  },
  modalItemSelected: {
    backgroundColor: '#fff5f0',
  },
  modalItemText: {
    fontSize: 16,
    color: Colors.dark,
  },
  modalItemTextSelected: {
    color: Colors.secondary,
    fontWeight: '600',
  },
  addNewOption: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    paddingHorizontal: 20,
    gap: 8,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
    marginTop: 10,
  },
  addNewText: {
    fontSize: 16,
    color: Colors.secondary,
    fontWeight: '600',
  },
});
