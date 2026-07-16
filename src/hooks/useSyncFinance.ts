import { useEffect, useRef } from 'react';
import { runTransaction, onSnapshot } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { getDefaultUserConfig, getUserDocRef } from '../store/sync';
import { getTransactionsCollectionRef } from '../lib/converters';
import { useAuthStore } from '../store/useAuthStore';
import { useFinanceStore } from '../store/useFinanceStore';

export const useSyncFinance = () => {
  const { user } = useAuthStore();
  const { setAll } = useFinanceStore();
  (window as never as Record<string, unknown>).__finance = useFinanceStore;

  const isInitializing = useRef(false);
  const hasLoaded = useRef(false);
  const hasCheckedRecurring = useRef(false);
  const subColLoaded = useRef(false);

  useEffect(() => {
    if (!user) {
      isInitializing.current = false;
      hasCheckedRecurring.current = false;
      subColLoaded.current = false;
      return;
    }

    if (isInitializing.current) return;

    const docRef = getUserDocRef(user.uid);
    const txnsRef = getTransactionsCollectionRef(user.uid);

    const initializeUser = async () => {
      console.log('[TRACE] initializeUser start');
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
          console.log('[TRACE] runTransaction done, hasLoaded=true');
        });
      } catch (error) {
        console.error('[TRACE] Error in initializeUser transaction:', error);
        useFinanceStore.getState().setAll({ isLoading: false });
      } finally {
        console.log('[TRACE] finally block, hasLoaded=', hasLoaded.current, 'subColLoaded=', subColLoaded.current, 'hasCheckedRecurring=', hasCheckedRecurring.current);
        isInitializing.current = false;
        if (!hasCheckedRecurring.current && hasLoaded.current && subColLoaded.current) {
          console.log('[TRACE] finally: triggering checkRecurring');
          hasCheckedRecurring.current = true;
          useFinanceStore.getState().checkRecurring();
        } else {
          console.log('[TRACE] finally: NOT triggering checkRecurring');
        }
      }
    };

    initializeUser();

    const unsubDoc = onSnapshot(docRef, (doc) => {
      console.log('[TRACE] doc onSnapshot fired, isInit=', isInitializing.current, 'hasPendingWrites=', doc.metadata.hasPendingWrites);
      if (doc.metadata.hasPendingWrites) return;
      if (doc.exists()) {
        const storeState = useFinanceStore.getState();
        if (storeState.isSaving || storeState.hasLocalChanges) { console.log('[TRACE] doc: skipping (isSaving/hasLocalChanges)'); return; }
        const data = doc.data();
        const { setAll, checkRecurring } = useFinanceStore.getState();
        setAll({ ...data, isLoading: !(hasLoaded.current || subColLoaded.current) });
        if (!hasLoaded.current) {
          hasLoaded.current = true;
          console.log('[TRACE] doc: set hasLoaded=true');
        }
        console.log('[TRACE] doc: hasCheckedRecurring=', hasCheckedRecurring.current, 'subColLoaded=', subColLoaded.current);
        if (!hasCheckedRecurring.current && subColLoaded.current) {
          console.log('[TRACE] doc: triggering checkRecurring');
          hasCheckedRecurring.current = true;
          checkRecurring();
        }
      }
    });

    const unsubTxns = onSnapshot(txnsRef, (snapshot) => {
      console.log('[TRACE] subCol onSnapshot fired, count=', snapshot.docs.length, 'hasPendingWrites=', snapshot.metadata.hasPendingWrites);
      if (!subColLoaded.current) {
        subColLoaded.current = true;
        console.log('[TRACE] subCol: set subColLoaded=true');
      }
      const transactions = snapshot.docs.map(d => d.data());
      const sorted = transactions.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

      // TEMP: dedup BEFORE storing to prevent onSnapshot from adding dupes
      const seen = new Set<string>();
      const deduped = sorted.filter(t => {
        const key = t.recurringLinkId ? `${t.recurringLinkId}|${t.date}` : t.id;
        if (!seen.has(key)) { seen.add(key); return true; }
        console.log('[TRACE] subCol: filtered duplicate:', t.date, t.description);
        return false;
      });
      console.log('[TRACE] subCol: sorted=', sorted.length, 'deduped=', deduped.length, 'filtered=', sorted.length - deduped.length);

      const { setAll, checkRecurring } = useFinanceStore.getState();
      setAll({ transactions: deduped as never[], isLoading: false });
      if (!hasCheckedRecurring.current && hasLoaded.current) {
        console.log('[TRACE] subCol: triggering checkRecurring');
        hasCheckedRecurring.current = true;
        checkRecurring();
      }
    });

    return () => {
      unsubDoc();
      unsubTxns();
    };
  }, [user, setAll]);
};
