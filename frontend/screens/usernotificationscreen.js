// import React, { useEffect, useState } from "react";
// import {
//   View,
//   Text,
//   StyleSheet,
//   TouchableOpacity,
//   ScrollView,
//   StatusBar,
//   ActivityIndicator,
// } from "react-native";
// import { SafeAreaView } from "react-native-safe-area-context";
// import { Ionicons, MaterialIcons } from "@expo/vector-icons";
// import CommonHeader from "../components/CommonHeader";
// import LottieView from "lottie-react-native";
// import CustomAlert from "../components/CustomAlert";

// import DatabaseService from "../services/usernotification_ds";
// import { Colors, Typography } from "../constants/Colors";
// import { scale, verticalScale, moderateScale } from 'react-native-size-matters';
// import { useAuth } from "../context/AuthContext";

// /* ================= SCREEN ================= */
// export default function NotificationScreen({ navigation, route }) {
//   const { user } = useAuth();
//   const phoneNumber = user?.phone_number;

//   const [notifications, setNotifications] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [clearing, setClearing] = useState(false);
  
//   // Custom Alert states
//   const [alertVisible, setAlertVisible] = useState(false);
//   const [alertConfig, setAlertConfig] = useState({
//     title: "",
//     message: "",
//     icon: "check-circle",
//     iconColor: "#10B981",
//     buttons: []
//   });

//   const showCustomAlert = (title, message, type = 'success') => {
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
//       buttons: [{ text: 'OK', onPress: () => setAlertVisible(false) }]
//     });
//     setAlertVisible(true);
//   };

//   const showConfirmationAlert = (title, message, onConfirm, confirmText = 'Clear') => {
//     setAlertConfig({
//       title,
//       message,
//       icon: "warning",
//       iconColor: "#F59E0B",
//       buttons: [
//         { text: 'Cancel', onPress: () => setAlertVisible(false), style: 'cancel' },
//         { text: confirmText, onPress: () => {
//           setAlertVisible(false);
//           onConfirm();
//         }, style: 'destructive' }
//       ]
//     });
//     setAlertVisible(true);
//   };

//   /* ================= FETCH ================= */
//   useEffect(() => {
//     fetchNotifications();
//   }, []);

//   const fetchNotifications = async () => {
//     try {
//       if (!phoneNumber) {
//         setLoading(false);
//         return;
//       }

//       const cleanPhone = phoneNumber.replace(/\s/g, "");
//       const res = await DatabaseService.getNotifications(cleanPhone);

//       if (res?.notifications) {
//         setNotifications(res.notifications);
//       } else if (res?.error) {
//         showCustomAlert('Error', res.error, 'error');
//       }
//     } catch (e) {
//       console.error("❌ Notification fetch error:", e);
//       showCustomAlert('Error', 'Failed to load notifications. Please try again.', 'error');
//     } finally {
//       setLoading(false);
//     }
//   };

//   /* ================= ACTION ================= */
//   const openNotification = async (item) => {
//     try {
//       if (!item.is_read) {
//         await DatabaseService.markNotificationRead(item.id);
//         // Update local state
//         setNotifications(prev => 
//           prev.map(notif => 
//             notif.id === item.id ? { ...notif, is_read: true } : notif
//           )
//         );
//       }

//       if (item.action_type === "document") {
//         navigation.navigate("MyDocuments");
//       } else if (item.action_type === "wallet") {
//         navigation.navigate("Wallet");
//       } else if (item.action_type === "ride") {
//         navigation.navigate("MyRides");
//       }
//     } catch (e) {
//       console.error("❌ Open notification error:", e);
//       showCustomAlert('Error', 'Failed to open notification', 'error');
//     }
//   };

//   const clearAll = async () => {
//     if (!phoneNumber) return;
    
//     if (notifications.length === 0) {
//       showCustomAlert('Info', 'No notifications to clear', 'info');
//       return;
//     }

//     showConfirmationAlert(
//       'Delete All Notifications',
//       `Are you sure you want to clear all ${notifications.length} notification${notifications.length > 1 ? 's' : ''}? This action cannot be undone.`,
//       async () => {
//         setClearing(true);
//         try {
//           await DatabaseService.clearNotifications(
//             phoneNumber.replace(/\s/g, "")
//           );
//           setNotifications([]);
//           showCustomAlert('Success', 'All notifications cleared successfully', 'success');
//         } catch (e) {
//           console.error("❌ Clear all error:", e);
//           showCustomAlert('Error', 'Failed to clear notifications', 'error');
//         } finally {
//           setClearing(false);
//         }
//       },
//       'Delete All'
//     );
//   };

//   const handleRefresh = () => {
//     setLoading(true);
//     fetchNotifications();
//   };

//   /* ================= UI ================= */
//   // Loading state with Lottie animation
//   if (loading) {
//     return (
//       <SafeAreaView style={styles.container}>
//         <StatusBar backgroundColor={Colors.white} barStyle="dark-content" />
//         <CommonHeader
//           title="Notifications"
//           showBackButton={true}
//         />
//         <View style={styles.loaderContainer}>
//           <LottieView
//             source={require("../assets/loading.json")}
//             autoPlay
//             loop
//             style={{ width: 300, height: 300 }}
//           />
//           {/* <Text style={styles.loadingText}>Loading notifications...</Text>
//           <TouchableOpacity 
//             style={styles.reloadButton}
//             onPress={handleRefresh}>
//             <Ionicons name="refresh" size={moderateScale(18)} color={Colors.white} />
//             <Text style={styles.reloadButtonText}>Try Again</Text>
//           </TouchableOpacity> */}
//         </View>
//       </SafeAreaView>
//     );
//   }

//   return (
//     <SafeAreaView style={styles.container}>
//       <StatusBar backgroundColor={Colors.white} barStyle="dark-content" />

// <CommonHeader
//   title="Notifications"
//   showBack={true}
//   rightIcon={
//     notifications.length > 0
//       ? "delete-outline"
//       : null
//   }
//   rightIconColor={Colors.orange1}
//   onRightPress={clearAll}
// />
      

//       {/* ================= CONTENT ================= */}
//       {notifications.length === 0 ? (
//         <View style={styles.empty}>
//           <Ionicons
//             name="notifications-outline"
//             size={moderateScale(80)}
//             color={Colors.borderGray}
//           />
//           <Text style={styles.emptyTitle}>No Notifications</Text>
//           <Text style={styles.emptyText}>
//             You're all caught up. New alerts will appear here.
//           </Text>
//           {/* <TouchableOpacity 
//             style={styles.refreshEmptyButton}
//             onPress={handleRefresh}>
//             <Ionicons name="refresh-outline" size={moderateScale(18)} color={Colors.primary} />
//             <Text style={styles.refreshEmptyText}>Refresh</Text>
//           </TouchableOpacity> */}
//         </View>
//       ) : (
//         <ScrollView
//           showsVerticalScrollIndicator={false}
//           contentContainerStyle={styles.list}
//         >
//           {notifications.map(item => (
//             <TouchableOpacity
//               key={item.id}
//               style={[
//                 styles.card,
//                 !item.is_read && styles.unreadCard
//               ]}
//               activeOpacity={0.85}
//               onPress={() => openNotification(item)}
//             >
//               <View style={styles.iconBox}>
//                 <Ionicons
//                   name={getIcon(item.type)}
//                   size={22}
//                   color={Colors.orange1}
//                 />
//               </View>

//               <View style={styles.content}>
//                 <Text style={styles.title}>{item.title}</Text>
//                 <Text style={styles.message}>{item.message}</Text>
//                 <Text style={styles.time}>
//                   {formatDate(item.created_at)}
//                 </Text>
//               </View>

//               {!item.is_read && <View style={styles.dot} />}
//             </TouchableOpacity>
//           ))}
//         </ScrollView>
//       )}

//       {/* CUSTOM ALERT */}
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

// /* ================= HELPERS ================= */
// const getIcon = (type) => {
//   switch (type) {
//     case "reward":
//       return "gift-outline";
//     case "document":
//       return "document-text-outline";
//     case "ride":
//       return "car-outline";
//     case "promotion":
//       return "pricetag-outline";
//     default:
//       return "notifications-outline";
//   }
// };

// const formatDate = (date) => {
//   if (!date) return '';
//   const d = new Date(date);
//   const now = new Date();
//   const diffInMs = now - d;
//   const diffInMins = Math.floor(diffInMs / 60000);
//   const diffInHours = Math.floor(diffInMs / 3600000);
//   const diffInDays = Math.floor(diffInMs / 86400000);

//   if (diffInMins < 1) return 'Just now';
//   if (diffInMins < 60) return `${diffInMins} min ago`;
//   if (diffInHours < 24) return `${diffInHours} hour${diffInHours > 1 ? 's' : ''} ago`;
//   if (diffInDays === 1) return 'Yesterday';
//   if (diffInDays < 7) return `${diffInDays} days ago`;
  
//   return d.toLocaleDateString();
// };

// /* ================= STYLES ================= */
// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     backgroundColor: Colors.white,
//   },

//   list: {
//     padding: moderateScale(16),
//     paddingBottom: verticalScale(40),
//   },

//   card: {
//     flexDirection: "row",
//     padding: moderateScale(14),
//     borderRadius: moderateScale(16),
//     borderWidth: 1,
//     borderColor: Colors.borderGray,
//     backgroundColor: "#F9FAFB",
//     marginBottom: verticalScale(12),
//     alignItems: "center",
//   },

//   unreadCard: {
//     backgroundColor: "#FFF7ED",
//     borderColor: Colors.orange1,
//   },

//   iconBox: {
//     width: moderateScale(42),
//     height: moderateScale(42),
//     borderRadius: moderateScale(21),
//     backgroundColor: "#FFEAD5",
//     justifyContent: "center",
//     alignItems: "center",
//     marginRight: moderateScale(12),
//   },

//   content: {
//     flex: 1,
//   },

//   title: {
//     fontSize: moderateScale(15),
//     fontWeight: "700",
//     color: Colors.primary,
//   },

//   message: {
//     fontSize: moderateScale(14),
//     color: Colors.dark,
//     marginTop: verticalScale(2),
//   },

//   time: {
//     fontSize: moderateScale(11),
//     color: "#6B7280",
//     marginTop: verticalScale(6),
//   },

//   dot: {
//     width: moderateScale(8),
//     height: moderateScale(8),
//     borderRadius: moderateScale(4),
//     backgroundColor: Colors.orange1,
//   },

//   loaderContainer: {
//     flex: 1,
//     justifyContent: "center",
//     alignItems: "center",
//     paddingHorizontal: moderateScale(40),
//   },

//   loadingText: {
//     fontSize: moderateScale(16),
//     color: Colors.gray,
//     marginTop: verticalScale(16),
//     marginBottom: verticalScale(24),
//     fontFamily: Typography.fontFamily?.regular,
//   },

//   reloadButton: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     justifyContent: 'center',
//     backgroundColor: Colors.primary,
//     paddingHorizontal: moderateScale(24),
//     paddingVertical: verticalScale(12),
//     borderRadius: moderateScale(25),
//     marginTop: verticalScale(24),
//     elevation: 2,
//     shadowColor: Colors.black,
//     shadowOffset: { width: 0, height: verticalScale(2) },
//     shadowOpacity: 0.1,
//     shadowRadius: moderateScale(3),
//   },

//   reloadButtonText: {
//     fontSize: moderateScale(16),
//     color: Colors.white,
//     fontWeight: '600',
//     marginLeft: moderateScale(8),
//   },

//   empty: {
//     flex: 1,
//     justifyContent: "center",
//     alignItems: "center",
//     paddingHorizontal: moderateScale(40),
//   },

//   emptyTitle: {
//     fontSize: moderateScale(20),
//     fontWeight: "700",
//     marginTop: verticalScale(16),
//     color: Colors.primary,
//   },

//   emptyText: {
//     fontSize: moderateScale(14),
//     textAlign: "center",
//     marginTop: verticalScale(8),
//     color: "#6B7280",
//     marginBottom: verticalScale(24),
//     lineHeight: verticalScale(20),
//   },

//   refreshEmptyButton: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     justifyContent: 'center',
//     backgroundColor: '#F3F4F6',
//     paddingHorizontal: moderateScale(20),
//     paddingVertical: verticalScale(10),
//     borderRadius: moderateScale(25),
//     marginTop: verticalScale(16),
//   },

//   refreshEmptyText: {
//     fontSize: moderateScale(14),
//     color: Colors.primary,
//     fontWeight: '600',
//     marginLeft: moderateScale(8),
//   },
// });
import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  StatusBar,
  ActivityIndicator,
  SectionList,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons, MaterialIcons } from "@expo/vector-icons";
import CommonHeader from "../components/CommonHeader";
import LottieView from "lottie-react-native";
import CustomAlert from "../components/CustomAlert";

import DatabaseService from "../services/usernotification_ds";
import { Colors, Typography } from "../constants/Colors";
import { scale, verticalScale, moderateScale } from 'react-native-size-matters';
import { useAuth } from "../context/AuthContext";

/* ================= SCREEN ================= */
export default function NotificationScreen({ navigation, route }) {
  const { user } = useAuth();
  const phoneNumber = user?.phone_number;

  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [clearing, setClearing] = useState(false);
  
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

  const showConfirmationAlert = (title, message, onConfirm, confirmText = 'Clear') => {
    setAlertConfig({
      title,
      message,
      icon: "warning",
      iconColor: "#F59E0B",
      buttons: [
        { text: 'Cancel', onPress: () => setAlertVisible(false), style: 'cancel' },
        { text: confirmText, onPress: () => {
          setAlertVisible(false);
          onConfirm();
        }, style: 'destructive' }
      ]
    });
    setAlertVisible(true);
  };

  /* ================= FETCH ================= */
  useEffect(() => {
    fetchNotifications();
  }, []);

  const fetchNotifications = async () => {
    try {
      if (!phoneNumber) {
        setLoading(false);
        return;
      }

      const cleanPhone = phoneNumber.replace(/\s/g, "");
      const res = await DatabaseService.getNotifications(cleanPhone);

      if (res?.notifications) {
        // Group notifications by date
        const grouped = groupNotificationsByDate(res.notifications);
        setNotifications(grouped);
      } else if (res?.error) {
        showCustomAlert('Error', res.error, 'error');
      }
    } catch (e) {
      console.error("❌ Notification fetch error:", e);
      showCustomAlert('Error', 'Failed to load notifications. Please try again.', 'error');
    } finally {
      setLoading(false);
    }
  };

  // Group notifications by date (Today, Yesterday, etc.)
  const groupNotificationsByDate = (notifs) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    
    const groups = {
      Today: [],
      Yesterday: [],
      Older: []
    };
    
    notifs.forEach(notif => {
      const notifDate = new Date(notif.created_at);
      notifDate.setHours(0, 0, 0, 0);
      
      if (notifDate.getTime() === today.getTime()) {
        groups.Today.push(notif);
      } else if (notifDate.getTime() === yesterday.getTime()) {
        groups.Yesterday.push(notif);
      } else {
        groups.Older.push(notif);
      }
    });
    
    const sections = [];
    if (groups.Today.length > 0) {
      sections.push({ title: 'Today', data: groups.Today });
    }
    if (groups.Yesterday.length > 0) {
      sections.push({ title: 'Yesterday', data: groups.Yesterday });
    }
    if (groups.Older.length > 0) {
      sections.push({ title: 'Earlier', data: groups.Older });
    }
    
    return sections;
  };

  /* ================= ACTION ================= */
  const openNotification = async (item) => {
    try {
      if (!item.is_read) {
        await DatabaseService.markNotificationRead(item.id);
        // Update local state
        setNotifications(prev => 
          prev.map(section => ({
            ...section,
            data: section.data.map(notif => 
              notif.id === item.id ? { ...notif, is_read: true } : notif
            )
          }))
        );
      }

      if (item.action_type === "document") {
        navigation.navigate("MyDocuments");
      } else if (item.action_type === "wallet") {
        navigation.navigate("Wallet");
      } else if (item.action_type === "ride") {
        navigation.navigate("MyRides");
      }
    } catch (e) {
      console.error("❌ Open notification error:", e);
      showCustomAlert('Error', 'Failed to open notification', 'error');
    }
  };

  const clearAll = async () => {
    if (!phoneNumber) return;
    
    const totalCount = notifications.reduce((sum, section) => sum + section.data.length, 0);
    
    if (totalCount === 0) {
      showCustomAlert('Info', 'No notifications to clear', 'info');
      return;
    }

    showConfirmationAlert(
      'Delete All Notifications',
      `Are you sure you want to clear all ${totalCount} notification${totalCount > 1 ? 's' : ''}? This action cannot be undone.`,
      async () => {
        setClearing(true);
        try {
          await DatabaseService.clearNotifications(
            phoneNumber.replace(/\s/g, "")
          );
          setNotifications([]);
          showCustomAlert('Success', 'All notifications cleared successfully', 'success');
        } catch (e) {
          console.error("❌ Clear all error:", e);
          showCustomAlert('Error', 'Failed to clear notifications', 'error');
        } finally {
          setClearing(false);
        }
      },
      'Delete All'
    );
  };

  const handleRefresh = () => {
    setLoading(true);
    fetchNotifications();
  };

  // Render individual notification item - FIXED VERSION with inline unread indicator
  const renderNotificationItem = ({ item }) => (
    <TouchableOpacity
      style={styles.card}
      activeOpacity={0.85}
      onPress={() => openNotification(item)}
    >
      <View style={styles.cardContent}>
        <View style={styles.cardHeader}>
          <View style={styles.titleContainer}>
            <Text style={styles.title} numberOfLines={2}>{item.title}</Text>
            {!item.is_read && <View style={styles.unreadIndicatorInline} />}
          </View>
          <Text style={styles.time}>{formatTime(item.created_at)}</Text>
        </View>
        <Text style={styles.message} numberOfLines={2}>{item.message}</Text>
      </View>
    </TouchableOpacity>
  );

  // Render section header
  const renderSectionHeader = ({ section: { title } }) => (
    <Text style={styles.sectionHeader}>{title}</Text>
  );

  // List empty component
  const ListEmptyComponent = () => (
    <View style={styles.empty}>
      <Ionicons
        name="notifications-outline"
        size={moderateScale(80)}
        color={Colors.borderGray}
      />
      <Text style={styles.emptyTitle}>No Notifications</Text>
      <Text style={styles.emptyText}>
        You're all caught up. New alerts will appear here.
      </Text>
    </View>
  );

  /* ================= UI ================= */
  // Loading state with Lottie animation
  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar backgroundColor={Colors.white} barStyle="dark-content" />
        <CommonHeader
          title="Notifications"
          showBackButton={true}
        />
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

  const totalCount = notifications.reduce((sum, section) => sum + section.data.length, 0);

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar backgroundColor={Colors.white} barStyle="dark-content" />

      <CommonHeader
        title="Notifications"
        showBack={true}
        rightIcon={totalCount > 0 ? "delete-outline" : null}
        rightIconColor={Colors.orange1}
        onRightPress={clearAll}
      />
      
      {/* ================= CONTENT ================= */}
      <SectionList
        sections={notifications}
        keyExtractor={(item) => item.id.toString()}
        renderItem={renderNotificationItem}
        renderSectionHeader={renderSectionHeader}
        renderSectionFooter={() => <View style={styles.sectionFooter} />}
        ListEmptyComponent={ListEmptyComponent}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={notifications.length === 0 ? styles.emptyList : styles.list}
        stickySectionHeadersEnabled={false}
      />

      {/* CUSTOM ALERT */}
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

/* ================= HELPERS ================= */
const formatTime = (date) => {
  if (!date) return '';
  const d = new Date(date);
  const now = new Date();
  const diffInMs = now - d;
  const diffInMins = Math.floor(diffInMs / 60000);
  const diffInHours = Math.floor(diffInMs / 3600000);
  const diffInDays = Math.floor(diffInMs / 86400000);

  if (diffInMins < 1) return 'Just now';
  if (diffInMins < 60) return `${diffInMins}m ago`;
  if (diffInHours < 24) return `${diffInHours}h ago`;
  if (diffInDays === 1) return 'Yesterday';
  
  return d.toLocaleDateString();
};

/* ================= STYLES ================= */
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.white,
  },

  list: {
    paddingHorizontal: moderateScale(16),
    paddingBottom: verticalScale(40),
  },

  emptyList: {
    flex: 1,
  },

  sectionHeader: {
    fontSize: moderateScale(13),
    fontWeight: "600",
    color: "#8E8E93",
    backgroundColor: Colors.white,
    paddingTop: verticalScale(16),
    paddingBottom: verticalScale(8),
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },

  sectionFooter: {
    height: verticalScale(8),
  },

  card: {
    backgroundColor: Colors.white,
    borderBottomWidth: 1,
    borderBottomColor: "#E5E5EA",
    paddingVertical: verticalScale(12),
  },

  cardContent: {
    position: "relative",
  },

  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: verticalScale(4),
  },

  titleContainer: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
    gap: moderateScale(8),
  },

  title: {
    fontSize: moderateScale(16),
    fontWeight: "600",
    color: Colors.black,
    flexShrink: 1,
  },

  message: {
    fontSize: moderateScale(14),
    color: "#8E8E93",
    lineHeight: verticalScale(20),
    paddingRight: moderateScale(12),
  },

  time: {
    fontSize: moderateScale(12),
    color: "#8E8E93",
    flexShrink: 0,
    marginLeft: moderateScale(12),
  },

  unreadIndicatorInline: {
    width: moderateScale(8),
    height: moderateScale(8),
    borderRadius: moderateScale(4),
    backgroundColor: "#007AFF",
  },

  loaderContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: moderateScale(40),
  },

  empty: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: moderateScale(40),
  },

  emptyTitle: {
    fontSize: moderateScale(20),
    fontWeight: "700",
    marginTop: verticalScale(16),
    color: Colors.primary,
  },

  emptyText: {
    fontSize: moderateScale(14),
    textAlign: "center",
    marginTop: verticalScale(8),
    color: "#6B7280",
    lineHeight: verticalScale(20),
  },
});