// import React, { useState, useRef } from 'react';
// import { View, Text, Image, TouchableOpacity, Animated } from 'react-native';
// import { Colors } from '../../constants/Colors';
// import { MaterialIcons, Octicons } from '@expo/vector-icons';

// export default function Step2({ routeOptions, selectedRouteIndex, setSelectedRouteIndex, onNext }) {
//   const [isDrawerExpanded, setIsDrawerExpanded] = useState(false);
//   const mapHeight = useRef(new Animated.Value(400)).current;
//   const drawerHeight = useRef(new Animated.Value(100)).current;

//   const toggleDrawer = () => {
//     const newExpanded = !isDrawerExpanded;
//     const mapToValue = newExpanded ? 200 : 400;
//     const drawerToValue = newExpanded ? 300 : 100;
//     Animated.parallel([
//       Animated.timing(mapHeight, { toValue: mapToValue, duration: 300, useNativeDriver: false }),
//       Animated.timing(drawerHeight, { toValue: drawerToValue, duration: 300, useNativeDriver: false })
//     ]).start();
//     setIsDrawerExpanded(newExpanded);
//   };

//   return (
//     <View style={{ backgroundColor: 'rgba(255, 255, 255, 0.95)', padding: 18, marginBottom: 16, borderRadius: 28,
//                 shadowColor: '#000',
//                 shadowOffset: { width: 0, height: 10 },
//                 shadowOpacity: 0.15,
//                 shadowRadius: 20,
//                 elevation: 10,
//                 borderWidth: 1,
//                 borderColor: 'rgba(229, 231, 235, 0.5)', }}>
//       <Text style={{ fontSize: 20, fontWeight: '700', color: Colors.dark, marginBottom: 18 }}>Select Route</Text>
//       <Animated.View style={{ height: mapHeight, marginBottom: 10 }}>
//         <Image
//           source={{ uri: `https://cdn.ndtv.com/tech/images/gadgets/google_maps_newdelhi_screenshot.jpg` }}
//           style={{ width: '100%', height: '100%', borderRadius: 12 }}
//           resizeMode="cover"
//         />
//       </Animated.View>
//       <Animated.View style={{ height: drawerHeight, backgroundColor: '#fff', borderRadius: 12, padding: 12, paddingTop: 0, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4, elevation: 3 }}>
//         <TouchableOpacity onPress={toggleDrawer} style={{ alignSelf: 'center', marginBottom: -12 }}>
//           <Octicons name="dash" size={40} color={Colors.primary} />
//         </TouchableOpacity>
//         <Text style={{ fontSize: 20, fontWeight: '700', color: Colors.dark, marginBottom: 18 }}>Route Options</Text>
//         {routeOptions.length === 0 && <Text style={{ color: Colors.gray }}>Enter From and To to see routes</Text>}
//         {routeOptions.map((opt, idx) => (
//           <TouchableOpacity key={opt.id} onPress={() => setSelectedRouteIndex(idx)} style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 12, borderRadius: 10, borderWidth: 1, borderColor: selectedRouteIndex === idx ? Colors.primary : '#f0f4f8', marginBottom: 8, backgroundColor: selectedRouteIndex === idx ? '#f0f8ff' : '#fff' }}>
//             <View>
//               <Text style={{ fontWeight: '600', color: Colors.dark }}>{opt.label}</Text>
//               <Text style={{ color: Colors.gray, marginTop: 4 }}>{opt.distance} km • {opt.duration} mins</Text>
//             </View>
//             {selectedRouteIndex === idx && <Text style={{ color: Colors.primary }}>Selected</Text>}
//           </TouchableOpacity>
//         ))}
//       </Animated.View>
//       <TouchableOpacity onPress={onNext} disabled={routeOptions.length === 0} style={{ backgroundColor: Colors.primary, paddingVertical: 12, borderRadius: 12, alignItems: 'center', marginTop: 24, opacity: routeOptions.length === 0 ? 0.6 : 1 }}>
//         <Text style={{ color: '#fff', fontWeight: '700' }}>Continue</Text>
//       </TouchableOpacity>
//     </View>
//   );
// }
import React, {useState, useRef} from 'react';
import { View, Text, TouchableOpacity, Animated, StyleSheet } from 'react-native';
import MapView, { Polyline, Marker } from 'react-native-maps';
import { Colors } from '../../constants/Colors';
import { MaterialIcons, Octicons } from '@expo/vector-icons';

export default function Step2({
  routeOptions,
  selectedRouteIndex,
  setSelectedRouteIndex,
  onNext,
}) {

  const [isDrawerExpanded, setIsDrawerExpanded] = useState(false);
  const mapHeight = useRef(new Animated.Value(320)).current;
  const drawerHeight = useRef(new Animated.Value(200)).current;

  const toggleDrawer = () => {
    const newExpanded = !isDrawerExpanded;
    const mapToValue = newExpanded ? 320 : 320;
    const drawerToValue = newExpanded ? 200 : 200;
    Animated.parallel([
      Animated.timing(mapHeight, { toValue: mapToValue, duration: 300, useNativeDriver: false }),
      Animated.timing(drawerHeight, { toValue: drawerToValue, duration: 300, useNativeDriver: false })
    ]).start();
    setIsDrawerExpanded(newExpanded);
  };  

  if (!routeOptions || routeOptions.length === 0) {
    return (
      <View style={{ padding: 20 }}>
        <Text>No route found</Text>
      </View>
    );
  }

  const selectedRoute = routeOptions[selectedRouteIndex];

  return (
    <View style={{ padding: 18, backgroundColor: 'rgba(255, 255, 255, 0.95)', borderRadius: 28,
      marginBottom: 16,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 10 },
      shadowOpacity: 0.15,
      shadowRadius: 20,
      elevation: 10,
      borderWidth: 1,
      borderColor: 'rgba(229, 231, 235, 0.5)',
     }}>

      <Text style={{ fontSize: 20, fontWeight: '700', marginBottom: 10, color: Colors.dark }}>
        Select Route
      </Text>

      <Animated.View style={{ height: mapHeight, marginBottom: 10 }}>
        <MapView
          style={{ height: '100%', borderRadius: 12, overflow: 'hidden', borderWidth: 1, borderColor: Colors.gray }}
          initialRegion={{
            latitude: selectedRoute.geometry[0].latitude,
            longitude: selectedRoute.geometry[0].longitude,
            latitudeDelta: 0.1,
            longitudeDelta: 0.1
          }}
        >
          <Polyline
            coordinates={selectedRoute.geometry}
            strokeWidth={5}
            strokeColor={Colors.primary}
          />
          <Marker coordinate={selectedRoute.geometry[0]}
            pinColor={Colors.success}
          />
          <Marker coordinate={
            selectedRoute.geometry[selectedRoute.geometry.length - 1]}
            pinColor={Colors.error}
            />
        </MapView>
      </Animated.View>

      <Animated.View style={{ height: drawerHeight, backgroundColor: '#fff', borderRadius: 12, padding: 10, paddingTop: 10, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4, elevation: 3 }}>
        {/* <TouchableOpacity onPress={toggleDrawer} style={{ alignSelf: 'center', marginBottom: -14 }}>
         <Octicons name="dash" size={40} color={Colors.primary} />
        </TouchableOpacity> */}
        <Text style={{ fontSize: 20, fontWeight: '700', color: Colors.dark, marginBottom: 10 }}>Route Options</Text>
        {routeOptions.length === 0 && <Text style={{ color: Colors.gray }}>Enter From and To to see routes</Text>}
        
        {routeOptions.map((opt, index) => (
          <TouchableOpacity
            key={index}
            onPress={() => setSelectedRouteIndex(index)}
            style={{
              flexDirection: 'row',
              justifyContent: 'space-between',
              alignItems: 'center',
              padding: 12,
              borderWidth: 1,
              borderColor: selectedRouteIndex === index
                ? Colors.primary
                : '#f0f4f8',
              borderRadius: 10,
              marginBottom: 6,
              backgroundColor: selectedRouteIndex === index
                ? '#f0f8ff'
                : '#fff',
            }}
          >
            <View>
               {/* <Text style={{ fontWeight: '600', color: Colors.dark }}>{opt.label}</Text> */}
               <Text style={{ color: Colors.gray, marginTop: 0 }}>{opt.distance} KM • {opt.duration}</Text>
             </View>
             {selectedRouteIndex === index && <Text style={{ color: Colors.primary }}>Selected</Text>}
          </TouchableOpacity>
        ))}
      </Animated.View>

        <View>
         <TouchableOpacity
            style={[styles.actionButton, { backgroundColor: Colors.primary }]}
            onPress={onNext}
         >
            <Text style={styles.actionButtonText}>Continue</Text>
         </TouchableOpacity>
        </View>
     
    </View>
  );
}

const styles = StyleSheet.create({ 
  actionButton: {
      borderRadius: 16,
      overflow: 'hidden',
      marginTop: 15,
      shadowColor: Colors.primary,
      shadowOffset: { width: 0, height: 8 },
      shadowOpacity: 0.3,
      shadowRadius: 16,
      elevation: 8,
      paddingVertical: 13,
      alignItems: 'center',
      justifyContent: 'center',
      flexDirection: 'row',
    },
    actionButtonText: {
      color: Colors.white,
      fontSize: 18,
      fontWeight: '700',
      letterSpacing: 0.5,
    },
  });