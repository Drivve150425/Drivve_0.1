import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  StatusBar,
  Modal,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import LottieView from "lottie-react-native";
import { Colors, Typography } from '../constants/Colors';
import DatabaseService from '../services/accountmanagement_ds';
import { useAuth } from '../context/AuthContext';
import CustomAlert from '../components/CustomAlert';

export default function AccountManagementScreen({ navigation, route }) {
  const { user, logout } = useAuth();

  const phone_number = user?.phone_number;

  const [showDeactivateModal, setShowDeactivateModal] = useState(false);
  const [deactivateReason, setDeactivateReason] = useState('');
  const [loading, setLoading] = useState(false);
  const [pageLoading, setPageLoading] = useState(true);
  
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
        { text: 'Deactivate', onPress: () => {
          setAlertVisible(false);
          onConfirm();
        }, style: 'destructive' }
      ]
    });
    setAlertVisible(true);
  };

  /* ================= INITIAL LOAD ================= */
  React.useEffect(() => {
    // Simulate minimal loading time for consistency
    const timer = setTimeout(() => {
      setPageLoading(false);
    }, 500);
    
    return () => clearTimeout(timer);
  }, []);

  /* ================= CONFIRM MODAL ================= */
  const handleDeactivate = () => {
    if (!deactivateReason.trim()) {
      showCustomAlert('Required', 'Please provide a reason for deactivation.', 'warning');
      return;
    }

    showConfirmationAlert(
      'Deactivate Account',
      'Your account will be disabled immediately. If you log in within 30 days, your account will be restored automatically. Otherwise, it will be permanently deleted after 30 days.',
      confirmDeactivate
    );
  };

  /* ================= API CALL ================= */
  const confirmDeactivate = async () => {
    if (!phone_number) {
      showCustomAlert('Error', 'Phone number not found.', 'error');
      return;
    }

    setLoading(true);

    try {
      const res = await DatabaseService.deactivateAccount(
        phone_number,
        deactivateReason
      );

      if (res?.success) {
        setShowDeactivateModal(false);
        setDeactivateReason('');
        await logout();
        showCustomAlert(
          'Account Deactivated',
          'Your account has been deactivated.\n\nIt will be permanently deleted after 30 days.',
          'success'
        );
        setTimeout(() => {
          navigation.reset({
            index: 0,
            routes: [{ name: 'Login' }],
          });
        }, 2000);
      } else {
        showCustomAlert(
          'Error',
          res?.message || 'Failed to deactivate account. Please try again.',
          'error'
        );
      }
    } catch (error) {
      console.error("Error deactivating account:", error);
      showCustomAlert('Error', 'Failed to deactivate account. Please try again.', 'error');
    } finally {
      setLoading(false);
    }
  };
  
  const handleBack = () => {
    navigation.goBack();
  };

  // Show loader while page is initializing
  if (pageLoading) {
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
          <Text style={styles.headerTitle}>Account Management</Text>
          <View style={styles.headerSpacer} />
        </View>

        {/* ================= CONTENT ================= */}
        <ScrollView contentContainerStyle={styles.scrollContent}>
          <View style={styles.mainCard}>
            <Text style={styles.sectionTitle}>Deactivate Account</Text>
            <Text style={styles.sectionSubtitle}>
              Temporarily deactivate your account. You can restore it within 30 days before it is permanently deleted.
            </Text>

            {/* WARNING */}
            <View style={styles.warningBox}>
              {/* Top Row (Icon + Title same line) */}
              <View style={styles.warningHeader}>
                <MaterialIcons name="warning" size={22} color={Colors.primary} style={{ marginLeft: -4 }} />
                <Text style={styles.warningTitle}>Before you continue</Text>
              </View>

              {/* Bullet Points BELOW */}
              {[
                'Your account will be deactivated immediately',
                'You will be logged out of all devices',
                'Your data will be permanently deleted after 30 days',
                'This action cannot be undone after deletion',
              ].map((item, index) => (
                <View key={index} style={styles.bulletRow}>
                  <Text style={styles.bullet}>•</Text>
                  <Text style={styles.bulletText}>{item}</Text>
                </View>
              ))}
            </View>

            {/* ACTION */}
            <TouchableOpacity
              style={styles.deactivateButton}
              onPress={() => setShowDeactivateModal(true)}
              activeOpacity={0.8}
            >
              <Text style={styles.deactivateButtonText}>
                Deactivate Account
              </Text>
            </TouchableOpacity>
          </View>
        </ScrollView>

        {/* ================= MODAL ================= */}
        <Modal visible={showDeactivateModal} transparent animationType="fade">
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>Confirm Deactivation</Text>
              <Text style={styles.modalSubtitle}>
                Please tell us why you're leaving (optional but helpful).
              </Text>

              <TextInput
                style={styles.reasonInput}
                placeholder="Enter your reason..."
                placeholderTextColor="#9CA3AF"
                multiline
                numberOfLines={4}
                value={deactivateReason}
                onChangeText={setDeactivateReason}
                editable={!loading}
              />

              <View style={styles.modalButtons}>
                <TouchableOpacity
                  style={[styles.modalButton, styles.cancelButton]}
                  onPress={() => {
                    setShowDeactivateModal(false);
                    setDeactivateReason('');
                  }}
                  disabled={loading}
                >
                  <Text style={styles.cancelButtonText}>Cancel</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[
                    styles.modalButton,
                    styles.deactivateModalButton,
                    loading && styles.disabledButton,
                  ]}
                  onPress={handleDeactivate}
                  disabled={loading}
                >
                  {loading ? (
                    <ActivityIndicator size="small" color={Colors.white} />
                  ) : (
                    <Text style={styles.deactivateModalText}>Deactivate</Text>
                  )}
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>
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
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 3,
    },
    shadowOpacity: 0.1,
    shadowRadius: 6,
  },
  
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: Colors.primary,
  },
  
  sectionSubtitle: {
    fontSize: 17,
    color: Colors.dark,
    opacity: 0.7,
    marginTop: 6,
    marginBottom: 20,
  },

  warningBox: {
    borderWidth: 1,
    borderColor: '#1F3B6F',
    borderRadius: 16,
    padding: 14,
    marginBottom: 24,
  },

  warningHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },

  warningTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1F3B6F',
    marginLeft: 8,
  },

  bulletRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 4,
  },

  bullet: {
    fontSize: 16,
    marginRight: 6,
    lineHeight: 20,
    color: '#374151',
  },

  bulletText: {
    flex: 1,
    fontSize: 16,
    color: '#374151',
    lineHeight: 20,
  },

  deactivateButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    backgroundColor: Colors.primary,
    borderRadius: 14,
    paddingVertical: 16,
  },
  
  deactivateButtonText: {
    color: Colors.white,
    fontSize: 18,
    fontWeight: '700',
  },

  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.45)',
    justifyContent: 'center',
    padding: 20,
  },
  
  modalContent: {
    backgroundColor: Colors.white,
    borderRadius: 18,
    padding: 24,
  },
  
  modalTitle: {
    fontSize: 22,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 8,
    color: Colors.primary,
  },
  
  modalSubtitle: {
    fontSize: 15,
    textAlign: 'center',
    opacity: 0.7,
    marginBottom: 20,
  },
  
  reasonInput: {
    borderWidth: 1,
    borderColor: '#F3F4F6',
    borderRadius: 12,
    padding: 14,
    minHeight: 100,
    marginBottom: 24,
    backgroundColor: '#F9FAFB',
    textAlignVertical: 'top',
    fontSize: 14,
    color: Colors.dark,
  },

  modalButtons: { 
    flexDirection: 'row', 
    gap: 12 
  },
  
  modalButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
  },
  
  cancelButton: { 
    backgroundColor: '#F3F4F6' 
  },
  
  cancelButtonText: { 
    fontWeight: '600',
    color: Colors.dark,
  },
  
  deactivateModalButton: { 
    backgroundColor: '#FF3B30' 
  },
  
  deactivateModalText: {
    color: Colors.white,
    fontWeight: '700',
  },
  
  disabledButton: {
    opacity: 0.6,
  },
});