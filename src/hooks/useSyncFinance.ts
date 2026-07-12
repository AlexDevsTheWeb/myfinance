import { useEffect, useRef } from 'react';
import { runTransaction, onSnapshot } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { getDefaultUserConfig, getUserDocRef } from '../store/sync';
import { useAuthStore } from '../store/useAuthStore';
import { useFinanceStore } from '../store/useFinanceStore';

export const useSyncFinance = () => {
  const { user } = useAuthStore();
  const { setAll } = useFinanceStore();

  const isInitializing = useRef(false);
  const hasLoaded = useRef(false);
  const hasCheckedRecurring = useRef(false);

  useEffect(() => {
    if (!user) {
      isInitializing.current = false;
      hasCheckedRecurring.current = false;
      return;
    }

    if (isInitializing.current) return;

    const docRef = getUserDocRef(user.uid);

    const initializeUser = async () => {
      isInitializing.current = true;
      try {
        await runTransaction(db, async (transaction) => {
          const remoteDoc = await transaction.get(docRef);
          if (remoteDoc.exists()) {
            const data = remoteDoc.data();
            setAll({ ...data, isLoading: false });
          } else {
            const defaultConfig = getDefaultUserConfig();
            transaction.set(docRef, defaultConfig);
            setAll({ ...defaultConfig, isLoading: false });
          }
          hasLoaded.current = true;
        });
      } catch (error) {
        console.error('Error in initializeUser transaction:', error);
        useFinanceStore.getState().setAll({ isLoading: false });
      } finally {
        isInitializing.current = false;
      }
    };

    initializeUser();

    const unsub = onSnapshot(docRef, (doc) => {
      if (doc.metadata.hasPendingWrites) {
        return;
      }
      if (doc.exists() && !isInitializing.current) {
        const storeState = useFinanceStore.getState();
        if (storeState.isSaving || storeState.hasLocalChanges) {
          return;
        }
        const data = doc.data();
        const { setAll, checkRecurring } = useFinanceStore.getState();
        setAll({ ...data, isLoading: !hasLoaded.current });
        if (!hasLoaded.current) {
          hasLoaded.current = true;
        }
        if (!hasCheckedRecurring.current) {
          hasCheckedRecurring.current = true;
          checkRecurring();
        }
      }
    });

    return () => unsub();
  }, [user, setAll]);
};
