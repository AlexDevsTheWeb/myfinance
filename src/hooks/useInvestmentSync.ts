import { useEffect, useRef } from 'react';
import { runTransaction, onSnapshot, updateDoc, doc } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { getDefaultUserConfig, getUserDocRef } from '../store/sync';
import { useAuthStore } from '../store/useAuthStore';
import { useInvestmentStore } from '../store/useInvestmentStore';
import { sanitizeEtfTransaction } from '../store/sanitization';
import type { BrokerAccount, IBrokerConfig, IETFTransaction } from '../store/types';
import * as Defaults from '../store/defaults';

/** iShares Core MSCI World (ISIN IE00B4L5Y983) single canonical ticker. */
const EUNL_TICKER = 'EUNL';
/** SWDA (Milan/London) is the same fund as EUNL (Xetra/Stuttgart). */
const SWDA_TICKER_PATTERN = /^SWDA(?:\.[A-Z]{2,3})?$/i;

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
      ticker: old.ticker || 'EUNL',
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

/**
 * Assign a broker to legacy ETF transactions that lack one.
 * Priority: existing brokerId > legacy PAC transactions (broker stored in accountId) > single-broker inference.
 * Idempotent — returns true when any transaction was newly linked.
 */
function migrateEtfTransactions(
  txs: IETFTransaction[],
  brokerAccounts: BrokerAccount[]
): { transactions: IETFTransaction[]; changed: boolean } {
  let changed = false;
  const transactions = txs.map(tx => {
    if (tx.brokerId) return tx;
    if (brokerAccounts.some(b => b.id === tx.accountId)) {
      changed = true;
      return { ...tx, brokerId: tx.accountId };
    }
    if (brokerAccounts.length === 1) {
      changed = true;
      return { ...tx, brokerId: brokerAccounts[0].id };
    }
    return tx;
  });
  return { transactions, changed };
}

/**
 * Consolidate the iShares Core MSCI World fund (ISIN IE00B4L5Y983) onto a
 * single ticker. SWDA (Milan/London) and EUNL (Xetra/Stuttgart) are the same
 * fund; legacy SWDA-family tickers are renamed to EUNL.
 * Idempotent — returns true when any transaction was renamed.
 */
function migrateTickerSymbols(txs: IETFTransaction[]): { transactions: IETFTransaction[]; changed: boolean } {
  let changed = false;
  const transactions = txs.map(tx => {
    if (tx.ticker && SWDA_TICKER_PATTERN.test(tx.ticker.trim())) {
      changed = true;
      return { ...tx, ticker: EUNL_TICKER };
    }
    return tx;
  });
  return { transactions, changed };
}

export const useInvestmentSync = () => {
  const { user } = useAuthStore();
  const { setAll } = useInvestmentStore();

  const isInitializing = useRef(false);
  const migrationAttempted = useRef(false);
  const hasLoaded = useRef(false);

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
            const snapshots = Array.isArray(convertedData.portfolioSnapshots) ? convertedData.portfolioSnapshots as never[] : [];
            const rawEtfTxs = Array.isArray(convertedData.etfTransactions) ? convertedData.etfTransactions as never[] as IETFTransaction[] : [];
            const linked = migrateEtfTransactions(rawEtfTxs, brokerAccounts);
            const { transactions: etfTransactions, changed } = migrateTickerSymbols(linked.transactions);
            if (linked.changed || changed) {
              const uid = useAuthStore.getState().user?.uid;
              if (uid) {
                updateDoc(doc(db, 'users', uid), { etfTransactions: etfTransactions.map(sanitizeEtfTransaction) }).catch(() => {});
              }
            }
            setAll({
              etfTransactions,
              portfolioSnapshots: snapshots,
              brokerConfig: convertedData.brokerConfig as never ?? Defaults.DEFAULT_BROKER_CONFIG,
              brokerAccounts,
              cashAdjustments: Array.isArray(convertedData.cashAdjustments) ? convertedData.cashAdjustments as never[] : [],
              dividendEntries: Array.isArray(convertedData.dividendEntries) ? convertedData.dividendEntries as never[] : [],
              pacState: convertedData.pacState as never ?? { lastGenerationDate: null, pendingTransaction: null, perBrokerLastGeneration: {} },
              isLoading: false,
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
              pacState: { lastGenerationDate: null, pendingTransaction: null, perBrokerLastGeneration: {} },
              isLoading: false,
            });
          }
          hasLoaded.current = true;
        });
      } catch (error) {
        console.error('Error in useInvestmentSync initializeUser:', error);
        useInvestmentStore.getState().setAll({ isLoading: false });
      } finally {
        isInitializing.current = false;
      }
    };

    initializeUser().then(() => {
      useInvestmentStore.getState().loadHistoricalSnapshots();
    });

    const unsub = onSnapshot(docRef, (snap) => {
      if (snap.metadata.hasPendingWrites) {
        return;
      }
      if (snap.exists() && !isInitializing.current && !migrationAttempted.current) {
        const storeState = useInvestmentStore.getState();
        if (storeState.isSaving) {
          return;
        }
        const rawData = snap.data() as unknown as Record<string, unknown>;
        const { setAll } = useInvestmentStore.getState();
        const brokerAccounts = migrateBrokerConfig(rawData);
        migrationAttempted.current = true;
        const snapshots = Array.isArray(rawData.portfolioSnapshots) ? rawData.portfolioSnapshots as never[] : [];
        const rawEtfTxs = Array.isArray(rawData.etfTransactions) ? rawData.etfTransactions as never[] as IETFTransaction[] : [];
        const linked = migrateEtfTransactions(rawEtfTxs, brokerAccounts);
        const { transactions: etfTransactions, changed } = migrateTickerSymbols(linked.transactions);
        if (linked.changed || changed) {
          updateDoc(doc(db, 'users', user.uid), { etfTransactions: etfTransactions.map(sanitizeEtfTransaction) }).catch(() => {});
        }
        setAll({
          etfTransactions,
          portfolioSnapshots: snapshots,
          brokerConfig: rawData.brokerConfig as never ?? Defaults.DEFAULT_BROKER_CONFIG,
          brokerAccounts,
          cashAdjustments: Array.isArray(rawData.cashAdjustments) ? rawData.cashAdjustments as never[] : [],
          dividendEntries: Array.isArray(rawData.dividendEntries) ? rawData.dividendEntries as never[] : [],
          pacState: rawData.pacState as never ?? { lastGenerationDate: null, pendingTransaction: null, perBrokerLastGeneration: {} },
          isLoading: !hasLoaded.current,
        });
        hasLoaded.current = true;
      }
    });

    return () => unsub();
  }, [user, setAll]);
};
