import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  StatusBar,
  Alert,
  Modal,
  TextInput,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { Colors, Typography } from '../constants/Colors';
import DatabaseService from '../services/DatabaseService';

export default function AccountManagementScreen({ navigation, route }) {
  const phone_number = route?.params?.phone_number;

  const [showDeactivateModal, setShowDeactivateModal] = useState(false);
  const [deactivateReason, setDeactivateReason] = useState('');
  const [loading, setLoading] = useState(false);

  /* ================= CONFIRM MODAL ================= */
  const handleDeactivate = () => {
    if (!deactivateReason.trim()) {
      Alert.alert('Required', 'Please provide a reason for deactivation.');
      return;
    }

    Alert.alert(
      'Deactivate Account',
'Your account will be disabled immediately. If you log in within 30 days, your account will be restored automatically. Otherwise, it will be permanently deleted after 30 days.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Deactivate',
          style: 'destructive',
          onPress: confirmDeactivate,
        },
      ]
    );
  };

  /* ================= API CALL ================= */
  const confirmDeactivate = async () => {
    if (!phone_number) {
      Alert.alert('Error', 'Phone number not found.');
      return;
    }

    setLoading(true);

    const res = await DatabaseService.deactivateAccount(
      phone_number,
      deactivateReason
    );

    setLoading(false);

    if (res?.success) {
      setShowDeactivateModal(false);
      setDeactivateReason('');

      Alert.alert(
        'Account Deactivated',
        'Your account has been deactivated.\n\nIt will be permanently deleted after 30 days.',
        [
          {
            text: 'OK',
            onPress: () =>
              navigation.reset({
                index: 0,
                routes: [{ name: 'Login' }],
              }),
          },
        ]
      );
    } else {
      Alert.alert(
        'Error',
        res?.message || 'Failed to deactivate account. Please try again.'
      );
    }
  };

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

        <Text style={styles.headerTitle}>Account Management</Text>
        <View style={styles.headerSpacer} />
      </View>

      {/* ================= CONTENT ================= */}
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.mainCard}>
          <Text style={styles.sectionTitle}>Deactivate Account</Text>
          <Text style={styles.sectionSubtitle}>
            Temporarily disable your account. It will be permanently deleted
            after 30 days.
          </Text>

          {/* WARNING */}
          <View style={styles.warningBox}>
            <MaterialIcons name="warning" size={24} color="#D32F2F" />
            <View style={styles.warningText}>
              <Text style={styles.warningTitle}>Read carefully</Text>
              <Text style={styles.warningDescription}>
                • Your account will be disabled immediately{'\n'}
                • You will be logged out from all devices{'\n'}
                • Your data will be permanently deleted after 30 days{'\n'}
                • This action cannot be undone
              </Text>
            </View>
          </View>

          {/* ACTION */}
          <TouchableOpacity
            style={styles.deactivateButton}
            onPress={() => setShowDeactivateModal(true)}
            activeOpacity={0.8}
          >
            <MaterialIcons
              name="person-remove"
              size={24}
              color={Colors.white}
            />
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
              Please tell us why you’re leaving (optional but helpful).
            </Text>

            <TextInput
              style={styles.reasonInput}
              placeholder="Enter your reason..."
              placeholderTextColor="#9CA3AF"
              multiline
              numberOfLines={4}
              value={deactivateReason}
              onChangeText={setDeactivateReason}
            />

            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => {
                  setShowDeactivateModal(false);
                  setDeactivateReason('');
                }}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.modalButton,
                  styles.deactivateModalButton,
                ]}
                onPress={handleDeactivate}
                disabled={loading}
              >
                <Text style={styles.deactivateModalText}>
                  {loading ? 'Deactivating…' : 'Deactivate'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

/* ================= STYLES ================= */

const styles = StyleSheet.create({
  container: {
    flex: 1,
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
  headerSpacer: { width: 44 },

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
  },

  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.primary,
  },
  sectionSubtitle: {
    fontSize: 15,
    color: Colors.dark,
    opacity: 0.7,
    marginTop: 6,
    marginBottom: 20,
  },

  warningBox: {
    flexDirection: 'row',
    backgroundColor: '#FFEBEE',
    borderRadius: 14,
    padding: 16,
    borderWidth: 1,
    borderColor: '#FFCDD2',
    marginBottom: 24,
  },
  warningText: { flex: 1, marginLeft: 12 },
  warningTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#D32F2F',
    marginBottom: 6,
  },
  warningDescription: {
    fontSize: 14,
    color: '#D32F2F',
    lineHeight: 20,
  },

  deactivateButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    backgroundColor: '#FF3B30',
    borderRadius: 14,
    paddingVertical: 16,
  },
  deactivateButtonText: {
    color: Colors.white,
    fontSize: 16,
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
  },

  modalButtons: { flexDirection: 'row', gap: 12 },
  modalButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
  },
  cancelButton: { backgroundColor: '#F3F4F6' },
  cancelButtonText: { fontWeight: '600' },
  deactivateModalButton: { backgroundColor: '#FF3B30' },
  deactivateModalText: {
    color: Colors.white,
    fontWeight: '700',
  },
});
