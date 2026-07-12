import dayjs from 'dayjs';
import { doc, onSnapshot, runTransaction, writeBatch, type DocumentReference } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { userDocConverter, getTransactionsCollectionRef, type UserDoc } from '../../lib/converters';
import type { ITransaction } from '../types';
import * as Defaults from '../defaults';

export function getDefaultUserConfig(): UserDoc {
  const firstDayOfMonth = dayjs().startOf('month').format('YYYY-MM-DD');

  return {
    initialBalance: Defaults.DEFAULT_INITIAL_BALANCE,
    accounts: Defaults.DEFAULT_ACCOUNTS,
    categories: Defaults.DEFAULT_CATEGORIES,
    incomeCategories: Defaults.DEFAULT_INCOME_CATEGORIES,
    recurringTransactions: [],
    carMileage: [],
    carInitialMileage: Defaults.DEFAULT_CAR_INITIAL_MILEAGE,
    tireSettings: Defaults.DEFAULT_TIRE_SETTINGS,
    tireChanges: [],
    enabledModules: Defaults.DEFAULT_ENABLED_MODULES,
    balanceStartDate: firstDayOfMonth,
    etfTransactions: [],
    portfolioSnapshots: [],
    brokerAccounts: Defaults.DEFAULT_BROKER_ACCOUNTS,
    assetHoldings: [],
    cashAdjustments: [],
    dividendEntries: [],
    budgetTargets: Defaults.DEFAULT_BUDGET_TARGETS,
    brokerConfig: Defaults.DEFAULT_BROKER_CONFIG,
  };
}

export function getUserDocRef(userId: string): DocumentReference<UserDoc> {
  return doc(db, 'users', userId).withConverter(userDocConverter);
}

export type { UserDoc };

export interface SyncConfig {
  onDataLoaded?: (data: UserDoc) => void;
  onNewUser?: (data: UserDoc) => void;
  runRecurringCheck?: boolean;
}

export const DEFAULT_SYNC_CONFIG: SyncConfig = {
  runRecurringCheck: true,
};

/**
 * One-time backfill: copies transactions from the legacy array field
 * to the transactions sub-collection. Idempotent — skips docs that
 * already exist in the sub-collection.
 */
export async function backfillTransactionsToSubCollection(userId: string): Promise<{ written: number; skipped: number }> {
  const docRef = getUserDocRef(userId);
  const remoteDoc = await runTransaction(db, async (transaction) => {
    return transaction.get(docRef);
  });

  if (!remoteDoc.exists()) return { written: 0, skipped: 0 };

  const data = remoteDoc.data() as unknown as Record<string, unknown>;
  const transactions = (data.transactions ?? []) as ITransaction[];
  if (transactions.length === 0) return { written: 0, skipped: 0 };

  const collRef = getTransactionsCollectionRef(userId);
  let written = 0;
  let skipped = 0;

  const batch = writeBatch(db);
  for (const txn of transactions) {
    const txnRef = doc(collRef, txn.id);
    batch.set(txnRef, {
      id: txn.id,
      date: txn.date,
      description: txn.description,
      category: txn.category,
      subcategory: txn.subcategory,
      amount: txn.amount,
      type: txn.type,
      accountId: txn.accountId,
      recurringLinkId: txn.recurringLinkId ?? null,
      consumption: txn.consumption ?? null,
      readingDateStart: txn.readingDateStart ?? null,
      readingDateEnd: txn.readingDateEnd ?? null,
    });
    written++;
  }

  if (written > 0) {
    await batch.commit();
  }

  return { written, skipped };
}

export async function initializeUserData(
  userId: string,
  onDataLoaded: (data: UserDoc) => void
): Promise<() => void> {
  const docRef = getUserDocRef(userId);

  await runTransaction(db, async (transaction) => {
    const remoteDoc = await transaction.get(docRef);
    if (remoteDoc.exists()) {
      const data = remoteDoc.data();
      onDataLoaded(data);
    } else {
      const defaultConfig = getDefaultUserConfig();
      transaction.set(docRef, defaultConfig);
      onDataLoaded(defaultConfig);
    }
  });

  const unsub = onSnapshot(docRef, (doc) => {
    if (doc.metadata.hasPendingWrites) {
      return;
    }
    if (doc.exists()) {
      const data = doc.data();
      onDataLoaded(data);
    }
  });

  return unsub;
}