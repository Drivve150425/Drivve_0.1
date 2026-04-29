import React from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  StatusBar,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons, MaterialIcons } from "@expo/vector-icons";
import { Colors, Typography } from "../constants/Colors";
import LottieView from "lottie-react-native";

export default function HelpSupportScreen({ navigation }) {
  const handleBack = () => {
    navigation.goBack();
  };

  // No loading state needed as this screen doesn't fetch data
  // but keeping consistent structure

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
          <Text style={styles.headerTitle}>Help & Support</Text>
          <View style={styles.headerSpacer} />
        </View>

        {/* ================= CONTENT ================= */}
        <View style={styles.content}>
          <Text style={styles.title}>How can we help?</Text>
          <Text style={styles.subtitle}>
            Find answers or contact our team.
          </Text>

          {/* ================= FAQ CARD ================= */}
          <TouchableOpacity
            activeOpacity={0.9}
            style={styles.card}
            onPress={() => navigation.navigate("FAQScreen")}
          >
            <View style={styles.cardLeft}>
              <View style={styles.iconCircle}>
                <Ionicons
                  name="help-circle-outline"
                  size={26}
                  color={Colors.primary}
                />
              </View>

              <View style={styles.cardText}>
                <Text style={styles.cardTitle}>FAQ</Text>
                <Text style={styles.cardSub}>
                  Browse common questions
                </Text>
                <Text style={styles.link}>
                  View Articles{" "}
                  <Text style={styles.arrow}>→</Text>
                </Text>
              </View>
            </View>

            {/* Right Illustration Icon */}
            <Ionicons
              name="document-text-outline"
              size={50}
              color="#CBD5E1"
            />
          </TouchableOpacity>

          {/* ================= EMAIL SUPPORT CARD ================= */}
          <TouchableOpacity
            activeOpacity={0.9}
            style={styles.card}
            onPress={() => navigation.navigate("EmailSupportScreen")}
          >
            <View style={styles.cardLeft}>
              <View style={styles.iconCircle}>
                <Ionicons
                  name="mail-outline"
                  size={26}
                  color={Colors.primary}
                />
              </View>

              <View style={styles.cardText}>
                <Text style={styles.cardTitle}>Email Support</Text>
                <Text style={styles.cardSub}>
                  Get help from our team
                </Text>
                <Text style={styles.link}>
                  Contact Us{" "}
                  <Text style={styles.arrow}>→</Text>
                </Text>
              </View>
            </View>

            {/* Right Illustration Icon */}
            <Ionicons
              name="mail-open-outline"
              size={50}
              color="#CBD5E1"
            />
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

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

  /* CONTENT */
  content: {
    flex: 1,
    padding: 20,
  },

  title: {
    fontSize: 24,
    fontWeight: "700",
    color: Colors.primary,
  },

  subtitle: {
    fontSize: 15,
    color: Colors.dark,
    marginTop: 6,
    marginBottom: 20,
  },

  /* CARD */
  card: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
    borderRadius: 16,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#F3F4F6",
    marginBottom: 14,

    // 🔥 SHADOW (iOS)
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 10,

    // 🔥 SHADOW (Android)
    elevation: 4,
  },

  cardLeft: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },

  iconCircle: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: "#F3F4F6",
    alignItems: "center",
    justifyContent: "center",
  },

  cardText: {
    marginLeft: 14,
    flex: 1,
  },

  cardTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: Colors.primary,
  },

  cardSub: {
    fontSize: 16,
    color: Colors.dark,
    marginTop: 2,
  },

  link: {
    fontSize: 16,
    color: Colors.primary,
    fontWeight: "600",
    marginTop: 6,
  },
  
  arrow: {
    color: Colors.orange1,   // 🔥 ORANGE ARROW
    fontWeight: "700",
    fontSize: 20,
  },
});