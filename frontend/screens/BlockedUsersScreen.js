import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  StatusBar,
  FlatList,
  Alert,
     KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons, Ionicons } from '@expo/vector-icons';
import { Colors, Typography } from '../constants/Colors';
import DatabaseService from '../services/blockeduser_ds';
import { useAuth } from '../context/AuthContext';

export default function BlockedUsersScreen({ navigation, route }) {
  const { user } = useAuth();

  const phone_number = user?.phone_number;

  const [blockedUsers, setBlockedUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  /* ================= LOAD BLOCKED USERS ================= */
  useEffect(() => {
    loadBlockedUsers();
  }, []);

  const loadBlockedUsers = async () => {
    if (!phone_number) return;

    setLoading(true);
    const res = await DatabaseService.getBlockedUsers(phone_number);
    setLoading(false);

    if (res?.success) {
      setBlockedUsers(res.blocked_users || []);
    }
  };

  /* ================= UNBLOCK ================= */
  const handleUnblock = (user) => {
    Alert.alert(
      'Unblock User',
      `Unblock ${user.name}? They will be able to contact you again.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Unblock',
          style: 'destructive',
          onPress: async () => {
            const res = await DatabaseService.unblockUser(user.id);
            if (res?.success) {
              setBlockedUsers(prev =>
                prev.filter(u => u.id !== user.id)
              );
            }
          },
        },
      ]
    );
  };

  const renderUserItem = ({ item }) => (
    <View style={styles.userItem}>
      {/* AVATAR */}
      <View style={styles.userAvatar}>
        <Text style={styles.avatarText}>
          {item.name?.charAt(0)?.toUpperCase() || '?'}
        </Text>
      </View>

      {/* INFO */}
      <View style={styles.userInfo}>
        <Text style={styles.userName}>{item.name}</Text>
        <Text style={styles.userPhone}>{item.phone}</Text>
      </View>

      {/* ACTION */}
      <TouchableOpacity
        style={styles.unblockButton}
        onPress={() => handleUnblock(item)}
      >
        <Text style={styles.unblockText}>Unblock</Text>
      </TouchableOpacity>
    </View>
  );
const handleBack = () => {
    navigation.goBack();
  };
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
                                                     <Text style={styles.headerTitle}>Blocked Users</Text>
                                                     <View style={styles.headerSpacer} />
                                                   </View>
      {/* CONTENT */}
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.mainCard}>
          <Text style={styles.sectionTitle}>Blocked Users</Text>
           <View style={styles.infoBox}>
            <MaterialIcons name="info" size={20} color={Colors.primary} />
            <Text style={styles.infoText}>
              To block someone, go to their profile and tap “Block User.”
            </Text>
          </View>
          <Text style={styles.sectionSubtitle}>
            Users you block won’t be able to contact you or view your profile.
          </Text>

          {blockedUsers.length === 0 ? (
            <View style={styles.emptyState}>
              <MaterialIcons
                name="person-remove"
                size={64}
                color={Colors.primary}
              />
              <Text style={styles.emptyText}>
                You haven’t blocked anyone yet.
              </Text>
            </View>
          ) : (
            <FlatList
              data={blockedUsers}
              renderItem={renderUserItem}
              keyExtractor={item => String(item.id)}
              scrollEnabled={false}
              contentContainerStyle={{ paddingBottom: 8 }}
            />
          )}

          {/* INFO */}
         
        </View>
      </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

/* ================= STYLES ================= */

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.white,
  },
keyboardAvoidingView: {
     flex: 1,
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


  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 40,
  },

  mainCard: {
    backgroundColor: Colors.white,
    borderRadius: 20,
    padding: 18,
    borderWidth: 1,
    borderColor: '#F3F4F6',
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 8 },
    elevation: 4,
  },

  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: Colors.primary,
  },
  sectionSubtitle: {
    fontSize: 17,
    color: Colors.dark,
    opacity: 0.7,
    marginTop: 6,
    marginBottom: 20,
  },

  /* LIST ITEM */
  userItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#F3F4F6',
    marginBottom: 12,
    backgroundColor: '#F9FAFB',
  },

  userAvatar: {
    width: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor: Colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
  },
  avatarText: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.white,
  },

  userInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.dark,
    marginBottom: 2,
  },
  userPhone: {
    fontSize: 14,
    color: Colors.dark,
    opacity: 0.65,
  },

  unblockButton: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 10,
    backgroundColor: '#FFEBEE',
  },
  unblockText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#D32F2F',
  },

  /* EMPTY */
  emptyState: {
    alignItems: 'center',
    paddingVertical: 10,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.dark,
    marginTop: 16,
    marginBottom: 6,
  },
  emptyText: {
    fontSize: 17,
    color: Colors.dark,
    opacity: 0.6,
    textAlign: 'center',
  },

  /* INFO */
  infoBox: {
    flexDirection: 'row',
    gap: 12,
    backgroundColor: '#E3F2FD',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#BBDEFB',
    marginTop: 8
  },
  infoText: {
    flex: 1,
    fontSize: 16,
    color: Colors.primary,
    lineHeight: 20,
  },
});
