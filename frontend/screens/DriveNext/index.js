import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Platform,
  StyleSheet,
  StatusBar
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import LottieView from "lottie-react-native";
import { Colors, Typography } from '../../constants/Colors';
import Step1 from './Step1';
import Step2 from './Step2';
import Step3 from './Step3';
import Step4 from './Step4';
import CustomAlert from '../../components/CustomAlert';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';

import { API_BASE_URL } from "../../config/config_ip";

export default function DriveNextScreen({ navigation, route }) {
  // ✅ Use AuthContext for session management
  const { user } = useAuth();

  // ✅ Get phone from route params or AuthContext
  const phoneFromRoute = route?.params?.phoneNumber || null;
  const phoneFromAuth = user?.phone_number || user?.phoneNumber || user?.phone || null;
  const phoneNumber = phoneFromRoute || phoneFromAuth || 
    navigation?.getState()?.routes
      ?.find(r => r.params?.phoneNumber)
      ?.params?.phoneNumber || null;
  
  const userId = user?.id || route?.params?.userId || null;
  const userData = user || route?.params?.userData || null;
  
  // Edit mode support
  const { rideData, isEdit, rideId } = route?.params || {};
  const { 
    from: initFrom, 
    to: initTo, 
    dateTime: initDateTime, 
    seatsAvailable: initSeatsAvailable,
    pricePerSeat: initPricePerSeat,
    vehicleId: initVehicleId,
    originCoords: initOriginCoords,
    destinationCoords: initDestinationCoords 
  } = rideData || {};

  const [step, setStep] = useState(1);
  const [from, setFrom] = useState(initFrom || '');
  const [to, setTo] = useState(initTo || '');
  const [dateTime, setDateTime] = useState(initDateTime ? new Date(initDateTime) : new Date());
  const [vehicleId, setVehicleId] = useState(initVehicleId || null);
  const [maxSeats, setMaxSeats] = useState(4);

  const [routeOptions, setRouteOptions] = useState([]);
  const [selectedRouteIndex, setSelectedRouteIndex] = useState(0);

  const selectedRoute = routeOptions?.[selectedRouteIndex];

  const [prefs, setPrefs] = useState({ womenOnly: false, instantBooking: true, luggage: true, smoking: false, pets: false });

  const [seatsAvailable, setSeatsAvailable] = useState(initSeatsAvailable || 1);
  const [pricePerSeat, setPricePerSeat] = useState(initPricePerSeat ? initPricePerSeat.toString() : '');

  const [fromCoords, setFromCoords] = useState(initOriginCoords || null);
  const [toCoords, setToCoords] = useState(initDestinationCoords || null);

  const [routeData, setRouteData] = useState(null);
  const [loadingRoute, setLoadingRoute] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [routeFetchAttempted, setRouteFetchAttempted] = useState(false);

  // Custom Alert states
  const [alertVisible, setAlertVisible] = useState(false);
  const [alertConfig, setAlertConfig] = useState({
    title: "",
    message: "",
    icon: "check-circle",
    iconColor: "#10B981",
    buttons: []
  });

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
          { text: 'OK', onPress: () => {
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

  useEffect(() => {
    if (route.params?.selectedLocation) {
      const { selectedLocation, type } = route.params;

      if (type === 'from') {
        setFrom(selectedLocation.label || selectedLocation.name);
      } else {
        setTo(selectedLocation.label);
      }
    }
  }, [route.params?.selectedLocation]);

  useEffect(() => {
    const fetchRoute = async () => {
      // Check if coordinates exist
      if (!fromCoords || !toCoords) {
        console.log("⛔ Missing coordinates - fromCoords:", fromCoords, "toCoords:", toCoords);
        
        // Don't show error if this is the initial state (no coordinates selected yet)
        if (from && to && !fromCoords && !toCoords) {
          console.log("Locations selected but coordinates missing - need to select from map");
        }
        return;
      }

      // Prevent multiple fetch attempts
      if (routeFetchAttempted && routeOptions.length > 0) {
        console.log("Route already fetched, skipping...");
        return;
      }

      try {
        setLoadingRoute(true);
        setRouteFetchAttempted(true);

        // Log the request payload for debugging
        const requestPayload = {
          from_coords: [fromCoords.longitude, fromCoords.latitude],
          to_coords: [toCoords.longitude, toCoords.latitude]
        };
        console.log("📤 Fetching route with payload:", JSON.stringify(requestPayload, null, 2));
        console.log("🌐 API URL:", `${API_BASE_URL}/get-route`);

        const response = await axios.post(
          `${API_BASE_URL}/get-route`,
          requestPayload,
          {
            timeout: 30000, // 30 second timeout
            headers: {
              'Content-Type': 'application/json',
              'Accept': 'application/json'
            }
          }
        );

        console.log("📥 Route API response status:", response.status);
        console.log("📥 Route API response data keys:", Object.keys(response.data));

        const routesFromAPI = response.data.routes;

        if (!routesFromAPI || routesFromAPI.length === 0) {
          throw new Error("No routes found from API");
        }

        const formattedRoutes = routesFromAPI.map((route, index) => ({
          id: index,
          geometry: route.coordinates.map(coord => ({
            latitude: coord[1],
            longitude: coord[0]
          })),
          distance: route.distance_km,
          duration: route.duration,
          price: route.price
        }));

        console.log("✅ Routes formatted successfully:", formattedRoutes.length, "routes found");
        setRouteOptions(formattedRoutes);
        setSelectedRouteIndex(0);

      } catch (error) {
        console.log('❌ Route fetch error details:');
        
        if (error.response) {
          // The request was made and the server responded with a status code
          // that falls out of the range of 2xx
          console.log("Response status:", error.response.status);
          console.log("Response data:", JSON.stringify(error.response.data, null, 2));
          console.log("Response headers:", error.response.headers);
          
          let errorMessage = "Failed to fetch route. ";
          if (error.response.status === 404) {
            errorMessage += "Route API endpoint not found. Please check backend.";
          } else if (error.response.status === 500) {
            errorMessage += "Server error. Please try again later.";
          } else if (error.response.data?.message) {
            errorMessage += error.response.data.message;
          } else {
            errorMessage += "Please check your connection and try again.";
          }
          
          // showCustomAlert("Route Error", errorMessage, "error");
        } else if (error.request) {
          // The request was made but no response was received
          console.log("No response received from server");
          console.log("Error request:", error.request);
          showCustomAlert("Connection Error", "Cannot connect to server. Please check your internet connection.", "error");
        } else {
          // Something happened in setting up the request that triggered an Error
          console.log("Error message:", error.message);
          showCustomAlert("Error", error.message || "Failed to fetch route. Please try again.", "error");
        }
      } finally {
        setLoadingRoute(false);
      }
    };

    fetchRoute();
  }, [fromCoords, toCoords]);

  const goNext = () => setStep(s => Math.min(4, s + 1));
  const goBack = () => { if (step > 1) setStep(s => s - 1); else navigation.goBack(); };

  const handleSubmitRide = async ({ seatsAvailable, pricePerSeat }) => {
    if (!phoneNumber) {
      showCustomAlert("Missing Info", "Phone number not found. Please login again.", "warning");
      return;
    }

    setSubmitting(true);
    
    try { 
      console.log("userData:", userData);
      console.log("phoneNumber param:", phoneNumber);
      console.log("isEdit:", isEdit, "rideId:", rideId);
      
      const payload = {
        phone_number: phoneNumber,
        origin: from,
        destination: to,
        departure_time: new Date(dateTime).toISOString(),
        available_seats: seatsAvailable,
        price_per_seat: Number(pricePerSeat),
        vehicleId: vehicleId,
        origin_coords: fromCoords ? [fromCoords.longitude, fromCoords.latitude] : null,
        destination_coords: toCoords ? [toCoords.longitude, toCoords.latitude] : null,
        route_coordinates: selectedRoute?.geometry.map((p) => [p.longitude, p.latitude]) || [],
        distance_km: selectedRoute?.distance,
        duration_text: selectedRoute?.duration,
        total_estimated_price: selectedRoute?.price,
        preferences: prefs,
      };
      
      console.log(`${isEdit ? 'Update' : 'Post'} Ride payload:`, payload);
      
      let response;
      if (isEdit && rideId) {
        response = await axios.put(
          `${API_BASE_URL}/update-ride/${rideId}`,
          payload
        );
        console.log('Ride Updated:', response.data);
        
        showCustomAlert(
          "Ride Updated!", 
          "Your ride details have been updated successfully!",
          "success",
          () => {
            navigation.reset({
              index: 0,
              routes: [{ name: 'Home' }]
            });
          }
        );
      } else {
        response = await axios.post(
          `${API_BASE_URL}/post-ride`,
          payload
        );
        console.log('Ride Created:', response.data);
        
        showCustomAlert(
          "Ride Posted!", 
          "Your ride has been posted successfully!",
          "success",
          () => {
            navigation.replace('RideSuccessScreen', {
              userData,
              userId,
              phoneNumber,
              vehicleId,
              rideDetails: {
                from,
                to,
                dateTime,
                seatsAvailable,
                pricePerSeat,
                distance: selectedRoute?.distance,
                duration: selectedRoute?.duration,
              }
            });
          }
        );
      }
    } catch (e) {
      console.log("STATUS:", e.response?.status);
      console.log("DATA:", JSON.stringify(e.response?.data, null, 2));
      console.log("MESSAGE:", e.message);
      
      const errorMsg = e.response?.data?.message || e.response?.data?.detail || e.message || `Failed to ${isEdit ? 'update' : 'post'} ride.`;
      showCustomAlert("Error", errorMsg, "error");
    } finally {
      setSubmitting(false);
    }
  };

  // Show loading animation while fetching route
  if (loadingRoute) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar backgroundColor={Colors.white} barStyle="dark-content" />
        <View style={styles.loaderContainer}>
          <LottieView
            source={require("../../assets/loading.json")}
            autoPlay
            loop
            style={{ width: 300, height: 300 }}
          />
          {/* <Text style={styles.loaderText}>
            Finding best route...
          </Text> */}
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar backgroundColor={Colors.white} barStyle="dark-content" />
      
      {/* Header - Matching SavedAddressesScreen style */}
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton} 
          onPress={goBack}
        >
          <MaterialIcons name="arrow-back-ios" size={24} color="#ED7117" />
        </TouchableOpacity>
        
        <Text style={styles.headerTitle}>
          {isEdit ? 'Edit Ride' : 'Offer a Ride'}
        </Text>
        
        <View style={styles.headerSpacer} />
      </View>

      {/* Progress Steps */}
      <View style={styles.progressContainer}>
        {[1, 2, 3, 4].map((n) => (
          <View 
            key={n} 
            style={[
              styles.progressBar, 
              { backgroundColor: n === step ? Colors.primary : '#e6eef8' }
            ]} 
          />
        ))}
      </View>

      <ScrollView 
        style={styles.scrollView} 
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {step === 1 && (
          <Step1 
            from={from} 
            to={to} 
            setFrom={setFrom} 
            setTo={setTo} 
            setFromCoords={setFromCoords} 
            setToCoords={setToCoords} 
            dateTime={dateTime} 
            setDateTime={setDateTime} 
            onNext={goNext} 
            navigation={navigation} 
            route={route} 
            phoneNumber={phoneNumber} 
            fromCoords={fromCoords} 
            toCoords={toCoords} 
          />
        )}
        
        {step === 2 && (
          <Step2 
            routeOptions={routeOptions} 
            selectedRouteIndex={selectedRouteIndex} 
            setSelectedRouteIndex={setSelectedRouteIndex} 
            onNext={goNext} 
          />
        )}
        
        {step === 3 && (
          <Step3 
            phoneNumber={phoneNumber} 
            navigation={navigation} 
            vehicleId={vehicleId} 
            setVehicleId={setVehicleId} 
            onNext={({ preferences, vehicleId: selectedVehicleId, maxSeats: vehicleMaxSeats }) => { 
              setPrefs(preferences || {}); 
              setVehicleId(selectedVehicleId); 
              setMaxSeats(vehicleMaxSeats || 4); 
              goNext(); 
            }} 
          />
        )}
        
        {step === 4 && (
          <Step4 
            seatsAvailable={seatsAvailable} 
            setSeatsAvailable={setSeatsAvailable} 
            pricePerSeat={pricePerSeat} 
            setPricePerSeat={setPricePerSeat} 
            selectedRoute={selectedRoute} 
            vehicleId={vehicleId} 
            maxSeats={maxSeats} 
            onPost={handleSubmitRide} 
            isEdit={isEdit} 
          />
        )}
      </ScrollView>

      {/* Custom Alert */}
      <CustomAlert
        visible={alertVisible}
        title={alertConfig.title}
        message={alertConfig.message}
        icon={alertConfig.icon}
        iconColor={alertConfig.iconColor}
        buttons={alertConfig.buttons}
        onBackdropPress={() => setAlertVisible(false)}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.white,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 0.5,
    borderBottomColor: '#F3F4F6',
  },
  backButton: {
    width: 44,
    height: 44,
    justifyContent: 'center',
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
  progressContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    paddingVertical: 12,
  },
  progressBar: {
    height: 6,
    flex: 1,
    marginHorizontal: 6,
    borderRadius: 4,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 20,
  },
  loaderContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.white,
  },
  loaderText: {
    marginTop: 20,
    fontSize: 16,
    color: Colors.primary,
    fontWeight: '500',
  },
});