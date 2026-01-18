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

export default function TermsConditionsScreen({ navigation }) {
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

        <Text style={styles.headerTitle}>Terms & Conditions</Text>
        <View style={styles.headerSpacer} />
      </View>

      {/* ===== CONTENT ===== */}
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.card}>

          {/* META */}
          

          {/* INTRO */}
          <Text style={styles.introText}>
            These Terms & Conditions govern your access to and use of our
            application. By continuing to use the app, you agree to comply
            with these terms.
          </Text>

          {/* SECTIONS */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>1. User Responsibilities</Text>
            <Text style={styles.text}>
              You agree to use the application in a lawful and respectful
              manner. Any misuse, abuse, or fraudulent activity may result
              in immediate suspension or termination of your account.
            </Text>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>2. Account Usage</Text>
            <Text style={styles.text}>
              You are responsible for maintaining the confidentiality of
              your account credentials and for all activities that occur
              under your account.
            </Text>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>3. Termination</Text>
            <Text style={styles.text}>
              We reserve the right to suspend or terminate access to the
              application at our sole discretion if you violate these
              terms or applicable laws.
            </Text>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>4. Changes to Terms</Text>
            <Text style={styles.text}>
              These Terms & Conditions may be updated periodically. Your
              continued use of the application after updates indicates
              acceptance of the revised terms.
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
