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

  useEffect(() => {
    if (!user) {
      isInitializing.current = false;
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
            setAll(data);
          } else {
            const defaultConfig = getDefaultUserConfig();
            transaction.set(docRef, defaultConfig);
            setAll(defaultConfig);
          }
        });
      } catch (error) {
        console.error('Error in initializeUser transaction:', error);
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
        const data = doc.data();
        const { setAll, checkRecurring } = useFinanceStore.getState();
        setAll(data);
        checkRecurring();
      }
    });

    return () => unsub();
  }, [user, setAll]);
};
