import { useEffect, useRef } from 'react';
import { runTransaction, onSnapshot } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { getDefaultUserConfig, getUserDocRef } from '../store/sync';
import { useAuthStore } from '../store/useAuthStore';
import { useInvestmentStore } from '../store/useInvestmentStore';
import * as Defaults from '../store/defaults';

export const useInvestmentSync = () => {
  const { user } = useAuthStore();
  const { setAll } = useInvestmentStore();

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
            setAll({
              etfTransactions: data.etfTransactions ?? [],
              portfolioSnapshots: data.portfolioSnapshots ?? [],
              brokerConfig: data.brokerConfig ?? Defaults.DEFAULT_BROKER_CONFIG,
            });
          } else {
            const defaultConfig = getDefaultUserConfig();
            transaction.set(docRef, defaultConfig);
            setAll({
              etfTransactions: defaultConfig.etfTransactions ?? [],
              portfolioSnapshots: defaultConfig.portfolioSnapshots ?? [],
              brokerConfig: defaultConfig.brokerConfig ?? Defaults.DEFAULT_BROKER_CONFIG,
            });
          }
        });
      } catch (error) {
        console.error('Error in useInvestmentSync initializeUser:', error);
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
        const storeState = useInvestmentStore.getState();
        if (storeState.isSaving) {
          return;
        }
        const data = doc.data();
        const { setAll } = useInvestmentStore.getState();
        setAll({
          etfTransactions: data.etfTransactions ?? [],
          portfolioSnapshots: data.portfolioSnapshots ?? [],
          brokerConfig: data.brokerConfig ?? Defaults.DEFAULT_BROKER_CONFIG,
        });
      }
    });

    return () => unsub();
  }, [user, setAll]);
};
