import React, { useEffect, useState, useMemo } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Switch,
  StyleSheet,
  Modal,
} from 'react-native';
import { MaterialIcons, Ionicons } from '@expo/vector-icons';
import LottieView from "lottie-react-native";
import DatabaseService from '../../services/myvehicle_ds';
import matchpreferenceDatabaseService from '../../services/matchingpreference_ds';
import CustomAlert from '../../components/CustomAlert';

import { Colors } from '../../constants/Colors';
import { useFocusEffect } from '@react-navigation/native';

/* =========================================
   GROUP HELPER
========================================= */

const groupByCategory = (list = []) =>
  list.reduce((acc, i) => {
    acc[i.category] = acc[i.category] || [];
    acc[i.category].push(i);
    return acc;
  }, {});

/* =========================================
   PREFERENCE LABELS MAP
========================================= */

const PREFERENCE_LABELS = {
  smoking_policy: { label: 'Smoking', getValue: (v) => v },
  speak_languages: { label: 'Languages', getValue: (v) => Array.isArray(v) ? v.join(', ') : v },
  chat_level: { label: 'Chat', getValue: (v) => v },
  age_category: { label: 'Age', getValue: (v) => v },
  gender_preference: { label: 'Gender', getValue: (v) => v },
  luggage_allowance: { label: 'Luggage', getValue: (v) => v },
  pets_allowed: { label: 'Pets', getValue: (v) => v ? 'Allowed' : 'Not allowed' },
  detours: { label: 'Detours', getValue: (v) => v ? 'Allowed' : 'Not allowed' },
  helmet_policy_driver: { label: 'Helmet (Driver)', getValue: (v) => v ? 'Required' : 'Optional' },
  helmet_policy_passenger: { label: 'Helmet (Passenger)', getValue: (v) => v ? 'Required' : 'Optional' },
  avoid_frequent_stops: { label: 'Avoid Stops', getValue: (v) => v ? 'Yes' : 'No' },
  same_gender_after_9pm: { label: 'Same Gender (Night)', getValue: (v) => v ? 'Yes' : 'No' },
  verified_profiles_only: { label: 'Verified Only', getValue: (v) => v ? 'Yes' : 'No' },
};

/* =========================================
   STEP 3
========================================= */

export default function Step3({ phoneNumber, onNext, navigation, setVehicleId, vehicleId: initialVehicleId }) {

  const [master, setMaster] = useState([]);
  const [values, setValues] = useState({});
  const [loading, setLoading] = useState(true);

  // Vehicle states
  const [vehicles, setVehicles] = useState([]);
  const [selectedVehicle, setSelectedVehicle] = useState(null);
  const [showVehicleModal, setShowVehicleModal] = useState(false);
  const [loadingVehicles, setLoadingVehicles] = useState(true);

  // Ride preferences toggle
  const [showPreferences, setShowPreferences] = useState(false);
  const [preferencesSummary, setPreferencesSummary] = useState(null);

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

  useEffect(() => {
    loadPrefs();
    loadVehicles();
  }, []);

  // Reload vehicles and preferences when screen comes into focus
  useFocusEffect(
    React.useCallback(() => {
      loadVehicles();
      loadPrefs();
    }, [phoneNumber])
  );

  const loadVehicles = async () => {
    if (!phoneNumber) {
      setLoadingVehicles(false);
      return;
    }
    try {
      const data = await DatabaseService.getVehicles(phoneNumber);
      const vehicleList = Array.isArray(data) ? data : [];
      setVehicles(vehicleList);

      // Auto-select first vehicle or the one passed from parent
      if (initialVehicleId) {
        const existing = vehicleList.find(v => v.id === initialVehicleId);
        if (existing) {
          setSelectedVehicle(existing);
        }
      } else if (vehicleList.length > 0 && !selectedVehicle) {
        setSelectedVehicle(vehicleList[0]);
        setVehicleId(vehicleList[0].id);
      }
    } catch (e) {
      console.log("Vehicle load error", e);
      showCustomAlert('Error', 'Failed to load vehicles', 'error');
    } finally {
      setLoadingVehicles(false);
    }
  };

  const loadPrefs = async () => {
    try {
      const defs = await matchpreferenceDatabaseService.getMatchingPreferenceMaster();
      const userVals = await matchpreferenceDatabaseService.getUserMatchingPreferences(phoneNumber);

      setMaster(defs || []);
      setValues(userVals || {});
      
      // If user has saved preferences, store them for display
      if (userVals && Object.keys(userVals).length > 0) {
        setPreferencesSummary(userVals);
      }
    } catch (e) {
      console.log('Error loading preferences', e);
    } finally {
      setLoading(false);
    }
  };

  const grouped = useMemo(() => groupByCategory(master), [master]);

  const updateValue = (key, value) => {
    setValues(prev => ({ ...prev, [key]: value }));
  };

  const handleVehicleSelect = (vehicle) => {
    setSelectedVehicle(vehicle);
    setVehicleId(vehicle.id);
    setShowVehicleModal(false);
  };

  const handleAddNewVehicle = () => {
    navigation.navigate("AddNewVehicleScreen", { phoneNumber });
  };

  const handlePreferencesToggle = (value) => {
    if (value) {
      // Navigate to MatchingPreferenceScreen when toggle is ON
      navigation.navigate("MatchingPreferenceScreen", {
        onSave: (savedPrefs) => {
          setValues(savedPrefs);
          setPreferencesSummary(savedPrefs);
          // Keep showPreferences as true so user can see their preferences
          setShowPreferences(true);
        }
      });
    } else {
      // When toggling off, just hide the summary but don't reload
      setShowPreferences(false);
    }
  };

  // Get compact preference summary (only selected ones)
  const getCompactPreferenceSummary = () => {
    if (!preferencesSummary || Object.keys(preferencesSummary).length === 0) {
      return null;
    }
    
    const selectedPrefs = [];
    
    // Check for true values or non-empty values
    Object.keys(preferencesSummary).forEach(key => {
      const value = preferencesSummary[key];
      const prefConfig = PREFERENCE_LABELS[key];
      
      if (prefConfig) {
        if (value === true) {
          selectedPrefs.push(prefConfig.label);
        } else if (value && typeof value === 'string' && value.trim() !== '') {
          selectedPrefs.push(`${prefConfig.label}: ${prefConfig.getValue(value)}`);
        } else if (Array.isArray(value) && value.length > 0) {
          selectedPrefs.push(`${prefConfig.label}: ${value.join(', ')}`);
        }
      }
    });
    
    return selectedPrefs.length > 0 ? selectedPrefs : null;
  };

  const compactSummary = getCompactPreferenceSummary();

  const handleContinue = () => {
    if (!selectedVehicle) {
      showCustomAlert('Vehicle Required', 'Please select a vehicle before continuing', 'warning');
      return;
    }
    onNext({ 
      preferences: values, 
      vehicleId: selectedVehicle.id,
      maxSeats: selectedVehicle.max_seats || 4
    });
  };

  /* =========================================
     UI
  ========================================= */
  if (loading || loadingVehicles) {
    return (
      <View style={styles.loaderContainer}>
        <LottieView
          source={require("../../assets/loading.json")}
          autoPlay
          loop
          style={styles.loaderAnimation}
        />
      </View>
    );
  }
  
  return (
    <View style={styles.container}>

      {/* Title */}
      <Text style={styles.title}>Vehicle & Preferences</Text>

      <ScrollView showsVerticalScrollIndicator={false}>
        
        {/* Vehicle Section */}
        <View style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>Select Vehicle</Text>
          
          <TouchableOpacity
            style={styles.vehicleDropdown}
            onPress={() => setShowVehicleModal(true)}
          >
            <Text style={styles.vehicleDropdownText}>
              {selectedVehicle
                ? selectedVehicle.registration_number || `${selectedVehicle.make} ${selectedVehicle.model}`
                : "Select Vehicle"}
            </Text>
            <Ionicons name="chevron-down" size={20} color={Colors.secondary} />
          </TouchableOpacity>

          <TouchableOpacity
            onPress={handleAddNewVehicle}
          >
            <Text style={styles.addNewText}>+ Add New Vehicle</Text>
          </TouchableOpacity>

          {/* Selected Vehicle Card with New Layout */}
          {selectedVehicle && (
            <View style={styles.vehicleCard}>
              {/* Row 1: Car Icon + Make Model */}
              <View style={styles.vehicleCardHeader}>
                <MaterialIcons name="directions-car" size={32} color={Colors.primary} />
                <View style={styles.vehicleCardTitleContainer}>
                  <Text style={styles.vehicleCardTitle}>
                    {selectedVehicle.make} {selectedVehicle.model}
                  </Text>
                  {selectedVehicle.year && (
                    <Text style={styles.vehicleCardYear}>{selectedVehicle.year}</Text>
                  )}
                </View>
              </View>
              
              {/* Row 2: Registration Number - Big Section */}
              <View style={styles.registrationSection}>
                <Text style={styles.registrationLabel}>Registration Number</Text>
                <Text style={styles.registrationValue}>{selectedVehicle.registration_number || '-'}</Text>
              </View>
              
              {/* Row 3: 4 Details - Type, Fuel, Color, Seat */}
              <View style={styles.detailsRow}>
                <View style={styles.detailItem}>
                  <MaterialIcons name="category" size={18} color={Colors.primary} />
                  <Text style={styles.detailItemLabel}>Type</Text>
                  <Text style={styles.detailItemValue} numberOfLines={1}>{selectedVehicle.vehicle_type || '-'}</Text>
                </View>
                <View style={styles.detailItem}>
                  <MaterialIcons name="local-gas-station" size={18} color={Colors.primary} />
                  <Text style={styles.detailItemLabel}>Fuel</Text>
                  <Text style={styles.detailItemValue} numberOfLines={1}>{selectedVehicle.fuel_type || '-'}</Text>
                </View>
                <View style={styles.detailItem}>
                  <MaterialIcons name="palette" size={18} color={Colors.primary} />
                  <Text style={styles.detailItemLabel}>Color</Text>
                  <Text style={styles.detailItemValue} numberOfLines={1}>{selectedVehicle.color || '-'}</Text>
                </View>
                <View style={styles.detailItem}>
                  <MaterialIcons name="airline-seat-recline-extra" size={18} color={Colors.primary} />
                  <Text style={styles.detailItemLabel}>Seats</Text>
                  <Text style={styles.detailItemValue} numberOfLines={1}>{selectedVehicle.max_seats || '-'}</Text>
                </View>
              </View>
            </View>
          )}
        </View>

        {/* Ride Preferences Section */}
        <View style={styles.sectionCard}>
          <View style={styles.preferenceHeader}>
            <Text style={styles.sectionTitle}>Ride Preferences</Text>
            <Switch
              value={showPreferences}
              onValueChange={handlePreferencesToggle}
              trackColor={{ true: Colors.primary }}
            />
          </View>
          
          <Text style={styles.preferenceDescription}>
            Do you want to change the ride preference?
          </Text>

          {/* Compact Preferences Summary Card (when toggle is ON) */}
          {showPreferences && compactSummary && (
            <TouchableOpacity 
              style={styles.preferenceSummaryCard}
              onPress={() => {
                // Allow editing again by navigating to MatchingPreferenceScreen
                navigation.navigate("MatchingPreferenceScreen", {
                  onSave: (savedPrefs) => {
                    setValues(savedPrefs);
                    setPreferencesSummary(savedPrefs);
                  }
                });
              }}
            >
              <View style={styles.preferenceSummaryHeader}>
                <MaterialIcons name="check-circle" size={20} color={Colors.success} />
                <Text style={styles.preferenceSummaryTitle}>Your Preferences</Text>
                <MaterialIcons name="edit" size={16} color={Colors.primary} style={{ marginLeft: 'auto' }} />
              </View>
              <View style={styles.preferenceTagsContainer}>
                {compactSummary.map((pref, index) => (
                  <View key={index} style={styles.preferenceTag}>
                    <Text style={styles.preferenceTagText}>{pref}</Text>
                  </View>
                ))}
              </View>
              <Text style={styles.editHint}>Tap to edit preferences</Text>
            </TouchableOpacity>
          )}
          
          {showPreferences && !compactSummary && (
            <TouchableOpacity 
              style={styles.emptyPreferenceCard}
              onPress={() => {
                navigation.navigate("MatchingPreferenceScreen", {
                  onSave: (savedPrefs) => {
                    setValues(savedPrefs);
                    setPreferencesSummary(savedPrefs);
                  }
                });
              }}
            >
              <Text style={styles.emptyPreferenceText}>+ Add your ride preferences</Text>
            </TouchableOpacity>
          )}
        </View>

      </ScrollView>

      <TouchableOpacity
        style={[
          styles.actionButton,
          !selectedVehicle && styles.actionButtonDisabled
        ]}
        onPress={handleContinue}
      >
        <Text style={styles.actionButtonText}>
          Continue
        </Text>
      </TouchableOpacity>

      {/* Vehicle Selection Modal */}
      <Modal visible={showVehicleModal} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Select Vehicle</Text>
              <TouchableOpacity onPress={() => setShowVehicleModal(false)}>
                <MaterialIcons name="close" size={26} color={Colors.gray} />
              </TouchableOpacity>
            </View>

            <ScrollView style={{ padding: 20 }}>
              {vehicles.length === 0 ? (
                <View style={styles.emptyVehicle}>
                  <Text style={styles.emptyVehicleText}>No vehicles found</Text>
                  <TouchableOpacity
                    style={styles.addVehicleButton}
                    onPress={() => {
                      setShowVehicleModal(false);
                      handleAddNewVehicle();
                    }}
                  >
                    <Text style={styles.addVehicleButtonText}>+ Add New Vehicle</Text>
                  </TouchableOpacity>
                </View>
              ) : (
                vehicles.map((v) => (
                  <TouchableOpacity
                    key={v.id}
                    style={[
                      styles.vehicleOption,
                      selectedVehicle?.id === v.id && styles.vehicleOptionSelected
                    ]}
                    onPress={() => handleVehicleSelect(v)}
                  >
                    <View style={styles.vehicleOptionInfo}>
                      <Text style={styles.vehicleOptionTitle}>
                        {v.registration_number}
                      </Text>
                      <Text style={styles.vehicleOptionSubtitle}>
                        {v.make} {v.model} • {v.color} • {v.max_seats} seats
                      </Text>
                    </View>
                    {selectedVehicle?.id === v.id && (
                      <MaterialIcons name="check-circle" size={24} color={Colors.primary} />
                    )}
                  </TouchableOpacity>
                ))
              )}
            </ScrollView>
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
    </View>
  );
}

/* =========================================
   STYLES
========================================= */

const styles = StyleSheet.create({

  container: {
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderRadius: 28,
    padding: 18,
    marginBottom: 14,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.15,
    shadowRadius: 20,
    elevation: 10,
    borderWidth: 1,
    borderColor: 'rgba(229, 231, 235, 0.5)',
  },

  loaderContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderRadius: 28,
    padding: 18,
    marginBottom: 14,
    minHeight: 700,
  },

  loaderAnimation: {
    width: 300,
    height: 300,
  },

  title: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 14,
    color: Colors.dark
  },

  sectionCard: {
    backgroundColor: '#f8f9fc',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#e8eaf0',
  },

  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.dark,
    marginBottom: 12
  },

  vehicleDropdown: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: '#E5E7EB',
    borderRadius: 14,
    paddingHorizontal: 16,
    paddingVertical: 14,
    backgroundColor: '#fff',
    marginBottom: 10,
  },

  vehicleDropdownText: {
    fontSize: 16,
    color: Colors.dark,
    fontWeight: '500',
  },

  addNewText: {
    color: Colors.primary,
    fontWeight: '600',
    marginBottom: 12,
  },

  vehicleCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginTop: 8,
    borderWidth: 1,
    borderColor: '#e0e8f0',
  },

  // Row 1: Car Icon + Make Model
  vehicleCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },

  vehicleCardTitleContainer: {
    marginLeft: 12,
    flex: 1,
  },

  vehicleCardTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: Colors.dark,
  },

  vehicleCardYear: {
    fontSize: 13,
    color: Colors.gray,
    marginTop: 2,
  },

  // Row 2: Registration Number - Big Section
  registrationSection: {
    backgroundColor: '#f0f4f8',
    borderRadius: 10,
    padding: 12,
    marginBottom: 16,
    alignItems: 'center',
  },

  registrationLabel: {
    fontSize: 11,
    color: Colors.gray,
    marginBottom: 4,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },

  registrationValue: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.dark,
    letterSpacing: 1,
  },

  // Row 3: 4 Details
  detailsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },

  detailItem: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 8,
  },

  detailItemLabel: {
    fontSize: 10,
    color: Colors.gray,
    marginTop: 4,
    textTransform: 'uppercase',
  },

  detailItemValue: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.dark,
    marginTop: 2,
    textAlign: 'center',
  },

  preferenceHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },

  preferenceDescription: {
    fontSize: 14,
    color: Colors.gray,
    marginBottom: 12,
  },

  preferenceSummaryCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: '#d4edda',
    backgroundColor: '#f0fff4',
  },

  emptyPreferenceCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    borderWidth: 1,
    borderColor: '#e0e8f0',
    borderStyle: 'dashed',
    alignItems: 'center',
  },

  emptyPreferenceText: {
    color: Colors.primary,
    fontSize: 14,
    fontWeight: '600',
  },

  preferenceSummaryHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },

  preferenceSummaryTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.success,
    marginLeft: 6,
  },

  preferenceTagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },

  preferenceTag: {
    backgroundColor: Colors.primary,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },

  preferenceTagText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },

  editHint: {
    fontSize: 11,
    color: Colors.primary,
    marginTop: 10,
    textAlign: 'center',
  },

  actionButton: {
    backgroundColor: Colors.primary,
    paddingVertical: 14,
    borderRadius: 16,
    alignItems: 'center',
    marginTop: 10
  },

  actionButtonDisabled: {
    backgroundColor: Colors.gray,
    opacity: 0.6,
  },

  actionButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700'
  },

  // Modal styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },

  modalContent: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: '70%',
  },

  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },

  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.dark,
  },

  emptyVehicle: {
    alignItems: 'center',
    padding: 20,
  },

  emptyVehicleText: {
    fontSize: 16,
    color: Colors.gray,
    marginBottom: 16,
  },

  addVehicleButton: {
    backgroundColor: Colors.primary,
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 10,
  },

  addVehicleButtonText: {
    color: '#fff',
    fontWeight: '600',
  },

  vehicleOption: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },

  vehicleOptionSelected: {
    backgroundColor: '#f0f8ff',
    borderRadius: 10,
    borderColor: Colors.primary,
  },

  vehicleOptionInfo: {
    flex: 1,
  },

  vehicleOptionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.dark,
  },

  vehicleOptionSubtitle: {
    fontSize: 14,
    color: Colors.gray,
    marginTop: 2,
  },

});