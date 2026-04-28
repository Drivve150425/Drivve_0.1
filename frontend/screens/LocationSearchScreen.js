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
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import MapView, { Marker, PROVIDER_GOOGLE } from 'react-native-maps';
import { GooglePlacesAutocomplete } from 'react-native-google-places-autocomplete';
import { Ionicons } from '@expo/vector-icons';
import * as Location from 'expo-location';
import { Colors } from '../constants/Colors';
import { GMAP_API_KEY } from '../config/config_ip';

export default function LocationSearchScreen({ navigation, route }) {
  const { type } = route.params; // "from" or "to"
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
  const mapRef = useRef(null);
  const slideAnim = useRef(new Animated.Value(300)).current;

  const handleSelect = (data, details = null) => {
    if (!details) return;

    const { lat, lng } = details.geometry.location;
    const location = {
      label: data.description,
      coordinates: [lng, lat], // [lon, lat] for backend compatibility
    };

    // Animate map to selected location
    if (mapRef.current) {
      mapRef.current.animateToRegion({
        latitude: lat,
        longitude: lng,
        latitudeDelta: 0.01,
        longitudeDelta: 0.01,
      });
    }

    setSelectedLocation({ latitude: lat, longitude: lng });

    // Call the onSelect callback
    if (route.params?.onSelect) {
      route.params.onSelect(location);
    }

    // Small delay to show marker before going back
    setTimeout(() => {
      navigation.goBack();
    }, 400);
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
  }, []);

  const confirmMapSelection = () => {
    if (!selectedLocation) return;

    const location = {
      label: confirmAddress || 'Selected Location',
      coordinates: [selectedLocation.longitude, selectedLocation.latitude],
    };

    if (route.params?.onSelect) {
      route.params.onSelect(location);
    }

    setConfirmVisible(false);
    navigation.goBack();
  };

  const cancelMapSelection = () => {
    setConfirmVisible(false);
    setSelectedLocation(null);
    Animated.spring(slideAnim, {
      toValue: 300,
      useNativeDriver: true,
      friction: 8,
    }).start();
  };

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

      setMapRegion({
        latitude,
        longitude,
        latitudeDelta: 0.01,
        longitudeDelta: 0.01,
      });

      if (mapRef.current) {
        mapRef.current.animateToRegion({
          latitude,
          longitude,
          latitudeDelta: 0.01,
          longitudeDelta: 0.01,
        });
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
    } catch (error) {
      Alert.alert('Error', 'Could not get current location. Please try again.');
      console.log('Current location error:', error);
    } finally {
      setLoadingCurrentLocation(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
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

            {/* CURRENT LOCATION BUTTON */}
            <TouchableOpacity
              style={styles.currentLocationButton}
              onPress={getCurrentLocation}
              disabled={loadingCurrentLocation}
            >
              {loadingCurrentLocation ? (
                <ActivityIndicator size="small" color={Colors.primary} />
              ) : (
                <Ionicons name="locate" size={24} color={Colors.primary} />
              )}
            </TouchableOpacity>

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
                <Marker coordinate={selectedLocation} draggable />
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
                placeholder="Search location"
                fetchDetails={true}
                onPress={handleSelect}
                query={{
                  key: GMAP_API_KEY,
                  language: 'en',
                  components: 'country:in',
                }}
                styles={{
                  container: styles.autocompleteContainer,
                  textInput: styles.autocompleteTextInput,
                  listView: styles.autocompleteListView,
                  row: styles.autocompleteRow,
                  separator: styles.autocompleteSeparator,
                }}
                textInputProps={{
                  returnKeyType: 'search',
                  blurOnSubmit: false,
                }}
                debounce={300}
                minLength={2}
                enablePoweredByContainer={false}
              />
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
                    onPress={cancelMapSelection}
                  >
                    <Text style={styles.confirmCancelText}>Cancel</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.confirmOkBtn}
                    onPress={confirmMapSelection}
                  >
                    <Text style={styles.confirmOkText}>Confirm</Text>
                  </TouchableOpacity>
                </View>
              </Animated.View>
            )}
          </View>
        </TouchableWithoutFeedback>
      </KeyboardAvoidingView>
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
    top: 20,
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
  currentLocationButton: {
    position: 'absolute',
    top: 20,
    right: 20,
    zIndex: 10,
    backgroundColor: '#fff',
    padding: 10,
    borderRadius: 30,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  mapHint: {
    position: 'absolute',
    top: 80,
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
  },
  autocompleteContainer: {
    flex: 0,
  },
  autocompleteTextInput: {
    height: 44,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#ddd',
    paddingHorizontal: 12,
    fontSize: 16,
    backgroundColor: '#F9FAFB',
  },
  autocompleteListView: {
    backgroundColor: '#fff',
    borderRadius: 12,
    marginTop: 8,
  },
  autocompleteRow: {
    paddingVertical: 14,
    paddingHorizontal: 12,
  },
  autocompleteSeparator: {
    height: 0.5,
    backgroundColor: '#eee',
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
    color: Colors.dark,
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
    color: Colors.dark,
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
    color: Colors.dark,
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
    color: Colors.white,
  },
});

