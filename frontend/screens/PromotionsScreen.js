import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  TouchableOpacity,
  StatusBar,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons, MaterialIcons } from "@expo/vector-icons";
import * as Clipboard from "expo-clipboard";
import LottieView from "lottie-react-native";
import DatabaseService from "../services/promotion_ds";
import { Colors, Typography } from "../constants/Colors";
import { useAuth } from "../context/AuthContext";
import CustomAlert from '../components/CustomAlert';

export default function PromotionsScreen({ navigation, route }) {
  const { user } = useAuth();
  const phoneNumber = user?.phone_number;

  const [promotions, setPromotions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [redeemingId, setRedeemingId] = useState(null);
  
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

  useEffect(() => {
    loadPromotions();
  }, []);

  const loadPromotions = async () => {
    if (!phoneNumber) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
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
    } catch (error) {
      console.error("Error loading promotions:", error);
      showCustomAlert("Error", "Failed to load promotions", "error");
    } finally {
      setLoading(false);
    }
  };

  const copyCode = async code => {
    await Clipboard.setStringAsync(code);
    showCustomAlert("Copied 🎉", "Promo code copied to clipboard", "success");
  };

  const redeemOffer = async item => {
    showConfirmationAlert(
      "Redeem Offer 🎁",
      "This offer can be redeemed only once",
      async () => {
        setRedeemingId(item.id);
        try {
          const res = await DatabaseService.redeemPromotion(
            item.id,
            phoneNumber
          );

          if (res?.alreadyRedeemed) {
            showCustomAlert("Already Redeemed", "This offer has already been redeemed", "warning");
          } else {
            showCustomAlert("Success 🎉", "Offer redeemed successfully", "success");

            // 🔥 REMOVE FROM LIST
            setPromotions(prev =>
              prev.filter(p => p.id !== item.id)
            );
          }
        } catch (error) {
          console.error("Error redeeming offer:", error);
          showCustomAlert("Error", "Failed to redeem offer", "error");
        } finally {
          setRedeemingId(null);
        }
      }
    );
  };
  
  const handleBack = () => {
    navigation.goBack();
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
              <Ionicons name="pricetags-outline" size={60} color={Colors.primary} />
              <Text style={styles.emptyTitle}>No Offers Available</Text>
              <Text style={styles.emptySubtitle}>
                Check back later for exciting offers!
              </Text>
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
                    style={styles.codeContainer}
                    onPress={() => copyCode(item.promo_code)}
                    activeOpacity={0.8}
                  >
                    <View style={styles.codeWrapper}>
                      <Ionicons name="ticket-outline" size={20} color={Colors.primary} />
                      <Text style={styles.codeLabel}>PROMO CODE</Text>
                    </View>
                    <View style={styles.codeRow}>
                      <Text style={styles.code}>{item.promo_code}</Text>
                      <View style={styles.copyButton}>
                        <Ionicons name="copy-outline" size={20} color={Colors.primary} />
                        <Text style={styles.copyText}>Copy</Text>
                      </View>
                    </View>
                  </TouchableOpacity>
                )}

                <TouchableOpacity
                  style={[styles.redeemBtn, redeemingId === item.id && styles.disabledButton]}
                  onPress={() => redeemOffer(item)}
                  activeOpacity={0.8}
                  disabled={redeemingId === item.id}
                >
                  {redeemingId === item.id ? (
                    <ActivityIndicator color={Colors.white} />
                  ) : (
                    <Text style={styles.redeemText}>Redeem Now</Text>
                  )}
                </TouchableOpacity>
              </View>
            </View>
          ))}
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
    backgroundColor: "#fff" 
  },

  keyboardAvoidingView: {
    flex: 1,
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
  
  scroll: { 
    padding: 16,
    paddingBottom: 40,
  },

  card: {
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    marginBottom: 20,
    backgroundColor: "#FFFFFF",
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 6,
  },

  image: { 
    width: "100%", 
    height: 160,
    backgroundColor: "#F3F4F6",
  },

  content: { 
    padding: 20 
  },

  company: {
    fontSize: 12,
    fontWeight: "800",
    color: Colors.orange1,
    textTransform: "uppercase",
    letterSpacing: 1,
    marginBottom: 4,
  },

  title: {
    fontSize: 20,
    fontWeight: "700",
    marginBottom: 8,
    color: Colors.primary,
  },

  desc: { 
    fontSize: 14, 
    color: "#6B7280",
    lineHeight: 20,
    marginBottom: 16,
  },

  // New attractive code container without dashed border
  codeContainer: {
    marginTop: 8,
    marginBottom: 16,
    backgroundColor: "#F8F9FA",
    borderRadius: 16,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "#E8EDF2",
  },
  
  codeWrapper: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F0F2F5",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: "#E8EDF2",
  },
  
  codeLabel: {
    fontSize: 10,
    fontWeight: "700",
    color: Colors.primary,
    letterSpacing: 1,
    marginLeft: 8,
  },
  
  codeRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  
  code: {
    fontSize: 18,
    fontWeight: "800",
    color: Colors.primary,
    letterSpacing: 1.5,
  },
  
  copyButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: Colors.primary,
  },
  
  copyText: {
    fontSize: 12,
    fontWeight: "600",
    color: Colors.primary,
    marginLeft: 4,
  },

  redeemBtn: {
    marginTop: 8,
    backgroundColor: Colors.primary,
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderRadius: 14,
    alignItems: "center",
    shadowColor: Colors.primary,
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 3,
  },

  redeemText: {
    color: "#fff",
    fontWeight: "700",
    fontSize: 16,
  },
  
  disabledButton: {
    opacity: 0.6,
  },

  emptyContainer: {
    marginTop: 200,
    alignItems: "center",
    paddingHorizontal: 40,
  },

  emptyTitle: {
    fontSize: 24,
    fontWeight: "700",
    color: Colors.primary,
    marginTop: 16,
  },
  
  emptySubtitle: {
    fontSize: 14,
    color: Colors.gray,
    marginTop: 8,
    textAlign: "center",
  },
});