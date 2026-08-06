import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore, initializeFirestore, persistentLocalCache, persistentMultipleTabManager } from "firebase/firestore";
import { getEnvVar } from "../utils/variables.utils";

const apiKey = getEnvVar('VITE_FIREBASE_API_KEY');
const authDomain = getEnvVar('VITE_FIREBASE_AUTH_DOMAIN');
const projectId = getEnvVar('VITE_FIREBASE_PROJECT_ID');
const storageBucket = getEnvVar('VITE_FIREBASE_STORAGE_BUCKET');
const messagingSenderId = getEnvVar('VITE_FIREBASE_MESSAGING_SENDER_ID');
const appId = getEnvVar('VITE_FIREBASE_APP_ID');
const measurementId = getEnvVar('VITE_FIREBASE_MEASUREMENT_ID');

const firebaseConfig = {
  apiKey,
  authDomain,
  projectId,
  storageBucket,
  messagingSenderId,
  appId,
  measurementId
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);

// IndexedDB-backed persistence (offline reads + queued writes). If IndexedDB is
// unavailable (Safari private browsing, embedded WebViews), the SDK throws when
// Firestore is first used — so probe availability up front and fall back to the
// plain in-memory client (identical to pre-persistence behavior) when needed.
const indexedDbAvailable =
  typeof window !== 'undefined' &&
  typeof window.indexedDB !== 'undefined' &&
  typeof window.indexedDB.open === 'function';

export const db = indexedDbAvailable
  ? initializeFirestore(app, {
      localCache: persistentLocalCache({ tabManager: persistentMultipleTabManager() })
    })
  : getFirestore(app);
export const googleProvider = new GoogleAuthProvider();
