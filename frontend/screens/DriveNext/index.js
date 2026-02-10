import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Platform } from 'react-native';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import { Colors } from '../../constants/Colors';
import Step1 from './Step1';
import Step2 from './Step2';
import Step3 from './Step3';
import Step4 from './Step4';

export default function DriveNextScreen({ navigation, route }) {
  const { rideData } = route.params || {};
  const { from: initFrom, to: initTo, dateTime: initDateTime } = rideData || {};

  const [step, setStep] = useState(1);
  const [from, setFrom] = useState(initFrom || '');
  const [to, setTo] = useState(initTo || '');
  const [dateTime] = useState(initDateTime || new Date());

  const [routeOptions, setRouteOptions] = useState([]);
  const [selectedRouteIndex, setSelectedRouteIndex] = useState(0);

  const [prefs, setPrefs] = useState({ womenOnly: false, instantBooking: true, luggage: true, smoking: false, pets: false });

  const [seatsAvailable, setSeatsAvailable] = useState(1);
  const [pricePerSeat, setPricePerSeat] = useState('');

  useEffect(() => {
    if (from && to) {
      const baseDist = 10 + Math.floor(Math.random() * 20);
      const options = [
        { id: 'fast', label: 'Fastest', distance: baseDist, duration: Math.round(baseDist / 60 * 60) + 20 },
        { id: 'short', label: 'Shortest', distance: Math.max(3, baseDist - 3), duration: Math.round((baseDist - 3) / 50 * 60) + 30 },
        { id: 'scenic', label: 'Scenic', distance: baseDist + 5, duration: Math.round((baseDist + 5) / 45 * 60) + 40 },
      ];
      setRouteOptions(options);
      setSelectedRouteIndex(0);
    } else {
      setRouteOptions([]);
    }
  }, [from, to]);

  const goNext = () => setStep(s => Math.min(4, s + 1));
  const goBack = () => { if (step > 1) setStep(s => s - 1); else navigation.goBack(); };

  const handlePostRide = () => {
    const payload = { from, to, dateTime, seatsAvailable, pricePerSeat, prefs, selectedRoute: routeOptions[selectedRouteIndex] };
    console.log('Post Ride payload:', payload);
    navigation.navigate('Home');
  };

  return (
    <View style={{ flex: 1, backgroundColor: '#f7fafc' }}>
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

      <ScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: 16, paddingBottom: 40 }}>
        {step === 1 && <Step1 from={from} to={to} setFrom={setFrom} setTo={setTo} dateTime={dateTime} onNext={goNext} />}
        {step === 2 && <Step2 routeOptions={routeOptions} selectedRouteIndex={selectedRouteIndex} setSelectedRouteIndex={setSelectedRouteIndex} onNext={goNext} />}
        {step === 3 && <Step3 prefs={prefs} setPrefs={setPrefs} onNext={goNext} />}
        {step === 4 && <Step4 seatsAvailable={seatsAvailable} setSeatsAvailable={setSeatsAvailable} pricePerSeat={pricePerSeat} setPricePerSeat={setPricePerSeat} onPost={handlePostRide} />}
      </ScrollView>
    </View>
  );
}
