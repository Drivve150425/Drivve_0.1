import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ScrollView,
  StatusBar,
  KeyboardAvoidingView,
  Platform,
  Dimensions,
  Modal,
  Image,
  Animated,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';

import { Colors, Typography } from '../constants/Colors';
import { STATES, getCitiesByState } from '../constants/IndianStatesData';
import AvatarPicker from '../components/AvatarPicker';
import CustomAlert from '../components/CustomAlert';
import DatePickerModal from '../components/DatePickerModal';
import EmailOTPModal from '../components/EmailOTPModal';
import ProfilePictureModal from '../components/ProfilePictureModal';
import DatabaseService from '../services/createprofile_ds';
import myDatabaseService from '../services/myprofile_ds';

import * as ImageManipulator from 'expo-image-manipulator';
const { width, height } = Dimensions.get('window');
import { useAuth } from '../context/AuthContext';

export default function CreateProfileScreen({ navigation, route }) {
  const params = route?.params || {};
 const { login } = useAuth();
  const { phoneNumber, fullPhoneNumber, countryCode, isNewUser } = params;

  // Form states
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [isEmailVerified, setIsEmailVerified] = useState(false);
  const [emailOTP, setEmailOTP] = useState('');
  const [showEmailOTPModal, setShowEmailOTPModal] = useState(false);
  const [dateOfBirth, setDateOfBirth] = useState(new Date());
  const [gender, setGender] = useState('');
  const [selectedState, setSelectedState] = useState('');
  const [selectedCity, setSelectedCity] = useState('');
  const [referralCode, setReferralCode] = useState('');
  const [profileImage, setProfileImage] = useState(null);
  const [selectedAvatar, setSelectedAvatar] = useState(null);

  // UI states
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showGenderModal, setShowGenderModal] = useState(false);
  const [showStateModal, setShowStateModal] = useState(false);
  const [showCityModal, setShowCityModal] = useState(false);
  const [showAvatarPicker, setShowAvatarPicker] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isEmailLoading, setIsEmailLoading] = useState(false);
  const [errors, setErrors] = useState({});

  // Alert states
  const [showLogoutAlert, setShowLogoutAlert] = useState(false);
  const [showValidationAlert, setShowValidationAlert] = useState(false);
  const [showSuccessAlert, setShowSuccessAlert] = useState(false);
  const [showStateFirstAlert, setShowStateFirstAlert] = useState(false);
  const [showImagePickerAlert, setShowImagePickerAlert] = useState(false);
  const [showPermissionAlert, setShowPermissionAlert] = useState(false);
  const [showEmailSentAlert, setShowEmailSentAlert] = useState(false);
  const [showEmailVerifiedAlert, setShowEmailVerifiedAlert] = useState(false);
  const [showEmailErrorAlert, setShowEmailErrorAlert] = useState(false);
  const [successData, setSuccessData] = useState(null);
  const [alertMessage, setAlertMessage] = useState('');
  const [emailVerificationSuccess, setEmailVerificationSuccess] = useState(false);
  const [emailVerificationError, setEmailVerificationError] = useState('');

  // Animation refs
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;
  const scaleAnim = useRef(new Animated.Value(0.95)).current;

  useEffect(() => {
    // Entrance animation
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
  }, []);

  const calculateAge = (birthDate) => {
    const today = new Date();
    const birth = new Date(birthDate);
    let age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      age--;
    }
    return age;
  };

  const validateForm = () => {
    const newErrors = {};

    if (!firstName.trim()) newErrors.firstName = 'First name is required';
    if (email && !isValidEmail(email)) newErrors.email = 'Invalid email';
    if (!gender) newErrors.gender = 'Gender is required';
    if (!selectedState) newErrors.state = 'State is required';
    if (!selectedCity) newErrors.city = 'City is required';

    // Require profile photo or avatar
    if (!profileImage && !selectedAvatar) newErrors.photo = 'Profile photo is required';

    const age = calculateAge(dateOfBirth);
    if (age < 18) {
      newErrors.dateOfBirth = 'You must be at least 18 years old';
    }

    setErrors(newErrors);

    if (Object.keys(newErrors).length > 0) {
      setShowValidationAlert(true);
      return false;
    }

    return true;
  };

  const isValidEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  const takePhoto = async () => {
    try {
      console.log('📷 Requesting camera permission...');
      const { status } = await ImagePicker.requestCameraPermissionsAsync();
      
      if (status !== 'granted') {
        console.log('❌ Camera permission denied');
        setAlertMessage('Please grant camera permission in your device settings to take photos');
        setShowPermissionAlert(true);
        return;
      }

      console.log('✅ Camera permission granted, opening camera...');
      
      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        console.log('📷 Photo selected:', result.assets[0].uri);
        setProfileImage(result.assets[0]);
        setSelectedAvatar(null);
        
        if (Platform.OS !== 'web') {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        }
      } else {
        console.log('❌ Camera cancelled');
      }
    } catch (error) {
      console.error('❌ Camera error:', error);
      setAlertMessage('Failed to open camera. Please try again');
      setShowPermissionAlert(true);
    }
  };

  const selectFromGallery = async () => {
    try {
      console.log('🖼️ Requesting gallery permission...');
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      
      if (status !== 'granted') {
        console.log('❌ Gallery permission denied');
        setAlertMessage('Please grant gallery permission in your device settings to select photos');
        setShowPermissionAlert(true);
        return;
      }

      console.log('✅ Gallery permission granted, opening gallery...');
      
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        console.log('🖼️ Gallery image selected:', result.assets[0].uri);
        setProfileImage(result.assets[0]);
        setSelectedAvatar(null);
        
        if (Platform.OS !== 'web') {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        }
      } else {
        console.log('❌ Gallery cancelled');
      }
    } catch (error) {
      console.error('❌ Gallery error:', error);
      setAlertMessage('Failed to open gallery. Please try again');
      setShowPermissionAlert(true);
    }
  };

  const showImagePickerOptions = () => {
    console.log('📸 Opening image picker modal');
    setShowImagePickerAlert(true);
  };


  const handleEmailVerification = async () => {
    if (!email || !isValidEmail(email)) {
      setAlertMessage('Please enter a valid email address');
      setShowEmailErrorAlert(true);
      return;
    }

    setIsEmailLoading(true);
    try {
      const result = await DatabaseService.sendEmailOTP(email);
      
      if (result.success) {
        setShowEmailOTPModal(true);
        setShowEmailSentAlert(true);
      } else {
        setAlertMessage(result.message || 'Failed to send verification email');
        setShowEmailErrorAlert(true);
      }
    } catch (error) {
      setAlertMessage('Failed to send verification email. Please try again');
      setShowEmailErrorAlert(true);
    } finally {
      setIsEmailLoading(false);
    }
  };

  const handleEmailOTPVerification = async (otp) => {
    console.log('🔐 Email OTP Verification started with OTP:', otp);
    
    if (!otp || otp.length !== 6) {
      console.log('❌ OTP validation failed');
      setEmailVerificationError('Please enter the complete 6-digit verification code');
      setEmailVerificationSuccess(false);
      return;
    }

    setIsEmailLoading(true);
    setEmailVerificationError(''); // Clear previous errors
    setEmailVerificationSuccess(false); // Clear previous success
    
    try {
      console.log('📤 Calling DatabaseService.verifyEmailOTP...');
      const result = await DatabaseService.verifyEmailOTP(email, otp);
      
      console.log('📥 Verification result:', result);
      
      if (result.success) {
        console.log('✅ Email verified successfully!');
        setIsEmailVerified(true);
        setEmailOTP('');
        setEmailVerificationSuccess(true); // Trigger success animation
        setEmailVerificationError('');
        
        // Haptic feedback
        if (Platform.OS !== 'web') {
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        }
        
        // Close modal after success animation completes (handled by EmailOTPModal)
      } else {
        console.log('❌ Verification failed:', result.message);
        // Set error - modal will display it
        setEmailVerificationError(result.message || 'Invalid verification code. Please try again');
        setEmailVerificationSuccess(false);
      }
    } catch (error) {
      console.error('❌ Email verification error:', error);
      setEmailVerificationError('Email verification failed. Please try again');
      setEmailVerificationSuccess(false);
    } finally {
      console.log('🔄 Resetting loading state');
      setIsEmailLoading(false);
    }
  };


  const handleBackPress = () => {
    setShowLogoutAlert(true);
  };

  const formatDate = (date) => {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
                   'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    return `${months[date.getMonth()]} ${date.getDate()} ${date.getFullYear()}`;
  };

  const handleSubmit = async () => {
    if (!validateForm()) {
      return;
    }

    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }

    setIsLoading(true);

    try {
      const firstInitial = firstName.charAt(0).toUpperCase();
      const lastInitial = (lastName || 'X').charAt(0).toUpperCase();
      const phoneDigits = fullPhoneNumber ? fullPhoneNumber.slice(-4) : '0000';
      const generatedUserId = `D-${firstInitial}${lastInitial}${phoneDigits}`;
      let base64Image = null;

      if (profileImage?.uri) {

        const resizedImage = await ImageManipulator.manipulateAsync(
          profileImage.uri,
          [{ resize: { width: 500 } }], // 🔥 critical
          {
            compress: 0.6,
            format: ImageManipulator.SaveFormat.JPEG,
            base64: true,
          }
        );

        base64Image = resizedImage.base64;
      }

      const profileData = {
        user_id: generatedUserId,
        phone_number: fullPhoneNumber || (countryCode + phoneNumber),
        country_code: countryCode,
        first_name: firstName.trim(),
        last_name: lastName.trim() || null,
        email: email.trim() || null,
        email_verified: isEmailVerified,
        date_of_birth: dateOfBirth.toISOString().split('T')[0],
        gender: gender,
        state: selectedState,
        city: selectedCity,
        referral_code: referralCode.trim() || null,
        profile_image: base64Image,

        // Store avatar id (or name) instead of JSON.stringify(component)
        avatar: selectedAvatar?.id || null,
        is_active: true,
        profile_completed: true
      };

     {/*} // Send profile to backend
      const createResult = await DatabaseService.createUserProfile(profileData);
      console.log('Create profile result:', createResult);

      if (createResult && createResult.success) {
        const returnedUserId = createResult.userId || generatedUserId;
        setSuccessData({ userId: returnedUserId, age: calculateAge(dateOfBirth), profileData: createResult.userData || profileData });
        setShowSuccessAlert(true);
      } else {
        const msg = (createResult && createResult.message) || 'Failed to create profile. Please try again';
        setAlertMessage(msg);
        setShowEmailErrorAlert(true);
      }
      setSuccessData({ userId: generatedUserId, age: calculateAge(dateOfBirth), profileData });
      // Send profile to backend */}
      const createResult = await DatabaseService.createUserProfile(profileData);
      console.log('Create profile result:', createResult);

      if (createResult && createResult.success) {
        const returnedUserId = createResult.userId || generatedUserId;
        setSuccessData({ userId: returnedUserId, age: calculateAge(dateOfBirth), profileData: createResult.userData || profileData });
        setShowSuccessAlert(true);
      } else {
        const msg = (createResult && createResult.message) || 'Failed to create profile. Please try again';
        setAlertMessage(msg);
        setShowEmailErrorAlert(true);
      }

    } catch (error) {

  console.log("PROFILE CREATE ERROR:", error);

  setAlertMessage(
    error?.message || 
    JSON.stringify(error) || 
    "Unknown error"
  );

  setShowEmailErrorAlert(true);


    } finally {
      setIsLoading(false);
    }
  };


  const renderProfileImage = () => {
    if (profileImage) {
      return <Image source={{ uri: profileImage.uri }} style={styles.profileImage} />;
    } else if (selectedAvatar) {
      // If avatar provides an SVG component, render it to fully cover the container
      const Icon = selectedAvatar.component;
      if (Icon) {
        // use container size (140) so SVG fills the circle completely
        return <Icon width={140} height={140} style={styles.avatarSvg} />;
      }
      // fallback to emoji/name if present
      return <Text style={styles.avatarPreview}>{selectedAvatar.emoji || selectedAvatar.name || selectedAvatar.id}</Text>;
    } else {
      return <MaterialIcons name="add-a-photo" size={45} color={Colors.white} />;
    }
  };

  // Modern Modal Component
  const ModernModal = ({ visible, onClose, title, data, onSelect, selectedValue }) => (
    <Modal
      visible={visible}
      transparent={true}
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <Animated.View style={[styles.modernModalContent, { opacity: fadeAnim }]}>
          <View style={styles.modernModalHeader}>
            <Text style={styles.modernModalTitle}>{title}</Text>
            <TouchableOpacity onPress={onClose} style={styles.modernCloseButton}>
              <MaterialIcons name="close" size={28} color={Colors.primary} />
            </TouchableOpacity>
          </View>
          
          <ScrollView style={styles.modernModalBody} showsVerticalScrollIndicator={false}>
            {data.map((item, index) => (
              <TouchableOpacity
                key={index}
                style={[
                  styles.modernModalItem,
                  selectedValue === item && styles.modernSelectedItem
                ]}
                onPress={() => {
                  onSelect(item);
                  onClose();
                  if (Platform.OS !== 'web') {
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  }
                }}
                activeOpacity={0.7}
              >
                <Text style={[
                  styles.modernModalItemText,
                  selectedValue === item && styles.modernSelectedItemText
                ]}>
                  {item}
                </Text>
                {selectedValue === item && (
                  <MaterialIcons name="check-circle" size={24} color={Colors.primary} />
                )}
              </TouchableOpacity>
            ))}
          </ScrollView>
        </Animated.View>
      </View>
    </Modal>
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar backgroundColor={Colors.white} barStyle="dark-content" />
      
      <KeyboardAvoidingView
        style={styles.keyboardAvoidingView}
        behavior={Platform.OS === 'ios' ? 'padding' : 'padding'}
      >
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity style={styles.modernBackButton} onPress={handleBackPress}>
            <MaterialIcons name="arrow-back-ios" size={28} color={Colors.secondary} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Create Profile</Text>
          <View style={styles.headerSpacer} />
        </View>

        <Animated.ScrollView 
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          style={{
            opacity: fadeAnim,
            transform: [{ translateY: slideAnim }],
          }}
        >
          {/* Subtitle */}
          <Text style={styles.subtitle}>Setup your profile and introduce yourself</Text>

          {/* Profile Image Section */}
          <View style={styles.profileImageSection}>
            <TouchableOpacity 
              style={styles.profileImageContainer} 
              onPress={showImagePickerOptions}
              activeOpacity={0.8}
            >
              {(!profileImage && !selectedAvatar) ? (
                <LinearGradient
                  colors={[Colors.blue,  Colors.primary, '#414A6C', '#4D4D66', '#5D505E', '#6C5457',
                    '#A3613C', '#CC6B28', Colors.orange1, Colors.secondary]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={styles.modernProfileImageCircle}
                >
                  {renderProfileImage()}
                </LinearGradient>
              ) : (
                // when an image or avatar is selected render content directly so it fills container without gradient behind it
                <View style={[styles.modernProfileImageCircle, { backgroundColor: 'transparent' }]}>
                  {renderProfileImage()}
                </View>
              )}
            </TouchableOpacity>
            <Text style={styles.tapToChangeText}>Profile Photo</Text>
          </View>

          {/* Form Fields */}
          <View style={styles.formContainer}>
            {/* Name Row */}
            <View style={styles.nameRow}>
              <View style={styles.nameField}>
                <Text style={styles.label}>First Name <Text style={styles.required}>*</Text></Text>
                <View style={[styles.modernInputContainer, errors.firstName && styles.inputErrorContainer]}>
                  <MaterialIcons name="person" size={20} color={Colors.gray} style={styles.inputIcon} />
                  <TextInput
                    style={styles.modernInput}
                    placeholder="First Name"
                    placeholderTextColor={Colors.gray}
                    value={firstName}
                    onChangeText={setFirstName}
                    autoCapitalize="words"
                  />
                </View>
                {errors.firstName && <Text style={styles.errorText}>{errors.firstName}</Text>}
              </View>
              
              <View style={styles.nameField}>
                <Text style={styles.label}>Last Name</Text>
                <View style={styles.modernInputContainer}>
                  <MaterialIcons name="person-outline" size={20} color={Colors.gray} style={styles.inputIcon} />
                  <TextInput
                    style={styles.modernInput}
                    placeholder="Last Name"
                    placeholderTextColor={Colors.gray}
                    value={lastName}
                    onChangeText={setLastName}
                    autoCapitalize="words"
                  />
                </View>
              </View>
            </View>

            {/* Email with Verify */}
            <View style={styles.fieldContainer}>
              <Text style={styles.label}>Email</Text>
              <View style={[styles.modernInputContainer, errors.email && styles.inputErrorContainer]}>
                <MaterialIcons name="mail" size={20} color={Colors.gray} style={styles.inputIcon} />
                <TextInput
                  style={[styles.modernInput, { flex: 1 }]}
                  placeholder="your@email.com"
                  placeholderTextColor={Colors.gray}
                  value={email}
                  onChangeText={setEmail}
                  keyboardType="email-address"
                  autoCapitalize="none"
                />
                
                {/* Verify Button or Badge - Now inside the input field */}
                {email && isValidEmail(email) && !isEmailVerified && (
                  <TouchableOpacity 
                    style={styles.verifyButtonInline}
                    onPress={handleEmailVerification}
                    disabled={isEmailLoading}
                  >
                    <Text style={styles.verifyButtonInlineText}>
                      {isEmailLoading ? 'Sending...' : 'Verify'}
                    </Text>
                  </TouchableOpacity>
                )}
                
                {isEmailVerified && (
                  <View style={styles.verifiedBadgeInline}>
                    <MaterialIcons name="check-circle" size={22} color="#10B981" />
                  </View>
                )}
              </View>
              {errors.email && <Text style={styles.errorText}>{errors.email}</Text>}
            </View>


            {/* Date of Birth */}
            <View style={styles.fieldContainer}>
              <Text style={styles.label}>Date of Birth <Text style={styles.required}>*</Text></Text>
              <TouchableOpacity
                style={[styles.modernInputContainer, errors.dateOfBirth && styles.inputErrorContainer]}
                onPress={() => setShowDatePicker(true)}
              >
                <Ionicons name="calendar" size={20} color={Colors.gray} style={styles.inputIcon} />
                <Text style={styles.modernDateText}>{formatDate(dateOfBirth)}</Text>
                <View style={styles.ageTag}>
                  <Text style={styles.ageTagText}>Age {calculateAge(dateOfBirth)}</Text>
                </View>
              </TouchableOpacity>
              {errors.dateOfBirth && <Text style={styles.errorText}>{errors.dateOfBirth}</Text>}
            </View>

            {/* Gender */}
            <View style={styles.fieldContainer}>
              <Text style={styles.label}>Gender <Text style={styles.required}>*</Text></Text>
              <TouchableOpacity
                style={[styles.modernInputContainer, errors.gender && styles.inputErrorContainer]}
                onPress={() => setShowGenderModal(true)}
              >
                <MaterialIcons name="wc" size={20} color={Colors.gray} style={styles.inputIcon} />
                <Text style={[styles.modernDropdownText, !gender && styles.placeholder]}>
                  {gender || 'Select Gender'}
                </Text>
                <MaterialIcons name="expand-more" size={20} color={Colors.gray} />
              </TouchableOpacity>
              {errors.gender && <Text style={styles.errorText}>{errors.gender}</Text>}
            </View>

            {/* State */}
            <View style={styles.fieldContainer}>
              <Text style={styles.label}>State <Text style={styles.required}>*</Text></Text>
              <TouchableOpacity
                style={[styles.modernInputContainer, errors.state && styles.inputErrorContainer]}
                onPress={() => setShowStateModal(true)}
              >
                <MaterialIcons name="location-on" size={20} color={Colors.gray} style={styles.inputIcon} />
                <Text style={[styles.modernDropdownText, !selectedState && styles.placeholder]}>
                  {selectedState || 'Select State'}
                </Text>
                <MaterialIcons name="expand-more" size={20} color={Colors.gray} />
              </TouchableOpacity>
              {errors.state && <Text style={styles.errorText}>{errors.state}</Text>}
            </View>

            {/* City */}
            <View style={styles.fieldContainer}>
              <Text style={styles.label}>City <Text style={styles.required}>*</Text></Text>
              <TouchableOpacity
                style={[styles.modernInputContainer, errors.city && styles.inputErrorContainer]}
                onPress={() => {
                  if (!selectedState) {
                    setShowStateFirstAlert(true);
                    return;
                  }
                  setShowCityModal(true);
                }}
              >
                <MaterialIcons name="location-city" size={20} color={Colors.gray} style={styles.inputIcon} />
                <Text style={[styles.modernDropdownText, !selectedCity && styles.placeholder]}>
                  {selectedCity || 'Select City'}
                </Text>
                <MaterialIcons name="expand-more" size={20} color={Colors.gray} />
              </TouchableOpacity>
              {errors.city && <Text style={styles.errorText}>{errors.city}</Text>}
            </View>

            {/* Referral Code */}
            <View style={styles.fieldContainer}>
              <Text style={styles.label}>Referral Code</Text>
              <View style={styles.modernInputContainer}>
                <MaterialIcons name="card-giftcard" size={20} color={Colors.gray} style={styles.inputIcon} />
                <TextInput
                  style={styles.modernInput}
                  placeholder="Optional referral code"
                  placeholderTextColor={Colors.gray}
                  value={referralCode}
                  onChangeText={setReferralCode}
                  autoCapitalize="characters"
                />
              </View>
            </View>

            {/* Continue Button */}
            <TouchableOpacity
              style={[styles.modernContinueButton, isLoading && styles.buttonDisabled]}
              onPress={handleSubmit}
              disabled={isLoading}
              activeOpacity={0.9}
            >
              <LinearGradient
                colors={[Colors.primary, '#0D3A6F']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.gradientButtonContent}
              >
                <Text style={styles.modernContinueButtonText}>
                  {isLoading ? 'Creating Profile...' : 'Continue'}
                </Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </Animated.ScrollView>
      </KeyboardAvoidingView>

      {/* Modals */}
      <ModernModal
        visible={showGenderModal}
        onClose={() => setShowGenderModal(false)}
        title="Select Gender"
        data={['Male', 'Female', 'Prefer Not To Say']}
        onSelect={setGender}
        selectedValue={gender}
      />

      <ModernModal
        visible={showStateModal}
        onClose={() => setShowStateModal(false)}
        title="Select State"
        data={STATES}
        onSelect={(state) => {
          setSelectedState(state);
          setSelectedCity('');
        }}
        selectedValue={selectedState}
      />

      <ModernModal
        visible={showCityModal}
        onClose={() => setShowCityModal(false)}
        title="Select City"
        data={getCitiesByState(selectedState)}
        onSelect={setSelectedCity}
        selectedValue={selectedCity}
      />

      {/* Email OTP Modal */}
      <EmailOTPModal
        visible={showEmailOTPModal}
        email={email}
        onClose={() => {
          console.log('🚪 EmailOTPModal closed');
          setShowEmailOTPModal(false);
          setEmailOTP('');
          setEmailVerificationError('');
          setEmailVerificationSuccess(false);
        }}
        onVerify={handleEmailOTPVerification}
        isLoading={isEmailLoading}
        verificationSuccess={emailVerificationSuccess}
        verificationError={emailVerificationError}
      />

      {/* Avatar Picker */}
      <AvatarPicker
        visible={showAvatarPicker}
        onClose={() => setShowAvatarPicker(false)}
       onSelect={async (avatar) => {
          setSelectedAvatar(avatar);
          setProfileImage(null);

          // ✅ CALL BACKEND HERE
          await myDatabaseService.selectAvatar(
            fullPhoneNumber || (countryCode + phoneNumber),
            avatar.id   // or avatar.name depending on your data
          );
        }}
        selectedAvatar={selectedAvatar}
      />

      {/* Date Picker Modal */}
      <DatePickerModal
        visible={showDatePicker}
        value={dateOfBirth}
        onClose={() => setShowDatePicker(false)}
        onConfirm={(date) => setDateOfBirth(date)}
        minimumDate={new Date(1950, 0, 1)}
        maximumDate={new Date()}
      />

      {/* Custom Alerts */}
      <CustomAlert
        visible={showLogoutAlert}
        title="Go Back"
        message="Are you sure you want to go back to login screen?"
        icon="logout"
        iconColor="#EF4444"
        buttons={[
          { text: 'Cancel', style: 'cancel', onPress: () => setShowLogoutAlert(false) },
          { 
            text: 'Yes', 
            style: 'Primary', 
            onPress: () => {
              setShowLogoutAlert(false);
              navigation.navigate('Login');
            }
          }
        ]}
        onBackdropPress={() => setShowLogoutAlert(false)}
      />

      <CustomAlert
        visible={showValidationAlert}
        title="Validation Error"
        message="Please fill all required fields correctly"
        icon="error-outline"
        iconColor="#EF4444"
         buttons={[
          { text: 'OK', onPress: () => setShowValidationAlert(false) }
        ]}
        onBackdropPress={() => setShowValidationAlert(false)}
      />

      <CustomAlert
        visible={showSuccessAlert}
        title="Profile Created Successfully!"
        message={successData ? `Welcome to DRIVVE!\n\nYour User ID: ${successData.userId}\n\nAge: ${successData.age} years` : ''}
        icon="check-circle"
        iconColor="#10B981"
        buttons={[
          {
            text: 'Continue',
            onPress: () => {
              setShowSuccessAlert(false);
// Set session and navigate to Home
              login({
                phone_number: fullPhoneNumber || (countryCode + phoneNumber),
                id: successData?.userId,
                ...successData?.profileData,
              });
              // Reset
              navigation.reset({
                index: 0,
                routes: [{ name: 'Home' }],
              });
              // try {
              //   navigation.replace('Home', {
              //     firstName: firstName.trim(),
              //     lastName: lastName.trim(),
              //     userId: successData?.userId,
              //     userData: successData?.profileData,
              //     isNewUser: true
              //   });
              // } catch (navError) {
              //   navigation.navigate('Login');
              // }
            }
          }
        ]}
      />

      <CustomAlert
        visible={showStateFirstAlert}
        title="Select State First"
        message="Please select a state before choosing a city"
        icon="location-on"
        iconColor="#F59E0B"
        buttons={[
          { text: 'OK', onPress: () => setShowStateFirstAlert(false) }
        ]}
        onBackdropPress={() => setShowStateFirstAlert(false)}
      />

      <ProfilePictureModal
        visible={showImagePickerAlert}
        onClose={() => setShowImagePickerAlert(false)}
        onCamera={takePhoto}
        onGallery={selectFromGallery}
        onAvatar={() => setShowAvatarPicker(true)}
      />

      <CustomAlert
        visible={showPermissionAlert}
        title="Permission Required"
        message={alertMessage}
        icon="lock"
        iconColor="#F59E0B"
        buttons={[
          { text: 'OK', onPress: () => setShowPermissionAlert(false) }
        ]}
        onBackdropPress={() => setShowPermissionAlert(false)}
      />

      <CustomAlert
        visible={showEmailSentAlert}
        title="OTP Sent!"
        message={`Verification code sent to ${email}`}
        icon="mark-email-read"
        iconColor="#10B981"
        buttons={[
          { text: 'OK', onPress: () => setShowEmailSentAlert(false) }
        ]}
        onBackdropPress={() => setShowEmailSentAlert(false)}
      />

      <CustomAlert
        visible={showEmailErrorAlert}
        title="Error"
        message={alertMessage}
        icon="error"
        iconColor="#EF4444"
        buttons={[
          { text: 'Try Again', onPress: () => setShowEmailErrorAlert(false) }
        ]}
        onBackdropPress={() => setShowEmailErrorAlert(false)}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.white,
  },
  keyboardAvoidingView: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 0.5,
    borderBottomColor: '#F3F4F6',
  },
  modernBackButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    ...Typography.h2,
    fontSize: 28,
    fontWeight: '700',
    color: Colors.primary,
    flex: 1,
    textAlign: 'center',
  },
  headerSpacer: {
    width: 44,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 40,
    paddingTop: 10,
  },
  subtitle: {
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center',
    marginBottom: 32,
    fontWeight: '500',
  },
  profileImageSection: {
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 40,
  },
  profileImageContainer: {
    width: 140,
    height: 140,
    borderRadius: 70,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 12,
    marginBottom: 12,
    overflow: 'visible',
  },
  modernProfileImageCircle: {
    width: '100%',
    height: '100%',
    borderRadius: 70,
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  profileImage: {
    width: '100%',
    height: '100%',
    borderRadius: 70,
  },
  avatarPreview: {
    fontSize: 70,
  },
  // added: svg avatar preview sizing/centering
  avatarSvg: {
    width: '100%',
    height: '100%',
    alignSelf: 'center',
  },
  tapToChangeText: {
    fontSize: 15,
    color: Colors.primary,
    fontWeight: 'bold',
    marginTop: 8,
  },
  formContainer: {
    flex: 1,
  },
  nameRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 20,
  },
  nameField: {
    flex: 1,
  },
  fieldContainer: {
    marginBottom: 20,
  },
  label: {
    fontSize: 15,
    color: Colors.primary,
    fontWeight: '600',
    marginBottom: 10,
  },
  required: {
    color: '#EF4444',
  },
  modernInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: '#E5E7EB',
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 0,
    backgroundColor: '#F9FAFB',
    height: 52,
    width: '100%',
  },
  inputErrorContainer: {
    borderColor: '#EF4444',
    backgroundColor: '#FEE2E2',
  },
  inputIcon: {
    marginRight: 10,
    marginLeft: 0,
  },
  modernInput: {
    flex: 1,
    fontSize: 16,
    color: Colors.dark,
    fontWeight: '500',
    paddingVertical: 0,
    height: '100%',
    textAlignVertical: 'center',
    textAlign: 'left',
    includeFontPadding: false,
  },
  modernDateText: {
    flex: 1,
    fontSize: 16,
    color: Colors.dark,
    fontWeight: '500',
    paddingTop: 16,
    height: '100%',
    textAlignVertical: 'center',
  },
  ageTag: {
    backgroundColor: '#E0E7FF',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 20,
    marginLeft: 8,
  },
  ageTagText: {
    fontSize: 12,
    color: Colors.primary,
    fontWeight: '600',
  },
  modernDropdownText: {
    flex: 1,
    fontSize: 16,
    color: Colors.dark,
    fontWeight: '500',
  },
  placeholder: {
    color: Colors.gray,
  },
  errorText: {
    fontSize: 12,
    color: '#EF4444',
    marginTop: 6,
    fontWeight: '500',
  },
  verifyButtonInline: {
  paddingHorizontal: 8,
  paddingVertical: 0,
  marginRight: 0,
  justifyContent: 'center',
  alignItems: 'center',
},
verifyButtonInlineText: {
  color: Colors.primary,
  fontSize: 14,
  fontWeight: '700',
  letterSpacing: 0.5,
  textDecorationLine: 'underline',
},
verifiedBadgeInline: {
  marginRight: 5,
  justifyContent: 'center',
  alignItems: 'center',
},
  modernContinueButton: {
    borderRadius: 16,
    overflow: 'hidden',
    marginTop: 30,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 8,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  gradientButtonContent: {
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 8,
  },
  modernContinueButtonText: {
    color: Colors.white,
    fontSize: 18,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'flex-end',
  },
  modernModalContent: {
    backgroundColor: Colors.white,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    maxHeight: height* 0.7,
    paddingTop: 0,
  },
  modernModalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  modernModalTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: Colors.primary,
  },
  modernCloseButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modernModalBody: {
    paddingHorizontal: 20,
    paddingVertical: 0,
  },
  modernModalItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 16,
    paddingHorizontal: 0,
    borderBottomWidth: 1,
    borderBottomColor: '#F9FAFB',
  },
  modernSelectedItem: {
    backgroundColor: 'transparent',
  },
  modernModalItemText: {
    fontSize: 16,
    color: '#6B7280',
    fontWeight: '500',
  },
  modernSelectedItemText: {
    color: Colors.primary,
    fontWeight: '700',
  },
  modernVerifyOTPButton: {
    borderRadius: 16,
    overflow: 'hidden',
    marginTop: 24,
    width: '100%',
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 8,
  },
  modernVerifyOTPButtonText: {
    color: Colors.white,
    fontSize: 18,
    fontWeight: '700',
  },
});
