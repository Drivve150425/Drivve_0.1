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
  Alert,
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

export default function OngoingRideDriverScreen({ route, navigation }) {
  const { rideId, sessionId: initialSessionId } = route.params || {};
  const { user } = useAuth();

  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [ratingModalVisible, setRatingModalVisible] = useState(false);
  const [selectedRider, setSelectedRider] = useState(null);
  const [rating, setRating] = useState(0);
  const [feedback, setFeedback] = useState('');

  const fetchSession = useCallback(async () => {
    try {
      console.log('Fetching session for ride:', rideId, 'driver:', user?.phonenumber);
      
      const res = await axios.get(`${API_BASE_URL}/ride-sessions/driver/${rideId}`, {
        params: { driver_phone: user?.phonenumber },
      });
      
      console.log('Session response:', res.data);
      setSession(res.data);
    } catch (error) {
      console.log('Driver session fetch error:', error?.response?.data || error.message);
      
      // If session not found (404), try to get the live session from the main endpoint
      if (error?.response?.status === 404) {
        try {
          console.log('Session not found, trying live-session endpoint...');
          const liveRes = await axios.get(`${API_BASE_URL}/ride/${rideId}/live-session`);
          
          if (liveRes.data.success && liveRes.data.session) {
            console.log('Found live session:', liveRes.data.session);
            // Transform to match expected format
            setSession({
              session_id: liveRes.data.session.session_id,
              status: liveRes.data.session.status,
              current_phase: liveRes.data.session.status === 'driver_started' ? 'boarding' : liveRes.data.session.status,
              ride_id: rideId,
              riders: [],
              boarded_count: 0,
              dropped_count: 0,
              total_riders: 0,
              qr_code_token: liveRes.data.session.qr_code_token || 'N/A'
            });
          } else {
            console.log('No live session found');
            setSession(null);
          }
        } catch (liveError) {
          console.log('No live session found yet:', liveError);
          setSession(null);
        }
      } else {
        setSession(null);
      }
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [rideId, user?.phonenumber]);

  useEffect(() => {
    fetchSession();
    const timer = setInterval(fetchSession, 5000);
    return () => clearInterval(timer);
  }, [fetchSession]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchSession();
  };

  const handleMarkBoarded = async (bookingId) => {
    try {
      await axios.post(`${API_BASE_URL}/ride-sessions/${session.session_id}/riders/${bookingId}/mark-boarded`, {
        driver_phone: user?.phonenumber,
      });
      fetchSession();
    } catch (error) {
      Alert.alert('Error', error?.response?.data?.detail || 'Could not mark rider as boarded');
    }
  };

  const handleDropOff = async (bookingId) => {
    try {
      await axios.post(`${API_BASE_URL}/ride-sessions/${session.session_id}/riders/${bookingId}/drop-off`, {
        driver_phone: user?.phonenumber,
      });
      fetchSession();
    } catch (error) {
      Alert.alert('Error', error?.response?.data?.detail || 'Could not drop off rider');
    }
  };

  const handleCompleteRide = async () => {
    Alert.alert(
      'Complete Ride',
      'Are you sure you want to complete this ride?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Complete',
          onPress: async () => {
            try {
              await axios.post(`${API_BASE_URL}/ride-sessions/${session.session_id}/complete`, {
                driver_phone: user?.phonenumber,
              });
              fetchSession();
              Alert.alert('Success', 'Ride completed successfully');
              setTimeout(() => {
                navigation.navigate('DriverHomeScreen');
              }, 2000);
            } catch (error) {
              Alert.alert('Error', error?.response?.data?.detail || 'Could not complete ride');
            }
          }
        }
      ]
    );
  };

  const handleSOS = async () => {
    Alert.alert(
      'Trigger SOS',
      'This will alert emergency contacts. Are you sure?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Trigger SOS',
          style: 'destructive',
          onPress: async () => {
            try {
              await axios.post(`${API_BASE_URL}/ride-sessions/${session.session_id}/sos`, {
                note: 'SOS triggered by driver',
              });
              fetchSession();
              Alert.alert('SOS Triggered', 'Emergency contacts have been notified');
            } catch (error) {
              Alert.alert('Error', 'Could not trigger SOS');
            }
          }
        }
      ]
    );
  };

  const handleEmergencyStop = async () => {
    Alert.alert(
      'Emergency Stop',
      'This will stop the ride and notify all passengers. Are you sure?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Emergency Stop',
          style: 'destructive',
          onPress: async () => {
            try {
              await axios.post(`${API_BASE_URL}/ride-sessions/${session.session_id}/emergency-stop`, {
                note: 'Emergency stop triggered by driver',
              });
              fetchSession();
              Alert.alert('Emergency Stop', 'Emergency stop has been activated');
            } catch (error) {
              Alert.alert('Error', 'Could not trigger emergency stop');
            }
          }
        }
      ]
    );
  };

  const openRateModal = (rider) => {
    setSelectedRider(rider);
    setRating(0);
    setFeedback('');
    setRatingModalVisible(true);
  };

  const submitRiderRating = async () => {
    if (!selectedRider) return;
    if (rating === 0) {
      Alert.alert('Rating Required', 'Please select a rating before submitting');
      return;
    }
    
    try {
      await axios.post(`${API_BASE_URL}/ride-sessions/${session.session_id}/rate-rider`, {
        booking_id: selectedRider.booking_id,
        rating,
        feedback,
      });
      setRatingModalVisible(false);
      fetchSession();
      Alert.alert('Success', 'Thank you for rating this rider');
    } catch (error) {
      Alert.alert('Error', 'Could not submit rider rating');
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

  // If no session exists
  if (!session) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.circleBtn}>
            <Ionicons name="arrow-back" size={22} color="#fff" />
          </TouchableOpacity>
          <View style={{ flex: 1 }}>
            <Text style={styles.headerTitle}>Ride Session</Text>
          </View>
        </View>
        
        <View style={styles.noSessionContainer}>
          <Ionicons name="car-sport-outline" size={80} color="#D1D5DB" />
          <Text style={styles.noSessionTitle}>No Active Session</Text>
          <Text style={styles.noSessionText}>
            The ride session hasn't been started yet.{"\n"}
            Please start the ride from the ride details screen.
          </Text>
          <TouchableOpacity 
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Text style={styles.backButtonText}>Go Back</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  const allDropped = session?.dropped_count === session?.total_riders && session?.total_riders > 0;
  const hasRiders = session?.riders && session.riders.length > 0;

  if (!hasRiders) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.circleBtn}>
            <Ionicons name="arrow-back" size={22} color="#fff" />
          </TouchableOpacity>
          <View style={{ flex: 1 }}>
            <Text style={styles.headerTitle}>Ride in Progress</Text>
            <Text style={styles.headerSubtitle}>No riders yet</Text>
          </View>
          <TouchableOpacity onPress={handleSOS} style={[styles.circleBtn, { backgroundColor: '#E11D48' }]}>
            <Ionicons name="shield-outline" size={20} color="#fff" />
          </TouchableOpacity>
        </View>
        
        <View style={styles.noRidersContainer}>
          <Ionicons name="people-outline" size={80} color="#D1D5DB" />
          <Text style={styles.noRidersTitle}>No Riders Yet</Text>
          <Text style={styles.noRidersText}>
            Waiting for riders to join this ride.{"\n"}
            Share the QR code with passengers to board.
          </Text>
          <TouchableOpacity 
            style={styles.refreshButton}
            onPress={onRefresh}
          >
            <Ionicons name="refresh-outline" size={20} color="#184080" />
            <Text style={styles.refreshButtonText}>Refresh</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#184080" />
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.circleBtn}>
          <Ionicons name="arrow-back" size={22} color="#fff" />
        </TouchableOpacity>

        <View style={{ flex: 1 }}>
          <Text style={styles.headerTitle}>Ride in Progress</Text>
          <Text style={styles.headerSubtitle}>
            {session?.current_phase === 'boarding'
              ? 'Pick up your riders'
              : session?.current_phase === 'en_route'
              ? 'En route to destination'
              : 'All riders dropped off'}
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
        <View style={styles.progressCard}>
          <Text style={styles.progressTitle}>
            {session?.current_phase === 'boarding' ? 'Riders Boarded' : 'Riders Dropped Off'}
          </Text>
          <Text style={styles.progressCount}>
            {session?.current_phase === 'boarding'
              ? `${session?.boarded_count || 0}/${session?.total_riders || 0}`
              : `${session?.dropped_count || 0}/${session?.total_riders || 0}`}
          </Text>
          <View style={styles.progressBarBg}>
            <View
              style={[
                styles.progressBarFill,
                {
                  width: `${
                    session?.total_riders
                      ? ((session?.current_phase === 'boarding' ? session?.boarded_count : session?.dropped_count) /
                          session?.total_riders) *
                        100
                      : 0
                  }%`,
                },
              ]}
            />
          </View>
        </View>

        {session?.current_phase === 'boarding' && (
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Boarding QR Code</Text>
            <Text style={styles.cardSub}>Ask riders to scan this code token</Text>
            <View style={styles.qrBox}>
              <Ionicons name="qr-code" size={76} color="#111827" />
              <Text style={styles.qrToken}>{session?.qr_code_token || 'N/A'}</Text>
            </View>
          </View>
        )}

        <View style={styles.card}>
          <Text style={styles.cardTitle}>
            {session?.current_phase === 'boarding' ? 'Riders to Pick Up' : 'Passengers On Board'}
          </Text>

          {session?.riders?.map((rider) => {
            const isBoarded = ['boarded', 'dropped_off', 'completed'].includes(rider.status);
            const isDropped = ['dropped_off', 'completed'].includes(rider.status);

            return (
              <View key={rider.booking_id} style={styles.riderCard}>
                <View style={styles.riderTop}>
                  <View style={styles.riderInfo}>
                    {rider.rider_photo ? (
                      <Image source={{ uri: buildImageUrl(rider.rider_photo) }} style={styles.avatar} />
                    ) : (
                      <View style={[styles.avatar, styles.avatarFallback]}>
                        <Text style={styles.avatarText}>{(rider.rider_name || 'R').slice(0, 1).toUpperCase()}</Text>
                      </View>
                    )}
                    <View style={{ flex: 1 }}>
                      <Text style={styles.riderName}>{rider.rider_name || rider.rider_phone}</Text>
                      <Text style={styles.riderPhone}>{rider.rider_phone}</Text>
                      <Text style={styles.riderLocationLabel}>
                        {session?.current_phase === 'boarding' ? 'Pickup' : 'Drop-off'}
                      </Text>
                      <Text style={styles.riderLocation}>
                        {session?.current_phase === 'boarding' ? rider.pickup_location : rider.dropoff_location}
                      </Text>
                    </View>
                  </View>

                  <View
                    style={[
                      styles.statusPill,
                      {
                        backgroundColor: isDropped
                          ? '#F3E8FF'
                          : isBoarded
                          ? '#DCFCE7'
                          : '#EFF6FF',
                      },
                    ]}
                  >
                    <Text
                      style={[
                        styles.statusPillText,
                        {
                          color: isDropped ? '#9333EA' : isBoarded ? '#16A34A' : '#1D4ED8',
                        },
                      ]}
                    >
                      {isDropped ? 'Dropped Off' : isBoarded ? 'On Board' : 'Pending'}
                    </Text>
                  </View>
                </View>

                {session?.current_phase === 'boarding' && !isBoarded && (
                  <TouchableOpacity style={styles.primaryBtn} onPress={() => handleMarkBoarded(rider.booking_id)}>
                    <Text style={styles.primaryBtnText}>Mark as Boarded</Text>
                  </TouchableOpacity>
                )}

                {session?.current_phase !== 'boarding' && !isDropped && (
                  <TouchableOpacity style={styles.dropBtn} onPress={() => handleDropOff(rider.booking_id)}>
                    <Text style={styles.dropBtnText}>Drop Off Rider</Text>
                  </TouchableOpacity>
                )}

                {isDropped && (
                  <TouchableOpacity style={styles.rateBtn} onPress={() => openRateModal(rider)}>
                    <Text style={styles.rateBtnText}>Rate Rider</Text>
                  </TouchableOpacity>
                )}
              </View>
            );
          })}
        </View>

        {allDropped && (
          <TouchableOpacity
            style={styles.completeRideBtn}
            onPress={handleCompleteRide}
          >
            <Text style={styles.completeRideText}>Complete Ride</Text>
          </TouchableOpacity>
        )}

        <TouchableOpacity style={styles.emergencyBtn} onPress={handleEmergencyStop}>
          <Text style={styles.emergencyBtnText}>Emergency Stop</Text>
        </TouchableOpacity>
      </ScrollView>

      <Modal visible={ratingModalVisible} transparent animationType="fade">
        <View style={styles.modalBackdrop}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>Rate Your Rider</Text>
            <Text style={styles.modalSub}>
              How was your ride with {selectedRider?.rider_name || 'this rider'}?
            </Text>

            {renderStars()}

            <TextInput
              value={feedback}
              onChangeText={setFeedback}
              placeholder="Share your feedback (optional)"
              multiline
              style={styles.feedbackInput}
            />

            <View style={styles.modalActions}>
              <TouchableOpacity style={styles.skipBtn} onPress={() => setRatingModalVisible(false)}>
                <Text style={styles.skipBtnText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.submitBtn, rating === 0 && { opacity: 0.5 }]} onPress={submitRiderRating} disabled={rating === 0}>
                <Text style={styles.submitBtnText}>Submit</Text>
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
  progressCard: {
    backgroundColor: '#2E5AAC',
    borderRadius: 18,
    padding: 16,
    marginBottom: 14,
  },
  progressTitle: { color: '#DCE8FF', fontSize: 13, marginBottom: 4 },
  progressCount: { color: '#fff', fontSize: 18, fontWeight: '700', marginBottom: 12 },
  progressBarBg: { height: 10, borderRadius: 10, backgroundColor: 'rgba(255,255,255,0.2)' },
  progressBarFill: { height: 10, borderRadius: 10, backgroundColor: '#FF8A00' },
  card: {
    backgroundColor: '#fff',
    borderRadius: 18,
    padding: 16,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: '#E7ECF4',
  },
  cardTitle: { color: '#1C2746', fontSize: 16, fontWeight: '700' },
  cardSub: { color: '#7A8599', fontSize: 13, marginTop: 4, marginBottom: 12 },
  qrBox: { alignItems: 'center', justifyContent: 'center', backgroundColor: '#F8FAFC', borderRadius: 16, padding: 20 },
  qrToken: { marginTop: 12, fontSize: 12, color: '#667085', textAlign: 'center' },
  riderCard: { borderWidth: 1, borderColor: '#E5E7EB', borderRadius: 16, padding: 14, marginTop: 12 },
  riderTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', gap: 10 },
  riderInfo: { flexDirection: 'row', flex: 1 },
  avatar: { width: 52, height: 52, borderRadius: 26, marginRight: 12 },
  avatarFallback: { backgroundColor: '#E8EEF9', justifyContent: 'center', alignItems: 'center' },
  avatarText: { color: '#184080', fontWeight: '700', fontSize: 18 },
  riderName: { color: '#132238', fontSize: 15, fontWeight: '700' },
  riderPhone: { color: '#667085', fontSize: 13, marginTop: 2 },
  riderLocationLabel: { color: '#667085', fontSize: 12, marginTop: 8 },
  riderLocation: { color: '#111827', fontSize: 14, fontWeight: '600', marginTop: 2 },
  statusPill: { paddingHorizontal: 10, paddingVertical: 6, borderRadius: 999 },
  statusPillText: { fontSize: 12, fontWeight: '700' },
  primaryBtn: {
    backgroundColor: '#184080',
    marginTop: 14,
    borderRadius: 12,
    paddingVertical: 13,
    alignItems: 'center',
  },
  primaryBtnText: { color: '#fff', fontWeight: '700' },
  dropBtn: {
    backgroundColor: '#7C3AED',
    marginTop: 14,
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
  },
  dropBtnText: { color: '#fff', fontWeight: '700' },
  rateBtn: {
    borderWidth: 1,
    borderColor: '#F59E0B',
    marginTop: 14,
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: 'center',
  },
  rateBtnText: { color: '#D97706', fontWeight: '700' },
  completeRideBtn: {
    backgroundColor: '#FF7A00',
    borderRadius: 16,
    paddingVertical: 15,
    alignItems: 'center',
    marginBottom: 12,
  },
  completeRideText: { color: '#fff', fontWeight: '700', fontSize: 15 },
  emergencyBtn: {
    borderWidth: 1.5,
    borderColor: '#EF4444',
    borderRadius: 16,
    paddingVertical: 15,
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  emergencyBtnText: { color: '#DC2626', fontWeight: '700' },
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(17,24,39,0.45)',
    justifyContent: 'center',
    padding: 20,
  },
  modalCard: { backgroundColor: '#fff', borderRadius: 24, padding: 20 },
  modalTitle: { fontSize: 22, fontWeight: '700', color: '#111827', textAlign: 'center' },
  modalSub: { fontSize: 14, color: '#6B7280', textAlign: 'center', marginTop: 8, marginBottom: 18 },
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
    backgroundColor: '#184080',
    borderRadius: 999,
    paddingVertical: 14,
    alignItems: 'center',
  },
  submitBtnText: { color: '#fff', fontWeight: '700' },
  noSessionContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 30,
    backgroundColor: '#F4F7FB',
  },
  noSessionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#111827',
    marginTop: 20,
    marginBottom: 8,
  },
  noSessionText: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
    marginBottom: 30,
    lineHeight: 20,
  },
  backButton: {
    backgroundColor: '#184080',
    paddingHorizontal: 30,
    paddingVertical: 12,
    borderRadius: 12,
  },
  backButtonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 16,
  },
  noRidersContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 30,
    backgroundColor: '#F4F7FB',
  },
  noRidersTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#111827',
    marginTop: 20,
    marginBottom: 8,
  },
  noRidersText: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
    marginBottom: 30,
    lineHeight: 20,
  },
  refreshButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#fff',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#184080',
  },
  refreshButtonText: {
    color: '#184080',
    fontWeight: '600',
    fontSize: 16,
  },
});