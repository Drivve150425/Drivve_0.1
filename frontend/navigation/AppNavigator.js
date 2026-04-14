import React, { useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Platform, LogBox } from 'react-native';

// Import screens with error handling
import SplashScreen from '../screens/SplashScreen';
import LoginScreen from '../screens/LoginScreen';
import OTPScreen from '../screens/OTPScreen';
import HomeScreen from '../screens/HomeScreen';
import CreateProfileScreen from '../screens/CreateProfileScreen';
import DriveNextScreen from '../screens/DriveNext';
import RideNextScreen from '../screens/RideNextScreen';
import RecurringRides from '../screens/RecurringRides';
import ChatListScreen from '../screens/ChatListScreen';
import ChatScreen from '../screens/ChatScreen';
import ProfileDetailsScreen from '../screens/ProfileDetailsScreen';
import myprofilescreen from '../screens/myprofilescreen';
import shareappscreen from '../screens/shareappscreen';
import savedaddressscreen from '../screens/savedaddressscreen';
import addnewvehiclescreen from '../screens/addnewvehiclescreen';
import myvehiclescreen from '../screens/myvehiclescreen';
import EmergencyContactsScreen from '../screens/EmergencyContactsScreen';
import PromotionScreen from '../screens/PromotionsScreen';
import DCoinScreen from '../screens/DCoinScreen';
import RewardsScreen from '../screens/RewardsScreen';
import FAQScreen from '../screens/FAQScreen';
import HelpSupportScreen from '../screens/HelpSupportScreen';
import EmailSupportScreen from '../screens/EmailSupportScreen';
import AboutUsScreen from '../screens/AboutUsScreen';
import MatchingPreferenceScreen from '../screens/MatchingPreferenceScreen';
import DocumentVerificationScreen from '../screens/DocumentVerificationScreen';
import AdminDocumentApprovalScreen from '../screens/AdminDocumentApprovalScreen';

import SettingsScreen from '../screens/SettingsScreen';
import SecurityPrivacyScreen from '../screens/SecurityPrivacyScreen';
import AccountManagementScreen from '../screens/AccountManagementScreen';
import LegalScreen from '../screens/LegalScreen';
import NotificationScreen from '../screens/NotificationScreen';
import LoginActivityScreen from '../screens/LoginActivityScreen';
import BlockedUsersScreen from '../screens/BlockedUsersScreen';
import PushNotificationsScreen from '../screens/PushNotificationsScreen';

import DeactivateAccountScreen from '../screens/DeactivateAccountScreen';
import TermsConditionsScreen from '../screens/TermsConditionsScreen';
import PrivacyPolicyScreen from '../screens/PrivacyPolicyScreen';
import FeedbackScreen from '../screens/Feedbackscreen';
import RideFeedbackScreen from '../screens/RideFeedbackScreen';
import usetnotificationScreen from '../screens/usernotificationscreen';
// import RouteScreen from '../screens/RouteScreen';
import LocationSearchScreen from '../screens/LocationSearchScreen';
import MyRides from '../screens/MyRides';
import RideSuccessScreen from '../screens/RideSuccessScreen';


// Suppress navigation warnings for iOS
LogBox.ignoreLogs([
  'Non-serializable values were found in the navigation state',
  'new NativeEventEmitter()',
]);

const Stack = createNativeStackNavigator();

export default function AppNavigator({ user }) {
  const [showSplash, setShowSplash] = useState(true);

  const onSplashFinish = () => {
    console.log('Splash finished, showing auth screens');
    setShowSplash(false);
  };

  return (
    <NavigationContainer>
      <Stack.Navigator 
        screenOptions={{ 
          headerShown: false,
          animation: Platform.OS === 'ios' ? 'slide_from_right' : 'slide_from_right',
          gestureEnabled: false,
          cardStyle: { backgroundColor: '#FFFFFF' }, // Prevent black screens on iOS
          ...(Platform.OS === 'ios' && {
            presentation: 'card',
            contentStyle: { backgroundColor: '#FFFFFF' },
          })
        }}
        initialRouteName="Splash"
      >
        <Stack.Screen 
          name="Splash"
          options={{
            cardStyle: { backgroundColor: '#184080' },
            ...(Platform.OS === 'ios' && {
              statusBarStyle: 'light',
              statusBarBackgroundColor: '#184080',
            })
          }}
        >
          {(props) => (
            <SplashScreen 
              {...props} 
              onFinish={onSplashFinish}
            />
          )}
        </Stack.Screen>
        
        <Stack.Screen 
          name="Login" 
          component={LoginScreen}
          options={{
            animationTypeForReplace: 'push',
            cardStyle: { backgroundColor: '#FFFFFF' },
            ...(Platform.OS === 'ios' && {
              statusBarStyle: 'dark',
              contentStyle: { backgroundColor: '#FFFFFF' },
            })
          }}
        />
        
        <Stack.Screen 
          name="OTP" 
          component={OTPScreen}
          options={{
            cardStyle: { backgroundColor: '#FFFFFF' },
            gestureEnabled: false, // Prevent swipe back during OTP
            ...(Platform.OS === 'ios' && {
              statusBarStyle: 'dark',
              presentation: 'card',
              contentStyle: { backgroundColor: '#FFFFFF' },
            })
          }}
        />
        
        <Stack.Screen 
          name="CreateProfile" 
          component={CreateProfileScreen}
          options={{ 
            headerShown: false,
            cardStyle: { backgroundColor: '#FFFFFF' },
            gestureEnabled: false,
            // iOS-specific options to prevent black screen
            ...(Platform.OS === 'ios' && {
              presentation: 'card',
              statusBarStyle: 'dark',
              contentStyle: { backgroundColor: '#FFFFFF' },
              cardStyleInterpolator: ({ current }) => ({
                cardStyle: {
                  opacity: current.progress,
                  backgroundColor: '#FFFFFF',
                },
              }),
            })
          }}
        />

        <Stack.Screen 
          name="Home" 
          component={HomeScreen}
          options={{
            cardStyle: { backgroundColor: '#FFFFFF' },
            gestureEnabled: false, // Prevent back navigation from Home
            ...(Platform.OS === 'ios' && {
              statusBarStyle: 'dark',
              contentStyle: { backgroundColor: '#FFFFFF' },
            })
          }}
        />

        <Stack.Screen 
          name="DriveNext"
          component={DriveNextScreen}
          options={{ headerShown: false }}
        />

        <Stack.Screen 
          name="RideNext" 
          component={RideNextScreen}
          options={{ headerShown: false }}
        />

        <Stack.Screen 
          name="Recurring" 
          component={RecurringRides}
          options={{ headerShown: false }}
        />

        <Stack.Screen 
          name="ProfileDetails" 
          component={ProfileDetailsScreen}
          options={{ headerShown: false }}
        />
        <Stack.Screen 
          name="myprofilescreen" 
          component={myprofilescreen}
          options={{ headerShown: false }}
        />
        <Stack.Screen 
          name="ShareAppScreen" 
          component={shareappscreen}
          options={{ headerShown: false }}
        />
        <Stack.Screen 
          name="SavedAddressScreen" 
          component={savedaddressscreen}
          options={{ headerShown: false }}
        />
        <Stack.Screen 
          name="AddNewVehicleScreen" 
          component={addnewvehiclescreen}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="MyVehicleScreen"
          component={myvehiclescreen}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="EmergencyContactsscreen"
          component={EmergencyContactsScreen}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="PromotionScreen"
          component={PromotionScreen}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="DCoinScreen"
          component={DCoinScreen}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="RewardsScreen"
          component={RewardsScreen}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="FAQScreen"
          component={FAQScreen}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="HelpSupportScreen"
          component={HelpSupportScreen}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="EmailSupportScreen"
          component={EmailSupportScreen}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="AboutUsScreen"
          component={AboutUsScreen}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="MatchingPreferenceScreen"
          component={MatchingPreferenceScreen}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="DocumentVerificationScreen"
          component={DocumentVerificationScreen}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="AdminDocumentApprovalScreen"
          component={AdminDocumentApprovalScreen}
          options={{ headerShown: false }}
        />


        <Stack.Screen
          name="Settings"
          component={SettingsScreen}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="SecurityPrivacy"
          component={SecurityPrivacyScreen}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="AccountManagement"
          component={AccountManagementScreen}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="Legal"
          component={LegalScreen}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="NotificationSettings"
          component={NotificationScreen}
          options={{ headerShown: false }}
        />
       
        <Stack.Screen
          name="DeviceManagement"
          component={LoginActivityScreen}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="BlockedUsers"
          component={BlockedUsersScreen}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="PushNotifications"
          component={PushNotificationsScreen}
          options={{ headerShown: false }}
        />
       
      
      
        <Stack.Screen
          name="DeactivateAccount"
          component={DeactivateAccountScreen}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="TermsConditions"
          component={TermsConditionsScreen}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="PrivacyPolicy"
          component={PrivacyPolicyScreen}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="FeedbackScreen"
          component={FeedbackScreen}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="RideFeedbackScreen"
          component={RideFeedbackScreen}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="UserNotificationScreen"
          component={usetnotificationScreen}
          options={{ headerShown: false }}
        />
        
        <Stack.Screen 
          name="ChatList"
          component={ChatListScreen}
          options={{ headerShown: false }}
        />

        <Stack.Screen 
          name="ChatScreen" 
          component={ChatScreen}
          options={{ headerShown: false }}
        />
        
        {/* <Stack.Screen 
          name="RouteScreen" 
          component={RouteScreen}
          options={{ 
            title: 'Route Tester',
            headerShown: true,  // Show header here if wanted
            headerTintColor: 'white',
            headerStyle: { backgroundColor: '#007AFF' }
          }}
        /> */}

        <Stack.Screen
          name="LocationSearch"
          component={LocationSearchScreen}
          options={{ headerShown: false }}
        />

        <Stack.Screen
          name="MyRides"
          component={MyRides}
          options={{ headerShown: false }}
        />

        <Stack.Screen
          name="RideSuccessScreen"
          component={RideSuccessScreen}
          options={{ headerShown: false }}
        />

      </Stack.Navigator>
    </NavigationContainer>
  );
}
