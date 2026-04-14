// import React, { useState } from 'react';
// import {
//   View,
//   Text,
//   TextInput,
//   TouchableOpacity,
//   FlatList,
//   StyleSheet,
//   KeyboardAvoidingView,
//   Platform,
//   Keyboard,
//   TouchableWithoutFeedback,
//   StatusBar
// } from 'react-native';
// import { SafeAreaView } from 'react-native-safe-area-context';
// import MapView from 'react-native-maps';
// import axios from 'axios';
// import { Ionicons, MaterialIcons } from '@expo/vector-icons';
// import { Colors } from '../constants/Colors';
// import { API_BASE_URL } from "../config/config_ip";


// export default function LocationSearchScreen({ navigation, route }) {
//   const { type } = route.params; // "from" or "to"

//   const [query, setQuery] = useState('');
//   const [results, setResults] = useState([]);
//   const MapView = Platform.OS === 'web' ? null : require('react-native-maps').MapView;

//   const searchLocation = async (text) => {
//     setQuery(text);

//     if (text.length < 3) {
//       setResults([]);
//       return;
//     }

//     try {
//       const response = await axios.post(
//         `${API_BASE_URL}/search-location`,
//         { query: text }
//       );

//       // Adjust this if backend returns different structure
//       setResults(response.data);

//     } catch (error) {
//       console.log('Search error:', error);
//     }
//   };

//   const selectLocation = (item) => {
//     if (route.params?.onSelect) {
//       route.params.onSelect({
//         label: item.label,
//         coordinates: item.coordinates
//       });
//     }
//     navigation.goBack();
//   };

//   return (
//     <SafeAreaView style={styles.container}>
//       <StatusBar barStyle="dark-content" />

//       <KeyboardAvoidingView
//         style={{ flex: 1 }}
//         behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
//       >
//         <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
//           <View style={{ flex: 1 }}>

//             {/* BACK BUTTON */}
//             <TouchableOpacity
//               style={styles.backButton}
//               onPress={() => navigation.goBack()}
//             >
//               <Ionicons name="arrow-back" size={24} color={Colors.primary} />
//             </TouchableOpacity>

//             {/* MAP BACKGROUND */}
//             <MapView
//               style={{ flex: 1 }}
//               initialRegion={{
//                 latitude: 28.6139,
//                 longitude: 77.2090,
//                 latitudeDelta: 0.1,
//                 longitudeDelta: 0.1
//               }}
//             />

//             {/* BOTTOM SHEET */}
//             <View style={styles.bottomSheet}>

//               {/* SEARCH BAR */}
//               <View style={styles.searchContainer}>
//                 <TextInput
//                   placeholder="Search location"
//                   value={query}
//                   onChangeText={searchLocation}
//                   style={styles.searchInput}
//                   returnKeyType="search"
//                   blurOnSubmit={false}
//                 />
//                 <Ionicons name="search" size={20} color="#ff7a00" />
//               </View>

//               {/* SUGGESTIONS */}
//               <FlatList
//                 data={results}
//                 keyboardShouldPersistTaps="handled"
//                 keyExtractor={(item, index) => index.toString()}
//                 renderItem={({ item }) => (
//                   <TouchableOpacity
//                     style={styles.resultItem}
//                     onPress={() => selectLocation(item)}
//                   >
//                     <MaterialIcons
//                       name="location-on"
//                       size={20}
//                       color="#ff7a00"
//                       style={{ marginRight: 10 }}
//                     />
//                     <View style={{ flex: 1 }}>
//                       <Text style={{ fontWeight: '600' }}>
//                         {item.label || item.name}
//                       </Text>
//                       {item.city && (
//                         <Text style={{ color: '#777', fontSize: 12 }}>
//                           {item.city}
//                         </Text>
//                       )}
//                     </View>
//                     <Ionicons
//                       name="arrow-forward"
//                       size={18}
//                       color={Colors.primary}
//                     />
//                   </TouchableOpacity>
//                 )}
//                 ListEmptyComponent={
//                   query.length > 2 ? (
//                     <Text style={styles.emptyText}>
//                       No results found
//                     </Text>
//                   ) : null
//                 }
//               />

//             </View>

//           </View>
//         </TouchableWithoutFeedback>
//       </KeyboardAvoidingView>
//     </SafeAreaView>
//   );
// }

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     backgroundColor: '#fff'
//   },
//   backButton: {
//     position: 'absolute',
//     top: 20,
//     left: 20,
//     zIndex: 10,
//     backgroundColor: '#fff',
//     padding: 8,
//     borderRadius: 30,
//     elevation: 5
//   },
//   bottomSheet: {
//     position: 'absolute',
//     bottom: 0,
//     width: '100%',
//     maxHeight: '70%',
//     backgroundColor: '#fff',
//     borderTopLeftRadius: 25,
//     borderTopRightRadius: 25,
//     padding: 20,
//     elevation: 10
//   },
//   searchContainer: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     borderWidth: 1,
//     borderColor: '#ddd',
//     borderRadius: 12,
//     paddingHorizontal: 12,
//     paddingVertical: 10,
//     marginBottom: 12
//   },
//   searchInput: {
//     flex: 1,
//     fontSize: 16
//   },
//   resultItem: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     paddingVertical: 14,
//     borderBottomWidth: 0.5,
//     borderColor: '#eee'
//   },
//   emptyText: {
//     textAlign: 'center',
//     marginTop: 20,
//     color: '#777'
//   }
// });
import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  Keyboard,
  TouchableWithoutFeedback,
  StatusBar
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import MapView from 'react-native-maps'; // ✅ FIXED IMPORT
import axios from 'axios';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import { Colors } from '../constants/Colors';
import { API_BASE_URL } from "../config/config_ip";

export default function LocationSearchScreen({ navigation, route }) {
  const { type } = route.params; // "from" or "to"

  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);

  const searchLocation = async (text) => {
    setQuery(text);

    if (text.length < 3) {
      setResults([]);
      return;
    }

    try {
      const response = await axios.post(
        `${API_BASE_URL}/search-location`,
        { query: text }
      );

      setResults(response.data);

    } catch (error) {
      console.log('Search error:', error);
    }
  };

  const selectLocation = (item) => {
    if (route.params?.onSelect) {
      route.params.onSelect({
        label: item.label,
        coordinates: item.coordinates
      });
    }
    navigation.goBack();
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
              <Ionicons name="arrow-back" size={24} color={Colors.primary} />
            </TouchableOpacity>

            {/* ✅ MAP (ONLY ON MOBILE) */}
            {Platform.OS !== 'web' && (
              <MapView
                style={{ flex: 1 }}
                initialRegion={{
                  latitude: 28.6139,
                  longitude: 77.2090,
                  latitudeDelta: 0.1,
                  longitudeDelta: 0.1
                }}
              />
            )}

            {/* BOTTOM SHEET */}
            <View style={styles.bottomSheet}>

              {/* SEARCH BAR */}
              <View style={styles.searchContainer}>
                <TextInput
                  placeholder="Search location"
                  value={query}
                  onChangeText={searchLocation}
                  style={styles.searchInput}
                  returnKeyType="search"
                  blurOnSubmit={false}
                />
                <Ionicons name="search" size={20} color="#ff7a00" />
              </View>

              {/* RESULTS */}
              <FlatList
                data={results}
                keyboardShouldPersistTaps="handled"
                keyExtractor={(item, index) => index.toString()}
                renderItem={({ item }) => (
                  <TouchableOpacity
                    style={styles.resultItem}
                    onPress={() => selectLocation(item)}
                  >
                    <MaterialIcons
                      name="location-on"
                      size={20}
                      color="#ff7a00"
                      style={{ marginRight: 10 }}
                    />
                    <View style={{ flex: 1 }}>
                      <Text style={{ fontWeight: '600' }}>
                        {item.label || item.name}
                      </Text>
                      {item.city && (
                        <Text style={{ color: '#777', fontSize: 12 }}>
                          {item.city}
                        </Text>
                      )}
                    </View>
                    <Ionicons
                      name="arrow-forward"
                      size={18}
                      color={Colors.primary}
                    />
                  </TouchableOpacity>
                )}
                ListEmptyComponent={
                  query.length > 2 ? (
                    <Text style={styles.emptyText}>
                      No results found
                    </Text>
                  ) : null
                }
              />

            </View>

          </View>
        </TouchableWithoutFeedback>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff'
  },
  backButton: {
    position: 'absolute',
    top: 20,
    left: 20,
    zIndex: 10,
    backgroundColor: '#fff',
    padding: 8,
    borderRadius: 30,
    elevation: 5
  },
  bottomSheet: {
    position: 'absolute',
    bottom: 0,
    width: '100%',
    maxHeight: '70%',
    backgroundColor: '#fff',
    borderTopLeftRadius: 25,
    borderTopRightRadius: 25,
    padding: 20,
    elevation: 10
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginBottom: 12
  },
  searchInput: {
    flex: 1,
    fontSize: 16
  },
  resultItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    borderBottomWidth: 0.5,
    borderColor: '#eee'
  },
  emptyText: {
    textAlign: 'center',
    marginTop: 20,
    color: '#777'
  }
});