import { initializeApp } from 'firebase/app';
import { getAnalytics } from "firebase/analytics";
import { initializeAuth, getReactNativePersistence } from 'firebase/auth';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';

const firebaseConfig = {
  apiKey: "AIzaSyDT9CwPyi8F1skgwfM8QSrdEhDcyLwXx80",
  authDomain: "drivve-a1299.firebaseapp.com",
  projectId: "drivve-a1299",
  storageBucket: "drivve-a1299.firebasestorage.app",
  messagingSenderId: "427437171781",
  appId: "1:427437171781:web:fc72553e1819754618af2c",
  measurementId: "G-FC9917T0KX"
};

// Initialize Firebase JS SDK (used for web + shared config)
const app = initializeApp(firebaseConfig);
let analytics = null;
try {
  analytics = getAnalytics(app);
} catch (_) {
  // getAnalytics can fail on native; ignore
}

// Platform-aware auth instance
let auth;
if (Platform.OS === 'web') {
  const { getAuth } = require('firebase/auth');
  auth = getAuth(app);
} else {
  // Expo Go does not provide RNFirebase; but Firebase JS SDK init is fine.
  // However, avoid risking crashes on native if something is misconfigured.
  try {
    auth = initializeAuth(app, {
      persistence: getReactNativePersistence(AsyncStorage),
    });
    console.log('✅ Firebase Auth initialized with AsyncStorage persistence');
  } catch (error) {
    console.log('⚠️ Firebase Auth init failed on native; using auth fallback:', error?.message);
    try {
      const { getAuth } = require('firebase/auth');
      auth = getAuth(app);
    } catch (fallbackError) {
      console.log('❌ Firebase Auth fallback also failed:', fallbackError?.message);
      auth = null;
    }
  }
}

export { auth, firebaseConfig };
export default app;

