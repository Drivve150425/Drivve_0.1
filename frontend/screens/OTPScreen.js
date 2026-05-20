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
import AsyncStorage from '@react-native-async-storage/async-storage';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialIcons } from '@expo/vector-icons';
import LottieView from 'lottie-react-native';
import { Colors, Typography } from '../constants/Colors';
import CustomAlert from '../components/CustomAlert';
import OTPInputs from '../components/OTPInputs';
import SuccessAnimation from '../components/SuccessAnimation';
import FirebaseAuthService from '../services/FirebaseAuthService';
import DatabaseService from '../services/otp_ds';
import * as Haptics from 'expo-haptics';
import { API_BASE_URL } from "../config/config_ip";
import { useAuth } from '../context/AuthContext';


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
    verificationId,
    isBackendFlow = false
  } = route.params || {};
  const { login } = useAuth();
  // State management - Changed initial timer from 60 to 30 seconds
  const [otpValue, setOtpValue] = useState('');
  const [timeLeft, setTimeLeft] = useState(30); // ✅ Changed from 60 to 30
  const [canResend, setCanResend] = useState(false);
  const [resendCount, setResendCount] = useState(0);
  const [isVerifying, setIsVerifying] = useState(false);
  const [otpError, setOtpError] = useState('');
  const [focused, setFocused] = useState(false);
  const [showSuccessAnimation, setShowSuccessAnimation] = useState(false);

  const [showVerificationErrorAlert, setShowVerificationErrorAlert] = useState(false);
  const [showNavigationErrorAlert, setShowNavigationErrorAlert] = useState(false);
  const [backendTokens, setBackendTokens] = useState(null);
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
  const resultRef = useRef(null);

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
    let result;
    
    if (isBackendFlow) {
      console.log('📲 Backend OTP verification:', otpValue);
      
      // ✅ FIXED: Remove '/auth/' from the path
      const response = await fetch(`${API_BASE_URL}/api/verify-otp`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          phone_number: fullNumber,
          otp_code: otpValue,
          device_name: `${Device.brand || "Unknown"} ${Device.modelName || "Device"}`,
          device_type: Device.deviceType === Device.DeviceType.TABLET ? "tablet" : "mobile",
        }),
      });
   const responseText = await response.text();

console.log("RAW RESPONSE:", responseText);

const backendData = JSON.parse(responseText);
      
      if (backendData.success) {
        // ✅ Store tokens directly from backend response
        const tokens = {
          accessToken: backendData.accessToken,
          refreshToken: backendData.refreshToken,
        };
        
        console.log('💾 Storing tokens from direct call:', tokens);
        
        resultRef.current = backendData;
        setBackendTokens(tokens);
        
        // Also store in AsyncStorage for persistence
await AsyncStorage.setItem(
  'auth',
  JSON.stringify({
    accessToken: tokens.accessToken,
    refreshToken: tokens.refreshToken,
    user: backendData.user,
  })
);        
        console.log('✅ User authenticated:', backendData.user?.id);
        console.log('📱 Phone number:', fullNumber);

        if (Platform.OS !== 'web') {
          await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        }

        setIsVerifying(false);
        setTimeout(() => {
          setShowSuccessAnimation(true);
        }, 300);
      } else {
        setOtpError(backendData.message || backendData.detail || 'Verification failed');
        setOtpValue('');
        setIsVerifying(false);
        triggerShakeAnimation();
        setShowVerificationErrorAlert(true);
      }
    } else {
      // Legacy Firebase flow
      console.log('🔥 Firebase OTP verification:', otpValue);
      result = await FirebaseAuthService.verifyOTP(confirmationResult, otpValue);
      
      if (result.success) {
        const tokens = {
          accessToken: result.accessToken || result.token,
          refreshToken: result.refreshToken || result.token,
        };
        setBackendTokens(tokens);
        setIsVerifying(false);
        setTimeout(() => {
          setShowSuccessAnimation(true);
        }, 300);
      } else {
        setOtpError(result.message || 'Verification failed');
        setOtpValue('');
        setIsVerifying(false);
        triggerShakeAnimation();
        setShowVerificationErrorAlert(true);
      }
    }
  } catch (error) {
    console.error('🚨 OTP Verification Error:', error);
    setOtpError('Verification failed. Please try again.');
    setOtpValue('');
    setIsVerifying(false);
    triggerShakeAnimation();
    setShowVerificationErrorAlert(true);
  }
};

const handleSuccessAnimationComplete = async () => {
  console.log('🎯 Success animation complete, checking user...');
  setShowSuccessAnimation(false);
  
  try {
    if (!fullNumber) {
      console.error('❌ No phone number available');
      return handleNavigationError();    
    }

    let tokens = backendTokens;
    
    if (!tokens?.accessToken) {
      // Try AsyncStorage
      try {
        const storedTokens = await AsyncStorage.getItem('auth');
        if (storedTokens) {
const parsed = JSON.parse(storedTokens);

tokens = {
  accessToken: parsed.accessToken,
  refreshToken: parsed.refreshToken,
};
          console.log('🔑 Retrieved tokens from storage:', tokens);
        }
      } catch (e) {}
    }
    
    if (!tokens?.accessToken) {
      tokens = {
        accessToken: resultRef.current?.accessToken,
        refreshToken: resultRef.current?.refreshToken,
      };
    }
    
    console.log('🔑 Final tokens to use:', tokens);

    console.log('🔍 Checking if user exists in database...');
    const userCheck = await DatabaseService.checkUserExists(fullNumber);
    console.log('📊 User check result:', userCheck);
     
    if (userCheck.exists && userCheck?.userData) {
      console.log('✅ User found, setting session...');
      await login({
        user: {
          phone_number: fullNumber,
          id: userCheck.userData.user_id,
          ...userCheck.userData,
        },
        accessToken: tokens?.accessToken,  // This should now have the value
        refreshToken: tokens?.refreshToken, // This should now have the value
      });
      
      console.log('🚀 Session stored globally');

      navigation.reset({
        index: 0,
        routes: [{ name: 'Home' }],
      });
      return;
    } else {
      console.log('📝 New user, navigating to CreateProfile...');
      navigation.replace('CreateProfile', {
        phoneNumber: phoneNumber,
        fullPhoneNumber: fullNumber,
        countryCode: countryCode,
        isNewUser: true,
        accessToken: tokens?.accessToken,
        refreshToken: tokens?.refreshToken,
      });
    }
  } catch (error) {
    console.error('❌ Critical error in success handler:', error);
    handleNavigationError();
  }
};

  const handleNavigationError = () => {
    console.log('🚨 Handling navigation error - showing alert');
   
    setShowNavigationErrorAlert(true);
  };


  const handleResendOTP = async () => {
  if (!canResend || resendCount >= maxResendAttempts) return;

  if (Platform.OS !== 'web') {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
  }

  try {
    setIsVerifying(true);
    
    console.log('📲 Backend resend OTP');
    
    // Call the send-otp endpoint directly
    const response = await fetch(`${API_BASE_URL}/api/send-otp`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        phone_number: fullNumber,
      }),
    });
    
    const result = await response.json();
    
    if (result.success) {
      setTimeLeft(30);
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
      console.log('✅ OTP resent');
    } else {
      console.error('❌ Resend failed:', result.message);
      setShowErrorAlert(true);
    }
  } catch (error) {
    console.error('🚨 Resend error:', error);
    setShowErrorAlert(true);
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
                color={Colors.secondary}
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
        icon="warning"
        iconColor="#F59E0B"
        buttons={[
          { 
            text: 'Cancel', 
            style: 'cancel', 
            onPress: () => setShowBackAlert(false) 
          },
          { 
            text: 'Yes', 
            onPress: () => { 
              setShowBackAlert(false); 
              navigation.goBack(); 
            } 
          }
        ]}
        onBackdropPress={() => setShowBackAlert(false)}
      />

      <CustomAlert
        visible={showErrorAlert}
        title="Resend Failed ❌"
        message="Failed to resend OTP. Please check your connection and try again."
        icon="error"
        iconColor="#EF4444"
        buttons={[
          { 
            text: 'Try Again', 
            onPress: () => setShowErrorAlert(false) 
          }
        ]}
        onBackdropPress={() => setShowErrorAlert(false)}
      />

      <CustomAlert
        visible={showVerificationErrorAlert}
        title="Verification Failed"
        message="Invalid OTP or verification failed. Please try again with the correct code."
        icon="error"
        iconColor="#EF4444"
        buttons={[
          { 
            text: 'Try Again', 
            onPress: () => {
              setShowVerificationErrorAlert(false);
              setOtpValue('');
            } 
          }
        ]}
        onBackdropPress={() => setShowVerificationErrorAlert(false)}
      />

      <CustomAlert
        visible={showLimitAlert}
        title="Limit Reached ⚠️"
        message="You have exceeded the maximum number of OTP resend attempts (3). Please check your phone number and try again later."
        icon="warning"
        iconColor="#F59E0B"
        buttons={[
          { 
            text: 'Go Back', 
            style: 'destructive', 
            onPress: () => { 
              setShowLimitAlert(false); 
              navigation.goBack(); 
            } 
          }
        ]}
        onBackdropPress={() => setShowLimitAlert(false)}
      />

      <CustomAlert
        visible={showResendAlert}
        title="OTP Sent Successfully"
        message="A new verification code has been sent to your phone number. Please check your messages."
        icon="check-circle"
        iconColor="#10B981"
        buttons={[
          { 
            text: 'OK', 
            onPress: () => setShowResendAlert(false) 
          }
        ]}
        onBackdropPress={() => setShowResendAlert(false)}
      />

      <CustomAlert
        visible={showNavigationErrorAlert}
        title="Navigation Error 🚨"
        message="There was an issue completing your request. Please try logging in again."
        icon="error"
        iconColor="#EF4444"
        buttons={[
          { 
            text: 'Go to Login', 
            onPress: () => { 
              setShowNavigationErrorAlert(false);
              navigation.reset({
                index: 0,
                routes: [{ name: 'Login' }],
              });
            } 
          }
        ]}
        onBackdropPress={() => setShowNavigationErrorAlert(false)}
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
  dot1: {
    opacity: 0.4,
  },
  dot2: {
    opacity: 0.7,
  },
  dot3: {
    opacity: 1,
  },
});