import React from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Linking,
  StatusBar,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  Ionicons,
  MaterialIcons,
  FontAwesome6, // ✅ Added for X (Twitter)
} from "@expo/vector-icons";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { Colors, Typography } from "../constants/Colors";

const SUPPORT_EMAIL = "social.drivve@gmail.com";

export default function EmailSupportScreen({ navigation }) {
  /* ================= HANDLERS ================= */

  const openEmail = async () => {
    const subject = encodeURIComponent("DRIVVE Support");
    const body = encodeURIComponent("Hi DRIVVE Team,\n\n");

    const mailUrl = `mailto:${SUPPORT_EMAIL}?subject=${subject}&body=${body}`;

    const supported = await Linking.canOpenURL(mailUrl);

    if (supported) {
      await Linking.openURL(mailUrl);
    } else {
      alert("No email app found on this device.");
    }
  };

  const openLink = async (url) => {
    const supported = await Linking.canOpenURL(url);

    if (supported) {
      await Linking.openURL(url);
    } else {
      alert("Unable to open link.");
    }
  };

  const handleBack = () => {
    navigation.goBack();
  };

  /* ================= UI ================= */

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar backgroundColor={Colors.white} barStyle="dark-content" />

      <KeyboardAvoidingView
        style={styles.keyboardAvoidingView}
        behavior={Platform.OS === "ios" ? "padding" : "padding"}
      >
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.modernBackButton}
            onPress={handleBack}
          >
            <MaterialIcons
              name="arrow-back-ios"
              size={28}
              color={Colors.secondary}
            />
          </TouchableOpacity>

          <Text style={styles.headerTitle}>Email Support</Text>

          <View style={styles.headerSpacer} />
        </View>

        {/* ================= CONTENT ================= */}
        <View style={styles.content}>
          <Text style={styles.message}>
            Hi there! We’re always here and happy to help you anytime.
          </Text>

          {/* ================= EMAIL CARD ================= */}
          <TouchableOpacity
            style={styles.emailCard}
            activeOpacity={0.8}
            onPress={openEmail}
          >
            <View style={styles.emailIcon}>
              <Ionicons
                name="mail-outline"
                size={26}
                color={Colors.primary}
              />
            </View>

            <View style={{ marginLeft: 12 }}>
              <Text style={styles.emailTitle}>Email</Text>
              <Text style={styles.emailText}>{SUPPORT_EMAIL}</Text>
            </View>
          </TouchableOpacity>

          {/* ================= CONNECT ================= */}
          <Text style={styles.connectText}>Connect with us</Text>

          <View style={styles.socialWrapper}>
            <View style={styles.socialRow}>
              {/* WhatsApp */}
              <TouchableOpacity
                onPress={() =>
                  openLink("https://wa.me/919999999999")
                }
                style={styles.socialBtn}
              >
                <Ionicons
                  name="logo-whatsapp"
                  size={28}
                  color="#25D366"
                />
              </TouchableOpacity>

              {/* Instagram */}
              <TouchableOpacity
                onPress={() =>
                  openLink("https://www.instagram.com/drivve")
                }
                style={styles.socialBtn}
              >
                <Ionicons
                  name="logo-instagram"
                  size={28}
                  color="#E4405F"
                />
              </TouchableOpacity>

              {/* Facebook */}
              <TouchableOpacity
                onPress={() =>
                  openLink("https://www.facebook.com/drivve")
                }
                style={styles.socialBtn}
              >
                <Ionicons
                  name="logo-facebook"
                  size={28}
                  color="#1877F2"
                />
              </TouchableOpacity>

              {/* LinkedIn */}
              <TouchableOpacity
                onPress={() =>
                  openLink(
                    "https://www.linkedin.com/company/drivve"
                  )
                }
                style={styles.socialBtn}
              >
                <Ionicons
                  name="logo-linkedin"
                  size={28}
                  color="#0A66C2"
                />
              </TouchableOpacity>

              {/* X (Twitter Updated ✅) */}
              <TouchableOpacity
                onPress={() =>
                  openLink("https://twitter.com/drivve")
                }
                style={styles.socialBtn}
              >
                <FontAwesome6
                  name="x-twitter"
                  size={26}
                  color="#000"
                />
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </KeyboardAvoidingView>
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

  content: {
    padding: 20,
  },

  message: {
    fontSize: 18,
    color: Colors.dark,
    marginBottom: 15,
    lineHeight: 30,
  },

  emailCard: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderRadius: 16,
    padding: 16,
    backgroundColor: "#FFFFFF",

    elevation: 4,

    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
  },

  emailIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: "#F3F4F6",
    justifyContent: "center",
    alignItems: "center",
  },

  emailTitle: {
    fontSize: 20,
    fontWeight: "600",
    color: Colors.primary,
  },

  emailText: {
    fontSize: 16,
    fontWeight: "500",
    color: Colors.dark,
  },

  connectText: {
    marginTop: 28,
    fontSize: 20,
    fontWeight: "600",
    color: Colors.primary,
    textAlign: "center",
  },

  socialWrapper: {
    alignItems: "center",
    marginTop: 16,
  },

  socialRow: {
    flexDirection: "row",
    justifyContent: "center",
  },

  socialBtn: {
    marginHorizontal: 14,
    padding: 6,
  },
});