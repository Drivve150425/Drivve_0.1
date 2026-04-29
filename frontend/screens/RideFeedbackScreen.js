import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  StatusBar,
  TextInput,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons, MaterialIcons } from "@expo/vector-icons";
import LottieView from "lottie-react-native";
import DatabaseService from "../services/ridefeedback_ds";
import { useAuth } from "../context/AuthContext";
import CustomAlert from '../components/CustomAlert';

/* ================= COLORS ================= */
import { Colors, Typography } from "../constants/Colors";

const REASONS = [
  "Driver was late",
  "Vehicle condition",
  "Driving behavior",
  "Route issue",
  "Great ride",
];

export default function RideFeedbackScreen({ navigation, route }) {
  const { user } = useAuth();
  const phoneNumber = user?.phone_number;

  const rideBookingId = 1; // 🔥 HARDCODED RIDE ID FOR NOW

  const [rating, setRating] = useState(0);
  const [selectedReason, setSelectedReason] = useState(null);
  const [comment, setComment] = useState("");
  const [loading, setLoading] = useState(false);

  // Custom Alert states
  const [alertVisible, setAlertVisible] = useState(false);
  const [alertConfig, setAlertConfig] = useState({
    title: "",
    message: "",
    icon: "check-circle",
    iconColor: "#10B981",
    buttons: []
  });

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

  const submitFeedback = async () => {
    if (!rating) {
      showCustomAlert("Rating Required", "Please rate your ride", "warning");
      return;
    }

    if (!rideBookingId || !phoneNumber) {
      showCustomAlert("Error", "Missing ride information", "error");
      return;
    }

    try {
      setLoading(true);

      // ✅ FORCE CORRECT TYPES
      const payload = {
        ride_booking_id: Number(rideBookingId),
        phone_number: String(phoneNumber),
        rating: Number(rating),
        reason: selectedReason || null,
        comment: comment || null,
      };

      console.log("📤 Ride feedback payload:", payload);

      const res = await DatabaseService.submitRideFeedback(payload);

      if (res?.success) {
        showCustomAlert("Thank you ⭐", "Ride feedback submitted successfully", "success");
        setTimeout(() => navigation.goBack(), 1500);
      } else {
        showCustomAlert("Error", "Unable to submit feedback", "error");
      }
    } catch (e) {
      console.error("❌ Ride feedback error:", e);
      showCustomAlert("Error", "Unable to submit feedback", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleBack = () => {
    navigation.goBack();
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar backgroundColor={Colors.white} barStyle="dark-content" />
      
      <KeyboardAvoidingView
        style={styles.keyboardAvoidingView}
        behavior={Platform.OS === 'ios' ? 'padding' : 'padding'}
      >
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity style={styles.modernBackButton} onPress={handleBack}>
            <MaterialIcons name="arrow-back-ios" size={28} color={Colors.secondary} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Ride Feedback</Text>
          <View style={styles.headerSpacer} />
        </View>

        {/* ================= CONTENT ================= */}
        <ScrollView contentContainerStyle={styles.scrollContent}>
          <View style={styles.mainCard}>
            {/* Title */}
            <Text style={styles.sectionTitle}>How was your ride?</Text>
            <Text style={styles.sectionSubtitle}>
              Help us improve your ride experience
            </Text>

            {/* ================= STAR RATING ================= */}
            <View style={styles.starRow}>
              {[1, 2, 3, 4, 5].map(star => (
                <TouchableOpacity
                  key={star}
                  onPress={() => setRating(star)}
                  activeOpacity={0.7}
                  disabled={loading}
                >
                  <Ionicons
                    name={star <= rating ? "star" : "star-outline"}
                    size={36}
                    color={Colors.orange1}
                  />
                </TouchableOpacity>
              ))}
            </View>

            {/* ================= REASONS ================= */}
            <Text style={styles.label}>Reason (optional)</Text>

            <View style={styles.reasonWrap}>
              {REASONS.map(reason => (
                <TouchableOpacity
                  key={reason}
                  style={[
                    styles.reasonChip,
                    selectedReason === reason && styles.reasonSelected,
                  ]}
                  onPress={() =>
                    setSelectedReason(
                      selectedReason === reason ? null : reason
                    )
                  }
                  disabled={loading}
                >
                  <Text
                    style={[
                      styles.reasonText,
                      selectedReason === reason &&
                        styles.reasonTextSelected,
                    ]}
                  >
                    {reason}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* ================= COMMENT ================= */}
            <Text style={styles.label}>Additional feedback</Text>
            <TextInput
              placeholder="Write something (optional)"
              style={styles.input}
              multiline
              value={comment}
              onChangeText={setComment}
              editable={!loading}
              placeholderTextColor="#9CA3AF"
            />

            {/* ================= SUBMIT ================= */}
            <TouchableOpacity
              style={[
                styles.submitBtn,
                loading && styles.submitBtnDisabled,
              ]}
              onPress={submitFeedback}
              disabled={loading}
            >
              {loading ? (
                <View style={styles.loadingContainer}>
                  <LottieView
                    source={require("../assets/loading.json")}
                    autoPlay
                    loop
                    style={{ width: 30, height: 30 }}
                  />
                  <Text style={styles.submitText}>Submitting...</Text>
                </View>
              ) : (
                <Text style={styles.submitText}>Submit Feedback</Text>
              )}
            </TouchableOpacity>
          </View>
        </ScrollView>
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

/* ================= STYLES ================= */
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

  scrollContent: {
    padding: 20,
    paddingBottom: 40,
  },

  mainCard: {
    backgroundColor: Colors.white,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: "#F3F4F6",
  },

  sectionTitle: {
    ...Typography.h1,
    fontSize: 18,
    fontWeight: "700",
    color: Colors.primary,
  },

  sectionSubtitle: {
    fontSize: 16,
    color: Colors.dark,
    marginTop: 6,
    marginBottom: 20,
    fontWeight: "500",
  },

  starRow: {
    flexDirection: "row",
    justifyContent: "center",
    marginBottom: 24,
  },

  label: {
    ...Typography.h2,
    fontSize: 15,
    color: Colors.primary,
    fontWeight: "600",
    marginBottom: 8,
  },

  reasonWrap: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginBottom: 16,
  },

  reasonChip: {
    borderWidth: 1.5,
    borderColor: Colors.borderGray,
    borderRadius: 20,
    paddingVertical: 6,
    paddingHorizontal: 14,
    margin: 6,
    backgroundColor: "#F9FAFB",
  },

  reasonSelected: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },

  reasonText: {
    fontSize: 14,
    color: Colors.dark,
    fontWeight: "600",
  },

  reasonTextSelected: {
    color: Colors.white,
  },

  input: {
    borderWidth: 1.5,
    borderColor: Colors.borderGray,
    borderRadius: 14,
    padding: 14,
    height: 100,
    textAlignVertical: "top",
    marginBottom: 20,
    backgroundColor: "#F9FAFB",
    fontSize: 14,
    color: Colors.dark,
  },

  submitBtn: {
    backgroundColor: Colors.primary,
    borderRadius: 16,
    paddingVertical: 16,
    alignItems: "center",
  },

  submitBtnDisabled: {
    opacity: 0.7,
  },

  submitText: {
    color: Colors.white,
    fontSize: 16,
    fontWeight: "700",
  },

  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
  },
});