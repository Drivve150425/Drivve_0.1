import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  Alert,
  StatusBar,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons, MaterialIcons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import * as Clipboard from "expo-clipboard";

import DatabaseService from "../services/dcoins_ds";
import { Colors, Typography } from "../constants/Colors";
import { useAuth } from "../context/AuthContext";

export default function DCoinWalletScreen({ route, navigation }) {
  const { user } = useAuth();
  const phoneNumber = user?.phone_number;

  const [history, setHistory] = useState([]);
  const [balanceCoins, setBalanceCoins] = useState(0);
  const [balanceRupees, setBalanceRupees] = useState(0);
  const [showAll, setShowAll] = useState(false);

  useEffect(() => {
    if (phoneNumber) loadData();
  }, [phoneNumber]);

  const loadData = async () => {
    if (!phoneNumber) return;

    const hist = await DatabaseService.getRedeemHistory(phoneNumber);
    const safeHistory = hist || [];
    setHistory(safeHistory);

    let coins = 0;
    safeHistory.forEach(item => {
      const c = Math.abs(item.coins || 0);
      if (item.type === "CREDIT") coins += c;
      else coins -= c;
    });

    coins = Math.max(0, coins);
    const rupees = Math.floor(coins / 25);

    setBalanceCoins(coins);
    setBalanceRupees(rupees);
  };

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

  const handleBack = () => navigation.goBack();

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar backgroundColor={Colors.white} barStyle="dark-content" />
      
      <KeyboardAvoidingView
        style={styles.keyboardAvoidingView}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity style={styles.modernBackButton} onPress={handleBack}>
            <MaterialIcons name="arrow-back-ios" size={28} color={Colors.orange1} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>D-coins</Text>
          <View style={styles.headerSpacer} />
        </View>

        <FlatList
          data={[]}
          keyExtractor={(item, index) => index.toString()}
          contentContainerStyle={{ paddingBottom: 40 }}
          ListHeaderComponent={
            <>
              {/* BALANCE CARD */}
        <LinearGradient
  colors={[Colors.primary, Colors.primary]}
  style={styles.balanceCard}
>
<View style={styles.balanceTopRow}>
<Ionicons name="albums-outline" size={16} color="#E5E7EB" />
  <Text style={styles.balanceTop}>Total Balance</Text>
</View>
                <Text style={styles.balanceNumber}>{balanceCoins}</Text>
                <Text style={styles.balanceSub}>D coins</Text>

                <View style={styles.weekBox}>
                  <Ionicons name="trending-up" size={16} color={Colors.white}/>
                  <Text style={styles.weekText}>+125 this week</Text>
                </View>
              </LinearGradient>

              {/* REWARDS */}
            <TouchableOpacity
  style={styles.rewardCard}
  activeOpacity={0.8}
  onPress={() => navigation.navigate("RewardsScreen")}
>
  <View style={styles.rewardIconBox}>
    <Ionicons name="gift-outline" size={22} color={Colors.orange1} />
  </View>

  <View style={{ flex: 1 }}>
    <Text style={styles.rewardTitle}>Rewards</Text>
    <Text style={styles.rewardSub}>
      Redeem your coins for rewards
    </Text>
  </View>

  <Ionicons name="chevron-forward" size={20} color={Colors.primary} />
</TouchableOpacity>

              {/* HOW TO EARN */}
              <View style={styles.earnCard}>
                <Text style={styles.earnTitle}>💡 How to Earn D Coins?</Text>

                <Text style={styles.earnText}>
                  • Complete rides and earn 10-50 D-coins per ride
                </Text>
                <Text style={styles.earnText}>
                  • Cross levels and earn bonus coins
                </Text>
                <Text style={styles.earnText}>
                  • Refer friends and get 100 D-coins per referral
                </Text>
              </View>

              {/* HISTORY HEADER */}
              <View style={styles.historyHeader}>
                <Text style={styles.historyTitle}>Transaction History</Text>

                <TouchableOpacity onPress={() => setShowAll(!showAll)}>
                  <Text style={styles.viewAll}>
                    {showAll ? "Show Less" : "View All"}
                  </Text>
                </TouchableOpacity>
              </View>

              {/* SINGLE CARD LIST */}
              <View style={styles.historyContainer}>
                {(showAll ? history : history.slice(0, 4)).map(
                  (item, index) => {
                    const isCredit = item.type === "CREDIT";

                    return (
                      <View key={item.id}>
                        <View style={styles.historyRow}>
                          <View style={styles.iconCircle}>
                            <Ionicons
                              name={
                                item.reason?.toLowerCase().includes("ride")
                                  ? "location-outline"
                                  : item.reason
                                      ?.toLowerCase()
                                      .includes("bonus")
                                  ? "star-outline"
                                  : "people-outline"
                              }
                              size={22}
                              color={Colors.orange1}
                            />
                          </View>

                          <View style={{ flex: 1 }}>
                            <Text style={styles.historyMain}>
                              {item.reason || "Transaction"}
                            </Text>

                            <Text style={styles.historySub}>
                              {formatDateTime(item.created_at)}
                            </Text>
                          </View>

                          <Text
                            style={[
                              styles.amount,
                              {
                                color: isCredit ? "#16A34A" : "#EF4444",
                              },
                            ]}
                          >
                            {isCredit ? "+" : "-"}
                            {item.coins}
                          </Text>
                        </View>

                        {index !==
                          (showAll ? history : history.slice(0, 3)).length -
                            1 && <View style={styles.divider} />}
                      </View>
                    );
                  }
                )}
              </View>
            </>
          }
        />
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F3F4F6" },
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

  balanceCard: {
    margin: 16,
    borderRadius: 20,
    padding: 20,
      alignItems: "center",   // ✅ center horizontally

  },
balanceTop: {
  color: Colors.white,
  fontSize: 16,
  textAlign: "center",   // ✅ center text
},

balanceNumber: {
  fontSize: 44,
  fontWeight: "800",
  color: Colors.white,
  textAlign: "center",
  marginTop: 5,
},
coinIcon: {
  width: 16,
  height: 16,
  tintColor: "#E5E7EB", // matches white tone
  marginRight: 6,
},

balanceTopRow: {
  flexDirection: "row",
  alignItems: "center",
  justifyContent: "center",
},
balanceSub: {
  color: Colors.white,
  textAlign: "center",
  fontSize:16
},

 weekBox: {
  marginTop: 12,
  flexDirection: "row",
  alignItems: "center",
  justifyContent: "center",   // ✅ center content
  backgroundColor: "rgba(255,255,255,0.2)",
  paddingHorizontal: 12,
  paddingVertical: 6,
  borderRadius: 20,
  alignSelf: "center",        // ✅ center the box itself
},
  weekText: {
    color: Colors.white,
    marginLeft: 6,
    fontSize: 12,
  },

  rewardCard: {
    flexDirection: "row",
    alignItems: "center",
    marginHorizontal: 16,
    backgroundColor: Colors.white,
    padding: 14,
    borderRadius: 16,
    elevation: 3,
  },
rewardIconBox: {
  width: 44,
  height: 44,
  borderRadius: 22,          // perfect circle
  backgroundColor: "#FFF7ED", // light orange background
  justifyContent: "center",
  alignItems: "center",
  marginRight: 12,
},

  rewardTitle: {
    fontWeight: "700",
    fontSize: 18,
  },

  rewardSub: {
    fontSize: 16,
    color: Colors.gray,
  },

  earnCard: {
    margin: 16,
    padding: 16,
    borderRadius: 16,
    backgroundColor: "#E0E7FF",
  },

  earnTitle: {
    marginBottom: 6,
    fontSize:18,
    fontWeight:"700"

  },

  earnText: {
    fontSize: 16,
    marginTop: 4,
  },

  historyHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginHorizontal: 16,
    marginTop: 10,
  },

  historyTitle: {
    fontSize: 18,
    fontWeight: "700",
    color:Colors.primary
  },

  viewAll: {
    color: Colors.orange1,
    fontWeight: "600",
  },

  historyContainer: {
    backgroundColor: Colors.white,
    margin: 16,
    borderRadius: 18,
    paddingVertical: 6,
    elevation: 3,
  },

  historyRow: {
    flexDirection: "row",
    alignItems: "center",
    padding: 14,
  },

  iconCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: Colors.white,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },

  historyMain: {
    fontWeight: "600",
    fontSize:16
  },

  historySub: {
    fontSize: 14,
    color: Colors.gray,
  },

  amount: {
    fontWeight: "700",
    fontSize: 16,
  },

  divider: {
    height: 1,
    backgroundColor: Colors.white,
    marginLeft: 70,
  },
});