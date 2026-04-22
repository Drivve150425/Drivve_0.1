import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  StatusBar,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Dimensions,
  Linking,
  Animated,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Colors, Typography } from '../constants/Colors';
import LoginSvg from '../assets/login.svg';
import CountryPicker from '../components/CountryPicker';
import { getDefaultCountry } from '../constants/CountryData';
import FirebaseAuthService from '../services/FirebaseAuthService';
import { MaterialIcons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { useAuth } from '../context/AuthContext';
import DatabaseService from '../services/loginscreen_ds';
import { Button } from 'react-native';  // Explicit import

const { width } = Dimensions.get('window');

export default function LoginScreen({ navigation }) {
  const { loginGuest } = useAuth();
  const insets = useSafeAreaInsets();
  
  // State management
  const [phoneNumber, setPhoneNumber] = useState('');
  const [selectedCountry, setSelectedCountry] = useState(getDefaultCountry());
  const [showCountryPicker, setShowCountryPicker] = useState(false);
  const [focused, setFocused] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [hasAttemptedSubmit, setHasAttemptedSubmit] = useState(false);
  
  // Animation values
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;
  const scaleAnim = useRef(new Animated.Value(0.95)).current;

  // Entrance animation on mount
  useEffect(() => {
    animateEntrance();
  }, []);

  const animateEntrance = () => {
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
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }),
    ]).start();
  };

  // Validation
  const validatePhone = (number) => /^[6-9]\d{9}$/.test(number);

  const getBorderColor = () => {
    if (error && hasAttemptedSubmit) return Colors.secondary;
    if (phoneNumber.length === 10 && validatePhone(phoneNumber)) return '#10B981';
    if (focused) return Colors.primary;
    return '#E5E7EB';
  };

  const handlePhoneChange = (text) => {
    const numericText = text.replace(/[^0-9]/g, '');
    const limitedText = numericText.slice(0, 10);
    setPhoneNumber(limitedText);
    
    if (error) setError('');
    
    // Haptic feedback on input
    if (Platform.OS !== 'web' && limitedText.length > phoneNumber.length) {
      Haptics.selectionAsync();
    }
  };

  const handleNextPress = async () => {
    setHasAttemptedSubmit(true);
    
    if (!phoneNumber) {
      setError('Please enter your mobile number');
      if (Platform.OS !== 'web') {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      }
      return;
    }

    if (phoneNumber.length !== 10) {
      setError('Mobile number must be 10 digits');
      if (Platform.OS !== 'web') {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      }
      return;
    }

    if (selectedCountry.code === 'IN' && !validatePhone(phoneNumber)) {
      setError('Please enter a valid Indian mobile number');
      if (Platform.OS !== 'web') {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      }
      return;
    }

    if (Platform.OS !== 'web') {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }

    setIsLoading(true);
    setError('');

    try {
      console.log('🔥 Sending Firebase OTP to:', selectedCountry.dial + phoneNumber);
      
      const result = await FirebaseAuthService.sendOTP(
        phoneNumber,
        selectedCountry.dial
      );
      
      console.log('🔥 Firebase OTP Result:', result.success ? 'SUCCESS' : 'FAILED');
      
      if (result.success) {

  // 🔐 SAVE OTP IN BACKEND DATABASE (CRITICAL)
  await DatabaseService.sendOtp(selectedCountry.dial + phoneNumber);

  if (Platform.OS !== 'web') {
    await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  }

  navigation.navigate('OTP', {
    phoneNumber: phoneNumber,
    countryCode: selectedCountry.dial,
    fullNumber: selectedCountry.dial + phoneNumber,
    country: selectedCountry,
    confirmationResult: result.confirmationResult,
    verificationId: result.verificationId,
  });
}
 else {
        setError(result.message);
        if (Platform.OS !== 'web') {
          await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
        }
      }
    } catch (error) {
      console.error('🚨 Login Error:', error);
      setError('Network error. Please check your connection and try again.');
      if (Platform.OS !== 'web') {
        await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      }
    } finally {
      setIsLoading(false);
    }
  };

const skipToHome = async () => {
    try {
      console.log('🧑‍🚀 Continue as Guest pressed');
      await loginGuest();
      console.log('✅ Guest login completed, navigating to Home');
      // Safer navigation - replace current screen instead of full reset
      navigation.replace('Home');
    } catch (error) {
      console.error('❌ Guest login failed:', error);
    }
  };

  const handleTermsPress = () => {
    Linking.openURL("https://drivve.in/");
  };

  const isValidPhone = phoneNumber.length === 10 && (selectedCountry.code !== 'IN' || validatePhone(phoneNumber));

  return (
    <View style={{ flex: 1 }}>
      <SafeAreaView style={styles.container} edges={['top']}>
        <StatusBar backgroundColor={Colors.white} barStyle="dark-content" />

        <KeyboardAvoidingView 
          style={styles.keyboardContainer} 
          behavior={Platform.OS === 'ios' ? 'padding' : 'padding'}
          keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
        >
        <ScrollView 
          contentContainerStyle={styles.scrollContainer}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* Header Section */}
          <Animated.View 
            style={[
              styles.headerSection,
              {
                opacity: fadeAnim,
                transform: [{ translateY: slideAnim }],
              }
            ]}
          >
            <Text style={styles.snapTitle}>Snap into a Drivve</Text>
            {/* SVG Component */}
            <View style={styles.imageContainer}>
              <LoginSvg 
                width="100%" 
                height={200}
                preserveAspectRatio="xMidYMid meet"
              />
            </View>
          </Animated.View>

          {/* Login Form Section */}
          <Animated.View 
            style={[
              styles.formSection,
              {
                opacity: fadeAnim,
                transform: [{ scale: scaleAnim }],
              }
            ]}
          >
            {/* Glass Card Container */}
            <View style={styles.glassCard}>
              <Text style={styles.loginTitle}>Login</Text>
              <Text style={styles.subtitle}>You have been missed! </Text>
              
              {/* Phone Input Container */}
              <View style={styles.phoneContainer}>
                <View style={[
                  styles.phoneInputRow,
                  { borderColor: getBorderColor() }
                ]}>
                  {/* Country Code Button */}
                  <TouchableOpacity 
                    style={styles.countryButton}
                    onPress={() => setShowCountryPicker(true)}
                    disabled={isLoading}
                    accessible={true}
                    accessibilityLabel={`Selected country: ${selectedCountry.name}, code: ${selectedCountry.dial}`}
                    accessibilityRole="button"
                    accessibilityHint="Opens country picker"
                    activeOpacity={0.7}
                  >
                    <Text style={styles.flagText}>{selectedCountry.flag}</Text>
                    <Text style={styles.countryCodeText}>{selectedCountry.dial}</Text>
                    <MaterialIcons name="arrow-drop-down" size={20} color="#6B7280" />
                  </TouchableOpacity>
                  
                  {/* Phone Number Input */}
                  <TextInput
                    style={styles.phoneInput}
                    placeholder="Enter mobile number"
                    placeholderTextColor="#9CA3AF"
                    value={phoneNumber}
                    onChangeText={handlePhoneChange}
                    onFocus={() => setFocused(true)}
                    onBlur={() => setFocused(false)}
                    keyboardType="phone-pad"
                    maxLength={10}
                    returnKeyType="done"
                    onSubmitEditing={handleNextPress}
                    editable={!isLoading}
                    accessible={true}
                    accessibilityLabel="Phone number input"
                    accessibilityHint="Enter your 10-digit mobile number"
                    textContentType="telephoneNumber"
                  />
                </View>
                
                {/* Validation Message }
                {hasAttemptedSubmit && error ? (
                  <Animated.View 
                    style={[
                      styles.messageContainer,
                      { opacity: fadeAnim }
                    ]}
                  >
                    <MaterialIcons name="error-outline" size={16} color={Colors.secondary} />
                    <Text style={styles.errorText}>{error}</Text>
                  </Animated.View>
                ) : phoneNumber.length === 10 && isValidPhone ? (
                  <Animated.View 
                    style={[
                      styles.messageContainer,
                      { opacity: fadeAnim }
                    ]}
                  >
                    <MaterialIcons name="check-circle" size={16} color="#10B981" />
                    <Text style={styles.successText}>Valid mobile number</Text>
                  </Animated.View>
                ) : null*/}
              </View>

              {/* Next Button with Gradient */}
              <TouchableOpacity 
                style={[
                  styles.nextButton,
                  (!isValidPhone || isLoading) && styles.nextButtonDisabled
                ]}
                onPress={handleNextPress}
                disabled={!isValidPhone || isLoading}
                accessible={true}
                accessibilityLabel={isLoading ? 'Sending OTP' : 'Next, send OTP'}
                accessibilityRole="button"
                accessibilityState={{ disabled: !isValidPhone || isLoading }}
                activeOpacity={0.9}
              >
                <LinearGradient
                  colors={
                    (!isValidPhone || isLoading)
                      ? ['#D1D5DB', '#9CA3AF']
                      : [Colors.primary, '#0D3A6F']
                  }
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={styles.gradientButton}
                >
                  <View style={styles.nextButtonContent}>
                    {isLoading ? (
                      <>
                        <MaterialIcons 
                          name="hourglass-empty" 
                          size={20} 
                          color="#FFFFFF"
                          style={styles.loadingIcon}
                        />
                        <Text style={styles.nextButtonText}>Sending OTP...</Text>
                      </>
                    ) : (
                      <>
                        <Text style={styles.nextButtonText}>Next</Text>
                        <MaterialIcons
                          name="chevron-right"
                          size={30}
                          color="#FFFFFF"
                          style={styles.arrow}
                          alignItems="center"
                          textAlignVertical="center"
                        />
                      </>
                    )}
                  </View>
                </LinearGradient>
              </TouchableOpacity>
            </View>
                    {/* Skip Button (rendered outside SafeAreaView to guarantee overlay) */}
                    <View
                      pointerEvents="box-none"
                      style={[
                        styles.skipButtonContainer,
                        {
                          //top: insets.top + 620,
                          //left: insets.left + 20,
                          //minWidth: width - insets.left - insets.right,
                        },
                      ]}
                    >
                      <TouchableOpacity
                        style={styles.skipButton}
                        onPress={skipToHome}
                        accessible={true}
                        accessibilityLabel="Skip to home screen"
                        accessibilityRole="button"
                        activeOpacity={0.8}
                      >
                        <Text style={styles.skipButtonText}>Continue as Guest </Text>
                      </TouchableOpacity>
                    </View>
          </Animated.View>
          </ScrollView>
          </KeyboardAvoidingView>
          
        
        
        {/* Terms Section */}
            <View style={styles.termsContainer}>
              <Text style={styles.termsText}>By signing up, you agree to </Text>
              <TouchableOpacity 
                onPress={handleTermsPress} 
                accessible={true} 
                accessibilityRole="link"
                activeOpacity={0.7}
              >
                <Text style={styles.termsLink}>terms of use</Text>
              </TouchableOpacity>
            </View>
          
      
       
          
      {/* Country Picker Modal */}
      <CountryPicker
        visible={showCountryPicker && !isLoading}
        onClose={() => setShowCountryPicker(false)}
        onSelect={setSelectedCountry}
        selectedCountry={selectedCountry}
      />
      
      {/* reCAPTCHA container for web */}
        {Platform.OS === 'web' && (
          <div id="recaptcha-container" style={{ display: 'none' }}></div>
        )}
      </SafeAreaView>

      
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.white,
  },
  skipButtonContainer: {
    position: 'absolute',
    bottom: 40,
    left: 20,
    right: 20,
    zIndex: 1000,
    elevation: 10,
  },
  skipButton: {
    
    alignItems: 'center',
    justifyContent: 'center',
  },
  skipButtonText: {
    ...Typography.body2,
    color: Colors.primary,
    fontSize: 15,
    fontWeight: '800',
    textDecorationLine: 'underline',
  },
  keyboardContainer: {
    flex: 1,
  },
  scrollContainer: {
    flexGrow: 1,
  },
  headerSection: {
    alignItems: 'flex-end',
    paddingTop: 12,
    paddingBottom: 24,
  },
  snapTitle: {
    ...Typography.h4,
    color: Colors.primary,
    textAlign: 'right',
    marginTop: 5,
    marginBottom: 10,
    fontWeight: '700',
    paddingHorizontal: 28,
  },
  imageContainer: {
    width: '100%',
    alignItems: 'center',
    marginVertical: 20,
  },
  formSection: {
    flex: 1,
    paddingBottom: 20,
  },
  glassCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderRadius: 28,
    padding: 20,
    marginHorizontal: 18,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.08,
    shadowRadius: 24,
    elevation: 12,
    borderWidth: 1,
    borderColor: 'rgba(229, 231, 235, 0.5)',
  },
  loginTitle: {
    ...Typography.h1,
    color: Colors.primary,
    marginBottom: 8,
    fontWeight: '700',
    fontSize: 32,
  },
  subtitle: {
    ...Typography.body1,
    color: '#6B7280',
    marginBottom: 15,
    fontSize: 15,
  },
  phoneContainer: {
    marginBottom: 24,
  },
  phoneInputRow: {
    flexDirection: 'row',
    borderWidth: 1,
    borderRadius: 20,
    overflow: 'hidden',
    backgroundColor: Colors.white,
    alignItems: 'center',
    //shadowColor: '#000',
    //shadowOffset: { width: 0, height: 2 },
    //shadowOpacity: 0.05,
    //shadowRadius: 8,
    //elevation: 2,
  },
  countryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 12,
    backgroundColor: '#F9FAFB',
    borderRightWidth: 1,
    borderRightColor: '#E5E7EB',
  },
  flagText: {
    fontSize: Platform.OS === 'ios' ? 24 : 16,
    marginRight: 5,
    verticalAlign: 'middle',
  },
  countryCodeText: {
    ...Typography.input,
    fontSize: Platform.OS === 'ios' ? 17 : 16,
    fontWeight: '700',
    color: Colors.primary,
  },
  phoneInput: {
    ...Typography.input,
    fontSize: Platform.OS === 'ios' ? 18 : 16,
    flex: 1,
    paddingHorizontal: 12,
    paddingVertical: 12,
    color: '#111827',
    fontWeight: '500',
    textAlignVertical: 'center',
    paddingTop: 11,
  },
  messageContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 5,
    marginLeft: 4,
  },
  errorText: {
    ...Typography.caption,
    color: Colors.secondary,
    marginLeft: 8,
    flex: 1,
    fontSize: 13,
  },
  successText: {
    ...Typography.caption,
    color: '#10B981',
    marginLeft: 8,
    fontWeight: '600',
    fontSize: 13,
  },
  nextButton: {
    borderRadius: 50,
    overflow: 'hidden',
    marginBottom: 20,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 6,
  },
  nextButtonDisabled: {
    shadowOpacity: 0,
    elevation: 0,
  },
  gradientButton: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  nextButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  nextButtonText: {
    ...Typography.button,
    fontSize: 20,
    fontWeight: '700',
    color: '#FFFFFF',
    letterSpacing: 0.5,
    paddingBottom: 10,
    paddingTop: 16,
    textAlignVertical: 'center',
    textAlign: 'center',
  },
  arrow: {
    marginLeft: 1,
    alignItems: 'center',
    textAlignVertical: 'center',
    paddingBottom: 10,
    paddingTop: 10,
  },
  loadingIcon: {
    marginRight: 8,
  },
  termsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    alignItems: 'flex-end',
    paddingHorizontal: 20,
    marginBottom: 60,
  },
  termsText: {
    ...Typography.caption,
    textAlign: 'center',
    color: Colors.dark,
    fontSize: 13,
  },
  termsLink: {
    ...Typography.caption,
    color: Colors.primary,
    fontWeight: '800',
    textDecorationLine: 'underline',
    fontSize: 14,
  },
  });
