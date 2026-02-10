import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  StatusBar,
  Dimensions,
  Animated,
  TextInput,
  Platform,
  ScrollView,
  Alert,
  Modal,
} from 'react-native';
import { Colors } from '../../constants/Colors';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker'

export default function Step1({ navigation, route }) {

  const [fromLocation, setFromLocation] = useState('');
  const [toLocation, setToLocation] = useState('');
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);
  const { firstName, lastName, userId, userData, isNewUser } = route.params || {};

  // Format date and time
  const formatDateTime = () => {
    const today = new Date();
    const isToday = selectedDate.toDateString() === today.toDateString();
    
    const timeString = selectedDate.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });

    if (isToday) {
      return `Today, ${timeString}`;
    } else {
      const dateString = selectedDate.toLocaleDateString('en-US', {
        weekday: 'short',
        month: 'short',
        day: 'numeric'
      });
      return `${dateString}, ${timeString}`;
    }
  };

  const showDateTimePicker = () => {
      setShowDatePicker(true);
    };
  
    const onDateChange = (event, selectedDate) => {
      if (Platform.OS === 'android') {
        setShowDatePicker(false);
        setShowTimePicker(true);
      }
      if (selectedDate) {
        setSelectedDate(selectedDate);
      }
    };
  
    const onTimeChange = (event, selectedTime) => {
      setShowTimePicker(false);
      if (selectedTime) {
        const newDateTime = new Date(selectedDate);
        newDateTime.setHours(selectedTime.getHours());
        newDateTime.setMinutes(selectedTime.getMinutes());
        setSelectedDate(newDateTime);
      }
    };

    const onNext = () => {
        if (!fromLocation.trim() || !toLocation.trim()) {
          Alert.alert('Required Fields', 'Please enter both pickup and destination locations');
          return;
        }
    
        
    
        const DriveData = {
          from: fromLocation,
          to: toLocation,
          dateTime: selectedDate,
          userId: userId
        };
        console.log('🚗 Drive data:', DriveData);
    
        navigation.navigate('Step2', {
            DriveData,
            userData: { userId, firstName, lastName },
          });
        }

  return (
    <View style={{ backgroundColor: '#fff', borderRadius: 12, padding: 18, marginBottom: 16 }}>
      <View style={styles.titleSection}>
        <Text style={{ fontSize: 20, fontWeight: '700', color: Colors.dark, marginBottom: 18 }}>Route Details</Text>
        <View style={{ marginBottom: 10 }}>
          <Text style={styles.sectionTitle}>Where are you going?</Text>
        </View>
      </View>
      <View style={styles.locationContainer}>
        <Ionicons name="location-sharp" size={20} color={Colors.gray} style={styles.inputIcon} />
        <TextInput
         style={styles.locationInput}
         placeholder="From"
         placeholderTextColor={Colors.gray}
         textAlign='left'
         textAlignVertical='center'
         value={fromLocation}
         onChangeText={setFromLocation}
         editable={true}
        />
      </View>

      <View style={styles.locationContainer}>
        <Ionicons name="location-sharp" size={20} color={Colors.gray} style={styles.inputIcon} />
        <TextInput
         style={styles.locationInput}
         placeholder="To"
         placeholderTextColor={Colors.gray}
         textAlign='left'
         textAlignVertical='center'
         value={toLocation}
         onChangeText={setToLocation}
         editable={true}
        
        />
      </View>

      <View style={{ marginBottom: 10 }}></View>
      <View style={styles.whenSection}>
        <Text style={styles.sectionTitle}>When?</Text>
        <View style={{ marginBottom: 10 }}></View>
        <TouchableOpacity style={styles.timeInput} onPress={showDateTimePicker}>
          <Text style={styles.timeText}>{formatDateTime()}</Text>
          <Ionicons name="calendar" size={20} color={Colors.secondary} />
        </TouchableOpacity>
      </View>



      <View style={{ height: 260 }} />
      <View>
        <TouchableOpacity
          style={[styles.actionButton, { backgroundColor: Colors.primary }]}
          onPress={onNext}
        >
          <Text style={styles.actionButtonText}>Search</Text>
        </TouchableOpacity>
      </View>

      {/* Date/Time Pickers */}
      {showDatePicker && (
        <DateTimePicker
          value={selectedDate}
          mode="date"
          display={Platform.OS === 'ios' ? 'spinner' : 'default'}
          onChange={onDateChange}
          minimumDate={new Date()}
        />
      )}

      {showTimePicker && (
        <DateTimePicker
          value={selectedDate}
          mode="time"
          display={Platform.OS === 'ios' ? 'spinner' : 'default'}
          onChange={onTimeChange}
        />
      )}

      {Platform.OS === 'ios' && showDatePicker && (
        <Modal transparent={true} visible={showDatePicker} animationType="slide">
          <View style={styles.iosPickerContainer}>
            <View style={styles.iosPickerContent}>
              <View style={styles.iosPickerHeader}>
                <TouchableOpacity onPress={() => setShowDatePicker(false)}>
                  <Text style={[styles.iosPickerButton, {color: Colors.gray}]}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => setShowDatePicker(false)}>
                  <Text style={[styles.iosPickerButton, {color: Colors.primary}]}>Done</Text>
                </TouchableOpacity>
              </View>
              <DateTimePicker
                value={selectedDate}
                mode="datetime"
                display="spinner"
                onChange={onDateChange}
                minimumDate={new Date()}
                textColor={Colors.dark}
              />
            </View>
          </View>
        </Modal>
      )}

    </View>
  );

}
const styles = StyleSheet.create({ 
  titleSection: {
    marginBottom: 2,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.dark,
    marginBottom: 12,
  },
  inputIcon: {
    marginRight: -10,
    marginLeft: 10,
  },
  locationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: '#E5E7EB',
    borderRadius: 14,
    backgroundColor: '#F9FAFB',
    marginBottom: 12,
  },
  locationInput: {
    flex: 1,
    fontSize: 16,
    color: Colors.dark,
    fontWeight: '500',
    paddingHorizontal: 16,
    paddingVertical: 15,
    textAlignVertical: 'center',
    includeFontPadding: false,
    },
  whenSection: {
    marginBottom: 2,
  },
  timeInput: {
    borderWidth: 1.5,
    borderColor: '#E5E7EB',
    borderRadius: 14,
    paddingHorizontal: 16,
    paddingVertical: 15,
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
  actionButton: {
    borderRadius: 16,
    overflow: 'hidden',
    marginTop: 15,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 8,
    paddingVertical: 13,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
  },
  actionButtonText: {
    color: Colors.white,
    fontSize: 18,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
});
