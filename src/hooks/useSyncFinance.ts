import { useEffect, useRef } from 'react';
import { runTransaction, onSnapshot } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { getDefaultUserConfig, getUserDocRef, backfillTransactionsToSubCollection } from '../store/sync';
import { getTransactionsCollectionRef } from '../lib/converters';
import { useAuthStore } from '../store/useAuthStore';
import { useFinanceStore } from '../store/useFinanceStore';

export const useSyncFinance = () => {
  const { user } = useAuthStore();
  const { setAll } = useFinanceStore();

  const isInitializing = useRef(false);
  const hasLoaded = useRef(false);
  const hasCheckedRecurring = useRef(false);
  const subColLoaded = useRef(false);
  const hasBackfilled = useRef(false);

  useEffect(() => {
    if (!user) {
      isInitializing.current = false;
      hasCheckedRecurring.current = false;
      subColLoaded.current = false;
      hasBackfilled.current = false;
      return;
    }

    if (isInitializing.current) return;

    const docRef = getUserDocRef(user.uid);
    const txnsRef = getTransactionsCollectionRef(user.uid);

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

        if (!hasBackfilled.current) {
          hasBackfilled.current = true;
          const { written } = await backfillTransactionsToSubCollection(user.uid);
          if (written > 0) {
            console.log(`Backfilled ${written} transaction(s) from legacy array to sub-collection`);
          }
        }
      } catch (error) {
        console.error('Error in initializeUser transaction:', error);
        useFinanceStore.getState().setAll({ isLoading: false });
      } finally {
        isInitializing.current = false;
      }
    };

    initializeUser();

    const unsubDoc = onSnapshot(docRef, (doc) => {
      if (doc.metadata.hasPendingWrites) return;
      if (doc.exists() && !isInitializing.current) {
        const storeState = useFinanceStore.getState();
        if (storeState.isSaving || storeState.hasLocalChanges) return;
        const data = doc.data();
        const { setAll, checkRecurring } = useFinanceStore.getState();
        setAll({ ...data, isLoading: !(hasLoaded.current || subColLoaded.current) });
        if (!hasLoaded.current) {
          hasLoaded.current = true;
        }
        if (!hasCheckedRecurring.current) {
          hasCheckedRecurring.current = true;
          checkRecurring();
        }
      }
    });

    const unsubTxns = onSnapshot(txnsRef, (snapshot) => {
      if (!subColLoaded.current) {
        subColLoaded.current = true;
      }
      const transactions = snapshot.docs.map(d => d.data());
      const sorted = transactions.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
      useFinanceStore.getState().setAll({ transactions: sorted as never[], isLoading: false });
    });

    return () => {
      unsubDoc();
      unsubTxns();
    };
  }, [user, setAll]);
};
