import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// TODO: Replace with your actual Firebase config from the Firebase Console
const firebaseConfig = {
  apiKey: "AIzaSyAkAtLCmbhHT167wT0uykIAJ0n9PzEYdNM",
  authDomain: "myfinancetracker-b257e.firebaseapp.com",
  projectId: "myfinancetracker-b257e",
  storageBucket: "myfinancetracker-b257e.firebasestorage.app",
  messagingSenderId: "321545124180",
  appId: "1:321545124180:web:3e18728a082d58d27630c1",
  measurementId: "G-RJGV0M21CZ"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const googleProvider = new GoogleAuthProvider();
