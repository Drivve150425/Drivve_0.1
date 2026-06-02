// import React, { useEffect, useState, useMemo } from 'react';
// import {
//   View,
//   Text,
//   ScrollView,
//   TouchableOpacity,
//   Switch,
//   StyleSheet,
//   Modal,
//   TextInput,
//   FlatList,
// } from 'react-native';
// import { MaterialIcons, Ionicons } from '@expo/vector-icons';
// import LottieView from "lottie-react-native";
// import DatabaseService from '../../services/myvehicle_ds';
// import matchpreferenceDatabaseService from '../../services/matchingpreference_ds';
// import CustomAlert from '../../components/CustomAlert';

// import { Colors } from '../../constants/Colors';
// import { useFocusEffect } from '@react-navigation/native';

// /* =========================================
//    GROUP HELPER
// ========================================= */

// const groupByCategory = (list = []) =>
//   list.reduce((acc, i) => {
//     acc[i.category] = acc[i.category] || [];
//     acc[i.category].push(i);
//     return acc;
//   }, {});

// /* =========================================
//    PREFERENCE LABELS MAP
// ========================================= */

// const PREFERENCE_LABELS = {
//   smoking_policy: { label: 'Smoking', getValue: (v) => v },
//   speak_languages: { label: 'Languages', getValue: (v) => Array.isArray(v) ? v.join(', ') : v },
//   chat_level: { label: 'Chat', getValue: (v) => v },
//   age_category: { label: 'Age', getValue: (v) => v },
//   gender_preference: { label: 'Gender', getValue: (v) => v },
//   luggage_allowance: { label: 'Luggage', getValue: (v) => v },
//   pets_allowed: { label: 'Pets', getValue: (v) => v ? 'Allowed' : 'Not allowed' },
//   detours: { label: 'Detours', getValue: (v) => v ? 'Allowed' : 'Not allowed' },
//   helmet_policy_driver: { label: 'Helmet (Driver)', getValue: (v) => v ? 'Required' : 'Optional' },
//   helmet_policy_passenger: { label: 'Helmet (Passenger)', getValue: (v) => v ? 'Required' : 'Optional' },
//   avoid_frequent_stops: { label: 'Avoid Stops', getValue: (v) => v ? 'Yes' : 'No' },
//   same_gender_after_9pm: { label: 'Same Gender (Night)', getValue: (v) => v ? 'Yes' : 'No' },
//   verified_profiles_only: { label: 'Verified Only', getValue: (v) => v ? 'Yes' : 'No' },
// };

// /* =========================================
//    STEP 3
// ========================================= */

// export default function Step3({ phoneNumber, onNext, navigation, setVehicleId, vehicleId: initialVehicleId }) {

//   const [master, setMaster] = useState([]);
//   const [values, setValues] = useState({});
//   const [loading, setLoading] = useState(true);

//   // Vehicle states
//   const [vehicles, setVehicles] = useState([]);
//   const [filteredVehicles, setFilteredVehicles] = useState([]);
//   const [selectedVehicle, setSelectedVehicle] = useState(null);
//   const [showVehicleModal, setShowVehicleModal] = useState(false);
//   const [loadingVehicles, setLoadingVehicles] = useState(true);
//   const [vehicleSearchQuery, setVehicleSearchQuery] = useState('');

//   // Ride preferences toggle
//   const [showPreferences, setShowPreferences] = useState(false);
//   const [preferencesSummary, setPreferencesSummary] = useState(null);

//   // Custom Alert states
//   const [alertVisible, setAlertVisible] = useState(false);
//   const [alertConfig, setAlertConfig] = useState({
//     title: "",
//     message: "",
//     icon: "check-circle",
//     iconColor: "#10B981",
//     buttons: []
//   });

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

//   useEffect(() => {
//     loadPrefs();
//     loadVehicles();
//   }, []);

//   // Filter vehicles when search query changes
//   useEffect(() => {
//     if (vehicleSearchQuery.trim()) {
//       const filtered = vehicles.filter(vehicle => 
//         vehicle.registration_number?.toLowerCase().includes(vehicleSearchQuery.toLowerCase()) ||
//         `${vehicle.make} ${vehicle.model}`.toLowerCase().includes(vehicleSearchQuery.toLowerCase()) ||
//         vehicle.vehicle_type?.toLowerCase().includes(vehicleSearchQuery.toLowerCase())
//       );
//       setFilteredVehicles(filtered);
//     } else {
//       setFilteredVehicles(vehicles);
//     }
//   }, [vehicleSearchQuery, vehicles]);

//   // Reload vehicles and preferences when screen comes into focus
//   useFocusEffect(
//     React.useCallback(() => {
//       loadVehicles();
//       loadPrefs();
//     }, [phoneNumber])
//   );

//   const loadVehicles = async () => {
//     if (!phoneNumber) {
//       setLoadingVehicles(false);
//       return;
//     }
//     try {
//       const data = await DatabaseService.getVehicles(phoneNumber);
//       const vehicleList = Array.isArray(data) ? data : [];
//       setVehicles(vehicleList);
//       setFilteredVehicles(vehicleList);

//       // Auto-select first vehicle or the one passed from parent
//       if (initialVehicleId) {
//         const existing = vehicleList.find(v => v.id === initialVehicleId);
//         if (existing) {
//           setSelectedVehicle(existing);
//         }
//       } else if (vehicleList.length > 0 && !selectedVehicle) {
//         setSelectedVehicle(vehicleList[0]);
//         setVehicleId(vehicleList[0].id);
//       }
//     } catch (e) {
//       console.log("Vehicle load error", e);
//       showCustomAlert('Error', 'Failed to load vehicles', 'error');
//     } finally {
//       setLoadingVehicles(false);
//     }
//   };

//   const loadPrefs = async () => {
//     try {
//       const defs = await matchpreferenceDatabaseService.getMatchingPreferenceMaster();
//       const userVals = await matchpreferenceDatabaseService.getUserMatchingPreferences(phoneNumber);

//       setMaster(defs || []);
//       setValues(userVals || {});
      
//       // If user has saved preferences, store them for display
//       if (userVals && Object.keys(userVals).length > 0) {
//         setPreferencesSummary(userVals);
//       }
//     } catch (e) {
//       console.log('Error loading preferences', e);
//     } finally {
//       setLoading(false);
//     }
//   };

//   const grouped = useMemo(() => groupByCategory(master), [master]);

//   const updateValue = (key, value) => {
//     setValues(prev => ({ ...prev, [key]: value }));
//   };

//   const handleVehicleSelect = (vehicle) => {
//     setSelectedVehicle(vehicle);
//     setVehicleId(vehicle.id);
//     setShowVehicleModal(false);
//     setVehicleSearchQuery('');
//   };

//   const handleAddNewVehicle = () => {
//     setShowVehicleModal(false);
//     navigation.navigate("AddNewVehicleScreen", { phoneNumber });
//   };

//   const handlePreferencesToggle = (value) => {
//     if (value) {
//       // Navigate to MatchingPreferenceScreen when toggle is ON
//       navigation.navigate("MatchingPreferenceScreen", {
//         onSave: (savedPrefs) => {
//           setValues(savedPrefs);
//           setPreferencesSummary(savedPrefs);
//           // Keep showPreferences as true so user can see their preferences
//           setShowPreferences(true);
//         }
//       });
//     } else {
//       // When toggling off, just hide the summary but don't reload
//       setShowPreferences(false);
//     }
//   };

//   // Get compact preference summary (only selected ones)
//   const getCompactPreferenceSummary = () => {
//     if (!preferencesSummary || Object.keys(preferencesSummary).length === 0) {
//       return null;
//     }
    
//     const selectedPrefs = [];
    
//     // Check for true values or non-empty values
//     Object.keys(preferencesSummary).forEach(key => {
//       const value = preferencesSummary[key];
//       const prefConfig = PREFERENCE_LABELS[key];
      
//       if (prefConfig) {
//         if (value === true) {
//           selectedPrefs.push(prefConfig.label);
//         } else if (value && typeof value === 'string' && value.trim() !== '') {
//           selectedPrefs.push(`${prefConfig.label}: ${prefConfig.getValue(value)}`);
//         } else if (Array.isArray(value) && value.length > 0) {
//           selectedPrefs.push(`${prefConfig.label}: ${value.join(', ')}`);
//         }
//       }
//     });
    
//     return selectedPrefs.length > 0 ? selectedPrefs : null;
//   };

//   const compactSummary = getCompactPreferenceSummary();

//   const handleContinue = () => {
//     if (!selectedVehicle) {
//       showCustomAlert('Vehicle Required', 'Please select a vehicle before continuing', 'warning');
//       return;
//     }
//     onNext({ 
//       preferences: values, 
//       vehicleId: selectedVehicle.id,
//       maxSeats: selectedVehicle.max_seats || 4
//     });
//   };

//   const clearVehicleSearch = () => {
//     setVehicleSearchQuery('');
//   };

//   const renderVehicleItem = ({ item }) => (
//     <TouchableOpacity
//       style={[
//         styles.vehicleOption,
//         selectedVehicle?.id === item.id && styles.vehicleOptionSelected
//       ]}
//       onPress={() => handleVehicleSelect(item)}
//     >
//       <View style={styles.vehicleOptionInfo}>
//         <Text style={styles.vehicleOptionTitle}>
//           {item.registration_number}
//         </Text>
//         <Text style={styles.vehicleOptionSubtitle}>
//           {item.make} {item.model} • {item.color} • {item.max_seats} seats
//         </Text>
//       </View>
//       {selectedVehicle?.id === item.id && (
//         <MaterialIcons name="check-circle" size={24} color={Colors.primary} />
//       )}
//     </TouchableOpacity>
//   );

//   /* =========================================
//      UI
//   ========================================= */
//   if (loading || loadingVehicles) {
//     return (
//       <View style={styles.loaderContainer}>
//         <LottieView
//           source={require("../../assets/loading.json")}
//           autoPlay
//           loop
//           style={styles.loaderAnimation}
//         />
//       </View>
//     );
//   }
  
//   return (
//     <View style={styles.container}>

//       {/* Title */}
//       <Text style={styles.title}>Vehicle & Preferences</Text>

//       <ScrollView showsVerticalScrollIndicator={false}>
        
//         {/* Vehicle Section */}
//         <View style={styles.sectionCard}>
//           <Text style={styles.sectionTitle}>Select Vehicle</Text>
          
//           <TouchableOpacity
//             style={styles.vehicleDropdown}
//             onPress={() => setShowVehicleModal(true)}
//           >
//             <Text style={styles.vehicleDropdownText}>
//               {selectedVehicle
//                 ? `${selectedVehicle.registration_number} - ${selectedVehicle.model}`
//                 : "Select Vehicle"}
//             </Text>
//             <Ionicons name="chevron-down" size={20} color={Colors.secondary} />
//           </TouchableOpacity>

//           <TouchableOpacity
//             onPress={handleAddNewVehicle}
//           >
//             <Text style={styles.addNewText}>+ Add New Vehicle</Text>
//           </TouchableOpacity>

//           {/* Selected Vehicle Card with New Layout */}
//           {selectedVehicle && (
//             <View style={styles.vehicleCard}>
//               {/* Row 1: Car Icon + Make Model */}
//               <View style={styles.vehicleCardHeader}>
//                 <MaterialIcons name="directions-car" size={32} color={Colors.primary} />
//                 <View style={styles.vehicleCardTitleContainer}>
//                   <Text style={styles.vehicleCardTitle}>
//                  {selectedVehicle.model}
//                   </Text>
//                   {selectedVehicle.year && (
//                     <Text style={styles.vehicleCardYear}>{selectedVehicle.year}</Text>
//                   )}
//                 </View>
//               </View>
              
//               {/* Row 2: Registration Number - Big Section */}
//               <View style={styles.registrationSection}>
//                 <Text style={styles.registrationLabel}>Registration Number</Text>
//                 <Text style={styles.registrationValue}>{selectedVehicle.registration_number || '-'}</Text>
//               </View>
              
//               {/* Row 3: 4 Details - Type, Fuel, Color, Seat */}
//               <View style={styles.detailsRow}>
//                 <View style={styles.detailItem}>
//                   <MaterialIcons name="category" size={18} color={Colors.primary} />
//                   <Text style={styles.detailItemLabel}>Type</Text>
//                   <Text style={styles.detailItemValue} numberOfLines={1}>{selectedVehicle.vehicle_type || '-'}</Text>
//                 </View>
//                 <View style={styles.detailItem}>
//                   <MaterialIcons name="local-gas-station" size={18} color={Colors.primary} />
//                   <Text style={styles.detailItemLabel}>Fuel</Text>
//                   <Text style={styles.detailItemValue} numberOfLines={1}>{selectedVehicle.fuel_type || '-'}</Text>
//                 </View>
//                 <View style={styles.detailItem}>
//                   <MaterialIcons name="palette" size={18} color={Colors.primary} />
//                   <Text style={styles.detailItemLabel}>Color</Text>
//                   <Text style={styles.detailItemValue} numberOfLines={1}>{selectedVehicle.color || '-'}</Text>
//                 </View>
//                 <View style={styles.detailItem}>
//                   <MaterialIcons name="airline-seat-recline-extra" size={18} color={Colors.primary} />
//                   <Text style={styles.detailItemLabel}>Seats</Text>
//                   <Text style={styles.detailItemValue} numberOfLines={1}>{selectedVehicle.max_seats || '-'}</Text>
//                 </View>
//               </View>
//             </View>
//           )}
//         </View>

//         {/* Ride Preferences Section */}
//         <View style={styles.sectionCard}>
//           <View style={styles.preferenceHeader}>
//             <Text style={styles.sectionTitle}>Ride Preferences</Text>
//             <Switch
//               value={showPreferences}
//               onValueChange={handlePreferencesToggle}
//               trackColor={{ true: Colors.primary }}
//             />
//           </View>
          
//           <Text style={styles.preferenceDescription}>
//             Do you want to change the ride preference?
//           </Text>

//           {/* Compact Preferences Summary Card (when toggle is ON) */}
//           {showPreferences && compactSummary && (
//             <TouchableOpacity 
//               style={styles.preferenceSummaryCard}
//               onPress={() => {
//                 // Allow editing again by navigating to MatchingPreferenceScreen
//                 navigation.navigate("MatchingPreferenceScreen", {
//                   onSave: (savedPrefs) => {
//                     setValues(savedPrefs);
//                     setPreferencesSummary(savedPrefs);
//                   }
//                 });
//               }}
//             >
//               <View style={styles.preferenceSummaryHeader}>
//                 <MaterialIcons name="check-circle" size={20} color={Colors.success} />
//                 <Text style={styles.preferenceSummaryTitle}>Your Preferences</Text>
//                 <MaterialIcons name="edit" size={16} color={Colors.primary} style={{ marginLeft: 'auto' }} />
//               </View>
//               <View style={styles.preferenceTagsContainer}>
//                 {compactSummary.map((pref, index) => (
//                   <View key={index} style={styles.preferenceTag}>
//                     <Text style={styles.preferenceTagText}>{pref}</Text>
//                   </View>
//                 ))}
//               </View>
//               <Text style={styles.editHint}>Tap to edit preferences</Text>
//             </TouchableOpacity>
//           )}
          
//           {showPreferences && !compactSummary && (
//             <TouchableOpacity 
//               style={styles.emptyPreferenceCard}
//               onPress={() => {
//                 navigation.navigate("MatchingPreferenceScreen", {
//                   onSave: (savedPrefs) => {
//                     setValues(savedPrefs);
//                     setPreferencesSummary(savedPrefs);
//                   }
//                 });
//               }}
//             >
//               <Text style={styles.emptyPreferenceText}>+ Add your ride preferences</Text>
//             </TouchableOpacity>
//           )}
//         </View>

//       </ScrollView>

//       <TouchableOpacity
//         style={[
//           styles.actionButton,
//           !selectedVehicle && styles.actionButtonDisabled
//         ]}
//         onPress={handleContinue}
//       >
//         <Text style={styles.actionButtonText}>
//           Continue
//         </Text>
//       </TouchableOpacity>

//       {/* Vehicle Selection Modal with Search Bar */}
//       <Modal visible={showVehicleModal} transparent animationType="slide">
//         <View style={styles.modalOverlay}>
//           <View style={styles.modalContent}>
//             <View style={styles.modalHeader}>
//               <Text style={styles.modalTitle}>Select Vehicle</Text>
//               <TouchableOpacity onPress={() => {
//                 setShowVehicleModal(false);
//                 setVehicleSearchQuery('');
//               }}>
//                 <MaterialIcons name="close" size={26} color={Colors.gray} />
//               </TouchableOpacity>
//             </View>

//             {/* Search Bar */}
//             <View style={styles.modalSearchContainer}>
//               <View style={styles.modalSearchWrapper}>
//                 <Ionicons name="search-outline" size={20} color={Colors.gray} style={styles.modalSearchIcon} />
//                 <TextInput
//                   style={styles.modalSearchInput}
//                   placeholder="Search by registration, make, model..."
//                   placeholderTextColor={Colors.gray}
//                   value={vehicleSearchQuery}
//                   onChangeText={setVehicleSearchQuery}
//                   returnKeyType="search"
//                 />
//                 {vehicleSearchQuery.length > 0 && (
//                   <TouchableOpacity onPress={clearVehicleSearch} style={styles.modalClearIcon}>
//                     <Ionicons name="close-circle" size={20} color={Colors.gray} />
//                   </TouchableOpacity>
//                 )}
//               </View>
//               {vehicleSearchQuery.length > 0 && (
//                 <Text style={styles.modalSearchResultCount}>
//                   Found {filteredVehicles.length} {filteredVehicles.length === 1 ? 'vehicle' : 'vehicles'}
//                 </Text>
//               )}
//             </View>

//             <ScrollView style={{ paddingHorizontal: 20 }}>
//               {filteredVehicles.length === 0 ? (
//                 <View style={styles.emptyVehicle}>
//                   <MaterialIcons name="search-off" size={50} color={Colors.gray} />
//                   <Text style={styles.emptyVehicleText}>No vehicles found</Text>
//                   <TouchableOpacity
//                     style={styles.addVehicleButton}
//                     onPress={() => {
//                       setShowVehicleModal(false);
//                       handleAddNewVehicle();
//                     }}
//                   >
//                     <Text style={styles.addVehicleButtonText}>+ Add New Vehicle</Text>
//                   </TouchableOpacity>
//                 </View>
//               ) : (
//                 <FlatList
//                   data={filteredVehicles}
//                   renderItem={renderVehicleItem}
//                   keyExtractor={(item) => item.id.toString()}
//                   showsVerticalScrollIndicator={false}
//                   scrollEnabled={false}
//                 />
//               )}
//             </ScrollView>
//           </View>
//         </View>
//       </Modal>

//       {/* Custom Alert */}
//       <CustomAlert
//         visible={alertVisible}
//         title={alertConfig.title}
//         message={alertConfig.message}
//         icon={alertConfig.icon}
//         iconColor={alertConfig.iconColor}
//         buttons={alertConfig.buttons}
//         onBackdropPress={() => setAlertVisible(false)}
//       />
//     </View>
//   );
// }

// /* =========================================
//    STYLES
// ========================================= */

// const styles = StyleSheet.create({

//   container: {
//     backgroundColor: 'rgba(255, 255, 255, 0.95)',
//     borderRadius: 28,
//     padding: 18,
//     marginBottom: 14,
//     shadowColor: '#000',
//     shadowOffset: { width: 0, height: 10 },
//     shadowOpacity: 0.15,
//     shadowRadius: 20,
//     elevation: 10,
//     borderWidth: 1,
//     borderColor: 'rgba(229, 231, 235, 0.5)',
//   },

//   loaderContainer: {
//     flex: 1,
//     justifyContent: 'center',
//     alignItems: 'center',
//     backgroundColor: 'rgba(255, 255, 255, 0.95)',
//     borderRadius: 28,
//     padding: 18,
//     marginBottom: 14,
//     minHeight: 700,
//   },

//   loaderAnimation: {
//     width: 300,
//     height: 300,
//   },

//   title: {
//     fontSize: 20,
//     fontWeight: '700',
//     marginBottom: 14,
//     color: Colors.dark
//   },

//   sectionCard: {
//     backgroundColor: '#f8f9fc',
//     borderRadius: 16,
//     padding: 16,
//     marginBottom: 16,
//     borderWidth: 1,
//     borderColor: '#e8eaf0',
//   },

//   sectionTitle: {
//     fontSize: 16,
//     fontWeight: '700',
//     color: Colors.dark,
//     marginBottom: 12
//   },

//   vehicleDropdown: {
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//     alignItems: 'center',
//     borderWidth: 1.5,
//     borderColor: '#E5E7EB',
//     borderRadius: 14,
//     paddingHorizontal: 16,
//     paddingVertical: 14,
//     backgroundColor: '#fff',
//     marginBottom: 10,
//   },

//   vehicleDropdownText: {
//     fontSize: 16,
//     color: Colors.dark,
//     fontWeight: '500',
//   },

//   addNewText: {
//     color: Colors.primary,
//     fontWeight: '600',
//     marginBottom: 12,
//   },

//   vehicleCard: {
//     backgroundColor: '#fff',
//     borderRadius: 12,
//     padding: 16,
//     marginTop: 8,
//     borderWidth: 1,
//     borderColor: '#e0e8f0',
//   },

//   // Row 1: Car Icon + Make Model
//   vehicleCardHeader: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     marginBottom: 16,
//   },

//   vehicleCardTitleContainer: {
//     marginLeft: 12,
//     flex: 1,
//   },

//   vehicleCardTitle: {
//     fontSize: 20,
//     fontWeight: '700',
//     color: Colors.dark,
//   },

//   vehicleCardYear: {
//     fontSize: 13,
//     color: Colors.gray,
//     marginTop: 2,
//   },

//   // Row 2: Registration Number - Big Section
//   registrationSection: {
//     backgroundColor: '#f0f4f8',
//     borderRadius: 10,
//     padding: 12,
//     marginBottom: 16,
//     alignItems: 'center',
//   },

//   registrationLabel: {
//     fontSize: 11,
//     color: Colors.gray,
//     marginBottom: 4,
//     textTransform: 'uppercase',
//     letterSpacing: 0.5,
//   },

//   registrationValue: {
//     fontSize: 18,
//     fontWeight: '700',
//     color: Colors.dark,
//     letterSpacing: 1,
//   },

//   // Row 3: 4 Details
//   detailsRow: {
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//   },

//   detailItem: {
//     flex: 1,
//     alignItems: 'center',
//     paddingVertical: 8,
//   },

//   detailItemLabel: {
//     fontSize: 10,
//     color: Colors.gray,
//     marginTop: 4,
//     textTransform: 'uppercase',
//   },

//   detailItemValue: {
//     fontSize: 12,
//     fontWeight: '600',
//     color: Colors.dark,
//     marginTop: 2,
//     textAlign: 'center',
//   },

//   preferenceHeader: {
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//     alignItems: 'center',
//   },

//   preferenceDescription: {
//     fontSize: 14,
//     color: Colors.gray,
//     marginBottom: 12,
//   },

//   preferenceSummaryCard: {
//     backgroundColor: '#fff',
//     borderRadius: 12,
//     padding: 14,
//     borderWidth: 1,
//     borderColor: '#d4edda',
//     backgroundColor: '#f0fff4',
//   },

//   emptyPreferenceCard: {
//     backgroundColor: '#fff',
//     borderRadius: 12,
//     padding: 20,
//     borderWidth: 1,
//     borderColor: '#e0e8f0',
//     borderStyle: 'dashed',
//     alignItems: 'center',
//   },

//   emptyPreferenceText: {
//     color: Colors.primary,
//     fontSize: 14,
//     fontWeight: '600',
//   },

//   preferenceSummaryHeader: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     marginBottom: 10,
//   },

//   preferenceSummaryTitle: {
//     fontSize: 14,
//     fontWeight: '600',
//     color: Colors.success,
//     marginLeft: 6,
//   },

//   preferenceTagsContainer: {
//     flexDirection: 'row',
//     flexWrap: 'wrap',
//     gap: 8,
//   },

//   preferenceTag: {
//     backgroundColor: Colors.primary,
//     paddingHorizontal: 12,
//     paddingVertical: 6,
//     borderRadius: 16,
//   },

//   preferenceTagText: {
//     color: '#fff',
//     fontSize: 12,
//     fontWeight: '600',
//   },

//   editHint: {
//     fontSize: 11,
//     color: Colors.primary,
//     marginTop: 10,
//     textAlign: 'center',
//   },

//   actionButton: {
//     backgroundColor: Colors.primary,
//     paddingVertical: 14,
//     borderRadius: 16,
//     alignItems: 'center',
//     marginTop: 10
//   },

//   actionButtonDisabled: {
//     backgroundColor: Colors.gray,
//     opacity: 0.6,
//   },

//   actionButtonText: {
//     color: '#fff',
//     fontSize: 16,
//     fontWeight: '700'
//   },

//   // Modal styles
//   modalOverlay: {
//     flex: 1,
//     backgroundColor: 'rgba(0, 0, 0, 0.5)',
//     justifyContent: 'flex-end',
//   },

//   modalContent: {
//     backgroundColor: '#fff',
//     borderTopLeftRadius: 24,
//     borderTopRightRadius: 24,
//     maxHeight: '80%',
//   },

//   modalHeader: {
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//     alignItems: 'center',
//     padding: 20,
//     borderBottomWidth: 1,
//     borderBottomColor: '#e0e0e0',
//   },

//   modalTitle: {
//     fontSize: 18,
//     fontWeight: '700',
//     color: Colors.dark,
//   },

//   modalSearchContainer: {
//     paddingHorizontal: 20,
//     paddingTop: 12,
//     paddingBottom: 8,
//     borderBottomWidth: 1,
//     borderBottomColor: '#F3F4F6',
//   },

//   modalSearchWrapper: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     backgroundColor: '#F9FAFB',
//     borderRadius: 12,
//     borderWidth: 1,
//     borderColor: '#E5E7EB',
//     paddingHorizontal: 12,
//     height: 44,
//   },

//   modalSearchIcon: {
//     marginRight: 8,
//   },

//   modalSearchInput: {
//     flex: 1,
//     fontSize: 15,
//     color: Colors.dark,
//     paddingVertical: 0,
//   },

//   modalClearIcon: {
//     padding: 4,
//   },

//   modalSearchResultCount: {
//     fontSize: 12,
//     color: Colors.gray,
//     marginTop: 8,
//     marginLeft: 4,
//   },

//   emptyVehicle: {
//     alignItems: 'center',
//     padding: 40,
//   },

//   emptyVehicleText: {
//     fontSize: 16,
//     color: Colors.gray,
//     marginTop: 16,
//     marginBottom: 20,
//   },

//   addVehicleButton: {
//     backgroundColor: Colors.primary,
//     paddingHorizontal: 20,
//     paddingVertical: 12,
//     borderRadius: 10,
//   },

//   addVehicleButtonText: {
//     color: '#fff',
//     fontWeight: '600',
//   },

//   vehicleOption: {
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//     alignItems: 'center',
//     paddingVertical: 14,
//     paddingHorizontal: 10,
//     borderBottomWidth: 1,
//     borderBottomColor: '#f0f0f0',
//   },

//   vehicleOptionSelected: {
//     backgroundColor: '#f0f8ff',
//     borderRadius: 10,
//     borderColor: Colors.primary,
//   },

//   vehicleOptionInfo: {
//     flex: 1,
//   },

//   vehicleOptionTitle: {
//     fontSize: 16,
//     fontWeight: '600',
//     color: Colors.dark,
//   },

//   vehicleOptionSubtitle: {
//     fontSize: 14,
//     color: Colors.gray,
//     marginTop: 2,
//   },

// });
// Step3.js
// import React, { useEffect, useState, useMemo } from 'react';
// import {
//   View,
//   Text,
//   ScrollView,
//   TouchableOpacity,
//   Switch,
//   StyleSheet,
//   Modal,
//   TextInput,
//   FlatList,
// } from 'react-native';
// import { MaterialIcons, Ionicons } from '@expo/vector-icons';
// import LottieView from "lottie-react-native";
// import DatabaseService from '../../services/myvehicle_ds';
// import matchpreferenceDatabaseService from '../../services/matchingpreference_ds';
// import CustomAlert from '../../components/CustomAlert';
// import { Colors } from '../../constants/Colors';
// import { useFocusEffect } from '@react-navigation/native';

// /* =========================================
//    GROUP HELPER
// ========================================= */

// const groupByCategory = (list = []) =>
//   list.reduce((acc, i) => {
//     acc[i.category] = acc[i.category] || [];
//     acc[i.category].push(i);
//     return acc;
//   }, {});

// /* =========================================
//    PREFERENCE LABELS MAP
// ========================================= */

// const PREFERENCE_LABELS = {
//   smoking_policy: { label: 'Smoking', getValue: (v) => v },
//   speak_languages: { label: 'Languages', getValue: (v) => Array.isArray(v) ? v.join(', ') : v },
//   chat_level: { label: 'Chat', getValue: (v) => v },
//   age_category: { label: 'Age', getValue: (v) => v },
//   gender_preference: { label: 'Gender', getValue: (v) => v },
//   luggage_allowance: { label: 'Luggage', getValue: (v) => v },
//   pets_allowed: { label: 'Pets', getValue: (v) => v ? 'Allowed' : 'Not allowed' },
//   detours: { label: 'Detours', getValue: (v) => v ? 'Allowed' : 'Not allowed' },
//   helmet_policy_driver: { label: 'Helmet (Driver)', getValue: (v) => v ? 'Required' : 'Optional' },
//   helmet_policy_passenger: { label: 'Helmet (Passenger)', getValue: (v) => v ? 'Required' : 'Optional' },
//   avoid_frequent_stops: { label: 'Avoid Stops', getValue: (v) => v ? 'Yes' : 'No' },
//   same_gender_after_9pm: { label: 'Same Gender (Night)', getValue: (v) => v ? 'Yes' : 'No' },
//   verified_profiles_only: { label: 'Verified Only', getValue: (v) => v ? 'Yes' : 'No' },
// };

// /* =========================================
//    STEP 3
// ========================================= */

// export default function Step3({ 
//   phoneNumber, 
//   onNext, 
//   navigation, 
//   setVehicleId, 
//   vehicleId: initialVehicleId,
//   isEdit = false,
//   lockedFields = [],
//   userGender = null,
// }) {

//   const [master, setMaster] = useState([]);
//   const [values, setValues] = useState({});
//   const [loading, setLoading] = useState(true);

//   // Vehicle states
//   const [vehicles, setVehicles] = useState([]);
//   const [filteredVehicles, setFilteredVehicles] = useState([]);
//   const [selectedVehicle, setSelectedVehicle] = useState(null);
//   const [showVehicleModal, setShowVehicleModal] = useState(false);
//   const [loadingVehicles, setLoadingVehicles] = useState(true);
//   const [vehicleSearchQuery, setVehicleSearchQuery] = useState('');

//   // Ride preferences toggle
//   const [showPreferences, setShowPreferences] = useState(false);
//   const [preferencesSummary, setPreferencesSummary] = useState(null);
  
//   // Women Only feature
//   const [womenOnly, setWomenOnly] = useState(false);
//   const isFemaleDriver = userGender === 'female';

//   // Custom Alert states
//   const [alertVisible, setAlertVisible] = useState(false);
//   const [alertConfig, setAlertConfig] = useState({
//     title: "",
//     message: "",
//     icon: "check-circle",
//     iconColor: "#10B981",
//     buttons: []
//   });

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

//   useEffect(() => {
//     loadPrefs();
//     loadVehicles();
//   }, []);

//   // Filter vehicles when search query changes
//   useEffect(() => {
//     if (vehicleSearchQuery.trim()) {
//       const filtered = vehicles.filter(vehicle => 
//         vehicle.registration_number?.toLowerCase().includes(vehicleSearchQuery.toLowerCase()) ||
//         `${vehicle.make} ${vehicle.model}`.toLowerCase().includes(vehicleSearchQuery.toLowerCase()) ||
//         vehicle.vehicle_type?.toLowerCase().includes(vehicleSearchQuery.toLowerCase())
//       );
//       setFilteredVehicles(filtered);
//     } else {
//       setFilteredVehicles(vehicles);
//     }
//   }, [vehicleSearchQuery, vehicles]);

//   // Reload vehicles and preferences when screen comes into focus
//   useFocusEffect(
//     React.useCallback(() => {
//       loadVehicles();
//       loadPrefs();
//     }, [phoneNumber])
//   );

//   const loadVehicles = async () => {
//     if (!phoneNumber) {
//       setLoadingVehicles(false);
//       return;
//     }
//     try {
//       const data = await DatabaseService.getVehicles(phoneNumber);
//       const vehicleList = Array.isArray(data) ? data : [];
//       setVehicles(vehicleList);
//       setFilteredVehicles(vehicleList);

//       if (initialVehicleId) {
//         const existing = vehicleList.find(v => v.id === initialVehicleId);
//         if (existing) {
//           setSelectedVehicle(existing);
//         }
//       } else if (vehicleList.length > 0 && !selectedVehicle) {
//         setSelectedVehicle(vehicleList[0]);
//         setVehicleId(vehicleList[0].id);
//       }
//     } catch (e) {
//       console.log("Vehicle load error", e);
//       showCustomAlert('Error', 'Failed to load vehicles', 'error');
//     } finally {
//       setLoadingVehicles(false);
//     }
//   };

//   const loadPrefs = async () => {
//     try {
//       const defs = await matchpreferenceDatabaseService.getMatchingPreferenceMaster();
//       const userVals = await matchpreferenceDatabaseService.getUserMatchingPreferences(phoneNumber);

//       setMaster(defs || []);
//       setValues(userVals || {});
      
//       if (userVals && Object.keys(userVals).length > 0) {
//         setPreferencesSummary(userVals);
//       }
//     } catch (e) {
//       console.log('Error loading preferences', e);
//     } finally {
//       setLoading(false);
//     }
//   };

//   const grouped = useMemo(() => groupByCategory(master), [master]);

//   const updateValue = (key, value) => {
//     setValues(prev => ({ ...prev, [key]: value }));
//   };

//   const handleVehicleSelect = (vehicle) => {
//     if (isEdit && lockedFields.includes('vehicle')) {
//       showCustomAlert(
//         "Vehicle Change Limited",
//         "Vehicle can be changed, but all booked passengers will be notified.",
//         "info",
//         () => {
//           setSelectedVehicle(vehicle);
//           setVehicleId(vehicle.id);
//           setShowVehicleModal(false);
//           setVehicleSearchQuery('');
//         }
//       );
//     } else {
//       setSelectedVehicle(vehicle);
//       setVehicleId(vehicle.id);
//       setShowVehicleModal(false);
//       setVehicleSearchQuery('');
//     }
//   };

//   const handleAddNewVehicle = () => {
//     setShowVehicleModal(false);
//     navigation.navigate("AddNewVehicleScreen", { phoneNumber });
//   };

//   const handlePreferencesToggle = (value) => {
//     if (value) {
//       navigation.navigate("MatchingPreferenceScreen", {
//         onSave: (savedPrefs) => {
//           setValues(savedPrefs);
//           setPreferencesSummary(savedPrefs);
//           setShowPreferences(true);
//         }
//       });
//     } else {
//       setShowPreferences(false);
//     }
//   };

//   const getCompactPreferenceSummary = () => {
//     if (!preferencesSummary || Object.keys(preferencesSummary).length === 0) {
//       return null;
//     }
    
//     const selectedPrefs = [];
    
//     Object.keys(preferencesSummary).forEach(key => {
//       const value = preferencesSummary[key];
//       const prefConfig = PREFERENCE_LABELS[key];
      
//       if (prefConfig) {
//         if (value === true) {
//           selectedPrefs.push(prefConfig.label);
//         } else if (value && typeof value === 'string' && value.trim() !== '') {
//           selectedPrefs.push(`${prefConfig.label}: ${prefConfig.getValue(value)}`);
//         } else if (Array.isArray(value) && value.length > 0) {
//           selectedPrefs.push(`${prefConfig.label}: ${value.join(', ')}`);
//         }
//       }
//     });
    
//     return selectedPrefs.length > 0 ? selectedPrefs : null;
//   };

//   const compactSummary = getCompactPreferenceSummary();

//   const handleContinue = () => {
//     if (!selectedVehicle) {
//       showCustomAlert('Vehicle Required', 'Please select a vehicle before continuing', 'warning');
//       return;
//     }
//     onNext({ 
//       preferences: { ...values, womenOnly }, 
//       vehicleId: selectedVehicle.id,
//       maxSeats: selectedVehicle.max_seats || 4
//     });
//   };

//   const clearVehicleSearch = () => {
//     setVehicleSearchQuery('');
//   };

//   const renderVehicleItem = ({ item }) => (
//     <TouchableOpacity
//       style={[
//         styles.vehicleOption,
//         selectedVehicle?.id === item.id && styles.vehicleOptionSelected
//       ]}
//       onPress={() => handleVehicleSelect(item)}
//     >
//       <View style={styles.vehicleOptionInfo}>
//         <Text style={styles.vehicleOptionTitle}>
//           {item.registration_number}
//         </Text>
//         <Text style={styles.vehicleOptionSubtitle}>
//           {item.make} {item.model} • {item.color} • {item.max_seats} seats
//         </Text>
//       </View>
//       {selectedVehicle?.id === item.id && (
//         <MaterialIcons name="check-circle" size={24} color={Colors.primary} />
//       )}
//     </TouchableOpacity>
//   );

//   if (loading || loadingVehicles) {
//     return (
//       <View style={styles.loaderContainer}>
//         <LottieView
//           source={require("../../assets/loading.json")}
//           autoPlay
//           loop
//           style={styles.loaderAnimation}
//         />
//       </View>
//     );
//   }
  
//   return (
//     <View style={styles.container}>
//       <Text style={styles.title}>Vehicle & Preferences</Text>

//       <ScrollView showsVerticalScrollIndicator={false}>
        
//         {/* Vehicle Section */}
//         <View style={styles.sectionCard}>
//           <Text style={styles.sectionTitle}>Select Vehicle</Text>
          
//           <TouchableOpacity
//             style={styles.vehicleDropdown}
//             onPress={() => setShowVehicleModal(true)}
//           >
//             <Text style={styles.vehicleDropdownText}>
//               {selectedVehicle
//                 ? `${selectedVehicle.registration_number} - ${selectedVehicle.model}`
//                 : "Select Vehicle"}
//             </Text>
//             <Ionicons name="chevron-down" size={20} color={Colors.secondary} />
//           </TouchableOpacity>

//           <TouchableOpacity onPress={handleAddNewVehicle}>
//             <Text style={styles.addNewText}>+ Add New Vehicle</Text>
//           </TouchableOpacity>

//           {selectedVehicle && (
//             <View style={styles.vehicleCard}>
//               <View style={styles.vehicleCardHeader}>
//                 <MaterialIcons name="directions-car" size={32} color={Colors.primary} />
//                 <View style={styles.vehicleCardTitleContainer}>
//                   <Text style={styles.vehicleCardTitle}>
//                     {selectedVehicle.model}
//                   </Text>
//                   {selectedVehicle.year && (
//                     <Text style={styles.vehicleCardYear}>{selectedVehicle.year}</Text>
//                   )}
//                 </View>
//               </View>
              
//               <View style={styles.registrationSection}>
//                 <Text style={styles.registrationLabel}>Registration Number</Text>
//                 <Text style={styles.registrationValue}>{selectedVehicle.registration_number || '-'}</Text>
//               </View>
              
//               <View style={styles.detailsRow}>
//                 <View style={styles.detailItem}>
//                   <MaterialIcons name="category" size={18} color={Colors.primary} />
//                   <Text style={styles.detailItemLabel}>Type</Text>
//                   <Text style={styles.detailItemValue} numberOfLines={1}>{selectedVehicle.vehicle_type || '-'}</Text>
//                 </View>
//                 <View style={styles.detailItem}>
//                   <MaterialIcons name="local-gas-station" size={18} color={Colors.primary} />
//                   <Text style={styles.detailItemLabel}>Fuel</Text>
//                   <Text style={styles.detailItemValue} numberOfLines={1}>{selectedVehicle.fuel_type || '-'}</Text>
//                 </View>
//                 <View style={styles.detailItem}>
//                   <MaterialIcons name="palette" size={18} color={Colors.primary} />
//                   <Text style={styles.detailItemLabel}>Color</Text>
//                   <Text style={styles.detailItemValue} numberOfLines={1}>{selectedVehicle.color || '-'}</Text>
//                 </View>
//                 <View style={styles.detailItem}>
//                   <MaterialIcons name="airline-seat-recline-extra" size={18} color={Colors.primary} />
//                   <Text style={styles.detailItemLabel}>Seats</Text>
//                   <Text style={styles.detailItemValue} numberOfLines={1}>{selectedVehicle.max_seats || '-'}</Text>
//                 </View>
//               </View>
//             </View>
//           )}
//         </View>

//         {/* Ride Preferences Section */}
//         <View style={styles.sectionCard}>
//           <View style={styles.preferenceHeader}>
//             <Text style={styles.sectionTitle}>Ride Preferences</Text>
//             <Switch
//               value={showPreferences}
//               onValueChange={handlePreferencesToggle}
//               trackColor={{ true: Colors.primary }}
//             />
//           </View>
          
//           <Text style={styles.preferenceDescription}>
//             Do you want to change the ride preference?
//           </Text>

//           {showPreferences && compactSummary && (
//             <TouchableOpacity 
//               style={styles.preferenceSummaryCard}
//               onPress={() => {
//                 navigation.navigate("MatchingPreferenceScreen", {
//                   onSave: (savedPrefs) => {
//                     setValues(savedPrefs);
//                     setPreferencesSummary(savedPrefs);
//                   }
//                 });
//               }}
//             >
//               <View style={styles.preferenceSummaryHeader}>
//                 <MaterialIcons name="check-circle" size={20} color={Colors.success} />
//                 <Text style={styles.preferenceSummaryTitle}>Your Preferences</Text>
//                 <MaterialIcons name="edit" size={16} color={Colors.primary} style={{ marginLeft: 'auto' }} />
//               </View>
//               <View style={styles.preferenceTagsContainer}>
//                 {compactSummary.map((pref, index) => (
//                   <View key={index} style={styles.preferenceTag}>
//                     <Text style={styles.preferenceTagText}>{pref}</Text>
//                   </View>
//                 ))}
//               </View>
//               <Text style={styles.editHint}>Tap to edit preferences</Text>
//             </TouchableOpacity>
//           )}
          
//           {showPreferences && !compactSummary && (
//             <TouchableOpacity 
//               style={styles.emptyPreferenceCard}
//               onPress={() => {
//                 navigation.navigate("MatchingPreferenceScreen", {
//                   onSave: (savedPrefs) => {
//                     setValues(savedPrefs);
//                     setPreferencesSummary(savedPrefs);
//                   }
//                 });
//               }}
//             >
//               <Text style={styles.emptyPreferenceText}>+ Add your ride preferences</Text>
//             </TouchableOpacity>
//           )}
//         </View>

//         {/* Women Only Section - Only for female drivers */}
//         {isFemaleDriver && (
//           <View style={styles.womenOnlySection}>
//             <View style={styles.womenOnlyHeader}>
//               <View>
//                 <Text style={styles.womenOnlyTitle}>Women Only Ride</Text>
//                 <Text style={styles.womenOnlyDescription}>
//                   When enabled, this ride will only be visible to women passengers
//                 </Text>
//               </View>
//               <Switch
//                 value={womenOnly}
//                 onValueChange={setWomenOnly}
//                 trackColor={{ true: Colors.primary }}
//               />
//             </View>
//             {womenOnly && (
//               <View style={styles.womenOnlyNote}>
//                 <MaterialIcons name="info" size={16} color={Colors.primary} />
//                 <Text style={styles.womenOnlyNoteText}>
//                   Male passengers will not see this ride in search results
//                 </Text>
//               </View>
//             )}
//           </View>
//         )}

//       </ScrollView>

//       <TouchableOpacity
//         style={[
//           styles.actionButton,
//           !selectedVehicle && styles.actionButtonDisabled
//         ]}
//         onPress={handleContinue}
//       >
//         <Text style={styles.actionButtonText}>Continue</Text>
//       </TouchableOpacity>

//       {/* Vehicle Selection Modal */}
//       <Modal visible={showVehicleModal} transparent animationType="slide">
//         <View style={styles.modalOverlay}>
//           <View style={styles.modalContent}>
//             <View style={styles.modalHeader}>
//               <Text style={styles.modalTitle}>Select Vehicle</Text>
//               <TouchableOpacity onPress={() => {
//                 setShowVehicleModal(false);
//                 setVehicleSearchQuery('');
//               }}>
//                 <MaterialIcons name="close" size={26} color={Colors.gray} />
//               </TouchableOpacity>
//             </View>

//             <View style={styles.modalSearchContainer}>
//               <View style={styles.modalSearchWrapper}>
//                 <Ionicons name="search-outline" size={20} color={Colors.gray} style={styles.modalSearchIcon} />
//                 <TextInput
//                   style={styles.modalSearchInput}
//                   placeholder="Search by registration, make, model..."
//                   placeholderTextColor={Colors.gray}
//                   value={vehicleSearchQuery}
//                   onChangeText={setVehicleSearchQuery}
//                   returnKeyType="search"
//                 />
//                 {vehicleSearchQuery.length > 0 && (
//                   <TouchableOpacity onPress={clearVehicleSearch} style={styles.modalClearIcon}>
//                     <Ionicons name="close-circle" size={20} color={Colors.gray} />
//                   </TouchableOpacity>
//                 )}
//               </View>
//               {vehicleSearchQuery.length > 0 && (
//                 <Text style={styles.modalSearchResultCount}>
//                   Found {filteredVehicles.length} {filteredVehicles.length === 1 ? 'vehicle' : 'vehicles'}
//                 </Text>
//               )}
//             </View>

//             <ScrollView style={{ paddingHorizontal: 20 }}>
//               {filteredVehicles.length === 0 ? (
//                 <View style={styles.emptyVehicle}>
//                   <MaterialIcons name="search-off" size={50} color={Colors.gray} />
//                   <Text style={styles.emptyVehicleText}>No vehicles found</Text>
//                   <TouchableOpacity
//                     style={styles.addVehicleButton}
//                     onPress={() => {
//                       setShowVehicleModal(false);
//                       handleAddNewVehicle();
//                     }}
//                   >
//                     <Text style={styles.addVehicleButtonText}>+ Add New Vehicle</Text>
//                   </TouchableOpacity>
//                 </View>
//               ) : (
//                 <FlatList
//                   data={filteredVehicles}
//                   renderItem={renderVehicleItem}
//                   keyExtractor={(item) => item.id.toString()}
//                   showsVerticalScrollIndicator={false}
//                   scrollEnabled={false}
//                 />
//               )}
//             </ScrollView>
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
//     </View>
//   );
// }

// const styles = StyleSheet.create({
//   container: {
//     backgroundColor: 'rgba(255, 255, 255, 0.95)',
//     borderRadius: 28,
//     padding: 18,
//     marginBottom: 14,
//     shadowColor: '#000',
//     shadowOffset: { width: 0, height: 10 },
//     shadowOpacity: 0.15,
//     shadowRadius: 20,
//     elevation: 10,
//     borderWidth: 1,
//     borderColor: 'rgba(229, 231, 235, 0.5)',
//   },
//   loaderContainer: {
//     flex: 1,
//     justifyContent: 'center',
//     alignItems: 'center',
//     backgroundColor: 'rgba(255, 255, 255, 0.95)',
//     borderRadius: 28,
//     padding: 18,
//     marginBottom: 14,
//     minHeight: 700,
//   },
//   loaderAnimation: {
//     width: 300,
//     height: 300,
//   },
//   title: {
//     fontSize: 20,
//     fontWeight: '700',
//     marginBottom: 14,
//     color: Colors.dark
//   },
//   sectionCard: {
//     backgroundColor: '#f8f9fc',
//     borderRadius: 16,
//     padding: 16,
//     marginBottom: 16,
//     borderWidth: 1,
//     borderColor: '#e8eaf0',
//   },
//   sectionTitle: {
//     fontSize: 16,
//     fontWeight: '700',
//     color: Colors.dark,
//     marginBottom: 12
//   },
//   vehicleDropdown: {
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//     alignItems: 'center',
//     borderWidth: 1.5,
//     borderColor: '#E5E7EB',
//     borderRadius: 14,
//     paddingHorizontal: 16,
//     paddingVertical: 14,
//     backgroundColor: '#fff',
//     marginBottom: 10,
//   },
//   vehicleDropdownText: {
//     fontSize: 16,
//     color: Colors.dark,
//     fontWeight: '500',
//   },
//   addNewText: {
//     color: Colors.primary,
//     fontWeight: '600',
//     marginBottom: 12,
//   },
//   vehicleCard: {
//     backgroundColor: '#fff',
//     borderRadius: 12,
//     padding: 16,
//     marginTop: 8,
//     borderWidth: 1,
//     borderColor: '#e0e8f0',
//   },
//   vehicleCardHeader: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     marginBottom: 16,
//   },
//   vehicleCardTitleContainer: {
//     marginLeft: 12,
//     flex: 1,
//   },
//   vehicleCardTitle: {
//     fontSize: 20,
//     fontWeight: '700',
//     color: Colors.dark,
//   },
//   vehicleCardYear: {
//     fontSize: 13,
//     color: Colors.gray,
//     marginTop: 2,
//   },
//   registrationSection: {
//     backgroundColor: '#f0f4f8',
//     borderRadius: 10,
//     padding: 12,
//     marginBottom: 16,
//     alignItems: 'center',
//   },
//   registrationLabel: {
//     fontSize: 11,
//     color: Colors.gray,
//     marginBottom: 4,
//     textTransform: 'uppercase',
//     letterSpacing: 0.5,
//   },
//   registrationValue: {
//     fontSize: 18,
//     fontWeight: '700',
//     color: Colors.dark,
//     letterSpacing: 1,
//   },
//   detailsRow: {
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//   },
//   detailItem: {
//     flex: 1,
//     alignItems: 'center',
//     paddingVertical: 8,
//   },
//   detailItemLabel: {
//     fontSize: 10,
//     color: Colors.gray,
//     marginTop: 4,
//     textTransform: 'uppercase',
//   },
//   detailItemValue: {
//     fontSize: 12,
//     fontWeight: '600',
//     color: Colors.dark,
//     marginTop: 2,
//     textAlign: 'center',
//   },
//   preferenceHeader: {
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//     alignItems: 'center',
//   },
//   preferenceDescription: {
//     fontSize: 14,
//     color: Colors.gray,
//     marginBottom: 12,
//   },
//   preferenceSummaryCard: {
//     borderRadius: 12,
//     padding: 14,
//     borderWidth: 1,
//     borderColor: '#d4edda',
//     backgroundColor: '#f0fff4',
//   },
//   emptyPreferenceCard: {
//     backgroundColor: '#fff',
//     borderRadius: 12,
//     padding: 20,
//     borderWidth: 1,
//     borderColor: '#e0e8f0',
//     borderStyle: 'dashed',
//     alignItems: 'center',
//   },
//   emptyPreferenceText: {
//     color: Colors.primary,
//     fontSize: 14,
//     fontWeight: '600',
//   },
//   preferenceSummaryHeader: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     marginBottom: 10,
//   },
//   preferenceSummaryTitle: {
//     fontSize: 14,
//     fontWeight: '600',
//     color: Colors.success,
//     marginLeft: 6,
//   },
//   preferenceTagsContainer: {
//     flexDirection: 'row',
//     flexWrap: 'wrap',
//     gap: 8,
//   },
//   preferenceTag: {
//     backgroundColor: Colors.primary,
//     paddingHorizontal: 12,
//     paddingVertical: 6,
//     borderRadius: 16,
//   },
//   preferenceTagText: {
//     color: '#fff',
//     fontSize: 12,
//     fontWeight: '600',
//   },
//   editHint: {
//     fontSize: 11,
//     color: Colors.primary,
//     marginTop: 10,
//     textAlign: 'center',
//   },
//   womenOnlySection: {
//     marginTop: 16,
//     paddingTop: 16,
//     borderTopWidth: 1,
//     borderTopColor: '#e8eaf0',
//     marginBottom: 20,
//   },
//   womenOnlyHeader: {
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//     alignItems: 'center',
//   },
//   womenOnlyTitle: {
//     fontSize: 16,
//     fontWeight: '600',
//     color: Colors.dark,
//   },
//   womenOnlyDescription: {
//     fontSize: 12,
//     color: Colors.gray,
//     marginTop: 2,
//   },
//   womenOnlyNote: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     marginTop: 12,
//     padding: 10,
//     backgroundColor: '#EFF6FF',
//     borderRadius: 8,
//     gap: 8,
//   },
//   womenOnlyNoteText: {
//     fontSize: 12,
//     color: Colors.primary,
//     flex: 1,
//   },
//   actionButton: {
//     backgroundColor: Colors.primary,
//     paddingVertical: 14,
//     borderRadius: 16,
//     alignItems: 'center',
//     marginTop: 10
//   },
//   actionButtonDisabled: {
//     backgroundColor: Colors.gray,
//     opacity: 0.6,
//   },
//   actionButtonText: {
//     color: '#fff',
//     fontSize: 16,
//     fontWeight: '700'
//   },
//   modalOverlay: {
//     flex: 1,
//     backgroundColor: 'rgba(0, 0, 0, 0.5)',
//     justifyContent: 'flex-end',
//   },
//   modalContent: {
//     backgroundColor: '#fff',
//     borderTopLeftRadius: 24,
//     borderTopRightRadius: 24,
//     maxHeight: '80%',
//   },
//   modalHeader: {
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//     alignItems: 'center',
//     padding: 20,
//     borderBottomWidth: 1,
//     borderBottomColor: '#e0e0e0',
//   },
//   modalTitle: {
//     fontSize: 18,
//     fontWeight: '700',
//     color: Colors.dark,
//   },
//   modalSearchContainer: {
//     paddingHorizontal: 20,
//     paddingTop: 12,
//     paddingBottom: 8,
//     borderBottomWidth: 1,
//     borderBottomColor: '#F3F4F6',
//   },
//   modalSearchWrapper: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     backgroundColor: '#F9FAFB',
//     borderRadius: 12,
//     borderWidth: 1,
//     borderColor: '#E5E7EB',
//     paddingHorizontal: 12,
//     height: 44,
//   },
//   modalSearchIcon: {
//     marginRight: 8,
//   },
//   modalSearchInput: {
//     flex: 1,
//     fontSize: 15,
//     color: Colors.dark,
//     paddingVertical: 0,
//   },
//   modalClearIcon: {
//     padding: 4,
//   },
//   modalSearchResultCount: {
//     fontSize: 12,
//     color: Colors.gray,
//     marginTop: 8,
//     marginLeft: 4,
//   },
//   emptyVehicle: {
//     alignItems: 'center',
//     padding: 40,
//   },
//   emptyVehicleText: {
//     fontSize: 16,
//     color: Colors.gray,
//     marginTop: 16,
//     marginBottom: 20,
//   },
//   addVehicleButton: {
//     backgroundColor: Colors.primary,
//     paddingHorizontal: 20,
//     paddingVertical: 12,
//     borderRadius: 10,
//   },
//   addVehicleButtonText: {
//     color: '#fff',
//     fontWeight: '600',
//   },
//   vehicleOption: {
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//     alignItems: 'center',
//     paddingVertical: 14,
//     paddingHorizontal: 10,
//     borderBottomWidth: 1,
//     borderBottomColor: '#f0f0f0',
//   },
//   vehicleOptionSelected: {
//     backgroundColor: '#f0f8ff',
//     borderRadius: 10,
//   },
//   vehicleOptionInfo: {
//     flex: 1,
//   },
//   vehicleOptionTitle: {
//     fontSize: 16,
//     fontWeight: '600',
//     color: Colors.dark,
//   },
//   vehicleOptionSubtitle: {
//     fontSize: 14,
//     color: Colors.gray,
//     marginTop: 2,
//   },
// });
import React, { useEffect, useState, useMemo } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Switch,
  StyleSheet,
  Modal,
  TextInput,
  FlatList,
  ActivityIndicator,
} from 'react-native';
import { MaterialIcons, Ionicons } from '@expo/vector-icons';
import LottieView from "lottie-react-native";
import DatabaseService from '../../services/myvehicle_ds';
import matchpreferenceDatabaseService from '../../services/matchingpreference_ds';
import CustomAlert from '../../components/CustomAlert';
import { Colors } from '../../constants/Colors';
import { useFocusEffect } from '@react-navigation/native';

const groupByCategory = (list = []) =>
  list.reduce((acc, i) => {
    acc[i.category] = acc[i.category] || [];
    acc[i.category].push(i);
    return acc;
  }, {});

const PREFERENCE_LABELS = {
  smoking_policy: { label: 'Smoking', getValue: (v) => v },
  speak_languages: { label: 'Languages', getValue: (v) => Array.isArray(v) ? v.join(', ') : v },
  chat_level: { label: 'Chat', getValue: (v) => v },
  age_category: { label: 'Age', getValue: (v) => v },
  gender_preference: { label: 'Gender', getValue: (v) => v },
  luggage_allowance: { label: 'Luggage', getValue: (v) => v },
  pets_allowed: { label: 'Pets', getValue: (v) => v ? 'Allowed' : 'Not allowed' },
  detours: { label: 'Detours', getValue: (v) => v ? 'Allowed' : 'Not allowed' },
  helmet_policy_driver: { label: 'Helmet (Driver)', getValue: (v) => v ? 'Required' : 'Optional' },
  helmet_policy_passenger: { label: 'Helmet (Passenger)', getValue: (v) => v ? 'Required' : 'Optional' },
  avoid_frequent_stops: { label: 'Avoid Stops', getValue: (v) => v ? 'Yes' : 'No' },
  same_gender_after_9pm: { label: 'Same Gender (Night)', getValue: (v) => v ? 'Yes' : 'No' },
  verified_profiles_only: { label: 'Verified Only', getValue: (v) => v ? 'Yes' : 'No' },
};

export default function Step3({ 
  phoneNumber, 
  onNext, 
  navigation, 
  setVehicleId, 
  vehicleId: initialVehicleId,
  isEdit = false,
  lockedFields = [],
  userGender = null,
  rideBookings = null, // Add this prop to receive existing bookings
}) {

  const [master, setMaster] = useState([]);
  const [values, setValues] = useState({});
  const [loading, setLoading] = useState(true);

  const [vehicles, setVehicles] = useState([]);
  const [filteredVehicles, setFilteredVehicles] = useState([]);
  const [selectedVehicle, setSelectedVehicle] = useState(null);
  const [showVehicleModal, setShowVehicleModal] = useState(false);
  const [loadingVehicles, setLoadingVehicles] = useState(true);
  const [vehicleSearchQuery, setVehicleSearchQuery] = useState('');
  const [originalVehicleId, setOriginalVehicleId] = useState(null);

  const [showPreferences, setShowPreferences] = useState(false);
  const [preferencesSummary, setPreferencesSummary] = useState(null);
  
  const [womenOnly, setWomenOnly] = useState(false);
  const [originalWomenOnly, setOriginalWomenOnly] = useState(false);
  const [showWomenOnlyWarning, setShowWomenOnlyWarning] = useState(false);
  const [femaleBookingsCount, setFemaleBookingsCount] = useState(0);
  
  const isFemaleDriver = userGender === 'female';

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
          { text: 'Confirm', onPress: () => {
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
    loadPrefs();
    loadVehicles();
  }, []);

  // Check female bookings for Women Only lock
  useEffect(() => {
    if (isEdit && rideBookings && rideBookings.length > 0) {
      // Count female passengers with accepted bookings
      const femaleBookings = rideBookings.filter(b => 
        b.status === 'accepted' && b.passenger_gender === 'female'
      );
      setFemaleBookingsCount(femaleBookings.length);
      
      // If there are female bookings and womenOnly is being set to false, show warning
      if (femaleBookings.length > 0 && womenOnly === false && originalWomenOnly === true) {
        setShowWomenOnlyWarning(true);
      } else {
        setShowWomenOnlyWarning(false);
      }
    }
  }, [isEdit, rideBookings, womenOnly, originalWomenOnly]);

  useEffect(() => {
    if (vehicleSearchQuery.trim()) {
      const filtered = vehicles.filter(vehicle => 
        vehicle.registration_number?.toLowerCase().includes(vehicleSearchQuery.toLowerCase()) ||
        `${vehicle.make} ${vehicle.model}`.toLowerCase().includes(vehicleSearchQuery.toLowerCase()) ||
        vehicle.vehicle_type?.toLowerCase().includes(vehicleSearchQuery.toLowerCase())
      );
      setFilteredVehicles(filtered);
    } else {
      setFilteredVehicles(vehicles);
    }
  }, [vehicleSearchQuery, vehicles]);

  useFocusEffect(
    React.useCallback(() => {
      loadVehicles();
      loadPrefs();
    }, [phoneNumber])
  );

  const loadVehicles = async () => {
    if (!phoneNumber) {
      setLoadingVehicles(false);
      return;
    }
    try {
      const data = await DatabaseService.getVehicles(phoneNumber);
      const vehicleList = Array.isArray(data) ? data : [];
      setVehicles(vehicleList);
      setFilteredVehicles(vehicleList);

      if (initialVehicleId) {
        setOriginalVehicleId(initialVehicleId);
        const existing = vehicleList.find(v => v.id === initialVehicleId);
        if (existing) {
          setSelectedVehicle(existing);
          setVehicleId(existing.id);
        } else if (vehicleList.length > 0) {
          setSelectedVehicle(vehicleList[0]);
          setVehicleId(vehicleList[0].id);
        }
      } else if (vehicleList.length > 0 && !selectedVehicle) {
        setSelectedVehicle(vehicleList[0]);
        setVehicleId(vehicleList[0].id);
      }
    } catch (e) {
      console.log("Vehicle load error", e);
      showCustomAlert('Error', 'Failed to load vehicles', 'error');
    } finally {
      setLoadingVehicles(false);
    }
  };

  const loadPrefs = async () => {
    try {
      const defs = await matchpreferenceDatabaseService.getMatchingPreferenceMaster();
      const userVals = await matchpreferenceDatabaseService.getUserMatchingPreferences(phoneNumber);

      setMaster(defs || []);
      setValues(userVals || {});
      
      if (userVals && Object.keys(userVals).length > 0) {
        setPreferencesSummary(userVals);
        setShowPreferences(true);
      }
    } catch (e) {
      console.log('Error loading preferences', e);
    } finally {
      setLoading(false);
    }
  };

  const grouped = useMemo(() => groupByCategory(master), [master]);

  const handleVehicleSelect = (vehicle) => {
    const isVehicleLocked = isEdit && lockedFields.includes('vehicle');
    
    if (isVehicleLocked) {
      // Check if trying to change vehicle
      if (selectedVehicle?.id !== vehicle.id) {
        showCustomAlert(
          "Vehicle Change Notice",
          "Changing vehicle will notify all booked passengers. Are you sure you want to continue?",
          "info",
          () => {
            setSelectedVehicle(vehicle);
            setVehicleId(vehicle.id);
            setShowVehicleModal(false);
            setVehicleSearchQuery('');
          }
        );
      } else {
        setShowVehicleModal(false);
        setVehicleSearchQuery('');
      }
    } else {
      setSelectedVehicle(vehicle);
      setVehicleId(vehicle.id);
      setShowVehicleModal(false);
      setVehicleSearchQuery('');
    }
  };

  const handleAddNewVehicle = () => {
    setShowVehicleModal(false);
    navigation.navigate("AddNewVehicleScreen", { phoneNumber });
  };

  const handlePreferencesToggle = (value) => {
    if (value) {
      navigation.navigate("MatchingPreferenceScreen", {
        onSave: (savedPrefs) => {
          setValues(savedPrefs);
          setPreferencesSummary(savedPrefs);
          setShowPreferences(true);
        }
      });
    } else {
      setShowPreferences(false);
      setValues({});
      setPreferencesSummary(null);
    }
  };

  const handleWomenOnlyToggle = (value) => {
    // If trying to disable Women Only mode and there are female bookings, block it
    if (isEdit && originalWomenOnly === true && value === false && femaleBookingsCount > 0) {
      showCustomAlert(
        "Cannot Disable Women Only Mode",
        `You have ${femaleBookingsCount} female passenger(s) who booked this ride based on the safety promise.\n\nWomen Only mode cannot be turned off for this ride as it would compromise their safety expectations.`,
        "warning"
      );
      return;
    }
    setWomenOnly(value);
  };

  const getCompactPreferenceSummary = () => {
    if (!preferencesSummary || Object.keys(preferencesSummary).length === 0) {
      return null;
    }
    
    const selectedPrefs = [];
    
    Object.keys(preferencesSummary).forEach(key => {
      const value = preferencesSummary[key];
      const prefConfig = PREFERENCE_LABELS[key];
      
      if (prefConfig && value) {
        if (value === true) {
          selectedPrefs.push(prefConfig.label);
        } else if (value === false) {
          // Skip false values
        } else if (typeof value === 'string' && value.trim() !== '') {
          selectedPrefs.push(`${prefConfig.label}: ${prefConfig.getValue(value)}`);
        } else if (Array.isArray(value) && value.length > 0) {
          selectedPrefs.push(`${prefConfig.label}: ${value.join(', ')}`);
        }
      }
    });
    
    return selectedPrefs.length > 0 ? selectedPrefs : null;
  };

  const compactSummary = getCompactPreferenceSummary();

  const handleContinue = () => {
    if (!selectedVehicle) {
      showCustomAlert('Vehicle Required', 'Please select a vehicle before continuing', 'warning');
      return;
    }
    
    // Final check for Women Only lock before continuing
    if (isEdit && originalWomenOnly === true && womenOnly === false && femaleBookingsCount > 0) {
      showCustomAlert(
        "Cannot Disable Women Only Mode",
        `You have ${femaleBookingsCount} female passenger(s) who booked this ride based on the safety promise.\n\nWomen Only mode cannot be turned off for this ride.`,
        "warning"
      );
      return;
    }
    
    // Show warning if vehicle changed in edit mode
    const isVehicleLocked = isEdit && lockedFields.includes('vehicle');
    if (isVehicleLocked && originalVehicleId && selectedVehicle.id !== originalVehicleId) {
      showCustomAlert(
        "Vehicle Change",
        "You are changing the vehicle for this ride. All booked passengers will be notified of this change.",
        "info",
        () => {
          onNext({ 
            preferences: { ...values, womenOnly }, 
            vehicleId: selectedVehicle.id,
            maxSeats: selectedVehicle.max_seats || 4
          });
        }
      );
    } else {
      onNext({ 
        preferences: { ...values, womenOnly }, 
        vehicleId: selectedVehicle.id,
        maxSeats: selectedVehicle.max_seats || 4
      });
    }
  };

  const clearVehicleSearch = () => {
    setVehicleSearchQuery('');
  };

  const renderVehicleItem = ({ item }) => {
    const isSelected = selectedVehicle?.id === item.id;
    const isVehicleLocked = isEdit && lockedFields.includes('vehicle');
    
    return (
      <TouchableOpacity
        style={[
          styles.vehicleOption,
          isSelected && styles.vehicleOptionSelected,
          isVehicleLocked && !isSelected && styles.vehicleOptionDisabled
        ]}
        onPress={() => handleVehicleSelect(item)}
        disabled={isVehicleLocked && !isSelected}
      >
        <View style={styles.vehicleOptionInfo}>
          <Text style={styles.vehicleOptionTitle}>
            {item.registration_number}
          </Text>
          <Text style={styles.vehicleOptionSubtitle}>
            {item.make} {item.model} • {item.color} • {item.max_seats} seats
          </Text>
        </View>
        {isSelected ? (
          <MaterialIcons name="check-circle" size={24} color={Colors.primary} />
        ) : (
          isVehicleLocked && (
            <MaterialIcons name="lock" size={20} color={Colors.gray} />
          )
        )}
      </TouchableOpacity>
    );
  };

  if (loading || loadingVehicles) {
    return (
      <View style={styles.loaderContainer}>
        <LottieView
          source={require("../../assets/loading.json")}
          autoPlay
          loop
          style={styles.loaderAnimation}
        />
      </View>
    );
  }
  
  const isVehicleLocked = isEdit && lockedFields.includes('vehicle');
  
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Vehicle & Preferences</Text>

      <ScrollView showsVerticalScrollIndicator={false}>
        
        {/* Vehicle Section */}
        <View style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>Select Vehicle</Text>
          
          {isVehicleLocked && (
            <View style={styles.lockedBanner}>
              <Ionicons name="lock-closed" size={16} color="#92400E" />
              <Text style={styles.lockedBannerText}>
                ⚠️ Vehicle can be changed, but all booked passengers will be notified
              </Text>
            </View>
          )}
          
          <TouchableOpacity
            style={[styles.vehicleDropdown, isVehicleLocked && styles.lockedField]}
            onPress={() => setShowVehicleModal(true)}
          >
            <Text style={[styles.vehicleDropdownText, isVehicleLocked && styles.lockedText]}>
              {selectedVehicle
                ? `${selectedVehicle.registration_number} - ${selectedVehicle.model}`
                : "Select Vehicle"}
            </Text>
            <Ionicons name="chevron-down" size={20} color={isVehicleLocked ? Colors.gray : Colors.secondary} />
          </TouchableOpacity>

          <TouchableOpacity onPress={handleAddNewVehicle}>
            <Text style={styles.addNewText}>+ Add New Vehicle</Text>
          </TouchableOpacity>

          {selectedVehicle && (
            <View style={styles.vehicleCard}>
              <View style={styles.vehicleCardHeader}>
                <MaterialIcons name="directions-car" size={32} color={Colors.primary} />
                <View style={styles.vehicleCardTitleContainer}>
                  <Text style={styles.vehicleCardTitle}>
                    {selectedVehicle.model}
                  </Text>
                  {selectedVehicle.year && (
                    <Text style={styles.vehicleCardYear}>{selectedVehicle.year}</Text>
                  )}
                </View>
              </View>
              
              <View style={styles.registrationSection}>
                <Text style={styles.registrationLabel}>Registration Number</Text>
                <Text style={styles.registrationValue}>{selectedVehicle.registration_number || '-'}</Text>
              </View>
              
              <View style={styles.detailsRow}>
                <View style={styles.detailItem}>
                  <MaterialIcons name="category" size={18} color={Colors.primary} />
                  <Text style={styles.detailItemLabel}>Type</Text>
                  <Text style={styles.detailItemValue} numberOfLines={1}>{selectedVehicle.vehicle_type || '-'}</Text>
                </View>
                <View style={styles.detailItem}>
                  <MaterialIcons name="local-gas-station" size={18} color={Colors.primary} />
                  <Text style={styles.detailItemLabel}>Fuel</Text>
                  <Text style={styles.detailItemValue} numberOfLines={1}>{selectedVehicle.fuel_type || '-'}</Text>
                </View>
                <View style={styles.detailItem}>
                  <MaterialIcons name="palette" size={18} color={Colors.primary} />
                  <Text style={styles.detailItemLabel}>Color</Text>
                  <Text style={styles.detailItemValue} numberOfLines={1}>{selectedVehicle.color || '-'}</Text>
                </View>
                <View style={styles.detailItem}>
                  <MaterialIcons name="airline-seat-recline-extra" size={18} color={Colors.primary} />
                  <Text style={styles.detailItemLabel}>Seats</Text>
                  <Text style={styles.detailItemValue} numberOfLines={1}>{selectedVehicle.max_seats || '-'}</Text>
                </View>
              </View>
              
              {isVehicleLocked && originalVehicleId !== selectedVehicle.id && (
                <View style={styles.changeWarning}>
                  <Ionicons name="alert-circle" size={16} color="#F59E0B" />
                  <Text style={styles.changeWarningText}>
                    Passengers will be notified about vehicle change
                  </Text>
                </View>
              )}
            </View>
          )}
        </View>

        {/* Ride Preferences Section */}
        <View style={styles.sectionCard}>
          <View style={styles.preferenceHeader}>
            <Text style={styles.sectionTitle}>Ride Preferences</Text>
            <Switch
              value={showPreferences}
              onValueChange={handlePreferencesToggle}
              trackColor={{ true: Colors.primary }}
            />
          </View>
          
          <Text style={styles.preferenceDescription}>
            Set preferences for matching with passengers
          </Text>

          {showPreferences && compactSummary && (
            <TouchableOpacity 
              style={styles.preferenceSummaryCard}
              onPress={() => {
                navigation.navigate("MatchingPreferenceScreen", {
                  onSave: (savedPrefs) => {
                    setValues(savedPrefs);
                    setPreferencesSummary(savedPrefs);
                  }
                });
              }}
            >
              <View style={styles.preferenceSummaryHeader}>
                <MaterialIcons name="check-circle" size={20} color={Colors.success} />
                <Text style={styles.preferenceSummaryTitle}>Your Preferences</Text>
                <MaterialIcons name="edit" size={16} color={Colors.primary} style={{ marginLeft: 'auto' }} />
              </View>
              <View style={styles.preferenceTagsContainer}>
                {compactSummary.slice(0, 6).map((pref, index) => (
                  <View key={index} style={styles.preferenceTag}>
                    <Text style={styles.preferenceTagText}>{pref}</Text>
                  </View>
                ))}
                {compactSummary.length > 6 && (
                  <View style={styles.preferenceTag}>
                    <Text style={styles.preferenceTagText}>+{compactSummary.length - 6} more</Text>
                  </View>
                )}
              </View>
              <Text style={styles.editHint}>Tap to edit preferences</Text>
            </TouchableOpacity>
          )}
          
          {showPreferences && !compactSummary && (
            <TouchableOpacity 
              style={styles.emptyPreferenceCard}
              onPress={() => {
                navigation.navigate("MatchingPreferenceScreen", {
                  onSave: (savedPrefs) => {
                    setValues(savedPrefs);
                    setPreferencesSummary(savedPrefs);
                  }
                });
              }}
            >
              <Text style={styles.emptyPreferenceText}>+ Add your ride preferences</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Women Only Section - Only for female drivers */}
        {isFemaleDriver && (
          <View style={styles.womenOnlySection}>
            <View style={styles.womenOnlyHeader}>
              <View>
                <Text style={styles.womenOnlyTitle}>Women Only Ride</Text>
                <Text style={styles.womenOnlyDescription}>
                  When enabled, this ride will only be visible to women passengers
                </Text>
              </View>
              <Switch
                value={womenOnly}
                onValueChange={handleWomenOnlyToggle}
                trackColor={{ true: Colors.primary }}
                disabled={isEdit && femaleBookingsCount > 0 && womenOnly === true}
              />
            </View>
            
            {/* Warning when trying to disable with female bookings */}
            {showWomenOnlyWarning && (
              <View style={styles.womenOnlyWarning}>
                <Ionicons name="warning" size={16} color="#D97706" />
                <Text style={styles.womenOnlyWarningText}>
                  ⚠️ Cannot disable Women Only mode - {femaleBookingsCount} female passenger(s) have already booked this ride based on the safety promise.
                </Text>
              </View>
            )}
            
            {/* Info when Women Only is enabled */}
            {womenOnly && (
              <View style={styles.womenOnlyNote}>
                <MaterialIcons name="info" size={16} color={Colors.primary} />
                <Text style={styles.womenOnlyNoteText}>
                  Male passengers will not see this ride in search results
                </Text>
              </View>
            )}
            
            {/* Locked info when switch is disabled */}
            {isEdit && femaleBookingsCount > 0 && womenOnly === true && (
              <View style={styles.womenOnlyLockedInfo}>
                <MaterialIcons name="lock" size={14} color={Colors.gray} />
                <Text style={styles.womenOnlyLockedText}>
                  Women Only mode is locked because {femaleBookingsCount} female passenger(s) have already booked
                </Text>
              </View>
            )}
          </View>
        )}

      </ScrollView>

      <TouchableOpacity
        style={[
          styles.actionButton,
          !selectedVehicle && styles.actionButtonDisabled
        ]}
        onPress={handleContinue}
      >
        <Text style={styles.actionButtonText}>Continue</Text>
      </TouchableOpacity>

      {/* Vehicle Selection Modal */}
      <Modal visible={showVehicleModal} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Select Vehicle</Text>
              <TouchableOpacity onPress={() => {
                setShowVehicleModal(false);
                setVehicleSearchQuery('');
              }}>
                <MaterialIcons name="close" size={26} color={Colors.gray} />
              </TouchableOpacity>
            </View>

            <View style={styles.modalSearchContainer}>
              <View style={styles.modalSearchWrapper}>
                <Ionicons name="search-outline" size={20} color={Colors.gray} style={styles.modalSearchIcon} />
                <TextInput
                  style={styles.modalSearchInput}
                  placeholder="Search by registration, make, model..."
                  placeholderTextColor={Colors.gray}
                  value={vehicleSearchQuery}
                  onChangeText={setVehicleSearchQuery}
                  returnKeyType="search"
                />
                {vehicleSearchQuery.length > 0 && (
                  <TouchableOpacity onPress={clearVehicleSearch} style={styles.modalClearIcon}>
                    <Ionicons name="close-circle" size={20} color={Colors.gray} />
                  </TouchableOpacity>
                )}
              </View>
              {vehicleSearchQuery.length > 0 && (
                <Text style={styles.modalSearchResultCount}>
                  Found {filteredVehicles.length} {filteredVehicles.length === 1 ? 'vehicle' : 'vehicles'}
                </Text>
              )}
            </View>

            <ScrollView style={{ paddingHorizontal: 20 }}>
              {filteredVehicles.length === 0 ? (
                <View style={styles.emptyVehicle}>
                  <MaterialIcons name="search-off" size={50} color={Colors.gray} />
                  <Text style={styles.emptyVehicleText}>No vehicles found</Text>
                  <TouchableOpacity
                    style={styles.addVehicleButton}
                    onPress={() => {
                      setShowVehicleModal(false);
                      handleAddNewVehicle();
                    }}
                  >
                    <Text style={styles.addVehicleButtonText}>+ Add New Vehicle</Text>
                  </TouchableOpacity>
                </View>
              ) : (
                <FlatList
                  data={filteredVehicles}
                  renderItem={renderVehicleItem}
                  keyExtractor={(item) => item.id.toString()}
                  showsVerticalScrollIndicator={false}
                  scrollEnabled={false}
                />
              )}
            </ScrollView>
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
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderRadius: 28,
    padding: 18,
    marginBottom: 14,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.15,
    shadowRadius: 20,
    elevation: 10,
    borderWidth: 1,
    borderColor: 'rgba(229, 231, 235, 0.5)',
  },
  loaderContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderRadius: 28,
    padding: 18,
    marginBottom: 14,
    minHeight: 700,
  },
  loaderAnimation: {
    width: 300,
    height: 300,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 14,
    color: Colors.dark
  },
  sectionCard: {
    backgroundColor: '#f8f9fc',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#e8eaf0',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.dark,
    marginBottom: 12
  },
  lockedBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEF3C7',
    padding: 10,
    borderRadius: 10,
    marginBottom: 12,
    gap: 8,
  },
  lockedBannerText: {
    flex: 1,
    fontSize: 12,
    color: '#92400E',
  },
  vehicleDropdown: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: '#E5E7EB',
    borderRadius: 14,
    paddingHorizontal: 16,
    paddingVertical: 14,
    backgroundColor: '#fff',
    marginBottom: 10,
  },
  lockedField: {
    backgroundColor: '#F3F4F6',
    borderColor: '#D1D5DB',
  },
  lockedText: {
    color: Colors.gray,
  },
  vehicleDropdownText: {
    fontSize: 16,
    color: Colors.dark,
    fontWeight: '500',
  },
  addNewText: {
    color: Colors.primary,
    fontWeight: '600',
    marginBottom: 12,
  },
  vehicleCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginTop: 8,
    borderWidth: 1,
    borderColor: '#e0e8f0',
  },
  vehicleCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  vehicleCardTitleContainer: {
    marginLeft: 12,
    flex: 1,
  },
  vehicleCardTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: Colors.dark,
  },
  vehicleCardYear: {
    fontSize: 13,
    color: Colors.gray,
    marginTop: 2,
  },
  registrationSection: {
    backgroundColor: '#f0f4f8',
    borderRadius: 10,
    padding: 12,
    marginBottom: 16,
    alignItems: 'center',
  },
  registrationLabel: {
    fontSize: 11,
    color: Colors.gray,
    marginBottom: 4,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  registrationValue: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.dark,
    letterSpacing: 1,
  },
  detailsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  detailItem: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 8,
  },
  detailItemLabel: {
    fontSize: 10,
    color: Colors.gray,
    marginTop: 4,
    textTransform: 'uppercase',
  },
  detailItemValue: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.dark,
    marginTop: 2,
    textAlign: 'center',
  },
  changeWarning: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 12,
    padding: 10,
    backgroundColor: '#FEF3C7',
    borderRadius: 8,
    gap: 8,
  },
  changeWarningText: {
    flex: 1,
    fontSize: 11,
    color: '#92400E',
  },
  preferenceHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  preferenceDescription: {
    fontSize: 14,
    color: Colors.gray,
    marginBottom: 12,
  },
  preferenceSummaryCard: {
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: '#d4edda',
    backgroundColor: '#f0fff4',
  },
  emptyPreferenceCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    borderWidth: 1,
    borderColor: '#e0e8f0',
    borderStyle: 'dashed',
    alignItems: 'center',
  },
  emptyPreferenceText: {
    color: Colors.primary,
    fontSize: 14,
    fontWeight: '600',
  },
  preferenceSummaryHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  preferenceSummaryTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.success,
    marginLeft: 6,
  },
  preferenceTagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  preferenceTag: {
    backgroundColor: Colors.primary,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  preferenceTagText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  editHint: {
    fontSize: 11,
    color: Colors.primary,
    marginTop: 10,
    textAlign: 'center',
  },
  womenOnlySection: {
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#e8eaf0',
    marginBottom: 20,
  },
  womenOnlyHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  womenOnlyTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.dark,
  },
  womenOnlyDescription: {
    fontSize: 12,
    color: Colors.gray,
    marginTop: 2,
  },
  womenOnlyNote: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 12,
    padding: 10,
    backgroundColor: '#EFF6FF',
    borderRadius: 8,
    gap: 8,
  },
  womenOnlyNoteText: {
    fontSize: 12,
    color: Colors.primary,
    flex: 1,
  },
  womenOnlyWarning: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 12,
    padding: 10,
    backgroundColor: '#FEF3C7',
    borderRadius: 8,
    gap: 8,
    borderWidth: 1,
    borderColor: '#FDE68A',
  },
  womenOnlyWarningText: {
    flex: 1,
    fontSize: 12,
    color: '#92400E',
    fontWeight: '500',
  },
  womenOnlyLockedInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
    padding: 8,
    gap: 6,
  },
  womenOnlyLockedText: {
    fontSize: 11,
    color: Colors.gray,
    flex: 1,
  },
  actionButton: {
    backgroundColor: Colors.primary,
    paddingVertical: 14,
    borderRadius: 16,
    alignItems: 'center',
    marginTop: 10
  },
  actionButtonDisabled: {
    backgroundColor: Colors.gray,
    opacity: 0.6,
  },
  actionButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700'
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.dark,
  },
  modalSearchContainer: {
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  modalSearchWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    paddingHorizontal: 12,
    height: 44,
  },
  modalSearchIcon: {
    marginRight: 8,
  },
  modalSearchInput: {
    flex: 1,
    fontSize: 15,
    color: Colors.dark,
    paddingVertical: 0,
  },
  modalClearIcon: {
    padding: 4,
  },
  modalSearchResultCount: {
    fontSize: 12,
    color: Colors.gray,
    marginTop: 8,
    marginLeft: 4,
  },
  emptyVehicle: {
    alignItems: 'center',
    padding: 40,
  },
  emptyVehicleText: {
    fontSize: 16,
    color: Colors.gray,
    marginTop: 16,
    marginBottom: 20,
  },
  addVehicleButton: {
    backgroundColor: Colors.primary,
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 10,
  },
  addVehicleButtonText: {
    color: '#fff',
    fontWeight: '600',
  },
  vehicleOption: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  vehicleOptionSelected: {
    backgroundColor: '#f0f8ff',
    borderRadius: 10,
  },
  vehicleOptionDisabled: {
    opacity: 0.5,
  },
  vehicleOptionInfo: {
    flex: 1,
  },
  vehicleOptionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.dark,
  },
  vehicleOptionSubtitle: {
    fontSize: 14,
    color: Colors.gray,
    marginTop: 2,
  },
});