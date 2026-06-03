// import React, { useState, useEffect, useRef } from 'react';
// import {
//   View,
//   Text,
//   StyleSheet,
//   TouchableOpacity,
//   ScrollView,
//   StatusBar,
//   Dimensions,
//   Modal,
//   Animated,
//   KeyboardAvoidingView,
//   Platform,
//   TextInput,
//   ActivityIndicator,
//   FlatList,
// } from 'react-native';
// import { SafeAreaView } from 'react-native-safe-area-context';
// import { MaterialIcons, Ionicons } from '@expo/vector-icons';
// import * as Location from 'expo-location';
// import { Colors } from '../constants/Colors';
// import LottieView from "lottie-react-native";

// // Import MapView with proper platform handling
// import MapView, { Marker, PROVIDER_GOOGLE } from 'react-native-maps';

// import * as Haptics from 'expo-haptics';
// import DatabaseService from '../services/savedaddress_ds';
// import { useAuth } from "../context/AuthContext";
// import CustomAlert from '../components/CustomAlert';
// import { GMAP_API_KEY } from '../config/config_ip';

// const { width, height } = Dimensions.get('window');

// const TYPE_ICONS = {
//   Home: { icon: MaterialIcons, name: 'home', color: '#ED7117' },
//   Work: { icon: MaterialIcons, name: 'work', color: '#184080' },
//   Others: { icon: Ionicons, name: 'location-outline', color: '#6B7280' },
// };

// const normalizeAddress = (a) => ({
//   id: a.id,
//   label: a.label,
//   type: a.type,
//   fullAddress: a.full_address,
//   house: a.house || '',
//   area: a.area || '',
//   instructions: a.instructions || '',
//   isDefault: a.is_default,
// });

// export default function SavedAddressesScreen({ navigation, route }) {
//   const { user } = useAuth();
//   const phoneNumber = user?.phone_number;

//   // States
//   const [step, setStep] = useState(1);
//   const [addresses, setAddresses] = useState([]);
//   const [filteredAddresses, setFilteredAddresses] = useState([]);
//   const [searchQuery, setSearchQuery] = useState('');
//   const [loading, setLoading] = useState(true);
//   const [saving, setSaving] = useState(false);
//   const [deleting, setDeleting] = useState(false);
//   const [deletingId, setDeletingId] = useState(null);
//   const [mapRegion, setMapRegion] = useState({
//     latitude: 28.5562,
//     longitude: 77.1,
//     latitudeDelta: 0.01,
//     longitudeDelta: 0.01,
//   });
//   const [selectedAddress, setSelectedAddress] = useState('');
//   const [selectedLocationCoords, setSelectedLocationCoords] = useState(null);
//   const [searchText, setSearchText] = useState('');
//   const [searchResults, setSearchResults] = useState([]);
//   const [searching, setSearching] = useState(false);
//   const [showSearchResults, setShowSearchResults] = useState(false);
//   const [activeType, setActiveType] = useState('Home');
//   const [otherLabel, setOtherLabel] = useState('');
//   const [house, setHouse] = useState('');
//   const [area, setArea] = useState('');
//   const [instructions, setInstructions] = useState('');
//   const [makeDefault, setMakeDefault] = useState(false);
//   const [editingId, setEditingId] = useState(null);
  
//   // Modal states
//   const [modalVisible, setModalVisible] = useState(false);
//   const [modalType, setModalType] = useState(null);
//   const [selectedModalItem, setSelectedModalItem] = useState(null);
  
//   // Custom Alert states
//   const [alertVisible, setAlertVisible] = useState(false);
//   const [alertConfig, setAlertConfig] = useState({
//     title: "",
//     message: "",
//     icon: "check-circle",
//     iconColor: "#10B981",
//     buttons: []
//   });
  
//   // Animation refs
//   const fadeAnim = useRef(new Animated.Value(0)).current;
//   const slideAnim = useRef(new Animated.Value(30)).current;
//   const searchRef = useRef(null);
//   const mapRef = useRef(null);

//   const showCustomAlert = (title, message, type = 'success') => {
//     let icon = "check-circle";
//     let iconColor = "#10B981";
    
//     if (type === 'error') {
//       icon = "error";
//       iconColor = "#EF4444";
//     } else if (type === 'warning') {
//       icon = "warning";
//       iconColor = "#F59E0B";
//     } else if (type === 'info') {
//       icon = "info";
//       iconColor = Colors.primary;
//     }
    
//     setAlertConfig({
//       title,
//       message,
//       icon,
//       iconColor,
//       buttons: [{ text: 'OK', onPress: () => setAlertVisible(false) }]
//     });
//     setAlertVisible(true);
//   };

//   const showConfirmationAlert = (title, message, onConfirm, confirmText = 'Delete') => {
//     setAlertConfig({
//       title,
//       message,
//       icon: "warning",
//       iconColor: "#F59E0B",
//       buttons: [
//         { text: 'Cancel', onPress: () => setAlertVisible(false), style: 'cancel' },
//         { text: confirmText, onPress: () => {
//           setAlertVisible(false);
//           onConfirm();
//         }, style: 'destructive' }
//       ]
//     });
//     setAlertVisible(true);
//   };

//   // Initial load
//   useEffect(() => {
//     loadAddresses();
    
//     Animated.parallel([
//       Animated.timing(fadeAnim, {
//         toValue: 1,
//         duration: 600,
//         useNativeDriver: true,
//       }),
//       Animated.timing(slideAnim, {
//         toValue: 0,
//         duration: 500,
//         useNativeDriver: true,
//       }),
//     ]).start();
//   }, []);

//   // Filter addresses when search query changes
//   useEffect(() => {
//     filterAddresses();
//   }, [searchQuery, addresses]);

//   const loadAddresses = async () => {
//     try {
//       if (!phoneNumber) return;
      
//       setLoading(true);
//       const res = await DatabaseService.getAddresses(
//         phoneNumber.replace(/\s/g, '')
//       );

//       if (Array.isArray(res)) {
//         const sorted = res
//           .map(normalizeAddress)
//           .sort((a, b) => b.id - a.id);

//         setAddresses(sorted);
//         setFilteredAddresses(sorted);
//       }
//     } catch (error) {
//       console.error('Error loading addresses:', error);
//       showCustomAlert('Error', 'Failed to load addresses', 'error');
//     } finally {
//       setLoading(false);
//     }
//   };

//   const filterAddresses = () => {
//     if (!searchQuery.trim()) {
//       setFilteredAddresses(addresses);
//       return;
//     }

//     const query = searchQuery.toLowerCase().trim();
//     const filtered = addresses.filter(address => {
//       return (
//         address.label.toLowerCase().includes(query) ||
//         address.fullAddress.toLowerCase().includes(query) ||
//         address.house.toLowerCase().includes(query) ||
//         address.area.toLowerCase().includes(query) ||
//         (address.instructions && address.instructions.toLowerCase().includes(query))
//       );
//     });
    
//     setFilteredAddresses(filtered);
//   };

//   const clearSearch = () => {
//     setSearchQuery('');
//     if (searchRef.current) {
//       searchRef.current.clear();
//     }
//   };

//   // Search location using Google Places API
//   const searchLocation = async (text) => {
//     if (!text.trim() || text.length < 2) {
//       setSearchResults([]);
//       setShowSearchResults(false);
//       return;
//     }

//     setSearching(true);
//     try {
//       const response = await fetch(
//         `https://maps.googleapis.com/maps/api/place/autocomplete/json?input=${encodeURIComponent(
//           text
//         )}&key=${GMAP_API_KEY}&components=country:in&language=en`
//       );
      
//       const data = await response.json();
      
//       if (data.predictions) {
//         setSearchResults(data.predictions);
//         setShowSearchResults(true);
//       } else {
//         setSearchResults([]);
//         setShowSearchResults(false);
//       }
//     } catch (error) {
//       console.error('Search error:', error);
//     } finally {
//       setSearching(false);
//     }
//   };

//   // Get place details and update map
//   const selectPlace = async (placeId, description) => {
//     try {
//       setSearching(true);
      
//       const response = await fetch(
//         `https://maps.googleapis.com/maps/api/place/details/json?place_id=${placeId}&key=${GMAP_API_KEY}`
//       );
      
//       const data = await response.json();
      
//       if (data.result && data.result.geometry) {
//         const { lat, lng } = data.result.geometry.location;
        
//         setSelectedAddress(description);
//         setSelectedLocationCoords({ latitude: lat, longitude: lng });
//         setSearchText(description);
//         setShowSearchResults(false);

//         const newRegion = {
//           latitude: lat,
//           longitude: lng,
//           latitudeDelta: 0.01,
//           longitudeDelta: 0.01,
//         };

//         setMapRegion(newRegion);

//         if (mapRef.current) {
//           mapRef.current.animateToRegion(newRegion, 600);
//         }
//       }
//     } catch (error) {
//       console.error('Place details error:', error);
//       showCustomAlert('Error', 'Failed to get location details', 'error');
//     } finally {
//       setSearching(false);
//     }
//   };

//   const handleLocateMe = async () => {
//     let { status } = await Location.requestForegroundPermissionsAsync();
//     if (status !== 'granted') {
//       showCustomAlert('Permission Required', 'Enable location permission to find your current location', 'warning');
//       return;
//     }

//     setSearching(true);
//     try {
//       const loc = await Location.getCurrentPositionAsync({
//         accuracy: Location.Accuracy.High,
//       });

//       const { latitude, longitude } = loc.coords;

//       const newRegion = {
//         latitude: latitude,
//         longitude: longitude,
//         latitudeDelta: 0.01,
//         longitudeDelta: 0.01,
//       };

//       setMapRegion(newRegion);
//       setSelectedLocationCoords({ latitude, longitude });
      
//       // Reverse geocode to get address
//       const response = await fetch(
//         `https://maps.googleapis.com/maps/api/geocode/json?latlng=${latitude},${longitude}&key=${GMAP_API_KEY}`
//       );
//       const data = await response.json();
//       if (data.results && data.results.length > 0) {
//         const address = data.results[0].formatted_address;
//         setSelectedAddress(address);
//         setSearchText(address);
//       }
      
//       if (mapRef.current) {
//         mapRef.current.animateToRegion(newRegion, 1000);
//       }
//     } catch (error) {
//       console.error('Location error:', error);
//       showCustomAlert('Error', 'Could not get current location', 'error');
//     } finally {
//       setSearching(false);
//     }
//   };

//   const handleConfirm = () => {
//     const final = searchText.trim() || selectedAddress.trim();
//     if (!final) {
//       showCustomAlert('Pick Location', 'Please choose a location.', 'warning');
//       return;
//     }
    
//     if (!selectedLocationCoords) {
//       showCustomAlert('Pick Location', 'Please select a location on the map.', 'warning');
//       return;
//     }
    
//     setSelectedAddress(final);
//     setStep(3);
//   };

//   const handleAddAddress = () => {
//     if (Platform.OS !== 'web') {
//       Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
//     }
//     resetForm();
//     setSelectedAddress('');
//     setSelectedLocationCoords(null);
//     setSearchText('');
//     setSearchResults([]);
//     setShowSearchResults(false);
//     setStep(2);
//   };

//   const handleEditAddress = (address) => {
//     if (Platform.OS !== 'web') {
//       Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
//     }
//     setSelectedModalItem(address);
//     setModalType('edit');
//     setModalVisible(true);
//   };

//   const handleDeleteAddress = (address) => {
//     setSelectedModalItem(address);
//     setModalType('delete');
//     setModalVisible(true);
//   };

//   const confirmEdit = () => {
//     const address = selectedModalItem;
//     if (!address) return;
    
//     setEditingId(address.id);
//     setSelectedAddress(address.fullAddress);
//     setActiveType(address.type);
//     setHouse(address.house);
//     setArea(address.area);
//     setInstructions(address.instructions);
//     setMakeDefault(address.isDefault);
//     if (address.type === 'Others') setOtherLabel(address.label);
    
//     setModalVisible(false);
//     setSelectedModalItem(null);
//     setModalType(null);
//     setStep(3);
//   };

//   const confirmDelete = async () => {
//     setDeleting(true);
//     setDeletingId(selectedModalItem?.id);
    
//     try {
//       await DatabaseService.deleteAddress(selectedModalItem.id);
//       await loadAddresses();
      
//       if (Platform.OS !== 'web') {
//         Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
//       }
      
//       showCustomAlert('Success', 'Address deleted successfully', 'success');
//       setModalVisible(false);
//       setSelectedModalItem(null);
//       setModalType(null);
//     } catch (error) {
//       console.error('Error deleting address:', error);
//       showCustomAlert('Error', 'Failed to delete address. Please try again.', 'error');
//     } finally {
//       setDeleting(false);
//       setDeletingId(null);
//     }
//   };

//   const handleSave = async () => {
//     // Validate all required fields
//     if (!phoneNumber) {
//       showCustomAlert('Error', 'User not authenticated', 'error');
//       return;
//     }
    
//     if (!selectedAddress) {
//       showCustomAlert('Required', 'Please select a location first', 'warning');
//       return;
//     }
    
//     if (!selectedLocationCoords) {
//       showCustomAlert('Required', 'Please select a location on the map', 'warning');
//       return;
//     }

//     if (!house.trim()) {
//       showCustomAlert('Required', 'House / Flat / Floor No. is required', 'warning');
//       return;
//     }
    
//     if (!area.trim()) {
//       showCustomAlert('Required', 'Apartment / Road / Area is required', 'warning');
//       return;
//     }
    
//     if (activeType === 'Others' && !otherLabel.trim()) {
//       showCustomAlert('Required', 'Please enter a label name for Others category', 'warning');
//       return;
//     }

//     const payload = {
//       phone_number: phoneNumber.replace(/\s/g, ''),
//       label: activeType === 'Others' ? otherLabel.trim() : activeType,
//       type: activeType,
//       full_address: selectedAddress,
//       house: house.trim(),
//       area: area.trim(),
//       instructions: instructions.trim(),
//       is_default: makeDefault,
//       latitude: selectedLocationCoords.latitude,
//       longitude: selectedLocationCoords.longitude,
//     };

//     setSaving(true);
    
//     try {
//       if (editingId) {
//         await DatabaseService.updateAddress(editingId, payload);
//         showCustomAlert('Success', 'Address updated successfully', 'success');
//       } else {
//         await DatabaseService.saveAddress(payload);
//         showCustomAlert('Success', 'Address saved successfully', 'success');
//       }

//       await loadAddresses();
//       resetForm();
//       setStep(1);
//     } catch (e) {
//       console.error('Save failed', e);
//       showCustomAlert('Error', 'Failed to save address. Please try again.', 'error');
//     } finally {
//       setSaving(false);
//     }
//   };

//   const resetForm = () => {
//     setHouse('');
//     setArea('');
//     setInstructions('');
//     setMakeDefault(false);
//     setOtherLabel('');
//     setEditingId(null);
//     setActiveType('Home');
//     setSelectedAddress('');
//     setSelectedLocationCoords(null);
//   };

//   const getTypeIcon = (type) => {
//     const iconConfig = TYPE_ICONS[type] || TYPE_ICONS.Home;
//     const IconComponent = iconConfig.icon;
//     return <IconComponent name={iconConfig.name} size={20} color={iconConfig.color} />;
//   };

//   const handleBackFromMap = () => {
//     setStep(1);
//     setSearchText('');
//     setSearchResults([]);
//     setShowSearchResults(false);
//     setSelectedLocationCoords(null);
//   };

//   const renderAddressCard = (address) => (
//     <View key={address.id} style={styles.addressCard}>
//       <View style={styles.addressHeader}>
//         <View style={styles.addressTypeContainer}>
//           {getTypeIcon(address.type)}
//           <Text style={styles.addressTitle}>{address.label}</Text>
//           {address.isDefault && (
//             <View style={styles.defaultBadge}>
//               <Text style={styles.defaultBadgeText}>Default</Text>
//             </View>
//           )}
//         </View>
        
//         <View style={styles.addressActions}>
//           <TouchableOpacity 
//             style={styles.editButton}
//             onPress={() => handleEditAddress(address)}
//             disabled={deleting}
//           >
//             <MaterialIcons name="edit" size={20} color="#ED7117" />
//           </TouchableOpacity>
          
//           <TouchableOpacity 
//             style={styles.deleteButton}
//             onPress={() => handleDeleteAddress(address)}
//             disabled={deleting}
//           >
//             {deleting && deletingId === address.id ? (
//               <ActivityIndicator size="small" color="#ED7117" />
//             ) : (
//               <MaterialIcons name="delete-outline" size={20} color="#ED7117" />
//             )}
//           </TouchableOpacity>
//         </View>
//       </View>
      
//       <View style={styles.addressDetails}>
//         <Text style={styles.addressText}>{address.fullAddress}</Text>
        
//         {address.house ? (
//           <View style={styles.row}>
//             <MaterialIcons name="home" size={16} color="#184080" />
//             <Text style={styles.addressSub}> {address.house}</Text>
//           </View>
//         ) : null}

//         {address.area ? (
//           <View style={styles.row}>
//             <Ionicons name="location-outline" size={16} color="#184080" />
//             <Text style={styles.addressSub}> {address.area}</Text>
//           </View>
//         ) : null}

//         {address.instructions ? (
//           <View style={styles.row}>
//             <MaterialIcons name="info-outline" size={16} color="#184080" />
//             <Text style={styles.addressNote}> {address.instructions}</Text>
//           </View>
//         ) : null}
//       </View>
//     </View>
//   );

//   const renderEmptyState = () => (
//     <View style={styles.emptyStateContainer}>
//       <View style={styles.emptyStateIcon}>
//         <MaterialIcons name="location-off" size={80} color="#D1D5DB" />
//       </View>
//       <Text style={styles.emptyStateTitle}>
//         {searchQuery ? 'No matching addresses' : 'No Saved Addresses'}
//       </Text>
//       <Text style={styles.emptyStateText}>
//         {searchQuery 
//           ? `No addresses found matching "${searchQuery}"`
//           : "You haven't saved any addresses yet.\nAdd your first address to get started."}
//       </Text>
//       {searchQuery && (
//         <TouchableOpacity style={styles.clearSearchButton} onPress={clearSearch}>
//           <Text style={styles.clearSearchText}>Clear Search</Text>
//         </TouchableOpacity>
//       )}
//     </View>
//   );

//   const renderSearchResults = () => (
//     <View style={styles.searchResultsOverlay}>
//       <FlatList
//         data={searchResults}
//         keyExtractor={(item) => item.place_id}
//         keyboardShouldPersistTaps="handled"
//         renderItem={({ item }) => (
//           <TouchableOpacity
//             style={styles.searchResultItem}
//             onPress={() => selectPlace(item.place_id, item.description)}
//           >
//             <Ionicons name="location-outline" size={20} color={Colors.primary} />
//             <View style={styles.searchResultTextContainer}>
//               <Text style={styles.searchResultPrimary} numberOfLines={1}>
//                 {item.structured_formatting?.main_text || item.description}
//               </Text>
//               {item.structured_formatting?.secondary_text && (
//                 <Text style={styles.searchResultSecondary} numberOfLines={1}>
//                   {item.structured_formatting.secondary_text}
//                 </Text>
//               )}
//             </View>
//           </TouchableOpacity>
//         )}
//       />
//     </View>
//   );

//   const handleBack = () => navigation.goBack();

//   if (loading && step === 1 && addresses.length === 0) {
//     return (
//       <SafeAreaView style={styles.container}>
//         <StatusBar backgroundColor={Colors.white} barStyle="dark-content" />
//         <View style={styles.loaderContainer}>
//           <LottieView
//             source={require("../assets/loading.json")}
//             autoPlay
//             loop
//             style={{ width: 300, height: 300 }}
//           />
//         </View>
//       </SafeAreaView>
//     );
//   }

//   return (
//     <SafeAreaView style={styles.container}>
//       <StatusBar backgroundColor={Colors.white} barStyle="dark-content" />
//       <KeyboardAvoidingView
//         style={styles.keyboardAvoidingView}
//         behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
//       >
//         <View style={styles.header}>
//           <TouchableOpacity onPress={step === 2 ? handleBackFromMap : handleBack}>
//             <MaterialIcons name="arrow-back-ios" size={24} color="#ED7117" />
//           </TouchableOpacity>

//           <Text style={styles.headerTitle}>
//             {step === 1 ? "Saved Address" : step === 2 ? "Select Location" : "Save Address"}
//           </Text>

//           <View style={styles.headerSpacer} />
//         </View>

//         {/* Step 1: List Addresses */}
//         {step === 1 && (
//           <Animated.View 
//             style={[
//               styles.step1Container,
//               {
//                 opacity: fadeAnim,
//                 transform: [{ translateY: slideAnim }],
//               }
//             ]}
//           >
//             {/* Search Bar */}
//             <View style={styles.searchBarContainer}>
//               <View style={styles.searchInputWrapper}>
//                 <Ionicons name="search-outline" size={20} color={Colors.gray} style={styles.searchIcon} />
//                 <TextInput
//                   ref={searchRef}
//                   style={styles.searchInput}
//                   placeholder="Search saved addresses..."
//                   placeholderTextColor={Colors.gray}
//                   value={searchQuery}
//                   onChangeText={setSearchQuery}
//                   returnKeyType="search"
//                 />
//                 {searchQuery.length > 0 && (
//                   <TouchableOpacity onPress={clearSearch} style={styles.clearIcon}>
//                     <Ionicons name="close-circle" size={20} color={Colors.gray} />
//                   </TouchableOpacity>
//                 )}
//               </View>
//               {searchQuery.length > 0 && (
//                 <Text style={styles.searchResultCount}>
//                   Found {filteredAddresses.length} {filteredAddresses.length === 1 ? 'result' : 'results'}
//                 </Text>
//               )}
//             </View>

//             <ScrollView 
//               contentContainerStyle={[
//                 styles.scrollContent,
//                 filteredAddresses.length === 0 && !loading && { flex: 1, justifyContent: "center" }
//               ]}            
//               showsVerticalScrollIndicator={false}
//             >
//               {filteredAddresses.length === 0 ? renderEmptyState() : filteredAddresses.map(renderAddressCard)}
//             </ScrollView>
//           </Animated.View>
//         )}

//         {step === 1 && !loading && (
//           <TouchableOpacity style={styles.fab} onPress={handleAddAddress}>
//             <MaterialIcons name="add" size={30} color={Colors.white} />
//           </TouchableOpacity>
//         )}
        
//         {/* Step 2: Map View with Google Maps */}
//         {step === 2 && (
//           <View style={{ flex: 1 }}>
//             <MapView
//               ref={mapRef}
//               provider={PROVIDER_GOOGLE}
//               style={{ flex: 1 }}
//               region={mapRegion}
//               onRegionChangeComplete={(reg) => {
//                 setMapRegion(reg);
//               }}
//               onPress={(e) => {
//                 const { latitude, longitude } = e.nativeEvent.coordinate;
//                 setSelectedLocationCoords({ latitude, longitude });
//                 // Reverse geocode to get address
//                 fetch(
//                   `https://maps.googleapis.com/maps/api/geocode/json?latlng=${latitude},${longitude}&key=${GMAP_API_KEY}`
//                 )
//                   .then(res => res.json())
//                   .then(data => {
//                     if (data.results && data.results.length > 0) {
//                       const address = data.results[0].formatted_address;
//                       setSelectedAddress(address);
//                       setSearchText(address);
//                     }
//                   })
//                   .catch(err => console.error('Reverse geocode error:', err));
//               }}
//             >
//               <Marker 
//                 coordinate={selectedLocationCoords || mapRegion} 
//                 draggable
//                 onDragEnd={(e) => {
//                   const { latitude, longitude } = e.nativeEvent.coordinate;
//                   setSelectedLocationCoords({ latitude, longitude });
//                   // Reverse geocode to get address
//                   fetch(
//                     `https://maps.googleapis.com/maps/api/geocode/json?latlng=${latitude},${longitude}&key=${GMAP_API_KEY}`
//                   )
//                     .then(res => res.json())
//                     .then(data => {
//                       if (data.results && data.results.length > 0) {
//                         const address = data.results[0].formatted_address;
//                         setSelectedAddress(address);
//                         setSearchText(address);
//                       }
//                     })
//                     .catch(err => console.error('Reverse geocode error:', err));
//                 }}
//               />
//             </MapView>

//             {/* Search Results Overlay */}
//             {showSearchResults && searchResults.length > 0 && !searching && renderSearchResults()}

//             {/* Bottom Sheet */}
//             <View style={styles.mapSheet}>
//               <Text style={styles.sheetTitle}>Set location</Text>

//               <View style={styles.searchRow}>
//                 <View style={styles.searchInputContainer}>
//                   <Ionicons
//                     name="search-outline"
//                     size={20}
//                     color={Colors.gray}
//                     style={styles.searchIcon}
//                   />

//                   <TextInput
//                     style={styles.searchBox}
//                     placeholder="Search location"
//                     placeholderTextColor={Colors.gray}
//                     value={searchText}
//                     onChangeText={(text) => {
//                       setSearchText(text);

//                       if (text.trim().length >= 2) {
//                         searchLocation(text);
//                       } else {
//                         setSearchResults([]);
//                         setShowSearchResults(false);
//                       }
//                     }}
//                   />

//                   {searchText.length > 0 && (
//                     <TouchableOpacity
//                       onPress={() => {
//                         setSearchText('');
//                         setSearchResults([]);
//                         setShowSearchResults(false);
//                       }}
//                     >
//                       <Ionicons
//                         name="close-circle"
//                         size={20}
//                         color={Colors.gray}
//                       />
//                     </TouchableOpacity>
//                   )}
//                 </View>
//               </View>

//               {/* SEARCH RESULTS */}
//               {showSearchResults &&
//                 searchResults.length > 0 &&
//                 !searching &&
//                 renderSearchResults()}

//               {searching && (
//                 <View style={styles.searchingContainer}>
//                   <ActivityIndicator size="small" color={Colors.primary} />
//                   <Text style={styles.searchingText}>Searching...</Text>
//                 </View>
//               )}

//               <TouchableOpacity
//                 style={styles.locateRow}
//                 onPress={handleLocateMe}
//               >
//                 <MaterialIcons
//                   name="my-location"
//                   size={18}
//                   color="#ED7117"
//                 />
//                 <Text style={styles.locateText}>
//                   Use my current location
//                 </Text>
//               </TouchableOpacity>

//               {/* Selected Location Display */}
//               {selectedAddress && (
//                 <View style={styles.selectedLocationContainer}>
//                   <Text style={styles.selectedLocationLabel}>Selected Location:</Text>
//                   <Text style={styles.selectedLocationText} numberOfLines={2}>
//                     {selectedAddress}
//                   </Text>
//                 </View>
//               )}

//               {/* CONFIRM BUTTON */}
//               <TouchableOpacity
//                 style={[styles.standardButton, { marginTop: 16 }]}
//                 onPress={handleConfirm}
//                 activeOpacity={0.9}
//               >
//                 <Text style={styles.standardButtonText}>
//                   Confirm Location
//                 </Text>
//               </TouchableOpacity>
//             </View>
//           </View>
//         )}

//         {/* Step 3: Address Details Form */}
//         {step === 3 && (
//           <KeyboardAvoidingView
//             behavior={Platform.OS === 'ios' ? 'padding' : undefined}
//             style={{ flex: 1 }}
//           >
//             <ScrollView 
//               contentContainerStyle={styles.formScrollContent}
//               showsVerticalScrollIndicator={false}
//             >
//               <Text style={styles.locationHeader}>Your Location</Text>
//               <Text style={styles.locationText}>{selectedAddress}</Text>

//               <TouchableOpacity 
//                 style={styles.changeLocationButton}
//                 onPress={() => {
//                   setStep(2);
//                 }}
//               >
//                 <Ionicons name="location-outline" size={18} color="#ED7117" />
//                 <Text style={styles.changeLocationText}>Change Location</Text>
//               </TouchableOpacity>

//               <View style={styles.modernInputContainer}>
//                 <TextInput
//                   style={styles.modernInput}
//                   placeholder="House / Flat / Floor No. *"
//                   placeholderTextColor={Colors.gray}
//                   value={house}
//                   onChangeText={setHouse}
//                   editable={!saving}
//                 />
//               </View>

//               <View style={styles.modernInputContainer}>
//                 <TextInput
//                   style={styles.modernInput}
//                   placeholder="Apartment / Road / Area *"
//                   placeholderTextColor={Colors.gray}
//                   value={area}
//                   onChangeText={setArea}
//                   editable={!saving}
//                 />
//               </View>

//               <Text style={styles.sectionLabel}>Instructions (optional)</Text>
//               <View style={[styles.modernInputContainer, styles.textAreaContainer]}>
//                 <TextInput
//                   style={[styles.modernInput, styles.textArea]}
//                   placeholder="e.g. don't turn on AC"
//                   placeholderTextColor={Colors.gray}
//                   multiline
//                   value={instructions}
//                   onChangeText={setInstructions}
//                   editable={!saving}
//                 />
//               </View>

//               <Text style={styles.sectionLabel}>Save As</Text>
//               <View style={styles.typeRow}>
//                 {['Home', 'Work', 'Others'].map((t) => {
//                   const active = activeType === t;
//                   return (
//                     <TouchableOpacity
//                       key={t}
//                       style={[styles.typeBtn, active && styles.typeBtnActive]}
//                       onPress={() => setActiveType(t)}
//                       disabled={saving}
//                     >
//                       {getTypeIcon(t)}
//                       <Text style={[styles.typeBtnText, active && styles.typeBtnTextActive]}>
//                         {t}
//                       </Text>
//                     </TouchableOpacity>
//                   );
//                 })}
//               </View>

//               {activeType === 'Others' && (
//                 <View style={styles.modernInputContainer}>
//                   <TextInput
//                     style={styles.modernInput}
//                     placeholder="Label Name *"
//                     placeholderTextColor={Colors.gray}
//                     value={otherLabel}
//                     onChangeText={setOtherLabel}
//                     editable={!saving}
//                   />
//                 </View>
//               )}

//               <TouchableOpacity
//                 style={styles.defaultRow}
//                 onPress={() => setMakeDefault(!makeDefault)}
//                 disabled={saving}
//               >
//                 <View style={[styles.defaultCircle, makeDefault && styles.defaultCircleActive]}>
//                   {makeDefault && <MaterialIcons name="check" size={12} color="#fff" />}
//                 </View>
//                 <Text style={styles.defaultText}>Set as default address</Text>
//               </TouchableOpacity>
//             </ScrollView>

//             <View style={styles.bottomBar}>
//               <TouchableOpacity 
//                 style={[styles.standardButton, saving && styles.disabledButton]} 
//                 onPress={handleSave}
//                 activeOpacity={0.9}
//                 disabled={saving}
//               >
//                 {saving ? (
//                   <ActivityIndicator color="white" />
//                 ) : (
//                   <Text style={styles.standardButtonText}>Save Address Details</Text>
//                 )}
//               </TouchableOpacity>
//             </View>
//           </KeyboardAvoidingView>
//         )}
//       </KeyboardAvoidingView>

//       {/* Edit/Delete Modal */}
//       <Modal
//         visible={modalVisible}
//         transparent={true}
//         animationType="fade"
//         onRequestClose={() => {
//           setModalVisible(false);
//           setSelectedModalItem(null);
//           setModalType(null);
//         }}
//       >
//         <View style={styles.modalOverlay}>
//           <View style={styles.modalContent}>
//             {modalType === 'edit' && (
//               <>
//                 <Text style={styles.modalTitle}>Edit Address</Text>
//                 <Text style={styles.modalMessage}>
//                   Are you sure you want to edit "{selectedModalItem?.label}" address?
//                 </Text>
//                 <View style={styles.modalButtons}>
//                   <TouchableOpacity
//                     style={[styles.modalButton, styles.cancelButton]}
//                     onPress={() => {
//                       setModalVisible(false);
//                       setSelectedModalItem(null);
//                       setModalType(null);
//                     }}
//                   >
//                     <Text style={styles.cancelButtonText}>Cancel</Text>
//                   </TouchableOpacity>
//                   <TouchableOpacity
//                     style={[styles.modalButton, styles.editModalButton]}
//                     onPress={confirmEdit}
//                   >
//                     <Text style={styles.modalButtonText}>Edit</Text>
//                   </TouchableOpacity>
//                 </View>
//               </>
//             )}

//             {modalType === 'delete' && (
//               <>
//                 <Text style={styles.modalTitle}>Delete Address</Text>
//                 <Text style={styles.modalMessage}>
//                   Are you sure you want to delete "{selectedModalItem?.label}" address? This action cannot be undone.
//                 </Text>
//                 <View style={styles.modalButtons}>
//                   <TouchableOpacity
//                     style={[styles.modalButton, styles.cancelButton]}
//                     onPress={() => {
//                       setModalVisible(false);
//                       setSelectedModalItem(null);
//                       setModalType(null);
//                     }}
//                   >
//                     <Text style={styles.cancelButtonText}>Cancel</Text>
//                   </TouchableOpacity>
//                   <TouchableOpacity
//                     style={[styles.modalButton, styles.deleteModalButton]}
//                     onPress={confirmDelete}
//                   >
//                     {deleting && deletingId === selectedModalItem?.id ? (
//                       <ActivityIndicator size="small" color="#fff" />
//                     ) : (
//                       <Text style={styles.modalButtonText}>Delete</Text>
//                     )}
//                   </TouchableOpacity>
//                 </View>
//               </>
//             )}
//           </View>
//         </View>
//       </Modal>

//       <CustomAlert
//         visible={alertVisible}
//         title={alertConfig.title}
//         message={alertConfig.message}
//         icon={alertConfig.icon}
//         iconColor={alertConfig.iconColor}
//         buttons={alertConfig.buttons}
//         onBackdropPress={() => setAlertVisible(false)}
//       />
//     </SafeAreaView>
//   );
// }

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     backgroundColor: Colors.white,
//   },
//   keyboardAvoidingView: {
//     flex: 1,
//   },
//   header: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     paddingHorizontal: 16,
//     paddingVertical: 12,
//     borderBottomWidth: 0.5,
//     borderBottomColor: '#F3F4F6',
//   },
//   headerTitle: {
//     fontSize: 28,
//     fontWeight: '700',
//     color: Colors.primary,
//     flex: 1,
//     textAlign: 'center',
//   },
//   headerSpacer: {
//     width: 44,
//   },
//   step1Container: {
//     flex: 1,
//   },
//   searchBarContainer: {
//     paddingHorizontal: 16,
//     paddingTop: 12,
//     paddingBottom: 8,
//     backgroundColor: Colors.white,
//     borderBottomWidth: 1,
//     borderBottomColor: '#F3F4F6',
//   },
//   searchInputWrapper: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     backgroundColor: '#F9FAFB',
//     borderRadius: 12,
//     borderWidth: 1,
//     borderColor: '#E5E7EB',
//     paddingHorizontal: 12,
//     height: 44,
//   },
//   searchIcon: {
//     marginRight: 8,
//   },
//   searchInput: {
//     flex: 1,
//     fontSize: 15,
//     color: Colors.dark,
//     paddingVertical: 0,
//   },
//   clearIcon: {
//     padding: 4,
//   },
//   searchResultCount: {
//     fontSize: 12,
//     color: Colors.gray,
//     marginTop: 8,
//     marginLeft: 4,
//   },
//   scrollContent: {
//     paddingHorizontal: 16,
//     paddingBottom: 30,
//     paddingTop: 16,
//   },
//   loaderContainer: {
//     flex: 1,
//     justifyContent: 'center',
//     alignItems: 'center',
//     backgroundColor: Colors.white,
//   },
//   addressCard: {
//     backgroundColor: Colors.white,
//     borderRadius: 16,
//     padding: 16,
//     marginBottom: 16,
//     shadowColor: '#000',
//     shadowOffset: { width: 0, height: 2 },
//     shadowOpacity: 0.05,
//     shadowRadius: 8,
//     elevation: 3,
//     borderWidth: 1,
//     borderColor: '#F3F4F6',
//   },
//   addressHeader: {
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//     alignItems: 'center',
//     marginBottom: 12,
//   },
//   addressTypeContainer: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     gap: 8,
//   },
//   addressTitle: {
//     fontSize: 16,
//     fontWeight: '600',
//     color: Colors.primary,
//   },
//   defaultBadge: {
//     backgroundColor: '#DCFCE7',
//     paddingHorizontal: 8,
//     paddingVertical: 2,
//     borderRadius: 12,
//     marginLeft: 8,
//   },
//   defaultBadgeText: {
//     fontSize: 11,
//     color: '#166534',
//     fontWeight: '600',
//   },
//   addressActions: {
//     flexDirection: 'row',
//     gap: 12,
//   },
//   editButton: {
//     padding: 4,
//   },
//   deleteButton: {
//     padding: 4,
//   },
//   addressDetails: {
//     gap: 6,
//   },
//   addressText: {
//     fontSize: 14,
//     color: '#374151',
//     lineHeight: 20,
//   },
//   addressSub: {
//     fontSize: 13,
//     color: '#6B7280',
//   },
//   addressNote: {
//     fontSize: 12,
//     color: '#9CA3AF',
//   },
//   emptyStateContainer: {
//     flex: 1,
//     justifyContent: 'center',
//     alignItems: 'center',
//     paddingVertical: 60,
//   },
//   emptyStateIcon: {
//     marginBottom: 24,
//   },
//   emptyStateTitle: {
//     fontSize: 20,
//     fontWeight: '700',
//     color: '#374151',
//     marginBottom: 12,
//   },
//   emptyStateText: {
//     fontSize: 14,
//     color: '#6B7280',
//     textAlign: 'center',
//     lineHeight: 22,
//     marginBottom: 32,
//   },
//   clearSearchButton: {
//     backgroundColor: '#ED7117',
//     paddingHorizontal: 20,
//     paddingVertical: 10,
//     borderRadius: 20,
//   },
//   clearSearchText: {
//     color: Colors.white,
//     fontSize: 14,
//     fontWeight: '600',
//   },
//   mapSheet: {
//     backgroundColor: '#fff',
//     padding: 16,
//     borderTopLeftRadius: 20,
//     borderTopRightRadius: 20,
//     position: 'absolute',
//     bottom: 0,
//     left: 0,
//     right: 0,
//     elevation: 10,
//     paddingBottom: 20,
//   },
//   sheetTitle: {
//     fontSize: 14,
//     fontWeight: '600',
//     color: Colors.primary,
//     marginBottom: 8,
//   },
//   searchRow: {
//     flexDirection: 'row',
//     marginTop: 8,
//     gap: 10,
//     alignItems: 'center',
//   },
//   searchInputContainer: {
//     flex: 1,
//     flexDirection: 'row',
//     alignItems: 'center',
//     backgroundColor: '#F9FAFB',
//     borderRadius: 12,
//     borderWidth: 1,
//     borderColor: '#E5E7EB',
//     paddingHorizontal: 12,
//   },
//   searchBox: {
//     flex: 1,
//     paddingVertical: 12,
//     fontSize: 14,
//     color: Colors.dark,
//   },
//   searchResultsOverlay: {
//     position: 'absolute',
//     top: 120,
//     left: 16,
//     right: 16,
//     backgroundColor: '#fff',
//     borderRadius: 14,
//     maxHeight: 220,
//     borderWidth: 1,
//     borderColor: '#E5E7EB',
//     zIndex: 1000,
//     elevation: 5,
//   },
//   searchResultItem: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     padding: 14,
//     borderBottomWidth: 0.5,
//     borderBottomColor: '#E5E7EB',
//   },
//   searchResultTextContainer: {
//     flex: 1,
//     marginLeft: 12,
//   },
//   searchResultPrimary: {
//     fontSize: 14,
//     color: Colors.dark,
//     fontWeight: '500',
//   },
//   searchResultSecondary: {
//     fontSize: 12,
//     color: '#6B7280',
//     marginTop: 2,
//   },
//   searchingContainer: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     justifyContent: 'center',
//     paddingVertical: 10,
//   },
//   searchingText: {
//     marginLeft: 8,
//     fontSize: 12,
//     color: Colors.gray,
//   },
//   locateRow: {
//     flexDirection: 'row',
//     marginTop: 12,
//     alignItems: 'center',
//     paddingVertical: 8,
//   },
//   locateText: {
//     marginLeft: 8,
//     color: '#ED7117',
//     fontWeight: '600',
//     fontSize: 13,
//   },
//   selectedLocationContainer: {
//     marginTop: 12,
//     padding: 12,
//     backgroundColor: '#F3F4F6',
//     borderRadius: 12,
//   },
//   selectedLocationLabel: {
//     fontSize: 12,
//     color: '#6B7280',
//     marginBottom: 4,
//   },
//   selectedLocationText: {
//     fontSize: 13,
//     color: '#1F2937',
//     fontWeight: '500',
//   },
//   formScrollContent: {
//     paddingHorizontal: 20,
//     paddingBottom: 20,
//     paddingTop: 20,
//   },
//   locationHeader: {
//     fontSize: 18,
//     fontWeight: '600',
//     color: Colors.primary,
//     marginBottom: 4,
//   },
//   locationText: {
//     fontSize: 14,
//     color: '#555',
//     marginBottom: 12,
//     lineHeight: 20,
//   },
//   changeLocationButton: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     gap: 8,
//     marginBottom: 20,
//     paddingVertical: 8,
//     paddingHorizontal: 12,
//     backgroundColor: '#FFF7ED',
//     borderRadius: 8,
//     alignSelf: 'flex-start',
//   },
//   changeLocationText: {
//     color: '#ED7117',
//     fontSize: 13,
//     fontWeight: '600',
//   },
//   modernInputContainer: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     borderWidth: 1.5,
//     borderColor: '#E5E7EB',
//     borderRadius: 12,
//     paddingHorizontal: 14,
//     backgroundColor: '#F9FAFB',
//     height: 48,
//     width: '100%',
//     marginBottom: 14,
//   },
//   textAreaContainer: {
//     height: 90,
//     alignItems: 'flex-start',
//   },
//   textArea: {
//     height: 80,
//     textAlignVertical: 'top',
//     paddingTop: 12,
//   },
//   modernInput: {
//     flex: 1,
//     fontSize: 14,
//     color: Colors.dark,
//     fontWeight: '500',
//     paddingVertical: 0,
//     height: '100%',
//     textAlignVertical: 'center',
//     includeFontPadding: false,
//   },
//   sectionLabel: {
//     fontSize: 14,
//     color: Colors.primary,
//     fontWeight: '600',
//     marginBottom: 10,
//     marginTop: 6,
//   },
//   typeRow: {
//     flexDirection: 'row',
//     gap: 10,
//     marginBottom: 16,
//   },
//   typeBtn: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     gap: 6,
//     paddingHorizontal: 14,
//     paddingVertical: 10,
//     borderRadius: 10,
//     borderWidth: 1.5,
//     borderColor: '#E5E7EB',
//     backgroundColor: '#fff',
//   },
//   typeBtnActive: {
//     backgroundColor: '#FFEDD5',
//     borderColor: '#ED7117',
//   },
//   typeBtnText: {
//     fontSize: 13,
//     color: '#444',
//     fontWeight: '500',
//   },
//   typeBtnTextActive: {
//     color: '#ED7117',
//     fontWeight: '600',
//   },
//   defaultRow: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     marginTop: 16,
//   },
//   defaultCircle: {
//     width: 20,
//     height: 20,
//     borderRadius: 10,
//     borderWidth: 2,
//     borderColor: '#9CA3AF',
//     alignItems: 'center',
//     justifyContent: 'center',
//     marginRight: 10,
//   },
//   defaultCircleActive: {
//     backgroundColor: '#ED7117',
//     borderColor: '#ED7117',
//   },
//   defaultText: {
//     color: '#374151',
//     fontWeight: '500',
//     fontSize: 14,
//   },
//   bottomBar: {
//     padding: 16,
//     backgroundColor: Colors.white,
//     borderTopWidth: 1,
//     bottom: 0,
//     left: 0,
//     right: 0,
//     borderTopColor: '#E5E7EB',
//   },
//   standardButton: {
//     backgroundColor: '#184080',
//     borderRadius: 12,
//     paddingVertical: 14,
//     justifyContent: 'center',
//     alignItems: 'center',
//     shadowColor: '#184080',
//     shadowOffset: { width: 0, height: 2 },
//     shadowOpacity: 0.2,
//     shadowRadius: 4,
//     elevation: 3,
//   },
//   standardButtonText: {
//     color: Colors.white,
//     fontSize: 16,
//     fontWeight: '700',
//   },
//   disabledButton: {
//     opacity: 0.6,
//   },
//   row: {
//     flexDirection: "row",
//     alignItems: "center",
//     marginTop: 2,
//   },
//   fab: {
//     position: "absolute",
//     bottom: 30,
//     right: 20,
//     width: 60,
//     height: 60,
//     borderRadius: 30,
//     backgroundColor: Colors.primary,
//     justifyContent: "center",
//     alignItems: "center",
//     elevation: 8,
//     shadowColor: "#000",
//     shadowOpacity: 0.2,
//     shadowRadius: 6,
//     shadowOffset: { width: 0, height: 4 },
//   },
//   modalOverlay: {
//     flex: 1,
//     backgroundColor: 'rgba(0, 0, 0, 0.5)',
//     justifyContent: 'center',
//     alignItems: 'center',
//   },
//   modalContent: {
//     backgroundColor: '#fff',
//     borderRadius: 20,
//     padding: 24,
//     width: '85%',
//     maxWidth: 340,
//     shadowColor: '#000',
//     shadowOffset: {
//       width: 0,
//       height: 2,
//     },
//     shadowOpacity: 0.25,
//     shadowRadius: 4,
//     elevation: 5,
//   },
//   modalTitle: {
//     fontSize: 20,
//     fontWeight: '700',
//     color: '#1F2937',
//     marginBottom: 12,
//     textAlign: 'center',
//   },
//   modalMessage: {
//     fontSize: 14,
//     color: '#6B7280',
//     textAlign: 'center',
//     marginBottom: 24,
//     lineHeight: 20,
//   },
//   modalButtons: {
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//     gap: 12,
//   },
//   modalButton: {
//     flex: 1,
//     paddingVertical: 12,
//     borderRadius: 10,
//     alignItems: 'center',
//     justifyContent: 'center',
//   },
//   cancelButton: {
//     backgroundColor: '#F3F4F6',
//   },
//   cancelButtonText: {
//     color: '#6B7280',
//     fontSize: 14,
//     fontWeight: '600',
//   },
//   editModalButton: {
//     backgroundColor: '#ED7117',
//   },
//   deleteModalButton: {
//     backgroundColor: '#EF4444',
//   },
//   modalButtonText: {
//     color: '#fff',
//     fontSize: 14,
//     fontWeight: '600',
//   },
// });
import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  StatusBar,
  Dimensions,
  Modal,
  Animated,
  KeyboardAvoidingView,
  Platform,
  TextInput,
  ActivityIndicator,
  FlatList,
  Keyboard,
  TouchableWithoutFeedback,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons, Ionicons } from '@expo/vector-icons';
import * as Location from 'expo-location';
import { Colors } from '../constants/Colors';
import LottieView from "lottie-react-native";

// Import MapView with proper platform handling
import MapView, { Marker, PROVIDER_GOOGLE } from 'react-native-maps';
import { GooglePlacesAutocomplete } from 'react-native-google-places-autocomplete';

import * as Haptics from 'expo-haptics';
import DatabaseService from '../services/savedaddress_ds';
import { useAuth } from "../context/AuthContext";
import CustomAlert from '../components/CustomAlert';
import { GMAP_API_KEY } from '../config/config_ip';

const { width, height } = Dimensions.get('window');

const TYPE_ICONS = {
  Home: { icon: MaterialIcons, name: 'home', color: '#ED7117' },
  Work: { icon: MaterialIcons, name: 'work', color: '#184080' },
  Others: { icon: Ionicons, name: 'location-outline', color: '#6B7280' },
};

const normalizeAddress = (a) => ({
  id: a.id,
  label: a.label,
  type: a.type,
  fullAddress: a.full_address,
  house: a.house || '',
  area: a.area || '',
  instructions: a.instructions || '',
  isDefault: a.is_default,
  latitude: a.latitude,
  longitude: a.longitude,
});

export default function SavedAddressesScreen({ navigation, route }) {
  const { user } = useAuth();
  const phoneNumber = user?.phone_number;

  // States
  const [step, setStep] = useState(1);
  const [addresses, setAddresses] = useState([]);
  const [filteredAddresses, setFilteredAddresses] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [deletingId, setDeletingId] = useState(null);
  const [mapRegion, setMapRegion] = useState({
    latitude: 28.6139,
    longitude: 77.2090,
    latitudeDelta: 0.01,
    longitudeDelta: 0.01,
  });
  const [selectedAddress, setSelectedAddress] = useState('');
  const [selectedLocationCoords, setSelectedLocationCoords] = useState(null);
  const [searchText, setSearchText] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [searching, setSearching] = useState(false);
  const [showSearchResults, setShowSearchResults] = useState(false);
  const [activeType, setActiveType] = useState('Home');
  const [otherLabel, setOtherLabel] = useState('');
  const [house, setHouse] = useState('');
  const [area, setArea] = useState('');
  const [instructions, setInstructions] = useState('');
  const [makeDefault, setMakeDefault] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [loadingCurrentLocation, setLoadingCurrentLocation] = useState(false);
  
  // Modal states
  const [modalVisible, setModalVisible] = useState(false);
  const [modalType, setModalType] = useState(null);
  const [selectedModalItem, setSelectedModalItem] = useState(null);
  
  // Custom Alert states
  const [alertVisible, setAlertVisible] = useState(false);
  const [alertConfig, setAlertConfig] = useState({
    title: "",
    message: "",
    icon: "check-circle",
    iconColor: "#10B981",
    buttons: []
  });
  
  // Animation refs
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;
  const mapRef = useRef(null);
  const autocompleteRef = useRef(null);

  const showCustomAlert = (title, message, type = 'success') => {
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
    
    setAlertConfig({
      title,
      message,
      icon,
      iconColor,
      buttons: [{ text: 'OK', onPress: () => setAlertVisible(false) }]
    });
    setAlertVisible(true);
  };

  const showConfirmationAlert = (title, message, onConfirm, confirmText = 'Delete') => {
    setAlertConfig({
      title,
      message,
      icon: "warning",
      iconColor: "#F59E0B",
      buttons: [
        { text: 'Cancel', onPress: () => setAlertVisible(false), style: 'cancel' },
        { text: confirmText, onPress: () => {
          setAlertVisible(false);
          onConfirm();
        }, style: 'destructive' }
      ]
    });
    setAlertVisible(true);
  };

  // Initial load
  useEffect(() => {
    loadAddresses();
    
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 500,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  // Filter addresses when search query changes
  useEffect(() => {
    filterAddresses();
  }, [searchQuery, addresses]);

  const loadAddresses = async () => {
    try {
      if (!phoneNumber) return;
      
      setLoading(true);
      const res = await DatabaseService.getAddresses(
        phoneNumber.replace(/\s/g, '')
      );

      if (Array.isArray(res)) {
        const sorted = res
          .map(normalizeAddress)
          .sort((a, b) => b.id - a.id);

        setAddresses(sorted);
        setFilteredAddresses(sorted);
      }
    } catch (error) {
      console.error('Error loading addresses:', error);
      showCustomAlert('Error', 'Failed to load addresses', 'error');
    } finally {
      setLoading(false);
    }
  };

  const filterAddresses = () => {
    if (!searchQuery.trim()) {
      setFilteredAddresses(addresses);
      return;
    }

    const query = searchQuery.toLowerCase().trim();
    const filtered = addresses.filter(address => {
      return (
        address.label.toLowerCase().includes(query) ||
        address.fullAddress.toLowerCase().includes(query) ||
        address.house.toLowerCase().includes(query) ||
        address.area.toLowerCase().includes(query) ||
        (address.instructions && address.instructions.toLowerCase().includes(query))
      );
    });
    
    setFilteredAddresses(filtered);
  };

  const clearSearch = () => {
    setSearchQuery('');
  };

  // Reverse geocode function
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

  // Handle place selection from Google Places
  const handlePlaceSelect = (data, details = null) => {
    if (!details) return;

    const { lat, lng } = details.geometry.location;
    const address = data.description;
    
    setSelectedAddress(address);
    setSelectedLocationCoords({ latitude: lat, longitude: lng });
    setSearchText(address);
    setShowSearchResults(false);

    const newRegion = {
      latitude: lat,
      longitude: lng,
      latitudeDelta: 0.01,
      longitudeDelta: 0.01,
    };

    setMapRegion(newRegion);

    if (mapRef.current) {
      mapRef.current.animateToRegion(newRegion, 600);
    }
  };

  const handleLocateMe = async () => {
    setLoadingCurrentLocation(true);
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        showCustomAlert('Permission Required', 'Enable location permission to find your current location', 'warning');
        setLoadingCurrentLocation(false);
        return;
      }

      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.High,
      });

      const { latitude, longitude } = location.coords;

      const newRegion = {
        latitude: latitude,
        longitude: longitude,
        latitudeDelta: 0.01,
        longitudeDelta: 0.01,
      };

      setMapRegion(newRegion);
      setSelectedLocationCoords({ latitude, longitude });
      
      // Reverse geocode to get address
      const address = await reverseGeocode(latitude, longitude);
      setSelectedAddress(address);
      setSearchText(address);
      
      if (mapRef.current) {
        mapRef.current.animateToRegion(newRegion, 1000);
      }
      
      if (Platform.OS !== 'web') {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      }
    } catch (error) {
      console.error('Location error:', error);
      showCustomAlert('Error', 'Could not get current location', 'error');
    } finally {
      setLoadingCurrentLocation(false);
    }
  };

  const handleMapLongPress = async (e) => {
    const { latitude, longitude } = e.nativeEvent.coordinate;
    
    setSelectedLocationCoords({ latitude, longitude });
    
    // Reverse geocode to get address
    const address = await reverseGeocode(latitude, longitude);
    setSelectedAddress(address);
    setSearchText(address);
    
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
  };

  const handleConfirm = () => {
    const final = searchText.trim() || selectedAddress.trim();
    if (!final) {
      showCustomAlert('Pick Location', 'Please choose a location.', 'warning');
      return;
    }
    
    if (!selectedLocationCoords) {
      showCustomAlert('Pick Location', 'Please select a location on the map.', 'warning');
      return;
    }
    
    setSelectedAddress(final);
    setStep(3);
  };

  const handleAddAddress = () => {
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    resetForm();
    setSelectedAddress('');
    setSelectedLocationCoords(null);
    setSearchText('');
    setStep(2);
  };

  const handleEditAddress = (address) => {
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    setSelectedModalItem(address);
    setModalType('edit');
    setModalVisible(true);
  };

  const handleDeleteAddress = (address) => {
    setSelectedModalItem(address);
    setModalType('delete');
    setModalVisible(true);
  };

  const confirmEdit = () => {
    const address = selectedModalItem;
    if (!address) return;
    
    setEditingId(address.id);
    setSelectedAddress(address.fullAddress);
    setActiveType(address.type);
    setHouse(address.house);
    setArea(address.area);
    setInstructions(address.instructions);
    setMakeDefault(address.isDefault);
    if (address.type === 'Others') setOtherLabel(address.label);
    
    // Set coordinates if available
    if (address.latitude && address.longitude) {
      setSelectedLocationCoords({ latitude: address.latitude, longitude: address.longitude });
      setMapRegion({
        latitude: address.latitude,
        longitude: address.longitude,
        latitudeDelta: 0.01,
        longitudeDelta: 0.01,
      });
      setSearchText(address.fullAddress);
    }
    
    setModalVisible(false);
    setSelectedModalItem(null);
    setModalType(null);
    setStep(3);
  };

  const confirmDelete = async () => {
    setDeleting(true);
    setDeletingId(selectedModalItem?.id);
    
    try {
      await DatabaseService.deleteAddress(selectedModalItem.id);
      await loadAddresses();
      
      if (Platform.OS !== 'web') {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      }
      
      showCustomAlert('Success', 'Address deleted successfully', 'success');
      setModalVisible(false);
      setSelectedModalItem(null);
      setModalType(null);
    } catch (error) {
      console.error('Error deleting address:', error);
      showCustomAlert('Error', 'Failed to delete address. Please try again.', 'error');
    } finally {
      setDeleting(false);
      setDeletingId(null);
    }
  };

  const handleSave = async () => {
    // Validate all required fields
    if (!phoneNumber) {
      showCustomAlert('Error', 'User not authenticated', 'error');
      return;
    }
    
    if (!selectedAddress) {
      showCustomAlert('Required', 'Please select a location first', 'warning');
      return;
    }
    
    if (!selectedLocationCoords) {
      showCustomAlert('Required', 'Please select a location on the map', 'warning');
      return;
    }

    if (!house.trim()) {
      showCustomAlert('Required', 'House / Flat / Floor No. is required', 'warning');
      return;
    }
    
    if (!area.trim()) {
      showCustomAlert('Required', 'Apartment / Road / Area is required', 'warning');
      return;
    }
    
    if (activeType === 'Others' && !otherLabel.trim()) {
      showCustomAlert('Required', 'Please enter a label name for Others category', 'warning');
      return;
    }

    const payload = {
      phone_number: phoneNumber.replace(/\s/g, ''),
      label: activeType === 'Others' ? otherLabel.trim() : activeType,
      type: activeType,
      full_address: selectedAddress,
      house: house.trim(),
      area: area.trim(),
      instructions: instructions.trim(),
      is_default: makeDefault,
      latitude: selectedLocationCoords.latitude,
      longitude: selectedLocationCoords.longitude,
    };

    setSaving(true);
    
    try {
      if (editingId) {
        await DatabaseService.updateAddress(editingId, payload);
        showCustomAlert('Success', 'Address updated successfully', 'success');
      } else {
        await DatabaseService.saveAddress(payload);
        showCustomAlert('Success', 'Address saved successfully', 'success');
      }

      await loadAddresses();
      resetForm();
      setStep(1);
    } catch (e) {
      console.error('Save failed', e);
      showCustomAlert('Error', 'Failed to save address. Please try again.', 'error');
    } finally {
      setSaving(false);
    }
  };

  const resetForm = () => {
    setHouse('');
    setArea('');
    setInstructions('');
    setMakeDefault(false);
    setOtherLabel('');
    setEditingId(null);
    setActiveType('Home');
    setSelectedAddress('');
    setSelectedLocationCoords(null);
  };

  const getTypeIcon = (type) => {
    const iconConfig = TYPE_ICONS[type] || TYPE_ICONS.Home;
    const IconComponent = iconConfig.icon;
    return <IconComponent name={iconConfig.name} size={20} color={iconConfig.color} />;
  };

  const handleBackFromMap = () => {
    setStep(1);
    setSearchText('');
    setSelectedLocationCoords(null);
    setSelectedAddress('');
  };

  const renderAddressCard = (address) => (
    <View key={address.id} style={styles.addressCard}>
      <View style={styles.addressHeader}>
        <View style={styles.addressTypeContainer}>
          {getTypeIcon(address.type)}
          <Text style={styles.addressTitle}>{address.label}</Text>
          {address.isDefault && (
            <View style={styles.defaultBadge}>
              <Text style={styles.defaultBadgeText}>Default</Text>
            </View>
          )}
        </View>
        
        <View style={styles.addressActions}>
          <TouchableOpacity 
            style={styles.editButton}
            onPress={() => handleEditAddress(address)}
            disabled={deleting}
          >
            <MaterialIcons name="edit" size={20} color="#ED7117" />
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.deleteButton}
            onPress={() => handleDeleteAddress(address)}
            disabled={deleting}
          >
            {deleting && deletingId === address.id ? (
              <ActivityIndicator size="small" color="#ED7117" />
            ) : (
              <MaterialIcons name="delete-outline" size={20} color="#ED7117" />
            )}
          </TouchableOpacity>
        </View>
      </View>
      
      <View style={styles.addressDetails}>
        <Text style={styles.addressText}>{address.fullAddress}</Text>
        
        {address.house ? (
          <View style={styles.row}>
            <MaterialIcons name="home" size={16} color="#184080" />
            <Text style={styles.addressSub}> {address.house}</Text>
          </View>
        ) : null}

        {address.area ? (
          <View style={styles.row}>
            <Ionicons name="location-outline" size={16} color="#184080" />
            <Text style={styles.addressSub}> {address.area}</Text>
          </View>
        ) : null}

        {address.instructions ? (
          <View style={styles.row}>
            <MaterialIcons name="info-outline" size={16} color="#184080" />
            <Text style={styles.addressNote}> {address.instructions}</Text>
          </View>
        ) : null}
      </View>
    </View>
  );

  const renderEmptyState = () => (
    <View style={styles.emptyStateContainer}>
      <View style={styles.emptyStateIcon}>
        <MaterialIcons name="location-off" size={80} color="#D1D5DB" />
      </View>
      <Text style={styles.emptyStateTitle}>
        {searchQuery ? 'No matching addresses' : 'No Saved Addresses'}
      </Text>
      <Text style={styles.emptyStateText}>
        {searchQuery 
          ? `No addresses found matching "${searchQuery}"`
          : "You haven't saved any addresses yet.\nAdd your first address to get started."}
      </Text>
      {searchQuery && (
        <TouchableOpacity style={styles.clearSearchButton} onPress={clearSearch}>
          <Text style={styles.clearSearchText}>Clear Search</Text>
        </TouchableOpacity>
      )}
    </View>
  );

  const handleBack = () => navigation.goBack();

  if (loading && step === 1 && addresses.length === 0) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar backgroundColor={Colors.white} barStyle="dark-content" />
        <View style={styles.loaderContainer}>
          <LottieView
            source={require("../assets/loading.json")}
            autoPlay
            loop
            style={{ width: 300, height: 300 }}
          />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar backgroundColor={Colors.white} barStyle="dark-content" />
      <KeyboardAvoidingView
        style={styles.keyboardAvoidingView}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <View style={styles.header}>
          <TouchableOpacity onPress={step === 2 ? handleBackFromMap : handleBack}>
            <MaterialIcons name="arrow-back-ios" size={24} color="#ED7117" />
          </TouchableOpacity>

          <Text style={styles.headerTitle}>
            {step === 1 ? "Saved Address" : step === 2 ? "Select Location" : "Save Address"}
          </Text>

          <View style={styles.headerSpacer} />
        </View>

        {/* Step 1: List Addresses */}
        {step === 1 && (
          <Animated.View 
            style={[
              styles.step1Container,
              {
                opacity: fadeAnim,
                transform: [{ translateY: slideAnim }],
              }
            ]}
          >
            {/* Search Bar */}
            <View style={styles.searchBarContainer}>
              <View style={styles.searchInputWrapper}>
                <Ionicons name="search-outline" size={20} color={Colors.gray} style={styles.searchIcon} />
                <TextInput
                  style={styles.searchInput}
                  placeholder="Search saved addresses..."
                  placeholderTextColor={Colors.gray}
                  value={searchQuery}
                  onChangeText={setSearchQuery}
                  returnKeyType="search"
                />
                {searchQuery.length > 0 && (
                  <TouchableOpacity onPress={clearSearch} style={styles.clearIcon}>
                    <Ionicons name="close-circle" size={20} color={Colors.gray} />
                  </TouchableOpacity>
                )}
              </View>
              {searchQuery.length > 0 && (
                <Text style={styles.searchResultCount}>
                  Found {filteredAddresses.length} {filteredAddresses.length === 1 ? 'result' : 'results'}
                </Text>
              )}
            </View>

            <ScrollView 
              contentContainerStyle={[
                styles.scrollContent,
                filteredAddresses.length === 0 && !loading && { flex: 1, justifyContent: "center" }
              ]}            
              showsVerticalScrollIndicator={false}
            >
              {filteredAddresses.length === 0 ? renderEmptyState() : filteredAddresses.map(renderAddressCard)}
            </ScrollView>
          </Animated.View>
        )}

        {step === 1 && !loading && (
          <TouchableOpacity style={styles.fab} onPress={handleAddAddress}>
            <MaterialIcons name="add" size={30} color={Colors.white} />
          </TouchableOpacity>
        )}
        
        {/* Step 2: Map View with Google Maps */}
        {step === 2 && (
          <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
            <View style={{ flex: 1 }}>
              {/* Google Map */}
              <MapView
                ref={mapRef}
                provider={PROVIDER_GOOGLE}
                style={styles.map}
                region={mapRegion}
                onLongPress={handleMapLongPress}
                showsUserLocation={true}
                showsMyLocationButton={false}
              >
                {selectedLocationCoords && (
                  <Marker 
                    coordinate={selectedLocationCoords}
                    draggable
                    onDragEnd={async (e) => {
                      const { latitude, longitude } = e.nativeEvent.coordinate;
                      setSelectedLocationCoords({ latitude, longitude });
                      const address = await reverseGeocode(latitude, longitude);
                      setSelectedAddress(address);
                      setSearchText(address);
                    }}
                  />
                )}
              </MapView>

              {/* Map Control Buttons */}
              <View style={styles.mapControlButtons}>
                <TouchableOpacity
                  style={styles.mapControlButton}
                  onPress={handleLocateMe}
                  disabled={loadingCurrentLocation}
                >
                  {loadingCurrentLocation ? (
                    <ActivityIndicator size="small" color={Colors.primary} />
                  ) : (
                    <MaterialIcons name="my-location" size={24} color={Colors.primary} />
                  )}
                </TouchableOpacity>
              </View>

              {/* Map Hint */}
              <View style={styles.mapHint}>
                <Ionicons name="hand-left-outline" size={16} color={Colors.white} />
                <Text style={styles.mapHintText}>Long press to select location</Text>
              </View>

              {/* Bottom Sheet */}
              <View style={styles.mapSheet}>
                <Text style={styles.sheetTitle}>Set location</Text>

                {/* Google Places Autocomplete */}
                <View style={styles.searchContainer}>
                  <GooglePlacesAutocomplete
                    ref={autocompleteRef}
                    placeholder="Search location"
                    fetchDetails={true}
                    onPress={handlePlaceSelect}
                    query={{
                      key: GMAP_API_KEY,
                      language: 'en',
                      components: 'country:in',
                    }}
                    styles={{
                      container: styles.autocompleteContainer,
                      textInputContainer: styles.autocompleteTextInputContainer,
                      textInput: styles.autocompleteTextInput,
                      listView: styles.autocompleteListView,
                      row: styles.autocompleteRow,
                      separator: styles.autocompleteSeparator,
                      description: styles.autocompleteDescription,
                    }}
                    textInputProps={{
                      returnKeyType: 'search',
                      blurOnSubmit: false,
                      placeholderTextColor: Colors.gray,
                      autoFocus: false,
                    }}
                    debounce={300}
                    minLength={2}
                    enablePoweredByContainer={false}
                    nearbyPlacesAPI="GooglePlacesSearch"
                    autoFocus={false}
                  />
                </View>

                {/* Current Location Button */}
                <TouchableOpacity
                  style={styles.locateRow}
                  onPress={handleLocateMe}
                  disabled={loadingCurrentLocation}
                >
                  <View style={styles.locateIconContainer}>
                    {loadingCurrentLocation ? (
                      <ActivityIndicator size="small" color={Colors.primary} />
                    ) : (
                      <MaterialIcons name="my-location" size={20} color={Colors.primary} />
                    )}
                  </View>
                  <View style={styles.locateContent}>
                    <Text style={styles.locateText}>Use my current location</Text>
                    <Text style={styles.locateSubtext}>
                      Get your current location automatically
                    </Text>
                  </View>
                  <Ionicons name="chevron-forward" size={20} color={Colors.gray} />
                </TouchableOpacity>

                {/* Selected Location Display */}
                {selectedAddress && (
                  <View style={styles.selectedLocationContainer}>
                    <Text style={styles.selectedLocationLabel}>Selected Location:</Text>
                    <Text style={styles.selectedLocationText} numberOfLines={2}>
                      {selectedAddress}
                    </Text>
                  </View>
                )}

                {/* CONFIRM BUTTON */}
                <TouchableOpacity
                  style={[styles.standardButton, { marginTop: 16 }]}
                  onPress={handleConfirm}
                  activeOpacity={0.9}
                >
                  <Text style={styles.standardButtonText}>
                    Confirm Location
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </TouchableWithoutFeedback>
        )}

        {/* Step 3: Address Details Form */}
        {step === 3 && (
          <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : undefined}
            style={{ flex: 1 }}
          >
            <ScrollView 
              contentContainerStyle={styles.formScrollContent}
              showsVerticalScrollIndicator={false}
            >
              <Text style={styles.locationHeader}>Your Location</Text>
              <Text style={styles.locationText}>{selectedAddress}</Text>

              <TouchableOpacity 
                style={styles.changeLocationButton}
                onPress={() => {
                  setStep(2);
                }}
              >
                <Ionicons name="location-outline" size={18} color="#ED7117" />
                <Text style={styles.changeLocationText}>Change Location</Text>
              </TouchableOpacity>

              <View style={styles.modernInputContainer}>
                <TextInput
                  style={styles.modernInput}
                  placeholder="House / Flat / Floor No. *"
                  placeholderTextColor={Colors.gray}
                  value={house}
                  onChangeText={setHouse}
                  editable={!saving}
                />
              </View>

              <View style={styles.modernInputContainer}>
                <TextInput
                  style={styles.modernInput}
                  placeholder="Apartment / Road / Area *"
                  placeholderTextColor={Colors.gray}
                  value={area}
                  onChangeText={setArea}
                  editable={!saving}
                />
              </View>

              <Text style={styles.sectionLabel}>Instructions (optional)</Text>
              <View style={[styles.modernInputContainer, styles.textAreaContainer]}>
                <TextInput
                  style={[styles.modernInput, styles.textArea]}
                  placeholder="e.g. don't turn on AC"
                  placeholderTextColor={Colors.gray}
                  multiline
                  value={instructions}
                  onChangeText={setInstructions}
                  editable={!saving}
                />
              </View>

              <Text style={styles.sectionLabel}>Save As</Text>
              <View style={styles.typeRow}>
                {['Home', 'Work', 'Others'].map((t) => {
                  const active = activeType === t;
                  return (
                    <TouchableOpacity
                      key={t}
                      style={[styles.typeBtn, active && styles.typeBtnActive]}
                      onPress={() => setActiveType(t)}
                      disabled={saving}
                    >
                      {getTypeIcon(t)}
                      <Text style={[styles.typeBtnText, active && styles.typeBtnTextActive]}>
                        {t}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>

              {activeType === 'Others' && (
                <View style={styles.modernInputContainer}>
                  <TextInput
                    style={styles.modernInput}
                    placeholder="Label Name *"
                    placeholderTextColor={Colors.gray}
                    value={otherLabel}
                    onChangeText={setOtherLabel}
                    editable={!saving}
                  />
                </View>
              )}

              <TouchableOpacity
                style={styles.defaultRow}
                onPress={() => setMakeDefault(!makeDefault)}
                disabled={saving}
              >
                <View style={[styles.defaultCircle, makeDefault && styles.defaultCircleActive]}>
                  {makeDefault && <MaterialIcons name="check" size={12} color="#fff" />}
                </View>
                <Text style={styles.defaultText}>Set as default address</Text>
              </TouchableOpacity>
            </ScrollView>

            <View style={styles.bottomBar}>
              <TouchableOpacity 
                style={[styles.standardButton, saving && styles.disabledButton]} 
                onPress={handleSave}
                activeOpacity={0.9}
                disabled={saving}
              >
                {saving ? (
                  <ActivityIndicator color="white" />
                ) : (
                  <Text style={styles.standardButtonText}>Save Address Details</Text>
                )}
              </TouchableOpacity>
            </View>
          </KeyboardAvoidingView>
        )}
      </KeyboardAvoidingView>

      {/* Edit/Delete Modal */}
      <Modal
        visible={modalVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={() => {
          setModalVisible(false);
          setSelectedModalItem(null);
          setModalType(null);
        }}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            {modalType === 'edit' && (
              <>
                <Text style={styles.modalTitle}>Edit Address</Text>
                <Text style={styles.modalMessage}>
                  Are you sure you want to edit "{selectedModalItem?.label}" address?
                </Text>
                <View style={styles.modalButtons}>
                  <TouchableOpacity
                    style={[styles.modalButton, styles.cancelButton]}
                    onPress={() => {
                      setModalVisible(false);
                      setSelectedModalItem(null);
                      setModalType(null);
                    }}
                  >
                    <Text style={styles.cancelButtonText}>Cancel</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.modalButton, styles.editModalButton]}
                    onPress={confirmEdit}
                  >
                    <Text style={styles.modalButtonText}>Edit</Text>
                  </TouchableOpacity>
                </View>
              </>
            )}

            {modalType === 'delete' && (
              <>
                <Text style={styles.modalTitle}>Delete Address</Text>
                <Text style={styles.modalMessage}>
                  Are you sure you want to delete "{selectedModalItem?.label}" address? This action cannot be undone.
                </Text>
                <View style={styles.modalButtons}>
                  <TouchableOpacity
                    style={[styles.modalButton, styles.cancelButton]}
                    onPress={() => {
                      setModalVisible(false);
                      setSelectedModalItem(null);
                      setModalType(null);
                    }}
                  >
                    <Text style={styles.cancelButtonText}>Cancel</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.modalButton, styles.deleteModalButton]}
                    onPress={confirmDelete}
                  >
                    {deleting && deletingId === selectedModalItem?.id ? (
                      <ActivityIndicator size="small" color="#fff" />
                    ) : (
                      <Text style={styles.modalButtonText}>Delete</Text>
                    )}
                  </TouchableOpacity>
                </View>
              </>
            )}
          </View>
        </View>
      </Modal>

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
  keyboardAvoidingView: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 0.5,
    borderBottomColor: '#F3F4F6',
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: Colors.primary,
    flex: 1,
    textAlign: 'center',
  },
  headerSpacer: {
    width: 44,
  },
  step1Container: {
    flex: 1,
  },
  searchBarContainer: {
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 8,
    backgroundColor: Colors.white,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  searchInputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    paddingHorizontal: 12,
    height: 44,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
    color: Colors.dark,
    paddingVertical: 0,
  },
  clearIcon: {
    padding: 4,
  },
  searchResultCount: {
    fontSize: 12,
    color: Colors.gray,
    marginTop: 8,
    marginLeft: 4,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingBottom: 30,
    paddingTop: 16,
  },
  loaderContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.white,
  },
  addressCard: {
    backgroundColor: Colors.white,
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
    borderWidth: 1,
    borderColor: '#F3F4F6',
  },
  addressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  addressTypeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  addressTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.primary,
  },
  defaultBadge: {
    backgroundColor: '#DCFCE7',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
    marginLeft: 8,
  },
  defaultBadgeText: {
    fontSize: 11,
    color: '#166534',
    fontWeight: '600',
  },
  addressActions: {
    flexDirection: 'row',
    gap: 12,
  },
  editButton: {
    padding: 4,
  },
  deleteButton: {
    padding: 4,
  },
  addressDetails: {
    gap: 6,
  },
  addressText: {
    fontSize: 14,
    color: '#374151',
    lineHeight: 20,
  },
  addressSub: {
    fontSize: 13,
    color: '#6B7280',
  },
  addressNote: {
    fontSize: 12,
    color: '#9CA3AF',
  },
  emptyStateContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyStateIcon: {
    marginBottom: 24,
  },
  emptyStateTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#374151',
    marginBottom: 12,
  },
  emptyStateText: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 32,
  },
  clearSearchButton: {
    backgroundColor: '#ED7117',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
  },
  clearSearchText: {
    color: Colors.white,
    fontSize: 14,
    fontWeight: '600',
  },
  map: {
    flex: 1,
  },
  mapControlButtons: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 60 : 40,
    right: 20,
    zIndex: 10,
    gap: 12,
  },
  mapControlButton: {
    backgroundColor: '#fff',
    padding: 12,
    borderRadius: 40,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    alignItems: 'center',
    justifyContent: 'center',
    width: 48,
    height: 48,
  },
  mapHint: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 110 : 90,
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
  mapSheet: {
    backgroundColor: '#fff',
    padding: 16,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    elevation: 10,
    maxHeight: '60%',
  },
  sheetTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.primary,
    marginBottom: 8,
  },
  searchContainer: {
    zIndex: 100,
  },
  autocompleteContainer: {
    flex: 0,
    zIndex: 100,
  },
  autocompleteTextInputContainer: {
    backgroundColor: 'transparent',
  },
  autocompleteTextInput: {
    height: 50,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    paddingHorizontal: 12,
    fontSize: 16,
    backgroundColor: '#F9FAFB',
    fontFamily: Platform.OS === 'ios' ? 'System' : 'Roboto',
  },
  autocompleteListView: {
    backgroundColor: '#fff',
    borderRadius: 12,
    marginTop: 8,
    maxHeight: 200,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  autocompleteRow: {
    paddingVertical: 14,
    paddingHorizontal: 12,
  },
  autocompleteSeparator: {
    height: 0.5,
    backgroundColor: '#F3F4F6',
  },
  autocompleteDescription: {
    fontSize: 14,
    color: '#374151',
  },
  locateRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    marginTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
  },
  locateIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#FFF7ED',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  locateContent: {
    flex: 1,
  },
  locateText: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.primary,
    marginBottom: 2,
  },
  locateSubtext: {
    fontSize: 11,
    color: '#6B7280',
  },
  selectedLocationContainer: {
    marginTop: 12,
    padding: 12,
    backgroundColor: '#F3F4F6',
    borderRadius: 12,
  },
  selectedLocationLabel: {
    fontSize: 12,
    color: '#6B7280',
    marginBottom: 4,
  },
  selectedLocationText: {
    fontSize: 13,
    color: '#1F2937',
    fontWeight: '500',
  },
  formScrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 20,
    paddingTop: 20,
  },
  locationHeader: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.primary,
    marginBottom: 4,
  },
  locationText: {
    fontSize: 14,
    color: '#555',
    marginBottom: 12,
    lineHeight: 20,
  },
  changeLocationButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 20,
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: '#FFF7ED',
    borderRadius: 8,
    alignSelf: 'flex-start',
  },
  changeLocationText: {
    color: '#ED7117',
    fontSize: 13,
    fontWeight: '600',
  },
  modernInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: '#E5E7EB',
    borderRadius: 12,
    paddingHorizontal: 14,
    backgroundColor: '#F9FAFB',
    height: 48,
    width: '100%',
    marginBottom: 14,
  },
  textAreaContainer: {
    height: 90,
    alignItems: 'flex-start',
  },
  textArea: {
    height: 80,
    textAlignVertical: 'top',
    paddingTop: 12,
  },
  modernInput: {
    flex: 1,
    fontSize: 14,
    color: Colors.dark,
    fontWeight: '500',
    paddingVertical: 0,
    height: '100%',
    textAlignVertical: 'center',
    includeFontPadding: false,
  },
  sectionLabel: {
    fontSize: 14,
    color: Colors.primary,
    fontWeight: '600',
    marginBottom: 10,
    marginTop: 6,
  },
  typeRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 16,
  },
  typeBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: '#E5E7EB',
    backgroundColor: '#fff',
  },
  typeBtnActive: {
    backgroundColor: '#FFEDD5',
    borderColor: '#ED7117',
  },
  typeBtnText: {
    fontSize: 13,
    color: '#444',
    fontWeight: '500',
  },
  typeBtnTextActive: {
    color: '#ED7117',
    fontWeight: '600',
  },
  defaultRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 16,
  },
  defaultCircle: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#9CA3AF',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  defaultCircleActive: {
    backgroundColor: '#ED7117',
    borderColor: '#ED7117',
  },
  defaultText: {
    color: '#374151',
    fontWeight: '500',
    fontSize: 14,
  },
  bottomBar: {
    padding: 16,
    backgroundColor: Colors.white,
    borderTopWidth: 1,
    bottom: 0,
    left: 0,
    right: 0,
    borderTopColor: '#E5E7EB',
  },
  standardButton: {
    backgroundColor: '#184080',
    borderRadius: 12,
    paddingVertical: 14,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#184080',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  standardButtonText: {
    color: Colors.white,
    fontSize: 16,
    fontWeight: '700',
  },
  disabledButton: {
    opacity: 0.6,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 2,
  },
  fab: {
    position: "absolute",
    bottom: 30,
    right: 20,
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: Colors.primary,
    justifyContent: "center",
    alignItems: "center",
    elevation: 8,
    shadowColor: "#000",
    shadowOpacity: 0.2,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 4 },
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 24,
    width: '85%',
    maxWidth: 340,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: 12,
    textAlign: 'center',
  },
  modalMessage: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 20,
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  modalButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelButton: {
    backgroundColor: '#F3F4F6',
  },
  cancelButtonText: {
    color: '#6B7280',
    fontSize: 14,
    fontWeight: '600',
  },
  editModalButton: {
    backgroundColor: '#ED7117',
  },
  deleteModalButton: {
    backgroundColor: '#EF4444',
  },
  modalButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
});