import React, { useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Platform, LogBox } from 'react-native';

// Import screens with error handling
import SplashScreen from '../screens/SplashScreen';
import LoginScreen from '../screens/LoginScreen';
import OTPScreen from '../screens/OTPScreen';
import HomeScreen from '../screens/HomeScreen';
import DriveScreen from '../screens/DriveScreen';
import CreateProfileScreen from '../screens/CreateProfileScreen';
import DriveNextScreen from '../screens/DriveNextScreen';
import RideNextScreen from '../screens/RideNextScreen';
//import ChatListScreen from '../screens/ChatListScreen';
//import ChatScreen from '../screens/ChatScreen';

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
          name="Drive"
          component={DriveScreen}
          options={{
            cardStyle: {backgroundColor: '#FFFFFF'},
            gestureEnabled: false,
            ...(Platform.OS === 'ios' && {
              statusBarStyle: 'dark',
              contentStyle: {backgroundColor: '#FFFFFF'},
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

        {/*
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
        */}

      </Stack.Navigator>
    </NavigationContainer>
  );
}
