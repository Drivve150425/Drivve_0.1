import React, { useState, useRef } from 'react';
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
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import DateTimePicker from '@react-native-community/datetimepicker';
import { PanGestureHandler, State as GestureState } from 'react-native-gesture-handler';
import BackgroundAnimation from '../components/BackgroundAnimation';
import BottomNavigation from '../components/BottomNavigation';
import { Colors, Typography } from '../constants/Colors';
import { Roboto_300Light } from '@expo-google-fonts/roboto';


const { width, height } = Dimensions.get('window');
const DRAWER_HEIGHT = height * 0.25;

export default function HomeScreen({ navigation, route }) {
  const { firstName, lastName, userId, userData, isNewUser } = route.params || {};

  // Tab state - 'ride' or 'drive'
  const [activeTab, setActiveTab] = useState('ride');
  
  // Drawer state
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const drawerTranslateY = useRef(new Animated.Value(-DRAWER_HEIGHT)).current;
  const drawerOpacity = useRef(new Animated.Value(0)).current;
  const contentTranslateY = useRef(new Animated.Value(0)).current;
  
  // Form states
  const [fromLocation, setFromLocation] = useState('');
  const [toLocation, setToLocation] = useState('');
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [seatCount, setSeatCount] = useState(1);
  
  // Bottom navigation active button
  const [activeBottomTab, setActiveBottomTab] = useState('home');

  const backgroundGradientColors = [Colors.primary, '#2563eb', '#3b82f6', '#2980b9', Colors.blue, '#1e40af'];

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


  // Gesture handler
  const handleGestureStateChange = ({ nativeEvent }) => {
    if (nativeEvent.state === GestureState.END) {
      const { translationY, velocityY } = nativeEvent;
      
      if (translationY > 50 && velocityY > 500 && !isDrawerOpen) {
        openDrawer();
      }
      else if (translationY < -50 && velocityY < -500 && isDrawerOpen) {
        closeDrawer();
      }
    }
  };

  const toggleDrawer = () => {
    if (isDrawerOpen) {
      closeDrawer();
    } else {
      openDrawer();
    }
  };

  const openDrawer = () => {
    setIsDrawerOpen(true);
    Animated.parallel([
      Animated.timing(drawerTranslateY, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.timing(drawerOpacity, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.timing(contentTranslateY, {
        toValue: DRAWER_HEIGHT,
        duration: 300,
        useNativeDriver: true,
      })
    ]).start();
  };

  const closeDrawer = () => {
    setIsDrawerOpen(false);
    Animated.parallel([
      Animated.timing(drawerTranslateY, {
        toValue: -DRAWER_HEIGHT,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.timing(drawerOpacity, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.timing(contentTranslateY, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      })
    ]).start();
  };

  const decreaseSeat = () => {
    if (seatCount > 1) setSeatCount(seatCount - 1);
  };

  const increaseSeat = () => {
    if (seatCount < 8) setSeatCount(seatCount + 1);
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

 const navigateToProfile = () => {
  navigation.navigate('ProfileDetails', {
    phoneNumber: userData.phone_number, // ✅ REQUIRED
    userData,
    userId,
    firstName,
    lastName,
  });
};


  // Handle bottom navigation
  const handleBottomNavigation = (tabName) => {
    setActiveBottomTab(tabName);
    
    switch (tabName) {
      case 'home':
        navigation.navigate('Home');
        break;
      case 'myride':
        Alert.alert('Coming Soon', 'MyRides screen will be available soon!');
        // navigation.navigate('Notifications');
        break;
      case 'plus':
        navigation.navigate('Drive');
        break;
      case 'chat':
        navigation.navigate('ChatList');
        break;
      case 'alert':
        Alert.alert('Coming Soon', 'Notifications screen will be available soon!');
        // navigation.navigate('Settings');
        break;
    }
  }; 

  const handleAction = () => {
    if (!fromLocation.trim() || !toLocation.trim()) {
      Alert.alert('Required Fields', 'Please enter both pickup and destination locations');
      return;
    }

    const rideData = {
      type: activeTab,
      from: fromLocation,
      to: toLocation,
      dateTime: selectedDate,
      seats: seatCount,
      userId: userId
    };
    console.log('🚗 Ride data:', rideData);

    navigation.navigate('RideNext', {
        rideData,
        userData: { userId, firstName, lastName },
      });
    }

    //greetings
    const getGreeting = (name) => {
      const now = new Date();
      const hour = now.getHours();

      // Define special greetings for specific dates (month is 0-based)
      const specialGreetings = {                      // 0= jan and 11=december
        '11-08': `Happy Diwali ✨,/${name}!`,         // Oct 24 example, update accordingly
        '3-20': `Eid Mubarak,/${name}! 🌙`,          // Apr 10 example, update accordingly
        '11-24': `Gurpurab di vadhaiyan,/${name}! ☬`, // Oct 24 example, update accordingly
        '12-25': `Merry Christmas,/${name}! 🎄`,     // Dec 25 example, update accordingly
        '01-01': `Happy New Year,/${name}! 🎉`,        // Jan 1
      };

      const dateKey = `${now.getMonth()}-${now.getDate()}`;

      // Check if today is a special holiday with greeting
      if (specialGreetings[dateKey]) {
        return specialGreetings[dateKey];
      }

      // Time-based greetings
      if (hour >= 6 && hour < 12) {
        return `Good morning,/${name}!`;
      } else if (hour >= 12 && hour < 16) {
        return `Good afternoon,/${name}!`;
      } else if (hour >= 16 && hour < 21) {
        return `Good evening,/${name}!`;
      } else {
        return `Welcome back,/${name}!`;
      }
    };

    const greeting = getGreeting(firstName || 'User');
    const [firstLine, secondLine] = greeting.split('/');


  return (
    <View style={styles.container}>
      <StatusBar hidden={true} />

      {/* Animated header background (touch-safe, behind everything) */}
+     <BackgroundAnimation height={360} />
      

      <PanGestureHandler onHandlerStateChange={handleGestureStateChange}>
        <Animated.View style={styles.mainContainer}>
          
          {/* Header style={styles.greeting}>{getGreeting(firstName || 'User!')}*/}
          <View style={styles.header}>
            <TouchableOpacity style={styles.headerLeft} onPress={toggleDrawer}>
              <Text style={styles.greeting}>
                {firstLine}
                {'\n'}
                {secondLine}
                </Text>
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.profileButton} onPress={navigateToProfile}>
              <Ionicons name="person-circle" size={35} color={Colors.white} />
            </TouchableOpacity>
          </View>

          {/* Drawer */}
          <Animated.View 
            style={[
              styles.drawerContainer,
              { 
                transform: [{ translateY: drawerTranslateY }],
                opacity: drawerOpacity
              }
            ]}
          >
            <View style={styles.earningSection}>
              <Text style={styles.earningTitle}>Total Earning</Text>
              <Text style={styles.earningAmount}>₹10</Text>
              <Text style={styles.earningSubtext}>CO2 Saved: 50%</Text>
            </View>
          </Animated.View>

          {/* Content Card */}
          <Animated.View 
            style={[
              styles.contentCard,
              { transform: [{ translateY: contentTranslateY }] }
            ]}
          >
            <View style={styles.sleek}>
              <Ionicons
                name="remove-outline"
                size={50}
                color={Colors.gray}
              />
            </View>
            
            {/* Title */}
              <View style={[styles.Titlecontainer]}>
                <Text style={[styles.TitleText]}>Find a ride</Text>
              </View>

            {/* Form Content */}
            <ScrollView 
              style={styles.scrollView}
              contentContainerStyle={styles.scrollContent}
              showsVerticalScrollIndicator={false}
            >
              
              <View style={styles.titleSection}>
                <Text style={styles.sectionTitle}>where are you going?</Text>
              </View>

              <View style={styles.locationContainer}>
                <TextInput
                  style={styles.locationInput}
                  placeholder="From"
                  placeholderTextColor={Colors.gray}
                  textAlignVertical= 'center'
                  value={fromLocation}
                  onChangeText={setFromLocation}
                />
                
                <TextInput
                  style={styles.locationInput}
                  placeholder="To"
                  placeholderTextColor={Colors.gray}
                  textAlignVertical= 'center'
                  value={toLocation}
                  onChangeText={setToLocation}
                />
              </View>

              <View style={styles.whenSection}>
                <Text style={styles.sectionTitle}>When?</Text>
                <TouchableOpacity style={styles.timeInput} onPress={showDateTimePicker}>
                  <Text style={styles.timeText}>{formatDateTime()}</Text>
                  <Ionicons name="calendar" size={20} color={Colors.secondary} />
                </TouchableOpacity>
              </View>

              <View style={styles.seatSection}>
                <Text style={styles.sectionTitle}>Seat needed?</Text>
                
                <View style={styles.seatCounter}>
                  <TouchableOpacity
                    style={[styles.seatButton, seatCount === 1 && styles.seatButtonDisabled]}
                    onPress={decreaseSeat}
                    disabled={seatCount === 1}
                  >
                    <Ionicons 
                      name="remove-circle-outline" 
                      size={30} 
                      color={seatCount === 1 ? Colors.gray : Colors.secondary} 
                    />
                  </TouchableOpacity>
                  
                  <Text style={styles.seatCount}>{seatCount}</Text>
                  
                  <TouchableOpacity
                    style={[styles.seatButton, seatCount === 8 && styles.seatButtonDisabled]}
                    onPress={increaseSeat}
                    disabled={seatCount === 8}
                  >
                    <Ionicons 
                      name="add-circle-outline" 
                      size={30} 
                      color={seatCount === 8 ? Colors.gray : Colors.secondary} 
                    />
                  </TouchableOpacity>
                </View>
              </View>

            {/* Action Button */}
            <View style={styles.actionButtonContainer}>
              <TouchableOpacity
                style={[styles.actionButton, { backgroundColor: Colors.primary }]}
                onPress={handleAction}
              >
                <Text style={styles.actionButtonText}>Search</Text>
              </TouchableOpacity>
            </View>

            </ScrollView>


          </Animated.View>

        </Animated.View>
      </PanGestureHandler>

      {/* Reusable Bottom Navigation Component */}
      <BottomNavigation 
        activeTab={activeBottomTab}
        onNavigate={handleBottomNavigation}
      />

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
  container: {
    flex: 1,
  },
  backgroundGradient: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  imageContainer: {
    width: '100%',
    height: 'auto',
    position: 'absolute',
    alignItems: 'center',
  },
  mainContainer: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: Platform.OS === 'ios' ? 50 : 30,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  greeting: {
    fontSize: 26,
    fontWeight: '600',
    color: Colors.white,
    marginRight: 8,
  },
  profileButton: {
    padding: 5,
  },
  drawerContainer: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 130 : 100,
    left: 0,
    right: 0,
    height: DRAWER_HEIGHT,
    backgroundColor: 'transparent',
    zIndex: 10,
  },
  earningSection: {
    alignItems: 'center',
    paddingVertical: 30,
    paddingHorizontal: 20,
  },
  earningTitle: {
    fontSize: 20,
    color: Colors.white,
    marginBottom: 10,
    opacity: 0.9,
  },
  earningAmount: {
    fontSize: 36,
    fontWeight: 'bold',
    color: Colors.white,
    marginBottom: 8,
  },
  earningSubtext: {
    fontSize: 20,
    color: Colors.white,
    opacity: 0.9,
  },
  sleek: {
    marginTop: -12,
    alignContent: 'center',
    alignItems: 'center',

  },
  contentCard: {
    flex: 1,
    backgroundColor: Colors.white,
    marginTop: Platform.OS === 'ios' ? 50 : 50,
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    paddingTop: 0,
    paddingHorizontal: 20,
    //marginBottom: 90,
  },
  Titlecontainer: {
    flexDirection: 'row',
    marginBottom: 20,
    marginTop: -5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  TitleText: {
    ...Typography.h1,
    fontSize: 30,
    color: Colors.primary,
    textAlign: 'left',
    fontWeight: 'bold',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 20,
  },
  titleSection: {
    marginBottom: 5,
  },
  formTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: Colors.dark,
    marginBottom: 4,
  },
  formSubtitle: {
    fontSize: 16,
    color: Colors.gray,
  },
  locationContainer: {
    marginBottom: 8,
  },
  locationInput: {
    borderWidth: 1.5,
    borderColor: Colors.gray,
    borderRadius: 15,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    marginBottom: 12,
    backgroundColor: Colors.white,
    color: Colors.dark,
    textAlignVertical: 'center',
  },
  whenSection: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.dark,
    marginBottom: 12,
  },
  timeInput: {
    borderWidth: 1.5,
    borderColor: Colors.gray,
    borderRadius: 15,
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: Colors.white,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  timeText: {
    fontSize: 16,
    color: Colors.dark,
    flex: 1,
  },
  seatSection: {
    marginBottom: 20,
    alignItems: 'flex-start',
  },
  seatCounter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  seatButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.white,
  },
  seatButtonDisabled: {
    opacity: 0.5,
  },
  seatCount: {
    fontSize: 24,
    fontWeight: 'bold',
    color: Colors.dark,
    marginHorizontal: 15,
  },
  actionButtonContainer: {
    paddingTop: 15,
    paddingBottom: 10,
    backgroundColor: 'transparent',
  },
  actionButton: {
    paddingVertical: 12,
    borderRadius: 25,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  actionButtonText: {
    color: Colors.white,
    fontSize: 18,
    fontWeight: '600',
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
  gradient: {
    flex: 1,
  },
});
