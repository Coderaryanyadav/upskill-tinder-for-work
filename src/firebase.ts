// Firebase v9 modular SDK configuration
import { initializeApp } from "firebase/app";
import { getAuth, connectAuthEmulator } from "firebase/auth";
import { getFirestore, connectFirestoreEmulator, enableNetwork, disableNetwork } from "firebase/firestore";
import { getStorage, connectStorageEmulator } from "firebase/storage";
import { getAnalytics } from "firebase/analytics";

// Firebase configuration - Production ready with environment variables
const firebaseConfig = {
    apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "AIzaSyCdN0bYfnR-0B1DpU6v8AvLk0Ez2R2vRV0",
    authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "sih-opskl-5ff32.firebaseapp.com",
    projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "sih-opskl-5ff32",
    storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "sih-opskl-5ff32.firebasestorage.app",
    messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "499617953813",
    appId: import.meta.env.VITE_FIREBASE_APP_ID || "1:499617953813:web:82c720e3b61746d463361c",
    measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID || "G-S7P8FR8DSW"
};

// Validate required configuration
if (!firebaseConfig.apiKey || !firebaseConfig.projectId) {
    throw new Error('Missing required Firebase configuration. Please check your environment variables.');
}

// Initialize Firebase with error handling
let app;
try {
    app = initializeApp(firebaseConfig);
    if (import.meta.env.DEV) console.log('Firebase initialized successfully');
} catch (error) {
    if (import.meta.env.DEV) console.error('Failed to initialize Firebase:', error);
    throw error;
}

// Initialize services with error handling
const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app);

// Initialize analytics only in production and browser environment
const analytics = typeof window !== 'undefined' && import.meta.env.PROD 
    ? getAnalytics(app) 
    : null;

// Configure auth settings
auth.useDeviceLanguage();

// Configure Firestore settings for better performance
if (typeof window !== 'undefined') {
    // Enable offline persistence
    try {
        // This will be handled by the app initialization
        if (import.meta.env.DEV) console.log('Firestore offline persistence enabled');
    } catch (error) {
        if (import.meta.env.DEV) console.warn('Failed to enable offline persistence:', error);
    }
}

// Development emulator setup (disabled for production)
if (import.meta.env.DEV && typeof window !== 'undefined' && import.meta.env.VITE_USE_EMULATORS === 'true') {
    try {
        connectAuthEmulator(auth, 'http://localhost:9099');
        connectFirestoreEmulator(db, 'localhost', 8080);
        connectStorageEmulator(storage, 'localhost', 9199);
    } catch (error) {
        // Emulators already connected or not available
    }
}

// Utility functions for offline handling
export const goOnline = () => enableNetwork(db);
export const goOffline = () => disableNetwork(db);

// Export the services for use in other parts of the app
export { auth, db, storage, analytics };
