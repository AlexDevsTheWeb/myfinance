import { useEffect, useRef } from 'react';
import { runTransaction, onSnapshot, writeBatch, doc } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { getDefaultUserConfig, getUserDocRef, backfillRecurringToSubCollection } from '../store/sync';
import { getTransactionsCollectionRef, getRecurringTransactionsCollectionRef } from '../lib/converters';
import { useAuthStore } from '../store/useAuthStore';
import { useFinanceStore } from '../store/useFinanceStore';

export const useSyncFinance = () => {
  const { user } = useAuthStore();
  const { setAll } = useFinanceStore();

  const isInitializing = useRef(false);
  const hasLoaded = useRef(false);
  const hasCheckedRecurring = useRef(false);
  const subColLoaded = useRef(false);
  const hasCleanedOrphans = useRef(false);
  const recurringSubColLoaded = useRef(false);

  useEffect(() => {
    if (!user) {
      isInitializing.current = false;
      hasCheckedRecurring.current = false;
      subColLoaded.current = false;
      recurringSubColLoaded.current = false;
      return;
    }

    if (isInitializing.current) return;

    const docRef = getUserDocRef(user.uid);
    const txnsRef = getTransactionsCollectionRef(user.uid);
    const recsRef = getRecurringTransactionsCollectionRef(user.uid);

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
        await backfillRecurringToSubCollection(user.uid);
      } catch (error) {
        console.error('Error in initializeUser transaction:', error);
        useFinanceStore.getState().setAll({ isLoading: false });
      } finally {
        isInitializing.current = false;
        if (!hasCheckedRecurring.current && hasLoaded.current && subColLoaded.current && recurringSubColLoaded.current) {
          hasCheckedRecurring.current = true;
          useFinanceStore.getState().checkRecurring();
        }
      }
    };

    initializeUser();

    const unsubDoc = onSnapshot(docRef, (doc) => {
      if (doc.metadata.hasPendingWrites) return;
      if (doc.exists()) {
        const storeState = useFinanceStore.getState();
        if (storeState.isSaving || storeState.hasLocalChanges) return;
        const data = doc.data();
        const { setAll, checkRecurring } = useFinanceStore.getState();
        setAll({ ...data, isLoading: !(hasLoaded.current || subColLoaded.current) });
        if (!hasLoaded.current) {
          hasLoaded.current = true;
        }
        if (!hasCheckedRecurring.current && subColLoaded.current && recurringSubColLoaded.current) {
          hasCheckedRecurring.current = true;
          checkRecurring();
        }
      }
    });

    const unsubTxns = onSnapshot(txnsRef, (snapshot) => {
      if (!subColLoaded.current) {
        subColLoaded.current = true;
      }

      const allDocs = snapshot.docs.map(d => ({ ...d.data(), id: d.id }));
      const sorted = allDocs.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

      const seen = new Set<string>();
      const orphanedIds: string[] = [];
      const deduped: typeof sorted = [];
      for (const t of sorted) {
        const key = t.recurringLinkId ? `${t.recurringLinkId}|${t.date}` : t.id;
        if (!seen.has(key)) {
          seen.add(key);
          deduped.push(t);
        } else {
          orphanedIds.push(t.id);
        }
      }

      if (orphanedIds.length > 0 && !snapshot.metadata.hasPendingWrites && !hasCleanedOrphans.current) {
        hasCleanedOrphans.current = true;
        const batch = writeBatch(db);
        for (const orphanId of orphanedIds) {
          batch.delete(doc(txnsRef, orphanId));
        }
        batch.commit().catch(err => console.error('orphan cleanup failed:', err));
      }

      const { setAll, checkRecurring } = useFinanceStore.getState();
      setAll({ transactions: deduped as never[], isLoading: false });
      if (!hasCheckedRecurring.current && hasLoaded.current && recurringSubColLoaded.current) {
        hasCheckedRecurring.current = true;
        checkRecurring();
      }
    });

    const unsubRecs = onSnapshot(recsRef, (snapshot) => {
      if (!recurringSubColLoaded.current) {
        recurringSubColLoaded.current = true;
      }

      if (snapshot.metadata.hasPendingWrites) return;

      const allDocs = snapshot.docs.map((d) => ({ ...d.data(), id: d.id }));
      const sorted = allDocs.sort((a, b) => a.description.localeCompare(b.description));

      const { setAll } = useFinanceStore.getState();
      setAll({ recurringTransactions: sorted as never[], isLoading: false });
    });

    return () => {
      unsubDoc();
      unsubTxns();
      unsubRecs();
    };
  }, [user, setAll]);
};
