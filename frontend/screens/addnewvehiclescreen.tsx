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
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  ActionSheetIOS
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons, MaterialIcons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import * as ImageManipulator from "expo-image-manipulator";
import { Colors, Typography } from "../constants/Colors";
import DatabaseService from "../services/addvehicle_ds";
import myvehcileDatabaseService from "../services/myvehicle_ds";

import { useAuth } from "../context/AuthContext";
import CustomAlert from '../components/CustomAlert';
import LottieView from "lottie-react-native";

/* ================= DATA ================= */

type ModalType =
  | "vehicle"
  | "body"
  | "fuel"
  | "make"
  | "model"
  | "seats"
  | null;
  import { API_BASE_URL } from "../config/config_ip";

export default function AddNewVehicleScreen({ navigation, route }) {
  const { user } = useAuth();
  const phoneNumber = user?.phone_number;
  const editingVehicle = route?.params?.vehicle || null;
  const isEdit = !!editingVehicle;
  const [vehicleTypes, setVehicleTypes] = useState<string[]>([]);
  const [bodyTypes, setBodyTypes] = useState<string[]>([]);
  const [fuelTypes, setFuelTypes] = useState<string[]>([]);
  const [makeOptions, setMakeOptions] = useState<string[]>([]);
  const [modelOptions, setModelOptions] = useState<string[]>([]);
  const [dbListData, setDbListData] = useState<any[]>([]);

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
  const [seatOptions, setSeatOptions] = useState<string[]>([]);
  const [notes, setNotes] = useState("");
  const [photos, setPhotos] = useState<string[]>([]);
  const [activeModal, setActiveModal] = useState<ModalType>(null);
  const [search, setSearch] = useState("");
  const [yearSearch, setYearSearch] = useState("");
  const [showYearDropdown, setShowYearDropdown] = useState(false);
  const [saving, setSaving] = useState(false);
  const [showPhotoOptions, setShowPhotoOptions] = useState(false);
  
  // Flag to track if initial load is done for edit mode
  const [isInitialLoad, setIsInitialLoad] = useState(true);
  
  // Custom Alert states
  const [alertVisible, setAlertVisible] = useState(false);
  const [alertConfig, setAlertConfig] = useState({
    title: "",
    message: "",
    icon: "check-circle",
    iconColor: "#10B981",
    buttons: []
  });
  useEffect(() => {
  loadDropdowns();
}, []);

const loadDropdowns = async () => {
  try {
    const result = await myvehcileDatabaseService.getDbList({
      limit: 5000,
    });

    const data = result?.data || [];

    setDbListData(data);

    // Vehicle Types
    const vehicleTypeSet = new Set<string>();

    data.forEach((item: any) => {
      if (item.vehicle_type) {
        vehicleTypeSet.add(item.vehicle_type);
      }
    });

    setVehicleTypes(Array.from(vehicleTypeSet));

    // // Fuel Types
    // const fuelSet = new Set<string>();

    // data.forEach((item: any) => {
    //   if (item.fuel_type) {
    //     fuelSet.add(item.fuel_type);
    //   }
    // });

    // setFuelTypes(Array.from(fuelSet));

  } catch (e) {
    console.log("Dropdown Load Error", e);
  }
};
const getFuelTypes = () => {
  if (!vehicleType || !make || !model) return [];

  const filtered = dbListData.filter(
    (item: any) =>
      item.vehicle_type === vehicleType &&
      item.make_company_name === make &&
      item.model_name === model
  );

  const fuelSet = new Set<string>();

  filtered.forEach((item: any) => {
    if (!item.fuel_type) return;

    // Split fuel types
    const fuels = item.fuel_type
      .split(/[\/,+]/) // split by / , +
      .map((f: string) =>
        f
          .replace(/\(.*?\)/g, "") // remove brackets text
          .trim()
      )
      .filter(Boolean);

    fuels.forEach((fuel: string) => {
      fuelSet.add(fuel);
    });
  });

  return Array.from(fuelSet);
};
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

  const showConfirmationAlert = (title, message, onConfirm) => {
    setAlertConfig({
      title,
      message,
      icon: "warning",
      iconColor: "#F59E0B",
      buttons: [
        { text: 'Cancel', onPress: () => setAlertVisible(false), style: 'cancel' },
        { text: 'Remove', onPress: () => {
          setAlertVisible(false);
          onConfirm();
        }, style: 'destructive' }
      ]
    });
    setAlertVisible(true);
  };

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
  if (!vehicleType || !make || !model) {
    setMaxSeats("");
    setSeatOptions([]);
    return;
  }

  const selectedVehicle = dbListData.find(
    (item: any) =>
      item.vehicle_type === vehicleType &&
      item.make_company_name === make &&
      item.model_name === model
  );

  if (selectedVehicle?.seating_capacity) {

    const rawSeats = String(selectedVehicle.seating_capacity);

    // Example: "4,5"
    const seats = rawSeats
      .split(",")
      .map((s: string) => s.trim())
      .filter(Boolean);

    setSeatOptions(seats);

    // Single value auto select
    if (seats.length === 1) {
      setMaxSeats(seats[0]);
    } else {
      // Multiple values => show dropdown
      setMaxSeats("");
    }

  } else {
    setSeatOptions([]);
    setMaxSeats("");
  }
}, [vehicleType, make, model, dbListData]);
  // Reset dependent fields when vehicle type changes (only for new entries)
useEffect(() => {
  if (!isInitialLoad) {
    setBodyType("");
    setMake("");
    setModel("");
    setFuelType("");
    setMaxSeats("");
    setSeatOptions([]);
  }
}, [vehicleType]);
  // Reset model when make changes (only for new entries)
useEffect(() => {
  if (!isInitialLoad) {
    setModel("");
    setFuelType("");
    setMaxSeats("");
    setSeatOptions([]);
  }
}, [make]);
useEffect(() => {
  if (!isInitialLoad) {
    setFuelType("");
    setMaxSeats("");
    setSeatOptions([]);
  }
}, [bodyType]);
useEffect(() => {
  if (!isInitialLoad) {
    setFuelType("");
  }
}, [model]);
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
    
    setTimeout(() => {
      setIsInitialLoad(false);
    }, 100);
  }, [editingVehicle]);

  /* ================= IMAGE HANDLING ================= */
  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") {
      showCustomAlert("Permission Denied", "Need camera roll permissions to upload photos.", "warning");
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
    setShowPhotoOptions(false);
  };

  const takePhoto = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== "granted") {
      showCustomAlert("Permission Denied", "Need camera permissions to take photos.", "warning");
      return;
    }

    if (photos.length >= 5) {
      showCustomAlert("Limit Reached", "You can upload maximum 5 photos.", "warning");
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
    setShowPhotoOptions(false);
  };

  const removePhoto = (index: number) => {
    showConfirmationAlert(
      "Remove Photo",
      "Are you sure you want to remove this photo?",
      () => {
        const newPhotos = [...photos];
        newPhotos.splice(index, 1);
        setPhotos(newPhotos);
      }
    );
  };

  const showImageOptions = () => {
    if (Platform.OS === 'ios') {
      ActionSheetIOS.showActionSheetWithOptions(
        {
          options: ['Cancel', 'Take Photo', 'Choose from Gallery'],
          cancelButtonIndex: 0,
        },
        (buttonIndex) => {
          if (buttonIndex === 1) {
            takePhoto();
          } else if (buttonIndex === 2) {
            pickImage();
          }
        }
      );
    } else {
      setShowPhotoOptions(true);
    }
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
      showCustomAlert("Session Error", "User session not found. Please login again.", "error");
      return;
    }

    if (photos.length === 0) {
      showCustomAlert("Photo Required", "Please upload at least one vehicle photo", "warning");
      return;
    }

    if (!vehicleType) {
      showCustomAlert("Error", "Please select Vehicle Type", "error");
      return;
    }
    if (!bodyType) {
      showCustomAlert("Error", "Please select Body Type", "error");
      return;
    }
    if (!make) {
      showCustomAlert("Error", "Please select Make", "error");
      return;
    }
    if (!model) {
      showCustomAlert("Error", "Please select Model", "error");
      return;
    }
    if (!maxSeats) {
  showCustomAlert(
    "Error",
    "Please select Number of Seats",
    "error"
  );
  return;
}
    if (!fuelType) {
      showCustomAlert("Error", "Please select Fuel Type", "error");
      return;
    }
    if (!year) {
      showCustomAlert("Error", "Year is required", "error");
      return;
    }
    if (!registration.trim()) {
      showCustomAlert("Error", "Registration Number is required", "error");
      return;
    }
    if (!validateRegistrationNumber(registration.replace(/\s/g, ""))) {
      showCustomAlert("Error", "Please enter a valid Registration Number (e.g., MH12AB1234)", "error");
      return;
    }

    setSaving(true);
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

    const newPhotos = photos.filter(photo => !photo.startsWith("http"));
    newPhotos.forEach((photo, index) => {
      formData.append("photos", {
        uri: photo,
        name: `vehicle_${index + 1}.jpg`,
        type: "image/jpeg",
      } as any);
    });

    const existingPhotoUrls = photos.filter(photo => photo.startsWith("http"));
    if (existingPhotoUrls.length > 0) {
      formData.append("existing_photo_urls", JSON.stringify(existingPhotoUrls));
    }

    try {
      if (isEdit) {
        await DatabaseService.updateVehicle(editingVehicle.id, formData);
        showCustomAlert("Success", "Vehicle updated successfully", "success");
      } else {
        await DatabaseService.addVehicle(formData);
        showCustomAlert("Success", "Vehicle added successfully", "success");
      }
      setTimeout(() => {
        navigation.goBack();
      }, 1500);
    } catch (e: any) {
      showCustomAlert("Error", e?.message || "Failed to save vehicle", "error");
    } finally {
      setSaving(false);
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

  const renderPhotoOptionsModal = () => (
    <Modal
      transparent
      animationType="slide"
      visible={showPhotoOptions}
      onRequestClose={() => setShowPhotoOptions(false)}
    >
      <TouchableOpacity
        style={styles.modalOverlay}
        activeOpacity={1}
        onPress={() => setShowPhotoOptions(false)}
      >
        <View style={styles.bottomSheet}>
          <View style={styles.bottomSheetHandle} />
          <Text style={styles.bottomSheetTitle}>Add Photo</Text>
          
          <TouchableOpacity style={styles.bottomSheetOption} onPress={takePhoto}>
            <View style={styles.bottomSheetOptionIcon}>
              <Ionicons name="camera-outline" size={24} color={Colors.primary} />
            </View>
            <Text style={styles.bottomSheetOptionText}>Take Photo</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.bottomSheetOption} onPress={pickImage}>
            <View style={styles.bottomSheetOptionIcon}>
              <Ionicons name="images-outline" size={24} color={Colors.primary} />
            </View>
            <Text style={styles.bottomSheetOptionText}>Choose from Gallery</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[styles.bottomSheetOption, styles.bottomSheetCancelOption]} 
            onPress={() => setShowPhotoOptions(false)}
          >
            <Text style={styles.bottomSheetCancelText}>Cancel</Text>
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
    </Modal>
  );

const getBodyTypes = () => {
  if (!vehicleType) return [];

  const filtered = dbListData.filter(
    (item: any) => item.vehicle_type === vehicleType
  );

  return [...new Set(filtered.map((i: any) => i.body_type).filter(Boolean))];
};
const getMakes = () => {
  if (!vehicleType || !bodyType) return [];

  const filtered = dbListData.filter(
    (item: any) =>
      item.vehicle_type === vehicleType &&
      item.body_type === bodyType
  );

  return [
    ...new Set(
      filtered.map((i: any) => i.make_company_name).filter(Boolean)
    ),
  ];
};
const getModels = () => {
  if (!vehicleType || !bodyType || !make) return [];

  const filtered = dbListData.filter(
    (item: any) =>
      item.vehicle_type === vehicleType &&
      item.body_type === bodyType &&
      item.make_company_name === make
  );

  return [
    ...new Set(
      filtered.map((i: any) => i.model_name).filter(Boolean)
    ),
  ];
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
  onPress={() =>
    getFuelTypes().length > 0 &&
    setActiveModal("fuel")
  }
  required
  disabled={!vehicleType || !make || !model}
  disabledText={
    !vehicleType
      ? "Select Vehicle Type first"
      : !make
      ? "Select Make first"
      : !model
      ? "Select Model first"
      : ""
  }
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
<Text style={styles.label}>
  Number of Seats <Text style={styles.requiredStar}>*</Text>
</Text>
  <TouchableOpacity
    style={styles.selector}
    onPress={() => {
      if (seatOptions.length > 1) {
        setActiveModal("seats");
      }
    }}
    disabled={seatOptions.length <= 1}
  >
    <Text
      style={[
        styles.selectorValue,
        !maxSeats && styles.placeholderText,
      ]}
    >
      {maxSeats || "Select Seats"}
    </Text>

    {seatOptions.length > 1 && (
      <MaterialIcons
        name="arrow-drop-down"
        size={24}
        color={Colors.primary}
      />
    )}
  </TouchableOpacity>

  {bodyType && (
    <Text style={styles.seatsHint}>
      Based on {bodyType}
    </Text>
  )}
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
          <TouchableOpacity style={[styles.saveBtn, saving && styles.disabledButton]} onPress={handleSave} disabled={saving}>
            {saving ? (
              <ActivityIndicator color={Colors.white} />
            ) : (
              <Text style={styles.saveText}>{isEdit ? "Update Vehicle" : "Save Vehicle"}</Text>
            )}
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>

      {/* MODALS */}
      {activeModal === "vehicle" &&
        renderModal("Vehicle Type", vehicleTypes, vehicleType, setVehicleType)}
      {activeModal === "body" &&
        renderModal("Body Type", getBodyTypes(), bodyType, setBodyType, !vehicleType)}
      {activeModal === "make" &&
        renderModal("Make", getMakes(), make, setMake, !vehicleType)}
      {activeModal === "model" &&
        renderModal("Model", getModels(), model, setModel, !vehicleType || !make)}
        {activeModal === "seats" &&
  renderModal(
    "Select Seats",
    seatOptions,
    maxSeats,
    setMaxSeats
  )}
      {activeModal === "fuel" &&
  renderModal(
    "Fuel Type",
    getFuelTypes(),
    fuelType,
    setFuelType
  )}
      {renderYearModal()}
      {renderPhotoOptionsModal()}

      {/* Custom Alert */}
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
    top: 4,
    right: 4,
    backgroundColor: "rgba(0,0,0,0.6)",
    borderRadius: 12,
    width: 24,
    height: 24,
    justifyContent: "center",
    alignItems: "center",
    zIndex: 10,
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
  seatsHint: { fontSize: 14, color: "#9CA3AF", marginLeft: 8 },

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
  disabledButton: { opacity: 0.6 },

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

  // Bottom Sheet Styles
  bottomSheet: {
    backgroundColor: Colors.white,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: 20,
    paddingBottom: 30,
  },
  bottomSheetHandle: {
    width: 40,
    height: 4,
    backgroundColor: "#E5E7EB",
    borderRadius: 2,
    alignSelf: "center",
    marginTop: 12,
    marginBottom: 20,
  },
  bottomSheetTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: Colors.primary,
    textAlign: "center",
    marginBottom: 20,
  },
  bottomSheetOption: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#F3F4F6",
  },
  bottomSheetOptionIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#F3F4F6",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 16,
  },
  bottomSheetOptionText: {
    fontSize: 16,
    fontWeight: "500",
    color: Colors.dark,
  },
  bottomSheetCancelOption: {
    justifyContent: "center",
    borderBottomWidth: 0,
    marginTop: 8,
  },
  bottomSheetCancelText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#EF4444",
    textAlign: "center",
  },
});