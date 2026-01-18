import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  StatusBar,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { Colors, Typography } from '../constants/Colors';

export default function PrivacyPolicyScreen({ navigation }) {
  return (
    <SafeAreaView style={styles.container}>
      <StatusBar backgroundColor={Colors.white} barStyle="dark-content" />

      {/* ===== HEADER (UNCHANGED) ===== */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.modernBackButton}
          onPress={() => navigation.goBack()}
        >
          <MaterialIcons
            name="arrow-back-ios"
            size={28}
            color={Colors.orange1}
          />
        </TouchableOpacity>

        <Text style={styles.headerTitle}>Privacy Policy</Text>
        <View style={styles.headerSpacer} />
      </View>

      {/* ===== CONTENT ===== */}
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.card}>

         

          {/* INTRO */}
          <Text style={styles.introText}>
            Your privacy is important to us. This Privacy Policy explains how
            we collect, use, and protect your personal information when you
            use our application.
          </Text>

          {/* SECTIONS */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>1. Information We Collect</Text>
            <Text style={styles.text}>
              We may collect personal information such as your name, phone
              number, email address, and app usage data to provide and improve
              our services.
            </Text>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>2. How We Use Your Data</Text>
            <Text style={styles.text}>
              Your data helps us deliver features, improve security, provide
              customer support, and enhance overall user experience.
            </Text>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>3. Data Sharing</Text>
            <Text style={styles.text}>
              We do not sell your personal information. Data may only be shared
              when required by law or with trusted partners to operate essential
              services.
            </Text>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>4. Data Security</Text>
            <Text style={styles.text}>
              We use industry-standard security practices to protect your
              information from unauthorized access, loss, or misuse.
            </Text>
          </View>

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

  /* HEADER */
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
    fontSize: 26,
    fontWeight: '700',
    color: Colors.primary,
    flex: 1,
    textAlign: 'center',
  },
  headerSpacer: {
    width: 44,
  },

  /* CONTENT */
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 40,
  },

  card: {
    backgroundColor: Colors.white,
    borderRadius: 20,
    padding: 20,
    borderWidth: 1,
    borderColor: '#F3F4F6',

    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
    elevation: 3,
  },

  /* META */
  meta: {
    marginBottom: 12,
  },
  metaText: {
    fontSize: 13,
    color: Colors.dark,
    opacity: 0.6,
  },

  /* INTRO */
  introText: {
    fontSize: 15,
    color: Colors.dark,
    lineHeight: 22,
    marginBottom: 16,
    opacity: 0.85,
  },

  /* SECTIONS */
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.primary,
    marginBottom: 8,
  },
  text: {
    fontSize: 14.5,
    color: Colors.dark,
    lineHeight: 22,
    opacity: 0.85,
  },
});
