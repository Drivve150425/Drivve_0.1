import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  TouchableOpacity,
  StatusBar,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import * as Clipboard from "expo-clipboard";
import DatabaseService from "../services/DatabaseService";
import { Colors, Typography } from "../constants/Colors";

export default function PromotionsScreen({ navigation, route }) {

   const phoneNumber =
  route?.params?.phoneNumber ||
  navigation?.getState()?.routes
    ?.find(r => r.params?.phoneNumber)
    ?.params?.phoneNumber ||
  null;

  const [promotions, setPromotions] = useState([]);

  useEffect(() => {
    loadPromotions();
  }, []);

  const loadPromotions = async () => {
    const data = await DatabaseService.getPromotions(phoneNumber);

    // 🔥 HIDE redeemed offers completely
    const filtered = data.filter(item => {
      if (!item.is_active) return false;
      if (item.is_redeemed) return false;

      if (item.valid_till) {
        const d = new Date(item.valid_till);
        d.setHours(23, 59, 59, 999);
        if (d < new Date()) return false;
      }
      return true;
    });

    setPromotions(filtered);
  };

  const copyCode = async code => {
    await Clipboard.setStringAsync(code);
    Alert.alert("Copied 🎉", "Promo code copied");
  };

  const redeemOffer = async item => {
    Alert.alert(
      "Redeem Offer 🎁",
      "This offer can be redeemed only once",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Redeem",
          onPress: async () => {
            const res = await DatabaseService.redeemPromotion(
              item.id,
              phoneNumber   // ✅ SEND PHONE NUMBER
            );

            if (res?.alreadyRedeemed) {
              Alert.alert("Already Redeemed");
            } else {
              Alert.alert("Success 🎉", "Offer redeemed successfully");

              // 🔥 REMOVE FROM LIST
              setPromotions(prev =>
                prev.filter(p => p.id !== item.id)
              );
            }
          },
        },
      ]
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />

      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="chevron-back" size={26} color={Colors.orange1} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Offers & Promotions</Text>
        <View style={{ width: 26 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scroll}>
        {promotions.length === 0 && (
          <View style={styles.emptyContainer}>
            <Ionicons name="pricetags-outline" size={60} />
            <Text style={styles.emptyTitle}>No Offers Available</Text>
          </View>
        )}

        {promotions.map(item => (
          <View key={item.id} style={styles.card}>
            {item.image_url && (
              <Image source={{ uri: item.image_url }} style={styles.image} />
            )}

            <View style={styles.content}>
              <Text style={styles.company}>{item.company_name}</Text>
              <Text style={styles.title}>{item.title}</Text>
              <Text style={styles.desc}>{item.description}</Text>

              {item.promo_code && (
                <TouchableOpacity
                  style={styles.codeRow}
                  onPress={() => copyCode(item.promo_code)}
                >
                  <Text style={styles.code}>{item.promo_code}</Text>
                  <Ionicons name="copy-outline" size={18} />
                </TouchableOpacity>
              )}

              <TouchableOpacity
                style={styles.redeemBtn}
                onPress={() => redeemOffer(item)}
              >
                <Text style={styles.redeemText}>Redeem Now</Text>
              </TouchableOpacity>
            </View>
          </View>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff" },

  header: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
  },

  headerTitle: {
    ...Typography.h2,
    flex: 1,
    textAlign: "center",
    fontSize: 22,
    fontWeight: "700",
    color: Colors.primary,
  },

  scroll: { padding: 16 },

  card: {
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    marginBottom: 16,
    backgroundColor: "#F9FAFB",
    overflow: "hidden",
  },

  image: { width: "100%", height: 160 },

  content: { padding: 16 },

  company: {
    fontSize: 13,
    fontWeight: "700",
    color: Colors.orange1,
    textTransform: "uppercase",
  },

  title: {
    fontSize: 18,
    fontWeight: "700",
    marginVertical: 6,
  },

  desc: { fontSize: 14, color: "#374151" },

  codeRow: {
    marginTop: 10,
    padding: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderStyle: "dashed",
    flexDirection: "row",
    justifyContent: "space-between",
    backgroundColor: "#fff",
  },

  code: { fontWeight: "800" },

  redeemBtn: {
    marginTop: 12,
    backgroundColor: Colors.primary,
    padding: 14,
    borderRadius: 12,
    alignItems: "center",
  },

  redeemDisabled: {
    backgroundColor: "#9CA3AF",
  },

  redeemText: {
    color: "#fff",
    fontWeight: "700",
  },

  emptyContainer: {
    marginTop: 200,
    alignItems: "center",
  },

  emptyTitle: {
    fontSize: 24,
    fontWeight: "700",
  },
});
