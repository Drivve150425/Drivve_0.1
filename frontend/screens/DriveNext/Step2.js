import React from 'react';
import { View, Text, Image, TouchableOpacity } from 'react-native';
import { Colors } from '../../constants/Colors';

export default function Step2({ routeOptions, selectedRouteIndex, setSelectedRouteIndex, onNext }) {
  return (
    <>
      <View style={{ backgroundColor: '#fff', borderRadius: 12, padding: 8, marginBottom: 12 }}>
        <Text style={{ fontSize: 16, fontWeight: '700', color: Colors.dark, marginBottom: 8 }}>Select Route</Text>
        <Image
          source={{ uri: `https://staticmap.openstreetmap.de/staticmap.php?center=28.6139,77.2090&zoom=10&size=600x300&maptype=mapnik` }}
          style={{ width: '100%', height: 180, borderRadius: 8 }}
          resizeMode="cover"
        />
      </View>

      <View style={{ backgroundColor: '#fff', borderRadius: 12, padding: 16, marginBottom: 14 }}>
        <Text style={{ fontSize: 16, fontWeight: '700', color: Colors.dark, marginBottom: 8 }}>Route Options</Text>
        {routeOptions.length === 0 && <Text style={{ color: Colors.gray }}>Enter From and To to see routes</Text>}
        {routeOptions.map((opt, idx) => (
          <TouchableOpacity key={opt.id} onPress={() => setSelectedRouteIndex(idx)} style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 12, borderRadius: 10, borderWidth: 1, borderColor: selectedRouteIndex === idx ? Colors.primary : '#f0f4f8', marginBottom: 8, backgroundColor: selectedRouteIndex === idx ? '#f0f8ff' : '#fff' }}>
            <View>
              <Text style={{ fontWeight: '600', color: Colors.dark }}>{opt.label}</Text>
              <Text style={{ color: Colors.gray, marginTop: 4 }}>{opt.distance} km • {opt.duration} mins</Text>
            </View>
            {selectedRouteIndex === idx && <Text style={{ color: Colors.primary }}>Selected</Text>}
          </TouchableOpacity>
        ))}

        <TouchableOpacity onPress={onNext} disabled={routeOptions.length === 0} style={{ backgroundColor: Colors.primary, paddingVertical: 12, borderRadius: 12, alignItems: 'center', marginTop: 8, opacity: routeOptions.length === 0 ? 0.6 : 1 }}>
          <Text style={{ color: '#fff', fontWeight: '700' }}>Continue</Text>
        </TouchableOpacity>
      </View>
    </>
  );
}
