import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  StatusBar,
    KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons, Ionicons } from '@expo/vector-icons';
import { Colors, Typography } from '../constants/Colors';
import { Linking } from 'react-native';
export default function LegalScreen({ navigation }) {
  const legalItems = [
    {
      id: 'terms',
      title: 'Terms & Conditions',
      icon: 'document-text-outline',
      screen: 'TermsConditions',
    },
    {
      id: 'privacy',
      title: 'Privacy Policy',
      icon: 'shield-checkmark-outline',
      screen: 'PrivacyPolicy',
    },
  ];
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
                                         <Text style={styles.headerTitle}>Legal</Text>
                                         <View style={styles.headerSpacer} />
                                       </View>

      {/* ===== CONTENT ===== */}
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        
        <View style={styles.mainCard}>
          
           <View style={styles.infoBox}>
            <MaterialIcons name="info" size={20} color={Colors.primary} />
            <Text style={styles.infoText}>
              These documents explain your rights, responsibilities,
              and how we handle and protect your data.
            </Text>
          </View>
          <Text style={styles.sectionTitle}>Legal Documents</Text>
          <Text style={styles.sectionSubtitle}>
            Review our terms, policies, and agreements
          </Text>

          {/* LIST */}
          <View style={styles.listCard}>
            {legalItems.map((item, index) => (
              <TouchableOpacity
                key={item.id}
                style={[
                  styles.legalItem,
                  index === legalItems.length - 1 && styles.lastItem,
                ]}
onPress={() => {
  if (item.id === 'terms') {
    Linking.openURL('https://drivve.in');
  } else if (item.id === 'privacy') {
    Linking.openURL('https://drivve.in');
  }
}}                activeOpacity={0.7}
              >
                <View style={styles.iconWrapper}>
                  <Ionicons
                    name={item.icon}
                    size={22}
                    color={Colors.primary}
                  />
                </View>

                <Text style={styles.legalTitle}>{item.title}</Text>

                <MaterialIcons
                  name="chevron-right"
                  size={26}
                  color={Colors.orange1}
                  style={{ opacity: 0.4 }}
                />
              </TouchableOpacity>
            ))}
          </View>

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
    bottom:10
  },

  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.primary,
    top:10
  },
  sectionSubtitle: {
    fontSize: 15,
    color: Colors.dark,
    opacity: 0.7,
    marginTop: 15,
    marginBottom: 20,
  },

  /* LIST CARD */
  listCard: {
    backgroundColor: Colors.white,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#F3F4F6',
    overflow: 'hidden',
    marginBottom: 24,
  },

  legalItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  lastItem: {
    borderBottomWidth: 0,
  },

  iconWrapper: {
    width: 42,
    height: 42,
    borderRadius: 12,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
  },

  legalTitle: {
    flex: 1,
    fontSize: 18,
    fontWeight: '600',
    color: Colors.primary,
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
  },
  infoText: {
    flex: 1,
    fontSize: 14,
    color: Colors.primary,
    lineHeight: 20,
  },
});
