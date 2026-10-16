import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth, connectAuthEmulator } from 'firebase/auth';
import {
  getFirestore,
  connectFirestoreEmulator,
  enableIndexedDbPersistence,
} from 'firebase/firestore';
import { getStorage, connectStorageEmulator } from 'firebase/storage';
import { getFunctions, connectFunctionsEmulator } from 'firebase/functions';
import { appConfig } from './app.config';

const firebaseConfig = {
  apiKey: appConfig.firebase.apiKey,
  authDomain: appConfig.firebase.authDomain,
  projectId: appConfig.firebase.projectId,
  storageBucket: appConfig.firebase.storageBucket,
  messagingSenderId: appConfig.firebase.messagingSenderId,
  appId: appConfig.firebase.appId,
};

// Initialize Firebase app (singleton)
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();

export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);
export const functions = getFunctions(app, appConfig.firebase.region);

// Enable offline persistence in browser
if (typeof window !== 'undefined' && typeof indexedDB !== 'undefined') {
  enableIndexedDbPersistence(db).catch((err: { code?: string }) => {
    if (err.code === 'failed-precondition') {
      console.warn('Firestore offline persistence failed: Multiple tabs open');
    } else if (err.code === 'unimplemented') {
      console.warn('Firestore offline persistence is not supported by this browser');
    }
  });
}

// Connect to Firebase Emulators when configured
if (
  appConfig.firebase.useEmulators &&
  typeof window !== 'undefined' &&
  !window.__FIREBASE_EMULATORS_CONNECTED__
) {
  try {
    const host = window.location.hostname || 'localhost';
    connectAuthEmulator(auth, `http://${host}:9099`, { disableWarnings: true });
    connectFirestoreEmulator(db, host, 8080);
    connectStorageEmulator(storage, host, 9199);
    connectFunctionsEmulator(functions, host, 5001);
    window.__FIREBASE_EMULATORS_CONNECTED__ = true;
    console.info(`[${appConfig.app.name}] Connected to Firebase Local Emulators`);
  } catch (error) {
    console.warn(`[${appConfig.app.name}] Emulators connection note:`, error);
  }
}

declare global {
  interface Window {
    __FIREBASE_EMULATORS_CONNECTED__?: boolean;
  }
}

export default app;
