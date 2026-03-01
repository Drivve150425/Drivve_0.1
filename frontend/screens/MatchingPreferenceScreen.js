import React, { useEffect, useState, useMemo } from "react";
import {
  View,
  Text,
  Switch,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  StatusBar
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { MaterialIcons, Ionicons } from "@expo/vector-icons";
import DatabaseService from "../services/DatabaseService";
import { Colors, Typography } from "../constants/Colors";
import { useAuth } from "../context/AuthContext";

/* =========================================================
   HELPERS
========================================================= */

const groupByCategory = (list = []) =>
  list.reduce((acc, i) => {
    let category = i.category;

    
    acc[category] = acc[category] || [];
    acc[category].push(i);
    return acc;
  }, {});

/* =========================================================
   ICON MAP
========================================================= */

const ICON_MAP = {
  smoking_policy: "smoking",
  speak_languages: "language",
  chat_level: "chat",
  age_category: "person",
  gender_preference: "wc",
  luggage_allowance: "luggage",
  pets_allowed: "pets",
  detours: "alt-route",
  helmet_policy_driver: "sports-motorsports",
  helmet_policy_passenger: "sports-motorsports",
  avoid_frequent_stops: "timer-off",
  same_gender_after_9pm: "nightlight",
  verified_profiles_only: "verified-user"
};

/* =========================================================
   SCREEN
========================================================= */

export default function MatchingPreferenceScreen({ route, navigation }) {
  const { user } = useAuth();
  const phoneNumber = user?.phone_number;
  
  // Get callback from route params (passed from Step3)
  const onSaveCallback = route?.params?.onSave || null;

  const [master, setMaster] = useState([]);
  const [values, setValues] = useState({});

  useEffect(() => {
    if (phoneNumber) {
      load();
    }
  }, [phoneNumber]);

  const load = async () => {
    if (!phoneNumber) return;

    const defs = await DatabaseService.getMatchingPreferenceMaster();
    const userVals = await DatabaseService.getUserMatchingPreferences(phoneNumber);
    setMaster(defs || []);
    setValues(userVals || {});
  };

  const grouped = useMemo(() => groupByCategory(master), [master]);

  const updateValue = (key, value) => {
    setValues(prev => ({ ...prev, [key]: value }));
    DatabaseService.saveMatchingPreference(phoneNumber, key, value);
  };

  // Handle save and navigate back
  const handleSave = () => {
    // Call the callback if provided (from Step3)
    if (onSaveCallback) {
      onSaveCallback(values);
    }
    // Navigate back to Step3
    navigation.goBack();
  };

  /* =========================================================
     RENDERERS
  ========================================================= */

  const renderToggle = (pref) => (
    <Switch
      value={values[pref.key] ?? false}
      onValueChange={v => updateValue(pref.key, v)}
      trackColor={{ true: Colors.primary }}
    />
  );

  /* 🔥 SINGLE SELECT — ONE LINE OPTIONS */
  const renderSingle = (pref) => (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.singleRow}
    >
      {pref.options.map(opt => {
        const active = values[pref.key] === opt;
        return (
          <TouchableOpacity
            key={opt}
            activeOpacity={0.85}
            style={[styles.singlePill, active && styles.singlePillActive]}
            onPress={() => updateValue(pref.key, opt)}
          >
            <Text
              numberOfLines={1}
              style={[
                styles.singlePillText,
                active && styles.singlePillTextActive
              ]}
            >
              {opt}
            </Text>
          </TouchableOpacity>
        );
      })}
    </ScrollView>
  );

  /* MULTI SELECT */
  const renderMulti = (pref) => {
    const selected = values[pref.key] || [];
    const showOther =
      pref.key === "speak_languages" &&
      (selected.includes("Other") || selected.includes("Others"));

    return (
      <>
        <View style={styles.pillRow}>
          {pref.options.map(opt => {
            const active = selected.includes(opt);
            return (
              <TouchableOpacity
                key={opt}
                activeOpacity={0.85}
                style={[styles.pill, active && styles.pillActive]}
                onPress={() => {
                  const updated = active
                    ? selected.filter(v => v !== opt)
                    : [...selected, opt];
                  updateValue(pref.key, updated);
                }}
              >
                <Text style={[styles.pillText, active && styles.pillTextActive]}>
                  {opt}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {showOther && (
          <TextInput
            placeholder="Please specify other language"
            placeholderTextColor="#9CA3AF"
            value={values[`${pref.key}_other`] || ""}
            onChangeText={(t) =>
              updateValue(`${pref.key}_other`, t)
            }
            style={styles.otherInput}
          />
        )}
      </>
    );
  };

  /* =========================================================
     EMPTY STATE
  ========================================================= */

  if (!master.length) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="dark-content" />

        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <MaterialIcons name="arrow-back-ios" size={26} color={Colors.orange1} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Matching Preferences</Text>
          <View style={{ width: 44 }} />
        </View>

        <View style={styles.emptyWrap}>
          <Ionicons name="options-outline" size={64} color={Colors.borderGray} />
          <Text style={styles.emptyTitle}>No Preferences Available</Text>
          <Text style={styles.emptyText}>
            Preferences will appear here once configured.
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  /* =========================================================
     MAIN UI
  ========================================================= */

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />

      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <MaterialIcons name="arrow-back-ios" size={26} color={Colors.orange1} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Matching Preferences</Text>
        <View style={{ width: 44 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {Object.entries(grouped).map(([category, prefs]) => (
          <View key={category} style={styles.card}>
            <Text style={styles.cardTitle}>{category}</Text>

            {prefs.map(pref => (
              <View key={pref.key} style={styles.prefBlock}>
                <View style={styles.prefHeader}>
                  <View style={styles.labelRow}>
                    <MaterialIcons
                      name={ICON_MAP[pref.key] || "tune"}
                      size={20}
                      color={Colors.primary}
                    />
                    <Text style={styles.label}>{pref.label}</Text>
                  </View>

                  {pref.input_type === "toggle" && renderToggle(pref)}
                </View>

                {pref.input_type === "single_select" && renderSingle(pref)}
                {pref.input_type === "multi_select" && renderMulti(pref)}
              </View>
            ))}
          </View>
        ))}
      </ScrollView>

      {/* Save Button */}
      <View style={styles.footer}>
        <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
          <Text style={styles.saveButtonText}>Save Preferences</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

/* =========================================================
   STYLES
========================================================= */

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.white
  },

  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 0.5,
    borderBottomColor: "#F3F4F6"
  },

  headerTitle: {
    ...Typography.h2,
    fontSize: 26,
    fontWeight: "700",
    color: Colors.primary,
    flex: 1,
    textAlign: "center"
  },

  scrollContent: {
    padding: 20,
    paddingBottom: 20
  },

  card: {
    backgroundColor: Colors.white,
    borderRadius: 18,
    padding: 16,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: "#F3F4F6",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 6
  },

  cardTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: Colors.primary,
    marginBottom: 14
  },

  prefBlock: {
    marginBottom: 18
  },

  prefHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center"
  },

  labelRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8
  },

  label: {
    fontSize: 15,
    fontWeight: "600",
    color: Colors.dark
  },

  /* 🔥 SINGLE SELECT STYLES */
  singleRow: {
    marginTop: 12,
    paddingBottom: 4
  },

  singlePill: {
    borderWidth: 1,
    borderColor: Colors.borderGray,
    borderRadius: 24,
    paddingHorizontal: 18,
    paddingVertical: 10,
    marginRight: 10,
    backgroundColor: "#F9FAFB"
  },

  singlePillActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary
  },

  singlePillText: {
    fontSize: 14,
    fontWeight: "600",
    color: Colors.dark,
    whiteSpace: "nowrap"
  },

  singlePillTextActive: {
    color: Colors.white
  },

  /* MULTI SELECT */
  pillRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginTop: 10,
    gap: 10
  },

  pill: {
    borderWidth: 1,
    borderColor: Colors.borderGray,
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 8
  },

  pillActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary
  },

  pillText: {
    fontSize: 14,
    color: Colors.dark
  },

  pillTextActive: {
    color: Colors.white,
    fontWeight: "600"
  },

  otherInput: {
    marginTop: 12,
    borderWidth: 1,
    borderColor: Colors.borderGray,
    borderRadius: 12,
    padding: 12,
    fontSize: 14
  },

  emptyWrap: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 30
  },

  emptyTitle: {
    fontSize: 20,
    fontWeight: "700",
    marginTop: 16,
    color: Colors.primary
  },

  emptyText: {
    fontSize: 15,
    color: Colors.dark,
    textAlign: "center",
    marginTop: 6
  },

  // Footer styles
  footer: {
    padding: 20,
    paddingBottom: 34,
    borderTopWidth: 1,
    borderTopColor: "#F3F4F6",
    backgroundColor: Colors.white,
  },

  saveButton: {
    backgroundColor: Colors.primary,
    paddingVertical: 16,
    borderRadius: 16,
    alignItems: "center",
  },

  saveButtonText: {
    color: Colors.white,
    fontSize: 18,
    fontWeight: "700",
  },
});
