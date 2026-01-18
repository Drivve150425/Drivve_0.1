import React from "react";
import { View, Text, TouchableOpacity, StyleSheet, Alert } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import ScreenHeader from "../screens/ScreenHeader";
import { Colors } from "../constants/Colors";

export default function DeactivateAccountScreen({ navigation }) {
  const handleDeactivate = () => {
    Alert.alert(
      "Deactivate Account",
      "Are you sure you want to deactivate your account?",
      [{ text: "Cancel" }, { text: "Deactivate", style: "destructive" }]
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScreenHeader title="Deactivate Account" navigation={navigation} />

      <View style={styles.card}>
        <Text style={styles.warning}>
          This action is permanent and cannot be undone.
        </Text>

        <TouchableOpacity style={styles.btn} onPress={handleDeactivate}>
          <Text style={styles.btnText}>Deactivate Account</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.white },
  card: {
    margin: 20,
    padding: 20,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#FECACA",
    backgroundColor: "#FEF2F2",
  },
  warning: { color: "#991B1B", marginBottom: 20 },
  btn: {
    backgroundColor: "#DC2626",
    padding: 14,
    borderRadius: 14,
    alignItems: "center",
  },
  btnText: { color: "white", fontWeight: "700" },
});
