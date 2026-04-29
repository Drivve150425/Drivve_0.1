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
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/Ionicons';
import { Colors, Typography } from '../constants/Colors';
import { useFocusEffect } from '@react-navigation/native';
import CommonHeader from '../components/CommonHeader';
import { API_BASE_URL } from "../config/config_ip";
import { useAuth } from '../context/AuthContext';
import { scale, verticalScale, moderateScale } from 'react-native-size-matters';
import LottieView from "lottie-react-native";
import CustomAlert from '../components/CustomAlert';

const { width, height } = Dimensions.get('window');

// Guest auth guard
const ChatListScreen = ({ navigation }) => {
  const { user, isAuthenticated, isGuest, loading: authLoading } = useAuth();

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

  useEffect(() => {
    if (isGuest) {
      showCustomAlert(
        'Login Required',
        'Please complete login to access chats.',
        'warning'
      );
      return;
    }
  }, [isGuest, navigation]);

  const [searchQuery, setSearchQuery] = useState('');
  const [chats, setChats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [isReloading, setIsReloading] = useState(false);
  
  // Load conversations when screen comes into focus
  useFocusEffect(
    useCallback(() => {
      loadConversations();
    }, [])
  );

  const loadConversations = async (showReloadIndicator = false) => {
    try {
      if (showReloadIndicator) {
        setIsReloading(true);
      } else {
        setLoading(true);
      }

      // Use phone_number for auth (app doesn't use JWT tokens)
      const myPhone = user?.phone_number;
      if (!myPhone || myPhone === 'guest_mode') {
        console.log('No phone - guest/demo mode');
        
        return;
      }

      const response = await fetch(`${API_BASE_URL}/api/chat/conversations`, {
        method: 'GET',
        headers: {
          'X-Phone-Number': myPhone,
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();

      if (data.success) {
        const transformedChats = data.conversations.map(conv => ({
          id: conv.id.toString(),
          name: conv.other_user.name,
          lastMessage: conv.last_message || 'No messages yet',
          timestamp: formatTimestamp(conv.last_message_time),
          unreadCount: conv.unread_count,
          isOnline: false,
          avatar: conv.other_user.avatar,
          isPinned: false,
          tripInfo: conv.trip_info || '',
          isVoiceMessage: conv.last_message_type === 'voice',
          conversationId: conv.id,
          otherUserId: conv.other_user.id,
        }));

        setChats(transformedChats);
        // ❌ REMOVED success popup - only show error/warning
      } else {
        console.error('Failed to load conversations:', data);
        showCustomAlert('Error', data.message || 'Failed to load conversations', 'error');
      }
    } catch (error) {
      console.error('Load conversations error:', error);
      showCustomAlert('Error', 'Network error. Please check your connection.', 'error');
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

  // Manual reload function
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
    // Navigate to ChatScreen with loading handling inside chat
    navigation.navigate('ChatScreen', {
      user: {
        id: chat.otherUserId,
        name: chat.name,
        tripInfo: chat.tripInfo,
        avatar: chat.avatar,
      },
      conversationId: chat.conversationId,
    });
  };

  const renderChatItem = ({ item }) => (
    <TouchableOpacity
      style={styles.chatItem}
      activeOpacity={0.7}
      onPress={() => handleChatPress(item)}>
      
      <View style={styles.avatarContainer}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>{item.name.charAt(0)}</Text>
        </View>
        {item.isOnline && <View style={styles.onlineIndicator} />}
      </View>

      <View style={styles.chatContent}>
        <View style={styles.chatHeader}>
          <View style={styles.nameRow}>
            <Text style={styles.chatName} numberOfLines={1}>
              {item.name}
            </Text>
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
            <Text style={styles.tripInfo} numberOfLines={1}>
              {item.tripInfo}
            </Text>
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
                {item.lastMessage}
              </Text>
            </View>
          </View>
          {item.unreadCount > 0 && (
            <View style={styles.unreadBadge}>
              <Text style={styles.unreadCount}>{item.unreadCount}</Text>
            </View>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );

const renderEmptyState = () => (
  <View style={styles.emptyContainer}>
    <View style={styles.emptyIconContainer}>
      <View style={{ opacity: 0.3 }}>
        <Icon 
          name="chatbubbles-outline" 
          size={moderateScale(100)} 
          color={Colors.primary} 
        />
      </View>
    </View>
    <Text style={styles.emptyText}>No chats available</Text>
    <Text style={styles.emptySubtext}>
      Start a ride to connect with other users
    </Text>
    
    {/* RELOAD BUTTON IN EMPTY STATE */}
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

  // ✅ LOADING STATE - ONLY LOTTIE, NO SUCCESS POPUP
  if (loading && chats.length === 0) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="dark-content" backgroundColor={Colors.white} />
        <CommonHeader 
          title="Chats" 
          showBackButton={true}
        />
        <View style={styles.loadingContainer}>
          <LottieView
            source={require("../assets/loading.json")}
            autoPlay
            loop
            style={{ width: 300, height: 300 }}
          />
          {/* <Text style={styles.loadingText}>Loading conversations...</Text>
          <TouchableOpacity 
            style={styles.reloadButton}
            onPress={handleReload}>
            <Icon name="refresh" size={moderateScale(18)} color={Colors.white} />
            <Text style={styles.reloadButtonText}>Try Again</Text>
          </TouchableOpacity> */}
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={Colors.white} />

      {/* REUSABLE COMMON HEADER WITH RELOAD */}
      <CommonHeader 
        title="Chats" 
        showBackButton={true}
        rightIcon={isReloading ? null : "refresh"}
        onRightPress={handleReload}
      />

      {/* SHOW RELOADING INDICATOR IN HEADER */}
      {isReloading && (
        <View style={styles.reloadingHeader}>
          <ActivityIndicator size="small" color={Colors.primary} />
          <Text style={styles.reloadingText}>Refreshing...</Text>
        </View>
      )}

      {/* SEARCH BAR */}
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
          <TouchableOpacity 
            onPress={() => setSearchQuery('')}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
            <Icon 
              name="close-circle" 
              size={moderateScale(18)} 
              color={Colors.gray} 
            />
          </TouchableOpacity>
        )}
      </View>

      {/* CHAT LIST */}
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

      {/* CUSTOM ALERT - ONLY FOR ERRORS & WARNINGS */}
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
  container: {
    flex: 1,
    backgroundColor: Colors.white,
  },
  
  // RELOADING HEADER INDICATOR
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
  
  // SEARCH CONTAINER - Responsive
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
    shadowColor: Colors.black,
    shadowOffset: { width: 0, height: verticalScale(1) },
    shadowOpacity: 0.05,
    shadowRadius: moderateScale(2),
  },
  
  searchIcon: {
    marginRight: moderateScale(10),
  },
  
  searchInput: {
    flex: 1,
    fontSize: moderateScale(16),
    color: Colors.dark,
    paddingVertical: Platform.OS === 'ios' ? verticalScale(12) : verticalScale(8),
    fontFamily: Typography.fontFamily?.regular || 'System',
  },
  
  // SECTION HEADER
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
    letterSpacing: 0.5,
  },
  
  // CHAT LIST
  chatList: {
    paddingBottom: verticalScale(20),
  },
  
  // CHAT ITEM - Responsive
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
  
  // AVATAR - Responsive
  avatarContainer: {
    position: 'relative',
  },
  
  avatar: {
    width: moderateScale(52),
    height: moderateScale(52),
    borderRadius: moderateScale(26),
    backgroundColor: Colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  
  avatarText: {
    fontSize: moderateScale(20),
    fontWeight: '600',
    color: Colors.white,
  },
  
  onlineIndicator: {
    position: 'absolute',
    bottom: verticalScale(2),
    right: moderateScale(2),
    width: moderateScale(14),
    height: moderateScale(14),
    borderRadius: moderateScale(7),
    backgroundColor: Colors.success,
    borderWidth: moderateScale(2.5),
    borderColor: Colors.white,
  },
  
  // CHAT CONTENT
  chatContent: {
    flex: 1,
    marginLeft: moderateScale(12),
    justifyContent: 'center',
  },
  
  chatHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: verticalScale(4),
  },
  
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginRight: moderateScale(8),
  },
  
  chatName: {
    fontSize: moderateScale(16),
    fontWeight: '600',
    color: Colors.dark,
    flexShrink: 1,
  },
  
  pinIcon: {
    marginLeft: moderateScale(6),
  },
  
  timestamp: {
    fontSize: moderateScale(11),
    color: Colors.gray,
  },
  
  messageRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  
  messageContent: {
    flex: 1,
  },
  
  tripInfo: {
    fontSize: moderateScale(11),
    color: Colors.secondary,
    fontWeight: '600',
    marginBottom: verticalScale(3),
  },
  
  lastMessageRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  
  voiceIcon: {
    marginRight: moderateScale(5),
  },
  
  lastMessage: {
    fontSize: moderateScale(14),
    color: Colors.gray,
    flex: 1,
  },
  
  unreadMessage: {
    color: Colors.dark,
    fontWeight: '600',
  },
  
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
  
  unreadCount: {
    fontSize: moderateScale(11),
    color: Colors.white,
    fontWeight: '700',
  },
  
  // LOADING STATE
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: moderateScale(40),
  },
  
  loadingText: {
    fontSize: moderateScale(16),
    color: Colors.gray,
    marginTop: verticalScale(16),
    marginBottom: verticalScale(24),
  },
  
  // RELOAD BUTTON STYLES
  reloadButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.primary,
    paddingHorizontal: moderateScale(24),
    paddingVertical: verticalScale(12),
    borderRadius: moderateScale(25),
    marginTop: verticalScale(24),
    elevation: 2,
    shadowColor: Colors.black,
    shadowOffset: { width: 0, height: verticalScale(2) },
    shadowOpacity: 0.1,
    shadowRadius: moderateScale(3),
  },
  
  reloadButtonText: {
    fontSize: moderateScale(16),
    color: Colors.white,
    fontWeight: '600',
    marginLeft: moderateScale(8),
  },
  
  // EMPTY STATE - Responsive
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: moderateScale(40),
    marginTop: -verticalScale(50),
  },
  
  emptyIconContainer: {
    marginBottom: verticalScale(24),
  },
  
  emptyText: {
    fontSize: moderateScale(20),
    fontWeight: '600',
    color: Colors.dark,
    marginBottom: verticalScale(8),
  },
  
  emptySubtext: {
    fontSize: moderateScale(14),
    color: Colors.gray,
    textAlign: 'center',
    lineHeight: verticalScale(20),
    paddingHorizontal: moderateScale(20),
  },
});

export default ChatListScreen;