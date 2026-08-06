import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { initializeFirestore, persistentLocalCache, persistentMultipleTabManager } from "firebase/firestore";
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
export const db = initializeFirestore(app, {
  localCache: persistentLocalCache({ tabManager: persistentMultipleTabManager() })
});
export const googleProvider = new GoogleAuthProvider();
