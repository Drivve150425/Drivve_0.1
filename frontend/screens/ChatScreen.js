// import React, { useEffect, useState, useRef } from 'react';
// import {
//   View,
//   Text,
//   StyleSheet,
//   FlatList,
//   TextInput,
//   TouchableOpacity,
//   KeyboardAvoidingView,
//   Platform,
//   Dimensions,
//   Modal,
//   Animated,
//   StatusBar,
//   ActivityIndicator,
//   Linking,
//   Image,
// } from 'react-native';
// import Icon from 'react-native-vector-icons/Ionicons';
// import io from 'socket.io-client';
// import { Colors } from '../constants/Colors';
// import { useSafeAreaInsets } from 'react-native-safe-area-context';
// import { API_BASE_URL } from "../config/config_ip";
// import { useAuth } from '../context/AuthContext';
// import LottieView from "lottie-react-native";
// import CustomAlert from '../components/CustomAlert';
// import AsyncStorage from '@react-native-async-storage/async-storage';
// import * as Speech from 'expo-speech';
// import ChatService from '../services/ChatService';
// import { Audio } from 'expo-av';
// import { SvgCssUri } from "react-native-svg/css";
// // TOP IMPORTS FOR ChatScreen.js

// import {
//   width,
//   height,
//   w,
//   h,
//   m,
//   font,
//   spacing,
//   radius,
//   wp,
//   hp,
  
// } from '../utils/responsive';


// const ChatScreen = ({ route, navigation }) => {
//   const { user: currentUser } = useAuth();
//   const insets = useSafeAreaInsets();
//   const { user, conversationId: passedConversationId, receiverPhone, rideId } = route.params || {};

//   const myPhone = currentUser?.phone_number;
//   const conversationId = passedConversationId || rideId || null;
//   const [recordingInstance, setRecordingInstance] = useState(null);
//   const partnerPhoneRef = useRef(null);
//   const [avatarRefreshKey, setAvatarRefreshKey] = useState(0);
  
//   const getPartnerPhone = () => {
//     if (receiverPhone && receiverPhone !== myPhone) return receiverPhone;
//     if (user?.phone_number && user.phone_number !== myPhone) return user.phone_number;
//     if (user?.id && user.id !== myPhone) return user.id;
//     return null;
//   };
  
//   const [chatPartnerPhone, setChatPartnerPhone] = useState(getPartnerPhone);
//   const [isBlocked, setIsBlocked] = useState(false);
  
//   useEffect(() => {
//     if (chatPartnerPhone) {
//       partnerPhoneRef.current = chatPartnerPhone;
//     }
//   }, [chatPartnerPhone]);
  
//   const chatPartner = user || {
//     name: receiverPhone ? `User ${String(receiverPhone).slice(-4)}` : 'Unknown',
//     tripInfo: 'Active',
//     phone_number: chatPartnerPhone,
//     profile_picture: user?.profile_picture || null,
//   };
  
//   useEffect(() => {
//     setAvatarRefreshKey(prev => prev + 1);
//   }, []);
  
//   const [messages, setMessages] = useState([]);
//   const [input, setInput] = useState('');
//   const [recording, setRecording] = useState(false);
//   const [typing, setTyping] = useState(false);
//   const [loading, setLoading] = useState(true);
//   const [sending, setSending] = useState(false);
//   const [showOptionsModal, setShowOptionsModal] = useState(false);
//   const [showMessageOptionsModal, setShowMessageOptionsModal] = useState(false);
//   const [selectedMessage, setSelectedMessage] = useState(null);
//   const [isPlayingVoice, setIsPlayingVoice] = useState(false);
//   const [currentPlayingId, setCurrentPlayingId] = useState(null);
//   const [recordingTimer, setRecordingTimer] = useState(0);
//   const [backLoading, setBackLoading] = useState(false);
//   const [alertVisible, setAlertVisible] = useState(false);
//   const [alertConfig, setAlertConfig] = useState({
//     title: "",
//     message: "",
//     icon: "check-circle",
//     iconColor: "#10B981",
//     buttons: []
//   });

//   const socketRef = useRef(null);
//   const flatListRef = useRef(null);
//   const typingTimeoutRef = useRef(null);
//   const inputRef = useRef(null);
//   const recordingIntervalRef = useRef(null);

//   const optionsModalScale = useRef(new Animated.Value(0.8)).current;
//   const optionsModalFade = useRef(new Animated.Value(0)).current;
//   const messageModalScale = useRef(new Animated.Value(0.8)).current;
//   const messageModalFade = useRef(new Animated.Value(0)).current;

//   const showAlert = (title, message, type = 'success') => {
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

//   const showConfirmationAlert = (title, message, onConfirm, confirmText = 'Confirm') => {
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

//   useEffect(() => {
//     navigation.setOptions({ headerShown: false });
//     checkIfBlocked();
//     initializeChat();
//     return () => {
//       if (socketRef.current) socketRef.current.disconnect();
//       Speech.stop();
//       if (recordingIntervalRef.current) clearInterval(recordingIntervalRef.current);
//     };
//   }, []);

//   useEffect(() => {
//     const markSeen = async () => {
//       if (messages.length > 0 && !loading && myPhone && !isBlocked) {
//         const unseenMessages = messages
//           .filter(msg => !msg.from_me && msg.status !== 'seen')
//           .map(msg => msg.id);
        
//         if (unseenMessages.length > 0) {
//           await ChatService.markMessagesAsRead(conversationId, myPhone, unseenMessages);
          
//           setMessages(prev => prev.map(msg => 
//             unseenMessages.includes(msg.id) ? { ...msg, status: 'seen' } : msg
//           ));
          
//           if (socketRef.current?.connected) {
//             socketRef.current.emit('mark_seen', { 
//               conversation_id: conversationId, 
//               message_ids: unseenMessages 
//             });
//           }
//         }
//       }
//     };
//     markSeen();
//   }, [messages, loading, isBlocked]);

//   useEffect(() => {
//     setTimeout(() => flatListRef.current?.scrollToEnd({ animated: true }), 100);
//   }, [messages]);

//   const animateModalIn = (scaleAnim, fadeAnim) => {
//     Animated.parallel([
//       Animated.spring(scaleAnim, { toValue: 1, tension: 50, friction: 7, useNativeDriver: true }),
//       Animated.timing(fadeAnim, { toValue: 1, duration: 200, useNativeDriver: true }),
//     ]).start();
//   };

//   const animateModalOut = (scaleAnim, fadeAnim, onClose) => {
//     Animated.parallel([
//       Animated.spring(scaleAnim, { toValue: 0.8, tension: 50, friction: 7, useNativeDriver: true }),
//       Animated.timing(fadeAnim, { toValue: 0, duration: 200, useNativeDriver: true }),
//     ]).start(() => {
//       if (onClose) onClose();
//     });
//   };

//   const initializeChat = async () => {
//     if (!myPhone) {
//       showAlert('Login Required', 'Please log in to use chat.', 'warning');
//       setLoading(false);
//       return;
//     }
//     if (isBlocked) {
//       setLoading(false);
//       return;
//     }
//     try {
//       await loadMessages();
//       connectSocket();
//     } catch (error) {
//       console.error('Initialize chat error:', error);
//     } finally {
//       setLoading(false);
//     }
//   };

//   const loadMessages = async () => {
//     try {
//       if (!conversationId) return false;
//       const result = await ChatService.getMessages(conversationId, myPhone);
//       if (result.success && result.messages) {
//         setMessages(result.messages);
//         await AsyncStorage.setItem(`chat_${conversationId}`, JSON.stringify(result.messages));
//         return true;
//       }
//       return false;
//     } catch (error) {
//       const localMessages = await AsyncStorage.getItem(`chat_${conversationId}`);
//       if (localMessages) setMessages(JSON.parse(localMessages));
//       return false;
//     }
//   };

//   const connectSocket = () => {
//     if (isBlocked) return;
    
//     socketRef.current = io(API_BASE_URL, {
//       transports: ['websocket'],
//       auth: { phone_number: myPhone },
//       reconnection: true, 
//       reconnectionDelay: 1000, 
//       reconnectionAttempts: 3
//     });

//     socketRef.current.on('connected', (data) => {
//       console.log('Socket connected');
//       if (conversationId) {
//         socketRef.current.emit('join_conversation', { conversation_id: conversationId });
//       }
//     });

//    socketRef.current.on('new_message', async (msg) => {

//   // DONT SHOW IF BLOCKED
//   const blockedUsers = await AsyncStorage.getItem('blocked_users');

//   const blockedList = blockedUsers
//     ? JSON.parse(blockedUsers)
//     : [];

//   const senderPhone =
//     msg.sender_phone ||
//     msg.sender_id;

//   if (blockedList.includes(senderPhone)) {
//     console.log('BLOCKED MESSAGE HIDDEN');
//     return;
//   }

//   setMessages(prev => {

//     const exists = prev.some(m => m.id === msg.id);

//     if (exists) return prev;

//     const newMessages = [
//       ...prev,
//       {
//         ...msg,
//         from_me: msg.sender_id === myPhone
//       }
//     ];

//     AsyncStorage.setItem(
//       `chat_${conversationId}`,
//       JSON.stringify(newMessages)
//     );

//     return newMessages;
//   });

//   if (msg.sender_id !== myPhone) {

//     ChatService.markMessagesAsRead(
//       conversationId,
//       myPhone,
//       [msg.id]
//     );
//   }

// });
//   };

//   const sendMessage = async (type = 'text') => {
//     if (isBlocked) {
//       showAlert('Blocked', `You have blocked ${chatPartner.name}.`, 'warning');
//       return;
//     }
//     if (!input.trim() && type === 'text') return;
//     if (!conversationId) {
//       showAlert('Error', 'No conversation found.', 'error');
//       return;
//     }
    
//     setSending(true);
//     const messageText = type === 'text' ? input.trim() : '🎤 Voice message';
    
//     const tempMessage = {
//       id: Date.now(), 
//       conversation_id: conversationId,
//       sender_id: myPhone,
//       sender_phone: myPhone,
//       text: messageText,
//       type: type,
//       from_me: true, 
//       status: 'sent', 
//       created_at: new Date().toISOString(), 
//     };
    
//     setMessages(prev => {
//       const newMessages = [...prev, tempMessage];
//       AsyncStorage.setItem(`chat_${conversationId}`, JSON.stringify(newMessages));
//       return newMessages;
//     });
//     setInput('');
    
//     const result = await ChatService.sendMessage(conversationId, myPhone, messageText, type);
    
//     if (result.success && socketRef.current?.connected) {
//       setMessages(prev => {
//         const updated = prev.map(m => 
//           m.id === tempMessage.id ? { ...result.message, from_me: true } : m
//         );
//         AsyncStorage.setItem(`chat_${conversationId}`, JSON.stringify(updated));
//         return updated;
//       });
//     }
    
//     setSending(false);
//   };

//   const handleTyping = (text) => {
//     setInput(text);
//     if (socketRef.current?.connected && conversationId && !isBlocked) {
//       socketRef.current.emit('typing', { conversation_id: conversationId, typing: true });
//       if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
//       typingTimeoutRef.current = setTimeout(() => {
//         socketRef.current?.emit('typing', { conversation_id: conversationId, typing: false });
//       }, 2000);
//     }
//   };

//   const startVoiceRecording = async () => {
//     try {
//       const permission = await Audio.requestPermissionsAsync();
//       if (!permission.granted) {
//         showAlert('Permission Required', 'Microphone permission denied', 'error');
//         return;
//       }

//       await Audio.setAudioModeAsync({
//         allowsRecordingIOS: true,
//         playsInSilentModeIOS: true,
//       });

//       const { recording } = await Audio.Recording.createAsync(
//         Audio.RecordingOptionsPresets.HIGH_QUALITY
//       );

//       setRecordingInstance(recording);
//       setRecording(true);
//       setRecordingTimer(0);

//       recordingIntervalRef.current = setInterval(() => {
//         setRecordingTimer(prev => prev + 1);
//       }, 1000);
//     } catch (error) {
//       console.log('Recording start error:', error);
//     }
//   };

//   const stopVoiceRecording = async () => {
//     try {
//       if (recordingIntervalRef.current) {
//         clearInterval(recordingIntervalRef.current);
//       }
//       setRecording(false);
//       if (!recordingInstance) return;
//       await recordingInstance.stopAndUnloadAsync();
//       const uri = recordingInstance.getURI();
//       console.log('VOICE URI:', uri);
//       sendVoiceMessage(uri);
//       setRecordingInstance(null);
//     } catch (error) {
//       console.log('Recording stop error:', error);
//     }
//   };

//   const sendVoiceMessage = async (audioUri) => {
//     const tempMessage = {
//       id: Date.now(),
//       type: 'voice',
//       audio: audioUri,
//       from_me: true,
//       created_at: new Date().toISOString(),
//       status: 'sent',
//     };
//     setMessages(prev => [...prev, tempMessage]);
//   };

//   const playVoiceMessage = async (message, messageId) => {
//     try {
//       Speech.stop();
//       let voiceText = message.voiceText || message.text;
//       voiceText = voiceText.replace(/[🎤"]/g, '').trim();
      
//       if (currentPlayingId === messageId && isPlayingVoice) {
//         Speech.stop();
//         setIsPlayingVoice(false);
//         setCurrentPlayingId(null);
//       } else {
//         setIsPlayingVoice(true);
//         setCurrentPlayingId(messageId);
//         Speech.speak(voiceText, {
//           language: 'en',
//           pitch: 1.0,
//           rate: 0.9,
//           onDone: () => {
//             setIsPlayingVoice(false);
//             setCurrentPlayingId(null);
//           },
//         });
//       }
//     } catch (error) {
//       console.error('Play voice error:', error);
//     }
//   };

//   const toggleRecording = () => {
//     if (!recording) startVoiceRecording();
//     else stopVoiceRecording();
//   };

//   const handleCall = () => {
//     const phoneNumber = chatPartnerPhone || user?.id;
//     if (!phoneNumber) {
//       showAlert('Call Failed', 'Phone number not available.', 'error');
//       return;
//     }
    
//     let cleanPhoneNumber = phoneNumber.toString().trim();
//     if (!cleanPhoneNumber.startsWith('+') && !cleanPhoneNumber.startsWith('0')) {
//       cleanPhoneNumber = '+91' + cleanPhoneNumber;
//     }
    
//     showConfirmationAlert('Call ' + chatPartner.name, `Call ${cleanPhoneNumber}?`, () => {
//       Linking.openURL(`tel:${cleanPhoneNumber}`).catch(() => 
//         showAlert('Call Failed', 'Unable to make call.', 'error'));
//     }, 'Call');
//   };

//   const checkIfBlocked = async () => {
//     try {
//       if (!chatPartnerPhone || myPhone === chatPartnerPhone) {
//         console.log('Same phone number or missing, skipping block check');
//         setIsBlocked(false);
//         return;
//       }
      
//       console.log('Checking if blocked - Partner:', chatPartnerPhone);
//       const result = await ChatService.isBlocked(myPhone, chatPartnerPhone);
//       console.log('Is blocked result:', result);
      
//       if (result.success) {
//         setIsBlocked(result.is_blocked);
//       }
//     } catch (error) {
//       console.error('Check blocked error:', error);
//     }
//   };

//   const handleBlock = async () => {
//     console.log('=== HANDLE BLOCK DEBUG ===');
//     console.log('myPhone:', myPhone);
//     console.log('chatPartnerPhone:', chatPartnerPhone);
    
//     if (!chatPartnerPhone || myPhone === chatPartnerPhone) {
//       showAlert('Error', 'Cannot block: Invalid user', 'error');
//       return;
//     }
    
//     setShowOptionsModal(false);
    
//     showConfirmationAlert(
//       'Block User', 
//       `Block ${chatPartner.name}? You won't receive messages from them.`, 
//       async () => {
//         try {
//           const result = await ChatService.blockUser(myPhone, chatPartnerPhone);
//           console.log('Block API result:', result);
          
//           if (result.success) {
//             const blockedUsers = await AsyncStorage.getItem('blocked_users');
//             const blockedList = blockedUsers ? JSON.parse(blockedUsers) : [];
//             if (!blockedList.includes(chatPartnerPhone)) {
//               blockedList.push(chatPartnerPhone);
//               await AsyncStorage.setItem('blocked_users', JSON.stringify(blockedList));
//             }
            
//             setIsBlocked(true);
//             showAlert('Blocked', `${chatPartner.name} has been blocked.`, 'warning');
            
//             if (socketRef.current) {
//               socketRef.current.disconnect();
//             }
            
//             setTimeout(() => navigation.goBack(), 1500);
//           } else {
//             showAlert('Error', result.message || 'Failed to block user', 'error');
//           }
//         } catch (error) {
//           console.error('Block error:', error);
//           showAlert('Error', 'Failed to block user', 'error');
//         }
//       },
//       'Block'
//     );
//   };

//   const handleUnblock = async () => {
//     setShowOptionsModal(false);
//     showConfirmationAlert(
//       'Unblock User',
//       `Unblock ${chatPartner.name}?`,
//       async () => {
//         try {
//           console.log('UNBLOCKING:', myPhone, chatPartnerPhone);
//           const result = await ChatService.unblockUser(myPhone, chatPartnerPhone);
//           console.log('UNBLOCK RESULT:', result);
//           if (result.success) {
//             const blockedUsers = await AsyncStorage.getItem('blocked_users');
//             const blockedList = blockedUsers ? JSON.parse(blockedUsers) : [];
//             const updatedList = blockedList.filter(phone => phone !== chatPartnerPhone);
//             await AsyncStorage.setItem('blocked_users', JSON.stringify(updatedList));
//             setIsBlocked(false);
//             connectSocket();
//             showAlert('Unblocked', `${chatPartner.name} has been unblocked.`, 'success');
//           } else {
//             showAlert('Error', result.message || 'Failed to unblock user', 'error');
//           }
//         } catch (error) {
//           console.error('Unblock error:', error);
//           showAlert('Error', 'Failed to unblock user', 'error');
//         }
//       },
//       'Unblock'
//     );
//   };

//   const handleReport = async () => {
//     setShowOptionsModal(false);
//     showConfirmationAlert('Report User', `Report ${chatPartner.name}?`, async () => {
//       const result = await ChatService.reportUser(myPhone, chatPartnerPhone, conversationId);
//       showAlert('Report Submitted', 'Thank you for reporting.', 'success');
//     }, 'Report');
//   };

//   const handleClearChat = async () => {
//     setShowOptionsModal(false);
//     showConfirmationAlert('Clear Chat', 'Delete all messages?', async () => {
//       await ChatService.clearChat(conversationId, myPhone);
//       setMessages([]);
//       await AsyncStorage.removeItem(`chat_${conversationId}`);
//       showAlert('Chat Cleared', 'All messages have been deleted.', 'success');
//     }, 'Clear');
//   };

//   const handleMessageDelete = async (message) => {
//     setShowMessageOptionsModal(false);
//     showConfirmationAlert('Delete Message', 'Delete this message?', async () => {
//       await ChatService.deleteMessage(message.id, myPhone);
//       setMessages(prev => {
//         const newMessages = prev.filter(m => m.id !== message.id);
//         AsyncStorage.setItem(`chat_${conversationId}`, JSON.stringify(newMessages));
//         return newMessages;
//       });
//       showAlert('Deleted', 'Message deleted', 'success');
//     }, 'Delete');
//   };

//   const handleMessageReport = async (message) => {
//     setShowMessageOptionsModal(false);
//     showConfirmationAlert('Report Message', 'Report this message?', async () => {
//       await ChatService.reportMessage(myPhone, message.id, conversationId);
//       showAlert('Report Submitted', 'Message reported.', 'success');
//     }, 'Report');
//   };

//   const showOptionsMenu = () => {
//     setShowOptionsModal(true);
//     animateModalIn(optionsModalScale, optionsModalFade);
//   };

//   const closeOptionsMenu = () => {
//     animateModalOut(optionsModalScale, optionsModalFade, () => setShowOptionsModal(false));
//   };

//   const handleLongPressMessage = (message) => {
//     setSelectedMessage(message);
//     setShowMessageOptionsModal(true);
//     animateModalIn(messageModalScale, messageModalFade);
//   };

//   const closeMessageOptionsMenu = () => {
//     animateModalOut(messageModalScale, messageModalFade, () => {
//       setShowMessageOptionsModal(false);
//       setSelectedMessage(null);
//     });
//   };

//   const renderStatusIcon = (status) => {
//     const iconSize = m(14);
//     if (status === 'sent') return <Icon name="checkmark" size={iconSize} color={Colors.gray} />;
//     if (status === 'delivered') return <Icon name="checkmark-done" size={iconSize} color={Colors.gray} />;
//     if (status === 'seen') return <Icon name="checkmark-done" size={iconSize} color={Colors.primary} />;
//     return null;
//   };

//   const formatTime = (timestamp) => {
//     if (!timestamp) return '';
//     const date = new Date(timestamp);
//     return date.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true }).toLowerCase().replace(' ', '');
//   };

//   const renderAvatar = () => {
//     if (chatPartner.profile_picture) {
//       const isSvg = chatPartner.profile_picture?.toLowerCase()?.includes('.svg');
//       if (isSvg) {
//         return (
//           <SvgCssUri
//             key={`${chatPartner.profile_picture}-${avatarRefreshKey}`}
//             width="100%"
//             height="100%"
//             uri={chatPartner.profile_picture}
//           />
//         );
//       }
//       return (
//         <Image
//           source={{ uri: chatPartner.profile_picture }}
//           style={styles.avatarImage}
//         />
//       );
//     }
//     return (
//       <View style={styles.avatarPlaceholder}>
//         <Text style={styles.avatarSmallText}>
//           {chatPartner.name?.charAt(0) || 'U'}
//         </Text>
//       </View>
//     );
//   };

//   const renderMessage = ({ item, index }) => {
//     const isMine = item.from_me;
//     const prev = messages[index - 1];
//     const showDateDivider = !prev || new Date(prev.created_at).toDateString() !== new Date(item.created_at).toDateString();
    
//     const messageDate = new Date(item.created_at);
//     const today = new Date();
//     const yesterday = new Date(today);
//     yesterday.setDate(yesterday.getDate() - 1);
//     let dateText = '';
//     if (messageDate.toDateString() === today.toDateString()) dateText = 'Today';
//     else if (messageDate.toDateString() === yesterday.toDateString()) dateText = 'Yesterday';
//     else dateText = messageDate.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });

//     const isVoice = item.type === 'voice' || item.text?.includes('🎤');
//     const isCurrentlyPlaying = currentPlayingId === item.id && isPlayingVoice;
//     let displayText = item.text;
//     if (isVoice && displayText) displayText = displayText.replace('🎤', '').trim();

//     return (
//       <View key={item.id}>
//         {showDateDivider && (
//           <View style={styles.dateDivider}>
//             <Text style={styles.dateDividerText}>{dateText}</Text>
//           </View>
//         )}
//         <View style={[styles.messageWrapper, isMine ? styles.messageWrapperRight : styles.messageWrapperLeft]}>
//           <TouchableOpacity 
//             activeOpacity={0.8} 
//             onLongPress={() => handleLongPressMessage(item)}
//             style={styles.messageTouchable}
//           >
//             <View style={[styles.bubble, isMine ? styles.bubbleRight : styles.bubbleLeft]}>
//               {isVoice ? (
//                 <View style={styles.voiceContainer}>
//                   <TouchableOpacity style={styles.playButton} onPress={() => playVoiceMessage(item, item.id)}>
//                     <Icon name={isCurrentlyPlaying ? 'pause' : 'volume-high'} size={m(18)} color={isMine ? Colors.white : Colors.primary} />
//                   </TouchableOpacity>
//                   <View style={styles.voiceInfo}>
//                     <View style={styles.waveformContainer}>
//                       {[...Array(12)].map((_, i) => (
//                         <View key={i} style={[styles.waveformBar, { height: Math.random() * verticalScale(12) + verticalScale(4), backgroundColor: isMine ? Colors.white : Colors.primary }]} />
//                       ))}
//                     </View>
//                     <Text style={[styles.voiceDuration, isMine && styles.voiceDurationMine]} numberOfLines={1}>
//                       {isCurrentlyPlaying ? 'Playing...' : displayText || 'Tap to play'}
//                     </Text>
//                   </View>
//                 </View>
//               ) : (
//                 <Text style={[styles.messageText, isMine && styles.messageTextMine]}>{item.text}</Text>
//               )}
//               <View style={[styles.metaContainer, isMine ? styles.metaContainerRight : styles.metaContainerLeft]}>
//                 <Text style={[styles.timeText, isMine && styles.timeTextMine]}>{formatTime(item.created_at)}</Text>
//                 {isMine && <View style={styles.statusIcon}>{renderStatusIcon(item.status)}</View>}
//               </View>
//             </View>
//           </TouchableOpacity>
//         </View>
//       </View>
//     );
//   };

//   if (loading) {
//     return (
//       <View style={styles.loaderContainer}>
//         <StatusBar backgroundColor={Colors.white} barStyle="dark-content" />
//         <LottieView source={require("../assets/loading.json")} autoPlay loop style={{
//   width: width * 0.55,
//   height: width * 0.55,
// }} />
//       </View>
//     );
//   }

//   if (isBlocked) {
//     return (
//       <View style={styles.container}>
//         <View style={[styles.header, { paddingTop: insets.top }]}>
//           <View style={styles.sideContainer}>
// <TouchableOpacity
//   style={styles.backButton}
//   onPress={() => {
//     setBackLoading(true);

//     setTimeout(() => {
//       navigation.goBack();
//     }, 600);
//   }}
// >              <Icon name="chevron-back" size={m(22)} color={Colors.secondary} />
//             </TouchableOpacity>
//           </View>
//           <View style={styles.headerCenter}>
//             <View style={styles.avatarSmall}>{renderAvatar()}</View>
//             <View style={styles.headerTextContainer}>
//               <Text style={styles.userName} numberOfLines={1}>{chatPartner.name}</Text>
//               <Text style={[styles.tripInfo, { color: '#EF4444' }]}>Blocked</Text>
//             </View>
//           </View>
//           <View style={styles.sideContainer}>
//             <TouchableOpacity style={styles.iconButton} onPress={showOptionsMenu}>
//               <Icon name="ellipsis-vertical" size={m(22)} color={Colors.dark} />
//             </TouchableOpacity>
//           </View>
//         </View>
//         <View style={styles.blockedContainer}>
//           <Icon name="ban" size={m(60)} color={Colors.gray} />
//           <Text style={styles.blockedTitle}>You have blocked {chatPartner.name}</Text>
//           <Text style={styles.blockedSubtitle}>You won't receive messages from this person.</Text>
//           <TouchableOpacity
//             style={styles.unblockButton}
//             activeOpacity={0.8}
//             onPress={async () => {
//               console.log('UNBLOCK BUTTON CLICKED');
//               try {
//                 const result = await ChatService.unblockUser(myPhone, chatPartnerPhone);
//                 console.log('UNBLOCK RESULT:', result);
//                 if (result.success) {
//                   const blockedUsers = await AsyncStorage.getItem('blocked_users');
//                   const blockedList = blockedUsers ? JSON.parse(blockedUsers) : [];
//                   const updatedList = blockedList.filter(phone => phone !== chatPartnerPhone);
//                   await AsyncStorage.setItem('blocked_users', JSON.stringify(updatedList));
//                   setIsBlocked(false);
//                   connectSocket();
//                   await checkIfBlocked();
//                   showAlert('Success', 'User unblocked', 'success');
//                 } else {
//                   showAlert('Error', result.message || 'Failed', 'error');
//                 }
//               } catch (e) {
//                 console.log('UNBLOCK ERROR:', e);
//               }
//             }}
//           >
//             <Text style={styles.unblockButtonText}>Unblock</Text>
//           </TouchableOpacity>
//         </View>
//       </View>
//     );
//   }

//   return (
//     <View style={styles.container}>
//       <View style={[styles.header, { paddingTop: insets.top }]}>
//         <View style={styles.sideContainer}>
// <TouchableOpacity
//   style={styles.backButton}
//   onPress={() => {
//     setBackLoading(true);

//     setTimeout(() => {
//       navigation.goBack();
//     }, 600);
//   }}
// >            <Icon name="chevron-back" size={m(22)} color={Colors.secondary} />
//           </TouchableOpacity>
//         </View>
//         <View style={styles.headerCenter}>
//           <View style={styles.avatarSmall}>{renderAvatar()}</View>
//           <View style={styles.headerTextContainer}>
//             <Text style={styles.userName} numberOfLines={1}>{chatPartner.name}</Text>
//             {/* <Text style={styles.tripInfo} numberOfLines={1}>{chatPartner.tripInfo}</Text> */}
//           </View>
//         </View>
//         <View style={styles.sideContainer}>
//           <TouchableOpacity style={styles.iconButton} onPress={handleCall}>
//             <Icon name="call" size={m(22)} color={Colors.primary} />
//           </TouchableOpacity>
//           <TouchableOpacity style={styles.iconButton} onPress={showOptionsMenu}>
//             <Icon name="ellipsis-vertical" size={m(22)} color={Colors.dark} />
//           </TouchableOpacity>
//         </View>
//       </View>

//       <KeyboardAvoidingView style={styles.keyboardView} behavior={Platform.OS === 'ios' ? 'padding' : undefined} >
//         <View style={styles.messagesContainer}>
//           <FlatList
//             ref={flatListRef}
//             data={messages}
//             keyExtractor={(item, index) => item.id?.toString() || index.toString()}
//             renderItem={renderMessage}
//             contentContainerStyle={styles.listContent}
//             showsVerticalScrollIndicator={false}
//             onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: true })}
//             onLayout={() => flatListRef.current?.scrollToEnd({ animated: false })}
//           />
//           {typing && (
//             <View style={styles.typingWrapper}>
//               <View style={styles.typingBubble}>
//                 <View style={styles.typingDot} />
//                 <View style={[styles.typingDot, styles.typingDotDelay1]} />
//                 <View style={[styles.typingDot, styles.typingDotDelay2]} />
//               </View>
//             </View>
//           )}
//         </View>
// {/* <View
//   style={[
//     styles.inputBarContainer,
//     {
//       paddingBottom:
//         Platform.OS === 'android'
//           ? Math.max(insets.bottom, h(10))
//           : Math.max(insets.bottom, h(6)),
//     },
//   ]}
// > */}
// <View
//   style={[
//     styles.inputBarContainer
   
//   ]}
// >
//   <View style={styles.inputBar}>
//     <View style={styles.inputWrapper}>
//       <TextInput
//         ref={inputRef}
//         value={input}
//         onChangeText={handleTyping}
//         style={styles.textInput}
//         placeholder="Type a message..."
//         placeholderTextColor={Colors.gray}
//         multiline
//         maxLength={500}
//       />
//     </View>

//     <TouchableOpacity
//       style={[
//         styles.actionButton,
//         { backgroundColor: Colors.primary }
//       ]}
//       onPress={() => sendMessage('text')}
//       disabled={!input.trim() || sending}
//     >
//       {sending ? (
//         <ActivityIndicator size="small" color={Colors.white} />
//       ) : (
//         <Icon
//           name="send"
//           size={m(24)}
//           color={Colors.white}
//         />
//       )}
//     </TouchableOpacity>
//   </View>
// </View>
//       </KeyboardAvoidingView>

//       {/* Options Modal */}
//       <Modal transparent visible={showOptionsModal} animationType="none" onRequestClose={closeOptionsMenu}>
//         <TouchableOpacity style={styles.modalOverlay} activeOpacity={1} onPress={closeOptionsMenu}>
//           <Animated.View style={[styles.optionsModalContainer, { opacity: optionsModalFade, transform: [{ scale: optionsModalScale }] }]}>
//             <View style={styles.optionsModalHeader}>
//               <Text style={styles.optionsModalTitle}>Options</Text>
//               <TouchableOpacity onPress={closeOptionsMenu} style={styles.closeModalButton}>
//                 <Icon name="close" size={24} color="#6B7280" />
//               </TouchableOpacity>
//             </View>
//             <View style={styles.optionsModalDivider} />
//             <TouchableOpacity style={[styles.optionsModalItem, styles.optionsModalItemDestructive]} onPress={handleBlock}>
//               <Icon name="person-remove-outline" size={22} color="#DC2626" />
//               <Text style={[styles.optionsModalItemText, styles.optionsModalItemTextDestructive]}>Block User</Text>
//             </TouchableOpacity>
//             <TouchableOpacity style={styles.optionsModalItem} onPress={handleReport}>
//               <Icon name="flag-outline" size={22} color={Colors.primary} />
//               <Text style={styles.optionsModalItemText}>Report User</Text>
//             </TouchableOpacity>
//             <TouchableOpacity style={[styles.optionsModalItem, styles.optionsModalItemDestructive]} onPress={handleClearChat}>
//               <Icon name="trash-outline" size={22} color="#DC2626" />
//               <Text style={[styles.optionsModalItemText, styles.optionsModalItemTextDestructive]}>Clear Chat</Text>
//             </TouchableOpacity>
//           </Animated.View>
//         </TouchableOpacity>
//       </Modal>

//       {/* Message Options Modal */}
//       <Modal transparent visible={showMessageOptionsModal} animationType="none" onRequestClose={closeMessageOptionsMenu}>
//         <TouchableOpacity style={styles.modalOverlay} activeOpacity={1} onPress={closeMessageOptionsMenu}>
//           <Animated.View style={[styles.optionsModalContainer, { opacity: messageModalFade, transform: [{ scale: messageModalScale }] }]}>
//             <View style={styles.optionsModalHeader}>
//               <Text style={styles.optionsModalTitle}>Message Options</Text>
//               <TouchableOpacity onPress={closeMessageOptionsMenu} style={styles.closeModalButton}>
//                 <Icon name="close" size={24} color="#6B7280" />
//               </TouchableOpacity>
//             </View>
//             <View style={styles.optionsModalDivider} />
//             <TouchableOpacity style={styles.optionsModalItem} onPress={() => {
//               setShowMessageOptionsModal(false);
//               showAlert('Copied', 'Message copied', 'success');
//             }}>
//               <Icon name="copy-outline" size={22} color={Colors.primary} />
//               <Text style={styles.optionsModalItemText}>Copy</Text>
//             </TouchableOpacity>
//             <TouchableOpacity style={[styles.optionsModalItem, styles.optionsModalItemDestructive]} onPress={() => handleMessageDelete(selectedMessage)}>
//               <Icon name="trash-outline" size={22} color="#DC2626" />
//               <Text style={[styles.optionsModalItemText, styles.optionsModalItemTextDestructive]}>Delete</Text>
//             </TouchableOpacity>
//             <TouchableOpacity style={styles.optionsModalItem} onPress={() => handleMessageReport(selectedMessage)}>
//               <Icon name="flag-outline" size={22} color={Colors.primary} />
//               <Text style={styles.optionsModalItemText}>Report</Text>
//             </TouchableOpacity>
//           </Animated.View>
//         </TouchableOpacity>
//       </Modal>

//       <CustomAlert
      
//         visible={alertVisible}
//         title={alertConfig.title}
//         message={alertConfig.message}
//         icon={alertConfig.icon}
//         iconColor={alertConfig.iconColor}
//         buttons={alertConfig.buttons}
//         onBackdropPress={() => setAlertVisible(false)}
//       />
//       {backLoading && (
//   <View style={styles.backLoadingContainer}>
//     <LottieView
//       source={require("../assets/loading.json")}
//       autoPlay
//       loop
//       style={{
//         width: width * 0.55,
//         height: width * 0.55,
//       }}
//     />
//   </View>
// )}
//     </View>
//   );
// };

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     backgroundColor: Colors.white,
//   },

//   loaderContainer: {
//     flex: 1,
//     justifyContent: 'center',
//     alignItems: 'center',
//     backgroundColor: Colors.white,
//   },

//   header: {
//     width: '100%',
//     minHeight: h(52),
//     flexDirection: 'row',
//     alignItems: 'center',
//     justifyContent: 'space-between',
//     paddingHorizontal: spacing(8),
//     paddingVertical: h(8),
//     backgroundColor: Colors.white,
//     borderBottomWidth: 0.5,
//     borderBottomColor: '#E0E0E0',
//   },

//   sideContainer: {
//     width: w(50),
//     flexDirection: 'row',
//     alignItems: 'center',
//     justifyContent: 'center',
//   },

//   backButton: {
//     width: m(40),
//     height: m(40),
//     borderRadius: radius(20),
//     justifyContent: 'center',
//     alignItems: 'center',
//   },

//   iconButton: {
//     width: m(40),
//     height: m(40),
//     borderRadius: radius(20),
//     justifyContent: 'center',
//     alignItems: 'center',
//     marginLeft: spacing(4),
//   },

//   headerCenter: {
//     flex: 1,
//     flexDirection: 'row',
//     alignItems: 'center',
//     paddingHorizontal: spacing(6),
//   },

//   avatarSmall: {
//     width: m(42),
//     height: m(42),
//     borderRadius: radius(21),
//     backgroundColor: Colors.primary,
//     justifyContent: 'center',
//     alignItems: 'center',
//     overflow: 'hidden',
//   },

//   avatarImage: {
//     width: '100%',
//     height: '100%',
//     borderRadius: radius(21),
//   },

//   avatarPlaceholder: {
//     width: '100%',
//     height: '100%',
//     justifyContent: 'center',
//     alignItems: 'center',
//   },

//   avatarSmallText: {
//     fontSize: font(18),
//     fontWeight: '600',
//     color: Colors.white,
//   },

//   headerTextContainer: {
//     marginLeft: spacing(10),
//     flex: 1,
//   },

//   userName: {
//     fontSize: font(16),
//     fontWeight: '600',
//     color: Colors.dark,
//   },

//   tripInfo: {
//     fontSize: font(11),
//     color: Colors.primary,
//     marginTop: h(2),
//   },

//   keyboardView: {
//     flex: 1,
//   },

//   messagesContainer: {
//     flex: 1,
//   },

//   listContent: {
//     paddingTop: h(12),
//     paddingHorizontal: spacing(12),
//     paddingBottom: h(8),
//   },

//   dateDivider: {
//     alignSelf: 'center',
//     backgroundColor: '#E8E8E8',
//     borderRadius: radius(100),
//     paddingHorizontal: spacing(16),
//     paddingVertical: h(6),
//     marginVertical: h(12),
//   },

//   dateDividerText: {
//     fontSize: font(11),
//     color: Colors.dark,
//     fontWeight: '500',
//   },

//   messageWrapper: {
//     marginBottom: h(4),
//     width: '100%',
//   },

//   messageWrapperLeft: {
//     alignItems: 'flex-start',
//   },

//   messageWrapperRight: {
//     alignItems: 'flex-end',
//   },

//   messageTouchable: {
//     maxWidth: wp(78),
//   },

//   bubble: {
//     borderRadius: radius(18),
//     paddingHorizontal: spacing(14),
//     paddingVertical: h(8),
//     elevation: 1,
//   },

//   bubbleLeft: {
//     backgroundColor: '#F0F0F0',
//     borderBottomLeftRadius: radius(4),
//   },

//   bubbleRight: {
//     backgroundColor: Colors.primary,
//     borderBottomRightRadius: radius(4),
//   },

//   messageText: {
//     fontSize: font(15),
//     color: Colors.dark,
//     lineHeight: h(20),
//     fontWeight: '400',
//   },

//   messageTextMine: {
//     color: Colors.white,
//   },

//   metaContainer: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     marginTop: h(2),
//   },

//   metaContainerLeft: {
//     justifyContent: 'flex-start',
//   },

//   metaContainerRight: {
//     justifyContent: 'flex-end',
//   },

//   timeText: {
//     fontSize: font(10),
//     color: '#8E8E93',
//   },

//   timeTextMine: {
//     color: 'rgba(255,255,255,0.8)',
//   },

//   statusIcon: {
//     marginLeft: spacing(4),
//   },

//   typingWrapper: {
//     width: '100%',
//     alignItems: 'flex-start',
//     paddingLeft: spacing(12),
//     marginBottom: h(8),
//   },

//   typingBubble: {
//     flexDirection: 'row',
//     backgroundColor: '#F0F0F0',
//     paddingHorizontal: spacing(16),
//     paddingVertical: h(10),
//     borderRadius: radius(18),
//     borderBottomLeftRadius: radius(4),
//     gap: spacing(4),
//   },

//   typingDot: {
//     width: m(6),
//     height: m(6),
//     borderRadius: radius(3),
//     backgroundColor: '#8E8E93',
//   },

//   typingDotDelay1: {
//     opacity: 0.7,
//   },

//   typingDotDelay2: {
//     opacity: 0.4,
//   },

//   inputBarContainer: {
//     backgroundColor: Colors.white,
//     borderTopWidth: 0.5,
//     borderTopColor: '#E0E0E0',
//     alignItems: 'center',
//     backgroundColor: '#F9FAFB',
//     borderRadius: 12,
//      paddingBottom: 25,
//   },

// inputBar: {
//   flexDirection: 'row',
//   alignItems: 'center',
//   paddingHorizontal: spacing(12),
//   paddingVertical: h(8),
//   gap: spacing(8),
//   // Ensure consistent height
//   minHeight: m(62),
// },
//   inputWrapper: {
//     flex: 1,
//     minHeight: m(46),
//     backgroundColor: '#F8F8F8',
//     borderRadius: radius(25),
//     borderWidth: 0.5,
//     borderColor: '#E0E0E0',
//     paddingHorizontal: spacing(16),
//     justifyContent: 'center',
//   },

//   textInput: {
//     fontSize: font(15),
//     color: Colors.dark,
//     paddingVertical: Platform.OS === 'ios' ? h(10) : h(4),
//     maxHeight: hp(15),
//   },

//   actionButton: {
//     width: m(46),
//     height: m(46),
//     borderRadius: radius(23),
//     justifyContent: 'center',
//     alignItems: 'center',
//   },

//   optionsModalContainer: {
//     backgroundColor: Colors.white,
//     borderRadius: radius(20),
//     width: wp(85),
//     maxWidth: 350,
//     overflow: 'hidden',
//   },

//   optionsModalHeader: {
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//     alignItems: 'center',
//     paddingHorizontal: spacing(20),
//     paddingVertical: h(16),
//   },

//   optionsModalTitle: {
//     fontSize: font(18),
//     fontWeight: '600',
//     color: Colors.dark,
//   },

//   closeModalButton: {
//     width: m(32),
//     height: m(32),
//     borderRadius: radius(16),
//     justifyContent: 'center',
//     alignItems: 'center',
//   },

//   optionsModalDivider: {
//     height: 1,
//     backgroundColor: '#E5E7EB',
//   },

//   optionsModalItem: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     paddingHorizontal: spacing(20),
//     paddingVertical: h(14),
//     borderBottomWidth: 0.5,
//     borderBottomColor: '#F3F4F6',
//   },

//   optionsModalItemText: {
//     fontSize: font(16),
//     color: Colors.dark,
//     marginLeft: spacing(12),
//     fontWeight: '500',
//   },

//   blockedContainer: {
//     flex: 1,
//     justifyContent: 'center',
//     alignItems: 'center',
//     paddingHorizontal: spacing(40),
//   },

//   blockedTitle: {
//     fontSize: font(20),
//     fontWeight: '600',
//     color: Colors.dark,
//     marginTop: h(20),
//     marginBottom: h(8),
//     textAlign: 'center',
//   },

//   blockedSubtitle: {
//     fontSize: font(14),
//     color: Colors.gray,
//     textAlign: 'center',
//     marginBottom: h(24),
//   },

//   unblockButton: {
//     backgroundColor: Colors.primary,
//     paddingHorizontal: spacing(24),
//     paddingVertical: h(12),
//     borderRadius: radius(25),
//   },

//   unblockButtonText: {
//     color: Colors.white,
//     fontWeight: '600',
//     fontSize: font(16),
//   },

//   modalOverlay: {
//     flex: 1,
//     backgroundColor: 'rgba(0,0,0,0.5)',
//     justifyContent: 'center',
//     alignItems: 'center',
//   },

//   backLoadingContainer: {
//     position: 'absolute',
//     top: 0,
//     left: 0,
//     right: 0,
//     bottom: 0,
//     backgroundColor: 'rgba(255,255,255,0.9)',
//     justifyContent: 'center',
//     alignItems: 'center',
//     zIndex: 9999,
//   },
// });

// export default ChatScreen;
// import React, { useEffect, useState, useRef, useCallback } from 'react';
// import {
//   View,
//   Text,
//   StyleSheet,
//   FlatList,
//   TextInput,
//   TouchableOpacity,
//   KeyboardAvoidingView,
//   Platform,
//   Dimensions,
//   Modal,
//   Animated,
//   StatusBar,
//   ActivityIndicator,
//   Linking,
//   Image,
// } from 'react-native';
// import Icon from 'react-native-vector-icons/Ionicons';
// import io from 'socket.io-client';
// import { Colors } from '../constants/Colors';
// import { useSafeAreaInsets } from 'react-native-safe-area-context';
// import { API_BASE_URL } from "../config/config_ip";
// import { useAuth } from '../context/AuthContext';
// import LottieView from "lottie-react-native";
// import CustomAlert from '../components/CustomAlert';
// import AsyncStorage from '@react-native-async-storage/async-storage';
// import * as Speech from 'expo-speech';
// import ChatService from '../services/ChatService';
// import { Audio } from 'expo-av';
// import { SvgCssUri } from "react-native-svg/css";

// import {
//   width,
//   height,
//   w,
//   h,
//   m,
//   font,
//   spacing,
//   radius,
//   wp,
//   hp,
// } from '../utils/responsive';

// const ChatScreen = ({ route, navigation }) => {
//   const { user: currentUser } = useAuth();
//   const insets = useSafeAreaInsets();
//   const { user, conversationId: passedConversationId, receiverPhone, rideId } = route.params || {};

//   const myPhone = currentUser?.phone_number;
//   const conversationId = passedConversationId || rideId || null;
//   const [recordingInstance, setRecordingInstance] = useState(null);
//   const partnerPhoneRef = useRef(null);
//   const [avatarRefreshKey, setAvatarRefreshKey] = useState(0);
  
//   // Modification request state
//   const [modificationRequest, setModificationRequest] = useState(null);
//   const [loadingModRequest, setLoadingModRequest] = useState(false);
  
//   const getPartnerPhone = () => {
//     if (receiverPhone && receiverPhone !== myPhone) return receiverPhone;
//     if (user?.phone_number && user.phone_number !== myPhone) return user.phone_number;
//     if (user?.id && user.id !== myPhone) return user.id;
//     return null;
//   };
  
//   const [chatPartnerPhone, setChatPartnerPhone] = useState(getPartnerPhone);
//   const [isBlocked, setIsBlocked] = useState(false);
  
//   useEffect(() => {
//     if (chatPartnerPhone) {
//       partnerPhoneRef.current = chatPartnerPhone;
//     }
//   }, [chatPartnerPhone]);
  
//   const chatPartner = user || {
//     name: receiverPhone ? `User ${String(receiverPhone).slice(-4)}` : 'Unknown',
//     tripInfo: 'Active',
//     phone_number: chatPartnerPhone,
//     profile_picture: user?.profile_picture || null,
//   };
  
//   useEffect(() => {
//     setAvatarRefreshKey(prev => prev + 1);
//   }, []);
  
//   const [messages, setMessages] = useState([]);
//   const [input, setInput] = useState('');
//   const [recording, setRecording] = useState(false);
//   const [typing, setTyping] = useState(false);
//   const [loading, setLoading] = useState(true);
//   const [sending, setSending] = useState(false);
//   const [showOptionsModal, setShowOptionsModal] = useState(false);
//   const [showMessageOptionsModal, setShowMessageOptionsModal] = useState(false);
//   const [selectedMessage, setSelectedMessage] = useState(null);
//   const [isPlayingVoice, setIsPlayingVoice] = useState(false);
//   const [currentPlayingId, setCurrentPlayingId] = useState(null);
//   const [recordingTimer, setRecordingTimer] = useState(0);
//   const [backLoading, setBackLoading] = useState(false);
//   const [alertVisible, setAlertVisible] = useState(false);
//   const [alertConfig, setAlertConfig] = useState({
//     title: "",
//     message: "",
//     icon: "check-circle",
//     iconColor: "#10B981",
//     buttons: []
//   });

//   const socketRef = useRef(null);
//   const flatListRef = useRef(null);
//   const typingTimeoutRef = useRef(null);
//   const inputRef = useRef(null);
//   const recordingIntervalRef = useRef(null);

//   const optionsModalScale = useRef(new Animated.Value(0.8)).current;
//   const optionsModalFade = useRef(new Animated.Value(0)).current;
//   const messageModalScale = useRef(new Animated.Value(0.8)).current;
//   const messageModalFade = useRef(new Animated.Value(0)).current;

//   const showAlert = (title, message, type = 'success') => {
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

//   const showConfirmationAlert = (title, message, onConfirm, confirmText = 'Confirm') => {
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

//   // Fetch modification request for this ride
//   const fetchModificationRequest = useCallback(async () => {
//     if (!rideId || !myPhone) return;
    
//     setLoadingModRequest(true);
//     try {
//       console.log('🔍 Fetching modification request for ride:', rideId);
//       const response = await fetch(`${API_BASE_URL}/ride/${rideId}/modification-request-for-chat?user_phone=${myPhone}&_t=${Date.now()}`);
//       const data = await response.json();
      
//       console.log('📦 Modification request response:', data);
      
//       if (data.success && data.request && data.request.status === 'pending') {
//         setModificationRequest(data.request);
//       } else {
//         setModificationRequest(null);
//       }
//     } catch (error) {
//       console.log('Error fetching modification request:', error);
//       setModificationRequest(null);
//     } finally {
//       setLoadingModRequest(false);
//     }
//   }, [rideId, myPhone]);

//   useEffect(() => {
//     navigation.setOptions({ headerShown: false });
//     checkIfBlocked();
//     initializeChat();
//     fetchModificationRequest();
//     return () => {
//       if (socketRef.current) socketRef.current.disconnect();
//       Speech.stop();
//       if (recordingIntervalRef.current) clearInterval(recordingIntervalRef.current);
//     };
//   }, []);

//   useEffect(() => {
//     const markSeen = async () => {
//       if (messages.length > 0 && !loading && myPhone && !isBlocked) {
//         const unseenMessages = messages
//           .filter(msg => !msg.from_me && msg.status !== 'seen')
//           .map(msg => msg.id);
        
//         if (unseenMessages.length > 0) {
//           await ChatService.markMessagesAsRead(conversationId, myPhone, unseenMessages);
          
//           setMessages(prev => prev.map(msg => 
//             unseenMessages.includes(msg.id) ? { ...msg, status: 'seen' } : msg
//           ));
          
//           if (socketRef.current?.connected) {
//             socketRef.current.emit('mark_seen', { 
//               conversation_id: conversationId, 
//               message_ids: unseenMessages 
//             });
//           }
//         }
//       }
//     };
//     markSeen();
//   }, [messages, loading, isBlocked]);

//   useEffect(() => {
//     setTimeout(() => flatListRef.current?.scrollToEnd({ animated: true }), 100);
//   }, [messages]);

//   const animateModalIn = (scaleAnim, fadeAnim) => {
//     Animated.parallel([
//       Animated.spring(scaleAnim, { toValue: 1, tension: 50, friction: 7, useNativeDriver: true }),
//       Animated.timing(fadeAnim, { toValue: 1, duration: 200, useNativeDriver: true }),
//     ]).start();
//   };

//   const animateModalOut = (scaleAnim, fadeAnim, onClose) => {
//     Animated.parallel([
//       Animated.spring(scaleAnim, { toValue: 0.8, tension: 50, friction: 7, useNativeDriver: true }),
//       Animated.timing(fadeAnim, { toValue: 0, duration: 200, useNativeDriver: true }),
//     ]).start(() => {
//       if (onClose) onClose();
//     });
//   };

//   const initializeChat = async () => {
//     if (!myPhone) {
//       showAlert('Login Required', 'Please log in to use chat.', 'warning');
//       setLoading(false);
//       return;
//     }
//     if (isBlocked) {
//       setLoading(false);
//       return;
//     }
//     try {
//       await loadMessages();
//       connectSocket();
//     } catch (error) {
//       console.error('Initialize chat error:', error);
//     } finally {
//       setLoading(false);
//     }
//   };

//   const loadMessages = async () => {
//     try {
//       if (!conversationId) return false;
//       const result = await ChatService.getMessages(conversationId, myPhone);
//       if (result.success && result.messages) {
//         setMessages(result.messages);
//         await AsyncStorage.setItem(`chat_${conversationId}`, JSON.stringify(result.messages));
//         return true;
//       }
//       return false;
//     } catch (error) {
//       const localMessages = await AsyncStorage.getItem(`chat_${conversationId}`);
//       if (localMessages) setMessages(JSON.parse(localMessages));
//       return false;
//     }
//   };

//   const connectSocket = () => {
//     if (isBlocked) return;
    
//     socketRef.current = io(API_BASE_URL, {
//       transports: ['websocket'],
//       auth: { phone_number: myPhone },
//       reconnection: true, 
//       reconnectionDelay: 1000, 
//       reconnectionAttempts: 3
//     });

//     socketRef.current.on('connected', (data) => {
//       console.log('Socket connected');
//       if (conversationId) {
//         socketRef.current.emit('join_conversation', { conversation_id: conversationId });
//       }
//     });

//     socketRef.current.on('new_message', async (msg) => {
//       const blockedUsers = await AsyncStorage.getItem('blocked_users');
//       const blockedList = blockedUsers ? JSON.parse(blockedUsers) : [];
//       const senderPhone = msg.sender_phone || msg.sender_id;

//       if (blockedList.includes(senderPhone)) {
//         console.log('BLOCKED MESSAGE HIDDEN');
//         return;
//       }

//       setMessages(prev => {
//         const exists = prev.some(m => m.id === msg.id);
//         if (exists) return prev;
//         const newMessages = [
//           ...prev,
//           {
//             ...msg,
//             from_me: msg.sender_id === myPhone
//           }
//         ];
//         AsyncStorage.setItem(`chat_${conversationId}`, JSON.stringify(newMessages));
//         return newMessages;
//       });

//       if (msg.sender_id !== myPhone) {
//         ChatService.markMessagesAsRead(conversationId, myPhone, [msg.id]);
//       }
//     });
//   };

// // In ChatScreen.js - Update sendMessage function

// const sendMessage = async (type = 'text') => {
//   if (isBlocked) {
//     showAlert('Blocked', `You have blocked ${chatPartner.name}.`, 'warning');
//     return;
//   }
//   if (!input.trim() && type === 'text') return;
  
//   const messageText = type === 'text' ? input.trim() : '🎤 Voice message';
  
//   // If we have a conversationId, use the normal method
//   if (conversationId) {
//     await sendMessageWithConversation(messageText, type);
//   } else {
//     // No conversation exists - send directly by phone number
//     await sendMessageDirectly(messageText, type);
//   }
// };

// const sendMessageWithConversation = async (messageText, type) => {
//   setSending(true);
  
//   const tempMessage = {
//     id: Date.now(),
//     conversation_id: conversationId,
//     sender_id: myPhone,
//     sender_phone: myPhone,
//     text: messageText,
//     type: type,
//     from_me: true,
//     status: 'sent',
//     created_at: new Date().toISOString(),
//   };
  
//   setMessages(prev => [...prev, tempMessage]);
//   setInput('');
  
//   const result = await ChatService.sendMessage(conversationId, myPhone, messageText, type);
  
//   if (result.success && socketRef.current?.connected) {
//     setMessages(prev => prev.map(m => 
//       m.id === tempMessage.id ? { ...result.message, from_me: true } : m
//     ));
//   }
  
//   setSending(false);
// };

// const sendMessageDirectly = async (messageText, type) => {
//   setSending(true);
  
//   const partnerPhone = getPartnerPhone();
//   if (!partnerPhone) {
//     showAlert('Error', 'No recipient found', 'error');
//     setSending(false);
//     return;
//   }
  
//   // Show temp message
//   const tempMessage = {
//     id: Date.now(),
//     text: messageText,
//     type: type,
//     from_me: true,
//     status: 'sent',
//     created_at: new Date().toISOString(),
//   };
  
//   setMessages(prev => [...prev, tempMessage]);
//   setInput('');
  
//   // Send via the new API
//   const result = await ChatService.sendMessageToUser(
//     myPhone, 
//     partnerPhone, 
//     messageText, 
//     type, 
//     null, 
//     rideId
//   );
  
//   if (result.success) {
//     // Update conversationId for future messages
//     const newConversationId = result.conversation_id;
//     setConversationId(newConversationId);
//     navigation.setParams({ conversationId: newConversationId });
    
//     // Replace temp message with real one
//     setMessages(prev => prev.map(m => 
//       m.id === tempMessage.id ? { 
//         ...result.message, 
//         from_me: true,
//         id: result.message.id 
//       } : m
//     ));
    
//     // Connect socket with the new conversation
//     connectSocket(newConversationId);
//   } else {
//     showAlert('Error', 'Failed to send message', 'error');
//   }
  
//   setSending(false);
// };
//   const handleTyping = (text) => {
//     setInput(text);
//     if (socketRef.current?.connected && conversationId && !isBlocked) {
//       socketRef.current.emit('typing', { conversation_id: conversationId, typing: true });
//       if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
//       typingTimeoutRef.current = setTimeout(() => {
//         socketRef.current?.emit('typing', { conversation_id: conversationId, typing: false });
//       }, 2000);
//     }
//   };

//   const startVoiceRecording = async () => {
//     try {
//       const permission = await Audio.requestPermissionsAsync();
//       if (!permission.granted) {
//         showAlert('Permission Required', 'Microphone permission denied', 'error');
//         return;
//       }

//       await Audio.setAudioModeAsync({
//         allowsRecordingIOS: true,
//         playsInSilentModeIOS: true,
//       });

//       const { recording } = await Audio.Recording.createAsync(
//         Audio.RecordingOptionsPresets.HIGH_QUALITY
//       );

//       setRecordingInstance(recording);
//       setRecording(true);
//       setRecordingTimer(0);

//       recordingIntervalRef.current = setInterval(() => {
//         setRecordingTimer(prev => prev + 1);
//       }, 1000);
//     } catch (error) {
//       console.log('Recording start error:', error);
//     }
//   };

//   const stopVoiceRecording = async () => {
//     try {
//       if (recordingIntervalRef.current) {
//         clearInterval(recordingIntervalRef.current);
//       }
//       setRecording(false);
//       if (!recordingInstance) return;
//       await recordingInstance.stopAndUnloadAsync();
//       const uri = recordingInstance.getURI();
//       console.log('VOICE URI:', uri);
//       sendVoiceMessage(uri);
//       setRecordingInstance(null);
//     } catch (error) {
//       console.log('Recording stop error:', error);
//     }
//   };

//   const sendVoiceMessage = async (audioUri) => {
//     const tempMessage = {
//       id: Date.now(),
//       type: 'voice',
//       audio: audioUri,
//       from_me: true,
//       created_at: new Date().toISOString(),
//       status: 'sent',
//     };
//     setMessages(prev => [...prev, tempMessage]);
//   };

//   const playVoiceMessage = async (message, messageId) => {
//     try {
//       Speech.stop();
//       let voiceText = message.voiceText || message.text;
//       voiceText = voiceText.replace(/[🎤"]/g, '').trim();
      
//       if (currentPlayingId === messageId && isPlayingVoice) {
//         Speech.stop();
//         setIsPlayingVoice(false);
//         setCurrentPlayingId(null);
//       } else {
//         setIsPlayingVoice(true);
//         setCurrentPlayingId(messageId);
//         Speech.speak(voiceText, {
//           language: 'en',
//           pitch: 1.0,
//           rate: 0.9,
//           onDone: () => {
//             setIsPlayingVoice(false);
//             setCurrentPlayingId(null);
//           },
//         });
//       }
//     } catch (error) {
//       console.error('Play voice error:', error);
//     }
//   };

//   const toggleRecording = () => {
//     if (!recording) startVoiceRecording();
//     else stopVoiceRecording();
//   };

//   const handleCall = () => {
//     const phoneNumber = chatPartnerPhone || user?.id;
//     if (!phoneNumber) {
//       showAlert('Call Failed', 'Phone number not available.', 'error');
//       return;
//     }
    
//     let cleanPhoneNumber = phoneNumber.toString().trim();
//     if (!cleanPhoneNumber.startsWith('+') && !cleanPhoneNumber.startsWith('0')) {
//       cleanPhoneNumber = '+91' + cleanPhoneNumber;
//     }
    
//     showConfirmationAlert('Call ' + chatPartner.name, `Call ${cleanPhoneNumber}?`, () => {
//       Linking.openURL(`tel:${cleanPhoneNumber}`).catch(() => 
//         showAlert('Call Failed', 'Unable to make call.', 'error'));
//     }, 'Call');
//   };

//   const checkIfBlocked = async () => {
//     try {
//       if (!chatPartnerPhone || myPhone === chatPartnerPhone) {
//         console.log('Same phone number or missing, skipping block check');
//         setIsBlocked(false);
//         return;
//       }
      
//       console.log('Checking if blocked - Partner:', chatPartnerPhone);
//       const result = await ChatService.isBlocked(myPhone, chatPartnerPhone);
//       console.log('Is blocked result:', result);
      
//       if (result.success) {
//         setIsBlocked(result.is_blocked);
//       }
//     } catch (error) {
//       console.error('Check blocked error:', error);
//     }
//   };

//   const handleBlock = async () => {
//     console.log('=== HANDLE BLOCK DEBUG ===');
//     console.log('myPhone:', myPhone);
//     console.log('chatPartnerPhone:', chatPartnerPhone);
    
//     if (!chatPartnerPhone || myPhone === chatPartnerPhone) {
//       showAlert('Error', 'Cannot block: Invalid user', 'error');
//       return;
//     }
    
//     setShowOptionsModal(false);
    
//     showConfirmationAlert(
//       'Block User', 
//       `Block ${chatPartner.name}? You won't receive messages from them.`, 
//       async () => {
//         try {
//           const result = await ChatService.blockUser(myPhone, chatPartnerPhone);
//           console.log('Block API result:', result);
          
//           if (result.success) {
//             const blockedUsers = await AsyncStorage.getItem('blocked_users');
//             const blockedList = blockedUsers ? JSON.parse(blockedUsers) : [];
//             if (!blockedList.includes(chatPartnerPhone)) {
//               blockedList.push(chatPartnerPhone);
//               await AsyncStorage.setItem('blocked_users', JSON.stringify(blockedList));
//             }
            
//             setIsBlocked(true);
//             showAlert('Blocked', `${chatPartner.name} has been blocked.`, 'warning');
            
//             if (socketRef.current) {
//               socketRef.current.disconnect();
//             }
            
//             setTimeout(() => navigation.goBack(), 1500);
//           } else {
//             showAlert('Error', result.message || 'Failed to block user', 'error');
//           }
//         } catch (error) {
//           console.error('Block error:', error);
//           showAlert('Error', 'Failed to block user', 'error');
//         }
//       },
//       'Block'
//     );
//   };

//   const handleUnblock = async () => {
//     setShowOptionsModal(false);
//     showConfirmationAlert(
//       'Unblock User',
//       `Unblock ${chatPartner.name}?`,
//       async () => {
//         try {
//           console.log('UNBLOCKING:', myPhone, chatPartnerPhone);
//           const result = await ChatService.unblockUser(myPhone, chatPartnerPhone);
//           console.log('UNBLOCK RESULT:', result);
//           if (result.success) {
//             const blockedUsers = await AsyncStorage.getItem('blocked_users');
//             const blockedList = blockedUsers ? JSON.parse(blockedUsers) : [];
//             const updatedList = blockedList.filter(phone => phone !== chatPartnerPhone);
//             await AsyncStorage.setItem('blocked_users', JSON.stringify(updatedList));
//             setIsBlocked(false);
//             connectSocket();
//             showAlert('Unblocked', `${chatPartner.name} has been unblocked.`, 'success');
//           } else {
//             showAlert('Error', result.message || 'Failed to unblock user', 'error');
//           }
//         } catch (error) {
//           console.error('Unblock error:', error);
//           showAlert('Error', 'Failed to unblock user', 'error');
//         }
//       },
//       'Unblock'
//     );
//   };

//   const handleReport = async () => {
//     setShowOptionsModal(false);
//     showConfirmationAlert('Report User', `Report ${chatPartner.name}?`, async () => {
//       const result = await ChatService.reportUser(myPhone, chatPartnerPhone, conversationId);
//       showAlert('Report Submitted', 'Thank you for reporting.', 'success');
//     }, 'Report');
//   };

//   const handleClearChat = async () => {
//     setShowOptionsModal(false);
//     showConfirmationAlert('Clear Chat', 'Delete all messages?', async () => {
//       await ChatService.clearChat(conversationId, myPhone);
//       setMessages([]);
//       await AsyncStorage.removeItem(`chat_${conversationId}`);
//       showAlert('Chat Cleared', 'All messages have been deleted.', 'success');
//     }, 'Clear');
//   };

//   const handleMessageDelete = async (message) => {
//     setShowMessageOptionsModal(false);
//     showConfirmationAlert('Delete Message', 'Delete this message?', async () => {
//       await ChatService.deleteMessage(message.id, myPhone);
//       setMessages(prev => {
//         const newMessages = prev.filter(m => m.id !== message.id);
//         AsyncStorage.setItem(`chat_${conversationId}`, JSON.stringify(newMessages));
//         return newMessages;
//       });
//       showAlert('Deleted', 'Message deleted', 'success');
//     }, 'Delete');
//   };

//   const handleMessageReport = async (message) => {
//     setShowMessageOptionsModal(false);
//     showConfirmationAlert('Report Message', 'Report this message?', async () => {
//       await ChatService.reportMessage(myPhone, message.id, conversationId);
//       showAlert('Report Submitted', 'Message reported.', 'success');
//     }, 'Report');
//   };

//   const showOptionsMenu = () => {
//     setShowOptionsModal(true);
//     animateModalIn(optionsModalScale, optionsModalFade);
//   };

//   const closeOptionsMenu = () => {
//     animateModalOut(optionsModalScale, optionsModalFade, () => setShowOptionsModal(false));
//   };

//   const handleLongPressMessage = (message) => {
//     setSelectedMessage(message);
//     setShowMessageOptionsModal(true);
//     animateModalIn(messageModalScale, messageModalFade);
//   };

//   const closeMessageOptionsMenu = () => {
//     animateModalOut(messageModalScale, messageModalFade, () => {
//       setShowMessageOptionsModal(false);
//       setSelectedMessage(null);
//     });
//   };

//   const renderStatusIcon = (status) => {
//     const iconSize = m(14);
//     if (status === 'sent') return <Icon name="checkmark" size={iconSize} color={Colors.gray} />;
//     if (status === 'delivered') return <Icon name="checkmark-done" size={iconSize} color={Colors.gray} />;
//     if (status === 'seen') return <Icon name="checkmark-done" size={iconSize} color={Colors.primary} />;
//     return null;
//   };

//   const formatTime = (timestamp) => {
//     if (!timestamp) return '';
//     const date = new Date(timestamp);
//     return date.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true }).toLowerCase().replace(' ', '');
//   };

//   // Helper function to get image URL with cache busting
//   const getImageUrl = (url) => {
//     if (!url) return null;
//     if (url.startsWith('http://') || url.startsWith('https://')) return url;
//     if (url.includes('?')) {
//       return `${API_BASE_URL}${url.startsWith('/') ? '' : '/'}${url}&_t=${Date.now()}`;
//     }
//     return `${API_BASE_URL}${url.startsWith('/') ? '' : '/'}${url}?_t=${Date.now()}`;
//   };

//   const renderAvatar = () => {
//     const profileUrl = getImageUrl(chatPartner.profile_picture);
//     if (profileUrl) {
//       const isSvg = profileUrl?.toLowerCase()?.includes('.svg');
//       if (isSvg) {
//         return (
//           <SvgCssUri
//             key={`${profileUrl}-${avatarRefreshKey}`}
//             width="100%"
//             height="100%"
//             uri={profileUrl}
//           />
//         );
//       }
//       return (
//         <Image
//           source={{ uri: profileUrl }}
//           style={styles.avatarImage}
//           onError={() => console.log('Failed to load avatar')}
//         />
//       );
//     }
//     return (
//       <View style={styles.avatarPlaceholder}>
//         <Text style={styles.avatarSmallText}>
//           {chatPartner.name?.charAt(0) || 'U'}
//         </Text>
//       </View>
//     );
//   };

//   // Render modification request banner
//   const renderModificationRequestBanner = () => {
//     if (!modificationRequest || modificationRequest.status !== 'pending') return null;
    
//     const isDriver = modificationRequest.driver_phone === myPhone;
//     const isRider = modificationRequest.passenger_phone === myPhone;
    
//     if (!isDriver && !isRider) return null;
    
//     return (
//       <View style={styles.modificationBanner}>
//         <View style={styles.modificationBannerContent}>
//           <Icon name="swap-horizontal" size={20} color="#F59E0B" />
//           <View style={styles.modificationBannerTextContainer}>
//             <Text style={styles.modificationBannerTitle}>
//               Seat Change Request
//             </Text>
//             <Text style={styles.modificationBannerText}>
//               {isDriver ? (
//                 `${modificationRequest.passenger_name} wants to change from ${modificationRequest.current_seats} → ${modificationRequest.requested_seats} seat(s)`
//               ) : (
//                 `You requested to change from ${modificationRequest.current_seats} → ${modificationRequest.requested_seats} seat(s)`
//               )}
//             </Text>
//             <Text style={styles.modificationBannerSubtext}>
//               {isDriver ? 'Tap to review request' : 'Waiting for driver to respond'}
//             </Text>
//           </View>
//           {isDriver && (
//             <TouchableOpacity 
//               style={styles.modificationBannerButton}
//               onPress={() => {
//                 navigation.navigate('ViewRoutePostedScreen', { 
//                   rideId: rideId,
//                   highlightModification: modificationRequest.id,
//                   ride: { id: rideId }
//                 });
//               }}
//             >
//               <Text style={styles.modificationBannerButtonText}>Review</Text>
//             </TouchableOpacity>
//           )}
//         </View>
//       </View>
//     );
//   };

//   const renderMessage = ({ item, index }) => {
//     const isMine = item.from_me;
//     const prev = messages[index - 1];
//     const showDateDivider = !prev || new Date(prev.created_at).toDateString() !== new Date(item.created_at).toDateString();
    
//     const messageDate = new Date(item.created_at);
//     const today = new Date();
//     const yesterday = new Date(today);
//     yesterday.setDate(yesterday.getDate() - 1);
//     let dateText = '';
//     if (messageDate.toDateString() === today.toDateString()) dateText = 'Today';
//     else if (messageDate.toDateString() === yesterday.toDateString()) dateText = 'Yesterday';
//     else dateText = messageDate.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });

//     const isVoice = item.type === 'voice' || item.text?.includes('🎤');
//     const isCurrentlyPlaying = currentPlayingId === item.id && isPlayingVoice;
//     let displayText = item.text;
//     if (isVoice && displayText) displayText = displayText.replace('🎤', '').trim();

//     return (
//       <View key={item.id}>
//         {showDateDivider && (
//           <View style={styles.dateDivider}>
//             <Text style={styles.dateDividerText}>{dateText}</Text>
//           </View>
//         )}
//         <View style={[styles.messageWrapper, isMine ? styles.messageWrapperRight : styles.messageWrapperLeft]}>
//           <TouchableOpacity 
//             activeOpacity={0.8} 
//             onLongPress={() => handleLongPressMessage(item)}
//             style={styles.messageTouchable}
//           >
//             <View style={[styles.bubble, isMine ? styles.bubbleRight : styles.bubbleLeft]}>
//               {isVoice ? (
//                 <View style={styles.voiceContainer}>
//                   <TouchableOpacity style={styles.playButton} onPress={() => playVoiceMessage(item, item.id)}>
//                     <Icon name={isCurrentlyPlaying ? 'pause' : 'volume-high'} size={m(18)} color={isMine ? Colors.white : Colors.primary} />
//                   </TouchableOpacity>
//                   <View style={styles.voiceInfo}>
//                     <View style={styles.waveformContainer}>
//                       {[...Array(12)].map((_, i) => (
//                         <View key={i} style={[styles.waveformBar, { height: Math.random() * 12 + 4, backgroundColor: isMine ? Colors.white : Colors.primary }]} />
//                       ))}
//                     </View>
//                     <Text style={[styles.voiceDuration, isMine && styles.voiceDurationMine]} numberOfLines={1}>
//                       {isCurrentlyPlaying ? 'Playing...' : displayText || 'Tap to play'}
//                     </Text>
//                   </View>
//                 </View>
//               ) : (
//                 <Text style={[styles.messageText, isMine && styles.messageTextMine]}>{item.text}</Text>
//               )}
//               <View style={[styles.metaContainer, isMine ? styles.metaContainerRight : styles.metaContainerLeft]}>
//                 <Text style={[styles.timeText, isMine && styles.timeTextMine]}>{formatTime(item.created_at)}</Text>
//                 {isMine && <View style={styles.statusIcon}>{renderStatusIcon(item.status)}</View>}
//               </View>
//             </View>
//           </TouchableOpacity>
//         </View>
//       </View>
//     );
//   };

//   if (loading) {
//     return (
//       <View style={styles.loaderContainer}>
//         <StatusBar backgroundColor={Colors.white} barStyle="dark-content" />
//         <LottieView source={require("../assets/loading.json")} autoPlay loop style={{
//           width: width * 0.55,
//           height: width * 0.55,
//         }} />
//       </View>
//     );
//   }

//   if (isBlocked) {
//     return (
//       <View style={styles.container}>
//         <View style={[styles.header, { paddingTop: insets.top }]}>
//           <View style={styles.sideContainer}>
//             <TouchableOpacity
//               style={styles.backButton}
//               onPress={() => {
//                 setBackLoading(true);
//                 setTimeout(() => {
//                   navigation.goBack();
//                 }, 600);
//               }}
//             >
//               <Icon name="chevron-back" size={m(22)} color={Colors.secondary} />
//             </TouchableOpacity>
//           </View>
//           <View style={styles.headerCenter}>
//             <View style={styles.avatarSmall}>{renderAvatar()}</View>
//             <View style={styles.headerTextContainer}>
//               <Text style={styles.userName} numberOfLines={1}>{chatPartner.name}</Text>
//               <Text style={[styles.tripInfo, { color: '#EF4444' }]}>Blocked</Text>
//             </View>
//           </View>
//           <View style={styles.sideContainer}>
//             <TouchableOpacity style={styles.iconButton} onPress={showOptionsMenu}>
//               <Icon name="ellipsis-vertical" size={m(22)} color={Colors.dark} />
//             </TouchableOpacity>
//           </View>
//         </View>
//         <View style={styles.blockedContainer}>
//           <Icon name="ban" size={m(60)} color={Colors.gray} />
//           <Text style={styles.blockedTitle}>You have blocked {chatPartner.name}</Text>
//           <Text style={styles.blockedSubtitle}>You won't receive messages from this person.</Text>
//           <TouchableOpacity
//             style={styles.unblockButton}
//             activeOpacity={0.8}
//             onPress={async () => {
//               console.log('UNBLOCK BUTTON CLICKED');
//               try {
//                 const result = await ChatService.unblockUser(myPhone, chatPartnerPhone);
//                 console.log('UNBLOCK RESULT:', result);
//                 if (result.success) {
//                   const blockedUsers = await AsyncStorage.getItem('blocked_users');
//                   const blockedList = blockedUsers ? JSON.parse(blockedUsers) : [];
//                   const updatedList = blockedList.filter(phone => phone !== chatPartnerPhone);
//                   await AsyncStorage.setItem('blocked_users', JSON.stringify(updatedList));
//                   setIsBlocked(false);
//                   connectSocket();
//                   await checkIfBlocked();
//                   showAlert('Success', 'User unblocked', 'success');
//                 } else {
//                   showAlert('Error', result.message || 'Failed', 'error');
//                 }
//               } catch (e) {
//                 console.log('UNBLOCK ERROR:', e);
//               }
//             }}
//           >
//             <Text style={styles.unblockButtonText}>Unblock</Text>
//           </TouchableOpacity>
//         </View>
//       </View>
//     );
//   }

//   return (
//     <View style={styles.container}>
//       <View style={[styles.header, { paddingTop: insets.top }]}>
//         <View style={styles.sideContainer}>
//           <TouchableOpacity
//             style={styles.backButton}
//             onPress={() => {
//               setBackLoading(true);
//               setTimeout(() => {
//                 navigation.goBack();
//               }, 600);
//             }}
//           >
//             <Icon name="chevron-back" size={m(22)} color={Colors.secondary} />
//           </TouchableOpacity>
//         </View>
//         <View style={styles.headerCenter}>
//           <View style={styles.avatarSmall}>{renderAvatar()}</View>
//           <View style={styles.headerTextContainer}>
//             <Text style={styles.userName} numberOfLines={1}>{chatPartner.name}</Text>
//           </View>
//         </View>
//         <View style={styles.sideContainer}>
//           <TouchableOpacity style={styles.iconButton} onPress={handleCall}>
//             <Icon name="call" size={m(22)} color={Colors.primary} />
//           </TouchableOpacity>
//           <TouchableOpacity style={styles.iconButton} onPress={showOptionsMenu}>
//             <Icon name="ellipsis-vertical" size={m(22)} color={Colors.dark} />
//           </TouchableOpacity>
//         </View>
//       </View>

//       <KeyboardAvoidingView style={styles.keyboardView} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
//         <View style={styles.messagesContainer}>
//           {renderModificationRequestBanner()}
//           <FlatList
//             ref={flatListRef}
//             data={messages}
//             keyExtractor={(item, index) => item.id?.toString() || index.toString()}
//             renderItem={renderMessage}
//             contentContainerStyle={styles.listContent}
//             showsVerticalScrollIndicator={false}
//             onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: true })}
//             onLayout={() => flatListRef.current?.scrollToEnd({ animated: false })}
//           />
//           {typing && (
//             <View style={styles.typingWrapper}>
//               <View style={styles.typingBubble}>
//                 <View style={styles.typingDot} />
//                 <View style={[styles.typingDot, styles.typingDotDelay1]} />
//                 <View style={[styles.typingDot, styles.typingDotDelay2]} />
//               </View>
//             </View>
//           )}
//         </View>

//         <View style={[styles.inputBarContainer]}>
//           <View style={styles.inputBar}>
//             <View style={styles.inputWrapper}>
//               <TextInput
//                 ref={inputRef}
//                 value={input}
//                 onChangeText={handleTyping}
//                 style={styles.textInput}
//                 placeholder="Type a message..."
//                 placeholderTextColor={Colors.gray}
//                 multiline
//                 maxLength={500}
//               />
//             </View>

//             <TouchableOpacity
//               style={[
//                 styles.actionButton,
//                 { backgroundColor: Colors.primary }
//               ]}
//               onPress={() => sendMessage('text')}
//               disabled={!input.trim() || sending}
//             >
//               {sending ? (
//                 <ActivityIndicator size="small" color={Colors.white} />
//               ) : (
//                 <Icon name="send" size={m(24)} color={Colors.white} />
//               )}
//             </TouchableOpacity>
//           </View>
//         </View>
//       </KeyboardAvoidingView>

//       {/* Options Modal */}
//       <Modal transparent visible={showOptionsModal} animationType="none" onRequestClose={closeOptionsMenu}>
//         <TouchableOpacity style={styles.modalOverlay} activeOpacity={1} onPress={closeOptionsMenu}>
//           <Animated.View style={[styles.optionsModalContainer, { opacity: optionsModalFade, transform: [{ scale: optionsModalScale }] }]}>
//             <View style={styles.optionsModalHeader}>
//               <Text style={styles.optionsModalTitle}>Options</Text>
//               <TouchableOpacity onPress={closeOptionsMenu} style={styles.closeModalButton}>
//                 <Icon name="close" size={24} color="#6B7280" />
//               </TouchableOpacity>
//             </View>
//             <View style={styles.optionsModalDivider} />
//             <TouchableOpacity style={[styles.optionsModalItem, styles.optionsModalItemDestructive]} onPress={handleBlock}>
//               <Icon name="person-remove-outline" size={22} color="#DC2626" />
//               <Text style={[styles.optionsModalItemText, styles.optionsModalItemTextDestructive]}>Block User</Text>
//             </TouchableOpacity>
//             <TouchableOpacity style={styles.optionsModalItem} onPress={handleReport}>
//               <Icon name="flag-outline" size={22} color={Colors.primary} />
//               <Text style={styles.optionsModalItemText}>Report User</Text>
//             </TouchableOpacity>
//             <TouchableOpacity style={[styles.optionsModalItem, styles.optionsModalItemDestructive]} onPress={handleClearChat}>
//               <Icon name="trash-outline" size={22} color="#DC2626" />
//               <Text style={[styles.optionsModalItemText, styles.optionsModalItemTextDestructive]}>Clear Chat</Text>
//             </TouchableOpacity>
//           </Animated.View>
//         </TouchableOpacity>
//       </Modal>

//       {/* Message Options Modal */}
//       <Modal transparent visible={showMessageOptionsModal} animationType="none" onRequestClose={closeMessageOptionsMenu}>
//         <TouchableOpacity style={styles.modalOverlay} activeOpacity={1} onPress={closeMessageOptionsMenu}>
//           <Animated.View style={[styles.optionsModalContainer, { opacity: messageModalFade, transform: [{ scale: messageModalScale }] }]}>
//             <View style={styles.optionsModalHeader}>
//               <Text style={styles.optionsModalTitle}>Message Options</Text>
//               <TouchableOpacity onPress={closeMessageOptionsMenu} style={styles.closeModalButton}>
//                 <Icon name="close" size={24} color="#6B7280" />
//               </TouchableOpacity>
//             </View>
//             <View style={styles.optionsModalDivider} />
//             <TouchableOpacity style={styles.optionsModalItem} onPress={() => {
//               setShowMessageOptionsModal(false);
//               showAlert('Copied', 'Message copied', 'success');
//             }}>
//               <Icon name="copy-outline" size={22} color={Colors.primary} />
//               <Text style={styles.optionsModalItemText}>Copy</Text>
//             </TouchableOpacity>
//             <TouchableOpacity style={[styles.optionsModalItem, styles.optionsModalItemDestructive]} onPress={() => handleMessageDelete(selectedMessage)}>
//               <Icon name="trash-outline" size={22} color="#DC2626" />
//               <Text style={[styles.optionsModalItemText, styles.optionsModalItemTextDestructive]}>Delete</Text>
//             </TouchableOpacity>
//             <TouchableOpacity style={styles.optionsModalItem} onPress={() => handleMessageReport(selectedMessage)}>
//               <Icon name="flag-outline" size={22} color={Colors.primary} />
//               <Text style={styles.optionsModalItemText}>Report</Text>
//             </TouchableOpacity>
//           </Animated.View>
//         </TouchableOpacity>
//       </Modal>

//       <CustomAlert
//         visible={alertVisible}
//         title={alertConfig.title}
//         message={alertConfig.message}
//         icon={alertConfig.icon}
//         iconColor={alertConfig.iconColor}
//         buttons={alertConfig.buttons}
//         onBackdropPress={() => setAlertVisible(false)}
//       />
//       {backLoading && (
//         <View style={styles.backLoadingContainer}>
//           <LottieView
//             source={require("../assets/loading.json")}
//             autoPlay
//             loop
//             style={{
//               width: width * 0.55,
//               height: width * 0.55,
//             }}
//           />
//         </View>
//       )}
//     </View>
//   );
// };

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     backgroundColor: Colors.white,
//   },

//   loaderContainer: {
//     flex: 1,
//     justifyContent: 'center',
//     alignItems: 'center',
//     backgroundColor: Colors.white,
//   },

//   header: {
//     width: '100%',
//     minHeight: h(52),
//     flexDirection: 'row',
//     alignItems: 'center',
//     justifyContent: 'space-between',
//     paddingHorizontal: spacing(8),
//     paddingVertical: h(8),
//     backgroundColor: Colors.white,
//     borderBottomWidth: 0.5,
//     borderBottomColor: '#E0E0E0',
//   },

//   sideContainer: {
//     width: w(50),
//     flexDirection: 'row',
//     alignItems: 'center',
//     justifyContent: 'center',
//   },

//   backButton: {
//     width: m(40),
//     height: m(40),
//     borderRadius: radius(20),
//     justifyContent: 'center',
//     alignItems: 'center',
//   },

//   iconButton: {
//     width: m(40),
//     height: m(40),
//     borderRadius: radius(20),
//     justifyContent: 'center',
//     alignItems: 'center',
//     marginLeft: spacing(4),
//   },

//   headerCenter: {
//     flex: 1,
//     flexDirection: 'row',
//     alignItems: 'center',
//     paddingHorizontal: spacing(6),
//   },

//   avatarSmall: {
//     width: m(42),
//     height: m(42),
//     borderRadius: radius(21),
//     backgroundColor: Colors.primary,
//     justifyContent: 'center',
//     alignItems: 'center',
//     overflow: 'hidden',
//   },

//   avatarImage: {
//     width: '100%',
//     height: '100%',
//     borderRadius: radius(21),
//   },

//   avatarPlaceholder: {
//     width: '100%',
//     height: '100%',
//     justifyContent: 'center',
//     alignItems: 'center',
//   },

//   avatarSmallText: {
//     fontSize: font(18),
//     fontWeight: '600',
//     color: Colors.white,
//   },

//   headerTextContainer: {
//     marginLeft: spacing(10),
//     flex: 1,
//   },

//   userName: {
//     fontSize: font(16),
//     fontWeight: '600',
//     color: Colors.dark,
//   },

//   tripInfo: {
//     fontSize: font(11),
//     color: Colors.primary,
//     marginTop: h(2),
//   },

//   keyboardView: {
//     flex: 1,
//   },

//   messagesContainer: {
//     flex: 1,
//   },

//   listContent: {
//     paddingTop: h(12),
//     paddingHorizontal: spacing(12),
//     paddingBottom: h(8),
//   },

//   dateDivider: {
//     alignSelf: 'center',
//     backgroundColor: '#E8E8E8',
//     borderRadius: radius(100),
//     paddingHorizontal: spacing(16),
//     paddingVertical: h(6),
//     marginVertical: h(12),
//   },

//   dateDividerText: {
//     fontSize: font(11),
//     color: Colors.dark,
//     fontWeight: '500',
//   },

//   messageWrapper: {
//     marginBottom: h(4),
//     width: '100%',
//   },

//   messageWrapperLeft: {
//     alignItems: 'flex-start',
//   },

//   messageWrapperRight: {
//     alignItems: 'flex-end',
//   },

//   messageTouchable: {
//     maxWidth: wp(78),
//   },

//   bubble: {
//     borderRadius: radius(18),
//     paddingHorizontal: spacing(14),
//     paddingVertical: h(8),
//     elevation: 1,
//   },

//   bubbleLeft: {
//     backgroundColor: '#F0F0F0',
//     borderBottomLeftRadius: radius(4),
//   },

//   bubbleRight: {
//     backgroundColor: Colors.primary,
//     borderBottomRightRadius: radius(4),
//   },

//   messageText: {
//     fontSize: font(15),
//     color: Colors.dark,
//     lineHeight: h(20),
//     fontWeight: '400',
//   },

//   messageTextMine: {
//     color: Colors.white,
//   },

//   metaContainer: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     marginTop: h(2),
//   },

//   metaContainerLeft: {
//     justifyContent: 'flex-start',
//   },

//   metaContainerRight: {
//     justifyContent: 'flex-end',
//   },

//   timeText: {
//     fontSize: font(10),
//     color: '#8E8E93',
//   },

//   timeTextMine: {
//     color: 'rgba(255,255,255,0.8)',
//   },

//   statusIcon: {
//     marginLeft: spacing(4),
//   },

//   typingWrapper: {
//     width: '100%',
//     alignItems: 'flex-start',
//     paddingLeft: spacing(12),
//     marginBottom: h(8),
//   },

//   typingBubble: {
//     flexDirection: 'row',
//     backgroundColor: '#F0F0F0',
//     paddingHorizontal: spacing(16),
//     paddingVertical: h(10),
//     borderRadius: radius(18),
//     borderBottomLeftRadius: radius(4),
//     gap: spacing(4),
//   },

//   typingDot: {
//     width: m(6),
//     height: m(6),
//     borderRadius: radius(3),
//     backgroundColor: '#8E8E93',
//   },

//   typingDotDelay1: {
//     opacity: 0.7,
//   },

//   typingDotDelay2: {
//     opacity: 0.4,
//   },

//   inputBarContainer: {
//     backgroundColor: Colors.white,
//     borderTopWidth: 0.5,
//     borderTopColor: '#E0E0E0',
//     alignItems: 'center',
//     backgroundColor: '#F9FAFB',
//     borderRadius: 12,
//     paddingBottom: 25,
//   },

//   inputBar: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     paddingHorizontal: spacing(12),
//     paddingVertical: h(8),
//     gap: spacing(8),
//     minHeight: m(62),
//   },

//   inputWrapper: {
//     flex: 1,
//     minHeight: m(46),
//     backgroundColor: '#F8F8F8',
//     borderRadius: radius(25),
//     borderWidth: 0.5,
//     borderColor: '#E0E0E0',
//     paddingHorizontal: spacing(16),
//     justifyContent: 'center',
//   },

//   textInput: {
//     fontSize: font(15),
//     color: Colors.dark,
//     paddingVertical: Platform.OS === 'ios' ? h(10) : h(4),
//     maxHeight: hp(15),
//   },

//   actionButton: {
//     width: m(46),
//     height: m(46),
//     borderRadius: radius(23),
//     justifyContent: 'center',
//     alignItems: 'center',
//   },

//   optionsModalContainer: {
//     backgroundColor: Colors.white,
//     borderRadius: radius(20),
//     width: wp(85),
//     maxWidth: 350,
//     overflow: 'hidden',
//   },

//   optionsModalHeader: {
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//     alignItems: 'center',
//     paddingHorizontal: spacing(20),
//     paddingVertical: h(16),
//   },

//   optionsModalTitle: {
//     fontSize: font(18),
//     fontWeight: '600',
//     color: Colors.dark,
//   },

//   closeModalButton: {
//     width: m(32),
//     height: m(32),
//     borderRadius: radius(16),
//     justifyContent: 'center',
//     alignItems: 'center',
//   },

//   optionsModalDivider: {
//     height: 1,
//     backgroundColor: '#E5E7EB',
//   },

//   optionsModalItem: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     paddingHorizontal: spacing(20),
//     paddingVertical: h(14),
//     borderBottomWidth: 0.5,
//     borderBottomColor: '#F3F4F6',
//   },

//   optionsModalItemText: {
//     fontSize: font(16),
//     color: Colors.dark,
//     marginLeft: spacing(12),
//     fontWeight: '500',
//   },

//   blockedContainer: {
//     flex: 1,
//     justifyContent: 'center',
//     alignItems: 'center',
//     paddingHorizontal: spacing(40),
//   },

//   blockedTitle: {
//     fontSize: font(20),
//     fontWeight: '600',
//     color: Colors.dark,
//     marginTop: h(20),
//     marginBottom: h(8),
//     textAlign: 'center',
//   },

//   blockedSubtitle: {
//     fontSize: font(14),
//     color: Colors.gray,
//     textAlign: 'center',
//     marginBottom: h(24),
//   },

//   unblockButton: {
//     backgroundColor: Colors.primary,
//     paddingHorizontal: spacing(24),
//     paddingVertical: h(12),
//     borderRadius: radius(25),
//   },

//   unblockButtonText: {
//     color: Colors.white,
//     fontWeight: '600',
//     fontSize: font(16),
//   },

//   modalOverlay: {
//     flex: 1,
//     backgroundColor: 'rgba(0,0,0,0.5)',
//     justifyContent: 'center',
//     alignItems: 'center',
//   },

//   backLoadingContainer: {
//     position: 'absolute',
//     top: 0,
//     left: 0,
//     right: 0,
//     bottom: 0,
//     backgroundColor: 'rgba(255,255,255,0.9)',
//     justifyContent: 'center',
//     alignItems: 'center',
//     zIndex: 9999,
//   },

//   // Modification Request Banner Styles
//   modificationBanner: {
//     backgroundColor: '#FFFBEB',
//     borderWidth: 1,
//     borderColor: '#FDE68A',
//     borderRadius: 12,
//     marginHorizontal: spacing(12),
//     marginBottom: h(12),
//     padding: spacing(12),
//     shadowColor: '#000',
//     shadowOffset: { width: 0, height: 1 },
//     shadowOpacity: 0.05,
//     shadowRadius: 2,
//     elevation: 1,
//   },
//   modificationBannerContent: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     gap: spacing(12),
//   },
//   modificationBannerTextContainer: {
//     flex: 1,
//   },
//   modificationBannerTitle: {
//     fontSize: font(14),
//     fontWeight: '600',
//     color: '#92400E',
//     marginBottom: h(2),
//   },
//   modificationBannerText: {
//     fontSize: font(12),
//     color: '#B45309',
//     marginBottom: h(2),
//   },
//   modificationBannerSubtext: {
//     fontSize: font(10),
//     color: '#B45309',
//     opacity: 0.8,
//   },
//   modificationBannerButton: {
//     backgroundColor: '#10B981',
//     paddingHorizontal: spacing(12),
//     paddingVertical: h(6),
//     borderRadius: radius(6),
//   },
//   modificationBannerButtonText: {
//     color: '#fff',
//     fontSize: font(12),
//     fontWeight: '600',
//   },
// });

// export default ChatScreen;
import React, { useEffect, useState, useRef, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  Dimensions,
  Modal,
  Animated,
  StatusBar,
  ActivityIndicator,
  Linking,
  Image,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import io from 'socket.io-client';
import { Colors } from '../constants/Colors';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { API_BASE_URL } from "../config/config_ip";
import { useAuth } from '../context/AuthContext';
import LottieView from "lottie-react-native";
import CustomAlert from '../components/CustomAlert';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Speech from 'expo-speech';
import ChatService from '../services/ChatService';
import { Audio } from 'expo-av';
import { SvgCssUri } from "react-native-svg/css";

import {
  width,
  height,
  w,
  h,
  m,
  font,
  spacing,
  radius,
  wp,
  hp,
} from '../utils/responsive';

const ChatScreen = ({ route, navigation }) => {
  const { user: currentUser } = useAuth();
  const insets = useSafeAreaInsets();
  const { user, conversationId: passedConversationId, receiverPhone, rideId } = route.params || {};

  const myPhone = currentUser?.phone_number;
  
  // State for real conversation ID (numeric from database)
  const [realConversationId, setRealConversationId] = useState(null);
  const [recordingInstance, setRecordingInstance] = useState(null);
  const partnerPhoneRef = useRef(null);
  const [avatarRefreshKey, setAvatarRefreshKey] = useState(0);
  
  // Modification request state
  const [modificationRequest, setModificationRequest] = useState(null);
  
  const getPartnerPhone = () => {
    if (receiverPhone && receiverPhone !== myPhone) return receiverPhone;
    if (user?.phone_number && user.phone_number !== myPhone) return user.phone_number;
    if (user?.phone && user.phone !== myPhone) return user.phone;
    if (user?.id && user.id !== myPhone) return user.id;
    return null;
  };
  
  const [chatPartnerPhone, setChatPartnerPhone] = useState(getPartnerPhone);
  const [isBlocked, setIsBlocked] = useState(false);
  
  useEffect(() => {
    if (chatPartnerPhone) {
      partnerPhoneRef.current = chatPartnerPhone;
    }
  }, [chatPartnerPhone]);
  
  const chatPartner = user || {
    name: receiverPhone ? `User ${String(receiverPhone).slice(-4)}` : 'Unknown',
    tripInfo: 'Active',
    phone_number: chatPartnerPhone,
    profile_picture: user?.profile_picture || null,
  };
  
  useEffect(() => {
    setAvatarRefreshKey(prev => prev + 1);
  }, []);
  
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [recording, setRecording] = useState(false);
  const [typing, setTyping] = useState(false);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [showOptionsModal, setShowOptionsModal] = useState(false);
  const [showMessageOptionsModal, setShowMessageOptionsModal] = useState(false);
  const [selectedMessage, setSelectedMessage] = useState(null);
  const [isPlayingVoice, setIsPlayingVoice] = useState(false);
  const [currentPlayingId, setCurrentPlayingId] = useState(null);
  const [recordingTimer, setRecordingTimer] = useState(0);
  const [backLoading, setBackLoading] = useState(false);
  const [alertVisible, setAlertVisible] = useState(false);
  const [alertConfig, setAlertConfig] = useState({
    title: "",
    message: "",
    icon: "check-circle",
    iconColor: "#10B981",
    buttons: []
  });

  const socketRef = useRef(null);
  const flatListRef = useRef(null);
  const typingTimeoutRef = useRef(null);
  const inputRef = useRef(null);
  const recordingIntervalRef = useRef(null);

  const optionsModalScale = useRef(new Animated.Value(0.8)).current;
  const optionsModalFade = useRef(new Animated.Value(0)).current;
  const messageModalScale = useRef(new Animated.Value(0.8)).current;
  const messageModalFade = useRef(new Animated.Value(0)).current;

  const showAlert = (title, message, type = 'success') => {
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

  const showConfirmationAlert = (title, message, onConfirm, confirmText = 'Confirm') => {
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

  // Fetch modification request for this ride (non-blocking)
  const fetchModificationRequest = useCallback(async () => {
    if (!rideId || !myPhone) return;
    
    try {
      const response = await fetch(`${API_BASE_URL}/ride/${rideId}/modification-request-for-chat?user_phone=${myPhone}&_t=${Date.now()}`);
      const data = await response.json();
      
      if (data.success && data.request && data.request.status === 'pending') {
        setModificationRequest(data.request);
      }
    } catch (error) {
      console.log('Error fetching modification request:', error);
    }
  }, [rideId, myPhone]);

  // OPTIMIZED: Initialize chat - faster loading
  useEffect(() => {
    navigation.setOptions({ headerShown: false });
    
    const init = async () => {
      // Show screen immediately, load data in background
      setLoading(false);
      
      // Check block status in background
      checkIfBlocked();
      
      // Load messages if conversation exists
      if (passedConversationId && typeof passedConversationId === 'number') {
        setRealConversationId(passedConversationId);
        await loadMessages(passedConversationId);
        connectSocket(passedConversationId);
      }
      
      // Fetch modification request in background
      fetchModificationRequest();
    };
    
    init();
    
    return () => {
      if (socketRef.current) socketRef.current.disconnect();
      Speech.stop();
      if (recordingIntervalRef.current) clearInterval(recordingIntervalRef.current);
    };
  }, []);

  useEffect(() => {
    const markSeen = async () => {
      if (messages.length > 0 && !loading && myPhone && !isBlocked && realConversationId) {
        const unseenMessages = messages
          .filter(msg => !msg.from_me && msg.status !== 'seen')
          .map(msg => msg.id);
        
        if (unseenMessages.length > 0) {
          await ChatService.markMessagesAsRead(realConversationId, myPhone, unseenMessages);
          
          setMessages(prev => prev.map(msg => 
            unseenMessages.includes(msg.id) ? { ...msg, status: 'seen' } : msg
          ));
          
          if (socketRef.current?.connected) {
            socketRef.current.emit('mark_seen', { 
              conversation_id: realConversationId, 
              message_ids: unseenMessages 
            });
          }
        }
      }
    };
    markSeen();
  }, [messages, loading, isBlocked, realConversationId]);

  useEffect(() => {
    setTimeout(() => flatListRef.current?.scrollToEnd({ animated: true }), 100);
  }, [messages]);

  const animateModalIn = (scaleAnim, fadeAnim) => {
    Animated.parallel([
      Animated.spring(scaleAnim, { toValue: 1, tension: 50, friction: 7, useNativeDriver: true }),
      Animated.timing(fadeAnim, { toValue: 1, duration: 200, useNativeDriver: true }),
    ]).start();
  };

  const animateModalOut = (scaleAnim, fadeAnim, onClose) => {
    Animated.parallel([
      Animated.spring(scaleAnim, { toValue: 0.8, tension: 50, friction: 7, useNativeDriver: true }),
      Animated.timing(fadeAnim, { toValue: 0, duration: 200, useNativeDriver: true }),
    ]).start(() => {
      if (onClose) onClose();
    });
  };

  const loadMessages = async (convId) => {
    try {
      if (!convId) return false;
      
      // Try to get from cache first for instant display
      const cachedMessages = await AsyncStorage.getItem(`chat_${convId}`);
      if (cachedMessages) {
        setMessages(JSON.parse(cachedMessages));
      }
      
      // Then fetch from server in background
      const result = await ChatService.getMessages(convId, myPhone);
      if (result.success && result.messages) {
        setMessages(result.messages);
        await AsyncStorage.setItem(`chat_${convId}`, JSON.stringify(result.messages));
        return true;
      }
      return false;
    } catch (error) {
      console.error('Load messages error:', error);
      return false;
    }
  };

  const connectSocket = (convId) => {
    if (isBlocked || !convId) return;
    
    socketRef.current = io(API_BASE_URL, {
      transports: ['websocket'],
      auth: { phone_number: myPhone },
      reconnection: true, 
      reconnectionDelay: 1000, 
      reconnectionAttempts: 3
    });

    socketRef.current.on('connected', () => {
      console.log('Socket connected');
      socketRef.current.emit('join_conversation', { conversation_id: convId });
    });

    socketRef.current.on('new_message', async (msg) => {
      const blockedUsers = await AsyncStorage.getItem('blocked_users');
      const blockedList = blockedUsers ? JSON.parse(blockedUsers) : [];
      const senderPhone = msg.sender_phone || msg.sender_id;

      if (blockedList.includes(senderPhone)) {
        return;
      }

      setMessages(prev => {
        const exists = prev.some(m => m.id === msg.id);
        if (exists) return prev;
        const newMessages = [
          ...prev,
          {
            ...msg,
            from_me: msg.sender_id === myPhone
          }
        ];
        AsyncStorage.setItem(`chat_${convId}`, JSON.stringify(newMessages));
        return newMessages;
      });

      if (msg.sender_id !== myPhone) {
        ChatService.markMessagesAsRead(convId, myPhone, [msg.id]);
      }
    });
  };

  // Send message with existing conversation
  const sendMessageWithConversation = async (messageText, type) => {
    setSending(true);
    
    const tempMessage = {
      id: Date.now(),
      conversation_id: realConversationId,
      sender_id: myPhone,
      sender_phone: myPhone,
      text: messageText,
      type: type,
      from_me: true,
      status: 'sent',
      created_at: new Date().toISOString(),
    };
    
    setMessages(prev => [...prev, tempMessage]);
    setInput('');
    
    const result = await ChatService.sendMessage(realConversationId, myPhone, messageText, type);
    
    if (result.success) {
      setMessages(prev => prev.map(m => 
        m.id === tempMessage.id ? { ...result.message, from_me: true } : m
      ));
    }
    
    setSending(false);
  };

  // Send message and auto-create conversation
  const sendMessageDirectly = async (messageText, type) => {
    setSending(true);
    
    const partnerPhone = getPartnerPhone();
    if (!partnerPhone) {
      showAlert('Error', 'No recipient found', 'error');
      setSending(false);
      return;
    }
    
    // Show temp message
    const tempId = Date.now();
    const tempMessage = {
      id: tempId,
      text: messageText,
      type: type,
      from_me: true,
      status: 'sent',
      created_at: new Date().toISOString(),
    };
    
    setMessages(prev => [...prev, tempMessage]);
    setInput('');
    
    try {
      // Send via the API that auto-creates conversation
      const result = await ChatService.sendMessageToUser(
        myPhone, 
        partnerPhone, 
        messageText, 
        type, 
        null, 
        rideId
      );
      
      if (result.success) {
        const newConversationId = result.conversation_id;
        setRealConversationId(newConversationId);
        
        setMessages(prev => prev.map(m => 
          m.id === tempId ? { 
            ...result.message, 
            from_me: true,
            id: result.message.id 
          } : m
        ));
        
        connectSocket(newConversationId);
        navigation.setParams({ conversationId: newConversationId });
      } else {
        setMessages(prev => prev.filter(m => m.id !== tempId));
        showAlert('Error', result.message || 'Failed to send message', 'error');
      }
    } catch (error) {
      console.error('Send message error:', error);
      setMessages(prev => prev.filter(m => m.id !== tempId));
      showAlert('Error', 'Failed to send message', 'error');
    } finally {
      setSending(false);
    }
  };

  // Main send message function
  const sendMessage = async (type = 'text') => {
    if (isBlocked) {
      showAlert('Blocked', `You have blocked ${chatPartner.name}.`, 'warning');
      return;
    }
    if (!input.trim() && type === 'text') return;
    
    const messageText = type === 'text' ? input.trim() : '🎤 Voice message';
    
    if (realConversationId) {
      await sendMessageWithConversation(messageText, type);
    } else {
      await sendMessageDirectly(messageText, type);
    }
  };

  const handleTyping = (text) => {
    setInput(text);
    if (socketRef.current?.connected && realConversationId && !isBlocked) {
      socketRef.current.emit('typing', { conversation_id: realConversationId, typing: true });
      if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
      typingTimeoutRef.current = setTimeout(() => {
        socketRef.current?.emit('typing', { conversation_id: realConversationId, typing: false });
      }, 2000);
    }
  };

  const startVoiceRecording = async () => {
    try {
      const permission = await Audio.requestPermissionsAsync();
      if (!permission.granted) {
        showAlert('Permission Required', 'Microphone permission denied', 'error');
        return;
      }

      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
      });

      const { recording } = await Audio.Recording.createAsync(
        Audio.RecordingOptionsPresets.HIGH_QUALITY
      );

      setRecordingInstance(recording);
      setRecording(true);
      setRecordingTimer(0);

      recordingIntervalRef.current = setInterval(() => {
        setRecordingTimer(prev => prev + 1);
      }, 1000);
    } catch (error) {
      console.log('Recording start error:', error);
    }
  };

  const stopVoiceRecording = async () => {
    try {
      if (recordingIntervalRef.current) {
        clearInterval(recordingIntervalRef.current);
      }
      setRecording(false);
      if (!recordingInstance) return;
      await recordingInstance.stopAndUnloadAsync();
      const uri = recordingInstance.getURI();
      console.log('VOICE URI:', uri);
      sendMessage('text');
      setRecordingInstance(null);
    } catch (error) {
      console.log('Recording stop error:', error);
    }
  };

  const playVoiceMessage = async (message, messageId) => {
    try {
      Speech.stop();
      let voiceText = message.voiceText || message.text;
      voiceText = voiceText.replace(/[🎤"]/g, '').trim();
      
      if (currentPlayingId === messageId && isPlayingVoice) {
        Speech.stop();
        setIsPlayingVoice(false);
        setCurrentPlayingId(null);
      } else {
        setIsPlayingVoice(true);
        setCurrentPlayingId(messageId);
        Speech.speak(voiceText, {
          language: 'en',
          pitch: 1.0,
          rate: 0.9,
          onDone: () => {
            setIsPlayingVoice(false);
            setCurrentPlayingId(null);
          },
        });
      }
    } catch (error) {
      console.error('Play voice error:', error);
    }
  };

  const toggleRecording = () => {
    if (!recording) startVoiceRecording();
    else stopVoiceRecording();
  };

  const handleCall = () => {
    const phoneNumber = chatPartnerPhone || user?.id;
    if (!phoneNumber) {
      showAlert('Call Failed', 'Phone number not available.', 'error');
      return;
    }
    
    let cleanPhoneNumber = phoneNumber.toString().trim();
    if (!cleanPhoneNumber.startsWith('+') && !cleanPhoneNumber.startsWith('0')) {
      cleanPhoneNumber = '+91' + cleanPhoneNumber;
    }
    
    showConfirmationAlert('Call ' + chatPartner.name, `Call ${cleanPhoneNumber}?`, () => {
      Linking.openURL(`tel:${cleanPhoneNumber}`).catch(() => 
        showAlert('Call Failed', 'Unable to make call.', 'error'));
    }, 'Call');
  };

  const checkIfBlocked = async () => {
    try {
      if (!chatPartnerPhone || myPhone === chatPartnerPhone) {
        setIsBlocked(false);
        return;
      }
      
      const result = await ChatService.isBlocked(myPhone, chatPartnerPhone);
      if (result.success) {
        setIsBlocked(result.is_blocked);
      }
    } catch (error) {
      console.error('Check blocked error:', error);
    }
  };

  const handleBlock = async () => {
    if (!chatPartnerPhone || myPhone === chatPartnerPhone) {
      showAlert('Error', 'Cannot block: Invalid user', 'error');
      return;
    }
    
    setShowOptionsModal(false);
    
    showConfirmationAlert(
      'Block User', 
      `Block ${chatPartner.name}? You won't receive messages from them.`, 
      async () => {
        try {
          const result = await ChatService.blockUser(myPhone, chatPartnerPhone);
          
          if (result.success) {
            const blockedUsers = await AsyncStorage.getItem('blocked_users');
            const blockedList = blockedUsers ? JSON.parse(blockedUsers) : [];
            if (!blockedList.includes(chatPartnerPhone)) {
              blockedList.push(chatPartnerPhone);
              await AsyncStorage.setItem('blocked_users', JSON.stringify(blockedList));
            }
            
            setIsBlocked(true);
            showAlert('Blocked', `${chatPartner.name} has been blocked.`, 'warning');
            
            if (socketRef.current) {
              socketRef.current.disconnect();
            }
            
            setTimeout(() => navigation.goBack(), 1500);
          } else {
            showAlert('Error', result.message || 'Failed to block user', 'error');
          }
        } catch (error) {
          console.error('Block error:', error);
          showAlert('Error', 'Failed to block user', 'error');
        }
      },
      'Block'
    );
  };

  const handleUnblock = async () => {
    setShowOptionsModal(false);
    showConfirmationAlert(
      'Unblock User',
      `Unblock ${chatPartner.name}?`,
      async () => {
        try {
          const result = await ChatService.unblockUser(myPhone, chatPartnerPhone);
          if (result.success) {
            const blockedUsers = await AsyncStorage.getItem('blocked_users');
            const blockedList = blockedUsers ? JSON.parse(blockedUsers) : [];
            const updatedList = blockedList.filter(phone => phone !== chatPartnerPhone);
            await AsyncStorage.setItem('blocked_users', JSON.stringify(updatedList));
            setIsBlocked(false);
            if (realConversationId) {
              connectSocket(realConversationId);
            }
            showAlert('Unblocked', `${chatPartner.name} has been unblocked.`, 'success');
          } else {
            showAlert('Error', result.message || 'Failed to unblock user', 'error');
          }
        } catch (error) {
          console.error('Unblock error:', error);
          showAlert('Error', 'Failed to unblock user', 'error');
        }
      },
      'Unblock'
    );
  };

  const handleReport = async () => {
    setShowOptionsModal(false);
    showConfirmationAlert('Report User', `Report ${chatPartner.name}?`, async () => {
      await ChatService.reportUser(myPhone, chatPartnerPhone, realConversationId);
      showAlert('Report Submitted', 'Thank you for reporting.', 'success');
    }, 'Report');
  };

  const handleClearChat = async () => {
    setShowOptionsModal(false);
    showConfirmationAlert('Clear Chat', 'Delete all messages?', async () => {
      if (realConversationId) {
        await ChatService.clearChat(realConversationId, myPhone);
        setMessages([]);
        await AsyncStorage.removeItem(`chat_${realConversationId}`);
        showAlert('Chat Cleared', 'All messages have been deleted.', 'success');
      }
    }, 'Clear');
  };

  const handleMessageDelete = async (message) => {
    setShowMessageOptionsModal(false);
    showConfirmationAlert('Delete Message', 'Delete this message?', async () => {
      if (realConversationId) {
        await ChatService.deleteMessage(message.id, myPhone);
        setMessages(prev => {
          const newMessages = prev.filter(m => m.id !== message.id);
          AsyncStorage.setItem(`chat_${realConversationId}`, JSON.stringify(newMessages));
          return newMessages;
        });
        showAlert('Deleted', 'Message deleted', 'success');
      }
    }, 'Delete');
  };

  const handleMessageReport = async (message) => {
    setShowMessageOptionsModal(false);
    showConfirmationAlert('Report Message', 'Report this message?', async () => {
      await ChatService.reportMessage(myPhone, message.id, realConversationId);
      showAlert('Report Submitted', 'Message reported.', 'success');
    }, 'Report');
  };

  const showOptionsMenu = () => {
    setShowOptionsModal(true);
    animateModalIn(optionsModalScale, optionsModalFade);
  };

  const closeOptionsMenu = () => {
    animateModalOut(optionsModalScale, optionsModalFade, () => setShowOptionsModal(false));
  };

  const handleLongPressMessage = (message) => {
    setSelectedMessage(message);
    setShowMessageOptionsModal(true);
    animateModalIn(messageModalScale, messageModalFade);
  };

  const closeMessageOptionsMenu = () => {
    animateModalOut(messageModalScale, messageModalFade, () => {
      setShowMessageOptionsModal(false);
      setSelectedMessage(null);
    });
  };

  const renderStatusIcon = (status) => {
    const iconSize = m(14);
    if (status === 'sent') return <Icon name="checkmark" size={iconSize} color={Colors.gray} />;
    if (status === 'delivered') return <Icon name="checkmark-done" size={iconSize} color={Colors.gray} />;
    if (status === 'seen') return <Icon name="checkmark-done" size={iconSize} color={Colors.primary} />;
    return null;
  };

  const formatTime = (timestamp) => {
    if (!timestamp) return '';
    const date = new Date(timestamp);
    return date.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true }).toLowerCase().replace(' ', '');
  };

  const getImageUrl = (url) => {
    if (!url) return null;
    if (url.startsWith('http://') || url.startsWith('https://')) return url;
    if (url.includes('?')) {
      return `${API_BASE_URL}${url.startsWith('/') ? '' : '/'}${url}&_t=${Date.now()}`;
    }
    return `${API_BASE_URL}${url.startsWith('/') ? '' : '/'}${url}?_t=${Date.now()}`;
  };

  const renderAvatar = () => {
    const profileUrl = getImageUrl(chatPartner.profile_picture);
    if (profileUrl) {
      const isSvg = profileUrl?.toLowerCase()?.includes('.svg');
      if (isSvg) {
        return (
          <SvgCssUri
            key={`${profileUrl}-${avatarRefreshKey}`}
            width="100%"
            height="100%"
            uri={profileUrl}
          />
        );
      }
      return (
        <Image
          source={{ uri: profileUrl }}
          style={styles.avatarImage}
          onError={() => console.log('Failed to load avatar')}
        />
      );
    }
    return (
      <View style={styles.avatarPlaceholder}>
        <Text style={styles.avatarSmallText}>
          {chatPartner.name?.charAt(0) || 'U'}
        </Text>
      </View>
    );
  };

  const renderModificationRequestBanner = () => {
    if (!modificationRequest || modificationRequest.status !== 'pending') return null;
    
    const isDriver = modificationRequest.driver_phone === myPhone;
    const isRider = modificationRequest.passenger_phone === myPhone;
    
    if (!isDriver && !isRider) return null;
    
    return (
      <View style={styles.modificationBanner}>
        <View style={styles.modificationBannerContent}>
          <Icon name="swap-horizontal" size={20} color="#F59E0B" />
          <View style={styles.modificationBannerTextContainer}>
            <Text style={styles.modificationBannerTitle}>
              Seat Change Request
            </Text>
            <Text style={styles.modificationBannerText}>
              {isDriver ? (
                `${modificationRequest.passenger_name} wants to change from ${modificationRequest.current_seats} → ${modificationRequest.requested_seats} seat(s)`
              ) : (
                `You requested to change from ${modificationRequest.current_seats} → ${modificationRequest.requested_seats} seat(s)`
              )}
            </Text>
            <Text style={styles.modificationBannerSubtext}>
              {isDriver ? 'Tap to review request' : 'Waiting for driver to respond'}
            </Text>
          </View>
          {isDriver && (
            <TouchableOpacity 
              style={styles.modificationBannerButton}
              onPress={() => {
                navigation.navigate('ViewRoutePostedScreen', { 
                  rideId: rideId,
                  highlightModification: modificationRequest.id,
                  ride: { id: rideId }
                });
              }}
            >
              <Text style={styles.modificationBannerButtonText}>Review</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    );
  };

  const renderMessage = ({ item, index }) => {
    const isMine = item.from_me;
    const prev = messages[index - 1];
    const showDateDivider = !prev || new Date(prev.created_at).toDateString() !== new Date(item.created_at).toDateString();
    
    const messageDate = new Date(item.created_at);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    let dateText = '';
    if (messageDate.toDateString() === today.toDateString()) dateText = 'Today';
    else if (messageDate.toDateString() === yesterday.toDateString()) dateText = 'Yesterday';
    else dateText = messageDate.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });

    const isVoice = item.type === 'voice' || item.text?.includes('🎤');
    const isCurrentlyPlaying = currentPlayingId === item.id && isPlayingVoice;
    let displayText = item.text;
    if (isVoice && displayText) displayText = displayText.replace('🎤', '').trim();

    return (
      <View key={item.id}>
        {showDateDivider && (
          <View style={styles.dateDivider}>
            <Text style={styles.dateDividerText}>{dateText}</Text>
          </View>
        )}
        <View style={[styles.messageWrapper, isMine ? styles.messageWrapperRight : styles.messageWrapperLeft]}>
          <TouchableOpacity 
            activeOpacity={0.8} 
            onLongPress={() => handleLongPressMessage(item)}
            style={styles.messageTouchable}
          >
            <View style={[styles.bubble, isMine ? styles.bubbleRight : styles.bubbleLeft]}>
              {isVoice ? (
                <View style={styles.voiceContainer}>
                  <TouchableOpacity style={styles.playButton} onPress={() => playVoiceMessage(item, item.id)}>
                    <Icon name={isCurrentlyPlaying ? 'pause' : 'volume-high'} size={m(18)} color={isMine ? Colors.white : Colors.primary} />
                  </TouchableOpacity>
                  <View style={styles.voiceInfo}>
                    <View style={styles.waveformContainer}>
                      {[...Array(12)].map((_, i) => (
                        <View key={i} style={[styles.waveformBar, { height: Math.random() * 12 + 4, backgroundColor: isMine ? Colors.white : Colors.primary }]} />
                      ))}
                    </View>
                    <Text style={[styles.voiceDuration, isMine && styles.voiceDurationMine]} numberOfLines={1}>
                      {isCurrentlyPlaying ? 'Playing...' : displayText || 'Tap to play'}
                    </Text>
                  </View>
                </View>
              ) : (
                <Text style={[styles.messageText, isMine && styles.messageTextMine]}>{item.text}</Text>
              )}
              <View style={[styles.metaContainer, isMine ? styles.metaContainerRight : styles.metaContainerLeft]}>
                <Text style={[styles.timeText, isMine && styles.timeTextMine]}>{formatTime(item.created_at)}</Text>
                {isMine && <View style={styles.statusIcon}>{renderStatusIcon(item.status)}</View>}
              </View>
            </View>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  // Show loading only for first load when no messages
  if (loading && messages.length === 0) {
    return (
      <View style={styles.loaderContainer}>
        <StatusBar backgroundColor={Colors.white} barStyle="dark-content" />
        <LottieView source={require("../assets/loading.json")} autoPlay loop style={{
          width: width * 0.55,
          height: width * 0.55,
        }} />
      </View>
    );
  }

  if (isBlocked) {
    return (
      <View style={styles.container}>
        <View style={[styles.header, { paddingTop: insets.top }]}>
          <View style={styles.sideContainer}>
            <TouchableOpacity
              style={styles.backButton}
              onPress={() => {
                setBackLoading(true);
                setTimeout(() => navigation.goBack(), 600);
              }}
            >
              <Icon name="chevron-back" size={m(22)} color={Colors.secondary} />
            </TouchableOpacity>
          </View>
          <View style={styles.headerCenter}>
            <View style={styles.avatarSmall}>{renderAvatar()}</View>
            <View style={styles.headerTextContainer}>
              <Text style={styles.userName} numberOfLines={1}>{chatPartner.name}</Text>
              <Text style={[styles.tripInfo, { color: '#EF4444' }]}>Blocked</Text>
            </View>
          </View>
          <View style={styles.sideContainer}>
            <TouchableOpacity style={styles.iconButton} onPress={showOptionsMenu}>
              <Icon name="ellipsis-vertical" size={m(22)} color={Colors.dark} />
            </TouchableOpacity>
          </View>
        </View>
        <View style={styles.blockedContainer}>
          <Icon name="ban" size={m(60)} color={Colors.gray} />
          <Text style={styles.blockedTitle}>You have blocked {chatPartner.name}</Text>
          <Text style={styles.blockedSubtitle}>You won't receive messages from this person.</Text>
          <TouchableOpacity
            style={styles.unblockButton}
            activeOpacity={0.8}
            onPress={async () => {
              try {
                const result = await ChatService.unblockUser(myPhone, chatPartnerPhone);
                if (result.success) {
                  const blockedUsers = await AsyncStorage.getItem('blocked_users');
                  const blockedList = blockedUsers ? JSON.parse(blockedUsers) : [];
                  const updatedList = blockedList.filter(phone => phone !== chatPartnerPhone);
                  await AsyncStorage.setItem('blocked_users', JSON.stringify(updatedList));
                  setIsBlocked(false);
                  if (realConversationId) {
                    connectSocket(realConversationId);
                  }
                  showAlert('Success', 'User unblocked', 'success');
                } else {
                  showAlert('Error', result.message || 'Failed', 'error');
                }
              } catch (e) {
                console.log('UNBLOCK ERROR:', e);
              }
            }}
          >
            <Text style={styles.unblockButtonText}>Unblock</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={[styles.header, { paddingTop: insets.top }]}>
        <View style={styles.sideContainer}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => {
              setBackLoading(true);
              setTimeout(() => navigation.goBack(), 600);
            }}
          >
            <Icon name="chevron-back" size={m(22)} color={Colors.secondary} />
          </TouchableOpacity>
        </View>
        <View style={styles.headerCenter}>
          <View style={styles.avatarSmall}>{renderAvatar()}</View>
          <View style={styles.headerTextContainer}>
            <Text style={styles.userName} numberOfLines={1}>{chatPartner.name}</Text>
          </View>
        </View>
        <View style={styles.sideContainer}>
          <TouchableOpacity style={styles.iconButton} onPress={handleCall}>
            <Icon name="call" size={m(22)} color={Colors.primary} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.iconButton} onPress={showOptionsMenu}>
            <Icon name="ellipsis-vertical" size={m(22)} color={Colors.dark} />
          </TouchableOpacity>
        </View>
      </View>

      <KeyboardAvoidingView style={styles.keyboardView} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <View style={styles.messagesContainer}>
          {renderModificationRequestBanner()}
          <FlatList
            ref={flatListRef}
            data={messages}
            keyExtractor={(item, index) => item.id?.toString() || index.toString()}
            renderItem={renderMessage}
            contentContainerStyle={styles.listContent}
            showsVerticalScrollIndicator={false}
            onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: true })}
            onLayout={() => flatListRef.current?.scrollToEnd({ animated: false })}
          />
          {typing && (
            <View style={styles.typingWrapper}>
              <View style={styles.typingBubble}>
                <View style={styles.typingDot} />
                <View style={[styles.typingDot, styles.typingDotDelay1]} />
                <View style={[styles.typingDot, styles.typingDotDelay2]} />
              </View>
            </View>
          )}
        </View>

        <View style={[styles.inputBarContainer]}>
          <View style={styles.inputBar}>
            <View style={styles.inputWrapper}>
              <TextInput
                ref={inputRef}
                value={input}
                onChangeText={handleTyping}
                style={styles.textInput}
                placeholder="Type a message..."
                placeholderTextColor={Colors.gray}
                multiline
                maxLength={500}
              />
            </View>

            <TouchableOpacity
              style={[
                styles.actionButton,
                { backgroundColor: Colors.primary }
              ]}
              onPress={() => sendMessage('text')}
              disabled={!input.trim() || sending}
            >
              {sending ? (
                <ActivityIndicator size="small" color={Colors.white} />
              ) : (
                <Icon name="send" size={m(24)} color={Colors.white} />
              )}
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>

      {/* Options Modal */}
      <Modal transparent visible={showOptionsModal} animationType="none" onRequestClose={closeOptionsMenu}>
        <TouchableOpacity style={styles.modalOverlay} activeOpacity={1} onPress={closeOptionsMenu}>
          <Animated.View style={[styles.optionsModalContainer, { opacity: optionsModalFade, transform: [{ scale: optionsModalScale }] }]}>
            <View style={styles.optionsModalHeader}>
              <Text style={styles.optionsModalTitle}>Options</Text>
              <TouchableOpacity onPress={closeOptionsMenu} style={styles.closeModalButton}>
                <Icon name="close" size={24} color="#6B7280" />
              </TouchableOpacity>
            </View>
            <View style={styles.optionsModalDivider} />
            <TouchableOpacity style={[styles.optionsModalItem, styles.optionsModalItemDestructive]} onPress={handleBlock}>
              <Icon name="person-remove-outline" size={22} color="#DC2626" />
              <Text style={[styles.optionsModalItemText, styles.optionsModalItemTextDestructive]}>Block User</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.optionsModalItem} onPress={handleReport}>
              <Icon name="flag-outline" size={22} color={Colors.primary} />
              <Text style={styles.optionsModalItemText}>Report User</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.optionsModalItem, styles.optionsModalItemDestructive]} onPress={handleClearChat}>
              <Icon name="trash-outline" size={22} color="#DC2626" />
              <Text style={[styles.optionsModalItemText, styles.optionsModalItemTextDestructive]}>Clear Chat</Text>
            </TouchableOpacity>
          </Animated.View>
        </TouchableOpacity>
      </Modal>

      {/* Message Options Modal */}
      <Modal transparent visible={showMessageOptionsModal} animationType="none" onRequestClose={closeMessageOptionsMenu}>
        <TouchableOpacity style={styles.modalOverlay} activeOpacity={1} onPress={closeMessageOptionsMenu}>
          <Animated.View style={[styles.optionsModalContainer, { opacity: messageModalFade, transform: [{ scale: messageModalScale }] }]}>
            <View style={styles.optionsModalHeader}>
              <Text style={styles.optionsModalTitle}>Message Options</Text>
              <TouchableOpacity onPress={closeMessageOptionsMenu} style={styles.closeModalButton}>
                <Icon name="close" size={24} color="#6B7280" />
              </TouchableOpacity>
            </View>
            <View style={styles.optionsModalDivider} />
            <TouchableOpacity style={styles.optionsModalItem} onPress={() => {
              setShowMessageOptionsModal(false);
              showAlert('Copied', 'Message copied', 'success');
            }}>
              <Icon name="copy-outline" size={22} color={Colors.primary} />
              <Text style={styles.optionsModalItemText}>Copy</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.optionsModalItem, styles.optionsModalItemDestructive]} onPress={() => handleMessageDelete(selectedMessage)}>
              <Icon name="trash-outline" size={22} color="#DC2626" />
              <Text style={[styles.optionsModalItemText, styles.optionsModalItemTextDestructive]}>Delete</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.optionsModalItem} onPress={() => handleMessageReport(selectedMessage)}>
              <Icon name="flag-outline" size={22} color={Colors.primary} />
              <Text style={styles.optionsModalItemText}>Report</Text>
            </TouchableOpacity>
          </Animated.View>
        </TouchableOpacity>
      </Modal>

      <CustomAlert
        visible={alertVisible}
        title={alertConfig.title}
        message={alertConfig.message}
        icon={alertConfig.icon}
        iconColor={alertConfig.iconColor}
        buttons={alertConfig.buttons}
        onBackdropPress={() => setAlertVisible(false)}
      />
      {backLoading && (
        <View style={styles.backLoadingContainer}>
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
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.white,
  },

  loaderContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.white,
  },

  header: {
    width: '100%',
    minHeight: h(52),
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing(8),
    paddingVertical: h(8),
    backgroundColor: Colors.white,
    borderBottomWidth: 0.5,
    borderBottomColor: '#E0E0E0',
  },

  sideContainer: {
    width: w(50),
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },

  backButton: {
    width: m(40),
    height: m(40),
    borderRadius: radius(20),
    justifyContent: 'center',
    alignItems: 'center',
  },

  iconButton: {
    width: m(40),
    height: m(40),
    borderRadius: radius(20),
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: spacing(4),
  },

  headerCenter: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing(6),
  },

  avatarSmall: {
    width: m(42),
    height: m(42),
    borderRadius: radius(21),
    backgroundColor: Colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },

  avatarImage: {
    width: '100%',
    height: '100%',
    borderRadius: radius(21),
  },

  avatarPlaceholder: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },

  avatarSmallText: {
    fontSize: font(18),
    fontWeight: '600',
    color: Colors.white,
  },

  headerTextContainer: {
    marginLeft: spacing(10),
    flex: 1,
  },

  userName: {
    fontSize: font(16),
    fontWeight: '600',
    color: Colors.dark,
  },

  tripInfo: {
    fontSize: font(11),
    color: Colors.primary,
    marginTop: h(2),
  },

  keyboardView: {
    flex: 1,
  },

  messagesContainer: {
    flex: 1,
  },

  listContent: {
    paddingTop: h(12),
    paddingHorizontal: spacing(12),
    paddingBottom: h(8),
  },

  dateDivider: {
    alignSelf: 'center',
    backgroundColor: '#E8E8E8',
    borderRadius: radius(100),
    paddingHorizontal: spacing(16),
    paddingVertical: h(6),
    marginVertical: h(12),
  },

  dateDividerText: {
    fontSize: font(11),
    color: Colors.dark,
    fontWeight: '500',
  },

  messageWrapper: {
    marginBottom: h(4),
    width: '100%',
  },

  messageWrapperLeft: {
    alignItems: 'flex-start',
  },

  messageWrapperRight: {
    alignItems: 'flex-end',
  },

  messageTouchable: {
    maxWidth: wp(78),
  },

  bubble: {
    borderRadius: radius(18),
    paddingHorizontal: spacing(14),
    paddingVertical: h(8),
    elevation: 1,
  },

  bubbleLeft: {
    backgroundColor: '#F0F0F0',
    borderBottomLeftRadius: radius(4),
  },

  bubbleRight: {
    backgroundColor: Colors.primary,
    borderBottomRightRadius: radius(4),
  },

  messageText: {
    fontSize: font(15),
    color: Colors.dark,
    lineHeight: h(20),
    fontWeight: '400',
  },

  messageTextMine: {
    color: Colors.white,
  },

  metaContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: h(2),
  },

  metaContainerLeft: {
    justifyContent: 'flex-start',
  },

  metaContainerRight: {
    justifyContent: 'flex-end',
  },

  timeText: {
    fontSize: font(10),
    color: '#8E8E93',
  },

  timeTextMine: {
    color: 'rgba(255,255,255,0.8)',
  },

  statusIcon: {
    marginLeft: spacing(4),
  },

  typingWrapper: {
    width: '100%',
    alignItems: 'flex-start',
    paddingLeft: spacing(12),
    marginBottom: h(8),
  },

  typingBubble: {
    flexDirection: 'row',
    backgroundColor: '#F0F0F0',
    paddingHorizontal: spacing(16),
    paddingVertical: h(10),
    borderRadius: radius(18),
    borderBottomLeftRadius: radius(4),
    gap: spacing(4),
  },

  typingDot: {
    width: m(6),
    height: m(6),
    borderRadius: radius(3),
    backgroundColor: '#8E8E93',
  },

  typingDotDelay1: {
    opacity: 0.7,
  },

  typingDotDelay2: {
    opacity: 0.4,
  },

  inputBarContainer: {
    backgroundColor: Colors.white,
    borderTopWidth: 0.5,
    borderTopColor: '#E0E0E0',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    paddingBottom: 25,
  },

  inputBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing(12),
    paddingVertical: h(8),
    gap: spacing(8),
    minHeight: m(62),
  },

  inputWrapper: {
    flex: 1,
    minHeight: m(46),
    backgroundColor: '#F8F8F8',
    borderRadius: radius(25),
    borderWidth: 0.5,
    borderColor: '#E0E0E0',
    paddingHorizontal: spacing(16),
    justifyContent: 'center',
  },

  textInput: {
    fontSize: font(15),
    color: Colors.dark,
    paddingVertical: Platform.OS === 'ios' ? h(10) : h(4),
    maxHeight: hp(15),
  },

  actionButton: {
    width: m(46),
    height: m(46),
    borderRadius: radius(23),
    justifyContent: 'center',
    alignItems: 'center',
  },

  optionsModalContainer: {
    backgroundColor: Colors.white,
    borderRadius: radius(20),
    width: wp(85),
    maxWidth: 350,
    overflow: 'hidden',
  },

  optionsModalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing(20),
    paddingVertical: h(16),
  },

  optionsModalTitle: {
    fontSize: font(18),
    fontWeight: '600',
    color: Colors.dark,
  },

  closeModalButton: {
    width: m(32),
    height: m(32),
    borderRadius: radius(16),
    justifyContent: 'center',
    alignItems: 'center',
  },

  optionsModalDivider: {
    height: 1,
    backgroundColor: '#E5E7EB',
  },

  optionsModalItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing(20),
    paddingVertical: h(14),
    borderBottomWidth: 0.5,
    borderBottomColor: '#F3F4F6',
  },

  optionsModalItemText: {
    fontSize: font(16),
    color: Colors.dark,
    marginLeft: spacing(12),
    fontWeight: '500',
  },

  optionsModalItemDestructive: {
    borderBottomColor: '#F3F4F6',
  },

  optionsModalItemTextDestructive: {
    color: '#DC2626',
  },

  blockedContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: spacing(40),
  },

  blockedTitle: {
    fontSize: font(20),
    fontWeight: '600',
    color: Colors.dark,
    marginTop: h(20),
    marginBottom: h(8),
    textAlign: 'center',
  },

  blockedSubtitle: {
    fontSize: font(14),
    color: Colors.gray,
    textAlign: 'center',
    marginBottom: h(24),
  },

  unblockButton: {
    backgroundColor: Colors.primary,
    paddingHorizontal: spacing(24),
    paddingVertical: h(12),
    borderRadius: radius(25),
  },

  unblockButtonText: {
    color: Colors.white,
    fontWeight: '600',
    fontSize: font(16),
  },

  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },

  backLoadingContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(255,255,255,0.9)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 9999,
  },

  modificationBanner: {
    backgroundColor: '#FFFBEB',
    borderWidth: 1,
    borderColor: '#FDE68A',
    borderRadius: 12,
    marginHorizontal: spacing(12),
    marginBottom: h(12),
    padding: spacing(12),
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },

  modificationBannerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing(12),
  },

  modificationBannerTextContainer: {
    flex: 1,
  },

  modificationBannerTitle: {
    fontSize: font(14),
    fontWeight: '600',
    color: '#92400E',
    marginBottom: h(2),
  },

  modificationBannerText: {
    fontSize: font(12),
    color: '#B45309',
    marginBottom: h(2),
  },

  modificationBannerSubtext: {
    fontSize: font(10),
    color: '#B45309',
    opacity: 0.8,
  },

  modificationBannerButton: {
    backgroundColor: '#10B981',
    paddingHorizontal: spacing(12),
    paddingVertical: h(6),
    borderRadius: radius(6),
  },

  modificationBannerButtonText: {
    color: '#fff',
    fontSize: font(12),
    fontWeight: '600',
  },

  voiceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing(8),
  },

  playButton: {
    width: m(32),
    height: m(32),
    borderRadius: radius(16),
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },

  voiceInfo: {
    flex: 1,
  },

  waveformContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing(2),
    marginBottom: h(4),
  },

  waveformBar: {
    width: m(2),
    backgroundColor: Colors.white,
    borderRadius: radius(1),
  },

  voiceDuration: {
    fontSize: font(10),
    color: 'rgba(255,255,255,0.8)',
  },

  voiceDurationMine: {
    color: 'rgba(255,255,255,0.8)',
  },
});

export default ChatScreen;