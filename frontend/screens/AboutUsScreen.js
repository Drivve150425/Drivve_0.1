import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  StatusBar,
  TouchableOpacity,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons, MaterialIcons } from "@expo/vector-icons";
import DatabaseService from "../services/DatabaseService";
import { Colors, Typography } from "../constants/Colors";

export default function AboutUsScreen({ navigation }) {
  const [sections, setSections] = useState([]);

  useEffect(() => {
    loadContent();
  }, []);

  const loadContent = async () => {
    const data = await DatabaseService.getAboutUs();
    setSections(data || []);
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar backgroundColor={Colors.white} barStyle="dark-content" />

      {/* ================= HEADER (UNCHANGED) ================= */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backBtn}
          onPress={() => navigation.goBack()}
        >
          <MaterialIcons
            name="arrow-back-ios"
            size={28}
            color={Colors.orange1}
          />
        </TouchableOpacity>

        <Text style={styles.headerTitle}>About Us</Text>
        <View style={{ width: 44 }} />
      </View>

      {/* ================= CONTENT ================= */}
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.content}
      >
        {sections.length === 0 ? (
          /* EMPTY STATE */
          <View style={styles.emptyState}>
            <Ionicons
              name="information-circle-outline"
              size={48}
              color={Colors.orange1}
            />
            <Text style={styles.emptyText}>
              About information is currently unavailable.
            </Text>
          </View>
        ) : (
          /* PROFESSIONAL TEXT LAYOUT */
          <View>
            {sections.map((section, index) => (
              <View key={section.id} style={styles.section}>
                <Text style={styles.sectionTitle}>{section.title}</Text>

                <Text style={styles.sectionContent}>
                  {section.content}
                </Text>

                {index !== sections.length - 1 && (
                  <View style={styles.separator} />
                )}
              </View>
            ))}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

/* ================= STYLES ================= */
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.white, // unchanged
  },

  /* HEADER (UNCHANGED) */
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 0.5,
    borderBottomColor: "#E5E7EB",
  },

  backBtn: {
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

  content: {
    paddingHorizontal: 20,
    paddingTop: 24,
    paddingBottom: 60,
  },

  /* SECTION */
  section: {
    marginBottom: 24,
  },

  sectionTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: Colors.primary,
    marginBottom: 8,
  },

  sectionContent: {
    fontSize: 15,
    color: Colors.dark,
    lineHeight: 24,
    fontWeight: "400",
  },

  separator: {
    height: 1,
    backgroundColor: "#E5E7EB",
    marginTop: 24,
  },

  /* EMPTY */
  emptyState: {
    alignItems: "center",
    marginTop: 100,
  },

  emptyText: {
    marginTop: 10,
    fontSize: 14,
    color: Colors.dark,
    textAlign: "center",
  },
});
