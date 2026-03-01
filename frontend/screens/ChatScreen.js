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
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import io from 'socket.io-client';
import { useAuth } from '../context/AuthContext';
import { Colors, Typography } from '../constants/Colors';

const API_URL = 'http://192.168.1.2:8000'; // Your FastAPI server URL
const SOCKET_URL = 'http://192.168.1.2:8000'; // Socket.IO URL

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

  useEffect(() => {
    navigation.setOptions({ headerShown: false });
    initializeChat();

    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
      }
    };
  }, []);

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
        created_at: new Date(Date.now() - 3600000).toISOString(), // 1 hour ago
        sender_name: user.name,
        type: 'text'
      },
      {
        id: 2,
        text: 'Yes, I am! What time should we meet?',
        sender_id: 999,
        from_me: true,
        status: 'sent',
        created_at: new Date(Date.now() - 3300000).toISOString(), // 55 min ago
        sender_name: 'You',
        type: 'text'
      },
      {
        id: 3,
        text: 'Let\'s meet at 8 AM at the pickup point.',
        sender_id: 101,
        from_me: false,
        status: 'seen',
        created_at: new Date(Date.now() - 3000000).toISOString(), // 50 min ago
        sender_name: user.name,
        type: 'text'
      },
      {
        id: 4,
        text: 'Perfect! See you then.',
        sender_id: 999,
        from_me: true,
        status: 'sent',
        created_at: new Date(Date.now() - 1800000).toISOString(), // 30 min ago
        sender_name: 'You',
        type: 'text'
      },
      {
        id: 5,
        text: 'Voice message',
        sender_id: 101,
        from_me: false,
        status: 'seen',
        created_at: new Date(Date.now() - 900000).toISOString(), // 15 min ago
        sender_name: user.name,
        type: 'voice'
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

    // Connection events
    socketRef.current.on('connected', (data) => {
      console.log('✅ Connected to chat server:', data);
      // Join the conversation room
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

    // Listen for incoming messages
    socketRef.current.on('new_message', (msg) => {
      console.log('📨 New message received:', msg);

      setMessages(prev => {
        // Avoid duplicates
        const exists = prev.some(m => m.id === msg.id);
        if (exists) return prev;

        return [...prev, {
          ...msg,
          from_me: msg.sender_id === currentUserId
        }];
      });

      // Mark as seen if not from me
      if (msg.sender_id !== currentUserId) {
        markMessagesAsSeen([msg.id]);
      }
    });

    // Listen for message status updates
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

    // Listen for typing indicator
    socketRef.current.on('user_typing', (data) => {
      if (data.user_id !== currentUserId) {
        setTyping(data.typing);
      }
    });

    // Error handling
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

    // Add message to UI immediately (optimistic update)
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

    // Send via Socket.IO if connected, otherwise just add to UI for testing
    if (socketRef.current && socketRef.current.connected) {
      socketRef.current.emit('send_message', messageData);
    } else {
      console.log('Testing mode: Message added to UI only');
      // In testing mode, no server connection needed
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

    // Emit typing indicator
    if (socketRef.current && socketRef.current.connected) {
      socketRef.current.emit('typing', { 
        conversation_id: conversationId, 
        typing: true 
      });

      // Clear previous timeout
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }

      // Stop typing after 2 seconds
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
      // TODO: Start audio recording
    } else {
      setRecording(false);
      // TODO: Stop audio recording and upload
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
            // TODO: Implement calling functionality
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
          // TODO: Call API to block user
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
          // TODO: Call API to report user
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
    // TODO: Copy to clipboard
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
      return <Icon name="checkmark" size={14} color={Colors.gray} />;
    if (status === 'delivered')
      return <Icon name="checkmark-done" size={14} color={Colors.gray} />;
    if (status === 'seen')
      return <Icon name="checkmark-done" size={14} color={Colors.primary} />;
    return null;
  };

  const renderMessage = ({ item, index }) => {
    const isMine = item.from_me;
    const prev = messages[index - 1];
    const showDateDivider =
      !prev ||
      new Date(prev.created_at).toDateString() !==
        new Date(item.created_at).toDateString();

    return (
      <>
        {showDateDivider && (
          <View style={styles.dateDivider}>
            <Text style={styles.dateDividerText}>
              {new Date(item.created_at).toLocaleDateString('en-IN', {
                day: 'numeric',
                month: 'short',
                year: 'numeric',
              })}
            </Text>
          </View>
        )}
        <TouchableOpacity
          activeOpacity={0.8}
          onLongPress={() => handleLongPressMessage(item)}
          style={[
            styles.messageRow,
            isMine ? styles.messageRowRight : styles.messageRowLeft,
          ]}>
          <View
            style={[
              styles.bubble,
              isMine ? styles.bubbleRight : styles.bubbleLeft,
            ]}>
            {item.type === 'voice' ? (
              <View style={styles.voiceRow}>
                <Icon name="mic" size={18} color={isMine ? Colors.white : Colors.primary} />
                <View style={styles.waveformContainer}>
                  <View style={styles.waveform}>
                    {[...Array(20)].map((_, i) => (
                      <View
                        key={i}
                        style={[
                          styles.waveformBar,
                          { 
                            height: Math.random() * 20 + 8,
                            backgroundColor: isMine ? Colors.white : Colors.primary 
                          },
                        ]}
                      />
                    ))}
                  </View>
                  <Text style={[styles.voiceDuration, isMine && styles.voiceDurationMine]}>
                    0:45
                  </Text>
                </View>
                <TouchableOpacity>
                  <Icon 
                    name="play" 
                    size={20} 
                    color={isMine ? Colors.white : Colors.primary} 
                  />
                </TouchableOpacity>
              </View>
            ) : (
              <Text style={[styles.messageText, isMine && styles.messageTextMine]}>
                {item.text}
              </Text>
            )}
            <View style={styles.metaRow}>
              <Text style={[styles.timeText, isMine && styles.timeTextMine]}>
                {new Date(item.created_at).toLocaleTimeString('en-IN', {
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </Text>
              {isMine && (
                <View style={styles.statusIcon}>
                  {renderStatusIcon(item.status)}
                </View>
              )}
            </View>
          </View>
        </TouchableOpacity>
      </>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* HEADER */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Icon name="chevron-back" size={28} color={Colors.secondary} />
        </TouchableOpacity>

        <View style={styles.headerCenter}>
          <View style={styles.avatarSmall}>
            <Text style={styles.avatarSmallText}>{user.name.charAt(0)}</Text>
          </View>
          <View style={styles.headerTextContainer}>
            <Text style={styles.userName}>{user.name}</Text>
            <Text style={styles.tripInfo}>{user.tripInfo || 'Active'}</Text>
          </View>
        </View>

        <View style={styles.headerActions}>
          <TouchableOpacity style={styles.iconButton} onPress={handleCall}>
            <Icon name="call" size={25} color={Colors.primary} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.iconButton} onPress={showOptionsMenu}>
            <Icon name="ellipsis-vertical" size={25} color={Colors.dark} />
          </TouchableOpacity>
        </View>
      </View>

      {/* MESSAGES */}
      <KeyboardAvoidingView
        style={styles.keyboardView}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 0}>

        <FlatList
          ref={flatListRef}
          data={messages}
          keyExtractor={(item, index) => item.id?.toString() || index.toString()}
          renderItem={renderMessage}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          onContentSizeChange={() =>
            flatListRef.current?.scrollToEnd({ animated: true })
          }
        />

        {/* TYPING INDICATOR */}
        {typing && (
          <View style={styles.typingContainer}>
            <View style={styles.typingBubble}>
              <View style={styles.typingDot} />
              <View style={[styles.typingDot, styles.typingDotDelay1]} />
              <View style={[styles.typingDot, styles.typingDotDelay2]} />
            </View>
          </View>
        )}

        {/* INPUT BAR */}
        <View style={styles.inputBar}>
          <TouchableOpacity style={styles.attachButton}>
            <Icon name="add-circle" size={32} color={Colors.secondary} />
          </TouchableOpacity>

          <View style={styles.inputWrapper}>
            <TextInput
              value={input}
              onChangeText={handleTyping}
              style={styles.textInput}
              placeholder="Type a message..."
              placeholderTextColor={Colors.gray}
              multiline
              maxLength={500}
            />
          </View>

          {input.trim() ? (
            <TouchableOpacity
              style={styles.sendButton}
              onPress={() => sendMessage('text')}>
              <Icon name="send" size={20} color={Colors.white} />
            </TouchableOpacity>
          ) : (
            <TouchableOpacity
              style={[
                styles.micButton,
                recording && styles.micButtonRecording,
              ]}
              onPress={toggleRecording}>
              <Icon name={recording ? 'stop' : 'mic'} size={20} color={Colors.white} />
            </TouchableOpacity>
          )}
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

export default ChatScreen;

// Styles remain the same as before
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.white,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 10,
    backgroundColor: Colors.white,
    borderBottomWidth: 0.5,
    borderBottomColor: '#E0E0E0',
    elevation: 2,
    shadowColor: Colors.black,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 1,
  },
  backButton: {
    padding: 4,
  },
  headerCenter: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 8,
  },
  avatarSmall: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarSmallText: {
    ...Typography.h4,
    color: Colors.white,
  },
  headerTextContainer: {
    marginLeft: 10,
    flex: 1,
  },
  userName: {
    ...Typography.h4,
    color: Colors.dark,
  },
  tripInfo: {
    ...Typography.caption,
    fontSize: 12,
    color: Colors.primary,
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconButton: {
    padding: 8,
    marginLeft: 4,
  },
  keyboardView: {
    flex: 1,
  },
  listContent: {
    paddingVertical: 12,
    paddingHorizontal: 12,
  },
  dateDivider: {
    alignSelf: 'center',
    backgroundColor: Colors.gray + '30',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 5,
    marginVertical: 10,
  },
  dateDividerText: {
    ...Typography.caption,
    fontSize: 11,
    color: Colors.dark,
  },
  messageRow: {
    marginVertical: 3,
    flexDirection: 'row',
    maxWidth: '80%',
  },
  messageRowLeft: {
    justifyContent: 'flex-start',
    alignSelf: 'flex-start',
  },
  messageRowRight: {
    justifyContent: 'flex-end',
    alignSelf: 'flex-end',
  },
  bubble: {
    borderRadius: 16,
    paddingHorizontal: 14,
    paddingVertical: 10,
    elevation: 1,
    shadowColor: Colors.black,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  bubbleLeft: {
    backgroundColor: Colors.white,
    borderBottomLeftRadius: 4,
  },
  bubbleRight: {
    backgroundColor: Colors.primary,
    borderBottomRightRadius: 4,
  },
  messageText: {
    ...Typography.body2,
    fontSize: 15,
    color: Colors.dark,
    lineHeight: 20,
  },
  messageTextMine: {
    color: Colors.white,
  },
  voiceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    minWidth: 200,
  },
  waveformContainer: {
    flex: 1,
    marginHorizontal: 10,
  },
  waveform: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 28,
    gap: 2,
  },
  waveformBar: {
    width: 2,
    borderRadius: 1,
  },
  voiceDuration: {
    ...Typography.caption,
    fontSize: 11,
    color: Colors.primary,
    marginTop: 2,
  },
  voiceDurationMine: {
    color: Colors.white,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-end',
    marginTop: 4,
  },
  timeText: {
    ...Typography.caption,
    fontSize: 10,
    color: Colors.gray,
  },
  timeTextMine: {
    color: Colors.white + 'CC',
  },
  statusIcon: {
    marginLeft: 4,
  },
  typingContainer: {
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  typingBubble: {
    flexDirection: 'row',
    backgroundColor: Colors.white,
    alignSelf: 'flex-start',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 16,
    borderBottomLeftRadius: 4,
    gap: 4,
  },
  typingDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.gray,
  },
  inputBar: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    paddingHorizontal: 12,
    paddingVertical: 10,
    backgroundColor: Colors.white,
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
  },
  attachButton: {
    marginBottom: 6,
    marginRight: 8,
  },
  inputWrapper: {
    flex: 1,
    backgroundColor: Colors.white,
    borderRadius: 20,
    borderColor: Colors.gray,
    borderWidth: 1.5,
    paddingHorizontal: 16,
    //paddingVertical: 10,
    paddingTop: 8,
    paddingBottom: 10,
    maxHeight: 100,
    justifyContent: 'center',
    textAlignVertical: 'center',
  },
  textInput: {
    ...Typography.input,
    fontSize: 20,
    color: Colors.dark,
    maxHeight: 80,
  },
  sendButton: {
    marginLeft: 8,
    marginBottom: 6,
    backgroundColor: Colors.primary,
    borderRadius: 20,
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  micButton: {
    marginLeft: 8,
    marginBottom: 6,
    backgroundColor: Colors.success,
    borderRadius: 20,
    width: 32,
    height: 32,
    justifyContent: 'center',
    alignItems: 'center',
  },
  micButtonRecording: {
    backgroundColor: Colors.error,
  },
});