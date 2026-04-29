import React, { useEffect, useState, useRef } from 'react';
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
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import io from 'socket.io-client';
import { Colors } from '../constants/Colors';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { API_BASE_URL } from "../config/config_ip";
import { useAuth } from '../context/AuthContext';
import LottieView from "lottie-react-native";
import CustomAlert from '../components/CustomAlert';

const { width, height } = Dimensions.get('window');
const scale = (size) => (width / 375) * size;
const verticalScale = (size) => (height / 812) * size;
const moderateScale = (size, factor = 0.5) => size + (scale(size) - size) * factor;

const ChatScreen = ({ route, navigation }) => {
  const { user: currentUser } = useAuth();
  const insets = useSafeAreaInsets();
  const { user, conversationId: passedConversationId, receiverPhone, rideId } = route.params || {};

  const myPhone = currentUser?.phone_number;
  const [chatPartnerPhone, setChatPartnerPhone] = useState(receiverPhone || user?.phone_number || null);
  
  const chatPartner = user || {
    name: receiverPhone ? `User ${String(receiverPhone).slice(-4)}` : 'Unknown',
    tripInfo: 'Active',
    phone_number: chatPartnerPhone
  };
  console.log(user)
  
  const conversationId = passedConversationId || rideId || null;

  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [recording, setRecording] = useState(false);
  const [typing, setTyping] = useState(false);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [showOptionsModal, setShowOptionsModal] = useState(false);
  const [showMessageOptionsModal, setShowMessageOptionsModal] = useState(false);
  const [selectedMessage, setSelectedMessage] = useState(null);

  // Custom Alert states
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

  // Separate animation values for each modal
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

  useEffect(() => {
    navigation.setOptions({ headerShown: false });
    initializeChat();
    return () => {
      if (socketRef.current) socketRef.current.disconnect();
    };
  }, []);

  useEffect(() => {
    setTimeout(() => flatListRef.current?.scrollToEnd({ animated: true }), 100);
  }, [messages]);

  // Animate modal in/out
  const animateModalIn = (scaleAnim, fadeAnim) => {
    Animated.parallel([
      Animated.spring(scaleAnim, {
        toValue: 1,
        tension: 50,
        friction: 7,
        useNativeDriver: true,
      }),
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const animateModalOut = (scaleAnim, fadeAnim, onClose) => {
    Animated.parallel([
      Animated.spring(scaleAnim, {
        toValue: 0.8,
        tension: 50,
        friction: 7,
        useNativeDriver: true,
      }),
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start(() => {
      if (onClose) onClose();
    });
  };

  const initializeChat = async () => {
    // if (!conversationId) {
    //   showAlert('Chat', 'Chat is not available for this ride.', 'warning');
    //   setLoading(false);
    //   return;
    // }
    if (!myPhone) {
      showAlert('Login Required', 'Please log in to use chat.', 'warning');
      setLoading(false);
      return;
    }
    try {
      const loaded = await loadMessages();
      if (!loaded) loadMockMessages();
      connectSocket();
    } catch (error) {
      console.error('Initialize chat error:', error);
      loadMockMessages();
    } finally {
      setLoading(false);
    }
  };

  const apiHeaders = () => ({
    'X-Phone-Number': myPhone,
    'Content-Type': 'application/json',
  });

  const loadMessages = async () => {
    try {
      const response = await fetch(
        `${API_BASE_URL}/api/chat/conversations/${conversationId}/messages`,
        { headers: apiHeaders() }
      );
      const data = await response.json();
      if (data.success && data.messages) {
        setMessages(data.messages);
        return true;
      }
      return false;
    } catch (error) {
      console.log('Chat API not available yet, using mock messages');
      return false;
    }
  };

  const loadMockMessages = () => {
    const mockMessages = [
      {
        id: 1, text: 'Hey there! Ready for the trip?',
        sender_id: 101, from_me: false, status: 'seen',
        created_at: new Date(Date.now() - 3600000).toISOString(), sender_name: chatPartner.name, type: 'text'
      },
      {
        id: 2, text: 'Yes, I am! What time should we meet?',
        sender_id: 999, from_me: true, status: 'sent',
        created_at: new Date(Date.now() - 3000000).toISOString(), sender_name: 'You', type: 'text'
      },
      {
        id: 3, text: 'Let\'s meet at 8 AM at the pickup point.',
        sender_id: 101, from_me: false, status: 'seen',
        created_at: new Date(Date.now() - 2400000).toISOString(), sender_name: chatPartner.name, type: 'text'
      },
      {
        id: 4, text: 'Perfect! See you then.',
        sender_id: 999, from_me: true, status: 'sent',
        created_at: new Date(Date.now() - 1800000).toISOString(), sender_name: 'You', type: 'text'
      },
    ];
    setMessages(mockMessages);
  };

  const connectSocket = () => {
    socketRef.current = io(API_BASE_URL, {
      transports: ['websocket'],
      auth: { phone_number: myPhone },
      reconnection: true, reconnectionDelay: 1000, reconnectionAttempts: 3
    });

    socketRef.current.on('connected', (data) => {
      console.log('Connected:', data);
      // Extract the phone number from the connected event
      if (data && data.phone) {
        console.log('Chat partner phone number from socket:', data.phone);
        setChatPartnerPhone(data.phone);
        // Update chatPartner object with the phone number
        chatPartner.phone_number = data.phone;
      }
      socketRef.current.emit('join_conversation', { conversation_id: conversationId });
    });

    socketRef.current.on('new_message', (msg) => {
      setMessages(prev => {
        const exists = prev.some(m => m.id === msg.id);
        if (exists) return prev;
        return [...prev, { ...msg, from_me: msg.sender_id === myPhone }];
      });
      if (msg.sender_id !== myPhone) markMessagesAsSeen([msg.id]);
    });

    socketRef.current.on('connect_error', (error) => {
      console.log('Socket connect (expected if no chat server):', error.message);
    });
  };

  const sendMessage = (type = 'text') => {
    if (!input.trim() && type === 'text') return;
    setSending(true);
    const messageData = {
      conversation_id: conversationId, type,
      text: type === 'text' ? input.trim() : 'Voice message', file_url: null,
    };
    const tempMessage = {
      id: Date.now(), ...messageData, sender_id: myPhone,
      from_me: true, status: 'sent', created_at: new Date().toISOString(), sender_name: 'You'
    };
    setMessages(prev => [...prev, tempMessage]);
    setInput('');
    if (socketRef.current?.connected) {
      socketRef.current.emit('send_message', messageData);
    }
    setTimeout(() => setSending(false), 500);
  };

  const markMessagesAsSeen = (messageIds) => {
    if (socketRef.current?.connected) {
      socketRef.current.emit('mark_seen', { conversation_id: conversationId, message_ids: messageIds });
    }
  };

  const handleTyping = (text) => {
    setInput(text);
    if (socketRef.current?.connected) {
      socketRef.current.emit('typing', { conversation_id: conversationId, typing: true });
      if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
      typingTimeoutRef.current = setTimeout(() => {
        socketRef.current?.emit('typing', { conversation_id: conversationId, typing: false });
      }, 2000);
    }
  };

  const toggleRecording = () => {
    if (!recording) { 
      setRecording(true); 
      // Simulate recording for 3 seconds
      setTimeout(() => {
        if (recording) {
          setRecording(false);
          sendMessage('voice');
        }
      }, 3000);
    } else { 
      setRecording(false); 
      sendMessage('voice');
    }
  };

  const handleCall = () => {
    // Get phone number from multiple sources
    // Priority: 1. chatPartnerPhone state, 2. receiverPhone from params, 3. user?.phone_number, 4. socket data
    const phoneNumber =  user?.id;
    
    console.log('Attempting to call phone number:', phoneNumber);
    
    if (!phoneNumber) {
      showAlert('Call Failed', 'Phone number not available for this user.', 'error');
      return;
    }
    
    // Clean the phone number (remove any spaces, ensure it starts with + if needed)
    let cleanPhoneNumber = phoneNumber.toString().trim();
    if (!cleanPhoneNumber.startsWith('+') && !cleanPhoneNumber.startsWith('0')) {
      // Add country code if needed (adjust based on your country)
      cleanPhoneNumber = '+91' + cleanPhoneNumber;
    }
    
    showConfirmationAlert(
      'Call ' + chatPartner.name,
      `Call ${cleanPhoneNumber}?`,
      () => {
        // Make actual phone call
        const telUrl = `tel:${cleanPhoneNumber}`;
        Linking.canOpenURL(telUrl)
          .then(supported => {
            if (supported) {
              Linking.openURL(telUrl);
            } else {
              showAlert('Call Failed', 'Phone calls are not supported on this device.', 'error');
            }
          })
          .catch(err => {
            console.error('An error occurred', err);
            showAlert('Call Failed', 'Unable to make phone call.', 'error');
          });
      },
      'Call'
    );
  };

  const handleBlock = () => {
    setShowOptionsModal(false);
    showConfirmationAlert(
      'Block User',
      `Are you sure you want to block ${chatPartner.name}?`,
      () => showAlert('User Blocked', `${chatPartner.name} has been blocked.`, 'warning'),
      'Block'
    );
  };

  const handleReport = () => {
    setShowOptionsModal(false);
    showConfirmationAlert(
      'Report User',
      `Report ${chatPartner.name} for inappropriate behavior?`,
      () => showAlert('Report Submitted', 'Thank you for reporting. We will review this.', 'success'),
      'Report'
    );
  };

  const handleClearChat = () => {
    setShowOptionsModal(false);
    showConfirmationAlert(
      'Clear Chat',
      'Delete all messages? This action cannot be undone.',
      () => {
        setMessages([]);
        showAlert('Chat Cleared', 'All messages have been deleted.', 'success');
      },
      'Clear'
    );
  };

  const showOptionsMenu = () => {
    setShowOptionsModal(true);
    animateModalIn(optionsModalScale, optionsModalFade);
  };

  const closeOptionsMenu = () => {
    animateModalOut(optionsModalScale, optionsModalFade, () => {
      setShowOptionsModal(false);
    });
  };

  const handleMessageCopy = (message) => {
    setShowMessageOptionsModal(false);
    showAlert('Copied', 'Message copied to clipboard', 'success');
  };

  const handleMessageDelete = (message) => {
    setShowMessageOptionsModal(false);
    showConfirmationAlert(
      'Delete Message',
      'Are you sure you want to delete this message?',
      () => {
        setMessages(prev => prev.filter(m => m.id !== message.id));
        showAlert('Deleted', 'Message deleted successfully', 'success');
      },
      'Delete'
    );
  };

  const handleMessageReport = (message) => {
    setShowMessageOptionsModal(false);
    showConfirmationAlert(
      'Report Message',
      'Report this message for inappropriate content?',
      () => showAlert('Report Submitted', 'Message has been reported.', 'success'),
      'Report'
    );
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
    if (status === 'sent') return <Icon name="checkmark" size={moderateScale(14)} color={Colors.gray} />;
    if (status === 'delivered') return <Icon name="checkmark-done" size={moderateScale(14)} color={Colors.gray} />;
    if (status === 'seen') return <Icon name="checkmark-done" size={moderateScale(14)} color={Colors.primary} />;
    return null;
  };

  const formatTime = (timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true })
      .toLowerCase().replace(' ', '');
  };

  const renderMessage = ({ item, index }) => {
    const isMine = item.from_me;
    const prev = messages[index - 1];
    const showDateDivider = !prev || new Date(prev.created_at).toDateString() !== new Date(item.created_at).toDateString();
    
    const messageDate = new Date(item.created_at);
    const today = new Date();
    const yesterday = new Date(today); yesterday.setDate(yesterday.getDate() - 1);
    let dateText = '';
    if (messageDate.toDateString() === today.toDateString()) dateText = 'Today';
    else if (messageDate.toDateString() === yesterday.toDateString()) dateText = 'Yesterday';
    else dateText = messageDate.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });

    return (
      <View key={item.id}>
        {showDateDivider && (
          <View style={styles.dateDivider}><Text style={styles.dateDividerText}>{dateText}</Text></View>
        )}
        <View style={[styles.messageWrapper, isMine ? styles.messageWrapperRight : styles.messageWrapperLeft]}>
          <TouchableOpacity activeOpacity={0.8} onLongPress={() => handleLongPressMessage(item)}>
            <View style={[styles.bubble, isMine ? styles.bubbleRight : styles.bubbleLeft]}>
              {item.type === 'voice' ? (
                <View style={styles.voiceContainer}>
                  <TouchableOpacity style={styles.playButton}>
                    <Icon name="play" size={moderateScale(16)} color={isMine ? Colors.white : Colors.primary} />
                  </TouchableOpacity>
                  <View style={styles.voiceInfo}>
                    <View style={styles.waveformContainer}>
                      {[...Array(12)].map((_, i) => (
                        <View key={i} style={[styles.waveformBar, { 
                          height: Math.random() * verticalScale(12) + verticalScale(4),
                          backgroundColor: isMine ? Colors.white : Colors.primary,
                        }]} />
                      ))}
                    </View>
                    <Text style={[styles.voiceDuration, isMine && styles.voiceDurationMine]}>
                      {item.duration || '0:45'}
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

  if (loading) {
    return (
      <View style={styles.loaderContainer}>
        <StatusBar backgroundColor={Colors.white} barStyle="dark-content" />
        <LottieView
          source={require("../assets/loading.json")}
          autoPlay
          loop
          style={{ width: 300, height: 300 }}
        />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={[styles.header, { paddingTop: insets.top }]}>
        <View style={styles.sideContainer}>
          <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()} activeOpacity={0.7}>
            <Icon name="chevron-back" size={moderateScale(22)} color={Colors.secondary} />
          </TouchableOpacity>
        </View>
        <View style={styles.headerCenter}>
          <View style={styles.avatarSmall}><Text style={styles.avatarSmallText}>{chatPartner.name.charAt(0)}</Text></View>
          <View style={styles.headerTextContainer}>
            <Text style={styles.userName} numberOfLines={1}>{chatPartner.name}</Text>
            <Text style={styles.tripInfo} numberOfLines={1}>{chatPartner.tripInfo || 'Active'}</Text>
          </View>
        </View>
        <View style={styles.sideContainer}>
          <TouchableOpacity style={styles.iconButton} onPress={handleCall} activeOpacity={0.7}>
            <Icon name="call" size={moderateScale(22)} color={Colors.primary} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.iconButton} onPress={showOptionsMenu} activeOpacity={0.7}>
            <Icon name="ellipsis-vertical" size={moderateScale(22)} color={Colors.dark} />
          </TouchableOpacity>
        </View>
      </View>

      <KeyboardAvoidingView style={styles.keyboardView} behavior={Platform.OS === 'ios' ? 'padding' : 'height'} keyboardVerticalOffset={Platform.OS === 'ios' ? insets.top + 44 : 0}>
        <View style={styles.messagesContainer}>
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
                <View style={styles.typingDot} /><View style={[styles.typingDot, styles.typingDotDelay1]} /><View style={[styles.typingDot, styles.typingDotDelay2]} />
              </View>
            </View>
          )}
        </View>

        <View style={styles.inputBarContainer}>
          <View style={styles.inputBar}>
            {/* Mic button on the left side */}
            <TouchableOpacity 
              style={[styles.actionButton, { backgroundColor: recording ? "#EF4444" : "#10B981" }]} 
              onPress={toggleRecording}
            >
              <Icon name={recording ? 'stop' : 'mic'} size={moderateScale(24)} color={Colors.white} />
            </TouchableOpacity>
            
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
            
            {/* Send button on the right side */}
            <TouchableOpacity 
              style={[styles.actionButton, { backgroundColor: Colors.primary }]} 
              onPress={() => sendMessage('text')} 
              disabled={!input.trim() || sending}
            >
              {sending ? (
                <ActivityIndicator size="small" color={Colors.white} />
              ) : (
                <Icon name="send" size={moderateScale(24)} color={Colors.white} />
              )}
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>

      {/* Options Modal - Three Dots Menu */}
      <Modal
        transparent
        visible={showOptionsModal}
        animationType="none"
        onRequestClose={closeOptionsMenu}
      >
        <TouchableOpacity style={styles.modalOverlay} activeOpacity={1} onPress={closeOptionsMenu}>
          <Animated.View 
            style={[
              styles.optionsModalContainer,
              {
                opacity: optionsModalFade,
                transform: [{ scale: optionsModalScale }],
              }
            ]}
          >
            <View style={styles.optionsModalHeader}>
              <Text style={styles.optionsModalTitle}>Options</Text>
              <TouchableOpacity onPress={closeOptionsMenu} style={styles.closeModalButton}>
                <Icon name="close" size={24} color="#6B7280" />
              </TouchableOpacity>
            </View>
            <View style={styles.optionsModalDivider} />
            <TouchableOpacity
              style={[styles.optionsModalItem, styles.optionsModalItemDestructive]}
              onPress={handleBlock}
            >
              <Icon name="person-remove-outline" size={22} color="#DC2626" />
              <Text style={[styles.optionsModalItemText, styles.optionsModalItemTextDestructive]}>
                Block User
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.optionsModalItem}
              onPress={handleReport}
            >
              <Icon name="flag-outline" size={22} color={Colors.primary} />
              <Text style={styles.optionsModalItemText}>Report User</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.optionsModalItem, styles.optionsModalItemDestructive]}
              onPress={handleClearChat}
            >
              <Icon name="trash-outline" size={22} color="#DC2626" />
              <Text style={[styles.optionsModalItemText, styles.optionsModalItemTextDestructive]}>
                Clear Chat
              </Text>
            </TouchableOpacity>
          </Animated.View>
        </TouchableOpacity>
      </Modal>

      {/* Message Options Modal */}
      <Modal
        transparent
        visible={showMessageOptionsModal}
        animationType="none"
        onRequestClose={closeMessageOptionsMenu}
      >
        <TouchableOpacity style={styles.modalOverlay} activeOpacity={1} onPress={closeMessageOptionsMenu}>
          <Animated.View 
            style={[
              styles.optionsModalContainer,
              {
                opacity: messageModalFade,
                transform: [{ scale: messageModalScale }],
              }
            ]}
          >
            <View style={styles.optionsModalHeader}>
              <Text style={styles.optionsModalTitle}>Message Options</Text>
              <TouchableOpacity onPress={closeMessageOptionsMenu} style={styles.closeModalButton}>
                <Icon name="close" size={24} color="#6B7280" />
              </TouchableOpacity>
            </View>
            <View style={styles.optionsModalDivider} />
            <TouchableOpacity
              style={styles.optionsModalItem}
              onPress={() => handleMessageCopy(selectedMessage)}
            >
              <Icon name="copy-outline" size={22} color={Colors.primary} />
              <Text style={styles.optionsModalItemText}>Copy</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.optionsModalItem, styles.optionsModalItemDestructive]}
              onPress={() => handleMessageDelete(selectedMessage)}
            >
              <Icon name="trash-outline" size={22} color="#DC2626" />
              <Text style={[styles.optionsModalItemText, styles.optionsModalItemTextDestructive]}>
                Delete
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.optionsModalItem}
              onPress={() => handleMessageReport(selectedMessage)}
            >
              <Icon name="flag-outline" size={22} color={Colors.primary} />
              <Text style={styles.optionsModalItemText}>Report</Text>
            </TouchableOpacity>
          </Animated.View>
        </TouchableOpacity>
      </Modal>

      {/* Custom Alert */}
      <CustomAlert
        visible={alertVisible}
        title={alertConfig.title}
        message={alertConfig.message}
        icon={alertConfig.icon}
        iconColor={alertConfig.iconColor}
        buttons={alertConfig.buttons}
        onBackdropPress={() => setAlertVisible(false)}
      />
    </View>
  );
};

export default ChatScreen;

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.white },
  loaderContainer: { flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: Colors.white },
  loaderText: { marginTop: 20, fontSize: 16, color: Colors.primary, fontWeight: "500" },
  header: {
    width: "100%", minHeight: verticalScale(30),
    flexDirection: "row", alignItems: "center", justifyContent: "space-between",
    paddingHorizontal: moderateScale(14), paddingBottom: verticalScale(8),
    backgroundColor: Colors.white, borderBottomWidth: 0.5, borderBottomColor: '#E0E0E0', zIndex: 10,
  },
  sideContainer: { width: scale(44), flexDirection: 'row', alignItems: "center", justifyContent: "center" },
  backButton: { width: scale(40), height: scale(40), borderRadius: scale(20), justifyContent: "center", alignItems: "center" },
  iconButton: { width: scale(40), height: scale(40), borderRadius: scale(20), justifyContent: "center", alignItems: "center", marginLeft: scale(4) },
  headerCenter: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'flex-start', paddingHorizontal: scale(6) },
  avatarSmall: { width: scale(40), height: scale(40), borderRadius: scale(20), backgroundColor: Colors.primary, justifyContent: 'center', alignItems: 'center' },
  avatarSmallText: { fontSize: moderateScale(18), fontWeight: '600', color: Colors.white },
  headerTextContainer: { marginLeft: moderateScale(10), flex: 1 },
  userName: { fontSize: moderateScale(16), fontWeight: '600', color: Colors.dark },
  tripInfo: { fontSize: moderateScale(12), color: Colors.primary, marginTop: verticalScale(2) },
  keyboardView: { flex: 1 },
  messagesContainer: { flex: 1 },
  listContent: { paddingTop: verticalScale(12), paddingHorizontal: moderateScale(12), paddingBottom: verticalScale(8) },
  dateDivider: { alignSelf: 'center', backgroundColor: '#E8E8E8', borderRadius: moderateScale(100), paddingHorizontal: moderateScale(16), paddingVertical: verticalScale(6), marginVertical: verticalScale(12) },
  dateDividerText: { fontSize: moderateScale(12), color: Colors.dark, fontWeight: '500' },
  messageWrapper: { marginBottom: verticalScale(4), width: '100%' },
  messageWrapperLeft: { alignItems: 'flex-start' },
  messageWrapperRight: { alignItems: 'flex-end' },
  bubble: { borderRadius: moderateScale(18), paddingHorizontal: moderateScale(14), paddingVertical: verticalScale(8), maxWidth: width * 0.75, elevation: 1, shadowColor: Colors.black, shadowOffset: { width: 0, height: verticalScale(0.5) }, shadowOpacity: 0.05, shadowRadius: moderateScale(1) },
  bubbleLeft: { backgroundColor: '#F0F0F0', borderBottomLeftRadius: moderateScale(4) },
  bubbleRight: { backgroundColor: Colors.primary, borderBottomRightRadius: moderateScale(4) },
  messageText: { fontSize: moderateScale(15), color: Colors.dark, lineHeight: verticalScale(20), fontWeight: '400' },
  messageTextMine: { color: Colors.white },
  voiceContainer: { flexDirection: 'row', alignItems: 'center', width: moderateScale(180) },
  playButton: { width: scale(32), height: scale(32), borderRadius: scale(16), backgroundColor: Colors.white, justifyContent: 'center', alignItems: 'center', marginRight: moderateScale(8), elevation: 1 },
  voiceInfo: { flex: 1 },
  waveformContainer: { flexDirection: 'row', alignItems: 'center', height: verticalScale(24), gap: moderateScale(2), marginBottom: verticalScale(2) },
  waveformBar: { width: moderateScale(2.5), borderRadius: moderateScale(1) },
  voiceDuration: { fontSize: moderateScale(11), color: Colors.primary, fontWeight: '500' },
  voiceDurationMine: { color: Colors.white },
  metaContainer: { flexDirection: 'row', alignItems: 'center', marginTop: verticalScale(2) },
  metaContainerLeft: { justifyContent: 'flex-start' },
  metaContainerRight: { justifyContent: 'flex-end' },
  timeText: { fontSize: moderateScale(10), color: '#8E8E93', fontWeight: '400' },
  timeTextMine: { color: 'rgba(255, 255, 255, 0.8)' },
  statusIcon: { marginLeft: moderateScale(4) },
  typingWrapper: { width: '100%', alignItems: 'flex-start', paddingLeft: moderateScale(12), marginBottom: verticalScale(8) },
  typingBubble: { flexDirection: 'row', backgroundColor: '#F0F0F0', paddingHorizontal: moderateScale(16), paddingVertical: verticalScale(10), borderRadius: moderateScale(18), borderBottomLeftRadius: moderateScale(4), gap: moderateScale(4), alignSelf: 'flex-start' },
  typingDot: { width: moderateScale(6), height: moderateScale(6), borderRadius: moderateScale(3), backgroundColor: '#8E8E93' },
  typingDotDelay1: { opacity: 0.7 },
  typingDotDelay2: { opacity: 0.4 },
  inputBarContainer: { backgroundColor: Colors.white, borderTopWidth: 0.5, borderTopColor: '#E0E0E0' },
  inputBar: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: moderateScale(12), paddingVertical: verticalScale(8), backgroundColor: Colors.white, gap: moderateScale(8) },
  actionButton: { width: scale(44), height: scale(44), borderRadius: scale(22), backgroundColor: Colors.primary, justifyContent: 'center', alignItems: 'center' },
  inputWrapper: { flex: 1, height: scale(44), backgroundColor: '#F8F8F8', borderRadius: scale(22), borderWidth: 0.5, borderColor: '#E0E0E0', paddingHorizontal: moderateScale(16), justifyContent: 'center' },
  textInput: { fontSize: moderateScale(16), color: Colors.dark, paddingVertical: 0, textAlignVertical: 'center', includeFontPadding: false, lineHeight: Platform.OS === 'ios' ? verticalScale(20) : undefined },
  
  // Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  optionsModalContainer: {
    backgroundColor: Colors.white,
    borderRadius: moderateScale(20),
    width: width * 0.85,
    maxWidth: 350,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
  },
  optionsModalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: moderateScale(20),
    paddingVertical: moderateScale(16),
  },
  optionsModalTitle: {
    fontSize: moderateScale(18),
    fontWeight: '600',
    color: Colors.dark,
  },
  closeModalButton: {
    width: scale(32),
    height: scale(32),
    borderRadius: scale(16),
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
    paddingHorizontal: moderateScale(20),
    paddingVertical: moderateScale(14),
    borderBottomWidth: 0.5,
    borderBottomColor: '#F3F4F6',
  },
  optionsModalItemDestructive: {
    backgroundColor: '#FEF2F2',
  },
  optionsModalItemText: {
    fontSize: moderateScale(16),
    color: Colors.dark,
    marginLeft: moderateScale(12),
    fontWeight: '500',
  },
  optionsModalItemTextDestructive: {
    color: '#DC2626',
  },
});