// Firebase configuration file
// Using parivartan-12 project (same as Department Dashboard)

import { initializeApp, getApp, getApps } from 'firebase/app';
import { initializeAuth, getReactNativePersistence, GoogleAuthProvider, onIdTokenChanged } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getAnalytics, isSupported } from 'firebase/analytics';

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: process.env.EXPO_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.EXPO_PUBLIC_FIREBASE_APP_ID,
  measurementId: process.env.EXPO_PUBLIC_FIREBASE_MEASUREMENT_ID
};

// Initialize Firebase
const app = getApps().length ? getApp() : initializeApp(firebaseConfig);

// Initialize Firebase Auth with AsyncStorage persistence
const auth = initializeAuth(app, {
  persistence: getReactNativePersistence(AsyncStorage)
});

// Track token refresh times
let lastTokenRefreshTime: number | null = null;
const TOKEN_REFRESH_STORAGE_KEY = 'parivartan_last_token_refresh';

// Function to get the last token refresh time
export const getLastTokenRefreshTime = async (): Promise<Date | null> => {
  try {
    // Try to get from memory first
    if (lastTokenRefreshTime) {
      return new Date(lastTokenRefreshTime);
    }
    
    // Otherwise try to get from storage
    const timeStr = await AsyncStorage.getItem(TOKEN_REFRESH_STORAGE_KEY);
    if (timeStr) {
      const time = parseInt(timeStr, 10);
      if (!isNaN(time)) {
        lastTokenRefreshTime = time;
        return new Date(time);
      }
    }
  } catch (err) {
    console.error('Error getting token refresh time:', err);
  }
  return null;
};

// Set up token refresh listener
onIdTokenChanged(auth, async (user) => {
  if (user) {
    // Update the last token refresh time
    lastTokenRefreshTime = Date.now();
    try {
      await AsyncStorage.setItem(TOKEN_REFRESH_STORAGE_KEY, lastTokenRefreshTime.toString());
    } catch (err) {
      console.error('Error saving token refresh time:', err);
    }
  }
});

// Initialize Firestore and Storage
const db = getFirestore(app);
const storage = getStorage(app);

// Create a Google provider
const googleProvider = new GoogleAuthProvider();

// Analytics may not be available on all platforms
let analytics = null;
isSupported().then(yes => {
  if (yes) analytics = getAnalytics(app);
}).catch(e => console.log('Analytics not supported:', e));

export { app, auth, db, storage, googleProvider, analytics };
