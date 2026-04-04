import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  StatusBar,
  Alert,
   KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons, Ionicons } from '@expo/vector-icons';
import { Colors, Typography } from '../constants/Colors';
import DatabaseService from '../services/loginactivity_ds';
import { useAuth } from '../context/AuthContext';

export default function DeviceManagementScreen({ navigation, route }) {
  const { user } = useAuth();
  const phoneNumber = user?.phone_number;
   const [devices, setDevices] = useState([]);
  const [loading, setLoading] = useState(true);

  /* ================= LOAD DEVICES ================= */
  useEffect(() => {
    loadDevices();
  }, []);

 const loadDevices = async () => {
  if (!phoneNumber) return;

  setLoading(true);
  console.log('🔥 Loading devices for:', phoneNumber);

  const res = await DatabaseService.getDevices(phoneNumber);

  console.log('🔥 Devices API response:', res);

  if (res?.success) {
    setDevices(res.devices || []);
  } else {
    setDevices([]);
  }

  setLoading(false);
};


  /* ================= LOGOUT SINGLE ================= */
  const handleLogoutDevice = (device) => {
    if (device.current) {
      Alert.alert(
        'Current Device',
        'You cannot log out from your current device'
      );
      return;
    }

    Alert.alert(
      'Log Out Device',
      `Log out from ${device.name}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Log Out',
          style: 'destructive',
          onPress: async () => {
            const res = await DatabaseService.logoutDevice(device.id);
            if (res?.success) {
              setDevices(prev =>
                prev.filter(d => d.id !== device.id)
              );
            }
          },
        },
      ]
    );
  };

  /* ================= LOGOUT ALL ================= */
  const handleLogoutAll = () => {
    Alert.alert(
      'Log Out All Devices',
      'You will be logged out from all other devices.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Log Out All',
          style: 'destructive',
          onPress: async () => {
            const otherDevices = devices.filter(d => !d.current);

            for (const d of otherDevices) {
              await DatabaseService.logoutDevice(d.id);
            }

            setDevices(prev => prev.filter(d => d.current));
          },
        },
      ]
    );
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
            Manage devices where you’re currently signed in
          </Text>

          {devices.map(device => (
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
                >
                  <Text style={styles.logoutText}>Log out</Text>
                </TouchableOpacity>
              )}
            </View>
          ))}

          <TouchableOpacity
            style={[
              styles.logoutAllButton,
              devices.filter(d => !d.current).length === 0 &&
                styles.disabledButton,
            ]}
            onPress={handleLogoutAll}
            disabled={devices.filter(d => !d.current).length === 0}
          >
            <MaterialIcons name="logout" size={20} color={Colors.white}/>
            <Text style={styles.logoutAllText}>
              Log out of all other devices
            </Text>
          </TouchableOpacity>

         
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
    top:10
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
    backgroundColor:Colors.primary,
    borderWidth: 1,
    borderColor: Colors.primary,
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
});
