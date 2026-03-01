import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  StatusBar,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Colors, Typography } from '../constants/Colors';
import { useAuth } from '../context/AuthContext';

export default function SettingsMainScreen({ navigation, route }) {
  const { user } = useAuth();
  const phoneNumber = user?.phone_number;

  /* ================= MENU ================= */
  const menuItems = [
    {
      id: 'security',
      title: 'Security & Privacy',
      icon: 'shield-checkmark-outline',
      description: 'Manage your security settings and privacy options',
      color: Colors.primary,
      screen: 'SecurityPrivacy',
    },
    {
      id: 'notification',
      title: 'Notification',
      icon: 'notifications-outline',
      description: 'Customize your notification preferences',
      color: '#34C759',
      screen: 'NotificationSettings',
    },
    {
      id: 'legal',
      title: 'Legal',
      icon: 'document-text-outline',
      description: 'Terms, conditions and policies',
      color: Colors.orange1,
      screen: 'Legal',
    },
    {
      id: 'account',
      title: 'Account Management',
      icon: 'person-outline',
      description: 'Manage your account settings',
      color: '#FF3B30',
      screen: 'AccountManagement',
    },
  ];

  /* ================= GUARD ================= */
  if (!phoneNumber) {
    return (
      <SafeAreaView style={styles.container}>
        <Text style={{ textAlign: 'center', marginTop: 40 }}>
          Loading settings…
        </Text>
      </SafeAreaView>
    );
  }

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
            size={28}
            color={Colors.orange1}
          />
        </TouchableOpacity>

        <Text style={styles.headerTitle}>Settings</Text>
        <View style={styles.headerSpacer} />
      </View>

      {/* ================= CONTENT ================= */}
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        <View style={styles.menuList}>
          {menuItems.map((item, index) => (
            <TouchableOpacity
              key={item.id}
              style={[
                styles.menuItem,
                index === menuItems.length - 1 && styles.lastItem,
              ]}
              activeOpacity={0.85}
              onPress={() =>
                navigation.navigate(item.screen, {
                  phone_number: phoneNumber, // ✅ ALWAYS PASSED
                })
              }
            >
              <View
                style={[
                  styles.menuIcon,
                  { backgroundColor: `${item.color}18` },
                ]}
              >
                <Ionicons name={item.icon} size={24} color={item.color} />
              </View>

              <View style={styles.menuText}>
                <Text style={styles.menuTitle}>{item.title}</Text>
                <Text style={styles.menuDescription}>
                  {item.description}
                </Text>
              </View>

              <MaterialIcons
                name="chevron-right"
                size={26}
                color={Colors.dark}
                style={{ opacity: 0.4 }}
              />
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

/* ================= STYLES ================= */

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.white },

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

  headerSpacer: { width: 44 },

  scrollContent: {
    paddingHorizontal: 16,
    paddingBottom: 40,
    paddingTop: 20,
  },

  menuList: {
    backgroundColor: Colors.white,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: '#F3F4F6',
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
    elevation: 4,
  },

  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 18,
    paddingHorizontal: 18,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },

  lastItem: { borderBottomWidth: 0 },

  menuIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },

  menuText: { flex: 1 },

  menuTitle: {
    fontSize: 16.5,
    fontWeight: '600',
    color: Colors.dark,
    marginBottom: 3,
  },

  menuDescription: {
    fontSize: 13.5,
    color: Colors.dark,
    opacity: 0.65,
    lineHeight: 18,
  },
});
