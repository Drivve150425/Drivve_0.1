import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  StatusBar,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons, MaterialIcons } from "@expo/vector-icons";
import CommonHeader from "../components/CommonHeader";

import DatabaseService from "../services/usernotification_ds";
import { Colors, Typography } from "../constants/Colors";
import { scale, verticalScale, moderateScale } from 'react-native-size-matters';
import { useAuth } from "../context/AuthContext";

/* ================= SCREEN ================= */
export default function NotificationScreen({ navigation, route }) {
  const { user } = useAuth();
  const phoneNumber = user?.phone_number;

  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  /* ================= FETCH ================= */
  useEffect(() => {
    fetchNotifications();
  }, []);

  const fetchNotifications = async () => {
    try {
      if (!phoneNumber) return;

      const cleanPhone = phoneNumber.replace(/\s/g, "");
      const res = await DatabaseService.getNotifications(cleanPhone);

      if (res?.notifications) {
        setNotifications(res.notifications);
      }
    } catch (e) {
      console.error("❌ Notification fetch error:", e);
    } finally {
      setLoading(false);
    }
  };

  /* ================= ACTION ================= */
  const openNotification = async (item) => {
    try {
      if (!item.is_read) {
        await DatabaseService.markNotificationRead(item.id);
      }

      if (item.action_type === "document") {
        navigation.navigate("MyDocuments");
      } else if (item.action_type === "wallet") {
        navigation.navigate("Wallet");
      } else if (item.action_type === "ride") {
        navigation.navigate("MyRides");
      }
    } catch (e) {
      console.error("❌ Open notification error:", e);
    }
  };

  const clearAll = async () => {
    if (!phoneNumber) return;

    await DatabaseService.clearNotifications(
      phoneNumber.replace(/\s/g, "")
    );
    setNotifications([]);
  };

  /* ================= UI ================= */
  return (
    <SafeAreaView style={styles.container}>
      <StatusBar backgroundColor={Colors.white} barStyle="dark-content" />

    <CommonHeader
    title="Notifications"
    rightIcon={
      <Text style={{ 
        color: Colors.orange1, 
        fontWeight: "700",
        fontSize: moderateScale(14)
      }}>
        Clear
      </Text>
    }
    onRightPress={clearAll}
  />
      {/* ================= CONTENT ================= */}
      {loading ? (
        <View style={styles.loader}>
          <ActivityIndicator size="large" color={Colors.primary} />
        </View>
      ) : notifications.length === 0 ? (
        <View style={styles.empty}>
          <Ionicons
            name="notifications-outline"
            size={64}
            color={Colors.borderGray}
          />
          <Text style={styles.emptyTitle}>No Notifications</Text>
          <Text style={styles.emptyText}>
            You’re all caught up. New alerts will appear here.
          </Text>
        </View>
      ) : (
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.list}
        >
          {notifications.map(item => (
            <TouchableOpacity
              key={item.id}
              style={[
                styles.card,
                !item.is_read && styles.unreadCard
              ]}
              activeOpacity={0.85}
              onPress={() => openNotification(item)}
            >
              <View style={styles.iconBox}>
                <Ionicons
                  name={getIcon(item.type)}
                  size={22}
                  color={Colors.orange1}
                />
              </View>

              <View style={styles.content}>
                <Text style={styles.title}>{item.title}</Text>
                <Text style={styles.message}>{item.message}</Text>
                <Text style={styles.time}>
                  {formatDate(item.created_at)}
                </Text>
              </View>

              {!item.is_read && <View style={styles.dot} />}
            </TouchableOpacity>
          ))}
        </ScrollView>
      )}
    </SafeAreaView>
  );
}

/* ================= HELPERS ================= */
const getIcon = (type) => {
  switch (type) {
    case "reward":
      return "gift-outline";
    case "document":
      return "document-text-outline";
    case "ride":
      return "car-outline";
    case "promotion":
      return "pricetag-outline";
    default:
      return "notifications-outline";
  }
};

const formatDate = (date) => {
  const d = new Date(date);
  return d.toLocaleDateString() + " • " + d.toLocaleTimeString();
};

/* ================= STYLES ================= */
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.white,
  },

  list: {
    padding: 16,
    paddingBottom: 40,
  },

  card: {
    flexDirection: "row",
    padding: 14,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: Colors.borderGray,
    backgroundColor: "#F9FAFB",
    marginBottom: 12,
    alignItems: "center",
  },

  unreadCard: {
    backgroundColor: "#FFF7ED",
    borderColor: Colors.orange1,
  },

  iconBox: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: "#FFEAD5",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },

  content: {
    flex: 1,
  },

  title: {
    fontSize: 15,
    fontWeight: "700",
    color: Colors.primary,
  },

  message: {
    fontSize: 14,
    color: Colors.dark,
    marginTop: 2,
  },

  time: {
    fontSize: 11,
    color: "#6B7280",
    marginTop: 6,
  },

  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.orange1,
  },

  loader: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },

  empty: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 40,
  },

  emptyTitle: {
    fontSize: 20,
    fontWeight: "700",
    marginTop: 16,
    color: Colors.primary,
  },

  emptyText: {
    fontSize: 14,
    textAlign: "center",
    marginTop: 8,
    color: "#6B7280",
  },
});
