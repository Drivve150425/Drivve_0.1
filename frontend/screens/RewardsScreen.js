import React, { useEffect, useState, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  StatusBar,
  KeyboardAvoidingView,
  Platform,
  Alert,
  RefreshControl,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons, MaterialIcons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";

import DatabaseService from "../services/rewards_ds";
import { Colors, Typography } from "../constants/Colors";
import { useAuth } from "../context/AuthContext";

export default function RewardsScreen({ route, navigation }) {
  const { user } = useAuth();
  const phoneNumber = user?.phone_number;

  const [data, setData] = useState(null);
  const [refreshing, setRefreshing] = useState(false);
  const [isCrediting, setIsCrediting] = useState(false);

  const loadRewards = useCallback(async () => {
    if (!phoneNumber) return;
    try {
      const res = await DatabaseService.getRewards(phoneNumber);
      setData(res);
    } catch (error) {
      console.error("Error loading rewards:", error);
      Alert.alert("Error", "Failed to load rewards");
    }
  }, [phoneNumber]);

  const autoCreditRewards = useCallback(async () => {
    if (!data || isCrediting) return;

    setIsCrediting(true);
    
    try {
      const unlockedRewards = data.rewards.filter(reward => 
        data.completed_rides >= reward.rides_required &&
        !data.credited_rewards.includes(reward.id)
      );

      if (unlockedRewards.length > 0) {
        for (const reward of unlockedRewards) {
          await DatabaseService.creditReward(phoneNumber, reward.id);
        }
        // Reload to show updated credited rewards
        await loadRewards();
        // Show success message
        Alert.alert(
          "Rewards Credited! 🎉",
          `You've earned ${unlockedRewards.reduce((sum, r) => sum + r.reward_points, 0)} D-Coins!`
        );
      }
    } catch (error) {
      console.error("Error auto-crediting rewards:", error);
    } finally {
      setIsCrediting(false);
    }
  }, [data, phoneNumber, isCrediting, loadRewards]);

  useEffect(() => {
    loadRewards();
  }, [loadRewards]);

  useEffect(() => {
    autoCreditRewards();
  }, [autoCreditRewards]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadRewards();
    setRefreshing(false);
  }, [loadRewards]);

  const handleBack = () => {
    navigation.goBack();
  };

  if (!data) return null;

  const totalRewards = data.rewards
    .filter(r => data.credited_rewards.includes(r.id))
    .reduce((sum, r) => sum + r.reward_points, 0);

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
          <Text style={styles.headerTitle}>Rewards</Text>
          {/* <TouchableOpacity style={styles.modernBackButton} onPress={onRefresh}>
            <MaterialIcons name="refresh" size={24} color={Colors.secondary} />
          </TouchableOpacity> */}
        </View>

        {/* Total Rewards Card */}
        {/* <LinearGradient
          colors={["#F97316", "#FB923C"]}
          style={styles.totalCard}
        >
          <Text style={styles.totalLabel}>Total Rewards Earned</Text>
          <Text style={styles.totalValue}>{totalRewards}</Text>
          <Text style={styles.totalSub}>D-Coins</Text>
        </LinearGradient> */}

        {/* Reward List */}
        <ScrollView 
          contentContainerStyle={styles.scroll}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
        >
          {data.rewards.map(reward => {
            const progress = Math.min(
              data.completed_rides / reward.rides_required,
              1
            );

            const unlocked = progress === 1;
            const isCredited = data.credited_rewards.includes(reward.id);

            return (
              <View key={reward.id} style={styles.card}>
                <View style={styles.cardHeader}>
                  <View style={styles.titleRow}>
                    {/* <MaterialIcons 
                      name={isCredited ? "check-circle" : (unlocked ? "stars" : "lock-outline")} 
                      size={24} 
                      color={isCredited ? "#16A34A" : (unlocked ? "#F97316" : "#9CA3AF")} 
                    /> */}
                    <Text style={styles.title}>{reward.title}</Text>
                  </View>

                  <View
                    style={[
                      styles.badge,
                      { backgroundColor: isCredited ? "#DCFCE7" : (unlocked ? "#FEF3C7" : "#F3F4F6") },
                    ]}
                  >
                    <Text
                      style={{
                        color: isCredited ? "#16A34A" : (unlocked ? "#D97706" : "#6B7280"),
                        fontWeight: "700",
                        fontSize: 12,
                      }}
                    >
                      {isCredited ? "CREDITED ✓" : (unlocked ? "READY" : "LOCKED")}
                    </Text>
                  </View>
                </View>

                <Text style={styles.text}>
                  {data.completed_rides}/{reward.rides_required} rides completed
                </Text>

                <View style={styles.progressBg}>
                  <LinearGradient
                    colors={unlocked ? ["#22C55E", "#4ADE80"] : ["#93C5FD", "#60A5FA"]}
                    style={[
                      styles.progressFill,
                      { width: `${progress * 100}%` },
                    ]}
                  />
                </View>

                <Text style={styles.points}>
                  🎁 {reward.reward_points} D-Coins
                </Text>

                {isCredited && (
                  <Text style={styles.creditedText}>
                    ✓ Added to your D-Coins wallet
                  </Text>
                )}
              </View>
            );
          })}
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F9FAFB",
  },
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
    gap: 8,
    flex: 1,
  },
  title: {
    fontSize: 17,
    fontWeight: "800",
    color: Colors.primary,
    flex: 1,
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
  creditedText: {
    marginTop: 12,
    fontSize: 12,
    color: "#16A34A",
    fontWeight: "600",
  },
});