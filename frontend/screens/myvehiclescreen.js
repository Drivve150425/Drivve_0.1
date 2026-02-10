import React, {
  useEffect,
  useRef,
  useState,
  useCallback
} from "react";
import { useFocusEffect } from "@react-navigation/native";

import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  StatusBar,
  Image,
  Alert,
  Animated,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { MaterialIcons, Ionicons } from "@expo/vector-icons";
import DatabaseService from "../services/DatabaseService";

const BASE_URL = process.env.EXPO_PUBLIC_API_URL;

export default function MyVehicleScreen({ navigation, route }) {
  const phoneNumber =
  route?.params?.phoneNumber ||
  navigation?.getState()?.routes
    ?.find(r => r.params?.phoneNumber)
    ?.params?.phoneNumber ||
  null;


  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(true);

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;

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
      console.error("❌ Load vehicles error", e);
    } finally {
      setLoading(false);
    }
  };

  const confirmDelete = (vehicle) => {
    Alert.alert(
      "Delete Vehicle",
      `Delete ${vehicle.make} ${vehicle.model}?`,
      [
        { text: "Cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            await DatabaseService.deleteVehicle(vehicle.id);
            loadVehicles();
          },
        },
      ]
    );
  };

  const renderVehicleCard = (v) => (
    <View key={v.id} style={styles.heroCard}>
      {/* IMAGE */}
      <Image
        source={{
          uri: v.photo_url
            ? `${BASE_URL}/${v.photo_url}`
            : "https://via.placeholder.com/500x300",
        }}
        style={styles.heroImage}
      />

      {/* OVERLAY */}
      <View style={styles.overlay} />

      {/* TOP ACTIONS */}
      <View style={styles.topActions}>
      

        {/* RIGHT TYPE */}
        <View style={styles.typePill}>
          <Ionicons name="car-sport-outline" size={14} color="#fff" />
          <Text style={styles.typeText}>
            {v.vehicle_type} • {v.body_type}
          </Text>
        </View>
      </View>

      {/* BOTTOM DETAILS */}
    <View style={styles.bottomContent}>

  {/* HEADER ROW */}
  <View style={styles.headerRow}>
    <View>
      <Text style={styles.vehicleName}>
        {v.make} {v.model}
      </Text>

      {v.registration_number ? (
        <View style={styles.regBadge}>
          <Ionicons name="document-text-outline" size={14} color="#184080" />
          <Text style={styles.regText}>{v.registration_number}</Text>
        </View>
      ) : null}
    </View>

    {/* EDIT / DELETE (ADDRESS STYLE) */}
    <View style={styles.iconRow}>
      <TouchableOpacity
        onPress={() =>
          navigation.navigate("AddNewVehicleScreen", {
            phoneNumber,
            vehicle: v,
          })
        }
      >
        <MaterialIcons name="edit" size={22} color="#ED7117" />
      </TouchableOpacity>

      <TouchableOpacity onPress={() => confirmDelete(v)}>
        <MaterialIcons name="delete-outline" size={22} color="#ED7117" />
      </TouchableOpacity>
    </View>
  </View>

  {/* INFO CHIPS */}
  <View style={styles.chipRow}>
    <View style={styles.chip}>
      <Ionicons name="flash-outline" size={14} color="#184080" />
      <Text style={styles.chipText}>{v.fuel_type}</Text>
    </View>

    <View style={styles.chip}>
      <Ionicons name="people-outline" size={14} color="#184080" />
      <Text style={styles.chipText}>{v.max_seats} Seats</Text>
    </View>

    <View style={styles.chip}>
      <Ionicons name="calendar-outline" size={14} color="#184080" />
      <Text style={styles.chipText}>{v.year}</Text>
    </View>

    {v.color ? (
      <View style={styles.chip}>
        <Ionicons name="color-palette-outline" size={14} color="#184080" />
        <Text style={styles.chipText}>{v.color}</Text>
      </View>
    ) : null}
  </View>

  {v.notes ? (
    <Text style={styles.notes} numberOfLines={2}>
      {v.notes}
    </Text>
  ) : null}

</View>

    </View>
  );

  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <MaterialIcons name="directions-car" size={80} color="#D1D5DB" />
      <Text style={styles.emptyTitle}>No Vehicles Added</Text>
      <Text style={styles.emptyText}>
        Add your vehicle to start offering rides.
      </Text>

      <TouchableOpacity
        style={styles.addFirstBtn}
        onPress={() =>
          navigation.navigate("AddNewVehicleScreen", { phoneNumber })
        }
      >
        <Ionicons name="add" size={24} color="#fff" />
        <Text style={styles.addFirstText}>Add Vehicle</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />

      {/* HEADER */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <MaterialIcons name="arrow-back-ios" size={26} color="#ED7117" />
        </TouchableOpacity>

        <Text style={styles.headerTitle}>My Vehicles</Text>

        <TouchableOpacity
          onPress={() =>
            navigation.navigate("AddNewVehicleScreen", { phoneNumber })
          }
        >
          <MaterialIcons name="add" size={32} color="#ED7117" />
        </TouchableOpacity>
      </View>

      {/* CONTENT */}
      <Animated.ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
        style={{
          opacity: fadeAnim,
          transform: [{ translateY: slideAnim }],
        }}
      >
        {loading ? (
          <Text style={styles.loading}>Loading vehicles...</Text>
        ) : vehicles.length === 0 ? (
          renderEmptyState()
        ) : (
          vehicles.map(renderVehicleCard)
        )}
      </Animated.ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff" },

  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#F3F4F6",
  },

  headerTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#184080",
  },

  scroll: {
    padding: 16,
    paddingBottom: 40,
  },

  heroCard: {
    borderRadius: 20,
    overflow: "hidden",
    marginBottom: 20,
    backgroundColor: "#000",
    elevation: 6,
  },

  heroImage: {
    width: "100%",
    height: 220,
    position: "absolute",
  },

  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.35)",
  },

  topActions: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 14,
  },

  leftActions: {
    flexDirection: "row",
    gap: 10,
  },

  actionBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "rgba(237,113,23,0.95)",
    justifyContent: "center",
    alignItems: "center",
    elevation: 6,
  },

  deleteBtn: {
    backgroundColor: "rgba(239,68,68,0.95)",
  },

  typePill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "rgba(0,0,0,0.6)",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },

  typeText: {
    color: "#fff",
    fontSize: 13,
    fontWeight: "600",
  },

  bottomContent: {
    marginTop: 120,
    backgroundColor: "#fff",
    padding: 16,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
  },

  vehicleName: {
    fontSize: 20,
    fontWeight: "800",
    color: "#184080",
  },

  regNumber: {
    fontSize: 14,
    color: "#6B7280",
    marginTop: 2,
    fontWeight: "600",
  },

  chipRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
    marginTop: 12,
  },

  chip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "#EEF4FF",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 14,
  },

  chipText: {
    fontSize: 13,
    fontWeight: "600",
    color: "#184080",
  },

  notes: {
    marginTop: 10,
    fontSize: 14,
    color: "#555",
  },

  emptyState: {
    alignItems: "center",
    marginTop: 120,
    paddingHorizontal: 30,
  },

  emptyTitle: {
    fontSize: 22,
    fontWeight: "700",
    marginTop: 20,
    color: "#374151",
  },

  emptyText: {
    fontSize: 16,
    color: "#6B7280",
    textAlign: "center",
    marginTop: 8,
    marginBottom: 24,
  },

  addFirstBtn: {
    flexDirection: "row",
    gap: 10,
    backgroundColor: "#184080",
    paddingHorizontal: 26,
    paddingVertical: 14,
    borderRadius: 16,
  },

  addFirstText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "700",
  },

  loading: {
    textAlign: "center",
    marginTop: 40,
    color: "#6B7280",
    fontSize: 16,
  },
  headerRow: {
  flexDirection: "row",
  justifyContent: "space-between",
  alignItems: "flex-start",
  marginBottom: 10,
},

iconRow: {
  flexDirection: "row",
  gap: 14,
},

vehicleName: {
  fontSize: 20,
  fontWeight: "800",
  color: "#184080",
},

regBadge: {
  flexDirection: "row",
  alignItems: "center",
  gap: 6,
  backgroundColor: "#EEF4FF",
  paddingHorizontal: 10,
  paddingVertical: 4,
  borderRadius: 10,
  marginTop: 4,
  alignSelf: "flex-start",
},

regText: {
  fontSize: 13,
  fontWeight: "600",
  color: "#184080",
},

});
