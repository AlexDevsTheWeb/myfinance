import { useEffect, useRef } from 'react';
import { runTransaction, onSnapshot, updateDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { getDefaultUserConfig, getUserDocRef } from '../store/sync';
import { useAuthStore } from '../store/useAuthStore';
import { useInvestmentStore } from '../store/useInvestmentStore';
import type { BrokerAccount, IBrokerConfig } from '../store/types';
import * as Defaults from '../store/defaults';

/**
 * Detect old IBrokerConfig and convert to BrokerAccount[].
 * Idempotent — returns existing brokerAccounts if already migrated.
 */
function migrateBrokerConfig(data: Record<string, unknown>): BrokerAccount[] {
  if (Array.isArray(data.brokerAccounts) && data.brokerAccounts.length > 0) {
    return data.brokerAccounts as BrokerAccount[]; // Already migrated
  }
  if (data.brokerConfig && !Array.isArray(data.brokerAccounts)) {
    const old = data.brokerConfig as unknown as IBrokerConfig;
    const migrated: BrokerAccount[] = [{
      id: 'broker-1',
      name: old.brokerName || 'Trade Republic',
      ticker: old.ticker || 'SWDA.MI',
      baseLumpSum: old.lumpSumAmount || 0,
      monthlyPacAmount: old.monthlyPacAmount || 0,
      interestRate: old.interestRate || 0,
    }];
    // Fire-and-forget migration write
    const uid = useAuthStore.getState().user?.uid;
    if (uid) {
      const docRef = getUserDocRef(uid);
      updateDoc(docRef, { brokerAccounts: migrated }).catch(() => {});
    }
    return migrated;
  }
  return Defaults.DEFAULT_BROKER_ACCOUNTS;
}

export const useInvestmentSync = () => {
  const { user } = useAuthStore();
  const { setAll } = useInvestmentStore();

  const isInitializing = useRef(false);
  const migrationAttempted = useRef(false);

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
            const data = remoteDoc.data() as unknown as Record<string, unknown>;
            const brokerAccounts = migrateBrokerConfig(data);
            const convertedData = data as Record<string, unknown>;
            setAll({
              etfTransactions: Array.isArray(convertedData.etfTransactions) ? convertedData.etfTransactions as never[] : [],
              portfolioSnapshots: Array.isArray(convertedData.portfolioSnapshots) ? convertedData.portfolioSnapshots as never[] : [],
              brokerConfig: convertedData.brokerConfig as never ?? Defaults.DEFAULT_BROKER_CONFIG,
              brokerAccounts,
              cashAdjustments: Array.isArray(convertedData.cashAdjustments) ? convertedData.cashAdjustments as never[] : [],
              dividendEntries: Array.isArray(convertedData.dividendEntries) ? convertedData.dividendEntries as never[] : [],
            });
          } else {
            const defaultConfig = getDefaultUserConfig();
            transaction.set(docRef, defaultConfig);
            setAll({
              etfTransactions: defaultConfig.etfTransactions ?? [],
              portfolioSnapshots: defaultConfig.portfolioSnapshots ?? [],
              brokerConfig: defaultConfig.brokerConfig ?? Defaults.DEFAULT_BROKER_CONFIG,
              brokerAccounts: defaultConfig.brokerAccounts ?? Defaults.DEFAULT_BROKER_ACCOUNTS,
              cashAdjustments: defaultConfig.cashAdjustments ?? [],
              dividendEntries: defaultConfig.dividendEntries ?? [],
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
      if (doc.exists() && !isInitializing.current && !migrationAttempted.current) {
        const storeState = useInvestmentStore.getState();
        if (storeState.isSaving) {
          return;
        }
        const rawData = doc.data() as unknown as Record<string, unknown>;
        const { setAll } = useInvestmentStore.getState();
        const brokerAccounts = migrateBrokerConfig(rawData);
        migrationAttempted.current = true;
        setAll({
          etfTransactions: Array.isArray(rawData.etfTransactions) ? rawData.etfTransactions as never[] : [],
          portfolioSnapshots: Array.isArray(rawData.portfolioSnapshots) ? rawData.portfolioSnapshots as never[] : [],
          brokerConfig: rawData.brokerConfig as never ?? Defaults.DEFAULT_BROKER_CONFIG,
          brokerAccounts,
          cashAdjustments: Array.isArray(rawData.cashAdjustments) ? rawData.cashAdjustments as never[] : [],
          dividendEntries: Array.isArray(rawData.dividendEntries) ? rawData.dividendEntries as never[] : [],
        });
      }
    });

    return () => unsub();
  }, [user, setAll]);
};
