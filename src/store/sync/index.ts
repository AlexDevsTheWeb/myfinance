import dayjs from 'dayjs';
import { doc, onSnapshot, runTransaction, writeBatch, getDocs, type DocumentReference } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { userDocConverter, getTransactionsCollectionRef, getRecurringTransactionsCollectionRef, type UserDoc } from '../../lib/converters';
import type { ITransaction, IRecurringTransaction } from '../types';
import * as Defaults from '../defaults';

export function getDefaultUserConfig(): UserDoc {
  const firstDayOfMonth = dayjs().startOf('month').format('YYYY-MM-DD');

  return {
    initialBalance: Defaults.DEFAULT_INITIAL_BALANCE,
    accounts: Defaults.DEFAULT_ACCOUNTS,
    cards: [],
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
  // Use raw doc ref (no converter) to read the legacy transactions field
  // which still exists in Firestore even after Phase D removed it from UserDoc
  const rawDocRef = doc(db, 'users', userId);
  const remoteDoc = await runTransaction(db, async (transaction) => {
    return transaction.get(rawDocRef);
  });

  if (!remoteDoc.exists()) return { written: 0, skipped: 0 };

  const data = remoteDoc.data();
  const legacyTransactions = data?.transactions;
  const transactions: ITransaction[] = Array.isArray(legacyTransactions) ? legacyTransactions : [];
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

/**
 * Idempotent backfill: copies recurring transactions from the legacy array field
 * to the recurringTransactions sub-collection. Only writes docs that are missing
 * from the sub-collection, so it is safe to run on every app launch.
 */
export async function backfillRecurringToSubCollection(userId: string): Promise<{ written: number; skipped: number }> {
  // Use raw doc ref (no converter) to read the legacy recurringTransactions field
  // which still exists in Firestore even after the sub-collection migration
  const rawDocRef = doc(db, 'users', userId);
  const remoteDoc = await runTransaction(db, async (transaction) => {
    return transaction.get(rawDocRef);
  });

  if (!remoteDoc.exists()) return { written: 0, skipped: 0 };

  const data = remoteDoc.data();
  const legacyRecurring = data?.recurringTransactions;
  const recurring: IRecurringTransaction[] = Array.isArray(legacyRecurring) ? legacyRecurring : [];
  if (recurring.length === 0) return { written: 0, skipped: 0 };

  const collRef = getRecurringTransactionsCollectionRef(userId);
  const existing = await getDocs(collRef);
  const existingIds = new Set(existing.docs.map((d) => d.id));

  let written = 0;
  let skipped = 0;

  const batch = writeBatch(db);
  for (const r of recurring) {
    if (existingIds.has(r.id)) {
      skipped++;
      continue;
    }
    const recRef = doc(collRef, r.id);
    batch.set(recRef, {
      id: r.id,
      description: r.description,
      category: r.category,
      subcategory: r.subcategory,
      amount: r.amount,
      type: r.type,
      dayOfMonth: r.dayOfMonth,
      accountId: r.accountId,
      startDate: r.startDate,
      endDate: r.endDate ?? null,
      frequency: r.frequency ?? 'monthly',
      ...(r.frequency === 'yearly' && r.monthOfYear != null ? { monthOfYear: r.monthOfYear } : {}),
      ...(r.lastGeneratedUpTo ? { lastGeneratedUpTo: r.lastGeneratedUpTo } : {}),
      ...(r.cardId ? { cardId: r.cardId } : {}),
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