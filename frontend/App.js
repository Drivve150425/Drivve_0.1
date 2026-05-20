import 'react-native-gesture-handler';
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  LogBox,
  Platform,
} from 'react-native';

import { StatusBar } from 'expo-status-bar';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

import AppNavigator from './navigation/AppNavigator';

import { useAppFonts } from './constants/Fonts';
import { Colors } from './constants/Colors';

import FirebaseAuthService from './services/FirebaseAuthService';

import { AuthProvider } from './context/AuthContext';

import * as Updates from 'expo-updates';

export default function App() {
  const [fontsLoaded] = useAppFonts();

  const [isLoading, setIsLoading] = useState(true);

  // =========================================
  // LOGBOX
  // =========================================
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
    'Setting a timer for a long period of time',
  ]);

  // =========================================
  // AUTO UPDATE
  // =========================================
  useEffect(() => {
    async function updateApp() {
      try {
        const update = await Updates.checkForUpdateAsync();

        if (update.isAvailable) {
          await Updates.fetchUpdateAsync();

          await Updates.reloadAsync();
        }
      } catch (error) {
        console.log('Update error:', error);
      }
    }

    updateApp();
  }, []);

  // =========================================
  // IOS WARNINGS
  // =========================================
  useEffect(() => {
    if (Platform.OS === 'ios') {
      const originalConsoleError = console.error;
      const originalConsoleWarn = console.warn;

      console.error = (...args) => {
        if (args[0] && typeof args[0] === 'string') {
          const errorString = args[0];

          if (
            errorString.includes(
              'Invariant Violation: `new NativeEventEmitter()`'
            ) ||
            errorString.includes('new NativeEventEmitter()') ||
            errorString.includes('Task orphaned') ||
            errorString.includes(
              'Setting a timer for a long period'
            )
          ) {
            return;
          }
        }

        originalConsoleError.apply(console, args);
      };

      console.warn = (...args) => {
        if (args[0] && typeof args[0] === 'string') {
          const warnString = args[0];

          if (
            warnString.includes('new NativeEventEmitter()') ||
            warnString.includes(
              'Non-serializable values were found'
            )
          ) {
            return;
          }
        }

        originalConsoleWarn.apply(console, args);
      };
    }
  }, []);

  // =========================================
  // INITIALIZE APP
  // =========================================
  useEffect(() => {
    setIsLoading(false);

    return () => {
      FirebaseAuthService.cleanup();
    };
  }, []);

  // =========================================
  // LOADING SCREEN
  // =========================================
  if (!fontsLoaded || isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator
          size="large"
          color={Colors.primary}
        />

        <Text style={styles.loadingText}>
          Loading DRIVVE...
        </Text>

        <Text style={styles.platformText}>
          {Platform.OS === 'ios'
            ? '🍎 iOS'
            : '🤖 Android'}{' '}
          Ready
        </Text>
      </View>
    );
  }

  // =========================================
  // APP
  // =========================================
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <AuthProvider>
        <StatusBar
          style="auto"
          backgroundColor={Colors.white}
        />

        <AppNavigator />
      </AuthProvider>
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