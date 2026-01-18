import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  StatusBar,
  TextInput,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons, MaterialIcons } from "@expo/vector-icons";
import DatabaseService from "../services/DatabaseService";

/* ================= COLORS ================= */
import { Colors, Typography } from "../constants/Colors";

const REASONS = [
  "App is slow",
  "Bug or crash",
  "UI is confusing",
  "Driver issue",
  "Great experience",
];

export default function FeedbackScreen({ navigation, route }) {
  const phoneNumber =
    route?.params?.phoneNumber ||
    navigation?.getState()?.routes
      ?.find(r => r.params?.phoneNumber)
      ?.params?.phoneNumber ||
    null;

  const [rating, setRating] = useState(0);
  const [selectedReason, setSelectedReason] = useState(null);
  const [comment, setComment] = useState("");
  const [loading, setLoading] = useState(false);

  /* ================= SUBMIT FEEDBACK ================= */
  const submitFeedback = async () => {
    if (!rating) {
      Alert.alert("Rating Required", "Please select a star rating");
      return;
    }

    try {
      setLoading(true);

      const finalReason =
        selectedReason && comment
          ? `${selectedReason} - ${comment}`
          : selectedReason || comment || null;

      const response = await DatabaseService.submitFeedback(
        phoneNumber?.replace(/\s/g, ""),
        rating,
        finalReason
      );

      if (response?.success) {
        Alert.alert("Thank you 🙏", "Your feedback has been submitted");
        navigation.goBack();
      } else {
        Alert.alert("Error", "Unable to submit feedback");
      }
    } catch (e) {
      console.error("❌ Feedback error:", e);
      Alert.alert("Error", "Unable to submit feedback");
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar backgroundColor={Colors.white} barStyle="dark-content" />

      {/* ================= HEADER ================= */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.modernBackButton}
          onPress={() => navigation.goBack()}
        >
          <MaterialIcons
            name="arrow-back-ios"
            size={26}
            color={Colors.orange1}
          />
        </TouchableOpacity>

        <Text style={styles.headerTitle}>Feedback</Text>
        <View style={styles.headerSpacer} />
      </View>

      {/* ================= CONTENT ================= */}
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.mainCard}>
          {/* Title */}
          <Text style={styles.sectionTitle}>Rate your experience</Text>
          <Text style={styles.sectionSubtitle}>
            Your feedback helps us improve DRIVVE
          </Text>

          {/* ================= STAR RATING ================= */}
          <View style={styles.starRow}>
            {[1, 2, 3, 4, 5].map(star => (
              <TouchableOpacity
                key={star}
                onPress={() => setRating(star)}
                activeOpacity={0.7}
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
          />

          {/* ================= SUBMIT ================= */}
          <TouchableOpacity
            style={[
              styles.submitBtn,
              loading && { opacity: 0.6 },
            ]}
            onPress={submitFeedback}
            disabled={loading}
          >
            <Text style={styles.submitText}>
              {loading ? "Submitting..." : "Submit Feedback"}
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

/* ================= STYLES ================= */
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.white,
  },

  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 0.5,
    borderBottomColor: "#F3F4F6",
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
    fontSize: 28,
    fontWeight: "700",
    color: Colors.primary,
    flex: 1,
    textAlign: "center",
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
  },

  submitBtn: {
    backgroundColor: Colors.primary,
    borderRadius: 16,
    paddingVertical: 16,
    alignItems: "center",
  },

  submitText: {
    color: Colors.white,
    fontSize: 16,
    fontWeight: "700",
  },
});
