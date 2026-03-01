import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Platform, Alert } from 'react-native';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import { Colors } from '../../constants/Colors';
import Step1 from './Step1';
import Step2 from './Step2';
import Step3 from './Step3';
import Step4 from './Step4';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';


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
  const { rideData } = route?.params || {};
  const { from: initFrom, to: initTo, dateTime: initDateTime } = rideData || {};

  const [step, setStep] = useState(1);
  const [from, setFrom] = useState(initFrom || '');
  const [to, setTo] = useState(initTo || '');
  const [dateTime, setDateTime] = useState(initDateTime || new Date());
  const [vehicleId, setVehicleId] = useState(null);
  const [maxSeats, setMaxSeats] = useState(4);

  const [routeOptions, setRouteOptions] = useState([]);
  const [selectedRouteIndex, setSelectedRouteIndex] = useState(0);

  const selectedRoute = routeOptions?.[selectedRouteIndex];

  const [prefs, setPrefs] = useState({ womenOnly: false, instantBooking: true, luggage: true, smoking: false, pets: false });

  const [seatsAvailable, setSeatsAvailable] = useState(1);
  const [pricePerSeat, setPricePerSeat] = useState('');

  const [fromCoords, setFromCoords] = useState(null);
  const [toCoords, setToCoords] = useState(null);

  const [routeData, setRouteData] = useState(null);
  const [loadingRoute, setLoadingRoute] = useState(false);




  // useEffect(() => {
  //   if (from && to) {
  //     const baseDist = 10 + Math.floor(Math.random() * 20);
  //     const options = [
  //       { id: 'fast', label: 'Fastest', distance: baseDist, duration: Math.round(baseDist / 60 * 60) + 20 },
  //       { id: 'short', label: 'Shortest', distance: Math.max(3, baseDist - 3), duration: Math.round((baseDist - 3) / 50 * 60) + 30 },
  //       { id: 'scenic', label: 'Scenic', distance: baseDist + 5, duration: Math.round((baseDist + 5) / 45 * 60) + 40 },
  //     ];
  //     setRouteOptions(options);
  //     setSelectedRouteIndex(0);
  //   } else {
  //     setRouteOptions([]);
  //   }
  // }, [from, to]);
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
      if (!fromCoords || !toCoords) {
        console.log("⛔ Missing coordinates");
        return;
      }

      try {
        setLoadingRoute(true);

        const response = await axios.post(
          'http://192.168.1.2:8000/get-route',
          {
            from_coords: fromCoords,
            to_coords: toCoords
          }
        );

        const routesFromAPI = response.data.routes;

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

        setRouteOptions(formattedRoutes);
        setSelectedRouteIndex(0);


        // Convert ORS [lon, lat] → {latitude, longitude}
        // const formattedCoords = data.coordinates.map(coord => ({
        //   latitude: coord[1],
        //   longitude: coord[0]
        // }));

        // setRouteData({
        //   geometry: formattedCoords,
        //   distance: data.distance_km,
        //   duration: data.duration,
        //   price: data.price
        // });

      } catch (error) {
        console.log('Route fetch error:', error);
      } finally {
        setLoadingRoute(false);
      }
    };

    fetchRoute();
  }, [fromCoords, toCoords]);


  //

  const goNext = () => setStep(s => Math.min(4, s + 1));
  const goBack = () => { if (step > 1) setStep(s => s - 1); else navigation.goBack(); };

  const handlePostRide = async({ seatsAvailable, pricePerSeat }) => {
    try{ 
      console.log("userData:", userData);
      console.log("phoneNumber param:", phoneNumber);
      const payload = {
        phone_number: phoneNumber,  // VERY IMPORTANT
        origin: from,
        destination: to,
        departure_time: new Date(dateTime).toISOString(),

        available_seats: seatsAvailable,
        price_per_seat: pricePerSeat,
        vehicleId: vehicleId,

        distance_km: selectedRoute.distance,
        duration_text: selectedRoute.duration,
        total_estimated_price: selectedRoute.price,
        preferences: prefs
      };
    console.log('Post Ride payload:', payload);
    const response = await axios.post(
      'http://192.168.1.2:8000/post-ride',
      payload
    );
    console.log('Ride Created:', response.data);
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
    } catch (e) {
      // console.log('Error posting ride:', e.response?.data);
      console.log("STATUS:", e.response?.status);
      console.log("DATA:", JSON.stringify(e.response?.data, null, 2));
      console.log("MESSAGE:", e.message);
      Alert.alert('Error', 'Failed to post ride. Please try again.');
    }
  };

  return (
    <View style={{ flex: 1, backgroundColor: Colors.white }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingTop: Platform.OS === 'ios' ? 50 : 30, paddingBottom: 12 }}>
        <TouchableOpacity style={{ width: 40, height: 40, alignItems: 'center', justifyContent: 'center' }} onPress={goBack}>
          <MaterialIcons name="arrow-back-ios" size={24} color={Colors.secondary} />
        </TouchableOpacity>
        <Text style={{ fontSize: 24, fontWeight: '700', color: Colors.primary }}>Offer a Ride</Text>
        <View style={{ width: 40 }} />
      </View>

      <View style={{ flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: 24, paddingVertical: 12 }}>
        {[1,2,3,4].map((n) => (
          <View key={n} style={{ height: 6, flex: 1, backgroundColor: n === step ? Colors.primary : '#e6eef8', marginHorizontal: 6, borderRadius: 4 }} />
        ))}
      </View>

<ScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: 16, paddingBottom: 20, }}>
        {step === 1 && <Step1 from={from} to={to} setFrom={setFrom} setTo={setTo} setFromCoords={setFromCoords} setToCoords={setToCoords} dateTime={dateTime} setDateTime={setDateTime} onNext={goNext} navigation={navigation} route={route} phoneNumber={phoneNumber} />}
        {step === 2 && <Step2 routeOptions={routeOptions} selectedRouteIndex={selectedRouteIndex} setSelectedRouteIndex={setSelectedRouteIndex} onNext={goNext} />}
        {step === 3 && <Step3 phoneNumber={phoneNumber} navigation={navigation} vehicleId={vehicleId} setVehicleId={setVehicleId} onNext={({ preferences, vehicleId: selectedVehicleId, maxSeats: vehicleMaxSeats }) => { setPrefs(preferences || {}); setVehicleId(selectedVehicleId); setMaxSeats(vehicleMaxSeats || 4); goNext(); }} />}
        {step === 4 && <Step4 seatsAvailable={seatsAvailable} setSeatsAvailable={setSeatsAvailable} pricePerSeat={pricePerSeat} setPricePerSeat={setPricePerSeat} selectedRoute={selectedRoute} vehicleId={vehicleId} maxSeats={maxSeats} onPost={handlePostRide} />}
      </ScrollView>
    </View>
  );
}
