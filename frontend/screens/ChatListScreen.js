// import React, { useState, useEffect, useCallback } from 'react';
// import {
//   View,
//   Text,
//   StyleSheet,
//   FlatList,
//   TextInput,
//   TouchableOpacity,
//   StatusBar,
//   RefreshControl,
//   Dimensions,
//   Platform,
//   ActivityIndicator,
//   Image,
// } from 'react-native';
// import { SafeAreaView } from 'react-native-safe-area-context';
// import Icon from 'react-native-vector-icons/Ionicons';
// import { Colors } from '../constants/Colors';
// import { useFocusEffect } from '@react-navigation/native';
// import CommonHeader from '../components/CommonHeader';
// import { useAuth } from '../context/AuthContext';
// import { scale, verticalScale, moderateScale } from 'react-native-size-matters';
// import LottieView from "lottie-react-native";
// import CustomAlert from '../components/CustomAlert';
// import AsyncStorage from '@react-native-async-storage/async-storage';
// import ChatService from '../services/ChatService';
// import { SvgCssUri } from "react-native-svg/css";
// const { width, height } = Dimensions.get('window');

// const ChatListScreen = ({ navigation }) => {
//   const { user, isGuest } = useAuth();

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

//   useEffect(() => {
//     if (isGuest) {
//       showCustomAlert(
//         'Login Required',
//         'Please complete login to access chats.',
//         'warning'
//       );
//     }
//   }, [isGuest]);

//   const [searchQuery, setSearchQuery] = useState('');
//   const [chats, setChats] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [refreshing, setRefreshing] = useState(false);
//   const [isReloading, setIsReloading] = useState(false);
//   const [blockedUsers, setBlockedUsers] = useState([]);
//   const [avatarRefreshKey, setAvatarRefreshKey] = useState(0);
//   const [selectedChats, setSelectedChats] = useState([]);
// const [selectionMode, setSelectionMode] = useState(false);
//  useFocusEffect(
//   useCallback(() => {

//     // FORCE RE-RENDER
//     setAvatarRefreshKey(prev => prev + 1);

//     loadBlockedUsers();
//     loadConversations();

//   }, [])
// );

//   const loadBlockedUsers = async () => {
//     try {
//       const blocked = await AsyncStorage.getItem('blocked_users');
//       if (blocked) {
//         setBlockedUsers(JSON.parse(blocked));
//       }
//     } catch (error) {
//       console.error('Load blocked users error:', error);
//     }
//   };

//  // Add this to ChatListScreen.js

// const loadConversations = async (showReloadIndicator = false) => {
//   try {
//     if (showReloadIndicator) {
//       setIsReloading(true);
//     } else {
//       setLoading(true);
//     }

//     const myPhone = user?.phone_number;
//     if (!myPhone || myPhone === 'guest_mode') {
//       setLoading(false);
//       return;
//     }

//     // Get blocked users from backend
//     const blockedResult = await ChatService.getBlockedUsers(myPhone);
//     let backendBlockedList = [];
//     if (blockedResult.success) {
//       backendBlockedList = blockedResult.blocked_users.map(u => u.phone);
//     }
    
//     // Also get local blocked list
//     const localBlocked = await AsyncStorage.getItem('blocked_users');
//     const localBlockedList = localBlocked ? JSON.parse(localBlocked) : [];
    
//     // Merge both lists
//     const allBlocked = [...new Set([...backendBlockedList, ...localBlockedList])];
//     setBlockedUsers(allBlocked);

//     const result = await ChatService.getConversations(myPhone);

//     if (result.success) {
//       // Filter out blocked users
//     const transformedChats = result.conversations.map(conv => ({
//   id: conv.id.toString(),
//   name: conv.other_user.name,
//   lastMessage: conv.last_message || 'No messages yet',
//   timestamp: formatTimestamp(conv.last_message_time),
//   unreadCount: conv.unread_count || 0,
//   isOnline: false,
//   avatar: conv.other_user.avatar,
//   isPinned: false,
//   isVoiceMessage: conv.last_message_type === 'voice',
//   conversationId: conv.id,
//   otherUserId: conv.other_user.id,
//   otherUserPhone: conv.other_user.phone,

//   // ADD THIS
//   isBlocked: allBlocked.includes(conv.other_user.phone),

// }));

// setChats(transformedChats);
//       setChats(transformedChats);
//     }
//   } catch (error) {
//     console.error('Load conversations error:', error);
//   } finally {
//     setLoading(false);
//     setRefreshing(false);
//     setIsReloading(false);
//   }
// };
//   const onRefresh = () => {
//     setRefreshing(true);
//     loadConversations();
//   };

//   const handleReload = () => {
//     loadConversations(true);
//   };

//   const formatTimestamp = (timestamp) => {
//     if (!timestamp) return '';

//     const date = new Date(timestamp);
//     const now = new Date();
//     const diffInMs = now - date;
//     const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));

//     if (diffInDays === 0) {
//       return date.toLocaleTimeString('en-IN', {
//         hour: '2-digit',
//         minute: '2-digit',
//       });
//     } else if (diffInDays === 1) {
//       return 'Yesterday';
//     } else if (diffInDays < 7) {
//       return date.toLocaleDateString('en-IN', { weekday: 'short' });
//     } else {
//       return date.toLocaleDateString('en-IN', {
//         day: 'numeric',
//         month: 'short',
//       });
//     }
//   };

//   const filteredChats = chats.filter(chat =>
//     chat.name.toLowerCase().includes(searchQuery.toLowerCase())
//   );

//   const pinnedChats = filteredChats.filter(chat => chat.isPinned);
//   const regularChats = filteredChats.filter(chat => !chat.isPinned);
// // In ChatListScreen.js - Fix handleChatPress

// const handleChatPress = (chat) => {
//   console.log('Opening chat with:', {
//     name: chat.name,
//     phone: chat.otherUserPhone,
//     conversationId: chat.conversationId
//   });
  
//   navigation.navigate('ChatScreen', {
//     user: {
//       id: chat.otherUserId,
//       name: chat.name,
//       phone_number: chat.otherUserPhone,  // Make sure this is the partner's phone
//       profile_picture: chat.avatar,
//     },
//     conversationId: chat.conversationId,
//     receiverPhone: chat.otherUserPhone,    // Pass as backup
//   });
// };
// const handleLongPressChat = (chatId) => {
//   setSelectionMode(true);
//   setSelectedChats([chatId]);
// };

// const handleSelectChat = (chatId) => {
//   if (!selectionMode) return;

//   if (selectedChats.includes(chatId)) {
//     const updated = selectedChats.filter(id => id !== chatId);

//     setSelectedChats(updated);

//     if (updated.length === 0) {
//       setSelectionMode(false);
//     }
//   } else {
//     setSelectedChats([...selectedChats, chatId]);
//   }
// };

// const handleDeleteSelected = async () => {
//   try {

//     const myPhone = user?.phone_number;

//     for (const chatId of selectedChats) {

//       const selectedChat = chats.find(
//         c => c.id === chatId
//       );

//       if (selectedChat?.conversationId) {

//        const result = await ChatService.hideChat(
//   selectedChat.conversationId,
//   myPhone
// );

// console.log('DELETE RESULT:', result);
//       }
      
//     }

//     const updatedChats = chats.filter(
//       chat => !selectedChats.includes(chat.id)
//     );

//     setChats(updatedChats);

//     setSelectedChats([]);
//     setSelectionMode(false);

//   } catch (error) {

//     console.error(
//       'Delete selected chats error:',
//       error
//     );
//   }
// };
// const renderAvatar = (item) => {

//   if (item.avatar) {

//     const isSvg = item.avatar
//       ?.toLowerCase()
//       ?.includes('.svg');

//     if (isSvg) {

//       return (
//        <SvgCssUri
//   key={`${item.avatar}-${avatarRefreshKey}`}
//   width="100%"
//   height="100%"
//   uri={item.avatar}
// />
//       );

//     }

//     return (
//       <Image
//         source={{ uri: item.avatar }}
//         style={styles.avatarImage}
//       />
//     );
//   }

//   return (
//     <View style={styles.avatarPlaceholder}>
//       <Text style={styles.avatarText}>
//         {item.name?.charAt(0) || 'U'}
//       </Text>
//     </View>
//   );
// };

//   const renderChatItem = ({ item }) => (
//     <TouchableOpacity
// style={[
//   styles.chatItem,
//   selectedChats.includes(item.id) && styles.selectedChatItem,
// ]}
//       activeOpacity={0.7}
//       onLongPress={() => handleLongPressChat(item.id)}
//       onPress={() => {
//   if (selectionMode) {
//     handleSelectChat(item.id);
//   } else {
//     handleChatPress(item);
//   }
// }}>
      
//       <View style={styles.avatarContainer}>
//         <View style={styles.avatar}>
//           {renderAvatar(item)}
//         </View>
//         {item.isOnline && <View style={styles.onlineIndicator} />}
//       </View>

//       <View style={styles.chatContent}>
//         <View style={styles.chatHeader}>
//           <View style={styles.nameRow}>
//             <Text style={styles.chatName} numberOfLines={1}>
//               {item.name}
//             </Text>
//             {item.isBlocked && (
//   <View style={styles.blockedBadge}>
//     <Text style={styles.blockedText}>Blocked</Text>
//   </View>
// )}
//             {item.isPinned && (
//               <Icon 
//                 name="pin" 
//                 size={moderateScale(13)} 
//                 color={Colors.secondary} 
//                 style={styles.pinIcon} 
//               />
//             )}
//           </View>
//           <Text style={styles.timestamp}>{item.timestamp}</Text>
//         </View>

//         <View style={styles.messageRow}>
//           <View style={styles.messageContent}>
//             <View style={styles.lastMessageRow}>
//               {item.isVoiceMessage && (
//                 <Icon 
//                   name="mic" 
//                   size={moderateScale(13)} 
//                   color={Colors.gray} 
//                   style={styles.voiceIcon} 
//                 />
//               )}
//               <Text
//                 style={[
//                   styles.lastMessage,
//                   item.unreadCount > 0 && styles.unreadMessage,
//                 ]}
//                 numberOfLines={1}>
//                 {item.lastMessage?.replace('🎤', '').trim() || 'No messages'}
//               </Text>
//             </View>
//           </View>
//           {item.unreadCount > 0 && (
//             <View style={styles.unreadBadge}>
//               <Text style={styles.unreadCount}>
//                 {item.unreadCount > 99 ? '99+' : item.unreadCount}
//               </Text>
//             </View>
//           )}
//         </View>
//       </View>
//     </TouchableOpacity>
//   );

//   const renderEmptyState = () => (
//     <View style={styles.emptyContainer}>
//       <Icon 
//         name="chatbubbles-outline" 
//         size={moderateScale(100)} 
//         color={Colors.primary} 
//         style={{ opacity: 0.3 }}
//       />
//       <Text style={styles.emptyText}>No chats available</Text>
//       <Text style={styles.emptySubtext}>
//         Start a ride to connect with other users
//       </Text>
      
//       <TouchableOpacity 
//         style={styles.reloadButton}
//         onPress={handleReload}
//         disabled={isReloading}>
//         {isReloading ? (
//           <ActivityIndicator size="small" color={Colors.white} />
//         ) : (
//           <>
//             <Icon name="refresh" size={moderateScale(18)} color={Colors.white} />
//             <Text style={styles.reloadButtonText}>Reload</Text>
//           </>
//         )}
//       </TouchableOpacity>
//     </View>
//   );

//   const renderSectionHeader = title => (
//     <View style={styles.sectionHeader}>
//       <Text style={styles.sectionTitle}>{title}</Text>
//     </View>
//   );

//   if (loading && chats.length === 0) {
//     return (
//       <SafeAreaView style={styles.container}>
//         <StatusBar barStyle="dark-content" backgroundColor={Colors.white} />
// <CommonHeader
//   title={
//     selectionMode
//       ? `${selectedChats.length} Selected`
//       : "Chats"
//   }
//   showBackButton={true}
//   rightIcon={
//   selectionMode
//     ? "trash"
//     : null
// }
//   rightIconColor="#FF8800"
//   onRightPress={
//     selectionMode
//       ? handleDeleteSelected
//       : handleReload
//   }
// />
//         <View style={styles.loadingContainer}>
//           <LottieView
//             source={require("../assets/loading.json")}
//             autoPlay
//             loop
//             style={{
//   width: width * 0.55,
//   height: width * 0.55,
// }}
//           />
//         </View>
//       </SafeAreaView>
//     );
//   }

//   return (
//     <SafeAreaView style={styles.container}>
//       <StatusBar barStyle="dark-content" backgroundColor={Colors.white} />

//    <CommonHeader
//   title={
//     selectionMode
//       ? `${selectedChats.length} Selected`
//       : "Chats"
//   }
//   showBack={true}
//   rightIcon={
//     selectionMode
//       ? "delete-outline"
//       : null
//   }
//   rightIconColor="#FF8800"
//   onRightPress={() => {
//   setAlertConfig({
//     title: "Delete Chats",
//     message: `Delete ${selectedChats.length} selected chat(s)?`,
//     icon: "warning",
//     iconColor: "#F59E0B",
//     buttons: [
//       {
//         text: "Cancel",
//         onPress: () => setAlertVisible(false),
//       },
//       {
//         text: "Delete",
//         onPress: async () => {
//           setAlertVisible(false);
//           await handleDeleteSelected();
//         },
//       },
//     ],
//   });

//   setAlertVisible(true);
// }}
// />

//       {isReloading && (
//         <View style={styles.reloadingHeader}>
//           <ActivityIndicator size="small" color={Colors.primary} />
//           <Text style={styles.reloadingText}>Refreshing...</Text>
//         </View>
//       )}

//       <View style={styles.searchContainer}>
//         <Icon 
//           name="search-outline" 
//           size={moderateScale(20)} 
//           color={Colors.secondary} 
//           style={styles.searchIcon} 
//         />
//         <TextInput
//           style={styles.searchInput}
//           placeholder="Search chats..."
//           placeholderTextColor={Colors.gray}
//           value={searchQuery}
//           onChangeText={setSearchQuery}
//         />
//         {searchQuery.length > 0 && (
//           <TouchableOpacity onPress={() => setSearchQuery('')}>
//             <Icon name="close-circle" size={moderateScale(18)} color={Colors.gray} />
//           </TouchableOpacity>
//         )}
//       </View>

//       {filteredChats.length === 0 ? (
//         renderEmptyState()
//       ) : (
//         <FlatList
//           data={[...pinnedChats, ...regularChats]}
//           renderItem={renderChatItem}
//           keyExtractor={item => item.id}
//           contentContainerStyle={styles.chatList}
//           showsVerticalScrollIndicator={false}
//           refreshControl={
//             <RefreshControl
//               refreshing={refreshing}
//               onRefresh={onRefresh}
//               tintColor={Colors.primary}
//               colors={[Colors.primary]}
//             />
//           }
//           ListHeaderComponent={
//             pinnedChats.length > 0 ? renderSectionHeader('Pinned') : null
//           }
//         />
//       )}

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
// };

// const styles = StyleSheet.create({
//   container: { flex: 1, backgroundColor: Colors.white },
//   reloadingHeader: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     justifyContent: 'center',
//     backgroundColor: Colors.primary + '10',
//     paddingVertical: verticalScale(8),
//     marginHorizontal: moderateScale(16),
//     marginTop: verticalScale(8),
//     borderRadius: moderateScale(8),
//   },
//   reloadingText: {
//     fontSize: moderateScale(14),
//     color: Colors.primary,
//     marginLeft: moderateScale(8),
//     fontWeight: '500',
//   },
//   searchContainer: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     backgroundColor: Colors.white,
//     marginHorizontal: moderateScale(16),
//     marginVertical: verticalScale(12),
//     paddingHorizontal: moderateScale(14),
//     paddingVertical: Platform.OS === 'ios' ? verticalScale(8) : 0,
//     borderRadius: moderateScale(12),
//     borderWidth: 1,
//     borderColor: '#E0E0E0',
//     elevation: 2,
//   },
//   searchIcon: { marginRight: moderateScale(10) },
//   searchInput: {
//     flex: 1,
//     fontSize: moderateScale(16),
//     color: Colors.dark,
//     paddingVertical: Platform.OS === 'ios' ? verticalScale(12) : verticalScale(8),
//   },
//   sectionHeader: {
//     paddingHorizontal: moderateScale(16),
//     paddingTop: verticalScale(8),
//     paddingBottom: verticalScale(4),
//   },
//   sectionTitle: {
//     fontSize: moderateScale(13),
//     fontWeight: '600',
//     color: Colors.gray,
//     textTransform: 'uppercase',
//   },
//   chatList: { paddingBottom: verticalScale(20) },
//   chatItem: {
//     flexDirection: 'row',
//     padding: moderateScale(14),
//     backgroundColor: Colors.white,
//     marginHorizontal: moderateScale(16),
//     marginBottom: verticalScale(8),
//     borderRadius: moderateScale(12),
//     elevation: 2,
//     shadowColor: Colors.black,
//     shadowOffset: { width: 0, height: verticalScale(1) },
//     shadowOpacity: 0.08,
//     shadowRadius: moderateScale(3),
//   },
//   avatarContainer: { position: 'relative' },
//   avatar: {
//     width: moderateScale(52),
//     height: moderateScale(52),
//     borderRadius: moderateScale(26),
//     backgroundColor: Colors.primary,
//     justifyContent: 'center',
//     alignItems: 'center',
//     overflow: 'hidden',
//   },
//   avatarImage: { width: '100%', height: '100%', borderRadius: moderateScale(26) },
//   avatarPlaceholder: { width: '100%', height: '100%', justifyContent: 'center', alignItems: 'center' },
//   avatarText: { fontSize: moderateScale(20), fontWeight: '600', color: Colors.white },
//   onlineIndicator: {
//     position: 'absolute',
//     bottom: verticalScale(2),
//     right: moderateScale(2),
//     width: moderateScale(14),
//     height: moderateScale(14),
//     borderRadius: moderateScale(7),
//     backgroundColor: '#10B981',
//     borderWidth: moderateScale(2.5),
//     borderColor: Colors.white,
//   },
//   chatContent: { flex: 1, marginLeft: moderateScale(12), justifyContent: 'center' },
//   chatHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: verticalScale(4) },
//   nameRow: { flexDirection: 'row', alignItems: 'center', flex: 1, marginRight: moderateScale(8) },
//   chatName: { fontSize: moderateScale(16), fontWeight: '600', color: Colors.dark, flexShrink: 1 },
//   pinIcon: { marginLeft: moderateScale(6) },
//   timestamp: { fontSize: moderateScale(11), color: Colors.gray },
//   messageRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
//   messageContent: { flex: 1 },
//   lastMessageRow: { flexDirection: 'row', alignItems: 'center' },
//   voiceIcon: { marginRight: moderateScale(5) },
//   lastMessage: { fontSize: moderateScale(14), color: Colors.gray, flex: 1 },
//   unreadMessage: { color: Colors.dark, fontWeight: '600' },
//   unreadBadge: {
//     backgroundColor: Colors.secondary,
//     borderRadius: moderateScale(10),
//     minWidth: moderateScale(22),
//     height: moderateScale(22),
//     justifyContent: 'center',
//     alignItems: 'center',
//     paddingHorizontal: moderateScale(6),
//     marginLeft: moderateScale(8),
//   },
//   unreadCount: { fontSize: moderateScale(11), color: Colors.white, fontWeight: '700' },
//   loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
//   reloadButton: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     justifyContent: 'center',
//     backgroundColor: Colors.primary,
//     paddingHorizontal: moderateScale(24),
//     paddingVertical: verticalScale(12),
//     borderRadius: moderateScale(25),
//     marginTop: verticalScale(24),
//   },
//   reloadButtonText: { fontSize: moderateScale(16), color: Colors.white, fontWeight: '600', marginLeft: moderateScale(8) },
//   emptyContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingHorizontal: moderateScale(40) },
//   emptyText: { fontSize: moderateScale(20), fontWeight: '600', color: Colors.dark, marginTop: verticalScale(16), marginBottom: verticalScale(8) },
//   emptySubtext: { fontSize: moderateScale(14), color: Colors.gray, textAlign: 'center' },
//   blockedBadge: {
//   backgroundColor: '#FEE2E2',
//   paddingHorizontal: moderateScale(8),
//   paddingVertical: verticalScale(2),
//   borderRadius: moderateScale(10),
//   marginLeft: moderateScale(6),
// },

// blockedText: {
//   color: '#DC2626',
//   fontSize: moderateScale(10),
//   fontWeight: '600',
// },
// selectedChatItem: {
//   backgroundColor: '#E3F2FD',
// },
// });

// export default ChatListScreen;
import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TextInput,
  TouchableOpacity,
  StatusBar,
  RefreshControl,
  Dimensions,
  Platform,
  ActivityIndicator,
  Image,
  Modal,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/Ionicons';
import { Colors } from '../constants/Colors';
import { useFocusEffect } from '@react-navigation/native';
import CommonHeader from '../components/CommonHeader';
import { useAuth } from '../context/AuthContext';
import { scale, verticalScale, moderateScale } from 'react-native-size-matters';
import LottieView from "lottie-react-native";
import CustomAlert from '../components/CustomAlert';
import AsyncStorage from '@react-native-async-storage/async-storage';
import ChatService from '../services/ChatService';
import { SvgCssUri } from "react-native-svg/css";
const { width, height } = Dimensions.get('window');

const ChatListScreen = ({ navigation }) => {
  const { user, isGuest } = useAuth();

  const [alertVisible, setAlertVisible] = useState(false);
  const [alertConfig, setAlertConfig] = useState({
    title: "",
    message: "",
    icon: "check-circle",
    iconColor: "#10B981",
    buttons: []
  });

  // Image preview modal state
  const [imagePreviewVisible, setImagePreviewVisible] = useState(false);
  const [previewImageUrl, setPreviewImageUrl] = useState(null);
  const [previewUser, setPreviewUser] = useState(null);
  const [previewImageIsSvg, setPreviewImageIsSvg] = useState(false);

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

  useEffect(() => {
    if (isGuest) {
      showCustomAlert(
        'Login Required',
        'Please complete login to access chats.',
        'warning'
      );
    }
  }, [isGuest]);

  const [searchQuery, setSearchQuery] = useState('');
  const [chats, setChats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [isReloading, setIsReloading] = useState(false);
  const [blockedUsers, setBlockedUsers] = useState([]);
  const [avatarRefreshKey, setAvatarRefreshKey] = useState(0);
  const [selectedChats, setSelectedChats] = useState([]);
  const [selectionMode, setSelectionMode] = useState(false);
  
  useFocusEffect(
    useCallback(() => {
      setAvatarRefreshKey(prev => prev + 1);
      loadBlockedUsers();
      loadConversations();
    }, [])
  );

  const loadBlockedUsers = async () => {
    try {
      const blocked = await AsyncStorage.getItem('blocked_users');
      if (blocked) {
        setBlockedUsers(JSON.parse(blocked));
      }
    } catch (error) {
      console.error('Load blocked users error:', error);
    }
  };

  const loadConversations = async (showReloadIndicator = false) => {
    try {
      if (showReloadIndicator) {
        setIsReloading(true);
      } else {
        setLoading(true);
      }

      const myPhone = user?.phone_number;
      if (!myPhone || myPhone === 'guest_mode') {
        setLoading(false);
        return;
      }

      const blockedResult = await ChatService.getBlockedUsers(myPhone);
      let backendBlockedList = [];
      if (blockedResult.success) {
        backendBlockedList = blockedResult.blocked_users.map(u => u.phone);
      }
      
      const localBlocked = await AsyncStorage.getItem('blocked_users');
      const localBlockedList = localBlocked ? JSON.parse(localBlocked) : [];
      
      const allBlocked = [...new Set([...backendBlockedList, ...localBlockedList])];
      setBlockedUsers(allBlocked);

      const result = await ChatService.getConversations(myPhone);

      if (result.success) {
        const transformedChats = result.conversations.map(conv => ({
          id: conv.id.toString(),
          name: conv.other_user.name,
          lastMessage: conv.last_message || 'No messages yet',
          timestamp: formatTimestamp(conv.last_message_time),
          unreadCount: conv.unread_count || 0,
          isOnline: false,
          avatar: conv.other_user.avatar,
          isPinned: false,
          isVoiceMessage: conv.last_message_type === 'voice',
          conversationId: conv.id,
          otherUserId: conv.other_user.id,
          otherUserPhone: conv.other_user.phone,
          isBlocked: allBlocked.includes(conv.other_user.phone),
        }));

        setChats(transformedChats);
      }
    } catch (error) {
      console.error('Load conversations error:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
      setIsReloading(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    loadConversations();
  };

  const handleReload = () => {
    loadConversations(true);
  };

  const formatTimestamp = (timestamp) => {
    if (!timestamp) return '';

    const date = new Date(timestamp);
    const now = new Date();
    const diffInMs = now - date;
    const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));

    if (diffInDays === 0) {
      return date.toLocaleTimeString('en-IN', {
        hour: '2-digit',
        minute: '2-digit',
      });
    } else if (diffInDays === 1) {
      return 'Yesterday';
    } else if (diffInDays < 7) {
      return date.toLocaleDateString('en-IN', { weekday: 'short' });
    } else {
      return date.toLocaleDateString('en-IN', {
        day: 'numeric',
        month: 'short',
      });
    }
  };

  const filteredChats = chats.filter(chat =>
    chat.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const pinnedChats = filteredChats.filter(chat => chat.isPinned);
  const regularChats = filteredChats.filter(chat => !chat.isPinned);

  const handleChatPress = (chat) => {
    console.log('Opening chat with:', {
      name: chat.name,
      phone: chat.otherUserPhone,
      conversationId: chat.conversationId
    });
    
    navigation.navigate('ChatScreen', {
      user: {
        id: chat.otherUserId,
        name: chat.name,
        phone_number: chat.otherUserPhone,
        profile_picture: chat.avatar,
      },
      conversationId: chat.conversationId,
      receiverPhone: chat.otherUserPhone,
    });
  };

  const handleLongPressChat = (chatId) => {
    setSelectionMode(true);
    setSelectedChats([chatId]);
  };

  const handleSelectChat = (chatId) => {
    if (!selectionMode) return;

    if (selectedChats.includes(chatId)) {
      const updated = selectedChats.filter(id => id !== chatId);
      setSelectedChats(updated);
      if (updated.length === 0) {
        setSelectionMode(false);
      }
    } else {
      setSelectedChats([...selectedChats, chatId]);
    }
  };

  const handleDeleteSelected = async () => {
    try {
      const myPhone = user?.phone_number;

      for (const chatId of selectedChats) {
        const selectedChat = chats.find(c => c.id === chatId);
        if (selectedChat?.conversationId) {
          const result = await ChatService.hideChat(
            selectedChat.conversationId,
            myPhone
          );
          console.log('DELETE RESULT:', result);
        }
      }

      const updatedChats = chats.filter(
        chat => !selectedChats.includes(chat.id)
      );
      setChats(updatedChats);
      setSelectedChats([]);
      setSelectionMode(false);
    } catch (error) {
      console.error('Delete selected chats error:', error);
    }
  };

  // Handle avatar press - open modal
  const handleAvatarPress = (item) => {
    console.log('Avatar pressed for:', item.name);
    if (item.avatar) {
      const isSvg = item.avatar.toLowerCase().includes('.svg');
      setPreviewImageIsSvg(isSvg);
      setPreviewImageUrl(item.avatar);
      setPreviewUser(item);
      setImagePreviewVisible(true);
    } else {
      setPreviewImageIsSvg(false);
      setPreviewImageUrl(null);
      setPreviewUser(item);
      setImagePreviewVisible(true);
    }
  };

  // Handle view profile navigation - pass phone number as is
  const handleViewProfile = () => {
    if (previewUser) {
      setImagePreviewVisible(false);
      
      // Pass the phone number as is (with + sign if present)
      const phoneNumber = previewUser.otherUserPhone;
      
      console.log('Navigating to profile with phone:', phoneNumber);
      
      navigation.navigate('ViewProfileScreen', {
        phoneNumber: phoneNumber,
        driverName: previewUser.name,
      });
    }
  };

  // Render avatar with touch handler
  const renderAvatar = (item) => {
    const avatarContent = item.avatar ? (
      item.avatar.toLowerCase().includes('.svg') ? (
        <SvgCssUri
          key={`${item.avatar}-${avatarRefreshKey}`}
          width="100%"
          height="100%"
          uri={item.avatar}
        />
      ) : (
        <Image
          source={{ uri: item.avatar }}
          style={styles.avatarImage}
        />
      )
    ) : (
      <View style={styles.avatarPlaceholder}>
        <Text style={styles.avatarText}>
          {item.name?.charAt(0) || 'U'}
        </Text>
      </View>
    );

    return (
      <TouchableOpacity 
        style={styles.avatar} 
        onPress={() => handleAvatarPress(item)}
        activeOpacity={0.8}
      >
        {avatarContent}
      </TouchableOpacity>
    );
  };

  const renderChatItem = ({ item }) => (
    <TouchableOpacity
      style={[
        styles.chatItem,
        selectedChats.includes(item.id) && styles.selectedChatItem,
      ]}
      activeOpacity={0.7}
      onLongPress={() => handleLongPressChat(item.id)}
      onPress={() => {
        if (selectionMode) {
          handleSelectChat(item.id);
        } else {
          handleChatPress(item);
        }
      }}>
      
      <View style={styles.avatarContainer}>
        {renderAvatar(item)}
        {item.isOnline && <View style={styles.onlineIndicator} />}
      </View>

      <View style={styles.chatContent}>
        <View style={styles.chatHeader}>
          <View style={styles.nameRow}>
            <Text style={styles.chatName} numberOfLines={1}>
              {item.name}
            </Text>
            {item.isBlocked && (
              <View style={styles.blockedBadge}>
                <Text style={styles.blockedText}>Blocked</Text>
              </View>
            )}
            {item.isPinned && (
              <Icon 
                name="pin" 
                size={moderateScale(13)} 
                color={Colors.secondary} 
                style={styles.pinIcon} 
              />
            )}
          </View>
          <Text style={styles.timestamp}>{item.timestamp}</Text>
        </View>

        <View style={styles.messageRow}>
          <View style={styles.messageContent}>
            <View style={styles.lastMessageRow}>
              {item.isVoiceMessage && (
                <Icon 
                  name="mic" 
                  size={moderateScale(13)} 
                  color={Colors.gray} 
                  style={styles.voiceIcon} 
                />
              )}
              <Text
                style={[
                  styles.lastMessage,
                  item.unreadCount > 0 && styles.unreadMessage,
                ]}
                numberOfLines={1}>
                {item.lastMessage?.replace('🎤', '').trim() || 'No messages'}
              </Text>
            </View>
          </View>
          {item.unreadCount > 0 && (
            <View style={styles.unreadBadge}>
              <Text style={styles.unreadCount}>
                {item.unreadCount > 99 ? '99+' : item.unreadCount}
              </Text>
            </View>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );

  const renderEmptyState = () => (
    <View style={styles.emptyContainer}>
      <Icon 
        name="chatbubbles-outline" 
        size={moderateScale(100)} 
        color={Colors.primary} 
        style={{ opacity: 0.3 }}
      />
      <Text style={styles.emptyText}>No chats available</Text>
      <Text style={styles.emptySubtext}>
        Start a ride to connect with other users
      </Text>
      
      <TouchableOpacity 
        style={styles.reloadButton}
        onPress={handleReload}
        disabled={isReloading}>
        {isReloading ? (
          <ActivityIndicator size="small" color={Colors.white} />
        ) : (
          <>
            <Icon name="refresh" size={moderateScale(18)} color={Colors.white} />
            <Text style={styles.reloadButtonText}>Reload</Text>
          </>
        )}
      </TouchableOpacity>
    </View>
  );

  const renderSectionHeader = title => (
    <View style={styles.sectionHeader}>
      <Text style={styles.sectionTitle}>{title}</Text>
    </View>
  );

  // Image Preview Modal Component with View Profile button
  const ImagePreviewModal = () => (
    <Modal
      visible={imagePreviewVisible}
      transparent={true}
      animationType="fade"
      onRequestClose={() => setImagePreviewVisible(false)}
    >
      <TouchableOpacity 
        style={styles.modalBackdrop}
        activeOpacity={1}
        onPress={() => setImagePreviewVisible(false)}
      >
        <View style={styles.imageModalContainer}>
          <View style={styles.imageModalContent}>
            <View style={styles.imageModalHeader}>
              <Text style={styles.imageModalTitle}>
                {previewUser?.name || 'Profile Photo'}
              </Text>
              <TouchableOpacity onPress={() => setImagePreviewVisible(false)}>
                <Icon name="close" size={24} color={Colors.dark} />
              </TouchableOpacity>
            </View>
            
            <View style={styles.imageContainer}>
              {previewImageUrl && previewImageUrl !== 'null' && previewImageUrl !== 'undefined' ? (
                previewImageIsSvg ? (
                  <View style={styles.modalSvgContainer}>
                    <SvgCssUri
                      uri={previewImageUrl}
                      width={width * 0.8}
                      height={height * 0.5}
                      onError={(e) => console.log('Modal SVG load error:', e)}
                    />
                  </View>
                ) : (
                  <Image
                    source={{ uri: previewImageUrl }}
                    style={styles.fullProfileImage}
                    resizeMode="contain"
                    onError={(e) => console.log('Modal Image load error:', e.nativeEvent.error)}
                  />
                )
              ) : (
                <View style={styles.noImageContainer}>
                  <Icon name="person-outline" size={64} color={Colors.gray} />
                  <Text style={styles.noImageText}>No profile picture available</Text>
                </View>
              )}
            </View>

            {/* View Profile Button */}
            <TouchableOpacity 
              style={styles.viewProfileButton}
              onPress={handleViewProfile}
              activeOpacity={0.8}
            >
              <Icon name="person-outline" size={20} color={Colors.white} />
              <Text style={styles.viewProfileButtonText}>View Full Profile</Text>
            </TouchableOpacity>
          </View>
        </View>
      </TouchableOpacity>
    </Modal>
  );

  if (loading && chats.length === 0) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="dark-content" backgroundColor={Colors.white} />
        <CommonHeader
          title={selectionMode ? `${selectedChats.length} Selected` : "Chats"}
          showBackButton={true}
          rightIcon={selectionMode ? "trash" : null}
          rightIconColor="#FF8800"
          onRightPress={selectionMode ? handleDeleteSelected : handleReload}
        />
        <View style={styles.loadingContainer}>
          <LottieView
            source={require("../assets/loading.json")}
            autoPlay
            loop
            style={{
              width: width * 0.55,
              height: width * 0.55,
            }}
          />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={Colors.white} />

      <CommonHeader
        title={selectionMode ? `${selectedChats.length} Selected` : "Chats"}
        showBack={true}
        rightIcon={selectionMode ? "delete-outline" : null}
        rightIconColor="#FF8800"
        onRightPress={() => {
          setAlertConfig({
            title: "Delete Chats",
            message: `Delete ${selectedChats.length} selected chat(s)?`,
            icon: "warning",
            iconColor: "#F59E0B",
            buttons: [
              {
                text: "Cancel",
                onPress: () => setAlertVisible(false),
              },
              {
                text: "Delete",
                onPress: async () => {
                  setAlertVisible(false);
                  await handleDeleteSelected();
                },
              },
            ],
          });
          setAlertVisible(true);
        }}
      />

      {isReloading && (
        <View style={styles.reloadingHeader}>
          <ActivityIndicator size="small" color={Colors.primary} />
          <Text style={styles.reloadingText}>Refreshing...</Text>
        </View>
      )}

      <View style={styles.searchContainer}>
        <Icon 
          name="search-outline" 
          size={moderateScale(20)} 
          color={Colors.secondary} 
          style={styles.searchIcon} 
        />
        <TextInput
          style={styles.searchInput}
          placeholder="Search chats..."
          placeholderTextColor={Colors.gray}
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
        {searchQuery.length > 0 && (
          <TouchableOpacity onPress={() => setSearchQuery('')}>
            <Icon name="close-circle" size={moderateScale(18)} color={Colors.gray} />
          </TouchableOpacity>
        )}
      </View>

      {filteredChats.length === 0 ? (
        renderEmptyState()
      ) : (
        <FlatList
          data={[...pinnedChats, ...regularChats]}
          renderItem={renderChatItem}
          keyExtractor={item => item.id}
          contentContainerStyle={styles.chatList}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor={Colors.primary}
              colors={[Colors.primary]}
            />
          }
          ListHeaderComponent={
            pinnedChats.length > 0 ? renderSectionHeader('Pinned') : null
          }
        />
      )}

      {/* Image Preview Modal */}
      <ImagePreviewModal />

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
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.white },
  reloadingHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.primary + '10',
    paddingVertical: verticalScale(8),
    marginHorizontal: moderateScale(16),
    marginTop: verticalScale(8),
    borderRadius: moderateScale(8),
  },
  reloadingText: {
    fontSize: moderateScale(14),
    color: Colors.primary,
    marginLeft: moderateScale(8),
    fontWeight: '500',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.white,
    marginHorizontal: moderateScale(16),
    marginVertical: verticalScale(12),
    paddingHorizontal: moderateScale(14),
    paddingVertical: Platform.OS === 'ios' ? verticalScale(8) : 0,
    borderRadius: moderateScale(12),
    borderWidth: 1,
    borderColor: '#E0E0E0',
    elevation: 2,
  },
  searchIcon: { marginRight: moderateScale(10) },
  searchInput: {
    flex: 1,
    fontSize: moderateScale(16),
    color: Colors.dark,
    paddingVertical: Platform.OS === 'ios' ? verticalScale(12) : verticalScale(8),
  },
  sectionHeader: {
    paddingHorizontal: moderateScale(16),
    paddingTop: verticalScale(8),
    paddingBottom: verticalScale(4),
  },
  sectionTitle: {
    fontSize: moderateScale(13),
    fontWeight: '600',
    color: Colors.gray,
    textTransform: 'uppercase',
  },
  chatList: { paddingBottom: verticalScale(20) },
  chatItem: {
    flexDirection: 'row',
    padding: moderateScale(14),
    backgroundColor: Colors.white,
    marginHorizontal: moderateScale(16),
    marginBottom: verticalScale(8),
    borderRadius: moderateScale(12),
    elevation: 2,
    shadowColor: Colors.black,
    shadowOffset: { width: 0, height: verticalScale(1) },
    shadowOpacity: 0.08,
    shadowRadius: moderateScale(3),
  },
  avatarContainer: { 
    position: 'relative',
    width: moderateScale(52),
    height: moderateScale(52),
  },
  avatar: {
    width: '100%',
    height: '100%',
    borderRadius: moderateScale(26),
    backgroundColor: Colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  avatarImage: { 
    width: '100%', 
    height: '100%', 
    borderRadius: moderateScale(26) 
  },
  avatarPlaceholder: { 
    width: '100%', 
    height: '100%', 
    justifyContent: 'center', 
    alignItems: 'center' 
  },
  avatarText: { 
    fontSize: moderateScale(20), 
    fontWeight: '600', 
    color: Colors.white 
  },
  onlineIndicator: {
    position: 'absolute',
    bottom: verticalScale(2),
    right: moderateScale(2),
    width: moderateScale(14),
    height: moderateScale(14),
    borderRadius: moderateScale(7),
    backgroundColor: '#10B981',
    borderWidth: moderateScale(2.5),
    borderColor: Colors.white,
  },
  chatContent: { flex: 1, marginLeft: moderateScale(12), justifyContent: 'center' },
  chatHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: verticalScale(4) },
  nameRow: { flexDirection: 'row', alignItems: 'center', flex: 1, marginRight: moderateScale(8) },
  chatName: { fontSize: moderateScale(16), fontWeight: '600', color: Colors.dark, flexShrink: 1 },
  pinIcon: { marginLeft: moderateScale(6) },
  timestamp: { fontSize: moderateScale(11), color: Colors.gray },
  messageRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  messageContent: { flex: 1 },
  lastMessageRow: { flexDirection: 'row', alignItems: 'center' },
  voiceIcon: { marginRight: moderateScale(5) },
  lastMessage: { fontSize: moderateScale(14), color: Colors.gray, flex: 1 },
  unreadMessage: { color: Colors.dark, fontWeight: '600' },
  unreadBadge: {
    backgroundColor: Colors.secondary,
    borderRadius: moderateScale(10),
    minWidth: moderateScale(22),
    height: moderateScale(22),
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: moderateScale(6),
    marginLeft: moderateScale(8),
  },
  unreadCount: { fontSize: moderateScale(11), color: Colors.white, fontWeight: '700' },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  reloadButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.primary,
    paddingHorizontal: moderateScale(24),
    paddingVertical: verticalScale(12),
    borderRadius: moderateScale(25),
    marginTop: verticalScale(24),
  },
  reloadButtonText: { fontSize: moderateScale(16), color: Colors.white, fontWeight: '600', marginLeft: moderateScale(8) },
  emptyContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingHorizontal: moderateScale(40) },
  emptyText: { fontSize: moderateScale(20), fontWeight: '600', color: Colors.dark, marginTop: verticalScale(16), marginBottom: verticalScale(8) },
  emptySubtext: { fontSize: moderateScale(14), color: Colors.gray, textAlign: 'center' },
  blockedBadge: {
    backgroundColor: '#FEE2E2',
    paddingHorizontal: moderateScale(8),
    paddingVertical: verticalScale(2),
    borderRadius: moderateScale(10),
    marginLeft: moderateScale(6),
  },
  blockedText: {
    color: '#DC2626',
    fontSize: moderateScale(10),
    fontWeight: '600',
  },
  selectedChatItem: {
    backgroundColor: '#E3F2FD',
  },
  // Modal styles
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.9)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  imageModalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
  },
  imageModalContent: {
    width: '90%',
    backgroundColor: Colors.white,
    borderRadius: 20,
    overflow: 'hidden',
    maxHeight: '80%',
  },
  imageModalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#EEF2F7',
  },
  imageModalTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.dark,
  },
  imageContainer: {
    width: '100%',
    minHeight: 300,
    backgroundColor: '#F5F5F5',
    alignItems: 'center',
    justifyContent: 'center',
  },
  fullProfileImage: {
    width: '100%',
    height: 400,
    backgroundColor: '#F5F5F5',
  },
  modalSvgContainer: {
    width: '100%',
    height: 400,
    backgroundColor: '#F5F5F5',
    alignItems: 'center',
    justifyContent: 'center',
  },
  noImageContainer: {
    width: '100%',
    height: 400,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F5F5F5',
  },
  noImageText: {
    fontSize: 16,
    color: Colors.gray,
    marginTop: 12,
  },
  viewProfileButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: Colors.primary,
    paddingVertical: 14,
    margin: 16,
    borderRadius: 12,
  },
  viewProfileButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.white,
  },
});

export default ChatListScreen;