import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  ActivityIndicator,
} from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import axios from 'axios';
import { API_BASE_URL } from "../config/config_ip";
import { useAuth } from '../context/AuthContext';

export default function StartRideConfirmScreen({ route, navigation }) {
  const { rideId, ride } = route.params || {};
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);

  const handleStartRide = async () => {
    try {
      setLoading(true);
      const res = await axios.post(`${API_BASE_URL}/ride-sessions/start/${rideId}`, {
        driver_phone: user?.phonenumber,
      });

      navigation.replace('OngoingRideDriverScreen', {
        rideId,
        sessionId: res.data.session_id,
      });
    } catch (error) {
      console.log('Start ride error:', error?.response?.data || error.message);
      alert(error?.response?.data?.detail || 'Could not start ride');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#184080" />
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.iconBtn}>
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Ready to Start</Text>
        <View style={styles.iconBtn} />
      </View>

      <View style={styles.content}>
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Route Details</Text>
          <Text style={styles.label}>Pickup</Text>
          <Text style={styles.value}>{ride?.origin || '-'}</Text>
          <Text style={[styles.label, { marginTop: 18 }]}>Drop-off</Text>
          <Text style={styles.value}>{ride?.destination || '-'}</Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Ride Information</Text>
          <View style={styles.row}>
            <Text style={styles.rowLabel}>Ride ID</Text>
            <Text style={styles.rowValue}>#{rideId}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.rowLabel}>Seats</Text>
            <Text style={styles.rowValue}>{ride?.available_seats || ride?.availableSeats || '-'}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.rowLabel}>Price / Seat</Text>
            <Text style={styles.rowValue}>₹{ride?.price_per_seat || ride?.pricePerSeat || '-'}</Text>
          </View>
        </View>

        <View style={styles.reminderCard}>
          <Text style={styles.reminderTitle}>Safety Reminders</Text>
          <Text style={styles.reminderText}>• Verify the rider identity using QR code</Text>
          <Text style={styles.reminderText}>• Share your trip with friends or family</Text>
          <Text style={styles.reminderText}>• Use SOS in case of emergency</Text>
        </View>
      </View>

      <View style={styles.footer}>
        <TouchableOpacity
          style={[styles.startBtn, loading && { opacity: 0.7 }]}
          onPress={handleStartRide}
          disabled={loading}
        >
          {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.startBtnText}>Slide to Start Ride</Text>}
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F5F7FB' },
  header: {
    backgroundColor: '#184080',
    paddingHorizontal: 16,
    paddingVertical: 14,
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconBtn: { width: 40, height: 40, alignItems: 'center', justifyContent: 'center' },
  headerTitle: { flex: 1, textAlign: 'center', color: '#fff', fontSize: 20, fontWeight: '700' },
  content: { flex: 1, padding: 16 },
  card: {
    backgroundColor: '#fff',
    borderRadius: 18,
    padding: 16,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: '#E8ECF4',
  },
  sectionTitle: { fontSize: 17, fontWeight: '700', color: '#132238', marginBottom: 12 },
  label: { fontSize: 13, color: '#7A8599', marginBottom: 4 },
  value: { fontSize: 16, fontWeight: '600', color: '#1C2746' },
  row: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 12 },
  rowLabel: { color: '#667085', fontSize: 14 },
  rowValue: { color: '#132238', fontSize: 14, fontWeight: '700' },
  reminderCard: {
    backgroundColor: '#FFF6E8',
    borderRadius: 18,
    padding: 16,
    borderWidth: 1,
    borderColor: '#FFD7A3',
  },
  reminderTitle: { fontSize: 16, fontWeight: '700', color: '#A85A00', marginBottom: 10 },
  reminderText: { fontSize: 14, color: '#8A5A16', marginBottom: 8 },
  footer: { padding: 16, backgroundColor: '#fff', borderTopWidth: 1, borderTopColor: '#E8ECF4' },
  startBtn: {
    backgroundColor: '#184080',
    borderRadius: 30,
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  startBtnText: { color: '#fff', fontSize: 16, fontWeight: '700' },
});