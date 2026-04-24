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
import { Ionicons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';
import { PanGestureHandler, State as GestureState } from 'react-native-gesture-handler';
import BackgroundAnimation from '../components/BackgroundAnimation';
import BottomNavigation from '../components/BottomNavigation';
import { Colors, Typography } from '../constants/Colors';
import { Roboto_300Light } from '@expo-google-fonts/roboto';
import { useAuth } from '../context/AuthContext';
const { width, height } = Dimensions.get('window');
const DRAWER_HEIGHT = verticalScale(160);
import { scale, verticalScale, moderateScale } from 'react-native-size-matters';
import { API_BASE_URL } from "../config/config_ip";

export default function HomeScreen({ navigation }) {
  const { user, loading: authLoading, isAuthenticated } = useAuth();
  const [localLoading, setLocalLoading] = useState(true);

  // 🔒 Improved Session Guard
  useEffect(() => {
    if (localLoading && authLoading) return; // Still loading

    if (!authLoading && !isAuthenticated && !user?.isGuest) {
      // Single delayed redirect, no console.log spam
      const timer = setTimeout(() => {
        navigation.replace('Login');
      }, 500); // Brief delay for state sync
      return () => clearTimeout(timer);
    }
    
    // Session valid, stop local loading
    setLocalLoading(false);
  }, [isAuthenticated, authLoading, localLoading, navigation]);

  const userId = user?.id;
  const phoneNumber = user?.phone_number;
  const firstName = user?.first_name || 'User';
  const lastName = user?.last_name || '';

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
  const [fromCoords, setFromCoords] = useState(null); // [lng, lat]
  const [toCoords, setToCoords] = useState(null);     // [lng, lat]
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [seatCount, setSeatCount] = useState(1);
  const [unreadCount, setUnreadCount] = useState(0);
  const fetchNotificationsAndUnreadCount = async () => {
    try {
      if (!phoneNumber) {
        console.log('⚠️ No phone number available for notifications');
        return;
      }
      const url = `${API_BASE_URL}/api/v1/notifications?phone_number=${encodeURIComponent(
        phoneNumber
      )}&page=1&limit=50`;

      const res = await fetch(url);
      const data = await res.json();

      if (!data.success) return;

      // ✅ Calculate unread count from API YOU HAVE
      const unread = data.notifications.filter(n => !n.is_read).length;

      console.log('🔔 Unread notifications:', unread);
      setUnreadCount(unread);

    } catch (err) {
      console.log('❌ Notification fetch error:', err);
    }
  };
  // console.log("Home route params:", route.params);
  // console.log("Greeting name:", route.params?.userData?.firstName);

  // useEffect(() => {
  //   if (userData?.phone_number) {
  //     fetchNotificationsAndUnreadCount();
  //   }
  // }, [userData]);
  useEffect(() => {
    if (phoneNumber) {
      fetchNotificationsAndUnreadCount();
    }
  }, [phoneNumber]);

  // Bottom navigation active button
  const [activeBottomTab, setActiveBottomTab] = useState('home');

  //const backgroundGradientColors = [Colors.primary, '#2563eb', '#3b82f6', '#2980b9', Colors.blue, '#1e40af'];

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
      Animated.spring(drawerTranslateY, {
        toValue: 0,
        useNativeDriver: true,
        tension: 65,
        friction: 11,
      }),
      Animated.timing(drawerOpacity, {
        toValue: 1,
        duration: 250,
        useNativeDriver: true,
      }),
      Animated.spring(contentTranslateY, {
        toValue: DRAWER_HEIGHT - verticalScale(35),
        useNativeDriver: true,
        tension: 65,
        friction: 11,
      })
    ]).start();
  };


  const closeDrawer = () => {
    setIsDrawerOpen(false);
    Animated.parallel([
      Animated.spring(drawerTranslateY, {
        toValue: -DRAWER_HEIGHT,
        useNativeDriver: true,
        tension: 65,
        friction: 11,
      }),
      Animated.timing(drawerOpacity, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }),
      Animated.spring(contentTranslateY, {
        toValue: 0,
        useNativeDriver: true,
        tension: 65,
        friction: 11,
      })
    ]).start();
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

const openNotifications = () => {
  if (!user?.phone_number) {
    Alert.alert('Session missing', 'Please log in again.');
    return;
  }
  // Instantly clear badge for UX
  setUnreadCount(0);

  // Navigate to notification screen
  navigation.navigate('UserNotificationScreen', {phoneNumber: user?.phone_number});
};

// Handle bottom navigation
  const handleBottomNavigation = (tabName) => {
    setActiveBottomTab(tabName);
    
    switch (tabName) {
      case 'home':
        navigation.navigate('Home');
        break;
      case 'myride':
        navigation.navigate('MyRides', {phoneNumber: user?.phone_number});
        break;
      case 'chat':
        navigation.navigate('ChatList', {phoneNumber: user?.phone_number});
        break;
      case 'profile':
        navigation.navigate('ProfileDetails', {phoneNumber: user?.phone_number});
        break;
      default:
        break;
    }
  };

    const handleAction = () => {
      if (!fromLocation || !toLocation || !fromCoords || !toCoords) {
        Alert.alert(
          'Required Fields',
          'Please select both pickup and destination from the map'
        );
        return;
      }

      const searchData = {
        type: activeTab,
        from: fromLocation,
        to: toLocation,
        fromCoords,
        toCoords,
        dateTime: selectedDate,
        seats: seatCount,
      };

      console.log('🔎 Search data:', searchData);

      navigation.navigate('RideNext', {
        searchData,
      });
    };

    const handleRecurring = () => {
      navigation.navigate('Recurring');
    };

    //greetings
    const getGreeting = (name) => {
      const now = new Date();
      const hour = now.getHours();
      const dateKey = `${now.getMonth()}-${now.getDate()}`;

      // Define special greetings for specific dates (month is 0-based)
      const specialGreetings = {                      // 0= jan and 11=december
        '11-08': {line1: `Happy Diwali ✨,`,line2: `${name}!`},         // Nov 08 example, update accordingly
        '3-20': { line1: 'Eid Mubarak 🌙,', line2: `${name}!` },
        '11-24': { line1: 'Gurpurab di vadhaiyan ☬,', line2: `${name}!` },
        '12-25': { line1: 'Merry Christmas 🎄,', line2: `${name}!` },
        '01-01': { line1: 'Happy New Year 🎉,', line2: `${name}!` },       // Jan 1
      };

      // Check if today is a special holiday with greeting
      if (specialGreetings[dateKey]) {
        return specialGreetings[dateKey];
      }

      // Time-based greetings
      if (hour >= 6 && hour < 12) {
        return { line1: 'Good Morning,', line2: `${name}!` };
      } else if (hour >= 12 && hour < 16) {
        return { line1: 'Good Afternoon,', line2: `${name}!` };
      } else if (hour >= 16 && hour < 22) {
        return { line1: 'Good Evening,', line2: `${name}!` };
      } else {
        return { line1: 'Welcome Back,', line2: `${name}!` };
      }
    };

    // const greeting = getGreeting(userData?.firstName || firstName || 'User');
    const greeting = getGreeting(firstName);
    const greetingText = greeting.line1 + '\\n' + greeting.secondLine; // Safe for Alert
    const firstLine = greeting.line1;
    const secondLine = greeting.line2;

  return (
    <View style={styles.container}>
      <StatusBar hidden={true} />

      {/* Animated header background (touch-safe, behind everything) */}
       <BackgroundAnimation height={360} />
      

      <PanGestureHandler onHandlerStateChange={handleGestureStateChange}>
        <Animated.View style={styles.mainContainer}>
          <View style={styles.header}>
            <TouchableOpacity style={styles.headerLeft} onPress={toggleDrawer}>
              <Text style={styles.greeting}>{firstLine}{'\n'}</Text>
              <Text style={styles.greeting1}>{secondLine}</Text>
            </TouchableOpacity>
            <View style={styles.headerRight}>
            <TouchableOpacity
              style={styles.profileButton}
              onPress={openNotifications}
            >
  <Ionicons
    name="notifications"
    size={40}
    color={Colors.white}
  />

  {unreadCount > 0 && (
    <View style={styles.headerBadge}>
      <Text style={styles.headerBadgeText}>
        {unreadCount > 9 ? '9+' : unreadCount}
      </Text>
    </View>
  )}
</TouchableOpacity>
          </View>
          </View>

          <Animated.View 
           pointerEvents={isDrawerOpen ? 'auto' : 'none'}
            style={[
              styles.drawerContainer,
              { 
                transform: [{ translateY: drawerTranslateY }],
                opacity: drawerOpacity
              }
            ]}
          >
            <TouchableOpacity 
            activeOpacity={1} 
            style={styles.drawerContent}
            onPress={closeDrawer}
          ></TouchableOpacity>
            <View style={styles.earningSection}>
              <Text style={styles.earningTitle}>Total Earning</Text>
              <Text style={styles.earningAmount}>₹10</Text>
              <Text style={styles.earningSubtext}>CO₂ Saved: 50%</Text>
            </View>
          </Animated.View>

          <Animated.View style={[styles.contentCard, { transform: [{ translateY: contentTranslateY }] }]}> 
              <View style={styles.tabContainer}>
                <TouchableOpacity
                  style={[styles.tabButton, activeTab === 'ride' && styles.tabButtonActive]}
                  onPress={() => setActiveTab('ride')}
                >
                  <Text style={[styles.tabButtonText, activeTab === 'ride' && styles.tabButtonTextActive]}>Find a Ride</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.tabButton, activeTab === 'drive' && styles.tabButtonActive]}
                  onPress={() => setActiveTab('drive')}
                >
                  <Text style={[styles.tabButtonText, activeTab === 'drive' && styles.tabButtonTextActive]}>Offer a Ride</Text>
                </TouchableOpacity>
              </View>
              {/*
          <ScrollView 
            style={styles.scrollView}
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
          > */}
          <Animated.ScrollView 
            ref={scrollViewRef}
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
            style={{
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }],
            }}
          >
        

              <View style={[styles.Titlecontainer]}>
                <Text style={[styles.TitleText]}>{activeTab === 'ride' ? 'Find a ride' : 'Offer a ride'}</Text>
              </View>

              {activeTab === 'ride' ? (
                <>
                  <View style={styles.titleSection}>
                    <Text style={styles.sectionTitle}>Where are you going?</Text>
                  </View>

                  <TouchableOpacity
                    style={styles.locationContainer}
                    onPress={() =>
                      navigation.navigate('LocationSearch', {
                        type: 'from',
                        onSelect: (location) => {
                          setFromLocation(location.label);
                          setFromCoords(location.coordinates);
                        },
                      })
                    }
                  >
                    <Ionicons name="location-sharp" size={20} color={Colors.success} style={styles.inputIcon} />
                    <Text style={styles.locationInput}>
                      {fromLocation || 'From'}
                    </Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={styles.locationContainer}
                    onPress={() =>
                      navigation.navigate('LocationSearch', {
                        type: 'to',
                        onSelect: (location) => {
                          setToLocation(location.label);
                          setToCoords(location.coordinates);
                        },
                      })
                    }
                  >
                    <Ionicons name="location-sharp" size={20} color={Colors.secondary} style={styles.inputIcon} />
                    <Text style={styles.locationInput}>
                      {toLocation || 'To'}
                    </Text>
                  </TouchableOpacity>


                  <View style={styles.whenSection}>
                    <Text style={styles.sectionTitle}>When?</Text>
                    <TouchableOpacity style={styles.timeInput} onPress={showDateTimePicker}>
                      <Text style={styles.timeText}>{formatDateTime()}</Text>
                      <Ionicons name="calendar" size={20} color={Colors.secondary} />
                    </TouchableOpacity>
                  </View>

                  <View>
                    <TouchableOpacity
                      style={[styles.actionButton, { backgroundColor: Colors.primary }]}
                      onPress={handleAction}
                    >
                      <Text style={styles.actionButtonText}>Search</Text>
                    </TouchableOpacity>
                  </View>
                </>
              ) : (
                <View style={styles.offerCard}>
                  <View style={styles.offerIconContainer}>
                    <Ionicons name="car-sport" size={28} color={Colors.white} />
                  </View>
                  <Text style={styles.offerTitle}>Share Your Ride</Text>
                  <Text style={styles.offerSubtitle}>Offer a ride and help others while saving on fuel costs</Text>
                  <TouchableOpacity
                    style={styles.postButton}
                    onPress={() => navigation.navigate('DriveNext')}
                  >
                    <Text style={styles.postButtonText}>Post a Ride</Text>
                  </TouchableOpacity>
                </View>
              )}
            
            {/*Extra Info.*/}
            <View style={styles.seprator}> </View>
            <Text style={styles.stext}>Quick Actions</Text>
            <View style={styles.quickaction}> 
              <TouchableOpacity
                style={styles.quick} onPress={handleRecurring}
              >
                <Ionicons style={styles.qicon} name="calendar-outline" size={25} color={Colors.secondary} />
                <Text style={[{textAlign: 'center', ...Typography.button, color:Colors.dark}]}>Recurring Rides</Text>
                <Text style={[{textAlign: 'center', ...Typography.button, color:Colors.gray}]}>Set up daily rides</Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={styles.quick1} //onPress={}
              >
               {/* <Ionicons style={styles.qicon} name="calendar-outline" size={25} color={Colors.secondary} />*/}
              </TouchableOpacity>
            </View>

            <View style={styles.quickaction}> 
              <View style={[styles.quick, {marginTop: 10, backgroundColor: '#9b9a9a1d'}]}>
                <Text style={[styles.qtext, {color: Colors.dark}]}>Safety First</Text>
                <Text style={styles.qtext}>
                  <Ionicons name="ellipse" size={11} color={Colors.secondary} opacity={0.8}/> All drivers are verified</Text>
                <Text style={styles.qtext}>
                  <Ionicons name="ellipse" size={11} color={Colors.secondary} opacity={0.8}/> Live GPS Tracking</Text>
                <Text style={styles.qtext}>
                  <Ionicons name="ellipse" size={11} color={Colors.secondary} opacity={0.8}/> 24/7 support available</Text>
              </View>
            </View>

            <View style={[{marginBottom: 100}]}></View>

            

          {/*</ScrollView>*/}
          </Animated.ScrollView>
        </Animated.View>
        

        </Animated.View>
      </PanGestureHandler>

      {/* Reusable Bottom Navigation Component */}
   <BottomNavigation 
    activeTab={activeBottomTab}
    onNavigate={handleBottomNavigation}
    unreadCount={unreadCount}
    profileImage={user?.profile_picture}
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
    alignItems: 'flex-start',
    paddingHorizontal: 20,
    paddingTop: Platform.OS === 'ios' ? 50 : 30,
  },
  headerLeft: {
    flexDirection: 'column',
    alignItems: 'flex-start',
  },
  greeting: {
    fontSize: 22,
    fontWeight: '600',
    color: Colors.white,
    marginBottom: -30,
  },
  greeting1: {
    fontSize: 28,
    //fontWeight: '600',
    color: Colors.white,
  },
  profileButton: {
    padding: 5,
    marginLeft: 10,
    marginTop: 5,
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  notificationButton: {
    padding: 8,
    marginRight: 8,
  },
  headerBadge: {
    position: 'absolute',
    top: 0,
    right: 0,
    backgroundColor: '#ff3b30',
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 4,
  },
  headerBadgeText: {
    color: '#fff',
    fontSize: 11,
    fontWeight: 'bold',
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
    paddingTop: 10,
    paddingHorizontal: 20,
  },
  Titlecontainer: {
    flexDirection: 'row',
    marginTop: 10,
    marginBottom: -5,
    alignItems: 'flex-start',
    justifyContent: 'flex-start',
  },
  TitleText: {
    ...Typography.h1,
    fontSize: 24,
    fontWeight: 'bold',
    color: Colors.primary,
    textAlign: 'left',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 20,
  },
  titleSection: {
    marginBottom: 2,
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
   drawerContent: {
    flex: 1,
    // backgroundColor: 'rgba(255,255,255,0.1)',
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.dark,
    marginBottom: 12,
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
  actionButton: {
    borderRadius: 16,
    overflow: 'hidden',
    marginTop: 15,
    //shadowColor: Colors.primary,
    //shadowOffset: { width: 0, height: 8 },
    //shadowOpacity: 0.3,
    //shadowRadius: 16,
    //elevation: 8,
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
  seprator:{
    marginTop: 15,
    borderTopColor: Colors.light,
    borderTopWidth: 1.5,
  },
  stext:{
    ...Typography.label,
    fontSize: 15,
    fontWeight: 'regular',
    color: Colors.dark,
    paddingLeft: 8,
    paddingTop: 10,
  },
  quickaction:{
    marginTop: 10,
    flexDirection: 'row',
    alignItems: 'center',
    width: 350,
    height: 125,
    flex: 1,
    rowGap: 8,
  },
  quick:{
    borderWidth: 1.5,
    borderColor: '#E5E7EB',
    borderRadius: 14,
    width: 125,
    height: 125,
    flex: 2,
    gap: 8,
    marginInline: 5,
  },
  quick1:{
    borderWidth: 1.5,
    borderColor: Colors.white,
    borderRadius: 14,
    width: 125,
    height: 125,
    flex: 2,
    gap: 8,
    marginInline: 5,
  },
  qicon:{
    backgroundColor: Colors.logoCream,
    borderRadius: 80,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 10,
    width: 45,
    height: 45,
    marginTop: 10,
    marginLeft: 10,
    marginBottom: 5,
  },
  qtext:{
    textAlign: 'auto',
    ...Typography.button,
    color: Colors.gray,
    marginTop: 15,
    marginLeft: 15,
    marginBottom: -12,    
  },
  tabContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 10,
    marginBottom: 10,
    alignSelf: 'center',
    backgroundColor: Colors.primary,
    borderRadius: 24,
    borderColor: Colors.primary,
    borderWidth: 0.4,
  },
  tabButton: {
    paddingVertical: 12,
    paddingHorizontal: 18,
    marginHorizontal: -1,
    borderRadius: 24,
    backgroundColor: 'transparent',
  },
  tabButtonActive: {
    backgroundColor: Colors.white,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.12,
    shadowRadius: 8,
    elevation: 4,
    borderColor: Colors.primary,
    borderWidth: 1.5,
  },
  tabButtonText: {
    fontSize: 18,
    color: Colors.white,
    fontWeight: '600',
  },
  tabButtonTextActive: {
    color: Colors.primary,
  },
  offerCard: {
    marginTop: 12,
    backgroundColor: '#17487a',
    borderRadius: 14,
    paddingVertical: 24,
    paddingHorizontal: 20,
    alignItems: 'center',
  },
  offerIconContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  offerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.white,
    marginBottom: 6,
  },
  offerSubtitle: {
    fontSize: 14,
    color: Colors.white,
    opacity: 0.9,
    textAlign: 'center',
    marginBottom: 14,
  },
  postButton: {
    backgroundColor: '#ff8800',
    paddingVertical: 10,
    paddingHorizontal: 24,
    borderRadius: 20,
  },
  postButtonText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 16,
  },
 

});
