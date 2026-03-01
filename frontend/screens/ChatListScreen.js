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
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/Ionicons';
import { useAuth } from '../context/AuthContext';
import { Colors, Typography } from '../constants/Colors';
import { useFocusEffect } from '@react-navigation/native';
import BottomNavigation from '../components/BottomNavigation';

const API_URL = 'http://192.168.1.2:8000'; // Your FastAPI server URL

const ChatListScreen = ({ navigation }) => {
  const { token } = useAuth();

  const [searchQuery, setSearchQuery] = useState('');
  const [chats, setChats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [activeBottomTab, setActiveBottomTab] = useState('chat');

  // Handle bottom navigation
  const handleBottomNavigation = (tabName) => {
    setActiveBottomTab(tabName);

    switch (tabName) {
        case 'home':
            navigation.navigate('Home');
            break;
        case 'myride':
            Alert.alert('Coming Soon', 'MyRides screen will be available soon!');
            // navigation.navigate('Notifications');
            break;
        case 'plus':
            navigation.navigate('Drive');
            break;
        case 'chat':
            navigation.navigate('ChatList');
            break;
        case 'alert':
            Alert.alert('Coming Soon', 'Notifications screen will be available soon!');
            // navigation.navigate('Settings');
            break;
    }
  };

  // Load conversations when screen comes into focus
  useFocusEffect(
    useCallback(() => {
      loadConversations();
    }, [])
  );

  const loadConversations = async () => {
    try {
      setLoading(true);

      if (!token) {
        console.log('No token found');
        setChats([]);
        setLoading(false);
        setRefreshing(false);
        return;
      }

      // If no token (testing mode), show mock data
      if (!token) {
        console.log('No token found, loading mock data for testing');
        const mockChats = [
          {
            id: '1',
            name: 'John Doe',
            lastMessage: 'Hey, are you still available for the ride?',
            timestamp: '2:30 PM',
            unreadCount: 2,
            isOnline: true,
            avatar: null,
            isPinned: false,
            tripInfo: 'Mumbai → Pune',
            isVoiceMessage: false,
            conversationId: 1,
            otherUserId: 101,
          },
          {
            id: '2',
            name: 'Sarah Wilson',
            lastMessage: 'Thanks for the ride! It was great.',
            timestamp: 'Yesterday',
            unreadCount: 0,
            isOnline: false,
            avatar: null,
            isPinned: true,
            tripInfo: 'Delhi → Jaipur',
            isVoiceMessage: false,
            conversationId: 2,
            otherUserId: 102,
          },
          {
            id: '3',
            name: 'Mike Johnson',
            lastMessage: 'Voice message',
            timestamp: '10:15 AM',
            unreadCount: 1,
            isOnline: true,
            avatar: null,
            isPinned: false,
            tripInfo: 'Bangalore → Chennai',
            isVoiceMessage: true,
            conversationId: 3,
            otherUserId: 103,
          },
          {
            id: '4',
            name: 'Emma Davis',
            lastMessage: 'See you at the pickup point!',
            timestamp: 'Mon',
            unreadCount: 0,
            isOnline: false,
            avatar: null,
            isPinned: false,
            tripInfo: 'Kolkata → Patna',
            isVoiceMessage: false,
            conversationId: 4,
            otherUserId: 104,
          },
        ];
        setChats(mockChats);
        setLoading(false);
        setRefreshing(false);
        return;
      }

      const response = await fetch(`${API_URL}/api/chat/conversations`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();

      if (data.success) {
        // Transform data to match UI structure
        const transformedChats = data.conversations.map(conv => ({
          id: conv.id.toString(),
          name: conv.other_user.name,
          lastMessage: conv.last_message || 'No messages yet',
          timestamp: formatTimestamp(conv.last_message_time),
          unreadCount: conv.unread_count,
          isOnline: false, // TODO: Add online status from backend
          avatar: conv.other_user.avatar,
          isPinned: false, // TODO: Add pinned status
          tripInfo: 'Mumbai → Pune', // TODO: Get from ride info
          isVoiceMessage: conv.last_message_type === 'voice',
          conversationId: conv.id,
          otherUserId: conv.other_user.id,
        }));

        setChats(transformedChats);
      } else {
        console.error('Failed to load conversations:', data);
      }
    } catch (error) {
      console.error('Load conversations error:', error);
      Alert.alert('Error', 'Failed to load conversations');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    loadConversations();
  };

  const formatTimestamp = (timestamp) => {
    if (!timestamp) return '';

    const date = new Date(timestamp);
    const now = new Date();
    const diffInMs = now - date;
    const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));

    if (diffInDays === 0) {
      // Today - show time
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
            <Text style={styles.chatName}>{item.name}</Text>
            {item.isPinned && (
              <Icon name="pin" size={13} color={Colors.secondary} style={styles.pinIcon} />
            )}
          </View>
          <Text style={styles.timestamp}>{item.timestamp}</Text>
        </View>

        <View style={styles.messageRow}>
          <View style={styles.messageContent}>
            <Text style={styles.tripInfo}>{item.tripInfo}</Text>
            <View style={styles.lastMessageRow}>
              {item.isVoiceMessage && (
                <Icon name="mic" size={13} color={Colors.gray} style={styles.voiceIcon} />
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
        <Icon name="chatbubbles-outline" size={100} color={Colors.primary} opacity={0.3} />
      </View>
      <Text style={styles.emptyText}>No chats available</Text>
      <Text style={styles.emptySubtext}>
        Start a ride to connect with other users
      </Text>
    </View>
  );

  const renderSectionHeader = title => (
    <View style={styles.sectionHeader}>
      <Text style={styles.sectionTitle}>{title}</Text>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={Colors.white} />

      {/* HEADER */}
      <View style={styles.header}>
        <TouchableOpacity 
          onPress={() => navigation.goBack()}
          style={styles.backButton}>
          <Icon name="chevron-back" size={28} color={Colors.secondary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Chats</Text>
        <TouchableOpacity 
          style={styles.headerRight}
          onPress={loadConversations}>
          <Icon name="refresh" size={28} color={Colors.secondary} />
        </TouchableOpacity>
      </View>

      {/* SEARCH BAR */}
      <View style={styles.searchContainer}>
        <Icon name="search-outline" size={25} color={Colors.secondary} style={styles.searchIcon} />
          <TextInput
          style={styles.searchInput}
          placeholder="Search..."
          value={searchQuery}
          onChangeText={setSearchQuery}
          placeholderTextColor={Colors.gray}
        />
        {searchQuery.length > 0 && (
          <TouchableOpacity onPress={() => setSearchQuery('')}>
            <Icon name="close-circle" size={23} color={Colors.gray} />
          </TouchableOpacity>
        )}
        
      </View>

      {/* CHAT LIST */}
      {loading && chats.length === 0 ? (
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Loading conversations...</Text>
        </View>
      ) : filteredChats.length === 0 ? (
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
            />
          }
          ListHeaderComponent={
            pinnedChats.length > 0 ? renderSectionHeader('Pinned') : null
          }
        />
      )}
      {/* Reusable Bottom Navigation Component */}
      <BottomNavigation 
        activeTab={activeBottomTab}
        onNavigate={handleBottomNavigation}
      />
    </SafeAreaView>
  );
};

export default ChatListScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.white,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 14,
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
  headerTitle: {
    ...Typography.h2,
    fontSize: 28,
    color: Colors.primary,
  },
  headerRight: {
    padding: 4,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.white,
    marginHorizontal: 16,
    marginVertical: 12,
    paddingHorizontal: 14,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    elevation: 1,
    shadowColor: Colors.black,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
  },
  searchIcon: {
    marginRight: 10,
  },
  searchInput: {
    ...Typography.input,
    flex: 1,
    paddingVertical: 11,
    fontSize: 20,
    color: Colors.dark,
  },
  sectionHeader: {
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 8,
  },
  sectionTitle: {
    ...Typography.label,
    fontSize: 13,
    color: Colors.gray,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  chatList: {
    paddingBottom: 20,
  },
  chatItem: {
    flexDirection: 'row',
    padding: 14,
    backgroundColor: Colors.white,
    marginHorizontal: 16,
    marginBottom: 8,
    borderRadius: 12,
    elevation: 2,
    shadowColor: Colors.black,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 3,
  },
  avatarContainer: {
    position: 'relative',
  },
  avatar: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: Colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    ...Typography.h3,
    fontSize: 22,
    color: Colors.white,
  },
  onlineIndicator: {
    position: 'absolute',
    bottom: 2,
    right: 2,
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: Colors.success,
    borderWidth: 2.5,
    borderColor: Colors.white,
  },
  chatContent: {
    flex: 1,
    marginLeft: 12,
    justifyContent: 'center',
  },
  chatHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  chatName: {
    ...Typography.h4,
    fontSize: 16,
    color: Colors.dark,
  },
  pinIcon: {
    marginLeft: 6,
  },
  timestamp: {
    ...Typography.caption,
    fontSize: 11,
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
    ...Typography.caption,
    fontSize: 11,
    color: Colors.secondary,
    fontWeight: '600',
    marginBottom: 3,
  },
  lastMessageRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  voiceIcon: {
    marginRight: 5,
  },
  lastMessage: {
    ...Typography.body2,
    fontSize: 14,
    color: Colors.gray,
    flex: 1,
  },
  unreadMessage: {
    color: Colors.dark,
    fontWeight: '600',
  },
  unreadBadge: {
    backgroundColor: Colors.secondary,
    borderRadius: 10,
    minWidth: 22,
    height: 22,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 6,
    marginLeft: 8,
  },
  unreadCount: {
    ...Typography.caption,
    fontSize: 11,
    color: Colors.white,
    fontWeight: '700',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    ...Typography.body1,
    color: Colors.gray,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
    marginTop: -50,
  },
  emptyIconContainer: {
    marginBottom: 24,
  },
  emptyText: {
    ...Typography.h3,
    fontSize: 20,
    color: Colors.dark,
    marginBottom: 8,
  },
  emptySubtext: {
    ...Typography.body2,
    fontSize: 14,
    color: Colors.gray,
    textAlign: 'center',
    lineHeight: 20,
  },
});