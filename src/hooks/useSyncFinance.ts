import { useEffect, useRef } from 'react';
import { runTransaction, onSnapshot, writeBatch, doc } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { getDefaultUserConfig, getUserDocRef, backfillRecurringToSubCollection } from '../store/sync';
import { getTransactionsCollectionRef, getRecurringTransactionsCollectionRef } from '../lib/converters';
import { useAuthStore } from '../store/useAuthStore';
import { useFinanceStore } from '../store/useFinanceStore';
import dayjs from 'dayjs';

export const useSyncFinance = () => {
  const { user } = useAuthStore();
  const { setAll } = useFinanceStore();

  const isInitializing = useRef(false);
  const hasLoaded = useRef(false);
  const hasCheckedRecurring = useRef(false);
  const subColLoaded = useRef(false);
  const hasCleanedOrphans = useRef(false);
  const recurringSubColLoaded = useRef(false);
  const syncErrors = useRef<Record<string, string>>({});

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
        syncErrors.current[`users/${user.uid} (initializeUser)`] = (error as Error).message;
        console.error('Error in initializeUser transaction:', error);
        useFinanceStore.getState().setAll({ isLoading: false });
      } finally {
        isInitializing.current = false;
        maybeCheckRecurring();
      }
    };

    initializeUser();

    const onListenerError = (path: string) => (err: Error) => {
      syncErrors.current[path] = err.message;
      console.error(`[sync] snapshot listener failed (${path}):`, err);
    };

    // Fire checkRecurring exactly once per session, once all three listeners have
    // delivered AND real templates are present. Burning the flag on an empty list
    // (e.g. recurring subcollection still migrating) deadlocks the session.
    const maybeCheckRecurring = () => {
      if (hasCheckedRecurring.current) return;
      if (!(hasLoaded.current && subColLoaded.current && recurringSubColLoaded.current)) return;
      const state = useFinanceStore.getState();
      if (state.recurringTransactions.length === 0) return;
      hasCheckedRecurring.current = true;
      state.checkRecurring();
    };

    const unsubDoc = onSnapshot(docRef, (doc) => {
      if (doc.metadata.hasPendingWrites) return;
      if (doc.exists()) {
        const storeState = useFinanceStore.getState();
        if (storeState.isSaving || storeState.hasLocalChanges) return;
        const data = doc.data();
        const { setAll } = useFinanceStore.getState();
        setAll({ ...data, isLoading: !(hasLoaded.current || subColLoaded.current) });
        if (!hasLoaded.current) {
          hasLoaded.current = true;
        }
        maybeCheckRecurring();
      }
    }, onListenerError(`users/${user.uid}`));

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

      const { setAll } = useFinanceStore.getState();
      setAll({ transactions: deduped as never[], isLoading: false });
      maybeCheckRecurring();
    }, onListenerError(`users/${user.uid}/transactions`));

    const unsubRecs = onSnapshot(recsRef, (snapshot) => {
      if (snapshot.metadata.hasPendingWrites) return;

      // Only mark recurring data as loaded once a non-pending snapshot has been
      // processed — the flag gates checkRecurring, which needs the templates.
      if (!recurringSubColLoaded.current) {
        recurringSubColLoaded.current = true;
      }

      const allDocs = snapshot.docs.map((d) => ({ ...d.data(), id: d.id }));
      const sorted = allDocs.sort((a, b) => a.description.localeCompare(b.description));

      const { setAll } = useFinanceStore.getState();
      setAll({ recurringTransactions: sorted as never[], isLoading: false });
    }, onListenerError(`users/${user.uid}/recurringTransactions`));

    // One-shot health check: if the gates never opened (e.g. permission-denied on
    // a listener or in initializeUser), checkRecurring can never run — surface it.
    const diagnosticTimer = setTimeout(() => {
      if (hasCheckedRecurring.current) return;
      const state = useFinanceStore.getState();
      const gatesOpen =
        hasLoaded.current && subColLoaded.current && recurringSubColLoaded.current;
      const freshUser =
        gatesOpen &&
        Object.keys(syncErrors.current).length === 0 &&
        state.recurringTransactions.length === 0;
      if (freshUser) return;
      console.warn('[sync] recurring check still not run 10s after init', {
        gates: {
          hasLoaded: hasLoaded.current,
          txnsLoaded: subColLoaded.current,
          recurringLoaded: recurringSubColLoaded.current,
          isInitializing: isInitializing.current,
        },
        syncErrors: syncErrors.current,
        templatesLoaded: state.recurringTransactions.length,
        transactionsLoaded: state.transactions.length,
        lastRecurringCheck: state.lastRecurringCheck,
      });
    }, 10_000);

    return () => {
      clearTimeout(diagnosticTimer);
      unsubDoc();
      unsubTxns();
      unsubRecs();
    };
  }, [user]);

  useEffect(() => {
    if (!user) return;

    const checkFirstOfMonth = () => {
      const now = dayjs();
      if (now.date() !== 1) return;

      // Never run before recurring data has loaded: an empty run would stamp the
      // 5s throttle in checkRecurring and starve the data-loaded init call below.
      if (!recurringSubColLoaded.current) return;

      const state = useFinanceStore.getState();
      const timeSinceLastCheck = state.lastRecurringCheck
        ? Date.now() - new Date(state.lastRecurringCheck).getTime()
        : Infinity;

      if (timeSinceLastCheck >= 5000) {
        useFinanceStore.getState().checkRecurring();
      }
    };

    checkFirstOfMonth();

    const intervalId = setInterval(checkFirstOfMonth, 24 * 60 * 60 * 1000);
    return () => clearInterval(intervalId);
  }, [user]);
};