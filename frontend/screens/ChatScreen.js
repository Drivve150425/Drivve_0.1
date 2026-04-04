// import React, { useEffect, useState, useRef } from 'react';
// import {
//   View,
//   Text,
//   StyleSheet,
//   FlatList,
//   TextInput,
//   TouchableOpacity,
//   SafeAreaView,
//   KeyboardAvoidingView,
//   Platform,
//   Alert,
//   ActionSheetIOS,
// } from 'react-native';
// import Icon from 'react-native-vector-icons/Ionicons';
// import io from 'socket.io-client';
// import AsyncStorage from '@react-native-async-storage/async-storage';
// import { Colors, Typography } from '../constants/Colors';

// const API_URL = 'http://192.168.1.11:8000'; // Your FastAPI server URL
// const SOCKET_URL = 'http://192.168.1.11:8000'; // Socket.IO URL

// const ChatScreen = ({ route, navigation }) => {
//   const { user, conversationId } = route.params;
//   const [messages, setMessages] = useState([]);
//   const [input, setInput] = useState('');
//   const [recording, setRecording] = useState(false);
//   const [typing, setTyping] = useState(false);
//   const [currentUserId, setCurrentUserId] = useState(null);
//   const socketRef = useRef(null);
//   const flatListRef = useRef(null);
//   const typingTimeoutRef = useRef(null);

//   useEffect(() => {
//     navigation.setOptions({ headerShown: false });
//     initializeChat();

//     return () => {
//       if (socketRef.current) {
//         socketRef.current.disconnect();
//       }
//     };
//   }, []);

//   const initializeChat = async () => {
//     try {
//       // Get JWT token and user ID
//       const token = await AsyncStorage.getItem('token');
//       const userId = await AsyncStorage.getItem('user_id');

//       if (!token || !userId) {
//         // Testing mode - use mock data
//         console.log('Testing mode: No token found, using mock data');
//         setCurrentUserId(999); // Mock user ID

//         // Load mock messages
//         loadMockMessages();

//         // Skip socket connection for testing
//         return;
//       }

//       setCurrentUserId(parseInt(userId));

//       // Load existing messages
//       await loadMessages(token);

//       // Initialize Socket.IO connection
//       connectSocket(token);

//     } catch (error) {
//       console.error('Initialize chat error:', error);
//       Alert.alert('Error', 'Failed to initialize chat');
//     }
//   };

//   const loadMessages = async (token) => {
//     try {
//       const response = await fetch(
//         `${API_URL}/api/chat/conversations/${conversationId}/messages`,
//         {
//           headers: {
//             'Authorization': `Bearer ${token}`,
//             'Content-Type': 'application/json',
//           },
//         }
//       );

//       const data = await response.json();

//       if (data.success) {
//         setMessages(data.messages);
//       }
//     } catch (error) {
//       console.error('Load messages error:', error);
//     }
//   };

//   const loadMockMessages = () => {
//     const mockMessages = [
//       {
//         id: 1,
//         text: 'Hey there! Ready for the trip?',
//         sender_id: 101,
//         from_me: false,
//         status: 'seen',
//         created_at: new Date(Date.now() - 3600000).toISOString(), // 1 hour ago
//         sender_name: user.name,
//         type: 'text'
//       },
//       {
//         id: 2,
//         text: 'Yes, I am! What time should we meet?',
//         sender_id: 999,
//         from_me: true,
//         status: 'sent',
//         created_at: new Date(Date.now() - 3300000).toISOString(), // 55 min ago
//         sender_name: 'You',
//         type: 'text'
//       },
//       {
//         id: 3,
//         text: 'Let\'s meet at 8 AM at the pickup point.',
//         sender_id: 101,
//         from_me: false,
//         status: 'seen',
//         created_at: new Date(Date.now() - 3000000).toISOString(), // 50 min ago
//         sender_name: user.name,
//         type: 'text'
//       },
//       {
//         id: 4,
//         text: 'Perfect! See you then.',
//         sender_id: 999,
//         from_me: true,
//         status: 'sent',
//         created_at: new Date(Date.now() - 1800000).toISOString(), // 30 min ago
//         sender_name: 'You',
//         type: 'text'
//       },
//       {
//         id: 5,
//         text: 'Voice message',
//         sender_id: 101,
//         from_me: false,
//         status: 'seen',
//         created_at: new Date(Date.now() - 900000).toISOString(), // 15 min ago
//         sender_name: user.name,
//         type: 'voice'
//       },
//     ];
//     setMessages(mockMessages);
//   };

//   const connectSocket = (token) => {
//     socketRef.current = io(SOCKET_URL, {
//       transports: ['websocket'],
//       auth: {
//         token: token
//       },
//       reconnection: true,
//       reconnectionDelay: 1000,
//       reconnectionAttempts: 5
//     });

//     // Connection events
//     socketRef.current.on('connected', (data) => {
//       console.log('✅ Connected to chat server:', data);
//       // Join the conversation room
//       socketRef.current.emit('join_conversation', { 
//         conversation_id: conversationId 
//       });
//     });

//     socketRef.current.on('joined_conversation', (data) => {
//       console.log('✅ Joined conversation:', data);
//     });

//     socketRef.current.on('connect_error', (error) => {
//       console.error('❌ Connection error:', error);
//       Alert.alert('Connection Error', 'Failed to connect to chat server');
//     });

//     // Listen for incoming messages
//     socketRef.current.on('new_message', (msg) => {
//       console.log('📨 New message received:', msg);

//       setMessages(prev => {
//         // Avoid duplicates
//         const exists = prev.some(m => m.id === msg.id);
//         if (exists) return prev;

//         return [...prev, {
//           ...msg,
//           from_me: msg.sender_id === currentUserId
//         }];
//       });

//       // Mark as seen if not from me
//       if (msg.sender_id !== currentUserId) {
//         markMessagesAsSeen([msg.id]);
//       }
//     });

//     // Listen for message status updates
//     socketRef.current.on('messages_seen', (payload) => {
//       console.log('👁️ Messages seen:', payload);

//       setMessages(prev =>
//         prev.map(m =>
//           payload.message_ids.includes(m.id) 
//             ? { ...m, status: 'seen' } 
//             : m
//         )
//       );
//     });

//     // Listen for typing indicator
//     socketRef.current.on('user_typing', (data) => {
//       if (data.user_id !== currentUserId) {
//         setTyping(data.typing);
//       }
//     });

//     // Error handling
//     socketRef.current.on('error', (error) => {
//       console.error('❌ Socket error:', error);
//       Alert.alert('Error', error.message || 'Something went wrong');
//     });
//   };

//   const sendMessage = (type = 'text') => {
//     if (!input.trim() && type === 'text') return;

//     const messageData = {
//       conversation_id: conversationId,
//       type: type,
//       text: type === 'text' ? input.trim() : 'Voice message',
//       file_url: null,
//     };

//     // Add message to UI immediately (optimistic update)
//     const tempMessage = {
//       id: Date.now(),
//       ...messageData,
//       sender_id: currentUserId,
//       from_me: true,
//       status: 'sent',
//       created_at: new Date().toISOString(),
//       sender_name: 'You'
//     };

//     setMessages(prev => [...prev, tempMessage]);
//     setInput('');

//     // Send via Socket.IO if connected, otherwise just add to UI for testing
//     if (socketRef.current && socketRef.current.connected) {
//       socketRef.current.emit('send_message', messageData);
//     } else {
//       console.log('Testing mode: Message added to UI only');
//       // In testing mode, no server connection needed
//     }
//   };

//   const markMessagesAsSeen = (messageIds) => {
//     if (socketRef.current && socketRef.current.connected) {
//       socketRef.current.emit('mark_seen', {
//         conversation_id: conversationId,
//         message_ids: messageIds
//       });
//     }
//   };

//   const handleTyping = (text) => {
//     setInput(text);

//     // Emit typing indicator
//     if (socketRef.current && socketRef.current.connected) {
//       socketRef.current.emit('typing', { 
//         conversation_id: conversationId, 
//         typing: true 
//       });

//       // Clear previous timeout
//       if (typingTimeoutRef.current) {
//         clearTimeout(typingTimeoutRef.current);
//       }

//       // Stop typing after 2 seconds
//       typingTimeoutRef.current = setTimeout(() => {
//         socketRef.current.emit('typing', { 
//           conversation_id: conversationId, 
//           typing: false 
//         });
//       }, 2000);
//     }
//   };

//   const toggleRecording = () => {
//     if (!recording) {
//       setRecording(true);
//       // TODO: Start audio recording
//     } else {
//       setRecording(false);
//       // TODO: Stop audio recording and upload
//       sendMessage('voice');
//     }
//   };

//   const handleCall = () => {
//     Alert.alert(
//       'Call ' + user.name,
//       'Start a voice call?',
//       [
//         { text: 'Cancel', style: 'cancel' },
//         { 
//           text: 'Call', 
//           onPress: () => {
//             // TODO: Implement calling functionality
//             console.log('Initiating call...');
//           }
//         },
//       ]
//     );
//   };

//   const showOptionsMenu = () => {
//     const options = ['Block User', 'Report User', 'Clear Chat', 'Cancel'];

//     if (Platform.OS === 'ios') {
//       ActionSheetIOS.showActionSheetWithOptions(
//         {
//           options,
//           destructiveButtonIndex: 0,
//           cancelButtonIndex: 3,
//         },
//         buttonIndex => {
//           if (buttonIndex === 0) handleBlock();
//           else if (buttonIndex === 1) handleReport();
//           else if (buttonIndex === 2) handleClearChat();
//         }
//       );
//     } else {
//       Alert.alert(
//         'Options',
//         '',
//         [
//           { text: 'Block User', onPress: handleBlock, style: 'destructive' },
//           { text: 'Report User', onPress: handleReport },
//           { text: 'Clear Chat', onPress: handleClearChat },
//           { text: 'Cancel', style: 'cancel' },
//         ]
//       );
//     }
//   };

//   const handleBlock = () => {
//     Alert.alert('Block User', 'Are you sure?', [
//       { text: 'Cancel', style: 'cancel' },
//       { 
//         text: 'Block', 
//         style: 'destructive',
//         onPress: () => {
//           // TODO: Call API to block user
//           console.log('User blocked');
//         }
//       },
//     ]);
//   };

//   const handleReport = () => {
//     Alert.alert('Report User', 'Report this user?', [
//       { text: 'Cancel', style: 'cancel' },
//       { 
//         text: 'Report', 
//         style: 'destructive',
//         onPress: () => {
//           // TODO: Call API to report user
//           console.log('User reported');
//         }
//       },
//     ]);
//   };

//   const handleClearChat = () => {
//     Alert.alert('Clear Chat', 'Delete all messages?', [
//       { text: 'Cancel', style: 'cancel' },
//       { 
//         text: 'Clear', 
//         style: 'destructive',
//         onPress: () => setMessages([])
//       },
//     ]);
//   };

//   const handleLongPressMessage = (message) => {
//     const options = ['Copy', 'Delete', 'Report', 'Cancel'];

//     if (Platform.OS === 'ios') {
//       ActionSheetIOS.showActionSheetWithOptions(
//         {
//           options,
//           destructiveButtonIndex: 1,
//           cancelButtonIndex: 3,
//         },
//         buttonIndex => {
//           if (buttonIndex === 0) copyMessage(message);
//           else if (buttonIndex === 1) deleteMessage(message.id);
//           else if (buttonIndex === 2) reportMessage(message);
//         }
//       );
//     } else {
//       Alert.alert(
//         'Message Options',
//         '',
//         [
//           { text: 'Copy', onPress: () => copyMessage(message) },
//           { 
//             text: 'Delete', 
//             onPress: () => deleteMessage(message.id),
//             style: 'destructive' 
//           },
//           { text: 'Report', onPress: () => reportMessage(message) },
//           { text: 'Cancel', style: 'cancel' },
//         ]
//       );
//     }
//   };

//   const copyMessage = (message) => {
//     // TODO: Copy to clipboard
//     console.log('Copy:', message.text);
//   };

//   const deleteMessage = (messageId) => {
//     setMessages(prev => prev.filter(m => m.id !== messageId));
//   };

//   const reportMessage = (message) => {
//     console.log('Report message:', message.id);
//   };

//   const renderStatusIcon = (status) => {
//     if (status === 'sent') 
//       return <Icon name="checkmark" size={14} color={Colors.gray} />;
//     if (status === 'delivered')
//       return <Icon name="checkmark-done" size={14} color={Colors.gray} />;
//     if (status === 'seen')
//       return <Icon name="checkmark-done" size={14} color={Colors.primary} />;
//     return null;
//   };

//   const renderMessage = ({ item, index }) => {
//     const isMine = item.from_me;
//     const prev = messages[index - 1];
//     const showDateDivider =
//       !prev ||
//       new Date(prev.created_at).toDateString() !==
//         new Date(item.created_at).toDateString();

//     return (
//       <>
//         {showDateDivider && (
//           <View style={styles.dateDivider}>
//             <Text style={styles.dateDividerText}>
//               {new Date(item.created_at).toLocaleDateString('en-IN', {
//                 day: 'numeric',
//                 month: 'short',
//                 year: 'numeric',
//               })}
//             </Text>
//           </View>
//         )}
//         <TouchableOpacity
//           activeOpacity={0.8}
//           onLongPress={() => handleLongPressMessage(item)}
//           style={[
//             styles.messageRow,
//             isMine ? styles.messageRowRight : styles.messageRowLeft,
//           ]}>
//           <View
//             style={[
//               styles.bubble,
//               isMine ? styles.bubbleRight : styles.bubbleLeft,
//             ]}>
//             {item.type === 'voice' ? (
//               <View style={styles.voiceRow}>
//                 <Icon name="mic" size={18} color={isMine ? Colors.white : Colors.primary} />
//                 <View style={styles.waveformContainer}>
//                   <View style={styles.waveform}>
//                     {[...Array(20)].map((_, i) => (
//                       <View
//                         key={i}
//                         style={[
//                           styles.waveformBar,
//                           { 
//                             height: Math.random() * 20 + 8,
//                             backgroundColor: isMine ? Colors.white : Colors.primary 
//                           },
//                         ]}
//                       />
//                     ))}
//                   </View>
//                   <Text style={[styles.voiceDuration, isMine && styles.voiceDurationMine]}>
//                     0:45
//                   </Text>
//                 </View>
//                 <TouchableOpacity>
//                   <Icon 
//                     name="play" 
//                     size={20} 
//                     color={isMine ? Colors.white : Colors.primary} 
//                   />
//                 </TouchableOpacity>
//               </View>
//             ) : (
//               <Text style={[styles.messageText, isMine && styles.messageTextMine]}>
//                 {item.text}
//               </Text>
//             )}
//             <View style={styles.metaRow}>
//               <Text style={[styles.timeText, isMine && styles.timeTextMine]}>
//                 {new Date(item.created_at).toLocaleTimeString('en-IN', {
//                   hour: '2-digit',
//                   minute: '2-digit',
//                 })}
//               </Text>
//               {isMine && (
//                 <View style={styles.statusIcon}>
//                   {renderStatusIcon(item.status)}
//                 </View>
//               )}
//             </View>
//           </View>
//         </TouchableOpacity>
//       </>
//     );
//   };

//   return (
//     <SafeAreaView style={styles.container}>
//       {/* HEADER */}
//       <View style={styles.header}>
//         <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
//           <Icon name="chevron-back" size={28} color={Colors.secondary} />
//         </TouchableOpacity>

//         <View style={styles.headerCenter}>
//           <View style={styles.avatarSmall}>
//             <Text style={styles.avatarSmallText}>{user.name.charAt(0)}</Text>
//           </View>
//           <View style={styles.headerTextContainer}>
//             <Text style={styles.userName}>{user.name}</Text>
//             <Text style={styles.tripInfo}>{user.tripInfo || 'Active'}</Text>
//           </View>
//         </View>

//         <View style={styles.headerActions}>
//           <TouchableOpacity style={styles.iconButton} onPress={handleCall}>
//             <Icon name="call" size={25} color={Colors.primary} />
//           </TouchableOpacity>
//           <TouchableOpacity style={styles.iconButton} onPress={showOptionsMenu}>
//             <Icon name="ellipsis-vertical" size={25} color={Colors.dark} />
//           </TouchableOpacity>
//         </View>
//       </View>

//       {/* MESSAGES */}
//       <KeyboardAvoidingView
//         style={styles.keyboardView}
//         behavior={Platform.OS === 'ios' ? 'padding' : undefined}
//         keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 0}>

//         <FlatList
//           ref={flatListRef}
//           data={messages}
//           keyExtractor={(item, index) => item.id?.toString() || index.toString()}
//           renderItem={renderMessage}
//           contentContainerStyle={styles.listContent}
//           showsVerticalScrollIndicator={false}
//           onContentSizeChange={() =>
//             flatListRef.current?.scrollToEnd({ animated: true })
//           }
//         />

//         {/* TYPING INDICATOR */}
//         {typing && (
//           <View style={styles.typingContainer}>
//             <View style={styles.typingBubble}>
//               <View style={styles.typingDot} />
//               <View style={[styles.typingDot, styles.typingDotDelay1]} />
//               <View style={[styles.typingDot, styles.typingDotDelay2]} />
//             </View>
//           </View>
//         )}

//         {/* INPUT BAR */}
//         <View style={styles.inputBar}>
//           <TouchableOpacity style={styles.attachButton}>
//             <Icon name="add-circle" size={32} color={Colors.secondary} />
//           </TouchableOpacity>

//           <View style={styles.inputWrapper}>
//             <TextInput
//               value={input}
//               onChangeText={handleTyping}
//               style={styles.textInput}
//               placeholder="Type a message..."
//               placeholderTextColor={Colors.gray}
//               multiline
//               maxLength={500}
//             />
//           </View>

//           {input.trim() ? (
//             <TouchableOpacity
//               style={styles.sendButton}
//               onPress={() => sendMessage('text')}>
//               <Icon name="send" size={20} color={Colors.white} />
//             </TouchableOpacity>
//           ) : (
//             <TouchableOpacity
//               style={[
//                 styles.micButton,
//                 recording && styles.micButtonRecording,
//               ]}
//               onPress={toggleRecording}>
//               <Icon name={recording ? 'stop' : 'mic'} size={20} color={Colors.white} />
//             </TouchableOpacity>
//           )}
//         </View>
//       </KeyboardAvoidingView>
//     </SafeAreaView>
//   );
// };

// export default ChatScreen;

// // Styles remain the same as before
// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     backgroundColor: Colors.white,
//   },
//   header: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     paddingHorizontal: 12,
//     paddingVertical: 10,
//     backgroundColor: Colors.white,
//     borderBottomWidth: 0.5,
//     borderBottomColor: '#E0E0E0',
//     elevation: 2,
//     shadowColor: Colors.black,
//     shadowOffset: { width: 0, height: 1 },
//     shadowOpacity: 0.1,
//     shadowRadius: 1,
//   },
//   backButton: {
//     padding: 4,
//   },
//   headerCenter: {
//     flex: 1,
//     flexDirection: 'row',
//     alignItems: 'center',
//     marginLeft: 8,
//   },
//   avatarSmall: {
//     width: 40,
//     height: 40,
//     borderRadius: 20,
//     backgroundColor: Colors.primary,
//     justifyContent: 'center',
//     alignItems: 'center',
//   },
//   avatarSmallText: {
//     ...Typography.h4,
//     color: Colors.white,
//   },
//   headerTextContainer: {
//     marginLeft: 10,
//     flex: 1,
//   },
//   userName: {
//     ...Typography.h4,
//     color: Colors.dark,
//   },
//   tripInfo: {
//     ...Typography.caption,
//     fontSize: 12,
//     color: Colors.primary,
//   },
//   headerActions: {
//     flexDirection: 'row',
//     alignItems: 'center',
//   },
//   iconButton: {
//     padding: 8,
//     marginLeft: 4,
//   },
//   keyboardView: {
//     flex: 1,
//   },
//   listContent: {
//     paddingVertical: 12,
//     paddingHorizontal: 12,
//   },
//   dateDivider: {
//     alignSelf: 'center',
//     backgroundColor: Colors.gray + '30',
//     borderRadius: 12,
//     paddingHorizontal: 12,
//     paddingVertical: 5,
//     marginVertical: 10,
//   },
//   dateDividerText: {
//     ...Typography.caption,
//     fontSize: 11,
//     color: Colors.dark,
//   },
//   messageRow: {
//     marginVertical: 3,
//     flexDirection: 'row',
//     maxWidth: '80%',
//   },
//   messageRowLeft: {
//     justifyContent: 'flex-start',
//     alignSelf: 'flex-start',
//   },
//   messageRowRight: {
//     justifyContent: 'flex-end',
//     alignSelf: 'flex-end',
//   },
//   bubble: {
//     borderRadius: 16,
//     paddingHorizontal: 14,
//     paddingVertical: 10,
//     elevation: 1,
//     shadowColor: Colors.black,
//     shadowOffset: { width: 0, height: 1 },
//     shadowOpacity: 0.1,
//     shadowRadius: 2,
//   },
//   bubbleLeft: {
//     backgroundColor: Colors.white,
//     borderBottomLeftRadius: 4,
//   },
//   bubbleRight: {
//     backgroundColor: Colors.primary,
//     borderBottomRightRadius: 4,
//   },
//   messageText: {
//     ...Typography.body2,
//     fontSize: 15,
//     color: Colors.dark,
//     lineHeight: 20,
//   },
//   messageTextMine: {
//     color: Colors.white,
//   },
//   voiceRow: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     minWidth: 200,
//   },
//   waveformContainer: {
//     flex: 1,
//     marginHorizontal: 10,
//   },
//   waveform: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     height: 28,
//     gap: 2,
//   },
//   waveformBar: {
//     width: 2,
//     borderRadius: 1,
//   },
//   voiceDuration: {
//     ...Typography.caption,
//     fontSize: 11,
//     color: Colors.primary,
//     marginTop: 2,
//   },
//   voiceDurationMine: {
//     color: Colors.white,
//   },
//   metaRow: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     alignSelf: 'flex-end',
//     marginTop: 4,
//   },
//   timeText: {
//     ...Typography.caption,
//     fontSize: 10,
//     color: Colors.gray,
//   },
//   timeTextMine: {
//     color: Colors.white + 'CC',
//   },
//   statusIcon: {
//     marginLeft: 4,
//   },
//   typingContainer: {
//     paddingHorizontal: 12,
//     paddingVertical: 8,
//   },
//   typingBubble: {
//     flexDirection: 'row',
//     backgroundColor: Colors.white,
//     alignSelf: 'flex-start',
//     paddingHorizontal: 16,
//     paddingVertical: 12,
//     borderRadius: 16,
//     borderBottomLeftRadius: 4,
//     gap: 4,
//   },
//   typingDot: {
//     width: 8,
//     height: 8,
//     borderRadius: 4,
//     backgroundColor: Colors.gray,
//   },
//   inputBar: {
//     flexDirection: 'row',
//     alignItems: 'flex-end',
//     paddingHorizontal: 12,
//     paddingVertical: 10,
//     backgroundColor: Colors.white,
//     borderTopWidth: 1,
//     borderTopColor: '#E0E0E0',
//   },
//   attachButton: {
//     marginBottom: 6,
//     marginRight: 8,
//   },
//   inputWrapper: {
//     flex: 1,
//     backgroundColor: Colors.white,
//     borderRadius: 20,
//     borderColor: Colors.gray,
//     borderWidth: 1.5,
//     paddingHorizontal: 16,
//     //paddingVertical: 10,
//     paddingTop: 8,
//     paddingBottom: 10,
//     maxHeight: 100,
//     justifyContent: 'center',
//     textAlignVertical: 'center',
//   },
//   textInput: {
//     ...Typography.input,
//     fontSize: 20,
//     color: Colors.dark,
//     maxHeight: 80,
//   },
//   sendButton: {
//     marginLeft: 8,
//     marginBottom: 6,
//     backgroundColor: Colors.primary,
//     borderRadius: 20,
//     width: 40,
//     height: 40,
//     justifyContent: 'center',
//     alignItems: 'center',
//   },
//   micButton: {
//     marginLeft: 8,
//     marginBottom: 6,
//     backgroundColor: Colors.success,
//     borderRadius: 20,
//     width: 32,
//     height: 32,
//     justifyContent: 'center',
//     alignItems: 'center',
//   },
//   micButtonRecording: {
//     backgroundColor: Colors.error,
//   },
// });
import React, { useEffect, useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TextInput,
  TouchableOpacity,
  SafeAreaView,
  KeyboardAvoidingView,
  Platform,
  Alert,
  ActionSheetIOS,
  Dimensions,
  Keyboard,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import io from 'socket.io-client';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Colors, Typography } from '../constants/Colors';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const { width, height } = Dimensions.get('window');

// Responsive scaling functions matching CommonHeader
const scale = (size) => (width / 375) * size;
const verticalScale = (size) => (height / 812) * size;
const moderateScale = (size, factor = 0.5) => size + (scale(size) - size) * factor;
import { API_URL } from "../config/config_ip";
import { useAuth } from '../context/AuthContext';


const ChatScreen = ({ route, navigation }) => {
  const { user: currentUser, token } = useAuth();
  const { user, conversationId } = route.params;
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [recording, setRecording] = useState(false);
  const [typing, setTyping] = useState(false);
  const currentUserId = currentUser?.id;
  
  const socketRef = useRef(null);
  const flatListRef = useRef(null);
  const typingTimeoutRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    navigation.setOptions({ headerShown: false });
    initializeChat();

    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
      }
    };
  }, []);

  // Scroll to bottom when messages change
  useEffect(() => {
    setTimeout(() => {
      flatListRef.current?.scrollToEnd({ animated: true });
    }, 100);
  }, [messages]);

  const initializeChat = async () => {
    try {

      // Load existing messages
      await loadMessages(token);

      // Connect socket
      connectSocket(token);

    } catch (error) {
      console.error('Initialize chat error:', error);
      Alert.alert('Error', 'Failed to initialize chat');
    }
  };

  const loadMessages = async (token) => {
    try {
      const response = await fetch(
        `${API_URL}/api/chat/conversations/${conversationId}/messages`,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }
      );

      const data = await response.json();

      if (data.success) {
        setMessages(data.messages);
      }
    } catch (error) {
      console.error('Load messages error:', error);
    }
  };

  const loadMockMessages = () => {
    const mockMessages = [
      {
        id: 1,
        text: 'Hey there! Ready for the trip?',
        sender_id: 101,
        from_me: false,
        status: 'seen',
        created_at: '2026-02-12T18:28:00.000Z',
        sender_name: 'Sarah Wilson',
        type: 'text'
      },
      {
        id: 2,
        text: 'Yes, I am! What time should we meet?',
        sender_id: 999,
        from_me: true,
        status: 'sent',
        created_at: '2026-02-12T18:33:00.000Z',
        sender_name: 'You',
        type: 'text'
      },
      {
        id: 3,
        text: 'Let\'s meet at 8 AM at the pickup point.',
        sender_id: 101,
        from_me: false,
        status: 'seen',
        created_at: '2026-02-12T18:38:00.000Z',
        sender_name: 'Sarah Wilson',
        type: 'text'
      },
      {
        id: 4,
        text: 'Perfect! See you then.',
        sender_id: 999,
        from_me: true,
        status: 'sent',
        created_at: '2026-02-12T18:58:00.000Z',
        sender_name: 'You',
        type: 'text'
      },
      {
        id: 5,
        text: 'Voice message',
        sender_id: 101,
        from_me: false,
        status: 'seen',
        created_at: '2026-02-12T19:13:00.000Z',
        sender_name: 'Sarah Wilson',
        type: 'voice',
        duration: '0:45'
      },
    ];
    setMessages(mockMessages);
  };

  const connectSocket = (token) => {
    socketRef.current = io(SOCKET_URL, {
      transports: ['websocket'],
      auth: {
        token: token
      },
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionAttempts: 5
    });

    socketRef.current.on('connected', (data) => {
      console.log('✅ Connected to chat server:', data);
      socketRef.current.emit('join_conversation', { 
        conversation_id: conversationId 
      });
    });

    socketRef.current.on('joined_conversation', (data) => {
      console.log('✅ Joined conversation:', data);
    });

    socketRef.current.on('connect_error', (error) => {
      console.error('❌ Connection error:', error);
      Alert.alert('Connection Error', 'Failed to connect to chat server');
    });

    socketRef.current.on('new_message', (msg) => {
      console.log('📨 New message received:', msg);

      setMessages(prev => {
        const exists = prev.some(m => m.id === msg.id);
        if (exists) return prev;

        return [...prev, {
          ...msg,
          from_me: msg.sender_id === currentUserId
        }];
      });

      if (msg.sender_id !== currentUserId) {
        markMessagesAsSeen([msg.id]);
      }
    });

    socketRef.current.on('messages_seen', (payload) => {
      console.log('👁️ Messages seen:', payload);

      setMessages(prev =>
        prev.map(m =>
          payload.message_ids.includes(m.id) 
            ? { ...m, status: 'seen' } 
            : m
        )
      );
    });

    socketRef.current.on('user_typing', (data) => {
      if (data.user_id !== currentUserId) {
        setTyping(data.typing);
      }
    });

    socketRef.current.on('error', (error) => {
      console.error('❌ Socket error:', error);
      Alert.alert('Error', error.message || 'Something went wrong');
    });
  };

  const sendMessage = (type = 'text') => {
    if (!input.trim() && type === 'text') return;

    const messageData = {
      conversation_id: conversationId,
      type: type,
      text: type === 'text' ? input.trim() : 'Voice message',
      file_url: null,
    };

    const tempMessage = {
      id: Date.now(),
      ...messageData,
      sender_id: currentUserId,
      from_me: true,
      status: 'sent',
      created_at: new Date().toISOString(),
      sender_name: 'You'
    };

    setMessages(prev => [...prev, tempMessage]);
    setInput('');

    if (socketRef.current && socketRef.current.connected) {
      socketRef.current.emit('send_message', messageData);
    } else {
      console.log('Testing mode: Message added to UI only');
    }
  };

  const markMessagesAsSeen = (messageIds) => {
    if (socketRef.current && socketRef.current.connected) {
      socketRef.current.emit('mark_seen', {
        conversation_id: conversationId,
        message_ids: messageIds
      });
    }
  };

  const handleTyping = (text) => {
    setInput(text);

    if (socketRef.current && socketRef.current.connected) {
      socketRef.current.emit('typing', { 
        conversation_id: conversationId, 
        typing: true 
      });

      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }

      typingTimeoutRef.current = setTimeout(() => {
        socketRef.current.emit('typing', { 
          conversation_id: conversationId, 
          typing: false 
        });
      }, 2000);
    }
  };

  const toggleRecording = () => {
    if (!recording) {
      setRecording(true);
    } else {
      setRecording(false);
      sendMessage('voice');
    }
  };

  const handleCall = () => {
    Alert.alert(
      'Call ' + user.name,
      'Start a voice call?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Call', 
          onPress: () => {
            console.log('Initiating call...');
          }
        },
      ]
    );
  };

  const showOptionsMenu = () => {
    const options = ['Block User', 'Report User', 'Clear Chat', 'Cancel'];

    if (Platform.OS === 'ios') {
      ActionSheetIOS.showActionSheetWithOptions(
        {
          options,
          destructiveButtonIndex: 0,
          cancelButtonIndex: 3,
        },
        buttonIndex => {
          if (buttonIndex === 0) handleBlock();
          else if (buttonIndex === 1) handleReport();
          else if (buttonIndex === 2) handleClearChat();
        }
      );
    } else {
      Alert.alert(
        'Options',
        '',
        [
          { text: 'Block User', onPress: handleBlock, style: 'destructive' },
          { text: 'Report User', onPress: handleReport },
          { text: 'Clear Chat', onPress: handleClearChat },
          { text: 'Cancel', style: 'cancel' },
        ]
      );
    }
  };

  const handleBlock = () => {
    Alert.alert('Block User', 'Are you sure?', [
      { text: 'Cancel', style: 'cancel' },
      { 
        text: 'Block', 
        style: 'destructive',
        onPress: () => {
          console.log('User blocked');
        }
      },
    ]);
  };

  const handleReport = () => {
    Alert.alert('Report User', 'Report this user?', [
      { text: 'Cancel', style: 'cancel' },
      { 
        text: 'Report', 
        style: 'destructive',
        onPress: () => {
          console.log('User reported');
        }
      },
    ]);
  };

  const handleClearChat = () => {
    Alert.alert('Clear Chat', 'Delete all messages?', [
      { text: 'Cancel', style: 'cancel' },
      { 
        text: 'Clear', 
        style: 'destructive',
        onPress: () => setMessages([])
      },
    ]);
  };

  const handleLongPressMessage = (message) => {
    const options = ['Copy', 'Delete', 'Report', 'Cancel'];

    if (Platform.OS === 'ios') {
      ActionSheetIOS.showActionSheetWithOptions(
        {
          options,
          destructiveButtonIndex: 1,
          cancelButtonIndex: 3,
        },
        buttonIndex => {
          if (buttonIndex === 0) copyMessage(message);
          else if (buttonIndex === 1) deleteMessage(message.id);
          else if (buttonIndex === 2) reportMessage(message);
        }
      );
    } else {
      Alert.alert(
        'Message Options',
        '',
        [
          { text: 'Copy', onPress: () => copyMessage(message) },
          { 
            text: 'Delete', 
            onPress: () => deleteMessage(message.id),
            style: 'destructive' 
          },
          { text: 'Report', onPress: () => reportMessage(message) },
          { text: 'Cancel', style: 'cancel' },
        ]
      );
    }
  };

  const copyMessage = (message) => {
    console.log('Copy:', message.text);
  };

  const deleteMessage = (messageId) => {
    setMessages(prev => prev.filter(m => m.id !== messageId));
  };

  const reportMessage = (message) => {
    console.log('Report message:', message.id);
  };

  const renderStatusIcon = (status) => {
    if (status === 'sent') 
      return <Icon name="checkmark" size={moderateScale(14)} color={Colors.gray} />;
    if (status === 'delivered')
      return <Icon name="checkmark-done" size={moderateScale(14)} color={Colors.gray} />;
    if (status === 'seen')
      return <Icon name="checkmark-done" size={moderateScale(14)} color={Colors.primary} />;
    return null;
  };

  const formatTime = (timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString('en-IN', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    }).toLowerCase().replace(' ', '');
  };

  const renderMessage = ({ item, index }) => {
    const isMine = item.from_me;
    const prev = messages[index - 1];
    
    const showDateDivider =
      !prev ||
      new Date(prev.created_at).toDateString() !==
        new Date(item.created_at).toDateString();

    const messageDate = new Date(item.created_at);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    
    let dateText = '';
    if (messageDate.toDateString() === today.toDateString()) {
      dateText = 'Today';
    } else if (messageDate.toDateString() === yesterday.toDateString()) {
      dateText = 'Yesterday';
    } else {
      dateText = messageDate.toLocaleDateString('en-IN', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
      });
    }

    return (
      <View key={item.id}>
        {showDateDivider && (
          <View style={styles.dateDivider}>
            <Text style={styles.dateDividerText}>{dateText}</Text>
          </View>
        )}
        
        <View style={[
          styles.messageWrapper,
          isMine ? styles.messageWrapperRight : styles.messageWrapperLeft
        ]}>
          <View style={[
            styles.bubble,
            isMine ? styles.bubbleRight : styles.bubbleLeft
          ]}>
            
            {item.type === 'voice' ? (
              <View style={styles.voiceContainer}>
                <TouchableOpacity style={styles.playButton}>
                  <Icon 
                    name="play" 
                    size={moderateScale(16)} 
                    color={isMine ? Colors.white : Colors.primary} 
                  />
                </TouchableOpacity>
                <View style={styles.voiceInfo}>
                  <View style={styles.waveformContainer}>
                    {[...Array(12)].map((_, i) => (
                      <View
                        key={i}
                        style={[
                          styles.waveformBar,
                          { 
                            height: Math.random() * verticalScale(12) + verticalScale(4),
                            backgroundColor: isMine ? Colors.white : Colors.primary,
                          },
                        ]}
                      />
                    ))}
                  </View>
                  <Text style={[
                    styles.voiceDuration,
                    isMine && styles.voiceDurationMine
                  ]}>
                    {item.duration || '0:45'}
                  </Text>
                </View>
              </View>
            ) : (
              <Text style={[
                styles.messageText,
                isMine && styles.messageTextMine
              ]}>
                {item.text}
              </Text>
            )}
            
            <View style={[
              styles.metaContainer,
              isMine ? styles.metaContainerRight : styles.metaContainerLeft
            ]}>
              <Text style={[
                styles.timeText,
                isMine && styles.timeTextMine
              ]}>
                {formatTime(item.created_at)}
              </Text>
              {isMine && (
                <View style={styles.statusIcon}>
                  {renderStatusIcon(item.status)}
                </View>
              )}
            </View>
          </View>
        </View>
      </View>
    );
  };

  // Calculate keyboard offset based on platform and insets
  const getKeyboardVerticalOffset = () => {
    if (Platform.OS === 'ios') {
      return insets.top + 44; // Header height + status bar
    }
    return 0;
  };

  return (
    <View style={styles.container}>
      {/* HEADER - EXACT MATCH WITH COMMONHEADER SPACING */}
      <View style={[styles.header, { paddingTop: insets.top }]}>
        {/* Left - Fixed width container for perfect centering */}
        <View style={styles.sideContainer}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
            activeOpacity={0.7}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Icon 
              name="chevron-back" 
              size={moderateScale(22)} 
              color={Colors.secondary} 
            />
          </TouchableOpacity>
        </View>

        {/* Center - Avatar and Name */}
        <View style={styles.headerCenter}>
          <View style={styles.avatarSmall}>
            <Text style={styles.avatarSmallText}>{user.name.charAt(0)}</Text>
          </View>
          <View style={styles.headerTextContainer}>
            <Text style={styles.userName} numberOfLines={1}>{user.name}</Text>
            <Text style={styles.tripInfo} numberOfLines={1}>{user.tripInfo || 'Active'}</Text>
          </View>
        </View>

        {/* Right - Fixed width container for perfect centering */}
        <View style={styles.sideContainer}>
          <TouchableOpacity
            style={styles.iconButton}
            onPress={handleCall}
            activeOpacity={0.7}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Icon name="call" size={moderateScale(22)} color={Colors.primary} />
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.iconButton}
            onPress={showOptionsMenu}
            activeOpacity={0.7}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Icon name="ellipsis-vertical" size={moderateScale(22)} color={Colors.dark} />
          </TouchableOpacity>
        </View>
      </View>

      {/* MESSAGES - KEYBOARD AVOIDING VIEW */}
      <KeyboardAvoidingView
        style={styles.keyboardView}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={getKeyboardVerticalOffset()}
      >
        <View style={styles.messagesContainer}>
          <FlatList
            ref={flatListRef}
            data={messages}
            keyExtractor={(item, index) => item.id?.toString() || index.toString()}
            renderItem={renderMessage}
            contentContainerStyle={styles.listContent}
            showsVerticalScrollIndicator={false}
            onContentSizeChange={() => {
              flatListRef.current?.scrollToEnd({ animated: true });
            }}
            onLayout={() => {
              flatListRef.current?.scrollToEnd({ animated: false });
            }}
          />
          
          {/* TYPING INDICATOR */}
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

   <View style={styles.inputBarContainer}>
  <View style={styles.inputBar}>
    {/* ATTACH BUTTON - 44x44 */}
    <TouchableOpacity 
      style={[styles.actionButton, { backgroundColor: 'transparent' }]}
      hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
      <Icon name="add-circle" size={moderateScale(48)} color={Colors.secondary} />
    </TouchableOpacity>

    {/* INPUT - EXACT 44px HEIGHT */}
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

    {/* SEND/MIC BUTTON - 44x44 */}
    {input.trim() ? (
      <TouchableOpacity
        style={[styles.actionButton, { backgroundColor: Colors.primary }]}
        onPress={() => sendMessage('text')}
        hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
        <Icon name="send" size={moderateScale(24)} color={Colors.white} />
      </TouchableOpacity>
    ) : (
      <TouchableOpacity
        style={[
          styles.actionButton, 
          { backgroundColor: recording ? Colors.error : Colors.success }
        ]}
        onPress={toggleRecording}
        hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
        <Icon name={recording ? 'stop' : 'mic'} size={moderateScale(24)} color={Colors.white} />
      </TouchableOpacity>
    )}
  </View>
</View>
      </KeyboardAvoidingView>
    </View>
  );
};

export default ChatScreen;

// STYLES - PERFECT ALIGNMENT & KEYBOARD HANDLING
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.white,
  },
  
  // HEADER - EXACT COMMONHEADER PATTERN
  header: {
    width: "100%",
    minHeight: verticalScale(30),
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: moderateScale(14),
    paddingBottom: verticalScale(8),
    backgroundColor: Colors.white,
    borderBottomWidth: 0.5,
    borderBottomColor: '#E0E0E0',
    zIndex: 10,
  },
  
  sideContainer: {
    width: scale(44),
    flexDirection: 'row',
    alignItems: "center",
    justifyContent: "center",
  },
  
  backButton: {
    width: scale(40),
    height: scale(40),
    borderRadius: scale(20),
    justifyContent: "center",
    alignItems: "center",
  },
  
  iconButton: {
    width: scale(40),
    height: scale(40),
    borderRadius: scale(20),
    justifyContent: "center",
    alignItems: "center",
    marginLeft: scale(4),
  },
  
  // CENTER CONTENT
  headerCenter: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-start',
    paddingHorizontal: scale(6),
  },
  
  avatarSmall: {
    width: scale(40),
    height: scale(40),
    borderRadius: scale(20),
    backgroundColor: Colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  
  avatarSmallText: {
    fontSize: moderateScale(18),
    fontWeight: '600',
    color: Colors.white,
  },
  
  headerTextContainer: {
    marginLeft: moderateScale(10),
    flex: 1,
  },
  
  userName: {
    fontSize: moderateScale(16),
    fontWeight: '600',
    color: Colors.dark,
  },
  
  tripInfo: {
    fontSize: moderateScale(12),
    color: Colors.primary,
    marginTop: verticalScale(2),
  },
  
  // KEYBOARD AVOIDING VIEW
  keyboardView: {
    flex: 1,
  },
  
  // MESSAGES CONTAINER
  messagesContainer: {
    flex: 1,
  },
  
  listContent: {
    paddingTop: verticalScale(12),
    paddingHorizontal: moderateScale(12),
    paddingBottom: verticalScale(8),
  },
  
  // DATE DIVIDER
  dateDivider: {
    alignSelf: 'center',
    backgroundColor: '#E8E8E8',
    borderRadius: moderateScale(100),
    paddingHorizontal: moderateScale(16),
    paddingVertical: verticalScale(6),
    marginVertical: verticalScale(12),
  },
  
  dateDividerText: {
    fontSize: moderateScale(12),
    color: Colors.dark,
    fontWeight: '500',
  },
  
  // MESSAGE WRAPPER
  messageWrapper: {
    marginBottom: verticalScale(4),
    width: '100%',
  },
  
  messageWrapperLeft: {
    alignItems: 'flex-start',
  },
  
  messageWrapperRight: {
    alignItems: 'flex-end',
  },
  
  // BUBBLE
  bubble: {
    borderRadius: moderateScale(18),
    paddingHorizontal: moderateScale(14),
    paddingVertical: verticalScale(8),
    maxWidth: width * 0.75,
    elevation: 1,
    shadowColor: Colors.black,
    shadowOffset: { width: 0, height: verticalScale(0.5) },
    shadowOpacity: 0.05,
    shadowRadius: moderateScale(1),
  },
  
  bubbleLeft: {
    backgroundColor: '#F0F0F0',
    borderBottomLeftRadius: moderateScale(4),
  },
  
  bubbleRight: {
    backgroundColor: Colors.primary,
    borderBottomRightRadius: moderateScale(4),
  },
  
  // TEXT MESSAGE
  messageText: {
    fontSize: moderateScale(15),
    color: Colors.dark,
    lineHeight: verticalScale(20),
    fontWeight: '400',
  },
  
  messageTextMine: {
    color: Colors.white,
  },
  
  // VOICE MESSAGE
  voiceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    width: moderateScale(180),
  },
  
  playButton: {
    width: scale(32),
    height: scale(32),
    borderRadius: scale(16),
    backgroundColor: Colors.white,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: moderateScale(8),
    elevation: 1,
    shadowColor: Colors.black,
    shadowOffset: { width: 0, height: verticalScale(0.5) },
    shadowOpacity: 0.1,
    shadowRadius: moderateScale(1),
  },
  
  voiceInfo: {
    flex: 1,
  },
  
  waveformContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    height: verticalScale(24),
    gap: moderateScale(2),
    marginBottom: verticalScale(2),
  },
  
  waveformBar: {
    width: moderateScale(2.5),
    borderRadius: moderateScale(1),
  },
  
  voiceDuration: {
    fontSize: moderateScale(11),
    color: Colors.primary,
    fontWeight: '500',
  },
  
  voiceDurationMine: {
    color: Colors.white,
  },
  
  // META CONTAINER
  metaContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: verticalScale(2),
  },
  
  metaContainerLeft: {
    justifyContent: 'flex-start',
  },
  
  metaContainerRight: {
    justifyContent: 'flex-end',
  },
  
  timeText: {
    fontSize: moderateScale(10),
    color: '#8E8E93',
    fontWeight: '400',
  },
  
  timeTextMine: {
    color: 'rgba(255, 255, 255, 0.8)',
  },
  
  statusIcon: {
    marginLeft: moderateScale(4),
  },
  
  // TYPING INDICATOR
  typingWrapper: {
    width: '100%',
    alignItems: 'flex-start',
    paddingLeft: moderateScale(12),
    marginBottom: verticalScale(8),
  },
  
  typingBubble: {
    flexDirection: 'row',
    backgroundColor: '#F0F0F0',
    paddingHorizontal: moderateScale(16),
    paddingVertical: verticalScale(10),
    borderRadius: moderateScale(18),
    borderBottomLeftRadius: moderateScale(4),
    gap: moderateScale(4),
    alignSelf: 'flex-start',
  },
  
  typingDot: {
    width: moderateScale(6),
    height: moderateScale(6),
    borderRadius: moderateScale(3),
    backgroundColor: '#8E8E93',
  },
  
  typingDotDelay1: {
    opacity: 0.7,
  },
  
  typingDotDelay2: {
    opacity: 0.4,
  },
  
// INPUT BAR - PERFECTLY ALIGNED, ALL ELEMENTS SAME SIZE
inputBarContainer: {
  backgroundColor: Colors.white,
  borderTopWidth: 0.5,
  borderTopColor: '#E0E0E0',
},

inputBar: {
  flexDirection: 'row',
  alignItems: 'center', // Perfect vertical center
  justifyContent: 'space-between',
  paddingHorizontal: moderateScale(12),
  paddingVertical: verticalScale(8),
  backgroundColor: Colors.white,
  gap: moderateScale(8), // Equal spacing between all elements
},

// UNIVERSAL BUTTON STYLE - ALL BUTTONS EXACTLY THE SAME
actionButton: {
  width: scale(44),
  height: scale(44),
  borderRadius: scale(22), // Perfect circle
  backgroundColor: Colors.primary, // Default for send
  justifyContent: 'center',
  alignItems: 'center',

},

// Override for attach button (different color, same size)
attachButton: {
  backgroundColor: 'transparent', // No background for plus icon
},

// Override for mic button
micButtonRecording: {
  backgroundColor: Colors.error,
},

// INPUT WRAPPER - EXACT SAME HEIGHT AS BUTTONS
inputWrapper: {
  flex: 1,
  height: scale(44), // EXACT same height as buttons
  backgroundColor: '#F8F8F8',
  borderRadius: scale(22), // Same border radius as buttons
  borderWidth: 0.5,
  borderColor: '#E0E0E0',
  paddingHorizontal: moderateScale(16),
  justifyContent: 'center', // Center text vertically
},

textInput: {
  fontSize: moderateScale(16),
  color: Colors.dark,
  paddingVertical: 0,
  textAlignVertical: 'center', // Android vertical center
  includeFontPadding: false, // Remove extra padding
  lineHeight: Platform.OS === 'ios' ? verticalScale(20) : undefined, // Consistent height
},
  
  sendButton: {
    marginLeft: moderateScale(8),
    marginBottom: verticalScale(6),
    backgroundColor: Colors.primary,
    borderRadius: scale(24),
    width: scale(42),
    height: scale(42),
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 2,
    shadowColor: Colors.black,
    shadowOffset: { width: 0, height: verticalScale(1) },
    shadowOpacity: 0.1,
    shadowRadius: moderateScale(1),
  },
  
  micButton: {
    marginLeft: moderateScale(8),
    marginBottom: verticalScale(6),
    backgroundColor: Colors.success,
    borderRadius: scale(24),
    width: scale(42),
    height: scale(42),
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 2,
    shadowColor: Colors.black,
    shadowOffset: { width: 0, height: verticalScale(1) },
    shadowOpacity: 0.1,
    shadowRadius: moderateScale(1),
  },
  
  micButtonRecording: {
    backgroundColor: Colors.error,
  },
});