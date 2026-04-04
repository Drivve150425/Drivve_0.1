import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  StatusBar,
  Switch,
    KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons, Ionicons } from '@expo/vector-icons';
import { Colors, Typography } from '../constants/Colors';
import DatabaseService from '../services/notificationscreen_ds';
import GETDatabaseService from '../services/usernotification_ds';

import { useAuth } from '../context/AuthContext';

export default function NotificationSettingsScreen({ navigation, route }) {
   const { user } = useAuth();
  const phoneNumber = user?.phone_number;


  const [notifications, setNotifications] = useState({
    rideUpdates: true,
    chatMessages: true,
    promotions: false,
    newsletters: false,
    smsAlerts: true,
  });

  /* ================= LOAD FROM BACKEND ================= */
  useEffect(() => {
    if (!phoneNumber) return;

    const loadSettings = async () => {
      const res = await GETDatabaseService.getNotifications(phoneNumber);
      if (res?.notifications) {
        setNotifications(res.notifications);
      }
    };

    loadSettings();
  }, [phoneNumber]);

  /* ================= TOGGLE + SAVE ================= */
  const toggleNotification = async (key) => {
    const updated = {
      ...notifications,
      [key]: !notifications[key],
    };

    setNotifications(updated);

    await DatabaseService.updateNotificationSettings(phoneNumber, updated);
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
                                     <Text style={styles.headerTitle}>Notification</Text>
                                     <View style={styles.headerSpacer} />
                                   </View>

      {/* CONTENT */}
      <ScrollView contentContainerStyle={styles.scrollContent}>

        {/* PUSH */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Push Notifications</Text>

          {[
            { id: 'rideUpdates', title: 'Ride Updates', subtitle: 'Ride status updates', icon: 'car-outline' },
            { id: 'chatMessages', title: 'Chat Messages', subtitle: 'New messages', icon: 'chatbubble-ellipses-outline' },
            { id: 'promotions', title: 'Promotions', subtitle: 'Offers & referrals', icon: 'pricetag-outline' },
          ].map((item, index, arr) => (
            <View key={item.id} style={[styles.row, index === arr.length - 1 && styles.lastRow]}>
              <View style={styles.iconWrapper}>
                <Ionicons name={item.icon} size={22} color={Colors.primary} />
              </View>

              <View style={styles.rowText}>
                <Text style={styles.rowTitle}>{item.title}</Text>
                <Text style={styles.rowSubtitle}>{item.subtitle}</Text>
              </View>

              <Switch
                value={notifications[item.id]}
                onValueChange={() => toggleNotification(item.id)}
                trackColor={{ false: '#E5E7EB', true: Colors.primary }}
                thumbColor={Colors.white}
              />
            </View>
          ))}
        </View>

        {/* EMAIL & SMS */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Email & SMS</Text>

          {[
            { id: 'newsletters', title: 'Email Subscriptions', subtitle: 'Newsletters', icon: 'mail-outline' },
            { id: 'smsAlerts', title: 'SMS Alerts', subtitle: 'Critical alerts only', icon: 'chatbox-outline' },
          ].map((item, index, arr) => (
            <View key={item.id} style={[styles.row, index === arr.length - 1 && styles.lastRow]}>
              <View style={styles.iconWrapper}>
                <Ionicons name={item.icon} size={22} color={Colors.primary} />
              </View>

              <View style={styles.rowText}>
                <Text style={styles.rowTitle}>{item.title}</Text>
                <Text style={styles.rowSubtitle}>{item.subtitle}</Text>
              </View>

              <Switch
                value={notifications[item.id]}
                onValueChange={() => toggleNotification(item.id)}
                trackColor={{ false: '#E5E7EB', true: Colors.primary }}
                thumbColor={Colors.white}
              />
            </View>
          ))}
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
    paddingTop: 20,
    paddingBottom: 40,
  },

  /* CARD */
  card: {
    backgroundColor: Colors.white,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#F3F4F6',
    marginBottom: 20,
    overflow: 'hidden',
  },

  cardTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.primary,
    paddingHorizontal: 16,
    paddingVertical: 14,
  },

  /* ROW */
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  lastRow: {
    borderBottomWidth: 0,
  },

  iconWrapper: {
    width: 42,
    height: 42,
    borderRadius: 12,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
  },

  rowText: {
    flex: 1,
    marginRight: 12,
  },
  rowTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.dark,
    marginBottom: 4,
  },
  rowSubtitle: {
    fontSize: 14,
    color: Colors.dark,
    opacity: 0.65,
    lineHeight: 18,
  },
});
