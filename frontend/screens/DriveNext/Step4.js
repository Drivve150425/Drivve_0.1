import React from 'react';
import { View, Text, TouchableOpacity, TextInput, Alert } from 'react-native';
import { Colors } from '../../constants/Colors';

export default function Step4({ seatsAvailable, setSeatsAvailable, pricePerSeat, setPricePerSeat, onPost }) {
  return (
    <View style={{ backgroundColor: '#fff', borderRadius: 12, padding: 16, marginBottom: 14 }}>
      <Text style={{ fontSize: 16, fontWeight: '700', color: Colors.dark, marginBottom: 8 }}>Seats & Pricing</Text>
      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center', marginTop: 12 }}>
        <TouchableOpacity onPress={() => setSeatsAvailable(Math.max(1, seatsAvailable - 1))} style={{ width: 48, height: 48, borderRadius: 14, backgroundColor: '#fff', alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: '#e6eef8' }}>
          <Text style={{ fontSize: 20, fontWeight: '700' }}>-</Text>
        </TouchableOpacity>
        <Text style={{ fontSize: 20, fontWeight: '700', marginHorizontal: 20 }}>{seatsAvailable}</Text>
        <TouchableOpacity onPress={() => setSeatsAvailable(seatsAvailable + 1)} style={{ width: 48, height: 48, borderRadius: 14, backgroundColor: '#fff', alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: '#e6eef8' }}>
          <Text style={{ fontSize: 20, fontWeight: '700' }}>+</Text>
        </TouchableOpacity>
      </View>

      <View style={{ marginTop: 12 }}>
        <Text style={{ fontSize: 13, color: Colors.gray, marginBottom: 6 }}>Price per seat (₹)</Text>
        <TextInput value={pricePerSeat} onChangeText={setPricePerSeat} placeholder="Enter price per seat" keyboardType="numeric" style={{ borderWidth: 1.5, borderColor: Colors.gray, borderRadius: 15, paddingHorizontal: 16, paddingVertical: 12 }} />
      </View>

      <TouchableOpacity onPress={onPost} style={{ backgroundColor: Colors.primary, paddingVertical: 12, borderRadius: 12, alignItems: 'center', marginTop: 18 }}>
        <Text style={{ color: '#fff', fontWeight: '700' }}>Post Ride</Text>
      </TouchableOpacity>
    </View>
  );
}
