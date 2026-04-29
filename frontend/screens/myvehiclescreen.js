import React, {
  useEffect,
  useRef,
  useState,
  useCallback
} from "react";
import { useFocusEffect } from "@react-navigation/native";
import { Colors,Typography } from '../constants/Colors';
import LottieView from "lottie-react-native";

import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  StatusBar,
  Image,
  Animated,
  Platform,
  KeyboardAvoidingView,
  ActivityIndicator
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons, MaterialIcons } from "@expo/vector-icons";
import DatabaseService from "../services/myvehicle_ds";
import { useAuth } from "../context/AuthContext";
import CustomAlert from '../components/CustomAlert';

import { API_BASE_URL } from "../config/config_ip";

export default function MyVehicleScreen({ navigation, route }) {

  const { user } = useAuth();
  const phoneNumber = user?.phone_number;
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(false);
  const [deletingId, setDeletingId] = useState(null);
  
  // Custom Alert states
  const [alertVisible, setAlertVisible] = useState(false);
  const [alertConfig, setAlertConfig] = useState({
    title: "",
    message: "",
    icon: "check-circle",
    iconColor: "#10B981",
    buttons: []
  });

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;

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
        { text: 'Delete', onPress: () => {
          setAlertVisible(false);
          onConfirm();
        }, style: 'destructive' }
      ]
    });
    setAlertVisible(true);
  };

  const handleBack = () => navigation.goBack();

  useEffect(() => {
    loadVehicles();

    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 400,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadVehicles();
    }, [phoneNumber])
  );

  const loadVehicles = async () => {
    try {
      setLoading(true);
      if (!phoneNumber) return;

      const data = await DatabaseService.getVehicles(phoneNumber);
      setVehicles(Array.isArray(data) ? data : []);
    } catch (e) {
      console.error("Load vehicles error", e);
      showCustomAlert("Error", "Failed to load vehicles", "error");
    } finally {
      setLoading(false);
    }
  };

  const confirmDelete = (vehicle) => {
    showConfirmationAlert(
      "Delete Vehicle",
      `Delete ${vehicle.make} ${vehicle.model}?`,
      async () => {
        setDeleting(true);
        setDeletingId(vehicle.id);
        try {
          await DatabaseService.deleteVehicle(vehicle.id);
          showCustomAlert("Success", "Vehicle deleted successfully", "success");
          await loadVehicles();
        } catch (error) {
          console.error("Delete error:", error);
          showCustomAlert("Error", "Failed to delete vehicle", "error");
        } finally {
          setDeleting(false);
          setDeletingId(null);
        }
      }
    );
  };

  // ✅ CARD UI
  const renderVehicleCard = (v) => (
    <View key={v.id} style={styles.card}>

      {/* IMAGE */}
      <Image
        source={{
          uri: v.photo_url || "https://via.placeholder.com/400x200?text=No+Image"
        }}
        style={styles.cardImage}
      />

      {/* DELETE */}
      <TouchableOpacity
        style={styles.deleteIcon}
        onPress={() => confirmDelete(v)}
        disabled={deleting}
      >
        {deleting && deletingId === v.id ? (
          <ActivityIndicator size="small" color={Colors.primary} />
        ) : (
          <Ionicons name="trash-outline" size={22} color={Colors.primary} />
        )}
      </TouchableOpacity>

      {/* CONTENT */}
      <View style={styles.cardContent}>

        {/* TITLE + EDIT */}
        <View style={styles.rowBetween}>
          <Text style={styles.title}>
            {v.make} {v.model}
          </Text>

          <TouchableOpacity
            onPress={() =>
              navigation.navigate("AddNewVehicleScreen", {
                phoneNumber,
                vehicle: v,
              })
            }
            disabled={deleting}
          >
            <MaterialIcons name="edit" size={22} color={Colors.primary} />
          </TouchableOpacity>
        </View>

        {/* REG NUMBER */}
        <Text style={styles.regNo}>
          {v.registration_number || "No Reg"}
        </Text>

        {/* CHIPS */}
        <View style={styles.chipRow}>
          {v.color && (
            <View style={styles.chip}>
              <Text style={styles.chipText}>{v.color}</Text>
            </View>
          )}

          <View style={styles.chip}>
            <Text style={styles.chipText}>{v.max_seats} Seats</Text>
          </View>

          <View style={styles.chip}>
            <Text style={styles.chipText}>{v.fuel_type}</Text>
          </View>
        </View>

      </View>
    </View>
  );

  // Show loader while fetching data
  if (loading && vehicles.length === 0) {
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
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >

        {/* HEADER */}
        <View style={styles.header}>
          <TouchableOpacity style={styles.modernBackButton} onPress={handleBack}>
            <MaterialIcons name="arrow-back-ios" size={24} color={Colors.secondary} />
          </TouchableOpacity>

          <Text style={styles.headerTitle}>Vehicle details</Text>

          <View style={styles.headerSpacer} />
        </View>

        {/* LIST */}
        <Animated.ScrollView
          contentContainerStyle={[
            styles.scroll,
            vehicles.length === 0 && !loading && { flex: 1, justifyContent: "center" }
          ]}
          showsVerticalScrollIndicator={false}
          style={{
            opacity: fadeAnim,
            transform: [{ translateY: slideAnim }],
          }}
        >
          {vehicles.length === 0 ? (
            <View style={styles.center}>
              <MaterialIcons name="directions-car" size={60} color="#D1D5DB" />
              <Text style={styles.emptyTitle}>No Vehicles Found</Text>
              <Text style={styles.emptySub}>
                Add your vehicle to get started
              </Text>
            </View>
          ) : (
            vehicles.map(renderVehicleCard)
          )}
        </Animated.ScrollView>

        {/* ✅ FLOATING + BUTTON */}
        {!loading && (
          <TouchableOpacity
            style={styles.fab}
            activeOpacity={0.8}
            onPress={() =>
              navigation.navigate("AddNewVehicleScreen", { phoneNumber })
            }
          >
            <MaterialIcons name="add" size={30} color={Colors.white} />
          </TouchableOpacity>
        )}

      </KeyboardAvoidingView>

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

const styles = StyleSheet.create({

  container: {
    flex: 1,
    backgroundColor: "#fff",
  },

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 0.5,
    borderBottomColor: '#F3F4F6',
  },
  
  modernBackButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
  },
  
  headerTitle: {
    ...Typography.h2,
    fontSize: 28,
    fontWeight: '700',
    color: Colors.primary,
    flex: 1,
    textAlign: 'center',
  },
  
  headerSpacer: {
    width: 44,
  },
  
  scroll: {
    padding: 16,
    paddingBottom: 80,
  },

  // LOADER STYLES
  loaderContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: Colors.white,
  },
  
  loaderText: {
    marginTop: 20,
    fontSize: 16,
    color: Colors.primary,
    fontWeight: "500",
  },

  // CARD
  card: {
    backgroundColor: "#fff",
    borderRadius: 18,
    marginBottom: 18,
    overflow: "hidden",

    elevation: 4,
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
  },

  cardImage: {
    width: "100%",
    height: 150,
    backgroundColor: "#F3F4F6",
  },

  deleteIcon: {
    position: "absolute",
    top: 10,
    right: 10,
    backgroundColor: Colors.white,
    borderRadius: 20,
    padding: 6,
    elevation: 3,
  },

  cardContent: {
    padding: 14,
  },

  rowBetween: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },

  title: {
    fontSize: 20,
    fontWeight: "700",
    color: Colors.primary,
  },

  regNo: {
    fontSize: 18,
    color: Colors.primary,
    marginTop: 4,
  },

  chipRow: {
    flexDirection: "row",
    marginTop: 8,
    gap: 8,
    flexWrap: "wrap",
  },

  chip: {
    backgroundColor: Colors.white,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 14,

    // ✅ BORDER
    borderWidth: 1,
    borderColor: "#E5E7EB",

    // ✅ SHADOW (iOS)
    shadowColor: "#000",
    shadowOpacity: 0.06,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },

    // ✅ SHADOW (Android)
    elevation: 2,
  },
  
  chipText: {
    fontSize: 14,
    fontWeight: "600",
    color: Colors.primary,
  },

  loading: {
    textAlign: "center",
    marginTop: 40,
    color: "#6B7280",
  },

  // ✅ FAB BUTTON
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
  
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 0,
    paddingVertical: 60,
  },

  emptyTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#374151",
    marginTop: 12,
  },

  emptySub: {
    fontSize: 14,
    color: "#6B7280",
    marginTop: 6,
  },
});