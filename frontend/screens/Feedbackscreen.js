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
  Animated,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons, MaterialIcons, Feather } from "@expo/vector-icons";
import LottieView from "lottie-react-native";
import DatabaseService from "../services/feedback_ds";
import { useAuth } from "../context/AuthContext";
import CustomAlert from '../components/CustomAlert';

/* ================= COLORS ================= */
import { Colors, Typography } from "../constants/Colors";

const REASONS = [
  { id: "slow", label: "App is slow", icon: "speedometer-outline" },
  { id: "bug", label: "Bug or crash", icon: "bug-outline" },
  { id: "confusing", label: "UI is confusing", icon: "color-palette-outline" },
  { id: "driver", label: "Driver issue", icon: "car-outline" },
  { id: "great", label: "Great experience", icon: "happy-outline" },
];

export default function FeedbackScreen({ navigation, route }) {
  const handleBack = () => {
    navigation.goBack();
  };
  
  const { user } = useAuth();
  const phoneNumber = user?.phone_number;

  const [rating, setRating] = useState(0);
  const [selectedReason, setSelectedReason] = useState(null);
  const [comment, setComment] = useState("");
  const [loading, setLoading] = useState(false);
  const [animatedRating] = useState(new Animated.Value(0));
  
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

  const handleRatingPress = (star) => {
    setRating(star);
    Animated.spring(animatedRating, {
      toValue: 1,
      friction: 3,
      useNativeDriver: true,
    }).start(() => {
      animatedRating.setValue(0);
    });
  };

  /* ================= SUBMIT FEEDBACK ================= */
  const submitFeedback = async () => {
    if (!rating) {
      showCustomAlert("Rating Required", "Please select a star rating", "warning");
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
        setLoading(false);
        showCustomAlert("Thank you", "Your feedback has been submitted", "success");
        setTimeout(() => {
          navigation.goBack();
        }, 1500);
      } else {
        setLoading(false);
        showCustomAlert("Error", "Unable to submit feedback", "error");
      }
    } catch (e) {
      console.error("❌ Feedback error:", e);
      setLoading(false);
      showCustomAlert("Error", "Unable to submit feedback", "error");
    }
  };

  const getRatingText = () => {
    if (rating === 0) return "Tap to rate";
    if (rating <= 2) return "We'll do better 🫡";
    if (rating <= 3) return "Good to know 👍";
    if (rating <= 4) return "Happy to hear! 😊";
    return "Amazing! Thank you! 🌟";
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
          <Text style={styles.headerTitle}>Feedback</Text>
          <View style={styles.headerSpacer} />
        </View>

        {/* ================= CONTENT ================= */}
        <ScrollView 
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.mainCard}>
            {/* Title */}
            <Text style={styles.sectionTitle}>Rate your experience</Text>
            <Text style={styles.sectionSubtitle}>
              Your feedback helps us improve DRIVVE
            </Text>

            {/* ================= STAR RATING ================= */}
            <View style={styles.ratingContainer}>
              <View style={styles.starRow}>
                {[1, 2, 3, 4, 5].map(star => (
                  <TouchableOpacity
                    key={star}
                    onPress={() => handleRatingPress(star)}
                    activeOpacity={0.7}
                    style={styles.starButton}
                  >
                    <Animated.View
                      style={{
                        transform: [
                          {
                            scale: animatedRating.interpolate({
                              inputRange: [0, 1],
                              outputRange: [1, 1.2],
                            }),
                          },
                        ],
                      }}
                    >
                      <Ionicons
                        name={star <= rating ? "star" : "star-outline"}
                        size={40}
                        color={star <= rating ? Colors.orange1 : "#E5E7EB"}
                      />
                    </Animated.View>
                  </TouchableOpacity>
                ))}
              </View>
              <Text style={styles.ratingFeedbackText}>{getRatingText()}</Text>
            </View>

            {/* ================= REASONS - Always visible after rating ================= */}
            {rating > 0 && (
              <View style={styles.reasonsContainer}>
                <Text style={styles.label}>Reason (optional)</Text>
                <View style={styles.reasonWrap}>
                  {REASONS.map(reason => (
                    <TouchableOpacity
                      key={reason.id}
                      style={[
                        styles.reasonChip,
                        selectedReason === reason.label && styles.reasonSelected,
                      ]}
                      onPress={() =>
                        setSelectedReason(
                          selectedReason === reason.label ? null : reason.label
                        )
                      }
                      activeOpacity={0.7}
                    >
                      <Ionicons
                        name={reason.icon}
                        size={18}
                        color={selectedReason === reason.label ? Colors.white : Colors.secondary}
                        style={styles.reasonIcon}
                      />
                      <Text
                        style={[
                          styles.reasonText,
                          selectedReason === reason.label && styles.reasonTextSelected,
                        ]}
                      >
                        {reason.label}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            )}

            {/* ================= COMMENT - Always visible after rating ================= */}
            {rating > 0 && (
              <View style={styles.commentContainer}>
                <Text style={styles.additionallabel}>Additional feedback</Text>
                <TextInput
                  placeholder="Write something (optional)"
                  placeholderTextColor="#9CA3AF"
                  style={styles.input}
                  multiline
                  value={comment}
                  onChangeText={setComment}
                  textAlignVertical="top"
                />
              </View>
            )}

            {/* ================= SUBMIT - Always visible after rating ================= */}
            {rating > 0 && (
              <TouchableOpacity
                style={[
                  styles.submitBtn,
                  loading && styles.submitBtnDisabled,
                ]}
                onPress={submitFeedback}
                disabled={loading}
                activeOpacity={0.8}
              >
                <Text style={styles.submitText}>
                  {loading ? "Submit Feedback" : "Submit Feedback"}
                </Text>
              </TouchableOpacity>
            )}
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
    padding: 20,
    borderWidth: 1,
    borderColor: "#F3F4F6",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 10,
    elevation: 5,
  },
  iconContainer: {
    alignItems: 'center',
    marginBottom: 20,
  },
  iconCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: "#FEF3E8",
    justifyContent: 'center',
    alignItems: 'center',
  },
  sectionTitle: {
    ...Typography.h2,
    fontSize: 18,
    fontWeight: "800",
    color: Colors.primary,
    textAlign: 'center',
    marginBottom: 12,
  },
  sectionSubtitle: {
    fontSize: 16,
    color: Colors.dark,
    marginBottom: 6,
    fontWeight: "500",
    textAlign: 'center',
    lineHeight: 20,
  },
  ratingContainer: {
    marginBottom: 10,
  },
  starRow: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 12,
    marginBottom: 10,
  },
  starButton: {
    padding: 4,
  },
  ratingFeedbackText: {
    fontSize: 14,
    color: "#6B7280",
    textAlign: 'center',
    marginTop: 4,
  },
  reasonsContainer: {
    marginBottom: 28,
  },
  label: {
    ...Typography.h2,
    fontSize: 15,
    color: Colors.primary,
    fontWeight: "600",
    marginBottom: 12,
  },
  additionallabel: {
    ...Typography.h2,
    fontSize: 15,
    color: Colors.primary,
    fontWeight: "600",
    marginBottom: 12,
  },
  reasonWrap: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
  },
  reasonChip: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: Colors.primary,
    borderRadius: 24,
    paddingVertical: 8,
    paddingHorizontal: 14,
    backgroundColor: "#fff",
    gap: 6,
  },
  reasonSelected: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  reasonIcon: {
    marginRight: 0,
  },
  reasonText: {
    fontSize: 14,
    color: Colors.primary,
    fontWeight: "600",
  },
  reasonTextSelected: {
    color: Colors.white,
  },
  commentContainer: {
    marginBottom: 24,
  },
  input: {
    borderWidth: 1.5,
    borderColor: Colors.primary,
    borderRadius: 16,
    padding: 16,
    height: 110,
    textAlignVertical: "top",
    backgroundColor: "#F9FAFB",
    marginTop: 5,
    fontSize: 14,
    color: Colors.dark,
  },
  submitBtn: {
    backgroundColor: Colors.primary,
    borderRadius: 16,
    paddingVertical: 16,
    alignItems: "center",
    justifyContent: 'center',
    marginTop: 8,
  },
  submitBtnDisabled: {
    opacity: 0.6,
  },
  submitText: {
    color: Colors.white,
    fontSize: 16,
    fontWeight: "700",
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
});