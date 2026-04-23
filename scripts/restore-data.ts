import { initializeApp } from "firebase/app";
import { getFirestore, doc, setDoc } from "firebase/firestore";
import data from "./recovery.json";

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID,
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

const { state } = data;

async function restoreData() {
  const userId = prompt("Enter your Firebase user UID:");
  if (!userId) {
    console.log("User ID required");
    return;
  }

  console.log("Restoring data for user:", userId);

  try {
    await setDoc(doc(db, "users", userId), {
      initialBalance: state.initialBalance,
      accounts: state.accounts,
      categories: state.categories,
      incomeCategories: state.incomeCategories,
      transactions: state.transactions,
      recurringTransactions: state.recurringTransactions || [],
      carMileage: state.carMileage || [],
      carInitialMileage: state.carInitialMileage || 0,
      tireSettings: state.tireSettings || { summerModel: "", winterModel: "", initialTireType: "summer" },
      tireChanges: state.tireChanges || [],
      enabledModules: state.enabledModules || { financeTracker: true, carManagement: false, utilityTracker: false },
      balanceStartDate: state.balanceStartDate || "2026-01-01",
      deletedRecurringInstances: state.deletedRecurringInstances || [],
    }, { merge: true });

    console.log("Data restored successfully!");
    console.log(`- ${state.transactions.length} transactions`);
    console.log(`- ${state.accounts.length} accounts`);
    console.log(`- ${state.categories.length} categories`);
  } catch (error) {
    console.error("Error restoring data:", error);
  }
}

restoreData();