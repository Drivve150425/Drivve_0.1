import React, { useState, useRef, useMemo, useEffect } from 'react';
import { View, Text, TouchableOpacity, Animated, StyleSheet } from 'react-native';
import MapView, { Polyline, Marker, PROVIDER_GOOGLE } from 'react-native-maps';
import { Colors } from '../../constants/Colors';
import { Ionicons } from '@expo/vector-icons';
import CustomAlert from '../../components/CustomAlert';

/* =========================================
   HELPERS
========================================= */

function parseDurationToMinutes(durationStr) {
  if (!durationStr) return 0;
  let mins = 0;
  const hrMatch = durationStr.match(/(\d+)\s*Hr/i);
  const minMatch = durationStr.match(/(\d+)\s*Min/i);
  if (hrMatch) mins += parseInt(hrMatch[1], 10) * 60;
  if (minMatch) mins += parseInt(minMatch[1], 10);
  return mins;
}

function formatDurationHHMM(durationStr) {
  const totalMins = parseDurationToMinutes(durationStr);
  const hrs = Math.floor(totalMins / 60);
  const mins = totalMins % 60;
  if (hrs > 0 && mins > 0) return `${hrs}h ${mins.toString().padStart(2, '0')}m`;
  if (hrs > 0) return `${hrs}h`;
  return `${mins}m`;
}

function getRouteLabels(routeOptions) {
  if (!routeOptions || routeOptions.length === 0) return [];

  const withMeta = routeOptions.map((r, idx) => ({
    idx,
    distance: parseFloat(r.distance) || 0,
    durationMins: parseDurationToMinutes(r.duration),
  }));

  const fastestIdx = withMeta.reduce((best, cur) =>
    cur.durationMins < best.durationMins ? cur : best
  , withMeta[0]).idx;

  const shortestIdx = withMeta.reduce((best, cur) =>
    cur.distance < best.distance ? cur : best
  , withMeta[0]).idx;

  return routeOptions.map((_, idx) => {
    if (routeOptions.length === 1) return 'Recommended';
    if (idx === fastestIdx && idx === shortestIdx) return 'Fastest & Shortest';
    if (idx === fastestIdx) return 'Fastest';
    if (idx === shortestIdx) return 'Shortest';
    return 'Alternative';
  });
}

const LABEL_COLORS = {
  'Fastest & Shortest': '#16A34A',
  'Fastest': '#2563EB',
  'Shortest': '#7C3AED',
  'Recommended': '#2563EB',
  'Alternative': '#6B7280',
};

const LABEL_ICONS = {
  'Fastest & Shortest': 'flash',
  'Fastest': 'flash',
  'Shortest': 'navigate',
  'Recommended': 'star',
  'Alternative': 'map-outline',
};

/* =========================================
   COMPONENT
========================================= */

export default function Step2({
  routeOptions,
  selectedRouteIndex,
  setSelectedRouteIndex,
  onNext,
}) {
  const mapRef = useRef(null);

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

  const labels = useMemo(() => getRouteLabels(routeOptions), [routeOptions]);

  const selectedRoute = routeOptions?.[selectedRouteIndex];

  useEffect(() => {
    if (selectedRoute?.geometry?.length > 0 && mapRef.current) {
      const coords = selectedRoute.geometry;
      const lats = coords.map(c => c.latitude);
      const lngs = coords.map(c => c.longitude);
      const minLat = Math.min(...lats);
      const maxLat = Math.max(...lats);
      const minLng = Math.min(...lngs);
      const maxLng = Math.max(...lngs);
      const midLat = (minLat + maxLat) / 2;
      const midLng = (minLng + maxLng) / 2;
      const latDelta = Math.max(0.02, (maxLat - minLat) * 1.4);
      const lngDelta = Math.max(0.02, (maxLng - minLng) * 1.4);

      mapRef.current.animateToRegion({
        latitude: midLat,
        longitude: midLng,
        latitudeDelta: latDelta,
        longitudeDelta: lngDelta,
      }, 500);
    }
  }, [selectedRouteIndex, selectedRoute]);

  const handleNext = () => {
    if (!selectedRoute) {
      showCustomAlert("No Route Selected", "Please select a route to continue.", "warning");
      return;
    }
    onNext();
  };

  if (!routeOptions || routeOptions.length === 0) {
    return (
      <View style={{ padding: 20, alignItems: 'center' }}>
        <Text style={{ color: Colors.gray }}>No routes found. Please check your locations.</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Select Route</Text>

      <View style={styles.mapWrap}>
        <MapView
          ref={mapRef}
          provider={PROVIDER_GOOGLE}
          style={styles.map}
          initialRegion={{
            latitude: selectedRoute.geometry[0].latitude,
            longitude: selectedRoute.geometry[0].longitude,
            latitudeDelta: 0.1,
            longitudeDelta: 0.1
          }}
        >
          <Polyline
            coordinates={selectedRoute.geometry}
            strokeWidth={5}
            strokeColor={Colors.primary}
          />
          <Marker coordinate={selectedRoute.geometry[0]}>
            <View style={[styles.markerDot, { backgroundColor: '#22C55E' }]} />
            <View style={styles.markerLabel}>
              <Text style={styles.markerLabelText}>Start</Text>
            </View>
          </Marker>
          <Marker coordinate={selectedRoute.geometry[selectedRoute.geometry.length - 1]}>
            <View style={[styles.markerDot, { backgroundColor: '#EF4444' }]} />
            <View style={styles.markerLabel}>
              <Text style={styles.markerLabelText}>End</Text>
            </View>
          </Marker>
        </MapView>
      </View>

      <View style={styles.drawer}>
        <Text style={styles.drawerTitle}>Route Options</Text>

        {routeOptions.map((opt, index) => {
          const label = labels[index] || 'Route';
          const labelColor = LABEL_COLORS[label] || Colors.primary;
          const iconName = LABEL_ICONS[label] || 'map-outline';
          const isSelected = selectedRouteIndex === index;
          const durationHHMM = formatDurationHHMM(opt.duration);

          return (
            <TouchableOpacity
              key={index}
              onPress={() => setSelectedRouteIndex(index)}
              style={[
                styles.routeCard,
                isSelected && styles.routeCardSelected,
              ]}
              activeOpacity={0.85}
            >
              <View style={styles.routeCardLeft}>
                <View style={[styles.labelBadge, { backgroundColor: labelColor + '15' }]}>
                  <Ionicons name={iconName} size={14} color={labelColor} />
                  <Text style={[styles.labelBadgeText, { color: labelColor }]}>{label}</Text>
                </View>
                <Text style={styles.routeDistance}>{opt.distance} KM</Text>
                <Text style={styles.routeDuration}>{durationHHMM}</Text>
              </View>

              <View style={styles.routeCardRight}>
                {isSelected ? (
                  <View style={styles.selectedCircle}>
                    <Ionicons name="checkmark" size={16} color="#fff" />
                  </View>
                ) : (
                  <View style={styles.unselectedCircle} />
                )}
              </View>
            </TouchableOpacity>
          );
        })}
      </View>

      <TouchableOpacity
        style={[styles.actionButton, { backgroundColor: Colors.primary }]}
        onPress={handleNext}
        activeOpacity={0.8}
      >
        <Text style={styles.actionButtonText}>Continue</Text>
      </TouchableOpacity>

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
    </View>
  );
}

/* =========================================
   STYLES
========================================= */

const styles = StyleSheet.create({
  container: {
    padding: 18,
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderRadius: 28,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.15,
    shadowRadius: 20,
    elevation: 10,
    borderWidth: 1,
    borderColor: 'rgba(229, 231, 235, 0.5)',
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 12,
    color: Colors.dark,
  },
  mapWrap: {
    height: 320,
    marginBottom: 12,
    borderRadius: 16,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  map: {
    flex: 1,
  },
  markerDot: {
    width: 14,
    height: 14,
    borderRadius: 7,
    borderWidth: 2,
    borderColor: '#fff',
  },
  markerLabel: {
    backgroundColor: 'rgba(0,0,0,0.7)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    marginTop: 2,
    alignSelf: 'center',
  },
  markerLabelText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: '700',
  },
  drawer: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 14,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
    marginBottom: 4,
  },
  drawerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.dark,
    marginBottom: 12,
  },
  routeCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 14,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: '#F3F4F6',
    marginBottom: 10,
    backgroundColor: '#FAFBFC',
  },
  routeCardSelected: {
    borderColor: Colors.primary,
    backgroundColor: '#EFF6FF',
  },
  routeCardLeft: {
    flex: 1,
  },
  labelBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 20,
    marginBottom: 8,
    gap: 6,
  },
  labelBadgeText: {
    fontSize: 12,
    fontWeight: '800',
  },
  routeDistance: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.dark,
    marginBottom: 2,
  },
  routeDuration: {
    fontSize: 13,
    color: Colors.gray,
    fontWeight: '600',
  },
  routeCardRight: {
    marginLeft: 12,
  },
  selectedCircle: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  unselectedCircle: {
    width: 28,
    height: 28,
    borderRadius: 14,
    borderWidth: 2,
    borderColor: '#D1D5DB',
  },
  actionButton: {
    borderRadius: 16,
    overflow: 'hidden',
    marginTop: 14,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 8,
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionButtonText: {
    color: Colors.white,
    fontSize: 18,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
});