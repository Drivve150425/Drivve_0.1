// import { Ionicons } from "@expo/vector-icons";
// import { LinearGradient } from "expo-linear-gradient";
// import { useRef, useState, useEffect } from "react";
// import {
//   Image,
//   ScrollView,
//   StatusBar,
//   StyleSheet,
//   Text,
//   TouchableOpacity,
//   View,
//   KeyboardAvoidingView,
//   Platform,
//   Dimensions,
//   ActivityIndicator
// } from "react-native";
// import DatabaseService from "../services/myprofile_ds";
// import { MaterialCommunityIcons } from "@expo/vector-icons";
// import * as Animatable from "react-native-animatable";
// import { ImageBackground } from "react-native";
// import { Colors, Typography } from '../constants/Colors';
// import { MaterialIcons } from '@expo/vector-icons';
// import React, { useCallback } from "react";
// import { useFocusEffect } from "@react-navigation/native";
// import AsyncStorage from "@react-native-async-storage/async-storage";
// import { CommonActions } from "@react-navigation/native";
// import { Alert } from "react-native";
// import { SafeAreaView } from 'react-native-safe-area-context';
// import { useAuth } from "../context/AuthContext";
// import { SvgCssUri } from 'react-native-svg/css';
// import LottieView from "lottie-react-native";
// import CustomAlert from '../components/CustomAlert'; // Import CustomAlert
// import { Linking, Share } from "react-native";
// const { width, height } = Dimensions.get('window');


// type RootStackParamList = {
//   MyVehicleScreen: { phoneNumber: string };
//   SavedAddressScreen: { phoneNumber: string };
//   DocumentVerificationScreen: { phoneNumber: string };
//   // AdminDocumentApprovalScreen: { phoneNumber: string };
//   MatchingPreferenceScreen: { phoneNumber: string };
//   EmergencyContactsscreen: { phoneNumber: string };
//   PaymentScreen: undefined;
//   // DCoinScreen: { phoneNumber: string };
//   ReferEarn: undefined;
//   // ShareAppScreen: { phoneNumber: string };
//   AboutUsScreen: undefined;
//   PromotionScreen: { phoneNumber: string };
//   Settings: { phoneNumber: string };
//   HelpSupportScreen: undefined;
//   myprofilescreen: { phoneNumber: string };
//   FeedbackScreen: { phoneNumber: string };
// };

// import { NativeStackScreenProps } from "@react-navigation/native-stack";

// type Props = NativeStackScreenProps<RootStackParamList, "myprofilescreen">;
// type ScreensWithPhone =
//   | "MyVehicleScreen"
//   | "SavedAddressScreen"
//   | "DocumentVerificationScreen"
//   // | "AdminDocumentApprovalScreen"
//   | "MatchingPreferenceScreen"
//   | "EmergencyContactsscreen"
//   // | "DCoinScreen"
//   // | "ShareAppScreen"
//   | "PromotionScreen"
//   | "Settings"
//   | "FeedbackScreen";

// type ScreensWithoutPhone =
//   | "PaymentScreen"
//   | "ReferEarn"
//   | "AboutUsScreen"
//   | "HelpSupportScreen";

// export default function ProfileScreen({ navigation, route }: Props) {
//   const { user, isAuthenticated, isGuest, logout: authLogout, loading: authLoading } = useAuth();
  
//   // Add loading state for profile data
//   const [isLoading, setIsLoading] = useState(true);
  
//   // Custom Alert states
//   const [alertVisible, setAlertVisible] = useState(false);
//   const [alertConfig, setAlertConfig] = useState({
//     title: "",
//     message: "",
//     icon: "check-circle",
//     iconColor: "#10B981",
//     buttons: []
//   });

//   const showCustomAlert = (title, message, type = 'success', buttons = null) => {
//     let icon = "check-circle";
//     let iconColor = "#10B981";
    
//     if (type === 'error') {
//       icon = "error";
//       iconColor = "#EF4444";
//     } else if (type === 'warning') {
//       icon = "warning";
//       iconColor = "#F59E0B";
//     } else if (type === 'info') {
//       icon = "info";
//       iconColor = Colors.primary;
//     }
    
//     setAlertConfig({
//       title,
//       message,
//       icon,
//       iconColor,
//       buttons: buttons || [{ text: 'OK', onPress: () => setAlertVisible(false) }]
//     });
//     setAlertVisible(true);
//   };
  
//   /* ✅ Get phone from route or AuthContext */
//   const phoneFromRoute = route?.params?.phoneNumber || null;
//   const phoneFromAuth = user?.phoneNumber || user?.phone || null;
//   const userFromAuth = user?.userName || user?.name || "User";
//   const phoneFromRouteOrAuth = phoneFromRoute || phoneFromAuth;
//   const [userName, setUserName] = useState("");
//   const [phoneNumber, setPhoneNumber] = useState("");

//   const scrollViewRef = useRef(null);
//   const [showScrollTop, setShowScrollTop] = useState(false);
//   const [profileImage, setProfileImage] = useState<string | null>(null);
//   const [isAvatar, setIsAvatar] = useState(false);

//   useEffect(() => {
//     if (isGuest) {
//       showCustomAlert(
//         'Login Required',
//         'Please complete login/profile to access all features.',
//         'warning',
//         [
//           { text: 'Cancel', onPress: () => {
//               setAlertVisible(false);
//               navigation.goBack();
//             } 
//           },
//           { text: 'Login', onPress: () => {
//               setAlertVisible(false);
//               navigation.navigate('Login');
//             } 
//           }
//         ]
//       );
//       return;
//     }
//   }, [isGuest, navigation]);

//   const loadProfile = async () => {
//     try {
//       setIsLoading(true);
//       const phoneToUse = phoneFromRouteOrAuth;
//       if (!phoneToUse) {
//         setIsLoading(false);
//         return;
//       }

//       const res = await DatabaseService.getUserProfile(phoneToUse);

//       if (res?.success && res.user) {
//         const u = res.user;
//         console.log("Profile updated locally:", { profile_picture: u.profile_picture, full_name: u.full_name });
//         console.log("🔥 USER DATA:", u);

//         // ✅ SET NAME
//         setUserName(
//           u.full_name ||
//           `${u.first_name || ""} ${u.last_name || ""}`.trim() ||
//           "User"
//         );

//         // ✅ SET PHONE
//         setPhoneNumber(u.phone_number || "");

//         // ✅ SET IMAGE
//         const imageUrl = u.profile_picture;
//         setProfileImage(null);
//         setTimeout(() => {
//           setProfileImage(imageUrl || null);
//         }, 50);
//       }
//     } catch (err) {
//       console.log("Profile fetch error:", err);
//       showCustomAlert('Error', 'Failed to load profile data', 'error');
//     } finally {
//       setIsLoading(false);
//     }
//   };

//   useFocusEffect(
//     useCallback(() => {
//       loadProfile(); // 🔥 runs when coming back from edit screen
//     }, [phoneFromRouteOrAuth])
//   );

//   const infoItems: {
//     title: string;
//     icon: keyof typeof Ionicons.glyphMap;
//     screen: keyof RootStackParamList;
//   }[] = [
//     { title: "My Vehicle", icon: "car-outline", screen: "MyVehicleScreen" },
//     { title: "Saved Address", icon: "location-outline", screen: "SavedAddressScreen" },
//     { title: "My Documents", icon: "document-text-outline", screen: "DocumentVerificationScreen" },
//     // { title:"Admin Documents", icon:"folder-open-outline", screen:"AdminDocumentApprovalScreen"},

//     { title: "Matching Preferences", icon: "settings-outline", screen: "MatchingPreferenceScreen" },
//     { title: "Emergency Contact", icon: "alert-circle-outline", screen: "EmergencyContactsscreen" },
//   ];

//   // const paymentItems: {
//   //   title: string;
//   //   icon: keyof typeof Ionicons.glyphMap;
//   //   screen: keyof RootStackParamList;
//   // }[] = [
//   //   { title: "D-coins", icon: "diamond-outline", screen: "DCoinScreen" },
//   // ];

//   const otherItems: {
//     title: string;
//     icon: keyof typeof Ionicons.glyphMap;
//     screen?: keyof RootStackParamList;
//     action?: string;
//   }[] = [
//     // { title: "Refer & Earn", icon: "person-add-outline", screen: "ShareAppScreen" },
//     { title: "Share App", icon: "share-social-outline", action: "shareApp" },

//     { title: "About Us", icon: "information-circle-outline", screen: "AboutUsScreen" },
//     { title: "Promotions & Offers", icon: "pricetags-outline", screen: "PromotionScreen" },
//     { title: "Settings", icon: "cog-outline", screen: "Settings" },
//     { title: "Help & Support", icon: "help-circle-outline", screen: "HelpSupportScreen" },
//     { title: "Feedback", icon: "chatbubbles-outline", screen: "FeedbackScreen" },
//   ];
//   const handleShareApp = async () => {
//   try {
//     await Share.share({
//       message:
//         "Download Drivve App now 🚗\n\nhttps://play.google.com/store/apps/details?id=com.yourapp.package",
//     });
//   } catch (error) {
//     console.log("Share error:", error);
//   }
// };
//   const handleScroll = (event: any) => {
//     const scrollY = event.nativeEvent.contentOffset.y;
//     setShowScrollTop(scrollY > 200);
//   };
  
//   const scrollToTop = () => {
//     scrollViewRef.current?.scrollTo({ y: 0, animated: true });
//   };

//   const handleMenuItemPress = (screen: keyof RootStackParamList) => {
//     if (screen === "AboutUsScreen") {
//       Linking.openURL("https://drivve.netlify.app/about");
//       return;
//     }
//     const screensWithPhone: ScreensWithPhone[] = [
//       "MyVehicleScreen",
//       "SavedAddressScreen",
//       "DocumentVerificationScreen",
//       //  "AdminDocumentApprovalScreen",
//       "MatchingPreferenceScreen",
//       "EmergencyContactsscreen",
//       // "DCoinScreen",
//       // "ShareAppScreen",
//       "PromotionScreen",
//       "Settings",
//       "FeedbackScreen",
//     ];

//     if (screensWithPhone.includes(screen as ScreensWithPhone)) {
//       navigation.navigate(screen as ScreensWithPhone, { phoneNumber });
//     } else {
//       navigation.navigate(screen as ScreensWithoutPhone);
//     }
//   };

//   const handleBack = () => {
//     navigation.goBack();
//   };

//   const handleEditProfile = () => {
//     navigation.navigate("myprofilescreen", {
//       phoneNumber: phoneNumber,
//     });
//   };

//   const handleLogout = () => {
//     // Show custom alert instead of default Alert
//     showCustomAlert(
//       'Logout',
//       'Are you sure you want to logout?',
//       'warning',
//       [
//         { 
//           text: 'Cancel', 
//           onPress: () => setAlertVisible(false),
//           style: 'cancel'
//         },
//         { 
//           text: 'Logout', 
//           onPress: async () => {
//             setAlertVisible(false);
//             // Show loading indicator before logout
//             setIsLoading(true);
//             try {
//               await authLogout();
//               // Navigate to login screen
//               navigation.reset({
//                 index: 0,
//                 routes: [{ name: 'Login' }],
//               });
//             } catch (error) {
//               console.log('Logout error:', error);
//               showCustomAlert('Error', 'Failed to logout. Please try again.', 'error');
//             } finally {
//               setIsLoading(false);
//             }
//           },
//           style: 'destructive'
//         }
//       ]
//     );
//   };

//   // Show loader while fetching profile data
//   if (isLoading) {
//     return (
//       <SafeAreaView style={styles.container}>
//         <StatusBar backgroundColor={Colors.white} barStyle="dark-content" />
//         <View style={styles.loaderContainer}>
//           <LottieView
//             source={require("../assets/loading.json")}
//             autoPlay
//             loop
//             style={{ width: 300, height: 300 }}
//           />
//         </View>
//       </SafeAreaView>
//     );
//   }

//   return (
//     <SafeAreaView style={styles.container}>
//       <StatusBar backgroundColor={Colors.white} barStyle="dark-content" />
//       <KeyboardAvoidingView
//         style={styles.keyboardAvoidingView}
//         behavior={Platform.OS === 'ios' ? 'padding' : 'padding'}
//       >
//         {/* Header */}
//         <View style={styles.header}>
//           <TouchableOpacity style={styles.modernBackButton} onPress={handleBack}>
//             <MaterialIcons name="arrow-back-ios" size={28} color={Colors.secondary} />
//           </TouchableOpacity>
//           <Text style={styles.headerTitle}>Profile</Text>
//           <View style={styles.headerSpacer} />
//         </View>

//         <ScrollView
//           ref={scrollViewRef}
//           showsVerticalScrollIndicator={false}
//           style={styles.scrollView}
//           onScroll={handleScroll}
//           scrollEventThrottle={16}
//           contentContainerStyle={styles.scrollContent}
//         >
//           {/* === Profile Card === */}
//           <View style={styles.profileCard}>
//             <LinearGradient
//               colors={[Colors.primary, '#0D3A6F']}
//               start={{ x: 0, y: 0 }}
//               end={{ x: 1, y: 1 }}
//               style={styles.profileGradient}
//             />

//             <View style={styles.profileImageContainer}>
//               <TouchableOpacity
//                 style={styles.profileImageWrapper}
//                 onPress={handleEditProfile}
//                 activeOpacity={0.8}
//               >
//               {profileImage && (
//   <LinearGradient
//     colors={[Colors.white, '#F3F4F6']}
//     start={{ x: 0, y: 0 }}
//     end={{ x: 1, y: 1 }}
//     style={styles.profileImageCircle}
//   >
//     {profileImage.endsWith(".svg") ? (
//       <SvgCssUri
//         uri={profileImage}
//         width={100}
//         height={100}
//       />
//     ) : (
//       <Image
//         source={{ uri: profileImage }}
//         style={styles.profileImage}
//       />
//     )}
//   </LinearGradient>
// )}

//                 <View style={styles.editIconContainer}>
//                   <MaterialCommunityIcons
//                     name="account-box-edit-outline"
//                     size={18}
//                     color={Colors.primary}
//                   />
//                 </View>
//               </TouchableOpacity>
//             </View>

//             <Text style={styles.profileName}>
//               {userName}
//             </Text>

//             <Text style={styles.profileNumber}>
//               {phoneNumber}
//             </Text>

//             {/* Rating */}
//             <View style={styles.ratingContainer}>
//               <Ionicons name="star" size={20} color="#FFD700" />
//               <Text style={styles.ratingValue}>0.0</Text>
//             </View>

//             {/* Stats */}
//             <View style={styles.statsContainer}>
//               <View style={styles.statItem}>
//                 <Text style={styles.statNumber}>0</Text>
//                 <Text style={styles.statLabel}>Total Rides</Text>
//               </View>

//               <View style={styles.statDivider} />

//               <View style={styles.statItem}>
//                 <Text style={styles.statNumber}>0</Text>
//                 <Text style={styles.statLabel}>Total Drives</Text>
//               </View>

//               <View style={styles.statDivider} />

//               <View style={styles.statItem}>
//                 <Text style={styles.statNumber}>0kg</Text>
//                 <Text style={styles.statLabel}>CO₂ Reduced</Text>
//               </View>
//             </View>

//             <Animatable.View
//               animation="fadeIn"
//               duration={600}
//               style={styles.bgContainer}
//             >
//               <ImageBackground
//                 source={require("../assets/s8.png")}
//                 style={styles.bgImage}
//                 resizeMode="contain"
//                 imageStyle={styles.bgImageStyle}
//               />
//             </Animatable.View>
//           </View>

//           {/* === Sections === */}
//           <View style={styles.sectionsContainer}>
//             {[
//               ["My Information", infoItems],
//               // ["Payment Information", paymentItems],
//               ["Other Information", otherItems]
//             ].map(([title, items]: any, i) => (
//               <View style={styles.section} key={i}>
//                 <Text style={styles.sectionTitle}>{title}</Text>
//                 <View style={styles.menuCard}>
//                   {items.map((item: any, index: number) => (
//                     <TouchableOpacity
//                       key={index}
//                       style={styles.menuItem}
// onPress={() => {
//   if (item.action === "shareApp") {
//     handleShareApp();
//   } else if (item.screen) {
//     handleMenuItemPress(item.screen);
//   }
// }}
//                     >
//                       <View style={styles.menuItemLeft}>
//                         <View style={styles.iconContainer}>
//                           <Ionicons name={item.icon} size={22} color={Colors.primary} />
//                         </View>
//                         <Text style={styles.menuItemText}>{item.title}</Text>
//                       </View>
//                       <Ionicons name="chevron-forward" size={28} color={Colors.primary} />
//                     </TouchableOpacity>
//                   ))}
//                 </View>
//               </View>
//             ))}

//             <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
//               <LinearGradient
//                 colors={[Colors.primary, '#0D3A6F']}
//                 start={{ x: 0, y: 0 }}
//                 end={{ x: 1, y: 0 }}
//                 style={styles.logoutGradient}
//               >
//                 <Ionicons name="log-out-outline" size={22} color="white" />
//                 <Text style={styles.logoutText}>Log out</Text>
//               </LinearGradient>
//             </TouchableOpacity>

//             <View style={styles.footer}>
//               <View style={styles.logoContainer}>
//                 <Image
//                   source={require("../assets/logogray.png")}
//                   style={styles.logoImage}
//                 />
//               </View>
//               <Text style={styles.versionText}>Version 1.0.0</Text>
//               <Text style={styles.copyrightText}>
//                 © 2026 Drivve. All rights reserved.
//               </Text>
//             </View>
//           </View>
//         </ScrollView>

//         {/* Scroll to Top Button
//         {showScrollTop && (
//           <TouchableOpacity style={styles.scrollTopButton} onPress={scrollToTop}>
//             <Ionicons name="chevron-up" size={24} color={Colors.white} />
//           </TouchableOpacity>
//         )} */}
//       </KeyboardAvoidingView>

//       {/* Custom Alert Component */}
//       <CustomAlert
//         visible={alertVisible}
//         title={alertConfig.title}
//         message={alertConfig.message}
//         icon={alertConfig.icon}
//         iconColor={alertConfig.iconColor}
//         buttons={alertConfig.buttons}
//         onBackdropPress={() => setAlertVisible(false)}
//       />
//     </SafeAreaView>
//   );
// }

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     backgroundColor: Colors.white,
//   },
//   keyboardAvoidingView: {
//     flex: 1,
//   },
//   loaderContainer: {
//     flex: 1,
//     justifyContent: "center",
//     alignItems: "center",
//     backgroundColor: Colors.white,
//   },
//   headerContainer: {
//     paddingTop: 30,
//   },
//   header: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     paddingHorizontal: 16,
//     paddingVertical: 12,
//     borderBottomWidth: 0.5,
//     borderBottomColor: '#F3F4F6',
//   },
//   modernBackButton: {
//     width: 44,
//     height: 44,
//     borderRadius: 22,
//     justifyContent: 'center',
//     alignItems: 'center',
//   },
//   headerTitle: {
//     ...Typography.h2,
//     fontSize: 28,
//     fontWeight: '700',
//     color: Colors.primary,
//     flex: 1,
//     textAlign: 'center',
//   },
//   headerSpacer: {
//     width: 44,
//   },
//   scrollView: {
//     flex: 1,
//   },
//   scrollContent: {
//     flexGrow: 1,
//   },
//   profileCard: {
//     marginHorizontal: 20,
//     marginTop: 20,
//     borderRadius: 25,
//     padding: width < 375 ? 20 : 25,
//     backgroundColor: Colors.primary,
//     borderWidth: 0,
//     shadowColor: Colors.primary,
//     shadowOffset: { width: 0, height: 10 },
//     shadowOpacity: 0.3,
//     shadowRadius: 20,
//     elevation: 12,
//     alignItems: "center",
//     position: "relative",
//     overflow: "hidden",
//     minHeight: width < 375 ? 320 : 350,
//   },
//   profileGradient: {
//     ...StyleSheet.absoluteFillObject,
//     borderRadius: 25,
//   },
//   bgContainer: {
//     position: "absolute",
//     top: 0,
//     bottom: 0,
//     left: 10,
//     right: 10,
//     pointerEvents: "none",
//   },
//   bgImage: {
//     width: "100%",
//     height: "100%",
//     flex: 1,
//   },
//   bgImageStyle: {
//     opacity: 0.08,
//   },
//   profileImageContainer: {
//     marginBottom: width < 375 ? 10 : 15,
//     position: "relative",
//     zIndex: 2,
//   },
//   profileImageWrapper: {
//     width: width < 375 ? 100 : 120,
//     height: width < 375 ? 100 : 120,
//     borderRadius: width < 375 ? 50 : 80,
//     backgroundColor: Colors.white,
//     justifyContent: "center",
//     alignItems: "center",
//     shadowColor: Colors.primary,
//     shadowOffset: { width: 0, height: 8 },
//     shadowOpacity: 0.3,
//     shadowRadius: 16,
//     elevation: 12,
//     position: "relative",
//   },
//   profileImageCircle: {
//     width: '100%',
//     height: '100%',
//     borderRadius: width < 375 ? 50 : 70,
//     justifyContent: 'center',
//     alignItems: 'center',
//     overflow: 'hidden',
//   },
//   profileImage: {
//     width: width < 375 ? 90 : 110,
//     height: width < 375 ? 90 : 110,
//     borderRadius: width < 375 ? 45 : 55,
//     borderWidth: 0,
//   },
//   editIconContainer: {
//     position: "absolute",
//     bottom: 5,
//     right: 5,
//     backgroundColor: Colors.white,
//     borderRadius: 15,
//     width: width < 375 ? 28 : 30,
//     height: width < 375 ? 28 : 30,
//     justifyContent: "center",
//     alignItems: "center",
//     shadowColor: Colors.primary,
//     shadowOffset: { width: 0, height: 4 },
//     shadowOpacity: 0.3,
//     shadowRadius: 8,
//     elevation: 6,
//     borderWidth: 1.5,
//     borderColor: Colors.primary,
//   },
//   profileName: {
//     fontSize: width < 375 ? 22 : 26,
//     color: Colors.white,
//     fontWeight: "700",
//     fontFamily: "inter",
//     marginBottom: 5,
//     textAlign: 'center',
//   },
//   profileNumber: {
//     color: "rgba(255,255,255,0.9)",
//     fontSize: width < 375 ? 16 : 20,
//     fontWeight: "500",
//     fontFamily: "inter",
//     marginBottom: 10,
//     textAlign: 'center',
//   },
//   ratingContainer: {
//     flexDirection: "row",
//     alignItems: "center",
//     paddingHorizontal: 12,
//     paddingVertical: 6,
//     borderRadius: 15,
//     marginBottom: 20,
//   },
//   ratingValue: {
//     color: Colors.white,
//     fontSize: width < 375 ? 18 : 20,
//     fontWeight: "600",
//     marginLeft: 5,
//     fontFamily: "inter",
//   },
//   statsContainer: {
//     flexDirection: "row",
//     borderRadius: 20,
//     padding: width < 375 ? 12 : 15,
//     width: "100%",
//     justifyContent: "space-between",
//   },
//   statItem: {
//     alignItems: "center",
//     flex: 1,
//   },
//   statNumber: {
//     color: Colors.white,
//     fontSize: width < 375 ? 18 : 20,
//     fontWeight: "700",
//     fontFamily: "inter",
//     marginBottom: 4,
//   },
//   statLabel: {
//     color: "rgba(255,255,255,0.9)",
//     fontSize: width < 375 ? 14 : 16,
//     fontWeight: "500",
//     fontFamily: "inter",
//     textAlign: "center",
//   },
//   statDivider: {
//     width: 1,
//     backgroundColor: "rgba(255,255,255,0.3)",
//     marginHorizontal: 5,
//   },
//   sectionsContainer: {
//     paddingHorizontal: width < 375 ? 16 : 20,
//     paddingTop: 25,
//     paddingBottom: 30,
//   },
//   section: {
//     marginBottom: 25,
//   },
//   sectionTitle: {
//     fontSize: width < 375 ? 20 : 24,
//     color: Colors.primary,
//     fontWeight: "700",
//     marginBottom: 20,
//     fontFamily: "inter",
//     paddingLeft: 5,
//   },
//   menuCard: {
//     backgroundColor: Colors.white,
//     borderRadius: 16,
//     borderWidth: 1.5,
//     borderColor: '#E5E7EB',
//     shadowColor: Colors.primary,
//     shadowOffset: { width: 0, height: 4 },
//     shadowOpacity: 0.1,
//     shadowRadius: 8,
//     elevation: 5,
//     overflow: "hidden",
//   },
//   menuItem: {
//     flexDirection: "row",
//     alignItems: "center",
//     justifyContent: "space-between",
//     paddingVertical: width < 375 ? 14 : 16,
//     paddingHorizontal: width < 375 ? 16 : 20,
//     borderBottomWidth: 1.5,
//     borderBottomColor: '#F3F4F6',
//   },
//   menuItemLeft: {
//     flexDirection: "row",
//     alignItems: "center",
//     flex: 1,
//   },
//   iconContainer: {
//     width: width < 375 ? 40 : 44,
//     height: width < 375 ? 40 : 44,
//     borderRadius: 12,
//     backgroundColor: '#E0E7FF',
//     justifyContent: "center",
//     alignItems: "center",
//     marginRight: width < 375 ? 12 : 15,
//   },
//   menuItemText: {
//     fontSize: width < 375 ? 16 : 18,
//     color: Colors.dark,
//     fontWeight: "600",
//     fontFamily: "inter",
//   },
//   logoutButton: {
//     borderRadius: 16,
//     overflow: 'hidden',
//     marginTop: 20,
//     shadowColor: Colors.primary,
//     shadowOffset: { width: 0, height: 8 },
//     shadowOpacity: 0.3,
//     shadowRadius: 16,
//     elevation: 8,
//   },
//   logoutGradient: {
//     paddingVertical: width < 375 ? 14 : 16,
//     alignItems: 'center',
//     justifyContent: 'center',
//     flexDirection: 'row',
//     gap: 8,
//   },
//   logoutText: {
//     color: Colors.white,
//     fontSize: width < 375 ? 16 : 18,
//     fontWeight: "700",
//     marginLeft: 8,
//     fontFamily: "inter",
//   },
//   footer: {
//     alignItems: 'center',
//     marginTop: 30,
//     paddingVertical: 0,
//   },
//   logoContainer: {
//     alignItems: 'center',
//     justifyContent: 'center',
//     flexDirection: 'row',
//   },
//   logoImage: {
//     width: width < 375 ? 70 : 80,
//     height: width < 375 ? 70 : 80,
//     resizeMode: 'contain',
//     marginBottom: -10,
//   },
//   versionText: {
//     fontSize: width < 375 ? 12 : 14,
//     color: '#6B7280',
//     marginBottom: 5,
//     fontFamily: 'inter',
//     fontWeight: '500',
//   },
//   copyrightText: {
//     fontSize: width < 375 ? 10 : 12,
//     color: '#9CA3AF',
//     textAlign: 'center',
//     fontFamily: 'inter',
//     fontWeight: '500',
//   },
//   scrollTopButton: {
//     position: 'absolute',
//     bottom: 30,
//     right: 20,
//     width: 50,
//     height: 50,
//     borderRadius: 25,
//     backgroundColor: Colors.primary,
//     justifyContent: 'center',
//     alignItems: 'center',
//     shadowColor: Colors.primary,
//     shadowOffset: {
//       width: 0,
//       height: 4,
//     },
//     shadowOpacity: 0.3,
//     shadowRadius: 8,
//     elevation: 8,
//   },
// });
// import { Ionicons } from "@expo/vector-icons";
// import { LinearGradient } from "expo-linear-gradient";
// import { useRef, useState, useEffect } from "react";
// import {
//   Image,
//   ScrollView,
//   StatusBar,
//   StyleSheet,
//   Text,
//   TouchableOpacity,
//   View,
//   KeyboardAvoidingView,
//   Platform,
//   Dimensions,
//   ActivityIndicator
// } from "react-native";
// import DatabaseService from "../services/myprofile_ds";
// import { MaterialCommunityIcons } from "@expo/vector-icons";
// import * as Animatable from "react-native-animatable";
// import { ImageBackground } from "react-native";
// import { Colors, Typography } from '../constants/Colors';
// import { MaterialIcons } from '@expo/vector-icons';
// import React, { useCallback } from "react";
// import { useFocusEffect } from "@react-navigation/native";
// import AsyncStorage from "@react-native-async-storage/async-storage";
// import { CommonActions } from "@react-navigation/native";
// import { Alert } from "react-native";
// import { SafeAreaView } from 'react-native-safe-area-context';
// import { useAuth } from "../context/AuthContext";
// import { SvgCssUri } from 'react-native-svg/css';
// import LottieView from "lottie-react-native";
// import CustomAlert from '../components/CustomAlert';
// import { Linking, Share } from "react-native";
// import { API_BASE_URL } from "../config/config_ip";

// const { width, height } = Dimensions.get('window');

// type RootStackParamList = {
//   MyVehicleScreen: { phoneNumber: string };
//   SavedAddressScreen: { phoneNumber: string };
//   DocumentVerificationScreen: { phoneNumber: string };
//   MatchingPreferenceScreen: { phoneNumber: string };
//   EmergencyContactsscreen: { phoneNumber: string };
//   PaymentScreen: undefined;
//   ReferEarn: undefined;
//   AboutUsScreen: undefined;
//   PromotionScreen: { phoneNumber: string };
//   Settings: { phoneNumber: string };
//   HelpSupportScreen: undefined;
//   myprofilescreen: { phoneNumber: string };
//   FeedbackScreen: { phoneNumber: string };
// };

// import { NativeStackScreenProps } from "@react-navigation/native-stack";

// type Props = NativeStackScreenProps<RootStackParamList, "myprofilescreen">;
// type ScreensWithPhone =
//   | "MyVehicleScreen"
//   | "SavedAddressScreen"
//   | "DocumentVerificationScreen"
//   | "MatchingPreferenceScreen"
//   | "EmergencyContactsscreen"
//   | "PromotionScreen"
//   | "Settings"
//   | "FeedbackScreen";

// type ScreensWithoutPhone =
//   | "PaymentScreen"
//   | "ReferEarn"
//   | "AboutUsScreen"
//   | "HelpSupportScreen";

// export default function ProfileScreen({ navigation, route }: Props) {
//   const { user, isAuthenticated, isGuest, logout: authLogout, loading: authLoading } = useAuth();
  
//   // Add loading state for profile data
//   const [isLoading, setIsLoading] = useState(true);
  
//   // Stats states
//   const [totalCompletedRidesAsPassenger, setTotalCompletedRidesAsPassenger] = useState(0);
//   const [totalCompletedRidesAsDriver, setTotalCompletedRidesAsDriver] = useState(0);
  
//   // Rating state
//   const [userRating, setUserRating] = useState(0);
//   const [totalRatings, setTotalRatings] = useState(0);
  
//   // Custom Alert states
//   const [alertVisible, setAlertVisible] = useState(false);
//   const [alertConfig, setAlertConfig] = useState({
//     title: "",
//     message: "",
//     icon: "check-circle",
//     iconColor: "#10B981",
//     buttons: []
//   });

//   const showCustomAlert = (title, message, type = 'success', buttons = null) => {
//     let icon = "check-circle";
//     let iconColor = "#10B981";
    
//     if (type === 'error') {
//       icon = "error";
//       iconColor = "#EF4444";
//     } else if (type === 'warning') {
//       icon = "warning";
//       iconColor = "#F59E0B";
//     } else if (type === 'info') {
//       icon = "info";
//       iconColor = Colors.primary;
//     }
    
//     setAlertConfig({
//       title,
//       message,
//       icon,
//       iconColor,
//       buttons: buttons || [{ text: 'OK', onPress: () => setAlertVisible(false) }]
//     });
//     setAlertVisible(true);
//   };
  
//   /* ✅ Get phone from route or AuthContext */
//   const phoneFromRoute = route?.params?.phoneNumber || null;
//   const phoneFromAuth = user?.phoneNumber || user?.phone || null;
//   const userFromAuth = user?.userName || user?.name || "User";
//   const phoneFromRouteOrAuth = phoneFromRoute || phoneFromAuth;
//   const [userName, setUserName] = useState("");
//   const [phoneNumber, setPhoneNumber] = useState("");

//   const scrollViewRef = useRef(null);
//   const [showScrollTop, setShowScrollTop] = useState(false);
//   const [profileImage, setProfileImage] = useState<string | null>(null);
//   const [isAvatar, setIsAvatar] = useState(false);

//   // Fetch user rating
//   const fetchUserRating = async () => {
//     try {
//       const phoneToUse = phoneFromRouteOrAuth;
//       if (!phoneToUse) return;

//       const ratingUrl = `${API_BASE_URL}/api/v1/users/${encodeURIComponent(phoneToUse)}/rating`;
//       const ratingRes = await fetch(ratingUrl);
//       const ratingData = await ratingRes.json();
      
//       if (ratingData.success) {
//         setUserRating(ratingData.average_rating || 0);
//         setTotalRatings(ratingData.total_ratings || 0);
//       }
//     } catch (err) {
//       console.log("Rating fetch error:", err);
//     }
//   };

//   // Fetch user stats (completed rides as passenger and driver)
//   const fetchUserStats = async () => {
//     try {
//       const phoneToUse = phoneFromRouteOrAuth;
//       if (!phoneToUse) return;

//       // Fetch completed rides as passenger
//       const passengerStatsUrl = `${API_BASE_URL}/api/v1/users/${encodeURIComponent(phoneToUse)}/completed-rides/passenger`;
//       const passengerRes = await fetch(passengerStatsUrl);
//       const passengerData = await passengerRes.json();
      
//       if (passengerData.success) {
//         setTotalCompletedRidesAsPassenger(passengerData.count || 0);
//       }

//       // Fetch completed rides as driver
//       const driverStatsUrl = `${API_BASE_URL}/api/v1/users/${encodeURIComponent(phoneToUse)}/completed-rides/driver`;
//       const driverRes = await fetch(driverStatsUrl);
//       const driverData = await driverRes.json();
      
//       if (driverData.success) {
//         setTotalCompletedRidesAsDriver(driverData.count || 0);
//       }

//     } catch (err) {
//       console.log("Stats fetch error:", err);
//     }
//   };

//   useEffect(() => {
//     if (isGuest) {
//       showCustomAlert(
//         'Login Required',
//         'Please complete login/profile to access all features.',
//         'warning',
//         [
//           { text: 'Cancel', onPress: () => {
//               setAlertVisible(false);
//               navigation.goBack();
//             } 
//           },
//           { text: 'Login', onPress: () => {
//               setAlertVisible(false);
//               navigation.navigate('Login');
//             } 
//           }
//         ]
//       );
//       return;
//     }
//   }, [isGuest, navigation]);

//   const loadProfile = async () => {
//     try {
//       setIsLoading(true);
//       const phoneToUse = phoneFromRouteOrAuth;
//       if (!phoneToUse) {
//         setIsLoading(false);
//         return;
//       }

//       const res = await DatabaseService.getUserProfile(phoneToUse);

//       if (res?.success && res.user) {
//         const u = res.user;
//         console.log("Profile updated locally:", { profile_picture: u.profile_picture, full_name: u.full_name });
//         console.log("🔥 USER DATA:", u);

//         // ✅ SET NAME
//         setUserName(
//           u.full_name ||
//           `${u.first_name || ""} ${u.last_name || ""}`.trim() ||
//           "User"
//         );

//         // ✅ SET PHONE
//         setPhoneNumber(u.phone_number || "");

//         // ✅ SET IMAGE
//         const imageUrl = u.profile_picture;
//         setProfileImage(null);
//         setTimeout(() => {
//           setProfileImage(imageUrl || null);
//         }, 50);
        
//         // ✅ SET RATING from user data if available
//         if (u.avg_rating) {
//           setUserRating(parseFloat(u.avg_rating) || 0);
//         }
//         if (u.total_ratings) {
//           setTotalRatings(u.total_ratings || 0);
//         }
//       }
      
//       // Fetch user stats after profile loads
//       await fetchUserStats();
      
//       // Fetch user rating
//       await fetchUserRating();
      
//     } catch (err) {
//       console.log("Profile fetch error:", err);
//       showCustomAlert('Error', 'Failed to load profile data', 'error');
//     } finally {
//       setIsLoading(false);
//     }
//   };

//   useFocusEffect(
//     useCallback(() => {
//       loadProfile(); // 🔥 runs when coming back from edit screen
//     }, [phoneFromRouteOrAuth])
//   );

//   // Function to render stars based on rating
//   const renderStars = (rating) => {
//     const stars = [];
//     const fullStars = Math.floor(rating);
//     const hasHalfStar = rating % 1 >= 0.5;
    
//     for (let i = 0; i < fullStars; i++) {
//       stars.push(
//         <Ionicons key={`star-${i}`} name="star" size={18} color="#FFD700" />
//       );
//     }
    
//     if (hasHalfStar) {
//       stars.push(
//         <Ionicons key="half-star" name="star-half" size={18} color="#FFD700" />
//       );
//     }
    
//     const emptyStars = 5 - stars.length;
//     for (let i = 0; i < emptyStars; i++) {
//       stars.push(
//         <Ionicons key={`empty-${i}`} name="star-outline" size={18} color="#FFD700" />
//       );
//     }
    
//     return stars;
//   };

//   const infoItems: {
//     title: string;
//     icon: keyof typeof Ionicons.glyphMap;
//     screen: keyof RootStackParamList;
//   }[] = [
//     { title: "My Vehicle", icon: "car-outline", screen: "MyVehicleScreen" },
//     { title: "Saved Address", icon: "location-outline", screen: "SavedAddressScreen" },
//     { title: "My Documents", icon: "document-text-outline", screen: "DocumentVerificationScreen" },
//     { title: "Matching Preferences", icon: "settings-outline", screen: "MatchingPreferenceScreen" },
//     { title: "Emergency Contact", icon: "alert-circle-outline", screen: "EmergencyContactsscreen" },
//   ];

//   const otherItems: {
//     title: string;
//     icon: keyof typeof Ionicons.glyphMap;
//     screen?: keyof RootStackParamList;
//     action?: string;
//   }[] = [
//     { title: "Share App", icon: "share-social-outline", action: "shareApp" },
//     { title: "About Us", icon: "information-circle-outline", screen: "AboutUsScreen" },
//     { title: "Promotions & Offers", icon: "pricetags-outline", screen: "PromotionScreen" },
//     { title: "Settings", icon: "cog-outline", screen: "Settings" },
//     { title: "Help & Support", icon: "help-circle-outline", screen: "HelpSupportScreen" },
//     { title: "Feedback", icon: "chatbubbles-outline", screen: "FeedbackScreen" },
//   ];
  
//   const handleShareApp = async () => {
//     try {
//       await Share.share({
//         message:
//           "Download Drivve App now 🚗\n\nhttps://play.google.com/store/apps/details?id=com.yourapp.package",
//       });
//     } catch (error) {
//       console.log("Share error:", error);
//     }
//   };
  
//   const handleScroll = (event: any) => {
//     const scrollY = event.nativeEvent.contentOffset.y;
//     setShowScrollTop(scrollY > 200);
//   };
  
//   const scrollToTop = () => {
//     scrollViewRef.current?.scrollTo({ y: 0, animated: true });
//   };

//   const handleMenuItemPress = (screen: keyof RootStackParamList) => {
//     if (screen === "AboutUsScreen") {
//       Linking.openURL("https://drivve.netlify.app/about");
//       return;
//     }
//     const screensWithPhone: ScreensWithPhone[] = [
//       "MyVehicleScreen",
//       "SavedAddressScreen",
//       "DocumentVerificationScreen",
//       "MatchingPreferenceScreen",
//       "EmergencyContactsscreen",
//       "PromotionScreen",
//       "Settings",
//       "FeedbackScreen",
//     ];

//     if (screensWithPhone.includes(screen as ScreensWithPhone)) {
//       navigation.navigate(screen as ScreensWithPhone, { phoneNumber });
//     } else {
//       navigation.navigate(screen as ScreensWithoutPhone);
//     }
//   };

//   const handleBack = () => {
//     navigation.goBack();
//   };

//   const handleEditProfile = () => {
//     navigation.navigate("myprofilescreen", {
//       phoneNumber: phoneNumber,
//     });
//   };

//   const handleLogout = () => {
//     showCustomAlert(
//       'Logout',
//       'Are you sure you want to logout?',
//       'warning',
//       [
//         { 
//           text: 'Cancel', 
//           onPress: () => setAlertVisible(false),
//           style: 'cancel'
//         },
//         { 
//           text: 'Logout', 
//           onPress: async () => {
//             setAlertVisible(false);
//             setIsLoading(true);
//             try {
//               await authLogout();
//               navigation.reset({
//                 index: 0,
//                 routes: [{ name: 'Login' }],
//               });
//             } catch (error) {
//               console.log('Logout error:', error);
//               showCustomAlert('Error', 'Failed to logout. Please try again.', 'error');
//             } finally {
//               setIsLoading(false);
//             }
//           },
//           style: 'destructive'
//         }
//       ]
//     );
//   };

//   // Show loader while fetching profile data
//   if (isLoading) {
//     return (
//       <SafeAreaView style={styles.container}>
//         <StatusBar backgroundColor={Colors.white} barStyle="dark-content" />
//         <View style={styles.loaderContainer}>
//           <LottieView
//             source={require("../assets/loading.json")}
//             autoPlay
//             loop
//             style={{ width: 300, height: 300 }}
//           />
//         </View>
//       </SafeAreaView>
//     );
//   }

//   return (
//     <SafeAreaView style={styles.container}>
//       <StatusBar backgroundColor={Colors.white} barStyle="dark-content" />
//       <KeyboardAvoidingView
//         style={styles.keyboardAvoidingView}
//         behavior={Platform.OS === 'ios' ? 'padding' : 'padding'}
//       >
//         {/* Header */}
//         <View style={styles.header}>
//           <TouchableOpacity style={styles.modernBackButton} onPress={handleBack}>
//             <MaterialIcons name="arrow-back-ios" size={28} color={Colors.secondary} />
//           </TouchableOpacity>
//           <Text style={styles.headerTitle}>Profile</Text>
//           <View style={styles.headerSpacer} />
//         </View>

//         <ScrollView
//           ref={scrollViewRef}
//           showsVerticalScrollIndicator={false}
//           style={styles.scrollView}
//           onScroll={handleScroll}
//           scrollEventThrottle={16}
//           contentContainerStyle={styles.scrollContent}
//         >
//           {/* === Profile Card === */}
//           <View style={styles.profileCard}>
//             <LinearGradient
//               colors={[Colors.primary, '#0D3A6F']}
//               start={{ x: 0, y: 0 }}
//               end={{ x: 1, y: 1 }}
//               style={styles.profileGradient}
//             />

//             <View style={styles.profileImageContainer}>
//               <TouchableOpacity
//                 style={styles.profileImageWrapper}
//                 onPress={handleEditProfile}
//                 activeOpacity={0.8}
//               >
//               {profileImage && (
//   <LinearGradient
//     colors={[Colors.white, '#F3F4F6']}
//     start={{ x: 0, y: 0 }}
//     end={{ x: 1, y: 1 }}
//     style={styles.profileImageCircle}
//   >
//     {profileImage.endsWith(".svg") ? (
//       <SvgCssUri
//         uri={profileImage}
//         width={100}
//         height={100}
//       />
//     ) : (
//       <Image
//         source={{ uri: profileImage }}
//         style={styles.profileImage}
//       />
//     )}
//   </LinearGradient>
// )}

//                 <View style={styles.editIconContainer}>
//                   <MaterialCommunityIcons
//                     name="account-box-edit-outline"
//                     size={18}
//                     color={Colors.primary}
//                   />
//                 </View>
//               </TouchableOpacity>
//             </View>

//             <Text style={styles.profileName}>
//               {userName}
//             </Text>

//             <Text style={styles.profileNumber}>
//               {phoneNumber}
//             </Text>

//             {/* Rating Section */}
//             <View style={styles.ratingSection}>
//               <View style={styles.ratingStars}>
//                 {renderStars(userRating)}
//               </View>
//               <View style={styles.ratingInfo}>
//                 <Text style={styles.ratingValue}>{userRating.toFixed(1)}</Text>
//                 <Text style={styles.ratingCount}>({totalRatings} {totalRatings === 1 ? 'rating' : 'ratings'})</Text>
//               </View>
//             </View>

//             {/* Stats - Updated to show completed rides as passenger and driver */}
//             <View style={styles.statsContainer}>
//               <View style={styles.statItem}>
//                 <Text style={styles.statNumber}>{totalCompletedRidesAsPassenger}</Text>
//                 <Text style={styles.statLabel}>Rides</Text>
//               </View>

//               <View style={styles.statDivider} />

//               <View style={styles.statItem}>
//                 <Text style={styles.statNumber}>{totalCompletedRidesAsDriver}</Text>
//                 <Text style={styles.statLabel}>Drives</Text>
//               </View>
//             </View>

//             <Animatable.View
//               animation="fadeIn"
//               duration={600}
//               style={styles.bgContainer}
//             >
//               <ImageBackground
//                 source={require("../assets/s8.png")}
//                 style={styles.bgImage}
//                 resizeMode="contain"
//                 imageStyle={styles.bgImageStyle}
//               />
//             </Animatable.View>
//           </View>

//           {/* === Sections === */}
//           <View style={styles.sectionsContainer}>
//             {[
//               ["My Information", infoItems],
//               ["Other Information", otherItems]
//             ].map(([title, items]: any, i) => (
//               <View style={styles.section} key={i}>
//                 <Text style={styles.sectionTitle}>{title}</Text>
//                 <View style={styles.menuCard}>
//                   {items.map((item: any, index: number) => (
//                     <TouchableOpacity
//                       key={index}
//                       style={styles.menuItem}
// onPress={() => {
//   if (item.action === "shareApp") {
//     handleShareApp();
//   } else if (item.screen) {
//     handleMenuItemPress(item.screen);
//   }
// }}
//                     >
//                       <View style={styles.menuItemLeft}>
//                         <View style={styles.iconContainer}>
//                           <Ionicons name={item.icon} size={22} color={Colors.primary} />
//                         </View>
//                         <Text style={styles.menuItemText}>{item.title}</Text>
//                       </View>
//                       <Ionicons name="chevron-forward" size={28} color={Colors.primary} />
//                     </TouchableOpacity>
//                   ))}
//                 </View>
//               </View>
//             ))}

//             <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
//               <LinearGradient
//                 colors={[Colors.primary, '#0D3A6F']}
//                 start={{ x: 0, y: 0 }}
//                 end={{ x: 1, y: 0 }}
//                 style={styles.logoutGradient}
//               >
//                 <Ionicons name="log-out-outline" size={22} color="white" />
//                 <Text style={styles.logoutText}>Log out</Text>
//               </LinearGradient>
//             </TouchableOpacity>

//             <View style={styles.footer}>
//               <View style={styles.logoContainer}>
//                 <Image
//                   source={require("../assets/logogray.png")}
//                   style={styles.logoImage}
//                 />
//               </View>
//               <Text style={styles.versionText}>Version 1.0.0</Text>
//               <Text style={styles.copyrightText}>
//                 © 2026 Drivve. All rights reserved.
//               </Text>
//             </View>
//           </View>
//         </ScrollView>
//       </KeyboardAvoidingView>

//       {/* Custom Alert Component */}
//       <CustomAlert
//         visible={alertVisible}
//         title={alertConfig.title}
//         message={alertConfig.message}
//         icon={alertConfig.icon}
//         iconColor={alertConfig.iconColor}
//         buttons={alertConfig.buttons}
//         onBackdropPress={() => setAlertVisible(false)}
//       />
//     </SafeAreaView>
//   );
// }

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     backgroundColor: Colors.white,
//   },
//   keyboardAvoidingView: {
//     flex: 1,
//   },
//   loaderContainer: {
//     flex: 1,
//     justifyContent: "center",
//     alignItems: "center",
//     backgroundColor: Colors.white,
//   },
//   headerContainer: {
//     paddingTop: 30,
//   },
//   header: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     paddingHorizontal: 16,
//     paddingVertical: 12,
//     borderBottomWidth: 0.5,
//     borderBottomColor: '#F3F4F6',
//   },
//   modernBackButton: {
//     width: 44,
//     height: 44,
//     borderRadius: 22,
//     justifyContent: 'center',
//     alignItems: 'center',
//   },
//   headerTitle: {
//     ...Typography.h2,
//     fontSize: 28,
//     fontWeight: '700',
//     color: Colors.primary,
//     flex: 1,
//     textAlign: 'center',
//   },
//   headerSpacer: {
//     width: 44,
//   },
//   scrollView: {
//     flex: 1,
//   },
//   scrollContent: {
//     flexGrow: 1,
//   },
//   profileCard: {
//     marginHorizontal: 20,
//     marginTop: 20,
//     borderRadius: 25,
//     padding: width < 375 ? 20 : 25,
//     backgroundColor: Colors.primary,
//     borderWidth: 0,
//     shadowColor: Colors.primary,
//     shadowOffset: { width: 0, height: 10 },
//     shadowOpacity: 0.3,
//     shadowRadius: 20,
//     elevation: 12,
//     alignItems: "center",
//     position: "relative",
//     overflow: "hidden",
//     minHeight: width < 375 ? 380 : 420,
//   },
//   profileGradient: {
//     ...StyleSheet.absoluteFillObject,
//     borderRadius: 25,
//   },
//   bgContainer: {
//     position: "absolute",
//     top: 0,
//     bottom: 0,
//     left: 10,
//     right: 10,
//     pointerEvents: "none",
//   },
//   bgImage: {
//     width: "100%",
//     height: "100%",
//     flex: 1,
//   },
//   bgImageStyle: {
//     opacity: 0.08,
//   },
//   profileImageContainer: {
//     marginBottom: width < 375 ? 10 : 15,
//     position: "relative",
//     zIndex: 2,
//   },
//   profileImageWrapper: {
//     width: width < 375 ? 100 : 120,
//     height: width < 375 ? 100 : 120,
//     borderRadius: width < 375 ? 50 : 80,
//     backgroundColor: Colors.white,
//     justifyContent: "center",
//     alignItems: "center",
//     shadowColor: Colors.primary,
//     shadowOffset: { width: 0, height: 8 },
//     shadowOpacity: 0.3,
//     shadowRadius: 16,
//     elevation: 12,
//     position: "relative",
//   },
//   profileImageCircle: {
//     width: '100%',
//     height: '100%',
//     borderRadius: width < 375 ? 50 : 70,
//     justifyContent: 'center',
//     alignItems: 'center',
//     overflow: 'hidden',
//   },
//   profileImage: {
//     width: width < 375 ? 90 : 110,
//     height: width < 375 ? 90 : 110,
//     borderRadius: width < 375 ? 45 : 55,
//     borderWidth: 0,
//   },
//   editIconContainer: {
//     position: "absolute",
//     bottom: 5,
//     right: 5,
//     backgroundColor: Colors.white,
//     borderRadius: 15,
//     width: width < 375 ? 28 : 30,
//     height: width < 375 ? 28 : 30,
//     justifyContent: "center",
//     alignItems: "center",
//     shadowColor: Colors.primary,
//     shadowOffset: { width: 0, height: 4 },
//     shadowOpacity: 0.3,
//     shadowRadius: 8,
//     elevation: 6,
//     borderWidth: 1.5,
//     borderColor: Colors.primary,
//   },
//   profileName: {
//     fontSize: width < 375 ? 22 : 26,
//     color: Colors.white,
//     fontWeight: "700",
//     fontFamily: "inter",
//     marginBottom: 5,
//     textAlign: 'center',
//   },
//   profileNumber: {
//     color: "rgba(255,255,255,0.9)",
//     fontSize: width < 375 ? 14 : 16,
//     fontWeight: "500",
//     fontFamily: "inter",
//     marginBottom: 10,
//     textAlign: 'center',
//   },
//   ratingSection: {
//     alignItems: 'center',
//     marginBottom: 15,
//   },
//   ratingStars: {
//     flexDirection: 'row',
//     marginBottom: 5,
//   },
//   ratingInfo: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     justifyContent: 'center',
//     gap: 8,
//   },
//   ratingValue: {
//     color: Colors.white,
//     fontSize: width < 375 ? 16 : 18,
//     fontWeight: "700",
//     fontFamily: "inter",
//   },
//   ratingCount: {
//     color: "rgba(255,255,255,0.8)",
//     fontSize: width < 375 ? 12 : 14,
//     fontWeight: "500",
//     fontFamily: "inter",
//   },
//   statsContainer: {
//     flexDirection: "row",
//     borderRadius: 20,
//     padding: width < 375 ? 12 : 15,
//     width: "100%",
//     justifyContent: "space-between",
//   },
//   statItem: {
//     alignItems: "center",
//     flex: 1,
//   },
//   statNumber: {
//     color: Colors.white,
//     fontSize: width < 375 ? 22 : 26,
//     fontWeight: "700",
//     fontFamily: "inter",
//     marginBottom: 4,
//   },
//   statLabel: {
//     color: "rgba(255,255,255,0.9)",
//     fontSize: width < 375 ? 14 : 16,
//     fontWeight: "600",
//     fontFamily: "inter",
//     textAlign: "center",
//   },
//   statSubLabel: {
//     color: "rgba(255,255,255,0.7)",
//     fontSize: width < 375 ? 10 : 12,
//     fontWeight: "400",
//     fontFamily: "inter",
//     textAlign: "center",
//     marginTop: 2,
//   },
//   statDivider: {
//     width: 1,
//     backgroundColor: "rgba(255,255,255,0.3)",
//     marginHorizontal: 5,
//   },
//   sectionsContainer: {
//     paddingHorizontal: width < 375 ? 16 : 20,
//     paddingTop: 25,
//     paddingBottom: 30,
//   },
//   section: {
//     marginBottom: 25,
//   },
//   sectionTitle: {
//     fontSize: width < 375 ? 20 : 24,
//     color: Colors.primary,
//     fontWeight: "700",
//     marginBottom: 20,
//     fontFamily: "inter",
//     paddingLeft: 5,
//   },
//   menuCard: {
//     backgroundColor: Colors.white,
//     borderRadius: 16,
//     borderWidth: 1.5,
//     borderColor: '#E5E7EB',
//     shadowColor: Colors.primary,
//     shadowOffset: { width: 0, height: 4 },
//     shadowOpacity: 0.1,
//     shadowRadius: 8,
//     elevation: 5,
//     overflow: "hidden",
//   },
//   menuItem: {
//     flexDirection: "row",
//     alignItems: "center",
//     justifyContent: "space-between",
//     paddingVertical: width < 375 ? 14 : 16,
//     paddingHorizontal: width < 375 ? 16 : 20,
//     borderBottomWidth: 1.5,
//     borderBottomColor: '#F3F4F6',
//   },
//   menuItemLeft: {
//     flexDirection: "row",
//     alignItems: "center",
//     flex: 1,
//   },
//   iconContainer: {
//     width: width < 375 ? 40 : 44,
//     height: width < 375 ? 40 : 44,
//     borderRadius: 12,
//     backgroundColor: '#E0E7FF',
//     justifyContent: "center",
//     alignItems: "center",
//     marginRight: width < 375 ? 12 : 15,
//   },
//   menuItemText: {
//     fontSize: width < 375 ? 16 : 18,
//     color: Colors.dark,
//     fontWeight: "600",
//     fontFamily: "inter",
//   },
//   logoutButton: {
//     borderRadius: 16,
//     overflow: 'hidden',
//     marginTop: 20,
//     shadowColor: Colors.primary,
//     shadowOffset: { width: 0, height: 8 },
//     shadowOpacity: 0.3,
//     shadowRadius: 16,
//     elevation: 8,
//   },
//   logoutGradient: {
//     paddingVertical: width < 375 ? 14 : 16,
//     alignItems: 'center',
//     justifyContent: 'center',
//     flexDirection: 'row',
//     gap: 8,
//   },
//   logoutText: {
//     color: Colors.white,
//     fontSize: width < 375 ? 16 : 18,
//     fontWeight: "700",
//     marginLeft: 8,
//     fontFamily: "inter",
//   },
//   footer: {
//     alignItems: 'center',
//     marginTop: 30,
//     paddingVertical: 0,
//   },
//   logoContainer: {
//     alignItems: 'center',
//     justifyContent: 'center',
//     flexDirection: 'row',
//   },
//   logoImage: {
//     width: width < 375 ? 70 : 80,
//     height: width < 375 ? 70 : 80,
//     resizeMode: 'contain',
//     marginBottom: -10,
//   },
//   versionText: {
//     fontSize: width < 375 ? 12 : 14,
//     color: '#6B7280',
//     marginBottom: 5,
//     fontFamily: 'inter',
//     fontWeight: '500',
//   },
//   copyrightText: {
//     fontSize: width < 375 ? 10 : 12,
//     color: '#9CA3AF',
//     textAlign: 'center',
//     fontFamily: 'inter',
//     fontWeight: '500',
//   },
//   scrollTopButton: {
//     position: 'absolute',
//     bottom: 30,
//     right: 20,
//     width: 50,
//     height: 50,
//     borderRadius: 25,
//     backgroundColor: Colors.primary,
//     justifyContent: 'center',
//     alignItems: 'center',
//     shadowColor: Colors.primary,
//     shadowOffset: {
//       width: 0,
//       height: 4,
//     },
//     shadowOpacity: 0.3,
//     shadowRadius: 8,
//     elevation: 8,
//   },
// });
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
  Dimensions,
  ActivityIndicator
} from "react-native";
import DatabaseService from "../services/myprofile_ds";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import * as Animatable from "react-native-animatable";
import { ImageBackground } from "react-native";
import { Colors, Typography } from '../constants/Colors';
import { MaterialIcons } from '@expo/vector-icons';
import React, { useCallback } from "react";
import { useFocusEffect } from "@react-navigation/native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { CommonActions } from "@react-navigation/native";
import { Alert } from "react-native";
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from "../context/AuthContext";
import { SvgCssUri } from 'react-native-svg/css';
import LottieView from "lottie-react-native";
import CustomAlert from '../components/CustomAlert';
import { Linking, Share } from "react-native";
import { API_BASE_URL } from "../config/config_ip";

const { width, height } = Dimensions.get('window');

type RootStackParamList = {
  MyVehicleScreen: { phoneNumber: string };
  SavedAddressScreen: { phoneNumber: string };
  DocumentVerificationScreen: { phoneNumber: string };
  MatchingPreferenceScreen: { phoneNumber: string };
  EmergencyContactsscreen: { phoneNumber: string };
  PaymentScreen: undefined;
  ReferEarn: undefined;
  AboutUsScreen: undefined;
  PromotionScreen: { phoneNumber: string };
  Settings: { phoneNumber: string };
  HelpSupportScreen: undefined;
  myprofilescreen: { phoneNumber: string };
  FeedbackScreen: { phoneNumber: string };
};

import { NativeStackScreenProps } from "@react-navigation/native-stack";

type Props = NativeStackScreenProps<RootStackParamList, "myprofilescreen">;
type ScreensWithPhone =
  | "MyVehicleScreen"
  | "SavedAddressScreen"
  | "DocumentVerificationScreen"
  | "MatchingPreferenceScreen"
  | "EmergencyContactsscreen"
  | "PromotionScreen"
  | "Settings"
  | "FeedbackScreen";

type ScreensWithoutPhone =
  | "PaymentScreen"
  | "ReferEarn"
  | "AboutUsScreen"
  | "HelpSupportScreen";

export default function ProfileScreen({ navigation, route }: Props) {
  const { user, isAuthenticated, isGuest, logout: authLogout, loading: authLoading } = useAuth();
  
  // Add loading state for profile data
  const [isLoading, setIsLoading] = useState(true);
  
  // Stats states
  const [totalCompletedRidesAsPassenger, setTotalCompletedRidesAsPassenger] = useState(0);
  const [totalCompletedRidesAsDriver, setTotalCompletedRidesAsDriver] = useState(0);
  
  // Rating state
  const [userRating, setUserRating] = useState(0);
  const [totalRatings, setTotalRatings] = useState(0);
  
  // Custom Alert states
  const [alertVisible, setAlertVisible] = useState(false);
  const [alertConfig, setAlertConfig] = useState({
    title: "",
    message: "",
    icon: "check-circle",
    iconColor: "#10B981",
    buttons: []
  });

  const showCustomAlert = (title, message, type = 'success', buttons = null) => {
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
      buttons: buttons || [{ text: 'OK', onPress: () => setAlertVisible(false) }]
    });
    setAlertVisible(true);
  };
  
  /* ✅ Get phone from route or AuthContext */
  const phoneFromRoute = route?.params?.phoneNumber || null;
  const phoneFromAuth = user?.phoneNumber || user?.phone || null;
  const userFromAuth = user?.userName || user?.name || "User";
  const phoneFromRouteOrAuth = phoneFromRoute || phoneFromAuth;
  const [userName, setUserName] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");

  const scrollViewRef = useRef(null);
  const [showScrollTop, setShowScrollTop] = useState(false);
  const [profileImage, setProfileImage] = useState<string | null>(null);
  const [isAvatar, setIsAvatar] = useState(false);

  // Fetch user rating
  const fetchUserRating = async () => {
    try {
      const phoneToUse = phoneFromRouteOrAuth;
      if (!phoneToUse) return;

      const ratingUrl = `${API_BASE_URL}/users/${encodeURIComponent(phoneToUse)}/rating`;
      const ratingRes = await fetch(ratingUrl);
      const ratingData = await ratingRes.json();
      
      if (ratingData.success) {
        setUserRating(ratingData.average_rating || 0);
        setTotalRatings(ratingData.total_ratings || 0);
      }
    } catch (err) {
      console.log("Rating fetch error:", err);
    }
  };

  // Fetch user stats (completed rides as passenger and driver)
  const fetchUserStats = async () => {
    try {
      const phoneToUse = phoneFromRouteOrAuth;
      if (!phoneToUse) return;

      // Fetch completed rides as passenger
      const passengerStatsUrl = `${API_BASE_URL}/users/${encodeURIComponent(phoneToUse)}/completed-rides/passenger`;
      const passengerRes = await fetch(passengerStatsUrl);
      const passengerData = await passengerRes.json();
      
      if (passengerData.success) {
        setTotalCompletedRidesAsPassenger(passengerData.count || 0);
      }

      // Fetch completed rides as driver
      const driverStatsUrl = `${API_BASE_URL}/users/${encodeURIComponent(phoneToUse)}/completed-rides/driver`;
      const driverRes = await fetch(driverStatsUrl);
      const driverData = await driverRes.json();
      
      if (driverData.success) {
        setTotalCompletedRidesAsDriver(driverData.count || 0);
      }

    } catch (err) {
      console.log("Stats fetch error:", err);
    }
  };

  useEffect(() => {
    if (isGuest) {
      showCustomAlert(
        'Login Required',
        'Please complete login/profile to access all features.',
        'warning',
        [
          { text: 'Cancel', onPress: () => {
              setAlertVisible(false);
              navigation.goBack();
            } 
          },
          { text: 'Login', onPress: () => {
              setAlertVisible(false);
              navigation.navigate('Login');
            } 
          }
        ]
      );
      return;
    }
  }, [isGuest, navigation]);

  const loadProfile = async () => {
    try {
      setIsLoading(true);
      const phoneToUse = phoneFromRouteOrAuth;
      if (!phoneToUse) {
        setIsLoading(false);
        return;
      }

      const res = await DatabaseService.getUserProfile(phoneToUse);

      if (res?.success && res.user) {
        const u = res.user;
        console.log("Profile updated locally:", { profile_picture: u.profile_picture, full_name: u.full_name });
        console.log("🔥 USER DATA:", u);

        // ✅ SET NAME
        setUserName(
          u.full_name ||
          `${u.first_name || ""} ${u.last_name || ""}`.trim() ||
          "User"
        );

        // ✅ SET PHONE
        setPhoneNumber(u.phone_number || "");

        // ✅ SET IMAGE
        const imageUrl = u.profile_picture;
        setProfileImage(null);
        setTimeout(() => {
          setProfileImage(imageUrl || null);
        }, 50);
        
        // ✅ SET RATING from user data if available
        if (u.avg_rating) {
          setUserRating(parseFloat(u.avg_rating) || 0);
        }
        if (u.total_ratings) {
          setTotalRatings(u.total_ratings || 0);
        }
      }
      
      // Fetch user stats after profile loads
      await fetchUserStats();
      
      // Fetch user rating
      await fetchUserRating();
      
    } catch (err) {
      console.log("Profile fetch error:", err);
      showCustomAlert('Error', 'Failed to load profile data', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      loadProfile(); // 🔥 runs when coming back from edit screen
    }, [phoneFromRouteOrAuth])
  );

  // Function to render stars based on rating
  const renderStars = (rating) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 >= 0.5;
    
    for (let i = 0; i < fullStars; i++) {
      stars.push(
        <Ionicons key={`star-${i}`} name="star" size={18} color="#FFD700" />
      );
    }
    
    if (hasHalfStar) {
      stars.push(
        <Ionicons key="half-star" name="star-half" size={18} color="#FFD700" />
      );
    }
    
    const emptyStars = 5 - stars.length;
    for (let i = 0; i < emptyStars; i++) {
      stars.push(
        <Ionicons key={`empty-${i}`} name="star-outline" size={18} color="#FFD700" />
      );
    }
    
    return stars;
  };

  const infoItems: {
    title: string;
    icon: keyof typeof Ionicons.glyphMap;
    screen: keyof RootStackParamList;
  }[] = [
    { title: "My Vehicle", icon: "car-outline", screen: "MyVehicleScreen" },
    { title: "Saved Address", icon: "location-outline", screen: "SavedAddressScreen" },
    { title: "My Documents", icon: "document-text-outline", screen: "DocumentVerificationScreen" },
    { title: "Matching Preferences", icon: "settings-outline", screen: "MatchingPreferenceScreen" },
    { title: "Emergency Contact", icon: "alert-circle-outline", screen: "EmergencyContactsscreen" },
  ];

  const otherItems: {
    title: string;
    icon: keyof typeof Ionicons.glyphMap;
    screen?: keyof RootStackParamList;
    action?: string;
  }[] = [
    { title: "Share App", icon: "share-social-outline", action: "shareApp" },
    { title: "About Us", icon: "information-circle-outline", screen: "AboutUsScreen" },
    { title: "Promotions & Offers", icon: "pricetags-outline", screen: "PromotionScreen" },
    { title: "Settings", icon: "cog-outline", screen: "Settings" },
    { title: "Help & Support", icon: "help-circle-outline", screen: "HelpSupportScreen" },
    { title: "Feedback", icon: "chatbubbles-outline", screen: "FeedbackScreen" },
  ];
  
  const handleShareApp = async () => {
    try {
      await Share.share({
        message:
          "Download Drivve App now 🚗\n\nhttps://play.google.com/store/apps/details?id=com.yourapp.package",
      });
    } catch (error) {
      console.log("Share error:", error);
    }
  };
  
  const handleScroll = (event: any) => {
    const scrollY = event.nativeEvent.contentOffset.y;
    setShowScrollTop(scrollY > 200);
  };
  
  const scrollToTop = () => {
    scrollViewRef.current?.scrollTo({ y: 0, animated: true });
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
      "PromotionScreen",
      "Settings",
      "FeedbackScreen",
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

  const handleLogout = () => {
    showCustomAlert(
      'Logout',
      'Are you sure you want to logout?',
      'warning',
      [
        { 
          text: 'Cancel', 
          onPress: () => setAlertVisible(false),
          style: 'cancel'
        },
        { 
          text: 'Logout', 
          onPress: async () => {
            setAlertVisible(false);
            setIsLoading(true);
            try {
              await authLogout();
              navigation.reset({
                index: 0,
                routes: [{ name: 'Login' }],
              });
            } catch (error) {
              console.log('Logout error:', error);
              showCustomAlert('Error', 'Failed to logout. Please try again.', 'error');
            } finally {
              setIsLoading(false);
            }
          },
          style: 'destructive'
        }
      ]
    );
  };

  // Show loader while fetching profile data
  if (isLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar backgroundColor={Colors.white} barStyle="dark-content" />
        <View style={styles.loaderContainer}>
          <LottieView
            source={require("../assets/loading.json")}
            autoPlay
            loop
            style={{ width: 300, height: 300 }}
          />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar backgroundColor={Colors.white} barStyle="dark-content" />
      <KeyboardAvoidingView
        style={styles.keyboardAvoidingView}
        behavior={Platform.OS === 'ios' ? 'padding' : 'padding'}
      >
        {/* Header */}
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
          {/* === Profile Card === */}
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
              {profileImage && (
                <LinearGradient
                  colors={[Colors.white, '#F3F4F6']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={styles.profileImageCircle}
                >
                  {profileImage.endsWith(".svg") ? (
                    <SvgCssUri
                      uri={profileImage}
                      width={100}
                      height={100}
                    />
                  ) : (
                    <Image
                      source={{ uri: profileImage }}
                      style={styles.profileImage}
                    />
                  )}
                </LinearGradient>
              )}

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
              {userName}
            </Text>

            <Text style={styles.profileNumber}>
              {phoneNumber}
            </Text>

            {/* Rating Section */}
            <View style={styles.ratingSection}>
              <View style={styles.ratingStars}>
                {renderStars(userRating)}
              </View>
              <View style={styles.ratingInfo}>
                <Text style={styles.ratingValue}>{userRating.toFixed(1)}</Text>
                <Text style={styles.ratingCount}>({totalRatings} {totalRatings === 1 ? 'rating' : 'ratings'})</Text>
              </View>
            </View>

            {/* Stats - Rides and Drives only (no earnings) */}
            <View style={styles.statsContainer}>
              <View style={styles.statItem}>
                <View style={styles.statIconContainer}>
                  <MaterialCommunityIcons name="account-group" size={22} color={Colors.white} />
                </View>
                <Text style={styles.statNumber}>{totalCompletedRidesAsPassenger}</Text>
                <Text style={styles.statLabel}>Rides</Text>
                <Text style={styles.statSubLabel}>As Passenger</Text>
              </View>

              <View style={styles.statDivider} />

              <View style={styles.statItem}>
                <View style={styles.statIconContainer}>
                  <MaterialCommunityIcons name="steering" size={22} color={Colors.white} />
                </View>
                <Text style={styles.statNumber}>{totalCompletedRidesAsDriver}</Text>
                <Text style={styles.statLabel}>Drives</Text>
                <Text style={styles.statSubLabel}>As Driver</Text>
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
            {[
              ["My Information", infoItems],
              ["Other Information", otherItems]
            ].map(([title, items]: any, i) => (
              <View style={styles.section} key={i}>
                <Text style={styles.sectionTitle}>{title}</Text>
                <View style={styles.menuCard}>
                  {items.map((item: any, index: number) => (
                    <TouchableOpacity
                      key={index}
                      style={styles.menuItem}
                      onPress={() => {
                        if (item.action === "shareApp") {
                          handleShareApp();
                        } else if (item.screen) {
                          handleMenuItemPress(item.screen);
                        }
                      }}
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
            ))}

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
                © 2026 Drivve. All rights reserved.
              </Text>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>

      {/* Custom Alert Component */}
      <CustomAlert
        visible={alertVisible}
        title={alertConfig.title}
        message={alertConfig.message}
        icon={alertConfig.icon}
        iconColor={alertConfig.iconColor}
        buttons={alertConfig.buttons}
        onBackdropPress={() => setAlertVisible(false)}
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
  loaderContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: Colors.white,
  },
  headerContainer: {
    paddingTop: 30,
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
    padding: width < 375 ? 20 : 25,
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
    minHeight: width < 375 ? 480 : 520,
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
  },
  bgImage: {
    width: "100%",
    height: "100%",
    flex: 1,
  },
  bgImageStyle: {
    opacity: 0.08,
  },
  profileImageContainer: {
    marginBottom: width < 375 ? 10 : 15,
    position: "relative",
    zIndex: 2,
  },
  profileImageWrapper: {
    width: width < 375 ? 100 : 120,
    height: width < 375 ? 100 : 120,
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
    width: width < 375 ? 90 : 110,
    height: width < 375 ? 90 : 110,
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
    fontSize: width < 375 ? 22 : 26,
    color: Colors.white,
    fontWeight: "700",
    fontFamily: "inter",
    marginBottom: 5,
    textAlign: 'center',
  },
  profileNumber: {
    color: "rgba(255,255,255,0.9)",
    fontSize: width < 375 ? 14 : 16,
    fontWeight: "500",
    fontFamily: "inter",
    marginBottom: 10,
    textAlign: 'center',
  },
  ratingSection: {
    alignItems: 'center',
    marginBottom: 15,
  },
  ratingStars: {
    flexDirection: 'row',
    marginBottom: 5,
  },
  ratingInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  ratingValue: {
    color: Colors.white,
    fontSize: width < 375 ? 16 : 18,
    fontWeight: "700",
    fontFamily: "inter",
  },
  ratingCount: {
    color: "rgba(255,255,255,0.8)",
    fontSize: width < 375 ? 12 : 14,
    fontWeight: "500",
    fontFamily: "inter",
  },
  statsContainer: {
    flexDirection: "row",
    borderRadius: 20,
    padding: width < 375 ? 12 : 15,
    width: "100%",
    justifyContent: "space-between",
    marginTop: 5,
  },
  statItem: {
    alignItems: "center",
    flex: 1,
  },
  statIconContainer: {
    marginBottom: 8,
  },
  statNumber: {
    color: Colors.white,
    fontSize: width < 375 ? 22 : 26,
    fontWeight: "700",
    fontFamily: "inter",
    marginBottom: 4,
  },
  statLabel: {
    color: "rgba(255,255,255,0.9)",
    fontSize: width < 375 ? 14 : 16,
    fontWeight: "600",
    fontFamily: "inter",
    textAlign: "center",
  },
  statSubLabel: {
    color: "rgba(255,255,255,0.7)",
    fontSize: width < 375 ? 10 : 12,
    fontWeight: "400",
    fontFamily: "inter",
    textAlign: "center",
    marginTop: 2,
  },
  statDivider: {
    width: 1,
    backgroundColor: "rgba(255,255,255,0.3)",
    marginHorizontal: 5,
  },
  sectionsContainer: {
    paddingHorizontal: width < 375 ? 16 : 20,
    paddingTop: 25,
    paddingBottom: 30,
  },
  section: {
    marginBottom: 25,
  },
  sectionTitle: {
    fontSize: width < 375 ? 20 : 24,
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
    paddingVertical: width < 375 ? 14 : 16,
    paddingHorizontal: width < 375 ? 16 : 20,
    borderBottomWidth: 1.5,
    borderBottomColor: '#F3F4F6',
  },
  menuItemLeft: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  iconContainer: {
    width: width < 375 ? 40 : 44,
    height: width < 375 ? 40 : 44,
    borderRadius: 12,
    backgroundColor: '#E0E7FF',
    justifyContent: "center",
    alignItems: "center",
    marginRight: width < 375 ? 12 : 15,
  },
  menuItemText: {
    fontSize: width < 375 ? 16 : 18,
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
    paddingVertical: width < 375 ? 14 : 16,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 8,
  },
  logoutText: {
    color: Colors.white,
    fontSize: width < 375 ? 16 : 18,
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
    width: width < 375 ? 70 : 80,
    height: width < 375 ? 70 : 80,
    resizeMode: 'contain',
    marginBottom: -10,
  },
  versionText: {
    fontSize: width < 375 ? 12 : 14,
    color: '#6B7280',
    marginBottom: 5,
    fontFamily: 'inter',
    fontWeight: '500',
  },
  copyrightText: {
    fontSize: width < 375 ? 10 : 12,
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