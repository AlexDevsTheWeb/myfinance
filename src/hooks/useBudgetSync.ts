import { useEffect, useRef } from 'react';
import { runTransaction, onSnapshot } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { getDefaultUserConfig, getUserDocRef } from '../store/sync';
import { useAuthStore } from '../store/useAuthStore';
import { useBudgetStore } from '../store/useBudgetStore';

export const useBudgetSync = () => {
  const { user } = useAuthStore();
  const { setBudgetTargets } = useBudgetStore();

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
            const rawData = remoteDoc.data() as unknown as Record<string, unknown>;
            const targets = Array.isArray(rawData.budgetTargets) ? rawData.budgetTargets as never[] : [];
            setBudgetTargets(targets);
          } else {
            const defaultConfig = getDefaultUserConfig();
            transaction.set(docRef, defaultConfig);
            setBudgetTargets(defaultConfig.budgetTargets ?? []);
          }
        });
      } catch (error) {
        console.error('Error in useBudgetSync initializeUser:', error);
      } finally {
        isInitializing.current = false;
      }
    };

    initializeUser();

    const unsub = onSnapshot(docRef, (doc) => {
      if (doc.metadata.hasPendingWrites) return;
      if (doc.exists() && !isInitializing.current) {
        const storeState = useBudgetStore.getState();
        if (storeState.isSaving) return;
        const rawData = doc.data() as unknown as Record<string, unknown>;
        const targets = Array.isArray(rawData.budgetTargets) ? rawData.budgetTargets as never[] : [];
        setBudgetTargets(targets);
      }
    });

    return () => unsub();
  }, [user, setBudgetTargets]);
};
