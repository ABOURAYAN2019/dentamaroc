import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth, connectAuthEmulator } from 'firebase/auth';
import {
  getFirestore,
  connectFirestoreEmulator,
  enableIndexedDbPersistence,
} from 'firebase/firestore';
import { getStorage, connectStorageEmulator } from 'firebase/storage';
import { getFunctions, connectFunctionsEmulator } from 'firebase/functions';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || 'fake-api-key-for-emulator',
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || 'dentamaroc-dev.firebaseapp.com',
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || 'dentamaroc-dev',
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || 'dentamaroc-dev.appspot.com',
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || '1234567890',
  appId: import.meta.env.VITE_FIREBASE_APP_ID || '1:1234567890:web:abcdef123456',
};

// Initialize Firebase app (singleton)
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();

export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);
export const functions = getFunctions(app, 'europe-west9');

// Enable offline persistence in browser
if (typeof window !== 'undefined') {
  enableIndexedDbPersistence(db).catch((err) => {
    if (err.code === 'failed-precondition') {
      console.warn('Firestore offline persistence failed: Multiple tabs open');
    } else if (err.code === 'unimplemented') {
      console.warn('Firestore offline persistence is not supported by this browser');
    }
  });
}

// Connect to Firebase Emulators when running in DEV mode or if VITE_USE_EMULATORS is set
const useEmulators = import.meta.env.VITE_USE_EMULATORS === 'true' || import.meta.env.DEV;

if (useEmulators && typeof window !== 'undefined' && !window.__FIREBASE_EMULATORS_CONNECTED__) {
  try {
    const host = window.location.hostname || 'localhost';
    connectAuthEmulator(auth, `http://${host}:9099`, { disableWarnings: true });
    connectFirestoreEmulator(db, host, 8080);
    connectStorageEmulator(storage, host, 9199);
    connectFunctionsEmulator(functions, host, 5001);
    window.__FIREBASE_EMULATORS_CONNECTED__ = true;
    console.info('[DentaMaroc] Connected to Firebase Local Emulators');
  } catch (error) {
    console.warn('[DentaMaroc] Emulators connection note:', error);
  }
}

declare global {
  interface Window {
    __FIREBASE_EMULATORS_CONNECTED__?: boolean;
  }
}

export default app;
