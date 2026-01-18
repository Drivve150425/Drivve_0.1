import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  StatusBar,
  Dimensions,
  BackHandler,
  KeyboardAvoidingView,
  ScrollView,
  Platform,
  LogBox,
  Alert,
  Animated
} from 'react-native';
import * as Device from "expo-device";

import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialIcons } from '@expo/vector-icons';
import LottieView from 'lottie-react-native';
import { Colors, Typography } from '../constants/Colors';
import CustomAlert from '../components/CustomAlert';
import OTPInputs from '../components/OTPInputs';
import SuccessAnimation from '../components/SuccessAnimation';
import FirebaseAuthService from '../services/FirebaseAuthService';
import DatabaseService from '../services/DatabaseService';
import * as Haptics from 'expo-haptics';


LogBox.ignoreLogs([
  'new NativeEventEmitter()',
  'Non-serializable values were found in the navigation state',
  'Invariant Violation: `new NativeEventEmitter()`'
]);


const { width } = Dimensions.get('window');


export default function OTPScreen({ navigation, route }) {
  const insets = useSafeAreaInsets();
  const {
    phoneNumber,
    countryCode,
    fullNumber,
    country,
    confirmationResult,
    verificationId
  } = route.params || {};
 
  // State management - Changed initial timer from 60 to 30 seconds
  const [otpValue, setOtpValue] = useState('');
  const [timeLeft, setTimeLeft] = useState(30); // ✅ Changed from 60 to 30
  const [canResend, setCanResend] = useState(false);
  const [resendCount, setResendCount] = useState(0);
  const [isVerifying, setIsVerifying] = useState(false);
  const [otpError, setOtpError] = useState('');
  const [focused, setFocused] = useState(false);
  const [showSuccessAnimation, setShowSuccessAnimation] = useState(false);
 
  // Alert states
  const [showBackAlert, setShowBackAlert] = useState(false);
  const [showErrorAlert, setShowErrorAlert] = useState(false);
  const [showLimitAlert, setShowLimitAlert] = useState(false);
  const [showResendAlert, setShowResendAlert] = useState(false);
 
  const timerRef = useRef(null);
  const scrollViewRef = useRef(null);
  const lottieRef = useRef(null);
  const maxResendAttempts = 3;


  // Animation refs
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;
  const scaleAnim = useRef(new Animated.Value(0.9)).current;
  const shakeAnim = useRef(new Animated.Value(0)).current;


  // Entrance animation
  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 500,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        friction: 8,
        tension: 40,
        useNativeDriver: true,
      }),
    ]).start();


    // Play Lottie animation
    if (lottieRef.current) {
      lottieRef.current.play();
    }
  }, []);


  // Shake animation on error
  const triggerShakeAnimation = () => {
    Animated.sequence([
      Animated.timing(shakeAnim, { toValue: 10, duration: 50, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: -10, duration: 50, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: 10, duration: 50, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: 0, duration: 50, useNativeDriver: true }),
    ]).start();


    if (Platform.OS !== 'web') {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    }
  };


  // Debug logging
  useEffect(() => {
    console.log('🎯 OTPScreen mounted with params:', {
      phoneNumber,
      countryCode,
      fullNumber,
      confirmationResult: !!confirmationResult
    });
  }, []);


  // Timer countdown
  useEffect(() => {
    if (timeLeft > 0 && !canResend) {
      timerRef.current = setTimeout(() => {
        setTimeLeft(timeLeft - 1);
      }, 1000);
    } else if (timeLeft === 0) {
      setCanResend(true);
      if (Platform.OS !== 'web') {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      }
    }


    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
  }, [timeLeft, canResend]);


  // Handle back button
  useEffect(() => {
    const backHandler = BackHandler.addEventListener('hardwareBackPress', () => {
      setShowBackAlert(true);
      return true;
    });


    return () => backHandler.remove();
  }, []);


  // Auto-verify when OTP is complete
  useEffect(() => {
    if (otpValue.length === 6) {
      setOtpError('');
      handleVerifyOTP();
    }
  }, [otpValue]);


  const handleBackPress = () => {
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    setShowBackAlert(true);
  };


  const maskPhoneNumber = (phone) => {
    if (phone && phone.length >= 10) {
      const lastFive = phone.slice(-5);
      const masked = phone.slice(0, -5).replace(/\d/g, '*');
      return masked + lastFive;
    }
    return phone;
  };


  const handleVerifyOTP = async () => {
    if (otpValue.length !== 6) {
      setOtpError('Please enter complete 6-digit OTP');
      triggerShakeAnimation();
      return;
    }


    setIsVerifying(true);
    setOtpError('');


    if (Platform.OS !== 'web') {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }


    try {
      console.log('🔥 Verifying Firebase OTP:', otpValue);
     
      const result = await FirebaseAuthService.verifyOTP(
        confirmationResult,
        otpValue
      );
     
      console.log('🔥 Firebase Verification Result:', result.success ? 'SUCCESS' : 'FAILED');
     
      if (result.success) {
  console.log('✅ User authenticated:', result.user.uid);
  console.log('📱 Phone number:', result.phoneNumber);

  // 🔐 REGISTER DEVICE WITH BACKEND
  const deviceName = `${Device.brand || "Unknown"} ${Device.modelName || "Device"}`;
  const deviceType =
    Device.deviceType === Device.DeviceType.TABLET ? "tablet" : "mobile";

  console.log("📱 Registering device:", deviceName, deviceType);

  await fetch("http://192.168.1.13:8000/api/verify-otp", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      phone_number: fullNumber,
      otp_code: otpValue,
      device_name: deviceName,
      device_type: deviceType,
    }),
  });

  if (Platform.OS !== 'web') {
    await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  }

  setIsVerifying(false);
  setShowSuccessAnimation(true);
}
 else {
        setOtpError(result.message);
        setOtpValue('');
        setIsVerifying(false);
        triggerShakeAnimation();
        Alert.alert('Verification Failed', result.message);
      }
    } catch (error) {
      console.error('🚨 OTP Verification Error:', error);
      setOtpError('Verification failed. Please try again.');
      setOtpValue('');
      setIsVerifying(false);
      triggerShakeAnimation();
      Alert.alert('Error', 'Verification failed. Please try again.');
    }
  };


  const handleSuccessAnimationComplete = async () => {
    console.log('🎯 Success animation complete, checking user...');
    setShowSuccessAnimation(false);
   
    if (Platform.OS === 'ios') {
      await new Promise(resolve => setTimeout(resolve, 300));
    }
   
    try {
      if (!fullNumber) {
        console.error('❌ No phone number available');
        handleNavigationError();
        return;
      }


      console.log('🔍 Checking if user exists in database...');
      const userCheck = await DatabaseService.checkUserExists(fullNumber);
      console.log('📊 User check result:', userCheck);
     
      if (userCheck.exists && userCheck.userData) {
        console.log('✅ User found, navigating to Home...');
       
        setTimeout(() => {
          try {
            navigation.replace('Home', {
              firstName: userCheck.userData.first_name,
              lastName: userCheck.userData.last_name,
              userId: userCheck.userData.user_id,
              userData: userCheck.userData,
              phoneNumber: fullNumber, 
              isReturningUser: true
            });
          } catch (navError) {
            console.error('❌ Home navigation error:', navError);
            handleNavigationError();
          }
        }, Platform.OS === 'ios' ? 100 : 0);
       
      } else {
        console.log('📝 New user, navigating to CreateProfile...');
       
        setTimeout(() => {
          try {
            navigation.replace('CreateProfile', {
              phoneNumber: phoneNumber,
              fullPhoneNumber: fullNumber,
              countryCode: countryCode,
              isNewUser: true
            });
            console.log('✅ Navigation to CreateProfile successful');
          } catch (navError) {
            console.error('❌ CreateProfile navigation error:', navError);
           
            Alert.alert(
              'Navigation Issue',
              'Profile creation screen unavailable. Please try logging in again.',
              [
                {
                  text: 'OK',
                  onPress: () => navigation.navigate('Login')
                }
              ]
            );
          }
        }, Platform.OS === 'ios' ? 100 : 0);
      }
    } catch (error) {
      console.error('❌ Critical error in success handler:', error);
      handleNavigationError();
    }
  };


  const handleNavigationError = () => {
    console.log('🚨 Handling navigation error - showing alert');
   
    Alert.alert(
      'Navigation Error',
      'There was an issue navigating. Please try logging in again.',
      [
        {
          text: 'Go Back',
          onPress: () => {
            try {
              navigation.navigate('Login');
            } catch (error) {
              console.error('❌ Fallback navigation error:', error);
              navigation.reset({
                index: 0,
                routes: [{ name: 'Login' }],
              });
            }
          }
        }
      ]
    );
  };


  const handleResendOTP = async () => {
    if (!canResend || resendCount >= maxResendAttempts) return;


    if (Platform.OS !== 'web') {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }


    try {
      setIsVerifying(true);
     
      console.log('🔥 Resending Firebase OTP...');
     
      const result = await FirebaseAuthService.sendOTP(
        phoneNumber,
        countryCode
      );
     
      if (result.success) {
        setTimeLeft(30); // ✅ Changed from 60 to 30
        setCanResend(false);
        setResendCount(resendCount + 1);
        setOtpValue('');
        setOtpError('');
        setShowResendAlert(true);
       
        // Replay Lottie animation
        if (lottieRef.current) {
          lottieRef.current.play();
        }
       
        if (Platform.OS !== 'web') {
          await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        }
       
        console.log('✅ OTP resent successfully');
      } else {
        console.error('❌ Failed to resend OTP:', result.message);
        Alert.alert('Resend Failed', result.message);
      }
    } catch (error) {
      console.error('🚨 Resend OTP Error:', error);
      Alert.alert('Error', 'Failed to resend OTP. Please try again.');
    } finally {
      setIsVerifying(false);
    }
  };


  const handleMaxResendReached = () => {
    setShowLimitAlert(true);
  };


  const formatTime = (seconds) => {
    // Simple seconds display for 30 second timer
    return `${seconds}s`;
  };


  const getResendButtonText = () => {
    if (resendCount >= maxResendAttempts) {
      return 'Limit Reached';
    }
    if (canResend) {
      return 'Resend OTP';
    }
    return `Resend in ${formatTime(timeLeft)}`;
  };


  const shouldShowResendButton = () => {
    return resendCount < maxResendAttempts;
  };


  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <StatusBar backgroundColor={Colors.white} barStyle="dark-content" />


      {/* Header */}
          <Animated.View
            style={[
              styles.header,
              {
                opacity: fadeAnim,
                transform: [{ translateY: slideAnim }],
              }
            ]}
          >
            <TouchableOpacity
              style={styles.backButton}
              onPress={handleBackPress}
              activeOpacity={0.7}
              accessible={true}
              accessibilityLabel="Go back"
              accessibilityRole="button"
            >
              <MaterialIcons
                name="arrow-back-ios"
                size={28}
                color={Colors.primary}
              />
            </TouchableOpacity>
          </Animated.View>
     
      <KeyboardAvoidingView
        style={styles.keyboardAvoidingView}
        behavior={Platform.OS === 'ios' ? 'padding' : 'padding'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
      >
        <ScrollView
          ref={scrollViewRef}
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
         


          {/* Content */}
          <Animated.View
            style={[
              styles.content,
              {
                opacity: fadeAnim,
                transform: [{ scale: scaleAnim }],
              }
            ]}
          >
            {/* Glass Card Container */}
            <View style={styles.glassCard}>
              <Text style={styles.title}>OTP Verification</Text>


              {/* Lottie Animation */}
              <View style={styles.lottieContainer}>
                <LottieView
                  ref={lottieRef}
                  source={require('../assets/otp.json')}
                  autoPlay
                  loop
                  style={styles.lottieAnimation}
                  speed={1}
                />
              </View>


              <View style={styles.infoContainer}>
                <Text style={styles.infoText}>Enter the verification code sent to</Text>
                <Text style={styles.phoneText}>
                  {countryCode} {maskPhoneNumber(phoneNumber)}
                </Text>
              </View>


              {/* OTP Input with Shake Animation */}
              <Animated.View
                style={[
                  styles.otpContainer,
                  {
                    transform: [{ translateX: shakeAnim }],
                  }
                ]}
              >
                <OTPInputs
                  length={6}
                  value={otpValue}
                  onChangeText={setOtpValue}
                  onFocus={() => setFocused(true)}
                  onBlur={() => setFocused(false)}
                  error={otpError}
                  focused={focused}
                />
               
                {otpError ? (
                  <View style={styles.errorContainer}>
                    <MaterialIcons name="error-outline" size={16} color={Colors.secondary} />
                    <Text style={styles.errorText}>{otpError}</Text>
                  </View>
                ) : null}
              </Animated.View>


              {/* Timer Progress Bar - Updated calculation for 30 seconds */}
              {!canResend && (
                <View style={styles.progressBarContainer}>
                  <View style={styles.progressBarBackground}>
                    <Animated.View
                      style={[
                        styles.progressBarFill,
                        { width: `${(timeLeft / 30) * 100}%` } // ✅ Changed from 60 to 30
                      ]}
                    />
                  </View>
                  <Text style={styles.timerText}>{formatTime(timeLeft)}</Text>
                </View>
              )}


              {/* Resend Section */}
              <View style={styles.resendSection}>
                <Text style={styles.didntReceiveText}>Didn't receive the code?</Text>
               
                {shouldShowResendButton() ? (
                  <TouchableOpacity
                    style={[
                      styles.resendButton,
                      (!canResend || isVerifying) && styles.resendButtonDisabled
                    ]}
                    onPress={canResend ? handleResendOTP : null}
                    disabled={!canResend || isVerifying}
                    activeOpacity={0.7}
                  >
                    <LinearGradient
                      colors={canResend ? [Colors.primary, '#0D3A6F'] : ['#D1D5DB', '#9CA3AF']}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 0 }}
                      style={styles.resendGradient}
                    >
                      <MaterialIcons
                        name="refresh"
                        size={18}
                        color="#FFFFFF"
                        style={styles.resendIcon}
                      />
                      <Text style={styles.resendButtonText}>
                        {getResendButtonText()}
                      </Text>
                    </LinearGradient>
                  </TouchableOpacity>
                ) : (
                  <TouchableOpacity
                    style={styles.limitReachedButton}
                    onPress={handleMaxResendReached}
                  >
                    <MaterialIcons name="warning" size={18} color={Colors.secondary} />
                    <Text style={styles.limitReachedText}>
                      Maximum attempts reached
                    </Text>
                  </TouchableOpacity>
                )}
              </View>
            </View>


            {/* Verifying Indicator */}
            {isVerifying && (
              <View style={styles.verifyingContainer}>
                <View style={styles.loadingDots}>
                  <View style={[styles.dot, styles.dot1]} />
                  <View style={[styles.dot, styles.dot2]} />
                  <View style={[styles.dot, styles.dot3]} />
                </View>
                <Text style={styles.verifyingText}>
                  {otpValue.length === 6 ? 'Verifying your code...' : 'Processing...'}
                </Text>
              </View>
            )}
          </Animated.View>
        </ScrollView>
      </KeyboardAvoidingView>


      {/* Success Animation Overlay */}
      <SuccessAnimation
        visible={showSuccessAnimation}
        onComplete={handleSuccessAnimationComplete}
      />


      {/* Alerts */}
      <CustomAlert
        visible={showBackAlert}
        title="Go Back"
        message="Are you sure you want to go back to login screen?"
        buttons={[
          { text: 'Cancel', style: 'cancel', onPress: () => setShowBackAlert(false) },
          { text: 'Yes', onPress: () => { setShowBackAlert(false); navigation.goBack(); } }
        ]}
        onBackdropPress={() => setShowBackAlert(false)}
      />


      <CustomAlert
        visible={showErrorAlert}
        title="Verification Failed ❌"
        message="Invalid OTP or verification failed. Please try again."
        buttons={[
          { text: 'Try Again', onPress: () => setShowErrorAlert(false) }
        ]}
        onBackdropPress={() => setShowErrorAlert(false)}
      />


      <CustomAlert
        visible={showLimitAlert}
        title="Limit Reached ⚠️"
        message="You have exceeded the maximum number of OTP resend attempts. Please check your entered number or try again later."
        buttons={[
          { text: 'Check Number', style: 'destructive', onPress: () => { setShowLimitAlert(false); navigation.goBack(); } }
        ]}
        onBackdropPress={() => setShowLimitAlert(false)}
      />


      <CustomAlert
        visible={showResendAlert}
        title="OTP Sent 📱"
        message="A new verification code has been sent to your phone number"
        buttons={[
          { text: 'OK', onPress: () => setShowResendAlert(false) }
        ]}
        onBackdropPress={() => setShowResendAlert(false)}
      />
    </SafeAreaView>
  );
}


// Styles remain the same
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.white,
  },
  keyboardAvoidingView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: 40,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 15,
  },
  backButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    flex: 1,
    paddingHorizontal: 12,
    paddingTop: 10,
  },
  glassCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderRadius: 28,
    padding: 28,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.08,
    shadowRadius: 24,
    elevation: 12,
    borderWidth: 1,
    borderColor: 'rgba(229, 231, 235, 0.5)',
  },
  title: {
    ...Typography.h1,
    color: Colors.primary,
    textAlign: 'center',
    marginBottom: 24,
    fontWeight: '700',
    fontSize: 32,
  },
  lottieContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
    height: 200,
  },
  lottieAnimation: {
    width: 200,
    height: 200,
  },
  infoContainer: {
    alignItems: 'center',
    marginBottom: 28,
  },
  infoText: {
    ...Typography.body2,
    color: '#6B7280',
    textAlign: 'center',
    marginBottom: 8,
    fontSize: 14,
  },
  phoneText: {
    ...Typography.body1,
    color: Colors.primary,
    textAlign: 'center',
    fontWeight: '700',
    fontSize: 18,
  },
  otpContainer: {
    width: '100%',
    alignItems: 'center',
    marginBottom: 24,
  },
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 12,
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: '#FEE2E2',
    borderRadius: 8,
  },
  errorText: {
    ...Typography.caption,
    color: Colors.secondary,
    marginLeft: 8,
    flex: 1,
    fontSize: 13,
  },
  progressBarContainer: {
    marginBottom: 20,
    alignItems: 'center',
  },
  progressBarBackground: {
    width: '100%',
    height: 6,
    backgroundColor: '#E5E7EB',
    borderRadius: 3,
    overflow: 'hidden',
    marginBottom: 8,
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: Colors.primary,
    borderRadius: 3,
  },
  timerText: {
    ...Typography.caption,
    color: Colors.primary,
    fontWeight: '600',
    fontSize: 12,
  },
  resendSection: {
    alignItems: 'center',
    marginBottom: 16,
  },
  didntReceiveText: {
    ...Typography.body2,
    color: '#6B7280',
    marginBottom: 12,
    fontSize: 14,
  },
  resendButton: {
    borderRadius: 12,
    overflow: 'hidden',
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  resendButtonDisabled: {
    shadowOpacity: 0,
    elevation: 0,
  },
  resendGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    paddingHorizontal: 28,
  },
  resendIcon: {
    marginRight: 8,
  },
  resendButtonText: {
    ...Typography.button,
    color: '#FFFFFF',
    fontWeight: '600',
    fontSize: 15,
  },
  limitReachedButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 20,
    backgroundColor: '#FEE2E2',
    borderRadius: 12,
  },
  limitReachedText: {
    ...Typography.body2,
    color: Colors.secondary,
    marginLeft: 8,
    fontWeight: '600',
    fontSize: 13,
  },
  attemptText: {
    ...Typography.caption,
    color: '#6B7280',
    textAlign: 'center',
    fontSize: 12,
    fontStyle: 'italic',
  },
  verifyingContainer: {
    alignItems: 'center',
    paddingVertical: 20,
  },
  loadingDots: {
    flexDirection: 'row',
    marginBottom: 12,
  },
  dot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: Colors.primary,
    marginHorizontal: 4,
  },
  verifyingText: {
    ...Typography.body1,
    color: Colors.primary,
    fontWeight: '600',
    fontSize: 15,
  },
});