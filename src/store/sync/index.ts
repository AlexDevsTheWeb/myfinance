import dayjs from 'dayjs';
import { doc, onSnapshot, runTransaction, type DocumentReference } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { userDocConverter, type UserDoc } from '../../lib/converters';
import * as Defaults from '../defaults';

export function getDefaultUserConfig(): UserDoc {
  const firstDayOfMonth = dayjs().startOf('month').format('YYYY-MM-DD');

  return {
    transactions: [],
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