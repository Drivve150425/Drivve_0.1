import React, {
  useEffect,
  useRef,
  useState,
  useCallback
} from "react";
import { useFocusEffect } from "@react-navigation/native";
import { Colors, Typography } from '../constants/Colors';
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
  const [vehicleRideStatus, setVehicleRideStatus] = useState({});
  const [checkingRides, setCheckingRides] = useState(false);
  
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

  // Function to fetch all rides for a vehicle using existing my-rides endpoint
  const fetchVehicleRides = async (vehicleId) => {
    try {
      console.log(`🔍 Fetching rides for vehicle: ${vehicleId}`);
      
      // Use the existing my-rides endpoint
      const response = await fetch(`${API_BASE_URL}/my-rides/${phoneNumber}`);
      
      if (response.ok) {
        const data = await response.json();
        console.log(`📡 Got rides data for driver`);
        
        // Get all posted rides (rides where user is driver)
        const allPostedRides = data.posted_rides || [];
        
        // Filter rides for this specific vehicle
        const vehicleRides = allPostedRides.filter(ride => ride.vehicle_id === vehicleId);
        
        console.log(`🎯 Vehicle ${vehicleId} has ${vehicleRides.length} posted rides`);
        console.log(`📋 Ride statuses:`, vehicleRides.map(r => ({id: r.id, status: r.status})));
        
        // Convert to the format expected by your component
        return vehicleRides.map(ride => ({
          id: ride.id,
          status: ride.status,
          vehicle_id: ride.vehicle_id,
          is_deleted: false,
          origin: ride.origin,
          destination: ride.destination,
          departure_time: ride.departure_time
        }));
      }
      return [];
    } catch (error) {
      console.error(`Error fetching rides for vehicle ${vehicleId}:`, error);
      return [];
    }
  };

  // Check if a ride has ongoing status
  const isRideOngoing = (rideStatus) => {
    // Statuses that indicate an ongoing ride
    const ongoingStatuses = [
     
      'ongoing',
    ];
    
    return ongoingStatuses.includes(rideStatus?.toLowerCase());
  };

  // Check all vehicles for ongoing rides
  const checkVehiclesForOngoingRides = async (vehiclesList) => {
    if (!vehiclesList || vehiclesList.length === 0) return;
    
    setCheckingRides(true);
    const statusMap = {};
    
    for (const vehicle of vehiclesList) {
      try {
        const rides = await fetchVehicleRides(vehicle.id);
        
        // Check if any ride is ongoing
        const hasOngoingRide = rides.some(ride => 
          !ride.is_deleted && isRideOngoing(ride.status)
        );
        
        // Get the ongoing ride details if exists
        const ongoingRide = rides.find(ride => 
          !ride.is_deleted && isRideOngoing(ride.status)
        );
        
        if (hasOngoingRide) {
          console.log(`🔒 Vehicle ${vehicle.id} (${vehicle.model}) has ONGOING ride!`);
        }
        
        statusMap[vehicle.id] = {
          has_ongoing_ride: hasOngoingRide,
          ride_details: ongoingRide ? {
            ride_id: ongoingRide.id,
            status: ongoingRide.status,
            departure_time: ongoingRide.departure_time,
            origin: ongoingRide.origin,
            destination: ongoingRide.destination
          } : null
        };
      } catch (error) {
        console.error(`Failed to check rides for vehicle ${vehicle.id}:`, error);
        statusMap[vehicle.id] = { has_ongoing_ride: false, ride_details: null };
      }
    }
    
    console.log('📊 Final status map:', statusMap);
    setVehicleRideStatus(statusMap);
    setCheckingRides(false);
  };

  const loadVehicles = async () => {
    try {
      setLoading(true);
      if (!phoneNumber) return;

      const data = await DatabaseService.getVehicles(phoneNumber);
      const vehiclesList = Array.isArray(data) ? data : [];
      setVehicles(vehiclesList);
      
      // Check for ongoing rides
      if (vehiclesList.length > 0) {
        await checkVehiclesForOngoingRides(vehiclesList);
      }
      
    } catch (e) {
      console.error("Load vehicles error", e);
      showCustomAlert("Error", "Failed to load vehicles", "error");
    } finally {
      setLoading(false);
    }
  };
  
  // Check if vehicle can be edited/deleted
  const isVehicleLocked = (vehicleId) => {
    return vehicleRideStatus[vehicleId]?.has_ongoing_ride === true;
  };
  
  // Get locked vehicle message
  const getLockedMessage = (vehicle) => {
    const rideDetails = vehicleRideStatus[vehicle.id]?.ride_details;
    if (rideDetails) {
      return `This vehicle is currently being used for an ongoing ride (${rideDetails.status}) from ${rideDetails.origin} to ${rideDetails.destination}. You cannot edit or delete it until the ride is completed.`;
    }
    return "This vehicle is currently associated with an ongoing ride and cannot be edited or deleted.";
  };

  const confirmDelete = (vehicle) => {
    // Check if vehicle has ongoing ride
    if (isVehicleLocked(vehicle.id)) {
      showCustomAlert(
        "Cannot Delete Vehicle",
        getLockedMessage(vehicle),
        "warning"
      );
      return;
    }
    
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
  
  const handleEdit = (vehicle) => {
    // Check if vehicle has ongoing ride
    if (isVehicleLocked(vehicle.id)) {
      showCustomAlert(
        "Cannot Edit Vehicle",
        getLockedMessage(vehicle),
        "warning"
      );
      return;
    }
    
    navigation.navigate("AddNewVehicleScreen", {
      phoneNumber,
      vehicle: vehicle,
    });
  };

  // ✅ CARD UI
  const renderVehicleCard = (v) => {
    const isLocked = isVehicleLocked(v.id);
    
    return (
      <View key={v.id} style={[styles.card, isLocked && styles.cardLocked]}>
        
        {/* IMAGE with overlay if locked */}
        <View style={styles.imageContainer}>
          <Image
            source={{
              uri: v.photo_url || "https://via.placeholder.com/400x200?text=No+Image"
            }}
            style={styles.cardImage}
          />
          {isLocked && (
            <View style={styles.lockedOverlay}>
              <MaterialIcons name="lock" size={30} color="#fff" />
              <Text style={styles.lockedOverlayText}>Ride Ongoing</Text>
            </View>
          )}
        </View>

        {/* DELETE BUTTON - Disabled when locked */}
        <TouchableOpacity
          style={[styles.deleteIcon, isLocked && styles.deleteIconDisabled]}
          onPress={() => confirmDelete(v)}
          disabled={deleting || isLocked}
        >
          {deleting && deletingId === v.id ? (
            <ActivityIndicator size="small" color={Colors.primary} />
          ) : (
            <Ionicons 
              name="trash-outline" 
              size={22} 
              color={isLocked ? "#9CA3AF" : Colors.primary} 
            />
          )}
        </TouchableOpacity>

        {/* CONTENT */}
        <View style={styles.cardContent}>

          {/* TITLE + EDIT */}
          <View style={styles.rowBetween}>
            <View style={styles.titleContainer}>
              <Text style={[styles.title, isLocked && styles.titleLocked]}>
                {v.model}
              </Text>
              {isLocked && (
                <MaterialIcons name="lock" size={16} color="#F59E0B" />
              )}
            </View>

            <TouchableOpacity
              onPress={() => handleEdit(v)}
              disabled={deleting || isLocked}
            >
              <MaterialIcons 
                name="edit" 
                size={22} 
                color={isLocked ? "#9CA3AF" : Colors.primary} 
              />
            </TouchableOpacity>
          </View>

          {/* REG NUMBER */}
          <Text style={[styles.regNo, isLocked && styles.textLocked]}>
            {v.registration_number || "No Reg"}
          </Text>

          {/* CHIPS */}
          <View style={styles.chipRow}>
            {v.color && (
              <View style={[styles.chip, isLocked && styles.chipLocked]}>
                <Text style={[styles.chipText, isLocked && styles.textLocked]}>{v.color}</Text>
              </View>
            )}

            <View style={[styles.chip, isLocked && styles.chipLocked]}>
              <Text style={[styles.chipText, isLocked && styles.textLocked]}>{v.max_seats} Seats</Text>
            </View>

            <View style={[styles.chip, isLocked && styles.chipLocked]}>
              <Text style={[styles.chipText, isLocked && styles.textLocked]}>{v.fuel_type}</Text>
            </View>
          </View>
          
          {/* Show ride status warning if locked */}
          {isLocked && vehicleRideStatus[v.id]?.ride_details && (
            <View style={styles.warningContainer}>
              <MaterialIcons name="info-outline" size={16} color="#F59E0B" />
              <Text style={styles.warningText}>
                Ongoing ride: {vehicleRideStatus[v.id].ride_details.status}
              </Text>
            </View>
          )}

        </View>
      </View>
    );
  };

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
          {checkingRides && vehicles.length > 0 && (
            <View style={styles.checkingContainer}>
              <ActivityIndicator size="small" color={Colors.primary} />
              <Text style={styles.checkingText}>Checking ride status...</Text>
            </View>
          )}
          
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

// ... styles remain the same as before ...
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

  loaderContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: Colors.white,
  },
  
  checkingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 10,
    marginBottom: 10,
    backgroundColor: '#F3F4F6',
    borderRadius: 10,
  },
  
  checkingText: {
    marginLeft: 10,
    fontSize: 14,
    color: Colors.primary,
  },

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
  
  cardLocked: {
    opacity: 0.85,
    backgroundColor: "#F9FAFB",
  },
  
  imageContainer: {
    position: 'relative',
  },

  cardImage: {
    width: "100%",
    height: 150,
    backgroundColor: "#F3F4F6",
  },
  
  lockedOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  
  lockedOverlayText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
    marginTop: 8,
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
  
  deleteIconDisabled: {
    backgroundColor: "#F3F4F6",
    elevation: 0,
  },

  cardContent: {
    padding: 14,
  },

  rowBetween: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  
  titleContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },

  title: {
    fontSize: 20,
    fontWeight: "700",
    color: Colors.primary,
  },
  
  titleLocked: {
    color: "#9CA3AF",
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
    borderWidth: 1,
    borderColor: "#E5E7EB",
    shadowColor: "#000",
    shadowOpacity: 0.06,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  
  chipLocked: {
    backgroundColor: "#F3F4F6",
    borderColor: "#E5E7EB",
  },
  
  chipText: {
    fontSize: 14,
    fontWeight: "600",
    color: Colors.primary,
  },
  
  textLocked: {
    color: "#9CA3AF",
  },
  
  warningContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 12,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
    gap: 6,
  },
  
  warningText: {
    fontSize: 12,
    color: '#F59E0B',
    flex: 1,
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