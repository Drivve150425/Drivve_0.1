import 'react-native-gesture-handler';
import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, LogBox, Platform } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import AppNavigator from './navigation/AppNavigator';
import { useAppFonts } from './constants/Fonts';
import { Colors } from './constants/Colors';
import FirebaseAuthService from './services/FirebaseAuthService';

export default function App() {
  const [fontsLoaded] = useAppFonts();
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  
  // Enhanced iOS-specific error suppression
  LogBox.ignoreLogs([
    'new NativeEventEmitter()',
    'Invariant Violation: `new NativeEventEmitter()` requires a non-null argument',
    'Non-serializable values were found in the navigation state',
    'Require cycle:',
    'VirtualizedLists should never be nested',
    'Warning: AsyncStorage has been extracted from react-native',
    'componentWillReceiveProps',
    'componentWillMount',
    'Task orphaned for request',
    'Setting a timer for a long period of time'
  ]);

  // Enhanced global error handler for iOS
  useEffect(() => {
    if (Platform.OS === 'ios') {
      const originalConsoleError = console.error;
      const originalConsoleWarn = console.warn;
      
      console.error = (...args) => {
        // Ignore specific iOS errors that don't affect functionality
        if (args[0] && typeof args[0] === 'string') {
          const errorString = args[0];
          if (
            errorString.includes('Invariant Violation: `new NativeEventEmitter()`') ||
            errorString.includes('new NativeEventEmitter()') ||
            errorString.includes('Task orphaned') ||
            errorString.includes('Setting a timer for a long period')
          ) {
            return; // Silently ignore these errors
          }
        }
        originalConsoleError.apply(console, args);
      };

      console.warn = (...args) => {
        // Ignore specific iOS warnings
        if (args[0] && typeof args[0] === 'string') {
          const warnString = args[0];
          if (
            warnString.includes('new NativeEventEmitter()') ||
            warnString.includes('Non-serializable values were found')
          ) {
            return; // Silently ignore these warnings
          }
        }
        originalConsoleWarn.apply(console, args);
      };
    }
  }, []);

  useEffect(() => {
    // Listen to authentication state changes
    const unsubscribe = FirebaseAuthService.onAuthStateChanged((user) => {
      console.log('Auth state changed:', user ? 'User logged in' : 'User logged out');
      setUser(user);
      
      // Add iOS-specific delay to prevent timing issues
      if (Platform.OS === 'ios') {
        setTimeout(() => setIsLoading(false), 200);
      } else {
        setIsLoading(false);
      }
    });

    // Cleanup subscription on unmount
    return () => {
      if (unsubscribe && typeof unsubscribe === 'function') {
        unsubscribe();
      }
      FirebaseAuthService.cleanup();
    };
  }, []);

  // Show loading screen while fonts or auth state is loading
  if (!fontsLoaded || isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={Colors.primary} />
        <Text style={styles.loadingText}>Loading DRIVVE...</Text>
        <Text style={styles.platformText}>
          {Platform.OS === 'ios' ? '🍎 iOS' : '🤖 Android'} Ready
        </Text>
      </View>
    );
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <StatusBar style="auto" backgroundColor={Colors.white} />
      <AppNavigator user={user} />
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.primary,
  },
  loadingText: {
    color: Colors.white,
    fontSize: 18,
    fontWeight: '600',
    marginTop: 20,
  },
  platformText: {
    color: Colors.white,
    fontSize: 14,
    marginTop: 10,
    opacity: 0.8,
  },
});
