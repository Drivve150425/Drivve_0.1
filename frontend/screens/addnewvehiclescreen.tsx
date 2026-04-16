import React, { useState, useEffect } from "react";
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
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons, MaterialIcons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import * as ImageManipulator from "expo-image-manipulator";
import { Colors, Typography } from "../constants/Colors";
import DatabaseService from "../services/addvehicle_ds";
import { useAuth } from "../context/AuthContext";

/* ================= DATA ================= */
const VEHICLE_TYPES = ["Car", "Bike"];
const BODY_TYPES: Record<string, string[]> = {
  Car: ["Hatchback", "Sedan", "SUV", "Coupe", "Convertible", "MUV", "Wagon"],
  Bike: ["Sports", "Cruiser", "Commuter", "Scooter", "Dirt Bike", "Touring"],
};
const FUEL_TYPES = ["Petrol", "Diesel", "CNG", "Electric", "Hybrid"];

const VEHICLE_MASTER: Record<string, Record<string, string[]>> = {
  Car: {
    Toyota: ["Camry", "Corolla", "Innova", "Fortuner", "Land Cruiser"],
    Honda: ["City", "Amaze", "Civic", "CR-V", "Accord"],
    Hyundai: ["i10", "i20", "Creta", "Verna", "Tucson", "Venue"],
    Tata: ["Nexon", "Punch", "Harrier", "Safari", "Tiago", "Altroz"],
    Maruti: ["Swift", "Dzire", "Baleno", "Vitara Brezza", "Ertiga"],
    Mahindra: ["XUV700", "Thar", "Scorpio", "XUV300"],
    Kia: ["Seltos", "Sonet", "Carnival"],
    Ford: ["EcoSport", "Endeavour", "Figo", "Aspire"],
    Volkswagen: ["Polo", "Vento", "Tiguan"],
    BMW: ["3 Series", "5 Series", "X1", "X3"],
    Mercedes: ["C-Class", "E-Class", "GLC", "GLE"],
    Audi: ["A4", "A6", "Q3", "Q5"],
  },
  Bike: {
    Hero: ["Splendor", "Passion", "Glamour", "Xtreme"],
    Honda: ["Unicorn", "Shine", "CBR", "Activa"],
    Bajaj: ["Pulsar", "Discover", "Avenger", "Dominar"],
    TVS: ["Apache", "Jupiter", "Ntorq", "Radeon"],
    RoyalEnfield: ["Bullet", "Classic", "Himalayan", "Meteor"],
    Yamaha: ["FZ", "R15", "MT-15", "Fascino"],
    Suzuki: ["Access", "Gixxer", "Burgman"],
    KTM: ["Duke", "RC"],
    Kawasaki: ["Ninja", "Z900"],
  },
};

const SEATS_MAP: Record<string, string> = {
  Hatchback: "5",
  Sedan: "5",
  SUV: "7",
  Coupe: "4",
  Convertible: "4",
  MUV: "8",
  Wagon: "5",
  Sports: "2",
  Cruiser: "2",
  Commuter: "2",
  Scooter: "2",
  "Dirt Bike": "2",
  Touring: "2",
};

type ModalType = "vehicle" | "body" | "fuel" | "make" | "model" | null;
import { API_BASE_URL } from "../config/config_ip";

export default function AddNewVehicleScreen({ navigation, route }) {
  const { user } = useAuth();
  const phoneNumber = user?.phone_number;
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
  const [maxSeats, setMaxSeats] = useState("");
  const [notes, setNotes] = useState("");
  const [photos, setPhotos] = useState<string[]>([]);
  const [activeModal, setActiveModal] = useState<ModalType>(null);
  const [search, setSearch] = useState("");
  const [yearSearch, setYearSearch] = useState("");
  const [showYearDropdown, setShowYearDropdown] = useState(false);
  
  // Flag to track if initial load is done for edit mode
  const [isInitialLoad, setIsInitialLoad] = useState(true);

  // Get current year
  const currentYear = new Date().getFullYear();

  // Generate year options based on fuel type
  const getYearOptions = () => {
    let yearsBack = 15;
    if (fuelType === "Diesel") {
      yearsBack = 10;
    }
    const years = [];
    for (let i = 0; i <= yearsBack; i++) {
      years.push((currentYear - i).toString());
    }
    return years;
  };

  const yearOptions = getYearOptions();
  const filteredYears = yearOptions.filter(year =>
    year.toLowerCase().includes(yearSearch.toLowerCase())
  );

  // Update max seats when body type changes (only for new entries, not during edit load)
  useEffect(() => {
    if (!isInitialLoad && bodyType && SEATS_MAP[bodyType]) {
      setMaxSeats(SEATS_MAP[bodyType]);
    } else if (!isInitialLoad && !bodyType) {
      setMaxSeats("");
    }
  }, [bodyType, isInitialLoad]);

  // Reset dependent fields when vehicle type changes (only for new entries)
  useEffect(() => {
    // Don't reset during initial load in edit mode
    if (!isInitialLoad && !isEdit) {
      setBodyType("");
      setMake("");
      setModel("");
    }
  }, [vehicleType, isInitialLoad, isEdit]);

  // Reset model when make changes (only for new entries)
  useEffect(() => {
    if (!isInitialLoad && !isEdit) {
      setModel("");
    }
  }, [make, isInitialLoad, isEdit]);

  // Load editing vehicle data
  useEffect(() => {
    if (!editingVehicle) {
      setIsInitialLoad(false);
      return;
    }

    setVehicleType(editingVehicle.vehicle_type || "");
    setBodyType(editingVehicle.body_type || "");
    setFuelType(editingVehicle.fuel_type || "");
    setMake(editingVehicle.make || "");
    setModel(editingVehicle.model || "");
    setYear(String(editingVehicle.year || ""));
    setRegistration(editingVehicle.registration_number || "");
    setColor(editingVehicle.color || "");
    setMaxSeats(String(editingVehicle.max_seats || ""));
    
    // Handle notes and photos
    if (editingVehicle.notes && editingVehicle.notes.startsWith('{"photos":')) {
      try {
        const parsedNotes = JSON.parse(editingVehicle.notes);
        setNotes(parsedNotes.notes || "");
        setPhotos(parsedNotes.photos || []);
      } catch (e) {
        setNotes(editingVehicle.notes || "");
        setPhotos(editingVehicle.photos || []);
      }
    } else {
      setNotes(editingVehicle.notes || "");
      setPhotos(editingVehicle.photos || (editingVehicle.photo_url ? [editingVehicle.photo_url] : []));
    }
    
    // Mark initial load as complete after setting all values
    setTimeout(() => {
      setIsInitialLoad(false);
    }, 100);
  }, [editingVehicle]);

  /* ================= IMAGE HANDLING ================= */
  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") {
      Alert.alert("Permission Denied", "Need camera roll permissions to upload photos.");
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.8,
      allowsMultipleSelection: true,
      selectionLimit: 5 - photos.length,
    });

    if (!result.canceled && result.assets) {
      const newPhotos = [...photos];
      for (const asset of result.assets) {
        if (newPhotos.length < 5) {
          const manipulated = await ImageManipulator.manipulateAsync(
            asset.uri,
            [{ resize: { width: 1024 } }],
            { compress: 0.8, format: ImageManipulator.SaveFormat.JPEG }
          );
          newPhotos.push(manipulated.uri);
        }
      }
      setPhotos(newPhotos);
    }
  };

  const takePhoto = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== "granted") {
      Alert.alert("Permission Denied", "Need camera permissions to take photos.");
      return;
    }

    if (photos.length >= 5) {
      Alert.alert("Limit Reached", "You can upload maximum 5 photos.");
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      quality: 0.8,
    });

    if (!result.canceled && result.assets) {
      const manipulated = await ImageManipulator.manipulateAsync(
        result.assets[0].uri,
        [{ resize: { width: 1024 } }],
        { compress: 0.8, format: ImageManipulator.SaveFormat.JPEG }
      );
      setPhotos([...photos, manipulated.uri]);
    }
  };

  const removePhoto = (index: number) => {
    if (!isEdit && photos.length === 1) {
      Alert.alert("Cannot Remove", "At least one photo is required");
      return;
    }
    
    if (isEdit && photos.length === 1) {
      Alert.alert("Cannot Remove", "At least one photo is required. Please add another photo before removing this one.");
      return;
    }

    Alert.alert(
      "Remove Photo",
      "Are you sure you want to remove this photo?",
      [
        { text: "Cancel", style: "cancel" },
        { 
          text: "Remove", 
          style: "destructive",
          onPress: () => {
            const newPhotos = [...photos];
            newPhotos.splice(index, 1);
            setPhotos(newPhotos);
          }
        }
      ]
    );
  };

  const showImageOptions = () => {
    Alert.alert(
      "Add Photo",
      "Choose an option",
      [
        { text: "Take Photo", onPress: takePhoto },
        { text: "Choose from Gallery", onPress: pickImage },
        { text: "Cancel", style: "cancel" },
      ],
      { cancelable: true }
    );
  };

  /* ================= VALIDATION ================= */
  const validateRegistrationNumber = (reg: string) => {
    const regPattern = /^[A-Z]{2}[0-9]{1,2}[A-Z]{1,2}[0-9]{4}$/i;
    if (!reg.trim()) return true;
    return regPattern.test(reg.toUpperCase().replace(/\s/g, ""));
  };

  const formatRegistrationNumber = (text: string) => {
    let cleaned = text.toUpperCase().replace(/[^A-Z0-9]/g, "");
    if (cleaned.length > 2 && cleaned.length <= 4) {
      cleaned = cleaned.slice(0, 2) + " " + cleaned.slice(2);
    } else if (cleaned.length > 4 && cleaned.length <= 6) {
      cleaned = cleaned.slice(0, 2) + " " + cleaned.slice(2, 4) + " " + cleaned.slice(4);
    } else if (cleaned.length > 6) {
      cleaned = cleaned.slice(0, 2) + " " + cleaned.slice(2, 4) + " " + cleaned.slice(4, 6) + " " + cleaned.slice(6, 10);
    }
    return cleaned;
  };

  const handleRegistrationChange = (text: string) => {
    const formatted = formatRegistrationNumber(text);
    setRegistration(formatted);
  };

  /* ================= SAVE ================= */
  const handleSave = async () => {
    if (!phoneNumber) {
      Alert.alert("Session Error", "User session not found. Please login again.");
      return;
    }

    // Validate at least one photo
    if (photos.length === 0) {
      Alert.alert("Photo Required", "Please upload at least one vehicle photo");
      return;
    }

    if (!vehicleType) {
      Alert.alert("Error", "Please select Vehicle Type");
      return;
    }
    if (!bodyType) {
      Alert.alert("Error", "Please select Body Type");
      return;
    }
    if (!make) {
      Alert.alert("Error", "Please select Make");
      return;
    }
    if (!model) {
      Alert.alert("Error", "Please select Model");
      return;
    }
    if (!fuelType) {
      Alert.alert("Error", "Please select Fuel Type");
      return;
    }
    if (!year) {
      Alert.alert("Error", "Year is required");
      return;
    }
    if (!registration.trim()) {
      Alert.alert("Error", "Registration Number is required");
      return;
    }
    if (!validateRegistrationNumber(registration.replace(/\s/g, ""))) {
      Alert.alert("Error", "Please enter a valid Registration Number (e.g., MH12AB1234)");
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
    formData.append("registration_number", registration.replace(/\s/g, ""));
    formData.append("color", color);
    formData.append("max_seats", maxSeats);
    formData.append("notes", notes);

    // Append only new photos (ones that are not existing URLs)
    const newPhotos = photos.filter(photo => !photo.startsWith("http"));
    newPhotos.forEach((photo, index) => {
      formData.append("photos", {
        uri: photo,
        name: `vehicle_${index + 1}.jpg`,
        type: "image/jpeg",
      } as any);
    });

    // Append existing photo URLs to keep them
    const existingPhotoUrls = photos.filter(photo => photo.startsWith("http"));
    if (existingPhotoUrls.length > 0) {
      formData.append("existing_photo_urls", JSON.stringify(existingPhotoUrls));
    }

    try {
      if (isEdit) {
        await DatabaseService.updateVehicle(editingVehicle.id, formData);
        Alert.alert("Success", "Vehicle updated successfully");
      } else {
        await DatabaseService.addVehicle(formData);
        Alert.alert("Success", "Vehicle added successfully");
      }
      navigation.goBack();
    } catch (e: any) {
      Alert.alert("Error", e?.message || "Failed to save vehicle");
    }
  };

  const handleBack = () => {
    navigation.goBack();
  };

  /* ================= MODAL ================= */
  const renderModal = (
    title: string,
    data: string[],
    selected: string,
    onSelect: (v: string) => void,
    disabled = false
  ) => {
    const filtered = data.filter(v =>
      v.toLowerCase().includes(search.toLowerCase())
    );

    return (
      <Modal transparent animationType="slide" visible={activeModal !== null}>
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
              placeholderTextColor="#9CA3AF"
            />

            <ScrollView showsVerticalScrollIndicator={false}>
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
                    disabled={disabled}
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
              {filtered.length === 0 && (
                <Text style={styles.noResultsText}>No options found</Text>
              )}
            </ScrollView>
          </View>
        </View>
      </Modal>
    );
  };

  const renderYearModal = () => (
    <Modal transparent animationType="slide" visible={showYearDropdown}>
      <View style={styles.modalOverlay}>
        <View style={styles.modalSheet}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Select Year</Text>
            <TouchableOpacity onPress={() => setShowYearDropdown(false)}>
              <MaterialIcons name="close" size={26} color={Colors.primary} />
            </TouchableOpacity>
          </View>

          <TextInput
            placeholder="Search year..."
            value={yearSearch}
            onChangeText={setYearSearch}
            style={styles.searchInput}
            placeholderTextColor="#9CA3AF"
            keyboardType="numeric"
          />

          <ScrollView showsVerticalScrollIndicator={false}>
            {filteredYears.map(y => {
              const isSelected = year === y;
              return (
                <TouchableOpacity
                  key={y}
                  style={[
                    styles.modalItem,
                    isSelected && styles.modalItemSelected,
                  ]}
                  onPress={() => {
                    setYear(y);
                    setYearSearch("");
                    setShowYearDropdown(false);
                  }}
                >
                  <Text
                    style={[
                      styles.modalItemText,
                      isSelected && styles.modalItemTextSelected,
                    ]}
                  >
                    {y}
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

  const getBodyTypes = () => {
    if (!vehicleType) return [];
    return BODY_TYPES[vehicleType] || [];
  };

  const getMakes = () => {
    if (!vehicleType) return [];
    return Object.keys(VEHICLE_MASTER[vehicleType] || {});
  };

  const getModels = () => {
    if (!vehicleType || !make) return [];
    return VEHICLE_MASTER[vehicleType]?.[make] || [];
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar backgroundColor={Colors.white} barStyle="dark-content" />

      <KeyboardAvoidingView
        style={styles.keyboardAvoidingView}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        <View style={styles.header}>
          <TouchableOpacity style={styles.modernBackButton} onPress={handleBack}>
            <MaterialIcons name="arrow-back-ios" size={28} color={Colors.orange1} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>
            {isEdit ? "Edit Vehicle" : "Add Vehicle"}
          </Text>
          <View style={styles.headerSpacer} />
        </View>

        <ScrollView
          contentContainerStyle={styles.scroll}
          showsVerticalScrollIndicator={false}
        >
          {/* PHOTO SECTION */}
          <View style={styles.photoSection}>
            <Text style={styles.sectionSubheading}>
              Vehicle Photos <Text style={styles.requiredStar}>*</Text>
              <Text style={styles.subText}> (Max 5, at least 1 required)</Text>
            </Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.photoScroll}>
              {photos.map((photo, index) => (
                <View key={index} style={styles.photoCardContainer}>
                  <Image source={{ uri: photo }} style={styles.vehicleImage} />
                  <TouchableOpacity
                    style={styles.deletePhotoBtn}
                    onPress={() => removePhoto(index)}
                  >
                    <MaterialIcons name="close" size={20} color="#fff" />
                  </TouchableOpacity>
                </View>
              ))}
              {photos.length < 5 && (
                <TouchableOpacity style={styles.addPhotoCard} onPress={showImageOptions}>
                  <Ionicons name="camera-outline" size={32} color={Colors.primary} />
                  <Text style={styles.addPhotoText}>Add Photo</Text>
                </TouchableOpacity>
              )}
            </ScrollView>
            {/* {photos.length === 0 && (
              <Text style={styles.warningText}>⚠️ At least one photo is required</Text>
            )} */}
          </View>

          {/* SELECTORS */}
          <Selector
            label="Vehicle Type"
            value={vehicleType}
            onPress={() => setActiveModal("vehicle")}
            required
          />
          <Selector
            label="Body Type"
            value={bodyType}
            onPress={() => getBodyTypes().length > 0 && setActiveModal("body")}
            required
            disabled={!vehicleType}
            disabledText={!vehicleType ? "Select Vehicle Type first" : ""}
          />
          <Selector
            label="Make"
            value={make}
            onPress={() => getMakes().length > 0 && setActiveModal("make")}
            required
            disabled={!vehicleType}
            disabledText={!vehicleType ? "Select Vehicle Type first" : ""}
          />
          <Selector
            label="Model"
            value={model}
            onPress={() => getModels().length > 0 && setActiveModal("model")}
            required
            disabled={!vehicleType || !make}
            disabledText={!vehicleType ? "Select Vehicle Type first" : !make ? "Select Make first" : ""}
          />

          <Selector
            label="Fuel Type"
            value={fuelType}
            onPress={() => setActiveModal("fuel")}
            required
          />

          {/* Year */}
          <View style={styles.inputBox}>
            <Text style={styles.label}>
              Year <Text style={styles.requiredStar}>*</Text>
            </Text>
            <TouchableOpacity
              style={styles.searchableSelector}
              onPress={() => setShowYearDropdown(true)}
            >
              <Text style={[styles.selectorValue, !year && styles.placeholderText]}>
                {year || "Select Year"}
              </Text>
              <MaterialIcons name="arrow-drop-down" size={24} color={Colors.primary} />
            </TouchableOpacity>
            {fuelType && (
              <Text style={styles.hintText}>
                {fuelType === "Diesel" ? "Last 10 years available for Diesel" : "Last 15 years available"}
              </Text>
            )}
          </View>

          {/* Registration Number */}
          <View style={styles.inputBox}>
            <Text style={styles.label}>
              Registration Number <Text style={styles.requiredStar}>*</Text>
            </Text>
            <TextInput
              style={styles.input}
              value={registration}
              onChangeText={handleRegistrationChange}
              placeholder="e.g., MH12AB1234"
              placeholderTextColor="#9CA3AF"
              autoCapitalize="characters"
              maxLength={13}
            />
            {registration.length > 0 && !validateRegistrationNumber(registration.replace(/\s/g, "")) && (
              <Text style={styles.errorText}>Invalid registration number format</Text>
            )}
          </View>

          {/* Color */}
          <View style={styles.inputBox}>
            <Text style={styles.label}>Color</Text>
            <TextInput
              style={styles.input}
              value={color}
              onChangeText={setColor}
              placeholder="e.g., Red, Blue, Black"
              placeholderTextColor="#9CA3AF"
            />
          </View>

          {/* Number of Seats */}
          <View style={styles.inputBox}>
            <Text style={styles.label}>Number of Seats</Text>
            <View style={styles.seatsContainer}>
              <TextInput
                style={styles.seatsInput}
                value={maxSeats}
                editable={false}
                placeholder="Auto-detected"
                placeholderTextColor="#9CA3AF"
              />
              {bodyType && maxSeats && (
                <Text style={styles.seatsHint}>Based on {bodyType}</Text>
              )}
            </View>
          </View>

          {/* Notes */}
          <View style={styles.inputBox}>
            <Text style={styles.label}>Notes</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              value={notes}
              onChangeText={text => setNotes(text.slice(0, 300))}
              placeholder="Any additional information (max 300 characters)..."
              placeholderTextColor="#9CA3AF"
              multiline
              maxLength={300}
            />
            <Text style={styles.charCount}>{notes.length}/300</Text>
          </View>

          {/* Save Button */}
          <TouchableOpacity style={styles.saveBtn} onPress={handleSave}>
            <Text style={styles.saveText}>{isEdit ? "Update Vehicle" : "Save Vehicle"}</Text>
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>

      {/* MODALS */}
      {activeModal === "vehicle" &&
        renderModal("Vehicle Type", VEHICLE_TYPES, vehicleType, setVehicleType)}
      {activeModal === "body" &&
        renderModal("Body Type", getBodyTypes(), bodyType, setBodyType, !vehicleType)}
      {activeModal === "make" &&
        renderModal("Make", getMakes(), make, setMake, !vehicleType)}
      {activeModal === "model" &&
        renderModal("Model", getModels(), model, setModel, !vehicleType || !make)}
      {activeModal === "fuel" &&
        renderModal("Fuel Type", FUEL_TYPES, fuelType, setFuelType)}
      {renderYearModal()}
    </SafeAreaView>
  );
}

const Selector = ({ label, value, onPress, required, disabled, disabledText }) => (
  <View style={styles.inputBox}>
    <Text style={styles.label}>
      {label} {required && <Text style={styles.requiredStar}>*</Text>}
    </Text>
    <TouchableOpacity
      style={[styles.selector, disabled && styles.disabledSelector]}
      onPress={onPress}
      disabled={disabled}
    >
      <Text style={[styles.selectorValue, !value && styles.placeholderText]}>
        {value || (disabled ? disabledText || "Select" : "Select")}
      </Text>
      <MaterialIcons name="arrow-drop-down" size={24} color={Colors.primary} />
    </TouchableOpacity>
  </View>
);

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.white },
  keyboardAvoidingView: { flex: 1 },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 16,
    backgroundColor: Colors.white,
  },
  modernBackButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: "center",
    alignItems: "center",
  },
  headerTitle: {
    ...Typography.h2,
    fontSize: 24,
    fontWeight: "700",
    color: Colors.primary,
    flex: 1,
    textAlign: "center",
  },
  headerSpacer: { width: 44 },
  scroll: { padding: 20, paddingBottom: 40 },

  photoSection: { marginBottom: 20 },
  sectionSubheading: {
    fontSize: 14,
    fontWeight: "600",
    color: Colors.primary,
    marginBottom: 12,
    letterSpacing: 0.5,
  },
  subText: {
    fontSize: 12,
    fontWeight: "normal",
    color: "#6B7280",
  },
  photoScroll: { flexDirection: "row" },
  photoCardContainer: {
    width: 100,
    height: 100,
    borderRadius: 12,
    marginRight: 12,
    position: "relative",
  },
  vehicleImage: { width: "100%", height: "100%", borderRadius: 12 },
  deletePhotoBtn: {
    position: "absolute",
    top: -8,
    right: -8,
    backgroundColor: "rgba(0,0,0,0.6)",
    borderRadius: 12,
    width: 24,
    height: 24,
    justifyContent: "center",
    alignItems: "center",
  },
  addPhotoCard: {
    width: 100,
    height: 100,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: "#E5E7EB",
    borderStyle: "dashed",
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#F9FAFB",
  },
  addPhotoText: { fontSize: 11, color: Colors.primary, marginTop: 4 },
  warningText: {
    fontSize: 12,
    color: "#EF4444",
    marginTop: 8,
    textAlign: "center",
  },

  inputBox: { marginBottom: 16 },
  label: {
    fontSize: 14,
    fontWeight: "600",
    color: Colors.primary,
    marginBottom: 6,
    letterSpacing: 0.3,
  },
  requiredStar: { color: "#EF4444" },
  selector: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderWidth: 1.5,
    borderColor: "#E5E7EB",
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    backgroundColor: "#fff",
  },
  disabledSelector: {
    backgroundColor: "#F3F4F6",
    borderColor: "#E5E7EB",
  },
  selectorValue: { fontSize: 15, color: "#1F2937" },
  placeholderText: { color: "#9CA3AF" },
  searchableSelector: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderWidth: 1.5,
    borderColor: "#E5E7EB",
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    backgroundColor: "#fff",
  },
  input: {
    borderWidth: 1.5,
    borderColor: "#E5E7EB",
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 15,
    color: "#1F2937",
    backgroundColor: "#fff",
  },
  textArea: { minHeight: 100, textAlignVertical: "top" },
  charCount: { fontSize: 11, color: "#9CA3AF", textAlign: "right", marginTop: 4 },
  hintText: { fontSize: 11, color: "#9CA3AF", marginTop: 4 },
  errorText: { fontSize: 11, color: "#EF4444", marginTop: 4 },
  seatsContainer: { flexDirection: "row", alignItems: "center" },
  seatsInput: {
    flex: 1,
    borderWidth: 1.5,
    borderColor: "#E5E7EB",
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 15,
    backgroundColor: "#F9FAFB",
    color: "#6B7280",
  },
  seatsHint: { fontSize: 11, color: "#9CA3AF", marginLeft: 8 },

  saveBtn: {
    backgroundColor: Colors.primary,
    paddingVertical: 16,
    borderRadius: 12,
    marginTop: 20,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
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
    padding: 20,
    maxHeight: "75%",
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  modalTitle: { fontSize: 18, fontWeight: "700", color: Colors.primary },
  searchInput: {
    borderWidth: 1.5,
    borderColor: "#E5E7EB",
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 10,
    marginBottom: 12,
    fontSize: 15,
  },
  modalItem: {
    paddingVertical: 14,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderBottomWidth: 0.5,
    borderBottomColor: "#F3F4F6",
  },
  modalItemSelected: { backgroundColor: "#EEF4FF", borderRadius: 8, paddingHorizontal: 8 },
  modalItemText: { fontSize: 16, color: "#374151" },
  modalItemTextSelected: { fontWeight: "700", color: Colors.primary },
  noResultsText: { textAlign: "center", paddingVertical: 20, color: "#9CA3AF" },
});