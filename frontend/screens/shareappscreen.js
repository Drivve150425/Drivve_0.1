import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  StatusBar,
  Share,
   KeyboardAvoidingView,
  Platform,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons, MaterialIcons } from "@expo/vector-icons";
import DatabaseService from "../services/shareapp_ds";
import { useAuth } from "../context/AuthContext";

/* ================= COLORS ================= */
import { Colors, Typography } from '../constants/Colors';

export default function ShareAppScreen({ navigation, route }) {
  const referralCode = "CARPOOL123";
  const appLink = "https://drivve.app/download";

  const { user } = useAuth();
  const phoneNumber = user?.phone_number;

  const [shareCount, setShareCount] = useState(0);

  /* ================= FETCH SHARE COUNT ================= */
  useEffect(() => {
    const fetchShareStats = async () => {
      if (!phoneNumber) return;

      const cleanPhone = phoneNumber.replace(/\s/g, "");
      const res = await DatabaseService.getShareStats(cleanPhone);

      if (res?.share_count !== undefined) {
        setShareCount(res.share_count);
      }
    };

    fetchShareStats();
  }, [phoneNumber]);

  /* ================= SHARE HANDLER ================= */
  const handleShare = async () => {
    try {
      if (!phoneNumber) return;

      const result = await Share.share({
        message: `Join DRIVVE 🚗
Use my referral code: ${referralCode}
Download: ${appLink}`,
      });

      if (result.action === Share.sharedAction) {
        const cleanPhone = phoneNumber.replace(/\s/g, "");

        await DatabaseService.trackShare({
          phone_number: cleanPhone,
          referral_code: referralCode,
        });

        // 🔄 Refresh count after share
        const res = await DatabaseService.getShareStats(cleanPhone);
        if (res?.share_count !== undefined) {
          setShareCount(res.share_count);
        }
      }
    } catch (e) {
      console.error("❌ Share error:", e);
    }
  };

  const handleCopy = async () => {
    await Share.share({ message: referralCode });
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
                <Text style={styles.headerTitle}>Refer & Earn</Text>
                <View style={styles.headerSpacer} />
              </View>
   
      {/* ================= CONTENT ================= */}
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        <View style={styles.mainCard}>
          {/* Invite Friends */}
          <Text style={styles.sectionTitle}>Invite Friends</Text>
          <Text style={styles.sectionSubtitle}>
            Share your unique code or link to invite friends and earn rewards
            when they join and complete their first ride.
          </Text>

          {/* Referral Code */}
          <Text style={styles.label}>Your Referral Code</Text>

          <View style={styles.codeRow}>
            <Text style={styles.codeText}>{referralCode}</Text>

            <TouchableOpacity style={styles.copyBtn} onPress={handleCopy}>
              <Ionicons name="copy-outline" size={18} color={Colors.dark} />
              <Text style={styles.copyText}>Copy Code</Text>
            </TouchableOpacity>
          </View>

          {/* Share Link */}
          <TouchableOpacity
            style={styles.shareLinkBtn}
            onPress={handleShare}
            activeOpacity={0.9}
          >
            <Text style={styles.shareLinkText}>Share Link</Text>
            <Ionicons
              name="share-social-outline"
              size={18}
              color={Colors.white}
            />
          </TouchableOpacity>

          {/* Divider */}
          <View style={styles.divider} />

          {/* Progress */}
          <Text style={styles.sectionTitle}>Your Progress</Text>
          <Text style={styles.sectionSubtitle}>
            Track your successful referrals and the rewards you’ve earned so far.
          </Text>

          <View style={styles.progressRow}>
            <View style={styles.progressBox}>
              <Ionicons
                name="people-outline"
                size={26}
                color={Colors.orange1}   // 🔥 ORANGE ICON
              />
              <Text style={styles.progressValue}>{shareCount}</Text>
              <Text style={styles.progressLabel}>
                Successful Referrals
              </Text>
            </View>

            <View style={styles.progressBox}>
              <Ionicons
                name="gift-outline"
                size={26}
                color={Colors.orange1}   // 🔥 ORANGE ICON
              />
              <Text style={styles.progressValue}>₹{shareCount * 25}</Text>
              <Text style={styles.progressLabel}>Rewards Earned</Text>
            </View>
          </View>
        </View>
      </ScrollView>
                  </KeyboardAvoidingView>
      
    </SafeAreaView>
  );
}

/* ================= STYLES ================= */
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.white,
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
  headerSpacer: {
    width: 44,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 40,
    paddingTop: 20,
  },

  mainCard: {
  backgroundColor: Colors.white,
  borderRadius: 16,
  padding: 16,
  borderWidth: 1,
  borderColor: "#F3F4F6",

  // 🔥 Shadow (iOS)
  shadowColor: "#000",
  shadowOffset: { width: 0, height: 4 },
  shadowOpacity: 0.08,
  shadowRadius: 10,

  // 🔥 Android
  elevation: 4,
},
  sectionTitle: {
     ...Typography.h1,
    fontSize: 20,
    fontWeight: "700",
    color: Colors.primary,
  },

  sectionSubtitle: {
    fontSize: 18,
    color: Colors.dark,
    marginTop: 6,
    marginBottom: 6,
  },

  label: {
     ...Typography.h2,
    fontSize: 18,
    color: Colors.primary,
    fontWeight: "600",
    marginBottom: 8,
  },

  codeRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderWidth: 1.5,
    borderColor: Colors.primary,
    borderRadius: 14,
    padding: 14,
    marginBottom: 16,
  },

  codeText: {
    fontSize: 16,
    fontWeight: "700",
    color: Colors.dark,
  },

  copyBtn: {
    flexDirection: "row",
    alignItems: "center",
  },

  copyText: {
    marginLeft: 6,
    fontSize: 14,
    color: Colors.dark, // 🔥 BLACK
    fontWeight: "700",
  },

  shareLinkBtn: {
     ...Typography.button,

    backgroundColor: Colors.primary,
    borderRadius: 16,
    paddingVertical: 16,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 0,
  },

  shareLinkText: {
    color: Colors.white,
    fontSize: 16,
    fontWeight: "700",
    marginRight: 8,
  },

  divider: {
    height: 1,
    backgroundColor: "#E5E7EB",
    marginVertical: 20,
  },

  progressRow: {
    flexDirection: "row",
    justifyContent: "space-between",
  },

  progressBox: {
    width: "48%",
    borderWidth: 1.5,
    borderColor: Colors.primary,
    borderRadius: 16,
    padding: 18,
    alignItems: "center",
    marginTop:5
  },

  progressValue: {
    fontSize: 22,
    fontWeight: "700",
    marginTop: 8,
    color: Colors.primary,
  },

  progressLabel: {
    fontSize: 13,
    color: Colors.dark,
    marginTop: 6,
    textAlign: "center",
    fontWeight: "500",
  },
});
