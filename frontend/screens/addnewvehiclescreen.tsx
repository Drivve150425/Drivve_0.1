// import { Ionicons } from '@expo/vector-icons';
// import { LinearGradient } from "expo-linear-gradient";
// import { useRef, useState } from 'react';
// import DatabaseService from "../services/DatabaseService";
// import * as ImagePicker from "expo-image-picker";
// import { useEffect } from "react";

// import {
//   Alert,
//   Dimensions,
//   Modal,
//   ScrollView,
//   StatusBar,
//   StyleSheet,
//   Text,
//   TextInput,
//   TouchableOpacity,
//   View
// } from 'react-native';

// const { height: screenHeight } = Dimensions.get('window');

// const AddVehicleScreen = ({ navigation,route }: any) => {
//    const phoneNumber =
//   route?.params?.phoneNumber ||
//   navigation?.getState()?.routes
//     ?.find(r => r.params?.phoneNumber)
//     ?.params?.phoneNumber ||
//   null;


//   const [vehicleType, setVehicleType] = useState<'Car' | 'Bike' | null>(null);
//   const [bodyType, setBodyType] = useState<string>('');
//   const [vehicleDetails, setVehicleDetails] = useState({
//     make: '',
//     model: '',
//     year: '',
//     registrationNumber: '',
//     color: '',
//     maxSeats: '4',
//   });
//   const [additionalNotes, setAdditionalNotes] = useState('');
//   const [showScrollTop, setShowScrollTop] = useState(false);
  
//   // Dropdown states
//   const [showVehicleTypeDropdown, setShowVehicleTypeDropdown] = useState(false);
//   const [showBodyTypeDropdown, setShowBodyTypeDropdown] = useState(false);

//   const scrollViewRef = useRef<ScrollView>(null);
// const renderSearchableList = (data: string[], onSelect: (v: string) => void) => {
//   return data
//     .filter(v => v.toLowerCase().includes(searchQuery.toLowerCase()))
//     .map(item => (
//       <TouchableOpacity
//         key={item}
//         style={styles.modalOption}
//         onPress={() => {
//           onSelect(item);
//           setSearchQuery("");
//         }}
//       >
//         <Text style={styles.modalOptionText}>{item}</Text>
//         <Ionicons name="checkmark" size={18} color="#184080" />
//       </TouchableOpacity>
//     ));
// };

//   const vehicleTypes = [
//     { value: 'Car', label: 'Car', icon: 'car-sport' },
//     { value: 'Bike', label: 'Bike/Scooter', icon: 'bicycle' }
//   ];

//   const bodyTypes = [
//     'Hatchback', 'Sedan', 'SUV', 'Truck', 'Coupe', 'Convertible', 
//     'Minivan', 'Wagon', 'Sports Car', 'Electric Vehicle'
//   ];
//   const VEHICLE_MASTER = {
//   Toyota: ["Camry", "Corolla", "Innova"],
//   Honda: ["City", "Amaze", "Civic"],
//   Hyundai: ["i10", "i20", "Creta"],
//   Tata: ["Nexon", "Punch", "Harrier"],
// };

// const FUEL_TYPES = ["Petrol", "Diesel", "CNG", "Electric", "Hybrid"];
// const [fuelType, setFuelType] = useState("");
// const [make, setMake] = useState("");
// const [model, setModel] = useState("");

// const [searchQuery, setSearchQuery] = useState("");

// const [showFuelTypeDropdown, setShowFuelTypeDropdown] = useState(false);
// const [showMakeDropdown, setShowMakeDropdown] = useState(false);
// const [showModelDropdown, setShowModelDropdown] = useState(false);

// const [vehiclePhoto, setVehiclePhoto] = useState<string | null>(null);

// const editingVehicle = route?.params?.vehicle || null;
// const isEdit = !!editingVehicle;
// useEffect(() => {
//   if (!editingVehicle) return;

//   // Dropdown selections
//   setVehicleType(editingVehicle.vehicle_type);
//   setBodyType(editingVehicle.body_type);
//   setFuelType(editingVehicle.fuel_type);

//   // Make / Model
//   setMake(editingVehicle.make);
//   setModel(editingVehicle.model);

//   // Text inputs
//   setVehicleDetails({
//     make: editingVehicle.make || "",
//     model: editingVehicle.model || "",
//     year: String(editingVehicle.year || ""),
//     registrationNumber: editingVehicle.registration_number || "",
//     color: editingVehicle.color || "",
//     maxSeats: String(editingVehicle.max_seats || "4"),
//   });

//   // Notes
//   setAdditionalNotes(editingVehicle.notes || "");

//   // Existing image
//   if (editingVehicle.photo_url) {
//     setVehiclePhoto(
//       `http://192.168.1.13:8000/${editingVehicle.photo_url}`
//     );
//   }
// }, [editingVehicle]);

// const handleSaveVehicle = async () => {
//   try {
//     if (!phoneNumber) {
//       Alert.alert("Error", "Phone number missing");
//       return;
//     }

//     if (!vehicleType || !bodyType || !fuelType || !make || !model) {
//       Alert.alert("Error", "Please fill all required fields");
//       return;
//     }

//     const formData = new FormData();

//     formData.append("phone_number", String(phoneNumber));
//     formData.append("vehicle_type", vehicleType);
//     formData.append("body_type", bodyType);
//     formData.append("fuel_type", fuelType);
//     formData.append("make", make);
//     formData.append("model", model);
//     formData.append("year", vehicleDetails.year);
//     formData.append("registration_number", vehicleDetails.registrationNumber);
//     formData.append("color", vehicleDetails.color || "");
//     formData.append("max_seats", vehicleDetails.maxSeats);
//     formData.append("notes", additionalNotes || "");

//     // ✅ IMAGE (RN-safe)
//    if (vehiclePhoto && !vehiclePhoto.startsWith("http")) {
//       formData.append(
//         "photo",
//         {
//           uri: vehiclePhoto,
//           name: "vehicle.jpg",
//           type: "image/jpeg",
//         } as any
//       );
//     }


//     // ✅ API CALL
//     if (isEdit) {
//       await DatabaseService.updateVehicle(editingVehicle.id, formData);
//       Alert.alert("Success", "Vehicle updated successfully");
//     } else {
//       await DatabaseService.addVehicle(formData);
//       Alert.alert("Success", "Vehicle added successfully");
//     }

//     navigation.goBack();
//   } catch (error: any) {
//     console.error("❌ Add vehicle error:", error);
//     Alert.alert(
//       "Error",
//       error?.message || "Failed to save vehicle"
//     );
//   }
// };

//   const getVehicleTypeLabel = () => {
//     if (!vehicleType) return 'Select Vehicle Type';
//     const selected = vehicleTypes.find(type => type.value === vehicleType);
//     return selected ? selected.label : 'Select Vehicle Type';
//   };

//   const handleScroll = (event: any) => {
//     const scrollY = event.nativeEvent.contentOffset.y;
//     // Show scroll to top button when scrolled down more than 200 pixels
//     setShowScrollTop(scrollY > 200);
//   };

//   const scrollToTop = () => {
//     scrollViewRef.current?.scrollTo({ y: 0, animated: true });
//   };
// const pickVehiclePhoto = async () => {
//   const result = await ImagePicker.launchImageLibraryAsync({
//     mediaTypes: ImagePicker.MediaTypeOptions.Images,
//     quality: 0.7,
//   });

//   if (!result.canceled) {
//     setVehiclePhoto(result.assets[0].uri);
//   }
// };

//   return (
//     <View style={styles.container}>
//       <StatusBar backgroundColor="#184080" barStyle="light-content" />
      
//       {/* Top Header with Back Button */}
//       <LinearGradient
//         colors={["#184080", "#2a5cb0"]}
//         style={styles.topHeader}
//       >
//         <TouchableOpacity
//           style={styles.backButton}
//           onPress={() => navigation.goBack()}
//         >
//           <Ionicons name="chevron-back" size={26} color="white" />
//         </TouchableOpacity>
//       </LinearGradient>

//       <ScrollView 
//         ref={scrollViewRef}
//         style={styles.scrollView} 
//         showsVerticalScrollIndicator={false}
//         onScroll={handleScroll}
//         scrollEventThrottle={16}
//       >
        
//         {/* Header Section */}
//         <View style={styles.header}>
//           <Text style={styles.mainTitle}>Vehicle Type</Text>
          
//           {/* Vehicle Type Dropdown */}
//           <TouchableOpacity 
//             style={styles.dropdownButton}
//             onPress={() => setShowVehicleTypeDropdown(true)}
//           >
//             <Text style={[
//               styles.dropdownButtonText,
//               !vehicleType && styles.dropdownPlaceholder
//             ]}>
//               {getVehicleTypeLabel()}
//             </Text>
//             <Ionicons name="chevron-down" size={20} color="#666" />
//           </TouchableOpacity>
//         </View>

//         {/* Body Type Section */}
//         <View style={styles.section}>
//           <Text style={styles.sectionTitle}>Body Type</Text>
          
//           <TouchableOpacity 
//             style={styles.dropdownButton}
//             onPress={() => setShowBodyTypeDropdown(true)}
//           >
//             <Text style={[
//               styles.dropdownButtonText,
//               !bodyType && styles.dropdownPlaceholder
//             ]}>
//               {bodyType || 'Select Body Type'}
//             </Text>
//             <Ionicons name="chevron-down" size={20} color="#666" />
//           </TouchableOpacity>
//         </View>
//         <View style={styles.section}>
//   <Text style={styles.sectionTitle}>Fuel Type</Text>

//   <TouchableOpacity
//     style={styles.dropdownButton}
//     onPress={() => setShowFuelTypeDropdown(true)}
//   >
//     <Text style={[
//       styles.dropdownButtonText,
//       !fuelType && styles.dropdownPlaceholder
//     ]}>
//       {fuelType || 'Select Fuel Type'}
//     </Text>
//     <Ionicons name="chevron-down" size={20} color="#666" />
//   </TouchableOpacity>
// </View>

//         {/* Vehicle Photo Section */}
//         <View style={styles.section}>
//           <Text style={styles.sectionTitle}>Vehicle Photo</Text>
//           <View style={styles.uploadContainer}>
//             <View style={styles.uploadBox}>
//               <Ionicons name="camera-outline" size={48} color="#666666" />
//               <Text style={styles.uploadText}>
//                 Tap to upload vehicle photo
//               </Text>
//              <TouchableOpacity style={styles.uploadButton} onPress={pickVehiclePhoto}>
//   <Text style={styles.uploadButtonText}>
//     {vehiclePhoto ? "Change Photo" : "Upload Photo"}
//   </Text>
// </TouchableOpacity>

// {vehiclePhoto && (
//   <Text style={{ marginTop: 8, color: "#184080" }}>
//     Photo selected ✔
//   </Text>
// )}

//               <Text style={styles.uploadSubtext}>Max file size: 5MB</Text>
//             </View>
//           </View>
//         </View>

//         {/* Vehicle Details Container */}
//         <View style={styles.detailsContainer}>
//           <Text style={styles.detailsContainerTitle}>Vehicle Details</Text>
          
//           <View style={styles.formContainer}>
//             <View style={styles.inputRow}>
//              <View style={[styles.inputGroup, styles.halfInput]}>
//   <Text style={styles.inputLabel}>Make *</Text>
//   <TouchableOpacity
//     style={styles.dropdownButton}
//     onPress={() => setShowMakeDropdown(true)}
//   >
//     <Text style={styles.dropdownButtonText}>
//       {make || "Select Make"}
//     </Text>
//     <Ionicons name="chevron-down" size={20} color="#666" />
//   </TouchableOpacity>
// </View>

//          <View style={[styles.inputGroup, styles.halfInput]}>
//   <Text style={styles.inputLabel}>Model *</Text>
//   <TouchableOpacity
//     style={styles.dropdownButton}
//     disabled={!make}
//     onPress={() => setShowModelDropdown(true)}
//   >
//     <Text style={styles.dropdownButtonText}>
//       {model || "Select Model"}
//     </Text>
//     <Ionicons name="chevron-down" size={20} color="#666" />
//   </TouchableOpacity>
// </View>

//             </View>

//             <View style={styles.inputRow}>
//               <View style={[styles.inputGroup, styles.halfInput]}>
//                 <Text style={styles.inputLabel}>Year *</Text>
//                 <TextInput
//                   style={styles.textInput}
//                   placeholder="e.g., 2020"
//                   value={vehicleDetails.year}
//                   onChangeText={(text) => setVehicleDetails(prev => ({...prev, year: text}))}
//                   placeholderTextColor="#999"
//                   keyboardType="numeric"
//                 />
//               </View>

//               <View style={[styles.inputGroup, styles.halfInput]}>
//                 <Text style={styles.inputLabel}>Color</Text>
//                 <TextInput
//                   style={styles.textInput}
//                   placeholder="e.g., Silver"
//                   value={vehicleDetails.color}
//                   onChangeText={(text) => setVehicleDetails(prev => ({...prev, color: text}))}
//                   placeholderTextColor="#999"
//                 />
//               </View>
//             </View>

//             <View style={styles.inputGroup}>
//               <Text style={styles.inputLabel}>Registration Number</Text>
//               <TextInput
//                 style={styles.textInput}
//                 placeholder="e.g., ABC-1234"
//                 value={vehicleDetails.registrationNumber}
//                 onChangeText={(text) => setVehicleDetails(prev => ({...prev, registrationNumber: text}))}
//                 placeholderTextColor="#999"
//               />
//             </View>

//             <View style={styles.inputGroup}>
//               <Text style={styles.inputLabel}>Max Seats Offered: {vehicleDetails.maxSeats}</Text>
//               <View style={styles.seatsContainer}>
//                 {['1', '2','3', '4', '5', '6', '7', '8'].map((seats) => (
//                   <TouchableOpacity
//                     key={seats}
//                     style={[
//                       styles.seatButton,
//                       vehicleDetails.maxSeats === seats && styles.seatButtonSelected
//                     ]}
//                     onPress={() => setVehicleDetails(prev => ({...prev, maxSeats: seats}))}
//                   >
//                     <Text style={[
//                       styles.seatButtonText,
//                       vehicleDetails.maxSeats === seats && styles.seatButtonTextSelected
//                     ]}>
//                       {seats}
//                     </Text>
//                   </TouchableOpacity>
//                 ))}
//               </View>
//             </View>
//           </View>
//         </View>

//         {/* Additional Notes Section */}
//         <View style={styles.section}>
//           <Text style={styles.sectionTitle}>Additional Notes</Text>
//           <TextInput
//             style={[styles.textInput, styles.textArea]}
//             placeholder="Any special features or conditions..."
//             value={additionalNotes}
//             onChangeText={setAdditionalNotes}
//             placeholderTextColor="#999"
//             multiline
//             numberOfLines={4}
//             textAlignVertical="top"
//           />
//         </View>

//         {/* Save Button */}
//         <TouchableOpacity style={styles.saveButton} onPress={handleSaveVehicle}>
//           <Text style={styles.saveButtonText}>Save Vehicle</Text>
//         </TouchableOpacity>

//       </ScrollView>

//       {/* Scroll to Top Button */}
//       {showScrollTop && (
//         <TouchableOpacity style={styles.scrollTopButton} onPress={scrollToTop}>
//           <Ionicons name="chevron-up" size={24} color="#fff" />
//         </TouchableOpacity>
//       )}

//       {/* Vehicle Type Dropdown Modal */}
//       <Modal
//         visible={showVehicleTypeDropdown}
//         transparent={true}
//         animationType="slide"
//         statusBarTranslucent={true}
//       >
//         <View style={styles.modalOverlay}>
//           <TouchableOpacity 
//             style={styles.modalBackdrop}
//             activeOpacity={1}
//             onPress={() => setShowVehicleTypeDropdown(false)}
//           />
//           <View style={styles.bottomSheet}>
//             <View style={styles.dragHandle} />
//             <View style={styles.modalHeader}>
//               <Text style={styles.modalTitle}>Select Vehicle Type</Text>
//               <TouchableOpacity 
//                 onPress={() => setShowVehicleTypeDropdown(false)}
//               >
//                 <Ionicons name="close" size={24} color="#666" />
//               </TouchableOpacity>
//             </View>
//             <ScrollView style={styles.modalScrollView}>
//               {vehicleTypes.map((type) => (
//                 <TouchableOpacity
//                   key={type.value}
//                   style={[
//                     styles.modalOption,
//                     vehicleType === type.value && styles.modalOptionSelected
//                   ]}
//                   onPress={() => {
//                     setVehicleType(type.value as 'Car' | 'Bike');
//                     setShowVehicleTypeDropdown(false);
//                   }}
//                 >
//                   <Ionicons 
//                     name={type.icon as any} 
//                     size={24} 
//                     color={vehicleType === type.value ? '#184080' : '#666'} 
//                   />
//                   <Text style={[
//                     styles.modalOptionText,
//                     vehicleType === type.value && styles.modalOptionTextSelected
//                   ]}>
//                     {type.label}
//                   </Text>
//                 </TouchableOpacity>
//               ))}
//             </ScrollView>
//           </View>
//         </View>
//       </Modal>
// <Modal visible={showMakeDropdown} transparent animationType="slide">
//   <View style={styles.modalOverlay}>
//     <View style={styles.bottomSheet}>
//       <TextInput
//         placeholder="Search make..."
//         style={styles.textInput}
//         value={searchQuery}
//         onChangeText={setSearchQuery}
//       />
//       <ScrollView>
//         {renderSearchableList(Object.keys(VEHICLE_MASTER), (v) => {
//           setMake(v);
//           setModel(""); // reset model
//           setShowMakeDropdown(false);
//         })}
//       </ScrollView>
//     </View>
//   </View>
// </Modal>
// <Modal visible={showModelDropdown} transparent animationType="slide">
//   <View style={styles.modalOverlay}>
//     <View style={styles.bottomSheet}>
//       <TextInput
//         placeholder="Search model..."
//         style={styles.textInput}
//         value={searchQuery}
//         onChangeText={setSearchQuery}
//       />
//       <ScrollView>
//         {make &&
//           renderSearchableList(VEHICLE_MASTER[make] || [], (v) => {
//             setModel(v);
//             setShowModelDropdown(false);
//           })}
//       </ScrollView>
//     </View>
//   </View>
// </Modal>
// <Modal visible={showFuelTypeDropdown} transparent animationType="slide">
//   <View style={styles.modalOverlay}>
//     <View style={styles.bottomSheet}>
//       <TextInput
//         placeholder="Search fuel type..."
//         style={styles.textInput}
//         value={searchQuery}
//         onChangeText={setSearchQuery}
//       />
//       <ScrollView>
//         {renderSearchableList(FUEL_TYPES, (v) => {
//           setFuelType(v);
//           setShowFuelTypeDropdown(false);
//         })}
//       </ScrollView>
//     </View>
//   </View>
// </Modal>


//       {/* Body Type Dropdown Modal */}
//       <Modal
//         visible={showBodyTypeDropdown}
//         transparent={true}
//         animationType="slide"
//         statusBarTranslucent={true}
//       >
//         <View style={styles.modalOverlay}>
//           <TouchableOpacity 
//             style={styles.modalBackdrop}
//             activeOpacity={1}
//             onPress={() => setShowBodyTypeDropdown(false)}
//           />
//           <View style={styles.bottomSheet}>
//             <View style={styles.dragHandle} />
//             <View style={styles.modalHeader}>
//               <Text style={styles.modalTitle}>Select Body Type</Text>
//               <TouchableOpacity 
//                 onPress={() => setShowBodyTypeDropdown(false)}
//               >
//                 <Ionicons name="close" size={24} color="#666" />
//               </TouchableOpacity>
//             </View>
//             <ScrollView style={styles.modalScrollView}>
//               {bodyTypes.map((type) => (
//                 <TouchableOpacity
//                   key={type}
//                   style={[
//                     styles.modalOption,
//                     bodyType === type && styles.modalOptionSelected
//                   ]}
//                   onPress={() => {
//                     setBodyType(type);
//                     setShowBodyTypeDropdown(false);
//                   }}
//                 >
//                   <Text style={[
//                     styles.modalOptionText,
//                     bodyType === type && styles.modalOptionTextSelected
//                   ]}>
//                     {type}
//                   </Text>
//                   {bodyType === type && (
//                     <Ionicons name="checkmark" size={20} color="#184080" />
//                   )}
//                 </TouchableOpacity>
//               ))}
//             </ScrollView>
//           </View>
//         </View>
//       </Modal>
//     </View>
//   );
// };

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     backgroundColor: '#ffffff',
//   },
//   topHeader: {
//     flexDirection: "row",
//     alignItems: "center",
//     paddingTop: StatusBar.currentHeight ? StatusBar.currentHeight + 10 : 50,
//     paddingHorizontal: 20,
//     paddingBottom: 20,
//     borderBottomLeftRadius: 25,
//     borderBottomRightRadius: 25,
//     shadowColor: "#000",
//     shadowOffset: { width: 0, height: 4 },
//     shadowOpacity: 0.3,
//     shadowRadius: 8,
//     elevation: 8,
//   },
//   backButton: {
//     flexDirection: 'row',
//     alignItems: 'center',
//   },
//   scrollView: {
//     flex: 1,
//   },
//   header: {
//     padding: 20,
//     backgroundColor: '#ffffff',
//     paddingTop: 20,
//   },
//   mainTitle: {
//     fontSize: 24,
//     fontWeight: '600',
//     color: '#1a1a1a',
//     marginBottom: 16,
//   },
//   section: {
//     padding: 20,
//   },
//   sectionTitle: {
//     fontSize: 18,
//     fontWeight: '600',
//     color: '#1a1a1a',
//     marginBottom: 6,
//   },
//   // Vehicle Details Container
//   detailsContainer: {
//     margin: 20,
//     backgroundColor: '#f8f9fa',
//     borderRadius: 12,
//     padding: 20,
//     shadowColor: "#000",
//     shadowOffset: { width: 0, height: 2 },
//     shadowOpacity: 0.1,
//     shadowRadius: 4,
//     elevation: 3,
//   },
//   detailsContainerTitle: {
//     fontSize: 20,
//     fontWeight: '600',
//     color: '#1a1a1a',
//     marginBottom: 16,
//   },
//   formContainer: {
//     gap: 16,
//   },
//   inputRow: {
//     flexDirection: 'row',
//     gap: 12,
//   },
//   inputGroup: {
//     gap: 8,
//     flex: 1,
//   },
//   halfInput: {
//     flex: 1,
//   },
//   inputLabel: {
//     fontSize: 16,
//     fontWeight: '600',
//     color: '#1a1a1a',
//   },
//   textInput: {
//     borderWidth: 1,
//     borderColor: '#e0e0e0',
//     borderRadius: 8,
//     padding: 12,
//     fontSize: 16,
//     backgroundColor: '#ffffff',
//   },
//   textArea: {
//     minHeight: 100,
//     textAlignVertical: 'top',
//   },
//   // Dropdown Styles
//   dropdownButton: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     justifyContent: 'space-between',
//     borderWidth: 1,
//     borderColor: '#e0e0e0',
//     borderRadius: 8,
//     padding: 16,
//     backgroundColor: '#fafafa',
//   },
//   dropdownButtonText: {
//     fontSize: 16,
//     color: '#1a1a1a',
//   },
//   dropdownPlaceholder: {
//     color: '#999',
//   },
//   // Bottom Sheet Modal Styles - FIXED
//   modalOverlay: {
//     flex: 1,
//     backgroundColor: 'rgba(0, 0, 0, 0.5)',
//     justifyContent: 'flex-end',
//   },
//   modalBackdrop: {
//     ...StyleSheet.absoluteFillObject,
//   },
//   bottomSheet: {
//     backgroundColor: 'white',
//     borderTopLeftRadius: 20,
//     borderTopRightRadius: 20,
//     maxHeight: screenHeight * 0.6,
//   },
//   dragHandle: {
//     width: 40,
//     height: 4,
//     backgroundColor: '#ddd',
//     borderRadius: 2,
//     alignSelf: 'center',
//     marginTop: 8,
//     marginBottom: 8,
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
//     fontWeight: '600',
//     color: '#1a1a1a',
//   },
//   modalScrollView: {
//     maxHeight: 400,
//   },
//   modalOption: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     justifyContent: 'space-between',
//     padding: 16,
//     borderBottomWidth: 1,
//     borderBottomColor: '#f0f0f0',
//   },
//   modalOptionSelected: {
//     backgroundColor: '#f8f9fa',
//   },
//   modalOptionText: {
//     fontSize: 16,
//     color: '#1a1a1a',
//     flex: 1,
//     marginLeft: 12,
//   },
//   modalOptionTextSelected: {
//     color: '#184080',
//     fontWeight: '600',
//   },
//   // Upload Styles
//   uploadContainer: {
//     alignItems: 'center',
//   },
//   uploadBox: {
//     width: '100%',
//     padding: 40,
//     borderWidth: 2,
//     borderColor: '#e0e0e0',
//     borderStyle: 'dashed',
//     borderRadius: 12,
//     alignItems: 'center',
//     backgroundColor: '#fafafa',
//   },
//   uploadText: {
//     fontSize: 16,
//     color: '#666666',
//     textAlign: 'center',
//     marginVertical: 16,
//   },
//   uploadButton: {
//     backgroundColor: '#184080',
//     paddingHorizontal: 24,
//     paddingVertical: 12,
//     borderRadius: 8,
//     marginBottom: 8,
//   },
//   uploadButtonText: {
//     color: 'white',
//     fontSize: 16,
//     fontWeight: '600',
//   },
//   uploadSubtext: {
//     fontSize: 14,
//     color: '#999999',
//   },
//   // Seats Styles
//   seatsContainer: {
//     flexDirection: 'row',
//     flexWrap: 'wrap',
//     gap: 8,
//   },
//   seatButton: {
//     paddingHorizontal: 16,
//     paddingVertical: 8,
//     backgroundColor: '#f8f9fa',
//     borderRadius: 6,
//     borderWidth: 1,
//     borderColor: '#e0e0e0',
//   },
//   seatButtonSelected: {
//     backgroundColor: '#184080',
//     borderColor: '#184080',
//   },
//   seatButtonText: {
//     fontSize: 14,
//     color: '#666666',
//     fontWeight: '500',
//   },
//   seatButtonTextSelected: {
//     color: 'white',
//   },
//   // Save Button
//   saveButton: {
//     margin: 20,
//     backgroundColor: '#184080',
//     paddingVertical: 16,
//     borderRadius: 8,
//     alignItems: 'center',
//   },
//   saveButtonText: {
//     color: 'white',
//     fontSize: 18,
//     fontWeight: '600',
//   },
//   // Scroll to Top Button
//   scrollTopButton: {
//     position: 'absolute',
//     bottom: 30,
//     right: 20,
//     width: 50,
//     height: 50,
//     borderRadius: 25,
//     backgroundColor: '#184080',
//     justifyContent: 'center',
//     alignItems: 'center',
//     shadowColor: '#000',
//     shadowOffset: {
//       width: 0,
//       height: 2,
//     },
//     shadowOpacity: 0.25,
//     shadowRadius: 3.84,
//     elevation: 5,
//   },
// });

// export default AddVehicleScreen;
import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  StatusBar,
  Modal,
  TextInput,
  Image,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons, MaterialIcons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import { Colors, Typography } from "../constants/Colors";
import DatabaseService from "../services/DatabaseService";
import { useEffect } from "react";
/* ================= DATA ================= */
const VEHICLE_TYPES = ["Car", "Bike"];
const BODY_TYPES = ["Hatchback", "Sedan", "SUV", "Coupe", "Convertible"];
const FUEL_TYPES = ["Petrol", "Diesel", "CNG", "Electric", "Hybrid"];

const VEHICLE_MASTER: Record<string, string[]> = {
  Toyota: ["Camry", "Corolla", "Innova"],
  Honda: ["City", "Amaze", "Civic"],
  Hyundai: ["i10", "i20", "Creta"],
  Tata: ["Nexon", "Punch", "Harrier"],
};

type ModalType = "vehicle" | "body" | "fuel" | "make" | "model" | null;

export default function AddNewVehicleScreen({ navigation, route }) {
  const phoneNumber =
    route?.params?.phoneNumber ||
    navigation
      ?.getState()
      ?.routes?.find(r => r.params?.phoneNumber)
      ?.params?.phoneNumber ||
    null;
const editingVehicle = route?.params?.vehicle || null;
const isEdit = !!editingVehicle;

  /* ================= STATE ================= */
  const [vehicleType, setVehicleType] = useState("");
  const [bodyType, setBodyType] = useState("");
  const [fuelType, setFuelType] = useState("");
  const [make, setMake] = useState("");
  const [model, setModel] = useState("");

  const [year, setYear] = useState("");
  const [registration, setRegistration] = useState("");
  const [color, setColor] = useState("");
  const [maxSeats, setMaxSeats] = useState("4");
  const [notes, setNotes] = useState("");

  const [vehiclePhoto, setVehiclePhoto] = useState<string | null>(null);

  const [activeModal, setActiveModal] = useState<ModalType>(null);
  const [search, setSearch] = useState("");

  /* ================= IMAGE ================= */
  const pickImage = async () => {
    const res = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.8,
    });

    if (!res.canceled) {
      setVehiclePhoto(res.assets[0].uri);
    }
  };
useEffect(() => {
  if (!editingVehicle) return;

  setVehicleType(editingVehicle.vehicle_type || "");
  setBodyType(editingVehicle.body_type || "");
  setFuelType(editingVehicle.fuel_type || "");
  setMake(editingVehicle.make || "");
  setModel(editingVehicle.model || "");

  setYear(String(editingVehicle.year || ""));
  setRegistration(editingVehicle.registration_number || "");
  setColor(editingVehicle.color || "");
  setMaxSeats(String(editingVehicle.max_seats || "4"));
  setNotes(editingVehicle.notes || "");

  if (editingVehicle.photo_url) {
    setVehiclePhoto(
      editingVehicle.photo_url.startsWith("http")
        ? editingVehicle.photo_url
        : `http://192.168.1.13:8000/${editingVehicle.photo_url}`
    );
  }
}, [editingVehicle]);

  /* ================= SAVE ================= */
 const handleSave = async () => {
  if (!phoneNumber) {
    Alert.alert("Error", "Phone number missing");
    return;
  }

  if (!vehicleType || !bodyType || !fuelType || !make || !model) {
    Alert.alert("Error", "Please fill all required fields");
    return;
  }

  const formData = new FormData();
  formData.append("phone_number", phoneNumber);
  formData.append("vehicle_type", vehicleType);
  formData.append("body_type", bodyType);
  formData.append("fuel_type", fuelType);
  formData.append("make", make);
  formData.append("model", model);
  formData.append("year", year);
  formData.append("registration_number", registration);
  formData.append("color", color);
  formData.append("max_seats", maxSeats);
  formData.append("notes", notes); // ✅ NOTES ARE OK

  if (vehiclePhoto && !vehiclePhoto.startsWith("http")) {
    formData.append("photo", {
      uri: vehiclePhoto,
      name: "vehicle.jpg",
      type: "image/jpeg",
    } as any);
  }

  try {
    if (isEdit) {
      // ✅ UPDATE (NOT INSERT)
      await DatabaseService.updateVehicle(editingVehicle.id, formData);
      Alert.alert("Success", "Vehicle updated successfully");
    } else {
      // ✅ ADD
      await DatabaseService.addVehicle(formData);
      Alert.alert("Success", "Vehicle added successfully");
    }

    navigation.goBack();
  } catch (e: any) {
    Alert.alert(
      "Error",
      e?.response?.data?.detail || "Failed to save vehicle"
    );
  }
};


  /* ================= MODAL ================= */
  const renderModal = (
    title: string,
    data: string[],
    selected: string,
    onSelect: (v: string) => void
  ) => {
    const filtered = data.filter(v =>
      v.toLowerCase().includes(search.toLowerCase())
    );

    return (
      <Modal transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalSheet}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>{title}</Text>
              <TouchableOpacity onPress={() => setActiveModal(null)}>
                <MaterialIcons name="close" size={26} color={Colors.primary} />
              </TouchableOpacity>
            </View>

            <TextInput
              placeholder="Search..."
              value={search}
              onChangeText={setSearch}
              style={styles.searchInput}
            />

            <ScrollView>
              {filtered.map(item => {
                const isSelected = selected === item;
                return (
                  <TouchableOpacity
                    key={item}
                    style={[
                      styles.modalItem,
                      isSelected && styles.modalItemSelected,
                    ]}
                    onPress={() => {
                      onSelect(item);
                      setSearch("");
                      setActiveModal(null);
                    }}
                  >
                    <Text
                      style={[
                        styles.modalItemText,
                        isSelected && styles.modalItemTextSelected,
                      ]}
                    >
                      {item}
                    </Text>
                    {isSelected && (
                      <MaterialIcons
                        name="check-circle"
                        size={22}
                        color={Colors.primary}
                      />
                    )}
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
          </View>
        </View>
      </Modal>
    );
  };

  /* ================= UI ================= */
  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />

      {/* HEADER */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <MaterialIcons name="arrow-back-ios" size={28} color={Colors.orange1} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Add Vehicle</Text>
        <View style={{ width: 28 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scroll}>
        {/* PHOTO */}
        <TouchableOpacity style={styles.photoCard} onPress={pickImage}>
          {vehiclePhoto ? (
            <Image source={{ uri: vehiclePhoto }} style={styles.vehicleImage} />
          ) : (
            <>
              <Ionicons name="camera-outline" size={40} color={Colors.primary} />
              <Text style={styles.photoText}>Upload Vehicle Photo</Text>
            </>
          )}
        </TouchableOpacity>

        {/* SELECTORS */}
        <Selector label="Vehicle Type *" value={vehicleType} onPress={() => setActiveModal("vehicle")} />
        <Selector label="Body Type *" value={bodyType} onPress={() => setActiveModal("body")} />
        <Selector label="Fuel Type *" value={fuelType} onPress={() => setActiveModal("fuel")} />
        <Selector label="Make *" value={make} onPress={() => setActiveModal("make")} />
        <Selector label="Model *" value={model} onPress={() => setActiveModal("model")} />

        {/* INPUTS */}
        <Input label="Year" value={year} onChange={setYear} />
        <Input label="Registration Number" value={registration} onChange={setRegistration} />
        <Input label="Color" value={color} onChange={setColor} />

        {/* NOTES */}
        <View style={styles.inputBox}>
          <Text style={styles.label}>Notes</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            value={notes}
            onChangeText={setNotes}
            placeholder="Any additional information..."
            multiline
          />
        </View>

        {/* SAVE */}
        <TouchableOpacity style={styles.saveBtn} onPress={handleSave}>
          <Text style={styles.saveText}>Save Vehicle</Text>
        </TouchableOpacity>
      </ScrollView>

      {/* MODALS */}
      {activeModal === "vehicle" &&
        renderModal("Vehicle Type", VEHICLE_TYPES, vehicleType, setVehicleType)}
      {activeModal === "body" &&
        renderModal("Body Type", BODY_TYPES, bodyType, setBodyType)}
      {activeModal === "fuel" &&
        renderModal("Fuel Type", FUEL_TYPES, fuelType, setFuelType)}
      {activeModal === "make" &&
        renderModal("Make", Object.keys(VEHICLE_MASTER), make, v => {
          setMake(v);
          setModel("");
        })}
      {activeModal === "model" &&
        renderModal("Model", VEHICLE_MASTER[make] || [], model, setModel)}
    </SafeAreaView>
  );
}

/* ================= REUSABLE ================= */
const Selector = ({ label, value, onPress }) => (
  <TouchableOpacity style={styles.selector} onPress={onPress}>
    <Text style={styles.label}>{label}</Text>
    <Text style={styles.value}>{value || "Select"}</Text>
  </TouchableOpacity>
);

const Input = ({ label, value, onChange }) => (
  <View style={styles.inputBox}>
    <Text style={styles.label}>{label}</Text>
    <TextInput style={styles.input} value={value} onChangeText={onChange} />
  </View>
);

/* ================= STYLES ================= */
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.white },

  header: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    borderBottomWidth: 0.5,
    borderBottomColor: "#E5E7EB",
  },
  headerTitle: {
    ...Typography.h2,
    flex: 1,
    textAlign: "center",
    color: Colors.primary,
  },

  scroll: { padding: 20, paddingBottom: 40 },

  photoCard: {
    height: 180,
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: "#E5E7EB",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 20,
  },
  vehicleImage: { width: "100%", height: "100%", borderRadius: 16 },
  photoText: { marginTop: 10, fontWeight: "700", color: Colors.primary },

  selector: {
    borderWidth: 1.5,
    borderColor: "#E5E7EB",
    borderRadius: 14,
    padding: 16,
    marginBottom: 12,
  },
  label: { fontWeight: "700", color: Colors.primary },
  value: { marginTop: 4, fontSize: 16 },

  inputBox: { marginBottom: 12 },
  input: {
    borderWidth: 1.5,
    borderColor: "#E5E7EB",
    borderRadius: 14,
    padding: 14,
  },
  textArea: { minHeight: 100, textAlignVertical: "top" },

  saveBtn: {
    backgroundColor: Colors.primary,
    padding: 18,
    borderRadius: 16,
    marginTop: 20,
    alignItems: "center",
  },
  saveText: { color: "#fff", fontWeight: "700", fontSize: 16 },

  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "flex-end",
  },
  modalSheet: {
    backgroundColor: "#fff",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 16,
    maxHeight: "70%",
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 10,
  },
  modalTitle: { fontSize: 18, fontWeight: "700", color: Colors.primary },
  searchInput: {
    borderWidth: 1.5,
    borderColor: "#E5E7EB",
    borderRadius: 12,
    padding: 12,
    marginBottom: 10,
  },
  modalItem: {
    paddingVertical: 14,
    flexDirection: "row",
    justifyContent: "space-between",
  },
  modalItemSelected: { backgroundColor: "#EEF4FF" },
  modalItemText: { fontSize: 16 },
  modalItemTextSelected: { fontWeight: "700", color: Colors.primary },
});
