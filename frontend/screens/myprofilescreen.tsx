import React, { useRef, useState, useEffect } from 'react';
import {
  Alert,
  Dimensions,
  Image,
  Modal,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  Animated,
  KeyboardAvoidingView,
  Platform,
  Text as RNText,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation } from '@react-navigation/native';
import { useRoute, RouteProp } from '@react-navigation/native';
import * as Haptics from 'expo-haptics';
import * as ImagePicker from 'expo-image-picker';
import EmailOTPModal from '../components/EmailOTPModal';
import { useFocusEffect } from "@react-navigation/native";
import { useCallback } from "react";
import { ImageStyle } from 'react-native';
import DatabaseService from "../services/myprofile_ds";
import createDatabaseService from "../services/createprofile_ds";

import { Colors, Typography } from "../constants/Colors";
import { STATES, getCitiesByState } from "../constants/IndianStatesData";
import CustomAlert from '../components/CustomAlert';
import DatePickerModal from '../components/DatePickerModal';
import ProfilePictureModal from '../components/ProfilePictureModal';
import AvatarPicker from '../components/AvatarPicker';
import { useAuth } from "../context/AuthContext";
import { SvgCssUri } from 'react-native-svg/css';
const { width, height } = Dimensions.get("window");



export default function MyProfileScreen({ navigation, route })  {
  const scrollViewRef = useRef<ScrollView>(null);
  const { user } = useAuth();
  const [isAvatar, setIsAvatar] = useState(false);

  const phoneFromRoute = user?.phone_number;
  // Animation refs
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;
  const scaleAnim = useRef(new Animated.Value(0.95)).current;
  // Email verification states
  const [isEmailVerified, setIsEmailVerified] = useState(false);
  const [isEmailLoading, setIsEmailLoading] = useState(false);
  const [showEmailOTPModal, setShowEmailOTPModal] = useState(false);
  const [emailVerificationSuccess, setEmailVerificationSuccess] = useState(false);
  const [emailVerificationError, setEmailVerificationError] = useState('');
  const isValidEmail = (email: string) =>
  /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  const handleEmailVerification = async () => {
    if (!currentValue || !isValidEmail(currentValue.trim())) {
      setAlertMessage("Please enter a valid email address");
      setShowErrorAlert(true);
      return;
    }

    setIsEmailLoading(true);

    try {
      const res = await createDatabaseService.sendEmailOTP(currentValue);
      if (res?.success) {
        setShowEmailOTPModal(true);
      } else {
        setAlertMessage(res?.message || "Failed to send OTP");
        setShowErrorAlert(true);
      }
    } catch {
      setAlertMessage("Failed to send OTP");
      setShowErrorAlert(true);
    } finally {
      setIsEmailLoading(false);
    }
  };
  const handleEmailOTPVerification = async (otp: string) => {
  if (!otp || otp.length !== 6) {
    setEmailVerificationError("Enter valid 6-digit OTP");
    return;
  }

  setIsEmailLoading(true);
  setEmailVerificationError('');

  try {
    const res = await createDatabaseService.verifyEmailOTP(currentValue, otp);

    if (res?.success) {
      setIsEmailVerified(true);
      setEmailVerificationSuccess(true);

      // Save verified email
      DatabaseService.updateUserProfile({
        phone_number: phoneFromRoute,
        email: currentValue.trim(),
        email_verified: true,
      });

      setProfileData(prev => ({
        ...prev,
        emailID: currentValue.trim(),
      }));

      setShowEmailOTPModal(false);
      setCenterEditModalVisible(false);
      showProfileUpdateSuccess();
    } else {
      setEmailVerificationError(res?.message || "Invalid OTP");
    }
  } catch {
    setEmailVerificationError("Verification failed");
  } finally {
    setIsEmailLoading(false);
  }
};

    // Profile data
  const [profileData, setProfileData] = useState({
    name: "Aman Jain",
    phone: "+91 99999 99889",
    email: "",
    joinDate: "January 2022",
    image: "https://cdn-icons-png.flaticon.com/512/3011/3011270.png",
    firstName: "Aman",
    lastName: "Jain",
    mobileNumber: "+91 99999 99889",
    emailID: "",
    gender: "Male",
    dateOfBirth: "1995-11-03",
    state: "Uttar Pradesh",
    city: "Lucknow",
    bio: "",
  });

  // Modal states
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [currentField, setCurrentField] = useState("");
  const [currentValue, setCurrentValue] = useState("");
  const [editLabel, setEditLabel] = useState("");
  const [centerEditModalVisible, setCenterEditModalVisible] = useState(false);

  // Special modals
  const [showGenderModal, setShowGenderModal] = useState(false);
  const [showStateModal, setShowStateModal] = useState(false);
  const [showCityModal, setShowCityModal] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);

  // Image/Avatar states
  const [showImagePickerAlert, setShowImagePickerAlert] = useState(false);
  const [showAvatarPicker, setShowAvatarPicker] = useState(false);
  const [selectedAvatar, setSelectedAvatar] = useState(null);
  const [profileImage, setProfileImage] = useState(null);

  // Alert states
  const [showSuccessAlert, setShowSuccessAlert] = useState(false);
  const [showErrorAlert, setShowErrorAlert] = useState(false);
  const [alertMessage, setAlertMessage] = useState('');

  // Formatted date of birth
  const [formattedDOB, setFormattedDOB] = useState(new Date());
  
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

  /* ================= FETCH PROFILE FROM DB ================= */
  useEffect(() => {
    if (!phoneFromRoute) {
      console.log("❌ No phone number passed to MyProfileScreen");
      return;
    }

    DatabaseService.getUserProfile(phoneFromRoute)
      .then((res) => {
        if (res?.success && res.user) {
          const u = res.user;

          setProfileData((prev) => ({
            ...prev,
            name: u.full_name || prev.name,
            firstName: u.first_name || prev.firstName,
            lastName: u.last_name || prev.lastName,
            mobileNumber: u.phone_number || prev.mobileNumber,
            emailID: u.email || prev.emailID,
            gender: u.gender || prev.gender,
            dateOfBirth: u.date_of_birth || prev.dateOfBirth,
            state: u.state || prev.state,
            city: u.city || prev.city,
            image: u.profile_picture || prev.image,
            bio: u.bio || prev.bio,
            joinDate: u.created_at
              ? new Date(u.created_at).toLocaleDateString("en-US", {
                  month: "long",
                  year: "numeric",
                })
              : prev.joinDate,
          }));

          // Set formatted DOB for date picker
          if (u.date_of_birth) {
            setFormattedDOB(new Date(u.date_of_birth));
          }
        }
      })
      .catch((err) => {
        console.log("❌ Profile fetch error:", err);
      });
  }, [phoneFromRoute]);

  // Age from DOB
  const calculateAge = (dob: string) => {
    const birthDate = new Date(dob);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const m = today.getMonth() - birthDate.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age;
  };

  const handleBack = () => {
    navigation.goBack();
  };

  const formatDateOfBirth = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

const openEditModal = (field: string, value: string, label: string) => {
  if (field === "mobileNumber") return;

  // ---- SPECIAL MODALS (UNCHANGED) ----
  if (field === "gender") {
    setShowGenderModal(true);
    return;
  }

  if (field === "state") {
    setShowStateModal(true);
    return;
  }

  if (field === "city") {
    if (!profileData.state) {
      setAlertMessage("Please select a state first");
      setShowErrorAlert(true);
      return;
    }
    setShowCityModal(true);
    return;
  }

  if (field === "dateOfBirth") {
    setShowDatePicker(true);
    return;
  }

  if (field === "profileImage") {
    setShowImagePickerAlert(true);
    return;
  }

  // ---- CENTER MODAL ONLY FOR THESE ----
  const centerModalFields = ["firstName", "lastName", "bio", "emailID"];

  // Email editable ONLY if empty
  if (field === "emailID" && !isEmpty(profileData.emailID)) {
    return;
  }

  setCurrentField(field);
  setEditLabel(label);
  setCurrentValue(value ?? "");

 if (field === "emailID") {
  setCenterEditModalVisible(true);
  return;
}

if (centerModalFields.includes(field)) {
  setCenterEditModalVisible(true);
} else {
  setEditModalVisible(true);
}

};

const isEmpty = (value?: string) => !value || value.trim() === "";

 const handleSaveEdit = () => {
  // ---------- REQUIRED FIELD VALIDATION ----------
  if (
    (currentField === "firstName" || currentField === "lastName") &&
    isEmpty(currentValue)
  ) {
    setAlertMessage(`${editLabel} cannot be empty`);
    setShowErrorAlert(true);
    return;
  }

 
  // ---------- UPDATE LOCAL STATE ----------
  setProfileData((prev) => ({
    ...prev,
    [currentField]: currentValue.trim(),
    ...(currentField === "firstName" && {
      name: `${currentValue.trim()} ${prev.lastName}`,
    }),
    ...(currentField === "lastName" && {
      name: `${prev.firstName} ${currentValue.trim()}`,
    }),
  }));

  // ---------- BACKEND PAYLOAD ----------
  const payload = {
    phone_number: phoneFromRoute,
    ...(currentField === "firstName" && { first_name: currentValue.trim() }),
    ...(currentField === "lastName" && { last_name: currentValue.trim() }),
    ...(currentField === "emailID" && { email: currentValue.trim() }),
    ...(currentField === "bio" && { bio: currentValue.trim() }),
  };

  DatabaseService.updateUserProfile(payload)
    .then((res) => {
      if (!res?.success) {
        setAlertMessage("Failed to update profile");
        setShowErrorAlert(true);
      } else {
        setAlertMessage("Profile updated successfully!");
        setShowSuccessAlert(true);
      }
    })
    .catch(() => {
      setAlertMessage("Failed to update profile");
      setShowErrorAlert(true);
    });

  setEditModalVisible(false);
  
};

  const handleCancelEdit = () => {
    setEditModalVisible(false);
  };
const showProfileUpdateSuccess = () => {
  setAlertMessage("Profile updated successfully!");
  setShowSuccessAlert(true);
};

const handleGenderSelect = (gender: string) => {
  setProfileData((prev) => ({ ...prev, gender }));
  setShowGenderModal(false);

  DatabaseService.updateUserProfile({
    phone_number: phoneFromRoute,
    gender,
  })
    .then(() => showProfileUpdateSuccess())
    .catch(() => {
      setAlertMessage("Failed to update profile");
      setShowErrorAlert(true);
    });

  if (Platform.OS !== "web") {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  }
};

const handleStateSelect = (state: string) => {
  setProfileData((prev) => ({
    ...prev,
    state,
    city: "",
  }));
  setShowStateModal(false);

  DatabaseService.updateUserProfile({
    phone_number: phoneFromRoute,
    state,
    city: "",
  })
    .then(() => showProfileUpdateSuccess())
    .catch(() => {
      setAlertMessage("Failed to update profile");
      setShowErrorAlert(true);
    });

  if (Platform.OS !== "web") {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  }
};

const handleCitySelect = (city: string) => {
  setProfileData((prev) => ({ ...prev, city }));
  setShowCityModal(false);

  DatabaseService.updateUserProfile({
    phone_number: phoneFromRoute,
    city,
  })
    .then(() => showProfileUpdateSuccess())
    .catch(() => {
      setAlertMessage("Failed to update profile");
      setShowErrorAlert(true);
    });

  if (Platform.OS !== "web") {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  }
};

const calculateAgeFromDate = (date: Date) => {
  const today = new Date();
  let age = today.getFullYear() - date.getFullYear();
  const m = today.getMonth() - date.getMonth();

  if (m < 0 || (m === 0 && today.getDate() < date.getDate())) {
    age--;
  }

  return age;
};


const handleDateConfirm = (date: Date) => {
  const age = calculateAgeFromDate(date);

  // ❌ BLOCK UNDER 18 (same as CreateProfileScreen)
  if (age < 18) {
    setAlertMessage("You must be at least 18 years old to use this app");
    setShowErrorAlert(true);
    return;
  }

  // ✅ Save only valid DOB
  const formatted = date.toISOString().split("T")[0];

  setProfileData((prev) => ({
    ...prev,
    dateOfBirth: formatted,
  }));

  DatabaseService.updateUserProfile({
    phone_number: phoneFromRoute,
    date_of_birth: formatted,
  })
    .then(() => {
      setAlertMessage("Profile updated successfully!");
      setShowSuccessAlert(true);
    })
    .catch(() => {
      setAlertMessage("Failed to update profile");
      setShowErrorAlert(true);
    });

  setShowDatePicker(false);

  if (Platform.OS !== "web") {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  }
};


const takePhoto = async () => {
  try {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();

    if (status !== "granted") {
      setAlertMessage("Please grant camera permission in your device settings");
      setShowErrorAlert(true);
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });
if (!result.canceled && result.assets[0]) {

   const image = result.assets[0];

   setProfileImage(image);
   setSelectedAvatar(null);

   const res = await DatabaseService.updateProfilePicture(
       phoneFromRoute,
       image.uri
   );

   if(res?.success){

      setProfileData(prev => ({
        ...prev,
        image: res.profile_picture
      }));

      showProfileUpdateSuccess();

   } else {
      setAlertMessage("Failed to update profile picture");
      setShowErrorAlert(true);
   }
}

  } catch {
    setAlertMessage("Failed to open camera");
    setShowErrorAlert(true);
  }
};


  const selectFromGallery = async () => {
  try {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (status !== "granted") {
      setAlertMessage("Please grant gallery permission in your device settings");
      setShowErrorAlert(true);
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

   if (!result.canceled && result.assets[0]) {

   const image = result.assets[0];

   setProfileImage(image);
   setSelectedAvatar(null);

   const res = await DatabaseService.updateProfilePicture(
       phoneFromRoute,
       image.uri
   );

   if(res?.success){

      setProfileData(prev => ({
        ...prev,
        image: res.profile_picture
      }));

      showProfileUpdateSuccess();

   } else {
      setAlertMessage("Failed to update profile picture");
      setShowErrorAlert(true);
   }
}

  } catch {
    setAlertMessage("Failed to open gallery");
    setShowErrorAlert(true);
  }
};

const renderProfileImage = () => {
  // Priority 1: Newly selected image from camera/gallery
  if (profileImage) {
    return <Image source={{ uri: profileImage.uri }} style={styles.profileImage as ImageStyle} />;
  } 
  // Priority 2: Selected avatar from picker (local SVG component)
  else if (selectedAvatar) {
    const Icon = selectedAvatar.component;
    if (Icon) {
      return <Icon width={140} height={140} style={styles.avatarSvg} />;
    }
    return <Text style={styles.avatarPreview}>{selectedAvatar.emoji || selectedAvatar.name}</Text>;
  } 
  // Priority 3: Saved avatar URL from database (SVG from Supabase)
 else if (profileData.image && profileData.image.includes('/avatars/')) {
  return (
    <SvgCssUri
      uri={profileData.image}
      width={140}
      height={140}
    />
  );

  } 
  // Priority 4: Regular profile image (JPG/PNG)
  else if (profileData.image) {
    return <Image source={{ uri: profileData.image }} style={styles.profileImage as ImageStyle} />;
  } 
  // Priority 5: Default
  else {
    return <MaterialIcons name="add-a-photo" size={45} color={Colors.white} />;
  }
};

  const InfoField = ({
    label,
    value,
    field,
    editable = true,
  }: {
    label: string;
    value: string;
    field: string;
    editable?: boolean;
  }) => (
    <TouchableOpacity
      style={[styles.infoCard, !editable && styles.disabledCard]}
      onPress={() => editable && openEditModal(field, value, label)}
      disabled={!editable}
      activeOpacity={0.7}
    >
      <View style={styles.infoContent}>
        <Text style={styles.infoLabel}>{label}</Text>
        {field === "dateOfBirth" ? (
          <View style={styles.dobRow}>
            <Text style={styles.infoValue}>{formatDateOfBirth(value)}</Text>
            <View style={styles.ageBadge}>
              <Text style={styles.ageBadgeText}>Age {calculateAge(value)}</Text>
            </View>
          </View>
        ) : (
          <Text style={styles.infoValue} numberOfLines={1}>
            {value || (field === "bio" ? "Add something about yourself..." : "Not set")}
          </Text>
        )}
      </View>
      {editable && <MaterialIcons name="chevron-right" size={28} color={Colors.primary} />}
    </TouchableOpacity>
  );

  // Modern Modal Component (copied from CreateProfileScreen)
  const ModernModal = ({ 
    visible, 
    onClose, 
    title, 
    data, 
    onSelect, 
    selectedValue 
  }: {
    visible: boolean;
    onClose: () => void;
    title: string;
    data: string[];
    onSelect: (value: string) => void;
    selectedValue: string;
  }) => (
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
   <EmailOTPModal
  visible={showEmailOTPModal}
  email={currentValue}
  onClose={() => {
    setShowEmailOTPModal(false);
    setEmailVerificationError('');
    setEmailVerificationSuccess(false);
  }}
  onVerify={handleEmailOTPVerification}
  isLoading={isEmailLoading}
  verificationSuccess={emailVerificationSuccess}
  verificationError={emailVerificationError}
/>



    </Modal>
    
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar backgroundColor={Colors.white} barStyle="dark-content" />
      
      <KeyboardAvoidingView
        style={styles.keyboardAvoidingView}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity style={styles.modernBackButton} onPress={handleBack}>
            <MaterialIcons name="arrow-back-ios" size={28} color={Colors.orange1} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>My Details</Text>
          <View style={styles.headerSpacer} />
        </View>

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
          {/* Profile Image Section */}
        <TouchableOpacity
  style={styles.profileCard}
  onPress={() => openEditModal("profileImage", "", "Profile Photo")}
  activeOpacity={0.85}
>
  <View style={styles.profileImageWrapper}>
  {renderProfileImage()}

  {/* Transparent Overlay */}
  <View style={styles.imageOverlay} />

  {/* Center Pencil Icon */}
  <View style={styles.editIconContainer}>
    <MaterialIcons name="edit" size={22} color={Colors.white} />
  </View>
</View>

  <View style={styles.profileInfo}>
    <Text style={styles.profileName}>{profileData.name}</Text>
    <Text style={styles.profileMember}>
      Member Since {profileData.joinDate}
    </Text>
  </View>
</TouchableOpacity>


          {/* Personal Information Section */}
          <Text style={styles.sectionTitle}>Personal Information</Text>

          <InfoField label="First Name" value={profileData.firstName} field="firstName" />
          <InfoField label="Last Name" value={profileData.lastName} field="lastName" />
          <InfoField
            label="Mobile Number"
            value={profileData.mobileNumber}
            field="mobileNumber"
            editable={false}
          />
<InfoField
  label="Email ID"
  value={profileData.emailID}
  field="emailID"
  editable={isEmpty(profileData.emailID)}
/>
          <InfoField label="Gender" value={profileData.gender} field="gender" />
          <InfoField
            label="Date of Birth"
            value={profileData.dateOfBirth}
            field="dateOfBirth"
          />
          <InfoField label="State" value={profileData.state} field="state" />
          <InfoField label="City" value={profileData.city} field="city" />
          <InfoField
            label="Member Since"
            value={profileData.joinDate}
            field="joinDate"
            editable={false}
          />

          {/* About Me */}
          <TouchableOpacity
            style={styles.aboutCard}
            onPress={() => openEditModal("bio", profileData.bio, "About Me")}
            activeOpacity={0.7}
          >
            <View style={styles.aboutContent}>
              <Text style={styles.infoLabel}>About Me</Text>
              {profileData.bio ? (
                <Text style={styles.aboutText} numberOfLines={3} ellipsizeMode="tail">
                  {profileData.bio}
                </Text>
              ) : (
                <View style={styles.emptyBioContainer}>
                  <Text style={styles.emptyBioText}>Share something about yourself...</Text>
                </View>
              )}
            </View>
            <MaterialIcons name="chevron-right" size={28} color={Colors.primary} />
          </TouchableOpacity>
        </Animated.ScrollView>
      </KeyboardAvoidingView>

      {/* ====================== MODALS ======================= */}

      {/* Gender Modal */}
      <ModernModal
        visible={showGenderModal}
        onClose={() => setShowGenderModal(false)}
        title="Select Gender"
        data={['Male', 'Female', 'Prefer Not To Say']}
        onSelect={handleGenderSelect}
        selectedValue={profileData.gender}
      />

      {/* State Modal */}
      <ModernModal
        visible={showStateModal}
        onClose={() => setShowStateModal(false)}
        title="Select State"
        data={STATES}
        onSelect={handleStateSelect}
        selectedValue={profileData.state}
      />

      {/* City Modal */}
      <ModernModal
        visible={showCityModal}
        onClose={() => setShowCityModal(false)}
        title="Select City"
        data={getCitiesByState(profileData.state)}
        onSelect={handleCitySelect}
        selectedValue={profileData.city}
      />

      {/* Date Picker Modal */}
      <DatePickerModal
        visible={showDatePicker}
        value={formattedDOB}
        onClose={() => setShowDatePicker(false)}
        onConfirm={handleDateConfirm}
        minimumDate={new Date(1950, 0, 1)}
        maximumDate={new Date()}
      />

      {/* Edit Modal for Text Fields */}
      <Modal
        visible={editModalVisible}
        transparent
        animationType="slide"
        statusBarTranslucent
        onRequestClose={handleCancelEdit}
      >
        <View style={styles.modalOverlay}>
          <TouchableOpacity
            style={styles.modalBackdrop}
            activeOpacity={1}
            onPress={handleCancelEdit}
          />
          <View style={styles.bottomSheet}>
            <View style={styles.dragHandle} />

            <View style={[styles.modalHeader, currentField === "bio" && profileData.bio === "" && { paddingTop: 0, marginTop: 0 }]}>
              <Text style={styles.modalTitle}>
                {currentField === "bio" && profileData.bio === ""
                  ? "Add About Me"
                  : `Edit ${editLabel}`}
              </Text>

              <TouchableOpacity onPress={handleCancelEdit}>
                <View style={styles.closeIconWrapper}>
                  <MaterialIcons name="close" size={26} color={Colors.primary} />
                </View>
              </TouchableOpacity>
            </View>

            <View style={styles.modalBody}>
              {editLabel === "About Me" ? (
                <>
                  <TextInput
                    style={[styles.modalInput, styles.textArea]}
                    value={currentValue}
                    onChangeText={setCurrentValue}
                    placeholder={
                      profileData.bio === ""
                        ? "Tell others about yourself...\n\n• Your interests\n• What you enjoy\n• Your personality\n• Anything you'd like to share!"
                        : "Edit your bio..."
                    }
                    multiline
                    numberOfLines={6}
                    textAlignVertical="top"
                    maxLength={300}
                    placeholderTextColor="#888"
                  />
                  <Text style={styles.charCount}>{currentValue.length}/300 characters</Text>
                </>
              ) : (
                <TextInput
                  style={styles.modalInput}
                  value={currentValue}
                  onChangeText={setCurrentValue}
                  placeholder={`Enter ${editLabel.toLowerCase()}...`}
                  placeholderTextColor="#B5B5B5"
                  autoFocus
                />
              )}
            </View>

            <View style={styles.modalFooter}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton]}
                onPress={handleCancelEdit}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, styles.saveButton]}
                onPress={handleSaveEdit}
              >
                <Text style={styles.saveButtonText}>
                  {currentField === "bio" && profileData.bio === "" ? "Add" : "Save"}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
      <Modal
  visible={centerEditModalVisible}
  transparent
  animationType="fade"
  onRequestClose={() => setCenterEditModalVisible(false)}
>
  <View style={styles.centerModalOverlay}>
    <View style={styles.centerModalBox}>
      <View style={styles.centerModalHeader}>
  <Text style={styles.centerModalTitle}>
    {currentField === "bio" && profileData.bio === ""
      ? "Add About Me"
      : `Edit ${editLabel}`}
  </Text>

  <TouchableOpacity
    onPress={() => setCenterEditModalVisible(false)}
    style={styles.centerCloseButton}
    activeOpacity={0.7}
  >
    <MaterialIcons name="close" size={24} color={Colors.primary} />
  </TouchableOpacity>
</View>


     {currentField === "emailID" ? (
  <View style={styles.modernInputContainer}>
    <MaterialIcons name="mail" size={20} color={Colors.gray} />

    <TextInput
      style={styles.modernInput}
      value={currentValue}
      onChangeText={setCurrentValue}
      placeholder="your@email.com"
      keyboardType="email-address"
      autoCapitalize="none"
    />

    {!isEmailVerified && isValidEmail(currentValue.trim()) && (
      <TouchableOpacity onPress={handleEmailVerification}>
        <Text style={styles.verifyButtonInlineText}>Verify</Text>
      </TouchableOpacity>
    )}

    {isEmailVerified && (
      <MaterialIcons name="check-circle" size={22} color="#10B981" />
    )}
  </View>
) : (
  <>
    <TextInput
      style={[
        styles.centerModalInput,
        currentField === "bio" && styles.centerTextArea,
      ]}
      value={currentValue}
      onChangeText={setCurrentValue}
      placeholder={`Enter ${editLabel.toLowerCase()}...`}
      multiline={currentField === "bio"}
      numberOfLines={currentField === "bio" ? 5 : 1}
      maxLength={currentField === "bio" ? 300 : undefined}
    />

    {currentField === "bio" && (
      <Text style={styles.charCount}>
        {currentValue.length}/300
      </Text>
    )}
  </>
)}

  
      <View style={styles.centerModalActions}>
        <TouchableOpacity
          style={[styles.modalButton, styles.cancelButton]}
          onPress={() => setCenterEditModalVisible(false)}
        >
          <Text style={styles.cancelButtonText}>Cancel</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.modalButton, styles.saveButton]}
          onPress={() => {
            handleSaveEdit();
            setCenterEditModalVisible(false);
          }}
        >
          <Text style={styles.saveButtonText}>
            {currentField === "bio" && profileData.bio === "" ? "Add" : "Save"}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  </View>
</Modal>


      {/* Profile Picture Modal */}
      <ProfilePictureModal
        visible={showImagePickerAlert}
        onClose={() => setShowImagePickerAlert(false)}
        onCamera={takePhoto}
        onGallery={selectFromGallery}
        onAvatar={() => setShowAvatarPicker(true)}
      />
<AvatarPicker
  visible={showAvatarPicker}
  onClose={() => setShowAvatarPicker(false)}
  onSelect={async (avatar) => {
    setSelectedAvatar(avatar);
    setProfileImage(null);
    
    try {
      // Use the dedicated avatar endpoint instead of updateUserProfile
      const response = await DatabaseService.updateAvatar(phoneFromRoute, avatar.id);
      
      if (response?.success) {
        setProfileData(prev => ({
          ...prev,
          image: response.profile_picture
        }));
        showProfileUpdateSuccess();
      } else {
        setAlertMessage("Failed to update avatar");
        setShowErrorAlert(true);
      }
    } catch (error) {
      setAlertMessage("Failed to update avatar");
      setShowErrorAlert(true);
    }
  }}
  selectedAvatar={selectedAvatar}
/>


      {/* Custom Alerts */}
      <CustomAlert
        visible={showSuccessAlert}
        title="Success"
        message={alertMessage}
        icon="check-circle"
        iconColor="#10B981"
        buttons={[
          { text: 'OK', onPress: () => setShowSuccessAlert(false) }
        ]}
        onBackdropPress={() => setShowSuccessAlert(false)}
      />

      <CustomAlert
        visible={showErrorAlert}
        title="Error"
        message={alertMessage}
        icon="error"
        iconColor="#EF4444"
        buttons={[
          { text: 'OK', onPress: () => setShowErrorAlert(false) }
        ]}
        onBackdropPress={() => setShowErrorAlert(false)}
      />
    </SafeAreaView>
  );
}

/* ================== STYLES ================== */

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
  profileImageSection: {
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 40,
  },
  imageOverlay: {
  ...StyleSheet.absoluteFillObject,
  backgroundColor: "rgba(0,0,0,0.3)", // transparent dark layer
  borderRadius: 40,
},

editIconContainer: {
  position: "absolute",
  top: "50%",
  left: "50%",
  transform: [{ translateX: -18 }, { translateY: -18 }],
  padding: 8,
  borderRadius: 20,
  justifyContent: "center",
  alignItems: "center",
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
  sectionTitle: {
    ...Typography.h2,
    marginLeft: 5,
    marginTop: 0,
    marginBottom: 5,
    color: Colors.primary,
  },
  
  infoCard: {
    backgroundColor: Colors.white,
    marginHorizontal: 0,
    marginVertical: 8,
    borderRadius: 16,
    padding: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: '#E5E7EB',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  disabledCard: {
    backgroundColor: '#F9FAFB',
    borderColor: '#F3F4F6',
  },
  infoContent: {
    flex: 1,
  },
  infoLabel: {
    ...Typography.label,
    fontSize: 18,        // ⬆ increased
  fontWeight: "700",   // ⬆ bol
    color: Colors.primary,
    marginBottom: 6,
  },
  infoValue: {
    ...Typography.body1,
    color: Colors.dark,
     fontSize: 18,     
  },
  dobRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  ageBadge: {
    backgroundColor: '#E0E7FF',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    bottom:14
  },
  ageBadgeText: {
    fontSize: 12,
    color: Colors.primary,
    fontWeight: '600',
  },
  aboutCard: {
    backgroundColor: Colors.white,
    marginHorizontal: 0,
    marginVertical: 8,
    marginBottom: 16,
    borderRadius: 16,
    padding: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: '#E5E7EB',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  aboutContent: {
    flex: 1,
    paddingRight: 10,
  },
  aboutText: {
    ...Typography.body1,
    marginTop: 4,
    lineHeight: 20,
  },
  emptyBioContainer: {
    marginTop: 8,
    alignItems: "flex-start",
  },
  emptyBioText: {
    ...Typography.body1,
    color: Colors.gray,
    fontStyle: "italic",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalBackdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'transparent',
    zIndex: 1,
  },
  bottomSheet: {
    backgroundColor: Colors.white,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    maxHeight: '65%',
    zIndex: 2,
    overflow: 'hidden',
  },
  dragHandle: {
    width: 40,
    height: 4,
    backgroundColor: '#ddd',
    borderRadius: 2,
    alignSelf: 'center',
    marginTop: 12,
    marginBottom: 12,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  modalTitle: {
    ...Typography.h4,
    color: Colors.primary,
  },
  closeIconWrapper: {
    width: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor: 'rgba(24, 64, 128, 0.15)',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: 'rgba(24, 64, 128, 0.035)',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 0,
    elevation: 3,
  },
  modalBody: {
    paddingHorizontal: 20,
    paddingBottom: 10,
  },
  modalInput: {
    borderWidth: 1.5,
    borderColor: '#E5E7EB',
    borderRadius: 14,
    padding: 16,
    ...Typography.input,
    backgroundColor: '#F9FAFB',
    marginTop: 10,
  },
  textArea: {
    minHeight: 150,
    textAlignVertical: 'top',
    lineHeight: 22,
  },
  charCount: {
    textAlign: 'right',
    marginTop: 8,
    fontSize: 14,
    color: Colors.gray,
  },
  modalFooter: {
    flexDirection: 'row',
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
    gap: 12,
  },
  modalButton: {
    flex: 1,
    paddingVertical: 16,
    borderRadius: 14,
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: '#F9FAFB',
    borderWidth: 1.5,
    borderColor: '#E5E7EB',
  },
  saveButton: {
    backgroundColor: Colors.primary,
  },
  cancelButtonText: {
    ...Typography.button,
    color: Colors.gray,
  },
  saveButtonText: {
    ...Typography.button,
  },
  modernModalContent: {
    backgroundColor: Colors.white,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    maxHeight: height * 0.7,
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
  profileCard: {
  flexDirection: 'row',
  alignItems: 'center',
  backgroundColor: Colors.white,
  padding: 16,
  borderRadius: 20,
  marginBottom: 15,
  borderWidth: 1.5,
  borderColor: '#E5E7EB',
  shadowColor: '#000',
  shadowOffset: { width: 0, height: 6 },
  shadowOpacity: 0.08,
  shadowRadius: 10,
  elevation: 4,
},

profileImageWrapper: {
  width: 70,
  height: 70,
  borderRadius: 35,
  overflow: 'hidden',
  marginRight: 16,
  backgroundColor: '#F3F4F6',
  justifyContent: 'center',
  alignItems: 'center',
},

profileInfo: {
  flex: 1,
},

profileName: {
  fontSize: 24,
  fontWeight: '700',
  color: Colors.primary,
},

profileMember: {
  marginTop: 4,
  fontSize: 16,
  color: Colors.gray,
},
centerModalOverlay: {
  flex: 1,
  backgroundColor: "rgba(0,0,0,0.5)",
  justifyContent: "center",
  alignItems: "center",
},

centerModalBox: {
  width: "90%",
  backgroundColor: Colors.white,
  borderRadius: 20,
  padding: 20,
},

centerModalTitle: {
  ...Typography.h4,
  color: Colors.primary,
  marginBottom: 12,
},

centerModalInput: {
  borderWidth: 1.5,
  borderColor: "#E5E7EB",
  borderRadius: 14,
  padding: 14,
  backgroundColor: "#F9FAFB",
  ...Typography.input,
},
centerModalHeader: {
  flexDirection: "row",
  alignItems: "center",
  justifyContent: "space-between",
  marginBottom: 12,
},

centerCloseButton: {
  width: 36,
  height: 36,
  borderRadius: 18,
  backgroundColor: "rgba(24, 64, 128, 0.12)",
  justifyContent: "center",
  alignItems: "center",
},

centerTextArea: {
  minHeight: 120,
  textAlignVertical: "top",
},

centerModalActions: {
  flexDirection: "row",
  gap: 12,
  marginTop: 20,
},
modernInputContainer: {
  flexDirection: 'row',
  alignItems: 'center',
  borderWidth: 1.5,
  borderColor: '#E5E7EB',
  borderRadius: 14,
  paddingHorizontal: 14,
  backgroundColor: '#F9FAFB',
  height: 52,
},

modernInput: {
  flex: 1,
  fontSize: 16,
  color: Colors.dark,
  fontWeight: '500',
  paddingVertical: 0,
},

verifyButtonInlineText: {
  color: Colors.primary,
  fontSize: 14,
  fontWeight: '700',
  textDecorationLine: 'underline',
  marginLeft: 8,
},

});