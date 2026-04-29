import React, { useEffect, useState, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  StatusBar,
  KeyboardAvoidingView,
  Platform,
  Dimensions,
  ScrollView,
  RefreshControl,
  ActivityIndicator
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons, MaterialIcons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import * as Clipboard from "expo-clipboard";
import LottieView from "lottie-react-native";

import DatabaseService from "../services/dcoins_ds";
import { Colors, Typography } from "../constants/Colors";
import { useAuth } from "../context/AuthContext";
import CustomAlert from '../components/CustomAlert';

const { width, height } = Dimensions.get("window");

export default function DCoinWalletScreen({ route, navigation }) {
  const { user } = useAuth();
  const phoneNumber = user?.phone_number;

  const [history, setHistory] = useState([]);
  const [balanceCoins, setBalanceCoins] = useState(0);
  const [balanceRupees, setBalanceRupees] = useState(0);
  const [showAll, setShowAll] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [totalEarned, setTotalEarned] = useState(0);
  const [totalRedeemed, setTotalRedeemed] = useState(0);
  const [loading, setLoading] = useState(true);
  const [redeeming, setRedeeming] = useState(false);
  
  // Custom Alert states
  const [alertVisible, setAlertVisible] = useState(false);
  const [alertConfig, setAlertConfig] = useState({
    title: "",
    message: "",
    icon: "check-circle",
    iconColor: "#10B981",
    buttons: []
  });

  const showCustomAlert = (title, message, type = 'success') => {
    let icon = "check-circle";
    let iconColor = "#10B981";
    
    if (type === 'error') {
      icon = "error";
      iconColor = "#EF4444";
    } else if (type === 'warning') {
      icon = "warning";
      iconColor = "#F59E0B";
    } else if (type === 'info') {
      icon = "info";
      iconColor = Colors.primary;
    }
    
    setAlertConfig({
      title,
      message,
      icon,
      iconColor,
      buttons: [{ text: 'OK', onPress: () => setAlertVisible(false) }]
    });
    setAlertVisible(true);
  };

  const showConfirmationAlert = (title, message, onConfirm) => {
    setAlertConfig({
      title,
      message,
      icon: "warning",
      iconColor: "#F59E0B",
      buttons: [
        { text: 'Cancel', onPress: () => setAlertVisible(false), style: 'cancel' },
        { text: 'Redeem', onPress: () => {
          setAlertVisible(false);
          onConfirm();
        }, style: 'destructive' }
      ]
    });
    setAlertVisible(true);
  };

  const showRedeemSuccessAlert = (redeemCode, rupees) => {
    setAlertConfig({
      title: "Redeemed Successfully 🎉",
      message: `Redeem Code: ${redeemCode}\n\nAmount: ₹${rupees}`,
      icon: "check-circle",
      iconColor: "#10B981",
      buttons: [
        { 
          text: 'Copy Code', 
          onPress: async () => {
            await Clipboard.setStringAsync(redeemCode);
            setAlertVisible(false);
            showCustomAlert("Copied", "Redeem code copied to clipboard", "success");
          }
        },
        { text: 'OK', onPress: () => {
          setAlertVisible(false);
          loadData();
        } }
      ]
    });
    setAlertVisible(true);
  };

  useEffect(() => {
    if (phoneNumber) loadData();
  }, [phoneNumber]);

  const loadData = async () => {
    if (!phoneNumber) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const hist = await DatabaseService.getRedeemHistory(phoneNumber);
      const safeHistory = hist || [];
      setHistory(safeHistory);

      let credits = 0;
      let debits = 0;
      
      safeHistory.forEach(item => {
        const c = Math.abs(item.coins || 0);
        if (item.type === "CREDIT") {
          credits += c;
        } else if (item.type === "DEBIT") {
          debits += c;
        }
      });

      const balance = credits - debits;
      const rupees = Math.floor(balance / 25);

      setBalanceCoins(balance);
      setBalanceRupees(rupees);
      setTotalEarned(credits);
      setTotalRedeemed(debits);
    } catch (error) {
      console.error("Error loading D-Coins data:", error);
      showCustomAlert("Error", "Failed to load transaction history", "error");
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  }, [phoneNumber]);

  const handleRedeem = () => {
    if (balanceCoins < 25) {
      showCustomAlert("Insufficient Balance", "You need at least 25 D-Coins to redeem", "warning");
      return;
    }

    showConfirmationAlert(
      "Redeem D-Coins",
      `You will receive ₹${balanceRupees}`,
      async () => {
        setRedeeming(true);
        try {
          const res = await DatabaseService.redeemCoins(phoneNumber);
          showRedeemSuccessAlert(res.redeem_code, res.rupees);
        } catch (error) {
          console.error("Redeem error:", error);
          showCustomAlert("Error", "Failed to redeem coins. Please try again.", "error");
        } finally {
          setRedeeming(false);
        }
      }
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

  const getTransactionIcon = (reason) => {
    if (!reason) return "swap-horizontal-outline";
    
    const lowerReason = reason.toLowerCase();
    if (lowerReason.includes("ride")) return "car-outline";
    if (lowerReason.includes("reward")) return "gift-outline";
    if (lowerReason.includes("bonus")) return "star-outline";
    if (lowerReason.includes("refer")) return "people-outline";
    if (lowerReason.includes("redeem")) return "cash-outline";
    return "swap-horizontal-outline";
  };

  const hasTransactions = history && history.length > 0;
  const displayedTransactions = hasTransactions 
    ? (showAll ? history : history.slice(0, 4))
    : [];

  const renderTransactionItem = ({ item, index }) => {
    const isCredit = item.type === "CREDIT";
    const iconName = getTransactionIcon(item.reason);
    
    return (
      <View>
        <View style={styles.historyRow}>
          <View style={[styles.iconCircle, { backgroundColor: isCredit ? '#DCFCE7' : '#FEE2E2' }]}>
            <Ionicons
              name={iconName}
              size={22}
              color={isCredit ? "#16A34A" : "#EF4444"}
            />
          </View>

          <View style={{ flex: 1 }}>
            <Text style={styles.historyMain}>
              {item.reason || (isCredit ? "Credited" : "Debited")}
            </Text>
            <Text style={styles.historySub}>
              {formatDateTime(item.created_at)}
            </Text>
            {item.redeem_code && (
              <Text style={styles.redeemCodeText}>
                Code: {item.redeem_code}
              </Text>
            )}
          </View>

          <Text
            style={[
              styles.amount,
              {
                color: isCredit ? "#16A34A" : "#EF4444",
              },
            ]}
          >
            {isCredit ? "+" : "-"}{item.coins}
          </Text>
        </View>
        {index !== displayedTransactions.length - 1 && <View style={styles.divider} />}
      </View>
    );
  };

  // Show loader while fetching data
  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar backgroundColor={Colors.white} barStyle="dark-content" />
        <View style={styles.loaderContainer}>
          <LottieView
            source={require("../assets/loading.json")}
            autoPlay
            loop
            style={{ width: 300, height: 300 }}
          />
        </View>
      </SafeAreaView>
    );
  }

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
          <Text style={styles.headerTitle}>D-Coins</Text>
          <View style={styles.headerSpacer} />
        </View>

        <ScrollView 
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
        >
          {/* BALANCE CARD */}
          <LinearGradient
            colors={["#1E3A8A", "#3B82F6"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.balanceCard}
          >
            {/* Background bubbles */}
            <View style={styles.circleTop} />
            <View style={styles.circleBottom} />
            <View style={styles.circleCenter} />
            
            <View style={styles.balanceTopRow}>
              <Ionicons name="wallet-outline" size={20} color="#fff" />
              <Text style={styles.balanceTop}>Total Balance</Text>
            </View>
            <Text style={styles.balanceNumber}>{balanceCoins}</Text>
            <Text style={styles.balanceSub}>D-Coins</Text>
            
            <View style={styles.rupeesContainer}>
              <Text style={styles.rupeesText}>≈ ₹{balanceRupees}</Text>
            </View>

            <View style={styles.statsRow}>
              <View style={styles.statItem}>
                <Text style={styles.statValue}>{totalEarned}</Text>
                <Text style={styles.statLabel}>Total Earned</Text>
              </View>
              <View style={styles.statDivider} />
              <View style={styles.statItem}>
                <Text style={styles.statValue}>{totalRedeemed}</Text>
                <Text style={styles.statLabel}>Total Redeemed</Text>
              </View>
            </View>
          </LinearGradient>

          {/* REDEEM BUTTON - Uncommented and working */}
          {balanceCoins >= 25 && (
            <TouchableOpacity
              style={[styles.redeemButton, redeeming && styles.disabledButton]}
              onPress={handleRedeem}
              activeOpacity={0.8}
              disabled={redeeming}
            >
           
            </TouchableOpacity>
          )}

          {/* REWARDS CARD */}
          <TouchableOpacity
            style={styles.rewardCard}
            activeOpacity={0.8}
            onPress={() => navigation.navigate("RewardsScreen")}
          >
            <View style={styles.rewardIconBox}>
              <Ionicons name="gift-outline" size={24} color={Colors.orange1} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.rewardTitle}>Earn More Rewards</Text>
              <Text style={styles.rewardSub}>
                Complete rides to unlock bonus D-Coins
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color={Colors.primary} />
          </TouchableOpacity>

          {/* HOW TO EARN */}
          <View style={styles.earnCard}>
            <Text style={styles.earnTitle}>💡 How to Earn D-Coins?</Text>
            <Text style={styles.earnText}>
              • Complete rides and earn 25 D-Coins per ride
            </Text>
            <Text style={styles.earnText}>
              • Reach ride milestones to earn bonus rewards
            </Text>
            <Text style={styles.earnText}>
              • Refer friends and get 100 D-Coins per referral
            </Text>
          </View>

          {/* TRANSACTION HISTORY SECTION */}
          {hasTransactions ? (
            <>
              <View style={styles.historyHeader}>
                <Text style={styles.historyTitle}>Transaction History</Text>
                {history.length > 4 && (
                  <TouchableOpacity onPress={() => setShowAll(!showAll)}>
                    <Text style={styles.viewAll}>
                      {showAll ? "Show Less" : "View All"}
                    </Text>
                  </TouchableOpacity>
                )}
              </View>

              <View style={styles.historyContainer}>
                <FlatList
                  data={displayedTransactions}
                  renderItem={renderTransactionItem}
                  keyExtractor={(item, index) => item.id?.toString() || index.toString()}
                  scrollEnabled={false}
                />
              </View>
            </>
          ) : (
            <View style={styles.noTransactionsContainer}>
              <View style={styles.noTransactionsIconContainer}>
                <Ionicons name="document-text-outline" size={64} color={Colors.orange1} />
              </View>
              <Text style={styles.noTransactionsTitle}>No Transactions Yet</Text>
              <Text style={styles.noTransactionsSubtitle}>
                Complete rides, earn rewards, or refer friends to see your transaction history here
              </Text>
            </View>
          )}
        </ScrollView>
      </KeyboardAvoidingView>

      {/* Custom Alert */}
      <CustomAlert
        visible={alertVisible}
        title={alertConfig.title}
        message={alertConfig.message}
        icon={alertConfig.icon}
        iconColor={alertConfig.iconColor}
        buttons={alertConfig.buttons}
        onBackdropPress={() => setAlertVisible(false)}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: Colors.white,
  },
  keyboardAvoidingView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 40,
  },
  
  // Loader styles
  loaderContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.white,
  },
  
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: width * 0.04,
    paddingVertical: height * 0.02,
    borderBottomWidth: 0.5,
    borderBottomColor: '#F3F4F6',
    backgroundColor: Colors.white,
  },
  modernBackButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: width > 400 ? 28 : 24,
    fontWeight: '700',
    color: Colors.primary,
    flex: 1,
    textAlign: 'center',
  },
  headerSpacer: {
    width: 44,
  },
  balanceCard: {
    margin: width * 0.04,
    borderRadius: 24,
    padding: width * 0.06,
    overflow: "hidden",
    alignItems: "center",
    elevation: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 12,
  },
  circleTop: {
    position: "absolute",
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: "rgba(255,255,255,0.15)",
    top: -60,
    right: -60,
  },
  circleBottom: {
    position: "absolute",
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: "rgba(255,255,255,0.1)",
    bottom: -40,
    left: -40,
  },
  circleCenter: {
    position: "absolute",
    width: 80,
    height: 80,
    borderRadius: 90,
    backgroundColor: "rgba(255,255,255,0.08)",
    top: "40%",
    left: "60%"
  },
  balanceTopRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 12,
  },
  balanceTop: {
    color: Colors.white,
    fontSize: 14,
    fontWeight: "600",
    letterSpacing: 0.5,
  },
  balanceNumber: {
    fontSize: width > 400 ? 52 : 44,
    fontWeight: "900",
    color: Colors.white,
    textAlign: "center",
    marginTop: 5,
  },
  balanceSub: {
    color: Colors.white,
    textAlign: "center",
    fontSize: 16,
    fontWeight: "500",
    opacity: 0.9,
  },
  rupeesContainer: {
    marginTop: 8,
    paddingHorizontal: 16,
    paddingVertical: 4,
    backgroundColor: "rgba(255,255,255,0.2)",
    borderRadius: 20,
  },
  rupeesText: {
    color: Colors.white,
    fontSize: 14,
    fontWeight: "600",
  },
  statsRow: {
    flexDirection: "row",
    marginTop: 20,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: "rgba(255,255,255,0.2)",
    width: "100%",
    justifyContent: "space-around",
  },
  statItem: {
    alignItems: "center",
  },
  statValue: {
    color: Colors.white,
    fontSize: 20,
    fontWeight: "800",
  },
  statLabel: {
    color: Colors.white,
    fontSize: 12,
    opacity: 0.8,
    marginTop: 4,
  },
  statDivider: {
    width: 1,
    height: 30,
    backgroundColor: "rgba(255,255,255,0.2)",
  },
  redeemButton: {
    marginHorizontal: width * 0.04,
    marginBottom: 16,
    borderRadius: 16,
    overflow: "hidden",
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  redeemGradient: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  redeemText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "700",
    flex: 1,
    textAlign: "center",
  },
  redeemSubtext: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "600",
    opacity: 0.9,
  },
  rewardCard: {
    flexDirection: "row",
    alignItems: "center",
    marginHorizontal: width * 0.04,
    marginBottom: 16,
    backgroundColor: Colors.white,
    padding: width * 0.04,
    borderRadius: 16,
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    borderWidth: 1,
    borderColor: '#F3F4F6',
  },
  rewardIconBox: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: "#FFF7ED",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  rewardTitle: {
    fontWeight: "700",
    fontSize: 16,
    color: Colors.primary,
  },
  rewardSub: {
    fontSize: 13,
    color: Colors.gray,
    marginTop: 2,
  },
  earnCard: {
    margin: width * 0.04,
    padding: width * 0.04,
    borderRadius: 16,
    backgroundColor: "#E0E7FF",
  },
  earnTitle: {
    marginBottom: 8,
    fontSize: 16,
    fontWeight: "700",
    color: Colors.primary,
  },
  earnText: {
    fontSize: 13,
    marginTop: 6,
    color: "#374151",
    lineHeight: 20,
  },
  historyHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginHorizontal: width * 0.04,
    marginTop: 16,
    marginBottom: 12,
  },
  historyTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: Colors.primary,
  },
  viewAll: {
    color: Colors.orange1,
    fontWeight: "600",
    fontSize: 14,
  },
  historyContainer: {
    backgroundColor: Colors.white,
    marginHorizontal: width * 0.04,
    borderRadius: 18,
    overflow: "hidden",
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    borderWidth: 1,
    borderColor: '#F3F4F6',
  },
  historyRow: {
    flexDirection: "row",
    alignItems: "center",
    padding: width * 0.04,
  },
  iconCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  historyMain: {
    fontWeight: "600",
    fontSize: 15,
    color: "#1F2937",
  },
  historySub: {
    fontSize: 12,
    color: Colors.gray,
    marginTop: 2,
  },
  redeemCodeText: {
    fontSize: 11,
    color: Colors.orange1,
    marginTop: 2,
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
  },
  amount: {
    fontWeight: "800",
    fontSize: 16,
  },
  divider: {
    height: 1,
    backgroundColor: "#F3F4F6",
    marginLeft: 70,
  },
  noTransactionsContainer: {
    alignItems: "center",
    justifyContent: "center",
    marginHorizontal: width * 0.04,
    marginTop: height * 0.05,
    paddingVertical: height * 0.08,
    backgroundColor: Colors.white,
    borderRadius: 20,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    borderWidth: 1,
    borderColor: '#F3F4F6',
  },
  noTransactionsIconContainer: {
    marginBottom: 20,
  },
  noTransactionsTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: Colors.primary,
    marginBottom: 10,
    textAlign: "center",
  },
  noTransactionsSubtitle: {
    fontSize: 14,
    color: Colors.gray,
    textAlign: "center",
    paddingHorizontal: width * 0.08,
    lineHeight: 20,
  },
  disabledButton: {
    opacity: 0.7,
  },
});