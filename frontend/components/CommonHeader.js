import React from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Platform,
} from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { Colors, Typography } from '../constants/Colors';

export default function CommonHeader({
  title = "Title",
  showBack = true,
  rightIcon = null,
  onRightPress,
}) {
  const navigation = useNavigation();

  return (
    <View style={styles.header}>

      {/* Left */}
      {showBack ? (
        <TouchableOpacity
          style={styles.iconButton}
          onPress={() => navigation.goBack()}
        >
          <MaterialIcons
            name="arrow-back-ios"
            size={28}
            color={Colors.orange1}
          />
        </TouchableOpacity>
      ) : (
        <View style={styles.side} />
      )}

      {/* Title */}
      <Text numberOfLines={1} style={styles.title}>
        {title}
      </Text>

      {/* Right */}
      {rightIcon ? (
        <TouchableOpacity
          style={styles.iconButton}
          onPress={onRightPress}
        >
          {rightIcon}
        </TouchableOpacity>
      ) : (
        <View style={styles.side} />
      )}

    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    height: 60,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
   
  },

  iconButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: "center",
    alignItems: "center",
  },

  side: {
    width: 44,
  },

 
  // h2: {
  //   fontFamily: FontFamily.primary.bold,
  //   fontSize: 28,
  //   lineHeight: 36,
  //   color: Colors.dark,
  // },
title: {
    ...Typography.h2,
    fontSize: 28,
    fontWeight: '700',
    color: Colors.primary,
    flex: 1,
    textAlign: 'center',
  }
});
