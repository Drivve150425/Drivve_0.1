import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ScrollView,
  SafeAreaView,
  Dimensions,
  Platform,
  Modal,
} from 'react-native';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Colors, Typography } from '../constants/Colors';

const { width, height } = Dimensions.get('window');

const RecurringRide = ({ navigation, route }) => {
  const [fromLocation, setFromLocation] = useState('');
  const [toLocation, setToLocation] = useState('');
  const [selectedDays, setSelectedDays] = useState([]);
  const [departureTime, setDepartureTime] = useState('');
  const [departureDate, setDepartureDate] = useState(null);
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);

  // Accept location selections - removed map integration
  React.useEffect(() => {
    // No longer needed since using direct text input
  }, [route?.params]);

  const daysOfWeek = [
    { short: 'Mon', full: 'Monday' },
    { short: 'Tue', full: 'Tuesday' },
    { short: 'Wed', full: 'Wednesday' },
    { short: 'Thu', full: 'Thursday' },
    { short: 'Fri', full: 'Friday' },
    { short: 'Sat', full: 'Saturday' },
    { short: 'Sun', full: 'Sunday' },
  ];

  const toggleDay = (day) => {
    if (selectedDays.includes(day)) {
      setSelectedDays(selectedDays.filter((d) => d !== day));
    } else {
      setSelectedDays([...selectedDays, day]);
    }
  };

  const handleSaveRecurringRide = async () => {
    if (!fromLocation || !toLocation || selectedDays.length === 0 || !departureTime) {
      alert('Please fill all fields');
      return;
    }

    const payload = {
      id: `rec_${Date.now()}`,
      from: fromLocation,
      to: toLocation,
      days: selectedDays,
      time: departureTime,
      ts: Date.now(),
    };

    try {
      const key = 'recurring_rides';
      const raw = await AsyncStorage.getItem(key);
      const list = raw ? JSON.parse(raw) : [];
      list.unshift(payload);
      await AsyncStorage.setItem(key, JSON.stringify(list.slice(0, 100)));
      // store last saved for other screens to show persistent success state
      await AsyncStorage.setItem('last_saved_recurring', JSON.stringify(payload));
    } catch (e) {
      console.warn('save recurring error', e);
    }

    // show confirmation modal then navigate away
    setShowConfirmation(true);
    setTimeout(() => {
      setShowConfirmation(false);
      navigation.navigate('Home', { recurringSaved: true });
    }, 1400);
  };

  const isFormValid = fromLocation && toLocation && selectedDays.length > 0 && departureTime;

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backButton}
        >
          <MaterialIcons name="arrow-back-ios" size={24} color={Colors.secondary} />
        </TouchableOpacity>
        <View style={styles.headerTextContainer}>
          <Text style={styles.headerTitle}>Recurring Ride</Text>
        </View>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Route Section */}
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Route</Text>
          
          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>From</Text>
            <View style={styles.inputWrapper}>
              <Ionicons name="location-outline" size={20} color="#999" style={styles.inputIcon} />
              <TextInput
                style={styles.textInput}
                placeholder="Enter pickup location"
                placeholderTextColor="#ccc"
                value={fromLocation}
                onChangeText={setFromLocation}
              />
            </View>
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>To</Text>
            <View style={styles.inputWrapper}>
              <Ionicons name="location-outline" size={20} color="#999" style={styles.inputIcon} />
              <TextInput
                style={styles.textInput}
                placeholder="Enter destination"
                placeholderTextColor="#ccc"
                value={toLocation}
                onChangeText={setToLocation}
              />
            </View>
          </View>
        </View>

        {/* Select Days Section */}
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Select Days</Text>
          
          <View style={styles.daysContainer}>
            {daysOfWeek.map((day) => (
              <TouchableOpacity
                key={day.short}
                style={[
                  styles.dayButton,
                  selectedDays.includes(day.short) && styles.dayButtonActive,
                ]}
                onPress={() => toggleDay(day.short)}
              >
                <Text
                  style={[
                    styles.dayText,
                    selectedDays.includes(day.short) && styles.dayTextActive,
                  ]}
                >
                  {day.short}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <View style={styles.selectedDaysContainer}>
            <Text style={styles.selectedDaysText}>
              Selected: {selectedDays.length > 0 ? selectedDays.join(', ') : 'None'}
            </Text>
          </View>
        </View>

        {/* Departure Time Section */}
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Departure Time</Text>
          
          <TouchableOpacity
            activeOpacity={0.8}
            onPress={() => setShowTimePicker(true)}
          >
            <View style={styles.timeInput}>
              <Text style={styles.timeText}>
                {departureDate
                  ? new Date(departureDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                  : 'Select departure time'}
              </Text>
              <Ionicons name="time-outline" size={20} color={Colors.secondary} />
            </View>
          </TouchableOpacity>

          {/* Android: inline picker, iOS: modal spinner to match HomeScreen */}
          {showTimePicker && Platform.OS === 'android' && (
            <DateTimePicker
              value={departureDate ? new Date(departureDate) : new Date()}
              mode="time"
              is24Hour={false}
              display="default"
              onChange={(event, selected) => {
                setShowTimePicker(false);
                if (selected) {
                  setDepartureDate(selected);
                  const formatted = selected.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
                  setDepartureTime(formatted);
                }
              }}
            />
          )}

          {Platform.OS === 'ios' && showTimePicker && (
            <Modal transparent={true} visible={showTimePicker} animationType="slide">
              <View style={styles.iosPickerContainer}>
                <View style={styles.iosPickerContent}>
                  <View style={styles.iosPickerHeader}>
                    <TouchableOpacity onPress={() => setShowTimePicker(false)}>
                      <Text style={[styles.iosPickerButton, { color: Colors.gray }]}>Cancel</Text>
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => setShowTimePicker(false)}>
                      <Text style={[styles.iosPickerButton, { color: Colors.primary }]}>Done</Text>
                    </TouchableOpacity>
                  </View>
                  <DateTimePicker
                    value={departureDate ? new Date(departureDate) : new Date()}
                    mode="time"
                    display="spinner"
                    onChange={(e, selected) => {
                      if (selected) {
                        setDepartureDate(selected);
                        const formatted = selected.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
                        setDepartureTime(formatted);
                      }
                    }}
                    textColor={Colors.dark}
                  />
                </View>
              </View>
            </Modal>
          )}
        </View>

        {/* Preview Section - Only show when data is available */}
        {isFormValid && (
          <View style={styles.previewCard}>
            <View style={styles.previewHeader}>
              <Ionicons name="calendar-outline" size={20} color="#333" />
              <Text style={styles.previewTitle}>Preview</Text>
            </View>
            
            <View style={styles.previewContent}>
              <View style={styles.previewRow}>
                <Text style={styles.previewLabel}>Route:</Text>
                <Text style={styles.previewValue} numberOfLines={1}>
                  {fromLocation} → {toLocation}
                </Text>
              </View>
              
              <View style={styles.previewRow}>
                <Text style={styles.previewLabel}>Days:</Text>
                <Text style={styles.previewValue}>
                  {selectedDays.join(', ')}
                </Text>
              </View>
              
              <View style={styles.previewRow}>
                <Text style={styles.previewLabel}>Time:</Text>
                <Text style={styles.previewValue}>{departureTime}</Text>
              </View>
            </View>
          </View>
        )}

        {/* Info Section */}
        <View style={styles.infoCard}>
          <Text style={styles.infoTitle}>How it works:</Text>
          <Text style={styles.infoText}>
            We'll automatically search for rides matching your recurring schedule and notify you when we find suitable matches.
          </Text>
        </View>
      </ScrollView>

      {/* Save Button */}
      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={[styles.saveButton, !isFormValid && styles.saveButtonDisabled]}
          onPress={handleSaveRecurringRide}
          activeOpacity={0.8}
          disabled={!isFormValid}
        >
          <Text style={styles.saveButtonText}>Save Recurring Ride</Text>
        </TouchableOpacity>
      </View>

      {/* Confirmation modal */}
      <Modal transparent visible={showConfirmation} animationType="fade">
        <View style={styles.confirmOverlay}>
          <View style={styles.confirmCard}>
            <View style={styles.confirmIconWrap}>
              <Ionicons name="checkmark" size={36} color={Colors.primary} />
            </View>
            <Text style={styles.confirmTitle}>Recurring Ride Set!</Text>
            <Text style={styles.confirmSubtitle}>Your recurring ride has been saved. We'll notify you of matches.</Text>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.white, //'#F5F5F5',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    backgroundColor: '#FFF',
    paddingHorizontal: width * 0.04,
    paddingTop: Platform.OS === 'ios' ? 50 : 30,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  backButton: {
    padding: 8,
    marginRight: 8,
  },
  headerTextContainer: {
    flex: 1,
    justifyContent: 'center',
  },
  headerTitle: {
    ...Typography.h1,
    fontSize: width * 0.05,
    fontWeight: '600',
    color: Colors.primary,
    textAlign: 'center',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: width * 0.04,
    paddingBottom: height * 0.12,
  },
  card: {
    backgroundColor: '#FFF',
    borderRadius: 12,
    padding: width * 0.05,
    marginBottom: height * 0.01,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  sectionTitle: {
    fontSize: width * 0.045,
    fontWeight: '600',
    color: '#333',
    marginBottom: height * 0.02,
  },
  inputContainer: {
    marginBottom: height * 0.02,
  },
  inputLabel: {
    fontSize: width * 0.035,
    color: '#666',
    marginBottom: height * 0.01,
    fontWeight: '500',
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F9F9F9',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    paddingHorizontal: width * 0.03,
    minHeight: height * 0.055,
  },
  inputIcon: {
    marginRight: width * 0.02,
  },
  input: {
    flex: 1,
    paddingVertical: Platform.OS === 'ios' ? height * 0.015 : height * 0.01,
    fontSize: width * 0.04,
    color: '#333',
  },
  daysContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
  },
  dayButton: {
    width: width * 0.11,
    height: width * 0.11,
    maxWidth: 50,
    maxHeight: 50,
    minWidth: 40,
    minHeight: 40,
    borderRadius: 25,
    backgroundColor: '#F0F0F0',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E0E0E0',
    marginVertical: 4,
  },
  dayButtonActive: {
    backgroundColor: '#1E3A8A',
    borderColor: '#1E3A8A',
  },
  dayText: {
    fontSize: width * 0.03,
    fontWeight: '600',
    color: '#666',
  },
  dayTextActive: {
    color: '#FFF',
  },
  selectedDaysContainer: {
    backgroundColor: '#F0F0F0',
    borderRadius: 8,
    padding: width * 0.03,
  },
  selectedDaysText: {
    fontSize: width * 0.035,
    color: '#666',
  },
  timeInputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: '#E5E7EB',
    paddingHorizontal: width * 0.03,
    minHeight: height * 0.055,
  },
  timeIcon: {
    marginRight: width * 0.02,
  },
  timeInput: {
    borderWidth: 1.5,
    borderColor: '#E5E7EB',
    borderRadius: 14,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    color: Colors.dark,
    fontWeight: '500',
    marginBottom: 12,
    backgroundColor: '#F9FAFB',
    textAlignVertical: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  timeText: {
    flex: 1,
    fontSize: 16,
    color: Colors.dark,
    fontWeight: '500',
    height: '100%',
    textAlignVertical: 'center',
  },
  iosPickerContainer: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  iosPickerContent: {
    backgroundColor: Colors.white,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },
  iosPickerHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  iosPickerButton: {
    fontSize: 16,
    fontWeight: '600',
  },
  previewCard: {
    backgroundColor: '#FFF',
    borderRadius: 12,
    padding: width * 0.05,
    marginTop: height * 0.001,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  previewHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: height * 0.02,
  },
  previewTitle: {
    fontSize: width * 0.045,
    fontWeight: '600',
    color: '#333',
    marginLeft: width * 0.02,
  },
  previewContent: {
    gap: height * 0.015,
  },
  previewRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  previewLabel: {
    fontSize: width * 0.038,
    fontWeight: '600',
    color: '#333',
    width: width * 0.18,
  },
  previewValue: {
    flex: 1,
    fontSize: width * 0.038,
    color: '#666',
  },
  infoCard: {
    backgroundColor: '#FFF9E6',
    borderRadius: 12,
    padding: width * 0.04,
    marginBottom: height * 0.02,
    marginTop: height * 0.02,
    borderLeftWidth: 4,
    borderLeftColor: '#FF6B35',
  },
  infoTitle: {
    fontSize: width * 0.035,
    fontWeight: '600',
    color: '#333',
    marginBottom: height * 0.008,
  },
  infoText: {
    fontSize: width * 0.032,
    color: '#666',
    lineHeight: height * 0.025,
  },
  buttonContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#FFF',
    padding: width * 0.04,
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  saveButton: {
    backgroundColor: Colors.primary,
    borderRadius: 25,
    paddingVertical: height * 0.02,
    alignItems: 'center',
    elevation: 3,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
  },
  saveButtonDisabled: {
    backgroundColor: '#CCC',
    elevation: 0,
    shadowOpacity: 0,
  },
  saveButtonText: {
    color: '#FFF',
    fontSize: width * 0.04,
    fontWeight: '600',
  },
  confirmOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  confirmCard: {
    width: '80%',
    backgroundColor: Colors.white,
    borderRadius: 14,
    padding: 24,
    alignItems: 'center',
    shadowColor: Colors.black,
    shadowOpacity: 0.12,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
    elevation: 10,
  },
  confirmIconWrap: {
    width: 78,
    height: 78,
    borderRadius: 39,
    backgroundColor: '#FFF1E6',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  confirmTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.dark,
    marginBottom: 8,
  },
  confirmSubtitle: {
    fontSize: 14,
    color: Colors.gray,
    textAlign: 'center',
  },
});

export default RecurringRide;
