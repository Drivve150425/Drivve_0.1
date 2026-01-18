// components/ScreenHeader.js
import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import { Colors, Typography } from "../constants/Colors";

export default function ScreenHeader({ title, navigation }) {
  return (
    <View style={styles.header}>
      <TouchableOpacity onPress={() => navigation.goBack()}>
        <MaterialIcons name="arrow-back-ios" size={28} color={Colors.orange1} />
      </TouchableOpacity>

      <Text style={styles.title}>{title}</Text>
      <View style={{ width: 44 }} />
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 0.5,
    borderBottomColor: "#F3F4F6",
  },
  title: {
    ...Typography.h2,
    fontSize: 26,
    fontWeight: "700",
    color: Colors.primary,
    flex: 1,
    textAlign: "center",
  },
});
