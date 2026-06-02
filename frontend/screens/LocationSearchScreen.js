import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  View,
  StyleSheet,
  TouchableOpacity,
  StatusBar,
  KeyboardAvoidingView,
  Platform,
  Keyboard,
  TouchableWithoutFeedback,
  Alert,
  ActivityIndicator,
  Text,
  Animated,
  FlatList,
  Modal,
  TextInput,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import MapView, { Marker, PROVIDER_GOOGLE } from 'react-native-maps';
import { GooglePlacesAutocomplete } from 'react-native-google-places-autocomplete';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import * as Location from 'expo-location';
import * as Haptics from 'expo-haptics';
import { Colors } from '../constants/Colors';
import { GMAP_API_KEY } from '../config/config_ip';
import DatabaseService from '../services/savedaddress_ds';
import { useAuth } from "../context/AuthContext";
import { getRecentHistory, saveToRecentHistory, clearRecentHistory, removeFromRecentHistory } from '../utils/recentHistory';
import { useFocusEffect } from '@react-navigation/native';

export default function LocationSearchScreen({ navigation, route }) {
  const { type } = route.params; // "from" or "to"
  const { user } = useAuth();
  const phoneNumber = user?.phone_number;
  
  // Get the current from/to locations from route params for validation
  const currentFromLocation = route.params?.currentFromLocation;
  const currentToLocation = route.params?.currentToLocation;
  
  const [selectedLocation, setSelectedLocation] = useState(null);
  const [mapRegion, setMapRegion] = useState({
    latitude: 28.6139,
    longitude: 77.2090,
    latitudeDelta: 0.1,
    longitudeDelta: 0.1,
  });
  const [loadingCurrentLocation, setLoadingCurrentLocation] = useState(false);
  const [confirmVisible, setConfirmVisible] = useState(false);
  const [confirmAddress, setConfirmAddress] = useState('');
  const [selectedAddressData, setSelectedAddressData] = useState(null);
  const [savedAddresses, setSavedAddresses] = useState([]);
  const [filteredSavedAddresses, setFilteredSavedAddresses] = useState([]);
  const [savedSearchQuery, setSavedSearchQuery] = useState('');
  const [recentHistory, setRecentHistory] = useState([]);
  const [filteredRecentHistory, setFilteredRecentHistory] = useState([]);
  const [recentSearchQuery, setRecentSearchQuery] = useState('');
  const [showHistoryModal, setShowHistoryModal] = useState(false);
  const [showAllAddressesModal, setShowAllAddressesModal] = useState(false);
  const showAddressesByCategory = (category) => {
  setShowAllAddressesModal(true);
  
  // Filter addresses by the selected category
  const filteredByCategory = savedAddresses.filter(address => 
    address.type === category
  );
  setFilteredSavedAddresses(filteredByCategory);
  
  // Set search query to empty but show category name in a custom way
  setSavedSearchQuery('');
  
  // Optional: You can add a header indicator to show which category is selected
  // For now, we'll just show the filtered list
};

// Update the renderCategoryButton function
const renderCategoryButton = (category) => (
  <TouchableOpacity 
    key={category}
    style={styles.categoryButton}
    onPress={() => showAddressesByCategory(category)}
  >
    <MaterialIcons 
      name={category === 'Home' ? 'home' : category === 'Work' ? 'work' : category === 'Office' ? 'business' : 'location-on'} 
      size={20} 
      color={Colors.primary} 
    />
    <Text style={styles.categoryButtonText}>{category}</Text>
  </TouchableOpacity>
);

  const mapRef = useRef(null);
  const slideAnim = useRef(new Animated.Value(300)).current;
  const autocompleteRef = useRef(null);

  // Group saved addresses by category
  const groupedAddresses = savedAddresses.reduce((groups, address) => {
    const type = address.type || 'Other';
    if (!groups[type]) {
      groups[type] = [];
    }
    groups[type].push(address);
    return groups;
  }, {});
  useFocusEffect(
  useCallback(() => {
    loadSavedAddresses();
    loadRecentHistory();
  }, [phoneNumber])
);

  // Category order for display
  const categoryOrder = ['Home', 'Work', 'Office', 'Other'];
  const sortedCategories = categoryOrder.filter(cat => groupedAddresses[cat]?.length > 0);

  // Load saved addresses and recent history
  useEffect(() => {
    loadSavedAddresses();
    loadRecentHistory();
  }, []);

  // Filter saved addresses when search query changes
  useEffect(() => {
    if (savedSearchQuery.trim()) {
      const filtered = savedAddresses.filter(address => 
        address.label?.toLowerCase().includes(savedSearchQuery.toLowerCase()) ||
        address.full_address?.toLowerCase().includes(savedSearchQuery.toLowerCase()) ||
        address.house?.toLowerCase().includes(savedSearchQuery.toLowerCase()) ||
        address.area?.toLowerCase().includes(savedSearchQuery.toLowerCase())
      );
      setFilteredSavedAddresses(filtered);
    } else {
      setFilteredSavedAddresses(savedAddresses);
    }
  }, [savedSearchQuery, savedAddresses]);

  // Filter recent history when search query changes
  useEffect(() => {
    if (recentSearchQuery.trim()) {
      const filtered = recentHistory.filter(item => 
        item.label?.toLowerCase().includes(recentSearchQuery.toLowerCase())
      );
      setFilteredRecentHistory(filtered);
    } else {
      setFilteredRecentHistory(recentHistory);
    }
  }, [recentSearchQuery, recentHistory]);

  const loadSavedAddresses = async () => {
    try {
      if (!phoneNumber) return;
      const res = await DatabaseService.getAddresses(phoneNumber.replace(/\s/g, ''));
      if (Array.isArray(res)) {
        // Sort by default first, then by ID
        const sorted = res.sort((a, b) => {
          if (a.is_default) return -1;
          if (b.is_default) return 1;
          return b.id - a.id;
        });
        setSavedAddresses(sorted);
        setFilteredSavedAddresses(sorted);
      }
    } catch (error) {
      console.error('Error loading saved addresses:', error);
    }
  };

  const loadRecentHistory = async () => {
    try {
      if (!phoneNumber) {
        console.log('No phone number available, skipping recent history load');
        setRecentHistory([]);
        setFilteredRecentHistory([]);
        return;
      }
      const history = await getRecentHistory(phoneNumber);
      setRecentHistory(history);
      setFilteredRecentHistory(history);
    } catch (error) {
      console.error('Error loading recent history:', error);
    }
  };

  const saveToRecentHistoryWrapper = async (location) => {
    try {
      if (!phoneNumber) {
        console.log('No phone number available, skipping save to recent history');
        return;
      }
      const updatedHistory = await saveToRecentHistory({
        ...location,
        searchType: type // 'from' or 'to'
      }, phoneNumber);
      setRecentHistory(updatedHistory);
      setFilteredRecentHistory(updatedHistory);
    } catch (error) {
      console.error('Error saving to recent history:', error);
    }
  };

  // Function to check if two locations are the same
  const isSameLocation = (location1, location2) => {
    if (!location1 || !location2) return false;
    
    // Compare coordinates if available
    if (location1.coordinates && location2.coordinates) {
      const [lng1, lat1] = location1.coordinates;
      const [lng2, lat2] = location2.coordinates;
      // Compare with small tolerance (approx 100 meters)
      const tolerance = 0.001;
      return Math.abs(lat1 - lat2) < tolerance && Math.abs(lng1 - lng2) < tolerance;
    }
    
    // Compare addresses as fallback
    if (location1.label && location2.label) {
      return location1.label.toLowerCase().trim() === location2.label.toLowerCase().trim();
    }
    
    return false;
  };

  const validateAndSelect = (location) => {
    // Check if trying to set "From" location same as existing "To" location
    if (type === 'from' && currentToLocation) {
      if (isSameLocation(location, currentToLocation)) {
        Alert.alert(
          "Same Location",
          "Pickup and Drop locations cannot be the same. Please select a different pickup location.",
          [{ text: "OK" }]
        );
        return false;
      }
    }
    
    // Check if trying to set "To" location same as existing "From" location
    if (type === 'to' && currentFromLocation) {
      if (isSameLocation(location, currentFromLocation)) {
        Alert.alert(
          "Same Location",
          "Pickup and Drop locations cannot be the same. Please select a different drop location.",
          [{ text: "OK" }]
        );
        return false;
      }
    }
    
    return true;
  };

  const handleSelect = async (data, details = null) => {
    if (!details) return;

    const { lat, lng } = details.geometry.location;
    const address = data.description;
    
    const locationData = {
      label: address,
      coordinates: [lng, lat],
      full_address: address,
      latitude: lat,
      longitude: lng,
    };

    // Validate location
    if (!validateAndSelect(locationData)) {
      return;
    }

    // Show confirmation before proceeding
    setConfirmAddress(address);
    setSelectedLocation({ latitude: lat, longitude: lng });
    setSelectedAddressData(locationData);
    
    // Animate map to selected location
    if (mapRef.current) {
      mapRef.current.animateToRegion({
        latitude: lat,
        longitude: lng,
        latitudeDelta: 0.01,
        longitudeDelta: 0.01,
      });
    }

    // Show confirmation modal
    setConfirmVisible(true);
    Animated.spring(slideAnim, {
      toValue: 0,
      useNativeDriver: true,
      friction: 8,
      tension: 40,
    }).start();
  };
const confirmSelection = () => {
    if (!selectedLocation || !confirmAddress) return;

    // ✅ Ensure coordinates are properly formatted
    const location = {
        label: confirmAddress,
        coordinates: [selectedLocation.longitude, selectedLocation.latitude], // [lng, lat] format
        full_address: confirmAddress,
        latitude: selectedLocation.latitude,
        longitude: selectedLocation.longitude,
        // Also provide a separate coords object for compatibility
        coords: {
            latitude: selectedLocation.latitude,
            longitude: selectedLocation.longitude
        }
    };

    console.log('📍 Confirming location:', location);
    console.log('📌 Coordinates:', location.coordinates);

    // Final validation before confirming
    if (!validateAndSelect(location)) {
        cancelSelection();
        return;
    }

    // Save to recent history with phone number
    if (phoneNumber) {
        saveToRecentHistoryWrapper(location);
    }
    
    // Provide haptic feedback
    if (Platform.OS !== 'web') {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }

    // ✅ Call the onSelect callback with proper location data
    if (route.params?.onSelect) {
        console.log('✅ Calling onSelect callback with location');
        route.params.onSelect(location);
    }

    setConfirmVisible(false);
    navigation.goBack();
};

  const cancelSelection = () => {
    setConfirmVisible(false);
    setSelectedLocation(null);
    setConfirmAddress('');
    setSelectedAddressData(null);
    Animated.spring(slideAnim, {
      toValue: 300,
      useNativeDriver: true,
      friction: 8,
    }).start();
  };

  const reverseGeocode = async (lat, lng) => {
    try {
      const response = await fetch(
        `https://maps.googleapis.com/maps/api/geocode/json?latlng=${lat},${lng}&key=${GMAP_API_KEY}`
      );
      const data = await response.json();
      if (data.results && data.results.length > 0) {
        return data.results[0].formatted_address;
      }
      return `${lat.toFixed(4)}, ${lng.toFixed(4)}`;
    } catch (e) {
      console.log('Reverse geocode error:', e);
      return `${lat.toFixed(4)}, ${lng.toFixed(4)}`;
    }
  };

  const handleMapLongPress = useCallback(async (e) => {
    const { latitude, longitude } = e.nativeEvent.coordinate;
    
    // Create temporary location for validation
    const tempLocation = {
      label: "Selected location",
      coordinates: [longitude, latitude],
      latitude: latitude,
      longitude: longitude,
    };
    
    // Validate location
    if (!validateAndSelect(tempLocation)) {
      return;
    }
    
    setSelectedLocation({ latitude, longitude });
    setConfirmAddress('Loading address...');
    setConfirmVisible(true);

    Animated.spring(slideAnim, {
      toValue: 0,
      useNativeDriver: true,
      friction: 8,
      tension: 40,
    }).start();

    const address = await reverseGeocode(latitude, longitude);
    setConfirmAddress(address);
  }, [currentFromLocation, currentToLocation, type]);

  const getCurrentLocation = async () => {
    setLoadingCurrentLocation(true);
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission Denied', 'Location permission is required to use this feature.');
        return;
      }

      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.High,
      });

      const { latitude, longitude } = location.coords;

      // Get address from coordinates
      const address = await reverseGeocode(latitude, longitude);
      
      const locationData = {
        label: address,
        coordinates: [longitude, latitude],
        full_address: address,
        latitude: latitude,
        longitude: longitude,
      };

      // Validate location
      if (!validateAndSelect(locationData)) {
        setLoadingCurrentLocation(false);
        return;
      }

      // Animate map to current location
      if (mapRef.current) {
        mapRef.current.animateToRegion({
          latitude,
          longitude,
          latitudeDelta: 0.01,
          longitudeDelta: 0.01,
        });
      }
      
      setSelectedLocation({ latitude, longitude });
      setConfirmAddress(address);
      setConfirmVisible(true);

      Animated.spring(slideAnim, {
        toValue: 0,
        useNativeDriver: true,
        friction: 8,
        tension: 40,
      }).start();

      if (Platform.OS !== 'web') {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      }
    } catch (error) {
      Alert.alert('Error', 'Could not get current location. Please try again.');
      console.log('Current location error:', error);
    } finally {
      setLoadingCurrentLocation(false);
    }
  };

  // Function to geocode an address to get coordinates
  const geocodeAddress = async (address) => {
    try {
      const response = await fetch(
        `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(address)}&key=${GMAP_API_KEY}`
      );
      const data = await response.json();
      if (data.results && data.results.length > 0) {
        const { lat, lng } = data.results[0].geometry.location;
        return { latitude: lat, longitude: lng };
      }
      return null;
    } catch (error) {
      console.error('Geocode error:', error);
      return null;
    }
  };

 const selectSavedAddress = async (address) => {
  setShowAllAddressesModal(false);
  setSavedSearchQuery('');
  
  try {
    // If address has stored coordinates, use them
    if (address.latitude && address.longitude) {
      const coords = {
        latitude: address.latitude,
        longitude: address.longitude
      };
      
      const locationData = {
        label: address.full_address,
        coordinates: [address.longitude, address.latitude],
        full_address: address.full_address,
        latitude: address.latitude,
        longitude: address.longitude,
      };
      
      // Validate location
      if (!validateAndSelect(locationData)) {
        return;
      }
      
      setSelectedLocation(coords);
      setConfirmAddress(address.full_address);
      setConfirmVisible(true);
      Animated.spring(slideAnim, {
        toValue: 0,
        useNativeDriver: true,
        friction: 8,
        tension: 40,
      }).start();
      
      // Animate map to the saved location
      if (mapRef.current) {
        mapRef.current.animateToRegion({
          latitude: coords.latitude,
          longitude: coords.longitude,
          latitudeDelta: 0.01,
          longitudeDelta: 0.01,
        });
      }
    } else {
      // If no coordinates stored, geocode the address
      const coords = await geocodeAddress(address.full_address);
      
      if (coords) {
        const locationData = {
          label: address.full_address,
          coordinates: [coords.longitude, coords.latitude],
          full_address: address.full_address,
          latitude: coords.latitude,
          longitude: coords.longitude,
        };
        
        // Validate location
        if (!validateAndSelect(locationData)) {
          return;
        }
        
        setSelectedLocation(coords);
        setConfirmAddress(address.full_address);
        setConfirmVisible(true);
        Animated.spring(slideAnim, {
          toValue: 0,
          useNativeDriver: true,
          friction: 8,
          tension: 40,
        }).start();
        
        // Animate map to the geocoded location
        if (mapRef.current) {
          mapRef.current.animateToRegion({
            latitude: coords.latitude,
            longitude: coords.longitude,
            latitudeDelta: 0.01,
            longitudeDelta: 0.01,
          });
        }
      } else {
        Alert.alert('Error', 'Could not find location on map');
      }
    }
    
    // Refresh saved addresses list after selection
    await loadSavedAddresses();
    
  } catch (error) {
    console.error('Error selecting saved address:', error);
    Alert.alert('Error', 'Could not load the saved address location');
  }
};
  const selectRecentHistory = async (historyItem) => {
    setShowHistoryModal(false);
    setRecentSearchQuery('');
    
    try {
      // If history item has coordinates, use them
      if (historyItem.latitude && historyItem.longitude) {
        const locationData = {
          label: historyItem.label,
          coordinates: [historyItem.longitude, historyItem.latitude],
          full_address: historyItem.full_address || historyItem.label,
          latitude: historyItem.latitude,
          longitude: historyItem.longitude,
        };
        
        // Validate location
        if (!validateAndSelect(locationData)) {
          return;
        }
        
        setSelectedLocation({
          latitude: historyItem.latitude,
          longitude: historyItem.longitude
        });
        setConfirmAddress(historyItem.label);
        setConfirmVisible(true);
        Animated.spring(slideAnim, {
          toValue: 0,
          useNativeDriver: true,
          friction: 8,
          tension: 40,
        }).start();
        
        // Animate map to the location
        if (mapRef.current) {
          mapRef.current.animateToRegion({
            latitude: historyItem.latitude,
            longitude: historyItem.longitude,
            latitudeDelta: 0.01,
            longitudeDelta: 0.01,
          });
        }
        
        // Optionally update timestamp when selected again
        if (phoneNumber) {
          await saveToRecentHistoryWrapper(locationData);
          await loadRecentHistory(); // Refresh list to update order
        }
      } else {
        // If no coordinates stored, geocode the address
        const coords = await geocodeAddress(historyItem.label);
        
        if (coords) {
          const locationData = {
            label: historyItem.label,
            coordinates: [coords.longitude, coords.latitude],
            full_address: historyItem.label,
            latitude: coords.latitude,
            longitude: coords.longitude,
          };
          
          // Validate location
          if (!validateAndSelect(locationData)) {
            return;
          }
          
          setSelectedLocation(coords);
          setConfirmAddress(historyItem.label);
          setConfirmVisible(true);
          Animated.spring(slideAnim, {
            toValue: 0,
            useNativeDriver: true,
            friction: 8,
            tension: 40,
          }).start();
          
          // Animate map to the geocoded location
          if (mapRef.current) {
            mapRef.current.animateToRegion({
              latitude: coords.latitude,
              longitude: coords.longitude,
              latitudeDelta: 0.01,
              longitudeDelta: 0.01,
            });
          }
          
          // Save with coordinates for future use
          if (phoneNumber) {
            await saveToRecentHistoryWrapper(locationData);
            await loadRecentHistory();
          }
        } else {
          Alert.alert('Error', 'Could not find location on map');
        }
      }
    } catch (error) {
      console.error('Error selecting recent history:', error);
      Alert.alert('Error', 'Could not load the recent location');
    }
  };

  const handleClearAllRecent = async () => {
    Alert.alert(
      'Clear History',
      'Are you sure you want to clear all recent search history?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Clear',
          style: 'destructive',
          onPress: async () => {
            if (!phoneNumber) return;
            await clearRecentHistory(phoneNumber);
            await loadRecentHistory();
          }
        }
      ]
    );
  };

  const handleRemoveHistoryItem = async (index) => {
    Alert.alert(
      'Remove',
      'Remove this item from history?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Remove',
          style: 'destructive',
          onPress: async () => {
            if (!phoneNumber) return;
            const updatedHistory = await removeFromRecentHistory(index, phoneNumber);
            setRecentHistory(updatedHistory);
            setFilteredRecentHistory(updatedHistory);
          }
        }
      ]
    );
  };

  const clearSavedSearch = () => {
    setSavedSearchQuery('');
  };

  const clearRecentSearch = () => {
    setRecentSearchQuery('');
  };

  const renderSavedAddressItem = ({ item }) => (
    <TouchableOpacity
      style={styles.addressItem}
      onPress={() => selectSavedAddress(item)}
    >
      <View style={styles.addressIconContainer}>
        <MaterialIcons 
          name={item.type === 'Home' ? 'home' : item.type === 'Work' ? 'work' : item.type === 'Office' ? 'business' : 'location-on'} 
          size={20} 
          color={Colors.primary} 
        />
      </View>
      <View style={styles.addressItemContent}>
        <Text style={styles.addressItemLabel}>{item.label}</Text>
        <Text style={styles.addressItemFull} numberOfLines={1}>
          {item.full_address}
        </Text>
      </View>
      {item.is_default && (
        <View style={styles.defaultBadge}>
          <Text style={styles.defaultBadgeText}>Default</Text>
        </View>
      )}
    </TouchableOpacity>
  );

  const renderRecentHistoryItem = ({ item, index }) => (
    <TouchableOpacity
      style={styles.addressItem}
      onPress={() => selectRecentHistory(item)}
      onLongPress={() => handleRemoveHistoryItem(index)}
      delayLongPress={500}
    >
      <View style={styles.addressIconContainer}>
        <Ionicons name="time-outline" size={20} color={Colors.gray} />
      </View>
      <View style={styles.addressItemContent}>
        <Text style={styles.addressItemLabel} numberOfLines={1}>
          {item.label}
        </Text>
        {item.searchType && (
          <Text style={styles.historyType}>
            {item.searchType === 'from' ? 'Pickup' : 'Drop'} location
          </Text>
        )}
      </View>
      <TouchableOpacity 
        onPress={() => handleRemoveHistoryItem(index)}
        style={styles.deleteHistoryButton}
      >
        <Ionicons name="close-circle" size={20} color={Colors.gray} />
      </TouchableOpacity>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 0}
      >
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <View style={{ flex: 1 }}>

            {/* BACK BUTTON */}
            <TouchableOpacity
              style={styles.backButton}
              onPress={() => navigation.goBack()}
            >
              <Ionicons name="chevron-back" size={24} color={Colors.secondary} />
            </TouchableOpacity>

            {/* MAP CONTROL BUTTONS GROUP */}
            <View style={styles.mapControlButtons}>
              {/* Current Location Button */}
              <TouchableOpacity
                style={styles.mapControlButton}
                onPress={getCurrentLocation}
                disabled={loadingCurrentLocation}
              >
                {loadingCurrentLocation ? (
                  <ActivityIndicator size="small" color={Colors.primary} />
                ) : (
                  <MaterialIcons name="my-location" size={24} color={Colors.primary} />
                )}
              </TouchableOpacity>
            </View>

            {/* GOOGLE MAP BACKGROUND */}
            <MapView
              ref={mapRef}
              provider={PROVIDER_GOOGLE}
              style={StyleSheet.absoluteFillObject}
              region={mapRegion}
              onRegionChangeComplete={setMapRegion}
              onLongPress={handleMapLongPress}
            >
              {selectedLocation && (
                <Marker 
                  coordinate={selectedLocation} 
                  draggable 
                  onDragEnd={(e) => {
                    const { latitude, longitude } = e.nativeEvent.coordinate;
                    setSelectedLocation({ latitude, longitude });
                    reverseGeocode(latitude, longitude).then(setConfirmAddress);
                  }}
                />
              )}
            </MapView>

            {/* MAP TAP HINT */}
            <View style={styles.mapHint}>
              <Ionicons name="hand-left-outline" size={16} color={Colors.white} />
              <Text style={styles.mapHintText}>Long press to select location</Text>
            </View>

            {/* SEARCH BAR */}
            <View style={styles.searchContainer}>
              <GooglePlacesAutocomplete
                ref={autocompleteRef}
                placeholder={`Search ${type === 'from' ? 'pickup' : 'drop'} location`}
                fetchDetails={true}
                onPress={handleSelect}
                query={{
                  key: GMAP_API_KEY,
                  language: 'en',
                  components: 'country:in',
                }}
                styles={{
                  container: styles.autocompleteContainer,
                  textInputContainer: styles.autocompleteTextInputContainer,
                  textInput: styles.autocompleteTextInput,
                  listView: styles.autocompleteListView,
                  row: styles.autocompleteRow,
                  separator: styles.autocompleteSeparator,
                  description: styles.autocompleteDescription,
                }}
                textInputProps={{
                  returnKeyType: 'search',
                  blurOnSubmit: false,
                  placeholderTextColor: Colors.gray,
                  autoFocus: false, // This prevents auto-focus
                }}
                debounce={300}
                minLength={2}
                enablePoweredByContainer={false}
                nearbyPlacesAPI="GooglePlacesSearch"
                autoFocus={false} // Explicitly set autoFocus to false
              />

              {/* Use My Current Location Button Below Search Bar */}
              <TouchableOpacity 
                style={styles.currentLocationButton}
                onPress={getCurrentLocation}
                disabled={loadingCurrentLocation}
              >
                <View style={styles.currentLocationIconContainer}>
                  {loadingCurrentLocation ? (
                    <ActivityIndicator size="small" color={Colors.primary} />
                  ) : (
                    <MaterialIcons name="my-location" size={20} color={Colors.primary} />
                  )}
                </View>
                <View style={styles.currentLocationContent}>
                  <Text style={styles.currentLocationLabel}>Use my current location</Text>
                  <Text style={styles.currentLocationSubtext}>
                    Get your current location automatically
                  </Text>
                </View>
                <Ionicons name="chevron-forward" size={20} color={Colors.gray} />
              </TouchableOpacity>

              {/* Recent History Section */}
              {recentHistory.length > 0 && (
                <View style={styles.sectionContainer}>
                  <TouchableOpacity 
                    style={styles.sectionHeader}
                    onPress={() => setShowHistoryModal(true)}
                  >
                    <Text style={styles.sectionTitle}>Recent History</Text>
                    <Ionicons name="chevron-forward" size={20} color={Colors.primary} />
                  </TouchableOpacity>
                  <FlatList
                    data={recentHistory.slice(0, 3)}
                    renderItem={renderRecentHistoryItem}
                    keyExtractor={(item, index) => `${item.timestamp}-${index}`}
                    scrollEnabled={false}
                  />
                </View>
              )}

              {/* Saved Addresses Section - Category Buttons with More */}
              {savedAddresses.length > 0 && sortedCategories.length > 0 && (
                <View style={styles.sectionContainer}>
                  <Text style={styles.sectionTitle}>Saved Addresses</Text>
                  <ScrollView 
                    horizontal 
                    showsHorizontalScrollIndicator={false} 
                    style={styles.categoryScroll}
                    contentContainerStyle={styles.categoryScrollContent}
                  >
                    {sortedCategories.map(category => renderCategoryButton(category))}
                    <TouchableOpacity 
                      style={styles.moreButton}
                      onPress={() => setShowAllAddressesModal(true)}
                    >
                      <Text style={styles.moreButtonText}>More</Text>
                    </TouchableOpacity>
                  </ScrollView>
                </View>
              )}
            </View>

            {/* CONFIRM LOCATION BOTTOM SHEET */}
            {confirmVisible && (
              <Animated.View
                style={[
                  styles.confirmSheet,
                  { transform: [{ translateY: slideAnim }] },
                ]}
              >
                <View style={styles.confirmHandle} />
                <Text style={styles.confirmTitle}>Confirm Location</Text>
                <View style={styles.confirmAddressBox}>
                  <Ionicons name="location" size={20} color={Colors.primary} />
                  <Text style={styles.confirmAddressText} numberOfLines={2}>
                    {confirmAddress}
                  </Text>
                </View>
                <View style={styles.confirmButtons}>
                  <TouchableOpacity
                    style={styles.confirmCancelBtn}
                    onPress={cancelSelection}
                  >
                    <Text style={styles.confirmCancelText}>Cancel</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.confirmOkBtn}
                    onPress={confirmSelection}
                  >
                    <Text style={styles.confirmOkText}>Confirm</Text>
                  </TouchableOpacity>
                </View>
              </Animated.View>
            )}
          </View>
        </TouchableWithoutFeedback>
      </KeyboardAvoidingView>

      {/* Recent History Full Modal with Search Bar */}
      <Modal
        visible={showHistoryModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => {
          setShowHistoryModal(false);
          setRecentSearchQuery('');
        }}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Recent History</Text>
              <TouchableOpacity onPress={() => {
                setShowHistoryModal(false);
                setRecentSearchQuery('');
              }}>
                <Ionicons name="close" size={24} color={Colors.dark} />
              </TouchableOpacity>
            </View>

            {/* Search Bar for Recent History */}
            <View style={styles.modalSearchContainer}>
              <View style={styles.modalSearchWrapper}>
                <Ionicons name="search-outline" size={20} color={Colors.gray} style={styles.modalSearchIcon} />
                <TextInput
                  style={styles.modalSearchInput}
                  placeholder="Search recent history..."
                  placeholderTextColor={Colors.gray}
                  value={recentSearchQuery}
                  onChangeText={setRecentSearchQuery}
                  returnKeyType="search"
                />
                {recentSearchQuery.length > 0 && (
                  <TouchableOpacity onPress={clearRecentSearch} style={styles.modalClearIcon}>
                    <Ionicons name="close-circle" size={20} color={Colors.gray} />
                  </TouchableOpacity>
                )}
              </View>
              {recentSearchQuery.length > 0 && (
                <Text style={styles.modalSearchResultCount}>
                  Found {filteredRecentHistory.length} {filteredRecentHistory.length === 1 ? 'result' : 'results'}
                </Text>
              )}
            </View>

            {filteredRecentHistory.length > 0 ? (
              <FlatList
                data={filteredRecentHistory}
                renderItem={renderRecentHistoryItem}
                keyExtractor={(item, index) => `${item.timestamp}-${index}`}
                showsVerticalScrollIndicator={false}
              />
            ) : (
              <View style={styles.modalEmptyContainer}>
                <Ionicons name="time-outline" size={60} color={Colors.gray} />
                <Text style={styles.modalEmptyTitle}>No recent searches found</Text>
                <Text style={styles.modalEmptyText}>
                  {recentSearchQuery ? `No results matching "${recentSearchQuery}"` : "No recent searches available"}
                </Text>
              </View>
            )}

            {/* Clear All Button at Bottom Center */}
            {recentHistory.length > 0 && (
              <TouchableOpacity 
                style={styles.clearAllButtonBottom}
                onPress={handleClearAllRecent}
              >
                <Ionicons name="trash-outline" size={18} color="#fff" />
                <Text style={styles.clearAllTextBottom}>Clear All History</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
      </Modal>

      {/* All Saved Addresses Modal with Search Bar */}
      <Modal
        visible={showAllAddressesModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => {
          setShowAllAddressesModal(false);
          setSavedSearchQuery('');
        }}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <View>
                <Text style={styles.modalTitle}>
                  {savedSearchQuery ? 'Search Results' : 
                   filteredSavedAddresses.length !== savedAddresses.length ? 
                   `${filteredSavedAddresses[0]?.type || 'Filtered'} Addresses` : 
                   'All Saved Addresses'}
                </Text>
              </View>
              <TouchableOpacity onPress={() => {
                setShowAllAddressesModal(false);
                setSavedSearchQuery('');
                setFilteredSavedAddresses(savedAddresses);
              }}>
                <Ionicons name="close" size={24} color={Colors.dark} />
              </TouchableOpacity>
            </View>
            
            {/* Search Bar for Saved Addresses */}
            <View style={styles.modalSearchContainer}>
              <View style={styles.modalSearchWrapper}>
                <Ionicons name="search-outline" size={20} color={Colors.gray} style={styles.modalSearchIcon} />
                <TextInput
                  style={styles.modalSearchInput}
                  placeholder="Search saved addresses..."
                  placeholderTextColor={Colors.gray}
                  value={savedSearchQuery}
                  onChangeText={setSavedSearchQuery}
                  returnKeyType="search"
                />
                {savedSearchQuery.length > 0 && (
                  <TouchableOpacity onPress={clearSavedSearch} style={styles.modalClearIcon}>
                    <Ionicons name="close-circle" size={20} color={Colors.gray} />
                  </TouchableOpacity>
                )}
              </View>
              {savedSearchQuery.length > 0 && (
                <Text style={styles.modalSearchResultCount}>
                  Found {filteredSavedAddresses.length} {filteredSavedAddresses.length === 1 ? 'result' : 'results'}
                </Text>
              )}
            </View>

            {filteredSavedAddresses.length > 0 ? (
              <FlatList
                data={filteredSavedAddresses}
                renderItem={renderSavedAddressItem}
                keyExtractor={(item) => item.id?.toString() || item.label}
                showsVerticalScrollIndicator={false}
              />
            ) : (
              <View style={styles.modalEmptyContainer}>
                <MaterialIcons name="location-off" size={60} color={Colors.gray} />
                <Text style={styles.modalEmptyTitle}>No saved addresses found</Text>
                <Text style={styles.modalEmptyText}>
                  {savedSearchQuery ? `No addresses matching "${savedSearchQuery}"` : "You haven't saved any addresses yet"}
                </Text>
              </View>
            )}

            {/* Add Address Button at Bottom Right */}
            <TouchableOpacity 
              style={styles.addAddressButton}
              onPress={() => {
                setShowAllAddressesModal(false);
                navigation.navigate('SavedAddressScreen', {
                  onGoBack: () => {
                    // Refresh addresses when coming back from add address screen
                    loadSavedAddresses();
                  }
                });
              }}
            >
              <MaterialIcons name="add" size={24} color="#fff" />
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  backButton: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 60 : 40,
    left: 20,
    zIndex: 10,
    backgroundColor: '#fff',
    padding: 8,
    borderRadius: 30,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  mapControlButtons: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 60 : 40,
    right: 20,
    zIndex: 10,
    gap: 12,
  },
  mapControlButton: {
    backgroundColor: '#fff',
    padding: 12,
    borderRadius: 40,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    alignItems: 'center',
    justifyContent: 'center',
    width: 48,
    height: 48,
  },
  mapHint: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 110 : 90,
    alignSelf: 'center',
    zIndex: 5,
    backgroundColor: 'rgba(0,0,0,0.6)',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  mapHintText: {
    color: Colors.white,
    fontSize: 12,
    fontWeight: '600',
  },
  searchContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    maxHeight: '70%',
    backgroundColor: '#fff',
    borderTopLeftRadius: 25,
    borderTopRightRadius: 25,
    padding: 20,
    elevation: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
  },
  autocompleteContainer: {
    flex: 0,
    zIndex: 100,
  },
  autocompleteTextInputContainer: {
    backgroundColor: 'transparent',
  },
  autocompleteTextInput: {
    height: 50,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    paddingHorizontal: 12,
    fontSize: 16,
    backgroundColor: '#F9FAFB',
    fontFamily: Platform.OS === 'ios' ? 'System' : 'Roboto',
  },
  autocompleteListView: {
    backgroundColor: '#fff',
    borderRadius: 12,
    marginTop: 8,
    maxHeight: 200,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  autocompleteRow: {
    paddingVertical: 14,
    paddingHorizontal: 12,
  },
  autocompleteSeparator: {
    height: 0.5,
    backgroundColor: '#F3F4F6',
  },
  autocompleteDescription: {
    fontSize: 14,
    color: '#374151',
  },
  currentLocationButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    marginTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
  },
  currentLocationIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#FFF7ED',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  currentLocationContent: {
    flex: 1,
  },
  currentLocationLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.primary,
    marginBottom: 2,
  },
  currentLocationSubtext: {
    fontSize: 11,
    color: '#6B7280',
  },
  sectionContainer: {
    marginTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
    paddingTop: 12,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.primary,
  },
  categoryScroll: {
    marginVertical: 8,
  },
  categoryScrollContent: {
    paddingRight: 20,
  },
  categoryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F3F4F6',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 25,
    marginRight: 12,
    gap: 8,
  },
  categoryButtonText: {
    fontSize: 14,
    color: Colors.primary,
    fontWeight: '600',
  },
  addressItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 0.5,
    borderBottomColor: '#F3F4F6',
  },
  addressIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#FFF7ED',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  addressItemContent: {
    flex: 1,
  },
  addressItemLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 2,
  },
  addressItemFull: {
    fontSize: 12,
    color: '#6B7280',
  },
  defaultBadge: {
    backgroundColor: '#DCFCE7',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
  },
  defaultBadgeText: {
    fontSize: 10,
    color: '#166534',
    fontWeight: '600',
  },
  deleteHistoryButton: {
    padding: 8,
  },
  historyType: {
    fontSize: 11,
    color: '#9CA3AF',
    marginTop: 2,
  },
  confirmSheet: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#fff',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: Platform.OS === 'ios' ? 34 : 24,
    elevation: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    zIndex: 20,
  },
  confirmHandle: {
    width: 40,
    height: 5,
    borderRadius: 3,
    backgroundColor: '#D1D5DB',
    alignSelf: 'center',
    marginBottom: 14,
  },
  confirmTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: 14,
  },
  confirmAddressBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F3F4F6',
    borderRadius: 14,
    padding: 14,
    marginBottom: 16,
    gap: 10,
  },
  confirmAddressText: {
    flex: 1,
    fontSize: 14,
    color: '#1F2937',
    fontWeight: '500',
    lineHeight: 20,
  },
  confirmButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  confirmCancelBtn: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 14,
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
  },
  confirmCancelText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#1F2937',
  },
  confirmOkBtn: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 14,
    backgroundColor: Colors.primary,
    alignItems: 'center',
  },
  confirmOkText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#fff',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 20,
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1F2937',
  },
  modalSearchContainer: {
    marginBottom: 16,
  },
  modalSearchWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    paddingHorizontal: 12,
    height: 44,
  },
  modalSearchIcon: {
    marginRight: 8,
  },
  modalSearchInput: {
    flex: 1,
    fontSize: 15,
    color: '#1F2937',
    paddingVertical: 0,
  },
  modalClearIcon: {
    padding: 4,
  },
  modalSearchResultCount: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 8,
    marginLeft: 4,
  },
  modalEmptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  modalEmptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#374151',
    marginTop: 16,
    marginBottom: 8,
  },
  modalEmptyText: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
  },
  clearAllButtonBottom: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.primary,
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 30,
    marginTop: 20,
    marginBottom: Platform.OS === 'ios' ? 10 : 20,
    gap: 8,
    alignSelf: 'center',
  },
  clearAllTextBottom: {
    fontSize: 14,
    color: '#fff',
    fontWeight: '600',
  },
  addAddressButton: {
    position: 'absolute',
    bottom: 20,
    right: 20,
    backgroundColor: Colors.primary,
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
  },
  moreButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F3F4F6',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 25,
    marginRight: 12,
    gap: 8,
  },
  moreButtonText: {
    fontSize: 14,
    color: Colors.primary,
    fontWeight: '600',
  },
  clearFilterButton: {
    marginTop: 4,
  },
  clearFilterText: {
    fontSize: 12,
    color: Colors.primary,
    fontWeight: '500',
  },
});