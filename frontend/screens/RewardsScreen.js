import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  StatusBar,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons, MaterialIcons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";

import DatabaseService from "../services/DatabaseService";
import { Colors } from "../constants/Colors";

export default function RewardsScreen({ route, navigation }) {
  const phoneNumber =
    route?.params?.phoneNumber ||
    navigation?.getState()?.routes
      ?.find(r => r.params?.phoneNumber)
      ?.params?.phoneNumber ||
    null;

  const [data, setData] = useState(null);

  /* ================= AUTO CREDIT UNLOCKED REWARDS ================= */
  useEffect(() => {
    if (!data) return;

    data.rewards.forEach(async reward => {
      const unlocked =
        data.completed_rides >= reward.rides_required &&
        !data.credited_rewards.includes(reward.id);

      if (unlocked) {
        await DatabaseService.creditReward(phoneNumber, reward.id);
      }
    });
  }, [data]);

  useEffect(() => {
    loadRewards();
  }, []);

  const loadRewards = async () => {
    const res = await DatabaseService.getRewards(phoneNumber);
    setData(res);
  };

  if (!data) return null;

  const totalRewards = data.rewards
    .filter(r => data.completed_rides >= r.rides_required)
    .reduce((sum, r) => sum + r.reward_points, 0);

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

        <Text style={styles.headerTitle}>Rewards</Text>
        <View style={{ width: 44 }} />
      </View>

      {/* ================= TOTAL REWARDS ================= */}
      <LinearGradient
        colors={["#F97316", "#FB923C"]}
        style={styles.totalCard}
      >
        <Text style={styles.totalLabel}>Total Rewards Earned</Text>
        <Text style={styles.totalValue}>{totalRewards}</Text>
        <Text style={styles.totalSub}>D-Coins</Text>
      </LinearGradient>

      {/* ================= REWARD LIST ================= */}
      <ScrollView contentContainerStyle={styles.scroll}>
        {data.rewards.map(reward => {
          const progress = Math.min(
            data.completed_rides / reward.rides_required,
            1
          );

          const unlocked = progress === 1;

          return (
            <View key={reward.id} style={styles.card}>
              <View style={styles.cardHeader}>
                <View style={styles.titleRow}>
                  <Ionicons
                    name={unlocked ? "trophy" : "lock-closed"}
                    size={20}
                    color={unlocked ? "#F59E0B" : "#9CA3AF"}
                  />
                  <Text style={styles.title}>{reward.title}</Text>
                </View>

                <View
                  style={[
                    styles.badge,
                    { backgroundColor: unlocked ? "#DCFCE7" : "#F3F4F6" },
                  ]}
                >
                  <Text
                    style={{
                      color: unlocked ? "#16A34A" : "#6B7280",
                      fontWeight: "700",
                      fontSize: 12,
                    }}
                  >
                    {unlocked ? "UNLOCKED" : "LOCKED"}
                  </Text>
                </View>
              </View>

              <Text style={styles.text}>
                {data.completed_rides}/{reward.rides_required} rides completed
              </Text>

              <View style={styles.progressBg}>
                <LinearGradient
                  colors={
                    unlocked
                      ? ["#22C55E", "#4ADE80"]
                      : ["#93C5FD", "#60A5FA"]
                  }
                  style={[
                    styles.progressFill,
                    { width: `${progress * 100}%` },
                  ]}
                />
              </View>

              <Text style={styles.points}>
                🎁 {reward.reward_points} D-Coins
              </Text>
            </View>
          );
        })}
      </ScrollView>
    </SafeAreaView>
  );
}

/* ================= STYLES ================= */
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F9FAFB",
  },

  /* HEADER */
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 0.5,
    borderBottomColor: "#E5E7EB",
    backgroundColor: "#fff",
  },

  modernBackButton: {
    width: 44,
    height: 44,
    justifyContent: "center",
    alignItems: "center",
  },

  headerTitle: {
    flex: 1,
    textAlign: "center",
    fontSize: 24,
    fontWeight: "800",
    color: Colors.primary,
  },

  /* TOTAL CARD */
  totalCard: {
    margin: 20,
    padding: 26,
    borderRadius: 24,
    elevation: 10,
    alignItems: "center",
  },

  totalLabel: {
    color: "#FFEDD5",
    fontSize: 14,
    fontWeight: "600",
  },

  totalValue: {
    fontSize: 42,
    fontWeight: "900",
    color: "#fff",
    marginTop: 6,
  },

  totalSub: {
    fontSize: 14,
    color: "#FFEDD5",
    fontWeight: "600",
  },

  scroll: {
    paddingHorizontal: 16,
    paddingBottom: 40,
  },

  /* REWARD CARD */
  card: {
    backgroundColor: "#fff",
    borderRadius: 20,
    padding: 20,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "#EEF2F7",
    elevation: 3,
  },

  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },

  titleRow: {
    flexDirection: "row",
    alignItems: "center",
  },

  title: {
    fontSize: 17,
    fontWeight: "800",
    color: Colors.primary,
    marginLeft: 8,
  },

  badge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 20,
  },

  text: {
    marginTop: 8,
    color: "#6B7280",
    fontSize: 13,
  },

  progressBg: {
    height: 10,
    backgroundColor: "#E5E7EB",
    borderRadius: 6,
    marginTop: 14,
    overflow: "hidden",
  },

  progressFill: {
    height: "100%",
    borderRadius: 6,
  },

  points: {
    marginTop: 14,
    fontSize: 16,
    fontWeight: "800",
    color: "#111827",
  },
});
