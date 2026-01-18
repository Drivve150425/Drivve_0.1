import React, { useState } from "react";
import { View, Text, Switch, StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import ScreenHeader from "../screens/ScreenHeader";
import { Colors } from "../constants/Colors";

export default function PushNotificationsScreen({ navigation }) {
  const [enabled, setEnabled] = useState(true);

  return (
    <SafeAreaView style={styles.container}>
      <ScreenHeader title="Push Notifications" navigation={navigation} />

      <View style={styles.card}>
        <Text style={styles.label}>Ride Updates & Chat Messages</Text>
        <Switch value={enabled} onValueChange={setEnabled} />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.white },
  card: {
    margin: 20,
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: Colors.borderGray,
    backgroundColor: "#F9FAFB",
    flexDirection: "row",
    justifyContent: "space-between",
  },
  label: { fontSize: 15, fontWeight: "600" },
});
