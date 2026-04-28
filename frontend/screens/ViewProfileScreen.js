import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  StatusBar,
  Image,
  Dimensions,
  ActivityIndicator,
  Platform,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons, MaterialIcons, MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useFocusEffect } from '@react-navigation/native';

import { Colors } from '../constants/Colors';
import { API_BASE_URL } from '../config/config_ip';
import { useAuth } from '../context/AuthContext';

const { width } = Dimensions.get('window');

// ─── Helpers ──────────────────────────────────────────────────────────────────

function buildImageUrl(url) {
  if (!url) return null;
  if (url.startsWith('http://') || url.startsWith('https://')) return url;
  return `${API_BASE_URL}${url.startsWith('/') ? '' : '/'}${url}`;
}

function getInitials(name) {
  if (!name) return 'U';
  const parts = name.trim().split(' ').filter(Boolean);
  if (parts.length > 1) return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
  return parts[0].slice(0, 2).toUpperCase();
}

function formatJoinDate(dateString) {
  if (!dateString) return 'Recently joined';
  try {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
  } catch {
    return 'Recently joined';
  }
}

function formatReviewDate(dateString) {
  if (!dateString) return '';
  try {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
  } catch {
    return '';
  }
}

async function fetchPublicProfile(phoneNumber, userId) {
  try {
    const params = new URLSearchParams();
    if (userId) params.append('user_id', userId);
    else if (phoneNumber) params.append('phone_number', phoneNumber);
    else return null;
    const url = `${API_BASE_URL}/api/v1/users/profile-public?${params.toString()}`;
    const res = await fetch(url, { headers: { Accept: 'application/json' } });
    if (!res.ok) return null;
    return await res.json();
  } catch (e) {
    console.log('fetchPublicProfile error:', e);
    return null;
  }
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function StarRow({ rating, size = 14, color = '#F59E0B' }) {
  return (
    <View style={{ flexDirection: 'row', gap: 2 }}>
      {[1, 2, 3, 4, 5].map((i) => (
        <Ionicons
          key={i}
          name={i <= Math.round(rating) ? 'star' : 'star-outline'}
          size={size}
          color={color}
        />
      ))}
    </View>
  );
}

function SectionCard({ children, style }) {
  return <View style={[styles.sectionCard, style]}>{children}</View>;
}

function SectionTitle({ title }) {
  return <Text style={styles.sectionTitle}>{title}</Text>;
}

function VerifPill({ icon, label }) {
  return (
    <View style={styles.verifPill}>
      <Ionicons name={icon} size={12} color="rgba(255,255,255,0.9)" />
      <Text style={styles.verifPillText}>{label}</Text>
    </View>
  );
}

function BadgeItem({ icon, iconColor, bgColor, title, desc }) {
  return (
    <View style={styles.badgeItem}>
      <View style={[styles.badgeIconCircle, { backgroundColor: bgColor }]}>
        <Ionicons name={icon} size={20} color={iconColor} />
      </View>
      <View style={{ flex: 1 }}>
        <Text style={styles.badgeTitle}>{title}</Text>
        <Text style={styles.badgeDesc}>{desc}</Text>
      </View>
    </View>
  );
}

function StatItem({ icon, value, label }) {
  return (
    <View style={styles.statItem}>
      <View style={styles.statIconCircle}>
        <Ionicons name={icon} size={20} color="#1A56DB" />
      </View>
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

function PrefItem({ icon, label, value, allowed }) {
  return (
    <View style={[styles.prefItem, { backgroundColor: allowed ? '#F0FDF4' : '#FEF2F2' }]}>
      <Ionicons name={icon} size={18} color={allowed ? '#10B981' : '#EF4444'} />
      <Text style={styles.prefLabel}>{label}</Text>
      <Text style={[styles.prefValue, { color: allowed ? '#10B981' : '#EF4444' }]}>{value}</Text>
    </View>
  );
}

function ReviewItem({ review }) {
  return (
    <View style={styles.reviewItem}>
      <View style={styles.reviewHeader}>
        <View style={styles.reviewAvatar}>
          {review.reviewer_photo ? (
            <Image source={{ uri: buildImageUrl(review.reviewer_photo) }} style={styles.reviewAvatarImg} />
          ) : (
            <Text style={styles.reviewAvatarText}>{getInitials(review.reviewer_name)}</Text>
          )}
        </View>
        <View style={{ flex: 1 }}>
          <Text style={styles.reviewName}>{review.reviewer_name || 'Anonymous'}</Text>
          <View style={styles.reviewMeta}>
            {review.route && (
              <Text style={styles.reviewRoute}>
                <Ionicons name="location-outline" size={11} color="#9CA3AF" /> {review.route}
              </Text>
            )}
            {review.date && (
              <Text style={styles.reviewDate}>
                <Ionicons name="calendar-outline" size={11} color="#9CA3AF" /> {formatReviewDate(review.date)}
              </Text>
            )}
          </View>
        </View>
        <StarRow rating={review.rating || 5} size={13} />
      </View>
      {review.comment && <Text style={styles.reviewComment}>{review.comment}</Text>}
    </View>
  );
}

// ─── Main Screen ──────────────────────────────────────────────────────────────

export default function ViewProfileScreen({ navigation, route }) {
  const { phoneNumber, userId, driverName } = route.params || {};
  const { user: currentUser } = useAuth();

  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  const loadProfile = useCallback(async () => {
    setLoading(true);
    const data = await fetchPublicProfile(phoneNumber, userId);
    setProfile(data?.success && data.user ? data.user : null);
    setLoading(false);
  }, [phoneNumber, userId]);

  useFocusEffect(useCallback(() => { loadProfile(); }, [loadProfile]));

  const handleBack = () => navigation.goBack();

  const getOrCreateConversation = async (receiverPhone) => {
    try {
      const myPhone = currentUser?.phone_number;
      if (!myPhone) {
        Alert.alert('Login Required', 'Please log in to use chat.');
        return null;
      }
      const response = await fetch(`${API_BASE_URL}/api/chat/conversations`, {
        method: 'POST',
        headers: {
          'X-Phone-Number': myPhone,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ participant_phone: receiverPhone }),
      });
      const data = await response.json();
      if (data.success) {
        return data.conversation.id;
      }
      console.error('Failed to create conversation:', data);
      return null;
    } catch (error) {
      console.error('getOrCreateConversation error:', error);
      return null;
    }
  };

  const handleStartChat = async () => {
    if (profile?.phone_number) {
      const conversationId = await getOrCreateConversation(profile.phone_number);
      if (conversationId) {
        navigation.navigate('ChatScreen', {
          receiverPhone: profile.phone_number,
          conversationId,
          user: {
            name: profile.full_name || driverName || 'User',
            tripInfo: 'Active',
          },
        });
      } else {
        Alert.alert('Chat', 'Unable to start chat. Please try again.');
      }
    } else {
      Alert.alert('Chat', 'Phone number not available');
    }
  };

  const handleReport = () => {
    Alert.alert('Report User', 'Are you sure you want to report this user?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Report',
        style: 'destructive',
        onPress: () => Alert.alert('Reported', 'Thank you for your report.'),
      },
    ]);
  };

  const profileImageUrl = buildImageUrl(profile?.profile_picture);
  const userFullName = profile?.full_name || driverName || 'User';
  const initials = getInitials(userFullName);
  const joinDateText = formatJoinDate(profile?.created_at);
  const rating = profile?.avg_rating ?? 0;
  const totalRatings = profile?.total_ratings ?? 0;
  const bio = profile?.bio || 'Friendly driver, love meeting new people!';
  const vehicle = profile?.vehicle;
  const vehicleName = vehicle ? [vehicle.make, vehicle.model].filter(Boolean).join(' ') : null;
  const verifications = profile?.verifications || {};
  const travelPrefs = profile?.travel_preferences || {};
  const reviews = profile?.reviews || [];
  const stats = profile?.stats || {};
  const trustScore = rating.toFixed(1);
  const trustDots = Math.round(rating);

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="dark-content" backgroundColor={Colors.white} />
        <View style={styles.loader}>
          <ActivityIndicator size="large" color="#1A56DB" />
          <Text style={styles.loadingText}>Loading profile...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!profile) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="dark-content" backgroundColor={Colors.white} />
        <View style={styles.header}>
          <TouchableOpacity style={styles.backBtn} onPress={handleBack}>
            <MaterialIcons name="arrow-back-ios" size={22} color="#1A56DB" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Profile</Text>
          <View style={styles.backBtn} />
        </View>
        <View style={styles.errorWrap}>
          <Ionicons name="person-outline" size={64} color="#D1D5DB" />
          <Text style={styles.errorTitle}>Profile not found</Text>
          <Text style={styles.errorSub}>We couldn't load this user's profile.</Text>
          <TouchableOpacity style={styles.retryBtn} onPress={loadProfile}>
            <Text style={styles.retryBtnText}>Retry</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['left', 'right']}>
      <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>

        {/* ── 1. PROFILE HEADER CARD ──
            s8.png is white-shapes-on-white-bg.
            Fix: gradient is the solid base, then the image is placed on top
            using blendMode="multiply" — this makes white pixels transparent
            and the light grey shapes appear as darker blue tones on the gradient.
            Result: the car + pin design shows as a subtle dark blue watermark.
        */}
        <View style={styles.headerWrapper}>
          {/* Solid gradient base */}
          <LinearGradient
            colors={['#1A56DB', '#0D3A6F']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={StyleSheet.absoluteFillObject}
          />

          {/* s8.png with blendMode multiply — white bg becomes transparent,
              grey shapes darken the gradient beneath them */}
          <Image
            source={require('../assets/s8.png')}
            style={styles.headerBgImage}
            resizeMode="cover"
          />

          {/* Back button */}
          <TouchableOpacity style={styles.backBtnLight} onPress={handleBack}>
            <MaterialIcons name="arrow-back-ios" size={22} color="#fff" />
          </TouchableOpacity>

          {/* Centered content */}
          <View style={styles.headerContent}>
            <View style={styles.profileImageContainer}>
              {profileImageUrl ? (
                <Image source={{ uri: profileImageUrl }} style={styles.profileImage} />
              ) : (
                <View style={styles.initialsCircle}>
                  <Text style={styles.initialsText}>{initials}</Text>
                </View>
              )}
              {profile?.profile_completed && (
                <View style={styles.verifiedBadge}>
                  <Ionicons name="checkmark-circle" size={22} color="#22C55E" />
                </View>
              )}
            </View>

            <Text style={styles.profileName}>{userFullName}</Text>

            <View style={styles.ratingRow}>
              <Ionicons name="star" size={16} color="#FFD700" />
              <Text style={styles.ratingText}>{rating > 0 ? rating.toFixed(1) : 'New'}</Text>
              <Text style={styles.ratingCount}>· {totalRatings} rides</Text>
            </View>

            <Text style={styles.memberSince}>Member since {joinDateText}</Text>

            {/* <View style={styles.verificationPills}>
              {verifications.phone     && <VerifPill icon="call-outline"     label="Phone"     />}
              {verifications.email     && <VerifPill icon="mail-outline"     label="Email"     />}
              {verifications.id        && <VerifPill icon="id-card-outline"  label="ID"        />}
              {verifications.corporate && <VerifPill icon="business-outline" label="Corporate" />}
            </View> */}
          </View>
        </View>

        {/* ── 2. TRUST SCORE ── */}
        <SectionCard>
          <View style={styles.trustRow}>
            <View style={styles.trustLeft}>
              <View style={styles.trustIconCircle}>
                <MaterialCommunityIcons name="trophy-outline" size={20} color="#F59E0B" />
              </View>
              <View>
                <Text style={styles.trustLabel}>Trust Score</Text>
                <Text style={styles.trustSubLabel}>
                  {trustDots >= 4 ? 'Excellent' : trustDots >= 3 ? 'Good' : 'Fair'}
                </Text>
              </View>
            </View>
            <View style={styles.trustRight}>
              <View style={styles.trustStars}>
                {[1, 2, 3, 4, 5].map((i) => (
                  <Ionicons key={i} name={i <= trustDots ? 'star' : 'star-outline'} size={18} color="#F59E0B" />
                ))}
              </View>
              <View style={styles.trustScoreBadge}>
                <Text style={styles.trustScoreNum}>{trustScore}</Text>
                <Text style={styles.trustScoreOf}>/5</Text>
              </View>
            </View>
          </View>
        </SectionCard>

        {/* ── 3. BADGES ── */}
        <SectionCard>
          <SectionTitle title="Badges & Achievements" />
          <View style={styles.badgesRow}>
            {profile?.profile_completed && (
              <BadgeItem icon="shield-checkmark-outline" iconColor="#1A56DB" bgColor="#EFF6FF" title="Safe Driver" desc="Completed identity verification and background checks." />
            )}
            {rating >= 4.5 && totalRatings > 0 && (
              <BadgeItem icon="star-outline" iconColor="#F59E0B" bgColor="#FFFBEB" title="Top Rated" desc={`Average rating of ${rating.toFixed(1)} stars from ${totalRatings} reviews.`} />
            )}
            {stats.posted_rides >= 50 && (
              <BadgeItem icon="car-outline" iconColor="#10B981" bgColor="#ECFDF5" title="Experienced" desc="Completed 50+ rides on the platform." />
            )}
            {!profile?.profile_completed && rating < 4.5 && (
              <Text style={styles.noBadgeText}>No badges yet. Keep riding to earn them!</Text>
            )}
          </View>
        </SectionCard>

        {/* ── 4. STATISTICS ── */}
        <SectionCard>
          <SectionTitle title="Statistics" />
          <View style={styles.statsGrid}>
            <StatItem icon="time-outline"                value={`${stats.on_time_rate ?? 98}%`}  label="On-Time Rate"  />
            <StatItem icon="chatbubble-ellipses-outline" value={`${stats.response_rate ?? 95}%`} label="Response Rate" />
            <StatItem icon="thumbs-up-outline"           value={stats.posted_rides ?? 0}          label="Completed"     />
            <StatItem icon="close-circle-outline"        value={stats.cancelled_rides ?? 0}       label="Cancelled"     />
          </View>
        </SectionCard>

        {/* ── 5. ABOUT ── */}
        <SectionCard>
          <SectionTitle title="About" />
          <Text style={styles.bioText}>{bio}</Text>
        </SectionCard>

        {/* ── 6. TRAVEL PREFERENCES ── */}
        <SectionCard>
          <SectionTitle title="Travel Preferences" />
          <View style={styles.prefsGrid}>
            <PrefItem icon="musical-notes-outline" label="Music"   value={travelPrefs.music   !== false ? 'Allowed'    : 'Not allowed'}  allowed={travelPrefs.music   !== false} />
            <PrefItem icon="snow-outline"          label="AC"      value={travelPrefs.ac      !== false ? 'Available'  : 'Not available'} allowed={travelPrefs.ac      !== false} />
            <PrefItem icon="paw-outline"           label="Pets"    value={travelPrefs.pets              ? 'Allowed'    : 'Not allowed'}   allowed={travelPrefs.pets}               />
            <PrefItem icon="flame-outline"         label="Smoking" value={travelPrefs.smoking           ? 'Allowed'    : 'Not allowed'}   allowed={travelPrefs.smoking}            />
          </View>
        </SectionCard>

        {/* ── 7. VEHICLE ── */}
        {vehicle && (
          <SectionCard>
            <SectionTitle title="Vehicle Details" />
            <View style={styles.vehicleCard}>
              <View style={styles.vehicleIconCircle}>
                <Ionicons name="car-sport-outline" size={26} color="#1A56DB" />
              </View>
              <View style={{ flex: 1, marginLeft: 14 }}>
                <Text style={styles.vehicleName}>{vehicleName || 'Vehicle'}</Text>
                <Text style={styles.vehicleSubDetail}>{[vehicle.type, vehicle.color].filter(Boolean).join(' · ')}</Text>
              </View>
              {vehicle.registration_number && (
                <View style={styles.licensePlate}>
                  <Text style={styles.licensePlateText}>{vehicle.registration_number}</Text>
                </View>
              )}
            </View>
            {vehicle.photo_url && (
              <Image source={{ uri: buildImageUrl(vehicle.photo_url) }} style={styles.vehiclePhoto} resizeMode="cover" />
            )}
          </SectionCard>
        )}

        {/* ── 8. REVIEWS ── */}
        {reviews.length > 0 && (
          <SectionCard>
            <View style={styles.reviewsHeader}>
              <SectionTitle title={`Reviews (${reviews.length})`} />
              <View style={styles.reviewsRating}>
                <Ionicons name="star" size={16} color="#F59E0B" />
                <Text style={styles.reviewsRatingText}>{rating.toFixed(1)}</Text>
              </View>
            </View>
            {reviews.slice(0, 4).map((review, idx) => <ReviewItem key={idx} review={review} />)}
          </SectionCard>
        )}

        <View style={{ height: 110 }} />
      </ScrollView>

      {/* ── 9. FIXED BOTTOM BUTTONS ── */}
      <View style={styles.fixedActionBar}>
        <TouchableOpacity style={styles.messageBtn} onPress={handleStartChat} activeOpacity={0.85}>
          <Ionicons name="chatbubble-outline" size={20} color="#fff" />
          <Text style={styles.messageBtnText}>Message</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.reportBtn} onPress={handleReport} activeOpacity={0.85}>
          <Ionicons name="flag-outline" size={20} color="#6B7280" />
          <Text style={styles.reportBtnText}>Report</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F3F4F6' },
  loader: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  loadingText: { marginTop: 12, fontSize: 14, color: '#9CA3AF' },
  header: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 14, backgroundColor: '#fff', borderBottomWidth: 0.5, borderBottomColor: '#E5E7EB' },
  backBtn: { width: 44, height: 44, justifyContent: 'center' },
  headerTitle: { flex: 1, textAlign: 'center', fontSize: 18, fontWeight: '700', color: '#111827' },
  errorWrap: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingHorizontal: 30 },
  errorTitle: { fontSize: 20, fontWeight: '700', color: '#111827', marginTop: 16 },
  errorSub: { fontSize: 14, color: '#9CA3AF', marginTop: 8, textAlign: 'center' },
  retryBtn: { marginTop: 20, backgroundColor: '#1A56DB', paddingHorizontal: 28, paddingVertical: 12, borderRadius: 14 },
  retryBtnText: { color: '#fff', fontWeight: '700', fontSize: 15 },
  scrollContent: { paddingBottom: 20 },

  // ── Header ──
  headerWrapper: {
    width: '100%',
    borderBottomLeftRadius: 32,
    borderBottomRightRadius: 32,
    overflow: 'hidden',
    paddingTop: Platform.OS === 'ios' ? 60 : 48,
    paddingBottom: 28,
  },
  // blendMode:'multiply' makes white pixels fully transparent,
  // grey shapes darken the blue gradient = visible watermark effect
  headerBgImage: {
    position: 'absolute',
    top: 0, left: 0, right: 0, bottom: 0,
    width: '90%', height: '150%',
    opacity: 2,
    blendMode: 'screen',
    opacity: 0.35,
    // 'multiply' blend: white(255,255,255) × blue = blue (invisible bg)
    //                   grey(220,220,220) × blue = darker blue (visible shapes)
    //...(Platform.OS === 'ios' ? { blendMode: 'multiply' } : { blendMode: 'multiply' }),
  },
  backBtnLight: { position: 'absolute', top: Platform.OS === 'ios' ? 56 : 44, left: 16, width: 40, height: 40, justifyContent: 'center', zIndex: 10 },
  headerContent: { alignItems: 'center', paddingHorizontal: 20 },
  profileImageContainer: { marginBottom: 12, position: 'relative' },
  profileImage: { width: 100, height: 100, borderRadius: 50, borderWidth: 3, borderColor: 'rgba(255,255,255,0.5)' },
  initialsCircle: { width: 100, height: 100, borderRadius: 50, backgroundColor: 'rgba(255,255,255,0.2)', alignItems: 'center', justifyContent: 'center', borderWidth: 3, borderColor: 'rgba(255,255,255,0.4)' },
  initialsText: { fontSize: 34, fontWeight: '800', color: '#fff' },
  verifiedBadge: { position: 'absolute', bottom: 2, right: 2, backgroundColor: '#fff', borderRadius: 12, padding: 1 },
  profileName: { fontSize: 22, fontWeight: '800', color: '#fff', textAlign: 'center' },
  ratingRow: { flexDirection: 'row', alignItems: 'center', gap: 5, marginTop: 6 },
  ratingText: { fontSize: 16, fontWeight: '700', color: '#fff' },
  ratingCount: { fontSize: 13, color: 'rgba(255,255,255,0.75)' },
  memberSince: { fontSize: 12, color: 'rgba(255,255,255,0.7)', marginTop: 4 },
  verificationPills: { flexDirection: 'row', gap: 8, marginTop: 14, flexWrap: 'wrap', justifyContent: 'center', paddingHorizontal: 16 },
  verifPill: { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: 'rgba(255,255,255,0.18)', paddingHorizontal: 10, paddingVertical: 5, borderRadius: 20 },
  verifPillText: { fontSize: 11, color: 'rgba(255,255,255,0.9)', fontWeight: '600' },

  // ── Cards ──
  sectionCard: { backgroundColor: '#fff', borderRadius: 20, padding: 18, marginHorizontal: 16, marginTop: 14, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.06, shadowRadius: 8, elevation: 2 },
  sectionTitle: { fontSize: 16, fontWeight: '800', color: '#111827', marginBottom: 14 },

  // ── Trust Score ──
  trustRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  trustLeft: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  trustIconCircle: { width: 40, height: 40, borderRadius: 12, backgroundColor: '#FFFBEB', alignItems: 'center', justifyContent: 'center' },
  trustLabel: { fontSize: 15, fontWeight: '700', color: '#111827' },
  trustSubLabel: { fontSize: 12, color: '#F59E0B', fontWeight: '600', marginTop: 2 },
  trustRight: { alignItems: 'flex-end', gap: 6 },
  trustStars: { flexDirection: 'row', gap: 3 },
  trustScoreBadge: { flexDirection: 'row', alignItems: 'baseline', gap: 1 },
  trustScoreNum: { fontSize: 22, fontWeight: '800', color: '#F59E0B' },
  trustScoreOf: { fontSize: 13, color: '#9CA3AF', fontWeight: '500' },

  // ── Badges ──
  badgesRow: { gap: 12 },
  badgeItem: { flexDirection: 'row', alignItems: 'flex-start', gap: 12 },
  badgeIconCircle: { width: 42, height: 42, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  badgeTitle: { fontSize: 14, fontWeight: '700', color: '#111827' },
  badgeDesc: { fontSize: 12, color: '#6B7280', marginTop: 2, lineHeight: 18 },
  noBadgeText: { fontSize: 13, color: '#9CA3AF', textAlign: 'center', paddingVertical: 8 },

  // ── Stats ──
  statsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  statItem: { flex: 1, minWidth: (width - 32 - 36 - 12) / 2, backgroundColor: '#F9FAFB', borderRadius: 14, padding: 14, alignItems: 'center' },
  statIconCircle: { width: 40, height: 40, borderRadius: 20, backgroundColor: '#EFF6FF', alignItems: 'center', justifyContent: 'center', marginBottom: 8 },
  statValue: { fontSize: 20, fontWeight: '800', color: '#111827' },
  statLabel: { fontSize: 11, color: '#9CA3AF', marginTop: 3, textAlign: 'center' },

  // ── Bio ──
  bioText: { fontSize: 14, color: '#4B5563', lineHeight: 22 },

  // ── Prefs ──
  prefsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  prefItem: { flexDirection: 'column', alignItems: 'center', justifyContent: 'center', width: (width - 32 - 36 - 10) / 2, borderRadius: 14, padding: 14, gap: 4 },
  prefLabel: { fontSize: 13, fontWeight: '700', color: '#374151', marginTop: 4 },
  prefValue: { fontSize: 12, fontWeight: '500' },

  // ── Vehicle ──
  vehicleCard: { flexDirection: 'row', alignItems: 'center' },
  vehicleIconCircle: { width: 52, height: 52, borderRadius: 14, backgroundColor: '#EFF6FF', alignItems: 'center', justifyContent: 'center' },
  vehicleName: { fontSize: 16, fontWeight: '700', color: '#111827' },
  vehicleSubDetail: { fontSize: 13, color: '#6B7280', marginTop: 2 },
  licensePlate: { backgroundColor: '#F9FAFB', borderRadius: 8, paddingHorizontal: 10, paddingVertical: 6, borderWidth: 1, borderColor: '#E5E7EB' },
  licensePlateText: { fontSize: 13, fontWeight: '700', color: '#111827', letterSpacing: 1 },
  vehiclePhoto: { width: '100%', height: 130, borderRadius: 14, marginTop: 14 },

  // ── Reviews ──
  reviewsHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 0 },
  reviewsRating: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  reviewsRatingText: { fontSize: 16, fontWeight: '700', color: '#F59E0B' },
  reviewItem: { paddingVertical: 14, borderTopWidth: 1, borderTopColor: '#F3F4F6', marginTop: 6 },
  reviewHeader: { flexDirection: 'row', alignItems: 'flex-start', gap: 10 },
  reviewAvatar: { width: 40, height: 40, borderRadius: 20, backgroundColor: '#E5E7EB', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' },
  reviewAvatarImg: { width: 40, height: 40 },
  reviewAvatarText: { fontSize: 14, fontWeight: '700', color: '#374151' },
  reviewName: { fontSize: 14, fontWeight: '700', color: '#111827' },
  reviewMeta: { flexDirection: 'row', gap: 10, marginTop: 2, flexWrap: 'wrap' },
  reviewRoute: { fontSize: 11, color: '#9CA3AF' },
  reviewDate: { fontSize: 11, color: '#9CA3AF' },
  reviewComment: { fontSize: 13, color: '#4B5563', lineHeight: 20, marginTop: 8 },

  // ── Fixed bottom bar ──
  fixedActionBar: { position: 'absolute', bottom: 0, left: 0, right: 0, flexDirection: 'row', gap: 12, paddingHorizontal: 16, paddingTop: 12, paddingBottom: Platform.OS === 'ios' ? 30 : 16, backgroundColor: '#fff', borderTopWidth: 1, borderTopColor: '#F3F4F6', shadowColor: '#000', shadowOffset: { width: 0, height: -4 }, shadowOpacity: 0.06, shadowRadius: 12, elevation: 10 },
  messageBtn: { flex: 2, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, backgroundColor: '#1A56DB', borderRadius: 16, paddingVertical: 15, shadowColor: '#1A56DB', shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.25, shadowRadius: 12, elevation: 4 },
  messageBtnText: { color: '#fff', fontSize: 16, fontWeight: '700' },
  reportBtn: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, backgroundColor: '#fff', borderRadius: 16, paddingVertical: 15, borderWidth: 1, borderColor: '#E5E7EB' },
  reportBtnText: { color: '#6B7280', fontSize: 15, fontWeight: '600' },
});