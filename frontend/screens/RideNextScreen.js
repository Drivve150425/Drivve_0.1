import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  StatusBar,
  Platform,
  Image,
  ScrollView,
  Modal,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import LottieView from "lottie-react-native";
import { Colors, Typography } from '../constants/Colors';
import { useAuth } from '../context/AuthContext';
import { API_BASE_URL } from '../config/config_ip';
import DatabaseService from '../services/matchingpreference_ds';
import CustomAlert from '../components/CustomAlert';

const IMAGE_BASE_URL = API_BASE_URL;

const QUICK_FILTER_KEYS = [
  'verified_profiles_only',
  'same_gender_after_9pm',
  'smoking_policy',
  'pets_allowed',
  'chat_level',
  'luggage_allowance',
];

const QUICK_FILTER_LABELS = {
  verified_profiles_only: 'Verified Only',
  same_gender_after_9pm: 'Same Gender Night',
  smoking_policy: 'No Smoking',
  pets_allowed: 'Pets',
  chat_level: 'Chat Level',
  luggage_allowance: 'Luggage',
};

const ICON_MAP = {
  smoking_policy: 'smoking',
  speak_languages: 'language',
  chat_level: 'chat',
  age_category: 'person',
  gender_preference: 'wc',
  luggage_allowance: 'luggage',
  pets_allowed: 'pets',
  detours: 'alt-route',
  helmet_policy_driver: 'sports-motorsports',
  helmet_policy_passenger: 'sports-motorsports',
  avoid_frequent_stops: 'timer-off',
  same_gender_after_9pm: 'nightlight',
  verified_profiles_only: 'verified-user',
};

const SORT_OPTIONS = [
  { key: 'time', label: 'Time' },
  { key: 'price', label: 'Price' },
  { key: 'rating', label: 'Rating' },
  { key: 'match', label: 'Match %' },
];

function buildImageUrl(url) {
  if (!url) return null;
  if (url.startsWith('http://') || url.startsWith('https://')) return url;
  return `${IMAGE_BASE_URL}${url.startsWith('/') ? '' : '/'}${url}`;
}

function getDriverInitials(name) {
  if (!name) return 'D';
  const parts = name.trim().split(' ').filter(Boolean);
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
}

function normalizeText(value) {
  if (value === undefined || value === null) return '';
  return String(value).trim().toLowerCase();
}

function prettyPreferenceLabel(key) {
  return QUICK_FILTER_LABELS[key] || key.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
}

function getRidePreferences(item) {
  return item.preferences || item.ridePreferences || item.matchingPreferences || {};
}

function extractPreferenceBadges(item) {
  const prefs = getRidePreferences(item);
  const badges = [];

  Object.entries(prefs || {}).forEach(([key, value]) => {
    if (value === true) {
      badges.push(prettyPreferenceLabel(key));
      return;
    }

    if (typeof value === 'string' && value.trim()) {
      const normalized = normalizeText(value);

      if (key === 'smoking_policy' && normalized.includes('no')) {
        badges.push('No Smoking');
      } else if (key === 'pets_allowed') {
        badges.push(
          normalized === 'true' || normalized === 'yes' ? 'Pets Allowed' : 'No Pets'
        );
      } else if (key === 'chat_level') {
        badges.push(value);
      } else if (key === 'luggage_allowance') {
        badges.push(value);
      } else if (
        key === 'same_gender_after_9pm' &&
        (normalized === 'true' || normalized === 'yes')
      ) {
        badges.push('Same Gender Night');
      }
    }
  });

  return [...new Set(badges)].slice(0, 3);
}

function matchesQuickFilter(item, key) {
  const prefs = getRidePreferences(item);
  const value = prefs?.[key];
  const normalized = normalizeText(value);

  if (key === 'verified_profiles_only') {
    return !!item.profileCompleted;
  }

  if (typeof value === 'boolean') return value;
  if (Array.isArray(value)) return value.length > 0;

  if (key === 'smoking_policy') {
    return normalized.includes('no');
  }

  if (key === 'same_gender_after_9pm') {
    return normalized === 'true' || normalized === 'yes' || normalized === 'same gender';
  }

  if (key === 'pets_allowed') {
    return normalized === 'true' || normalized === 'yes' || normalized === 'allowed';
  }

  return !!normalized;
}

function matchesAdvancedFilter(item, key, expectedValue) {
  if (expectedValue === undefined || expectedValue === null || expectedValue === '') {
    return true;
  }

  const prefs = getRidePreferences(item);
  const rideValue = prefs?.[key];

  if (typeof expectedValue === 'boolean') {
    if (key === 'verified_profiles_only') {
      return expectedValue ? !!item.profileCompleted : true;
    }
    return rideValue === expectedValue || normalizeText(rideValue) === String(expectedValue);
  }

  if (Array.isArray(rideValue)) {
    return rideValue.map(v => normalizeText(v)).includes(normalizeText(expectedValue));
  }

  return normalizeText(rideValue) === normalizeText(expectedValue);
}

export default function RideNextScreen({ navigation, route }) {
  const { user, loading: authLoading } = useAuth();
  const { searchData } = route.params || {};
  const { from, to, fromCoords, toCoords, dateTime, seats } = searchData || {};

  const [availableRides, setAvailableRides] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');
  const [sortBy, setSortBy] = useState('time');
  const [quickFilters, setQuickFilters] = useState([]);
  const [headerFiltersVisible, setHeaderFiltersVisible] = useState(false);
  const [filterModalVisible, setFilterModalVisible] = useState(false);
  const [preferenceMaster, setPreferenceMaster] = useState([]);
  const [userPreferences, setUserPreferences] = useState({});
  const [advancedFilters, setAdvancedFilters] = useState({});

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

  const phoneNumber = user?.phone_number;

  const fetchAvailableRides = useCallback(async () => {
    if (!searchData || !fromCoords || !toCoords || !dateTime) {
      setAvailableRides([]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setErrorMessage('');

      const response = await fetch(`${API_BASE_URL}/search-rides`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          from_location: from,
          to_location: to,
          from_coords: fromCoords,
          to_coords: toCoords,
          departure_time: new Date(dateTime).toISOString(),
          seats_required: seats || 1,
        }),
      });

      const rawText = await response.text();
      let parsedData = null;

      try {
        parsedData = rawText ? JSON.parse(rawText) : {};
      } catch (parseError) {
        parsedData = { detail: rawText || 'Unexpected server response' };
      }

      if (!response.ok) {
        throw new Error(parsedData?.detail || 'Failed to fetch rides');
      }

      setAvailableRides(Array.isArray(parsedData?.rides) ? parsedData.rides : []);
    } catch (error) {
      console.log('❌ search-rides error:', error);
      setAvailableRides([]);
      setErrorMessage(error.message || 'Failed to search rides');
      showCustomAlert('Search Error', error.message || 'Failed to search rides', 'error');
    } finally {
      setLoading(false);
    }
  }, [searchData, from, to, fromCoords, toCoords, dateTime, seats]);

  const loadPreferenceData = useCallback(async () => {
    try {
      const defs = await DatabaseService.getMatchingPreferenceMaster();
      setPreferenceMaster(defs || []);

      if (phoneNumber) {
        const saved = await DatabaseService.getUserMatchingPreferences(phoneNumber);
        setUserPreferences(saved || {});
      }
    } catch (e) {
      console.log('❌ preference load error:', e);
    }
  }, [phoneNumber]);

  useEffect(() => {
    if (authLoading) return;
    fetchAvailableRides();
    loadPreferenceData();
  }, [authLoading, fetchAvailableRides, loadPreferenceData]);

  const quickFilterOptions = useMemo(() => {
    const defs = preferenceMaster.filter(pref => QUICK_FILTER_KEYS.includes(pref.key));
    return defs.slice(0, 3).map(pref => ({
      key: pref.key,
      label: QUICK_FILTER_LABELS[pref.key] || pref.label,
    }));
  }, [preferenceMaster]);

  const advancedFilterOptions = useMemo(() => {
    return preferenceMaster.filter(pref => {
      if (!pref?.key) return false;
      if (quickFilterOptions.some(q => q.key === pref.key)) return false;
      return ['toggle', 'single_select'].includes(pref.input_type);
    });
  }, [preferenceMaster, quickFilterOptions]);

  const processedRides = useMemo(() => {
    let rides = [...availableRides];

    if (quickFilters.length > 0) {
      rides = rides.filter(item =>
        quickFilters.every(key => matchesQuickFilter(item, key))
      );
    }

    const activeAdvanced = Object.entries(advancedFilters).filter(
      ([, value]) =>
        value !== '' &&
        value !== null &&
        value !== undefined &&
        value !== false
    );

    if (activeAdvanced.length > 0) {
      rides = rides.filter(item =>
        activeAdvanced.every(([key, value]) =>
          matchesAdvancedFilter(item, key, value)
        )
      );
    }

    rides.sort((a, b) => {
      if (sortBy === 'price') return (a.price || 0) - (b.price || 0);
      if (sortBy === 'rating') return (b.rating || 0) - (a.rating || 0);
      if (sortBy === 'match') return (b.matchPercentage || 0) - (a.matchPercentage || 0);

      const aDate = new Date(`${a.date || ''} ${a.time || ''}`);
      const bDate = new Date(`${b.date || ''} ${b.time || ''}`);
      if (!isNaN(aDate) && !isNaN(bDate)) return aDate - bDate;
      return 0;
    });

    return rides;
  }, [availableRides, quickFilters, advancedFilters, sortBy]);

  const handleCardPress = (ride) => {
    navigation.navigate('RideDetailScreen', { 
      ride,
      searchData: searchData || null,
    });
  };

  const toggleQuickFilter = (key) => {
    setQuickFilters(prev =>
      prev.includes(key) ? prev.filter(i => i !== key) : [...prev, key]
    );
  };

  const clearAllFilters = () => {
    setQuickFilters([]);
    setAdvancedFilters({});
    showCustomAlert('Filters Cleared', 'All filters have been reset.', 'info');
  };

  const renderAdvancedFilterControl = (pref) => {
    const currentValue = advancedFilters[pref.key];

    if (pref.input_type === 'toggle') {
      const active = !!currentValue;
      return (
        <TouchableOpacity
          activeOpacity={0.85}
          style={[styles.modalToggleChip, active && styles.modalToggleChipActive]}
          onPress={() =>
            setAdvancedFilters(prev => ({ ...prev, [pref.key]: !active }))
          }
        >
          <Text
            style={[
              styles.modalToggleChipText,
              active && styles.modalToggleChipTextActive,
            ]}
          >
            {pref.label}
          </Text>
        </TouchableOpacity>
      );
    }

    if (pref.input_type === 'single_select' && Array.isArray(pref.options)) {
      return (
        <View style={styles.modalOptionWrap}>
          {pref.options.map((opt) => {
            const active = currentValue === opt;
            return (
              <TouchableOpacity
                key={opt}
                activeOpacity={0.85}
                style={[
                  styles.modalOptionChip,
                  active && styles.modalOptionChipActive,
                ]}
                onPress={() =>
                  setAdvancedFilters(prev => ({
                    ...prev,
                    [pref.key]: active ? '' : opt,
                  }))
                }
              >
                <Text
                  style={[
                    styles.modalOptionChipText,
                    active && styles.modalOptionChipTextActive,
                  ]}
                >
                  {opt}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      );
    }

    return null;
  };

  const renderRideCard = ({ item }) => {
    const profilePhotoUrl = buildImageUrl(
      item.profilePicture || item.profilepicture || item.profilePhoto
    );
    const avatarText = getDriverInitials(item.driverName || 'Driver');

    const vehicleLabel = item.vehicle
      ? [item.vehicle.make, item.vehicle.model].filter(Boolean).join(' ')
      : 'Vehicle details unavailable';

    const preferenceBadges = extractPreferenceBadges(item);

    return (
      <TouchableOpacity
        style={styles.rideCard}
        onPress={() => handleCardPress(item)}
        activeOpacity={0.9}
      >
        <View style={styles.cardTopRow}>
          <View style={styles.profileRow}>
            <View style={styles.avatarContainer}>
              {profilePhotoUrl ? (
                <Image
                  source={{ uri: profilePhotoUrl }}
                  style={styles.avatarImage}
                  resizeMode="cover"
                />
              ) : (
                <Text style={styles.avatarFallback}>{avatarText}</Text>
              )}
            </View>

            <View style={styles.profileContent}>
              <View style={styles.nameRow}>
                <Text style={styles.driverName} numberOfLines={1}>
                  {item.driverName || 'Driver'}
                </Text>

                {item.profileCompleted ? (
                  <View style={styles.verifiedBadge}>
                    <Ionicons
                      name="checkmark-circle"
                      size={12}
                      color="#16A34A"
                    />
                    <Text style={styles.verifiedText}>Verified</Text>
                  </View>
                ) : null}
              </View>

              <View style={styles.ratingRow}>
                <Ionicons name="star" size={12} color="#F59E0B" />
                <Text style={styles.ratingText}>{item.rating ?? 4.5}</Text>
              </View>
            </View>
          </View>

          <View style={styles.priceMatchWrap}>
            <View style={styles.matchBadge}>
              <Text style={styles.matchText}>{item.matchPercentage || 0}%</Text>
            </View>
            <Text style={styles.priceText}>₹{item.price}</Text>
            <Text style={styles.perSeatText}>per seat</Text>
          </View>
        </View>

        <View style={styles.infoRow}>
          <View style={styles.infoItem}>
            <Ionicons name="calendar-outline" size={13} color={Colors.gray} />
            <Text style={styles.infoText} numberOfLines={1}>
              {item.date}
            </Text>
          </View>

          <View style={styles.infoDot} />

          <View style={styles.infoItem}>
            <Ionicons name="time-outline" size={13} color={Colors.gray} />
            <Text style={styles.infoText} numberOfLines={1}>
              {item.time}
            </Text>
          </View>

          <View style={styles.infoDot} />

          <View style={styles.infoItem}>
            <Ionicons name="people-outline" size={13} color={Colors.gray} />
            <Text style={styles.infoText} numberOfLines={1}>
              {item.seatsAvailable} left
            </Text>
          </View>
        </View>

        <View style={styles.divider} />

        <View style={styles.routeBlock}>
          <View style={styles.routeRow}>
            <View style={[styles.routeDot, { backgroundColor: '#22C55E' }]} />
            <View style={styles.routeTextWrap}>
              <Text style={styles.routeLabel}>Pickup</Text>
              <Text style={styles.routeText} numberOfLines={1}>
                {item.pickupLabel || 'Pickup point'}
              </Text>
            </View>
          </View>

          <View style={styles.routeRow}>
            <View style={[styles.routeDot, { backgroundColor: '#F97316' }]} />
            <View style={styles.routeTextWrap}>
              <Text style={styles.routeLabel}>Drop</Text>
              <Text style={styles.routeText} numberOfLines={1}>
                {item.dropLabel || 'Drop point'}
              </Text>
            </View>
          </View>
        </View>

        <View style={styles.vehicleRow}>
          <Ionicons name="car-sport-outline" size={14} color={Colors.gray} />
          <Text style={styles.vehicleText} numberOfLines={1}>
            {vehicleLabel}
          </Text>
        </View>

        {preferenceBadges.length > 0 ? (
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.badgeScroll}
          >
            {preferenceBadges.map((badge) => (
              <View key={badge} style={styles.prefBadge}>
                <Text style={styles.prefBadgeText}>{badge}</Text>
              </View>
            ))}
          </ScrollView>
        ) : null}
      </TouchableOpacity>
    );
  };

  if (authLoading || loading) {
    return (
      <View style={styles.loadingContainer}>
        <LottieView
          source={require("../assets/loading.json")}
          autoPlay
          loop
          style={{ width: 300, height: 300 }}
        />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={Colors.white} />

      {/* Header - Matching SavedAddressesScreen style */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <MaterialIcons name="arrow-back-ios" size={24} color="#ED7117" />
        </TouchableOpacity>

        <Text style={styles.headerTitle}>Available Rides</Text>

        <TouchableOpacity
          style={[
            styles.filterButton,
            headerFiltersVisible && styles.filterButtonActive
          ]}
          onPress={() => setHeaderFiltersVisible(prev => !prev)}
        >
          <Ionicons name="options-outline" size={22} color="#ED7117" />
        </TouchableOpacity>
      </View>

      {headerFiltersVisible ? (
        <View style={styles.topControlsWrap}>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.filterScroll}
          >
            {quickFilterOptions.map((filter) => {
              const active = quickFilters.includes(filter.key);
              return (
                <TouchableOpacity
                  key={filter.key}
                  activeOpacity={0.85}
                  style={[styles.quickChip, active && styles.quickChipActive]}
                  onPress={() => toggleQuickFilter(filter.key)}
                >
                  <Text
                    style={[
                      styles.quickChipText,
                      active && styles.quickChipTextActive,
                    ]}
                  >
                    {filter.label}
                  </Text>
                </TouchableOpacity>
              );
            })}

            <TouchableOpacity
              activeOpacity={0.85}
              style={styles.moreFilterChip}
              onPress={() => setFilterModalVisible(true)}
            >
              <Ionicons name="options-outline" size={14} color="#ED7117" />
              <Text style={styles.moreFilterChipText}>More Filters</Text>
            </TouchableOpacity>
          </ScrollView>

          <Text style={styles.sortLabel}>Sort by</Text>

          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.sortScroll}
          >
            {SORT_OPTIONS.map((option) => {
              const active = sortBy === option.key;
              return (
                <TouchableOpacity
                  key={option.key}
                  activeOpacity={0.85}
                  style={[styles.sortChip, active && styles.sortChipActive]}
                  onPress={() => setSortBy(option.key)}
                >
                  <Text
                    style={[
                      styles.sortChipText,
                      active && styles.sortChipTextActive,
                    ]}
                  >
                    {option.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </View>
      ) : null}

      {processedRides.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Ionicons name="car-outline" size={80} color={Colors.gray} />
          <Text style={styles.emptyTitle}>No Rides Found</Text>
          <Text style={styles.emptySubtitle}>
            {errorMessage
              ? errorMessage
              : 'Try changing your filters or search again.'}
          </Text>

          <TouchableOpacity style={styles.clearButton} onPress={clearAllFilters}>
            <Text style={styles.clearButtonText}>Clear Filters</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={processedRides}
          renderItem={renderRideCard}
          keyExtractor={(item) => String(item.id)}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          ItemSeparatorComponent={() => <View style={{ height: 12 }} />}
        />
      )}

      <Modal
        visible={filterModalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setFilterModalVisible(false)}
      >
        <View style={styles.modalBackdrop}>
          <TouchableOpacity
            style={styles.modalOverlay}
            activeOpacity={1}
            onPress={() => setFilterModalVisible(false)}
          />

          <View style={styles.modalSheet}>
            <View style={styles.modalHandle} />

            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>More Filters</Text>
              <TouchableOpacity onPress={() => setFilterModalVisible(false)}>
                <Ionicons name="close" size={24} color={Colors.dark} />
              </TouchableOpacity>
            </View>

            <ScrollView
              showsVerticalScrollIndicator={false}
              contentContainerStyle={styles.modalContent}
            >
              {advancedFilterOptions.map((pref) => (
                <View key={pref.key} style={styles.modalSection}>
                  <Text style={styles.modalSectionTitle}>{pref.label}</Text>
                  {renderAdvancedFilterControl(pref)}
                </View>
              ))}
            </ScrollView>

            <View style={styles.modalFooter}>
              <TouchableOpacity
                style={styles.modalSecondaryBtn}
                onPress={clearAllFilters}
              >
                <Text style={styles.modalSecondaryBtnText}>Clear</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.modalPrimaryBtn}
                onPress={() => setFilterModalVisible(false)}
              >
                <Text style={styles.modalPrimaryBtnText}>Apply Filters</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

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

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 0.5,
    borderBottomColor: '#fff',
    backgroundColor: Colors.white,
  },
  backButton: {
    width: 44,
    height: 44,
    justifyContent: 'center',
  },
  filterButton: {
    width: 44,
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 22,
  },
  filterButtonActive: {
    backgroundColor: '#fff',
  },
  headerTitle: {
    ...Typography.h2,
    fontSize: 28,
    fontWeight: '700',
    color: Colors.primary,
    flex: 1,
    textAlign: 'center',
  },
  topControlsWrap: {
    backgroundColor: Colors.white,
    paddingTop: 10,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#EEF2F7',
  },
  filterScroll: {
    paddingHorizontal: 16,
    gap: 10,
  },
  quickChip: {
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 20,
    backgroundColor: '#F3F4F6',
  },
  quickChipActive: {
    backgroundColor: Colors.primary,
  },
  quickChipText: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.dark,
  },
  quickChipTextActive: {
    color: Colors.white,
  },
  moreFilterChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 20,
    backgroundColor: '#EEF6FF',
  },
  moreFilterChipText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#ED7117',
  },
  sortLabel: {
    paddingHorizontal: 16,
    marginTop: 12,
    marginBottom: 8,
    fontSize: 12,
    color: Colors.gray,
    fontWeight: '700',
  },
  sortScroll: {
    paddingHorizontal: 16,
    gap: 10,
  },
  sortChip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 14,
    backgroundColor: '#F3F4F6',
  },
  sortChipActive: {
    backgroundColor: '#ED7117',
  },
  sortChipText: {
    fontSize: 12,
    color: Colors.dark,
    fontWeight: '600',
  },
  sortChipTextActive: {
    color: Colors.white,
  },
  listContent: {
    padding: 16,
    paddingBottom: 28,
  },
  rideCard: {
    backgroundColor: Colors.white,
    borderRadius: 18,
    padding: 14,
    borderWidth: 1,
    borderColor: '#EEF2F7',
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.05,
    shadowRadius: 14,
    elevation: 2,
  },
  cardTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  profileRow: {
    flexDirection: 'row',
    flex: 1,
    paddingRight: 10,
  },
  avatarContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#E5E7EB',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    marginRight: 10,
  },
  avatarImage: {
    width: 48,
    height: 48,
  },
  avatarFallback: {
    fontSize: 14,
    fontWeight: '800',
    color: Colors.gray,
  },
  profileContent: {
    flex: 1,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 6,
  },
  driverName: {
    fontSize: 15,
    fontWeight: '800',
    color: Colors.dark,
    maxWidth: '100%',
  },
  verifiedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  verifiedText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#16A34A',
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 4,
  },
  ratingText: {
    fontSize: 12,
    color: Colors.gray,
    fontWeight: '600',
  },
  priceMatchWrap: {
    alignItems: 'flex-end',
  },
  matchBadge: {
    backgroundColor: '#EEF6FF',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 10,
    marginBottom: 6,
  },
  matchText: {
    fontSize: 12,
    fontWeight: '800',
    color: Colors.primary,
  },
  priceText: {
    fontSize: 18,
    fontWeight: '800',
    color: '#ED7117',
    lineHeight: 20,
  },
  perSeatText: {
    fontSize: 10,
    color: Colors.gray,
    fontWeight: '600',
    marginTop: 2,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    marginTop: 12,
    marginBottom: 10,
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  infoText: {
    fontSize: 12,
    color: Colors.dark,
    fontWeight: '600',
  },
  infoDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#CBD5E1',
    marginHorizontal: 8,
  },
  divider: {
    height: 1,
    backgroundColor: '#EEF2F7',
    marginBottom: 10,
  },
  routeBlock: {
    gap: 8,
  },
  routeRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  routeDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginTop: 5,
    marginRight: 8,
  },
  routeTextWrap: {
    flex: 1,
  },
  routeLabel: {
    fontSize: 11,
    color: Colors.gray,
    fontWeight: '700',
    marginBottom: 1,
  },
  routeText: {
    fontSize: 13,
    color: Colors.dark,
    fontWeight: '600',
  },
  vehicleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 10,
  },
  vehicleText: {
    fontSize: 12,
    color: Colors.gray,
    fontWeight: '600',
    flex: 1,
  },
  badgeScroll: {
    gap: 8,
    paddingTop: 10,
  },
  prefBadge: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 12,
    backgroundColor: '#FFF7ED',
    marginRight: 8,
  },
  prefBadgeText: {
    fontSize: 11,
    color: '#C2410C',
    fontWeight: '700',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.white,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  emptyTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: Colors.dark,
    marginTop: 20,
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 15,
    color: Colors.gray,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 24,
  },
  clearButton: {
    backgroundColor: Colors.primary,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
  },
  clearButtonText: {
    color: Colors.white,
    fontSize: 15,
    fontWeight: '700',
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(15,23,42,0.28)',
    justifyContent: 'flex-end',
  },
  modalOverlay: {
    flex: 1,
  },
  modalSheet: {
    backgroundColor: Colors.white,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: '78%',
    paddingTop: 10,
  },
  modalHandle: {
    width: 52,
    height: 5,
    borderRadius: 999,
    backgroundColor: '#D1D5DB',
    alignSelf: 'center',
    marginBottom: 14,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 18,
    paddingBottom: 10,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: Colors.dark,
  },
  modalContent: {
    paddingHorizontal: 18,
    paddingBottom: 20,
  },
  modalSection: {
    marginBottom: 18,
  },
  modalSectionTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.dark,
    marginBottom: 10,
  },
  modalToggleChip: {
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    paddingHorizontal: 14,
    paddingVertical: 10,
    alignSelf: 'flex-start',
    backgroundColor: '#F9FAFB',
  },
  modalToggleChipActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  modalToggleChipText: {
    fontSize: 13,
    color: Colors.dark,
    fontWeight: '600',
  },
  modalToggleChipTextActive: {
    color: Colors.white,
  },
  modalOptionWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  modalOptionChip: {
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    paddingHorizontal: 12,
    paddingVertical: 9,
    backgroundColor: '#F9FAFB',
  },
  modalOptionChipActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  modalOptionChipText: {
    fontSize: 13,
    color: Colors.dark,
    fontWeight: '600',
  },
  modalOptionChipTextActive: {
    color: Colors.white,
  },
  modalFooter: {
    flexDirection: 'row',
    paddingHorizontal: 18,
    paddingTop: 12,
    paddingBottom: Platform.OS === 'ios' ? 28 : 18,
    borderTopWidth: 1,
    borderTopColor: '#EEF2F7',
    gap: 12,
  },
  modalSecondaryBtn: {
    flex: 1,
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: 'center',
    backgroundColor: '#F3F4F6',
  },
  modalSecondaryBtnText: {
    fontSize: 15,
    fontWeight: '700',
    color: Colors.dark,
  },
  modalPrimaryBtn: {
    flex: 1,
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: 'center',
    backgroundColor: Colors.primary,
  },
  modalPrimaryBtnText: {
    fontSize: 15,
    fontWeight: '700',
    color: Colors.white,
  },
});