import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../../constants/Colors';

export default function Step3({ prefs, setPrefs, onNext }) {
  const options = [
    { key: 'womenOnly', label: 'Women Only' },
    { key: 'instantBooking', label: 'Instant Booking' },
    { key: 'luggage', label: 'Luggage Allowed' },
    { key: 'smoking', label: 'Smoking Allowed' },
    { key: 'pets', label: 'Pets Allowed' },
  ];

  return (
    <View style={{ backgroundColor: '#fff', borderRadius: 12, padding: 16, marginBottom: 14 }}>
      <Text style={{ fontSize: 16, fontWeight: '700', color: Colors.dark, marginBottom: 8 }}>Ride Preferences</Text>
      {options.map((p) => (
        <TouchableOpacity key={p.key} style={{ flexDirection: 'row', alignItems: 'center', paddingVertical: 10 }} onPress={() => setPrefs({ ...prefs, [p.key]: !prefs[p.key] })}>
          <View style={{ width: 28, height: 28, borderRadius: 6, borderWidth: 1, borderColor: '#d0d7e6', marginRight: 12, alignItems: 'center', justifyContent: 'center', backgroundColor: prefs[p.key] ? Colors.primary : '#fff' }}>
            {prefs[p.key] && <Ionicons name="checkmark" size={14} color="#fff" />}
          </View>
          <View style={{ flex: 1 }}>
            <Text style={{ fontSize: 15, color: Colors.dark }}>{p.label}</Text>
          </View>
        </TouchableOpacity>
      ))}

      <TouchableOpacity onPress={onNext} style={{ backgroundColor: Colors.primary, paddingVertical: 12, borderRadius: 12, alignItems: 'center', marginTop: 8 }}>
        <Text style={{ color: '#fff', fontWeight: '700' }}>Continue</Text>
      </TouchableOpacity>
    </View>
  );
}
