import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  StatusBar,
  Dimensions,
  Modal,
  Animated,
  KeyboardAvoidingView,
  Platform,
  TextInput,
  Alert,
  ActivityIndicator
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons, Ionicons } from '@expo/vector-icons';
import * as Location from 'expo-location';
import { Colors, Typography } from '../constants/Colors';
import LottieView from "lottie-react-native";

let MapView = null;
let Marker = null;

if (Platform.OS !== 'web') {
  const Maps = require('react-native-maps');
  MapView = Maps.default;
  Marker = Maps.Marker;
}

import * as Haptics from 'expo-haptics';

import DatabaseService from '../services/savedaddress_ds';
import { useAuth } from "../context/AuthContext";

const { width, height } = Dimensions.get('window');

// Type icons mapping with your color scheme
const TYPE_ICONS = {
  Home: { name: 'home', icon: MaterialIcons, color: '#ED7117' },
  Work: { name: 'work', icon: MaterialIcons, color: '#2563EB' },
  Others: { name: 'location-pin', icon: MaterialIcons, color: '#10B981' },
};

const normalizeAddress = (a) => ({
  id: a.id,
  label: a.label,
  type: a.type,
  fullAddress: a.full_address,
  house: a.house || '',
  area: a.area || '',
  instructions: a.instructions || '',
  isDefault: a.is_default,
});

export default function SavedAddressesScreen({ navigation, route }) {
 const { user } = useAuth();
  const phoneNumber = user?.phone_number;

  
  // States
  const [step, setStep] = useState(1);
  const [addresses, setAddresses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [deletingId, setDeletingId] = useState(null);
  const [mapRegion, setMapRegion] = useState({
    latitude: 28.5562,
    longitude: 77.1,
    latitudeDelta: 0.01,
    longitudeDelta: 0.01,
  });
  const [selectedAddress, setSelectedAddress] = useState('');
  const [searchText, setSearchText] = useState('');
  const [activeType, setActiveType] = useState('Home');
  const [otherLabel, setOtherLabel] = useState('');
  const [house, setHouse] = useState('');
  const [area, setArea] = useState('');
  const [instructions, setInstructions] = useState('');
  const [makeDefault, setMakeDefault] = useState(false);
  const [editingId, setEditingId] = useState(null);
  
  // Modal states
  const [modalVisible, setModalVisible] = useState(false);
  const [modalType, setModalType] = useState(null); // 'edit', 'delete', 'success'
  const [selectedModalItem, setSelectedModalItem] = useState(null);
  
  // Animation refs
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;

  useEffect(() => {
    loadAddresses();
    
    // Entrance animation
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 500,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const loadAddresses = async () => {
    try {
      if (!phoneNumber) return;
      
      setLoading(true);
      const res = await DatabaseService.getAddresses(
        phoneNumber.replace(/\s/g, '')
      );

    if (Array.isArray(res)) {
  const sorted = res
    .map(normalizeAddress)
    .sort((a, b) => b.id - a.id); // DESC order (latest first)

  setAddresses(sorted);
}

    } catch (error) {
      console.error('Error loading addresses:', error);
      Alert.alert('Error', 'Failed to load addresses');
    } finally {
      setLoading(false);
    }
  };

  const handleAddAddress = () => {
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    resetForm();
    setSelectedAddress('');
    setSearchText('');
    setStep(2);
  };

  const handleEditAddress = (address) => {
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    setSelectedModalItem(address);
    setModalType('edit');
    setModalVisible(true);
  };

  const handleDeleteAddress = (address) => {
    setSelectedModalItem(address);
    setModalType('delete');
    setModalVisible(true);
  };

  const confirmEdit = () => {
    const address = selectedModalItem;
    if (!address) return;
    
    setEditingId(address.id);
    setSelectedAddress(address.fullAddress);
    setActiveType(address.type);
    setHouse(address.house);
    setArea(address.area);
    setInstructions(address.instructions);
    setMakeDefault(address.isDefault);
    if (address.type === 'Others') setOtherLabel(address.label);
    
    setModalVisible(false);
    setSelectedModalItem(null);
    setModalType(null);
    setStep(3);
  };

  const confirmDelete = async () => {
    setDeleting(true);
    setDeletingId(selectedModalItem?.id);
    
    try {
      await DatabaseService.deleteAddress(selectedModalItem.id);
      await loadAddresses();
      
      if (Platform.OS !== 'web') {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      }
      
      Alert.alert('Success', 'Address deleted successfully');
      setModalVisible(false);
      setSelectedModalItem(null);
      setModalType(null);
    } catch (error) {
      console.error('Error deleting address:', error);
      Alert.alert('Error', 'Failed to delete address. Please try again.');
    } finally {
      setDeleting(false);
      setDeletingId(null);
    }
  };

  const showSuccessModal = () => {
    setModalType('success');
    setModalVisible(true);
  };
  
const updateAddressFromMap = async (region) => {
  try {

    // ✅ CHECK PERMISSION FIRST
    const { status } = await Location.getForegroundPermissionsAsync();

    if (status !== 'granted') {
      console.log("Location permission not granted");
      return;
    }

    const [geo] = await Location.reverseGeocodeAsync({
      latitude: region.latitude,
      longitude: region.longitude,
    });

    if (!geo) return;

    const full = `
${geo.name || ''} ${geo.street || ''},
${geo.subregion || geo.district || ''},
${geo.city || ''} ${geo.region || ''} ${geo.postalCode || ''},
${geo.country || ''}
`.replace(/\s+/g, ' ').trim();

    setSelectedAddress(full);
    setSearchText(full);

  } catch (e) {
    console.log('Reverse geocode error:', e);
  }
};

  const handleLocateMe = async () => {
    let { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission Required', 'Enable location permission.');
      return;
    }

    const loc = await Location.getCurrentPositionAsync({
      accuracy: Location.Accuracy.High,
    });

    const newRegion = {
      ...mapRegion,
      latitude: loc.coords.latitude,
      longitude: loc.coords.longitude,
    };

    setMapRegion(newRegion);
    updateAddressFromMap(newRegion);
  };

  const handleConfirm = () => {
    const final = searchText.trim() || selectedAddress.trim();
    if (!final) return Alert.alert('Pick Location', 'Please choose a location.');
    setSelectedAddress(final);
    setStep(3);
  };

  const handleSave = async () => {
    if (!phoneNumber || !selectedAddress) {
      Alert.alert('Error', 'Missing phone number or address');
      return;
    }

    // Validation for mandatory fields
    if (!house.trim()) {
      Alert.alert('Required', 'House / Flat / Floor No. is required');
      return;
    }
    if (!area.trim()) {
      Alert.alert('Required', 'Apartment / Road / Area is required');
      return;
    }

    const payload = {
      phone_number: phoneNumber.replace(/\s/g, ''),
      label: activeType === 'Others' ? otherLabel : activeType,
      type: activeType,
      full_address: selectedAddress,
      house,
      area,
      instructions,
      is_default: makeDefault,
    };

    setSaving(true);
    
    try {
      if (editingId) {
        // EDIT
        await DatabaseService.updateAddress(editingId, payload);
        Alert.alert('Success', 'Address updated successfully');
      } else {
        // ADD
        await DatabaseService.saveAddress(payload);
        Alert.alert('Success', 'Address saved successfully');
      }

      await loadAddresses();
      resetForm();
      showSuccessModal(); // Show success modal
    } catch (e) {
      console.error('❌ Save failed', e);
      Alert.alert('Error', 'Failed to save address');
    } finally {
      setSaving(false);
    }
  };

  const resetForm = () => {
    setHouse('');
    setArea('');
    setInstructions('');
    setMakeDefault(false);
    setOtherLabel('');
    setEditingId(null);
    setActiveType('Home');
  };

  const getTypeIcon = (type) => {
    const iconConfig = TYPE_ICONS[type] || TYPE_ICONS.Home;
    const IconComponent = iconConfig.icon;
    return <IconComponent name={iconConfig.name} size={20} color={iconConfig.color} />;
  };

  const toggleDefaultAddress = async (addressId) => {
    try {
      // Update in database first
      const result = await DatabaseService.setDefaultAddress(addressId);
      if (result?.success) {
        // Update local state
        setAddresses(prev => 
          prev.map(addr => ({
            ...addr,
            isDefault: addr.id === addressId
          }))
        );
        
        if (Platform.OS !== 'web') {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        }
      }
    } catch (error) {
      console.error('Error setting default address:', error);
      Alert.alert('Error', 'Failed to set default address');
    }
  };

  // Handle back button from map screen - navigate to saved addresses screen (step 1)
  const handleBackFromMap = () => {
    setStep(1);
  };

  const renderAddressCard = (address) => (
    <View key={address.id} style={styles.addressCard}>
      <View style={styles.addressHeader}>
        <View style={styles.addressTypeContainer}>
          {getTypeIcon(address.type)}
          <Text style={styles.addressTitle}>{address.label}</Text>
          {address.isDefault && (
            <View style={styles.defaultBadge}>
              <Text style={styles.defaultBadgeText}>Default</Text>
            </View>
          )}
        </View>
        
        <View style={styles.addressActions}>
          <TouchableOpacity 
            style={styles.editButton}
            onPress={() => handleEditAddress(address)}
            disabled={deleting}
          >
            <MaterialIcons name="edit" size={20} color="#ED7117" />
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.deleteButton}
            onPress={() => handleDeleteAddress(address)}
            disabled={deleting}
          >
            {deleting && deletingId === address.id ? (
              <ActivityIndicator size="small" color="#ED7117" />
            ) : (
              <MaterialIcons name="delete-outline" size={20} color="#ED7117" />
            )}
          </TouchableOpacity>
        </View>
      </View>
      
      <View style={styles.addressDetails}>
        <Text style={styles.addressText}>{address.fullAddress}</Text>
        
       {address.house ? (
  <View style={styles.row}>
    <MaterialIcons name="home" size={16} color="#184080" />
    <Text style={styles.addressSub}> {address.house}</Text>
  </View>
) : null}

{address.area ? (
  <View style={styles.row}>
    <Ionicons name="location-outline" size={16} color="#184080" />
    <Text style={styles.addressSub}> {address.area}</Text>
  </View>
) : null}

{address.instructions ? (
  <View style={styles.row}>
    <MaterialIcons name="info-outline" size={16} color="#184080" />
    <Text style={styles.addressNote}> {address.instructions}</Text>
  </View>
) : null}
      </View>
      
      {/* Set as default address option inside card */}
      {!address.isDefault && (
        <TouchableOpacity 
          style={styles.setDefaultButton}
          onPress={() => toggleDefaultAddress(address.id)}
          disabled={deleting}
        >
          <Text style={styles.setDefaultText}>Set as default address</Text>
        </TouchableOpacity>
      )}
    </View>
  );

  const renderEmptyState = () => (
    <View style={styles.emptyStateContainer}>
      <View style={styles.emptyStateIcon}>
        <MaterialIcons name="location-off" size={80} color="#D1D5DB" />
      </View>
      <Text style={styles.emptyStateTitle}>No Saved Addresses</Text>
      <Text style={styles.emptyStateText}>
        You haven't saved any addresses yet.{'\n'}
        Add your first address to get started.
      </Text>
    </View>
  );

  // Central Modal Component
  const CentralModal = ({ visible, onClose, title, message, type, onConfirm }) => (
    <Modal
      visible={visible}
      transparent={true}
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <Animated.View 
          style={[
            styles.centralModalContent, 
            { opacity: fadeAnim }
          ]}
        >
          {/* Modal Icon based on type */}
          <View style={styles.modalIconContainer}>
            {type === 'edit' && (
              <MaterialIcons name="edit" size={40} color="#ED7117" />
            )}
            {type === 'delete' && (
              <MaterialIcons name="warning" size={40} color="#EF4444" />
            )}
            {type === 'success' && (
              <MaterialIcons name="check-circle" size={40} color="#10B981" />
            )}
          </View>
          
          <Text style={styles.modalTitle}>{title}</Text>
          
          <Text style={styles.modalMessage}>{message}</Text>
          
          <View style={styles.modalButtons}>
            {type === 'success' ? (
              <TouchableOpacity 
                style={[styles.modalButton, styles.successButton]}
                onPress={() => {
                  onClose();
                  setStep(1);
                }}
              >
                <Text style={styles.successButtonText}>OK</Text>
              </TouchableOpacity>
            ) : (
              <>
                <TouchableOpacity 
                  style={[styles.modalButton, styles.cancelButton]}
                  onPress={onClose}
                  disabled={deleting}
                >
                  <Text style={styles.cancelButtonText}>Cancel</Text>
                </TouchableOpacity>
                
                <TouchableOpacity 
                  style={[
                    styles.modalButton, 
                    type === 'edit' ? styles.editConfirmButton : styles.deleteConfirmButton
                  ]}
                  onPress={onConfirm}
                  disabled={deleting}
                >
                  {deleting ? (
                    <ActivityIndicator color="white" size="small" />
                  ) : (
                    <Text style={styles.confirmButtonText}>
                      {type === 'edit' ? 'Edit' : 'Delete'}
                    </Text>
                  )}
                </TouchableOpacity>
              </>
            )}
          </View>
        </Animated.View>
      </View>
    </Modal>
  );

  // Get modal content based on type
  const getModalContent = () => {
    switch (modalType) {
      case 'edit':
        return {
          title: 'Edit Address',
          message: 'Do you want to edit this address?',
          type: 'edit',
          onConfirm: confirmEdit
        };
      case 'delete':
        return {
          title: 'Delete Address',
          message: 'Are you sure you want to delete this address? This action cannot be undone.',
          type: 'delete',
          onConfirm: confirmDelete
        };
      case 'success':
        return {
          title: 'Success!',
          message: 'Address has been saved successfully.',
          type: 'success',
          onConfirm: () => {
            setModalVisible(false);
            setModalType(null);
            setStep(1);
          }
        };
      default:
        return {
          title: '',
          message: '',
          type: '',
          onConfirm: () => {}
        };
    }
  };

  const modalContent = getModalContent();
  const handleBack = () => navigation.goBack();

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar backgroundColor={Colors.white} barStyle="dark-content" />
      <KeyboardAvoidingView
        style={styles.keyboardAvoidingView}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <View style={styles.header}>
          {/* Left Back Button */}
          <TouchableOpacity onPress={step === 2 ? handleBackFromMap : handleBack}>
            <MaterialIcons name="arrow-back-ios" size={24} color="#ED7117" />
          </TouchableOpacity>

          {/* Title */}
          <Text style={styles.headerTitle}>
            {step === 1 ? "Saved Addresses" : step === 2 ? "Select Location" : "Save Address"}
          </Text>
        </View>

        {/* Step 1: List Addresses */}
        {step === 1 && (
          <Animated.ScrollView 
            contentContainerStyle={[
              styles.scrollContent,
              addresses.length === 0 && !loading && { flex: 1, justifyContent: "center" }
            ]}            
            showsVerticalScrollIndicator={false}
            style={{
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }],
            }}
          >
            {loading ? (
              <View style={styles.loaderContainer}>
                <LottieView
                  source={require("../assets/loading.json")}
                  autoPlay
                  loop
                  style={{ width: 300, height: 300 }}
                />
              </View>
            ) : addresses.length === 0 ? (
              renderEmptyState()
            ) : (
              addresses.map(renderAddressCard)
            )}
          </Animated.ScrollView>
        )}

        {step === 1 && !loading && (
          <TouchableOpacity
            style={styles.fab}
            onPress={handleAddAddress}
          >
            <MaterialIcons name="add" size={30} color={Colors.white} />
          </TouchableOpacity>
        )}
        
        {/* Step 2: Map View */}
        {step === 2 && (
          <View style={{ flex: 1 }}>
            {/* Mobile Map */}
            {Platform.OS !== 'web' && MapView ? (
              <MapView
                style={{ flex: 1 }}
                region={mapRegion}
                onRegionChangeComplete={(reg) => {
                  setMapRegion(reg);
                  updateAddressFromMap(reg);
                }}
              >
                <Marker coordinate={mapRegion} />
              </MapView>
            ) : (
              /* Web Fallback - Fixed inline styles with numbers */
              <View
                style={styles.webFallbackContainer}
              >
                <MaterialIcons name="map" size={70} color="#9CA3AF" />
                <Text style={styles.webFallbackTitle}>
                  Map not available on Web
                </Text>
                <Text style={styles.webFallbackSubtitle}>
                  Please use the mobile app to select location 📱
                </Text>
              </View>
            )}

            {/* Bottom Sheet */}
            <View style={styles.mapSheet}>
              <Text style={styles.sheetTitle}>Set location</Text>

              <View style={styles.searchRow}>
                <TextInput
                  style={styles.searchBox}
                  placeholder="Search location"
                  placeholderTextColor={Colors.gray}
                  value={searchText}
                  onChangeText={setSearchText}
                />

                <TouchableOpacity
                  style={styles.searchButton}
                  onPress={() => setSelectedAddress(searchText)}
                >
                  <Text style={styles.searchButtonText}>Search</Text>
                </TouchableOpacity>
              </View>

              <TouchableOpacity style={styles.locateRow} onPress={handleLocateMe}>
                <MaterialIcons name="my-location" size={18} color="#ED7117" />
                <Text style={styles.locateText}>Locate Me</Text>
              </TouchableOpacity>

              {selectedAddress ? (
                <Text style={styles.selectedAddressText}>
                  {selectedAddress}
                </Text>
              ) : null}
            </View>

            {/* Bottom Button */}
            <View style={styles.bottomBar}>
              <TouchableOpacity
                style={styles.standardButton}
                onPress={handleConfirm}
                activeOpacity={0.9}
              >
                <Text style={styles.standardButtonText}>Confirm Location</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* Step 3: Address Details Form */}
        {step === 3 && (
          <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : undefined}
            style={{ flex: 1 }}
          >
            <ScrollView 
              contentContainerStyle={styles.formScrollContent}
              showsVerticalScrollIndicator={false}
            >
              <Text style={styles.locationHeader}>Your Location</Text>
              <Text style={styles.locationText}>{selectedAddress}</Text>

              {/* Mandatory fields - House and Apartment/Area */}
              <View style={styles.modernInputContainer}>
                <TextInput
                  style={styles.modernInput}
                  placeholder="House / Flat / Floor No. *"
                  placeholderTextColor={Colors.gray}
                  value={house}
                  onChangeText={setHouse}
                  editable={!saving}
                />
              </View>

              <View style={styles.modernInputContainer}>
                <TextInput
                  style={styles.modernInput}
                  placeholder="Apartment / Road / Area *"
                  placeholderTextColor={Colors.gray}
                  value={area}
                  onChangeText={setArea}
                  editable={!saving}
                />
              </View>

              <Text style={styles.sectionLabel}>Instructions (optional)</Text>
              <View style={[styles.modernInputContainer, styles.textAreaContainer]}>
                <TextInput
                  style={[styles.modernInput, styles.textArea]}
                  placeholder="e.g. don't turn on AC"
                  placeholderTextColor={Colors.gray}
                  multiline
                  value={instructions}
                  onChangeText={setInstructions}
                  editable={!saving}
                />
              </View>

              <Text style={styles.sectionLabel}>Save As</Text>

              <View style={styles.typeRow}>
                {['Home', 'Work', 'Others'].map((t) => {
                  const active = activeType === t;
                  return (
                    <TouchableOpacity
                      key={t}
                      style={[styles.typeBtn, active && styles.typeBtnActive]}
                      onPress={() => setActiveType(t)}
                      disabled={saving}
                    >
                      {getTypeIcon(t)}
                      <Text style={[styles.typeBtnText, active && styles.typeBtnTextActive]}>
                        {t}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>

              {activeType === 'Others' && (
                <View style={styles.modernInputContainer}>
                  <TextInput
                    style={styles.modernInput}
                    placeholder="Label Name"
                    placeholderTextColor={Colors.gray}
                    value={otherLabel}
                    onChangeText={setOtherLabel}
                    editable={!saving}
                  />
                </View>
              )}

              <TouchableOpacity
                style={styles.defaultRow}
                onPress={() => setMakeDefault(!makeDefault)}
                disabled={saving}
              >
                <View style={[styles.defaultCircle, makeDefault && styles.defaultCircleActive]}>
                  {makeDefault && (
                    <MaterialIcons name="check" size={12} color="#fff" />
                  )}
                </View>
                <Text style={styles.defaultText}>Set as default address</Text>
              </TouchableOpacity>
            </ScrollView>

            <View style={styles.bottomBar}>
              <TouchableOpacity 
                style={[styles.standardButton, saving && styles.disabledButton]} 
                onPress={handleSave}
                activeOpacity={0.9}
                disabled={saving}
              >
                {saving ? (
                  <ActivityIndicator color="white" />
                ) : (
                  <Text style={styles.standardButtonText}>Save Address Details</Text>
                )}
              </TouchableOpacity>
            </View>
          </KeyboardAvoidingView>
        )}

        {/* Central Modal for Edit/Delete/Success */}
        <CentralModal
          visible={modalVisible}
          onClose={() => {
            setModalVisible(false);
            setSelectedModalItem(null);
            setModalType(null);
          }}
          title={modalContent.title}
          message={modalContent.message}
          type={modalContent.type}
          onConfirm={modalContent.onConfirm}
        />
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.white,
  },
  keyboardAvoidingView: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 0.5,
    borderBottomColor: '#F3F4F6',
  },
  headerTitle: {
      ...Typography.h2,
      fontSize: 28,
      fontWeight: '700',
      color: Colors.primary,
      flex: 1,
      textAlign: 'center',
    },
    headerSpacer: {
      width: 44,
    },
  rightContainer: {
    width: 40,
    alignItems: 'flex-end',
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingBottom: 30,
    paddingTop: 16,
  },
  
  // Loader styles
  loaderContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: 700,
  },
  loaderText: {
    marginTop: 20,
    fontSize: 16,
    color: Colors.primary,
    fontWeight: '500',
  },
  
  addressCard: {
    backgroundColor: Colors.white,
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
    borderWidth: 1,
    borderColor: '#F3F4F6',
  },
  addressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  addressTypeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  addressTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.primary,
  },
  defaultBadge: {
    backgroundColor: '#DCFCE7',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
    marginLeft: 8,
  },
  defaultBadgeText: {
    fontSize: 11,
    color: '#166534',
    fontWeight: '600',
  },
  addressActions: {
    flexDirection: 'row',
    gap: 12,
  },
  editButton: {
    padding: 4,
  },
  deleteButton: {
    padding: 4,
  },
  addressDetails: {
    gap: 6,
  },
  addressText: {
    fontSize: 14,
    color: '#374151',
    lineHeight: 20,
  },
  addressSub: {
    fontSize: 13,
    color: '#6B7280',
  },
  addressNote: {
    fontSize: 12,
    color: '#9CA3AF',
  },
  setDefaultButton: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
  },
  setDefaultText: {
    fontSize: 13,
    color: '#184080',
    fontWeight: '500',
  },
emptyStateContainer: {
  flex: 1,
  justifyContent: 'center',
  alignItems: 'center',
},
  emptyStateIcon: {
    marginBottom: 24,
  },
  emptyStateTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#374151',
    marginBottom: 12,
  },
  emptyStateText: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 32,
  },
  addFirstAddressButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: '#184080',
    paddingHorizontal: 24,
    paddingVertical: 14,
    borderRadius: 12,
    shadowColor: '#184080',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  addFirstAddressText: {
    color: Colors.white,
    fontSize: 16,
    fontWeight: '700',
  },
  loadingContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  loadingText: {
    fontSize: 14,
    color: '#6B7280',
  },
  // Map View Styles
  mapSheet: {
    backgroundColor: '#fff',
    padding: 16,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    position: 'absolute',
    bottom: 80,
    left: 0,
    right: 0,
  },
  sheetTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.primary,
    marginBottom: 8,
  },
  searchRow: {
    flexDirection: 'row',
    marginTop: 8,
    gap: 10,
  },
  searchBox: {
    flex: 1,
    backgroundColor: '#F9FAFB',
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    fontSize: 14,
    color: Colors.dark,
  },
  searchButton: {
    backgroundColor: '#184080',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    justifyContent: 'center',
  },
  searchButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  locateRow: {
    flexDirection: 'row',
    marginTop: 12,
    alignItems: 'center',
  },
  locateText: {
    marginLeft: 8,
    color: '#ED7117',
    fontWeight: '600',
    fontSize: 13,
  },
  selectedAddressText: {
    marginTop: 10,
    color: '#555',
    fontSize: 12,
    lineHeight: 18,
  },
  // Web Fallback Styles
  webFallbackContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F3F4F6',
  },
  webFallbackTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginTop: 10,
    color: '#374151',
  },
  webFallbackSubtitle: {
    fontSize: 12,
    marginTop: 6,
    color: '#6B7280',
  },
  // Form Styles
  formScrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 20,
    paddingTop: 20,
  },
  locationHeader: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.primary,
    marginBottom: 4,
  },
  locationText: {
    fontSize: 14,
    color: '#555',
    marginBottom: 20,
    lineHeight: 20,
  },
  modernInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: '#E5E7EB',
    borderRadius: 12,
    paddingHorizontal: 14,
    backgroundColor: '#F9FAFB',
    height: 48,
    width: '100%',
    marginBottom: 14,
  },
  textAreaContainer: {
    height: 90,
    alignItems: 'flex-start',
  },
  textArea: {
    height: 80,
    textAlignVertical: 'top',
    paddingTop: 12,
  },
  modernInput: {
    flex: 1,
    fontSize: 14,
    color: Colors.dark,
    fontWeight: '500',
    paddingVertical: 0,
    height: '100%',
    textAlignVertical: 'center',
    includeFontPadding: false,
  },
  sectionLabel: {
    fontSize: 14,
    color: Colors.primary,
    fontWeight: '600',
    marginBottom: 10,
    marginTop: 6,
  },
  typeRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 16,
  },
  typeBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: '#E5E7EB',
    backgroundColor: '#fff',
  },
  typeBtnActive: {
    backgroundColor: '#FFEDD5',
    borderColor: '#ED7117',
  },
  typeBtnText: {
    fontSize: 13,
    color: '#444',
    fontWeight: '500',
  },
  typeBtnTextActive: {
    color: '#ED7117',
    fontWeight: '600',
  },
  defaultRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 16,
  },
  defaultCircle: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#9CA3AF',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  defaultCircleActive: {
    backgroundColor: '#ED7117',
    borderColor: '#ED7117',
  },
  defaultText: {
    color: '#374151',
    fontWeight: '500',
    fontSize: 14,
  },
  // Standardized Bottom Bar and Button
  bottomBar: {
    padding: 16,
    backgroundColor: Colors.white,
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
  },
  standardButton: {
    backgroundColor: '#184080',
    borderRadius: 12,
    paddingVertical: 14,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#184080',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  standardButtonText: {
    color: Colors.white,
    fontSize: 16,
    fontWeight: '700',
  },
  disabledButton: {
    opacity: 0.6,
  },
  // Central Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  centralModalContent: {
    backgroundColor: Colors.white,
    borderRadius: 20,
    width: '100%',
    padding: 20,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 12,
    elevation: 8,
  },
  modalIconContainer: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 14,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: Colors.primary,
    textAlign: 'center',
    marginBottom: 10,
  },
  modalMessage: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 20,
  },
  modalButtons: {
    flexDirection: 'row',
    gap: 12,
    width: '100%',
  },
  modalButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelButton: {
    backgroundColor: '#F3F4F6',
  },
  cancelButtonText: {
    color: '#6B7280',
    fontSize: 14,
    fontWeight: '600',
  },
  editConfirmButton: {
    backgroundColor: '#184080',
  },
  deleteConfirmButton: {
    backgroundColor: '#184080',
  },
  successButton: {
    backgroundColor: '#10B981',
    width: '100%',
  },
  confirmButtonText: {
    color: Colors.white,
    fontSize: 14,
    fontWeight: '600',
  },
  successButtonText: {
    color: Colors.white,
    fontSize: 14,
    fontWeight: '600',
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 2,
  },
  fab: {
    position: "absolute",
    bottom: 30,
    right: 20,
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: Colors.primary,
    justifyContent: "center",
    alignItems: "center",
    elevation: 8,
    shadowColor: "#000",
    shadowOpacity: 0.2,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 4 },
  },
});