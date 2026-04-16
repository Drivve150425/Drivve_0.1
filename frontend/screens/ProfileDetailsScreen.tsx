import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useRef, useState, useEffect } from "react";
import {
  Image,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  KeyboardAvoidingView,
   Platform,
  Dimensions} from "react-native";
import DatabaseService from "../services/myprofile_ds";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import * as Animatable from "react-native-animatable";
import { ImageBackground } from "react-native";
import { Colors, Typography } from '../constants/Colors';
import { MaterialIcons } from '@expo/vector-icons';
import React, {useCallback} from "react";
import { useFocusEffect } from "@react-navigation/native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { CommonActions } from "@react-navigation/native";
import { Alert } from "react-native";
const { width, height } = Dimensions.get('window');
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from "../context/AuthContext";
import { Linking } from "react-native";
type RootStackParamList = {
  MyVehicleScreen: { phoneNumber: string };
  SavedAddressScreen: { phoneNumber: string };
  DocumentVerificationScreen: { phoneNumber: string };
  MatchingPreferenceScreen: { phoneNumber: string };
  EmergencyContactsscreen: { phoneNumber: string };
  PaymentScreen: undefined;
  DCoinScreen: { phoneNumber: string };
  // RewardsScreen: { phoneNumber: string };
  ReferEarn: undefined;
  ShareAppScreen: { phoneNumber: string };
  AboutUsScreen: undefined;
  PromotionScreen: { phoneNumber: string };
  Settings: { phoneNumber: string };
  HelpSupportScreen: undefined;
  myprofilescreen: { phoneNumber: string };
  // AdminDocumentApprovalScreen: undefined;
  FeedbackScreen: { phoneNumber: string };
  // RideFeedbackScreen: { phoneNumber: string };
};
import { NativeStackScreenProps } from "@react-navigation/native-stack";
type Props = NativeStackScreenProps<RootStackParamList, "myprofilescreen">;
type ScreensWithPhone =
  | "MyVehicleScreen"
  | "SavedAddressScreen"
  | "DocumentVerificationScreen"
  | "MatchingPreferenceScreen"
  | "EmergencyContactsscreen"
  | "DCoinScreen"
  // | "RewardsScreen"
  | "ShareAppScreen"
  | "PromotionScreen"
  | "Settings"
  | "FeedbackScreen"
  // | "RideFeedbackScreen";

type ScreensWithoutPhone =
  | "PaymentScreen"
  | "ReferEarn"
  | "AboutUsScreen"
  | "HelpSupportScreen"
  // | "AdminDocumentApprovalScreen";
export default function ProfileScreen({ navigation, route }: Props) {
    const scrollViewRef = useRef(null);
  const [showScrollTop, setShowScrollTop] = useState(false);
  const [profileImage, setProfileImage] = useState(null);

 // ✅ Use AuthContext for session management
  const { user, logout: authLogout } = useAuth();

  /* ✅ Get phone from route params or AuthContext */
  const phoneFromRoute = route?.params?.phoneNumber || null;
  const phoneFromAuth = user?.phoneNumber || user?.phone || null;
  const userFromAuth = user?.userName || user?.name || "User";
  const phoneFromRouteOrAuth = phoneFromRoute || phoneFromAuth;

  const [userName, setUserName] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");

const handleLogout = () => {
  Alert.alert(
    "Logout",
    "Are you sure you want to logout?",
    [
      { text: "Cancel", style: "cancel" },
      {
        text: "Logout",
        style: "destructive",
        onPress: async () => {
         await authLogout();
          navigation.dispatch(
            CommonActions.reset({
              index: 0,
              routes: [{ name: "Login" }],
            })
          );
        },
      },
    ]
  );
};
const loadProfile = async () => {
  try {
    const phoneToUse = phoneFromRouteOrAuth;
    if (!phoneToUse) return;

    const res = await DatabaseService.getUserProfile(phoneToUse);

    if (res?.success && res.user) {

      setUserName(res.user.full_name || "User");

      const dbPhone = res.user.phone_number || "";
      setPhoneNumber(dbPhone.startsWith("+") ? dbPhone : `+91 ${dbPhone}`);

      // ✅ SET PROFILE IMAGE
      if (res.user.profile_picture) {
        setProfileImage(res.user.profile_picture);
        console.log("PROFILE IMAGE:", res.user.profile_picture);
      }

    }
  } catch (err) {
    console.log("Profile fetch error:", err);
  }
};


useFocusEffect(
  useCallback(() => {
    loadProfile(); // 🔥 runs when coming back from edit screen
  }, [phoneFromRouteOrAuth])
);

  const infoItems: {
    title: string;
    icon: keyof typeof Ionicons.glyphMap;
    screen: keyof RootStackParamList;
  }[] = [
    { title: "My Vehicle", icon: "car-outline", screen: "MyVehicleScreen" },
    { title: "Saved Address", icon: "location-outline", screen: "SavedAddressScreen" },
    { title: "My Documents", icon: "document-text-outline", screen: "DocumentVerificationScreen" },
    // { title:"Admin Documents", icon:"folder-open-outline", screen:"AdminDocumentApprovalScreen"},
    { title: "Matching Preferences", icon: "settings-outline", screen: "MatchingPreferenceScreen" },
    { title: "Emergency Contact", icon: "alert-circle-outline", screen: "EmergencyContactsscreen" },
  ];

  const paymentItems: {
    title: string;
    icon: keyof typeof Ionicons.glyphMap;
    screen: keyof RootStackParamList;
  }[] = [
    { title: "D-coins", icon: "diamond-outline", screen: "DCoinScreen" },
    // { title: "Rewards", icon: "gift-outline", screen: "RewardsScreen" },
    // {title:"Ride Feedback", icon:"chatbox-ellipses-outline", screen:"RideFeedbackScreen"},
  ];

  const otherItems: {
    title: string;
    icon: keyof typeof Ionicons.glyphMap;
    screen: keyof RootStackParamList;
  }[] = [
    { title: "Refer & Earn", icon: "person-add-outline", screen: "ShareAppScreen" },
    { title: "About Us", icon: "information-circle-outline", screen: "AboutUsScreen" },
    { title: "Promotions & Offers", icon: "pricetags-outline", screen: "PromotionScreen" },
    { title: "Settings", icon: "cog-outline", screen: "Settings" },
    { title: "Help & Support", icon: "help-circle-outline", screen: "HelpSupportScreen" },
        {title:"Feedback", icon:"chatbubbles-outline", screen:"FeedbackScreen"},

  ];

  const handleScroll = (event: any) => {
    const scrollY = event.nativeEvent.contentOffset.y;
    setShowScrollTop(scrollY > 200);
  };

 const handleMenuItemPress = (screen: keyof RootStackParamList) => {
    if (screen === "AboutUsScreen") {
    Linking.openURL("https://drivve.netlify.app/about");
    return;
  }
  const screensWithPhone: ScreensWithPhone[] = [
    "MyVehicleScreen",
    "SavedAddressScreen",
    "DocumentVerificationScreen",
    "MatchingPreferenceScreen",
    "EmergencyContactsscreen",
    "DCoinScreen",
    // "RewardsScreen",
    "ShareAppScreen",
    "PromotionScreen",
    "Settings",
    "FeedbackScreen",
    // "RideFeedbackScreen",
  ];

  if (screensWithPhone.includes(screen as ScreensWithPhone)) {
    navigation.navigate(screen as ScreensWithPhone, { phoneNumber });
  } else {
    navigation.navigate(screen as ScreensWithoutPhone);
  }
};

  const handleBack = () => {
    navigation.goBack();
  };

  const handleEditProfile = () => {
    navigation.navigate("myprofilescreen", {
      phoneNumber: phoneNumber,
    });
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar backgroundColor={Colors.white} barStyle="dark-content" />
       <KeyboardAvoidingView
              style={styles.keyboardAvoidingView}
              behavior={Platform.OS === 'ios' ? 'padding' : 'padding'}
            >
      {/* Header - Moved down slightly */}
      <View style={styles.header}>
          <TouchableOpacity style={styles.modernBackButton} onPress={handleBack}>
            <MaterialIcons name="arrow-back-ios" size={28} color={Colors.secondary} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Profile</Text>
          <View style={styles.headerSpacer} />
        </View>
      <ScrollView
        ref={scrollViewRef}
        showsVerticalScrollIndicator={false}
        style={styles.scrollView}
        onScroll={handleScroll}
        scrollEventThrottle={16}
        contentContainerStyle={styles.scrollContent}
      >
        {/* === Profile Card - Now Responsive === */}
        <View style={styles.profileCard}>
          <LinearGradient
            colors={[Colors.primary, '#0D3A6F']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.profileGradient}
          />

          <View style={styles.profileImageContainer}>
            <TouchableOpacity
              style={styles.profileImageWrapper}
              onPress={handleEditProfile}
              activeOpacity={0.8}
            >
              <LinearGradient
                colors={[Colors.white, '#F3F4F6']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.profileImageCircle}
              >
               <Image
                  source={
                    profileImage
                      ? { uri: profileImage }
                      : require("../assets/icon.png") // optional fallback
                  }
                  style={styles.profileImage}
                />

              </LinearGradient>

              {/* Edit icon overlay */}
              <View style={styles.editIconContainer}>
                <MaterialCommunityIcons
                  name="account-box-edit-outline"
                  size={18}
                  color={Colors.primary}
                />
              </View>
            </TouchableOpacity>
          </View>

          <Text style={styles.profileName}>
            {userName || "User"}
          </Text>

          <Text style={styles.profileNumber}>
            {phoneNumber}
          </Text>

          {/* Rating - Removed background */}
          <View style={styles.ratingContainer}>
            <Ionicons name="star" size={20} color="#FFD700" />
            <Text style={styles.ratingValue}>4.5</Text>
          </View>

          {/* Stats - Removed background */}
          <View style={styles.statsContainer}>
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>0</Text>
              <Text style={styles.statLabel}>Total Rides</Text>
            </View>

            <View style={styles.statDivider} />

            <View style={styles.statItem}>
              <Text style={styles.statNumber}>0</Text>
              <Text style={styles.statLabel}>Total Drives</Text>
            </View>

            <View style={styles.statDivider} />

            <View style={styles.statItem}>
              <Text style={styles.statNumber}>20kg</Text>
              <Text style={styles.statLabel}>CO₂ Reduced</Text>
            </View>
          </View>

        <Animatable.View
  animation="fadeIn"
  duration={600}
  style={styles.bgContainer}
>
  <ImageBackground
    source={require("../assets/s8.png")}
    style={styles.bgImage}
    resizeMode="contain"
    imageStyle={styles.bgImageStyle}
  />
</Animatable.View>

        </View>

        {/* === Sections === */}
        <View style={styles.sectionsContainer}>
          {[["My Information", infoItems],
            ["Payment Information", paymentItems],
            ["Other Information", otherItems]].map(
            ([title, items]: any, i) => (
              <View style={styles.section} key={i}>
                <Text style={styles.sectionTitle}>{title}</Text>
                <View style={styles.menuCard}>
                  {items.map((item: any, index: number) => (
                    <TouchableOpacity
                      key={index}
                      style={styles.menuItem}
                      onPress={() => handleMenuItemPress(item.screen)}
                    >
                      <View style={styles.menuItemLeft}>
                        <View style={styles.iconContainer}>
                          <Ionicons name={item.icon} size={22} color={Colors.primary} />
                        </View>
                        <Text style={styles.menuItemText}>{item.title}</Text>
                      </View>
                      <Ionicons name="chevron-forward" size={28} color={Colors.primary} />
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            )
          )}

<TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
            <LinearGradient
              colors={[Colors.primary, '#0D3A6F']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.logoutGradient}
            >
              <Ionicons name="log-out-outline" size={22} color="white" />
              <Text style={styles.logoutText}>Log out</Text>
            </LinearGradient>
          </TouchableOpacity>

          <View style={styles.footer}>
            <View style={styles.logoContainer}>
              <Image
                source={require("../assets/logogray.png")}
                style={styles.logoImage}
              />
            </View>
            <Text style={styles.versionText}>Version 1.0.0</Text>
            <Text style={styles.copyrightText}>
              © 2025 Drivve. All rights reserved.
            </Text>
          </View>
        </View>
      </ScrollView>
</KeyboardAvoidingView>

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
  headerContainer: {
    paddingTop: 30, // Added padding to move header down slightly
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
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
  },
  profileCard: {
    marginHorizontal: 20,
    marginTop: 20,
    borderRadius: 25,
    padding: width < 375 ? 20 : 25, // Responsive padding
    backgroundColor: Colors.primary,
    borderWidth: 0,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 12,
    alignItems: "center",
    position: "relative",
    overflow: "hidden",
    minHeight: width < 375 ? 320 : 350, // Responsive min height
  },
  profileGradient: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: 25,
  },
bgContainer: {
  position: "absolute",
  top: 0,
  bottom: 0,
  left: 10,
  right: 10,
  pointerEvents: "none",
}

,
  bgImage: {
    width: "100%",
    height: "100%",
      flex: 1,
  },
  bgImageStyle: {
    opacity: 0.08,
  },
  profileImageContainer: {
    marginBottom: width < 375 ? 10 : 15, // Responsive margin
    position: "relative",
    zIndex: 2,
  },
  profileImageWrapper: {
    width: width < 375 ? 100 : 120, // Responsive size
    height: width < 375 ? 100 : 120, // Responsive size
    borderRadius: width < 375 ? 50 : 80,
    backgroundColor: Colors.white,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 12,
    position: "relative",
  },
  profileImageCircle: {
    width: '100%',
    height: '100%',
    borderRadius: width < 375 ? 50 : 70,
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  profileImage: {
    width: width < 375 ? 90 : 110, // Responsive size
    height: width < 375 ? 90 : 110, // Responsive size
    borderRadius: width < 375 ? 45 : 55,
    borderWidth: 0,
  },
  editIconContainer: {
    position: "absolute",
    bottom: 5,
    right: 5,
    backgroundColor: Colors.white,
    borderRadius: 15,
    width: width < 375 ? 28 : 30,
    height: width < 375 ? 28 : 30,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
    borderWidth: 1.5,
    borderColor: Colors.primary,
  },
  profileName: {
    fontSize: width < 375 ? 22 : 26, // Responsive font size
    color: Colors.white,
    fontWeight: "700",
    fontFamily: "inter",
    marginBottom: 5,
    textAlign: 'center',
  },
  profileNumber: {
    color: "rgba(255,255,255,0.9)",
    fontSize: width < 375 ? 16 : 20, // Responsive font size
    fontWeight: "500",
    fontFamily: "inter",
    marginBottom: 10,
    textAlign: 'center',
  },
  ratingContainer: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 15,
    marginBottom: 20,
    // Background removed as requested
  },
  ratingValue: {
    color: Colors.white,
    fontSize: width < 375 ? 18 : 20, // Responsive font size
    fontWeight: "600",
    marginLeft: 5,
    fontFamily: "inter",
  },
  statsContainer: {
    flexDirection: "row",
    borderRadius: 20,
    padding: width < 375 ? 12 : 15, // Responsive padding
    width: "100%",
    justifyContent: "space-between",
    // Background removed as requested
  },
  statItem: {
    alignItems: "center",
    flex: 1,
  },
  statNumber: {
    color: Colors.white,
    fontSize: width < 375 ? 18 : 20, // Responsive font size
    fontWeight: "700",
    fontFamily: "inter",
    marginBottom: 4,
  },
  statLabel: {
    color: "rgba(255,255,255,0.9)",
    fontSize: width < 375 ? 14 : 16, // Responsive font size
    fontWeight: "500",
    fontFamily: "inter",
    textAlign: "center",
  },
  statDivider: {
    width: 1,
    backgroundColor: "rgba(255,255,255,0.3)",
    marginHorizontal: 5,
  },
  sectionsContainer: {
    paddingHorizontal: width < 375 ? 16 : 20, // Responsive padding
    paddingTop: 25,
    paddingBottom: 30,
  },
  section: {
    marginBottom: 25,
  },
  sectionTitle: {
    fontSize: width < 375 ? 20 : 24, // Responsive font size
    color: Colors.primary,
    fontWeight: "700",
    marginBottom: 20,
    fontFamily: "inter",
    paddingLeft: 5,
  },
  menuCard: {
    backgroundColor: Colors.white,
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: '#E5E7EB',
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
    overflow: "hidden",
  },
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: width < 375 ? 14 : 16, // Responsive padding
    paddingHorizontal: width < 375 ? 16 : 20, // Responsive padding
    borderBottomWidth: 1.5,
    borderBottomColor: '#F3F4F6',
  },
  menuItemLeft: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  iconContainer: {
    width: width < 375 ? 40 : 44, // Responsive size
    height: width < 375 ? 40 : 44, // Responsive size
    borderRadius: 12,
    backgroundColor: '#E0E7FF',
    justifyContent: "center",
    alignItems: "center",
    marginRight: width < 375 ? 12 : 15, // Responsive margin
  },
  menuItemText: {
    fontSize: width < 375 ? 16 : 18, // Responsive font size
    color: Colors.dark,
    fontWeight: "600",
    fontFamily: "inter",
  },
  logoutButton: {
    borderRadius: 16,
    overflow: 'hidden',
    marginTop: 20,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 8,
  },
  logoutGradient: {
    paddingVertical: width < 375 ? 14 : 16, // Responsive padding
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 8,
  },
  logoutText: {
    color: Colors.white,
    fontSize: width < 375 ? 16 : 18, // Responsive font size
    fontWeight: "700",
    marginLeft: 8,
    fontFamily: "inter",
  },
  footer: {
    alignItems: 'center',
    marginTop: 30,
    paddingVertical: 0,
  },
  logoContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
  },
  logoImage: {
    width: width < 375 ? 70 : 80, // Responsive size
    height: width < 375 ? 70 : 80, // Responsive size
    resizeMode: 'contain',
    marginBottom: -10,
  },
  versionText: {
    fontSize: width < 375 ? 12 : 14, // Responsive font size
    color: '#6B7280',
    marginBottom: 5,
    fontFamily: 'inter',
    fontWeight: '500',
  },
  copyrightText: {
    fontSize: width < 375 ? 10 : 12, // Responsive font size
    color: '#9CA3AF',
    textAlign: 'center',
    fontFamily: 'inter',
    fontWeight: '500',
  },
  scrollTopButton: {
    position: 'absolute',
    bottom: 30,
    right: 20,
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: Colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: Colors.primary,
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
});