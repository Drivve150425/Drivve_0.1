import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  StatusBar,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons, Ionicons } from '@expo/vector-icons';
import LottieView from "lottie-react-native";
import { Colors, Typography } from '../constants/Colors';
import DatabaseService from '../services/loginactivity_ds';
import { useAuth } from '../context/AuthContext';
import CustomAlert from '../components/CustomAlert';

export default function DeviceManagementScreen({ navigation, route }) {
  const { user } = useAuth();
  const phoneNumber = user?.phone_number;
  const [devices, setDevices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [logoutDeviceId, setLogoutDeviceId] = useState(null);
  const [loggingOutAll, setLoggingOutAll] = useState(false);
  
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
        { text: 'Confirm', onPress: () => {
          setAlertVisible(false);
          onConfirm();
        }, style: 'destructive' }
      ]
    });
    setAlertVisible(true);
  };

  /* ================= LOAD DEVICES ================= */
  useEffect(() => {
    loadDevices();
  }, []);

  const loadDevices = async () => {
    if (!phoneNumber) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      console.log('🔥 Loading devices for:', phoneNumber);

      const res = await DatabaseService.getDevices(phoneNumber);

      console.log('🔥 Devices API response:', res);

      if (res?.success) {
        setDevices(res.devices || []);
      } else {
        setDevices([]);
      }
    } catch (error) {
      console.error("Error loading devices:", error);
      showCustomAlert("Error", "Failed to load devices", "error");
    } finally {
      setLoading(false);
    }
  };

  /* ================= LOGOUT SINGLE ================= */
  const handleLogoutDevice = (device) => {
    if (device.current) {
      showCustomAlert(
        'Current Device',
        'You cannot log out from your current device',
        'warning'
      );
      return;
    }

    showConfirmationAlert(
      'Log Out Device',
      `Log out from ${device.name}?`,
      async () => {
        setLogoutDeviceId(device.id);
        try {
          const res = await DatabaseService.logoutDevice(device.id);
          if (res?.success) {
            setDevices(prev =>
              prev.filter(d => d.id !== device.id)
            );
            showCustomAlert("Success", `Logged out from ${device.name}`, "success");
          } else {
            showCustomAlert("Error", "Failed to log out device", "error");
          }
        } catch (error) {
          console.error("Error logging out device:", error);
          showCustomAlert("Error", "Failed to log out device", "error");
        } finally {
          setLogoutDeviceId(null);
        }
      }
    );
  };

  /* ================= LOGOUT ALL ================= */
  const handleLogoutAll = () => {
    const otherDevices = devices.filter(d => !d.current);
    
    if (otherDevices.length === 0) {
      showCustomAlert("No Devices", "No other devices to log out", "info");
      return;
    }

    showConfirmationAlert(
      'Log Out All Devices',
      `You will be logged out from ${otherDevices.length} other device${otherDevices.length !== 1 ? 's' : ''}.`,
      async () => {
        setLoggingOutAll(true);
        try {
          const otherDevices = devices.filter(d => !d.current);
          let successCount = 0;

          for (const d of otherDevices) {
            const res = await DatabaseService.logoutDevice(d.id);
            if (res?.success) {
              successCount++;
            }
          }

          setDevices(prev => prev.filter(d => d.current));
          
          if (successCount > 0) {
            showCustomAlert("Success", `Logged out from ${successCount} device${successCount !== 1 ? 's' : ''}`, "success");
          }
        } catch (error) {
          console.error("Error logging out all devices:", error);
          showCustomAlert("Error", "Failed to log out all devices", "error");
        } finally {
          setLoggingOutAll(false);
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

  const otherDevicesCount = devices.filter(d => !d.current).length;

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
          <Text style={styles.headerTitle}>Login Activity</Text>
          <View style={styles.headerSpacer} />
        </View>

        {/* CONTENT */}
        <ScrollView contentContainerStyle={styles.scrollContent}>
          <View style={styles.mainCard}>
            <View style={styles.infoBox}>
              <MaterialIcons name="info" size={20} color={Colors.primary} />
              <Text style={styles.infoText}>
                Logging out will require you to sign in again on that device.
              </Text>
            </View>
            
            <Text style={styles.sectionTitle}>Active Sessions</Text>
            <Text style={styles.sectionSubtitle}>
              Manage devices where you're currently signed in
            </Text>

            {devices.length === 0 ? (
              <View style={styles.emptyState}>
                <Ionicons name="phone-portrait-outline" size={64} color={Colors.primary} />
                <Text style={styles.emptyText}>No active sessions found</Text>
              </View>
            ) : (
              devices.map(device => (
                <View key={device.id} style={styles.deviceItem}>
                  <View style={styles.deviceIcon}>
                    <Ionicons
                      name={
                        device.type === 'desktop'
                          ? 'laptop-outline'
                          : device.type === 'tablet'
                          ? 'tablet-portrait-outline'
                          : 'phone-portrait-outline'
                      }
                      size={22}
                      color={device.current ? Colors.primary : Colors.dark}
                    />
                  </View>

                  <View style={styles.deviceInfo}>
                    <Text style={styles.deviceName}>{device.name}</Text>
                    <Text
                      style={[
                        styles.deviceStatus,
                        device.current && styles.activeText,
                      ]}
                    >
                      {device.current ? 'Active now' : 'Last active'}
                    </Text>
                  </View>

                  {device.current ? (
                    <View style={styles.currentBadge}>
                      <Text style={styles.currentBadgeText}>Current</Text>
                    </View>
                  ) : (
                    <TouchableOpacity
                      style={styles.logoutButton}
                      onPress={() => handleLogoutDevice(device)}
                      disabled={logoutDeviceId === device.id}
                    >
                      {logoutDeviceId === device.id ? (
                        <ActivityIndicator size="small" color={Colors.white} />
                      ) : (
                        <Text style={styles.logoutText}>Log out</Text>
                      )}
                    </TouchableOpacity>
                  )}
                </View>
              ))
            )}

            <TouchableOpacity
              style={[
                styles.logoutAllButton,
                otherDevicesCount === 0 && styles.disabledButton,
              ]}
              onPress={handleLogoutAll}
              disabled={otherDevicesCount === 0 || loggingOutAll}
            >
              {loggingOutAll ? (
                <ActivityIndicator size="small" color={Colors.white} />
              ) : (
                <>
                  <MaterialIcons name="logout" size={20} color={Colors.white} />
                  <Text style={styles.logoutAllText}>
                    Log out of all other devices
                  </Text>
                </>
              )}
            </TouchableOpacity>
          </View>
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

  // Loader styles
  loaderContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.white,
  },

  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 40,
  },

  mainCard: {
    backgroundColor: Colors.white,
    borderRadius: 20,
    padding: 18,
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
    marginTop: 10,
  },
  
  sectionSubtitle: {
    fontSize: 16,
    color: Colors.dark,
    opacity: 0.7,
    marginTop: 12,
    marginBottom: 20,
  },

  deviceItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },

  deviceIcon: {
    width: 42,
    height: 42,
    borderRadius: 12,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
  },

  deviceInfo: {
    flex: 1,
  },
  
  deviceName: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.dark,
    marginBottom: 4,
  },
  
  deviceStatus: {
    fontSize: 14,
    color: Colors.dark,
    opacity: 0.6,
  },
  
  activeText: {
    color: Colors.primary,
    opacity: 1,
  },

  currentBadge: {
    backgroundColor: '#E8F5E9',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  
  currentBadgeText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#2E7D32',
  },

  logoutButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    backgroundColor: Colors.primary,
    minWidth: 70,
    alignItems: 'center',
  },
  
  logoutText: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.white,
  },

  logoutAllButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    padding: 16,
    borderRadius: 12,
    backgroundColor: Colors.primary,
    marginTop: 20,
    marginBottom: 24,
  },
  
  disabledButton: {
    opacity: 0.5,
  },
  
  logoutAllText: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.white,
  },

  infoBox: {
    flexDirection: 'row',
    backgroundColor: '#E3F2FD',
    borderRadius: 12,
    padding: 16,
    gap: 12,
    borderWidth: 1,
    borderColor: '#BBDEFB',
  },
  
  infoText: {
    flex: 1,
    fontSize: 14,
    color: Colors.primary,
    lineHeight: 20,
  },

  emptyState: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  
  emptyText: {
    fontSize: 16,
    color: Colors.dark,
    opacity: 0.6,
    marginTop: 12,
    textAlign: 'center',
  },
});