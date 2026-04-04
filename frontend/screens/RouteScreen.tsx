// import React, { useState, useRef } from 'react';
// import {
//   View,
//   Text,
//   TextInput,
//   TouchableOpacity,
//   StyleSheet,
//   Alert,
// } from 'react-native';
// import MapView, { Marker, Polyline, Region } from 'react-native-maps';

// const ORS_API_KEY =
//   'eyJvcmciOiI1YjNjZTM1OTc4NTExMTAwMDFjZjYyNDgiLCJpZCI6ImQzNTZjNzFhZDZlNTRiYmE5M2EzODFmYWJhYWFiZTBhIiwiaCI6Im11cm11cjY0In0='; // your key

// interface Location {
//   latitude: number;
//   longitude: number;
// }

// const INITIAL_REGION: Region = {
//   latitude: 28.6139, // Delhi
//   longitude: 77.209,
//   latitudeDelta: 0.4,
//   longitudeDelta: 0.4,
// };

// const RouteScreen: React.FC = () => {
//   const mapRef = useRef<MapView | null>(null);

//   const [fromText, setFromText] = useState('Delhi');
//   const [toText, setToText] = useState('Noida');

//   const [fromLocation, setFromLocation] = useState<Location | null>(null);
//   const [toLocation, setToLocation] = useState<Location | null>(null);
//   const [routeCoords, setRouteCoords] = useState<Location[]>([]);
//   const [loading, setLoading] = useState(false);

//   // ---------- ORS helpers ----------

//   const geocodeORS = async (query: string): Promise<Location> => {
//     const url = `https://api.openrouteservice.org/geocode/search?api_key=${ORS_API_KEY}&text=${encodeURIComponent(
//       query,
//     )}&size=1`;

//     console.log('GEOCODE URL:', url);

//     const resp = await fetch(url);
//     const txt = await resp.text();
//     console.log('GEOCODE STATUS:', resp.status, txt.slice(0, 200));

//     if (!resp.ok) {
//       throw new Error(`Geocoding failed (${resp.status})`);
//     }

//     const data = JSON.parse(txt);
//     const features = data.features || [];
//     if (!features.length) {
//       throw new Error('No results found');
//     }

//     const coords = features[0].geometry.coordinates; // [lon, lat]
//     const lon = Number(coords[0]);
//     const lat = Number(coords[1]);

//     return { latitude: lat, longitude: lon };
//   };

//   const getRouteORS = async (from: Location, to: Location): Promise<Location[]> => {
//     const url = 'https://api.openrouteservice.org/v2/directions/driving-car';

//     // ORS expects [lon, lat]
//     const body = {
//       coordinates: [
//         [from.longitude, from.latitude],
//         [to.longitude, to.latitude],
//       ],
//       instructions: false,
//       geometry: true,
//     };

//     const resp = await fetch(url, {
//       method: 'POST',
//       headers: {
//         Authorization: ORS_API_KEY,
//         'Content-Type': 'application/json',
//       },
//       body: JSON.stringify(body),
//     });

//     const txt = await resp.text();
//     console.log('ROUTE STATUS:', resp.status, txt.slice(0, 200));

//     if (!resp.ok) {
//       throw new Error(`Route request failed (${resp.status})`);
//     }

//     const data = JSON.parse(txt);
//     const features = data.features || [];
//     if (!features.length) {
//       throw new Error('No route found');
//     }

//     const coords = features[0].geometry.coordinates || []; // [lon, lat][]

//     // Convert to {latitude, longitude} for react-native-maps
//     return coords.map(([lon, lat]: [number, number]) => ({
//       latitude: lat,
//       longitude: lon,
//     }));
//   };

//   // ---------- UI actions ----------

//   const handleGetRoute = async () => {
//     try {
//       if (!fromText.trim() || !toText.trim()) {
//         Alert.alert('Error', 'Please enter both From and To locations.');
//         return;
//       }

//       setLoading(true);
//       setRouteCoords([]);

//       // 1. Geocode both locations from text
//       const from = await geocodeORS(fromText.trim());
//       const to = await geocodeORS(toText.trim());

//       setFromLocation(from);
//       setToLocation(to);

//       // 2. Get route between the two locations
//       const polylineCoords = await getRouteORS(from, to);
//       setRouteCoords(polylineCoords);

//       // 3. Fit map to route
//       if (mapRef.current && polylineCoords.length > 0) {
//         mapRef.current.fitToCoordinates(polylineCoords, {
//           edgePadding: { top: 80, bottom: 80, left: 60, right: 60 },
//           animated: true,
//         });
//       }
//     } catch (err: any) {
//       console.error(err);
//       Alert.alert('Route Error', err.message || 'Failed to get route.');
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     <View style={styles.container}>
//       {/* Inputs */}
//       <View style={styles.inputsContainer}>
//         <TextInput
//           style={styles.input}
//           value={fromText}
//           onChangeText={setFromText}
//           placeholder="From"
//         />
//         <TextInput
//           style={styles.input}
//           value={toText}
//           onChangeText={setToText}
//           placeholder="To"
//         />
//         <TouchableOpacity
//           style={[styles.button, loading && styles.buttonDisabled]}
//           onPress={handleGetRoute}
//           disabled={loading}
//         >
//           <Text style={styles.buttonText}>
//             {loading ? 'Loading...' : 'Get Route'}
//           </Text>
//         </TouchableOpacity>
//       </View>

//       {/* Map */}
//       <MapView
//         ref={mapRef}
//         style={styles.map}
//         initialRegion={INITIAL_REGION}
//       >
//         {fromLocation && (
//           <Marker coordinate={fromLocation} pinColor="green" title="From" />
//         )}
//         {toLocation && (
//           <Marker coordinate={toLocation} pinColor="red" title="To" />
//         )}
//         {routeCoords.length > 0 && (
//           <Polyline
//             coordinates={routeCoords}
//             strokeColor="#007AFF"
//             strokeWidth={4}
//           />
//         )}
//       </MapView>
//     </View>
//   );
// };

// export default RouteScreen;

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//   },
//   inputsContainer: {
//     paddingHorizontal: 16,
//     paddingTop: 16,
//     paddingBottom: 8,
//     backgroundColor: '#ffffff',
//   },
//   input: {
//     borderWidth: 1,
//     borderColor: '#ddd',
//     borderRadius: 8,
//     paddingHorizontal: 10,
//     paddingVertical: 8,
//     fontSize: 14,
//     marginBottom: 8,
//   },
//   button: {
//     backgroundColor: '#007AFF',
//     paddingVertical: 12,
//     borderRadius: 8,
//     alignItems: 'center',
//     marginBottom: 8,
//   },
//   buttonDisabled: {
//     backgroundColor: '#A0AEC0',
//   },
//   buttonText: {
//     color: '#fff',
//     fontSize: 16,
//     fontWeight: '600',
//   },
//   map: {
//     flex: 1,
//   },
// });
import React, { useState, useRef, useEffect } from "react";
import {
  View,
  StyleSheet,
  TextInput,
  FlatList,
  TouchableOpacity,
  Text,
  Button,
  Alert
} from "react-native";
import MapView, { Marker, Polyline, UrlTile } from "react-native-maps";
import axios from "axios";
import * as Location from "expo-location";

interface Coordinate {
  latitude: number;
  longitude: number;
}

import { API_BASE_URL } from "../config/config_ip";

export default function RouteScreen() {

  const mapRef = useRef<MapView>(null);

  const [fromText, setFromText] = useState("");
  const [toText, setToText] = useState("");

  const [fromCoords, setFromCoords] = useState<Coordinate | null>(null);
  const [toCoords, setToCoords] = useState<Coordinate | null>(null);

  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [activeField, setActiveField] = useState<"from" | "to" | null>(null);

  const [routeCoords, setRouteCoords] = useState<Coordinate[]>([]);
  const [driverPosition, setDriverPosition] = useState<Coordinate | null>(null);

  const [distance, setDistance] = useState<string | null>(null);
  const [duration, setDuration] = useState<string | null>(null);
  const [price, setPrice] = useState<number | null>(null);

  // ------------------------
  // 🔎 SEARCH
  // ------------------------
  const searchLocation = async (text: string) => {
    if (text.length < 3) return;

    const res = await axios.post(`${API_BASE_URL}/search-location`, {
      query: text
    });

    setSuggestions(res.data);
  };

  const selectLocation = (item: any) => {
    const coord = {
      latitude: item.coordinates[1],
      longitude: item.coordinates[0]
    };

    if (activeField === "from") {
      setFromText(item.label);
      setFromCoords(coord);
    } else {
      setToText(item.label);
      setToCoords(coord);
    }

    setSuggestions([]);
  };

  // ------------------------
  // 📍 GPS
  // ------------------------
  const useMyLocation = async () => {
    const { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== "granted") return;

    const location = await Location.getCurrentPositionAsync({});
    const coord = {
      latitude: location.coords.latitude,
      longitude: location.coords.longitude
    };

    setFromCoords(coord);
    setFromText("My Location");
  };

  // ------------------------
  // 🚗 GET ROUTE
  // ------------------------
  const fetchRoute = async () => {
    if (!fromCoords || !toCoords) {
      Alert.alert("Select valid locations");
      return;
    }

    const res = await axios.post(`${API_BASE_URL}/get-route`, {
      from_coords: [fromCoords.longitude, fromCoords.latitude],
      to_coords: [toCoords.longitude, toCoords.latitude]
    });

    const formatted = res.data.coordinates.map((c: [number, number]) => ({
      latitude: c[1],
      longitude: c[0]
    }));

    setRouteCoords(formatted);
    setDistance(`${res.data.distance_km} KM`);
    setDuration(res.data.duration);
    setPrice(res.data.price);

    mapRef.current?.fitToCoordinates(formatted, {
      edgePadding: { top: 100, right: 50, bottom: 150, left: 50 },
      animated: true
    });
  };

  // ------------------------
  // 🚘 DRIVER ANIMATION
  // ------------------------
  useEffect(() => {
    if (routeCoords.length === 0) return;

    let i = 0;
    const interval = setInterval(() => {
      if (i < routeCoords.length) {
        setDriverPosition(routeCoords[i]);
        i++;
      } else {
        clearInterval(interval);
      }
    }, 400);

    return () => clearInterval(interval);
  }, [routeCoords]);

  return (
    <View style={styles.container}>

      <View style={styles.inputContainer}>

        <TextInput
          placeholder="From"
          value={fromText}
          onFocus={() => setActiveField("from")}
          onChangeText={(text) => {
            setFromText(text);
            searchLocation(text);
          }}
          style={styles.input}
        />

        <TextInput
          placeholder="To"
          value={toText}
          onFocus={() => setActiveField("to")}
          onChangeText={(text) => {
            setToText(text);
            searchLocation(text);
          }}
          style={styles.input}
        />

        <Button title="Use My Location" onPress={useMyLocation} />
        <Button title="Get Route" onPress={fetchRoute} />

        {suggestions.length > 0 && (
          <FlatList
            data={suggestions}
            keyExtractor={(item) => item.label}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={styles.suggestion}
                onPress={() => selectLocation(item)}
              >
                <Text>{item.label}</Text>
              </TouchableOpacity>
            )}
          />
        )}
      </View>

      <MapView
        ref={mapRef}
        style={styles.map}
        initialRegion={{
          latitude: 28.6139,
          longitude: 77.2090,
          latitudeDelta: 0.1,
          longitudeDelta: 0.1
        }}
      >
        <UrlTile
          urlTemplate="https://tile.openstreetmap.org/{z}/{x}/{y}.png"
          maximumZ={19}
        />

        {routeCoords.length > 0 && (
          <>
            <Marker coordinate={routeCoords[0]} pinColor="green" />
            <Marker coordinate={routeCoords[routeCoords.length - 1]} pinColor="red" />
            {driverPosition && (
              <Marker coordinate={driverPosition} pinColor="blue" />
            )}
            <Polyline
              coordinates={routeCoords}
              strokeWidth={6}
              strokeColor="#111827"
            />
          </>
        )}
      </MapView>

      {distance && (
        <View style={styles.infoCard}>
          <Text style={styles.infoText}>
            {distance} • {duration}
          </Text>
          <Text style={styles.priceText}>
            ₹ {price}
          </Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  inputContainer: { backgroundColor: "white", padding: 10, zIndex: 2 },
  input: { borderWidth: 1, marginBottom: 8, padding: 8, borderRadius: 8 },
  suggestion: { padding: 10, borderBottomWidth: 0.5 },
  map: { flex: 1 },
  infoCard: {
    position: "absolute",
    bottom: 30,
    left: 20,
    right: 20,
    backgroundColor: "white",
    padding: 15,
    borderRadius: 12,
    elevation: 6
  },
  infoText: { fontSize: 16, fontWeight: "bold", textAlign: "center" },
  priceText: { fontSize: 18, fontWeight: "bold", marginTop: 5, textAlign: "center" }
});
