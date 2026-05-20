import React, { useCallback, useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  ScrollView,
  RefreshControl,
  ActivityIndicator,
  Image,
  TextInput,
  Modal,
} from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import axios from 'axios';
import { API_BASE_URL } from "../config/config_ip";
import { useAuth } from '../context/AuthContext';

const buildImageUrl = (url) => {
  if (!url) return null;
  if (url.startsWith('http://') || url.startsWith('https://')) return url;
  return `${API_BASE_URL}${url.startsWith('/') ? url : `/${url}`}`;
};

export default function OngoingRideRiderScreen({ route, navigation }) {
  const { bookingId, sessionId: initialSessionId } = route.params || {};
  const { user } = useAuth();

  const [session, setSession] = useState(null);
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);

  const [showQRModal, setShowQRModal] = useState(false);
  const [qrInput, setQrInput] = useState('');
  const [showRatingModal, setShowRatingModal] = useState(false);
  const [rating, setRating] = useState(0);
  const [feedback, setFeedback] = useState('');

  const fetchSession = useCallback(async () => {
    try {
      const res = await axios.get(`${API_BASE_URL}/ride-sessions/rider/${bookingId}`, {
        params: { rider_phone: user?.phonenumber },
      });
      setSession(res.data);
    } catch (error) {
      console.log('Rider session fetch error:', error?.response?.data || error.message);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [bookingId, user?.phonenumber]);

  useEffect(() => {
    fetchSession();
    const timer = setInterval(fetchSession, 5000);
    return () => clearInterval(timer);
  }, [fetchSession]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchSession();
  };

  const handleReachedPickup = async () => {
    try {
      await axios.post(`${API_BASE_URL}/ride-sessions/${session.session_id}/reached-pickup`, {
        booking_id: bookingId,
        rider_phone: user?.phonenumber,
      });
      fetchSession();
    } catch (error) {
      alert(error?.response?.data?.detail || 'Could not notify driver');
    }
  };

  const handleScanQR = async () => {
    try {
      await axios.post(`${API_BASE_URL}/ride-sessions/${session.session_id}/scan-qr`, {
        booking_id: bookingId,
        rider_phone: user?.phonenumber,
        qr_code_token: qrInput,
      });
      setShowQRModal(false);
      setQrInput('');
      fetchSession();
    } catch (error) {
      alert(error?.response?.data?.detail || 'Invalid QR code');
    }
  };

  const handleMarkCompleted = async () => {
    try {
      await axios.post(`${API_BASE_URL}/ride-sessions/${session.session_id}/mark-completed`, {
        booking_id: bookingId,
        rider_phone: user?.phonenumber,
      });
      fetchSession();
      setShowRatingModal(true);
    } catch (error) {
      alert(error?.response?.data?.detail || 'Could not complete ride');
    }
  };

  const handleRateDriver = async () => {
    try {
      await axios.post(`${API_BASE_URL}/ride-sessions/${session.session_id}/rate-driver`, {
        booking_id: bookingId,
        rating,
        feedback,
      });
      setShowRatingModal(false);
      fetchSession();
    } catch (error) {
      alert('Could not submit rating');
    }
  };

  const handleSOS = async () => {
    try {
      await axios.post(`${API_BASE_URL}/ride-sessions/${session.session_id}/sos`, {
        note: 'SOS triggered by rider',
      });
      fetchSession();
      alert('SOS triggered');
    } catch (error) {
      alert('Could not trigger SOS');
    }
  };

  const renderStars = () => (
    <View style={styles.starsRow}>
      {[1, 2, 3, 4, 5].map((star) => (
        <TouchableOpacity key={star} onPress={() => setRating(star)}>
          <Ionicons
            name={star <= rating ? 'star' : 'star-outline'}
            size={32}
            color={star <= rating ? '#F59E0B' : '#D1D5DB'}
            style={{ marginHorizontal: 4 }}
          />
        </TouchableOpacity>
      ))}
    </View>
  );

  if (loading) {
    return (
      <SafeAreaView style={styles.centered}>
        <ActivityIndicator size="large" color="#184080" />
      </SafeAreaView>
    );
  }

  const riderStatus = session?.rider_status;
  const showTrack = ['accepted', 'reached_pickup'].includes(riderStatus);
  const isBoarded = ['boarded'].includes(riderStatus);
  const isDropped = ['dropped_off'].includes(riderStatus);
  const isCompleted = ['completed'].includes(riderStatus);

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#184080" />
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.circleBtn}>
          <Ionicons name="arrow-back" size={22} color="#fff" />
        </TouchableOpacity>

        <View style={{ flex: 1 }}>
          <Text style={styles.headerTitle}>
            {isCompleted ? 'You have arrived!' : isDropped ? 'You have arrived!' : isBoarded ? 'Ride in Progress' : 'Driver is on the way'}
          </Text>
          <Text style={styles.headerSubtitle}>
            {isCompleted
              ? 'Please complete your ride'
              : isDropped
              ? 'Please complete your ride'
              : isBoarded
              ? 'Following route to destination'
              : 'Track your ride in real time'}
          </Text>
        </View>

        <TouchableOpacity onPress={handleSOS} style={[styles.circleBtn, { backgroundColor: '#E11D48' }]}>
          <Ionicons name="shield-outline" size={20} color="#fff" />
        </TouchableOpacity>
      </View>

      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ padding: 16, paddingBottom: 30 }}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        <View style={styles.topBanner}>
          <Ionicons
            name={isCompleted || isDropped ? 'checkmark-circle-outline' : isBoarded ? 'navigate-circle-outline' : 'time-outline'}
            size={24}
            color="#fff"
          />
          <View style={{ marginLeft: 10 }}>
            <Text style={styles.topBannerTitle}>
              {isCompleted || isDropped
                ? "You've been dropped off"
                : isBoarded
                ? "You're on board!"
                : 'Driver has started the ride!'}
            </Text>
            <Text style={styles.topBannerSub}>
              {isCompleted || isDropped
                ? 'Please complete your ride'
                : isBoarded
                ? 'Heading to destination'
                : 'Track the driver and get ready to board'}
            </Text>
          </View>
        </View>

        <View style={styles.driverCard}>
          {session?.driver_photo ? (
            <Image source={{ uri: buildImageUrl(session.driver_photo) }} style={styles.driverAvatar} />
          ) : (
            <View style={[styles.driverAvatar, styles.driverAvatarFallback]}>
              <Text style={styles.driverAvatarText}>{(session?.driver_name || 'D').slice(0, 1).toUpperCase()}</Text>
            </View>
          )}
          <View style={{ flex: 1 }}>
            <Text style={styles.driverName}>{session?.driver_name}</Text>
            <Text style={styles.driverSub}>Your driver</Text>
          </View>
          <TouchableOpacity style={styles.iconAction}>
            <Ionicons name="call" size={20} color="#184080" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.iconAction}>
            <Ionicons name="chatbubble-ellipses" size={20} color="#184080" />
          </TouchableOpacity>
        </View>

        <View style={styles.tripCard}>
          <Text style={styles.tripTitle}>Trip Details</Text>
          <Text style={styles.tripLabel}>Pickup</Text>
          <Text style={styles.tripValue}>{session?.pickup_location || session?.origin}</Text>
          <Text style={[styles.tripLabel, { marginTop: 12 }]}>Drop-off</Text>
          <Text style={styles.tripValue}>{session?.dropoff_location || session?.destination}</Text>
        </View>

        {showTrack && (
          <>
            <TouchableOpacity style={styles.primaryBtn} onPress={handleReachedPickup}>
              <Text style={styles.primaryBtnText}>I've Reached Pickup Location</Text>
            </TouchableOpacity>

            <View style={styles.mapCard}>
              <Text style={styles.mapTitle}>Live tracking active</Text>
              <Text style={styles.mapSub}>
                Driver location: {session?.current_lat && session?.current_lng ? `${session.current_lat}, ${session.current_lng}` : 'Waiting for live location'}
              </Text>
            </View>

            <TouchableOpacity style={styles.orangeBtn} onPress={() => setShowQRModal(true)}>
              <Text style={styles.orangeBtnText}>Scan Driver's QR Code to Board</Text>
            </TouchableOpacity>
          </>
        )}

        {isBoarded && (
          <View style={styles.greenCard}>
            <Text style={styles.greenTitle}>Trip in Progress</Text>
            <Text style={styles.greenSub}>Following optimal route to destination</Text>
          </View>
        )}

        {isDropped && (
          <>
            <View style={styles.warningCard}>
              <Text style={styles.warningTitle}>Safety Confirmation Required</Text>
              <Text style={styles.warningSub}>
                For your safety, please mark the ride as completed once you have safely reached your destination.
              </Text>
            </View>

            <TouchableOpacity style={styles.completeBtn} onPress={handleMarkCompleted}>
              <Text style={styles.completeBtnText}>Mark Ride as Completed</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.outlineRateBtn} onPress={() => setShowRatingModal(true)}>
              <Text style={styles.outlineRateBtnText}>Rate Your Driver (Optional)</Text>
            </TouchableOpacity>
          </>
        )}

        {isCompleted && (
          <>
            <View style={styles.successCard}>
              <Text style={styles.successTitle}>Ride completed safely</Text>
              <Text style={styles.successSub}>Thank you for confirming trip completion</Text>
            </View>

            <TouchableOpacity style={styles.outlineRateBtn} onPress={() => setShowRatingModal(true)}>
              <Text style={styles.outlineRateBtnText}>Rate Your Driver (Optional)</Text>
            </TouchableOpacity>
          </>
        )}

        <View style={styles.bottomActions}>
          <TouchableOpacity style={styles.shareBtn}>
            <Text style={styles.shareBtnText}>Share Trip</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.sosBtn} onPress={handleSOS}>
            <Text style={styles.sosBtnText}>SOS</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      <Modal visible={showQRModal} transparent animationType="fade">
        <View style={styles.modalBackdrop}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>Scan Driver's QR Code</Text>
            <Text style={styles.modalSub}>Paste the QR token for now</Text>
            <TextInput
              value={qrInput}
              onChangeText={setQrInput}
              placeholder="Enter QR token"
              style={styles.qrInput}
              autoCapitalize="none"
            />
            <View style={styles.modalActions}>
              <TouchableOpacity style={styles.skipBtn} onPress={() => setShowQRModal(false)}>
                <Text style={styles.skipBtnText}>Close</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.submitBtn} onPress={handleScanQR}>
                <Text style={styles.submitBtnText}>Board Ride</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      <Modal visible={showRatingModal} transparent animationType="fade">
        <View style={styles.modalBackdrop}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>Rate Your Experience</Text>
            <Text style={styles.modalSub}>How was your ride with {session?.driver_name}?</Text>

            {renderStars()}

            <TextInput
              value={feedback}
              onChangeText={setFeedback}
              placeholder="Tell us about your experience..."
              multiline
              style={styles.feedbackInput}
            />

            <View style={styles.modalActions}>
              <TouchableOpacity style={styles.skipBtn} onPress={() => setShowRatingModal(false)}>
                <Text style={styles.skipBtnText}>Skip</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.submitBtn} onPress={handleRateDriver}>
                <Text style={styles.submitBtnText}>Submit Rating</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F4F7FB' },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#fff' },
  header: {
    backgroundColor: '#184080',
    paddingHorizontal: 16,
    paddingVertical: 14,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  circleBtn: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: 'rgba(255,255,255,0.14)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: { color: '#fff', fontSize: 20, fontWeight: '700' },
  headerSubtitle: { color: '#D7E3FF', fontSize: 13, marginTop: 2 },
  topBanner: {
    backgroundColor: '#6D28D9',
    borderRadius: 18,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 14,
  },
  topBannerTitle: { color: '#fff', fontSize: 15, fontWeight: '700' },
  topBannerSub: { color: '#F3E8FF', fontSize: 13, marginTop: 2 },
  driverCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 14,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 14,
    borderWidth: 1,
    borderColor: '#E7ECF4',
  },
  driverAvatar: { width: 54, height: 54, borderRadius: 27, marginRight: 12 },
  driverAvatarFallback: { backgroundColor: '#E8EEF9', alignItems: 'center', justifyContent: 'center' },
  driverAvatarText: { color: '#184080', fontWeight: '700', fontSize: 18 },
  driverName: { color: '#1C2746', fontSize: 16, fontWeight: '700' },
  driverSub: { color: '#667085', fontSize: 13, marginTop: 2 },
  iconAction: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#EEF4FF',
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 8,
  },
  tripCard: {
    backgroundColor: '#fff',
    borderRadius: 18,
    padding: 16,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: '#E7ECF4',
  },
  tripTitle: { color: '#1C2746', fontSize: 16, fontWeight: '700', marginBottom: 12 },
  tripLabel: { color: '#7A8599', fontSize: 13, marginBottom: 4 },
  tripValue: { color: '#111827', fontSize: 15, fontWeight: '600' },
  primaryBtn: {
    backgroundColor: '#184080',
    borderRadius: 14,
    paddingVertical: 15,
    alignItems: 'center',
    marginBottom: 12,
  },
  primaryBtnText: { color: '#fff', fontWeight: '700', fontSize: 15 },
  orangeBtn: {
    backgroundColor: '#FF7A00',
    borderRadius: 14,
    paddingVertical: 15,
    alignItems: 'center',
    marginBottom: 12,
  },
  orangeBtnText: { color: '#fff', fontWeight: '700', fontSize: 15 },
  mapCard: {
    backgroundColor: '#EFF6FF',
    borderColor: '#BFDBFE',
    borderWidth: 1,
    borderRadius: 16,
    padding: 14,
    marginBottom: 12,
  },
  mapTitle: { color: '#1D4ED8', fontWeight: '700', fontSize: 14 },
  mapSub: { color: '#475467', marginTop: 6, fontSize: 13 },
  greenCard: {
    backgroundColor: '#DCFCE7',
    borderRadius: 16,
    padding: 14,
    marginBottom: 12,
  },
  greenTitle: { color: '#166534', fontSize: 15, fontWeight: '700' },
  greenSub: { color: '#166534', fontSize: 13, marginTop: 4 },
  warningCard: {
    backgroundColor: '#FFF7ED',
    borderColor: '#FDBA74',
    borderWidth: 1,
    borderRadius: 16,
    padding: 14,
    marginBottom: 12,
  },
  warningTitle: { color: '#C2410C', fontSize: 15, fontWeight: '700' },
  warningSub: { color: '#9A3412', fontSize: 13, marginTop: 6, lineHeight: 19 },
  completeBtn: {
    backgroundColor: '#184080',
    borderRadius: 14,
    paddingVertical: 15,
    alignItems: 'center',
    marginBottom: 12,
  },
  completeBtnText: { color: '#fff', fontWeight: '700', fontSize: 15 },
  outlineRateBtn: {
    borderWidth: 1.2,
    borderColor: '#FB923C',
    borderRadius: 14,
    paddingVertical: 15,
    alignItems: 'center',
    marginBottom: 12,
    backgroundColor: '#fff',
  },
  outlineRateBtnText: { color: '#EA580C', fontWeight: '700', fontSize: 15 },
  successCard: {
    backgroundColor: '#ECFDF3',
    borderColor: '#86EFAC',
    borderWidth: 1,
    borderRadius: 16,
    padding: 14,
    marginBottom: 12,
  },
  successTitle: { color: '#166534', fontSize: 15, fontWeight: '700' },
  successSub: { color: '#166534', fontSize: 13, marginTop: 6 },
  bottomActions: { flexDirection: 'row', gap: 12, marginTop: 4 },
  shareBtn: {
    flex: 1,
    backgroundColor: '#F3F4F6',
    borderRadius: 14,
    paddingVertical: 15,
    alignItems: 'center',
  },
  shareBtnText: { color: '#111827', fontWeight: '700' },
  sosBtn: {
    flex: 1,
    backgroundColor: '#FEE2E2',
    borderRadius: 14,
    paddingVertical: 15,
    alignItems: 'center',
  },
  sosBtnText: { color: '#DC2626', fontWeight: '700' },
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(17,24,39,0.45)',
    justifyContent: 'center',
    padding: 20,
  },
  modalCard: { backgroundColor: '#fff', borderRadius: 24, padding: 20 },
  modalTitle: { fontSize: 22, fontWeight: '700', color: '#111827', textAlign: 'center' },
  modalSub: { fontSize: 14, color: '#6B7280', textAlign: 'center', marginTop: 8, marginBottom: 18 },
  qrInput: {
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 14,
    color: '#111827',
    marginBottom: 16,
  },
  starsRow: { flexDirection: 'row', justifyContent: 'center', marginBottom: 18 },
  feedbackInput: {
    minHeight: 110,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 16,
    padding: 14,
    textAlignVertical: 'top',
    color: '#111827',
  },
  modalActions: { flexDirection: 'row', gap: 10, marginTop: 18 },
  skipBtn: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 999,
    paddingVertical: 14,
    alignItems: 'center',
  },
  skipBtnText: { color: '#6B7280', fontWeight: '600' },
  submitBtn: {
    flex: 1,
    backgroundColor: '#D1D5DB',
    borderRadius: 999,
    paddingVertical: 14,
    alignItems: 'center',
  },
  submitBtnText: { color: '#fff', fontWeight: '700' },
});