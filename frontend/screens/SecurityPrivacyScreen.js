import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  StatusBar,
  Switch,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import LottieView from "lottie-react-native";
import { Colors, Typography } from '../constants/Colors';
import DatabaseService from '../services/securityprivacy_ds';
import devicesDatabaseService from '../services/loginactivity_ds';
import { useAuth } from '../context/AuthContext';

export default function SecurityPrivacyScreen({ navigation, route }) {
  const { user } = useAuth();
  const phoneNumber = user?.phone_number;

  const [contactVisibility, setContactVisibility] = useState(true);
  const [loginDevices, setLoginDevices] = useState(0);
  const [loading, setLoading] = useState(true);

  /* ================= LOAD DATA ================= */

  useEffect(() => {
    if (!phoneNumber) {
      console.warn('❌ SecurityPrivacyScreen: phoneNumber missing');
      setLoading(false);
      return;
    }

    loadSecuritySettings();
    loadDevices();
  }, [phoneNumber]);

  const loadSecuritySettings = async () => {
    try {
      const res = await DatabaseService.getSecuritySettings(phoneNumber);
      if (res?.success) {
        setContactVisibility(res.settings.contact_visibility);
      }
    } catch (e) {
      console.error('❌ Security settings error', e);
      Alert.alert('Error', 'Failed to load security settings');
    }
  };

  const loadDevices = async () => {
    try {
      const res = await devicesDatabaseService.getDevices(phoneNumber);
      if (res?.success) {
        setLoginDevices(res.devices.length);
      }
    } catch (e) {
      console.error('❌ Device load error', e);
    } finally {
      setLoading(false);
    }
  };

  /* ================= UPDATE ================= */

  const onToggleContactVisibility = async (value) => {
    setContactVisibility(value);

    try {
      await DatabaseService.updateSecuritySettings(phoneNumber, value);
    } catch (e) {
      Alert.alert('Error', 'Failed to update setting');
      setContactVisibility(!value); // rollback
    }
  };

  /* ================= UI ITEMS ================= */

  const settingsItems = [
    {
      id: 'contact',
      title: 'Contact Visibility',
      subtitle: contactVisibility ? 'Visible to others' : 'Hidden from others',
      type: 'toggle',
      value: contactVisibility,
      onValueChange: onToggleContactVisibility,
      icon: 'visibility',
    },
    {
      id: 'login',
      title: 'Login Activity',
      subtitle: `${loginDevices} Active Device${loginDevices !== 1 ? 's' : ''}`,
      type: 'action',
      screen: 'DeviceManagement',
      icon: 'device-hub',
    },
    {
      id: 'blocked',
      title: 'Blocked Users',
      subtitle: 'Manage blocked users',
      type: 'action',
      screen: 'BlockedUsers',
      icon: 'block',
    },
  ];

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
          <Text style={styles.headerTitle}>Security & Privacy</Text>
          <View style={styles.headerSpacer} />
        </View>

        {/* ===== CONTENT ===== */}
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          <View style={styles.mainCard}>
            <Text style={styles.sectionTitle}>Privacy Settings</Text>
            <Text style={styles.sectionSubtitle}>
              Control how your information is shared
            </Text>

            {settingsItems.map((item, index) => (
              <TouchableOpacity
                key={item.id}
                style={[
                  styles.settingItem,
                  index === settingsItems.length - 1 && styles.lastItem,
                ]}
                activeOpacity={item.type === 'toggle' ? 1 : 0.7}
                onPress={() => {
                  if (item.type === 'action') {
                    navigation.navigate(item.screen, { phoneNumber });
                  }
                }}
              >
                <View style={styles.settingLeft}>
                  <View style={styles.iconContainer}>
                    <MaterialIcons
                      name={item.icon}
                      size={22}
                      color={Colors.primary}
                    />
                  </View>

                  <View style={styles.settingInfo}>
                    <Text style={styles.settingTitle}>{item.title}</Text>
                    <Text style={styles.settingSubtitle}>{item.subtitle}</Text>
                  </View>
                </View>

                {item.type === 'toggle' ? (
                  <Switch
                    value={item.value}
                    onValueChange={item.onValueChange}
                    trackColor={{ false: '#E5E7EB', true: Colors.primary }}
                    thumbColor={Colors.white}
                  />
                ) : (
                  <MaterialIcons
                    name="chevron-right"
                    size={26}
                    color={Colors.orange1}
                    style={{ opacity: 0.4 }}
                  />
                )}
              </TouchableOpacity>
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
    backgroundColor: Colors.white 
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

  // Loader styles
  loaderContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.white,
  },

  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 40,
    paddingTop: 20,
  },

  mainCard: {
    backgroundColor: Colors.white,
    borderRadius: 20,
    paddingHorizontal: 18,
    paddingVertical: 20,
    borderWidth: 1,
    borderColor: '#F3F4F6',
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 8 },
    elevation: 4,
  },

  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.primary,
  },

  sectionSubtitle: {
    fontSize: 15,
    color: Colors.dark,
    marginTop: 6,
    marginBottom: 20,
    opacity: 0.7,
  },

  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 18,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },

  lastItem: { 
    borderBottomWidth: 0 
  },

  settingLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },

  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: 'rgba(59, 130, 246, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
  },

  settingInfo: { 
    flex: 1 
  },

  settingTitle: {
    fontSize: 16.5,
    fontWeight: '600',
    color: Colors.dark,
  },

  settingSubtitle: {
    fontSize: 14,
    color: Colors.dark,
    opacity: 0.6,
  },
});