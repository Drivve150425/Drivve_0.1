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
const analytics = getAnalytics(app);

// Platform-aware auth instance
let auth;
if (Platform.OS === 'web') {
  const { getAuth } = require('firebase/auth');
  auth = getAuth(app);
} else {
  try {
    auth = initializeAuth(app, {
      persistence: getReactNativePersistence(AsyncStorage)
    });
    console.log('✅ Firebase Auth initialized with AsyncStorage persistence');
  } catch (error) {
    console.log('⚠️ Firebase Auth already initialized');
    const { getAuth } = require('firebase/auth');
    auth = getAuth(app);
  }
}

export { auth, firebaseConfig };
export default app;
