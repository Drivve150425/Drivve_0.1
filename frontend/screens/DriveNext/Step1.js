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
  Modal,
} from 'react-native';
import { Colors } from '../../constants/Colors';
import { Ionicons, MaterialIcons, Zocial } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useFocusEffect } from '@react-navigation/native';
import { useAuth } from '../../context/AuthContext';
import LottieView from "lottie-react-native";
import CustomAlert from '../../components/CustomAlert';

export default function Step1({ from, to, setFrom, setTo, setFromCoords, setToCoords, dateTime, setDateTime, onNext, navigation, route, phoneNumber: phoneNumberProp, fromCoords, toCoords }) {

  const [fromLocation, setFromLocation] = useState(from);
  const [toLocation, setToLocation] = useState(to);
  const [selectedDate, setSelectedDate] = useState(dateTime);
  const [loading, setLoading] = useState(false);

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
    // Auto-set coords if provided (edit mode)
    if (fromCoords && Array.isArray(fromCoords) && fromCoords.length === 2) {
      setFromCoords({ latitude: fromCoords[1], longitude: fromCoords[0] });
    }
    if (toCoords && Array.isArray(toCoords) && toCoords.length === 2) {
      setToCoords({ latitude: toCoords[1], longitude: toCoords[0] });
    }
  }, [fromCoords, toCoords]);
  
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);
  const { firstName, lastName, userId, userData, isNewUser } = route?.params || {};

  // ✅ Get authenticated user from AuthContext
  const { user } = useAuth();

  // ✅ Get phone number from props, AuthContext, route params, or navigation state
  const phoneNumber = phoneNumberProp || 
    route?.params?.phoneNumber || 
    user?.phone_number || 
    user?.phoneNumber || 
    user?.phone || 
    navigation?.getState()?.routes?.find(r => r.params?.phoneNumber)?.params?.phoneNumber ||
    null;

  // Format date and time
  const formatDateTime = () => {
    const today = new Date();
    const isToday = selectedDate.toDateString() === today.toDateString();
    
    const timeString = selectedDate.toLocaleTimeString('en-IN', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
      timeZone: 'Asia/Calcutta',
      timezoneoffset: 330
    });

    if (isToday) {
      return `Today, ${timeString}`;
    } else {
      const dateString = selectedDate.toLocaleDateString('en-IN', {
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
      setDateTime(selectedDate);
    }
  };

  const onTimeChange = (event, selectedTime) => {
    setShowTimePicker(false);
    if (selectedTime) {
      const newDateTime = new Date(selectedDate);
      newDateTime.setHours(selectedTime.getHours());
      newDateTime.setMinutes(selectedTime.getMinutes());
      setSelectedDate(newDateTime);
      setDateTime(newDateTime);
    }
  };

  const handleNext = () => {
    if (!from || !to) {
      showCustomAlert('Required Fields', 'Please enter both pickup and destination locations', 'warning');
      return;
    }

    const DriveData = {
      from,
      to,
      dateTime: selectedDate,
      userId: userId,
    };
    console.log('🚗 Drive data:', DriveData);

    onNext();
  };

  return (
    <View style={{ backgroundColor: 'rgba(255, 255, 255, 0.95)', padding: 18, marginBottom: 16, borderRadius: 28,
            flex: 1,
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 10 },
            shadowOpacity: 0.15,
            shadowRadius: 20,
            elevation: 10,
            borderWidth: 1,
            borderColor: 'rgba(229, 231, 235, 0.5)', }}>
      <View style={styles.titleSection}>
        <Text style={{ fontSize: 20, fontWeight: '700', color: Colors.dark, marginBottom: 18 }}>Route Details</Text>
        <View style={{ marginBottom: 10 }}>
          <Text style={styles.sectionTitle}>Where are you going?</Text>
        </View>
      </View>

      <TouchableOpacity
        style={styles.locationContainer}
        onPress={() => 
          navigation.navigate('LocationSearch', 
            { onSelect: (location) => {
                setFrom(location.label); 
                setFromCoords(location.coordinates);
              }
          })
        }
      >
        <Ionicons name="location-sharp" size={20} color={Colors.success} style={styles.inputIcon} />
        <Text style={styles.locationInput}>
          {from || 'From'}
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.locationContainer}
        onPress={() => navigation.navigate('LocationSearch',
           { onSelect: (location) => {
                setTo(location.label); 
                setToCoords(location.coordinates);
              }
          })
        }
      >
        <Ionicons name="location-sharp" size={20} color={Colors.secondary} style={styles.inputIcon} />
        <Text style={styles.locationInput}>
          {to || 'To'}
        </Text>
      </TouchableOpacity>

      <View style={{ marginBottom: 10 }}></View>
      <View style={styles.whenSection}>
        <Text style={styles.sectionTitle}>When?</Text>
        <View style={{ marginBottom: 10 }}></View>
        <TouchableOpacity style={styles.timeInput} onPress={showDateTimePicker}>
          <Text style={styles.timeText}>{formatDateTime()}</Text>
          <Ionicons name="calendar" size={20} color={Colors.secondary} />
        </TouchableOpacity>
      </View>

      <View>
        <TouchableOpacity
          style={[styles.actionButton, { backgroundColor: Colors.primary }]}
          onPress={handleNext}
          disabled={loading}
        >
          <Text style={styles.actionButtonText}>Continue</Text>
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