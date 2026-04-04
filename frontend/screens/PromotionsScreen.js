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
     KeyboardAvoidingView,
  Platform,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons, MaterialIcons } from "@expo/vector-icons";
import * as Clipboard from "expo-clipboard";
import DatabaseService from "../services/promotion_ds";
import { Colors, Typography } from "../constants/Colors";
import { useAuth } from "../context/AuthContext";

export default function PromotionsScreen({ navigation, route }) {
  const { user } = useAuth();
  const phoneNumber = user?.phone_number;

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
 const handleBack = () => {
    navigation.goBack();
  };
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
                 <Text style={styles.headerTitle}>Promotions & Offers</Text>
                 <View style={styles.headerSpacer} />
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
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff" },

  
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
