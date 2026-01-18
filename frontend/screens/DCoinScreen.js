import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  Alert,
  StatusBar,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons, MaterialIcons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import * as Clipboard from "expo-clipboard";

import DatabaseService from "../services/DatabaseService";
import { Colors, Typography } from "../constants/Colors";

export default function DCoinWalletScreen({ route, navigation }) {
  const phoneNumber =
    route?.params?.phoneNumber ||
    navigation?.getState()?.routes
      ?.find(r => r.params?.phoneNumber)
      ?.params?.phoneNumber ||
    null;

  const [history, setHistory] = useState([]);
  const [balanceCoins, setBalanceCoins] = useState(0);
  const [balanceRupees, setBalanceRupees] = useState(0);

  useEffect(() => {
    loadData();
  }, []);

  /* ================= LOAD DATA ================= */
  const loadData = async () => {
    if (!phoneNumber) return;

    const hist = await DatabaseService.getRedeemHistory(phoneNumber);
    const safeHistory = hist || [];
    setHistory(safeHistory);

    // 🔥 COINS ARE SOURCE OF TRUTH
    let coins = 0;

    safeHistory.forEach(item => {
      const c = Math.abs(item.coins || 0);

      if (item.type === "CREDIT") {
        coins += c;
      } else {
        coins -= c;
      }
    });

    // ❌ Never allow negative
    coins = Math.max(0, coins);

    // ✅ Wallet shows ONLY whole rupees
    const rupees = Math.floor(coins / 25);

    setBalanceCoins(coins);
    setBalanceRupees(rupees);
  };

  /* ================= REDEEM ================= */
  const handleRedeem = () => {
    if (balanceCoins < 25) return;

    Alert.alert(
      "Redeem D-Coins",
      `You will receive ₹${balanceRupees}`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Redeem",
          onPress: async () => {
            const res = await DatabaseService.redeemCoins(phoneNumber);

            Alert.alert(
              "Redeemed Successfully 🎉",
              `Redeem Code: ${res.redeem_code}`,
              [
                {
                  text: "Copy Code",
                  onPress: async () => {
                    await Clipboard.setStringAsync(res.redeem_code);
                    Alert.alert("Copied", "Redeem code copied");
                  },
                },
                { text: "OK" },
              ]
            );

            loadData();
          },
        },
      ]
    );
  };

  /* ================= DATE FORMAT ================= */
  const formatDateTime = dateStr => {
    const d = new Date(dateStr);
    return d.toLocaleString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar backgroundColor={Colors.white} barStyle="dark-content" />

      {/* ================= HEADER ================= */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.modernBackButton}
          onPress={() => navigation.goBack()}
        >
          <MaterialIcons
            name="arrow-back-ios"
            size={26}
            color={Colors.orange1}
          />
        </TouchableOpacity>

        <Text style={styles.headerTitle}>D-Coins Wallet</Text>
        <View style={{ width: 44 }} />
      </View>

      {/* ================= WALLET CARD ================= */}
      <LinearGradient
        colors={["#4FACFE", "#00C6FB"]}
        style={styles.walletCard}
      >
        <Text style={styles.balanceLabel}>Available Balance</Text>

        <Text style={styles.coinText}>{balanceCoins}</Text>
        <Text style={styles.coinSub}>D-Coins</Text>

        <View style={styles.dividerLine} />

        <Text style={styles.rupeeText}>₹ {balanceRupees}</Text>
      </LinearGradient>

      {/* ================= STATS ================= */}
      <View style={styles.statsRow}>
        <View style={styles.statCard}>
          <Ionicons name="logo-bitcoin" size={20} color="#F59E0B" />
          <Text style={styles.statValue}>{balanceCoins}</Text>
          <Text style={styles.statLabel}>D-Coins</Text>
        </View>

        <View style={styles.statCard}>
          <Ionicons name="cash" size={20} color="#22C55E" />
          <Text style={styles.statValue}>₹{balanceRupees}</Text>
          <Text style={styles.statLabel}>Value</Text>
        </View>
      </View>

      {/* ================= REDEEM ================= */}
      <View style={styles.redeemContainer}>
        <TouchableOpacity
          style={[
            styles.redeemBtn,
            balanceCoins < 25 && { opacity: 0.4 },
          ]}
          disabled={balanceCoins < 25}
          onPress={handleRedeem}
          activeOpacity={0.85}
        >
          <Ionicons name="flash-outline" size={22} color="#fff" />
          <Text style={styles.redeemText}>
            Redeem ₹{balanceRupees} Now
          </Text>
        </TouchableOpacity>
      </View>

      {/* ================= HISTORY ================= */}
      <Text style={styles.historyTitle}>Wallet History</Text>

      <FlatList
        data={history}
        keyExtractor={item => item.id.toString()}
        contentContainerStyle={{ paddingBottom: 40 }}
        ListEmptyComponent={
          <Text style={styles.emptyText}>No transactions yet</Text>
        }
      renderItem={({ item }) => {
  const isCredit = item.type === "CREDIT";

  const rupees = Number(item.rupees).toFixed(2); // ✅ FIX
  const coins = Number(item.coins);

  return (
    <View style={styles.timelineCard}>
      <View
        style={[
          styles.timelineDot,
          { backgroundColor: isCredit ? "#22C55E" : "#EF4444" },
        ]}
      />

      <View style={styles.timelineContent}>
        <Text style={styles.historyAmount}>
          {isCredit ? "+" : "-"}₹{rupees}
        </Text>

        <Text style={styles.historySub}>
          {coins} D-Coins
        </Text>

        <Text style={styles.historyCode}>
          {item.reason}
        </Text>

        <Text style={styles.historyDate}>
          {formatDateTime(item.created_at)}
        </Text>
      </View>

      <Ionicons
        name={isCredit ? "arrow-down-circle" : "arrow-up-circle"}
        size={22}
        color={isCredit ? "#22C55E" : "#EF4444"}
      />
    </View>
  );
}}

      />
    </SafeAreaView>
  );
}

/* ================= STYLES ================= */
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.white },

  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 0.5,
    borderBottomColor: "#E5E7EB",
  },

  modernBackButton: {
    width: 44,
    height: 44,
    justifyContent: "center",
    alignItems: "center",
  },

  headerTitle: {
    ...Typography.h2,
    fontSize: 24,
    fontWeight: "800",
    color: Colors.primary,
    flex: 1,
    textAlign: "center",
  },

  walletCard: {
    margin: 20,
    borderRadius: 24,
    padding: 26,
    elevation: 10,
  },

  balanceLabel: { color: "#E0F2FE", fontSize: 14, fontWeight: "600" },
  coinText: { color: "#fff", fontSize: 44, fontWeight: "800", marginTop: 6 },
  coinSub: { color: "#E0F2FE", fontSize: 14, fontWeight: "600" },
  dividerLine: {
    height: 1,
    backgroundColor: "rgba(255,255,255,0.3)",
    marginVertical: 14,
  },
  rupeeText: { color: "#fff", fontSize: 24, fontWeight: "700" },

  statsRow: { flexDirection: "row", marginHorizontal: 14, marginBottom: 10 },

  statCard: {
    flex: 1,
    backgroundColor: "#fff",
    marginHorizontal: 6,
    borderRadius: 16,
    padding: 14,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#EEF2F7",
    elevation: 2,
  },

  statValue: {
    fontSize: 18,
    fontWeight: "800",
    marginTop: 6,
    color: Colors.primary,
  },

  statLabel: { fontSize: 12, color: "#6B7280", marginTop: 2 },

  redeemContainer: { marginHorizontal: 20, marginTop: 12, marginBottom: 6 },

  redeemBtn: {
    flexDirection: "row",
    backgroundColor: Colors.orange1,
    paddingVertical: 16,
    borderRadius: 18,
    justifyContent: "center",
    alignItems: "center",
    elevation: 6,
  },

  redeemText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "800",
    marginLeft: 10,
  },

  historyTitle: {
    marginHorizontal: 20,
    marginTop: 12,
    fontSize: 18,
    fontWeight: "700",
    color: Colors.primary,
  },

  timelineCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    marginHorizontal: 20,
    marginTop: 14,
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#EEF2F7",
  },

  timelineDot: { width: 10, height: 10, borderRadius: 5, marginRight: 14 },
  timelineContent: { flex: 1 },

  historyAmount: {
    fontSize: 16,
    fontWeight: "700",
    color: Colors.primary,
  },

  historySub: {
    fontSize: 12,
    color: "#6B7280",
    marginTop: 2,
  },

  historyCode: { fontSize: 12, color: "#374151", marginTop: 4 },
  historyDate: { fontSize: 11, color: "#9CA3AF", marginTop: 4 },

  emptyText: { textAlign: "center", marginTop: 40, color: "#9CA3AF" },
});
